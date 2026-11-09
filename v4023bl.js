(function() {
 'use strict';
 const on = () => !window.__rl_no4023bl && !window.__rl_v124gb;
 const INK = '#0b1a20';
 const B = [ '##.', '#.#', '##.', '#.#', '##.' ], L = [ '#..', '#..', '#..', '#..', '###' ];
 function glyph(x, gl, ox, oy) {
  x.fillStyle = INK;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === '#') x.fillRect(ox + c, oy + r, 1, 1);
 }
 const BOWL = {
  cup: x => {
   x.fillStyle = '#ffcc33';
   x.fillRect(5, 4, 10, 6);
   x.fillStyle = '#fff2a0';
   x.fillRect(6, 4, 2, 4);
  },
  cup_mega: x => {
   x.fillStyle = '#ffe066';
   x.fillRect(4, 4, 12, 6);
   x.fillStyle = '#fffbe0';
   x.fillRect(5, 4, 2, 5);
  }
 };
 const done = new WeakSet;
 function paint(c, art) {
  if (!c || done.has(c) || !BOWL[art]) return;
  const x = c.getContext('2d');
  if (!x) return;
  BOWL[art](x);
  glyph(x, B, 6, 5);
  glyph(x, L, 10, 5);
  done.add(c);
 }
 const ids = [];
 function fix() {
  if (!on() || !window.V17 || typeof V17.icon !== 'function' || !V17.BY) return 0;
  if (!ids.length) for (const id in V17.BY) {
   const it = V17.BY[id];
   if (it && (it.art === 'cup' || it.art === 'cup_mega') && !it.st28 && !it.pc27 && !it.leg20) ids.push(id);
  }
  let n = 0;
  for (const id of ids) {
   try {
    const c = V17.icon(id, false);
    if (c && !done.has(c)) {
     paint(c, V17.BY[id].art);
     n++;
    }
   } catch (e) {}
  }
  return n;
 }
 try {
  fix();
 } catch (e) {
  console.error(e);
 }
 try {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix);
 } catch (e) {}
 setTimeout(() => {
  try {
   fix();
  } catch (e) {}
 }, 0);
 window.V4023BL = {
  on: on,
  fix: fix,
  ids: ids,
  mono: () => on() ? 'BL' : 'RL',
  B: B,
  L: L
 };
})();
