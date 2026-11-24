'use strict';
/* v582shot - Bagga Lax 1.4 (Friday). FIX 8: no NEW pull-back shot while the shooting circles are up.
   Bug (Charlie): near the cage / at X / on GLE he kept firing a pull-back shot when he meant to dodge.
   Rule (Charlie, final): ANYWHERE on the field, while the yellow shooting circles are up, a pull-back shot cannot START;
   the way to shoot then is tapping a circle. A pull-back that started BEFORE the circles came up (wound up from range and
   carried in) still fires. With no circles up, pull-back shots work exactly as before.
   Cause: SHOT26.down starts an aim for any press on the cage box / a circle (and v483 starts one anywhere for a mouse);
   SHOT26.up fires a pull-back shot whenever the drag passed CFG.pullMin, circles or not.
   Fix (touch + mouse only; the input layer, so CPU shots, the net protocol and online sync are untouched):
   - a press made while the circles are up: v483's "pull from anywhere" mouse aim is not started at all (it can only be a
     pull-back), so the press falls through to the game's other handlers (dodge swipe, joystick, pass);
   - any other aim started while the circles are up (a circle / cage press) is marked; the moment its drag passes
     CFG.pullMin it is dropped (no aim string, no shot). A plain tap on a circle (or the cage) still shoots as before.
   Note: the pull-back-and-return FACE DODGE also needs a pull, so it is not available while the circles are up.
   Kill switch: window.__rl_no582shot (read live). No storage, ids or protocol touched. */
(function () {
 const W = window;
 const off = () => !!(W.__rl_no582shot || W.__rl_v124gb);
 const SH = W.SHOT26;
 const ST = W.V582S = { blockedStart: 0, dropped: 0, marked: 0, err: [] };
 if (!SH || typeof SH.down !== 'function' || typeof SH.move !== 'function' || !SH.S) return;
 const circ = () => {
  try { return typeof screen !== 'undefined' && screen === 'live' && canShoot() && !SH.S.aim && !!SH.circlesOn(); } catch (e) { return false; }
 };
 const D0 = SH.down;
 SH.down = function (pt, p) {
  if (off()) return D0.apply(this, arguments);
  const up = circ(), role = pt && pt.role, cs = pt && pt.cageStart, an = pt && pt.any483;
  const r = D0.apply(this, arguments);
  try {
   const A = SH.S.aim;
   if (r && up && A && pt && A.id === pt.id) {
    if (A.any483) {   // mouse "pull from anywhere": only ever a pull-back shot -> not while the circles are up
     SH.S.aim = null;
     pt.role = role; pt.cageStart = cs; pt.any483 = an;
     ST.blockedStart++;
     return false;
    }
    A.c582 = 1;
    ST.marked++;
   }
  } catch (e) { if (ST.err.length < 10) ST.err.push('down: ' + e.message); }
  return r;
 };
 const M0 = SH.move;
 SH.move = function (pt) {
  const r = M0.apply(this, arguments);
  try {
   const A = SH.S.aim;
   if (!off() && A && A.c582 && pt && A.id === pt.id) {
    const k = pt.k || (typeof SCALE === 'number' ? SCALE : 1), min = SH.CFG && SH.CFG.pullMin || 20;
    if (Math.max(A.maxPull || 0, Math.max(0, A.ax - A.tx) * k) >= min) { SH.S.aim = null; ST.dropped++; }
   }
  } catch (e) { if (ST.err.length < 10) ST.err.push('move: ' + e.message); }
  return r;
 };
})();
