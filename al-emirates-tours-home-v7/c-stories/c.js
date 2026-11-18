/* V7 C · the stories: five clips play like phone stories (tap to skip, hold to pause), the four tours turn on a
   coverflow, the reviews are a deck. */
(function () {
'use strict';
const A = window.AET, { $, $$, OFFERS, ICO, AED, esc, pad, bySlug, RM, P } = A;
const MOBILE = innerWidth < 760, SIZE = MOBILE ? '640' : '1280';

/* ---------- stories ---------- */
const STORIES = [
  { k: 'dunes', when: '4:15 PM · Lahbab red dunes', h: 'You step out of the car into this.', p: 'Forty five minutes from your hotel. Shoes off, the sand is still warm.', slug: 'desert-safari-dubai-in-99-aed', pos: '50% 50%' },
  { k: 'convoy', when: '4:30 PM · Dune bashing', h: 'Tyres deflate. The dunes begin.', p: 'Thirty minutes on the red sand behind the lead car, then sandboarding from the top.', slug: 'desert-safari-dubai-in-99-aed', pos: '30% 50%' },
  { k: 'sunset', when: '6:05 PM · Sunset point', h: 'The sun goes down while you are on a camel.', p: 'Camel ride, falcon photo, the picture everyone posts.', slug: 'desert-safari-dubai-in-99-aed', pos: '62% 50%' },
  { k: 'tanoura', when: '7:30 PM · Arabian camp', h: 'Dinner under the stars. Three shows.', p: 'BBQ buffet, Tanoura, belly dance and the fire show. Back at your hotel by ten.', slug: 'desert-safari-dubai-in-99-aed', pos: '66% 50%' },
  { k: 'marina', when: 'Another evening · Dubai Marina', h: 'The city looks better from a dhow.', p: 'A wooden boat, dinner on board, the Marina towers sliding past.', slug: 'dhow-cruise-marina', pos: '72% 50%' },
];
const st = $('#st'), media = $('#stMedia'), barsEl = $('#stBars'), cap = $('#stCap'), pp = $('#stPP');
const vids = [0, 1].map(() => { const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.preload = 'auto'; v.disablePictureInPicture = true; v.tabIndex = -1; media.appendChild(v); return v; });
barsEl.innerHTML = STORIES.map(() => '<i><b></b></i>').join(''); const bars = $$('b', barsEl);
let si = -1, front = 0, paused = false, userPaused = false, still = 0, lastT = performance.now();
function story(i) { i = (i + STORIES.length) % STORIES.length; const s = STORIES[i], t = bySlug(s.slug); si = i; still = 0;
  const v = vids[front = 1 - front], old = vids[1 - front]; const poster = P('poster/' + s.k + '.jpg');
  v.style.backgroundImage = 'url(' + poster + ')'; v.style.objectPosition = s.pos; v.style.backgroundPosition = s.pos; v.poster = poster;
  if (!RM) { v.src = P('video/' + s.k + '-' + SIZE + '.mp4'); const pl = v.play(); if (pl && pl.catch) pl.catch(() => {}); if (paused) v.pause(); }
  v.classList.add('is-on'); old.classList.remove('is-on'); setTimeout(() => { if (!old.classList.contains('is-on')) old.pause(); }, 600);
  bars.forEach((b, k) => b.style.setProperty('--p', k < i ? 1 : 0));
  $('#stWhen').textContent = s.when;
  cap.innerHTML = '<small>' + pad(i + 1) + ' / ' + pad(STORIES.length) + '</small><h2>' + esc(s.h) + '</h2><p>' + esc(s.p) + '</p><button class="btn btn--orange" data-book="' + s.slug + '"><span>Book · from ' + AED(t.price) + '</span>' + ICO('arrow-right') + '</button>';
  cap.classList.remove('is-swap'); void cap.offsetWidth; cap.classList.add('is-swap'); }
/* progress follows the clip; if a clip cannot play (reduced motion, slow network) a 5 s still takes its place */
function tick(now) { requestAnimationFrame(tick); const dt = Math.min(now - lastT, 100); lastT = now; if (si < 0 || paused) return; const v = vids[front];
  let p; if (!RM && v.readyState >= 2 && v.duration) p = v.currentTime / v.duration; else { still += dt; p = still / 5000; }
  bars[si].style.setProperty('--p', Math.min(1, p).toFixed(3)); if (p >= 1 || v.ended) story(si + 1); }
requestAnimationFrame(tick);
function setPaused(p) { paused = p; const v = vids[front]; if (p) v.pause(); else if (!RM) { const pl = v.play(); if (pl && pl.catch) pl.catch(() => {}); } pp.innerHTML = ICO(p ? 'play' : 'pause'); pp.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
const sync = () => setPaused(userPaused || holding || !seen || document.body.classList.contains('panel-open'));
pp.addEventListener('click', () => { userPaused = !userPaused; sync(); });
/* tap = skip, hold = pause */
let holding = false, seen = true, downAt = 0;
$$('.st__zone', st).forEach((z) => { z.addEventListener('pointerdown', () => { downAt = performance.now(); holding = true; sync(); });
  const up = (e) => { if (!holding) return; holding = false; sync(); if (e.type === 'pointerup' && performance.now() - downAt < 260) story(si + (z.id === 'stPrev' ? -1 : 1)); };
  z.addEventListener('pointerup', up); z.addEventListener('pointerleave', up); z.addEventListener('pointercancel', up);
  z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); story(si + (z.id === 'stPrev' ? -1 : 1)); } }); });
