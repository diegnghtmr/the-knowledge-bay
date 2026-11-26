import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import { afterAll, beforeAll, test } from 'vitest';
import { build, preview } from 'vite';

const topic = 'Sistemas de prueba';
const groupName = `Grupo de ${topic}`;
let app;
let browser;
let scratch;
let origin;

beforeAll(async () => {
  scratch = await mkdtemp(join(tmpdir(), 'kb-feature-flows-'));
  const config = {
    configLoader: 'runner',
    envFile: false,
    cacheDir: join(scratch, 'vite'),
    build: { outDir: join(scratch, 'dist'), emptyOutDir: false },
    preview: { host: '127.0.0.1', port: 0, strictPort: true },
    logLevel: 'warn',
  };
  await build(config);
  app = await preview(config);
  origin = `http://127.0.0.1:${app.httpServer.address().port}`;
  const executablePath = process.env.CHROMIUM_PATH ?? (!process.env.CI && existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath });
}, 30_000);

afterAll(async () => {
  try {
    await browser?.close();
  } finally {
    try {
      if (app) await new Promise((resolve) => app.httpServer.close(resolve));
    } finally {
      if (scratch) await rm(scratch, { recursive: true, force: true });
    }
  }
});

async function visit(t, path, { role = 'student', width = 1440, api = {} } = {}) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  t.onTestFinished(() => context.close());
  await context.addInitScript((role) => {
    sessionStorage.setItem('role', role);
    sessionStorage.setItem('userId', 'alfa');
    sessionStorage.setItem('token', 'fixture-session');
  }, role);
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/api/')) {
      if (url.origin === origin) return route.continue();
      return route.abort();
    }
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type',
    };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (url.pathname === '/api/auth/session') {
      return route.fulfill({ json: { userId: 'alfa', role: role.toUpperCase() }, headers });
    }
    const fixture = api[`${request.method()} ${url.pathname}`];
    const reply = typeof fixture === 'function' ? await fixture(request) : { json: fixture ?? [] };
    return route.fulfill({ ...reply, headers });
  });
  await page.goto(`${origin}${path}`);
  return page;
}

function gate() {
  let release;
  const done = new Promise((resolve) => { release = resolve; });
  return { done, release };
}

async function fillPublication(page) {
  await page.locator('#title').fill('Una lección de álgebra');
  await page.locator('#body').fill('Lectura con ñ y signos ¿?');
  await page.getByPlaceholder('Buscar tema principal').fill(topic);
  await page.getByText(topic, { exact: true }).click();
  return page.locator('form button[type=submit]');
}

test('publication is awaited and rapid submissions send exactly one request', async (t) => {
  const pending = gate();
  t.onTestFinished(pending.release);
  const submissions = [];
  const page = await visit(t, '/publish-content', { api: {
    'GET /api/interests': [{ id: 'topic', name: topic }],
    'POST /api/content': async (request) => {
      submissions.push(request.postData());
      await pending.done;
      return { json: { success: true } };
    },
  } });
  const alerts = [];
  page.on('dialog', (dialog) => { alerts.push(dialog.message()); return dialog.accept(); });
  const submit = await fillPublication(page);
  const started = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/content');
  await submit.evaluate((button) => { button.click(); button.click(); });
  await started;
  const disabledWhilePending = await submit.isDisabled();
  await page.locator('form').evaluate((form) => form.requestSubmit());
  assert.equal(new URL(page.url()).pathname, '/publish-content');
  assert.deepEqual(alerts, []);
  pending.release();
  await page.waitForURL(`${origin}/`);
  assert.equal(disabledWhilePending, true);
  assert.equal(submissions.length, 1);
  assert.match(submissions[0], /Una lección de álgebra/);
  assert.deepEqual(alerts, ['Contenido publicado exitosamente']);
});

test('failed publication keeps the draft and allows an intentional retry', async (t) => {
  let attempts = 0;
  const page = await visit(t, '/publish-content', { api: {
    'GET /api/interests': [{ id: 'topic', name: topic }],
    'POST /api/content': () => (++attempts === 1
      ? { status: 400, json: { success: false, message: 'No se pudo guardar el contenido.' } }
      : { json: { success: true } }),
  } });
  const submit = await fillPublication(page);
  const firstError = page.waitForEvent('dialog');
  await page.locator('form').evaluate((form) => form.requestSubmit());
  const dialog = await firstError;
  assert.equal(dialog.message(), 'Error al publicar el contenido: No se pudo guardar el contenido.');
  await dialog.accept();
  assert.equal(new URL(page.url()).pathname, '/publish-content');
  assert.equal(await page.locator('#title').inputValue(), 'Una lección de álgebra');
  page.once('dialog', (success) => success.accept());
  await submit.click();
  await page.waitForURL(`${origin}/`);
  assert.equal(attempts, 2);
});

