/* Al Emirates Tours · Home V8 · page script. The booking engine is shared/core.js (window.AET).
   Hero slider, the four places, the panels that open, the evening, the review deck, the plan form,
   the side menu with quick booking, the language and currency sheet. */
(function () {
'use strict';
const A = window.AET, { $, $$, OFFERS, ICO, AED, esc, pad, bySlug, RM, P, TOURS, WA, waLink } = A;
const busy = () => document.body.classList.contains('panel-open') || document.body.classList.contains('menu-open');

/* ---------- small helpers ---------- */
const toastEl = $('#toast'); let toastT = 0;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3800); }
document.addEventListener('click', (e) => { const a = e.target.closest('[data-soon]'); if (a) { e.preventDefault(); toast(a.dataset.soon); } });
const money = (v, pre, post) => '<span data-aed="' + v + '"' + (pre ? ' data-pre="' + esc(pre) + '"' : '') + (post ? ' data-post="' + esc(post) + '"' : '') + '>' + esc(pre || '') + AED(v) + esc(post || '') + '</span>';

/* ---------- hero: four pictures, the words follow the picture ---------- */
const SLIDES = [
  { slug: 'desert-safari-dubai-in-99-aed', img: 'img/v8-hero-desert.jpg', pos: '42% 50%', name: 'Evening desert safari', h: 'Tonight you could be standing in these dunes.', p: 'Desert safaris, dhow cruises, city tours and tickets across the UAE. Pick a date, we collect you from your hotel, you pay the driver on arrival.' },
  { slug: 'dhow-cruise-marina', img: 'img/v8-hero-dhow.jpg', pos: '40% 50%', name: 'Dhow cruise, Dubai Marina', h: 'Tonight the Marina could slide past your table.', p: 'A lit wooden dhow through Dubai Marina, with dinner and live entertainment on board. Pick a date and pay on arrival.' },
  { slug: 'dubai-city-tour', img: 'img/v8-hero-dubai.jpg', pos: '50% 50%', name: 'Dubai city tour', h: 'Tomorrow, the whole city in half a day.', p: 'The famous landmarks, the historic quarter and the modern city, with a guide who knows the stories.' },
  { slug: 'book-abu-dhabi-city-tour', img: 'img/aet-o-abu-dhabi-city-tour.jpg', pos: '50% 50%', name: 'Abu Dhabi city tour', h: 'A full day in the capital, there and back from Dubai.', p: 'The Sheikh Zayed Grand Mosque, the BAPS Hindu Temple and the city sights, in one day by bus.' },
].filter((s) => bySlug(s.slug));
const hSlides = $('#heroSlides'), hDots = $('#heroDots'), hTx = $('#heroTx');
hSlides.innerHTML = SLIDES.map((s, i) => '<div class="rslide" style="--pos:' + s.pos + '"><img src="' + P(s.img) + '" alt=""' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + ' draggable="false"></div>').join('');
hDots.innerHTML = SLIDES.map((s, i) => '<button class="rdot" role="tab" data-slide="' + i + '" aria-label="' + esc(s.name) + '"><i></i></button>').join('');
const slideEls = $$('.rslide', hSlides), dotEls = $$('.rdot', hDots); let hi = -1;
function showSlide(i) { const first = hi < 0; hi = i; const s = SLIDES[i], t = bySlug(s.slug);
  slideEls.forEach((el, k) => el.classList.toggle('is-on', k === i));
  dotEls.forEach((el, k) => { el.classList.toggle('is-on', k === i); el.setAttribute('aria-selected', String(k === i)); });
  $('#heroH').textContent = s.h; $('#heroP').textContent = s.p;
  $('#heroFrom').innerHTML = money(t.price, 'from ');
  $('#heroBook').dataset.book = s.slug; $('#heroGo').dataset.book = s.slug;
  $('#heroNow').innerHTML = '<b>' + pad(i + 1) + ' / ' + pad(SLIDES.length) + '</b> · ' + esc(s.name) + '<span> · ' + AED(t.price) + '</span>';
  if (!first) { hTx.classList.remove('is-swap'); void hTx.offsetWidth; hTx.classList.add('is-swap'); } }
