'use strict';
// v460fm: FRANCHISE MODE core (a COACH career): coach a college team, stay or take a better job each year,
// win to get PRO offers, win in pro to get a WORLD GAMES offer. One persistent world (the FR458 league engine in
// its own slot): players age, graduate, get drafted and carry over, so a former college player can face you in pro.
// window.FM460. Kill switch: window.__rl_no460fm = true (no button, no hooks, Pro Season keeps the old pro franchise).
// Storage (own keys only): rl_fm460 (the coach career), rl_fm460fr (the world, run by FR458 in its own slot, so the
// person's rl_fr458 franchise and the career's rl_car459fr are never touched).
(function () {
 const OFF = () => !!window.__rl_no460fm || !!window.__rl_v124gb;
 if (OFF()) return;
 const KEY = 'fm460', WKEY = 'fm460fr', PFX = 'FM6-', GPX = 'FM6G-';
 const SK = () => (typeof SKILLS !== 'undefined' ? SKILLS : [ 'spd', 'pow', 'acc', 'fin', 'stk', 'str', 'def', 'gb', 'fo', 'sav' ]);
 const POSL = [ 'A', 'M', 'FO', 'LSM', 'D', 'G' ];
 const P = id => (typeof PP === 'function' ? PP(id) : PLAYERS[id]);
 const R = Math.random;
 const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
 const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
 const pick = a => a[Math.floor(R() * a.length)];
 const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [ a[i], a[j] ] = [ a[j], a[i] ]; } return a; };
 const DIFFN = d => (typeof DIFF_NAMES !== 'undefined' ? DIFF_NAMES[d] : [ 'SQUID', 'FISH', 'BEGINNER', 'GROSS', 'NASTY', 'BAGGATWAAN' ][d]) || 'BEGINNER';
 const LVN = { col: 'COLLEGE', pro: 'PRO', world: 'WORLD GAMES' };
 let M = null;      // the coach career
 let W = null;      // read-only view of the world (the FR458 league object), parsed from rl_fm460fr
 let REG = false;   // world players registered as FM6- copies

 // ---------- save ----------
 function load() {
  if (M) return M;
  let o = null; try { o = LS.get(KEY, null); } catch (e) { o = null; }
  if (o && o.v === 1 && o.coach && o.team) M = o;
  return M;
 }
 function save() { if (!M) return; try { LS.set(KEY, M); } catch (e) { console.error(e); } }
 function clear() {
  M = null; W = null; unregAll();
  try { localStorage.removeItem('rl_' + KEY); localStorage.removeItem('rl_' + WKEY); } catch (e) {}
 }

 // ---------- the world (FR458 in our own slot) ----------
 let SW = null;
 function swapIn() {
  const FR = window.FR458; if (!FR || SW) return !!SW;
  try { FR.save(); } catch (e) {}
  SW = { get: LS.get, set: LS.set, rm: Storage.prototype.removeItem };
  const sw = SW;
  LS.get = function (k, d) { return sw.get.call(this, k === 'fr458' ? WKEY : k, d); };
  LS.set = function (k, v) { return sw.set.call(this, k === 'fr458' ? WKEY : k, v); };
  Storage.prototype.removeItem = function (k) { if (k === 'rl_fr458') return; return sw.rm.call(this, k); };
  try { FR.clear(); FR.get(); } catch (e) { console.error(e); }
  return true;
 }
 function swapOut() {
  const FR = window.FR458; if (!FR || !SW) return;
  try { FR.save(); } catch (e) { console.error(e); }
  try { FR.clear(); } catch (e) {}
  LS.get = SW.get; LS.set = SW.set; Storage.prototype.removeItem = SW.rm; SW = null;
  try { FR.get(); } catch (e) { console.error(e); }   // the person's own franchise (if any) back in memory
 }
 // run fn(FR, F) on our world; afterwards our FM6- copies are rebuilt from it
 function withW(fn) {
  if (!window.FR458) return null;
  const mine = !SW;
  if (mine) swapIn();
  let out, F = null;
  try { out = fn(window.FR458, window.FR458.get()); F = window.FR458.get(); }
  finally { if (mine) swapOut(); }
  if (F) { W = F; regWorld(); }
  return out;
 }
 function world() {
  if (W) return W;
  let o = null; try { o = LS.get(WKEY, null); } catch (e) { o = null; }
  if (o && o.v === 1 && o.ro && o.pl) W = o;
  return W;
 }
 // our own copies of every world player: FM6-<world id>; fm460b = the real player behind it (null = made up)
 function buildOne(wid, e) {
  const base = e.b ? PLAYERS[e.b] : null;
  if (e.b && !base) return null;
  const id = PFX + wid;
  const p = base ? Object.assign({}, base) : { real: false, n: e.n, n0: e.n, pos: e.pos };
  p.id = id; p.fm460 = 1; p.fm460b = e.b || null; p.fr458 = null; p.r = {};
  SK().forEach((k, i) => p.r[k] = e.r && e.r[i] != null ? e.r[i] : base ? base.r[k] : 50);
  if (e.c) p.col25 = true; else delete p.col25;
  if (!base) { p.real = false; p.team = e.t || ''; p.skin = e.s != null ? e.s : (typeof defaultSkin === 'function' ? defaultSkin(p) : 0); }
  if (e.w != null) p.wnum = e.w;
  try { p.ovr = ovrOf(p); } catch (er) { p.ovr = 60; }
  PLAYERS[id] = p;
  return p;
 }
 function unregAll() { for (const id in PLAYERS) if (id.indexOf(PFX) === 0) delete PLAYERS[id]; REG = false; }
 function regWorld() {
  const F = world(); if (!F) return;
  const live = new Set();
  for (const wid in F.pl) { live.add(PFX + wid); try { buildOne(wid, F.pl[wid]); } catch (e) { console.error(e); } }
  for (const id in PLAYERS) if (id.indexOf(PFX) === 0 && !live.has(id) && id.indexOf(PFX + 'R') !== 0) delete PLAYERS[id];
  REG = true;
 }
 function ensure() { if (!load()) return false; if (!REG) regWorld(); if (M.rec && M.rec.gen) for (const g of M.rec.gen) regRecruit(g); return true; }
 const wid = id => String(id).indexOf(PFX) === 0 ? String(id).slice(PFX.length) : id;
 const realOf = id => { const p = P(id); return p && p.fm460b ? p.fm460b : null; };

 // ---------- teams ----------
 const tobj = id => T(id);
 const tname = id => { const t = T(id); return t ? t.name : String(id); };
 const proIds = () => TEAMS.map(t => t.id);
 const colIds = () => (window.COL25 && COL25.TEAMS || []).map(t => t.id);
 const wIds = () => (typeof wtList2318 === 'function' ? wtList2318() : WTEAMS).map(t => t.id);
 const lvlOf = id => colIds().includes(id) ? 'col' : wIds().includes(id) ? 'world' : 'pro';
 function rosterOf(id) {
  const F = world(), lv = lvlOf(id);
  if (lv === 'world' || !F) return ((T(id) && T(id).roster) || []).filter(x => P(x));
  const src = lv === 'col' ? F.col[id] : F.ro[id];
  if (!src) return ((T(id) && T(id).roster) || []).filter(x => P(x));
  return src.map(x => PFX + x).filter(x => P(x));
 }
 const OV = {};
 function tOvr(id) {
  const ids = rosterOf(id); if (!ids.length) return 60;
  const s = ids.map(x => P(x).ovr).sort((a, b) => b - a).slice(0, 14);
  return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
 }
 const rankBy = ids => ids.slice().sort((a, b) => tOvr(b) - tOvr(a));

 // ---------- sims ----------
 const PW = {};
 function power(id) {
  if (PW[id]) return PW[id];
  let u; try { u = unitPower(autoLineup(rosterOf(id))); } catch (e) { u = { off: 0, def: 0, gk: 0, fo: 0 }; }
  PW[id] = u; return u;
 }
 function simScore(a, b) {
  let A, B; const bb = window.BOOST; window.BOOST = null;
  try { A = power(a); B = power(b); } finally { window.BOOST = bb; }
  const me = M && M.L ? M.L.team : null;
  const dAdj = (a === me ? -1 : b === me ? 1 : 0) * (((M && M.diff) | 0) - 2) * .006;
  const pa = clamp(.33 + .05 * (A.off - B.def) - .04 * B.gk + .02 * (A.fo - B.fo) + dAdj, .12, .6), pb = clamp(.33 + .05 * (B.off - A.def) - .04 * A.gk + .02 * (B.fo - A.fo) - dAdj, .12, .6);
  let sa = 0, sb = 0;
  for (let i = 0; i < 26; i++) { if (R() < pa) sa++; if (R() < pb) sb++; }
  while (sa === sb) { if (R() < pa) sa++; else if (R() < pb) sb++; }
  if (window.__fm460win && (a === me || b === me)) { const hi = Math.max(sa, sb), lo = Math.min(sa, sb); return a === me ? [ hi, lo ] : [ lo, hi ]; }
  return [ sa, sb ];
 }

 // ---------- one season: schedule, table, playoffs ----------
 function rounds(teams, n, my) {
  const out = [], others = teams.filter(t => t !== my), opp = shuffle(others.slice());
  for (let r = 0; r < n; r++) {
   const rd = [], rest = shuffle(others.slice());
   if (my) { const o = opp[r % opp.length]; rd.push(R() < .5 ? [ my, o ] : [ o, my ]); rest.splice(rest.indexOf(o), 1); }
   for (let i = 0; i + 1 < rest.length; i += 2) rd.push([ rest[i], rest[i + 1] ]);
   out.push(rd);
  }
  return out;
 }
 function rr(teams) {
  const t = teams.slice(); if (t.length % 2) t.push('BYE');
  const n = t.length, out = [];
  for (let r = 0; r < n - 1; r++) { const rd = []; for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; if (a !== 'BYE' && b !== 'BYE') rd.push(r % 2 ? [ b, a ] : [ a, b ]); } out.push(rd); t.splice(1, 0, t.pop()); }
  return out;
 }
 function newLeague(lvl, opt) {
  const L = { lvl: lvl, yr: M.yr, nm: opt.nm, team: M.team, teams: opt.teams.slice(), rounds: opt.rounds || [], wk: 0, table: {}, mine: [], phase: opt.rounds && opt.rounds.length ? 'reg' : 'po', po: null, poN: opt.poN || 8, poNames: opt.poNames, champ: null, elim: false, groups: opt.groups || null, wkName: opt.wkName || 'WEEK' };
  for (const t of L.teams) L.table[t] = { w: 0, l: 0, gf: 0, ga: 0 };
  for (const k in PW) delete PW[k];
  M.L = L;
  if (L.phase === 'po') startPo(L, opt.seeds);
  return L;
 }
 function stand(L, ids) {
  ids = ids || L.teams;
  return ids.map(id => Object.assign({ id: id }, L.table[id])).sort((x, y) => y.w - x.w || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf);
 }
 function startPo(L, seeds) {
  if (!seeds) {
   if (L.groups) { const A = stand(L, L.groups[0]).map(x => x.id), B = stand(L, L.groups[1]).map(x => x.id); seeds = [ A[0], B[1], B[0], A[1] ]; L.po = { r: 0, rounds: [ { nm: L.poNames[0], games: [ { a: seeds[0], b: seeds[1] }, { a: seeds[2], b: seeds[3] } ] } ], seeds: seeds }; L.phase = 'po'; L.elim = !seeds.includes(L.team); return; }
   seeds = stand(L).slice(0, L.poN).map(x => x.id);
  }
  const n = seeds.length, ord = [];
  const bo = (function (k) { let o = [ 1 ]; while (o.length < k) { const m = o.length * 2 + 1; o = o.flatMap(x => [ x, m - x ]); } return o; })(n);
  for (let i = 0; i < n; i += 2) ord.push({ a: seeds[bo[i] - 1], b: seeds[bo[i + 1] - 1] });
  const names = L.poNames || [];
  L.po = { r: 0, rounds: [ { nm: names[names.length - Math.log2(n)] || 'PLAYOFFS', games: ord } ], seeds: seeds };
  L.phase = 'po';
  L.elim = !seeds.includes(L.team);
 }
 function myGame(L) {
  L = L || (M && M.L); if (!L) return null;
  if (L.phase === 'reg') {
   const rd = L.rounds[L.wk]; if (!rd) return null;
   const g = rd.find(x => x[0] === L.team || x[1] === L.team);
   const lab = L.groups ? 'GROUP GAME ' + (L.wk + 1) + ' OF ' + L.rounds.length : L.wkName + ' ' + (L.wk + 1) + ' OF ' + L.rounds.length;
   if (!g) return { bye: true, label: lab };
   return { opp: g[0] === L.team ? g[1] : g[0], home: g[0] === L.team, label: lab };
  }
  if (L.phase === 'po') {
   const R0 = L.po.rounds[L.po.r]; if (!R0) return null;
   const g = R0.games.find(x => !x.s && (x.a === L.team || x.b === L.team));
   if (!g) return null;
   return { opp: g.a === L.team ? g.b : g.a, home: g.a === L.team, label: R0.nm, po: true, final: R0.games.length === 1 };
  }
  return null;
 }
 function apply(L, a, b, sa, sb) {
  const A = L.table[a], B = L.table[b]; if (!A || !B) return;
  A.gf += sa; A.ga += sb; B.gf += sb; B.ga += sa;
  if (sa > sb) { A.w++; B.l++; } else { B.w++; A.l++; }
 }
 function simRound(L) {
  if (L.phase === 'reg') {
   for (const [ a, b ] of L.rounds[L.wk] || []) { if (a === L.team || b === L.team) continue; const [ sa, sb ] = simScore(a, b); apply(L, a, b, sa, sb); }
   L.wk++;
   if (L.wk >= L.rounds.length) startPo(L);
   return;
  }
  if (L.phase === 'po') {
   const R0 = L.po.rounds[L.po.r];
   for (const g of R0.games) if (!g.s) g.s = simScore(g.a, g.b);
   const win = R0.games.map(g => g.s[0] > g.s[1] ? g.a : g.b);
   if (R0.games.some(g => (g.a === L.team || g.b === L.team) && (g.s[0] > g.s[1] ? g.b : g.a) === L.team)) L.elim = true;
   if (win.length === 1) { L.champ = win[0]; L.phase = 'done'; return; }
   const names = L.poNames || [], left = win.length;
   const games = []; for (let i = 0; i < win.length; i += 2) games.push({ a: win[i], b: win[i + 1] });
   L.po.rounds.push({ nm: names[names.length - Math.log2(left)] || 'NEXT ROUND', games: games });
   L.po.r++;
  }
 }
 function record(sa, sb, real) {
  const L = M.L, nx = myGame(L); if (!nx || nx.bye) return null;
  L.mine.push({ opp: nx.opp, home: nx.home, label: nx.label, s: [ sa, sb ], real: !!real });
  if (L.phase === 'reg') { apply(L, L.team, nx.opp, sa, sb); simRound(L); }
  else { const R0 = L.po.rounds[L.po.r], g = R0.games.find(x => !x.s && (x.a === L.team || x.b === L.team)); if (g) g.s = g.a === L.team ? [ sa, sb ] : [ sb, sa ]; simRound(L); }
  // nothing left for you this season (knocked out or no playoff spot): the rest of the bracket plays out
  simRest(L);
  M.last = { s: [ sa, sb ], opp: nx.opp, label: nx.label, real: !!real };
  save();
  return M.last;
 }
 function simRest(L) { let g = 0; while (L.phase !== 'done' && g++ < 200) { const nx = myGame(L); if (nx && !nx.bye && !L.elim) break; if (nx && nx.bye) { simRound(L); continue; } simRound(L); } }
 function simMine() {
  const L = M.L, nx = myGame(L); if (!nx) return null;
  if (nx.bye) { simRound(L); simRest(L); save(); return { bye: true }; }
  const [ sa, sb ] = simScore(L.team, nx.opp);
  return record(sa, sb, false);
 }
 function simSeason() { let g = 0; while (M.L && M.L.phase !== 'done' && g++ < 120) { const nx = myGame(M.L); if (nx && !nx.bye && !M.L.elim) simMine(); else simRound(M.L); } save(); }
 function finText(L) {
  const me = L.team;
  if (L.champ === me) return L.lvl === 'col' ? 'NATIONAL CHAMPIONS' : L.lvl === 'world' ? 'WORLD GAMES GOLD' : 'PRO CHAMPIONS';
  if (!L.po || !L.po.seeds.includes(me)) return L.groups ? 'OUT IN THE GROUPS' : 'MISSED THE PLAYOFFS';
  let lost = null;
  for (const R0 of L.po.rounds) for (const g of R0.games) if (g.s && (g.a === me || g.b === me) && (g.s[0] > g.s[1] ? g.b : g.a) === me) lost = R0.nm;
  return lost ? 'LOST IN THE ' + lost : 'PLAYOFFS';
 }
 const isFinal = nm => /CHAMPIONSHIP|GOLD MEDAL/.test(nm || '');

 // ---------- start a franchise ----------
 function create(o) {
  const nm = String(o.n || '').trim().replace(/\s+/g, ' ').slice(0, 18).toUpperCase();
  if (!nm) return { ok: false, why: 'TYPE YOUR COACH NAME FIRST' };
  try { if (window.UGC41 && UGC41.bad(nm)) return { ok: false, why: 'PICK A DIFFERENT NAME' }; } catch (e) {}
  const lvl = [ 'col', 'pro', 'world' ].includes(o.lvl) ? o.lvl : 'col';
  const ok = lvl === 'col' ? colIds() : lvl === 'pro' ? proIds() : wIds();
  if (!ok.includes(o.team)) return { ok: false, why: 'PICK A TEAM FIRST' };
  if (!window.FR458) return { ok: false, why: 'FRANCHISE MODE IS NOT AVAILABLE' };
  clear();
  M = { v: 1, id: 'fm' + Date.now().toString(36), made: Date.now(), coach: { n: nm }, diff: clamp(o.diff | 0, 0, 5), start: lvl, lvl: lvl, team: o.team, yr: 2026, n: 1,
   rep: lvl === 'col' ? 15 : lvl === 'pro' ? 50 : 70, stage: 'season', jobs: [], seasons: [], titles: [], L: null, offers: [], sum: '', form: [], log: [], last: null };
  // the world: every real pro roster + every real college roster, year one
  withW(FR => { const ids = proIds(); FR.newFranchise(lvl === 'pro' ? o.team : ids[0], { teams: ids, year: 2026 }); });
  newJob(lvl, o.team);
  startSeason();
  logE('HIRED BY ' + tname(o.team) + ' (' + LVN[lvl] + ')');
  save();
  return { ok: true };
 }
 function logE(s) { (M.log = M.log || []).push({ y: M.yr, s: s }); if (M.log.length > 80) M.log.splice(0, M.log.length - 80); }
 function newJob(lvl, team) { M.jobs.push({ lvl: lvl, team: team, y0: M.yr, y1: M.yr, w: 0, l: 0, t: [], n: 0 }); }
 const curJob = () => M.jobs[M.jobs.length - 1];

 function startSeason() {
  const lv = M.lvl, t = M.team;
  for (const k in PW) delete PW[k];
  if (lv === 'col') {
   const ids = colIds();
   newLeague('col', { nm: M.yr + ' COLLEGE SEASON', teams: ids, rounds: rounds(ids, 12, t), poN: 8, poNames: [ 'QUARTERFINAL', 'SEMIFINAL', 'NATIONAL CHAMPIONSHIP' ] });
  } else if (lv === 'pro') {
   const ids = proIds();
   newLeague('pro', { nm: M.yr + ' PRO SEASON', teams: ids, rounds: rounds(ids, 10, t), poN: 8, poNames: [ 'QUARTERFINAL', 'SEMIFINAL', 'CHAMPIONSHIP' ] });
  } else {
   const all = rankBy(wIds()), field = [ t ].concat(all.filter(x => x !== t).slice(0, 7)), srt = rankBy(field);
   const gA = [ srt[0], srt[3], srt[4], srt[7] ], gB = [ srt[1], srt[2], srt[5], srt[6] ];
   const ra = rr(gA), rb = rr(gB), rds = ra.map((r, i) => r.concat(rb[i] || []));
   newLeague('world', { nm: M.yr + ' WORLD GAMES', teams: field, rounds: rds, groups: [ gA, gB ], poNames: [ 'SEMIFINAL', 'GOLD MEDAL GAME' ] });
  }
  M.stage = 'season'; M.last = null;
  save();
 }

 // ---------- the end of a season ----------
 const stars = () => clamp(1 + Math.floor((M.rep || 0) / 20), 1, 5);
 function seasonOver() {
  if (!M || M.stage !== 'season' || !M.L || M.L.phase !== 'done') return false;
  const L = M.L, me = L.table[L.team] || { w: 0, l: 0 }, fin = finText(L), champ = L.champ === L.team;
  // your playoff and medal games count in your record
  let w = 0, l = 0; for (const g of L.mine) { if (g.s[0] > g.s[1]) w++; else l++; }
  M.seasons.push({ yr: L.yr, lvl: L.lvl, team: L.team, w: w, l: l, fin: fin, champ: champ });
  const J = curJob(); J.w += w; J.l += l; J.y1 = L.yr; J.n++; if (champ) J.t.push(L.yr);
  if (champ) M.titles.push({ yr: L.yr, lvl: L.lvl, team: L.team, nm: fin });
  // reputation: win%, how far you went, and the level you did it at
  const pct = (w + l) ? w / (w + l) : 0;
  let d = Math.round((pct - .5) * 24);
  if (champ) d += L.lvl === 'col' ? 22 : L.lvl === 'pro' ? 20 : 15;
  else if (/SEMIFINAL|CHAMPIONSHIP|GOLD/.test(fin)) d += 7;
  else if (/LOST IN/.test(fin)) d += 3;
  const r0 = M.rep; M.rep = clamp(M.rep + d, 0, 100); M.repD = M.rep - r0;
  // the players who played for you (shown as FORMER PLAYER later)
  if (L.lvl !== 'world') { const f = new Set(M.form || []); for (const id of rosterOf(L.team)) f.add(wid(id)); M.form = [ ...f ].slice(-400); }
  // title cards: the real players only (made-up players never get cards)
  M.cards = champ ? titleCards(L) : null;
  M.offers = makeOffers(champ);
  const pro = M.offers.find(o => o.promo);
  M.sum = 'YOU WENT ' + w + '-' + l + (champ ? ' AND WON THE ' + (L.lvl === 'col' ? 'NATIONAL TITLE' : L.lvl === 'pro' ? 'PRO TITLE' : 'WORLD GAMES GOLD') + '!' : ' (' + fin + ').') + (pro ? ' ' + tname(pro.team) + ' WANTS YOU AS THEIR ' + LVN[pro.lvl] + ' COACH!' : M.offers.length ? ' YOU HAVE ' + M.offers.length + ' JOB OFFER' + (M.offers.length > 1 ? 'S' : '') + '.' : '');
  M.prevL = { lvl: L.lvl, team: L.team, table: L.table, champ: L.champ, teams: L.teams, seeds: L.po ? L.po.seeds : [] };
  M.L = null; M.stage = 'end';
  logE(L.yr + ' ' + tname(L.team) + ': ' + w + '-' + l + ' - ' + fin);
  save();
  return true;
 }
 function titleCards(L) {
  const ids = L.lvl === 'world' ? rosterOf(L.team) : [ ...new Set(rosterOf(L.team).map(realOf).filter(x => x && PLAYERS[x] && !PLAYERS[x].fm460)) ];
  if (!window.V22 || !V22.titleCheck) return { n: 0, real: ids.length };
  let n = 0;
  try {
   const key = 'FM' + M.id + '-' + L.yr + '-' + L.lvl;
   if (L.lvl === 'world') n = V22.titleCheck(null, { phase: 'done', champ: L.team, team: L.team, n: key });
   else if (ids.length) { const r = {}; r[L.team] = ids; n = V22.titleCheck({ phase: 'done', champ: L.team, team: L.team, rosters: r, year: key, fm460: 1 }); }
  } catch (e) { console.error(e); }
  return { n: n, real: ids.length };
 }
 // job offers: better jobs come with a better reputation; a title (or a great run) opens the next level
 function pickTier(ids, rep, n, not) {
  const rk = rankBy(ids).filter(x => !not.includes(x)), m = rk.length; if (!m) return [];
  const c = Math.round((1 - rep / 100) * (m - 1)), lo = clamp(c - Math.ceil(m * .18), 0, m - 1), hi = clamp(c + Math.ceil(m * .18), 0, m - 1);
  return shuffle(rk.slice(lo, hi + 1)).slice(0, n);
 }
 function makeOffers(champ) {
  const rep = M.rep, lv = M.lvl, out = [], not = [ M.team ];
  const add = (lvl, ids, promo) => { for (const t of ids) if (!out.some(o => o.team === t)) out.push({ lvl: lvl, team: t, promo: !!promo }); };
  if (lv === 'col') {
   if (champ || rep >= 55) add('pro', pickTier(proIds(), clamp(rep - 25 + (champ ? 15 : 0), 5, 95), champ ? 2 : 1, not), true);
   add('col', pickTier(colIds(), rep, 2, not));
  } else if (lv === 'pro') {
   if (champ || rep >= 80) add('world', pickTier(wIds(), clamp(rep - 10, 10, 100), champ ? 3 : 2, not), true);
   if (rep >= 35) add('pro', pickTier(proIds(), rep, rep >= 60 ? 2 : 1, not));
  } else {
   add('pro', pickTier(proIds(), clamp(rep, 30, 100), 2, not));
   add('col', pickTier(colIds(), 90, 1, not));
   if (rep >= 60) add('world', pickTier(wIds(), rep, 1, not));
  }
  return out;
 }
 // ---------- STAY or TAKE A JOB, then the offseason ----------
 function choose(team) {
  if (!M || M.stage !== 'end') return { ok: false };
  if (team && team !== M.team) {
   const o = (M.offers || []).find(x => x.team === team); if (!o) return { ok: false, why: 'THAT OFFER IS GONE' };
   logE('LEFT ' + tname(M.team) + ' FOR ' + tname(team) + ' (' + LVN[o.lvl] + ')');
   M.lvl = o.lvl; M.team = team; M.yr++; newJob(o.lvl, team); M.yr--;
   try { localStorage.removeItem('rl_lu_FM6U'); } catch (e) {}
  }
  M.offers = []; M.cards = null;
  beginOff();
  return { ok: true };
 }
 // a quick background pro season (when you are not coaching pro) so the draft order and the champion are real
 function fakePro(F) {
  const ids = F.teams.slice(), table = {}, str = {};
  for (const t of ids) { str[t] = tOvr(t) + (R() - .5) * 6; table[t] = { w: 0, l: 0, gf: 0, ga: 0 }; }
  for (const t of ids) { const w = clamp(Math.round(5 + (str[t] - 75) * .55 + (R() - .5) * 4), 0, 10); table[t].w = w; table[t].l = 10 - w; table[t].gf = 100 + w * 3; table[t].ga = 100 + (10 - w) * 3; }
  const seeds = ids.slice().sort((a, b) => table[b].w - table[a].w).slice(0, 8);
  const champ = seeds.slice(0, 4).sort((a, b) => str[b] + R() * 6 - (str[a] + R() * 6))[0];
  return { teams: ids, table: table, champ: champ, seeds: seeds };
 }
 function proS(F) {
  const p = M.prevL && M.prevL.lvl === 'pro' ? M.prevL : fakePro(F);
  const table = {}; for (const t of F.teams) table[t] = p.table[t] || { w: 0, l: 0, gf: 0, ga: 0 };
  return { fr458: F.id, year: F.year, teams: F.teams.slice(), table: table, champ: p.champ, playoff: { seeds: p.seeds || [], results: [] }, phase: 'done' };
 }
 // a team the person is not running in FR (FR's "user" team) is run by the staff
 function fixRoster(FR, F) {
  const t = F.team;
  let g = 0;
  while (F.ro[t].length > FR.RMAX && g++ < 20) { const c = F.ro[t].slice().sort((a, b) => FR.value(a) - FR.value(b))[0]; if (!c) break; FR.cut(c); }
  while (FR.payroll(t) > FR.CAP && g++ < 40) { const c = F.ro[t].filter(x => F.ct[x]).sort((a, b) => (F.ct[b][1] / Math.max(1, FR.value(b))) - (F.ct[a][1] / Math.max(1, FR.value(a))))[0]; if (!c || F.ro[t].length <= FR.RMIN) break; FR.cut(c); }
  try { FR.autoFill(); } catch (e) { console.error(e); }
 }
 function closeOff(FR, F) {
  let fin = FR.finishOffseason();
  for (let k = 0; !fin.ok && k < 3; k++) { fixRoster(FR, F); fin = FR.finishOffseason(); }
  if (!fin.ok) { console.warn('fm460: offseason closed by force', fin && fin.why); F.off = null; F.year++; FR.save(); }
 }
 const staffKeeps = (FR, id) => { const p = P(id); return !!p && p.ovr >= 72 && FR.age(id) <= 31; };
 function autoResign(FR, F) {
  for (const id of F.off.expMine || []) { const k = FR.resign(id, staffKeeps(FR, id)); if (!k.ok) FR.resign(id, false); }
 }
 function beginOff() {
  const lv = M.lvl, t = M.team;
  const r = withW((FR, F) => {
   if (!F) return { ok: false };
   if (F.off) closeOff(FR, F);         // a half-finished offseason from before (should not happen) is closed first
   F.team = lv === 'pro' ? t : (F.teams.includes(F.team) ? F.team : F.teams[0]);
   const before = lv === 'col' ? new Set(F.col[t] || []) : null;
   const S = proS(F);
   FR.endSeason(S);
   if (!F.off) return { ok: false };
   if (lv === 'pro') return { ok: true, step: 'resign' };
   autoResign(FR, F); FR.resignDone(); FR.cpuMoves(); FR.faFinish(); FR.draftStart(); FR.draftCpu(false);
   const picks = (F.off.dr ? F.off.dr.picks : []).map(p => [ p[0], p[1], p[2], p[3] ]);
   F.off.step = 'final'; FR.cpuCutdown(); fixRoster(FR, F); closeOff(FR, F);
   let open = 0;
   if (lv === 'col') {
    // the freshmen the world gave your team are left for you to recruit
    const fresh = (F.col[t] || []).filter(id => !before.has(id) && F.pl[id] && !F.pl[id].b);
    F.col[t] = (F.col[t] || []).filter(id => !fresh.includes(id)); for (const id of fresh) delete F.pl[id];
    open = fresh.length;
   }
   return { ok: true, picks: picks, open: open };
  });
  if (!r || !r.ok) { M.yr++; startSeason(); return; }
  M.draftNews = (r.picks || []).filter(p => (M.form || []).includes(p[1])).map(p => ({ t: p[0], id: p[1], no: p[3] }));
  if (lv === 'pro') { M.stage = 'resign'; save(); return; }
  if (lv === 'col') { M.stage = 'recruit'; recruitStart(r.open); save(); return; }
  M.yr++; startSeason(); save();
 }

 // ---------- RECRUITING (college): real players first, made-up freshmen after the real ones are gone ----------
 let NAMES = null;
 function names() {
  if (NAMES) return NAMES;
  const fs = new Set, ls = new Set;
  for (const id in PLAYERS) { const p = PLAYERS[id]; if (!p || !p.col25 || p.fr458 !== undefined || p.fm460) continue; const w = String(p.n0 || p.n || '').trim().split(/\s+/); if (w.length === 2 && /^[A-Za-z'-]+$/.test(w[0]) && /^[A-Za-z'-]+$/.test(w[1])) { fs.add(w[0]); ls.add(w[1]); } }
  NAMES = { f: [ ...fs ].sort(), l: [ ...ls ].sort() };
  if (!NAMES.f.length) NAMES = { f: [ 'Jack', 'Ryan', 'Matt' ], l: [ 'Smith', 'Jones', 'Brown' ] };
  return NAMES;
 }
 function shapeRatings(pos, tgt) {
  const pool = Object.values(PLAYERS).filter(p => p && p.pos === pos && p.col25 && p.fr458 === undefined && !p.fm460 && !p.car459);
  const tpl = pool.length ? pick(pool) : null, ks = SK(), tmp = { pos: pos, r: {} };
  const fixed = (k, v) => (k === 'fo' && pos !== 'FO' && v < 40) || (k === 'sav' && pos !== 'G' && v < 20);
  let r = ks.map(k => tpl ? tpl.r[k] : 55);
  const f = tpl ? tgt / Math.max(40, tpl.ovr) : 1;
  r = r.map((v, i) => fixed(ks[i], v) ? v : clamp(Math.round(v * f + (R() - .5) * 8), 1, 99));
  for (let k = 0; k < 8; k++) { ks.forEach((kk, i) => tmp.r[kk] = r[i]); let o = 60; try { o = ovrOf(tmp); } catch (e) {} const d = tgt - o; if (Math.abs(d) <= 0) break; r = r.map((v, i) => fixed(ks[i], v) ? v : clamp(v + d, 1, 99)); }
  return r;
 }
 function regRecruit(g) {
  const id = PFX + 'R' + g.k;
  const p = { id: id, n: g.n, n0: g.n, pos: g.pos, r: {}, real: false, team: '', skin: g.s, fm460: 1, fm460b: null, fr458: null, col25: true, wnum: g.w };
  SK().forEach((k, i) => p.r[k] = g.r[i]);
  try { p.ovr = ovrOf(p); } catch (e) { p.ovr = 60; }
  PLAYERS[id] = p; return id;
 }
 function recruitStart(open) {
  const F = world(), t = M.team;
  const need = clamp(Math.max(open || 0, 3), 0, 8);   // how many LET MY STAFF HANDLE IT signs (you pick any number yourself)
  // real players first: the youngest real players in the college world who are not yours yet
  const real = [];
  // the better your coach rating, the better the players who want to play for you
  const capO = Math.round(70 + (M.rep || 0) * .15);
  for (const c in F.col) { if (c === t) continue; for (const x of F.col[c]) { const e = F.pl[x]; if (e && e.b && e.a <= 20 && PLAYERS[e.b] && !PLAYERS[e.b].fm460 && P(PFX + x) && P(PFX + x).ovr <= capO) real.push({ id: PFX + x, c: c }); } }
  real.sort((a, b) => P(b.id).ovr - P(a.id).ovr);
  const realPick = real.slice(0, 8);
  const gen = [], N = names(), cnt = Math.max(4, 12 - realPick.length);
  const avg = tOvr(t);
  for (let i = 0; i < cnt; i++) {
   const pos = pick(POSL.concat([ 'A', 'M', 'M', 'D' ])), tg = clamp(Math.round(Math.min(avg, capO) - 12 + (R() - .35) * 16), 52, 80);
   const g = { k: M.id.slice(-4) + M.yr + '-' + i, n: pick(N.f) + ' ' + pick(N.l), pos: pos, r: shapeRatings(pos, tg), s: ri(0, 5), w: ri(1, 99) };
   gen.push(g); regRecruit(g);
  }
  M.rec = { need: need, real: realPick, gen: gen, picked: [], cut: [] };
 }
 function recruitPool() { if (!M.rec) return []; return M.rec.real.map(x => x.id).concat(M.rec.gen.map(g => PFX + 'R' + g.k)).filter(x => P(x)); }
 // roster room: the max is the school's real roster size; nobody leaves unless you let them go (or your staff handles it)
 function rosterMax(t) { const ct = window.COL25 && COL25.TEAMS.find(x => x.id === t); return ct ? ct.roster.length : 18; }
 const rosterMin = t => Math.min(rosterMax(t), 14);   // under this, walk-ons fill the open spots so you can still field a team
 function recruitInfo() {
  if (!M || !M.rec) return null;
  const Rc = M.rec, cur = rosterOf(M.team), cut = (Rc.cut || []).filter(x => cur.includes(x));
  const n = cur.length - cut.length + Rc.picked.length, max = rosterMax(M.team), min = rosterMin(M.team);
  return { n: n, max: max, min: min, over: Math.max(0, n - max), cur: cur, cut: cut, picked: Rc.picked.slice() };
 }
 function recruitToggle(id) {
  const Rc = M.rec; if (!Rc) return false;
  const i = Rc.picked.indexOf(id);
  if (i >= 0) { Rc.picked.splice(i, 1); save(); return true; }
  if (!recruitPool().includes(id)) return false;
  Rc.picked.push(id); save(); return true;
 }
 // LET GO / KEEP one of your current players (only takes effect when you tap DONE)
 function recruitCut(id) {
  const Rc = M.rec; if (!Rc) return false;
  Rc.cut = Rc.cut || [];
  const i = Rc.cut.indexOf(id);
  if (i >= 0) { Rc.cut.splice(i, 1); save(); return true; }
  if (!rosterOf(M.team).includes(id)) return false;
  Rc.cut.push(id); save(); return true;
 }
 function recruitAuto() { const Rc = M.rec; if (!Rc) return; const pool = recruitPool().filter(x => !Rc.picked.includes(x)).sort((a, b) => P(b).ovr - P(a).ovr); while (Rc.picked.length < Rc.need && pool.length) Rc.picked.push(pool.shift()); }
 function recruitDone(auto) {
  if (!M || M.stage !== 'recruit') return { ok: false, why: 'NOT RECRUITING RIGHT NOW' };
  if (M.rec && !auto) { const ri0 = recruitInfo(); if (ri0 && ri0.over > 0) return { ok: false, why: 'ROSTER ' + ri0.n + '/' + ri0.max + ': LET GO OF ' + ri0.over + ' MORE PLAYER' + (ri0.over === 1 ? '' : 'S') + ' OR UNSIGN ' + (ri0.over === 1 ? 'A RECRUIT' : ri0.over + ' RECRUITS') + ' FIRST.' }; }
  if (auto && M.rec) { M.rec.cut = []; recruitAuto(); }   // the staff: the old automatic way (best recruits in, weakest players out)
  const Rc = M.rec || { picked: [], real: [], gen: [], need: 0, cut: [] }, t = M.team;
  const got = [], gone = [];
  withW((FR, F) => {
   if (!F) return;
   F.col[t] = F.col[t] || [];
   // the players you chose to let go leave first (only yours, only the ones you picked)
   const out0 = new Set((Rc.cut || []).map(wid));
   for (const x of F.col[t].filter(y => out0.has(y))) { gone.push(P(PFX + x) ? P(PFX + x).n : '?'); if (F.pl[x] && !F.pl[x].b) delete F.pl[x]; }
   F.col[t] = F.col[t].filter(y => !out0.has(y));
   for (const id of Rc.picked) {
    const rl = Rc.real.find(x => x.id === id);
    if (rl) { const x = wid(id); F.col[rl.c] = (F.col[rl.c] || []).filter(y => y !== x); if (F.pl[x]) F.pl[x].t = t; F.col[t].push(x); got.push(id); continue; }
    const g = Rc.gen.find(x => PFX + 'R' + x.k === id); if (!g) continue;
    const x = GPX + g.k; F.pl[x] = { b: null, n: g.n, pos: g.pos, r: g.r.slice(), a: 18, t: t, w: g.w, s: g.s, c: 1 }; F.col[t].push(x); got.push(PFX + x);
   }
   // LET MY STAFF HANDLE IT only: the team keeps its size, the weakest players (not the new ones) leave to make room.
   // Your own way, nobody is cut for you (DONE is blocked above while you are over the max).
   const want = rosterMax(t), fill = auto ? want : rosterMin(t);
   const newIds = new Set(got.map(wid));
   let g0 = 0;
   while (auto && F.col[t].length > want && g0++ < 20) {
    const out = F.col[t].filter(x => !newIds.has(x)).sort((a, b) => (P(PFX + a) ? P(PFX + a).ovr : 0) - (P(PFX + b) ? P(PFX + b).ovr : 0))[0];
    if (!out) break;
    F.col[t] = F.col[t].filter(x => x !== out); if (F.pl[out] && !F.pl[out].b) delete F.pl[out];
   }
   // spots left open: walk-ons (made up). Your staff fills the whole roster; your own way only up to the minimum to field a team
   const left = Math.max(0, fill - F.col[t].length);
   for (let i = 0; i < left; i++) {
    const pos = pick(POSL), g = { n: pick(names().f) + ' ' + pick(names().l), r: shapeRatings(pos, clamp(tOvr(t) - 16, 50, 72)) };
    const x = GPX + M.id.slice(-4) + M.yr + 'w' + i; F.pl[x] = { b: null, n: g.n, pos: pos, r: g.r, a: 18, t: t, w: ri(1, 99), s: ri(0, 5), c: 1 }; F.col[t].push(x);
   }
   FR.save();
  });
  for (const id in PLAYERS) if (id.indexOf(PFX + 'R') === 0) delete PLAYERS[id];
  M.recLast = got.map(id => ({ n: P(id) ? P(id).n : '?', pos: P(id) ? P(id).pos : '', real: !!realOf(id) }));
  M.recGone = gone;
  M.rec = null; M.yr++; startSeason(); save();
  return { ok: true, got: got.length, gone: gone.length };
 }

 // ---------- the PRO offseason, three steps: RE-SIGN, DRAFT, YOUR TEAM ----------
 function offInfo() {
  const F = world(); if (!F || !F.off) return null;
  const O = F.off;
  return { exp: (O.expMine || []).map(x => ({ id: PFX + x, keep: O.rs[x], ask: window.FR458.ask ? null : null })), cap: 42000 };
 }
 function resignSet(id, keep) {
  return withW((FR, F) => { if (!F || !F.off) return { ok: false }; const r = FR.resign(wid(id), !!keep); FR.save(); return r; });
 }
 function resignNext(auto) {
  if (!M || M.stage !== 'resign') return false;
  withW((FR, F) => {
   if (!F || !F.off) return;
   if (auto) autoResign(FR, F);
   for (const id of F.off.expMine || []) if (F.off.rs[id] == null) FR.resign(id, false);
   FR.resignDone(); FR.cpuMoves(); FR.faFinish();
   fixRoster(FR, F);                      // the staff signs free agents to fill the holes
   FR.draftStart(); FR.draftCpu(true);
  });
  M.stage = 'draft'; save(); return true;
 }
 function draftState() {
  const F = world(); if (!F || !F.off || !F.off.dr) return null;
  const D = F.off.dr, turn = D.n >= D.ord.length * D.rounds ? null : D.ord[D.n % D.ord.length];
  return { turn: turn, mine: turn === F.team, done: !turn, n: D.n, total: D.ord.length * D.rounds, rd: Math.floor(D.n / D.ord.length) + 1, slot: D.n % D.ord.length + 1,
   pool: D.pool.map(x => PFX + x).filter(x => P(x)).sort((a, b) => P(b).ovr - P(a).ovr), picks: D.picks.map(p => ({ t: p[0], id: PFX + p[1], c: p[2], no: p[3] })), from: D.from };
 }
 function draftPick(id, auto) {
  if (!M || M.stage !== 'draft') return false;
  withW((FR, F) => {
   if (!F || !F.off || !F.off.dr) return;
   if (auto) { FR.draftCpu(false); return; }
   if (FR.draftTurn() === F.team && id) FR.draftPick(F.team, wid(id));
   FR.draftCpu(true);
  });
  const d = draftState(); if (!d || d.done) { M.stage = 'team'; save(); teamPrep(); }
  save(); return true;
 }
 function teamPrep() { withW((FR, F) => { if (!F || !F.off) return; F.off.step = 'final'; FR.cpuCutdown(); fixRoster(FR, F); FR.save(); }); }
 function teamDone() {
  if (!M || M.stage !== 'team') return false;
  withW((FR, F) => { if (!F || !F.off) return; fixRoster(FR, F); closeOff(FR, F); });
  M.yr++; startSeason(); save(); return true;
 }

 // ---------- a real game: your team (whole-team control, like a normal game) ----------
 function teamFor(slot, id) {
  const base = T(id), t = Object.assign({}, base, { id: slot, szBase: base.id, roster: rosterOf(id), fm460: id });
  t.nums = {};
  for (const x of t.roster) { const p = P(x); if (!p) continue; let n = p.wnum; if (n == null && p.fm460b) try { n = jerseyNo(P(p.fm460b), 'real', base.id); } catch (e) {} if (n == null && base.nums && base.nums[x] != null) n = base.nums[x]; if (n != null && n !== '') t.nums[x] = n; }
  return t;
 }
 function regGame(a, b) { SZ_REG.FM6U = teamFor('FM6U', a); SZ_REG.FM6O = teamFor('FM6O', b); }
 function unregGame() { try { if (SZ_REG.FM6U && SZ_REG.FM6U.fm460) delete SZ_REG.FM6U; if (SZ_REG.FM6O && SZ_REG.FM6O.fm460) delete SZ_REG.FM6O; } catch (e) {} }
 function play() {
  ensure();
  const L = M.L, nx = myGame(L); if (!nx || nx.bye || L.elim) return false;
  regGame(L.team, nx.opp);
  try { localStorage.removeItem('rl_lu_FM6O'); if (M.luTeam !== L.team) { localStorage.removeItem('rl_lu_FM6U'); M.luTeam = L.team; } } catch (e) {}
  const meta = { label: LVN[L.lvl] + ' - ' + nx.label, night: R() < .3, fm460: { id: M.id, opp: nx.opp, label: nx.label } };
  newGame('FM6U', 'FM6O', 'career', nx.home, meta);
  const G = game; if (!G) return false;
  G.fm460 = { id: M.id, opp: nx.opp, real: L.team };
  G.lk2503 = M.diff | 0; try { applyDiff(); } catch (e) {} G.diff = M.diff | 0;
  BOOST = null;
  save();
  return true;
 }
 function gameOver(G) {
  if (!G || !G.fm460 || G.fm460.done || !M || G.fm460.id !== M.id || !M.L) return null;
  G.fm460.done = true;
  return record(G.score[0], G.score[1], true);
 }

 // ---------- START OVER ----------
 function startOver() { clear(); return true; }

 window.FM460 = {
  on: true, OFF: OFF, KEY: KEY, WKEY: WKEY, PFX: PFX, LVN: LVN, POSL: POSL,
  get: () => load(), has: () => !!load(), save: save, ensure: ensure, world: world, regWorld: regWorld, withW: withW,
  create: create, startOver: startOver, DIFFN: DIFFN, stars: stars, tOvr: tOvr, rankBy: rankBy, rosterOf: rosterOf, realOf: realOf, wid: wid,
  proIds: proIds, colIds: colIds, wIds: wIds, lvlOf: lvlOf, tname: tname, tobj: tobj,
  myGame: () => myGame(), simMine: simMine, simSeason: simSeason, stand: (ids) => stand(M.L, ids), finText: finText, isFinal: isFinal,
  seasonOver: seasonOver, choose: choose, recruitPool: recruitPool, recruitToggle: recruitToggle, recruitCut: recruitCut, recruitInfo: recruitInfo, recruitDone: recruitDone,
  resignSet: resignSet, resignNext: resignNext, draftState: draftState, draftPick: draftPick, teamDone: teamDone,
  play: play, gameOver: gameOver, unregGame: unregGame, curJob: curJob
 };
 try { load(); } catch (e) { console.error(e); }
})();