test('moderator publication route explains the restriction without submitting', async (t) => {
  let posts = 0;
  const page = await visit(t, '/publish-content', { role: 'moderator', api: {
    'POST /api/content': () => { posts += 1; return { status: 403 }; },
  } });
  await page.getByText('Solo los estudiantes pueden publicar contenido.', { exact: true }).waitFor();
  assert.equal(await page.locator('form button[type=submit]').count(), 0);
  assert.equal(new URL(page.url()).pathname, '/publish-content');
  assert.equal(posts, 0);
});

test('user search handles null fields and returns to matching results', async (t) => {
  const page = await visit(t, '/users-dashboard', { role: 'moderator', api: {
    'GET /api/admin/users': [{ id: 'alfa', username: 'alfa', firstName: null, lastName: 'Muñoz', email: null, interests: [] }],
  } });
  const query = page.getByPlaceholder('Buscar por nombre, usuario o correo...');
  await page.getByText('@alfa').waitFor();
  await query.fill(`¿${'x'.repeat(1024)}?`);
  await page.getByText('No se encontraron usuarios').waitFor();
  await query.fill('MUÑOZ');
  await page.getByText('@alfa').waitFor();
  await query.clear();
  await page.getByText('Mostrando 1 de 1 usuarios').waitFor();
});

test('a malformed row leaves the surrounding dashboard usable', async (t) => {
  let malformed = true;
  const page = await visit(t, '/users-dashboard', { role: 'moderator', api: {
    'GET /api/admin/users': () => ({ json: [{ id: 'alfa', username: 'alfa', interests: malformed ? [{ unexpected: true }] : [] }] }),
  } });
  await page.getByRole('heading', { name: 'Panel de Control' }).waitFor();
  await page.getByRole('alert').getByText('No se pudo mostrar la tabla.').waitFor();
  malformed = false;
  await page.getByRole('button', { name: 'Intentar de nuevo' }).click();
  await page.getByText('@alfa').waitFor();
  assert.equal(await page.getByRole('alert').count(), 0);
});

test('content search ignores null text fields without losing the dashboard', async (t) => {
  const page = await visit(t, '/content-dashboard', { role: 'moderator', api: {
    'GET /api/admin/content': [{ contentId: 7, title: 'Álgebra', information: null, authorUsername: null }],
  } });
  const query = page.getByPlaceholder('Buscar por título, información o autor...');
  await page.getByText('Álgebra', { exact: true }).waitFor();
  await query.fill('¿distinto?');
  await page.getByText('No se encontraron contenidos').waitFor();
  await page.getByRole('heading', { name: 'Biblioteca de Contenidos' }).waitFor();
  await query.fill('ÁLGEBRA');
  await page.getByText('Álgebra', { exact: true }).waitFor();
});

test('content editor sends editable fields to admin PUT and handles rejection', async (t) => {
  const requests = [];
  const page = await visit(t, '/content-dashboard', { role: 'moderator', api: {
    'GET /api/admin/content': [{ contentId: 7, title: 'Antes', information: 'Texto', authorUsername: 'alfa', likeCount: 2 }],
    'PUT /api/admin/content/7': (request) => {
      requests.push({ body: request.postDataJSON(), authorization: request.headers().authorization });
      return requests.length === 1
        ? { status: 400, json: { success: false, message: 'No se pudo actualizar.' } }
        : { json: { success: true } };
    },
  } });
  await page.getByRole('button', { name: 'Editar' }).click();
  const title = page.locator('table input').first();
  assert.equal(await title.inputValue(), 'Antes');
  await title.fill('Después');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.getByRole('alert').getByText('No se pudo actualizar.').waitFor();
  assert.equal(await title.inputValue(), 'Después');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.getByText('Después', { exact: true }).waitFor();
  await page.getByText('@alfa').waitFor();
  assert.deepEqual(requests, Array(2).fill({
    body: { title: 'Después', information: 'Texto' }, authorization: 'Bearer fixture-session',
  }));
});

test('content deletion still uses the admin endpoint and removes the confirmed row', async (t) => {
  const requests = [];
  const page = await visit(t, '/content-dashboard', { role: 'moderator', api: {
    'GET /api/admin/content': [{ contentId: 7, title: 'Para borrar', authorUsername: 'alfa' }],
    'DELETE /api/admin/content/7': (request) => {
      requests.push(request.headers().authorization);
      return { json: { success: true } };
    },
  } });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar' }).click();
  await page.getByText('No se encontraron contenidos').waitFor();
  assert.deepEqual(requests, ['Bearer fixture-session']);
});

