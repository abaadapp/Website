/*
 * ما يقرؤه Google من abaadapp.om — بلا JavaScript، كما يجلبه الزاحف:
 *
 *   - /     عربيةٌ كاملة (lang=ar، dir=rtl)، و/en/ إنجليزيةٌ كاملة (lang=en، dir=ltr).
 *   - canonical واحدٌ لكلٍّ منهما إلى نفسه، وhreflang متبادل مع x-default إلى العربية.
 *   - العنوان والوصف وOpen Graph بلغة الصفحة.
 *   - JSON-LD صالح: Organization وWebSite، بلا تقييماتٍ ولا روابطَ لا وجود لها.
 *   - sitemap.xml صالح، وكلّ رابطٍ فيه هو canonical صفحته؛ وrobots.txt يدلّ عليه.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { arabicLeft, DRAWINGS } from './arabic.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const exists = (p) => existsSync(new URL(p.replace(/^\//, ''), root));

const SITE = 'https://abaadapp.om';
const PAGES = {
  ar: { file: 'index.html', url: `${SITE}/`, lang: 'ar', dir: 'rtl', locale: 'ar_OM' },
  en: { file: 'en/index.html', url: `${SITE}/en/`, lang: 'en', dir: 'ltr', locale: 'en_OM' },
};
const doc = (file) => new JSDOM(read(file)).window.document;
const content = (d, sel) => d.querySelector(sel)?.getAttribute('content');
const ARABIC = /[؀-ۿ]/;

function visibleText(d) {
  const out = [];
  const walk = d.createTreeWalker(d.querySelector('[data-site]'), 4);
  for (let n; (n = walk.nextNode());) {
    const text = n.textContent.trim();
    if (text && !n.parentElement.closest('script, style, [hidden]')) out.push(text);
  }
  return out;
}

/* ═══════════ ١ · كلّ لغةٍ صفحةٌ كاملة بلا JavaScript ═══════════ */

test('/ is a complete Arabic page without JavaScript', () => {
  const d = doc(PAGES.ar.file);
  assert.equal(d.documentElement.lang, 'ar');
  assert.equal(d.documentElement.dir, 'rtl');
  assert.equal(d.querySelector('[data-site]').getAttribute('lang'), 'ar');
  assert.equal(d.querySelector('[data-site]').getAttribute('dir'), 'rtl');
  assert.equal(d.querySelector('h1').textContent, 'كل أعمالك. في مكان واحد.');
  for (const h of d.querySelectorAll('[data-site] h1, [data-site] h2, [data-site] h3, nav a, [data-plan] li')) {
    assert.match(h.textContent, ARABIC, `ليس عربيًّا: ${h.textContent.trim().slice(0, 40)}`);
  }
  assert.ok(visibleText(d).join(' ').length > 3000, 'العربية ناقصة');
});

test('/en/ is a complete English page without JavaScript', () => {
  const d = doc(PAGES.en.file);
  assert.equal(d.documentElement.lang, 'en');
  assert.equal(d.documentElement.dir, 'ltr');
  assert.equal(d.querySelector('[data-site]').getAttribute('lang'), 'en');
  assert.equal(d.querySelector('[data-site]').getAttribute('dir'), 'ltr');
  assert.equal(d.querySelector('h1').textContent, 'Your whole business. In one place.');
  // لا عربية ظاهرة ولا في alt / aria-label، إلّا رسمَي الواجهة داخل الصور ورابطَ «العربية»
  assert.deepEqual(arabicLeft(d), [], 'عربيّ في /en/');
  assert.equal(d.querySelectorAll(DRAWINGS).length, 2, 'رسمٌ عربيّ جديد في /en/ — هل هو رسمٌ حقًّا؟');
  for (const h of d.querySelectorAll('[data-site] h1, [data-site] h2, [data-site] h3, nav a, [data-plan] li')) {
    assert.doesNotMatch(h.textContent, ARABIC, `عربيّ في /en/: ${h.textContent.trim().slice(0, 40)}`);
  }
  assert.ok(visibleText(d).join(' ').length > 3000, 'الإنجليزية ناقصة');
});

