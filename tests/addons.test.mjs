/*
 * إضافاتُ كلّ باقة والاستفسارُ عنها بواتساب أبعاد — ما يجب ألّا ينكسر.
 *
 *   - العرضُ الجديد خلف مقبض (`ADDON_OFFER`)، مُشعَلٌ منذ أُطلقت السياسةُ في النظام؛ ومطفأً تعود البطاقاتُ كما كانت.
 *   - التجربةُ تقول تحت زرّها إنّها الأساسيّةُ بلا نقطة البيع ولا إضافة.
 *   - مُشعَلًا: أسعارُ الباقات ظاهرة، ولا سعرَ لإضافة؛ وإضافاتُ كلّ باقةٍ كما في كتالوج
 *     النظام — والمشمولُ «مشمولة في الباقة» لا إضافةً تُشترى.
 *   - رابطُ كلّ إضافة wa.me إلى الرقم الرسميّ برسالةٍ مرمَّزة باسم الباقة والإضافة.
 *   - التحديدُ: رسالةٌ واحدة بلا تكرار وبإضافات الباقة وحدها؛ وبلا تحديد لا رابط.
 *   - ولا يُرسل الاستفسارُ شيئًا إلى النظام: لا طلب ولا فاتورة ولا تسجيل.
 *
 * والتخطيطُ في متصفّحٍ حقيقيّ: addons.browser.mjs.   npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { prerender } from '../tools/prerender.mjs';
import { arabicLeft } from './arabic.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

const HTML = read('index.html');
const EN = read('en/index.html');
const JS = read('assets/site.js');
const ON_LINE = 'var ADDON_OFFER = true;';
const OFF_LINE = 'var ADDON_OFFER = false;';
/** site.js كما يُنشر — والعرضُ الجديد مُشعَل منذ أُطلقت السياسةُ في النظام */
export const ON = JS;
/** والعرضُ مطفأ — إن أُطفئ الإطلاقُ يومًا */
const OFF = JS.replace(ON_LINE, OFF_LINE);

const WA = 'https://wa.me/96871141624?text=';
const OFFICIAL = '+968 71141624';

const BASIC = ['pos', 'website', 'marketing', 'loyalty', 'whatsapp'];
const PRO = ['extra_branch', 'gift_orders', 'whatsapp_own_number', 'api_integrations'];
const ENTERPRISE = ['gift_orders', 'whatsapp_own_number', 'api_integrations'];

/** الصفحة كما يفتحها المتصفّح — بالعرض الجديد إن طُلب */
async function page(t, lang = 'ar', js = ON) {
  const html = prerender(HTML, js, lang);
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: lang === 'en' ? 'https://abaadapp.om/en/' : 'https://abaadapp.om/', virtualConsole: new VirtualConsole() });
  if (dom.window.document.readyState !== 'complete') await new Promise((r) => dom.window.addEventListener('load', r));
  t.after(() => dom.window.close());
  // ما يُرسله الاستفسار إلى أيّ خادم — يجب أن يبقى فارغًا
  dom.window.__sent = [];
  dom.window.fetch = (...a) => { dom.window.__sent.push(['fetch', String(a[0])]); return new Promise(() => {}); };
  const open = dom.window.XMLHttpRequest.prototype.open;
  dom.window.XMLHttpRequest.prototype.open = function (m, u) { dom.window.__sent.push(['xhr', String(u)]); return open.apply(this, arguments); };
  dom.window.eval(js);
  return dom.window;
}
const box = (w, plan) => w.document.querySelector(`[data-addon-plan="${plan}"]`);
const codes = (w, plan) => [...box(w, plan).querySelectorAll('[data-addon]')].map((c) => c.getAttribute('data-addon'));
const textOf = (href) => {
  assert.ok(href.startsWith(WA), `ليس رابط واتساب أبعاد: ${href.slice(0, 60)}`);
  return decodeURIComponent(href.slice(WA.length));
};
const askOf = (w, plan, code) => box(w, plan).querySelector(`[data-addon="${code}"] [data-ask]`).getAttribute('href');
function tick(w, plan, code, on = true) {
  const input = box(w, plan).querySelector(`[data-pick="${plan}:${code}"]`);
  input.checked = on;
  input.dispatchEvent(new w.Event('change', { bubbles: true }));
}

/* ═══════════ المقبضُ مُشعَل — كما أُطلقت السياسةُ في النظام ═══════════ */

