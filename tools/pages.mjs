/*
 * صفحتا «نظام أبعاد» و«أبعاد ويب» — صفحتان تعريفيّتان ثابتتان بلغتين:
 *
 *   system/index.html      /system/       نظام أبعاد | أعمالك كلها في مكان واحد
 *   web/index.html         /web/          أبعاد ويب | حضور رقمي يليق بنشاطك
 *   en/system/index.html   /en/system/    ABAAD System | Run Your Business in One Place
 *   en/web/index.html      /en/web/       ABAAD Web | Build Your Digital Presence
 *
 * HTML كاملٌ بلا JavaScript — يقرؤه الزاحف كما يراه الزائر. والملفّات الأربعة
 * تُولَّد من هنا بـ npm run prerender، فلا تُعدَّل يدويًّا.
 *
 * والمحتوى ما في النظام فعلًا (abaad.Saas): وحداتُه، والموقعُ الإلكترونيّ كما
 * يبنيه التاجر من «الموقع الإلكتروني» في لوحته. وذاك موقعٌ يعرض ولا يبيع:
 *
 *   - لا سلّةَ فيه ولا إتمامَ طلبٍ ولا دفع (`Website\Commerce::checkout`) — الطلبُ
 *     محادثةُ واتساب يكتبها الزبون ويقرؤها التاجر بيده. والسلّةُ وإتمامُ الطلب
 *     للواجهات الخاصّة وحدها (RIBBON، `Store\WebCheckout`)، فلا تُوعَد بها الصفحة.
 *   - ولا نطاقٌ خاصّ (`STOREFRONT_CUSTOM_DOMAINS` مطفأ)، ولا دفعٌ إلكترونيّ.
 *
 * والحارسُ في tests/pages.test.mjs يُسقط أيَّ وعدٍ بغير ذلك.
 */

export const SITE = 'https://abaadapp.om';
const APP = 'https://app.abaadapp.om';
const LINKS = { login: APP + '/login', register: APP + '/register' };
export const SUBPAGES = ['system', 'web'];

/** رابطُ الصفحة بلغتها: /system/ و/en/system/، والرئيسية / و/en/ */
export const pagePath = (key, lang) => (lang === 'en' ? '/en/' : '/') + (key ? key + '/' : '');
export const pageUrl = (key, lang) => SITE + pagePath(key, lang);
export const pageFile = (key, lang) => (lang === 'en' ? 'en/' : '') + key + '/index.html';

const COMMON = {
  ar: {
    brand: 'أبعاد', home: 'الرئيسية', navAria: 'صفحات الموقع', footAria: 'روابط الموقع', crumbAria: 'مسار الصفحة',
    system: 'نظام أبعاد', web: 'أبعاد ويب', pricing: 'الأسعار', contact: 'تواصل معنا',
    login: 'تسجيل الدخول', startNow: 'ابدأ الآن', langSwitch: 'English', langAria: 'التبديل إلى الإنجليزية',
    privacy: 'سياسة الخصوصية', terms: 'الشروط', footNote: 'أبعاد — حلول رقمية تساعدك على تطوير أعمالك.',
    alsoTitle: 'اكتشف أيضًا',
  },
  en: {
    brand: 'ABAAD', home: 'Home', navAria: 'Site pages', footAria: 'Site links', crumbAria: 'Breadcrumb',
    system: 'ABAAD System', web: 'ABAAD Web', pricing: 'Pricing', contact: 'Contact us',
    login: 'Log in', startNow: 'Get started', langSwitch: 'العربية', langAria: 'Switch to Arabic',
    privacy: 'Privacy policy', terms: 'Terms', footNote: 'ABAAD — Digital solutions to grow your business.',
    alsoTitle: 'Explore more',
  },
};

