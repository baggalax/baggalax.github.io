(function() {
 'use strict';
 const RING = {
  moon: '#ffd23a',
  beach: '#1f6fd1',
  under: '#7df3ff',
  hell: '#ffb000',
  cloud: '#2f7fe0'
 };
 const FILLS = [ '#4fb050', '#c4643a' ];
 const off = () => !!(window.__rl_no40cr || window.__rl_v124gb);
 const kind = () => {
  try {
   const k = window.V28 && V28.stNow ? V28.stNow() : null;
   return k && RING[k] ? k : null;
  } catch (e) {
   return null;
  }
 };
 const DG = window.drawGoal, CI = window.circle;
 let last = null;
 if (typeof DG === 'function' && typeof CI === 'function') window.drawGoal = function() {
  const k = off() ? null : kind();
  if (!k) return DG.apply(this, arguments);
  const FR = g.fillRect, col = RING[k], L = '#e9f6e9';
  let skipped = 0, ring = 0;
  const isFill = () => {
   const s = String(g.fillStyle).toLowerCase();
   return FILLS.indexOf(s) >= 0;
  };
  g.fillRect = function() {
   if (isFill()) {
    skipped++;
    return;
   }
   return FR.apply(this, arguments);
  };
  window.circle = function(cx, cy, r, c, step) {
   if (r === CREASE && c === L) {
    ring++;
    return CI.call(this, cx, cy, r, col, step);
   }
   return CI.apply(this, arguments);
  };
  try {
   return DG.apply(this, arguments);
  } finally {
   delete g.fillRect;
   if (g.fillRect !== FR) g.fillRect = FR;
   window.circle = CI;
   last = {
    k: k,
    col: col,
    skipped: skipped,
    ring: ring
   };
  }
 };
 window.V40CR = {
  RING: RING,
  on: () => !off(),
  kind: kind,
  last: () => last
 };
})();
