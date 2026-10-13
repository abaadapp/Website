/*
 * الموقع التعريفي على abaadapp.om — ما يجب ألّا ينكسر.
 *
 *   - الدخول والتسجيل يذهبان إلى النظام على app.abaadapp.om، لا إلى الموقع نفسه.
 *   - index.html هو رسمُ site.js العربيُّ نفسُه، وبصمتا الملفّين فيه محدَّثتان.
 *   - كل ملفٍّ محلّيٍّ يُشار إليه موجود، ولا أثرَ لروابط Claude Design المؤقتة.
 *   - أساسيات SEO في الرأس، وصفحاتُ ميتا الثلاث باقيةٌ ومربوطة.
 *   - ما يتحرّك في الصفحة يعمل: اللغة، القائمة، القدرات، الأسعار، النموذج.
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
const JS = read('assets/site.js');
const CSS = read('assets/site.css');

const LOGIN = 'https://app.abaadapp.om/login';
const REGISTER = 'https://app.abaadapp.om/register';

/** الصفحة كما يفتحها المتصفّح، وsite.js يعمل فيها — تُغلق مع الاختبار ولو سقط، وإلّا بقيت مؤقّتاتها تعمل */
async function page(t) {
  const vc = new VirtualConsole(); // فتحُ mailto «تنقّلٌ» لا ينفّذه jsdom — لا يعني الاختبار
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', url: 'https://abaadapp.om/', virtualConsole: vc });
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
  assertCtas(new JSDOM(HTML).window.document, 'static');
  const w = await page(t);
  assertCtas(w.document, 'ar');
  click(w, '[data-action="lang"]');
  assertCtas(w.document, 'en');
  assert.match(JS, /var APP = 'https:\/\/app\.abaadapp\.om';/);
});

/* ═══════════ ٢ · index.html = رسمُ site.js ═══════════ */

test('index.html is the Arabic render of site.js, with current file stamps', () => {
  assert.equal(prerender(HTML, JS), HTML, 'index.html لا يطابق site.js — شغّل npm run prerender');
  assert.equal(withStamps(HTML), HTML, 'بصمة site.css أو site.js قديمة — شغّل npm run prerender');
});

/* ═══════════ ٣ · الملفّات والروابط المؤقتة ═══════════ */

test('every local file the site points to exists', () => {
  const doc = new JSDOM(HTML).window.document;
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
});

