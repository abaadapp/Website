-- ═══════════════════════════════════════════════════════════════════════════
-- فعالية طلة — قاعدةُ نموذج الرأي وعجلة السحب
--
-- يُشغَّل مرّةً واحدة في «SQL Editor» لمشروع Supabase المستقلّ الخاصّ بالفعالية.
-- لا علاقة له بنظام أبعاد ولا بقاعدته ولا بحساباته. وتشغيلُه مرّةً ثانية آمن.
--
-- من يصل إلى ماذا:
--   - الجداول في مخطّط `talla`، وواجهةُ البيانات (Data API) لا تنشره: لا يُقرأ
--     جدولٌ ولا يُكتب فيه برابطٍ مباشر. وفوق ذلك RLS مفعّلٌ في كلّ جدول.
--   - الزائر (المفتاح العامّ، دور anon) يملك أمرين فقط: talla_status وtalla_submit.
--     لا يقرأ رأيًا ولا اسمًا، ولا يرى الفائزين.
--   - المشرف حسابٌ في Supabase Auth مسجَّلٌ في talla.admins. قراءةُ الأسماء
--     وتعديلُ الإعدادات تمرّ بسياسات RLS التي تشترط talla.is_admin().
--     ونصُّ الآراء لا يُقرأ عبر الواجهة أصلًا، ولا للمشرف: يُقرأ من لوحة Supabase.
--   - السحب في قاعدة البيانات وحدها (talla.draw): مولّدٌ عشوائيّ قويّ، ونتيجةٌ
--     تُسجَّل بوقتها، وقيدٌ فريد يمنع فوز الاسم مرّتين. لا يملك أحدٌ أن يكتب في
--     talla.winners مباشرة، فالمتصفّح لا يختار الفائز.
--   - كلُّ دالّةٍ في public تعمل بصلاحيّات من يستدعيها (security invoker)، فتسري
--     عليها RLS. والدوالّ التي تتجاوزها (security definer) في talla وحده، خارج
--     الواجهة، كما توصي Supabase.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

create schema if not exists talla;
revoke all on schema talla from public;
grant usage on schema talla to anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ─── الإعدادات: صفٌّ واحد ───────────────────────────────────────────────────
create table if not exists talla.settings (
  id         boolean primary key default true check (id),
  accepting  boolean not null default true,  -- استقبال الآراء
  drawing    boolean not null default true,  -- السحب
  closes_at  timestamptz,                    -- إغلاقٌ تلقائيّ للاستقبال، اختياريّ
  updated_at timestamptz not null default now()
);
insert into talla.settings (id) values (true) on conflict (id) do nothing;

-- ─── الآراء ─────────────────────────────────────────────────────────────────
create table if not exists talla.responses (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  full_name    text not null check (char_length(full_name) between 2 and 80),
  feedback     text not null check (char_length(feedback) between 3 and 2000),
  draw_consent boolean not null default false,
  -- الاسمُ بعد توحيد كتابته: فرصةٌ واحدة في السحب لكلّ اسم مهما تكرّر الإرسال
  name_key     text not null check (name_key <> ''),
  excluded     boolean not null default false
);
create index if not exists responses_created_at on talla.responses (created_at);
create index if not exists responses_name_key on talla.responses (name_key) where draw_consent;

-- ─── الفائزون ───────────────────────────────────────────────────────────────
create table if not exists talla.winners (
  round       integer primary key check (round > 0),
  name_key    text not null unique,  -- لا يفوز الاسمُ مرّتين
  full_name   text not null,
  response_id uuid not null references talla.responses (id),
  drawn_at    timestamptz not null default now(),
  drawn_by    uuid not null
);

-- ─── المشرفون: حساباتٌ في Supabase Auth ─────────────────────────────────────
create table if not exists talla.admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

-- ─── الدوالّ الداخلية ───────────────────────────────────────────────────────

-- توحيدُ الاسم: الهمزات والألف المقصورة والتاء المربوطة والتشكيل والتطويل والمسافات
create or replace function talla.name_key(n text) returns text
language sql immutable set search_path = '' as $$
  select lower(regexp_replace(
    translate(normalize(coalesce(n, ''), NFKC), 'أإآٱىةؤئ', 'اااايهوي'),
    '[[:space:].,_''"-]|[ـً-ٰٟ]', '', 'g'))
$$;

create or replace function talla.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from talla.admins a where a.user_id = auth.uid())
$$;

-- الاستقبالُ مفتوحٌ: مفتاحه مُشعَل، ولم يحن موعد الإغلاق إن كان له موعد
create or replace function talla.accepting() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select s.accepting and (s.closes_at is null or now() < s.closes_at)
    from talla.settings s where s.id
  ), false)
$$;

