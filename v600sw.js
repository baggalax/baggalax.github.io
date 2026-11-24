// ===== BAGGA LAX v600sw.js - 1.5 B65: TAP-TO-SWITCH SKIPS RIDERS THE BALL HAS ALREADY BEATEN =====
// Bug:   on defense and during rides, a tap meant as a CHECK sometimes switched control to a teammate far behind the ball.
// Rule (Charlie, final): a teammate is blocked from tap-to-switch only when BOTH are true:
//        (a) he is in the half the ball is being cleared FROM (the clearing team's defensive half, their goalie's end:
//            x > MIDX in world coords, same for every end / both phones), AND
//        (b) he is behind the ball: deeper toward that goal than the ball carrier (x > carrier x).
//        A tap on a blocked teammate is a CHECK by the player you control (game.js dCheck). Everyone else switches as now.
// Cause: game.js inUp (defense) -> dSwitchTo(teammate) took any teammate under the tap (pt.dsw / dPickCss), no position test.
// Fix:   dSwitchTo is wrapped; only while a tap is being handled (inUp) on the defense screen, a blocked teammate turns
//        the switch into dCheck(). Pad switch button, auto-switch, offense: unchanged. Input only, so offline and online
//        run the same rule. Kill switch: window.__rl_no600sw
(function () {
 'use strict';
 const W = window;
 if (typeof W.inUp !== 'function' || typeof W.dSwitchTo !== 'function' || typeof W.dCheck !== 'function') return;
 const LOG = W.__sw600log = { blocked: 0, ok: 0, last: null };
 let inTap = 0;
 const U0 = W.inUp, S0 = W.dSwitchTo;
 W.inUp = function () {
  inTap++;
  try { return U0.apply(this, arguments); } finally { inTap--; }
 };
 function blocked(p) {
  const G = typeof game !== 'undefined' ? game : null;
  if (!G || !p || !G.ball) return false;
  const bx = G.dcar ? G.dcar.x : G.ball.x;
  return p.x > MIDX && p.x > bx;
 }
 W.__sw600blocked = blocked;
 W.dSwitchTo = function (p) {
  if (!W.__rl_no600sw && inTap && screen === 'defense' && p && p.team === 'O') {
   const G = game;
   if (p !== G.dctl && blocked(p)) {
    const r = W.dCheck();
    try { lastTap = { kind: 'check', r: r, via: 'sw600' }; } catch (e) {}
    LOG.blocked++;
    LOG.last = { t: +(G.t || 0).toFixed(2), px: Math.round(p.x), bx: Math.round((G.dcar || G.ball).x), check: r };
    return;
   }
   LOG.ok++;
   LOG.lastOk = { px: Math.round(p.x), bx: Math.round(G.dcar ? G.dcar.x : G.ball.x), mid: MIDX };
  }
  return S0.apply(this, arguments);
 };
})();