test('peer follow sends POST and DELETE, and a rejected mutation preserves state', async (t) => {
  let following = false;
  const mutations = [];
  const page = await visit(t, '/user/beta', { api: {
    'GET /api/profile/beta': () => ({ json: {
      id: 'beta', username: 'beta', firstName: 'Persona', lastName: 'Beta',
      followers: following ? 1 : 0, currentUserFollowing: following,
    } }),
    'POST /api/users/beta/follow': () => {
      mutations.push('POST');
      if (mutations.length === 1) return { status: 403, json: { success: false, message: 'No se pudo seguir al usuario.' } };
      following = true;
      return { json: { success: true } };
    },
    'DELETE /api/users/beta/follow': () => {
      mutations.push('DELETE');
      following = false;
      return { json: { success: true } };
    },
  } });
  const follow = page.getByRole('button', { name: 'Seguir', exact: true });
  const unfollow = page.getByRole('button', { name: 'Dejar de Seguir', exact: true });
  const followers = page.getByTitle('Ver seguidores');
  await follow.click();
  await page.getByRole('alert').getByText('No se pudo seguir al usuario.').waitFor();
  assert.match(await followers.innerText(), /^0\s/);
  await follow.click();
  await unfollow.waitFor();
  assert.match(await followers.innerText(), /^1\s/);
  await unfollow.click();
  await follow.waitFor();
  assert.match(await followers.innerText(), /^0\s/);
  assert.deepEqual(mutations, ['POST', 'POST', 'DELETE']);
});

test('group reads and writes use the same bearer session and canonical post', async (t) => {
  const post = {
    id: 'content-7', type: 'markdown', actualContentType: 'ARTICLE', author: { name: 'Autora' },
    title: 'Notas del grupo', content: 'Texto', likes: 0, likedByMe: false, comments: [],
  };
  const seen = [];
  const track = (response) => (request) => {
    seen.push([request.method(), new URL(request.url()).pathname, request.headers().authorization, request.postDataJSON()]);
    return { json: response };
  };
  const page = await visit(t, '/study-groups', { api: {
    'GET /api/studygroups': track([{ id: 'topic', name: groupName, interest: topic, members: 2 }]),
    'GET /api/studygroups/topic/posts': track([post]),
    'POST /api/studygroups/topic/posts/content-7/like': track({ ...post, likes: 1, likedByMe: true }),
    'DELETE /api/studygroups/topic/posts/content-7/like': track(post),
    'POST /api/studygroups/topic/posts/content-7/comments': track({ id: '1', author: { name: 'Alfa' }, text: 'Comentario' }),
  } });
  await page.getByRole('button', { name: 'Ver Grupo' }).click();
  await page.getByRole('heading', { name: post.title }).waitFor();
  await page.getByRole('button', { name: '0 Me gusta' }).click();
  await page.getByRole('button', { name: '1 Me gusta' }).click();
  await page.getByRole('button', { name: '0 Me gusta' }).waitFor();
  await page.getByRole('button', { name: '0 Comentarios' }).click();
  await page.getByPlaceholder('Escribe un comentario...').fill('Comentario');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await page.getByText('Comentario', { exact: true }).waitFor();
  const reads = seen.filter(([method]) => method === 'GET');
  assert.deepEqual([...new Set(reads.map(([, path]) => path))], ['/api/studygroups', '/api/studygroups/topic/posts']);
  assert.ok(seen.every(([, , bearer]) => bearer === 'Bearer fixture-session'));
  assert.deepEqual(seen.filter(([method]) => method !== 'GET'), [
    ['POST', '/api/studygroups/topic/posts/content-7/like', 'Bearer fixture-session', null],
    ['DELETE', '/api/studygroups/topic/posts/content-7/like', 'Bearer fixture-session', null],
    ['POST', '/api/studygroups/topic/posts/content-7/comments', 'Bearer fixture-session', { text: 'Comentario' }],
  ]);
});

for (const width of [390, 1440]) {
  test(`group heading fits at ${width}px and preserves desktop alignment`, async (t) => {
    const page = await visit(t, '/study-groups', { width, api: {
      'GET /api/studygroups': [{ id: 'systems', name: groupName, interest: topic, members: 2 }],
    } });
    await page.getByRole('button', { name: 'Ver Grupo' }).click();
    const heading = page.getByRole('heading', { name: groupName });
    const back = page.getByRole('button', { name: 'Volver a Grupos' });
    await heading.waitFor();
    const name = await heading.locator('..').boundingBox();
    const button = await back.boundingBox();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    if (width === 390) {
      assert.ok(button.y + button.height <= name.y, 'back button cannot overlap the heading');
    } else {
      assert.ok(Math.abs(name.x + name.width / 2 - width / 2) <= 1);
      assert.ok(Math.abs(button.y + button.height / 2 - name.y - name.height / 2) <= 1);
    }
    await back.focus();
    await back.press('Enter');
    await page.getByRole('button', { name: 'Ver Grupo' }).waitFor();
  });
}
