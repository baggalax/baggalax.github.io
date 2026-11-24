/* v590bot.js - 1.5 LOCKER LEAGUE CPU bot teams (board 1.5-10).
 * When no player is found the server picks a bot (name + its own real rank near yours; RK15.call 'bot'). This file builds
 * that bot as a temporary CARD TEAM (SZ_REG 'RK15BOT', tag CPU): random player cards with the team OVR kept near yours,
 * wearing its uniform set: GOBBLERS = Turkey Trotters, INVADERS = Space Force, WARFARE = Army, GRAVEYARD = the ghost
 * players (purple set), DEEP SEA DOGS = Navy, DOGFIGHT = Air Force, BEACHHEAD = Marines, RIPTIDE = Coast Guard.
 * Difficulty: MEDIUM (bots ranked SQUID/FISH) = the middle CPU (BEGINNER); GOOD (GROSS and up) = the hard-mode CPU brains
 *   at the bot's tier (GROSS / NASTY / BAGGATWAAN). The smarter GOOD AI comes in 3 steps, each with its own off switch
 *   (set before a match): window.__rl_no590ai1 = set plays + picks/cuts off (v448ai), __rl_no590ai2 = off-ball cutting
 *   off (v36ai off-ball), __rl_no590ai3 = tight man defense off (v452hard). Default: all on for GOOD bots only.
 * Kill switch: window.__rl_no590bot (no bot offer; FIND MATCH only searches).
 */
(function () {
 'use strict';
 const Wn = window;
 const off = () => !!(Wn.__rl_no590bot || !Wn.RK15 || RK15.off());
 const SET = { 'GOBBLERS': 'TKT', 'INVADERS': 'VTSF', 'WARFARE': 'VTARM', 'GRAVEYARD': 'GHO', 'DEEP SEA DOGS': 'VTNAV', 'DOGFIGHT': 'VTAF', 'BEACHHEAD': 'VTMAR', 'RIPTIDE': 'VTCG' };
 const NAMES = Object.keys(SET);
 const B = Wn.RK15BOT = { SET: SET, NAMES: NAMES, last: null, err: null };
 function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
 B.localInfo = function (pts) { // practice bot when the ranked server is not there yet (no points)
  const r = rng(Date.now() & 0xffff), p = Math.max(0, Math.min(2999, (pts | 0) + Math.floor(r() * 201) - 100)), t = RK15.ofPts(p);
  return { mid: null, name: NAMES[Math.floor(r() * NAMES.length)], pts: p, tier: t.tier, div: t.div, diff: t.ix < 10 ? 'MEDIUM' : 'GOOD', seed: Math.floor(r() * 255) };
 };
 const avgOvr = ids => { const o = ids.map(id => curOvr14(id)).sort((a, b) => b - a).slice(0, 10); return o.reduce((a, b) => a + b, 0) / Math.max(1, o.length); };
 function pool() { return Object.keys(PLAYERS).filter(id => /^[A-Z]{2,4}-\d+$/.test(id) && PP(id) && !PP(id).gho16 && PP(id).pos); }
 const MIX = { G: 2, A: 4, M: 5, FO: 1, LSM: 1, D: 4 };
 function roster(info, myTid) {
  const r = rng(((info.seed | 0) + 1) * 7919 + NAMES.indexOf(info.name) * 131), base = SET[info.name];
  if (base === 'GHO' && Wn.GH_REG && GH_REG.GHO && GH_REG.GHO.roster && GH_REG.GHO.roster.length >= 12) return GH_REG.GHO.roster.slice();
  let target = 70; try { target = avgOvr(teamRosterIds(myTid, 'real').filter(id => PP(id))); } catch (e) {}
  const P = pool(), out = [];
  for (const pos in MIX) {
   const c = P.filter(id => PP(id).pos === pos && !out.includes(id)).map(id => [id, Math.abs(curOvr14(id) - target) + r() * 6]).sort((a, b) => a[1] - b[1]).slice(0, 12);
   for (let i = 0; i < MIX[pos] && c.length; i++) out.push(c.splice(Math.floor(r() * Math.min(c.length, 6)), 1)[0][0]);
  }
  return out;
 }
 function build(id, info, myTid) {
  const base = SET[info.name] && T(SET[info.name]) && T(SET[info.name]).id === SET[info.name] ? SET[info.name] : TEAMS[3 % TEAMS.length].id;
  const b = T(base), ids = roster(info, myTid);
  if (ids.length < 12) return null;
  SZ_REG[id] = { id: id, abbr: info.name.split(' ').map(w => w[0]).join('').slice(0, 3), name: info.name, full: info.name + ' (CPU)', city: '', lg: 'CPU', era: 'CPU', c1: b.c1, c2: b.c2, icon: b.icon, coach: 'CPU', coachNote: 'LOCKER LEAGUE BOT', off: 4, def: 4, roster: ids, sz: true, szBase: base, boost: {}, nums: {}, szLu: null, mine: false, ct33: 'pro', rk15bot: info.name };
  if (b.acc16) SZ_REG[id].acc16 = b.acc16;
  return id;
 }
 let prevKey = '';
 B.previewTid = function (info) { const k = info.name + '|' + info.seed; if (k !== prevKey || !SZ_REG.RK15BOTP) { prevKey = k; build('RK15BOTP', info, (Wn.RK15LL && RK15LL.store.tid) || null); } return SZ_REG.RK15BOTP ? 'RK15BOTP' : null; };
 B.make = function (info, myTid) {
  if (off()) return null;
  try { const id = build('RK15BOT', info, myTid); B.last = { info: info, id: id }; return id; } catch (e) { B.err = String(e); return null; }
 };
 B.clear = function () { delete SZ_REG.RK15BOT; delete SZ_REG.RK15BOTP; prevKey = ''; };
 // difficulty + the 3 GOOD AI steps, only for a Locker League bot game
 const saved = {};
 function diffFor(info) { if (info.diff !== 'GOOD') return 2; const ix = RK15.TIERS.findIndex(t => t.n === info.tier); return Math.max(3, Math.min(5, ix < 0 ? 3 : ix)); }
 function apply(G) {
  const m = G && G.meta && G.meta.ll15; if (!m || G.__rk15bot) return; G.__rk15bot = 1;
  const info = B.last && B.last.info || { diff: m.diff };
  const good = info.diff === 'GOOD' || !Wn.__rl_no594nasty; // 1.5e: every online game is NASTY with the full AI - this interval used to drop a MEDIUM bot to BEGINNER (Charlie: 'BEGINNER online', no fakes)
  const flags = { __rl_no448ai: !good || !!Wn.__rl_no590ai1, __rl_no36aioff: !good || !!Wn.__rl_no590ai2, __rl_no452hard: !good || !!Wn.__rl_no590ai3 };
  for (const k in flags) { if (!(k in saved)) saved[k] = Wn[k]; if (flags[k]) Wn[k] = true; }
  try { const d = Wn.__rl_no594nasty ? diffFor(info) : 4; G.diff = d; SETTINGS.diff = d; if (typeof applyDiff === 'function') applyDiff(); } catch (e) {}
 }
 function restore() { for (const k in saved) { Wn[k] = saved[k]; delete saved[k]; } }
 setInterval(() => { try { const G = (typeof game !== "undefined" ? game : null); if (G && G.meta && G.meta.ll15) apply(G); else if (Object.keys(saved).length) restore(); } catch (e) {} }, 250);
})();