test('the labels, image texts and landmarks of /en/ are the approved English, and / keeps its Arabic', () => {
  const en = doc(PAGES.en.file), ar = doc(PAGES.ar.file);
  const read = (d) => ({
    badge: d.querySelector('[data-i18n="waBadge"]').textContent,
    label: d.querySelector('[data-i18n="autoLabel"]').textContent,
    wa: d.querySelector('img[src$="whatsapp-phone.webp"]').alt,
    store: d.querySelector('img[src$="store.webp"]').alt,
    pos: [...d.querySelectorAll('[data-cap-panel] img')].map((i) => i.alt),
    nav: d.querySelector('nav[data-list="nav"]').getAttribute('aria-label'),
    menu: d.querySelector('[data-action="menu"]').getAttribute('aria-label'),
    brand: [d.querySelector('header a[href="#home"]').getAttribute('aria-label'), ...[...d.querySelectorAll('img[src$="logo.svg"]')].map((i) => i.alt)],
  });
  assert.deepEqual(read(en), {
    badge: 'WhatsApp + Automation', label: 'Automation', wa: 'WhatsApp conversation', store: 'Online store',
    pos: ['Abaad point of sale', 'Checkout', 'Product card'], nav: 'Site navigation', menu: 'Menu', brand: ['Abaad', 'Abaad', 'Abaad'],
  });
  assert.deepEqual(read(ar), {
    badge: 'واتساب + الأتمتة', label: 'الأتمتة', wa: 'محادثة واتساب من أبعاد', store: 'متجر إلكتروني من أبعاد على اللابتوب والجوال',
    pos: ['نقطة البيع في أبعاد', 'إتمام الدفع', 'بطاقة منتج'], nav: 'أقسام الموقع', menu: 'القائمة', brand: ['أبعاد', 'أبعاد', 'أبعاد'],
  });
});

/* ═══════════ ٢ · canonical وhreflang ═══════════ */

test('each page has one canonical, to itself', () => {
  for (const p of Object.values(PAGES)) {
    const links = doc(p.file).querySelectorAll('link[rel="canonical"]');
    assert.equal(links.length, 1, `${p.file}: canonical مكرّر أو مفقود`);
    assert.equal(links[0].getAttribute('href'), p.url, `${p.file}: canonical`);
  }
});

test('hreflang is reciprocal on both pages, with x-default to the Arabic', () => {
  const want = [['ar-OM', `${SITE}/`], ['en-OM', `${SITE}/en/`], ['x-default', `${SITE}/`]];
  for (const p of Object.values(PAGES)) {
    const got = [...doc(p.file).querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]);
    assert.deepEqual(got, want, `${p.file}: hreflang`);
    // الصفحة تذكر نفسها، وتذكر أختَها التي تذكرها بدورها
    assert.ok(got.some(([, href]) => href === p.url), `${p.file}: لا تذكر نفسها`);
  }
});

/* ═══════════ ٣ · العنوان والوصف وOpen Graph ═══════════ */

test('title and description read naturally in each language', () => {
  const ar = doc(PAGES.ar.file), en = doc(PAGES.en.file);
  assert.equal(ar.title, 'أبعاد | Abaad | نظام نقاط بيع وإدارة أعمال في عُمان');
  // الاسمُ اللاتينيّ وحده — لمن يبحث بـ Abaad — ولا إنجليزيَّ سواه في العنوان العربي
  assert.deepEqual(ar.title.match(/[A-Za-z]+/g), ['Abaad'], 'إنجليزيٌّ في العنوان العربي');
  assert.equal(en.title, 'Abaad | POS & Business Management Platform in Oman');
  assert.doesNotMatch(en.title, ARABIC);
  for (const [d, lang] of [[ar, 'ar'], [en, 'en']]) {
    assert.equal(d.querySelectorAll('title').length, 1);
    assert.equal(d.querySelectorAll('meta[name="description"]').length, 1);
    const desc = content(d, 'meta[name="description"]');
    assert.ok(desc.length >= 70 && desc.length <= 170, `${lang}: طول الوصف ${desc.length}`);
    assert.ok(lang === 'ar' ? ARABIC.test(desc) : !ARABIC.test(desc), `${lang}: لغة الوصف`);
    assert.ok(d.title.length <= 60, `${lang}: العنوان أطول من 60`);
  }
});

test('the home page says index, follow outright — and no page says noindex', () => {
  const ar = doc(PAGES.ar.file), en = doc(PAGES.en.file);
  const robots = ar.querySelectorAll('meta[name="robots"]');
  assert.equal(robots.length, 1, 'robots في الرئيسية');
  assert.equal(robots[0].getAttribute('content'), 'index, follow');
  // و/en/ مولَّدةٌ من العربية ولا ترثه — الفهرسةُ مسموحةٌ بلا وسم
  assert.equal(en.querySelectorAll('meta[name="robots"]').length, 0, '/en/ ورثت robots');
  for (const p of Object.values(PAGES)) {
    assert.doesNotMatch(read(p.file), /noindex|nofollow/i, `${p.file}: noindex`);
  }
});