const hc = A.cycle(SLIDES.length, 6500, showSlide);
hDots.addEventListener('click', (e) => { const b = e.target.closest('[data-slide]'); if (b) hc.go(+b.dataset.slide); });
(function swipe() { const card = $('#heroCard'); let x0 = null, y0 = 0;
  card.addEventListener('pointerdown', (e) => { if (e.target.closest('button,a')) return; x0 = e.clientX; y0 = e.clientY; });
  card.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) hc.go(hi + (dx < 0 ? 1 : -1)); });
  card.addEventListener('pointercancel', () => { x0 = null; }); })();
let hSeen = true; const hSync = () => hc.pause(!hSeen || busy());
new IntersectionObserver((es) => { hSeen = es[0].isIntersecting; hSync(); }, { threshold: 0.35 }).observe($('#heroCard'));
showSlide(0);

/* ---------- the four places: Dubai, Abu Dhabi, Private, Airport ---------- */
const shown = TOURS.filter((t) => t.cat !== 'visa'), of = (k) => shown.filter((t) => A.inFilter(t, k)), low = (k) => Math.min.apply(null, of(k).map((t) => t.price));
const WORLDS = [
  { cls: ' world--big', k: 'dubai', img: 'img/v8-w-dubai.jpg', s: 'Dubai', b: 'Safaris, cruises, city tours and tickets.', em: money(low('dubai'), of('dubai').length + ' tours · from ') },
  { cls: ' world--wide', k: 'abudhabi', img: 'img/aet-o-abu-dhabi-city-tour.jpg', s: 'Abu Dhabi', b: 'The Grand Mosque and the capital in a day.', em: money(low('abudhabi'), of('abudhabi').length + ' tours · from ') },
  { cls: '', k: 'privatecar', img: 'img/v8-w-private.jpg', s: 'Private', b: 'Your own car and guide.', em: money(low('privatecar'), 'from ') },
  { cls: '', k: null, img: 'img/aet-cat-city.jpg', s: 'Airport', b: 'Transfers to and from the airport.', em: 'Price on WhatsApp' },
];
$('#bento').innerHTML = WORLDS.map((w) => '<a class="world' + w.cls + ' reveal" ' + (w.k ? 'href="#booked" data-filter="' + w.k + '"' : 'href="' + waLink('Hi, I need an airport transfer') + '" target="_blank" rel="noopener"') + '><img src="' + P(w.img) + '" alt="" loading="lazy"><i class="world__go">' + ICO(w.k ? 'arrow-right' : 'whatsapp') + '</i><span class="world__tx"><small>' + w.s + '</small><b>' + w.b + '</b><em>' + w.em + '</em></span></a>').join('');

/* ---------- four days out: panels that open ---------- */
const xp = $('#xp');
xp.innerHTML = OFFERS.map((o, i) => { const t = bySlug(o.slug); return '<article class="xp__item" data-xp="' + i + '" tabindex="0" aria-label="' + esc(o.name) + '"><img src="' + o.img + '" alt="' + esc(o.alt) + '" loading="lazy" draggable="false"><span class="xp__seal">' + esc(o.seal.join(' ')) + '</span><div class="xp__tab" aria-hidden="true"><small>' + pad(i + 1) + '</small><b>' + esc(o.name) + '</b></div><div class="xp__body"><p class="slide__meta">' + o.meta.map((m) => '<span>' + ICO(m[0]) + esc(m[1]) + '</span>').join('') + '</p><h3 class="xp__name">' + esc(o.name) + '</h3><p>' + esc(o.p) + '</p><div class="xp__buy"><div class="xp__price"><small>from, ' + t.unit + '</small><b>' + money(t.price) + '</b>' + (t.old ? '<s>' + money(t.old) + '</s>' : '') + '</div><button class="btn btn--orange btn--chip" data-book="' + o.slug + '">Book now <i>' + ICO('arrow-right') + '</i></button></div></div><i class="xp__bar"></i></article>'; }).join('');
const items = $$('.xp__item', xp);
function openXp(i) { items.forEach((it, k) => { it.classList.toggle('is-on', k === i); it.style.setProperty('--p', 0); $('.xp__body', it).inert = k !== i; }); $('#xpCount').textContent = pad(i + 1) + ' / ' + pad(items.length); }
const xc = A.cycle(items.length, 6000, openXp); xc.onProgress = (p, i) => items[i].style.setProperty('--p', p.toFixed(3));
xp.addEventListener('click', (e) => { const it = e.target.closest('.xp__item'); if (it && !it.classList.contains('is-on')) xc.go(+it.dataset.xp); });
xp.addEventListener('keydown', (e) => { const it = e.target.closest('.xp__item'); if (!it) return; if ((e.key === 'Enter' || e.key === ' ') && e.target === it) { e.preventDefault(); xc.go(+it.dataset.xp); } });
let xHover = false, xSeen = false; const xSync = () => xc.pause(xHover || !xSeen || busy());
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
let eHover = false, eSeen = false; const eSync = () => ec.pause(eHover || !eSeen || busy());
$('#eve').addEventListener('mouseenter', () => { eHover = true; eSync(); }); $('#eve').addEventListener('mouseleave', () => { eHover = false; eSync(); });
new IntersectionObserver((es) => { eSeen = es[0].isIntersecting; eSync(); }, { threshold: 0.4 }).observe($('#eve'));
eve(0); eSync();
$('#included').innerHTML = A.INCLUDED.map((x) => '<li>' + esc(x) + '</li>').join('');

