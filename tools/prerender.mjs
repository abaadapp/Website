/*
 * يرسم صفحتَي الموقع من assets/site.js — لمن لا يشغّل JavaScript ولمحرّكات البحث:
 *
 *   index.html      العربية على /       — وهي القالب: البنيةُ تُعدَّل فيها
 *   en/index.html   الإنجليزية على /en/  — تُولَّد من index.html، لا تُعدَّل يدويًّا
 *
 * ومعهما صفحتا «نظام أبعاد» و«أبعاد ويب» بلغتيهما (tools/pages.mjs)، وsitemap.xml.
 *
 * ويكتب رأسَ كلٍّ منهما من SEO أدناه — العنوان، الوصف، canonical، hreflang،
 * Open Graph، وJSON-LD — ويحدّث بصمة site.css وsite.js في روابطهما كي لا يبقى
 * زائرٌ على نسخةٍ قديمة (nginx يخزّنهما 30 يومًا).
 *
 * شغّله بعد كل تعديل في النصوص أو الأنماط أو الرأس:  npm run prerender
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { SUBPAGES, renderPage, pageFile, sitemap } from './pages.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const stamp = (p) => createHash('sha256').update(read(p)).digest('hex').slice(0, 10);

export const SITE = 'https://abaadapp.om';
export const URLS = { ar: SITE + '/', en: SITE + '/en/' };
export const HREFLANG = { ar: 'ar-OM', en: 'en-OM' };

/** ما يقرؤه البحث والمشاركة لكل لغة — وصفٌ لما في الصفحة فعلًا، بلا حشو */
export const SEO = {
  ar: {
    // الاسمُ المعتمد «أبعاد | ABAAD» وعبارتُه «حلول رقمية تساعدك على تطوير أعمالك.» — لا يُعاد صوغهما
    title: 'أبعاد | ABAAD | حلول رقمية تساعدك على تطوير أعمالك',
    description: 'حلول رقمية تساعدك على تطوير أعمالك. أبعاد منصة متكاملة لإدارة المبيعات ونقاط البيع والمخزون والعملاء والفواتير والمالية والمتجر الإلكتروني وواتساب في عُمان.',
    locale: 'ar_OM',
    name: 'أبعاد',
    alternateName: ['ABAAD', 'Abaad', 'ابعاد', 'abaadapp'],
    // أسماءُ الموقع التي يُبحث بها — Google يقرأ اسمَ الموقع من WebSite في الصفحة الرئيسية
    siteAlternateName: ['ABAAD', 'Abaad', 'ابعاد', 'Abaad App', 'abaadapp', 'abaadapp.om'],
    // الفهرسةُ مسموحةٌ بلا وسم؛ يُقال صراحةً على الصفحة الرئيسية وحدها
    robots: 'index, follow',
    imageAlt: 'أبعاد — كل أعمالك في مكان واحد',
  },
  en: {
    title: 'ABAAD | Digital Solutions to Grow Your Business',
    description: 'Digital solutions to grow your business. ABAAD brings sales, point of sale, inventory, customers, invoicing, finance, e-commerce and WhatsApp together in Oman.',
    locale: 'en_OM',
    name: 'ABAAD',
    alternateName: ['أبعاد', 'Abaad', 'abaadapp'],
    imageAlt: 'ABAAD — Your whole business. In one place.',
  },
};

/** أبعاد كيانٌ واحد (@id ثابت) باسمه في لغة الصفحة؛ البريد والرقم من site.js نفسه */
export function structuredData(lang, js) {
  const s = SEO[lang];
  const mail = js.match(/var MAIL = '([^']+)'/)[1];
  const phone = js.match(/ciPhoneV: '([^']+)'/)[1];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': SITE + '/#organization',
        name: s.name,
        alternateName: s.alternateName,
        url: SITE + '/',
        logo: { '@type': 'ImageObject', url: SITE + '/apple-touch-icon.png', width: 180, height: 180 },
        email: mail,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: phone,
          email: mail,
          contactType: 'customer service',
          areaServed: 'OM',
          availableLanguage: ['Arabic', 'English'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': SITE + '/#website',
        name: s.name,
        alternateName: s.siteAlternateName ?? s.alternateName,
        url: SITE + '/',
        inLanguage: ['ar', 'en'],
        publisher: { '@id': SITE + '/#organization' },
      },
    ],
  };
}

