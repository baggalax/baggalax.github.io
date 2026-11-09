'use strict';
var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());


(function() {
 const FISH = () => !!window.__rl_v124gb;
 const on = k => !window['__rl_no232' + k] && !FISH();
 const V = window.V232 = {
  on: on
 };
 const SET = Object.assign({
  crew: true,
  lg: 'ALL',
  na: false,
  base: false,
  items: true
 }, LS.get('set232', {}) || {});
 const saveSet = () => LS.set('set232', SET);
 V.SET = SET;
 const yn = v => v === true ? 'YES' : v === false ? 'NO' : '-';
 const ynCol = v => v === true ? '#7dff7a' : v === false ? '#ff9a4a' : '#7f9aa6';
 const tap = () => {
  try {
   SFX.tap();
  } catch (e) {}
 };
 const clearHeld = G => screen === 'defense' && !!G.dclear && !!G.ball && G.ball.state === 'clear';
 const can0 = window.canTimeout;
 window.canTimeout = function() {
  const r = can0.apply(this, arguments);
  if (r || !on('t')) return r;
  const G = game;
  if (!G || G.tutorial || G.over || !(G.tos[0] > 0) || shootP || G.readyT > 0) return false;
  const R = window.RLNET;
  if (R && R.inGame && (window.__rl_no2318d || !R.auth || G.toHold18 || G.toReq18 && performance.now() - G.toReq18 < 4e3)) return false;
  return clearHeld(G);
 };
 const call0 = window.callTimeout;
 window.callTimeout = function() {
  const G = game, clr = on('t') && !!G && clearHeld(G), r = call0.apply(this, arguments);
  if (r && clr && G.toCtx) G.toCtx.clear232 = {
   holder: G.dclear && G.dclear.holder,
   cc: G.cc ? G.cc.t : null
  };
  return r;
 };
 const res0 = window.resumeFromTimeout;
 window.resumeFromTimeout = function() {
  const G = game, X = G && G.toCtx && G.toCtx.clear232;
  const r = res0.apply(this, arguments);
  if (X && G && screen === 'defense') {
   if (!G.dclear && X.holder && G.players.includes(X.holder)) {
    G.dclear = {
     holder: X.holder,
     t: 0
    };
    G.ball.state = 'clear';
   }
   if (X.cc != null && G.cc) G.cc.t = X.cc;
   G.to232 = (G.to232 || 0) + 1;
  }
  return r;
 };
 const BRAID = new Set([ 'garrett wickliffe', 'arthur marsden' ]);
 const BRAID32 = new Set([ 'bruno ansley', 'jarrett morrow', 'noah hilliard', 'jace fairweather' ]);
 const isBraid = pl => {
  if (!pl) return false;
  const k = String((pl.n0 != null ? pl.n0 : pl.n) || '').toLowerCase().trim();
  return BRAID.has(k) || !window.__rl_no32br && BRAID32.has(k);
 };
 V.isBraid = isBraid;
 V.BRAID = BRAID;
 const b0 = window.braidOf21;
 window.braidOf21 = function(pl) {
  return b0.apply(this, arguments) || on('b') && !window.__rl_no21 && isBraid(pl);
 };
 V.cardBraid = function(x, p, n, ax, ay) {
  if (!on('b') || window.__rl_no21 || !isBraid(p)) return;
  const s = braidSpot21(n);
  if (!s) return;
  const hair = [ '#1a120c', '#2a1b10', '#120d0a', '#33241a' ][seedOf('braid:' + p.id) % 4], lit = mixc21(hair, '#ffffff', .18), X = q => ax - s.f0 + q, Y = r => ay - s.f1 + r;
  const fr = window.braidFront2402 ? braidFront2402(n) : null;
  if (fr) {
   const cw = x.canvas.width, chh = x.canvas.height, a = x.getImageData(0, 0, cw, chh).data;
   for (const [q, r, col] of braidFrontPx2402(fr, hair, lit)) {
    const xx = X(q), yy = Y(r);
    if (xx < 0 || xx >= cw || yy < 0 || yy >= chh || a[(yy * cw + xx) * 4 + 3]) continue;
    x.fillStyle = col;
    x.fillRect(xx, yy, 1, 1);
   }
   return;
  }
  for (let i = 0; i < 6; i++) {
   const q = s.x - (i >= 3 ? 1 : 0);
   x.fillStyle = i % 2 ? lit : hair;
   x.fillRect(X(q), Y(s.y + i), 1, 1);
   x.fillStyle = i % 2 ? hair : lit;
   x.fillRect(X(q + 1), Y(s.y + i), 1, 1);
  }
  x.fillStyle = '#c9a46b';
  x.fillRect(X(s.x - 1), Y(s.y + 6), 1, 1);
 };
 const dayKey = () => {
  const d = new Date;
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
 };
 V.pracXp = function(G, P) {
  if (!on('x') || !G || G.tutorial || G.mode === 'tutorial' || P && (P.tut || P.tutorial) || !window.V17 || !V17.xp232) return false;
  const s = LS.get('xp232', null), d = dayKey(), n = s && s.d === d ? +s.n || 0 : 0;
  if (n >= 5) {
   addFx('cue', 0, 0, {
    s: 'PRACTICE XP: 5/5 TODAY - MORE TOMORROW',
    col: '#ffb14d',
    life: 2.2
   });
   return false;
  }
  LS.set('xp232', {
   d: d,
   n: n + 1
  });
  V17.xp232(1);
  const cue = () => addFx('cue', 0, 0, {
   s: '+1 XP - PRACTICE (' + (n + 1) + '/5 TODAY)',
   col: '#ffe14d',
   life: 2.4
  });
  if (P && P.counted === 'yes') setTimeout(cue, 2300); else cue();
  return true;
 };
 V.pracXpToday = () => {
  const s = LS.get('xp232', null);
  return s && s.d === dayKey() ? +s.n || 0 : 0;
 };
 const lgTeams = lg => TEAMS.filter(t => lg === __x("UExM") ? new RegExp(__x("UExM"),"").test(t.lg || '') : lg === __x("TUxM") ? new RegExp(__x("TUxM"),"").test(t.lg || '') && !(window.N31 && N31.on && new RegExp(__x("UExM"),"").test(t.lg || '')) : true).map(t => t.id);
 const naTeams = () => window.GHO16 && GHO16.on() && GH_REG.GHO ? [ 'GHO' ] : [];
 V.lgTeams = lgTeams;
 V.naTeams = naTeams;
 const sChoice = () => ({
  lg: on('l') && [ __x("UExM"), __x("TUxM"), 'ALL' ].includes(SET.lg) ? SET.lg : 'ALL',
  na: on('l') && SET.na === true && naTeams().length > 0,
  base: on('y') && SET.base === true,
  items: !on('i') || SET.items !== false
 });
 V.sChoice = sChoice;
 const LGN = {
  [__x("UExM")]: __x("UExMIFNFQVNPTg=="),
  [__x("TUxM")]: __x("TUxMIFNFQVNPTg=="),
  ALL: 'COMBINED SEASON'
 };
 const RS0 = PANEL_RENDER.seasonSetup;
 PANEL_RENDER.seasonSetup = function() {
  if (!on('l') && !on('y') && !on('i')) return RS0.apply(this, arguments);
  const c = sChoice(), n = lgTeams(c.lg).length + (c.na ? naTeams().length : 0), small = n <= 9;
  const b = (lab, a, v, sel) => btn(lab, a, v, sel ? 'y' : 'd');
  const lgLine = c.lg === __x("UExM") ? 'THE ' + lgTeams(__x("UExM")).length + __x("IFBMTCBURUFNUw==") : c.lg === __x("TUxM") ? 'THE ' + lgTeams(__x("TUxM")).length + __x("IE1MTCBURUFNUw==") : 'ALL ' + TEAMS.length + __x("IFRFQU1TLCBQTEwgKyBNTEwgVE9HRVRIRVI=");
  const weeks = Math.min(SEASON_GAMES, n % 2 ? n : n - 1), games = n % 2 === 0 ? weeks + ' GAMES' : weeks === n ? n - 1 + ' GAMES + 1 BYE WEEK' : weeks + ' WEEKS (SOME TEAMS GET A BYE WEEK: STANDINGS BY WIN %)';
  return '<div class="hd"><div class="tt">NEW SEASON' + (on('l') ? ' - ' + LGN[c.lg] : ' - ONE BIG LEAGUE') + '</div><div class="sp"></div>' + btn('BACK', 'back', null, 'g') + '</div>' + '<div class="note" id="ss232note">' + lgLine + (c.na ? ' + THE N/A TEAMS (NEW ORLEANS GHOSTS)' : '') + '. ' + games + ', TOP ' + (small ? 4 : PLAYOFF_N) + ' MAKE THE PLAYOFFS.</div>' + (on('l') ? '<div class="row" id="ss232lg">' + b(__x("UExBWSBQTEwgU0VBU09O"), 'ss232', __x("bGc6UExM"), c.lg === __x("UExM")) + b(__x("UExBWSBNTEwgU0VBU09O"), 'ss232', __x("bGc6TUxM"), c.lg === __x("TUxM")) + b('PLAY COMBINED SEASON', 'ss232', 'lg:ALL', c.lg === 'ALL') + '</div>' + '<div class="row" id="ss232na"><span class="note" style="align-self:center">INCLUDE N/A TEAMS?</span>' + b('YES', 'ss232', 'na:1', c.na) + b('NO', 'ss232', 'na:0', !c.na) + '</div>' : '') + (on('y') ? '<div class="row" id="ss232dr">' + b('DRAFT', 'ss232', 'base:0', !c.base) + b('USE BASE TEAMS', 'ss232', 'base:1', c.base) + '</div>' + '<div class="note">' + (c.base ? 'NO DRAFT: EVERY TEAM PLAYS WITH ITS REAL ROSTER. YOU PICK THE TEAM YOU PLAY AS.' : 'EVERY TEAM DRAFTS FROM ONE POOL OF EVERY PLAYER. YOU PICK THE TEAM YOU PLAY AS, THEN DRAFT ITS ROSTER. CPU TEAMS DRAFT BY OVERALL + POSITION NEED.') + '</div>' : '<div class="note">EVERY TEAM DRAFTS FROM ONE POOL OF EVERY PLAYER. YOU PICK THE TEAM YOU PLAY AS, THEN DRAFT ITS ROSTER. CPU TEAMS DRAFT BY OVERALL + POSITION NEED.</div>') + (on('i') ? '<div class="row" id="ss232it"><span class="note" style="align-self:center">ITEMS ACTIVE?</span>' + b('YES', 'ss232', 'items:1', c.items) + b('NO', 'ss232', 'items:0', !c.items) + '<span class="note" style="align-self:center">' + (c.items ? 'YOUR GEAR, STICKS + TEAM CREW WORK' : 'NO ITEM EFFECTS + NO TEAM CREW ALL SEASON') + '</span></div>' : '') + '<div class="row" style="flex-direction:column;align-items:stretch">' + btn('START SEASON - PICK YOUR TEAM', 'league', 'ALL', 'y') + '</div>';
 };
 PANEL_ACT.ss232 = function(v) {
  const [k, x] = String(v).split(':');
  if (k === 'lg' && [ __x("UExM"), __x("TUxM"), 'ALL' ].includes(x)) SET.lg = x;
  if (k === 'na') SET.na = x === '1';
  if (k === 'base') SET.base = x === '1';
  if (k === 'items') SET.items = x === '1';
  saveSet();
  tap();
  panelDirty();
 };
 V.seasonPickOpts = () => {
  const c = sChoice();
  return c.lg !== 'ALL' ? {
   only: lgTeams(c.lg)
  } : {};
 };
 function schedule(ids) {
  ids = ids.slice();
  if (ids.length % 2) ids.push('BYE');
  const n = ids.length, rounds = [], arr = ids.slice();
  for (let r = 0; r < n - 1; r++) {
   const games = [];
   for (let i = 0; i < n / 2; i++) games.push(r % 2 ? [ arr[n - 1 - i], arr[i] ] : [ arr[i], arr[n - 1 - i] ]);
   rounds.push(games);
   arr.splice(1, 0, arr.pop());
  }
  rounds.length = Math.min(rounds.length, SEASON_GAMES);
  return rounds;
 }
 V.schedule = schedule;
 const baseRoster = t => (T(t).roster || []).filter(id => PP(id));
 const MS0 = window.makeSeason;
 window.makeSeason = function(teamId) {
  const S = MS0.apply(this, arguments);
  if (S && on('i')) S.items232 = SET.items !== false;
  if (!S || !on('l') && !on('y')) return S;
  const c = sChoice();
  if (on('l')) {
   S.lg232 = c.lg;
   if (c.na) S.na232 = true;
  }
  if (c.lg !== 'ALL' || c.na) {
   const others = lgTeams(c.lg).concat(c.na ? naTeams() : []).filter(id => id !== teamId).sort(() => Math.random() - .5);
   const ids = [ teamId, ...others ], rounds = schedule(ids), table = {};
   ids.forEach(i => table[i] = {
    w: 0,
    l: 0,
    gf: 0,
    ga: 0
   });
   Object.assign(S, {
    teams: ids,
    rounds: rounds,
    table: table,
    week: 0
   });
   S.draft = makeDraft(S);
   draftRunCpu(S.draft, S.team);
  }
  if (c.base) {
   S.base232 = true;
   S.rosters = {};
   S.lineups = {};
   for (const t of S.teams) {
    S.rosters[t] = baseRoster(t);
    S.lineups[t] = autoLineup(S.rosters[t]);
   }
   delete S.draft;
   S.phase = 'reg';
  }
  return S;
 };
 const ST0 = window.standings;
 window.standings = function(S) {
  const r = ST0.apply(this, arguments);
  if (!S || !(S.lg232 || S.t232) || !S.teams || S.teams.length % 2 === 0 || (S.rounds || []).length >= S.teams.length) return r;
  const pct = x => x.w + x.l ? x.w / (x.w + x.l) : 0;
  return r.map((x, i) => [ x, i ]).sort((a, b) => pct(b[0]) - pct(a[0]) || a[1] - b[1]).map(a => a[0]);
 };
 const AW0 = window.advanceWeek;
 window.advanceWeek = function(S) {
  if (S && S.lg232 && on('l') && S.teams.length <= 9 && S.week + 1 >= S.rounds.length) {
   S.week++;
   const top = standings(S).slice(0, 4).map(x => x.id), s = i => top[i];
   S.phase = 'playoff';
   S.playoff = {
    seeds: top,
    round: 'semi',
    games: [ [ s(0), s(3) ], [ s(1), s(2) ] ],
    results: []
   };
   if (!top.includes(S.team)) {
    S.elim = true;
    simPlayoffsRest(S);
   }
   return;
  }
  return AW0.apply(this, arguments);
 };
 V.itemsOff = G => {
  if (!on('i') || !G || G.mode !== 'season' || G.tutorial) return false;
  const S = G.meta && G.meta.online && window.RLNET && RLNET.season && RLNET.season.S || season;
  return !!S && S.items232 === false;
 };
 V.trophyFor = S => {
  if (!on('p') || !S || S.online || !S.lg232) return null;
  return S.lg232 === __x("UExM") ? __x("dHJvcGh5X3BsbA==") : S.lg232 === __x("TUxM") ? __x("dHJvcGh5X21sbA==") : S.na232 ? 'trophy_mega' : null;
 };
 V.lgTitles = () => +LS.get('titles232', 0) || 0;
 const SR0 = window.seasonRecordGame;
 window.seasonRecordGame = function() {
  const S = season, t0 = +LS.get('titles', 0) || 0, r = SR0.apply(this, arguments);
  if (S && !S.online && V.trophyFor(S) && (+LS.get('titles', 0) || 0) > t0) LS.set('titles232', V.lgTitles() + 1);
  return r;
 };
 V.crewOn = () => on('z') && !!window.V17;
 V.crewSet = v => {
  if (v != null) {
   SET.crew = !!v;
   saveSet();
  }
  return SET.crew !== false;
 };
 V.crewAll = st => !V.crewOn() || !!st && st.hcz232 === true && st.gcz232 === true;
 V.crewOff = G => {
  if (!V.crewOn() || !G || ![ 'quick', 'online' ].includes(G.mode)) return false;
  if (G.online || G.meta && G.meta.online) return !!(G.meta && G.meta.crew232 === false);
  return SET.crew === false;
 };
 V.crewLobby = function(st, host, lx, rx, statY, L, oSeen, narrow, lift) {
  const R = window.RLNET, mk = host ? 'hcz232' : 'gcz232';
  if (st[mk] == null && V.crewSent !== R.code + R.side) {
   V.crewSent = R.code + R.side;
   const v = V.crewSet();
   st[mk] = v;
   R.patchLobby({
    [mk]: v
   });
  }
  const pick = v => {
   if (st.start || st[mk] === v) return;
   st[mk] = v;
   st.hready = false;
   st.gready = false;
   R.patchLobby({
    [mk]: v
   });
   tap();
  };
  const bw = 40, y = lift ? Math.min(146, H - 24 - lift - 11) : 146;
  button('CREW YES', lx - bw - 1, y, bw, 8, () => pick(true), {
   bg: st[mk] === true ? '#7dff7a' : '#3a4a55',
   fg: st[mk] === true ? '#0b1a20' : '#cfe'
  });
  button('CREW NO', lx + 1, y, bw, 8, () => pick(false), {
   bg: st[mk] === false ? '#ffb14d' : '#3a4a55',
   fg: st[mk] === false ? '#0b1a20' : '#cfe'
  });
  const h = st.hcz232, a = L.hasGuest ? st.gcz232 : null, wait = h == null || a == null, all = V.crewAll(st);
  const s = 'CREW ' + yn(h) + '+' + yn(a) + ' = ' + (wait ? '...' : all ? 'ON' : 'OFF');
  text(s, rx, lift ? y - 1 : 146, 1, wait ? '#cfe' : all ? '#7dff7a' : '#ff9a4a', 'center');
 };
 const DS0 = window.drawSettings;
 window.drawSettings = function(inGame) {
  const r = DS0.apply(this, arguments);
  if (!inGame && V.crewOn() && (window.__rl_v124gb || window.__rl_no332set)) {
   const v = V.crewSet();
   button('TEAM CREW (QUICK/ONLINE): ' + (v ? 'ON' : 'OFF'), W / 2 - 52, 137, 104, 9, () => {
    V.crewSet(!v);
    tap();
   }, {
    bg: v ? '#7dff7a' : '#3a4a55',
    fg: v ? '#0b1a20' : '#cfe',
    fit: true
   });
  }
  return r;
 };
 if (window.V20 && V20.luExtra) {
  const LX0 = V20.luExtra;
  V20.luExtra = function(ids) {
   const all = LX0.apply(this, arguments);
   if (!on('c') || screen !== 'lineup' || !PS.lu) return all;
   V.cpAll = all.slice();
   const inLu = SLOTS.map(s => slotGet(PS.lu, s[0])).filter(Boolean);
   return all.filter(id => inLu.includes(id));
  };
 }
 const tourney = () => PS.luSrc === 'season' || PS.luBack === 'timeout' && !!game && ![ 'quick', 'online' ].includes(game.mode);
 const cpOk = () => on('c') && typeof PS !== 'undefined' && !tourney() && !(window.CP2319 && !CP2319.luOk()) && !!window.V20;
 V.cpOk = cpOk;
 function cpRows() {
  const all = (V.cpAll || []).filter(id => PP(id)), slot = (SLOTS.find(s => s[0] === PS.luSel) || [])[1] || '';
  const leg = all.filter(id => PP(id).leg), cards = all.filter(id => !PP(id).leg);
  const R22 = window.V22, rar = id => R22 && R22.rarOf ? R22.rarOf(id) : 0, RN = R22 && R22.RARN || [ 'COMMON', 'RARE', 'LEGENDARY' ];
  const tile = id => {
   let h = '';
   if (PP(id).leg && window.V17 && V17.cardHtml) {
    const it = (V17.I || []).find(x => x.leg20 === id);
    if (it) h = V17.cardHtml(it.id, {
     a: 'cp232pick'
    });
   }
   if (!h && R22 && R22.cardHtml22) h = R22.cardHtml22(id);
   return h.replace(/data-a="(v22card|cp232pick|v17lsel)"/, 'data-a="cp232pick"').replace(/data-v="[^"]*"/, 'data-v="' + id + '"');
  };
  const row = (name, col, ids) => '<div class="sec17 row22"><div class="sh17" style="color:' + col + '">' + name + ' <span>' + ids.length + '</span></div><div class="grid17">' + ids.map(tile).join('') + '</div></div>';
  let h = '';
  if (leg.length) h += row('LEGACY', '#f5dd8f', leg);
  for (const r of [ 2, 1, 0 ]) {
   const l = cards.filter(id => rar(id) === r).sort((a, b) => PP(b).ovr - PP(a).ovr);
   if (l.length) h += row(RN[r], [ '#cfe', '#5ab0ff', '#ffcc33' ][r], l);
  }
  if (!h) h = '<div class="note">' + (window.V22 && V22.flipOn && V22.flipOn() ? 'NO PLAYER CARDS YET - WIN A TITLE AND FLIP 6 OF THAT ROSTER\'S CARDS' : 'NO PLAYER CARDS YET - WIN A TITLE (SEASON OR WORLD GAMES) AND EVERY PLAYER ON THAT ROSTER LANDS HERE') + '</div>';
  return '<div class="hd"><div class="tt">CARD PLAYER - ' + esc(slot) + '</div><div class="sp"></div>' + btn('BACK', 'cp232close', null, 'g') + '</div>' + '<div class="note">TAP A CARD TO PUT HIM IN THIS SPOT. ONLY CARDS YOU OWN.</div><div class="scroll" id="cp232List">' + h + '</div>';
 }
 const RL0 = PANEL_RENDER.lineup;
 PANEL_RENDER.lineup = function() {
  if (!on('c')) return RL0.apply(this, arguments);
  if (PS.cp232) {
   if (!cpOk()) PS.cp232 = null; else return cpRows();
  }
  V.cpAll = null;
  const h = RL0.apply(this, arguments);
  if (!cpOk()) return h;
  const n = (V.cpAll || []).length, i = h.indexOf('<th>IN</th></tr>');
  if (i < 0) return h;
  const rowH = '<tr data-a="cp232" class="cp232" id="cp232Row"><td colspan="7" style="text-align:center;font-weight:bold;color:' + (n ? '#ffe14d' : '#7f9aa6') + '">+ CARD PLAYER' + (n ? ' (' + n + ' CARD' + (n === 1 ? '' : 'S') + ')' : ' - NO CARDS YET') + '</td></tr>';
  const j = i + '<th>IN</th></tr>'.length;
  return h.slice(0, j) + rowH + h.slice(j);
 };
 PANEL_ACT.cp232 = () => {
  if (!cpOk()) return;
  PS.cp232 = PS.luSel || 'A0';
  tap();
  panelDirty();
 };
 PANEL_ACT.cp232close = () => {
  PS.cp232 = null;
  panelDirty();
 };
 PANEL_ACT.cp232pick = v => {
  if (!cpOk() || !(V.cpAll || []).includes(v)) return;
  PS.luSel = PS.cp232 || PS.luSel;
  assignSlot(v);
  PS.cp232 = null;
  tap();
  panelDirty();
 };
 {
  const back0 = PANEL_ACT.back;
  if (typeof back0 === 'function') PANEL_ACT.back = function() {
   if (screen === 'lineup' && PS.cp232) {
    PS.cp232 = null;
    panelDirty();
    return;
   }
   PS.cp232 = null;
   return back0.apply(this, arguments);
  };
 }
 const onT = () => on('T') && !!window.RLNET;
 const RN = () => window.RLNET, SNs = () => window.RLNET.season;
 const TT = window.T232 = {};
 let createK = 'pro', wgNext = false, colNext = false;
 const onCol = () => !window.__rl_no29coltour && !window.__rl_v124gb && !!(window.COL25 && COL25.IDS && COL25.IDS.length);
 const colIds = () => (window.COL25 && COL25.IDS ? COL25.IDS : []).filter(id => WT_REG[id] && WT_REG[id].col25);
 const hostTk = () => {
  const L0 = SNs().lobby, h = L0 && (L0.members || []).find(m => m.host);
  return h && h.tk232 || null;
 };
 const kindOf = () => {
  const SN = SNs();
  if (SN.S && SN.S.t232) return SN.S.t232;
  if (SN.mode === 'create' && !SN.code) return {
   k: createK,
   f: 'all'
  };
  return hostTk() || {
   k: 'pro',
   f: 'all'
  };
 };
 const members = () => (SNs().lobby && SNs().lobby.members || []).filter(m => m.team);
 const naAll = () => {
  const ms = members();
  return ms.length > 0 && ms.every(m => m.na232 === true);
 };
 const ghOwned = () => {
  try {
   return !!(window.V17 && V17.hw16 && V17.hw16.owned());
  } catch (e) {
   return false;
  }
 };
 const isNA = id => naTeams().includes(id);
 TT.on = onT;
 TT.kind = kindOf;
 TT.naAll = naAll;
 TT.isWg = () => onT() && kindOf().k === 'wg';
 TT.title = () => {
  if (!onT()) return null;
  const k = kindOf();
  if (k.k === 'pro' && k.f === 'all') return null;
  return (k.k === 'wg' ? 'ONLINE WORLD GAMES' : k.k === 'col' ? 'ONLINE COLLEGE TOURNAMENT' : 'ONLINE SEASON') + (k.f === 'players' ? ' - PLAYERS ONLY' : '') + (RN().on2312() ? '' : '  CODE ' + (SNs().code || '----'));
 };
 TT.createExtra = () => onT() ? {
  tk232: {
   k: createK,
   f: 'all'
  }
 } : {};
 {
  const SC0 = RN().seasonCreate;
  RN().seasonCreate = function() {
   createK = wgNext ? 'wg' : colNext && onCol() ? 'col' : 'pro';
   wgNext = false;
   colNext = false;
   return SC0.apply(this, arguments);
  };
 }
 TT.createWg = () => {
  wgNext = true;
  RN().seasonCreate();
 };
 TT.colOn = () => onT() && onCol();
 TT.createCol = () => {
  if (!onCol()) return;
  colNext = true;
  RN().seasonCreate();
 };
 TT.isCol = () => onT() && kindOf().k === 'col';
 TT.pickOpts = taken => {
  if (!onT()) return null;
  const k = kindOf(), na = naAll() && ghOwned(), base = k.k === 'wg' ? WTEAMS.map(t => t.id) : k.k === 'col' ? colIds() : TEAMS.map(t => t.id);
  if (k.k === 'pro' && !na) return null;
  if (k.k === 'col') return {
   col29: true,
   only: colIds().filter(id => !taken.includes(id)),
   back: () => {
    screen = SNs().lobby && SNs().lobby.me ? 'onSeason' : 'online';
   }
  };
  const ids = base.concat(na ? naTeams() : []).filter(id => !taken.includes(id));
  return {
   pool: ids.map(id => T(id)),
   back: () => {
    screen = SNs().lobby && SNs().lobby.me ? 'onSeason' : 'online';
   }
  };
 };
 async function teamPost(extra) {
  const SN = SNs(), L0 = SN.lobby;
  if (!L0 || !L0.me || SN.S || TT.busy) return;
  TT.busy = true;
  try {
   const r = await RN().call('/season/' + SN.code + '/team', Object.assign({
    team: L0.me
   }, extra));
   if (r && r.ok) SN.lobby = Object.assign(SN.lobby || {}, r); else RN().err = r && r.error || 'NO CONNECTION';
  } finally {
   TT.busy = false;
  }
  await RN().seasonFetch();
 }
 const itAll = () => {
  const ms = members();
  return ms.length > 0 && ms.every(m => m.it232 === true);
 };
 TT.itAll = itAll;
 const uk = f => {
  try {
   const s = uiSpecs[uiSpecs.length - 1];
   if (s && !/#/.test(s.key)) s.key += '#' + f;
  } catch (e) {}
 };
 TT.lobby = function(L0, me) {
  const k = kindOf(), x = W / 2 - 140, ms = L0.members.filter(m => m.team), mm = L0.members.find(m => m.me);
  const pk = f => ms.map(m => m[f] === true ? 'Y' : m[f] === false ? 'N' : '-').join('');
  const res = (f, all) => all ? 'ON' : ms.some(m => m[f] === false) ? 'OFF' : '...';
  if (me && mm) {
   if (on('i') && mm.it232 == null && TT.itSent !== SNs().code) {
    TT.itSent = SNs().code;
    teamPost({
     it232: SET.items !== false
    });
   }
   const row = (lab, f, y, all) => {
    const my = mm[f], r = res(f, all);
    text(lab, x, y + 2, 1, '#ffe14d');
    button('YES', x + 46, y, 24, 9, () => {
     if (my !== true) teamPost({
      [f]: true
     });
    }, {
     bg: my === true ? '#7dff7a' : '#3a4a55',
     fg: my === true ? '#0b1a20' : '#cfe'
    });
    uk(f);
    button('NO', x + 72, y, 24, 9, () => {
     if (my !== false) teamPost({
      [f]: false
     });
    }, {
     bg: my === false ? '#ffb14d' : '#3a4a55',
     fg: my === false ? '#0b1a20' : '#cfe'
    });
    uk(f);
    text(pk(f) + '=' + r, x + 99, y + 2, 1, r === 'ON' ? '#7dff7a' : r === 'OFF' ? '#ff9a4a' : '#cfe');
   };
   row('N/A TEAMS?', 'na232', 78, naAll());
   if (on('i')) row('ITEMS ON?', 'it232', 88, itAll());
   button('CHANGE TEAM', x, 98, 50, 8, () => {
    SNs().mode = 'join';
    screen = 'onSeasonTeam';
   }, {
    bg: '#8fe3f0'
   });
  }
  text('FIELD:', x, 131, 1, '#8fe3f0');
  const fb = (lab, f) => button(lab, x + (f === 'all' ? 28 : 74), 129, f === 'all' ? 44 : 54, 9, () => {
   if (L0.host && k.f !== f) teamPost({
    tk232: {
     k: k.k,
     f: f
    }
   });
  }, {
   bg: k.f === f ? '#ffd23a' : '#3a4a55',
   fg: k.f === f ? '#0b1a20' : '#cfe'
  });
  fb('ALL TEAMS', 'all');
  fb('PLAYERS ONLY', 'players');
 };
 TT.startLabel = n => !onT() ? null : kindOf().k === 'wg' ? 'START WORLD GAMES (' + n + ' PLAYERS)' : kindOf().k === 'col' ? 'START TOURNAMENT (' + n + ' PLAYERS)' : null;
 TT.note = () => {
  if (!onT()) return null;
  const k = kindOf();
  if (k.k === 'col') return k.f === 'players' ? 'PLAYERS ONLY: JUST YOUR SCHOOLS IN ONE BRACKET. EVERY GAME IS ONLINE.' : 'NO DRAFT. EVERY COLLEGE TEAM IN ONE BRACKET (CPU + BYES). HUMAN VS HUMAN GAMES ARE ONLINE.';
  if (k.f === 'players') return 'PLAYERS ONLY: NO CPU TEAMS. EVERY GAME IS ONLINE. BYES IF ODD.';
  return k.k === 'wg' ? 'NO DRAFT. OTHER COUNTRIES ARE CPU. HUMAN VS HUMAN GAMES ARE ONLINE.' : null;
 };
 function emptyS(H, teams, extra) {
  const table = {};
  teams.forEach(i => table[i] = {
   w: 0,
   l: 0,
   gf: 0,
   ga: 0
  });
  const wk = {};
  H.forEach(h => wk[h] = 0);
  return Object.assign({
   v7: true,
   v8: true,
   online: true,
   humans: H,
   league: 'ALL',
   teams: teams,
   week: 0,
   wk: wk,
   simmed: 0,
   rounds: [],
   table: table,
   results: [],
   played: {},
   pend: [],
   phase: 'reg',
   playoff: null,
   champ: null,
   year: (new Date).getFullYear(),
   rosters: null,
   lineups: {},
   h2hWeek: 0
  }, extra);
 }
 function bracket(seeds) {
  let size = 2;
  while (size < seeds.length) size *= 2;
  let order = [ 1 ];
  while (order.length < size) {
   const m = order.length * 2 + 1;
   order = order.flatMap(s => [ s, m - s ]);
  }
  const slots = order.map(s => seeds[s - 1] || 'BYE'), pairs = [];
  for (let i = 0; i < slots.length; i += 2) pairs.push([ slots[i], slots[i + 1] ]);
  return {
   size: size,
   seeds: seeds.slice(),
   rounds: [ pairs ],
   res: [ [] ],
   r: 0
  };
 }
 TT.bracket = bracket;
 const ovrOfTeam = id => {
  try {
   return teamOvr(id, 'real');
  } catch (e) {
   return 0;
  }
 };
 function buildWg(H, f, na) {
  let w, teams;
  if (f === 'players') {
   teams = H.slice();
   w = {
    phase: 'br',
    br: bracket(H.slice().sort((a, b) => ovrOfTeam(b) - ovrOfTeam(a))),
    si: 0,
    rec: {}
   };
  } else {
   const byAbbr = {};
   for (const t of WTEAMS) byAbbr[t.abbr] = t.id;
   const pools = {}, used = new Set;
   for (const k of WG30_POOLS) {
    pools[k] = WG30_REAL[k].map(a => byAbbr[a]).filter(id => id && !used.has(id));
    pools[k].forEach(id => used.add(id));
   }
   for (const id of WTEAMS.map(t => t.id).filter(id => !used.has(id))) {
    const k = WG30_POOLS.slice(1).reduce((m, q) => pools[q].length < pools[m].length ? q : m, 'B');
    pools[k].push(id);
   }
   const extraH = H.filter(h => !WT_REG[h]);
   for (const h of extraH) {
    for (const k of WG30_POOLS.slice().reverse()) {
     const i = pools[k].map((id, j) => j).reverse().find(j => !H.includes(pools[k][j]));
     if (i != null) {
      pools[k][i] = h;
      break;
     }
    }
   }
   teams = WG30_POOLS.flatMap(k => pools[k]);
   const rounds = WG30_RR.map(rr => {
    const gs = [];
    for (const k of WG30_POOLS) for (const [a, b] of rr) if (pools[k][a] && pools[k][b]) gs.push([ pools[k][a], pools[k][b], k ]);
    return gs;
   });
   const table = {};
   for (const id of teams) table[id] = {
    w: 0,
    l: 0,
    gf: 0,
    ga: 0
   };
   w = {
    v: 2318,
    team: null,
    teams: teams,
    pools: pools,
    rounds: rounds,
    round: 0,
    phase: 'pool',
    table: table,
    results: [],
    ko: null,
    champ: null,
    stats: {},
    si: 0,
    rec: {}
   };
  }
  const S = emptyS(H, teams, {
   league: 'WG',
   t232: {
    k: 'wg',
    f: f,
    na: !!na
   },
   w: w
  });
  S.rosters = {};
  for (const t of teams) {
   S.rosters[t] = (T(t).roster || []).filter(id => PP(id));
   S.lineups[t] = autoLineup(S.rosters[t]);
  }
  return S;
 }
 TT.buildWg = buildWg;
 function buildCol(H, f, na) {
  const field = f === 'players' ? H.slice() : H.concat(colIds().filter(id => !H.includes(id)));
  const seeds = field.map(id => [ id, ovrOfTeam(id) ]).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(x => x[0]);
  const w = {
   phase: 'br',
   br: bracket(seeds),
   si: 0,
   rec: {}
  };
  const S = emptyS(H, seeds.slice(), {
   league: 'COL',
   t232: {
    k: 'col',
    f: f,
    na: !!na
   },
   w: w
  });
  S.rosters = {};
  for (const t of seeds) {
   S.rosters[t] = (T(t).roster || []).filter(id => PP(id));
   S.lineups[t] = autoLineup(S.rosters[t]);
  }
  return S;
 }
 TT.buildCol = buildCol;
 function buildPro(H, f, na) {
  if (f === 'players') {
   const S = emptyS(H, H.slice(), {
    phase: 'draft',
    t232: {
     k: 'pro',
     f: f,
     na: !!na
    },
    w: {
     phase: 'rr',
     rr: schedule(H.slice().sort(() => Math.random() - .5)),
     round: 0,
     si: 0,
     rec: {}
    }
   });
   S.draft = makeDraft(S);
   S.draft.user = null;
   return S;
  }
  const all = TEAMS.map(t => t.id).concat(naTeams());
  let best = null;
  for (let tries = 0; tries < 300; tries++) {
   const ids = [ ...H, ...all.filter(id => !H.includes(id)) ].sort(() => Math.random() - .5);
   if (ids.length % 2) ids.push('BYE');
   const n = ids.length, rounds = [], arr = ids.slice();
   for (let r = 0; r < n - 1; r++) {
    const games = [];
    for (let i = 0; i < n / 2; i++) games.push(r % 2 ? [ arr[n - 1 - i], arr[i] ] : [ arr[i], arr[n - 1 - i] ]);
    rounds.push(games);
    arr.splice(1, 0, arr.pop());
   }
   rounds.length = Math.min(rounds.length, SEASON_GAMES);
   const meets = {};
   H.forEach(h => meets[h] = []);
   rounds.forEach((gs, wk) => gs.forEach(([a, b]) => {
    if (H.includes(a) && H.includes(b)) {
     meets[a].push(wk);
     meets[b].push(wk);
    }
   }));
   const ok = H.every(h => meets[h].length && Math.min(...meets[h]) <= rounds.length - 2), score = H.reduce((s, h) => s + Math.min(2, meets[h].length), 0);
   if (ok && (!best || score > best.score)) {
    best = {
     ids: ids,
     rounds: rounds,
     score: score
    };
    if (score >= H.length * 2 || tries > 120) break;
   }
  }
  if (!best) return null;
  const teams = best.ids.filter(i => i !== 'BYE'), first = best.rounds.findIndex(gs => gs.some(([a, b]) => H.includes(a) && H.includes(b)));
  const S = emptyS(H, teams, {
   rounds: best.rounds,
   phase: 'draft',
   h2hWeek: first,
   t232: {
    k: 'pro',
    f: 'all',
    na: true
   }
  });
  S.draft = makeDraft(S);
  S.draft.user = null;
  const D = S.draft, total = D.order.length * D.rounds;
  while (D.n < total && !H.includes(draftTurn(D))) draftPick(D, draftTurn(D), cpuChoice(D, draftTurn(D)));
  return S;
 }
 TT.buildPro = buildPro;
 TT.startCheck = function(hs) {
  const k = kindOf(), na = naAll(), N = RN();
  if (hs.some(isNA) && !na) {
   N.err = 'AN N/A TEAM IS PICKED - EVERYONE HAS TO SAY YES TO N/A TEAMS';
   return false;
  }
  const it = on('i') ? itAll() : null, put = S => {
   if (S && it !== null) S.items232 = it;
   return S;
  };
  if (k.k === 'wg') {
   const S = put(buildWg(hs, k.f, na));
   return S ? {
    S: S
   } : false;
  }
  if (k.k === 'col') {
   if (!onCol()) {
    N.err = 'COLLEGE TOURNAMENTS ARE OFF ON THIS PHONE';
    return false;
   }
   const S = put(buildCol(hs, k.f, na));
   return S ? {
    S: S
   } : false;
  }
  if (k.f === 'players') return {
   build: H => put(buildPro(H, 'players', na))
  };
  if (na && naTeams().length) return {
   build: H => put(buildPro(H, 'all', true))
  };
  return it === null ? null : {
   build: H => put(N.buildSeason(H))
  };
 };
 TT.startPut = async function(S) {
  const N = RN(), SN = SNs();
  TT.settle(S);
  const r = await N.call('/season/' + SN.code + '/put', {
   ver: SN.ver,
   state: S,
   notify: {
    title: 'BAGGA LAX',
    body: S.t232 && S.t232.k === 'col' ? 'THE COLLEGE TOURNAMENT IS ON - PLAY YOUR FIRST GAME' : 'THE WORLD GAMES ARE ON - PLAY YOUR FIRST GAME'
   }
  });
  if (r && r.ok) {
   SN.ver = r.ver;
   SN.S = S;
   N.seasonLocalFor();
   screen = 'onSeason';
  } else {
   N.err = r && r.error || null;
   await N.seasonFetch();
  }
 };
 const PAIR = {
  2: 'FINAL',
  4: 'SEMIFINAL',
  8: 'QUARTERFINAL'
 };
 const isWgS = S => !!(S.t232 && S.t232.k === 'wg');
 const sim = (S, a, b) => isWgS(S) || S.t232 && S.t232.k === 'col' ? wgSim16(a, b) : simScore(a, b);
 function stage(S) {
  const w = S.w, key = (a, b) => 'T' + w.si + ':' + a + '-' + b;
  if (!w || w.phase === 'done' || S.phase === 'draft') return {
   kind: 'done',
   games: []
  };
  if (w.phase === 'rr') return {
   kind: 'rr',
   games: (w.rr[w.round] || []).filter(g => !g.includes('BYE')).map(g => ({
    k: key(g[0], g[1]),
    g: [ g[0], g[1] ],
    label: 'ROUND ' + (w.round + 1) + ' OF ' + w.rr.length
   }))
  };
  if (w.phase === 'pool') return {
   kind: 'pool',
   games: (w.rounds[w.round] || []).map(g => ({
    k: key(g[0], g[1]),
    g: [ g[0], g[1] ],
    label: 'POOL ' + g[2] + ' - ROUND ' + (w.round + 1) + ' OF ' + w.rounds.length,
    pool: g[2]
   }))
  };
  if (w.phase === 'ko') return {
   kind: 'ko',
   games: wgDayGames30(w, w.ko.day).map(x => ({
    k: key(x.g[0], x.g[1]),
    g: x.g,
    label: x.label,
    kk: x.k,
    place: x.place
   }))
  };
  if (w.phase === 'br') {
   const B = w.br, n = B.size >> B.r;
   return {
    kind: 'br',
    games: B.rounds[B.r].filter(g => !g.includes('BYE')).map(g => ({
     k: key(g[0], g[1]),
     g: B.seeds.indexOf(g[0]) <= B.seeds.indexOf(g[1]) ? [ g[0], g[1] ] : [ g[1], g[0] ],
     label: PAIR[n] || 'ROUND OF ' + n,
     pair: g
    }))
   };
  }
  return {
   kind: 'done',
   games: []
  };
 }
 TT.stage = stage;
 function finish(S, champ) {
  S.w.phase = 'done';
  S.phase = 'done';
  S.champ = champ || null;
  S.w.champ = champ || null;
 }
 function advance(S, st) {
  const w = S.w, sc = x => w.rec[x.k] || sim(S, x.g[0], x.g[1]);
  if (st.kind === 'rr') {
   for (const x of st.games) {
    const [sa, sb] = sc(x);
    applyResult(S, x.g[0], x.g[1], sa, sb);
    S.results.push([ x.g[0], x.g[1], sa, sb, x.label ]);
   }
   w.round++;
   if (w.round >= w.rr.length) {
    w.phase = 'br';
    w.br = bracket(standings(S).map(r => r.id).filter(id => S.humans.includes(id)));
   }
  } else if (st.kind === 'pool') {
   for (const x of st.games) {
    const [sa, sb] = sc(x);
    wgApply16(w, x.g[0], x.g[1], sa, sb, x.label);
    S.results.push([ x.g[0], x.g[1], sa, sb, x.label ]);
   }
   w.round++;
   if (w.round >= w.rounds.length) {
    w.phase = 'ko';
    w.ko = {
     v: 2318,
     day: 0,
     seeds: wgSeeds30(w),
     res: {},
     place: {}
    };
   }
  } else if (st.kind === 'ko') {
   const K = w.ko;
   for (const x of st.games) {
    const [sa, sb] = sc(x);
    wgApply16(w, x.g[0], x.g[1], sa, sb, x.label);
    S.results.push([ x.g[0], x.g[1], sa, sb, x.label ]);
    K.res[x.kk] = [ x.g[0], x.g[1], sa, sb ];
    if (x.place) {
     const win = sa > sb ? x.g[0] : x.g[1];
     K.place[win] = x.place;
     K.place[win === x.g[0] ? x.g[1] : x.g[0]] = x.place + 1;
    }
   }
   K.day++;
   if (K.day >= WG30_DAYS) {
    const f = K.res.fin;
    finish(S, f ? f[2] > f[3] ? f[0] : f[1] : null);
   }
  } else if (st.kind === 'br') {
   const B = w.br, res = [], win = [];
   for (const g of B.rounds[B.r]) {
    if (g.includes('BYE')) {
     res.push(null);
     win.push(g[0] === 'BYE' ? g[1] : g[0]);
     continue;
    }
    const x = st.games.find(q => q.pair === g), [sa, sb] = sc(x), a = x.g[0], b = x.g[1];
    res.push([ a, b, sa, sb ]);
    win.push(sa > sb ? a : b);
    S.results.push([ a, b, sa, sb, x.label ]);
   }
   B.res[B.r] = res;
   if (win.length === 1) finish(S, win[0]); else {
    const nx = [];
    for (let i = 0; i < win.length; i += 2) nx.push([ win[i], win[i + 1] ]);
    B.rounds.push(nx);
    B.res.push([]);
    B.r++;
   }
  }
  w.si++;
  w.rec = {};
 }
 TT.settle = function(S) {
  for (let guard = 0; guard < 60; guard++) {
   if (!S.w || S.w.phase === 'done' || S.phase === 'draft') return;
   const st = stage(S), hs = S.humans || [];
   if (st.games.some(x => (hs.includes(x.g[0]) || hs.includes(x.g[1])) && !S.w.rec[x.k])) return;
   advance(S, st);
  }
 };
 TT.next = function(S, me) {
  if (!S || !S.w || S.phase === 'draft') return null;
  const st = stage(S), x = st.games.find(q => q.g.includes(me));
  if (!x || S.w.rec[x.k]) return null;
  const opp = x.g[0] === me ? x.g[1] : x.g[0];
  return {
   t232: 1,
   w: S.w.si,
   gm: x.g.slice(0, 2),
   k: x.k,
   opp: opp,
   home: x.g[0] === me,
   h2h: (S.humans || []).includes(opp),
   label: x.label,
   ko: st.kind === 'ko' || st.kind === 'br'
  };
 };
 TT.rec = function(S, nx, me, my, op) {
  const w = S.w;
  if (!w || w.si !== nx.w || w.rec[nx.k]) return false;
  const [a] = nx.gm;
  w.rec[nx.k] = a === me ? [ my, op ] : [ op, my ];
  return true;
 };
 const nm = id => id === 'BYE' ? 'BYE' : T(id).abbr && (WT_REG[id] || GH_REG[id]) ? T(id).abbr : T(id).name;
 TT.hub = function(S, me, L0) {
  const N = RN(), w = S.w, hs = S.humans || [], st = stage(S);
  button('LINEUP', W - 92, 2, 44, 13, () => openLineup(me, 'season', 'onSeason'), {
   bg: '#2cc4dc'
  });
  button('STATS', W - 140, 2, 44, 13, () => {
   PS.stSort = PS.stSort || 'pts';
   screen = 'seasonStats';
   panelDirty();
  }, {
   bg: '#ffe14d'
  });
  const lw = Math.round(W * .46), cx = 6 + lw / 2;
  card(6, 22, lw, 134);
  const nx = N.nextFor(S, me);
  if (nx) {
   const o = T(nx.opp);
   text(nx.label, cx, 28, 1, '#ffd23a', 'center');
   badge(T(me), cx - 52, 38, 2);
   badge(o, cx + 26, 38, 2);
   text(nx.home ? 'VS' : 'AT', cx, 46, 2, '#fff', 'center');
   text(o.name + (nx.h2h ? ' - HUMAN' : ''), cx, 72, 1, nx.h2h ? '#ffe14d' : '#cfe', 'center');
   text(nx.h2h ? nx.home ? 'YOU ARE HOME - YOU SET THE RULES' : 'THEY ARE HOME - THEY SET THE RULES' : nx.home ? 'HOME GAME' : 'AWAY GAME', cx, 80, 1, '#7f9aa6', 'center');
   if (nx.h2h) button('PLAY ONLINE', cx - 60, 90, 120, 18, () => N.playH2H(nx), {
    sc: 1,
    bg: '#7dff7a'
   }); else button('PLAY', cx - 34, 96, 68, 20, () => N.playVsCpu(nx), {
    sc: 2
   });
   text('TOURNAMENT GAMES CANNOT WAIT', cx, 130, 1, '#8fe3f0', 'center');
   if (st.kind === 'br') text('LOSE AND YOU ARE OUT', cx, 142, 1, '#ff9a8a', 'center');
  } else if (S.phase === 'done') {
   const champ = S.champ ? T(S.champ) : null;
   text(isWgS(S) ? 'WORLD GAMES OVER' : 'TOURNAMENT OVER', cx, 30, 1, '#ffd23a', 'center');
   if (champ) {
    badge(champ, cx - 19, 40, 3);
    text(champ.id === me ? 'YOU WON IT ALL!' : champ.name + ' WIN IT ALL', cx, 92, 1, '#ffe14d', 'center');
   }
   if (champ && champ.id === me && window.V17) {
    V17.award('trophy_online');
    TT.won();
    text('GOLD ONLINE TROPHY UNLOCKED', cx, 104, 1, '#7dff7a', 'center');
   }
   const pl = w.ko && w.ko.place && w.ko.place[me];
   if (pl && !(champ && champ.id === me)) text('YOU FINISHED ' + wgOrd30(pl), cx, 104, 1, '#cfe', 'center');
   button('FORGET IT', cx - 50, 118, 100, 16, () => {
    try {
     localStorage.setItem('rl_onSeasons', JSON.stringify(N.mySeasons().filter(x => x.code !== SNs().code)));
    } catch (e) {}
    N.leaveOnlineSeason();
    screen = 'online';
   }, {
    bg: '#c9d6d9'
   });
  } else {
   const mine = st.games.find(q => q.g.includes(me)), out = st.kind === 'br' && !st.games.length ? false : st.kind === 'br' && !w.br.rounds[w.br.r].some(g => g.includes(me));
   text(out ? 'YOU ARE OUT' : mine ? 'YOUR GAME IS IN' : 'BYE THIS ROUND', cx, 34, 1, '#ffd23a', 'center');
   text(out ? 'WATCH THE BRACKET' : 'WAITING FOR THE OTHER PLAYERS', cx, 50, 1, '#cfe', 'center');
   const left = st.games.filter(q => (hs.includes(q.g[0]) || hs.includes(q.g[1])) && !w.rec[q.k]);
   left.slice(0, 3).forEach((q, i) => text(nm(q.g[0]) + ' VS ' + nm(q.g[1]), cx, 62 + i * 9, 1, '#ffb14d', 'center'));
  }
  const right = lw + 12, rw = W - right - 6;
  if (st.kind === 'br' || S.phase === 'done' && w.br) drawBracket(S, right, 22, rw, H - 34, me); else if (st.kind === 'pool' || st.kind === 'rr') drawTable(S, right, 24, rw, me, st); else drawDay(S, right, 24, rw, me, st);
  if (RN().err) text(RN().err, W / 2, H - 9, 1, '#ff9a8a', 'center'); else text(isWgS(S) ? w.phase === 'pool' ? 'POOL PLAY - ROUND ' + (w.round + 1) + ' OF ' + w.rounds.length : w.phase === 'ko' ? 'KNOCKOUT - DAY ' + (w.ko.day + 1) + ' OF ' + WG30_DAYS : '' : '', W / 2, H - 9, 1, '#7f9aa6', 'center');
 };
 function drawTable(S, x, y, rw, me, st) {
  const w = S.w, hs = S.humans || [];
  let rows, title;
  if (st.kind === 'pool') {
   const k = wgPoolOf30(w, me) || 'A';
   rows = wgStand30(w, k);
   title = 'POOL ' + k;
  } else {
   rows = standings(S);
   title = 'STANDINGS - ROUND ' + (w.round + 1) + ' OF ' + w.rr.length;
  }
  text(title, x + 4, y, 1, '#ffe14d');
  y += 10;
  text('TEAM', x + 4, y, 1, '#7f9aa6');
  text('W', x + rw - 40, y, 1, '#7f9aa6', 'center');
  text('L', x + rw - 26, y, 1, '#7f9aa6', 'center');
  text('+/-', x + rw - 10, y, 1, '#7f9aa6', 'center');
  y += 8;
  rows.forEach((r, i) => {
   const tm = T(r.id), mine = r.id === me, fr = !mine && hs.includes(r.id);
   if (mine || fr) rect(x, y - 2, rw, 9, mine ? '#1f4a52' : '#4a3a1f');
   text(i + 1, x + 4, y, 1, '#7f9aa6');
   rect(x + 14, y - 1, 6, 7, accent(tm));
   text(tm.name, x + 24, y, 1, mine ? '#ffe14d' : fr ? '#ffb14d' : '#fff');
   text(r.w, x + rw - 40, y, 1, '#fff', 'center');
   text(r.l, x + rw - 26, y, 1, '#fff', 'center');
   const gd = r.gf - r.ga;
   text((gd > 0 ? '+' : '') + gd, x + rw - 10, y, 1, gd >= 0 ? '#7dff7a' : '#ff8a7a', 'center');
   y += 9;
  });
  if (st.kind === 'pool') {
   y += 4;
   textMini('TOP 2 OF EACH POOL (+ POOL A) PLAY FOR GOLD. EVERYONE PLAYS ON FOR A PLACE.', x + rw / 2, y, '#7f9aa6');
  }
 }
 function drawDay(S, x, y, rw, me, st) {
  const w = S.w, hs = S.humans || [];
  text(S.phase === 'done' ? 'FINAL PLACES' : 'TODAY: ' + st.games.length + ' GAMES', x + 4, y, 1, '#ffe14d');
  y += 10;
  if (S.phase === 'done' && w.ko) {
   const pl = Object.keys(w.ko.place).sort((a, b) => w.ko.place[a] - w.ko.place[b]);
   for (const id of pl.slice(0, 12)) {
    const mine = id === me, fr = hs.includes(id);
    text(wgOrd30(w.ko.place[id]) + ' ' + T(id).name, x + 4, y, 1, mine ? '#ffe14d' : fr ? '#ffb14d' : '#fff');
    y += 9;
   }
   return;
  }
  const gs = st.games.slice().sort((a, b) => +b.g.some(t => hs.includes(t)) - +a.g.some(t => hs.includes(t)));
  for (const q of gs) {
   const h = q.g.some(t => hs.includes(t)), r = w.rec[q.k];
   if (h) rect(x, y - 2, rw, 9, q.g.includes(me) ? '#1f4a52' : '#4a3a1f');
   textMini(q.label, x + 42, y + 1, '#8fe3f0');
   text(nm(q.g[0]) + (r ? ' ' + r[0] + '-' + r[1] + ' ' : ' V ') + nm(q.g[1]), x + rw - 4, y, 1, h ? '#fff' : '#cfe', 'right');
   y += 9;
   if (y > H - 22) break;
  }
 }
 function drawBracket(S, x, y, rw, hh, me) {
  const B = S.w.br, hs = S.humans || [], nR = Math.round(Math.log2(B.size)), cw = Math.floor(rw / nR);
  rect(x, y, rw, hh, 'rgba(10,16,24,.92)');
  text(S.phase === 'done' ? 'CHAMPION: ' + T(S.champ).name : 'BRACKET', x + rw / 2, y + 3, 1, '#ffe14d', 'center');
  const top = y + 14, avail = hh - 18;
  for (let r = 0; r < nR; r++) {
   const nG = B.size >> r + 1, gh = avail / nG, gx = x + r * cw + 3, bw = cw - 8;
   text(PAIR[B.size >> r] || 'ROUND 1', gx + bw / 2, top - 1 + (r ? 0 : 0), 1, '#7f9aa6', 'center');
   for (let i = 0; i < nG; i++) {
    const g = B.rounds[r] && B.rounds[r][i], res = B.res[r] && B.res[r][i], gy = Math.round(top + 8 + i * gh + gh / 2 - 9);
    const row = (id, k) => {
     const yy = gy + k * 9, mine = id === me, won = res && (res[0] === id && res[2] > res[3] || res[1] === id && res[3] > res[2]), sc = res ? res[0] === id ? res[2] : res[3] : null;
     rect(gx, yy, bw, 8, mine ? '#1f4a52' : id && id !== 'BYE' ? '#26323d' : '#141a22');
     if (id && id !== 'BYE') {
      rect(gx + 1, yy + 1, 3, 6, accent(T(id)));
     }
     text(id ? id === 'BYE' ? 'BYE' : nm(id) : '-', gx + 6, yy + 1, 1, won ? '#7dff7a' : id === 'BYE' ? '#7f9aa6' : hs.includes(id) ? '#ffe14d' : '#fff');
     if (sc != null) text(sc, gx + bw - 2, yy + 1, 1, won ? '#7dff7a' : '#ff9a8a', 'right');
    };
    row(g && g[0], 0);
    row(g && g[1], 1);
    if (r < nR - 1) rect(gx + bw, gy + 8, 4, 1, '#5a6670');
   }
  }
 }
 const MODES = [ 'quick', 'online', 'season', 'world', 'practice', 'tutorial' ];
 V.MODES = MODES;
 function modesHad() {
  const m = new Set(LS.get('modes232', []) || []);
  try {
   const st = window.V17 ? V17.ST().stats || {} : {}, rec = LS.get('record', null);
   if (rec && (rec.w || rec.l) || st.quickW) m.add('quick');
   if (st.onlineW) m.add('online');
   if (st.seasonW || (+LS.get('titles', 0) || 0) > 0) m.add('season');
   if (st.worldW || (+LS.get('wgTitles', 0) || 0) > 0) m.add('world');
   if (localStorage.getItem('rl_tutDone') === 'true') m.add('tutorial');
  } catch (e) {}
  return m;
 }
 V.modesHad = () => [ ...modesHad() ];
 const NG0 = window.newGame;
 window.newGame = function(user, opp, mode, userHome, meta) {
  const r = NG0.apply(this, arguments);
  if (on('a')) {
   const k = meta && meta.online ? 'online' : mode === 'world' ? 'world' : mode === 'season' ? 'season' : mode === 'practice' ? 'practice' : mode === 'tutorial' ? 'tutorial' : mode === 'quick' ? 'quick' : null;
   const had = LS.get('modes232', []) || [];
   if (k && !had.includes(k)) {
    LS.set('modes232', had.concat(k));
    setTimeout(() => {
     try {
      if (window.V17) V17.checkAch();
     } catch (e) {}
    }, 50);
   }
  }
  return r;
 };
 V.achVal = function(v) {
  const own = () => window.V22 && V22.ownedIds ? V22.ownedIds() : [];
  if (v === 'tourney') return [ LS.get('tw232', 0) || window.V17 && V17.ST().trophies.trophy_online ? 1 : 0, 1 ];
  if (v === 'cards') return [ Math.min(25, own().length), 25 ];
  if (v === 'prac') return [ Math.min(10, +LS.get('prac232', 0) || 0), 10 ];
  if (v === 'modes') {
   const m = modesHad();
   return [ MODES.filter(k => m.has(k)).length, MODES.length ];
  }
  if (v === 'ghosts') {
   const all = GH_REG.GHO && GH_REG.GHO.roster || [];
   const o = new Set(own());
   return [ all.filter(id => o.has(id)).length, Math.max(1, all.length) ];
  }
  return [ 0, 1 ];
 };
 V.feats = function(G, win, box) {
  if (!on('a') || !G || !win) return {};
  const lu = G.lu && G.lu[0], luIds = lu ? [ ...lu.A || [], ...lu.M || [], ...lu.D || [], lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ].filter(Boolean) : [];
  let ros = [];
  try {
   ros = teamRosterIds(G.user, G.src || 'real') || [];
  } catch (e) {}
  const mine = new Set(luIds.concat(ros)), them = new Set;
  try {
   for (const id of teamRosterIds(G.opp, G.src || 'real') || []) them.add(id);
  } catch (e) {}
  const sc = Object.keys(box || {}).filter(pid => (box[pid].g || 0) > 0 && mine.has(pid) && !them.has(pid));
  const card = pid => {
   const p = PP(pid);
   return !!p && !ros.includes(pid) && (!!p.leg || !!p.gho16 || !!(window.V22 && V22.owned && V22.owned(pid)));
  };
  return {
   oneman: sc.length === 1,
   cardsc: sc.some(card),
   tew: G.diff === 5
  };
 };
 {
  const PX0 = V.pracXp;
  V.pracXp = function(G, P) {
   if (on('a') && G && !G.tutorial && G.mode !== 'tutorial') {
    LS.set('prac232', (+LS.get('prac232', 0) || 0) + 1);
    setTimeout(() => {
     try {
      V17.checkAch();
     } catch (e) {}
    }, 2600);
   }
   return PX0.apply(this, arguments);
  };
 }
 TT.won = () => {
  if (!LS.get('tw232', 0)) {
   LS.set('tw232', 1);
   try {
    V17.checkAch();
   } catch (e) {}
  }
 };
 setTimeout(() => {
  try {
   if (on('a') && window.V17) V17.checkAch();
  } catch (e) {}
 }, 1500);
 setTimeout(() => {
  try {
   if (on('d') && window.V17 && V17.dd232run) V17.dd232run();
  } catch (e) {}
 }, 1200);
 function isFinal(G) {
  if (!on('s') || !G || G.tutorial) return false;
  try {
   if (G.mode === 'world' && typeof wgame !== 'undefined' && wgame && wgame.ko) {
    if (wgame.v === 2318) {
     const m = wgMine30(wgame);
     return !!(m && m.k === 'fin');
    }
    return wgame.ko.round === 'final';
   }
   const R = window.RLNET, onl = !!(G.meta && G.meta.online), sg = onl && R && R.lobby && R.lobby.state && R.lobby.state.season;
   if (G.mode !== 'season' && !sg) return false;
   const S = season && season.online && R && R.season && R.season.S || sg && R.season && R.season.S || season;
   if (!S) return false;
   const both = g => g && g.includes(G.user) && g.includes(G.opp);
   if (S.w) {
    const st = TT.stage(S), x = st.games.find(q => both(q.g));
    return !!x && (x.kk === 'fin' || st.kind === 'br' && S.w.br.size >> S.w.br.r === 2);
   }
   return S.phase === 'playoff' && !!S.playoff && S.playoff.round === 'final' && (S.playoff.games || []).some(both);
  } catch (e) {
   return false;
  }
 }
 V.isFinal = isFinal;
 {
  const NG1 = window.newGame;
  window.newGame = function() {
   const r = NG1.apply(this, arguments);
   try {
    if (game) game.final232 = isFinal(game);
   } catch (e) {}
   return r;
  };
 }
 const GOLD = '#ffcc33', GOLD2 = '#c9961a', GDK = '#1a1408';
 const gold = () => on('s') && !!game && !!game.final232;
 V.stadiumOn = gold;
 const DS1 = window.drawStadium;
 window.drawStadium = function() {
  if (!gold()) return DS1.apply(this, arguments);
  rect(0, 17, FL, FT - 17, '#17120a');
  const pal = [ GOLD, '#ffffff', GOLD2, '#f0c090', GOLD, '#1b1b1b', '#ffe680', GOLD2, '#c48a5a', GOLD, '#ffffff' ];
  const t = game.t, loud = game.crowd > 0;
  for (let i = 0; i < CROWD.length; i++) {
   const p = CROWD[i];
   for (let rep = 0; rep < 2; rep++) for (let half = 0; half < 2; half++) {
    const x = p.x + rep * 530 - 6 + half, hop = (loud || half) && Math.floor(t * (loud ? 10 : 3) + p.ph + half) % 2 ? 1 : 0, y = 19 + p.row * 4 + half * 2 - hop;
    if (y + 2 > FT - 4) continue;
    rect(x, y, 2, 2, pal[(p.k + half * 4) % pal.length]);
    if (!half) px(x, y + 2, '#0c0f14');
   }
  }
  for (let x = 30; x < FL; x += 160) {
   rect(x - 1, 17, 12, 2, '#3a3020');
   rect(x, 17, 10, 1, '#fffbe0');
   g.globalAlpha = .18;
   rect(x - 6, 18, 22, 6, '#fff3b0');
   g.globalAlpha = 1;
  }
  rect(FL, 17, 120, H - 17, '#120e07');
  rect(FL, 17, 1, H - 17, GOLD2);
  rect(0, FT - 3, FL, 2, GOLD);
  for (let x = 60; x < FL; x += 120) {
   rect(x, FT - 9, 14, 6, GOLD);
   rect(x, FT - 9, 14, 1, '#fff2b0');
   px(x + 3, FT - 7, GDK);
   px(x + 10, FT - 7, GDK);
   text(window.V4023BL ? V4023BL.mono() : 'RL', x + 7, FT - 8, 1, GDK, 'center');
  }
  rect(0, FB + 1, FL, H - FB, GOLD);
  rect(0, FB + 1, FL, 1, 'rgba(0,0,0,.35)');
  rect(0, H - 2, FL, 1, GOLD2);
  for (let x = 10, k = 0; x < FL; x += 100, k++) text(k % 2 ? 'CHAMPIONSHIP' : 'BAGGA LAX STADIUM', x, FB + 3, 1, GDK);
 };
 const DF1 = window.drawField;
 window.drawField = function() {
  const r = DF1.apply(this, arguments);
  if (!gold()) return r;
  rect(0, FT - 1, 4, FB - FT + 2, GOLD);
  rect(FL - 4, FT - 1, 4, FB - FT + 2, GOLD);
  const x0 = MIDX - 44, x1 = MIDX + 45, y0 = CY - 27, y1 = CY + 34;
  for (let x = Math.floor(x0 / 20) * 20; x < x1; x += 20) {
   const a = Math.max(x, x0), b = Math.min(x + 20, x1);
   rect(a, y0, b - a, y1 - y0, (x / 20 | 0) % 2 ? '#3f9a40' : '#45a446');
  }
  g.globalAlpha = .55;
  text('BAGGA LAX', MIDX, CY - 12, 2, GOLD, 'center');
  text('CHAMPIONSHIP', MIDX, CY + 25, 1, '#ffffff', 'center');
  g.globalAlpha = 1;
  const L = '#e9f6e9';
  rect(MIDX, y0, 1, y1 - y0, L);
  rect(MIDX - 2, CY - 2, 5, 1, L);
  rect(MIDX - 2, CY + 2, 5, 1, L);
  px(MIDX - 1, CY - 1, L);
  px(MIDX + 1, CY + 1, L);
  px(MIDX + 1, CY - 1, L);
  px(MIDX - 1, CY + 1, L);
  return r;
 };
 if (window.GHO16 && GHO16.afterGame) {
  const AG0 = GHO16.afterGame;
  GHO16.afterGame = function(G, win) {
   const r = AG0.apply(this, arguments);
   try {
    if (r && on('d') && window.V17 && V17.give232) {
     const miss = 2 - (r.got || []).length;
     if (miss > 0) {
      const ids = (r.dup || []).slice(0, miss);
      let c = 0;
      for (let i = 0; i < miss; i++) c += V17.sell232(ids[i] ? V22.rarOf(ids[i]) : 0);
      V17.give232(c);
      r.chinos232 = c;
     }
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 if (window.V22 && V22.titleCheck) {
  const TC0 = V22.titleCheck;
  V22.titleCheck = function(Sz, w) {
   const pay = [];
   try {
    if (on('d') && V22.on()) {
     const done = LS.get('tc232', []) || [], live = V.live232 = V.live232 || new Set;
     const sid = Sz ? Sz.online ? 'o|' + (window.RLNET && RLNET.season && RLNET.season.code || '') : 'f|' + (Sz.year || '') + '|' + Sz.team : null, wid = w ? 'w|' + w.team + '|' + (w.n || '') : null;
     if (Sz && Sz.phase !== 'done') live.add(sid);
     if (w && w.phase !== 'done') live.add(wid);
     if (Sz && live.has(sid) && Sz.phase === 'done' && Sz.champ && Sz.champ === Sz.team && Sz.rosters && Sz.rosters[Sz.team]) {
      const k = 's|' + (Sz.online ? 'o' : 'f') + '|' + (Sz.year || '') + '|' + Sz.team + '|' + (Sz.lg232 || '') + '|' + Sz.teams.length + '|' + (Sz.results || []).length;
      if (!done.includes(k)) pay.push([ k, Sz.rosters[Sz.team].filter(id => V22.owned(id)) ]);
     }
     if (w && live.has(wid) && w.phase === 'done' && w.champ && w.champ === w.team) {
      const k = 'w|' + w.team + '|' + (w.n || '') + '|' + (w.results || []).length;
      if (!done.includes(k)) pay.push([ k, teamRosterIds(w.team, 'real').filter(id => V22.owned(id)) ]);
     }
    }
   } catch (e) {
    console.error(e);
   }
   const r = TC0.apply(this, arguments);
   if (pay.length) {
    const done = LS.get('tc232', []) || [];
    let c = 0;
    for (const [k, ids] of pay) {
     done.push(k);
     for (const id of ids) c += V17.sell232(V22.rarOf(id));
    }
    LS.set('tc232', done.slice(-60));
    if (c) V17.give232(c);
    V.titlePaid = (V.titlePaid || 0) + c;
   }
   return r;
  };
 }
 const CK = 'coach232';
 const coaches = () => {
  const c = LS.get(CK, {});
  return c && typeof c === 'object' ? c : {};
 };
 const COACH232 = {
  WHAU: 'HOLLIS BRANNOCK'
 };
 const coachName = tid => {
  if (COACH232[tid]) return COACH232[tid];
  try {
   const t = T(tid);
   return (t.coach || t.name + ' HEAD COACH').toUpperCase();
  } catch (e) {
   return 'HEAD COACH';
  }
 };
 V.coaches = coaches;
 function giveCoach(tid, why, quiet) {
  if (!on('k') || !tid) return null;
  if (window.V33 && V33.kindOf(tid) && V33.onCT()) return null;
  try {
   T(tid);
  } catch (e) {
   return null;
  }
  const c = coaches();
  if (c[tid]) return 'have';
  c[tid] = {
   n: coachName(tid),
   at: Date.now(),
   w: why || ''
  };
  LS.set(CK, c);
  if (!quiet) {
   try {
    V17.toast('HEAD COACH CARD: ' + coachName(tid) + ' (' + T(tid).name + ')', '#ffcc33');
   } catch (e) {}
  }
  return 'new';
 }
 V.giveCoach = giveCoach;
 function coachRetro() {
  if (!on('k') || LS.get('coach232r', 0)) return [];
  const got = [], teams = new Set;
  try {
   const S22 = window.V22 && V22.st ? V22.st() : null;
   if (S22 && S22.cards) for (const pid in S22.cards) {
    const c = S22.cards[pid];
    if (c && c.t && /SEASON|WORLD GAMES|USAGOLD/.test(c.w || '')) teams.add(c.t);
   }
   if (S22 && S22.usa && typeof WT_REG !== 'undefined' && WT_REG.WUSA) teams.add('WUSA');
   const sz = LS.get('season', null);
   if (sz && sz.phase === 'done' && sz.champ && sz.champ === sz.team) teams.add(sz.team);
   const wg = typeof wgame !== 'undefined' ? wgame : null;
   if (wg && wg.phase === 'done' && wg.champ && wg.champ === wg.team) teams.add(wg.team);
  } catch (e) {
   console.error(e);
  }
  for (const t of teams) if (giveCoach(t, 'PAST TITLE', true) === 'new') got.push(t);
  LS.set('coach232r', 1);
  if (got.length) {
   try {
    V17.toast('HEAD COACH CARDS FOR YOUR PAST TITLES: ' + got.map(coachName).join(', '), '#ffcc33');
   } catch (e) {}
  }
  V.retroGot = got;
  return got;
 }
 V.coachRetro = coachRetro;
 setTimeout(() => {
  try {
   coachRetro();
  } catch (e) {
   console.error(e);
  }
 }, 1300);
 if (window.V22 && V22.titleCheck) {
  const TC1 = V22.titleCheck;
  V22.titleCheck = function(Sz, w) {
   const r = TC1.apply(this, arguments);
   try {
    if (on('k')) {
     const live = V.live232 || new Set, paid = LS.get('cc232', []) || [];
     const one = (tid, key, why, isLive) => {
      const g = giveCoach(tid, why);
      if (g === 'have' && isLive && !paid.includes(key)) {
       paid.push(key);
       LS.set('cc232', paid.slice(-60));
       V17.give232(V17.sell232(1));
      } else if (g === 'new' && !paid.includes(key)) {
       paid.push(key);
       LS.set('cc232', paid.slice(-60));
      }
     };
     if (Sz && Sz.phase === 'done' && Sz.champ && Sz.champ === Sz.team) {
      const sid = Sz.online ? 'o|' + (window.RLNET && RLNET.season && RLNET.season.code || '') : 'f|' + (Sz.year || '') + '|' + Sz.team;
      one(Sz.team, 'c' + sid + '|' + (Sz.results || []).length, Sz.online ? 'ONLINE SEASON' : 'SEASON', live.has(sid));
     }
     if (w && w.phase === 'done' && w.champ && w.champ === w.team) {
      const wid = 'w|' + w.team + '|' + (w.n || '');
      one(w.team, 'c' + wid + '|' + (w.results || []).length, 'WORLD GAMES', live.has(wid));
     }
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 const WHAUC_PAL = {
  H: '#3b2a1d',
  h: '#5c4430',
  S: '#eab896',
  s: '#cc9172',
  r: '#e39a86',
  B: '#3b2a1d',
  E: '#2f5f9e',
  m: '#8a3b33',
  W: '#ffffff',
  P: '#5d2a8c',
  p: '#3c1760',
  L: '#7b45b0'
 };
 const WHAUC232 = {
  WHAU: [ '....................', '.......pPPPPp.......', '.....pPPPLLPPPp.....', '....pPPPPPPPPPPp....', '...pppppppppppppp...', '....gSSSSSSSSSSg....', '...sgGGGSSSSGGGgs...', '...sSSWoSSSSoWSSs...', '....SSSSSSSSSSSS....', '....SSSSSssSSSSS....', '....SSSSSssSSSSS....', '....SSggggggggSS....', '....SSSSmmmmSSSS....', '.....SSSSSSSSSS.....', '......sSSSSSSs......', '.......ssSSss.......', '...PPPLLsssLLPPP....', '..PPPPPLLpLLPPPPPP..', '.PPPPPPPpWpPPPPPPPP.', 'PPPPPPPPpWpPPPPPPPPP' ]
 };
 Object.assign(WHAUC_PAL, {
  g: '#8f8f8f',
  G: '#5e5a56',
  o: '#3a2416',
  K: '#c9b27c',
  k: '#a38c5a',
  b: '#2e2218',
  Y: '#d9b44a',
  D: '#2a2420',
  d: '#4a3f36',
  X: '#8a5a2b',
  M: '#c9a46b',
  n: '#b39566',
  l: '#e8d9b0'
 });
 const WHAUC2401 = {
  WHAU: [ '................................................', '.....MXXXM...........pPPPPp.....................', '....MX.nnXXM........pPPLLPPp....................', '....X.n..nXX.......pPPPPPPPPp...................', '....Xn.nn.nXM.....pppppppppppp..................', '...Xnn.nn.nXX......gSSSSSSSSg...................', '..MX..n..n.XX.....sgGGSSSSGGgs..................', '..MXnn.nn.nXX.....sSWoSSSSoWSs..................', '..MXnn.nn.nXX......SSSSSSSSSS...................', '...X..n..n.XX......SSSSssSSSS...................', '....Xn.nn.nXX......SSggggggSS...................', '....Xn.nn.nXX......SSSmmmmSSS...................', '.....ln..n.XX.......SSSSSSSS....................', '......lnn.nXM........sSSSSs.....................', '.......ll.nXM.........ssss......................', '.........llXM..P.PPPLLssssLLPPP.P...............', '...........XMPPPPPPLLPPssPPLLPppPPp.............', '...........XMPPPPPPPPPPppPPPPPppPPp.............', '...........XMPPPPPPPPPPWpPPPPPppPPp.............', '...........XMPPPPPPPPPPppPPPPPppPPp.............', '...........XMpppPPPPPPPPPPPPPPppppp.............', '...........XMsS.PPPPPPPPPPPPPPpp.Ss.............', '...........XMsS.PPPPPPPPPPPPPPpp.Ss.............', '...........XMsS.PPPPPPPPPPPPPPpp.Ss.............', '...........XMsS.PPPPPPPPPPPPPPpp.Ss.............', '...........XMsS.PPPPPPPPPPPPPPpp.Ss.............', '...........XMsS.PPPPPPPPPPPPPPpp.Ss.............', '...........sSSS.pppppppppppppppp.SSS............', '...........SSSS.bbbbbbbYYbbbbbbb.SSS............', '...........sSSS.KKKKKKKKKKKKKKkk.SSs............', '...........XM...KKKKKKKkkKKKKKkk................', '...........XM...KKKKKKKkkKKKKKkk................', '...........XM...KKKKKKk..kKKKKkk................', '...........XM...KKKKKKk..kKKKKkk................', '...........XM...KKKKKKk..kKKKKkk................', '...........XM...KKKKKKk..kKKKKkk................', '...........XM...KKKKKKk..kKKKKkk................', '...........XM...KKKKKKk..kKKKKkk................', '...........XM...KKKKKKk..kKKKKkk................', '...........XM....KKKKKk..kKKKKk.................', '...........XM....KKKKKk..kKKKKk.................', '...........XM....KKKKKk..kKKKKk.................', '...........XM....KKKKKk..kKKKKk.................', '...........XM...DdddddD..DdddddD................', '...........XM..DDDDDDDD..DDDDDDDD...............', '...........XM..DDDDDDDD..DDDDDDDD...............', '................................................', '................................................' ]
 };
 const on2401 = () => !window.__rl_no2401 && !FISH();
 V.ward2401 = () => !!WHAUC2401.WHAU && on2401();
 V.coachArt = tid => coachUrl(tid);
 const COACH2401 = [ '................................................', '.....................HHHHHH.....................', '....................HHHHHHHH....................', '...................HHHHHHHHHH...................', '...................HSSHHHHSSH...................', '...................SSSSSSSSSS...................', '..................sSBBSSSSBBSs..................', '..................sSesSSSSseSs..................', '...................SSSSSsSSSS...................', '...................SSSSSsSSSS...................', '...................SSSSSSSSSS...................', '...................SSqSSSSqSS...................', '....................SSqqqqSS....................', '.....................sSSSSs.....................', '......................ssss......................', '...............P.PPPLLssssLLPPP.P...............', '.............PPPPPPLLPPssPPLLPppPPp.............', '.............PPPPPPPPPPppPPPPPppPPp.............', '.............PPPPPPPPPPWpPPPPPppPPp.............', '.............PPPPPPPPPPppPPPPPppPPp.............', '.............pppPPPPPPPPPPPPPPppppp.............', '.............sS.PPPPPPPPPPPPPPpp.Ss.............', '.............sS.PPPPPPPPPPPPPPpp.Ss.............', '.............sS.PPPPPPPPPPPPPPpp.Ss.............', '.............sS.PPPPPPPPPPPPPPpp.Ss.............', '.............sS.PPPPPPPPPPPPPPpp.Ss.............', '.............sS.PPPPPPPPPPPPPPpp.Ss.............', '............SSS.pppppppppppppppp.SSS............', '............SSS.bbbbbbbYYbbbbbbb.SSS............', '............sSS.KKKKKKKKKKKKKKkk.SSs............', '................KKKKKKKkkKKKKKkk................', '................KKKKKKKkkKKKKKkk................', '................KKKKKKk..kKKKKkk................', '................KKKKKKk..kKKKKkk................', '................KKKKKKk..kKKKKkk................', '................KKKKKKk..kKKKKkk................', '................KKKKKKk..kKKKKkk................', '................KKKKKKk..kKKKKkk................', '................KKKKKKk..kKKKKkk................', '.................KKKKKk..kKKKKk.................', '.................KKKKKk..kKKKKk.................', '.................KKKKKk..kKKKKk.................', '.................KKKKKk..kKKKKk.................', '................DdddddD..DdddddD................', '...............DDDDDDDD..DDDDDDDD...............', '...............DDDDDDDD..DDDDDDDD...............', '................................................', '................................................' ];
 const shade2401 = (c, f) => {
  const n = parseInt(String(c || '#555555').slice(1, 7), 16) || 0;
  return '#' + [ 16, 8, 0 ].map(s => Math.round((n >> s & 255) * f).toString(16).padStart(2, '0')).join('');
 };
 function coachPal2401(tid) {
  const t = T(tid) || {}, c1 = /^#[0-9a-f]{6}$/i.test(t.c1 || '') ? t.c1 : '#555555', c2 = /^#[0-9a-f]{6}$/i.test(t.c2 || '') ? t.c2 : '#ffffff';
  return Object.assign({}, WHAUC_PAL, {
   e: '#2a1f1a',
   q: '#a86452',
   P: c1,
   p: shade2401(c1, .7),
   L: c2
  });
 }
 V.wardArt = () => coachUrl('WHAU');
 V.coachGrid2401 = COACH2401;
 V.coachPal2401 = coachPal2401;
 const coachArt = new Map;
 function coachUrl(tid) {
  const fb = on2401(), key = fb ? tid + '|2401' : tid;
  if (coachArt.has(key)) return coachArt.get(key);
  let u = '';
  try {
   const c = document.createElement('canvas');
   c.width = c.height = fb ? 48 : 40;
   const x = c.getContext('2d');
   if (fb) {
    const G = WHAUC2401[tid] || COACH2401, pal = WHAUC2401[tid] ? WHAUC_PAL : coachPal2401(tid);
    G.forEach((r, y) => {
     for (let i = 0; i < r.length; i++) {
      const k = pal[r[i]];
      if (k) {
       x.fillStyle = k;
       x.fillRect(i, y, 1, 1);
      }
     }
    });
   } else if (WHAUC232[tid]) WHAUC232[tid].forEach((r, y) => {
    for (let i = 0; i < r.length; i++) {
     const k = WHAUC_PAL[r[i]];
     if (k) {
      x.fillStyle = k;
      x.fillRect(i * 2, y * 2, 2, 2);
     }
    }
   }); else RL12.draw(x, 'coach_idle0', 20, 37, V22.kitOf(tid), true, {
    skin: 0
   });
   u = c.toDataURL();
  } catch (e) {}
  coachArt.set(key, u);
  return u;
 }
 const on2403 = () => !window.__rl_no2403 && !FISH();
 const COACH_LEG2403 = [ 'BENNY ELLISON' ];
 const COACH_RARE2403 = [ 'MONTE KENNARD', 'SAL CLIFTON', 'LEON WILDER', 'HUGH COSBY', 'STAN OLIPHANT', 'WALLY COLLIER', 'CARL LOCKHART', "ROYCE SEABROOK" ];
 const coachRar2403 = n => {
  const k = String(window.V401H && V401H.canon ? V401H.canon(n) : n || '').toUpperCase().trim();
  return COACH_LEG2403.includes(k) ? 2 : COACH_RARE2403.includes(k) ? 1 : 0;
 };
 V.coachRar2403 = coachRar2403;
 V.COACH_RARE2403 = COACH_RARE2403;
 V.on2403 = on2403;
 if (window.V22 && V22.playersHtml) {
  const PH00 = V22.playersHtml, RN03 = [ 'COMMON', 'RARE', 'LEGENDARY' ];
  V22.playersHtml = function(legCards, legHave, legTot, crew) {
   if (!on('k') || !on2403()) return PH00.apply(this, arguments);
   const c = coaches(), ids = Object.keys(c).sort((a, b) => (c[a].at || 0) - (c[b].at || 0)), cr = {};
   for (const k in crew || {}) cr[k] = Object.assign({}, crew[k]);
   for (const tid of ids) {
    let tn = '';
    try {
     tn = T(tid).name.toUpperCase();
    } catch (e) {
     continue;
    }
    const r = coachRar2403(c[tid].n), q = cr[r] || (cr[r] = {
     cards: '',
     un: 0,
     tot: 0
    });
    q.cards += '<div class="c17 r' + r + ' cc232 cc2403" data-tid="' + esc(tid) + '" data-rar="' + r + '" aria-label="' + esc(c[tid].n + ' - ' + RN03[r] + ' HEAD COACH') + '"><i class="tag2311 tag2403">COACH</i><div class="art"><img alt="" src="' + coachUrl(tid) + '"></div><div class="nm">' + esc(c[tid].n) + '</div><div class="rr">' + RN03[r] + ' - COACH</div><div class="role17">' + esc(tn) + '</div></div>';
    q.un++;
    q.tot++;
   }
   return PH00.call(this, legCards, legHave, legTot, cr);
  };
 }
 if (window.V22 && V22.playersHtml) {
  const PH0 = V22.playersHtml;
  V22.playersHtml = function() {
   const h = PH0.apply(this, arguments);
   if (!on('k')) return h;
   if (on2403()) return h;
   const c = coaches(), ids = Object.keys(c).sort((a, b) => (c[a].at || 0) - (c[b].at || 0));
   const tile = tid => '<div class="c17 r1 cc232" data-tid="' + esc(tid) + '" aria-label="' + esc(c[tid].n + ' - HEAD COACH') + '"><div class="art"><img alt="" src="' + coachUrl(tid) + '"></div><div class="nm">' + esc(c[tid].n) + '</div><div class="rr">HEAD COACH - ' + esc(T(tid).name.toUpperCase()) + '</div></div>';
   return h + '<div class="sec17 row22" id="cc232row"><div class="sh17" style="color:#ffcc33">HEAD COACHES <span>' + ids.length + ' OWNED</span></div><div class="grid17">' + (ids.length ? ids.map(tile).join('') : '<div class="note">NONE YET - WIN A TITLE (SEASON OR WORLD GAMES) AND THAT TEAM\'S HEAD COACH LANDS HERE. COLLECTIBLE ONLY.</div>') + '</div></div>';
  };
 }
 const legMap = () => {
  const m = {};
  try {
   for (const it of V17.I) if (it.leg20) {
    const p = PP(it.leg20);
    if (p && p.legTeam && TEAMS.concat(WTEAMS).some(t => t.id === p.legTeam)) (m[p.legTeam] = m[p.legTeam] || []).push(it.id);
   }
  } catch (e) {}
  return m;
 };
 V.legMap = legMap;
 V.legP = .25;
 function giveLeg(tid, quiet) {
  if (!on('g') || !window.V17) return [ [], [] ];
  const ids = (legMap()[tid] || []).filter(id => window.__rl_v124gb || window.__rl_no332leg || id === __x("bGVnX2dhcnJ5")), st = V17.ST(), got = [], had = [];
  for (const id of ids) {
   if (Math.random() >= V.legP) continue;
   if ((st.inv[id] || 0) > 0) had.push(id); else {
    V17.grant(id, 1);
    got.push(id);
   }
  }
  if (got.length) {
   V17.save();
   if (!quiet) {
    try {
     V17.toast('LEGACY CARD: ' + got.map(id => V17.BY[id].n).join(' + '), '#f5dd8f');
    } catch (e) {}
   }
  }
  return [ got, had ];
 }
 V.giveLeg = giveLeg;
 setTimeout(() => {
  try {
   if (!on('g') || LS.get('leg232r', 0)) return;
   const teams = new Set;
   const S22 = window.V22 && V22.st ? V22.st() : null;
   if (S22 && S22.cards) for (const pid in S22.cards) {
    const c = S22.cards[pid];
    if (c && c.t && /SEASON|WORLD GAMES|USAGOLD/.test(c.w || '')) teams.add(c.t);
   }
   if (S22 && S22.usa) teams.add('WUSA');
   const sz = LS.get('season', null);
   if (sz && sz.phase === 'done' && sz.champ && sz.champ === sz.team) teams.add(sz.team);
   const got = [];
   for (const t of teams) got.push(...giveLeg(t, true)[0]);
   LS.set('leg232r', 1);
   V.legRetro = got;
   if (got.length) V17.toast('LEGACY CARDS FOR YOUR PAST TITLES: ' + got.map(id => V17.BY[id].n).join(', '), '#f5dd8f');
  } catch (e) {
   console.error(e);
  }
 }, 1400);
 if (window.V22 && V22.titleCheck) {
  const TC2 = V22.titleCheck;
  V22.titleCheck = function(Sz, w) {
   const r = TC2.apply(this, arguments);
   try {
    if (on('g')) {
     const live = V.live232 || new Set, paid = LS.get('lg232', []) || [];
     const one = (tid, key, isLive) => {
      if (!isLive || paid.includes(key) || !(legMap()[tid] || []).length) return;
      paid.push(key);
      LS.set('lg232', paid.slice(-60));
      const [got, had] = giveLeg(tid);
      if (had.length && isLive) V17.give232(had.length * V17.sell232(2));
     };
     if (Sz && Sz.phase === 'done' && Sz.champ && Sz.champ === Sz.team) {
      const sid = Sz.online ? 'o|' + (window.RLNET && RLNET.season && RLNET.season.code || '') : 'f|' + (Sz.year || '') + '|' + Sz.team;
      one(Sz.team, 'g' + sid + '|' + (Sz.results || []).length, live.has(sid));
     }
     if (w && w.phase === 'done' && w.champ && w.champ === w.team) {
      const wid = 'w|' + w.team + '|' + (w.n || '');
      one(w.team, 'g' + wid + '|' + (w.results || []).length, live.has(wid));
     }
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
})();

(function() {
 'use strict';
 const on = () => !window.__rl_no2403 && !window.__rl_v124gb;
 const F = window.FLIP2403 = {
  on: on
 };
 F.gho = pl => on() && !!(pl && pl.gho16 && window.GHO16 && GHO16.on());
 const LEG = {
  'LEG-0': {
   helmet: 'helm_leather',
   legs: 'shorts_short',
   leather20: 1,
   wood20: 1,
   socks20: 1
  },
  'LEG-2': {
   helmet: 'helm_leather',
   legs: 'shorts_short',
   leather20: 1,
   socks20: 1
  },
  'LEG-3': {
   helmet: 'helm_leather',
   legs: 'shorts_short',
   leather20: 1,
   socks20: 1
  }
 };
 F.LEG = LEG;
 if (window.V17 && V17.bakeHero && V17.bakeGear) {
  const bh0 = V17.bakeHero;
  V17.bakeHero = function(name, kit, skin, gray, flip) {
   if (!on() || gray) return bh0.apply(this, arguments);
   const pl = window.__v17hp ? PP(window.__v17hp) : null, gr = pl && pl.leg ? LEG[pl.id] : null;
   if (!gr) return bh0.apply(this, arguments);
   return V17.bakeGear(name, kit, !!flip, skin, Object.assign({}, gr), false, {
    nopad: true
   });
  };
 }
 const CACHE = new Map;
 const cl = o => JSON.parse(JSON.stringify(o));
 function dry(user, opp, mode, lu1) {
  const key = user + '|' + opp + '|' + mode, c = CACHE.get(key), t = performance.now();
  if (c && t - c.t < 400) return c.lu;
  let lu = null;
  try {
   const G = {
    user: user,
    opp: opp,
    mode: mode,
    src: 'real',
    userHome: true,
    meta: null,
    lu: [ lineupFor(user, 'real'), lu1 ? cl(lu1) : lineupFor(opp, 'real') ]
   };
   if (window.V22) V22.fixGame(G);
   if (window.CP2319) CP2319.stripGame(G);
   lu = [ G.lu[0], G.lu[1] ];
  } catch (e) {
   lu = null;
  }
  CACHE.set(key, {
   t: t,
   lu: lu
  });
  return lu;
 }
 F.dry = dry;
 const baseLu = tid => {
  try {
   return autoLineup(teamRosterIds(tid, 'real'));
  } catch (e) {
   return null;
  }
 };
 const vsIds0 = window.vsIds;
 window.vsIds = function(tid, src, lu) {
  if (!on() || lu || !tid || src !== 'real' || screen !== 'matchup' || typeof menuSel === 'undefined' || !menuSel.team || !menuSel.opp) return vsIds0.apply(this, arguments);
  const i = tid === menuSel.team ? 0 : tid === menuSel.opp ? 1 : -1;
  if (i < 0) return vsIds0.apply(this, arguments);
  const L = dry(menuSel.team, menuSel.opp, 'quick');
  return L && L[i] ? vsIds0.call(this, tid, src, L[i]) : vsIds0.apply(this, arguments);
 };
 const lobbyIds0 = window.lobbyIds;
 window.lobbyIds = function() {
  if (!on() || screen !== 'menu') return lobbyIds0.apply(this, arguments);
  const tid = lobbyTeam();
  if (!tid || lobbySrc() !== 'real') return lobbyIds0.apply(this, arguments);
  const mode = typeof homeWorld === 'function' && homeWorld() ? 'world' : typeof homeQuick16 === 'function' && homeQuick16() ? 'quick' : null;
  if (!mode) return lobbyIds0.apply(this, arguments);
  const L = dry(tid, tid, mode, baseLu(tid));
  if (!L || !L[0]) return lobbyIds0.apply(this, arguments);
  return curIds2402(tid, 'real', L[0]).filter(id => PP(id)).slice().sort((a, b) => curOvr14(b) - curOvr14(a) || (a < b ? -1 : 1));
 };
 const ONC = {
  k: null,
  t: 0,
  lu: null
 };
 function onlineDry(st, host) {
  const myT = host ? st.hteam : st.gteam, opT = host ? st.gteam : st.hteam;
  if (!myT || !opT) return null;
  const mlu = host ? st.hlu : st.glu, olu = host ? st.glu : st.hlu, a = st.hcp19, b = st.gcp19;
  const key = myT + '|' + opT + '|' + JSON.stringify([ mlu, olu, a, b ]), t = performance.now();
  if (ONC.k === key && t - ONC.t < 400) return ONC.lu;
  let lu = null;
  try {
   const G = {
    user: myT,
    opp: opT,
    mode: 'online',
    online: true,
    src: 'real',
    userHome: host,
    meta: {
     online: true
    },
    lu: [ lineupFor(myT, 'real'), lineupFor(opT, 'real') ]
   };
   try {
    if (olu && lineupValid(olu, teamRosterIds(opT, 'real').concat(window.V22 ? V22.subIds(olu) : []))) G.lu[1] = cl(olu);
   } catch (e) {}
   try {
    if (mlu && lineupValid(mlu, teamRosterIds(myT, 'real'))) G.lu[0] = cl(mlu);
   } catch (e) {}
   if (window.V22) V22.fixGame(G);
   if (window.CP2319) {
    G.cp2319 = !CP2319.on() ? true : a != null && b != null ? CP2319.lobbyAll(st) : !(a === false || b === false);
    CP2319.stripGame(G);
   }
   lu = {
    [myT]: G.lu[0],
    [opT]: G.lu[1]
   };
  } catch (e) {
   lu = null;
  }
  ONC.k = key;
  ONC.t = t;
  ONC.lu = lu;
  return lu;
 }
 F.onlineDry = onlineDry;
 const vsIds1 = window.vsIds;
 window.vsIds = function(tid, src, lu) {
  if (!on() || lu || !tid || src !== 'real' || screen !== 'onLobby') return vsIds1.apply(this, arguments);
  const R = window.RLNET, st = R && R.lobby && R.lobby.state;
  if (!st || st.season || !R.lobby.hasGuest && R.side === 'h') return vsIds1.apply(this, arguments);
  const L = onlineDry(st, R.side === 'h');
  return L && L[tid] ? vsIds1.call(this, tid, src, L[tid]) : vsIds1.apply(this, arguments);
 };
})();

(function() {
 'use strict';
 if (typeof CanvasRenderingContext2D === 'undefined' || typeof RL12 === 'undefined') return;
 const on = () => !window.__rl_no2403 && !window.__rl_v124gb;
 const FRONTN = n => /^bench|^lobby|^d8S_/.test(n), isSk = ch => ch === 'S' || ch === 's' || ch === 'Z', isJ = ch => ch === 'J' || ch === 'j';
 let CAND = null, nFR = -1;
 function frameInfo(n) {
  const rows = RL12.FR[n][3], h = rows.length, w = rows[0].length;
  let jy = h;
  for (let y = 0; y < h; y++) if (rows[y].split('').filter(isJ).length >= 3) {
   jy = y;
   break;
  }
  const pupils = [], E = [], seen = {}, hp = [];
  for (let y = 0; y < jy; y++) for (let x = 1; x < w - 1; x++) if (rows[y][x] === 'o' && isSk(rows[y][x - 1]) && isSk(rows[y][x + 1])) pupils.push([ x, y ]);
  for (const [px, py] of pupils) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
   const x = px + dx, y = py + dy;
   if ((dx || dy) && y >= 0 && y < h && isSk(rows[y][x]) && !seen[x + ',' + y]) {
    seen[x + ',' + y] = 1;
    E.push([ x, y ]);
   }
  }
  const py0 = pupils.length ? Math.min(...pupils.map(p => p[1])) : 0;
  for (let y = 0; y < py0; y++) for (let x = 0; x < w; x++) if (rows[y][x] === 'h') hp.push([ x, y ]);
  const ref = E.map(([x, y]) => {
   const l = [];
   for (let d = 1; d < w; d++) for (const xx of [ x - d, x + d ]) if (xx >= 0 && xx < w && rows[y][xx] === rows[y][x]) l.push([ xx, y ]);
   return l;
  });
  const groups = [];
  for (const L of [ 'S', 'Z', 's' ]) {
   const g = [];
   for (let y = 0; y < jy; y++) for (let x = 0; x < w; x++) if (rows[y][x] === L) g.push([ x, y ]);
   if (g.length > 1) groups.push(g);
  }
  return {
   n: n,
   w: w,
   h: h,
   pupils: pupils,
   E: E,
   ref: ref,
   hp: hp,
   groups: groups
  };
 }
 function cands() {
  const ks = Object.keys(RL12.FR);
  if (CAND && ks.length === nFR) return CAND;
  nFR = ks.length;
  CAND = {};
  for (const n of ks) {
   if (!FRONTN(n)) continue;
   const f = RL12.FR[n];
   if (!f || !f[3] || !f[3].length) continue;
   const fi = frameInfo(n);
   if (!fi.pupils.length || !fi.hp.length) continue;
   (CAND[fi.w + 'x' + fi.h] = CAND[fi.w + 'x' + fi.h] || []).push(fi);
  }
  return CAND;
 }
 const FIX = new WeakMap, di0 = CanvasRenderingContext2D.prototype.drawImage;
 function fixed(c) {
  let r = FIX.get(c);
  if (r) return r;
  r = c;
  try {
   const pad = c.pad17 || 0, list = cands()[c.width - 2 * pad + 'x' + (c.height - 2 * pad)];
   if (list && c.width && c.height) {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (const fi of list) {
     let hit = null, best = -1;
     for (const flip of [ false, true ]) {
      const K = (x, y) => ((y + pad) * c.width + (flip ? fi.w - 1 - x : x) + pad) * 4, col = k => d[k + 3] === 255 ? d[k] << 16 | d[k + 1] << 8 | d[k + 2] : -1;
      const co = col(K(fi.pupils[0][0], fi.pupils[0][1]));
      if (co < 0 || fi.pupils.some(([x, y]) => col(K(x, y)) !== co)) continue;
      const ch = col(K(fi.hp[0][0], fi.hp[0][1]));
      if (ch < 0 || ch === co || fi.hp.some(([x, y]) => col(K(x, y)) !== ch)) continue;
      const rep = [];
      let bad = false;
      fi.E.forEach(([x, y], i) => {
       if (col(K(x, y)) !== ch) return;
       const q = fi.ref[i].find(([qx, qy]) => {
        const qv = col(K(qx, qy));
        return qv >= 0 && qv !== ch;
       });
       if (q) rep.push([ K(x, y), K(q[0], q[1]) ]); else bad = true;
      });
      if (bad || !rep.length) continue;
      let sc = 0;
      for (const grp of fi.groups) {
       const cs = grp.map(([x, y]) => col(K(x, y))).filter(v => v !== ch), m = {};
       let top = 0;
       for (const v of cs) {
        m[v] = (m[v] || 0) + 1;
        top = Math.max(top, m[v]);
       }
       sc += top;
      }
      if (sc > best) {
       best = sc;
       hit = rep;
      }
     }
     if (hit) {
      const o = document.createElement('canvas');
      o.width = c.width;
      o.height = c.height;
      const x = o.getContext('2d');
      x.imageSmoothingEnabled = false;
      const im = x.createImageData(c.width, c.height);
      im.data.set(d);
      for (const [k, q] of hit) {
       im.data[k] = d[q];
       im.data[k + 1] = d[q + 1];
       im.data[k + 2] = d[q + 2];
       im.data[k + 3] = d[q + 3];
      }
      x.putImageData(im, 0, 0);
      o.pad17 = c.pad17;
      o.eyes2403 = hit.length;
      FIX.set(o, o);
      r = o;
      break;
     }
    }
   }
  } catch (e) {
   r = c;
  }
  FIX.set(c, r);
  return r;
 }
 CanvasRenderingContext2D.prototype.drawImage = function(img) {
  if (img && img.pad17 !== undefined && on()) {
   const f = fixed(img);
   if (f !== img) {
    const a = Array.prototype.slice.call(arguments);
    a[0] = f;
    return di0.apply(this, a);
   }
  }
  return di0.apply(this, arguments);
 };
 window.EYES2403 = {
  on: on,
  fixed: fixed,
  frameInfo: frameInfo,
  cands: cands,
  drawImage0: di0
 };
})();

(() => {
 const on = () => !window.__rl_no2404 && !window.__rl_v124gb;
 const R = window.R2404 = {
  on: on
 };
 const cl = o => JSON.parse(JSON.stringify(o));
 const SLOTK = [ [ 'A', 0 ], [ 'A', 1 ], [ 'A', 2 ], [ 'M', 0 ], [ 'M', 1 ], [ 'M', 2 ], [ 'D', 0 ], [ 'D', 1 ], [ 'D', 2 ], [ 'LSM' ], [ 'SSDM' ], [ 'SSDM2' ], [ 'FO' ], [ 'G' ] ];
 const sget = (lu, s) => s.length > 1 ? (lu[s[0]] || [])[s[1]] : lu[s[0]];
 const sset = (lu, s, v) => {
  if (s.length > 1) lu[s[0]][s[1]] = v; else lu[s[0]] = v;
 };
 const OFFK = SLOTK.slice(0, 6), DEFK = SLOTK.slice(6, 12);
 const luAll = lu => lu ? SLOTK.map(s => sget(lu, s)).filter(Boolean) : [];
 const ros = tid => {
  try {
   const r = teamRosterIds(tid, 'real');
   return Array.isArray(r) ? r : [];
  } catch (e) {
   return [];
  }
 };
 R.cards = (tid, lu) => {
  const r = ros(tid);
  return luAll(lu).filter(id => !r.includes(id));
 };
 function cleanLu(tid, lu) {
  const r = ros(tid);
  if (!lu || !r.length) return lu;
  const bad = id => id && !r.includes(id);
  if (!luAll(lu).some(bad)) return lu;
  const out = cl(lu), base = LS.get('lu2404b_' + tid, null), donor = autoLineup(r);
  const unitOf = s => OFFK.includes(s) ? OFFK : DEFK.includes(s) ? DEFK : [ s ];
  for (const src of base || !(window.R2405 && R2405.on()) ? [ base, donor, null ] : [ donor, null ]) for (const s of SLOTK) {
   const v = sget(out, s);
   if (!bad(v)) continue;
   const used = new Set(unitOf(s).map(k => sget(out, k)).concat(s[0] === 'G' ? luAll(out).filter(x => x !== v) : [ out.G ]));
   const cand = (src ? [ sget(src, s) ] : []).concat(src ? [] : r.slice().sort((a, b) => (PP(b) ? PP(b).ovr : 0) - (PP(a) ? PP(a).ovr : 0)));
   const pick = cand.find(c => c && r.includes(c) && PP(c) && !used.has(c));
   if (pick) sset(out, s, pick);
  }
  return lineupValid(out, r) ? out : autoLineup(r);
 }
 R.cleanLu = cleanLu;
 function reset(tid) {
  if (!on() || !tid) return false;
  const lu = LS.get('lu_' + tid, null);
  if (!lu || !R.cards(tid, lu).length) return false;
  LS.set('lu_' + tid, cleanLu(tid, lu));
  try {
   if (typeof CUR2402 !== 'undefined') CUR2402.clear();
  } catch (e) {}
  return true;
 }
 R.reset = reset;
 R.pendLobby = false;
 const ng0 = window.newGame;
 window.newGame = function(user, opp, mode, userHome, meta) {
  const r = ng0.apply(this, arguments);
  try {
   if (on() && game && (mode === 'quick' || mode === 'online') && game.src !== 'season') {
    reset(user);
    if (mode === 'online' || meta && meta.online) R.pendLobby = true;
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT.luSave) {
  const ls0 = PANEL_ACT.luSave;
  PANEL_ACT.luSave = function() {
   const tid = PS.luTeam, src = PS.luSrc, back = PS.luBack;
   try {
    if (on() && src !== 'season' && back !== 'timeout' && tid) {
     const before = lineupFor(tid, src);
     if (before && !R.cards(tid, before).length) LS.set('lu2404b_' + tid, before);
    }
   } catch (e) {}
   const r = ls0.apply(this, arguments);
   try {
    if (on() && back === 'timeout' && game && (game.mode === 'quick' || game.mode === 'online') && src !== 'season') reset(tid);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 setInterval(() => {
  try {
   if (!R.pendLobby || !on()) return;
   const N = window.RLNET;
   if (!N || !N.lobby || !N.lobby.state) {
    R.pendLobby = false;
    return;
   }
   if (N.inGame || screen !== 'onLobby') return;
   R.pendLobby = false;
   const st = N.lobby.state;
   if (st.season) return;
   const host = N.side === 'h', t = host ? st.hteam : st.gteam;
   if (!t) return;
   const lu = lineupFor(t, 'real'), k = host ? 'hlu' : 'glu';
   if (JSON.stringify(st[k] || null) === JSON.stringify(lu)) return;
   st[k] = lu;
   if (N.patchLobby) N.patchLobby({
    [k]: lu
   });
  } catch (e) {
   console.error(e);
  }
 }, 250);
 const SK = {
  "perry kenyon": 4,
  "zack everett": 4,
  "kirk ewing": 4,
  "owen loring": 4,
  "owen lanford": 4,
  "perry lyons": 4,
  "rowan stockton": 4,
  "jagger pace": 4,
  "emmett reddick": 3,
  "garrett wickliffe": 2,
  "arthur marsden": 2,
  "bruno ansley": 2,
  "thane mosby": 2,
  "dale haddock": 2,
  "wesley gaines": 2,
  "levi mcbride": 2,
  "jarrett pettaway": 2,
  "hank roper": 2,
  "avery colfield": 1,
  "zane gaskins": 1
 };
 const LEGSK = {
  'LEG-0': 0,
  'LEG-1': 0,
  'LEG-2': 4,
  'LEG-3': 0
 };
 R.SK = SK;
 R.fixed = [];
 if (on()) try {
  const saved = typeof SKINS !== 'undefined' && SKINS || {}, hand = typeof SKIN_SET !== 'undefined' ? SKIN_SET : {};
  const pal = {};
  for (const t of DATA.world || []) pal[t.id] = Array.isArray(t.skins) && t.skins.length > 0;
  const club = new Set;
  for (const t of TEAMS) for (const id of t.roster) club.add(id);
  for (const id in PLAYERS) {
   const p = PLAYERS[id];
   if (!p || saved[id] != null) continue;
   const k = String((p.n0 != null ? p.n0 : p.n) || '').toLowerCase().trim();
   if (hand[k] != null) continue;
   let v = null;
   if (LEGSK[id] != null) v = LEGSK[id]; else if (p.real && SK[k] != null) v = SK[k]; else if (p.real && club.has(id)) v = 0; else if (p.real && p.world && !pal[p.team]) v = 0;
   if (v != null && v !== p.skin) {
    R.fixed.push([ id, p.n, p.skin, v ]);
    p.skin = v;
   }
  }
 } catch (e) {
  console.error(e);
 }
 let BY4 = null;
 const by4 = () => {
  if (!BY4) {
   BY4 = {};
   for (const it of V17.I || []) BY4[it.id] = it;
  }
  return BY4;
 };
 function clean4(e) {
  if (!e || typeof e !== 'object') return null;
  const B = by4(), o = {};
  for (const k in e) {
   const it = B[e[k]];
   if (k !== 'celly' && it && it.slot === k) o[k] = e[k];
  }
  return Object.keys(o).length ? o : null;
 }
 function storeOf(tid) {
  const S = V17.ST && V17.ST();
  if (!S) return null;
  const wsel = typeof wgame !== 'undefined' && wgame && wgame.team === tid && window.__w172pick === tid;
  if (wsel) return S.wequip || {};
  const tq = S.tequip && S.tequip[tid];
  return !window.__rl_no2314 && tq && typeof tq === 'object' ? tq : S.mequip || {};
 }
 function szGear(pid) {
  if (!pid || !window.V17) return undefined;
  let mine = null, opp = null, lob = null;
  if (screen === 'matchup' && typeof menuSel !== 'undefined') {
   mine = menuSel.team;
   opp = menuSel.opp;
  } else if (screen === 'onLobby') {
   const N = window.RLNET, st = N && N.lobby && N.lobby.state;
   if (st && !st.season) {
    const h = N.side === 'h';
    mine = h ? st.hteam : st.gteam;
    opp = h ? st.gteam : st.hteam;
    lob = h ? st.g17 : st.h17;
   }
  }
  for (const [t, me] of [ [ mine, true ], [ opp, false ] ]) {
   if (!t) continue;
   const T2 = typeof SZ_REG !== 'undefined' ? SZ_REG[t] : null;
   if (T2 && !T2.arch2314) {
    if (!Array.isArray(T2.roster) || !T2.roster.includes(pid)) continue;
    return clean4(T2.g17 && T2.g17.gear && T2.g17.gear[pid]);
   }
   if (!ros(t).includes(pid)) continue;
   if (me) {
    const s = storeOf(t);
    return s ? clean4(s[pid]) : undefined;
   }
   if (screen === 'onLobby') return clean4(lob && lob.gear && lob.gear[pid]);
  }
  return undefined;
 }
 R.szGear = szGear;
 R.storeOf = storeOf;
 if (window.V17 && V17.bakeHero && V17.bakeGear) {
  const bh1 = V17.bakeHero;
  V17.bakeHero = function(name, kit, skin, gray, flip) {
   if (!on() || gray) return bh1.apply(this, arguments);
   const pid = window.__v17hp, pl = pid ? PP(pid) : null;
   if (!pl || pl.leg || pl.gho16) return bh1.apply(this, arguments);
   const gr = szGear(pid);
   if (gr === undefined) return bh1.apply(this, arguments);
   return gr ? V17.bakeGear(name, kit, !!flip, skin, Object.assign({}, gr), false, {
    nopad: true
   }) : null;
  };
 }
 if (typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.lineup) {
  const pl0 = PANEL_RENDER.lineup;
  PANEL_RENDER.lineup = function() {
   const h = pl0.apply(this, arguments);
   return on() && typeof h === 'string' ? h.replace('>+ CARD PLAYER', '>CLICK FOR CARD PLAYERS') : h;
  };
 }
})();

(() => {
 const on = () => !window.__rl_no2405 && !window.__rl_v124gb && !!(window.R2404 && R2404.on());
 const R = window.R2405 = {
  on: on,
  log: []
 };
 const PK = 'r2405_pend';
 const pend = () => {
  const a = LS.get(PK, []);
  return Array.isArray(a) ? a : [];
 };
 const addPend = tid => {
  if (!tid) return;
  const a = pend();
  if (!a.includes(tid)) {
   a.push(tid);
   LS.set(PK, a);
  }
 };
 const dropPend = tid => {
  const a = pend().filter(x => x !== tid);
  LS.set(PK, a);
 };
 const isCardGame = G => !!(G && (G.mode === 'quick' || G.mode === 'online' || G.meta && G.meta.online) && G.src !== 'season' && !(G.meta && G.meta.season));
 function refresh(tid) {
  try {
   if (typeof CUR2402 !== 'undefined') CUR2402.clear();
  } catch (e) {}
  try {
   if (typeof VS !== 'undefined' && VS.side) for (const s of VS.side) s.key = '';
  } catch (e) {}
  try {
   if (typeof PS !== 'undefined' && PS.luTeam === tid && PS.luSrc !== 'season' && screen !== 'lineup') PS.lu = lineupFor(tid, PS.luSrc || 'real');
  } catch (e) {}
  try {
   if (typeof panelDirty === 'function') panelDirty();
  } catch (e) {}
 }
 function strip(tid, why, only) {
  if (!on() || !tid) return false;
  let did = false;
  try {
   if (!only) did = R2404.reset(tid); else {
    const lu = LS.get('lu_' + tid, null), hit = lu ? R2404.cards(tid, lu).filter(id => only.includes(id)) : [];
    if (hit.length) {
     const out = R2404.cleanLu(tid, lu), keep = R2404.cards(tid, lu).filter(id => !only.includes(id));
     if (keep.length && out && out !== lu) for (const k in lu) {
      const v = lu[k];
      if (Array.isArray(v)) v.forEach((id, i) => {
       if (keep.includes(id) && Array.isArray(out[k])) out[k][i] = id;
      }); else if (keep.includes(v)) out[k] = v;
     }
     LS.set('lu_' + tid, out);
     did = true;
    }
   }
  } catch (e) {
   console.error(e);
  }
  refresh(tid);
  let left = 1;
  try {
   left = R2404.cards(tid, LS.get('lu_' + tid, null)).filter(id => !only || only.includes(id)).length;
  } catch (e) {}
  if (!left) dropPend(tid);
  R.log.push([ tid, why, did, left ]);
  return did;
 }
 R.strip = strip;
 R.pend = pend;
 let cur = null;
 const ng0 = window.newGame;
 window.newGame = function(user, opp, mode, userHome, meta) {
  const prev = cur;
  const r = ng0.apply(this, arguments);
  try {
   if (on()) {
    if (prev && prev !== game && prev.user !== user) {
     let ids = [];
     try {
      ids = R2404.cards(prev.user, prev.lu && prev.lu[0]);
     } catch (e) {}
     strip(prev.user, 'replaced', ids);
    }
    if (isCardGame(game)) {
     cur = game;
     addPend(game.user);
    } else cur = null;
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 function tick() {
  if (!on()) return;
  try {
   if (cur) {
    const N = window.RLNET, onl = cur.mode === 'online' || cur.meta && cur.meta.online;
    const gone = game !== cur || cur.over || onl && N && !N.inGame && game === cur && screen !== 'pregame';
    if (gone) {
     const G = cur, t = G.user;
     cur = null;
     let ids = [];
     try {
      ids = R2404.cards(t, G.lu && G.lu[0]);
     } catch (e) {}
     strip(t, game === null ? 'left' : 'ended', ids);
    }
   }
  } catch (e) {
   console.error(e);
  }
 }
 R.tick = tick;
 setInterval(tick, 100);
 const N0 = window.RLNET;
 if (N0 && typeof N0.leave === 'function') {
  const lv0 = N0.leave;
  N0.leave = function() {
   let t = null;
   try {
    if (on() && N0.lobby && N0.lobby.state && !N0.inGame && !N0.lobby.state.season) {
     const st = N0.lobby.state;
     t = N0.side === 'h' ? st.hteam : st.gteam;
    }
   } catch (e) {}
   const r = lv0.apply(this, arguments);
   if (t) try {
    strip(t, 'lobby left');
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT.luSave) {
  const ls0 = PANEL_ACT.luSave;
  PANEL_ACT.luSave = function() {
   const tid = PS.luTeam, back = PS.luBack, src = PS.luSrc;
   const r = ls0.apply(this, arguments);
   try {
    if (on() && back === 'onLobby' && src !== 'season' && tid && R2404.cards(tid, lineupFor(tid, 'real')).length) addPend(tid);
   } catch (e) {}
   return r;
  };
 }
 function boot() {
  if (on()) try {
   for (const t of pend()) strip(t, 'boot');
   if (!LS.get('r2405_mig', false)) {
    const wg = typeof wgame !== 'undefined' && wgame && wgame.team;
    const ids = [];
    for (let i = 0; i < localStorage.length; i++) {
     const k = localStorage.key(i);
     if (k && k.startsWith('rl_lu_')) ids.push(k.slice(6));
    }
    let pending = false;
    for (const t of ids) if (t && t !== wg) {
     strip(t, 'first boot');
     try {
      if (R2404.cards(t, LS.get('lu_' + t, null)).length) pending = true;
     } catch (e) {}
    }
    if (!pending) LS.set('r2405_mig', true);
   }
  } catch (e) {
   console.error(e);
  }
 }
 R.boot = boot;
 boot();
 setTimeout(boot, 1500);
})();

(() => {
 const on = () => !window.__rl_no2504 && !window.__rl_v124gb && !!(window.R2405 && R2405.on() && window.R2404);
 const OUT = [ 'menu', 'pickTeam', 'onTeam', 'online', 'onJoin' ];
 const armed = new Set;
 const R = window.R2504s = {
  armed: armed,
  log: []
 };
 const cardsIn = tid => {
  try {
   return R2404.cards(tid, LS.get('lu_' + tid, null));
  } catch (e) {
   return [];
  }
 };
 if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT.luSave) {
  const ls0 = PANEL_ACT.luSave;
  PANEL_ACT.luSave = function() {
   const tid = PS.luTeam, back = PS.luBack, src = PS.luSrc;
   const r = ls0.apply(this, arguments);
   try {
    if (on() && tid && src === 'real' && (back === 'matchup' || back === 'onLobby') && cardsIn(tid).length) {
     armed.add(tid);
     const a = LS.get('r2405_pend', []);
     if (Array.isArray(a) && !a.includes(tid)) {
      a.push(tid);
      LS.set('r2405_pend', a);
     }
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 const ng0 = window.newGame;
 window.newGame = function(user) {
  armed.delete(user);
  return ng0.apply(this, arguments);
 };
 function tick() {
  if (!armed.size || !on()) return;
  if (!OUT.includes(screen) || typeof game !== 'undefined' && game && !game.over && armed.has(game.user)) return;
  for (const tid of [ ...armed ]) {
   armed.delete(tid);
   try {
    R2405.strip(tid, 'backed out');
    R.log.push([ tid, screen ]);
   } catch (e) {
    console.error(e);
   }
  }
 }
 R.tick = tick;
 setInterval(tick, 100);
})();
