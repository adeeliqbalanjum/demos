/* Al Emirates Tours · V7 set · shared booking engine for the three versions (A stage, B frame, C stories).
   One booking state (tour, date, guests, pickup) drives the booking bar, the sticky bar and the reserve panel.
   Nothing is sent anywhere: "Reserve" ends on a confirmation screen with a prefilled WhatsApp link. */
window.AET = (function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = 'https://wa.me/971581320909';
const BASE = '../shared/';
const P = (p) => (p ? BASE + p : p);
const IMG = { 'dhow-cruise-marina': 'img/aet-o-dhow-cruise.jpg', 'dubai-city-tour': 'img/aet-o-dubai-city-tour.jpg', 'book-abu-dhabi-city-tour': 'img/aet-o-abu-dhabi-city-tour.jpg' };
const TOURS = (window.AET_TOURS || []).map((t) => Object.assign({}, t, { unit: t.cat === 'private' && !/private-city-tour/.test(t.slug) ? 'per person' : t.unit, img: P(t.img || IMG[t.slug] || null) }));
const bySlug = (s) => TOURS.find((t) => t.slug === s);
const CATS = [['safari', 'Desert safari'], ['cruise', 'Cruises & yachts'], ['tickets', 'Tickets & parks'], ['private', 'City & private tours'], ['visa', 'Visas']];
const SHORT = { 'desert-safari-dubai-in-99-aed': 'Evening Desert Safari' };
const nameOf = (t) => SHORT[t.slug] || t.name;
const AED = (v) => 'AED ' + (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2));
const ICO = (n) => '<svg class="i" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
const STARS = ICO('star').repeat(5);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const waLink = (text) => WA + (text ? '?text=' + encodeURIComponent(text) : '');
const pad = (n) => String(n).padStart(2, '0');

