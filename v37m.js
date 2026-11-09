(function() {
 'use strict';
 if (typeof window.menuBars !== 'function') return;
 const on = () => !window.__rl_no37m && !window.__rl_v124gb;
 const MODES = {
  quick: 'quick',
  season: 'season',
  world: 'world',
  college: 'college'
 };
 const TITLES = {
  home: '',
  play: 'PICK A MODE',
  quick: 'QUICK GAME',
  season: 'PRO SEASON',
  world: 'WORLD GAMES',
  college: 'COLLEGE'
 };
 const M = window.M37 = {
  page: 'home',
  log: [],
  pmTeam: null,
  msgT: 0
 };
 const scr = () => {
  try {
   return screen;
  } catch (e) {
   return '';
  }
 };
 const isMode = p => Object.prototype.hasOwnProperty.call(MODES, p);
 const colOn = () => !!(window.COL25 && COL25.on && COL25.on());
 M.empty = () => on() && scr() === 'menu' && (M.page === 'home' || M.page === 'play');
 function go(p) {
  M.page = p;
  M.log.push(p);
  if (M.log.length > 30) M.log.shift();
  try {
   lobby.card = null;
  } catch (e) {}
  if (isMode(p)) {
   try {
    if (HOME172 !== MODES[p]) setHome172(MODES[p]);
   } catch (e) {
    console.error(e);
   }
   M.pmTeam = null;
  }
 }
 M.go = go;
 function hasTeam(p) {
  try {
   if (p === 'world') return !!wgTeam172();
   if (p === 'college') return colOn() && !!COL25.cur() && COL25.unlocked();
   if (p === 'quick') return !!qTeam16();
   if (p === 'season') return !!LT0();
  } catch (e) {}
  return false;
 }
 M.hasTeam = hasTeam;
 const noTeamHere = () => on() && scr() === 'menu' && isMode(M.page) && M.page !== 'season' && !hasTeam(M.page);
 const ent = (rows, re) => {
  for (const r of rows || []) for (const e of r) if (e && re.test(String(e.label))) return e;
  return null;
 };
 const fnOf = (e, dflt) => e && typeof e.fn === 'function' ? e.fn : dflt;
 const say = s => {
  try {
   menuMsg = {
    s: s,
    t: 2.2
   };
   SFX.bad && SFX.bad();
  } catch (e) {}
 };
 function selTeam() {
  try {
   const tid = lobbyTeam();
   if (!tid) return null;
   return {
    tid: tid,
    src: lobbySrc()
   };
  } catch (e) {
   return null;
  }
 }
 function pracFirst() {
  try {
   const P = window.PRAC18;
   if (!P || !P.SET || typeof P.teams !== 'function') return;
   const l = P.teams();
   if (!l || !l.length) return;
   const m = typeof P.mode29 === 'function' ? P.mode29() : null, k = typeof P.world === 'function' && P.world() ? 'wteam' : m ? 'team29' + m.m : 'team';
   P.SET[k] = l[0];
   if (m) P.SET['first29' + m.m] = m.first;
   if (typeof P.saveSet === 'function') P.saveSet();
  } catch (e) {
   console.error(e);
  }
 }
 M.pracFirst = pracFirst;
 function modeRows(p, hasSeason, base) {
  const out = [];
  const pmE = ent(base, /^PLAYMAKER$/), prE = ent(base, /^PRACTICE$/);
  let main = null, restart = null;
  if (p === 'season') {
   const e = ent(base, /^(SEASON|CONTINUE SEASON|PLAY SEASON|SEASON OVER.*)$/);
   main = {
    label: e && e.ov2503 ? e.label : hasSeason ? 'CONTINUE PRO SEASON' : 'START PRO SEASON',
    fn: fnOf(e, () => {
     menuSel.mode = 'season';
     screen = 'seasonSetup';
     panelDirty();
    }),
    bg: '#ffd23a'
   };
   const r = ent(base, /^NEW SEASON$/);
   if (r && hasSeason) restart = {
    label: 'RESTART PRO SEASON',
    fn: r.fn,
    bg: '#ffd23a'
   };
  } else if (p === 'world') {
   const e = ent(base, /^(PLAY WORLD GAMES|WORLD GAMES)$/), live = typeof wgame !== 'undefined' && wgame && wgame.phase !== 'done';
   main = {
    label: live ? 'CONTINUE WORLD GAMES' : 'START WORLD GAMES',
    fn: fnOf(e, () => {
     screen = live ? 'wgHub' : 'wgPick';
     panelDirty();
    }),
    bg: '#2cc4dc'
   };
   const r = ent(base, /^RESTART WORLD GAMES$/);
   if (r && wgTeam172()) restart = {
    label: 'RESTART WORLD GAMES',
    fn: r.fn,
    bg: '#2cc4dc'
   };
  } else if (p === 'college') {
   const C = colOn() ? COL25.cur() : null;
   main = {
    label: C ? 'CONTINUE COLLEGE' : 'START COLLEGE',
    fn: () => {
     if (!colOn()) return;
     if (!COL25.unlocked()) return COL25.open('lock');
     if (!COL25.cur()) return COL25.open('pick');
     COL25.open('hub');
    },
    bg: '#ff9a3d'
   };
   if (C) restart = {
    label: 'RESTART COLLEGE',
    fn: () => COL25.open('pick'),
    bg: '#ff9a3d'
   };
  } else if (p === 'quick') {
   const e = ent(base, /^(PLAY QUICK MATCH|QUICK GAME)$/);
   main = {
    label: 'PLAY QUICK GAME',
    fn: fnOf(e, () => {
     menuSel.mode = 'quick';
     screen = 'pickTeam';
    }),
    bg: '#ff5ad2'
   };
  }
  const need = () => {
   if ((p === 'world' || p === 'college') && !hasTeam(p)) {
    say(p === 'world' ? 'START WORLD GAMES FIRST TO GET YOUR TEAM' : 'START COLLEGE FIRST TO GET YOUR TEAM');
    return true;
   }
   return false;
  };
  out.push([ Object.assign(main, {
   big: true,
   sc: 2,
   m37: 'main',
   h37: 30
  }) ]);
  if (restart) out.push([ Object.assign(restart, {
   big: true,
   sc: 2,
   m37: 1,
   h37: 18
  }) ]);
  out.push([ {
   label: 'PLAYMAKER',
   fn: () => {
    if (need()) return;
    M.pmTeam = selTeam();
    fnOf(pmE, () => openPlaymaker('menu'))();
    pmTag();
   },
   big: true,
   sc: 2,
   bg: '#ff9a4a',
   m37: 1,
   h37: 18
  } ]);
  out.push([ {
   label: 'PRACTICE',
   fn: () => {
    if (need()) return;
    pracFirst();
    fnOf(prE, () => {
     if (window.PRAC18) PRAC18.open();
    })();
   },
   big: true,
   sc: 2,
   bg: '#ff5ad2',
   m37: 1,
   h37: 18
  } ]);
  out.push([ {
   label: 'BACK',
   fn: () => go('play'),
   bg: '#c9d6d9',
   m37: 'back',
   h37: 15
  } ]);
  return out;
 }
 function rows37(hasSeason, MB0, self, args) {
  const p = M.page;
  if (p === 'home') {
   const base = MB0.apply(self, args);
   const fr = ent(base, /^FRIENDS/);
   const rows = [ [ {
    label: 'PLAY',
    fn: () => go('play'),
    big: true,
    sc: 2,
    bg: '#7dff7a',
    m37: 'play',
    h37: 40
   } ], [ {
    label: 'SETTINGS',
    fn: fnOf(ent(base, /^GAME SETTINGS$/), () => {
     screen = 'settings';
    }),
    big: true,
    sc: 2,
    bg: '#ffd23a',
    m37: 1,
    h37: 18
   } ], [ {
    label: 'HOW TO PLAY',
    fn: fnOf(ent(base, /^HOW TO PLAY$/), () => {
     screen = 'help';
    }),
    big: true,
    sc: 2,
    bg: '#c9d6d9',
    m37: 1,
    h37: 18
   } ], [ {
    label: 'TUTORIAL',
    fn: fnOf(ent(base, /^TUTORIAL$/), () => startTutorial()),
    big: true,
    sc: 2,
    bg: '#ff5ad2',
    m37: 1,
    h37: 18
   } ] ];
   if (fr) rows.push([ {
    label: fr.label,
    fn: fr.fn,
    big: true,
    sc: 2,
    bg: '#b6ff3a',
    m37: 1,
    h37: 18
   } ]);
   return rows;
  }
  if (p === 'play') {
   const base = MB0.apply(self, args);
   const onE = ent(base, /^ONLINE$/), ulE = ent(base, /^ULTIMATE$/), trE = ent(base, /^TEAMS \+ RATINGS$/);
   const rows = [ [ {
    label: 'QUICK GAME',
    fn: () => go('quick'),
    big: true,
    sc: 2,
    bg: '#ff5ad2',
    m37: 1,
    h37: 16
   } ], [ {
    label: 'ONLINE',
    fn: () => {
     try {
      if (qTeam16() && HOME172 !== 'quick') setHome172('quick');
     } catch (e) {}
     fnOf(onE, () => {
      if (window.RLNET) RLNET.openOnline();
     })();
    },
    big: true,
    sc: 2,
    bg: '#b6ff3a',
    m37: 1,
    h37: 16
   } ], [ {
    label: 'PRO SEASON',
    fn: () => go('season'),
    big: true,
    sc: 2,
    bg: '#ffd23a',
    m37: 1,
    h37: 16
   } ], [ {
    label: 'WORLD GAMES',
    fn: () => go('world'),
    big: true,
    sc: 2,
    bg: '#2cc4dc',
    m37: 1,
    h37: 16
   } ] ];
   if (colOn()) {
    const lockC = !COL25.unlocked();
    rows.push([ {
     label: 'COLLEGE',
     fn: () => {
      if (!COL25.unlocked()) return COL25.open('lock');
      go('college');
     },
     big: true,
     sc: 2,
     bg: lockC ? '#8a939b' : '#ff9a3d',
     m37: 1,
     h37: 16
    } ]);
   }
   const last = [];
   if (ulE) last.push({
    label: 'ULTIMATE',
    fn: ulE.fn,
    bg: ulE.bg || '#c77dff',
    m37: 1,
    h37: 14
   });
   last.push({
    label: 'TEAMS + RATINGS',
    fn: fnOf(trE, () => {
     menuSel.mode = 'browse';
     screen = 'pickTeam';
    }),
    bg: '#8fe3f0',
    m37: 1,
    h37: 14
   });
   rows.push(last);
   rows.push([ {
    label: 'BACK',
    fn: () => go('home'),
    bg: '#c9d6d9',
    m37: 'back',
    h37: 13
   } ]);
   return rows;
  }
  if (isMode(p)) {
   const v = MODES[p];
   let base;
   const h = HOME172;
   if (h !== v) HOME172 = v;
   try {
    base = MB0.apply(self, args);
   } finally {
    if (h !== v) HOME172 = h;
   }
   return modeRows(p, hasSeason, base);
  }
  M.page = 'home';
  return MB0.apply(self, args);
 }
 const MB0 = window.menuBars;
 window.menuBars = function(hasSeason) {
  if (!on()) return MB0.apply(this, arguments);
  try {
   if (typeof tutGate !== 'undefined' && tutGate) return MB0.apply(this, arguments);
  } catch (e) {}
  try {
   return rows37(hasSeason, MB0, this, arguments);
  } catch (e) {
   console.error(e);
   M.err = String(e && e.stack || e);
   return MB0.apply(this, arguments);
  }
 };
 const LB0 = window.layoutBars;
 window.layoutBars = function(rows, x, w, y0, y1) {
  if (!(on() && rows && rows[0] && rows[0][0] && rows[0][0].m37)) return LB0.apply(this, arguments);
  let gap = 4;
  const hs = rows.map(r => Math.max.apply(null, r.map(e => e.h37 || 14)));
  const tot = () => hs.reduce((s, h) => s + h, 0) + gap * (rows.length - 1);
  while (tot() > y1 - y0 && gap > 2) gap--;
  for (let k = 0; k < 60 && tot() > y1 - y0; k++) {
   let bi = -1;
   for (let i = 0; i < hs.length; i++) if (hs[i] > 12 && (bi < 0 || hs[i] > hs[bi])) bi = i;
   if (bi < 0) break;
   hs[bi]--;
  }
  const out = [];
  let y = y0;
  rows.forEach((r, ri) => {
   const h = hs[ri], n = r.length, hw = Math.floor((w - 3 * (n - 1)) / n);
   r.forEach((e, i) => out.push(Object.assign({}, e, {
    x: x + i * (hw + 3),
    y: y,
    w: i === n - 1 ? w - i * (hw + 3) : hw,
    h: h,
    first37: ri === 0 && i === 0
   })));
   y += h + gap;
  });
  return out;
 };
 const MBar0 = window.menuBar;
 window.menuBar = function(b, live) {
  if (!(on() && b && b.m37)) return MBar0.apply(this, arguments);
  if (b.first37 && TITLES[M.page]) try {
   const {bx: bx, bw: bw} = lobbyBounds();
   text(TITLES[M.page], Math.round(bx + bw / 2), 22, 1, '#ffe14d', 'center', '#000');
  } catch (e) {}
  if (b.m37 === 'main') return bar2(b, live);
  if (b.m37 !== 'play') return MBar0.apply(this, arguments);
  if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
  rect(b.x, b.y + 3, b.w, b.h, '#000');
  rect(b.x, b.y, b.w, b.h, b.bg);
  rect(b.x, b.y, b.w, 2, 'rgba(255,255,255,.45)');
  rect(b.x, b.y + b.h - 3, b.w, 3, 'rgba(0,0,0,.2)');
  rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
  const sc = b.h >= 32 && textW('PLAY', 4) + 24 <= b.w ? 4 : b.h >= 20 ? 3 : 2, tw = textW('PLAY', sc), tri = 3 * sc, cx = Math.round(b.x + b.w / 2), ty = Math.round(b.y + (b.h - 5 * sc) / 2);
  const x0 = Math.round(cx - (tw + tri + 2 * sc) / 2);
  for (let i = 0; i < tri; i++) rect(x0 + i, ty + Math.round(i / 2), 1, 5 * sc - 2 * Math.round(i / 2), '#0b1a20');
  text('PLAY', x0 + tri + 2 * sc, ty, sc, '#0b1a20', 'left');
 };
 function bar2(b, live) {
  const fw = b.w - 8 - 14, one = textW(b.label, 2) <= fw, sp = b.label.indexOf(' ');
  if (one || sp < 0 || b.h < 26) return MBar0(b, live);
  if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
  rect(b.x, b.y + 2, b.w, b.h, '#000');
  rect(b.x, b.y, b.w, b.h, b.bg || '#2cc4dc');
  rect(b.x, b.y, b.w, 1, 'rgba(255,255,255,.4)');
  rect(b.x, b.y + b.h - 2, b.w, 2, 'rgba(0,0,0,.18)');
  rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
  for (let i = 0; i < 3; i++) rect(b.x + b.w - 9 + i, b.y + b.h / 2 - 3 + i, 1, 7 - 2 * i, 'rgba(11,26,32,.55)');
  const l1 = b.label.slice(0, sp), l2 = b.label.slice(sp + 1), cx = Math.round(b.x + 3 + (b.w - 17) / 2), y0 = Math.round(b.y + (b.h - 22) / 2);
  text(l1, cx, y0, textW(l1, 2) <= fw ? 2 : 1, '#0b1a20', 'center');
  const s2 = textW(l2, 2) <= fw ? 2 : 1;
  text(l2, cx, y0 + 12 + (s2 === 1 ? 2 : 0), s2, '#0b1a20', 'center');
 }
 const LT0 = window.lobbyTeam;
 window.lobbyTeam = function() {
  if (noTeamHere()) return null;
  return LT0.apply(this, arguments);
 };
 const DLL0 = window.drawLobbyLeftIn;
 const SIGN = {
  quick: 'NO QUICK GAME TEAM YET',
  world: 'NO WORLD GAMES TEAM YET',
  college: 'NO COLLEGE TEAM YET'
 };
 window.drawLobbyLeftIn = function(L, live, st, t, kit, locked) {
  if (!on() || scr() !== 'menu') return DLL0.apply(this, arguments);
  if (M.empty()) {
   lobbyRoom(L, LOBBY_GRAY, true, t);
   lobby.hero = null;
   lobby.stats26 = null;
   lobby.layout = {
    L: L,
    empty37: 1
   };
   const m = M.page === 'play' ? 'PICK A MODE TO SEE YOUR TEAM' : 'TAP PLAY TO PICK A MODE';
   if (!(window.V38H && V38H.on())) {
    rect(Math.round(L / 2 - textW(m, 1) / 2 - 4), 116, textW(m, 1) + 8, 10, 'rgba(5,8,11,.7)');
    text(m, L / 2, 118, 1, '#8fe3f0', 'center');
   }
   return;
  }
  const r = DLL0.apply(this, arguments);
  if (noTeamHere() && SIGN[M.page]) {
   const s = SIGN[M.page], sw = Math.min(L - 124, Math.max(textW(s, 1), textW('NO SEASON TEAM', 1)) + 10);
   rect(Math.round(L / 2 - sw / 2), 3, sw, 10, '#05080b');
   text(s.slice(0, Math.floor((sw - 6) / 4)), L / 2, 5, 1, '#aab3ba', 'center');
  }
  return r;
 };
 const DLC0 = window.drawLobbyCard;
 window.drawLobbyCard = function() {
  const c = lobby.card;
  if (!(c && c.kind === 'locked' && noTeamHere())) return DLC0.apply(this, arguments);
  const p = M.page, w = 190, h = 92, x = Math.round(W / 2 - w / 2), y = Math.round(H / 2 - h / 2);
  const nm = p === 'world' ? 'WORLD GAMES' : p === 'college' ? 'COLLEGE' : 'QUICK GAME';
  hit('LOCKED CARD BLOCK', 0, 0, W, H, () => {}, 'LOCKED CARD BLOCK');
  rect(x - 2, y - 2, w + 4, h + 4, '#000');
  rect(x, y, w, h, '#14222c');
  rect(x, y, w, 14, '#ffd23a');
  text('NO ' + nm + ' TEAM YET', x + w / 2, y + 4, 1, '#0b1a20', 'center');
  lobbyLock(x + w / 2, y + 20, 2);
  text(p === 'quick' ? 'PICK A TEAM IN QUICK GAME TO' : 'START ' + nm + ' TO FILL YOUR', x + w / 2, y + 42, 1, '#cfe', 'center');
  text(p === 'quick' ? 'SEE THEM IN YOUR LOCKER ROOM' : 'LOCKER ROOM WITH YOUR TEAM', x + w / 2, y + 50, 1, '#cfe', 'center');
  let mainFn = null;
  try {
   const rows = window.menuBars(season && !(season.phase === 'done' && season.seen));
   const e = ent(rows, /^(START|CONTINUE|PLAY) /);
   mainFn = e && e.fn;
  } catch (er) {}
  button(p === 'quick' ? 'PLAY QUICK GAME' : 'START ' + nm, x + 8, y + 62, w - 70, 20, () => {
   lobby.card = null;
   if (mainFn) mainFn();
  }, {
   bg: '#ffd23a'
  });
  button('NOT NOW', x + w - 58, y + 62, 50, 20, () => {
   lobby.card = null;
  }, {
   bg: '#c9d6d9'
  });
 };
 const DM0 = window.drawMenu;
 window.drawMenu = function() {
  if (on()) try {
   if (isMode(M.page) && HOME172 !== MODES[M.page]) setHome172(MODES[M.page]);
  } catch (e) {
   console.error(e);
  }
  return DM0.apply(this, arguments);
 };
 function pmTag() {
  try {
   if (on() && typeof PM !== 'undefined' && PM && PM.origin === 'menu' && M.pmTeam) PM.t37 = M.pmTeam;
  } catch (e) {}
 }
 const OP0 = window.openPlaymaker;
 if (typeof OP0 === 'function') window.openPlaymaker = function(origin) {
  const r = OP0.apply(this, arguments);
  if (on() && (origin || 'menu') === 'menu' && isMode(M.page)) pmTag();
  return r;
 };
 function pmLineup(t) {
  if (t.lu !== undefined && t.luAt && performance.now() - t.luAt < 2e3) return t.lu;
  t.luAt = performance.now();
  try {
   t.lu = lineupFor(t.tid, t.src);
  } catch (e) {
   t.lu = null;
  }
  return t.lu;
 }
 function pmName(i) {
  const t = PM && PM.t37;
  if (!t) return '';
  const lu = pmLineup(t);
  if (!lu) return '';
  const lb = pmLbl(i), d6 = pmKind(pmCat(PM.play)) === 'D6', n = +lb.slice(1) - 1;
  let id = null;
  if (lb === 'G') id = lu.G; else if (lb[0] === 'A') id = lu.A && lu.A[n]; else if (lb[0] === 'D') id = lu.D && lu.D[n]; else if (lb === 'LSM') id = lu.LSM || (lu.M || []).find(x => x && x !== lu.SSDM && x !== lu.SSDM2); else if (lb[0] === 'M') id = d6 ? [ lu.SSDM, lu.LSM, lu.SSDM2 ][n] : (pmCat(PM.play) === 'CLEAR' && !window.__rl_no427pm && [ lu.SSDM, lu.SSDM2 ][n]) || lu.M && lu.M[n]; // V42.7: clear middies = the D middies, dot 6 = LSM
  const p = id && PP(id);
  if (!p) return '';
  try {
   return String(lastName(p)).slice(0, 8);
  } catch (e) {
   return '';
  }
 }
 M.pmName = pmName;
 function pmKit(t) {
  if (t.kit) return t.kit;
  try {
   t.kit = window.UNI21 && UNI21.on() && UNI21.heroKit ? UNI21.heroKit(0, t.tid) : lobbyKit(t.tid);
  } catch (e) {
   t.kit = null;
  }
  return t.kit;
 }
 const DP0 = window.drawPiece;
 if (typeof DP0 === 'function') window.drawPiece = function(x, y, i, st, kit) {
  const t = on() && typeof PM !== 'undefined' && PM && PM.origin === 'menu' && !(typeof game !== 'undefined' && game) ? PM.t37 : null;
  if (!t) return DP0.apply(this, arguments);
  const k2 = pmKit(t) || kit;
  let nm = '';
  try {
   nm = pmName(i);
  } catch (e) {}
  if (!nm) return DP0.call(this, x, y, i, st, k2);
  const L0 = window.pmLbl;
  window.pmLbl = function(j, pl) {
   const l = L0.apply(this, arguments);
   return j === i && pl === undefined ? l + ' ' + nm : l;
  };
  try {
   return DP0.call(this, x, y, i, st, k2);
  } finally {
   window.pmLbl = L0;
  }
 };
 if (window.V20 && typeof V20.drawHome === 'function') {
  const VH0 = V20.drawHome;
  V20.drawHome = function(bars, modal) {
   if (on() && Array.isArray(bars) && M.page === 'home') bars = bars.map(b => b.label === 'SETTINGS' ? Object.assign({}, b, {
    label: 'GAME SETTINGS'
   }) : b.label === 'PLAY' ? Object.assign({}, b, {
    label: 'QUICK GAME'
   }) : b);
   return VH0.call(this, bars, modal);
  };
 }
 if (window.TOUR17 && Array.isArray(TOUR17.STEPS) && on()) {
  const S = TOUR17.STEPS, si = S.findIndex(s => s[0] === 'set');
  if (si >= 0) S[si] = [ S[si][0], /^(GAME SETTINGS|SETTINGS)$/, S[si][2] ];
  if (!S.some(s => s[0] === 'play37')) S.unshift([ 'play37', /^PLAY$/, 'PLAY = PICK A MODE: QUICK GAME, ONLINE, SEASON, WORLD, COLLEGE' ]);
  try {
   const T0 = TOUR17.T;
   if (T0 && T0.cur && !T0.how && !(T0.log || []).includes('play37') && TOUR17.reset) TOUR17.reset();
  } catch (e) {}
 }
})();
