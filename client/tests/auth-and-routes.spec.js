import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect as browserExpect } from '@playwright/test';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let cacheDir;
let vite;
let browser;
let origin;

beforeAll(async () => {
  cacheDir = await mkdtemp(join(tmpdir(), 'kb-auth-'));
  vite = await createServer({ cacheDir, configLoader: 'runner', envFile: false, server: { host: '127.0.0.1', port: 0 } });
  await vite.listen();
  origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  const executablePath = process.env.CHROMIUM_PATH ?? (!process.env.CI && existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath });
}, 30_000);

afterAll(async () => {
  try { await browser?.close(); } finally {
    try { await vite?.close(); } finally {
      if (cacheDir) await rm(cacheDir, { recursive: true, force: true });
    }
  }
});

const identity = { userId: 'student-123', role: 'STUDENT' };

async function signIn(page) {
  await page.goto(`${origin}/login`);
  const form = page.getByRole('form', { name: 'Formulario de inicio de sesión' });
  await form.getByLabel('Correo electrónico').fill('student@example.test');
  await form.getByLabel('Contraseña', { exact: true }).fill('study-fixture');
  return form;
}

async function sessionValues(page) {
  return page.evaluate(() => ['token', 'role', 'userId'].map((key) => sessionStorage.getItem(key)));
}

async function withPage(width, run) {
  const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
  await page.route('**/*', (route) => new URL(route.request().url()).origin === origin ? route.fallback() : route.abort());
  page.setDefaultTimeout(7000);
  try {
    await run(page);
  } finally {
    await page.close();
  }
}

describe.each([390, 1440])('authentication at %ipx', (width) => {
  it('logs in with server identity, reconciles a reloaded session and redirects on revocation', async () => {
    await withPage(width, async (page) => {
      let validLogin = false;
      let revoked = false;
      const loginOrigins = [];
      const sessionHeaders = [];
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.pathname === '/api/auth/login') {
          if (!validLogin) return route.fulfill({ status: 401, json: { message: 'Credenciales inválidas' } });
          loginOrigins.push(url.origin);
          return route.fulfill({ json: { token: 'fixture-session', ...identity } });
        }
        if (url.pathname === '/api/auth/session') {
          sessionHeaders.push(request.headers().authorization);
          return route.fulfill(revoked ? { status: 401, json: {} } : { json: identity });
        }
        return route.fulfill({ status: 403, json: {} });
      });
      await page.goto(`${origin}/admin/interests`);
      await browserExpect(page).toHaveURL(`${origin}/landing`);
      await browserExpect(page.getByRole('button', { name: 'Ya tengo cuenta' })).toBeVisible();
      const form = await signIn(page);
      await form.getByRole('button', { name: 'Ingresar' }).click();
      await browserExpect(page.getByText('Credenciales inválidas', { exact: true })).toBeVisible();
      expect(await sessionValues(page)).toEqual([null, null, null]);
      validLogin = true;
      await form.getByRole('button', { name: 'Ingresar' }).click();
      await browserExpect(page).toHaveURL(`${origin}/`);
      await browserExpect(page.getByRole('heading', { name: '¡Bienvenido a The Knowledge Bay!' })).toBeVisible();
      expect(loginOrigins).toEqual([origin]);
      expect(await sessionValues(page)).toEqual(['fixture-session', 'student', identity.userId]);
      await page.evaluate(() => sessionStorage.setItem('role', 'moderator'));
      await page.goto(`${origin}/admin/interests`);
      await browserExpect(page).toHaveURL(`${origin}/`);
      expect(sessionHeaders.length).toBeGreaterThan(0);
      expect(await sessionValues(page)).toEqual(['fixture-session', 'student', identity.userId]);
      const checksBeforeRevocation = sessionHeaders.length;
      revoked = true;
      await page.reload();
      await browserExpect(page).toHaveURL(`${origin}/landing`);
      // StrictMode may start and abort a check before the live check completes.
      expect(sessionHeaders.length).toBeGreaterThan(checksBeforeRevocation);
      expect([...new Set(sessionHeaders)]).toEqual(['Bearer fixture-session']);
      expect(await sessionValues(page)).toEqual([null, null, null]);
    });
  }, 30_000);

  it('keeps a valid session on a role denial and clears it even if logout fails', async () => {
    await withPage(width, async (page) => {
      const calls = [];
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        const { pathname } = new URL(request.url());
        calls.push([pathname, request.method(), request.headers().authorization]);
        if (pathname === '/api/auth/session') return route.fulfill({ json: identity });
        if (pathname === '/api/auth/logout') return route.fulfill({ status: 503, json: {} });
        return route.fulfill({ status: 403, json: { message: 'Acceso denegado' } });
      });
      await page.addInitScript(() => {
        if (!sessionStorage.getItem('initialized')) {
          sessionStorage.setItem('initialized', 'yes');
          sessionStorage.setItem('token', 'fixture-session');
          sessionStorage.setItem('role', 'student');
          sessionStorage.setItem('userId', 'student-123');
        }
      });
      await page.goto(`${origin}/`);
      const denied = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/profile');
      await page.locator('nav a[href="/profile"]').click();
      expect((await denied).status()).toBe(403);
      await browserExpect(page).toHaveURL(`${origin}/profile`);
      expect(await sessionValues(page)).toEqual(['fixture-session', 'student', identity.userId]);
      await page.goBack();
      await page.getByRole('button', { name: 'Cerrar Sesión' }).click();
      await browserExpect(page).toHaveURL(`${origin}/landing`);
      await browserExpect.poll(() => calls).toContainEqual(['/api/auth/logout', 'POST', 'Bearer fixture-session']);
      expect(await sessionValues(page)).toEqual([null, null, null]);
    });
  }, 30_000);
});