/* ---------- content shared by the three versions (all from the client's site and Google profile) ---------- */
const OFFERS = [
  { slug: 'desert-safari-dubai-in-99-aed', name: 'Desert Safari', word: 'DESERT', img: P('img/aet-o-desert-safari.jpg'), alt: 'Land Cruiser on the red dunes', tint: '#FF5A00', meta: [['clock', '6 hours'], ['map-pin', 'Hotel pickup in Dubai']], seal: ['Save', '34%'],
    p: 'Dune bashing, sandboarding and a camel ride, then a BBQ dinner and live shows at the camp. We collect you from your hotel.' },
  { slug: 'dhow-cruise-marina', name: 'Dhow Cruise', word: 'DHOW', img: P('img/aet-o-dhow-cruise.jpg'), alt: 'A lit wooden dhow at night', tint: '#F5A623', meta: [['clock', '3 hours'], ['map-pin', 'Dubai Marina']], seal: ['Dinner', 'included'],
    p: 'A lit wooden dhow through Dubai Marina, with dinner and live entertainment on board while the skyline slides past.' },
  { slug: 'dubai-city-tour', name: 'Dubai City Tour', word: 'DUBAI', img: P('img/aet-o-dubai-city-tour.jpg'), alt: 'Burj Khalifa and Downtown Dubai', tint: '#3FA9F5', meta: [['clock', '6 hours'], ['users', 'With a guide']], seal: ['Guide', 'included'],
    p: 'The famous landmarks, the historic quarter and the modern city in half a day, with a guide who knows the stories.' },
  { slug: 'book-abu-dhabi-city-tour', name: 'Abu Dhabi City Tour', word: 'ABU DHABI', img: P('img/aet-o-abu-dhabi-city-tour.jpg'), alt: 'Etihad Towers, Abu Dhabi', tint: '#7C8CF8', meta: [['clock', '10 hours'], ['map-pin', 'From Dubai, by bus']], seal: ['Full day', 'from Dubai'],
    p: 'A full day in the capital from Dubai: the Sheikh Zayed Grand Mosque, the BAPS Hindu Temple and the city sights.' },
].filter((o) => bySlug(o.slug));
const TIMELINE = [
  { t: '3:00 PM', h: 'Pickup at your hotel', p: 'A 4x4 at the door. Your driver is your guide for the night.', img: P('img/aet-v5-pickup.jpg'), clip: 'dunes' },
  { t: '4:30 PM', h: 'Dune bashing', p: 'Thirty minutes on the red sand, then sandboarding from the top.', img: P('img/aet-v5-convoy.jpg'), clip: 'convoy' },
  { t: '6:05 PM', h: 'Sunset and camels', p: 'Camel ride and the photo everyone posts.', img: P('img/aet-v5-sunset.jpg'), clip: 'sunset' },
  { t: '7:30 PM', h: 'Dinner and three shows', p: 'BBQ buffet, Tanoura, belly dance and the fire show.', img: P('img/aet-v5-camp.jpg'), clip: 'tanoura' },
  { t: '9:30 PM', h: 'Back at your hotel', p: 'Dropped at the same door, sand still in your shoes.', img: P('img/aet-v5-night.jpg'), clip: null },
];
const INCLUDED = ['Hotel pickup and drop-off', 'Dune bashing', 'Sandboarding', 'Camel ride', 'BBQ dinner', 'Three live shows', 'Henna and Arabic coffee'];
const REVIEWS = [
  { q: 'We were on safari in the desert. An incredibly beautiful journey. Muhammad\'s guide was with us. He is a very responsible and sociable person. He picked us up in a great car.', n: 'Александр Мельников', i: 'А' },
  { q: 'Great experience! Nice tour and well assisted by Mohammad Luqman. Highly recommended.', n: 'Chew Nya Chuah', i: 'C' },
  { q: 'Excellent service. He entertained us very well. He has good public relations. Thank you so much my friend. Keep up the good work!', n: 'Kevin Santiago', i: 'K' },
  { q: 'Very nice experience, best safari tour ever.', n: 'Elvira Santiago', i: 'E' },
];
const FAQS = [
  ['Do I have to pay now?', 'No. Reserve your seats and pay the driver in cash when he arrives, or pay by card online if you prefer. No card is needed to hold a booking.'],
  ['Where do you pick up from?', 'From any hotel or address in Dubai. Pickup from Sharjah is on request. Tell us the place when you reserve, or later on WhatsApp.'],
  ['How do I get my ticket?', 'On WhatsApp, within minutes of reserving: your voucher, the pickup time and your driver\'s contact.'],
  ['Can I change the date?', 'Send one WhatsApp message with the new date and we move the booking. Cancellation terms are shown on each tour.'],
];

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
const listeners = [];
const set = (patch) => { Object.assign(S, patch); if (tour().cat !== 'safari') S.addon = false; render(); };
const pick = (slug) => { const t = bySlug(slug); if (t) set({ slug, tab: t.cat }); };

