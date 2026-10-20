/*
 * فعالية طلة — ما يجب ألّا ينكسر في صفحتيها (jsdom، بلا شبكة: fetch مزيَّف يسجّل كلّ طلب).
 *
 *   - الصفحتان: عربيّتان، خارج محرّكات البحث، بسياسة CSP خاصّة بهما، بلا سطر JavaScript داخلهما،
 *     وبصماتُ ملفّاتهما محدَّثة.
 *   - لا سرّ في أيّ ملفٍّ من ملفّات الفعالية: المفتاح العامّ وحده، ولا كلمة مرور.
 *   - صفحات أبعاد الأصلية لا تعرف الفعالية: لا رابط إليها ولا ملفّ منها.
 *   - قاعدة البيانات (supabase.sql): RLS في كلّ جدول، ولا دالّة تتجاوزها في public،
 *     والزائر لا يملك إلّا talla_status وtalla_submit. (والسلوكُ نفسه على PostgreSQL حقيقيّ
 *     في deploy/talla/tests/run.sh)
 *   - نموذج الرأي: ما يُرسل بالضبط، والتحقّق، والإغلاق، والأخطاء.
 *   - صفحة السحب: لا شيء قبل الدخول، والمشرف وحده يرى الأسماء، والسحبُ يُطلب من القاعدة
 *     والفائزُ الظاهر هو ما أعادته.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { JSDOM, VirtualConsole } from 'jsdom';
import { PAGES, stamped } from '../deploy/talla/stamp.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const exists = (p) => existsSync(new URL(p.replace(/^\//, ''), root));

const FEEDBACK = read('talla-feedback/index.html');
const DRAW = read('talla-draw/index.html');
const JS = Object.fromEntries(['config', 'api', 'feedback', 'wheel', 'draw'].map((n) => [n, read(`talla-event/${n}.js`)]));
const SQL = read('deploy/talla/supabase.sql');
// config.js كما سيُنشر — مشروع الفعالية ومفتاحه العامّ
const SHIPPED = runInNewContext(JS.config + ';window.TALLA_CONFIG', { window: {} });
const HOST = SHIPPED.url.replace('https://', '');

const CSP = "default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co; base-uri 'none'; form-action 'none'";
const KEY = 'sb_publishable_talla_test_0123456789';
const CONFIG = { enabled: true, url: 'https://talla-test.supabase.co', key: KEY };
const ADMIN = { access_token: 'admin-token-1', refresh_token: 'refresh-1', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: { id: 'a1' } };

/* ═══════════ أدوات ═══════════ */

/** مشروع Supabase مزيَّف: كلّ طلبٍ يُسجَّل، والجوابُ من handlers باسم الدالّة أو المسار */
function backend(handlers = {}) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    const u = new URL(url);
    const body = init.body ? JSON.parse(init.body) : {};
    const call = { host: u.host, path: u.pathname, query: u.search, headers: { ...(init.headers || {}) }, body };
    calls.push(call);
    const name = u.pathname.split('/').pop();
    const handler = handlers[name] || handlers[u.pathname];
    const out = handler ? await handler(body, call) : { status: 404, body: { code: 'PGRST202', message: 'not found' } };
    if (out === 'offline') throw new TypeError('Failed to fetch');
    const status = out.status || 200;
    return new Response(status === 204 || out.body === undefined ? null : JSON.stringify(out.body), { status });
  };
  return { calls, fetch, rpc: (fn) => calls.filter((c) => c.path === `/rest/v1/rpc/${fn}`) };
}

const failure = (message, status = 400) => ({ status, body: { code: 'P0001', message, details: null, hint: null } });

async function until(fn, what = 'condition', ms = 2000) {
  const end = Date.now() + ms;
  for (;;) {
    let ok = false;
    try { ok = fn(); } catch { ok = false; }
    if (ok) return;
    if (Date.now() > end) assert.fail(`انتظرتُ ولم يحدث: ${what}`);
    await new Promise((r) => setTimeout(r, 5));
  }
}
const settle = () => new Promise((r) => setTimeout(r, 30));

