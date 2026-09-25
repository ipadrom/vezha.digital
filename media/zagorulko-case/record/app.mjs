// Work-center scenarios for the Zagorulko case, recorded from the offline stand of gbu-center
// (output/mobile-case-2026-09-07/serve_demo.py on 127.0.0.1:8097: synthetic people, temporary data, no .env).
// Usage: node app.mjs [review|locks|history|source|photocontrol|queue ...]; DRY=1 stores step screenshots instead of video.
// Only /ocr and the MAX network calls are intercepted; editing, drag and drop, locks, rebuilds, learning
// and shortening run in the real application code. No MAX message is sent.
import { start, OUT } from './recorder.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE = 'http://127.0.0.1:8097';
const DRY = !!process.env.DRY;
const only = process.argv.slice(2);
const PHOTO = fileURLToPath(new URL('../../../frontend/public/cases/gbu-process-automation/mobile/demo-orders.png', import.meta.url));
const FIXTURE = JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../../../../gbu-center/output/mobile-case-2026-09-07/fixture.json', import.meta.url), 'utf8'));
const PEOPLE = FIXTURE.people.slice(0, 16);
const roster = () => PEOPLE.map(p => `${p.name} (${p.height})`).join('\n');
const CHAT = 'https://web.max.ru/-100200300';
const ROUTE = 'Городская больница № 00 — Зал прощания «Тихий сад» — Мемориальный парк «Сосны»';
// Full-format MAX messages the stand "reads" from the source chat. Names are the fixture's fictional people.
const SOURCE_ORDERS = [
  { time: '09:00', tariff: 'Элит', surname: 'Примерова', crew: ['Примеров', 'Ладов', 'Миров', 'Яснов'] },
  { time: '10:30', tariff: 'Стандарт', surname: 'Макетова', crew: ['Образцов', 'Лучев', 'Кленов', 'Листов'] },
  { time: '12:00', tariff: 'Элит', surname: 'Демонова', crew: ['Макетов', 'Зорин', 'Светов', 'Речной'] },
  { time: '14:00', tariff: 'Элит', surname: 'Учебнова', crew: ['Эскизов', 'Ветров', 'Тихов', 'Полев'] },
].map((o, i) => ({
  id: `demo-${i + 1}`, key: `demo|${o.time}|${o.surname}`, timestamp: 1788732000 + i * 600,
  text: `07/09 ------${o.tariff}------\n${o.time}______${ROUTE}\n(Ум. ${o.surname}) - 4 - (Аг. Образцова А. А.)\n${o.crew.join('\n')}`,
}));

const r = await start({ width: 1180, height: 1120 });
// Source-row fragments shown above each card, rendered from the same fictional table as demo-orders.png.
const ROW_IMAGES = [];
{
  const p = await r.context.newPage();
  for (const o of FIXTURE.orders) {
    await p.setViewportSize({ width: 1210, height: 60 });
    await p.setContent(`<html><meta charset="utf-8"><style>body{margin:0;background:#fff}table{border-collapse:collapse;width:1210px;font:19px Arial;color:#202a31}td{border:1px solid #adb5bb;padding:14px 18px;white-space:nowrap}</style><table><tr><td>${o.collection_time}</td><td>${o.tariff}</td><td>${o.hospital}</td><td>${o.service_place}</td><td>${o.deceased_surname}</td><td>${o.num_people}</td></tr></table></html>`);
    ROW_IMAGES.push((await p.locator('table').screenshot({ type: 'jpeg', quality: 88 })).toString('base64'));
  }
  await p.close();
}
const { page, context, tap, type, sleep, record: startRecording, pause, resume, stop, moveTo, hideCursor, region } = r;
// Dry runs only collect step screenshots, so the frame capture loop stays off.
const record = async (name) => { if (!DRY) await startRecording(name); };
page.setDefaultTimeout(30000);
let stepNo = 0;
const step = async (label) => { if (DRY) { console.log(label, 'scrollY', await page.evaluate(() => scrollY)); await page.screenshot({ path: path.join(OUT, `dry-${label}-${++stepNo}.png`) }); } };
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());

// Staged MAX operation: the status endpoint answers by elapsed time since the job started.
let operation = null;
const startOperation = (stages) => { operation = { id: 'a1b2c3d4e5f6', t0: Date.now(), stages }; return operation.id; };
const operationState = () => {
  const t = (Date.now() - operation.t0) / 1000;
  const stage = operation.stages.find(s => t < s.until) || operation.stages[operation.stages.length - 1];
  return { id: operation.id, kind: 'messages', errors: [], added: 0, removed: 0, total: 0, done: 0, sent: 0, status: 'running', message: '', ...stage.state };
};