test('Open Graph speaks the language of its page', () => {
  for (const [lang, p] of Object.entries(PAGES)) {
    const d = doc(p.file), other = lang === 'ar' ? PAGES.en : PAGES.ar;
    assert.equal(content(d, 'meta[property="og:locale"]'), p.locale);
    assert.equal(content(d, 'meta[property="og:locale:alternate"]'), other.locale);
    assert.equal(content(d, 'meta[property="og:url"]'), p.url);
    assert.equal(content(d, 'meta[property="og:title"]'), d.title);
    assert.equal(content(d, 'meta[property="og:description"]'), content(d, 'meta[name="description"]'));
    assert.equal(content(d, 'meta[property="og:type"]'), 'website');
    const image = content(d, 'meta[property="og:image"]');
    assert.equal(image, `${SITE}/assets/img/og.png`);
    assert.ok(exists(image.replace(SITE, '')));
    assert.ok(d.querySelector('link[rel="icon"]') && d.querySelector('link[rel="apple-touch-icon"]'));
  }
});

/* ═══════════ ٤ · JSON-LD ═══════════ */

test('structured data is valid JSON-LD with the Organization and the WebSite — nothing invented', () => {
  for (const [lang, p] of Object.entries(PAGES)) {
    const scripts = doc(p.file).querySelectorAll('script[type="application/ld+json"]');
    assert.equal(scripts.length, 1, `${p.file}: JSON-LD`);
    const data = JSON.parse(scripts[0].textContent);
    assert.equal(data['@context'], 'https://schema.org');
    const org = data['@graph'].find((n) => n['@type'] === 'Organization');
    const site = data['@graph'].find((n) => n['@type'] === 'WebSite');
    assert.ok(org && site, `${p.file}: Organization وWebSite`);

    const [name, alt] = lang === 'ar' ? ['أبعاد', 'Abaad'] : ['Abaad', 'أبعاد'];
    for (const n of [org, site]) {
      assert.equal(n.name, name);
      assert.equal(n.url, `${SITE}/`);
    }
    assert.equal(org.alternateName, alt);
    // واسمُ الموقع في الصفحة الرئيسية بكلّ ما يُبحث به — منه يأخذ Google اسمَ الموقع
    assert.deepEqual(site.alternateName, lang === 'ar' ? ['Abaad', 'Abaad App', 'abaadapp.om'] : alt);
    assert.equal(org['@id'], `${SITE}/#organization`);
    assert.equal(site['@id'], `${SITE}/#website`);
    assert.equal(site.publisher['@id'], org['@id']);
    assert.ok(exists(org.logo.url.replace(SITE, '')), 'الشعار غير موجود');
    assert.equal(org.contactPoint.telephone, '+968 71141624');
    assert.equal(org.email, 'abaadappom@gmail.com');

    const text = scripts[0].textContent;
    assert.doesNotMatch(text, /aggregateRating|"review|ratingValue|sameAs|numberOfEmployees|award/i, 'ادّعاءٌ لا مصدر له');
  }
});

/* ═══════════ ٥ · sitemap.xml وrobots.txt ═══════════ */

test('sitemap.xml is valid and lists each page at its canonical address', () => {
  const xml = new JSDOM(read('sitemap.xml'), { contentType: 'application/xml' }).window.document;
  assert.equal(xml.getElementsByTagName('parsererror').length, 0, 'XML غير صالح');
  assert.equal(xml.documentElement.localName, 'urlset');
  assert.equal(xml.documentElement.namespaceURI, 'http://www.sitemaps.org/schemas/sitemap/0.9');
  const locs = [...xml.getElementsByTagName('loc')].map((l) => l.textContent);
  assert.deepEqual(locs, [`${SITE}/`, `${SITE}/en/`, `${SITE}/privacy/`, `${SITE}/terms/`, `${SITE}/data-deletion/`]);
  for (const loc of locs) {
    const file = loc.replace(SITE + '/', '') + 'index.html';
    assert.ok(exists(file), `${loc}: لا صفحة`);
    assert.equal(doc(file).querySelector('link[rel="canonical"]').getAttribute('href'), loc, `${loc}: canonical الصفحة غيره`);
  }
});

test('robots.txt allows everything and points to the sitemap', () => {
  const robots = read('robots.txt');
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/abaadapp\.om\/sitemap\.xml$/m);
  assert.doesNotMatch(robots, /^Disallow: *\/\S/m, 'robots يمنع شيئًا');
});
