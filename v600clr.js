// ===== BAGGA LAX v600clr.js - 1.5 B65: YOUR BALL CARRIER ONLY MOVES WHILE YOU PUSH THE STICK =====
// Bug:   after winning the ball on defense, the clear started and the player you control kept running in a straight line
//        with no thumb on the joystick (and no keys / pad).
// Cause: every "start the clear / new possession" path seeds a fake run for the carrier: G.run = { x: 1, y: 0 }
//        (game.js clear start ~L20232 + ~L19989, resetPoss ~L5880, v38g.js "CARRY IT UP!" ~L151). Real input always marks
//        its run (joystick / swipe: run.joy, keys: kb467, pad: pad468) and joyRelease only clears a MARKED run, so the
//        seeded run never stopped until you touched the stick.
// Fix:   before each live frame, an unmarked run on YOUR held-ball carrier is dropped (he stops like a normal release).
//        A thumb still on the stick puts its own run straight back (joyTick). Ground-ball chases, dodges, set plays
//        (pAuto) and every CPU player are untouched. Offline and online alike (G.run is local input on each phone).
//        The tutorial keeps its scripted lesson. Kill switch: window.__rl_no600clr
(function () {
 'use strict';
 const W = window;
 if (typeof W.updateLive !== 'function') return;
 const LOG = W.__clr600log = { drop: 0, last: null };
 const L0 = W.updateLive;
 W.updateLive = function (dt) {
  try {
   const G = typeof game !== 'undefined' ? game : null, r = G && G.run;
   if (!W.__rl_no600clr && r && !r.joy && !r.kb467 && !r.pad468 && !G.tutorial && screen === 'live' && G.carrier && G.ball && G.ball.state === 'held' && G.carrier.team === 'O' && !(G.dodge && G.dodge.who === G.carrier)) {
    G.run = null;
    LOG.drop++;
    LOG.last = { t: +(G.t || 0).toFixed(2), clearing: !!G.clearing, x: Math.round(G.carrier.x) };
   }
  } catch (e) {}
  return L0.apply(this, arguments);
 };
})();
