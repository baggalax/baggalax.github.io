(function() {
 'use strict';
 const off = () => !!(window.__rl_no39b || window.__rl_v124gb);
 const BH = 11, BY = 18;
 const SEAM = 1;
 const v40 = () => !window.__rl_no40b;
 const V39_SCROLL = 2.5;
 const cfg = () => window.RL_ADS39 || {};
 const imgs = new Map;
 function img(src) {
  if (!src) return null;
  let im = imgs.get(src);
  if (!im) {
   im = new Image;
   im.decoding = 'async';
   im.onerror = function() {
    this.__bad = 1;
   };
   im.src = src + (src.indexOf('?') < 0 ? '?v=4000' : '');
   imgs.set(src, im);
  }
  return im.complete && im.naturalWidth > 0 && !im.__bad ? im : null;
 }
 const asList = v => (Array.isArray(v) ? v : v ? [ v ] : []).filter(Boolean);
 function preload() {
  try {
   const c = cfg();
   asList(c.fallback || c.boards).forEach(img);
   for (const k in c.sponsors || {}) asList(c.sponsors[k]).forEach(img);
   if (c.takeoverOn) {
    img(c.takeover);
    img(c.takeoverDefault);
   }
  } catch (e) {}
 }
 function clock() {
  return typeof menuT === 'number' ? menuT : performance.now() / 1e3;
 }
 function inTakeover(c, t) {
  const ev = c.takeoverEvery == null ? 36 : +c.takeoverEvery, fr = Math.max(.5, +c.takeoverFor || 8);
  if (ev < 0) return false;
  if (ev === 0) return true;
  return (t % (ev + fr) + (ev + fr)) % (ev + fr) >= ev;
 }
 function adFor(i, t) {
  const c = cfg(), rot = +c.rotate || 0, step = rot > 0 ? Math.floor(t / rot) : 0;
  const sold = asList((c.sponsors || {})[i + 1]);
  const take = c.takeoverOn ? c.takeover || c.takeoverDefault || null : null;
  if (take && inTakeover(c, t) && (!sold.length || c.takeoverCoversSponsors !== false)) return take;
  if (sold.length) return sold[step % sold.length];
  const fb = asList(c.fallback || c.boards);
  if (!fb.length) return take;
  return fb[(i + step) % fb.length];
 }
 function adForLap(i, lap) {
  const c = cfg(), sold = asList((c.sponsors || {})[i + 1]);
  const take = c.takeoverOn ? c.takeover || c.takeoverDefault || null : null;
  if (take && inTakeover(c, clock()) && (!sold.length || c.takeoverCoversSponsors !== false)) return take;
  if (sold.length) return sold[(lap % sold.length + sold.length) % sold.length];
  const fb = asList(c.fallback || c.boards);
  if (!fb.length) return take;
  return fb[i % fb.length];
 }
 const st = [];
 const ROLL = .35, WAVE = .05;
 let segCache = {
  key: '',
  xs: []
 };
 function segments() {
  const L = typeof FL === 'number' ? FL : 520, c = cfg();
  const n = Math.max(1, Math.round(+c.segments || Math.floor((L - 2 + SEAM) / (45 + SEAM))));
  const v = v40(), key = L + ':' + n + ':' + v;
  if (segCache.key !== key) {
   const xs = [];
   for (let i = 0; i <= n; i++) xs.push(i === 0 ? 0 : i === n ? L : v ? Math.round(i * L / n) : 1 + Math.round(i * (L - 2 + SEAM) / n) - SEAM);
   segCache = {
    key: key,
    xs: xs
   };
   st.length = 0;
  }
  return segCache.xs;
 }
 let keep = [], lastBtns = [];
 function readBtns() {
  const out = [], top = BY - 1, bot = BY + BH + 1;
  try {
   for (const s of typeof uiSpecs !== 'undefined' && uiSpecs || []) {
    if (!s || typeof s.x !== 'number' || s.h > 24 || s.w > W / 2) continue;
    if (s.y < bot && s.y + s.h > top) out.push([ s.x - 1, s.y - 1, s.w + 2, s.h + 2 ]);
   }
  } catch (e) {}
  lastBtns = out;
 }
 function readKeep() {
  keep = lastBtns.slice();
 }
 function drawAd(im, src, x, y, w, h, dy) {
  if (im) {
   g.save();
   g.imageSmoothingEnabled = true;
   try {
    g.imageSmoothingQuality = 'high';
   } catch (e) {}
   g.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight, x, y + dy, w, h);
   g.restore();
  } else {
   rect(x, y + dy, w, h, '#0c1b31');
   const s = /your-ad/i.test(src || '') ? 'YOUR AD HERE' : /takeover-lac/i.test(src || '') ? 'TAKEOVER' : 'BAGGA LAX';
   text(s, x + w / 2, y + dy + 2, 1, /your-ad/i.test(src || '') ? '#ffd21f' : '#33d1ec', 'center');
  }
 }
 function drawAd40(im, src, x, y, w, h, dy, fit, ctx) {
  if (!im) {
   drawAd(null, src, x, y, w, h, dy);
   return;
  }
  let sx = 0, sy = 0, sw = im.naturalWidth, sh = im.naturalHeight, dx = x, dw = w, dyy = y + dy, dh = h;
  const ia = sw / sh, da = w / h;
  if (fit === 'contain') {
   if (ia > da) {
    dh = w / ia;
    dyy += (h - dh) / 2;
   } else {
    dw = h * ia;
    dx += (w - dw) / 2;
   }
  } else if (fit !== 'stretch') {
   if (ia > da) {
    const nw = sh * da;
    sx = (sw - nw) / 2;
    sw = nw;
   } else {
    const nh = sw / da;
    sy = (sh - nh) / 2;
    sh = nh;
   }
  }
  const X = ctx || g;
  X.save();
  X.imageSmoothingEnabled = true;
  try {
   X.imageSmoothingQuality = 'high';
  } catch (e) {}
  X.drawImage(im, sx, sy, sw, sh, dx, dyy, dw, dh);
  X.restore();
 }
 const bakes = new Map;
 function bake40(im, src, w, h, fit) {
  const key = src + '|' + w + 'x' + h + '|' + fit;
  let c = bakes.get(key);
  if (c) return c;
  if (bakes.size > 48) bakes.clear();
  c = document.createElement('canvas');
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  drawAd40(im, src, 0, 0, w, h, 0, fit, c.getContext('2d'));
  bakes.set(key, c);
  return c;
 }
 function still40(c0, t, xs, n, L, y) {
  const m = g.getTransform(), a = m.a || RR, d = m.d || RR;
  const wx = D => (D - m.e) / a, wy = D => (D - m.f) / d;
  const ox = Math.round(m.e + a * 0), LD = Math.round(a * L);
  const Dy0 = Math.round(m.f + d * (y + 1)), Dy1 = Math.round(m.f + d * (y + BH)), HD = Dy1 - Dy0;
  const E = i => ox + Math.round(i * LD / n);
  rect(0, y, L, BH, '#05070b');
  rect(0, y, L, 1, '#5d6574');
  const fit = c0.fit || 'cover';
  const sp = +c0.scroll || 0, S = sp > 0 ? Math.max(0, Math.round(t * sp * a)) : 0, shD = sp > 0 ? S % LD : 0, lap = sp > 0 ? Math.floor(S / LD) : 0;
  const iy = wy(Dy0), ih = HD / d;
  function seg40(cur, prev, rollD, D0, D1, x0, w) {
   const a1 = img(cur), a2 = prev ? img(prev) : null;
   if (!a1 || prev && !a2) {
    g.save();
    g.beginPath();
    g.rect(x0, iy, w, ih);
    g.clip();
    if (prev) {
     drawAd40(a2, prev, x0, iy, w, ih, -rollD / d, fit);
     drawAd40(a1, cur, x0, iy, w, ih, ih - rollD / d, fit);
    } else drawAd40(a1, cur, x0, iy, w, ih, 0, fit);
    g.restore();
    return;
   }
   const M = g.getTransform();
   g.save();
   g.setTransform(1, 0, 0, 1, 0, 0);
   g.imageSmoothingEnabled = false;
   g.beginPath();
   g.rect(D0, Dy0, D1 - D0, HD);
   g.clip();
   const b1 = bake40(a1, cur, D1 - D0, HD, fit);
   if (prev) {
    g.drawImage(bake40(a2, prev, D1 - D0, HD, fit), D0, Dy0 - rollD);
    g.drawImage(b1, D0, Dy0 + HD - rollD);
   } else g.drawImage(b1, D0, Dy0);
   g.restore();
   g.setTransform(M);
  }
  g.save();
  g.beginPath();
  g.rect(wx(ox), iy, LD / a, ih);
  g.clip();
  const joins = [];
  for (const [o, lp] of shD ? [ [ -shD, lap ], [ LD - shD, lap + 1 ] ] : [ [ 0, lap ] ]) {
   for (let i = 0; i < n; i++) {
    const D0 = E(i) + o, D1 = E(i + 1) + o;
    if (D1 < ox - 2 || D0 > ox + LD + 2) continue;
    if (i > 0 || shD) joins.push(D0);
    const x0 = wx(D0), w = (D1 - D0) / a;
    if (sp > 0) {
     const src = adForLap(i, lp);
     st[i] = {
      cur: src,
      prev: null,
      t0: -9
     };
     seg40(src, null, 0, D0, D1, x0, w);
     continue;
    }
    const ti = t - i * WAVE, src = adFor(i, Math.max(0, ti)), s = st[i] || (st[i] = {
     cur: src,
     prev: null,
     t0: -9
    });
    if (o === 0 && s.cur !== src) {
     s.prev = s.cur;
     s.cur = src;
     s.t0 = t;
    }
    const k = s.prev && t - s.t0 < ROLL && t >= s.t0 ? (t - s.t0) / ROLL : 1;
    if (k < 1) seg40(s.cur, s.prev, Math.round(k * HD), D0, D1, x0, w); else seg40(s.cur, null, 0, D0, D1, x0, w);
   }
  }
  const sw = t / 9 % 1;
  if (sw < .3) {
   g.globalAlpha = .16;
   rect(Math.floor(sw / .3 * (L + 12)) - 6, iy, 3, ih, '#ffffff');
   g.globalAlpha = 1;
  }
  const M = g.getTransform();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#05070b';
  for (const D of joins) g.fillRect(D, Dy0, 1, HD);
  g.setTransform(M);
  g.restore();
  const drawn = [];
  for (const [o, lp] of shD ? [ [ -shD, lap ], [ LD - shD, lap + 1 ] ] : [ [ 0, lap ] ]) for (let i = 0; i < n; i++) drawn.push([ E(i) + o, E(i + 1) + o, i, sp > 0 ? adForLap(i, lp) : st[i] && st[i].cur ]);
  window.V39B.last40 = {
   ox: ox,
   LD: LD,
   Dy0: Dy0,
   Dy1: Dy1,
   edges: [ ...Array(n + 1).keys() ].map(E),
   drawn: drawn,
   joins: joins.slice(),
   shD: shD,
   lap: lap,
   S: S,
   fit: fit
  };
 }
 function strip() {
  if (off()) return;
  const c0 = cfg();
  if (c0.onSpecialStadiums === false && window.V28 && (V28.special && V28.special() || V28.stGho && V28.stGho() || typeof homeTeam === 'function' && homeTeam().gho16)) return;
  readKeep();
  const t = clock(), xs = segments(), n = xs.length - 1, L = xs[n], y = BY, iy = y + 1, ih = BH - 2;
  try {
   const m = g.getTransform();
   window.V39B.lastXf = [ m.a, m.b, m.c, m.d, m.e, m.f ];
  } catch (e) {}
  g.save();
  if (keep.length) {
   const m = g.getTransform(), sy0 = (m.d * y + m.f) / RR, sy1 = (m.d * (y + BH) + m.f) / RR;
   const holes = keep.filter(k => k[1] < sy1 && k[1] + k[3] > sy0);
   if (holes.length) {
    const M = g.getTransform();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.beginPath();
    g.rect(-9, -9, 99999, 99999);
    for (const k of holes) g.rect(k[0] * RR, k[1] * RR, k[2] * RR, k[3] * RR);
    g.clip('evenodd');
    g.setTransform(M);
   }
  }
  if (v40()) {
   still40(c0, t, xs, n, L, y);
   snowTop(L, y);
   g.restore();
   return;
  }
  rect(0, y, L, BH, '#05070b');
  rect(0, y, L, 1, '#5d6574');
  rect(0, y + BH - 1, L, 1, '#0b0d12');
  const sp = window.__rl_no40b ? V39_SCROLL : +c0.scroll || 0, sh = sp > 0 ? Math.round(t * sp % L * RR) / RR % L : 0;
  g.save();
  g.beginPath();
  g.rect(0, iy, L, ih);
  g.clip();
  for (const off2 of sh ? [ -sh, L - sh ] : [ 0 ]) {
   for (let i = 0; i < n; i++) {
    const x0 = xs[i] + (i === 0 && !sh ? 1 : 0) + off2, x1 = xs[i + 1] - (i === n - 1 && !sh ? 1 : SEAM) + off2, w = x1 - x0;
    if (x1 < -2 || x0 > L + 2) continue;
    const ti = t - i * WAVE, src = adFor(i, Math.max(0, ti)), s = st[i] || (st[i] = {
     cur: src,
     prev: null,
     t0: -9
    });
    if (off2 === (sh ? -sh : 0) && s.cur !== src) {
     s.prev = s.cur;
     s.cur = src;
     s.t0 = t;
    }
    g.save();
    g.beginPath();
    g.rect(x0, iy, w, ih);
    g.clip();
    const k = s.prev && t - s.t0 < ROLL && t >= s.t0 ? (t - s.t0) / ROLL : 1;
    if (k < 1) {
     drawAd(img(s.prev), s.prev, x0, iy, w, ih, -Math.round(k * ih * 4) / 4);
     drawAd(img(s.cur), s.cur, x0, iy, w, ih, ih - Math.round(k * ih * 4) / 4);
    } else drawAd(img(s.cur), s.cur, x0, iy, w, ih, 0);
    g.restore();
   }
  }
  const sw = t / 9 % 1;
  if (sw < .3) {
   g.globalAlpha = .16;
   rect(Math.floor(sw / .3 * (L + 12)) - 6, iy, 3, ih, '#ffffff');
   g.globalAlpha = 1;
  }
  g.restore();
  snowTop(L, y);
  g.restore();
 }
 function snowTop(L, y) {
  try {
   if (typeof snow21 === 'function' && snow21(homeTeam())) for (let xx = 0; xx < L; xx += 2) px(xx, y - 1 + (xx * 7 % 3 === 0 ? 0 : 1), '#f4f8ff');
  } catch (e) {}
 }
 let hudMode = null, ballTag = null, levelTag = null;
 const R0 = window.rect, X0 = window.text;
 function hudOn() {
  return !off() && !window.__rl_no39ht && cfg().moveHudTags !== false;
 }
 if (typeof R0 === 'function' && typeof X0 === 'function') {
  window.rect = function(x, y, w, h) {
   if (hudMode === 'hud' && y === 18 && w === 4 && h === 3) {
    R0.call(this, x, 13, w, h, arguments[4]);
    return;
   }
   if (hudMode === 'ball' && (x === 3 && y === 20 && h === 11 || x === 5 && y === 22 && w === 7)) return;
   return R0.apply(this, arguments);
  };
  window.text = function(s, x, y) {
   if (hudMode === 'hud' && y === 18 && x === 96 && typeof DIFF_NAMES !== 'undefined' && DIFF_NAMES.includes(s)) {
    levelTag = s;
    return;
   }
   if (hudMode === 'ball' && x === 15 && y === 23 && / BALL$/.test(String(s))) {
    ballTag = String(s);
    return;
   }
   return X0.apply(this, arguments);
  };
 }
 function wrapDraw(name, mode) {
  const F = window[name];
  if (typeof F !== 'function') return;
  window[name] = function() {
   if (!hudOn()) return F.apply(this, arguments);
   const m0 = hudMode;
   hudMode = mode;
   try {
    return F.apply(this, arguments);
   } finally {
    hudMode = m0;
   }
  };
 }
 wrapDraw('drawHUD', 'hud');
 wrapDraw('drawDefense', 'ball');
 wrapDraw('drawCpu', 'ball');
 function hudPlace() {
  const G = game, tw = s => textW(s, 1);
  const cx = W / 2, bw = 92;
  const row1 = G.brave ? 'BRAVEHEART' : perLabel(G) + ' ' + (G.ot ? 'SUDDEN' : fmtClock(G.clock)), row2 = 'SHOT :00';
  const half = Math.ceil(Math.max(tw(row1), tw(row2)) / 2);
  let lx0 = bw + 2, rx1 = W - 1 - bw - 2;
  for (const s of uiSpecs || []) {
   if (!s || s.y > 15 || s.y + s.h < 2 || s.h > 20) continue;
   if (s.x + s.w <= cx - half) lx0 = Math.max(lx0, s.x + s.w); else if (s.x >= cx + half) rx1 = Math.min(rx1, s.x);
  }
  const L = {
   x0: lx0 + 2,
   x1: cx - half - 2
  }, R = {
   x0: cx + half + 2,
   x1: rx1 - 2
  };
  return {
   L: L,
   R: R
  };
 }
 const XM = window.textMini;
 const cellM = () => Math.max(1, Math.round(.65 * RR)) / RR;
 const wOf = (s, f, room) => f === 'm' ? s.length * 4 * cellM() - cellM() : f === 'f' ? fitPick(s, room).w : textW(s, 1);
 const nmOn = () => !!(window.V40NM && V40NM.on);
 const dispOf = s => typeof fold2318 === 'function' ? String(fold2318(s)).toUpperCase() : String(s).toUpperCase();
 function fitPick(s, room) {
  const n = dispOf(s).length, lim = (room == null ? 1e9 : room) * RR, cmin = Math.max(2, Math.ceil(.3 * RR));
  for (let c = Math.max(cmin, Math.round(.65 * RR) - 1); c >= cmin; c--) for (let gp = c; gp >= Math.max(1, Math.ceil(c / 2)); gp--) {
   const w = n * 3 * c + (n - 1) * gp;
   if (w <= lim) return {
    C: c,
    Gp: gp,
    w: w / RR
   };
  }
  return {
   C: 0,
   Gp: 0,
   w: Infinity
  };
 }
 function drawFit(s, x, y, col, room) {
  const t = dispOf(s), P = fitPick(s, room), C = P.C, Gp = P.Gp, cell = C / RR, adv = (3 * C + Gp) / RR;
  if (!C) return;
  const x0 = Math.round(x * RR) / RR, y0 = Math.round((y + (5 - 5 * cell) / 2) * RR) / RR;
  for (const [dx, cc] of [ [ 1 / RR, '#000' ], [ 0, col ] ]) {
   g.fillStyle = cc;
   for (let i = 0; i < t.length; i++) {
    const gl = FONT[t[i]] || FONT['?'];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === '#') g.fillRect(x0 + dx + i * adv + c * cell, y0 + dx + r * cell, cell, cell);
   }
  }
 }
 function variants(base, f) {
  const o = [];
  for (const ff of [ 'n', 'm' ]) for (const v of base) if (v && !o.some(q => q[0] === v && q[1] === ff)) o.push([ v, ff ]);
  return o;
 }
 function drawHudTags() {
  if (!hudOn() || !levelTag && !ballTag) {
   levelTag = ballTag = null;
   return;
  }
  try {
   if (paused || !game) return;
   const G = game, {L: L, R: R} = hudPlace();
   const SW = 6;
   const lvV = levelTag ? (nmOn() && levelTag.length > 5 ? [ [ levelTag, 'n' ], [ levelTag, 'm' ], [ levelTag, 'f' ] ] : []).concat(variants([ levelTag, levelTag.slice(0, 5), levelTag.slice(0, 4) ])) : [];
   let blV = [];
   if (ballTag) {
    const o = T(G.opp) || {};
    const ab = String(o.abbr || '').trim();
    blV = variants([ ballTag, ab ? ab + ' BALL' : '', 'BALL' ]);
   }
   const fit = (V, Z, extra) => V.find(([v, f]) => wOf(v, f, Z.x1 - Z.x0 - extra) + extra <= Z.x1 - Z.x0);
   const plans = [];
   if (levelTag && ballTag) plans.push([ [ 'lv', L, 6 ], [ 'bl', R, 6 ] ], [ [ 'lv', R, 6 ], [ 'bl', L, 6 ] ], [ [ 'lv', R, 3 ], [ 'bl', R, 10 ] ], [ [ 'lv', L, 3 ], [ 'bl', L, 10 ] ], [ [ 'bl', R, 6 ] ], [ [ 'bl', L, 6 ] ]); else if (levelTag) plans.push([ [ 'lv', L, 6 ] ], [ [ 'lv', R, 6 ] ]); else plans.push([ [ 'bl', R, 6 ] ], [ [ 'bl', L, 6 ] ]);
   let put = null;
   for (const pl of plans) {
    const got = [];
    let ok = true;
    for (const [k, Z, y] of pl) {
     const v = fit(k === 'lv' ? lvV : blV, Z, k === 'bl' ? SW : 0);
     if (!v) {
      ok = false;
      break;
     }
     got.push([ k, v[0], v[1], Z, y ]);
    }
    if (ok) {
     put = got;
     break;
    }
   }
   g.save();
   g.setTransform(RR, 0, 0, RR, 0, 0);
   g.globalAlpha = 1;
   const out = [];
   for (const [k, s, f, Z, y] of put || []) {
    const tw0 = wOf(s, f, Z.x1 - Z.x0 - (k === 'bl' ? SW : 0)), w = tw0 + (k === 'bl' ? SW : 0), x = Math.round((Z.x0 + Z.x1 - w) / 2), tx = x + (k === 'bl' ? SW : 0);
    const col = k === 'lv' ? '#ff9a4a' : '#ffffff';
    if (k === 'bl') {
     R0(x, y, 5, 5, '#000');
     R0(x + .5, y + .5, 4, 4, G.ok.jersey);
    }
    if (f === 'm') {
     const ym = y + (5 - 5 * cellM()) / 2;
     XM(s, tx + tw0 / 2 + 1 / RR, ym + 1 / RR, '#000');
     XM(s, tx + tw0 / 2, ym, col);
    } else if (f === 'f') drawFit(s, tx, y, col, tw0 + 1e-6); else X0(s, tx, y, 1, col, 'left', '#000');
    out.push([ k, s, x, y, w, f ]);
   }
   g.restore();
   window.V39B && (V39B.lastHud = {
    tags: out,
    L: L,
    R: R,
    level: levelTag,
    ball: ballTag
   });
  } catch (e) {
   console.error(e);
  }
  levelTag = ballTag = null;
 }
 const DS = window.drawStadium;
 if (typeof DS === 'function') {
  window.drawStadium = function() {
   const r = DS.apply(this, arguments);
   if (!off()) {
    try {
     strip();
    } catch (e) {
     console.error(e);
    }
   }
   return r;
  };
 }
 const RD = window.render;
 if (typeof RD === 'function') window.render = function() {
  const r = RD.apply(this, arguments);
  readBtns();
  readKeep();
  drawHudTags();
  return r;
 };
 preload();
 window.V39B = {
  keep: () => keep.slice(),
  BH: BH,
  BY: BY,
  adFor: adFor,
  count: () => segments().length - 1,
  strip: () => {
   const xs = segments();
   return {
    x: 0,
    y: BY,
    w: xs[xs.length - 1],
    h: BH
   };
  },
  rects: () => {
   const xs = segments();
   const o = [];
   for (let i = 0; i + 1 < xs.length; i++) o.push({
    x: xs[i],
    y: BY,
    w: xs[i + 1] - xs[i],
    h: BH
   });
   return o;
  },
  loaded: () => [ ...imgs.entries() ].map(([k, v]) => ({
   src: k,
   ok: !!(v.complete && v.naturalWidth > 0 && !v.__bad),
   w: v.naturalWidth
  })),
  v40: () => v40(),
  adForLap: adForLap,
  debug: () => ({
   on: !off(),
   loaded: window.V39B.loaded(),
   t: clock()
  })
 };
})();
