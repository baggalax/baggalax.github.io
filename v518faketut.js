/* v518faketut.js - BAGGA LAX 1.3: ?faketut=1 TEST LINK FOR THE FAKE TUTORIAL + NO PULL-TO-SHOOT FROM X.
 * Charlie (Nov 11, 10:44-11:00 PM): "make a fakes tutorial that everyone has to do so people who have been playing learn" /
 *  "keep it so you can pull to shoot even when the circles pop up - just not from X". (The drag-fake idea was dropped at 10:49 PM;
 *  fakes stay the FAKE button.)
 * 1) The FAKE TUTORIAL itself is v507's mandatory one-time drill (TAP FAKE -> TAP A RED CIRCLE -> SHOOT THE OTHER SIDE, done key
 *    rl_fake507). Everyone who has not done it gets it: new players right after the main + shooting tutorials, players who have
 *    been playing the next time they are on the menu. This file does not change that.
 *    TEST LINK: open the game with ?faketut=1 (or #faketut) -> the fake tutorial starts at the next menu, that load only,
 *    whatever the save says (no save is cleared; finishing it saves rl_fake507 as usual).
 * 2) NO PULL-TO-SHOOT FROM X (part 2 below). In front of the cage nothing changes (pull-to-shoot works with the circles up).
 * No new save keys. Ids, rl_* keys, net protocol, online and the FAKE button unchanged.
 * Kill switch: window.__rl_no518ft = true -> exactly as before (window.__rl_no518x = true turns off only part 2). Test: window.V518FT.
 */
(function () {
 'use strict';
 const W0 = window;
 const OFF = () => !!(W0.__rl_no518ft || W0.__rl_v124gb);
 if (OFF()) return;
 if (typeof W0.render !== 'function') return;
 const rt = () => performance.now() / 1e3;
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const ST = { errs: [] };
 const err = (e, w) => { try { if (ST.errs.length < 10) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v518ft', w, e); } } catch (x) {} };
 // ---------------- 1) ?faketut=1 / #faketut ----------------
 const FT = { want: false, started: false, menuT: 0, ok: null };
 try { FT.want = /[?&]faketut=1(?:&|$)/.test(location.search) || /faketut/.test(location.hash); } catch (e) {}
 function ftTick() {
  if (!FT.want || FT.started) return;
  const A = W0.V507FAKE; if (!A || !A.start) return;
  let free = false;
  try {
   free = SCR() === 'menu' && !G0() && !(typeof tutAsk !== 'undefined' && tutAsk) && !(typeof ASK22 !== 'undefined' && ASK22) &&
    ![ 'df2503', 'shop26', 'tut26card', 'tut507card', 'c27', 'tt27', 'intro30skip' ].some(id => { const e = document.getElementById(id); return e && e.offsetParent !== null; });
  } catch (e) {}
  if (!free) { FT.menuT = 0; return; }
  if (!FT.menuT) { FT.menuT = rt(); return; }
  if (rt() - FT.menuT < 1) return;
  FT.started = true;
  try { A.start(); FT.ok = !!(A.T && A.T.active); } catch (e) { err(e, 'faketut'); }
 }

 // ---------------- 2) no pull-to-shoot from X (Charlie 10:57 PM: "keep it so you can pull to shoot even when the circles pop up - just not from X") ----------------
 // In front of the cage nothing changes: pull-to-shoot works with the crease circles up, and tapping a circle shoots.
 // At X (behind the goal line - the game's own atX231 test, which also covers the goal-line-extended spots where V28's
 // over-the-shoulder rule let a pull shot through): a press that is not on a circle is not a shot (the same as plain X already
 // was - the touch goes back to the field: dodge / nothing), and a press that IS on a circle can only tap it (a pull from it is
 // not charged). Kill switch for this part only: window.__rl_no518x = true.
 const XS = { blocked: 0, clamped: 0 };
 const XOFF = () => OFF() || !!W0.__rl_no518x;
 const SH = W0.SHOT26;
 function atX() { try { const c = game && game.carrier; return !!(c && c.team === 'O' && typeof atX231 === 'function' && atX231(c)); } catch (e) { return false; } }
 if (SH && typeof SH.down === 'function' && typeof SH.move === 'function' && typeof SH.up === 'function') {
  const SD0 = SH.down, SM0 = SH.move, SU0 = SH.up;
  SH.down = function (pt, p) {
   let x = false, tq = null;
   try {
    if (!XOFF() && SCR() === 'live' && canShoot() && atX()) {
     x = true;
     try { tq = SH.circlesOn() ? SH.quad(p.x + Math.round(camX), p.y, true) : null; } catch (e) {}
    }
   } catch (e) { err(e, 'xdown'); }
   if (x && !tq) { XS.blocked++; return false; }
   const r = SD0.apply(this, arguments);
   try { const A = SH.S.aim; if (x && r && A && A.id === pt.id) A.x518 = true; } catch (e) { err(e, 'xdown2'); }
   return r;
  };
  SH.move = function (pt) {
   const r = SM0.apply(this, arguments);
   try { const A = SH.S.aim; if (A && A.x518 && A.id === pt.id) { if (A.tx < A.ax) A.tx = A.ax; A.maxPull = 0; A.still0 = null; } } catch (e) { err(e, 'xmove'); }
   return r;
  };
  SH.up = function (pt, cancelled) {
   try { const A = SH.S.aim; if (A && A.x518 && A.id === pt.id && !cancelled) { if (A.tx < A.ax) XS.clamped++; A.tx = A.ax; A.maxPull = 0; } } catch (e) { err(e, 'xup'); }
   return SU0.apply(this, arguments);
  };
 }

 const RD0 = W0.render;
 W0.render = function () {
  try { if (!OFF()) ftTick(); } catch (e) { err(e, 'render'); }
  return RD0.apply(this, arguments);
 };
 W0.V518FT = { on: () => !OFF(), ST: ST, FT: FT, XS: XS };
})();
