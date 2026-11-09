(function() {
 if (typeof RL12 === 'undefined' || !RL12.FR || !RL12.draw || !RL12.palette) return;
 const FR = RL12.FR, off = () => !!window.__rl_no4xxnum;
 const F5 = {
  0: [ '111', '101', '101', '101', '111' ],
  1: [ '010', '110', '010', '010', '111' ],
  2: [ '111', '001', '111', '100', '111' ],
  3: [ '111', '001', '011', '001', '111' ],
  4: [ '101', '101', '111', '001', '001' ],
  5: [ '111', '100', '111', '001', '111' ],
  6: [ '111', '100', '111', '101', '111' ],
  7: [ '111', '001', '010', '010', '010' ],
  8: [ '111', '101', '111', '101', '111' ],
  9: [ '111', '101', '111', '001', '111' ]
 };
 const F4 = {
  0: [ '111', '101', '101', '111' ],
  1: [ '110', '010', '010', '111' ],
  2: [ '111', '001', '110', '111' ],
  3: [ '111', '011', '001', '111' ],
  4: [ '101', '111', '001', '001' ],
  5: [ '111', '110', '001', '111' ],
  6: [ '100', '111', '101', '111' ],
  7: [ '111', '001', '010', '010' ],
  8: [ '111', '111', '101', '111' ],
  9: [ '111', '101', '111', '001' ]
 };
 const rgb = h => {
  h = String(h || '#000').replace('#', '');
  if (h.length === 3) h = h.replace(/./g, '$&$&');
  const n = parseInt(h.slice(0, 6), 16) || 0;
  return [ n >> 16 & 255, n >> 8 & 255, n & 255 ];
 };
 const lum = h => {
  const c = rgb(h).map(v => {
   v /= 255;
   return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
  });
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
 };
 const con = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
 };
 const NCOL = new Map;
 function numColor(kit) {
  const k = kit.jersey + '|' + kit.trim;
  if (NCOL.has(k)) return NCOL.get(k);
  const J = kit.jersey, dark = lum(J) < .18;
  let c;
  if (kit.trim && con(kit.trim, J) >= 3.2) c = kit.trim; else if (dark) c = con('#ffffff', J) >= con('#f2c230', J) ? '#ffffff' : '#f2c230'; else c = con('#141418', J) >= 3.2 ? '#141418' : '#ffffff';
  NCOL.set(k, c);
  return c;
 }
 const isFB = n => /^d8N_/.test(n);
 const isD8 = n => n.startsWith('d8');
 const armOK = n => !/^(prop_|bench_|coach_|g_|down|fall|lobby|fo39)/.test(n) && !/down|fall/.test(n);
 const ARMS = new Map;
 function armRows(name) {
  if (ARMS.has(name)) return ARMS.get(name);
  const f = FR[name], src = f && f[3];
  let out = null;
  try {
   out = src && armOK(name) ? buildArms(src, isD8(name)) : null;
  } catch (e) {
   out = null;
  }
  ARMS.set(name, out);
  return out;
 }
 function buildArms(src, d8) {
  const h = src.length, w = src[0].length, R = src.map(r => r.split(''));
  const at = (q, r) => r >= 0 && r < h && q >= 0 && q < w ? R[r][q] : '#';
  const set = (q, r, ch) => {
   if (r >= 0 && r < h && q >= 0 && q < w) R[r][q] = ch;
  };
  const soft = ch => ch === '.' || ch === 'o' || ch === 'J' || ch === 'j';
  let sx = 0, sn = 0;
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) if (src[r][q] === 'J' || src[r][q] === 'j') {
   sx += q;
   sn++;
  }
  if (!sn) return null;
  const cx = sx / sn, seen = new Set, made = [];
  for (let r0 = 0; r0 < h; r0++) for (let q0 = 0; q0 < w; q0++) {
   const ch0 = src[r0][q0];
   if (ch0 !== 'G' && ch0 !== 'g' || seen.has(q0 + ',' + r0)) continue;
   const cl = [], st = [ [ q0, r0 ] ];
   seen.add(q0 + ',' + r0);
   while (st.length) {
    const [q, r] = st.pop();
    cl.push([ q, r ]);
    for (const [a, b] of [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ]) {
     const Q = q + a, Rr = r + b, k = Q + ',' + Rr;
     if (!seen.has(k) && (at(Q, Rr) === 'G' || at(Q, Rr) === 'g') && src[Rr][Q]) {
      seen.add(k);
      st.push([ Q, Rr ]);
     }
    }
   }
   const top = Math.min(...cl.map(c => c[1]));
   const tops = cl.filter(c => c[1] === top).map(c => c[0]);
   const mid = cl.reduce((s, c) => s + c[0], 0) / cl.length, dir = mid < cx ? 1 : -1;
   if (d8) {
    const cols = tops.sort((a, b) => dir > 0 ? a - b : b - a).slice(0, 1);
    for (const q of cols) {
     if (soft(at(q, top - 1))) {
      set(q, top - 1, 'S');
      made.push([ q, top - 1 ]);
     }
     if (soft(at(q, top - 2))) {
      set(q, top - 2, 'J');
      made.push([ q, top - 2 ]);
     }
    }
   } else {
    const q1 = dir > 0 ? Math.max(...tops) : Math.min(...tops);
    let q = q1 + dir, n = 0;
    while (n < 5 && Math.abs(q - cx) > 1.2 && soft(at(q, top))) {
     if (n < 3) {
      set(q, top, 'S');
      made.push([ q, top ]);
      if (soft(at(q, top + 1))) {
       set(q, top + 1, 's');
       made.push([ q, top + 1 ]);
      }
     } else {
      const above = at(q, top - 1);
      set(q, top, above === 'J' || above === 'j' ? 'j' : 'J');
      made.push([ q, top ]);
     }
     q += dir;
     n++;
    }
   }
  }
  if (!made.length) return null;
  for (const [q, r] of made) for (const [a, b] of [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ]) if (at(q + a, r + b) === '.') set(q + a, r + b, 'o');
  return R.map(r => r.join(''));
 }
 const NPOS = new Map;
 function numPos(name) {
  if (NPOS.has(name)) return NPOS.get(name);
  let p = null;
  try {
   const rows = FR[name][3], h = rows.length, w = rows[0].length;
   const run = r => {
    let best = null, s = -1;
    for (let q = 0; q <= w; q++) {
     const ch = q < w ? rows[r][q] : '.';
     if (ch === 'J' || ch === 'j') {
      if (s < 0) s = q;
     } else if (s >= 0) {
      if (!best || q - s > best[1] - best[0]) best = [ s, q ];
      s = -1;
     }
    }
    return best;
   };
   let r0 = -1;
   for (let r = 0; r < h; r++) {
    const b = run(r);
    if (b && b[1] - b[0] >= 9) {
     r0 = r;
     break;
    }
   }
   if (r0 >= 0) {
    let n = 0;
    while (r0 + n < h && n < 5) {
     const b = run(r0 + n);
     if (!b || b[1] - b[0] < 7) break;
     n++;
    }
    let belt = -1;
    for (let r = r0; r < r0 + n; r++) {
     const b = run(r);
     let j = 0;
     for (let q = b[0]; q < b[1]; q++) if (rows[r][q] === 'j') j++;
     if (j >= 5) {
      belt = r;
      break;
     }
    }
    if (belt >= 0) n = Math.min(n, belt - r0 + 1);
    const b = run(r0 + 1) || run(r0);
    if (n >= 4) p = {
     r: r0,
     fh: n >= 5 ? 5 : 4,
     cx: (b[0] + b[1] - 1) / 2
    };
   }
  } catch (e) {
   p = null;
  }
  NPOS.set(name, p);
  return p;
 }
 let cur = null;
 const numOf = p => {
  try {
   const pl = p && p.pl;
   if (!pl) return null;
   let n = pl.num != null ? pl.num : pl.number != null ? pl.number : typeof gameNum15 === 'function' ? gameNum15(pl) : typeof jerseyNo === 'function' ? jerseyNo(pl) : null;
   n = String(n == null ? '' : n).replace(/\D/g, '');
   return n ? n.slice(-2) : null;
  } catch (e) {
   return null;
  }
 };
 const CACHE = new Map;
 function bake4(name, kit, flip, skin, num) {
  skin = Math.max(0, Math.min(RL12.SKIN.length - 1, skin | 0));
  const key = name + '|' + kit.jersey + kit.trim + kit.helm + (flip ? 'L' : 'R') + skin + RL12.uniKey(kit) + '|' + (num || '');
  let c = CACHE.get(key);
  if (c) return c;
  if (CACHE.size > 3e3) CACHE.clear();
  const rows = armRows(name) || FR[name][3], h = rows.length, w = rows[0].length, pal = RL12.palette(kit, skin), uk = RL12.uniKey(kit), um = uk ? RL12.uniMask(rows, name + (rows === FR[name][3] ? '' : '#a441')) : null;
  c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   const ch = rows[r][q];
   if (ch === '.') continue;
   x.fillStyle = um && RL12.uniColor(kit, um, q, r, ch) || pal[ch];
   x.fillRect(flip ? w - 1 - q : q, r, 1, 1);
  }
  const np = num && isFB(name) ? numPos(name) : null;
  if (np) {
   const F = np.fh === 5 ? F5 : F4, ds = num.split(''), tw = ds.length * 4 - 1;
   const cxs = flip ? w - 1 - np.cx : np.cx;
   let x0 = Math.round(cxs - (tw - 1) / 2);
   const nc = numColor(kit);
   if (np.r > 0 && lum(nc) < .2) {
    x.fillStyle = kit.jersey;
    for (let q = 0; q < tw; q++) {
     const sq = x0 + q, oq = flip ? w - 1 - sq : sq;
     if (rows[np.r - 1][oq] === 'o' && rows[np.r - 2] && rows[np.r - 2][oq] !== '.') x.fillRect(sq, np.r - 1, 1, 1);
    }
   }
   x.fillStyle = nc;
   ds.forEach((d, i) => {
    const g = F[d];
    for (let r = 0; r < np.fh; r++) for (let q = 0; q < 3; q++) if (g[r][q] === '1') x.fillRect(x0 + i * 4 + q, np.r + r, 1, 1);
   });
  }
  CACHE.set(key, c);
  return c;
 }
 const draw0 = RL12.draw;
 RL12.draw = function(g, name, x, y, kit, faceRight, opts) {
  const f = FR[name];
  if (off() || !f || !kit || kit.g27 || name.startsWith('prop_')) return draw0.apply(this, arguments);
  const num = cur ? cur.num : null;
  const useNum = !!(num && isFB(name) && numPos(name));
  if (!useNum && !armRows(name)) return draw0.apply(this, arguments);
  try {
   x = Math.round(x);
   y = Math.round(y);
   const o = opts || {};
   if (o.shadow !== false) {
    g.fillStyle = 'rgba(0,0,0,.25)';
    g.fillRect(x - 4, y, 9, 2);
   }
   const c = bake4(name, kit, !faceRight, o.skin, useNum ? num : null), ax = faceRight ? f[0] : c.width - 1 - f[0];
   if (o.alpha != null) {
    const a = g.globalAlpha;
    g.globalAlpha = o.alpha;
    g.drawImage(c, x - ax, y - f[1]);
    g.globalAlpha = a;
   } else g.drawImage(c, x - ax, y - f[1]);
  } catch (e) {
   return draw0.apply(this, arguments);
  }
 };
 const dp0 = window.drawPlayer12;
 if (typeof dp0 === 'function') window.drawPlayer12 = function(p) {
  const prev = cur;
  cur = !off() && p ? {
   num: numOf(p)
  } : null;
  try {
   return dp0.apply(this, arguments);
  } finally {
   cur = prev;
  }
 };
 window.__rl4xx = {
  numColor: numColor,
  numPos: numPos,
  armRows: armRows,
  setCur: v => {
   cur = v;
  },
  cacheSize: () => CACHE.size
 };
})();
