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
 if (W0.__rl_v434at_loaded) return;
 W0.__rl_v434at_loaded = true;
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const ST = { uFrames: 0, uCtl: 0, cFrames: 0, cCtl: 0, flash: 0, vcut: 0, back: 0, fb: 0, rel: 0, err: 0, phases: 0 };
 const er = e => { ST.err++; try { console.error(e); } catch (x) {} };
 const off = G => !!W0.__rl_no434at || !!W0.__rl_v124gb || !G || !!G.tutorial || !!G.online || !!G.brave || !!G.over || G.farMode === 'fo' || !G.players || !G.ball;
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
 W0.AT434 = { on: () => !W0.__rl_no434at, stats: () => Object.assign({}, ST), U, C };
})();
