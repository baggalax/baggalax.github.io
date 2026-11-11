(function() {
 'use strict';
 const OFF = () => !!(window.__rl_no361gear || window.__rl_v124gb);
 const gearOn = () => !OFF();
 const artOn = () => !OFF() && !window.__rl_no361art;
 const legOn = () => !OFF() && !window.__rl_no361leg;
 const LOG = {
  hero: 0,
  leg: 0,
  art: 0,
  err: []
 };
 const V = window.V361 = {
  gearOn: gearOn,
  artOn: artOn,
  legOn: legOn,
  LOG: LOG
 };
 const SL = [ 'helmet', 'visor', 'collar', 'chest', 'legs', 'cleats', 'stick', 'tape' ];
 const BY = () => window.V17 && V17.BY || {};
 function cleanG(e) {
  if (!e || typeof e !== 'object') return null;
  const B = BY(), o = {};
  for (const k of SL) {
   const it = B[e[k]];
   if (it && it.slot === k) o[k] = e[k];
  }
  return Object.keys(o).length ? o : null;
 }
 function cardItems(pid) {
  if (!pid || !window.V28 || typeof V28.cardGear !== 'function') return null;
  try {
   return cleanG(V28.cardGear(pid));
  } catch (e) {
   return null;
  }
 }
 V.cardItems = cardItems;
 function legOwns(pid) {
  if (!legOn() || !pid) return false;
  try {
   const p = typeof PP === 'function' ? PP(pid) : null;
   if (!p || !p.leg || !window.V20 || !V20.ownedLeg || !window.V22 || !V22.on()) return false;
   return V20.ownedLeg().includes(pid);
  } catch (e) {
   return false;
  }
 }
 V.legOwns = legOwns;
 function legMerge(base, add) {
  if (!add) return base;
  const B = BY(), o = Object.assign({}, base || {});
  let n = 0;
  for (const k of SL) if (add[k] && B[add[k]]) {
   o[k] = add[k];
   n++;
   if (k === 'helmet' && add[k] !== 'helm_leather') delete o.leather20;
   if (k === 'stick') delete o.wood20;
  }
  return n ? o : base;
 }
 V.legMerge = legMerge;
 function legGame(pl, base) {
  if (!legOn() || !pl || !pl.leg || typeof game === 'undefined' || !game || !game.g17) return base;
  try {
   const g = game.g17, e = g.gear && g.gear[pl.id];
   if (!e) return base;
   const sd = g.side ? g.side[pl.id] : null, L = sd != null && g.L ? g.L[sd] : null;
   if (!L || L.who === 'cpu') return base;
   const m = legMerge(base, e);
   if (m !== base) LOG.leg++;
   return m;
  } catch (e) {
   return base;
  }
 }
 V.legGame = legGame;
 V.legWood = pl => {
  if (!legOn() || !pl || !pl.leg || !window.V17 || !V17.gearOfP) return true;
  try {
   const gr = V17.gearOfP(pl);
   return !(gr && gr.stick && !gr.wood20);
  } catch (e) {
   return true;
  }
 };
 function legPid(it) {
  return it && it.leg20 && legOwns(it.leg20) ? it.leg20 : null;
 }
 V.legLine = it => {
  const pid = legPid(it);
  return pid && window.V28 && V28.popLine ? V28.popLine(pid) : '';
 };
 V.legBtn = it => {
  const pid = legPid(it);
  return pid && window.V28 && V28.popBtn ? V28.popBtn(pid) : '';
 };
 function mineOf() {
  try {
   if (screen === 'matchup' && typeof menuSel !== 'undefined') return menuSel.team || null;
   if (screen === 'onLobby') {
    const N = window.RLNET, st = N && N.lobby && N.lobby.state;
    if (st && !st.season) return N.side === 'h' ? st.hteam : st.gteam;
   }
  } catch (e) {}
  return null;
 }
 function onMine(pid, t) {
  if (!t) return false;
  try {
   const T2 = typeof SZ_REG !== 'undefined' ? SZ_REG[t] : null;
   if (T2 && !T2.arch2314) return Array.isArray(T2.roster) && T2.roster.includes(pid);
   const r = typeof teamRosterIds === 'function' ? teamRosterIds(t, 'real') : null;
   return Array.isArray(r) && r.includes(pid);
  } catch (e) {
   return false;
  }
 }
 if (window.V17 && V17.bakeHero && V17.bakeGear) {
  const bh0 = V17.bakeHero;
  V17.bakeHero = function(name, kit, skin, gray, flip) {
   if (OFF() || gray) return bh0.apply(this, arguments);
   try {
    const pid = window.__v17hp, pl = pid && typeof PP === 'function' ? PP(pid) : null;
    if (!pl) return bh0.apply(this, arguments);
    if (pl.leg) {
     if (!legOn()) return bh0.apply(this, arguments);
     const c = cardItems(pid);
     if (!c) return bh0.apply(this, arguments);
     const F = window.FLIP2403, base = F && F.LEG && F.on && F.on() ? F.LEG[pid] : null;
     LOG.hero++;
     return V17.bakeGear(name, kit, !!flip, skin, legMerge(base ? Object.assign({}, base) : {}, c), false, {
      nopad: true
     });
    }
    if (pl.gho16 || !window.R2404 || typeof R2404.szGear !== 'function' || !R2404.on || !R2404.on()) return bh0.apply(this, arguments);
    const gr = R2404.szGear(pid);
    if (gr === undefined) return bh0.apply(this, arguments);
    const t = mineOf();
    if (!onMine(pid, t)) return bh0.apply(this, arguments);
    const c = cardItems(pid);
    if (!c) return bh0.apply(this, arguments);
    LOG.hero++;
    return V17.bakeGear(name, kit, !!flip, skin, Object.assign({}, gr || {}, c), false, {
     nopad: true
    });
   } catch (e) {
    LOG.err.push(String(e));
    return bh0.apply(this, arguments);
   }
  };
 }
 const SUIT = {
  tew: {
   J: '#17171a',
   j: '#0b0b0d',
   P: '#17171a',
   p: '#0b0b0d',
   T: '#ffcc33',
   t: '#b88a12'
  },
  aa: {
   J: '#1c2a4c',
   j: '#111b33',
   P: '#1c2a4c',
   p: '#111b33',
   T: '#d4202c',
   t: '#9c121c'
  }
 };
 const SHIRT = '#f4f4f4', SHOE = '#1a1a1a';
 const artCache = new Map;
 function suitRows(rows, kind) {
  const R = rows.map(r => r.split('')), h = R.length, w = R[0].length;
  let belt = -1;
  for (let r = 0; r < h; r++) {
   let j = 0, J = 0;
   for (const ch of R[r]) {
    if (ch === 'j') j++; else if (ch === 'J') J++;
   }
   if (j >= 5 && J <= 1) {
    belt = r;
    break;
   }
  }
  let neck = -1;
  for (let r = 0; r < h; r++) if (R[r].includes('J')) {
   neck = r;
   break;
  }
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   const ch = R[r][q];
   if (belt >= 0 && r > belt) {
    if (ch === 'J') R[r][q] = 'P'; else if (ch === 'j') R[r][q] = 'p'; else if (ch === 'S' || ch === 'W' || ch === 'v' || ch === 'Z' || ch === 's') R[r][q] = 'P'; else if (ch === 'K') R[r][q] = 'k';
   }
  }
  if (neck >= 0) {
   const row = R[neck];
   let lo = -1, hi = -1;
   for (let q = 0; q < w; q++) if (row[q] === 'o' && q > 0 && row[q - 1] === 'J' && lo < 0) lo = q;
   for (let q = w - 1; q >= 0; q--) if (row[q] === 'o' && q < w - 1 && row[q + 1] === 'J' && hi < 0) hi = q;
   const c = lo >= 0 && hi > lo ? Math.round((lo + hi) / 2) : 6;
   if (kind === 'tew') {
    R[neck][c - 1] = 'T';
    R[neck][c] = 't';
    R[neck][c + 1] = 'T';
    if (R[neck][c - 2] === 'o') R[neck][c - 2] = 'W';
    if (R[neck][c + 2] === 'o') R[neck][c + 2] = 'W';
    if (R[neck + 1] && 'Jj'.includes(R[neck + 1][c])) R[neck + 1][c] = 'W';
   } else {
    R[neck][c - 1] = 'W';
    R[neck][c] = 'T';
    R[neck][c + 1] = 'W';
    for (let dr = 1; dr <= 2; dr++) {
     const rr = R[neck + dr];
     if (rr && 'Jj'.includes(rr[c])) rr[c] = dr === 2 ? 't' : 'T';
    }
   }
  }
  return R;
 }
 V.suitRows = suitRows;
 function deco(x, k) {
  if (k === 'aa') {
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
 function suitArt(pid, tid, sil) {
  const k = HON25.kindOf(pid);
  if (k !== 'tew' && k !== 'aa') return null;
  const key = pid + '|' + (tid || '') + (sil ? '|s' : '');
  if (artCache.has(key)) return artCache.get(key);
  const p = PP(pid) || (HON25.make ? HON25.make(pid) : null);
  if (!p || typeof RL12 === 'undefined' || !RL12.FR.bench_idle0) return null;
  const f = RL12.FR.bench_idle0, kit = (window.V22 && V22.kitOf ? V22.kitOf(pid, tid) : null) || {
   jersey: '#444444',
   trim: '#ffffff',
   helm: '#444444'
  };
  const skin = Math.max(0, Math.min(RL12.SKIN.length - 1, (typeof skinOf === 'function' ? skinOf(p) : 0) | 0));
  const pal = Object.assign({}, RL12.palette(kit, skin), SUIT[k], {
   W: SHIRT,
   k: SHOE
  });
  const R = suitRows(f[3], k), h = R.length, w = R[0].length;
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  deco(x, k);
  const ax = Math.round(16 - w / 2 + f[0]), ay = 30, ox = ax - f[0], oy = ay - f[1];
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   const ch = R[r][q];
   if (ch === '.') continue;
   const col = pal[ch];
   if (!col) continue;
   x.fillStyle = col;
   x.fillRect(ox + q, oy + r, 1, 1);
  }
  if (sil) {
   x.globalCompositeOperation = 'source-in';
   x.fillStyle = '#05080b';
   x.fillRect(0, 0, 32, 32);
   x.globalCompositeOperation = 'source-over';
  }
  LOG.art++;
  artCache.set(key, c);
  return c;
 }
 V.suitArt = suitArt;
 if (window.HON25 && typeof HON25.art === 'function') {
  const art0 = HON25.art;
  HON25.art = function(pid, tid, sil) {
   if (!artOn() || !HON25.on || !HON25.on() || !HON25.kindOf || !HON25.kindOf(pid)) return art0.apply(this, arguments);
   try {
    const c = suitArt(pid, tid, sil);
    if (c) return c;
   } catch (e) {
    LOG.err.push(String(e));
   }
   return art0.apply(this, arguments);
  };
 }
 const TEAL = {
  gap: '#c9fbf3',
  bg: 'radial-gradient(circle at 24% 16%,rgba(255,255,255,.95) 0,rgba(255,255,255,0) 4px),radial-gradient(circle at 80% 58%,rgba(255,255,255,.8) 0,rgba(255,255,255,0) 3px),' + 'linear-gradient(118deg,rgba(255,255,255,0) 0 30%,rgba(255,255,255,.22) 30% 44%,rgba(255,255,255,0) 44%),' + 'linear-gradient(160deg,#b8fff4 0%,#6fe3d6 16%,#3cc8be 16%,#8af0e4 34%,#1ea5a3 34%,#55d6cc 52%,#14868c 52%,#3bbdb6 70%,#a6f7ec 70%,#2aa9a8 86%,#0f7178 100%)',
  art: 'radial-gradient(circle at 50% 40%,#e6fffb,#58d8cd 55%,#0d5f66)'
 };
 V.TEAL = TEAL;
 if (artOn() && window.V35 && V35.PLAT && typeof V35.PLAT === 'object') try {
  const P = V35.PLAT, old = {
   bg: P.bg,
   art: P.art,
   gap: P.gap
  };
  P.bg = TEAL.bg;
  P.art = TEAL.art;
  P.gap = TEAL.gap;
  const st = document.getElementById('art35css');
  if (st && st.textContent) st.textContent = st.textContent.split(old.bg).join(P.bg).split(old.art).join(P.art).split(old.gap).join(P.gap);
  V.PLAT0 = old;
 } catch (e) {
  LOG.err.push(String(e));
 }
})();
