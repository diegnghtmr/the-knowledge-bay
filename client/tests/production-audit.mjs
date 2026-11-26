import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium, expect as browserExpect, request } from '@playwright/test';
const root = fileURLToPath(new URL('../../', import.meta.url));
const shots = process.argv.includes('--shots') ? resolve(root, '../shots-final') : null;
const viewports = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const moderator = { email: 'audit-moderator@example.invalid', password: randomUUID() };
const author = { email: 'audit-student@example.invalid', password: randomUUID(), username: 'auditstudent' };
const peer = { email: 'audit-peer@example.invalid', password: randomUUID(), username: 'auditpeer' };
const topics = ['Sistemas de prueba', 'Matemáticas de prueba'];
const title = 'Bitácora de prueba: café & álgebra';
const editedTitle = `${title} — editado`;
const carryTitle = 'Muestra de prueba para comprobar el reinicio';
const helpText = 'Prueba de solicitud: ¿cómo comparar árboles?';
const biography = 'Biografía sintética para validar la aplicación académica.';
const opener = 'Inicio de conversación sintética';
const repeated = 'Mensaje de auditoría idéntico';
const secrets = [moderator.password, author.password, peer.password];
const confirmed = [];
const captures = [];
const captureFailures = [];
const pageErrors = [];
let origin;
let server;

function safe(message) {
  return secrets.reduce((value, key) => value.replaceAll(key, '[redacted]'), String(message))
    .replace(/[a-z0-9-]+-[a-z0-9-]+-[a-z0-9-]+-[a-z0-9-]+-[a-z0-9-]{12}/gi, '[id]');
}

function confirm(name) {
  confirmed.push(name);
  console.log(`PASS ${name}`);
}

