/*
 * الموقع التعريفي على abaadapp.om — ما يجب ألّا ينكسر.
 *
 *   - الدخول والتسجيل يذهبان إلى النظام على app.abaadapp.om، لا إلى الموقع نفسه.
 *   - index.html وen/index.html هما رسمُ site.js نفسُه بلغتيهما، وبصمتا الملفّين فيهما محدَّثتان.
 *   - كل ملفٍّ محلّيٍّ يُشار إليه موجود، ولا أثرَ لروابط Claude Design المؤقتة.
 *   - صفحاتُ ميتا الثلاث باقيةٌ ومربوطة. (ورأسُ الصفحتين للبحث في seo.test.mjs)
 *   - ما يتحرّك في الصفحة يعمل: القائمة، القدرات، الأسعار، النموذج — بالعربية والإنجليزية.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { prerender, withStamps } from '../tools/prerender.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const exists = (p) => existsSync(new URL(p.replace(/^\//, ''), root));

const HTML = read('index.html');
const EN = read('en/index.html');
const JS = read('assets/site.js');
const CSS = read('assets/site.css');

const LOGIN = 'https://app.abaadapp.om/login';
const REGISTER = 'https://app.abaadapp.om/register';

/** الصفحة كما يفتحها المتصفّح، وsite.js يعمل فيها — تُغلق مع الاختبار ولو سقط، وإلّا بقيت مؤقّتاتها تعمل */
async function page(t, lang = 'ar') {
  const vc = new VirtualConsole(); // فتحُ mailto «تنقّلٌ» لا ينفّذه jsdom — لا يعني الاختبار
  const [html, url] = lang === 'en' ? [EN, 'https://abaadapp.om/en/'] : [HTML, 'https://abaadapp.om/'];
  const dom = new JSDOM(html, { runScripts: 'outside-only', url, virtualConsole: vc });
  if (dom.window.document.readyState !== 'complete') {
    await new Promise((r) => dom.window.addEventListener('load', r));
  }
  t.after(() => dom.window.close());
  dom.window.eval(JS);
  return dom.window;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (w, sel) => w.document.querySelector(sel).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

function ctaHrefs(doc) {
  const hrefs = (sel) => [...doc.querySelectorAll(sel)].map((a) => a.getAttribute('href'));
  return {
    login: hrefs('a[data-i18n="login"]'),
    start: hrefs('a[data-i18n="startNow"], a[data-i18n="heroCta"]'),
    plans: [...doc.querySelectorAll('[data-plan]')].map((c) => [...c.querySelectorAll('a')].pop().getAttribute('href')),
    footLogin: [...doc.querySelectorAll('[data-list="footNav"] a')].pop().getAttribute('href'),
    all: hrefs('a[href]'),
  };
}

function assertCtas(doc, lang) {
  const c = ctaHrefs(doc);
  assert.ok(c.login.length >= 2, `${lang}: لا زرّ دخول`);
  c.login.forEach((h) => assert.equal(h, LOGIN, `${lang}: «تسجيل الدخول» لا يذهب إلى النظام`));
  assert.ok(c.start.length >= 4, `${lang}: أزرار «ابدأ» ناقصة`);
  c.start.forEach((h) => assert.equal(h, REGISTER, `${lang}: «ابدأ» لا يذهب إلى التسجيل`));
  assert.equal(c.plans.length, 3);
  c.plans.forEach((h) => assert.equal(h, REGISTER, `${lang}: زرّ الباقة لا يذهب إلى التسجيل`));
  assert.equal(c.footLogin, LOGIN, `${lang}: دخول التذييل`);
  // ولا رابطٌ نسبيّ إلى الدخول أو التسجيل: يبقى على abaadapp.om ولا يصل إلى النظام
  c.all.filter((h) => /login|register/i.test(h)).forEach((h) => assert.ok(h === LOGIN || h === REGISTER, `${lang}: ${h}`));
}

/* ═══════════ ١ · الدخول والتسجيل إلى النظام ═══════════ */

test('login and get started go to the system on app.abaadapp.om, in both languages', async (t) => {
  assertCtas(new JSDOM(HTML).window.document, 'static ar');
  assertCtas(new JSDOM(EN).window.document, 'static en');
  assertCtas((await page(t)).document, 'ar');
  assertCtas((await page(t, 'en')).document, 'en');
  assert.match(JS, /var APP = 'https:\/\/app\.abaadapp\.om';/);
});

/* ═══════════ ٢ · index.html = رسمُ site.js ═══════════ */

test('index.html and en/index.html are the renders of site.js, with current file stamps', () => {
  assert.equal(prerender(HTML, JS, 'ar'), HTML, 'index.html لا يطابق site.js — شغّل npm run prerender');
  assert.equal(withStamps(HTML), HTML, 'بصمة site.css أو site.js قديمة — شغّل npm run prerender');
  assert.equal(withStamps(prerender(HTML, JS, 'en')), EN, 'en/index.html لا يطابق index.html وsite.js — شغّل npm run prerender');
});

/* ═══════════ ٣ · الملفّات والروابط المؤقتة ═══════════ */

test('every local file the site points to exists', () => {
  for (const html of [HTML, EN]) assertLocalFiles(html);
});

function assertLocalFiles(html) {
  const doc = new JSDOM(html).window.document;
  const local = [...doc.querySelectorAll('[src],[href]')]
    .map((el) => el.getAttribute('src') || el.getAttribute('href'))
    .filter((u) => u.startsWith('/') && !u.startsWith('//'))
    .map((u) => u.split(/[?#]/)[0]);
  const fromJs = [...JS.matchAll(/IMG \+ '([a-z0-9-]+\.(?:webp|png|svg|jpg))/g)].map((m) => '/assets/img/' + m[1]);
  const og = doc.querySelector('meta[property="og:image"]').content.replace('https://abaadapp.om', '');
  const files = [...new Set([...local, ...fromJs, og, '/favicon.ico'])];
  assert.ok(files.length > 15);
  for (const f of files) {
    const path = f.endsWith('/') ? f + 'index.html' : f;
    assert.ok(exists(path), `مفقود: ${f}`);
  }
}

test('no temporary Claude Design links or runtime remain', () => {
  for (const [name, text] of [['index.html', HTML], ['en/index.html', EN], ['site.js', JS], ['site.css', CSS]]) {
    assert.doesNotMatch(text, /claude\.ai|anthropic|unpkg\.com|support\.js|image-slot|blob:|<x-dc|__bundler|sc-camel|\{\{/i, name);
    assert.doesNotMatch(text, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, `${name}: مسارٌ مؤقّتٌ من الحزمة`);
  }
});

/* ═══════════ ٤ · صفحات ميتا ═══════════ */

test('the three pages Meta reads stay, and the footer links to them in both languages', () => {
  for (const p of ['privacy', 'terms', 'data-deletion']) assert.ok(exists(`${p}/index.html`), p);
  for (const html of [HTML, EN]) {
    const doc = new JSDOM(html).window.document;
    assert.ok(doc.querySelector('footer a[href="/privacy/"]'));
    assert.ok(doc.querySelector('footer a[href="/terms/"]'));
  }
});

/* ═══════════ ٥ · ما يتحرّك ═══════════ */

test('the language links join / and /en/, and the script keeps each page in its own language', async (t) => {
  assert.doesNotMatch(HTML + EN + JS, /data-action="lang"|setLang/, 'بقي تبديلٌ للغة بالسكربت');
  const links = (doc) => [...doc.querySelectorAll('[data-lang-link]')].map((a) => [a.getAttribute('href'), a.getAttribute('hreflang'), a.textContent]);
  const pair = (href, hreflang, text) => [[href, hreflang, text], [href, hreflang, text]];
  // بلا JavaScript: رابطٌ عاديّ في الرأس وفي قائمة الجوّال
  assert.deepEqual(links(new JSDOM(HTML).window.document), pair('/en/', 'en', 'English'));
  assert.deepEqual(links(new JSDOM(EN).window.document), pair('/', 'ar', 'العربية'));
  // والسكربت لا يقلب صفحةً إلى اللغة الأخرى
  for (const [lang, h1, link] of [['ar', 'كل أعمالك. في مكان واحد.', '/en/'], ['en', 'Your whole business. In one place.', '/']]) {
    const d = (await page(t, lang)).document;
    assert.equal(d.querySelector('h1').textContent, h1, lang);
    assert.equal(d.querySelector('[data-list="nav"] a').textContent, lang === 'ar' ? 'الرئيسية' : 'Home');
    assert.equal(d.querySelector('[data-lang-link]').getAttribute('href'), link);
    assert.equal(d.documentElement.lang, lang);
  }
});

test('the mobile menu opens and a link closes it', async (t) => {
  const w = await page(t), d = w.document;
  assert.ok(d.querySelector('[data-menu]').hidden);
  click(w, '[data-action="menu"]');
  assert.equal(d.querySelector('[data-menu]').hidden, false);
  click(w, '[data-menu] [data-close-menu]');
  assert.ok(d.querySelector('[data-menu]').hidden);
});

test('yearly billing shows the yearly price and what it replaces', async (t) => {
  const w = await page(t), d = w.document;
  const basic = () => d.querySelector('[data-plan="0"]');
  assert.equal(basic().querySelector('[data-price]').textContent, '9.900');
  click(w, '[data-billing="y"]');
  assert.equal(basic().querySelector('[data-price]').textContent, '99');
  assert.equal(basic().querySelector('[data-period]').textContent, 'ر.ع / سنويًا');
  assert.match(basic().querySelector('[data-was]').textContent, /118\.800/);
  assert.equal(d.querySelector('[data-save]').style.opacity, '1');
  click(w, '[data-billing="m"]');
  assert.equal(basic().querySelector('[data-price]').textContent, '9.900');
  assert.equal(basic().querySelector('[data-was]').textContent, '');
});

test('a capability card opens its own panel', async (t) => {
  const w = await page(t), d = w.document;
  click(w, '[data-cap="4"]');
  await wait(250);
  const panel = d.querySelector('[data-cap-panel]');
  assert.match(panel.textContent, /افهم التكاليف والخسائر بوضوح\./);
  assert.equal(panel.getAttribute('data-g'), 'detail-xwide');
  assert.equal(d.querySelector('[data-cap="4"]').getAttribute('aria-expanded'), 'true');
  assert.equal(d.querySelector('[data-cap="0"]').getAttribute('aria-expanded'), 'false');
});

test('the contact form refuses empty fields and then opens a ready email — never a fake "sent"', async (t) => {
  const w = await page(t), d = w.document;
  const form = d.querySelector('[data-contact-form]');
  form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  const shown = [...d.querySelectorAll('[data-err]')].filter((e) => !e.hidden).map((e) => e.dataset.err);
  assert.deepEqual(shown, ['name', 'company', 'phone', 'email', 'type', 'message']);
  assert.ok(d.querySelector('[data-sent]').hidden);

  const set = (n, v) => { form.elements[n].value = v; };
  set('name', 'سالم الحارثي'); set('company', 'مقهى الأفق'); set('phone', '+968 9123 4567');
  set('email', 'salem@example.com'); set('type', 'التجزئة'); set('message', 'نريد نقطة بيع لفرعين.');
  form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));

  assert.equal(d.querySelector('[data-sent]').hidden, false);
  assert.ok(form.hidden);
  const href = d.querySelector('[data-mail-again]').getAttribute('href');
  assert.match(href, /^mailto:abaadappom@gmail\.com\?subject=/);
  assert.match(decodeURIComponent(href), /سالم الحارثي/);
  assert.match(decodeURIComponent(href), /مقهى الأفق/);
  assert.doesNotMatch(d.querySelector('[data-sent]').textContent, /تم إرسال طلبك/);

  click(w, '[data-action="reset-form"]');
  assert.equal(form.hidden, false);
  assert.equal(form.elements.name.value, '');
});

/* ═══════════ ٦ · الأسعار باللغتين، ورقمٌ واحد ═══════════ */

test('the pricing section is wholly English on /en/, with the same numbers and plans as the Arabic', async (t) => {
  const ar = new JSDOM(HTML).window.document, en = new JSDOM(EN).window.document;
  const prices = (d) => [...d.querySelectorAll('[data-price]')].map((e) => e.textContent);
  const shape = (d) => [...d.querySelectorAll('[data-plan]')].map((c) => c.querySelectorAll('li').length);
  const ARABIC = /[؀-ۿ]/;

  assert.match(ar.getElementById('pricing').textContent, /الأساسية/);
  assert.doesNotMatch(en.getElementById('pricing').textContent, ARABIC, 'بقي نصٌّ عربيّ في الأسعار بالإنجليزية');
  assert.deepEqual([...en.querySelectorAll('[data-plan] h3')].map((h) => h.textContent), ['Basic', 'Professional', 'Enterprise']);
  assert.match(en.getElementById('pricing').textContent, /Most popular/);
  assert.equal(en.querySelector('[data-billing="m"]').textContent, 'Monthly');
  assert.equal(en.querySelector('[data-billing="y"]').textContent, 'Yearly');
  assert.deepEqual(prices(en), ['9.900', '29.900', '69.900']);
  assert.deepEqual(prices(ar), ['9.900', '29.900', '69.900']);
  assert.equal(en.querySelector('[data-plan="0"] [data-period]').textContent, 'OMR / month');
  assert.deepEqual(shape(en), shape(ar), 'تغيّر عددُ البنود بين اللغتين');

  // والسنويّ بالإنجليزية حين يعمل السكربت
  const w = await page(t, 'en'), d = w.document;
  click(w, '[data-billing="y"]');
  assert.doesNotMatch(d.getElementById('pricing').textContent, ARABIC);
  assert.deepEqual(prices(d), ['99', '299', '699']);
  assert.deepEqual([...d.querySelectorAll('[data-was] s')].map((s) => s.textContent), ['118.800', '358.800', '838.800']);
  assert.equal(d.querySelector('[data-plan="0"] [data-period]').textContent, 'OMR / year');
  assert.equal(d.querySelector('[data-plan="0"] [data-was]').textContent, 'instead of 118.800 OMR');
  assert.equal(d.querySelector('[data-save]').textContent, 'Save two months');
  click(w, '[data-billing="m"]');
  assert.equal(d.getElementById('pricing').textContent, en.getElementById('pricing').textContent, 'الشهريّ لم يعد كما كان');
});

test('one official contact number on the site and the three legal pages', () => {
  const OFFICIAL = '71141624';
  for (const f of ['index.html', 'en/index.html', 'assets/site.js', 'privacy/index.html', 'terms/index.html', 'data-deletion/index.html']) {
    const numbers = [...read(f).matchAll(/\+?968[\s-]?(\d[\d\s]{6,9}\d)/g)].map((m) => m[1].replace(/\s/g, ''));
    assert.ok(numbers.length > 0, `${f}: لا رقم تواصل`);
    numbers.forEach((n) => assert.equal(n, OFFICIAL, `${f}: رقمٌ غير الرسمي ${n}`));
  }
});
