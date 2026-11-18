/* v557gkdive.js - V55.7 (Bagga Lax 1.3.1): GOALIES NOW REALLY DIVE.
 * Kill switch: window.__rl_no557gd = true -> exactly like before (checked every frame, can be flipped live).
 * Charlie (Nov 12, 9:33 AM): "There should be a real save animation. Like he dives."
 * Before: a diving save (v548gkret "DIVING SAVE!", v547fakeread recovery dive) or a save wide of the goalie just snapped him
 *  into the save frame for .45 s and nudged him a few px toward the ball.
 * Now (drawing only): on those saves the goalie launches toward the ball - body laid out (rotated 55-100 deg, head and stick
 *  leading), a hop arc with his shadow left on the turf so he is visibly in the air, lands flat with a puff of dust, lies
 *  there ~.4 s, then gets up and is drawn back at his real spot. High shots / balls above him: upward-diagonal dive with a
 *  bigger hop; low shots / balls below him: flat along the ground.
 *  Which saves: every v548 / v547 diving save, and every normal save where the ball crossed K.wide px or more from him.
 *  (Measured on 3 headless quick games: normal saves land 0-5.5 px from the goalie - his reach is only 2-3 px - so a 6 px
 *  rule would almost never fire. 1.5 px = "not straight into his chest": about a third of normal saves become dives, the
 *  rest stay body saves, and every diving save dives.)
 * Purely visual: nothing in game state is written. The goalie's x/y, reach, the ball, odds and timers are untouched; we only
 *  set a canvas transform around his normal drawing (and his frame name for that one draw, then put it back). His logical
 *  spot is where he is drawn again the moment the game moves him (user takes the clear, reset, faceoff...).
 * Online: each phone works it out from what it already draws - the save frame + age the snapshot already carries
 *  (saveT0/saveFr) and the ball it already shows - so no net messages, ids, rl_* keys or saves change.
 */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v557gd_loaded) return;
 W.__rl_v557gd_loaded = 1;
 const D2R = Math.PI / 180;
 const K = { wide: 1.5, load: .05, air: .22, lie: .43, up: .25, upQuick: .14, hip: 9, liftG: 5, hopHi: 9, hopLo: 4,
  thAirHi: 58, thGndHi: 82, thAirLo: 86, thGndLo: 96, minTravel: 5, maxTravel: 22, abortMove: 4, newSave: .12, fresh: .3 };
 const LOG = { dives: 0, hi: 0, lo: 0, forced: 0, small: 0, bites: 0, aborts: 0, frames: 0, hints: 0, errs: [], ev: [] };
 const off = () => !!W.__rl_no557gd;
 const err = (e, w) => { try { if (LOG.errs.length < 20) LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); } catch (x) {} };
 const MT = () => (typeof menuT === 'number' ? menuT : 0);
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const SCR = () => (typeof screen !== 'undefined' ? screen : '');
 const isGk = p => !!p && (p.team === 'G' || p.team === 'G2' || (p.gk && p.team === 'O'));
 const key = p => (p.team === 'G' ? 'G' : 'U') + ':' + (p.pl && p.pl.id != null ? p.pl.id : p.idx);
 const cl = (v, a, b) => Math.max(a, Math.min(b, v));
 const ease = k => 1 - (1 - k) * (1 - k);
 const S = new Map();      // key -> { lastY, lastX, seenT0, dive }
 const HINT = new Map();   // key -> { cy, t, forced, high } from goalieSave12 (the phone simulating the play)
 let LB = null, BP = null; // last ball in flight we drew: { x, y, vx, vy, t } (BP: its previous spot)

 function st(p) { const k = key(p); let o = S.get(k); if (!o) { o = { lastY: p.y, lastX: p.x, seenT0: null, dive: null, G: null }; S.set(k, o); } return o; }
 function shotHigh(b) {
  try {
   if (!b) return null;
   if (b.target && b.target.high != null) return !!b.target.high;
   if (b.high != null) return !!b.high;
   if (b.s25 && b.s25.high != null) return !!b.s25.high;
  } catch (e) {}
  return null;
 }
 function forcedDive(b, gk) {
  try {
   if (b && b.v548d && b.v548d.dive && b.v548d.gk === gk) return 1;
   if (b && (b.f507 && b.f507.dive547 || b.f510 && b.f510.dive547)) return 1;
  } catch (e) {}
  return 0;
 }
 // where the ball crosses this goalie's line (the shot in flight, or the last one we saw)
 function crossY(p, b) {
  const s = b && b.state === 'shot' && Math.abs(b.vx || 0) > 1 ? { x: b.x, y: b.y, vx: b.vx, vy: b.vy || 0 } : LB && MT() - LB.t < .5 ? LB : null;
  if (!s) {   // a viewer that never saw the ball's speed: the ball right at him, else the save frame's side
   if (b && typeof b.x === 'number' && Math.abs(b.x - p.x) < 25 && Math.abs(b.y - p.y) < 30 && b.state !== 'held') return b.y;
   if (p.saveFr === 'save_high') return p.y - 6;
   if (p.saveFr === 'save_side') return p.y + 6;
   return null;
  }
  try { if (b && b.target && typeof b.target.y === 'number' && b.f507 && b.f507.dive547) return b.target.y; } catch (e) {}
  const y = s.y + s.vy * (p.x - s.x) / s.vx;
  return isFinite(y) ? y : null;
 }
 function start(p, o, cy, forced, high, why) {
  const y0 = Math.abs(o.lastY - p.y) < 40 ? o.lastY : p.y;
  let d = cy - y0;
  if (!forced && Math.abs(d) < K.wide) { LOG.small++; return false; }
  const side = d < 0 ? -1 : 1;
  const hi = high != null ? high : side < 0;
  let trav = cl(Math.abs(d), K.minTravel, K.maxTravel);
  const yLand = y0 + side * trav;
  o.dive = { t0: MT(), y0, yLand, x0: p.x, side, hi, forced: !!forced, py: p.y, px: p.x, abortT: null, why, goal: false };
  LOG.dives++; LOG[hi ? 'hi' : 'lo']++; if (forced) LOG.forced++;
  if (LOG.ev.length < 60) LOG.ev.push({ tm: p.team, why, d: +d.toFixed(1), hi, forced: !!forced, scr: SCR() });
  return true;
 }
 // a new save frame on this goalie? decide once whether it is a dive
 function watch(p, o) {
  const t0 = p.saveT0, t = MT();
  if (t0 == null || !(t - t0 >= -.02 && t - t0 < K.fresh)) return;
  if (o.seenT0 != null && Math.abs(t0 - o.seenT0) < K.newSave) return;
  o.seenT0 = t0;
  if (o.dive && t - o.dive.t0 < K.load + K.air + K.lie) return;   // already diving
  const G = G0(), b = G && G.ball;
  const h = HINT.get(key(p));
  if (h && t - h.t < .25) { HINT.delete(key(p)); start(p, o, h.cy, h.forced, h.high, 'save'); return; }
  if (!b) return;
  // a fake he bit on (ball still in the shooter's stick) is not a dive
  if (b.state === 'held' && (G.carrier && G.carrier !== p || b.holder && b.holder !== p)) { LOG.bites++; return; }
  const cy = crossY(p, b);
  if (cy == null) return;
  const fd = forcedDive(b, p);
  if (b.state === 'shot' && !fd) return;          // only diving saves start mid-flight; normal saves start at the save
  start(p, o, cy, fd, shotHigh(b), b.state === 'shot' ? 'dive' : 'seen');
 }
 // the drawn pose at time e since launch: { hx, hy, a, gy (ground y for shadow), fr, sh (shadow on), dust }
 function pose(p, o, fr0) {
  const D = o.dive, t = MT(), e = t - D.t0, s = fr0 ? 1 : -1;
  const thA = (D.hi ? K.thAirHi : K.thAirLo) * D2R, thG = (D.hi ? K.thGndHi : K.thGndLo) * D2R;
  const hop = D.hi ? K.hopHi : K.hopLo, lunge = 3 * s;
  const T1 = K.load, T2 = T1 + K.air, T3 = T2 + K.lie;
  const standHy = y => y - K.hip;
  if (D.abortT != null) {   // the game moved him: get up quickly where he really is
   const k = cl((t - D.abortT) / K.upQuick, 0, 1), f = D.abortFrom;
   if (k >= 1) return null;
   return { hx: f.hx + (p.x - f.hx) * k, hy: f.hy + (standHy(p.y) - f.hy) * k, a: f.a * (1 - k), gy: p.y, fr: 'save_low', sh: 0 };
  }
  if (e < T1) { const k = e / T1; return { hx: p.x - s * k, hy: standHy(D.y0) + 2 * k, a: s * 8 * D2R * k, gy: D.y0, fr: 'save_low', sh: 0 }; }
  if (e < T2) {
   const k = (e - T1) / K.air, q = ease(k);
   const gy = D.y0 + (D.yLand - D.y0) * q, h = hop * Math.sin(Math.PI * k);
   return { hx: D.x0 + lunge * q, hy: gy - (K.hip + (K.liftG - K.hip) * q) - h, a: s * (8 * D2R + (thA - 8 * D2R) * Math.min(1, q * 1.25)), gy, fr: 'save_high', sh: 1, air: h };
  }
  if (e < T3) {
   const k = (e - T2) / K.lie, bnc = k < .12 ? -1 : 0;
   const a = s * (thA + (thG - thA) * Math.min(1, k / .15));
   return { hx: D.x0 + lunge, hy: D.yLand - K.liftG + bnc, a, gy: D.yLand, fr: 'save_high', sh: 0, dust: k };
  }
  const k = (e - T3) / K.up;
  if (k >= 1) return null;
  const q = ease(k);
  return { hx: D.x0 + lunge + (p.x - D.x0 - lunge) * q, hy: (D.yLand - K.liftG) + (standHy(p.y) - (D.yLand - K.liftG)) * q, a: s * thG * (1 - q), gy: D.yLand + (p.y - D.yLand) * q, fr: k < .7 ? 'save_low' : null, sh: 0 };
 }
 function px2(x, y, w, h, c) { try { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); } catch (e) {} }
 function shadow(P) {
  const w = 12, x = Math.round(P.hx), y = Math.round(P.gy);
  px2(x - w / 2, y, w, 1, 'rgba(0,0,0,.30)'); px2(x - w / 2 + 2, y - 1, w - 4, 1, 'rgba(0,0,0,.22)'); px2(x - w / 2 + 2, y + 1, w - 4, 1, 'rgba(0,0,0,.22)');
 }
 function dust(P, D) {
  if (P.dust == null || P.dust > .55) return;
  const k = P.dust / .55, a = (.85 * (1 - k)).toFixed(2), r = 3 + k * 9, x = P.hx, y = D.yLand;
  for (let i = 0; i < 7; i++) { const an = Math.PI * (i / 6); px2(x + Math.cos(an) * r * 1.6 - 1, y - Math.sin(an) * r * .5 - 1, 2, 1, 'rgba(225,212,170,' + a + ')'); }
 }
 const curPose = new WeakMap();
 function applyT(P, p) {
  g.translate(Math.round(P.hx), Math.round(P.hy));
  g.rotate(P.a);
  g.translate(-Math.round(p.x), -Math.round(p.y - K.hip));
 }
 // drawn every frame for each goalie: decide, then draw him (posed) with the normal drawing inside our transform
 function frameFor(p, faceRight) {
  const G = G0(), o = st(p);
  if (o.G !== G) { o.G = G; o.dive = null; o.seenT0 = p.saveT0; o.lastY = p.y; o.lastX = p.x; }
  const ok = !off() && G && !G.tutorial && !(p.down > 0) && !(p.stun > 0) && !(p.lvl && typeof glvOff === 'function' && glvOff(p));
  if (!ok) { o.dive = null; return null; }
  watch(p, o);
  const D = o.dive;
  if (!D) return null;
  // the game moved him for real (he takes the clear, a reset, a new possession): stop lying there
  if (D.abortT == null && Math.hypot(p.x - D.px, p.y - D.py) > K.abortMove) {
   const P0 = pose(p, o, faceRight);
   if (Math.hypot(p.x - D.px, p.y - D.py) > 30 || !P0) { o.dive = null; LOG.aborts++; return null; }
   D.abortT = MT(); D.abortFrom = { hx: P0.hx, hy: P0.hy, a: P0.a }; LOG.aborts++;
  }
  const P = pose(p, o, faceRight);
  if (!P) { o.dive = null; return null; }
  return P;
 }
 function wrapDraw() {
  const d0 = W.drawPlayer;
  if (typeof d0 !== 'function') { LOG.errs.push('no drawPlayer'); return false; }
  W.drawPlayer = function (p, kit, faceRight) {
   if (!isGk(p) || off()) { if (p && isGk(p)) { const o = S.get(key(p)); if (o) { o.lastY = p.y; o.lastX = p.x; } } return d0.apply(this, arguments); }
   let P = null;
   try { P = frameFor(p, faceRight); } catch (e) { err(e, 'pose'); P = null; }
   const o = S.get(key(p));
   if (!P) { if (o) { o.lastY = p.y; o.lastX = p.x; } return d0.apply(this, arguments); }
   LOG.frames++;
   const sv = { s: p.saveT0, f: p.saveFr, c: p.chirpT0 };
   let saved = false;
   try {
    if (P.sh) shadow(P);
    if (P.dust != null) dust(P, o.dive);
    g.save(); saved = true;
    applyT(P, p);
    if (P.fr) { p.saveT0 = MT() - .01; p.saveFr = P.fr; p.chirpT0 = null; }
    curPose.set(p, P);
    return d0.apply(this, arguments);
   } catch (e) { err(e, 'draw'); }
   finally {
    if (saved) try { g.restore(); } catch (e) {}
    if (P.fr) { p.saveT0 = sv.s; p.saveFr = sv.f; p.chirpT0 = sv.c; }
    if (o) { o.lastY = p.y; o.lastX = p.x; }
   }
  };
  try { drawPlayer = W.drawPlayer; } catch (e) {}
  return true;
 }
 // the ball in a diving goalie's stick (the save he then clears) rides with his stick
 function holderOf(G, b) {
  if (!b) return null;
  if (b.state === 'clear') return G.dclear && G.dclear.holder || null;
  if (b.state !== 'held') return null;
  return b.holder || (SCR() === 'live' ? G.carrier : SCR() === 'defense' ? (G.dcar || G.dclear && G.dclear.holder) : null) || G.carrier || null;
 }
 function wrapBall() {
  const b0 = W.drawBallNow;
  if (typeof b0 !== 'function') return;
  W.drawBallNow = function () {
   let P = null, h = null;
   try {
    const G = G0(), b = G && G.ball;
    if (b && b.state === 'shot') {
     if (Math.abs(b.vx || 0) > 1) LB = { x: b.x, y: b.y, vx: b.vx, vy: b.vy || 0, t: MT() };
     else if (BP && MT() - BP.t > 0 && MT() - BP.t < .2 && Math.abs(b.x - BP.x) > .5) { const dt = MT() - BP.t; LB = { x: b.x, y: b.y, vx: (b.x - BP.x) / dt, vy: (b.y - BP.y) / dt, t: MT() }; }
     BP = { x: b.x, y: b.y, t: MT() };
    } else BP = null;
    if (!off() && G) { h = holderOf(G, b); if (h && isGk(h)) { const o = S.get(key(h)); if (o && o.dive) P = curPose.get(h) || null; } }
   } catch (e) { P = null; }
   if (!P) return b0.apply(this, arguments);
   let saved = false;
   try { g.save(); saved = true; applyT(P, h); return b0.apply(this, arguments); }
   finally { if (saved) try { g.restore(); } catch (e) {} }
  };
  try { drawBallNow = W.drawBallNow; } catch (e) {}
 }
 // the phone simulating the play knows exactly where the ball crossed: leave a hint for the drawing
 function wrapSave() {
  const s0 = W.goalieSave12;
  if (typeof s0 !== 'function') return;
  W.goalieSave12 = function (gk, cy) {
   try {
    if (!off() && gk && typeof cy === 'number') {
     const G = G0(), b = G && G.ball;
     HINT.set(key(gk), { cy, t: MT(), forced: forcedDive(b, gk), high: shotHigh(b) }); LOG.hints++;
    }
   } catch (e) { err(e, 'hint'); }
   return s0.apply(this, arguments);
  };
  try { goalieSave12 = W.goalieSave12; } catch (e) {}
 }
 const okDraw = wrapDraw();
 wrapBall();
 wrapSave();
 // test hook: make the next save of this goalie a dive toward y (drawing only)
 W.V557GD = { on: () => !off() && okDraw, K, LOG, S,
  test(team, dy, high) {
   const G = G0(); if (!G) return false;
   const p = G.players.find(q => q.team === (team || 'G2')); if (!p) return false;
   const o = st(p); o.lastY = p.y; o.lastX = p.x;
   return start(p, o, p.y + (dy == null ? 12 : dy), 1, high == null ? null : !!high, 'test');
  },
  state(team) { const G = G0(); const p = G && G.players.find(q => q.team === (team || 'G2')); const o = p && S.get(key(p)); return o && o.dive ? { e: +(MT() - o.dive.t0).toFixed(2), hi: o.dive.hi, side: o.dive.side } : null; } };
})();
