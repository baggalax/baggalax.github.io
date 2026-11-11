/* v494vcards: VETERANS CARDS (Bagga Lax 1.2, Veterans Day).
   Charlie (Nov 10 2026): "For veterans cards only have 3 in the game ... you get them after you play with the team once.
   Card starts at lowest military rank and as you play with that card in a team using it it goes up a rank every win."
   "Make them very military esc names like swamp fox" ; "Overalls should be completely random from 70s-95 ... gives reason
   to trade" ; "you could have a 70 overall airforce card and trade it for the same card that's a 95".
   - 18 cards, 3 per branch team of v489vets (VTARM VTNAV VTAF VTMAR VTCG VTSF). Original call-sign names (no real people).
   - Earned: finish ONE match (any result) playing AS that branch team, offline. Each card once per device, never again.
   - Overall: rolled 70-95 when the card is earned (each copy its own roll); ratings are spread to match and stored
     WITH the card record (rl_v22 cards[pid]: o494 r494 rk494 b494), so the roll and the rank travel in a trade.
   - Each copy has its own card id 'VC494-<base>-<5 chars>' so a 70 G-BIV can be traded for someone else's 95 G-BIV
     through the existing trade screen (server tr24 accepts any [A-Za-z0-9_-] card id and copies the full card record).
   - Rank: starts at the branch's lowest enlisted rank; every WIN of an offline match with the card in YOUR lineup
     promotes it one rank (top of the ladder is the cap). "PROMOTED!" popup after the win. Ratings do not change.
   - Online: VETERANS cards are left out of online lineups (other phones would not know this copy's ratings).
   - Shown in the normal locker CARDS collection, in their rarity row (the game's own tiers from the rolled overall:
     LEGENDARY 88+, RARE 78-87, COMMON under 78 = V22.RAR22), with a GREEN frame done exactly like the Ghosts' purple one
     (Charlie Nov 10 1:16 PM: "There card frame should be green" / "Same as ghost they are purple"), a small red/white/blue
     VETERANS strip and the rank line.
   v499 (Nov 10 2:25 PM "make them show from start"): the 3 call-sign players are on their branch's roster from the start
     for everyone (fixed roster players <TEAM>-20/21/22, see below); the card is still earned only by playing.
   New save key: rl_vc494 (earned teams + a backup of every copy this device held). Other ids, rl_* keys, __rl_* flags
   and the net protocol are unchanged. Kill switch: window.__rl_no494vc = true (set before this file loads). */
