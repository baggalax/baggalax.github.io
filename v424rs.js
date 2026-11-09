/* v424rs.js - V42.4 RESTARTS START IN YOUR SETS, AND EVERYBODY RUNS THERE (kill switch: window.__rl_no424rs = true)
 * Charlie (Nov 3): "for any play where the game restarts ... and I'm man up it should start in my man up set or if i shoot
 * and get the chase it should start in my endline play. ... my guy the guy starting with it may not be in his x spot ...
 * everyone else should be and I'll run to mine. Any non pause stop the players actually have to run to there spot/closets
 * spot" + "Only go to the closets spot tho for things that don't matter like offense ... on a clear obvious the d need to
 * go to their exact spots because i would need to sub them accordingly and get the middies over".
 * (1) The PLAYBOOK now remembers one pick per category (OFFENSE, MAN-UP, END LINE; CLEAR and D were already their own
 *     picks). NO PLAYS clears them. On a whistle restart (out of bounds, chase won, fouls/turnovers from the rules, flags,
 *     keep / timeout restarts - not faceoffs, not the pause menu) your team starts in the pick for the situation:
 *     man-up -> MAN-UP pick, chase won / ball on the end line -> END LINE pick (no END LINE popup), other offensive
 *     restarts -> OFFENSE pick, your ball in your own end -> CLEAR pick (the game's own clear set), their ball -> your D
 *     pick (already the game's custom-D spots). Nothing picked for that category -> exactly what happened before.
 * (2) Spot rule: OFFENSE / MAN-UP / END LINE = closest open spot, done by the game's own SET (v409s: the guy with the
 *     ball claims the spot nearest him and is never moved - on the end line that is the X spot - teammates take the rest
 *     by least total running, run your guy onto a teammate's spot and he bumps to the open one until RUN). END LINE goes
 *     through the game's own END LINE pick, so the popup never shows. CLEAR / D = every man to HIS spot by position +
 *     lineup order (D1-D3 = your D in lineup order, M1-M3 middies, A1-A3 attack) so you can sub.
 * (3) The ball carrier is never moved: the rules (and v423ob if loaded) put him and the ball; you run him.
 * (4) No teleports when a pick is used: whoever the restart re-placed starts from where he stood and RUNS (both teams,
 *     also out of the penalty screen, which the old guard missed). A picked set gets a short GET SET hold (max 1 s, ends
 *     when everyone is there; sub-switch __rl_no424hold) in which everyone runs, then the game's own set flow keeps
 *     running anyone not there yet. Nothing picked for the situation -> this file does nothing on that restart.
 * Offline only: online, tutorial, BRAVEHEART unchanged. Sub-switches: __rl_no424sel (set picks), __rl_no424pen (no
 * auto man-up pick on the flag), __rl_no424hold. */
