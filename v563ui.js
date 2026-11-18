/* v563ui.js - Bagga Lax 1.3: ONE SPECIAL GAMES button on the PLAY page.
   If more than one layer adds the SPECIAL GAMES bar (v502 re-wrapping menuBars after later wrappers hid its marker), keep only the first.
   Kill switch: window.__rl_no563ui. No ids / rl_* keys / saves / protocol change. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl563) return;
 W.__rl563 = true;
 const isSp = b => !!b && typeof b === 'object' && (b.lo502 || b.label === 'SPECIAL GAMES' || b.v526lock || b.v526multi);
 function dedupe(rows) {
  if (W.__rl_no563ui || !Array.isArray(rows)) return rows;
  let seen = false;
  const out = [];
  for (const r of rows) {
   if (!Array.isArray(r)) { out.push(r); continue; }
   const k = r.filter(b => { if (!isSp(b)) return true; if (seen) return false; seen = true; return true; });
   if (k.length) out.push(k);
  }
  return out;
 }
 function wrap() {
  try {
   const m0 = W.menuBars;
   if (typeof m0 !== 'function' || m0.__d563) return;
   const w = function () { return dedupe(m0.apply(this, arguments)); };
   w.__d563 = true;
   if (m0.__lo502) w.__lo502 = true;
   if (m0.__v526) w.__v526 = true;
   W.menuBars = w;
  } catch (e) {}
 }
 wrap();
 setInterval(wrap, 1000);
})();
