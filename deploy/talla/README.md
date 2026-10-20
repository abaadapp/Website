# فعالية طلة — نموذج الرأي وعجلة السحب (مؤقّتة)

صفحتان مؤقّتتان على الموقع التعريفي، وخادمٌ خلفيّ مستقلّ تمامًا على Supabase:

| الرابط | الصفحة |
|---|---|
| `https://abaadapp.om/talla-feedback/` | نموذج الرأي للزوّار: الاسم، والرأي، وموافقةٌ اختيارية على دخول السحب |
| `https://abaadapp.om/talla-draw/` | عجلة السحب للمشرف وحده، بعد الدخول بحسابه |

لا علاقة لها بنظام أبعاد: لا تتّصل بـ`app.abaadapp.om`، ولا بقاعدته، ولا بحساباته. ولا تعدّل
أيَّ ملفٍّ قائمٍ في هذا المستودع، ولا إعداد nginx، ولا DNS. والاختبار `tests/talla-untouched.test.mjs`
يتأكّد أنّ كلّ ملفٍّ من ملفّات الموقع باقٍ كما كان، بايتًا ببايت.

## الملفّات — كلّها جديدة، وتُحذف معًا

| الملفّ | دوره |
|---|---|
| `talla-feedback/index.html` | صفحة الرأي |
| `talla-draw/index.html` | صفحة السحب |
| `talla-event/config.js` | رابط مشروع Supabase والمفتاح العامّ — **الملفّ الوحيد الذي يتغيّر** |
| `talla-event/api.js` | الاتّصال بـSupabase بـ`fetch` وحده، بلا مكتبة |
| `talla-event/feedback.js` | النموذج |
| `talla-event/wheel.js` | رسمُ العجلة وحركتها — لا تختار أحدًا |
| `talla-event/draw.js` | الدخول، والقائمة الحيّة، والتحكّم، والسحب |
| `talla-event/talla.css` | تنسيق الصفحتين وحدهما |
| `deploy/talla/supabase.sql` | الجداول وRLS والدوالّ والصلاحيّات — يُلصق في Supabase مرّةً واحدة |
| `deploy/talla/teardown.sql` | محوُ ذلك كلّه من المشروع |
| `deploy/talla/stamp.mjs` | بصمةُ الملفّات في الصفحتين (`?v=`) |
| `deploy/talla/remove.sh` | إزالةُ الفعالية من المستودع بأمرٍ واحد |
| `deploy/talla/tests/` | اختبارُ القاعدة على PostgreSQL مؤقّت (`run.sh`) |
| `tests/talla.test.mjs` | الصفحتان في jsdom، وحرّاسُ CSP والأسرار وsupabase.sql |
| `tests/talla.browser.mjs` | الصفحتان في WebKit وChromium، وصفحاتُ أبعاد الأصلية كما كانت |
| `tests/talla-untouched.test.mjs` | ملفّات الموقع الأصلية الـ41 بايتًا ببايت |

nginx يحجب `deploy/` و`tests/`، فلا يُقدَّم منهما شيء. والمستودع عامّ: لا سرَّ في أيّ ملفّ.

## من يصل إلى ماذا

- **الزائر** (المفتاح العامّ، دور `anon`): `talla_status` و`talla_submit` فقط. لا يقرأ رأيًا ولا اسمًا.
- **المشرف**: حسابٌ في Supabase Auth مسجَّلٌ في `talla.admins`. يرى الأسماءَ والأعداد، ويسحب،
  ويغلق. ونصُّ الآراء لا يُقرأ عبر الواجهة لأحد، ولا للمشرف: يُقرأ من لوحة Supabase.
- **RLS في الجداول الأربعة**، وهي في مخطّط `talla` الذي لا تنشره واجهة البيانات. وكلُّ دالّةٍ
  في `public` تعمل بصلاحيّات مستدعيها، فتسري عليها RLS.
- **السحب في القاعدة** (`talla.draw`): مولّد PostgreSQL القويّ، ونتيجةٌ تُسجَّل بوقتها ومن سحبها،
  وقيدٌ فريد يمنع فوز الاسم مرّتين، وقفلٌ يمنع سحبين معًا. لا يملك أحدٌ الكتابةَ في الفائزين،
  فالمتصفّح لا يختار الفائز. العجلةُ تدور حتى تقف على من اختارته القاعدة.
- **فرصةٌ واحدة لكلّ اسم** بعد توحيد كتابته (المسافات، والهمزات، والتاء المربوطة، والتشكيل).
  ويستطيع المشرف استبعاد اسمٍ وإرجاعه.
- **سقفٌ للإغراق**: ستّون رأيًا في الدقيقة للفعالية كلّها، وخانةٌ مخفيّة تصطاد البرامج الآلية.

## الإعداد في Supabase — مرّةً واحدة

