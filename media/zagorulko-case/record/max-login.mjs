// Opens web.max.ru in a headed Chromium with a persistent profile so the owner can sign in once.
// The profile (max-profile/) is git-ignored and used only by live.mjs; no credentials are typed by scripts.
// STATE_DIR receives a screenshot every few seconds so the operator can follow the sign-in without the window.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const profile = fileURLToPath(new URL('./max-profile/', import.meta.url));
const stateDir = process.env.STATE_DIR || '.';
const context = await chromium.launchPersistentContext(profile, { headless: false, viewport: { width: 1000, height: 900 }, locale: 'ru-RU', args: ['--window-position=80,60'] });
const page = context.pages()[0] || await context.newPage();
await page.goto('https://web.max.ru/');
await page.bringToFront();
console.log('Окно открыто. Войдите в MAX; скрипт закроется сам после входа.');
const deadline = Date.now() + 20 * 60 * 1000;
let done = false;
while (Date.now() < deadline && !done) {
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${stateDir}/max-state.png` }).catch(() => {});
  const text = await page.evaluate(() => document.body.innerText).catch(() => '');
  console.log(new Date().toISOString().slice(11, 19), page.url(), JSON.stringify(text.slice(0, 120)));
  done = /Элит демо|Фото сбора|Фото контроль/i.test(text) && !/QR/i.test(text.slice(0, 300));
}
console.log(done ? 'Вход выполнен, профиль сохранён.' : 'Время ожидания вышло.');
await context.close();
