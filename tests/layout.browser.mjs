/*
 * تخطيط الصفحة في متصفّحٍ حقيقيّ — WebKit (محرّك Safari) وChromium.
 * jsdom لا يحسب التخطيط، فهذه تُفتح بأحجام الشاشات فعلًا:
 *
 *   - لا فيضَ أفقيًّا بأيّ حجم، بالعربية والإنجليزية.
 *   - مبالغُ «الملخّص المالي» داخل بطاقاتها: عمودٌ واحد تحت 520px، وعمودان من 520px فما فوق.
 *   - القائمة على الجوّال تبلغ آخرَ أزرارها (الدخول، اللغة، ابدأ الآن) ولو قصُرت الشاشة.
 *   - خاناتُ النموذج 16px على الجوّال كي لا يكبّر Safari على iOS الصفحةَ عند التركيز.
 *   - سطح المكتب كما كان.
 *
 * npx playwright install webkit chromium   (مرّةً واحدة)
 * npm run test:layout
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon' };

const PHONES = [[320, 568], [375, 667], [390, 664], [430, 739]];
const LANDSCAPE = [[667, 375], [750, 342], [844, 390]];
const TABLETS = [[810, 1080], [1080, 810]];
const DESKTOP = [[1440, 900]];

let server, base;
const engines = {};

before(async () => {
  server = createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(ROOT + path);
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
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

/** الصفحة بحجم شاشة — الجوّال والجهاز اللوحيّ باللمس؛ وتسقط إن ظهر خطأٌ في الـ console */
async function open(engine, [width, height]) {
  const touch = width < 960 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {};
  const ctx = await engines[engine].newContext({ viewport: { width, height }, ...touch });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return {
    page,
    english: () => page.evaluate(() => document.querySelector('[data-action="lang"]').click()),
    close: async () => {
      await ctx.close();
      assert.deepEqual(errors, [], `${engine} ${width}×${height}: أخطاء في الـ console`);
    },
  };
}

/** عناصرُ تتجاوز عرض الشاشة ولا يقصّها أبٌ لها — بالعربية يقع الفيضُ يمينًا فلا يظهر في scrollWidth */
const overflow = (page) => page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const clipped = (el) => {
    for (let p = el.parentElement; p && !p.hasAttribute('data-site'); p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') return true;
    }
    return false;
  };
  const out = [];
  for (const el of document.querySelectorAll('[data-site] *')) {
    const b = el.getBoundingClientRect();
    if (b.width && (b.right > vw + 1 || b.left < -1) && !clipped(el)) {
      out.push(`${el.tagName} «${el.textContent.trim().slice(0, 24)}» ${Math.round(b.left)}→${Math.round(b.right)}`);
    }
  }
  return { scroll: document.documentElement.scrollWidth - vw, out };
});

/** أبعدُ ما يخرج به نصٌّ عن بطاقته في «الملخّص المالي»، وعددُ أعمدة الشبكة */
const finance = (page) => page.evaluate(() => {
  const grid = document.querySelector('[data-fin-img] > [role="img"]');
  let worst = 0;
  for (const el of grid.querySelectorAll('*')) {
    if (el.children.length || !el.textContent.trim()) continue;
    let card = el.parentElement;
    while (card !== grid && !(parseFloat(getComputedStyle(card).borderTopWidth) > 0)) card = card.parentElement;
    const range = document.createRange();
    range.selectNodeContents(el);
    const t = range.getBoundingClientRect(), c = card.getBoundingClientRect();
    worst = Math.max(worst, c.left - t.left, t.right - c.right);
  }
  return { spill: Math.round(worst), columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length };
});

