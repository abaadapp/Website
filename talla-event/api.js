/*
 * فعالية طلة — الاتّصال بمشروع Supabase المستقلّ.
 *
 * fetch وحده، بلا مكتبة: الدوالّ في /rest/v1/rpc/… والدخول في /auth/v1/…
 * لا سرّ هنا ولا في أيّ ملفّ: المفتاح العامّ من config.js، ورمزُ دخول المشرف
 * يُعطى بعد كتابة كلمة مروره ولا يُحفظ إلّا في sessionStorage حتى يُغلق التبويب.
 */
(function () {
  'use strict';

  var C = window.TALLA_CONFIG || {};
  var base = String(C.url || '').replace(/\/+$/, '');
  var key = String(C.key || '');
  var ready = C.enabled === true && /^https?:\/\/[^\s/]+/.test(base) && key.length >= 20;

  // ما تقوله القاعدة بـ raise exception — ويُترجم في الصفحتين
  var KNOWN = ['closed', 'invalid_name', 'invalid_feedback', 'busy', 'forbidden', 'draw_closed', 'no_candidates'];

  function Problem(code, status) {
    this.code = code;
    this.status = status || 0;
  }

  function codeOf(status, data) {
    var d = data || {};
    if (KNOWN.indexOf(d.message) !== -1) return d.message;
    if (status === 429 || /rate_limit|too_many/i.test(String(d.error_code || ''))) return 'rate_limited';
    if (d.error_code === 'invalid_credentials' || d.error === 'invalid_grant') return 'invalid_credentials';
    if (d.error_code === 'email_not_confirmed') return 'email_not_confirmed';
    if (status === 401 || /^PGRST30/.test(String(d.code || ''))) return 'expired';
    if (status === 403 || d.code === '42501') return 'forbidden';
    return 'error';
  }

  function call(path, body, token) {
    var headers = { 'Content-Type': 'application/json', apikey: key };
    // المفتاح القديم (anon) رمزٌ موقَّع يُرسل في Authorization أيضًا؛ والجديد في apikey وحده
    var bearer = token || (/^eyJ/.test(key) ? key : '');
    if (bearer) headers.Authorization = 'Bearer ' + bearer;

    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : 0;

    return fetch(base + path, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body || {}),
      signal: ctl ? ctl.signal : undefined,
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (res.ok) return data;
        throw new Problem(codeOf(res.status, data), res.status);
      });
    }, function () {
      throw new Problem('network');
    }).then(function (data) {
      clearTimeout(timer);
      return data;
    }, function (err) {
      clearTimeout(timer);
      throw err instanceof Problem ? err : new Problem('error');
    });
  }

  window.Talla = {
    ready: ready,
    Problem: Problem,
    rpc: function (fn, args, token) { return call('/rest/v1/rpc/' + fn, args, token); },
    auth: function (grant, body) { return call('/auth/v1/token?grant_type=' + grant, body); },
    // هذه الجلسة وحدها — لا يُخرج المشرفَ من جهازه الآخر
    logout: function (token) { return call('/auth/v1/logout?scope=local', {}, token).then(null, function () {}); },
  };
})();
