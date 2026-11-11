/* Al Emirates Tours · Home V5 · booking-first prototype.
   One shared booking state (tour, date, guests, pickup) drives the hero bar, the sticky bar and the reserve panel.
   Nothing is sent anywhere: "Reserve" ends on a confirmation screen with a prefilled WhatsApp link. */
(function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = 'https://wa.me/971581320909';
const TOURS = (window.AET_TOURS || []).map((t) => Object.assign({}, t, { unit: t.cat === 'private' && !/private-city-tour/.test(t.slug) ? 'per person' : t.unit }));
const bySlug = (s) => TOURS.find((t) => t.slug === s);
const CATS = [['safari', 'Desert safari'], ['cruise', 'Cruises & yachts'], ['tickets', 'Tickets & parks'], ['private', 'Private tours'], ['visa', 'Visas']];
const SHORT = { 'desert-safari-dubai-in-99-aed': 'Evening Desert Safari' };
const nameOf = (t) => SHORT[t.slug] || t.name;
const AED = (v) => 'AED ' + (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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

/* ---------- hero bar ---------- */
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
function stepperHTML(key, label, sub) { return '<div class="stepper"><span><b>' + label + '</b><small>' + sub + '</small></span><span class="ctl"><button type="button" data-step="' + key + '" data-by="-1" aria-label="Fewer ' + label + '">−</button><b>' + S[key] + '</b><button type="button" class="plus" data-step="' + key + '" data-by="1" aria-label="More ' + label + '">+</button></span></div>'; }
function renderGuests() { popGuests.innerHTML = '<h4>Who is coming</h4>' + stepperHTML('adults', 'Adults', '') + stepperHTML('children', 'Children', ''); }
document.addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (!b) return; e.stopPropagation(); const k = b.dataset.step, v = S[k] + (+b.dataset.by); const min = k === 'adults' ? 1 : 0; if (v < min || v > 20) return; set({ [k]: v }); bump(); });
const fields = $$('.field[data-pop]');
function openPop(k) { fields.forEach((f) => f.classList.toggle('is-open', f.dataset.pop === k)); }
function closePops() { fields.forEach((f) => f.classList.remove('is-open')); }
fields.forEach((f) => $('.field__btn', f).addEventListener('click', (e) => { e.stopPropagation(); f.classList.contains('is-open') ? closePops() : openPop(f.dataset.pop); }));
document.addEventListener('click', (e) => { if (!e.target.closest('.pop') && !e.target.closest('.field__btn') && !e.target.closest('[data-tab]')) closePops(); });
$('#fPickup').addEventListener('input', (e) => { S.pickup = e.target.value; $('#pPickup').value = S.pickup; renderSticky(); });
$('#barGo').addEventListener('click', () => openPanel());

/* ---------- cards ---------- */
const FEATURED = ['desert-safari-dubai-in-99-aed', 'dinner-dhow-cruise-canal', 'burj-khalifa-at-the-top-tickets', 'desert-safari-with-falcon-photo', 'overnight-desert-safari', '5-star-mega-yacht-dinner-cruise', 'museum-of-the-future-tickets', 'private-city-tour-by-fortuner'];
const ORDER = FEATURED.map(bySlug).filter(Boolean).concat(TOURS.filter((t) => !FEATURED.includes(t.slug) && t.cat !== 'visa'));
const FILTERS = [['all', 'All'], ['safari', 'Desert safari'], ['cruise', 'Cruises'], ['tickets', 'Tickets'], ['private', 'Private'], ['u150', 'Under AED 150']];
const chipsEl = $('#chips'), cardsEl = $('#cards');
chipsEl.innerHTML = FILTERS.map(([k, l]) => '<button class="chip" role="tab" data-chip="' + k + '">' + l + '</button>').join('');
chipsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-chip]'); if (b) setFilter(b.dataset.chip); });
function setFilter(k) { S.filter = k; S.shown = 8; renderCards(); }
let saved = []; try { saved = JSON.parse(localStorage.getItem('aet-saved') || '[]'); } catch (e) {}
function renderCards() {
  $$('.chip', chipsEl).forEach((c) => c.classList.toggle('is-on', c.dataset.chip === S.filter));
  const list = ORDER.filter((t) => S.filter === 'all' ? true : S.filter === 'u150' ? t.price < 150 && t.unit === 'per person' : t.cat === S.filter);
  cardsEl.innerHTML = list.slice(0, S.shown).map((t, i) => '<article class="card" style="--i:' + (i % 8) + '"><div class="card__ph">' + (t.img ? '<img src="' + t.img + '" alt="' + esc(t.name) + '" loading="lazy">' : '<span class="ph-label">' + esc(t.name) + '</span>') + (t.save ? '<span class="tag">Save ' + t.save + '%</span>' : '') + '<button class="heart' + (saved.includes(t.slug) ? ' is-on' : '') + '" data-save="' + t.slug + '" aria-label="Save ' + esc(t.name) + '">' + (saved.includes(t.slug) ? '♥' : '♡') + '</button></div><div class="card__body"><p class="card__meta">' + esc(t.dest) + (t.dur ? ' · ' + t.dur : '') + '</p><h3 class="card__name">' + esc(t.name) + '</h3><p class="card__rate"><span class="stars">★★★★★</span> ' + t.rating + ' (' + t.reviews + ')' + (t.cat === 'safari' || t.cat === 'cruise' ? ' <em>· Hotel pickup</em>' : '') + '</p><div class="card__foot"><p class="price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</p><span class="card__acts"><a class="wa" href="' + WA + '?text=' + encodeURIComponent('Hi, I am interested in ' + t.name) + '" target="_blank" rel="noopener" aria-label="Ask about ' + esc(t.name) + ' on WhatsApp">✆</a><button class="btn btn--navy" data-book="' + t.slug + '">Book</button></span></div></div></article>').join('');
  const more = list.length - Math.min(S.shown, list.length); $('#moreBtn').hidden = more <= 0; $('#cardsCount').textContent = 'Showing ' + Math.min(S.shown, list.length) + ' of ' + list.length;
}
$('#moreBtn').addEventListener('click', () => { S.shown += 8; renderCards(); });
cardsEl.addEventListener('click', (e) => { const h = e.target.closest('[data-save]'); if (!h) return; const s = h.dataset.save; saved = saved.includes(s) ? saved.filter((x) => x !== s) : saved.concat(s); try { localStorage.setItem('aet-saved', JSON.stringify(saved)); } catch (err) {} h.classList.toggle('is-on', saved.includes(s)); h.textContent = saved.includes(s) ? '♥' : '♡'; });
document.addEventListener('click', (e) => { const a = e.target.closest('[data-filter]'); if (a) setFilter(a.dataset.filter); });

