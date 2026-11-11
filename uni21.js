(function() {
 const STY = [ 'BASIC', 'WHITE', 'ALL MAIN', 'ALL ALT', 'ALT JERSEY', 'MAIN JERSEY', 'ALT SHORTS', 'HALLOWEEN', 'ALTERNATE' ];
 const NOTE = [ 'TEAM COLOR JERSEY + SHORTS', 'WHITE JERSEY + SHORTS, TEAM HELMET', 'MAIN COLOR HEAD TO TOE, ALT TRIM', 'ALT COLOR HEAD TO TOE, MAIN TRIM', 'ALT JERSEY, MAIN HELMET + SHORTS', 'MAIN JERSEY, ALT HELMET + SHORTS', 'MAIN HELMET + JERSEY, ALT SHORTS', 'TEAM COLORS WITH ORANGE, BLACK + PURPLE HALLOWEEN TRIM (HALLOWEEN PACK)' ];
 const HW7 = [ 'WAT', 'ARC' ];
 const on16 = () => on() && !window.__rl_no2316b;
 const hw7 = tid => on16() && HW7.includes(base(tid));
 const u332 = !window.__rl_v124gb && !window.__rl_no332uni;
 const ALT8 = {
  CUNC: {
   name: u332 ? 'SKY CHROME' : 'CHROME DOME',
   kit: {
    jersey: '#7BAFD4',
    trim: '#13294B',
    helm: '#d4d9df',
    shorts: '#7BAFD4',
    acc: '#f4f6f8'
   },
   note: u332 ? 'SKY BLUE UNIFORM + CHROME SILVER HELMET' : 'CAROLINA BLUE UNIFORM + CHROME SILVER HELMET'
  },
  CND: {
   name: u332 ? 'GOLD CROWN' : 'GOLD DOME',
   kit: {
    jersey: '#0c7a3e',
    trim: '#C99700',
    helm: '#d4a017',
    shorts: '#0c7a3e',
    acc: '#C99700'
   },
   note: 'GREEN UNIFORM + GOLD HELMET'
  }
 };
 if (!window.__rl_no284ndgreen) {
  ALT8.CND.kit.jersey = '#1fc45a';
  ALT8.CND.kit.shorts = '#1fc45a';
 }
 const alt8 = tid => !window.__rl_no2504 && !window.__rl_v124gb && on() && ALT8[base(tid)] || null;
 const g27 = () => !window.__rl_no27ghostuni && !window.__rl_no27 && !window.__rl_v124gb;
 const G27N = {
  2: 'WHITE GHOST',
  3: 'SKELETON'
 };
 const styN = (tid, k) => X489(tid) ? X489(tid).styN(tid, k) : TT(tid).gho16 && g27() && G27N[k | 0] ? G27N[k | 0] : (k | 0) === 8 && alt8(tid) ? alt8(tid).name : STY[k] || STY[0];
 const adv = (tid, k, d, N) => {
  let n = 0;
  do {
   k = ((k + d) % N + N) % N;
  } while (!okK(tid, k) && n++ < N);
  return k;
 };
 const X489 = tid => { try { const x = !window.__rl_no489vets && window.UNI21X; return x && x.own(tid) ? x : null; } catch (e) { return null; } };
 const nK = tid => X489(tid) ? X489(tid).nK(tid) : TT(tid).gho16 ? g27() ? 4 : 2 : alt8(tid) ? 9 : nK0(tid);
 const nK0 = tid => hw7(tid) && (has(tid, 7) || window.V17 && V17.hw16 && V17.hw16.on()) ? 8 : 7;
 const okK = (tid, k) => k != null && k >= 0 && (X489(tid) ? k < X489(tid).nK(tid) : TT(tid).gho16 ? k <= (g27() ? 3 : 1) : k <= 6 || k === 7 && hw7(tid) || k === 8 && !!alt8(tid));
 const WHITE = '#f4f4f4';
 const on = () => !window.__rl_no21 && !window.__rl_v124gb;
 const reg = () => typeof SZ_REG !== 'undefined' ? SZ_REG : {};
 const base = tid => {
  const s = tid && reg()[tid];
  return s && s.szBase || tid;
 };
 const TT = tid => {
  const s = tid && reg()[tid];
  if (s && (s.ct33 || s.ct331) && !window.__rl_no331uni && !window.__rl_v124gb) {
   const b = T(s.szBase);
   if (b && b.id === s.szBase) return b;
  }
  return T(tid);
 };
 const itemId = (tid, k) => 'uni21|' + base(tid) + '|' + k;
 function kitOf(tid, k) {
  if (X489(tid)) { const xk = X489(tid).kitOf(tid, k); if (xk) return xk; }
  const t = TT(tid), c1 = t.c1, c2 = t.c2;
  if (t.gho16 && g27() && (k | 0) === 2) return {
   jersey: '#f7f7f8',
   trim: '#dfe4ea',
   helm: '#fbfbfc',
   shorts: '#f7f7f8',
   acc: '#7dff9a',
   g27: 'white'
  };
  if (t.gho16 && g27() && (k | 0) === 3) return {
   jersey: '#0b0b0d',
   trim: '#f2efe6',
   helm: '#1b1b1f',
   shorts: '#0b0b0d',
   acc: '#39ff14',
   g27: 'skel'
  };
  if (t.gho16) return (k | 0) === 1 ? {
   jersey: '#f4f4f4',
   trim: '#141418',
   helm: '#141418',
   shorts: '#f4f4f4',
   acc: '#5ad87a'
  } : {
   jersey: '#141418',
   trim: '#f4f4f4',
   helm: '#141418',
   shorts: '#141418',
   acc: '#7dff9a'
  };
  switch (k | 0) {
  case 1:
   return {
    jersey: WHITE,
    trim: accent(t),
    helm: c1,
    shorts: WHITE
   };

  case 2:
   return {
    jersey: c1,
    trim: c2,
    helm: c1,
    shorts: c1,
    acc: c2
   };

  case 3:
   return {
    jersey: c2,
    trim: c1,
    helm: c2,
    shorts: c2,
    acc: c1
   };

  case 4:
   return {
    jersey: c2,
    trim: c1,
    helm: c1,
    shorts: c1
   };

  case 5:
   return {
    jersey: c1,
    trim: c2,
    helm: c2,
    shorts: c2
   };

  case 6:
   return {
    jersey: c1,
    trim: c2,
    helm: c1,
    shorts: c2
   };

  case 7:
   return base(tid) === 'WAT' ? {
    jersey: c1,
    trim: '#ff7a1a',
    helm: '#141018',
    shorts: '#141018',
    acc: '#ff7a1a'
   } : {
    jersey: '#141018',
    trim: c1,
    helm: c1,
    shorts: c2,
    acc: '#8a3ad8'
   };

  case 8:
   {
    const a = alt8(tid);
    if (a) return Object.assign({}, a.kit);
    return {
     jersey: c1,
     trim: c2,
     helm: c1
    };
   }

  default:
   return {
    jersey: c1,
    trim: c2,
    helm: c1
   };
  }
 }
 function has(tid, k) {
  if ((k | 0) < 2) return true;
  const S = window.V17 && V17.ST && V17.ST();
  return !!(S && S.inv && S.inv[itemId(tid, k)] > 0);
 }
 const saved = () => (typeof LS !== 'undefined' ? LS.get('uni21', {}) : {}) || {};
 function savedK(tid) {
  const k = saved()[base(tid)];
  return k != null && has(tid, k) ? k | 0 : 0;
 }
 function save(tid, k) {
  const s = saved();
  s[base(tid)] = k | 0;
  LS.set('uni21', s);
 }
 function rgb(h) {
  const n = parseInt(String(h).replace('#', '').slice(0, 6), 16);
  return [ n >> 16 & 255, n >> 8 & 255, n & 255 ];
 }
 function cdist(a, b) {
  const p = rgb(a), q = rgb(b);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
 }
 function aiK(tid, vsKit, home) {
  if (home) return 0;
  return cdist(kitOf(tid, 0).jersey, vsKit.jersey) >= cdist(WHITE, vsKit.jersey) ? 0 : 1;
 }
 const alike = (a, b) => cdist(a.jersey, b.jersey) < 70;
 const U = {
  sel: {},
  pend: null
 };
 function selFor(key, tids, defs) {
  let s = U.sel[key];
  if (!s || s.t0 !== tids[0] || s.t1 !== tids[1]) s = U.sel[key] = {
   t0: tids[0],
   t1: tids[1],
   k: defs.slice(),
   v: defs.slice()
  };
  return s;
 }
 function matchSel() {
  const u = menuSel.team, o = menuSel.opp, home = !!menuSel.home, ku = savedK(u);
  const s = selFor('matchup', [ u, o ], [ ku, aiK(o, kitOf(u, ku), !home) ]);
  U.pend = {
   u: u,
   o: o,
   k: s.k.slice()
  };
  return s;
 }
 function gameKits(user, opp, userHome, mode, meta) {
  let ku, ko;
  if (meta && meta.uni21) {
   ku = meta.uni21[0];
   ko = meta.uni21[1];
  } else if (U.pend && U.pend.u === user && U.pend.o === opp && mode === 'quick') {
   ku = U.pend.k[0];
   ko = U.pend.k[1];
  }
  if (!okK(user, ku)) ku = savedK(user);
  const uk = kitOf(user, ku);
  if (!okK(opp, ko)) ko = aiK(opp, uk, !userHome);
  U.pend = null;
  const a = kitOf(user, ku), b = kitOf(opp, ko);
  a.k21 = ku | 0;
  b.k21 = ko | 0;
  return [ a, b ];
 }
 function heroKit(i, tid) {
  if (!tid) return lobbyKit(tid);
  if (screen === 'pregame' && game && game.uk) {
   const kk = i ? game.ok : game.uk;
   if (kk) return kk;
  }
  if (screen === 'matchup' && menuSel.opp) {
   const s = matchSel();
   return kitOf(tid, s.v[i]);
  }
  if (screen === 'onLobby' && window.RLNET && RLNET.lobby) {
   const st = RLNET.lobby.state || {}, host = RLNET.side === 'h';
   const k = i === 0 ? onK(tid) : host ? st.gu21 : st.hu21;
   return kitOf(tid, k == null ? 0 : k);
  }
  return kitOf(tid, savedK(tid));
 }
 function onK(tid) {
  const R = window.RLNET || {}, st = R.lobby && R.lobby.state || {}, host = R.side === 'h', k = host ? st.hu21 : st.gu21;
  return k != null && has(tid, k) ? k : savedK(tid);
 }
 function canEdit(i) {
  if (screen === 'matchup') return true;
  if (screen === 'pregame') return !!game && !game.online && !game.tutorial && !(game.coin && game.coin.phase !== 'done');
  if (screen === 'onLobby' || screen === 'menu') return i === 0;
  return false;
 }
 function viewK(i, tid) {
  if (screen === 'matchup') return matchSel().v[i];
  if (screen === 'pregame') {
   const kk = i ? game.ok : game.uk;
   return kk && kk.k21 != null ? kk.k21 : 0;
  }
  if (screen === 'onLobby') return onK(tid);
  return savedK(tid);
 }
 function step(i, tid, d) {
  const k0 = viewK(i, tid), N = nK(tid);
  let k = adv(tid, k0, d, N);
  if (screen === 'matchup') {
   const s = matchSel();
   s.v[i] = k;
   if (has(tid, k)) s.k[i] = k;
   U.pend = {
    u: menuSel.team,
    o: menuSel.opp,
    k: s.k.slice()
   };
   if (i === 0 && has(tid, k)) save(tid, k);
  } else if (screen === 'pregame') {
   let n = 0;
   while (!has(tid, k) && n++ < N) k = adv(tid, k, d, N);
   const kit = kitOf(tid, k);
   kit.k21 = k;
   if (i) game.ok = kit; else {
    game.uk = kit;
    save(tid, k);
   }
  } else if (screen === 'onLobby') {
   let n = 0;
   while (!has(tid, k) && n++ < N) k = adv(tid, k, d, N);
   const R = window.RLNET || {}, host = R.side === 'h', key = host ? 'hu21' : 'gu21';
   if (R.lobby && R.lobby.state) R.lobby.state[key] = k;
   save(tid, k);
   try {
    if (typeof R.patchLobby === 'function') R.patchLobby({
     [key]: k
    });
   } catch (e) {}
  } else {
   let n = 0;
   while (!has(tid, k) && n++ < N) k = adv(tid, k, d, N);
   save(tid, k);
  }
  U.at = menuT;
  U.side = i;
 }
 function miniShirt(x, y, kit, sz) {
  const s = sz || 1, J = kit.jersey, S = kit.shorts || kit.jersey;
  rect(x + 1 * s, y, 6 * s, 1 * s, '#000');
  rect(x, y + 1 * s, 8 * s, 2 * s, J);
  rect(x + 2 * s, y + 3 * s, 4 * s, 2 * s, J);
  rect(x + 3 * s, y, 2 * s, 1 * s, kit.acc || kit.trim);
  rect(x + 2 * s, y + 5 * s, 4 * s, 2 * s, S);
 }
 function uniArrow(key, x, y, dir, kit, live, fn) {
  rect(x, y, 18, 15, 'rgba(12,20,28,.82)');
  for (let j = 0; j < 4; j++) {
   const xx = dir > 0 ? x + 12 + j : x + 5 - j;
   rect(xx, y + 7 - (3 - j), 1, (3 - j) * 2 + 1, '#8fe3f0');
  }
  miniShirt(dir > 0 ? x + 2 : x + 8, y + 4, kit);
  if (live) {
   const p = window.__rl_no281uni ? 3 : 0;
   hit(key, x - 3, y - p, 24, 18 + p, fn, key);
  }
 }
 function drawToggle(i, tid, axl, axr, ay, live) {
  if (!on() || !tid) return null;
  const k = viewK(i, tid), kit = kitOf(tid, k), ed = canEdit(i) && live;
  if (canEdit(i)) {
   uniArrow('UNI ' + (i ? 'R' : 'L') + ' PREV', axl, ay, -1, kit, ed, () => step(i, tid, -1));
   uniArrow('UNI ' + (i ? 'R' : 'L') + ' NEXT', axr, ay, 1, kit, ed, () => step(i, tid, 1));
  }
  return {
   txt: styN(tid, k) + (has(tid, k) ? '' : ' - LOCKED'),
   locked: !has(tid, k),
   k: k
  };
 }
 function label(i, tid) {
  const k = viewK(i, tid);
  return styN(tid, k) + (has(tid, k) ? '' : ' (LOCKED)');
 }
 function clash() {
  let a = null, b = null;
  if (screen === 'pregame' && game) {
   a = game.uk;
   b = game.ok;
  } else if (screen === 'matchup' && menuSel.opp) {
   const s = matchSel();
   a = kitOf(menuSel.team, s.k[0]);
   b = kitOf(menuSel.opp, s.k[1]);
  }
  return !!(a && b && alike(a, b));
 }
 const ALL = () => {
  const ts = (typeof TEAMS !== 'undefined' ? TEAMS : []).concat(typeof WTEAMS !== 'undefined' ? WTEAMS : []);
  return ts.map(t => t.id);
 };
 let made = false, list = [];
 function items() {
  if (made || !window.V17) return list;
  made = true;
  for (const tid of ALL()) for (let k = 2; k < 7; k++) {
   const id = itemId(tid, k), t = T(tid);
   const it = {
    id: id,
    n: (t.name + ' ' + STY[k]).toUpperCase(),
    sec: 'uni21',
    rar: 0,
    art: 'uni21',
    uni21: {
     tid: tid,
     k: k
    },
    col: t.c1,
    d: 'A ' + t.name.toUpperCase() + ' UNIFORM: ' + NOTE[k] + '. PICK IT BEFORE A GAME. LOOKS ONLY.'
   };
   V17.BY[id] = it;
   list.push(it);
  }
  for (const tid of HW7) {
   const t = T(tid);
   if (!t) continue;
   const id = itemId(tid, 7);
   V17.BY[id] = {
    id: id,
    n: (t.name + ' HALLOWEEN').toUpperCase(),
    sec: 'uni21',
    rar: 1,
    art: 'uni21',
    uni21: {
     tid: tid,
     k: 7
    },
    col: t.c1,
    s16: 1,
    hw: 1,
    d: 'HALLOWEEN PACK. A ' + t.name.toUpperCase() + ' UNIFORM: ' + NOTE[7].replace(' (HALLOWEEN PACK)', '') + '. PICK IT BEFORE A GAME. LOOKS ONLY.'
   };
  }
  if (g27() && typeof GH_REG !== 'undefined' && GH_REG.GHO) for (const k of [ 2, 3 ]) {
   const id = itemId('GHO', k);
   V17.BY[id] = {
    id: id,
    n: 'NEW ORLEANS GHOSTS ' + G27N[k],
    sec: 'uni21',
    rar: 2,
    art: 'uni21',
    uni21: {
     tid: 'GHO',
     k: k
    },
    col: k === 2 ? '#f7f7f8' : '#0b0b0d',
    s16: 1,
    hw: 1,
    g27: 1,
    d: 'HALLOWEEN PACK. A NEW ORLEANS GHOSTS UNIFORM: ' + (k === 2 ? 'ALL WHITE, EVEN THE SKIN - ONLY THE EYES + THE PAD AND HELMET DETAILS SHOW' : 'BLACKED OUT WITH A WHITE SKELETON ON TOP, PADS + HELMET STILL SHOW') + '. GLOWING GREEN EYES. ONLY THE NEW ORLEANS GHOSTS WEAR IT. LOOKS ONLY.'
   };
  }
  return list;
 }
 try {
  items();
 } catch (e) {}
 window.UNI21 = {
  G27N: G27N,
  g27: g27,
  ALT8: ALT8,
  alt8: alt8,
  styN: styN,
  nK: nK,
  okK: okK,
  on: on,
  STY: STY,
  NOTE: NOTE,
  kitOf: kitOf,
  has: has,
  savedK: savedK,
  save: save,
  aiK: aiK,
  alike: alike,
  gameKits: gameKits,
  heroKit: heroKit,
  drawToggle: drawToggle,
  label: label,
  clash: clash,
  canEdit: canEdit,
  viewK: viewK,
  step: step,
  itemId: itemId,
  base: base,
  items: items,
  U: U,
  matchSel: matchSel,
  miniShirt: miniShirt,
  cdist: cdist
 };
})();