/** النصوص المعتمدة: العنوانُ والوصف كما أُقرّا، لا يُعاد صوغهما */
export const PAGES = {
  system: {
    ar: {
      title: 'نظام أبعاد | أعمالك كلها في مكان واحد',
      description: 'نظّم أعمالك اليومية وتحكّم في عملياتك بسهولة من خلال نظام واحد.',
      h1: 'نظام أبعاد', h1Sub: 'أعمالك كلها في مكان واحد',
      intro: 'نظام أبعاد برنامج سحابي لإدارة الأعمال، يعمل من المتصفح على الكمبيوتر والجوال والجهاز اللوحي. يجمع المبيعات ونقاط البيع، والمخزون والمشتريات، والعملاء وواتساب، والمالية والتقارير في حساب واحد، بدل التنقل بين أنظمة متفرقة.',
      ctas: [['startNow', LINKS.register], ['loginTo', LINKS.login], ['plans', '#pricing']],
      loginTo: 'تسجيل الدخول إلى نظام أبعاد', plans: 'الأسعار والباقات',
      sections: [
        {
          h2: 'ما الذي يجمعه نظام أبعاد؟',
          cards: [
            { t: 'المبيعات ونقاط البيع', d: 'أدر المبيعات والطلبات والفواتير والمدفوعات من تجربة بيع سريعة ومتكاملة.', items: ['POS', 'الطلبات', 'الفواتير', 'المدفوعات'] },
            { t: 'التجارة والمخزون', d: 'أدر المنتجات والمخزون والمشتريات والموردين، واربطها مباشرة بعمليات البيع.', items: ['المنتجات', 'المخزون', 'المشتريات', 'الموردون'] },
            { t: 'الموقع الإلكتروني', d: 'أنشئ موقع نشاطك من النظام نفسه، واعرض فيه منتجاتك، ويتواصل معك زوّاره عبر واتساب.', items: ['الموقع', 'المنتجات', 'واتساب'], link: 'web' },
            { t: 'العملاء والتواصل', d: 'اجمع بيانات عملائك وتاريخ تعاملاتهم وتواصل معهم من نفس منظومة العمل.', items: ['العملاء', 'WhatsApp', 'الإشعارات', 'سجل التعاملات'] },
            { t: 'المالية والتقارير', d: 'تابع الحركة المالية والمدفوعات والمصروفات والمستحقات والتقارير من مكان واحد.', items: ['المالية', 'المصروفات', 'المستحقات', 'التقارير'] },
          ],
        },
        {
          h2: 'نظام واحد ليومك كله',
          cards: [
            { t: 'أدر', d: 'لوحة تحكم واحدة لإدارة نشاطك وفروعك وعملياتك.' },
            { t: 'بِع', d: 'نقاط البيع والطلبات والفواتير والمدفوعات في تجربة واحدة.' },
            { t: 'تواصل', d: 'العملاء وواتساب والإشعارات والتواصل من نفس النظام.' },
            { t: 'حلّل', d: 'تقارير وتحليلات وبيانات تساعدك على اتخاذ قرارات أفضل وتنمية أعمالك.' },
          ],
          chips: ['سحابي', 'آمن', 'متعدد الأجهزة', 'متعدد اللغات', 'تحديثات مستمرة'],
        },
      ],
      also: ['web'],
      endTitle: 'ابدأ مع نظام أبعاد',
      endSub: 'سجّل نشاطك وابدأ من حسابك، أو تواصل معنا لنساعدك في اختيار الباقة المناسبة.',
      endCtas: [['startNow', LINKS.register], ['contact', '#contact']],
    },
    en: {
      title: 'ABAAD System | Run Your Business in One Place',
      description: 'Organize your daily work and control your operations with ease, all through one system.',
      h1: 'ABAAD System', h1Sub: 'Run your business in one place',
      intro: 'ABAAD System is cloud-based business software that runs in the browser on computers, phones and tablets. It brings sales and point of sale, inventory and purchasing, customers and WhatsApp, finance and reports into one account, instead of switching between separate systems.',
      ctas: [['startNow', LINKS.register], ['loginTo', LINKS.login], ['plans', '#pricing']],
      loginTo: 'Log in to ABAAD System', plans: 'Plans & pricing',
      sections: [
        {
          h2: 'What does ABAAD System bring together?',
          cards: [
            { t: 'Sales & point of sale', d: 'Manage sales, orders, invoices and payments from a fast, complete selling experience.', items: ['POS', 'Orders', 'Invoices', 'Payments'] },
            { t: 'Commerce & inventory', d: 'Manage products, inventory, purchasing and suppliers, linked directly to your sales.', items: ['Products', 'Inventory', 'Purchasing', 'Suppliers'] },
            { t: 'Website', d: 'Build your business website from the same system, show your products on it, and let visitors reach you on WhatsApp.', items: ['Website', 'Products', 'WhatsApp'], link: 'web' },
            { t: 'Customers & communication', d: 'Collect customer data and history, and reach customers from the same system you work in.', items: ['Customers', 'WhatsApp', 'Notifications', 'History'] },
            { t: 'Finance & reports', d: 'Track cash flow, payments, expenses, receivables and reports from one place.', items: ['Finance', 'Expenses', 'Receivables', 'Reports'] },
          ],
        },
        {
          h2: 'One system for your whole day',
          cards: [
            { t: 'Manage', d: 'One dashboard to run your business, operations and team.' },
            { t: 'Sell', d: 'Point of sale, orders, invoices and payments in one experience.' },
            { t: 'Connect', d: 'Customers, WhatsApp, notifications and customer engagement.' },
            { t: 'Analyze', d: 'Reports, analytics and data that help you make better decisions and grow your business.' },
          ],
          chips: ['Cloud-based', 'Secure', 'Multi-device', 'Multilingual', 'Continuous updates'],
        },
      ],
      also: ['web'],
      endTitle: 'Get started with ABAAD System',
      endSub: "Sign up your business and start from your account, or contact us and we'll help you choose the right plan.",
      endCtas: [['startNow', LINKS.register], ['contact', '#contact']],
    },
  },
  web: {
    ar: {
      title: 'أبعاد ويب | حضور رقمي يليق بنشاطك',
      description: 'أنشئ موقعك الإلكتروني، اعرض منتجاتك وخدماتك، واجعل الوصول إلى نشاطك أسهل.',
      h1: 'أبعاد ويب', h1Sub: 'حضور رقمي يليق بنشاطك',
      intro: 'أبعاد ويب هو الموقع الإلكتروني لنشاطك داخل نظام أبعاد. تبنيه وتديره من حسابك في أبعاد نفسه، ويعرض منتجاتك من المكان الذي تدير منه بقية أعمالك — بلا تطبيق آخر ولا حساب منفصل.',
      ctas: [['startWeb', LINKS.register], ['manageWeb', LINKS.login], ['plans', '#pricing']],
      startWeb: 'ابدأ موقعك مع أبعاد', manageWeb: 'لديك حساب؟ أدر موقعك من نظام أبعاد', plans: 'اطّلع على الباقات',
      sections: [
        {
          h2: 'ما الذي تحصل عليه مع أبعاد ويب؟',
          cards: [
            { t: 'موقع باسم نشاطك', d: 'صفحة رئيسية وصفحات إضافية وقائمة تنقّل، تبنيها من قسم «الموقع الإلكتروني» في لوحتك.' },
            { t: 'شكل تختاره وتخصّصه', d: 'اختر طريقة عرض الترويسة والواجهة وبطاقات المنتجات والتصنيفات والتذييل، وأضف صورك ونصوصك.' },
            { t: 'منتجاتك معروضة', d: 'تظهر منتجاتك من النظام نفسه بصورها وتصنيفاتها، فلا تُدخلها مرتين — وتختار أنت إظهار أسعارها أو إخفاءها.' },
            { t: 'تواصل عبر واتساب', d: 'يراسلك زائر موقعك على رقم واتساب نشاطك ليسأل أو يطلب، وتتابع المحادثة معه بنفسك.' },
            { t: 'ظهور في البحث', d: 'اضبط عنوان موقعك ووصفه وصورة مشاركته كما تظهر في محركات البحث.' },
          ],
        },
        {
          h2: 'ابدأ موقعك في ثلاث خطوات',
          steps: [
            'أنشئ حسابك في أبعاد، أو ادخل إلى حسابك الحالي.',
            'أضف منتجاتك وصمّم موقعك من قسم «الموقع الإلكتروني».',
            'انشر موقعك وشارك رابطه مع عملائك.',
          ],
          note: 'أبعاد ويب جزء من نظام أبعاد وليس اشتراكًا منفصلًا: مشمول في الباقة الاحترافية وباقة المؤسسات، ومتاح إضافةً على الباقة الأساسية.',
          noteLink: ['plans', '#pricing'],
        },
        {
          h2: 'خصّص متجرك بما يناسب علامتك',
          lead: 'نصمم ونخصص واجهة متجرك لتناسب هوية علامتك ومتطلباتك، كخدمة إضافية مدفوعة.',
          leadLink: ['customize', '#contact'],
        },
      ],
      customize: 'اطلب تخصيص متجرك',
      also: ['system'],
      endTitle: 'اجعل الوصول إلى نشاطك أسهل',
      endSub: 'ابدأ موقعك من حسابك في أبعاد، أو تواصل معنا لنساعدك في البداية.',
      endCtas: [['startWeb', LINKS.register], ['contact', '#contact']],
    },
    en: {
      title: 'ABAAD Web | Build Your Digital Presence',
      description: 'Create your website, showcase your products and services, and make your business easier to reach.',
      h1: 'ABAAD Web', h1Sub: 'Build your digital presence',
      intro: 'ABAAD Web is your business website inside ABAAD System. You build and run it from your ABAAD account, and it shows your products from where you run the rest of your business — no separate app, no separate account.',
      ctas: [['startWeb', LINKS.register], ['manageWeb', LINKS.login], ['plans', '#pricing']],
      startWeb: 'Start your website with ABAAD', manageWeb: 'Have an account? Manage your website in ABAAD System', plans: 'See the plans',
      sections: [
        {
          h2: 'What do you get with ABAAD Web?',
          cards: [
            { t: 'A website in your business name', d: 'A home page, extra pages and a navigation menu, built from the Website section of your dashboard.' },
            { t: 'A look you choose and customize', d: 'Choose how your header, hero, product cards, categories and footer look, and add your own images and text.' },
            { t: 'Your products on show', d: 'Your products appear straight from the system, with their images and categories, so you never enter them twice — and you choose whether to show their prices.' },
            { t: 'Contact on WhatsApp', d: "Visitors message your business's WhatsApp number to ask or to order, and you follow up the conversation yourself." },
            { t: 'Found in search', d: "Set your website's title, description and sharing image as they appear in search engines." },
          ],
        },
        {
          h2: 'Launch your website in three steps',
          steps: [
            'Create your ABAAD account, or log in to your existing one.',
            'Add your products and design your website from the Website section.',
            'Publish your website and share its link with your customers.',
          ],
          note: 'ABAAD Web is part of ABAAD System, not a separate subscription: it is included in the Professional and Enterprise plans, and available as an add-on to the Basic plan.',
          noteLink: ['plans', '#pricing'],
        },
        {
          h2: 'Customize your store to match your brand',
          lead: 'We offer a design and customization service for your online storefront, tailored to your brand identity and needs, for an additional fee.',
          leadLink: ['customize', '#contact'],
        },
      ],
      customize: 'Request store customization',
      also: ['system'],
      endTitle: 'Make your business easier to reach',
      endSub: 'Start your website from your ABAAD account, or contact us and we will help you get started.',
      endCtas: [['startWeb', LINKS.register], ['contact', '#contact']],
    },
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** رابطٌ داخل الموقع أو إلى النظام: «#pricing» يعني قسمَ الرئيسية بلغة الصفحة */
const href = (to, lang) => (to.startsWith('#') ? pagePath('', lang) + to : to);

/** ما يقرؤه البحث عن الصفحة: WebPage جزءٌ من موقع أبعاد، ومسارُها من الرئيسية */
export function pageData(key, lang) {
  const p = PAGES[key][lang], c = COMMON[lang], url = pageUrl(key, lang);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url + '#webpage',
        url,
        name: p.title,
        description: p.description,
        inLanguage: lang,
        isPartOf: { '@id': SITE + '/#website' },
        about: { '@id': SITE + '/#organization' },
        breadcrumb: { '@id': url + '#breadcrumb' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': url + '#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: c.home, item: pageUrl('', lang) },
          { '@type': 'ListItem', position: 2, name: c[key], item: url },
        ],
      },
    ],
  };
}

