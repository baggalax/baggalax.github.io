// ===== BAGGA LAX v600skip.js - 1.5 B67: ONLINE, ONLY THE SCORING TEAM CAN SKIP A CELLY =====
// Ask:   online, only the player whose team scored may skip the celly; the other phone gets no SKIP.
// How it works today (checked with two clients): online cellies run on the HOST phone only (items17 cellyTick); the
//        guest phone never draws one (net.js syncs no celly state) and has no SKIP. The host saw SKIP for BOTH teams'
//        cellies, so the host could cut the guest's celly.
// Fix:   on the host, a celly of the guest's team (side 1 in an online game) shows no SKIP and its tap area is gone; it
//        plays to its end, then the banner moves on for both phones as before. The host's own celly keeps SKIP and the
//        banner ends on both phones together (unchanged). Offline nothing changes (you can still skip the CPU's celly,
//        as before). No net protocol change. Kill switch: window.__rl_no600skip
(function () {
 'use strict';
 const Wn = window;
 if (typeof Wn.hit !== 'function' || typeof Wn.rect !== 'function' || typeof Wn.text !== 'function') return;
 const LOG = Wn.__skip600log = { hidden: 0 };
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const theirCelly = () => {
  if (Wn.__rl_no600skip) return false;
  const G = G0();
  return !!(G && G.c17 && G.c17.side === 1 && (G.online || G.meta && G.meta.online) && Wn.RLNET && RLNET.inGame && screen === 'banner');
 };
 let eat = 0; // the 2 rects + 1 text of the SKIP button drawn right after its hit()
 const H0 = Wn.hit;
 Wn.hit = function (key, x, y, w, h, fn, label) {
  if (key === 'SKIP CELLY' && theirCelly()) { eat = 3; LOG.hidden++; return; }
  return H0.apply(this, arguments);
 };
 const R0 = Wn.rect;
 Wn.rect = function (x, y, w, h) {
  if (eat && w === 32 && h === 10) { eat--; return; }
  return R0.apply(this, arguments);
 };
 const T0 = Wn.text;
 Wn.text = function (s) {
  if (eat && s === 'SKIP') { eat = 0; return; }
  return T0.apply(this, arguments);
 };
})();