for (const engine of ['webkit', 'chromium']) {
  test(`${engine}: nothing spills sideways, and the finance amounts stay inside their cards, in both languages`, async () => {
    for (const size of [...PHONES, ...LANDSCAPE, ...TABLETS, ...DESKTOP]) {
      const s = await open(engine, size);
      for (const lang of ['ar', 'en']) {
        if (lang === 'en') await s.english();
        const at = `${size.join('×')} ${lang}`;
        const o = await overflow(s.page);
        assert.equal(o.scroll, 0, `${at}: الصفحة تتمرّر أفقيًّا`);
        assert.deepEqual(o.out, [], `${at}: عناصر خارج الشاشة`);
        const f = await finance(s.page);
        assert.ok(f.spill <= 1, `${at}: مبلغٌ يخرج من بطاقته بـ ${f.spill}px`);
        assert.equal(f.columns, size[0] < 520 ? 1 : 2, `${at}: أعمدة «الملخّص المالي»`);
      }
      await s.close();
    }
  });

  test(`${engine}: the mobile menu reaches log in, the language switch and get started on short screens`, async () => {
    for (const size of [...PHONES, ...LANDSCAPE, [810, 1080]]) {
      const s = await open(engine, size);
      const at = size.join('×');
      await s.page.locator('[data-action="menu"]').click();
      for (const sel of ['[data-menu] a[href$="/login"]', '[data-menu] [data-action="lang"]', '[data-menu] a[href$="/register"]']) {
        const r = await s.page.locator(sel).evaluate((el) => {
          el.scrollIntoView({ block: 'nearest' });
          const b = el.getBoundingClientRect();
          const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
          return { onScreen: b.top >= 0 && b.bottom <= innerHeight + 0.5, hit: !!hit && el.contains(hit) };
        });
        assert.ok(r.onScreen && r.hit, `${at}: ${sel} لا يُبلَغ في القائمة`);
      }
      const menu = await s.page.evaluate(() => {
        const m = document.querySelector('[data-menu]');
        return { bottom: m.getBoundingClientRect().bottom, ih: innerHeight, scrolls: m.scrollHeight > m.clientHeight };
      });
      assert.ok(menu.bottom <= menu.ih + 0.5, `${at}: القائمة أطول من الشاشة`);
      // حين تتّسع لها الشاشة تبقى كما كانت، بلا تمرير
      if (size[1] >= 664) assert.equal(menu.scrolls, false, `${at}: القائمة تتمرّر وهي تتّسع`);
      // والزرّ يُضغط فعلًا من داخلها
      await s.page.locator('[data-menu] [data-action="lang"]').click({ timeout: 3000 });
      assert.equal(await s.page.evaluate(() => document.documentElement.dir), 'ltr', `${at}: زرّ اللغة لم يُضغط`);
      await s.close();
    }
  });

  test(`${engine}: contact fields are 16px on phones so iOS does not zoom, and focusing them moves nothing`, async () => {
    for (const size of [[320, 568], [390, 664], [750, 342], [810, 1080]]) {
      const s = await open(engine, size);
      const at = size.join('×');
      const form = s.page.locator('[data-contact-form]');
      await form.scrollIntoViewIfNeeded();
      const sizes = await form.locator('input, select, textarea').evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      assert.equal(sizes.length, 6);
      sizes.forEach((px) => assert.ok(px >= 16, `${at}: خانةٌ بخط ${px}px`));
      const box = () => form.evaluate((f) => { const b = f.getBoundingClientRect(); return [b.width, b.height, window.visualViewport.scale]; });
      const before = await box();
      for (const name of ['name', 'company', 'phone', 'email', 'type', 'message']) {
        await form.locator(`[name="${name}"]`).focus();
        assert.deepEqual(await box(), before, `${at}: التركيز على ${name} غيّر النموذج`);
      }
      await s.close();
    }
  });

  test(`${engine}: tablet landscape and desktop keep the original design`, async () => {
    for (const size of [[1080, 810], ...DESKTOP]) {
      const s = await open(engine, size);
      const at = size.join('×');
      const d = await s.page.evaluate(() => ({
        burger: getComputedStyle(document.querySelector('[data-action="menu"]')).display,
        menuMax: getComputedStyle(document.querySelector('[data-menu]')).maxHeight,
        fields: [...new Set([...document.querySelectorAll('[data-contact-form] input, [data-contact-form] select, [data-contact-form] textarea')].map((e) => getComputedStyle(e).fontSize))],
      }));
      assert.equal(d.burger, 'none', at);
      assert.equal(d.menuMax, 'none', `${at}: حدُّ القائمة وصل إلى سطح المكتب`);
      assert.deepEqual(d.fields, ['15.5px'], `${at}: خطّ النموذج تغيّر على سطح المكتب`);
      assert.equal((await finance(s.page)).columns, 2, `${at}: «الملخّص المالي» صار عمودًا واحدًا`);
      await s.close();
    }
  });
}
