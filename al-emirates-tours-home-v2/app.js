/* Al Emirates Tours · Home V2 prototype · motion. GSAP 3 + ScrollTrigger + Lenis, all local. Respects prefers-reduced-motion. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  let lenis = null;
  if (!RM && window.Lenis) { lenis = new Lenis({ lerp: 0.09, smoothWheel: true }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: 0, duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' }); }));

  /* Dubai clock (UTC+4) */
  const fmt = d => { let h = d.getUTCHours() + 4, m = d.getUTCMinutes(); h = (h + 24) % 24; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + String(m).padStart(2, '0') + ' ' + ap; };
  const tick = () => { const b = $('#clock b'); if (b) b.textContent = fmt(new Date()); }; tick(); setInterval(tick, 20000);

  /* hero headline split */
  const split = el => { const words = el.textContent.trim().split(/\s+/); el.innerHTML = words.map(w => `<span class="w"><i>${w}</i></span>`).join(''); return $$('.w i', el); };
  const h1 = $('#heroH1'); let h1words = split(h1);
  const heroIn = (delay = 0) => { if (RM) return; gsap.timeline({ delay }).to(h1words, { y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.07 }).to('#heroSub', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=0.6').to('.hero__cta', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=0.6').to('#proof', { opacity: 1, duration: .8 }, '-=0.5').from('.dock__item', { y: 24, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out' }, '-=0.7'); };

  /* loader, once per session */
  const loader = $('#loader');
  const seen = sessionStorage.getItem('aet-v2-loaded');
  if (RM || seen) { loader.remove(); heroIn(0.1); }
  else {
    sessionStorage.setItem('aet-v2-loaded', '1');
    gsap.timeline({ onComplete: () => { loader.remove(); } })
      .to('.loader__line span', { opacity: 1, y: 0, duration: .7, stagger: .12, ease: 'power3.out' }, .2)
      .to('.loader__sun', { scale: 1.15, y: -60, duration: 1.8, ease: 'power2.out' }, 0)
      .to('.loader__bar i', { width: '100%', duration: 1.3, ease: 'power2.inOut' }, .3)
      .add(() => heroIn(0), 1.5)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'power4.inOut' }, 1.6);
    loader.style.clipPath = 'inset(0 0 0 0)';
  }

  /* mood dock: swaps scene + headline */
  const dock = $('#dock');
  let moodTimer = null;
  const setMood = (btn) => {
    const mood = btn.dataset.mood;
    $$('.dock__item', dock).forEach(b => b.classList.toggle('is-on', b === btn));
    $$('.hero .scene').forEach(s => { const on = s.dataset.mood === mood; s.classList.toggle('is-on', on); if (s.tagName === 'VIDEO') { on ? s.play().catch(() => { }) : s.pause(); } });
    document.body.dataset.mood = mood;
    if (RM) { h1.textContent = btn.dataset.h1; $('#heroSub').textContent = btn.dataset.sub; return; }
    gsap.to(h1words, { y: '110%', duration: .35, ease: 'power2.in', stagger: .02, onComplete: () => { h1.textContent = btn.dataset.h1; h1words = split(h1); gsap.to(h1words, { y: 0, duration: .9, ease: 'power4.out', stagger: .06 }); } });
    gsap.to('#heroSub', { opacity: 0, y: 8, duration: .25, onComplete: () => { $('#heroSub').textContent = btn.dataset.sub; gsap.to('#heroSub', { opacity: 1, y: 0, duration: .6, delay: .25 }); } });
  };
  $$('.dock__item', dock).forEach(b => { b.addEventListener('mouseenter', () => { clearTimeout(moodTimer); moodTimer = setTimeout(() => setMood(b), 140); }); b.addEventListener('click', () => setMood(b)); b.addEventListener('focus', () => setMood(b)); });

  /* nav solid after the hero */
  ScrollTrigger.create({ start: 'top -80', onUpdate: s => $('#nav').classList.toggle('is-solid', s.scroll() > 80) });

  /* hero parallax on scroll */
  if (!RM) gsap.to('.hero__copy', { y: 120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* THE DAY: pinned story, 5 beats; sky, scene, clock, timeline all driven by progress */
  const beats = $$('.beat'), scenes = $$('.day__scene'), dots = $$('#timeline span'), bar = $('#timeline i');
  const skies = ['linear-gradient(180deg,#F8D28A 0%,#F2A24A 45%,#D86A2A 100%)', 'linear-gradient(180deg,#F6B26B 0%,#E8732E 50%,#B4451B 100%)', 'linear-gradient(180deg,#7B3B6E 0%,#E85D2A 55%,#F2B544 100%)', 'linear-gradient(180deg,#0B0F4F 0%,#2A1E5C 60%,#7B3B2E 100%)', 'linear-gradient(180deg,#03041F 0%,#05073C 70%,#0B0F4F 100%)'];
  const stars = $('#stars'); for (let i = 0; i < 90; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 70 + '%'; s.style.animationDelay = (Math.random() * 3) + 's'; s.style.transform = 'scale(' + (0.6 + Math.random() * 1.2) + ')'; stars.appendChild(s); }
  let cur = -1;
  const showBeat = i => {
    if (i === cur) return; cur = i;
    beats.forEach((b, k) => gsap.to(b, { opacity: k === i ? 1 : 0, y: k === i ? 0 : (k < i ? -30 : 30), duration: RM ? 0 : .6, ease: 'power3.out', overwrite: true }));
    scenes.forEach((s, k) => gsap.to(s, { opacity: k === i ? 1 : 0, scale: k === i ? 1 : 1.08, duration: RM ? 0 : 1.2, ease: 'power2.out', overwrite: true }));
    gsap.to('.day__sky', { background: skies[i], duration: RM ? 0 : 1.2, ease: 'power2.out' });
    gsap.to(stars, { opacity: i >= 3 ? 1 : 0, duration: 1.2 });
    dots.forEach((d, k) => d.classList.toggle('is-on', k <= i));
    $('#dayClock').textContent = beats[i].dataset.time; $('#dayPlace').textContent = beats[i].dataset.place;
  };
  showBeat(0);
  ScrollTrigger.create({ trigger: '.day', start: 'top top', end: 'bottom bottom', onUpdate: s => { const p = s.progress; showBeat(Math.min(4, Math.floor(p * 5.001))); bar.style.width = (p * 100) + '%'; } });
  gsap.from('.day__head', { opacity: 0, y: -20, duration: .8, scrollTrigger: { trigger: '.day', start: 'top 60%' } });

  /* WORLDS: horizontal scroll on desktop */
  const track = $('#worldsTrack');
  const mq = matchMedia('(min-width: 761px)');
  let worldsST = null;
  const buildWorlds = () => { if (worldsST) { worldsST.kill(); worldsST = null; gsap.set(track, { x: 0 }); } if (!mq.matches || RM) return; const dist = () => track.scrollWidth - innerWidth + 40; worldsST = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.worlds', start: 'top top', end: () => '+=' + (dist() + 200), scrub: 0.6, pin: '.worlds__pin', pinSpacing: true, invalidateOnRefresh: true } }).scrollTrigger; };
  $('.worlds').style.height = ''; buildWorlds(); mq.addEventListener('change', buildWorlds);

  /* reveals */
  $$('.reveal').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-in') }));
  const polaroids = $$('.polaroid'); ScrollTrigger.create({ trigger: '#polaroids', start: 'top 80%', once: true, onEnter: () => polaroids.forEach((p, i) => setTimeout(() => p.classList.add('is-in'), i * 140)) });
  if (!RM) { gsap.utils.toArray('.card').forEach((c, i) => gsap.from(c, { y: 40, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 90%', once: true }, delay: (i % 4) * 0.08 })); gsap.to('.sea__photo img', { scale: 1, ease: 'none', scrollTrigger: { trigger: '.sea', start: 'top bottom', end: 'bottom top', scrub: true } }); }

  /* tilt cards + magnetic buttons (pointer devices) */
  if (!RM && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(c => { c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; gsap.to(c, { rotateY: x * 10, rotateX: -y * 8, y: -6, duration: .5, ease: 'power2.out', transformPerspective: 900 }); }); c.addEventListener('mouseleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, y: 0, duration: .7, ease: 'power3.out' })); });
    $$('.magnetic').forEach(b => { b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power2.out' }); }); b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.5)' })); });
  }

  /* WhatsApp chat typed in front of you */
  const chat = $('#chat'); let chatDone = false;
  const typeMsg = (el, text, speed) => new Promise(res => { el.classList.add('is-in'); el.innerHTML = '<span class="cursor"></span>'; let i = 0; const t = setInterval(() => { i++; el.innerHTML = text.slice(0, i) + (i < text.length ? '<span class="cursor"></span>' : ''); if (i >= text.length) { clearInterval(t); res(); } }, speed); });
  ScrollTrigger.create({ trigger: chat, start: 'top 75%', once: true, onEnter: async () => { if (chatDone) return; chatDone = true; const msgs = $$('.msg', chat); if (RM) { msgs.forEach(m => { m.textContent = m.dataset.typed; m.classList.add('is-in'); }); return; } await new Promise(r => setTimeout(r, 500)); await typeMsg(msgs[0], msgs[0].dataset.typed, 28); await new Promise(r => setTimeout(r, 900)); await typeMsg(msgs[1], msgs[1].dataset.typed, 16); await new Promise(r => setTimeout(r, 700)); msgs[2].textContent = msgs[2].dataset.typed; msgs[2].classList.add('is-in'); } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
