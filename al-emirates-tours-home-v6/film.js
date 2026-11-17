/* Al Emirates Tours · Home V6 · the scroll film (from V4, shorter and lighter).
   Five clips instead of eight, each cut to about five seconds; the scroll position is the playhead.
   The layers push in as you scroll, tilt with the pointer, and the outgoing shot lifts and blurs as the next arrives.
   A small 2D canvas in front adds the air: sand, gold dust, embers, lights on the water (no 3D library). */
(function () {
'use strict';
const MOBILE = innerWidth < 760;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const X = 0.022; // half width of a crossfade, in journey units

const CLIPS = [
  { k: 'dunes',   a: 0.00, b: 0.15, fx: 'sand' },
  { k: 'convoy',  a: 0.15, b: 0.39, fx: 'sand' },
  { k: 'sunset',  a: 0.39, b: 0.61, fx: 'gold', pos: '46% 50%' },
  { k: 'tanoura', a: 0.61, b: 0.81, fx: 'ember', pos: '66% 50%' },
  { k: 'marina',  a: 0.81, b: 1.01, fx: 'bokeh', pos: '72% 50%' },
];

const film = document.getElementById('film');
if (!film) return;
const size = MOBILE ? '640' : '1280';
CLIPS.forEach((c, i) => {
  const el = document.createElement('div'); el.className = 'shot'; el.style.zIndex = String(i + 1);
  el.style.backgroundImage = 'url(poster/' + c.k + '.jpg)';
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.preload = 'auto'; v.disablePictureInPicture = true; v.tabIndex = -1;
  v.addEventListener('loadeddata', () => { c.ready = true; el.classList.add('is-ready'); });
  v.addEventListener('error', () => { c.failed = true; });
  if (MOBILE && c.pos) { v.style.objectPosition = c.pos; el.style.backgroundPosition = c.pos; }
  el.appendChild(v); film.appendChild(el); c.el = el; c.v = v; c.loaded = false; c.ready = false; c.shown = null;
});
function load(i) { const c = CLIPS[i]; if (!c || c.loaded || RM) return; c.loaded = true; c.v.src = 'video/' + c.k + '-' + size + '.mp4'; c.v.load(); }

/* ---------- pointer ---------- */
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
if (matchMedia('(hover:hover)').matches) addEventListener('pointermove', (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

/* ---------- the air in front of the footage ---------- */
let fx = null;
(function buildFx() {
  const cv = document.getElementById('fx'); if (!cv || RM) return; const g = cv.getContext('2d'); if (!g) return;
  const MODES = {
    sand:  { c: '255,222,165', r: 2.4, o: 0.55, vx: 0.11, vy: 0.004, w: 0.5 },
    gold:  { c: '255,186,96',  r: 3.2, o: 0.50, vx: 0.03, vy: -0.008, w: 0.6 },
    ember: { c: '255,128,44',  r: 3.0, o: 0.85, vx: 0.012, vy: -0.075, w: 1.4 },
    bokeh: { c: '150,206,255', r: 15,  o: 0.17, vx: 0.006, vy: -0.004, w: 0.3 },
  };
  const sprite = {}; Object.keys(MODES).forEach((k) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(' + MODES[k].c + ',1)'); gr.addColorStop(0.35, 'rgba(' + MODES[k].c + ',.5)'); gr.addColorStop(1, 'rgba(' + MODES[k].c + ',0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); sprite[k] = c; });
  const N = MOBILE ? 44 : 110, P = []; for (let i = 0; i < N; i++) P.push({ x: Math.random(), y: Math.random(), z: 0.25 + Math.random() * 0.75, s: Math.random() });
  let W = 0, H = 0; const resize = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); };
  addEventListener('resize', resize); resize();
  const cur = { r: 2.4, o: 0.5, vx: 0.1, vy: 0, w: 0.5 }; let now = 'sand', prev = 'sand', mix = 1;
  fx = { draw(mode, time, dt, scrollV) {
    if (!MODES[mode]) mode = 'sand'; if (mode !== now) { prev = now; now = mode; mix = 0; } mix = Math.min(1, mix + dt * 1.6);
    const m = MODES[now], k = Math.min(1, dt * 2.2); for (const key of ['r', 'o', 'vx', 'vy', 'w']) cur[key] += (m[key] - cur[key]) * k;
    g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N; i++) { const p = P[i];
      p.x += dt * cur.vx * (0.5 + p.s) * p.z + Math.sin(time * cur.w + p.s * 40) * dt * 0.012;
      p.y += dt * cur.vy * (0.4 + p.s) + Math.cos(time * cur.w * 0.8 + p.s * 25) * dt * 0.006 - scrollV * 2.4 * p.z;
      if (p.x > 1.05) p.x -= 1.1; if (p.x < -0.05) p.x += 1.1; if (p.y > 1.05) p.y -= 1.1; if (p.y < -0.05) p.y += 1.1;
      const sz = cur.r * (0.5 + p.z * 1.6), px = p.x * W - mouse.sx * 18 * p.z, py = p.y * H - mouse.sy * 12 * p.z, al = cur.o * (0.35 + 0.65 * p.z);
      if (mix < 1) { g.globalAlpha = al * (1 - mix); g.drawImage(sprite[prev], px - sz, py - sz, sz * 2, sz * 2); }
      g.globalAlpha = al * mix; g.drawImage(sprite[now], px - sz, py - sz, sz * 2, sz * 2); }
    g.globalAlpha = 1; } };
})();

