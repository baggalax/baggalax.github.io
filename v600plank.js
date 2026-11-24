// ===== BAGGA LAX v600plank.js - 1.5 B66: WALK THE PLANK celly (shop only, Live-Ops controlled) =====
// Ask:   a celly where the Flying Dutchman rises, the scorer walks the plank and splashes in (Chucks: walk_plank_ref.js,
//        built like v491 CHOPPER EXTRACT; Dutchman art reused through FIX590.ship). Item celly_wplank, legendary.
// Shop:  SHOP ONLY and OFF by default. It is in the Live-Ops catalog (v502live, default price 150 dimes) but shows in the
//        shop only when Charlie's panel has a row for celly_wplank (on/off + price + timer as for every item).
//        b2504 flag = never in card packs, weekly rewards, the pass, crew pools or the Yard Sale item rotation.
// Play:  like every celly - CELLY box, auto-celly, SKIP, clips, the picker preview. Local visual only (nothing on the
//        net); the CPU / online opponent never gets it (a rolled one is swapped for a base legendary, as v491 does).
// Kill switch: window.__rl_no600plank (item hidden from the shop + celly falls back to the base flow).
(function (root) {
 const WP = root.WP600 = { dur: 3.8 };
 const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
 const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
 const lerp = (a, b, k) => a + (b - a) * k;
 const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
 const hsh = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
 // same body() as v491 (team kit + skin + equipped gear, PSC-scaled)
 function body(fr, x, y, kit, faceRight, pl, rot) {
  if (!RL12.FR[fr]) fr = 'idle';
  const X = Math.round(x), Y = Math.round(y);
  g.save();
  if (rot) { g.translate(X, Y); g.rotate(rot); g.translate(-X, -Y); }
  try {
   scaled12(X, Y, () => {
    const gr = pl && game && game.g17 && game.g17.gear ? game.g17.gear[pl.id] : null;
    if (gr) { const f0 = RL12.FR[fr], cv2 = V17.bakeGear(fr, kit, !faceRight, skinOf(pl), gr, false);
     if (cv2) { const pad = cv2.pad17 || 0, w = f0[3][0].length, ax = faceRight ? f0[0] : w - 1 - f0[0]; g.drawImage(cv2, X - ax - pad, Y - f0[1] - pad); return; } }
    RL12.draw(g, fr, X, Y, kit, faceRight, { skin: skinOf(pl) });
   });
  } finally { g.restore(); }
 }
 const RUN = t => [ 'run0', 'run1', 'run2', 'run3' ][Math.floor(t * 9) % 4];

 // ---- timeline (seconds) ----
 const T = { poolIn: .1, riseA: .55, riseB: 1.25, walkA: 1.3, walkB: 2.05, salute: 2.35, step: 2.6, sinkA: 3.15, pop: 3.3 };
 const PLANK_ROOT = 14, PLANK_END = -34, WALK_TO = -28; // art x (Dutchman art space, stern = small x)
 // rise offset: ship starts 62px under (fully hidden) the water, rises, sits (1px bob), sinks again
 function rise(t) {
  if (t < T.riseA) return 62;
  if (t < T.riseB) return Math.round(62 * (1 - ease((t - T.riseA) / (T.riseB - T.riseA))));
  if (t < T.sinkA) return Math.round(Math.sin((t - T.riseB) * 3) * 1);
  const u = Math.min(1, (t - T.sinkA) / (WP.dur - .1 - T.sinkA)); return Math.round(Math.pow(u, 1.3) * 62);
 }
 // scorer fall after stepping off: returns y offset from plank top
 const fallY = u => -14 * u + 260 * u * u;
 // geometry for this celly instance
 function geo(c, V0) {
  const view = V0 || { l: camX, r: camX + W, top: 0 }, d = c.face || 1;
  // keep the whole scene (ship 150px behind, plank + splash ~60px ahead) on screen
  const rootX = d > 0 ? clampN(c.sx, view.l + 140, view.r - 62) : clampN(c.sx, view.l + 62, view.r - 140);
  const ox = rootX + PLANK_ROOT * d, wl = c.sy + 3;
  const WX = ax => ox - d * ax;                       // art x -> world x
  const RX = (ax, w) => d < 0 ? ox + ax : ox - ax - w + 1; // left edge of an art-space rect of width w
  return { view, d, rootX, ox, wl, WX, RX };
 }
 function drawShip(G0, rs) {
  const S = FIX590.ship(0), top = G0.wl - 57 + rs;     // art y 56 sits on the waterline
  g.save();
  if (G0.d < 0) g.drawImage(S, Math.round(G0.ox - 1), top);
  else { g.translate(Math.round(G0.ox + 2), 0); g.scale(-1, 1); g.drawImage(S, 0, top); }
  g.restore();
 }
 function drawPlankBoard(G0, rs, dip) {
  const y = G0.wl - 25 + rs; // plank top (art y 31)
  for (let ax = PLANK_END; ax <= 10; ax++) {
   const dd = ax < PLANK_END + 8 ? dip : 0, x = G0.RX(ax, 1);
   if (ax < 2) { R(x, y - 1 + dd, 1, 1, '#06140f'); R(x, y + 2 + dd, 1, 1, '#06140f'); }
   R(x, y + dd, 1, 1, ax % 6 === 0 ? '#3a2e1e' : '#8a6a3e');
   R(x, y + 1 + dd, 1, 1, '#5a4a30');
  }
  R(G0.RX(PLANK_END - 1, 1), y - 1 + dip, 1, 4, '#06140f');
  R(G0.RX(3, 1), y + 2, 1, 3, '#3a2e1e'); // brace under the root
 }
 // ghost-sea pool on the turf (Dutchman palette)
 function drawPool(G0, t, hwk) {
  if (hwk <= 0) return;
  const xa = G0.WX(152), xb = G0.WX(-62), cx = (xa + xb) / 2, hw = Math.abs(xb - xa) / 2 * hwk;
  for (let j = 0; j < 11; j++) {
   const e = Math.sqrt(Math.max(0, 1 - Math.pow((j - 3) / 8, 2))), w = Math.round(hw * (j < 3 ? .97 + j * .01 : e)), y = G0.wl - 1 + j;
   R(cx - w - 1, y, 1, 1, '#06140f'); R(cx + w, y, 1, 1, '#06140f');
   R(cx - w, y, w * 2, 1, j === 0 ? '#1f6b52' : j < 3 ? '#14503d' : '#0e3329');
  }
  R(cx - Math.round(hw * .8), G0.wl + 10, Math.round(hw * 1.6), 1, '#06140f');
  // moving crests + foam glints
  for (let i = 0; i < 14; i++) {
   const ph = (t * .5 + i / 14) % 1, x = cx - hw + ((i * 37) % 100) / 100 * hw * 2 + ph * 6, y = G0.wl + (i % 4) * 2;
   if (Math.abs(x - cx) < hw - 3) { R(x, y, 3, 1, i % 3 ? '#3dff8a' : '#7dffb0'); if (i % 5 === 0) R(x + 1, y - 1, 1, 1, '#e9fff2'); }
  }
  // low mist (same recipe as the Dutchman run out)
  g.save();
  for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(61,255,138,' + (.10 + (i % 3) * .04) + ')'; g.fillRect(Math.round(cx - hw + i * hw * 2 / 7 + Math.sin(t * 2 + i) * 3), Math.round(G0.wl - 3 - (i % 2) * 3), Math.round(hw * 2 / 5), 4 + (i % 3)); }
  g.restore();
 }
 // pixel splash: spout + crown droplets + ripples. u = seconds since he hit the water
 function drawSplash(x, wl, u) {
  if (u < 0 || u > .75) return;
  const k = u / .75;
  // ripples
  for (let r = 0; r < 2; r++) { const q = k - r * .25; if (q <= 0) continue; const hw = 3 + q * 20;
   R(x - hw, wl + 2 + r, 3, 1, '#7dffb0'); R(x + hw - 2, wl + 2 + r, 3, 1, '#7dffb0'); if (q < .6) { R(x - hw * .5, wl + 3 + r, 2, 1, '#e9fff2'); R(x + hw * .5, wl + 3 + r, 2, 1, '#e9fff2'); } }
  // spout
  if (u < .4) { const h = Math.round(Math.sin(u / .4 * Math.PI) * 18), h2 = Math.round(h * .55);
   R(x - 6, wl - h2, 2, h2, '#3dff8a'); R(x + 5, wl - h2, 2, h2, '#3dff8a'); R(x - 5, wl - h2 - 1, 1, 1, '#e9fff2'); R(x + 5, wl - h2 - 1, 1, 1, '#e9fff2');
   R(x - 3, wl - h, 7, h, '#06140f'); R(x - 2, wl - h, 5, h, '#7dffb0'); R(x - 1, wl - h - 1, 3, h, '#e9fff2'); R(x - 5, wl - 2, 11, 2, '#cfeedd'); R(x - 3, wl - 3, 7, 1, '#e9fff2'); }
  // crown droplets
  for (let i = 0; i < 16; i++) {
   const vx = (i % 2 ? 1 : -1) * (10 + hsh(i) * 40), vy = -(60 + hsh(i + 9) * 55), dx = vx * u, dy = vy * u + 190 * u * u;
   if (dy > 2) continue;
   R(x + dx, wl + dy, i % 3 ? 1 : 2, i % 3 ? 1 : 2, i % 4 ? '#e9fff2' : '#3dff8a');
  }
 }
 WP.drawSplash = drawSplash; WP.drawPool = drawPool; WP.drawPlankBoard = drawPlankBoard; WP.geo = geo; WP.rise = rise;

 // main draw (world coords). c.wp = the original actors (scorer first), like v491's c.a491
 WP.draw = function (c, t, V0) {
  const A = c.wp || c.actors || [], sc = A[0], G0 = geo(c, V0), d = G0.d, wl = G0.wl, rs = rise(t);
  const plankTop = wl - 25 + rs, deckTop = wl - 12 + rs, gy = wl - 3;
  const hwk = t < T.poolIn ? 0 : t < .5 ? ease((t - T.poolIn) / .4) : 1; // pool stays to the end (cellyEnd clears it), so his head never pops up on dry turf
  drawPool(G0, t, hwk);
  // splash timing (first frame his feet pass the waterline)
  let tHit = null; for (let u = 0; u < .6; u += .005) if (plankTop + fallY(u) >= wl) { tHit = T.step + u; break; }
  // everything that rises with the ship is clipped at the waterline
  g.save();
  g.beginPath(); g.rect(G0.view.l - 400, G0.view.top - 400, (G0.view.r - G0.view.l) + 800, wl + 400 - G0.view.top); g.clip();
  drawShip(G0, rs);
  // crew on the main deck (up to 3), lifted by the deck as it surfaces
  const deckAx = [ 56, 74, 92 ];
  for (let i = 1; i < A.length && i <= 3; i++) {
   const a = A[i], tx = G0.WX(deckAx[i - 1]), k = ease(t / .5), x = lerp(a.x0, tx, k), y = t >= T.riseB ? deckTop : Math.min(lerp(a.y0, gy, k), deckTop); // once aboard he rides (and sinks) with the deck
   let fr = t < .5 ? RUN(t) : t < T.riseB ? 'idle' : [ 'bench_cheer0', 'bench_cheer1' ][Math.floor(t * (3 + i)) % 2], hop = 0;
   if (tHit && t > tHit && t < tHit + .45) { fr = 'bench_cheer1'; hop = Math.round(Math.abs(Math.sin((t - tHit) * 14)) * 2); }
   body(fr, x, y - hop, a.kit, t < .5 ? tx > a.x0 : d > 0, a.pl, 0);
  }
  drawPlankBoard(G0, rs, t > T.walkB - .1 && t < T.step + .05 ? Math.floor(t * 8) % 2 : 0);
  // the scorer
  if (sc) {
   let x, y, fr = 'idle', face = d > 0, rot = 0;
   if (t < .5) { const k = ease(t / .5); x = lerp(sc.x0, G0.rootX, k); y = lerp(sc.y0, gy, k); fr = RUN(t); face = G0.rootX >= sc.x0; }
   else if (t < T.walkA) { x = G0.rootX; y = Math.min(gy, plankTop); fr = Math.floor(t * 3) % 2 ? 'bench_idle0' : 'bench_idle1'; }
   else if (t < T.walkB) { const k = (t - T.walkA) / (T.walkB - T.walkA); x = G0.WX(lerp(PLANK_ROOT, WALK_TO, k)); y = plankTop; fr = [ 'run0', 'run1', 'run2', 'run3' ][Math.floor(t * 6) % 4]; }
   else if (t < T.salute) { x = G0.WX(WALK_TO); y = plankTop; fr = 'bench_cheer0'; face = d < 0; } // stick salute back to the crew
   else if (t < T.step) { x = G0.WX(WALK_TO); y = plankTop; fr = 'bench_cheer1'; }              // turns out, arms up, cocky
   else { const u = t - T.step; x = G0.WX(WALK_TO) + d * Math.min(7, u * 30); y = plankTop + fallY(u); fr = u < .08 ? 'bench_cheer1' : 'fall0'; rot = u < .08 ? 0 : d * Math.min(.5, (u - .08) * 2); }
   if (t < (tHit || 99) + .2) { g.save(); body(fr, x, y, sc.kit, face, sc.pl, rot); g.restore(); }
   G0.sx = x;
  }
  g.restore();
  const sx = G0.WX(WALK_TO) + d * 7;
  if (tHit) drawSplash(sx, wl, t - tHit);
  // he pops back up: head + raised arms above the water, bobbing (drawn clipped to above the waterline)
  if (sc && t > T.pop + .1) {
   const u = Math.min(1, (t - T.pop - .1) / .2), y = wl + 14 - Math.round(u * 6) + Math.round(Math.sin(t * 8));
   g.save(); g.beginPath(); g.rect(G0.view.l - 400, G0.view.top - 400, 2000, wl + 400 - G0.view.top); g.clip();
   body('bench_cheer1', sx, y, sc.kit, d < 0, sc.pl, 0); g.restore();
   R(sx - 4, wl, 9, 1, '#7dffb0'); R(sx - 2, wl + 1, 5, 1, '#e9fff2');
  }
  // extra teammates (actors 4-5) cheer on the shore past the splash
  for (let i = 4; i < A.length; i++) { const a = A[i], tx = G0.WX(-62 - (i - 4) * 11), k = ease(t / .6);
   body(t < .6 ? RUN(t) : [ 'bench_cheer0', 'bench_cheer1' ][Math.floor(t * (3 + i)) % 2], lerp(a.x0, tx, k), lerp(a.y0, gy + (i - 4) * 4, k), a.kit, d < 0, a.pl, 0); }
 };

 // ---- 20x20 locker / shop icon (same recipe as v491 mkIcon; sil = black silhouette) ----
 WP.mkIcon = function (sil) {
  const cv = document.createElement('canvas'); cv.width = 20; cv.height = 20;
  const x = cv.getContext('2d'), r = (i, j, w, h, c) => { x.fillStyle = sil ? '#000' : c; x.fillRect(i, j, w, h); };
  // stern of the Dutchman (left): mast, tattered ghost sail, dark hull, gold rail, glowing gun ports
  r(3, 0, 1, 12, '#3a2e1e'); r(0, 1, 7, 1, '#3a2e1e');
  r(0, 2, 7, 6, '#cfeedd'); r(0, 2, 1, 6, '#9fd8bd'); r(4, 3, 1, 4, '#b5e6cf');
  if (!sil) { x.clearRect(1, 7, 1, 1); x.clearRect(5, 7, 2, 1); x.clearRect(2, 4, 1, 1); }
  r(0, 11, 8, 6, '#2a2418'); r(0, 11, 8, 1, '#c9a227'); r(0, 15, 7, 2, '#1a1610'); r(8, 11, 1, 5, '#06140f');
  r(1, 13, 2, 1, '#3dff8a'); r(4, 13, 2, 1, '#3dff8a');
  // the plank, nails, dark outline
  r(7, 14, 12, 1, '#8a6a3e'); r(7, 15, 12, 1, '#5a4a30'); r(19, 14, 1, 2, '#06140f'); r(10, 14, 1, 1, '#3a2e1e'); r(15, 14, 1, 1, '#3a2e1e');
  // the player at the end, arms up (same fig recipe as v491 mkIcon / items17 cellyIcon 'up')
  const J = '#2c6bd8', H = '#1d4fa8', S = '#f0c090', K = '#f4f4f4', ox = 15, oy = 14;
  r(ox - 2, oy - 4, 1, 4, J); r(ox + 1, oy - 4, 1, 4, J); r(ox - 2, oy - 1, 1, 1, K); r(ox + 1, oy - 1, 1, 1, K);
  r(ox - 2, oy - 10, 4, 6, J); r(ox - 2, oy - 14, 4, 4, H); r(ox + 1, oy - 12, 1, 1, S);
  r(ox - 3, oy - 15 + 1, 1, 5, S); r(ox + 2, oy - 15 + 1, 1, 5, S);
  // ghost sea under it + a drip of foam
  r(0, 17, 20, 3, '#0e3329'); r(0, 17, 20, 1, '#14503d'); r(9, 18, 3, 1, '#3dff8a'); r(15, 19, 3, 1, '#3dff8a'); r(2, 18, 2, 1, '#7dffb0'); r(13, 17, 1, 1, '#e9fff2');
  return cv;
 };
})(window);

