/* Al Emirates Tours · Home V4 · page logic: the scroll drives the world, the panels, the clock and the rail. */
(function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = window.AETWorld || null;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const journey = $('#journey'), nav = $('#nav'), whiteout = $('#whiteout'), cue = $('#scrollcue');
const panels = $$('.panel').map((el) => ({ el, a: +el.dataset.a, b: +el.dataset.b }));
const railBtns = $$('#rail button').map((el) => ({ el, from: +el.dataset.from }));
if (!W) { $('#fallback').hidden = false; }

/* scroll -> progress */
const span = () => journey.offsetHeight - innerHeight;
const progress = () => clamp((scrollY - journey.offsetTop) / span(), 0, 1);
const goTo = (t, smooth) => scrollTo({ top: journey.offsetTop + t * span() + 2, behavior: smooth && !RM ? 'smooth' : 'auto' });
function onScroll() { const p = progress(); if (W) W.set(p); else paint(p); nav.classList.toggle('is-solid', scrollY > journey.offsetTop + span() + innerHeight * 0.5); if (W) W.pause(scrollY > journey.offsetTop + journey.offsetHeight + 40); }
addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
$$('[data-go]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); goTo(+el.dataset.go, true); }));

/* the clock: the scroll is the time of day */
const CLOCK = [[0, 975], [0.10, 985], [0.26, 1035], [0.345, 1085], [0.47, 1170], [0.58, 1200], [0.62, 1210], [0.80, 1285], [0.82, 320], [0.86, 345], [0.97, 380]];
const PLACES = [[0.11, 'Lahbab red dunes'], [0.28, 'Dune bashing, Lahbab'], [0.42, 'Sunset point'], [0.60, 'Arabian camp'], [0.82, 'Dubai Marina'], [9, 'Above Downtown Dubai']];
function minutesAt(t) { for (let i = 1; i < CLOCK.length; i++) if (t <= CLOCK[i][0]) { const a = CLOCK[i - 1], b = CLOCK[i]; if (b[1] < a[1]) return t < (a[0] + b[0]) / 2 ? a[1] : b[1]; return a[1] + (b[1] - a[1]) * ((t - a[0]) / (b[0] - a[0])); } return CLOCK[CLOCK.length - 1][1]; }
const fmt = (m) => { m = Math.round(m); const h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ':' + (mm < 10 ? '0' : '') + mm + (h >= 12 ? ' PM' : ' AM'); };
const clockT = $('#clockT'), clockP = $('#clockP'); let lastClock = '', lastPlace = '';

/* paint the overlay for progress t */
function paint(t) {
  panels.forEach((p) => { const k = Math.min(sstep(p.a, p.a + 0.022, t), 1 - sstep(p.b - 0.022, p.b, t)); const on = k > 0.001;
    if (on !== p.on) { p.on = on; p.el.classList.toggle('is-on', on); }
    if (on) { p.el.style.opacity = k.toFixed(3); p.el.style.transform = 'translateY(' + ((1 - k) * (t < (p.a + p.b) / 2 ? 40 : -40)).toFixed(1) + 'px)'; } else if (p.el.style.opacity !== '0') p.el.style.opacity = '0'; });
  const c = fmt(minutesAt(t)); if (c !== lastClock) { lastClock = c; clockT.textContent = c; }
  const pl = PLACES.find((x) => t < x[0])[1]; if (pl !== lastPlace) { lastPlace = pl; clockP.textContent = pl; }
  let idx = 0; railBtns.forEach((b, i) => { if (t >= b.from) idx = i; }); railBtns.forEach((b, i) => b.el.classList.toggle('is-on', i === idx));
  whiteout.style.opacity = sstep(0.972, 0.999, t).toFixed(3);
  cue.style.opacity = t > 0.02 ? '0' : '0.9';
}
if (W) W.onFrame(paint);

/* deep link for checks: ?t=0.5 jumps straight to that moment */
const qt = new URLSearchParams(location.search).get('t');
function start() { if (qt !== null) { goTo(+qt, false); if (W) { W.jump(+qt); } } onScroll(); paint(W ? W.t : progress()); setTimeout(() => $('#loader').classList.add('is-done'), qt !== null ? 0 : 1500); }
if (document.readyState === 'complete') start(); else addEventListener('load', start);

/* reveals */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const el = e.target; setTimeout(() => el.classList.add('is-in'), (+el.dataset.d || 0)); io.unobserve(el); } }), { threshold: 0.15 });
$$('.reveal').forEach((el, i) => { const sib = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0; el.dataset.d = el.classList.contains('tilt') ? sib * 110 : 0; io.observe(el); });

