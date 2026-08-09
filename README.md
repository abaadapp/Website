# أبعاد — الموقع التعريفي

موقع static (HTML + JS) بلا خطوة build. الخط العربي (Almarai) يُحمّل من Google Fonts،
والنصوص متعدّدة اللغة تُبدَّل في المتصفّح عبر `support.js`.

هذا المستودع هو **المصدر الوحيد** للموقع المنشور على `abaadapp.om`.

## الملفات

| الملف | الوصف |
|---|---|
| `index.html` | الصفحة الرئيسية (تُقدَّم كما هي) |
| `support.js` | تشغيل عناصر `<x-dc>` وتبديل اللغة في المتصفّح |
| `image-slot.js` | مكوّن عرض الصور `<image-slot>` |
| `uploads/` | الأصول (الشعار `Artboard 2.svg`) |

زرّ «تسجيل الدخول» يوجّه إلى التطبيق: `https://app.abaadapp.om`.

## النشر

- **الدومين:** `abaadapp.om` (+ `www`) → السيرفر `165.227.145.219`، عبر nginx وHTTPS
  (Let's Encrypt، تجديد تلقائي). التطبيق نفسه على `app.abaadapp.om`.
- **جذر الموقع على السيرفر:** `/var/www/abaad-website` — وهو **نسخة git من هذا المستودع**
  (أصل HTTPS، سحبٌ فقط). nginx يحجب `.git` والنقطيّات.

### التدفّق: من هنا إلى السيرفر

```bash
# 1) محليًّا: عدّل ثم ادفع
git add -A && git commit -m "..." && git push

# 2) على السيرفر: اسحب وصحّح الملكية
ssh root@165.227.145.219 '
  cd /var/www/abaad-website &&
  sudo -u www-data git pull --ff-only origin main &&
  chown -R www-data:www-data /var/www/abaad-website
'
```

لا خطوة build ولا إعادة تحميل لـnginx — ملفّات ثابتة تظهر فور السحب.