1. **مشروعٌ جديد** على [supabase.com](https://supabase.com) بالخطّة المجانية، باسم `talla-event`.
   كلمةُ مرور القاعدة لك وحدك. واختر أقرب منطقةٍ متاحة.
2. **SQL Editor ← New query**: الصق `deploy/talla/supabase.sql` كاملًا ← **Run**.
3. **Authentication ← Users ← Add user ← Create new user**: بريدك وكلمة مرورٍ قويّة، و«Auto Confirm User»
   مُعلَّمة ← **Create user**.
4. **SQL Editor**: اجعل هذا الحساب مشرفًا (ببريدك):
   ```sql
   insert into talla.admins (user_id) select id from auth.users where email = 'بريدك@example.com';
   select count(*) from talla.admins;  -- 1
   ```
5. **Authentication ← Sign In / Providers**: أطفئ «Allow new users to sign up» ← **Save**.
6. **Integrations ← Data API ← Settings**: تأكّد أنّ «Exposed schemas» **لا** تحوي `talla`.
7. أرسل الرابط والمفتاح العامّ وحدهما، أو اكتبهما في `talla-event/config.js`:
   - **Project URL**: `https://<المعرّف>.supabase.co`
   - **Publishable key**: `sb_publishable_…`
   - **لا** تُرسل المفتاح السرّيّ (`sb_secret_…` / `service_role`) ولا كلمة مرور القاعدة ولا كلمة مرورك.

ثمّ:
```bash
node deploy/talla/stamp.mjs   # بصمةُ config.js الجديدة في الصفحتين
npm test && npm run test:layout
```

ملاحظات:
- مُرشد الأمان في Supabase (Advisors) قد يذكر «RLS enabled, no policy» لجدول `talla.admins`: مقصود،
  فلا أحد يقرؤه عبر الواجهة.
- المشروع المجانيّ يتوقّف بعد نحو أسبوعٍ بلا استخدام، ويُستأنف من لوحته بـ«Resume project».
  افتحه قبل الفعالية بيوم.
- دخول المشرف محدودٌ من Supabase نفسه لكلّ عنوان IP.

## أثناء الفعالية

- رمز QR إلى `https://abaadapp.om/talla-feedback/`.
- على شاشة العرض: `https://abaadapp.om/talla-draw/` ← الدخول ← «ملء الشاشة».
  القائمة تتحدّث كلّ خمس ثوانٍ، و«ابدأ السحب» يطلب الفائز من القاعدة.
- من فاز ولم يحضر: اسحب مرّةً أخرى. يبقى الأوّل مسجّلًا فلا يفوز ثانية.
- قراءة الآراء: Supabase ← **Table Editor** ← المخطّط `talla` ← `responses` (والتصدير CSV من هناك).

## الإيقاف

| متى | كيف |
|---|---|
| فورًا، بلا نشر | صفحة السحب ← **إنهاء الفعالية**: يُغلق الاستقبال ويتوقّف السحب. أو كلٌّ بمفتاحه في «التحكّم» |
| في موعدٍ تحدّده | صفحة السحب ← «إغلاقٌ تلقائيّ للاستقبال» |
| بلا صفحة السحب | SQL Editor: `update talla.settings set accepting = false, drawing = false where id;` |
| إيقافٌ كامل | Supabase ← Project Settings ← General ← **Pause project** |
| من الموقع نفسه | `enabled: false` في `talla-event/config.js` ← `node deploy/talla/stamp.mjs` ← نشر |

## الإزالة الكاملة بعد الفعالية

1. **صدّر الآراء** إن أردت الاحتفاظ بها: Table Editor ← `talla.responses` ← Export ← CSV.
2. **أزل الملفّات من الموقع**:
   ```bash
   git switch main && git pull --ff-only
   sh deploy/talla/remove.sh          # فرع remove/talla-event فيه حذفُ ملفّات الفعالية وحدها
   git push -u origin remove/talla-event   # ثمّ طلبٌ، ودمجٌ بموافقة صاحب الموقع
   ```
   ثمّ على الخادم بالأمر المعتاد (انظر README المستودع):
   ```bash
   cd /var/www/abaad-website && sudo -u www-data git pull --ff-only origin main
   ```
   بعدها يعرض `/talla-feedback/` و`/talla-draw/` الصفحةَ الرئيسية كما كانا قبل الفعالية
   (nginx: `try_files … /index.html`)، فلا رابطَ مكسور لمن يمسح الرمز لاحقًا.
3. **احذف مشروع Supabase**: Project Settings ← General ← **Delete project** — تُحذف الآراء والحساب
   والمفاتيح نهائيًّا. أو، لإبقاء المشروع، شغّل `deploy/talla/teardown.sql`.

## التراجع أثناء الفعالية

Revert لطلب الفعالية على GitHub ← دمج ← `git pull` على الخادم. يعود الموقع كما كان حرفيًّا،
لأنّ الفعالية لم تغيّر ملفًّا قائمًا.

## الاختبار

```bash
npm test                      # jsdom: الصفحتان، والحرّاس، وملفّات الموقع الأصلية
npm run test:layout           # WebKit وChromium: الصفحتان، وصفحات أبعاد كما كانت
sh deploy/talla/tests/run.sh  # القاعدة على PostgreSQL مؤقّت: RLS والصلاحيّات والسحب والعدل
```