/** يكتب رأسَ الصفحة بلغتها — يعدّل ما وُجد ويُنشئ ما نقص، فتعطي الإعادةُ الملفَّ نفسَه */
function writeHead(doc, lang, js) {
  const s = SEO[lang], other = lang === 'ar' ? 'en' : 'ar', dir = lang === 'ar' ? 'rtl' : 'ltr';
  const head = doc.head;
  const make = (tag, attrs) => Object.assign(doc.createElement(tag), attrs);
  const meta = (attr, key, content) => {
    let el = head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = doc.createElement('meta');
      el.setAttribute(attr, key);
      head.querySelector('meta[name="twitter:card"]').before(el, '\n');
    }
    el.setAttribute('content', content);
  };

  doc.documentElement.setAttribute('lang', lang);
  doc.documentElement.setAttribute('dir', dir);
  const site = doc.querySelector('[data-site]');
  site.setAttribute('lang', lang);
  site.setAttribute('dir', dir);

  doc.title = s.title;
  meta('name', 'description', s.description);

  // robots بعد الوصف في صفحةٍ تُعلنه — و/en/ المولَّدة من العربية لا ترثه
  let robots = head.querySelector('meta[name="robots"]');
  if (s.robots) {
    if (!robots) {
      robots = make('meta', { name: 'robots' });
      head.querySelector('meta[name="description"]').after('\n', robots);
    }
    robots.setAttribute('content', s.robots);
  } else if (robots) {
    robots.previousSibling?.remove();
    robots.remove();
  }

  const canonical = head.querySelector('link[rel="canonical"]');
  canonical.setAttribute('href', URLS[lang]);

  // hreflang متبادلٌ في الصفحتين، والعربية هي الافتراضية
  head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => { el.previousSibling?.remove(); el.remove(); });
  let at = canonical;
  for (const [hreflang, href] of [[HREFLANG.ar, URLS.ar], [HREFLANG.en, URLS.en], ['x-default', URLS.ar]]) {
    const link = make('link', { rel: 'alternate', hreflang, href });
    at.after('\n', link);
    at = link;
  }

  meta('property', 'og:site_name', s.name);
  meta('property', 'og:locale', s.locale);
  meta('property', 'og:locale:alternate', SEO[other].locale);
  meta('property', 'og:url', URLS[lang]);
  meta('property', 'og:title', s.title);
  meta('property', 'og:description', s.description);
  meta('property', 'og:image:alt', s.imageAlt);

  let ld = head.querySelector('script[type="application/ld+json"]');
  if (!ld) {
    ld = make('script', { type: 'application/ld+json' });
    head.append(ld, '\n');
  }
  ld.textContent = '\n' + JSON.stringify(structuredData(lang, js), null, 2) + '\n';
}

/** الصفحة بلغتها: النصوص والقوائم من site.js، والرأس من SEO — دون تشغيل شيءٍ منها */
export function prerender(html, js, lang = 'ar') {
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  const doc = dom.window.document;
  dom.window.__ABAAD_PRERENDER__ = {};
  dom.window.eval(js);
  dom.window.__ABAAD_PRERENDER__.render(doc, lang);
  writeHead(doc, lang, js);
  if (lang === 'en') {
    doc.insertBefore(doc.createComment(' مولَّدة من index.html بـ npm run prerender — لا تعدّلها يدويًّا '), doc.documentElement);
  }
  // ما بعد </html> يُلحقه المحلّلُ بالجسم؛ يُوحَّد كي تعطي الإعادةُ الملفَّ نفسَه
  const out = dom.serialize().replace(/\s*<\/body>\s*<\/html>\s*$/, '\n</body>\n</html>\n');
  dom.window.close();
  return out;
}

export function withStamps(html) {
  return html
    .replace(/\/assets\/site\.css\?v=[^"]*/, '/assets/site.css?v=' + stamp('assets/site.css'))
    .replace(/\/assets\/site\.js\?v=[^"]*/, '/assets/site.js?v=' + stamp('assets/site.js'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const js = read('assets/site.js');
  const ar = withStamps(prerender(read('index.html'), js, 'ar'));
  writeFileSync(new URL('index.html', root), ar);
  mkdirSync(new URL('en/', root), { recursive: true });
  writeFileSync(new URL('en/index.html', root), withStamps(prerender(ar, js, 'en')));
  const ctx = { css: stamp('assets/site.css'), mail: js.match(/var MAIL = '([^']+)'/)[1], phone: js.match(/ciPhoneV: '([^']+)'/)[1] };
  for (const key of SUBPAGES) {
    for (const lang of ['ar', 'en']) {
      mkdirSync(new URL(pageFile(key, lang).replace(/index\.html$/, ''), root), { recursive: true });
      writeFileSync(new URL(pageFile(key, lang), root), renderPage(key, lang, ctx));
    }
  }
  writeFileSync(new URL('sitemap.xml', root), sitemap());
  console.log('index.html ✓  en/index.html ✓  ' + SUBPAGES.flatMap((k) => [pageFile(k, 'ar'), pageFile(k, 'en')]).join(' ✓  ') + ' ✓  sitemap.xml ✓');
}
