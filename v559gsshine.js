/* v559gsshine.js - Good Stick sticks SHINE on the players who carry them (Bagga Lax).
   Charlie, Nov 12: "the goodsticks look the same on players rn, give em that shine ... like in game, and in lobby".
   Root cause: the only stick shine was v504gs.js's lobby shimmer, and it only ran on the big lobby hero when he wore
   the GOOD STICK CO. kit (isGsKit + the chest-logo plan). Any other team's player carrying a GOOD STICK SHORTIE / GOALIE
   STICK got no shine in the lobby, and nothing ever drew a shine in a match: in play the stick is part of the baked
   gear sprite (items17 bakeGear via V17.drawP) or the dodge hand stick (v442anim stick2), and neither has an
   animated layer for Good Stick ('cstick' art = flat colours).
   Fix (drawing only, only while Good Stick is released = GSC501.packOn(), the same gate that shows the pack):
   - a crisp pixel shine sweeps down the stick every 1.8 s: a 1-2 px white core with gold (#ffe14d) edges travelling
     from the head tip down the shaft, pixel-snapped (1 sprite pixel = 1 rect, no blur, no glow), and a tiny pixel
     sparkle on the head tip as it finishes.
   - MATCHES (offline and online, both teams): every player whose in-game gear stick (V17.gearOfP, which online is
     the loadout both phones already exchange in the lobby) is a Good Stick, on the baked body sprite and on the
     dodge hand stick. A peer whose stick is not known = no shine (nothing added to the net).
   - LOBBY / LOCKER / PLAYER PREVIEW (the big front-view hero): any player with a Good Stick in his gear, any kit.
     On the GOOD STICK CO. kit this sweep replaces v504's white one (same place, so they never double up).
   No ids, rl_* keys, saves or net protocol change. Outside the ~0.55 s sweep window nothing is drawn at all.
   Kill switch: window.__rl_no559gs = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no559gs || W.GS559) return;
 const S = W.GS559 = { err: [], n: { match: 0, hand: 0, lobby: 0 }, fix: null, PER: 1.8, SW: 0.55 };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!(W.__rl_no559gs || W.__rl_no504gs || W.__rl_no501gsc || W.__rl_v124gb);
 const IDS = { stick_gsc_shortie: 1, stick_gsc_goalie: 1 };
 const GOLD = '#ffe14d', WHITE = '#ffffff';
 const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

 // ---------- gate + timing ----------
 let relT = -9, rel = false;
 function released() {
  const t = now();
  if (t - relT > 1) { relT = t; try { rel = !!(W.GSC501 && typeof GSC501.packOn === 'function' && GSC501.packOn()); } catch (e) { rel = false; } }
  return rel;
 }
 // phase inside the cycle (seconds); the sweep is drawn only while ph < SW (+ the tip sparkle just after)
 function phase() { return S.fix != null ? S.fix : now() % S.PER; }
 const live = ph => ph < S.SW + 0.12;

 // ---------- which players carry a Good Stick ----------
 let gsT = -9, gsMap = new Map;
 function isGsP(p) {
  const t = now();
  if (t - gsT > 0.5) { gsT = t; gsMap = new Map; }
  const id = p.pl.id;
  let v = gsMap.get(id);
  if (v === undefined) {
   v = false;
   try { const gr = W.V17 && V17.gearOfP ? V17.gearOfP(p.pl, p._kit) : null; v = !!(gr && IDS[gr.stick]); } catch (e) {}
   gsMap.set(id, v);
  }
  return v;
 }

 // ---------- stick geometry: cells + distance along the stick from the head tip ----------
 // pts: flat [x, y, part, ...] in drawn sprite pixels, part 0 = shaft, 1 = head rim, 2 = head mesh.
 // Returns { c: [x, y, s, part, ...], L, tx, ty }; s = distance along the stick from the head tip
 function geo(pts) {
  const n = pts.length / 3;
  if (!n) return null;
  let hx = 0, hy = 0, hn = 0;
  for (let i = 0; i < n; i++) if (pts[i * 3 + 2]) { hx += pts[i * 3]; hy += pts[i * 3 + 1]; hn++; }
  let bx, by;
  if (hn) {
   hx /= hn; hy /= hn;
   let bd = -1;   // butt = shaft cell farthest from the head
   for (let i = 0; i < n; i++) { const dx = pts[i * 3] - hx, dy = pts[i * 3 + 1] - hy, d = dx * dx + dy * dy; if (d > bd) { bd = d; bx = pts[i * 3]; by = pts[i * 3 + 1]; } }
  } else { // no head drawn: the two farthest cells, the upper one is the tip end
   let bd = -1, a = 0, b = 0;
   for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const dx = pts[i * 3] - pts[j * 3], dy = pts[i * 3 + 1] - pts[j * 3 + 1], d = dx * dx + dy * dy; if (d > bd) { bd = d; a = i; b = j; } }
   if (pts[a * 3 + 1] > pts[b * 3 + 1]) { const q = a; a = b; b = q; }
   hx = pts[a * 3]; hy = pts[a * 3 + 1]; bx = pts[b * 3]; by = pts[b * 3 + 1];
  }
  let tx = hx, ty = hy, td = -1;   // tip = head cell farthest from the butt
  for (let i = 0; i < n; i++) if (pts[i * 3 + 2] || !hn) { const dx = pts[i * 3] - bx, dy = pts[i * 3 + 1] - by, d = dx * dx + dy * dy; if (d > td) { td = d; tx = pts[i * 3]; ty = pts[i * 3 + 1]; } }
  let ax = bx - tx, ay = by - ty;
  const L = Math.hypot(ax, ay) || 1;
  ax /= L; ay /= L;
  const c = [];
  for (let i = 0; i < n; i++) {
   const x = pts[i * 3], y = pts[i * 3 + 1], h = pts[i * 3 + 2], s = (x - tx) * ax + (y - ty) * ay;
   // across the head the band runs on a slant (a glint), along the shaft it is straight across
   c.push(x, y, h ? s - 0.8 * ((x - tx) * -ay + (y - ty) * ax) : Math.max(0, Math.min(L, s)), h);
  }
  return { c: c, L: L, tx: tx, ty: ty };
 }
 const isStk = ch => ch === 'X' || ch === 'M' || ch === 'm' || ch === 'n';
 const frameC = new Map;
 function frameGeo(name, flip) {
  const key = name + (flip ? '<' : '>');
  if (frameC.has(key)) return frameC.get(key);
  let G = null;
  try {
   const f = RL12.FR[name], rows = f && f[3];
   if (rows && rows.length) {
    const w = rows[0].length, pts = [];
    for (let r = 0; r < rows.length; r++) { const row = rows[r]; for (let q = 0; q < row.length; q++) { const ch = row[q]; if (isStk(ch)) pts.push(flip ? w - 1 - q : q, r, ch === 'X' ? 0 : ch === 'M' ? 1 : 2); } }
    G = geo(pts);
   }
  } catch (e) { fail('frame', e); }
  if (frameC.size > 3000) frameC.clear();
  frameC.set(key, G);
  return G;
 }

 // ---------- the shine itself ----------
 // gx: context, G: geometry, ox/oy: where sprite pixel (0,0) lands, k: pixel size, yOf: optional per-row shift
 function paint(gx, G, ox, oy, k, ph, yOf) {
  if (!G) return 0;
  const c = G.c, L = G.L;
  let n = 0;
  const fs0 = gx.fillStyle;
  if (ph < S.SW) {
   const ctr = -2.5 + (L + 5) * (ph / S.SW);   // band centre in sprite pixels from the tip
   // dark shaft: white core, gold edges. Head: a thin slanted glint, gold on the white rim, white on the grey mesh.
   // two passes (white, then gold) so the fill colour changes twice per stick, not per pixel
   for (let pass = 0; pass < 2; pass++) {
    gx.fillStyle = pass ? GOLD : WHITE;
    for (let i = 0; i < c.length; i += 4) {
     const h = c[i + 3], d = Math.abs(c[i + 2] - ctr);
     if (d > (h ? 0.95 : 2.2)) continue;
     const white = h ? h === 2 : d <= 1.05;
     if (white === !!pass) continue;
     const y = c[i + 1];
     gx.fillRect(Math.round(ox + c[i] * k), Math.round(oy + y * k - (yOf ? yOf(y) : 0)), k, k);
     n++;
    }
   }
  } else {   // tip sparkle: a pixel plus-sign on the head tip, white centre, gold arms
   const x = Math.round(ox + G.tx * k), y = Math.round(oy + G.ty * k - (yOf ? yOf(G.ty) : 0));
   gx.fillStyle = GOLD;
   gx.fillRect(x - k, y, k, k); gx.fillRect(x + k, y, k, k); gx.fillRect(x, y - k, k, k); gx.fillRect(x, y + k, k, k);
   gx.fillStyle = WHITE;
   gx.fillRect(x, y, k, k);
   n = 5;
  }
  gx.fillStyle = fs0;
  return n;
 }

 // ---------- 1) matches: the baked body sprite ----------
 const fitFrame = (name, kit) => {
  try { if (kit && (kit.fit45 === 'whale' || kit.fit45 === 'crown') && !kit.g27 && !W.__rl_no445fit && RL12.FR[name + '__w45']) return name + '__w45'; } catch (e) {}
  return name;
 };
 function matchShine(p, ph) {
  const kit = p._kit, faceRight = !!p._fright, name = fitFrame(p._fr, kit), f = RL12.FR[name];
  if (!f) return;
  const G = frameGeo(name, !faceRight);
  if (!G) return;
  const x = Math.round(p.x), y = Math.round(p.y), w = f[3][0].length, ax = faceRight ? f[0] : w - 1 - f[0];
  const ctx = g;
  const run = () => {
   const a0 = ctx.globalAlpha; ctx.globalAlpha = 1;
   if (paint(ctx, G, x - ax, y - f[1], 1, ph)) { S.n.match++; if (S.dbg) try { const m = ctx.getTransform(); (S.dbgL = S.dbgL || []).push({ id: p.pl.id, x: m.a * x + m.e, y: m.d * y + m.f, k: m.a, fr: name }); if (S.dbgL.length > 40) S.dbgL.shift(); } catch (e) {} }
   ctx.globalAlpha = a0;
  };
  if (typeof scaled12 === 'function') scaled12(p.x, p.y, run); else run();
 }
 function hookMatch() {
  const d0 = W.drawPlayer12;
  if (typeof d0 !== 'function' || d0.__gs559) return typeof d0 === 'function';
  const d1 = function (p) {
   const r = d0.apply(this, arguments);
   try {
    if (off()) return r;
    const ph = phase();
    if (live(ph) && p && p.pl && !p.ns17 && p._fr && released() && typeof game !== 'undefined' && game && game.g17 && isGsP(p)) matchShine(p, ph);
   } catch (e) { fail('match', e); }
   return r;
  };
  d1.__gs559 = true;
  W.drawPlayer12 = d1;
  return true;
 }

 // ---------- 2) matches: the dodge hand stick (v442anim stick2 / game.js drawHandStick) ----------
 const normC = (() => { let cx = null; return c => { try { cx = cx || document.createElement('canvas').getContext('2d'); cx.fillStyle = '#000'; cx.fillStyle = c; return String(cx.fillStyle).toLowerCase(); } catch (e) { return String(c).toLowerCase(); } }; })();
 const colC = new Map;
 function handCols(p) {
  const id = p.pl.id;
  let o = colC.get(id);
  if (o && now() - o.t < 2) return o.m;
  const m = {};
  try {
   const sc = V17.handStickCols && V17.handStickCols(p);
   if (sc) { for (const k of [ 'n', 'm' ]) if (sc[k]) m[normC(sc[k])] = 3; if (sc.M) m[normC(sc.M)] = 2; if (sc.X) m[normC(sc.X)] = 1; }
  } catch (e) {}
  if (colC.size > 200) colC.clear();
  colC.set(id, { t: now(), m: m });
  return m;
 }
 function hookHand() {
  const h0 = W.drawHandStick;
  if (typeof h0 !== 'function' || h0.__gs559) return typeof h0 === 'function';
  const h1 = function () {
   let p = null, ph = 0;
   try {
    if (!off()) { ph = phase(); p = W.__v17p; if (!(live(ph) && p && p.pl && released() && typeof game !== 'undefined' && game && game.g17 && isGsP(p))) p = null; }
   } catch (e) { p = null; }
   if (!p) return h0.apply(this, arguments);
   const ctx = g, cols = handCols(p), pts = [];
   const own = Object.prototype.hasOwnProperty.call(ctx, 'fillRect'), prev = own ? ctx.fillRect : null, fr0 = ctx.fillRect;
   ctx.fillRect = function (x, y, w, h) { if (w === 1 && h === 1) { const t = cols[ctx.fillStyle]; if (t) pts.push(x, y, t - 1); } return fr0.call(this, x, y, w, h); };
   let r;
   try { r = h0.apply(this, arguments); }
   finally { if (own) ctx.fillRect = prev; else delete ctx.fillRect; }
   try {
    if (pts.length >= 9) { const a0 = ctx.globalAlpha; ctx.globalAlpha = 1; if (paint(ctx, geo(pts), 0, 0, 1, ph)) S.n.hand++; ctx.globalAlpha = a0; }
   } catch (e) { fail('hand', e); }
   return r;
  };
  h1.__gs559 = true;
  W.drawHandStick = h1;
  return true;
 }

 // ---------- 3) lobby / locker / player preview: the big front-view hero ----------
 function heroGs(kit) {
  const pid = W.__v17hp;
  if (!pid || !W.V17) return false;
  try { if (V17.heroNoStick && V17.heroNoStick(pid)) return false; } catch (e) {}
  try { const gr = V17.heroGear ? V17.heroGear(pid, kit) : null; return !!(gr && IDS[gr.stick]); } catch (e) { return false; }
 }
 function hookLobby() {
  const L0 = W.lobbyHero;
  if (typeof L0 !== 'function' || L0.__gs559) return typeof L0 === 'function';
  const L1 = function (cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) {
   let on = false;
   try { on = !off() && !gray && k > 0 && released() && heroGs(kit); } catch (e) { on = false; }
   if (!on) return L0.apply(this, arguments);
   // this sweep replaces v504's white shimmer on this hero (its test clock at 0 parks its band off the stick)
   const had = Object.prototype.hasOwnProperty.call(W, '__gs504t'), sv = W.__gs504t;
   W.__gs504t = 0;
   let r;
   try { r = L0.apply(this, arguments); }
   finally { if (had) W.__gs504t = sv; else { try { delete W.__gs504t; } catch (e) { W.__gs504t = undefined; } } }
   try {
    const ph = phase();
    if (live(ph)) {
     const name = lobbyFrame(pos, side), f = RL12.FR[name];
     if (f) {
      const G = frameGeo(name, !!flip);
      const x0 = lobbyHeroGeo(cx, pos, k, flip, side).x0 + Math.round(slide || 0), y0 = Math.round(feetY - f[1] * k);
      const br = Math.round((Math.sin(t * 2.4) + 1) * .75), cut = Math.max(1, f[1] - 12);
      const a0 = g.globalAlpha;
      g.globalAlpha = alpha == null ? 1 : alpha;
      if (paint(g, G, x0, y0, k, ph, y => (y < cut ? br : 0))) S.n.lobby++;
      g.globalAlpha = a0;
     }
    }
   } catch (e) { fail('lobby', e); }
   return r;
  };
  L1.__gs559 = true;
  W.lobbyHero = L1;
  return true;
 }

 function install() {
  let ok = true;
  try { ok = hookMatch() && ok; } catch (e) { fail('hm', e); }
  try { ok = hookHand() && ok; } catch (e) { fail('hh', e); }
  try { ok = hookLobby() && ok; } catch (e) { fail('hl', e); }
  return ok;
 }
 if (!install()) { let n = 0; const iv = setInterval(() => { if (install() || ++n > 40) clearInterval(iv); }, 500); }
})();