(function() {
 'use strict';
 const off = () => !!(window.__rl_no494vc || window.__rl_v124gb);
 if (off() || window.VC494 || typeof PLAYERS === 'undefined' || !window.V22 || !window.V17 || !window.VETS489 || !VETS489.ids || !VETS489.ids.length) return;
 const V = window.VC494 = { log: [], err: [] };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { V.err.push(w + ': ' + String(e && e.message || e)); try { console.warn('v494', w, e); } catch (x) {} };
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
 const PFX = 'VC494-';
 const isVC = id => typeof id === 'string' && id.indexOf(PFX) === 0;
 V.isVC = isVC;

 // ---------- the 18 cards (b = base card, n = call sign, pos, skin = SKIN index (0 light .. 5 deep), num) ----------
 const CARDS = {
  VTARM: [ { b: 'ARM0', n: 'IRON WOLF', pos: 'A', skin: 2, num: 8 }, { b: 'ARM1', n: 'SWAMP FOX', pos: 'M', skin: 1, num: 17 }, { b: 'ARM2', n: 'GRIZZLY', pos: 'D', skin: 4, num: 45 } ],
  VTNAV: [ { b: 'NAV0', n: 'TRIDENT', pos: 'A', skin: 0, num: 3 }, { b: 'NAV1', n: 'DEPTH CHARGE', pos: 'FO', skin: 3, num: 21 }, { b: 'NAV2', n: 'HARPOON', pos: 'D', skin: 1, num: 38 } ],
  VTAF: [ { b: 'AF0', n: 'JETSTREAM', pos: 'A', skin: 3, num: 16 }, { b: 'AF1', n: 'WILD BLUE', pos: 'M', skin: 2, num: 24 }, { b: 'AF2', n: 'G-BIV', pos: 'D', skin: 0, num: 7 } ],
  VTMAR: [ { b: 'MAR0', n: 'DEVIL DOG', pos: 'A', skin: 5, num: 1 }, { b: 'MAR1', n: 'LEATHERNECK', pos: 'M', skin: 0, num: 13 }, { b: 'MAR2', n: 'WARHORSE', pos: 'LSM', skin: 2, num: 36 } ],
  VTCG: [ { b: 'CG0', n: 'HIGH TIDE', pos: 'A', skin: 1, num: 9 }, { b: 'CG1', n: 'LIFELINE', pos: 'M', skin: 4, num: 20 }, { b: 'CG2', n: 'SEAWALL', pos: 'G', skin: 0, num: 30 } ],
  VTSF: [ { b: 'SF0', n: 'STARDUST', pos: 'A', skin: 0, num: 11 }, { b: 'SF1', n: 'ORBIT', pos: 'M', skin: 3, num: 27 }, { b: 'SF2', n: 'BLACK HOLE', pos: 'G', skin: 1, num: 0 } ]
 };
 // ---------- rank ladders: real enlisted rank titles, lowest first ----------
 const ARMY = [ 'PRIVATE', 'PRIVATE FIRST CLASS', 'SPECIALIST', 'CORPORAL', 'SERGEANT', 'STAFF SERGEANT', 'SERGEANT FIRST CLASS', 'MASTER SERGEANT', 'SERGEANT MAJOR' ];
 const SEA = [ 'SEAMAN RECRUIT', 'SEAMAN APPRENTICE', 'SEAMAN', 'PETTY OFFICER 3RD CLASS', 'PETTY OFFICER 2ND CLASS', 'PETTY OFFICER 1ST CLASS', 'CHIEF PETTY OFFICER', 'SENIOR CHIEF PETTY OFFICER', 'MASTER CHIEF PETTY OFFICER' ];
 const LAD = {
  VTARM: ARMY,
  VTMAR: [ 'PRIVATE', 'PRIVATE FIRST CLASS', 'LANCE CORPORAL', 'CORPORAL', 'SERGEANT', 'STAFF SERGEANT', 'GUNNERY SERGEANT', 'MASTER SERGEANT', 'SERGEANT MAJOR' ],
  VTNAV: SEA, VTCG: SEA,
  VTAF: [ 'AIRMAN BASIC', 'AIRMAN', 'AIRMAN FIRST CLASS', 'SENIOR AIRMAN', 'STAFF SERGEANT', 'TECHNICAL SERGEANT', 'MASTER SERGEANT', 'SENIOR MASTER SERGEANT', 'CHIEF MASTER SERGEANT' ],
  VTSF: [ 'SPECIALIST 1', 'SPECIALIST 2', 'SPECIALIST 3', 'SPECIALIST 4', 'SERGEANT', 'TECHNICAL SERGEANT', 'MASTER SERGEANT', 'SENIOR MASTER SERGEANT', 'CHIEF MASTER SERGEANT' ]
 };
 const OMIN = 70, OMAX = 95;
 const BASE = {};
 for (const t in CARDS) for (const c of CARDS[t]) BASE[c.b] = Object.assign({ t: t }, c);
 V.CARDS = CARDS; V.LAD = LAD; V.BASE = BASE;
 const baseOf = pid => { const m = /^VC494-([A-Z]+[0-9])/.exec(String(pid || '')); return m ? BASE[m[1]] : null; };
 const ladder = t => LAD[t] || ARMY;
 const rankName = (t, rk) => { const L = ladder(t); return L[Math.max(0, Math.min(L.length - 1, rk | 0))]; };
 V.rankName = rankName;

 // ---------- save (rl_vc494) ----------
 let S = null;
 try { S = LS.get('vc494', null); } catch (e) {}
 if (!S || typeof S !== 'object') S = {};
 if (!S.earn || typeof S.earn !== 'object') S.earn = {};
 if (!S.own || typeof S.own !== 'object') S.own = {};
 if (!Array.isArray(S.q)) S.q = [];
 const save = () => { try { LS.set('vc494', S); } catch (e) { fail('save', e); } };
 V.st = () => S;
 const C22 = () => { const s = V22.st(); if (!s.cards || typeof s.cards !== 'object') s.cards = {}; return s.cards; };

 // ---------- random roll ----------
 const rnd = () => { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; } catch (e) { return Math.random(); } };
 const rid = () => { const A = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < 5; i++) s += A[Math.floor(rnd() * A.length)]; return s; };
 const KEYS = { A: [ 'fin', 'acc', 'stk', 'str', 'pow', 'spd' ], M: [ 'pow', 'acc', 'spd', 'stk', 'str', 'fin', 'def' ], FO: [ 'fo', 'gb', 'spd', 'str' ], D: [ 'def', 'str', 'gb', 'spd' ], LSM: [ 'def', 'gb', 'spd', 'str', 'stk' ], G: [ 'sav', 'stk', 'gb' ] };
 const ovr0 = p => { try { return typeof ovrOf === 'function' ? ovrOf(p) : 0; } catch (e) { return 0; } };
 function roll(pos, target) {
  const main = KEYS[pos] || KEYS.M, r = {};
  for (const k of SKILLS) r[k] = main.indexOf(k) >= 0 ? target + Math.round((rnd() - .5) * 12) : Math.round(48 + rnd() * 22);
  const p = { pos: pos, r: r };
  const cl = v => Math.max(35, Math.min(99, Math.round(v)));
  for (const k of SKILLS) r[k] = cl(r[k]);
  for (let it = 0; it < 60; it++) {
   const o = ovr0(p);
   if (!o || o === target) break;
   const d = target - o, step = Math.sign(d) * Math.max(1, Math.min(4, Math.abs(d)));
   let moved = false;
   for (const k of main) { const v = cl(r[k] + step); if (v !== r[k]) { r[k] = v; moved = true; } }
   if (!moved) break;
  }
  return r;
 }

 // ---------- the players behind the cards ----------
 function reg(pid, rec) {
  const b = baseOf(pid);
  if (!b || !rec) return null;
  let p = PLAYERS[pid];
  if (!p) {
   p = { id: pid, n: b.n, pos: b.pos, r: {}, real: false, team: b.t, vc494: true, vets489: true, nocard486: true, wnum: b.num, skin: b.skin };
   PLAYERS[pid] = p;
  }
  const r = rec.r494 && typeof rec.r494 === 'object' ? rec.r494 : null;
  if (r) for (const k of SKILLS) p.r[k] = +r[k] || 50;
  else if (!p.r || !Object.keys(p.r).length) for (const k of SKILLS) p.r[k] = 75;
  const o = +rec.o494;
  p.ovr = o >= OMIN && o <= OMAX ? o : ovr0(p) || 80;
  p.rk494 = rec.rk494 | 0;
  p.n = b.n; p.pos = b.pos; p.team = b.t; p.skin = b.skin; p.wnum = b.num;
  return p;
 }
 V.reg = reg;
 // reconcile the card records (rl_v22) with our backup (rl_vc494): records win (they arrive through trades / cloud)
 function sync() {
  if (off()) return;
  try {
   const C = C22();
   let ch = false, ch22 = false;
   for (const pid in C) {
    if (!isVC(pid) || !baseOf(pid)) continue;
    const c = C[pid], bk = S.own[pid];
    if (!(+c.o494 >= OMIN && +c.o494 <= OMAX) && bk && +bk.o494) { Object.assign(c, { o494: bk.o494, r494: bk.r494, rk494: bk.rk494 | 0, b494: bk.b494 }); ch22 = true; }
    if (!(+c.o494 >= OMIN && +c.o494 <= OMAX)) { const b = baseOf(pid), o = OMIN + Math.floor(rnd() * (OMAX - OMIN + 1)); Object.assign(c, { o494: o, r494: roll(b.pos, o), rk494: 0, b494: b.b }); ch22 = true; }
    const bj = JSON.stringify({ o494: c.o494, r494: c.r494, rk494: c.rk494 | 0, b494: c.b494 });
    if (!bk || JSON.stringify({ o494: bk.o494, r494: bk.r494, rk494: bk.rk494 | 0, b494: bk.b494 }) !== bj || bk.gone) { S.own[pid] = JSON.parse(bj); ch = true; }
    reg(pid, c);
   }
   for (const pid in S.own) {
    if (!C[pid] && !S.own[pid].gone) { S.own[pid].gone = Date.now(); ch = true; }
    if (!PLAYERS[pid]) reg(pid, S.own[pid]);  // a copy traded away stays known so old lineups never point at nothing
   }
   if (ch22) V22.save();
   if (ch) save();
  } catch (e) { fail('sync', e); }
 }
 V.sync = sync;
 sync();

 const ownedVC = () => { try { return V22.ownedIds().filter(isVC); } catch (e) { return []; } };
 V.owned = ownedVC;
 const haveBase = b => ownedVC().some(pid => baseOf(pid) && baseOf(pid).b === b);

 // ---------- v499: the call-sign players are ON their branch's roster from the start ----------
 // Charlie (Nov 10 2:25 PM): "make them show from start / and then you get their card after playing / that way they
 // actually on roster". Each branch team gets its 3 call-sign players as fixed roster players '<TEAM>-20/21/22' for
 // everyone (Honor Pack or not, card or not). Each one REPLACES the last generic player at his position, so the
 // roster stays 20 (6 A, 5 M, 1 FO, 5 D, 1 LSM, 2 G). Ratings: the team's best generic at his position + a few points
 // on his main skills, fixed (the same on every phone). These roster players never become cards (nocard486); the
 // card is still earned exactly as before (finish a match as that branch) and keeps its own roll/rank/trade.
 // No duplicate: on his own branch an owned copy of his card is never offered as an extra sub and is swapped back for
 // the roster player in a saved lineup; a win with the roster player in YOUR lineup promotes your copy of his card.
 const CSID = {}, CSB = {};   // base -> roster id, roster id -> base
 V.CSID = CSID; V.CSB = CSB;
 try {
  const cl = v => Math.max(35, Math.min(99, Math.round(v)));
  for (const t in CARDS) {
   const tm = VETS489.teams && VETS489.teams[t] || (typeof GH_REG !== 'undefined' ? GH_REG[t] : null);
   if (!tm || !Array.isArray(tm.roster) || tm.cs499) continue;
   const ro = tm.roster.slice();
   CARDS[t].forEach((b, k) => {
    const id = t + '-' + (20 + k);
    const same = ro.map((pid, i) => ({ pid: pid, i: i, p: PLAYERS[pid] })).filter(o => o.p && o.p.pos === b.pos && !CSB[o.pid]);
    const best = same.slice().sort((x, y) => (y.p.ovr || 0) - (x.p.ovr || 0))[0];
    const r = {};
    const main = KEYS[b.pos] || KEYS.M;
    for (const s of SKILLS) { const v = best && best.p.r && best.p.r[s] != null ? +best.p.r[s] : 70; r[s] = cl(main.indexOf(s) >= 0 ? v + 2 : v); }
    const p = PLAYERS[id] || { id: id };
    Object.assign(p, { id: id, n: b.n, pos: b.pos, r: r, real: false, team: t, vets489: true, nocard486: true, cs499: b.b, wnum: b.num, skin: b.skin });
    p.ovr = ovr0(p) || 75;
    PLAYERS[id] = p;
    const out = same.length ? same[same.length - 1] : null;
    if (out) ro[out.i] = id; else ro.push(id);
    CSID[b.b] = id; CSB[id] = b.b;
   });
   tm.roster = ro;
   tm.cs499 = true;
  }
  note('cs499 ' + Object.keys(CSB).length);
 } catch (e) { fail('cs499', e); }
 const csOf = pid => { const b = baseOf(pid); return b ? CSID[b.b] : null; };
 V.csOf = csOf;

 // ---------- earning ----------
 function earn(tid) {
  if (off() || !CARDS[tid] || S.earn[tid]) return [];
  const C = C22(), out = [];
  for (const b of CARDS[tid]) {
   if (haveBase(b.b)) continue;   // already holds this card (e.g. from a trade): one copy each
   const pid = PFX + b.b + '-' + rid(), o = OMIN + Math.floor(rnd() * (OMAX - OMIN + 1));
   C[pid] = { t: tid, at: Date.now(), w: 'VETERANS DROP', o494: o, r494: roll(b.pos, o), rk494: 0, b494: b.b };
   out.push(pid);
  }
  S.earn[tid] = Date.now();
  V22.save();
  sync();
  save();
  note('earn ' + tid + ' ' + out.join(','));
  return out;
 }
 V.earn = earn;
 function promote(pid) {
  const C = C22(), c = C[pid], b = baseOf(pid);
  if (!c || !b) return null;
  const top = ladder(b.t).length - 1, from = c.rk494 | 0;
  if (from >= top) return { pid: pid, from: from, to: from, cap: true };
  c.rk494 = from + 1;
  V22.save();
  sync();
  return { pid: pid, from: from, to: from + 1 };
 }
 V.promote = promote;

 // ---------- match tracking ----------
 const onlineG = G => !!(G && (G.online || G.meta && G.meta.online || G.net));
 const luIds = lu => lu ? [ ...lu.A || [], ...lu.M || [], ...lu.D || [], lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ].filter(Boolean) : [];
 let cur = null;
 function track() {
  try {
   const G = typeof game !== 'undefined' ? game : null;
   if (!G || !G.lu || !G.lu[0]) return;
   if (!cur || cur.G !== G) cur = { G: G, used: new Set() };
   for (const id of luIds(G.lu[0])) if (isVC(id)) cur.used.add(id);
   if (Array.isArray(G.players)) for (const p of G.players) { const id = p && (p.pid || p.id || p.pl && p.pl.id); if (isVC(id) && p.side !== 1 && p.team !== 1) cur.used.add(id); }
  } catch (e) {}
 }
 V.used = () => cur ? [ ...cur.used ] : [];
 function over(G, win) {
  if (off() || !G || G.tutorial || G.mode === 'tutorial' || G.vc494done || onlineG(G)) return;
  G.vc494done = true;
  track();
  const used = cur && cur.G === G ? [ ...cur.used ] : luIds(G.lu && G.lu[0]).filter(isVC);
  const pend = [];
  let newIds = [];
  try {
   if (CARDS[G.user] && !S.earn[G.user]) { const got = earn(G.user); newIds = got; if (got.length) pend.push({ k: 'earn', t: G.user, ids: got }); }
  } catch (e) { fail('earn', e); }
  try {
   if (win) {
    const own = new Set(ownedVC()), ups = [], done = new Set();
    for (const pid of used) if (own.has(pid)) { const r = promote(pid); done.add(baseOf(pid).b); if (r && !r.cap) ups.push(r); }
    // v499: the call-sign ROSTER player in your lineup counts as your card (your best copy; not one earned this game)
    for (const cs of luIds(G.lu && G.lu[0]).filter(id => CSB[id])) {
     const b = CSB[cs];
     if (done.has(b)) continue;
     const mine = [ ...own ].filter(pid => baseOf(pid) && baseOf(pid).b === b && newIds.indexOf(pid) < 0).sort((x, y) => ((PLAYERS[y] || {}).ovr || 0) - ((PLAYERS[x] || {}).ovr || 0));
     if (!mine.length) continue;
     done.add(b);
     const r = promote(mine[0]); if (r && !r.cap) ups.push(r);
    }
    if (ups.length) pend.push({ k: 'up', ups: ups });
   }
  } catch (e) { fail('promote', e); }
  if (pend.length) { S.q = S.q.concat(pend).slice(-6); save(); setTimeout(showNext, 2600); }
 }
 V.over = over;
 try {
  const GO0 = V17.gameOver;
  if (typeof GO0 === 'function') V17.gameOver = function(G, win) {
   const r = GO0.apply(this, arguments);
   try { over(G, win); } catch (e) { fail('over', e); }
   return r;
  };
 } catch (e) { fail('gameover', e); }

 // ---------- online: keep VETERANS cards out of online lineups ----------
 const onlineCtx = () => {
  try { if (typeof PS !== 'undefined' && PS && PS.luBack === 'onLobby') return true; } catch (e) {}
  try { if (typeof game !== 'undefined' && game && onlineG(game)) return true; } catch (e) {}
  try { if (window.RLNET && RLNET.lobby && RLNET.lobby.state) return true; } catch (e) {}
  return false;
 };
 try {
  const se0 = V22.subExtra;
  if (typeof se0 === 'function') V22.subExtra = function() { const r = se0.apply(this, arguments); return !off() && Array.isArray(r) && onlineCtx() ? r.filter(id => !isVC(id)) : r; };
  const ok0 = V22.okSub;
  if (typeof ok0 === 'function') V22.okSub = function(id) { if (!off() && isVC(id) && onlineCtx()) return false; return ok0.apply(this, arguments); };
 } catch (e) { fail('online', e); }

 // ---------- v499: no double call-sign on his own branch ----------
 const ownTeamCs = (pid, ids) => { const cs = csOf(pid); return !!cs && Array.isArray(ids) && ids.indexOf(cs) >= 0; };
 try {
  const se1 = V22.subExtra;
  if (typeof se1 === 'function') V22.subExtra = function(ids) { const r = se1.apply(this, arguments); return !off() && Array.isArray(r) ? r.filter(id => !(isVC(id) && ownTeamCs(id, ids))) : r; };
 } catch (e) { fail('cs499sub', e); }
 const SLOTS = [ [ 'A', 0 ], [ 'A', 1 ], [ 'A', 2 ], [ 'M', 0 ], [ 'M', 1 ], [ 'M', 2 ], [ 'D', 0 ], [ 'D', 1 ], [ 'D', 2 ], [ 'LSM' ], [ 'SSDM' ], [ 'SSDM2' ], [ 'FO' ], [ 'G' ] ];
 function csLineup(lu, teamId, src) {
  if (off() || !lu || !lu.A || !CARDS[teamId]) return lu;
  let ids = null;
  try { ids = typeof teamRosterIds === 'function' ? teamRosterIds(teamId, src) : null; } catch (e) {}
  if (!Array.isArray(ids)) return lu;
  const all = luIds(lu);
  let bad = false;
  for (const s of SLOTS) {
   const id = s.length > 1 ? lu[s[0]] && lu[s[0]][s[1]] : lu[s[0]];
   if (!isVC(id) || !ownTeamCs(id, ids)) continue;
   const cs = csOf(id);
   if (all.indexOf(cs) < 0) { if (s.length > 1) lu[s[0]][s[1]] = cs; else lu[s[0]] = cs; all.push(cs); }
   else bad = true;
  }
  if (bad && typeof autoLineup === 'function') { try { return autoLineup(ids.slice()); } catch (e) { fail('cs499auto', e); } }
  return lu;
 }
 try {
  const lf1 = window.lineupFor;
  if (typeof lf1 === 'function') window.lineupFor = function(teamId, src) { const lu = lf1.apply(this, arguments); try { return csLineup(lu, teamId, src); } catch (e) { fail('cs499lu', e); return lu; } };
 } catch (e) { fail('cs499lf', e); }

 // ---------- trade: other players' copies (their roll + rank ride the card record) ----------
 function scanRecs(o, d) {
  if (!o || typeof o !== 'object' || d > 4) return;
  if (o.recs && typeof o.recs === 'object') for (const k in o.recs) {
   const pid = k.slice(2), rec = o.recs[k];
   if (k.indexOf('c:' + PFX) === 0 && rec && +rec.o494 && !(C22()[pid])) reg(pid, rec);
  }
  for (const k in o) if (k !== 'recs' && o[k] && typeof o[k] === 'object') scanRecs(o[k], d + 1);
 }
 try {
  if (window.V23 && typeof V23.api === 'function') {
   const api0 = V23.api;
   V23.api = async function(path) {
    const r = await api0.apply(this, arguments);
    try { if (!off() && r && /^\/(tr24|tr27|tt)/.test(String(path || ''))) { scanRecs(r, 0); setTimeout(sync, 50); setTimeout(deco, 60); } } catch (e) { fail('tradeScan', e); }
    return r;
   };
  }
 } catch (e) { fail('api', e); }

 // ---------- look: VETERANS frame + rank on every card tile ----------
 const css = `
 #panel .c17.vc494,.c17.vc494{border-color:#5fbf4a;background:linear-gradient(#24401a,#0e1a0a);animation:none}
 #panel .c17.vc494 .rr,.c17.vc494 .rr{color:#c8f0b0}
 #panel .c17.vc494::after,.c17.vc494::after{background:linear-gradient(115deg,transparent 40%,rgba(150,230,120,.35) 50%,transparent 60%)}
 .c17.vc494:before{content:"\\2605 VETERANS \\2605";display:block;font:bold 7px/9px "Courier New",monospace;color:#fff;background:linear-gradient(90deg,#c8102e 0 33%,#f4f4f4 33% 66%,#1c3f8c 66%);text-shadow:0 0 2px #000,0 0 2px #000;letter-spacing:1px;text-align:center;margin:0 0 2px}
 .c17.vc494 .rk494,#tr24 .cd.vc494 .rk494{font:bold 9px/10px "Courier New",monospace;color:#ffd84d;text-transform:uppercase;text-align:center;margin-top:1px}
 #tr24 .cd.vc494{border-color:#5fbf4a!important;background:linear-gradient(#24401a,#0e1a0a)}
 .pi17 .rk494b{color:#ffd84d}
 #vc494pop{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(5,10,24,.82);font:bold 13px/1.2 "Courier New",monospace;color:#fff;text-transform:uppercase}
 #vc494pop .bx{border:4px solid #fff;outline:4px solid #c8102e;box-shadow:0 0 0 8px #1c3f8c;background:#0b1a33;padding:10px 14px;max-width:92vw;text-align:center;image-rendering:pixelated}
 #vc494pop h1{margin:0 0 6px;font-size:22px;letter-spacing:2px;color:#fff;text-shadow:3px 0 #c8102e,-3px 0 #1c3f8c}
 #vc494pop .row{display:flex;gap:10px;justify-content:center;align-items:flex-start;margin:6px 0}
 #vc494pop .row .c17{width:104px;flex:0 0 auto}
 #vc494pop .row .c17 img{width:100%;image-rendering:pixelated}
 #vc494pop .up{color:#ffd84d;font-size:12px;margin-top:4px}
 #vc494pop button{margin-top:8px;font:bold 14px "Courier New",monospace;background:#c8102e;color:#fff;border:3px solid #fff;padding:6px 18px}`;
 try { const st = document.createElement('style'); st.id = 'vc494css'; st.textContent = css; document.head.appendChild(st); } catch (e) { fail('css', e); }
 function deco() {
  if (off()) return;
  try {
   for (const el of document.querySelectorAll('.c17[data-pid^="' + PFX + '"]:not(.vc494),#tr24 .cd[data-k^="c:' + PFX + '"]:not(.vc494)')) {
    const pid = el.getAttribute('data-pid') || String(el.getAttribute('data-k') || '').slice(2), p = PLAYERS[pid], b = baseOf(pid);
    if (!b) continue;
    el.classList.add('vc494');
    const d = document.createElement('div');
    d.className = 'rk494';
    d.textContent = rankName(b.t, p ? p.rk494 : 0);
    const rr = el.querySelector('.rr');
    if (rr && rr.nextSibling) el.insertBefore(d, rr.nextSibling); else el.appendChild(d);
   }
   for (const pi of document.querySelectorAll('.pi17:not(.vc494i)')) {
    const cd = pi.parentNode && pi.parentNode.querySelector('.c17.vc494');
    if (!cd) continue;
    pi.classList.add('vc494i');
    const pid = cd.getAttribute('data-pid'), p = PLAYERS[pid], b = baseOf(pid);
    if (!b) continue;
    const L = ladder(b.t), rk = p ? p.rk494 | 0 : 0, s = document.createElement('span');
    s.innerHTML = '<b class="rk494b">RANK:</b> ' + esc(L[rk]) + (rk < L.length - 1 ? ' - NEXT: ' + esc(L[rk + 1]) + ' (WIN WITH HIM IN YOUR LINEUP)' : ' - TOP RANK') + '<br><b>VETERANS CARD:</b> ONLY 3 PER BRANCH. EVERY COPY ROLLS ITS OWN OVERALL (' + OMIN + '-' + OMAX + ') - TRADE FOR A BETTER ONE';
    pi.appendChild(s);
   }
  } catch (e) { fail('deco', e); }
 }
 V.deco = deco;
 let dq = 0;
 try { new MutationObserver(() => { if (!dq) dq = requestAnimationFrame(() => { dq = 0; deco(); }); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { fail('mo', e); }

 // ---------- the EARNED / PROMOTED moment ----------
 const cardH = pid => { try { return V22.cardHtml22(pid); } catch (e) { return ''; } };
 function showNext() {
  if (off() || document.getElementById('vc494pop') || !S.q.length) return;
  const it = S.q[0];
  let h = '';
  if (it.k === 'earn') {
   const ids = (it.ids || []).filter(id => C22()[id]);
   if (!ids.length) { S.q.shift(); save(); return showNext(); }
   let tn = '';
   try { tn = T(it.t).name; } catch (e) {}
   h = '<h1>VETERANS CARDS!</h1><div>YOU PLAYED AS ' + esc(tn) + ' - ' + ids.length + ' NEW CARD' + (ids.length > 1 ? 'S' : '') + '</div><div class="row">' + ids.map(cardH).join('') + '</div><div class="up">EVERY CARD STARTS AT THE LOWEST RANK. WIN WITH HIM IN YOUR LINEUP = PROMOTED</div>';
  } else {
   const ups = (it.ups || []).filter(u => C22()[u.pid]);
   if (!ups.length) { S.q.shift(); save(); return showNext(); }
   h = '<h1>PROMOTED!</h1><div class="row">' + ups.map(u => { const b = baseOf(u.pid); return '<div>' + cardH(u.pid) + '<div class="up">' + esc(rankName(b.t, u.from)) + '<br>&#9660;<br>' + esc(rankName(b.t, u.to)) + '</div></div>'; }).join('') + '</div>';
  }
  const d = document.createElement('div');
  d.id = 'vc494pop';
  d.innerHTML = '<div class="bx">' + h + '<div><button id="vc494ok">OK</button></div></div>';
  for (const ev of [ 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'keydown' ]) d.addEventListener(ev, e => e.stopPropagation());
  d.addEventListener('click', e => {
   e.preventDefault(); e.stopPropagation();
   if (e.target && e.target.id !== 'vc494ok' && Date.now() - d.t0 < 700) return;
   d.remove(); S.q.shift(); save();
   try { if (window.panelDirty) panelDirty(); } catch (x) {}
   setTimeout(showNext, 250);
  });
  d.t0 = Date.now();
  document.body.appendChild(d);
  deco();
 }
 V.showNext = showNext;

 setInterval(() => { if (off()) return; track(); }, 1000);
 setInterval(() => { if (off()) return; sync(); if (S.q.length && !document.getElementById('vc494pop')) { const sc = typeof screen === 'string' ? screen : ''; if (sc === 'menu' || sc === 'final') showNext(); } }, 4000);
 if (window.__rl494test) try { for (const t in CARDS) earn(t); } catch (e) { fail('test', e); }
 note('ready ' + ownedVC().length);
})();
