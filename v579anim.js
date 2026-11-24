'use strict';
/* v579anim - 1.4 ANIMATIONS, CORE + LOBBY IDLE + "COLLECT IN THE LOBBY" (Bagga Lax 1.4, Vidze's approved mockups).
   1. Lobby idle (PLAY lobby hero, screen 'menu' only): a 1 px settle DOWN about every 6 s (the old breathe that lifted the
      head up is parked while this runs), both eyes blink every 4-7 s, a rare stick slam (small dust puff) and a foot shuffle.
      How: the hero is drawn by the game's own lobbyHero chain (all gear / uniform / kit overlays) into an offscreen copy of
      the frame buffer, then whole sprite cells are moved 1 px. So every equipped item moves with the player.
      Blink bug (Charlie): the mockup closed col 4 + col 7; the eyes are the two 'o' pixels between skin ('SoS') on the face
      row (cols 4 and 8 on bench_idle0). Now both are found from the frame itself; no blink if a visor is on or the eye
      pixels are not dark (covered).
   2. Rewards won in a game no longer pop up on the FINAL screen: the collect screens (#c27 v27, #c419 v419c, #vc494pop)
      are removed there the instant they appear (their queues are untouched and already saved), so they open on the menu.
      A trophy won in the game (TROPHY UNLOCKED canvas pop) is held until the lobby too. Granting is unchanged.
   3. AN579 helpers (overlay stage + SKIP) used by v579animpk.js and v579animcar.js.
   Fail safe: every hook is try/catch and falls back to the original call. Storage: rl_an579q (trophy reveal queue only).
   Kill switches: window.__rl_no579anim (everything), __rl_no579idle, __rl_no579defer. */
