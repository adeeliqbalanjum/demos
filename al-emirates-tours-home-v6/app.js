/* Al Emirates Tours · Home V6 · the V5 booking page under the V4 scroll film.
   One shared booking state (tour, date, guests, pickup) drives the booking bar, the sticky bar and the reserve panel.
   The film scenes, the four-tour slider and every card open that same panel.
   Nothing is sent anywhere: "Reserve" ends on a confirmation screen with a prefilled WhatsApp link. */
(function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = 'https://wa.me/971581320909';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
// the client's own photos for three tours that had none in the V5 data
const IMG = { 'dhow-cruise-marina': 'img/aet-o-dhow-cruise.jpg', 'dubai-city-tour': 'img/aet-o-dubai-city-tour.jpg', 'book-abu-dhabi-city-tour': 'img/aet-o-abu-dhabi-city-tour.jpg' };
const TOURS = (window.AET_TOURS || []).map((t) => Object.assign({}, t, { unit: t.cat === 'private' && !/private-city-tour/.test(t.slug) ? 'per person' : t.unit, img: t.img || IMG[t.slug] || null }));
const bySlug = (s) => TOURS.find((t) => t.slug === s);
const CATS = [['safari', 'Desert safari'], ['cruise', 'Cruises & yachts'], ['tickets', 'Tickets & parks'], ['private', 'City & private tours'], ['visa', 'Visas']];
const SHORT = { 'desert-safari-dubai-in-99-aed': 'Evening Desert Safari' };
const nameOf = (t) => SHORT[t.slug] || t.name;
const AED = (v) => 'AED ' + (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2));
const ICO = (n) => '<svg class="i" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
const STARS = ICO('star').repeat(5);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
$$('.stars').forEach((el) => { el.innerHTML = STARS; });

/* ---------- dates ---------- */
const day0 = new Date(); day0.setHours(0, 0, 0, 0);
const addDays = (n) => { const d = new Date(day0); d.setDate(d.getDate() + n); return d; };
const diffDays = (d) => Math.round((d - day0) / 864e5);
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dShort = (d) => WD[d.getDay()] + ', ' + d.getDate() + ' ' + MO[d.getMonth()];
const dWord = (d) => { const n = diffDays(d); return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : dShort(d); };
const dSay = (d) => { const n = diffDays(d); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : 'on ' + WDL[d.getDay()] + ', ' + d.getDate() + ' ' + MO[d.getMonth()]; };
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/* ---------- state ---------- */
const S = { slug: 'desert-safari-dubai-in-99-aed', tab: 'safari', date: addDays(0), adults: 2, children: 0, pickup: '', addon: false, filter: 'all', shown: 8 };
const tour = () => bySlug(S.slug) || TOURS[0];
const guests = () => S.adults + S.children;
const gWord = () => guests() + (guests() === 1 ? ' guest' : ' guests');
const gSplit = () => S.adults + (S.adults === 1 ? ' adult' : ' adults') + (S.children ? ' · ' + S.children + (S.children === 1 ? ' child' : ' children') : '');
const perPerson = () => tour().unit === 'per person';
const total = () => tour().price * (perPerson() ? guests() : 1) + (S.addon && tour().cat === 'safari' ? 150 : 0);
const set = (patch) => { Object.assign(S, patch); if (tour().cat !== 'safari') S.addon = false; render(); };

