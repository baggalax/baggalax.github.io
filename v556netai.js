/* v556netai.js - BAGGA LAX 1.3.1: THE AI / POSITION FIXES NOW RUN IN ONLINE MATCHES TOO (Charlie, Nov 12 9:28 AM: "Online should be the same").
 * Online, the phone whose team has the ball RUNS the play (RLNET.auth): it moves all 20 guys (its own AI teammates and the other
 *  team's AI defenders; the other player's own defender is steered by his stick input, flagged p.netCtl) and the other phone
 *  shows its snapshots. These purely local AI fixes were switched off online by a game.online gate; they need no new messages:
 *  they run on the phone that runs the play, exactly where they run offline, and both screens show the same thing.
 * Ported (same code, the online gate swapped for "online, this phone runs the play, both phones have this file"):
 *  - v413m  MAN D help-side (the other team's AI defenders sag in on the wall, closeouts)  - never the other player's own guy (netCtl)
 *  - v431dh D stays slid in until its man crosses (no hole at the midline)                 - never the other player's own guy (netCtl)
 *  - v434at your attack works to get open during the clear / transition
 *  - v487dg2 the ground-ball helper run that froze your guy on one diagonal is re-aimed / dropped
 *  - v495ride an outlet pass in your clear no longer drops the other team's far riders (they used to vanish online)
 *  - v416p your carrier never passes by himself
 * Left as they are (offline-only parts or no online path): v441dg / v465dg2 / v418t (the 'defense' screen they fix is never used
 *  online - the defending phone only watches), v433np (online turnovers are the net hand-off, not the offline pause it fixes),
 *  v451ridefix (fixes v420c ride sets, which never run online), v455gk (its leash is defense-screen only; the goalie run-back online
 *  is v548gkret, already on), v440md (the 10-a-side safety net re-adds players from the lineup; online lineups are shared state
 *  owned by the net layer + v545 subs, so a local re-add could fight it - not safe without a protocol change).
 * Old peer: a capability flag rides the lobby 'ver' message (field na556) and an added 'na5h' hello; an older app on either side =
 *  today's online game. Net protocol: only ADDED (ver.na556, msg na5h). Nothing changed / removed.
 * Kill switch: window.__rl_no556na = true (checked live) -> exactly today's online game. Each port also honours its own file's kill
 *  switch (__rl_no413m, __rl_no431dh, __rl_no434at, __rl_no487dg2, __rl_no495ride, __rl_no416p). Offline nothing here runs.
 * No ids, rl_* keys or saves touched. Stats: window.V556NA (and V556_V413M / V556_DH431 / V556_AT434 / V556_V487DG2 / V556_V495 / V556_V416P).
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v556na_loaded) return;
 W0.__rl_v556na_loaded = 1;
 const N = W0.RLNET;
 if (!N || !N.Link || !N.Link.prototype || typeof W0.step !== 'function') { W0.V556NA = { on: () => false, why: 'no net' }; return; }
 const killed = () => !!(W0.__rl_no556na || W0.__rl_v124gb);
 const now = () => performance.now();
 const ST = { hellos: 0, cap: null, ports: {}, errs: [] };
 const C = { peer: false, link: null, helloT: 0, n: 0, acked: false };
 const LP = N.Link.prototype;
 const SEND0 = LP.send;
 LP.send = function (e) { try { if (e && e.t === 'ver' && !killed()) e.na556 = 1; } catch (x) {} return SEND0.apply(this, arguments); };
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try {
   if (e && !killed()) {
    if (e.t === 'ver' && e.na556) peerCap('ver');
    else if (e.t === 'na5h') { peerCap('hello'); if (!e.a && !C.acked) { C.acked = true; try { N.link && N.link.send({ t: 'na5h', c: 556, a: 1 }); } catch (x) {} } }
   }
  } catch (x) {}
  return GE0.apply(this, arguments);
 };
 function peerCap(why) { if (!C.peer) ST.cap = { why: why, at: Math.round(now()) }; C.peer = true; }
 function capTick() {
  if (!N.link) { C.peer = false; C.n = 0; C.acked = false; C.link = null; return; }
  if (C.link !== N.link) { C.link = N.link; C.peer = false; C.n = 0; C.acked = false; }
  if (!killed() && !C.peer && C.n < 12 && now() - C.helloT > 3000) { C.helloT = now(); C.n++; ST.hellos++; try { N.link.send({ t: 'na5h', c: 556, a: 0 }); } catch (e) {} }
 }
 const ST0 = W0.step;
 W0.step = function () { try { capTick(); } catch (e) {} return ST0.apply(this, arguments); };
 // true = this phone runs the play in an online match and both phones have this file
 function ok() {
  if (killed() || !C.peer || !N.inGame || !N.auth) return false;
  try { const G = game; return !!G && !G.tutorial && !G.practice; } catch (e) { return false; }
 }
 // the ported files read "is this game online?" through __B(): here it answers false only when the port should run
 const __B = () => !ok();
 function port(name, fn) { try { fn(__B); ST.ports[name] = true; } catch (e) { ST.ports[name] = false; ST.errs.push(name + ': ' + String(e && e.message || e).slice(0, 120)); try { console.warn('v556netai', name, e); } catch (x) {} } }

 // ===================== port of v413m.js (its online gate -> __B()) =====================
 port('v413m', function (__B) {
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
 if (window.__rl_v556c_v413m_loaded) return;
 window.__rl_v556c_v413m_loaded = 1;
 const OFF = () => !!window.__rl_no413m || !!window.__rl_v124gb;
 // tunables
 const K = window.V556_V413M_K = {
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
 const V = window.V556_V413M = { on: false, LOG: LOG, K: K };
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
  if (!G || __B() || (G.meta && __B()) || G.tutorial || !b) return false;
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
   if (d.netCtl || d === lockD || d.down > 0 || d.stun > 0 || d.coverT > 0 || d === G.p5d || d === G.slide || (G.rot && G.rot.d === d) || (typeof isChaser === 'function' && isChaser(d)) || d.tx == null) { s.w = 0; s.cl = false; continue; }
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
  if (!G || __B() || (G.meta && __B()) || G.tutorial || SCR() !== 'defense' || !G.players) return;
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

 });

 // ===================== port of v431dh.js (its online gate -> __B()) =====================
 port('v431dh', function (__B) {
// v431dh.js - V43.1: DEFENSE STAYS SLID IN UNTIL ITS MAN CROSSES (offline / vs-CPU only, purely local AI).
// Charlie (Nov 3): "the d stays up at midline waiting for there matchup to come over ... they leave the whole bottom half
// of the field open for me while they wait for their guy to cross".
// Before: a man-to-man defender whose man was still on the other side of the midline (in transition, a sub coming on
// through the box, an attackman held back) aimed at his man, hit the midline wall and stood there waiting - the hole,
// the crease and the whole bottom of the defensive end were empty.
// Now: once the ball is over the midline (or within ~60 px of coming over), a defender whose man has NOT crossed into
// the defensive half sprints back and sits sloughed in the hole instead: top of the crease on the ball side first, then
// the back pipe, then high-hole spots (one spot each, nearest guy to the most important spot, no stacking). While the
// ball is still coming up, only a man trailing the ball by 30+ px is let go (the ride on guys ahead of the ball is
// untouched; deeper in the clear nothing changes). Defenders with no man at all share the same spots instead of piling
// onto one point. The moment his man crosses the midline he picks him up and the normal man D (sag, adjacent,
// closeouts, slides, rotations) takes over at once; if the man runs back over he slides back in.
// Applies to the CPU defense (you on offense) and to your own AI defenders (CPU on offense). Never touches: the guy you
// control, the on-ball defender, a slide or a rotation, a closeout on a pass to his man, the fast-break plan's goal-side
// defenders, zone / man-down / custom D sets, rides and riders, guys who are down / stunned / covering / chasing, and any
// guy in a sub job (box/midline subs, auto subs, follow-the-sub, playmaker subs, stick-break jog, SUB-screen subs).
// Onside: the help spots are deep in the defensive half, so the 4-back count can only go up.
// Kill switch: window.__rl_no431dh = true (exactly the old behaviour). Online / tutorial / BRAVEHEART / practice: off.
// No storage keys, no net protocol, no lineup changes.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v556c_v431dh_loaded) return;
 W0.__rl_v556c_v431dh_loaded = true;
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const WHY = {}; const why = k => { WHY[k] = (WHY[k] || 0) + 1; };
 const ST = { cFrames: 0, cHelp: 0, cNoMark: 0, uFrames: 0, uHelp: 0, uNoMark: 0, picks: 0, err: 0 };
 const er = e => { ST.err++; try { if (ST.err < 6) console.error(e); } catch (x) {} };
 const off = G => !!W0.__rl_no431dh || !!W0.__rl_v124gb || !G || !!G.tutorial || !!__B() || !!(G.meta && __B()) || !!G.brave || !!G.practice || !!G.over || G.farMode === 'fo' || !G.players || !G.ball;
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const NEAR = 60, TRAIL = 30; // the ball within 60 px of the midline coming up: a man 30+ px behind the ball is let go early
 const PICK_IN = 6, DROP = 2; // px past the midline: he is "in" once 6 px over the line, "out" again when he is back within 2 px of it (or over)
 // ids tied up in any sub (S421 jobs incl. auto subs / follows / playmaker subs, CPU sub job, auto-sub CPU jobs, SUB-screen pending)
 function subIds(G) {
  const s = new Set;
  try {
   const T = G.s421;
   if (T) {
    for (const j of T.jobs || []) if (j && j.phase !== 'done') { s.add(j.outId); s.add(j.inId); s.add(j.overId); s.add(j.stepId); }
    const cj = T.cpu && T.cpu.job; if (cj) { s.add(cj.outId); s.add(cj.inId); }
   }
   const A = G.a428; if (A) for (const j of A.cpuJobs || []) if (j && j.phase !== 'done') { s.add(j.outId); s.add(j.inId); }
   if (W0.S425 && Array.isArray(S425.PEND)) for (const q of S425.PEND) if (q && q.st !== 'done') { s.add(q.off); s.add(q.on); s.add(q.over); }
  } catch (e) {}
  s.delete(undefined); s.delete(null);
  return s;
 }
 const busy = (G, p, sub) => {
  if (!p || p.gk || p.team === 'G' || p.team === 'G2' || !p.pl) return true;
  if (p.down > 0 || p.stun > 0 || p.coverT > 0 || p.r26) return true;
  if (p.s421 || p.s428 || p.s427 || p.sub427 || p.ns17 || p.over || p.tOver || p.follow428) return true;
  if (sub.has(p.pl.id)) return true;
  if (G.help18 === p) return true;
  try { if (typeof isChaser === 'function' && isChaser(p)) return true; } catch (e) {}
  if (G.chasers && G.chasers.includes(p)) return true;
  if (G.dChasers && G.dChasers.includes(p)) return true;
  return false;
 };
 // has this defender's man crossed into the defensive half? (side = +1: defending the right goal, -1: the left one)
 function crossed(d, m, side) {
  const u = side > 0 ? m.x - MIDX : MIDX - m.x; // > 0 = in the defensive half
  let s = d._dh431;
  if (!s || s.m !== m) s = d._dh431 = { m: m, wait: u <= PICK_IN };
  if (s.wait && u > PICK_IN) { s.wait = false; ST.picks++; }
  else if (!s.wait && u <= DROP) s.wait = true;
  return !s.wait;
 }
 // help spots in the hole, most important first: top of the crease (ball side), back pipe, high hole, ...
 function spots(gx, side, by) {
  const sd = by >= CY ? 1 : -1, sh = cl((by - CY) * .35, -18, 18);
  const L = [ [ 26, CY + sh ], [ 21, CY - sd * 17 ], [ 40, CY + sh * .5 + sd * 14 ], [ 37, CY - sd * 27 ], [ 52, CY + sh * .3 - sd * 4 ], [ 30, CY + sd * 30 ] ];
  return L.map(q => [ gx - side * q[0], cl(q[1], FT + 14, FB - 8) ]);
 }
 // nearest guy to the most important spot, a little stickiness so nobody flickers between two spots
 function assign(list, sp) {
  const out = new Map, left = list.slice();
  for (let i = 0; i < sp.length && left.length; i++) {
   let bi = 0, bc = 1e9;
   for (let k = 0; k < left.length; k++) { const d = left[k], c = Math.hypot(d.x - sp[i][0], d.y - sp[i][1]) - (d._dh431s === i ? 14 : 0); if (c < bc) { bc = c; bi = k; } }
   const d = left.splice(bi, 1)[0]; d._dh431s = i; out.set(d, sp[i]);
  }
  for (const d of left) { d._dh431s = -1; out.set(d, sp[sp.length - 1]); }
  return out;
 }
 const spdTo = (d, q, base) => { const far = Math.hypot(q[0] - d.x, q[1] - d.y); return far > 40 ? Math.max(base || 0, PACE.chase) : far > 8 ? Math.max(base || 0, PACE.dBall) : PACE.dOff; };
 // the fast-break plan of this frame (the game hands its defenders their own targets after the man D)
 let FP = null;
 if (typeof W0.fbPlan222 === 'function') {
  const F0 = W0.fbPlan222;
  W0.fbPlan222 = function () { const r = F0.apply(this, arguments); FP = r instanceof Map ? r : null; return r; };
 }
 // ================= CPU defense (screen 'live', you on offense attacking the right goal) =================
 function cpuPre() {
  const G = G_();
  if (off(G) || scr() !== 'live') return;
  const b = G.ball, c = G.carrier;
  if (b.state !== 'held' && b.state !== 'pass') return;
  const ref = c || (b.state === 'pass' && b.to) || null;
  if (!ref || ref.team !== 'O' || ref.x <= MIDX - NEAR) return; // the ball is over (or about to come over); their ride deeper in your clear is untouched
  const over = ref.x > MIDX;
  if (G.pen && G.pen.side) return; // man-up / man-down: the box / zone sets own it
  const dl = G.players.filter(p => p.team === 'D' && !p.gk), ol = G.players.filter(p => p.team === 'O' && !p.gk);
  if (G.cpuDef === 'zone' || G.zoneD || dl.length !== ol.length && !(G.practice && G.practice.dScheme && G.cpuDef !== 'zone')) { why('c_zone'); return; }
  if (typeof dCustomOn === 'function' && G.cdef && dCustomOn()) return;
  ST.cFrames++;
  const sub = subIds(G), help = [];
  for (const d of dl) {
   if (busy(G, d, sub)) { why('c_busy'); continue; }
   if (d.netCtl || d === G.slide || (G.rot && G.rot.d === d) || d === G.p5d || d === G.ctrl) { why('c_slide'); continue; }
   if (G.rideC && G.rideC.mode === 'live' && G.rideC.phase === 'out' && G.rideC.cd === d) { why('c_ride'); continue; } // their ride's cover guy
   if (d.react > 0) { why('c_react'); continue; } // reaction delay: the game leaves his target alone, so do we
   if (FP && FP.has(d)) { why('c_fb'); continue; } // fast-break plan: its defenders play the break
   const m = typeof markOf === 'function' ? markOf(d) : (d.mark && G.players.includes(d.mark) ? d.mark : null);
   if (!m) { if (over && d.tx === GX - 22) { help.push(d); ST.cNoMark++; } continue; }
   if (m === c || m === ref || (b.state === 'pass' && b.to === m)) continue;
   if (crossed(d, m, 1)) continue;
   if (!over && !(m.x < ref.x - TRAIL)) continue; // ball still coming up: only a man trailing the play is let go
   help.push(d);
  }
  if (!help.length) return;
  const A = assign(help, spots(GX, 1, ref.y));
  for (const [d, q] of A) { d.tx = q[0]; d.ty = q[1]; d.spd = spdTo(d, q, d.spd); d.mk105 = false; d._dh431f = G.t; ST.cHelp++; }
 }
 let inLive = false, did = false;
 if (typeof W0.H2on === 'function' && typeof W0.updateLive === 'function') {
  const H0 = W0.H2on;
  W0.H2on = function () {
   const r = H0.apply(this, arguments);
   if (inLive && !did) { did = true; try { cpuPre(); } catch (e) { er(e); } }
   return r;
  };
  const L0 = W0.updateLive;
  W0.updateLive = function (dt) {
   inLive = true; did = false; FP = null;
   try { return L0.apply(this, arguments); } finally { inLive = false; FP = null; }
  };
 }
 // ================= your AI defenders (screen 'defense', CPU attacking the left goal) =================
 let UD = null; // { map: Map(d -> spot), nm: Set(no-mark helpers), by } for one updateDefense call
 function userPrep() {
  UD = null;
  const G = G_();
  if (off(G) || scr() !== 'defense') return;
  const b = G.ball, c = G.dcar;
  if (b.state !== 'held' && b.state !== 'pass' || b.clear || G.dclear) return;
  const ref = c || (b.state === 'pass' && b.to) || null;
  if (!ref || ref.team !== 'D' || ref.x >= MIDX + NEAR) return; // the ball is over (or about to come over); your ride deeper in their clear is untouched
  const over = ref.x < MIDX;
  if (G.pen && G.pen.side) return;
  const def = G.players.filter(p => p.team === 'O' && !p.gk), atk = G.players.filter(p => p.team === 'D' && !p.gk);
  if (G.dset === 'zone' || def.length !== atk.length || def.some(d => d.r26)) { why('u_zone'); return; }
  if (typeof dCustomOn === 'function' && dCustomOn()) return;
  ST.uFrames++;
  const sub = subIds(G), help = [], nm = new Set;
  for (const d of def) {
   if (busy(G, d, sub)) { why('u_busy'); continue; }
   if (d === G.dctl || d === G.dSlide || (G.dRot && G.dRot.d === d)) { why('u_ctl'); continue; }
   if (d.react > 0) { why('u_react'); continue; }
   const m = d.mark && G.players.includes(d.mark) ? d.mark : null;
   if (!m) { if (over) { help.push(d); nm.add(d); } continue; }
   if (m === c || m === ref || (b.state === 'pass' && b.to === m)) continue;
   if (crossed(d, m, -1)) continue;
   if (!over && !(m.x > ref.x + TRAIL)) continue;
   help.push(d);
  }
  if (!help.length) return;
  UD = { map: assign(help, spots(DGX, -1, ref.y)), nm: nm, bref: c || (b.state === 'pass' && b.to) || b, done: new Set };
 }
 if (typeof W0.moveTo === 'function' && typeof W0.updateDefense === 'function') {
  const M0 = W0.moveTo;
  W0.moveTo = function (p, tx, ty, spd, dt) {
   if (UD && p && UD.map.has(p) && !UD.done.has(p)) {
    try {
     // only the man-D call (t30 is set right before it) or the no-man call (DGX + 22) is replaced
     const manCall = !UD.nm.has(p) && p.t30 && p.t30[0] === tx && p.t30[1] === ty;
     const nmCall = UD.nm.has(p) && tx === DGX + 22;
     if (manCall || nmCall) {
      UD.done.add(p);
      const q = UD.map.get(p);
      tx = q[0]; ty = q[1]; spd = spdTo(p, q, spd);
      if (nmCall) ST.uNoMark++; else ST.uHelp++; p._dh431f = G_().t;
     }
    } catch (e) { er(e); }
   }
   return M0.call(this, p, tx, ty, spd, dt);
  };
  const U0 = W0.updateDefense;
  W0.updateDefense = function (dt) {
   try { userPrep(); } catch (e) { er(e); UD = null; }
   try { return U0.apply(this, arguments); } finally { UD = null; }
  };
 }
 W0.V556_DH431 = { on: () => !W0.__rl_no431dh, stats: () => Object.assign({}, ST, { why: Object.assign({}, WHY) }) };
})();

 });

 // ===================== port of v434at.js (its online gate -> __B()) =====================
 port('v434at', function (__B) {
// v434at.js - V43.4: ATTACK WORKS TO GET OPEN IN THE CLEAR / TRANSITION (offline / vs-CPU only, purely local AI).
// Before: during your clear (you pick it up in your own half and run it up), your three attackmen ran to their set
// spots down low and stood there until the clear was over - nobody to hit, nobody breaking to the cage.
// Now, while you clear and for the first seconds of the transition, every attackman with nothing else to do keeps
// working, reading his defender:
//  - the ball-side attackman FLASHES UP toward the restraining line as an outlet, then BREAKS BACK TO THE NET;
//  - the other two spread low (X / goal-line extended) and V-CUT: sell in, pop out to the ball side away from their
//    man, then break back to the cage; a defender playing him high (ball side) gets beaten backdoor to the net, a
//    defender sagging to the cage gets a pop out toward the ball;
//  - on a fast break (you bring more men over the line than they have back) they set up the fast-break triangle:
//    point up top, two on the pipes.
// Hands off: the ball carrier, the guy you control, a pass target, guys who are down / stunned / covering, a CUT you
// called, a pick, any drawn play run or hold (playmaker / custom clears / set plays), sub jobs (S421 / auto subs /
// playmaker subs / stick-break jog / midline crosser). Attack always stays in the offensive half (onside).
// When the transition settles (into the box, a set or play called, a shot, a loose ball, the other team's ball,
// ~3.5 s after crossing) the normal offense logic takes over at once.
// CPU clears: the CPU attackmen get the same IQ (they were running to a spot and standing too).
// Kill switch: window.__rl_no434at = true (exactly the old behaviour). Online / tutorial / BRAVEHEART: off.
// No storage keys, no net protocol, no lineup changes.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v556c_v434at_loaded) return;
 W0.__rl_v556c_v434at_loaded = true;
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const ST = { uFrames: 0, uCtl: 0, cFrames: 0, cCtl: 0, flash: 0, vcut: 0, back: 0, fb: 0, rel: 0, err: 0, phases: 0 };
 const er = e => { ST.err++; try { console.error(e); } catch (x) {} };
 const off = G => !!W0.__rl_no434at || !!W0.__rl_v124gb || !G || !!G.tutorial || !!__B() || !!G.brave || !!G.over || G.farMode === 'fo' || !G.players || !G.ball;
 const rnd2 = (a, b) => a + Math.random() * (b - a);
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
 const TR_T = 3.5, BOX_T = 1.2, CUT = () => (typeof PACE !== 'undefined' ? PACE.cut : 20);
 // ids tied up in any sub (S421 jobs incl. auto subs / follows / playmaker subs, CPU sub job, auto-sub CPU jobs, SUB-screen pending)
 function subIds(G) {
  const s = new Set;
  try {
   const T = G.s421;
   if (T) {
    for (const j of T.jobs || []) if (j && j.phase !== 'done') { s.add(j.outId); s.add(j.inId); s.add(j.overId); s.add(j.stepId); }
    const cj = T.cpu && T.cpu.job; if (cj) { s.add(cj.outId); s.add(cj.inId); }
   }
   const A = G.a428; if (A) for (const j of A.cpuJobs || []) if (j && j.phase !== 'done') { s.add(j.outId); s.add(j.inId); }
   if (W0.S425 && Array.isArray(S425.PEND)) for (const q of S425.PEND) if (q && q.st !== 'done') { s.add(q.off); s.add(q.on); s.add(q.over); }
  } catch (e) {}
  s.delete(undefined); s.delete(null);
  return s;
 }
 // ---- who is free for us ----
 const busy = (G, p, car, ctl, b, sub) => {
  if (!p || p === car || p === ctl || p.gk || p.team === 'G' || p.team === 'G2') return true;
  if (p.down > 0 || p.stun > 0 || p.coverT > 0 || p.cut181 || p.callPick || p.pickSet || p.playT || p.r26) return true;
  if (p.playHold && (G.playRun && !G.playRun.done || G.pset || G.cset)) return true;
  if (p.s421 || p.s428 || p.s427 || p.sub427 || p.ns17 || p.over || p.tOver || p.follow428) return true;
  if (b.state === 'pass' && b.to === p) return true;
  if (sub && p.pl && sub.has(p.pl.id)) return true;
  if (G.help18 === p) return true;
  try { if (typeof isChaser === 'function' && isChaser(p)) return true; } catch (e) {}
  if (G.chasers && G.chasers.includes(p)) return true;
  if (G.dChasers && G.dChasers.includes(p)) return true;
  return false;
 };
 // ---- geometry for an attack going toward goal at gx (dir = +1 attacking right, -1 attacking left) ----
 function geo(dir) {
  const gx = dir > 0 ? GX : DGX;
  const mid = MIDX;
  const rl = dir > 0 ? RL_R : RL_L;
  return { dir, gx, mid, rl,
   // x measured "up field" from the goal line: u = distance from goal line toward midline
   X: u => gx - dir * u,
   inHalf: x => dir > 0 ? cl(x, mid + 10, gx + 28) : cl(x, gx - 28, mid - 10) };
 }
 function legal(Gm, q) {
  let x = Gm.inHalf(q[0]), y = cl(q[1], FT + 14, FB - 8);
  const behind = Gm.dir > 0 ? x > Gm.gx : x < Gm.gx;
  if (behind) y = cl(y, CY - 34, CY + 34);
  const dx = x - Gm.gx, dy = y - CY, d = Math.hypot(dx, dy), R = CREASE + 7;
  if (d < R) { const k = R / (d || 1); x = Gm.gx + (d ? dx * k : -Gm.dir * R); y = CY + (d ? dy * k : 0); }
  return [ x, y ];
 }
 // nearest defender to p (his mark first)
 function myD(p, dl) {
  let m = null;
  for (const d of dl) if (d.mark === p || d.mk === p) { m = d; break; }
  let nd = null, nb = 1e9;
  for (const d of dl) { const k = dist(d, p); if (k < nb) { nb = k; nd = d; } }
  if (m && dist(m, p) < 40) return m;
  return nd && nb < 40 ? nd : m;
 }
 // a drawn set (v420c CPU clears / sets) owns its men while it runs: they keep the drawn spots, we do not fight it
 function drawn(p) { try { const o = W0.V420C && typeof W0.V420C.ovrOf === 'function' ? W0.V420C.ovrOf(p) : null; return !!o && o[3] <= 1; } catch (e) { return false; } }
 function segD(px, py, ax, ay, bx, by) { const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1; const t = cl(((px - ax) * vx + (py - ay) * vy) / L, 0, 1); return Math.hypot(px - ax - vx * t, py - ay - vy * t); }
 function crowd(q, dl) { let md = 1e9; for (const d of dl) md = Math.min(md, Math.hypot(d.x - q[0], d.y - q[1])); return md; }
 // ---- the brain ----
 // team memory per side: who is the outlet (one at a time, kept a while), and who holds the "break to the net" token
 function team(G, key) { const k = '_at434' + key; let t = G[k]; if (!t) t = G[k] = { key, outlet: null, outT: 0, backer: null, backT: 0, done: new Set() }; return t; }
 function baseSpot(Gm, k, n) {
  const b = n >= 3 ? [ [ Gm.X(rnd2(4, 14)), CY - rnd2(40, 50) ], [ Gm.X(-rnd2(14, 22)), CY + rnd2(-6, 6) ], [ Gm.X(rnd2(4, 14)), CY + rnd2(40, 50) ] ]
                   : [ [ Gm.X(rnd2(6, 16)), CY - rnd2(36, 46) ], [ Gm.X(rnd2(6, 16)), CY + rnd2(36, 46) ] ];
  return b[Math.min(k, b.length - 1)];
 }
 function decide(G, Gm, TS, p, k, n, car, dl, mates, mode, tNow) {
  const s = p.at434;
  const bY = car ? car.y : G.ball.y;
  const d = myD(p, dl);
  ST.phases++;
  if (mode === 'fb') {
   // fast-break triangle: point up top, two on the pipes
   const spots = n >= 3 ? [ [ Gm.X(10), CY - 27 ], [ Gm.X(46), CY ], [ Gm.X(10), CY + 27 ] ] : [ [ Gm.X(12), CY - 26 ], [ Gm.X(12), CY + 26 ] ];
   const q = spots[Math.min(k, spots.length - 1)];
   s.ph = 'fb'; s.tgt = legal(Gm, [ q[0] + rnd2(-3, 3), q[1] + rnd2(-3, 3) ]); s.spd = CUT() * 1.45; s.until = tNow + rnd2(.6, 1);
   ST.fb++;
   return;
  }
  const prev = s.ph, outlet = TS.outlet === p;
  const deny = d ? (Gm.dir > 0 ? (p.x - d.x) : (d.x - p.x)) : 0;   // + : his man is playing him up field (ball side)
  const tight = d ? dist(d, p) < 15 : false;
  const backFree = !TS.backer || TS.backer === p || tNow > TS.backT;
  let ph;
  if (outlet && mode === 'clear') {
   // outlet: flash up -> show a target (post) -> break back to the net -> set low; then the job moves on
   ph = prev === 'flash' ? 'post' : prev === 'post' ? (backFree ? 'back' : 'set') : prev === 'back' ? 'set' : 'flash';
   if (prev === 'back' || prev === 'post' && !backFree) { TS.done.add(p); TS.outlet = null; }
  } else if (prev === 'v') ph = tight && deny > 2 && backFree ? 'back' : 'set';
  else if (prev === 'back') ph = 'set';
  else if (prev === 'new') ph = 'set';
  else if (prev === 'over') ph = backFree ? 'back' : 'set';
  else ph = tight && deny > 3 && backFree ? 'back' : (Math.random() < .3 && backFree ? 'back' : 'v');
  const sideY = p.y < CY ? -1 : 1;
  let C = [], spd, dur;
  if (ph === 'flash') {
   // outlet: come up toward the restraining line on the ball side, into the softest spot
   const yc = p.y + (bY - p.y) * .55;
   for (const u of [ 96, 112, 128, 142 ]) for (const dy of [ -16, 0, 16 ]) C.push([ Gm.X(u), yc + dy ]);
   spd = CUT() * 1.35; dur = rnd2(1.4, 2); ST.flash++;
  } else if (ph === 'post') {
   for (const dy of [ -14, -7, 7, 14 ]) for (const dx of [ -5, 5 ]) C.push([ p.x + Gm.dir * dx, p.y + dy ]);
   spd = CUT() * .9; dur = rnd2(.6, 1);
  } else if (ph === 'v') {
   // V-cut: pop out up field toward the ball side, away from his man
   const base = s.base || [ p.x, p.y ];
   for (const du of [ 22, 32, 42 ]) for (const dy of [ -16, 0, 16 ]) C.push([ base[0] - Gm.dir * du, base[1] + (bY - base[1]) * .2 + dy ]);
   spd = CUT() * 1.3; dur = rnd2(.8, 1.2); ST.vcut++;
  } else if (ph === 'back') {
   // break back to the net: hard cut just off the crease on his side (backdoor on a man playing him high)
   for (const a of [ .3, .55, .8, 1.05 ]) for (const R of [ CREASE + 9, CREASE + 15 ]) C.push([ Gm.gx - Gm.dir * Math.cos(a) * R, CY + Math.sin(a) * R * sideY ]);
   spd = CUT() * 1.45; dur = rnd2(.9, 1.3); ST.back++;
  } else {
   const b0 = baseSpot(Gm, k, n);
   for (const dx of [ -8, 0, 8 ]) for (const dy of [ -8, 0, 8 ]) C.push([ b0[0] + dx, b0[1] + dy ]);
   spd = CUT() * 1.05; dur = prev === 'new' ? rnd2(.5, 1.6) : rnd2(.7, 1.3);
  }
  // read the D: the candidate furthest from every defender, with a clean lane from the ball, near his run, off his mates
  let q = null, best = -1e9;
  const bx = car ? car.x : G.ball.x, by = car ? car.y : G.ball.y;
  for (const c0 of C) {
   const c1 = legal(Gm, c0);
   let md = 60;
   for (const dd of dl) md = Math.min(md, Math.hypot(dd.x - c1[0], dd.y - c1[1]));
   let mt = 40;
   for (const m of mates) { if (m === p) continue; const mq = m.at434 && m.at434.tgt ? m.at434.tgt : [ m.x, m.y ]; mt = Math.min(mt, Math.hypot(mq[0] - c1[0], mq[1] - c1[1])); }
   let lane = 14;
   for (const dd of dl) if (segD(dd.x, dd.y, bx, by, c1[0], c1[1]) < 9) { lane = 0; break; }
   const db = Math.hypot(c1[0] - bx, c1[1] - by), reach = db < 170 ? 6 : -(db - 170) * .12;
   const sc = Math.min(md, 40) + (mt < 20 ? (mt - 20) * 1.5 : 0) + lane + reach - Math.hypot(c1[0] - p.x, c1[1] - p.y) * .04 + rnd2(0, 4);
   if (sc > best) { best = sc; q = c1; }
  }
  if (ph === 'back') { TS.backer = p; TS.backT = tNow + dur + .4; }
  // a real cut makes his man react late - the same read the game's own off-ball cuts get (DEF.r0..r1)
  if (TS.key === 'U' && (ph === 'flash' || ph === 'v' || ph === 'back')) {
   try { const r0 = DEF.r0, r1 = DEF.r1, k = (typeof DF !== 'undefined' && DF.react) || 1; for (const dd of G.players) if (dd.team === 'D' && (dd.mark === p || G.rot && G.rot.d === dd && G.rot.m === p)) dd.react = rnd2(r0, r1) * k; } catch (e) {}
  }
  if (ph === 'set') s.base = q.slice();
  s.ph = ph; s.tgt = q; s.spd = spd; s.until = tNow + dur;
 }
 // one team's attackmen for a frame. mode: 'clear' (ball still in the back half), 'trans' (just over), 'fb' (fast break)
 function drive(G, Gm, key, list, dl, car, mode, tNow, setT) {
  const TS = team(G, key);
  const bY = car ? car.y : G.ball.y;
  if (TS.outlet && (!list.includes(TS.outlet) || mode !== 'clear')) TS.outlet = null;
  if (!TS.outlet && mode === 'clear' && tNow > TS.outT) {
   // the ball-side man who has not had a turn yet (then anyone) becomes the outlet
   let bs = null, bd = 1e9;
   for (const pass of [ 0, 1 ]) {
    for (const p of list) { if (pass === 0 && TS.done.has(p)) continue; const k = Math.abs(p.y - bY); if (k < bd) { bd = k; bs = p; } }
    if (bs) break;
    TS.done.clear();
   }
   if (bs) { TS.outlet = bs; TS.outT = tNow + .8; if (bs.at434 && bs.at434.ph !== 'back') bs.at434.until = 0; }
  }
  if (TS.backer && !list.includes(TS.backer)) TS.backer = null;
  const sorted = list.slice().sort((a, b) => a.y - b.y);
  sorted.forEach((p, k) => {
   let s = p.at434;
   if (!s) { s = p.at434 = { ph: 'new', until: 0 }; if (TS.outlet !== p) s.ph = 'new'; }
   const reached = s.tgt && Math.hypot(s.tgt[0] - p.x, s.tgt[1] - p.y) < 3;
   const crowded = s.tgt && (s.ph === 'set' || s.ph === 'v' || s.ph === 'post') && crowd(s.tgt, dl) < 9;
   const fbChange = mode === 'fb' ? s.ph !== 'fb' : s.ph === 'fb';
   const flashOver = mode !== 'clear' && (s.ph === 'flash' || s.ph === 'post');
   if (!s.tgt || tNow >= s.until || reached && (s.ph === 'flash' || s.ph === 'v' || s.ph === 'back') || crowded || fbChange || flashOver) {
    if (flashOver) s.ph = 'over';
    decide(G, Gm, TS, p, k, sorted.length, car, dl, list, mode, tNow);
   }
   setT(p, s.tgt[0], s.tgt[1], s.spd);
  });
 }
 function release(list, cpu) {
  for (const p of list) if (p && p.at434) {
   p.at434 = null;
   if (cpu) p.wt = Math.min(p.wt || 0, .5); else p.wander = .5;
   ST.rel++;
  }
 }
 // ================= USER (screen 'live', attacking right) =================
 const U = { on: false, crossT: null, boxT: 0, list: [] };
 function userPre() {
  const G = G_();
  if (off(G) || scr() !== 'live') { if (U.list.length) release(U.list); U.list = []; U.on = false; U.crossT = null; return; }
  const b = G.ball, car = G.carrier;
  const ours = car && (car.team === 'O' || car.team === 'G2') || b.state === 'pass' && b.to && (b.to.team === 'O' || b.to.team === 'G2');
  let act = false;
  if (G.clearing) { act = true; U.crossT = null; U.boxT = 0; }
  else if (U.on) {
   if (U.crossT == null) U.crossT = G.t;
   if (car && car.x > RL_R + 2) U.boxT += 1 / 60; 
   act = G.t - U.crossT < TR_T && U.boxT < BOX_T;
  }
  if (!ours || (b.state !== 'held' && b.state !== 'pass') || G.pset || (G.playRun && !G.playRun.done) || G.pen && G.pen.side === 'C' && !G.clearing || G.cset && !G.clearing) act = false;
  if (!act) { if (U.list.length) release(U.list); U.list = []; U.on = false; U.crossT = null; U.fb = false; U.fbW = 0; G._at434U = null; return; }
  U.on = true;
  ST.uFrames++;
  const ctl = G.ctrl;
  const sub = subIds(G), atk = G.players.filter(p => p.team === 'O' && rrOf(p) === 'A' && !busy(G, p, car, ctl, b, sub) && !drawn(p));
  for (const p of U.list) if (!atk.includes(p)) release([ p ]);
  U.list = atk;
  if (!atk.length) return;
  const dl = G.players.filter(p => p.team === 'D' && !p.gk);
  // fast break: more of ours over the line (carrier near / over midline) than their non-goalie men back
  const cx = car ? car.x : b.x;
  if (cx > MIDX - 12) {
   const ourUp = G.players.filter(p => p.team === 'O' && !p.gk && p.x > MIDX - 12).length;
   const theirBack = dl.filter(d => d.x > MIDX - 4 && !(d.down > 0)).length;
   U.fbW = cl((U.fbW || 0) + (ourUp > theirBack ? 1 : -1) / 60, 0, .6);
   if (!U.fb && U.fbW > .25) U.fb = true; else if (U.fb && U.fbW <= 0) U.fb = false;
  } else { U.fb = false; U.fbW = 0; }
  const fb = !!U.fb;
  ST.uCtl += atk.length;
  drive(G, geo(1), 'U', atk, dl, car, fb ? 'fb' : G.clearing ? 'clear' : 'trans', G.t, (p, x, y, s) => { p.tx = x; p.ty = y; p.spd = s; p.wander = 9; });
 }
 // hook right before the live movement loop (H2on() is called once per updateLive frame there; v410d.js uses it too)
 let inLive = false, did = false;
 if (typeof W0.H2on === 'function' && typeof W0.updateLive === 'function') {
  const H0 = W0.H2on;
  W0.H2on = function () {
   const r = H0.apply(this, arguments);
   if (inLive && !did) { did = true; try { userPre(); } catch (e) { er(e); } }
   return r;
  };
  const L0 = W0.updateLive;
  W0.updateLive = function (dt) {
   inLive = true; did = false;
   try { return L0.apply(this, arguments); }
   finally {
    inLive = false;
    // a frame that returned early (whistle, turnover) never reached the movement loop: let go of everyone
    if (!did && U.list.length) { try { release(U.list); } catch (e) {} U.list = []; U.on = false; }
   }
  };
 }
 // ================= CPU (screen 'defense', attacking left) =================
 const C = { on: false, crossT: null, boxT: 0, list: [], t: -1 };
 function cpuTick(G) {
  if (C.t === G.t) return; C.t = G.t;
  const b = G.ball, car = G.dcar || (b.state === 'pass' && b.to && b.to.team === 'D' ? b.to : null);
  const theirs = !!car && car.team === 'D' && (b.state === 'held' || b.state === 'pass');
  let act = false;
  if (G.cpuClear && theirs) { act = true; C.crossT = null; C.boxT = 0; }
  else if (C.on && theirs) {
   if (C.crossT == null) C.crossT = G.t;
   if (car.x < RL_L - 2) C.boxT += 1 / 60;
   act = G.t - C.crossT < TR_T && C.boxT < BOX_T;
  }
  if (G.pen && G.pen.side === 'U') act = false;
  if (!act) { if (C.list.length) release(C.list, true); C.list = []; C.on = false; C.crossT = null; C.map = null; C.fb = false; C.fbW = 0; G._at434C = null; return; }
  C.on = true; ST.cFrames++;
  const sub = subIds(G), atk = G.players.filter(p => p.team === 'D' && rrOf(p) === 'A' && !busy(G, p, car, null, b, sub) && !drawn(p));
  for (const p of C.list) if (!atk.includes(p)) release([ p ], true);
  C.list = atk;
  const dl = G.players.filter(p => p.team === 'O' && !p.gk);
  if (car.x < MIDX + 12) {
   const up = G.players.filter(p => p.team === 'D' && !p.gk && p.x < MIDX + 12).length;
   const back = dl.filter(d => d.x < MIDX + 4 && !(d.down > 0)).length;
   C.fbW = cl((C.fbW || 0) + (up > back ? 1 : -1) / 60, 0, .6);
   if (!C.fb && C.fbW > .25) C.fb = true; else if (C.fb && C.fbW <= 0) C.fb = false;
  } else { C.fb = false; C.fbW = 0; }
  const fb = !!C.fb;
  C.map = new Map();
  ST.cCtl += atk.length;
  drive(G, geo(-1), 'C', atk, dl, car, fb ? 'fb' : G.cpuClear ? 'clear' : 'trans', G.t, (p, x, y, s) => C.map.set(p, [ x, y, s ]));
 }
 // CPU attackers move through off110Move (when the CPU offense brain is on) or their wander; we take the off110Move
 // slot for our guys during the CPU clear/transition only.
 if (typeof W0.off110Move === 'function' && typeof W0.moveTo === 'function') {
  const M0 = W0.off110Move;
  W0.off110Move = function (G, a, dt) {
   try {
    if ((off(G) || scr() !== 'defense') && C.list.length) { release(C.list, true); C.list = []; C.on = false; C.map = null; }
    if (!off(G) && scr() === 'defense' && a && a.team === 'D') {
     cpuTick(G);
     const q = C.map && C.map.get(a);
     if (q) { moveTo(a, q[0], q[1], q[2], dt); a.wt = 9; return true; }
    }
   } catch (e) { er(e); }
   return M0.apply(this, arguments);
  };
 }
 W0.V556_AT434 = { on: () => !W0.__rl_no434at, stats: () => Object.assign({}, ST), U, C };
})();

 });

 // ===================== port of v487dg2.js (its online gate -> __B()) =====================
 port('v487dg2', function (__B) {
// v487dg2.js - V48.7: the "diagonal / synced player" fix, part 3 (kill switch: window.__rl_no487dg2 = true).
// Charlie (Nov 10 12:36 AM, 1.2 beta site, Q2, MAN-UP running): "Diagonal glitched happens again" /
// "Think i was tryna check someone while going for ground ball".
// Root cause (game.js looseWatchdog, the defense branch L5096-5102, and the same live branch L5077-5083): when the ball has
// been on the ground for 0.8 s and your thumb is OFF the stick (you are tapping CHECK / HIT at someone), the game "helps"
// by writing G.run = { x, y } - ONE fixed direction from your guy to where the ball was at that instant. Nothing ever
// re-aims it: the ball rolls on, the CPU chaser cuts across, and your guy keeps running that frozen diagonal at the
// ground-ball pace (L24142); a CPU chaser on the same line ends up glued to him at the 4 px player spacing, the two
// moving as one (the "sync"), and your guy faces the frozen diagonal. Worse, it OUTLIVES the ground ball: the run has
// no .joy flag, so lifting / never touching the stick does not clear it (joyRelease only clears joy runs, L2411), dTake
// does not clear it when control stays on the same guy (L23639), and while it is set the game treats your thumb as ON
// the stick - updateDefense keeps running him along it (L24153), dAutoTick will not hand control to a better defender
// while a check is cooling down (L23671) or you are near the carrier with a run set (L23705/L23722), and v441dg (thumb
// off only) never engages. With AUTO SWITCH off in settings (dAutoTick returns at L23671) nothing at all ends it.
// Reproduced headless (test/h.py + test/mon.js; man-up and man-down D, the ball popped loose, CHECK/HIT tapped every
// 0.35 s, thumb never on the stick): the frozen run kept steering the defender after the CPU had the ball for up to
// 1.5 s (auto switch on) and up to 13 s (auto switch off) - he runs off on his own diagonal away from the play; in 2 of
// 40 runs it pinned him on a CPU player for 1.0-1.1 s; and during the ground ball itself the CPU chaser was glued to
// him for 1.28 s (2 of 48 runs, man-down) - both ran the same frozen line.
// Fix: only the run the watchdog itself wrote (tagged at the moment it is written; your own stick, keys and taps are
// never touched): while the ball is loose it is re-aimed at the ball every frame (so he chases the ball, not a stale
// spot), with a side-step around a player he is jammed on (> 0.3 s within 6.5 px) instead of riding his back; and the
// moment the ball is not loose any more (scooped, passed, clear) or the control switches, the helper run is dropped so
// the normal D (and v441dg) takes over exactly as with the thumb off (on offense, if YOU scoop it, the run is left to the
// game's own carrier rule L7322 exactly as before). Offline only; no ids, rl_* keys, __rl_* flags,
// net messages or fields change.
(function () {
 'use strict';
 const W0 = window;
 if (typeof W0.looseWatchdog !== 'function' || typeof W0.updateDefense !== 'function' || typeof W0.updateLive !== 'function') { W0.V556_V487DG2 = { on: () => false, why: 'no hooks' }; return; }
 const off = () => !!W0.__rl_no487dg2 || !!W0.__rl_v124gb;
 const LOG = { tag: 0, aim: 0, side: 0, drop: 0, err: 0, last: null };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const offline = G => !!G && !__B() && !(G.meta && __B()) && !G.tutorial;
 let PIN = null;   // { G, p, o, t, sd }
 const LW0 = W0.looseWatchdog;
 W0.looseWatchdog = function (dt, mode) {
  let G0 = null, r0 = null;
  try { G0 = game; r0 = G0 && G0.run; } catch (e) {}
  const out = LW0.apply(this, arguments);
  try {
   const G = game;
   if (!off() && G === G0 && offline(G) && G.run && G.run !== r0 && !G.run.joy) {
    G.run.auto487 = mode === 'live' ? 'live' : 'def';
    G.run.who487 = mode === 'live' ? G.ctrl : G.dctl;
    LOG.tag++;
   }
  } catch (e) { LOG.err++; }
  return out;
 };
 function fix(G, key) {
  const r = G.run;
  if (!r || !r.auto487) return;
  const p = G[key], b = G.ball;
  if (!b || (b.state !== 'loose' && b.state !== 'chase') || !p || r.who487 !== p || p.down > 0) {   // ground ball over / control moved: drop the helper run
   if (key === 'ctrl' && p && r.who487 === p && b && b.state !== 'loose' && b.state !== 'chase') { delete r.auto487; LOG.keepLive = (LOG.keepLive || 0) + 1; PIN = null; return; }   // you scooped it on offense: the game's own carry rule (L7322) keeps handling that run, as before
   G.run = null; PIN = null; LOG.drop++; LOG.last = { why: !b || b.state !== 'loose' ? 'ball ' + (b && b.state) : 'ctl', t: +G.t.toFixed(2) };
   return;
  }
  let ux = b.x - p.x, uy = b.y - p.y; const L = Math.hypot(ux, uy);
  if (L < .5) return;
  ux /= L; uy /= L;
  // jammed on a player between him and the ball: step round his shoulder instead of riding his back
  let o = null, od = 6.5;
  for (const q of G.players) {
   if (q === p || q.team === p.team || q.team === 'G' || q.team === 'G2' || q.down > 0) continue;
   const d = Math.hypot(q.x - p.x, q.y - p.y);
   if (d < od && ((q.x - p.x) * ux + (q.y - p.y) * uy) > -1) { od = d; o = q; }
  }
  if (o && L > 4) {
   if (!PIN || PIN.G !== G || PIN.p !== p || PIN.o !== o) PIN = { G: G, p: p, o: o, t: 0, sd: ((o.x - p.x) * -uy + (o.y - p.y) * ux) > 0 ? -1 : 1 };
   PIN.t += G.dt487 || 1 / 60;
   if (PIN.t > .3) {
    const sx = -uy * PIN.sd, sy = ux * PIN.sd;
    ux = ux * .55 + sx * .85; uy = uy * .55 + sy * .85;
    const l2 = Math.hypot(ux, uy) || 1; ux /= l2; uy /= l2;
    LOG.side++;
   }
  } else if (PIN && PIN.p === p) PIN.t = Math.max(0, PIN.t - (G.dt487 || 1 / 60) * 2);
  r.x = ux; r.y = uy; LOG.aim++;
 }
 function wrap(name, key, scrName) {
  const F0 = W0[name];
  W0[name] = function (dt) {
   try { const G = game; if (!off() && offline(G) && scr() === scrName && G.run && G.run.auto487) { G.dt487 = dt; fix(G, key); } } catch (e) { LOG.err++; }
   const out = F0.apply(this, arguments);
   try { const G = game; if (!off() && offline(G) && G && G.run && G.run.auto487 && (scr() !== scrName || !G.ball || (G.ball.state !== 'loose' && G.ball.state !== 'chase'))) { G.dt487 = dt; fix(G, key); } } catch (e) { LOG.err++; }
   return out;
  };
 }
 wrap('updateDefense', 'dctl', 'defense');
 wrap('updateLive', 'ctrl', 'live');
 W0.V556_V487DG2 = { on: () => !off(), LOG: LOG };
})();

 });

 // ===================== port of v495ride.js (its online gate -> __B()) =====================
 port('v495ride', function (__B) {
/* v495ride.js - Bagga Lax 1.2: "no defense on my clear and they just like appeared spawning in at midline" (kill switch: window.__rl_no495ride = true).
 * Charlie (Nov 10, beta site): a normal clear, he carried it up his side and passed to a teammate still on his side near midline;
 * the CPU riders were gone, then "they were running on from far side" at midline.
 * Root cause (reproduced headless, 3 of 3 outlet passes): a pass to a FAR teammate during your clear (one of your guys the
 * game keeps on the far list: a pole or a middie who stayed back, the edge-arrow mates) is caught through game.js L7497
 * liveClear(b.to, 'OUTLET'), which rebuilds the whole clear around the receiver. That rebuild carries the CPU's near players
 * (riders or back), its far D (role D) and far middies (role M) into the new lists, but NOT the CPU riders that were already on
 * the far list (role A / R - the three attackmen riding you). They are simply dropped (G.farC is rebuilt without them,
 * game.js ~L20148-20159), so the CPU is 3 men short on your clear. 0.2 s later v440md's 10-on-field safety net sees the short
 * team and re-adds them one by one at its fixed entry spot on the FAR sideline at midline (v440md BOX: MIDX-6, FT+12),
 * from where they run back in: exactly "running on from far side". Not one of today's files (v473safe / v487dg2 / v488oob
 * do not touch this; same result with each switched off).
 * Fix: after a liveClear rebuild, any CPU rider that was on the far list before and is now on neither list goes back on the
 * far list as the same object (same spot, same rest spot, mark re-paired), so nobody vanishes, nobody pops in, no extra
 * man ever (capped at the CPU's legal count). Offline only; ids, rl_* keys, __rl_* flags and the net protocol unchanged.
 * Telemetry: window.V495 { kept, calls, errs }.
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v556c_v495_loaded) return;
 W0.__rl_v556c_v495_loaded = 1;
 const LOG = W0.V556_V495 = { calls: 0, kept: 0, last: null, errs: 0, err: [] };
 const off = () => !!W0.__rl_no495ride || !!W0.__rl_v124gb;
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const okG = G => !!G && !!G.players && !__B() && !(G.meta && __B()) && !G.tutorial && !G.brave;
 const idOf = x => x && x.pl && x.pl.id != null ? String(x.pl.id) : null;
 const isGk = p => !!(p.gk || p.team === 'G' || p.role === 'G');
 const LC0 = W0.liveClear;
 if (typeof LC0 !== 'function') { LOG.why = 'no liveClear'; return; }
 W0.liveClear = function (p, why) {
  const G = G_();
  let riders = null;
  try {
   if (!off() && okG(G) && G.farC) riders = G.farC.filter(f => f && f.far && (f.role === 'A' || f.role === 'R') && idOf(f));
  } catch (e) { riders = null; }
  const r = LC0.apply(this, arguments);
  try {
   if (r && riders && riders.length && game === G && G.players && G.farC) {
    LOG.calls++;
    const on = new Set;
    for (const q of G.players) if (q.team === 'D' || q.team === 'G') { const id = idOf(q); if (id) on.add(id); }
    for (const f of G.farC) { const id = idOf(f); if (id) on.add(id); }
    const pen = G.pen && G.pen.side === 'C' && !G.penPending ? 1 : 0;
    const count = () => G.players.filter(q => q.team === 'D' && !isGk(q)).length + G.farC.filter(f => !isGk(f)).length;
    let n = 0;
    for (const f of riders) {
     const id = idOf(f);
     if (on.has(id) || count() >= 9 - pen) continue;
     if (G.pen && G.pen.side === 'C' && G.pen.who && String(G.pen.who.id) === id) continue;   // the man in the box stays there
     f.mk = null;
     f.chase = false;
     G.farC.push(f);
     on.add(id);
     n++;
    }
    if (n) {
     try { farPair(G); } catch (e) {}
     LOG.kept += n;
     LOG.last = { n: n, why: why || '', t: +(+G.t || 0).toFixed(2), scr: screen };
    }
   }
  } catch (e) { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(String(e && e.message || e)); }
  return r;
 };
})();

 });

 // ===================== port of v416p.js (its online gate -> __B()) =====================
 port('v416p', function (__B) {
/* V40.1.6p: your ball carrier NEVER passes by himself, in any play type.
   v404g (V40.0.4) blocked the two known auto passes, but only by call site (inside playTick / updateDefense).
   This makes the rule total and future-proof: during a game tick, a pass for YOUR carrier only happens when it
   comes from your own input (tap / touch / click / key). Anything else the game tries (set plays, end line and
   sideline restarts, man-up / EMO, playmaker plays, timeout plays, clears, faceoff follow-ups, v27 "prep" passes,
   the goalie's clear outlet) is dropped and counted. Teammates still run their routes; the PASS ring still shows
   the play's target - you decide when and where to pass. CPU teams are untouched (they pass through their own code).
   Online games are untouched (net protocol unchanged).
   Kill switch: window.__rl_no416p = true -> behaves exactly like before.
   (window.__rl_no404gclr = true still brings back only the goalie's automatic clear outlet.) */
