// Screen recorder for Zagorulko case videos (same pipeline as media/mymit-case/record): CDP screencast frames -> ffmpeg mp4.
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');

// Recordings land next to the other case fragments unless OUT_DIR overrides it.
export const OUT = process.env.OUT_DIR || fileURLToPath(new URL('../../../frontend/public/cases/gbu-process-automation/2026-09/', import.meta.url));
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const cursorScript = `(() => {
  if (window.__cursor) return;
  const c = document.createElement('div');
  c.id = '__demo-cursor';
  Object.assign(c.style, {position:'fixed',left:'0px',top:'0px',width:'34px',height:'34px',marginLeft:'-17px',marginTop:'-17px',
    borderRadius:'50%',background:'rgba(255,255,255,0.28)',border:'2px solid rgba(255,255,255,0.85)',boxShadow:'0 2px 10px rgba(0,0,0,0.35)',
    pointerEvents:'none',zIndex:'2147483647',opacity:'0',transition:'transform 140ms ease, opacity 200ms ease',transform:'scale(1)'});
  const attach = () => { if (document.body && !c.isConnected) document.body.appendChild(c); };
  attach(); if (document.documentElement) new MutationObserver(attach).observe(document.documentElement, {childList:true});
  window.__cursor = {
    move(x,y){ attach(); c.style.opacity='1'; c.style.left=x+'px'; c.style.top=y+'px'; },
    press(){ c.style.transform='scale(0.62)'; c.style.background='rgba(255,76,0,0.55)'; },
    release(){ c.style.transform='scale(1)'; c.style.background='rgba(255,255,255,0.28)'; },
    hide(){ c.style.opacity='0'; },
  };
})();`;

function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { H: buf.readUInt16BE(i + 5), W: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('JPEG size not found');
}

