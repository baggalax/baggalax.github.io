/* v420c.js - V42.0c CLEARS + RIDES that really run (kill switch: window.__rl_no420c = true -> exactly like before;
   CPU part only: window.__rl_no420cc = true).
   Charlie (Nov 3): clears get made like plays (hold a guy + move him, ADD BALL), and "in a break when the goalie gets it
   they break out how you made them"; rides stay a set + ZONE / MAN; "if I'm in a spot they go to the open spot and I can
   bump them"; only when picked in the playbook (nothing picked = the base clear / ride); CPU teams get their own
   made-up real clears and rides.
   (1) PLAYMAKER CLEAR = the play editor (drag to spots, hold a guy + move him for his run, ADD BALL on who starts
       with it, SAVE any time). Uses one small switch in v42pd.js (window.V420C.pm()). Old shape clears load as is.
   (2) Your picked CLEAR, in games: right after a save / wide shot / turnover your guys run (sprint pace, no reset,
       no teleport) to the spots you drew, then run the routes you drew stage by stage. The guy with the ball owns
       the spot nearest him; your controlled guy standing in a spot owns it and its guy takes the open spot; run
       into a teammate's spot and he bumps over (same as the man-up set). No SET / RUN taps. Ball never auto-passed.
   (3) Your picked RIDE: your guys first run to the spots you drew, then ride MAN (each takes a clearer) or ZONE
       (hold your area, take whoever comes in, two guys trap the ball). Same spot claim / bump with your guy.
       Old rides with no type = ZONE (what they already did: hold the drawn spot, shifted to the ball).
   (4) CPU teams: each team has its own 2 clears + 2 rides (seeded by team, fit to its D style), with late-game
       calls (behind late -> 10-MAN / MAN, up 2+ late -> LAY OFF). Players run to their spots live.
   Offline only: online, tutorial, BRAVEHEART unchanged. */
