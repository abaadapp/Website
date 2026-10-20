/*
 * فعالية طلة — الإعدادُ الوحيد الذي يتغيّر.
 *
 * الرابطُ والمفتاحُ العامّ (publishable أو anon) علنيّان بطبيعتهما: لا يفتحان إلّا ما تسمح
 * به قاعدة البيانات — talla_status وtalla_submit للزائر، وكلُّ ما سواهما يحتاج دخول المشرف.
 * لا تضع هنا أبدًا المفتاح السرّيّ (secret أو service_role) ولا كلمة مرور.
 *
 * بعد أيّ تعديلٍ في ملفّات talla-event: node deploy/talla/stamp.mjs
 */
window.TALLA_CONFIG = {
  // false ← الصفحتان تقولان «غير متاح الآن» ولا تتّصلان بشيء
  enabled: true,
  // https://<المعرّف>.supabase.co — من Project Settings → Data API
  url: '',
  // المفتاح العامّ: sb_publishable_… (أو anon القديم) — من Project Settings → API Keys
  key: '',
};