(function () {
 'use strict';
 const off = () => !!window.__rl_no416p;
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen === 'string' ? screen : '');
 const online = G => !!(G && (__B() || (G.meta && __B())));
 const ST = { blocked: 0, blockedClr: 0, userPass: 0, last: null };
 let tick = 0, inp = 0;
 const UI = /^(pointer|touch|mouse|click|key)/;
 function userInput() {
  if (inp > 0) return true;
  try { const e = window.event; return !!(e && UI.test(e.type)); } catch (_) { return false; }
 }
 function depth(name, add) {
  const f = window[name];
  if (typeof f !== 'function') return false;
  window[name] = function () {
   add(1);
   try { return f.apply(this, arguments); } finally { add(-1); }
  };
  return true;
 }
 // the whole game tick (live, defense, clears, restarts, play runners all run inside it)
 const hasTick = depth('step2317', d => { tick += d; });
 // the canvas input handlers: a tap on a mate (pass) and a tap during the clear both go through inUp
 depth('inUp', d => { inp += d; });
 depth('inDown', d => { inp += d; });
 function why(G) {
  if (!G) return '';
  if (G.el2314 || G.elSet && G.readyT > 0) return 'endline';
  if (G.pset) return 'set:' + (G.pset.pl ? G.pset.pl.cat || '' : '');
  if (G.playRun && !G.playRun.done) return 'play:' + (G.playRun.pl ? G.playRun.pl.cat || '' : '');
  if (G.cset) return 'clear';
  if (G.pen) return 'manup';
  return 'other';
 }
 if (hasTick && typeof window.throwPass === 'function') {
  const TP0 = window.throwPass;
  window.throwPass = function (to) {
   const G = G_();
   if (!off() && tick > 0 && G && scr() === 'live' && !online(G) && G.carrier && G.carrier.team === 'O') {
    if (!userInput()) {
     ST.blocked++;
     G.noAuto416 = (G.noAuto416 || 0) + 1;
     ST.last = { t: +(+G.t || 0).toFixed(2), why: why(G), from: G.carrier.idx, to: to ? to.idx : null };
     return;
    }
    ST.userPass++;
   }
   return TP0.apply(this, arguments);
  };
 }
 if (hasTick && typeof window.dThrowClear === 'function') {
  const DT0 = window.dThrowClear;
  window.dThrowClear = function (to) {
   const G = G_();
   if (!off() && !window.__rl_no404gclr && tick > 0 && G && G.dclear && !G.tutorial && !online(G) && !userInput()) {
    ST.blockedClr++;
    G.noAutoClr416 = (G.noAutoClr416 || 0) + 1;
    return;
   }
   return DT0.apply(this, arguments);
  };
 }
 window.V556_V416P = { ST: ST, on: () => !off() && hasTick };
})();

 });
 W0.V556NA = { on: () => !killed(), ok: ok, cap: () => C.peer, C: C, ST: ST,
  stats: () => { const g = n => { try { return W0[n]; } catch (e) { return null; } }; return {
   v413m: g('V556_V413M') && V556_V413M.LOG ? { cpuFrames: V556_V413M.LOG.cpuFrames, helpers: V556_V413M.LOG.helpers, closeouts: V556_V413M.LOG.closeouts, errs: V556_V413M.LOG.errs.length } : null,
   v431dh: g('V556_DH431') ? (V556_DH431.stats ? V556_DH431.stats() : V556_DH431.ST || V556_DH431) : null,
   v434at: g('V556_AT434') && V556_AT434.stats ? V556_AT434.stats() : null,
   v487dg2: g('V556_V487DG2') ? V556_V487DG2.LOG : null,
   v495: g('V556_V495') ? { calls: V556_V495.calls, kept: V556_V495.kept, errs: V556_V495.errs } : null,
   v416p: g('V556_V416P') ? V556_V416P.ST : null }; } };
})();
