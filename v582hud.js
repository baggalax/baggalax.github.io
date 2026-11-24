'use strict';
/* v582hud - Bagga Lax 1.4 (Friday). FIX 6: in-game HUD placement.
   Bug (Charlie): PLAYBOOK, CHIRP, SET, D-SET and SUB sit on the field and block taps on players; PAUSE sits on the field.
   Cause: on home-indicator iPhones the game lifts every bottom HUD item by a 34 px bottom inset (v41ios flag
   __rl_safeb2403 = 34, and game.js sa2403Insets uses max(env, 34)), but Apple's real landscape bottom safe area is 21 pt.
   That extra 13 px (~6 game px) pushes the whole bottom row up onto the field.
   Fix: during live play screens only (faceoff / live / defense / banner / cpu, not paused, not menus or the final
   screen), sa2403Dy measures against a 21 px bottom inset, so every bottom-row button (they all use sa2403Dy, and the
   hit rects with them) drops ~6 game px toward the sideline and still ends above the home-indicator safe area.
   Phones with no home indicator (inset 0) are unchanged (the row already sits on the bottom edge).
   PAUSE (v463pz box, also used by practice) moves up from the field's top edge (y 33) onto the BAGGA LAX board (y 17),
   same x, same size, still fully on screen and clear of the score bar (ends at y 16) and TIMEOUT (x >= 96).
   Kill switches (read live): window.__rl_no582hud (both), __rl_no582low, __rl_no582pause. No ids / keys / protocol. */
(function () {
 const W = window;
 const off = k => !!(W.__rl_no582hud || W.__rl_v124gb || W[k]);
 const ST = W.V582H = { low: 0, err: [] };
 const LIVE = { faceoff: 1, live: 1, defense: 1, banner: 1, cpu: 1 };
 const B21 = 21;
 try {
  if (typeof W.sa2403Dy === 'function' && typeof W.sa2403 === 'function') {
   const D0 = W.sa2403Dy;
   W.sa2403Dy = function (y, hh) {
    try {
     if (!off('__rl_no582low') && typeof screen !== 'undefined' && LIVE[screen] && !(typeof paused !== 'undefined' && paused) && typeof game !== 'undefined' && game) {
      const s = sa2403();
      if (s && s.db > 0 && s.b > B21 && typeof SCALE === 'number' && SCALE > 0) {
       const db = Math.max(0, s.db - (s.b - B21) / SCALE);
       ST.low++;
       return db > 0 ? Math.max(0, Math.ceil(y + hh - (H - db))) : 0;
      }
     }
    } catch (e) { if (ST.err.length < 10) ST.err.push('dy: ' + e.message); }
    return D0.apply(this, arguments);
   };
  }
 } catch (e) { ST.err.push('dy0: ' + e.message); }
 try {
  const P = W.V463PZ;
  if (P && typeof P.box === 'function') {
   const B0 = P.box;
   P.box = function () {
    const b = B0.apply(this, arguments);
    try {
     if (b && !off('__rl_no582pause') && b.y === 33) { b.y = 17; b.iy = b.y + 4; }
    } catch (e) {}
    return b;
   };
  }
 } catch (e) { ST.err.push('pz: ' + e.message); }
})();
