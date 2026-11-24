/* v598num.js - Bagga Lax 1.5f: back NUMBERS on THE WHALE / THE CROWN.
 * Bug: every uni shows the jersey number on back frames (d8N_*) except The Whale and The Crown.
 * Cause: those two are drawn by v445fit through V17.bakeGear (the gear-bake path, padded '<frame>__w45' frames), and only
 *  the plain uni path (v441num bake4 inside RL12.draw) has a number step.
 * Fix: wrap V17.bakeGear: for a Whale / Crown back frame, copy the baked canvas and draw the same number the same way
 *  v441num does (same 3x5 / 3x4 digit font, same spot from numPos on the base frame, same numColor, mirrored when flipped),
 *  shifted by the __w45 pad (+2, +4) and the gear pad. The bakeGear cache is never changed (copies are kept here).
 * Kill switch: window.__rl_no598num
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__v598num || !Wn.V17 || typeof V17.bakeGear !== 'function' || !Wn.__rl4xx || !__rl4xx.getNum) return; Wn.__v598num = 1;
 const N = Wn.__rl4xx, b0 = V17.bakeGear, COPY = new WeakMap();
 V17.bakeGear = function (name, kit, flip) {
  const c = b0.apply(this, arguments);
  try {
   if (Wn.__rl_no598num || !c || !kit || (kit.fit45 !== 'whale' && kit.fit45 !== 'crown') || !/__w45$/.test(name)) return c;
   const base = name.replace(/__w45$/, ''), num = N.getNum(); if (!num || !N.isFB(base)) return c;
   const np = N.numPos(base); if (!np) return c;
   let m = COPY.get(c); if (!m) { m = new Map(); COPY.set(c, m); }
   const key = num + '|' + (flip ? 1 : 0); let o = m.get(key); if (o) return o;
   o = document.createElement('canvas'); o.width = c.width; o.height = c.height; o.pad17 = c.pad17;
   for (const k of Object.keys(c)) if (!(k in o)) try { o[k] = c[k]; } catch (e) {}
   const x = o.getContext('2d'); x.drawImage(c, 0, 0);
   const pad = c.pad17 || 0, wP = RL12.FR[name][3][0].length, F = np.fh === 5 ? N.F5 : N.F4, ds = String(num).split(''), tw = ds.length * 4 - 1;
   const cx = np.cx + 2, cxs = flip ? wP - 1 - cx : cx, x0 = pad + Math.round(cxs - (tw - 1) / 2), y0 = pad + np.r + 4;
   x.fillStyle = N.numColor(kit);
   ds.forEach((d, i) => { const g = F[d]; for (let r = 0; r < np.fh; r++) for (let q = 0; q < 3; q++) if (g[r][q] === '1') x.fillRect(x0 + i * 4 + q, y0 + r, 1, 1); });
   m.set(key, o); return o;
  } catch (e) { return c; }
 };
})();