/* ---------- booking bar ---------- */
const tabsEl = $('#tabs'), popExp = $('#popExp'), popDate = $('#popDate'), popGuests = $('#popGuests');
tabsEl.innerHTML = CATS.map(([k, l]) => '<button type="button" class="tab" role="tab" data-tab="' + k + '">' + l + ' <small>' + TOURS.filter((t) => t.cat === k).length + '</small></button>').join('');
tabsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; const k = b.dataset.tab; const first = TOURS.filter((t) => t.cat === k)[0]; set({ tab: k, slug: first ? first.slug : S.slug }); openPop('exp'); });
function renderExp() { popExp.innerHTML = TOURS.filter((t) => t.cat === S.tab).map((t) => '<button type="button" class="opt' + (t.slug === S.slug ? ' is-on' : '') + '" role="option" data-slug="' + t.slug + '"><span>' + esc(nameOf(t)) + '<small>' + [t.dur, t.dest].filter(Boolean).join(' · ') + '</small></span><i>' + AED(t.price) + '</i></button>').join(''); }
popExp.addEventListener('click', (e) => { const b = e.target.closest('[data-slug]'); if (!b) return; set({ slug: b.dataset.slug }); closePops(); });
function renderDate() {
  let h = '<h4>Next two weeks</h4><div class="days">';
  for (let i = 0; i < 14; i++) { const d = addDays(i); h += '<button type="button" class="day' + (diffDays(S.date) === i ? ' is-on' : '') + '" data-day="' + i + '"><small>' + (i === 0 ? 'Today' : WD[d.getDay()]) + '</small><b>' + d.getDate() + '</b></button>'; }
  h += '</div><label class="pop__other">Another date <input type="date" id="dateOther" min="' + iso(day0) + '" value="' + iso(S.date) + '"></label>';
  popDate.innerHTML = h;
}
popDate.addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (!b) return; set({ date: addDays(+b.dataset.day) }); closePops(); });
popDate.addEventListener('change', (e) => { if (e.target.id !== 'dateOther' || !e.target.value) return; const p = e.target.value.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]); if (d >= day0) { set({ date: d }); closePops(); } });
function stepperHTML(key, label) { return '<div class="stepper"><span><b>' + label + '</b></span><span class="ctl"><button type="button" data-step="' + key + '" data-by="-1" aria-label="Fewer ' + label.toLowerCase() + '">' + ICO('minus') + '</button><b>' + S[key] + '</b><button type="button" class="plus" data-step="' + key + '" data-by="1" aria-label="More ' + label.toLowerCase() + '">' + ICO('plus') + '</button></span></div>'; }
function renderGuests() { popGuests.innerHTML = '<h4>Who is coming</h4>' + stepperHTML('adults', 'Adults') + stepperHTML('children', 'Children'); }
document.addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (!b) return; e.stopPropagation(); const k = b.dataset.step, v = S[k] + (+b.dataset.by); const min = k === 'adults' ? 1 : 0; if (v < min || v > 20) return; set({ [k]: v }); bump(); });
const fields = $$('.field[data-pop]');
function openPop(k) { fields.forEach((f) => f.classList.toggle('is-open', f.dataset.pop === k)); $('#book').classList.add('is-picking'); }
function closePops() { fields.forEach((f) => f.classList.remove('is-open')); $('#book').classList.remove('is-picking'); }
fields.forEach((f) => $('.field__btn', f).addEventListener('click', (e) => { e.stopPropagation(); f.classList.contains('is-open') ? closePops() : openPop(f.dataset.pop); }));
document.addEventListener('click', (e) => { if (!e.target.closest('.pop') && !e.target.closest('.field__btn') && !e.target.closest('[data-tab]')) closePops(); });
$('#fPickup').addEventListener('input', (e) => { S.pickup = e.target.value; $('#pPickup').value = S.pickup; renderSticky(); });
$('#barGo').addEventListener('click', () => openPanel());

