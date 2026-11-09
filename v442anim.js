
/* v442anim: better player animation (drawing only). Kill switch: window.__rl_no442anim = true */
(function() {
 if (typeof RL12 === 'undefined' || !RL12.FR || !RL12.draw || window.__rl_no442anim === true) return;
 const FR = RL12.FR, off = () => !!window.__rl_no442anim;
 const ST = window.__rl442 = { syn: 0, run: 0, d8: 0, hands: 0, dodge: 0, cut: 0, shot: 0, wind: 0, err: 0, seen: {} };
 const T = () => typeof menuT !== 'undefined' ? menuT : performance.now() / 1e3;
 /* ---------- side-view legs (v4045: every shoe's toe points the way he runs; v4044: planted foot only moves back): 4 shapes, B half = colours swapped (near/far leg) ---------- */
 const LEGS = [
  [ '..oJJJJooJJJJo...', '.oJJJJo..oJJJJo..', '..oSSo....osso...', '.oWWo......ovvo..', '.oKKKo.....oKKKo.', '..ooo.......ooo..' ],
  [ '...oJJJJoJJJJo...', '..oJJJo..oJJJo...', '.oSSo....osso....', '.oWKKo...ovvo....', '..ooo....oKKKo...', '..........ooo....' ],
  [ '...oJJJJoJJJJo...', '...oJJJJoJJJJo...', '....oSSoJJo......', '...oWWoosso......', '....oKKovvo......', '.....oooKKKo.....', '........ooo......' ],
  [ '...oJJJJoJJJJo...', '...oJJJo.oJJJJo..', '....osso..oSSSo..', '....osso..oWWo...', '....ovvo..oKKKo..', '....oKKKo..ooo...', '.....ooo.........' ]
 ];
 const SWAP = { S: 's', s: 'S', W: 'v', v: 'W' };
 const LEGC = 8;
 function legRows(ph) {
  const L = LEGS[ph & 3];
  return ph < 4 ? L : L.map(r => r.replace(/[SsWv]/g, c => SWAP[c]));
 }
 /* legs = the two thigh rows above the lowest block of skin/sock/cleat rows */
 function legStart(rows) {
  let r = rows.length - 1;
  while (r >= 0 && !/[^.o]/.test(rows[r])) r--;
  let top = -1;
  while (r >= 0 && /[SsWvK]/.test(rows[r])) {
   top = r;
   r--;
  }
  return top >= 4 ? top - 2 : -1;
 }
 const pad = (rows, l, rr) => rows.map(s => '.'.repeat(l) + s + '.'.repeat(rr));
 function reg(key, ax, ay, pk, rows) {
  const w = Math.max(...rows.map(r => r.length));
  FR[key] = [ ax, ay, pk, rows.map(r => r.padEnd(w, '.')) ];
  ST.syn++;
  return key;
 }

 /* new frame = base upper body (shifted dx for lean, dy down for crouch) + legs */
 const MG = 5;
 function sideFrame(base, ph, dx, tag, legsOverride, dy) {
  dx = dx | 0;
  dy = dy | 0;
  const key = base + '~s' + ph + (dx ? 'x' + dx : '') + (dy ? 'y' + dy : '') + (tag || '');
  if (FR[key]) return key;
  const f = FR[base];
  if (!f) return base;
  const rows = f[3], ls = legStart(rows);
  if (ls < 0) return base;
  const legs = legsOverride || legRows(ph), w0 = rows[0].length, W2 = w0 + 2 * MG, ax = f[0] + MG;
  const nr = ls + legs.length;
  const G2 = [];
  for (let r = 0; r < nr; r++) G2.push(Array(W2).fill('.'));
  for (let i = 0; i < legs.length; i++) {
   const lr = legs[i], o = ax - LEGC, y = ls + i;
   for (let q = 0; q < lr.length; q++) if (lr[q] !== '.' && o + q >= 0 && o + q < W2) G2[y][o + q] = lr[q];
  }
  for (let r = 0; r < rows.length; r++) {
   const y = r + dy;
   if (y < 0 || y >= nr) continue;
   for (let q = 0; q < w0; q++) {
    const ch = rows[r][q];
    if (ch === '.') continue;
    if (r >= ls && !/[XGgMmn]/.test(ch)) continue;
    if (r >= ls - dy && r < ls && dy > 0 && !/[XGgMmnJjo]/.test(ch)) continue;
    G2[y][q + MG + dx] = ch;
   }
  }
  const out = G2.map(r => r.join(''));
  let last = out.length - 1;
  while (last > ls && !/[^.]/.test(out[last])) last--;
  const o2 = out.slice(0, last + 1), ay = o2.length - 2;
  const pk = f[2] ? [ f[2][0] + dx, f[2][1] + dy - (ay - f[1]) ] : null;
  return reg(key, ax, ay, pk, o2);
 }
 /* ---------- front / back views (d8): legs as two columns with foot lift ---------- */
 const D8LIFT = [ [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ 1, 0 ], [ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 0, 1 ] ];
 function d8Legs(rows, ls, ph, liftOverride, q3) {
  const top = rows[ls], runs = [];
  let s = -1;
  for (let q = 0; q <= top.length; q++) {
   const ch = q < top.length ? top[q] : '.';
   if (ch === 'J' || ch === 'j') {
    if (s < 0) s = q;
   } else if (s >= 0) {
    runs.push([ s, q - 1 ]);
    s = -1;
   }
  }
  if (runs.length !== 2) return null;
  const tall = ph === 2 || ph === 6 ? 1 : 0, H = 5 + tall, W2 = top.length, out = [];
  for (let i = 0; i <= H; i++) out.push(Array(W2).fill('.'));
  const lift = liftOverride || D8LIFT[ph];
  const put = (y, q, c) => {
   if (y >= 0 && y <= H && q >= 0 && q < W2) out[y][q] = c;
  };
  const ol = (y, q) => {
   if (y >= 0 && y <= H && q >= 0 && q < W2 && out[y][q] === '.') out[y][q] = 'o';
  };
  runs.forEach((rn, li) => {
   const [a, b] = rn, l = lift[li], x0 = Math.round((a + b) / 2 - .5), outw = li === 0 ? -1 : 1;
   const nT = H - 3;
   for (let y = 0; y < nT; y++) {
    for (let q = a; q <= b; q++) put(y, q, top[q] === 'j' ? 'j' : 'J');
    ol(y, a - 1);
    ol(y, b + 1);
   }
   const low = l === 0 ? [ 'S', 'W', 'K' ] : l === 1 ? [ 'W', 'K' ] : [ 'K' ];
   const yc = H - 1 - l;
   low.forEach((c, i) => {
    const y = yc - (low.length - 1 - i);
    /* v4045: in the three-quarter views (SE/NE) both shoes point the way he faces (+x before the flip); straight front/back views keep the outward splay */
    const wide = c === 'K' && l === 0, xs = wide && outw < 0 && !q3 ? x0 - 1 : x0, ww = wide ? 3 : 2;
    for (let q = xs; q < xs + ww; q++) put(y, q, c);
    ol(y, xs - 1);
    ol(y, xs + ww);
    if (i === low.length - 1) for (let q = xs; q < xs + ww; q++) ol(y + 1, q);
   });
  });
  return out.map(r => r.join(''));
 }
 /* ---------- second hand onto the shaft (front/back views) ---------- */
 function clusters(R, test) {
  const h = R.length, w = R[0].length, seen = new Set, out = [];
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   if (!test(R[r][q]) || seen.has(q + ',' + r)) continue;
   const cl = [], st = [ [ q, r ] ];
   seen.add(q + ',' + r);
   while (st.length) {
    const [x, y] = st.pop();
    cl.push([ x, y ]);
    for (const [a, b] of [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ]) {
     const X = x + a, Y = y + b;
     if (Y >= 0 && Y < h && X >= 0 && X < w && !seen.has(X + ',' + Y) && test(R[Y][X])) {
      seen.add(X + ',' + Y);
      st.push([ X, Y ]);
     }
    }
   }
   out.push(cl);
  }
  return out;
 }
 function twoHands(rows, back) {
  const R = rows.map(r => r.split('')), h = R.length;
  const xs = [];
  for (let r = 0; r < h; r++) for (let q = 0; q < R[r].length; q++) if (R[r][q] === 'X') xs.push([ q, r ]);
  if (xs.length < 4) return null;
  const gl = clusters(R, c => c === 'G' || c === 'g');
  if (gl.length < 2) return null;
  const dist = cl => Math.min(...cl.map(([x, y]) => Math.min(...xs.map(([a, b]) => Math.max(Math.abs(a - x), Math.abs(b - y))))));
  const scored = gl.map(cl => ({ cl: cl, d: dist(cl) })).sort((a, b) => a.d - b.d);
  const hold = scored[0], free = scored[scored.length - 1];
  if (free.d < 3) return null;
  const fx = free.cl.reduce((s, c) => s + c[0], 0) / free.cl.length, fy = Math.min(...free.cl.map(c => c[1]));
  for (const [x, y] of free.cl) {
   const up = y > 0 ? R[y - 1][x] : '.';
   R[y][x] = up === 'J' || up === 'j' ? up : x > 0 && /[Jj]/.test(R[y][x - 1]) && x + 1 < R[y].length && /[Jj]/.test(R[y][x + 1]) ? 'J' : '.';
  }
  const hy = Math.min(...hold.cl.map(c => c[1]));
  const shaft = xs.filter(([q, r]) => r <= hy - 2 && r >= hy - 4).sort((a, b) => b[1] - a[1]);
  if (!shaft.length) return null;
  const [sx, sy] = shaft[Math.min(shaft.length - 1, 1)];
  const dir = fx > sx ? 1 : -1;
  /* v4044: shorter arm that starts near the shoulder, sleeve (jersey) colour with skin only at the wrist */
  const ex = Math.round(sx + dir * Math.min(5, Math.abs(fx - sx) - 1)), ey = Math.round((fy - 1 + sy) / 2) + 1;
  const n = Math.max(Math.abs(sx + dir - ex), Math.abs(sy - ey)) || 1;
  for (let i = 0; i <= n; i++) {
   const x = Math.round(ex + (sx + dir - ex) * i / n), y = Math.round(ey + (sy - ey) * i / n);
   if (y < 0 || y >= h || x < 0 || x >= R[y].length) continue;
   if (R[y][x] === 'X' || R[y][x] === 'G' || R[y][x] === 'g' || R[y][x] === 'H' || R[y][x] === 'h') continue;
   if (back && i < n - 1) continue;
   R[y][x] = back || i >= n - 1 ? 'S' : 'j';
   if (!back && i > 0 && i < n && y + 1 < h && /[Jj]/.test(R[y + 1][x])) R[y + 1][x] = 'o';
  }
  R[sy][sx + dir] = 'G';
  if (sy + 1 < h && R[sy + 1][sx + dir] !== 'X') R[sy + 1][sx + dir] = 'g';
  if (sy + 1 < h && R[sy + 1][sx] === 'X') R[sy + 1][sx] = 'g';
  R[sy][sx] = 'G';
  return R.map(r => r.join(''));
 }
 function headBox(rows) {
  let x0 = 99, y0 = 99, x1 = -1, y1 = -1;
  rows.forEach((r, y) => {
   for (let q = 0; q < r.length; q++) if (/[HhwcCZ]/.test(r[q])) {
    x0 = Math.min(x0, q);
    x1 = Math.max(x1, q);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
   }
  });
  return x1 < 0 ? null : [ x0, y0, x1, y1 ];
 }
 function clearHead(rows) {
  const b = headBox(rows);
  if (!b) return { rows: rows, up: 0, add: 0 };
  const inB = (q, y) => q >= b[0] && q <= b[2] && y >= b[1] && y <= b[3];
  let R = rows.map(r => r.split('')), up = 0, add = 0;
  const hit = () => R.some((r, y) => r.some((ch, q) => /[Mmn]/.test(ch) && inB(q, y - add)));
  while (hit() && up < 4) {
   const pts = [];
   R.forEach((r, y) => r.forEach((ch, q) => {
    if (/[Mmn]/.test(ch)) pts.push([ q, y, ch ]);
   }));
   if (pts.some(t => t[1] === 0)) {
    R.unshift(Array(R[0].length).fill('.'));
    add++;
    pts.forEach(t => t[1]++);
   }
   for (const [q, y] of pts) R[y][q] = '.';
   for (const [q, y, ch] of pts) R[y - 1][q] = ch;
   /* the shaft keeps touching the head: extend its top X by one row */
   const xs = [];
   R.forEach((r, y) => r.forEach((ch, q) => {
    if (ch === 'X') xs.push([ q, y ]);
   }));
   if (xs.length) {
    const t = xs.reduce((a, c) => c[1] < a[1] ? c : a);
    if (t[1] > 0 && R[t[1] - 1][t[0]] === '.') R[t[1] - 1][t[0]] = 'X';
   }
   up++;
  }
  return { rows: R.map(r => r.join('')), up: up, add: add };
 }
 function d8Frame(base, ph, hands, lift, tag) {
  const key = base + '~d' + ph + (hands ? 'h' : '') + (tag || '');
  if (FR[key]) return key;
  const f = FR[base];
  if (!f) return base;
  let rows = f[3], pk0 = f[2], fay = f[1];
  /* v4046: some 3/4-view cradle sprites (d8SE_cr3_L, d8NE_cr3_R) drop the stick head onto the back of the helmet and chip its shell,
     so the cage and helmet look broken for one frame of the cradle. Those frames take the upper body of their cr0 sibling (same pose,
     stick head clear above the helmet); the legs are rebuilt below as usual. */
  const sib = /^d8(N|NE|S|SE)_cr[1-3]_[LR]$/.test(base) ? base.replace(/_cr\d_/, '_cr0_') : null, F0 = sib && FR[sib];
  if (F0 && F0[0] === f[0] && F0[3][0].length === rows[0].length) {
   const ls3 = legStart(rows), lsB = legStart(F0[3]), hm = r => r.map(l => l.replace(/[^HhwcCZ]/g, '.')).filter(l => /[^.]/.test(l)).join('|');
   if (ls3 > 0 && lsB > 0 && hm(rows.slice(0, ls3)) !== hm(F0[3].slice(0, lsB))) {
    rows = F0[3].slice(0, lsB).concat(rows.slice(ls3));
    fay = f[1] - ls3 + lsB;
    pk0 = F0[2] ? [ F0[2][0], F0[1] + F0[2][1] - fay ] : pk0;
   }
  }
  if (hands) rows = twoHands(rows, /^d8N/.test(base)) || rows;
  const ls = legStart(rows);
  if (ls < 0) return base;
  const legs = d8Legs(rows, ls, ph, lift, /^d8(SE|NE)_|^a442_nb$/.test(base));
  if (!legs) return base;
  const keep = rows.slice(ls);
  const out = rows.slice(0, ls).concat(legs.map((r, i) => {
   const k = keep[i];
   if (!k) return r;
   const a = r.split('');
   for (let q = 0; q < k.length; q++) if (/[XGgMmn]/.test(k[q])) a[q] = k[q];
   return a.join('');
  }));
  let last = out.length - 1;
  while (last > ls && !/[^.]/.test(out[last])) last--;
  let o2 = out.slice(0, last + 1);
  /* v4046: no stick-head pixel may sit inside the helmet/face-mask box; lift the head (and its shaft top) clear when it touches */
  const cl = clearHead(o2);
  o2 = cl.rows;
  const ay = o2.length - 2;
  const pk = pk0 ? [ pk0[0], pk0[1] - cl.up - (ay - cl.add - fay) ] : null;
  ST.d8++;
  return reg(key, f[0], ay, pk, o2);
 }
 /* ---------- v4046: side-view carry (cradle) frames ----------
    The game's cradle0-3 sprites hold the stick straight up through the face mask with the top glove at the chin, so when he runs with the ball
    his arm and stick cover his face and split the cage. The carry now uses the matching run sprite's upper body (stick shaft in front of the
    face, both gloves at chest height, whole cage visible) with the stick lifted 2-4 px per cradle frame so the cradle bob is kept. */
 const CR_LIFT = [ 3, 4, 2, 4 ];
 function carryBase(i) {
  const key = 'a442_cr' + i;
  if (FR[key]) return key;
  const f = FR['run' + i];
  if (!f) return null;
  const R = CR_LIFT[i], rows = f[3].map(r => r.split('')), h = rows.length, w = rows[0].length;
  /* the stick part to lift: head (M/m/n) and the shaft (X) above the top glove row */
  let gy = -1;
  for (let r = 0; r < h && gy < 0; r++) if (rows[r].some(ch => ch === 'G')) gy = r;
  if (gy < 0) return null;
  const top = [];
  for (let r = 0; r < gy - 2; r++) for (let q = 0; q < w; q++) if (/[XMmn]/.test(rows[r][q])) top.push([ q, r, rows[r][q] ]);
  const out = [];
  for (let r = 0; r < R; r++) out.push(Array(w).fill('.'));
  rows.forEach(r => out.push(r.slice()));
  for (const [q, r] of top) out[r + R][q] = '.';
  for (const [q, r, ch] of top) out[r][q] = ch;
  /* refill the shaft between the lifted part and the shaft left below it, and keep the shaft one column clear of the cage
     all the way down to the top glove (the run sprite steps it in by one pixel beside the chin bar) */
  const xs = top.filter(t => t[2] === 'X');
  if (xs.length) {
   const lo = xs.reduce((a, b) => b[1] > a[1] ? b : a), cx = lo[0];
   for (let r = lo[1] + 1; r <= lo[1] + R; r++) if (out[r][cx] === '.' || out[r][cx] === 'o') out[r][cx] = 'X';
   for (let r = lo[1] + R + 1; r < gy + R; r++) for (let q = cx - 2; q < cx; q++) if (out[r][q] === 'X') {
    out[r][q] = '.';
    out[r][cx] = 'X';
   }
  }
  const pk = f[2] ? [ f[2][0], f[2][1] - R ] : null;
  return reg(key, f[0], f[1] + R, pk, out.map(r => r.join('')));
 }
 window.__rl442.carryBase = carryBase;
 /* ---------- naming ---------- */
 const SIDE_RX = /^(pole_)?(run|cradle)([0-3])$/, D8_RX = /^d8(N|NE|S|SE)_(run|prun|cr)([0-3])_[LR]$/, D8I_RX = /^d8(N|NE|S|SE)_(idle|pidle)_[LR]$/;
 function phaseOf(p) {
  return Math.floor((p.anim || 0) / 2) & 7;
 }
 function moving(p) {
  return T() - (p._mv == null ? -9 : p._mv) < .12;
 }
 function remap(name, p) {
  if (!p) return name;
  let m = SIDE_RX.exec(name);
  if (m) {
   const cb = m[2] === 'cradle' && !m[1] ? carryBase(+m[3]) : null, base = cb || name;
   if (!moving(p)) return base;
   ST.run++;
   return sideFrame(base, phaseOf(p));
  }
  m = D8_RX.exec(name);
  if (m) {
   const hands = m[2] === 'cr' || m[2] === 'prun' || m[2] === 'run';
   if (!moving(p)) return hands ? d8Frame(name, 0, true) : name;
   ST.run++;
   return d8Frame(name, phaseOf(p), hands);
  }
  if (D8I_RX.test(name)) return d8Frame(name, 0, true);
  return name;
 }
 window.__rl442.remap = remap;
 window.__rl442.sideFrame = sideFrame;
 window.__rl442.d8Frame = d8Frame;
 window.__rl442.twoHands = twoHands;

 /* ---------- small pixel helpers (sprite space, inside scaled12) ---------- */
 const P = (g2, x, y, c) => {
  g2.fillStyle = c;
  g2.fillRect(Math.round(x), Math.round(y), 1, 1);
 };
 function seg(g2, x0, y0, x1, y1, c) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  g2.fillStyle = c;
  for (let i = 0; i <= n; i++) g2.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1);
 }
 function palOf(kit, skin) {
  try {
   return RL12.palette(kit, Math.max(0, Math.min(RL12.SKIN.length - 1, skin | 0)));
  } catch (e) {
   return { S: '#dcac78', s: '#b0804e', G: '#ffffff', g: '#bfbfbf', o: '#0d0d0d' };
  }
 }
 function stickCols(p, long) {
  let sc = window.__v17sc;
  try {
   if (!sc && window.V17 && typeof game !== 'undefined' && game && game.g17 && V17.handStickCols) sc = V17.handStickCols(p);
  } catch (e) {
   sc = null;
  }
  return { X: sc && sc.X || (long ? '#3a3a44' : '#282830'), M: sc && sc.M || '#ffffff', m: sc && sc.m || '#cdd6da', n: sc && sc.n || '#96a0a6' };
 }
 /* v4045: stick head drawn like the game's own head sprite (white rim, grey mesh) so a ball in the pocket reads as one stick head holding a ball, not a white square */
 const HEADPAT = [ '.MMM.', 'MmnmM', 'MnmnM', 'MmnmM', '.MnM.', '.MMM.' ];
 /* v4045: the head that carries the ball in a roll / split / hand-drawn carry is a full pocket (6 wide, 8 tall, like the game's own head sprite):
    the ball sits low and toward the stick side, so rim + mesh show above it and on its outer side and it reads as one stick head holding a ball */
 const HEADPOCK = [ '.MMMM.', 'MmnmnM', 'MnmnmM', 'MmnmnM', 'MnmnmM', 'MmnmnM', '.MnmM.', '..MM..' ];
 function head(g2, hx, hy, c, tall, s) {
  hx = Math.round(hx);
  hy = Math.round(hy);
  if (tall) {
   const fl = (s || 1) < 0;
   for (let r = 0; r < HEADPOCK.length; r++) for (let q = 0; q < 6; q++) {
    const ch = HEADPOCK[r][q];
    if (ch === '.') continue;
    g2.fillStyle = ch === 'M' ? c.M : ch === 'm' ? c.m : c.n;
    g2.fillRect(fl ? hx + 2 - q : hx - 2 + q, hy - 4 + r, 1, 1);
   }
   return;
  }
  for (let r = 0; r < HEADPAT.length; r++) for (let q = 0; q < 5; q++) {
   const ch = HEADPAT[r][q];
   if (ch === '.') continue;
   g2.fillStyle = ch === 'M' ? c.M : ch === 'm' ? c.m : c.n;
   g2.fillRect(hx - 2 + q, hy - 3 + r, 1, 1);
  }
 }
 function arm(g2, x0, y0, x1, y1, pal) {
  seg(g2, x0, y0 + 1, x1, y1 + 1, pal.s || pal.S);
  seg(g2, x0, y0, x1, y1, pal.S);
 }
 /* v4046: the shorter sleeve-colour arm (jersey sleeve, skin only at the wrist), same look as the front/back two-hand carry */
 function sleeveArm(g2, x0, y0, x1, y1, pal) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
   const X = Math.round(x0 + (x1 - x0) * i / n), Y = Math.round(y0 + (y1 - y0) * i / n), wr = i >= n - 1;
   P(g2, X, Y + 1, wr ? pal.s || pal.S : pal.j || pal.J);
   P(g2, X, Y, wr ? pal.S : pal.J);
  }
 }
 function glove(g2, x, y, pal) {
  x = Math.round(x);
  y = Math.round(y);
  P(g2, x - 1, y - 1, pal.o || '#0d0d0d');
  P(g2, x, y - 1, pal.o || '#0d0d0d');
  P(g2, x - 1, y, pal.G);
  P(g2, x, y, pal.G);
  P(g2, x - 1, y + 1, pal.g || pal.G);
  P(g2, x, y + 1, pal.g || pal.G);
 }
 /* full two-handed stick: shoulders -> hands, shaft butt -> head. s = facing sign; points relative to anchor */
 function stick2(g2, x, y, s, K, pal, c, alphaHead, tall) {
  const X = v => x + s * v, Bx = X(K.b[0]), By = y + K.b[1], Tx = X(K.t[0]), Ty = y + K.t[1], Hx = X(K.h[0]), Hy = y + K.h[1];
  const ux = Tx - Bx, uy = Ty - By, ul = Math.hypot(ux, uy) || 1;
  const bx = Bx - ux / ul * 3, by = By - uy / ul * 3;
  /* v4046: K.sh = shoulder height (default y-13); the carry passes y-11 so the arms start below the face mask (its chin bar is the y-13 row) */
  const shY = K.sh != null ? K.sh : -13, am = K.sleeve ? sleeveArm : arm;
  /* K.swap: stick on the back side - the back shoulder takes the top hand, so neither arm crosses the chest */
  if (K.swap) {
   am(g2, X(3), y + shY, Bx, By, pal);
   seg(g2, bx, by, Hx, Hy + 2, c.X);
   am(g2, X(-2), y + shY, Tx, Ty, pal);
  } else {
   am(g2, X(-2), y + shY, Bx, By, pal);
   seg(g2, bx, by, Hx, Hy + 2, c.X);
   am(g2, X(3), y + shY, Tx, Ty, pal);
  }
  glove(g2, Bx, By, pal);
  glove(g2, Tx, Ty, pal);
  head(g2, Hx, Hy - 1, c, tall, s);
 }
 /* ---------- shot: wind-up (aim pull-back), release, follow-through, recovery ---------- */
 const CARRY = { h: [ 5, -24 ], t: [ 4, -14 ], b: [ 1, -11 ] }, COCK = { h: [ -15, -21 ], t: [ -5, -16 ], b: [ 0, -12 ] };
 const SHOTK = {
  over: [ [ 0, COCK ], [ .05, { h: [ -4, -31 ], t: [ 0, -19 ], b: [ 2, -13 ] } ], [ .1, { h: [ 12, -22 ], t: [ 6, -16 ], b: [ 2, -12 ] } ], [ .17, { h: [ 13, -9 ], t: [ 7, -11 ], b: [ 2, -12 ] } ], [ .27, { h: [ 9, -3 ], t: [ 6, -7 ], b: [ 1, -11 ] } ], [ .4, { h: [ 7, -13 ], t: [ 5, -11 ], b: [ 1, -11 ] } ], [ .5, CARRY ] ],
  side: [ [ 0, { h: [ -11, -14 ], t: [ -4, -13 ], b: [ 0, -12 ] } ], [ .06, { h: [ 2, -16 ], t: [ 2, -14 ], b: [ 1, -12 ] } ], [ .11, { h: [ 13, -14 ], t: [ 7, -13 ], b: [ 2, -12 ] } ], [ .2, { h: [ 10, -6 ], t: [ 6, -9 ], b: [ 1, -11 ] } ], [ .3, { h: [ 6, -5 ], t: [ 5, -8 ], b: [ 1, -11 ] } ], [ .42, { h: [ 6, -14 ], t: [ 5, -12 ], b: [ 1, -11 ] } ], [ .5, CARRY ] ],
  under: [ [ 0, { h: [ -10, -6 ], t: [ -4, -10 ], b: [ 0, -12 ] } ], [ .06, { h: [ 1, -3 ], t: [ 1, -9 ], b: [ 1, -12 ] } ], [ .11, { h: [ 12, -12 ], t: [ 6, -12 ], b: [ 2, -12 ] } ], [ .2, { h: [ 11, -24 ], t: [ 6, -16 ], b: [ 2, -12 ] } ], [ .3, { h: [ 8, -26 ], t: [ 5, -16 ], b: [ 1, -12 ] } ], [ .42, { h: [ 6, -22 ], t: [ 4, -14 ], b: [ 1, -11 ] } ], [ .5, CARRY ] ]
 };
 const lerp = (a, b, u) => a + (b - a) * u, L2 = (A, B, u) => [ lerp(A[0], B[0], u), lerp(A[1], B[1], u) ];
 const mixK = (A, B, u) => ({ h: L2(A.h, B.h, u), t: L2(A.t, B.t, u), b: L2(A.b, B.b, u) });
 function keyAt(type, e) {
  const K = SHOTK[type] || SHOTK.over;
  for (let i = 1; i < K.length; i++) if (e <= K[i][0]) {
   const a = K[i - 1], b = K[i], u = (e - a[0]) / Math.max(1e-6, b[0] - a[0]), es = u * u * (3 - 2 * u);
   return mixK(a[1], b[1], es);
  }
  return K[K.length - 1][1];
 }
 let SB = null;
 function shotBase() {
  if (SB && FR[SB]) return SB;
  const I = FR.idle;
  if (!I) return null;
  SB = reg('a442_sb', I[0], I[1], null, I[3].map(r => r.replace(/[MmnXGg]/g, '.')));
  return SB;
 }
 function shotPose(e) {
  if (e < .05) return [ 0, -1, 1 ];
  if (e < .1) return [ 0, 0, 1 ];
  if (e < .2) return [ 4, 1, 1 ];
  if (e < .34) return [ 3, 1, 0 ];
  if (e < .42) return [ 2, 0, 0 ];
  return null;
 }
 function shotFrame(e, K) {
  const b = shotBase();
  if (!b) return null;
  const ps = shotPose(e);
  const k = ps ? sideFrame(b, ps[0], ps[1], 'sh', null, ps[2]) : b;
  const f = FR[k], q = Math.round(K.h[0]) + ',' + Math.round(K.h[1]), key = k + '@' + q;
  if (!FR[key]) FR[key] = [ f[0], f[1], [ Math.round(K.h[0]), Math.round(K.h[1]) ], f[3] ];
  return key;
 }
 const SHOTSEEN = new WeakMap;
 function shotOf(p) {
  const S = p && p.shot20;
  if (!S || S.type === 'ots' || S.f28) return null;
  const e = T() - S.t0;
  if (!(e >= 0 && e < .5)) return null;
  return { e: e, type: S.type && SHOTK[S.type] ? S.type : 'over', S: S };
 }
 function windOf(p) {
  try {
   if (typeof screen === 'undefined' || screen !== 'live' || typeof game === 'undefined' || !game || game.carrier !== p || p.shot20 || p.dodgeA || p.down > 0) return -1;
   const A = window.SHOT26 && SHOT26.S && SHOT26.S.aim;
   if (!A) {
    const sp = typeof shootP !== 'undefined' ? shootP : null;
    if (sp && sp.t0 != null && typeof now === 'function') return clamp01((now() - sp.t0) / .28);
    return -1;
   }
   if (window.V20 && V20.otsAim282 && V20.otsAim282(p)) return -1;
   const pull = Math.max(0, (A.ax || 0) - (A.tx || 0));
   const age = typeof now === 'function' && A.t0 != null ? Math.max(0, now() - A.t0) : .2;
   return clamp01(Math.max(pull / 26, Math.min(.35, age * 1.5)));
  } catch (e) {
   return -1;
  }
 }
 const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
 /* ---------- sharp direction change: plant + push (drawing only) ---------- */
 const MV = new WeakMap, PLANT = [ '..oJJJJooJJJJo...', '.oJJJJo..oJJJJo..', 'oSSo......osso...', 'oWWo......ovvo...', 'oKKKo.....oKKKo..', '.ooo.......ooo...' ];
 function trackCut(p) {
  const t = T();
  let m = MV.get(p);
  if (!m) {
   MV.set(p, { x: p.x, y: p.y, t: t, vx: 0, vy: 0, cut: -9 });
   return;
  }
  const dt = t - m.t;
  if (dt <= 0) return;
  if (dt > .25) {
   m.x = p.x;
   m.y = p.y;
   m.t = t;
   m.vx = m.vy = 0;
   return;
  }
  const vx = (p.x - m.x) / dt, vy = (p.y - m.y) / dt, sp = Math.hypot(vx, vy), s0 = Math.hypot(m.vx, m.vy);
  if (sp > 18 && s0 > 18 && t - m.cut > .45) {
   const cs = (vx * m.vx + vy * m.vy) / (sp * s0);
   if (cs < -.35 && Math.abs(m.vx) > 8) {
    m.cut = t;
    m.cdir = vx >= 0 ? 1 : -1;
    ST.cut++;
   }
  }
  const k = Math.min(1, dt * 14);
  m.vx += (vx - m.vx) * k;
  m.vy += (vy - m.vy) * k;
  m.x = p.x;
  m.y = p.y;
  m.t = t;
 }
 function cutK(p) {
  const m = MV.get(p);
  if (!m) return -1;
  const e = T() - m.cut;
  return e >= 0 && e < .2 ? e / .2 : -1;
 }

 /* ---------- stickless bases for dodges ---------- */
 function strip(base, tag, rx) {
  const key = 'a442_' + tag;
  if (FR[key]) return key;
  const f = FR[base];
  if (!f) return null;
  return reg(key, f[0], f[1], null, f[3].map(r => r.replace(rx || /[MmnXGg]/g, '.')));
 }
 function noGlove(key) {
  const k2 = key + '^ng';
  if (FR[k2]) return k2;
  const f = FR[key];
  if (!f) return key;
  return reg(k2, f[0], f[1], f[2], f[3].map(r => r.replace(/[Gg]/g, '.')));
 }
 function backArms(key) {
  const k2 = key + '^bk';
  if (FR[k2]) return k2;
  const f = FR[key];
  if (!f) return key;
  const rows = f[3].map(r => r.split('')), ls = legStart(f[3]), cut = f[0] + 6;
  let top = rows.findIndex(r => r.some(ch => ch === 'J' || ch === 'j'));
  if (ls < 0 || top < 0) return key;
  for (let r = top; r < ls + 2 && r < rows.length; r++) {
   if (r < ls) for (let q = cut; q < rows[r].length; q++) if (rows[r][q] !== '.' && rows[r][q] !== 'X') rows[r][q] = '.';
   /* close the outline where an arm or a removed glove left the body open */
   let e = Math.min(cut, rows[r].length) - 1;
   while (e >= 0 && rows[r][e] === '.') e--;
   if (e >= 0 && e + 1 < rows[r].length && /[JjSs]/.test(rows[r][e])) rows[r][e + 1] = 'o';
  }
  /* the sprite's own stick pixels are not drawn on this path: fill the ones inside the body so no hole shows through the shorts */
  for (const r of rows) for (let q = 1; q + 1 < r.length; q++) if (r[q] === 'X' && r[q - 1] !== '.' && r[q + 1] !== '.') r[q] = /[JjSsWvK]/.test(r[q - 1]) ? r[q - 1] : /[JjSsWvK]/.test(r[q + 1]) ? r[q + 1] : 'o';
  return reg(k2, f[0], f[1], f[2], rows.map(r => r.join('')));
 }
 function dust(g2, x, y, s, k, n) {
  const a = (.8 * clamp01(1 - k)).toFixed(2);
  if (a <= 0) return;
  for (let i = 0; i < (n || 4); i++) P(g2, x - s * (5 + i * 2), y - (i % 2) - (i > 1 ? 1 : 0), 'rgba(230,220,190,' + a + ')');
 }
 /* hands on a line from the body to the stick head */
 function handsTo(hr, sh) {
  const c = sh || [ 0, -11 ];
  return { h: hr, t: [ lerp(c[0], hr[0], .45), lerp(c[1], hr[1], .45) ], b: [ lerp(c[0], hr[0], .1), lerp(c[1], hr[1], .1) + 1 ] };
 }
 function drawSplit(p, A, kit, faceRight) {
  const G = game, k = clamp01(A.t / A.dur), x = Math.round(p.x), y = Math.round(p.y), s = faceRight ? 1 : -1, sk = skinOf(p.pl), long = isPole(p), pal = palOf(kit, sk), c = stickCols(p, long);
  const d8 = typeof d8live === 'function' && d8live(p);
  const h0 = d8 ? d8head(p, x, y, -(A.side || -1)) : stickHeadAt(x, y, A.from, faceRight), h1 = d8 ? d8head(p, x, y, A.side) : stickHeadAt(x, y, A.side, faceRight), mid = [ x + (d8 ? 0 : s), y - 27 ];
  const hx = k < .5 ? h0[0] + (mid[0] - h0[0]) * k * 2 : mid[0] + (h1[0] - mid[0]) * (k - .5) * 2;
  const hy = k < .5 ? h0[1] + (mid[1] - h0[1]) * k * 2 : mid[1] + (h1[1] - mid[1]) * (k - .5) * 2;
  const dv = A.vx >= 0 ? 1 : -1;
  let body, sh = [ 0, -11 ], bs = s, lean = 0;
  if (k < .22) {
   body = sideFrame(strip('run1', 'rb'), 0, -dv * s, 'pl', PLANT, 1);
   lean = 0;
  } else if (k < .64) {
   body = d8Frame(strip('d8S_cr0_L', 'fb'), 0, false, [ 0, 0 ], 'w');
   lean = Math.round(Math.sin((k - .22) / .42 * Math.PI) * dv);
   sh = [ 0, -12 ];
  } else {
   body = sideFrame(strip('run1', 'rb'), Math.floor(k * 18) & 7, s * dv > 0 ? 1 : 0, 'ex');
  }
  draw0(g, body, x + lean, y, kit, faceRight, { skin: sk });
  if (k < .45) dust(g, x, y, dv, k * 1.6, 5);
  const hr = [ (Math.round(hx) - x) * bs, Math.round(hy) - y ];
  const hk = handsTo([ hr[0] - lean * bs, hr[1] ], sh);
  if (k >= .22 && k < .64) {
   hk.t = [ hk.h[0] * .35, -16 ];
   hk.b = [ hk.h[0] * .1 - 1, -10 ];
  }
  stick2(g, x + lean, y, bs, hk, pal, c, 0, true);
  p._442h = { t: T(), A: A, tall: true, dx: lean + bs * hk.h[0], dy: hk.h[1], s: bs };
  for (let i = 1; i <= 3; i++) P(g, x - A.vx * i * 3, y - 12 - A.vy * i * 3, 'rgba(143,227,240,.7)');
  G.splitFrames = (G.splitFrames || 0) + 1;
  if (d8) G.d8splits = (G.d8splits || 0) + 1;
  p._fr = 'run1';
  p._fright = faceRight;
  ST.dodge++;
 }
 /* v4045: the roll's stick-head spot is one pure function of the dodge, so the ball can be put in the same pocket even when it is drawn before the player */
 function rollPose(p, A, faceRight) {
  const k = clamp01(A.t / A.dur);
  let F0 = A.face ? A.face[0] >= 0 : faceRight, F1 = A.vx >= 0;
  if (p._r21 && typeof J7on === 'function' && J7on()) {
   F0 = !!p._r21.f0;
   F1 = !F0;
  }
  const st = Math.min(4, Math.floor(k * 5));
  const fr = st === 0 ? F0 : st === 1 ? !F0 : st === 2 ? F0 : F1;
  const hr = st === 0 ? [ 3, -26 ] : st === 1 ? [ 7, -25 ] : st === 2 ? [ 8, -24 ] : st === 3 ? [ 7, -25 ] : [ 6, -24 ];
  return { k: k, st: st, fr: fr, hr: hr, s: fr ? 1 : -1 };
 }
 function drawRoll(p, A, kit, faceRight) {
  const G = game, x = Math.round(p.x), y = Math.round(p.y), sk = skinOf(p.pl), long = isPole(p), pal = palOf(kit, sk), c = stickCols(p, long);
  const spinR = (A.spin || 1) > 0;
  const R = rollPose(p, A, faceRight), k = R.k, st = R.st, hr = R.hr, s = R.s, sh = [ 0, -12 ], dx = 0;
  A._442f = faceRight;
  let body;
  if (st === 0) body = sideFrame(strip('run1', 'rb'), 0, 1, 'dr', PLANT, 1); else if (st === 1) body = d8Frame(strip('d8NE_cr0_L', 'nb'), 0, false, [ 0, 0 ], 'w'); else if (st === 2) body = d8Frame(strip('d8N_cr0_L', 'bb'), 0, false, [ 0, 1 ], 'w'); else if (st === 3) body = d8Frame(strip('d8NE_cr0_L', 'nb'), 0, false, [ 1, 0 ], 'w'); else body = sideFrame(strip('run1', 'rb'), Math.floor(k * 18) & 7, 1, 'ex');
  const fr = R.fr;
  draw0(g, body, x + dx, y, kit, fr, { skin: sk });
  if (st === 0 || st === 4) dust(g, x, y, s, st ? (k - .8) * 5 : k * 5, 4);
  const back = st === 1 || st === 2 || st === 3;
  if (!back) stick2(g, x, y, s, handsTo(hr, sh), pal, c, 0, true); else {
   /* v4044: back-facing steps keep the stick out at his side (never straight up his back), head by the shoulder */
   const Hx = x + s * hr[0], Hy = y + hr[1], Bx = x + s * (hr[0] - 2);
   seg(g, Bx, y - 8, Hx, Hy + 2, c.X);
   head(g, Hx, Hy - 1, c, true, s);
   glove(g, x + s * (hr[0] - 1) + (s > 0 ? 1 : 0), y - 16, pal);
   glove(g, x + s * (hr[0] - 2) + (s > 0 ? 1 : 0), y - 11, pal);
  }
  p._442h = { t: T(), A: A, tall: true, dx: s * hr[0], dy: hr[1], s: s };
  for (let a = 0; a < 3.14 * k; a += .45) P(g, x + Math.cos(a * (spinR ? 1 : -1)) * 9, y - 10 + Math.sin(a * (spinR ? 1 : -1)) * 5, 'rgba(143,227,240,.75)');
  const r2 = !window.__rl_no2002r2 && !window.__rl_v124gb, f0 = r2 ? Math.min(2, Math.floor(k * 3)) : Math.min(3, Math.floor(k * 4));
  const order = r2 ? spinR ? [ 0, 1, 2 ] : [ 0, 3, 2 ] : spinR ? [ 0, 1, 2, 3 ] : [ 0, 3, 2, 1 ];
  G.rollFrames = (G.rollFrames || 0) + 1;
  G.rollFrameSeen = G.rollFrameSeen || {};
  G.rollFrameSeen[order[f0]] = 1;
  ST.dodge++;
 }
 /* shot / wind-up body + two-handed stick */
 function drawShotP(g2, p, x, y, kit, faceRight, sk, sh, w) {
  const s = faceRight ? 1 : -1, pal = palOf(kit, sk), c = stickCols(p, isPole(p));
  let K, key;
  if (sh) {
   K = keyAt(sh.type, sh.e);
   key = shotFrame(sh.e, K);
   ST.shot++;
  } else {
   K = mixK(CARRY, COCK, w * w * (3 - 2 * w));
   const b = shotBase(), k0 = sideFrame(b, w > .5 ? 0 : 2, w > .4 ? -1 : 0, 'wd', null, w > .6 ? 1 : 0);
   const f = FR[k0], q = Math.round(K.h[0]) + ',' + Math.round(K.h[1]);
   key = k0 + '@' + q;
   if (!FR[key]) FR[key] = [ f[0], f[1], [ Math.round(K.h[0]), Math.round(K.h[1]) + 1 ], f[3] ];
   ST.wind++;
  }
  if (!key) return null;
  draw0(g2, key, x, y, kit, faceRight, { skin: sk });
  const lean = sh ? (shotPose(sh.e) || [ 0, 0 ])[1] : w > .4 ? -1 : 0;
  if (sh && sh.e > .03 && sh.e < .22) for (let j = 2; j >= 1; j--) {
   const Kp = keyAt(sh.type, Math.max(0, sh.e - j * .025));
   g2.globalAlpha = .22 * (3 - j);
   seg(g2, x + s * Kp.t[0], y + Kp.t[1], x + s * Kp.h[0], y + Kp.h[1] + 1, '#e8f6ff');
   head(g2, x + s * Kp.h[0], y + Kp.h[1] - 1, { M: '#e8f6ff', m: '#cfe9f5', n: '#a8c8d8' });
   g2.globalAlpha = 1;
  }
  stick2(g2, x + lean * s, y + (sh ? (shotPose(sh.e) || [ 0, 0, 0 ])[2] : w > .6 ? 1 : 0), s, { h: [ K.h[0] - lean, K.h[1] ], t: [ K.t[0] - lean, K.t[1] ], b: [ K.b[0] - lean, K.b[1] ] }, pal, c);
  if (sh && sh.e < .14) dust(g2, x, y, s, sh.e * 6, 3);
  return key;
 }
 /* ---------- hooks ---------- */
 let cur = null, curFr = null, ns = null;
 const draw0 = RL12.draw;
 RL12.draw = function(g2, name, x, y, kit, faceRight, opts) {
  const p = cur;
  if (off() || !p || !kit || !FR[name] || name.indexOf('~') >= 0 || name.indexOf('a442') === 0) return draw0.apply(this, arguments);
  try {
   const sk = opts && opts.skin;
   const sh = shotOf(p);
   if (sh && (name === 'f20_shotBody' || /^shoot[0-2]$/.test(name))) {
    const k = drawShotP(g2, p, Math.round(x), Math.round(y), kit, faceRight, sk, sh, 0);
    if (k) {
     curFr = k;
     return;
    }
   }
   const w = windOf(p);
   if (w >= 0 && (SIDE_RX.test(name) || /^idle$/.test(name) || D8_RX.test(name) || D8I_RX.test(name))) {
    const k = drawShotP(g2, p, Math.round(x), Math.round(y), kit, faceRight, sk, null, w);
    if (k) {
     curFr = k;
     return;
    }
   }
   let n2 = remap(name, p);
   const ck = cutK(p);
   if (ck >= 0 && n2 !== name) {
    const m = MV.get(p), s = faceRight ? 1 : -1;
    if (SIDE_RX.test(name)) n2 = sideFrame(name, 0, m.cdir * s > 0 ? 1 : -1, 'ct', PLANT, ck < .6 ? 1 : 0); else if (D8_RX.test(name)) n2 = d8Frame(name, 0, true, [ 0, 0 ], 'c');
    const r = draw0.call(this, g2, n2, x, y, kit, faceRight, opts);
    dust(g2, Math.round(x), Math.round(y), m.cdir, ck, 5);
    curFr = n2;
    return r;
   }
   if (n2 !== name) {
    curFr = n2;
    return draw0.call(this, g2, n2, x, y, kit, faceRight, opts);
   }
  } catch (e) {
   ST.err++;
   if (ST.err < 4) console.warn('v442anim', e);
  }
  return draw0.apply(this, arguments);
 };
 const dp0 = window.drawPlayer12;
 if (typeof dp0 === 'function') window.drawPlayer12 = function(p) {
  if (off() || !p) return dp0.apply(this, arguments);
  const prev = cur, pf = curFr;
  cur = p;
  curFr = null;
  try {
   trackCut(p);
  } catch (e) {}
  try {
   return dp0.apply(this, arguments);
  } finally {
   if (curFr && p._fr !== curFr && FR[curFr]) p._fr = curFr;
   cur = prev;
   curFr = pf;
  }
 };
 const ns0 = window.draw12ns;
 if (typeof ns0 === 'function') window.draw12ns = function(name, x, y, kit, faceRight, skin, shadow) {
  const p = window.__v17p;
  if (off() || !p || !kit || !FR[name]) return ns0.apply(this, arguments);
  try {
   let n2 = name;
   if (SIDE_RX.test(name) || D8_RX.test(name) || D8I_RX.test(name)) n2 = remap(name, p);
   if (/^(pole_)?(run|cradle|idle)|^d8|^a442_cr/.test(n2)) {
    n2 = noGlove(n2);
    /* v4046: side carry with the stick on the back side: the sprite's arms no longer reach forward to an empty spot in front of the chest */
    if (!/^d8/.test(n2) && !p.dodgeA && typeof handOf17 === 'function' && handOf17(p) < 0) n2 = backArms(n2);
    ns = { kit: kit, skin: skin, t: T(), p: p, s: faceRight ? 1 : -1, front: /^d8(S|SE)_/.test(name), side: !/^d8/.test(name), x: Math.round(x), y: Math.round(y) };
   }
   return ns0.call(this, n2, x, y, kit, faceRight, skin, shadow);
  } catch (e) {
   ST.err++;
   return ns0.apply(this, arguments);
  }
 };
 const hs0 = window.drawHandStick;
 if (typeof hs0 === 'function') window.drawHandStick = function(x, y, hx, hy, long) {
  const N = ns;
  ns = null;
  const sc = window.__v17sc;
  if (off() || !N || N.t !== T() || sc && sc.glow || typeof HAS12 !== 'undefined' && !HAS12) return hs0.apply(this, arguments);
  try {
   const s = N.s, pal = palOf(N.kit, N.skin), c = stickCols(N.p, long);
   const hr = [ (hx - x) * s, hy - y ];
   let K = handsTo(hr, [ 0, -11 ]);
   /* v4046: plain side-view carry (no dodge): arms start at the shoulders below the face mask, both gloves at chest height, and the shaft
      runs in front of the face (stick on the front side) or behind the back of the helmet (stick on the back side) - never across the face */
   if (N.side && !N.p.dodgeA) {
    const b = [ 0, 1, -1, 1 ][phaseOf(N.p) >> 1 & 3];
    K = hr[0] < 0 ? { h: [ -12, -18 - b ], t: [ -7, -11 ], b: [ -2, -8 ], sh: -11, swap: true, sleeve: true } : { h: [ 11, -22 - b ], t: [ 8, -11 ], b: [ 5, -8 ], sh: -11, sleeve: true };
   }
   stick2(g, x, y, s, K, pal, c, 0, true);
   /* v4045: remember where this hand-stick head was drawn so the carrier's ball goes in its pocket, not under it */
   if (typeof game !== 'undefined' && game && N.p === game.carrier) N.p._442h = { t: T(), A: N.p.dodgeA || null, hs: true, tall: true, dx: Math.round(s * K.h[0]), dy: Math.round(K.h[1]), s: s };
   ST.hands++;
   return;
  } catch (e) {
   ST.err++;
   return hs0.apply(this, arguments);
  }
 };
 const dd0 = window.drawDodger12s;
 if (typeof dd0 === 'function') window.drawDodger12s = function(p, kit, faceRight) {
  const A = p && p.dodgeA;
  if (off() || !p || !kit) return dd0.apply(this, arguments);
  try {
   if (p.shot20 && shotOf(p) && !A) {
    const k = drawShotP(g, p, Math.round(p.x), Math.round(p.y), kit, faceRight, skinOf(p.pl), shotOf(p), 0);
    if (k) {
     p._fr = 'idle';
     p._fright = faceRight;
     return;
    }
   }
   const w = !A ? windOf(p) : -1;
   if (w >= 0) {
    const k = drawShotP(g, p, Math.round(p.x), Math.round(p.y), kit, faceRight, skinOf(p.pl), null, w);
    if (k) {
     p._fr = k;
     p._fright = faceRight;
     return;
    }
   }
   if (A && A.kind === 'split' && !A.k286) return drawSplit(p, A, kit, faceRight);
   if (A && A.kind === 'roll') return drawRoll(p, A, kit, faceRight);
  } catch (e) {
   ST.err++;
   if (ST.err < 4) console.warn('v442anim', e);
  }
  return dd0.apply(this, arguments);
 };
 const V20 = window.V20;
 if (V20 && typeof V20.drawWorld === 'function') {
  const dw0 = V20.drawWorld;
  V20.drawWorld = function() {
   if (off() || typeof game === 'undefined' || !game || !game.players) return dw0.apply(this, arguments);
   const hid = [];
   try {
    for (const p of game.players) if (p && p.shot20 && p.shot20.type && shotOf(p)) {
     hid.push([ p.shot20, p.shot20.type ]);
     p.shot20.type = null;
    }
   } catch (e) {}
   try {
    return dw0.apply(this, arguments);
   } finally {
    for (const [S, t] of hid) S.type = t;
   }
  };
 }
 /* v4045: a carrier mid split/roll (or carrying a hand-drawn stick) has his ball drawn INSIDE the pocket of the stick head v442anim drew for him
    (pocket head = 6x8 at Hy-5..Hy+2; the ball sits low in the mesh, centre (Hx, Hy), like the game's own carry) */
 const bn0 = window.drawBallNow;
 if (typeof bn0 === 'function') window.drawBallNow = function() {
  try {
   const G = typeof game !== 'undefined' ? game : null, b = G && G.ball, c = b && b.state === 'held' && typeof screen !== 'undefined' && screen === 'live' ? G.carrier : null, A = c && c.dodgeA;
   const dodge = A && (A.kind === 'roll' || A.kind === 'split' && !A.k286);
   if (!off() && c && (dodge || !A) && typeof ballDot === 'function') {
    let H = c._442h;
    if (H && (H.A || null) !== (A || null)) H = null;
    /* plain carry: only a hand-stick head drawn this frame or the one before */
    if (H && !A && !(H.hs && T() - H.t >= 0 && T() - H.t < .05)) H = null;
    if (!H && A && A.kind === 'roll') {
     const R = rollPose(c, A, A._442f != null ? A._442f : c._fright !== false);
     H = { dx: R.s * R.hr[0], dy: R.hr[1], tall: true };
    }
    if (H) {
     const S = typeof HAS12 !== 'undefined' && HAS12 && typeof PSC !== 'undefined' ? PSC : 1, cx0 = Math.round(c.x), cy0 = Math.round(c.y);
     ballDot(Math.round(cx0 + (H.dx + (H.tall ? 0 : .5)) * S) - 1, Math.round(cy0 + (H.dy - (H.tall ? 0 : 1.5)) * S) - 1);
     ST.ball = (ST.ball || 0) + 1;
     return;
    }
   }
  } catch (e) {
   ST.err++;
  }
  return bn0.apply(this, arguments);
 };
 ST.windOf = windOf;
 ST.shotOf = shotOf;
 ST.on = true;
})();
