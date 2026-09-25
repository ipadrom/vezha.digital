// Attach the recorded clips to the LOCAL Zagorulko case through the admin API, matching items by title.
// Reads the same patch as migration w9f0a1b2c3d4; never touches production, migrations or Git.
import { readFile } from 'node:fs/promises';

const api = 'http://localhost:8000/api';
const patch = JSON.parse(await readFile(new URL('../../backend/alembic/data/zagorulko_videos_20260925.json', import.meta.url), 'utf8'));
let token;
async function request(path, method = 'GET', body) {
  const res = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}
token = (await request('/admin/auth/dev-login', 'POST')).access_token;
const cases = (await request('/admin/cases')).filter(c => c.slug === patch.slug);
if (cases.length !== 1) throw new Error('Expected one local Zagorulko case');
const path = `/admin/cases/${cases[0].id}`;
const doc = await request(path);
let touched = 0;
for (const block of doc.blocks) {
  if (block.type === 'results') for (const lang of ['ru', 'en']) for (const item of block['content_' + lang]?.items || []) item.title = patch.results?.[lang]?.[item.title] ?? item.title;
  if (block.type !== 'process') continue;
  for (const lang of ['ru', 'en']) {
    for (const item of block['content_' + lang]?.items || []) {
      const entry = patch.items.find(e => e.title[lang] === item.title);
      if (!entry) continue;
      const base = patch.media_dir + entry.clip;
      Object.assign(item, { media_type: 'video', image_url: '', video_url: base + '.mp4', poster_url: base + '.jpg', media_size: 'full', media_layout: 'default', media_note: entry.media_note[lang] });
      if (entry.media_caption) item.media_caption = entry.media_caption[lang];
      touched++;
    }
  }
}
if (touched !== patch.items.length * 2) throw new Error(`Matched ${touched} items, expected ${patch.items.length * 2}`);
await request(path, 'PUT', { meta: doc.meta, blocks: doc.blocks });
await request(path + '/publish', 'POST');
const saved = await request(path);
const videos = saved.blocks.flatMap(b => ['ru', 'en'].flatMap(l => (b['content_' + l]?.items || []).filter(i => i.media_type === 'video').map(i => i.video_url)));
console.log(`Attached ${touched} clips locally; ${new Set(videos).size} distinct videos in the published case.`);
