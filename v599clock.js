/* v599clock.js - Bagga Lax 1.5f: ON-FIELD SEE-THROUGH COUNTDOWNS (Charlie).
 * Ask: see the shot clock (and the end of each period) without looking up at the HUD.
 * Fix: drawField is wrapped; right after the turf (so UNDER the players, ball and refs) two big pixel-font numbers are
 *  painted on the MIDLINE in the game's own font at ~22% opacity:
 *   - SHOT CLOCK on the upper half of the midline while the ball is in play (live offense / defense), counting down live;
 *     last 5 s brighter + red. Hidden on dead balls, faceoffs, banners, Braveheart and when there is no shot clock.
 *   - GAME CLOCK on the lower half of the midline in the last 10 s of a quarter / half / timed OT (online 30 s OTs too).
 *  Both read game.shotClock / game.clock, which online are the synced values, so both phones show the same numbers.
 * Kill switch: window.__rl_no599clock
 */
(function () {
 if (window.__rl_rules600 === false) return; // 1.5f: the RULES project is ON; window.__rl_rules600 = false (set before load) turns all of it off = the game plays exactly as before.
 'use strict';
 const Wn = window;
 if (Wn.__v599clock || typeof Wn.drawField !== 'function') return; Wn.__v599clock = 1;
 const LIVE = { live: 1, defense: 1 };
 function paint(s, cx, y, sc, col, a) {
  const w = textW(s, sc), x = Math.round(cx - w / 2);
  g.save(); g.globalAlpha = a; text(s, x, Math.round(y), sc, col); g.restore();
 }
 const df0 = Wn.drawField;
 Wn.drawField = function () {
  const r = df0.apply(this, arguments);
  try {
   if (Wn.__rl_no599clock) return r;
   const G = typeof game !== 'undefined' ? game : null, sc0 = typeof screen !== 'undefined' ? screen : '';
   if (!G || G.over || G.tutorial || !LIVE[sc0] || (typeof PM !== 'undefined' && PM && PM.play && sc0 === 'playmaker')) return r;
   const b = G.ball, inPlay = b && (b.state === 'held' || b.state === 'loose' || b.state === 'chase' || b.state === 'flight' || b.state === 'pass' || b.state === 'shot' || b.state === 'clear');
   const sc = Math.max(4, Math.round(((FB - FT) * .26) / 5));
   if (inPlay && !G.brave && typeof G.shotClock === 'number' && G.shotClock > 0 && !G.banner) {
    const n = Math.ceil(G.shotClock), hot = G.shotClock <= 5, pulse = hot ? .32 + .1 * (Math.floor(performance.now() / 250) % 2) : .22;
    paint(String(n), MIDX, FT + 10, sc, hot ? '#ff5a4a' : '#ffffff', pulse);
   }
   if (typeof G.clock === 'number' && G.clock > 0 && G.clock <= 10 && !G.brave && !(G.ot && G.gg516 && !G.otq)) {
    const n = Math.ceil(G.clock);
    paint(':' + (n < 10 ? '0' : '') + n, MIDX, FB - 12 - sc * 5, sc, '#ffe14d', G.clock <= 5 ? .34 : .24);
   }
  } catch (e) {}
  return r;
 };
})();
