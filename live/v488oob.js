// ===== BAGGA LAX v488oob.js - NO MORE "RANDOM" OUT OF BOUNDS CALLS =====
// Charlie (Nov 10, 12:38 AM, 1.2 site on iPhone): "Also I'm getting random out of bounds calls sometimes look for that."
// What the instrumented CPU-vs-CPU runs showed (every call logged against the real lines FT=32, FB=170, DEND=5, ENDX=515):
//  * Not the notch fix: the field lines are fixed field units; seeded matches play out identically at W=341 (v473safe, __rl_safeTest=59)
//    and W=390 (__rl_safeTest=0). Wide shots / backing-up chases and loose balls that roll out really do cross the line.
//  1. KNOCKED OUT with no way to get there (v423ob.js:316-333, koNear 9 at :31): a LEVELED carrier whose feet are within 9 px of the
//     playable band edge (FT+12 / FB-2 / ENDX-3 / DEND+8) and pushed outward is "carried over the line" 75% of the time, but nothing checks
//     that THIS hit's knockback (HIT.kb 7 px x 0.7-1.6, c.kb from knockDown) can reach the line: carriers 8-10 px in, hit for 3-6 px,
//     got slid 15-20 px over the line and whistled. Now a knock-out stands only when the hit's own knockback reaches the band edge (the
//     line); otherwise it is a normal LEVELED! ground ball. Hard hits right on the line still knock him out (Charlie, Nov 3: "if i get hit
//     on the sideline i should be able to get hit out").
//  2. AIRBORNE BALL called out before it lands (v423ob.js:134-135 predictOut, game.js:7808 / :24540 ignore b.z): a popped ball flies with
//     z 7-9 for ~0.4 s and is drawn z px ABOVE its ground spot. 16 of 59 loose-ball calls in 24 test games were whistled in the air. Over the
//     bottom sideline the whistle went while the ball was still drawn up to 9 px inside the line. Lacrosse rule: a ball is out when it
//     touches the ground (or anything) out of bounds. Now a loose ball that is still in the air when its ground track crosses a line is
//     held at the line for that frame and flies on; when it comes down outside, the call is made (spot = where it crossed); if it is
//     caught in the air first, play on.
//  3. BALL SPAWNED OUTSIDE: checks/hits pop the ball at a stick offset (game.js:21696/21712/22616 dPopLoose x-8; :5973/:7312 popLoose x+6).
//     A carrier on/behind the end line (CPU carriers reach x=10) popped it beyond the line and v423ob's predictOut called it out the same
//     frame even when the pop flew back into the field. Now a pop that starts outside starts on the line, just inside; it is out only if it
//     then really goes out.
// Offline games only (same gate as v423ob). Kill switch: window.__rl_no488oob = true (v423ob behaviour exactly). Telemetry: window.V488.
(function() {
 'use strict';
 if (typeof window === 'undefined' || typeof step !== 'function') return;
 if (window.__rl_v488oob_loaded) return;
 window.__rl_v488oob_loaded = 1;
 const off = () => !!(window.__rl_no488oob || window.__rl_no423ob || window.__rl_v124gb);
 const netIn = () => { try { return !!(window.RLNET && RLNET.inGame); } catch (e) { return false; } };
 const okG = G => !!G && !!G.players && !!G.ball && !G.online && !G.tutorial && !G.brave && !netIn();
 const on = () => { try { return !off() && okG(game) && !!window.V423; } catch (e) { return false; } };
 const LOG = window.V488 = { koKept: 0, koDenied: 0, ko: [], air: 0, airFrames: 0, airLand: 0, airSaved: 0, spawn: 0, sp: [], errs: 0, err: [] };
 const err = (w, e) => { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(w + ': ' + String(e && e.message || e)); };
 const outXY = (x, y) => y < FT || y > FB || x > ENDX || x < DEND;
 const band = () => { const b = V423.K.band; return [ b[0](), b[1](), b[2](), b[3]() ]; };
 // ---------- 1. knock-outs only within the hit's reach ----------
 const kd0 = window.knockDown;
 if (typeof kd0 === 'function') window.knockDown = function(c, by, side, pow) {
  let c0 = -1, s0 = 0;
  try { if (on()) { c0 = V423.koCand; s0 = V423.koSkip; } } catch (e) { c0 = -1; }
  const r = kd0.apply(this, arguments);
  try {
   const G = game;
   if (c0 >= 0 && c && by && V423.koCand > c0 && V423.koSkip === s0) {
    // v423 armed a knock-out: same side choice as v423 (nearest band edge within koNear the push points at)
    const K = V423.K, B = band();
    const dx = c.x - by.x, dy = c.y - by.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const kb = c.kb, kx = kb ? kb.vx * kb.t : 0, ky = kb ? kb.vy * kb.t : 0;
    const S = [ { s: 'top', d: c.y - B[2], dot: -uy, reach: -ky }, { s: 'bottom', d: B[3] - c.y, dot: uy, reach: ky },
     { s: 'endR', d: B[1] - c.x, dot: ux, reach: kx }, { s: 'endL', d: c.x - B[0], dot: -ux, reach: -kx } ];
    const w = S.filter(q => q.d <= K.koNear && q.dot >= K.koDot).sort((a, b) => a.d - b.d)[0];
    if (w) {
     const ok = w.reach >= w.d - 1;
     const row = { side: w.s, d: +w.d.toFixed(1), reach: +w.reach.toFixed(1), ok: ok, t: +G.t.toFixed(2), car: [ +c.x.toFixed(1), +c.y.toFixed(1) ] };
     LOG.ko.push(row); if (LOG.ko.length > 30) LOG.ko.shift();
     if (ok) LOG.koKept++; else { LOG.koDenied++; G.no488ko = G.t; }
    }
   }
  } catch (e) { err('kd', e); }
  return r;
 };
 // ---------- 3. a pop that starts outside starts on the line ----------
 function fixSpawn(kind) {
  const G = game, b = G && G.ball;
  if (!b || b.state !== 'loose' || !outXY(b.x, b.y)) return;
  const x0 = b.x, y0 = b.y;
  b.x = Math.max(DEND + .5, Math.min(ENDX - .5, b.x));
  b.y = Math.max(FT + .5, Math.min(FB - .5, b.y));
  LOG.spawn++; LOG.sp.push({ kind: kind, from: [ +x0.toFixed(1), +y0.toFixed(1) ], to: [ +b.x.toFixed(1), +b.y.toFixed(1) ], v: [ +b.vx.toFixed(0), +b.vy.toFixed(0) ], scr: screen });
  if (LOG.sp.length > 30) LOG.sp.shift();
 }
 for (const nm of [ 'popLoose', 'dPopLoose' ]) {
  const p0 = window[nm];
  if (typeof p0 !== 'function') continue;
  window[nm] = function(x, y, vx, vy, kind) {
   const G = game;
   if (!on()) return p0.apply(this, arguments);
   let r;
   if (G && G.no488ko != null && kind === 'hit') {
    const was = window.__rl_no423ob;
    G.no488ko = null;
    window.__rl_no423ob = true; // v423 koPop stands down for this one pop: a plain LEVELED! ground ball
    try { r = p0.apply(this, arguments); } finally { window.__rl_no423ob = was; }
   } else r = p0.apply(this, arguments);
   try { fixSpawn(kind); } catch (e) { err('spawn', e); }
   return r;
  };
 }
 // ---------- 2. airborne ball: out when it comes down outside ----------
 let H = null;
 const s0 = window.step;
 window.step = function(dt) {
  const G = game;
  let hold = null;
  try {
   if (G && G.no488ko != null && G.no488ko !== G.t) G.no488ko = null;
   if (on() && typeof paused !== 'undefined' && !paused && dt > 0 && (screen === 'live' || screen === 'defense') && !(G.readyT > 0) && !(G.el2314 && G.el2314.open)) {
    const b = G.ball;
    if (b.state === 'loose') {
     const z = b.z || 0, vz = b.vz || 0;
     const nz = z + (vz - 240 * dt) * dt;           // updateLooseBall's own z step
     const sp = Math.hypot(b.vx, b.vy);
     let vx = b.vx, vy = b.vy;
     if (sp > .5) { const ns = Math.max(0, sp - GB.fric * dt); vx *= ns / sp; vy *= ns / sp; } else { vx = 0; vy = 0; }
     const nx = b.x + vx * dt, ny = b.y + vy * dt;
     if ((outXY(b.x, b.y) || outXY(nx, ny)) && nz > 1) {
      // still in the air over the line: hold the ball's ground spot just inside for the game's frame, fly it on after
      if (!H || H.b !== b) H = { b: b, cx: Math.max(DEND, Math.min(ENDX, outXY(b.x, b.y) ? b.x : nx)), cy: Math.max(FT, Math.min(FB, outXY(b.x, b.y) ? b.y : ny)), n: 0 };
      if (!H.n) LOG.air++;
      H.n++; LOG.airFrames++;
      hold = { x: nx, y: ny, vx: vx, vy: vy };
      b.x = Math.max(DEND + .5, Math.min(ENDX - .5, b.x));
      b.y = Math.max(FT + .5, Math.min(FB - .5, b.y));
      if ((nx < DEND + .5 && b.vx < 0) || (nx > ENDX - .5 && b.vx > 0)) b.vx = 0;   // no outward ground motion this frame:
      if ((ny < FT + .5 && b.vy < 0) || (ny > FB - .5 && b.vy > 0)) b.vy = 0;       // nothing in the frame can call it yet
     } else if (H && H.b === b && H.n && outXY(b.x, b.y)) {
      // it came down outside: the call (v423ob predictOut) is made at the point where it crossed
      LOG.airLand++;
      if (H.cy <= FT) b.y = FT - .01; else if (H.cy >= FB) b.y = FB + .01;
      if (H.cx <= DEND) b.x = DEND - .01; else if (H.cx >= ENDX) b.x = ENDX + .01;
      if (H.cy > FT && H.cy < FB) b.y = H.cy;
      if (H.cx > DEND && H.cx < ENDX) b.x = H.cx;
      H = null;
     } else if (H && H.b === b && H.n && !outXY(b.x, b.y) && !outXY(nx, ny)) { LOG.airSaved++; H = null; }
    } else if (H) { if (H.n && b.state === 'held') LOG.airSaved++; H = null; }
   }
  } catch (e) { err('pre', e); hold = null; }
  const r = s0.apply(this, arguments);
  try {
   if (hold && game === G && G.ball.state === 'loose' && (screen === 'live' || screen === 'defense')) {
    const b = G.ball;
    b.x = hold.x; b.y = hold.y; b.vx = hold.vx; b.vy = hold.vy;
   }
  } catch (e) { err('post', e); }
  return r;
 };
})();
