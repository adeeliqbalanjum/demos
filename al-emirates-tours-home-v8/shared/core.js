/* Al Emirates Tours · Home V8 (client's choice of sections, 23 Nov 2026) · booking engine, made from the V7 one by tools/make-shared.js.
   New here: currencies, labels per tour (Bestseller, Recommended, New), the place chip, hotel pickup only where it is included,
   picture chips in the booking card, the boxed footer with drop-downs.
   One booking state (tour, date, guests, pickup) drives the booking bar, the sticky bar and the reserve panel.
   Nothing is sent anywhere: "Reserve" ends on a confirmation screen with a prefilled WhatsApp link. */
window.AET = (function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = 'https://wa.me/971581320909';
const BASE = 'shared/';
const P = (p) => (p ? BASE + p : p);
const IMG = { 'dhow-cruise-marina': 'img/aet-o-dhow-cruise.jpg', 'dubai-city-tour': 'img/aet-o-dubai-city-tour.jpg', 'book-abu-dhabi-city-tour': 'img/aet-o-abu-dhabi-city-tour.jpg' };
const IMG8 = {}; '5-star-mega-yacht-dinner-cruise atlantis-aquaventure-water-park creek-dhow-cruise desert-safari-with-falcon-photo dhow-cruise-al-seef dhow-cruise-marina dolphinarium-dubai-tickets dubai-aquarium-and-underwater-zoo dubai-city-tour dubai-frame-tickets evening-desert-safari-dubai global-village-tickets miracle-garden-dubai-tickets morning-desert-safari-dubai motiongate-tickets musandam-dhow-cruise-tour overnight-desert-safari premium-desert-safari premium-dinner-cruise-marina private-desert-safari private-morning-desert-safari-with-quad-bike private-morning-desert-safari private-vip-desert-safari'.split(' ').forEach((k) => { IMG8[k] = 'img/v8-t-' + k + '.jpg'; });
Object.assign(IMG8, { 'desert-safari-with-dune-buggy': 'img/v8-x-buggy.jpg', 'desert-safari-with-quad-bike': 'img/v8-x-quad.jpg', 'img-world-of-adventure-ticket': 'img/v8-x-img.jpg', 'ski-dubai-snow-park': 'img/v8-x-ski.jpg' });
const TOURS = (window.AET_TOURS || []).map((t) => Object.assign({}, t, { unit: t.cat === 'private' && !/private-city-tour/.test(t.slug) ? 'per person' : t.unit, img: P(IMG8[t.slug] || t.img || IMG[t.slug] || null) }));

/* ---------- what the client edits per tour in the dashboard (here: sample values) ----------
   LABELS = the labels that exist. TOUR_LABELS = which tour carries which label (any tour, any number of labels, or none).
   PICKUP = whether hotel pickup is included in the tour; the line on the card shows only when it is. */
const LABELS = { bestseller: ['Bestseller', 'thumbs-up'], recommended: ['Recommended', 'badge-check'], fresh: ['New', 'sparkles'] };
const TOUR_LABELS = { 'desert-safari-dubai-in-99-aed': ['bestseller'], 'dhow-cruise-marina': ['bestseller'], 'dubai-city-tour': ['recommended'], 'book-abu-dhabi-city-tour': ['recommended'], 'premium-desert-safari': ['recommended'], 'burj-khalifa-at-the-top-tickets': ['bestseller'], 'desert-safari-with-falcon-photo': ['fresh'] };
const PICKUP = (t) => (t.cat === 'safari' || t.cat === 'cruise') && !/yacht|love boat/i.test(t.name);
const PLACE = (t) => /abu dhabi|qasr al watan|al qana|yas |ferrari|warner|seaworld/i.test(t.name) ? 'Abu Dhabi' : /ras al khaimah|jebel jais/i.test(t.name) ? 'Ras Al Khaimah' : /sharjah/i.test(t.name) ? 'Sharjah' : /musandam/i.test(t.name) ? 'Musandam' : 'Dubai';
TOURS.forEach((t) => { t.place = PLACE(t); t.labels = TOUR_LABELS[t.slug] || []; t.pickup = PICKUP(t); });
const CATN = { safari: 'Desert safari', cruise: 'Cruise', tickets: 'Tickets', private: 'City tour', visa: 'Visa' };
const CATIMG = { safari: 'img/aet-t-desert-safari-dubai-in-99-aed.jpg', cruise: 'img/v8-t-dhow-cruise-marina.jpg', tickets: 'img/aet-t-burj-khalifa-at-the-top-tickets.jpg', private: 'img/v8-t-dubai-city-tour.jpg', abudhabi: 'img/aet-o-abu-dhabi-city-tour.jpg' };
/* the booking card has one tab more than the categories: Abu Dhabi (by place), so a menu card can open that list */
const inTab = (t, k) => k === 'abudhabi' ? t.place === 'Abu Dhabi' : t.cat === k;
const bySlug = (s) => TOURS.find((t) => t.slug === s);
const CATS = [['safari', 'Desert safari'], ['cruise', 'Cruises & yachts'], ['tickets', 'Tickets & parks'], ['private', 'City & private tours'], ['visa', 'Visas']];
const SHORT = { 'desert-safari-dubai-in-99-aed': 'Evening Desert Safari' };
const nameOf = (t) => SHORT[t.slug] || t.name;
const AEDS = (v) => 'AED ' + (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2));
const CURS = { AED: { name: 'UAE Dirham', sign: 'AED', rate: 1 }, USD: { name: 'US Dollar', sign: '$', rate: 1 / 3.6725 }, EUR: { name: 'Euro', sign: '€', rate: 1 / 4.2 } };
let CUR = 'AED'; try { const c = localStorage.getItem('aet-cur'); if (CURS[c]) CUR = c; } catch (e) {}
const AED = (v) => { if (CUR === 'AED') return AEDS(v); const x = v * CURS[CUR].rate; return CURS[CUR].sign + (x >= 100 ? Math.round(x).toLocaleString('en-US') : x.toFixed(2).replace(/\.00$/, '')); };
const curListeners = [];
const paint = (root) => $$('[data-aed]', root || document).forEach((el) => { el.textContent = (el.dataset.pre || '') + AED(+el.dataset.aed) + (el.dataset.post || ''); });
function setCurrency(c) { if (!CURS[c]) return; CUR = c; try { localStorage.setItem('aet-cur', c); } catch (e) {} render(); renderCards(); paint(); curListeners.forEach((fn) => fn(c)); }
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
  el.innerHTML = '<div class="bar__tabs" role="tablist" id="tabs">' + CATS.slice(0, 4).concat([['abudhabi', 'Abu Dhabi']], CATS.slice(4)).map(([k, l]) => '<button type="button" class="tab tab--img" role="tab" data-tab="' + k + '">' + (CATIMG[k] ? '<img src="' + P(CATIMG[k]) + '" alt="" width="30" height="30">' : '<i>' + ICO('globe') + '</i>') + l + '</button>').join('') + '</div>' +
    '<div class="bar__fields"><div class="field" data-pop="exp"><button type="button" class="field__btn" aria-haspopup="listbox"><i class="ic">' + ICO('compass') + '</i><span><small>Experience</small><b id="fExp"></b><em id="fExpSub"></em></span></button><div class="pop pop--list" id="popExp" role="listbox"></div></div>' +
    '<div class="field" data-pop="date"><button type="button" class="field__btn" aria-haspopup="dialog"><i class="ic">' + ICO('calendar-days') + '</i><span><small>Date</small><b id="fDate"></b><em id="fDateSub"></em></span></button><div class="pop pop--date" id="popDate"></div></div>' +
    '<div class="field" data-pop="guests"><button type="button" class="field__btn" aria-haspopup="dialog"><i class="ic">' + ICO('users') + '</i><span><small>Guests</small><b id="fGuests"></b><em id="fGuestsSub"></em></span></button><div class="pop pop--guests" id="popGuests"></div></div>' +
    '<label class="field field--input"><i class="ic">' + ICO('map-pin') + '</i><span><small>Pickup</small><input id="fPickup" type="text" placeholder="Hotel or area in Dubai" autocomplete="off"><em>any Dubai hotel or address</em></span></label>' +
    '<button type="button" class="btn btn--orange bar__go" id="barGo">' + (opts.go || 'Check availability') + ' ' + ICO('arrow-right') + '</button></div>' +
    '<div class="bar__foot"><ul class="ticks"><li>No card needed to hold your seat</li><li>Pay the driver on arrival, or by card online</li><li class="hide-m">Change the date with one WhatsApp message</li></ul><p class="bar__total"><span id="barGuests"></span> <b id="barTotal"></b></p></div>';
  fields = $$('.field[data-pop]', el);
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; openTab(b.dataset.tab); });
  $('#popExp').addEventListener('click', (e) => { const b = e.target.closest('[data-slug]'); if (!b) return; set({ slug: b.dataset.slug }); closePops(); });
  $('#popDate').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (!b) return; set({ date: addDays(+b.dataset.day) }); closePops(); });
  $('#popDate').addEventListener('change', (e) => { if (e.target.id !== 'dateOther' || !e.target.value) return; const p = e.target.value.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]); if (d >= day0) { set({ date: d }); closePops(); } });
  fields.forEach((f) => $('.field__btn', f).addEventListener('click', (e) => { e.stopPropagation(); f.classList.contains('is-open') ? closePops() : openPop(f.dataset.pop); }));
  $('#fPickup').addEventListener('input', (e) => { S.pickup = e.target.value; $('#pPickup').value = S.pickup; renderSticky(); });
  $('#barGo').addEventListener('click', () => openPanel());
  render();
}
function openTab(k) { const first = TOURS.filter((t) => inTab(t, k))[0]; set({ tab: k, slug: first ? first.slug : S.slug }); openPop('exp'); const b = bar && $('[data-tab="' + k + '"]', bar), box = b && b.parentNode; if (box && box.scrollWidth > box.clientWidth) box.scrollTo({ left: Math.max(0, b.offsetLeft - 16), behavior: RM ? 'instant' : 'smooth' }); }
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
  $('#popExp').innerHTML = TOURS.filter((x) => inTab(x, S.tab)).map((x) => '<button type="button" class="opt' + (x.slug === S.slug ? ' is-on' : '') + '" role="option" data-slug="' + x.slug + '"><span>' + esc(nameOf(x)) + '<small>' + [x.dur, x.place].filter(Boolean).join(' · ') + '</small></span><i>' + AED(x.price) + '</i></button>').join('');
  let h = '<h4>Next two weeks</h4><div class="days">';
  for (let i = 0; i < 14; i++) { const d = addDays(i); h += '<button type="button" class="day' + (diffDays(S.date) === i ? ' is-on' : '') + '" data-day="' + i + '"><small>' + (i === 0 ? 'Today' : WD[d.getDay()]) + '</small><b>' + d.getDate() + '</b></button>'; }
  $('#popDate').innerHTML = h + '</div><label class="pop__other">Another date <input type="date" id="dateOther" min="' + iso(day0) + '" value="' + iso(S.date) + '"></label>';
  $('#popGuests').innerHTML = '<h4>Who is coming</h4>' + stepperHTML('adults', 'Adults') + stepperHTML('children', 'Children');
}