let stored = null; // browser state kept in memory for one script run
await context.route('**/*', async route => {
  const u = new URL(route.request().url());
  if (u.origin !== BASE) return route.abort();
  if (u.pathname === '/') {
    const response = await route.fetch();
    const html = (await response.text()).replaceAll('ГБУ · Рабочий центр', 'ИП Загорулько · Рабочий центр')
      .replace('ГБУ <span>', 'ИП Загорулько <span>').replace('Локальный режим', 'Демо');
    return route.fulfill({ response, body: html });
  }
  if (u.pathname === '/ocr') { await sleep(1800); return route.fulfill({ json: { date: FIXTURE.date, orders: FIXTURE.orders.map((o, i) => ({ ...o, row_image: ROW_IMAGES[i] })) } }); }
  if (u.pathname.startsWith('/state/')) {
    if (route.request().method() === 'GET') return route.fulfill({ json: stored || { state: null } });
    stored = route.request().postDataJSON(); return route.fulfill({ json: { ok: true } });
  }
  if (u.pathname === '/messages/destinations') return route.fulfill({ json: {} });
  if (u.pathname === '/messages/source/fetch-orders') {
    await sleep(1700);
    return route.fulfill({ json: { orders: SOURCE_ORDERS, scanned: 57, skipped: { without_crew: 2, needs_review: 0, duplicates: 0 }, warnings: [] } });
  }
  if (u.pathname === '/messages/send') {
    const body = route.request().postDataJSON();
    // The orders chat also receives the count as one more message, as the server does.
    const n = body.destination === 'photo_control' ? body.orders.length : body.messages.length + 1;
    const id = body.destination === 'photo_control' ? startOperation([
      { until: 2.2, state: { message: 'Проверяю бригадиров для ФОТО-КОНТРОЛЯ...' } },
      { until: 4.2, state: { message: 'Подтверждаю удаление участников...', removed: 3 } },
      { until: 6.0, state: { message: 'Подтверждаю состав ФОТО-КОНТРОЛЯ...', removed: 3, added: 3 } },
      { until: 7.6, state: { message: 'Участники добавлены. Отправляю заказы...', total: n, done: 0, removed: 3, added: 3 } },
      { until: 9.2, state: { message: `Отправляю сообщения: 1/${n}`, total: n, done: 1, sent: 1, removed: 3, added: 3 } },
      { until: 10.8, state: { message: `Отправляю сообщения: 2/${n}`, total: n, done: 2, sent: 2, removed: 3, added: 3 } },
      { until: 12.4, state: { message: `Отправляю сообщения: ${n}/${n}`, total: n, done: n, sent: n, removed: 3, added: 3 } },
      { until: 14.0, state: { message: 'Заказы отправлены. Отправляю список в избранное...', total: n + 1, done: n, sent: n, removed: 3, added: 3 } },
      { until: 1e9, state: { status: 'done', message: 'Заказы и список в избранное отправлены', total: n + 1, done: n + 1, sent: n + 1, removed: 3, added: 3 } },
    ]) : startOperation([
      { until: 1.6, state: { message: `Запускаю отправку: ${n}`, total: n } },
      ...Array.from({ length: n }, (_, i) => ({ until: 1.6 + (i + 1) * 2.4, state: { message: `Отправляю сообщения: ${i + 1}/${n}`, total: n, done: i + 1, sent: i + 1 } })),
      { until: 1e9, state: { status: 'done', message: 'Готово', total: n, done: n, sent: n, committed: 0, not_found: [], conflicts: [] } },
    ]);
    return route.fulfill({ status: 202, json: { accepted: true, job_id: id, ...operationState() } });
  }
  if (u.pathname.startsWith('/operations/')) return operation ? route.fulfill({ json: operationState() }) : route.fulfill({ status: 404, json: { error: 'operation not found' } });
  return route.continue();
});
// Confirmations are accepted silently: headless dialogs are not part of the recording.
await context.addInitScript(() => { localStorage.setItem('ocr_sync_code', 'DEMO07'); window.confirm = () => true; });

