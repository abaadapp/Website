-- ═══════════════════════════════════════════════════════════════════════════
-- من يصل إلى ماذا — على قاعدةٍ مؤقّتة بعد supabase-stub.sql وsupabase.sql.
-- كلُّ عبارةٍ تُنفَّذ بدور الطالب كما يفعل PostgREST: الزائر (anon)، وحسابٌ
-- مسجَّل ليس مشرفًا، والمشرف. والسقوطُ الأوّل يوقف الملفّ برسالته.
-- ═══════════════════════════════════════════════════════════════════════════
\set ON_ERROR_STOP 1
set client_min_messages = notice;

create schema t;
create table t.results (n serial primary key, name text not null, got text);

-- عبارةٌ بدور طالب، ونتيجتُها نصًّا — أو الخطأ: «ERROR <sqlstate> <الرسالة>»
create function t.try(p_role text, p_sub uuid, p_sql text) returns text
language plpgsql as $$
declare
  r text;
begin
  perform set_config('request.jwt.claims',
    case when p_sub is null then json_build_object('role', p_role)::text
         else json_build_object('role', p_role, 'sub', p_sub)::text end, true);
  perform set_config('role', p_role, true);
  begin
    if p_sql ~* '^\s*(select|with)\M' then
      execute p_sql into r;
    else
      execute p_sql;
    end if;
    r := coalesce(r, 'OK');
  exception when others then
    r := 'ERROR ' || sqlstate || ' ' || sqlerrm;
  end;
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);
  return r;
end $$;

create function t.anon(p_sql text) returns text language sql as $$
  select t.try('anon', null, p_sql) $$;
create function t.guest(p_sql text) returns text language sql as $$
  select t.try('authenticated', '22222222-2222-4222-8222-222222222222', p_sql) $$;
create function t.admin(p_sql text) returns text language sql as $$
  select t.try('authenticated', '11111111-1111-4111-8111-111111111111', p_sql) $$;

create function t.check(p_name text, p_got text, p_pattern text) returns void
language plpgsql as $$
begin
  insert into t.results (name, got) values (p_name, p_got);
  if p_got is null or p_got !~ p_pattern then
    raise exception 'FAIL: %  — got: %  — expected: %', p_name, p_got, p_pattern;
  end if;
  raise notice 'ok   %', p_name;
end $$;

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'owner@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'guest@example.test');
insert into talla.admins (user_id) values ('11111111-1111-4111-8111-111111111111');

-- ═══ الزائر: يرسل رأيه، ولا يقرأ شيئًا ═══════════════════════════════════════
select t.check('visitor: the form is open',
  t.anon($$select public.talla_status()::text$$), '"accepting": true');
select t.check('visitor: sends feedback and joins the draw',
  t.anon($$select public.talla_submit('سارة علي', 'تنظيمٌ رائع والمكان جميل', true)::text$$), '"ok": true');
select t.check('visitor: sends feedback without the draw',
  t.anon($$select public.talla_submit('خالد سالم', 'الصوت كان منخفضًا في القاعة', false)::text$$), '"ok": true');
select t.check('visitor: a one-letter name is refused',
  t.anon($$select public.talla_submit('س', 'رأي', true)::text$$), '^ERROR P0001 invalid_name$');
select t.check('visitor: a name of dots is refused',
  t.anon($$select public.talla_submit('..', 'رأي', true)::text$$), '^ERROR P0001 invalid_name$');
select t.check('visitor: a name over 80 letters is refused',
  t.anon($$select public.talla_submit(repeat('ا', 81), 'رأي', true)::text$$), '^ERROR P0001 invalid_name$');
select t.check('visitor: feedback under 3 letters is refused',
  t.anon($$select public.talla_submit('سارة علي', 'جي', true)::text$$), '^ERROR P0001 invalid_feedback$');
select t.check('visitor: feedback over 2000 letters is refused',
  t.anon($$select public.talla_submit('سارة علي', repeat('ا', 2001), true)::text$$), '^ERROR P0001 invalid_feedback$');
select t.check('visitor: the hidden trap answers ok',
  t.anon($$select public.talla_submit('روبوت آلي', 'رسالة آلية', true, 'http://spam.example')::text$$), '"ok": true');
select t.check('visitor: …but nothing from the trap is kept',
  (select count(*)::text from talla.responses where full_name = 'روبوت آلي'), '^0$');