/* ---------- tour cards ---------- */
const FEATURED = ['desert-safari-dubai-in-99-aed', 'dhow-cruise-marina', 'dubai-city-tour', 'burj-khalifa-at-the-top-tickets', 'book-abu-dhabi-city-tour', 'dinner-dhow-cruise-canal', 'desert-safari-with-falcon-photo', 'museum-of-the-future-tickets', 'overnight-desert-safari', '5-star-mega-yacht-dinner-cruise', 'private-city-tour-by-fortuner'];
const ORDER = FEATURED.map(bySlug).filter(Boolean).concat(TOURS.filter((t) => !FEATURED.includes(t.slug) && t.cat !== 'visa'));
const FILTERS = [['all', 'All'], ['safari', 'Desert safari'], ['cruise', 'Cruises'], ['private', 'City tours'], ['tickets', 'Tickets'], ['dubai', 'Dubai'], ['abudhabi', 'Abu Dhabi'], ['privatecar', 'Private']];
const inFilter = (t, k) => k === 'all' ? true : k === 'dubai' ? t.place === 'Dubai' : k === 'abudhabi' ? t.place === 'Abu Dhabi' : k === 'privatecar' ? /^private/i.test(t.name) : t.cat === k;
let saved = []; try { saved = JSON.parse(localStorage.getItem('aet-saved') || '[]'); } catch (e) {}
const cardHTML = (t, i) => '<article class="card card--v8" style="--i:' + ((i || 0) % 8) + '"><div class="card__ph">' + (t.img ? '<img src="' + t.img + '" alt="' + esc(t.name) + '" loading="lazy" draggable="false">' : '<span class="ph-label">' + esc(t.name) + '</span>')
  + '<span class="rate" aria-label="Rated ' + t.rating + ' out of 5, ' + t.reviews + (t.reviews === 1 ? ' review' : ' reviews') + '">' + ICO('star') + '<b>' + t.rating + '</b><small>(' + t.reviews + ')</small></span>'
  + '<a class="trip" href="#" data-soon="The Tripadvisor link is added when the company sends its Tripadvisor page address" aria-label="On Tripadvisor"><img src="' + P('img/tripadvisor.png') + '" alt="" width="26" height="16" loading="lazy"></a></div>'
  + '<div class="card__body"><p class="card__meta">' + esc(CATN[t.cat] || '') + (t.dur ? ' · ' + t.dur : '') + '</p><h3 class="card__name">' + esc(t.name) + '</h3>'
  + '<p class="card__tags">' + t.labels.map((k) => '<span class="lab lab--' + k + '">' + ICO(LABELS[k][1]) + LABELS[k][0] + '</span>').join('') + (t.save ? '<span class="lab lab--save">' + ICO('badge-percent') + 'Save ' + t.save + '%</span>' : '') + '<span class="lab lab--place">' + ICO('map-pin') + esc(t.place) + '</span></p>'
  + (t.pickup ? '<p class="card__pick">' + ICO('car') + 'Hotel pickup included</p>' : '')
  + '<div class="card__foot"><p class="price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</p><span class="card__acts"><a class="wa" href="' + waLink('Hi, I am interested in ' + t.name) + '" target="_blank" rel="noopener" aria-label="Ask about ' + esc(t.name) + ' on WhatsApp">' + ICO('whatsapp') + '</a><button class="btn btn--navy" data-book="' + t.slug + '">Book</button></span></div></div></article>';