/* ---------- injected once: icon sprite, reserve panel, sticky bar ---------- */
document.body.insertAdjacentHTML('afterbegin', window.AET_SPRITE || '');
document.body.insertAdjacentHTML('beforeend',
  '<div class="sticky" id="sticky" aria-hidden="true"><button class="sticky__info" data-book><img id="stImg" src="" alt="" width="44" height="44"><span><b id="stName"></b><small id="stSub"></small></span></button><b class="sticky__total" id="stTotal"></b><a class="wa" href="' + WA + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICO('whatsapp') + '</a><button class="btn btn--orange" data-book><span class="hide-s">Reserve, pay on arrival</span><span class="show-s">Reserve</span></button></div>' +
  '<div class="scrim" id="scrim" hidden></div><aside class="panel" id="panel" role="dialog" aria-modal="true" aria-labelledby="pName" hidden><div class="panel__head"><small>Reserve</small><button id="pClose" aria-label="Close">' + ICO('x') + '</button></div><div class="panel__body" id="pBody"><div class="panel__tour"><img id="pImg" src="" alt="" width="64" height="64"><span><b id="pName"></b><small id="pMeta"></small></span></div><p class="panel__label">Date</p><div class="datechips datechips--dark" id="pDates"></div><p class="panel__label">Guests</p>' +
  ['adults', 'children'].map((k) => '<div class="stepper stepper--dark"><span><b>' + (k === 'adults' ? 'Adults' : 'Children') + '</b></span><span class="ctl"><button type="button" data-step="' + k + '" data-by="-1" aria-label="Fewer ' + k + '">' + ICO('minus') + '</button><b id="p' + (k === 'adults' ? 'Adults' : 'Children') + '">0</b><button type="button" class="plus" data-step="' + k + '" data-by="1" aria-label="More ' + k + '">' + ICO('plus') + '</button></span></div>').join('') +
  '<label class="addon" id="pAddonRow"><input type="checkbox" id="pAddon"><span>Add quad bike, 30 min · AED 150</span></label><p class="panel__label">Where and who</p><input class="panel__input" id="pPickup" type="text" placeholder="Pickup: hotel or area in Dubai" autocomplete="off"><input class="panel__input" id="pTel" type="tel" placeholder="Your WhatsApp number" autocomplete="tel"><div class="panel__total"><span id="pTotalLabel"></span><b id="pTotal"></b></div><button class="btn btn--orange panel__go" id="pGo">Reserve, pay on arrival</button><p class="panel__note">or pay now by card · confirmation on WhatsApp</p></div>' +
  '<div class="panel__done" id="pDone" hidden><div class="done__tick">' + ICO('check') + '</div><h3>Reserved. See you <span id="dDay"></span>.</h3><p class="done__sum" id="dSum"></p><p class="done__proto">This is a prototype, so nothing was sent. On the real site this is the moment the voucher lands on WhatsApp.</p><a class="btn btn--green" id="dWa" href="#" target="_blank" rel="noopener">' + ICO('whatsapp') + ' Open this booking in WhatsApp</a><button class="btn btn--glass" id="dAgain">Book something else</button></div></aside>');
const fill = (root) => $$('.stars', root || document).forEach((el) => { if (!el.firstChild) el.innerHTML = STARS; });