(function () {
 'use strict';
 if (window.__rl_v420c_loaded) return;
 window.__rl_v420c_loaded = 1;
 const off = () => !!window.__rl_no420c || !!window.__rl_v124gb;
 const offC = () => off() || !!window.__rl_no420cc;
 const LOG = { errs: [], cpuClears: [], cpuRides: [], bumps: 0, claims: 0, stages: 0, uRideArr: 0, ovr: 0, picks: {} };
 const V = window.V420C = { on: false, LOG: LOG, pm: () => !off() && typeof game !== 'undefined' };
 V.pm = () => !off();
 if (off()) return;
 const need = [ 'clrTick', 'clrSet', 'moveTo', 'farTick', 'step', 'rideXTick', 'myTen', 'f10Spot' ];
 if (need.some(n => typeof window[n] !== 'function')) { LOG.errs.push('missing ' + need.filter(n => typeof window[n] !== 'function').join(',')); return; }
 V.on = true;
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const hyp = Math.hypot;
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.errs.length < 6) console.error(e); } catch (x) {} };
 const okG = G => !!G && !G.tutorial && !G.online && !(G.meta && G.meta.online) && !G.brave && !window.__rl_v124gb;
 const wrapG = (n, f) => { const o = window[n]; if (typeof o !== 'function') return false; window[n] = function () { return f.call(this, o, arguments); }; return true; };
 const CL = (v, a, b) => Math.max(a, Math.min(b, v));
 const alive = p => p && !(p.down > 0);
 const CLAIM_R = 28, HYS = 10;

 /* ---------------- frame-scoped movement override (CPU sets) + speed floor (your break) ---------------- */
 const FR = { n: 0 };
 const OVR = new Map(), SPD = new Map();
 const setO = (p, x, y, s) => { OVR.set(p, [ x, CL(y, FT + 12, FB - 4), s, FR.n ]); };
 const setS = (p, s) => { SPD.set(p, [ s, FR.n ]); };
 wrapG('moveTo', function (o, a) {
  const p = a[0];
  if (p && (OVR.size || SPD.size)) {
   const q = OVR.get(p);
   if (q && q[3] >= FR.n - 1) { a = [ p, q[0], q[1], q[2], a[4] ]; LOG.ovr++; }
   else { const s = SPD.get(p); if (s && s[1] >= FR.n - 1 && s[0] > a[3]) a = [ p, a[1], a[2], s[0], a[4] ]; }
  }
  return o.apply(this, a);
 });
 wrapG('farTick', function (o, a) {
  const G = G_(), dt = a[0];
  let pre = null;
  if (OVR.size && G && G.farU && G.farC && dt > 0) {
   for (const f of G.farU.concat(G.farC)) { const q = OVR.get(f); if (q && q[3] >= FR.n - 1) (pre = pre || new Map()).set(f, [ f.x, f.y ]); }
  }
  const r = o.apply(this, a);
  if (pre) for (const [f, p0] of pre) {
   const q = OVR.get(f), dx = q[0] - p0[0], dy = q[1] - p0[1], d = hyp(dx, dy), s = Math.min(d, q[2] * dt);
   f.x = d > .3 ? p0[0] + dx / d * s : p0[0];
   f.y = d > .3 ? p0[1] + dy / d * s : p0[1];
   f.anim = (f.anim || 0) + s;
  }
  return r;
 });

 /* ---------------- shared: spot assignment ---------------- */
 // pl: list of {o, role}; sp: [[x,y]...]; free: spot indices; legal(i, role) -> bool. Role slots first (F10 order), then nearest.
 const SLOT_ROLE = i => i === 0 ? 'G' : i <= 3 ? 'D' : i <= 6 ? 'M' : 'A';
 const ROLE_PEN = 70; // a guy out of his drawn position is OK when he is 70+ px closer (quicker break)
 function assign(list, sp, free, legal, must) {
  const out = new Map(), used = new Set();
  const cost = (it, i) => hyp(sp[i][0] - it.o.x, sp[i][1] - it.o.y) + (SLOT_ROLE(i) === it.role ? 0 : it.role === 'G' || SLOT_ROLE(i) === 'G' ? 900 : ROLE_PEN) + (legal(i, it.role) ? 0 : 1000);
  const pairs = [];
  for (const it of list) for (const i of free) if (sp[i]) pairs.push([ cost(it, i), it, i ]);
  pairs.sort((a, b) => a[0] - b[0]);
  for (const [, it, i] of pairs) { if (out.has(it.o) || used.has(i)) continue; out.set(it.o, i); used.add(i); }
  // 2-swap improvement (distance only among legal options)
  const L = list.filter(it => out.has(it.o));
  for (let pass = 0; pass < 2; pass++) for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
   const A = L[a], B = L[b], ia = out.get(A.o), ib = out.get(B.o);
   if (cost(A, ib) + cost(B, ia) + .5 < cost(A, ia) + cost(B, ib)) { out.set(A.o, ib); out.set(B.o, ia); }
  }
  // the drawn ball spot should not be the one left empty
  if (must != null && must >= 0 && free.includes(must) && ![ ...out.values() ].includes(must)) {
   let best = null, bd = 1e9;
   for (const it of L) { const d = hyp(sp[must][0] - it.o.x, sp[must][1] - it.o.y); if (d < bd && legal(must, it.role)) { bd = d; best = it; } }
   if (best) out.set(best.o, must);
  }
  return out;
 }

 /* ---- V40.1.4 spot rule (Charlie, Nov 3): CLEARS / RIDES / D = matched by POSITION GROUP, never across groups.
    The closest middie takes the closest middie spot, closest attackman the closest attack spot, D to D spots, LSM to the
    LSM spot, goalie stays goalie. A spot's group = the player the playmaker drew it for (CLEAR: G, D D D, M, LSM, M, A A A;
    RIDES: G, D D D, M M M, A A A; D: M, LSM, M, D D D, G). Extras (e.g. after a sub) take the nearest leftover spots.
    Same helper in v420c.js and v424rs.js. OFFENSE / MAN-UP / END LINE keep closest open spot (not touched here). ---- */
 const SPOT_GRP = (cat, i) => cat === 'D' ? (i === 6 ? 'G' : i === 1 ? 'L' : i <= 2 ? 'M' : 'D') : i === 0 ? 'G' : i <= 3 ? 'D' : i <= 6 ? (cat === 'CLEAR' && i === (window.__rl_no427pm ? 5 : 6) ? 'L' : 'M') : 'A'; // V42.7: clears = G, D D D, M M LSM, A A A
 const PL_GRP = (o, role) => { const pos = o && o.pl && o.pl.pos; if (role === 'G' || (o && o.gk)) return 'G'; if (pos === 'LSM') return 'L'; return role === 'A' ? 'A' : role === 'D' ? 'D' : 'M'; };
 // list: [{o, role}], sp: spots, free: spot indices -> Map(o -> spot index)
 function grpAssign(list, sp, free, cat) {
  const out = new Map(), used = new Set(), d = (o, i) => Math.hypot(sp[i][0] - o.x, sp[i][1] - o.y);
  const match = (objs, cands) => { // min total distance (exhaustive up to 6), else greedy
   objs = objs.filter(it => !out.has(it.o)); cands = cands.filter(i => sp[i] && !used.has(i));
   if (!objs.length || !cands.length) return;
   if (objs.length <= 6 && cands.length <= 7) {
    let best = null, bs = 1e9; const perm = [], u = new Set(), k = Math.min(objs.length, cands.length);
    // when there are more players than spots, the ones nearest any spot get them: try every subset via the permutation
    const go = (n, acc, taken) => {
     if (acc >= bs) return;
     if (taken === k || n === objs.length) { if (taken === k) { bs = acc; best = perm.slice(0, n).concat(Array(objs.length - n).fill(-1)); } return; }
     if (objs.length - n > k - taken) { perm[n] = -1; go(n + 1, acc, taken); }
     for (const j of cands) { if (u.has(j)) continue; u.add(j); perm[n] = j; go(n + 1, acc + d(objs[n].o, j), taken + 1); u.delete(j); }
    };
    go(0, 0, 0);
    if (best) objs.forEach((it, n) => { if (best[n] != null && best[n] >= 0) { out.set(it.o, best[n]); used.add(best[n]); } });
    return;
   }
   const pairs = [];
   for (const it of objs) for (const i of cands) pairs.push([ d(it.o, i), it, i ]);
   pairs.sort((a, b) => a[0] - b[0]);
   for (const [, it, i] of pairs) { if (out.has(it.o) || used.has(i)) continue; out.set(it.o, i); used.add(i); }
  };
  const g = it => it.g || (it.g = PL_GRP(it.o, it.role));
  for (const k of [ 'G', 'D', 'L', 'M', 'A' ]) match(list.filter(it => g(it) === k), free.filter(i => SPOT_GRP(cat, i) === k));
  match(list.filter(it => g(it) === 'L'), free.filter(i => SPOT_GRP(cat, i) === 'M')); // no LSM spot left: the pole is a middie
  match(list.filter(it => g(it) !== 'G'), free.filter(i => SPOT_GRP(cat, i) !== 'G')); // extras: nearest leftover spot
  match(list, free);
  return out;
 }
 // a player may only claim spots of his own group (an LSM may also claim a middie spot when the play has no free LSM spot)
 function grpSkip(cat, sp, o, role, skip) {
  const s = new Set(skip || []), pg = PL_GRP(o, role);
  const has = k => sp.some((q, i) => q && SPOT_GRP(cat, i) === k);
  sp.forEach((q, i) => { const sg = SPOT_GRP(cat, i); if (!(sg === pg || (pg === 'L' && sg === 'M' && !has('L')))) s.add(i); });
  return s;
 }
 function nearestIdx(p, sp, skip, maxD) {
  let j = -1, bd = maxD == null ? 1e9 : maxD;
  sp.forEach((q, i) => { if (!q || (skip && skip.has(i))) return; const d = hyp(p.x - q[0], p.y - q[1]); if (d < bd) { bd = d; j = i; } });
  return j;
 }
 // claim with hysteresis: keep the old spot unless a new one is clearly nearer
 function claimIdx(p, sp, prev, skip, maxD) {
  const j = nearestIdx(p, sp, skip, maxD);
  if (prev == null || prev < 0 || !sp[prev] || (skip && skip.has(prev))) return j;
  const dp = hyp(p.x - sp[prev][0], p.y - sp[prev][1]);
  if (maxD != null && dp > maxD + HYS) return j;
  if (j < 0 || j === prev) return prev;
  return hyp(p.x - sp[j][0], p.y - sp[j][1]) + HYS < dp ? j : prev;
 }

 /* ================= (2) YOUR CLEAR ================= */
 const steering = G => !!(G.run && (Math.abs(G.run.x || 0) + Math.abs(G.run.y || 0)) > .05);
 function ctrlOf(G) {
  const s = scr();
  const c = s === 'defense' ? G.dctl : G.ctrl;
  return c && (c.team === 'O' || c.team === 'G2') ? c : null;
 }
 function plRoutes(pl) { // per spot: [{x,y,pg}]
  const r = pl.start.map(() => []);
  for (const s of pl.steps || []) if ((s.t === 'move' || s.t === 'pick') && r[s.p] && typeof s.x === 'number') r[s.p].push({ x: s.x, y: s.y, pg: s.pg || 1 });
  return r;
 }
 function slotObj(G, sl) { return typeof clrFind === 'function' ? clrFind(sl) : sl.o; }
 function setSlot(S, sl, i) {
  if (sl.i === i && sl.spot) return false;
  sl.i = i;
  sl.spot = f10Spot(S.pl.start[i], sl.role);
  sl.full420 = (S.r420[i] || []);
  sl.route = sl.full420.filter(q => q.pg <= (S.stg420 || 1)).map(q => f10Spot([ q.x, q.y ], sl.role));
  sl.ri = 0; sl.rt = 0;
  return true;
 }
 function clrAssign(G, S, first) {
  const pl = S.pl, sp = pl.start;
  if (!S.r420) S.r420 = plRoutes(pl);
  const h = typeof clrHolder === 'function' ? clrHolder() : null, c0 = ctrlOf(G);
  const objs = S.slots.map(sl => ({ sl: sl, o: slotObj(G, sl) })).filter(x => x.o);
  const inSet = o => objs.some(x => x.o === o);
  const C = S.c420 || (S.c420 = { h: null, hs: -1, c: null, cs: -1 });
  // spot 0 is the goalie's (he goes back to his cage spot unless he has the ball)
  const gk = objs.find(x => x.sl.role === 'G');
  const claimed = new Set([ 0 ]);
  let hs = -1, cs = -1;
  if (h && inSet(h)) {
   if (gk && gk.o === h) hs = 0; else { const hx = objs.find(x => x.o === h); hs = claimIdx(h, sp, C.h === h ? C.hs : -1, grpSkip('CLEAR', sp, h, hx && hx.sl.role, claimed), null); if (hs >= 0) claimed.add(hs); }
  }
  const c = c0 && c0 !== h && inSet(c0) && !c0.far && !(c0.down > 0) && !(gk && gk.o === c0) ? c0 : null;
  if (c) { const cx = objs.find(x => x.o === c); cs = claimIdx(c, sp, C.c === c ? C.cs : -1, grpSkip('CLEAR', sp, c, cx && cx.sl.role, claimed), CLAIM_R); if (cs >= 0) claimed.add(cs); }
  const legal = (i, role) => { const q = f10Spot(sp[i], role); return hyp(q[0] - sp[i][0], q[1] - sp[i][1]) < 4; };
  const must = pl.car != null && pl.car > 0 && sp[pl.car] ? pl.car : -1;
  let changed = 0;
  const claimers = new Map();
  if (gk) claimers.set(gk.o, 0);
  if (hs > 0) claimers.set(h, hs);
  if (cs > 0) claimers.set(c, cs);
  if (first || !C.init) {
   const rest = objs.filter(x => !claimers.has(x.o)).map(x => ({ o: x.o, role: x.sl.role, sl: x.sl }));
   const free = sp.map((q, i) => i).filter(i => !claimed.has(i));
   const m = grpAssign(rest, sp, free, 'CLEAR');
   for (const it of rest) { const i = m.get(it.o); if (i != null) changed += setSlot(S, it.sl, i); }
   C.init = 1;
  } else {
   // bump: a teammate standing on a spot you now own takes the open spot (nearest free one)
   const taken = new Set(claimed);
   for (const x of objs) if (!claimers.has(x.o) && x.sl.i != null && !claimed.has(x.sl.i)) taken.add(x.sl.i);
   const seen = new Set();
   for (const x of objs) {
    if (claimers.has(x.o)) continue;
    const dup = x.sl.i != null && seen.has(x.sl.i);
    if (x.sl.i != null) seen.add(x.sl.i);
    if (x.sl.i == null || claimed.has(x.sl.i) || dup) {
     const free = sp.map((q, i) => i).filter(i => !taken.has(i));
     const m = grpAssign([ { o: x.o, role: x.sl.role } ], sp, free, 'CLEAR');
     const i = m.get(x.o);
     if (i != null) {
      if (x.sl.i != null && claimed.has(x.sl.i)) { LOG.bumps++; G.bump420 = (G.bump420 || 0) + 1; (G.bumps420 = G.bumps420 || []).push({ who: x.o.pl && x.o.pl.id, from: x.sl.i, to: i, by: claimers.get(c) === x.sl.i ? 'you' : 'ball', t: +(S.t || 0).toFixed(2) }); }
      changed += setSlot(S, x.sl, i); taken.add(i); seen.add(i);
     }
    }
   }
  }
  for (const [o, i] of claimers) { const x = objs.find(y => y.o === o); if (x && x.sl.i !== i) { if (o === (gk && gk.o)) setSlot(S, x.sl, i); else { x.sl.i = i; x.sl.spot = f10Spot(sp[i], x.sl.role); x.sl.route = []; x.sl.full420 = []; } } }
  if (cs > 0 && (C.c !== c || C.cs !== cs)) { LOG.claims++; G.claim420 = (G.claim420 || 0) + 1; }
  C.h = h; C.hs = hs; C.c = c; C.cs = cs;
  return changed;
 }
 wrapG('clrSet', function (o, a) {
  const r = o.apply(this, a);
  try { const G = G_(); if (r && okG(G) && G.cset) { G.cset.stg420 = 1; G.cset.stT420 = 0; clrAssign(G, G.cset, true); } } catch (e) { err(e, 'clrSet'); }
  return r;
 });
 wrapG('clrTick', function (o, a) {
  const G = G_(), dt = a[0] || 0, S = G && G.cset;
  if (S && okG(G) && S.slots && S.pl) {
   try {
    clrAssign(G, S, false);
        if (S.phase === 'set' && S.t > 1 && S.t < 3.5) {
     // break as soon as everyone is in his spot (the base waits a flat 3.5 s)
     const hh = typeof clrHolder === 'function' ? clrHolder() : null;
     let ok = true;
     for (const sl of S.slots) { const ob = slotObj(G, sl); if (!ob || ob === hh || !sl.spot || ob.down > 0) continue; if (hyp(ob.x - sl.spot[0], ob.y - sl.spot[1]) > 14) { ok = false; break; } }
     if (ok) S.t = 3.51;
    }
    // routes stage by stage: stage k starts when every stage k-1 run is done (or after 3 s)
    if (S.phase === 'run') {
     S.stT420 = (S.stT420 || 0) + dt;
     const h = typeof clrHolder === 'function' ? clrHolder() : null, c = ctrlOf(G);
     const maxPg = Math.max(1, ...S.slots.map(sl => (sl.full420 || []).reduce((m, q) => Math.max(m, q.pg), 1)));
     const act = S.slots.filter(sl => { const ob = slotObj(G, sl); return ob && ob !== h && ob !== c && alive(ob); });
     const done = act.every(sl => (sl.ri || 0) >= (sl.route || []).length);
     if ((S.stg420 || 1) < maxPg && (done || S.stT420 > 3)) {
      S.stg420 = (S.stg420 || 1) + 1; S.stT420 = 0; LOG.stages++;
      for (const sl of S.slots) { const ob = slotObj(G, sl); if (!ob || !sl.full420) continue; sl.route = sl.full420.filter(q => q.pg <= S.stg420).map(q => f10Spot([ q.x, q.y ], sl.role)); }
     }
    }
   } catch (e) { err(e, 'clrTick'); }
  }
  const r = o.apply(this, a);
  try {
   const S2 = G && G.cset;
   if (S2 && okG(G)) {
    const c = ctrlOf(G), h = typeof clrHolder === 'function' ? clrHolder() : null;
    if (c && c !== h && steering(G)) {
     if (G.ball && G.ball.state === 'clear' && !c.far) {
      // the goalie still has it: the base loop only runs clearTo for everyone - let the stick steer your guy (walk into a spot = claim it)
      if (!c.clearTo) c.clearTo = [ c.x, c.y ];
      const mag = typeof runMag === 'function' ? runMag() : 1, cs = (typeof DZ === 'object' && DZ.ctrlSpd) || 1.15;
      setO(c, c.x + G.run.x * 30, c.y + G.run.y * 30, PACE.dBall * cs * mag);
     } else { c.clearTo = null; if (!c.far) { c.playT = null; c.playHold = null; } }
    }
   }
  } catch (e) { err(e, 'clrTick2'); }
  return r;
 });
 function userClearSpeed(G) {
  const S = G.cset;
  if (!S || !S.slots) return;
  const h = typeof clrHolder === 'function' ? clrHolder() : null, c = ctrlOf(G), sp = PACE.cut * (S.phase === 'run' ? 1.3 : 1.45);
  for (const sl of S.slots) { const o = slotObj(G, sl); if (o && o !== h && !(o === c && steering(G)) && !o.far) setS(o, sp); }
 }

 /* ================= (3) YOUR RIDE ================= */
 wrapG('rideXTick', function (o, a) {
  const G = G_();
  let pl = null;
  try {
   pl = okG(G) && typeof rideCustom === 'function' ? rideCustom() : null;
   if (pl && !pl.dk) pl.dk = 'zone'; // old ride: what it already did = hold the drawn spot
   if (pl && G.rideXA && G.rideXA.pl === pl.id && G.rideXA.map) rideClaim(G, pl);
  } catch (e) { err(e, 'rideX0'); }
  const m = o.apply(this, a);
  try { if (m && pl && okG(G)) rideArrive(G, pl, m); } catch (e) { err(e, 'rideX1'); }
  return m;
 });
 function rideClaim(G, pl) {
  const c = G.dctl, M = G.rideXA.map, sp = pl.start;
  if (!c || !M.has(c) || c.down > 0) return;
  const R = G.rideXA;
  const cur = M.get(c);
  const ct = myTen().find(t => t.o === c), cr = ct && ct.role;
  const j = claimIdx(c, sp, R.cl420 === c ? R.cs420 : -1, grpSkip('RIDES', sp, c, cr, null), CLAIM_R);
  if (j < 0 || j === cur) { R.cl420 = c; R.cs420 = j; return; }
  // the bumped guy takes your old spot, so only when that spot is his group too (never across groups)
  if (cur == null || SPOT_GRP('RIDES', cur) !== SPOT_GRP('RIDES', j)) return;
  // someone else holds j: he takes your old spot (the open one)
  for (const [p, i] of M) if (p !== c && i === j) { M.set(p, cur); LOG.bumps++; G.bump420 = (G.bump420 || 0) + 1; (G.bumps420 = G.bumps420 || []).push({ ride: 1, who: p.pl && p.pl.id, from: j, to: cur }); }
  M.set(c, j);
  R.cl420 = c; R.cs420 = j; LOG.claims++;
 }
 function rideArrive(G, pl, m) {
  const A = G.rideArr420 && G.rideArr420.sig === G.rideXA.sig && G.rideArr420.pl === pl.id ? G.rideArr420 : (G.rideArr420 = { sig: G.rideXA.sig, pl: pl.id, arr: new Set(), t0: G.t || 0 });
  A.t = (G.t || 0) - A.t0;
  const b = G.ball, c = G.dcar || (b && b.state === 'pass' ? b.to : null);
  const ten = myTen(), zone = pl.dk === 'zone';
  const area = t => { const i = G.rideXA.map.get(t.o); if (i == null || !pl.start[i]) return null; const q = pl.start[i]; return f10Spot([ q[0] + (b.x - q[0]) * .18, q[1] + (b.y - q[1]) * .22 ], t.role); };
  // ZONE: the rider whose area the ball is in plays it, the next one traps; everyone else holds his area
  let z1 = null, z2 = null;
  if (zone && c) {
   const zs = ten.filter(t => t.role !== 'G' && m.has(t.o)).map(t => ({ t: t, a: area(t) })).filter(x => x.a).map(x => ({ o: x.t.o, d: hyp(x.a[0] - c.x, x.a[1] - c.y) })).sort((x, y) => x.d - y.d);
   if (zs[0] && zs[0].d < 70) z1 = zs[0].o;
   if (z1 && zs[1] && zs[1].d < 95) z2 = zs[1].o;
  }
  for (const t of ten) {
   const p = t.o, i = G.rideXA.map.get(p);
   if (i == null || !pl.start[i] || p === G.dctl || !m.has(p)) continue;
   if (t.role === 'G') continue; // goalie stays with the base logic
   if (!A.arr.has(p)) {
    const s = f10Spot(pl.start[i], t.role), d = hyp(p.x - s[0], p.y - s[1]);
    const nearBall = c && hyp(p.x - c.x, p.y - c.y) < 22;
    if (d < 12 || A.t > 4.5 || nearBall) { A.arr.add(p); LOG.uRideArr++; }
    else { m.set(p, s); setO(p, s[0], s[1], p.far ? 46 : PACE.chase * 1.2); continue; }
   }
   if (!zone) continue; // MAN: v404d picks up + pressures a clearer
   const a = area(t);
   if (!a) continue;
   if (p === z1 && c) { m.set(p, f10Spot([ c.x - 7, c.y + (CY - c.y) * .1 ], t.role)); continue; }
   if (p === z2 && c) { m.set(p, f10Spot([ c.x - 5, c.y + (c.y < CY ? 8 : -8) ], t.role)); continue; }
   const q = m.get(p);
   if (q && hyp(q[0] - a[0], q[1] - a[1]) > 4) m.set(p, f10Spot([ a[0] + (q[0] - a[0]) * .4, a[1] + (q[1] - a[1]) * .4 ], t.role)); // shade toward the guy in my area, stay home
   else m.set(p, a);
  }
 }

 /* ================= (4) CPU CLEARS + RIDES ================= */
 // spots in YOUR orientation (your cage left): 0 G, 1-3 D, 4-6 M, 7-9 A. The CPU's are mirrored.
 const CLEARS = {
  'WIDE BREAK': { d: 'GOALIE OUTLET, D BREAK WIDE TO THE SIDELINES', s: [ [ DGX + 8, CY ], [ DGX + 42, FT + 14 ], [ DGX + 42, FB - 6 ], [ DGX + 78, CY + 4 ], [ MIDX - 58, FT + 22 ], [ MIDX - 26, CY ], [ MIDX - 58, FB - 12 ], [ MIDX + 56, FT + 26 ], [ MIDX + 92, CY ], [ MIDX + 56, FB - 16 ] ] },
  '4 ACROSS': { d: 'FOUR GUYS IN A LINE ACROSS THE FIELD, ONE D STAYS HOME', s: [ [ DGX + 8, CY ], [ DGX + 96, FT + 16 ], [ DGX + 96, FB - 6 ], [ DGX + 34, CY + 34 ], [ DGX + 96, CY - 24 ], [ MIDX - 14, CY ], [ DGX + 96, CY + 26 ], [ MIDX + 50, FT + 22 ], [ MIDX + 80, CY ], [ MIDX + 50, FB - 12 ] ] },
  'BANANA': { d: 'A CURVE UP ONE SIDELINE - D, D, MIDDIE, MIDDIE - BALL GOES UP THE BANANA', s: [ [ DGX + 8, CY ], [ DGX + 22, FT + 24 ], [ DGX + 54, FT + 14 ], [ DGX + 46, FB - 8 ], [ DGX + 94, FT + 14 ], [ MIDX - 44, FT + 20 ], [ MIDX - 30, FB - 14 ], [ MIDX + 52, FT + 22 ], [ MIDX + 86, CY - 4 ], [ MIDX + 56, FB - 14 ] ] },
  'MIDDIE POP-UP': { d: 'A MIDDIE DROPS BACK TO THE TOP OF THE BOX FOR THE SHORT OUTLET, THE REST CLEAR OUT', s: [ [ DGX + 8, CY ], [ DGX + 34, FT + 16 ], [ DGX + 34, FB - 6 ], [ DGX + 104, CY + 30 ], [ DGX + 72, CY - 8 ], [ MIDX - 18, FT + 16 ], [ MIDX - 18, FB - 6 ], [ MIDX + 54, FT + 24 ], [ MIDX + 90, CY ], [ MIDX + 54, FB - 14 ] ] },
  'POLE CARRY': { d: 'A POLE BREAKS UP THE MIDDLE, MIDDIES SPREAD WIDE AT MIDFIELD', s: [ [ DGX + 8, CY ], [ DGX + 40, FT + 18 ], [ DGX + 40, FB - 8 ], [ DGX + 88, CY ], [ MIDX - 40, FT + 14 ], [ MIDX + 10, CY - 30 ], [ MIDX - 40, FB - 4 ], [ MIDX + 56, FT + 26 ], [ MIDX + 92, CY + 6 ], [ MIDX + 56, FB - 16 ] ] }
 };
 // rides in GAME coords (you clear left -> right; CPU riders: A in your end, D in theirs)
 const RIDES = {
  '3-3 ZONE': { k: 'zone', d: 'THREE ATTACK ACROSS, THREE MIDDIES ACROSS, HOLD AREAS + TRAP THE BALL', s: [ [ GX - 5, CY ], [ MIDX + 46, FT + 28 ], [ MIDX + 36, CY ], [ MIDX + 46, FB - 18 ], [ MIDX - 44, FT + 18 ], [ MIDX - 44, CY ], [ MIDX - 44, FB - 8 ], [ DGX + 74, FT + 24 ], [ DGX + 84, CY ], [ DGX + 74, FB - 14 ] ] },
  'MAN RIDE': { k: 'man', d: 'EVERYONE PICKS UP A MAN, ATTACK PRESSURES YOUR D', s: [ [ GX - 5, CY ], [ MIDX + 40, FT + 30 ], [ MIDX + 30, CY ], [ MIDX + 40, FB - 20 ], [ MIDX - 30, FT + 20 ], [ MIDX - 30, CY ], [ MIDX - 30, FB - 10 ], [ DGX + 56, FT + 22 ], [ DGX + 66, CY ], [ DGX + 56, FB - 12 ] ] },
  'SHUT OFF THE OUTLET': { k: 'deny', d: 'ATTACK FACE-GUARDS THE CLOSEST OUTLET, MIDDIES SIT IN THE MIDDLE', s: [ [ GX - 5, CY ], [ MIDX + 40, FT + 30 ], [ MIDX + 30, CY ], [ MIDX + 40, FB - 20 ], [ MIDX - 52, FT + 30 ], [ MIDX - 40, CY ], [ MIDX - 52, FB - 20 ], [ DGX + 46, FT + 20 ], [ DGX + 70, CY ], [ DGX + 46, FB - 10 ] ] },
  'LAY OFF': { k: 'layoff', d: 'NO PRESSURE - EVERYONE DROPS TO MIDFIELD, PROTECT THE LEAD', s: [ [ GX - 5, CY ], [ MIDX + 52, FT + 30 ], [ MIDX + 40, CY ], [ MIDX + 52, FB - 20 ], [ MIDX - 24, FT + 22 ], [ MIDX - 20, CY ], [ MIDX - 24, FB - 12 ], [ MIDX - 70, FT + 30 ], [ MIDX - 62, CY ], [ MIDX - 70, FB - 20 ] ] },
  '10-MAN RIDE': { k: 'ten', d: 'THE GOALIE COMES OUT TOO', s: null }
 };
 V.CLEARS = CLEARS; V.RIDES = RIDES;
 function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
 function teamKey(id) { try { const t = typeof T === 'function' ? T(id) : null; return String(t && (t.id != null ? t.id : t.name) || id); } catch (e) { return String(id); } }
 function cpuStyle(G) {
  try { if (window.V410D && typeof V410D.ident === 'function') return V410D.ident(G.opp).d; } catch (e) {}
  return 'man';
 }
 function teamBook(G) {
  if (G.book420 && G.book420.opp === G.opp) return G.book420;
  const k = teamKey(G.opp), h = hash('CR420|' + k), st = cpuStyle(G), CN = Object.keys(CLEARS);
  const c1 = CN[h % CN.length];
  let c2 = CN[(h >>> 5) % CN.length];
  if (c2 === c1) c2 = CN[(CN.indexOf(c1) + 1 + ((h >>> 9) % (CN.length - 1))) % CN.length];
  let r1, r2, ten;
  if (st === 'black') { r1 = h & 64 ? 'SHUT OFF THE OUTLET' : 'MAN RIDE'; r2 = r1 === 'MAN RIDE' ? 'SHUT OFF THE OUTLET' : 'MAN RIDE'; ten = true; }
  else if (st === 'zone') { r1 = '3-3 ZONE'; r2 = h & 64 ? 'LAY OFF' : 'MAN RIDE'; ten = (h >>> 12) % 3 === 0; }
  else { r1 = h & 64 ? 'MAN RIDE' : '3-3 ZONE'; r2 = (h >>> 12) % 3 === 0 ? 'SHUT OFF THE OUTLET' : r1 === 'MAN RIDE' ? '3-3 ZONE' : 'MAN RIDE'; ten = (h >>> 14) % 2 === 0; }
  G.book420 = { opp: G.opp, key: k, style: st, clears: [ c1, c2 ], rides: [ r1, r2 ], ten: ten };
  LOG.picks[k] = G.book420;
  return G.book420;
 }
 V.bookFor = id => { const G = { opp: id }; return teamBook(G); };
 function late(G) { return (G.q || 1) >= 4 && !G.ot && (G.clock || 0) < 150 || !!G.ot; }
 function pickClear(G, n) { const B = teamBook(G); return B.clears[hash(B.key + '|c|' + n) % 100 < 65 ? 0 : 1]; }
 function pickRide(G, n) {
  const B = teamBook(G), me = G.score ? G.score[1] : 0, you = G.score ? G.score[0] : 0;
  if (late(G) && me < you) return B.ten ? '10-MAN RIDE' : 'MAN RIDE';
  if (late(G) && me >= you + 2) return 'LAY OFF';
  return B.rides[hash(B.key + '|r|' + n) % 100 < 65 ? 0 : 1];
 }
 const roleOf = p => p.far ? (p.role === 'R' ? 'A' : p.role || 'M') : (p.team === 'G' || p.gk ? 'G' : (typeof rrOf === 'function' ? rrOf(p) : 'M'));
 const cpuLegalX = (role, x) => role === 'A' ? Math.min(x, MIDX - 6) : role === 'D' || role === 'G' ? Math.max(x, MIDX + 6) : x;
 function cpuCtx(G) {
  const s = scr(), b = G.ball;
  if (!b) return null;
  if (s === 'defense' && G.cpuClear && (b.state === 'held' || b.state === 'pass') && b.x > MIDX - 6) return 'clear';
  if (s === 'live' && G.clearing && (b.state === 'held' || b.state === 'pass') && b.x < MIDX + 6) return 'ride';
  if (s === 'defense' && !G.cpuClear && (G.dclear && b.state === 'clear' || b.state === 'pass' && b.clear)) return 'ride';
  return null;
 }
 function cpuTeam(G, s) {
  const on = G.players.filter(p => s === 'defense' ? (p.team === 'D' || p.team === 'G') : (p.team === 'D' || p.team === 'G'));
  return on.concat(G.farC || []);
 }
 function userTeam(G) { return G.players.filter(p => p.team === 'O' || p.team === 'G2').concat(G.farU || []); }
 // --- CPU clear ---
 function cpuClearTick(G) {
  const b = G.ball, key = 'c' + (G.n420 || 0);
  let C = G.cc420;
  if (!C || C.key !== key) {
   const name = pickClear(G, G.n420 || 0);
   C = G.cc420 = { key: key, name: name, map: null, t: 0, arr: new Set() };
   LOG.cpuClears.push({ team: teamBook(G).key, name: name, n: G.cpuClears || 0 });
   const h = G.dcar || G.players.find(p => p.team === 'G');
   if (h) addFx('txt', h.x, h.y - 30, { s: name, col: '#ffb0a0', life: 1.4 });
  }
  C.t += 1 / 60;
  const spots = CLEARS[C.name].s.map(q => [ 2 * MIDX - q[0], q[1] ]);
  const team = cpuTeam(G, 'defense').filter(alive);
  const h = b.state === 'held' ? G.dcar : null, rcv = b.state === 'pass' ? b.to : null;
  const list = team.map(p => ({ o: p, role: roleOf(p) }));
  const legal = (i, role) => Math.abs(cpuLegalX(role, spots[i][0]) - spots[i][0]) < 3;
  const sig = team.length + ':' + (G.farC || []).length;
  // the guy with the ball owns the spot nearest him; the rest take the other spots
  const hs = h ? claimIdx(h, spots, C.h === h ? C.hs : -1, null, null) : -1;
  if (!C.map || C.sig !== sig || C.h !== h && hs >= 0 && [ ...C.map.entries() ].some(([p, i]) => i === hs && p !== h)) {
   const free = spots.map((q, i) => i).filter(i => i !== hs);
   C.map = assign(list.filter(it => it.o !== h), spots, free, legal, -1);
   C.sig = sig;
  }
  C.h = h; C.hs = hs;
  for (const it of list) {
   const p = it.o;
   if (p === h || p === rcv || p.gk && p === G.dcar) continue;
   if (it.role === 'G' && p !== h) continue; // goalie: base logic (back to the cage)
   const i = C.map.get(p);
   if (i == null) continue;
   const q = spots[i], x = cpuLegalX(it.role, q[0] + (b.x - q[0]) * .06), y = q[1] + (b.y - q[1]) * .1;
   const d = hyp(p.x - x, p.y - y);
   if (d < 10) C.arr.add(p);
   setO(p, x, y, p.far ? 40 : PACE.cut * (C.arr.has(p) ? 1.05 : 1.35));
  }
 }
 // --- CPU ride ---
 let rideOnBusy = false;
 function cpuRideTick(G) {
  const b = G.ball, s = scr(), key = 'r' + (G.n420 || 0);
  let R = G.cr420;
  if (!R || R.key !== key) {
   const name = pickRide(G, G.n420 || 0);
   R = G.cr420 = { key: key, name: name, kind: RIDES[name].k, own: new Map(), map: null, t: 0, arr: new Set() };
   LOG.cpuRides.push({ team: teamBook(G).key, name: name });
   const h = s === 'defense' ? G.dclear && G.dclear.holder : G.carrier;
   if (h) addFx('txt', h.x, h.y - 34, { s: 'THEY RIDE: ' + name, col: '#ffb0a0', life: 1.4 });
  }
  if (R.kind === 'ten') return;
  R.t += 1 / 60;
  const car = s === 'defense' ? (G.dclear ? G.dclear.holder : b.state === 'pass' ? b.to : null) : (b.state === 'held' ? G.carrier : b.state === 'pass' ? b.to : null);
  const riders = cpuTeam(G, s).filter(p => alive(p) && roleOf(p) !== 'G' && !(G.dclear && G.dclear.rider === p));
  const clr = userTeam(G).filter(alive);
  const spots = RIDES[R.name].s;
  const list = riders.map(p => ({ o: p, role: roleOf(p) }));
  const legal = (i, role) => Math.abs(cpuLegalX(role, spots[i][0]) - spots[i][0]) < 3;
  const sig = riders.length + ':' + (G.farC || []).length;
  if (!R.map || R.sig !== sig) { R.map = assign(list, spots, spots.map((q, i) => i).filter(i => i > 0), legal, -1); R.sig = sig; }
  const run = PACE.cut * 1.35, press = PACE.cut * 1.05, hold = PACE.dBall;
  const out = (x, y) => { const dx = x - DGX, dy = y - CY, d = hyp(dx, dy), m = (typeof CREASE !== 'undefined' ? CREASE : 12) + 4; return d < m ? [ DGX + dx / (d || 1) * m, CY + dy / (d || 1) * m ] : [ x, y ]; };
  const go = (p, role, x, y, sp) => { const q = out(cpuLegalX(role, x), y); setO(p, q[0], q[1], p.far ? Math.max(34, sp * 1.4) : sp); };
  const face = (m, k) => { const tx = car ? car.x : MIDX, ty = car ? car.y : CY, dx = tx - m.x, dy = ty - m.y, L = hyp(dx, dy) || 1; return [ m.x + dx / L * k, m.y + dy / L * k ]; };
  // which spot is each rider's area (shifted toward the ball)
  const area = it => { const i = R.map.get(it.o); if (i == null) return null; const q = spots[i]; return [ q[0] + (b.x - q[0]) * .16, q[1] + (b.y - q[1]) * .22 ]; };
  // man pairs (man + deny)
  if (R.kind === 'man' || R.kind === 'deny') {
   const keep = new Map(), used = new Set();
   for (const it of list) { const m = R.own.get(it.o); if (m && clr.includes(m) && !used.has(m) && Math.abs(cpuLegalX(it.role, m.x) - m.x) < 8) { keep.set(it.o, m); used.add(m); } }
   const pairs = [];
   for (const it of list) if (!keep.has(it.o)) { const a = area(it) || [ it.o.x, it.o.y ]; for (const m of clr) if (!used.has(m) && Math.abs(cpuLegalX(it.role, m.x) - m.x) < 8 && (R.kind === 'man' || it.role === 'A')) pairs.push([ hyp(a[0] - m.x, a[1] - m.y), it, m ]); }
   pairs.sort((x, y) => x[0] - y[0]);
   for (const [d, it, m] of pairs) { if (keep.has(it.o) || used.has(m) || d > 150) continue; keep.set(it.o, m); used.add(m); }
   R.own = keep;
  }
  // zone: who owns the ball's area, who traps
  let z1 = null, z2 = null;
  if (car && (R.kind === 'zone' || R.kind === 'layoff' || R.kind === 'deny')) {
   const zs = list.filter(it => R.kind !== 'deny' || it.role !== 'A').map(it => ({ it: it, a: area(it) })).filter(x => x.a).map(x => ({ it: x.it, d: hyp(x.a[0] - car.x, x.a[1] - car.y) })).sort((x, y) => x.d - y.d);
   const zr = R.kind === 'layoff' ? 34 : 70;
   if (zs[0] && zs[0].d < zr) z1 = zs[0].it.o;
   if (R.kind === 'zone' && zs[1] && zs[1].d < 95 && z1) z2 = zs[1].it.o;
  }
  for (const it of list) {
   const p = it.o, a = area(it);
   if (!a || p === car) continue;
   const i = R.map.get(p), sp0 = spots[i];
   // first: run to the spot (live, no reset)
   if (!R.arr.has(p)) {
    if (hyp(p.x - sp0[0], p.y - sp0[1]) < 12 || R.t > 3 || car && hyp(p.x - car.x, p.y - car.y) < 24) R.arr.add(p);
    else { go(p, it.role, sp0[0], sp0[1], run); continue; }
   }
   if (R.kind === 'man' || R.kind === 'deny' && it.role === 'A') {
    const m = R.own.get(p);
    if (m) { if (m === car) go(p, it.role, car.x + 7, car.y + (CY - car.y) * .1, press); else { const q = face(m, 6); go(p, it.role, q[0], q[1], press); } continue; }
    go(p, it.role, a[0], a[1], hold);
    continue;
   }
   if (p === z1 && car) { go(p, it.role, car.x + 7, car.y + (CY - car.y) * .1, press); continue; }
   if (p === z2 && car) { go(p, it.role, car.x + 5, car.y + (car.y < CY ? 8 : -8), press); continue; }
   // zone / lay off: shade the nearest clearer in my area (between him and the ball), else hold the area
   let m = null, md = R.kind === 'layoff' ? 40 : 60;
   for (const c of clr) { if (c === car) continue; const d = hyp(c.x - a[0], c.y - a[1]); if (d < md) { md = d; m = c; } }
   if (m && car) { const x = m.x + (car.x - m.x) * .35, y = m.y + (car.y - m.y) * .35; go(p, it.role, x, y, hold); }
   else go(p, it.role, a[0], a[1], hold);
  }
 }
 // CPU ride call decides whether THEIR goalie comes out (10-man) - the base CPU ride is always 10-man
 wrapG('rideOn', function (o, a) {
  const r = o.apply(this, a);
  try {
   if (r && a[0] === 'C' && !offC()) { const G = G_(); if (okG(G) && G.cr420 && !G.cr420.done && G.cr420.kind !== 'ten') return false; }
  } catch (e) {}
  return r;
 });

 /* ---------------- per-frame driver ---------------- */
 wrapG('step', function (o, a) {
  FR.n++;
  try {
   const G = G_(), s = scr();
   if (okG(G) && G.players && (s === 'live' || s === 'defense')) {
    if (G.cset) userClearSpeed(G);
    // safety: a pass with no receiver (seen once in 20 seeded games) would throw in updateLive every frame - make it a loose ball
    { const b = G.ball; if (b && b.state === 'pass' && !b.to && !b.intercept) { b.state = 'loose'; LOG.passFix = (LOG.passFix || 0) + 1; } }
    if (!offC() && G.farU && G.farC) {
     const k = cpuCtx(G), b = G.ball;
     // a new clear / ride starts on the rising edge of a clear (not on every flicker of the context)
     const cc = !!G.cpuClear, uc = !!(G.dclear || G.clearing || b && b.clear);
     if (k === 'clear' && (cc && !G.cc0420 || !G.cc420)) G.n420 = (G.n420 || 0) + 1;
     else if (k === 'ride' && (uc && !G.uc0420 || !G.cr420)) G.n420 = (G.n420 || 0) + 1;
     if (k === 'clear' && G.cc420 && G.cc420.key === 'c' + G.n420) G.cc420.done = 0;
     if (k === 'ride' && G.cr420 && G.cr420.key === 'r' + G.n420) G.cr420.done = 0;
     G.cc0420 = cc; G.uc0420 = uc;
     G.k420 = k;
     if (k === 'clear') cpuClearTick(G); else if (k === 'ride') cpuRideTick(G);
     if (k !== 'ride' && G.cr420) G.cr420.done = 1;
     if (k !== 'clear' && G.cc420) G.cc420.done = 1;
    }
   }
  } catch (e) { err(e, 'pre'); }
  return o.apply(this, a);
 });
 V.slotObj = (G, sl) => slotObj(G, sl);
 V.ovrOf = p => { const q = OVR.get(p); return q ? [ Math.round(q[0]), Math.round(q[1]), Math.round(q[2]), FR.n - q[3] ] : null; };
 V.arrOf = p => { const G = G_(); return !!(G && G.rideArr420 && G.rideArr420.arr.has(p)); };
 V.ctx = () => { const G = G_(); return G ? cpuCtx(G) : null; };
})();
