/* Al Emirates Tours · tour page (27 Nov 2026) · page script. The booking engine is shared/core.js (window.AET), the same one as the home page.
   This file: the pictures, the facts, the booking card, the evening, included / not included, add-ons, questions, reviews, more safaris,
   and the header pieces of the home page (side menu with quick booking, language and currency).
   CONTENT: every fact below is from the live page /to_book/desert-safari-dubai-in-99-aed/ as read on 27 Nov 2026. Nothing is invented.
   In WordPress these lists are the fields of the tour; the page is one template for all 96 tours. */
(function () {
'use strict';
const A = window.AET, { $, $$, ICO, AED, esc, bySlug, RM, P, TOURS, waLink } = A;
const THIS = 'desert-safari-dubai-in-99-aed', T = bySlug(THIS), HOME = 'index.html';
const NAME = 'Desert Safari Dubai in 99 AED';
const busy = () => ['panel-open', 'menu-open', 'lb-open'].some((c) => document.body.classList.contains(c));

/* ---------- small helpers ---------- */
const toastEl = $('#toast'); let toastT = 0;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3800); }
document.addEventListener('click', (e) => { const a = e.target.closest('[data-soon]'); if (a) { e.preventDefault(); toast(a.dataset.soon); } });
const money = (v, pre, post) => '<span data-aed="' + v + '"' + (pre ? ' data-pre="' + esc(pre) + '"' : '') + (post ? ' data-post="' + esc(post) + '"' : '') + '>' + esc(pre || '') + AED(v) + esc(post || '') + '</span>';
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const diff = (d) => Math.round((d - A.addDays(0)) / 864e5);

