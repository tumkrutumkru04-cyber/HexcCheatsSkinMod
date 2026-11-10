const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, 'public');
const PUBLIC_URL = (process.env.PUBLIC_URL || 'https://hexcheatsskinmod.up.railway.app').replace(/\/$/, '');
const VIPLINK_API_TOKEN = process.env.VIPLINK_API_TOKEN || '';
const ACCESS_SECRET = process.env.ACCESS_SECRET || crypto.randomBytes(32).toString('hex');
const ACCESS_TTL_SECONDS = 24 * 60 * 60;
const pending = new Map();
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.bin': 'application/octet-stream', '.gz': 'application/gzip', '.ico': 'image/x-icon',
};

function safePath(requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const relative = decoded === '/' ? '/index.html' : decoded;
  const resolved = path.resolve(ROOT, `.${relative}`);
  return resolved.startsWith(ROOT + path.sep) ? resolved : null;
}
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}
function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(v => v.trim().split('=')) .filter(pair => pair.length === 2).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
}
function sign(value) { return crypto.createHmac('sha256', ACCESS_SECRET).update(value).digest('base64url'); }
function makePass() {
  const expires = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;
  const value = `${expires}.${sign(String(expires))}`;
  return { value, expires };
}
function validPass(req) {
  const value = parseCookies(req.headers.cookie).hex_access;
  if (!value) return false;
  const [expires, signature] = value.split('.');
  const expected = Buffer.from(sign(expires)); const received = Buffer.from(signature || ''); return /^\d+$/.test(expires) && Number(expires) > Math.floor(Date.now() / 1000) && received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
async function createVipLink(state) {
  if (!VIPLINK_API_TOKEN) throw new Error('VIPLINK_API_TOKEN is not configured on Railway.');
  const destination = `${PUBLIC_URL}/unlock/complete?state=${encodeURIComponent(state)}`;
  const endpoint = new URL('https://vplink.in/api');
  endpoint.searchParams.set('api', VIPLINK_API_TOKEN);
  endpoint.searchParams.set('url', destination);
  endpoint.searchParams.set('alias', 'hex-skinmod-' + state.slice(0, 8));
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`VIPLINK returned HTTP ${response.status}.`);
  const text = await response.text();
  let result;
  try { result = JSON.parse(text); } catch { result = { shortenedUrl: text.trim() }; }
  if (result.status === 'error') throw new Error(result.message || 'VIPLINK could not create a task link.');
  const shortUrl = result.shortenedUrl || result.shortened_url || result.url || text.trim();
  if (!/^https?:\/\//i.test(shortUrl)) throw new Error('VIPLINK returned an invalid task link.');
  return shortUrl;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '/';
  if (pathname === '/health' || pathname === '/api/health') return json(res, 200, { ok: true, service: 'hex-cheats-skinmod' });
  if (pathname === '/api/access-status') return json(res, 200, { unlocked: validPass(req), expiresIn: validPass(req) ? ACCESS_TTL_SECONDS : 0 });

  if (pathname === '/api/unlock/start') {
    if (req.method !== 'GET') return json(res, 405, { error: 'Method Not Allowed' });
    const state = crypto.randomBytes(18).toString('base64url');
    pending.set(state, Date.now() + 15 * 60 * 1000);
    try { return json(res, 200, { shortUrl: await createVipLink(state) }); }
    catch (error) { pending.delete(state); return json(res, 503, { error: error.message }); }
  }

  if (pathname === '/unlock/complete') {
    const state = String(parsed.query.state || '');
    const expiresAt = pending.get(state);
    pending.delete(state);
    if (!expiresAt || expiresAt < Date.now()) return res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' }) && res.end('<h1>Unlock link expired</h1><p>Return to HEX CHEATS SKINMOD and try again.</p>');
    const pass = makePass();
    res.writeHead(302, { 'Location': '/?unlocked=1#studio', 'Set-Cookie': `hex_access=${encodeURIComponent(pass.value)}; Max-Age=${ACCESS_TTL_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`, 'Cache-Control': 'no-store' });
    return res.end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end('Method Not Allowed'); }
  const filePath = safePath(pathname);
  if (!filePath) { res.writeHead(400); return res.end('Bad Request'); }
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      const fallback = path.join(ROOT, 'index.html');
      fs.readFile(fallback, (error, data) => {
        if (error) { res.writeHead(404); return res.end('Not Found'); }
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        return req.method === 'HEAD' ? res.end() : res.end(data);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});
setInterval(() => { const now = Date.now(); for (const [key, expires] of pending) if (expires < now) pending.delete(key); }, 5 * 60 * 1000).unref();
server.listen(PORT, '0.0.0.0', () => console.log(`HEX CHEATS SKINMOD listening on port ${PORT}`));
