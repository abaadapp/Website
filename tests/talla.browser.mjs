/*
 * فعالية طلة في متصفّحٍ حقيقيّ — WebKit (محرّك Safari) وChromium.
 *
 * مشروعُ Supabase هنا مزيَّفٌ داخل الاختبار (/__supabase/…): يسلك سلوك supabase.sql —
 * والقاعدة الحقيقية نفسها تُختبر على PostgreSQL في deploy/talla/tests/run.sh.
 *
 *   - صفحات أبعاد الأصلية تعمل كما كانت: بلا خطأ، وبعناوينها، ولا تطلب شيئًا من الفعالية.
 *   - نموذج الرأي على الهاتف: يُرسل ويشكر، بلا فيضٍ أفقيّ، وخاناتُه 16px. ومغلقًا يقول ذلك.
 *   - صفحة السحب على شاشة الفعالية: الدخول، ومن يرسل رأيه من هاتفه يظهر خلال ثوانٍ،
 *     والعجلة تقف على الفائز الذي اختاره الخادم، ولا يتكرّر فائز، وإنهاءُ الفعالية يغلق النموذج.
 *   - ولا خطأ في الـ console، ولا اعتراضٌ من CSP.
 *
 * npm run test:layout
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon' };
const KEY = 'sb_publishable_talla_browser_test_000';
const OWNER = { email: 'owner@example.test', password: 'correct horse battery' };

/* ═══════════ مشروعُ Supabase المزيَّف ═══════════ */