/* ---------- the content of this tour (from the live page) ---------- */
const GALLERY = [
  ['img/v8-hero-desert.jpg', 'Dune driving on the Al Lahbab red sand'],
  ['img/tour-safari-2.jpg', 'Twenty to thirty minutes off-road in a 4x4'],
  ['img/tour-safari-3.jpg', 'The camel ride'],
  ['img/tour-safari-4.jpg', 'The falcon photo point'],
  ['img/v8-film-tanoura.jpg', 'The Tanura show at the camp'],
  ['img/tour-safari-6.jpg', 'A Land Cruiser on the dunes'],
  ['img/v8-film-sunset.jpg', 'Sunset in the desert'],
];
const FACTS = [
  ['clock', 'Duration', '6 hours, evening'],
  ['car', 'Pickup', '3:00 to 3:30 PM'],
  ['map-pin', 'From', 'Any point in Dubai'],
  ['banknote', 'Payment', 'Cash on arrival'],
  ['calendar-check', 'Cancel free', 'Up to 24 hours before'],
  ['baby', 'Children', 'From 3 years'],
];
const HIGHLIGHTS = ['20 to 30 minutes of dune driving in the Al Lahbab red sand desert', 'Camel ride, sand skiing and the falcon photo point at sunset', 'Buffet dinner and BBQ, with vegetarian options', 'Fire show, Tanura show and belly dancing at the camp'];
const INCLUDED = ['Pickup by 4x4 (Land Cruiser or Nissan Patrol) from any point in Dubai', 'Drive through the desert along Al Awir Road', '20 to 30 minutes of dune driving in the Al Lahbab red sand desert', 'Sunset view and falcon photo point', 'Camel rides', 'Sand skiing', 'Fire show', 'Traditional Tanura show', 'Belly dancing (not during Ramadan)', 'Henna painting', 'Shisha, free in the shisha corner', 'Arabic coffee (Gahwa) and fresh dates', 'Traditional costumes for photos', 'Unlimited soft drinks, tea, coffee and mineral water', 'Buffet dinner and BBQ, vegetarian options available', 'Separate washrooms for men and women'];
const EXCLUDED = ['Quad biking (additional charge)', 'Dune buggy riding (additional charge)', 'Drinks from the bar (on payment)', 'Shisha at your table (on payment)', 'Private photography', 'Personal expenses'];
const ADDONS = [
  { img: 'img/tour-add-quad.jpg', alt: 'A yellow quad bike on the sand', h: 'Quad bike (ATV)', p: 'Thirty minutes on your own machine. 250cc inside the zone, 350cc for adults outside it.',
    rows: [{ b: 'Inside the zone', s: '30 minutes · 250cc', v: 150, add: true }, { b: 'Outside the zone', s: '30 minutes · 350cc, adults', v: 269 }] },
  { img: 'img/tour-add-buggy.jpg', alt: 'A dune buggy on the sand', h: 'Dune buggy', p: 'Two to four seats, a roll cage and a lot of sand. You drive, the instructor leads.',
    rows: [{ b: '2-seater', s: 'per buggy', v: 900 }, { b: '4-seater', s: 'per buggy', v: 1099 }] },
];
const KNOW = [
  ['users', 'Who can join', ['No minimum number: even one person can book', 'A group of 7 gets a car to itself, without sharing', 'Car seats for children are provided', 'Not recommended for pregnant women or guests with back problems: a private car straight to the camp is available']],
  ['shield-check', 'Safety', ['Professional, licensed drivers, trained in first aid', 'Roll cages and seat belts for every passenger', 'All passengers are insured during the tour']],
  ['sun', 'What to bring', ['Light, breathable clothing and closed shoes', 'Sunglasses and a scarf for the sand', 'A charged phone or camera for the sunset', 'Tell us in advance about special dietary needs']],
];
const QA = [
  ['Is the 99 AED desert safari child-friendly?', 'Yes, it is safe for children over 3 years. Car seats for children are provided.'],
  ['Is there any additional cost?', 'No, the 99 AED covers the activities and dinner. Upgrades like quad bikes or private cars are extra.'],
  ['How is it different from the premium package?', 'The main differences are pick-up type, vehicle upgrades and additional services. Food and entertainment are the same.'],
  ['Can I get a refund?', 'No cancellation fee is charged if you cancel 24 hours before the pickup. A full cancellation fee is charged if the trip is cancelled within 24 hours of the pickup. A refund you are eligible for is paid into your account within 7 working days.'],
  ['Can I change the travel date?', 'Yes, you can change your booking date up to 24 hours before the pickup. Send us a message on WhatsApp.'],
  ['What time is the pickup in summer and in winter?', 'The timings change with the season: in winter the pickup is 2:30 to 3:00 PM, in summer 3:00 to 4:00 PM. Your exact time comes with the voucher.'],
  ['Do we get vegetarian food?', 'Yes, you can get vegetarian food at the BBQ dinner.'],
  ['What payment methods are accepted?', 'Cash on arrival, online payment by credit or debit card, and bank transfer.'],
];
const GUIDE = [
  ['Why choose the Desert Safari Dubai in 99 AED?', null, ['Perfect for budget travelers and solo tourists', 'Ideal for first-time Dubai visitors', 'Family, group, and kids-friendly', 'Same entertainment and food as premium packages', 'Great for social media photos and reels', 'Instant WhatsApp booking and live availability']],
  ['Important information', 'There is no minimum number of people required for this package; even a single person can participate. Groups of 7 benefit from a private car without sharing. Due to the adventurous nature, it is not recommended for pregnant women or older adults with back problems, but private car options to the camp are available. Car seats for children are provided for safety and comfort.', null],
  ['How to book', null, ['Book now and pay later (payment on arrival in cash)', '24/7 booking available', 'Clean luxury AC vehicle', 'No hidden or extra charges', 'Instant WhatsApp booking: +971 58 132 0909']],
  ['Add-on quad bike ATV or dune desert buggy', 'Two types of quad bikes are available: 350cc for adults outside the designated desert area and 250cc within it. Upgrade on the spot. Dune buggies seat 2 to 4 people, with safety gear and instructions provided by our instructor.', null],
];
const ALSO = ['desert-safari-with-falcon-photo', 'premium-desert-safari', 'overnight-desert-safari', 'private-desert-safari'];
const LABELS = { bestseller: ['Bestseller', 'thumbs-up'], recommended: ['Recommended', 'badge-check'], fresh: ['New', 'sparkles'] };

