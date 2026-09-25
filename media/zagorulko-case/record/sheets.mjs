// Google Sheets scenarios for the Zagorulko case, recorded from the staged workbook in ../sheet-stand/index.html.
// Usage: node sheets.mjs [update|checks|rerun ...]; DRY=1 stores step screenshots instead of video.
// The stand repeats the real script's menu, status and alert texts; no Google account or MAX chat is involved.
import { start, OUT } from './recorder.mjs';
import path from 'node:path';

const DRY = !!process.env.DRY;
const only = process.argv.slice(2);
const URL_ = new URL('../sheet-stand/index.html', import.meta.url).href;
const WIDTH = 1180, HEIGHT = 820;
const r = await start({ width: WIDTH, height: HEIGHT });
const { page, context, tap, sleep, record: startRecording, stop, moveTo, hideCursor } = r;
const record = async (name) => { if (!DRY) await startRecording(name); };
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await context.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
let stepNo = 0;
const step = async (label) => { if (DRY) await page.screenshot({ path: path.join(OUT, `dry-${label}-${++stepNo}.png`) }); };
const clip = { x: 0, y: 0, width: WIDTH, height: HEIGHT };

async function open(scenario) {
  await page.goto(URL_); await page.evaluate(s => window.stand.setup(s), scenario); await sleep(700);
  await moveTo(700, 640, 10);
}
const cell = ref => page.locator(`td[data-ref="${ref}"]`);
async function runFromMenu() {
  await tap(page.locator('#menu-orders'), { after: 900 });
  await tap(page.locator('[data-action="update"]'), { after: 400 });
}
async function waitAlertAndClose(label) {
  await page.locator('#modal.on').waitFor({ timeout: 30000 }); await sleep(2200);
  await step(label);
  await tap(page.locator('#modal-ok'), { after: 1500 });
}

const scenarios = {
  // Updating a period: run the menu command, watch the service status and the period sheet fill in.
  async update() {
    await open('update');
    await step('update-start');
    await record('sheet-update');
    await sleep(900);
    await runFromMenu();
    await page.locator('.tab.active', { hasText: '26-1-15сентябрь' }).waitFor({ timeout: 30000 });
    await step('update-sheet');
    await waitAlertAndClose('update-alert');
    await hideCursor(); await sleep(300);
    if (!DRY) await stop({ clip, poster: 0.5, maxSeconds: 40 });
  },
  // Reviewing exceptions: the held order gets approved from the sheet button.
  async checks() {
    await open('checks');
    await step('checks-start');
    await record('sheet-checks');
    await sleep(1400);
    await tap(page.locator('#approve-btn'), { after: 400 });
    await waitAlertAndClose('checks-alert');
    await hideCursor(); await sleep(300);
    if (!DRY) await stop({ clip, poster: 0.5, maxSeconds: 40 });
  },
  // Repeat updates: a manual note outside the managed block survives, new names get flagged.
  async rerun() {
    await open('rerun');
    await step('rerun-start');
    await record('sheet-rerun');
    await sleep(900);
    await tap(cell('E5'), { after: 500 });
    await page.keyboard.type('аванс выдан 15.09', { delay: 90 }); await sleep(500);
    await page.keyboard.press('Enter'); await sleep(900);
    await step('rerun-note');
    await runFromMenu();
    await page.locator('td[data-ref="A17"]', { hasText: 'Росин' }).waitFor({ timeout: 30000 });
    await waitAlertAndClose('rerun-alert');
    await hideCursor(); await sleep(300);
    if (!DRY) await stop({ clip, poster: 0.5, maxSeconds: 40 });
  },
};
for (const name of Object.keys(scenarios)) {
  if (only.length && !only.includes(name)) continue;
  console.log(`--- ${name}`);
  await scenarios[name]();
}
await r.close();
if (errors.length) { console.error('Page errors:', errors); process.exit(1); }
