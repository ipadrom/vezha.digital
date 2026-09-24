import { readFile, writeFile } from 'node:fs/promises';
export const BASE = 'http://localhost:3080';

// Sandbox login through the stand's own API. The token is cached in the scratchpad
// (synthetic sandbox account only) so repeated runs do not hit the OTP rate limit.
export async function login(page, phone) {
  const cache = new URL(`./auth-${phone}.json`, import.meta.url);
  let auth = null;
  try {
    auth = JSON.parse(await readFile(cache, 'utf8'));
    const me = await fetch(BASE + '/api/auth/me', { headers: { Authorization: `Bearer ${auth.access_token}` } });
    if (!me.ok) auth = null;
  } catch { auth = null; }
  if (!auth) {
    const post = async (path, body) => {
      const r = await fetch(BASE + '/api/auth' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`Sandbox login HTTP ${r.status} for ${path}`);
      return r.json();
    };
    await post('/login', { phone, channel: 'sms' });
    auth = await post('/login/verify', { phone, code: '1111' });
    await writeFile(cache, JSON.stringify(auth));
  }
  await page.goto(BASE);
  await page.evaluate(({ access_token, user }) => localStorage.setItem('mymit-storage', JSON.stringify({ state: { authToken: access_token, currentUser: user, isAuthenticated: true }, version: 0 })), auth);
  return auth;
}