/* ---------- pictures: one large + four small on a wide screen, a strip to swipe on a phone; a tap opens the picture large ---------- */
const track = $('#galTrack'), gDots = $('#galDots');
track.innerHTML = GALLERY.map(([src, cap], i) => '<button class="tgal__it" type="button" data-g="' + i + '" aria-label="Photo ' + (i + 1) + ' of ' + GALLERY.length + ': ' + esc(cap) + '"><img src="' + P(src) + '" alt="' + esc(cap) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + ' draggable="false"></button>').join('');
gDots.innerHTML = GALLERY.map(() => '<i></i>').join('');
$('#galAllW').textContent = 'All ' + GALLERY.length + ' photos';
const dotEls = $$('i', gDots); let gNow = 0;
function galSync() { gNow = Math.max(0, Math.min(GALLERY.length - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth)))); dotEls.forEach((d, k) => d.classList.toggle('is-on', k === gNow)); $('#galNow').textContent = (gNow + 1) + ' / ' + GALLERY.length; }
track.addEventListener('scroll', galSync, { passive: true }); addEventListener('resize', galSync); galSync();
const galGo = (i) => track.scrollTo({ left: ((i + GALLERY.length) % GALLERY.length) * track.clientWidth, behavior: RM ? 'instant' : 'smooth' });
$('#galPrev').addEventListener('click', () => galGo(gNow - 1)); $('#galNext').addEventListener('click', () => galGo(gNow + 1));
const lb = $('#lb'), lbImg = $('#lbImg'); let lbi = 0, lbLast = null;
function lbShow(i) { lbi = (i + GALLERY.length) % GALLERY.length; lbImg.src = P(GALLERY[lbi][0]); lbImg.alt = GALLERY[lbi][1]; $('#lbCap').textContent = GALLERY[lbi][1]; $('#lbCount').textContent = (lbi + 1) + ' / ' + GALLERY.length; }
function lbOpen(i) { lbLast = document.activeElement; lbShow(i); lb.hidden = false; document.body.classList.add('lb-open'); document.body.style.overflow = 'hidden'; requestAnimationFrame(() => lb.classList.add('is-on')); $('#lbClose').focus(); }
function lbClose() { if (lb.hidden) return; lb.classList.remove('is-on'); document.body.classList.remove('lb-open'); document.body.style.overflow = ''; setTimeout(() => { lb.hidden = true; }, RM ? 0 : 250); if (lbLast && lbLast.focus) lbLast.focus(); }
track.addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (b) lbOpen(+b.dataset.g); });
$('#galAll').addEventListener('click', () => lbOpen(gNow));
$('#lbClose').addEventListener('click', lbClose); $('#lbPrev').addEventListener('click', () => lbShow(lbi - 1)); $('#lbNext').addEventListener('click', () => lbShow(lbi + 1));
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.id === 'lbStage') lbClose(); });
(function swipe() { const st = $('#lbStage'); let x0 = null;
  st.addEventListener('pointerdown', (e) => { if (!e.target.closest('button')) x0 = e.clientX; });
  st.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 44) lbShow(lbi + (dx < 0 ? 1 : -1)); });
  st.addEventListener('pointercancel', () => { x0 = null; }); })();

/* ---------- name, labels, facts ---------- */
$('#tName').textContent = NAME; $('#crumbName').textContent = NAME;
$('#tLabels').innerHTML = T.labels.map((k) => '<span class="lab lab--' + k + '">' + ICO(LABELS[k][1]) + LABELS[k][0] + '</span>').join('') + (T.save ? '<span class="lab lab--save">' + ICO('badge-percent') + 'Save ' + T.save + '%</span>' : '') + '<span class="lab lab--place">' + ICO('map-pin') + esc(T.place) + '</span>';
$('#tFacts').innerHTML = FACTS.map(([ic, s, b]) => '<li class="tfact"><i class="ic">' + ICO(ic) + '</i><span><small>' + s + '</small><b>' + b + '</b></span></li>').join('');
['row', 'buy'].forEach((k) => { $('#' + k + 'Price').innerHTML = money(T.price); $('#' + k + 'Old').innerHTML = T.old ? money(T.old) : ''; });
$('#buySave').innerHTML = T.save ? '<span class="lab lab--save">' + ICO('badge-percent') + 'Save ' + T.save + '%</span>' : '';
$('#tHl').innerHTML = HIGHLIGHTS.map((x) => '<li>' + ICO('circle-check') + '<span>' + esc(x) + '</span></li>').join('');
$('#tShare').addEventListener('click', async () => { const url = location.href.split('#')[0];
  try { if (navigator.share) { await navigator.share({ title: NAME + ' · Al Emirates Tours', url }); return; } await navigator.clipboard.writeText(url); toast('Link copied. Paste it to share this tour.'); } catch (e) { if (e && e.name !== 'AbortError') toast('Copy the address of this page to share the tour.'); } });

