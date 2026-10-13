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
const LATIN = /[A-Za-z]/;

/*
 * ما يبقى عربيًّا في /en/ عن قصد: رسومُ الواجهة التوضيحية (محادثة واتساب بلغتها
 * lang="ar"، والملخّص المالي)، ورابطُ «العربية». ونصّان لم تُترجَم لهما إنجليزيةٌ
 * بعد — ينتظران نصًّا معتمدًا، ولا يُضاف إليهما شيء.
 */
const ILLUSTRATIONS = '[lang="ar"], [data-fin-img], [data-lang-link]';
const UNTRANSLATED = ['واتساب + الأتمتة', 'الأتمتة'];

function visibleText(d, skip) {
  const out = [];
  const walk = d.createTreeWalker(d.querySelector('[data-site]'), 4);
  for (let n; (n = walk.nextNode());) {
    const text = n.textContent.trim();
    if (!text || n.parentElement.closest('script, style, [hidden]' + (skip ? ', ' + skip : ''))) continue;
    out.push(text);
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
  const arabic = visibleText(d, ILLUSTRATIONS).filter((t) => ARABIC.test(t));
  assert.deepEqual(arabic, UNTRANSLATED, 'نصٌّ عربيّ في /en/ خارج الرسوم التوضيحية');
  for (const h of d.querySelectorAll('[data-site] h1, [data-site] h2, [data-site] h3, nav a, [data-plan] li')) {
    if (h.closest(ILLUSTRATIONS)) continue;
    assert.doesNotMatch(h.textContent, ARABIC, `عربيّ في /en/: ${h.textContent.trim().slice(0, 40)}`);
  }
  assert.ok(visibleText(d).join(' ').length > 3000, 'الإنجليزية ناقصة');
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
  assert.equal(ar.title, 'أبعاد | نظام نقاط بيع وإدارة أعمال في عُمان');
  assert.doesNotMatch(ar.title, LATIN, 'إنجليزيٌّ في العنوان العربي');
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
      assert.equal(n.alternateName, alt);
      assert.equal(n.url, `${SITE}/`);
    }
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