test('the new offer ships switched on, as the platform launch is on — and the published pages already show it', async (t) => {
  assert.ok(JS.includes(ON_LINE), 'العرضُ مطفأ والإطلاقُ مفتوح في النظام — الموقعُ يعد بنقطة بيعٍ لا تفتحها الأساسيّة');
  for (const [lang, html] of [['ar', HTML], ['en', EN]]) {
    const doc = new JSDOM(html).window.document;
    const section = doc.querySelector('[data-addons-section]');
    assert.ok(section && !section.hasAttribute('hidden'), `${lang}: قسمُ الإضافات مخفيٌّ في الصفحة المنشورة`);
    assert.ok(doc.querySelectorAll('[data-addon]').length > 0, `${lang}: لا بطاقات إضافاتٍ في الصفحة المنشورة`);
    const basic = doc.querySelector('[data-plan="0"]');
    assert.doesNotMatch(basic.querySelector('[data-inc]').textContent, /نقطة البيع|point of sale|POS/i, `${lang}: نقطةُ البيع مشمولةٌ في الأساسيّة المنشورة`);
    assert.ok(basic.querySelector('a[href="#addons"]'), `${lang}: الأساسيّةُ لا تدلّ على إضافاتها`);
  }
});

test('the trial says what it is under its button in both languages — and the old card stays whole if the offer is switched off again', async (t) => {
  for (const [lang, html, note] of [['ar', HTML, 'تجربة 14 يومًا على الباقة الأساسية، دون نقطة البيع POS والإضافات.'], ['en', EN, 'A 14-day trial of the Basic plan, without the POS or add-ons.']]) {
    const doc = new JSDOM(html).window.document;
    assert.equal(doc.querySelector('[data-plan="0"] [data-trial-note]')?.textContent, note, `${lang}: التجربةُ لا تقول ما تشمله`);
    // والمدفوعةُ لا تجربةَ لها — تُفتح عبر فريق أبعاد
    assert.equal(doc.querySelectorAll('[data-trial-note]').length, 1, `${lang}: ملاحظةُ التجربة على باقةٍ مدفوعة`);
  }

  // ومطفأً — إن أُطفئ الإطلاقُ يومًا — تعود البطاقةُ كما كانت، والتجربةُ ما زالت بلا نقطة البيع
  const w = await page(t, 'ar', OFF);
  const basic = w.document.querySelector('[data-plan="0"]');
  assert.ok(w.document.querySelector('[data-addons-section]').hidden);
  assert.ok(basic.querySelector('[data-inc]').textContent.includes('نقطة البيع والمبيعات والطلبات'));
  assert.ok(basic.querySelector('[data-exc]').textContent.includes('الموقع الإلكتروني'));
  assert.ok(!basic.textContent.includes('إضافات اختيارية'));
  assert.ok(basic.querySelector('[data-trial-note]').textContent.includes('دون نقطة البيع POS'));
});

/* ═══════════ المقبضُ مُشعَل: ما يراه الزائر ═══════════ */