const keyOf = (n) => n.normalize('NFKC')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[\s.,_'"\-ـً-ٰٟ]/g, '').toLowerCase();

const sb = {
  reset() {
    this.db = { accepting: true, drawing: true, closes_at: null, responses: [], winners: [] };
    this.tokens = new Set();
  },
  seed(names, consent = true) {
    for (const n of names) this.db.responses.push({ full_name: n, feedback: 'رأي', draw_consent: consent, key: keyOf(n), excluded: false, at: Date.now() });
  },
  open() { return this.db.accepting && (!this.db.closes_at || Date.now() < Date.parse(this.db.closes_at)); },
  state() {
    const groups = new Map();
    for (const r of this.db.responses.filter((x) => x.draw_consent)) {
      const g = groups.get(r.key) || { key: r.key, name: r.full_name, entries: 0, excluded: false, won: false };
      g.entries += 1;
      g.excluded = g.excluded || r.excluded;
      g.won = this.db.winners.some((w) => w.key === r.key);
      groups.set(r.key, g);
    }
    return {
      accepting: this.db.accepting, drawing: this.db.drawing, closes_at: this.db.closes_at, open_now: this.open(),
      responses: this.db.responses.length,
      participants: [...groups.values()],
      winners: this.db.winners.map((w) => ({ round: w.round, name: w.full_name, key: w.key, at: new Date(w.at).toISOString() })),
    };
  },
};
sb.reset();

const raise = (message) => [400, { code: 'P0001', message, details: null, hint: null }];

function supabase(path, query, headers, body) {
  if (headers.apikey !== KEY) return [401, { message: 'No API key found in request' }];
  const bearer = (headers.authorization || '').replace(/^Bearer /, '');
  const admin = sb.tokens.has(bearer);

  if (path === '/auth/v1/token') {
    if (query === '?grant_type=password' && !(body.email === OWNER.email && body.password === OWNER.password)) {
      return [400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }];
    }
    const token = 'adm-' + randomInt(1e9);
    sb.tokens.add(token);
    return [200, { access_token: token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r-' + token, user: { id: 'owner' } }];
  }
  if (path === '/auth/v1/logout') {
    sb.tokens.delete(bearer);
    return [204, null];
  }

  const fn = path.replace('/rest/v1/rpc/', '');
  if (fn === 'talla_status') return [200, { accepting: sb.open() }];
  if (fn === 'talla_submit') {
    if (body.p_website) return [200, { ok: true }];
    if (!sb.open()) return raise('closed');
    const name = String(body.p_name || '').trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 80 || !keyOf(name)) return raise('invalid_name');
    const fb = String(body.p_feedback || '').trim();
    if (fb.length < 3 || fb.length > 2000) return raise('invalid_feedback');
    sb.db.responses.push({ full_name: name, feedback: fb, draw_consent: !!body.p_consent, key: keyOf(name), excluded: false, at: Date.now() });
    return [200, { ok: true }];
  }
  if (!fn.startsWith('talla_admin_')) return [404, { code: 'PGRST202', message: 'not found' }];
  if (!bearer) return [401, { code: '42501', message: `permission denied for function ${fn}` }];
  if (!admin) return raise('forbidden');

  if (fn === 'talla_admin_state') return [200, sb.state()];
  if (fn === 'talla_admin_set') {
    if (body.p_accepting !== undefined && body.p_accepting !== null) sb.db.accepting = body.p_accepting;
    if (body.p_drawing !== undefined && body.p_drawing !== null) sb.db.drawing = body.p_drawing;
    if (body.p_clear_closes) sb.db.closes_at = null;
    else if (body.p_closes_at) sb.db.closes_at = body.p_closes_at;
    return [200, sb.state()];
  }
  if (fn === 'talla_admin_exclude') {
    for (const r of sb.db.responses) if (r.key === body.p_key) r.excluded = body.p_excluded !== false;
    return [200, sb.state()];
  }
  if (fn === 'talla_admin_draw') {
    if (!sb.db.drawing) return raise('draw_closed');
    const pool = sb.state().participants.filter((p) => !p.excluded && !p.won);
    if (!pool.length) return raise('no_candidates');
    const pick = pool[randomInt(pool.length)];
    const round = sb.db.winners.length + 1;
    sb.db.winners.push({ round, key: pick.key, full_name: pick.name, at: Date.now() });
    return [200, { round, name: pick.name, key: pick.key }];
  }
  return [404, { code: 'PGRST202', message: 'not found' }];
}

/* ═══════════ الخادم والمتصفّحان ═══════════ */

let server, base;
const engines = {};

before(async () => {
  server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local');
    let path = decodeURIComponent(url.pathname);

    if (path.startsWith('/__supabase/')) {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const [status, body] = supabase(path.slice('/__supabase'.length), url.search, req.headers, raw ? JSON.parse(raw) : {});
      res.writeHead(status, { 'content-type': 'application/json' });
      return res.end(body === null ? '' : JSON.stringify(body));
    }
    // الصفحتان تتّصلان بالمزيَّف، على الأصل نفسه (CSP: connect-src 'self')
    if (path === '/talla-event/config.js') {
      res.writeHead(200, { 'content-type': 'text/javascript' });
      return res.end(`window.TALLA_CONFIG = { enabled: true, url: '${base}__supabase', key: '${KEY}' };`);
    }

    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(ROOT + path);
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/`;
  [engines.webkit, engines.chromium] = await Promise.all([webkit.launch(), chromium.launch()]);
});

after(async () => {
  await Promise.all(Object.values(engines).map((b) => b.close()));
  server.close();
});

/** صفحةٌ بحجم شاشة؛ تسقط إن ظهر خطأٌ في الـ console أو ملفٌّ محلّيٌّ مفقود — إلّا رفضًا متوقَّعًا من المزيَّف */
async function open(engine, [width, height], path, { expect = [], reducedMotion } = {}) {
  const touch = width < 960 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {};
  const ctx = await engines[engine].newContext({ viewport: { width, height }, ...touch, ...(reducedMotion ? { reducedMotion } : {}) });
  ctx.setDefaultTimeout(20000);
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  const allowed = (text) => expect.some((re) => re.test(text));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !allowed(m.text())) errors.push(m.text()); });
  page.on('request', (r) => requests.push(r.url()));
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith(base) && !allowed(`${r.status()} ${r.url()}`)) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base + path, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return {
    page,
    requests,
    close: async () => {
      await ctx.close();
      assert.deepEqual(errors, [], `${engine} ${width}×${height} /${path}: أخطاء`);
    },
  };
}

/** عناصرُ تخرج عن عرض الشاشة ولا يقصّها أبٌ لها — بالعربية يقع الفيضُ يسارًا فلا يظهر في scrollWidth */
const overflow = (page) => page.evaluate(() => {
  const W = window.innerWidth;
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('noscript, [hidden]')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    let clipped = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') { clipped = true; break; }
    }
    if (!clipped && (r.left < -1 || r.right > W + 1)) bad.push(`${el.tagName}.${el.className} ${Math.round(r.left)}…${Math.round(r.right)}`);
  }
  return bad;
});

const shown = (page, sel) => page.waitForSelector(`${sel}:not([hidden])`);

async function signIn(page) {
  await shown(page, '[data-login]');
  await page.fill('#t-email', OWNER.email);
  await page.fill('#t-password', OWNER.password);
  await page.click('[data-login-submit]');
  await shown(page, '[data-board]');
}

/* ═══════════ ١ · صفحات أبعاد كما كانت ═══════════ */

const ORIGINAL = ['', 'en/', 'privacy/', 'terms/', 'data-deletion/'];
const titleOf = (p) => readFileSync(new URL((p || '') + 'index.html', new URL('../', import.meta.url)), 'utf8').match(/<title>([^<]*)<\/title>/)[1];

for (const engine of ['webkit', 'chromium']) {
  test(`the original Abaad pages still work and load nothing of the event (${engine})`, async () => {
    for (const path of ORIGINAL) {
      for (const size of [[390, 844], [1440, 900]]) {
        const { page, requests, close } = await open(engine, size, path);
        assert.equal(await page.title(), titleOf(path).replace(/&amp;/g, '&'), `/${path}`);
        assert.deepEqual(requests.filter((u) => /talla|__supabase/.test(u)), [], `/${path} طلب شيئًا من الفعالية`);
        await close();
      }
    }
  });
}

/* ═══════════ ٢ · نموذج الرأي على الهاتف ═══════════ */

for (const [engine, size] of [['webkit', [390, 844]], ['chromium', [412, 915]], ['webkit', [320, 568]]]) {
  test(`feedback on a ${size[0]}px phone: sends, thanks, no sideways scroll, 16px fields (${engine})`, async () => {
    sb.reset();
    const { page, close } = await open(engine, size, 'talla-feedback/');
    await shown(page, '[data-form]');
    assert.deepEqual(await overflow(page), []);
    const fonts = await page.$$eval('#t-name, #t-feedback', (els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    fonts.forEach((px) => assert.ok(px >= 16, `${px}px يكبّر Safari الصفحة`));

    await page.fill('#t-name', 'سارة علي');
    await page.fill('#t-feedback', 'تنظيمٌ رائع والمكان جميل، وأقترح لافتاتٍ أوضح للقاعات.');
    await page.check('#t-consent');
    await page.click('[data-submit]');
    await shown(page, '[data-done]');
    assert.equal(await page.isVisible('[data-done-draw]'), true);
    assert.deepEqual(sb.db.responses.map((r) => [r.full_name, r.draw_consent]), [['سارة علي', true]]);
    assert.deepEqual(await overflow(page), []);
    await close();
  });
}

test('feedback when the event is closed says so and shows no form (webkit phone)', async () => {
  sb.reset();
  sb.db.accepting = false;
  const { page, close } = await open('webkit', [390, 844], 'talla-feedback/');
  await shown(page, '[data-closed]');
  assert.equal(await page.isVisible('[data-form]'), false);
  await close();
});

/* ═══════════ ٣ · صفحة السحب على شاشة الفعالية ═══════════ */

for (const engine of ['chromium', 'webkit']) {
  test(`the draw screen: live entries, the wheel stops on the server's winner (${engine})`, async () => {
    sb.reset();
    sb.seed(['أمل سعيد', 'بدر خلفان', 'جميلة راشد', 'داود ناصر', 'هدى يوسف', 'ريم مبارك']);
    sb.seed(['وليد حمد'], false);

    const screen = await open(engine, [1440, 900], 'talla-draw/');
    assert.equal(await screen.page.isVisible('[data-board]'), false, 'لا شيء قبل الدخول');
    await signIn(screen.page);
    assert.equal(await screen.page.textContent('[data-stat-participants]'), '6');
    assert.ok(await screen.page.evaluate(() => {
      const c = document.querySelector('[data-wheel]');
      return c.getContext('2d').getImageData(c.width / 2, c.height / 4, 1, 1).data[3] > 0;
    }), 'العجلة مرسومة');

    // زائرٌ يرسل رأيه من هاتفه، فيظهر على الشاشة دون إعادة تحميل
    const phone = await open(engine, [390, 844], 'talla-feedback/');
    await shown(phone.page, '[data-form]');
    await phone.page.fill('#t-name', 'زائر جديد');
    await phone.page.fill('#t-feedback', 'فعاليةٌ جميلة');
    await phone.page.check('#t-consent');
    await phone.page.click('[data-submit]');
    await shown(phone.page, '[data-done]');
    await screen.page.waitForFunction(() => document.querySelector('[data-stat-participants]').textContent === '7', null, { timeout: 9000 });
    await phone.close();

    await screen.page.click('[data-spin]');
    await shown(screen.page, '[data-winner]');
    const name = await screen.page.textContent('[data-winner-name]');
    assert.equal(sb.db.winners.length, 1);
    assert.equal(name, sb.db.winners[0].full_name, 'الظاهرُ هو ما سجّله الخادم');
    assert.equal(await screen.page.textContent('[data-ticker]'), name, 'العجلةُ وقفت عليه');
    await screen.page.click('[data-winner-close]');
    await screen.page.waitForFunction(() => document.querySelector('[data-stat-participants]').textContent === '6');
    assert.equal(await screen.page.textContent('[data-winners] li b'), name);
    await screen.close();
  });
}