/* ---------- reviews: a deck you flip ---------- */
const deck = $('#deck'), R = A.REVIEWS; let top = 0;
deck.innerHTML = R.map((r) => '<blockquote>' + ICO('quote') + '<p>"' + esc(r.q) + '"</p><footer><i>' + esc(r.i) + '</i>' + esc(r.n) + '<span>· Google</span></footer></blockquote>').join('') + '<span class="deck__hint">Tap the card for the next review ' + ICO('arrow-right') + '</span>';
const dcards = $$('blockquote', deck);
function lay() { dcards.forEach((c, k) => { const d = ((k - top) % R.length + R.length) % R.length; c.style.zIndex = String(R.length - d); c.style.transform = 'translateY(' + d * 14 + 'px) scale(' + (1 - d * 0.045) + ') rotate(' + (d === 0 ? 0 : d % 2 ? 1.6 : -1.6) + 'deg)'; c.style.opacity = d > 2 ? '0' : '1'; c.setAttribute('aria-hidden', String(d !== 0)); }); }
function flip() { const c = dcards[top]; c.style.transform = 'translateX(60%) rotate(14deg)'; c.style.opacity = '0'; top = (top + 1) % R.length; setTimeout(lay, RM ? 0 : 260); }
deck.addEventListener('click', flip); lay();
let dSeen = false; new IntersectionObserver((es) => { dSeen = es[0].isIntersecting; }, { threshold: 0.5 }).observe(deck);
if (!RM) setInterval(() => { if (dSeen && !deck.matches(':hover') && !busy()) flip(); }, 5200);

/* ---------- plan it for me: name, WhatsApp number, message; WhatsApp or e-mail ---------- */
(function () { const chat = $('#chat'); let done = false; const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const type = (el, text, ms) => new Promise((res) => { el.classList.add('is-in'); el.innerHTML = '<span></span><i class="cursor"></i>'; const sp = el.firstChild; let i = 0; const t = setInterval(() => { sp.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(t); el.textContent = text; res(); } }, ms); });
  new IntersectionObserver(async (es, ob) => { if (!es[0].isIntersecting || done) return; done = true; ob.disconnect(); const m = $$('.msg', chat);
    if (RM) { m.forEach((x) => { x.textContent = x.dataset.typed; x.classList.add('is-in'); }); return; }
    await wait(400); await type(m[0], m[0].dataset.typed, 26); await wait(800); await type(m[1], m[1].dataset.typed, 15); await wait(600); m[2].textContent = m[2].dataset.typed; m[2].classList.add('is-in'); }, { threshold: 0.4 }).observe(chat); })();
