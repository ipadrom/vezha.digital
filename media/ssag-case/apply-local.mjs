import { readFile } from 'node:fs/promises';

// Local content update through the same save/publish endpoints as the admin builder.
// No production host argument and no credentials written to disk or logs.
const api = 'http://localhost:8000/api';
const patch = JSON.parse(await readFile(new URL('./content.json', import.meta.url), 'utf8'));
let token;
async function request(path, method = 'GET', body) {
  const response = await fetch(`${api}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}`);
  return response.json();
}

token = (await request('/admin/auth/dev-login', 'POST')).access_token;
const cases = await request('/admin/cases');
const matches = cases.filter(item => item.slug === 'ssag');
if (matches.length !== 1) throw new Error('Expected exactly one existing local SSAG case');
const path = `/admin/cases/${matches[0].id}`;
const doc = await request(path);
for (const type of Object.keys(patch.blocks)) {
  if (doc.blocks.filter(block => block.type === type).length !== 1) {
    throw new Error(`Expected one existing ${type} block; inspect the case before applying`);
  }
}
const updated = {
  meta: { ...doc.meta, ...patch.meta },
  blocks: doc.blocks.map(block => {
    const change = patch.blocks[block.type];
    if (!change) return block;
    const next = { ...block, settings: { ...block.settings, ...change.settings } };
    for (const locale of ['ru', 'en']) {
      const key = `content_${locale}`;
      next[key] = { ...block[key], ...change[key] };
      if (block.type === 'technologies') {
        next[key].items = next[key].items.map(item => ({
          ...item,
          description: patch.technology_descriptions[locale][item.id] ?? item.description,
        }));
      }
    }
    return next;
  }),
};
// Check every replacement asset before changing the document.
const urls = new Set(JSON.stringify(updated).match(/\/cases\/ssag\/2026-09\/[^"\s]+/g));
for (const url of urls) {
  const asset = await fetch(`http://localhost:3000${url}`, { method: 'HEAD' });
  if (!asset.ok) throw new Error(`Missing local media: ${url}`);
}
await request(path, 'PUT', updated);
await request(`${path}/publish`, 'POST');
const saved = await request(path);
if (saved.blocks.length !== doc.blocks.length || saved.meta.slug !== 'ssag') {
  throw new Error('Saved document did not match the expected case structure');
}
console.log(`Updated local SSAG: ${saved.blocks.length} existing builder blocks, ${urls.size} media files.`);
console.log('Public case: http://localhost:3000/cases/ssag');
console.log(`Admin builder: http://localhost:3000/admin/cases/${doc.id}`);
