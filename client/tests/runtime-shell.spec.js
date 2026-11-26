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
  cacheDir = await mkdtemp(join(tmpdir(), 'kb-shell-'));
  vite = await createServer({ cacheDir, server: { host: '127.0.0.1', port: 0 } });
  await vite.listen();
  origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  const executablePath = existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined;
  browser = await chromium.launch({ executablePath });
}, 30_000);

afterAll(async () => {
  await browser?.close();
  await vite?.close();
  if (cacheDir) await rm(cacheDir, { recursive: true, force: true });
});

async function withPage(width, run) {
  const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } });
  try {
    await run(page);
  } finally {
    await page.close();
  }
}

it('does not request chat, graph or moderation modules on initial visitor navigation', async () => {
  await withPage(1440, async (page) => {
    const requests = [];
    const failures = [];
    page.on('request', (request) => requests.push(new URL(request.url()).pathname));
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 500) failures.push(`${response.status()} ${new URL(response.url()).pathname}`);
    });
    await page.goto(`${origin}/landing`);
    await browserExpect(page.getByRole('button', { name: 'Ya tengo cuenta' })).toBeVisible({ timeout: 10_000 });
    expect(failures).toEqual([]);
    expect(requests.filter((path) => /^\/src\/(pages\/(chat\/|admin\/|AffinityGraphPage)|components\/dashboard\/affinity\/)/.test(path))).toEqual([]);
  });
}, 30_000);

it('only the latest of two pending Landing actions can navigate or create history', async () => {
  await withPage(390, async (page) => {
    await page.clock.install();
    await page.goto(`${origin}/landing`);
    const register = page.getByRole('button', { name: '¡Unirse ahora!' });
    await register.waitFor();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await register.dispatchEvent('click');
    await page.clock.runFor(700);
    await page.getByRole('button', { name: 'Ya tengo cuenta' }).dispatchEvent('click');
    await page.clock.runFor(850);
    expect(new URL(page.url()).pathname).toBe('/landing');
    await page.clock.runFor(700);
    await browserExpect(page).toHaveURL(`${origin}/login`);
    await page.goBack();
    await browserExpect(page).toHaveURL(`${origin}/landing`);
    await page.goForward();
    await browserExpect(page).toHaveURL(`${origin}/login`);
  });
}, 30_000);

describe.each([390, 1440])('calendar at %ipx', (width) => {
  it('keeps the calendar and its keyboard focus in view and preserves desktop placement', async () => {
    await withPage(width, async (page) => {
      await page.route('**/api/interests', (route) => route.fulfill({ json: [] }));
      await page.goto(`${origin}/register/steps`);
      await browserExpect(page).toHaveURL(`${origin}/register`);
      const credentials = page.getByRole('form', { name: 'Formulario de registro' });
      await credentials.getByLabel('Nombre de usuario').fill('calendar-tester');
      await credentials.getByLabel('Correo electrónico').fill('calendar@example.test');
      await credentials.getByLabel('Contraseña', { exact: true }).fill('study-fixture');
      await credentials.getByLabel('Confirmar contraseña').fill('study-fixture');
      await credentials.getByRole('button', { name: 'Crear Cuenta' }).click();
      await browserExpect(page).toHaveURL(`${origin}/register/steps`);
      const trigger = page.locator('[data-scope="date-picker"][data-part="trigger"]');
      await trigger.click();
      const calendar = page.locator('[data-scope="date-picker"][data-part="content"]');
      await browserExpect(calendar).toBeVisible();
      await browserExpect.poll(async () => {
        const box = await calendar.boundingBox();
        return box && box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= (width === 390 ? 844 : 900);
      }).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      if (width === 1440) {
        const control = await page.locator('[data-scope="date-picker"][data-part="control"]').boundingBox();
        expect((await calendar.boundingBox()).x).toBeGreaterThan(control.x + control.width);
      }
      await page.keyboard.press('ArrowRight');
      await browserExpect(calendar.locator(':focus')).toBeVisible();
      await page.keyboard.press('Escape');
      await browserExpect(calendar).toBeHidden();
    });
  }, 30_000);
});
