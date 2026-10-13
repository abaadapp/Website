/*
 * يرسم النسخة العربية من assets/site.js داخل index.html — لمن لا يشغّل JavaScript
 * ولمحرّكات البحث — ويحدّث بصمة site.css وsite.js في روابطهما كي لا يبقى زائرٌ
 * على نسخةٍ قديمة (nginx يخزّنهما 30 يومًا).
 *
 * شغّله بعد كل تعديل في النصوص أو الأنماط:  npm run prerender
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const stamp = (p) => createHash('sha256').update(read(p)).digest('hex').slice(0, 10);

/** index.html بعد رسم site.js فيه — دون تشغيل شيءٍ من الصفحة */
export function prerender(html, js) {
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  dom.window.__ABAAD_PRERENDER__ = {};
  dom.window.eval(js);
  dom.window.__ABAAD_PRERENDER__.render(dom.window.document);
  // ما بعد </html> يُلحقه المحلّلُ بالجسم؛ يُوحَّد كي تعطي الإعادةُ الملفَّ نفسَه
  const out = dom.serialize().replace(/\s*<\/body>\s*<\/html>\s*$/, '\n</body>\n</html>\n');
  dom.window.close();
  return out;
}

export function withStamps(html) {
  return html
    .replace(/\/assets\/site\.css\?v=[^"]*/, '/assets/site.css?v=' + stamp('assets/site.css'))
    .replace(/\/assets\/site\.js\?v=[^"]*/, '/assets/site.js?v=' + stamp('assets/site.js'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = withStamps(prerender(read('index.html'), read('assets/site.js')));
  writeFileSync(new URL('index.html', root), out);
  console.log('index.html ✓');
}