/** الصفحة في jsdom، وسكربتاتها تعمل فيها بالترتيب — config.js الحقيقيّ إن لم يُعطَ إعداد */
function open(t, html, scripts, { config, fetch, session, url } = {}) {
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => {
    // jsdom بلا canvas: العجلة تُرسم في اختبار المتصفّح الحقيقيّ
    if (!/HTMLCanvasElement|getContext/.test(e.message)) errors.push(e.message);
  });
  const dom = new JSDOM(html, { url: url || 'https://abaadapp.om/talla-feedback/', runScripts: 'outside-only', virtualConsole: vc });
  const w = dom.window;
  t.after(() => {
    w.close();
    assert.deepEqual(errors, [], 'أخطاءٌ في الصفحة');
  });
  w.fetch = fetch || (() => Promise.reject(new TypeError('no network in this test')));
  if (session) w.sessionStorage.setItem('talla.session', JSON.stringify(session));
  if (config) w.TALLA_CONFIG = config;
  else w.eval(JS.config);
  for (const s of scripts) w.eval(JS[s]);
  return { w, d: w.document, $: (s) => w.document.querySelector(s) };
}

const feedback = (t, opts) => open(t, FEEDBACK, ['api', 'feedback'], opts);
const draw = (t, opts) => open(t, DRAW, ['api', 'wheel', 'draw'], { url: 'https://abaadapp.om/talla-draw/', ...opts });
const visible = (el) => !!el && !el.hidden;

function type(w, el, value) {
  el.value = value;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
}

/* ═══════════ ١ · الصفحتان ═══════════ */