-- كلُّ رأيٍ يمرّ من هنا مهما كان طريقه: ما يرسله المتصفّح ثلاثةُ حقول، والباقي يُكتب هنا
create or replace function talla.before_response() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  recent integer;
begin
  new.id         := gen_random_uuid();
  new.created_at := now();
  new.excluded   := false;
  new.full_name  := btrim(regexp_replace(coalesce(new.full_name, ''), '\s+', ' ', 'g'));
  new.feedback   := btrim(coalesce(new.feedback, ''));
  new.name_key   := talla.name_key(new.full_name);

  -- سقفٌ للإغراق: ستّون رأيًا في الدقيقة للفعالية كلّها
  select count(*) into recent from talla.responses r where r.created_at > now() - interval '1 minute';
  if recent >= 60 then
    raise exception 'busy';
  end if;

  return new;
end $$;

drop trigger if exists before_response on talla.responses;
create trigger before_response before insert on talla.responses
  for each row execute function talla.before_response();

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table talla.settings  enable row level security;
alter table talla.responses enable row level security;
alter table talla.winners   enable row level security;
alter table talla.admins    enable row level security;  -- بلا سياسة: لا يقرؤه أحدٌ عبر الواجهة

drop policy if exists visitors_send_while_open on talla.responses;
create policy visitors_send_while_open on talla.responses
  for insert to anon, authenticated with check (talla.accepting());

drop policy if exists admins_read_responses on talla.responses;
create policy admins_read_responses on talla.responses
  for select to authenticated using (talla.is_admin());

drop policy if exists admins_exclude_responses on talla.responses;
create policy admins_exclude_responses on talla.responses
  for update to authenticated using (talla.is_admin()) with check (talla.is_admin());

drop policy if exists admins_read_winners on talla.winners;
create policy admins_read_winners on talla.winners
  for select to authenticated using (talla.is_admin());

drop policy if exists admins_read_settings on talla.settings;
create policy admins_read_settings on talla.settings
  for select to authenticated using (talla.is_admin());

drop policy if exists admins_change_settings on talla.settings;
create policy admins_change_settings on talla.settings
  for update to authenticated using (talla.is_admin()) with check (talla.is_admin());

-- ─── الصلاحيات: Supabase يمنح الأدوار العامّة كثيرًا افتراضًا، فنضيّقها هنا ───
revoke all on all tables in schema talla from public, anon, authenticated;

grant insert (full_name, feedback, draw_consent) on talla.responses to anon, authenticated;
-- المشرف يرى الأسماء ولا يرى نصّ الآراء: لا صلاحيّة على عمود feedback لأحد
grant select (id, created_at, full_name, draw_consent, name_key, excluded) on talla.responses to authenticated;
grant update (excluded) on talla.responses to authenticated;
grant select on talla.winners to authenticated;
grant select, update (accepting, drawing, closes_at, updated_at) on talla.settings to authenticated;

-- ─── ما تستدعيه الصفحتان (POST /rest/v1/rpc/…) ──────────────────────────────

-- للزائر: هل الاستقبال مفتوح؟
create or replace function public.talla_status() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('accepting', talla.accepting())
$$;

-- للزائر: رأيٌ جديد. يعمل بصلاحيّات الزائر نفسه، فـRLS هو من يقرّر الحفظ
create or replace function public.talla_submit(
  p_name text,
  p_feedback text,
  p_consent boolean default false,
  p_website text default ''
) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
begin
  -- الفخّ: خانةٌ مخفيّة لا يملؤها إنسان — يُجاب بالنجاح ولا يُحفظ شيء
  if coalesce(p_website, '') <> '' then
    return jsonb_build_object('ok', true);
  end if;
  if not talla.accepting() then
    raise exception 'closed';
  end if;
  if char_length(btrim(coalesce(p_name, ''))) not between 2 and 80
     or talla.name_key(p_name) = '' then
    raise exception 'invalid_name';
  end if;
  if char_length(btrim(coalesce(p_feedback, ''))) not between 3 and 2000 then
    raise exception 'invalid_feedback';
  end if;

  insert into talla.responses (full_name, feedback, draw_consent)
  values (p_name, p_feedback, coalesce(p_consent, false));

  return jsonb_build_object('ok', true);
end $$;

