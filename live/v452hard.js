// V40.5.2 - BAGGATWAAN / NASTY / GROSS: a much stronger CPU (v452hard.js), layered on top of v448ai.js.
// Charlie (Nov 8, 1:08 PM, TestFlight 1.1): "Just won a world games on hardest mode 14-3 lol that's what i mean by not
//  good enough d/O on the cpu in the harder modes" (that game was vs CANADA). v448ai was tuned against a weak scripted
//  bot; against a bot that plays like a good human (dodges, feeds the crease, snipes far corners, spams checks) the
//  1.1 CPU loses every game on all three hard tiers. Measured holes, each fixed below, every number per tier:
//  1) GOALIE: user corner shots went in ~60% from ANY distance and even with a stick in his face, tap-ins ~77% even
//     when covered. Now outside / contested looks get saved a lot more; an open look in close still goes in.
//  2) OFF-BALL D: a pass to the crease found a man with nobody within 15-20 ft. Now the D denies the dangerous guys
//     (near the cage) tight and goal side, and a covered feed into the crease gets knocked away more often.
//  3) BALL SECURITY: one landed check in the middle strips their carrier (game rule), and a human checks a lot -
//     ~29 strips a game. Their carriers now protect it better and move it when you're on them.
//  4) THEIR CHECKS on your carrier: more often, from a bit farther (legal checks - same strip rules as always).
//  5) FACEOFFS + GROUND BALLS: their FOGO and their scoopers react faster.
// SQUID / FISH / BEGINNER: untouched (no code path here runs there, no extra random numbers are drawn).
// Not in online games, tutorial, practice or brave mode. Kill switch: window.__rl_no452hard = true -> exactly 1.1.
(function() {
 'use strict';
 const ST = { gkOwn: 0, gkTry: 0, deny: 0, feedCut: 0, chkScale: 0, landScale: 0, popPass: 0, fo: 0, gb: 0, errs: [] };
 const V = window.V452 = { on: false, ST: ST };
 const OFF = () => !!(window.__rl_no452hard || window.__rl_v124gb);
 if (OFF()) return;
 const need = [ 'updateLive', 'catchOdds', 'off110Decide', 'dCheck', 'startFaceoff', 'H2on', 'dPassTo', 'open110', 'popLoose', 'dPopLoose' ];
 for (const n of need) if (typeof window[n] !== 'function') return;
 V.on = true;
 const err = (e, w) => { try { if (ST.errs.length < 8) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v452hard', w, e); } } catch (x) {} };
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const hyp = Math.hypot;
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 // per tier: [GROSS, NASTY, BAGGATWAAN]
 const K = V.K = {
  gk: [ 0.85, 0.9, 0.75 ],            // scale on every extra-save chance below
  svFar: [ [ 34, 0 ], [ 42, .14 ], [ 50, .3 ], [ 999, .45 ] ], // corner shot: distance band -> extra save chance (x gk)
  svCont: [ [ 4, .3 ], [ 7, .2 ], [ 10, .1 ] ],               // stick in his face at the release: + this (x gk)
  svTap: [ [ 4, .45 ], [ 7, .36 ], [ 12, .22 ], [ 16, .12 ], [ 99, .04 ] ],  // tap-in: nearest D at the release -> extra save chance (x gk)
  denyR: [ 60, 62, 62 ],         // your off-ball men this close to the cage get denied
  denyD: [ 6.2, 6, 6 ],      // ... from this far (game: sags 9-16 toward the hole)
  denyCrease: [ 4.4, 4.2, 4.2 ],   // ... and a man on the crease from this far
  denySpd: [ 1.02, 1.08, 1.14 ], // x PACE.dBall
  feedR: [ 14, 16, 18 ],         // a covered catch near the cage: a D stick within this
  feedK: [ 0.82, 0.8, 0.8 ],       // ... multiplies the catch chance by this (wide-open guys untouched)
  chkEvery: [ 0.87, 0.85, 0.85 ],    // their check timer x this (more checks on your carrier)
  chk: [ 1.09, 1.1, 1.1 ],      // their check land chance x this
  uLand: [ 0.74, 0.68, 0.68 ],       // YOUR check land / strip chance on their carrier x this
  popPassR: [ 9, 10, 11 ],       // your defender this close (or he just landed one) -> their carrier moves it
  popPassP: [ 0.65, 0.75, 0.75 ],
  foRate: [ 1.08, 1.12, 1.14 ],  // their FOGO tap rate x this
  foReact: [ 0.86, 0.82, 0.8 ],     // their FOGO reaction time x this
  zoneR: [ 22, 28, 20 ],        // zone / man-down: a man this close to the crease (CREASE + this) gets picked up
  gbR: [ 0.72, 0.65, 0.6 ]          // their ground-ball reaction x this
 };
 function tier() {
  try { const l = DF && DF.level; return l === 3 ? 0 : l === 4 ? 1 : l === 5 ? 2 : -1; } catch (e) { return -1; }
 }
 function okG(G) {
  return !!G && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !G.practice && !G.brave && !(window.RLNET && RLNET.inGame) && !OFF();
 }
 const band = (tab, v) => { for (const [lim, p] of tab) if (v < lim) return p; return 0; };
 const ndD = (x, y) => { let n = 99; for (const d of game.players) if (d.team === 'D' && !d.gk && d.role !== 'G' && !(d.down > 0) && !(d.stun > 0)) n = Math.min(n, hyp(d.x - x, d.y - y)); return n; };
 // ================= 1) the goalie on YOUR shots =================
 function shotCheck(G, k) {
  const b = G.ball;
  if (!b || b.state !== 'shot' || b.v452 || !b.shooter || b.shooter.team !== 'O') return;
  b.v452 = true;
  const s = b.s25, c = b.shooter;
  if (!s || s.own || b.pipe || b.block) return;
  const sx = b.shotFrom ? b.shotFrom[0] : c.x, sy = b.shotFrom ? b.shotFrom[1] : c.y;
  const dg = hyp(GX - c.x, CY - c.y), nd = ndD(c.x, c.y);
  let p;
  if (s.type === 'TAP-IN') p = band(K.svTap, nd);
  else p = band(K.svFar, dg) + band(K.svCont, nd);
  p = cl(p * K.gk[k], 0, .8);
  ST.gkTry++;
  if (p > 0 && Math.random() < p) { s.own = true; ST.gkOwn++; }
 }
 // ================= 2) off-ball deny + covered feeds =================
 let inLive = false, did = false;
 function denyTick(G, k) {
  const c = G.carrier, b = G.ball;
  if (!c || c.team !== 'O' || !b || (b.state !== 'held' && b.state !== 'pass') || G.clearing || G.cpuClear || G.fb222) return;
  const dl = G.players.filter(d => d.team === 'D' && !d.gk), ol = G.players.filter(d => d.team === 'O' && !d.gk);
  const bx = b.state === 'pass' && b.to ? b.to.x : c.x, by = b.state === 'pass' && b.to ? b.to.y : c.y;
  if (G.cpuDef === 'zone' || G.zoneD || dl.length !== ol.length || G.pen) { zoneCrease(G, k, c, dl, ol, bx, by); return; }
  for (const p of dl) {
   if (p.down > 0 || p.stun > 0 || p.react > 0 || p === G.slide || G.rot && G.rot.d === p || p.coverT > 0) continue;
   const m = typeof markOf === 'function' ? markOf(p) : p.mark;
   if (!m || m === c || m.team !== 'O' || m.down > 0) continue;
   if (b.state === 'pass' && b.to === m) continue; // the game already sprints him at the catch
   const dm = hyp(m.x - GX, m.y - CY);
   if (dm > K.denyR[k] || m.x > GX + 14) continue;
   const dn = dm < CREASE + 18 ? K.denyCrease[k] : K.denyD[k];
   denyAt(p, m, bx, by, dn, k); // between his man and the ball, shaded to the cage
  }
 }
 function denyAt(p, m, bx, by, dn, k) {
  let ux = bx - m.x, uy = by - m.y; const L1 = hyp(ux, uy) || 1; ux /= L1; uy /= L1;
  let gx = GX - m.x, gy = CY - m.y; const L2 = hyp(gx, gy) || 1; gx /= L2; gy /= L2;
  let vx = ux * .55 + gx * .45, vy = uy * .55 + gy * .45; const L3 = hyp(vx, vy) || 1; vx /= L3; vy /= L3;
  p.tx = m.x + vx * dn; p.ty = m.y + vy * dn;
  p.spd = Math.max(p.spd || 0, PACE.dBall * K.denySpd[k]);
  ST.deny++;
 }
 // zone / man-down: the zone stays, but a man on the crease gets picked up by the closest guy not on the ball
 function zoneCrease(G, k, c, dl, ol, bx, by) {
  const used = new Set;
  let onBall = null, bd = 1e9; for (const d of dl) { const q = hyp(d.x - c.x, d.y - c.y); if (q < bd) { bd = q; onBall = d; } }
  if (onBall) used.add(onBall);
  if (G.slide) used.add(G.slide);
  const crease = ol.filter(m => m !== c && !(m.down > 0) && m.x < GX + 14 && hyp(m.x - GX, m.y - CY) < CREASE + K.zoneR[k]).sort((a, b) => hyp(a.x - GX, a.y - CY) - hyp(b.x - GX, b.y - CY));
  for (const m of crease) {
   let best = null, md = 1e9;
   for (const d of dl) { if (used.has(d) || d.down > 0 || d.stun > 0 || d.react > 0) continue; const q = hyp(d.x - m.x, d.y - m.y); if (q < md) { md = q; best = d; } }
   if (!best || md > 50) continue;
   used.add(best); ST.zoneCrease = (ST.zoneCrease || 0) + 1;
   denyAt(best, m, bx, by, K.denyCrease[k] + 1, k);
  }
 }
 const H0 = window.H2on;
 window.H2on = function() {
  const r = H0.apply(this, arguments);
  if (inLive && !did) { did = true; try { const G = G0(), k = tier(); if (k >= 0 && okG(G)) denyTick(G, k); } catch (e) { err(e, 'deny'); } }
  return r;
 };
 const CO0 = window.catchOdds;
 window.catchOdds = function(p, defTeam) {
  const o = CO0.apply(this, arguments);
  try {
   const k = tier(), G = G0();
   if (k < 0 || defTeam !== 'D' || !okG(G) || SCR() !== 'live' || !o || !p || p.team !== 'O') return o;
   if (hyp(p.x - GX, p.y - CY) > K.denyR[k]) return o;
   const nd = ndD(p.x, p.y);
   if (nd >= K.feedR[k]) return o;
   const f = 1 - (1 - K.feedK[k]) * cl((K.feedR[k] - nd) / (K.feedR[k] - 6), 0, 1);
   ST.feedCut++;
   return Object.assign({}, o, { p: o.p * f, f452: +f.toFixed(3) });
  } catch (e) { err(e, 'feed'); return o; }
 };
 // ================= 4) their checks on your carrier (inside your possession frames) =================
 const L0 = window.updateLive;
 window.updateLive = function(dt) {
  const G = G0(), k = tier();
  if (k < 0 || !okG(G) || SCR() !== 'live') return L0.apply(this, arguments);
  try { shotCheck(G, k); } catch (e) { err(e, 'shot'); }
  const ce = DF.chkEvery, ck = DF.chk;
  DF.chkEvery = (ce || 1) * K.chkEvery[k]; DF.chk = (ck || 1) * K.chk[k];
  inLive = true; did = false;
  try { return L0.apply(this, arguments); }
  finally { inLive = false; DF.chkEvery = ce; DF.chk = ck; }
 };
 // ================= 3) their ball security on YOUR checks =================
 const DC0 = window.dCheck;
 window.dCheck = function() {
  const G = G0(), k = tier();
  if (k < 0 || !okG(G) || SCR() !== 'defense') return DC0.apply(this, arguments);
  const ul = DF.uLand; DF.uLand = (ul || 1) * K.uLand[k]; ST.landScale++;
  let r;
  try { r = DC0.apply(this, arguments); } finally { DF.uLand = ul; }
  try { if (r === 'land' && G.dcar) G.v452hot = G.t; } catch (e) {}
  return r;
 };
 const OD0 = window.off110Decide;
 window.off110Decide = function(G, c, atk, def, dGoal, pres, onb, ond) {
  const k = tier();
  try {
   if (k >= 0 && okG(G) && SCR() === 'defense' && c && atk && def && G.ball && G.ball.state === 'held' && G.dcar === c && !(G.dBeat > 0)) {
    const me = G.dctl, dm = me && !(me.down > 0) ? hyp(me.x - c.x, me.y - c.y) : 99;
    const hot = G.v452hot != null && G.t - G.v452hot < 1.2 && G.chk && G.chk.who === c;
    const inside = dGoal < 34 && c.x > DGX + 4;
    if ((hot || dm < K.popPassR[k]) && !inside && Math.random() < K.popPassP[k]) {
     let best = null;
     for (const a of atk) {
      if (a === c || a.down > 0 || a.gk || a.x < DGX + 4 && a.x < c.x) continue;
      const o = open110(G, a, def, c), L = hyp(a.x - c.x, a.y - c.y);
      if (!o.lane || o.md < 9 || L < 12 || L > 120) continue;
      const s = Math.min(o.md, 22) - hyp(a.x - DGX, a.y - CY) * .06;
      if (!best || s > best.s) best = { a: a, s: s };
     }
     if (best) { ST.popPass++; dPassTo(c, best.a); G.dHeld = 0; G.v452hot = null; return true; }
    }
   }
  } catch (e) { err(e, 'pop'); }
  return OD0.apply(this, arguments);
 };
 // ================= 5) faceoffs + ground balls =================
 const SF0 = window.startFaceoff;
 window.startFaceoff = function() {
  const r = SF0.apply(this, arguments);
  try {
   const G = G0(), k = tier();
   if (k >= 0 && okG(G) && G.fo && !G.fo.v452) { G.fo.v452 = true; G.fo.cpuRate *= K.foRate[k]; G.fo.cpuReact *= K.foReact[k]; ST.fo++; }
  } catch (e) { err(e, 'fo'); }
  return r;
 };
 function gbFix(team) {
  const G = G0(), k = tier();
  if (k < 0 || !okG(G)) return;
  for (const p of G.players) if (p.team === team && p.gbReact > 0 && !p.gk) { p.gbReact *= K.gbR[k]; ST.gb++; }
 }
 const PL0 = window.popLoose;
 window.popLoose = function() {
  const r = PL0.apply(this, arguments);
  try { if (SCR() === 'live') gbFix('D'); } catch (e) { err(e, 'gb'); }
  return r;
 };
 const DPL0 = window.dPopLoose;
 window.dPopLoose = function() {
  const r = DPL0.apply(this, arguments);
  try { if (SCR() === 'defense') gbFix('D'); } catch (e) { err(e, 'dgb'); }
  return r;
 };
 V.tier = tier;
})();
