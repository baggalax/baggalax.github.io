(function() {
 'use strict';
 const C = window.V39C;
 if (!C || typeof C.drawCoin !== 'function' || !C.FACE40) return;
 const F40 = C.FACE40;
 const on = () => !window.__rl_no401coin && !window.__rl_v124gb && F40.on();
 const PAL = C.PAL;
 const SMALL = [ ".......OOOOO.......", ".....OOWWWWLOO.....", "...OOWWOMMMOLLOO...", "..OOWOMOOOOOMOdOO..", "..OWMOODDDDWOOMdO..", ".OWMODDDDDDDWDOMdO.", ".OWMODDDDDDDDDOMdO.", "OWMODDDDDDDDDDDOMDO", "OWMOOOOOOOOOOOOOMDO", "OWMODOLLLMLLLODOMDO", "OWMODOLOLMLOLODOMDO", "OLMODOLLLMLLLODOMDO", ".OLODOsssssssODODO.", ".OLdODOWWWWWODOdDO.", "..OdMOOOWWWOOOMDO..", "..OOdDMOOOOOMDDOO..", "...OOddDMMMDDDOO...", ".....OODDDDDOO.....", ".......OOOOO......." ];
 const BIG = [ ".............OOOOOO.............", "..........OOOLLLWWWOOO..........", "........OOWWWLSSSSWMMMOO........", "......OOLLLSSSMMMMSSSWLLOO......", ".....OOWLSSMMMMMMMMMMSSLMOO.....", "....OWWSSMMMMMMMMMMMMMMSSMLO....", "...OOLSSMMMMOOOOOOOOMMMMSSLOO...", "...OLSSMMMOODDDDDDDDOOMMMSSLO...", "..OWWSMMMODDDDDDDDDWWDOMMMSDDO..", "..OWSMMMODDDDDDDDDDDWWDOMMMSDO..", ".OLWSMMODDDDDDDDDDDDDDWDOMMSDMO.", ".OLSMMMODDDDDDDDDDDDDDDDOMMMSMO.", ".OLSMMODDDDDDDDDDDDDDDDDDOMMSMO.", "OWWSMMODDDDDDDDDDDDDDDDDDOMMSDDO", "OWSMMMOOOOOOOOOOOOOOOOOOOOMMMSDO", "OWSMMMODOLLLLLLMMLLLLLLODOMMMSDO", "OLSMMMODOLLOOLLMMLLOOLLODOMMMSMO", "OLSMMMODOLLOOLLMMLLOOLLODOMMMSMO", "OLMSMMODOLLLLLLMMLLLLLLODOMMSMMO", ".OWSMMODOssssssssssssssODOMMSDO.", ".OWSMMMODOLLLLLMMLLLLLODOMMMSDO.", ".OWMSMMODOssssssssssssODOMMSDDO.", "..OMSMMMODOOWWWWWWWWOODOMMMSDO..", "..OMMSMMMOOOWWWWWWWWOOOMMMSDDO..", "...OLSMMMMMOOOOOOOOOOMMMMMSDO...", "...OOLSSMMMMMMMMMMMMMMMMSSDOO...", "....OLDSSMMMMMMMMMMMMMMSSDDO....", ".....OODLSSMMMMMMMMMMSSDDOO.....", "......OOLMMSSSMMMMSSSDDDOO......", "........OODDDMSSSSDMDDOO........", "..........OOOMMMDDDOOO..........", ".............OOOOOO............." ];
 const cache = {};
 function sprite(map, cell) {
  const k = map.length + ':' + cell;
  if (cache[k]) return cache[k];
  const N = map.length, c = document.createElement('canvas');
  c.width = c.height = N * cell;
  const x = c.getContext('2d');
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
   const ch = map[j][i];
   if (ch === '.') continue;
   x.fillStyle = PAL[ch];
   x.fillRect(i * cell, j * cell, cell, cell);
  }
  return cache[k] = c;
 }
 const DIR = [ Math.sin(115 * Math.PI / 180), -Math.cos(115 * Math.PI / 180) ];
 const cellsOf = {};
 function cells(map) {
  const k = map.length;
  if (cellsOf[k]) return cellsOf[k];
  const N = map.length, out = [];
  let lo = 1e9, hi = -1e9;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (map[j][i] !== '.') {
   const u = (i + .5) * DIR[0] + (j + .5) * DIR[1];
   out.push([ i, j, u ]);
   lo = Math.min(lo, u);
   hi = Math.max(hi, u);
  }
  for (const c of out) c[2] = (c[2] - lo) / (hi - lo || 1);
  return cellsOf[k] = out;
 }
 const now = () => (window.performance && performance.now ? performance.now() : Date.now()) / 1e3;
 function shine(ctx, map, cell, dx, dy, t) {
  const ph = (t % 2.6 + 2.6) % 2.6 / 2.6, uc = -.62 + 2.16 * ph, w = map.length >= 24 ? .05 : .06;
  if (uc < -.2 || uc > 1.2) return;
  for (const c of cells(map)) {
   const d = c[2] - uc;
   if (d > -w && d <= w * .25) {
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.fillRect(dx + c[0] * cell, dy + c[1] * cell, cell, cell);
   } else if (d > w * .25 && d < w * 1.6) {
    ctx.fillStyle = 'rgba(160,230,255,.42)';
    ctx.fillRect(dx + c[0] * cell, dy + c[1] * cell, cell, cell);
   }
  }
 }
 function draw401(x, y, big, t) {
  if (typeof SA2403B !== 'undefined' && SA2403B && typeof sa2403By === 'function') y = sa2403By(y);
  const ctx = g, m = ctx.getTransform(), rr = Math.abs(m.a) || 1, map = big ? BIG : SMALL;
  const cell = big ? Math.max(1, Math.round(rr * .5)) : Math.max(1, Math.round(rr * .45)), size = map.length * cell;
  const cx = m.a * (x + 4) + m.c * (y + 4) + m.e, cy = m.b * (x + 4) + m.d * (y + 4) + m.f;
  const dx = Math.round(cx - size / 2), dy = Math.round(cy - size / 2);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite(map, cell), dx, dy);
  shine(ctx, map, cell, dx, dy, t == null ? now() : t);
  ctx.restore();
 }
 const _draw = C.drawCoin, _coin = C.coin;
 C.drawCoin = function(x, y, big, t) {
  if (!on()) {
   sync();
   return _draw.apply(this, arguments);
  }
  sync();
  return draw401(x, y, big, t);
 };
 C.coin = function(x, y, big) {
  if (!on()) {
   sync();
   return _coin.apply(this, arguments);
  }
  try {
   sync();
   draw401(x, y, !!big);
   return true;
  } catch (e) {
   return _coin.apply(this, arguments);
  }
 };
 function url(map, cell) {
  try {
   return sprite(map, cell).toDataURL('image/png');
  } catch (e) {
   return '';
  }
 }
 let css = null;
 const after = (a, b) => !b || !!(b.compareDocumentPosition(a) & 4);
 function sync() {
  try {
   try {
    F40.sync();
   } catch (e) {}
   const el = document.getElementById('v401coin-css'), v39 = document.getElementById('v39cur-css'), v40 = document.getElementById('v40coin-css');
   if (!on() || !v39) {
    if (el) el.remove();
    return;
   }
   if (el && after(el, v39) && after(el, v40)) return;
   if (!css) {
    const s = url(SMALL, 4), b = url(BIG, 3);
    if (!s || !b) return;
    css = 'span.coin17{background-image:url(' + s + ')!important}.bal17 span.coin17{background-image:url(' + b + ')!important}';
   }
   const st = el || document.createElement('style');
   st.id = 'v401coin-css';
   st.textContent = css;
   (document.head || document.documentElement).appendChild(st);
  } catch (e) {}
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
 try {
  sync();
 } catch (e) {}
 window.addEventListener('load', sync);
 C.FACE401 = {
  on: on,
  SMALL: SMALL,
  BIG: BIG,
  sprite: sprite,
  drawCoin: draw401,
  sync: sync
 };
})();