(function () {
 'use strict';
 if (typeof window === 'undefined' || window.__rl_v424rs_loaded) return;
 window.__rl_v424rs_loaded = 1;
 const off = () => !!(window.__rl_no424rs || window.__rl_v124gb);
 const LOG = window.V424RS = { on: false, n: 0, by: {}, last: null, hist: [], rewinds: 0, runners: 0, arrived: 0, drive: 0, bumps: 0, holds: 0, penAuto: 0, elAuto: 0, errs: [] };
 const need = [ 'afterBanner', 'penaltyChoose', 'tp35', 'tp35key', 'tp35cap', 'pmCat', 'playById', 'choosePlay', 'pmClampSpot' ];
 if (need.some(n => typeof window[n] !== 'function')) { LOG.errs.push('missing ' + need.filter(n => typeof window[n] !== 'function').join(',')); return; }
 LOG.on = true;
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const hyp = Math.hypot, CL = (v, a, b) => Math.max(a, Math.min(b, v));
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.errs.length < 5) console.error(e); } catch (x) {} };
 const okG = G => !!G && !G.tutorial && !G.online && !(G.meta && G.meta.online) && !G.brave && !G.over;
 const wrap = (n, f) => { const o = window[n]; if (typeof o !== 'function') return false; const w = function () { return f.call(this, o, arguments); }; w.v424 = 1; window[n] = w; return true; };
 const OCATS = [ 'OFFENSE', 'MAN-UP', 'END LINE' ];
 const NOT_RESTART = { goal: 1, cgoal: 1, fowin: 1, folose: 1, buzzer: 1, tutdone: 1, flag: 0 };
 const HOLD_MAX = 1.0, ARR = 3;

 /* ---------- (1) one pick per category ---------- */
 const mem = G => G.sel424 || (G.sel424 = {});
 const catOf = p => p && !p.dcall && !p.ride ? pmCat(p) : null;
 function remember(G, id) { const p = id ? playById(id) : null, c = catOf(p); if (c && OCATS.includes(c)) mem(G)[c] = id; }
 function selFor(G, cat) {
  if (window.__rl_no424sel) return null;
  if (cat === 'D') return typeof dCustomPlay === 'function' && typeof dCustomOn === 'function' && dCustomOn() ? dCustomPlay() : null;
  if (cat === 'CLEAR') return typeof clrSel === 'function' ? clrSel() : null;
  if (G.playSel) { const p = playById(G.playSel); if (p && catOf(p) === cat) return p; }
  const id = mem(G)[cat], p = id ? playById(id) : null;
  return p && catOf(p) === cat && Array.isArray(p.start) && p.start.length >= 4 ? p : null;
 }
 try {
  if (typeof PANEL_ACT === 'object' && PANEL_ACT) for (const k of [ 'pbPick', 'toPlay' ]) {
   const o = PANEL_ACT[k];
   if (typeof o !== 'function') continue;
   PANEL_ACT[k] = function (v) {
    const G = G_();
    try { if (G && !off() && okG(G) && !v) G.sel424 = {}; } catch (e) { err(e, 'pick0'); }
    const r = o.apply(this, arguments);
    try { if (G && !off() && okG(G) && v) remember(G, v); } catch (e) { err(e, 'pick'); }
    return r;
   };
  }
 } catch (e) { err(e, 'panel'); }
 wrap('penPlay18', function (o, a) { const G = G_(); try { if (G && !off() && okG(G)) remember(G, a[0]); } catch (e) {} return o.apply(this, a); });
 wrap('pbOn', function (o, a) {
  const r = o.apply(this, a);
  if (r || off()) return r;
  try { const G = a[0], p = a[1]; if (G && okG(G) && p && G.sel424 && OCATS.includes(catOf(p)) && G.sel424[catOf(p)] === p.id) return true; } catch (e) {}
  return r;
 });

 /* ---------- positions at the whistle ---------- */
 let SNAP = null, SNAPG = null;
 const SEEN = { live: 1, defense: 1, banner: 1 };
 function snapNow(G) { const m = new Map; for (const p of G.players || []) { const k = tp35key(p); if (k && !m.has(k)) m.set(k, [ p.x, p.y ]); } return m; }

 /* ---------- assignment helpers ---------- */
 /* ---- V40.1.4 spot rule (Charlie, Nov 3): CLEARS / RIDES / D = matched by POSITION GROUP, never across groups.
    The closest middie takes the closest middie spot, closest attackman the closest attack spot, D to D spots, LSM to the
    LSM spot, goalie stays goalie. A spot's group = the player the playmaker drew it for (CLEAR: G, D D D, M, LSM, M, A A A;
    RIDES: G, D D D, M M M, A A A; D: M, LSM, M, D D D, G). Extras (e.g. after a sub) take the nearest leftover spots.
    Same helper in v420c.js and v424rs.js (copy). OFFENSE / MAN-UP / END LINE keep closest open spot (not touched here). ---- */
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

 function bestAssign(objs, spots, free) {
  // min total distance, objs.length <= free.length (<= 7): exhaustive
  let best = null, bs = 1e9; const perm = [], used = new Set;
  const go = (i, acc) => {
   if (acc >= bs) return;
   if (i === objs.length) { bs = acc; best = perm.slice(); return; }
   for (const j of free) { if (used.has(j)) continue; used.add(j); perm[i] = j; go(i + 1, acc + hyp(objs[i].x - spots[j][0], objs[i].y - spots[j][1])); used.delete(j); }
  };
  go(0, 0);
  return best;
 }
 function legalO(q) {
  // offensive end, not in the crease, inside the field (pmClampSpot already clamps; keep the crease clear + onside)
  let x = CL(q[0], MIDX + 8, ENDX - 6), y = CL(q[1], FT + 12, FB - 4);
  const cx = x - GX, cy = y - CY, cd = hyp(cx, cy) || 1;
  if (cd < CREASE + 4) { x = GX + cx / cd * (CREASE + 4); y = CY + cy / cd * (CREASE + 4); }
  return [ x, y ];
 }

 /* ---------- plans ---------- */
 function planO(G, why) {
  const c = G.carrier;
  if (!c || c.team !== 'O' || !G.ball || G.ball.state !== 'held') return null;
  if (G.clearing || c.x < MIDX) return planClear(G);
  const manUp = !!(G.pen && G.pen.side === 'C');
  const endline = /chase/.test(why) || c.x >= GX - 2 || !!(G.el2314 && G.el2314.open);
  let cat = null, pl = null;
  if (manUp) { pl = selFor(G, 'MAN-UP'); cat = 'MAN-UP'; }
  if (!pl && endline) { pl = selFor(G, 'END LINE'); cat = 'END LINE'; }
  if (!pl && !manUp && !endline) { pl = selFor(G, 'OFFENSE'); cat = 'OFFENSE'; }
  if (!pl) return null;
  // the game's own SET does the placing (v409s: the guy with the ball claims the spot nearest him and is never moved,
  // teammates take the remaining spots by min total distance, a teammate bumps when you step onto his spot until RUN).
  // END LINE goes through the game's own END LINE pick (no popup); the others through SET.
  if (G.playSel !== pl.id) choosePlay(pl.id);
  if (G.playSel !== pl.id) G.playSel = pl.id;
  G.__in424 = 1;
  try {
   if (cat === 'END LINE' && G.el2314 && G.el2314.open && typeof elPick2314 === 'function') { elPick2314(pl.id); LOG.elAuto++; }
   if (!(G.pset && G.pset.pl && G.pset.pl.id === pl.id && G.pset.poss === G.possCount) && typeof playSet === 'function') {
    G.auto27 = G.possCount + '|' + pl.id; // the game's auto-SET would do the same next frame; this makes it now
    playSet();
   }
  } finally { G.__in424 = 0; }
  if (G.el2314 && G.el2314.open) { G.el2314.open = false; G.el2314.pick = pl.id; G.el2314.auto = false; }
  const t = new Map, map = [];
  let spots = null, own = -1, how = 'set';
  const S = G.pset;
  if (S && S.pl && S.pl.id === pl.id && Array.isArray(S.map) && Array.isArray(S.spots)) {
   spots = S.spots.map(q => q.slice());
   S.map.forEach((p, j) => { if (!p || !spots[j]) return; if (p === c) { own = j; return; } t.set(p, spots[j].slice()); map.push([ p.idx, j ]); });
   if (own < 0) { let bd = 1e9; spots.forEach((q, j) => { if (S.map[j]) return; const d = hyp(q[0] - c.x, q[1] - c.y); if (d < bd) { bd = d; own = j; } }); }
  } else {
   // SET refused (nothing to set yet): same rule, done here
   how = 'own';
   spots = pl.start.map(q => legalO(pmClampSpot(q[0], q[1], cat)));
   const run = G.players.filter(p => p.team === 'O' && p !== c && !p.gk && !p.far);
   let bd = 1e9;
   spots.forEach((q, j) => { const d = hyp(q[0] - c.x, q[1] - c.y); if (d < bd) { bd = d; own = j; } });
   const free = spots.map((q, j) => j).filter(j => j !== own);
   const objs = run.slice(0, free.length);
   const perm = bestAssign(objs, spots, free) || [];
   objs.forEach((p, i) => { const j = perm[i]; if (j == null) return; t.set(p, spots[j].slice()); map.push([ p.idx, j ]); });
  }
  return { cat: cat, rule: 'closest', how: how, pl: pl, t: t, spots: spots, own: own, map: map };
 }
 function planClear(G) {
  const pl = selFor(G, 'CLEAR');
  if (!pl || typeof clrSet !== 'function') return null;
  if (G.cset) { if (typeof clrEnd === 'function') clrEnd(); }
  if (!clrSet() || !G.cset || !Array.isArray(G.cset.slots)) return null;
  const S = G.cset, h = typeof clrHolder === 'function' ? clrHolder() : G.carrier, map = [];
  // position groups (same rule as v420c.js): inside each group the nearest player takes the nearest spot; never across groups
  const L = S.slots.filter(sl => sl.o && sl.o !== h && sl.role !== 'G');
  const taken = new Set(S.slots.filter(sl => !L.includes(sl) && sl.i != null).map(sl => sl.i));
  const free = pl.start.map((q, i) => i).filter(i => !taken.has(i) && SPOT_GRP('CLEAR', i) !== 'G');
  const m = grpAssign(L.map(sl => ({ o: sl.o, role: sl.role, sl: sl })), pl.start, free, 'CLEAR');
  for (const sl of L) {
   const i = m.get(sl.o);
   if (i == null) continue;
   if (i !== sl.i) {
    sl.i = i; sl.spot = f10Spot(pl.start[i], sl.role); sl.ri = 0; sl.rt = 0;
    if (S.r420) { const R0 = S.r420[i] || []; sl.full420 = R0; sl.route = R0.filter(q => q.pg <= (S.stg420 || 1)).map(q => f10Spot([ q.x, q.y ], sl.role)); }
    else { let R1 = []; try { R1 = typeof clrRoutes === 'function' ? (clrRoutes(pl)[i] || []) : []; } catch (e) {} sl.route = R1.map(q => f10Spot(q, sl.role)); }
   }
   map.push([ PL_GRP(sl.o, sl.role) + (sl.o.idx != null ? sl.o.idx : '?') + (sl.o.far ? 'f' : ''), i, SPOT_GRP('CLEAR', i) ]);
  }
  S.exact424 = 1;
  return { cat: 'CLEAR', rule: 'exact', pl: pl, t: new Map, map: map, cset: true };
 }
 function planD(G) {
  const pl = selFor(G, 'D');
  if (!pl) return null;
  const t = new Map, map = [];
  // position groups (same rule as clears/rides): middies to middie spots, LSM to the LSM spot, D to D spots, nearest to nearest
  const tg = q => [ DGX + CL(GX - q[0], CREASE + 4, 190), CL(q[1], FT + 12, FB - 3) ];
  const sp = pl.start.map((q, i) => i < 6 && q ? tg(q) : null);
  const list = G.players.filter(p => p.team === 'O' && !p.far && !p.gk && p.idx >= 0 && p.idx < 6).map(p => ({ o: p, role: typeof rrOf === 'function' ? rrOf(p) : (p.idx <= 2 ? 'M' : 'D') }));
  const free = sp.map((q, i) => i).filter(i => sp[i]);
  const m = grpAssign(list, sp, free, 'D');
  for (const it of list) { const i = m.get(it.o); if (i == null) continue; t.set(it.o, sp[i]); map.push([ PL_GRP(it.o, it.role) + it.o.idx, i, SPOT_GRP('D', i) ]); }
  return { cat: 'D', rule: 'exact', pl: pl, t: t, map: map };
 }

 /* ---------- a restart happened ---------- */
 function restart(G, why, pre) {
  if (!(scr() === 'live' || scr() === 'defense') || G !== G_()) return;
  let plan = null;
  try { plan = scr() === 'live' ? planO(G, why) : planD(G); } catch (e) { err(e, 'plan'); plan = null; }
  const car = G.carrier || null, dcar = G.dcar || null, R = { why: why, t: 0, poss: G.possCount, runners: new Map, plan: plan, hold: 0 };
  let rw = 0;
  if (!plan) {
   // nothing picked for this situation: exactly today's restart (nothing rewound, nothing driven, no hold)
   LOG.n++;
   const key0 = (scr() === 'live' ? 'O' : 'D') + ':' + why + ':none';
   LOG.by[key0] = (LOG.by[key0] || 0) + 1;
   LOG.last = { why: why, scr: scr(), cat: null, rule: null, play: null, how: null, map: null, tg: null, runners: 0, rewound: 0, hold: 0, t: +(G.t || 0).toFixed(2) };
   LOG.hist.push(LOG.last); if (LOG.hist.length > 40) LOG.hist.shift();
   if (G.rs424) G.rs424 = null;
   return;
  }
  for (const p of G.players) {
   if (p.far || p === car || p === dcar) continue;
   const k = tp35key(p), q = pre && k ? pre.get(k) : null, tg = plan && plan.t.get(p);
   const at = [ p.x, p.y ], moved = !!q && hyp(q[0] - p.x, q[1] - p.y) > 1.5;
   if (moved) { p.x = q[0]; p.y = q[1]; rw++; (R.rwk || (R.rwk = [])).push(k); }
   if (tg && plan.cat !== 'D') { p.home = tg.slice(); p.tx = tg[0]; p.ty = tg[1]; p.playT = null; p.playHold = null; p.pickSet = null; p.callPick = null; }
   // where to: his set spot, else the spot the restart put him on (only if it re-placed him; else the AI walks him)
   const dest = tg || (moved ? at : null);
   if (dest && hyp(dest[0] - p.x, dest[1] - p.y) > ARR) R.runners.set(p, { x: dest[0], y: dest[1], own: !!tg, team: p.team });
  }
  LOG.rewinds += rw;
  LOG.runners += R.runners.size;
  if (plan && !plan.cset && R.runners.size && !window.__rl_no424hold) {
   const before = G.readyT || 0;
   G.readyT = Math.max(before, HOLD_MAX);
   R.hold = 1; R.holdAdd = G.readyT - before; LOG.holds++;
   if (typeof addFx === 'function') addFx('cue', 0, 0, { s: 'GET SET: ' + String(plan.pl.name || plan.cat).toUpperCase().slice(0, 18), col: '#ffe14d', life: 1 });
  }
  G.rs424 = R;
  LOG.n++;
  const key = (scr() === 'live' ? 'O' : 'D') + ':' + why + ':' + (plan ? plan.cat : 'none');
  LOG.by[key] = (LOG.by[key] || 0) + 1;
  LOG.last = { why: why, scr: scr(), cat: plan ? plan.cat : null, rule: plan ? plan.rule : null, play: plan ? plan.pl.name : null, how: plan ? plan.how || null : null, map: plan ? plan.map : null, tg: plan && plan.t ? [ ...plan.t ].map(([p, q]) => [ tp35key(p), p.idx, Math.round(q[0]), Math.round(q[1]) ]) : null, runners: R.runners.size, rewound: rw, rwk: R.rwk || [], car: car ? tp35key(car) : null, hold: R.hold, t: +(G.t || 0).toFixed(2) };
  LOG.hist.push(LOG.last); if (LOG.hist.length > 40) LOG.hist.shift();
 }

 wrap('afterBanner', function (o, a) {
  const G = G_(), k = G && G.banner && G.banner.kind;
  const pre = G && SNAPG === G && SNAP ? SNAP : null;
  const go = !off() && okG(G) && k && !NOT_RESTART[k];
  if (go) G.__rc424 = false;
  const r = o.apply(this, a);
  try {
   if (go && G === G_()) {
    if (scr() === 'penalty' && G.pen && G.pen.side === 'C' && window.__rl_yes424pen && selFor(G, 'MAN-UP')) {
     // man-up flag and you picked a MAN-UP play: start straight in it (same as tapping 3-3 EMO, then your set)
     LOG.penAuto++;
     penaltyChoose('3-3 EMO');
     if (typeof panelDirty === 'function') panelDirty();
    } else restart(G, 'b:' + k, pre);
   }
  } catch (e) { err(e, 'afterBanner'); }
  return r;
 });
 wrap('penaltyChoose', function (o, a) {
  const G = G_(), pre = G && SNAPG === G && SNAP ? SNAP : null, go = !off() && okG(G);
  const r = o.apply(this, a);
  try { if (go && G === G_()) restart(G, 'pen', pre); } catch (e) { err(e, 'pen'); }
  return r;
 });
 // remember chase restarts (resumeOurs consumes G.resume before we can read it)
 wrap('resumeOurs', function (o, a) {
  const G = G_();
  try { if (G) G.__rc424 = !!(G.resume && G.resume.chase); } catch (e) {}
  return o.apply(this, a);
 });
 const restart0 = restart;
 restart = function (G, why, pre) { if (G && G.__rc424 && !/chase/.test(why)) why += ':chase'; G.__rc424 = false; return restart0(G, why, pre); };

 /* ---------- every frame: run them there ---------- */
 function tick(G, dt) {
  const R = G.rs424;
  if (!R || !R.runners) return;
  if (R.poss !== G.possCount || !(scr() === 'live' || scr() === 'defense')) { endRun(G, 'poss'); return; }
  R.t += dt;
  const frozen = G.readyT > 0 || !!(G.el2314 && G.el2314.open);
  const b = G.ball, c = G.carrier;
  const ballOk = b && (b.state === 'held' || b.state === 'pass') && (!c || c.team === 'O' || scr() === 'defense');
  // the game's set flow may re-pair guys and spots (your guy claims / bumps): follow its pick for this player
  const P = R.plan;
  if (P && P.spots && scr() === 'live') for (const [p, r] of R.runners) if (r.own && p.home && P.spots.some(s => hyp(s[0] - p.home[0], s[1] - p.home[1]) < .5) && hyp(p.home[0] - r.x, p.home[1] - r.y) > .5) { r.x = p.home[0]; r.y = p.home[1]; LOG.bumps++; }
  for (const [p, r] of R.runners) {
   if (!G.players.includes(p) || p === G.carrier || p === G.dcar || p === G.ctrl && !frozen || p === G.dctl && !frozen) { R.runners.delete(p); continue; }
   const d = hyp(r.x - p.x, r.y - p.y);
   if (d <= ARR) { arrive(G, p, r); R.runners.delete(p); continue; }
   if (frozen) {
    if (p.down > 0) continue;
    const sp = (typeof PACE !== 'undefined' ? PACE.run : 26) * (typeof spdMul === 'function' ? spdMul(p) : 1) * (p.team === 'G' || p.team === 'G2' ? 1.2 : 1);
    const s = Math.min(d, sp * dt);
    p.x += (r.x - p.x) / d * s; p.y += (r.y - p.y) / d * s; p.anim = (p.anim || 0) + s;
    if (r.own) { p.tx = r.x; p.ty = r.y; }
    LOG.drive++;
   } else if (!r.own && R.t > 1.5) { R.runners.delete(p); }
   // live: the game's own set flow (v404g) runs him to his spot of this formation; we only watch
  }
  if (R.hold && G.readyT > 0 && ![ ...R.runners.values() ].some(r => r.own)) { G.readyT = Math.min(G.readyT, .05); R.hold = 0; }
  if (!R.runners.size || R.t > 6 || !ballOk) endRun(G, R.runners.size ? 'time' : 'done');
 }
 function arrive(G, p, r) {
  LOG.arrived++;
  if (r.own && G.rs424 && G.rs424.plan && G.rs424.plan.cat === 'D') { p.tx = r.x; p.ty = r.y; }
  (G.rsArr424 = G.rsArr424 || []).push([ p.idx, +(G.rs424.t).toFixed(2) ]);
 }
 function endRun(G, why) {
  const R = G.rs424;
  G.rs424 = null;
 }

 const T0 = window.tp35;
 window.tp35 = function (G, dt) {
  try { if (!off() && G && G.rs424 && okG(G) && dt > 0 && dt <= .1) tick(G, dt); } catch (e) { err(e, 'tick'); G && (G.rs424 = null); }
  const r = T0.apply(this, arguments);
  try {
   if (!off() && G && okG(G) && SEEN[scr()]) { SNAP = snapNow(G); SNAPG = G; }
   else if (!G) { SNAP = null; SNAPG = null; }
  } catch (e) { err(e, 'snap'); }
  return r;
 };
})();
