-- ═══════════════════════════════════════════════════════════════════════════
-- فعالية طلة — محوُ قاعدتها من مشروع Supabase
--
-- الأبسط والأشمل بعد الفعالية: حذفُ المشروع كلّه من لوحته
-- (Project Settings → General → Delete project) — فيُحذف معه كلّ شيء.
--
-- وهذا الملفّ لمن يريد إبقاء المشروع: يحذف الدوالّ والجداول والآراء والفائزين
-- نهائيًّا. صدّر الآراء (CSV) قبله إن أردت الاحتفاظ بها. وحسابُ المشرف يُحذف
-- من Authentication → Users.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

drop function if exists public.talla_admin_exclude(text, boolean);
drop function if exists public.talla_admin_set(boolean, boolean, timestamptz, boolean);
drop function if exists public.talla_admin_draw();
drop function if exists public.talla_admin_state();
drop function if exists public.talla_submit(text, text, boolean, text);
drop function if exists public.talla_status();

drop schema if exists talla cascade;

commit;
