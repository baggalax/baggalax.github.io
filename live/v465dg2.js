// v465dg2.js - V46.5: the "diagonal / synced player" fix, part 2 (kill switch: window.__rl_no465dg2 = true).
// Charlie (Nov 9 12:29 PM, app 1.1, BAGGATWAAN): "Diagonal glitch happened again tried to hit someone on a clear".
// Root cause (game.js updateDefense, the RIDER branch at the top of the defenders loop, L24114-24117):
//   if (d.r26 && !(d === G.dctl && G.run) && b.state !== 'loose') { moveTo(d, Math.max(MIDX + 3, t.x + 6), t.y, PACE.dBall, dt); continue; }
// On a CPU clear the guy you control is usually one of your riding ATTACKMEN, promoted onto the field for the ride
// (r26Promote, via dTake(..., 'clear') at the clear start and the v38d auto-switch). The moment your thumb leaves the
// stick - and it does, because HIT is a press-and-HOLD on the right pad - that branch moves him to 6 px directly
// BEHIND the carrier at the carrier's own height: he rides on the clearer's back heel, copying every step and every
// diagonal cut (the "sync" / "diagonal"), and near midfield the target clamps to MIDX + 3 so he slides up and down the
// midline mirroring the carrier. And because he is behind the carrier (fromBehind, L17146, vs the carrier's facing),
// every HIT you throw from there is PUSHING - so "trying to hit someone on the clear" never works.
// Why v441dg missed it: v441dg only rewrites the man-to-man move (it requires p.t30 to equal the move target, and
// t30 is only written at L24237); the rider branch runs BEFORE that block and `continue`s, so v441dg never sees it,
// and v441dg's guard is about a DEFENDER marking the carrier, not a promoted attackman riding him.
// Fix: only YOUR controlled guy (G.dctl), only a promoted rider (p.r26), only thumb off the stick, only offline vs the
// CPU, only that exact rider move: instead of the spot on the carrier's back he rides him from the FRONT shoulder
// (the side toward the midline he is clearing to), with an 11-13 px cushion (he plays him, he is not on him), steps off
// for 0.8 s after 1 s jammed close, never past MIDX + 3 (offsides line unchanged), and uses the game's catch-up pace
// (PACE.chase * .85) until he is level so he stops trailing. Touch the stick and he is yours again exactly as before.
// Hits from the front are legal again, so knockdowns happen. No ids, storage keys, net messages or fields change.
(function () {
 'use strict';
 const W0 = window;
 if (typeof W0.moveTo !== 'function' || typeof W0.updateDefense !== 'function') { W0.V465DG2 = { on: () => false, why: 'no hooks' }; return; }
 const off = () => !!W0.__rl_no465dg2 || !!W0.__rl_v124gb;
 const LOG = { ride: 0, catchUp: 0, back: 0, skip: 0, err: 0, last: null };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const H = new WeakMap();
 let ST = null, inDef = 0;
 function lagged(G, c, lag) {
  let h = H.get(c);
  if (!h || h.G !== G) { h = { G: G, a: [] }; H.set(c, h); }
  const a = h.a;
  if (!a.length || a[a.length - 1][0] !== G.t) a.push([ G.t, c.x, c.y ]);
  while (a.length > 2 && a[1][0] <= G.t - lag) a.shift();
  return a[0];
 }
 function want(G, p, x, y) {
  if (off() || !inDef || !G || G.online || G.tutorial || G.brave || G.practice || scr() !== 'defense') return false;
  if (!p || p !== G.dctl || !p.r26 || G.run || p.down > 0 || p.stun > 0) return false;
  const b = G.ball, c = G.dcar;
  if (!b || b.state !== 'held' || !c || c === p || c.down > 0) return false;
  // exactly the rider move: (max(MIDX + 3, c.x + 6), c.y)
  if (Math.abs(x - Math.max(MIDX + 3, c.x + 6)) > 1e-6 || Math.abs(y - c.y) > 1e-6) return false;
  return true;
 }
 function target(G, p, c, dt) {
  const step = dt || 1 / 60;
  if (!ST || ST.G !== G || ST.d !== p || ST.c !== c || G.t - ST.lastT > .5) ST = { G: G, d: p, c: c, sd: 0, near: 0, back: 0, lastT: G.t };
  ST.lastT = G.t;
  // the carrier is clearing toward the midline / your goal: "front" is that way
  let ux = DGX - c.x, uy = CY - c.y; const L = Math.hypot(ux, uy) || 1; ux /= L; uy /= L;
  const px = -uy, py = ux;
  const along = (p.x - c.x) * ux + (p.y - c.y) * uy, d = Math.hypot(p.x - c.x, p.y - c.y);
  const rel = (p.x - c.x) * px + (p.y - c.y) * py;
  if (!ST.sd) ST.sd = rel < 0 ? -1 : 1;
  const s = lagged(G, c, .05), ph = (p.pl && p.pl.id ? p.pl.id.length * 1.7 : 1);
  let a0, r;
  if (ST.back > 0) { ST.back -= step; a0 = 1.3; r = 13; LOG.back++; }
  else {
   a0 = .55 + Math.sin(G.t * 2.1 + ph) * .2; r = 12 + Math.sin(G.t * 2.9 + ph) * .8;
   if (d < 8) { ST.near += step; if (ST.near > 1) { ST.near = 0; ST.back = .8; } } else ST.near = Math.max(0, ST.near - step * .5);
  }
  const ca = Math.cos(a0), sa = Math.sin(a0) * ST.sd;
  let tx = s[1] + (ux * ca + px * sa) * r, ty = s[2] + (uy * ca + py * sa) * r;
  const lim = MIDX + 3;
  if (tx < lim) {           // the offsides line: hold at it, beside him rather than on him
   tx = lim;
   if (Math.abs(ty - c.y) < 9 && c.x - lim < 9) ty = c.y + ST.sd * 9;
  }
  LOG.ride++; LOG.last = { t: +G.t.toFixed(2), d: +d.toFixed(1), along: +along.toFixed(1), tx: Math.round(tx), ty: Math.round(ty) };
  const spd = along < 4 && d < 22 ? PACE.chase * .85 : 0;
  if (spd) LOG.catchUp++;
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
 W0.V465DG2 = { on: () => !off(), LOG: LOG };
})();