let cardsCfg = null;
function mountCards(cfg) { cardsCfg = cfg; S.shown = cfg.per || 8;
  cfg.chips.innerHTML = FILTERS.map(([k, l]) => '<button class="chip" role="tab" data-chip="' + k + '">' + l + '</button>').join('');
  cfg.chips.addEventListener('click', (e) => { const b = e.target.closest('[data-chip]'); if (b) setFilter(b.dataset.chip); });
  if (cfg.more) cfg.more.addEventListener('click', () => { S.shown += cfg.per || 8; renderCards(); });
  cfg.cards.addEventListener('click', (e) => { const h = e.target.closest('[data-save]'); if (!h) return; const s = h.dataset.save; saved = saved.includes(s) ? saved.filter((x) => x !== s) : saved.concat(s); try { localStorage.setItem('aet-saved', JSON.stringify(saved)); } catch (err) {} h.classList.toggle('is-on', saved.includes(s)); });
  renderCards(); }
function setFilter(k) { if (!cardsCfg) return; S.filter = FILTERS.some((f) => f[0] === k) ? k : 'all'; S.shown = cardsCfg.per || 8; renderCards(); cardsCfg.cards.scrollLeft = 0; }
function renderCards() { const c = cardsCfg; if (!c) return;
  $$('.chip', c.chips).forEach((x) => { const on = x.dataset.chip === S.filter; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); if (on && c.chips.scrollWidth > c.chips.clientWidth) c.chips.scrollTo({ left: Math.max(0, x.offsetLeft - 20), behavior: RM ? 'instant' : 'smooth' }); });
  const list = ORDER.filter((t) => inFilter(t, S.filter));
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
  const t = tour(); const lines = [nameOf(t), dShort(S.date) + (t.cat === 'safari' ? ' · pickup 3:00 to 3:30 PM' : ''), gWord() + ' (' + gSplit() + ')' + (S.addon ? ' + quad bike' : ''), S.pickup ? 'Pickup: ' + S.pickup : 'Pickup place: we ask on WhatsApp', AEDS(total()) + ', pay on arrival'];
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
  $('#pAddonRow').style.display = t.cat === 'safari' ? '' : 'none'; $('#pAddon').checked = S.addon; $('#pAddonRow span').textContent = 'Add quad bike, 30 min · ' + AED(150);
  $('#pTotalLabel').textContent = 'Total, ' + (perPerson() ? gWord() : t.unit) + (CUR === 'AED' ? '' : ' · you pay ' + AEDS(total())); $('#pTotal').textContent = AED(total()); }

