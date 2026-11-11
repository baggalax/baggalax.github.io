(function() {
 'use strict';
 if (window.__rl_no40nm || window.__rl_v124gb) {
  window.V40NM = {
   on: false
  };
  return;
 }
 const NEW = 'BAGGATWAAN';
 try {
  if (typeof DIFF_NAMES !== 'undefined' && DIFF_NAMES[5] === 'BAGGATWAAN') DIFF_NAMES[5] = NEW;
 } catch (e) {}
 try {
  if (typeof DF !== 'undefined' && DF.level === 5) DF.name = NEW;
 } catch (e) {}
 try {
  if (window.N31 && N31.on && N31.D) {
   const X = N31.D.X || (N31.D.X = []);
   X.unshift([ 'BAAGAADOWEWINA', NEW ]);
   if (N31.ready) N31.ready();
  }
 } catch (e) {}
 const X0 = window.text;
 let lastSpecs = null;
 const RD = window.render;
 if (typeof RD === 'function') window.render = function() {
  const r = RD.apply(this, arguments);
  try {
   lastSpecs = (typeof uiSpecs !== 'undefined' && uiSpecs || []).slice();
  } catch (e) {}
  return r;
 };
 function gap(cx) {
  let lx = 138, rx = W - 120;
  try {
   for (const s of lastSpecs || []) {
    if (!s || typeof s.x !== 'number' || s.h > 24 || !(s.y < 16 && s.y + s.h > 9)) continue;
    if (s.x + s.w / 2 < cx) lx = Math.max(lx, s.x + s.w); else rx = Math.min(rx, s.x);
   }
  } catch (e) {}
  return {
   x0: lx + 2,
   x1: rx - 2
  };
 }
 let last = null;
 function drawLabel(s, cx, y, col) {
  const disp = typeof fold2318 === 'function' ? fold2318(s) : s;
  const Z = gap(cx), room = Z.x1 - Z.x0;
  const short = disp.replace(/ - 2PT$/, ' 2PT');
  const cellM = Math.max(1, Math.round(.65 * RR)) / RR, wM = t => t.length * 4 * cellM - cellM;
  const place = w => {
   let c = cx;
   if (c - w / 2 < Z.x0) c = Z.x0 + w / 2;
   if (c + w / 2 > Z.x1) c = Z.x1 - w / 2;
   return c;
  };
  const opts = [ [ disp, 'n' ], [ short, 'n' ], [ disp, 'm' ], [ short, 'm' ] ];
  for (const [t, f] of opts) {
   const w = f === 'n' ? textW(t, 1) : wM(t);
   if (w <= room) {
    const c = place(w);
    if (f === 'n') X0.call(this, t, Math.round(c - w / 2), y, 1, col, 'left'); else textMini(t, c, y, col);
    last = {
     t: t,
     f: f,
     x0: c - w / 2,
     x1: c + w / 2,
     y: y,
     gap: Z
    };
    return;
   }
  }
  if (typeof textFit333 === 'function') {
   textFit333(short, (Z.x0 + Z.x1) / 2, y, 5, col, room);
   last = {
    t: short,
    f: 'fit',
    x0: Z.x0,
    x1: Z.x1,
    y: y,
    gap: Z
   };
  } else {
   X0.call(this, short, cx, y, 1, col, 'center');
   last = {
    t: short,
    f: 'n!',
    gap: Z
   };
  }
 }
 if (typeof X0 === 'function') {
  window.text = function(s, x, y, sc, col, align) {
   if (y === 10 && align === 'center' && (sc == null || sc === 1) && typeof s === 'string' && typeof W === 'number' && x === W / 2 && typeof DIFF_NAMES !== 'undefined' && DIFF_NAMES.some(n => s === n || s === n + ' - 2PT')) {
    last = null;
    drawLabel.call(this, s, x, y, col);
    return;
   }
   return X0.apply(this, arguments);
  };
 }
 window.V40NM = {
  on: true,
  NEW: NEW,
  label: () => last
 };
})();
