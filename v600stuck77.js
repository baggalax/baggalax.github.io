// ===== BAGGA LAX v600stuck77.js - 1.5 B77: ONLINE MATCH NEVER STAYS FROZEN ON A BANNER / A LOST HAND-OFF =====
// Bug (Charlie, real online match): the game froze on the PICKED OFF! banner.
// How a possession change works online: the phone running the play shows the banner, then hands the ball over ('poss') and
//   becomes the viewer; the other phone takes over. Two ways that can hang for good:
//   a) the 'poss' hand-off is lost or lands while the other phone is busy -> BOTH phones are viewers, nobody runs the match;
//   b) a timeout hold (net.js toHold18: an opponent's timeout freezes the banner) whose release never comes (reordered or lost
//      'tor') -> the banner timer is held at 0 forever.
// Fix (both phones, no new rules, sim never waits on the network for long):
//   a) a viewer that got no frames for 5 s asks once ('stk77', ADDED message; an older app ignores it); the phone that last
//      handed the ball over re-sends that same hand-off. Every 5 s while still stuck.
//   b) a held banner with no live timeout on either side for 15 s (or any hold older than the longest league timeout + 15 s)
//      is released.
// Kill switch: window.__rl_no77stuck
(function () {
 'use strict';
 const Wn = window, N = Wn.RLNET;
 if (!N || !N.Link || !N.Link.prototype) return;
 const off = () => !!Wn.__rl_no77stuck || !N.inGame;
 const LOG = Wn.__stuck77 = { ask: 0, resend: 0, release: 0 };
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 let lastPoss = null, lastFrame = performance.now(), askT = 0, holdT = 0, holdObj = null;
 // remember my last hand-off
 const LP = N.Link.prototype, SE0 = LP.send;
 LP.send = function (e) { try { if (e && e.t === 'poss') lastPoss = { msg: JSON.parse(JSON.stringify(e)), at: performance.now() }; } catch (x) {} return SE0.apply(this, arguments); };
 // frames from the other phone / the stuck question
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try {
   if (e && e.t === 'stk77' && !Wn.__rl_no77stuck) {
    // the other phone is a viewer with no frames: if I am not running the match either and I handed the ball over last, resend it
    if (N.inGame && !N.auth && lastPoss && performance.now() - lastPoss.at < 120e3 && N.link) { const m = Object.assign({}, lastPoss.msg); delete m.q; delete m.s; SE0.call(N.link, m); LOG.resend++; }
   }
  } catch (x) {}
  return GE0.apply(this, arguments);
 };
 setInterval(() => {
  try {
   if (off()) { lastFrame = performance.now(); holdObj = null; return; }
   const G = G0(); if (!G) return;
   const V = N.view, t = performance.now();
   if (screen !== 'netview' || N.auth) lastFrame = t; else if (V && V.lastAt && V.lastAt !== V.__l77) { V.__l77 = V.lastAt; lastFrame = t; }
   const busy = !!(G.pb74 && (G.pb74.rem || G.pb74.loc)) || !!G.toHold18 || !!(N.link && !N.link.connected);
   if (screen === 'netview' && !N.auth && !busy && t - lastFrame > 5000 && t - askT > 5000 && N.link) { askT = t; LOG.ask++; N.link.send({ t: 'stk77' }); }
   // b) a held banner
   if (G.toHold18) { if (G.toHold18 !== holdObj) { holdObj = G.toHold18; holdT = t; } } else holdObj = null;
   if (holdObj) {
    const age = t - holdT, liveTo = !!(G.to19) || screen === 'timeout' || screen === 'playbook' || screen === 'lineup';
    if ((!liveTo && age > 15e3) || age > 75e3) { G.toHold18 = null; G.to19 = null; holdObj = null; LOG.release++; if (screen === 'banner') G.bannerT = 99; }
   }
  } catch (e) {}
 }, 500);
 // ---- B77 (Charlie): online AUTO SUB notes stacked big at the top. The phone running the play sends its own fx in the
 // snapshots, so the other phone also showed the OTHER team's sub notes (each phone already shows its own team's).
 // On the viewing phone the other team's sub notes are dropped and only the newest top note is kept (as offline).
 // Kill switch: window.__rl_no77subs
 const SUBRE = /^(AUTO SUB|SUB:|PLAY SUB|SUB WAITS|SUB CALLED|FOLLOW CANCELLED)|SUBS IN/;
 const r77 = Wn.render;
 if (typeof r77 === 'function') Wn.render = function () {
  try {
   if (!Wn.__rl_no77subs && N.inGame && typeof fx !== 'undefined' && Array.isArray(fx)) {
    if (screen === 'netview' && !N.auth) { for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; if (f && f.type === 'cue' && SUBRE.test(String(f.s || ''))) fx.splice(i, 1); } }
    let newest = null; for (const f of fx) if (f && f.type === 'cue' && (!newest || f.t < newest.t)) newest = f;
    if (newest) for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; if (f && f.type === 'cue' && f !== newest) fx.splice(i, 1); }
   }
  } catch (e) {}
  return r77.apply(this, arguments);
 };
})();
