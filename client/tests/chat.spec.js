import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect as browserExpect } from '@playwright/test';
import { afterAll, beforeAll, test } from 'vitest';
import { createServer } from 'vite';
const contacts = [
  { contactId: '102', username: 'ben', lastMessageText: 'Ben preview', lastMessageTimestamp: '2025-05-03T08:30:00' },
  { contactId: '103', username: 'cy', lastMessageText: 'Cy preview', lastMessageTimestamp: '2025-05-03T08:29:00' },
];
const message = (id, text, senderId = '101') => ({ id, text, senderId, timestamp: '2025-05-03T08:30:00' });

let browser;
let server;
let origin;
let cacheDir;

beforeAll(async () => {
  cacheDir = await mkdtemp(join(tmpdir(), 'kb-chat-'));
  server = await createServer({
    configLoader: 'runner',
    envFile: false,
    cacheDir,
    server: { host: '127.0.0.1', port: 0 },
  });
  await server.listen();
  origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const executablePath = process.env.CHROMIUM_PATH ?? (!process.env.CI && existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath });
}, 30_000);

afterAll(async () => {
  try { await browser?.close(); } finally {
    try { await server?.close(); } finally {
      if (cacheDir) await rm(cacheDir, { recursive: true, force: true });
    }
  }
});

async function openChat(t, handlers, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport });
  t.onTestFinished(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(3000);
  await page.addInitScript(() => {
    sessionStorage.setItem('token', 'synthetic-chat-fixture');
    sessionStorage.setItem('role', 'student');
    sessionStorage.setItem('userId', '101');
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/auth/session') {
      await route.fulfill({ json: { userId: '101', role: 'STUDENT' } });
    } else if (url.pathname.startsWith('/api/chat/')) {
      const result = await (handlers[url.pathname]?.(route.request(), url) ?? { status: 404, json: {} });
      await route.fulfill(result);
    } else if (url.origin === origin) {
      await route.continue();
    } else {
      await route.abort();
    }
  });
  await page.goto(`${origin}/chat`);
  // The first navigation also compiles Vite's cold module graph.
  await page.getByPlaceholder('Buscar conversaciones').waitFor({ timeout: 15_000 });
  return page;
}

function peer(page, name) {
  return page.getByText(name, { exact: true }).first();
}

function composer(page) {
  return page.getByPlaceholder('Escribe un mensaje...');
}

function thread(page) {
  return page.getByRole('heading', { level: 2 }).locator('xpath=../..');
}

test('an empty chat list can discover and message a student; clearing search shows the new conversation', async t => {
  let sent = false;
  const page = await openChat(t, {
    '/api/chat/contacts': () => ({ json: sent ? contacts.slice(0, 1) : [] }),
    '/api/chat/contacts/search': (request, url) => {
      assert.equal(url.searchParams.get('query'), 'ben@example.invalid');
      assert.equal(request.headers().authorization, 'Bearer synthetic-chat-fixture');
      return { json: [{ contactId: '102', username: 'ben' }] };
    },
    '/api/chat/102/messages': () => ({ json: sent ? [message(1, 'Primer mensaje')] : [] }),
    '/api/chat/send': request => {
      assert.deepEqual(request.postDataJSON(), { receiverId: '102', text: 'Primer mensaje' });
      sent = true;
      return { json: message(1, 'Primer mensaje') };
    },
  });
  const search = page.getByPlaceholder('Buscar conversaciones');
  await search.fill('ben@example.invalid');
  await peer(page, 'ben').click();
  await page.getByText('No hay mensajes aún. ¡Comienza la conversación!', { exact: true }).waitFor();
  await composer(page).fill('Primer mensaje');
  await composer(page).press('Enter');
  await thread(page).getByText('Primer mensaje', { exact: true }).waitFor();
  await search.clear();
  await peer(page, 'ben').waitFor();
});

