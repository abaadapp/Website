/*
 * فعالية طلة لا تمسّ موقع أبعاد — كلُّ ملفٍّ كان في المستودع قبلها باقٍ كما هو، بايتًا ببايت.
 *
 *   - البصماتُ أدناه بصماتُ git لملفّات main عند 32e4791، قبل الفعالية.
 *   - لا ملفَّ منها حُذف ولا تغيّر، والفعاليةُ في مجلّداتها وحدها.
 *
 * يُحذف هذا الملفّ مع الفعالية. وإن عُدِّل الموقع عمدًا أثناءها، فحدِّث بصمة ذلك الملفّ هنا.
 *
 * npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);

// بصمةُ git للملفّ: sha1("blob <الحجم>\0<المحتوى>")
const blob = (path) => {
  const body = readFileSync(new URL(path, root));
  return createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex');
};

const ORIGINAL = {
  '.github/workflows/test.yml': 'e19cb266dee311f66d24abe9d67b44a5e2a0fa9e',
  '.gitignore': '646ac519ef2111a8c1f9698fa8331115601809be',
  'README.md': '49deb5d621862b29b37827b0a3b354daa2428694',
  'apple-touch-icon.png': '436bdfaedfc2af89f1e7dea3e8f3651ca1fcc7fb',
  'assets/img/costs.webp': 'e6562d5527f8c68751716b28932afef729f5d3ca',
  'assets/img/customer.webp': '923bd51fc393aa90ba5f13486ccc3a02807d7e7f',
  'assets/img/dashboard.webp': 'e672034a860b6e482ddba5c7714470904f6c93bc',
  'assets/img/hero.webp': '5b085a0dad901df558535dbb2b30f2f3d1cc148e',
  'assets/img/invoices.webp': '72ffff93ef49188ec1a90acde9a5224cac2c4cb3',
  'assets/img/logo.svg': 'e7e95bf96799c376e4b7963ac67144e4dc00f7ad',
  'assets/img/og.png': '894897d76c87d0d4234e455553df7f25d26406a4',
  'assets/img/pos-checkout.webp': '39c50f8f9a6ae561dae42ed6d101f6c4d25b4b50',
  'assets/img/pos-product.webp': '882b77a0da6a923157b736345601b02e16e88d57',
  'assets/img/pos.webp': '1feb6b84d7bd3db026729249d47faf0178dc7392',
  'assets/img/solution-ecommerce.webp': '654ebae0787831890cb6d946c6f72280483203f7',
  'assets/img/solution-retail.webp': 'f65edfd50713434a7b066cf83200c35dffd8e031',
  'assets/img/solution-services.webp': '7dd964365a150c716d357a1065981b645440baa2',
  'assets/img/solution-subscriptions.webp': '22b2eb4d6f0fceb4d035cb944fe96c3f59317364',
  'assets/img/store.webp': '0e13cc3d77696659795f0909f61147460edc3a26',
  'assets/img/whatsapp-phone.webp': 'efeda2741588b64352cb55985c80778557f50aca',
  'assets/site.css': 'c85b0aa0e6767d85751548728d284ded1fc9d030',
  'assets/site.js': '13d14be8c7698aa8fc72e7796eaed77c358a1023',
  'data-deletion/index.html': '54cd4d5f77f76e4f5cfff8486813588b4bf44344',
  'deploy/nginx-abaadapp.om.conf': 'a41c0a1ae75fd8aca24b406cf3ccdbd2202dcbf0',
  'en/index.html': '47f47a0f923f55f37efeb544672a86bba90aa121',
  'favicon.ico': '0814c9df9bef38bfb0b0643c2f59bb34210fa071',
  'favicon.svg': 'af3a7183bda449db3b6ca5de30776bd789668bf2',
  'index.html': '3e7b696aa1cee3453f0b22dffc7bf6898c2f5e92',
  'package-lock.json': '341a614f628f783cb8f0cc810d1c70a0072e601b',
  'package.json': '753c7a50ded84926d2ddc6d81489c981a4e67ca7',
  'privacy/index.html': 'a325b9b9a364e7fc4ccdc866b27c68c125c5a853',
  'robots.txt': '65462bd0ac2a7ca544ef9ac07d02bace7482e4f7',
  'sitemap.xml': '2c1829d0180eafb910392e4e69362f2cade4cc8e',
  'terms/index.html': '90e13024d9bf3ef9244fe3c3bc771af69d9f1a98',
  'tests/arabic.mjs': '96d4929c5a5bae6d5931ef8d14398fdf8fd734ea',
  'tests/contact.browser.mjs': 'b1cbda30452a6a25cd5fd1e8588b29ddd9a14f8a',
  'tests/layout.browser.mjs': '6b1f0a53d473786ff24f6e133dfd91aa8ff1e57e',
  'tests/seo.test.mjs': '351a65da6aeb54a472e8d556c58ae2b22dc69297',
  'tests/site.test.mjs': 'cc43883fdbc8565f09b4d62d6bb811a3529c7084',
  'tools/prerender.mjs': 'bdaa6912f15af8e3a3b9bb42975874c47c62fc61',
  'uploads/Artboard 2.svg': 'fb176fa51986d4b6ab1f6c5abba634fd53c97961',
};

// مجلّداتُ الفعالية — ولا شيء غيرها جديد
export const EVENT_PATHS = ['talla-feedback/', 'talla-draw/', 'talla-event/', 'deploy/talla/', 'tests/talla'];

test('every file of the Abaad site before the event is still there, byte for byte', () => {
  assert.equal(Object.keys(ORIGINAL).length, 41);
  const changed = Object.entries(ORIGINAL).filter(([path, sha]) => !existsSync(new URL(path, root)) || blob(path) !== sha);
  assert.deepEqual(changed.map(([path]) => path), [], 'ملفّاتٌ من الموقع تغيّرت أو حُذفت');
});

test('no event file sits among the original ones', () => {
  for (const path of Object.keys(ORIGINAL)) {
    assert.ok(!EVENT_PATHS.some((p) => path.startsWith(p)), path);
  }
});
