# أبعاد — الموقع التعريفي

موقعٌ ثابت (HTML + CSS + JS) على `abaadapp.om`، بلا خطوة build على الخادم.
النظام نفسه على `app.abaadapp.om` في مستودع `abaadapp/abaad.Saas`.

هذا المستودع هو **المصدر الوحيد** للموقع المنشور على `abaadapp.om`.

## الملفات

| الملف | الوصف |
|---|---|
| `index.html` | الصفحة العربية على `/` — وهي القالب: البنيةُ تُعدَّل فيها |
| `en/index.html` | الصفحة الإنجليزية على `/en/` — **تُولَّد** من `index.html` بـ `npm run prerender`، لا تُعدَّل يدويًّا |
| `assets/site.js` | النصوص بالعربية والإنجليزية، وكل ما يتحرّك: القائمة، القدرات، الأسعار، النموذج |
| `assets/site.css` | الألوان والقواعد المتجاوبة وحالات المرور |
| `assets/img/` | الصور (WebP) والشعار ‎`logo.svg`‎ وصورة المشاركة ‎`og.png`‎ |
| `favicon.ico`، `favicon.svg`، `apple-touch-icon.png` | الأيقونات (و`apple-touch-icon.png` هو الشعار في JSON-LD) |
| `robots.txt`، `sitemap.xml` | الزواحف وخريطة الصفحات الخمس |
| `privacy/`، `terms/`، `data-deletion/` | الصفحات التي يقرؤها مراجعُ ميتا وGoogle — **لا تُنقل ولا تُحذف** |
| `uploads/Artboard 2.svg` | الشعار القديم، باقٍ لمن يشير إليه من الخارج |
| `deploy/nginx-abaadapp.om.conf` | كتلتا nginx للموقع و‎www‎ |
| `package.json`، `tools/`، `tests/` | أدوات التطوير وحدها — لا يحتاجها الخادم |

## اللغتان والبحث

- **عنوانان:** العربية على `https://abaadapp.om/` والإنجليزية على `https://abaadapp.om/en/`،
  كلٌّ منهما HTML كامل بلغته قبل أي JavaScript. «English» و«العربية» رابطان عاديّان بينهما.
- **الرأس:** العنوان والوصف وcanonical وhreflang (ar-OM، en-OM، x-default إلى العربية)
  وOpen Graph وJSON-LD (Organization وWebSite) — كلّها من `SEO` أعلى `tools/prerender.mjs`،
  يكتبها `npm run prerender` في الصفحتين. لا تعدّلها في HTML مباشرة.
- **الصفحات القانونية** عربيةٌ وحدها، وcanonical كلٍّ منها بعنوانها النهائيّ (`/privacy/` بالشرطة الأخيرة).
- **`sitemap.xml`** يُعدَّل يدويًّا إن أُضيفت صفحة؛ والاختبار يتأكّد أن كل رابطٍ فيه هو canonical صفحته.

الخط **IBM Plex Sans Arabic** من Google Fonts.

## الروابط إلى النظام

في مكانٍ واحد، أعلى `assets/site.js`:

```js
var APP = 'https://app.abaadapp.om';
var LINKS = { login: APP + '/login', register: APP + '/register' };
```

«تسجيل الدخول» → `https://app.abaadapp.om/login`، و«ابدأ الآن» / «ابدأ مع أبعاد» وأزرار
الباقات → `https://app.abaadapp.om/register`. لا روابط نسبيّة: `/login` على هذا الموقع
يبقى على `abaadapp.om`.

## نموذج التواصل

لا خادم وراءه: بعد التحقّق يفتح رسالةً جاهزة في بريد الزائر إلى `abaadappom@gmail.com`،
ويقول له «أكمل الإرسال من بريدك» — لا «تم الإرسال».

## التعديل

```bash
npm install          # مرّةً واحدة — jsdom وplaywright للأدوات أدناه
npx playwright install webkit chromium   # مرّةً واحدة — لاختبار التخطيط
# عدّل assets/site.js أو assets/site.css أو SEO في tools/prerender.mjs
npm run prerender    # يرسم index.html وen/index.html ويحدّث بصمة الملفّين (?v=)
npm test             # الروابط، الملفّات، SEO، وما يتحرّك في الصفحة
npm run test:layout  # WebKit (Safari) وChromium بأحجام الجوّال واللوحيّ وسطح المكتب
```

`npm test` يسقط إن نسيت `prerender`: nginx يخزّن ‎`site.js`‎ و‎`site.css`‎ ثلاثين يومًا،
والبصمة هي ما يجعل الزائر يأخذ الجديد.

## النشر

- **الدومين:** `abaadapp.om` و`www` → السيرفر `165.227.145.219` عبر nginx وHTTPS
  (Let's Encrypt، تجديد تلقائي، الشهادة تحمل `abaadapp.om` و`www` و`app`).
  `www` يُحوَّل إلى `abaadapp.om` — انظر `deploy/nginx-abaadapp.om.conf`.
- **جذر الموقع على السيرفر:** `/var/www/abaad-website` — **نسخة git من هذا المستودع**
  (أصل HTTPS، سحبٌ فقط). nginx يحجب `.git` والنقطيّات وملفّات التطوير.

```bash
# 1) محليًّا: عدّل ثم ادفع (أو ادمج الطلب)
# 2) على السيرفر: اسحب وصحّح الملكية
ssh root@165.227.145.219 '
  cd /var/www/abaad-website &&
  sudo -u www-data git pull --ff-only origin main &&
  chown -R www-data:www-data /var/www/abaad-website
'
```

لا خطوة build ولا إعادة تحميل لـnginx — ملفّات ثابتة تظهر فور السحب.
