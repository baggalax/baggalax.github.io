/* v562ult.js - Bagga Lax 1.3: every N/A / collab team is in the ULTIMATE TOURNAMENT.
   The tournament's N/A group (COL25 groups -> V232.naTeams) only knew the Ghosts. It now lists EVERY registered N/A / collab team
   (all of GH_REG: Ghosts, Good Stick, Veterans, and any collab team added later), so new ones join with no per-team edit.
   Wraps V232.naTeams only. Kill switch: window.__rl_no562ult. No ids, rl_* keys, saves or net protocol change. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl562u) return;
 W.__rl562u = true;
 function wrap() {
  const V = W.V232;
  if (!V || typeof V.naTeams !== 'function') return false;
  if (V.naTeams.__rl562) return true;
  const o = V.naTeams;
  const f = function () {
   const base = o.apply(this, arguments) || [];
   if (W.__rl_no562ult || typeof GH_REG === 'undefined') return base;
   try {
    const out = base.slice();
    for (const id of Object.keys(GH_REG)) if (out.indexOf(id) < 0 && GH_REG[id] && typeof T === 'function' && T(id) && T(id).id === id) out.push(id);
    return out;
   } catch (e) { return base; }
  };
  f.__rl562 = true;
  V.naTeams = f;
  return true;
 }
 if (!wrap()) { let n = 0; const iv = setInterval(() => { if (wrap() || ++n > 40) clearInterval(iv); }, 250); }
})();
