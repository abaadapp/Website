/*
 * نموذج «تواصل معنا» في متصفّحٍ حقيقيّ — WebKit (محرّك Safari) وChromium.
 *
 * الطلبُ يذهب إلى CRM أبعاد على app.abaadapp.om، والخادمُ هنا مُزيَّف بـpage.route:
 *   - العربية والإنجليزية تُرسلان وتقولان «تم الاستلام» بعد ردّ الخادم لا قبله.
 *   - الزرّ معطَّلٌ أثناء الطلب، والضغطةُ الثانية لا تُرسل طلبًا ثانيًا.
 *   - الحمولةُ حقولُ الخادم بأسمائها، بلا كعكات، ولا يُفتح تطبيقُ البريد.
 *   - رفضُ حقلٍ يظهر بجانبه، والفشلُ و429 يتركان ما كُتب لمحاولةٍ أخرى تنجح.
 *   - ولا خطأ في الطرفيّة، ولا ملفَّ مفقود.
 *
 * npm run test:layout
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon' };
const CONTACT_URL = 'https://app.abaadapp.om/website/contact';

let server, base;
const engines = {};

before(async () => {
  server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
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

/**
 * الصفحةُ وخادمُ CRM مُزيَّف — كلُّ طلبٍ يُسجَّل، والردُّ ما يختاره الاختبار بعد مهلة.
 * وتسقط إن ظهر خطأٌ في الطرفيّة أو ملفٌّ محلّيٌّ مفقود.
 */
async function open(engine, path, viewport) {
  const touch = viewport.width < 960 ? { isMobile: true, hasTouch: true } : {};
  const ctx = await engines[engine].newContext({ viewport, ...touch });
  const page = await ctx.newPage();
  const errors = [], sent = [], popups = [];
  let reply = { status: 200, body: { ok: true } }, delay = 400, gate = null;

  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    // الردُّ 4xx/5xx المقصود من الخادم المُزيَّف يكتبه المتصفّحُ في الطرفيّة — ليس خطأ الصفحة
    if (m.type() === 'error' && !/status of (4|5)\d\d|Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base)) errors.push(`${r.status()} ${r.url()}`); });
  page.on('popup', (p) => popups.push(p.url()));

  await page.route(CONTACT_URL, async (route) => {
    const req = route.request();
    sent.push({ method: req.method(), body: req.postData() || '', headers: await req.allHeaders() });
    await new Promise((r) => setTimeout(r, delay));
    // ردٌّ محبوسٌ حتّى يطلقه الاختبار — لا يسبق تحقّقًا مهما بطؤ المتصفّح
    if (gate) await gate;
    if (reply === 'network') return route.abort('failed');
    await route.fulfill({
      status: reply.status,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(reply.body),
    });
  });

  await page.goto(base + path, { waitUntil: 'load' });
  const startUrl = page.url();
  return {
    page, sent, popups, startUrl,
    reply: (r, ms = 400) => { reply = r; delay = ms; },
    hold: () => { let release; gate = new Promise((r) => { release = r; }); return () => { gate = null; release(); }; },
    close: async () => {
      await ctx.close();
      assert.deepEqual(errors, [], `${engine} /${path}: أخطاء`);
    },
  };
}

async function fill(page, over = {}) {
  const v = { name: 'سالم الحارثي', company: 'مقهى الأفق', phone: '+968 9123 4567', email: 'salem@example.com', type: 'retail', message: 'نريد نقطة بيع لفرعين.', ...over };
  const f = page.locator('[data-contact-form]');
  for (const k of ['name', 'company', 'phone', 'email', 'message']) await f.locator(`[name="${k}"]`).fill(v[k]);
  await f.locator('[name="type"]').selectOption(v.type);
}

const params = (body) => Object.fromEntries(new URLSearchParams(body));