test('distinct IDs with identical text both render before and after reload', async t => {
  let persisted = [];
  const text = 'Dos mensajes iguales';
  const page = await openChat(t, {
    '/api/chat/contacts': () => ({ json: contacts }),
    '/api/chat/102/messages': () => ({ json: [...persisted, ...persisted.slice(0, 1)] }),
    '/api/chat/send': request => {
      const value = message(persisted.length + 1, request.postDataJSON().text);
      persisted = [...persisted, value];
      return { json: value };
    },
  });
  await page.getByText('No hay mensajes aún. ¡Comienza la conversación!', { exact: true }).waitFor();
  assert.ok(await page.getByPlaceholder('Buscar conversaciones').isVisible());
  assert.equal((await thread(page).boundingBox()).x, 352);
  assert.equal(await page.getByRole('button', { name: 'Volver a conversaciones' }).isVisible(), false);
  for (const count of [1, 2]) {
    await composer(page).fill(text);
    await composer(page).press('Enter');
    await thread(page).getByText(text, { exact: true }).nth(count - 1).waitFor();
  }
  await page.reload();
  const bubbles = thread(page).getByText(text, { exact: true });
  await bubbles.nth(1).waitFor();
  assert.equal(await bubbles.count(), 2);
  assert.deepEqual(persisted.map(value => value.id), [1, 2]);
});

test('live events use the bearer header and reconnect without duplicating history or events', async t => {
  const first = message(2, 'En vivo', '102');
  const second = message(3, 'Después de reconectar', '102');
  const headers = [];
  let calls = 0;
  const event = value => `event: message\r\ndata: ${JSON.stringify(value)}\r\n\r\n`;
  const page = await openChat(t, {
    '/api/chat/contacts': () => ({ json: contacts }),
    '/api/chat/102/messages': () => ({ json: [message(1, 'Historial', '102')] }),
    '/api/chat/102/events': (request, url) => {
      headers.push([request.headers().authorization, url.search]);
      calls += 1;
      return {
        contentType: 'text/event-stream',
        body: `event: ready\r\ndata: {}\r\n\r\n${event(first)}${calls > 1 ? event(second) : ''}`,
      };
    },
  });
  const log = page.getByRole('log', { name: 'Mensajes' });
  await browserExpect(log.getByText('Historial', { exact: true })).toHaveCount(1);
  await browserExpect(log.getByText(second.text, { exact: true })).toHaveCount(1);
  await browserExpect(log.getByText(first.text, { exact: true })).toHaveCount(1);
  assert.ok(headers.length >= 2);
  assert.ok(headers.every(([authorization, query]) => authorization === 'Bearer synthetic-chat-fixture' && query === ''));
});

test('a throttled stream refreshes HTTP history and waits for Retry-After before reconnecting', async t => {
  const requests = [];
  let historyReads = 0;
  let syncedBeforeRetry = false;
  const fallback = message(1, 'Recuperado por HTTP', '102');
  const live = message(2, 'Conexión recuperada', '102');
  const page = await openChat(t, {
    '/api/chat/contacts': () => ({ json: contacts }),
    '/api/chat/102/messages': () => ({ json: ++historyReads === 1 ? [] : [fallback] }),
    '/api/chat/102/events': () => {
      const now = Date.now();
      requests.push(now);
      if (now - requests[0] < 1900) {
        return { status: 429, headers: { 'Retry-After': '2' }, body: 'Too many active chat streams.' };
      }
      syncedBeforeRetry = historyReads >= 2;
      return {
        contentType: 'text/event-stream',
        body: `event:ready\ndata:{}\n\nevent:message\ndata:${JSON.stringify(live)}\n\n`,
      };
    },
  });
  const log = page.getByRole('log', { name: 'Mensajes' });
  await browserExpect(log.getByText(live.text, { exact: true })).toHaveCount(1);
  // StrictMode can start and abort a request during the first mount before the active effect runs.
  assert.ok(requests.length >= 2);
  assert.ok(!requests.some(at => at - requests[0] >= 250 && at - requests[0] < 1900),
    'the next stream must not ignore Retry-After');
  assert.ok(syncedBeforeRetry, 'the HTTP history must stay usable during the retry delay');
  await browserExpect(log.getByText(fallback.text, { exact: true })).toHaveCount(1);
});

