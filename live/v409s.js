/* V40.0.9s - setting up a play (SET button / auto-set) and the man-up set up: your guy with the ball
   CLAIMS the play spot nearest to him, even when he is not exactly on it, and is never moved. Teammates
   take the REMAINING spots (minimum total distance, the play's starting spot always filled), so nobody
   runs to the spot you are already standing near. Until RUN, if you move your guy so a different spot is
   clearly nearest to him, the teammate on that spot bumps to the open spot.
   Kill switch: window.__rl_no409s = true  -> V40.0.8 behavior. */
(function () {
 'use strict';
 if (window.__rl_v409s_loaded) return;
 window.__rl_v409s_loaded = 1;
 const off = () => !!window.__rl_no409s || !!window.__rl_v124gb;
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const online = G => !!(G && (G.online || G.meta && G.meta.online));
 const hyp = Math.hypot;
 const HYS = 10; // a new spot must be this much (px) closer than the claimed one before you take it (no flicker)
 const ST = { sets: 0, bumps: 0, last: null };

 function ok(G, S) {
  return !off() && G && S && scr() === 'live' && !G.tutorial && !online(G) && G.carrier && G.carrier.team === 'O' &&
   Array.isArray(S.map) && Array.isArray(S.spots) && S.spots.length === S.map.length && S.pl;
 }
 function nearest(c, sp) {
  let j = -1, bd = 1e9;
  sp.forEach((q, i) => { if (!q) return; const d = hyp(c.x - q[0], c.y - q[1]); if (d < bd) { bd = d; j = i; } });
  return j;
 }
 // spots the ball goes through: better not left empty when there are fewer guys than spots (man-up)
 function ballSpots(pl) {
  const s = new Set();
  for (const st of pl.steps || []) if (st && (st.t === 'pass' || st.t === 'shot')) for (const k of [ st.from, st.to, st.p ]) if (k != null) s.add(k);
  return s;
 }
 // put players P into free spot indices F: min total distance, the play's start spot (must) always filled
 function fit(P, F, sp, must, bs0) {
  if (!P.length || !F.length) return [];
  let best = null, bs = 1e9;
  const perm = [], used = new Array(F.length).fill(false);
  const go = (i, acc) => {
   if (acc >= bs) return;
   if (i === P.length || i === F.length) {
    let pen = 0;
    F.forEach((j, k) => { if (!used[k]) { if (j === must) pen += 5000; else if (bs0.has(j)) pen += 200; } });
    if (acc + pen < bs) { bs = acc + pen; best = perm.slice(); }
    return;
   }
   for (let k = 0; k < F.length; k++) {
    if (used[k]) continue;
    used[k] = true; perm[i] = F[k];
    go(i + 1, acc + hyp(P[i].x - sp[F[k]][0], P[i].y - sp[F[k]][1]));
    used[k] = false;
   }
  };
  go(0, 0);
  return best || [];
 }
 function send(p, q) {
  p.home = q.slice();
  p.playT = null;
  p.playHold = null;
  p.pickSet = null;
  p.callPick = null;
 }
 function starter(G, S) {
  const pl = S.pl, c = G.carrier;
  if (pl.car == null || pl.car < 0) return;
  const st = S.map[pl.car];
  if (st === c || (!st && S.cs409 === pl.car)) { S.st17 = c; S.ap17 = null; } // you are the starter
  else { S.st17 = st || null; S.ap17 = null; } // no auto pass: you pass to the guy who starts
 }
 // full assignment right after SET
 function claim(G, S) {
  const c = G.carrier, sp = S.spots, pl = S.pl, n = sp.length;
  const inMap = S.map.indexOf(c) >= 0; // even strength: your guy holds a play role. man-up (V40.0.5): he stays out of the map
  const cs = nearest(c, sp);
  if (cs < 0) return;
  const P = S.map.filter(p => p && p !== c);
  const F = [];
  for (let j = 0; j < n; j++) if (j !== cs) F.push(j);
  const must = pl.car != null && pl.car >= 0 && pl.car !== cs ? pl.car : -1;
  const pick = fit(P, F, sp, must, ballSpots(pl));
  const before = S.map.map(p => p ? (p === c ? 'U' : p.idx) : null);
  const map = new Array(n).fill(null);
  if (inMap) map[cs] = c;
  P.forEach((p, i) => { const j = pick[i]; if (j != null) map[j] = p; });
  S.map = map;
  S.cs409 = cs;
  S.in409 = inMap;
  for (let j = 0; j < n; j++) { const p = map[j]; if (p && p !== c) send(p, sp[j]); }
  starter(G, S);
  if (S.mu405) S.mu405.emptySpot = map.findIndex((p, j) => !p && j !== cs);
  ST.sets++;
  ST.last = { cs: cs, dCar: Math.round(hyp(c.x - sp[cs][0], c.y - sp[cs][1])), before: before, after: map.map(p => p ? (p === c ? 'U' : p.idx) : null) };
  G.set409 = (G.set409 || 0) + 1;
 }
 // before RUN: your guy moved so a different spot is now clearly nearest -> take it, bump its guy to an open spot
 function rebump(G, S) {
  const c = G.carrier, sp = S.spots, pl = S.pl;
  let cur = S.cs409;
  if (cur == null || cur < 0 || !sp[cur]) return;
  if (S.in409 && S.map[cur] !== c) { const k = S.map.indexOf(c); if (k < 0) return; cur = S.cs409 = k; }
  const j = nearest(c, sp);
  if (j < 0 || j === cur) return;
  if (hyp(c.x - sp[j][0], c.y - sp[j][1]) + HYS >= hyp(c.x - sp[cur][0], c.y - sp[cur][1])) return;
  const b = S.map[j];
  if (S.in409) { S.map[cur] = null; S.map[j] = c; } else S.map[j] = null;
  S.cs409 = j;
  let to = -1;
  if (b && b !== c) {
   const F = [];
   S.map.forEach((p, k) => { if (!p && k !== j) F.push(k); });
   const must = pl.car != null && pl.car >= 0 && pl.car !== j ? pl.car : -1;
   to = fit([ b ], F, sp, must, ballSpots(pl))[0];
   if (to != null && to >= 0) { S.map[to] = b; send(b, sp[to]); }
   if (S.lp) { S.lp[j] = null; if (to >= 0) S.lp[to] = null; }
  }
  starter(G, S);
  ST.bumps++;
  G.bump409 = (G.bump409 || 0) + 1;
  (G.bumps409 = G.bumps409 || []).push({ from: cur, to: j, bumped: b && b !== c ? b.idx : null, bumpedTo: to });
 }

 if (typeof window.playSet === 'function') {
  const PS0 = window.playSet;
  window.playSet = function () {
   const r = PS0.apply(this, arguments);
   try { const G = G_(), S = G && G.pset; if (r && ok(G, S)) claim(G, S); } catch (e) { console.error(e); }
   return r;
  };
 }
 if (typeof window.psetTick === 'function') {
  const PT0 = window.psetTick;
  window.psetTick = function (dt) {
   try { const G = G_(), S = G && G.pset; if (ok(G, S) && S.cs409 != null) rebump(G, S); } catch (e) { console.error(e); }
   return PT0.apply(this, arguments);
  };
 }
 window.V409S = { ST: ST, on: () => !off(), nearest: nearest };
})();
