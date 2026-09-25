// Apply the technology-stack patch (backend/alembic/data/case_stacks_20260925.json) to the LOCAL cases
// through the admin API, with the same merge-by-id rules as migration x0g1b2c3d4e5. Never touches production.
import { readFile } from 'node:fs/promises';

const api = 'http://localhost:8000/api';
const { cases } = JSON.parse(await readFile(new URL('../backend/alembic/data/case_stacks_20260925.json', import.meta.url), 'utf8'));
let token;
async function request(path, method = 'GET', body) {
  const res = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}
token = (await request('/admin/auth/dev-login', 'POST')).access_token;
const all = await request('/admin/cases');
for (const [slug, patch] of Object.entries(cases)) {
  const found = all.filter(c => c.slug === slug);
  if (found.length !== 1) throw new Error(`Expected one local case ${slug}`);
  const path = `/admin/cases/${found[0].id}`;
  const doc = await request(path);
  for (const block of doc.blocks) {
    if (block.type !== 'technologies') continue;
    for (const lang of ['ru', 'en']) {
      const content = block['content_' + lang];
      if (patch.summary) content.summary = patch.summary[lang];
      const items = content.items || [];
      for (const entry of patch.items) {
        const existing = items.find(i => i.id === entry.id);
        const fields = { ...(entry.icon ? { icon: entry.icon } : {}), ...(entry.related_ids ? { related_ids: [...entry.related_ids] } : {}), ...(entry[lang] || {}) };
        if (existing) Object.assign(existing, fields);
        else if (entry[lang]) items.push({ x: null, y: null, category: '', id: entry.id, ...fields });
      }
      content.items = items;
    }
  }
  await request(path, 'PUT', { meta: doc.meta, blocks: doc.blocks });
  await request(path + '/publish', 'POST');
  const saved = await request(path);
  const stack = saved.blocks.find(b => b.type === 'technologies').content_ru.items;
  console.log(`${slug}: ${stack.length} technologies, ${stack.filter(i => i.related_ids?.length).length} with links, published locally.`);
}
