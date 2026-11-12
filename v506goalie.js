/* v506goalie.js - V50.6 (Bagga Lax 1.3): an OPEN, quick, fully pulled-back shot from outside can actually beat the CPU goalie.
 * Kill switch: window.__rl_no506gk = true -> exactly like before (checked on every shot, so it can be flipped live).
 * Charlie (Nov 11, 6:51 PM): "on the hardest modes like nasty and bagga it's really hard to score like i get saved every
 *  time can you make it a lil easier mostly from like range shots with the pull back they almost never go"; (7:00 PM)
 *  "Should be more than that honestly" / "You need to be able to score from range." / "If you're not too far, especially if
 *  you place an open shot and don't stare it down, it should go."
 * Measured before (headless, the real SHOT26 pull-back path, full pull, defender 18 px off, blocks left out): an open-corner
 *  quick release from the top of the box / wings (~80 px) went in SQUID 41%, FISH 39%, BEGINNER 38%, GROSS 18%, NASTY 16%,
 *  BAGGATWAAN 14%; from ~115 px NASTY/BAGGATWAAN ~6%. On NASTY+ game.js aimSave14 (70-74% save on any corner from outside
 *  OUT14.r) and v452hard's extra-save roll (up to 45% x K.gk from 50+ px) stack on top of the goalie's reach.
 * Fix (offline games vs the CPU goalie only): when YOUR shot leaves the stick from K.minD px or farther, aimed at a corner
 *  (a SHOT26 corner circle, or a keyboard / controller corner shot) and pulled back hard, the goalie is beaten clean with chance
 *    K.beat[difficulty] x power x distance x open x quick
 *   power:    0 below K.p0, 1 at K.p1+ (full pull)
 *   distance: 1 out to K.d1 (top of the box), then down to K.dFar at K.d2+ (very long shots go less)
 *   open:     how far the aim point is from the goalie (y): 1 at K.o1+ px (open corner / far side), K.oAt at K.o0 or closer (at him)
 *   quick:    SHOT26's own stare clock (time the aim was held still after the pull): 1 up to K.s0 s, down to K.sMin at K.s1 s
 *             ("stared it down" - the goalie is set). Changing the aim restarts that clock, so re-aim + quick release still works.
 *             Keyboard / controller shots have no aim clock: quick = 1.
 *  "Beaten" is the game's own beaten-goalie state (the one SHOT26's near-post beat and quick-release beat already use): no reach,
 *  no read, no extra-save roll. The shot still has to be on target: pipes, blocks and misses happen exactly as before.
 * Not touched: center / between shots, weak shots, shots from inside K.minD (crease chances, tap-ins - see v507fake), the CPU's
 *  shots on your goalie, online games (game.online / RLNET.inGame), tutorial, practice, brave mode.
 * No ids, rl_* keys or net messages change. Random numbers: one extra draw only on a qualifying shot.
 */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v506gk_loaded) return;
 W.__rl_v506gk_loaded = 1;
 const off = () => !!(W.__rl_no506gk || W.__rl_v124gb);
 // beat: per difficulty [SQUID, FISH, BEGINNER, GROSS, NASTY, BAGGATWAAN]
 const K = { beat: [ .36, .4, .31, .39, .34, .22 ], minD: 55, p0: .5, p1: .9, d1: 95, d2: 135, dFar: .45,
  o0: 2, o1: 5.5, oAt: .15, s0: .5, s1: 1.2, sMin: .25 };
 const ST = { seen: 0, elig: 0, beat: 0, byLvl: [ 0, 0, 0, 0, 0, 0 ], last: null, errs: [] };
 W.V506GK = { K: K, ST: ST, on: () => !off() };
 if (off()) return;
 const L0 = W.updateLive;
 if (typeof L0 !== 'function') return;
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const okG = G => !!G && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !G.practice && !G.brave && !(W.RLNET && RLNET.inGame) && !off();
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const ramp = (v, a, b) => cl((v - a) / (b - a), 0, 1);
 function check(G) {
  const b = G.ball;
  if (!b || b.state !== 'shot' || b.v506 || !b.shooter || b.shooter.team !== 'O') return;
  b.v506 = 1;
  ST.seen++;
  if (b.pipe || b.block || (G.lastShot && G.lastShot.flub)) return;
  const lv = (typeof DF !== 'undefined' && DF.level != null) ? DF.level : -1, pb = K.beat[lv];
  if (!(pb > 0)) return;
  const f = b.shotFrom || [ b.x, b.y ], d = Math.hypot(GX - f[0], CY - f[1]);
  if (d < K.minD) return;
  let corner, held = 0;
  if (b.s25) {
   const L = W.SHOT26 && SHOT26.S && SHOT26.S.last;
   corner = !!L && L.place === 'circle' && L.type === 'SHOT' && !L.short;
   held = L && L.stare && typeof L.stare.held === 'number' ? L.stare.held : 0;
  } else corner = !!b.target && Math.abs(b.target.y - CY) >= 4;   // keyboard / controller: always a corner target
  if (!corner) return;
  const fp = ramp(b.power || 0, K.p0, K.p1);
  if (!(fp > 0)) return;
  const gk = G.goalie, ay = b.target && typeof b.target.y === 'number' ? b.target.y : CY;
  const gap = gk ? Math.abs(ay - gk.y) : K.o1;
  const fd = 1 - (1 - K.dFar) * ramp(d, K.d1, K.d2);
  const fo = K.oAt + (1 - K.oAt) * ramp(gap, K.o0, K.o1);
  const fq = 1 - (1 - K.sMin) * ramp(held, K.s0, K.s1);
  const p = pb * fp * fd * fo * fq;
  ST.elig++;
  ST.last = { lv: lv, d: +d.toFixed(1), gap: +gap.toFixed(1), held: +held.toFixed(2), p: +p.toFixed(3) };
  if (Math.random() >= p) return;
  if (gk) { gk.reach = .001; gk.react = 9; }
  b.aim14 = null;
  b.v452 = true;   // v452hard's extra-save roll: skipped for this shot
  if (b.s25) { b.s25.own = false; b.s25.read = false; }
  ST.beat++; ST.byLvl[lv]++; ST.last.beat = true;
 }
 W.updateLive = function (dt) {
  try { const G = G0(); if (okG(G) && SCR() === 'live') check(G); } catch (e) { if (ST.errs.length < 5) { ST.errs.push(String(e && e.message || e)); console.warn('v506gk', e); } }
  return L0.apply(this, arguments);
 };
})();
