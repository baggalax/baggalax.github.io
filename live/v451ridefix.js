/* v451ridefix.js - CPU ride: their D stay on your attack (Nov 8). Kill switch: window.__rl_no451ride = true.
 * Bug (Charlie, Nov 8, Baggatwaan): "was clearing and all my attack were open bc the d just stayed at the midline".
 * Cause: v420c (Nov 3) CPU ride sets. While you clear (your goalie / D has it after a save, a wide shot or a turnover),
 * v420c moves every CPU rider to its drawn ride spot. The three CPU close D get spots at MIDX+30..46, i.e. right on
 * the midline (3-3 ZONE, LAY OFF, SHUT OFF THE OUTLET), and the MAN RIDE only pairs a D with a man within 150 px of
 * that spot, so it usually never reaches your attackmen. Your three attackmen sit ~150-190 px deeper, wide open.
 * Not tied to difficulty: every tier (and the website) has it; the 10-MAN RIDE (goalie comes out) did not use it.
 * Fix: on frames where v420c overrides a CPU close D in a ride, that D instead picks up one of your attackmen
 * (man, goal side, shaded to the ball) - the D never leaves its own half, so 4 back (3 D + goalie) still holds and
 * offside is unchanged. The ride's attack + middie spots (the ride the CPU picked) are untouched.
 * Online, tutorial, BRAVEHEART: unchanged (v420c never runs there).
 * (2) Your LOCK OFF (v411l, Playbook > LOCK OFF) guard (sub-switch window.__rl_no451lock = true): the lock-off
 * defender OWNS his man. Every frame on your D, before and after the game moves your guys, any other one of your
 * defenders still marked on the locked man is handed the lock guy's old man (or whoever is left unmarked), so every
 * one of their guys keeps exactly one of yours. v411l only swapped when the lock guy's own mark was wrong. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v451_loaded) return;
 W.__rl_v451_loaded = 1;
 const LOG = W.V451R = { n: 0, frames: 0, errs: 0, err: null };
 const off = () => !!W.__rl_no451ride;
 if (typeof W.farTick !== 'function') return;
 const hyp = Math.hypot;
 const okG = G => !!G && !G.tutorial && !G.online && !(G.meta && G.meta.online) && !G.brave && !W.__rl_v124gb;
 function rideOn(G) {
  const V = W.V420C;
  if (!V || !V.on || typeof V.ovrOf !== 'function' || typeof V.ctx !== 'function') return false;
  if (W.__rl_no420c || W.__rl_no420cc) return false;
  const R = G.cr420;
  return !!R && !R.done && R.kind !== 'ten' && V.ctx() === 'ride';
 }
 // pair each CPU close D with one of your attackmen (keeps last frame's pick, then his far-pair man, then nearest)
 function pairs(G, ds, atk) {
  const out = new Map(), used = new Set();
  for (const d of ds) { const m = d.m451; if (m && atk.includes(m) && !used.has(m)) { out.set(d, m); used.add(m); } }
  for (const d of ds) { if (out.has(d)) continue; const m = d.mk; if (m && atk.includes(m) && !used.has(m)) { out.set(d, m); used.add(m); } }
  const rest = [];
  for (const d of ds) if (!out.has(d)) for (const m of atk) if (!used.has(m)) rest.push([ hyp(d.x - m.x, d.y - m.y), d, m ]);
  rest.sort((a, b) => a[0] - b[0]);
  for (const [, d, m] of rest) { if (out.has(d) || used.has(m)) continue; out.set(d, m); used.add(m); }
  for (const d of ds) d.m451 = out.get(d) || null;
  return out;
 }
 const o = W.farTick;
 W.farTick = function (dt) {
  let pre = null, G = null;
  try {
   G = typeof game !== 'undefined' ? game : null;
   if (!off() && okG(G) && G.farU && G.farC && dt > 0 && typeof screen !== 'undefined' && screen === 'defense' && rideOn(G)) {
    const ds = G.farC.filter(f => f.role === 'D' && !(f.down > 0));
    if (ds.length) { pre = new Map(); for (const f of ds) pre.set(f, [ f.x, f.y ]); }
   }
  } catch (e) { pre = null; LOG.errs++; LOG.err = String(e && e.message || e).slice(0, 160); }
  const r = o.apply(this, arguments);
  if (!pre) return r;
  try {
   const V = W.V420C, b = G.ball;
   const ds = [ ...pre.keys() ].filter(f => { const q = V.ovrOf(f); return q && q[3] <= 1; });
   const atk = (G.farU || []).filter(f => (f.role === 'A' || f.role === 'R') && f.x > MIDX && !(f.down > 0));
   if (!ds.length || !atk.length || !b) return r;
   const P = pairs(G, ds, atk);
   LOG.frames++;
   for (const [f, m] of P) {
    const p0 = pre.get(f);
    // goal side (their cage is GX), a step toward the middle, shaded a little to the ball
    let tx = m.x + 10, ty = m.y + (CY - m.y) * .1 + (b.y - m.y) * .06;
    tx = Math.max(tx, MIDX + 6);
    const dx = tx - p0[0], dy = ty - p0[1], d = hyp(dx, dy), spd = d > 24 ? 44 : 34, s = Math.min(d, spd * dt);
    f.x = d > .3 ? p0[0] + dx / d * s : p0[0];
    f.y = d > .3 ? p0[1] + dy / d * s : p0[1];
    f.x = Math.max(f.x, MIDX + 4);
    f.y = Math.max(FT + 12, Math.min(FB - 2, f.y));
    f.anim = (f.anim || 0) + s;
    LOG.n++;
   }
  } catch (e) { LOG.errs++; LOG.err = String(e && e.message || e).slice(0, 160); }
  return r;
 };
 // ---------------- (2) lock-off: one defender per man ----------------
 const LK = W.V451L = { fix: 0, frames: 0, errs: 0, err: null };
 const offL = () => off() || !!W.__rl_no451lock || !!W.__rl_no411l;
 function fixMarks(G) {
  const V = W.V411L;
  if (!V || !V.on || typeof V.resolve !== 'function') return;
  const P = V.resolve(G);
  if (!P.length) return;
  LK.frames++;
  const def = G.players.filter(p => p.team === 'O' && !p.gk);
  const atk = G.players.filter(p => p.team === 'D' && !p.gk);
  const lockD = new Set(P.map(q => q.d));
  for (const { d, a: m } of P) {
   for (const q of def) {
    if (q === d || q.mark !== m) continue;
    // hand him the lock guy's old man if that man is free, else whoever of theirs nobody has
    const old = d.m451old && d.m451old !== m && G.players.includes(d.m451old) && !def.some(z => z !== q && z.mark === d.m451old) ? d.m451old : null;
    const free = old || atk.find(a => !def.some(z => z.mark === a)) || null;
    q.mark = free;
    if (!free) LK.nofree = (LK.nofree || 0) + 1;
    if (free) free.mark0 = q;
    LK.fix++;
   }
   if (d.mark !== m) { if (d.mark) d.m451old = d.mark; d.mark = m; }
   m.mark0 = d;
  }
  // even strength: nobody of theirs left without a man of yours (a guy we moved off the locked man picks one up)
  if (def.length === atk.length) {
   const U = atk.filter(a => !def.some(z => z.mark === a));
   if (U.length) {
    const N = def.filter(q => !lockD.has(q) && (!q.mark || !G.players.includes(q.mark) || def.some(z => z !== q && z.mark === q.mark && lockD.has(z))));
    for (const q of N) {
     if (!U.length) break;
     U.sort((u, v) => hyp(u.x - q.x, u.y - q.y) - hyp(v.x - q.x, v.y - q.y));
     const a = U.shift(); q.mark = a; a.mark0 = q; LK.fill = (LK.fill || 0) + 1;
    }
   }
  }
 }
 if (typeof W.updateDefense === 'function') {
  const oD = W.updateDefense;
  W.updateDefense = function () {
   let G = null;
   try {
    G = typeof game !== 'undefined' ? game : null;
    if (!offL() && okG(G) && G.players && typeof screen !== 'undefined' && screen === 'defense') {
     // remember each lock guy's man before v411l swaps (so the guy who drew the locked man gets the lock guy's man)
     const V = W.V411L;
     if (V && V.resolve) for (const { d, a: m } of V.resolve(G)) if (d.mark && d.mark !== m) d.m451old = d.mark;
     fixMarks(G);
    } else G = null;
   } catch (e) { G = null; LK.errs++; LK.err = String(e && e.message || e).slice(0, 160); }
   const r = oD.apply(this, arguments);
   if (G) try { if (screen === 'defense' && G.players) fixMarks(G); } catch (e) { LK.errs++; LK.err = String(e && e.message || e).slice(0, 160); }
   return r;
  };
 }
})();
