/* v567cardkit.js - player cards wear the team's REAL uniform (Bagga Lax 1.4, Nov 18 2026). Kill switch: window.__rl_no567card = true.
 * Bug (Charlie): player card art showed a plain two-color kit (team c1 jersey + c2 trim, cards22 kitOf fallback)
 * instead of the team's actual uniform.
 * Fix: when cards22 asks C30.kit for a card's kit and C30 has none, answer with the team's real uniform (the kit you
 * picked for that team in the locker, home if none) from UNI21, and the Veterans kits (camo, pilot, galaxy) even before
 * you own the team, drawn in the same side-view idle
 * sprite as before. Legends kits, C30 custom cards (gray) and the honors portraits (All-American / Baggatwaan) are
 * untouched. No ids, storage keys or net changes.
 * Nov 18 (Charlie): cards always show the team's FIRST (base) uniform, not the one picked in the locker (Ghosts were showing the
 * skeleton kit), and no arms across the front of the body on plain uniforms (kill switch for that part: __rl_no567arms). */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v567_loaded) return;
 W.__rl_v567_loaded = 1;
 const LOG = W.V567C = { n: 0, errs: 0, err: null };
 const off = () => !!W.__rl_no567card || !!W.__rl_v124gb;
 function realKit(pid, tid) {
  const U = W.UNI21;
  if (!U || !U.on || !U.on() || typeof U.kitOf !== 'function') return null;
  let t = tid;
  if (!t) { try { const p = PP(pid); t = p && (p.leg ? p.legTeam : p.team); } catch (e) {} }
  if (!t) return null;
  try { if (typeof T === 'function' && T(t).id !== t) return null; } catch (e) { return null; }
  let k = null;
  try { const X = W.UNI21X; if (X && typeof X.kitOf === 'function' && !W.__rl_no489vets) k = X.kitOf(t, 0); } catch (e) { k = null; }
  if (!k) k = U.kitOf(t, 0);
  if (!k || !k.jersey) return null;
  LOG.n++;
  return k;
 }
 function hook() {
  const C = W.C30;
  if (!C || typeof C.kit !== 'function' || C.kit.__v567) return false;
  const o = C.kit;
  const f = function (pid, tid) {
   // card art only (cards22 kitOf is C30.kit's one caller): draw without v441's skin forearms in front of the body, like the
   // patterned uniforms already were. Back on right after this card is drawn.
   if (!off() && !W.__rl_no567arms && !W.__rl_no4xxnum) { W.__rl_no4xxnum = true; queueMicrotask(() => { W.__rl_no4xxnum = false; }); }
   const r = o.apply(this, arguments);
   if (r || off()) return r;
   try { return realKit(pid, tid); } catch (e) { LOG.errs++; LOG.err = String(e && e.message || e).slice(0, 160); return null; }
  };
  f.__v567 = 1;
  C.kit = f;
  return true;
 }
 if (!hook()) document.addEventListener('DOMContentLoaded', hook);
})();
