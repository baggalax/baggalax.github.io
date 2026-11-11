/* v464wd.js - THE WHALE / THE CROWN stay on through a dodge (Bagga Lax V41.1.x).
   Bug (Charlie, Nov 9 2026): wearing the Whale, a roll or split dodge flashed the player back to the team's normal kit (a dark back view
   on the roll's middle steps), then the Whale came back when the dodge ended. Shots / wind-ups drawn on the dodger path did the same.
   Why: v442anim.js draws its roll / split / shot bodies through `draw0`, the RL12.draw it captured when it loaded. v445fit.js loads later
   and wraps RL12.draw / draw12ns to paint the fit, so every v442 body skipped the fit and baked the plain team kit.
   Fix (no edit to v442 / v445): only for a fit kit and only on those v442 paths, the kit handed to v442 carries a private g27 marker.
   sprites12's bake asks RL12.g27 per pixel for such a kit, which tells us WHICH frame it is baking; when that baked canvas is drawn, we draw
   v445's fit bake of the same frame (same anchor, same facing) instead. Every other draw passes straight through.
   Kill switch: window.__rl_no464wd = true (before load = never installs; at any time = old behaviour from the next frame). */
(function(){
 'use strict';
 if (window.__rl_no464wd) return;
 if (typeof RL12 === 'undefined' || !RL12.FR) return;
 const F = window.V445;
 if (!F || typeof F.bakeFit !== 'function' || typeof window.drawDodger12s !== 'function') return;
 const R = RL12, FR = R.FR, MK = 'w464|';
 const ST = window.__rl464wd = { on: true, runs: 0, swaps: 0, named: 0, unmark: 0, err: 0 };
 const off = () => !!window.__rl_no464wd || !!window.__rl_no442anim || !(window.__rl442 && window.__rl442.on) || !F.on();
 const isFit = kit => !!(kit && (kit.fit45 === 'whale' || kit.fit45 === 'crown') && !kit.g27);
 const orig = new WeakMap;   // marked kit -> the real fit kit
 const marked = new Map;     // fit kit -> its marked twin (kept small)
 function markOf(kit) {
  let m = marked.get(kit);
  if (!m) { m = Object.assign({}, kit, { g27: MK + kit.fit45 }); orig.set(m, kit); if (marked.size > 40) marked.clear(); marked.set(kit, m); }
  return m;
 }
 const realKit = kit => (kit && orig.get(kit)) || kit;

 /* which v442 paths draw through its old draw0 (copied from v442anim's drawDodger12s wrapper) */
 function v442body(p) {
  const A = p && p.dodgeA, S = window.__rl442;
  if (A) return A.kind === 'roll' || (A.kind === 'split' && !A.k286);
  try { if (p.shot20 && S.shotOf && S.shotOf(p)) return true; } catch (e) {}
  try { if (S.windOf && S.windOf(p) >= 0) return true; } catch (e) {}
  return false;
 }

 /* 1) sprites12 bake asks RL12.g27 per pixel for a marked kit: note the frame, keep the stock colours (that canvas is never shown) */
 let pend = null;
 const g270 = R.g27;
 R.g27 = function(kit, ch, q, r, rows, name) {
  if (kit && typeof kit.g27 === 'string' && kit.g27.indexOf(MK) === 0) { if (!pend || pend.name !== name || pend.rows !== rows) pend = { name: name, rows: rows }; return null; }
  return typeof g270 === 'function' ? g270.apply(this, arguments) : null;
 };

 /* 2) baked canvas -> {name, flip}; flip read off the canvas's own pixels against the frame rows (once per canvas) */
 const canv = new WeakMap;
 function learn(c) {
  let k = canv.get(c);
  if (k) return k;
  const P = pend; pend = null;
  if (!P || !P.rows || !P.rows.length) return null;
  const rows = P.rows, h = rows.length, w = rows[0].length;
  if (c.width !== w || c.height !== h) return null;
  let a = 0, b = 0;
  try {
   const d = c.getContext('2d').getImageData(0, 0, w, h).data;
   for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
    const on = rows[r][q] !== '.';
    if ((d[(r * w + q) * 4 + 3] > 0) === on) a++;
    if ((d[(r * w + (w - 1 - q)) * 4 + 3] > 0) === on) b++;
   }
  } catch (e) { return null; }
  k = { name: P.name, flip: b > a };
  canv.set(c, k);
  ST.named++;
  return k;
 }

 /* 3) while a fit dodger is drawn by v442: its body canvases are swapped for v445's fit bake of the same frame */
 function swapDraw(gx, real, cur) {
  const di0 = gx.drawImage, own = Object.prototype.hasOwnProperty.call(gx, 'drawImage');
  gx.drawImage = function(c, X, Y) {
   if (arguments.length === 3 && c && c.tagName === 'CANVAS') {
    try {
     const k = learn(c), f = k && FR[k.name];
     if (f) {
      const sk = (() => { try { return typeof skinOf === 'function' ? skinOf(cur.pl) : 0; } catch (e) { return 0; } })();
      let gr = null; try { gr = window.V17 && V17.gearOfP ? V17.gearOfP(cur.pl, real) : null; } catch (e) {}
      const fc = F.bakeFit(k.name, real, k.flip, sk, gr || {}, true, true), f2 = FR[k.name + '__w45'];
      if (fc && f2) {
       const w = f[3][0].length, fr = !k.flip, x = X + (fr ? f[0] : w - 1 - f[0]), y = Y + f[1];
       const w2 = f2[3][0].length, ax = fr ? f2[0] : w2 - 1 - f2[0], pad = fc.pad17 || 0;
       ST.swaps++;
       return di0.call(this, fc, x - ax - pad, y - f2[1] - pad);
      }
     }
    } catch (e) { ST.err++; }
   }
   return di0.apply(this, arguments);
  };
  return () => { if (own) gx.drawImage = di0; else delete gx.drawImage; };
 }
 const dd0 = window.drawDodger12s;
 window.drawDodger12s = function(p, kit, faceRight) {
  if (off() || !p || !isFit(kit) || typeof g === 'undefined' || !g || !v442body(p)) return dd0.apply(this, arguments);
  let undo = null;
  try { undo = swapDraw(g, kit, p); } catch (e) { ST.err++; return dd0.apply(this, arguments); }
  ST.runs++;
  pend = null;
  try { return dd0.call(this, p, markOf(kit), faceRight); }
  finally { pend = null; try { undo(); } catch (e) {} }
 };

 /* 4) if a marked kit ever reaches the normal sprite doors (a v442 path that falls back), hand them the real fit kit */
 const ns0 = window.draw12ns;
 if (typeof ns0 === 'function') window.draw12ns = function(name, x, y, kit) {
  const r = orig.get(kit);
  if (r) { ST.unmark++; const a = Array.prototype.slice.call(arguments); a[3] = r; return ns0.apply(this, a); }
  return ns0.apply(this, arguments);
 };
 const rd0 = R.draw;
 R.draw = function(gx, name, x, y, kit) {
  const r = orig.get(kit);
  if (r) { ST.unmark++; const a = Array.prototype.slice.call(arguments); a[4] = r; return rd0.apply(this, a); }
  return rd0.apply(this, arguments);
 };
 if (window.V17 && typeof V17.drawP === 'function') {
  const dp0 = V17.drawP;
  V17.drawP = function(gx, n, p, kit) {
   const r = orig.get(kit);
   if (r) { ST.unmark++; const a = Array.prototype.slice.call(arguments); a[3] = r; return dp0.apply(this, a); }
   return dp0.apply(this, arguments);
  };
 }
 window.V464WD = { realKit: realKit, isFit: isFit, ST: ST };
})();
