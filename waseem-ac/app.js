/* Waseem AC: the temperature that drops, the page that cools, the job ticket, the belts, the 24-hour dial. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, G = !!(window.gsap && window.ScrollTrigger) && !reduced;
  if (!G) document.documentElement.classList.add('reduced');
  var WA = 'https://wa.me/971503576145?text=';

  /* ---------- the job ticket ---------- */
  (function () {
    var st = { machine: 'Split AC', problem: 'Not cooling', when: 'Right now' };
    $('#tkNo').textContent = 'No. ' + String(1000 + Math.floor(Math.random() * 9000));
    function render(k) {
      $('#tkMachine').textContent = st.machine; $('#tkProblem').textContent = st.problem; $('#tkWhen').textContent = st.when;
      var t = 'Hi Waseem AC. Job ticket:\nMachine: ' + st.machine + '\nProblem: ' + st.problem + '\nWhen: ' + st.when + '\nCan someone come and have a look?';
      $('#tkSend').href = WA + encodeURIComponent(t);
      if (G && k) { var el = $('#tk' + k.charAt(0).toUpperCase() + k.slice(1)); gsap.fromTo(el, { backgroundColor: '#8FE6FF' }, { backgroundColor: 'rgba(143,230,255,0)', duration: .9 }); gsap.fromTo('#ticket', { y: -6 }, { y: 0, duration: .4, ease: 'back.out(3)' }); }
    }
    $$('.opts').forEach(function (g) { var k = g.dataset.k; $$('.opts[data-k="' + k + '"] .opt').forEach(function (b) { b.setAttribute('aria-pressed', b.classList.contains('is-on') ? 'true' : 'false'); b.addEventListener('click', function () {
      $$('.opts[data-k="' + k + '"] .opt').forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); st[k] = b.textContent; render(k); }); }); });
    render();
  })();

  /* ---------- the dial: 24 segments, lit for the hours of the chosen day; the hand shows the time in Ajman ---------- */
  (function () {
    var D = { Mon: [0, 24], Tue: [0, 24], Wed: [0, 24], Thu: [0, 24], Fri: [0, 24], Sat: [0, 24], Sun: [10, 17] };
    var p = {}; try { new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); } catch (e) { p = { weekday: 'Mon', hour: '12', minute: '00' }; }
    var h = (+p.hour % 24) + (+p.minute) / 60, today = p.weekday;
    $('#dialNow').textContent = (('0' + (+p.hour % 24)).slice(-2)) + ':' + (('0' + p.minute).slice(-2));
    $('#hand').style.transform = 'rotate(' + (h / 24 * 360) + 'deg)';
    function show(day) {
      var r = D[day]; $$('#dial .seg').forEach(function (s, i) { var on = i >= r[0] && i < r[1]; if (G) setTimeout(function () { s.classList.toggle('is-on', on); }, i * 18); else s.classList.toggle('is-on', on); });
      $$('#days .day').forEach(function (b) { b.classList.toggle('is-on', b.dataset.d === day); b.setAttribute('aria-pressed', b.dataset.d === day ? 'true' : 'false'); });
      var full = r[1] - r[0] === 24; $('#dialHead').innerHTML = full ? 'Open <em>24 hours.</em>' : 'Open <em>10 AM to 5 PM.</em>';
      $('#dialSub').textContent = full ? (day === today ? 'Today, all day and all night.' : 'All day and all night. The same from Monday to Saturday.') : 'Sunday is the short day. Every other day we are open around the clock.';
    }
    $$('#days .day').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.d); }); });
    show(today);
    var r = D[today], open = h >= r[0] && h < r[1], live = $('#live'); live.classList.toggle('is-open', open);
    live.querySelector('span').textContent = open ? (r[1] - r[0] === 24 ? 'Open now · 24 hours today' : 'Open now · until 5 PM') : 'Closed now · opens ' + (today === 'Sun' && h < 10 ? 'at 10 AM' : 'at midnight');
  })();

  var deg = $('#deg'), read = $('.read'), bar = $('#degBar'), stt = $('#degSt');
  function setDeg(v) { deg.textContent = Math.round(v); var cool = v <= 26; read.classList.toggle('is-cool', cool); stt.textContent = cool ? 'COMFORTABLE' : v > 36 ? 'TOO HOT' : 'COOLING'; bar.style.transform = 'scaleX(' + ((v - 16) / 30).toFixed(3) + ')'; }
  if (!G) { setDeg(22); $('#heat').style.opacity = '.15'; return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0); // keep real time even when the browser draws few frames
  // the room cools: 46 down to 22 as the page opens
  var o = { v: 46 }; setDeg(46);
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.read', { scale: .9, opacity: 0, duration: .7 })
    .from('.hero h1, .hero__txt p, .hero__cta', { y: 30, opacity: 0, duration: .7, stagger: .1 }, '-=.4')
    .to(o, { v: 22, duration: 3.2, ease: 'power2.inOut', onUpdate: function () { setDeg(o.v); } }, '-=.6')
    .from('.facts li', { y: 20, opacity: 0, duration: .5, stagger: .1 }, '-=2.4');
  // and so does the page: the orange glow fades while you scroll the first screens
  gsap.to('#heat', { opacity: 0, ease: 'none', scrollTrigger: { start: 0, end: function () { return innerHeight * 1.6; }, scrub: true } });
  gsap.to('.hero__v', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // the belts run in opposite directions and speed up with the scroll
  [['#beltA', -1], ['#beltB', 1]].forEach(function (b) { var row = $(b[0]), half = row.scrollWidth / 2, x = b[1] > 0 ? -half : 0, v = 0;
    ScrollTrigger.create({ onUpdate: function (s) { v = Math.min(Math.abs(s.getVelocity()) / 300, 10); } });
    gsap.ticker.add(function () { x += b[1] * (.6 + v); v *= .93; if (x <= -half) x += half; if (x > 0) x -= half; row.style.transform = 'translate3d(' + x + 'px,0,0)'; }); });

  // the big outlined numbers fill with ice as each row arrives
  $$('.rw').forEach(function (r) {
    gsap.from(r.querySelector('.rw__pic'), { clipPath: 'inset(0 100% 0 0 round 22px)', duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: r, start: 'top 78%' } });
    gsap.to(r.querySelector('.rw__n'), { color: '#8FE6FF', duration: .8, scrollTrigger: { trigger: r, start: 'top 70%' } });
    gsap.from(r.querySelector('.rw__t').children, { y: 24, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: r, start: 'top 78%' } }); });
  gsap.from('#ticket', { y: 80, rotate: 6, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.job', start: 'top 70%' } });
  gsap.from('.ft__num', { letterSpacing: '.1em', opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ft', start: 'top 80%' } });

  $$('.job__pick > *, .talk__head > *, .dial, .hours__txt > *').forEach(function (el) { el.setAttribute('data-in', ''); });
  ScrollTrigger.batch('[data-in]', { start: 'top 90%', once: true, onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out', overwrite: true }); } });
  var lazy = $('.rw__pic video'); if (lazy && 'IntersectionObserver' in window) new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { lazy.src = lazy.dataset.src; lazy.play().catch(function () { }); ob.disconnect(); } }); }, { rootMargin: '300px' }).observe(lazy);
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
