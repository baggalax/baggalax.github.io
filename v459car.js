'use strict';
// v459car: CAREER MODE core (one created player: HIGH SCHOOL -> SIGNING DAY -> COLLEGE -> DRAFT NIGHT -> PRO -> WORLD GAMES -> ULTIMATE).
// window.CAR459. Kill switch: window.__rl_no459car = true (no CAREER button, no hooks, nothing registered).
// Storage (own keys only): rl_car459 (the career), rl_car459h (finished career cards), rl_car459fr (the career's own pro league,
// run by the Pro Franchise module FR458 in its own slot, so the person's franchise save rl_fr458 is never touched),
// rl_car459cards (finished career cards: real locker cards, ids CR59-<career id>).
// v2 (Nov 9): college/pro title = the normal title-card flip (real players only), heritage (FROM) picks the World Games team,
// HS teams can be renamed, the career ends after the World Games (no Ultimate stage), the final card is a CAREER card in the locker.
(function () {
 const OFF = () => !!window.__rl_no459car || !!window.__rl_v124gb;
 if (OFF()) { window.CAR459 = { OFF: () => true, on: false }; return; }
 const KEY = 'car459', HKEY = 'car459h', LKEY = 'car459fr';
 const ME = 'CAR459-ME';
 const SK = () => (typeof SKILLS !== 'undefined' ? SKILLS : [ 'spd', 'pow', 'acc', 'fin', 'stk', 'str', 'def', 'gb', 'fo', 'sav' ]);
 const POSL = [ 'A', 'M', 'FO', 'LSM', 'D', 'G' ];
 const LV = [ 'hs', 'col', 'pro', 'world', 'ult' ];
 const LVN = { hs: 'HIGH SCHOOL', col: 'COLLEGE', pro: 'PRO', world: 'WORLD', ult: 'FINAL BRACKET' };
 // key skills per position (what XP level-ups raise), from the game's own ovrOf weights
 const KEYS = { A: [ 'fin', 'acc', 'stk', 'str', 'pow', 'spd' ], M: [ 'pow', 'acc', 'spd', 'stk', 'str', 'fin', 'def' ], D: [ 'def', 'gb', 'spd', 'str', 'stk' ], LSM: [ 'def', 'gb', 'spd', 'stk' ], FO: [ 'fo', 'gb', 'spd' ], G: [ 'sav', 'stk' ] };
 const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
 const R = () => Math.random();
 const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
 const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [ a[i], a[j] ] = [ a[j], a[i] ]; } return a; };
 const pick = a => a[Math.floor(R() * a.length)];
 const P = id => (typeof PP === 'function' ? PP(id) : PLAYERS[id]);
 const ovrCalc = p => { try { return ovrOf(p); } catch (e) { return 60; } };
 let C = null;

 // ---------- storage ----------
 function load() {
  if (C) return C;
  let o = null; try { o = LS.get(KEY, null); } catch (e) { o = null; }
  if (o && o.v === 1 && o.me) { C = o; regAll(); try { if ((C.stage === 'worldEnd' || C.stage === 'ult') && C.world) { C.cardUp = null; finishCareer(); } } catch (e) { console.error(e); }
   // a career finished before v2: its final card is the CAREER card in the locker now (added once by cardsMigrate)
   try { if (C.stage === 'done' && C.final && !C.final.pid) { const d = C.final.diff | 0; C.final.title = DIFFN(d) + ' CAREER'; C.final.tier = 2 + d; C.final.pid = CPFX + C.final.id; if (C.cardUp && C.cardUp.from === 'ult') C.cardUp = null; } } catch (e) { console.error(e); } }
  return C;
 }
 function save() { if (!C) return; try { LS.set(KEY, C); } catch (e) { console.error(e); } }
 // (old finished cards get their tier recomputed from the difficulty: BAGGATWAAN is the rarest, no longer GROSS)
 function hall() { const h = LS.get(HKEY, null); if (!Array.isArray(h)) return []; for (const x of h) if (x && typeof x === 'object') { x.tier = 2 + (x.diff | 0); if (/^ULTIMATE /.test(String(x.title || ''))) x.title = DIFFN(x.diff | 0) + ' CAREER'; } return h; }
 function clear() {
  if (C) unregAll();
  C = null; try { localStorage.removeItem('rl_' + KEY); localStorage.removeItem('rl_' + LKEY); } catch (e) {}
 }

 // ---------- the created player + every generated/snapshot player the career owns ----------
 function regMe() {
  if (!C) return null;
  const m = C.me, p = { id: ME, n: m.n, n0: m.n, pos: m.pos, r: {}, real: false, team: C.team || '', wnum: m.num, skin: m.skin, car459: 1 };
  SK().forEach((k, i) => p.r[k] = m.r[i]);
  p.ovr = ovrCalc(p);
  PLAYERS[ME] = p;
  return p;
 }
 function regGen(id, e) {
  const p = { id: id, n: e.n, n0: e.n, pos: e.pos, r: {}, real: !!e.real, team: e.t || '', wnum: e.w != null ? e.w : null, skin: e.s != null ? e.s : 0, car459: 1 };
  SK().forEach((k, i) => p.r[k] = e.r[i]);
  if (e.b) { p.c459b = e.b; const b = PLAYERS[e.b]; if (b && b.n) { p.n = b.n; p.n0 = b.n0 != null ? b.n0 : b.n; } }
  p.ovr = ovrCalc(p);
  PLAYERS[id] = p;
  return p;
 }
 function regAll() {
  if (!C) return;
  regMe();
  for (const id in (C.gen || {})) try { regGen(id, C.gen[id]); } catch (e) { console.error(e); }
 }
 function unregAll() { try { delete PLAYERS[ME]; for (const id in (C && C.gen || {})) delete PLAYERS[id]; } catch (e) {} }
 const ovrMe = () => { const p = P(ME); return p ? p.ovr : 0; };

 // ---------- names + generated players (high school + snapshots) ----------
 let NAMES = null;
 function names() {
  if (NAMES) return NAMES;
  const fs = new Set, ls = new Set;
  for (const id in PLAYERS) { const p = PLAYERS[id]; if (!p || !p.col25 || p.fr458 !== undefined) continue; const w = String(p.n0 || p.n || '').trim().split(/\s+/); if (w.length === 2 && /^[A-Za-z'-]+$/.test(w[0]) && /^[A-Za-z'-]+$/.test(w[1])) { fs.add(w[0]); ls.add(w[1]); } }
  NAMES = { f: [ ...fs ].sort(), l: [ ...ls ].sort() };
  if (!NAMES.f.length) NAMES = { f: [ 'Jack', 'Ryan', 'Matt' ], l: [ 'Smith', 'Jones', 'Brown' ] };
  return NAMES;
 }
 function shapeRatings(pos, tgt) {
  const pool = Object.values(PLAYERS).filter(p => p && p.pos === pos && p.col25 && p.fr458 === undefined && !p.car459);
  const tpl = pool.length ? pick(pool) : null, ks = SK();
  const tmp = { pos: pos, r: {} };
  let r = ks.map(k => tpl ? tpl.r[k] : 55);
  const f = tpl ? tgt / Math.max(40, tpl.ovr) : 1;
  const fixed = (k, v) => (k === 'fo' && pos !== 'FO' && v < 40) || (k === 'sav' && pos !== 'G' && v < 20);
  r = r.map((v, i) => fixed(ks[i], v) ? v : clamp(Math.round(v * f + (R() - .5) * 8), 1, 99));
  for (let k = 0; k < 8; k++) { ks.forEach((kk, i) => tmp.r[kk] = r[i]); const o = ovrCalc(tmp), d = tgt - o; if (Math.abs(d) <= 0) break; r = r.map((v, i) => fixed(ks[i], v) ? v : clamp(v + d, 1, 99)); }
  return r;
 }
 function genPlayer(pre, team, pos, tgt, w) {
  const N = names();
  const id = pre + (++C.gn);
  C.gen[id] = { n: pick(N.f) + ' ' + pick(N.l), pos: pos, r: shapeRatings(pos, tgt), t: team, w: w, s: ri(0, 5) };
  regGen(id, C.gen[id]);
  return id;
 }

 // ---------- the created player's starting ratings ----------
 // v2: he starts LOW (about OVR 45, one of the weaker guys on his high school team) and grows with EXP
 function startRatings(pos) { return shapeRatings(pos, TUNE().start); }

 // ---------- the FR458 pro league, in the career's own slot ----------
 let SW = null;
 function swapIn() {
  const FR = window.FR458; if (!FR || SW) return !!SW;
  try { FR.save(); } catch (e) {}
  SW = { get: LS.get, set: LS.set, rm: Storage.prototype.removeItem };
  const sw = SW;
  LS.get = function (k, d) { return sw.get.call(this, k === 'fr458' ? LKEY : k, d); };
  LS.set = function (k, v) { return sw.set.call(this, k === 'fr458' ? LKEY : k, v); };
  Storage.prototype.removeItem = function (k) { if (k === 'rl_fr458') return; return sw.rm.call(this, k); };
  try { FR.clear(); FR.get(); } catch (e) { console.error(e); }
  return true;
 }
 function swapOut() {
  const FR = window.FR458; if (!FR || !SW) return;
  try { FR.save(); } catch (e) { console.error(e); }
  try { FR.clear(); } catch (e) {}
  LS.get = SW.get; LS.set = SW.set; Storage.prototype.removeItem = SW.rm; SW = null;
  try { FR.get(); } catch (e) { console.error(e); }
  regAll();
 }
 function withL(fn) {
  if (!window.FR458) return null;
  const mine = !SW;
  if (mine) swapIn();
  try { return fn(window.FR458, window.FR458.get()); } finally { if (mine) swapOut(); }
 }
 // F.pl entry for the created player, kept in step with the career's own copy
 function meToF(F, team) {
  const m = C.me;
  F.pl[ME] = Object.assign(F.pl[ME] || {}, { b: null, n: m.n, pos: m.pos, r: m.r.slice(), a: m.age, t: team || C.team || '', w: m.num, s: m.skin });
 }
 function meFromF(F) { const e = F && F.pl[ME]; if (!e) return; C.me.r = e.r.slice(); C.me.age = e.a; }
 const frTeamOf = F => F.teams.find(t => (F.ro[t] || []).includes(ME)) || null;
 // the pro rosters as the career's own players (prefix C9-), so a sim or a game never depends on which league FR458 has loaded
 function snapPro(F) {
  for (const id in C.gen) if (id.indexOf('C9-') === 0) delete C.gen[id], delete PLAYERS[id];
  const ro = {};
  for (const t of F.teams) {
   ro[t] = [];
   for (const id of F.ro[t] || []) {
    if (id === ME) { ro[t].push(ME); continue; }
    const p = P(id); if (!p) continue;
    const cid = 'C9-' + id;
    C.gen[cid] = { n: p.n, pos: p.pos, r: SK().map(k => p.r[k]), t: t, w: p.wnum != null ? p.wnum : null, s: p.skin != null ? p.skin : 0, real: !!p.real, b: p.fr458 || null };
    regGen(cid, C.gen[cid]);
    ro[t].push(cid);
   }
  }
  C.pro.ro = ro;
  C.pro.ct = {}; for (const t of F.teams) for (const id of F.ro[t] || []) if (F.ct[id]) C.pro.ct[id === ME ? ME : 'C9-' + id] = F.ct[id].slice();
  C.pro.cap = window.FR458.CAP;
  C.pro.pay = {}; for (const t of F.teams) C.pro.pay[t] = window.FR458.payroll(t);
 }

 // ---------- teams ----------
 const HSN = [ [ 'LAKESIDE', 'LAKERS', '#1f6fd1', '#ffd23a' ], [ 'RIVERTON', 'RAIDERS', '#b3202a', '#f4f4f4' ], [ 'OAK HILL', 'OWLS', '#1d6b35', '#e9c46a' ], [ 'ST. JAMES', 'SAINTS', '#5a2a8a', '#f4f4f4' ], [ 'NORTHPORT', 'NAVIGATORS', '#0b2545', '#8fe3f0' ], [ 'WESTFIELD', 'WOLVES', '#4a4f57', '#ff8a3d' ], [ 'CEDAR RIDGE', 'COUGARS', '#7a3b12', '#ffd6a0' ], [ 'BAY SHORE', 'BOLTS', '#0f7c8a', '#fff2b0' ] ];
 // rename a high school team (school, mascot, abbreviation); stored in the career save
 function renameHS(id, o) {
  const h = hsTeam(id); if (!h || !o) return { ok: false, why: 'NO TEAM' };
  const cl = (v, n) => String(v == null ? '' : v).toUpperCase().replace(/[^A-Z0-9 .'&-]/g, '').replace(/\s+/g, ' ').trim().slice(0, n).trim();
  const nm = cl(o.name, 16), nk = cl(o.nick, 14), ab = cl(o.abbr, 4).replace(/[^A-Z0-9]/g, '');
  if (!nm || !nk) return { ok: false, why: 'TYPE A SCHOOL AND A MASCOT' };
  try { if (window.UGC41 && (UGC41.bad(nm) || UGC41.bad(nk) || (ab && UGC41.bad(ab)))) return { ok: false, why: 'PICK A DIFFERENT NAME' }; } catch (e) {}
  h.name = nm; h.nick = nk; h.abbr = ab.length >= 2 ? ab : nm.replace(/[^A-Z]/g, '').slice(0, 3) || 'HS'; h.coach = 'COACH ' + h.abbr; h.ren = 1;
  try { if (typeof badgeUrls !== 'undefined' && badgeUrls) delete badgeUrls[id]; } catch (e) {}
  save(); return { ok: true };
 }
 function hsTeam(id) { const h = C && C.hs && C.hs.teams && C.hs.teams[id]; return h || null; }
 function hsObj(id) {
  const h = hsTeam(id); if (!h) return null;
  let icon = null; try { const L0 = h.name[0], ct = COL25.TEAMS.find(t => (t.abbr || t.name || '')[0] === L0 && t.icon) || COL25.TEAMS.find(t => String(t.name)[0] === L0) || COL25.TEAMS[h.ic % COL25.TEAMS.length]; icon = ct.icon; } catch (e) {}
  return { id: id, name: h.name, full: h.name + ' ' + h.nick, city: '', abbr: h.abbr, lg: 'HIGH SCHOOL', era: '', c1: h.c1, c2: h.c2, icon: icon, coach: h.coach || 'COACH ' + h.abbr, coachNote: 'HIGH SCHOOL - HEAD COACH', off: 4, def: 4, roster: (h.ro || []).slice(), nick: h.nick };
 }
 const tobj = id => hsObj(id) || T(id);
 const tname = id => { const t = tobj(id); return t ? t.name : String(id); };
 const tabbr = id => { const t = tobj(id); return t ? (t.abbr || t.name.slice(0, 4)) : String(id); };
 function baseRoster(id) {
  const h = hsTeam(id); if (h) return h.ro.slice();
  if (C.lvl === 'pro' || C.lvl === 'ult') { const r = C.pro && C.pro.ro && C.pro.ro[id]; if (r && C.lvl === 'pro') return r.slice(); if (r && C.lvl === 'ult' && id === C.team) return r.slice(); }
  const t = T(id); return (t && t.roster || []).filter(x => P(x));
 }
 // your team's roster: the real roster + you (you take the spot of the weakest player at your position)
 function myRoster() {
  const L = C.L, ids = baseRoster(C.team).filter(x => x !== ME);
  const same = ids.filter(x => P(x) && P(x).pos === C.me.pos).sort((a, b) => P(a).ovr - P(b).ovr);
  if (same.length > 1 && ids.length >= 17) ids.splice(ids.indexOf(same[0]), 1);
  ids.push(ME);
  return ids;
 }
 function rosterOf(id) { return id === C.team ? myRoster() : baseRoster(id); }
 function teamOvr(id) { const ids = rosterOf(id).filter(x => P(x)); if (!ids.length) return 60; const s = ids.map(x => P(x).ovr).sort((a, b) => b - a).slice(0, 14); return Math.round(s.reduce((a, b) => a + b, 0) / s.length); }

 // ---------- lineups: you always start ----------
 function forceIn(lu, pos) {
  lu = JSON.parse(JSON.stringify(lu));
  const strip = (k, alt) => { if (Array.isArray(lu[k])) lu[k] = lu[k].map(x => x === ME ? alt : x); else if (lu[k] === ME) lu[k] = alt; };
  const ids = [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ];
  if (ids.includes(ME)) {
   const ok = pos === 'A' ? lu.A.includes(ME) : pos === 'M' ? lu.M.includes(ME) : pos === 'D' ? lu.D.includes(ME) : pos === 'LSM' ? lu.LSM === ME : pos === 'FO' ? lu.FO === ME : lu.G === ME;
   if (ok) return lu;
  }
  const slot = { A: [ 'A', 2 ], M: [ 'M', 2 ], D: [ 'D', 2 ], LSM: [ 'LSM' ], FO: [ 'FO' ], G: [ 'G' ] }[pos] || [ 'M', 2 ];
  const old = slot.length > 1 ? lu[slot[0]][slot[1]] : lu[slot[0]];
  for (const k of [ 'A', 'M', 'D', 'LSM', 'SSDM', 'SSDM2', 'FO', 'G' ]) strip(k, old);
  if (slot.length > 1) lu[slot[0]][slot[1]] = ME; else lu[slot[0]] = ME;
  return lu;
 }
 function lineupOf(id) { const ids = rosterOf(id).filter(x => P(x)); let lu = autoLineup(ids); if (id === C.team) lu = forceIn(lu, C.me.pos); return lu; }

 // ---------- sims ----------
 const PW = {};
 function power(id) { const k = C.lvl + '|' + id; if (id !== C.team && PW[k]) return PW[k]; let u; try { u = unitPower(lineupOf(id)); } catch (e) { u = { off: 0, def: 0, gk: 0, fo: 0 }; } if (id !== C.team) PW[k] = u; return u; }
 function simScoreC(a, b) {
  let A, B; const bb = window.BOOST; window.BOOST = null;
  try { A = power(a); B = power(b); } finally { window.BOOST = bb; }
  const dAdj = (a === C.team ? -1 : b === C.team ? 1 : 0) * ((C.diff | 0) - 2) * .006;
  const pa = clamp(.33 + .05 * (A.off - B.def) - .04 * B.gk + .02 * (A.fo - B.fo) + dAdj, .12, .6), pb = clamp(.33 + .05 * (B.off - A.def) - .04 * A.gk + .02 * (B.fo - A.fo) - dAdj, .12, .6);
  let sa = 0, sb = 0;
  for (let i = 0; i < 26; i++) { if (R() < pa) sa++; if (R() < pb) sb++; }
  while (sa === sb) { if (R() < pa) sa++; else if (R() < pb) sb++; }
  return [ sa, sb ];
 }
 // your box score in a simmed game, from your ratings and your position
 function simBox(gf, ga) {
  const p = P(ME), o = p.ovr, pos = p.pos, k = Math.pow(clamp(o, 40, 99) / 80, 2), r = x => p.r[x] || 50, d = (C.diff | 0);
  const bin = (n, q) => { let s = 0; for (let i = 0; i < n; i++) if (R() < q) s++; return s; };
  const pois = m => { let L = Math.exp(-m), kk = 0, pp = 1; do { kk++; pp *= R(); } while (pp > L && kk < 40); return kk - 1; };
  const lvlK = { hs: 1.25, col: 1.05, pro: .95, world: .9, ult: .88 }[C.lvl] || 1, hard = 1 - (d - 2) * .03;
  const wg = { A: .26, M: .17, D: .03, LSM: .04, FO: .04, G: 0 }[pos], wa = { A: .2, M: .15, D: .04, LSM: .04, FO: .03, G: .02 }[pos];
  const b = { g: bin(gf, clamp(wg * k * lvlK * hard, 0, .65)), a: 0, gb: pois({ A: 1.6, M: 2.6, D: 2.8, LSM: 3.6, FO: 4.2, G: 1.2 }[pos] * (r('gb') / 72) * lvlK), ct: pos === 'D' || pos === 'LSM' ? pois(1.1 * (r('def') / 75) * lvlK) : pos === 'M' ? pois(.35) : 0, sv: 0, sa: 0, fow: 0, fot: 0, to: pois(pos === 'G' ? .2 : .9), sh: 0 };
  b.a = bin(Math.max(0, gf - b.g), clamp(wa * k * lvlK * hard, 0, .5));
  b.sh = b.g + pois(pos === 'A' ? 2.5 : pos === 'M' ? 1.8 : .3);
  if (pos === 'FO') { b.fot = gf + ga + ri(2, 5); b.fow = bin(b.fot, clamp(.42 + (r('fo') - 75) / 90 + (lvlK - 1) * .4 - (d - 2) * .01, .2, .8)); }
  if (pos === 'G') { b.ga = ga; b.sv = Math.max(0, Math.round(ga * clamp((r('sav') - 30) / 45, .5, 1.8) * (lvlK * hard) + ri(-2, 3))); b.sa = b.sv + ga; }
  return b;
 }

 // ---------- leagues (one per level per season): schedule, table, playoffs ----------
 function blank() { return { gp: 0, g: 0, a: 0, gb: 0, ct: 0, sv: 0, sa: 0, ga: 0, fow: 0, fot: 0, sh: 0, to: 0, w: 0, l: 0 }; }
 function rounds(teams, n, my, pref) {
  const out = [], others = teams.filter(t => t !== my);
  let opp = shuffle(others.slice()), oi = 0;
  if (pref && pref.length) { const p = shuffle(pref.filter(t => t !== my && others.includes(t))); opp = p.concat(opp.filter(t => !p.includes(t))); }
  for (let r = 0; r < n; r++) {
   const rd = [], rest = shuffle(others.slice());
   if (my) { const o = opp[oi++ % opp.length]; rd.push([ my, o ]); rest.splice(rest.indexOf(o), 1); }
   for (let i = 0; i + 1 < rest.length; i += 2) rd.push([ rest[i], rest[i + 1] ]);
   out.push(rd);
  }
  return out;
 }
 function rr(teams) { // round robin (circle method)
  const t = teams.slice(); if (t.length % 2) t.push('BYE');
  const n = t.length, out = [];
  for (let r = 0; r < n - 1; r++) { const rd = []; for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; if (a !== 'BYE' && b !== 'BYE') rd.push(r % 2 ? [ b, a ] : [ a, b ]); } out.push(rd); t.splice(1, 0, t.pop()); }
  return out;
 }
 function newLeague(lvl, opt) {
  const L = { lvl: lvl, yr: opt.yr, nm: opt.nm, team: C.team, teams: opt.teams.slice(), rounds: opt.rounds || [], wk: 0, table: {}, mine: [], st: blank(), phase: opt.rounds && opt.rounds.length ? 'reg' : 'po', po: null, poN: opt.poN || 8, poNames: opt.poNames, champ: null, elim: false, groups: opt.groups || null, home: R() < .5 };
  for (const t of L.teams) L.table[t] = { w: 0, l: 0, gf: 0, ga: 0 };
  for (const k in PW) delete PW[k];
  C.L = L;
  if (L.phase === 'po') startPo(L, opt.seeds);
  return L;
 }
 function stand(L, ids) {
  ids = ids || L.teams;
  return ids.map(id => Object.assign({ id: id }, L.table[id])).sort((x, y) => y.w - x.w || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || teamOvr(y.id) - teamOvr(x.id));
 }
 function startPo(L, seeds) {
  if (!seeds) {
   if (L.groups) { const A = stand(L, L.groups[0]).map(x => x.id), B = stand(L, L.groups[1]).map(x => x.id); seeds = [ A[0], B[1], B[0], A[1] ]; L.po = { r: 0, rounds: [ { nm: L.poNames[0], games: [ { a: seeds[0], b: seeds[1] }, { a: seeds[2], b: seeds[3] } ] } ], seeds: seeds }; L.phase = 'po'; L.elim = !seeds.includes(L.team); return; }
   seeds = stand(L).slice(0, L.poN).map(x => x.id);
  }
  const n = seeds.length, ord = [];
  // 1 v N, 2 v N-1 ... in bracket order so 1 and 2 meet in the final
  const bo = (function (k) { let o = [ 1 ]; while (o.length < k) { const m = o.length * 2 + 1; o = o.flatMap(x => [ x, m - x ]); } return o; })(n);
  for (let i = 0; i < n; i += 2) ord.push({ a: seeds[bo[i] - 1], b: seeds[bo[i + 1] - 1] });
  const names = L.poNames || [];
  L.po = { r: 0, rounds: [ { nm: names[names.length - Math.log2(n)] || 'PLAYOFFS', games: ord } ], seeds: seeds };
  L.phase = 'po';
  L.elim = !seeds.includes(L.team);
 }
 function myGame(L) {
  L = L || C.L; if (!L) return null;
  if (L.phase === 'reg') {
   const rd = L.rounds[L.wk]; if (!rd) return null;
   const g = rd.find(x => x[0] === L.team || x[1] === L.team);
   if (!g) return { bye: true, label: (L.wkName || 'WEEK') + ' ' + (L.wk + 1) };
   const opp = g[0] === L.team ? g[1] : g[0];
   return { opp: opp, home: g[0] === L.team, label: (L.groups ? 'GROUP GAME ' : (L.wkName || 'WEEK') + ' ') + (L.wk + 1) + (L.groups ? '' : ' OF ' + L.rounds.length) };
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
   for (const [ a, b ] of L.rounds[L.wk] || []) { if (a === L.team || b === L.team) continue; const [ sa, sb ] = simScoreC(a, b); apply(L, a, b, sa, sb); }
   L.wk++;
   if (L.wk >= L.rounds.length) startPo(L);
   return;
  }
  if (L.phase === 'po') {
   const R0 = L.po.rounds[L.po.r];
   for (const g of R0.games) if (!g.s) g.s = simScoreC(g.a, g.b);
   const win = R0.games.map(g => g.s[0] > g.s[1] ? g.a : g.b);
   if (R0.games.some(g => (g.a === L.team || g.b === L.team) && (g.s[0] > g.s[1] ? g.b : g.a) === L.team)) L.elim = true;
   if (win.length === 1) { L.champ = win[0]; L.phase = 'done'; return; }
   const names = L.poNames || [], left = win.length;
   const games = []; for (let i = 0; i < win.length; i += 2) games.push({ a: win[i], b: win[i + 1] });
   L.po.rounds.push({ nm: names[names.length - Math.log2(left)] || 'NEXT ROUND', games: games });
   L.po.r++;
  }
 }
 function simRest(L) { let g = 0; while (L.phase !== 'done' && g++ < 200) { if (myGame(L) && !L.elim) break; simRound(L); } }

 // ---------- XP: goals / assists / GBs / saves / faceoffs raise your ratings between games ----------
 // growth curve (v2): each level-up raises 3 key skills by a step that shrinks as he nears the ceiling of his level
 // (HS ~45 -> ~60, college ~60-75, pro ~75-90, World 90+); harder difficulty = more EXP for the same game
 const TUNE = () => Object.assign({ start: 46, cap: { hs: 70, col: 79, pro: 97, world: 99, ult: 99 }, div: { hs: 1.6, col: 4, pro: 3, world: 2.5, ult: 3 }, xpm: .08, lvx: { hs: 2.4, col: 1, pro: 1.15, world: 1.8, ult: 1 } }, window.__c9tune || {});
 const xpNeed = lv => 40 + lv * 10;
 function gainXP(b, win) {
  const TU = TUNE(), xp = Math.round((10 * (b.g || 0) + 7 * (b.a || 0) + 3 * (b.gb || 0) + 4 * (b.ct || 0) + 1.2 * (b.sv || 0) + 1.5 * (b.fow || 0) + (win ? 6 : 3)) * (1 + TU.xpm * (C.diff | 0)) * ((TU.lvx && TU.lvx[C.lvl]) || 1));
  const m = C.me; m.xp += xp; m.xpT = (m.xpT || 0) + xp;
  const ups = [];
  while (m.xp >= xpNeed(m.lv)) {
   m.xp -= xpNeed(m.lv); m.lv++;
   const ks = KEYS[m.pos] || KEYS.M, idx = SK();
   const room = (C.lvl === 'hs' ? 84 : C.lvl === 'col' ? 94 : 99);
   const up = {};
   const o0 = ovrMe(), cap = TU.cap[C.lvl] || 99, stp = clamp(Math.round((cap - o0) / ((TU.div && TU.div[C.lvl]) || 4)), 1, C.lvl === 'hs' ? 7 : 6);
   // the 3 skills: his two most important ones that still have room, then a random key skill
   const order = ks.filter(k => { const j = idx.indexOf(k); return j >= 0 && m.r[j] < room; });
   const sel = order.slice(0, 2).concat(order.length ? [ pick(order) ] : []);
   for (const k of sel) { const j = idx.indexOf(k); if (j < 0 || m.r[j] >= room) continue; const add = Math.min(stp, 99 - m.r[j], room - m.r[j]); if (add <= 0) continue; m.r[j] += add; up[k] = (up[k] || 0) + add; }
   regMe();
   ups.push(up);
  }
  regMe();
  return { xp: xp, ups: ups };
 }
 // a season's worth of growth (age + off-season work)
 function ageUp(step) {
  const m = C.me; m.age++;
  const ks = KEYS[m.pos] || KEYS.M, idx = SK();
  for (const k of ks) { const j = idx.indexOf(k); m.r[j] = clamp(m.r[j] + step + ri(0, 1), 1, 99); }
  regMe();
 }

 // ---------- record your game (simmed or played for real) ----------
 function record(sa, sb, box, real) {
  const L = C.L, nx = myGame(L); if (!nx) return null;
  const win = sa > sb, st = L.st;
  st.gp++; if (win) st.w++; else st.l++;
  for (const k of [ 'g', 'a', 'gb', 'ct', 'sv', 'sa', 'ga', 'fow', 'fot', 'sh', 'to' ]) st[k] += box[k] || 0;
  const xp = gainXP(box, win);
  L.mine.push({ opp: nx.opp, home: nx.home, label: nx.label, s: [ sa, sb ], b: box, real: !!real, xp: xp.xp });
  if (L.phase === 'reg') { apply(L, L.team, nx.opp, sa, sb); simRound(L); }
  else { const R0 = L.po.rounds[L.po.r], g = R0.games.find(x => !x.s && (x.a === L.team || x.b === L.team)); if (g) g.s = g.a === L.team ? [ sa, sb ] : [ sb, sa ]; simRound(L); }
  C.last = { s: [ sa, sb ], opp: nx.opp, label: nx.label, b: box, xp: xp.xp, ups: xp.ups, real: !!real, lvl: C.lvl };
  save();
  return C.last;
 }
 function simMine() {
  const L = C.L, nx = myGame(L); if (!nx) return null;
  if (nx.bye) { simRound(L); save(); return { bye: true }; }
  const [ sa, sb ] = simScoreC(L.team, nx.opp);
  return record(sa, sb, simBox(sa, sb), false);
 }
 function simSeason() { let g = 0; while (C.L && C.L.phase !== 'done' && g++ < 80) { if (myGame(C.L) && !C.L.elim) simMine(); else simRound(C.L); } save(); }

 // ---------- career levels ----------
 const DIFFN = d => (typeof DIFF_NAMES !== 'undefined' ? DIFF_NAMES[d] : [ 'SQUID', 'FISH', 'BEGINNER', 'GROSS', 'NASTY', 'BAGGATWAAN' ][d]) || 'BEGINNER';
 function create(o) {
  const nm = String(o.n || '').trim().replace(/\s+/g, ' ').slice(0, 18);
  if (!nm) return { ok: false, why: 'TYPE A NAME' };
  try { if (window.UGC41 && UGC41.bad(nm)) return { ok: false, why: 'PICK A DIFFERENT NAME' }; } catch (e) {}
  const from = fromOk(o.from) ? o.from : null, dad = fromOk(o.dad) ? o.dad : from, mom = fromOk(o.mom) ? o.mom : from, pos = POSL.includes(o.pos) ? o.pos : 'M', num = clamp(o.num | 0, 0, 99), skin = clamp(o.skin | 0, 0, 5), diff = clamp(o.diff | 0, 0, 5);
  if (C) unregAll();
  C = { v: 1, v2: 1, id: 'car' + Date.now().toString(36), made: Date.now(), me: { n: nm, num: num, pos: pos, skin: skin, r: startRatings(pos), age: 17, xp: 0, lv: 1, xpT: 0, from: from, dad: dad, mom: mom },
   diff: diff, ctl: 'team', lvl: 'hs', stage: 'hs', card: 'hs', team: null, gen: {}, gn: 0, seasons: [], log: [], titles: [], yr: 2026, hs: null, col: null, pro: null, world: null, ult: null, L: null, last: null, stars: 0 };
  try { localStorage.removeItem('rl_' + LKEY); } catch (e) {}
  regMe();
  startHS();
  logE('CREATED: ' + nm + ' #' + num + ' ' + pos + ' - ' + DIFFN(diff) + ' - ' + (C.ctl === 'me' ? 'JUST ME' : 'WHOLE TEAM') + (from ? ' - FROM ' + fromText(from, dad, mom) : ''));
  save();
  return { ok: true };
 }
 function logE(s) { (C.log = C.log || []).push({ y: C.yr, s: s }); }
 function startHS() {
  const pick6 = shuffle(HSN.slice()).slice(0, 6), teams = {};
  C.hs = { teams: teams };
  pick6.forEach((h, i) => {
   const id = 'C459H' + i, abbr = h[0].replace(/[^A-Z]/g, '').slice(0, 3);
   teams[id] = { name: h[0], nick: h[1], abbr: abbr, c1: h[2], c2: h[3], ic: ri(0, 76), ro: [] };
   const lvl = 50 + ri(-2, 6);
   const quota = { A: 5, M: 6, FO: 1, LSM: 1, D: 4, G: 1 };
   let w = 1;
   for (const pos in quota) for (let k = 0; k < quota[pos]; k++) teams[id].ro.push(genPlayer('C459G', id, pos, clamp(lvl + ri(-7, 6), 38, 66), (w = (w * 7 + 3) % 99 + 1)));
  });
  C.team = 'C459H0'; C.lvl = 'hs'; C.stage = 'hs';
  const ids = Object.keys(teams);
  newLeague('hs', { yr: C.yr, nm: 'SENIOR SEASON', teams: ids, rounds: rr(ids), poN: 2, poNames: [ 'STATE TITLE' ] });
  regMe();
 }
 // recruiting stars from the senior season
 function starsFor(L) {
  const st = L.st, gp = Math.max(1, st.gp), o = ovrMe(), pos = C.me.pos;
  const sc = pos === 'G' ? (st.sa ? st.sv / Math.max(1, st.sa) : .5) * 10 - 3 : (2 * st.g + 1.5 * st.a + .6 * st.gb + 1.2 * st.ct + .3 * st.fow) / gp;
  let s = o >= 70 ? 5 : o >= 65 ? 4 : o >= 60 ? 3 : o >= 56 ? 2 : 1;
  if (sc >= 7) s++; else if (sc < 2.5) s--;
  if (L.champ === C.team) s++;
  return clamp(s, 1, 5);
 }
 function endLevelSeason(fin) {
  const L = C.L;
  const row = Object.assign({ lvl: L.lvl, yr: L.yr, nm: L.nm, team: L.team, ovr: ovrMe(), fin: fin || finText(L), champ: L.champ === L.team }, L.st);
  C.seasons.push(row);
  if (L.champ === L.team) { const t = { lvl: L.lvl, yr: L.yr, team: L.team, nm: titleName(L.lvl) }; C.titles.push(t); try { t.flip = titleCards(L); } catch (e) { console.error(e); } }
  return row;
 }
 // ---------- title cards: a college or pro title = the same title-card flip as the normal modes (real players only) ----------
 // Your roster is mapped back to the game's real players: career snapshots (C9-) and franchise copies point at their real base id;
 // you, the high school kids and every generated freshman have none, so they never show up and never get a card.
 function realBase(id) {
  if (!id || id === ME) return null;
  const p = P(id); if (!p) return null;
  let b = id;
  if (p.car459) b = p.c459b || null;
  else if (p.fr458 !== undefined) b = p.fr458 || null;
  if (!b) return null;
  const q = PLAYERS[b];
  if (!q || q.car459 || q.fr458 !== undefined || q.cr59 || q.leg) return null;
  return b;
 }
 function realIds(ids) { const out = []; for (const id of ids || []) { const b = realBase(id); if (b && !out.includes(b)) out.push(b); } return out; }
 const FLIPK = 'CAR459|';
 function titleCards(L) {
  if (!(L.lvl === 'col' || L.lvl === 'pro') || !window.V22 || !V22.on || !V22.on()) return null;
  const ids = realIds(myRoster()), why = L.lvl === 'col' ? 'CAREER NATTY' : 'CAREER PRO TITLE', key = FLIPK + C.id + '|' + L.lvl + '|' + L.yr, tid = L.team;
  const res = { k: key, real: ids.length, deck: 0, need: 0, got: 0 };
  if (!ids.length) return res;
  const fs = V22.flipSplit ? V22.flipSplit(ids, tid, why, key) : null;
  const got = V22.grantIds(fs ? fs.pass : ids, tid, why);
  res.deck = fs ? fs.deck.length : 0; res.need = fs ? fs.need : 0; res.got = got.length;
  return res;
 }
 // the career's flip deck still waiting to be flipped (null when there is none)
 function flipPending() {
  try { if (!C || !window.V22 || !V22.flipDecks) return null; return V22.flipDecks().find(d => d && String(d.k).indexOf(FLIPK + C.id + '|') === 0) || null; } catch (e) { return null; }
 }
 const titleName = l => ({ hs: 'STATE CHAMPS', col: 'NATIONAL CHAMPS', pro: 'PRO CHAMPS', world: 'WORLD GOLD', ult: 'ULTIMATE CHAMPS' }[l] || 'CHAMPS');
 function finText(L) {
  if (L.champ === L.team) return titleName(L.lvl);
  if (L.lvl === 'world') { const fin = L.po && L.po.rounds[1]; if (fin && fin.games[0] && (fin.games[0].a === L.team || fin.games[0].b === L.team)) return 'SILVER'; return L.po && L.po.seeds.includes(L.team) ? 'LOST IN THE SEMIS' : 'OUT IN GROUPS'; }
  if (!L.po || !L.po.seeds.includes(L.team)) return L.lvl === 'col' ? 'MISSED THE TOURNAMENT' : L.lvl === 'hs' ? 'MISSED THE STATE FINAL' : 'MISSED THE PLAYOFFS';
  const lost = [ ...L.po.rounds ].reverse().find(r => r.games.some(g => g.s && (g.a === L.team || g.b === L.team)));
  return 'LOST IN THE ' + (lost ? lost.nm : 'PLAYOFFS');
 }
 // high school done -> stars + offers
 function hsDone() {
  if (C.stage !== 'hs' || C.L.phase !== 'done') return false;
  C.stars = starsFor(C.L);
  endLevelSeason();
  C.offers = offersFor(C.stars);
  C.stage = 'sign';
  logE('SENIOR SEASON DONE: ' + C.stars + '-STAR RECRUIT');
  save(); return true;
 }
 function colRank() { return COL25.TEAMS.map(t => t.id).filter(id => P((T(id).roster || [])[0])).sort((a, b) => teamOvr(b) - teamOvr(a)); }
 function offersFor(s) {
  const rk = colRank(), n = rk.length;
  const band = { 5: [ 0, 14 ], 4: [ 8, 28 ], 3: [ 22, 46 ], 2: [ 40, 62 ], 1: [ 55, n - 1 ] }[s];
  const pool = rk.slice(band[0], band[1] + 1);
  const o = shuffle(pool.slice()).slice(0, 4).sort((a, b) => rk.indexOf(a) - rk.indexOf(b));
  return o.map(id => ({ t: id, rank: rk.indexOf(id) + 1 }));
 }
 function sign(colId) {
  if (C.stage !== 'sign' || !(C.offers || []).some(o => o.t === colId)) return false;
  ageUp(2);
  C.col = { team: colId, yr: 1 };
  C.team = colId; C.lvl = 'col'; C.card = 'col'; C.stage = 'col'; C.yr++;
  C.cardUp = { from: 'hs', to: 'col', ft: C.L ? C.L.team : null };
  logE('SIGNED WITH ' + tname(colId));
  // the high school players are done (the teams' names stay for the career table)
  for (const id in C.gen) if (id.indexOf('C459G') === 0) { delete C.gen[id]; delete PLAYERS[id]; }
  for (const h in (C.hs && C.hs.teams || {})) C.hs.teams[h].ro = [];
  startCol();
  save(); return true;
 }
 const CLS = [ 'FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR' ];
 function startCol() {
  const ids = colRank();
  const mine = C.team, conf = (COL25.TEAMS.find(t => t.id === mine) || {}).conf;
  const confIds = conf ? COL25.TEAMS.filter(t => t.conf === conf).map(t => t.id) : [];
  newLeague('col', { yr: C.yr, nm: CLS[C.col.yr - 1] + ' SEASON', teams: ids, rounds: rounds(ids, 8, mine, confIds), poN: 8, poNames: [ 'NATIONAL QUARTERFINAL', 'NATIONAL SEMIFINAL', 'NATIONAL CHAMPIONSHIP' ] });
  C.L.conf = conf || ''; C.L.confIds = confIds;
 }
 function colDone() {
  if (C.stage !== 'col' || C.L.phase !== 'done') return false;
  endLevelSeason();
  C.stage = 'colEnd';
  C.proj = projPick();
  save(); return true;
 }
 function colReturn() {
  if (C.stage !== 'colEnd' || C.col.yr >= 4) return false;
  C.col.yr++; ageUp(3); C.yr++;
  C.stage = 'col'; startCol(); save(); return true;
 }
 // projected draft spot: where your projected pro rating ranks among this year's declared college class
 function projPick() {
  const mine = ovrMe();
  let k = 0;
  for (const ct of COL25.TEAMS) for (const id of ct.roster || []) { const p = P(id); if (!p || p.ovr <= mine) continue; k += p.ovr >= 84 ? 1 : .5; }
  const pk = Math.round(k) + 1, n = TEAMS.length;
  return { pick: pk, rd: pk <= n ? 1 : pk <= n * 2 ? 2 : 0, ovr: mine };
 }
 // ---------- draft night (the Pro Franchise draft, in the career's own league) ----------
 function runDraft() {
  if (C.stage !== 'colEnd') return null;
  const yr = C.yr, col = C.col.team;
  C.pro = C.pro || {};
  const res = withL((FR, F0) => {
   let F = F0;
   const ids = TEAMS.map(t => t.id);
   if (!F) F = FR.newFranchise(ids[0], { teams: ids, year: yr });
   F.year = yr;
   meToF(F, col); F.pl[ME].c = 1; F.pl[ME].a = Math.max(20, C.me.age);
   if (!F.col[col]) F.col[col] = [];
   F.col[col] = F.col[col].filter(x => x !== ME); F.col[col].push(ME);
   // worst team picks first (by roster strength on draft night one)
   const str = t => { const r = (F.ro[t] || []).map(id => P(id) ? P(id).ovr : 0).sort((a, b) => b - a).slice(0, 14); return r.reduce((a, b) => a + b, 0) / Math.max(1, r.length); };
   const ord = C.pro && C.pro.ord ? C.pro.ord.slice() : F.teams.slice().sort((a, b) => str(a) - str(b));
   F.off = { step: 'draft', y0: yr, ord: ord, news: [], rs: {}, done: {}, prog: {}, ret: [], expMine: [], start: [] };
   F.team = ord[ord.length - 1] === ord[0] ? ord[1] : ord[0];
   const D = FR.draftStart();
   if (!D.pool.includes(ME)) { D.pool.push(ME); D.from[ME] = col; }
   const before = SK().map((k, i) => C.me.r[i]), covr = ovrMe();
   FR.draftCpu(false);
   const pk = D.picks.find(p => p[1] === ME);
   let team = pk ? pk[0] : null, slot = pk ? pk[3] : 0;
   if (!team) { // undrafted: the team thinnest at your position signs you
    const pos = C.me.pos;
    team = F.teams.slice().sort((a, b) => F.ro[a].filter(x => P(x) && P(x).pos === pos).length - F.ro[b].filter(x => P(x) && P(x).pos === pos).length)[0];
    F.col[col] = (F.col[col] || []).filter(x => x !== ME); delete F.pl[ME].c; F.pl[ME].t = team; F.ro[team].push(ME); F.ct[ME] = [ 2, 450 ];
   }
   // a college star is not an instant pro star - you keep half of what the draft takes off a rookie
   const e = F.pl[ME]; e.r = e.r.map((v, i) => Math.round((v + before[i]) / 2)); try { FR.registerAll(); } catch (er) {}
   F.team = team;
   const picks = D.picks.map(p => ({ t: p[0], id: p[1], n: P(p[1]) ? P(p[1]).n : '?', pos: P(p[1]) ? P(p[1]).pos : '', ovr: P(p[1]) ? P(p[1]).ovr : 0, c: p[2], no: p[3] }));
   F.off.step = 'final';
   FR.cpuCutdown();
   fixMyRoster(FR, F);
   finish(FR, F);
   F.year = yr;
   meFromF(F);
   const ct = F.ct[ME] ? F.ct[ME].slice() : [ 2, 450 ];
   snapPro(F);
   return { team: team, slot: slot, picks: picks, ct: ct, n: F.teams.length, covr: covr };
  });
  if (!res) return null;
  C.draft = { team: res.team, no: res.slot, rd: res.slot ? Math.ceil(res.slot / res.n) : 0, inRd: res.slot ? (res.slot - 1) % res.n + 1 : 0, picks: res.picks, yr: C.yr, ct: res.ct, n: res.n, shown: 0, covr: res.covr };
  C.pro.team = res.team; C.team = res.team; C.lvl = 'pro'; C.card = 'pro'; C.stage = 'draft';
  C.cardUp = { from: 'col', to: 'pro', ft: col };
  C.pro.yr = 1;
  logE(res.slot ? 'DRAFTED #' + res.slot + ' OVERALL BY ' + tname(res.team) : 'UNDRAFTED - SIGNED BY ' + tname(res.team));
  save();
  return C.draft;
 }
 // your own team (FR's "user" team) is run by the career: fill to the minimum, trim to the maximum, stay under the cap
 function fixMyRoster(FR, F) {
  const t = F.team;
  let g = 0;
  while (F.ro[t].length > FR.RMAX && g++ < 20) { const c = F.ro[t].filter(x => x !== ME).sort((a, b) => FR.value(a) - FR.value(b))[0]; if (!c) break; FR.cut(c); }
  while (FR.payroll(t) > FR.CAP && g++ < 40) { const c = F.ro[t].filter(x => x !== ME && F.ct[x]).sort((a, b) => (F.ct[b][1] / Math.max(1, FR.value(b))) - (F.ct[a][1] / Math.max(1, FR.value(a))))[0]; if (!c || F.ro[t].length <= FR.RMIN) break; FR.cut(c); }
  try { FR.autoFill(); } catch (e) { console.error(e); }
 }
 function finish(FR, F) {
  let fin = FR.finishOffseason();
  for (let k = 0; !fin.ok && k < 3; k++) { fixMyRoster(FR, F); fin = FR.finishOffseason(); }
  if (!fin.ok) { console.warn('car459: offseason closed by force', fin && fin.why); F.off = null; F.year++; FR.save(); }
 }
 function draftSeen() { if (C.stage !== 'draft') return false; C.stage = 'pro'; C.yr++; startPro(); save(); return true; }
 function startPro() {
  const ids = Object.keys(C.pro.ro);
  newLeague('pro', { yr: C.yr, nm: 'PRO YEAR ' + C.pro.yr, teams: ids, rounds: rounds(ids, 10, C.team), poN: 8, poNames: [ 'QUARTERFINAL', 'SEMIFINAL', 'CHAMPIONSHIP' ] });
 }
 // pro season over: the league's offseason runs through FR458 (aging, CPU moves, free agency, the draft) - your contract is yours to decide
 function proDone() {
  if (C.stage !== 'pro' || C.L.phase !== 'done') return false;
  const L = C.L;
  endLevelSeason();
  const st = stand(L).map(x => x.id);
  C.pro.ord = st.slice().reverse(); if (L.champ) C.pro.ord = C.pro.ord.filter(x => x !== L.champ).concat([ L.champ ]);
  // the season ends in the career league too
  const r = withL((FR, F) => {
   if (!F) return null;
   F.year = C.yr;
   meToF(F, C.team);
   const tbl = {}; for (const t of F.teams) tbl[t] = L.table[t] || { w: 0, l: 0, gf: 0, ga: 0 };
   const res = []; if (L.po) for (const R0 of L.po.rounds) for (const g of R0.games) if (g.s) res.push([ g.a, g.b, g.s[0], g.s[1], R0.games.length === 1 ? 'FINAL' : R0.games.length === 2 ? 'SEMI' : 'QUARTER' ]);
   const S = { fr458: F.id, table: tbl, playoff: { seeds: L.po ? L.po.seeds : [], results: res }, champ: L.champ, year: C.yr, teams: F.teams };
   F.off = null; F.team = C.team;
   FR.endSeason(S);
   const O = F.off;
   if (O) O.ord = C.pro.ord.slice();
   // you can't retire mid-career
   if (!F.teams.some(t => F.ro[t].includes(ME))) { F.ro[C.team].push(ME); F.ct[ME] = [ 0, FR.ask(ME).sal ]; if (O) { O.expMine = (O.expMine || []).concat([ ME ]); O.rs[ME] = null; } }
   meFromF(F);
   const c = F.ct[ME] ? F.ct[ME].slice() : [ 0, 500 ];
   return { exp: c[0] === 0, ct: c, ask: FR.ask(ME) };
  });
  C.contract = r || { exp: false, ct: [ 1, 500 ] };
  C.offersFA = null;
  C.stage = 'proEnd';
  C.callup = callupOk();
  save(); return true;
 }
 function callupOk() {
  const s = C.seasons[C.seasons.length - 1] || {}, gp = Math.max(1, s.gp || 1), pos = C.me.pos, o = ovrMe();
  const sc = pos === 'G' ? (s.sa ? s.sv / Math.max(1, s.sa) : .5) * 10 - 2 : (2 * (s.g || 0) + 1.5 * (s.a || 0) + .6 * (s.gb || 0) + 1.2 * (s.ct || 0) + .3 * (s.fow || 0)) / gp;
  return o >= 80 || sc >= 4.5 || (C.pro.yr >= 3);
 }
 // ---------- heritage: where he grows up + where his dad and mom are from = the only World Games teams that can call him up ----------
 function countries() { try { return WTEAMS.map(t => t.id); } catch (e) { return []; } }
 function fromOk(id) { try { return !!id && WTEAMS.some(t => t.id === id); } catch (e) { return false; } }
 const fromOf = () => C && C.me && fromOk(C.me.from) ? C.me.from : null;
 // old saves: a single heritage value = where he grows up; dad and mom default to the same country
 const dadOf = () => C && C.me && fromOk(C.me.dad) ? C.me.dad : fromOf();
 const momOf = () => C && C.me && fromOk(C.me.mom) ? C.me.mom : fromOf();
 function heritage() {
  const out = [], add = (t, rel) => { if (!t) return; const o = out.find(x => x.t === t); if (o) o.rel.push(rel); else out.push({ t: t, rel: [ rel ] }); };
  add(fromOf(), 'grow'); add(dadOf(), 'dad'); add(momOf(), 'mom');
  for (const o of out) o.lab = o.rel.includes('grow') ? 'WHERE YOU GREW UP' : o.rel.length > 1 ? 'YOUR DAD\'S AND MOM\'S HOME' : o.rel[0] === 'dad' ? 'YOUR DAD\'S HOME' : 'YOUR MOM\'S HOME';
  return out;
 }
 // "USA - DAD IRELAND - MOM ITALY" (the ones equal to where he grows up are skipped)
 function fromText(f, d, m) {
  if (!fromOk(f)) return '';
  const nm = x => String(tname(x)).toUpperCase();
  return nm(f) + (fromOk(d) && d !== f ? ' - DAD ' + nm(d) : '') + (fromOk(m) && m !== f ? ' - MOM ' + nm(m) : '');
 }
 // an old save made before heritage existed is asked once, at the call-up
 function setFrom(id) {
  if (!C || !fromOk(id) || fromOf()) return false;
  C.me.from = id; C.me.dad = C.me.dad || id; C.me.mom = C.me.mom || id; logE('FROM: ' + tname(id)); save(); return true;
 }
 // the call-up bar: he has to be good enough to make that country's roster (about its 10th best player)
 function needOf(t) { try { const o = (T(t).roster || []).map(P).filter(Boolean).map(p => p.ovr).sort((a, b) => b - a); return o.length ? o[Math.min(9, o.length - 1)] : 60; } catch (e) { return 60; } }
 // the hardest teams to make (USA, Canada and any World team about as strong): their roster bar is near the top
 function topCountry(t) { try { const ns = countries().map(needOf).sort((a, b) => b - a), cut = (ns[1] != null ? ns[1] : ns[0]) - 1; return needOf(t) >= cut; } catch (e) { return false; } }
 // WORLD GAMES CHANCE from the easiest of his countries to make
 function wgChance(list) { const ns = (list || []).filter(fromOk).map(needOf); if (!ns.length) return ''; const m = Math.min(...ns); return m <= 77 ? 'HIGH' : m <= 83 ? 'MEDIUM' : 'LOW'; }
 function countryOffers() {
  const all = WTEAMS.map(t => t.id).sort((a, b) => teamOvr(b) - teamOvr(a)), me = ovrMe();
  return heritage().map(h => { const need = needOf(h.t); return { t: h.t, rel: h.rel, lab: h.lab, rank: all.indexOf(h.t) + 1, need: need, ok: me >= need }; });
 }
 // nobody called (or you are done): the career ends here with the card
 function endCareer() {
  if (!C || C.stage !== 'proEnd' || !C.contract || !C.contract.done) return false;
  C.world = { team: null, pro: C.team, fin: 'NOT CALLED UP' };
  logE('CAREER ENDS WITHOUT A WORLD GAMES CALL-UP');
  finishCareer(); return true;
 }
 // contract year: re-sign at the asking price, or test free agency (CPU teams with cap room bid)
 function faOffers() {
  if (C.offersFA) return C.offersFA;
  const r = withL((FR, F) => {
   if (!F || !F.off) return [];
   const a = FR.ask(ME), out = [];
   const tms = shuffle(F.teams.filter(t => t !== C.team)).sort((x, y) => FR.needs(y)[C.me.pos] - FR.needs(x)[C.me.pos]);
   for (const t of tms) { if (out.length >= 3) break; const sal = Math.round(a.sal * (.9 + R() * .3) / 10) * 10, yrs = clamp(a.yrs + ri(-1, 1), 1, 4); if (FR.payroll(t) + sal > FR.CAP) continue; out.push({ t: t, sal: sal, yrs: yrs }); }
   return out;
  });
  C.offersFA = r || []; save();
  return C.offersFA;
 }
 function contract(choice) {
  // choice: 'stay' (re-sign) | team id (sign with that free-agency offer)
  if (C.stage !== 'proEnd') return { ok: false };
  const r = withL((FR, F) => {
   if (!F || !F.off) return { ok: false, why: 'NO OFFSEASON' };
   const O = F.off;
   meToF(F, C.team);
   if (C.contract.exp) {
    if (choice === 'stay') { O.rs[ME] = null; const k = FR.resign(ME, true); if (!k.ok) { // make room: the career cuts the worst-value deal on your team
      const c = F.ro[F.team].filter(x => x !== ME && F.ct[x] && F.ct[x][0] > 0).sort((a, b) => FR.value(a) - FR.value(b))[0]; if (c) FR.cut(c); FR.resign(ME, true); } }
    else { O.rs[ME] = false; }
   }
   // your teammates' expiring deals: keep the good ones that fit
   for (const id of O.expMine || []) { if (id === ME) continue; const p = P(id); const keep = p && p.ovr >= 72 && FR.age(id) <= 31; const k = FR.resign(id, keep); if (keep && !k.ok) FR.resign(id, false); }
   FR.resignDone();
   FR.cpuMoves();
   let fa = null;
   if (C.contract.exp && choice !== 'stay') {
    const off = (C.offersFA || []).find(o => o.t === choice);
    if (off && F.fa.includes(ME)) { F.fa = F.fa.filter(x => x !== ME); F.ro[off.t].push(ME); F.ct[ME] = [ off.yrs, off.sal ]; F.pl[ME].t = off.t; F.team = off.t; fa = off; }
    else if (F.fa.includes(ME)) { F.fa = F.fa.filter(x => x !== ME); F.ro[C.team].push(ME); const a = FR.ask(ME); F.ct[ME] = [ a.yrs, a.sal ]; }
   }
   FR.faFinish();
   FR.draftStart(); FR.draftCpu(false);
   F.off.step = 'final';
   FR.cpuCutdown();
   fixMyRoster(FR, F);
   const news = (F.off.news || []).map(n => ({ k: n.k, s: n.s }));
   const picks = (F.off.dr ? F.off.dr.picks : []).slice(0, 8).map(p => ({ t: p[0], n: P(p[1]) ? P(p[1]).n : '?', pos: P(p[1]) ? P(p[1]).pos : '', c: p[2], no: p[3] }));
   finish(FR, F);
   meFromF(F);
   const t = frTeamOf(F) || C.team;
   snapPro(F);
   return { ok: true, team: t, ct: F.ct[ME] ? F.ct[ME].slice() : null, fa: fa, news: news, picks: picks };
  });
  if (!r || !r.ok) return r || { ok: false };
  if (r.team !== C.team) logE('SIGNED WITH ' + tname(r.team) + ' IN FREE AGENCY');
  else if (C.contract.exp) logE('RE-SIGNED WITH ' + tname(r.team));
  C.pro.team = r.team; C.team = r.team; C.pro.news = r.news; C.pro.picks = r.picks; C.contract = Object.assign({}, C.contract, { done: true, now: r.ct });
  save();
  return r;
 }
 function nextPro() {
  if (C.stage !== 'proEnd' || !C.contract.done) return false;
  C.pro.yr++; C.yr++;
  C.stage = 'pro'; startPro(); save(); return true;
 }
 function callup(country) {
  if (C.stage !== 'proEnd' || !C.contract.done || !C.callup) return false;
  if (!countryOffers().some(o => o.t === country && o.ok)) return false;
  C.world = { team: country, pro: C.team };
  C.team = country; C.lvl = 'world'; C.card = 'world'; C.yr++;
  C.cardUp = { from: 'pro', to: 'world', ft: C.world.pro };
  logE('CALLED UP BY ' + tname(country));
  const all = WTEAMS.map(t => t.id).sort((a, b) => teamOvr(b) - teamOvr(a)), field = [ country ].concat(all.filter(x => x !== country).slice(0, 7)).sort((a, b) => teamOvr(b) - teamOvr(a));
  const gA = [ field[0], field[3], field[4], field[7] ], gB = [ field[1], field[2], field[5], field[6] ];
  const ra = rr(gA), rb = rr(gB), rds = ra.map((r, i) => r.concat(rb[i] || []));
  newLeague('world', { yr: C.yr, nm: 'GROUPS + MEDAL ROUND', teams: field, rounds: rds, groups: [ gA, gB ], poNames: [ 'SEMIFINAL', 'GOLD MEDAL GAME' ] });
  C.L.wkName = 'GROUP GAME';
  C.stage = 'world';
  save(); return true;
 }
 function worldDone() {
  if (C.stage !== 'world' || C.L.phase !== 'done') return false;
  const L = C.L; endLevelSeason(finText(L));
  C.world.fin = finText(L);
  finishCareer(); return true;
 }
 // the career ends after the World Games: the final CAREER card (stamped with the difficulty played) goes to the locker
 // (an old save that was mid-way through the old Ultimate stage finishes here too)
 function finishCareer() {
  const pro = C.world && C.world.pro || (C.pro && C.pro.team) || C.team;
  if (C.L && C.L.lvl === 'ult') { if (!C.seasons.some(x => x.lvl === 'ult' && x.yr === C.L.yr) && C.L.st && C.L.st.gp) endLevelSeason('CAREER COMPLETE'); }
  C.team = pro; C.stage = 'done'; C.card = 'final'; C.cardUp = { from: C.lvl === 'ult' ? 'world' : 'world', to: 'final', ft: C.world ? C.world.team : pro };
  const fc = finalCard();
  C.final = fc;
  const h = hall(); if (!h.some(x => x && x.id === fc.id)) { h.unshift(fc); LS.set(HKEY, h.slice(0, 40)); }
  try { C.final.pid = cardGrant(fc); } catch (e) { console.error(e); }
  logE('CAREER COMPLETE: ' + fc.title);
  save(); return true;
 }
 const startUlt = () => false;
 function ultDone() { if (!C || (C.stage !== 'ult' && C.stage !== 'worldEnd')) return false; finishCareer(); return true; }
 function finalCard() {
  const d = C.diff | 0, tot = totals();
  const title = DIFFN(d) + ' CAREER';
  const gold = !!(C.world && C.world.fin === 'WORLD GOLD');
  // CAREER rarity follows the difficulty: SQUID lowest ... BAGGATWAAN is the rarest (tier 2 + difficulty: 2..7)
  return { id: C.id, n: C.me.n, num: C.me.num, pos: C.me.pos, skin: C.me.skin, ovr: ovrMe(), diff: d, ctl: C.ctl, title: title, tier: 2 + d, titles: C.titles.map(t => t.nm + ' ' + t.yr), tot: tot, team: C.world && C.world.pro || C.team, from: fromOf(), dad: dadOf(), mom: momOf(), fromT: fromText(fromOf(), dadOf(), momOf()), r: C.me.r.slice(), at: Date.now(), gold: gold };
 }

 // ---------- finished career cards = real locker cards (V22), rarity CAREER ----------
 // Each finished career registers one real player (CR59-<career id>) with his final ratings. He is a normal V22 card:
 // he shows in the locker under his own CAREER section, subs into lineups like any card, and the game's own systems
 // build his ULTIMATE (U_), ALL-AMERICAN (AA25-) and BAGGATWAAN (TW25-) versions from him the same way as every card.
 // Online: the other phone has no copy of him, so career cards sit out online games (swapped for a normal player).
 const CKEY = 'car459cards', CPFX = 'CR59-';
 const cards = () => { const o = LS.get(CKEY, null); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; };
 const isCard = id => typeof id === 'string' && id.indexOf(CPFX) >= 0;
 function regCard(cid, e) {
  const id = CPFX + cid;
  if (PLAYERS[id] && PLAYERS[id].cr59) return PLAYERS[id];
  const p = { id: id, n: e.n, n0: e.n, pos: POSL.includes(e.pos) ? e.pos : 'M', r: {}, real: false, team: e.team || 'ATL', wnum: e.num, skin: e.skin | 0, cr59: 1, cr59d: e.diff | 0, cr59t: e.title || '' };
  SK().forEach((k, i) => p.r[k] = e.r && e.r[i] != null ? e.r[i] : 60);
  p.ovr = ovrCalc(p);
  PLAYERS[id] = p;
  return p;
 }
 function regCards() { const o = cards(); for (const cid in o) if (cid !== '__mig') try { regCard(cid, o[cid]); } catch (e) { console.error(e); } }
 function cardGrant(fc) {
  const o = cards();
  if (!o[fc.id]) { o[fc.id] = { n: fc.n, num: fc.num, pos: fc.pos, skin: fc.skin, r: fc.r, team: fc.team, diff: fc.diff, title: fc.title, at: fc.at || Date.now(), titles: (fc.titles || []).slice(), from: fc.from || null, fromT: fc.fromT || '', tot: fc.tot ? { w: fc.tot.w | 0, l: fc.tot.l | 0, gp: fc.tot.gp | 0 } : null, won: [], uv: {} }; LS.set(CKEY, o); }
  regCard(fc.id, o[fc.id]);
  const id = CPFX + fc.id;
  try { if (window.V22 && V22.on() && !(V22.owned && V22.owned(id))) V22.grantIds([ id ], o[fc.id].team, 'CAREER'); } catch (e) { console.error(e); }
  return id;
 }
 // old finished careers (rl_car459h, made before career cards were real cards) are added to the locker once
 function cardsMigrate() {
  try {
   const o = cards(); if (o.__mig) return;
   const h = hall();
   for (const fc of h.slice().reverse()) if (fc && fc.id && Array.isArray(fc.r) && !o[fc.id]) { const d = fc.diff | 0; o[fc.id] = { n: fc.n, num: fc.num, pos: fc.pos, skin: fc.skin, r: fc.r, team: fc.team, diff: d, title: DIFFN(d) + ' CAREER', at: fc.at || Date.now(), old: 1, titles: (fc.titles || []).slice(), won: [], uv: {} }; }
   o.__mig = Date.now(); LS.set(CKEY, o);
   for (const cid in o) if (cid !== '__mig' && o[cid].old && !o[cid].granted) { regCard(cid, o[cid]); try { if (window.V22 && V22.on()) V22.grantIds([ CPFX + cid ], o[cid].team, 'CAREER'); } catch (e) {} o[cid].granted = 1; }
   LS.set(CKEY, o);
  } catch (e) { console.error(e); }
 }
 function totals() { const t = blank(); for (const s of C.seasons) for (const k in t) t[k] += s[k] || 0; if (C.L && !C.seasons.some(s => s.lvl === C.L.lvl && s.yr === C.L.yr)) for (const k in t) t[k] += C.L.st[k] || 0; return t; }

 // ---------- a real game with your player on the field ----------
 // the two teams are registered for the length of the game only (SZ_REG ids C459U / C459O, built from the real teams)
 const GT = {};
 function teamFor(slot, id) {
  const base = tobj(id), t = Object.assign({}, base, { id: slot, szBase: hsTeam(id) ? undefined : base.id, roster: rosterOf(id).filter(x => P(x)), car459: id });
  if (!t.szBase) delete t.szBase;
  // jersey numbers: yours, the generated players', and the real players' own numbers for the snapshot copies
  t.nums = {};
  for (const x of t.roster) {
   const p = P(x); if (!p) continue;
   let n = x === ME ? C.me.num : p.wnum;
   if (n == null && p.c459b) try { n = jerseyNo(P(p.c459b), 'real', base.id); } catch (e) {}
   if (n == null && base.nums && base.nums[x] != null) n = base.nums[x];
   if (n != null && n !== '') t.nums[x] = n;
  }
  return t;
 }
 function regGame(a, b) { GT.u = teamFor('C459U', a); GT.o = teamFor('C459O', b); SZ_REG.C459U = GT.u; SZ_REG.C459O = GT.o; }
 function unregGame() { try { if (SZ_REG.C459U && SZ_REG.C459U.car459) delete SZ_REG.C459U; if (SZ_REG.C459O && SZ_REG.C459O.car459) delete SZ_REG.C459O; } catch (e) {} }
 function play() {
  const L = C.L, nx = myGame(L); if (!nx || nx.bye) return false;
  regGame(L.team, nx.opp);
  try { localStorage.removeItem('rl_lu_C459U'); localStorage.removeItem('rl_lu_C459O'); } catch (e) {}
  const meta = { label: LVN[C.lvl] + ' - ' + nx.label, night: R() < .3, car459: { id: C.id, lvl: C.lvl, opp: nx.opp, label: nx.label } };
  newGame('C459U', 'C459O', 'career', nx.home, meta);
  const G = game; if (!G) return false;
  G.car459 = { id: C.id, ctl: 'team', opp: nx.opp, real: L.team };
  G.lu = [ forceIn(G.lu[0], C.me.pos), G.lu[1] ];
  try { const V = V14(G), lu0 = G.lu[0]; V.lu0 = [ ...lu0.A, ...lu0.M, ...lu0.D, lu0.LSM, lu0.SSDM, lu0.SSDM2, lu0.FO, lu0.G ].filter(Boolean); V.uids = null; } catch (e) {}
  G.lk2503 = C.diff | 0; try { applyDiff(); } catch (e) {} G.diff = C.diff | 0;
  BOOST = null;
  save();
  return true;
 }
 // what the engine counted for you this game (falls back to the scorer list when the box score is off)
 function boxOf(G) {
  const b = {};
  try { const V = V14(G); Object.assign(b, V.box && V.box[ME] || {}); } catch (e) {}
  if (!Object.keys(b).length) { b.g = (G.scorers || []).filter(s => s && (s.id === ME || s.pid === ME || (s.pl && s.pl.id === ME))).length; }
  return b;
 }
 function gameOver(G) {
  if (!G || !G.car459 || G.car459.done || !C || G.car459.id !== C.id) return null;
  G.car459.done = true;
  return record(G.score[0], G.score[1], boxOf(G), true);
 }

 // ---------- the card ----------
 const CARD = {
  hs: { nm: 'HIGH SCHOOL', rar: 'COMMON', c: '#9aa3ab', bg: 'linear-gradient(#3a4148,#1b1f23)' },
  col: { nm: 'COLLEGE', rar: 'RARE', c: '#3d8bff', bg: 'linear-gradient(#173a6a,#0b1a30)' },
  pro: { nm: 'PRO', rar: 'EPIC', c: '#c77dff', bg: 'linear-gradient(#3e1d5c,#170a24)' },
  world: { nm: 'WORLD', rar: 'LEGENDARY', c: '#ffcc33', bg: 'linear-gradient(#6a4e0c,#2a1d04)' },
  ult: { nm: 'FINAL', rar: 'FINAL', c: '#ff5ad2', bg: 'linear-gradient(#5a0c4a,#1a0416)' },
  final: { nm: 'CAREER', rar: 'CAREER', c: '#3dffc8', bg: 'linear-gradient(135deg,#06302c,#0d6b5e 45%,#041a17)' }
 };

 // ---------- versions: what is on a career card (titles, awards) - each new version earns its own Ultimate copy ----------
 const cidOf = id => { const s = String(id || ''), i = s.indexOf(CPFX); if (i < 0) return null; return s.slice(i + CPFX.length).replace(/~\d+$/, ''); };
 function setCard(cid, fn) { const o = cards(); if (!o[cid]) return null; const r = fn(o[cid]); LS.set(CKEY, o); return r; }
 // titles won WITH the career card in the normal modes (season, college, world games...), recorded from the title-card hand-out
 const NOTITLE = /^(CAREER|ULTIMATE|USAGOLD|TRADE|TEST|.*PACK$|.*DROP$|ULTIMATE CARD)/;
 function noteTitle(ids, tid, why, key) {
  if (!Array.isArray(ids) || !why || NOTITLE.test(String(why))) return;
  const got = [ ...new Set(ids.map(cidOf).filter(Boolean)) ]; if (!got.length) return;
  let tn = ''; try { tn = T(tid).name; } catch (e) {}
  for (const cid of got) setCard(cid, e => { e.won = Array.isArray(e.won) ? e.won : []; const k = String(key || why + '|' + tid + '|' + new Date().toDateString()); if (!e.won.some(w => w.k === k)) e.won.push({ k: k, w: String(why), t: tn, at: Date.now() }); });
 }
 function awardsOf(cid) { const a = []; try { if (window.V22 && V22.owned('AA25-' + CPFX + cid)) a.push('ALL-AMERICAN'); if (V22.owned('TW25-' + CPFX + cid)) a.push(window.N31 && N31.sub ? N31.sub('BAGGATWAAN') : 'BAGGATWAAN'); } catch (e) {} return a; }
 function titleList(cid) { const e = cards()[cid]; if (!e) return []; const WN = { 'SEASON': 'SEASON CHAMPS', 'ONLINE SEASON': 'ONLINE SEASON CHAMPS', 'WORLD GAMES': 'WORLD GAMES GOLD', 'COLLEGE NATTY': 'NATIONAL CHAMPS', 'NATTY': 'NATIONAL CHAMPS' }; return (e.titles || []).concat((e.won || []).map(w => (WN[w.w] || w.w) + (w.t ? ' (' + w.t + ')' : ''))); }
 function verOf(src) {
  const cid = cidOf(src), e = cards()[cid]; if (!e) return null;
  const p = P(src), parts = [ cid, src.replace(/~\d+$/, ''), titleList(cid).join(','), awardsOf(cid).join(','), e.diff | 0, p ? p.ovr : 0 ];
  let h = 5381; const str = parts.join('|'); for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36).slice(0, 6);
 }
 // a new version's Ultimate copy: U_<card>~<n>, the game's own Ultimate player (+5 every rating) with this version's list on it
 function regVer(vid, v) {
  if (PLAYERS[vid]) return PLAYERS[vid];
  const b = window.ULT331 && ULT331.make ? ULT331.make('U_' + v.src) : null; if (!b) return null;
  const q = Object.assign({}, b, { id: vid, cr59v: v.n, cr59vl: v.list || [] });
  PLAYERS[vid] = q; return q;
 }
 function regVers() { const o = cards(); for (const cid in o) if (cid !== '__mig' && o[cid].uv) for (const vid in o[cid].uv) try { regVer(vid, o[cid].uv[vid]); } catch (e) { console.error(e); } }
 const verInfo = id => { const cid = cidOf(id), e = cid && cards()[cid]; return e && e.uv ? e.uv[id] || null : null; };
 function ultHook() {
  const V = window.V331; if (!V || typeof V.ultPrize !== 'function' || V.ultPrize.__car459) return;
  const up = V.ultPrize;
  const f = function (U, R, sell, newOnly) {
   const plan = [];
   try {
    if (!OFF() && window.ULT331 && ULT331.on() && V.ultSources) for (const src of V.ultSources(U)) {
     if (!isCard(src) || /~\d+$/.test(src)) continue;
     const cid = cidOf(src), e = cards()[cid]; if (!e) continue;
     const h = verOf(src), uv = e.uv || {}, mine = Object.keys(uv).filter(k => uv[k].src === src);
     const have = mine.find(k => uv[k].h === h && V22.owned(k));
     plan.push({ src: src, cid: cid, h: h, mine: mine, have: have, first: !mine.length && !V22.owned('U_' + src) });
    }
   } catch (e) { console.error(e); }
   const r = up.apply(this, arguments);
   try {
    for (const x of plan) {
     const list = titleList(x.cid).concat(awardsOf(x.cid)), base = 'U_' + x.src;
     if (x.first) { if (V22.owned(base)) setCard(x.cid, e => { e.uv = e.uv || {}; e.uv[base] = { src: x.src, n: 1, h: x.h, list: list, at: Date.now() }; }); continue; }
     if (x.have) continue; // same version again: the game already sold it as a duplicate
     if (!x.mine.length && V22.owned(base)) { // an Ultimate copy from before versions existed counts as version 1
      setCard(x.cid, e => { e.uv = e.uv || {}; if (!e.uv[base]) e.uv[base] = { src: x.src, n: 1, h: 'old', list: [], at: Date.now() }; });
     }
     // a new version: undo the duplicate sale and hand out a separate Ultimate copy of this version
     const n = Object.keys(cards()[x.cid].uv || {}).filter(k => cards()[x.cid].uv[k].src === x.src).length + 1, vid = base + '~' + n, v = { src: x.src, n: n, h: x.h, list: list, at: Date.now() };
     setCard(x.cid, e => { e.uv = e.uv || {}; e.uv[vid] = v; });
     if (!regVer(vid, v)) continue;
     if (R && Array.isArray(R.ult)) { const i = R.ult.findIndex(u => u && u.pid === base && u.dup); if (i >= 0) { R.ult.splice(i, 1); try { R.ultC -= sell(V22.rarOf(base)); } catch (e) {} } }
     V22.grantIds([ vid ], (P(x.src) && P(x.src).team) || U.team, 'ULTIMATE CARD');
     if (R && Array.isArray(R.ult)) R.ult.push({ pid: vid });
    }
   } catch (e) { console.error(e); }
   return r;
  };
  for (const k of Object.keys(up)) f[k] = up[k];
  f.__car459 = 1; V.ultPrize = f;
 }

 // ---------- the locker: career cards get their own CAREER section, label and look ----------
 const CC = '#3dffc8';
 const onl = () => { try { return (typeof screen === 'string' && /^on[A-Z]/.test(screen)) || !!(typeof game !== 'undefined' && game && !game.over && (game.online || (game.meta && game.meta.online))) || !!(window.RLNET && RLNET.lobby && typeof screen === 'string' && screen !== 'menu' && /lobby|lineup/i.test(screen) && PS && PS.luBack === 'onLobby'); } catch (e) { return false; } };
 const luHas = lu => { try { return !!lu && [ ...(lu.A || []), ...(lu.M || []), ...(lu.D || []), lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ].some(isCard); } catch (e) { return false; } };
 function cardTag(pid, h) {
  if (h.indexOf('cr59') >= 0) return h;
  const base = pid.indexOf(CPFX) === 0, p = P(pid);
  h = h.replace('class="c17 ', 'class="c17 cr59 ');
  h = h.replace(/<div class="rr">[A-Z]+ - /, '<div class="rr">CAREER - ').replace(/(aria-label="[^"]*? - )(COMMON|RARE|LEGENDARY)( )/, '$1CAREER$3');
  const k = h.lastIndexOf('</div>');
  const v = verInfo(pid);
  return k > 0 ? h.slice(0, k) + '<div class="cr59t">CAREER' + (v ? ' V' + v.n : '') + (p && p.cr59d != null ? ' - ' + E9(DIFFN(p.cr59d)) : '') + '</div></div>' : h;
 }
 const E9 = x => (typeof esc === 'function' ? esc(x) : String(x));
 function lockerHtml(h) {
  if (typeof document === 'undefined' || !window.V22) return h;
  const tp = document.createElement('template'); tp.innerHTML = h;
  const ids = [];
  tp.content.querySelectorAll('.c17[data-pid]').forEach(el => {
   const id = el.getAttribute('data-pid'); if (!isCard(id)) return;
   const sec = el.closest('.sec17'); if (!ids.includes(id)) ids.push(id); el.remove();
   if (sec) { const sp = sec.querySelector('.sh17 span'); if (sp) sp.textContent = sp.textContent.replace(/^(\d+)/, m => String(Math.max(0, +m - 1))); const g = sec.querySelector('.grid17'); if (g && !g.querySelector('.c17') && !g.textContent.trim()) g.innerHTML = '<div class="note">NONE YET</div>'; }
  });
  // career cards the inner list did not show (e.g. a filtered tab) are not added; only the ones it listed move here
  const show = ids;
  // BAGGATWAAN careers first (rarity follows the difficulty), the base card before its versions, then OVR
  const dOf = id => { const q = P(id); return q && q.cr59d != null ? q.cr59d : 0; };
  show.sort((a, b) => dOf(b) - dOf(a) || (a.indexOf(CPFX) === 0 ? 0 : 1) - (b.indexOf(CPFX) === 0 ? 0 : 1) || (P(b) ? P(b).ovr : 0) - (P(a) ? P(a).ovr : 0));
  const body = show.length ? show.map(id => V22.cardHtml22(id)).join('') : '<div class="note">NONE YET - FINISH A CAREER (PLAY > CAREER) AND YOUR CAREER CARD LANDS HERE. CAREER CARDS NEVER COME FROM PACKS.</div>';
  const sec = document.createElement('div'); sec.className = 'sec17 row22 cr59sec';
  sec.innerHTML = '<div class="sh17" style="color:' + CC + '">CAREER <span>' + show.length + ' OWNED</span></div><div class="grid17">' + body + '</div>';
  const first = tp.content.querySelector('.sec17.row22');
  if (first) first.parentNode.insertBefore(sec, first); else tp.content.appendChild(sec);
  return tp.innerHTML;
 }
 function popFix(h) {
  const m = /data-pid="([^"]+)"/.exec(h); if (!m || !isCard(m[1])) return h;
  const pid = m[1], p = P(pid), base = pid.indexOf(CPFX) === 0, o = cards()[cidOf(pid)] || {};
  { const k0 = h.indexOf('<div class="c17 '); if (k0 >= 0) { const k1 = h.indexOf('<div class="pi17"', k0); if (k1 > k0) h = h.slice(0, k0) + cardTag(pid, h.slice(k0, k1)) + h.slice(k1); } }
  h = h.replace(/<b>(COMMON|RARE|LEGENDARY)<\/b> PLAYER CARD/, '<b style="color:' + CC + '">CAREER</b> PLAYER CARD');
  if (base) h = h.replace(/(<div class="pt17" style="color:)[^"]*(")/, '$1' + CC + '$2');
  h = h.replace(/<span><b>FROM:<\/b>[\s\S]*?<\/span>/, '<span><b>FROM:</b> ' + E9((o.title || (p && p.cr59t) || 'CAREER') + ' - YOUR CAREER MODE PLAYER') + (o.at ? ' - ' + new Date(o.at).toLocaleDateString() : '') + '</span>');
  // no heritage on the card (Charlie: "no mom dad stuff on there"): that room shows his career record instead
  { const tt = o.tot || ((hall().find(x => x && x.id === cidOf(pid)) || {}).tot); if (tt && (tt.w | 0) + (tt.l | 0) > 0) h = h.replace(/(<span><b>FROM:<\/b>[\s\S]*?<\/span>)/, '$1<span><b>CAREER RECORD:</b> ' + (tt.w | 0) + '-' + (tt.l | 0) + (tt.gp ? ' IN ' + (tt.gp | 0) + ' GAMES' : '') + '</span>'); }
  const v = verInfo(pid), list = v ? v.list || [] : titleList(cidOf(pid)).concat(awardsOf(cidOf(pid)));
  h = h.replace(/(<span><b>FROM:<\/b>[\s\S]*?<\/span>)/, '$1<span><b>' + (v ? 'VERSION ' + v.n + ' - ' : '') + 'TITLES + AWARDS:</b> ' + E9(list.length ? list.join(', ') : 'NONE YET') + '</span>');
  h = h.split(E9(V22.CARDLINE || '')).join('CAREER CARD: USE HIM IN QUICK PLAY, CARD TEAMS AND ULTIMATE. CAREER CARDS SIT OUT ONLINE GAMES.');
  h = h.replace('<span><b>FROM:</b> ', '<span><b>CARD:</b> '); // "FROM" read like where he is from; it is where the card came from
  return h;
 }
 function v22hooks() {
  if (!window.V22 || V22.__car459) return; V22.__car459 = 1;
  try {
   const st = document.createElement('style'); st.id = 'car459cards';
   st.textContent = '#panel .c17.cr59[data-pid^="CR59-"]{border-color:' + CC + ';background:linear-gradient(135deg,#06302c,#0d6b5e 45%,#041a17);box-shadow:0 2px 0 #000,0 0 7px ' + CC + '}' +
    '#panel .c17.cr59[data-pid^="CR59-"]::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.35) 48%,rgba(61,255,200,.3) 52%,transparent 60%);animation:foil17 2.6s linear infinite;pointer-events:none}' +
    '#panel .c17.cr59[data-pid^="CR59-"] .rr{color:' + CC + '}' +
    '#panel .c17.cr59 .cr59t{position:absolute;left:0;right:0;top:0;font-size:5px;line-height:7px;text-align:center;letter-spacing:.5px;color:#03241f;background:' + CC + ';z-index:2;white-space:nowrap;overflow:hidden}' +
    '#panel .cr59sec .sh17{text-shadow:0 0 4px rgba(61,255,200,.5)}';
   document.head.appendChild(st);
  } catch (e) {}
  if (typeof V22.playersHtml === 'function') { const ph = V22.playersHtml; V22.playersHtml = function () { const h = ph.apply(this, arguments); try { return OFF() ? h : lockerHtml(h); } catch (e) { console.error(e); return h; } }; }
  if (typeof V22.cardHtml22 === 'function') { const ch = V22.cardHtml22; V22.cardHtml22 = function (pid) { const h = ch.apply(this, arguments); try { return isCard(pid) && !OFF() ? cardTag(pid, h) : h; } catch (e) { return h; } }; }
  if (typeof V22.popHtml === 'function') { const ph2 = V22.popHtml; V22.popHtml = function () { const h = ph2.apply(this, arguments); try { return h && h.indexOf(CPFX) >= 0 ? popFix(h) : h; } catch (e) { return h; } }; }
  // online: the other phone has no copy of a career player, so career cards sit out online games
  if (typeof V22.subExtra === 'function') { const se = V22.subExtra; V22.subExtra = function () { const r = se.apply(this, arguments); try { return Array.isArray(r) && onl() ? r.filter(id => !isCard(id)) : r; } catch (e) { return r; } }; }
  if (typeof V22.fixGame === 'function') { const fg = V22.fixGame; V22.fixGame = function (G) { const r = fg.apply(this, arguments); try { if (G && G.lu && (G.online || (G.meta && G.meta.online))) for (let i = 0; i < 2; i++) if (luHas(G.lu[i])) G.lu[i] = V22.strip(G.lu[i], teamRosterIds(i ? G.opp : G.user, G.src), isCard); } catch (e) { console.error(e); } return r; }; }
  if (typeof window.lineupFor === 'function') { const lf = window.lineupFor; window.lineupFor = function (teamId, src) { const lu = lf.apply(this, arguments); try { if (luHas(lu) && onl()) return V22.strip(lu, teamRosterIds(teamId, src || 'real'), isCard); } catch (e) { console.error(e); } return lu; }; }
  if (typeof V22.flipSplit === 'function') { const fs = V22.flipSplit; V22.flipSplit = function (ids, tid, why, key) { try { if (!OFF() && Array.isArray(ids) && ids.some(isCard)) noteTitle(ids, tid, why, key); } catch (e) {} return fs.apply(this, arguments); }; }
  try { ultHook(); } catch (e) { console.error(e); }
  // season titles go through V22.titleCheck (its own inner flip), so a career card on the title roster is noted here
  if (typeof V22.titleCheck === 'function') { const tc = V22.titleCheck; const f = function (Sz, w) { try { if (!OFF() && Sz && Sz.phase === 'done' && Sz.champ && Sz.champ === Sz.team && Sz.rosters && Array.isArray(Sz.rosters[Sz.team]) && Sz.rosters[Sz.team].some(isCard)) noteTitle(Sz.rosters[Sz.team], Sz.team, Sz.online ? 'ONLINE SEASON' : 'SEASON', V22.szKey34 ? V22.szKey34(Sz) : null); } catch (e) {} return tc.apply(this, arguments); }; for (const k of Object.keys(tc)) f[k] = tc[k]; V22.titleCheck = f; }
  // a career title flip that finishes takes you back to your career
  if (typeof V22.flipDone === 'function') { const fd = V22.flipDone; V22.flipDone = function (key) { const r = fd.apply(this, arguments); try { if (r && String(key).indexOf(FLIPK) === 0 && window.CAR459 && CAR459.onFlipDone) CAR459.onFlipDone(key); } catch (e) { console.error(e); } return r; }; }
 }
 try { regCards(); } catch (e) { console.error(e); }
 try { v22hooks(); } catch (e) { console.error(e); }
 try { cardsMigrate(); } catch (e) { console.error(e); }
 try { regVers(); } catch (e) { console.error(e); }
 // the game's own systems build a card's Ultimate / All-American / Baggatwaan version from its base player: make sure those exist now
 try { if (window.HON25 && HON25.ensureOwned) HON25.ensureOwned(); if (window.ULT331 && ULT331.ensureOwned) ULT331.ensureOwned(); } catch (e) { console.error(e); }
 window.CAR459 = {
  on: true, OFF: OFF, ME: ME, KEY: KEY, LKEY: LKEY, POSL: POSL, LV: LV, LVN: LVN, CARD: CARD, KEYS: KEYS,
  get: () => load(), has: () => !!load(), save: save, clear: clear, hall: hall, regMe: regMe, regAll: regAll,
  create: create, startRatings: startRatings, ovrMe: ovrMe, DIFFN: DIFFN, xpNeed: xpNeed, totals: totals,
  myGame: () => myGame(), simMine: simMine, simSeason: simSeason, simRest: () => { simRest(C.L); save(); }, simRound: () => { simRound(C.L); save(); }, stand: (ids) => stand(C.L, ids), teamOvr: teamOvr, myRoster: myRoster, rosterOf: rosterOf,
  tobj: tobj, tname: tname, tabbr: tabbr, hsObj: hsObj, hsTeam: hsTeam,
  hsDone: hsDone, sign: sign, colDone: colDone, colReturn: colReturn, projPick: projPick, runDraft: runDraft, draftSeen: draftSeen,
  proDone: proDone, faOffers: faOffers, contract: contract, nextPro: nextPro, callup: callup, countryOffers: countryOffers, worldDone: worldDone, startUlt: startUlt, ultDone: ultDone,
  finalCard: finalCard, finishCareer: finishCareer, flipPending: flipPending, realIds: realIds, titleCards: titleCards, countries: countries, fromOf: fromOf, dadOf: dadOf, momOf: momOf, fromOk: fromOk, setFrom: setFrom, heritage: heritage, fromText: fromText, needOf: needOf, endCareer: endCareer, topCountry: topCountry, wgChance: wgChance, renameHS: renameHS,
  cards: cards, cardGrant: cardGrant, verOf: verOf, titleList: titleList, awardsOf: awardsOf, verInfo: verInfo, cidOf: cidOf, regCard: regCard, isCard: isCard, CPFX: CPFX, FLIPK: FLIPK, onFlipDone: null,
  play: play, gameOver: gameOver, unregGame: unregGame, withL: withL, finText: finText, titleName: titleName, regGameTeams: regGame
 };
 try { load(); } catch (e) { console.error(e); }
})();
