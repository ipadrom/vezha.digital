// Split-screen scenarios: the work center on the left, the real MAX web chat on the right.
// Needs serve_live.py on 127.0.0.1:8098 (owner's GREEN-API instance, local storage, demo groups only)
// and a signed-in web.max.ru profile in max-profile/ (created once with max-login.mjs).
// Usage: node live.mjs [source|final]. `final` really sends the loaded orders to the demo ФОТО СБОРА ФИНАЛ group.
import { readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import { start, OUT } from './recorder.mjs';
import { createCapture, sideBySide } from './capture.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = 'http://localhost:8098';
// Demo group links live in git-ignored live-groups.json ({ elite, final, photo_control }).
const GROUPS = JSON.parse(await readFile(new URL('./live-groups.json', import.meta.url), 'utf8'));
const CHAT_TITLES = { elite: 'Элит демо', final: 'Фото сбора финал демо' };
const only = process.argv.slice(2);
const auth = JSON.parse(await readFile(new URL('./live-auth.json', import.meta.url), 'utf8'));

// Left side: the application, recorded with the shared recorder (cursor, taps, typing).
const app = await start({ width: 920, height: 1240 });
const { page, tap, sleep, record, stop, moveTo, hideCursor, region } = app;
page.on('dialog', d => d.accept());
await app.context.addInitScript(() => { window.confirm = () => true; });
await page.goto(`${BASE}/login`); await page.fill('#password', auth.password); await page.click('form button'); await page.waitForURL(u => !u.pathname.startsWith('/login'));

// Right side: web.max.ru in the saved profile, cropped to the conversation pane only (never the chat list).
const maxContext = await chromium.launchPersistentContext(fileURLToPath(new URL('./max-profile/', import.meta.url)), { headless: true, viewport: { width: 1320, height: 1000 }, deviceScaleFactor: 2, locale: 'ru-RU', timezoneId: 'Europe/Moscow' });
const chat = maxContext.pages()[0] || await maxContext.newPage();
const chatCapture = await createCapture(chat, { dpr: 2, outDir: OUT });
async function openChat(key) {
  await chat.goto('https://web.max.ru/'); await chat.waitForTimeout(5000);
  await chat.getByText(CHAT_TITLES[key], { exact: true }).first().click();
  await chat.waitForURL(u => u.href.startsWith(GROUPS[key])); await chat.waitForTimeout(3000);
  await chat.locator('.scrollListScrollable').first().evaluate(el => { el.scrollTop = el.scrollHeight; }); await chat.waitForTimeout(800);
  const pane = await chat.locator('.openedChat').first().boundingBox();
  return { x: Math.floor(pane.x), y: 0, width: Math.floor(pane.width), height: 1000 };
}
async function setValue(id, value) {
  await page.evaluate(([id, value]) => { const el = document.getElementById(id); el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, [id, value]);
}
async function openConverter() {
  await page.goto(`${BASE}/#converter`); await page.locator('#view-converter').waitFor({ state: 'visible' }); await sleep(1500);
  await page.evaluate(() => { document.body.style.overflowAnchor = 'none'; const d = document.createElement('div'); d.style.height = '1400px'; document.body.appendChild(d); });
  await setValue('source-chat-link', GROUPS.elite); await setValue('orders-chat-link', GROUPS.final); await sleep(300);
}
async function loadFromChat() {
  await page.getByRole('button', { name: 'Загрузить с чатов' }).click();
  await page.locator('#source-import-status').filter({ hasText: /Добавлено/ }).waitFor({ timeout: 60000 });
  if (await page.locator('.short-block').count() < 4) throw new Error('Expected the four demo orders');
}
async function finish(name, appClip, chatClip, { poster = 0.5, maxSeconds = 60 } = {}) {
  await hideCursor(); await sleep(400);
  const [left, right] = [await stop({ clip: appClip, poster, maxSeconds }), await chatCapture.stop({ clip: chatClip, maxSeconds })];
  const leftInfo = { mp4: left, start: app.lastStart, duration: 0 };
  sideBySide(leftInfo, right, path.join(OUT, `${name}.mp4`), { poster });
  for (const f of [left, left.replace(/\.mp4$/, '.jpg'), right.mp4]) await rm(f, { force: true });
}

const scenarios = {
  // Orders in the right format: the source chat with crewed orders on the right, the app reads it on the left.
  async source() {
    const chatClip = await openChat('elite');
    await openConverter();
    const h1 = page.locator('.converter-zone h1');
    await h1.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 24 })); await sleep(400);
    await moveTo(700, 1100, 10);
    await chatCapture.record('source-live-chat'); await record('source-live-app'); app.lastStart = performance.now() / 1000;
    await sleep(1200);
    await tap(page.getByRole('button', { name: 'Загрузить с чатов' }), { after: 400 });
    await page.locator('.short-block').nth(3).waitFor({ timeout: 60000 }); await sleep(3000);
    const appClip = await region([h1, page.locator('.short-block').last()], 24);
    await finish('source-live', appClip, chatClip, { poster: 0.6 });
  },
  // Sending to ФОТО СБОРА ФИНАЛ: every message lands in the real demo group while the counter grows.
  async final() {
    await openConverter(); await loadFromChat();
    await page.locator('#source-import-status').evaluate(el => { el.textContent = ''; });
    const chatClip = await openChat('final');
    const h1 = page.locator('.converter-zone h1');
    await h1.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 24 })); await sleep(400);
    const appClip = await region([h1, page.locator('.converter-results')], 24);
    await moveTo(700, 1100, 10);
    await chatCapture.record('final-live-chat'); await record('final-live-app'); app.lastStart = performance.now() / 1000;
    await sleep(1200);
    await tap(page.locator('.action-menu > summary'), { after: 900 });
    await tap(page.getByRole('button', { name: 'Отправить в «ФОТО СБОРА ФИНАЛ»' }), { after: 600 });
    await page.locator('#operation-status.done, #operation-status.error').waitFor({ timeout: 120000 });
    console.log('operation:', await page.locator('#operation-status').innerText());
    await sleep(3500);
    await finish('final-live', appClip, chatClip, { poster: 1.0, maxSeconds: 90 });
  },
};
for (const name of Object.keys(scenarios)) {
  if (only.length && !only.includes(name)) continue;
  console.log(`--- ${name}`);
  await scenarios[name]();
}
await maxContext.close(); await app.close();
