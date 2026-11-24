/* v566far.js - the far half of the field stays alive (Bagga Lax 1.4, Nov 18 2026). Kill switch: window.__rl_no566far = true.
 * Bug (Charlie): while the play is on one half, the players on the other half froze until the ball crossed midfield.
 * Cause: farTick (game.js) only moves a far attackman / rider when the ball is on his half (`onSide`); otherwise he
 * stands on his rest spot. His far defender marks him (f.mk), so the defender froze too. Nothing watched for a break.
 * Fix (no new rules, no new storage keys, no network change; onside / offside clamps in farTick still run):
 *  1. Far attackmen keep working while the ball is on the other half: every 1.4-2.8 s each picks a new spot in his
 *     own zone that gets him away from his defender (cuts, rotations, V-cuts toward the midline when his team might
 *     get the ball: shot, loose ball, save, his team clearing). They still use farTick's own speed and drift.
 *  2. Far defenders already mark their man (farTick D branch + gs2403), so they now follow, react and stay goal side.
 *  3. Hot guy: when the other team has the ball (or it is loose / shot) on the far side and heading toward this half,
 *     the far D nearest the middle sags toward the hole in front of his goal, ready to slide on a fast break.
 * Tutorial, BRAVEHEART, faceoffs and the v124 gameboy build: unchanged. Online: the host's far players are sent in
 * the snapshot as before (net.js), so both phones see the same field. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v566_loaded) return;
 W.__rl_v566_loaded = 1;
 const LOG = W.V566F = { cuts: 0, hot: 0, frames: 0, errs: 0, err: null };
 if (typeof W.farTick !== 'function') return;
 const off = () => !!W.__rl_no566far || !!W.__rl_v124gb;
 const okG = G => !!G && !!G.farU && !!G.farC && !!G.ball && !G.tutorial && !G.brave && !G.over && G.farMode !== 'fo';
 const R = (a, b) => a + Math.random() * (b - a);
 const cl = (v, a, b) => Math.max(a, Math.min(b, v));
 const isRide = f => f.role === 'A' || f.role === 'R';
 // which team has the ball: 'U' (you) / 'C' (cpu) / null (loose, shot, pass in the air)
 function poss(G) {
  const car = screen === 'live' ? G.carrier : G.dcar;
  if (!car || !G.ball || G.ball.state !== 'held') return null;
  return car.team === 'O' || car.team === 'G2' ? 'U' : 'C';
 }
 // team t attacks the goal at x = GX (U) or DGX (C); its far attackmen live on that half
 const zone = t => t === 'U' ? [ MIDX + 10, GX - 18 ] : [ DGX + 18, MIDX - 10 ];
 function pickSpot(G, f, mates, show) {
  const z = zone(f.team), base = f.w566b, d = (f.team === 'U' ? G.farC : G.farU).find(q => q.mk === f);
  const towardMid = f.team === 'U' ? -1 : 1;
  if (show) return [ cl(MIDX - towardMid * 16 + R(-6, 6), z[0], z[1]), cl(f.y + R(-26, 26), FT + 16, FB - 10) ];
  let best = null, bs = -1e9;
  for (let k = 0; k < 7; k++) {
   const x = cl(base[0] + R(-46, 46), z[0], z[1]), y = cl(base[1] + R(-38, 38), FT + 16, FB - 10);
   let s = (d ? Math.min(60, Math.hypot(x - d.x, y - d.y)) : 30) - .25 * Math.hypot(x - base[0], y - base[1]);
   for (const m of mates) if (m !== f) s -= Math.max(0, 34 - Math.hypot(x - m.x, y - m.y)) * 1.5;
   if (Math.hypot(x - f.x, y - f.y) < 10) s -= 12;
   if (s > bs) { bs = s; best = [ x, y ]; }
  }
  return best;
 }
 const o = W.farTick;
 W.farTick = function (dt) {
  let G = null, moved = null;
  try {
   G = typeof game !== 'undefined' ? game : null;
   if (!off() && okG(G) && dt > 0 && (screen === 'live' || screen === 'defense')) {
    const b = G.ball, p = poss(G);
    moved = [];
    LOG.frames++;
    for (const t of [ 'U', 'C' ]) {
     const mates = (t === 'U' ? G.farU : G.farC).filter(isRide);
     for (const f of mates) {
      if (!f.rest) continue;
      const onSide = f.team === 'C' ? b.x < MIDX : b.x > MIDX;
      if (onSide || f.chase || f.cut181 || (f.clrT && G.cset) || (G.rideX && G.rideX.get(f)) || f.down > 0) { f.w566 = null; f.w566b = null; continue; }
      if (!f.w566b) f.w566b = f.rest.slice();
      const show = p === f.team || p === null && b.state !== 'pass';
      const w = f.w566;
      if (!w || G.t >= w.until || w.show !== show) {
       const s = pickSpot(G, f, mates, show);
       f.w566 = { x: s[0], y: s[1], until: G.t + R(1.4, 2.8), show: show };
       LOG.cuts++;
      }
      moved.push([ f, f.rest ]);
      f.rest = [ f.w566.x, f.w566.y ];
     }
    }
   }
  } catch (e) { moved = null; LOG.errs++; LOG.err = String(e && e.message || e).slice(0, 160); }
  let r;
  try { r = o.apply(this, arguments); } finally { if (moved) for (const [ f, rs ] of moved) f.rest = rs; }
  if (!moved) return r;
  try { hotGuy(G, dt); } catch (e) { LOG.errs++; LOG.err = String(e && e.message || e).slice(0, 160); }
  return r;
 };
 // the hot guy: one far D sags into the hole when a break could come at his goal
 function hotGuy(G, dt) {
  const b = G.ball, p = poss(G);
  for (const t of [ 'U', 'C' ]) {
   const gx = t === 'U' ? DGX : GX, dir = t === 'U' ? -1 : 1; // dir: toward this team's goal
   const ds = (t === 'U' ? G.farU : G.farC).filter(f => f.role === 'D' && !(f.down > 0) && !f.m451 && !(f.clrT && G.cset) && !(G.rideX && G.rideX.get(f)));
   for (const f of ds) if (f.hot566 && !ds.includes(f)) f.hot566 = false;
   const ballFar = t === 'U' ? b.x > MIDX : b.x < MIDX;
   const threat = ballFar && (p !== null ? p !== t : b.state !== 'pass') && Math.abs(b.x - MIDX) < 150;
   let hot = null;
   if (threat && ds.length >= 2) hot = ds.slice().sort((a, c) => Math.abs((a.mk ? a.mk.y : a.y) - CY) - Math.abs((c.mk ? c.mk.y : c.y) - CY))[0];
   for (const f of ds) f.hot566 = f === hot;
   if (!hot) continue;
   const m = hot.mk;
   const urg = cl(1 - Math.abs(b.x - MIDX) / 150, .25, 1);
   const hx = gx - dir * 34, hy = CY + (b.y - CY) * .15;
   const mx = m ? m.x - dir * 11 : hot.x, my = m ? m.y : hot.y;
   const tx = mx + (hx - mx) * .5 * urg, ty = my + (hy - my) * .5 * urg;
   const dx = tx - hot.x, dy = ty - hot.y, d = Math.hypot(dx, dy), s = Math.min(d, 26 * dt);
   if (d > .4) { hot.x += dx / d * s; hot.y += dy / d * s; hot.anim = (hot.anim || 0) + s; }
   hot.x = t === 'U' ? Math.min(hot.x, MIDX - 4) : Math.max(hot.x, MIDX + 4);
   LOG.hot++;
  }
 }
})();