select t.check('visitor: cannot read responses',
  t.anon($$select count(*)::text from talla.responses$$), '^ERROR 42501');
select t.check('visitor: cannot read winners',
  t.anon($$select count(*)::text from talla.winners$$), '^ERROR 42501');
select t.check('visitor: cannot read settings',
  t.anon($$select count(*)::text from talla.settings$$), '^ERROR 42501');
select t.check('visitor: cannot read admins',
  t.anon($$select count(*)::text from talla.admins$$), '^ERROR 42501');
select t.check('visitor: cannot write the excluded column',
  t.anon($$insert into talla.responses (full_name, feedback, draw_consent, excluded) values ('زائر', 'رأي', true, true)$$), '^ERROR 42501');
select t.check('visitor: cannot change settings',
  t.anon($$update talla.settings set accepting = false$$), '^ERROR 42501');
select t.check('visitor: cannot write a winner',
  t.anon($$insert into talla.winners (round, name_key, full_name, response_id, drawn_by) select 1, name_key, full_name, id, id from talla.responses limit 1$$), '^ERROR 42501');

select t.check('visitor: a direct insert still passes the trigger',
  t.anon($$insert into talla.responses (full_name, feedback, draw_consent) values ('  زائر    مباشر ', 'رأيٌ مباشر', false)$$), '^OK$');
select t.check('visitor: …which wrote the name, the key and excluded itself',
  (select full_name || '|' || name_key || '|' || excluded from talla.responses where feedback = 'رأيٌ مباشر'),
  '^زائر مباشر\|زايرمباشر\|false$');

select t.check('visitor: cannot see the state', t.anon($$select public.talla_admin_state()::text$$), '^ERROR 42501');
select t.check('visitor: cannot draw', t.anon($$select public.talla_admin_draw()::text$$), '^ERROR 42501');
select t.check('visitor: cannot switch', t.anon($$select public.talla_admin_set(false, false)::text$$), '^ERROR 42501');
select t.check('visitor: cannot exclude', t.anon($$select public.talla_admin_exclude('x', true)::text$$), '^ERROR 42501');
select t.check('visitor: cannot ask who is admin', t.anon($$select talla.is_admin()::text$$), '^ERROR 42501');
select t.check('visitor: cannot reach the draw inside talla', t.anon($$select talla.draw()::text$$), '^ERROR 42501');

-- ═══ حسابٌ مسجَّل ليس مشرفًا ═══════════════════════════════════════════════
select t.check('member: state is forbidden', t.guest($$select public.talla_admin_state()::text$$), '^ERROR P0001 forbidden$');
select t.check('member: draw is forbidden', t.guest($$select public.talla_admin_draw()::text$$), '^ERROR P0001 forbidden$');
select t.check('member: the inner draw is forbidden too', t.guest($$select talla.draw()::text$$), '^ERROR P0001 forbidden$');
select t.check('member: switching is forbidden', t.guest($$select public.talla_admin_set(false, false)::text$$), '^ERROR P0001 forbidden$');
select t.check('member: excluding is forbidden', t.guest($$select public.talla_admin_exclude('x', true)::text$$), '^ERROR P0001 forbidden$');
select t.check('member: RLS shows no responses', t.guest($$select count(*)::text from talla.responses$$), '^0$');
select t.check('member: no one reads the feedback column', t.guest($$select feedback from talla.responses limit 1$$), '^ERROR 42501');
select t.check('member: RLS shows no winners', t.guest($$select count(*)::text from talla.winners$$), '^0$');
select t.check('member: RLS shows no settings', t.guest($$select count(*)::text from talla.settings$$), '^0$');
select t.check('member: cannot read admins', t.guest($$select count(*)::text from talla.admins$$), '^ERROR 42501');
select t.check('member: an update reaches no setting',
  t.guest($$with u as (update talla.settings set accepting = false where id returning 1) select count(*)::text from u$$), '^0$');
select t.check('member: …and the form is still open', (select accepting::text from talla.settings), '^true$');
select t.check('member: can still send feedback',
  t.guest($$select public.talla_submit('ضيف مسجل', 'تجربة جيدة', true)::text$$), '"ok": true');

-- ═══ المشرف ═══════════════════════════════════════════════════════════════
select t.check('admin: sees the names in the draw',
  t.admin($$select public.talla_admin_state()::text$$), 'سارة علي');
