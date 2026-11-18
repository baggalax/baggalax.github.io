/* v543gsboard.js - the single GOOD STICK board you can actually see while you play (Bagga Lax).
   Why it was missed: v537gslook.js put the Good Stick board into ONE of the 11 small slots of the scrolling board
   strip. That strip creeps sideways (a full lap takes about 7 minutes) and the camera only shows about 60% of it,
   so the board spent long stretches off screen; and when it was on screen it was a 47-unit black tile with a thin
   white logo, drawn on the black strip right beside the bright cyan BAGGA LAX boards - at phone size it read as an
   empty/dark slot, not an ad.
   Fix: sponsor slots marked `pin` (RL_SPONSOR_BOARDS, Good Stick is slot 1) are drawn as their own fixed boards
   at midfield on the top board strip, where every gameplay camera position overlaps (the camera pans 0..FL-W, and
   x 234..300 is in view at every one of them on every screen size). The Good Stick board is a bright
   white board with their logo and GOOD STICK in black pixel letters, 6.5 units tall (bigger than the HUD text), so it
   pops between the cyan Bagga Lax boards. The scrolling strip keeps rolling Bagga Lax under/around it; the old
   scrolling Good Stick tile is turned off so there is still exactly ONE Good Stick board.
   The HUD's "THEIR D: ..." tag (drawn over the board row, right of center) steps just below the strip when it
   would cover the board; anywhere else it stays where it was.
   Good Stick's own stadium is untouched (v537's one long banner) - no pinned board there.
   Reusable: push { id, name, bg, fg, logo, pin: true, on: () => bool } into window.RL_SPONSOR_BOARDS for another
   company; pinned boards sit side by side from midfield out.
   Only while Good Stick is released (same gate as the pack, GSC501.packOn()). No ids, rl_* keys, saves or net protocol
   change. Kill switch: window.__rl_no543gb = true (falls back to v537's scrolling tile). */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_no543gb || W0.GB543) return;
 const S = W0.GB543 = { err: [], drawn: 0, last: null };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!W0.__rl_no543gb;
 const ID = 'GSC';
 const released = () => { try { return !!(W0.GSC501 && typeof GSC501.packOn === 'function' && GSC501.packOn()); } catch (e) { return false; } };
 const inGame = () => { try { return typeof GAME_SCREENS !== 'undefined' && GAME_SCREENS.includes(screen) && typeof game !== 'undefined' && !!game; } catch (e) { return false; } };
 const gscHome = () => { try { return inGame() && typeof homeTeam === 'function' && homeTeam() && homeTeam().id === ID; } catch (e) { return false; } };
 const stripOff = () => !!(W0.__rl_no39b || W0.__rl_v124gb || !W0.V39B);

 // ---- sponsor slot list (shared with v537) ----
 const SP = W0.RL_SPONSOR_BOARDS = W0.RL_SPONSOR_BOARDS || [];
 function adopt() {
  try {
   let gs = SP.find(s => s && s.id === 'goodstick');
   if (!gs) { gs = { id: 'goodstick', img: 'ads/gs486-board.png', on: released }; SP.unshift(gs); }
   if (gs.__gb543) return;
   const on0 = typeof gs.on === 'function' ? gs.on : released;
   Object.assign(gs, { name: 'GOOD STICK', bg: '#f4f4f4', fg: '#141416', edge: '#141416', logo: 'gs486logo96.png', pin: true });
   gs.pinOn = () => { try { return !!on0(); } catch (e) { return false; } };
   // the scrolling small tile (v537) steps aside while this pinned board is on
   gs.on = function () { return off() ? on0.apply(this, arguments) : false; };
   gs.__gb543 = true;
  } catch (e) { fail('adopt', e); }
 }
 adopt();

 // ---- drawing ----
 const imgs = new Map;
 function img(src) {
  if (!src) return null;
  let im = imgs.get(src);
  if (!im) { im = new Image; im.decoding = 'async'; im.onerror = function () { this.__bad = 1; }; im.src = src; imgs.set(src, im); }
  return im.complete && im.naturalWidth > 0 && !im.__bad ? im : null;
 }
 SP.forEach(s => s && s.logo && img(s.logo));
 const CELL = 1.3, ADV = 4 * CELL;               // glyph cell in field units: 6.5 units tall letters (HUD text is 5)
 const tw = s => s.length * ADV - CELL;
 function boardW(s) { const t = String(s.name || '').toUpperCase(); return Math.ceil((s.logo ? 9 : 0) + tw(t) + 6); }
 function glyphs(t, x0, y0, col, m) {
  // device-pixel snapped fills so letters stay crisp at any scale
  g.fillStyle = col;
  const F = typeof FONT !== 'undefined' ? FONT : null;
  if (!F) return;
  for (let i = 0; i < t.length; i++) {
   const gl = F[t[i]] || F['?']; if (!gl) continue;
   for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === '#') {
    const wx = x0 + i * ADV + c * CELL, wy = y0 + r * CELL;
    const X0 = Math.round(m.a * wx + m.e), X1 = Math.round(m.a * (wx + CELL) + m.e);
    const Y0 = Math.round(m.d * wy + m.f), Y1 = Math.round(m.d * (wy + CELL) + m.f);
    g.fillRect(X0, Y0, Math.max(1, X1 - X0), Math.max(1, Y1 - Y0));
   }
  }
 }
 function pinned() {
  const out = [];
  for (const s of SP) {
   if (!s || !s.pin || !s.name) continue;
   const on = typeof s.pinOn === 'function' ? s.pinOn : s.on;
   try { if (typeof on === 'function' && !on()) continue; } catch (e) { continue; }
   out.push(s);
  }
  return out;
 }
 function layout(list, L) {
  // first board starts just left of midfield so its letters sit right of the top sideline ref (he stands at
  // x~240 most of the game, in front of the strip) and the whole board stays inside the part of the strip every
  // camera position shows (232..300 on a 667-wide phone, wider on bigger screens); next ones go right / left of it
  const mid = L / 2, gap = 3, res = [];
  let rx = null, lx = null;
  list.forEach((s, k) => {
   const w = boardW(s);
   let x;
   if (k === 0) { x = Math.round(mid - 26); lx = x; rx = x + w; }
   else if (k % 2) { x = rx + gap; rx = x + w; }
   else { x = lx - gap - w; lx = x; }
   res.push({ s, x, w });
  });
  return res;
 }
 function draw() {
  if (off() || stripOff() || !released() || gscHome()) { S.last = null; return; }
  const list = pinned();
  if (!list.length) { S.last = null; return; }
  const L = typeof FL === 'number' ? FL : 520;
  const BY = V39B.BY || 18, BH = V39B.BH || 11;
  const m = g.getTransform();
  const L40 = V39B.last40;
  const Dy0 = L40 && L40.Dy0 != null ? L40.Dy0 : Math.round(m.f + m.d * (BY + 1));
  const Dy1 = L40 && L40.Dy1 != null ? L40.Dy1 : Math.round(m.f + m.d * (BY + BH));
  const wy0 = (Dy0 - m.f) / m.d, wy1 = (Dy1 - m.f) / m.d, ih = wy1 - wy0;
  const boards = layout(list, L);
  g.save();
  // same holes as the strip (buttons that overlap the board row)
  try {
   const keep = V39B.keep ? V39B.keep() : [];
   const RRv = typeof RR === 'number' ? RR : 1;
   const sy0 = (m.d * BY + m.f) / RRv, sy1 = (m.d * (BY + BH) + m.f) / RRv;
   const holes = keep.filter(k => k[1] < sy1 && k[1] + k[3] > sy0);
   if (holes.length) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.beginPath(); g.rect(-9, -9, 99999, 99999);
    for (const k of holes) g.rect(k[0] * RRv, k[1] * RRv, k[2] * RRv, k[3] * RRv);
    g.clip('evenodd');
   }
  } catch (e) { fail('holes', e); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.imageSmoothingEnabled = true;
  try { g.imageSmoothingQuality = 'high'; } catch (e) {}
  const drawn = [];
  for (const b of boards) {
   const s = b.s, X0 = Math.round(m.a * b.x + m.e), X1 = Math.round(m.a * (b.x + b.w) + m.e);
   // black frame (matches the strip seams), then the board face
   g.fillStyle = '#05070b'; g.fillRect(X0 - Math.max(1, Math.round(m.a)), Dy0 - 1, X1 - X0 + 2 * Math.max(1, Math.round(m.a)), Dy1 - Dy0 + 2);
   g.fillStyle = s.bg || '#f4f4f4'; g.fillRect(X0, Dy0, X1 - X0, Dy1 - Dy0);
   if (s.edge) { g.fillStyle = s.edge; const e = Math.max(1, Math.round(m.d * .5)); g.fillRect(X0, Dy0, X1 - X0, e); g.fillRect(X0, Dy1 - e, X1 - X0, e); }
   const t = String(s.name).toUpperCase();
   let tx = b.x + 3;
   if (s.logo) {
    const lim = img(s.logo), sz = Math.min(8, ih - 1), ly = wy0 + (ih - sz) / 2;
    if (lim) g.drawImage(lim, Math.round(m.a * tx + m.e), Math.round(m.d * ly + m.f), Math.round(m.a * sz), Math.round(m.d * sz));
    else { g.fillStyle = s.fg || '#141416'; g.fillRect(Math.round(m.a * tx + m.e), Math.round(m.d * ly + m.f), Math.round(m.a * sz), Math.round(m.d * sz)); }
    tx += sz + 1.5;
   }
   const ty = wy0 + (ih - 5 * CELL) / 2;
   glyphs(t, tx, ty, s.fg || '#141416', m);
   drawn.push({ id: s.id, x: b.x, w: b.w, dev: [X0, Dy0, X1, Dy1] });
  }
  g.restore();
  S.drawn++;
  S.last = { boards: drawn, xf: [m.a, m.d, m.e, m.f], t: performance.now() };
 }

 function hook() {
  const DS = W0.drawStadium;
  if (typeof DS !== 'function' || DS.__gb543) return !!DS;
  const f = function () {
   const r = DS.apply(this, arguments);
   try { draw(); } catch (e) { fail('draw', e); }
   return r;
  };
  f.__gb543 = true;
  W0.drawStadium = f;
  return true;
 }
 if (!hook()) { let t = 0; const iv = setInterval(() => { if (hook() || ++t > 40) clearInterval(iv); }, 500); }

 // ---- keep the HUD's "THEIR D: ..." tag (v410d / v414b draw it at y 17-26, right of center, over the board row)
 //      from covering the board: only when the tag would overlap a drawn board, it drops just below the strip. ----
 let inHud = false, shiftTag = false;
 function overBoard(x0, x1) {
  const L = S.last; if (!L || !L.boards.length) return false;
  const m = g.getTransform(), a = m.a * x0 + m.e, b = m.a * x1 + m.e;
  return L.boards.some(q => b > q.dev[0] && a < q.dev[2]);
 }
 const TAG_DY = 14;
 function hookHud() {
  const R0 = W0.rect, X0 = W0.text, H0 = W0.drawHUD;
  if (typeof R0 !== 'function' || typeof X0 !== 'function' || typeof H0 !== 'function' || H0.__gb543) return typeof H0 === 'function';
  if (!R0.__gb543) {
   const r1 = function (x, y, w, h, c) {
    if (inHud && !off() && y === 17 && h === 9 && typeof c === 'string' && /^rgba\(0,0,0,\.(72|9)\)$/.test(c.replace(/\s/g, ''))) {
     try { if (overBoard(x, x + w)) { shiftTag = true; S.tagMoved = (S.tagMoved || 0) + 1; return R0.call(this, x, y + TAG_DY, w, h, c); } } catch (e) { fail('tagr', e); }
    }
    return R0.apply(this, arguments);
   };
   r1.__gb543 = true;
   W0.rect = r1;
  }
  if (!X0.__gb543) {
   const x1 = function (s, x, y) {
    if (inHud && shiftTag && y === 18 && /^THEIR D/.test(String(s))) {
     shiftTag = false;
     const a = Array.prototype.slice.call(arguments); a[2] = y + TAG_DY;
     return X0.apply(this, a);
    }
    return X0.apply(this, arguments);
   };
   x1.__gb543 = true;
   W0.text = x1;
  }
  const h1 = function () {
   const was = inHud; inHud = true; shiftTag = false;
   try { return H0.apply(this, arguments); } finally { inHud = was; shiftTag = false; }
  };
  h1.__gb543 = true;
  W0.drawHUD = h1;
  return true;
 }
 if (!hookHud()) { let t = 0; const iv = setInterval(() => { if (hookHud() || ++t > 40) clearInterval(iv); }, 500); }
 setInterval(() => { try { adopt(); hook(); } catch (e) {} }, 1000);
 S.boardW = boardW; S.pinned = pinned; S.layout = layout;
})();