(function () {
 'use strict';
 const Wn = window;
 const off = () => !!(Wn.__rl_no600plank || Wn.__rl_v124gb);
 if (!Wn.V17 || !V17.BY || !Array.isArray(V17.I) || !Wn.WP600 || Wn.PLANK600) return;
 const WP = Wn.WP600, ID = 'celly_wplank', CK = 'wplank';
 const V = Wn.PLANK600 = { err: [], runs: [] };
 const fail = (w, e) => { V.err.push(w + ': ' + String(e && e.message || e)); if (V.err.length > 30) V.err.shift(); };
 try {
  if (!V17.BY[ID]) { const it = { id: ID, n: 'WALK THE PLANK', sec: 'celly', slot: 'celly', rar: 2, art: 'celly', ck: CK, b2504: 1, shop600: 1,
   d: 'THE FLYING DUTCHMAN RISES, HE WALKS THE PLANK, SALUTES AND SPLASHES IN. COSMETIC ONLY.' }; V17.BY[ID] = it; V17.I.push(it); }
 } catch (e) { fail('add', e); }
 // ---- game flow (same as v491) ----
 const BASE_AI = [ 'celly_bowling', 'celly_rowboat', 'celly_dominoes' ];
 let CUR = null;
 function pre() {
  const G = typeof game !== 'undefined' ? game : null, c = G && G.c17;
  if (CUR && (!c || c !== CUR)) CUR = null;
  if (!c || c.wp600 || c.ck !== CK) return;
  c.wp600 = 1;
  if (c.side !== 0 && !Wn.__rl600plankAi) {
   const L = BASE_AI.filter(id => V17.BY[id]), id = L[Math.floor(Math.random() * L.length)] || 'celly_sweep';
   c.cid = id; c.ck = V17.BY[id].ck;
   try { const lg = G.c17log && G.c17log[G.c17log.length - 1]; if (lg && lg.cid) lg.cid = id; } catch (e) {}
   return;
  }
  c.wp = c.actors; c.actors = []; c.dur = WP.dur; CUR = c;
  V.runs.push({ side: c.side, t: G.t }); if (V.runs.length > 20) V.runs.shift();
 }
 function post() {
  const G = typeof game !== 'undefined' ? game : null, c = G && G.c17;
  if (!c || c.ck !== CK || screen !== 'banner' || G.tutorial) return;
  g.save();
  try { g.translate(-Math.round(camX), 0); WP.draw(c, c.t); } catch (e) { fail('draw', e); } finally { g.restore(); }
  try { const x = Math.round(W / 2 - 60), y = H - 11; rect(x, y + 1, 32, 10, '#000'); rect(x, y, 32, 10, '#ffffff'); text('SKIP', x + 16, y + 3, 1, '#0b1a20', 'center'); } catch (e) {}
 }
 if (typeof render === 'function') {
  const R0 = render;
  render = function () {
   if (off()) return R0.apply(this, arguments);
   try { pre(); } catch (e) { fail('pre', e); }
   const r = R0.apply(this, arguments);
   try { post(); } catch (e) { fail('post', e); }
   return r;
  };
 }
 if (typeof V17.drawCelly35 === 'function') {
  const D0 = V17.drawCelly35;
  V17.drawCelly35 = function () {
   const r = D0.apply(this, arguments);
   try { const c = game && game.c17; if (!off() && c && c.ck === CK) WP.draw(c, c.t); } catch (e) { fail('clip', e); }
   return r;
  };
 }
 // ---- picker preview (canvas.cprev17, 160x64): the scene is ~320 px wide -> half scale ----
 let PV = { id: null, t0: 0 };
 setInterval(() => {
  try {
   if (off()) return;
   const cv2 = document.querySelector && document.querySelector('canvas.cprev17');
   if (!cv2 || cv2.dataset.c !== ID) return;
   if (PV.id !== ID) PV = { id: ID, t0: performance.now() };
   const dur = WP.dur, t = Math.min((performance.now() - PV.t0) / 1e3 % (dur + .8), dur);
   const S = typeof season !== 'undefined' ? season : null, tid = typeof lobbyTeam === 'function' && lobbyTeam() || S && S.team || null;
   const kit = tid && typeof lobbyKit === 'function' ? lobbyKit(tid) : { jersey: '#2c6bd8', trim: '#ffffff', helm: '#2c6bd8' };
   const fx = 400, fy = CY, c = { ck: CK, t: t, dur: dur, sx: fx, sy: fy, face: 1, actors: [] };
   for (let i = 0; i < 3; i++) c.actors.push({ src: null, pl: null, x0: fx, y0: fy, kit: kit });
   const x = cv2.getContext('2d'), kk = g, G0 = game;
   x.imageSmoothingEnabled = false;
   g = x;
   try {
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = '#10241c'; x.fillRect(0, 0, cv2.width, cv2.height - 14);
    x.fillStyle = '#2f7d3a'; x.fillRect(0, cv2.height - 14, cv2.width, 14);
    x.setTransform(.5, 0, 0, .5, cv2.width / 2 - fx * .5, (cv2.height - 6) - (fy + 3) * .5);
    game = { c17: c, g17: null, t: t };
    WP.draw(c, t, { l: fx - 160, r: fx + 160, top: fy - 110 });
   } finally { game = G0; x.setTransform(1, 0, 0, 1, 0, 0); g = kk; }
  } catch (e) { fail('preview', e); }
 }, 50);
 // ---- 20x20 tile art wherever a card for it is drawn ----
 const ICON = {};
 const iconFor = sil => ICON[sil ? 1 : 0] || (ICON[sil ? 1 : 0] = WP.mkIcon(sil).toDataURL());
 V.iconFor = iconFor;
 try {
  const fix = root => {
   if (!root || !root.querySelectorAll) return;
   for (const el of root.querySelectorAll('.c17[data-v="' + ID + '"]')) {
    const im = el.querySelector('.art img'), u = iconFor(el.classList.contains('lk'));
    if (im && im.getAttribute('src') !== u) im.setAttribute('src', u);
   }
  };
  const mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) fix(n.parentNode || n); });
  const go = () => { try { fix(document.body); mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { fail('mo', e); } };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
 } catch (e) { fail('dom', e); }
})();