test('the three plans keep their prices, and no add-on shows a price in either language', async (t) => {
  for (const lang of ['ar', 'en']) {
    const w = await page(t, lang);
    const prices = [...w.document.querySelectorAll('[data-plan] [data-price]')].map((p) => p.textContent);
    assert.deepEqual(prices, ['9.900', '29.900', '69.900'], `${lang}: أسعارُ الباقات الشهريّة`);
    w.document.querySelector('[data-billing="y"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    assert.deepEqual([...w.document.querySelectorAll('[data-plan] [data-price]')].map((p) => p.textContent), ['99', '299', '699'], `${lang}: السنويّة`);

    const section = w.document.querySelector('[data-addons-section]');
    assert.ok(!section.hidden, `${lang}: القسمُ مخفيّ والعرضُ مُشعَل`);
    const text = section.textContent;
    assert.doesNotMatch(text, /ر\.ع|OMR|\d+\.\d{3}/, `${lang}: سعرٌ في قسم الإضافات`);
    assert.doesNotMatch(text, /مجان|free/i, `${lang}: «مجانًا» لإضافةٍ اختياريّة`);
  }
  // ولا سعرُ إضافةٍ من الكتالوج في الموقع كلِّه — ٩٫٩٠٠ و٩٩ هما سعرُ الأساسيّة نفسُها
  for (const price of ['12.900', '129.000', '2.900', '29.000', '3.900', '39.000', '4.900', '49.000', '99.000']) {
    assert.ok(!JS.includes(`'${price}'`), `سعرُ إضافةٍ في site.js: ${price}`);
  }
});

test('each plan offers the add-ons the platform catalog sells it — and names what it already includes instead of selling it', async (t) => {
  for (const lang of ['ar', 'en']) {
    const w = await page(t, lang);
    assert.deepEqual(codes(w, 'basic'), BASIC, `${lang}: الأساسية`);
    assert.deepEqual(codes(w, 'professional'), PRO, `${lang}: الاحترافية`);
    assert.deepEqual(codes(w, 'enterprise'), ENTERPRISE, `${lang}: المؤسسات`);
    // المؤسساتُ لا تشتري فرعًا إضافيًّا — ليس من إضافاتها في الكتالوج
    assert.equal(box(w, 'enterprise').querySelector('[data-addon="extra_branch"]'), null);
    // والمشمولُ لا يُباع: يُذكر «مشمولة في الباقة» بلا تحديدٍ ولا زرّ
    assert.equal(box(w, 'basic').querySelector('[data-included]'), null, `${lang}: الأساسيّة لا تشمل إضافة`);
    for (const plan of ['professional', 'enterprise']) {
      const inc = box(w, plan).querySelector('[data-included]');
      assert.ok(inc, `${lang} ${plan}: لا ذكرَ للمشمول`);
      assert.equal(inc.querySelectorAll('input, a').length, 0);
      for (const c of BASIC) assert.ok(!codes(w, plan).includes(c), `${lang} ${plan}: ${c} مشمولةٌ وتُباع`);
    }
    for (const card of w.document.querySelectorAll('[data-addon]')) {
      assert.ok(card.querySelector('svg'), 'بطاقةٌ بلا أيقونة');
      assert.ok(card.querySelector('h4').textContent.trim(), 'بطاقةٌ بلا اسم');
      assert.ok(card.querySelector('p').textContent.trim(), 'بطاقةٌ بلا وصف');
      assert.ok(card.textContent.includes(lang === 'ar' ? 'إضافة اختيارية' : 'Optional add-on'));
      assert.ok(card.querySelector('[data-ask]').textContent.includes(lang === 'ar' ? 'استفسر عبر واتساب' : 'Ask on WhatsApp'));
    }
  }
  const w = await page(t, 'ar');
  const heads = ['basic', 'professional', 'enterprise'].map((p) => box(w, p).querySelector('h3').textContent);
  assert.deepEqual(heads, ['الإضافات المتاحة للباقة الأساسية', 'الإضافات المتاحة للباقة الاحترافية', 'الإضافات المتاحة لباقة المؤسسات']);
  assert.equal(w.document.querySelector('[data-pr="addonsTitle"]').textContent, 'طوّر نظامك حسب احتياجات مشروعك');
  assert.equal(box(w, 'enterprise').querySelector('[data-addon="whatsapp_own_number"] h4').textContent, 'ربط واتساب برقم الشركة');
  assert.equal(box(w, 'professional').querySelector('[data-addon="whatsapp_own_number"] h4').textContent, 'ربط واتساب برقم المتجر');
});

test('the Basic card under the new offer leaves POS out and points to its add-ons; Professional names POS among what it adds', async (t) => {
  const w = await page(t, 'ar');
  const basic = w.document.querySelector('[data-plan="0"]');
  assert.ok(!basic.querySelector('[data-inc]').textContent.includes('نقطة البيع'), 'نقطةُ البيع مشمولةٌ في الأساسيّة الجديدة');
  assert.ok(basic.textContent.includes('نظام الكاشير ونقاط البيع POS'));
  assert.equal(basic.querySelector('a[href="#addons"]').textContent.replace(/[←→]/, '').trim(), 'استفسر عنها عبر واتساب');
  assert.deepEqual([...basic.querySelectorAll('[data-exc] li')].map((l) => l.textContent), ['التقارير المتقدمة', 'الصلاحيات المخصصة', 'التطبيقات التكاملية']);
  assert.ok(w.document.querySelector('[data-plan="1"] [data-inc]').textContent.startsWith('نظام الكاشير ونقاط البيع'));
});

test('each add-on opens the official Abaad WhatsApp with its plan and its name — the messages the owner wrote', async (t) => {
  const w = await page(t, 'ar');
  assert.equal(OFFICIAL.replace(/\D/g, ''), WA.match(/wa\.me\/(\d+)/)[1], 'رقمُ wa.me غيرُ الرقم الرسميّ');
  for (const a of w.document.querySelectorAll('[data-ask]')) {
    assert.ok(a.getAttribute('href').startsWith(WA));
    assert.equal(a.getAttribute('target'), '_blank');
    assert.match(a.getAttribute('rel'), /noopener/);
  }
  assert.equal(textOf(askOf(w, 'basic', 'pos')), [
    'السلام عليكم فريق أبعاد،', '',
    'أرغب بالاستفسار عن إحدى إضافات نظام أبعاد.', '',
    'الباقة: الأساسية (Basic)', '',
    'الإضافة المطلوبة: نظام الكاشير ونقاط البيع POS.', '',
    'أريد معرفة سعر الإضافة وطريقة الاشتراك والتفعيل.', '',
    'شكرًا لكم.',
  ].join('\n'));
  assert.equal(textOf(askOf(w, 'professional', 'extra_branch')), [
    'السلام عليكم فريق أبعاد،', '',
    'أرغب بالاستفسار عن إضافة فرع جديد.', '',
    'الباقة: الاحترافية (Professional)', '',
    'الإضافة المطلوبة: فرع إضافي.', '',
    'أريد معرفة التكلفة والشروط وطريقة التفعيل.', '',
    'شكرًا لكم.',
  ].join('\n'));
  const ent = textOf(askOf(w, 'enterprise', 'api_integrations'));
  assert.ok(ent.includes('الباقة: المؤسسات (Enterprise)'));
  assert.ok(ent.includes('الإضافة المطلوبة: التكامل مع الأنظمة الخارجية API.'));
  // وكلُّ رابطٍ برسالة باقته وإضافته — لا رسالةٌ ثابتة
  const all = [...w.document.querySelectorAll('[data-ask]')].map((a) => a.getAttribute('href'));
  assert.equal(new Set(all).size, all.length, 'رابطان برسالةٍ واحدة');
});

test('the message is encoded whole — Arabic, spaces and line breaks — and the English page asks in English', async (t) => {
  const ar = await page(t, 'ar');
  const href = askOf(ar, 'basic', 'loyalty');
  assert.doesNotMatch(href, /[\s؀-ۿ]/, 'حرفٌ عربيٌّ أو مسافةٌ أو سطرٌ غيرُ مرمَّز في الرابط');
  assert.ok(href.includes('%0A%0A'), 'الأسطرُ الفارغة ضاعت');
  assert.equal(href, WA + encodeURIComponent(textOf(href)));

  const en = await page(t, 'en');
  assert.equal(textOf(askOf(en, 'basic', 'pos')), [
    'Hello Abaad team,', '',
    "I'd like to ask about one of Abaad's add-ons.", '',
    'Plan: Basic', '',
    'Add-on: Cashier & point of sale (POS).', '',
    "I'd like to know the add-on's price and how to subscribe and activate it.", '',
    'Thank you.',
  ].join('\n'));
  assert.ok(askOf(en, 'basic', 'pos').includes('%26'), '«&» في الاسم لم يُرمَّز');
  assert.deepEqual(arabicLeft(en.document), [], 'بقي عربيٌّ في /en/');
});

test('several add-ons go in one message, once each, in catalog order — and only the plan\'s own', async (t) => {
  const w = await page(t, 'ar');
  const ask = box(w, 'basic').querySelector('[data-ask-selected]');
  tick(w, 'basic', 'loyalty');
  tick(w, 'basic', 'pos');
  tick(w, 'basic', 'website');
  tick(w, 'basic', 'pos'); // تحديدٌ ثانٍ للشيء نفسه
  assert.equal(ask.querySelector('[data-count]').textContent, '(3)');
  assert.equal(textOf(ask.getAttribute('href')), [
    'السلام عليكم فريق أبعاد،', '',
    'أرغب بالاستفسار عن الإضافات التالية:', '',
    'الباقة: الأساسية (Basic)', '',
    'الإضافات المطلوبة:',
    '- نظام الكاشير ونقاط البيع POS.',
    '- المتجر الإلكتروني وإدارة الطلبات.',
    '- برنامج الولاء والمكافآت.', '',
    'أرجو تزويدي بالأسعار والتفاصيل وطريقة التفعيل.', '',
    'شكرًا لكم.',
  ].join('\n'));
  assert.equal(box(w, 'basic').querySelector('[data-addon="pos"]').style.borderColor, 'var(--ink)');

  // إضافةٌ ليست للباقة — ولو حُدِّدت بيدٍ عابثة — لا تدخل رسالتها
  const forged = w.document.createElement('input');
  forged.type = 'checkbox';
  forged.setAttribute('data-pick', 'basic:gift_orders');
  box(w, 'basic').appendChild(forged);
  forged.checked = true;
  forged.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.ok(!textOf(ask.getAttribute('href')).includes('الهدايا'), 'إضافةٌ غيرُ مؤهّلة في رسالة الأساسيّة');

  // وإلغاءُ التحديد يُخرجها؛ والباقاتُ لا تتشارك تحديدها
  tick(w, 'basic', 'loyalty', false);
  assert.ok(!textOf(ask.getAttribute('href')).includes('الولاء'));
  assert.equal(box(w, 'professional').querySelector('[data-ask-selected]').hasAttribute('href'), false);
});

test('with nothing selected the group button opens nothing and says what it waits for; copy carries the same message', async (t) => {
  const w = await page(t, 'ar');
  const b = box(w, 'enterprise'), ask = b.querySelector('[data-ask-selected]'), copy = b.querySelector('[data-copy]');
  assert.equal(b.querySelector('[data-addon-bar]').hidden, false, 'التحديدُ مخفيٌّ والجافاسكربت يعمل');
  assert.equal(ask.hasAttribute('href'), false);
  assert.equal(ask.getAttribute('aria-disabled'), 'true');
  assert.equal(copy.disabled, true);
  const click = new w.MouseEvent('click', { bubbles: true, cancelable: true });
  ask.dispatchEvent(click);
  assert.equal(click.defaultPrevented, true);
  assert.equal(b.querySelector('[data-addon-status]').textContent, 'حدّد إضافة واحدة على الأقل، ثمّ استفسر عنها.');

  tick(w, 'enterprise', 'gift_orders');
  tick(w, 'enterprise', 'whatsapp_own_number');
  assert.equal(ask.getAttribute('aria-disabled'), 'false');
  assert.equal(copy.disabled, false);
  let copied = null;
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: (s) => { copied = s; return Promise.resolve(); } }, configurable: true });
  copy.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(copied, textOf(ask.getAttribute('href')));
  assert.ok(copied.includes('- إدارة الهدايا والطلبات المخصصة.') && copied.includes('- ربط واتساب برقم الشركة.'));
  assert.ok(b.querySelector('[data-addon-status]').textContent.includes(OFFICIAL));

  // ونسخٌ يرفضه المتصفّح: الرسالةُ مكتوبةٌ أمامه ليُنسخها بيده
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) }, configurable: true });
  copy.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 0));
  const shown = b.querySelector('[data-addon-text]');
  assert.equal(shown.hidden, false);
  assert.equal(shown.value, copied);
});

