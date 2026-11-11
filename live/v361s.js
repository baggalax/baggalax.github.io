(function() {
 'use strict';
 if (window.__rl_361sc_otsOnly === undefined) window.__rl_361sc_otsOnly = false;
 function gleOut() {
  return window.V28 && V28.OTS && typeof V28.OTS.gleOut === 'number' ? V28.OTS.gleOut : 6;
 }
 function mem() {
  return window.V28 && V28.OTS && typeof V28.OTS.mem === 'number' ? V28.OTS.mem : 1.6;
 }
 function gle(c) {
  if (window.__rl_no361sc) return false;
  const G = typeof game !== 'undefined' ? game : null;
  if (!c || !G || typeof GX === 'undefined') return false;
  if (!(c.x >= GX && c.x <= GX + gleOut())) return false;
  if (window.__rl_361sc_otsOnly && !(c.x28X != null && (G.t || 0) - c.x28X <= mem())) return false;
  return true;
 }
 window.V361SC = {
  gle: gle,
  gleOut: gleOut
 };
})();
