/*
 * فعالية طلة — صفحة السحب على /talla-draw/
 *
 * لا يظهر هنا شيءٌ قبل دخول المشرف بحسابه في Supabase Auth. الأسماءُ والإعدادات تأتي
 * من talla_admin_state، والقاعدةُ ترفض من ليس في talla.admins (RLS).
 * والسحبُ نفسه في talla_admin_draw على الخادم: الصفحة تدير العجلة حتى تقف على الاسم
 * الذي اختارته القاعدة وسجّلته، ولا تختار أحدًا.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-talla-draw]');
  if (!root || !window.Talla || !window.TallaWheel) return;
  var T = window.Talla;

  // لا تُعرض داخل إطارٍ من موقعٍ آخر
  if (window.top !== window.self) {
    root.hidden = true;
    return;
  }

  function $(s) { return root.querySelector(s); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var views = {
    loading: $('[data-loading]'),
    login: $('[data-login]'),
    unavailable: $('[data-unavailable]'),
    board: $('[data-board]'),
  };
  function show(name) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
  }

  var MSG = {
    invalid_credentials: 'البريد أو كلمة المرور غير صحيحة.',
    rate_limited: 'محاولاتٌ كثيرة — انتظر قليلًا ثمّ حاول.',
    email_not_confirmed: 'الحساب لم يُؤكَّد — أنشئه في Supabase مع «Auto Confirm User».',
    forbidden: 'هذا الحساب ليس مشرفًا على الفعالية.',
    expired: 'انتهت الجلسة — ادخل مرّة أخرى.',
    network: 'تعذّر الاتصال. تحقّق من الشبكة وحاول مرّة أخرى.',
    error: 'حدث خطأ. حاول مرّة أخرى.',
    draw_closed: 'السحب متوقّف — شغّله من «التحكّم».',
    no_candidates: 'لا أحد متبقٍّ في السحب.',
    empty: 'لا أحد في السحب بعد.',
    missing: 'اكتب البريد وكلمة المرور.',
    no_time: 'اختر وقت الإغلاق أوّلًا.',
    ended: 'انتهت الفعالية: الاستقبال مغلق والسحب متوقّف.',
  };

  // ─── الجلسة: في sessionStorage وحده، فتنتهي بإغلاق التبويب ──────────────────
  var KEY = 'talla.session';
  var session = null;
  var refreshing = null;

  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      return s && s.access_token && s.refresh_token ? s : null;
    } catch (e) {
      return null;
    }
  }
  function keep(s) {
    session = s;
    try {
      if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
      else sessionStorage.removeItem(KEY);
    } catch (e) { /* التخزين محجوب: تبقى الجلسة في الذاكرة */ }
  }
  function fromAuth(d) {
    if (!d || !d.access_token || !d.refresh_token) throw new T.Problem('error');
    return {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: Number(d.expires_at) || Math.floor(Date.now() / 1000) + (Number(d.expires_in) || 3600),
    };
  }

  function token() {
    if (!session) return Promise.reject(new T.Problem('expired'));
    if (session.expires_at - Date.now() / 1000 > 60) return Promise.resolve(session.access_token);
    // تجديدٌ واحد مهما تزامن الطلبان
    if (!refreshing) {
      refreshing = T.auth('refresh_token', { refresh_token: session.refresh_token }).then(function (d) {
        refreshing = null;
        keep(fromAuth(d));
        return session.access_token;
      }, function () {
        refreshing = null;
        keep(null);
        throw new T.Problem('expired');
      });
    }
    return refreshing;
  }

  function admin(fn, args) {
    return token().then(function (t) {
      return T.rpc(fn, args, t);
    }).then(null, function (err) {
      if (err && (err.code === 'expired' || err.code === 'forbidden')) out(err.code);
      throw err;
    });
  }

  // ─── الدخول والخروج ───────────────────────────────────────────────────────
  var loginForm = $('[data-login-form]');
  var emailEl = $('#t-email');
  var passEl = $('#t-password');
  var loginBtn = $('[data-login-submit]');
  var loginMsg = $('[data-login-message]');

  function loginMessage(text) {
    loginMsg.textContent = text || '';
    loginMsg.hidden = !text;
  }

  function out(code) {
    stopPolling();
    var s = session;
    keep(null);
    if (s) T.logout(s.access_token);
    closeOverlays();
    loginMessage(MSG[code] || '');
    show('login');
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (loginBtn.disabled) return;
    var email = emailEl.value.trim();
    var password = passEl.value;
    if (!email || !password) return loginMessage(MSG.missing);
    loginBtn.disabled = true;
    loginMessage('');
    T.auth('password', { email: email, password: password }).then(function (d) {
      keep(fromAuth(d));
      passEl.value = '';
      return enter();
    }).then(null, function (err) {
      loginMessage(MSG[err && err.code] || MSG.error);
    }).then(function () {
      loginBtn.disabled = false;
    });
  });

  $('[data-logout]').addEventListener('click', function () { out(''); });

  // ─── اللوحة ─────────────────────────────────────────────────────────────────
  var wheel = window.TallaWheel($('[data-wheel]'), $('[data-ticker]'));
  var spinBtn = $('[data-spin]');
  var boardMsg = $('[data-board-message]');
  var liveEl = $('[data-live]');
  var acceptingEl = $('[data-accepting]');
  var drawingEl = $('[data-drawing]');
  var openNote = $('[data-open-note]');
  var closesEl = $('[data-closes]');
  var filterEl = $('[data-filter]');
  var winnerBox = $('[data-winner]');
  var confirmBox = $('[data-confirm]');

  var state = null;
  var spinning = false;

  function boardMessage(text) {
    boardMsg.textContent = text || '';
    boardMsg.hidden = !text;
  }

  function pool(s) {
    return ((s && s.participants) || []).filter(function (p) { return !p.excluded && !p.won; });
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function localInput(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function clock(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '' : pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function render(s) {
    if (!s || typeof s !== 'object') return;
    state = s;
    var eligible = pool(s);
    var winners = s.winners || [];

    $('[data-stat-participants]').textContent = eligible.length;
    $('[data-stat-responses]').textContent = Number(s.responses) || 0;
    $('[data-stat-winners]').textContent = winners.length;

    acceptingEl.checked = !!s.accepting;
    drawingEl.checked = !!s.drawing;
    var note = !s.accepting ? 'الاستقبال مغلق — لا تُقبل آراءٌ جديدة.'
      : !s.open_now ? 'أُغلق الاستقبال تلقائيًّا بانتهاء موعده.'
      : s.closes_at ? 'يُغلق الاستقبال تلقائيًّا ' + clock(s.closes_at) + ' في ' + localInput(s.closes_at).slice(0, 10) + '.'
      : '';
    openNote.textContent = note;
    openNote.hidden = !note;
    if (document.activeElement !== closesEl) closesEl.value = s.closes_at ? localInput(s.closes_at) : '';

    var list = $('[data-winners]');
    list.textContent = '';
    winners.forEach(function (w) {
      var li = el('li', 't-winner-row');
      li.appendChild(el('span', 't-round', String(w.round)));
      li.appendChild(el('b', 't-winner-row-name', w.name));
      li.appendChild(el('time', 't-time', clock(w.at)));
      list.appendChild(li);
    });
    $('[data-winners-empty]').hidden = winners.length > 0;

    people();
    if (!spinning && winnerBox.hidden) wheel.setNames(eligible);
  }

  function people() {
    var all = (state && state.participants) || [];
    var q = filterEl.value.trim().toLowerCase();
    var list = $('[data-participants]');
    list.textContent = '';
    all.filter(function (p) { return !q || String(p.name).toLowerCase().indexOf(q) !== -1; }).forEach(function (p) {
      var li = el('li', 't-person' + (p.won ? ' is-won' : p.excluded ? ' is-out' : ''));
      li.appendChild(el('span', 't-person-name', p.name));
      if (p.entries > 1) li.appendChild(el('span', 't-badge', '×' + p.entries));
      if (p.won) {
        li.appendChild(el('span', 't-tag', 'فاز'));
      } else {
        var b = el('button', 't-mini', p.excluded ? 'إرجاع' : 'استبعاد');
        b.type = 'button';
        b.addEventListener('click', function () {
          b.disabled = true;
          admin('talla_admin_exclude', { p_key: p.key, p_excluded: !p.excluded }).then(render, function (e) {
            b.disabled = false;
            boardMessage(MSG[e && e.code] || MSG.error);
          });
        });
        li.appendChild(b);
      }
      list.appendChild(li);
    });
    $('[data-participants-empty]').hidden = all.length > 0;
  }
  filterEl.addEventListener('input', people);

  // ─── التحديث كلَّ خمس ثوانٍ ─────────────────────────────────────────────────
  var timer = 0;
  function startPolling() {
    stopPolling();
    timer = setInterval(poll, 5000);
  }
  function stopPolling() {
    if (timer) clearInterval(timer);
    timer = 0;
  }
  function live(ok) {
    liveEl.classList.toggle('is-off', !ok);
    liveEl.textContent = ok ? 'مباشر' : 'انقطع الاتصال…';
  }
  function poll() {
    if (spinning || !winnerBox.hidden || document.hidden || !session) return;
    admin('talla_admin_state').then(function (s) {
      live(true);
      render(s);
    }, function () {
      live(false);
    });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });

  function enter() {
    return admin('talla_admin_state').then(function (s) {
      render(s);
      live(true);
      show('board');
      startPolling();
    });
  }

  // ─── التحكّم ────────────────────────────────────────────────────────────────
  function change(args, input) {
    if (input) input.disabled = true;
    return admin('talla_admin_set', args).then(function (s) {
      render(s);
      return true;
    }, function (e) {
      boardMessage(MSG[e && e.code] || MSG.error);
      if (state) render(state);
      return false;
    }).then(function (ok) {
      if (input) input.disabled = false;
      return ok;
    });
  }

  acceptingEl.addEventListener('change', function () { change({ p_accepting: acceptingEl.checked }, acceptingEl); });
  drawingEl.addEventListener('change', function () { change({ p_drawing: drawingEl.checked }, drawingEl); });

  $('[data-closes-save]').addEventListener('click', function () {
    var d = closesEl.value ? new Date(closesEl.value) : null;
    if (!d || isNaN(d.getTime())) return boardMessage(MSG.no_time);
    boardMessage('');
    change({ p_closes_at: d.toISOString() });
  });
  $('[data-closes-clear]').addEventListener('click', function () {
    boardMessage('');
    change({ p_clear_closes: true });
  });

  function closeOverlays() {
    confirmBox.hidden = true;
    winnerBox.hidden = true;
    stopConfetti();
  }

  $('[data-end]').addEventListener('click', function () {
    confirmBox.hidden = false;
    $('[data-confirm-no]').focus();
  });
  $('[data-confirm-no]').addEventListener('click', function () { confirmBox.hidden = true; });
  $('[data-confirm-yes]').addEventListener('click', function () {
    confirmBox.hidden = true;
    change({ p_accepting: false, p_drawing: false }).then(function (ok) {
      if (ok) boardMessage(MSG.ended);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!confirmBox.hidden) confirmBox.hidden = true;
    else if (!winnerBox.hidden) closeWinner();
  });

  // ─── السحب ─────────────────────────────────────────────────────────────────
  spinBtn.addEventListener('click', function () {
    if (spinning || !state) return;
    boardMessage('');
    if (!state.drawing) return boardMessage(MSG.draw_closed);
    if (!pool(state).length) return boardMessage(MSG.empty);

    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = 'تدور…';
    wheel.spin();

    admin('talla_admin_draw').then(function (w) {
      // الفائزُ من القاعدة. وإن سجّل اسمه بعد آخر تحديثٍ دخل العجلة قبل أن تقف
      if (!wheel.has(w.key)) wheel.setNames(pool(state).concat([{ key: w.key, name: w.name }]));
      return wheel.stopAt(w.key).then(function () { celebrate(w); });
    }).then(null, function (e) {
      return wheel.halt().then(function () {
        var code = e && e.code;
        if (code !== 'expired' && code !== 'forbidden') boardMessage(MSG[code] || MSG.error);
        if (code === 'no_candidates' || code === 'draw_closed') poll();
      });
    }).then(function () {
      spinning = false;
      spinBtn.disabled = false;
      spinBtn.textContent = 'ابدأ السحب';
    });
  });

  function celebrate(w) {
    $('[data-winner-round]').textContent = 'الفائز — السحب رقم ' + w.round;
    $('[data-winner-name]').textContent = w.name;
    winnerBox.hidden = false;
    $('[data-winner-close]').focus();
    confetti();
  }
  function closeWinner() {
    winnerBox.hidden = true;
    stopConfetti();
    spinBtn.focus();
    // العجلةُ تُرسم من جديد بلا الفائز
    admin('talla_admin_state').then(render, function () { if (state) render(state); });
  }
  $('[data-winner-close]').addEventListener('click', closeWinner);

  // ─── قصاصاتُ الفرح — زينةٌ تُطفأ لمن طلب حركةً أقلّ ─────────────────────────
  var confettiCanvas = $('[data-confetti]');
  var confettiRaf = 0;
  function confetti() {
    var ctx = confettiCanvas.getContext ? confettiCanvas.getContext('2d') : null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ctx || reduce || !window.requestAnimationFrame) return;
    var w = confettiCanvas.width = window.innerWidth;
    var h = confettiCanvas.height = window.innerHeight;
    var colors = ['#f6ded0', '#a8552a', '#ffffff', '#d9a07c', '#1f8a4c'];
    var bits = [];
    for (var i = 0; i < 140; i++) {
      bits.push({
        x: w / 2 + (i % 2 ? 1 : -1) * (i * 3 % (w / 2)),
        y: -20 - (i * 7 % h) / 3,
        vx: ((i * 37) % 13 - 6) * 0.6,
        vy: 2 + (i * 11) % 5,
        s: 6 + (i * 5) % 7,
        c: colors[i % colors.length],
        r: i,
      });
    }
    var start = performance.now();
    function step(now) {
      ctx.clearRect(0, 0, w, h);
      bits.forEach(function (b) {
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.05;
        b.r += 0.1;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
        ctx.restore();
      });
      if (now - start < 4000) confettiRaf = window.requestAnimationFrame(step);
      else ctx.clearRect(0, 0, w, h);
    }
    stopConfetti();
    confettiRaf = window.requestAnimationFrame(step);
  }
  function stopConfetti() {
    if (confettiRaf && window.cancelAnimationFrame) window.cancelAnimationFrame(confettiRaf);
    confettiRaf = 0;
    var ctx = confettiCanvas.getContext ? confettiCanvas.getContext('2d') : null;
    if (ctx) ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  // ─── ملء الشاشة لشاشة الفعالية ──────────────────────────────────────────────
  var docEl = document.documentElement;
  var enterFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
  if (enterFs) {
    var fsBtn = $('[data-fullscreen]');
    fsBtn.hidden = false;
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        enterFs.call(docEl);
      }
    });
  }

  // ─── البداية ───────────────────────────────────────────────────────────────
  if (!T.ready) {
    show('unavailable');
    return;
  }
  session = load();
  if (!session) {
    show('login');
    return;
  }
  enter().then(null, function (e) {
    if (views.login.hidden) {
      show('login');
      loginMessage(MSG[e && e.code] || MSG.network);
    }
  });
})();