/* ---------- cards ---------- */
const FEATURED = ['desert-safari-dubai-in-99-aed', 'dhow-cruise-marina', 'dubai-city-tour', 'burj-khalifa-at-the-top-tickets', 'book-abu-dhabi-city-tour', 'dinner-dhow-cruise-canal', 'desert-safari-with-falcon-photo', 'museum-of-the-future-tickets', 'overnight-desert-safari', '5-star-mega-yacht-dinner-cruise', 'private-city-tour-by-fortuner'];
const ORDER = FEATURED.map(bySlug).filter(Boolean).concat(TOURS.filter((t) => !FEATURED.includes(t.slug) && t.cat !== 'visa'));
const FILTERS = [['all', 'All'], ['safari', 'Desert safari'], ['cruise', 'Cruises'], ['private', 'City tours'], ['tickets', 'Tickets'], ['u150', 'Under AED 150']];
const chipsEl = $('#chips'), cardsEl = $('#cards');
chipsEl.innerHTML = FILTERS.map(([k, l]) => '<button class="chip" role="tab" data-chip="' + k + '">' + l + '</button>').join('');
chipsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-chip]'); if (b) setFilter(b.dataset.chip); });
function setFilter(k) { S.filter = FILTERS.some((f) => f[0] === k) ? k : 'all'; S.shown = 8; renderCards(); cardsEl.scrollLeft = 0; }
let saved = []; try { saved = JSON.parse(localStorage.getItem('aet-saved') || '[]'); } catch (e) {}
function renderCards() {
  $$('.chip', chipsEl).forEach((c) => c.classList.toggle('is-on', c.dataset.chip === S.filter));
  const list = ORDER.filter((t) => S.filter === 'all' ? true : S.filter === 'u150' ? t.price < 150 && t.unit === 'per person' : t.cat === S.filter);
  cardsEl.innerHTML = list.slice(0, S.shown).map((t, i) => '<article class="card" style="--i:' + (i % 8) + '"><div class="card__ph">' + (t.img ? '<img src="' + t.img + '" alt="' + esc(t.name) + '" loading="lazy">' : '<span class="ph-label">' + esc(t.name) + '</span>') + (t.save ? '<span class="tag">Save ' + t.save + '%</span>' : '') + '<button class="heart' + (saved.includes(t.slug) ? ' is-on' : '') + '" data-save="' + t.slug + '" aria-label="Save ' + esc(t.name) + '">' + ICO('heart') + '</button></div><div class="card__body"><p class="card__meta">' + esc(t.dest) + (t.dur ? ' · ' + t.dur : '') + '</p><h3 class="card__name">' + esc(t.name) + '</h3><p class="card__rate"><span class="stars">' + STARS + '</span> ' + t.rating + ' (' + t.reviews + ')' + (t.cat === 'safari' || t.cat === 'cruise' ? ' <em>· Hotel pickup</em>' : '') + '</p><div class="card__foot"><p class="price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</p><span class="card__acts"><a class="wa" href="' + WA + '?text=' + encodeURIComponent('Hi, I am interested in ' + t.name) + '" target="_blank" rel="noopener" aria-label="Ask about ' + esc(t.name) + ' on WhatsApp">' + ICO('whatsapp') + '</a><button class="btn btn--navy" data-book="' + t.slug + '">Book</button></span></div></div></article>').join('');
  const more = list.length - Math.min(S.shown, list.length); $('#moreBtn').hidden = more <= 0; $('#cardsCount').textContent = 'Showing ' + Math.min(S.shown, list.length) + ' of ' + list.length;
}
$('#moreBtn').addEventListener('click', () => { S.shown += 8; renderCards(); });
cardsEl.addEventListener('click', (e) => { const h = e.target.closest('[data-save]'); if (!h) return; const s = h.dataset.save; saved = saved.includes(s) ? saved.filter((x) => x !== s) : saved.concat(s); try { localStorage.setItem('aet-saved', JSON.stringify(saved)); } catch (err) {} h.classList.toggle('is-on', saved.includes(s)); });
document.addEventListener('click', (e) => { const a = e.target.closest('[data-filter]'); if (a) setFilter(a.dataset.filter); });