/* ---------- booking bar (mounted by each version where it wants it) ---------- */
let bar = null, fields = [];
function mountBar(el, opts) {
  opts = opts || {}; bar = el; el.classList.add('bar'); if (opts.up) el.classList.add('bar--up'); if (opts.compact) el.classList.add('bar--compact');
  el.innerHTML = '<div class="bar__tabs" role="tablist" id="tabs">' + CATS.map(([k, l]) => '<button type="button" class="tab" role="tab" data-tab="' + k + '">' + l + ' <small>' + TOURS.filter((t) => t.cat === k).length + '</small></button>').join('') + '</div>' +
    '<div class="bar__fields"><div class="field" data-pop="exp"><button type="button" class="field__btn" aria-haspopup="listbox"><i class="ic">' + ICO('compass') + '</i><span><small>Experience</small><b id="fExp"></b><em id="fExpSub"></em></span></button><div class="pop pop--list" id="popExp" role="listbox"></div></div>' +
    '<div class="field" data-pop="date"><button type="button" class="field__btn" aria-haspopup="dialog"><i class="ic">' + ICO('calendar-days') + '</i><span><small>Date</small><b id="fDate"></b><em id="fDateSub"></em></span></button><div class="pop pop--date" id="popDate"></div></div>' +
    '<div class="field" data-pop="guests"><button type="button" class="field__btn" aria-haspopup="dialog"><i class="ic">' + ICO('users') + '</i><span><small>Guests</small><b id="fGuests"></b><em id="fGuestsSub"></em></span></button><div class="pop pop--guests" id="popGuests"></div></div>' +
    '<label class="field field--input"><i class="ic">' + ICO('map-pin') + '</i><span><small>Pickup</small><input id="fPickup" type="text" placeholder="Hotel or area in Dubai" autocomplete="off"><em>any Dubai hotel or address</em></span></label>' +
    '<button type="button" class="btn btn--orange bar__go" id="barGo">' + (opts.go || 'Check availability') + ' ' + ICO('arrow-right') + '</button></div>' +
    '<div class="bar__foot"><ul class="ticks"><li>No card needed to hold your seat</li><li>Pay the driver on arrival, or by card online</li><li class="hide-m">Change the date with one WhatsApp message</li></ul><p class="bar__total"><span id="barGuests"></span> <b id="barTotal"></b></p></div>';
  fields = $$('.field[data-pop]', el);
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; const k = b.dataset.tab; const first = TOURS.filter((t) => t.cat === k)[0]; set({ tab: k, slug: first ? first.slug : S.slug }); openPop('exp'); });
  $('#popExp').addEventListener('click', (e) => { const b = e.target.closest('[data-slug]'); if (!b) return; set({ slug: b.dataset.slug }); closePops(); });
  $('#popDate').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (!b) return; set({ date: addDays(+b.dataset.day) }); closePops(); });
  $('#popDate').addEventListener('change', (e) => { if (e.target.id !== 'dateOther' || !e.target.value) return; const p = e.target.value.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]); if (d >= day0) { set({ date: d }); closePops(); } });
  fields.forEach((f) => $('.field__btn', f).addEventListener('click', (e) => { e.stopPropagation(); f.classList.contains('is-open') ? closePops() : openPop(f.dataset.pop); }));
  $('#fPickup').addEventListener('input', (e) => { S.pickup = e.target.value; $('#pPickup').value = S.pickup; renderSticky(); });
  $('#barGo').addEventListener('click', () => openPanel());
  render();
}
function openPop(k) { fields.forEach((f) => f.classList.toggle('is-open', f.dataset.pop === k)); document.body.classList.add('is-picking'); }
function closePops() { fields.forEach((f) => f.classList.remove('is-open')); document.body.classList.remove('is-picking'); }
document.addEventListener('click', (e) => { if (!e.target.closest('.pop') && !e.target.closest('.field__btn') && !e.target.closest('[data-tab]')) closePops(); });
document.addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (!b) return; e.stopPropagation(); const k = b.dataset.step, v = S[k] + (+b.dataset.by); const min = k === 'adults' ? 1 : 0; if (v < min || v > 20) return; set({ [k]: v }); bump(); });
function stepperHTML(key, label) { return '<div class="stepper"><span><b>' + label + '</b></span><span class="ctl"><button type="button" data-step="' + key + '" data-by="-1" aria-label="Fewer ' + label.toLowerCase() + '">' + ICO('minus') + '</button><b>' + S[key] + '</b><button type="button" class="plus" data-step="' + key + '" data-by="1" aria-label="More ' + label.toLowerCase() + '">' + ICO('plus') + '</button></span></div>'; }
function renderBar() {
  if (!bar) return; const t = tour();
  $$('.tab', bar).forEach((b) => { const on = b.dataset.tab === S.tab; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
  $('#fExp').textContent = nameOf(t); $('#fExpSub').textContent = 'from ' + AED(t.price) + ' ' + t.unit;
  $('#fDate').textContent = dWord(S.date); $('#fDateSub').textContent = t.cat === 'safari' ? 'pickup 3:00 to 3:30 PM' : diffDays(S.date) < 2 ? dShort(S.date) : 'tap to change';
  $('#fGuests').textContent = gWord(); $('#fGuestsSub').textContent = gSplit();
  $('#barGuests').textContent = perPerson() ? gWord() : t.unit; $('#barTotal').textContent = AED(total()) + ' total';
  $('#popExp').innerHTML = TOURS.filter((x) => x.cat === S.tab).map((x) => '<button type="button" class="opt' + (x.slug === S.slug ? ' is-on' : '') + '" role="option" data-slug="' + x.slug + '"><span>' + esc(nameOf(x)) + '<small>' + [x.dur, x.dest].filter(Boolean).join(' · ') + '</small></span><i>' + AED(x.price) + '</i></button>').join('');
  let h = '<h4>Next two weeks</h4><div class="days">';
  for (let i = 0; i < 14; i++) { const d = addDays(i); h += '<button type="button" class="day' + (diffDays(S.date) === i ? ' is-on' : '') + '" data-day="' + i + '"><small>' + (i === 0 ? 'Today' : WD[d.getDay()]) + '</small><b>' + d.getDate() + '</b></button>'; }
  $('#popDate').innerHTML = h + '</div><label class="pop__other">Another date <input type="date" id="dateOther" min="' + iso(day0) + '" value="' + iso(S.date) + '"></label>';
  $('#popGuests').innerHTML = '<h4>Who is coming</h4>' + stepperHTML('adults', 'Adults') + stepperHTML('children', 'Children');
}

/* ---------- tour cards ---------- */
const FEATURED = ['desert-safari-dubai-in-99-aed', 'dhow-cruise-marina', 'dubai-city-tour', 'burj-khalifa-at-the-top-tickets', 'book-abu-dhabi-city-tour', 'dinner-dhow-cruise-canal', 'desert-safari-with-falcon-photo', 'museum-of-the-future-tickets', 'overnight-desert-safari', '5-star-mega-yacht-dinner-cruise', 'private-city-tour-by-fortuner'];
const ORDER = FEATURED.map(bySlug).filter(Boolean).concat(TOURS.filter((t) => !FEATURED.includes(t.slug) && t.cat !== 'visa'));
const FILTERS = [['all', 'All'], ['safari', 'Desert safari'], ['cruise', 'Cruises'], ['private', 'City tours'], ['tickets', 'Tickets'], ['u150', 'Under AED 150']];
let saved = []; try { saved = JSON.parse(localStorage.getItem('aet-saved') || '[]'); } catch (e) {}
const cardHTML = (t, i) => '<article class="card" style="--i:' + ((i || 0) % 8) + '"><div class="card__ph">' + (t.img ? '<img src="' + t.img + '" alt="' + esc(t.name) + '" loading="lazy" draggable="false">' : '<span class="ph-label">' + esc(t.name) + '</span>') + (t.save ? '<span class="tag">Save ' + t.save + '%</span>' : '') + '<button class="heart' + (saved.includes(t.slug) ? ' is-on' : '') + '" data-save="' + t.slug + '" aria-label="Save ' + esc(t.name) + '">' + ICO('heart') + '</button></div><div class="card__body"><p class="card__meta">' + esc(t.dest) + (t.dur ? ' · ' + t.dur : '') + '</p><h3 class="card__name">' + esc(t.name) + '</h3><p class="card__rate"><span class="stars">' + STARS + '</span> ' + t.rating + ' (' + t.reviews + ')' + (t.cat === 'safari' || t.cat === 'cruise' ? ' <em>· Hotel pickup</em>' : '') + '</p><div class="card__foot"><p class="price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</p><span class="card__acts"><a class="wa" href="' + waLink('Hi, I am interested in ' + t.name) + '" target="_blank" rel="noopener" aria-label="Ask about ' + esc(t.name) + ' on WhatsApp">' + ICO('whatsapp') + '</a><button class="btn btn--navy" data-book="' + t.slug + '">Book</button></span></div></div></article>';
let cardsCfg = null;
function mountCards(cfg) { cardsCfg = cfg; S.shown = cfg.per || 8;
  cfg.chips.innerHTML = FILTERS.map(([k, l]) => '<button class="chip" role="tab" data-chip="' + k + '">' + l + '</button>').join('');
  cfg.chips.addEventListener('click', (e) => { const b = e.target.closest('[data-chip]'); if (b) setFilter(b.dataset.chip); });
  if (cfg.more) cfg.more.addEventListener('click', () => { S.shown += cfg.per || 8; renderCards(); });
  cfg.cards.addEventListener('click', (e) => { const h = e.target.closest('[data-save]'); if (!h) return; const s = h.dataset.save; saved = saved.includes(s) ? saved.filter((x) => x !== s) : saved.concat(s); try { localStorage.setItem('aet-saved', JSON.stringify(saved)); } catch (err) {} h.classList.toggle('is-on', saved.includes(s)); });
  renderCards(); }
function setFilter(k) { if (!cardsCfg) return; S.filter = FILTERS.some((f) => f[0] === k) ? k : 'all'; S.shown = cardsCfg.per || 8; renderCards(); cardsCfg.cards.scrollLeft = 0; }
function renderCards() { const c = cardsCfg; if (!c) return;
  $$('.chip', c.chips).forEach((x) => x.classList.toggle('is-on', x.dataset.chip === S.filter));
  const list = ORDER.filter((t) => S.filter === 'all' ? true : S.filter === 'u150' ? t.price < 150 && t.unit === 'per person' : t.cat === S.filter);
  const n = c.all ? Math.min(list.length, c.all) : Math.min(S.shown, list.length);
  c.cards.innerHTML = list.slice(0, n).map(cardHTML).join('');
  if (c.more) c.more.hidden = list.length - n <= 0; if (c.count) c.count.textContent = 'Showing ' + n + ' of ' + list.length; }
document.addEventListener('click', (e) => { const a = e.target.closest('[data-filter]'); if (a) setFilter(a.dataset.filter); });

/* ---------- reserve panel ---------- */
const panel = $('#panel'), scrim = $('#scrim'), sticky = $('#sticky'); let lastFocus = null;
function openPanel(slug) { if (slug && bySlug(slug)) pick(slug); closePops(); lastFocus = document.activeElement; $('#pBody').hidden = false; $('#pDone').hidden = true; panel.hidden = false; scrim.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => { panel.classList.add('is-on'); scrim.classList.add('is-on'); document.body.classList.add('panel-open'); syncSticky(); }); $('#pClose').focus(); }
function closePanel() { panel.classList.remove('is-on'); scrim.classList.remove('is-on'); document.body.classList.remove('panel-open'); document.body.style.overflow = ''; setTimeout(() => { panel.hidden = true; scrim.hidden = true; }, 450); if (lastFocus && lastFocus.focus) lastFocus.focus(); syncSticky(); }
document.addEventListener('click', (e) => { const b = e.target.closest('[data-book]'); if (!b) return; e.preventDefault(); openPanel(b.dataset.book || null); });
$('#pClose').addEventListener('click', closePanel); scrim.addEventListener('click', closePanel);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!panel.hidden) closePanel(); else closePops(); } });
const pDates = $('#pDates');
pDates.addEventListener('click', (e) => { const b = e.target.closest('[data-pday]'); if (b) set({ date: addDays(+b.dataset.pday) }); });
pDates.addEventListener('change', (e) => { if (e.target.id !== 'pDateOther' || !e.target.value) return; const p = e.target.value.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]); if (d >= day0) set({ date: d }); });
$('#pAddon').addEventListener('change', (e) => { set({ addon: e.target.checked }); bump(); });
$('#pPickup').addEventListener('input', (e) => { S.pickup = e.target.value; const f = $('#fPickup'); if (f) f.value = S.pickup; renderSticky(); });
function bump() { const b = $('#pTotal'); b.classList.add('bump'); setTimeout(() => b.classList.remove('bump'), 200); }
$('#pGo').addEventListener('click', () => {
  const tel = $('#pTel'); const ok = (tel.value.match(/\d/g) || []).length >= 7; tel.classList.toggle('is-bad', !ok); if (!ok) { tel.focus(); tel.placeholder = 'Your WhatsApp number, so we can confirm'; return; }
  const t = tour(); const lines = [nameOf(t), dShort(S.date) + (t.cat === 'safari' ? ' · pickup 3:00 to 3:30 PM' : ''), gWord() + ' (' + gSplit() + ')' + (S.addon ? ' + quad bike' : ''), S.pickup ? 'Pickup: ' + S.pickup : 'Pickup place: we ask on WhatsApp', AED(total()) + ', pay on arrival'];
  $('#dDay').textContent = dSay(S.date); $('#dSum').innerHTML = lines.map(esc).join('<br>');
  $('#dWa').href = waLink('Hi, I would like to reserve:\n' + lines.join('\n'));
  $('#pBody').hidden = true; $('#pDone').hidden = false; $('#pDone').scrollTop = 0;
});
$('#dAgain').addEventListener('click', () => { closePanel(); const b = $('#booked'); if (b) b.scrollIntoView(); });
function renderPanel() { const t = tour();
  const im = $('#pImg'); if (t.img) { im.src = t.img; im.style.visibility = ''; } else { im.removeAttribute('src'); im.style.visibility = 'hidden'; }
  $('#pName').textContent = nameOf(t); $('#pMeta').textContent = [AED(t.price) + ' ' + t.unit, t.dur, t.dest].filter(Boolean).join(' · ');
  const n = diffDays(S.date), third = n > 1 ? S.date : addDays(2);
  pDates.innerHTML = [addDays(0), addDays(1), third].map((d) => '<button type="button" class="dchip' + (diffDays(d) === n ? ' is-on' : '') + '" data-pday="' + diffDays(d) + '"><small>' + (diffDays(d) === 0 ? 'Today' : diffDays(d) === 1 ? 'Tmrw' : WD[d.getDay()]) + '</small><b>' + d.getDate() + ' ' + MO[d.getMonth()] + '</b></button>').join('') + '<label class="dchip dchip--pick"><small>Other</small><b>' + ICO('calendar-days') + ' Pick</b><input type="date" id="pDateOther" min="' + iso(day0) + '" aria-label="Pick another date"></label>';
  $('#pAdults').textContent = S.adults; $('#pChildren').textContent = S.children;
  $('#pAddonRow').style.display = t.cat === 'safari' ? '' : 'none'; $('#pAddon').checked = S.addon;
  $('#pTotalLabel').textContent = 'Total, ' + (perPerson() ? gWord() : t.unit); $('#pTotal').textContent = AED(total()); }