test('a late history response never replaces the currently selected thread', { timeout: 15_000 }, async t => {
  const oldRequest = Promise.withResolvers();
  const deliverOld = Promise.withResolvers();
  t.onTestFinished(() => deliverOld.resolve());
  const page = await openChat(t, {
    '/api/chat/contacts': () => ({ json: contacts }),
    '/api/chat/102/messages': async () => {
      oldRequest.resolve();
      await deliverOld.promise;
      return { json: [message(1, 'Historial anterior', '102')] };
    },
    '/api/chat/103/messages': () => ({ json: [message(2, 'Historial actual', '103')] }),
  });
  await oldRequest.promise;
  await peer(page, 'cy').click();
  await page.getByText('Historial actual', { exact: true }).waitFor();
  const finished = page.waitForResponse(response => response.url().endsWith('/api/chat/102/messages'));
  deliverOld.resolve();
  await (await finished).finished();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.getByText('Historial anterior', { exact: true }).count(), 0);
  assert.ok(await page.getByText('Historial actual', { exact: true }).isVisible());
});

test('a failed send preserves the draft and transcript without logging message text', async t => {
  const text = 'Mensaje privado de prueba';
  const page = await openChat(t, {
    '/api/chat/contacts': () => ({ json: contacts }),
    '/api/chat/102/messages': () => ({ json: [message(1, 'Historial visible')] }),
    '/api/chat/send': () => ({ status: 400, json: { message: 'Error sending message' } }),
  });
  const logs = [];
  page.on('console', entry => logs.push(Promise.all(entry.args().map(arg => arg.jsonValue().catch(() => null)))));
  await page.getByText('Historial visible', { exact: true }).waitFor();
  await composer(page).fill(text);
  await composer(page).press('Enter');
  await browserExpect(page.getByRole('alert')).toHaveText('No se pudo enviar el mensaje.');
  assert.equal(await composer(page).inputValue(), text);
  assert.ok(await page.getByText('Historial visible', { exact: true }).isVisible());
  assert.ok(!JSON.stringify(await Promise.all(logs)).includes(text));
});

test('at 390px list, thread, composer and back control fit without overlap', async t => {
  const longName = 'estudiante-con-un-nombre-que-no-debe-desbordar-el-viewport-móvil';
  const page = await openChat(t, {
    '/api/chat/contacts': () => ({ json: [{ ...contacts[0], username: longName }] }),
    '/api/chat/102/messages': () => ({ json: [message(1, 'palabra'.repeat(60))] }),
  }, { width: 390, height: 844 });
  const search = page.getByPlaceholder('Buscar conversaciones');
  await search.waitFor();
  assert.equal(await composer(page).isVisible(), false);
  await peer(page, longName).click();
  const back = page.getByRole('button', { name: 'Volver a conversaciones' });
  const heading = page.getByRole('heading', { name: longName, level: 2 });
  await back.waitFor();
  const bubble = page.getByText('palabra'.repeat(60), { exact: true });
  await bubble.waitFor();
  assert.ok(await bubble.evaluate(node => node.scrollWidth <= node.clientWidth), 'long words must wrap within the bubble');
  const [backBox, headingBox, inputBox] = await Promise.all([back.boundingBox(), heading.boundingBox(), composer(page).boundingBox()]);
  assert.ok(backBox.x + backBox.width <= headingBox.x, 'back control must not overlap the thread title');
  assert.ok(inputBox.y + inputBox.height <= 844 && inputBox.height >= 36, 'composer must stay usable inside the viewport');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
  assert.equal(await search.isVisible(), false);
  await back.click();
  await search.waitFor();
  assert.equal(await composer(page).isVisible(), false);
});
