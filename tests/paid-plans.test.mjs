/*
 * الاشتراكُ المدفوع عبر فريق أبعاد — والتجربةُ المجّانيّة بالتسجيل الذاتيّ.
 *
 *   - زرُّ الأساسيّة «ابدأ تجربتك المجانية» إلى التسجيل على app.abaadapp.om (تجربةُ الأساسيّة
 *     ١٤ يومًا، بلا اختيار باقةٍ ولا دفع — abaad.Saas `Signup`).
 *   - زرّا الاحترافيّة والمؤسسات واتسابُ أبعاد برسالةٍ باسم الباقة ومدّتها المختارة الآن،
 *     وتتبدّل المدّةُ بزرّ الشهريّ والنصف سنويّ والسنويّ.
 *   - «تفعيلُ الإضافات» في البطاقة واتسابٌ بأسمائها، والمخصّصةُ واتسابٌ كذلك.
 *   - والأسعارُ الثلاثيّة باقيةٌ كما هي.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const HTML = read('index.html');
const EN = read('en/index.html');
const JS = read('assets/site.js');
const WA = 'https://wa.me/96871141624?text=';
const REGISTER = 'https://app.abaadapp.om/register';

async function page(t, lang = 'ar') {
  const dom = new JSDOM(lang === 'en' ? EN : HTML, { runScripts: 'outside-only', url: lang === 'en' ? 'https://abaadapp.om/en/' : 'https://abaadapp.om/', virtualConsole: new VirtualConsole() });
  if (dom.window.document.readyState !== 'complete') await new Promise((r) => dom.window.addEventListener('load', r));
  t.after(() => dom.window.close());
  dom.window.eval(JS);
  return dom.window;
}
const cta = (d, i) => d.querySelector(`[data-plan="${i}"] [data-plan-cta]`);
const textOf = (href) => {
  assert.ok(href.startsWith(WA), href.slice(0, 50));
  return decodeURIComponent(href.slice(WA.length));
};

test('Basic starts the free trial through sign-up; the paid plans open Abaad on WhatsApp with their plan and cycle — without JavaScript too', () => {
  for (const [lang, html, labels] of [['ar', HTML, ['ابدأ تجربتك المجانية', 'اشترك عبر واتساب']], ['en', EN, ['Start your free trial', 'Subscribe on WhatsApp']]]) {
    const d = new JSDOM(html).window.document;
    assert.equal(cta(d, 0).getAttribute('href'), REGISTER, lang);
    assert.equal(cta(d, 0).textContent, labels[0]);
    for (const i of [1, 2]) {
      assert.equal(cta(d, i).textContent, labels[1]);
      assert.equal(cta(d, i).getAttribute('target'), '_blank');
    }
  }
  const d = new JSDOM(HTML).window.document;
  assert.equal(textOf(cta(d, 1).getAttribute('href')), [
    'السلام عليكم فريق أبعاد،', '',
    'أرغب بالاشتراك في إحدى باقات نظام أبعاد.', '',
    'الباقة: الاحترافية (Professional)', '',
    'المدة: شهري', '',
    'أريد معرفة طريقة الاشتراك والدفع والتفعيل.', '',
    'شكرًا لكم.',
  ].join('\n'));
  assert.ok(textOf(cta(d, 2).getAttribute('href')).includes('الباقة: المؤسسات (Enterprise)'));
});

test('the message follows the chosen billing — monthly, semi-annual and yearly — and the three prices stay', async (t) => {
  const w = await page(t);
  const d = w.document;
  const click = (sel) => d.querySelector(sel).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const prices = () => [...d.querySelectorAll('[data-plan] [data-price]')].map((p) => p.textContent);

  assert.deepEqual(prices(), ['9.900', '29.900', '69.900']);
  click('[data-billing="h"]');
  assert.deepEqual(prices(), ['59.400', '179.400', '419.400']);
  assert.ok(textOf(cta(d, 1).getAttribute('href')).includes('المدة: نصف سنوي'));
  click('[data-billing="y"]');
  assert.deepEqual(prices(), ['99', '299', '699']);
  assert.ok(textOf(cta(d, 2).getAttribute('href')).includes('المدة: سنوي'));
  assert.equal(cta(d, 0).getAttribute('href'), REGISTER, 'التجربةُ لا تتبع المدّة');

  const en = await page(t, 'en');
  en.document.querySelector('[data-billing="h"]').dispatchEvent(new en.MouseEvent('click', { bubbles: true }));
  const msg = textOf(cta(en.document, 1).getAttribute('href'));
  assert.ok(msg.includes('Plan: Professional') && msg.includes('Billing: Semi-annual'), msg);
});

test('activating a plan card\'s optional add-ons asks Abaad on WhatsApp by their names', () => {
  const d = new JSDOM(HTML).window.document;
  const links = [...d.querySelectorAll('[data-plan] [data-add-cta]')];
  assert.equal(links.length, 2, 'الاحترافيّة والمؤسسات');
  const msg = textOf(links[0].getAttribute('href'));
  assert.ok(msg.includes('الباقة: الاحترافية (Professional)'));
  assert.ok(msg.includes('- استخدم رقم واتساب متجرك.'), msg);
  assert.equal(d.querySelector('[data-plan] a[href="#contact"]'), null, 'بطاقةٌ ما زالت تُرسل التفعيلَ إلى نموذج التواصل');
});
