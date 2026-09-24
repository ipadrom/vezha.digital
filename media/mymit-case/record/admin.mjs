// Admin-side scenarios recorded from the isolated MyMIT sandbox (dev branch).
import path from 'node:path';
import { start, OUT } from './recorder.mjs';
import { login, BASE } from './common.mjs';

const DRY = !!process.env.DRY;
const only = process.argv.slice(2);
const r = await start({ width: 1680, height: 1000 });
const { page, tap, type, sleep, region, record, stop, moveTo, hideCursor } = r;
let stepNo = 0;
const step = async (label) => { if (DRY) await page.screenshot({ path: `dry-${label}-${++stepNo}.png` }); };
await login(page, '79990000001');
const X0 = 280, X1 = 1640;
const band = async (top, bottom, pad = 24) => {
  const a = await top.boundingBox(), b = await bottom.boundingBox();
  const y = Math.max(0, a.y - pad);
  const x = Math.max(0, Math.min(a.x, b.x) - pad), right = Math.min(1680, Math.max(a.x + a.width, b.x + b.width) + pad);
  return { x, y, width: right - x, height: Math.min(1000, b.y + b.height + pad) - y };
};
async function selectWithCursor(select, label) {
  await tap(select, { after: 500 });
  await page.keyboard.press('Escape');
  await select.selectOption({ label });
}

const scenarios = {
  async analytics() {
    await page.goto(BASE + '/admin/analytics'); await sleep(4000);
    const period = page.getByText('Период', { exact: true }).first();
    const chart = page.getByText('Время оформления брони', { exact: true }).locator('xpath=ancestor::div[contains(@class,"rounded")][1]');
    const heading = page.getByRole('heading', { name: 'Аналитика по кабинкам' });
    await moveTo(900, 950, 10);
    await step('an-start');
    await record('analytics');
    await sleep(1200);
    await tap(page.getByRole('button', { name: 'Неделя', exact: true }), { after: 2600 });
    await step('an-week');
    const booth = page.getByRole('combobox').last();
    await booth.locator('option', { hasText: 'МИТ · У парка' }).waitFor({ state: 'attached' });
    await selectWithCursor(booth, 'МИТ · У парка');
    await page.getByText('Обновление аналитики', { exact: true }).waitFor({ state: 'hidden' }).catch(() => {});
    await sleep(3000);
    await step('an-booth');
    await hideCursor();
    // The layout grows after the period switch, so the clip is measured at the end.
    const clip = await band(heading, chart, 20); clip.x += 14; clip.width -= 14;
    clip.y = Math.min(clip.y, (await period.boundingBox()).y - 24); clip.height = (await chart.boundingBox()).y + (await chart.boundingBox()).height + 24 - clip.y;
    if (!DRY) await stop({ clip, poster: 6 });
  },
  async bookings() {
    await page.goto(BASE + '/admin/bookings'); await sleep(3500);
    await page.getByText('Загрузка...', { exact: true }).waitFor({ state: 'hidden' }).catch(() => {});
    const search = page.getByRole('textbox').first();
    const row3 = page.locator('tbody tr').nth(2);
    const clip = await band(search, row3, 24);
    await moveTo(900, 950, 10);
    await step('bk-start');
    await record('admin-bookings');
    await sleep(1000);
    const booth = page.getByRole('combobox').first();
    await selectWithCursor(booth, 'МИТ · У парка');
    await page.getByText('Загрузка...', { exact: true }).waitFor({ state: 'hidden' }).catch(() => {});
    await sleep(2600);
    await step('bk-booth');
    await type(search, 'Демо', { delay: 130, after: 2600 });
    await step('bk-search');
    await hideCursor();
    if (!DRY) await stop({ clip, poster: 4 });
  },
  async returnvisits() {
    await page.setViewportSize({ width: 1100, height: 1000 });
    await page.goto(BASE + '/admin/return-visits'); await sleep(3500);
    await page.getByRole('button', { name: 'Новая кампания', exact: true }).click(); await sleep(600);
    await page.getByLabel('Название').fill('Возвращение в МИТ · осень');
    const heading = page.getByRole('heading', { name: 'Скидка на повторное посещение' });
    const form = page.locator('form');
    await heading.scrollIntoViewIfNeeded();
    const a = await heading.boundingBox(), b = await form.boundingBox();
    await page.screenshot({ path: path.join(OUT, 'return-visits-admin.png'), clip: { x: a.x - 24, y: a.y - 24, width: Math.min(1100 - a.x + 24, b.x + b.width - a.x + 48), height: Math.min(1000, b.y + b.height + 24) - a.y + 24 } });
    console.log('Captured return-visits-admin.png');
    await page.setViewportSize({ width: 1680, height: 1000 });
  },
};

try {
  for (const name of (only.length ? only : Object.keys(scenarios))) { console.log('--- ' + name); await scenarios[name](); }
} finally { await r.close(); }