async function launch(directory, port = 0) {
  const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
  const child = spawn(java, ['-jar', join(root, 'server/target/server-0.0.1-SNAPSHOT.jar')], {
    cwd: directory,
    env: {
      PATH: process.env.PATH, HOME: directory, LANG: 'C.UTF-8', TZ: 'America/Bogota',
      SERVER_ADDRESS: '127.0.0.1', SERVER_PORT: String(port), SPRING_PROFILES_ACTIVE: 'prod',
      SPRING_CONFIG_LOCATION: 'optional:classpath:/application.properties',
      SPRING_DATASOURCE_URL: `jdbc:sqlite:${join(directory, 'audit.sqlite')}?foreign_keys=on&busy_timeout=5000`,
      SPRING_SQL_INIT_MODE: 'always', SPRING_WEB_RESOURCES_STATIC_LOCATIONS: `file:${join(root, 'client/dist')}/`,
      MODERATOR_NAME: 'Audit Moderator', MODERATOR_EMAIL: moderator.email, MODERATOR_PASSWORD: moderator.password,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server = child;
  let output = '';
  child.stderr.resume();
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (part) => { output = (output + part).slice(-16_384); });
  await once(child, 'spawn');
  for (let n = 0; n < 200; n += 1) {
    if (child.exitCode !== null) throw new Error(`Packaged server exited ${child.exitCode} before readiness`);
    const match = /Tomcat started on port (\d+)/.exec(output);
    if (match) {
      const base = `http://127.0.0.1:${match[1]}`;
      const check = await fetch(`${base}/api/interests`, { signal: AbortSignal.timeout(1000) }).catch(() => null);
      if (check?.ok) return base;
    }
    await delay(100);
  }
  throw new Error('Packaged server did not become ready');
}

async function stop() {
  const child = server;
  server = undefined;
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, 'exit');
  const force = setTimeout(() => child.kill('SIGKILL'), 4000);
  try {
    child.kill('SIGTERM');
    await exited;
  } finally {
    clearTimeout(force);
  }
}

async function api(http, path, { method = 'GET', data, token, status = 200 } = {}) {
  const result = await http.fetch(origin + path, {
    method, data, headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  assert.equal(result.status(), status, `${method} ${path} HTTP status`);
  return status === 200 ? result.json() : null;
}

async function open(browser, viewport) {
  const context = await browser.newContext({ viewport, locale: 'es-CO', timezoneId: 'America/Bogota', deviceScaleFactor: 1 });
  context.setDefaultTimeout(5500);
  await context.route('**/*', (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(`${new URL(page.url()).pathname}: ${safe(error.message)}`));
  page.on('dialog', (dialog) => dialog.accept().catch(() => {}));
  return page;
}

const button = (page, name) => page.getByRole('button', { name, exact: typeof name === 'string' }).first();
const text = (page, name) => page.getByText(name, { exact: typeof name === 'string' }).first();
const placeholder = (page, name) => page.getByPlaceholder(name).first();
const response = (page, path, method = 'POST') => page.waitForResponse((item) =>
  new URL(item.url()).pathname === path && item.request().method() === method);

async function go(page, path, marker) {
  const result = await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
  assert.equal(result?.status(), 200, `GET ${path} must serve the SPA`);
  await page.locator('#root > *').first().waitFor({ state: 'attached' });
  if (marker) await text(page, marker).waitFor();
}

async function shot(page, name, anchor) {
  if (!shots) return;
  const { width, height } = page.viewportSize();
  const file = `${name}-${width}x${height}.png`;
  if (anchor) await anchor.scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
  });
  await page.screenshot({ path: join(shots, file), animations: 'disabled', mask: [page.locator('input[type=password]').filter({ visible: true })] });
  captures.push(file);
  console.log(`SHOT ${file}`);
}

async function capture(name, work) {
  try {
    await work();
  } catch (error) {
    captureFailures.push(`${name}: ${safe(error.message).split('\n')[0]}`);
    console.error(`INCOMPLETE ${captureFailures.at(-1)}`);
  }
}

async function login(page, credentials) {
  await go(page, '/login');
  const form = page.getByRole('form', { name: 'Formulario de inicio de sesión' });
  await form.locator('input[name=email]').fill(credentials.email);
  await form.locator('input[name=password]').fill(credentials.password);
  const requested = response(page, '/api/auth/login');
  await button(form, 'Ingresar').click();
  const result = await requested;
  assert.equal(result.status(), 200, 'UI login');
  const actor = await result.json();
  assert.ok(actor.userId && actor.token);
  await page.waitForURL(`${origin}/`);
  await page.locator('header h1').getByText('Inicio', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => sessionStorage.getItem('userId')), actor.userId);
  return actor;
}

async function register(page, who, lastName) {
  await go(page, '/register');
  const form = page.getByRole('form', { name: 'Formulario de registro' });
  await form.locator('input[name=username]').fill(who.username);
  await form.locator('input[name=register-email]').fill(who.email);
  await form.locator('input[name=register-password]').fill(who.password);
  await form.locator('input[name=confirm-password]').fill(who.password);
  await form.locator('[data-scope="checkbox"][data-part="control"]').click();
  await button(form, 'Crear Cuenta').click();
  await page.waitForURL('**/register/steps');
  const first = placeholder(page, 'Tu nombre');
  await first.waitFor();
  await shot(page, '04-signup-personal', first);
  await first.fill('Persona');
  await placeholder(page, 'Tu apellido').fill(lastName);
  await page.locator('[data-scope="date-picker"][data-part="trigger"]').click();
  const cell = page.locator('[data-part="table-cell-trigger"]').filter({ visible: true }).first();
  await shot(page, '05-signup-datepicker', cell);
  await cell.click();
  await button(page, 'Siguiente').click();
  const bio = placeholder(page, 'Escribe tu biografía aquí...');
  await shot(page, '06-signup-biography', bio);
  await bio.fill(biography);
  await button(page, 'Siguiente').click();
  for (const topic of topics) await page.getByLabel(topic, { exact: true }).check();
  await shot(page, '07-signup-interests', button(page, 'Finalizar'));
  const requested = response(page, '/api/auth/register');
  await button(page, 'Finalizar').click();
  assert.equal((await requested).status(), 200, 'UI registration');
}

async function publish(page, publicationTitle, burst = false) {
  await go(page, '/publish-content', 'Publicar Nuevo Contenido');
  await placeholder(page, 'Ej: Introducción a React Hooks').fill(publicationTitle);
  await page.locator('textarea').first().fill('Lectura de prueba con ñ, & < 50 y signos ¿?.');
  await placeholder(page, 'Buscar tema principal').fill(topics[0]);
  await text(page, topics[0]).click();
  const submit = page.locator('form button[type=submit]').first();
  const posts = [];
  const track = (req) => {
    if (new URL(req.url()).pathname === '/api/content' && req.method() === 'POST') posts.push(req);
  };
  page.on('request', track);
  try {
    const sent = response(page, '/api/content');
    if (burst) await submit.evaluate((el) => { el.click(); el.click(); });
    else await submit.click();
    assert.equal((await sent).status(), 200, 'UI publication');
    await page.waitForURL(`${origin}/`);
    assert.equal(posts.length, 1, 'one publish request per intent');
  } finally {
    page.off('request', track);
  }
}

async function help(page) {
  await go(page, '/help-request', 'Solicitud de Ayuda');
  await placeholder(page, /Buscar temas de interés relacionados/).fill(topics[0]);
  await text(page, topics[0]).click();
  await placeholder(page, /Describe brevemente/).fill(helpText);
  await page.locator('select').first().selectOption('MEDIUM');
  const sent = response(page, '/api/help-requests');
  await page.locator('form button[type=submit]').first().click();
  assert.equal((await sent).status(), 200, 'help fixture');
  await page.waitForURL(`${origin}/`);
}

async function openGroup(page, postTitle) {
  await go(page, '/study-groups', 'Grupos de Estudio');
  await placeholder(page, /Buscar grupos/).fill(topics[0]);
  await button(page, 'Ver Grupo').click();
  await page.getByRole('heading', { name: `Grupo de ${topics[0]}`, exact: true }).waitFor();
  if (postTitle) await text(page, postTitle).waitFor();
}

async function chat(page, username) {
  await go(page, '/chat');
  await placeholder(page, 'Buscar conversaciones').fill(username);
  await page.getByRole('button', { name: new RegExp(`^${username}(?:\\s|$)`) }).click();
  await page.getByRole('heading', { name: username, exact: true, level: 2 }).waitFor();
  return placeholder(page, 'Escribe un mensaje...');
}

async function send(page, field, message) {
  const sent = response(page, '/api/chat/send');
  await field.fill(message);
  await field.press('Enter');
  assert.equal((await sent).status(), 200, 'UI message send');
  await browserExpect(field).toHaveValue('');
}

const studentRoutes = [
  ['/', '08-student-home', 'Inicio'], ['/profile', '09-student-profile', 'Mi Perfil'],
  ['/study-groups', '18-student-groups', 'Grupos de Estudio'],
  ['/help-request', '21-student-help', 'Solicitud de Ayuda'], ['/publish-content', '22-student-publish', 'Publicar Nuevo Contenido'],
];
const adminRoutes = [
  ['/', '25-moderator-home', 'Inicio'], ['/users-dashboard', '26-moderator-users', 'Gestión de Usuarios'],
  ['/content-dashboard', '27-moderator-content', 'Gestión de Contenidos'], ['/affinity-graph', '28-moderator-affinity', 'Grafo de Afinidad'],
  ['/admin/analytics', '29-moderator-analytics', 'Panel Analítico'], ['/admin/interests', '30-moderator-interests', 'Gestión de Intereses'],
  ['/admin/help-requests', '31-moderator-help', 'Solicitudes de Ayuda'], ['/admin/stats', '32-moderator-stats', 'Estadísticas'],
];

async function takeRoutes(page, routes) {
  for (const [path, name, marker] of routes) await capture(name, async () => {
    await go(page, path, marker);
    await page.mouse.move(0, 0);
    if (name === '18-student-groups' && page.viewportSize().width === 390) {
      await button(page, 'Ver Grupo').hover();
    }
    await page.waitForTimeout(300); // Allow data-driven canvases and transitions to settle.
    await shot(page, name);
  });
}

async function visualMatrix(browser, peerId) {
  for (const viewport of viewports) {
    const visitor = await open(browser, viewport);
    const student = await open(browser, viewport);
    const admin = await open(browser, viewport);
    try {
      await capture('visitor views', async () => {
        await go(visitor, '/landing');
        await visitor.waitForTimeout(2900); // The shoreline intro starts after 500 ms and scrolls for 2300 ms.
        await shot(visitor, '01-visitor-landing', button(visitor, '¡Unirse ahora!'));
        await go(visitor, '/login');
        await shot(visitor, '02-visitor-login', button(visitor, 'Ingresar'));
        await go(visitor, '/register');
        await shot(visitor, '03-visitor-register', button(visitor, 'Crear Cuenta'));
        await go(visitor, '/terms');
        await shot(visitor, '24-terms');
      });
      await login(student, author);
      await login(admin, moderator);
      await takeRoutes(student, studentRoutes);
      await capture('profile modals', async () => {
        for (const [n, name] of [['10', 'seguidos'], ['11', 'seguidores'], ['12', 'grupos'], ['13', 'publicaciones'], ['14', 'solicitudes']]) {
          await go(student, '/profile', 'Mi Perfil');
          await student.getByTitle(`Ver ${name}`, { exact: true }).click();
          await student.waitForTimeout(300);
          await shot(student, `${n}-profile-${name}`);
          if (name === 'solicitudes' && viewport.width === 1440) {
            const completed = student.waitForResponse((item) => item.request().method() === 'PUT' &&
              /^\/api\/help-requests\/\d+\/complete$/.test(new URL(item.url()).pathname));
            await student.getByTitle('Marcar como completada', { exact: true }).click();
            assert.equal((await completed).status(), 200, 'completing the help request for the later views');
          }
        }
        await go(student, '/profile', 'Mi Perfil');
        await button(student, 'Editar Perfil').click();
        const save = button(student, 'Guardar Cambios');
        await shot(student, '15-profile-edit', save);
        if (viewport.width === 1440) {
          const updated = 'Perfil modificado con datos sintéticos y acentos áéí.';
          await placeholder(student, 'Cuéntanos un poco sobre ti...').fill(updated);
          const saved = response(student, '/api/profile', 'PUT');
          await save.click();
          assert.equal((await saved).status(), 200);
          await text(student, updated).waitFor();
        }
      });
      await capture('peer profile', async () => {
        await go(student, `/user/${peerId}`);
        await button(student, 'Seguir').waitFor();
        await shot(student, '17-peer-profile');
      });
      await capture('chat thread', async () => {
        if (viewport.width === 390) {
          await go(student, '/chat', repeated);
          await shot(student, '16-student-chat');
        }
        const field = await chat(student, peer.username);
        const log = student.getByRole('log', { name: 'Mensajes' });
        await log.getByText(opener, { exact: true }).waitFor();
        const repeatedBubbles = log.getByText(repeated, { exact: true });
        if (viewport.width === 390) await browserExpect(repeatedBubbles).toHaveCount(2);
        await shot(student, '19-chat-thread', field);
        if (viewport.width === 1440) {
          await send(student, field, repeated);
          await send(student, field, repeated);
          await browserExpect(repeatedBubbles).toHaveCount(2);
        }
      });
      await capture('group and comments', async () => {
        await openGroup(student, title);
        await shot(student, '20-group-feed');
        const article = student.locator('article').filter({ hasText: title }).first();
        await button(article, /Comentarios/).click();
        await shot(student, '23-group-comments', placeholder(article, 'Escribe un comentario...'));
      });
      await capture('publication forms', async () => {
        await go(student, '/publish-content', 'Publicar Nuevo Contenido');
        const kind = student.locator('#contentType');
        for (const variant of ['QUESTION', 'LINK', 'VIDEO', 'RESOURCE']) {
          await kind.selectOption(variant);
          await shot(student, `37-publication-${variant.toLowerCase()}`, kind);
        }
      });
      await takeRoutes(admin, adminRoutes);
      await capture('moderator edit views', async () => {
        await go(admin, '/content-dashboard', 'Gestión de Contenidos');
        await placeholder(admin, /Buscar por título, información/).fill(title);
        await admin.getByRole('row').filter({ hasText: title }).first().getByTitle('Editar', { exact: true }).click();
        await shot(admin, '33-moderator-content-edit', admin.getByTitle('Guardar', { exact: true }).first().locator('xpath=ancestor::tr'));
        await go(admin, '/users-dashboard', 'Gestión de Usuarios');
        await admin.getByRole('row').filter({ hasText: author.username }).first().getByTitle('Editar', { exact: true }).click();
        await shot(admin, '34-moderator-user-edit', admin.getByTitle('Cancelar', { exact: true }).first());
      });
      await capture('moderator affinity path', async () => {
        await go(admin, '/affinity-graph', 'Grafo de Afinidad');
        const selects = admin.locator('select');
        await selects.nth(1).waitFor();
        const values = await selects.first().locator('option').evaluateAll((items) => items.filter((o) => o.value && !o.disabled).map((o) => o.value));
        assert.ok(values.length >= 2);
        await selects.nth(0).selectOption(values[0]);
        await selects.nth(1).selectOption(values[1]);
        await button(admin, /Encontrar Ruta/).click();
        await admin.waitForTimeout(450); // The graph modal starts fitting the path after 300 ms.
        await shot(admin, '35-moderator-affinity-path', admin.getByText(/Ruta más corta|Paso 1|No se encontró una ruta/i).last());
      });
    } finally {
      await Promise.all([visitor, student, admin].map((page) => page.context().close()));
    }
  }
}

async function run(browser, http, directory) {
  origin = await launch(directory);
  assert.deepEqual(await api(http, '/api/interests'), []);
  const adminPage = await open(browser, viewports[0]);
  const firstPage = await open(browser, viewports[0]);
  const secondPage = await open(browser, viewports[1]);
  const initialAdmin = await login(adminPage, moderator);
  await api(http, '/api/test-data/load', { method: 'POST', token: initialAdmin.token, status: 403 });
  assert.deepEqual(await api(http, '/api/interests'), [], 'production keeps fixture loading disabled');
  for (const name of topics) {
    assert.equal((await api(http, '/api/interests', { method: 'POST', data: { name }, token: initialAdmin.token })).success, true);
  }
  await register(firstPage, author, 'Alfa');
  await register(secondPage, peer, 'Beta');
  const initial = await login(firstPage, author);
  const other = await login(secondPage, peer);
  assert.notEqual(initial.userId, other.userId);
  confirm('register → login through the UI at desktop and phone widths');

  await publish(firstPage, title, true);
  const global = (token) => api(http, '/api/content', { token });
  const visible = (await global(initial.token)).filter((entry) => entry.title === title);
  assert.equal(visible.length, 1);
  const id = visible[0].contentId;
  assert.equal(visible[0].authorId, initial.userId);
  confirm('rapid publication sends and persists exactly one post');

  const port = Number(new URL(origin).port);
  await stop();
  origin = await launch(directory, port);
  await api(http, '/api/auth/session', { token: initial.token, status: 401 });
  const signed = await login(firstPage, author);
  const recipient = await login(secondPage, peer);
  const mod = await login(adminPage, moderator);
  assert.equal(signed.userId, initial.userId);
  assert.equal(recipient.userId, other.userId);
  await go(firstPage, '/profile');
  await text(firstPage, 'Biografía').waitFor();
  assert.equal(await text(firstPage, biography).count(), 1, 'the signup biography survives restart and appears in the profile');
  assert.deepEqual((await global(signed.token)).map((entry) => entry.contentId), [id]);
  assert.equal((await api(http, '/api/interests')).length, topics.length);
  confirm('packaged restart preserves student IDs, posts and interests but revokes old sessions');

  await publish(firstPage, carryTitle);
  await help(firstPage);
  const [group] = (await api(http, '/api/studygroups', { token: signed.token })).filter(({ interest }) => interest === topics[0]);
  assert.ok(group);
  const groupFeed = () => api(http, `/api/studygroups/${group.id}/posts`, { token: signed.token });
  assert.equal((await groupFeed()).filter((entry) => entry.id === `content-${id}` && entry.title === title).length, 1);
  await openGroup(firstPage, title);
  confirm('new post appears once in the global and group feeds');

  const url = `/user/${recipient.userId}`;
  const own = () => api(http, '/api/profile', { token: signed.token });
  const profile = () => api(http, `/api/profile/${recipient.userId}`, { token: signed.token });
  await go(firstPage, url);
  const target = firstPage.getByTitle('Ver seguidores');
  assert.match(await target.innerText(), /^0\s/);
  await button(firstPage, 'Seguir').click();
  await button(firstPage, 'Dejar de Seguir').waitFor();
  assert.match(await target.innerText(), /^1\s/);
  assert.equal((await own()).following, 1);
  assert.equal((await profile()).followers, 1);
  assert.equal((await firstPage.reload()).status(), 200);
  await button(firstPage, 'Dejar de Seguir').click();
  await button(firstPage, 'Seguir').waitFor();
  assert.match(await target.innerText(), /^0\s/);
  assert.equal((await own()).following, 0);
  assert.equal((await profile()).followers, 0);
  confirm('follow and unfollow refresh both persisted counters and survive reload');

  assert.deepEqual(await api(http, '/api/chat/contacts', { token: signed.token }), []);
  if (shots) {
    await go(firstPage, '/chat', 'No se encontraron contactos');
    await shot(firstPage, '16-student-chat');
  }
  const field = await chat(firstPage, peer.username);
  await send(firstPage, field, opener);
  const incoming = await chat(secondPage, author.username);
  await secondPage.getByRole('log', { name: 'Mensajes' }).getByText(opener, { exact: true }).waitFor();
  if (shots) {
    await api(http, '/api/affinity-graph/refresh', { method: 'POST', token: mod.token });
    await visualMatrix(browser, recipient.userId);
  }
  await send(secondPage, incoming, 'Respuesta sintética de auditoría');
  await firstPage.reload();
  await chat(firstPage, peer.username);
  await firstPage.getByRole('log', { name: 'Mensajes' }).getByText('Respuesta sintética de auditoría', { exact: true }).waitFor();
  confirm('new peer discovered and messaged through the real chat search endpoint');

  assert.equal((await secondPage.reload()).status(), 200);
  await secondPage.getByPlaceholder('Buscar conversaciones').waitFor();
  assert.equal(new URL(secondPage.url()).pathname, '/chat');
  confirm('authenticated deep link reload serves the SPA on a phone');

  await go(adminPage, '/content-dashboard', 'Gestión de Contenidos');
  const row = (name) => adminPage.getByRole('row').filter({ hasText: name }).first();
  await row(title).getByTitle('Editar', { exact: true }).click();
  const editor = adminPage.getByTitle('Guardar', { exact: true }).first().locator('xpath=ancestor::tr');
  await editor.locator('input').first().fill(editedTitle);
  const changed = response(adminPage, `/api/admin/content/${id}`, 'PUT');
  await editor.getByTitle('Guardar', { exact: true }).click();
  assert.equal((await changed).status(), 200);
  await adminPage.reload();
  await row(editedTitle).waitFor();
  await openGroup(firstPage, editedTitle);
  assert.equal((await global(signed.token)).find((entry) => entry.contentId === id)?.title, editedTitle);
  assert.equal((await groupFeed()).find((entry) => entry.id === `content-${id}`)?.title, editedTitle);
  const deleted = response(adminPage, `/api/admin/content/${id}`, 'DELETE');
  await row(editedTitle).getByTitle('Eliminar', { exact: true }).click();
  assert.equal((await deleted).status(), 200);
  await adminPage.reload();
  await text(adminPage, carryTitle).waitFor();
  assert.equal(await row(editedTitle).count(), 0);
  await openGroup(firstPage, carryTitle);
  assert.equal(await text(firstPage, editedTitle).count(), 0);
  assert.ok((await global(signed.token)).every((entry) => entry.contentId !== id));
  assert.ok((await groupFeed()).every((entry) => entry.id !== `content-${id}`));
  confirm('moderator edit and delete persist across reload in the admin, global and group feeds');

  await api(http, '/api/auth/register', { method: 'POST', data: { username: 'auditnull', email: 'audit-null@example.invalid', password: randomUUID(), lastName: 'Prueba', dateOfBirth: '2000-01-01', interests: topics } });
  const incomplete = (await api(http, '/api/admin/users', { token: mod.token })).find(({ username }) => username === 'auditnull');
  assert.ok(incomplete && !incomplete.firstName);
  for (const viewport of viewports) {
    const page = await open(browser, viewport);
    try {
      await login(page, moderator);
      await go(page, '/users-dashboard', 'Gestión de Usuarios');
      await text(page, '@auditnull').waitFor();
      const search = placeholder(page, /Buscar por nombre, usuario o correo/);
      await search.fill('consulta-que-no-coincide');
      await text(page, 'No se encontraron usuarios').waitFor();
      await shot(page, '36-crash-user-search');
      await search.fill('auditnull');
      await text(page, '@auditnull').waitFor();
    } finally {
      await page.context().close();
    }
  }
  confirm('moderator search handles the incomplete profile on both widths without losing the route');

  const loggedOut = response(firstPage, '/api/auth/logout');
  await button(firstPage, 'Cerrar Sesión').click();
  assert.equal((await loggedOut).status(), 200);
  await firstPage.waitForURL('**/landing');
  await go(firstPage, '/chat');
  await firstPage.waitForURL('**/landing');
  await api(http, '/api/auth/session', { token: signed.token, status: 401 });
  confirm('logout revokes the bearer token and guards a reloaded deep route');
  assert.deepEqual(pageErrors, [], 'browser page errors');
}

const directory = await mkdtemp(join(tmpdir(), 'kb-production-'));
let browser;
let http;
try {
  if (shots) await mkdir(shots, { recursive: true });
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  http = await request.newContext({ timeout: 8000 });
  await run(browser, http, directory);
  if (shots) {
    assert.deepEqual(captureFailures, []);
    assert.equal(new Set(captures).size, 80, 'visual captures');
  }
} catch (error) {
  console.error(`FAIL ${safe(error.stack || error.message)}`);
  process.exitCode = 1;
} finally {
  try {
    await browser?.close();
    await http?.dispose();
  } finally {
    try { await stop(); } finally { await rm(directory, { recursive: true, force: true }); }
  }
  console.log(`RESULT ${confirmed.length} packaged scenarios; ${new Set(captures).size} captures; ${captureFailures.length} incomplete capture steps`);
}
