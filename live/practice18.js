var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 const DRILLS = [ [ 'free', 'FREE PLAY' ], [ 'shoot', 'SHOOTING' ], [ 'dodge', 'DODGING' ], [ 'gb', 'GROUND BALLS' ], [ 'rides', 'RIDES' ] ];
 const DRILL_NAME = Object.fromEntries(DRILLS);
 function drillName(id, side) {
  return id === 'rides' && side === 'D' ? 'CLEARS' : DRILL_NAME[id];
 }
 window.prac18DrillName = drillName;
 function ghostD181(G) {
  return G.players.filter(p => p.team === 'D');
 }
 function schemeList181(P) {
  const G = game;
  if (P.side === 'O') {
   const n = ghostD181(G).length;
   return [ 'MAN', 'ZONE', 'BLACK' ].concat(n <= 5 ? MD_NAMES.filter(k => ZONES[k] && ZONES[k].length >= n) : []);
  }
  return (typeof V13ON === 'function' && !V13ON() ? SET_NAMES_V12 : SET_NAMES).slice();
 }
 function schemeNow181(P) {
  const G = game;
  if (P.side === 'O') {
   if (P.dScheme) return P.dScheme;
   if (G.cpuDef === 'black') return 'BLACK';
   const dl = ghostD181(G), ol = G.players.filter(p => p.team === 'O');
   return G.cpuDef === 'zone' || dl.length !== ol.length ? dl.length < 6 ? G.cpuMD || 'BOX + 1' : 'ZONE' : 'MAN';
  }
  return P.oScheme || G.cpuSet || '3-3';
 }
 function applyScheme181(P) {
  const G = game;
  if (!G || !P || P.drill === 'rides') return;
  if (P.side === 'O' && P.dScheme) {
   G.cpuDef = P.dScheme === 'MAN' ? 'man' : P.dScheme === 'BLACK' ? 'black' : 'zone';
   G.slide = null;
   G.rot = null;
   G.hotP = null;
  }
  if (P.side === 'D' && P.oScheme && SETS[P.oScheme] && screen !== 'live') {
   G.cpuSet = P.oScheme;
   const sp = SETS[P.oScheme];
   for (const a of G.players) if (a.team === 'D' && a !== G.dcar && sp[a.idx]) {
    a.home = [ FL - sp[a.idx][0], sp[a.idx][1] ];
    a.tgt = a.home.slice();
    a.wt = Math.min(a.wt || 0, .2);
   }
  }
 }
 function schemeTap181() {
  const G = game, P = G && G.practice;
  if (!P || P.drill === 'rides') return;
  const L = schemeList181(P), cur = schemeNow181(P), nx = L[(L.indexOf(cur) + 1) % L.length];
  if (P.side === 'O') P.dScheme = nx; else P.oScheme = nx;
  applyScheme181(P);
  P.schemeTaps = (P.schemeTaps || 0) + 1;
  fx = fx.filter(f => f.type !== 'cue');
  addFx('cue', 0, 0, {
   s: (P.side === 'O' ? 'GHOST D: ' : 'GHOST O: ') + nx,
   col: '#8fe3f0',
   life: .9
  });
 }
 window.prac18Scheme = {
  list: () => game && game.practice ? schemeList181(game.practice) : [],
  now: () => game && game.practice ? schemeNow181(game.practice) : null,
  tap: schemeTap181
 };
 const COUNT_SECS = 60, MAX_GAP = 2, CAP = 6;
 const GHOST_KIT = {
  jersey: '#aab3b8',
  trim: '#6e797f',
  helm: '#8f999e'
 };
 const SET = Object.assign({
  side: 'O',
  n: 6,
  ghosts: 6,
  drill: 'free',
  team: 'SEASON'
 }, LS.get('prac18', {}) || {});
 function fixSet() {
  if (SET.side !== 'O' && SET.side !== 'D') SET.side = 'O';
  SET.n = clamp(Math.round(Number.isFinite(+SET.n) ? +SET.n : 6), 1, 6);
  SET.ghosts = clamp(Math.round(Number.isFinite(+SET.ghosts) ? +SET.ghosts : 6), SET.side === 'D' ? 1 : 0, 6);
  if (!DRILL_NAME[SET.drill]) SET.drill = 'free';
 }
 fixSet();
 const saveSet = () => {
  fixSet();
  LS.set('prac18', SET);
 };
 let MSG = null;
 function seasonActive(S) {
  S = S || season;
  if (!S || !S.team || !S.rosters || !(S.phase === 'reg' || S.phase === 'playoff')) return false;
  try {
   return !!nextSeasonGame(S);
  } catch (e) {
   return false;
  }
 }
 function gamesPlayed(S) {
  const mine = r => Array.isArray(r) && r.includes(S.team);
  return (S.results || []).filter(mine).length + (S.playoff && S.playoff.results || []).filter(mine).length;
 }
 function pracData(S) {
  if (!S) return null;
  const d = S.prac18 || (S.prac18 = {
   at: gamesPlayed(S),
   n: 0,
   b: {}
  });
  if (!d.b) d.b = {};
  const gp = gamesPlayed(S);
  if (d.at !== gp) {
   d.at = gp;
   d.n = 0;
  }
  return d;
 }
 function boostMap(S) {
  S = S || season;
  if (!S || !S.prac18 || !seasonActive(S)) return null;
  const b = S.prac18.b || {};
  return Object.keys(b).length ? b : null;
 }
 window.prac18Boost = boostMap;
 function boostOvr(pid, S) {
  S = S || season;
  const b = boostMap(S);
  if (!b || !b[pid]) return 0;
  const p = PP(pid);
  if (!p) return 0;
  const with1 = curOvr14(pid, S);
  let without = with1;
  try {
   window.PRAC18_SKIP = true;
   without = curOvr14(pid, S);
  } finally {
   window.PRAC18_SKIP = false;
  }
  return Math.max(0, with1 - without);
 }
 function gapN(S) {
  S = S || season;
  if (!seasonActive(S)) return 0;
  const d = pracData(S);
  return d ? d.n : 0;
 }
 window.prac18Tag = function(pid) {
  try {
   const n = boostOvr(pid);
   return n > 0 ? ' <span class="pb18">PRAC +' + n + '</span>' : '';
  } catch (e) {
   return '';
  }
 };
 window.prac18Line = function() {
  return seasonActive() ? 'PRACTICE BOOST ' + gapN() + '/' + MAX_GAP : '';
 };
 function seasonTeamOk() {
  return seasonActive() && TEAMS.some(t => t.id === season.team);
 }
 const LEG = 'LEGACY';
 const on205 = () => !window.__rl_no205;
 function world205() {
  try {
   return on205() && typeof homeWorld === 'function' && homeWorld() && !!wgame && !!WT_REG[wgame.team];
  } catch (e) {
   return false;
  }
 }
 const on29p = () => on205() && !window.__rl_no29practeam && !window.__rl_v124gb;
 function proIds29() {
  return TEAMS.filter(t => !t.sz && !t.world).map(t => t.id);
 }
 function okTeam29(id) {
  try {
   return !!T(id) && teamRosterIds(id, 'real').filter(x => PP(x)).length >= 12;
  } catch (e) {
   return false;
  }
 }
 function mode29() {
  if (!on29p() || world205() || typeof HOME172 === 'undefined') return null;
  try {
   if (typeof homeQuick16 !== 'function' || !homeQuick16()) return null;
   if (typeof qsz286 === 'function' && qsz286()) return seasonTeamOk() ? {
    m: 'pro',
    first: 'SEASON'
   } : null;
   const q = qTeam16();
   if (!q || !okTeam29(q)) return null;
   if (WT_REG[q] && WT_REG[q].col25) return {
    m: 'col',
    first: q
   };
   if (WT_REG[q]) return {
    m: 'world',
    first: q
   };
   return {
    m: 'pro',
    first: q
   };
  } catch (e) {
   return null;
  }
 }
 function list29(m) {
  let rest;
  if (m.m === 'col') rest = (window.COL25 && COL25.IDS ? COL25.IDS : Object.keys(WT_REG).filter(id => WT_REG[id].col25)).filter(id => WT_REG[id]); else if (m.m === 'world') {
   const w = typeof wgame !== 'undefined' ? wgame : null;
   rest = w && w.team === m.first && Array.isArray(w.teams) ? w.teams.filter(id => WT_REG[id]) : WTEAMS.filter(t => !t.col25 && !(typeof GH_REG !== 'undefined' && GH_REG[t.id])).map(t => t.id);
  } else rest = (m.first !== 'SEASON' && seasonTeamOk() ? [ 'SEASON' ] : []).concat(proIds29());
  return [ m.first ].concat(rest.filter(id => id !== m.first), [ LEG ]);
 }
 function teamList() {
  if (world205()) {
   const w = wgame;
   return [ w.team ].concat((w.teams || []).filter(id => id !== w.team && WT_REG[id]), [ LEG ]);
  }
  {
   const m = mode29();
   if (m) return list29(m);
  }
  const l = TEAMS.filter(t => !t.sz && !t.world).map(t => t.id);
  return (seasonTeamOk() ? [ 'SEASON' ] : []).concat(l, on205() ? [ LEG ] : []);
 }
 const teamKey205 = () => {
  if (world205()) return 'wteam';
  const m = mode29();
  return m ? 'team29' + m.m : 'team';
 };
 function curTeam() {
  const l = teamList(), kk = teamKey205();
  {
   const m = kk.startsWith('team29') ? mode29() : null;
   if (m && SET['first29' + m.m] !== m.first) {
    SET['first29' + m.m] = m.first;
    SET[kk] = m.first;
   }
  }
  if (!l.includes(SET[kk])) SET[kk] = l[0];
  return SET[kk];
 }
 function setTeam205(v) {
  SET[teamKey205()] = v;
  saveSet();
 }
 function legAll205() {
  return typeof LEGACY20 !== 'undefined' ? LEGACY20.slice() : [];
 }
 function legOwned205() {
  try {
   const o = window.V20 && V20.ownedLeg ? V20.ownedLeg() : [];
   return legAll205().filter(id => o.includes(id));
  } catch (e) {
   return [];
  }
 }
 const na22 = () => !!(window.V22 && V22.on());
 function egg22() {
  return typeof PLAYERS !== 'undefined' ? Object.keys(PLAYERS).filter(id => PLAYERS[id] && PLAYERS[id].egg) : [];
 }
 function legPool205() {
  return na22() ? legAll205().concat(egg22()) : legAll205();
 }
 function legAvail205() {
  return na22() ? legOwned205().concat(egg22()) : legOwned205();
 }
 function teamLabel(k) {
  if (k === 'SEASON') return 'SEASON: ' + T(season.team).name;
  if (k === LEG) return na22() ? 'N/A' : 'LEGACY (' + legOwned205().length + '/' + legAll205().length + ' OWNED)';
  const m29 = mode29(), mine29 = !!(m29 && k === m29.first);
  const t = T(k);
  return (world205() && wgame && k === wgame.team ? 'WORLD TEAM: ' : mine29 ? m29.m === 'col' ? 'COLLEGE TEAM: ' : m29.m === 'world' ? 'WORLD TEAM: ' : 'YOUR TEAM: ' : '') + (t.city ? t.city + ' ' : '') + t.name;
 }
 function open() {
  MSG = null;
  screen = 'prac18';
 }
 function start() {
  saveSet();
  const k = curTeam(), leg = k === LEG, hs = leg ? host205() : null, isSeason = leg ? hs.src === 'season' : k === 'SEASON', tid = leg ? hs.tid : isSeason ? season.team : k;
  const pk = on205() ? picks205(k, SET.side) : null;
  if (leg && (!pk || !pk.f.length)) return false;
  const opp = (TEAMS.find(t => t.id !== tid && !t.sz && !t.world && t.lg === __x("UExM")) || TEAMS.find(t => t.id !== tid)).id;
  newGame(tid, opp, 'practice', true, {
   night: false,
   label: 'PRACTICE'
  });
  const G = game;
  if (isSeason) {
   G.src = 'season';
   G.lu = [ lineupFor(tid, 'season'), G.lu[1] ];
   BOOST = leg ? null : boostFor14(season);
  } else BOOST = null;
  if (pk) G.lu = [ apply205(G.lu[0], pk, SET.side, tid, G.src), G.lu[1] ];
  G.ok = Object.assign({}, GHOST_KIT);
  G.night = false;
  G.tos = [ 0, 0 ];
  if (leg) G.uk = Object.assign({}, LEG_KIT205);
  G.practice = {
   side: SET.side,
   n: pk ? Math.min(SET.n, pk.f.length) : SET.n,
   ghosts: SET.side === 'D' ? Math.max(1, SET.ghosts) : SET.ghosts,
   drill: SET.drill,
   team: tid,
   season: isSeason && !leg,
   playT: 0,
   ctl: {},
   reps: 0,
   wins: 0,
   goals: 0,
   counted: false,
   setting: false,
   tip: null,
   coachTaps: 0,
   t0: G.t,
   legacy: leg,
   picks205: pk ? pk.f.slice() : null,
   world: world205()
  };
  if (isSeason && !seasonActive()) G.practice.season = false;
  setup();
  return true;
 }
 const LEG_KIT205 = {
  jersey: '#7e4f2f',
  trim: '#ffcc33',
  helm: '#5a3a1e'
 };
 const UNIT205 = {
  O: [ [ 'M', 0 ], [ 'M', 1 ], [ 'M', 2 ], [ 'A', 0 ], [ 'A', 1 ], [ 'A', 2 ] ],
  D: [ [ 'SSDM' ], [ 'LSM' ], [ 'SSDM2' ], [ 'D', 0 ], [ 'D', 1 ], [ 'D', 2 ] ]
 };
 const uget = (lu, s) => s.length > 1 ? lu[s[0]][s[1]] : lu[s[0]];
 const uset = (lu, s, id) => {
  if (s.length > 1) lu[s[0]][s[1]] = id; else lu[s[0]] = id;
 };
 function host205() {
  if (world205()) return {
   tid: wgame.team,
   src: 'real'
  };
  if (seasonTeamOk()) return {
   tid: season.team,
   src: 'season'
  };
  return {
   tid: TEAMS.filter(t => !t.sz && !t.world)[0].id,
   src: 'real'
  };
 }
 function src205(k) {
  return k === 'SEASON' ? {
   tid: season.team,
   src: 'season'
  } : k === LEG ? host205() : {
   tid: k,
   src: 'real'
  };
 }
 function slots205(k) {
  const n = SET.drill === 'rides' ? 6 : SET.n;
  return k === LEG ? Math.min(n, legAvail205().length) : n;
 }
 function okPick205(k, id) {
  const p = PP(id);
  if (!p) return false;
  if (k === LEG) return legAvail205().includes(id);
  return !(k === 'SEASON' && injOf(id));
 }
 function roster205(k) {
  return k === LEG ? legPool205() : teamRosterIds(src205(k).tid, src205(k).src);
 }
 function keepers205(k) {
  const s = src205(k);
  return teamRosterIds(s.tid, s.src).filter(id => PP(id) && !(s.src === 'season' && injOf(id)));
 }
 function sortKey205(side) {
  return side === 'D' ? 'def' : 'fin';
 }
 function auto205(k, side) {
  const s = src205(k), lu = lineupFor(s.tid, s.src), n = slots205(k), u = UNIT205[side];
  if (k === LEG) {
   const kk = sortKey205(side);
   return {
    f: legAvail205().map(PP).sort((a, b) => b.r[kk] - a.r[kk] || b.ovr - a.ovr).slice(0, n).map(p => p.id),
    g: lu.G
   };
  }
  return {
   f: u.map(sl => uget(lu, sl)).slice(0, n),
   g: lu.G
  };
 }
 function picks205(k, side) {
  const n = slots205(k), a = auto205(k, side), sv = (SET.picks205 || {})[k + '|' + side] || {}, ros = roster205(k), gk = keepers205(k);
  let g = sv.g && (k === LEG ? gk : ros).includes(sv.g) && okPick205(k === LEG ? '' : k, sv.g) ? sv.g : a.g;
  const f = [], used = new Set([ g ]);
  for (let i = 0; i < n; i++) {
   const v = sv.f && sv.f[i];
   if (v && ros.includes(v) && okPick205(k, v) && !used.has(v)) {
    f.push(v);
    used.add(v);
   } else f.push(null);
  }
  const pool = a.f.concat(ros.slice().sort((x, y) => PP(y).ovr - PP(x).ovr));
  for (let i = 0; i < n; i++) if (!f[i]) {
   const v = pool.find(id => id && ros.includes(id) && okPick205(k, id) && !used.has(id));
   if (v) {
    f[i] = v;
    used.add(v);
   }
  }
  if (!g || !gk.includes(g)) g = gk.find(id => !used.has(id)) || g;
  return {
   f: f.filter(Boolean),
   g: g
  };
 }
 function savePicks205(k, side, pk) {
  SET.picks205 = SET.picks205 || {};
  SET.picks205[k + '|' + side] = {
   f: pk.f.slice(),
   g: pk.g
  };
  saveSet();
 }
 function apply205(lu0, pk, side, tid, src) {
  const lu = JSON.parse(JSON.stringify(lu0)), u = UNIT205[side], other = UNIT205[side === 'O' ? 'D' : 'O'];
  lu.G = pk.g;
  pk.f.forEach((id, i) => {
   const j = u.findIndex(sl => uget(lu, sl) === id);
   if (j >= 0 && j !== i) uset(lu, u[j], uget(lu, u[i]));
   uset(lu, u[i], id);
  });
  const pool = teamRosterIds(tid, src).filter(id => PP(id));
  for (const unit of [ u, other ]) {
   const seen = new Set([ lu.G ]);
   unit.forEach((sl, i) => {
    const id = uget(lu, sl);
    if (seen.has(id) || !PP(id)) {
     const alt = pool.find(x => !seen.has(x) && !unit.some(s2 => uget(lu, s2) === x));
     if (alt) uset(lu, sl, alt);
    }
    seen.add(uget(lu, sl));
   });
  }
  return lu;
 }
 let PS205 = null;
 function openPick205() {
  if (!on205()) return start();
  saveSet();
  const k = curTeam(), pk = picks205(k, SET.side);
  PS205 = {
   k: k,
   side: SET.side,
   sel: 0,
   f: pk.f,
   g: pk.g
  };
  screen = 'prac205';
  panelDirty();
 }
 function lastN205(p) {
  try {
   return lastName(p);
  } catch (e) {
   return p.n;
  }
 }
 function render205() {
  const S = PS205;
  if (!S) return '';
  const k = S.k, leg = k === LEG, s = src205(k), tm = T(s.tid), side = S.side, n = slots205(k), rides = SET.drill === 'rides';
  const lab = i => 'GUY ' + (i + 1) + (i === 0 && !rides ? side === 'O' ? ' - HAS THE BALL' : ' - ON THE BALL' : '');
  const slot = (v, txt, id) => {
   const p = PP(id);
   return '<button type="button" class="slot' + (S.sel === v ? ' on' : '') + '" data-a="p205slot" data-v="' + v + '" aria-label="' + esc(txt) + '"><small>' + esc(txt) + '</small>' + (p ? esc(lastN205(p)) + ' ' + p.ovr : '-') + '</button>';
  };
  const slotHtml = S.f.map((id, i) => slot(i, lab(i), id)).join('') + slot('G', 'GOALIE' + (leg ? ' (' + tm.name + ')' : ''), S.g);
  const isG = S.sel === 'G', key = isG ? [ 'sav', 'stk', 'spd' ] : side === 'D' ? [ 'def', 'gb', 'spd' ] : [ 'fin', 'acc', 'pow' ];
  const ids = isG ? leg ? keepers205(k) : roster205(k) : roster205(k);
  const where = id => {
   const i = S.f.indexOf(id);
   return i >= 0 ? 'GUY ' + (i + 1) : id === S.g ? 'G' : '';
  };
  const rows = ids.map(PP).filter(Boolean).sort((a, b) => b.r[key[0]] - a.r[key[0]] || b.ovr - a.ovr).map(p => {
   const ok = isG ? okPick205(leg ? '' : k, p.id) : okPick205(k, p.id), cur = isG ? S.g === p.id : S.f[S.sel] === p.id, w = where(p.id);
   const tag = !ok ? leg ? ' <span class="inj">LOCKED</span>' : ' <span class="inj">INJ</span>' : '';
   return '<tr' + (ok ? ' data-a="p205pick" data-v="' + p.id + '"' : ' style="opacity:.4"') + ' class="' + (cur ? 'sel' : w ? 'pick' : '') + '" data-pid="' + p.id + '"><td>' + posTag(p) + '</td><td class="n">' + (p.real ? '<span class="star">&#9733;</span> ' : '') + esc(p.n) + tag + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td>' + key.map(kk => '<td class="' + rc(p.r[kk]) + '">' + p.r[kk] + '</td>').join('') + '<td class="dim2">' + esc(w) + '</td></tr>';
  }).join('');
  const sub = leg ? na22() ? 'YOUR LEGACY CARDS (' + legOwned205().length + '/' + legAll205().length + ') + ALL THE CUSTOM GUYS - TAP A SPOT, THEN A PLAYER' : n ? 'YOUR LEGACY CARDS ONLY (' + legOwned205().length + '/' + legAll205().length + ') - TAP A SPOT, THEN A PLAYER' : 'NO LEGACY CARDS YET - FIND THEM IN CARD PACKS + THE GAME PASS' : 'WHO PRACTICES - TAP A SPOT, THEN A PLAYER';
  const right = btn('AUTO', 'p205auto', null, 'd') + btn('START PRACTICE', 'p205go', null, 'y', !S.f.length) + btn('BACK', 'p205back', null, 'g');
  const head = leg ? '<div class="hd"><div><div class="tt" style="color:#ffcc33">' + (na22() ? 'N/A' : 'LEGACY') + '</div><div class="st">' + esc(sub) + '</div></div><div class="sp"></div>' + right + '</div>' : teamHead(tm, sub, right);
  const note = rides && leg && n < 6 ? '<div class="note">' + esc(drillName('rides', side) + ': THE REST OF THE FIELD IS ' + tm.name) + '</div>' : '';
  return head + note + '<div class="cols"><div class="slots">' + slotHtml + '</div><div class="scroll" id="p205List"><table><tr><th>POS</th><th class="n">' + esc(isG ? 'GOALIE' : lab(S.sel)) + '</th><th>OVR</th>' + key.map(kk => '<th>' + kk.toUpperCase() + '</th>').join('') + '<th></th></tr>' + rows + '</table></div></div>';
 }
 function pick205(v) {
  const S = PS205;
  if (!S) return;
  const k = S.k;
  if (S.sel === 'G') {
   if (!okPick205(k === LEG ? '' : k, v)) return;
   const i = S.f.indexOf(v);
   if (i >= 0) {
    if (k === LEG) return;
    S.f[i] = S.g;
   }
   S.g = v;
  } else {
   if (!okPick205(k, v)) return;
   const i = S.f.indexOf(v), cur = S.f[S.sel];
   if (i === S.sel) return;
   if (i >= 0) S.f[i] = cur; else if (v === S.g) S.g = cur;
   S.f[S.sel] = v;
  }
  savePicks205(k, S.side, S);
 }
 if (typeof PANEL_SCREENS !== 'undefined') {
  PANEL_SCREENS.push('prac205');
  PANEL_RENDER.prac205 = render205;
  Object.assign(PANEL_ACT, {
   p205slot(v) {
    if (PS205) PS205.sel = v === 'G' ? 'G' : clamp(+v || 0, 0, Math.max(0, PS205.f.length - 1));
   },
   p205pick(v) {
    pick205(v);
   },
   p205auto() {
    if (!PS205) return;
    const a = auto205(PS205.k, PS205.side);
    PS205.f = a.f;
    PS205.g = a.g;
    savePicks205(PS205.k, PS205.side, PS205);
   },
   p205go() {
    if (PS205 && PS205.f.length) {
     savePicks205(PS205.k, PS205.side, PS205);
     start();
    }
   },
   p205back() {
    screen = 'prac18';
   }
  });
 }
 function ghostify(G) {
  let i = 0;
  for (const p of G.players) if (p.team === 'D' && p.pl && !p.pl.gh18) {
   p.pl = Object.assign({}, p.pl, {
    n: 'GHOST',
    gh18: true,
    real: false
   });
   p.gh18 = ++i;
  }
  for (const f of G.farC || []) if (f.pl && !f.pl.gh18 && f.role !== 'G') f.pl = Object.assign({}, f.pl, {
   n: 'GHOST',
   gh18: true,
   real: false
  });
 }
 function trim(G, P) {
  const O = P.side === 'O', b = G.ball || {
   x: MIDX,
   y: CY
  };
  const dist = p => Math.hypot(p.x - b.x, p.y - b.y);
  const mine = G.players.filter(p => p.team === 'O'), theirs = G.players.filter(p => p.team === 'D');
  const aU = O ? G.carrier : G.dctl, aC = O ? theirs.find(d => d.mark === G.carrier) || null : G.dcar;
  const pk = P.picks205 ? new Set(P.picks205) : null, isPk = p => pk && p.pl && pk.has(p.pl.id) ? 1 : 0;
  const keepU = [ aU ].filter(Boolean).concat(mine.filter(p => p !== aU).sort((p, q) => isPk(q) - isPk(p) || dist(p) - dist(q))).slice(0, P.n);
  const nC = O ? P.ghosts : Math.max(1, P.ghosts);
  const pref = O ? theirs.filter(d => keepU.includes(d.mark)) : theirs.filter(a => keepU.some(d => d.mark === a));
  const keepC = [ aC ].filter(Boolean).concat(pref.filter(p => p !== aC).sort((p, q) => dist(p) - dist(q)), theirs.filter(p => p !== aC && !pref.includes(p)).sort((p, q) => dist(p) - dist(q))).slice(0, nC);
  for (const p of mine) if (!keepU.includes(p)) dropPlayer(p);
  for (const p of theirs) if (!keepC.includes(p)) dropPlayer(p);
  for (const p of G.players) {
   if (p.mark && !p.mark.ghost && !G.players.includes(p.mark)) p.mark = null;
   if (p.mark0 && !G.players.includes(p.mark0)) p.mark0 = null;
   if (!p.mark && p.team === 'D' && O) p.mark = {
    x: GX - 22,
    y: CY,
    ghost: true
   };
   if (!p.mark && p.team === 'O' && !O) p.mark = {
    x: DGX + 22,
    y: CY,
    ghost: true
   };
  }
  if (G.farU) G.farU = G.farU.filter(f => f.role === 'G');
  if (G.farC) G.farC = G.farC.filter(f => f.role === 'G');
  if (G.chasers) G.chasers = G.chasers.filter(p => G.players.includes(p));
  if (!O && G.dctl && !G.players.includes(G.dctl)) G.dctl = G.players.find(p => p.team === 'O') || null;
 }
 function setup() {
  const G = game, P = G && G.practice;
  if (!P) return;
  P.setting = true;
  P.sawLoose = false;
  P.sawClear = false;
  P.repT = 0;
  P.ending = false;
  fx = fx.filter(f => f.type !== 'cue');
  G.banner = null;
  G.pen = null;
  G.penPending = null;
  G.camHold = null;
  G.over = false;
  G.brave = false;
  G.ot = false;
  G.clock = G.qlen || 300;
  G.shotClock = SHOT_CLOCK;
  try {
   const d = P.drill, O = P.side === 'O', full = d === 'rides';
   if (O) {
    if (d === 'shoot') {
     setupPossession(GX - rnd(70, 105), CY + rnd(-38, 38));
     G.run = null;
    } else if (d === 'dodge') {
     setupPossession(GX - 135, CY + rnd(-20, 20));
     G.run = null;
    } else if (d === 'gb') {
     setupPossession(GX - rnd(130, 170), CY + rnd(-30, 30));
     G.run = null;
    } else if (d === 'rides') {
     setupPossession();
     const b = G.ball;
     b.x = GX - 26;
     b.y = CY + rnd(-22, 22);
     b.state = 'held';
     if (!startDefenseLive()) startDefense({
      x: MIDX + 60,
      y: CY
     });
    } else setupPossession();
    if (!full) trim(G, P);
    if (d === 'dodge') {
     const c = G.carrier, dd = G.players.find(p => p.team === 'D' && p.mark === c);
     if (c && dd) {
      dd.x = c.x + 14;
      dd.y = c.y;
      dd.tx = dd.x;
      dd.ty = dd.y;
      dd.react = .5;
     }
    }
    if (d === 'gb') {
     const c = G.carrier;
     popLoose(c.x + BX + 12, c.y + 1, rnd(30, 45), rnd(-16, 16), 'check');
     for (const q of G.chasers || []) q.gbReact = (q.gbReact || .4) + .25;
    }
   } else {
    if (d === 'shoot') {
     startDefense({
      x: DGX + rnd(62, 90),
      y: CY + rnd(-34, 34)
     });
     G.dDecide = rnd(.35, .7);
    } else if (d === 'dodge') {
     startDefense({
      x: DGX + rnd(95, 120),
      y: CY + rnd(-25, 25)
     });
    } else if (d === 'rides') {
     startDefense();
     const gk = G.gk2, b = G.ball;
     b.x = gk.x + 5;
     b.y = gk.y - 16;
     startClear(gk, 'SAVE! CLEAR IT - BEAT THE RIDE!');
    } else startDefense();
    if (!full) trim(G, P);
    if (d === 'dodge') {
     const c = G.dcar, dd = G.dctl;
     if (c && dd) {
      dd.x = c.x - 12;
      dd.y = c.y;
      G.dDecide = rnd(1.6, 2.4);
     }
    }
    if (d === 'gb') {
     const c = G.dcar || G.players.find(p => p.team === 'D');
     if (c) dPopLoose(c.x - 14, c.y, rnd(-45, -30), rnd(-14, 14), 'check');
    }
   }
   ghostify(G);
   applyScheme181(P);
   if (G.ok !== GHOST_KIT) G.ok = Object.assign({}, GHOST_KIT);
   G.shotClock = SHOT_CLOCK;
   G.ruleGrace = 99;
   G.checkT = -1.5;
  } catch (e) {
   console.error(e);
   P.err = String(e && e.message || e);
  }
  P.setting = false;
  P.setups = (P.setups || 0) + 1;
  addFx('cue', 0, 0, {
   s: drillName(P.drill, P.side) + (P.side === 'O' ? ' - OFFENSE' : ' - DEFENSE'),
   col: '#7dff7a',
   life: 1
  });
 }
 function statLine(P) {
  const G = game;
  if (P.drill === 'shoot' || P.drill === 'free' && P.side === 'O') return 'GOALS ' + P.goals + '  SHOTS ' + (G && G.stats && G.stats.shots || 0);
  if (P.drill === 'dodge' && P.side === 'O') return 'DODGES ' + Math.max(0, G.dodges || 0) + '  GOALS ' + P.goals;
  return (P.side === 'D' ? 'STOPS ' : 'WON ') + P.wins + ' OF ' + P.reps;
 }
 function repEnd(win, msg) {
  const G = game, P = G && G.practice;
  if (!P || P.ending) return;
  P.ending = true;
  P.reps++;
  if (win) P.wins++;
  G.banner = {
   txt: msg || (win ? 'NICE!' : 'RUN IT BACK'),
   sub: statLine(P),
   kind: 'prac18'
  };
  G.bannerT = 0;
  G.bannerAuto = 1.1;
  screen = 'banner';
  stick = null;
  shootP = null;
  G.run = null;
  try {
   win ? SFX.cheer() : SFX.whistle();
  } catch (e) {}
 }
 function judge(k, P) {
  const O = P.side === 'O', d = P.drill;
  if (k === 'goal') P.goals++;
  if (O) {
   if (d === 'rides') return k !== 'cgoal';
   if (d === 'gb') return k === 'ours' || k === 'keep';
   return k === 'goal';
  }
  if (d === 'rides' || d === 'gb') return false;
  return k !== 'cgoal';
 }
 function mainPlayer(P) {
  let best = null, bt = 0;
  for (const id in P.ctl) if (P.ctl[id] > bt) {
   bt = P.ctl[id];
   best = id;
  }
  return best;
 }
 function applyBoost(P) {
  const S = season, d = pracData(S);
  if (!d || !P.before) return;
  const b = Object.assign({}, P.before), main = mainPlayer(P), ids = teamRosterIds(S.team, 'season').filter(id => PP(id));
  for (const id of ids) b[id] = Math.min(CAP, (b[id] || 0) + (id === main ? 2 : 1));
  d.b = b;
  P.main = main;
  LS.set('season', S);
 }
 function countSession(G, P) {
  if (P.counted) return;
  if (!P.season || !seasonActive() || season.team !== P.team) {
   P.counted = 'none';
   return;
  }
  const d = pracData(season);
  if (d.n >= MAX_GAP) {
   P.counted = 'max';
   addFx('cue', 0, 0, {
    s: 'BOOSTS MAXED (2/2) - PLAY YOUR NEXT GAME',
    col: '#ffb14d',
    life: 2.2
   });
   return;
  }
  P.before = Object.assign({}, d.b);
  d.n++;
  P.counted = 'yes';
  P.sess = d.n;
  applyBoost(P);
  BOOST = boostFor14(season);
  addFx('cue', 0, 0, {
   s: 'PRACTICE COUNTED! BOOST ' + d.n + '/' + MAX_GAP,
   col: '#7dff7a',
   life: 2.2
  });
 }
 function exit() {
  const G = game, P = G && G.practice;
  if (P) {
   if (P.counted === 'yes') {
    try {
     applyBoost(P);
    } catch (e) {
     console.error(e);
    }
   }
   const nm = P.main && PP(P.main) ? lastName(PP(P.main)).toUpperCase() : '';
   MSG = P.counted === 'yes' ? {
    s: 'SESSION COUNTED (BOOST ' + P.sess + '/' + MAX_GAP + ')' + (nm ? ' - ' + nm + ' +2' : ''),
    c: '#7dff7a'
   } : P.counted === 'max' ? {
    s: 'ALREADY 2/2 - PLAY YOUR NEXT SEASON GAME',
    c: '#ffb14d'
   } : P.season && seasonActive() ? {
    s: 'PLAY 60 SEC FOR A SESSION TO COUNT',
    c: '#ffb14d'
   } : null;
  }
  paused = false;
  game = null;
  BOOST = null;
  screen = 'prac18';
 }
 const prac = () => game && game.practice;
 const running = () => {
  const P = prac();
  return !!P && !P.setting && !P.ending;
 };
 const wrap = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return;
  window[n] = function() {
   return f.call(this, o, arguments);
  };
 };
 [ 'startCpu', 'startFaceoff', 'endQuarter', 'finishGame', 'resumeOurs', 'cpuTakeover', 'startDefense', 'startDefenseLive', 'setupPossession' ].forEach(n => wrap(n, function(o, a) {
  if (!prac()) return o.apply(this, a);
  const P = prac();
  if (P.setting) return o.apply(this, a);
  if (P.ending) return n === 'startDefenseLive' ? true : undefined;
  const O = P.side === 'O';
  if (n === 'setupPossession' && !O && P.drill === 'rides') {
   repEnd(true, 'CLEARED IT!');
   return;
  }
  if (n === 'setupPossession' && !O) {
   repEnd(true, 'STOP! NICE D');
   return;
  }
  repEnd(O && P.drill === 'rides' ? false : !O && P.drill !== 'rides' && P.drill !== 'gb', O ? P.drill === 'rides' ? 'THEY GOT IT BACK' : 'TURNOVER' : P.drill === 'gb' ? 'THEY GOT IT' : 'STOP!');
  return n === 'startDefenseLive' ? true : undefined;
 }));
 wrap('toOffense', function(o, a) {
  const P = prac();
  if (!P || P.setting) return o.apply(this, a);
  if (P.ending) return;
  if (P.side === 'D' && P.drill === 'rides') return o.apply(this, a);
  if (P.side === 'O') return repEnd(P.drill === 'rides', P.drill === 'rides' ? 'RIDE WON - YOUR BALL!' : 'YOUR BALL');
  return repEnd(true, P.drill === 'gb' ? 'GROUND BALL!' : 'STOP! NICE D');
 });
 wrap('liveClear', function(o, a) {
  const P = prac();
  if (!P || P.setting || P.side === 'O' || P.drill === 'rides') return o.apply(this, a);
  if (!P.ending) repEnd(true, P.drill === 'gb' ? 'GROUND BALL!' : 'STOP! NICE D');
  return true;
 });
 wrap('afterBanner', function(o, a) {
  const G = game, P = prac();
  if (!P) return o.apply(this, a);
  const k = G.banner && G.banner.kind;
  if (k !== 'prac18' && !P.ending) {
   P.reps++;
   if (judge(k, P)) P.wins++;
  }
  if (k === 'goal' && !P.ending) {
   G.score[0] = 0;
  }
  G.score = [ 0, 0 ];
  setup();
 });
 [ 'endPossession', 'dEnd' ].forEach(n => wrap(n, function(o, a) {
  const r = o.apply(this, a);
  const G = game;
  if (G && G.practice && screen === 'banner' && G.banner && G.banner.kind !== 'prac18') G.bannerAuto = Math.min(G.bannerAuto || 1.9, 1.3);
  return r;
 }));
 wrap('ruleCall', function(o, a) {
  const P = prac();
  if (!P) return o.apply(this, a);
  if (P.drill === 'rides' && !P.setting && (a[0] === 'CLEAR COUNT' || a[0] === 'OVER AND BACK')) return o.apply(this, a);
  return false;
 });
 [ 'penaltyRoll', 'dPenaltyRoll', 'cpuTimeoutMaybe', 'canTimeout' ].forEach(n => wrap(n, function(o, a) {
  return prac() ? false : o.apply(this, a);
 }));
 [ 'foulTick', 'ruleCheck', 'v14Tick', 'injuryTick' ].forEach(n => wrap(n, function(o, a) {
  return prac() ? undefined : o.apply(this, a);
 }));
 wrap('foulCall', function(o, a) {
  return prac() ? false : o.apply(this, a);
 });
 wrap('v14Hit', function(o, a) {
  const G = game;
  if (!G || !G.practice) return o.apply(this, a);
  const k = V14(G), cp = k.concPend, fp = k.fightPend;
  const r = o.apply(this, a);
  k.concPend = cp || null;
  k.fightPend = fp || null;
  return r;
 });
 wrap('v14PreBanner', function(o, a) {
  return prac() ? false : o.apply(this, a);
 });
 wrap('step', function(o, a) {
  const r = o.apply(this, a);
  try {
   const G = game;
   if (G && G.practice && !paused) tick(a[0] || 0);
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 function tick(dt) {
  const G = game, P = G.practice;
  if (!dt) return;
  G.clock = Math.max(G.clock, 1);
  G.shotClock = Math.max(G.shotClock, 5);
  G.ruleGrace = Math.max(G.ruleGrace || 0, 1);
  if (P.tip) {
   P.tip.t -= dt;
   if (P.tip.t <= 0) P.tip = null;
  }
  if (![ 'live', 'defense', 'banner', 'faceoff' ].includes(screen) && !P.setting) {
   if (screen === 'pregame' || screen === 'qbreak' || screen === 'cpu' || screen === 'final' || screen === 'scene') setup();
   return;
  }
  if (screen === 'faceoff') {
   setup();
   return;
  }
  if (screen !== 'live' && screen !== 'defense') return;
  P.playT += dt;
  P.repT += dt;
  const b = G.ball;
  let who = null;
  if (screen === 'live') who = b && b.state === 'held' && G.carrier && G.carrier.team === 'O' ? G.carrier : G.ctrl; else who = G.dctl;
  if (who && who.pl && !who.pl.gh18 && who.team === 'O') P.ctl[who.pl.id] = (P.ctl[who.pl.id] || 0) + dt;
  if (!P.counted && P.playT >= COUNT_SECS) countSession(G, P);
  if (!P.xp232 && P.playT >= COUNT_SECS && window.V232) {
   P.xp232 = 1;
   V232.pracXp(G, P);
  }
  if (P.ending || P.setting) return;
  const O = P.side === 'O', d = P.drill;
  if (b && b.state !== 'held') P.sawLoose = true;
  if (O && d === 'gb' && screen === 'live' && P.sawLoose && b.state === 'held' && G.carrier && G.carrier.team === 'O') return repEnd(true, 'GROUND BALL!');
  if (!O && d === 'gb' && screen === 'defense' && P.sawLoose && b.state === 'held' && G.dcar) return repEnd(false, 'THEY GOT IT');
  if (O && d === 'rides') {
   if (G.cpuClear) P.sawClear = true; else if (P.sawClear && screen === 'defense') return repEnd(false, 'THEY CLEARED IT');
  }
  if (!O && d === 'rides') {
   if (screen === 'live' && G.clearing) {
    P.sawClear = true;
    P.overT = 0;
   } else if (P.sawClear && screen === 'live' && !G.clearing) {
    if (P.overT === 0) addFx('txt', G.carrier ? G.carrier.x : MIDX, (G.carrier ? G.carrier.y : CY) - 30, {
     s: 'CLEARED! KEEP GOING',
     col: '#7dff7a',
     life: 1.2
    });
    P.overT = (P.overT || 0) + dt;
    if (P.overT >= 3) return repEnd(true, 'CLEARED IT!');
   }
  }
  if (P.repT > 45 && d !== 'free') {
   P.repT = 0;
   return repEnd(false, 'RESET');
  }
 }
 window.prac18Ghost = function(p) {
  const G = game;
  return !!(G && G.practice && p && (p.team === 'D' || p.far && p.team === 'C' && p.role !== 'G'));
 };
 const TIPS = {
  O: [ [ 'MOVE', 'LEFT THUMB DOWN ANYWHERE + DRAG = HE RUNS. LET GO = STOP.' ], [ 'DODGE', 'RUN, THEN CUT YOUR THUMB HARD ANOTHER WAY = A DODGE.' ], [ 'SPLIT DODGE', 'WITH THE BALL: SWIPE STRAIGHT ON THE RIGHT SIDE = SPLIT THAT WAY.' ], ...window.__rl_v124gb || window.__rl_no28 || window.__rl_no28moves ? [ [ 'ROLL DODGE', 'DRAW A C ON THE RIGHT SIDE = ROLL THE WAY YOU CURVE.' ] ] : [ [ 'ROLL DODGE', 'RUN, THEN DRAW A C WITH THE LEFT STICK = ROLL.' ], [ 'SWIM MOVE', 'WITH THE BALL: DRAW A BACKWARDS C ON THE RIGHT SIDE = SWIM PAST HIM.' ], [ 'TOE DRAG', 'WITH THE BALL: DRAW A C ON THE RIGHT SIDE = TOE DRAG PAST HIM.' ], [ 'OVER THE SHOULDER', 'UP FROM X TO GLE, TOUCH THE GOAL + PULL BACK = OVER-THE-SHOULDER SHOT.' ] ], [ 'BULL DODGE', 'HOLD YOUR RIGHT THUMB DOWN = BULL THROUGH HIM.' ], [ 'SHOOT', 'HOLD A CORNER OF THE GOAL, RING FILLS, LET GO = SHOT.' ], [ 'PASS', 'QUICK TAP A TEAMMATE. GREEN RING = OPEN.' ], [ 'PICK', 'HOLD YOUR THUMB ON A TEAMMATE = HE COMES OVER + SETS A PICK.' ], [ 'CUT', 'SWIPE FROM A TEAMMATE = HE CUTS HARD THAT WAY. THEN HIT HIM.' ], [ 'GROUND BALL', 'RUN YOUR GUY (BLUE RING) OVER THE BALL TO SCOOP IT.' ] ],
  D: [ [ 'MOVE', 'LEFT THUMB = MOVE YOUR DEFENDER.' ], [ 'CHECK', 'GET ON HIM (YELLOW DOTS) + TAP THE RIGHT SIDE. 3 CHECKS = IT POPS.' ], [ 'BIG HIT', 'RUN AT HIM, HOLD THE RIGHT SIDE, LET GO. LONGER RUN = HARDER.' ], [ 'SWITCH', 'TAP ANY OF YOUR DEFENDERS = YOU CONTROL HIM.' ], [ 'SLIDE', 'HE BEAT HIS MAN? THE FLAME GUY IS YOUR HOT SLIDER.' ], [ 'GROUND BALL', 'RUN AT THEIR GUY, HOLD THE RIGHT SIDE, LET GO = LEVEL HIM.' ], [ 'CLEAR', 'YOUR BALL: TAP AN OPEN TEAMMATE (GREEN RING) TO CLEAR IT.' ] ]
 };
 const DRILL_TIP = {
  O: {
   free: 'FREE PLAY: RUN YOUR OFFENSE. NO CLOCK - TAKE YOUR TIME.',
   shoot: 'SHOOTING: HOLD A CORNER, LET GO HARD. LOW CORNERS BEAT KEEPERS.',
   dodge: 'DODGING: CUT HARD WHEN HE IS CLOSE - A FAST CUT CAN BREAK ANKLES.',
   gb: 'GROUND BALLS: GET YOUR BLUE-RING GUY TO THE BALL FIRST.',
   rides: 'RIDES: THEY CLEAR IT. CHECK THE CARRIER, BIG HIT HIM, MAKE THEM MISS THE 10.'
  },
  D: {
   free: 'FREE PLAY: PLAY D ON THE GHOSTS. A STOP = RUN IT BACK.',
   shoot: 'SHOOTING: THEY SHOOT FAST - GET ON THE SHOOTER, HANDS UP.',
   dodge: 'DODGING: STAY IN FRONT OF HIM. CHECK WHEN HE GETS CLOSE.',
   gb: 'GROUND BALLS: BEAT THE GHOSTS TO IT - LEVEL ONE IF HE GETS THERE FIRST.',
   rides: 'CLEARS: BEAT THEIR RIDE - TAP AN OPEN GUY, CARRY IT OVER MIDFIELD IN 10.'
  }
 };
 function coachTap() {
  const G = game, P = G && G.practice;
  if (!P) return;
  const list = TIPS[P.side], k = P.coachTaps++;
  P.tip = k === 0 ? {
   title: 'COACH',
   s: DRILL_TIP[P.side][P.drill],
   t: 6
  } : (() => {
   const tp = list[(k - 1) % list.length];
   return {
    title: tp[0],
    s: tp[0] === 'CHECK' && !window.__rl_no2403 && !window.__rl_v124gb ? 'GET ON HIM + TAP THE RIGHT SIDE. MIDDLE: 1 CHECK POPS IT. OUTSIDES: 2.' : tp[1],
    t: 6
   };
  })();
  P.tips = (P.tips || 0) + 1;
 }
 function drawCoach() {
  const G = game, P = G.practice;
  if (!P || paused) return;
  const x = 18, y = H - 13;
  rect(x - 9, y - 14, 22, 26, 'rgba(0,0,0,.5)');
  rect(x - 9, y - 14, 22, 1, '#ffe14d');
  try {
   if (HAS12) {
    const X = x + 1, Y = y + 11;
    g.save();
    g.translate(X, Y);
    g.scale(.85, .85);
    g.translate(-X, -Y);
    try {
     RL12.draw(g, RL12.frame(P.tip ? 'coach_cheer' : 'coach_idle', menuT, P.tip ? 3 : 1.5), X, Y, G.uk, true, {
      skin: pickSkin('coach-' + T(G.user).id),
      shadow: false
     });
    } finally {
     g.restore();
    }
    P.coachFrames = (P.coachFrames || 0) + 1;
   }
  } catch (e) {}
  const bob = Math.floor(menuT * 2) % 2;
  rect(x + 6, y - 24 - bob, 26, 9, '#ffe14d');
  rect(x + 8, y - 15 - bob, 3, 2, '#ffe14d');
  text('COACH', x + 19, y - 22 - bob, 1, '#0b1a20', 'center');
  hit('COACH', x - 10, y - 28, 46, 40, coachTap, 'COACH');
  if (P.tip) {
   const w = Math.min(W - 20, Math.max(170, textW(P.tip.s) + 14)), cx = W / 2, y0 = 31;
   rect(cx - w / 2, y0, w, 22, 'rgba(0,0,0,.84)');
   rect(cx - w / 2, y0, w, 2, '#ffe14d');
   text(P.tip.title, cx, y0 + 4, 1, '#ffe14d', 'center');
   text(P.tip.s, cx, y0 + 13, 1, '#ffffff', 'center');
  }
 }
 function drawPracHud() {
  const G = game, P = G.practice;
  rect(0, 0, W, 17, '#0b0f14');
  rect(1, 1, 92, 15, G.uk.jersey);
  badge(T(G.user), 2, 1, 1);
  text('PRACTICE', 17, 3, 1, textOn(G.uk.jersey));
  text(P.season ? 'SEASON TEAM' : P.legacy ? na22() ? 'N/A' : 'LEGACY' : T(G.user).name, 17, 10, 1, textOn(G.uk.jersey) === '#ffffff' ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.55)');
  const cx = W / 2;
  text(drillName(P.drill, P.side) + (P.side === 'O' ? ' - O' : ' - D'), cx, 3, 1, '#ffd23a', 'center');
  text(statLine(P), cx, 10, 1, '#8fe3f0', 'center');
  if (P.season) {
   const n = gapN(), left = Math.max(0, COUNT_SECS - P.playT);
   const s = 'PRACTICE BOOST ' + n + '/' + MAX_GAP, s2 = P.counted === 'yes' ? 'COUNTED' : P.counted === 'max' ? 'MAXED' : Math.ceil(left) + 'S TO COUNT';
   const w = Math.max(textW(s), textW(s2)) + 8;
   rect(96, 1, w, 15, P.counted === 'yes' ? '#1f6b2a' : 'rgba(40,50,60,.95)');
   text(s, 96 + w / 2, 3, 1, '#7dff7a', 'center');
   text(s2, 96 + w / 2, 10, 1, '#ffffff', 'center');
  }
  button('EXIT', W - 46, 2, 42, 13, exit, {
   bg: '#ff8a7a'
  });
  if (P.drill !== 'rides' && GAME_SCREENS.includes(screen)) {
   const lab = (P.side === 'O' ? 'THEIR D: ' : 'THEIR O: ') + schemeNow181(P), sw = textW(lab) + 10;
   sbtn('SCHEME', lab, W - 50 - sw, 2, sw, 13, schemeTap181, {
    bg: '#8fe3f0'
   });
  }
  if (window.V463PZ && window.V463PZ.on()) {
   // v463pz: practice pause follows the game's top-left pause.
   const pb = window.V463PZ.box();
   if (GAME_SCREENS.includes(screen)) hit('PAUSE', pb.x, pb.y, pb.w, pb.h, () => {
    paused = true;
   });
   window.V463PZ.draw(pb);
  } else {
  const sy = typeof sa2403Dy === 'function' ? sa2403Dy(H - 10, 10) : 0;
  if (GAME_SCREENS.includes(screen)) hit('PAUSE', cx - 9, H - 10 - sy, 18, 10, () => {
   paused = true;
  });
  rect(cx - 7, H - 8 - sy, 14, 8, 'rgba(0,0,0,.55)');
  rect(cx - 3, H - 7 - sy, 2, 6, '#fff');
  rect(cx + 1, H - 7 - sy, 2, 6, '#fff');
  }
 }
 wrap('drawHUD', function(o, a) {
  if (prac()) return drawPracHud();
  return o.apply(this, a);
 });
 wrap('drawTimeoutBtn', function(o, a) {
  if (prac()) return;
  return o.apply(this, a);
 });
 wrap('render', function(o, a) {
  const r = o.apply(this, a);
  try {
   if (screen === 'prac18') drawSetup(); else if (game && game.practice && GAME_SCREENS.includes(screen) && !paused && !game.practice.tut26) drawCoach();
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 function sbtn(key, txt, x, y, w, h, fn, opt) {
  opt = opt || {};
  hit(key, x, y, w, h, fn, key);
  rect(x, y + 2, w, h, '#000');
  rect(x, y, w, h, opt.bg || '#c9d6d9');
  rect(x, y, w, 1, 'rgba(255,255,255,.35)');
  text(txt, x + w / 2, y + Math.round((h - 5) / 2), 1, opt.fg || '#0b1a20', 'center');
 }
 function drawSetup() {
  bgStripes(true);
  rect(0, 0, W, H, 'rgba(0,0,0,.35)');
  const cx = W / 2;
  text('PRACTICE', cx, 5, 2, '#7dff7a', 'center', '#000');
  const lx = 12, vx = 96, row = (y, label) => text(label, lx, y + 3, 1, '#ffe14d', 'left', '#000');
  const on = (b, c) => ({
   bg: b ? c || '#7dff7a' : '#5a6670',
   fg: b ? '#0b1a20' : '#cfe'
  });
  let y = 22;
  row(y, 'SIDE');
  button('OFFENSE', vx, y, 62, 11, () => {
   SET.side = 'O';
   saveSet();
  }, on(SET.side === 'O'));
  button('DEFENSE', vx + 66, y, 62, 11, () => {
   SET.side = 'D';
   saveSet();
  }, on(SET.side === 'D', '#ff9a8a'));
  y += 15;
  row(y, 'YOUR GUYS');
  sbtn('GUYS -', '-', vx, y, 16, 11, () => {
   SET.n--;
   saveSet();
  }, {
   bg: '#c9d6d9'
  });
  text(String(SET.n), vx + 30, y + 3, 1, '#fff', 'center');
  sbtn('GUYS +', '+', vx + 44, y, 16, 11, () => {
   SET.n++;
   saveSet();
  }, {
   bg: '#c9d6d9'
  });
  text('ON THE FIELD + YOUR GOALIE', vx + 66, y + 3, 1, '#8fe3f0');
  y += 15;
  row(y, 'GHOSTS');
  sbtn('GHOSTS -', '-', vx, y, 16, 11, () => {
   SET.ghosts--;
   saveSet();
  }, {
   bg: '#c9d6d9'
  });
  text(String(SET.ghosts), vx + 30, y + 3, 1, '#fff', 'center');
  sbtn('GHOSTS +', '+', vx + 44, y, 16, 11, () => {
   SET.ghosts++;
   saveSet();
  }, {
   bg: '#c9d6d9'
  });
  text(SET.side === 'O' ? 'GRAY D + A LIVE GOALIE' : 'GRAY ATTACK (1 HAS THE BALL)', vx + 66, y + 3, 1, '#8fe3f0');
  y += 15;
  row(y, 'TEAM');
  const tl = teamList(), k = curTeam(), ti = tl.indexOf(k);
  sbtn('TEAM <', '<', vx, y, 16, 11, () => {
   setTeam205(tl[(ti - 1 + tl.length) % tl.length]);
  }, {
   bg: '#c9d6d9'
  });
  text(teamLabel(k), vx + 22, y + 3, 1, k === 'SEASON' || world205() && k === wgame.team || mode29() && k === mode29().first ? '#ffd23a' : k === LEG ? '#ffcc33' : '#fff');
  sbtn('TEAM >', '>', Math.min(W - 26, vx + 30 + textW(teamLabel(k))), y, 16, 11, () => {
   setTeam205(tl[(ti + 1) % tl.length]);
  }, {
   bg: '#c9d6d9'
  });
  y += 15;
  row(y, 'DRILL');
  const dw = Math.floor((W - vx - 10 - 4 * 3) / 3);
  DRILLS.forEach(([id, nm], i) => {
   const c = i % 3, r = Math.floor(i / 3);
   nm = drillName(id, SET.side);
   button(nm, vx + c * (dw + 3), y + r * 14, dw, 11, () => {
    SET.drill = id;
    saveSet();
   }, on(SET.drill === id, '#ffd23a'));
  });
  y += 30;
  if (SET.drill === 'rides') text(drillName('rides', SET.side) + ' PLAY FULL FIELD (ALL 10 + GOALIES) - THE COUNTS ABOVE ARE FOR THE OTHER DRILLS', cx, y, 1, '#ff9a4a', 'center');
  y += 10;
  const bl = k === 'SEASON' ? 'PRACTICE BOOST ' + gapN() + '/' + MAX_GAP + ' - 60 SEC = 1 SESSION. +1 OVR TEAM, +2 THE GUY YOU CONTROL MOST' : season && seasonActive() ? 'BOOSTS ONLY COUNT WITH YOUR SEASON TEAM' : 'BOOSTS: PRACTICE WITH YOUR SEASON TEAM DURING A SEASON';
  text(bl, cx, y, 1, k === 'SEASON' ? '#7dff7a' : '#c9d6d9', 'center');
  if (MSG) text(MSG.s, cx, y + 9, 1, MSG.c || '#ffb14d', 'center');
  button('START PRACTICE', cx - 70, H - 30, 140, 18, openPick205, {
   sc: 1,
   bg: '#7dff7a'
  });
  button('BACK', 8, H - 26, 44, 14, () => {
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
 }
 window.PRAC18 = {
  teams: teamList,
  mode29: mode29,
  cur: curTeam,
  open: open,
  start: start,
  setup: setup,
  openPick: openPick205,
  picks: picks205,
  autoPicks: auto205,
  legOwned: legOwned205,
  world: world205,
  get pick() {
   return PS205;
  },
  exit: exit,
  coachTap: coachTap,
  SET: SET,
  saveSet: saveSet,
  repEnd: repEnd,
  boostMap: boostMap,
  boostOvr: boostOvr,
  gapN: gapN,
  pracData: pracData,
  seasonActive: seasonActive,
  gamesPlayed: gamesPlayed,
  countSession: countSession,
  mainPlayer: mainPlayer,
  CAP: CAP,
  MAX_GAP: MAX_GAP,
  COUNT_SECS: COUNT_SECS,
  TIPS: TIPS,
  DRILL_TIP: DRILL_TIP,
  get msg() {
   return MSG;
  }
 };
})();