test('every draw is a new name, and an emptied wheel says so (chromium, reduced motion)', async () => {
  sb.reset();
  sb.seed(['الأول', 'الثاني', 'الثالث', 'الرابع']);
  sb.seed(['الأوّل']); // الاسم نفسه بتشكيلٍ آخر: فرصةٌ واحدة
  const screen = await open('chromium', [1280, 800], 'talla-draw/', { reducedMotion: 'reduce', expect: [/status of 400/, /^400 .*talla_admin_draw/] });
  await signIn(screen.page);
  assert.equal(await screen.page.textContent('[data-stat-participants]'), '4');
  for (let i = 0; i < 4; i++) {
    await screen.page.click('[data-spin]');
    await shown(screen.page, '[data-winner]');
    await screen.page.click('[data-winner-close]');
    await screen.page.waitForSelector('[data-spin]:not([disabled])');
  }
  assert.equal(new Set(sb.db.winners.map((w) => w.key)).size, 4, 'لا فائز مكرّر');
  await screen.page.waitForFunction(() => document.querySelector('[data-stat-participants]').textContent === '0');
  await screen.page.click('[data-spin]');
  await screen.page.waitForFunction(() => /لا أحد/.test(document.querySelector('[data-board-message]').textContent));
  assert.equal(sb.db.winners.length, 4);
  await screen.close();
});