(function () {
 const W0 = window;
 const off = () => !!(W0.__rl_no579anim || W0.__rl_v124gb);
 const LOG = { err: [], idle: 0, idleBuf: 0, blink: 0, defer: [], scenes: [] };
 const fail = (w, e) => { try { LOG.err.push(w + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.err.length > 40) LOG.err.shift(); } catch (_) {} };
 const scr = () => (typeof screen === 'string' ? screen : '');
 const now = () => performance.now() / 1000;

 /* ---------------- overlay stage with SKIP ---------------- */
 let active = null;
 function stage(o) {
  // o: { render(ctx, t) -> true while running, W, H, z, bg, onEnd(skipped) }
  if (active) try { active.end(true); } catch (e) {}
  const Wd = o.W || 844, Hd = o.H || 390;
  const d = document.createElement('div');
  d.id = 'an579';
  d.style.cssText = 'position:fixed;inset:0;z-index:' + (o.z || 2147483100) + ';background:' + (o.bg == null ? '#05080b' : o.bg) + ';touch-action:none';
  const cvs = document.createElement('canvas');
  cvs.width = Wd; cvs.height = Hd;
  cvs.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges';
  d.appendChild(cvs);
  const b = document.createElement('button');
  b.type = 'button'; b.id = 'an579skip'; b.textContent = 'SKIP';
  b.setAttribute('aria-label', 'SKIP ANIMATION');
  b.style.cssText = 'position:absolute;right:calc(env(safe-area-inset-right) + 10px);bottom:calc(env(safe-area-inset-bottom) + 10px);font:bold 13px "Courier New",ui-monospace,monospace;color:#0b1a20;background:#e8eef5;border:0;border-radius:0;box-shadow:0 3px 0 #000,0 0 0 2px #000;padding:7px 16px;cursor:pointer;touch-action:manipulation;z-index:2';
  d.appendChild(b);
  const cx = cvs.getContext('2d'); cx.imageSmoothingEnabled = false;
  let t0 = now(), raf = 0, done = false;
  const A = {
   el: d, cv: cvs, cx: cx, W: Wd, H: Hd, kind: o.kind || '',
   end(skipped) {
    if (done) return; done = true;
    try { cancelAnimationFrame(raf); } catch (e) {}
    try { d.remove(); } catch (e) {}
    if (active === A) active = null;
    try { LOG.scenes.push((o.kind || '?') + (skipped ? ':skip' : ':done')); } catch (e) {}
    try { o.onEnd && o.onEnd(!!skipped); } catch (e) { fail('onEnd', e); }
   }
  };
  const stop = e => { try { e.preventDefault(); e.stopPropagation(); } catch (_) {} };
  b.addEventListener('click', e => { stop(e); A.end(true); });
  d.addEventListener('pointerdown', e => e.stopPropagation());
  d.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  d.addEventListener('click', e => e.stopPropagation());
  function frame() {
   if (done) return;
   let go = false;
   try { cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; go = o.render(cx, now() - t0, A) !== false; } catch (e) { fail('render ' + (o.kind || ''), e); go = false; }
   if (!go) return A.end(false);
   raf = requestAnimationFrame(frame);
  }
  try { document.body.appendChild(d); } catch (e) { fail('stage', e); return null; }
  active = A;
  frame();
  return A;
 }
 // run fn with the game's global canvas context swapped to cx (game helpers text/rect/badge/lobbyHero draw into g)
 function withG(cx, fn) {
  const g0 = g;
  g = cx;
  try { return fn(); } finally { g = g0; }
 }

 /* ---------------- 1. lobby idle ---------------- */
 const noIdle = () => off() || !!W0.__rl_no579idle;
 const fr = v => v - Math.floor(v);
 const hash = s => { let h = 7; s = String(s || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0) / 4294967296; };
 const geoCache = new Map;
 function frameGeo(name) {
  let G = geoCache.get(name);
  if (G) return G;
  const f = RL12.FR[name], rows = f[3], h = rows.length, w = rows[0].length, ay = f[1];
  const cut = Math.max(1, ay - 12);
  const at = (r, c) => (rows[r] || '')[c] || '.';
  const eyes = [];
  for (let r = 0; r < cut; r++) for (let c = 1; c < w - 1; c++) if (at(r, c) === 'o' && at(r, c - 1) === 'S' && at(r, c + 1) === 'S') eyes.push([ r, c ]);
  const stick = [];
  let butt = -1, shaftC = -1;
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) { const ch = at(r, c); if ('MmnX'.includes(ch)) { stick.push([ r, c ]); if (ch === 'X' && r > butt) { butt = r; shaftC = c; } } }
  // the empty cells touching the stick move with it too (gear sticks draw a glow / spill there)
  const key = (r, c) => r + ',' + c, inS = new Set(stick.map(([ r, c ]) => key(r, c))), mv = stick.slice();
  for (const [ r, c ] of stick) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc, kk = key(rr, cc); if (!inS.has(kk) && at(rr, cc) === '.') { inS.add(kk); mv.push([ rr, cc ]); } }
  G = { w: w, h: h, ax: f[0], ay: ay, cut: cut, eyes: eyes.length === 2 && eyes[0][0] === eyes[1][0] ? eyes : null, stick: mv, butt: butt, shaftC: shaftC };
  geoCache.set(name, G);
  return G;
 }
 // timeline for one hero: settle, blink, slam (stick dy + dust), shuffle (left foot dx / right foot lift)
 function pose(t, ph) {
  const o = { settle: 0, blink: 0, sdy: 0, dust: 0, footL: 0, footR: 0 };
  const T = t + ph * 60;
  const u6 = fr(T / 6);
  o.settle = u6 > .15 && u6 < .4 ? 1 : 0;
  const b = T % 11.2;
  if ((b > 0 && b < .16) || (b > 4.6 && b < 4.76)) o.blink = 1;          // two blinks per 11.2 s: gaps 4.6 s and 6.6 s
  const s = (T + 9) % 23;                                                  // stick slam, once every 23 s
  if (s < .4) o.sdy = -1; else if (s < .62) { o.sdy = 2; o.dust = 1; } else if (s < .86) { o.sdy = 2; o.dust = 2; } else if (s < 1.2) o.sdy = 1;
  if (s < 1.2) o.settle = 0;
  const f = (T + 15) % 29;                                                 // foot shuffle, once every 29 s
  if (f < 1.5) o.footL = -1; else if (f > 14 && f < 14.9) o.footR = 1;
  return o;
 }
 const BREATHE0 = 1.5 * Math.PI / 2.4;                                     // sin(t*2.4) = -1 -> the old breathe is 0
 const parkT = t => BREATHE0 + 2 * Math.PI / 2.4 * Math.floor(t * 2.4 / (2 * Math.PI));
 let buf = null, bcx = null, tmp = null, tcx = null;
 function bufFor(c) {
  if (!buf) { buf = document.createElement('canvas'); bcx = buf.getContext('2d'); tmp = document.createElement('canvas'); tcx = tmp.getContext('2d'); }
  if (buf.width !== c.width || buf.height !== c.height) { buf.width = c.width; buf.height = c.height; }
  if (tmp.width !== c.width || tmp.height !== c.height) { tmp.width = c.width; tmp.height = c.height; }
  return bcx;
 }
 const lum = p => .3 * p[0] + .59 * p[1] + .11 * p[2];
 function idleOn(a) {
  // a = lobbyHero args
  if (noIdle() || scr() !== 'menu' || active) return false;
  const gray = a[5], k = a[6], alpha = a[8], slide = a[9], side = a[11];
  if (gray || side || !(k >= 2) || (alpha != null && alpha < .99) || Math.round(slide || 0) !== 0) return false;
  if (typeof RL12 === 'undefined' || typeof lobbyFrame !== 'function') return false;
  const pid = W0.__v17hp;
  try { const p = pid && PP(pid); if (p && p.gho16 && W0.GHO16 && GHO16.on()) return false; } catch (e) {}
  return true;
 }
 function visorOn(kit) {
  try { const gr = W0.V17 && V17.heroGear && W0.__v17hp ? V17.heroGear(W0.__v17hp, kit) : null; return !!(gr && gr.visor); } catch (e) { return true; }
 }
 function wrapIdle() {
  const L0 = W0.lobbyHero;
  if (typeof L0 !== 'function' || L0.__an579) return;
  const L1 = function (cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) {
   let on = false;
   try { on = idleOn(arguments); } catch (e) { on = false; }
   if (!on) return L0.apply(this, arguments);
   const args = Array.prototype.slice.call(arguments);
   let P = null, name = null, G = null;
   try {
    name = lobbyFrame(pos, side);
    G = RL12.FR[name] ? frameGeo(name) : null;
    P = G ? (W0.__an579force ? Object.assign({ settle: 0, blink: 0, sdy: 0, dust: 0, footL: 0, footR: 0 }, W0.__an579force) : pose(now(), hash(W0.__v17hp || pos))) : null;
    args[7] = parkT(+t || 0);
   } catch (e) { fail('idle pose', e); return L0.apply(this, arguments); }
   LOG.idle++;
   const fit = !!(kit && kit.fit45);
   if (kit && /^tk565/.test(kit.g27 || '')) { P.sdy = 0; P.dust = 0; }   // the turkey fan sits in the cells beside the stick
   if (!W0.__rl_no597slam && W0.STICK590 && !W0.__rl_no590stick) { P.sdy = 0; P.dust = 0; }   // 1.5e (Charlie: 'a second stick behind it'): the stick slam moved only the OLD head's cells - the new (bigger) head + glow tore in two
   const any = P._buf || P.settle || (P.blink && !fit) || (!fit && (P.sdy || P.footL || P.footR));
   if (!any) return L0.apply(this, args);
   // draw the full hero (every wrapper, all gear) into a copy of the frame buffer, then move whole cells
   const main = g, c = main.canvas;
   let ok = false;
   try {
    const b = bufFor(c), m = main.getTransform();
    b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, buf.width, buf.height);
    b.setTransform(m); b.globalAlpha = 1; b.imageSmoothingEnabled = main.imageSmoothingEnabled;
    g = b;
    try { L0.apply(this, args); } finally { g = main; }
    b.setTransform(1, 0, 0, 1, 0, 0);
    const sx = m.a, sy = m.d, K = k * sx, KY = k * sy;
    const geo = lobbyHeroGeo(cx, pos, k, flip, side);
    const x0 = geo.x0, y0 = Math.round(feetY - G.ay * k);
    const DX = c2 => Math.round(m.a * (x0 + (flip ? G.w - 1 - c2 : c2) * k) + m.e), DY = r => Math.round(m.d * (y0 + r * k) + m.f);
    const cellW = Math.round(K), cellH = Math.round(KY);
    if (!fit) {
     // stick slam: lift the stick cells, drop them back with a dust puff
     if (P.sdy && G.stick.length) {
      tcx.setTransform(1, 0, 0, 1, 0, 0); tcx.clearRect(0, 0, tmp.width, tmp.height);
      for (const [ r, c2 ] of G.stick) tcx.drawImage(buf, DX(c2), DY(r), cellW, cellH, DX(c2), DY(r), cellW, cellH);
      for (const [ r, c2 ] of G.stick) b.clearRect(DX(c2), DY(r), cellW, cellH);
      b.drawImage(tmp, 0, Math.round(P.sdy * KY));
      if (P.dust && G.butt >= 0) {
       b.fillStyle = '#c8c8c8';
       const r = G.butt + 1, sc = G.shaftC;
       for (const dc of P.dust > 1 ? [ -3, 3 ] : [ -2, 2 ]) b.fillRect(DX(sc + dc), DY(r - (P.dust > 1 ? 1 : 0)), cellW, cellH);
       if (P.dust > 1) { b.fillRect(DX(sc - 2), DY(r), cellW, cellH); b.fillRect(DX(sc + 2), DY(r), cellW, cellH); }
      }
     }
     // foot shuffle: left foot slides 1 px, or right foot lifts 1 px (bottom rows, body columns only)
     if (P.footL || P.footR) {
      const r0 = G.ay - 3, r1 = G.ay, cA = P.footL ? 0 : G.ax + 1, cB = P.footL ? G.ax : Math.min(G.ax + 6, G.shaftC >= 0 ? G.shaftC - 1 : G.ax + 6);
      const lx = Math.min(DX(cA), DX(cB)), rx = Math.max(DX(cA), DX(cB)) + cellW, ty = DY(r0), by = DY(r1) + cellH;
      tcx.setTransform(1, 0, 0, 1, 0, 0); tcx.clearRect(0, 0, tmp.width, tmp.height);
      tcx.drawImage(buf, lx, ty, rx - lx, by - ty, lx, ty, rx - lx, by - ty);
      b.clearRect(lx, ty, rx - lx, by - ty);
      const ddx = P.footL ? Math.round(P.footL * K) * (flip ? -1 : 1) : 0, ddy = P.footR ? -cellH : 0;
      b.drawImage(tmp, ddx, ddy);
     }
    }
    // settle: everything above the game's own breathing cut moves 1 px DOWN (never up)
    if (P.settle) {
     const cy = DY(G.cut);
     tcx.setTransform(1, 0, 0, 1, 0, 0); tcx.clearRect(0, 0, tmp.width, tmp.height);
     tcx.drawImage(buf, 0, 0, buf.width, cy, 0, 0, buf.width, cy);
     const top = Math.max(0, DY(-12));
     const xs = Math.max(0, DX(flip ? G.w + 6 : -6)), xe = Math.min(buf.width, DX(flip ? -6 : G.w + 6));
     const xl = Math.min(xs, xe), xr = Math.max(xs, xe);
     b.clearRect(xl, top, xr - xl, cy + cellH - top);
     b.drawImage(tmp, xl, top, xr - xl, cy - top, xl, top + cellH, xr - xl, cy - top);
    }
    // blink: BOTH eyes at once, skin taken from the pixel beside each eye; skipped under a visor / covered eyes
    if (P.blink && !fit && G.eyes && !visorOn(kit)) {
     const dr = P.settle ? 1 : 0, ex = [];
     let okB = true;
     for (const [ r, c2 ] of G.eyes) {
      const ix = DX(c2), iy = DY(r + dr) + (P.settle ? 0 : 0);
      const e = b.getImageData(ix + (cellW >> 1), iy + (cellH >> 1), 1, 1).data;
      const sxp = DX(c2 - 1);
      const s = b.getImageData(sxp + (cellW >> 1), iy + (cellH >> 1), 1, 1).data;
      if (!(e[3] > 200 && s[3] > 200 && lum(e) < 45 && lum(s) > lum(e) + 25)) okB = false;
      ex.push([ ix, iy, 'rgb(' + s[0] + ',' + s[1] + ',' + s[2] + ')' ]);
     }
     if (okB) { for (const [ ix, iy, col ] of ex) { b.fillStyle = col; b.fillRect(ix, iy, cellW, cellH); } LOG.blink++; }
    }
    main.save();
    main.setTransform(1, 0, 0, 1, 0, 0);
    main.globalAlpha = 1;
    main.imageSmoothingEnabled = false;
    main.drawImage(buf, 0, 0);
    main.restore();
    LOG.idleBuf++;
    ok = true;
   } catch (e) { g = main; fail('idle draw', e); }
   if (!ok) return L0.apply(this, arguments);
  };
  L1.__an579 = true;
  W0.lobbyHero = L1;
 }
 try { wrapIdle(); } catch (e) { fail('wrapIdle', e); }

 /* ---------------- 2. no reward pop-ups on the final screen ---------------- */
 const noDefer = () => off() || !!W0.__rl_no579defer;
 const POPS = { c27: 1, c419: 1, vc494pop: 1, fw37: 1 };   // fw37 = v37c FIRST WIN BONUS pack (lives in #ui)
 const held = [];   // banner html held off the final screen
 function onFinal() {
  if (scr() !== 'final') return false;
  try { const G = typeof game !== 'undefined' ? game : null; return !!(G && G.over && !G.tutorial); } catch (e) { return false; }
 }
 try {
  const note = w => { LOG.defer.push(w); if (LOG.defer.length > 40) LOG.defer.shift(); };
  const popUp = except => Object.keys(POPS).some(id => { const e = document.getElementById(id); return e && e !== except && e.isConnected; });
  const mo = new MutationObserver(list => {
   if (noDefer()) return;
   const fin = onFinal();
   for (const m of list) for (const n of m.addedNodes) {
    if (!n || n.nodeType !== 1) continue;
    try {
     if (fin && n.classList && n.classList.contains('ban17')) {          // ACHIEVEMENT UNLOCKED banners: replay in the lobby
      held.push(n.innerHTML); if (held.length > 12) held.shift(); n.remove(); note('ban17'); continue;
     }
     if (!n.id || !POPS[n.id]) continue;
     // final screen: never. Lobby / hubs: one at a time, never under one of our scenes (the source shows it again later;
     // every one of these queues is saved and only cleared by its own COLLECT / DONE button)
     if (fin || active || popUp(n)) { n.remove(); note(n.id + (fin ? '@final' : '@wait')); }
    } catch (e) {}
   }
  });
  mo.observe(document.body, { childList: true });
  const ui0 = document.getElementById('ui');
  if (ui0) mo.observe(ui0, { childList: true });
  const st0 = document.getElementById('stage');
  if (st0 && st0 !== ui0) mo.observe(st0, { childList: true });
 } catch (e) { fail('observer', e); }

 try {
  const DF0 = W0.drawFinal;
  if (typeof DF0 === 'function' && !DF0.__an579) {
   const DF1 = function () {
    let G = null, d = null;
    try { G = typeof game !== 'undefined' ? game : null; if (!noDefer() && G && G.drop28) { d = G.drop28; G.drop28 = null; } } catch (e) {}
    try { return DF0.apply(this, arguments); } finally { if (d && G && G.drop28 == null) G.drop28 = d; }
   };
   DF1.__an579 = true;
   W0.drawFinal = DF1;
  }
 } catch (e) { fail('drawFinal', e); }
 // replay held achievement banners on the main menu, one at a time, when nothing else is up
 let banT = 0;
 setInterval(() => {
  try {
   if (!held.length || active || scr() !== 'menu' || Date.now() - banT < 3200) return;
   if (Object.keys(POPS).some(id => document.getElementById(id))) return;
   banT = Date.now();
   const host = document.getElementById('stage') || document.body, el = document.createElement('div');
   el.className = 'ban17'; el.setAttribute('role', 'status'); el.innerHTML = held.shift();
   host.appendChild(el);
   setTimeout(() => el.classList.add('on'), 20);
   setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 350); }, 2600);
  } catch (e) { fail('banner', e); }
 }, 400);

 // trophy pop (items17 canvas, drawn on any non-panel screen): held on the final screen and while our scenes run.
 const QK = 'an579q';
 // rl_an579q = { q: [trophy ids waiting for their lobby reveal], seen: { id: 1 } }
 const qGet = () => { try { const o = LS.get(QK, null); return o && typeof o === 'object' && Array.isArray(o.q) ? { q: o.q, seen: o.seen && typeof o.seen === 'object' ? o.seen : {} } : { q: [], seen: {} }; } catch (e) { return { q: [], seen: {} }; } };
 const qSet = o => { try { const ks = Object.keys(o.seen || {}); if (ks.length > 40) for (const k of ks.slice(0, ks.length - 40)) delete o.seen[k]; LS.set(QK, { q: (o.q || []).slice(-12), seen: o.seen || {} }); } catch (e) {} };
 function freshTrophies() {
  try {
   const ST = W0.V17 && V17.ST && V17.ST(), tr = ST && ST.trophies, out = [];
   if (!tr) return out;
   const t = Date.now();
   for (const id in tr) if (tr[id] && tr[id].at && t - tr[id].at < 120000) out.push(id);
   return out;
  } catch (e) { return []; }
 }
 try {
  if (W0.V40MSG && typeof V40MSG.hideNow === 'function' && !V40MSG.hideNow.__an579) {
   const h0 = V40MSG.hideNow;
   const h1 = function () {
    try {
     if (!noDefer()) {
      if (active) return true;
      if (onFinal() && freshTrophies().length) return true;
     }
    } catch (e) {}
    return h0.apply(this, arguments);
   };
   h1.__an579 = true;
   V40MSG.hideNow = h1;
  }
 } catch (e) { fail('hideNow', e); }
 // remember trophies won in a game (saved), so the lobby reveal survives an app close
 setInterval(() => {
  try {
   if (noDefer() || !onFinal()) return;
   const f = freshTrophies();
   if (!f.length) return;
   const o = qGet();
   let ch = false;
   for (const id of f) if (!o.q.includes(id) && !o.seen[id]) { o.q.push(id); ch = true; }
   if (ch) qSet(o);
  } catch (e) { fail('trq', e); }
 }, 700);

 W0.AN579 = {
  on: () => !off(), LOG: LOG, stage: stage, withG: withG, active: () => active, fail: fail, now: now,
  pose: pose, frameGeo: frameGeo, qGet: qGet, qSet: qSet, scr: scr
 };
})();