-- للمشرف: الإعدادات والمشاركون في السحب والفائزون — أسماءٌ وأعدادٌ فقط
create or replace function public.talla_admin_state() returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  s talla.settings;
begin
  if not talla.is_admin() then
    raise exception 'forbidden';
  end if;

  select * into s from talla.settings where id;

  return jsonb_build_object(
    'accepting', s.accepting,
    'drawing', s.drawing,
    'closes_at', s.closes_at,
    'open_now', talla.accepting(),
    'responses', (select count(*) from talla.responses),
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
               'key', p.key, 'name', p.name, 'entries', p.entries,
               'excluded', p.excluded, 'won', p.won
             ) order by p.first_at, p.key)
      from (
        select r.name_key as key,
               (array_agg(r.full_name order by r.created_at, r.id))[1] as name,
               count(*) as entries,
               bool_or(r.excluded) as excluded,
               min(r.created_at) as first_at,
               exists (select 1 from talla.winners w where w.name_key = r.name_key) as won
        from talla.responses r
        where r.draw_consent
        group by r.name_key
      ) p
    ), '[]'::jsonb),
    'winners', coalesce((
      select jsonb_agg(jsonb_build_object(
               'round', w.round, 'name', w.full_name, 'key', w.name_key, 'at', w.drawn_at
             ) order by w.round)
      from talla.winners w
    ), '[]'::jsonb)
  );
end $$;

-- السحب: الدالّة الوحيدة التي تكتب في talla.winners — ولا يكتب فيه غيرها.
-- في talla لا في public: لا تُستدعى من الواجهة إلّا عبر talla_admin_draw أدناه
create or replace function talla.draw() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  pick record;
  next_round integer;
begin
  if not talla.is_admin() then
    raise exception 'forbidden';
  end if;
  if not coalesce((select s.drawing from talla.settings s where s.id), false) then
    raise exception 'draw_closed';
  end if;

  -- سحبٌ واحدٌ في كلّ مرّة، ولو ضُغط الزرّ مرّتين أو من جهازين
  perform pg_advisory_xact_lock(hashtext('talla.draw'));

  select c.key, c.name, c.response_id into pick
  from (
    select r.name_key as key,
           (array_agg(r.full_name order by r.created_at, r.id))[1] as name,
           (array_agg(r.id order by r.created_at, r.id))[1] as response_id
    from talla.responses r
    where r.draw_consent
    group by r.name_key
    having not bool_or(r.excluded)
       and not exists (select 1 from talla.winners w where w.name_key = r.name_key)
  ) c
  -- gen_random_uuid() من مولّد PostgreSQL القويّ (pg_strong_random): لكلّ اسمٍ الحظّ نفسه
  order by gen_random_uuid()
  limit 1;

  if not found then
    raise exception 'no_candidates';
  end if;

  select coalesce(max(w.round), 0) + 1 into next_round from talla.winners w;

  insert into talla.winners (round, name_key, full_name, response_id, drawn_by)
  values (next_round, pick.key, pick.name, pick.response_id, auth.uid());

  return jsonb_build_object('round', next_round, 'name', pick.name, 'key', pick.key);
end $$;

-- للمشرف: السحب
create or replace function public.talla_admin_draw() returns jsonb
language sql volatile security invoker set search_path = '' as $$
  select talla.draw()
$$;

-- للمشرف: مفتاحا الاستقبال والسحب وموعد الإغلاق. null = بلا تغيير
create or replace function public.talla_admin_set(
  p_accepting boolean default null,
  p_drawing boolean default null,
  p_closes_at timestamptz default null,
  p_clear_closes boolean default false
) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
begin
  if not talla.is_admin() then
    raise exception 'forbidden';
  end if;

  update talla.settings s
     set accepting  = coalesce(p_accepting, s.accepting),
         drawing    = coalesce(p_drawing, s.drawing),
         closes_at  = case when p_clear_closes then null else coalesce(p_closes_at, s.closes_at) end,
         updated_at = now()
   where s.id;

  return public.talla_admin_state();
end $$;

-- للمشرف: استبعادُ اسمٍ من السحب أو إرجاعه
create or replace function public.talla_admin_exclude(p_key text, p_excluded boolean default true)
returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
begin
  if not talla.is_admin() then
    raise exception 'forbidden';
  end if;

  update talla.responses r set excluded = coalesce(p_excluded, true) where r.name_key = p_key;

  return public.talla_admin_state();
end $$;

-- ─── من يستدعي ماذا ─────────────────────────────────────────────────────────
revoke all on function talla.name_key(text), talla.is_admin(), talla.accepting(), talla.before_response(), talla.draw()
  from public, anon, authenticated;
grant execute on function talla.name_key(text), talla.accepting() to anon, authenticated;
grant execute on function talla.is_admin(), talla.draw() to authenticated;

revoke all on function
  public.talla_status(),
  public.talla_submit(text, text, boolean, text),
  public.talla_admin_state(),
  public.talla_admin_draw(),
  public.talla_admin_set(boolean, boolean, timestamptz, boolean),
  public.talla_admin_exclude(text, boolean)
  from public, anon, authenticated;

grant execute on function
  public.talla_status(),
  public.talla_submit(text, text, boolean, text)
  to anon, authenticated;

grant execute on function
  public.talla_admin_state(),
  public.talla_admin_draw(),
  public.talla_admin_set(boolean, boolean, timestamptz, boolean),
  public.talla_admin_exclude(text, boolean)
  to authenticated;

commit;