/* ---------- the booking card: date, guests, one add-on, total. "Reserve" opens the reserve panel of the home page ---------- */
A.pick(THIS);
const buyDates = $('#buyDates');
A.onRender((S, t) => { if (t.slug !== THIS) return;
  const n = diff(S.date), third = n > 1 ? S.date : A.addDays(2);
  buyDates.innerHTML = [A.addDays(0), A.addDays(1), third].map((d) => '<button type="button" class="dchip' + (diff(d) === n ? ' is-on' : '') + '" data-tday="' + diff(d) + '"><small>' + (diff(d) === 0 ? 'Today' : diff(d) === 1 ? 'Tmrw' : WD[d.getDay()]) + '</small><b>' + d.getDate() + ' ' + MO[d.getMonth()] + '</b></button>').join('') + '<label class="dchip dchip--pick"><small>Other</small><b>' + ICO('calendar-days') + ' Pick</b><input type="date" id="buyDateOther" min="' + A.iso(A.addDays(0)) + '" aria-label="Pick another date"></label>';
  $('#buyAdults').textContent = S.adults; $('#buyChildren').textContent = S.children; $('#buyAddon').checked = S.addon; $('#buyAddonPrice').textContent = '+ ' + AED(150);
  $('#buyTotalLabel').textContent = 'Total, ' + A.gWord() + (S.addon ? ' + quad bike' : '') + (A.cur === 'AED' ? '' : ' · you pay ' + A.AEDS(A.total())); $('#buyTotal').textContent = AED(A.total());
  const d = S.date; $('#buyWa').href = waLink('Hi, I would like to book the ' + NAME + '\nDate: ' + WD[d.getDay()] + ', ' + d.getDate() + ' ' + MO[d.getMonth()] + '\nGuests: ' + A.gWord() + (S.addon ? '\nWith a quad bike, 30 minutes' : ''));
  $$('[data-addon-toggle]').forEach((b) => { b.classList.toggle('is-on', S.addon); b.innerHTML = S.addon ? ICO('check') + 'Added' : ICO('plus') + 'Add'; b.setAttribute('aria-pressed', String(S.addon)); }); });
buyDates.addEventListener('click', (e) => { const b = e.target.closest('[data-tday]'); if (b) A.set({ date: A.addDays(+b.dataset.tday) }); });
buyDates.addEventListener('change', (e) => { if (e.target.id !== 'buyDateOther' || !e.target.value) return; const p = e.target.value.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]); if (d >= A.addDays(0)) A.set({ date: d }); });
$('#buyAddon').addEventListener('change', (e) => A.set({ addon: e.target.checked }));
// a tour booked from "More desert safaris" uses the same panel: when it closes, this page is about its own tour again
let pWas = false; new MutationObserver(() => { const on = document.body.classList.contains('panel-open'); if (pWas && !on && A.S.slug !== THIS) A.pick(THIS); pWas = on; }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

/* ---------- the evening: one picture, five moments (the home page section) ---------- */
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

/* ---------- included, not included, add-ons, good to know, questions, the full guide ---------- */
$('#incYes').innerHTML = INCLUDED.map((x) => '<li>' + ICO('check') + '<span>' + esc(x) + '</span></li>').join('');
$('#incNo').innerHTML = EXCLUDED.map((x) => '<li>' + ICO('x') + '<span>' + esc(x) + '</span></li>').join('');
$('#tAdds').innerHTML = ADDONS.map((a) => '<article class="tadd"><div class="tadd__ph"><img src="' + P(a.img) + '" alt="' + esc(a.alt) + '" loading="lazy"></div><div class="tadd__body"><h3>' + esc(a.h) + '</h3><p>' + esc(a.p) + '</p>'
  + a.rows.map((r) => '<div class="tadd__row"><span><b>' + esc(r.b) + '</b><small>' + esc(r.s) + '</small></span><em>' + money(r.v) + '</em>'
    + (r.add ? '<button type="button" class="tadd__btn" data-addon-toggle aria-pressed="false">' + ICO('plus') + 'Add</button>'
             : '<a class="tadd__btn tadd__btn--wa" href="' + waLink('Hi, I would like to add ' + a.h + ', ' + r.b + ' (AED ' + r.v + ') to the ' + NAME) + '" target="_blank" rel="noopener" aria-label="Ask about ' + esc(a.h + ', ' + r.b) + ' on WhatsApp">' + ICO('whatsapp') + 'Ask</a>') + '</div>').join('') + '</div></article>').join('');
document.addEventListener('click', (e) => { if (e.target.closest('[data-addon-toggle]')) { A.set({ addon: !A.S.addon }); toast(A.S.addon ? 'Quad bike added to your booking: ' + AED(A.total()) + ' total.' : 'Quad bike removed from your booking.'); } });
$('#tKnow').innerHTML = KNOW.map(([ic, h, list]) => '<li><i class="ic">' + ICO(ic) + '</i><h3>' + h + '</h3><ul>' + list.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></li>').join('');
const faq = $('#tFaq'); faq.innerHTML = QA.map(([q, a]) => '<details><summary>' + esc(q) + '<i></i></summary><p>' + esc(a) + '</p></details>').join('');
const fAll = $$('details', faq); fAll.forEach((d) => d.addEventListener('toggle', () => { if (d.open) fAll.forEach((o) => { if (o !== d) o.open = false; }); }));
$('#tGuide').innerHTML = GUIDE.map(([h, p, list]) => '<h3>' + esc(h) + '</h3>' + (p ? '<p>' + esc(p) + '</p>' : '') + (list ? '<ul>' + list.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '')).join('');

/* ---------- "on this page": chips that jump to a part and show where you are ---------- */
const PARTS = [['about', 'Overview'], ['evening', 'Hour by hour'], ['included', 'Included'], ['addons', 'Add-ons'], ['know', 'Good to know'], ['questions', 'Questions'], ['proof', 'Reviews']];
const tNav = $('#tNav'); tNav.innerHTML = PARTS.map(([id, l], i) => '<a class="chip' + (i ? '' : ' is-on') + '" href="#' + id + '" data-part="' + id + '">' + l + '</a>').join('');
(function () { const chips = $$('.chip', tNav), seen = new Map();
  const io = new IntersectionObserver((es) => { es.forEach((e) => seen.set(e.target.id, e.isIntersecting)); const cur = PARTS.map((p) => p[0]).filter((id) => seen.get(id))[0]; if (!cur) return; chips.forEach((c) => c.classList.toggle('is-on', c.dataset.part === cur)); }, { rootMargin: '-30% 0px -55% 0px' });
  PARTS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); }); })();

