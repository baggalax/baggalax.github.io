// V40.1.3 - MAN D help-side positioning (v413m.js)
// In MAN, off-ball defenders who are NOT on the ball and NOT adjacent (the 2 attackers nearest the ball, with
// hysteresis so it doesn't flicker) sag in "on the wall": on the line from their man to the goal-front, ~50% of the
// way (capped; less when his man is close to the ball or already in close shooting range), shaded to the ball side,
// ready for the slide and the 2. Adjacent guys sag about a third of that (a step or two off, cheated to the middle). Only the on-ball defender stays tight.
// A pass to a help guy's man = instant closeout (sprints back out). Applies to CPU MAN D (all MAN teams, slide habits
// untouched, practice THEIR D: MAN) and to the user's MAN D when defending (not the guy you control).
// Untouched: ZONE, BLACK, custom D sets, LOCK OFF guys (v410d + v411l), man-down/box, fast breaks, rides, clears, online.
// Kill switch: window.__rl_no413m = true -> exactly like before.
(function() {
 'use strict';
 if (window.__rl_v413m_loaded) return;
 window.__rl_v413m_loaded = 1;
 const OFF = () => !!window.__rl_no413m || !!window.__rl_v124gb;
 // tunables
 const K = window.V413M_K = {
  sag: .5,        // fraction of the way from his man toward the goal-front
  maxOff: 40,     // never more than this many px off his man
  minOff: 6,      // below this it isn't worth moving
  ballK: .3,      // ... and never more than this x his man's distance from the ball
  near: 45,       // a man closer than this to the cage only gets nearMin of the sag ...
  span: 60,       // ... ramping to full sag at near + span
  nearMin: 1,     // (1 = off; tested: with a real catch-to-shot delay full sag stays balanced)
  ballSide: .14,  // shade toward the ball (fraction of distance to ball) ...
  ballMax: 12,    // ... capped px
  front: 6,       // goal-front point sits CREASE + front in front of the cage
  room: 7,        // keep out of the crease: CREASE + room
  hys: 12,        // adjacency hysteresis px
  adj: .35,       // adjacent (one pass away) guys: partial sag, a step or two off, cheated to the middle
  rateIn: 2.2,    // blend per sec toward help spot
  rateOut: 7,     // blend per sec back to man (ball moved toward him)
  close: 1.15,    // closeout speed (x PACE.chase) when recovering to his man
  closeR: 4,      // closeout sprint ends this close to his normal spot
  coReact: .08    // reaction time of a sagged help guy when the ball goes to his man
 };
 if (window.V413M_TUNE) try { Object.assign(K, window.V413M_TUNE); } catch (e) {}
 const LOG = { errs: [], cpuFrames: 0, userFrames: 0, helpers: 0, closeouts: 0 };
 const V = window.V413M = { on: false, LOG: LOG, K: K };
 V.st = d => W8.get(d) || null;
 if (OFF()) return;
 if (typeof window.updateLive !== 'function' || typeof window.H2on !== 'function') return;
 V.on = true;
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.errs.length < 6) console.warn('v413m', w, e); } catch (x) {} };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const hyp = Math.hypot;
 // per-defender state: w = help blend 0..1, cl = closing out
 const W8 = new WeakMap();
 const ws = d => { let s = W8.get(d); if (!s) { s = { w: 0, cl: false }; W8.set(d, s); } return s; };
 // adjacency with hysteresis (per side)
 const ADJ = { cpu: { set: [], car: null }, user: { set: [], car: null } };
 function adjOf(key, atk, c, bx, by) {
  const A = ADJ[key];
  const L = atk.filter(p => p !== c && !p.gk).map(p => [ p, hyp(p.x - bx, p.y - by) ]).sort((a, q) => a[1] - q[1]);
  const top = L.slice(0, 2).map(e => e[0]);
  if (top.length === 2) {
   const d2 = L[1][1];
   for (const p of A.set) {
    if (top.includes(p)) continue;
    const e = L.find(x => x[0] === p);
    if (e && e[1] < d2 + K.hys) { top[1] = p; break; }
   }
  }
  A.set = top; A.car = c;
  return new Set(top);
 }
 // help spot: from his man toward the goal-front, shaded to the ball, outside the crease
 function helpSpot(m, gx, side, bx, by) {
  const fx = gx - side * (CREASE + K.front), fy = CY;
  let vx = fx - m.x, vy = fy - m.y, L = hyp(vx, vy);
  if (L < K.minOff) return null;
  // farther from the ball = more sag (time to recover while the pass is in the air)
  // ... and less sag off a man who's already in close shooting range (low wings / crease guys)
  const dG = hyp(m.x - gx, m.y - CY), rng = Math.max(K.nearMin, Math.min(1, (dG - K.near) / K.span));
  const off = Math.min(L * K.sag, K.maxOff, hyp(m.x - bx, m.y - by) * K.ballK) * rng;
  let sx = m.x + vx / L * off, sy = m.y + vy / L * off;
  const bvx = bx - sx, bvy = by - sy, bl = hyp(bvx, bvy);
  if (bl > 1) { const s = Math.min(bl * K.ballSide, K.ballMax); sx += bvx / bl * s; sy += bvy / bl * s; }
  const ex = sx - gx, ey = sy - CY, ed = hyp(ex, ey), R = CREASE + K.room;
  if (ed < R) { sx = gx + (ed ? ex / ed * R : -side * R); sy = CY + (ed ? ey / ed * R : 0); }
  if (hyp(sx - m.x, sy - m.y) < K.minOff) return null;
  return [ sx, sy ];
 }
 // ---------------- CPU MAN D (inside updateLive, after targets, before the move loop) ----------------
 let inLive = false, did = false, lastT = null;
 function cpuOk(G, c, b) {
  if (!G || G.online || (G.meta && G.meta.online) || G.tutorial || !b) return false;
  if (b.state !== 'held' && b.state !== 'pass') return false;
  const own = c || (b.state === 'pass' && b.to) || null; // mid-pass there is no carrier: use the receiver
  if (!own || own.team !== 'O') return false;
  if (typeof ballLive === 'function' && ballLive()) return false;
  if (G.clearing || G.zoneD || G.cpuDef === 'black' || G.cpuDef === 'zone' || G.fb222) return false;
  if (G.rideC && G.rideC.mode === 'live' && G.rideC.phase === 'out') return false;
  if (typeof setSag17 === 'function' && setSag17()) return false;
  if (own.x < MIDX - 6) return false;
  return true;
 }
 function cpuTick(dt) {
  const G = G0(); if (!G || !G.players) return;
  const b = G.ball, c = G.carrier;
  const dl = G.players.filter(p => p.team === 'D' && !p.gk), ol = G.players.filter(p => p.team === 'O' && !p.gk);
  const ok = cpuOk(G, c, b) && dl.length === ol.length;
  LOG.why = ok ? 'ok' : 'off';
  if (!ok) { for (const d of dl) { const s = ws(d); s.w = 0; s.cl = false; } return; }
  const bref = b.state === 'pass' && b.to ? b.to : c;
  const adj = adjOf('cpu', ol, c || bref, bref.x, bref.y);
  let lockD = null;
  try { const s = window.V410D && V410D.st && V410D.st(); if (s && s.lock && s.lock.d) lockD = s.lock.d; } catch (e) {}
  LOG.cpuFrames++;
  for (const d of dl) {
   const s = ws(d);
   if (b.state === 'pass' && b.to && !b.intercept && d.react > K.coReact && s.w > .2 && (typeof markOf === 'function' ? markOf(d) : d.mark) === b.to) d.react = K.coReact; // help guy on the wall is ready: quick read on a pass to his man
   if (d.react > 0) continue; // reaction delay: the game leaves his target alone, so do we (keep the blend)
   if (d === lockD || d.down > 0 || d.stun > 0 || d.coverT > 0 || d === G.p5d || d === G.slide || (G.rot && G.rot.d === d) || (typeof isChaser === 'function' && isChaser(d)) || d.tx == null) { s.w = 0; s.cl = false; continue; }
   const m = typeof markOf === 'function' ? markOf(d) : d.mark;
   if (!m || !G.players.includes(m)) { s.w = 0; continue; }
   apply(d, s, m, c, b, adj, GX, 1, bref, dt, false);
  }
 }
 // shared: blend p.tx/p.ty (CPU) or return the new target (user)
 function apply(d, s, m, c, b, adj, gx, side, bref, dt, user) {
  const passTo = b.state === 'pass' && b.to === m && !b.intercept;
  const behind = side > 0 ? m.x > gx - 4 : m.x < gx + 4;
  const onBall = m === c || passTo || behind;
  const isAdj = !onBall && adj.has(m);
  const tw = onBall ? 0 : isAdj ? K.adj : 1;   // help weight: on-ball 0, adjacent partial, weak side full
  const w0 = s.w;
  if (passTo || (m === c && w0 > .1)) s.w = 0;
  else if (s.w < tw) s.w = Math.min(tw, s.w + K.rateIn * dt);
  else s.w = Math.max(tw, s.w - K.rateOut * dt);
  if ((passTo || m === c) && w0 > .2) { if (!s.cl) LOG.closeouts++; s.cl = true; }
  const tx0 = user ? s.tx0 : d.tx, ty0 = user ? s.ty0 : d.ty;
  let tx = tx0, ty = ty0, sprint = 0;
  if (s.w > 0) {
   let q = helpSpot(m, gx, side, bref.x, bref.y);
   if (q && hyp(q[0] - m.x, q[1] - m.y) <= hyp(tx0 - m.x, ty0 - m.y)) q = null; // only ever sag MORE than before, never tighter
   if (q) { tx = tx0 + (q[0] - tx0) * s.w; ty = ty0 + (q[1] - ty0) * s.w; LOG.helpers++; }
  }
  if (s.cl) {
   // done when he's back within his normal spot (measured off his man: the target can be stale on a reaction frame)
   if (!(passTo || m === c) || hyp(d.x - m.x, d.y - m.y) < Math.max(14, hyp(tx - m.x, ty - m.y) + K.closeR)) s.cl = false;
   else sprint = 1;
  }
  if (user) return [ tx, ty, sprint ];
  d.tx = tx; d.ty = ty;
  if (sprint) d.spd = Math.max(d.spd || 0, PACE.chase * K.close);
  return null;
 }
 const H0 = window.H2on;
 window.H2on = function() {
  const r = H0.apply(this, arguments);
  if (inLive && !did) { did = true; try { if (!OFF()) cpuTick(lastT || 0); } catch (e) { err(e, 'cpu'); } }
  return r;
 };
 const L0 = window.updateLive;
 window.updateLive = function(dt) {
  inLive = true; did = false; lastT = (typeof shootP !== 'undefined' && shootP ? .5 : 1) * (dt || 0);
  try { return L0.apply(this, arguments); } finally { inLive = false; }
 };
 // ---------------- user MAN D (screen 'defense'): retarget the help guys' moveTo ----------------
 let UD = null; // { map: Map(d -> {m}), ... } valid during one updateDefense call
 function userPrep(G, dt) {
  UD = null;
  if (!G || G.online || (G.meta && G.meta.online) || G.tutorial || SCR() !== 'defense' || !G.players) return;
  const b = G.ball, c = G.dcar;
  const def = G.players.filter(p => p.team === 'O' && !p.gk), atk = G.players.filter(p => p.team === 'D' && !p.gk);
  const clear = () => { for (const d of def) { const s = ws(d); s.w = 0; s.cl = false; } };
  const own = c || (b && b.state === 'pass' && b.to) || null;
  if (!own || !b || b.state !== 'held' && b.state !== 'pass' || b.clear || own.team !== 'D') return clear();
  if (G.dset !== 'man' || G.dclear || G.cpuClear || G.cset) return clear();
  if (typeof dCustomOn === 'function' && dCustomOn()) return clear();
  if (def.length !== atk.length || def.some(d => d.r26)) return clear();
  if (own.x > MIDX + 6) return clear();
  if (G.rideU && G.rideU.phase === 'out') return clear();
  let locks = new Set;
  try { if (window.V411L && V411L.resolve && !window.__rl_no411l) locks = new Set(V411L.resolve(G).map(q => q.d)); } catch (e) {}
  const bref = b.state === 'pass' && b.to ? b.to : c;
  const adj = adjOf('user', atk, c || bref, bref.x, bref.y);
  const map = new Map;
  for (const d of def) {
   const s = ws(d);
   if (locks.has(d) || d === G.dctl || d === G.dSlide || (G.dRot && G.dRot.d === d) || d.stun > 0 || d.down > 0 || d.coverT > 0 || (typeof isChaser === 'function' && isChaser(d))) { s.w = 0; s.cl = false; continue; }
   let m = d.mark && G.players.includes(d.mark) ? d.mark : null;
   if (!m) { s.w = 0; continue; }
   map.set(d, m);
   if (b.state === 'pass' && b.to === m && !b.intercept && d.react > K.coReact && s.w > .2) d.react = K.coReact;
  }
  UD = { G: G, b: b, c: c, adj: adj, bref: bref, map: map, dt: dt, done: new Set };
  LOG.userFrames++;
 }
 if (typeof window.moveTo === 'function') {
  const M0 = window.moveTo;
  window.moveTo = function(p, tx, ty, spd, dt) {
   if (UD && p && UD.map.has(p) && !UD.done.has(p) && p.t30 && p.t30[0] === tx && p.t30[1] === ty) {
    UD.done.add(p);
    try {
     const s = ws(p), m = UD.map.get(p);
     s.tx0 = tx; s.ty0 = ty;
     const q = apply(p, s, m, UD.c, UD.b, UD.adj, DGX, -1, UD.bref, dt || UD.dt, true);
     if (q) { tx = q[0]; ty = q[1]; if (q[2]) spd = Math.max(spd, PACE.chase * K.close); p.t30 = [ tx, ty ]; }
    } catch (e) { err(e, 'user'); }
   }
   return M0.call(this, p, tx, ty, spd, dt);
  };
 }
 if (typeof window.updateDefense === 'function') {
  const U0 = window.updateDefense;
  window.updateDefense = function(dt) {
   try { if (!OFF()) userPrep(G0(), dt || 0); else UD = null; } catch (e) { err(e, 'prep'); UD = null; }
   try { return U0.apply(this, arguments); } finally { UD = null; }
  };
 }
})();
