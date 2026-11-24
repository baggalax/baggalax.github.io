/* v595na.js - Bagga Lax 1.5c: N/A TEAM CARDS BACK IN LINE (Charlie, TestFlight 3)
 * Bug: Charlie's best card came from the TURKEY TROTTERS pack. N/A sets are novelty cards and must not be the best in the game.
 * Cause: each N/A set builds its players' skills from a base + per-player bumps; nothing keeps the result in the normal range:
 *   normal cards  median 71, 90th pct 82, top 95
 *   TURKEY TROTTERS median 77, top 97 (best in the game)   GHOSTS median 89, top 95   VETERANS (6 sets) median 83, top 88-90
 *   GOOD STICK median 72, top 88. (Card rarity is read from OVR: RARE >= 78, LEGENDARY >= 88, so these were mostly LEGENDARY.)
 * Fix: at load, after the sets are built, every N/A set is recentred on the normal median (72). Its best 2 players become 89 / 88
 *   (LEGENDARY, never 90+), the rest above the median spread up to 86, below the median squeezed x0.75.
 *   Any card that was LEGENDARY before (old OVR >= 88) stays LEGENDARY at 89 - rarity is read from OVR live, never saved per copy. The order inside a set stays the same. It works by shifting each
 *   player's skills (OVR is computed from skills at render time), so cards players already own follow automatically.
 *   No card ids, no rl_ keys, no saved data touched.
 * GHOSTS are left out completely (Charlie): their original OVRs (83 / 89 / 95, 90+ allowed) are untouched.
 * Kill switch: window.__rl_no595na (before load). Report: window.V595NA (before/after per set).
 */
(function () {
 const Wn = window;
 if (Wn.__rl_no595na || typeof PLAYERS === 'undefined' || typeof ovrOf !== 'function' || typeof SKILLS === 'undefined') return;
 const MED = 72, K = .75, CAP = 89, TOP = [89, 88], NEXT = 86, FLOOR = 50, LEG = 88; // LEG = cards22 RAR22.leg // Charlie: legendary allowed, never 90+; only the best 2 per set reach 88-89
 const REP = Wn.V595NA = { sets: {} };
 function setOf(p, id) {
  if (!p || p.leg) return null;
  if (p.tk565) return 'TKT';
  const t = p.team || String(id).split('-')[0];
  if (p.gho16 || t === 'GHO') return null; // Charlie: GHOSTS stay exactly as they were (no rescale, no cap)
  if (/^VT(ARM|NAV|AF|MAR|CG|SF)$/.test(t)) return t;
  if (t === 'GSC') return 'GSC';
  return null;
 }
 const med = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
 function run() {
  const by = {};
  for (const id in PLAYERS) { const p = PLAYERS[id], s = setOf(p, id); if (s && p.r && p.ovr) (by[s] = by[s] || []).push(p); }
  for (const s in by) {
   const L = by[s], o0 = L.map(p => p.ovr), m = med(o0), rank = L.slice().sort((a, b) => b.ovr - a.ovr), third = rank[2] ? rank[2].ovr : m;
   L.forEach(p => {
    if (p.__na595) return;
    const ri = rank.indexOf(p);
    let want = p.ovr >= LEG ? CAP // Charlie: a card that was LEGENDARY stays LEGENDARY (by card id: same player id, same data) at 89
     : ri < TOP.length ? TOP[ri] // the set's best two: legendary (88+), never 90
     : p.ovr > m ? MED + (p.ovr - m) * (NEXT - MED) / Math.max(1, third - m) // the rest above the median: up to 86
     : MED + (p.ovr - m) * K; // below the median: as before
    want = Math.max(FLOOR, Math.min(CAP, Math.round(want)));
    for (let it = 0; it < 3; it++) { const d = want - ovrOf(p); if (!d) break; for (const k of SKILLS) if (p.r[k] != null) p.r[k] = Math.max(20, Math.min(99, p.r[k] + d)); }
    p.ovr = ovrOf(p); p.__na595 = 1;
   });
   const o1 = L.map(p => p.ovr);
   REP.sets[s] = { n: L.length, before: [Math.min(...o0), m, Math.max(...o0)], after: [Math.min(...o1), med(o1), Math.max(...o1)] };
  }
 }
 try { run(); } catch (e) { REP.err = String(e); }
 // sets that register later (switched on from the admin) get the same treatment
 let n0 = Object.keys(PLAYERS).length;
 setInterval(() => { try { const n = Object.keys(PLAYERS).length; if (n !== n0) { n0 = n; run(); } } catch (e) {} }, 2000);
})();
