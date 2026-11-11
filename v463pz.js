/* v463pz.js - in-game PAUSE button moves from bottom-center to the TOP-LEFT corner of the field.
 * Why: players tapped pause by accident while steering the bottom wing guy on faceoffs (it sat at bottom-center).
 * game.js drawHUD (and practice18.js drawPracHud) branch on V463PZ.on() and take their box from V463PZ.box().
 * Spot: just under the scoreboard and the "BAGGA LAX" banner strip, on the field's top-left edge (y 33..49),
 * left of everything in the HUD (TIMEOUT starts at x=96, the timeout dots at y=18, CLIP is top-right).
 * Kill switch: window.__rl_no463pz = true  -> old bottom-center pause.
 */
(function () {
 'use strict';
 var BW = 22, BH = 16, TOP = 33;
 function on() { return !window.__rl_no463pz; }
 // Left safe-area inset in game units (iPhone landscape notch/island side); half of it, capped, so the
 // button never hugs a rounded corner but stays a thumb's reach from the edge.
 function inset() {
  try {
   var s = typeof sa2403 === 'function' ? sa2403() : null, k = typeof SCALE === 'number' && SCALE > 0 ? SCALE : 1;
   var l = s && s.l ? s.l / k : 0;
   return Math.min(8, Math.round(l / 2));
  } catch (e) { return 0; }
 }
 function box() {
  var px = 4 + inset(), py = TOP;
  return { x: px, y: py, w: BW, h: BH, ix: px + 4, iy: py + 4 }; // ix/iy: top-left of the 14x8 icon plate
 }
 // Same look as the old icon: dark 14x8 plate, two 2x6 white bars.
 function draw(b) {
  rect(b.ix, b.iy, 14, 8, 'rgba(0,0,0,.55)');
  rect(b.ix + 4, b.iy + 1, 2, 6, '#fff');
  rect(b.ix + 8, b.iy + 1, 2, 6, '#fff');
 }
 window.V463PZ = { on: on, box: box, draw: draw };
})();