/* ---------- sticky bar: appears once the element given to stickyAfter() has scrolled away ---------- */
let stickyRef = null;
function stickyAfter(el) { stickyRef = el; addEventListener('scroll', syncSticky, { passive: true }); addEventListener('resize', syncSticky); syncSticky(); }
function syncSticky() { if (!stickyRef) return; const foot = $('.foot'); const on = stickyRef.getBoundingClientRect().bottom < 80 && (!foot || foot.getBoundingClientRect().top > innerHeight * 0.6) && !panel.classList.contains('is-on'); sticky.classList.toggle('is-on', on); sticky.setAttribute('aria-hidden', String(!on)); sticky.inert = !on; }
function renderSticky() { const t = tour(); $('#stName').textContent = nameOf(t); $('#stSub').textContent = dWord(S.date) + ' · ' + gWord() + (S.pickup ? ' · pickup ' + S.pickup : ''); $('#stTotal').textContent = AED(total()); const im = $('#stImg'); if (t.img) { im.src = t.img; im.style.display = ''; } else im.style.display = 'none'; }

function render() { renderBar(); renderPanel(); renderSticky(); listeners.forEach((fn) => fn(S, tour())); }

/* ---------- small shared pieces ---------- */
function mountFaq(el) { el.innerHTML = FAQS.map(([q, a], i) => '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q) + '<i></i></summary><p>' + esc(a) + '</p></details>').join(''); const all = $$('details', el); all.forEach((d) => d.addEventListener('toggle', () => { if (d.open) all.forEach((o) => { if (o !== d) o.open = false; }); })); }
function mountFoot(el) { el.classList.add('foot'); el.innerHTML = '<div class="wrap foot__grid"><div><img class="foot__logo" src="' + P('img/logo-white.png') + '" alt="Al Emirates Tours" width="180" height="49" loading="lazy"><p>Al Emirates Tours &amp; Travels, Dubai, United Arab Emirates. Desert safaris, cruises, city tours, tickets and visas since 2021.</p><p class="foot__contact">+971 58 132 0909 · WhatsApp 24/7<br>info@alemiratestours.com<br>Dubai, United Arab Emirates</p></div><div><b>Tours</b><a href="#booked" data-filter="safari">Desert safari</a><a href="#booked" data-filter="cruise">Dhow &amp; dinner cruises</a><a href="#booked" data-filter="private">Dubai city tour</a><a href="#booked" data-filter="private">Abu Dhabi city tour</a><a href="#booked" data-filter="tickets">Attraction tickets</a><a href="#booked" data-filter="cruise">Yacht rental</a></div><div><b>Destinations</b><a href="#booked" data-filter="all">Dubai</a><a href="#booked" data-filter="all">Abu Dhabi</a><a href="#booked" data-filter="all">Sharjah</a><a href="#booked" data-filter="all">Ras Al Khaimah</a><a href="#booked" data-filter="all">Musandam</a></div><div><b>Company</b><a href="#proof">Reviews</a><a href="#questions">Questions</a><a href="' + WA + '" target="_blank" rel="noopener">Group &amp; corporate</a><a href="' + WA + '" target="_blank" rel="noopener">Dubai visas</a><a href="' + WA + '" target="_blank" rel="noopener">Contact</a></div></div><div class="wrap foot__legal"><span>© 2026 Al Emirates Tours &amp; Travels. Prices in AED. Concept prototype: bookings are not sent anywhere' + (el.dataset.note ? '; ' + el.dataset.note : '') + '.</span><span>VISA · Mastercard · Cash on arrival · Bank transfer</span></div>'; }
function reveal(root) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal', root || document).forEach((el) => { const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal')); el.style.setProperty('--i', sibs.length > 1 ? sibs.indexOf(el) : 0); io.observe(el); }); }
/* arrows for any sideways scroller */
function scroller(el, prev, next) { const step = () => Math.max(260, el.clientWidth * 0.8); if (prev) prev.addEventListener('click', () => el.scrollBy({ left: -step(), behavior: RM ? 'instant' : 'smooth' })); if (next) next.addEventListener('click', () => el.scrollBy({ left: step(), behavior: RM ? 'instant' : 'smooth' })); }
/* an auto-advancing set of slides with one progress element: used for the hero sliders */
function cycle(n, ms, onGo) { let i = 0, t = 0, last = performance.now(), paused = false, raf = 0; const api = { get index() { return i; }, go(k) { i = (k + n) % n; t = 0; onGo(i, 0); }, pause(p) { paused = p; }, progress: 0 };
  function tick(now) { raf = requestAnimationFrame(tick); const dt = Math.min(now - last, 100); last = now; if (paused || RM || document.hidden) return; t += dt; api.progress = Math.min(1, t / ms); if (api.onProgress) api.onProgress(api.progress, i); if (t >= ms) api.go(i + 1); }
  raf = requestAnimationFrame(tick); return api; }

fill(); render();
return { $, $$, RM, WA, P, TOURS, CATS, bySlug, nameOf, AED, ICO, STARS, esc, pad, waLink, OFFERS, TIMELINE, INCLUDED, REVIEWS, FAQS, S, set, pick, tour, total, gWord, onRender(fn) { listeners.push(fn); fn(S, tour()); }, mountBar, mountCards, cardHTML, setFilter, openPanel, mountFaq, mountFoot, reveal, fill, stickyAfter, scroller, cycle, panel };
})();