const STYLE = `
.top{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;max-width:1180px;margin:0 auto;padding:14px 20px}
.top .logo img{height:34px;width:auto;display:block}
.top nav{order:3;flex-basis:100%;display:flex;flex-wrap:wrap;gap:2px 4px;margin-inline:-10px}
.top nav a,.acts .pill{padding:8px 10px;border-radius:999px;font-size:15px;font-weight:600;color:var(--ink2)}
.top nav a[aria-current]{color:var(--ink);background:var(--bg2)}
.acts{margin-inline-start:auto;display:flex;align-items:center;gap:4px}
.acts .login{display:none}
.btn{display:inline-block;background:var(--ink);color:#fff;border-radius:999px;padding:12px 22px;font-size:15px;font-weight:700;text-align:center}
.btn:hover{color:#fff;background:#2b2b2b}
.btn.alt{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.btn.alt:hover{border-color:var(--ink);color:var(--ink)}
@media (min-width:880px){.top nav{order:0;flex-basis:auto;margin-inline:12px 0}.acts .login{display:inline-block}}
header.bar{position:sticky;top:0;z-index:10;background:rgba(251,251,251,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:22px 0 0;padding:0;font-size:14px;color:var(--muted)}
.crumbs li+li::before{content:"›";margin-inline-end:6px}
.crumbs a{color:var(--muted)}
.hero{padding:36px 0 8px}
h1{margin:0;font-size:clamp(34px,5.6vw,60px);line-height:1.2;font-weight:700;letter-spacing:-.02em}
h1 span{display:block;margin-top:8px;font-size:clamp(22px,3.4vw,36px);color:var(--ink2);font-weight:600}
.lead{margin:20px 0 0;max-width:720px;font-size:clamp(17px,2vw,20px);line-height:1.8;color:var(--ink2)}
.intro{margin:14px 0 0;max-width:760px;font-size:16px;line-height:1.95;color:var(--ink2)}
.ctas{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
section.block{padding:56px 0 0}
h2{margin:0;font-size:clamp(26px,3.4vw,38px);line-height:1.35;font-weight:700;letter-spacing:-.01em}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:14px;margin-top:24px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px}
.card h3{margin:0;font-size:18px;font-weight:700}
.card p{margin:8px 0 0;font-size:15px;line-height:1.85;color:var(--ink2)}
.card .more{display:inline-block;margin-top:10px;font-size:14.5px;font-weight:700;color:var(--peach-ink)}
.items{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 0;padding:0;list-style:none}
.items li{background:var(--bg2);border-radius:999px;padding:5px 11px;font-size:13px;font-weight:600;color:var(--ink2)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 0;padding:0;list-style:none}
.chips li{background:var(--peach);color:var(--peach-ink);border-radius:999px;padding:7px 14px;font-size:14px;font-weight:700}
.steps{counter-reset:s;display:grid;gap:12px;margin:24px 0 0;padding:0;list-style:none}
.steps li{counter-increment:s;display:flex;gap:14px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;font-size:16px;line-height:1.8}
.steps li::before{content:counter(s);flex:none;width:30px;height:30px;border-radius:50%;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}
.note{margin:18px 0 0;background:var(--card);border:1px solid var(--line);border-inline-start:3px solid var(--peach-ink);border-radius:14px;padding:16px 18px;font-size:15.5px;line-height:1.85;color:var(--ink2)}
.note a,.leadlink{font-weight:700;color:var(--peach-ink)}
.also{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:14px;margin-top:20px}
.also a{display:block;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px 22px}
.also a:hover{border-color:var(--ink);color:var(--ink)}
.also strong{display:block;font-size:18px}
.also span{display:block;margin-top:6px;font-size:15px;color:var(--ink2);line-height:1.8}
.end{margin:72px 0 0;background:var(--bg2);border-top:1px solid var(--line);padding:48px 0 52px}
.end p{margin:12px 0 0;font-size:16.5px;line-height:1.85;color:var(--ink2);max-width:680px}
footer.foot{background:var(--ink);color:#d9d9d9;padding:34px 0 40px;font-size:14.5px}
footer.foot nav{display:flex;flex-wrap:wrap;gap:10px 22px;margin-bottom:16px}
footer.foot a{color:#d9d9d9;font-weight:600}
footer.foot a:hover{color:#fff}
footer.foot p{margin:6px 0 0;color:#a7a7a7}
footer.foot [dir="ltr"]{unicode-bidi:isolate}
`;