new IntersectionObserver((es) => { seen = es[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(st);
story(0);

/* ---------- the four: coverflow ---------- */
const cf = $('#cf'), dotsEl = $('#cfDots');
cf.innerHTML = OFFERS.map((o, i) => { const t = bySlug(o.slug); return '<article class="cf__card" data-cf="' + i + '" aria-label="' + esc(o.name) + '"><div class="cf__ph"><img src="' + o.img + '" alt="' + esc(o.alt) + '" loading="lazy" draggable="false"><span class="tag">' + esc(o.seal.join(' ')) + '</span></div><div class="cf__body"><p class="slide__meta">' + o.meta.map((m) => '<span>' + ICO(m[0]) + esc(m[1]) + '</span>').join('') + '</p><h3 class="cf__name">' + esc(o.name) + '</h3><p>' + esc(o.p) + '</p><div class="cf__buy"><p class="price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</p><button class="btn btn--orange btn--chip" data-book="' + o.slug + '">Book <i>' + ICO('arrow-right') + '</i></button></div></div></article>'; }).join('');
dotsEl.innerHTML = OFFERS.map((o, i) => '<button data-cfd="' + i + '" aria-label="' + esc(o.name) + '"></button>').join('');
const cards = $$('.cf__card', cf), dots = $$('button', dotsEl), N = cards.length;
function turn(i) { cards.forEach((c, k) => { let d = ((k - i) % N + N) % N; if (d > N / 2) d -= N; const back = Math.abs(d) === 2; const x = back ? 0 : d * (innerWidth < 701 ? 88 : 68);
    c.style.transform = 'translateX(' + x + '%) translateZ(' + (back ? -520 : -Math.abs(d) * 220) + 'px) rotateY(' + (back ? 0 : -d * 32) + 'deg)';
    c.style.opacity = back ? '0' : d === 0 ? '1' : '.62'; c.style.zIndex = String(10 - Math.abs(d)); c.style.pointerEvents = back ? 'none' : ''; c.classList.toggle('is-on', d === 0); $('.cf__body', c).inert = d !== 0; });
  dots.forEach((b, k) => b.style.setProperty('--p', k === i ? 0 : 0)); }
const cc = A.cycle(N, 5600, turn); cc.onProgress = (p, i) => dots[i].style.setProperty('--p', p.toFixed(3));
cf.addEventListener('click', (e) => { if (Math.abs(moved) > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; return; } const c = e.target.closest('.cf__card'); if (c && !c.classList.contains('is-on')) { e.preventDefault(); e.stopPropagation(); cc.go(+c.dataset.cf); } }, true);
dotsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-cfd]'); if (b) cc.go(+b.dataset.cfd); });
$('#cfPrev').addEventListener('click', () => cc.go(cc.index - 1)); $('#cfNext').addEventListener('click', () => cc.go(cc.index + 1));
let sx = null, moved = 0; cf.addEventListener('pointerdown', (e) => { sx = e.clientX; moved = 0; }); addEventListener('pointerup', (e) => { if (sx === null) return; moved = e.clientX - sx; sx = null; if (Math.abs(moved) > 46) cc.go(cc.index + (moved < 0 ? 1 : -1)); });
let cHover = false, cSeen = false; const cSync = () => cc.pause(cHover || !cSeen || document.body.classList.contains('panel-open'));
cf.addEventListener('mouseenter', () => { cHover = true; cSync(); }); cf.addEventListener('mouseleave', () => { cHover = false; cSync(); });
new IntersectionObserver((es) => { cSeen = es[0].isIntersecting; cSync(); }, { threshold: 0.4 }).observe(cf);
addEventListener('resize', () => turn(cc.index)); turn(0); cSync();

/* ---------- reviews: a deck you flip ---------- */
const deck = $('#deck'), R = A.REVIEWS; let top = 0;
deck.innerHTML = R.map((r) => '<blockquote>' + ICO('quote') + '<p>"' + esc(r.q) + '"</p><footer><i>' + esc(r.i) + '</i>' + esc(r.n) + '<span>· Google</span></footer></blockquote>').join('') + '<span class="deck__hint">Tap the card for the next review ' + ICO('arrow-right') + '</span>';
const dcards = $$('blockquote', deck);
function lay() { dcards.forEach((c, k) => { const d = ((k - top) % R.length + R.length) % R.length; c.style.zIndex = String(R.length - d); c.style.transform = 'translateY(' + d * 14 + 'px) scale(' + (1 - d * 0.045) + ') rotate(' + (d === 0 ? 0 : d % 2 ? 1.6 : -1.6) + 'deg)'; c.style.opacity = d > 2 ? '0' : '1'; c.setAttribute('aria-hidden', String(d !== 0)); }); }
function flip() { const c = dcards[top]; c.style.transform = 'translateX(60%) rotate(14deg)'; c.style.opacity = '0'; top = (top + 1) % R.length; setTimeout(lay, RM ? 0 : 260); }
deck.addEventListener('click', flip); lay();
let dSeen = false, dT = 0; new IntersectionObserver((es) => { dSeen = es[0].isIntersecting; }, { threshold: 0.5 }).observe(deck);
if (!RM) setInterval(() => { if (dSeen && !deck.matches(':hover') && !document.body.classList.contains('panel-open')) flip(); }, 5200);

/* ---------- WhatsApp chat types itself once ---------- */
(function () { const chat = $('#chat'); let done = false; const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const type = (el, text, speed) => new Promise((res) => { el.classList.add('is-in'); let i = 0; const t = setInterval(() => { i++; el.innerHTML = esc(text.slice(0, i)) + (i < text.length ? '<span class="cursor"></span>' : ''); if (i >= text.length) { clearInterval(t); res(); } }, speed); });
  new IntersectionObserver(async (es, ob) => { if (!es[0].isIntersecting || done) return; done = true; ob.disconnect(); const m = $$('.msg', chat);
    if (RM) { m.forEach((x) => { x.textContent = x.dataset.typed; x.classList.add('is-in'); }); return; }
    await wait(400); await type(m[0], m[0].dataset.typed, 26); await wait(800); await type(m[1], m[1].dataset.typed, 15); await wait(600); m[2].textContent = m[2].dataset.typed; m[2].classList.add('is-in'); }, { threshold: 0.4 }).observe(chat); })();

/* ---------- the rest ---------- */
new MutationObserver(() => { sync(); cSync(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
A.mountBar($('#bar'), { compact: true, go: 'Check availability' });
A.mountCards({ chips: $('#chips'), cards: $('#cards'), all: 12 }); A.scroller($('#cards'), $('#cPrev'), $('#cNext'));
A.mountFaq($('#faq')); A.mountFoot($('#foot')); A.fill(); A.reveal(); A.stickyAfter($('#hero'));
const nav = $('#nav'), hero = $('#hero'); const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40); addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
