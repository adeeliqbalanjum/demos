/* V7 B · the frame: the evening plays by itself in the hero frame (no scrolling), four panels open one by one,
   the evening is a five-moment slider. */
(function () {
'use strict';
const A = window.AET, { $, $$, OFFERS, ICO, AED, esc, pad, bySlug, RM, P } = A;
const MOBILE = innerWidth < 760, SIZE = MOBILE ? '640' : '1280';

/* ---------- hero frame: five clips, each plays once, then the next ---------- */
const SCENES = [
  { k: 'convoy', tab: 'Dune bashing', t: '4:30 PM · Dune bashing', h: 'Evening Desert Safari', slug: 'desert-safari-dubai-in-99-aed' },
  { k: 'sunset', tab: 'Sunset', t: '6:05 PM · Sunset and camels', h: 'Evening Desert Safari', slug: 'desert-safari-dubai-in-99-aed' },
  { k: 'tanoura', tab: 'Camp', t: '7:30 PM · Dinner and three shows', h: 'Evening Desert Safari', slug: 'desert-safari-dubai-in-99-aed' },
  { k: 'marina', tab: 'Marina', t: 'Another evening · Dubai Marina', h: 'Dhow Cruise', slug: 'dhow-cruise-marina' },
];
const media = $('#frameMedia'), scenesEl = $('#frameScenes'), card = $('#frameCard'), pp = $('#framePP');
const vids = [0, 1].map(() => { const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.preload = 'auto'; v.disablePictureInPicture = true; v.tabIndex = -1; media.appendChild(v); return v; });
scenesEl.innerHTML = SCENES.map((s, i) => '<button class="fscene" role="tab" data-scene="' + i + '">' + esc(s.tab) + '</button>').join('');
const tabs = $$('.fscene', scenesEl); let si = -1, front = 0, paused = false, timer = 0;
function scene(i) { i = (i + SCENES.length) % SCENES.length; const s = SCENES[i], t = bySlug(s.slug); si = i;
  const v = vids[front = 1 - front], old = vids[1 - front];
  v.style.backgroundImage = 'url(' + P('poster/' + s.k + '.jpg') + ')'; v.poster = P('poster/' + s.k + '.jpg');
  if (!RM) { v.src = P('video/' + s.k + '-' + SIZE + '.mp4'); v.currentTime = 0; const pl = v.play(); if (pl && pl.catch) pl.catch(() => {}); }
  v.classList.add('is-on'); old.classList.remove('is-on'); setTimeout(() => { if (!old.classList.contains('is-on')) old.pause(); }, 900);
  tabs.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.style.setProperty('--p', 0); b.setAttribute('aria-selected', String(k === i)); });
  card.innerHTML = '<div><small>' + esc(s.t) + '</small><b>' + esc(s.h) + '</b><em>from ' + AED(t.price) + ' ' + t.unit + ' · pay on arrival</em></div><button class="btn btn--orange" data-book="' + s.slug + '">Book ' + ICO('arrow-right') + '</button>';
  card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
  clearTimeout(timer); if (RM) return; timer = setTimeout(function wait() { if (paused) { timer = setTimeout(wait, 400); return; } scene(si + 1); }, 6200); }
vids.forEach((v) => { v.addEventListener('timeupdate', () => { if (v === vids[front] && v.duration) tabs[si].style.setProperty('--p', Math.min(1, v.currentTime / v.duration).toFixed(3)); }); v.addEventListener('ended', () => { if (v === vids[front] && !paused) scene(si + 1); }); });
scenesEl.addEventListener('click', (e) => { const b = e.target.closest('[data-scene]'); if (b) scene(+b.dataset.scene); });
function setPaused(p, byUser) { paused = p; const v = vids[front]; if (p) v.pause(); else { const pl = v.play(); if (pl && pl.catch) pl.catch(() => {}); } if (byUser) { pp.innerHTML = ICO(p ? 'play' : 'pause'); pp.setAttribute('aria-label', p ? 'Play the film' : 'Pause the film'); pp.dataset.user = p ? '1' : ''; } }
pp.addEventListener('click', () => setPaused(!paused, true));
new IntersectionObserver((es) => { if (pp.dataset.user) return; setPaused(!es[0].isIntersecting); }, { threshold: 0.25 }).observe($('#frame'));
scene(0);