/* ---------- reviews: the deck of the home page ---------- */
const deck = $('#deck'), R = A.REVIEWS; let top = 0;
deck.innerHTML = R.map((r) => '<blockquote>' + ICO('quote') + '<p>"' + esc(r.q) + '"</p><footer><i>' + esc(r.i) + '</i>' + esc(r.n) + '<span>· Google</span></footer></blockquote>').join('') + '<span class="deck__hint">Tap the card for the next review ' + ICO('arrow-right') + '</span>';
const dcards = $$('blockquote', deck);
function lay() { dcards.forEach((c, k) => { const d = ((k - top) % R.length + R.length) % R.length; c.style.zIndex = String(R.length - d); c.style.transform = 'translateY(' + d * 14 + 'px) scale(' + (1 - d * 0.045) + ') rotate(' + (d === 0 ? 0 : d % 2 ? 1.6 : -1.6) + 'deg)'; c.style.opacity = d > 2 ? '0' : '1'; c.setAttribute('aria-hidden', String(d !== 0)); }); }
function flip() { const c = dcards[top]; c.style.transform = 'translateX(60%) rotate(14deg)'; c.style.opacity = '0'; top = (top + 1) % R.length; setTimeout(lay, RM ? 0 : 260); }
deck.addEventListener('click', flip); lay();
let dSeen = false; new IntersectionObserver((es) => { dSeen = es[0].isIntersecting; }, { threshold: 0.5 }).observe(deck);
if (!RM) setInterval(() => { if (dSeen && !deck.matches(':hover') && !busy()) flip(); }, 5200);

/* ---------- more safaris: the tour cards of the home page ---------- */
$('#alsoCards').innerHTML = ALSO.map(bySlug).filter(Boolean).map((t, i) => A.cardHTML(t, i)).join('');
A.onCurrency(() => { $('#alsoCards').innerHTML = ALSO.map(bySlug).filter(Boolean).map((t, i) => A.cardHTML(t, i)).join(''); });

/* ---------- footer, and the links that belong to the home page ---------- */
A.mountFoot($('#foot'));
(function () { const groups = $$('.fgrp'), wide = matchMedia('(min-width:901px)'); const sync = () => groups.forEach((g) => { g.open = wide.matches; }); wide.addEventListener('change', sync); sync();
  groups.forEach((g) => g.addEventListener('toggle', () => { if (g.open && !wide.matches) groups.forEach((o) => { if (o !== g) o.open = false; }); })); })();