/* ---------- reserve panel ---------- */
const panel = $('#panel'), scrim = $('#scrim'), sticky = $('#sticky'); let lastFocus = null;
function openPanel(slug) { if (slug && bySlug(slug)) { const t = bySlug(slug); set({ slug, tab: t.cat }); } closePops(); lastFocus = document.activeElement; $('#pBody').hidden = false; $('#pDone').hidden = true; panel.hidden = false; scrim.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => { panel.classList.add('is-on'); scrim.classList.add('is-on'); syncBars(); }); $('#pClose').focus(); }
function closePanel() { panel.classList.remove('is-on'); scrim.classList.remove('is-on'); document.body.style.overflow = ''; setTimeout(() => { panel.hidden = true; scrim.hidden = true; }, 450); if (lastFocus && lastFocus.focus) lastFocus.focus(); syncBars(); }
document.addEventListener('click', (e) => { const b = e.target.closest('[data-book]'); if (!b) return; e.preventDefault(); openPanel(b.dataset.book || null); });
$('#pClose').addEventListener('click', closePanel); scrim.addEventListener('click', closePanel);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!panel.hidden) closePanel(); else closePops(); } });
const pDates = $('#pDates');
function renderPanelDates() {
  const n = diffDays(S.date), third = n > 1 ? S.date : addDays(2);
  const opts = [addDays(0), addDays(1), third];
  pDates.innerHTML = opts.map((d) => '<button type="button" class="dchip' + (diffDays(d) === n ? ' is-on' : '') + '" data-pday="' + diffDays(d) + '"><small>' + (diffDays(d) === 0 ? 'Today' : diffDays(d) === 1 ? 'Tmrw' : WD[d.getDay()]) + '</small><b>' + d.getDate() + ' ' + MO[d.getMonth()] + '</b></button>').join('') + '<label class="dchip dchip--pick"><small>Other</small><b>' + ICO('calendar-days') + ' Pick</b><input type="date" id="pDateOther" min="' + iso(day0) + '" aria-label="Pick another date"></label>';
}
pDates.addEventListener('click', (e) => { const b = e.target.closest('[data-pday]'); if (b) set({ date: addDays(+b.dataset.pday) }); });
pDates.addEventListener('change', (e) => { if (e.target.id !== 'pDateOther' || !e.target.value) return; const p = e.target.value.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]); if (d >= day0) set({ date: d }); });
$('#pAddon').addEventListener('change', (e) => { set({ addon: e.target.checked }); bump(); });
$('#pPickup').addEventListener('input', (e) => { S.pickup = e.target.value; $('#fPickup').value = S.pickup; renderSticky(); });
function bump() { const b = $('#pTotal'); b.classList.add('bump'); setTimeout(() => b.classList.remove('bump'), 200); }
$('#pGo').addEventListener('click', () => {
  const tel = $('#pTel'); const ok = (tel.value.match(/\d/g) || []).length >= 7; tel.classList.toggle('is-bad', !ok); if (!ok) { tel.focus(); tel.placeholder = 'Your WhatsApp number, so we can confirm'; return; }
  const t = tour(); const lines = [nameOf(t), dShort(S.date) + (t.cat === 'safari' ? ' · pickup 3:00 to 3:30 PM' : ''), gWord() + ' (' + gSplit() + ')' + (S.addon ? ' + quad bike' : ''), S.pickup ? 'Pickup: ' + S.pickup : 'Pickup place: we ask on WhatsApp', AED(total()) + ', pay on arrival'];
  $('#dDay').textContent = dSay(S.date); $('#dSum').innerHTML = lines.map(esc).join('<br>');
  $('#dWa').href = WA + '?text=' + encodeURIComponent('Hi, I would like to reserve:\n' + lines.join('\n'));
  $('#pBody').hidden = true; $('#pDone').hidden = false; $('#pDone').scrollTop = 0;
});
$('#dAgain').addEventListener('click', () => { closePanel(); $('#booked').scrollIntoView(); });