for (const engine of ['webkit', 'chromium']) {
  test(`${engine}: the Arabic form posts once to the CRM, waits, then says it was received — no mail app`, async () => {
    const s = await open(engine, '', { width: 390, height: 844 });
    try {
      const { page } = s;
      const button = page.locator('[data-contact-form] [type="submit"]');
      await fill(page);
      const release = s.hold();
      await button.click();

      await page.waitForFunction(() => document.querySelector('[data-contact-form] [type="submit"]').disabled);
      assert.equal((await button.textContent()).trim(), 'جارٍ الإرسال…');
      // ضغطةٌ ثانيةٌ أثناء الطلب — الزرُّ معطَّل، وEnter في خانةٍ لا يرسل ثانيًا
      await button.click({ force: true }).catch(() => {});
      await page.locator('[name="name"]').press('Enter');
      assert.equal(await page.locator('[data-sent]').isHidden(), true, '«تم» قبل أن يردّ الخادم');

      release();
      await page.locator('[data-sent]').waitFor({ state: 'visible' });
      assert.equal(s.sent.length, 1, 'أُرسل الطلبُ أكثرَ من مرّة');
      assert.equal(s.sent[0].method, 'POST');
      assert.deepEqual(params(s.sent[0].body), {
        name: 'سالم الحارثي', business_name: 'مقهى الأفق', phone: '+968 9123 4567', email: 'salem@example.com',
        activity_type: 'retail', message: 'نريد نقطة بيع لفرعين.', locale: 'ar', contact_hp: '',
      });
      assert.equal(s.sent[0].headers.cookie, undefined, 'أُرسلت كعكات');
      assert.match(s.sent[0].headers['content-type'], /application\/x-www-form-urlencoded/);

      assert.match(await page.locator('[data-sent]').innerText(), /تم استلام طلبك بنجاح\.[\s\S]*سنتواصل معك قريبًا\./);
      assert.equal(page.url(), s.startUrl, 'تحرّكت الصفحة — فُتح رابطٌ بدل الإرسال');
      assert.deepEqual(s.popups, []);
      assert.equal(await page.locator('[data-sent] [data-mail]').getAttribute('href'), 'mailto:abaadappom@gmail.com');

      await page.locator('[data-action="reset-form"]').click();
      assert.equal(await page.locator('[name="name"]').inputValue(), '', 'بقيت البياناتُ بعد الحفظ');
    } finally {
      await s.close();
    }
  });

  test(`${engine}: the English form posts locale en and answers in English`, async () => {
    const s = await open(engine, 'en/', { width: 1440, height: 900 });
    try {
      const { page } = s;
      await fill(page, { name: 'Sara', company: 'Rose Shop', type: 'subscriptions', message: 'We need recurring billing.' });
      const release = s.hold();
      await page.locator('[data-contact-form] [type="submit"]').click();
      await page.waitForFunction(() => document.querySelector('[data-contact-form] [type="submit"]').textContent === 'Sending…');
      release();
      await page.locator('[data-sent]').waitFor({ state: 'visible' });
      assert.equal(params(s.sent[0].body).locale, 'en');
      assert.equal(params(s.sent[0].body).activity_type, 'subscriptions');
      assert.match(await page.locator('[data-sent]').innerText(), /Your request has been received\.[\s\S]*We’ll contact you soon\./);
      assert.equal(page.url(), s.startUrl);
    } finally {
      await s.close();
    }
  });

  test(`${engine}: refusals, failures and 429 keep what was typed, and a retry goes through`, async () => {
    const s = await open(engine, '', { width: 1440, height: 900 });
    try {
      const { page } = s;
      const status = page.locator('[data-form-status]');
      const submit = () => page.locator('[data-contact-form] [type="submit"]').click();
      const settled = () => page.waitForFunction(() => !document.querySelector('[data-contact-form] [type="submit"]').disabled);
      await fill(page);

      s.reply({ status: 422, body: { ok: false, errors: { email: ['…'] } } }, 100);
      await submit(); await settled();
      assert.equal(await page.locator('[data-err="email"]').isVisible(), true, 'رفضُ الخادم لم يظهر بجانب الحقل');

      s.reply({ status: 500, body: { message: 'Server Error' } }, 100);
      await submit(); await settled();
      assert.equal((await status.textContent()).trim(), 'تعذر إرسال الطلب الآن. حاول مرة أخرى.');
      assert.equal(await page.locator('[name="message"]').inputValue(), 'نريد نقطة بيع لفرعين.', 'مُسحت البيانات بعد فشل');

      s.reply('network', 50);
      await submit(); await settled();
      assert.equal((await status.textContent()).trim(), 'تعذر إرسال الطلب الآن. حاول مرة أخرى.');

      s.reply({ status: 429, body: { ok: false, error: 'too_many_attempts', retry_after: 30 } }, 100);
      await submit(); await settled();
      assert.equal((await status.textContent()).trim(), 'محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.');
      assert.equal(await page.locator('[name="email"]').inputValue(), 'salem@example.com');
      assert.equal(await page.locator('[data-sent]').isHidden(), true);

      s.reply({ status: 200, body: { ok: true } }, 100);
      await submit();
      await page.locator('[data-sent]').waitFor({ state: 'visible' });
      assert.equal(s.sent.length, 5);
      assert.equal(page.url(), s.startUrl);
    } finally {
      await s.close();
    }
  });
}
