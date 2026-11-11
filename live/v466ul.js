/* v466ul.js - V46.6: PLAY > ULTIMATE showed the COLLEGE LAX lock (Bagga Lax 1.1 bug).
 * Charlie (Nov 9 1:09 PM): "when you click ultimate it says college isn't available you need dimes but i clicked ultimate
 * not college".
 * What showed: header "COLLEGE LAX", "COLLEGE LAX IS LOCKED", "UNLOCK FOR 5 DIMES (YOU HAVE N)", "NOT ENOUGH DIMES".
 * Root cause: college25.js drawUI() (line 2186):
 *     if (view === 'lock' || !unlocked()) vLock(); else if ... view === 'ulock' ... vULock() ...
 *   The ULTIMATE button (college25.js ~2353) correctly opens view 'ulock' (or 'upick'/'uhub'), but drawUI checks the
 *   COLLEGE dimes unlock (S.unl) FIRST for every view, so anyone who has not paid 5 dimes for College gets the College
 *   paywall instead of the Ultimate screen.
 * Ultimate's real gate is its own: win each title (the UREQ list, shown as BLS, TLS, BAGGA LAX (BLS+TLS), MEGA BAGGA LAX
 *   (with N/A teams), College NATTY, plus the WORLD GAMES trophy) and own 7 player cards (uShort). It has no dimes price. vULock() shows exactly that checklist.
 * Fix: while the col25 screen is on an Ultimate view ('ulock' / 'upick' / 'uhub') and College is not unlocked, the render
 *   pass sees College's unlock flag as set, so drawUI routes to the Ultimate screen it was asked for. The flag is put on as
 *   a NON-ENUMERABLE property and removed right after the render, so it is never saved (JSON skips it) and College itself
 *   stays locked: PLAY > COLLEGE still shows the College dimes lock, and nothing is charged or granted.
 * Kill switch: window.__rl_no466ul = true. No storage keys, no net protocol touched.
 */
(function () {
 'use strict';
 const W = window;
 const off = () => !!(W.__rl_no466ul || W.__rl_v124gb);
 const ULT = { ulock: 1, upick: 1, uhub: 1 };
 W.V466UL = { hits: 0 };
 const R0 = W.render;
 if (typeof R0 !== 'function') return;
 W.render = function () {
  let S = null;
  try {
   const C = W.COL25;
   if (!off() && C && typeof screen !== 'undefined' && screen === 'col25' && ULT[C.view()] && C.on && C.on()) {
    const s = C.st();
    if (s && !s.unl && !Object.prototype.hasOwnProperty.call(s, 'unl')) {
     Object.defineProperty(s, 'unl', { value: 1, configurable: true, enumerable: false, writable: true });
     S = s;
     W.V466UL.hits++;
    }
   }
  } catch (e) { S = null; }
  try {
   return R0.apply(this, arguments);
  } finally {
   if (S) {
    try {
     const d = Object.getOwnPropertyDescriptor(S, 'unl');
     // only take OUR flag off; a real unlock during the pass (enumerable write) would have replaced it
     if (d && !d.enumerable) delete S.unl;
    } catch (e) {}
   }
  }
 };
})();