it('clears an active session when a protected request is denied with 401', async () => {
  await withPage(1440, async (page) => {
    await page.route('**/api/auth/session', (route) => route.fulfill({ json: identity }));
    await page.route('**/api/profile', (route) => route.fulfill({ status: 401, json: {} }));
    await page.addInitScript(() => {
      sessionStorage.setItem('token', 'fixture-session');
      sessionStorage.setItem('role', 'student');
      sessionStorage.setItem('userId', 'student-123');
    });
    await page.goto(`${origin}/`);
    await page.locator('nav a[href="/profile"]').click();
    await browserExpect(page).toHaveURL(`${origin}/landing`);
    expect(await sessionValues(page)).toEqual([null, null, null]);
  });
}, 30_000);

it.each([
  ['/help-request', 'textarea#information'],
  ['/publish-content', 'textarea#body'],
])('preserves description autosizing in %s', async (path, selector) => {
  await withPage(1440, async (page) => {
    await page.route('**/api/auth/session', (route) => route.fulfill({ json: identity }));
    await page.route('**/api/interests', (route) => route.fulfill({ json: [] }));
    await page.addInitScript(() => sessionStorage.setItem('token', 'fixture-session'));
    await page.goto(`${origin}${path}`);
    const description = page.locator(selector);
    await browserExpect(description).toBeVisible();
    const initial = (await description.boundingBox()).height;
    await description.fill('Un párrafo de prueba.\n'.repeat(40));
    await browserExpect.poll(async () => (await description.boundingBox()).height).toBeGreaterThan(initial);
    await description.clear();
    await browserExpect.poll(async () => (await description.boundingBox()).height).toBe(initial);
  });
}, 30_000);

it('contains a route render error and returns to the authenticated home', async () => {
  await withPage(1440, async (page) => {
    await page.route('**/api/auth/session', (route) => route.fulfill({ json: identity }));
    await page.route('**/src/pages/profile/ProfilePage.jsx*', (route) => route.fulfill({
      contentType: 'text/javascript',
      body: 'export default function ProfilePage() { throw new Error("Synthetic render failure"); }',
    }));
    await page.addInitScript(() => {
      sessionStorage.setItem('token', 'fixture-session');
      sessionStorage.setItem('role', 'student');
    });
    await page.goto(`${origin}/profile`);
    await browserExpect(page.getByRole('alert')).toHaveText('No pudimos cargar esta página.');
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await browserExpect(page).toHaveURL(`${origin}/`);
    await browserExpect(page.getByRole('heading', { name: '¡Bienvenido a The Knowledge Bay!' })).toBeVisible();
  });
}, 30_000);