function homeLinks(root) { $$('a[href^="#"]', root).forEach((a) => { const h = a.getAttribute('href'); if (h === '#' || document.getElementById(h.slice(1))) return; const f = a.dataset.filter; a.setAttribute('href', HOME + (f ? '?f=' + f : '') + h); a.removeAttribute('data-filter'); }); }
homeLinks($('#foot'));

/* ---------- side menu, with quick booking (as on the home page) ---------- */
const drawer = $('#drawer'), dScrim = $('#dScrim'), menuBtn = $('#menuBtn'); let dLast = null;
const shown = TOURS.filter((t) => t.cat !== 'visa'), low = (k) => Math.min.apply(null, shown.filter((t) => (k === 'abudhabi' ? t.place === 'Abu Dhabi' : t.cat === k)).map((t) => t.price));
const DCARDS = [['safari', 'Desert Safari', 'img/aet-o-desert-safari.jpg'], ['cruise', 'Dhow Cruises', 'img/aet-o-dhow-cruise.jpg'], ['private', 'City Tours', 'img/aet-o-dubai-city-tour.jpg'], ['abudhabi', 'Abu Dhabi', 'img/aet-o-abu-dhabi-city-tour.jpg']];
$('#dGrid').innerHTML = DCARDS.map(([k, l, img]) => '<a class="dcard" href="' + HOME + '?tab=' + k + '#book"><img src="' + P(img) + '" alt="" loading="lazy"><b>' + l + '</b><small>' + money(low(k), 'from ') + '</small></a>').join('');
$('#dSocial').innerHTML = A.socialHTML();
function openDrawer() { dLast = document.activeElement; drawer.hidden = false; dScrim.hidden = false; requestAnimationFrame(() => { drawer.classList.add('is-on'); dScrim.classList.add('is-on'); document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); eSync(); }); $('#dClose').focus(); }
function closeDrawer() { if (drawer.hidden) return; drawer.classList.remove('is-on'); if (sheet.hidden) dScrim.classList.remove('is-on'); document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); setTimeout(() => { drawer.hidden = true; if (sheet.hidden) dScrim.hidden = true; }, 450); if (dLast && dLast.focus) dLast.focus(); eSync(); }
menuBtn.addEventListener('click', openDrawer); $('#dClose').addEventListener('click', closeDrawer);
drawer.addEventListener('click', (e) => { if (e.target.closest('a[href]')) closeDrawer(); });
const qbTour = $('#qbTour'), qbDate = $('#qbDate'), qbGuests = $('#qbGuests');
function fillQb() { const cur = qbTour.value || THIS; qbTour.innerHTML = A.CATS.map(([k, l]) => '<optgroup label="' + l + '">' + TOURS.filter((t) => t.cat === k).map((t) => '<option value="' + t.slug + '">' + esc(A.nameOf(t)) + ' · ' + AED(t.price) + '</option>').join('') + '</optgroup>').join(''); qbTour.value = cur; }
fillQb(); qbDate.min = A.iso(A.addDays(0)); qbDate.value = A.iso(A.S.date);
qbGuests.innerHTML = Array.from({ length: 12 }, (_, i) => '<option value="' + (i + 1) + '"' + (i === 1 ? ' selected' : '') + '>' + (i + 1) + (i ? ' guests' : ' guest') + '</option>').join('');
$('#qbGo').addEventListener('click', () => { const t = bySlug(qbTour.value); if (!t) return; const p = (qbDate.value || A.iso(A.addDays(0))).split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2]);
  A.set({ slug: t.slug, tab: t.cat, date: d >= A.addDays(0) ? d : A.addDays(0), adults: +qbGuests.value, children: 0 }); closeDrawer(); setTimeout(() => A.openPanel(), 80); });

/* ---------- language and currency (as on the home page) ---------- */
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
A.onCurrency(() => { fillCur(); fillQb(); });
document.addEventListener('keydown', (e) => {
  if (!lb.hidden) { if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowLeft') lbShow(lbi - 1); else if (e.key === 'ArrowRight') lbShow(lbi + 1); return; }
  if (e.key !== 'Escape') return; if (!sheet.hidden) closeSheet(); else if (!drawer.hidden) closeDrawer(); });

/* ---------- the rest ---------- */
new MutationObserver(eSync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
A.fill(); A.reveal(); A.paint(); A.stickyAfter($('#buy'));
const nav = $('#nav'); const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40); addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