const pName = $('#planName'), pTel = $('#planTel'), pMsg = $('#planMsg'), pNote = $('#planNote');
function planData() { const name = pName.value.trim(), tel = pTel.value.trim(), msg = pMsg.value.trim(); const okN = name.length >= 2, okT = (tel.match(/\d/g) || []).length >= 7;
  pName.classList.toggle('is-bad', !okN); pTel.classList.toggle('is-bad', !okT);
  if (!okN) { pNote.textContent = 'Add your name so we know who to answer.'; pName.focus(); return null; }
  if (!okT) { pNote.textContent = 'Add your WhatsApp number so we can reply.'; pTel.focus(); return null; }
  return { name, tel, text: 'Hi, I am ' + name + '.\n' + (msg || 'I would like help planning a day in Dubai.') + '\nMy WhatsApp number: ' + tel }; }
$('#planWa').addEventListener('click', () => { const d = planData(); if (!d) return; window.open(waLink(d.text), '_blank', 'noopener'); pNote.innerHTML = 'WhatsApp opened with your message: press send there. <a href="' + waLink(d.text) + '" target="_blank" rel="noopener">Open it again</a>'; });
$('#planMail').addEventListener('click', () => { const d = planData(); if (!d) return; const href = 'mailto:info@alemiratestours.com?subject=' + encodeURIComponent('Plan request from ' + d.name) + '&body=' + encodeURIComponent(d.text); location.href = href; pNote.innerHTML = 'Your e-mail app opened with the message: press send there. <a href="' + href + '">Open it again</a>'; });
[pName, pTel].forEach((el) => el.addEventListener('input', () => el.classList.remove('is-bad')));

/* ---------- the shared pieces ---------- */
A.mountBar($('#bar'));
A.mountCards({ chips: $('#chips'), cards: $('#cards'), more: $('#moreBtn'), count: $('#cardsCount'), per: 8 });
A.mountFaq($('#faq')); A.mountFoot($('#foot'));
// footer lists: open as columns on a wide screen, drop-downs (one open at a time) on a phone
(function () { const groups = $$('.fgrp'), wide = matchMedia('(min-width:901px)'); const sync = () => groups.forEach((g) => { g.open = wide.matches; }); wide.addEventListener('change', sync); sync();
  groups.forEach((g) => g.addEventListener('toggle', () => { if (g.open && !wide.matches) groups.forEach((o) => { if (o !== g) o.open = false; }); })); })();

/* ---------- side menu, with quick booking ---------- */
const drawer = $('#drawer'), dScrim = $('#dScrim'), menuBtn = $('#menuBtn'); let dLast = null;
const DCARDS = [['safari', 'Desert Safari', 'img/aet-o-desert-safari.jpg'], ['cruise', 'Dhow Cruises', 'img/aet-o-dhow-cruise.jpg'], ['private', 'City Tours', 'img/aet-o-dubai-city-tour.jpg'], ['abudhabi', 'Abu Dhabi', 'img/aet-o-abu-dhabi-city-tour.jpg']];
$('#dGrid').innerHTML = DCARDS.map(([k, l, img]) => '<a class="dcard" href="#booked" data-filter="' + k + '"><img src="' + P(img) + '" alt="" loading="lazy"><b>' + l + '</b><small>' + money(low(k), 'from ') + '</small></a>').join('');
$('#dSocial').innerHTML = A.socialHTML();
function openDrawer() { dLast = document.activeElement; drawer.hidden = false; dScrim.hidden = false; requestAnimationFrame(() => { drawer.classList.add('is-on'); dScrim.classList.add('is-on'); document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); syncAll(); }); $('#dClose').focus(); }
function closeDrawer() { if (drawer.hidden) return; drawer.classList.remove('is-on'); if (sheet.hidden) dScrim.classList.remove('is-on'); document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); setTimeout(() => { drawer.hidden = true; if (sheet.hidden) dScrim.hidden = true; }, 450); if (dLast && dLast.focus) dLast.focus(); syncAll(); }
menuBtn.addEventListener('click', openDrawer); $('#dClose').addEventListener('click', closeDrawer);
drawer.addEventListener('click', (e) => { if (e.target.closest('a[href]')) closeDrawer(); });
// quick booking: experience, date, guests, then the reserve panel
const qbTour = $('#qbTour'), qbDate = $('#qbDate'), qbGuests = $('#qbGuests');
function fillQb() { const cur = qbTour.value || A.S.slug; qbTour.innerHTML = A.CATS.map(([k, l]) => '<optgroup label="' + l + '">' + TOURS.filter((t) => t.cat === k).map((t) => '<option value="' + t.slug + '">' + esc(A.nameOf(t)) + ' · ' + AED(t.price) + '</option>').join('') + '</optgroup>').join(''); qbTour.value = cur; }
fillQb(); qbDate.min = A.iso(A.addDays(0)); qbDate.value = A.iso(A.S.date);
qbGuests.innerHTML = Array.from({ length: 12 }, (_, i) => '<option value="' + (i + 1) + '"' + (i === 1 ? ' selected' : '') + '>' + (i + 1) + (i ? ' guests' : ' guest') + '</option>').join('');
$('#qbGo').addEventListener('click', () => { const t = bySlug(qbTour.value); if (!t) return; const p = (qbDate.value || A.iso(A.addDays(0))).split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]);
  A.set({ slug: t.slug, tab: t.cat, date: d >= A.addDays(0) ? d : A.addDays(0), adults: +qbGuests.value, children: 0 }); closeDrawer(); setTimeout(() => A.openPanel(), 80); });

