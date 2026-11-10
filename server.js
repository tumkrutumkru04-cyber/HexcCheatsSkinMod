const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, 'public');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'Databasehex.db');
const PUBLIC_URL = (process.env.PUBLIC_URL || 'https://hexcheatsskinmod.up.railway.app').replace(/\/$/, '');
const VIPLINK_API_TOKEN = process.env.VIPLINK_API_TOKEN || '';
const ACCESS_SECRET = process.env.ACCESS_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const KEY_TTL_SECONDS = 24 * 60 * 60;
const KEY_PREFIX = 'HEX-CHATS-';
const pending = new Map();
const adminSessions = new Map();
const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon' };

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY, password_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS access_keys (code TEXT PRIMARY KEY, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, max_ips INTEGER NOT NULL DEFAULT 10, revoked INTEGER NOT NULL DEFAULT 0, note TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS key_ips (code TEXT NOT NULL, ip_hash TEXT NOT NULL, first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL, PRIMARY KEY (code, ip_hash), FOREIGN KEY (code) REFERENCES access_keys(code) ON DELETE CASCADE);`);

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) { return `scrypt$${salt}$${crypto.scryptSync(password, salt, 32).toString('hex')}`; }
function verifyPassword(password, stored) { const [, salt, digest] = String(stored || '').split('$'); if (!salt || !digest) return false; const actual = crypto.scryptSync(password, salt, 32); const expected = Buffer.from(digest, 'hex'); return expected.length === actual.length && crypto.timingSafeEqual(actual, expected); }
if (!db.prepare('SELECT 1 FROM admins WHERE username = ?').get(ADMIN_USERNAME) && ADMIN_PASSWORD) db.prepare('INSERT INTO admins(username,password_hash,created_at) VALUES(?,?,?)').run(ADMIN_USERNAME, hashPassword(ADMIN_PASSWORD), Math.floor(Date.now()/1000));
function json(res, status, body) { res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff' }); res.end(JSON.stringify(body)); }
function parseCookies() { return {}; }
function sign(value) { return crypto.createHmac('sha256', ACCESS_SECRET).update(value).digest('base64url'); }
function clientIp(req) { const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim(); return forwarded || req.socket.remoteAddress || 'unknown'; }
function ipHash(req) { return crypto.createHmac('sha256', ACCESS_SECRET).update(clientIp(req)).digest('hex'); }
function normalizeKey(value) { return String(value || '').trim().toUpperCase().replace(/\s+/g, ''); }
function randomKey() { return KEY_PREFIX + crypto.randomBytes(4).toString('hex').toUpperCase(); }
function createKey(code = randomKey(), hours = 24, maxIps = 10, note = '') { const now = Math.floor(Date.now()/1000); const normalized = normalizeKey(code); db.prepare('INSERT INTO access_keys(code,created_at,expires_at,max_ips,note) VALUES(?,?,?,?,?)').run(normalized, now, now + Math.max(1, Number(hours) || 24) * 3600, Math.max(1, Number(maxIps) || 10), String(note || '')); return normalized; }
function keyInfo(code) { const row = db.prepare('SELECT code,created_at,expires_at,max_ips,revoked,note FROM access_keys WHERE code = ?').get(normalizeKey(code)); if (!row) return null; const used = db.prepare('SELECT COUNT(*) AS count FROM key_ips WHERE code = ?').get(row.code).count; return { ...row, used_ips: Number(used), valid: !row.revoked && row.expires_at > Math.floor(Date.now()/1000) }; }
function useKey(code, req) { const info = keyInfo(code); if (!info || !info.valid) return { ok:false, error:'Key is invalid, expired, or revoked.' }; const hash = ipHash(req); const known = db.prepare('SELECT 1 FROM key_ips WHERE code = ? AND ip_hash = ?').get(info.code, hash); if (!known && info.used_ips >= info.max_ips) return { ok:false, error:`This key has reached its ${info.max_ips}-IP limit.` }; const now = Math.floor(Date.now()/1000); if (known) db.prepare('UPDATE key_ips SET last_seen = ? WHERE code = ? AND ip_hash = ?').run(now, info.code, hash); else db.prepare('INSERT INTO key_ips(code,ip_hash,first_seen,last_seen) VALUES(?,?,?,?)').run(info.code, hash, now, now); const updated = keyInfo(info.code); return { ok:true, key:updated.code, expiresIn:Math.max(0, updated.expires_at-now), usedIps:updated.used_ips, maxIps:updated.max_ips }; }
function bearer(req) { const value = String(req.headers.authorization || ''); return value.startsWith('Bearer ') ? value.slice(7) : ''; }
function isAdmin(req) { const token = adminSessions.get(bearer(req)); return Boolean(token && token > Date.now()); }
function readBody(req) { return new Promise((resolve, reject) => { let data=''; req.on('data', chunk => { data += chunk; if (data.length > 100000) reject(new Error('Request too large')); }); req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('Invalid JSON')); } }); req.on('error', reject); }); }
async function createVipLink(state) { if (!VIPLINK_API_TOKEN) throw new Error('VIPLINK_API_TOKEN is not configured on Railway.'); const destination = `${PUBLIC_URL}/unlock/complete?state=${encodeURIComponent(state)}`; const endpoint = new URL('https://vplink.in/api'); endpoint.searchParams.set('api', VIPLINK_API_TOKEN); endpoint.searchParams.set('url', destination); endpoint.searchParams.set('alias', 'hex-skinmod-' + state.slice(0,8)); const response = await fetch(endpoint); if (!response.ok) throw new Error(`VIPLINK returned HTTP ${response.status}.`); const text = await response.text(); let result; try { result = JSON.parse(text); } catch { result = { shortenedUrl:text.trim() }; } if (result.status === 'error') throw new Error(result.message || 'VIPLINK could not create a task link.'); const shortUrl = result.shortenedUrl || result.shortened_url || result.url || text.trim(); if (!/^https?:\/\//i.test(shortUrl)) throw new Error('VIPLINK returned an invalid task link.'); return shortUrl; }
function safePath(requestPath) { const decoded = decodeURIComponent(requestPath.split('?')[0]); const relative = decoded === '/' ? '/index.html' : decoded; const resolved = path.resolve(ROOT, `.${relative}`); return resolved.startsWith(ROOT + path.sep) ? resolved : null; }

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true); const pathname = parsed.pathname || '/';
  if (pathname === '/health' || pathname === '/api/health') return json(res, 200, { ok:true, service:'hex-cheats-skinmod' });
  if (pathname === '/api/key/check' && req.method === 'POST') { try { const body = await readBody(req); return json(res, 200, useKey(body.key, req)); } catch (e) { return json(res, 400, { ok:false, error:e.message }); } }
  if (pathname === '/api/admin/login' && req.method === 'POST') { try { const body = await readBody(req); const admin = db.prepare('SELECT password_hash FROM admins WHERE username = ?').get(String(body.username || '')); if (!admin || !verifyPassword(String(body.password || ''), admin.password_hash)) return json(res, 401, { ok:false, error:'Invalid admin login.' }); const token = crypto.randomBytes(32).toString('base64url'); adminSessions.set(token, Date.now() + 8*60*60*1000); return json(res, 200, { ok:true, token }); } catch (e) { return json(res, 400, { ok:false, error:e.message }); } }
  if (pathname === '/api/admin/keys' && req.method === 'GET') { if (!isAdmin(req)) return json(res, 401, { error:'Admin login required.' }); const rows = db.prepare('SELECT code,created_at,expires_at,max_ips,revoked,note FROM access_keys ORDER BY created_at DESC LIMIT 200').all(); return json(res, 200, { keys:rows.map(row => ({ ...row, used_ips:Number(db.prepare('SELECT COUNT(*) AS count FROM key_ips WHERE code = ?').get(row.code).count), valid:!row.revoked && row.expires_at > Math.floor(Date.now()/1000) })) }); }
  if (pathname === '/api/admin/keys' && req.method === 'POST') { if (!isAdmin(req)) return json(res, 401, { error:'Admin login required.' }); try { const body = await readBody(req); const code = createKey(body.code || randomKey(), body.hours || 24, body.maxIps || 10, body.note || ''); return json(res, 201, { ok:true, key:keyInfo(code) }); } catch (e) { return json(res, 400, { ok:false, error:e.message.includes('UNIQUE') ? 'That key already exists.' : e.message }); } }
  if (pathname.startsWith('/api/admin/keys/') && req.method === 'DELETE') { if (!isAdmin(req)) return json(res, 401, { error:'Admin login required.' }); const code = normalizeKey(pathname.split('/').pop()); db.prepare('UPDATE access_keys SET revoked=1 WHERE code=?').run(code); return json(res, 200, { ok:true }); }
  if (pathname === '/api/access-status') return json(res, 200, { unlocked:false, mode:'key-required', message:'Enter a valid 24-hour key to export.' });
  if (pathname === '/api/unlock/start' && req.method === 'GET') { const state = crypto.randomBytes(18).toString('base64url'); pending.set(state, Date.now()+15*60*1000); try { return json(res, 200, { shortUrl:await createVipLink(state) }); } catch (e) { pending.delete(state); return json(res, 503, { error:e.message }); } }
  if (pathname === '/unlock/complete') { const state = String(parsed.query.state || ''); const expires = pending.get(state); pending.delete(state); if (!expires || expires < Date.now()) { res.writeHead(400, {'Content-Type':'text/html; charset=utf-8'}); return res.end('<h1>Unlock link expired</h1><p>Return to HEX CHEATS SKINMOD and try again.</p>'); } let key; try { key = createKey(randomKey(), 24, 10, 'VIPLINK task'); } catch { key = createKey(randomKey(), 24, 10, 'VIPLINK task'); } res.writeHead(302, { 'Location': `/?unlock=1&key=${encodeURIComponent(key)}#studio`, 'Cache-Control':'no-store' }); return res.end(); }
  if (pathname === '/admin') { const file = path.join(ROOT, 'admin.html'); return fs.readFile(file, (err,data) => { if (err) { res.writeHead(404); return res.end('Not found'); } res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}); res.end(data); }); }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow:'GET, HEAD' }); return res.end('Method Not Allowed'); }
  const filePath = safePath(pathname); if (!filePath) { res.writeHead(400); return res.end('Bad Request'); }
  fs.stat(filePath, (statError, stat) => { if (statError || !stat.isFile()) { const fallback=path.join(ROOT,'index.html'); return fs.readFile(fallback,(error,data)=>{ if(error){res.writeHead(404);return res.end('Not Found');} res.writeHead(200,{'Content-Type':MIME['.html'],'Cache-Control':'no-cache'}); res.end(data); }); } const ext=path.extname(filePath).toLowerCase(); res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':ext==='.html'?'no-cache':'public, max-age=31536000, immutable'}); if(req.method==='HEAD')return res.end(); fs.createReadStream(filePath).pipe(res); });
});
setInterval(() => { const now=Date.now(); for(const [key,expires] of pending) if(expires<now) pending.delete(key); for(const [token,expires] of adminSessions) if(expires<now) adminSessions.delete(token); }, 5*60*1000).unref();
server.listen(PORT, '0.0.0.0', () => console.log(`HEX CHEATS SKINMOD listening on port ${PORT}`));