/* ---------- the four: panels that open ---------- */
const xp = $('#xp');
xp.innerHTML = OFFERS.map((o, i) => { const t = bySlug(o.slug); return '<article class="xp__item" data-xp="' + i + '" tabindex="0" aria-label="' + esc(o.name) + '"><img src="' + o.img + '" alt="' + esc(o.alt) + '" loading="lazy" draggable="false"><span class="xp__seal">' + esc(o.seal.join(' ')) + '</span><div class="xp__tab" aria-hidden="true"><small>' + pad(i + 1) + '</small><b>' + esc(o.name) + '</b></div><div class="xp__body"><p class="slide__meta">' + o.meta.map((m) => '<span>' + ICO(m[0]) + esc(m[1]) + '</span>').join('') + '</p><h3 class="xp__name">' + esc(o.name) + '</h3><p>' + esc(o.p) + '</p><div class="xp__buy"><div class="xp__price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</div><button class="btn btn--orange btn--chip" data-book="' + o.slug + '">Book now <i>' + ICO('arrow-right') + '</i></button></div></div><i class="xp__bar"></i></article>'; }).join('');
const items = $$('.xp__item', xp);
function openXp(i) { items.forEach((it, k) => { it.classList.toggle('is-on', k === i); it.style.setProperty('--p', 0); $('.xp__body', it).inert = k !== i; }); $('#xpCount').textContent = pad(i + 1) + ' / ' + pad(items.length); }
const xc = A.cycle(items.length, 6000, openXp); xc.onProgress = (p, i) => items[i].style.setProperty('--p', p.toFixed(3));
xp.addEventListener('click', (e) => { const it = e.target.closest('.xp__item'); if (it && !it.classList.contains('is-on')) xc.go(+it.dataset.xp); });
xp.addEventListener('keydown', (e) => { const it = e.target.closest('.xp__item'); if (!it) return; if ((e.key === 'Enter' || e.key === ' ') && e.target === it) { e.preventDefault(); xc.go(+it.dataset.xp); } });
let xHover = false, xSeen = false; const xSync = () => xc.pause(xHover || !xSeen || document.body.classList.contains('panel-open'));
xp.addEventListener('mouseenter', () => { xHover = true; xSync(); }); xp.addEventListener('mouseleave', () => { xHover = false; xSync(); });
new IntersectionObserver((es) => { xSeen = es[0].isIntersecting; xSync(); }, { threshold: 0.4 }).observe(xp);
openXp(0); xSync();

/* ---------- the evening: one picture, five moments ---------- */
const TL = A.TIMELINE, evePh = $('#evePh'), eveList = $('#eveList');
evePh.innerHTML = TL.map((s) => '<img src="' + s.img + '" alt="' + esc(s.h) + '" loading="lazy">').join('') + '<span class="eve__time">' + ICO('clock') + '<b id="eveTime"></b></span>';
eveList.innerHTML = TL.map((s, i) => '<li><button class="eve__step" data-eve="' + i + '"><small>' + s.t + '</small><b>' + esc(s.h) + '</b><span>' + esc(s.p) + '</span></button></li>').join('');
const eImgs = $$('img', evePh), eSteps = $$('.eve__step', eveList);
function eve(i) { eImgs.forEach((im, k) => im.classList.toggle('is-on', k === i)); eSteps.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.style.setProperty('--p', 0); b.setAttribute('aria-pressed', String(k === i)); }); $('#eveTime').textContent = TL[i].t; }
const ec = A.cycle(TL.length, 4200, eve); ec.onProgress = (p, i) => eSteps[i].style.setProperty('--p', p.toFixed(3));
eveList.addEventListener('click', (e) => { const b = e.target.closest('[data-eve]'); if (b) ec.go(+b.dataset.eve); });
let eHover = false, eSeen = false; const eSync = () => ec.pause(eHover || !eSeen || document.body.classList.contains('panel-open'));
$('#eve').addEventListener('mouseenter', () => { eHover = true; eSync(); }); $('#eve').addEventListener('mouseleave', () => { eHover = false; eSync(); });
new IntersectionObserver((es) => { eSeen = es[0].isIntersecting; eSync(); }, { threshold: 0.4 }).observe($('#eve'));
eve(0); eSync();
new MutationObserver(() => { xSync(); eSync(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
$('#included').innerHTML = A.INCLUDED.map((x) => '<li>' + esc(x) + '</li>').join('');

/* ---------- reviews: two rows that drift ---------- */
const rv = (r) => '<blockquote><span class="stars"></span><p>"' + esc(r.q) + '"</p><footer><i>' + esc(r.i) + '</i>' + esc(r.n) + '<span>· Google</span></footer></blockquote>';
const R = A.REVIEWS, row = (list) => { const once = list.map(rv).join(''); return once + once + once + once; };
$('#mq1').innerHTML = row(R); $('#mq2').innerHTML = row([R[2], R[3], R[0], R[1]]);

/* ---------- the rest ---------- */
A.mountBar($('#bar'), { compact: true });
A.mountCards({ chips: $('#chips'), cards: $('#cards'), more: $('#moreBtn'), count: $('#cardsCount'), per: 4 });
A.mountFaq($('#faq')); A.mountFoot($('#foot')); A.fill(); A.reveal(); A.stickyAfter($('#hero'));
const nav = $('#nav'); const onScroll = () => nav.classList.toggle('is-solid', scrollY > 30); addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
