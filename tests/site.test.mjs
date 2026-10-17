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
import { arabicLeft } from './arabic.mjs';

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

test('/en/ stays English in every capability card and flow tab the script draws', async (t) => {
  const w = await page(t, 'en'), d = w.document;
  assert.deepEqual(arabicLeft(d), [], 'عند التحميل');
  for (const i of [1, 2, 3, 4, 0]) {
    click(w, `[data-cap="${i}"]`);
    await wait(250);
    assert.deepEqual(arabicLeft(d), [], `بطاقة القدرة ${i}`);
  }
  assert.equal(d.querySelector('[data-cap-panel] img[src$="pos.webp"]').alt, 'Abaad point of sale');
  click(w, '[data-cap="4"]');
  await wait(250);
  assert.equal(d.querySelector('[data-cap-panel] img[src$="costs.webp"]').alt, 'Abaad costs and losses');
  for (const i of [1, 2, 0]) {
    click(w, `[data-flow="${i}"]`);
    await wait(250);
    assert.deepEqual(arabicLeft(d), [], `تبويب الترابط ${i}`);
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

/*
 * النموذج يُرسَل إلى CRM أبعاد على النظام — لا يفتح بريدَ الزائر.
 * والخادمُ مُزيَّف هنا (jsdom بلا fetch): يُسجَّل ما أُرسل، ويُجاب بما يختاره الاختبار.
 */
const CONTACT_URL = 'https://app.abaadapp.om/website/contact';

async function contactPage(t, lang = 'ar') {
  const vc = new VirtualConsole();
  const navigations = [];
  vc.on('jsdomError', (e) => { if (/navigation/i.test(e.message)) navigations.push(e.message); });
  const [html, url] = lang === 'en' ? [EN, 'https://abaadapp.om/en/'] : [HTML, 'https://abaadapp.om/'];
  const dom = new JSDOM(html, { runScripts: 'outside-only', url, virtualConsole: vc });
  if (dom.window.document.readyState !== 'complete') {
    await new Promise((r) => dom.window.addEventListener('load', r));
  }
  t.after(() => dom.window.close());
  const w = dom.window;
  const calls = [];
  let answer = () => ({ status: 200, body: { ok: true } });
  w.fetch = (input, init) => {
    calls.push({ url: String(input), init, params: new w.URLSearchParams(init.body.toString()) });
    return new Promise((resolve, reject) => {
      w.setTimeout(() => {
        const a = answer();
        if (a === 'network') return reject(new w.TypeError('Failed to fetch'));
        resolve({ status: a.status, json: () => (a.body === undefined ? Promise.reject(new Error('no json')) : Promise.resolve(a.body)) });
      }, 30);
    });
  };
  w.eval(JS);
  const d = w.document, form = d.querySelector('[data-contact-form]');
  const fill = (over = {}) => {
    const v = { name: 'سالم الحارثي', company: 'مقهى الأفق', phone: '+968 9123 4567', email: 'salem@example.com', type: 'retail', message: 'نريد نقطة بيع لفرعين.', ...over };
    for (const [k, val] of Object.entries(v)) form.elements[k].value = val;
  };
  const submit = () => form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  const status = () => { const s = d.querySelector('[data-form-status]'); return s.hidden ? '' : s.textContent; };
  const errs = () => [...d.querySelectorAll('[data-err]')].filter((e) => !e.hidden).map((e) => e.dataset.err);
  const button = () => form.querySelector('[type="submit"]');
  return { w, d, form, calls, navigations, fill, submit, status, errs, button, answer: (fn) => { answer = fn; } };
}

test('the contact form refuses empty fields in the browser and sends nothing', async (t) => {
  const c = await contactPage(t);
  c.submit();
  assert.deepEqual(c.errs(), ['name', 'company', 'phone', 'email', 'type', 'message']);
  assert.equal(c.calls.length, 0);
  assert.ok(c.d.querySelector('[data-sent]').hidden);
});

test('the contact form posts to the CRM, once, and says "received" only after the server saved it', async (t) => {
  const c = await contactPage(t);
  c.fill();
  c.submit();

  // أثناء الطلب: الزرّ معطَّل ويقول «جارٍ الإرسال…»، وضغطةٌ ثانيةٌ لا تُرسل ثانيًا
  assert.equal(c.button().disabled, true);
  assert.equal(c.button().textContent, 'جارٍ الإرسال…');
  c.submit();
  assert.equal(c.calls.length, 1, 'ضغطةٌ ثانية أرسلت طلبًا ثانيًا');
  assert.ok(c.d.querySelector('[data-sent]').hidden, '«تم» قبل أن يردّ الخادم');

  const call = c.calls[0];
  assert.equal(call.url, CONTACT_URL);
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.credentials, 'omit');
  assert.deepEqual(Object.fromEntries(call.params), {
    name: 'سالم الحارثي', business_name: 'مقهى الأفق', phone: '+968 9123 4567', email: 'salem@example.com',
    activity_type: 'retail', message: 'نريد نقطة بيع لفرعين.', locale: 'ar', contact_hp: '',
  });
  for (const k of ['source', 'stage', 'status', 'assigned_to']) assert.equal(call.params.has(k), false, `أُرسل ${k}`);

  await wait(60);
  assert.equal(c.d.querySelector('[data-sent]').hidden, false);
  assert.ok(c.form.hidden);
  assert.match(c.d.querySelector('[data-sent]').textContent, /تم استلام طلبك بنجاح\.\s*سنتواصل معك قريبًا\./);
  assert.equal(c.form.elements.name.value, '', 'لم تُمسح الخانات بعد الحفظ');
  assert.equal(c.button().disabled, false);
  assert.deepEqual(c.navigations, [], 'فُتح تطبيقُ البريد');
  assert.equal(c.w.location.href, 'https://abaadapp.om/');

  // والبريدُ اليدويّ باقٍ رابطًا اختياريًّا
  assert.equal(c.d.querySelector('[data-sent] [data-mail]').getAttribute('href'), 'mailto:abaadappom@gmail.com');

  c.d.querySelector('[data-action="reset-form"]').dispatchEvent(new c.w.MouseEvent('click', { bubbles: true }));
  assert.equal(c.form.hidden, false);
});

test('the English form posts locale en and answers in English', async (t) => {
  const c = await contactPage(t, 'en');
  c.fill({ name: 'Sara', company: 'Rose Shop', type: 'ecommerce', message: 'We need an online store.' });
  c.submit();
  assert.equal(c.button().textContent, 'Sending…');
  assert.equal(c.calls[0].params.get('locale'), 'en');
  assert.equal(c.calls[0].params.get('activity_type'), 'ecommerce');
  await wait(60);
  assert.match(c.d.querySelector('[data-sent]').textContent, /Your request has been received\.\s*We’ll contact you soon\./);
  assert.deepEqual(c.navigations, []);
});

test('a refused field shows beside it, and a failed send keeps everything typed for a retry', async (t) => {
  const c = await contactPage(t);

  c.answer(() => ({ status: 422, body: { ok: false, errors: { business_name: ['…'], email: ['…'] } } }));
  c.fill();
  c.submit();
  await wait(60);
  assert.deepEqual(c.errs(), ['company', 'email']);
  assert.equal(c.form.elements.company.value, 'مقهى الأفق');

  c.answer(() => ({ status: 500, body: undefined }));
  c.submit();
  await wait(60);
  assert.equal(c.status(), 'تعذر إرسال الطلب الآن. حاول مرة أخرى.');
  assert.equal(c.form.elements.message.value, 'نريد نقطة بيع لفرعين.', 'مُسحت البيانات بعد فشل');
  assert.ok(c.d.querySelector('[data-sent]').hidden);
  assert.equal(c.button().disabled, false);

  c.answer(() => 'network');
  c.submit();
  await wait(60);
  assert.equal(c.status(), 'تعذر إرسال الطلب الآن. حاول مرة أخرى.');

  c.answer(() => ({ status: 429, body: { ok: false, error: 'too_many_attempts', retry_after: 40 } }));
  c.submit();
  await wait(60);
  assert.equal(c.status(), 'محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.');
  assert.equal(c.form.elements.email.value, 'salem@example.com');

  // وإعادةُ المحاولة تنجح
  c.answer(() => ({ status: 200, body: { ok: true } }));
  c.submit();
  await wait(60);
  assert.equal(c.d.querySelector('[data-sent]').hidden, false);
  assert.equal(c.calls.length, 5);
  assert.deepEqual(c.navigations, []);
});

test('the site carries no mail-app submit and no secret — the form is a public endpoint', () => {
  assert.doesNotMatch(JS, /location\.href\s*=/, 'النموذج ما زال ينقل الصفحة');
  assert.doesNotMatch(JS, /mailto:[^'"]*\?subject/, 'ما زال يبني رسالةً جاهزة');
  for (const [name, src] of [['site.js', JS], ['index.html', HTML], ['en/index.html', EN]]) {
    assert.doesNotMatch(src, /MAIL_PASSWORD|RESEND|SMTP|api[_-]?key|secret|Bearer\s|re_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{12,}/i, `${name}: سرٌّ في ملفٍّ عامّ`);
  }
  assert.match(JS, /var CONTACT_URL = APP \+ '\/website\/contact';/);
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

test('each plan lists only what it adds to the one before, by the same names, in both languages', () => {
  /*
   * كانت «المؤسسات» تقول «كل مميزات الاحترافية» ثم تعيد ثمانيةَ بنودٍ منها،
   * والشيءُ نفسه يُسمّى في بطاقةٍ «أدوات التسويق» وفي أخرى «الكوبونات والعروض».
   * فيقرأ الزائر إضافاتٍ ليست إضافات، ولا يعرف لماذا يدفع أكثر.
   *
   * وفي النظام: الأساسية تُغلق القدراتِ السبع، والاحترافية تفتحها كلَّها،
   * والمؤسساتُ مثلُها بحدودٍ أعلى — وهذا ما يجب أن تقوله البطاقات.
   */
  const title = (li) => (li.querySelector('span > span') || li).textContent.trim();
  const plan = (d, i) => {
    const c = d.querySelector(`[data-plan="${i}"]`);
    const list = (sel) => [...c.querySelectorAll(`${sel} > li`)];
    return {
      name: c.querySelector('h3').textContent,
      incH: c.querySelector('[data-inc]').previousElementSibling.textContent,
      inc: list('[data-inc]').map(title),
      incD: list('[data-inc]').map((li) => li.querySelector('span > span + span')?.textContent ?? ''),
      exc: list('[data-exc]').map(title),
      // «فرع واحد» بلا رقم — والأرقام يُقرأ منها حدّا الاحترافية والمؤسسات وحدهما
      limits: list('[data-limits]').map((li) => (li.textContent.match(/[\d,]+/) || [''])[0]),
      wa: c.querySelector('[data-inc] ~ ul:not([data-exc])') ? [...c.querySelectorAll('[data-inc] ~ ul:not([data-exc]) > li')].map(title) : [],
    };
  };
  const WA = { ar: 'واتساب', en: 'WhatsApp' };

  for (const [lang, html] of [['ar', HTML], ['en', EN]]) {
    const d = new JSDOM(html).window.document;
    const [basic, pro, ent] = [0, 1, 2].map((i) => plan(d, i));

    // ما يُغلق في الأساسية تفتحه الاحترافية — بالاسم نفسه، وواتساب في قسمه الأخضر
    assert.deepEqual(basic.exc, [...pro.inc, WA[lang]], `${lang}: «غير مشمول» في الأساسية لا يطابق ما تضيفه الاحترافية`);
    assert.equal(basic.exc.length, 7, `${lang}: القدراتُ في النظام سبع`);
    assert.ok(pro.wa.length > 0 && ent.wa.length > 0, `${lang}: واتساب`);
    assert.deepEqual(ent.wa, pro.wa, `${lang}: واتساب المؤسسات بصياغةٍ غير الاحترافية`);

    // كلُّ بطاقةٍ تسمّي التي قبلها، ولا تعيد شيئًا منها
    assert.ok(pro.incH.includes(basic.name), `${lang}: ${pro.incH}`);
    assert.ok(ent.incH.includes(pro.name), `${lang}: ${ent.incH}`);
    assert.deepEqual(ent.inc.filter((x) => pro.inc.includes(x) || basic.inc.includes(x)), [], `${lang}: المؤسسات تكرّر`);
    assert.deepEqual(pro.inc.filter((x) => basic.inc.includes(x)), [], `${lang}: الاحترافية تكرّر`);
    [...pro.inc, ...ent.inc].forEach((x, i) => assert.ok([...pro.incD, ...ent.incD][i], `${lang}: «${x}» بلا شرح`));

    // وما تزيده المؤسسات هو حدودُها: كلُّ سطرٍ يذكر رقمَها ورقمَ الاحترافية الذي يحلّ محلَّه
    assert.equal(ent.inc.length, ent.limits.length);
    ent.incD.forEach((dsc, i) => {
      assert.ok(dsc.includes(ent.limits[i]), `${lang}: «${dsc}» لا يذكر ${ent.limits[i]}`);
      assert.ok(dsc.includes(pro.limits[i]), `${lang}: «${dsc}» لا يذكر ${pro.limits[i]}`);
    });
  }
});

test('the usage limits are the ones the system enforces, the owner among the users, and more than ten branches asks', () => {
  /*
   * الحدُّ يفرضه النظام لا الموقع (`PlanLimits` في abaad.Saas، وترحيل
   * 2026_10_17_120000_the_plans_climb_one_ladder_of_limits). فإن تغيّر رقمٌ هنا
   * وحده صار الموقع يبيع ما يردّه النظام — يتغيّر هناك أوّلًا ثمّ هنا.
   */
  const LADDER = { branches: ['1', '3', '10'], users: ['3', '15', '100'], products: ['500', '10,000', null] };
  const OWNER = { ar: 'مع المالك', en: 'including the owner' };
  const UNLIMITED = { ar: 'منتجات غير محدودة', en: 'Unlimited products' };

  for (const [lang, html] of [['ar', HTML], ['en', EN]]) {
    const d = new JSDOM(html).window.document;
    [0, 1, 2].forEach((i) => {
      const c = d.querySelector(`[data-plan="${i}"]`);
      const [branches, users, products] = [...c.querySelectorAll('[data-limits] > li')].map((li) => li.textContent);
      // «فرع واحد» بالعربية كلمةٌ لا رقم
      const num = (s) => (s.match(/[\d,]+/) || [s.includes('واحد') ? '1' : ''])[0];

      assert.equal(num(branches), LADDER.branches[i], `${lang} ${i}: الفروع`);
      assert.equal(num(users), LADDER.users[i], `${lang} ${i}: المستخدمون`);
      assert.ok(users.includes(OWNER[lang]), `${lang} ${i}: «${users}» لا تقول إنّ المالك منهم`);
      if (LADDER.products[i] === null) assert.equal(products, UNLIMITED[lang], `${lang} ${i}: المنتجات`);
      else assert.equal(num(products), LADDER.products[i], `${lang} ${i}: المنتجات`);

      // وما فوق عشرة فروع يُسأل عنه — من المؤسسات وحدها، وإلى «تواصل معنا»
      const more = c.querySelector('[data-more]');
      if (i === 2) assert.equal(more?.getAttribute('href'), '#contact', `${lang}: لا رابطَ لأكثر من عشرة فروع`);
      else assert.equal(more, null, `${lang} ${i}: رابطُ «أكثر من 10 فروع» في غير المؤسسات`);
    });
  }
});

test('the device bundles and the custom app sit under the plans in both languages, and ask through the contact form', async (t) => {
  /*
   * كانت في التصميم ولم تصل إلى الموقع: زائرٌ يريد آيبادًا ودرجَ نقدٍ مع النظام
   * لم يكن يجد أنّها تُباع. وزرُّها إلى «تواصل معنا» لا إلى التسجيل — لا سعرَ
   * ثابتًا لباقة الأجهزة يُدفع عند التسجيل.
   */
  const cards = (d) => [...d.querySelectorAll('#pricing [data-extra]')];
  const read = (d) => cards(d).map((c) => ({
    name: c.querySelector('h3').textContent,
    price: c.querySelector('[data-extra-price]').textContent,
    href: c.querySelector('a').getAttribute('href'),
  }));
  const ar = new JSDOM(HTML).window.document, en = new JSDOM(EN).window.document;

  assert.deepEqual(read(ar), [
    { name: 'تطبيق هاتف خاص مخصص', price: '880 ر.ع', href: '#contact' },
    { name: 'باقة الأجهزة الأولى', price: 'حسب الطلب', href: '#contact' },
    { name: 'باقة الأجهزة الثانية', price: 'حسب الطلب', href: '#contact' },
  ]);
  assert.deepEqual(read(en), [
    { name: 'Your own custom mobile app', price: '880 OMR', href: '#contact' },
    { name: 'Device Bundle 1', price: 'On request', href: '#contact' },
    { name: 'Device Bundle 2', price: 'On request', href: '#contact' },
  ]);
  assert.match(cards(ar)[2].textContent, /آيباد \+ ستاند \+ طابعة حرارية \+ درج كاش/);
  assert.match(cards(en)[2].textContent, /iPad \+ stand \+ thermal printer \+ cash drawer/);
  assert.ok(ar.getElementById('contact'), 'لا قسم «تواصل معنا» يصل إليه الزرّ');

  // تحت الباقات وملاحظةِ واتساب، داخل الأسعار
  const note = ar.querySelector('[data-pr="waPack"]');
  assert.ok(note.compareDocumentPosition(cards(ar)[0]) & 4, 'البطاقات فوق ملاحظة واتساب');

  // والسكربت يرسمها كما في الصفحة، والسنويّ لا يمسّها
  const w = await page(t, 'en'), d = w.document;
  click(w, '[data-billing="y"]');
  assert.deepEqual(read(d), read(en));
});

test('one official contact number on the site and the three legal pages', () => {
  const OFFICIAL = '71141624';
  for (const f of ['index.html', 'en/index.html', 'assets/site.js', 'privacy/index.html', 'terms/index.html', 'data-deletion/index.html']) {
    const numbers = [...read(f).matchAll(/\+?968[\s-]?(\d[\d\s]{6,9}\d)/g)].map((m) => m[1].replace(/\s/g, ''));
    assert.ok(numbers.length > 0, `${f}: لا رقم تواصل`);
    numbers.forEach((n) => assert.equal(n, OFFICIAL, `${f}: رقمٌ غير الرسمي ${n}`));
  }
});
