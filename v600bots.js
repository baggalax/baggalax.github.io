/* v600bots.js - Bagga Lax 1.5f: five NEW Locker League CPU bot teams
 * Ask (Charlie): WATER MOCS (red / white / teal), YELLOW JACKETS (blue + yellow, coach VAN, crew ALEX TINDALL, cards
 *   Charlie McGuire, Luke McKinney, Maddox, Chase, Van, Trey), TEAM 92 (pink / teal / white), + two of our own:
 *   PUMPKIN PATCH (orange / black, a Halloween cousin of the ghosts) and FROSTBITE (ice blue / navy / white, a winter
 *   cousin of the Turkey Trotters). Each has a crew card, kits, a tier and a difficulty.
 * How: v590bot builds every bot as the temporary card team RK15BOT from a NAME. Each new name maps to an EXISTING
 *   uniform set by id (team set + kit number; away = that set's WHITE), through UNI21X (same hook as the other bot teams).
 *   Yellow Jackets' roster puts the six real cards in (EGG-0, -1, -2, -4, -5, -6); the rest is the seeded random fill.
 *   Not listed in the locker. Server: the five names go in RK15_BOTS (server change list).
 * Kill switch: window.__rl_no600bots
 */
(function () {
 const Wn = window;
 if (Wn.__rl_no600bots || !Wn.RK15BOT) return;
 const B = Wn.RK15BOT;
 // 1.5f (Charlie): EXISTING uniform sets only, mapped by uniform id = (team set, kit number). No custom kits.
 const D = {
  'WATER MOCS':     { base: 'WHP',  k: 3, abbr: 'WMC', diff: 'MEDIUM', tier: 'FISH' },        // Baltimore ALL ALT: red, teal trim (away: Baltimore WHITE)
  'YELLOW JACKETS': { base: 'WSWE', k: 0, abbr: 'YJK', diff: 'GOOD',   tier: 'GROSS',          // Sweden BASIC: blue + yellow
                      coach: 'COACH VAN', crew: 'crew_oc_1', cards: ['EGG-0', 'EGG-1', 'EGG-2', 'EGG-4', 'EGG-5', 'EGG-6'] },
  'TEAM 92':        { base: 'WHP',  k: 0, abbr: 'T92', diff: 'MEDIUM', tier: 'DIRTY' },       // Baltimore BASIC: teal + white (no pink set exists)
  'PUMPKIN PATCH':  { base: 'HAM',  k: 3, abbr: 'PMP', diff: 'GOOD',   tier: 'NASTY' },       // Hamilton ALL ALT: orange + black
  'FROSTBITE':      { base: 'ATL',  k: 0, abbr: 'FRB', diff: 'GOOD',   tier: 'BAGGATWAAN' }   // Pennsylvania BASIC: light blue + navy
 };
 B.NEW600 = D; B.crew600 = {};
 for (const n in D) { B.SET[n] = D[n].base; if (B.NAMES.indexOf(n) < 0) B.NAMES.push(n); if (D[n].crew) B.crew600[n] = D[n].crew; }
 const defOf = tid => { const t = tid && SZ_REG[tid]; return t && t.bot600 ? D[t.bot600] : null; };
 function dress(id, info) {
  const t = SZ_REG[id], d = info && D[info.name]; if (!t) return;
  if (!d) { delete t.bot600; return; }
  t.bot600 = info.name; t.abbr = d.abbr; try { const kk = UNI21.kitOf(d.base, d.k); t.c1 = kk.jersey; t.c2 = kk.trim; } catch (e) {}
  if (d.coach) { t.coach = d.coach; t.coachNote = 'LOCKER LEAGUE BOT'; }
  if (d.cards) { // the real cards in, same positions replaced first, the seeded rest stays
   const r = t.roster.slice(), want = d.cards.filter(c => typeof PLAYERS !== 'undefined' && PLAYERS[c]);
   want.forEach(c => { if (r.indexOf(c) >= 0) return; const pos = PLAYERS[c].pos; let i = r.findIndex(x => PLAYERS[x] && PLAYERS[x].pos === pos && want.indexOf(x) < 0); if (i < 0) i = r.findIndex(x => PLAYERS[x] && PLAYERS[x].pos !== 'G' && want.indexOf(x) < 0); if (i >= 0) r[i] = c; else r.push(c); });
   t.roster = r;
  }
 }
 const mk0 = B.make; B.make = function (info) { const r = mk0.apply(this, arguments); try { if (r) dress(r, info); } catch (e) {} return r; };
 const pv0 = B.previewTid; B.previewTid = function (info) { const r = pv0.apply(this, arguments); try { if (r && (SZ_REG[r].bot600 || null) !== (D[info && info.name] ? info.name : null)) dress(r, info); } catch (e) {} return r; };
 const li0 = B.localInfo; B.localInfo = function () { const o = li0.apply(this, arguments); try { if (D[o.name]) o.diff = D[o.name].diff === 'GOOD' || o.diff === 'GOOD' ? 'GOOD' : 'MEDIUM'; } catch (e) {} return o; };
 // uniforms through the normal uniform system (UNI21X: nK / okK / styN / kitOf)
 const prevX = Wn.UNI21X;
 Wn.UNI21X = Object.assign({}, prevX || {}, {
  own: tid => !!defOf(tid) || !!(prevX && prevX.own && prevX.own(tid)),
  nK: tid => defOf(tid) ? 2 : prevX && prevX.nK ? prevX.nK(tid) : 2,
  okK: (tid, k) => defOf(tid) ? (k | 0) >= 0 && (k | 0) < 2 : prevX && prevX.okK ? prevX.okK(tid, k) : true,
  styN: (tid, k) => defOf(tid) ? (UNI21.styN ? UNI21.styN(defOf(tid).base, (k | 0) === 1 ? 1 : defOf(tid).k) : 'BASIC') : prevX && prevX.styN ? prevX.styN(tid, k) : 'BASIC',
  kitOf: (tid, k) => { const d = defOf(tid); if (d) { const kk = UNI21.kitOf(d.base, (k | 0) === 1 ? 1 : d.k); if (kk) { kk.k21 = k | 0; return kk; } } return prevX && prevX.kitOf ? prevX.kitOf(tid, k) : null; }, // an existing set's kit, by uniform id
  lockerTeams: () => prevX && prevX.lockerTeams ? prevX.lockerTeams() : [], // not in the locker (Charlie)
  icon: (it, sil) => prevX && prevX.icon ? prevX.icon(it, sil) : null
 });
})();
