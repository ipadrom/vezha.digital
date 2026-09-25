// Frame capture for a second page (the MAX web chat) and side-by-side assembly of two recordings.
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const run = (args) => { const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('ffmpeg failed: ' + args.join(' ')); };

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

// Captures device-pixel frames of `page` through its own CDP session; `stop` writes an mp4 (no poster).
export async function createCapture(page, { dpr = 2, outDir }) {
  const cdp = await page.context().newCDPSession(page);
  let rec = null;
  const loop = (cur) => {
    cur.running = true;
    cur.loop = (async () => {
      while (cur.running) {
        const t = performance.now() / 1000;
        try {
          const { result } = await cdp.send('Runtime.evaluate', { expression: '[scrollX, scrollY]', returnByValue: true });
          const [sx, sy] = result.value;
          const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: sx, y: sy, width: cur.vp.width, height: cur.vp.height, scale: dpr } });
          cur.frames.push({ data, t });
        } catch { await new Promise(r => setTimeout(r, 30)); }
      }
    })();
  };
  return {
    async record(name) { if (rec) { rec.running = false; await rec.loop; } rec = { name, frames: [], vp: page.viewportSize() }; loop(rec); },
    async stop({ clip, fps = 30, maxSeconds = 60 } = {}) {
      rec.running = false; await rec.loop;
      const { name, frames, vp } = rec; rec = null;
      if (frames.length < 2) throw new Error(`Too few frames for ${name}`);
      const dir = path.join(outDir, `frames-${name}`);
      await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true });
      const lines = [];
      for (let i = 0; i < frames.length; i++) {
        const f = path.join(dir, `f${String(i).padStart(5, '0')}.jpg`);
        await writeFile(f, Buffer.from(frames[i].data, 'base64'));
        const next = i + 1 < frames.length ? frames[i + 1].t : frames[i].t + 0.6;
        lines.push(`file '${f}'`, `duration ${Math.max(0.016, Math.min(next - frames[i].t, 4)).toFixed(4)}`);
      }
      lines.push(`file '${path.join(dir, `f${String(frames.length - 1).padStart(5, '0')}.jpg`)}'`);
      const list = path.join(dir, 'list.txt'); await writeFile(list, lines.join('\n') + '\n');
      const { W, H } = jpegSize(Buffer.from(frames[0].data, 'base64'));
      const sx = W / vp.width, sy = H / vp.height, vf = [];
      if (clip) vf.push(`crop=${Math.min(Math.floor(clip.width * sx), W - Math.floor(clip.x * sx))}:${Math.min(Math.floor(clip.height * sy), H - Math.floor(clip.y * sy))}:${Math.floor(clip.x * sx)}:${Math.floor(clip.y * sy)}`);
      vf.push('scale=trunc(iw/2)*2:trunc(ih/2)*2', `fps=${fps}`, 'format=yuv420p');
      const mp4 = path.join(outDir, `${name}.mp4`);
      run(['-f', 'concat', '-safe', '0', '-i', list, '-t', String(maxSeconds), '-vf', vf.join(','), '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-movflags', '+faststart', '-an', mp4]);
      await rm(dir, { recursive: true, force: true });
      return { mp4, start: frames[0].t, duration: frames[frames.length - 1].t - frames[0].t };
    },
  };
}

// Places two clips side by side, aligned on the same start time, scaled to the same height, with a gap between them.
export function sideBySide(left, right, out, { height = 1200, gap = 24, poster = 0.5, background = '#101214' } = {}) {
  const offset = right.start - left.start; // seconds; positive when the right clip started later
  const pad = (secs) => secs > 0.02 ? `tpad=start_duration=${secs.toFixed(3)}:color=${background},` : '';
  const filter = `[0:v]${pad(-offset)}scale=-2:${height}[l];[1:v]${pad(offset)}scale=-2:${height}[r];[l][r]hstack=inputs=2:shortest=1[v]`;
  const gapFilter = `[0:v]${pad(-offset)}scale=-2:${height},pad=iw+${gap}:ih:0:0:${background}[l];[1:v]${pad(offset)}scale=-2:${height}[r];[l][r]hstack=inputs=2:shortest=1[v]`;
  run(['-i', left.mp4, '-i', right.mp4, '-filter_complex', gap ? gapFilter : filter, '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-movflags', '+faststart', '-an', out]);
  run(['-ss', String(poster), '-i', out, '-frames:v', '1', '-q:v', '3', out.replace(/\.mp4$/, '.jpg')]);
  return out;
}
