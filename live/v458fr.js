'use strict';
// v458fr: PRO FRANCHISE league core (multi-year pro league: rosters, contracts, cap, college pools, draft, aging).
// One module that other modes (career mode later) can call: window.FR458.
// Kill switch: window.__rl_no458fr = true (the franchise UI and every hook are off; saved franchise players
// are still registered so an existing franchise season save keeps loading).
// Storage: its own key only, localStorage 'rl_fr458'.
(function () {
 const OFF = () => !!window.__rl_no458fr || !!window.__rl_v124gb;
 const KEY = 'fr458';
 const CAP = 42000;                  // salary cap in $K (= $42.0M)
 const RMIN = 17, RMAX = 23;         // roster size limits
 const IDEAL = { A: 5, M: 6, FO: 2, LSM: 2, D: 5, G: 3 };
 const QUO = { A: 4, M: 5, FO: 1, LSM: 1, D: 4, G: 2 };
 const POSL = [ 'A', 'M', 'FO', 'LSM', 'D', 'G' ];
 const DRAFT_ROUNDS = 2;
 const CPU_MAX = 20;          // CPU teams carry 17-20 players
 const CL = 'FR8-', GN = 'FR8G-';
 const SK = () => (typeof SKILLS !== 'undefined' ? SKILLS : [ 'spd', 'pow', 'acc', 'fin', 'stk', 'str', 'def', 'gb', 'fo', 'sav' ]);
 let F = null;

 // ---------- small helpers ----------
 function hs(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
 function mk(seed) { let a = hs(seed) || 1; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
 let R = Math.random;   // the active rng (seeded per offseason step so a reload replays the same outcome)
 const seedR = k => { R = mk((F ? F.id : 'x') + '|' + (F ? F.year : 0) + '|' + k); };
 const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
 const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
 const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [ a[i], a[j] ] = [ a[j], a[i] ]; } return a; };
 const P = id => (typeof PP === 'function' ? PP(id) : PLAYERS[id]);
 const ovr = id => { const p = P(id); return p ? p.ovr : 0; };
 const tn = id => { try { return T(id).name; } catch (e) { return String(id); } };
 const money = k => k < 0 ? '-' + money(-k) : k >= 1000 ? '$' + (k / 1000).toFixed(1) + 'M' : '$' + Math.round(k) + 'K';
 const last = n => { const w = String(n || '').trim().split(/\s+/); return w.length > 1 ? w[0][0] + '. ' + w.slice(1).join(' ') : w[0]; };

 // ---------- players the franchise owns (clones of base players + generated ones) ----------
 // pl[id] = { b: baseId|null, r: [10 ratings], a: age, t: team tag, c: 1 if a college player, n/pos/real/w/s for generated players }
 function ovrCalc(p) { try { return (window.ovrOf || ovrOf)(p); } catch (e) { return p.ovr || 60; } }
 function build(id) {
  const e = F && F.pl[id] || (window.__fr458pl && window.__fr458pl[id]);
  if (!e) return null;
  const base = e.b ? PLAYERS[e.b] : null;
  if (e.b && !base) return null;
  const p = base ? Object.assign({}, base) : { real: false, n: e.n, n0: e.n, pos: e.pos };
  p.id = id; p.fr458 = e.b || null; p.r = {};
  SK().forEach((k, i) => p.r[k] = e.r && e.r[i] != null ? e.r[i] : base ? base.r[k] : 50);
  if (e.c) { p.col25 = true; } else delete p.col25;
  if (e.w != null) p.wnum = e.w;
  if (!base) { p.team = e.t || ''; p.skin = e.s != null ? e.s : (typeof defaultSkin === 'function' ? defaultSkin(p) : 0); }
  p.ovr = ovrCalc(p);
  PLAYERS[id] = p;
  return p;
 }
 function registerAll() { if (!F) return; for (const id in F.pl) try { build(id); } catch (e) { console.error(e); } }
 // own(id): the franchise copy of a player (created on first use); returns the franchise id
 function own(id, col) {
  if (!id) return id;
  if (F.pl[id]) return id;
  const base = PLAYERS[id];
  if (!base) return id;
  if (base.fr458 !== undefined && F.pl[base.id]) return base.id;
  const cid = (base.col25 ? CL + 'C-' : CL) + id;
  if (!F.pl[cid]) {
   F.pl[cid] = { b: id, r: SK().map(k => base.r[k]), a: ageSeed(base), t: base.team };
   if (col || base.col25) F.pl[cid].c = 1;
  }
  build(cid);
  return cid;
 }
 function ageSeed(p) {
  const h = hs('age|' + (p.n0 || p.n) + '|' + p.id);
  if (p.col25) return 18 + h % 4;                 // FR..SR
  const v = [ 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 30, 30, 31, 32, 33, 34 ];
  return v[h % v.length];
 }
 const age = id => F && F.pl[id] ? F.pl[id].a : (P(id) ? ageSeed(P(id)) : 25);
 const cls = a => a <= 18 ? 'FR' : a === 19 ? 'SO' : a === 20 ? 'JR' : 'SR';
 const baseOf = id => (F && F.pl[id] && F.pl[id].b) || (P(id) && P(id).fr458) || null;

 // ---------- money ----------
 function salaryFor(o, a) {
  let v = 300 + Math.pow(Math.max(0, o - 60), 2) * 4.2;
  if (a >= 33) v *= .7; else if (a >= 31) v *= .85; else if (a <= 24) v *= .95;
  return Math.max(300, Math.round(v / 10) * 10);
 }
 const askYears = a => a <= 25 ? 4 : a <= 28 ? 3 : a <= 31 ? 2 : 1;
 const ask = id => ({ sal: salaryFor(ovr(id), age(id)), yrs: askYears(age(id)) });
 function payroll(t, opt) {
  let s = 0;
  for (const id of F.ro[t] || []) { const c = F.ct[id]; if (c && (c[0] > 0 || (opt && opt.inclExp))) s += c[1]; }
  // during re-signing, the players you chose to keep count at their asking price
  const O = F.off;
  if (O && O.step === 'resign' && t === F.team && O.rs) for (const id in O.rs) if (O.rs[id] && F.ct[id] && F.ct[id][0] === 0) s += ask(id).sal;
  return s;
 }
 const room = t => CAP - payroll(t);
 function value(id) {
  const o = ovr(id), a = age(id);
  const am = a <= 23 ? 1.25 : a <= 26 ? 1.12 : a <= 29 ? 1 : a <= 31 ? .82 : a <= 33 ? .62 : .45;
  return Math.round(Math.pow(Math.max(1, o - 50), 1.8) * am);
 }
 const posCount = (ids, pos) => ids.filter(id => P(id) && P(id).pos === pos).length;
 function needs(t) { const ids = F.ro[t] || [], o = {}; for (const k of POSL) o[k] = IDEAL[k] - posCount(ids, k); return o; }

 // ---------- state ----------
 function load() {
  if (F) return F;
  let o = null;
  try { o = LS.get(KEY, null); } catch (e) { o = null; }
  if (o && o.v === 1 && o.ro && o.pl) { F = o; registerAll(); }
  return F;
 }
 let saveT = 0;
 function save() { if (!F) return; try { LS.set(KEY, F); } catch (e) { console.error(e); } }
 function saveSoon() { if (saveT) return; saveT = setTimeout(() => { saveT = 0; save(); }, 1500); }
 function news(kind, s, t, t2) { const n = { k: kind, s: s, t: t || null }; if (t2) n.t2 = t2; (F.off.news = F.off.news || []).push(n); }

 // ---------- start a franchise ----------
 function newFranchise(team, opt) {
  opt = opt || {};
  const teams = (opt.teams || TEAMS.map(t => t.id)).slice();
  F = { v: 1, id: 'fr' + Date.now().toString(36), team: team, lg: opt.lg || 'ALL', na: !!opt.na, teams: teams, year: opt.year || 2026, yr: 1,
   titles: [], hist: [], ro: {}, ct: {}, pl: {}, col: {}, fa: [], off: null, gn: 0, diff: opt.diff != null ? opt.diff : null, cur: null, made: Date.now() };
  seedR('start');
  for (const t of teams) {
   const ids = (T(t).roster || []).filter(id => P(id));
   F.ro[t] = ids.map(id => own(id));
   for (const id of F.ro[t]) { const a = age(id), s = salaryFor(ovr(id), a); F.ct[id] = [ [ 1, 1, 2, 2, 3, 4 ][ri(0, 5)], Math.round(s * (.85 + R() * .3) / 10) * 10 ]; }
   // a team that starts over the cap gets its deals trimmed to fit
   const pay = payroll(t);
   if (pay > CAP * .97) { const f = CAP * .95 / pay; for (const id of F.ro[t]) F.ct[id][1] = Math.max(300, Math.round(F.ct[id][1] * f / 10) * 10); }
  }
  // the college pools: every real college roster in the game
  const CT = window.COL25 && COL25.TEAMS || [];
  for (const ct of CT) F.col[ct.id] = (ct.roster || []).filter(id => P(id)).map(id => own(id, true));
  R = Math.random;
  save();
  return F;
 }

 // ---------- season hand-off ----------
 function seasonRosters() { const o = {}; for (const t of F.teams) o[t] = (F.ro[t] || []).slice(); return o; }
 function endSeason(S) {
  if (!F || !S || S.fr458 !== F.id || F.off) return false;
  const st = typeof standings === 'function' ? standings(S) : [];
  const me = S.table[F.team] || { w: 0, l: 0 };
  const P0 = S.playoff, inPO = !!(P0 && P0.seeds && P0.seeds.includes(F.team));
  let fin = S.champ === F.team ? 'CHAMPIONS' : !inPO ? 'MISSED PLAYOFFS' : 'OUT IN PLAYOFFS';
  if (S.champ !== F.team && inPO && P0 && P0.results) {
   const lostIn = P0.results.filter(r => (r[0] === F.team || r[1] === F.team)).map(r => r[4]).pop();
   if (lostIn) fin = 'LOST IN ' + (lostIn === 'FINAL' ? 'THE FINAL' : lostIn === 'SEMI' ? 'THE SEMIS' : 'THE QUARTERS');
  }
  if (S.champ === F.team && !F.titles.includes(S.year)) F.titles.push(S.year);
  F.hist.push({ y: S.year, w: me.w, l: me.l, f: fin, ch: S.champ || null });
  // draft order: worst regular-season record first, the champion picks last
  let ord = st.map(x => x.id).filter(id => F.teams.includes(id)).reverse();
  if (S.champ && ord.includes(S.champ)) ord = ord.filter(x => x !== S.champ).concat([ S.champ ]);
  F.off = { step: 'age', y0: S.year, ord: ord, news: [], rs: {}, done: {} };
  F.cur = null;
  stepAge();
  save();
  return true;
 }

 // ---------- offseason 1: aging, progression, retirements, contracts tick ----------
 function grow(id, a) {
  const e = F.pl[id]; if (!e) return 0;
  const o0 = ovr(id);
  let d;
  if (a <= 19) d = ri(2, 5); else if (a <= 21) d = ri(1, 4); else if (a <= 23) d = ri(0, 3); else if (a <= 26) d = ri(-1, 2);
  else if (a <= 28) d = ri(-1, 1); else if (a <= 30) d = ri(-2, 0); else if (a <= 32) d = ri(-3, -1); else d = ri(-5, -2);
  if (d > 0) d = Math.max(1, Math.round(d * clamp((97 - o0) / 25, .2, 1)));   // near the ceiling, growth slows down
  if (d) {
   const p = P(id), ks = SK();
   e.r = ks.map((k, i) => {
    const v = e.r[i];
    if ((k === 'fo' && p.pos !== 'FO' && v < 40) || (k === 'sav' && p.pos !== 'G' && v < 20)) return v;   // keep off-position skills where they were
    return clamp(Math.round(v + d * (.6 + R() * .8)), 1, 99);
   });
   build(id);
  }
  return ovr(id) - o0;
 }
 function stepAge() {
  seedR('age');
  const O = F.off; O.prog = {}; O.ret = []; O.grad = 0;
  const pro = new Set(); for (const t of F.teams) for (const id of F.ro[t]) pro.add(id);
  for (const id of F.fa) pro.add(id);
  for (const id of pro) { const e = F.pl[id]; if (!e) continue; e.a++; O.prog[id] = [ ovr(id) - 0, grow(id, e.a) ]; }
  for (const c in F.col) for (const id of F.col[c]) { const e = F.pl[id]; if (!e) continue; e.a++; grow(id, e.a); }
  // retirements (pro + unsigned)
  const retire = id => { const a = age(id), o = ovr(id); let p = a >= 38 ? 1 : a >= 36 ? .6 : a >= 34 ? .3 : a >= 33 ? .12 : 0; if (a >= 30 && o < 62) p = Math.max(p, .5); return R() < p; };
  for (const t of F.teams) {
   F.ro[t] = F.ro[t].filter(id => { if (retire(id)) { O.ret.push([ id, t ]); delete F.ct[id]; return false; } return true; });
  }
  F.fa = F.fa.filter(id => { if (retire(id) || age(id) >= 35) { O.ret.push([ id, null ]); return false; } return true; });
  // contracts tick down; 0 = expiring (re-sign or let walk)
  for (const t of F.teams) for (const id of F.ro[t]) { const c = F.ct[id]; if (c) c[0] = Math.max(0, c[0] - 1); }
  // college: the oldest who were never drafted graduate and leave; freshmen refill every spot
  for (const c in F.col) {
   const keep = [];
   for (const id of F.col[c]) { if (age(id) >= 23) { O.grad++; if (ovr(id) >= 76) toFA(id); else gone(id); } else keep.push(id); }
   F.col[c] = keep;
   refill(c);
  }
  F.off.expMine = F.ro[F.team].filter(id => F.ct[id] && F.ct[id][0] === 0);
  for (const id of F.off.expMine) F.off.rs[id] = null;
  for (const [id] of O.ret) gone(id, true);
  R = Math.random;
 }
 function gone(id, keepData) { if (!keepData && F.pl[id] && !F.pl[id].b) { /* generated players leave the registry when they leave the league */ delete F.pl[id]; } }
 function toFA(id, from) { const e = F.pl[id]; if (e) { delete e.c; if (from) e.ft = from; } build(id); if (!F.fa.includes(id)) F.fa.push(id); }

 // ---------- generated freshmen ----------
 let NAMES = null;
 function names() {
  if (NAMES) return NAMES;
  const fs = new Set, ls = new Set;
  for (const id in PLAYERS) { const p = PLAYERS[id]; if (!p || !p.col25 || p.fr458 !== undefined) continue; const w = String(p.n0 || p.n || '').trim().split(/\s+/); if (w.length === 2 && /^[A-Za-z'-]+$/.test(w[0]) && /^[A-Za-z'-]+$/.test(w[1])) { fs.add(w[0]); ls.add(w[1]); } }
  NAMES = { f: [ ...fs ].sort(), l: [ ...ls ].sort() };
  return NAMES;
 }
 function genPlayer(team, pos, tgt, a, tag) {
  const N = names(), used = new Set(Object.values(F.pl).filter(e => !e.b).map(e => e.n));
  let n = '';
  for (let i = 0; i < 30; i++) { n = N.f[Math.floor(R() * N.f.length)] + ' ' + N.l[Math.floor(R() * N.l.length)]; if (!used.has(n)) break; }
  // shape the ratings like a real player at the same position, scaled to the target overall
  const pool = Object.values(PLAYERS).filter(p => p && p.pos === pos && p.col25 && p.fr458 === undefined);
  const tpl = pool.length ? pool[Math.floor(R() * pool.length)] : null;
  const ks = SK(), f = tpl ? tgt / Math.max(40, tpl.ovr) : 1;
  const r = ks.map(k => { const v = tpl ? tpl.r[k] : 55; if ((k === 'fo' && pos !== 'FO' && v < 40) || (k === 'sav' && pos !== 'G' && v < 20)) return v; return clamp(Math.round(v * f + (R() - .5) * 8), 1, 99); });
  const id = GN + (++F.gn);
  const taken = new Set((F.col[team] || F.ro[team] || []).map(x => P(x) && P(x).wnum).filter(x => x != null));
  let w = ri(1, 99); for (let i = 0; i < 99 && taken.has(w); i++) w = w % 99 + 1;
  F.pl[id] = { b: null, n: n, pos: pos, r: r, a: a, t: team, w: w, c: tag === 'col' ? 1 : 0 };
  const p = build(id);
  // nudge toward the target overall (ovr weights differ by position)
  for (let k = 0; k < 6 && p && Math.abs(p.ovr - tgt) > 1; k++) { const d = tgt - p.ovr; F.pl[id].r = F.pl[id].r.map((v, i) => (ks[i] === 'fo' && pos !== 'FO' && v < 40) || (ks[i] === 'sav' && pos !== 'G' && v < 20) ? v : clamp(v + d, 1, 99)); build(id); }
  return id;
 }
 function refill(c) {
  const ct = window.COL25 && COL25.TEAMS && COL25.TEAMS.find(t => t.id === c);
  const want = ct ? ct.roster.length : 18, ids = F.col[c];
  const basePos = ct ? ct.roster.map(id => P(id) && P(id).pos).filter(Boolean) : [];
  const avg = ids.length ? ids.reduce((s, id) => s + ovr(id), 0) / ids.length : 70;
  const out = [];
  while (ids.length < want) {
   const cnt = {}; for (const id of ids) { const ps = P(id).pos; cnt[ps] = (cnt[ps] || 0) + 1; }
   const bc = {}; for (const ps of basePos) bc[ps] = (bc[ps] || 0) + 1;
   const pos = POSL.slice().sort((x, y) => ((cnt[x] || 0) - (bc[x] || 0)) - ((cnt[y] || 0) - (bc[y] || 0)))[0];
   const id = genPlayer(c, pos, clamp(Math.round(avg - 14 + (R() - .3) * 14), 50, 78), 18, 'col');
   ids.push(id); out.push(id);
  }
  return out;
 }

 // ---------- offseason 2: re-sign ----------
 function resign(id, keep) {
  const O = F.off; if (!O || !(id in O.rs)) return { ok: false };
  if (!keep) { O.rs[id] = false; return { ok: true }; }
  const a = ask(id);
  const pay = payroll(F.team) - (O.rs[id] ? a.sal : 0);
  if (pay + a.sal > CAP) return { ok: false, why: 'OVER THE CAP: ' + money(pay + a.sal - CAP) + ' TOO MUCH' };
  O.rs[id] = true;
  return { ok: true };
 }
 function resignDone() {
  const O = F.off;
  for (const id of O.expMine) {
   if (O.rs[id]) { const a = ask(id); F.ct[id] = [ a.yrs, a.sal ]; news('resign', 'YOU RE-SIGNED ' + nm(id) + ' (' + money(a.sal) + ' X ' + a.yrs + (a.yrs > 1 ? ' YRS' : ' YR') + ')', F.team); }
   else { F.ro[F.team] = F.ro[F.team].filter(x => x !== id); delete F.ct[id]; toFA(id, F.team); }
  }
 }
 const nma = id => { const p = P(id); return p ? p.n + ' (' + p.pos + ' ' + p.ovr + ', AGE ' + age(id) + ')' : id; };
 const nm = id => { const p = P(id); return p ? p.n + ' (' + p.pos + ' ' + p.ovr + ')' : id; };

 // ---------- offseason 3: CPU moves ----------
 function cpuMoves() {
  seedR('cpu');
  const O = F.off; O.news = O.news.filter(x => x.k === 'resign');
  const cpu = F.teams.filter(t => t !== F.team);
  // their expiring deals
  for (const t of cpu) {
   const ids = F.ro[t], ranked = ids.slice().sort((a, b) => ovr(b) - ovr(a)), cut12 = ovr(ranked[Math.min(11, ranked.length - 1)]);
   for (const id of ids.filter(x => F.ct[x] && F.ct[x][0] === 0)) {
    const a = ask(id), star = ovr(id) >= 85 || ranked.indexOf(id) < 5, keep = (star || ((ovr(id) >= cut12 || (age(id) <= 26 && ovr(id) >= 72)) && R() > .25)) && payroll(t) + a.sal <= CAP;
    if (keep) F.ct[id] = [ a.yrs, a.sal ];
    else { F.ro[t] = F.ro[t].filter(x => x !== id); delete F.ct[id]; toFA(id, t); if (ovr(id) >= 74) news('walk', tn(t) + ' LET ' + nm(id) + ' WALK', t); }
   }
  }
  // trades between CPU teams
  const nT = ri(3, 5);
  for (let k = 0, tries = 0; k < nT && tries < 200; tries++) {
   const [a, b] = shuffle(cpu.slice()).slice(0, 2);
   const pl = F.ro[a].filter(id => ovr(id) >= 70), pa = pl[Math.floor(R() * pl.length)];
   if (!pa) continue;
   const pos = P(pa).pos, va = value(pa);
   const cand = F.ro[b].filter(id => P(id).pos === pos && Math.abs(value(id) - va) <= va * .15 && id !== pa);
   if (!cand.length) continue;
   const pb = cand[Math.floor(R() * cand.length)];
   const da = F.ct[pa][1], db = F.ct[pb][1];
   if (payroll(a) - da + db > CAP || payroll(b) - db + da > CAP) continue;
   F.ro[a] = F.ro[a].filter(x => x !== pa).concat([ pb ]); F.ro[b] = F.ro[b].filter(x => x !== pb).concat([ pa ]);
   news('trade', tn(a) + ' TRADED ' + nma(pa) + ' TO ' + tn(b) + ' FOR ' + nma(pb), a, b);
   k++;
  }
  // cuts: old, slipping players at deep positions
  let cuts = 0;
  for (const t of shuffle(cpu.slice())) {
   const ids = F.ro[t];
   const low = ids.slice().sort((a, b) => ovr(a) - ovr(b)).slice(0, 4);
   const pool = low.filter(id => age(id) >= 29).sort((a, b) => value(a) - value(b));
   const over = ids.length > CPU_MAX;
   if (!pool.length || !(over || R() < .45) || cuts >= 8) continue;
   const id = pool[0];
   F.ro[t] = ids.filter(x => x !== id); delete F.ct[id]; toFA(id, t); cuts++;
   news('cut', tn(t) + ' CUT ' + nma(id), t);
  }
  // retirements of note go on the wire too
  for (const [id, t] of O.ret || []) if (P(id) && ovr(id) >= 72) news('ret', nm(id) + ' RETIRED AT ' + age(id), t);
  R = Math.random;
  faBids();
 }

 // ---------- offseason 4: free agency ----------
 function faBids() {
  seedR('fa');
  const O = F.off; O.bid = {}; O.faLog = [];
  const cpu = F.teams.filter(t => t !== F.team);
  for (const id of F.fa) {
   const a = ask(id), pos = P(id) && P(id).pos, o = ovr(id);
   if (!pos) continue;
   const ft = F.pl[id] && F.pl[id].ft;
   // how many teams are in on him: stars draw a few, role players one or none
   const k = o >= 82 ? ri(2, 3) : o >= 75 ? ri(1, 2) : o >= 68 ? ri(0, 1) : (R() < .25 ? 1 : 0);
   const fits = shuffle(cpu.filter(t => t !== ft && F.ro[t].length < RMAX)).sort((x, y) => needs(y)[pos] - needs(x)[pos]);
   const offers = [];
   for (const t of fits) {
    if (offers.length >= k) break;
    const nd = needs(t)[pos];
    if (nd <= 0 && R() > .2) continue;
    const sal = Math.round(a.sal * (.8 + R() * .28 + (nd > 1 ? .04 : 0)) / 10) * 10, yrs = clamp(a.yrs + ri(-1, 1), 1, 4);
    if (payroll(t) + sal > CAP) continue;
    offers.push({ t: t, sal: sal, yrs: yrs, sc: sal * (1 + .05 * (yrs - 1)) });
   }
   if (offers.length) O.bid[id] = offers.sort((x, y) => y.sc - x.sc)[0];
  }
  R = Math.random;
 }
 const offerScore = (sal, yrs) => sal * (1 + .05 * (yrs - 1));
 function faOffer(id, sal, yrs) {
  const O = F.off;
  if (!F.fa.includes(id)) return { ok: false, why: 'NOT A FREE AGENT' };
  if (F.ro[F.team].length >= RMAX) return { ok: false, why: 'ROSTER FULL (' + RMAX + ' MAX)' };
  if (payroll(F.team) + sal > CAP) return { ok: false, why: 'OVER THE CAP BY ' + money(payroll(F.team) + sal - CAP) };
  O.bid = O.bid || {}; O.faLog = O.faLog || [];
  const a = ask(id), b = O.bid[id], mine = offerScore(sal, yrs);
  const floor = offerScore(a.sal * .85, a.yrs);
  if (b && b.sc > mine) {
   F.fa = F.fa.filter(x => x !== id); F.ro[b.t].push(id); F.ct[id] = [ b.yrs, b.sal ];
   const r = { ok: false, lost: true, t: b.t, why: P(id).n + ' SIGNED WITH ' + tn(b.t) + ' (' + money(b.sal) + ' X ' + b.yrs + '). THEIR OFFER WAS BETTER.' };
   O.faLog.push(r.why); return r;
  }
  if (!b && mine < floor) return { ok: false, why: P(id).n + ' WANTS MORE THAN THAT' };
  F.fa = F.fa.filter(x => x !== id); F.ro[F.team].push(id); F.ct[id] = [ yrs, sal ];
  const r = { ok: true, why: P(id).n + ' SIGNED WITH ' + tn(F.team) + '! ' + money(sal) + ' X ' + yrs + (yrs > 1 ? ' YRS' : ' YR') };
  O.faLog.push(r.why); news('fa', 'YOU SIGNED ' + nm(id) + ' (' + money(sal) + ' X ' + yrs + ')', F.team);
  return r;
 }
 function faFinish() {
  seedR('fafin');
  const O = F.off;
  // CPU teams take the players they bid on
  O.bid = O.bid || {};
  for (const id of F.fa.slice()) { const b = O.bid[id]; if (b && F.ro[b.t].length < RMAX && payroll(b.t) + b.sal <= CAP) { F.fa = F.fa.filter(x => x !== id); F.ro[b.t].push(id); F.ct[id] = [ b.yrs, b.sal ]; if (ovr(id) >= 75) news('fa', tn(b.t) + ' SIGNED ' + nm(id), b.t); } }
  fillCpu(RMIN);
  R = Math.random;
 }
 function fillCpu(min) {
  for (const t of F.teams.filter(x => x !== F.team)) {
   let guard = 0;
   while (guard++ < 30) {
    const ids = F.ro[t], short = POSL.filter(ps => posCount(ids, ps) < QUO[ps]);
    if (!short.length && ids.length >= min) break;
    const pos = short.length ? short[0] : POSL.slice().sort((a, b) => (posCount(ids, a) - IDEAL[a]) - (posCount(ids, b) - IDEAL[b]))[0];
    let id = F.fa.filter(x => P(x) && P(x).pos === pos).sort((a, b) => ovr(b) - ovr(a)).find(x => payroll(t) + ask(x).sal <= CAP);
    if (id) F.fa = F.fa.filter(x => x !== id);
    else id = genPlayer(t, pos, ri(60, 67), ri(26, 30), 'pro');
    F.ro[t].push(id); const a = ask(id); F.ct[id] = [ clamp(a.yrs, 1, 2), Math.min(a.sal, Math.max(300, room(t))) ];
   }
  }
 }

 // ---------- offseason 5: trades with the CPU ----------
 function tradeEval(t, give, get) {
  give = give || []; get = get || [];
  if (!F.teams.includes(t) || t === F.team) return { ok: false, why: 'PICK A TEAM' };
  if (!give.length || !get.length) return { ok: false, why: 'PICK PLAYERS ON BOTH SIDES' };
  if (give.some(id => !F.ro[F.team].includes(id)) || get.some(id => !F.ro[t].includes(id))) return { ok: false, why: 'THOSE PLAYERS MOVED' };
  const vg = give.reduce((s, id) => s + value(id), 0), vt = get.reduce((s, id) => s + value(id), 0);
  const sal = ids => ids.reduce((s, id) => s + (F.ct[id] ? F.ct[id][1] : 0), 0);
  const myPay = payroll(F.team) - sal(give) + sal(get), thPay = payroll(t) - sal(get) + sal(give);
  const myN = F.ro[F.team].length - give.length + get.length, thN = F.ro[t].length - get.length + give.length;
  const r = { vg: vg, vt: vt, myPay: myPay, thPay: thPay, myN: myN, thN: thN };
  if (myPay > CAP && myPay > payroll(F.team)) return Object.assign(r, { ok: false, why: 'THIS PUTS YOU OVER THE CAP (' + money(myPay) + ')' });
  if (thPay > CAP && thPay > payroll(t)) return Object.assign(r, { ok: false, why: tn(t) + ' CAN\'T FIT THE SALARY UNDER THE CAP' });
  if (thN > RMAX + 2 || thN < RMIN - 2) return Object.assign(r, { ok: false, why: tn(t) + ' ROSTER WOULD BE ' + thN + ' PLAYERS' });
  const lostPos = get.map(id => P(id).pos).filter(ps => posCount(F.ro[t].filter(x => !get.includes(x)), ps) + give.filter(x => P(x).pos === ps).length < QUO[ps]);
  if (lostPos.length) return Object.assign(r, { ok: false, why: tn(t) + ' IS TOO THIN AT ' + lostPos[0] + ' TO TRADE ONE (' + QUO[lostPos[0]] + ' MIN)' });
  if (vg < vt * 1.06) return Object.assign(r, { ok: false, why: 'NOT ENOUGH VALUE. ' + tn(t) + ' WANTS MORE', short: Math.round(vt * 1.06 - vg) });
  return Object.assign(r, { ok: true, why: tn(t) + ' ACCEPTS! YOU GET ' + get.map(nm).join(' + ') + ' FOR ' + give.map(nm).join(' + ') });
 }
 function trade(t, give, get) {
  const r = tradeEval(t, give, get);
  if (!r.ok) return r;
  F.ro[F.team] = F.ro[F.team].filter(x => !give.includes(x)).concat(get);
  F.ro[t] = F.ro[t].filter(x => !get.includes(x)).concat(give);
  news('trade', 'YOU TRADED ' + give.map(nm).join(' + ') + ' TO ' + tn(t) + ' FOR ' + get.map(nm).join(' + '), F.team);
  (F.off.trades = F.off.trades || []).push([ t, give.slice(), get.slice() ]);
  save();
  return r;
 }

 // ---------- offseason 6: the draft (real college players declare) ----------
 function declare() {
  const all = [];
  for (const c in F.col) for (const id of F.col[c]) { const a = age(id), o = ovr(id); if (a >= 20 || o >= 84) all.push({ id: id, c: c, s: o + (a - 18) * 1.5 }); }
  all.sort((x, y) => y.s - x.s);
  return all.slice(0, F.teams.length * DRAFT_ROUNDS);
 }
 function draftStart() {
  const O = F.off;
  if (O.dr) return O.dr;
  const cls = declare();
  O.dr = { pool: cls.map(x => x.id), from: {}, ord: O.ord.slice(), rounds: DRAFT_ROUNDS, n: 0, picks: [] };
  for (const x of cls) O.dr.from[x.id] = x.c;
  return O.dr;
 }
 // a college star is not an instant pro star: on draft night his ratings become his rookie (pro) ratings
 const proAdj = o => clamp(Math.round((o - 68) * .4) + 2, 2, 10);
 const proProj = id => { const o = ovr(id); return o - proAdj(o); };
 function rookie(id) {
  const e = F.pl[id]; if (!e) return;
  const tgt = proProj(id), ks = SK(), p = P(id);
  for (let k = 0; k < 8 && p && Math.abs(P(id).ovr - tgt) > 0; k++) { const d = tgt - P(id).ovr; e.r = e.r.map((v, i) => (ks[i] === 'fo' && p.pos !== 'FO' && v < 40) || (ks[i] === 'sav' && p.pos !== 'G' && v < 20) ? v : clamp(v + d, 1, 99)); build(id); }
 }
 const draftTurn = () => { const D = F.off.dr; if (!D || D.n >= D.ord.length * D.rounds) return null; return D.ord[D.n % D.ord.length]; };
 function draftPick(t, id) {
  const D = F.off.dr;
  if (!D || draftTurn() !== t || !D.pool.includes(id)) return false;
  const c = D.from[id];
  D.pool = D.pool.filter(x => x !== id);
  F.col[c] = (F.col[c] || []).filter(x => x !== id);
  const e = F.pl[id]; if (e) { delete e.c; e.t = t; e.cv = ovr(id); }
  rookie(id);
  F.ro[t].push(id);
  const rd = Math.floor(D.n / D.ord.length), slot = D.n % D.ord.length;
  F.ct[id] = [ rd === 0 ? 3 : 2, rd === 0 ? Math.round((1500 - slot * 35) / 10) * 10 : Math.round((620 - slot * 8) / 10) * 10 ];
  D.picks.push([ t, id, c, D.n + 1 ]);
  D.n++;
  // the college team refills that spot with a freshman
  seedR('fresh' + D.n);
  const fresh = refill(c); (F.off.fresh = F.off.fresh || []).push(...fresh.map(f => [ c, f, id ]));
  R = Math.random;
  return true;
 }
 function cpuPickFor(t) {
  const D = F.off.dr, nd = needs(t);
  let best = null, bs = -1e9;
  for (const id of D.pool) { const p = P(id); if (!p) continue; const sp = p.pos === 'G' || p.pos === 'FO', have = posCount(F.ro[t], p.pos), s = p.ovr + (have < QUO[p.pos] ? 6 : 0) + (!sp && nd[p.pos] > 0 ? 2 : 0) - (sp ? (have >= IDEAL[p.pos] ? 6 : have >= QUO[p.pos] ? 2 : 0) : 0) - (!sp && nd[p.pos] <= 0 ? 1 : 0); if (s > bs) { bs = s; best = id; } }
  return best;
 }
 function draftCpu(toUser) {
  let g = 0;
  while (g++ < 400) { const t = draftTurn(); if (!t) break; if (t === F.team) { if (toUser) break; const id = cpuPickFor(t); if (!id) break; draftPick(t, id); continue; } const id = cpuPickFor(t); if (!id) break; draftPick(t, id); }
  return draftTurn();
 }
 function draftDone() { const D = F.off.dr; return !!D && D.n >= D.ord.length * D.rounds; }

 // ---------- offseason 7: final roster + start the next season ----------
 function cpuCutdown() {
  for (const t of F.teams.filter(x => x !== F.team)) {
   let g = 0;
   while (F.ro[t].length > CPU_MAX && g++ < 20) {
    const ids = F.ro[t], c = ids.filter(id => posCount(ids, P(id).pos) > QUO[P(id).pos] && !(F.off.dr && F.off.dr.picks.some(p => p[1] === id))).sort((a, b) => value(a) - value(b))[0];
    if (!c) break;
    F.ro[t] = ids.filter(x => x !== c); delete F.ct[c]; toFA(c);
   }
   while (payroll(t) > CAP && g++ < 40) {
    const ids = F.ro[t], c = ids.filter(id => posCount(ids, P(id).pos) > QUO[P(id).pos]).sort((a, b) => (F.ct[b][1] / Math.max(1, value(b))) - (F.ct[a][1] / Math.max(1, value(a))))[0];
    if (!c || ids.length <= RMIN) break;
    F.ro[t] = ids.filter(x => x !== c); delete F.ct[c]; toFA(c);
   }
  }
  fillCpu(RMIN);
 }
 function cut(id) {
  if (!F.ro[F.team].includes(id)) return false;
  F.ro[F.team] = F.ro[F.team].filter(x => x !== id); delete F.ct[id]; toFA(id);
  return true;
 }
 function autoFill() {
  // sign the cheapest useful free agents until the roster is legal
  let g = 0;
  while (F.ro[F.team].length < RMIN && g++ < 30) {
   const ids = F.ro[F.team], short = POSL.filter(ps => posCount(ids, ps) < QUO[ps]);
   const pos = short[0] || POSL.slice().sort((a, b) => (posCount(ids, a) - IDEAL[a]) - (posCount(ids, b) - IDEAL[b]))[0];
   if (room(F.team) < 300) return { ok: false, why: 'NO CAP ROOM LEFT: CUT SOMEONE FIRST' };
   let id = F.fa.filter(x => P(x) && P(x).pos === pos && payroll(F.team) + ask(x).sal <= CAP).sort((a, b) => ovr(b) - ovr(a))[0];
   if (id) F.fa = F.fa.filter(x => x !== id); else { seedR('jm' + g); id = genPlayer(F.team, pos, ri(60, 65), ri(26, 30), 'pro'); R = Math.random; }
   F.ro[F.team].push(id); const a = ask(id); F.ct[id] = [ 1, Math.min(a.sal, Math.max(300, room(F.team))) ];
  }
  return { ok: true };
 }
 function rosterCheck() {
  const n = F.ro[F.team].length, pay = payroll(F.team);
  if (n > RMAX) return { ok: false, why: 'CUT ' + (n - RMAX) + ' PLAYER' + (n - RMAX > 1 ? 'S' : '') + ' (MAX ' + RMAX + ')' };
  if (n < RMIN) return { ok: false, why: 'NEED ' + (RMIN - n) + ' MORE PLAYER' + (RMIN - n > 1 ? 'S' : '') + ' (MIN ' + RMIN + ')' };
  if (pay > CAP) return { ok: false, why: 'OVER THE CAP BY ' + money(pay - CAP) + ': CUT OR TRADE SOMEONE' };
  return { ok: true };
 }
 function finishOffseason() {
  const ck = rosterCheck(); if (!ck.ok) return ck;
  // unsigned players the league passed on: old ones retire, the rest wait for next year
  F.fa = F.fa.filter(id => { if (age(id) >= 33 || ovr(id) < 60) { gone(id); return false; } return true; });
  F.fa.sort((a, b) => value(b) - value(a)); for (const id of F.fa.splice(60)) gone(id);
  const keepNews = (F.off.news || []).slice(-40);
  const st0 = new Set(F.off.start || []);
  F.lastOff = { y: F.off.y0, news: keepNews, picks: F.off.dr ? F.off.dr.picks : [], fresh: (F.off.fresh || []).length, add: F.ro[F.team].filter(id => !st0.has(id)) };
  for (const id in F.pl) delete F.pl[id].ft;
  F.year++; F.yr++;
  F.off = null;
  // prune generated players who are nowhere any more
  const live = new Set(F.fa); for (const t of F.teams) for (const id of F.ro[t]) live.add(id); for (const c in F.col) for (const id of F.col[c]) live.add(id);
  try { if (typeof season !== 'undefined' && season && season.fr458 === F.id && season.rosters) for (const t in season.rosters) for (const id of season.rosters[t]) live.add(id); } catch (e) {}
  for (const id in F.pl) if (!live.has(id)) delete F.pl[id];
  save();
  return { ok: true };
 }
 // positions are needed for the CPU logic; expose a flat read API for other modes (career later)
 window.FR458 = {
  OFF: OFF, CAP: CAP, RMIN: RMIN, RMAX: RMAX, IDEAL: IDEAL, QUO: QUO, POSL: POSL,
  get: () => load(), has: () => !!load(), save: save, saveSoon: saveSoon, clear: () => { F = null; try { localStorage.removeItem('rl_' + KEY); } catch (e) {} },
  newFranchise: newFranchise, seasonRosters: seasonRosters, endSeason: endSeason, own: id => own(id),
  age: age, cls: cls, ask: ask, salaryFor: salaryFor, money: money, payroll: payroll, room: room, value: value, needs: needs, baseOf: baseOf, last: last, nm: nm,
  roster: t => (F && F.ro[t] || []).slice(), contract: id => F && F.ct[id] ? F.ct[id].slice() : null, college: c => (F && F.col[c] || []).slice(),
  resign: resign, resignDone: resignDone, cpuMoves: cpuMoves, faBids: faBids, faOffer: faOffer, faFinish: faFinish, offerScore: offerScore,
  tradeEval: tradeEval, trade: trade, declare: declare, draftStart: draftStart, draftTurn: draftTurn, draftPick: draftPick, cpuPickFor: cpuPickFor, draftCpu: draftCpu, draftDone: draftDone, proProj: proProj, proAdj: proAdj,
  cpuCutdown: cpuCutdown, cut: cut, autoFill: autoFill, rosterCheck: rosterCheck, finishOffseason: finishOffseason, registerAll: registerAll
 };
 try { load(); } catch (e) { console.error(e); }
})();
