// User-side scenarios recorded from the isolated MyMIT sandbox (dev branch).
// Usage: node user.mjs [name ...] ; DRY=1 stores step screenshots instead of video.
import { start } from './recorder.mjs';
import { login, BASE } from './common.mjs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const SEED=fileURLToPath(new URL('../seed-sandbox.py', import.meta.url));
const reseed=()=>{ execSync(`docker exec -i mymit-local-backend-1 python - < ${SEED}`, {stdio:'ignore'}); };
const collapseMap=async()=>{ await page.goto(BASE+'/app/main'); await page.evaluate(()=>localStorage.setItem('map-expanded','false')); };

const DRY = !!process.env.DRY;
const only = process.argv.slice(2);
const r = await start({ width: 560, height: 1000 });
const { page, tap, type, sleep, record, stop, moveTo, hideCursor } = r;
// Region covering the locators with padding, clamped to the current viewport.
async function region(locators, pad = 24) {
  const vp = page.viewportSize(); const boxes = [];
  for (const l of locators) { const b = await l.boundingBox(); if (b) boxes.push(b); }
  const x = Math.max(0, Math.min(...boxes.map(b => b.x)) - pad), y = Math.max(0, Math.min(...boxes.map(b => b.y)) - pad);
  const r = Math.min(vp.width, Math.max(...boxes.map(b => b.x + b.width)) + pad), bt = Math.min(vp.height, Math.max(...boxes.map(b => b.y + b.height)) + pad);
  return { x, y, width: r - x, height: bt - y };
}
let stepNo = 0;
const step = async (label) => { if (DRY) { await page.screenshot({ path: `dry-${label}-${++stepNo}.png` }); } };
const auth = await login(page, '79990000120');
const api = async (method, path) => fetch(BASE + '/api' + path, { method, headers: { Authorization: `Bearer ${auth.access_token}` } });
// Scroll so that `locator` sits `top` CSS px below the viewport top.
async function scrollTo(locator, top = 24, behavior = 'instant') {
  await locator.evaluate((el, [top, behavior]) => { window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - top, behavior }); }, [top, behavior]);
  await sleep(behavior === 'smooth' ? 1100 : 400);
}
// Keeps the document tall so that shrinking lists (filters, tabs) do not pull the viewport upwards.
const padBottom = () => page.evaluate(() => { const d = document.createElement('div'); d.style.height = '1200px'; document.body.appendChild(d); });
const boothCard = (name) => page.locator('div', { has: page.getByText(name, { exact: true }) }).filter({ has: page.getByRole('button', { name: /избранн/ }) }).last();