/* ---------- language and currency ---------- */
const sheet = $('#sheet'); let sLast = null;
const LANGS = [['EN', 'English', 'English'], ['AR', 'العربية', 'Arabic'], ['RU', 'Русский', 'Russian'], ['DE', 'Deutsch', 'German'], ['FR', 'Français', 'French'], ['ZH', '中文', 'Chinese']];
$('#langGrid').innerHTML = LANGS.map(([c, n, e], i) => '<button type="button" class="lopt' + (i === 0 ? ' is-on' : '') + '" data-lang="' + c + '"' + (c === 'AR' ? ' dir="ltr"' : '') + '><i>' + c + '</i><span><b>' + n + '</b><small>' + e + '</small></span></button>').join('');
function fillCur() { $('#curGrid').innerHTML = Object.keys(A.CURS).map((c) => '<button type="button" class="lopt' + (c === A.cur ? ' is-on' : '') + '" data-cur="' + c + '"><i>' + (c === 'AED' ? 'AED' : A.CURS[c].sign) + '</i><span><b>' + c + '</b><small>' + A.CURS[c].name + '</small></span></button>').join('');
  $('#curCode').textContent = A.cur; $('#dCur').textContent = A.cur; $('#dCurName').textContent = A.CURS[A.cur].name; }
fillCur();
function openSheet() { sLast = document.activeElement; sheet.hidden = false; dScrim.hidden = false; requestAnimationFrame(() => { sheet.classList.add('is-on'); dScrim.classList.add('is-on', 'is-top'); }); $('#sClose').focus(); }
function closeSheet() { if (sheet.hidden) return; sheet.classList.remove('is-on'); dScrim.classList.remove('is-top'); if (drawer.hidden) dScrim.classList.remove('is-on'); setTimeout(() => { sheet.hidden = true; if (drawer.hidden) dScrim.hidden = true; }, 380); if (sLast && sLast.focus) sLast.focus(); }
$('#curBtn').addEventListener('click', openSheet); $('#sClose').addEventListener('click', closeSheet);
document.addEventListener('click', (e) => { if (e.target.closest('[data-sheet]')) openSheet(); });
dScrim.addEventListener('click', () => { if (!sheet.hidden) closeSheet(); else closeDrawer(); });
$('#curGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-cur]'); if (b) A.setCurrency(b.dataset.cur); });
$('#langGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (!b) return; const note = $('#langNote'); if (b.dataset.lang === 'EN') { note.hidden = true; return; } note.hidden = false; note.textContent = 'This preview is in English only. ' + $('small', b).textContent + ' and the other languages are switched on in the full website.'; });
A.onCurrency(() => { fillCur(); fillQb(); showSlide(hi); });
document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!sheet.hidden) closeSheet(); else if (!drawer.hidden) closeDrawer(); });

/* ---------- the rest ---------- */
function syncAll() { hSync(); xSync(); eSync(); }
new MutationObserver(syncAll).observe(document.body, { attributes: true, attributeFilter: ['class'] });
A.fill(); A.reveal(); A.paint(); A.stickyAfter($('#hero'));
const nav = $('#nav'); const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40); addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
