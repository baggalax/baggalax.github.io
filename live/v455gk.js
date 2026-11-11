/* v455gk.js - V45.5: YOUR GOALIE GETS BACK ON A TURNOVER (Bagga Lax 1.1, Nov 8).
 * Kill switch: window.__rl_no455gk = true -> exactly like before.
 *   Sub-switches: __rl_no455gkride (no one-time 10-MAN -> NORMAL ride reset), __rl_no455gkc (CPU goalie untouched).
 * Report (Christian, via Charlie, Nov 8 4:36 PM): "when I turn the ball over, at around midfield my goalie just comes out
 * of crease and so far up and a lot of times an easy 2 has been scored". Charlie: a cue says the goalie is coming out.
 * Causes (game.js @81cdf30b):
 *  (1) 10-MAN RIDE (rideTick 'defense' -> rideStep('rideU', ...) game.js ~28769, target v415r.js rideGkTarget): when the CPU
 *      gets the ball deep (ball past MIDX+30, which a turnover in your end always is) your goalie runs OUT to the top of the box
 *      (x = DGX+52 .. RL_L-6 = 144 from the cage), OUTSIDE the 2-point arc (ARC_R 120). He only turns back when the ball
 *      reaches MIDX+10 or the clear ends, so a long pass / quick carry gets a shot at an empty cage from 2-point range.
 *      10-MAN is only on when rl_ride = '10-MAN RIDE' (a playbook / timeout pick, or a pick restored from a cloud save).
 *  (2) A goalie who carried it up (cage-to-cage / goalie clear) and loses it: startDefenseLive (game.js ~19802) and
 *      v38g braveDefLive put him where he stood (up to midfield) and set g2.homeRun = true, which NOTHING reads; the defense
 *      tick then walks him home at 28 (game.js ~24302: 8+ s from midfield).
 * Fix (offline games only; online, tutorial, practice drills unchanged):
 *  - any CPU possession / loose ball in your half: your goalie may not be more than a short leash from his cage; if he is,
 *    he sprints home at SPD (above the 28 walk and the ride sprint). Covers turnovers, CPU saves + clears, failed clears,
 *    a goalie who lost it mid-clear. Holding the ball (his own clear), a shot in the air, being knocked down: untouched.
 *  - 10-MAN still works, but the goalie stays INSIDE the 2-point arc (x <= DGX+92) and starts back early: ball within
 *    MIDX+50, any pass forward / to his man, the carrier near his line, or a loose ball near midfield.
 *  - the same 10-MAN cap + early return for the CPU goalie (same flaw, mirrored: parked outside your 2-point arc).
 *  - one time, a saved '10-MAN RIDE' that was never picked on this build is reset to NORMAL (marker rl_ride455);
 *    picking 10-MAN again after that sticks.
 */