test('both pages are Arabic, unlisted, locked by their own CSP, with no inline script', () => {
  for (const [name, html] of [['talla-feedback', FEEDBACK], ['talla-draw', DRAW]]) {
    const d = new JSDOM(html).window.document;
    assert.equal(d.documentElement.lang, 'ar', name);
    assert.equal(d.documentElement.dir, 'rtl', name);
    assert.equal(d.querySelector('meta[name="robots"]').content, 'noindex, nofollow', name);
    assert.equal(d.querySelector('meta[http-equiv="Content-Security-Policy"]').content, CSP, name);
    assert.equal(d.querySelector('meta[name="referrer"]').content, 'no-referrer', name);
    for (const s of d.querySelectorAll('script')) {
      assert.match(s.getAttribute('src') || '', /^\/talla-event\/[a-z]+\.js\?v=[0-9a-f]{10}$/, `${name}: سكربتٌ داخل الصفحة أو من خارجها`);
      assert.equal(s.textContent.trim(), '', name);
    }
    for (const el of d.querySelectorAll('*')) {
      for (const a of el.getAttributeNames()) assert.ok(!/^on/i.test(a), `${name}: ${a} داخل الصفحة`);
      assert.ok(!el.hasAttribute('style'), `${name}: style داخل الصفحة يمنعه CSP`);
    }
    const sheets = [...d.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    assert.deepEqual(sheets.filter((h) => !h.startsWith('https://fonts.googleapis.com/') && !/^\/talla-event\/talla\.css\?v=[0-9a-f]{10}$/.test(h)), [], name);
  }
});

test('every local file the pages load exists, and the stamps are current', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.equal(stamped(html), html, `${page}: شغّل node deploy/talla/stamp.mjs`);
    const d = new JSDOM(html).window.document;
    const local = [...d.querySelectorAll('[src],[href]')].map((el) => el.getAttribute('src') || el.getAttribute('href'))
      .filter((u) => u.startsWith('/') && !u.startsWith('//')).map((u) => u.split(/[?#]/)[0]);
    assert.ok(local.length >= 5, page);
    for (const f of local) assert.ok(exists(f), `${page}: مفقود ${f}`);
  }
});

test('no secret in any event file: the public key only, and no password', () => {
  const files = ['talla-event', 'talla-feedback', 'talla-draw', 'deploy/talla']
    .flatMap((dir) => readdirSync(new URL(dir + '/', root), { recursive: true }).map((f) => `${dir}/${f}`))
    .filter((f) => /\.(js|mjs|html|css|sql|md|sh)$/.test(f));
  assert.ok(files.length >= 10);
  for (const f of files) {
    const text = read(f);
    assert.doesNotMatch(text, /sb_secret_[A-Za-z0-9]/, `${f}: مفتاحٌ سرّيّ`);
    for (const jwt of text.match(/eyJ[\w-]{10,}\.eyJ[\w-]{10,}\.[\w-]+/g) || []) {
      const claims = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
      assert.notEqual(claims.role, 'service_role', `${f}: مفتاح service_role`);
    }
    assert.doesNotMatch(text, /password\s*[:=]\s*['"][^'"]+['"]/i, `${f}: كلمة مرور مكتوبة`);
  }
  assert.equal(SHIPPED.enabled, true);
  assert.match(SHIPPED.key, /^sb_publishable_[\w-]{20,}$/, 'المفتاح العامّ وحده — لا sb_secret_ ولا service_role');
  assert.match(SHIPPED.url, /^https:\/\/[a-z0-9]+\.supabase\.co$/, 'رابطٌ يغطّيه CSP (https://*.supabase.co)');
});

test('the original Abaad pages know nothing of the event', () => {
  for (const f of ['index.html', 'en/index.html', 'assets/site.js', 'assets/site.css', 'sitemap.xml', 'robots.txt',
    'privacy/index.html', 'terms/index.html', 'data-deletion/index.html', 'deploy/nginx-abaadapp.om.conf']) {
    assert.doesNotMatch(read(f), /talla|طلة/i, f);
  }
});

test('the database: RLS on every table, nothing bypasses it from public, and the visitor holds two doors only', () => {
  const tables = [...SQL.matchAll(/create table if not exists (talla\.\w+)/g)].map((m) => m[1]);
  assert.deepEqual(tables, ['talla.settings', 'talla.responses', 'talla.winners', 'talla.admins']);
  for (const t of tables) assert.match(SQL, new RegExp(`alter table ${t.replace('.', '\\.')}\\s+enable row level security`), t);

  const fns = [...SQL.matchAll(/create or replace function ([\w.]+)\([^)]*\)[\s\S]*?\$\$/g)].map((m) => ({ name: m[1], head: m[0] }));
  assert.ok(fns.length >= 11);
  for (const f of fns) {
    assert.match(f.head, /set search_path = ''/, `${f.name}: search_path`);
    if (f.name.startsWith('public.')) assert.match(f.head, /security invoker/, `${f.name}: يعمل بصلاحيّات المستدعي`);
  }
  const anon = [...SQL.matchAll(/grant execute on function([^;]*?)\bto anon\b/g)].map((m) => m[1].replace(/\s+/g, ' ').trim());
  assert.deepEqual(anon, [
    'talla.name_key(text), talla.accepting()',
    'public.talla_status(), public.talla_submit(text, text, boolean, text)',
  ]);
  assert.match(SQL, /revoke all on all tables in schema talla from public, anon, authenticated;/);
  assert.doesNotMatch(SQL, /grant [^;]*\bon talla\.winners to anon/);
  assert.doesNotMatch(SQL, /grant [^;]*(insert|update|delete)[^;]*on talla\.winners/);
  assert.doesNotMatch(SQL, /grant select[^;]*\bfeedback\b/, 'نصّ الآراء لا يُقرأ عبر الواجهة');
});

/* ═══════════ ٢ · نموذج الرأي ═══════════ */

test('feedback: as shipped, it talks to the event project only, with its public key', async (t) => {
  const api = backend({ talla_status: () => ({ body: { accepting: true } }) });
  const { $ } = feedback(t, { fetch: api.fetch });
  await until(() => visible($('[data-form]')), 'form');
  assert.equal(api.calls.length, 1);
  assert.equal(api.calls[0].host, HOST);
  assert.equal(api.calls[0].headers.apikey, SHIPPED.key);
  assert.equal(api.calls[0].headers.Authorization, undefined);
});

test('feedback: enabled: false in config.js says it is unavailable and calls nothing', async (t) => {
  const api = backend();
  const { $ } = feedback(t, { config: { ...SHIPPED, enabled: false }, fetch: api.fetch });
  await settle();
  assert.ok(visible($('[data-unavailable]')));
  assert.ok(!visible($('[data-form]')));
  assert.equal(api.calls.length, 0);
});

test('feedback: when the event is closed, the form is not shown', async (t) => {
  const api = backend({ talla_status: () => ({ body: { accepting: false } }) });
  const { $ } = feedback(t, { config: CONFIG, fetch: api.fetch });
  await until(() => visible($('[data-closed]')), 'closed');
  assert.ok(!visible($('[data-form]')));
});

test('feedback: sends exactly the name, the feedback, the consent and the trap — with the public key only', async (t) => {
  const api = backend({
    talla_status: () => ({ body: { accepting: true } }),
    talla_submit: () => ({ body: { ok: true } }),
  });
  const { w, $ } = feedback(t, { config: CONFIG, fetch: api.fetch });
  await until(() => visible($('[data-form]')), 'form');
  type(w, $('#t-name'), '  سارة علي ');
  type(w, $('#t-feedback'), 'تنظيمٌ رائع، والمكان جميل.');
  assert.equal($('[data-count]').textContent, '26 / 2000');
  $('#t-consent').checked = true;
  $('[data-submit]').click();
  await until(() => visible($('[data-done]')), 'thanks');

  const [sent] = api.rpc('talla_submit');
  assert.deepEqual(sent.body, { p_name: 'سارة علي', p_feedback: 'تنظيمٌ رائع، والمكان جميل.', p_consent: true, p_website: '' });
  assert.equal(sent.headers.apikey, KEY);
  assert.equal(sent.headers.Authorization, undefined, 'المفتاح الجديد لا يُرسل في Authorization');
  assert.equal(sent.query, '');
  assert.ok(visible($('[data-done-draw]')), 'دخل السحب');
  assert.equal($('#t-name').value, '', 'النموذج فارغ بعد الإرسال');

  $('[data-again]').click();
  assert.ok(visible($('[data-form]')));
});

test('feedback: without consent, thanks without the draw line', async (t) => {
  const api = backend({ talla_status: () => ({ body: { accepting: true } }), talla_submit: () => ({ body: { ok: true } }) });
  const { w, $ } = feedback(t, { config: CONFIG, fetch: api.fetch });
  await until(() => visible($('[data-form]')));
  type(w, $('#t-name'), 'خالد سالم');
  type(w, $('#t-feedback'), 'الصوت كان منخفضًا');
  $('[data-submit]').click();
  await until(() => visible($('[data-done]')));
  assert.equal(api.rpc('talla_submit')[0].body.p_consent, false);
  assert.ok(!visible($('[data-done-draw]')));
});

test('feedback: a short name or feedback is pointed out and nothing is sent', async (t) => {
  const api = backend({ talla_status: () => ({ body: { accepting: true } }) });
  const { w, $ } = feedback(t, { config: CONFIG, fetch: api.fetch });
  await until(() => visible($('[data-form]')));
  type(w, $('#t-name'), 'س');
  type(w, $('#t-feedback'), 'جي');
  $('[data-submit]').click();
  await settle();
  assert.ok(visible($('#t-name-error')));
  assert.ok(visible($('#t-feedback-error')));
  assert.equal($('#t-name').getAttribute('aria-invalid'), 'true');
  type(w, $('#t-name'), '..');
  $('[data-submit]').click();
  await settle();
  assert.ok(visible($('#t-name-error')), 'اسمٌ بلا حرف');
  assert.equal(api.rpc('talla_submit').length, 0);
});

test('feedback: what the database refuses is said in Arabic, and the button comes back', async (t) => {
  const answers = [failure('busy'), 'offline', failure('invalid_name'), failure('closed')];
  const api = backend({ talla_status: () => ({ body: { accepting: true } }), talla_submit: () => answers.shift() });
  const { w, $ } = feedback(t, { config: CONFIG, fetch: api.fetch });
  await until(() => visible($('[data-form]')));
  type(w, $('#t-name'), 'هدى يوسف');
  type(w, $('#t-feedback'), 'رأيٌ للاختبار');

  $('[data-submit]').click();
  await until(() => visible($('[data-message]')), 'busy');
  assert.match($('[data-message]').textContent, /كبيرٌ الآن/);
  assert.equal($('[data-submit]').disabled, false);

  $('[data-submit]').click();
  await until(() => /اتصالك/.test($('[data-message]').textContent), 'offline');

  $('[data-submit]').click();
  await until(() => visible($('#t-name-error')), 'invalid name from the server');

  $('[data-submit]').click();
  await until(() => visible($('[data-closed]')), 'closed while writing');
  assert.equal(api.rpc('talla_submit').length, 4);
});

test('feedback: a double click sends once', async (t) => {
  let release;
  const api = backend({
    talla_status: () => ({ body: { accepting: true } }),
    talla_submit: () => new Promise((r) => { release = () => r({ body: { ok: true } }); }),
  });
  const { w, $ } = feedback(t, { config: CONFIG, fetch: api.fetch });
  await until(() => visible($('[data-form]')));
  type(w, $('#t-name'), 'بدر خلفان');
  type(w, $('#t-feedback'), 'رأيٌ مرّة واحدة');
  $('[data-submit]').click();
  $('[data-submit]').click();
  await until(() => typeof release === 'function');
  assert.equal($('[data-submit]').disabled, true);
  release();
  await until(() => visible($('[data-done]')));
  assert.equal(api.rpc('talla_submit').length, 1);
});

test('feedback: a legacy anon key goes in Authorization too; an unreachable status still shows the form', async (t) => {
  const legacy = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Buffer.from(JSON.stringify({ role: 'anon' })).toString('base64url') + '.c2lnbmF0dXJl';
  const api = backend({ talla_status: () => 'offline', talla_submit: () => ({ body: { ok: true } }) });
  const { w, $ } = feedback(t, { config: { ...CONFIG, key: legacy }, fetch: api.fetch });
  await until(() => visible($('[data-form]')), 'form despite the failed status');
  type(w, $('#t-name'), 'جميلة راشد');
  type(w, $('#t-feedback'), 'رأيٌ بالمفتاح القديم');
  $('[data-submit]').click();
  await until(() => visible($('[data-done]')));
  const [sent] = api.rpc('talla_submit');
  assert.equal(sent.headers.apikey, legacy);
  assert.equal(sent.headers.Authorization, 'Bearer ' + legacy);
});

/* ═══════════ ٣ · صفحة السحب ═══════════ */

const STATE = {
  accepting: true, drawing: true, closes_at: null, open_now: true, responses: 9,
  participants: [
    { key: 'امل', name: 'أمل سعيد', entries: 2, excluded: false, won: false },
    { key: 'بدر', name: 'بدر خلفان', entries: 1, excluded: false, won: false },
    { key: 'xss', name: '<img src=x onerror=alert(1)>', entries: 1, excluded: false, won: false },
    { key: 'ريم', name: 'ريم مبارك', entries: 1, excluded: true, won: false },
    { key: 'هدي', name: 'هدى يوسف', entries: 1, excluded: false, won: true },
  ],
  winners: [{ round: 1, name: 'هدى يوسف', key: 'هدي', at: '2026-11-01T18:30:00Z' }],
};

function adminBackend(extra = {}) {
  return backend({
    token: (body, call) => {
      if (call.query === '?grant_type=password') {
        if (body.email === 'owner@example.test' && body.password === 'correct horse') return { body: ADMIN };
        if (body.email === 'guest@example.test') return { body: { ...ADMIN, access_token: 'guest-token' } };
        if (body.email === 'busy@example.test') return { status: 429, body: { code: 429, error_code: 'over_request_rate_limit', msg: 'Request rate limit reached' } };
        return { status: 400, body: { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' } };
      }
      return { body: { ...ADMIN, access_token: 'admin-token-2', refresh_token: 'refresh-2' } };
    },
    logout: () => ({ status: 204 }),
    talla_admin_state: (body, call) => (/^Bearer admin-token/.test(call.headers.Authorization || '') ? { body: STATE } : failure('forbidden')),
    ...extra,
  });
}

async function signIn(w, $, email = 'owner@example.test', password = 'correct horse') {
  await until(() => visible($('[data-login]')), 'login');
  type(w, $('#t-email'), email);
  type(w, $('#t-password'), password);
  $('[data-login-submit]').click();
}

test('draw: as shipped, it signs in at the event project only, with its public key', async (t) => {
  const api = adminBackend();
  const { w, $ } = draw(t, { fetch: api.fetch });
  await until(() => visible($('[data-login]')), 'login');
  assert.equal(api.calls.length, 0, 'لا شيء قبل الدخول');
  await signIn(w, $);
  await until(() => visible($('[data-board]')));
  assert.ok(api.calls.length >= 2);
  assert.ok(api.calls.every((c) => c.host === HOST && c.headers.apikey === SHIPPED.key));
});

test('draw: enabled: false in config.js says it is unavailable and calls nothing', async (t) => {
  const api = backend();
  const { $ } = draw(t, { config: { ...SHIPPED, enabled: false }, fetch: api.fetch });
  await settle();
  assert.ok(visible($('[data-unavailable]')));
  assert.ok(!visible($('[data-board]')));
  assert.equal(api.calls.length, 0);
});

test('draw: nothing but the sign-in before signing in — no names in the page, no call', async (t) => {
  const api = adminBackend();
  const { $, d } = draw(t, { config: CONFIG, fetch: api.fetch });
  await until(() => visible($('[data-login]')));
  assert.ok(!visible($('[data-board]')));
  assert.equal(api.calls.length, 0);
  assert.equal(d.querySelectorAll('[data-participants] li').length, 0);
});

test('draw: a wrong password, too many attempts, and an account that is not an admin', async (t) => {
  const api = adminBackend();
  const { w, $ } = draw(t, { config: CONFIG, fetch: api.fetch });

  await signIn(w, $, 'owner@example.test', 'wrong');
  await until(() => visible($('[data-login-message]')));
  assert.match($('[data-login-message]').textContent, /غير صحيحة/);

  await signIn(w, $, 'busy@example.test', 'x');
  await until(() => /محاولاتٌ كثيرة/.test($('[data-login-message]').textContent), 'rate limit');

  await signIn(w, $, 'guest@example.test', 'x');
  await until(() => /ليس مشرفًا/.test($('[data-login-message]').textContent), 'not an admin');
  assert.ok(!visible($('[data-board]')));
  assert.equal(w.sessionStorage.getItem('talla.session'), null, 'الجلسة تُمحى');
  await until(() => api.calls.some((c) => c.path === '/auth/v1/logout'), 'logout');
  const out = api.calls.find((c) => c.path === '/auth/v1/logout');
  assert.equal(out.query, '?scope=local');
  assert.equal(out.headers.Authorization, 'Bearer guest-token');
});

test('draw: the admin sees the counts, the winners, and every name as plain text', async (t) => {
  const api = adminBackend();
  const { w, $, d } = draw(t, { config: CONFIG, fetch: api.fetch });
  await signIn(w, $);
  await until(() => visible($('[data-board]')), 'board');

  const [login] = api.calls;
  assert.equal(login.path, '/auth/v1/token');
  assert.equal(login.query, '?grant_type=password');
  assert.equal(login.headers.apikey, KEY);
  assert.equal($('#t-password').value, '', 'كلمة المرور لا تبقى في الصفحة');
  assert.equal(JSON.parse(w.sessionStorage.getItem('talla.session')).access_token, 'admin-token-1');
  assert.equal(w.localStorage.length, 0, 'لا شيء في localStorage');

  const [state] = api.rpc('talla_admin_state');
  assert.equal(state.headers.Authorization, 'Bearer admin-token-1');
  assert.equal($('[data-stat-participants]').textContent, '3', 'من لم يُستبعَد ولم يفز');
  assert.equal($('[data-stat-responses]').textContent, '9');
  assert.equal($('[data-stat-winners]').textContent, '1');
  assert.deepEqual([...d.querySelectorAll('[data-winners] li')].map((li) => li.querySelector('b').textContent), ['هدى يوسف']);

  const names = [...d.querySelectorAll('[data-participants] .t-person-name')].map((n) => n.textContent);
  assert.deepEqual(names, ['أمل سعيد', 'بدر خلفان', '<img src=x onerror=alert(1)>', 'ريم مبارك', 'هدى يوسف']);
  assert.equal(d.querySelectorAll('[data-participants] img').length, 0, 'الاسمُ نصٌّ لا وسم');
  assert.equal(d.querySelector('[data-participants] .t-badge').textContent, '×2');

  type(w, $('[data-filter]'), 'بدر');
  assert.deepEqual([...d.querySelectorAll('[data-participants] .t-person-name')].map((n) => n.textContent), ['بدر خلفان']);
});

test('draw: the winner comes from the database — the page asks, then shows what it answered', async (t) => {
  const api = adminBackend({ talla_admin_draw: () => ({ body: { round: 2, name: 'بدر خلفان', key: 'بدر' } }) });
  const { w, $ } = draw(t, { config: CONFIG, fetch: api.fetch });
  await signIn(w, $);
  await until(() => visible($('[data-board]')));

  $('[data-spin]').click();
  await until(() => visible($('[data-winner]')), 'winner');
  const [asked] = api.rpc('talla_admin_draw');
  assert.equal(asked.headers.Authorization, 'Bearer admin-token-1');
  assert.deepEqual(asked.body, {}, 'لا يُرسل المتصفّح اسمًا ولا اختيارًا');
  assert.equal($('[data-winner-name]').textContent, 'بدر خلفان');
  assert.match($('[data-winner-round]').textContent, /2/);
  assert.equal(api.calls.filter((c) => /winner/i.test(c.path)).length, 0, 'لا طريق آخر إلى الفائزين');

  $('[data-winner-close]').click();
  assert.ok(!visible($('[data-winner]')));
  await until(() => api.rpc('talla_admin_state').length >= 2, 'refresh after the winner');
});

test('draw: a winner who joined after the last refresh is still landed on', async (t) => {
  const api = adminBackend({ talla_admin_draw: () => ({ body: { round: 2, name: 'متأخر وصل', key: 'متاخر' } }) });
  const { w, $ } = draw(t, { config: CONFIG, fetch: api.fetch });
  await signIn(w, $);
  await until(() => visible($('[data-board]')));
  $('[data-spin]').click();
  await until(() => visible($('[data-winner]')));
  assert.equal($('[data-winner-name]').textContent, 'متأخر وصل');
});

test('draw: a stopped draw and an empty one are said, and no winner is shown', async (t) => {
  const answers = [failure('draw_closed'), failure('no_candidates')];
  const api = adminBackend({ talla_admin_draw: () => answers.shift() });
  const { w, $ } = draw(t, { config: CONFIG, fetch: api.fetch });
  await signIn(w, $);
  await until(() => visible($('[data-board]')));

  $('[data-spin]').click();
  await until(() => /متوقّف/.test($('[data-board-message]').textContent), 'draw closed');
  assert.ok(!visible($('[data-winner]')));
  assert.equal($('[data-spin]').disabled, false);

  $('[data-spin]').click();
  await until(() => /متبقٍّ/.test($('[data-board-message]').textContent), 'no candidates');
  assert.ok(!visible($('[data-winner]')));
});

test('draw: ending the event asks first, then closes the form and stops the draw at once', async (t) => {
  const closed = { ...STATE, accepting: false, drawing: false, open_now: false };
  const api = adminBackend({ talla_admin_set: () => ({ body: closed }) });
  const { w, $ } = draw(t, { config: CONFIG, fetch: api.fetch });
  await signIn(w, $);
  await until(() => visible($('[data-board]')));

  $('[data-end]').click();
  assert.ok(visible($('[data-confirm]')));
  $('[data-confirm-no]').click();
  assert.ok(!visible($('[data-confirm]')));
  assert.equal(api.rpc('talla_admin_set').length, 0, 'التراجع لا يرسل شيئًا');

  $('[data-end]').click();
  $('[data-confirm-yes]').click();
  await until(() => api.rpc('talla_admin_set').length === 1);
  assert.deepEqual(api.rpc('talla_admin_set')[0].body, { p_accepting: false, p_drawing: false });
  await until(() => /انتهت الفعالية/.test($('[data-board-message]').textContent));
  assert.equal($('[data-accepting]').checked, false);
  assert.equal($('[data-drawing]').checked, false);
});

test('draw: each switch, the closing time and excluding a name send one change', async (t) => {
  const api = adminBackend({
    talla_admin_set: () => ({ body: STATE }),
    talla_admin_exclude: () => ({ body: STATE }),
  });
  const { w, $, d } = draw(t, { config: CONFIG, fetch: api.fetch });
  await signIn(w, $);
  await until(() => visible($('[data-board]')));

  $('[data-accepting]').checked = false;
  $('[data-accepting]').dispatchEvent(new w.Event('change'));
  await until(() => api.rpc('talla_admin_set').length === 1);
  assert.deepEqual(api.rpc('talla_admin_set')[0].body, { p_accepting: false });

  $('[data-drawing]').checked = false;
  $('[data-drawing]').dispatchEvent(new w.Event('change'));
  await until(() => api.rpc('talla_admin_set').length === 2);
  assert.deepEqual(api.rpc('talla_admin_set')[1].body, { p_drawing: false });

  $('[data-closes-save]').click();
  assert.match($('[data-board-message]').textContent, /اختر وقت الإغلاق/);
  $('[data-closes]').value = '2026-11-01T22:00';
  $('[data-closes-save]').click();
  await until(() => api.rpc('talla_admin_set').length === 3);
  assert.equal(api.rpc('talla_admin_set')[2].body.p_closes_at, new Date('2026-11-01T22:00').toISOString());
  $('[data-closes-clear]').click();
  await until(() => api.rpc('talla_admin_set').length === 4);
  assert.deepEqual(api.rpc('talla_admin_set')[3].body, { p_clear_closes: true });

  const exclude = [...d.querySelectorAll('[data-participants] .t-person')].find((li) => li.textContent.includes('بدر خلفان')).querySelector('button');
  assert.equal(exclude.textContent, 'استبعاد');
  exclude.click();
  await until(() => api.rpc('talla_admin_exclude').length === 1);
  assert.deepEqual(api.rpc('talla_admin_exclude')[0].body, { p_key: 'بدر', p_excluded: true });
  const back = [...d.querySelectorAll('[data-participants] .t-person')].find((li) => li.textContent.includes('ريم مبارك')).querySelector('button');
  assert.equal(back.textContent, 'إرجاع');
});

test('draw: an expired session is renewed once before the call; a dead one goes back to sign-in', async (t) => {
  const old = { access_token: 'admin-token-0', refresh_token: 'refresh-0', expires_at: Math.floor(Date.now() / 1000) - 10 };
  const api = adminBackend();
  const { $ } = draw(t, { config: CONFIG, fetch: api.fetch, session: old });
  await until(() => visible($('[data-board]')), 'board after the renewal');
  const renew = api.calls.filter((c) => c.query === '?grant_type=refresh_token');
  assert.equal(renew.length, 1);
  assert.deepEqual(renew[0].body, { refresh_token: 'refresh-0' });
  assert.equal(api.rpc('talla_admin_state')[0].headers.Authorization, 'Bearer admin-token-2');
});

test('draw: a session the server no longer accepts goes back to sign-in', async (t) => {
  const api = adminBackend({ token: () => ({ status: 400, body: { error_code: 'refresh_token_not_found' } }) });
  const old = { access_token: 'admin-token-0', refresh_token: 'refresh-0', expires_at: Math.floor(Date.now() / 1000) - 10 };
  const { w, $ } = draw(t, { config: CONFIG, fetch: api.fetch, session: old });
  await until(() => visible($('[data-login]')), 'sign-in');
  assert.match($('[data-login-message]').textContent, /انتهت الجلسة/);
  assert.equal(w.sessionStorage.getItem('talla.session'), null);
});

test('draw: signing out clears the session and shows the sign-in', async (t) => {
  const api = adminBackend();
  const { w, $ } = draw(t, { config: CONFIG, fetch: api.fetch });
  await signIn(w, $);
  await until(() => visible($('[data-board]')));
  $('[data-logout]').click();
  assert.ok(visible($('[data-login]')));
  assert.equal(w.sessionStorage.getItem('talla.session'), null);
  await until(() => api.calls.some((c) => c.path === '/auth/v1/logout'));
});