const scenarios = {
  async favorites() {
    reseed();
    for (const id of [2, 3, 4]) await api('DELETE', `/booths/${id}/favorite`);
    await collapseMap();
    await page.goto(BASE + '/app/main'); await sleep(3000);
    await page.getByRole('button', { name: 'Все МИТы', exact: true }).click();
    const search = page.getByRole('textbox');
    await padBottom();
    await scrollTo(search, 28);
    const card2 = boothCard('МИТ · Деловой квартал');
    const clip = await region([search, card2], 24);
    await moveTo(300, 900, 10);
    await step('fav-start');
    await record('favorites');
    await sleep(900);
    await tap(card2.getByRole('button', { name: 'Добавить в избранное' }), { after: 1400 });
    await step('fav-hearted');
    await tap(page.getByRole('button', { name: /Избранное/ }), { after: 2200 });
    await step('fav-tab');
    await hideCursor();
    if (!DRY) await stop({ clip, poster: 0.3 });
  },
  async search() {
    await page.setViewportSize({ width: 560, height: 1400 });
    await collapseMap();
    await page.goto(BASE + '/app/main'); await sleep(3000);
    await page.getByRole('button', { name: 'Все МИТы', exact: true }).click();
    const search = page.getByRole('textbox');
    await padBottom();
    await scrollTo(search, 28);
    // Clicking the field scrolls the page, so settle the layout before measuring the clip.
    await search.click(); await sleep(1200);
    const clip = await region([search, boothCard('МИТ · Деловой квартал')], 24);
    await moveTo(300, 900, 10);
    await record('search');
    await sleep(800);
    await type(search, 'Парк культуры', { delay: 110, after: 2400 });
    await step('search-typed');
    await hideCursor();
    if (!DRY) await stop({ clip, poster: 2.2 });
    await page.setViewportSize({ width: 560, height: 1000 });
  },
  async onboarding() {
    await page.goto(BASE + '/app/main?onboarding=1'); await sleep(5000);
    await moveTo(280, 700, 10);
    await record('onboarding');
    await sleep(1800);
    for (let i = 0; i < 12; i++) {
      const next = page.getByRole('button', { name: /^(Дальше|Начать пользоваться)$/ });
      const later = page.getByRole('button', { name: /^(Не сейчас|Позже)$/ });
      if (await next.count() && await next.first().isVisible()) {
        const last = (await next.first().textContent())?.includes('Начать');
        await step(`onb-${i}`);
        await tap(next.first(), { after: 2300 });
        if (last) break;
      } else if (await later.count() && await later.first().isVisible()) {
        await step(`onb-later-${i}`);
        await tap(later.first(), { after: 2000 });
      } else { await sleep(1200); }
    }
    await step('onb-end');
    await hideCursor(); await sleep(600);
    if (!DRY) await stop({ poster: 1.0, maxSeconds: 60 });
  },
  async auth() {
    await page.context().clearCookies();
    await page.goto(BASE + '/login'); await sleep(2500);
    await page.evaluate(() => localStorage.removeItem('mymit-storage'));
    await page.goto(BASE + '/login'); await sleep(2500);
    // The page footer credit is outside the demonstrated sign-in flow; keep the clip to the form.
    await page.evaluate(() => {
      const match = (el) => /^Приложение сделали/.test((el.textContent || '').trim());
      for (const el of document.querySelectorAll('body *')) if (match(el) && ![...el.children].some(match)) el.style.visibility = 'hidden';
    });
    await moveTo(280, 950, 10);
    await step('auth-start');
    await record('auth');
    await sleep(900);
    const phone = page.getByRole('textbox').first();
    await type(phone, '9990000120', { delay: 120, after: 900 });
    await step('auth-phone');
    const submit = page.getByRole('button', { name: /Получить код|Продолжить|Войти|Далее/ }).first();
    await tap(submit, { after: 2600 });
    await step('auth-code');
    await hideCursor();
    // Measured after the code screen appears: from above the heading to the support button, excluding the page footer.
    const clip = await region([page.getByRole('heading', { name: 'Вход', exact: true }), page.getByRole('button', { name: /Поддержка/ }).last()], 16);
    clip.height += 44; clip.y = Math.max(0, clip.y - 44);
    if (!DRY) await stop({ clip, poster: 3.5 });
    await login(page, '79990000120');
  },
  async interval() {
    await page.goto(BASE + '/app/book/2'); await sleep(3000);
    const heading = page.getByRole('heading', { name: 'Бронирование', exact: true });
    await scrollTo(page.getByText('Выберите дату', { exact: true }), 24);
    await moveTo(280, 950, 10);
    await record('interval');
    await sleep(900);
    const day = new Date(); day.setDate(day.getDate() + 2);
    await tap(page.getByRole('button', { name: String(day.getDate()), exact: true }).first(), { after: 1600 });
    await step('int-date');
    const slot = page.getByRole('button', { name: '16:00', exact: true }).first();
    await slot.waitFor();
    await tap(slot, { after: 1500 });
    await step('int-slot');
    const confirm = page.getByRole('button', { name: /^Подтвердить/ }).first();
    await tap(confirm, { after: 2200 });
    await step('int-confirmed');
    await hideCursor();
    if (!DRY) await stop({ poster: 7 });
  },
  async earlystart() {
    reseed();
    await page.goto(BASE + '/app/bookings'); await sleep(2500);
    await page.getByRole('button', { name: 'Предстоящие', exact: true }).click(); await sleep(1200);
    const btn = page.getByRole('button', { name: /Начать раньше/ }).first();
    const card = btn.locator('xpath=ancestor::div[contains(@class,"rounded")][1]');
    await scrollTo(card, 28);
    await moveTo(280, 950, 10);
    await step('early-start');
    await record('earlystart');
    await sleep(2000);
    await tap(btn, { after: 4000 });
    await step('early-tapped');
    await hideCursor();
    if (!DRY) await stop({ poster: 1.2 });
  },
  async reschedule() {
    reseed();
    await page.goto(BASE + '/app/bookings'); await sleep(2500);
    await page.getByRole('button', { name: 'Предстоящие', exact: true }).click(); await sleep(800);
    const move = page.getByRole('button', { name: 'Перенести', exact: true }).first();
    await scrollTo(move, 700);
    await moveTo(280, 950, 10);
    await record('reschedule');
    await sleep(900);
    await tap(move, { after: 1600 });
    await step('res-modal');
    const day = new Date(); day.setDate(day.getDate() + 3);
    await tap(page.locator('div.fixed').getByRole('button', { name: String(day.getDate()), exact: true }), { after: 1400 });
    await step('res-date');
    await tap(page.getByRole('button', { name: '15:00', exact: true }), { after: 1600 });
    await step('res-slot');
    await tap(page.getByRole('button', { name: /^Перенести на/ }), { after: 2600 });
    await step('res-done');
    await hideCursor();
    if (!DRY) await stop({ poster: 6 });
  },
  async extension() {
    await page.setViewportSize({ width: 560, height: 1180 });
    await page.goto(BASE + '/app/bookings'); await sleep(2500);
    await page.getByRole('button', { name: 'Предстоящие', exact: true }).click(); await sleep(800);
    const extend = page.getByRole('button', { name: 'Продлить', exact: true }).first();
    await scrollTo(extend, 900);
    await moveTo(280, 1100, 10);
    await record('extension');
    await sleep(900);
    await tap(extend, { after: 1800 });
    const modal = page.getByText('Продлить сессию', { exact: true }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]');
    const clip = await region([modal], 20); clip.height = 1180 - clip.y;
    await step('ext-modal');
    await tap(page.getByRole('button', { name: /^30 минут/ }), { after: 2000 });
    await step('ext-30');
    await tap(page.getByText('1 час', { exact: true }), { after: 2600 });
    await step('ext-60');
    await hideCursor();
    if (!DRY) await stop({ clip, poster: 5 });
    await page.setViewportSize({ width: 560, height: 1000 });
  },
  async minutes() {
    await page.setViewportSize({ width: 560, height: 1180 });
    await page.goto(BASE + '/app/bookings'); await sleep(2500);
    await page.getByRole('button', { name: 'Предстоящие', exact: true }).click(); await sleep(800);
    await page.getByRole('button', { name: 'Продлить', exact: true }).first().click(); await sleep(1500);
    await page.getByRole('button', { name: /^30 минут/ }).click(); await sleep(1200);
    const modal = page.getByText('Продлить сессию', { exact: true }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]');
    const clip = await region([modal], 20); clip.height = 1180 - clip.y;
    const balance = page.getByText('Минуты с баланса', { exact: true }).locator('../../..');
    const plus = balance.getByRole('button').last();
    await moveTo(280, 1100, 10);
    await step('min-start');
    await record('minutes');
    await sleep(1200);
    for (let i = 0; i < 3; i++) await tap(plus, { after: 800 });
    await sleep(2200);
    await step('min-plus');
    await hideCursor();
    if (!DRY) await stop({ clip, poster: 4.5 });
    await page.setViewportSize({ width: 560, height: 1000 });
  },
  async returnvisit() {
    await page.goto(BASE + '/app/main'); await sleep(2500);
    const banner = page.getByRole('region', { name: 'Скидка на повторное посещение' });
    await scrollTo(banner, 28);
    await moveTo(280, 950, 10);
    await record('returnvisit');
    await sleep(1500);
    await tap(banner.getByRole('button', { name: 'Выбрать время' }), { after: 1800 });
    await step('ret-banner');
    const card = boothCard('МИТ · У парка');
    await tap(card.getByRole('button', { name: 'Забронировать', exact: true }), { after: 2600 });
    await step('ret-book');
    const day = new Date(); day.setDate(day.getDate() + 2);
    await tap(page.getByRole('button', { name: String(day.getDate()), exact: true }).first(), { after: 1500 });
    await tap(page.getByRole('button', { name: '16:00', exact: true }).first(), { after: 1400 });
    await tap(page.getByRole('button', { name: /^Подтвердить/ }).first(), { after: 2000 });
    const discount = page.getByText(/Скидка на повторное посещение −/).first();
    await discount.waitFor();
    await scrollTo(discount, 120, 'smooth'); await sleep(2600);
    await step('ret-discount');
    await hideCursor();
    if (!DRY) await stop({ poster: 11, maxSeconds: 60 });
  },
};

try {
  for (const name of (only.length ? only : Object.keys(scenarios))) {
    console.log('--- ' + name);
    await scenarios[name]();
  }
} finally { await r.close(); }
