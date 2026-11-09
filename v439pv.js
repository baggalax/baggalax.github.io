// v439pv.js - V43.9 PLAYMAKER PREVIEW + SUB CRASH FIX (kill switch: window.__rl_no439pv = true -> exactly like before)
// Charlie (Nov 4): "Whenever i click preview on a clear play it crashes and restarts my game" / "After I've added a sub".
// Cause: v421s.js subPlay() pads the recorded play out to the end of the sub's ON run:
//   while (last[0] < T - 1e-6) { ...; f[0] = Math.round(Math.min(T, last[0] + .1) * 100) / 100; F.push(f); }
// T = the sub's end time + .4, a raw float. When T's 3rd decimal rounds DOWN (e.g. 5.123 -> 5.12) the last pad frame
// is stamped 5.12 < T forever, so the loop never ends and keeps pushing deep-copied frames -> memory blowup -> iOS
// kills the web view and the app reloads. It runs whenever PREVIEW plays a play whose subs were not recorded in the
// ball part (sub added / changed after PLAY, shape plays, CLRP clears) - about half of all sub timings.
// Fix: before v421s's pmTick / drawPlaymaker wrappers run, build the same padded preview with a loop that always
// ends (pads to T rounded to .01, hard cap) and put it in v421s's own cache (S421.PMS.pvKey / pvBase / pvEv / pvPlay),
// so subPlay() returns it from the cache and never enters its loop. Same frames, same events, same drawing.
// Playmaker only (offline); no ids, rl_* keys, __rl_* flags or net messages change.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v439pv_loaded) return;
 W0.__rl_v439pv_loaded = 1;
 const LOG = { primed: 0, hits: 0, capped: 0, err: 0, lastT: null };
 const off = () => !!(W0.__rl_no439pv || W0.__rl_v124gb || W0.__rl_no421s || W0.__rl_no421pm);
 const er = e => { LOG.err++; if (LOG.err < 4) try { console.error(e); } catch (x) {} };
 const S4 = () => W0.S421 && W0.S421.PMS && W0.S421.pm && typeof W0.S421.pm.offPts === 'function' && typeof W0.S421.pm.tl === 'function' ? W0.S421 : null;
 const PMo = () => { try { return typeof PM !== 'undefined' ? PM : null; } catch (e) { return null; } };
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 // same math as v421s.js pAt / fAt
 function pAt(path, t) {
  if (t <= path[0][0]) return [ path[0][1], path[0][2] ];
  const L = path[path.length - 1]; if (t >= L[0]) return [ L[1], L[2] ];
  let k = 0; while (k < path.length - 1 && path[k + 1][0] <= t) k++;
  const a = path[k], b = path[k + 1], f = (t - a[0]) / (b[0] - a[0] || 1);
  return [ a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f ];
 }
 function fAt(F, i, t) { let k = 0; while (k < F.length - 1 && F[k + 1][0] <= t) k++; const a = F[k], b = F[Math.min(F.length - 1, k + 1)], f = b[0] > a[0] ? cl((t - a[0]) / (b[0] - a[0]), 0, 1) : 0; return [ a[1][i][0] + (b[1][i][0] - a[1][i][0]) * f, a[1][i][1] + (b[1][i][1] - a[1][i][1]) * f ]; }
 function subEvents(S, P, steps) {
  const v = S.pm.vrun(), ev = [], BOX = S.pm.box;
  for (const st of steps) {
   if (!st || !st.off || st.dot == null || !P.frames[0][1][st.dot]) continue;
   const t0 = +st.at || 0, p0 = fAt(P.frames, st.dot, t0), op = S.pm.offPts(st);
   const offTL = S.pm.tl([ p0 ].concat(op ? op.slice(1) : [ BOX() ]), t0, v), tArr = offTL[offTL.length - 1][0];
   let onTL = null, tOn = null;
   const np = S.pm.onPts(st);
   if (st.on && np) { tOn = Math.max(tArr, st.onAt != null ? +st.onAt : tArr); onTL = S.pm.tl(np, tOn, v); }
   ev.push({ st, t0, tArr, tOn, offTL, onTL, tEnd: onTL ? onTL[onTL.length - 1][0] : tArr });
  }
  return ev;
 }
 // fill v421s's preview cache the way its subPlay() would, with a padding loop that always ends
 function prime(d) {
  const S = S4(), P0 = PMo(); if (!S || !P0 || !P0.play || !d) return;
  const P = d.play, PMS = S.PMS;
  if (!P || !Array.isArray(P.frames) || !P.frames.length) return;
  const steps = S.pm.steps(); if (!steps.length) return;
  const key = JSON.stringify(steps) + '|' + P.T + '|' + P.frames.length + '|' + JSON.stringify(P0.play.start);
  if (PMS.pvKey === key && PMS.pvBase === P) { LOG.hits++; return; }
  if (!W0.__rl_no427pm && P.sub427 && P.sub427 === JSON.stringify(steps)) return; // v421s takes its own (loop-free) V42.7 path
  const ev = subEvents(S, P, steps); if (!ev.length) return;
  const F = JSON.parse(JSON.stringify(P.frames));
  let T = P.T; for (const e of ev) T = Math.max(T, e.tEnd + .4);
  if (!isFinite(T)) T = (+P.T || 0) + 30;
  const Tr = Math.round(T * 100) / 100;
  let last = F[F.length - 1], n = 0;
  while (last[0] < Tr - 1e-6) {
   const nt = Math.round(Math.min(Tr, last[0] + .1) * 100) / 100;
   if (!(nt > last[0]) || ++n > 3000) { LOG.capped++; break; }
   const f = JSON.parse(JSON.stringify(last)); f[0] = nt; F.push(f); last = f;
  }
  for (const f of F) for (const e of ev) {
   const t = f[0], i = e.st.dot; if (t < e.t0) continue;
   const q = t <= e.tArr ? pAt(e.offTL, t) : !e.onTL || t < e.tOn ? S.pm.box() : pAt(e.onTL, t);
   f[1][i] = [ Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10 ];
  }
  PMS.pvKey = key; PMS.pvBase = P; PMS.pvEv = ev;
  PMS.pvPlay = { T: Tr, frames: F, passes: P.passes, car0: P.car0 };
  LOG.primed++; LOG.lastT = [ T, Tr, F.length ];
 }
 function pre() {
  if (off()) return;
  try { const P = PMo(), d = P && P.pd42; if (d && d.pv) prime(d); } catch (e) { er(e); }
 }
 const TK0 = W0.pmTick;
 if (typeof TK0 === 'function') W0.pmTick = function () { pre(); return TK0.apply(this, arguments); };
 const DP0 = W0.drawPlaymaker;
 if (typeof DP0 === 'function') W0.drawPlaymaker = function () { pre(); return DP0.apply(this, arguments); };
 W0.V439PV = { LOG, on: () => !off() };
})();