/** «اكتشف أيضًا» — وصفُ كلّ صفحةٍ بوصفها المعتمد */
function alsoCard(key, lang) {
  const p = PAGES[key][lang];
  return `<a href="${pagePath(key, lang)}"><strong>${esc(COMMON[lang][key])}</strong><span>${esc(p.description)}</span></a>`;
}

function section(s, p, lang) {
  let out = `<section class="block"><div class="wrap">\n<h2>${esc(s.h2)}</h2>\n`;
  if (s.lead) out += `<p class="intro">${esc(s.lead)}</p>\n`;
  if (s.leadLink) out += `<p class="intro"><a class="leadlink" href="${href(s.leadLink[1], lang)}">${esc(p[s.leadLink[0]])}</a></p>\n`;
  if (s.cards) {
    out += '<div class="cards">\n' + s.cards.map((c) => {
      let card = `<div class="card"><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p>`;
      if (c.items) card += '<ul class="items">' + c.items.map((i) => `<li>${esc(i)}</li>`).join('') + '</ul>';
      if (c.link) card += `<a class="more" href="${pagePath(c.link, lang)}">${esc(COMMON[lang][c.link])}</a>`;
      return card + '</div>';
    }).join('\n') + '\n</div>\n';
  }
  if (s.chips) out += '<ul class="chips">' + s.chips.map((c) => `<li>${esc(c)}</li>`).join('') + '</ul>\n';
  if (s.steps) out += '<ol class="steps">' + s.steps.map((c) => `<li>${esc(c)}</li>`).join('') + '</ol>\n';
  if (s.note) out += `<p class="note">${esc(s.note)} <a href="${href(s.noteLink[1], lang)}">${esc(p[s.noteLink[0]])}</a></p>\n`;
  return out + '</div></section>\n';
}

