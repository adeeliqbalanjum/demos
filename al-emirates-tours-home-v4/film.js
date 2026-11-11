/* Al Emirates Tours · Home V4 "the real day": real footage, moved by the scroll.
   Same interface as V3's world.js (window.AETWorld: set, jump, pause, onFrame, t), so app.js is unchanged.
   Each clip owns a slice of the journey; the scroll position is the playhead. Layers sit in a 3D stage:
   they push in as you scroll, tilt with the pointer, and the outgoing shot lifts and blurs as the next arrives.
   A transparent three.js layer in front adds depth: sand in the air, embers at the camp, lights on the water. */
(function () {
'use strict';
const MOBILE = Math.min(innerWidth, innerHeight) < 700;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const X = 0.013; // half width of a crossfade, in journey units

const CLIPS = [
  { k: 'dunes',    a: 0.00, b: 0.11, fx: 'sand' },
  { k: 'convoy',   a: 0.11, b: 0.28, fx: 'sand' },
  { k: 'sunset',   a: 0.28, b: 0.43, fx: 'gold', pos: '46% 50%' },
  { k: 'tanoura',  a: 0.43, b: 0.52, fx: 'ember', pos: '66% 50%' },
  { k: 'fire',     a: 0.52, b: 0.60, fx: 'ember', pos: '80% 50%' },
  { k: 'marina',   a: 0.60, b: 0.82, fx: 'bokeh', pos: '72% 50%' },
  { k: 'clouds',   a: 0.82, b: 0.905, fx: 'mist' },
  { k: 'balloons', a: 0.905, b: 1.01, fx: 'mist', pos: '62% 50%' },
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
addEventListener('pointermove', (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

/* ---------- the 3D layer in front of the footage ---------- */
let fx = null;
(function buildFx() {
  const T = window.THREE, canvas = document.getElementById('fx'); if (!T || !canvas || RM) return;
  try {
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(55, 1, 0.1, 200); camera.position.set(0, 0, 0);
    const N = MOBILE ? 220 : 520, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 60; pos[i * 3 + 1] = (Math.random() - 0.5) * 30; pos[i * 3 + 2] = -4 - Math.random() * 46; seed[i] = Math.random(); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const mat = new T.PointsMaterial({ map: new T.CanvasTexture(cv), size: 0.3, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.6, color: 0xffd9a0 });
    const pts = new T.Points(geo, mat); scene.add(pts);
    const MODES = {
      sand:  { c: [1.00, 0.86, 0.62], s: 0.22, o: 0.55, vx: 5.5, vy: 0.15, vz: 1.2, w: 0.5 },
      gold:  { c: [1.00, 0.70, 0.32], s: 0.30, o: 0.50, vx: 1.4, vy: 0.25, vz: 0.4, w: 0.6 },
      ember: { c: [1.00, 0.45, 0.12], s: 0.34, o: 0.85, vx: 0.5, vy: 2.6, vz: 0.0, w: 1.4 },
      bokeh: { c: [0.55, 0.80, 1.00], s: 1.10, o: 0.22, vx: 0.25, vy: 0.10, vz: 0.0, w: 0.3 },
      mist:  { c: [1.00, 0.95, 0.88], s: 0.90, o: 0.16, vx: 1.2, vy: 0.05, vz: 0.6, w: 0.2 },
    };
    const cur = { c: [1, 0.86, 0.62], s: 0.22, o: 0.5, vx: 5, vy: 0.1, vz: 1, w: 0.5 };
    const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
    addEventListener('resize', resize); resize();
    fx = { draw(mode, time, dt, scrollV) { const m = MODES[mode] || MODES.sand, k = Math.min(1, dt * 2.2);
        for (const key of ['s', 'o', 'vx', 'vy', 'vz', 'w']) cur[key] += (m[key] - cur[key]) * k; for (let j = 0; j < 3; j++) cur.c[j] += (m.c[j] - cur.c[j]) * k;
        mat.color.setRGB(cur.c[0], cur.c[1], cur.c[2]); mat.size = cur.s; mat.opacity = cur.o;
        const push = scrollV * 900; // scrolling pulls the particles past you
        for (let i = 0; i < N; i++) { const a = i * 3, sd = seed[i];
          pos[a] += dt * cur.vx * (0.5 + sd) + Math.sin(time * cur.w + sd * 40) * dt * 0.6;
          pos[a + 1] += dt * cur.vy * (0.4 + sd) + Math.cos(time * cur.w * 0.8 + sd * 25) * dt * 0.25;
          pos[a + 2] += dt * cur.vz + push * dt;
          if (pos[a] > 30) pos[a] -= 60; if (pos[a] < -30) pos[a] += 60; if (pos[a + 1] > 15) pos[a + 1] -= 30; if (pos[a + 1] < -15) pos[a + 1] += 30; if (pos[a + 2] > -1) pos[a + 2] -= 48; if (pos[a + 2] < -50) pos[a + 2] += 48; }
        geo.attributes.position.needsUpdate = true; camera.rotation.y = -mouse.sx * 0.05; camera.rotation.x = -mouse.sy * 0.035; renderer.render(scene, camera); } };
  } catch (e) { fx = null; }
})();

/* ---------- loop ---------- */
let target = 0, smooth = 0, running = true, last = performance.now(), time = 0, onFrame = null, snap = false, drift = 0, prevSmooth = 0;
function paintFilm(t, dt) {
  let cur = 0; CLIPS.forEach((c, i) => { if (t >= c.a) cur = i; });
  load(cur); load(cur + 1); if (cur > 0) load(cur - 1);
  const moving = Math.abs(target - smooth) > 0.0006;
  if (!RM) { if (moving) drift *= Math.max(0, 1 - dt * 3); else drift = Math.min(1.8, drift + dt * 0.4); }
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
function frame(now) { requestAnimationFrame(frame); const dt = Math.min((now - last) / 1000, 0.05); last = now; if (!running) return;
  time += dt; smooth += (target - smooth) * (snap || RM ? 1 : Math.min(1, dt * 5)); const t = clamp(smooth, 0, 1);
  const mode = paintFilm(t, dt); if (fx) fx.draw(mode, time, dt, smooth - prevSmooth); prevSmooth = smooth; if (onFrame) onFrame(t, time); }
load(0); load(1); requestAnimationFrame(frame);
window.AETWorld = { set(t) { target = t; }, jump(t) { target = t; smooth = t; prevSmooth = t; }, pause(p) { running = !p; }, onFrame(fn) { onFrame = fn; }, snap(v) { snap = v; }, get t() { return smooth; }, clips: CLIPS };
})();