select t.check('admin: …not those who did not join it',
  t.admin($$select (public.talla_admin_state()::text ~ 'خالد سالم')::text$$), '^false$');
select t.check('admin: …and never the feedback text',
  t.admin($$select (public.talla_admin_state()::text ~ 'feedback|تنظيم|الصوت')::text$$), '^false$');
select t.check('admin: cannot read the feedback column either',
  t.admin($$select feedback from talla.responses limit 1$$), '^ERROR 42501');
select t.check('admin: RLS shows him every response',
  t.admin($$select count(*)::text from talla.responses$$), '^' || (select count(*) from talla.responses) || '$');
select t.check('admin: cannot read admins',
  t.admin($$select count(*)::text from talla.admins$$), '^ERROR 42501');
select t.check('admin: cannot write a winner himself',
  t.admin($$insert into talla.winners (round, name_key, full_name, response_id, drawn_by) select 1, name_key, full_name, id, id from talla.responses limit 1$$), '^ERROR 42501');
select t.check('admin: cannot change a winner',
  t.admin($$update talla.winners set full_name = 'x'$$), '^ERROR 42501');
select t.check('admin: cannot delete a winner',
  t.admin($$delete from talla.winners$$), '^ERROR 42501');
select t.check('admin: cannot rewrite a name',
  t.admin($$update talla.responses set full_name = 'x'$$), '^ERROR 42501');

-- أشكالُ الاسم الواحد فرصةٌ واحدة
select t.anon($$select public.talla_submit('محمد أحمد', 'رأي أوّل', true)::text$$);
select t.anon($$select public.talla_submit('مُحمد  احمد', 'رأي ثانٍ', true)::text$$);
select t.anon($$select public.talla_submit('محمد احمد', 'رأي ثالث', true)::text$$);
select t.check('admin: three spellings of one name are one participant',
  t.admin($$select count(*)::text from jsonb_array_elements(public.talla_admin_state() -> 'participants') e
            where e ->> 'key' = talla.name_key('محمد أحمد')$$), '^1$');
select t.check('admin: …with three entries',
  t.admin($$select e ->> 'entries' from jsonb_array_elements(public.talla_admin_state() -> 'participants') e
            where e ->> 'key' = talla.name_key('محمد أحمد')$$), '^3$');

-- ═══ السحب ═════════════════════════════════════════════════════════════════
truncate talla.winners, talla.responses;
select t.anon(format($$select public.talla_submit(%L, 'رأي', true)::text$$, n))
from unnest(array['أمل سعيد', 'بدر خلفان', 'جميلة راشد', 'داود ناصر', 'هدى يوسف', 'ريم مبارك']) n;
select t.anon($$select public.talla_submit('أمل  سعيد', 'رأي مكرّر', true)::text$$);
select t.anon($$select public.talla_submit('وليد حمد', 'لا أريد السحب', false)::text$$);

select t.check('admin: excludes a name',
  t.admin(format($$select public.talla_admin_exclude(%L, true)::text$$, talla.name_key('ريم مبارك'))), '"excluded": true');

select t.check('draw: the first draw is round 1', t.admin($$select public.talla_admin_draw()::text$$), '"round": 1');
select t.check('draw: …recorded with its drawer and time',
  (select (drawn_by = '11111111-1111-4111-8111-111111111111' and drawn_at is not null)::text from talla.winners where round = 1), '^true$');
select t.admin($$select public.talla_admin_draw()::text$$) from generate_series(2, 5);
select t.check('draw: five draws, five different names',
  (select count(distinct name_key)::text from talla.winners), '^5$');
select t.check('draw: the excluded name never won',
  (select count(*)::text from talla.winners where name_key = talla.name_key('ريم مبارك')), '^0$');
select t.check('draw: the one who did not join never won',
  (select count(*)::text from talla.winners where name_key = talla.name_key('وليد حمد')), '^0$');
select t.check('draw: no one is left to draw',
  t.admin($$select public.talla_admin_draw()::text$$), '^ERROR P0001 no_candidates$');
select t.check('draw: the state lists rounds 1 to 5',
  t.admin($$select string_agg(e ->> 'round', ',' order by (e ->> 'round')::int) from jsonb_array_elements(public.talla_admin_state() -> 'winners') e$$),
  '^1,2,3,4,5$');
