/*
 * فعالية طلة — العجلة.
 *
 * رسمٌ وحركةٌ فقط: لا تختار العجلة أحدًا. الفائزُ يأتي من القاعدة (talla_admin_draw)،
 * والعجلةُ تدور حتى تقف عليه. والانحرافُ الصغير داخل خانته زينةٌ لا تغيّر النتيجة.
 *
 *   var wheel = TallaWheel(canvas, ticker)
 *   wheel.setNames([{ key, name }, …])  — الخانات بالترتيب
 *   wheel.spin()                         — يبدأ الدوران قبل أن يصل الجواب
 *   wheel.stopAt(key) → Promise          — يقف على صاحب المفتاح
 *   wheel.halt() → Promise               — يقف بلا نتيجة (عند خطأ)
 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  // المؤشّر يمين العجلة: اسمُ الفائز تحته أفقيٌّ يُقرأ كما يُكتب، من حافّة العجلة نحو مركزها
  var POINTER = 0;
  var LABELS_MAX = 40;        // فوقها تُرسم الخانات بلا أسماء، والاسمُ تحت المؤشّر في السطر أدناه
  var FILL = ['#0f0f0f', '#a8552a', '#f6ded0', '#3d3d3d', '#d9a07c', '#ffffff'];
  var INK = { '#0f0f0f': '#ffffff', '#a8552a': '#ffffff', '#f6ded0': '#0f0f0f', '#3d3d3d': '#ffffff', '#d9a07c': '#0f0f0f', '#ffffff': '#0f0f0f' };
  var FONT = '"IBM Plex Sans Arabic", system-ui, sans-serif';

  function norm(x) { return ((x % TAU) + TAU) % TAU; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  // انحرافٌ داخل الخانة للزينة وحدها — من مولّد المتصفّح القويّ إن وُجد
  function jitter() {
    if (window.crypto && window.crypto.getRandomValues) {
      var a = new Uint32Array(1);
      window.crypto.getRandomValues(a);
      return (a[0] / 4294967296 - 0.5) * 0.6;
    }
    return 0;
  }

  window.TallaWheel = function (canvas, ticker) {
    var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    var names = [];
    var angle = 0;
    var mode = 'idle'; // idle | free | landing
    var speed = 0;
    var started = 0;
    var landing = null;
    var raf = 0;
    var last = 0;
    var shown = '';
    var landed = false; // بعد الوقوف يبقى الاسم تحت المؤشّر ظاهرًا حتى تتغيّر الخانات
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var MAX_SPEED = reduce ? 0 : TAU * 1.6; // دورةٌ وثلثان في الثانية

    function frameLater(fn) {
      return window.requestAnimationFrame ? window.requestAnimationFrame(fn) : setTimeout(function () { fn(Date.now()); }, 16);
    }

    function under() {
      if (!names.length) return -1;
      return Math.floor(norm(POINTER - angle) / (TAU / names.length)) % names.length;
    }

    // السطرُ تحت العجلة يتبع المؤشّر وهي تدور فقط — وهي ساكنةٌ لا يوحي باسمٍ لم يُسحب
    function tick() {
      var i = mode === 'idle' && !landed ? -1 : under();
      var text = i < 0 ? '' : names[i].name;
      if (ticker && text !== shown) {
        ticker.textContent = text;
        shown = text;
      }
    }

    function fit(text, width) {
      if (ctx.measureText(text).width <= width) return text;
      var cut = text;
      while (cut.length > 1 && ctx.measureText(cut + '…').width > width) cut = cut.slice(0, -1);
      return cut + '…';
    }

    function draw() {
      tick();
      if (!ctx) return;
      var dpr = window.devicePixelRatio || 1;
      var css = canvas.clientWidth || 480;
      var px = Math.round(css * dpr);
      if (canvas.width !== px || canvas.height !== px) {
        canvas.width = px;
        canvas.height = px;
      }
      var r = px / 2;
      var wheelR = r * 0.94;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, px, px);
      ctx.translate(r, r);

      var n = names.length;
      if (!n) {
        ctx.beginPath();
        ctx.arc(0, 0, wheelR, 0, TAU);
        ctx.fillStyle = '#1c1c1c';
        ctx.fill();
        ctx.fillStyle = '#9a9a9b';
        ctx.font = '600 ' + Math.round(r * 0.07) + 'px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('لا أحد في السحب بعد', 0, 0);
        return;
      }

      var a = TAU / n;
      var labels = n <= LABELS_MAX;
      var size = Math.max(10 * dpr, Math.min(r * 0.075, a * r * 0.42));
      for (var i = 0; i < n; i++) {
        var from = angle + i * a;
        var color = FILL[i % FILL.length];
        // خانتان متجاورتان عند الالتفاف لا تتشابهان
        if (i === n - 1 && n > 1 && n % FILL.length === 1) color = FILL[2];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, wheelR, from, from + a);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        if (n > 1) {
          ctx.strokeStyle = 'rgba(15,15,15,.35)';
          ctx.lineWidth = Math.max(1, dpr);
          ctx.stroke();
        }
        if (labels) {
          // في النصف الأيسر يُقلب الاسم فلا يُقرأ مقلوبًا، ويبقى ملاصقًا لحافّة العجلة
          var mid = from + a / 2;
          var left = norm(mid) > Math.PI / 2 && norm(mid) < Math.PI * 1.5;
          ctx.save();
          ctx.rotate(left ? mid + Math.PI : mid);
          ctx.fillStyle = INK[color];
          ctx.font = '600 ' + Math.round(size) + 'px ' + FONT;
          ctx.direction = 'rtl';
          ctx.textAlign = left ? 'left' : 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(fit(names[i].name, wheelR * 0.66), left ? -wheelR * 0.9 : wheelR * 0.9, 0);
          ctx.restore();
        }
      }

      // الإطار والمحور
      ctx.beginPath();
      ctx.arc(0, 0, wheelR, 0, TAU);
      ctx.lineWidth = r * 0.03;
      ctx.strokeStyle = '#f6ded0';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.12, 0, TAU);
      ctx.fillStyle = '#0f0f0f';
      ctx.fill();
      ctx.lineWidth = r * 0.02;
      ctx.strokeStyle = '#f6ded0';
      ctx.stroke();

      // المؤشّر ثابتٌ يمين العجلة
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.beginPath();
      ctx.moveTo(px - r * 0.005, r - r * 0.07);
      ctx.lineTo(px - r * 0.005, r + r * 0.07);
      ctx.lineTo(px - r * 0.16, r);
      ctx.closePath();
      ctx.fillStyle = '#a8552a';
      ctx.fill();
      ctx.lineWidth = r * 0.012;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    function loop(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (mode === 'free') {
        speed = MAX_SPEED * Math.min(1, (now - started) / 500);
        angle += speed * dt;
      } else if (mode === 'landing') {
        var t = Math.min(1, (now - landing.at) / landing.ms);
        angle = landing.from + landing.by * easeOut(t);
        if (t >= 1) {
          mode = 'idle';
          speed = 0;
          landed = true;
          draw();
          var done = landing.done;
          landing = null;
          done();
          return;
        }
      }
      draw();
      if (mode !== 'idle') raf = frameLater(loop);
    }

    function run() {
      if (!raf) {
        last = 0;
        raf = frameLater(loop);
      }
    }

    function land(target) {
      return new Promise(function (resolve) {
        if (!ctx || !window.requestAnimationFrame) {
          angle = target;
          mode = 'idle';
          landed = true;
          draw();
          resolve();
          return;
        }
        var by = target - angle;
        // سرعةُ البداية = سرعة الدوران الحرّ، فلا قفزة: ease-out مكعّب يبدأ بثلاثة أضعاف متوسّطه
        var ms = reduce ? 1200 : Math.max(3500, Math.min(9000, (3 * by / Math.max(speed, TAU)) * 1000));
        landing = { from: angle, by: by, at: performance.now(), ms: ms, done: resolve };
        mode = 'landing';
        run();
      });
    }

    var wheel = {
      setNames: function (list) {
        names = (list || []).map(function (p) { return { key: String(p.key), name: String(p.name) }; });
        if (mode === 'idle') {
          landed = false;
          draw();
        }
      },
      has: function (key) {
        return names.some(function (p) { return p.key === key; });
      },
      spin: function () {
        landed = false;
        if (mode !== 'idle' || reduce || !ctx) return;
        mode = 'free';
        started = performance.now();
        run();
      },
      stopAt: function (key) {
        var i = -1;
        for (var k = 0; k < names.length; k++) if (names[k].key === key) i = k;
        if (i < 0) return Promise.reject(new Error('not on the wheel'));
        var a = TAU / names.length;
        var aim = norm(POINTER - (i + 0.5 + jitter()) * a - angle);
        var turns = reduce ? 1 : 3;
        return land(angle + aim + TAU * turns);
      },
      halt: function () {
        if (mode === 'idle') return Promise.resolve();
        return land(angle + (reduce ? 0 : TAU));
      },
      redraw: draw,
      // للاختبار: من تحت المؤشّر الآن
      current: function () {
        var i = under();
        return i < 0 ? null : names[i].key;
      },
    };

    if (document.fonts && document.fonts.load) {
      document.fonts.load('600 20px "IBM Plex Sans Arabic"').then(draw, draw);
    }
    window.addEventListener('resize', function () { if (mode === 'idle') draw(); });
    draw();
    return wheel;
  };
})();