async function open(view) {
  // Each scenario starts from a clean browser state: no synced messages, no remembered background job.
  stored = null; operation = null;
  await page.goto(`${BASE}/healthz`); await page.evaluate(() => localStorage.removeItem('gbu_active_operation_id'));
  await page.goto(`${BASE}/#${view}`); await page.locator('.app-tabs').waitFor();
  // Layout changes below the fold must not move the recorded frame.
  await page.evaluate(() => { document.body.style.overflowAnchor = 'none'; });
  await page.locator(`#view-${view}`).waitFor({ state: 'visible' }); await sleep(900);
}
// Scroll so that `locator` sits `top` CSS px below the viewport top.
async function scrollTo(locator, top = 24) {
  await locator.evaluate((el, top) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - top }), top);
  await sleep(400);
}
const padBottom = () => page.evaluate(() => { const d = document.createElement('div'); d.style.height = '1400px'; document.body.appendChild(d); });
async function setValue(id, value) {
  await page.evaluate(([id, value]) => { const el = document.getElementById(id); el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, [id, value]);
}
async function drag(fromLocator, toLocator, { ms = 900 } = {}) {
  const a = await fromLocator.boundingBox(), b = await toLocator.boundingBox();
  await moveTo(a.x + a.width / 2, a.y + a.height / 2);
  await page.evaluate(() => window.__cursor?.press());
  await page.mouse.down(); await sleep(250);
  await moveTo(b.x + b.width / 2, b.y + Math.min(b.height - 40, 200), ms);
  await sleep(350);
  await page.mouse.up();
  await page.evaluate(() => window.__cursor?.release());
  await sleep(900);
}
async function loadOrdersFromChat() {
  await open('converter');
  await setValue('source-chat-link', CHAT); await setValue('orders-chat-link', CHAT); await setValue('photo-control-link', CHAT);
  await sleep(300);
}
const clipFrom = async (top, bottom, pad = 24) => region([top, bottom], pad);

const scenarios = {
  // Review before sending: correct the time and the head count; the formatted message follows every keystroke.
  async review() {
    await open('parser');
    await page.locator('#file-input').setInputFiles(PHOTO);
    await page.locator('.order-block').nth(2).waitFor(); await sleep(900);
    const block = page.locator('.order-block').first();
    await padBottom(); await scrollTo(block, 24);
    const clip = await region([block], 24);
    await moveTo(880, 900, 10);
    await step('review-start');
    await record('review');
    await sleep(900);
    const time = block.locator('input[data-key="collection_time"]');
    await tap(time, { after: 300 });
    await page.keyboard.press('Meta+A');
    await page.keyboard.type('09:15', { delay: 140 }); await sleep(1000);
    await step('review-time');
    const people = block.locator('input[data-key="num_people"]');
    await tap(people, { after: 300 });
    await page.keyboard.press('Meta+A');
    await page.keyboard.type('6', { delay: 140 }); await sleep(1700);
    await step('review-people');
    await hideCursor();
    if (!DRY) await stop({ clip, poster: 0.4 });
  },
  // Manual changes: drag two people between crews, lock a crew, rebuild the rest around it.
  async locks() {
    await open('crews');
    await page.locator('#inText').fill(roster());
    await page.locator('#btnSplit').click();
    await page.locator('.brig[data-gi="3"]').waitFor(); await sleep(700);
    await padBottom();
    const legend = page.locator('#page-split .legend').last();
    await scrollTo(legend, 20);
    const actions = page.locator('#splitActions');
    const clip = await region([legend, actions], 22);
    await moveTo(600, 980, 10);
    await step('locks-start');
    await record('locks');
    await sleep(900);
    const first = page.locator('.brig[data-gi="0"] .prow').nth(2), second = page.locator('.brig[data-gi="1"] .prow').nth(2);
    const firstName = await first.getAttribute('data-name'), secondName = await second.getAttribute('data-name');
    await drag(first.locator('.grip'), page.locator('.brig[data-gi="1"]'));
    await step('locks-drag1');
    await drag(page.locator(`.brig[data-gi="1"] .prow[data-name="${secondName}"] .grip`), page.locator('.brig[data-gi="0"]'));
    await step('locks-drag2');
    if (await page.locator(`.brig[data-gi="1"] .prow[data-name="${firstName}"]`).count() !== 1) throw new Error('drag did not move the person');
    await tap(page.locator('[data-glock="1"]'), { after: 1100 });
    await step('locks-locked');
    await tap(page.locator('#btnResolve'), { after: 400 });
    await page.locator('#toast').filter({ hasText: 'Пересобрано' }).waitFor();
    await sleep(2200);
    await step('locks-rebuilt');
    await hideCursor(); await sleep(300);
    if (!DRY) await stop({ clip, poster: 0.4 });
  },
  // Crew history: check a real day, save it, see it in the history list and in a person's trips.
  async history() {
    await open('crews');
    await page.locator('.crew-tab[data-p="learn"]').click(); await sleep(500);
    const groups = [PEOPLE.slice(0, 4), PEOPLE.slice(4, 8), PEOPLE.slice(8, 12), PEOPLE.slice(12, 16)];
    const real = groups.map((g, i) => `${i + 1}\n${g.map(p => `${p.name} (${p.height})`).join('\n')}`).join('\n\n');
    await page.locator('#learnIn').fill(roster());
    await page.locator('#learnReal').fill(real);
    await page.evaluate(() => { for (const id of ['learnIn', 'learnReal']) { const el = document.getElementById(id); el.style.height = el.getBoundingClientRect().height + 'px'; } });
    await sleep(400);
    await padBottom();
    const dateRow = page.locator('#page-learn .actions').first();
    await scrollTo(dateRow, 24);
    const hist = page.locator('#histList');
    await moveTo(700, 990, 10);
    await step('history-start');
    await record('history');
    await sleep(800);
    await type(page.locator('#learnDate'), '07.09', { delay: 130, after: 500 });
    await tap(page.locator('#btnAnalyze'), { after: 300 });
    await page.locator('#learnOut').waitFor({ state: 'visible' }); await sleep(1800);
    await step('history-analyzed');
    await tap(page.locator('#btnSaveDay'), { after: 300 });
    await page.locator('#histList .litem').first().waitFor(); await sleep(1600);
    await step('history-saved');
    const clip = await region([dateRow, hist], 24);
    await hideCursor(); await sleep(400);
    if (!DRY) await stop({ clip, poster: 0.4 });
  },
  // Orders in the right format: read the source chat, get shortened messages ready to check.
  async source() {
    await loadOrdersFromChat();
    await padBottom();
    const h1 = page.locator('.converter-zone h1');
    await scrollTo(h1, 24);
    await moveTo(900, 990, 10);
    await step('source-start');
    await record('source');
    await sleep(900);
    await tap(page.getByRole('button', { name: 'Загрузить с чатов' }), { after: 400 });
    await page.locator('.short-block').nth(3).waitFor(); await sleep(2600);
    await step('source-loaded');
    const clip = await region([page.locator('.converter-buttons'), page.locator('.short-block').last()], 24);
    await hideCursor(); await sleep(300);
    if (!DRY) await stop({ clip, poster: 0.4 });
  },
  // Chat members for current orders: photo control resets the chat, adds today's leaders and sends orders.
  async photocontrol() {
    await loadOrdersFromChat();
    await page.getByRole('button', { name: 'Загрузить с чатов' }).click();
    await page.locator('.short-block').nth(3).waitFor(); await sleep(600);
    await padBottom();
    await scrollTo(page.locator('.converter-buttons'), 24);
    await page.locator('#source-import-status').evaluate(el => { el.textContent = ''; });
    await moveTo(900, 990, 10);
    await step('photo-start');
    await record('photocontrol');
    await sleep(800);
    await tap(page.locator('.action-menu > summary'), { after: 900 });
    await step('photo-menu');
    const button = page.getByRole('button', { name: 'Фото-контроль: обновить состав и отправить заказы' });
    await tap(button, { after: 600 });
    await page.locator('#operation-status.done').waitFor({ timeout: 40000 });
    await sleep(2600);
    await step('photo-done');
    const clip = await region([page.locator('.converter-buttons'), page.locator('.converter-results')], 24);
    await hideCursor(); await sleep(300);
    if (!DRY) await stop({ clip, poster: 0.4, maxSeconds: 45 });
  },
  // Persistent queue: a background send survives a page reload and reports its progress.
  async queue() {
    await loadOrdersFromChat();
    await page.getByRole('button', { name: 'Загрузить с чатов' }).click();
    await page.locator('.short-block').nth(3).waitFor(); await sleep(600);
    await page.locator('#source-import-status').evaluate(el => { el.textContent = ''; });
    // The reload lands at scroll 0, so the whole scenario stays at scroll 0.
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(400);
    const clip = await region([page.locator('.converter-buttons'), page.locator('.converter-results')], 24);
    await moveTo(900, 990, 10);
    await step('queue-start');
    await record('queue');
    await sleep(800);
    await tap(page.locator('.action-menu > summary'), { after: 900 });
    await tap(page.getByRole('button', { name: 'Отправить в «ФОТО СБОРА ФИНАЛ»' }), { after: 600 });
    await page.locator('#operation-status').filter({ hasText: /: 2\// }).waitFor();
    await sleep(700);
    await step('queue-progress');
    await hideCursor();
    await pause();
    await page.reload(); await page.locator('#converter-actions').waitFor({ state: 'visible' });
    await resume();
    await page.locator('#operation-status').filter({ hasText: /Отправляю сообщения/ }).waitFor();
    await step('queue-reloaded');
    await page.locator('#operation-status.done').waitFor({ timeout: 40000 });
    await sleep(2400);
    await step('queue-done');
    if (!DRY) await stop({ clip, poster: 0.6, maxSeconds: 45 });
  },
};

for (const name of Object.keys(scenarios)) {
  if (only.length && !only.includes(name)) continue;
  console.log(`--- ${name}`);
  await scenarios[name]();
}
await r.close();
if (errors.length) { console.error('Page errors:', errors); process.exit(1); }