/* ---------- sticky bar: appears once the element given to stickyAfter() has scrolled away ---------- */
let stickyRef = null;
function stickyAfter(el) { stickyRef = el; addEventListener('scroll', syncSticky, { passive: true }); addEventListener('resize', syncSticky); syncSticky(); }
function syncSticky() { if (!stickyRef) return; const foot = $('.foot'); const on = stickyRef.getBoundingClientRect().bottom < 80 && (!foot || foot.getBoundingClientRect().top > innerHeight * 0.6) && !panel.classList.contains('is-on'); sticky.classList.toggle('is-on', on); sticky.setAttribute('aria-hidden', String(!on)); sticky.inert = !on; }
function renderSticky() { const t = tour(); $('#stName').textContent = nameOf(t); $('#stSub').textContent = dWord(S.date) + ' · ' + gWord() + (S.pickup ? ' · pickup ' + S.pickup : ''); $('#stTotal').textContent = AED(total()); const im = $('#stImg'); if (t.img) { im.src = t.img; im.style.display = ''; } else im.style.display = 'none'; }

function render() { renderBar(); renderPanel(); renderSticky(); listeners.forEach((fn) => fn(S, tour())); }

/* ---------- small shared pieces ---------- */
function mountFaq(el) { el.innerHTML = FAQS.map(([q, a], i) => '<details><summary>' + esc(q) + '<i></i></summary><p>' + esc(a) + '</p></details>').join(''); const all = $$('details', el); all.forEach((d) => d.addEventListener('toggle', () => { if (d.open) all.forEach((o) => { if (o !== d) o.open = false; }); })); }
const SOCIAL = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube']];
const socialHTML = () => '<div class="fsoc" aria-label="Social media">' + SOCIAL.map(([k, l]) => '<a href="#" data-soon="The ' + l + ' link is added with the client\'s profile address" aria-label="' + l + '">' + ICO(k) + '</a>').join('') + '</div>';
function mountFoot(el) { el.classList.add('foot', 'foot--box');
  const grp = (title, links, open) => '<details class="fgrp"' + (open ? ' open' : '') + '><summary>' + title + ICO('chevron-down') + '</summary><div class="fgrp__in">' + links + '</div></details>';
  el.innerHTML = '<div class="wrap"><div class="fbox"><div class="fbox__grid"><div class="fco"><span class="foot__plate"><img class="foot__logo" src="' + P('img/logo-official.png') + '" alt="Al Emirates Tours and Travels" width="180" height="49" loading="lazy"></span><p>Desert safaris, dhow cruises, city tours, tickets and visas across the UAE. Booked in a minute, confirmed on WhatsApp, paid on arrival.</p>'
    + '<div class="fco__box"><b>Al Emirates Tours &amp; Travels</b><span>Tour operator in Dubai, United Arab Emirates. Operating since 2021.</span><em><u>Since 2021</u><i></i><u>10,000+ guests</u><i></i><u>5.0 ' + ICO('star') + ' on Google</u></em></div>' + socialHTML() + '</div>'
    + '<div class="facc">'
    + grp('Our services', '<a href="#booked" data-filter="safari">Dubai Desert Safari Packages</a><a href="#booked" data-filter="dubai">Dubai Tours &amp; Attractions</a><a href="#booked" data-filter="abudhabi">Abu Dhabi Tours &amp; Attractions</a><a href="' + waLink('Hi, I need an airport transfer') + '" target="_blank" rel="noopener">Airport Transfers</a><a href="#booked" data-filter="privatecar">Private City Tours &amp; Transfers</a><a href="#plan">Group bookings</a>')
    + grp('Support', '<a href="#why">About Us</a><a href="#plan">Contact Us</a><a href="#" data-soon="The Privacy Policy page comes with the full site">Privacy Policy</a><a href="#" data-soon="The Terms page comes with the full site">Terms &amp; Conditions</a><a href="#" data-soon="The Cancellation policy page comes with the full site">Cancellation policy</a>')
    + grp('Insights', '<a href="#questions">FAQs</a><a href="#" data-soon="The blog comes with the full site">Blogs</a><a href="#proof">Reviews</a>')
    + grp('Contact us', '<a href="tel:+971581320909">' + ICO('phone') + '<span><b>Call us</b>+971 58 132 0909</span></a><a href="mailto:info@alemiratestours.com">' + ICO('mail') + '<span><b>Email us</b>info@alemiratestours.com</span></a><a href="#plan">' + ICO('map-pin') + '<span><b>Visit our office</b>Dubai, United Arab Emirates</span></a>')
    + '</div></div>'
    + '<div class="fhelp"><b>We are here to help.</b><a href="' + WA + '" target="_blank" rel="noopener">' + ICO('whatsapp') + 'WhatsApp, 24/7: +971 58 132 0909</a><a href="mailto:info@alemiratestours.com">' + ICO('mail') + 'info@alemiratestours.com</a></div></div>'
    + '<div class="foot__legal"><span>© 2026 Al Emirates Tours &amp; Travels. Prices in AED. Concept prototype: bookings are not sent anywhere.</span><span>VISA · Mastercard · Cash on arrival · Bank transfer</span></div></div>'; }
