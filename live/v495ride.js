/* v495ride.js - Bagga Lax 1.2: "no defense on my clear and they just like appeared spawning in at midline" (kill switch: window.__rl_no495ride = true).
 * Charlie (Nov 10, beta site): a normal clear, he carried it up his side and passed to a teammate still on his side near midline;
 * the CPU riders were gone, then "they were running on from far side" at midline.
 * Root cause (reproduced headless, 3 of 3 outlet passes): a pass to a FAR teammate during your clear (one of your guys the
 * game keeps on the far list: a pole or a middie who stayed back, the edge-arrow mates) is caught through game.js L7497
 * liveClear(b.to, 'OUTLET'), which rebuilds the whole clear around the receiver. That rebuild carries the CPU's near players
 * (riders or back), its far D (role D) and far middies (role M) into the new lists, but NOT the CPU riders that were already on
 * the far list (role A / R - the three attackmen riding you). They are simply dropped (G.farC is rebuilt without them,
 * game.js ~L20148-20159), so the CPU is 3 men short on your clear. 0.2 s later v440md's 10-on-field safety net sees the short
 * team and re-adds them one by one at its fixed entry spot on the FAR sideline at midline (v440md BOX: MIDX-6, FT+12),
 * from where they run back in: exactly "running on from far side". Not one of today's files (v473safe / v487dg2 / v488oob
 * do not touch this; same result with each switched off).
 * Fix: after a liveClear rebuild, any CPU rider that was on the far list before and is now on neither list goes back on the
 * far list as the same object (same spot, same rest spot, mark re-paired), so nobody vanishes, nobody pops in, no extra
 * man ever (capped at the CPU's legal count). Offline only; ids, rl_* keys, __rl_* flags and the net protocol unchanged.
 * Telemetry: window.V495 { kept, calls, errs }.
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v495_loaded) return;
 W0.__rl_v495_loaded = 1;
 const LOG = W0.V495 = { calls: 0, kept: 0, last: null, errs: 0, err: [] };
 const off = () => !!W0.__rl_no495ride || !!W0.__rl_v124gb;
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const okG = G => !!G && !!G.players && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !G.brave;
 const idOf = x => x && x.pl && x.pl.id != null ? String(x.pl.id) : null;
 const isGk = p => !!(p.gk || p.team === 'G' || p.role === 'G');
 const LC0 = W0.liveClear;
 if (typeof LC0 !== 'function') { LOG.why = 'no liveClear'; return; }
 W0.liveClear = function (p, why) {
  const G = G_();
  let riders = null;
  try {
   if (!off() && okG(G) && G.farC) riders = G.farC.filter(f => f && f.far && (f.role === 'A' || f.role === 'R') && idOf(f));
  } catch (e) { riders = null; }
  const r = LC0.apply(this, arguments);
  try {
   if (r && riders && riders.length && game === G && G.players && G.farC) {
    LOG.calls++;
    const on = new Set;
    for (const q of G.players) if (q.team === 'D' || q.team === 'G') { const id = idOf(q); if (id) on.add(id); }
    for (const f of G.farC) { const id = idOf(f); if (id) on.add(id); }
    const pen = G.pen && G.pen.side === 'C' && !G.penPending ? 1 : 0;
    const count = () => G.players.filter(q => q.team === 'D' && !isGk(q)).length + G.farC.filter(f => !isGk(f)).length;
    let n = 0;
    for (const f of riders) {
     const id = idOf(f);
     if (on.has(id) || count() >= 9 - pen) continue;
     if (G.pen && G.pen.side === 'C' && G.pen.who && String(G.pen.who.id) === id) continue;   // the man in the box stays there
     f.mk = null;
     f.chase = false;
     G.farC.push(f);
     on.add(id);
     n++;
    }
    if (n) {
     try { farPair(G); } catch (e) {}
     LOG.kept += n;
     LOG.last = { n: n, why: why || '', t: +(+G.t || 0).toFixed(2), scr: screen };
    }
   }
  } catch (e) { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(String(e && e.message || e)); }
  return r;
 };
})();