/* ---------- the film: the scroll is the playhead ---------- */
const journey = $('#journey'), nav = $('#nav'), whiteout = $('#whiteout'), cue = $('#scrollcue'), filmbar = $('#filmbar'), footEl = $('.foot');
const F = window.AETFilm || null;
const scenes = $$('.scene').map((el) => ({ el, a: +el.dataset.a, b: +el.dataset.b }));
const dots = $$('#dots button').map((el) => ({ el, from: +el.dataset.from }));
const span = () => journey.offsetHeight - innerHeight;
const progress = () => clamp((scrollY - journey.offsetTop) / span(), 0, 1);
const goTo = (t, smooth) => scrollTo({ top: journey.offsetTop + t * span() + 2, behavior: smooth && !RM ? 'smooth' : 'instant' });
const FADE = 0.03;
function paint(t) {
  scenes.forEach((p) => { const k = Math.min(sstep(p.a, p.a + FADE, t), 1 - sstep(p.b - FADE, p.b, t)); const on = k > 0.001;
    if (on !== p.on) { p.on = on; p.el.classList.toggle('is-on', on); p.el.inert = !on; }
    if (on) { p.el.style.opacity = k.toFixed(3); p.el.style.transform = 'translateY(' + ((1 - k) * (t < (p.a + p.b) / 2 ? 40 : -40)).toFixed(1) + 'px)'; } else if (p.el.style.opacity !== '0') p.el.style.opacity = '0'; });
  let idx = 0; dots.forEach((b, i) => { if (t >= b.from) idx = i; }); dots.forEach((b, i) => b.el.classList.toggle('is-on', i === idx));
  whiteout.style.opacity = sstep(0.965, 0.999, t).toFixed(3);
  cue.style.opacity = t > 0.02 ? '0' : '0.9';
}
if (F) F.onFrame(paint);
/* bars: the film bar (phones) while the film plays, the booking bar after it */
function syncBars() {
  const end = journey.offsetTop + span(), open = panel.classList.contains('is-on');
  nav.classList.toggle('is-solid', scrollY > end + innerHeight * 0.5);
  const gone = scrollY > journey.offsetTop + journey.offsetHeight + 40; if (F) F.pause(gone); document.body.classList.toggle('past-film', gone);
  filmbar.classList.toggle('is-off', scrollY > end + innerHeight * 0.3 || open);
  const on = journey.getBoundingClientRect().bottom < 80 && footEl.getBoundingClientRect().top > innerHeight * 0.6 && !open;
  sticky.classList.toggle('is-on', on); sticky.setAttribute('aria-hidden', String(!on)); sticky.inert = !on;
}
function onScroll() { const p = progress(); if (F) F.set(p); else paint(p); syncBars(); }
addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
$$('[data-go]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); goTo(+el.dataset.go, true); }));
function renderSticky() { const t = tour(); $('#stName').textContent = nameOf(t); $('#stSub').textContent = dWord(S.date) + ' · ' + gWord() + (S.pickup ? ' · pickup ' + S.pickup : ''); $('#stTotal').textContent = AED(total()); const im = $('#stImg'); if (t.img) { im.src = t.img; im.style.display = ''; } else im.style.display = 'none'; }
/* loader; ?t=0.5 jumps straight to that moment of the film (for checks) */
const qt = new URLSearchParams(location.search).get('t'); let started = false;
function start() { if (started) return; started = true; if (qt !== null) { goTo(+qt, false); if (F) F.jump(+qt); } onScroll(); paint(F ? F.t : progress()); setTimeout(() => $('#loader').classList.add('is-done'), qt !== null ? 0 : 1500); }
if (document.readyState === 'complete') start(); else addEventListener('load', start); setTimeout(start, 3500);

/* ---------- the four-tour slider ---------- */
(function offers() {
  const sec = $('#offers'), view = $('#offView'), track = $('#offTrack'), tabsBox = $('#offTabs'), count = $('#offCount');
  const OFFERS = [
    { slug: 'desert-safari-dubai-in-99-aed', name: 'Desert Safari', img: 'img/aet-o-desert-safari.jpg', alt: 'Land Cruiser on the red dunes', meta: [['clock', '6 hours'], ['map-pin', 'Hotel pickup in Dubai']], seal: ['Save', '34%'],
      p: 'Dune bashing, sandboarding and a camel ride, then a BBQ dinner and live shows at the camp. We collect you from your hotel.' },
    { slug: 'dhow-cruise-marina', name: 'Dhow Cruise', img: 'img/aet-o-dhow-cruise.jpg', alt: 'A lit wooden dhow at night', meta: [['clock', '3 hours'], ['map-pin', 'Dubai Marina']], seal: ['Dinner', 'included'],
      p: 'A lit wooden dhow through Dubai Marina, with dinner and live entertainment on board while the skyline slides past.' },
    { slug: 'dubai-city-tour', name: 'Dubai City Tour', img: 'img/aet-o-dubai-city-tour.jpg', alt: 'Burj Khalifa and Downtown Dubai', meta: [['clock', '6 hours'], ['users', 'With a guide']], seal: ['Guide', 'included'],
      p: 'The famous landmarks, the historic quarter and the modern city in half a day, with a guide who knows the stories.' },
    { slug: 'book-abu-dhabi-city-tour', name: 'Abu Dhabi City Tour', img: 'img/aet-o-abu-dhabi-city-tour.jpg', alt: 'Etihad Towers, Abu Dhabi', meta: [['clock', '10 hours'], ['map-pin', 'From Dubai, by bus']], seal: ['Full day', 'from Dubai'],
      p: 'A full day in the capital from Dubai: the Sheikh Zayed Grand Mosque, the BAPS Hindu Temple and the city sights.' },
  ].filter((o) => bySlug(o.slug));
  const pad = (n) => String(n).padStart(2, '0');
  track.innerHTML = OFFERS.map((o) => { const t = bySlug(o.slug); return '<article class="slide" role="tabpanel" aria-label="' + esc(o.name) + '"><div class="slide__tx"><p class="slide__meta">' + o.meta.map((m) => '<span>' + ICO(m[0]) + esc(m[1]) + '</span>').join('') + '</p><h3 class="slide__name">' + esc(o.name) + '</h3><p class="slide__p">' + esc(o.p) + '</p><p class="slide__price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</p><div class="slide__acts"><button class="btn btn--orange btn--chip" data-book="' + o.slug + '">Book now <i>' + ICO('arrow-right') + '</i></button><a class="btn btn--waline" href="' + WA + '?text=' + encodeURIComponent('Hi, I am interested in the ' + o.name) + '" target="_blank" rel="noopener">' + ICO('whatsapp') + ' Ask on WhatsApp</a></div></div><div class="slide__ph"><figure><img src="' + o.img + '" alt="' + esc(o.alt) + '" loading="lazy" draggable="false"></figure><span class="seal"><span>' + esc(o.seal[0]) + '<b>' + esc(o.seal[1]) + '</b></span></span></div></article>'; }).join('');
  tabsBox.innerHTML = OFFERS.map((o, i) => '<button class="otab" role="tab" data-off="' + i + '"><small>' + pad(i + 1) + '</small>' + esc(o.name) + '<i></i></button>').join('');
  const slides = $$('.slide', track), tabs = $$('.otab', tabsBox); let idx = 0, drag = null, moved = 0, hover = false, focus = false, seen = false;
  const setPause = () => sec.classList.toggle('is-paused', hover || focus || !seen || !!drag || panel.classList.contains('is-on'));
  function go(i) { idx = (i + slides.length) % slides.length; track.style.transform = 'translateX(' + (-idx * 100) + '%)';
    slides.forEach((s, k) => { s.classList.toggle('is-on', k === idx); s.inert = k !== idx; });
    tabs.forEach((b, k) => { b.classList.remove('is-on'); b.setAttribute('aria-selected', String(k === idx)); }); void tabsBox.offsetWidth; tabs[idx].classList.add('is-on');
    if (tabsBox.scrollWidth > tabsBox.clientWidth) tabsBox.scrollTo({ left: tabs[idx].offsetLeft - (tabsBox.clientWidth - tabs[idx].offsetWidth) / 2, behavior: RM ? 'instant' : 'smooth' });
    count.textContent = pad(idx + 1) + ' / ' + pad(slides.length); }
  tabsBox.addEventListener('click', (e) => { const b = e.target.closest('[data-off]'); if (b) go(+b.dataset.off); });
  $('#offPrev').addEventListener('click', () => go(idx - 1)); $('#offNext').addEventListener('click', () => go(idx + 1));
  if (!RM) tabsBox.addEventListener('animationend', (e) => { if (e.target.parentElement === tabs[idx]) go(idx + 1); });
  sec.addEventListener('mouseenter', () => { hover = true; setPause(); }); sec.addEventListener('mouseleave', () => { hover = false; setPause(); });
  view.addEventListener('focusin', () => { focus = true; setPause(); }); view.addEventListener('focusout', () => { focus = false; setPause(); });
  new IntersectionObserver((es) => { seen = es[0].isIntersecting; setPause(); }, { threshold: 0.35 }).observe(view);
  new MutationObserver(setPause).observe(panel, { attributes: true, attributeFilter: ['class'] });
  view.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(idx + 1); else if (e.key === 'ArrowLeft') go(idx - 1); });
  /* swipe / drag */
  view.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, w: view.offsetWidth, lock: null }; moved = 0; });
  addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (drag.lock === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) { drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; setPause(); } if (drag.lock !== 'x') return; moved = dx; track.style.transition = 'none'; track.style.transform = 'translateX(calc(' + (-idx * 100) + '% + ' + dx.toFixed(0) + 'px))'; });
  const end = () => { if (!drag) return; const was = drag; drag = null; track.style.transition = ''; if (was.lock === 'x') go(Math.abs(moved) > Math.min(90, was.w * 0.18) ? idx + (moved < 0 ? 1 : -1) : idx); setPause(); };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  view.addEventListener('click', (e) => { if (Math.abs(moved) > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
  go(0); setPause();
})();

/* ---------- render ---------- */
function render() {
  const t = tour();
  $$('.tab', tabsEl).forEach((b) => { const on = b.dataset.tab === S.tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
  $('#fExp').textContent = nameOf(t); $('#fExpSub').textContent = 'from ' + AED(t.price) + ' ' + t.unit;
  $('#fDate').textContent = dWord(S.date); $('#fDateSub').textContent = t.cat === 'safari' ? 'pickup 3:00 to 3:30 PM' : diffDays(S.date) < 2 ? dShort(S.date) : 'tap to change';
  $('#fGuests').textContent = gWord(); $('#fGuestsSub').textContent = gSplit();
  $('#barGuests').textContent = perPerson() ? gWord() : t.unit; $('#barTotal').textContent = AED(total()) + ' total';
  renderExp(); renderDate(); renderGuests(); renderSticky();
  // panel
  const im = $('#pImg'); if (t.img) { im.src = t.img; im.style.visibility = ''; } else { im.removeAttribute('src'); im.style.visibility = 'hidden'; }
  $('#pName').textContent = nameOf(t); $('#pMeta').textContent = [AED(t.price) + ' ' + t.unit, t.dur, t.dest].filter(Boolean).join(' · ');
  renderPanelDates(); $('#pAdults').textContent = S.adults; $('#pChildren').textContent = S.children;
  $('#pAddonRow').style.display = t.cat === 'safari' ? '' : 'none'; $('#pAddon').checked = S.addon;
  $('#pTotalLabel').textContent = 'Total, ' + (perPerson() ? gWord() : t.unit); $('#pTotal').textContent = AED(total());
}

/* ---------- small things ---------- */
// reveals, staggered inside their row
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el) => { const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal')); el.style.setProperty('--i', sibs.length > 1 ? sibs.indexOf(el) : 0); io.observe(el); });
// WhatsApp chat types itself once
(function () { const chat = $('#chat'); let done = false; const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const type = (el, text, speed) => new Promise((res) => { el.classList.add('is-in'); let i = 0; const t = setInterval(() => { i++; el.innerHTML = esc(text.slice(0, i)) + (i < text.length ? '<span class="cursor"></span>' : ''); if (i >= text.length) { clearInterval(t); res(); } }, speed); });
  new IntersectionObserver(async (es, ob) => { if (!es[0].isIntersecting || done) return; done = true; ob.disconnect(); const m = $$('.msg', chat);
    if (RM) { m.forEach((x) => { x.textContent = x.dataset.typed; x.classList.add('is-in'); }); return; }
    await wait(400); await type(m[0], m[0].dataset.typed, 26); await wait(800); await type(m[1], m[1].dataset.typed, 15); await wait(600); m[2].textContent = m[2].dataset.typed; m[2].classList.add('is-in'); }, { threshold: 0.4 }).observe(chat); })();
// plan form
$('#planForm').addEventListener('submit', () => { const tel = $('#planTel').value.trim(), msg = $('#planMsg').value.trim(); const note = $('#planNote'); if ((tel.match(/\d/g) || []).length < 7) { note.textContent = 'Add your WhatsApp number so we can reply.'; $('#planTel').focus(); return; }
  note.innerHTML = 'Prototype: nothing was sent. On the real site this opens WhatsApp with your message. <a href="' + WA + '?text=' + encodeURIComponent('Hi, ' + (msg || 'I would like help planning a day in Dubai') + '. My number: ' + tel) + '" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline">Open WhatsApp</a>'; });
// one question open at a time
$$('.faq__list details').forEach((d) => d.addEventListener('toggle', () => { if (d.open) $$('.faq__list details').forEach((o) => { if (o !== d) o.open = false; }); }));

render(); renderCards(); onScroll();
})();