select t.check('draw: a returned name can be drawn again',
  t.admin(format($$select public.talla_admin_exclude(%L, false)::text$$, talla.name_key('ريم مبارك'))), '"excluded": false');
select t.check('draw: …and it is the only one left',
  t.admin($$select public.talla_admin_draw() ->> 'name'$$), '^ريم مبارك$');

-- ═══ الإغلاق بعد الفعالية ═══════════════════════════════════════════════════
select t.check('close: the admin closes the form',
  t.admin($$select public.talla_admin_set(false, null)::text$$), '"accepting": false');
select t.check('close: the visitor sees it closed', t.anon($$select public.talla_status()::text$$), '"accepting": false');
select t.check('close: the form refuses feedback',
  t.anon($$select public.talla_submit('متأخر جدا', 'رأي بعد الإغلاق', true)::text$$), '^ERROR P0001 closed$');
select t.check('close: RLS refuses a direct insert too',
  t.anon($$insert into talla.responses (full_name, feedback, draw_consent) values ('متأخر جدا', 'رأي', true)$$),
  '^ERROR 42501 new row violates row-level security policy');
select t.check('close: the admin stops the draw',
  t.admin($$select public.talla_admin_set(null, false)::text$$), '"drawing": false');
truncate talla.winners;
select t.check('close: a stopped draw draws no one',
  t.admin($$select public.talla_admin_draw()::text$$), '^ERROR P0001 draw_closed$');
select t.check('close: reopening both',
  t.admin($$select public.talla_admin_set(true, true)::text$$), '"open_now": true');
select t.check('close: a closing time in the past closes the form',
  t.admin($$select public.talla_admin_set(p_closes_at => now() - interval '1 minute') ->> 'open_now'$$), '^false$');
select t.check('close: …for the visitor too', t.anon($$select public.talla_status()::text$$), '"accepting": false');
select t.check('close: a closing time ahead keeps it open',
  t.admin($$select public.talla_admin_set(p_closes_at => now() + interval '1 hour') ->> 'open_now'$$), '^true$');
select t.check('close: clearing the closing time',
  t.admin($$select coalesce(public.talla_admin_set(p_clear_closes => true) ->> 'closes_at', 'cleared')$$), '^cleared$');

-- ═══ سقف الإغراق ═══════════════════════════════════════════════════════════
update talla.responses set created_at = now() - interval '2 minutes';
insert into talla.responses (full_name, feedback, draw_consent)
select 'مرسل ' || i, 'رأي', false from generate_series(1, 59) i;
select t.check('flood: the 60th feedback in a minute is kept',
  t.anon($$select public.talla_submit('المرسل الستون', 'رأي', false)::text$$), '"ok": true');
select t.check('flood: the 61st waits',
  t.anon($$select public.talla_submit('المرسل الزائد', 'رأي', false)::text$$), '^ERROR P0001 busy$');
update talla.responses set created_at = now() - interval '2 minutes';

-- ═══ العدل: أربعة أسماء، أربعة آلاف سحبة ═══════════════════════════════════
truncate talla.winners, talla.responses;
select t.anon(format($$select public.talla_submit(%L, 'رأي', true)::text$$, n))
from unnest(array['الأول', 'الثاني', 'الثالث', 'الرابع']) n;

create table t.fair (name_key text primary key, wins integer not null default 0);
do $$
declare
  w jsonb;
begin
  perform set_config('request.jwt.claims',
    json_build_object('role', 'authenticated', 'sub', '11111111-1111-4111-8111-111111111111')::text, true);
  for i in 1..4000 loop
    w := public.talla_admin_draw();
    insert into t.fair (name_key, wins) values (w ->> 'key', 1)
      on conflict (name_key) do update set wins = t.fair.wins + 1;
    delete from talla.winners;
  end loop;
end $$;
do $$ begin
  raise notice 'wins per name, expected about 1000 each: %',
    (select string_agg(wins::text, ' · ' order by name_key) from t.fair);
end $$;
select t.check('fairness: every name had the same chance (chi-square < 21.1, p = 0.0001)',
  (select case when count(*) = 4 and sum((wins - 1000.0) ^ 2 / 1000.0) < 21.1 then 'fair'
               else 'unfair ' || string_agg(wins::text, ',') end from t.fair), '^fair$');

do $$ begin
  raise notice '% checks passed', (select count(*) from t.results);
end $$;