const label = (k, p, c) => p[k] ?? c[k];

/** الصفحةُ كاملة بلغتها — `css` بصمةُ site.css كي لا يبقى زائرٌ على نسخةٍ قديمة */
export function renderPage(key, lang, { css, mail, phone }) {
  const p = PAGES[key][lang], c = COMMON[lang], other = lang === 'ar' ? 'en' : 'ar';
  const dir = lang === 'ar' ? 'rtl' : 'ltr', url = pageUrl(key, lang);
  const locale = lang === 'ar' ? 'ar_OM' : 'en_OM', otherLocale = lang === 'ar' ? 'en_OM' : 'ar_OM';
  const btn = ([k, to], i) => `<a class="btn${i ? ' alt' : ''}" href="${href(to, lang)}">${esc(label(k, p, c))}</a>`;
  const navLinks = [['system', pagePath('system', lang)], ['web', pagePath('web', lang)], ['pricing', href('#pricing', lang)], ['contact', href('#contact', lang)]];

  return `<!DOCTYPE html>
<!-- مولَّدة من tools/pages.mjs بـ npm run prerender — لا تعدّلها يدويًّا -->
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="ar-OM" href="${pageUrl(key, 'ar')}">
<link rel="alternate" hreflang="en-OM" href="${pageUrl(key, 'en')}">
<link rel="alternate" hreflang="x-default" href="${pageUrl(key, 'ar')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(c.brand)}">
<meta property="og:locale" content="${locale}">
<meta property="og:locale:alternate" content="${otherLocale}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:image" content="${SITE}/assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(p.title)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&amp;display=swap">
<link rel="stylesheet" href="/assets/site.css?v=${css}">
<style>${STYLE}</style>
<script type="application/ld+json">
${JSON.stringify(pageData(key, lang), null, 2)}
</script>
</head>
<body>
<div data-site="" lang="${lang}" dir="${dir}">
<header class="bar">
  <div class="top">
    <a class="logo" href="${pagePath('', lang)}" aria-label="${esc(c.brand)}"><img src="/assets/img/logo.svg" alt="${esc(c.brand)}" width="102" height="36"></a>
    <nav aria-label="${esc(c.navAria)}">${navLinks.map(([k, to]) => `<a href="${to}"${k === key ? ' aria-current="page"' : ''}>${esc(c[k])}</a>`).join('')}</nav>
    <div class="acts">
      <a class="pill" href="${pagePath(key, other)}" hreflang="${other}" lang="${other}" data-lang-link="" aria-label="${esc(c.langAria)}">${esc(c.langSwitch)}</a>
      <a class="pill login" href="${LINKS.login}">${esc(c.login)}</a>
      <a class="btn" href="${LINKS.register}">${esc(c.startNow)}</a>
    </div>
  </div>
</header>
<main>
<div class="wrap">
<nav class="crumbs" aria-label="${esc(c.crumbAria)}"><ol><li><a href="${pagePath('', lang)}">${esc(c.home)}</a></li><li aria-current="page">${esc(c[key])}</li></ol></nav>
<div class="hero">
<h1>${esc(p.h1)}<span>${esc(p.h1Sub)}</span></h1>
<p class="lead">${esc(p.description)}</p>
<p class="intro">${esc(p.intro)}</p>
<div class="ctas">${p.ctas.map(btn).join('')}</div>
</div>
</div>
${p.sections.map((s) => section(s, p, lang)).join('')}<section class="block"><div class="wrap">
<h2>${esc(c.alsoTitle)}</h2>
<div class="also">${p.also.map((k) => alsoCard(k, lang)).join('')}<a href="${pagePath('', lang)}"><strong>${esc(c.brand)}</strong><span>${esc(c.footNote)}</span></a></div>
</div></section>
<section class="end"><div class="wrap">
<h2>${esc(p.endTitle)}</h2>
<p>${esc(p.endSub)}</p>
<div class="ctas">${p.endCtas.map(btn).join('')}</div>
</div></section>
</main>
<footer class="foot"><div class="wrap">
<nav aria-label="${esc(c.footAria)}"><a href="${pagePath('', lang)}">${esc(c.home)}</a><a href="${pagePath('system', lang)}">${esc(c.system)}</a><a href="${pagePath('web', lang)}">${esc(c.web)}</a><a href="${href('#contact', lang)}">${esc(c.contact)}</a><a href="/privacy/">${esc(c.privacy)}</a><a href="/terms/">${esc(c.terms)}</a></nav>
<p>${esc(c.footNote)}</p>
<p><a href="mailto:${mail}" dir="ltr">${mail}</a> · <a href="tel:${phone.replace(/\s+/g, '')}" dir="ltr">${phone}</a></p>
</div></footer>
</div>
</body>
</html>
`;
}

/** sitemap.xml — كلُّ صفحةٍ عامّة بعنوانها الأصليّ، ولا شيءَ غيرها */
export function sitemap() {
  const locs = [
    pageUrl('', 'ar'), pageUrl('', 'en'),
    ...SUBPAGES.flatMap((k) => [pageUrl(k, 'ar'), pageUrl(k, 'en')]),
    SITE + '/privacy/', SITE + '/terms/', SITE + '/data-deletion/',
  ];
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + locs.map((l) => `  <url><loc>${l}</loc></url>`).join('\n') + '\n</urlset>\n';
}