(function () {
 'use strict';
 if (window.__rl_v455gk_loaded) return;
 window.__rl_v455gk_loaded = 1;
 const W = window;
 const off = () => !!W.__rl_no455gk || !!W.__rl_v124gb;
 const offC = () => off() || !!W.__rl_no455gkc;
 const LOG = { n: { rec: 0, recFrames: 0, cap: 0, back: 0, backC: 0, capC: 0 }, errs: [], ride: null, ev: [] };
 const K = W.V455K = { spd: 70, far: 16, leash: 24, looseLeash: 48, rideMax: 92, nearMid: 50, carNear: 60, passFwd: 25 };
 W.V455GK = { on: () => !off(), LOG: LOG, K: K };
 if (off()) return;
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const err = (e, w) => { try { if (LOG.errs.length < 30) LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.error(e); } catch (x) {} };
 const online = G => !!(G.online || G.meta && G.meta.online || W.RLNET && RLNET.inGame);
 const okG = G => !!G && !G.tutorial && !G.practice && !online(G) && !G.over;
 const hyp = Math.hypot;
 const wrapG = (n, f) => {
  const o = W[n];
  if (typeof o !== 'function') { LOG.errs.push('no ' + n); return false; }
  W[n] = function () { return f.call(this, o, arguments); };
  return true;
 };
 const TEN = '10-MAN RIDE', STD = 'STANDARD RIDE';

 /* ---------- one-time reset of a stale 10-MAN pick ---------- */
 try {
  if (!W.__rl_no455gkride) {
   const k = 'rl_ride', mk = 'rl_ride455';
   let cur = null;
   try { cur = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { cur = null; }
   if (!localStorage.getItem(mk)) {
    if (cur === TEN) { localStorage.setItem(k, JSON.stringify(STD)); LOG.ride = '10-MAN->NORMAL (once)'; }
    else LOG.ride = 'kept ' + String(cur).slice(0, 40);
    localStorage.setItem(mk, '1');
   } else LOG.ride = 'marker set, kept ' + String(cur).slice(0, 40);
   const G = G0();
   if (G && G.rideU_call === TEN && !G.r415pick && LOG.ride === '10-MAN->NORMAL (once)') G.rideU_call = STD;
  }
 } catch (e) { err(e, 'ride'); }
 // a pick made from now on is the player's own: keep the marker so it is never reset again
 wrapG('setRide', function (o, a) {
  const r = o.apply(this, a);
  try { if (!localStorage.getItem('rl_ride455')) localStorage.setItem('rl_ride455', '1'); } catch (e) {}
  return r;
 });

 /* ---------- 10-MAN: start back early ---------- */
 // mine: the user's goalie (defense screen, his cage at DGX). CPU: mirror (live screen, cage at GX).
 function earlyBack(G, R, mine) {
  const b = G.ball;
  if (!b || !R || !R.gk) return null;
  const sgn = mine ? 1 : -1, toward = x => sgn * (x - MIDX);   // how far the ball is in the clearing team's own end
  const gk = R.gk;
  if ((b.state === 'held' || b.state === 'clear') && toward(b.x) < K.nearMid) return 'mid';
  if (b.state === 'loose' || b.state === 'chase') { if (toward(b.x) < K.nearMid + 20) return 'loose'; return null; }
  if (b.state === 'pass') {
   const fx = b.fromX != null ? b.fromX : b.from ? b.from.x : b.x, to = b.to || b.intercept;
   if (to && R.mk && (to === R.mk)) return 'passMan';
   if (to && to.x != null && sgn * (fx - to.x) > K.passFwd) return 'passFwd';
   return null;
  }
  const car = mine ? G.dcar : G.carrier;
  if (car && sgn * (car.x - gk.x) < K.carNear) return 'car';
  if (car && R.mk && car === R.mk) return 'man';
  return null;
 }
 wrapG('rideStep', function (o, a) {
  const R = o.apply(this, a);
  try {
   const G = G0(), key = a[0];
   if (R && R.phase === 'out' && !off() && okG(G)) {
    const mine = key === 'rideU';
    if (mine || !offC()) {
     const why = earlyBack(G, R, mine);
     if (why) {
      R.phase = 'back'; R.tBack = G.t; R.why455 = why;
      G.rideSprints = (G.rideSprints || 0) + 1;
      LOG.n[mine ? 'back' : 'backC']++;
      if (LOG.ev.length < 60) LOG.ev.push({ k: mine ? 'U' : 'C', why: why, t: +(+G.t || 0).toFixed(2), bx: Math.round(G.ball.x) });
     }
    }
   }
  } catch (e) { err(e, 'rideStep'); }
  return R;
 });

 /* ---------- 10-MAN: stay inside the 2-point arc, sprint back ---------- */
 wrapG('rideGkTarget', function (o, a) {
  const q = o.apply(this, a);
  try {
   const G = G0(), R = a[0], gx = a[2], mine = gx < MIDX;
   if (q && R && !off() && okG(G) && (mine || !offC())) {
    if (R.phase === 'out') {
     if (mine && q[0] > DGX + K.rideMax) { q[0] = DGX + K.rideMax; LOG.n.cap++; }
     if (!mine && q[0] < GX - K.rideMax) { q[0] = GX - K.rideMax; LOG.n.capC++; }
    } else q[2] = Math.max(q[2] || 0, K.spd);
   }
  } catch (e) { err(e, 'gkT'); }
  return q;
 });

 /* ---------- your goalie: leash + sprint home whenever they have it ---------- */
 const HOME = () => [ DGX + 5, CY ];
 function danger(G, b) {
  if (!b) return false;
  if (b.state === 'shot') return false;
  if (G.dclear || b.state === 'clear' || b.state === 'pass' && b.clear) return false;   // your clear
  if (b.state === 'held') return !!G.dcar;
  if (b.state === 'pass') return true;                                                   // their pass
  if (b.state === 'loose' || b.state === 'chase') return b.x < MIDX + 10 || !!G.cpuClear;
  return !!G.cpuClear;
 }
 function leashFor(G, b, g) {
  if ((b.state === 'loose' || b.state === 'chase') && hyp(b.x - DGX, b.y - CY) < K.looseLeash) return K.looseLeash + 4;
  return K.leash;
 }
 wrapG('step', function (o, a) {
  let G = null, g = null, px = 0, py = 0;
  try {
   G = G0();
   if (!off() && okG(G) && scr() === 'defense' && G.players) {
    g = G.players.find(p => p.team === 'G2') || null;
    if (g) { px = g.x; py = g.y; }
   }
  } catch (e) { err(e, 'pre'); g = null; }
  const r = o.apply(this, a);
  try {
   if (!g || G !== G0() || scr() !== 'defense' || !G.players || !G.players.includes(g)) {
    // a fresh defense (turnover / save / failed clear) this frame: note a goalie that starts away from home
    const G2 = G0();
    if (G2 && !off() && okG(G2) && scr() === 'defense' && G2.players) {
     const n = G2.players.find(p => p.team === 'G2');
     if (n && n !== g) {
      const h = HOME(), d = hyp(n.x - h[0], n.y - h[1]);
      if (d > K.leash && LOG.ev.length < 60) LOG.ev.push({ k: 'newD', d: Math.round(d), t: +(+G2.t || 0).toFixed(2), homeRun: !!n.homeRun });
     }
    }
    return r;
   }
   const b = G.ball;
   if (!b || b.state === 'shot' || g.down > 0 || g.stun > 0) return r;
   if (G.dclear && G.dclear.holder === g) return r;          // his own clear: he may step out with it
   if (b.state === 'pass' && b.to === g) return r;
   if (!danger(G, b)) return r;
   const RU = G.rideU && G.rideU.gk === g && G.rideU.phase === 'out' ? G.rideU : null;
   const RX = !RU && G.rideX && G.rideX.get && G.rideX.get(g) && b.state === 'held' && b.x > MIDX + K.nearMid && G.dcar && G.dcar.x - g.x > K.carNear;
   const h = HOME();
   if (RU || RX) {
    // a real 10-man (or your drawn ride) while the ball is still deep: out is fine, past the arc is not
    if (g.x > DGX + K.rideMax + 1) {
     g.x = px; g.y = py;
     moveTo(g, DGX + K.rideMax, py, K.spd, typeof a[0] === 'number' && a[0] > 0 && a[0] < .1 ? a[0] : 1 / 60);
     LOG.n.cap++;
    }
    return r;
   }
   const L = leashFor(G, b, g), d = hyp(g.x - h[0], g.y - h[1]);
   if (d > L) {
    const dt = typeof a[0] === 'number' && a[0] > 0 && a[0] < .1 ? a[0] : 1 / 60;
    g.x = px; g.y = py;
    moveTo(g, h[0], h[1], K.spd + Math.min(K.far, Math.max(0, d - 60) * .1), dt);   // a little faster still from way up the field
    if (!g.rec455) { g.rec455 = 1; LOG.n.rec++; if (LOG.ev.length < 60) LOG.ev.push({ k: 'rec', d: Math.round(d), t: +(+G.t || 0).toFixed(2), bx: Math.round(b.x), st: b.state }); }
    LOG.n.recFrames++;
    g.homeRun = false;
   } else g.rec455 = 0;
  } catch (e) { err(e, 'post'); }
  return r;
 });
 W.V455GK = { on: () => !off(), LOG: LOG, K: K, earlyBack: earlyBack };
})();