test('no temporary Claude Design links or runtime remain', () => {
  for (const [name, text] of [['index.html', HTML], ['site.js', JS], ['site.css', CSS]]) {
    assert.doesNotMatch(text, /claude\.ai|anthropic|unpkg\.com|support\.js|image-slot|blob:|<x-dc|__bundler|sc-camel|\{\{/i, name);
    assert.doesNotMatch(text, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, `${name}: مسارٌ مؤقّتٌ من الحزمة`);
  }
});

/* ═══════════ ٤ · الرأس وصفحات ميتا ═══════════ */

test('the head carries the SEO basics', () => {
  const doc = new JSDOM(HTML).window.document;
  const meta = (sel) => doc.querySelector(sel)?.getAttribute('content');
  assert.equal(doc.documentElement.lang, 'ar');
  assert.equal(doc.documentElement.dir, 'rtl');
  assert.ok(doc.title.includes('أبعاد'));
  assert.ok(meta('meta[name="description"]')?.length > 50);
  assert.equal(doc.querySelector('link[rel="canonical"]').href, 'https://abaadapp.om/');
  assert.equal(meta('meta[property="og:url"]'), 'https://abaadapp.om/');
  assert.ok(meta('meta[property="og:title"]'));
  assert.ok(meta('meta[property="og:description"]'));
  assert.match(meta('meta[property="og:image"]'), /^https:\/\/abaadapp\.om\//);
  assert.ok(doc.querySelector('link[rel="icon"]'));
  assert.ok(doc.querySelector('link[rel="apple-touch-icon"]'));
});

test('the three pages Meta reads stay, and the footer links to them', () => {
  for (const p of ['privacy', 'terms', 'data-deletion']) assert.ok(exists(`${p}/index.html`), p);
  const doc = new JSDOM(HTML).window.document;
  assert.ok(doc.querySelector('footer a[href="/privacy/"]'));
  assert.ok(doc.querySelector('footer a[href="/terms/"]'));
});

/* ═══════════ ٥ · ما يتحرّك ═══════════ */

test('the language switch turns the whole page and back', async (t) => {
  const w = await page(t), d = w.document;
  const h1 = () => d.querySelector('h1').textContent;
  assert.equal(h1(), 'كل أعمالك. في مكان واحد.');
  click(w, '[data-action="lang"]');
  assert.equal(d.documentElement.lang, 'en');
  assert.equal(d.documentElement.dir, 'ltr');
  assert.equal(d.querySelector('[data-site]').getAttribute('dir'), 'ltr');
  assert.equal(h1(), 'Your whole business. In one place.');
  assert.equal(d.querySelector('[data-list="nav"] a').textContent, 'Home');
  click(w, '[data-action="lang"]');
  assert.equal(d.documentElement.dir, 'rtl');
  assert.equal(h1(), 'كل أعمالك. في مكان واحد.');
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

test('the whole pricing section turns to English with the same numbers, and back to the same Arabic', async (t) => {
  const w = await page(t), d = w.document;
  const section = () => d.getElementById('pricing');
  const prices = () => [...d.querySelectorAll('[data-price]')].map((e) => e.textContent);
  const shape = () => [...d.querySelectorAll('[data-plan]')].map((c) => c.querySelectorAll('li').length);
  const cards = () => [...d.querySelectorAll('[data-plan]')].map((c) => c.outerHTML);
  const ARABIC = /[؀-ۿ]/;

  const arText = section().textContent, arCards = cards(), arShape = shape();
  assert.match(arText, /الأساسية/);

  click(w, '[data-action="lang"]');
  assert.doesNotMatch(section().textContent, ARABIC, 'بقي نصٌّ عربيّ في الأسعار بالإنجليزية');
  assert.deepEqual([...d.querySelectorAll('[data-plan] h3')].map((h) => h.textContent), ['Basic', 'Professional', 'Enterprise']);
  assert.match(section().textContent, /Most popular/);
  assert.equal(d.querySelector('[data-billing="m"]').textContent, 'Monthly');
  assert.equal(d.querySelector('[data-billing="y"]').textContent, 'Yearly');
  assert.deepEqual(prices(), ['9.900', '29.900', '69.900']);
  assert.equal(d.querySelector('[data-plan="0"] [data-period]').textContent, 'OMR / month');
  assert.deepEqual(shape(), arShape, 'تغيّر عددُ البنود بين اللغتين');

  click(w, '[data-billing="y"]');
  assert.doesNotMatch(section().textContent, ARABIC);
  assert.deepEqual(prices(), ['99', '299', '699']);
  assert.deepEqual([...d.querySelectorAll('[data-was] s')].map((s) => s.textContent), ['118.800', '358.800', '838.800']);
  assert.equal(d.querySelector('[data-plan="0"] [data-period]').textContent, 'OMR / year');
  assert.equal(d.querySelector('[data-plan="0"] [data-was]').textContent, 'instead of 118.800 OMR');
  assert.equal(d.querySelector('[data-save]').textContent, 'Save two months');

  // والسنويّ يبقى سنويًّا حين تتبدّل اللغة
  click(w, '[data-action="lang"]');
  assert.deepEqual(prices(), ['99', '299', '699']);
  assert.equal(d.querySelector('[data-plan="0"] [data-period]').textContent, 'ر.ع / سنويًا');

  click(w, '[data-billing="m"]');
  assert.equal(section().textContent, arText, 'العربية لم تعد كما كانت');
  assert.deepEqual(cards(), arCards);
});

test('one official contact number on the site and the three legal pages', () => {
  const OFFICIAL = '71141624';
  for (const f of ['index.html', 'assets/site.js', 'privacy/index.html', 'terms/index.html', 'data-deletion/index.html']) {
    const numbers = [...read(f).matchAll(/\+?968[\s-]?(\d[\d\s]{6,9}\d)/g)].map((m) => m[1].replace(/\s/g, ''));
    assert.ok(numbers.length > 0, `${f}: لا رقم تواصل`);
    numbers.forEach((n) => assert.equal(n, OFFICIAL, `${f}: رقمٌ غير الرسمي ${n}`));
  }
});
