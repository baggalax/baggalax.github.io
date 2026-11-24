/* v600fb.js - Bagga Lax 1.5f (RULES project, behind window.__rl_rules600): FAST-BREAK DEFENSE
 * Bug (Charlie): after a faceoff win he can run his FOGO straight down the field and score unpressured.
 * Cause: the CPU's fast-break plan (game.js fbPlan222) only starts when the offense has MORE attackers up than the defense
 *   has players back (2v1, 3v2, 4v3...). A lone runner (1 attacker vs a set defense) never qualifies, and the normal
 *   slide waits for a 'drive' timer + a random roll, so it came after the shot.
 * Fix (same function, same place, so online uses the same authority as before - no new messages):
 *   - Numbers break (4v3 etc.): fbPlan222 as before - nearest defender stops the ball, the others split the closest
 *     attackers (sit between two, ready for the pass), the goalie stays home.
 *   - Lone runner in transition (first 7 s of a new possession, past midfield, nobody within 12 of him): the nearest
 *     CPU defender SLIDES at once (goal-side of the ball, a little faster than a normal defender), the goalie calls it
 *     ("fireCall"), everyone else keeps their man.
 * Kill switch: window.__rl_no600fb (and the whole project: window.__rl_rules600 = false)
 */
(function () {
 const Wn = window;
 if (Wn.__rl_rules600 === false || typeof Wn.fbPlan222 !== 'function') return;
 const f0 = Wn.fbPlan222, ST = Wn.FB600 = { slides: 0, plans: 0, last: null };
 Wn.fbPlan222 = function (G, c, b, offT, defT, gx, dir, excl) {
  const r = f0.apply(this, arguments);
  try {
   if (Wn.__rl_no600fb || !G || G.tutorial || G.brave || G.practice || !c || !b || b.state !== 'held') return r;
   // possession clock: a new carrier team = a new possession
   if (G.__fbTeam600 !== c.team) { G.__fbTeam600 = c.team; G.__fbT600 = G.t || 0; G.__fbSlide600 = null; }
   G.__fbPlan600 = r || null; G.__fbPlanT600 = G.t;
   if (r) ST.plans++;
   if (defT !== 'D' || c.team !== offT) return r;
   const age = (G.t || 0) - (G.__fbT600 || 0), toGoal = Math.hypot(gx - c.x, CY - c.y);
   if (age > 7 || (c.x - MIDX) * dir < -4 || toGoal < 14 || toGoal > 160) { G.__fbSlide600 = null; ST.why = 'zone ' + age.toFixed(1) + ' ' + Math.round(toGoal); return r; }
   const defs = G.players.filter(p => p.team === defT && !p.gk && !(p.down > 0) && !(p.stun > 0) && p !== excl);
   if (!defs.length) return r;
   let d0 = G.__fbSlide600 && defs.includes(G.__fbSlide600) ? G.__fbSlide600 : null;
   if (!d0) {
    const near = defs.reduce((m, p) => Math.min(m, Math.hypot(p.x - c.x, p.y - c.y)), 1e9);
    if (near < 12) { ST.why = 'near ' + Math.round(near); return r; } // already pressured
    if (r) { const top = [...r.keys()].sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0]; if (top) d0 = top; }
    if (!d0) { const gs = defs.filter(p => (p.x - c.x) * dir > -2), pool = gs.length ? gs : defs; d0 = pool.slice().sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0]; } // goal-side defenders first
    G.__fbSlide600 = d0; ST.slides++; ST.last = { t: G.t, d: d0.id || d0.pos, age: +age.toFixed(2), dist: Math.round(Math.hypot(d0.x - c.x, d0.y - c.y)) };
    try { if (typeof fireCall === 'function' && G.goalie) fireCall(G.goalie); } catch (e) {}
   }
   const dx = gx - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1, sp = (typeof PACE !== 'undefined' && PACE.dBall ? PACE.dBall : 40) * 1.2;
   const plan = r || new Map; plan.set(d0, [c.x + dx / L * 5, c.y + dy / L * 5, sp]); // goal-side of the ball
   G.__fbPlan600 = plan;
   G.slide = d0; // the game's own slide flag: the post-faceoff pickup (h5Pickup) and 'calm' reset leave a slider alone
   return plan;
  } catch (e) { ST.err = String(e); return r; }
 };
 // the post-faceoff pickup (game.js h5Pickup) pulls every marked defender back to his man; during a fast break the
 // break plan (slide + split) wins for the defenders in it
 if (typeof Wn.h5Pickup === 'function') { const h0 = Wn.h5Pickup; Wn.h5Pickup = function (G) { const r = h0.apply(this, arguments); try { const P = !Wn.__rl_no600fb && G && G.__fbPlanT600 === G.t && G.__fbPlan600; if (P) for (const [d, q] of P) { if (d.react > 0 || d.stun > 0 || d.down > 0) continue; d.tx = q[0]; d.ty = q[1]; d.spd = q[2]; } } catch (e) {} return r; }; }
})();
