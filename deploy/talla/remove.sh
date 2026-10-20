#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# إزالةُ فعالية طلة من المستودع — في فرعٍ جديد، ولا شيءَ غير ملفّاتها.
#
#   git switch main && git pull --ff-only
#   sh deploy/talla/remove.sh
#   git push -u origin remove/talla-event      ← ثمّ طلبٌ ودمجٌ بموافقة صاحب الموقع
#
# لا يدفع ولا يدمج ولا ينشر بنفسه.
# ═══════════════════════════════════════════════════════════════════════════
set -eu

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "في الشجرة تعديلاتٌ لم تُودَع — أودعها أو أزلها أوّلًا." >&2
  exit 1
fi

EVENT="talla-feedback talla-draw talla-event deploy/talla tests/talla.test.mjs tests/talla.browser.mjs tests/talla-untouched.test.mjs"

git switch -c remove/talla-event
# shellcheck disable=SC2086
git rm -r -q $EVENT

# ما يبقى في الفرع هو الموقع وحده: لا ملفّ للفعالية، ولا ملفّ غيرُها حُذف
left=$(git ls-files | grep -E '^(talla-|deploy/talla/|tests/talla)' || true)
if [ -n "$left" ]; then
  echo "بقيت ملفّاتٌ للفعالية:" >&2
  echo "$left" >&2
  exit 1
fi
other=$(git diff --cached --name-only | grep -vE '^(talla-feedback/|talla-draw/|talla-event/|deploy/talla/|tests/talla)' || true)
if [ -n "$other" ]; then
  echo "الحذف مسّ ملفّاتٍ ليست للفعالية:" >&2
  echo "$other" >&2
  exit 1
fi

git commit -q -m "Remove the temporary Talla event pages

The feedback form at /talla-feedback/, the prize wheel at /talla-draw/,
their files in talla-event/, the Supabase setup in deploy/talla/ and
their tests. No other file of the site changes."

echo "✓ remove/talla-event جاهز: $(git diff --name-only HEAD~1 HEAD | wc -l | tr -d ' ') ملفًّا حُذف، ولا ملفَّ غيرُها تغيّر."
echo "  التالي: git push -u origin remove/talla-event ← طلبٌ ← دمج ← git pull على الخادم"
