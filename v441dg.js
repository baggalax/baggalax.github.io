// v441dg.js - V44.1: the "diagonal / synced player" fix (kill switch: window.__rl_no441dg = true).
// Charlie (Nov 4 10:24 PM): "My player synced to the defender and is like slanted, this is after I lost the ball".
// Charlie (Nov 5 11:34 AM): "The sync glitch where my player goes diagonal happened again. I knocked someone over on
// my side and started checking them while they were on the ground, and then it happened."
// Root cause (game.js updateDefense, the man-to-man block at the end of the defenders loop): when your thumb is off the
// stick (G.run null: you are tapping CHECK / HIT) your controlled defender is moved by the plain man-marking code. If his
// man is the carrier it aims 5 px goal-side of him (tight = min(tight, 5)); the sag cushion that normally loosens that is
// skipped because sagLive() is false during any clear. On a CPU clear the carrier runs AWAY from your goal, so your guy
// is behind him and can never reach the goal-side spot: he trails on the carrier's back, held at the 4 px player spacing,
// copying every step (the "sync"), facing his unreachable target (the "diagonal" look). Knock a guy down and keep
// tapping check: the ball pops, the CPU scoops and clears, your thumb is off the stick, and your guy welds to the clearer.
// V38 (v38d.js R2) fixed the mirror image (the CPU's on-ball rider on YOUR clearer); your own guy never got it.
// Fix: only for YOUR controlled defender, only while your thumb is off the stick, only when he is on the carrier and
// NOT already goal-side of him: instead of the unreachable spot behind-the-back, he plays the carrier's front shoulder
// with a cushion (9-11 px, reads the carrier 0.2 s late, steps off for 0.8 s after 1 s jammed close) - the same ride
// V38 gives the CPU - and, until he is in front of him, the game's own catch-up pace (PACE.chase * .85, as V26 catch26) so he
// gets level instead of trailing on the carrier's back. Touch the stick and he is yours again exactly as before. Offline only (online the viewer's own
// guy is already covered by v38d/v39d on the authority); no ids, no storage keys, no net messages or fields change.
(function () {
 'use strict';
 const W0 = window;
 if (typeof W0.moveTo !== 'function' || typeof W0.updateDefense !== 'function') { W0.V441DG = { on: () => false, why: 'no hooks' }; return; }
 const off = () => !!W0.__rl_no441dg || !!W0.__rl_v124gb;
 const LOG = { ride: 0, back: 0, flip: 0, skipGoalSide: 0, err: 0, last: null };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const H = new WeakMap();   // carrier position history (for the 0.2 s read)
 let ST = null;             // { G, d, c, sd, near, back, flipT, lastT }
 let inDef = 0;             // inside updateDefense (the only caller we change)
 function lagged(G, c, lag) {
  let h = H.get(c);
  if (!h || h.G !== G) { h = { G: G, a: [] }; H.set(c, h); }
  const a = h.a;
  if (!a.length || a[a.length - 1][0] !== G.t) a.push([ G.t, c.x, c.y ]);
  while (a.length > 2 && a[1][0] <= G.t - lag) a.shift();
  return a[0];
 }
 function want(G, p, x, y) {
  if (off() || !inDef || !G || G.online || G.tutorial || G.brave || scr() !== 'defense') return false;
  if (p !== G.dctl || G.run || !p.t30 || p.t30[0] !== x || p.t30[1] !== y) return false;   // only the man-D move of your own guy, thumb off
  const b = G.ball, c = G.dcar;
  if (!b || b.state !== 'held' || !c || c === p || p.mark !== c || c.down > 0 || p.down > 0 || p.stun > 0) return false;
  if (G.dSlide === p || (G.dclear && G.dclear.holder === p)) return false;
  return true;
 }
 function target(G, p, c, dt) {
  const gx = DGX, gy = CY;
  let ux = gx - c.x, uy = gy - c.y; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;   // carrier -> your goal
  const along = (p.x - c.x) * ux + (p.y - c.y) * uy, d = Math.hypot(p.x - c.x, p.y - c.y);
  if (!ST || ST.G !== G || ST.d !== p || ST.c !== c || G.t - ST.lastT > .5) ST = { G: G, d: p, c: c, sd: 0, near: 0, back: 0, flipT: 0, jam: 0, glueT: 0, ride: 0, cx: c.x, cy: c.y, lastT: G.t };
  const step0 = dt || 1 / 60, cv = Math.hypot(c.x - ST.cx, c.y - ST.cy) / step0; ST.cx = c.x; ST.cy = c.y; ST.lastT = G.t;
  // stuck to him: in contact (< 6 px, the 4 px spacing) while he keeps running (> 8 px/s) - whichever side he is on
  if (d < 6 && cv > 8) ST.glueT += step0; else if (d >= 7) ST.glueT = Math.max(0, ST.glueT - step0 * 2);
  if (ST.glueT >= .75) { ST.ride = 1.2; ST.glueT = 0; LOG.glued = (LOG.glued || 0) + 1; }
  if (ST.ride > 0) ST.ride -= step0;
  if (cv > 8 && d < 16) ST.ride = Math.max(ST.ride, .4);                                  // he is running with your guy on him
  if (!(along <= 1 && d < 16) && !(ST.ride > 0)) { LOG.skipGoalSide++; return null; }        // he stands still / you are clear of him: old code
  const step = step0;
  const px = -uy, py = ux;                                                                // perpendicular
  const rel = (p.x - c.x) * px + (p.y - c.y) * py;
  if (!ST.sd || (!(ST.flipT > 0) && rel * ST.sd < 0 && Math.abs(rel) > 5)) ST.sd = rel < 0 ? -1 : 1;
  ST.flipT -= step;
  if (d < 5.5) ST.jam += step; else ST.jam = Math.max(0, ST.jam - step);
  if (ST.jam > .6 && ST.flipT <= 0) { ST.jam = 0; ST.flipT = 1; ST.sd = -ST.sd; ST.back = Math.max(ST.back, .6); LOG.flip++; }
  const s = lagged(G, c, .2), ph = (p.pl && p.pl.id ? p.pl.id.length * 1.7 : 1);
  let a0, r;
  if (ST.back > 0) { ST.back -= step; a0 = 1.25; r = 13; LOG.back++; }
  else {
   const nearCage = Math.hypot(c.x - gx, c.y - gy) < 70;
   a0 = .62 + Math.sin(G.t * 2.1 + ph) * .2; r = (nearCage ? 8.5 : 10) + Math.sin(G.t * 2.9 + ph) * .8;
   if (d < 10) { ST.near += step; if (ST.near > 1.05) { ST.near = 0; ST.back = .8; } } else ST.near = Math.max(0, ST.near - step * .5);
  }
  const ca = Math.cos(a0), sa = Math.sin(a0) * ST.sd;                                     // front shoulder: goal side, off to one side
  const tx = s[1] + (ux * ca + px * sa) * r, ty = s[2] + (uy * ca + py * sa) * r;
  LOG.ride++; LOG.last = { t: +G.t.toFixed(2), d: +d.toFixed(1), along: +along.toFixed(1), tx: Math.round(tx), ty: Math.round(ty) };
  // beside / behind him he cannot reach the shoulder at his marking pace (19 vs the carrier's 23): the game's own catch-up
  // pace (the V26 catch26 rule, PACE.chase * .85) until he is in front, so he stops copying the carrier's steps
  const spd = along < 4 && d < 16 ? PACE.chase * .85 : 0;
  if (spd) LOG.catchUp = (LOG.catchUp || 0) + 1;
  return [ tx, ty, spd ];
 }
 const MV0 = W0.moveTo;
 W0.moveTo = function (p, x, y, spd, dt) {
  try {
   const G = game;
   if (want(G, p, x, y)) { const q = target(G, p, G.dcar, dt); if (q) { x = q[0]; y = q[1]; if (q[2] && q[2] > spd) spd = q[2]; } }
  } catch (e) { LOG.err++; }
  return MV0.call(this, p, x, y, spd, dt);
 };
 const UD0 = W0.updateDefense;
 W0.updateDefense = function () { inDef++; try { return UD0.apply(this, arguments); } finally { inDef--; } };
 W0.V441DG = { on: () => !off(), LOG: LOG };
})();
