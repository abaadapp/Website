-- ما يوفّره Supabase في كلّ مشروع، مصغَّرًا لقاعدةٍ محلّيّة مؤقّتة:
-- الأدوار (anon وauthenticated وservice_role)، وجدول auth.users، وauth.uid()
-- التي تقرأ صاحب الطلب من request.jwt.claims كما يضعها PostgREST في كلّ طلب.
--
-- وصلاحيّاتُ Supabase الافتراضية السخيّة أيضًا — كي يُختبر أنّ supabase.sql
-- يضيّقها بنفسه ولا يعتمد على قاعدةٍ أبخل من الحقيقية.

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create schema auth;
create table auth.users (id uuid primary key, email text unique);

create function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
-- وأوسعُ منها: منحٌ عامّ في كلّ مخطّط جديد
alter default privileges grant all on tables to anon, authenticated, service_role;
alter default privileges grant all on functions to anon, authenticated, service_role;
