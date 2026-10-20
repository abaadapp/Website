/*
 * بصمةُ ملفّات talla-event في الصفحتين (?v=…).
 *
 * nginx يخزّن ملفّات js وcss عند الزائر ثلاثين يومًا، والبصمةُ هي ما يجعل المتصفّح
 * يأخذ الجديد. شغّله بعد أيّ تعديلٍ في talla-event:
 *
 *   node deploy/talla/stamp.mjs
 *
 * واختبارُ tests/talla.test.mjs يسقط إن نُسي.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const root = new URL('../../', import.meta.url);

export const PAGES = ['talla-feedback/index.html', 'talla-draw/index.html'];

export const stamp = (path) => createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex').slice(0, 10);

export const stamped = (html) =>
  html.replace(/\/talla-event\/([\w.-]+)\?v=[0-9a-f]*/g, (_, file) => `/talla-event/${file}?v=${stamp('talla-event/' + file)}`);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const page of PAGES) {
    const url = new URL(page, root);
    const before = readFileSync(url, 'utf8');
    const after = stamped(before);
    if (after !== before) writeFileSync(url, after);
    console.log((after === before ? '  ' : '✓ ') + page);
  }
}