/* ---------- reserve panel ---------- */
const panel = $('#panel'), scrim = $('#scrim'), sticky = $('#sticky'); let lastFocus = null;
function openPanel(slug) { if (slug && bySlug(slug)) { const t = bySlug(slug); set({ slug, tab: t.cat }); } closePops(); lastFocus = document.activeElement; $('#pBody').hidden = false; $('#pDone').hidden = true; panel.hidden = false; scrim.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => { panel.classList.add('is-on'); scrim.classList.add('is-on'); }); $('#pClose').focus(); syncSticky(); }
function closePanel() { panel.classList.remove('is-on'); scrim.classList.remove('is-on'); document.body.style.overflow = ''; setTimeout(() => { panel.hidden = true; scrim.hidden = true; }, 450); if (lastFocus && lastFocus.focus) lastFocus.focus(); syncSticky(); }
document.addEventListener('click', (e) => { const b = e.target.closest('[data-book]'); if (!b) return; e.preventDefault(); openPanel(b.dataset.book || null); });
$('#pClose').addEventListener('click', closePanel); scrim.addEventListener('click', closePanel);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!panel.hidden) closePanel(); else closePops(); } });
const pDates = $('#pDates');
function renderPanelDates() {
  const n = diffDays(S.date), third = n > 1 ? S.date : addDays(2);
  const opts = [addDays(0), addDays(1), third];
  pDates.innerHTML = opts.map((d) => '<button type="button" class="dchip' + (diffDays(d) === n ? ' is-on' : '') + '" data-pday="' + diffDays(d) + '"><small>' + (diffDays(d) === 0 ? 'Today' : diffDays(d) === 1 ? 'Tmrw' : WD[d.getDay()]) + '</small><b>' + d.getDate() + ' ' + MO[d.getMonth()] + '</b></button>').join('') + '<label class="dchip dchip--pick"><small>Other</small><b>▦ Pick</b><input type="date" id="pDateOther" min="' + iso(day0) + '" aria-label="Pick another date"></label>';
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
$('#dAgain').addEventListener('click', () => { closePanel(); location.hash = '#booked'; });

/* ---------- sticky bar ---------- */
const heroEl = $('.hero'), footEl = $('.foot');
function syncSticky() { const r = heroEl.getBoundingClientRect(), f = footEl.getBoundingClientRect(); const on = r.bottom < 80 && f.top > innerHeight * 0.6 && !panel.classList.contains('is-on'); sticky.classList.toggle('is-on', on); sticky.setAttribute('aria-hidden', String(!on)); }
addEventListener('scroll', syncSticky, { passive: true }); addEventListener('resize', syncSticky);
function renderSticky() { const t = tour(); $('#stName').textContent = nameOf(t); $('#stSub').textContent = dWord(S.date) + ' · ' + gWord() + (S.pickup ? ' · pickup ' + S.pickup : ''); $('#stTotal').textContent = AED(total()); const im = $('#stImg'); if (t.img) { im.src = t.img; im.style.display = ''; } else im.style.display = 'none'; }

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
// from-prices on the world tiles come from the data
const minOf = (c) => Math.min.apply(null, TOURS.filter((t) => t.cat === c).map((t) => t.price));
const cnt = (c) => TOURS.filter((t) => t.cat === c).length;
$('#wSafari').textContent = cnt('safari') + ' safaris · from ' + AED(minOf('safari')); $('#wCruise').textContent = cnt('cruise') + ' cruises and yachts · from ' + AED(minOf('cruise')); $('#wPrivate').textContent = 'from ' + AED(minOf('private'));
// the "choose the date" illustration uses real dates
(function () { const sat = addDays(((6 - day0.getDay()) + 7) % 7 || 7); const list = [['Today', addDays(0)], ['Tomorrow', addDays(1)], [WDL[sat.getDay()], sat]]; $('#vizDates').innerHTML = list.map(([l, d], i) => '<span class="dchip' + (i === 2 ? ' is-on' : '') + '"><small>' + l + '</small><b>' + WD[d.getDay()] + ' ' + d.getDate() + '</b></span>').join('') + '<span class="dchip"><small>Pick</small><b>▦</b></span>'; $('#vizDay').textContent = WDL[sat.getDay()] + ' ' + sat.getDate() + ' ' + MO[sat.getMonth()]; })();
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

render(); renderCards(); syncSticky();
})();
