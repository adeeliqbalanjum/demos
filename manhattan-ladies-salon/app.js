/* Manhattan Ladies Salon: motion and the three working parts (service board, opening hours, message builder). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, hasG = !!(window.gsap && window.ScrollTrigger);
  var phone = function () { return innerWidth <= 760; };
  var SVC = window.SVC || [], WA = 'https://wa.me/' + window.WA_NUM + '?text=';
  if (reduced || !hasG) document.documentElement.classList.add('reduced');

  /* ---------- the service board ---------- */
  var rows = $$('#svcList .row'), pics = $$('#svcView .board__pics span'), cur = -1;
  function ask(s) { return WA + encodeURIComponent('Hi Manhattan Ladies Salon! I would like to ask about ' + s.say + '. Do you have a slot this week?'); }
  function show(i, user) {
    if (i === cur && !(user && phone())) return;
    var s = SVC[i]; if (!s) return;
    rows.forEach(function (r, n) { r.classList.toggle('is-on', n === i); r.setAttribute('aria-expanded', n === i ? 'true' : 'false'); });
    pics.forEach(function (p, n) { p.classList.toggle('is-on', n === i); });
    $('#svcCount').textContent = s.head || (s.count + ' Google reviews mention ' + s.say);
    $('#svcQuote').textContent = s.quote ? '"' + s.quote + '"' : s.line;
    $('#svcWho').textContent = s.who ? s.who + ' · Google review' : 'From our Google listing';
    $('#svcAsk').href = ask(s); $('#svcAsk span').textContent = 'Ask about ' + s.say;
    if (hasG && !reduced && cur > -1) gsap.fromTo('.board__card', { y: 14, opacity: .4 }, { y: 0, opacity: 1, duration: .45, ease: 'power2.out' });
    $$('#svcList .row__more').forEach(function (m, n) { // the phone accordion
      var open = n === i && phone(); if (hasG && !reduced) gsap.to(m, { height: open ? 'auto' : 0, duration: .45, ease: 'power2.inOut' }); else m.style.height = open ? 'auto' : '0';
    });
    cur = i;
  }
  rows.forEach(function (r, i) {
    r.addEventListener('click', function () { show(i, true); });
    r.addEventListener('mouseenter', function () { if (!phone() && matchMedia('(hover:hover)').matches) show(i); });
    r.addEventListener('focus', function () { if (!phone()) show(i); });
  });
  $$('#svcList .row__more a').forEach(function (a, i) { a.href = ask(SVC[i]); });
  show(0);

  /* ---------- opening hours: today, and open or closed right now in Sharjah ---------- */
  (function () {
    var p = {}; try { new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); } catch (e) { return; }
    $$('#hours li').forEach(function (li) { if (li.dataset.day === p.weekday) li.classList.add('is-today'); });
    var h = (+p.hour % 24) + (+p.minute) / 60, open = h >= 10 && h < 22, chip = $('#openChip');
    chip.classList.toggle('is-open', open);
    chip.querySelector('span').textContent = open ? 'Open now, until 10 PM' : (h < 10 ? 'Opens today at 10 AM' : 'Opens tomorrow at 10 AM');
  })();

  /* ---------- the message builder ---------- */
  (function () {
    var state = { what: [SVC[0] ? SVC[0].say : 'a hair spa'], day: 'today', time: 'in the afternoon' };
    function join(a) { return a.length < 2 ? a[0] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
    function render(bump) {
      var t = 'Hi Manhattan Ladies Salon! I would like to book ' + join(state.what) + ' ' + state.day + ' ' + state.time + '. Is there a slot?';
      var b = $('#bubble'); b.textContent = t; $('#sendBtn').href = WA + encodeURIComponent(t);
      if (bump && hasG && !reduced) gsap.fromTo(b, { scale: .96 }, { scale: 1, duration: .35, ease: 'back.out(2.2)' });
    }
    $$('#pickWhat .chip').forEach(function (c) { c.addEventListener('click', function () {
      var v = c.dataset.v, i = state.what.indexOf(v);
      if (i > -1) { if (state.what.length === 1) return; state.what.splice(i, 1); } else { if (state.what.length === 3) { var first = state.what.shift(); $$('#pickWhat .chip').forEach(function (x) { if (x.dataset.v === first) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); } }); } state.what.push(v); }
      c.classList.toggle('is-on', state.what.indexOf(v) > -1); c.setAttribute('aria-pressed', state.what.indexOf(v) > -1 ? 'true' : 'false'); render(true);
    }); });
    [['#pickDay', 'day'], ['#pickTime', 'time']].forEach(function (g) { $$(g[0] + ' .chip').forEach(function (c) { c.addEventListener('click', function () {
      $$(g[0] + ' .chip').forEach(function (x) { x.classList.toggle('is-on', x === c); }); state[g[1]] = c.dataset.v; render(true);
    }); }); });
    render(false);
  })();

  /* ---------- small things that need no library ---------- */
  var top = $('#top'), dock = $('#dockbar');
  addEventListener('scroll', function () { top.classList.toggle('is-stuck', scrollY > 30); dock.classList.toggle('is-in', scrollY > innerHeight * .6); }, { passive: true });
  var vv = $('.visit__film video');
  if ('IntersectionObserver' in window && vv) new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { vv.src = vv.dataset.src; vv.play().catch(function () { }); o.disconnect(); } }); }, { rootMargin: '300px' }).observe(vv);

  if (reduced || !hasG) { document.documentElement.classList.add('no-curtain'); return; }

  /* ---------- motion ---------- */
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !('ontouchstart' in window)) { var lenis = new Lenis({ duration: 1.05 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); } }); }); }

  function intro() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__h1 .ln>span', { yPercent: 110, duration: 1, stagger: .12 })
      .from('.hero .kicker, .hero__quote, .hero__sub, .hero__cta', { y: 24, opacity: 0, duration: .7, stagger: .08 }, '-=.6')
      .from('#heroFrame', { clipPath: 'inset(100% 0 0 0 round 200px 200px 28px 28px)', duration: 1.1, ease: 'power4.inOut' }, 0)
      .from('.card--rating, .card--note, .seal', { scale: .6, opacity: 0, duration: .6, stagger: .12, ease: 'back.out(1.8)' }, '-=.35')
      .from('.hero__strip li', { y: 30, opacity: 0, duration: .6, stagger: .08 }, '-=.4');
  }
  var seen = false; try { seen = sessionStorage.getItem('mls-seen') === '1'; sessionStorage.setItem('mls-seen', '1'); } catch (e) { }
  if (seen) { document.documentElement.classList.add('no-curtain'); intro(); }
  else gsap.timeline()
    .to('.curtain__word i', { y: 0, duration: .7, stagger: .05, ease: 'power3.out' })
    .to('.curtain__sub', { opacity: 1, duration: .4 }, '-=.3')
    .to('#curtain', { yPercent: -100, duration: .9, ease: 'power4.inOut', delay: .35, onStart: intro })
    .set('#curtain', { display: 'none' });

  // the film drifts inside its frame; the hanging cards move at their own speed
  gsap.to('#heroFrame video', { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.card--note', { y: -50, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.card--rating', { y: 36, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // the ticker runs by itself and leans with the scroll
  (function () { var row = $('#ticker'), half = row.scrollWidth / 2, x = 0, dir = -1, v = 0;
    ScrollTrigger.create({ onUpdate: function (s) { dir = s.direction === 1 ? -1 : 1; v = Math.min(Math.abs(s.getVelocity()) / 240, 14); } });
    gsap.ticker.add(function () { x += dir * (1 + v); v *= .92; if (x <= -half) x += half; if (x > 0) x -= half; row.style.transform = 'translate3d(' + x + 'px,0,0)'; }); })();

  // sections rise as they arrive
  $$('.sec-head, .board__list li, .board__view, .nm, .gline, .visit__film, .visit__info > *, .book__left > *, .phone, .foot__cols > div').forEach(function (el) { el.setAttribute('data-rise', ''); });
  ScrollTrigger.batch('[data-rise]', { start: 'top 90%', once: true, onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: .8, stagger: .07, ease: 'power3.out', overwrite: true }); } });

  // the numbers count up once
  $$('.nums b').forEach(function (b) { var end = parseFloat(b.dataset.count), dec = +(b.dataset.dec || 0), o = { v: 0 };
    ScrollTrigger.create({ trigger: b, start: 'top 88%', once: true, onEnter: function () { gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: function () { b.textContent = o.v.toFixed(dec); } }); } }); });
  gsap.from('.nums', { scale: .94, borderRadius: 80, ease: 'none', scrollTrigger: { trigger: '.nums', start: 'top bottom', end: 'top 55%', scrub: true } });

  // the footer word slides in from the side
  gsap.from('.foot__word', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
