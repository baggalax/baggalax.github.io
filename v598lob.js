/* v598lob.js - Bagga Lax 1.5f: Locker League lobby to Chucks's approved spec (ll_lobby_spec.md, Charlie approved).
 * Bug: on device the stick drew OVER the team / uni plates, STATS sat as a stray yellow square at the stage edge, the small
 *  cyan jersey arrows were missing, and a black rectangle sat between DIMES and the team plate.
 * Cause: (1) STICK590.heroOver redrew the hero head over the top plate band after the UI; (2) game.js drawLobbyLeftIn put
 *  STATS where the old CHIRP spot was (lobby.cload2402 / home-bar move); (3) UNI21 only draws its jersey arrows on 'menu',
 *  not on the gear17 Locker League screen (the hits were there, the art was not); (4) the game's own team sign + uni label
 *  were covered with a 110-wide black band.
 * Fix (Locker League lobby only, not profiles / versus): no heroOver here, so the hero + stick stay behind every plate,
 *  button and card; the game's own sign + uni label are skipped (our plates replace them, no band); STATS gets its own
 *  button at L-46, y 146; the cyan jersey arrows draw at (arrow x + 3, y 97) under the big yellow arrows.
 *  The rest of the layout (slots y 19, cards, right column rows, CHIRP / YARD SALE / PASS / WEEKLY, tap-to-switch team
 *  plate) lives in v590ll / items17 / v590b behind the same kill switch.
 * Kill switch: window.__rl_no598lob
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__rl_no598lob || Wn.__v598lob) return; Wn.__v598lob = 1;
 const llLobby = () => { try { return !Wn.__rl_no598lob && typeof screen !== 'undefined' && screen === 'gear17' && typeof GEAR17 !== 'undefined' && GEAR17 && GEAR17.ll15 && Wn.RK15LL && !RK15LL.__pv && (RK15LL.mode === 'lobby' || !RK15LL.mode); } catch (e) { return false; } };
 let on = false, LW = 0;
 // (1) the hero head is never redrawn over the plates in this lobby
 try { const S = Wn.STICK590; if (S && typeof S.heroOver === 'function' && !S.heroOver.__w598) { const h0 = S.heroOver; S.heroOver = function () { if (llLobby()) return; return h0.apply(this, arguments); }; S.heroOver.__w598 = 1; } } catch (e) {}
 // (4) skip the game's own team sign (y 3) + uni label (y 15) while drawLobbyLeft runs here
 try {
  const r0 = Wn.rect, t0 = Wn.text, b0 = Wn.button;
  const s0 = Wn.sa2403Dy; // the number tag centres on the hero (STATS has its own spot, so the 'STATS beside the tag' layout is never used here)
  if (typeof s0 === 'function') Wn.sa2403Dy = function (y, hh) { if (on && y === 158 && hh === 15) return 1; return s0.apply(this, arguments); };
  if (typeof r0 === 'function' && typeof t0 === 'function' && typeof b0 === 'function') {
   Wn.rect = function (x, y, w, h, c) { if (on && ((y === 3 && h === 10 && c === '#05080b') || (y === 15 && h === 9 && c === 'rgba(5,10,14,.6)'))) return; return r0.apply(this, arguments); };
   Wn.text = function (s, x, y, sc, c, al) { if (on && al === 'center' && sc === 1 && (y === 5 || y === 17) && Math.abs(x - LW / 2) < .01) return; return t0.apply(this, arguments); };
   // (2) STATS: its own button, x L-46, y 146 (44 x 10 + drop), under the cards and clear of the home bar
   Wn.button = function (label, x, y, w, h) { if (on && label === 'STATS') { const a = Array.prototype.slice.call(arguments); a[1] = LW - 46; a[2] = 146; a[3] = 44; a[4] = 10; return b0.apply(this, a); } return b0.apply(this, arguments); };
  }
 } catch (e) {}
 function jArrow(x, y, dir) { // (3) small cyan 12 x 13 (+2 drop) jersey arrow
  rect(x, y + 2, 12, 13, '#000'); rect(x, y, 12, 13, '#0b1a20'); rect(x + 1, y + 1, 10, 11, 'rgba(18,40,52,.95)'); rect(x + 1, y + 1, 10, 1, 'rgba(255,255,255,.25)');
  for (let j = 0; j < 4; j++) { const xx = dir > 0 ? x + 4 + j : x + 7 - j; rect(xx, y + 3 + j, 1, 7 - 2 * j, '#8fe3f0'); }
 }
 try {
  const d0 = Wn.drawLobbyLeft;
  if (typeof d0 === 'function' && !d0.__w598) {
   const d = function (L, live) {
    if (!llLobby()) return d0.apply(this, arguments);
    on = true; LW = L;
    try { return d0.apply(this, arguments); }
    finally {
     on = false;
     try { const lay = lobby.layout; if (lay && lay.arrows && !lobby.card && Wn.UNI21 && UNI21.on()) { jArrow(lay.arrows[0] + 3, 97, -1); jArrow(lay.arrows[1] + 3, 97, 1); } } catch (e) {}
    }
   };
   d.__w598 = 1; Wn.drawLobbyLeft = d;
  }
 } catch (e) {}
})();
