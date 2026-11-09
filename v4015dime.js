(function() {
 'use strict';
 if (typeof drawCoin15 !== 'function') return;
 const on = () => !window.__rl_no4015dime && !window.__rl_v124gb;
 const PAL0 = {
  O: '#0d2842',
  D: '#2e96d6',
  d: '#58bef0',
  M: '#8cdeff',
  L: '#c4f2ff',
  W: '#ffffff',
  S: '#142c46',
  s: '#46628a',
  h: '#dff7ff',
  G: '#e3eaf0'
 };
 const pal = () => window.V39C && V39C.PAL || PAL0;
 const BIG401 = [ ".............OOOOOO.............", "..........OOOLLLWWWOOO..........", "........OOWWWLSSSSWMMMOO........", "......OOLLLSSSMMMMSSSWLLOO......", ".....OOWLSSMMMMMMMMMMSSLMOO.....", "....OWWSSMMMMMMMMMMMMMMSSMLO....", "...OOLSSMMMMOOOOOOOOMMMMSSLOO...", "...OLSSMMMOODDDDDDDDOOMMMSSLO...", "..OWWSMMMODDDDDDDDDWWDOMMMSDDO..", "..OWSMMMODDDDDDDDDDDWWDOMMMSDO..", ".OLWSMMODDDDDDDDDDDDDDWDOMMSDMO.", ".OLSMMMODDDDDDDDDDDDDDDDOMMMSMO.", ".OLSMMODDDDDDDDDDDDDDDDDDOMMSMO.", "OWWSMMODDDDDDDDDDDDDDDDDDOMMSDDO", "OWSMMMOOOOOOOOOOOOOOOOOOOOMMMSDO", "OWSMMMODOLLLLLLMMLLLLLLODOMMMSDO", "OLSMMMODOLLOOLLMMLLOOLLODOMMMSMO", "OLSMMMODOLLOOLLMMLLOOLLODOMMMSMO", "OLMSMMODOLLLLLLMMLLLLLLODOMMSMMO", ".OWSMMODOssssssssssssssODOMMSDO.", ".OWSMMMODOLLLLLMMLLLLLODOMMMSDO.", ".OWMSMMODOssssssssssssODOMMSDDO.", "..OMSMMMODOOWWWWWWWWOODOMMMSDO..", "..OMMSMMMOOOWWWWWWWWOOOMMMSDDO..", "...OLSMMMMMOOOOOOOOOOMMMMMSDO...", "...OOLSSMMMMMMMMMMMMMMMMSSDOO...", "....OLDSSMMMMMMMMMMMMMMSSDDO....", ".....OODLSSMMMMMMMMMMSSDDOO.....", "......OOLMMSSSMMMMSSSDDDOO......", "........OODDDMSSSSDMDDOO........", "..........OOOMMMDDDOOO..........", ".............OOOOOO............." ];
 function headsMap() {
  const C = window.V39C;
  try {
   if (C && C.FACE401 && C.FACE401.on() && C.FACE401.BIG) return C.FACE401.BIG;
  } catch (e) {}
  try {
   if (C && C.FACE40 && C.FACE40.on() && C.FACE40.BIG) return C.FACE40.BIG;
  } catch (e) {}
  return BIG401;
 }
 const GLYPH = [ "#####...##....", "######..##....", "##..##..##....", "##..##..##....", "#####...##....", "######..##....", "##...##.##....", "##...##.##....", "##...##.##....", "#######.######", "######..######" ];
 const tailsCache = {};
 function tailsMap(H) {
  const key = H.join('|');
  if (tailsCache[key]) return tailsCache[key];
  const N = H.length, c0 = (N - 1) / 2, m = H.map(r => r.split(''));
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
   const d = Math.hypot(i - c0, j - c0);
   if (d < 11.4 && m[j][i] !== '.' && m[j][i] !== 'S') m[j][i] = 'M';
  }
  const gw = GLYPH[0].length, gh = GLYPH.length, ox = Math.round(c0 - gw / 2 + .5), oy = Math.round(c0 - gh / 2 + .5);
  const isG = (x, y) => y >= 0 && y < gh && x >= 0 && x < gw && GLYPH[y][x] === '#';
  for (let y = -1; y <= gh; y++) for (let x = -1; x <= gw; x++) {
   if (isG(x, y)) continue;
   let n = false;
   for (let a = -1; a <= 1 && !n; a++) for (let b = -1; b <= 1; b++) if (isG(x + a, y + b)) {
    n = true;
    break;
   }
   if (n) m[oy + y][ox + x] = 'O';
  }
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (isG(x, y)) m[oy + y][ox + x] = !isG(x, y - 1) || !isG(x - 1, y) ? 'L' : 'D';
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (isG(x, y) && (!isG(x + 1, y) && isG(x - 1, y) || !isG(x, y + 1) && isG(x, y - 1)) && m[oy + y][ox + x] === 'D') m[oy + y][ox + x] = 's';
  return tailsCache[key] = m.map(r => r.join(''));
 }
 const spr = {};
 function sprite(map, cell, kind) {
  const k = kind + ':' + cell + ':' + map.join('');
  if (spr[k]) return spr[k];
  const P = pal(), N = map.length, c = document.createElement('canvas');
  c.width = c.height = N * cell;
  const x = c.getContext('2d');
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
   const ch = map[j][i];
   if (ch === '.') continue;
   x.fillStyle = kind === 'edge' ? j % 2 ? '#46628a' : '#c4f2ff' : kind === 'shadow' ? '#000' : P[ch] || '#f0f';
   x.fillRect(i * cell, j * cell, cell, cell);
  }
  if (kind === 'edge') {
   x.globalCompositeOperation = 'source-atop';
   x.fillStyle = 'rgba(13,40,66,.55)';
   x.fillRect(0, 0, N * cell, 3 * cell);
   x.fillRect(0, (N - 3) * cell, N * cell, 3 * cell);
  }
  return spr[k] = c;
 }
 const DIR = [ Math.sin(115 * Math.PI / 180), -Math.cos(115 * Math.PI / 180) ];
 const cellsOf = {};
 function cells(map) {
  const k = map.join('');
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
 function shine(ctx, map, cell, dx, dy, t) {
  const ph = (t % 2.6 + 2.6) % 2.6 / 2.6, uc = -.62 + 2.16 * ph, w = .05;
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
 const SCALE = 1.2;
 const LOG = {
  draws: 0,
  face: null,
  sq: 1,
  hid: 0,
  title: 0,
  err: null
 };
 function drawDime(cx, cy, sq, side, face, landedT) {
  const ctx = g, m = ctx.getTransform(), rr = Math.abs(m.a) || 1;
  const H = headsMap(), map = face === 'T' ? tailsMap(H) : H, N = map.length;
  const cell = Math.max(1, Math.round(rr * SCALE)), size = N * cell;
  const pcx = m.a * cx + m.c * cy + m.e, pcy = m.b * cx + m.d * cy + m.f;
  const fw = Math.max(0, Math.round(size * sq)), dy = Math.round(pcy - size / 2);
  const th = sq < .985 ? Math.max(cell, Math.round(cell * 3 * Math.sqrt(Math.max(0, 1 - sq * sq)))) : 0;
  const left = Math.round(pcx - (fw + th) / 2);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = .85;
  ctx.drawImage(sprite(map, cell, 'shadow'), left, dy + 2 * cell, Math.max(cell, fw + th), size);
  ctx.globalAlpha = 1;
  const fx = side > 0 ? left : left + th;
  if (th) {
   const E = sprite(map, cell, 'edge'), ew = Math.max(cell, fw);
   for (let k = cell; k <= th; k += cell) ctx.drawImage(E, side > 0 ? fx + k : fx - k, dy, ew, size);
  }
  if (fw >= cell) ctx.drawImage(sprite(map, cell, 'face'), fx, dy, fw, size);
  if (landedT != null && fw === size) shine(ctx, map, cell, fx, dy, landedT);
  ctx.restore();
  LOG.draws++;
  LOG.face = face;
  LOG.sq = sq;
 }
 const _draw = drawCoin15;
 function drawCoin4015() {
  if (!on()) return _draw.apply(this, arguments);
  const G = game, c = G && G.coin;
  if (!c || c.phase === 'done') return _draw.apply(this, arguments);
  const cx = W / 2, rcx = Math.round(cx);
  let cy = 70, sq = 1, face = c.res || 'H', side = 1, landed = null;
  if (c.phase === 'flip') {
   const k = clamp(c.t / COIN15.flip, 0, 1);
   cy = 70 - Math.sin(k * Math.PI) * 38;
   const cs = Math.cos(c.t * 22);
   sq = Math.abs(cs);
   side = cs >= 0 ? 1 : -1;
   face = Math.floor(c.t * 22 / Math.PI) % 2 ? 'T' : 'H';
   if (k >= 1) {
    face = c.res;
    sq = 1;
   }
  } else if (c.phase === 'call' || c.phase === 'cpucall' || c.phase === 'netwait') {
   sq = 1;
   face = 'H';
  } else {
   landed = c.t;
  }
  const ctx = g, E0 = ctx.ellipse, T0 = window.text;
  let hid = false;
  try {
   ctx.ellipse = function(x, y, rx, ry) {
    if (x === rcx && (ry === 15 || ry === 13)) {
     hid = true;
     return;
    }
    return E0.apply(this, arguments);
   };
   window.text = function(s, x, y, sc, col) {
    if (sc === 2 && col === '#7a5410' && (s === 'H' || s === 'T')) return;
    if (s === 'COIN TOSS' && y === 6 && sc === 3) {
     LOG.title++;
     return T0.call(this, 'DIME TOSS', x, y, sc, col, arguments[5], arguments[6]);
    }
    return T0.apply(this, arguments);
   };
   _draw.apply(this, arguments);
  } finally {
   try {
    delete ctx.ellipse;
   } catch (e) {}
   if (ctx.ellipse !== E0) ctx.ellipse = E0;
   window.text = T0;
  }
  if (hid) LOG.hid++;
  try {
   const up = clamp((70 - cy) / 38, 0, 1), sw = Math.round(16 - 8 * up), fy = 92;
   g.fillStyle = 'rgba(0,0,0,' + (.5 - .3 * up).toFixed(3) + ')';
   g.fillRect(rcx - sw, fy, sw * 2, 2);
   g.fillRect(rcx - sw + 2, fy - 1, sw * 2 - 4, 1);
   g.fillRect(rcx - sw + 2, fy + 2, sw * 2 - 4, 1);
   drawDime(cx, Math.round(cy), sq, side, face, landed);
  } catch (e) {
   LOG.err = String(e && e.message || e);
  }
 }
 window.drawCoin15 = drawCoin4015;
 window.V4015 = {
  on: on,
  LOG: LOG,
  headsMap: headsMap,
  tailsMap: tailsMap,
  drawDime: drawDime,
  orig: _draw
 };
})();
