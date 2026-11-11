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
 if (W0.__rl_v431dh_loaded) return;
 W0.__rl_v431dh_loaded = true;
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const WHY = {}; const why = k => { WHY[k] = (WHY[k] || 0) + 1; };
 const ST = { cFrames: 0, cHelp: 0, cNoMark: 0, uFrames: 0, uHelp: 0, uNoMark: 0, picks: 0, err: 0 };
 const er = e => { ST.err++; try { if (ST.err < 6) console.error(e); } catch (x) {} };
 const off = G => !!W0.__rl_no431dh || !!W0.__rl_v124gb || !G || !!G.tutorial || !!G.online || !!(G.meta && G.meta.online) || !!G.brave || !!G.practice || !!G.over || G.farMode === 'fo' || !G.players || !G.ball;
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
   if (d === G.slide || (G.rot && G.rot.d === d) || d === G.p5d || d === G.ctrl) { why('c_slide'); continue; }
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
 W0.DH431 = { on: () => !W0.__rl_no431dh, stats: () => Object.assign({}, ST, { why: Object.assign({}, WHY) }) };
})();
