'use strict';
var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());


const COL25 = (() => {
 const on = () => !window.__rl_no25 && !window.__rl_v124gb;
 const on2502 = () => on() && !window.__rl_no2502;
 try {
  const af = !window.__rl_no286chase && !window.__rl_v124gb && (window.RL_COL25 || []).find(t => t.id === 'CAF'), ch = af && PP('EGG-4');
  if (af && ch && ch.n === 'Chase BH' && !af.players.some(a => a[0] === 'Chase BH')) {
   const used = new Set(af.players.map(a => a[13])), j0 = typeof jerseyNo === 'function' ? jerseyNo(ch) : null;
   let num = j0 != null && !used.has(j0) ? j0 : 12;
   while (used.has(num)) num++;
   af.players.push([ 'Chase BH', ch.pos, ...SKILLS.map(k => ch.r[k]), 0, num, null, 'EGG-4' ]);
  }
 } catch (e) {
  console.error(e);
 }
 const colRm30 = window.__rl_no30colrm || window.__rl_v124gb ? {} : {
  CMER: [ 'Jack McGuire', 'Carl Klepper' ],
  CAF: [ 'Chase BH' ]
 };
 const TEAMS25 = (window.RL_COL25 || []).map(t => {
  const tm = {
   id: t.id,
   abbr: t.abbr,
   name: t.name,
   full: t.full,
   city: '',
   lg: 'COLLEGE',
   era: '2027 COLLEGE',
   c1: t.c1,
   c2: t.c2,
   icon: t.icon,
   coach: t.coach || '',
   coachNote: (t.conf || '') + ' - HEAD COACH',
   off: 4,
   def: 4,
   col25: true,
   nick: t.nick || '',
   conf: t.conf || ''
  };
  const rm30 = colRm30[t.id] || null;
  tm.roster = t.players.map((a, i) => {
   const id = t.id + '-' + i, ref = a[15] ? PP(a[15]) : null;
   const p = {
    id: id,
    n: a[0],
    pos: a[1],
    r: {},
    real: !!a[12],
    team: t.id,
    col25: true,
    wnum: a[13] != null ? a[13] : null
   };
   if (a.n0 != null) p.n0 = a.n0;
   SKILLS.forEach((k, j) => p.r[k] = ref ? ref.r[k] : a[2 + j]);
   if (a[14] === 'S') p.ssdm25 = 1;
   if (ref) p.ref25 = ref.id;
   p.ovr = ovrOf(p);
   PLAYERS[id] = p;
   const v = SKINS[id];
   p.skin = v != null && v >= 0 && v <= 5 ? v | 0 : ref ? ref.skin != null ? ref.skin : defaultSkin(ref) : defaultSkin(p);
   return id;
  });
  if (rm30) tm.roster = tm.roster.filter((id, i) => !rm30.includes(t.players[i].n0 != null ? t.players[i].n0 : t.players[i][0]));
  WT_REG[tm.id] = tm;
  return tm;
 });
 const IDS = TEAMS25.map(t => t.id);
 const isCol = id => !!id && !!WT_REG[id] && !!WT_REG[id].col25;
 {
  const rn0 = window.realNum15;
  if (typeof rn0 === 'function') window.realNum15 = function(p) {
   if (p && p.col25) return p.wnum != null ? p.wnum : null;
   return rn0.apply(this, arguments);
  };
 }
 const KEY = 'col25';
 let S = (() => {
  const s = LS.get(KEY, null);
  return s && typeof s === 'object' ? s : {
   v: 25
  };
 })();
 const save = () => LS.set(KEY, S);
 const st17 = () => window.V17 && V17.ST ? V17.ST() : null;
 const tap = () => {
  try {
   SFX.tap();
  } catch (e) {}
 };
 const toast = (m, c) => {
  try {
   V17.toast(m, c || '#ffe14d');
  } catch (e) {}
 };
 const UNLOCK = 5;
 const unlocked = () => !!S.unl;
 function unlock() {
  if (S.unl) return true;
  const s = st17();
  if (!s || (s.chinos || 0) < UNLOCK) return false;
  V17.addChinos(-UNLOCK, 'COLLEGE LAX UNLOCKED');
  S.unl = 1;
  save();
  return true;
 }
 function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
   s = s + 1831565813 >>> 0;
   let t = s;
   t = Math.imul(t ^ t >>> 15, t | 1);
   t ^= t + Math.imul(t ^ t >>> 7, t | 61);
   return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
 }
 function shuffle(a, r) {
  for (let i = a.length - 1; i > 0; i--) {
   const j = Math.floor(r() * (i + 1));
   [a[i], a[j]] = [ a[j], a[i] ];
  }
  return a;
 }
 const confOf = id => WT_REG[id] && WT_REG[id].conf || '';
 const CONFS = (() => {
  const m = {};
  for (const t of TEAMS25) (m[t.conf] = m[t.conf] || []).push(t.id);
  return m;
 })();
 const NO_AUTO = [ __x("QUND") ];
 const c33 = C => C && Array.isArray(C.ids33) && C.ids33.length ? C : null;
 const idsOf = C => c33(C) ? C.ids33 : IDS;
 const confOfC = (C, id) => c33(C) && C.conf33 && C.conf33[id] || confOf(id) || 'CARD TEAMS';
 function confsOf(C) {
  if (!c33(C)) return CONFS;
  const m = {};
  for (const k of Object.keys(CONFS)) m[k] = [];
  for (const id of C.ids33) {
   const k = confOfC(C, id);
   (m[k] = m[k] || []).push(id);
  }
  for (const k of Object.keys(m)) if (!m[k].length) delete m[k];
  return m;
 }
 const autoOk33 = (C, c) => !NO_AUTO.includes(c) && (!c33(C) || (confsOf(C)[c] || []).length >= 4);
 const WEEKS = 14;
 const ovrC = {};
 const tOvr = id => ovrC[id] != null ? ovrC[id] : ovrC[id] = (() => {
  try {
   return teamOvr(id, 'real');
  } catch (e) {
   return 70;
  }
 })();
 const nm = id => {
  const t = T(id);
  return t ? t.name : id;
 };
 function makeSched(seed, C) {
  const CF = confsOf(C), ALL = idsOf(C);
  const r = rng(seed), weeks = [ ...Array(WEEKS) ].map(() => []), busy = [ ...Array(WEEKS) ].map(() => new Set), met = {};
  const key = (a, b) => a < b ? a + '|' + b : b + '|' + a;
  const gp = {}, add = (w, a, b) => {
   weeks[w].push(r() < .5 ? [ a, b ] : [ b, a ]);
   busy[w].add(a);
   busy[w].add(b);
   met[key(a, b)] = 1;
   gp[a] = (gp[a] || 0) + 1;
   gp[b] = (gp[b] || 0) + 1;
  };
  for (const c in CF) {
   const ids = shuffle(CF[c].slice(), r);
   if (ids.length % 2) ids.push(null);
   const n = ids.length, rounds = Math.min(n - 1, WEEKS), start = WEEKS - rounds;
   for (let rd = 0; rd < rounds; rd++) {
    for (let i = 0; i < n / 2; i++) {
     const a = ids[i], b = ids[n - 1 - i];
     if (a && b) add(start + rd, a, b);
    }
    ids.splice(1, 0, ids.pop());
   }
  }
  for (let w = 0; w < WEEKS; w++) {
   const free = shuffle(ALL.filter(id => !busy[w].has(id)), r).sort((x, y) => (gp[x] || 0) - (gp[y] || 0));
   while (free.length > 1) {
    const a = free.shift();
    let j = free.findIndex(b => confOfC(C, b) !== confOfC(C, a) && !met[key(a, b)]);
    if (j < 0) j = free.findIndex(b => !met[key(a, b)]);
    if (j < 0) continue;
    add(w, a, free.splice(j, 1)[0]);
   }
  }
  return weeks;
 }
 const blank = () => ({
  w: 0,
  l: 0,
  cw: 0,
  cl: 0,
  gf: 0,
  ga: 0
 });
 function newSeason(team) {
  const n = (S.n || 0) + 1, seed = seedOf('col25|' + n + '|' + team + '|' + Date.now());
  const C = {
   v: 25,
   n: n,
   team: team,
   seed: seed,
   sched: null,
   wk: 0,
   res: {},
   table: {},
   stats: {},
   phase: 'reg',
   mine: []
  };
  try {
   if (window.V33 && V33.colSeason) V33.colSeason(C, team);
  } catch (e) {
   console.error(e);
   delete C.ids33;
   delete C.conf33;
  }
  C.sched = makeSched(seed, C);
  for (const id of idsOf(C)) C.table[id] = blank();
  S.cur = C;
  save();
  return C;
 }
 const cur = () => S.cur && S.cur.v === 25 && S.cur.team && (isCol(S.cur.team) || c33(S.cur) && T(S.cur.team).id === S.cur.team && S.cur.ids33.includes(S.cur.team)) ? S.cur : null;
 function apply(C, a, b, sa, sb) {
  const A = C.table[a], B = C.table[b];
  if (!A || !B) return;
  A.gf += sa;
  A.ga += sb;
  B.gf += sb;
  B.ga += sa;
  const conf = confOfC(C, a) === confOfC(C, b);
  if (sa > sb) {
   A.w++;
   B.l++;
   if (conf) {
    A.cw++;
    B.cl++;
   }
  } else {
   B.w++;
   A.l++;
   if (conf) {
    B.cw++;
    A.cl++;
   }
  }
 }
 function sim(a, b) {
  const sc = wgSim16(a, b), f = window.__c25win;
  if (f && (a === f || b === f) && sc[0] > sc[1] !== (a === f)) return [ sc[1], sc[0] ];
  return sc;
 }
 const myIdx = (C, w) => (C.sched[w] || []).findIndex(g => g.includes(C.team));
 function myGame(C) {
  if (C.phase === 'reg') {
   const w = C.wk;
   if (w >= WEEKS) return null;
   const i = myIdx(C, w);
   if (i < 0) return {
    bye: true,
    w: w
   };
   const g = C.sched[w][i];
   return {
    w: w,
    i: i,
    opp: g[0] === C.team ? g[1] : g[0],
    home: g[0] === C.team,
    label: 'WEEK ' + (w + 1) + (confOfC(C, g[0]) === confOfC(C, g[1]) ? ' - ' + confOfC(C, g[0]) : ' - NON-CONFERENCE')
   };
  }
  if (C.phase === __x("bmNhYQ==")) {
   const B = C.br;
   if (!B) return null;
   const R = B.rounds[B.r];
   if (!R) return null;
   const i = R.games.findIndex(g => (g.a === C.team || g.b === C.team) && !g.s);
   if (i < 0) return null;
   const g = R.games[i];
   return {
    r: B.r,
    i: i,
    opp: g.a === C.team ? g.b : g.a,
    home: g.a === C.team,
    label: R.name,
    final: B.r === B.rounds.length - 1 && R.name === 'NATIONAL CHAMPIONSHIP'
   };
  }
  return null;
 }
 function finishWeek(C) {
  const w = C.wk;
  (C.sched[w] || []).forEach((g, i) => {
   const k = w + '|' + i;
   if (!C.res[k]) {
    const sc = sim(g[0], g[1]);
    C.res[k] = sc;
    apply(C, g[0], g[1], sc[0], sc[1]);
   }
  });
  C.wk++;
  if (C.wk >= WEEKS) selectField(C);
 }
 function recordMine(C, sc, played) {
  const nx = myGame(C);
  if (!nx || nx.bye) return;
  if (C.phase === 'reg') {
   const g = C.sched[nx.w][nx.i], k = nx.w + '|' + nx.i, s = nx.home ? [ sc[0], sc[1] ] : [ sc[1], sc[0] ];
   C.res[k] = s;
   apply(C, g[0], g[1], s[0], s[1]);
   C.mine.push({
    label: nx.label,
    opp: nx.opp,
    home: nx.home,
    s: sc.slice(),
    played: !!played
   });
   finishWeek(C);
  } else if (C.phase === __x("bmNhYQ==")) {
   const R = C.br.rounds[nx.r], g = R.games[nx.i];
   g.s = g.a === C.team ? [ sc[0], sc[1] ] : [ sc[1], sc[0] ];
   C.mine.push({
    label: nx.label,
    opp: nx.opp,
    home: nx.home,
    s: sc.slice(),
    played: !!played
   });
   roundRest(C);
  }
  save();
 }
 function wp(C, id) {
  const t = C.table[id];
  return t.w + t.l ? t.w / (t.w + t.l) : 0;
 }
 function sos(C, id) {
  const o = [];
  C.sched.forEach(wk => wk.forEach(g => {
   if (g[0] === id) o.push(g[1]); else if (g[1] === id) o.push(g[0]);
  }));
  return o.length ? o.reduce((a, x) => a + wp(C, x), 0) / o.length : 0;
 }
 function score(C, id) {
  return .55 * wp(C, id) + .35 * sos(C, id) + .1 * Math.max(0, Math.min(1, (tOvr(id) - 62) / 18));
 }
 const cmpRank = C => (a, b) => score(C, b) - score(C, a) || idsOf(C).indexOf(a) - idsOf(C).indexOf(b);
 const cmpConf = C => (a, b) => {
  const A = C.table[a], B = C.table[b];
  return B.cw - B.cl - (A.cw - A.cl) || B.w - B.l - (A.w - A.l) || B.gf - B.ga - (A.gf - A.ga) || cmpRank(C)(a, b);
 };
 function confStand(C, c) {
  return (confsOf(C)[c] || []).slice().sort(cmpConf(C));
 }
 function selectField(C) {
  if (c33(C)) return selectField33(C);
  const auto = [];
  for (const c in CONFS) if (!NO_AUTO.includes(c)) auto.push(confStand(C, c)[0]);
  const at = IDS.filter(id => !auto.includes(id)).sort(cmpRank(C)).slice(0, 8);
  const field = auto.concat(at).sort(cmpRank(C));
  const orT = field.filter(id => auto.includes(id)).slice(-4);
  const main = field.filter(id => !orT.includes(id));
  C[__x("bmNhYQ==")] = {
   field: field,
   auto: auto,
   at: at,
   seeds: main.slice(0, 8),
   orT: orT
  };
  C.br = {
   rounds: [ {
    name: __x("TkNBQSBPUEVOSU5HIFJPVU5E"),
    games: [ {
     a: orT[0],
     b: orT[3]
    }, {
     a: orT[1],
     b: orT[2]
    } ]
   } ],
   r: 0,
   main: main
  };
  C.phase = __x("bmNhYQ==");
  C.inField = field.includes(C.team);
  if (C.inField) roundRest(C);
  save();
 }
 const PAIRS16 = [ [ 1, 16 ], [ 8, 9 ], [ 5, 12 ], [ 4, 13 ], [ 3, 14 ], [ 6, 11 ], [ 7, 10 ], [ 2, 15 ] ];
 const RNAMES = [ __x("TkNBQSBPUEVOSU5HIFJPVU5E"), __x("TkNBQSBGSVJTVCBST1VORA=="), __x("TkNBQSBRVUFSVEVSRklOQUw="), __x("RklOQUwgRk9VUg=="), 'NATIONAL CHAMPIONSHIP' ];
 const win = g => g.s ? g.s[0] > g.s[1] ? g.a : g.b : null;
 function selectField33(C) {
  const all = idsOf(C).slice(), N = all.length, F = N >= 18 ? 18 : N >= 16 ? 16 : N >= 8 ? 8 : 4, CF = confsOf(C), auto = [];
  for (const c in CF) if (autoOk33(C, c)) auto.push(confStand(C, c)[0]);
  const auto2 = auto.sort(cmpRank(C)).slice(0, F === 18 ? 10 : F), at = all.filter(id => !auto2.includes(id)).sort(cmpRank(C)).slice(0, F - auto2.length);
  const field = auto2.concat(at).sort(cmpRank(C));
  if (F === 18 && auto2.length >= 4) {
   const orT = field.filter(id => auto2.includes(id)).slice(-4), main = field.filter(id => !orT.includes(id));
   C[__x("bmNhYQ==")] = {
    field: field,
    auto: auto2,
    at: at,
    seeds: main.slice(0, 8),
    orT: orT
   };
   C.br = {
    rounds: [ {
     name: __x("TkNBQSBPUEVOSU5HIFJPVU5E"),
     games: [ {
      a: orT[0],
      b: orT[3]
     }, {
      a: orT[1],
      b: orT[2]
     } ]
    } ],
    r: 0,
    main: main
   };
  } else {
   const f = field.slice(0, F === 18 ? 16 : F), P = f.length, ord = [ 1 ];
   while (ord.length < P) {
    const m = ord.length * 2 + 1;
    const o2 = [];
    for (const x of ord) o2.push(x, m - x);
    ord.length = 0;
    ord.push(...o2);
   }
   const games = [];
   for (let i = 0; i < P; i += 2) games.push({
    a: f[ord[i] - 1],
    b: f[ord[i + 1] - 1]
   });
   C[__x("bmNhYQ==")] = {
    field: f,
    auto: auto2.filter(id => f.includes(id)),
    at: at.filter(id => f.includes(id)),
    seeds: f.slice(0, Math.min(8, P)),
    orT: []
   };
   C.br = {
    rounds: [ {
     name: rn33(P),
     games: games
    } ],
    r: 0,
    main: f,
    c33: 1
   };
  }
  C.phase = __x("bmNhYQ==");
  C.inField = C[__x("bmNhYQ==")].field.includes(C.team);
  if (C.inField) roundRest(C);
  save();
 }
 const rn33 = n => n === 2 ? 'NATIONAL CHAMPIONSHIP' : n === 4 ? __x("RklOQUwgRk9VUg==") : n === 8 ? __x("TkNBQSBRVUFSVEVSRklOQUw=") : __x("TkNBQSBGSVJTVCBST1VORA==");
 function nextRound(C) {
  const B = C.br, R = B.rounds[B.r], ws = R.games.map(win);
  if (B.c33) {
   if (R.games.length === 1) {
    C.champ = ws[0];
    C.phase = 'done';
    endSeason(C);
    return;
   }
   const games = [];
   for (let i = 0; i < ws.length; i += 2) {
    const a = ws[i], b = ws[i + 1], sa = C[__x("bmNhYQ==")].field.indexOf(a), sb = C[__x("bmNhYQ==")].field.indexOf(b);
    games.push(sa <= sb ? {
     a: a,
     b: b
    } : {
     a: b,
     b: a
    });
   }
   B.rounds.push({
    name: rn33(ws.length),
    games: games
   });
   B.r++;
   return;
  }
  if (B.r === RNAMES.length - 1) {
   C.champ = ws[0];
   C.phase = 'done';
   endSeason(C);
   return;
  }
  let games;
  if (B.r === 0) {
   const s = B.main.concat(ws);
   games = PAIRS16.map(([x, y]) => ({
    a: s[x - 1],
    b: s[y - 1]
   }));
  } else {
   games = [];
   for (let i = 0; i < ws.length; i += 2) {
    const a = ws[i], b = ws[i + 1], sa = C[__x("bmNhYQ==")].field.indexOf(a), sb = C[__x("bmNhYQ==")].field.indexOf(b);
    games.push(sa <= sb ? {
     a: a,
     b: b
    } : {
     a: b,
     b: a
    });
   }
  }
  B.rounds.push({
   name: RNAMES[B.r + 1],
   games: games
  });
  B.r++;
 }
 function roundRest(C) {
  const B = C.br;
  if (!B) return;
  let guard = 0;
  while (C.phase === __x("bmNhYQ==") && guard++ < 8) {
   const R = B.rounds[B.r], mine = R.games.find(g => (g.a === C.team || g.b === C.team) && !g.s);
   if (mine) break;
   for (const g of R.games) if (!g.s) g.s = sim(g.a, g.b);
   nextRound(C);
   const R2 = C.phase === __x("bmNhYQ==") ? B.rounds[B.r] : null;
   if (R2 && R2.games.some(g => (g.a === C.team || g.b === C.team) && !g.s)) break;
  }
  save();
 }
 const alive = C => C.phase === __x("bmNhYQ==") && !!myGame(C);
 function addBox(C, box, ids) {
  C.stats = C.stats || {};
  for (const id of ids) {
   if (!PP(id)) continue;
   const s = C.stats[id] || (C.stats[id] = blankStats()), b = box[id] || {};
   s.gp++;
   for (const k of STAT_KEYS) s[k] += b[k] || 0;
  }
 }
 function gameBox(C, G) {
  const V = V14(G), played = new Set(V.lu0 || []);
  const lu = G.lu && G.lu[0];
  if (lu) for (const id of [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ]) if (id) played.add(id);
  for (const id in V.box) if (PP(id) && PP(id).team === C.team) played.add(id);
  addBox(C, V.box, [ ...played ].filter(id => PP(id) && (PP(id).team === C.team || T(C.team).roster.includes(id))));
 }
 function simBox(C, goals, against, seed) {
  const r = rng(seed), lu = lineupFor(C.team, 'real'), off = [ ...lu.A, ...lu.M ].filter(id => PP(id)), box = {};
  const b = id => box[id] || (box[id] = {});
  const wt = off.map(id => {
   const p = PP(id);
   return Math.max(1, (p.r.fin + p.r.acc + p.r.pow) / 3 - 40);
  }), tot = wt.reduce((a, x) => a + x, 0);
  const pick = () => {
   let x = r() * tot;
   for (let i = 0; i < off.length; i++) {
    x -= wt[i];
    if (x <= 0) return off[i];
   }
   return off[off.length - 1];
  };
  for (let gI = 0; gI < goals; gI++) {
   const s = pick();
   b(s).g = (b(s).g || 0) + 1;
   b(s).sh = (b(s).sh || 0) + 1 + (r() < .6 ? 1 : 0);
   if (r() < .55) {
    let a = pick(), k = 0;
    while (a === s && k++ < 4) a = pick();
    if (a !== s) b(a).a = (b(a).a || 0) + 1;
   }
  }
  const all = [ ...off, ...lu.D, lu.LSM, lu.SSDM, lu.FO ].filter(id => PP(id));
  for (let i = 0; i < 14; i++) {
   const id = all[Math.floor(r() * all.length)];
   b(id).gb = (b(id).gb || 0) + 1;
  }
  for (const id of [ ...lu.D, lu.LSM ].filter(id => PP(id))) if (r() < .45) b(id).ct = (b(id).ct || 0) + 1;
  if (PP(lu.FO)) {
   const t = 10 + Math.floor(r() * 10), w = Math.round(t * (.4 + .2 * r()));
   b(lu.FO).fow = w;
   b(lu.FO).fot = t;
  }
  if (PP(lu.G)) {
   const sa = against + 10 + Math.floor(r() * 12);
   b(lu.G).sv = sa - against;
   b(lu.G).sa = sa;
   b(lu.G).ga = against;
  }
  addBox(C, box, [ ...new Set([ ...all, lu.G ]) ]);
 }
 const COL_LEG = {
  'LEG-0': 'CCUSE',
  'LEG-1': 'CJHU',
  'LEG-2': 'CCUSE',
  'LEG-3': 'CJHU'
 };
 const LEG_P = .25;
 const pts = (C, id) => {
  const s = C.stats[id];
  return s ? s.g + s.a : 0;
 };
 const impact = (C, id) => {
  const s = C.stats[id];
  return s ? s.g + s.a + .5 * s.gb + 1.5 * s.ct + .3 * s.sv + .2 * s.fow : 0;
 };
 const on2504 = () => !window.__rl_no2504 && !window.__rl_v124gb;
 function pickHonors(C) {
  const ids = T(C.team).roster.filter(id => PP(id));
  const tew = ids.slice().sort((a, b) => pts(C, b) - pts(C, a) || impact(C, b) - impact(C, a) || PP(b).ovr - PP(a).ovr || ids.indexOf(a) - ids.indexOf(b))[0];
  const aa = [ tew ].concat(ids.filter(id => id !== tew).sort((a, b) => impact(C, b) - impact(C, a) || PP(b).ovr - PP(a).ovr || ids.indexOf(a) - ids.indexOf(b)).slice(0, on2504() ? 5 : 4));
  return {
   tew: tew,
   aa: aa
  };
 }
 function uniGrant(tid) {
  const U = window.UNI21;
  if (!U || !U.on() || !window.V17) return 0;
  let n = 0;
  const s = st17();
  for (const k of [ 2, 3, 4, 5, 6 ].concat(on2504() && U.alt8 && U.alt8(tid) ? [ 8 ] : [])) {
   const id = U.itemId(tid, k);
   if (!V17.BY[id] || (s.inv[id] || 0) > 0) continue;
   V17.grant(id, 1);
   n++;
   if (Array.isArray(s.chalClaim) && !s.chalClaim.some(q => q.id === 'u1|' + id)) s.chalClaim.push({
    id: 'u1|' + id,
    k: 'u1',
    u1: 1,
    txt: 'NATIONAL CHAMPIONS! ' + nm(tid) + ' ' + (U.styN ? U.styN(tid, k) : U.STY[k]) + ' UNIFORM UNLOCKED',
    pay: 0,
    item: id,
    pack: null
   });
  }
  if (n) V17.save();
  return n;
 }
 function endSeason(C) {
  if (C.champ !== C.team || C.hon) {
   save();
   return;
  }
  if (window.V33 && V33.np(C)) {
   save();
   return;
  }
  const tid = C.team, ids = T(tid).roster.filter(id => PP(id)), H = {
   at: Date.now()
  };
  const nc331 = !!(window.V331 && V331.noCards && V331.noCards(C));
  if (nc331) H.nc331 = 1;
  try {
   const ncx = nc331 && !window.__rl_v124gb && !window.__rl_no332ncx;
   if (ncx) try {
    const {tew: tew, aa: aa} = pickHonors(C.stats ? C : Object.assign({}, C, {
     stats: {}
    }));
    H.tew = tew;
    H.aa = aa;
    H.ncx332 = 1;
    const bOf = id => {
     let s = String(id || '');
     if (window.ULT331 && ULT331.isU && ULT331.isU(s)) s = s.slice(ULT331.PFX.length);
     return s.replace(/^(AA25-|TW25-)/, '');
    };
    if (window.HON25) try {
     const one = (k, id) => {
      const b = bOf(id), p = PP(b);
      if (!p || p.leg || !window.V22 || V22.owned((k === 'tew' ? 'TW25-' : 'AA25-') + b)) return null;
      const r = HON25.grant(k, b, p.team || tid);
      if (k === 'tew') HON25.markTew && HON25.markTew(b); else HON25.markAA && HON25.markAA(b);
      return r;
     };
     if (tew) H.tewCard = one('tew', tew);
     for (const id of aa) one('aa', id);
    } catch (e) {
     console.error(e);
    }
   } catch (e) {
    console.error(e);
   }
   const {tew: tew, aa: aa} = nc331 ? {
    tew: H.tew || null,
    aa: H.aa || []
   } : pickHonors(C);
   H.tew = tew;
   H.aa = aa;
   if (window.HON25 && !nc331) {
    try {
     H.tewCard = HON25.grant('tew', tew, tid);
     HON25.markTew && HON25.markTew(tew);
     for (const id of aa) {
      HON25.grant('aa', id, tid);
      HON25.markAA && HON25.markAA(id);
     }
    } catch (e) {
     console.error(e);
    }
   }
   if (window.V22 && V22.on() && !nc331) {
    const had = ids.filter(id => V22.owned(id)), fs34 = V22.flipSplit ? V22.flipSplit(ids, tid, 'COLLEGE NATTY', 'C|' + C.n + '|' + tid) : null, got = V22.grantIds(fs34 ? fs34.pass : ids, tid, 'COLLEGE NATTY');
    H.cards = got.length;
    H.dupes = had.length;
    if (fs34) {
     H.flip34 = fs34.need || 0;
     H.deck34 = fs34.deck.length;
    }
    if (had.length && V17.give232 && V17.dd232on && V17.dd232on()) {
     let c = 0;
     for (const id of had) c += V17.sell232(V22.rarOf(id));
     V17.give232(c);
     H.chinos = c;
    }
    V22.popup('col25|' + C.n + '|' + tid, 'NATTY WON - PLAYER CARDS!', 'NATIONAL CHAMPIONS! EVERY PLAYER ON YOUR ' + nm(tid) + ' ROSTER IS NOW A PLAYER CARD', got);
   }
   if (!nc331) try {
    H.coach = window.HON25 && HON25.coachGrant ? HON25.coachGrant(tid) : window.V232 && V232.giveCoach ? V232.giveCoach(tid, 'COLLEGE NATTY') : null;
   } catch (e) {
    console.error(e);
   }
   H.leg = [];
   const s = st17();
   for (const it of nc331 ? [] : V17.I || []) {
    if (!it.leg20 || COL_LEG[it.leg20] !== tid) continue;
    if (it.id !== __x("bGVnX2dhcnJ5") && !window.__rl_v124gb && !window.__rl_no332leg) continue;
    if ((typeof window.__c25legR === 'number' ? window.__c25legR : Math.random()) >= LEG_P) continue;
    if ((s.inv[it.id] || 0) > 0) {
     if (V17.give232) V17.give232(V17.sell232(2));
     H.leg.push({
      id: it.id,
      dup: 1
     });
    } else {
     V17.grant(it.id, 1);
     H.leg.push({
      id: it.id
     });
    }
   }
   if (H.leg.length) V17.save();
   H.uni = uniGrant(tid);
   S.titles = (S.titles || 0) + 1;
   try {
    V17.award('trophy_natty');
   } catch (e) {
    console.error(e);
   }
  } catch (e) {
   console.error(e);
  }
  C.hon = H;
  save();
 }
 let ULT_BUILD = false;
 const diff2503 = G => {
  if (!on2503() || !G || !G.meta || !G.meta.col25) return null;
  if (G.meta.ult25) {
   const U = ucur();
   return U && U.n === G.meta.col25.n ? U.diff2503 : null;
  }
  const C = cur();
  return C && C.n === G.meta.col25.n ? C.diff2503 : null;
 };
 const UREQ5 = [ [ __x("dHJvcGh5X3BsbA=="), __x("UExMIFRST1BIWQ=="), __x("V0lOIEEgUExMIFNFQVNPTg==") ], [ __x("dHJvcGh5X21sbA=="), __x("TUxMIFRST1BIWQ=="), __x("V0lOIEFOIE1MTCBTRUFTT04=") ], [ 'trophy_pro', 'BAGGA LAX TROPHY', __x("V0lOIEEgQ09NQklORUQgKFBMTCArIE1MTCkgU0VBU09O") ], [ 'trophy_mega', 'MEGA BAGGA LAX TROPHY', 'WIN A COMBINED SEASON WITH N/A TEAMS' ], [ 'trophy_natty', 'NATTY TROPHY', 'WIN THE COLLEGE LAX NATIONAL CHAMPIONSHIP' ] ];
 const on2503 = () => on() && !window.__rl_no2503;
 const UREQ = () => on2503() ? UREQ5.concat([ [ 'trophy_globe', 'WORLD GAMES TROPHY', 'WIN THE WORLD GAMES' ] ]) : UREQ5;
 const hasT = id => {
  const s = st17();
  return !!(s && s.trophies && s.trophies[id]);
 };
 const T2503 = Date.parse('2026-10-26T22:41:00Z');
 const old5 = () => UREQ5.every(([id]) => hasT(id));
 const keep2503 = () => {
  try {
   if (localStorage.getItem('rl_ult2503') === 'k') return true;
   const s0 = st17();
   if (s0 && s0.ult2503) return true;
   if (S && S.ult && S.ult.team) return true;
   const s = st17();
   return old5() && UREQ5.every(([id]) => {
    const t = s.trophies[id];
    return !(t && typeof t.at === 'number' && t.at >= T2503);
   });
  } catch (e) {
   return false;
  }
 };
 try {
  if (on2503() && localStorage.getItem('rl_ult2503') == null) {
   const k = old5() || !!(S && S.ult && S.ult.team);
   localStorage.setItem('rl_ult2503', k ? 'k' : 'n');
   if (k && st17() && window.V17) {
    st17().ult2503 = 1;
    V17.save();
   }
  }
 } catch (e) {}
 const ultUnlocked = () => UREQ5.every(([id]) => hasT(id)) && (!on2503() || hasT('trophy_globe') || keep2503());
 const UMAX = 5;
 const groups = () => ({
  PRO: TEAMS.filter(t => t.lg === __x("UExM") || t.lg === __x("TUxM")).map(t => t.id),
  WORLD: (typeof wtList2318 === 'function' ? wtList2318() : WTEAMS).map(t => t.id),
  COLLEGE: IDS.slice(),
  'N/A': (window.V232 && V232.naTeams ? V232.naTeams() : []).filter(id => T(id) && T(id).id === id)
 });
 const groupOf = id => {
  const g = groups();
  for (const k in g) if (g[k].includes(id)) return k;
  return null;
 };
 function bracketOrder(n) {
  let o = [ 1 ];
  while (o.length < n) {
   const m = o.length * 2 + 1;
   o = o.flatMap(x => [ x, m - x ]);
  }
  return o;
 }
 const URN = [ 'ULTIMATE ROUND OF 32', __x("VUxUSU1BVEUgU1dFRVQgMTY="), __x("VUxUSU1BVEUgRUxJVEUgOA=="), __x("VUxUSU1BVEUgRklOQUwgRk9VUg=="), 'ULTIMATE FINAL' ];
 function newUlt(team) {
  if (on2501()) return newUlt2501(team);
  const g = groups(), by = ids => ids.slice().sort((a, b) => tOvr(b) - tOvr(a));
  const take = {
   PRO: 8,
   WORLD: 8,
   COLLEGE: 12,
   'N/A': 4
  };
  let field = [];
  for (const k in take) field.push(...by(g[k]).slice(0, take[k]));
  const rest = by([].concat(...Object.values(g)).filter(id => !field.includes(id)));
  while (field.length < 32 && rest.length) field.push(rest.shift());
  if (!field.includes(team)) {
   const k = groupOf(team), mine = field.filter(id => groupOf(id) === k), drop = mine.length ? by(mine).pop() : by(field).pop();
   field[field.indexOf(drop)] = team;
  }
  field = by(field).slice(0, 32);
  if (!field.includes(team)) field[31] = team;
  const ord = bracketOrder(32), games = [];
  for (let i = 0; i < 32; i += 2) games.push({
   a: field[ord[i] - 1],
   b: field[ord[i + 1] - 1]
  });
  const U = {
   v: 25,
   n: (S.un || 0) + 1,
   team: team,
   field: field,
   br: {
    rounds: [ {
     name: URN[0],
     games: games
    } ],
    r: 0
   },
   phase: 'ko',
   subs: S.ult && S.ult.subs || [],
   coach: S.ult && S.ult.coach || null
  };
  S.un = U.n;
  S.ult = U;
  save();
  return U;
 }
 const ucur = () => S.ult && S.ult.v === 25 && S.ult.team && T(S.ult.team) && T(S.ult.team).id === S.ult.team && (!S.ult.u2501 || on2501()) ? S.ult : null;
 function uGame(U) {
  if (U.phase !== 'ko') return null;
  const R = U.br.rounds[U.br.r];
  if (!R) return null;
  const i = R.games.findIndex(g => (g.a === U.team || g.b === U.team) && !g.s);
  if (i < 0) return null;
  const g = R.games[i];
  return {
   r: U.br.r,
   i: i,
   opp: g.a === U.team ? g.b : g.a,
   home: g.a === U.team,
   label: R.name,
   final: U.u2501 ? !R.pi && R.games.length === 1 : U.br.r === URN.length - 1
  };
 }
 function uNext(U) {
  if (U.u2501) return uNext2501(U);
  const B = U.br, R = B.rounds[B.r], ws = R.games.map(win);
  if (B.r === URN.length - 1) {
   U.champ = ws[0];
   U.phase = 'done';
   if (U.champ === U.team && !(window.V33 && V33.np(U))) {
    try {
     V17.award('trophy_ultimate');
    } catch (e) {
     console.error(e);
    }
    S.utitles = (S.utitles || 0) + 1;
    try {
     if (window.V27 && V27.ultWin) V27.ultWin(U);
    } catch (e) {
     console.error(e);
    }
   }
   return;
  }
  const games = [];
  for (let i = 0; i < ws.length; i += 2) {
   const a = ws[i], b = ws[i + 1];
   games.push(U.field.indexOf(a) <= U.field.indexOf(b) ? {
    a: a,
    b: b
   } : {
    a: b,
    b: a
   });
  }
  B.rounds.push({
   name: URN[B.r + 1],
   games: games
  });
  B.r++;
 }
 function uRest(U) {
  let k = 0;
  while (U.phase === 'ko' && k++ < 24) {
   const R = U.br.rounds[U.br.r];
   if (R.games.some(g => (g.a === U.team || g.b === U.team) && !g.s)) break;
   for (const g of R.games) if (!g.s) g.s = sim(g.a, g.b);
   uNext(U);
  }
  save();
 }
 function uRecord(U, sc) {
  const nx = uGame(U);
  if (!nx) return;
  const g = U.br.rounds[nx.r].games[nx.i];
  g.s = g.a === U.team ? [ sc[0], sc[1] ] : [ sc[1], sc[0] ];
  uRest(U);
 }
 const ownedCards = () => {
  const a = [];
  try {
   if (window.V22 && V22.on()) a.push(...V22.ownedIds());
   if (window.V20 && V20.ownedLeg) a.push(...V20.ownedLeg());
  } catch (e) {}
  return [ ...new Set(a) ].filter(id => PP(id)).sort((x, y) => PP(y).ovr - PP(x).ovr);
 };
 const on2501 = () => on() && !window.__rl_no2501;
 const U_MIN = 7;
 const UP = 128;
 const nextP2 = n => {
  let p = 1;
  while (p < n) p *= 2;
  return p;
 };
 const rName = (n, pi) => 'ULTIMATE ' + (pi ? 'PLAY-IN' : n === 2 ? 'FINAL' : n === 4 ? __x("RklOQUwgRk9VUg==") : n === 8 ? __x("RUxJVEUgOA==") : n === 16 ? __x("U1dFRVQgMTY=") : 'ROUND OF ' + n);
 function allTeams() {
  const g = groups(), seen = new Set, out = [];
  for (const k in g) for (const id of g[k]) if (!seen.has(id) && T(id) && T(id).id === id) {
   seen.add(id);
   out.push(id);
  }
  return out;
 }
 function uShape(N) {
  let P = N >= UP ? UP : nextP2(N);
  while (N >= UP && P * 2 <= N) P *= 2;
  return {
   N: N,
   P: P,
   E: Math.max(0, N - P),
   byes: Math.max(0, P - N)
  };
 }
 function firstRound(U, piWin) {
  const cut = U.P - U.E, slot = s => s <= cut ? U.field[s - 1] || null : piWin[s - cut - 1] || null, ord = bracketOrder(U.P), games = [];
  for (let i = 0; i < U.P; i += 2) {
   const a = slot(ord[i]), b = slot(ord[i + 1]);
   if (!a && !b) continue;
   const g = a ? {
    a: a,
    b: b
   } : {
    a: b,
    b: null
   };
   if (!g.b) {
    g.s = [ 1, 0 ];
    g.bye = 1;
   }
   games.push(g);
  }
  return {
   name: rName(U.P),
   games: games
  };
 }
 function newUlt2501(team) {
  const e33 = window.V33 && V33.eff && (V33.onPick() || V33.incOn('ult')) ? V33.eff('ult') : null, c33 = !!(e33 && e33.custom && e33.ids.includes(team));
  const field = (c33 ? e33.ids.slice() : allTeams()).sort((a, b) => tOvr(b) - tOvr(a) || (a < b ? -1 : 1)), sh = uShape(field.length), rounds = [];
  const U = {
   v: 25,
   u2501: 1,
   n: (S.un || 0) + 1,
   team: team,
   field: field,
   P: sh.P,
   E: sh.E,
   br: {
    rounds: rounds,
    r: 0
   },
   phase: 'ko',
   coach: S.ult && S.ult.coach || null
  };
  if (c33) {
   U.t33 = {
    removed: e33.removed.slice(),
    card: e33.ct.slice(),
    n: field.length
   };
   if (e33.np) U.np33 = 1;
  }
  if (sh.E) {
   const games = [];
   for (let i = 0; i < sh.E; i++) games.push({
    a: field[sh.P - sh.E + i],
    b: field[field.length - 1 - i]
   });
   rounds.push({
    name: rName(0, 1),
    pi: 1,
    games: games
   });
  } else rounds.push(firstRound(U, []));
  S.un = U.n;
  S.ult = U;
  save();
  return U;
 }
 function uNext2501(U) {
  const B = U.br, R = B.rounds[B.r], ws = R.games.map(win);
  if (R.pi) {
   B.rounds.push(firstRound(U, ws));
   B.r++;
   return;
  }
  if (R.games.length === 1) {
   U.champ = ws[0];
   U.phase = 'done';
   if (U.champ === U.team && !(window.V33 && V33.np(U))) {
    try {
     V17.award('trophy_ultimate');
    } catch (e) {
     console.error(e);
    }
    S.utitles = (S.utitles || 0) + 1;
    try {
     if (window.V27 && V27.ultWin) V27.ultWin(U);
    } catch (e) {
     console.error(e);
    }
   }
   return;
  }
  const games = [];
  for (let i = 0; i < ws.length; i += 2) {
   const a = ws[i], b = ws[i + 1];
   games.push(U.field.indexOf(a) <= U.field.indexOf(b) ? {
    a: a,
    b: b
   } : {
    a: b,
    b: a
   });
  }
  B.rounds.push({
   name: rName(ws.length),
   games: games
  });
  B.r++;
 }
 function uOwn(opp) {
  const ban = opp && T(opp) ? new Set(T(opp).roster) : new Set;
  return ownedCards().filter(id => !ban.has(id) && !(PP(id).base25 && ban.has(PP(id).base25)));
 }
 const luIds = lu => [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ];
 const uValid = (lu, ids) => {
  try {
   return lineupValid(lu, ids) && luIds(lu).every(id => ids.includes(id));
  } catch (e) {
   return false;
  }
 };
 function uLineup(opp) {
  const ids = uOwn(opp);
  if (ids.length < U_MIN) return null;
  let lu = S.ulu ? JSON.parse(JSON.stringify(S.ulu)) : null;
  if (lu && !uValid(lu, ids)) lu = migrateLineup(lu, ids);
  if (!uValid(lu, ids)) lu = autoLineup(ids);
  return uValid(lu, ids) ? lu : null;
 }
 const uShort = () => on2501() && ultUnlocked() && ownedCards().length < U_MIN;
 const uOpp = () => ULT_OPP || (typeof screen !== 'undefined' && screen === 'lineup' && PS.luBack === 'timeout' && game && game.meta && game.meta.ult25 ? game.opp : null);
 {
  const TR0 = window.teamRosterIds;
  window.teamRosterIds = function(teamId, src) {
   if (src === 'ult25' && on2501()) return uOwn(uOpp());
   return TR0.apply(this, arguments);
  };
 }
 {
  const SL0 = window.saveLineup;
  window.saveLineup = function(teamId, src, lu) {
   if (src === 'ult25' && on2501()) {
    S.ulu = JSON.parse(JSON.stringify(lu));
    save();
    return;
   }
   return SL0.apply(this, arguments);
  };
 }
 if (window.V20 && V20.luExtra) {
  const LX0 = V20.luExtra;
  V20.luExtra = function() {
   if (typeof PS !== 'undefined' && PS.luSrc === 'ult25' && on2501()) return [];
   return LX0.apply(this, arguments);
  };
 }
 if (typeof window.curIds2402 === 'function') {
  const CI0 = window.curIds2402;
  window.curIds2402 = function(tid, src, lu) {
   if (lu && on2501() && game && game.meta && game.meta.ult25 && game.lu && lu === game.lu[0]) return luIds2402(lu);
   return CI0.apply(this, arguments);
  };
 }
 if (typeof PANEL_ACT !== 'undefined') {
  const SV0 = PANEL_ACT.luSave;
  PANEL_ACT.luSave = function() {
   if (!(PS.luSrc === 'ult25' && on2501())) return SV0.apply(this, arguments);
   if (!uValid(PS.lu, teamRosterIds(PS.luTeam, 'ult25'))) return;
   saveLineup(PS.luTeam, 'ult25', PS.lu);
   if (PS.luBack === 'timeout' && game) game.lu[0] = JSON.parse(JSON.stringify(PS.lu));
   screen = PS.luBack;
  };
  const TL0 = PANEL_ACT.toLineup;
  if (typeof TL0 === 'function') PANEL_ACT.toLineup = function() {
   if (on2501() && game && game.meta && game.meta.ult25) return openLineup(game.user, 'ult25', 'timeout');
   return TL0.apply(this, arguments);
  };
 }
 let ULT_OPP = null;
 function cardLineup(lu, team) {
  const U = ucur();
  if (!U || team !== U.team || !U.subs || !U.subs.length) return lu;
  const L = JSON.parse(JSON.stringify(lu)), oppRos = ULT_OPP ? new Set(T(ULT_OPP).roster) : new Set, own = new Set(ownedCards());
  const used = new Set([ ...L.A, ...L.M, ...L.D, L.LSM, L.SSDM, L.SSDM2, L.FO, L.G ].filter(Boolean));
  for (const cid of U.subs) {
   const p = PP(cid);
   if (!p || !own.has(cid) || used.has(cid) || p.base25 && used.has(p.base25)) continue;
   if (window.__rl_dup22 && (oppRos.has(cid) || p.base25 && oppRos.has(p.base25))) continue;
   const slot = p.pos === 'A' ? 'A' : p.pos === 'M' ? 'M' : p.pos === 'D' ? 'D' : p.pos;
   if (Array.isArray(L[slot])) {
    let lo = -1;
    L[slot].forEach((id, i) => {
     if (PP(id) && (lo < 0 || PP(id).ovr < PP(L[slot][lo]).ovr)) lo = i;
    });
    if (lo >= 0 && PP(L[slot][lo]).ovr < p.ovr + 99) {
     used.delete(L[slot][lo]);
     L[slot][lo] = cid;
     used.add(cid);
    }
   } else if (slot in L) {
    used.delete(L[slot]);
    L[slot] = cid;
    used.add(cid);
   }
  }
  return L;
 }
 const ultGame = () => !!(game && game.meta && game.meta.ult25);
 {
  const LF0 = window.lineupFor;
  window.lineupFor = function(teamId, src) {
   try {
    if (on2501()) {
     if (src === 'ult25') {
      const ids = uOwn(uOpp());
      return uLineup(uOpp()) || autoLineup(ids.length ? ids : T(teamId).roster);
     }
     const U = ucur();
     if (ULT_BUILD && U && teamId === U.team) {
      const lu = uLineup(ULT_OPP);
      if (lu) return lu;
     }
    }
   } catch (e) {
    console.error(e);
   }
   const lu = LF0.apply(this, arguments);
   try {
    if (on() && !on2501() && ULT_BUILD && lu) return cardLineup(lu, teamId);
   } catch (e) {
    console.error(e);
   }
   return lu;
  };
 }
 if (window.CP2319 && CP2319.stripGame) {
  const SG0 = CP2319.stripGame;
  CP2319.stripGame = function(G) {
   if (on() && G && G.meta && G.meta.ult25) return;
   return SG0.apply(this, arguments);
  };
 }
 const coachCards = () => {
  try {
   if (window.HON25 && HON25.coachCards) return HON25.coachCards();
   const c = window.V232 && V232.coaches ? V232.coaches() : {};
   return Object.keys(c).map(id => ({
    id: id,
    name: c[id].n,
    team: id
   }));
  } catch (e) {
   return [];
  }
 };
 const css = `#col25{position:fixed;inset:0;z-index:41;background:#0b1118;color:#cfe;font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;display:none;flex-direction:column;padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));box-sizing:border-box}\n#col25 *{box-sizing:border-box}#col25 h1{margin:0;font-size:17px;color:#ff9a3d;text-shadow:2px 2px 0 #000;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#col25 h2{margin:2px 0 3px;font-size:12px;color:#ffe14d}\n#col25 .top{display:flex;align-items:center;gap:6px}#col25 .top .sp{flex:1}#col25 .body{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;margin-top:4px}\n#col25 button{font:inherit;text-transform:uppercase;border:0;border-radius:0;padding:6px 9px;margin:0;background:#2cc4dc;color:#0b1a20;box-shadow:0 2px 0 #000;cursor:pointer;touch-action:manipulation;white-space:nowrap}#col25 button:active{transform:translateY(1px);box-shadow:0 1px 0 #000}#col25 button[disabled]{opacity:.4}\n#col25 .g{background:#7dff7a}#col25 .y{background:#ffd23a}#col25 .o{background:#ff9a3d}#col25 .w{background:#c9d6d9}#col25 .p{background:#c77dff}#col25 .r{background:#ff8a7a}\n#col25 .tabs{display:flex;gap:3px;margin-top:4px}#col25 .tabs button{padding:4px 7px;background:#22394a;color:#cfe}#col25 .tabs button.on{background:#ffe14d;color:#0b1a20}\n#col25 .grid{display:flex;flex-wrap:wrap;gap:4px}#col25 .tm{width:104px;display:flex;align-items:center;gap:4px;background:#13202b;border:2px solid #22394a;padding:3px;cursor:pointer;touch-action:manipulation}#col25 .tm img{width:22px;height:26px;image-rendering:pixelated}#col25 .tm b{display:block;font-size:9px;color:#fff;line-height:10px}#col25 .tm i{font-style:normal;font-size:8px;color:#8fe3f0}#col25 .tm.sel{border-color:#7dff7a;background:#1d3a24}\n#col25 .cf{color:#8fe3f0;font-size:10px;margin:5px 0 2px}#col25 .row{display:flex;align-items:center;gap:6px;padding:2px 3px;border-bottom:1px solid #1b2c38}#col25 .row.me{background:#24331a;color:#fff}#col25 .row img{width:13px;height:16px;image-rendering:pixelated}\n#col25 table{border-collapse:collapse;width:100%}#col25 td,#col25 th{padding:2px 4px;text-align:left;white-space:nowrap;font-size:10px}#col25 th{color:#8fe3f0;font-size:9px}#col25 tr.me td{background:#24331a;color:#fff}#col25 td.n{text-align:right}\n#col25 .next{display:flex;align-items:center;gap:8px;background:#13202b;border:2px solid #ff9a3d;padding:5px 8px;margin-top:4px}#col25 .next .vs{flex:1;min-width:0}#col25 .next .vs b{color:#fff;font-size:13px}#col25 .next img{width:26px;height:30px;image-rendering:pixelated}\n#col25 .br{display:flex;gap:6px;min-width:max-content}#col25 .rd{display:flex;flex-direction:column;justify-content:space-around;gap:3px;min-width:118px}#col25 .rd h3{margin:0 0 2px;font-size:9px;color:#ffe14d;text-align:center}\n#col25 .bg{background:#13202b;border:1px solid #2a4458;padding:1px 3px}#col25 .bg div{display:flex;justify-content:space-between;gap:4px;font-size:9px;line-height:11px}#col25 .bg .wn{color:#7dff7a}#col25 .bg .me{color:#ffe14d}#col25 .bg .ls{color:#68808f}\n#col25 .chk{display:flex;align-items:center;gap:6px;padding:4px;border-bottom:1px solid #1b2c38;font-size:12px}#col25 .chk .ok{color:#7dff7a}#col25 .chk .no{color:#ff8a7a}\n#col25 .big{font-size:20px;color:#ffe14d;text-shadow:2px 2px 0 #000;text-align:center;margin:4px 0}#col25 .ctr{text-align:center}#col25 .sm{font-size:9px;color:#8fe3f0}#col25 .lk{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;height:100%}`;
 let root = null, view = 'hub', tab = 'games', dirty = true, msg = '', upTab = 'COLLEGE', upSel = null;
 function el(tag, attrs, kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
   if (k === 'on') for (const ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); else if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids || []) if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
 }
 const btn = (label, cls, fn, id) => el('button', {
  class: cls || '',
  id: id || '',
  on: {
   click: e => {
    e.preventDefault();
    e.stopPropagation();
    tap();
    fn();
    dirty = true;
   }
  }
 }, [ label ]);
 const badgeC = new Map;
 function badge(tid) {
  if (badgeC.has(tid)) return badgeC.get(tid);
  const t = T(tid), c = document.createElement('canvas');
  c.width = 11;
  c.height = 13;
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.fillRect(0, 0, 11, 11);
  x.fillRect(1, 11, 9, 1);
  x.fillRect(3, 12, 5, 1);
  x.fillStyle = t.c1 || '#888';
  x.fillRect(1, 1, 9, 9);
  x.fillRect(2, 10, 7, 1);
  x.fillRect(4, 11, 3, 1);
  const ic = t.icon || [];
  let lc = t.c2 || '#fff';
  try {
   if (cdist(lc, t.c1) < 90) lc = textOn(t.c1);
  } catch (e) {}
  x.fillStyle = lc;
  ic.forEach((row, j) => {
   for (let i = 0; i < row.length; i++) if (row[i] === '#') x.fillRect(3 + i, 2 + j, 1, 1);
  });
  const u = c.toDataURL();
  badgeC.set(tid, u);
  return u;
 }
 const img = tid => el('img', {
  src: badge(tid),
  alt: ''
 });
 function mount() {
  if (root) return;
  document.head.appendChild(el('style', {
   text: css
  }));
  root = el('div', {
   id: 'col25'
  });
  document.body.appendChild(root);
  root.addEventListener('touchmove', e => {
   e.stopPropagation();
  }, {
   passive: true
  });
  for (const ev of [ 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown' ]) root.addEventListener(ev, e => e.stopPropagation());
 }
 function open(v) {
  if (!on()) return;
  mount();
  view = v || 'hub';
  msg = '';
  dirty = true;
  screen = 'col25';
  try {
   panelDirty();
  } catch (e) {}
 }
 function close() {
  screen = 'menu';
  dirty = true;
 }
 const rec = (C, id) => {
  const t = C.table[id];
  return t.w + '-' + t.l;
 };
 function topBar(title, extra) {
  return el('div', {
   class: 'top'
  }, [ el('h1', {
   text: title
  }), el('div', {
   class: 'sp'
  }), ...extra || [], btn('MENU', 'w', close, 'c25menu') ]);
 }
 function teamGrid(ids, sel, onPick, info, nm32) {
  const g = el('div', {
   class: 'grid'
  });
  for (const id of ids) g.appendChild(el('div', {
   class: 'tm' + (sel === id ? ' sel' : ''),
   'data-tid': id,
   on: {
    click: e => {
     e.stopPropagation();
     tap();
     onPick(id);
     dirty = true;
    }
   }
  }, [ img(id), el('div', {}, [ el('b', {
   text: nm32 && nm32[id] ? nm32[id] : nm(id)
  }), el('i', {
   text: info ? info(id) : 'OVR ' + tOvr(id)
  }) ]) ]));
  return g;
 }
 let qpCss26 = false;
 function qpFill26(box, exclude, onPick, only) {
  if (!qpCss26) {
   qpCss26 = true;
   document.head.appendChild(el('style', {
    text: css.replace(/#col25/g, '#qpc26') + '\n#qpc26{position:absolute;inset:auto;display:block;padding:3px 4px 8px;z-index:auto;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;pointer-events:auto;border:2px solid #22394a;font-size:11px}#qpc26 .cf:first-child{margin-top:0}'
   }));
  }
  const g = groups(), pool = new Set((g.COLLEGE || []).filter(id => id !== exclude && (!only || only.includes(id)))), done = new Set;
  const n32 = typeof on32tile === 'function' && on32tile() && typeof tileNames32 === 'function' ? tileNames32([ ...pool ].map(id => T(id)), true) : null;
  const add = (name, ids) => {
   ids = ids.filter(id => pool.has(id) && !done.has(id));
   if (!ids.length) return;
   ids.forEach(id => done.add(id));
   box.appendChild(el('div', {
    class: 'cf',
    text: name
   }));
   box.appendChild(teamGrid(ids.sort((x, y) => tOvr(y) - tOvr(x)), null, onPick, null, n32));
  };
  let ct33 = 0;
  try {
   if (window.V33 && V33.colQp) ct33 = V33.colQp(box, exclude, onPick, only, el, teamGrid) || 0;
  } catch (e) {
   console.error(e);
  }
  for (const c of Object.keys(CONFS)) add(c, CONFS[c].slice());
  add('OTHER', [ ...pool ]);
  return done.size + ct33;
 }
 function vLock() {
  const s = st17(), have = s ? s.chinos || 0 : 0;
  root.appendChild(topBar('COLLEGE LAX'));
  root.appendChild(el('div', {
   class: 'body'
  }, [ el('div', {
   class: 'lk'
  }, [ el('div', {
   class: 'big',
   text: 'COLLEGE LAX IS LOCKED'
  }), el('div', {
   class: 'ctr',
   text: __x("QUxMIDc3IEQxIFRFQU1TIC0gUkVBTCAyMDI3IFJPU1RFUlMgLSBSRUdVTEFSIFNFQVNPTiArIE5DQUEgVE9VUk5BTUVOVCAtIFdJTiBUSEUgTkFUVFk=")
  }), el('div', {
   class: 'ctr',
   text: 'UNLOCK FOR ' + UNLOCK + ' CHINOS  (YOU HAVE ' + have + ')'
  }), btn(have >= UNLOCK ? 'UNLOCK - ' + UNLOCK + ' CHINOS' : 'NOT ENOUGH CHINOS', 'o', () => {
   if (unlock()) {
    toast('COLLEGE LAX UNLOCKED!', '#ff9a3d');
    view = cur() ? 'hub' : 'pick';
   } else msg = 'YOU NEED ' + UNLOCK + ' CHINOS';
  }, 'c25unlock'), el('div', {
   class: 'sm',
   text: msg
  }) ]) ]));
 }
 function vPick() {
  root.appendChild(topBar('COLLEGE LAX - PICK YOUR SCHOOL', [ cur() ? btn('BACK', 'w', () => {
   view = 'hub';
  }) : null ]));
  const b = el('div', {
   class: 'body'
  });
  b.appendChild(el('div', {
   class: 'sm',
   text: __x("Tk8gRFJBRlQ6IFlPVSBQTEFZIFdJVEggVEhFIFJFQUwgUk9TVEVSLiAxNC1HQU1FIFNFQVNPTiwgVEhFTiBUSEUgMTgtVEVBTSBOQ0FBIFRPVVJOQU1FTlQuIE5BVFRZIEZJTkFMIEFUIFRIRSBCQUdHQSBMQVggU1RBRElVTS4=")
  }));
  if (on2502()) {
   const it = S.it2502 !== false, r = el('div', {
    class: 'top'
   });
   r.appendChild(el('div', {
    class: 'sm',
    text: 'ITEMS ACTIVE?'
   }));
   r.appendChild(btn('YES', it ? 'y' : 'w', () => {
    S.it2502 = true;
    save();
   }, 'c25itY'));
   r.appendChild(btn('NO', !it ? 'y' : 'w', () => {
    S.it2502 = false;
    save();
   }, 'c25itN'));
   r.appendChild(el('div', {
    class: 'sm',
    text: it ? 'YOUR GEAR, STICKS + TEAM CREW WORK' : 'NO ITEM EFFECTS + NO TEAM CREW ALL SEASON'
   }));
   b.appendChild(r);
  }
  const u33 = window.V33 && V33.domRows ? V33.domRows('col', b, el, () => {
   dirty = true;
  }) : null;
  if (u33 && u33.ct.length) {
   b.appendChild(el('div', {
    class: 'cf',
    text: 'COLLEGE CARD TEAMS'
   }));
   b.appendChild(teamGrid(u33.ct.slice(), null, id => pickTeam(id)));
  }
  for (const c of Object.keys(CONFS)) {
   const ids = CONFS[c].filter(id => !u33 || !u33.only || u33.only.includes(id));
   if (!ids.length) continue;
   b.appendChild(el('div', {
    class: 'cf',
    text: c
   }));
   b.appendChild(teamGrid(ids.sort((x, y) => tOvr(y) - tOvr(x)), null, id => pickTeam(id)));
  }
  if (window.V33 && V33.holdBind) for (const t of b.querySelectorAll('.tm[data-tid]')) V33.holdBind(t, 'col', t.dataset.tid);
  root.appendChild(b);
 }
 function pickTeam(id) {
  if (window.V33 && V33.startOk && !V33.startOk('col')) {
   dirty = true;
   return;
  }
  if (on2503() && typeof ask2503 === 'function') return ask2503('college', lv => {
   pickTeam0(id, lv);
   dirty = true;
  });
  pickTeam0(id, null);
 }
 function pickTeam0(id, lv) {
  newSeason(id);
  if (on2502() && cur()) {
   cur().items232 = S.it2502 !== false;
   save();
  }
  if (lv != null && cur()) {
   cur().diff2503 = lv;
   save();
  }
  try {
   setHome172('college');
   if (!window.__rl_no286qteam && typeof qt26 === 'function') qt26(id);
  } catch (e) {}
  if (selRound(cur())) {}
  view = 'hub';
  tab = 'games';
  toast('YOUR SCHOOL: ' + nm(id), '#ff9a3d');
 }
 function selRound(C) {
  return !!C;
 }
 function playMine(C) {
  const nx = myGame(C);
  if (!nx || nx.bye) return;
  const meta = {
   label: nx.label,
   night: seedOf('c25n|' + C.n + '|' + nx.label + '|' + nx.opp) % 10 < 3,
   col25: {
    n: C.n,
    round: C.phase === 'reg' ? 'reg' : __x("bmNhYQ==")
   },
   final25: !!nx.final
  };
  newGame(C.team, nx.opp, 'college', nx.home, meta);
 }
 function simMine(C) {
  const nx = myGame(C);
  if (!nx) return;
  if (nx.bye) {
   finishWeek(C);
   save();
   return;
  }
  const sc = sim(C.team, nx.opp);
  simBox(C, sc[0], sc[1], seedOf('c25b|' + C.n + '|' + C.mine.length));
  recordMine(C, sc, false);
  msg = (sc[0] > sc[1] ? 'WIN ' : 'LOSS ') + sc[0] + '-' + sc[1] + ' VS ' + nm(nx.opp);
 }
 function nextCard(C) {
  const nx = myGame(C), box = el('div', {
   class: 'next'
  });
  if (C.phase === 'done') {
   box.appendChild(el('div', {
    class: 'vs'
   }, [ el('b', {
    text: C.champ === C.team ? window.V33 && V33.np(C) ? 'NATIONAL CHAMPIONS! (NO TROPHY + NO PRIZES: SCHOOLS WERE TAKEN OUT)' : 'NATIONAL CHAMPIONS!' : 'SEASON OVER - ' + nm(C.champ) + ' WON THE NATTY'
   }) ]));
   if (C.hon) box.appendChild(btn('HONORS', 'y', () => {
    view = 'champ';
   }, 'c25hon'));
   box.appendChild(btn('NEW SEASON', 'o', () => {
    view = 'pick';
   }, 'c25new'));
   return box;
  }
  if (!nx) {
   const txt = C.phase === __x("bmNhYQ==") ? (C.inField ? 'ELIMINATED - ' : __x("Tk9UIFNFTEVDVEVEIEZPUiBUSEUgTkNBQSBUT1VSTkFNRU5UIC0g")) + 'WATCH IT PLAY OUT' : '';
   box.appendChild(el('div', {
    class: 'vs'
   }, [ el('b', {
    text: txt
   }) ]));
   box.appendChild(btn('SIM TOURNAMENT', 'y', () => {
    roundRest(C);
    while (C.phase === __x("bmNhYQ==") && !myGame(C)) {
     const R = C.br.rounds[C.br.r];
     for (const g of R.games) if (!g.s) g.s = sim(g.a, g.b);
     nextRound(C);
    }
    save();
    tab = __x("bmNhYQ==");
   }, 'c25simt'));
   return box;
  }
  if (nx.bye) {
   box.appendChild(el('div', {
    class: 'vs'
   }, [ el('b', {
    text: 'WEEK ' + (nx.w + 1) + ' - BYE WEEK'
   }) ]));
   box.appendChild(btn('NEXT WEEK', 'g', () => simMine(C), 'c25bye'));
   return box;
  }
  box.appendChild(img(nx.opp));
  box.appendChild(el('div', {
   class: 'vs'
  }, [ el('div', {
   class: 'sm',
   text: nx.label + (nx.final ? ' - BAGGA LAX STADIUM' : '')
  }), el('b', {
   text: (nx.home ? 'VS ' : '@ ') + nm(nx.opp)
  }), el('div', {
   class: 'sm',
   text: rec(C, nx.opp) + '  -  OVR ' + tOvr(nx.opp) + '  -  ' + (WT_REG[nx.opp].coach || '')
  }) ]));
  box.appendChild(btn('ROSTER', 'w', () => {
   try {
    openVsRoster([ [ C.team, 'real' ], [ nx.opp, 'real' ] ], 'col25', 0);
   } catch (e) {
    console.error(e);
   }
  }, 'c25ros'));
  box.appendChild(btn('SIM', 'y', () => simMine(C), 'c25sim'));
  box.appendChild(btn('PLAY', 'g', () => playMine(C), 'c25play'));
  return box;
 }
 function tGames(C) {
  const b = el('div', {});
  for (let w = 0; w < WEEKS; w++) {
   const i = myIdx(C, w), r = el('div', {
    class: 'row' + (w === C.wk && C.phase === 'reg' ? ' me' : '')
   });
   r.appendChild(el('span', {
    text: 'WK ' + String(w + 1).padStart(2, ' ')
   }));
   if (i < 0) {
    r.appendChild(el('span', {
     text: 'BYE'
    }));
    b.appendChild(r);
    continue;
   }
   const g = C.sched[w][i], opp = g[0] === C.team ? g[1] : g[0], s = C.res[w + '|' + i];
   r.appendChild(img(opp));
   r.appendChild(el('span', {
    text: (g[0] === C.team ? 'VS ' : '@ ') + nm(opp) + (confOfC(C, g[0]) === confOfC(C, g[1]) ? ' *' : '')
   }));
   if (s) {
    const me = g[0] === C.team ? s[0] : s[1], th = g[0] === C.team ? s[1] : s[0];
    r.appendChild(el('span', {
     class: me > th ? 'ok' : 'no',
     text: (me > th ? 'W ' : 'L ') + me + '-' + th,
     style: 'margin-left:auto;color:' + (me > th ? '#7dff7a' : '#ff8a7a')
    }));
   }
   b.appendChild(r);
  }
  b.appendChild(el('div', {
   class: 'sm',
   text: '* = CONFERENCE GAME. CONFERENCE CHAMPIONS (BEST CONFERENCE RECORD) GET THE AUTO BIDS - EXCEPT THE ACC, WHICH HAS NONE.'
  }));
  for (const m of C.mine.filter(x => new RegExp(__x("TkNBQXxGSU5BTA=="),"").test(x.label))) b.appendChild(el('div', {
   class: 'row'
  }, [ el('span', {
   text: m.label
  }), img(m.opp), el('span', {
   text: nm(m.opp)
  }), el('span', {
   text: (m.s[0] > m.s[1] ? 'W ' : 'L ') + m.s[0] + '-' + m.s[1],
   style: 'margin-left:auto;color:' + (m.s[0] > m.s[1] ? '#7dff7a' : '#ff8a7a')
  }) ]));
  return b;
 }
 function tStand(C) {
  const CF = confsOf(C), mc = confOfC(C, C.team), b = el('div', {}), order = [ mc ].concat(Object.keys(CF).filter(c => c !== mc)).filter(c => CF[c]);
  for (const c of order) {
   b.appendChild(el('div', {
    class: 'cf',
    text: c + (autoOk33(C, c) ? ' (AUTO BID)' : ' (NO AUTO BID)')
   }));
   const tb = el('table', {}, [ el('tr', {}, [ '', 'TEAM', 'CONF', 'ALL', 'GF', 'GA', 'OVR' ].map(h => el('th', {
    text: h
   }))) ]);
   confStand(C, c).forEach((id, k) => {
    const t = C.table[id];
    tb.appendChild(el('tr', {
     class: id === C.team ? 'me' : ''
    }, [ el('td', {
     text: String(k + 1)
    }), el('td', {
     text: nm(id)
    }), el('td', {
     text: t.cw + '-' + t.cl
    }), el('td', {
     text: t.w + '-' + t.l
    }), el('td', {
     class: 'n',
     text: String(t.gf)
    }), el('td', {
     class: 'n',
     text: String(t.ga)
    }), el('td', {
     class: 'n',
     text: String(tOvr(id))
    }) ]));
   });
   b.appendChild(tb);
  }
  return b;
 }
 function bracketEl(rounds, me, field) {
  const w = el('div', {
   class: 'br'
  });
  for (const R of rounds) {
   const col = el('div', {
    class: 'rd'
   }, [ el('h3', {
    text: R.name.replace(__x("TkNBQSA="), '').replace('ULTIMATE ', '')
   }) ]);
   for (const g of R.games) {
    const wn = win(g), line = id => el('div', {
     class: id === me ? 'me' : wn ? wn === id ? 'wn' : 'ls' : ''
    }, [ el('span', {
     text: (field && field.indexOf(id) >= 0 ? field.indexOf(id) + 1 + ' ' : '') + (id ? nm(id) : 'BYE')
    }), el('span', {
     text: g.s ? String(g.a === id ? g.s[0] : g.s[1]) : ''
    }) ]);
    col.appendChild(el('div', {
     class: 'bg'
    }, [ line(g.a), line(g.b) ]));
   }
   w.appendChild(col);
  }
  return w;
 }
 function tNcaa(C) {
  const b = el('div', {});
  if (!C[__x("bmNhYQ==")]) {
   b.appendChild(el('div', {
    class: 'sm',
    text: 'THE 18-TEAM FIELD IS PICKED AFTER WEEK 14: 10 CONFERENCE CHAMPIONS (AUTO BIDS) + 8 AT-LARGE. TOP 8 SEEDED. THE 4 LOWEST AUTO QUALIFIERS PLAY THE OPENING ROUND.'
   }));
   b.appendChild(el('div', {
    class: 'cf',
    text: 'IF IT ENDED TODAY'
   }));
   idsOf(C).slice().sort(cmpRank(C)).slice(0, 18).forEach((id, k) => b.appendChild(el('div', {
    class: 'row' + (id === C.team ? ' me' : '')
   }, [ el('span', {
    text: String(k + 1)
   }), img(id), el('span', {
    text: nm(id) + '  ' + rec(C, id)
   }) ])));
   return b;
  }
  b.appendChild(el('div', {
   class: 'sm',
   text: (C.inField ? 'YOU ARE IN THE FIELD (#' + (C[__x("bmNhYQ==")].field.indexOf(C.team) + 1) + ')' : 'YOU WERE NOT SELECTED') + '  -  AUTO BIDS: ' + C[__x("bmNhYQ==")].auto.map(nm).join(', ')
  }));
  b.appendChild(bracketEl(C.br.rounds, C.team, C[__x("bmNhYQ==")].field));
  if (C.champ) b.appendChild(el('div', {
   class: 'big',
   text: 'NATIONAL CHAMPIONS: ' + nm(C.champ)
  }));
  return b;
 }
 function tStats(C) {
  const ids = T(C.team).roster.filter(id => PP(id)), tb = el('table', {}, [ el('tr', {}, [ '#', 'NAME', 'POS', 'OVR', 'GP', 'G', 'A', 'PTS', 'GB', 'CT', 'SV' ].map(h => el('th', {
   text: h
  }))) ]);
  ids.slice().sort((a, b) => pts(C, b) - pts(C, a) || PP(b).ovr - PP(a).ovr).forEach(id => {
   const p = PP(id), s = C.stats[id] || blankStats();
   tb.appendChild(el('tr', {}, [ el('td', {
    text: String(p.wnum != null ? p.wnum : '')
   }), el('td', {
    text: p.n
   }), el('td', {
    text: p.pos
   }), el('td', {
    class: 'n',
    text: String(p.ovr)
   }), el('td', {
    class: 'n',
    text: String(s.gp)
   }), el('td', {
    class: 'n',
    text: String(s.g)
   }), el('td', {
    class: 'n',
    text: String(s.a)
   }), el('td', {
    class: 'n',
    text: String(s.g + s.a)
   }), el('td', {
    class: 'n',
    text: String(s.gb)
   }), el('td', {
    class: 'n',
    text: String(s.ct)
   }), el('td', {
    class: 'n',
    text: String(s.sv)
   }) ]));
  });
  return el('div', {}, [ el('div', {
   class: 'sm',
   text: on2504() ? 'THE BAGGATWAAN GOES TO YOUR BEST PLAYER (MOST POINTS) - HE IS AN ALL-AMERICAN TOO - AND 5 MORE OF YOUR TOP PLAYERS ARE NAMED ALL-AMERICAN - IF YOU WIN THE NATTY.' : 'THE BAGGATWAAN GOES TO YOUR BEST PLAYER (MOST POINTS) AND 5 OF YOUR TOP PLAYERS ARE NAMED ALL-AMERICAN - IF YOU WIN THE NATTY.'
  }), tb ]);
 }
 function vHub() {
  const C = cur();
  if (!C) {
   view = 'pick';
   return vPick();
  }
  root.appendChild(topBar('COLLEGE LAX - ' + nm(C.team) + ' ' + rec(C, C.team) + '  (' + confOf(C.team) + ')', [ btn('GEAR + LOCKER', 'p', () => {
   try {
    setHome172('college');
   } catch (e) {}
   close();
   try {
    V17.openLocker();
   } catch (e) {}
  }, 'c25gear') ]));
  root.appendChild(nextCard(C));
  if (on2503() && typeof okDiff2503 === 'function' && okDiff2503(C.diff2503) != null) root.appendChild(el('div', {
   class: 'sm',
   id: 'c25diff',
   text: 'SEASON DIFFICULTY: ' + DIFF_NAMES[C.diff2503]
  }));
  if (msg) root.appendChild(el('div', {
   class: 'sm',
   text: msg
  }));
  const tabs = el('div', {
   class: 'tabs'
  });
  for (const [k, l] of [ [ 'games', 'SCHEDULE' ], [ 'stand', 'STANDINGS' ], [ __x("bmNhYQ=="), __x("TkNBQSBCUkFDS0VU") ], [ 'stats', 'TEAM STATS' ] ]) tabs.appendChild(btn(l, tab === k ? 'on' : '', () => {
   tab = k;
  }, 'c25t_' + k));
  root.appendChild(tabs);
  root.appendChild(el('div', {
   class: 'body'
  }, [ tab === 'stand' ? tStand(C) : tab === __x("bmNhYQ==") ? tNcaa(C) : tab === 'stats' ? tStats(C) : tGames(C) ]));
 }
 function vChamp() {
  const C = cur();
  const H = C && C.hon;
  if (!H) {
   view = 'hub';
   return vHub();
  }
  root.appendChild(topBar('NATIONAL CHAMPIONS - ' + nm(C.team), [ btn('BACK', 'w', () => {
   view = 'hub';
  }) ]));
  const b = el('div', {
   class: 'body'
  });
  b.appendChild(el('div', {
   class: 'big',
   text: 'NATTY TROPHY WON!'
  }));
  const tw = PP(H.tew);
  if (tw) b.appendChild(el('div', {
   class: 'ctr',
   html: '<span style="color:#ffcc33;font-size:15px">BAGGATWAAN: ' + tw.n.toUpperCase() + '</span><br>' + pts(C, H.tew) + ' POINTS - BAGGATWAAN CARD (+5) + BAGGATWAAN GLOW'
  }));
  b.appendChild(el('div', {
   class: 'cf',
   text: 'ALL-AMERICANS (ALL-AMERICAN CARD +3, FLAG PATCH)'
  }));
  for (const id of H.aa || []) {
   const p = PP(id);
   if (p) b.appendChild(el('div', {
    class: 'row'
   }, [ el('span', {
    text: '#' + (p.wnum != null ? p.wnum : '')
   }), el('span', {
    text: p.n + ' (' + p.pos + ')'
   }), el('span', {
    text: pts(C, id) + ' PTS',
    style: 'margin-left:auto'
   }) ]));
  }
  b.appendChild(el('div', {
   class: 'cf',
   text: 'ALSO'
  }));
  b.appendChild(el('div', {}, [ (H.flip34 != null ? H.flip34 ? 'FLIP ' + H.flip34 + ' OF ' + H.deck34 + ' NEW ' + nm(C.team) + ' PLAYER CARDS ON THE HOME SCREEN' : 'NO NEW ' + nm(C.team) + ' PLAYER CARDS LEFT' : (H.cards || 0) + ' NEW PLAYER CARDS (THE WHOLE ' + nm(C.team) + ' ROSTER)') + (H.chinos ? ', ' + H.chinos + ' CHINOS FOR REPEATS' : '') ]));
  b.appendChild(el('div', {}, [ 'HEAD COACH CARD: ' + (T(C.team).coach || '').toUpperCase() ]));
  if (H.uni) b.appendChild(el('div', {}, [ H.uni + ' ' + nm(C.team) + ' UNIFORMS UNLOCKED' ]));
  for (const l of H.leg || []) b.appendChild(el('div', {}, [ 'LEGACY CARD: ' + ((V17.BY[l.id] || {}).n || l.id) + (l.dup ? ' (REPEAT = CHINOS)' : '') ]));
  root.appendChild(b);
 }
 function vULock() {
  root.appendChild(topBar('ULTIMATE - LOCKED'));
  const b = el('div', {
   class: 'body'
  });
  b.appendChild(el('div', {
   class: 'ctr',
   text: __x("V0lOIE9ORSBPRiBFQUNIIFRPIFVOTE9DSyBUSEUgVUxUSU1BVEUgVE9VUk5BTUVOVCAoQ09MTEVHRSArIE4vQSArIE1MTCArIFBMTCArIFdPUkxEIFRFQU1TKTo=")
  }));
  for (const [id, n, how] of UREQ()) b.appendChild(el('div', {
   class: 'chk'
  }, [ el('span', {
   class: hasT(id) ? 'ok' : 'no',
   text: hasT(id) ? '[X]' : '[ ]'
  }), el('span', {
   text: n
  }), el('span', {
   class: 'sm',
   text: '- ' + how
  }) ]));
  if (uShort()) {
   const n = ownedCards().length;
   b.appendChild(el('div', {
    class: 'chk',
    id: 'c25ushort'
   }, [ el('span', {
    class: 'no',
    text: '[ ]'
   }), el('span', {
    text: U_MIN + ' PLAYER CARDS'
   }), el('span', {
    class: 'sm',
    text: '- ULTIMATE LINEUPS ARE YOUR CARDS ONLY (1 IN GOAL + 6 ON THE FIELD). YOU OWN ' + n + '. WIN TITLES TO EARN CARDS.'
   }) ]));
  }
  root.appendChild(b);
 }
 function vUPick() {
  root.appendChild(topBar('ULTIMATE - PICK ANY TEAM', [ ucur() && ucur().phase === 'ko' ? btn('BACK', 'w', () => {
   view = 'uhub';
  }) : null ]));
  const g = groups(), tabs = el('div', {
   class: 'tabs'
  });
  for (const k of Object.keys(g)) if (g[k].length) tabs.appendChild(btn(k, upTab === k ? 'on' : '', () => {
   upTab = k;
  }, 'c25u_' + k.replace('/', '')));
  root.appendChild(tabs);
  if (on2501()) {
   const sh = uShape(allTeams().length);
   root.appendChild(el('div', {
    class: 'sm',
    id: 'c25upicktxt',
    text: 'EVERY TEAM (' + sh.N + ') - KNOCKOUT: ' + (sh.E ? sh.E + ' PLAY-IN GAME' + (sh.E > 1 ? 'S' : '') + ', THEN ' : '') + 'THE ROUND OF ' + sh.P + ' TO THE FINAL. PICK A TEAM FOR THE NAME, COLORS + UNIFORM: YOUR LINEUP IS YOUR PLAYER CARDS ONLY.'
   }));
  } else root.appendChild(el('div', {
   class: 'sm',
   text: 'NO DRAFT - BASE ROSTERS - 32 TEAMS, KNOCKOUT - THE ONLY TOURNAMENT WHERE YOUR PLAYER CARDS (AND A COACH CARD) CAN PLAY. FINAL AT THE BAGGA LAX STADIUM.'
  }));
  const u33 = window.V33 && V33.ultRows ? V33.ultRows(root, el, () => {
   dirty = true;
  }) : null;
  if (u33 && u33.tab) {
   tabs.appendChild(btn('CARD TEAMS', upTab === 'CARD' ? 'on' : '', () => {
    upTab = 'CARD';
   }, 'c25u_CARD'));
  } else if (upTab === 'CARD') upTab = 'COLLEGE';
  const ids33 = upTab === 'CARD' && u33 ? u33.ct : (g[upTab] || []).filter(id => !u33 || !u33.only || u33.only.includes(id));
  root.appendChild(el('div', {
   class: 'body'
  }, [ teamGrid(ids33.slice().sort((a, b) => tOvr(b) - tOvr(a)), null, id => {
   if (window.V33 && V33.startOk && !V33.startOk('ult')) {
    dirty = true;
    return;
   }
   const go = lv => {
    newUlt(id);
    try {
     if (!window.__rl_no286qteam && typeof qt26 === 'function') qt26(id);
    } catch (e) {}
    uRest(ucur());
    if (lv != null && ucur()) {
     ucur().diff2503 = lv;
     save();
    }
    view = 'uhub';
    dirty = true;
   };
   if (on2503() && typeof ask2503 === 'function') ask2503('ult', go); else go(null);
  }) ]));
 }
 function vUHub() {
  const U = ucur();
  if (!U) {
   view = 'upick';
   return vUPick();
  }
  root.appendChild(topBar('ULTIMATE - ' + nm(U.team), [ btn('NEW ULTIMATE', 'p', () => {
   view = 'upick';
  }, 'c25unew') ]));
  if (on2503() && typeof okDiff2503 === 'function' && okDiff2503(U.diff2503) != null) root.appendChild(el('div', {
   class: 'sm',
   id: 'c25udiff',
   text: 'ULTIMATE DIFFICULTY: ' + DIFF_NAMES[U.diff2503]
  }));
  const nx = uGame(U), box = el('div', {
   class: 'next'
  });
  if (U.phase === 'done') box.appendChild(el('div', {
   class: 'vs'
  }, [ el('b', {
   text: U.champ === U.team ? window.V33 && V33.np(U) ? 'ULTIMATE CHAMPIONS! (NO TROPHY + NO PRIZES: TEAMS WERE TAKEN OUT)' : 'ULTIMATE CHAMPIONS! ULTIMATE BAGGA LAX TROPHY WON!' : nm(U.champ) + ' WON THE ULTIMATE'
  }) ])); else if (!nx) {
   box.appendChild(el('div', {
    class: 'vs'
   }, [ el('b', {
    text: 'KNOCKED OUT'
   }) ]));
   box.appendChild(btn('SIM REST', 'y', () => {
    while (U.phase === 'ko') {
     const R = U.br.rounds[U.br.r];
     for (const g of R.games) if (!g.s) g.s = sim(g.a, g.b);
     uNext(U);
    }
    save();
   }, 'c25usimr'));
  } else {
   box.appendChild(img(nx.opp));
   box.appendChild(el('div', {
    class: 'vs'
   }, [ el('div', {
    class: 'sm',
    text: nx.label + (nx.final ? ' - BAGGA LAX STADIUM' : '')
   }), el('b', {
    text: (nx.home ? 'VS ' : '@ ') + nm(nx.opp)
   }), el('div', {
    class: 'sm',
    text: (groupOf(nx.opp) || '') + ' - OVR ' + tOvr(nx.opp)
   }) ]));
   box.appendChild(btn('SIM', 'y', () => {
    const sc = sim(U.team, nx.opp);
    uRecord(U, sc);
    msg = (sc[0] > sc[1] ? 'WIN ' : 'LOSS ') + sc[0] + '-' + sc[1];
   }, 'c25usim'));
   box.appendChild(btn('PLAY', 'g', () => playUlt(U), 'c25uplay'));
  }
  if (on2501() && U.phase === 'ko' && !uLineup(nx ? nx.opp : null)) {
   const pb = box.querySelector('#c25uplay');
   if (pb) pb.remove();
   box.appendChild(el('div', {
    class: 'vs',
    id: 'c25ushort'
   }, [ el('b', {
    text: 'NOT ENOUGH PLAYER CARDS'
   }), el('div', {
    class: 'sm',
    text: 'ULTIMATE LINEUPS ARE YOUR CARDS ONLY: ' + U_MIN + ' NEEDED (1 IN GOAL + 6 ON THE FIELD), ' + uOwn(nx ? nx.opp : null).length + ' CAN PLAY THIS GAME. WIN TITLES TO EARN CARDS.'
   }) ]));
  }
  root.appendChild(box);
  if (msg) root.appendChild(el('div', {
   class: 'sm',
   text: msg
  }));
  const tabs = el('div', {
   class: 'tabs'
  });
  for (const [k, l] of on2501() ? [ [ 'br', 'BRACKET' ], [ 'lu', 'LINEUP (' + ownedCards().length + ' CARDS)' ], [ 'coach', 'COACH CARD' ] ] : [ [ 'br', 'BRACKET' ], [ 'cards', 'YOUR CARDS (' + (U.subs || []).length + '/' + UMAX + ')' ], [ 'coach', 'COACH CARD' ] ]) tabs.appendChild(btn(l, tab === k ? 'on' : '', () => {
   tab = k;
  }, 'c25ut_' + k));
  root.appendChild(tabs);
  const b = el('div', {
   class: 'body'
  });
  if (on2501() && tab === 'cards') tab = 'br';
  if (!on2501() && tab === 'lu') tab = 'br';
  if (tab === 'lu') {
   const lu = uLineup(nx ? nx.opp : null);
   b.appendChild(el('div', {
    class: 'sm',
    text: 'YOUR ULTIMATE LINEUP IS YOUR PLAYER CARDS ONLY - ' + nm(U.team) + ' GIVES THE NAME, COLORS + UNIFORM. TAP A SLOT, THEN A CARD.'
   }));
   if (lu) {
    b.appendChild(btn('SET LINEUP', 'y', () => {
     openLineup(U.team, 'ult25', 'col25');
    }, 'c25ulu'));
    const g = el('div', {
     class: 'grid',
     id: 'c25ulugrid'
    });
    for (const [sk, lab] of SLOTS) {
     const p = PP(slotGet(lu, sk));
     g.appendChild(el('div', {
      class: 'tm',
      'data-cid': p ? p.id : ''
     }, [ el('div', {}, [ el('b', {
      text: lab + ' ' + (p ? p.n : '-')
     }), el('i', {
      text: p ? p.pos + ' ' + p.ovr : ''
     }) ]) ]));
    }
    b.appendChild(g);
   } else b.appendChild(el('div', {
    class: 'sm',
    text: 'NOT ENOUGH PLAYER CARDS: ' + U_MIN + ' NEEDED, ' + uOwn(nx ? nx.opp : null).length + ' CAN PLAY.'
   }));
  } else if (tab === 'cards') {
   const own = ownedCards();
   b.appendChild(el('div', {
    class: 'sm',
    text: own.length ? 'TAP UP TO ' + UMAX + ' CARDS: EACH REPLACES YOUR LOWEST-RATED PLAYER AT HIS POSITION.' : 'NO PLAYER CARDS YET - WIN TITLES TO EARN THEM.'
   }));
   const g = el('div', {
    class: 'grid'
   });
   for (const id of own) {
    const p = PP(id), sel = (U.subs || []).includes(id);
    g.appendChild(el('div', {
     class: 'tm' + (sel ? ' sel' : ''),
     'data-cid': id,
     on: {
      click: e => {
       e.stopPropagation();
       tap();
       U.subs = U.subs || [];
       if (sel) U.subs = U.subs.filter(x => x !== id); else if (U.subs.length < UMAX) U.subs.push(id);
       save();
       dirty = true;
      }
     }
    }, [ el('div', {}, [ el('b', {
     text: p.n
    }), el('i', {
     text: p.pos + ' ' + p.ovr
    }) ]) ]));
   }
   b.appendChild(g);
  } else if (tab === 'coach') {
   const cc = coachCards();
   b.appendChild(el('div', {
    class: 'sm',
    text: cc.length ? 'USE AN OWNED COACH CARD AS YOUR COACH (ULTIMATE ONLY):' : 'NO COACH CARDS YET - EVERY TITLE GIVES THAT TEAM\'S HEAD COACH CARD.'
   }));
   b.appendChild(el('div', {
    class: 'row' + (!U.coach ? ' me' : '')
   }, [ btn('TEAM COACH: ' + (T(U.team).coach0 || T(U.team).coach || '-').toUpperCase(), !U.coach ? 'g' : 'w', () => {
    U.coach = null;
    save();
   }) ]));
   for (const c of cc) b.appendChild(el('div', {
    class: 'row' + (U.coach === c.id ? ' me' : '')
   }, [ btn((c.name || '').toUpperCase() + (c.team && T(c.team) ? ' (' + nm(c.team) + ')' : ''), U.coach === c.id ? 'g' : 'w', () => {
    U.coach = c.id;
    U.coachN = c.name;
    save();
   }) ]));
  } else {
   if (U.u2501) {
    const names = (U.E ? [ rName(0, 1) ] : []).concat([ ...Array(Math.round(Math.log2(U.P))) ].map((_, i) => rName(U.P >> i)));
    b.appendChild(el('div', {
     class: 'tabs',
     id: 'c25urounds'
    }, names.map(n => el('span', {
     class: 'sm' + (U.br.rounds[U.br.r] && U.br.rounds[U.br.r].name === n && U.phase === 'ko' ? ' on' : ''),
     style: 'margin:0 4px' + (U.br.rounds[U.br.r] && U.br.rounds[U.br.r].name === n && U.phase === 'ko' ? ';color:#ffe14d' : ''),
     text: n.replace('ULTIMATE ', '')
    }))));
   }
   b.appendChild(bracketEl(U.br.rounds, U.team, U.field));
  }
  root.appendChild(b);
 }
 let coachSwap = null;
 function playUlt(U) {
  const nx = uGame(U);
  if (!nx) return;
  if (on2501() && !uLineup(nx.opp)) return;
  const meta = {
   label: nx.label,
   night: false,
   ult25: true,
   col25: {
    n: U.n,
    round: 'ult'
   },
   final25: !!nx.final
  };
  const tm = T(U.team);
  if (U.coach && U.coachN) {
   coachSwap = {
    tm: tm,
    c: tm.coach
   };
   tm.coach0 = tm.coach0 || tm.coach;
   tm.coach = String(U.coachN);
  }
  ULT_BUILD = true;
  ULT_OPP = nx.opp;
  try {
   newGame(U.team, nx.opp, 'college', nx.home, meta);
  } finally {
   ULT_BUILD = false;
   ULT_OPP = null;
  }
 }
 function unSwap() {
  if (coachSwap) {
   coachSwap.tm.coach = coachSwap.c;
   coachSwap = null;
  }
 }
 function drawUI() {
  if (!root) return;
  const want = on() && screen === 'col25';
  root.style.display = want ? 'flex' : 'none';
  if (!want || !dirty) return;
  dirty = false;
  root.innerHTML = '';
  try {
   if (view === 'lock' || !unlocked()) vLock(); else if (view === 'pick') vPick(); else if (view === 'champ') vChamp(); else if (view === 'ulock') vULock(); else if (view === 'upick') vUPick(); else if (view === 'uhub') vUHub(); else vHub();
  } catch (e) {
   console.error(e);
  }
 }
 const UL_ULT = () => view === 'ulock' || view === 'upick' || view === 'uhub';
 {
  const R0 = window.render;
  window.render = function() {
   const r = R0.apply(this, arguments);
   try {
    if (root) {
     const was = root.style.display === 'flex';
     if (!was && screen === 'col25') dirty = true;
    }
    drawUI();
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 {
  const FG0 = window.finishGame;
  window.finishGame = function() {
   const G = game, r = FG0.apply(this, arguments);
   try {
    if (on() && G && G.mode === 'college' && !G.tutorial && !G.col25done) {
     G.col25done = true;
     const sc = G.score.slice();
     if (G.meta && G.meta.ult25) {
      const U = ucur();
      if (U && U.team === G.user) uRecord(U, sc);
      unSwap();
     } else {
      const C = cur();
      if (C && C.team === G.user) {
       try {
        gameBox(C, G);
       } catch (e) {
        console.error(e);
       }
       recordMine(C, sc, true);
      }
     }
     const s = st17();
     if (s && s.ql2403 && s.ql2403.team === G.user) {
      s.ql2403 = null;
      V17.save();
     }
     dirty = true;
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 {
  const DF0 = window.drawFinal;
  window.drawFinal = function() {
   const G = game;
   if (!on() || !G || G.mode !== 'college') return DF0.apply(this, arguments);
   const cx = W / 2, w = G.score[0] > G.score[1], ult = !!(G.meta && G.meta.ult25);
   rect(0, 0, W, H, 'rgba(0,0,0,.55)');
   card(cx - 120, 14, 240, 156);
   text('FINAL' + otTag173(G) + '  -  ' + DIFF_NAMES[G.diff != null ? G.diff : 1], cx, 20, 1, '#9aa', 'center');
   text(w ? 'YOU WIN!' : 'TOUGH LOSS', cx, 30, 4, w ? '#ffe14d' : '#ff5a4a', 'center', '#000');
   scoreLine(cx, 64);
   const s = G.stats;
   text('SHOTS ' + s.shots + '   GOALS ' + s.goals + '   FACEOFFS ' + s.fow + '/' + s.fot, cx, 98, 1, '#cfe', 'center');
   let line = '';
   if (ult) {
    const U = ucur();
    line = U ? U.phase === 'done' ? U.champ === U.team ? 'ULTIMATE CHAMPIONS!' : 'ULTIMATE OVER' : uGame(U) ? 'ON TO THE ' + uGame(U).label.replace('ULTIMATE ', '') : 'KNOCKED OUT' : '';
   } else {
    const C = cur();
    if (C) {
     const t = C.table[C.team];
     line = C.phase === 'done' && C.champ === C.team ? 'NATIONAL CHAMPIONS!' : 'COLLEGE LAX ' + nm(C.team) + ' ' + t.w + '-' + t.l;
    }
   }
   text(line, cx, 108, 1, line.indexOf('CHAMPIONS') >= 0 ? '#ffe14d' : '#8fe3f0', 'center');
   button(ult ? 'ULTIMATE' : 'COLLEGE LAX', cx - 110, 122, 104, 18, () => {
    const C = cur();
    open(ult ? 'uhub' : C && C.phase === 'done' && C.hon && C.champ === C.team && !C.honSeen ? (C.honSeen = 1, 
    save(), 'champ') : 'hub');
   }, {
    sc: 1,
    bg: ult ? '#c77dff' : '#ff9a3d'
   });
   button('MENU', cx + 6, 122, 104, 18, () => {
    screen = 'menu';
   }, {
    bg: '#c9d6d9'
   });
   if (w) for (let i = 0; i < 40; i++) {
    const x = (i * 37 + G.finalT * 40 * (1 + i % 3)) % W, y = (i * 23 + G.finalT * 60 * (1 + i % 2)) % H;
    rect(x, y, 2, 2, [ '#2cc4dc', '#ffe14d', '#ff5a4a', '#ffffff' ][i % 4]);
   }
  };
 }
 const colHome = () => on() && typeof HOME172 !== 'undefined' && HOME172 === 'college' && !!cur() && unlocked();
 {
  const HQ0 = window.homeQuick16, QT0 = window.qTeam16;
  window.homeQuick16 = function() {
   if (colHome()) return true;
   return HQ0.apply(this, arguments);
  };
  window.qTeam16 = function() {
   if (colHome()) return cur().team;
   return QT0.apply(this, arguments);
  };
 }
 {
  const HW0 = window.homeWorld;
  window.homeWorld = function() {
   if (colHome()) return false;
   return HW0.apply(this, arguments);
  };
 }
 {
  const MB0 = window.menuBars;
  window.menuBars = function(hasSeason) {
   if (!on()) return MB0.apply(this, arguments);
   const cv = colHome();
   let rows;
   if (cv) {
    const h = HOME172;
    HOME172 = 'season';
    try {
     rows = MB0.apply(this, arguments);
    } finally {
     HOME172 = h;
    }
   } else rows = MB0.apply(this, arguments);
   if (cv) {
    for (const r of rows) for (const e of r) {
     if (/^(SEASON|CONTINUE SEASON|PLAY SEASON)$/.test(e.label) && hasSeason) {
      e.label = 'CONTINUE SEASON';
      e.fn = () => setHome172('season');
     } else if (/WORLD GAMES$/.test(e.label) && e.label !== 'RESTART WORLD GAMES' && wgTeam172()) {
      e.label = 'WORLD GAMES';
      e.fn = () => setHome172('world');
     } else if (e.label === 'QUICK GAME' && LS.get('qteam16', null)) {
      const f = e.fn;
      e.fn = () => {
       setHome172('quick');
      };
     }
    }
   }
   const C = cur(), lockC = !unlocked(), lockU = !ultUnlocked();
   const row = [ {
    label: 'COLLEGE LAX',
    fn: () => {
     if (lockC) return open('lock');
     if (!C) return open('pick');
     if (!cv) {
      setHome172('college');
      return;
     }
     open('hub');
    },
    bg: lockC ? '#8a939b' : '#ff9a3d',
    col25: 1
   }, {
    label: 'ULTIMATE',
    fn: () => {
     if (lockU || uShort()) return open('ulock');
     open(ucur() && ucur().phase === 'ko' ? 'uhub' : 'upick');
    },
    bg: lockU ? '#8a939b' : '#c77dff',
    col25: 1
   } ];
   const wi = rows.findIndex(r => r.some(e => /WORLD GAMES$/.test(e.label) && e.label !== 'RESTART WORLD GAMES'));
   const pi = rows.findIndex(r => r.some(e => e.label === 'PLAYMAKER'));
   if (on2502()) {
    const big = Object.assign({}, row[0], {
     label: !lockC && C && cv ? 'PLAY COLLEGE' : 'COLLEGE LAX',
     big: true,
     sc: 2,
     c2502: 1
    });
    rows.splice(wi >= 0 ? wi + 1 : 4, 0, [ big ]);
   } else if (pi >= 0) rows[pi].push(row[0]); else rows.splice(wi >= 0 ? wi + 1 : 4, 0, [ row[0] ]);
   const hi = rows.findIndex(r => r.some(e => e.label === 'HOW TO PLAY'));
   if (hi >= 0) rows[hi].push(row[1]); else rows.splice(wi >= 0 ? wi + 1 : 4, 0, [ row[1] ]);
   if (cv) {
    const ni = rows.findIndex(r => r.some(e => e.label === 'NEW SEASON' || e.label === 'RESTART WORLD GAMES'));
    const tr = {
     label: 'TEAMS + RATINGS',
     fn: () => {
      menuSel.mode = 'browse';
      screen = 'pickTeam';
     },
     bg: '#8fe3f0'
    };
    const nr = [ {
     label: on2502() ? 'RESTART COLLEGE' : 'NEW COLLEGE SEASON',
     fn: () => open('pick'),
     bg: '#ff9a3d'
    }, tr ];
    if (ni >= 0) rows[ni] = nr; else if (on2502()) {
     const ti = rows.findIndex(r => r.length === 1 && r[0].label === 'TEAMS + RATINGS');
     if (ti >= 0) rows[ti] = nr;
    }
   }
   return rows;
  };
 }
 {
  const LB0 = window.layoutBars;
  window.layoutBars = function(rows, x, w, y0, y1) {
   if (!(on2502() && rows && rows.some(r => r.some(e => e.c2502)))) return LB0.apply(this, arguments);
   y0 = Math.min(y0, 25);
   let gap = 4, bigH = 20, smH = 14;
   const tot = () => rows.reduce((s, r) => s + (r.some(e => e.big) ? bigH : smH), 0) + gap * (rows.length - 1);
   while (tot() > y1 - y0 && gap > 2) gap--;
   while (tot() > y1 - y0 && smH > 12) smH--;
   while (tot() > y1 - y0 && bigH > 14) bigH--;
   const out = [];
   let y = y0;
   for (const r of rows) {
    const h = r.some(e => e.big) ? bigH : smH, n = r.length, hw = Math.floor((w - 3 * (n - 1)) / n);
    r.forEach((e, i) => out.push(Object.assign({}, e, {
     x: x + i * (hw + 3),
     y: y,
     w: i === n - 1 ? w - i * (hw + 3) : hw,
     h: h,
     l2502: 1
    })));
    y += h + gap;
   }
   return out;
  };
 }
 {
  const MBR0 = window.menuBar;
  window.menuBar = function(b, live) {
   if (!(b && b.l2502 && b.big && b.sc && b.h < 16 && on2502())) return MBR0.apply(this, arguments);
   const z281 = !window.__rl_no281chev && !window.__rl_v124gb;
   const sc = textW(b.label, 2) <= b.w - (z281 ? 17 : 8) ? 2 : 1;
   if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
   rect(b.x, b.y + 2, b.w, b.h, '#000');
   rect(b.x, b.y, b.w, b.h, b.bg || '#2cc4dc');
   rect(b.x, b.y, b.w, 1, 'rgba(255,255,255,.4)');
   rect(b.x, b.y + b.h - 2, b.w, 2, 'rgba(0,0,0,.18)');
   rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
   for (let i = 0; i < 3; i++) rect(b.x + b.w - 9 + i, b.y + b.h / 2 - 3 + i, 1, 7 - 2 * i, 'rgba(11,26,32,.55)');
   if (z281 && sc === 1 && textW(b.label) > b.w - 17) {
    const cell = Math.max(1, Math.floor((b.w - 17) / textW(b.label) * RR)) / RR;
    textMini(b.label, b.x + 4 + Math.round((b.w - 15) / 2), b.y + Math.round((b.h - 5 * cell) / 2), b.fg || '#0b1a20', cell);
    return;
   }
   text(b.label, z281 ? b.x + 4 + Math.round((b.w - 15) / 2) : b.x + b.w / 2, b.y + Math.round((b.h - 5 * sc) / 2), sc, b.fg || '#0b1a20', 'center');
  };
 }
 if (window.V232 && typeof V232.itemsOff === 'function') {
  const IO0 = V232.itemsOff;
  V232.itemsOff = function(G) {
   if (on2502() && G && G.mode === 'college' && !G.tutorial && G.meta && G.meta.col25 && !G.meta.ult25) {
    const C = cur();
    if (C && C.n === G.meta.col25.n && C.items232 === false) return true;
   }
   return IO0.apply(this, arguments);
  };
 }
 if (window.V17 && typeof V17.gameStart === 'function') {
  const GS0 = V17.gameStart;
  V17.gameStart = function(G) {
   if (!(on2502() && on2501() && G && G.meta && G.meta.ult25 && G.lu && G.lu[0] && !G.tutorial)) return GS0.apply(this, arguments);
   const lu = G.lu[0], U = ucur(), ids = [ ...new Set([ ...lu.A || [], ...lu.M || [], ...lu.D || [], lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ].filter(Boolean).concat(uOwn(G.opp))) ];
   let gp = 0;
   try {
    for (const R of U && U.br && U.br.rounds || []) for (const g of R.games || []) if (g.s && (g.a === G.user || g.b === G.user)) gp++;
   } catch (e) {}
   const S0 = season, M0 = G.mode, TR0 = window.teamRosterIds;
   season = {
    team: G.user,
    results: Array.from({
     length: gp
    }, () => [ G.user, G.opp ]),
    year: 0,
    week: gp,
    phase: 'ult2502',
    online: false
   };
   window.teamRosterIds = function(tid, src) {
    if (src === 'season') return tid === G.user ? ids.slice() : TR0.call(this, tid, 'real');
    return TR0.apply(this, arguments);
   };
   G.mode = 'season';
   try {
    return GS0.apply(this, arguments);
   } finally {
    G.mode = M0;
    season = S0;
    window.teamRosterIds = TR0;
   }
  };
 }
 try {
  if (window.UNI21 && window.V17) for (const t of TEAMS25) for (let k = 2; k < 7; k++) {
   const id = UNI21.itemId(t.id, k);
   if (V17.BY[id]) continue;
   V17.BY[id] = {
    id: id,
    n: (t.name + ' ' + UNI21.STY[k]).toUpperCase(),
    sec: 'uni21',
    rar: 0,
    art: 'uni21',
    uni21: {
     tid: t.id,
     k: k
    },
    col: t.c1,
    col25: 1,
    d: 'A ' + t.name + ' UNIFORM: ' + UNI21.NOTE[k] + (on2504() ? '. FROM CARD PACKS + THE COLLEGE UNIFORM PACK (A NATTY WITH ' + t.name + ' GIVES ALL OF THEM)' : '. WIN THE NATTY WITH ' + t.name + ' TO GET IT') + '. LOOKS ONLY.'
   };
  }
 } catch (e) {
  console.error(e);
 }
 try {
  if (on2504() && window.UNI21 && window.V17 && UNI21.alt8) {
   UNI21.col2504 = [];
   UNI21.alt2504 = [];
   for (const t of TEAMS25) {
    for (let k = 2; k < 7; k++) {
     const it = V17.BY[UNI21.itemId(t.id, k)];
     if (it) UNI21.col2504.push(it);
    }
    const a = UNI21.alt8(t.id);
    if (!a) continue;
    const id = UNI21.itemId(t.id, 8);
    const u332 = !window.__rl_v124gb && !window.__rl_no332uni;
    const it = V17.BY[id] = {
     id: id,
     n: u332 ? (a.name + ' ALTERNATE').toUpperCase() : (t.name + ' ' + a.name).toUpperCase(),
     sec: 'uni21',
     rar: 1,
     art: 'uni21',
     uni21: {
      tid: t.id,
      k: 8
     },
     col: a.kit.jersey,
     col25: 1,
     alt2504: 1,
     d: u332 ? 'A COLLEGE ALTERNATE: ' + a.note + '. RARE PULL IN CARD PACKS + THE COLLEGE UNIFORM PACK, IN THE ' + a.name + ' PACK, OR WIN THE NATTY WITH THE TEAM THAT WEARS IT. LOOKS ONLY.' : 'A ' + t.name + ' ALTERNATE: ' + a.note + '. RARE PULL IN CARD PACKS + THE COLLEGE UNIFORM PACK, IN THE ' + (t.id === 'CUNC' ? 'CHROME DOME' : 'LUCKY') + ' PACK, OR WIN THE NATTY WITH ' + t.name + '. LOOKS ONLY.'
    };
    UNI21.alt2504.push(it);
   }
  }
 } catch (e) {
  console.error(e);
 }
 if (!on() && typeof HOME172 !== 'undefined' && HOME172 === 'college') {
  try {
   HOME172 = 'season';
  } catch (e) {}
 }
 {
  const BN0 = window.baseNums15, seen = new WeakSet;
  if (typeof BN0 === 'function') window.baseNums15 = function() {
   const m = BN0.apply(this, arguments);
   if (m && !seen.has(m)) {
    seen.add(m);
    for (const t of TEAMS25) assignNums15(t.roster, m);
   }
   return m;
  };
 }
 function sway25(dt) {
  const G = game;
  if (!on() || !G || !G.players || G.mode !== 'college' || G.over || !(screen === 'defense' || screen === 'live')) return;
  const b = G.ball;
  if (!b || b.state !== 'clear') {
   for (const p of G.players) p._sw25 = null;
   return;
  }
  const hold = G.dclear && G.dclear.holder;
  for (const p of G.players) {
   if (p === hold || p === G.carrier || p === G.dctl || p.team === 'G' || p.team === 'G2' || p.gk || p.pl && p.pl.pos === 'G' || p.down > 0) continue;
   const s = p._sw25 || (p._sw25 = {
    x: p.x,
    y: p.y,
    t: 0,
    ph: 0
   });
   if (Math.hypot(p.x - s.x, p.y - s.y) >= 1.5) {
    s.x = p.x;
    s.y = p.y;
    s.t = 0;
    continue;
   }
   s.t += dt;
   if (s.t > 1.6) {
    s.ph ^= 1;
    s.off = s.ph ? 3 : -3;
    s.t = 0;
    s.x = p.x;
    s.y = p.y;
   }
  }
 }
 {
  const M0 = window.moveTo;
  if (typeof M0 === 'function') window.moveTo = function(a, x, y) {
   if (a && a._sw25 && a._sw25.off && game && game.mode === 'college' && game.ball && game.ball.state === 'clear') {
    const r = Array.prototype.slice.call(arguments);
    r[2] = y + a._sw25.off;
    return M0.apply(this, r);
   }
   return M0.apply(this, arguments);
  };
 }
 {
  const S0 = window.step;
  if (typeof S0 === 'function') window.step = function(dt) {
   const r = S0.apply(this, arguments);
   try {
    sway25(dt);
   } catch (e) {}
   return r;
  };
 }
 const API = {
  on: on,
  TEAMS: TEAMS25,
  IDS: IDS,
  isCol: isCol,
  CONFS: CONFS,
  st: () => S,
  save: save,
  cur: cur,
  ucur: ucur,
  newSeason: newSeason,
  myGame: myGame,
  recordMine: recordMine,
  finishWeek: finishWeek,
  selectField: selectField,
  roundRest: roundRest,
  nextRound: nextRound,
  simMine: simMine,
  simBox: simBox,
  gameBox: gameBox,
  pickHonors: pickHonors,
  endSeason: endSeason,
  sim: sim,
  score: score,
  open: open,
  close: close,
  view: () => view,
  setTab: t => {
   tab = t;
   dirty = true;
  },
  unlock: unlock,
  unlocked: unlocked,
  UNLOCK: UNLOCK,
  ultUnlocked: ultUnlocked,
  get UREQ() {
   return UREQ();
  },
  keep2503: keep2503,
  diff2503: diff2503,
  newUlt: newUlt,
  uGame: uGame,
  uRecord: uRecord,
  uRest: uRest,
  groups: groups,
  ownedCards: ownedCards,
  cardLineup: cardLineup,
  on2501: on2501,
  uShape: uShape,
  allTeams: allTeams,
  uLineup: uLineup,
  uOwn: uOwn,
  U_MIN: U_MIN,
  playMine: playMine,
  playUlt: playUlt,
  colHome: colHome,
  qpFill26: qpFill26,
  WEEKS: WEEKS,
  COL_LEG: COL_LEG,
  LEG_P: LEG_P,
  dirty: () => {
   dirty = true;
  }
 };
 API.ultTeams33 = () => allTeams();
 API.confsNow33 = (ids, keepEmpty) => {
  const C = {
   ids33: ids,
   conf33: window.V33 && V33.confMap ? V33.confMap('col') : {}
  };
  return confsOf(C);
 };
 API.confOf33 = id => confOf(id);
 API.CONFS33 = CONFS;
 return API;
})();

window.COL25 = COL25;

(function() {
 const BRAID25 = new Set([ 'garrett wickliffe', 'arthur marsden', 'bruno ansley' ]);
 const isWhau = pl => !!pl && (pl.team === 'WHAU' || String(pl.id || '').startsWith('WHAU-'));
 const b1 = window.braidOf21;
 if (typeof b1 !== 'function') return;
 window.braidOf21 = function(pl) {
  if (!window.__rl_no25 && !window.__rl_v124gb && isWhau(pl) && !BRAID25.has(String((pl.n0 != null ? pl.n0 : pl.n) || '').toLowerCase().trim())) return !!(window.V232 && V232.isBraid && V232.isBraid(pl) && b1.apply(this, arguments));
  return b1.apply(this, arguments);
 };
 window.BRAID25 = BRAID25;
})();
