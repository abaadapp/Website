/*
 * فعالية طلة — نموذج الرأي على /talla-feedback/
 *
 * يسأل القاعدة أوّلًا إن كان الاستقبال مفتوحًا، ثمّ يرسل الاسم والرأي والموافقة
 * إلى talla_submit. والتحقّقُ هنا للتيسير وحده: القاعدة تتحقّق من كلّ شيءٍ ثانيةً.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-talla-feedback]');
  if (!root || !window.Talla) return;

  function $(s) { return root.querySelector(s); }

  var views = {
    loading: $('[data-loading]'),
    form: $('[data-form]'),
    done: $('[data-done]'),
    closed: $('[data-closed]'),
    unavailable: $('[data-unavailable]'),
  };
  var form = views.form;
  var nameEl = $('#t-name');
  var feedbackEl = $('#t-feedback');
  var consentEl = $('#t-consent');
  var trapEl = $('#t-website');
  var submitEl = $('[data-submit]');
  var messageEl = $('[data-message]');
  var countEl = $('[data-count]');

  var NAME_MAX = 80;
  var FEEDBACK_MAX = 2000;
  var MSG = {
    invalid_name: 'اكتب اسمك الكامل — حرفان على الأقلّ.',
    invalid_feedback: 'اكتب رأيك أو اقتراحك — ثلاثة أحرف على الأقلّ.',
    busy: 'الضغطُ كبيرٌ الآن — حاول بعد دقيقة.',
    network: 'تعذّر الإرسال. تحقّق من اتصالك وحاول مرّة أخرى.',
    error: 'تعذّر الإرسال. حاول مرّة أخرى.',
  };

  var sending = false;

  function show(name) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
  }

  function fieldError(el, text) {
    var err = root.querySelector('[data-error-for="' + el.id + '"]');
    err.textContent = text || '';
    err.hidden = !text;
    if (text) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    return !text;
  }

  function say(text) {
    messageEl.textContent = text || '';
    messageEl.hidden = !text;
  }

  function count() {
    countEl.textContent = feedbackEl.value.length + ' / ' + FEEDBACK_MAX;
  }

  function valid() {
    var name = nameEl.value.trim();
    var feedback = feedbackEl.value.trim();
    var nameOk = fieldError(nameEl, name.length >= 2 && name.length <= NAME_MAX && /[\p{L}\p{N}]/u.test(name) ? '' : MSG.invalid_name);
    var feedbackOk = fieldError(feedbackEl, feedback.length >= 3 && feedback.length <= FEEDBACK_MAX ? '' : MSG.invalid_feedback);
    if (!nameOk) nameEl.focus();
    else if (!feedbackOk) feedbackEl.focus();
    return nameOk && feedbackOk;
  }

  function idle() {
    sending = false;
    submitEl.disabled = false;
    submitEl.textContent = 'إرسال';
  }

  feedbackEl.addEventListener('input', count);
  nameEl.addEventListener('input', function () { if (nameEl.hasAttribute('aria-invalid')) fieldError(nameEl, ''); });
  feedbackEl.addEventListener('input', function () { if (feedbackEl.hasAttribute('aria-invalid')) fieldError(feedbackEl, ''); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    say('');
    if (!valid()) return;

    sending = true;
    submitEl.disabled = true;
    submitEl.textContent = 'جارٍ الإرسال…';
    var consent = consentEl.checked;

    window.Talla.rpc('talla_submit', {
      p_name: nameEl.value.trim(),
      p_feedback: feedbackEl.value.trim(),
      p_consent: consent,
      p_website: trapEl.value,
    }).then(function () {
      idle();
      form.reset();
      count();
      $('[data-done-draw]').hidden = !consent;
      show('done');
      views.done.focus();
    }, function (err) {
      idle();
      var code = err && err.code;
      if (code === 'closed') return show('closed');
      if (code === 'invalid_name') return fieldError(nameEl, MSG.invalid_name);
      if (code === 'invalid_feedback') return fieldError(feedbackEl, MSG.invalid_feedback);
      say(MSG[code] || MSG.error);
    });
  });

  $('[data-again]').addEventListener('click', function () {
    show('form');
    nameEl.focus();
  });

  if (!window.Talla.ready) {
    show('unavailable');
    return;
  }

  // إن تعذّر السؤال يظهر النموذج، والإرسالُ يقول ما حدث
  window.Talla.rpc('talla_status').then(function (s) {
    show(s && s.accepting === false ? 'closed' : 'form');
  }, function () {
    show('form');
  });
})();
