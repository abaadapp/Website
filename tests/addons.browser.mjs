/*
 * قسمُ الإضافات في متصفّحٍ حقيقيّ — WebKit (محرّك Safari) وChromium، والعرضُ الجديد مُشعَل.
 *
 *   - لا فيضَ أفقيًّا على الجوّال واللوحيّ وسطح المكتب، بالعربية (RTL) والإنجليزية (LTR).
 *   - بطاقاتُ الإضافات عمودٌ واحد على الجوّال، وخانةُ التحديد تُلمس بإصبع (40px).
 *   - رابطُ الإضافة وزرُّ المحدّدة يفتحان wa.me إلى رقم أبعاد برسالتهما، في نافذةٍ جديدة —
 *     واتساب الهاتف على الجوّال وWhatsApp Web على الكمبيوتر — ولا يُرسلان شيئًا.
 *   - ولا خطأ في الـ console.
 *
 * والصفحةُ تُخدَم برسم site.js والمقبضُ مُشعَل (`ON` في addons.test.mjs) — لا تُكتب ملفّاتُها.
 *
 * npm run test:layout
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from 'playwright';
import { prerender, withStamps } from '../tools/prerender.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon' };
const read = (p) => readFileSync(new URL(p, new URL('../', import.meta.url)), 'utf8');

const JS = read('assets/site.js');
const ON = JS.replace('var ADDON_OFFER = false;', 'var ADDON_OFFER = true;');
const HTML = read('index.html');
const PAGES = { '/': prerender(HTML, ON, 'ar'), '/en/': withStamps(prerender(HTML, ON, 'en')) };
const WA = 'https://wa.me/96871141624?text=';

const SIZES = [[320, 568], [375, 667], [430, 739], [810, 1080], [1440, 900]];

let server, base;
const engines = {};

before(async () => {
  server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (PAGES[path]) return res.writeHead(200, { 'content-type': TYPES['.html'] }).end(PAGES[path]);
    if (path === '/assets/site.js') return res.writeHead(200, { 'content-type': TYPES['.js'] }).end(ON);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(ROOT + path);
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    try {
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(await readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/`;
  [engines.webkit, engines.chromium] = await Promise.all([webkit.launch(), chromium.launch()]);
});

after(async () => {
  await Promise.all(Object.values(engines).map((b) => b.close()));
  server.close();
});

async function open(engine, [width, height], path = '') {
  const touch = width < 960 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {};
  const ctx = await engines[engine].newContext({ viewport: { width, height }, ...touch });
  // واتساب لا يُطلب فعلًا: يُجاب هنا، ويُقرأ عنوانُ النافذة التي فُتحت
  await ctx.route('https://wa.me/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>wa</title>' }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base)) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(base + path, { waitUntil: 'load' });
  // بخطّ الموقع نفسه كما في layout.browser.mjs — خطٌّ احتياطيٌّ أعرض يُفيض أقسامًا غيرَ هذه
  await page.evaluate(() => document.fonts.ready);
  return {
    page, ctx,
    close: async () => {
      await ctx.close();
      assert.deepEqual(errors, [], `${engine} ${width}×${height} /${path}: أخطاء`);
    },
  };
}

/** ما يخرج عن عرض الشاشة في قسم الإضافات — وتمريرُ الصفحة أفقيًّا */
const overflow = (page) => page.evaluate(() => {
  const vw = document.documentElement.clientWidth, out = [];
  for (const el of document.querySelectorAll('[data-addons-section] *')) {
    const b = el.getBoundingClientRect();
    if (b.width && (b.right > vw + 1 || b.left < -1)) out.push(`${el.tagName} «${el.textContent.trim().slice(0, 24)}» ${Math.round(b.left)}→${Math.round(b.right)}`);
  }
  return { scroll: document.documentElement.scrollWidth - vw, out };
});

for (const engine of ['webkit', 'chromium']) {
  test(`${engine}: the add-ons fit every screen in both directions, one column on phones, with finger-sized checkboxes`, async () => {
    for (const size of SIZES) {
      for (const lang of ['ar', 'en']) {
        const s = await open(engine, size, lang === 'en' ? 'en/' : '');
        const at = `${size.join('×')} ${lang}`;
        const view = await s.page.evaluate(() => {
          const sec = document.querySelector('[data-addons-section]');
          const grid = sec.querySelector('[data-addon-plan="basic"] ul');
          const box = sec.querySelector('[data-pick]').parentElement.getBoundingClientRect();
          return {
            dir: getComputedStyle(sec).direction, shown: !sec.hidden && sec.getBoundingClientRect().height > 0,
            columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
            target: [Math.round(box.width), Math.round(box.height)],
            bar: !sec.querySelector('[data-addon-bar]').hidden,
          };
        });
        assert.equal(view.dir, lang === 'ar' ? 'rtl' : 'ltr', at);
        assert.ok(view.shown && view.bar, `${at}: القسمُ أو زرُّ المحدّدة غيرُ ظاهر`);
        if (size[0] < 520) assert.equal(view.columns, 1, `${at}: أكثر من عمودٍ على الجوّال`);
        assert.ok(view.target[0] >= 40 && view.target[1] >= 40, `${at}: خانةُ التحديد ${view.target.join('×')}`);
        const o = await overflow(s.page);
        assert.equal(o.scroll, 0, `${at}: الصفحة تتمرّر أفقيًّا`);
        assert.deepEqual(o.out, [], `${at}: عناصر خارج الشاشة`);
        await s.close();
      }
    }
  });

  test(`${engine}: a card and the selected-add-ons button open WhatsApp to Abaad with their message, on a phone and a desktop`, async () => {
    for (const size of [[390, 664], [1440, 900]]) {
      const s = await open(engine, size);
      const card = s.page.locator('[data-addon-plan="professional"] [data-addon="extra_branch"] [data-ask]');
      await card.scrollIntoViewIfNeeded();
      const [one] = await Promise.all([s.ctx.waitForEvent('page'), card.click()]);
      await one.waitForLoadState();
      assert.ok(one.url().startsWith(WA), `${size}: ${one.url().slice(0, 60)}`);
      const text = decodeURIComponent(one.url().slice(WA.length));
      assert.ok(text.includes('الباقة: الاحترافية (Professional)') && text.includes('الإضافة المطلوبة: فرع إضافي.'), text);
      await one.close();

      const basic = s.page.locator('[data-addon-plan="basic"]');
      await basic.locator('[data-pick="basic:pos"]').check();
      await basic.locator('[data-pick="basic:whatsapp"]').check();
      const [many] = await Promise.all([s.ctx.waitForEvent('page'), basic.locator('[data-ask-selected]').click()]);
      await many.waitForLoadState();
      const msg = decodeURIComponent(many.url().slice(WA.length));
      assert.ok(many.url().startsWith(WA));
      assert.ok(msg.includes('- نظام الكاشير ونقاط البيع POS.\n- إشعارات واتساب.'), msg);
      await many.close();
      await s.close();
    }
  });
}