function reveal(root) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal', root || document).forEach((el) => { const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal')); el.style.setProperty('--i', sibs.length > 1 ? sibs.indexOf(el) : 0); io.observe(el); }); }
/* arrows for any sideways scroller */
function scroller(el, prev, next) { const step = () => Math.max(260, el.clientWidth * 0.8); if (prev) prev.addEventListener('click', () => el.scrollBy({ left: -step(), behavior: RM ? 'instant' : 'smooth' })); if (next) next.addEventListener('click', () => el.scrollBy({ left: step(), behavior: RM ? 'instant' : 'smooth' })); }
/* an auto-advancing set of slides with one progress element: used for the hero sliders */
function cycle(n, ms, onGo) { let i = 0, t = 0, last = performance.now(), paused = false, raf = 0; const api = { get index() { return i; }, go(k) { i = (k + n) % n; t = 0; onGo(i, 0); }, pause(p) { paused = p; }, progress: 0 };
  function tick(now) { raf = requestAnimationFrame(tick); const dt = Math.min(now - last, 100); last = now; if (paused || RM || document.hidden) return; t += dt; api.progress = Math.min(1, t / ms); if (api.onProgress) api.onProgress(api.progress, i); if (t >= ms) api.go(i + 1); }
  raf = requestAnimationFrame(tick); return api; }

fill(); render();
return { $, $$, RM, WA, P, TOURS, CATS, bySlug, nameOf, AED, AEDS, CURS, get cur() { return CUR; }, setCurrency, onCurrency(fn) { curListeners.push(fn); }, paint, socialHTML, inFilter, openTab, addDays, iso, ICO, STARS, esc, pad, waLink, OFFERS, TIMELINE, INCLUDED, REVIEWS, FAQS, S, set, pick, tour, total, gWord, onRender(fn) { listeners.push(fn); fn(S, tour()); }, mountBar, mountCards, cardHTML, setFilter, openPanel, mountFaq, mountFoot, reveal, fill, stickyAfter, scroller, cycle, panel };
})();