export async function start({ width = 560, height = 1000, dpr = 2, headless = true } = {}) {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, locale: 'ru-RU', timezoneId: 'Europe/Moscow', hasTouch: false, serviceWorkers: 'block' });
  await context.addInitScript(cursorScript);
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const cdp = await context.newCDPSession(page);
  let rec = null;
    const pos = { x: width / 2, y: height / 2 };
  const sleep = (ms) => page.waitForTimeout(ms);

  async function moveTo(x, y, ms = 420) {
    const steps = Math.max(8, Math.round(ms / 16));
    const sx = pos.x, sy = pos.y;
    for (let i = 1; i <= steps; i++) {
      const k = i / steps, e = k < 0.5 ? 2 * k * k : -1 + (4 - 2 * k) * k; // ease in-out
      const nx = sx + (x - sx) * e, ny = sy + (y - sy) * e;
      await page.evaluate(([a, b]) => window.__cursor?.move(a, b), [nx, ny]);
      await page.mouse.move(nx, ny);
      await sleep(16);
    }
    pos.x = x; pos.y = y;
  }
  async function center(locator) {
    await locator.scrollIntoViewIfNeeded();
    const b = await locator.boundingBox();
    if (!b) throw new Error('No bounding box for locator');
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }
  async function tap(locator, { hold = 130, after = 700, offset } = {}) {
    let { x, y } = await center(locator);
    if (offset) { x += offset.x || 0; y += offset.y || 0; }
    await moveTo(x, y);
    await page.evaluate(() => window.__cursor?.press());
    await page.mouse.down();
    await sleep(hold);
    await page.mouse.up();
    await page.evaluate(() => window.__cursor?.release());
    await sleep(after);
  }
  async function type(locator, text, { delay = 95, after = 600 } = {}) {
    await tap(locator, { after: 250 });
    await page.keyboard.type(text, { delay });
    await sleep(after);
  }
  async function hideCursor() { await page.evaluate(() => window.__cursor?.hide()); }

  // Device-pixel frames via captureScreenshot (the screencast API only yields CSS-pixel frames).
  function captureLoop(cur) {
    cur.running = true;
    cur.loop = (async () => {
      while (cur.running) {
        const t = performance.now() / 1000;
        try {
          // The clip is page-relative, so follow the current scroll offset to capture the visible viewport.
          const { result } = await cdp.send('Runtime.evaluate', { expression: '[scrollX, scrollY]', returnByValue: true });
          const [sx, sy] = result.value;
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: sx, y: sy, width: cur.vp.width, height: cur.vp.height, scale: dpr } });
          cur.frames.push({ data, t });
        } catch { await new Promise(r => setTimeout(r, 30)); }
      }
    })();
  }
  async function record(name) {
    if (rec) { rec.running = false; await rec.loop; }
    const vp = page.viewportSize();
    rec = { name, frames: [], running: false, vp };
    captureLoop(rec);
    await sleep(150);
  }
  // Suspend frame capture across a navigation (a reload would stall the screenshot call); the last frame is held meanwhile.
  async function pause() { if (!rec) return; rec.running = false; await rec.loop; }
  async function resume() { if (rec && !rec.running) captureLoop(rec); }
  // clip: {x,y,width,height} in CSS px. poster: seconds into the clip for the poster image.
  async function stop({ clip, poster = 0.2, fps = 30, maxSeconds = 40 } = {}) {
    await sleep(500);
    rec.running = false; await rec.loop;
    const { name, frames, vp } = rec; rec = null;
    if (frames.length < 2) throw new Error(`Too few frames for ${name}`);
    const dir = path.join(OUT, `frames-${name}`);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    const t0 = frames[0].t;
    const lines = [];
    for (let i = 0; i < frames.length; i++) {
      const f = path.join(dir, `f${String(i).padStart(5, '0')}.jpg`);
      await writeFile(f, Buffer.from(frames[i].data, 'base64'));
      const next = i + 1 < frames.length ? frames[i + 1].t : frames[i].t + 0.6;
      lines.push(`file '${f}'`, `duration ${Math.max(0.016, Math.min(next - frames[i].t, 4)).toFixed(4)}`);
    }
    lines.push(`file '${path.join(dir, `f${String(frames.length - 1).padStart(5, '0')}.jpg`)}'`);
    const list = path.join(dir, 'list.txt');
    await writeFile(list, lines.join('\n') + '\n');
    const vf = [];
    // Actual frame size from the first PNG header; the screencast may scale frames.
    const first = Buffer.from(frames[0].data, 'base64');
    const { W, H } = jpegSize(first);
    const sx = W / vp.width, sy = H / vp.height;
    console.log(`frames ${W}x${H} (scale ${sx.toFixed(3)})`);
    if (clip) {
      const cx = Math.max(0, Math.floor(clip.x * sx)), cy = Math.max(0, Math.floor(clip.y * sy));
      const cw = Math.min(Math.floor(clip.width * sx), W - cx), ch = Math.min(Math.floor(clip.height * sy), H - cy);
      vf.push(`crop=${cw}:${ch}:${cx}:${cy}`);
    }
    vf.push('scale=trunc(iw/2)*2:trunc(ih/2)*2', `fps=${fps}`, 'format=yuv420p');
    const mp4 = path.join(OUT, `${name}.mp4`);
    const run = (args) => { const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('ffmpeg failed: ' + args.join(' ')); };
    run(['-f', 'concat', '-safe', '0', '-i', list, '-t', String(maxSeconds), '-vf', vf.join(','), '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-movflags', '+faststart', '-an', mp4]);
    const jpg = path.join(OUT, `${name}.jpg`);
    run(['-ss', String(poster), '-i', mp4, '-frames:v', '1', '-q:v', '3', jpg]);
    await rm(dir, { recursive: true, force: true });
    const dur = frames[frames.length - 1].t - t0;
    console.log(`Recorded ${name}: ${frames.length} frames, ${dur.toFixed(1)}s -> ${mp4}`);
    return mp4;
  }
  // Region covering the given locators with padding, clamped to the viewport.
  async function region(locators, pad = 24) {
    const boxes = [];
    for (const l of locators) { const b = await l.boundingBox(); if (b) boxes.push(b); }
    const x = Math.max(0, Math.min(...boxes.map(b => b.x)) - pad), y = Math.max(0, Math.min(...boxes.map(b => b.y)) - pad);
    const r = Math.min(width, Math.max(...boxes.map(b => b.x + b.width)) + pad), bt = Math.min(height, Math.max(...boxes.map(b => b.y + b.height)) + pad);
    return { x, y, width: r - x, height: bt - y };
  }
  async function close() { await browser.close(); }
  return { browser, context, page, cdp, sleep, moveTo, tap, type, hideCursor, record, pause, resume, stop, region, close, width, height };
}
