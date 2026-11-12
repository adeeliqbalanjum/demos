/* Perfect Cut: the tape, the scissors on the cut line, the thread, the review deck, the opening hours. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, G = !!(window.gsap && window.ScrollTrigger) && !reduced;
  if (!G) document.documentElement.classList.add('reduced');

  /* opening hours in Sharjah time: today, and open or closed right now */
  (function () {
    var H = { Monday: [[10, 23]], Tuesday: [[10, 23]], Wednesday: [[10, 23]], Thursday: [[10, 23]], Friday: [[10, 11.5], [14, 23]], Saturday: [[10, 23]], Sunday: [[10, 21]] };
    var p = {}; try { new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); } catch (e) { return; }
    $$('#hrs li').forEach(function (li) { if (li.dataset.day === p.weekday) li.classList.add('is-today'); });
    var h = (+p.hour % 24) + (+p.minute) / 60, slots = H[p.weekday] || [], open = null, next = null;
    slots.forEach(function (s) { if (h >= s[0] && h < s[1]) open = s; else if (h < s[0] && !next) next = s; });
    var fmt = function (x) { var hh = Math.floor(x), m = Math.round((x - hh) * 60), ap = hh >= 12 ? 'PM' : 'AM', h12 = hh % 12 || 12; return h12 + (m ? ':' + (m < 10 ? '0' : '') + m : '') + ' ' + ap; };
    var el = $('#state'); el.classList.toggle('is-open', !!open);
    el.querySelector('span').textContent = open ? 'Open now, until ' + fmt(open[1]) : next ? 'Closed now, opens at ' + fmt(next[0]) : 'Closed now, opens tomorrow at 10 AM';
  })();

  /* the review deck: the top card flies off and goes to the back */
  (function () {
    var deck = $('#deck'), cards = $$('#deck .cardx'), busy = false;
    function pos(i) { var k = Math.min(i, 3); return { x: k * 10, y: k * 10, rotate: i ? (i % 2 ? 1.1 : -0.9) * k : 0 }; }
    function lay(animate, skip) { cards.forEach(function (c, i) { if (c === skip) return; c.style.zIndex = 20 - i; var o = pos(i); if (G && animate) gsap.to(c, { x: o.x, y: o.y, rotate: o.rotate, opacity: 1, duration: .45, ease: 'power3.out' }); else if (G) gsap.set(c, { x: o.x, y: o.y, rotate: o.rotate, opacity: 1 }); else c.style.transform = 'translate(' + o.x + 'px,' + o.y + 'px) rotate(' + o.rotate + 'deg)'; }); }
    function next() { if (busy) return; var top = cards.shift(); cards.push(top);
      if (!G) { lay(false); return; } busy = true; top.style.zIndex = 30; lay(true, top);
      gsap.to(top, { x: -innerWidth * .45, y: -50, rotate: -16, opacity: 0, duration: .4, ease: 'power2.in', onComplete: function () { top.style.zIndex = 20 - (cards.length - 1); var o = pos(cards.length - 1); gsap.fromTo(top, { x: o.x + 40, y: o.y + 40, rotate: 4, opacity: 0 }, { x: o.x, y: o.y, rotate: o.rotate, opacity: 1, duration: .35, ease: 'power3.out' }); busy = false; } }); }
    $('#nextCard').addEventListener('click', next); deck.addEventListener('click', next); lay(false);
  })();

  var bar = $('#thumbbar'); addEventListener('scroll', function () { bar.classList.toggle('is-in', scrollY > innerHeight * .6); }, { passive: true });
  if (!G) { $('#tape').style.clipPath = 'none'; var t0 = $('#thread'); if (t0) t0.style.height = '100%'; return; }

  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !('ontouchstart' in window)) { var lenis = new Lenis({ duration: 1 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -90 }); } }); }); }

  // the tape unrolls with the page
  gsap.fromTo('#tape', { clipPath: 'inset(0 96% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  // opening: the two words slide in from opposite sides, the film drops and is pinned
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('#w1', { xPercent: -12, opacity: 0, duration: 1 })
    .from('#w2', { xPercent: 14, opacity: 0, duration: 1 }, '-=.8')
    .from('#film', { y: -80, rotate: 6, opacity: 0, duration: .9, ease: 'back.out(1.4)' }, '-=.55')
    .from('.film__pin', { scale: 0, duration: .3, stagger: .1, ease: 'back.out(3)' }, '-=.2')
    .from('.note--a, .hero__say > *, .score', { y: 24, opacity: 0, duration: .6, stagger: .08 }, '-=.4');
  gsap.to('#film', { rotate: 2, yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('#w1', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // the scissors travel along the cut line
  gsap.to('#snip', { left: '100%', xPercent: -100, ease: 'none', scrollTrigger: { trigger: '.cutline', start: 'top 95%', end: 'top 25%', scrub: .4 } });

  // the thread sews down through the steps
  gsap.to('#thread', { height: '100%', ease: 'none', scrollTrigger: { trigger: '#path', start: 'top 65%', end: 'bottom 70%', scrub: .3 } });
  $$('.step').forEach(function (s, i) { var odd = i % 2 === 0;
    gsap.from(s.querySelector('.step__pic'), { x: odd ? 80 : -80, rotate: odd ? 9 : -9, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 78%' } });
    gsap.from(s.querySelector('.step__txt').children, { y: 26, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 78%' } }); });

  // the lines of the dark section come in one after another
  gsap.from('.ln', { y: 40, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.lines', start: 'top 80%' } });

  // the 5.0 grows as it arrives
  gsap.from('#five', { scale: .6, transformOrigin: '0 100%', ease: 'none', scrollTrigger: { trigger: '.said', start: 'top bottom', end: 'top 30%', scrub: true } });

  $$('.stitch__head, .order__head, .deck, .find__pic, .find__info > *, .start__h, .door, .foot__top > *').forEach(function (el) { el.setAttribute('data-up', ''); });
  ScrollTrigger.batch('[data-up]', { start: 'top 90%', once: true, onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: .75, stagger: .08, ease: 'power3.out', overwrite: true }); } });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
