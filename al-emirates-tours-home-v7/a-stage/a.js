/* V7 A · the stage: a four-tour slider that is the hero. The tour on stage is also the tour in the booking bar. */
(function () {
'use strict';
const A = window.AET, { $, $$, OFFERS, ICO, AED, esc, pad, bySlug } = A;
const stage = $('#stage'), word = $('#stWord'), tx = $('#stTx'), arch = $('#arch'), picks = $('#picks'), seal = $('#stSeal span');

/* build the four */
tx.innerHTML = OFFERS.map((o, i) => { const t = bySlug(o.slug); return '<div class="stx" data-i="' + i + '"><p class="stx__n">' + pad(i + 1) + ' / ' + pad(OFFERS.length) + '</p>' + (i === 0 ? '<h1 class="stx__name">' : '<h2 class="stx__name">') + esc(o.name) + (i === 0 ? '</h1>' : '</h2>') + '<p class="stx__p">' + esc(o.p) + '</p><p class="stx__meta">' + o.meta.map((m) => '<span>' + ICO(m[0]) + esc(m[1]) + '</span>').join('') + '</p><div class="stx__buy"><p class="stx__price"><small>from, ' + t.unit + '</small><b>' + AED(t.price) + '</b>' + (t.old ? '<s>' + AED(t.old) + '</s>' : '') + '</p><button class="btn btn--orange btn--chip" data-book="' + o.slug + '">Book now <i>' + ICO('arrow-right') + '</i></button><a class="stx__ask" href="' + A.waLink('Hi, I am interested in the ' + o.name) + '" target="_blank" rel="noopener" aria-label="Ask about the ' + esc(o.name) + ' on WhatsApp">' + ICO('whatsapp') + '</a></div></div>'; }).join('');
arch.insertAdjacentHTML('afterbegin', OFFERS.map((o, i) => '<figure data-i="' + i + '"><img src="' + o.img + '" alt="' + esc(o.alt) + '"' + (i ? ' loading="lazy"' : '') + ' draggable="false"></figure>').join(''));
picks.innerHTML = '<p class="picks__h">Choose your day out</p>' + OFFERS.map((o, i) => { const t = bySlug(o.slug); return '<button class="pick" data-pick="' + i + '"><img src="' + o.img + '" alt="" loading="lazy"><span><b>' + esc(o.name) + '</b><small>from ' + AED(t.price) + '</small></span>' + ICO('arrow-right') + '</button>'; }).join('');
const blocks = $$('.stx', tx), figs = $$('figure', arch), btns = $$('.pick', picks);

let cur = -1, locked = false;
function show(i) {
  const o = OFFERS[i]; if (i === cur) return;
  figs.forEach((f, k) => { f.classList.toggle('was-on', k === cur); f.classList.remove('is-on'); }); void arch.offsetWidth; figs[i].classList.add('is-on');
  blocks.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.inert = k !== i; });
  btns.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.style.setProperty('--p', 0); b.setAttribute('aria-pressed', String(k === i)); });
  stage.style.setProperty('--tint', o.tint);
  word.textContent = o.word; word.style.fontSize = 'min(' + Math.min(30, 150 / o.word.length).toFixed(1) + 'vw,' + (innerWidth < 701 ? '34' : '56') + 'vh)'; word.classList.remove('is-in'); void word.offsetWidth; word.classList.add('is-in');
  seal.innerHTML = esc(o.seal[0]) + '<b>' + esc(o.seal[1]) + '</b>';
  cur = i; if (!locked) A.pick(o.slug);
}
const cyc = A.cycle(OFFERS.length, 6500, show);
cyc.onProgress = (p, i) => btns[i].style.setProperty('--p', p.toFixed(3));
picks.addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (!b) return; locked = false; cyc.go(+b.dataset.pick); });
show(0);

/* pause while the visitor is reading, choosing or booking; stop changing the bar once they have touched it */
let hover = false, seen = true;
const sync = () => cyc.pause(hover || !seen || locked || document.body.classList.contains('panel-open') || document.body.classList.contains('is-picking'));
$('#stGrid').addEventListener('mouseenter', () => { hover = true; sync(); }); $('#stGrid').addEventListener('mouseleave', () => { hover = false; sync(); });
$('#bar').addEventListener('pointerdown', () => { locked = true; sync(); }, true);
new IntersectionObserver((es) => { seen = es[0].isIntersecting; sync(); }, { threshold: 0.4 }).observe(stage);
new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
stage.addEventListener('keydown', (e) => { if (e.target.closest('input')) return; if (e.key === 'ArrowRight') cyc.go(cyc.index + 1); else if (e.key === 'ArrowLeft') cyc.go(cyc.index - 1); });
/* swipe the arch on phones */
let sx = null; arch.addEventListener('pointerdown', (e) => { sx = e.clientX; }); addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) cyc.go(cyc.index + (dx < 0 ? 1 : -1)); });
arch.style.touchAction = 'pan-y';

/* the rest of the page */
A.mountBar($('#bar'), { up: true, compact: true });
A.mountCards({ chips: $('#chips'), cards: $('#cards'), all: 12 }); A.scroller($('#cards'), $('#cPrev'), $('#cNext'));
$('#timeline').innerHTML = A.TIMELINE.map((s) => '<li class="stop reveal"><figure><img src="' + s.img + '" alt="' + esc(s.h) + '" loading="lazy"><figcaption>' + s.t + '</figcaption></figure><span class="rail"></span><h3>' + esc(s.h) + '</h3><p>' + esc(s.p) + '</p></li>').join('');
$('#included').innerHTML = A.INCLUDED.map((x) => '<li>' + esc(x) + '</li>').join('');
$('#reviews').innerHTML = A.REVIEWS.map((r, i) => '<blockquote class="review' + (i === 0 ? ' review--hot' : '') + ' reveal"><span class="stars"></span><p>"' + esc(r.q) + '"</p><footer><i>' + esc(r.i) + '</i><b>' + esc(r.n) + '</b><span>· Google</span></footer></blockquote>').join('');
A.mountFaq($('#faq')); A.mountFoot($('#foot')); A.fill(); A.reveal(); A.stickyAfter(stage);
const nav = $('#nav'); const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40); addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
