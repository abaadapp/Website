/*
 * صفحتا «نظام أبعاد» و«أبعاد ويب» كما يجلبهما الزاحف — بلا JavaScript:
 *
 *   - العناوينُ والأوصافُ المعتمدة كما أُقرّت، وH1 واحدٌ يحمل الاسم وعبارته.
 *   - canonical إلى نفسها، وhreflang متبادلٌ بين العربية والإنجليزية، وOpen Graph بلغتها.
 *   - JSON-LD: صفحةٌ من موقع أبعاد (WebPage) ومسارُها من الرئيسية (BreadcrumbList).
 *   - الروابطُ إلى النظام القائم وحده (app.abaadapp.om/register و/login)، وكلُّ رابطٍ داخليّ صفحةٌ موجودة.
 *   - الرئيسيةُ بلغتيها تربط بالصفحتين، والإنجليزيةُ بلا عربية.
 *   - الصفحتان لا تَعِدان بسلّةٍ ولا دفعٍ ولا طلبٍ يصل إلى اللوحة ولا نطاقٍ خاصّ — الموقعُ العاديّ يعرض ويُراسَل على واتساب.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { arabicLeft } from './arabic.mjs';
import { renderPage, pageFile, SUBPAGES } from '../tools/pages.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const doc = (file) => new JSDOM(read(file)).window.document;
const content = (d, sel) => d.querySelector(sel)?.getAttribute('content');
const SITE = 'https://abaadapp.om';
const ARABIC = /[؀-ۿ]/;

const APPROVED = {
  system: {
    ar: { path: '/system/', title: 'نظام أبعاد | أعمالك كلها في مكان واحد', description: 'نظّم أعمالك اليومية وتحكّم في عملياتك بسهولة من خلال نظام واحد.', h1: ['نظام أبعاد', 'أعمالك كلها في مكان واحد'] },
    en: { path: '/en/system/', title: 'ABAAD System | Run Your Business in One Place', h1: ['ABAAD System', 'Run your business in one place'] },
  },
  web: {
    ar: { path: '/web/', title: 'أبعاد ويب | حضور رقمي يليق بنشاطك', description: 'أنشئ موقعك الإلكتروني، اعرض منتجاتك وخدماتك، واجعل الوصول إلى نشاطك أسهل.', h1: ['أبعاد ويب', 'حضور رقمي يليق بنشاطك'] },
    en: { path: '/en/web/', title: 'ABAAD Web | Build Your Digital Presence', h1: ['ABAAD Web', 'Build your digital presence'] },
  },
};
const ALL = Object.entries(APPROVED).flatMap(([key, l]) => Object.entries(l).map(([lang, a]) => ({ key, lang, ...a, file: pageFile(key, lang) })));

/** الملفُّ الذي يقدّمه nginx لرابطٍ داخليّ — `try_files $uri $uri/` */
function served(path) {
  const clean = path.replace(/[?#].*$/, '');
  return clean.endsWith('/') ? clean.slice(1) + 'index.html' : clean.slice(1);
}

test('the four pages are generated from tools/pages.mjs and nobody edited them by hand', () => {
  const js = read('assets/site.js');
  const ctx = { css: read(ALL[0].file).match(/site\.css\?v=([^"]+)/)[1], mail: js.match(/var MAIL = '([^']+)'/)[1], phone: js.match(/ciPhoneV: '([^']+)'/)[1] };
  for (const p of ALL) assert.equal(read(p.file), renderPage(p.key, p.lang, ctx), `${p.file}: يختلف عن المولِّد — شغّل npm run prerender`);
  assert.deepEqual(SUBPAGES, ['system', 'web']);
});

test('each page is complete without JavaScript, with the approved title, description and one H1', () => {
  for (const p of ALL) {
    const d = doc(p.file);
    assert.equal(d.documentElement.lang, p.lang, p.file);
    assert.equal(d.documentElement.dir, p.lang === 'ar' ? 'rtl' : 'ltr', p.file);
    assert.equal(d.title, p.title, `${p.file}: العنوان المعتمد`);
    assert.ok(d.title.length <= 60, `${p.file}: العنوان أطول من 60`);
    const desc = content(d, 'meta[name="description"]');
    if (p.description) assert.equal(desc, p.description, `${p.file}: الوصف المعتمد`);
    assert.ok(desc.length >= 50 && desc.length <= 170, `${p.file}: طول الوصف ${desc.length}`);
    assert.ok(p.lang === 'ar' ? ARABIC.test(desc) : !ARABIC.test(desc), `${p.file}: لغة الوصف`);

    const h1 = d.querySelectorAll('h1');
    assert.equal(h1.length, 1, `${p.file}: H1 واحد`);
    assert.equal(h1[0].firstChild.textContent, p.h1[0]);
    assert.equal(h1[0].querySelector('span').textContent, p.h1[1]);
    assert.ok(d.querySelectorAll('main h2').length >= 3, `${p.file}: أقسامٌ بعناوين`);
    // الصفحة كلُّها في HTML: لا سكربتَ يرسمها
    assert.equal(d.querySelectorAll('script[src]').length, 0, `${p.file}: سكربت`);
    assert.equal(d.querySelectorAll('meta[name="robots"]').length, 0, `${p.file}: robots`);
  }
});

test('canonical to itself, reciprocal hreflang with x-default to the Arabic, and Open Graph in its language', () => {
  for (const p of ALL) {
    const d = doc(p.file), url = SITE + p.path;
    const canon = d.querySelectorAll('link[rel="canonical"]');
    assert.equal(canon.length, 1);
    assert.equal(canon[0].getAttribute('href'), url, `${p.file}: canonical`);
    const alt = Object.fromEntries([...d.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]));
    assert.deepEqual(alt, { 'ar-OM': SITE + APPROVED[p.key].ar.path, 'en-OM': SITE + APPROVED[p.key].en.path, 'x-default': SITE + APPROVED[p.key].ar.path });
    assert.equal(content(d, 'meta[property="og:url"]'), url);
    assert.equal(content(d, 'meta[property="og:title"]'), p.title);
    assert.equal(content(d, 'meta[property="og:description"]'), content(d, 'meta[name="description"]'));
    assert.equal(content(d, 'meta[property="og:locale"]'), p.lang === 'ar' ? 'ar_OM' : 'en_OM');
    assert.equal(content(d, 'meta[property="og:site_name"]'), p.lang === 'ar' ? 'أبعاد' : 'ABAAD');
    assert.equal(content(d, 'meta[property="og:image"]'), `${SITE}/assets/img/og.png`);
    assert.ok(existsSync(new URL('assets/img/og.png', root)), 'صورة المشاركة');
    assert.equal(content(d, 'meta[name="twitter:card"]'), 'summary_large_image');
  }
});

test('structured data says each page belongs to the ABAAD website, with its breadcrumb — nothing invented', () => {
  for (const p of ALL) {
    const scripts = doc(p.file).querySelectorAll('script[type="application/ld+json"]');
    assert.equal(scripts.length, 1);
    const data = JSON.parse(scripts[0].textContent);
    const page = data['@graph'].find((n) => n['@type'] === 'WebPage');
    const crumbs = data['@graph'].find((n) => n['@type'] === 'BreadcrumbList');
    assert.equal(page.url, SITE + p.path);
    assert.equal(page.name, p.title);
    assert.equal(page.inLanguage, p.lang);
    assert.equal(page.isPartOf['@id'], `${SITE}/#website`);
    assert.equal(page.about['@id'], `${SITE}/#organization`);
    assert.deepEqual(crumbs.itemListElement.map((i) => i.item), [SITE + (p.lang === 'en' ? '/en/' : '/'), SITE + p.path]);
    assert.doesNotMatch(scripts[0].textContent, /aggregateRating|"review|ratingValue|offers|price/i, 'ادّعاءٌ لا مصدر له');
  }
});

test('start and log in go to the existing system, and every internal link is a page that exists', () => {
  for (const p of ALL) {
    const d = doc(p.file);
    const hrefs = [...d.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    const app = hrefs.filter((h) => h.startsWith('https://app.abaadapp.om'));
    assert.ok(app.length >= 2, `${p.file}: روابط النظام`);
    for (const h of app) assert.match(h, /^https:\/\/app\.abaadapp\.om\/(register|login)$/, `${p.file}: ${h}`);
    for (const h of hrefs.filter((h) => h.startsWith('/'))) {
      assert.ok(existsSync(new URL(served(h), root)), `${p.file}: ${h} لا صفحة له`);
    }
    // أقسامُ الرئيسية بلغة الصفحة: الأسعار والتواصل
    const home = p.lang === 'en' ? '/en/' : '/';
    for (const id of ['#pricing', '#contact']) {
      assert.ok(hrefs.includes(home + id), `${p.file}: ${home + id}`);
      assert.ok(read(served(home)).includes(`id="${id.slice(1)}"`), `${id}: لا قسم بهذا المعرّف`);
    }
    // الصفحتان والرئيسية مترابطة بلغتها، ورابطُ اللغة إلى نظيرتها
    for (const key of ['system', 'web']) assert.ok(hrefs.includes(APPROVED[key][p.lang].path), `${p.file}: ${key}`);
    assert.ok(hrefs.includes(home), `${p.file}: الرئيسية`);
    const other = p.lang === 'ar' ? 'en' : 'ar';
    assert.equal(d.querySelector('[data-lang-link]').getAttribute('href'), APPROVED[p.key][other].path);
    assert.equal(d.querySelector('a[aria-current="page"]').getAttribute('href'), p.path, `${p.file}: الصفحة الحالية في القائمة`);
  }
});

test('the English pages have no Arabic left, and the Arabic pages are Arabic', () => {
  for (const p of ALL) {
    const d = doc(p.file);
    if (p.lang === 'en') assert.deepEqual(arabicLeft(d), [], `${p.file}: عربيٌّ في الصفحة الإنجليزية`);
    else assert.ok(ARABIC.test(d.querySelector('main').textContent));
  }
});

/*
 * ما لا يفعله موقعُ التاجر العاديّ اليوم — فلا تَعِد به الصفحتان بأيّ صياغة:
 *
 *   - لا سلّة ولا إتمامَ طلبٍ ولا دفع: الطلبُ محادثةُ واتساب (abaad.Saas `Website\Commerce::checkout`
 *     ‏= false لكلّ متجرٍ بلا واجهةٍ خاصّة، والسلّةُ لـ RIBBON وحدها في `Store\WebCheckout`).
 *   - فلا «يصلك الطلب في لوحتك»، ولا دفعٌ عند الاستلام أو تحويلٌ بنكيّ أو بطاقة.
 *   - ولا نطاقٌ خاصّ (`STOREFRONT_CUSTOM_DOMAINS` مطفأ).
 *
 * فإن فُتح شيءٌ منها للتجّار جميعًا، يُرفع من هنا في الطلب نفسه الذي يكتبه في الصفحة.
 */
const NOT_OPEN = {
  ar: [
    /نطاق|دومين/, /الدفع|يدفع|المدفوعات|دفع إلكتروني|بطاقة ائتمان|بطاقات الدفع|Paymob/, /التحويل البنكي|تحويل بنكي/,
    /سلة|سلّة|إتمام الطلب|إتمام الشراء|الشراء من الموقع|اشترِ من/,
    /الطلبات? (تصل|يصل)|يصلك الطلب|استقبل الطلبات|استقبال الطلبات|تستقبل الطلبات|الطلبات من موقعك|طلبات الموقع/,
    /المتجر الإلكتروني والطلبات|الطلبات والمنتجات والعملاء ببقية/,
  ],
  en: [
    /domain/i, /payment|pay |checkout|cash on delivery|bank transfer|credit card|debit card|Paymob/i, /cart|basket/i,
    /orders? (reach|lands?|arrive)|take orders|accept orders|receive orders|orders from your website|online orders/i,
    /online store and payments|orders, products and customers linked/i,
  ],
};

test('neither page promises what an ordinary merchant site cannot do yet — no cart, checkout, payment, orders into the dashboard, or custom domain', () => {
  for (const key of ['web', 'system']) {
    for (const lang of ['ar', 'en']) {
      const d = doc(pageFile(key, lang));
      const main = d.querySelector('main').cloneNode(true);
      /*
       * والصندوقُ يبيع ويقبض فعلًا: جملُ بطاقتَي «المبيعات ونقاط البيع» و«المالية» في صفحة النظام،
       * ورقاقاتُ وحداته، تُستثنى بنصّها كما هو — ولا استثناءَ في صفحة أبعاد ويب.
       */
      if (key === 'system') main.querySelectorAll('.items').forEach((el) => el.remove());
      const said = [main.textContent, content(d, 'meta[name="description"]'), d.querySelector('script[type="application/ld+json"]').textContent].join('\n');
      const POS = {
        ar: ['أدر المبيعات والطلبات والفواتير والمدفوعات من تجربة بيع سريعة ومتكاملة.', 'نقاط البيع والطلبات والفواتير والمدفوعات في تجربة واحدة.', 'تابع الحركة المالية والمدفوعات والمصروفات والمستحقات والتقارير من مكان واحد.'],
        en: ['Manage sales, orders, invoices and payments from a fast, complete selling experience.', 'Point of sale, orders, invoices and payments in one experience.', 'Track cash flow, payments, expenses, receivables and reports from one place.'],
      };
      const rest = key === 'system' ? POS[lang].reduce((t, line) => t.split(line).join(''), said) : said;
      for (const claim of NOT_OPEN[lang]) assert.doesNotMatch(rest, claim, `${pageFile(key, lang)}: وعدٌ غير مفتوح ${claim}`);
    }
  }
  // والقناةُ المفتوحة فعلًا تُسمّى باسمها
  assert.match(doc(pageFile('web', 'ar')).querySelector('main').textContent, /واتساب/);
  assert.match(doc(pageFile('web', 'en')).querySelector('main').textContent, /WhatsApp/);
});

test('the home page links to both pages in its own language — in the sections and the footer', () => {
  for (const [file, home] of [['index.html', '/'], ['en/index.html', '/en/']]) {
    const d = doc(file);
    for (const key of ['system', 'web']) {
      const links = [...d.querySelectorAll(`a[href="${home}${key}/"]`)];
      assert.ok(links.length >= 2, `${file}: ${key} — ${links.length}`);
      assert.ok(links.some((a) => a.closest('footer')), `${file}: ${key} في التذييل`);
      assert.ok(links.some((a) => a.closest('section')), `${file}: ${key} في قسمه`);
    }
  }
});

test('an unknown address answers 404 with its own page — not a second home page with 200', () => {
  const conf = read('deploy/nginx-abaadapp.om.conf');
  const site = conf.slice(conf.indexOf('server_name abaadapp.om;'));
  assert.match(site, /location \/ \{ try_files \$uri \$uri\/ =404; \}/, 'try_files يعيد الرئيسية لكلّ رابط');
  assert.doesNotMatch(site, /try_files[^;]*\/index\.html;/, 'الرئيسيةُ لكلّ رابطٍ مجهول');
  assert.match(site, /error_page 404 \/404\.html;/);
  assert.match(site, /location = \/404\.html \{ internal; \}/);

  const d = doc('404.html');
  assert.equal(d.querySelector('meta[name="robots"]').getAttribute('content'), 'noindex', '404 تُفهرس');
  assert.equal(d.querySelectorAll('link[rel="canonical"]').length, 0);
  assert.doesNotMatch(read('sitemap.xml'), /404/);
  for (const a of d.querySelectorAll('a[href^="/"]')) assert.ok(existsSync(new URL(served(a.getAttribute('href')), root)), a.getAttribute('href'));
});

/*
 * والرئيسيةُ تصف مواقعَ التجّار كما هي: موقعٌ يعرض المنتجات والخدمات ويُراسَل على واتساب.
 *
 * يُقرأ النصُّ من الصفحتين المولَّدتين ومن نصوص site.js معًا: مسارُ «الموقع الإلكتروني» ولوحةُ
 * القدرات لا تظهر في HTML الثابت إلّا أوّلُها، والباقي يرسمه السكربت حين يتنقّل الزائر.
 *
 * ويبقى ما هو حقيقيّ: طلباتُ نقطة البيع ومدفوعاتُها والمالية، وخدمةُ تخصيص الواجهة (الواجهاتُ
 * الخاصّة كـ RIBBON فيها سلّةٌ فعلًا)، واسمُ الإضافة كما في كتالوج النظام.
 */
const HOME_CLAIMS = {
  ar: [
    /متجرك الإلكتروني متصل|يستقبل طلبات زبائنك|ونطاقه|نطاقك الخاص|ربط النطاق|دومين|طلب إلكتروني/,
    /نقاط البيع والمتجر الإلكتروني|واربط الطلبات والمنتجات|وأدر المنتجات والطلبات والعملاء والمدفوعات|الطلبات، المدفوعات والعملاء|متجر واحد\./,
    /سلة|سلّة|إتمام الطلب|الدفع الإلكتروني|الدفع عند الاستلام|التحويل البنكي|الدفع بالبطاقة/,
  ],
  en: [
    /Your online store, connected|takes your customers' orders|domain|Online order|online store and payments/i,
    /with orders, products and customers linked|manage products, orders, customers and payments|orders, payments and customers|No separate store\./i,
    /add to cart|shopping cart|online payment|cash on delivery|bank transfer|card payment/i,
  ],
};
const HOME_FIXED = {
  ar: [
    'موقعك الإلكتروني متصل بأعمالك من البداية.',
    'أنشئ موقع نشاطك مع أبعاد، واعرض فيه منتجاتك وخدماتك من نفس النظام الذي تدير به أعمالك، ودع عملاءك يصلون إليك بسهولة عبر واتساب.',
    'أنشئ موقع نشاطك وأدره من أبعاد، واعرض فيه منتجاتك وخدماتك، وتواصل مع عملائك عبر واتساب.',
    'موقعك الإلكتروني بتصميمه ومنتجاته وظهوره في البحث.',
    'موقع باسم نشاطك يعرض منتجاتك، ويتواصل معك زبائنك منه عبر واتساب، وتديره من لوحتك.',
  ],
  en: [
    'Your website, connected to your business from day one.',
    'Build your business website with ABAAD, show your products and services from the same system that runs your business, and let customers reach you easily on WhatsApp.',
    'Build and run your business website with ABAAD, show your products and services on it, and talk to your customers on WhatsApp.',
    'Your website, with its own design, products and search visibility.',
    'A website in your business name that shows your products, lets customers reach you on WhatsApp, and is managed from your dashboard.',
  ],
};
const HOME_KEPT = {
  ar: ['أدر المبيعات والطلبات والفواتير والمدفوعات من تجربة بيع سريعة ومتكاملة.', 'نقاط البيع والطلبات والمدفوعات في تجربة واحدة.', 'تابع الحركة المالية والمدفوعات والمصروفات والمستحقات والتقارير من مكان واحد.', 'نصمم ونخصص واجهة متجرك لتناسب هوية علامتك ومتطلباتك، كخدمة إضافية مدفوعة.', 'المتجر الإلكتروني وإدارة الطلبات'],
  en: ['Manage sales, orders, invoices and payments from a fast, complete selling experience.', 'Point of sale, orders and payments.', 'Track cash flow, payments, expenses, receivables and reports from one place.', 'We offer a design and customization service for your online storefront, tailored to your brand identity and needs, for an additional fee.', 'Online store & order management'],
};

/** نصوصُ site.js بلغةٍ واحدة — ما بين علامتَي الاقتباس، بلا التعليقات */
function scriptStrings(lang) {
  const src = read('assets/site.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const all = [...src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)].map((m) => m[1] ?? m[2]);
  return all.filter((t) => (lang === 'ar' ? ARABIC.test(t) : /[A-Za-z]{3}/.test(t) && !ARABIC.test(t)));
}

test('the home page describes merchant websites as they are — showing products and talking on WhatsApp, with no cart, payment, orders or custom domain', () => {
  for (const [lang, file] of [['ar', 'index.html'], ['en', 'en/index.html']]) {
    const d = doc(file);
    const page = d.querySelector('[data-site]').textContent + '\n' + content(d, 'meta[name="description"]');
    const script = scriptStrings(lang).join('\n');
    for (const claim of HOME_CLAIMS[lang]) {
      assert.doesNotMatch(page, claim, `${file}: ${claim}`);
      assert.doesNotMatch(script, claim, `site.js (${lang}): ${claim}`);
    }
    for (const line of HOME_FIXED[lang]) assert.ok(script.includes(line), `site.js (${lang}): «${line.slice(0, 40)}»`);
    // قسمُ الموقع وبطاقةُ الباقة والإضافة مرسومةٌ في HTML الثابت نفسِه
    for (const line of [HOME_FIXED[lang][0], HOME_FIXED[lang][1], HOME_FIXED[lang][3], HOME_FIXED[lang][4]]) assert.ok(page.includes(line), `${file}: «${line.slice(0, 40)}»`);
    // وما هو حقيقيّ باقٍ كما كان
    for (const line of HOME_KEPT[lang]) assert.ok(page.includes(line), `${file}: حُذف ما هو حقيقيّ «${line.slice(0, 40)}»`);
  }
  // والقسمُ يدلّ على صفحته
  assert.equal(doc('index.html').querySelector('#store [data-sub="web"]').getAttribute('href'), '/web/');
  assert.equal(doc('en/index.html').querySelector('#store [data-sub="web"]').getAttribute('href'), '/en/web/');
});