/* tilt in 3D (pointer devices) */
if (!RM && matchMedia('(hover:hover)').matches) $$('.tilt').forEach((c) => {
  c.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = 'perspective(900px) rotateY(' + (x * 14).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg) translateY(-6px)'; });
  c.addEventListener('mouseleave', () => { c.style.transform = ''; }); });

/* the ring of most booked tours */
(function ring() { const ringEl = $('#ring'), scene = $('#ringScene'), cards = $$('.card', ringEl), n = cards.length, step = 360 / n; let R = 0;
  const layout = () => { const w = ringEl.offsetWidth; R = Math.round((w / 2) / Math.tan(Math.PI / n)) + 46; cards.forEach((c, i) => { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; }); };
  let ang = 0, target = 0, drag = null, auto = !RM, seen = false, moved = 0;
  const draw = () => { ringEl.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + ang.toFixed(2) + 'deg)'; cards.forEach((c, i) => { let d = ((i * step + ang) % 360 + 540) % 360 - 180; c.style.opacity = Math.abs(d) > 100 ? '0' : String(Math.max(0.25, 1 - Math.abs(d) / 110)); c.style.pointerEvents = Math.abs(d) < step / 2 ? 'auto' : 'none'; }); };
  const tick = () => { if (seen) { if (auto && !drag) target -= 0.05; ang += (target - ang) * 0.09; draw(); } requestAnimationFrame(tick); };
  const snap = () => { target = Math.round(target / step) * step; };
  scene.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, t: target }; moved = 0; auto = false; scene.setPointerCapture(e.pointerId); });
  scene.addEventListener('pointermove', (e) => { if (!drag) return; moved = e.clientX - drag.x; target = drag.t + moved * 0.28; });
  const end = () => { if (!drag) return; drag = null; snap(); }; scene.addEventListener('pointerup', end); scene.addEventListener('pointercancel', end);
  scene.addEventListener('click', (e) => { if (Math.abs(moved) > 6) e.preventDefault(); }, true);
  $('#ringPrev').addEventListener('click', () => { auto = false; target += step; snap(); }); $('#ringNext').addEventListener('click', () => { auto = false; target -= step; snap(); });
  new IntersectionObserver((es) => { seen = es[0].isIntersecting; }).observe(scene);
  addEventListener('resize', layout); layout(); draw(); tick(); })();

/* WhatsApp chat typed in front of you */
(function chat() { const chatEl = $('#chat'); let done = false;
  const type = (el, text, speed) => new Promise((res) => { el.classList.add('is-in'); let i = 0; const t = setInterval(() => { i++; el.innerHTML = text.slice(0, i) + (i < text.length ? '<span class="cursor"></span>' : ''); if (i >= text.length) { clearInterval(t); res(); } }, speed); });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  new IntersectionObserver(async (es, ob) => { if (!es[0].isIntersecting || done) return; done = true; ob.disconnect(); const m = $$('.msg', chatEl);
    if (RM) { m.forEach((x) => { x.textContent = x.dataset.typed; x.classList.add('is-in'); }); return; }
    await wait(500); await type(m[0], m[0].dataset.typed, 28); await wait(900); await type(m[1], m[1].dataset.typed, 16); await wait(700); m[2].textContent = m[2].dataset.typed; m[2].classList.add('is-in'); }, { threshold: 0.4 }).observe(chatEl); })();
})();
