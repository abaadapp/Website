#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# اختبارُ قاعدة فعالية طلة على PostgreSQL مؤقّتٍ محلّيّ.
#
# يُنشئ قاعدةً في مجلّدٍ مؤقّت على منفذٍ خاصّ، ويحذفها في النهاية. لا يتّصل
# بأيّ مشروع Supabase ولا بأيّ قاعدةٍ أخرى. يحتاج initdb وpg_ctl وpsql
# (PostgreSQL 15 أو أحدث).
#
#   sh deploy/talla/tests/run.sh
# ═══════════════════════════════════════════════════════════════════════════
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
SQL="$HERE/.."
TMP=$(mktemp -d)
PORT=${TALLA_PG_PORT:-55432}

cleanup() {
  pg_ctl -D "$TMP/data" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT INT TERM

initdb -D "$TMP/data" -E UTF8 --locale=en_US.UTF-8 -A trust -U postgres >/dev/null
pg_ctl -D "$TMP/data" -o "-p $PORT -k $TMP -c listen_addresses=''" -l "$TMP/log" -w start >/dev/null

# «… does not exist, skipping» من drop if exists ضجيجٌ لا خبر
export PGOPTIONS='-c client_min_messages=warning'
psql_() { psql -X -q -v ON_ERROR_STOP=1 -h "$TMP" -p "$PORT" -U postgres -d postgres "$@"; }
value() { psql_ -At -c "$1"; }
expect() {
  got=$(value "$2")
  if [ "$got" != "$3" ]; then
    echo "FAIL: $1 — got: $got — expected: $3" >&2
    exit 1
  fi
  echo "ok   $1"
}

echo "▸ Supabase مصغَّرًا، ثمّ supabase.sql"
psql_ -f "$HERE/supabase-stub.sql"
psql_ -f "$SQL/supabase.sql"

echo "▸ من يصل إلى ماذا"
psql_ -o /dev/null -f "$HERE/security.sql" >"$TMP/security" 2>&1 || { cat "$TMP/security" >&2; exit 1; }
sed -n 's/^psql:[^ ]* NOTICE:  //p' "$TMP/security"

echo "▸ سحبان في الوقت نفسه من جلستين"
psql_ -c "truncate talla.winners, talla.responses" \
      -c "insert into talla.responses (full_name, feedback, draw_consent) select 'مشارك ' || i, 'رأي', true from generate_series(1, 30) i"
psql_ -o /dev/null -f "$HERE/race.sql" >"$TMP/race1" 2>&1 & p1=$!
psql_ -o /dev/null -f "$HERE/race.sql" >"$TMP/race2" 2>&1 & p2=$!
wait "$p1" || { cat "$TMP/race1" >&2; exit 1; }
wait "$p2" || { cat "$TMP/race2" >&2; exit 1; }
expect 'race: thirty draws, thirty different winners' \
  "select count(*) || '/' || count(distinct name_key) || '/' || min(round) || '-' || max(round) from talla.winners" '30/30/1-30'

echo "▸ تشغيلُ supabase.sql مرّةً ثانية"
psql_ -f "$SQL/supabase.sql"
expect 'rerun: the winners are kept' "select count(*) from talla.winners" '30'
expect 'rerun: one settings row' "select count(*) from talla.settings" '1'
expect 'rerun: six policies' "select count(*) from pg_policies where schemaname = 'talla'" '6'
expect 'rerun: the visitor still cannot read' \
  "select has_table_privilege('anon', 'talla.responses', 'select')::text" 'false'
expect 'rerun: the visitor still cannot draw' \
  "select has_function_privilege('anon', 'public.talla_admin_draw()', 'execute')::text" 'false'
expect 'rerun: no security definer function sits in public' \
  "select count(*) from pg_proc where pronamespace = 'public'::regnamespace and proname like 'talla\_%' and prosecdef" '0'
expect 'rerun: every talla function pins its search_path' \
  "select count(*) from pg_proc where (pronamespace = 'talla'::regnamespace or proname like 'talla\_%') and not coalesce(array_to_string(proconfig, ',') like '%search_path=%', false)" '0'

echo "▸ teardown.sql"
psql_ -f "$SQL/teardown.sql"
expect 'teardown: the schema is gone' "select count(*) from pg_namespace where nspname = 'talla'" '0'
expect 'teardown: the functions are gone' "select count(*) from pg_proc where proname like 'talla\_%'" '0'
psql_ -f "$SQL/supabase.sql"
expect 'teardown: supabase.sql installs again on a clean project' "select public.talla_status() ->> 'accepting'" 'true'

echo "كلّ اختبارات القاعدة نجحت"
