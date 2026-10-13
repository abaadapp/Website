/*
 * ما بقي عربيًّا في صفحةٍ يُفترض أنها إنجليزية — نصًّا ظاهرًا أو في alt / aria-label / title / placeholder.
 *
 * يُستثنى ما هو رسمٌ لواجهةٍ عربية داخل صور المنتج، لا نصٌّ من الصفحة:
 *   - الملخّص المالي:            role="img"
 *   - محادثة واتساب وفقاعتها:     lang="ar" dir="rtl"
 * ورابطُ «العربية» نفسُه.
 */
export const DRAWINGS = '[role="img"], [lang="ar"][dir="rtl"]';
const SKIP = `${DRAWINGS}, [data-lang-link], script, style`;
const ARABIC = /[؀-ۿ]/;
const ATTRS = ['alt', 'aria-label', 'title', 'placeholder'];

export function arabicLeft(doc) {
  const site = doc.querySelector('[data-site]');
  const out = [];
  const walk = doc.createTreeWalker(site, 4);
  for (let n; (n = walk.nextNode());) {
    const text = n.textContent.trim();
    if (text && ARABIC.test(text) && !n.parentElement.closest(SKIP)) out.push(text.slice(0, 40));
  }
  for (const el of site.querySelectorAll('*')) {
    if (el.closest(SKIP)) continue;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v && ARABIC.test(v)) out.push(`${el.tagName.toLowerCase()} ${a}="${v.slice(0, 40)}"`);
    }
  }
  return out;
}