test('asking never reaches the system — no order, invoice or sign-up, only a WhatsApp link the visitor sends themselves', async (t) => {
  const w = await page(t, 'ar');
  tick(w, 'basic', 'pos');
  for (const el of w.document.querySelectorAll('[data-ask], [data-ask-selected], [data-copy]')) {
    el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  }
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(w.__sent, [], 'الاستفسارُ أرسل طلبًا إلى خادم');
  const section = w.document.querySelector('[data-addons-section]');
  for (const a of section.querySelectorAll('a[href]')) {
    assert.ok(a.getAttribute('href').startsWith('https://wa.me/96871141624?text='), `رابطٌ في القسم إلى غير واتساب أبعاد: ${a.getAttribute('href').slice(0, 50)}`);
  }
  assert.equal(section.querySelector('form'), null);
  assert.ok(!section.innerHTML.includes('app.abaadapp.om'), 'القسمُ يكلّم النظام');
});

test('no plan card sells what the platform catalog does not — website design is a service asked for, not an optional add-on', () => {
  for (const [lang, html, word] of [['ar', HTML, /خصص موقعك|تخصيص احترافي للموقع/], ['en', EN, /Customize your website|customization of your website/i]]) {
    const doc = new JSDOM(html).window.document;
    for (const card of doc.querySelectorAll('[data-plan]')) {
      assert.doesNotMatch(card.textContent, word, `${lang}: بطاقةُ باقةٍ تعرض تخصيصَ الموقع إضافةً اختياريّة — ليس في كتالوج النظام`);
    }
  }
});
