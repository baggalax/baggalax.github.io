/* v600ghost.js - BAGGA LAX hotfix (1.5.1 / 1.6, Friday): ONLINE - "I CAN'T RUN WITH THE BALL, I CAN ONLY DODGE" (whole match).
 * Bug (Charlie, live 1.5 build 59 = B77, ~5 players): in an online match the player never moved with the joystick for the
 *   rest of the game; swipes still made him dodge.
 * Cause (reproduced in a two-phone sim): a thumb that went down on the LEFT half while a play screen was up (most often the
 *   opening faceoff) and was lifted AFTER this phone switched to the viewer screen ('netview', the other team has the ball).
 *   net.js's netview inUp wrapper handles the lift itself and never calls the game's inUp, so that finger is never removed
 *   from the game's pointer list. Every time this phone gets the ball back, v519joy's adoptTick "adopts" that dead finger as
 *   the joystick (it looks like a thumb held over from the last screen). With the stick owned by a finger that never moves,
 *   game.js inDown sends every real left-thumb touch to the RIGHT zone (game.js: zone 'L' + joy held by another id -> 'R'),
 *   where a swipe is a dodge. The dead finger never ends, so it lasts the whole match. Sim (B77): faceoff loser 5/5
 *   possessions at 0 px/s, G.run never set; the other phone normal.
 * Fix (input only, both phones, offline and online alike; no rules, speeds, ids, keys or net messages touched):
 *   1) any finger that ends (inUp) is always taken off the pointer list, also on the viewer screen (+ the stick is let go
 *      if that finger owned it).
 *   2) recovery for a phone that is already stuck: on every new touch, fingers in the pointer list that are no longer on the
 *      glass (not in TouchEvent.touches) are dropped first, so the new thumb becomes the joystick again.
 * Kill switch: window.__rl_noghost = true. Telemetry: window.__ghost600.
 */
(function () {
 'use strict';
 const W = window;
 if (W.__ghost600) return;
 const ST = W.__ghost600 = { upFix: 0, purged: 0, joyFreed: 0, errs: [] };
 const off = () => !!W.__rl_noghost;
 const err = (w, e) => { if (ST.errs.length < 6) ST.errs.push(w + ': ' + String(e && e.message || e).slice(0, 120)); };
 try { if (typeof pointers === 'undefined' || typeof W.inUp !== 'function') return; } catch (e) { return; }
 function drop(id) {
  if (!pointers.has(id)) return false;
  pointers.delete(id);
  try { if (typeof joy !== 'undefined' && joy && joy.id === id) { ST.joyFreed++; joyRelease(true); } } catch (e) { err('joy', e); }
  try { if (typeof stick !== 'undefined' && stick && stick.id === id) stick = null; } catch (e) {}
  return true;
 }
 // 1) a finger that ends always leaves the list
 const U0 = W.inUp;
 W.inUp = function (id) {
  const r = U0.apply(this, arguments);
  try { if (!off() && drop(id)) ST.upFix++; } catch (e) { err('up', e); }
  return r;
 };
 // 2) recovery: before the game sees a new touch, drop fingers that are not on the glass any more
 W.addEventListener('touchstart', function (e) {
  if (off()) return;
  try {
   const live = new Set();
   for (const t of e.touches) live.add('t' + t.identifier);
   for (const id of Array.from(pointers.keys())) if (typeof id === 'string' && id[0] === 't' && !live.has(id) && drop(id)) ST.purged++;
  } catch (x) { err('purge', x); }
 }, { capture: true, passive: true });
})();
