/* v449ride.js - practice RIDES "THEY CLEARED IT" loop fix (Nov 8). Kill switch: window.__rl_no449ride = true.
 * Bug (a player, via Charlie, Nov 8): in PRACTICE > RIDES, after ~5-12 attempts every new attempt ends at once with
 * "THEY CLEARED IT" (WON 0 OF 11, 0 OF 12, ...) - the drill never lets you ride again.
 * Cause: every practice rep ends on a banner, then practice18 setup() rebuilds the field (the CPU clearer gets the
 * ball back by its own goal). v418t's anti-teleport clamp for "banner -> play" restarts treats that rebuild as a
 * teleport and drags each player back toward where he stood when the last rep ended, moving at most his top speed.
 * So each rep starts where the last one finished: the clearer's start creeps toward midfield (x 468 > 436 > 387 >
 * 333 > 299 > 263) until he starts already over the midline, the drill sees the clear done on frame 1 and ends the rep.
 * Fix: a practice drill reset is not a teleport - on a step that leaves a practice banner, v418t's banner restart
 * clamp (its own sub-switch __rl_no418tb) is off for that one step. Real games, online and tutorial: unchanged.
 */
(function () {
 'use strict';
 const W = window;
 if (typeof W.step !== 'function') return;
 const LOG = W.V449R = { n: 0, errs: 0 };
 const off = () => !!W.__rl_no449ride;
 const o = W.step;
 W.step = function () {
  let set = false, prev;
  try {
   const G = typeof game !== 'undefined' ? game : null;
   if (!off() && G && G.practice && !G.online && !G.tutorial && screen === 'banner') {
    prev = W.__rl_no418tb; W.__rl_no418tb = true; set = true;
   }
  } catch (e) { LOG.errs++; }
  try { return o.apply(this, arguments); }
  finally {
   if (set) {
    W.__rl_no418tb = prev;
    try { if (screen !== 'banner') LOG.n++; } catch (e) {}
   }
  }
 };
})();
