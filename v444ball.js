/* v444ball.js - "ghost ball" fix (Nov 7). Kill switch: window.__rl_no444ball = true.
 * Bug: game.js drawBallNow() returns early (draws the ball at the stick head) whenever the
 * carrier is mid-dodge or carrying LEFT-handed, so ballVis12() - which owns the held-ball
 * jump smoother bj287 - is not called on those frames. bj287.bx/by and bj287.held go stale.
 * When the carrier is back to right hand with no dodge (e.g. face dodge / split back to the
 * right), ballVis12 sees all the movement since the last right-hand frame as one "jump"
 * (anything 24..600 px) and holds the drawn ball back there, then flies it into the stick
 * at 160-450 px/s - from off screen after a long left-hand carry.
 * Fix (drawing only): on frames where drawBallNow skips ballVis12, keep the smoother's baseline
 * current and clear any leftover offset; and if ballVis12 has not run for a while, start fresh.
 */
(function () {
 'use strict';
 const W = window;
 const off = () => !!W.__rl_no444ball;
 const V = W.V444B = { n: 0, gap: 0, last: null };
 function skipFrame() {
  try {
   if (typeof game === 'undefined' || !game || !game.ball) return false;
   const b = game.ball, c = game.carrier;
   return screen === 'live' && b.state === 'held' && !!c && (!!c.dodgeA || handOf17(c) === -1);
  } catch (e) { return false; }
 }
 function sync() {
  try {
   if (typeof bj287 === 'undefined') return;
   const b = game.ball;
   if (bj287.x || bj287.y) V.n++;
   bj287.x = 0; bj287.y = 0;
   bj287.bx = b.x; bj287.by = b.y; bj287.held = true;
  } catch (e) {}
 }
 function wire() {
  if (typeof W.drawBallNow !== 'function' || typeof W.ballVis12 !== 'function') return false;
  if (W.drawBallNow.__v444) return true;
  const db0 = W.drawBallNow, bv0 = W.ballVis12;
  const db = function () {
   if (off()) return db0.apply(this, arguments);
   const skip = skipFrame();
   const r = db0.apply(this, arguments);
   if (skip) sync();
   return r;
  };
  db.__v444 = true;
  W.drawBallNow = db;
  W.ballVis12 = function (b) {
   try {
    if (!off() && typeof bv12 !== 'undefined' && typeof bj287 !== 'undefined' && typeof menuT === 'number' && bv12.t && menuT - bv12.t > .25 && bj287.held) {
     // ballVis12 was not run for a while: its baseline is stale, so start fresh (no fake jump)
     bj287.bx = null; bj287.by = null; bj287.x = 0; bj287.y = 0;
     V.gap++;
    }
   } catch (e) {}
   return bv0.apply(this, arguments);
  };
  return true;
 }
 if (!wire()) W.addEventListener('load', wire);
})();
