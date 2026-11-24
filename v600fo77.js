// ===== BAGGA LAX v600fo77.js - 1.5 B77: ONLINE FACEOFF TAP BATTLE - BOTH BARS LIVE ON BOTH PHONES =====
// Bug (Charlie): in an online faceoff only your own tap bar filled; the second bar was the offline CPU's made-up rate.
// Fix: each phone sends its tap count ~10 times a second while the tap battle runs (ADDED message 'fot77' {n, k}; an older app
//   ignores it). The other phone shows it as the second bar (eased, so 300-800 ms of lag does not jump), labelled OPP.
//   The host also uses those taps when it has to decide before the slower player swipes (net.js foEarly77).
//   The winner is still decided once, by the host, for both phones.
// Kill switch: window.__rl_no77fot
(function () {
 'use strict';
 const Wn = window, N = Wn.RLNET;
 if (!N || !N.Link || !N.Link.prototype) return;
 const off = () => !!Wn.__rl_no77fot || !N.inGame;
 const LOG = Wn.__fo77log = { sent: 0, got: 0 };
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 let lastK = -1, lastN = -1, lastT = 0, shown = 0;
 // send my taps (only when they changed, at most every 100 ms)
 setInterval(() => {
  try {
   if (off() || !N.fo || !N.link) return;
   const G = G0(), F = G && G.fo; if (!F || screen !== 'faceoff' || !(F.phase === 'set' || F.phase === 'go' || F.phase === 'wait')) return;
   const k = F.taps | 0; if (k === lastK && N.fo.n === lastN && performance.now() - lastT < 1000) return;
   lastK = k; lastN = N.fo.n; lastT = performance.now();
   N.link.send({ t: 'fot77', n: N.fo.n, k: k }); LOG.sent++;
  } catch (e) {}
 }, 100);
 // receive the other player's taps
 const LP = N.Link.prototype, GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try { if (e && e.t === 'fot77' && !Wn.__rl_no77fot && N.fo && e.n === N.fo.n) { const k = e.k | 0; if (!(N.fo.theirTaps > k)) N.fo.theirTaps = k; LOG.got++; } } catch (x) {}
  return GE0.apply(this, arguments);
 };
 // the second bar = the opponent's taps (eased); its label says OPP, not CPU
 const st0 = Wn.step;
 if (typeof st0 === 'function') Wn.step = function (dt) {
  try {
   const G = G0(), F = G && G.fo;
   if (!off() && F && N.fo && screen === 'faceoff' && (F.phase === 'set' || F.phase === 'go' || F.phase === 'wait')) {
    const target = N.fo.theirTaps | 0; shown += (target - shown) * Math.min(1, (dt || .016) * 8);
    const tt = Math.max(.05, Math.min(F.t || 0, F.setDur || 1));
    F.cpuRate = Math.max(0, shown) / tt;
   } else shown = 0;
  } catch (e) {}
  return st0.apply(this, arguments);
 };
 const r0 = Wn.render;
 if (typeof r0 === 'function') Wn.render = function () {
  const r = r0.apply(this, arguments);
  try {
   const G = G0(), F = G && G.fo;
   if (!off() && F && screen === 'faceoff' && (F.phase === 'set' || F.phase === 'go')) {
    const mid = W / 2, my = F.v131 ? 52 : 22;
    rect(mid - 59, my + 9, 16, 7, '#000'); text('OPP', mid - 58, my + 10, 1, '#ff9a8a');
   }
  } catch (e) {}
  return r;
 };
})();