/* ---------- loop ---------- */
let target = 0, smooth = 0, running = true, last = performance.now(), time = 0, onFrame = null, drift = 0, prevSmooth = 0;
function paintFilm(t, dt) {
  let cur = 0; CLIPS.forEach((c, i) => { if (t >= c.a) cur = i; });
  load(cur); load(cur + 1); if (cur > 0) load(cur - 1);
  const moving = Math.abs(target - smooth) > 0.0006;
  if (!RM) { if (moving) drift *= Math.max(0, 1 - dt * 3); else drift = Math.min(1.6, drift + dt * 0.4); }
  mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3); mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
  CLIPS.forEach((c, i) => {
    const vis = i === 0 ? t < c.b + X : (t > c.a - X && t < c.b + X);
    if (vis !== c.shown) { c.shown = vis; c.el.style.visibility = vis ? 'visible' : 'hidden'; }
    if (!vis) return;
    const inK = i === 0 ? 1 : sstep(c.a - X, c.a + X, t), outK = i === CLIPS.length - 1 ? 0 : sstep(c.b - X, c.b + X, t);
    const local = clamp((t - c.a) / (c.b - c.a), 0, 1);
    const sc = 1.07 + local * 0.09 + outK * 0.22 + (1 - inK) * 0.06;
    const ty = (1 - inK) * 5 - outK * 4;
    c.el.style.opacity = inK.toFixed(3);
    c.el.style.transform = 'translate3d(' + (-mouse.sx * 14).toFixed(1) + 'px,' + (-mouse.sy * 10).toFixed(1) + 'px,0) translateY(' + ty.toFixed(2) + '%) rotateY(' + (mouse.sx * 1.5).toFixed(2) + 'deg) rotateX(' + (-mouse.sy * 1.1).toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
    const blur = outK > 0.02 ? (outK * 7).toFixed(1) : ''; if (blur !== c.blur) { c.blur = blur; c.el.style.filter = blur ? 'blur(' + blur + 'px)' : ''; }
    const v = c.v; if (c.ready && v.duration && !v.seeking) { const want = clamp(local * (v.duration - 0.1) + (i === cur ? drift : 0), 0, v.duration - 0.06); if (Math.abs(v.currentTime - want) > 0.035) { try { v.currentTime = want; } catch (e) {} } }
  });
  return CLIPS[cur].fx;
}
function frame(t0) { requestAnimationFrame(frame); const dt = Math.min((t0 - last) / 1000, 0.05); last = t0; if (!running) return;
  time += dt; smooth += (target - smooth) * (RM ? 1 : Math.min(1, dt * 5)); const t = clamp(smooth, 0, 1);
  const mode = paintFilm(t, dt); if (fx) fx.draw(mode, time, dt, smooth - prevSmooth); prevSmooth = smooth; if (onFrame) onFrame(t, time); }
load(0); load(1); requestAnimationFrame(frame);
window.AETFilm = { set(t) { target = t; }, jump(t) { target = t; smooth = t; prevSmooth = t; }, pause(p) { running = !p; }, onFrame(fn) { onFrame = fn; }, get t() { return smooth; }, clips: CLIPS };
})();