test('ending the event closes the form on the visitors\' phones (webkit)', async () => {
  sb.reset();
  sb.seed(['أمل سعيد']);
  const screen = await open('webkit', [1280, 800], 'talla-draw/');
  await signIn(screen.page);
  await screen.page.click('[data-end]');
  await shown(screen.page, '[data-confirm]');
  await screen.page.click('[data-confirm-yes]');
  await screen.page.waitForFunction(() => /انتهت الفعالية/.test(document.querySelector('[data-board-message]').textContent));
  assert.equal(sb.db.accepting, false);
  assert.equal(sb.db.drawing, false);
  await screen.close();

  const phone = await open('webkit', [390, 844], 'talla-feedback/');
  await shown(phone.page, '[data-closed]');
  await phone.close();
});

for (const [engine, size] of [['webkit', [390, 844]], ['chromium', [820, 1180]]]) {
  test(`the draw screen fits a ${size[0]}px screen too (${engine})`, async () => {
    sb.reset();
    sb.seed(['أمل سعيد', 'بدر خلفان', 'اسمٌ طويلٌ جدًّا لمشاركٍ يحبّ أن يكتب اسمه كاملًا مع لقبه']);
    const screen = await open(engine, size, 'talla-draw/');
    assert.deepEqual(await overflow(screen.page), [], 'شاشة الدخول');
    await signIn(screen.page);
    assert.deepEqual(await overflow(screen.page), [], 'اللوحة');
    await screen.close();
  });
}
