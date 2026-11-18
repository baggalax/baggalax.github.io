/* v517sc.js - BAGGA LAX 1.3: SHOT CLOCK +10 SECONDS.
 * Charlie (Nov 11 2026, 10:32 PM): extend the shot clock by 10 seconds, every mode that uses one.
 * game.js: const SHOT_CLOCK = 20 (line 23) - a const, so it can't be changed from outside. Every place the game RESETS the shot
 *  clock writes exactly SHOT_CLOCK (new possession, pipe, save, faceoff, timeout restart...), and the quick CPU possession
 *  replay writes SHOT_CLOCK - used. This file sits on game.shotClock: a write of exactly 20 becomes 30, and during the CPU
 *  replay screen every write of <=20 gets the same +10, so the CPU replay counts down from 30 too. Normal ticking (-dt),
 *  restores of a saved value (timeouts) and anything else are left exactly as written.
 * Online: each side adds the 10 when IT resets the clock; a number copied in from the other side's snapshot is taken as is
 *  (it already has the 10), so both screens show the same clock and the net messages are unchanged.
 * Kill switch: window.__rl_no517sc (checked live). V517.ADD = seconds added (10).
 */
(function () {
 'use strict';
 if (window.__rl_no517sc) return;
 const WIN = window;
 let BASE = 20;
 try { BASE = SHOT_CLOCK; } catch (e) {}
 const V = WIN.V517 = { on: true, ver: 5170, ADD: 10, base: BASE, resets: 0, err: null };
 const off = () => !!WIN.__rl_no517sc;
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 // online: a value copied in from the other side's snapshot (applySnap / timeout release) is already on the new scale
 function watching(G) {
  if (!G || !G.online) return false;
  let st = '';
  try { st = String(new Error().stack || ''); } catch (e) {}
  return /applySnap|to18Release/.test(st);
 }
 function inst(G) {
  if (!G || typeof G !== 'object' || G.__sc517) return;
  const d = Object.getOwnPropertyDescriptor(G, 'shotClock');
  if (d && (d.get || d.configurable === false)) return;
  let raw = d ? d.value : undefined;
  Object.defineProperty(G, '__sc517', { value: true, enumerable: false, configurable: true });
  Object.defineProperty(G, 'shotClock', { configurable: true, enumerable: true,
   get() { return raw; },
   set(v) {
    try {
     if (!off() && typeof v === 'number' && !G.tutorial && (v === BASE || (scr() === 'cpu' && v <= BASE && v > -1)) && !watching(G)) { v += V.ADD; V.resets++; }
    } catch (e) { V.err = String(e && e.message || e).slice(0, 120); }
    raw = v;
   } });
  if (raw === BASE && !off() && !G.tutorial) { raw = BASE + V.ADD; V.resets++; }
 }
 V.inst = () => { try { inst(game); } catch (e) {} };
 // install on every new game object as early as possible: before each frame's step and right after newGame
 const hook = n => { const o = WIN[n]; if (typeof o !== 'function') return; WIN[n] = function () { const r = o.apply(this, arguments); try { inst(game); } catch (e) {} return r; }; };
 hook('newGame');
 const oStep = WIN.step;
 if (typeof oStep === 'function') WIN.step = function () { try { inst(game); } catch (e) {} return oStep.apply(this, arguments); };
})();
