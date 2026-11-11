'use strict';

const HON25 = (() => {
 const on = () => !window.__rl_no25 && !window.__rl_v124gb;
 const S = (() => {
  const s = LS.get('hon25', null);
  return s && typeof s === 'object' ? s : {};
 })();
 for (const k of [ 'aa', 'tew', 'cards', 'glow' ]) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
 const save = () => LS.set('hon25', S);
 const PFX = {
  aa: 'AA25-',
  tew: 'TW25-'
 }, BOOST = {
  aa: 3,
  tew: 5
 };
 const kindOf = pid => {
  const s = String(pid || '');
  return s.startsWith('AA25-') ? 'aa' : s.startsWith('TW25-') ? 'tew' : null;
 };
 const baseOf = pid => {
  const k = kindOf(pid);
  return k ? String(pid).slice(5) : pid;
 };
 const W = {
  A: {
   fin: .25,
   acc: .2,
   stk: .2,
   str: .15,
   pow: .1,
   spd: .1
  },
  M: {
   pow: .2,
   acc: .15,
   spd: .15,
   stk: .15,
   str: .15,
   fin: .1,
   def: .1
  },
  D: {
   def: .45,
   gb: .2,
   spd: .15,
   str: .1,
   stk: .1
  },
  LSM: {
   def: .35,
   gb: .3,
   spd: .2,
   stk: .15
  },
  FO: {
   fo: .6,
   gb: .25,
   spd: .15
  },
  G: {
   sav: .8,
   stk: .2
  }
 };
 function boosted(base, d) {
  const r = Object.assign({}, base.r), w = W[base.pos] || {
   spd: 1
  }, ks = Object.keys(w).sort((a, b) => w[b] - w[a]);
  const tgt = (typeof base.ovr === 'number' ? base.ovr : ovrOf(base)) + d, ov = () => ovrOf({
   pos: base.pos,
   r: r
  });
  for (let i = 0; i < 400 && ov() !== tgt; i++) {
   const o = ov();
   if (o < tgt) {
    const up = ks.filter(k => r[k] < 99);
    if (!up.length) break;
    if (tgt - o >= 1 && i < 40) up.forEach(k => r[k]++); else r[up[up.length - 1 - i % up.length]]++;
   } else {
    const dn = ks.slice().reverse().filter(k => r[k] > base.r[k]);
    if (!dn.length) break;
    r[dn[i % dn.length]]--;
   }
  }
  return r;
 }
 function make(pid) {
  if (PLAYERS[pid]) return PLAYERS[pid];
  const k = kindOf(pid), base = k && PP(baseOf(pid));
  if (!base || base.leg || kindOf(base.id)) return null;
  const c = S.cards[pid] || {};
  const p = Object.assign({}, base, {
   id: pid,
   r: boosted(base, BOOST[k]),
   team: c.t || base.team,
   base25: base.id,
   real: !!base.real
  });
  p[k === 'aa' ? 'aa25' : 'tew25'] = true;
  delete p.col25;
  delete p.ovr;
  p.ovr = ovrOf(p);
  if (base.wnum != null) p.wnum = base.wnum;
  p.skin = base.skin != null ? base.skin : skinOf(base);
  PLAYERS[pid] = p;
  return p;
 }
 function ensureIds(ids) {
  if (!on()) return;
  for (const id of ids || []) if (kindOf(id) && !PLAYERS[id]) make(id);
 }
 function ensureOwned() {
  if (!on()) return;
  try {
   ensureIds(Object.keys(S.cards));
   if (window.V22 && V22.st) ensureIds(Object.keys(V22.st().cards || {}));
  } catch (e) {
   console.error(e);
  }
 }
 function mark(kind, basePid) {
  if (!on() || !basePid) return false;
  const b = baseOf(basePid);
  if (!PP(b)) return false;
  if (!S[kind][b]) {
   S[kind][b] = {
    at: Date.now()
   };
   if (kind === 'tew' && S.glow[b] == null) S.glow[b] = true;
   save();
  }
  return true;
 }
 // v436hb: when window.__hb436 is present (v436hb.js) honors are looked up per CARD (the exact id that earned them),
 // not per real player. window.__rl_no436hb = true -> the old per-player lookup below, exactly as before.
 const HB = () => window.__rl_no436hb ? null : window.__hb436 || null;
 const isTew = pid => {
  const h = HB();
  if (h) return on() && !!pid && !!h.isTew(pid);
  return on() && !!pid && (kindOf(pid) === 'tew' || !!S.tew[baseOf(pid)]);
 };
 const isAA = pid => {
  const h = HB();
  if (h) return on() && !!pid && !!h.isAA(pid);
  return on() && !!pid && (!!kindOf(pid) || !!S.aa[baseOf(pid)] || !!S.tew[baseOf(pid)]);
 };
 const glowOn = pid => {
  const h = HB();
  if (h) return isTew(pid) && h.glowPref(pid) !== false;
  return isTew(pid) && S.glow[baseOf(pid)] !== false;
 };
 function glowSet(pid, v) {
  if (!isTew(pid)) return false;
  const h = HB();
  if (h) {
   h.glowSet(pid, !!v);
   return true;
  }
  S.glow[baseOf(pid)] = !!v;
  save();
  return true;
 }
 const GLOW_ID = 'chest_tew25';
 function addItem() {
  if (!on() || !window.V17 || !V17.BY || V17.BY[GLOW_ID]) return;
  const it = {
   id: GLOW_ID,
   n: 'BAGGATWAAN GLOW',
   sec: 'chest',
   slot: 'chest',
   rar: 2,
   art: 'tew25',
   tew25: 1,
   col: '#ffcc33',
   d: 'A GOLD GLOW AROUND HIS WHOLE BODY. ONLY A BAGGATWAAN WINNER CAN WEAR IT. WON, NEVER SOLD. STYLE ONLY.'
  };
  V17.I.push(it);
  V17.BY[GLOW_ID] = it;
 }
 function giveGlowItem() {
  try {
   const st = V17.ST();
   if (!st.inv[GLOW_ID]) {
    st.inv[GLOW_ID] = 1;
    st.seen[GLOW_ID] = true;
    V17.save();
   }
  } catch (e) {
   console.error(e);
  }
 }
 function canWear(pid) {
  return isTew(pid) ? null : 'ONLY A BAGGATWAAN WINNER CAN WEAR IT';
 }
 function eqHook(pid, e) {
  if (!on() || !pid) return e;
  const has = e && e.chest === GLOW_ID, want = glowOn(pid);
  if (has === want) return e;
  const o = Object.assign({}, e || {});
  if (want) {
   if (!o.chest) o.chest = GLOW_ID;
  } else delete o.chest;
  return o;
 }
 let iconC = null, iconS = null;
 function icon(sil) {
  if (sil && !window.__rl_v124gb && !window.__rl_no332bagga) {
   if (iconS) return iconS;
   const b = icon(false), c = document.createElement('canvas');
   c.width = c.height = 20;
   const x = c.getContext('2d');
   x.drawImage(b, 0, 0);
   const im = x.getImageData(0, 0, 20, 20), d = im.data;
   for (let i = 0; i < d.length; i += 4) if (d[i + 3]) {
    d[i] = 6;
    d[i + 1] = 8;
    d[i + 2] = 12;
    d[i + 3] = 255;
   }
   x.putImageData(im, 0, 0);
   iconS = c;
   return c;
  }
  if (iconC) return iconC;
  const c = document.createElement('canvas');
  c.width = c.height = 20;
  const x = c.getContext('2d');
  const fig = [ '...ooo...', '..ooooo..', '..ooooo..', '...ooo...', '.ooooooo.', 'ooooooooo', 'o.ooooo.o', 'o.ooooo.o', '..ooooo..', '..oo.oo..', '..oo.oo..', '..oo.oo..', '.ooo.ooo.' ];
  const on1 = (q, r) => !!(fig[r] && fig[r][q] === 'o');
  for (let r = -2; r < fig.length + 2; r++) for (let q = -2; q < 11; q++) {
   if (on1(q, r)) continue;
   let d = 9;
   for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (on1(q + a, r + b)) d = Math.min(d, Math.max(Math.abs(a), Math.abs(b)));
   if (d === 1) {
    x.fillStyle = '#ffe066';
    x.fillRect(5 + q, 4 + r, 1, 1);
   } else if (d === 2) {
    x.fillStyle = 'rgba(255,190,40,.55)';
    x.fillRect(5 + q, 4 + r, 1, 1);
   }
  }
  fig.forEach((row, r) => {
   for (let q = 0; q < row.length; q++) if (row[q] === 'o') {
    x.fillStyle = r < 4 ? '#2a1b10' : '#1b1b1b';
    x.fillRect(5 + q, 4 + r, 1, 1);
   }
  });
  x.fillStyle = '#ffffff';
  x.fillRect(16, 2, 1, 3);
  x.fillRect(15, 3, 3, 1);
  x.fillRect(3, 15, 1, 1);
  iconC = c;
  return c;
 }
 const FLAG = [ [ '#2a4bb8', '#d8202c', '#d8202c' ], [ '#2a4bb8', '#ffffff', '#ffffff' ] ];
 const own35 = () => {
  try {
   return !!(window.V35 && V35.b35 && V35.b35.ownsMarks && V35.b35.ownsMarks());
  } catch (e) {
   return false;
  }
 };
 const spotCache = new WeakMap, ringCache = new WeakMap;
 function patchSpot(rows, name) {
  if (spotCache.has(rows)) return spotCache.get(rows);
  let best = null;
  if (!window.__rl_no25chest) try {
   best = chestSpot(rows, name);
  } catch (e) {
   console.error(e);
  }
  if (!best) try {
   best = topSpot(rows, name);
  } catch (e) {
   console.error(e);
  }
  spotCache.set(rows, best);
  return best;
 }
 function chestSpot(rows, name) {
  const h = rows.length, w = rows[0].length, m = RL12.uniMask(rows, name + '|h25'), at = (q, r) => (rows[r] || '')[q] || '.';
  const isJ = ch => ch === 'J' || ch === 'j';
  const ok = (q, r) => isJ(at(q, r)) && !m.shorts.has(q + ',' + r) && !m.accent.has(q + ',' + r);
  let belt = -1;
  for (let r = 0; r < h && belt < 0; r++) {
   let j = 0, J = 0;
   for (let q = 0; q < w; q++) {
    const ch = at(q, r);
    if (ch === 'j') j++; else if (ch === 'J') J++;
   }
   if (j >= 5 && J <= 1) belt = r;
  }
  if (belt < 0) return null;
  let L = w, R = -1;
  for (let q = 0; q < w; q++) if (isJ(at(q, belt))) {
   L = Math.min(L, q);
   R = Math.max(R, q);
  }
  if (R - L < 4) return null;
  let top = -1;
  for (let r = 0; r < belt && top < 0; r++) for (let q = 0; q < w; q++) if (isJ(at(q, r))) {
   top = r;
   break;
  }
  if (top < 0) return null;
  const arm = new Set;
  for (let r = top; r < belt; r++) {
   for (let q = 0; q < w; q++) if (isJ(at(q, r)) && (q < L || q > R)) arm.add(q + ',' + r);
   let q = R + 1;
   if (isJ(at(q, r))) {
    q = R;
    while (q >= L && at(q, r) === 'j') arm.add(q-- + ',' + r);
   }
   q = L - 1;
   if (isJ(at(q, r))) {
    q = L;
    while (q <= R && at(q, r) === 'j') arm.add(q++ + ',' + r);
   }
  }
  let fx = 0, fn = 0, eye = false;
  for (let r = 0; r < top; r++) for (let q = 0; q < w; q++) {
   const ch = at(q, r);
   if (ch === 'Z') eye = true;
   if (ch === 'c' || ch === 'Z') {
    fx += q;
    fn++;
   }
  }
  let sx = 0, sn = 0;
  if (!fn) for (let r = 0; r < top; r++) for (let q = 0; q < w; q++) if ('Ss'.includes(at(q, r))) {
   sx += q;
   sn++;
  }
  const mid = (L + R) / 2, off = fn ? fx / fn - mid : sn ? sx / sn - mid : 0;
  const dir = fn ? (eye && Math.abs(off) > 3.4 ? Math.sign(off) : 0) : Math.abs(off) > 1.5 ? Math.sign(off) : 0;
  let bs = 1e9;
  let out = null;
  for (let r = top; r + 1 < belt; r++) for (let q = L; q + 2 <= R; q++) {
   let all = true, nJ = 0;
   for (let a = 0; a < 3 && all; a++) for (let b = 0; b < 2; b++) {
    const k = q + a + ',' + (r + b);
    if (!ok(q + a, r + b) || arm.has(k)) {
     all = false;
     break;
    }
    if (at(q + a, r + b) === 'J') nJ++;
   }
   if (!all) continue;
   const gap = dir > 0 ? R - (q + 2) : dir < 0 ? q - L : Math.abs(q + 1 - mid);
   const sc = (dir ? gap * 2 : gap) + (r - top) * (dir ? 1 : 3) - nJ * .25;
   if (sc < bs) {
    bs = sc;
    out = [ q, r ];
   }
  }
  if (window.__hon25probe && out) dbg.spot = { name: name, q: out[0], r: out[1], dir: dir, L: L, R: R, top: top, belt: belt };
  return out;
 }
 function topSpot(rows, name) {
  let best = null;
  {
   const m = RL12.uniMask(rows, name + '|h25'), at = (q, r) => (rows[r] || '')[q] || '.';
   const ok = (q, r) => {
    const ch = at(q, r);
    return (ch === 'J' || ch === 'j') && !m.shorts.has(q + ',' + r) && !m.accent.has(q + ',' + r);
   };
   const cands = [];
   for (let r = 0; r < rows.length - 1; r++) for (let q = 0; q < rows[0].length - 2; q++) {
    let all = true, nJ = 0;
    for (let a = 0; a < 3 && all; a++) for (let b = 0; b < 2; b++) {
     if (!ok(q + a, r + b)) {
      all = false;
      break;
     }
     if (at(q + a, r + b) === 'J') nJ++;
    }
    if (all) cands.push([ q, r, nJ ]);
   }
   if (cands.length) {
    const r0 = Math.min(...cands.map(c => c[1])), top = cands.filter(c => c[1] <= r0 + 1);
    const xs = [];
    for (let q = 0; q < rows[0].length; q++) if (ok(q, r0)) xs.push(q);
    const mid = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
    top.sort((a, b) => b[2] - a[2] || a[1] - b[1] || Math.abs(a[0] + 1 - mid) - Math.abs(b[0] + 1 - mid));
    best = [ top[0][0], top[0][1] ];
   }
  }
  return best;
 }
 function rings(rows) {
  if (ringCache.has(rows)) return ringCache.get(rows);
  const h = rows.length, w = rows[0].length, at = (q, r) => r >= 0 && r < h && q >= 0 && q < w ? rows[r][q] : '.';
  const body = (q, r) => {
   const ch = at(q, r);
   return ch !== '.' && !'MmnX'.includes(ch);
  };
  const r1 = [], r2 = [], in1 = new Set;
  for (let r = -1; r <= h; r++) for (let q = -1; q <= w; q++) {
   if (at(q, r) !== '.') continue;
   let n = false;
   for (let a = -1; a <= 1 && !n; a++) for (let b = -1; b <= 1; b++) if ((a || b) && body(q + a, r + b)) {
    n = true;
    break;
   }
   if (n) {
    r1.push([ q, r ]);
    in1.add(q + ',' + r);
   }
  }
  for (let r = -2; r <= h + 1; r++) for (let q = -2; q <= w + 1; q++) {
   if (at(q, r) !== '.' || in1.has(q + ',' + r)) continue;
   if ([ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ].some(([a, b]) => in1.has(q + a + ',' + (r + b)))) r2.push([ q, r ]);
  }
  const o = [ r1, r2 ];
  ringCache.set(rows, o);
  return o;
 }
 const GLOW1 = '#ffe25a', GLOW2 = '#ffa800';
 const pulse = () => .86 + .14 * Math.sin(performance.now() / 1e3 * 4.2);
 const dbg = {
  flag: 0,
  glow: 0,
  heroFlag: 0,
  heroGlow: 0,
  last: null
 };
 function probeAt(X, Y) {
  try {
   const m = g.getTransform(), pt = m.transformPoint(new DOMPoint(X + .5, Y + .5)), d = g.getImageData(Math.floor(pt.x), Math.floor(pt.y), 1, 1).data;
   return [ d[0], d[1], d[2] ];
  } catch (e) {
   return null;
  }
 }
 function overlay(p) {
  const pl = p.pl, n = p._fr, f = n && RL12.FR[n];
  if (!pl || !f) return;
  const aa = isAA(pl.id) && !own35(), tw = glowOn(pl.id);
  if (!aa && !tw) return;
  const rows = f[3], fr = !!p._fright, x = Math.round(p.x), y = Math.round(p.y), X = q => fr ? x - f[0] + q : x + f[0] - q, Y = r => y - f[1] + r;
  scaled12(p.x, p.y, () => {
   if (tw) {
    const [a, b] = rings(rows), k = pulse(), a0 = g.globalAlpha;
    g.globalAlpha = a0 * .6 * k;
    g.fillStyle = GLOW2;
    for (const [q, r] of b) g.fillRect(X(q), Y(r), 1, 1);
    g.globalAlpha = a0 * k;
    g.fillStyle = GLOW1;
    for (const [q, r] of a) g.fillRect(X(q), Y(r), 1, 1);
    g.globalAlpha = a0;
    dbg.glow++;
    if (window.__hon25probe && a.length) {
     const [q, r] = a[Math.floor(a.length / 2)];
     dbg.lastGlow = {
      pid: pl.id,
      rgb: probeAt(X(q), Y(r))
     };
    }
   }
   if (aa) {
    const s = patchSpot(rows, n);
    if (s) {
     for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) {
      g.fillStyle = FLAG[r][q];
      g.fillRect(X(s[0] + q), Y(s[1] + r), 1, 1);
     }
     dbg.flag++;
     if (window.__hon25probe) dbg.last = {
      pid: pl.id,
      n: n,
      rgb: [ probeAt(X(s[0]), Y(s[1])), probeAt(X(s[0] + 1), Y(s[1])), probeAt(X(s[0] + 1), Y(s[1] + 1)) ]
     };
    }
   }
  });
  if (game) game.hon25 = (game.hon25 || 0) + 1;
 }
 const patched = new WeakMap;
 function heroPatch(c0, name, flip) {
  const f = RL12.FR[name];
  if (!f || !c0) return c0;
  const s = patchSpot(f[3], name);
  if (!s) return c0;
  let m = patched.get(c0);
  if (!m) {
   m = {};
   patched.set(c0, m);
  }
  const key = name + '|' + (flip ? 1 : 0);
  if (m[key]) return m[key];
  const c = document.createElement('canvas');
  c.width = c0.width;
  c.height = c0.height;
  const x = c.getContext('2d');
  x.drawImage(c0, 0, 0);
  const w = f[3][0].length;
  for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) {
   const qq = s[0] + q;
   x.fillStyle = FLAG[r][q];
   x.fillRect(flip ? w - 1 - qq : qq, s[1] + r, 1, 1);
  }
  m[key] = c;
  return c;
 }
 function heroGlow(cx, feetY, pos, k, t, alpha, slide, flip, side) {
  const name = lobbyFrame(pos, side), f = RL12.FR[name];
  if (!f) return;
  const w = f[3][0].length, x0 = lobbyHeroGeo(cx, pos, k, flip, side).x0 + Math.round(slide || 0), y0 = Math.round(feetY - f[1] * k);
  const cut = Math.max(1, f[1] - 12), br = Math.round((Math.sin(t * 2.4) + 1) * .75), [a, b] = rings(f[3]), pk = pulse(), a0 = g.globalAlpha;
  const put = (q, r) => g.fillRect(x0 + (flip ? w - 1 - q : q) * k, y0 + r * k - (r < cut ? br : 0), k, k);
  g.globalAlpha = a0 * (alpha == null ? 1 : alpha) * .55 * pk;
  g.fillStyle = GLOW2;
  for (const [q, r] of b) put(q, r);
  g.globalAlpha = a0 * (alpha == null ? 1 : alpha) * pk;
  g.fillStyle = GLOW1;
  for (const [q, r] of a) put(q, r);
  g.globalAlpha = a0;
  dbg.heroGlow++;
 }
 const HALF = [ '................', '................', '...........ooooo', '.........ooHHHHH', '........oHHHHhhH', '.......oHHHHHHHH', '.......oHHHHHHHH', '.......oHHHZZZZZ', '.......oHHZZZZZZ', '.......oHZZZZZZZ', '......osSHHHSSSS', '......osSWeSSSSS', '......osSSSSSSSS', '......osSSSSSSSs', '.......oSSSSSSss', '.......oSSSSSSSS', '.......osSSSSmmm', '........osSSSSSS', '........ossSSSSS', '.........ossSSSS', '..........oossss', '...........osSSS', '......ooooJLWWsS', '....ooJJJJJLWWWT', '..ooJJJJJJJLWWWT', '.oJJJJJJJJJJLWWT', 'oJJJJJJJJJJJLWWT', 'oJJJJJJJJJJJjLWT', 'oJJJJJJJJJJJJLWT', 'ojJJJJJJJJJJJjLt', 'ojJJJJJJJJJJJJLt', 'ojJJJJJJJJJJJJjL' ];
 function grid(kind, style, braid) {
  const G = HALF.map(h => (h + h.split('').reverse().join('')).split(''));
  const set = (q, r, ch) => {
   if (G[r] && q >= 0 && q < 32) G[r][q] = ch;
  }, sym = (q, r, ch) => {
   set(q, r, ch);
   set(31 - q, r, ch);
  };
  if (style === 1) {
   for (let r = 8; r <= 17; r++) {
    sym(5, r, 'o');
    sym(6, r, 'H');
    if (r <= 13) sym(7, r, 'H');
   }
   sym(6, 18, 'o');
   sym(7, 18, 'H');
   sym(7, 19, 'o');
   sym(6, 7, 'o');
   sym(7, 7, 'H');
  } else if (style === 2) {
   for (let q = 0; q < 32; q++) {
    if (G[2][q] === 'o') G[2][q] = '.';
    if (G[3][q] === 'H') G[3][q] = 'o';
    if (G[3][q] === 'o' && (q < 11 || q > 20)) G[3][q] = '.';
   }
   sym(8, 3, '.');
   sym(9, 3, '.');
   sym(10, 3, '.');
   sym(8, 4, '.');
   sym(9, 4, 'o');
   sym(10, 4, 'o');
   for (let r = 7; r <= 9; r++) sym(8, r, 'h');
   for (let q = 0; q < 32; q++) for (const r of [ 4, 5, 6 ]) if (G[r][q] === 'h') G[r][q] = 'H';
  }
  if (braid) for (let r = 12; r <= 24; r++) {
   sym(5, r, r % 2 ? 'H' : 'h');
   if (r === 25) sym(5, r, 'b');
  }
  if (!window.__rl_no35art && !window.__rl_v124gb) {
   sym(9, 10, 'S');
   sym(10, 10, 'S');
   sym(11, 10, 'H');
   sym(12, 10, 'H');
   sym(13, 10, 'H');
   sym(9, 11, 'S');
   sym(10, 11, 'S');
   sym(11, 11, 'W');
   sym(12, 11, 'e');
  }
  if (kind === 'tew') {
   for (let r = 23; r < 32; r++) for (const q of [ 15, 16 ]) if ('Tt'.includes(G[r][q])) G[r][q] = 'W';
   for (const q of [ 13, 14, 17, 18 ]) set(q, 23, 'T');
   set(15, 23, 't');
   set(16, 23, 't');
   set(14, 24, 'T');
   set(17, 24, 'T');
   set(13, 22, 'W');
   set(18, 22, 'W');
   set(15, 26, 'k');
   set(16, 28, 'k');
   set(15, 30, 'k');
  } else {
   set(15, 22, 't');
   set(16, 22, 't');
  }
  return G;
 }
 const HAIR = [ [ '#2a1b10', '#4a2e17', '#6b4423', '#b8893f', '#1a120c', '#8a4a1f' ], [ '#1a120c', '#2a1b10', '#3a2614' ], [ '#120d0a', '#1a120c' ] ];
 const artCache = new Map;
 function art(pid, tid, sil) {
  if (!on()) return null;
  const k = kindOf(pid);
  if (!k) return null;
  const p = PP(pid) || make(pid);
  if (!p) return null;
  const key = pid + (sil ? '|s' : '');
  if (artCache.has(key)) return artCache.get(key);
  const base = PP(p.base25) || p, skin = Math.max(0, Math.min(6, skinOf(p) | 0)), tn = RL12.SKIN[skin] || RL12.SKIN[0], sd = seedOf('hair25:' + base.id);
  const braid = !!(window.V232 && V232.isBraid && V232.isBraid(base)), hp = HAIR[skin <= 1 ? 0 : skin <= 3 ? 1 : 2], hair = braid ? '#1a120c' : skin === 6 ? '#f2f2f2' : hp[sd % hp.length];
  const style = braid ? 0 : (sd >> 3) % 3, G = grid(k, style, braid);
  const pal = {
   o: '#0d0d0d',
   H: hair,
   h: mixc21(hair, '#ffffff', .22),
   b: '#c9a46b',
   Z: tn.hi,
   S: tn.base,
   s: tn.shade,
   W: '#f4f4f4',
   e: '#141414',
   m: mixc21(tn.shade, '#7a2222', .45),
   k: '#1a1a1a',
   J: k === 'tew' ? '#17171a' : '#1c2a4c',
   j: k === 'tew' ? '#0b0b0d' : '#111b33',
   L: k === 'tew' ? '#3a3a40' : '#0c1428',
   T: k === 'tew' ? '#ffcc33' : '#d4202c',
   t: k === 'tew' ? '#b88a12' : '#9c121c'
  };
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  G.forEach((row, r) => row.forEach((ch, q) => {
   const col = pal[ch];
   if (col) {
    x.fillStyle = col;
    x.fillRect(q, r, 1, 1);
   }
  }));
  if (k === 'aa') {
   [ [ '#2a4bb8', '#d8202c' ], [ '#ffffff', '#d8202c' ] ].forEach((row, r) => row.forEach((col, q) => {
    x.fillStyle = col;
    x.fillRect(5 + q, 25 + r, 1, 1);
   }));
   const fl = [ 'BBBRRRR', 'BWBWWWW', 'BBBRRRR', 'WWWWWWW', 'RRRRRRR' ], fc = {
    B: '#2a4bb8',
    R: '#e0242f',
    W: '#ffffff'
   };
   x.fillStyle = '#0d0d0d';
   x.fillRect(0, 0, 9, 7);
   fl.forEach((row, r) => {
    for (let q = 0; q < 7; q++) {
     x.fillStyle = fc[row[q]];
     x.fillRect(1 + q, 1 + r, 1, 1);
    }
   });
  } else {
   x.fillStyle = '#ffcc33';
   x.fillRect(5, 25, 2, 2);
   x.fillStyle = '#fff2a0';
   x.fillRect(5, 25, 1, 1);
   const tr = [ 'oo.oooo.oo', 'oYoYYYYoYo', 'oYoYWYYoYo', '.ooYYYyoo.', '...oYYo...', '....oo....', '...oYYo...', '..oyyyyo..', '..oooooo..' ], tc = {
    o: '#0d0d0d',
    Y: '#ffcc33',
    y: '#c9961a',
    W: '#fff6c0'
   };
   tr.forEach((row, r) => {
    for (let q = 0; q < 10; q++) {
     const col = tc[row[q]];
     if (col) {
      x.fillStyle = col;
      x.fillRect(q, r, 1, 1);
     }
    }
   });
  }
  {
   const sc = k === 'aa' ? '#ffffff' : '#fff2a0';
   x.fillStyle = sc;
   for (const [q, r] of [ [ 27, 2 ], [ 24, 6 ], [ 29, 7 ] ]) {
    x.fillRect(q, r, 1, 1);
    x.globalAlpha = .55;
    x.fillRect(q - 1, r, 1, 1);
    x.fillRect(q + 1, r, 1, 1);
    x.fillRect(q, r - 1, 1, 1);
    x.fillRect(q, r + 1, 1, 1);
    x.globalAlpha = 1;
   }
  }
  if (sil) {
   x.globalCompositeOperation = 'source-in';
   x.fillStyle = '#05080b';
   x.fillRect(0, 0, 32, 32);
   x.globalCompositeOperation = 'source-over';
  }
  artCache.set(key, c);
  return c;
 }
 const CSS = [ '#panel .c17[data-pid^="AA25-"]{border-color:#ff3344;background:linear-gradient(#6a0c16,#2a0408);animation:aa25g 1.6s ease-in-out infinite}', '#panel .c17[data-pid^="AA25-"]::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 38%,rgba(255,255,255,.55) 46%,rgba(255,120,130,.45) 52%,transparent 62%);animation:foil17 2.2s linear infinite;pointer-events:none}', '#panel .c17[data-pid^="AA25-"] .art{background:radial-gradient(circle at 50% 40%,#ff7782,#b3101e 55%,#3a0409);border-color:#ffffff}', '#panel .c17[data-pid^="AA25-"] .rr{color:#ffd0d4}#panel .c17[data-pid^="AA25-"] .role17{color:#ffffff}', '#panel .c17[data-pid^="AA25-"] .nm,#panel .c17[data-pid^="TW25-"] .nm{flex-direction:column;justify-content:center}', '#panel .c17[data-pid^="AA25-"] .nm::before{content:"ALL-AMERICAN";display:block;font-size:6px;letter-spacing:.3px;color:#fff;background:#d4202c;border-top:1px solid #2a4bb8;border-bottom:1px solid #2a4bb8;padding:1px 2px;margin-bottom:1px;white-space:nowrap}', '#panel .c17[data-pid^="TW25-"]{border-color:#ffcc33;background:linear-gradient(#2a2106,#000);animation:glow17 1.4s ease-in-out infinite}', '#panel .c17[data-pid^="TW25-"]::after{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,rgba(255,220,100,.4),transparent 25%,rgba(255,255,255,.25),transparent 55%);animation:spin17 3s linear infinite;pointer-events:none}', '#panel .c17[data-pid^="TW25-"] .art{background:radial-gradient(circle at 50% 40%,#ffe58a,#a67a12 55%,#140e02);border-color:#ffcc33}', '#panel .c17[data-pid^="TW25-"] .rr{color:#ffe14d}#panel .c17[data-pid^="TW25-"] .role17{color:#ffe9a0}', '#panel .c17[data-pid^="TW25-"] .nm::before{content:"BAGGATWAAN";display:block;font-size:6px;letter-spacing:.5px;color:#000;background:linear-gradient(#fff2a0,#ffcc33);padding:1px 2px;margin-bottom:1px;white-space:nowrap}', '.cd[data-k^="c:AA25-"]{border-color:#ff3344!important;background:linear-gradient(#6a0c16,#2a0408)!important;box-shadow:0 0 6px #ff3344}', '.cd[data-k^="c:TW25-"]{border-color:#ffcc33!important;background:linear-gradient(#2a2106,#000)!important;box-shadow:0 0 6px #ffcc33}', '#panel .pcard17 .c17[data-pid^="AA25-"],#panel .pcard17 .c17[data-pid^="TW25-"]{width:104px;min-height:140px}', '#panel .pcard17 .c17[data-pid^="AA25-"] .art,#panel .pcard17 .c17[data-pid^="TW25-"] .art{width:88px;height:88px}', '#panel .pcard17 .c17[data-pid^="AA25-"] .art img,#panel .pcard17 .c17[data-pid^="TW25-"] .art img{width:84px;height:84px}', '#panel .pcard17 .c17[data-pid^="AA25-"] .nm,#panel .pcard17 .c17[data-pid^="TW25-"] .nm{font-size:10px}', '#panel .pcard17 .c17[data-pid^="AA25-"] .nm::before,#panel .pcard17 .c17[data-pid^="TW25-"] .nm::before{font-size:8px}', '#panel .pcard17 .c17[data-pid^="AA25-"] .rr,#panel .pcard17 .c17[data-pid^="TW25-"] .rr{font-size:8px}', '#panel .pop17:has(.pcard17 .c17[data-pid^="AA25-"]) .pt17::before{content:"ALL-AMERICAN ";color:#ff5a66}', '#panel .pop17:has(.pcard17 .c17[data-pid^="TW25-"]) .pt17::before{content:"BAGGATWAAN ";color:#ffe14d}', '@keyframes aa25g{0%,100%{box-shadow:0 0 4px 1px rgba(255,51,68,.5),0 2px 0 #000}50%{box-shadow:0 0 13px 4px rgba(255,70,90,.95),0 2px 0 #000}}' ].join('\n');
 function addCss() {
  if (!on() || document.getElementById('hon25css')) return;
  const s = document.createElement('style');
  s.id = 'hon25css';
  s.textContent = CSS;
  (document.head || document.documentElement).appendChild(s);
 }
 function grant(kind, basePid, tid) {
  if (!on() || !PFX[kind]) return {
   pid: null,
   isNew: false
  };
  const b = baseOf(basePid), base = PP(b);
  if (!base) return {
   pid: null,
   isNew: false
  };
  const pid = PFX[kind] + b;
  mark(kind, b);
  if (!S.cards[pid]) {
   S.cards[pid] = {
    t: tid || base.team,
    at: Date.now()
   };
   save();
  }
  const p = make(pid);
  if (!p) return {
   pid: null,
   isNew: false
  };
  let isNew = false;
  if (window.V22 && V22.on()) {
   if (V22.owned(pid)) {
    try {
     if (!window.__rl_no232d && window.V17 && V17.give232) V17.give232(V17.sell232(V22.rarOf(pid)));
    } catch (e) {
     console.error(e);
    }
   } else isNew = V22.grantIds([ pid ], tid || base.team, 'NATTY').length > 0;
  }
  if (kind === 'tew') {
   if (isNew) S.glow[b] = true;
   save();
   addItem();
   giveGlowItem();
  }
  if (isNew && window.V22 && V22.popup) {
   try {
    const nmU = String(base.n || '').toUpperCase();
    V22.popup('hon25|' + pid, kind === 'tew' ? 'BAGGATWAAN CARD!' : 'ALL-AMERICAN CARD!', kind === 'tew' ? 'BAGGATWAAN ' + nmU + ' - YOUR BEST PLAYER WON THE BAGGATWAAN (+5 OVR CARD)' : nmU + ' IS AN ALL-AMERICAN (+3 OVR CARD)', [ pid ]);
   } catch (e) {
    console.error(e);
   }
  }
  return {
   pid: pid,
   isNew: isNew
  };
 }
 const COACH_RARE25 = [ 'ARLO ROCKFORD', 'HERB CLEMONS', 'HERB RUSHING', 'RON MORTIMER', 'HAL WARFIELD', 'CLINT ORMSBY', 'RUSS VARNER' ];
 const norm = s => String(s || '').toUpperCase().replace(/[^A-Z]/g, '');
 function coachOwnerTid(tid) {
  let t;
  try {
   t = T(tid);
  } catch (e) {
   return tid;
  }
  if (!t || !t.col25) return tid;
  const n = norm(t.coach);
  if (!n) return tid;
  for (const o of TEAMS.concat(typeof WTEAMS !== 'undefined' ? WTEAMS : [])) if (o && o.id !== tid && !o.col25 && norm(o.coach) === n) return o.id;
  return tid;
 }
 function coachGrant(tid) {
  if (!on() || !window.V232 || !V232.giveCoach) return {
   id: null,
   isNew: false
  };
  const id = coachOwnerTid(tid), r = V232.giveCoach(id, 'NATTY');
  if (r === 'have') {
   try {
    if (!window.__rl_no232d && V17.give232) V17.give232(V17.sell232(V232.coachRar2403 ? V232.coachRar2403(V232.coaches()[id].n) : 1));
   } catch (e) {}
  }
  return {
   id: r ? id : null,
   isNew: r === 'new'
  };
 }
 function coachCards() {
  if (!window.V232 || !V232.coaches) return [];
  const c = V232.coaches();
  return Object.keys(c).map(id => {
   let team = '';
   try {
    team = T(id).name;
   } catch (e) {}
   return {
    id: id,
    name: c[id].n,
    team: team
   };
  });
 }
 if (on()) {
  addItem();
  addCss();
  if (window.V232 && Array.isArray(V232.COACH_RARE2403)) for (const n of COACH_RARE25) if (!V232.COACH_RARE2403.includes(n)) V232.COACH_RARE2403.push(n);
 }
 ensureOwned();
 setTimeout(() => {
  try {
   ensureOwned();
   if (on() && Object.keys(S.tew).length) giveGlowItem();
  } catch (e) {
   console.error(e);
  }
 }, 0);
 setInterval(() => {
  try {
   ensureOwned();
  } catch (e) {}
 }, 3e3);
 if (window.V22 && V22.subIds) {
  const si0 = V22.subIds;
  V22.subIds = function(lu) {
   try {
    if (on() && lu && typeof lu === 'object') {
     const ids = [];
     for (const k in lu) {
      const v = lu[k];
      for (const id of Array.isArray(v) ? v : [ v ]) if (typeof id === 'string') ids.push(id);
     }
     ensureIds(ids);
    }
   } catch (e) {}
   return si0.apply(this, arguments);
  };
 }
 {
  const dp0 = window.drawPlayer12;
  if (typeof dp0 === 'function') window.drawPlayer12 = function(p) {
   const r = dp0.apply(this, arguments);
   try {
    if (on() && p && p.pl) overlay(p);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 {
  const ringNsCache = new Map;
  const ringsNS = rows => {
   let o = ringNsCache.get(rows);
   if (!o) {
    o = rings(rows.map(s => s.replace(/[XMmn]/g, '.')));
    ringNsCache.set(rows, o);
   }
   return o;
  };
  const BP35 = {
   aa: [ [ '#2a4bb8', '#d8202c', '#d8202c' ], [ '#2a4bb8', '#ffffff', '#ffffff' ] ],
   ult: [ [ '#fff3a8', '#ffcc33', '#fff3a8' ], [ '#d19a00', '#ffcc33', '#d19a00' ] ]
  };
  const BP35w2 = {
   aa: [ [ '#2a4bb8', '#d8202c' ], [ '#2a4bb8', '#ffffff' ] ],
   ult: [ [ '#fff3a8', '#ffcc33' ], [ '#d19a00', '#ffcc33' ] ]
  };
  let cur = null;
  dbg.dodgeGlow = 0;
  dbg.dodgeFlag = 0;
  function marksNS(p, name, x, y, faceRight) {
   const pl = p.pl, f = RL12.FR[name];
   if (!pl || !f) return;
   const tw = glowOn(pl.id), o35 = own35(), aa = isAA(pl.id) && !o35;
   const P = o35 && window.V35 && V35.b35 && V35.b35.plan ? V35.b35.plan(pl.id, name) : null;
   if (!tw && !aa && !(P && P.length)) return;
   const rows = f[3], fr = !!faceRight, X = q => fr ? x - f[0] + q : x + f[0] - q, Y = r => y - f[1] + r;
   if (tw) {
    const [a, b] = ringsNS(rows), k = pulse(), a0 = g.globalAlpha;
    g.globalAlpha = a0 * .6 * k;
    g.fillStyle = GLOW2;
    for (const [q, r] of b) g.fillRect(X(q), Y(r), 1, 1);
    g.globalAlpha = a0 * k;
    g.fillStyle = GLOW1;
    for (const [q, r] of a) g.fillRect(X(q), Y(r), 1, 1);
    g.globalAlpha = a0;
    dbg.glow++;
    dbg.dodgeGlow++;
   }
   if (P && P.length) {
    for (const m of P) {
     const C = (m.w === 2 ? BP35w2 : BP35)[m.t];
     if (!C) continue;
     for (let r = 0; r < 2; r++) for (let q = 0; q < m.w; q++) {
      g.fillStyle = C[r][q];
      g.fillRect(X(m.q + q), Y(m.r + r), 1, 1);
     }
    }
    dbg.dodgeFlag++;
   } else if (aa) {
    const s = patchSpot(rows, name);
    if (s) {
     for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) {
      g.fillStyle = FLAG[r][q];
      g.fillRect(X(s[0] + q), Y(s[1] + r), 1, 1);
     }
     dbg.flag++;
     dbg.dodgeFlag++;
    }
   }
  }
  const ns0 = window.draw12ns;
  if (typeof ns0 === 'function') window.draw12ns = function(name, x, y, kit, faceRight) {
   const r = ns0.apply(this, arguments);
   const p = cur;
   if (p && !window.__rl_no25dglow) try {
    if (on() && p.pl) marksNS(p, name, Math.round(x), Math.round(y), faceRight);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
  const dpN = window.drawPlayer12;
  if (typeof dpN === 'function') window.drawPlayer12 = function() {
   const prev = cur;
   cur = null;
   try {
    return dpN.apply(this, arguments);
   } finally {
    cur = prev;
   }
  };
  const dd0 = window.drawDodger12;
  if (typeof dd0 === 'function') window.drawDodger12 = function(p) {
   const prev = cur;
   cur = p && p.pl ? p : null;
   try {
    return dd0.apply(this, arguments);
   } finally {
    cur = prev;
   }
  };
 }
 {
  const lb0 = window.lobbyBake;
  if (typeof lb0 === 'function') window.lobbyBake = function(name, kit, skin, gray, flip) {
   const c = lb0.apply(this, arguments);
   try {
    const pid = window.__v17hp;
    if (on() && pid && !gray && isAA(pid) && !own35()) {
     dbg.heroFlag++;
     return heroPatch(c, name, !!flip);
    }
   } catch (e) {
    console.error(e);
   }
   return c;
  };
 }
 function heroProbe(pid, cx, feetY, pos, k, t, slide, flip, side) {
  const name = lobbyFrame(pos, side), f = RL12.FR[name], s = f && patchSpot(f[3], name);
  if (!s) return;
  const w = f[3][0].length, x0 = lobbyHeroGeo(cx, pos, k, flip, side).x0 + Math.round(slide || 0), y0 = Math.round(feetY - f[1] * k), cut = Math.max(1, f[1] - 12), br = Math.round((Math.sin(t * 2.4) + 1) * .75);
  const at = (q, r) => probeAt(x0 + (flip ? w - 1 - q : q) * k + k / 2 - .5, y0 + r * k - (r < cut ? br : 0) + k / 2 - .5);
  dbg.heroLast = {
   pid: pid,
   name: name,
   rgb: [ at(s[0], s[1]), at(s[0] + 1, s[1]), at(s[0] + 1, s[1] + 1) ],
   glow: glowOn(pid)
  };
 }
 {
  const lh0 = window.lobbyHero;
  if (typeof lh0 === 'function') window.lobbyHero = function(cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) {
   const pid = window.__v17hp;
   try {
    if (on() && pid && !gray && glowOn(pid)) heroGlow(cx, feetY, pos, k, t, alpha, slide, flip, side);
   } catch (e) {
    console.error(e);
   }
   const r = lh0.apply(this, arguments);
   try {
    if (window.__hon25probe && on() && pid && !gray && isAA(pid)) heroProbe(pid, cx, feetY, pos, k, t, slide, flip, side);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 {
  const rn0 = window.realNum15;
  if (typeof rn0 === 'function') window.realNum15 = function(p) {
   if (on() && p && p.base25 && PP(p.base25)) return rn0.call(this, PP(p.base25));
   return rn0.apply(this, arguments);
  };
 }
 {
  const jn0 = window.jerseyNo;
  if (typeof jn0 === 'function') window.jerseyNo = function(pl, src, tid) {
   try {
    if (on() && pl && pl.base25 && PP(pl.base25)) {
     const sz = tid && typeof SZ_REG !== 'undefined' && SZ_REG[tid];
     if (sz && sz.nums && sz.nums[pl.id] != null) return sz.nums[pl.id];
     return jn0.call(this, PP(pl.base25), src, tid);
    }
   } catch (e) {}
   return jn0.apply(this, arguments);
  };
 }
 return {
  on: on,
  grant: grant,
  markAA: b => mark('aa', b),
  markTew: b => mark('tew', b),
  isAA: isAA,
  isTew: isTew,
  glowOn: glowOn,
  glowSet: glowSet,
  glowOff: pid => glowSet(pid, false),
  canWear: canWear,
  eqHook: eqHook,
  icon: icon,
  art: art,
  list: () => ({
   aa: Object.keys(S.aa),
   tew: Object.keys(S.tew)
  }),
  cards: () => Object.keys(S.cards),
  coachGrant: coachGrant,
  coachCards: coachCards,
  coachOwnerTid: coachOwnerTid,
  COACH_RARE25: COACH_RARE25,
  GLOW_ID: GLOW_ID,
  BOOST: BOOST,
  kindOf: kindOf,
  baseOf: baseOf,
  make: make,
  ensureOwned: ensureOwned,
  patchSpot: patchSpot,
  rings: rings,
  dbg: dbg,
  FLAG: FLAG,
  st: () => S
 };
})();

window.HON25 = HON25;
