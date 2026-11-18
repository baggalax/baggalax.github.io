/* v548gkret.js - V54.8 (Bagga Lax 1.3): A GOALIE OUT OF HIS CAGE RUNS BACK AT NORMAL PLAYER SPEED.
 * Kill switch: window.__rl_no548gr = true -> exactly like before (checked every frame, can be flipped live).
 * Charlie (Nov 12, 12:48 AM): "If a goalie is out of cage because he ran out from a clear or something, right now he speeds
 *  back super fast. He should run back at a normal player speed, whatever his is."
 * Before (measured headless, goalie put 90-100 px out, then let the game run):
 *  - YOUR goalie (defense): v455gk.js leash ("sprint home at 70+") and the 10-MAN ride return (RIDE.sprint 62, raised to 70 by
 *    v455) -> ~70 px/s, up to ~86 from way up the field.
 *  - CPU goalie (live): the ride return (62) and the other return paths, only held to ~68 px/s by tp35's anti-teleport cap
 *    (goalies get x1.3 there).
 *  Field players run ~22-30 px/s (PACE.run 22, ground-ball chase 25-28, x spdMul), so a goalie came home ~2.5x faster.
 * Fix: after each game step, any goalie (yours or the CPU's, on the field or in the far unit during a clear) who is OUT of
 *  his crease and moving BACK toward his cage moves at most at a field player's speed, worked out the same way field players'
 *  speed is (spdMul: 1 + .09 x his own SPD rating, x the difficulty run multiplier DF.spd; the CPU goalie also x DF.dSpd like
 *  CPU defenders), base K.base, with a short ramp-up (K.acc s from standing to full speed). He still turns for home exactly
 *  when the game's AI says so (no dawdling added) - only the speed changes.
 * Not touched: a goalie with the ball (his own clear / carry: user/AI controlled speed), a goalie the ball is being passed to,
 *  shots in the air (dives / save moves), knocked-down goalies, moves AWAY from the cage (running out), small moves inside the
 *  crease, and resets (faceoff, period start, after a goal, new possession: any jump bigger than K.jump px in one frame, a
 *  new game or a screen change is a reset and is left alone). Tutorial and practice drills untouched.
 * Online: the side that is simulating the play (RLNET.auth) applies it; the viewing side just shows that side's snapshots,
 *  so no net messages, ids, rl_* keys or saves change.
 */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v548gr_loaded) return;
 W.__rl_v548gr_loaded = 1;
 const K = { base: 28, acc: .3, jump: 9, jumpV: 420, out: 3,
  set: 8, dive: 30, dive0: .3, diveSav: .05, diveLvl: .025, diveMin: .12, diveMax: .5 };
 const LOG = { frames: 0, clamps: 0, px: 0, skipJump: 0, errs: [], maxIn: 0, maxOut: 0,
  shotsOut: 0, dives: 0, diveSaves: 0, diveGoals: 0, openNet: 0, openGoals: 0, ev: [] };
 const off = () => !!W.__rl_no548gr || !!W.__rl_v124gb;
 const err = (e, w) => { try { if (LOG.errs.length < 20) LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v548gr', w, e); } catch (x) {} };
 const S = { G: null, scr: '', m: new WeakMap };
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 function netOk(G) {
  const on = !!(G.online || G.meta && G.meta.online || W.RLNET && RLNET.inGame);
  if (!on) return true;
  return !!(W.RLNET && RLNET.auth);   // only the side simulating the play
 }
 function okG(G) {
  const s = scr();
  return !!G && !!G.players && !G.tutorial && !G.practice && !G.over && (s === 'live' || s === 'defense') && netOk(G);
 }
 // which goalie is this, and where is his cage
 function gkInfo(G, p, far) {
  if (!p) return null;
  if (far === 'U') return p.role === 'G' ? { mine: true } : null;
  if (far === 'C') return p.role === 'G' ? { mine: false } : null;
  if (p.team === 'G2') return { mine: true };
  if (p.team === 'G') return { mine: false };
  if (p.gk && p.team === 'O') return { mine: true };
  return null;
 }
 function home(mine) { return mine ? [ DGX + 5, CY ] : [ GX - 5, CY ]; }
 function vmax(p, mine) {
  let r = 0;
  try { r = typeof rf === 'function' ? rf(p.pl, 'spd') : 0; } catch (e) { r = 0; }
  const df = typeof DF !== 'undefined' && DF ? DF : {};
  let v = K.base * (1 + .09 * r) * (df.spd || 1);
  if (mine === false) v *= (df.dSpd || 1);
  return v;
 }
 function each(G, f) {
  for (const p of G.players) { const i = gkInfo(G, p, null); if (i) f(p, i); }
  for (const p of G.farU || []) { const i = gkInfo(G, p, 'U'); if (i) f(p, i); }
  for (const p of G.farC || []) { const i = gkInfo(G, p, 'C'); if (i) f(p, i); }
 }
 function exempt(G, p) {
  const b = G.ball;
  if (!b || b.state === 'shot') return true;
  if (p === G.carrier || p === G.dcar || G.dclear && G.dclear.holder === p) return true;
  if (b.state === 'held' && b.holder === p) return true;
  if (b.state === 'pass' && b.to === p) return true;
  if (p.down > 0 || p.stun > 0) return true;
  return false;
 }
 function snap(G) {
  each(G, (p, i) => { const o = S.m.get(p) || {}; o.x = p.x; o.y = p.y; o.ok = 1; S.m.set(p, o); });
 }
 function post(G, dt) {
  if (G !== S.G || scr() !== S.scr) { S.G = G; S.scr = scr(); S.m = new WeakMap; snap(G); return; }
  LOG.frames++;
  each(G, (p, i) => {
   const o = S.m.get(p);
   if (!o || !o.ok) { S.m.set(p, { x: p.x, y: p.y, ok: 1, v: 0 }); return; }
   const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy);
   const h = home(i.mine), d0 = Math.hypot(o.x - h[0], o.y - h[1]), d1 = Math.hypot(p.x - h[0], p.y - h[1]);
   let v = d / dt;
   if (d > Math.max(K.jump, K.jumpV * dt)) { LOG.skipJump++; o.v = 0; }   // a reset / placement, not running
   else if (!exempt(G, p) && d0 > K.out && d1 < d0 - .01 && d > .01) {
    const vm = vmax(p, i.mine), cap = Math.min(vm, (o.v || 0) + vm / K.acc * dt);
    if (v > cap + .5) {
     const s = cap * dt / d;
     p.x = o.x + dx * s; p.y = o.y + dy * s;
     LOG.clamps++; LOG.px += d - cap * dt;
     try { if (typeof TP35 !== 'undefined' && TP35.m && typeof tp35key === 'function') { const k = tp35key(p); if (k && TP35.m.has(k)) TP35.m.set(k, [ p.x, p.y ]); } } catch (e) {}
     v = cap;
    }
    o.v = v;
    if (i.mine) LOG.maxIn = Math.max(LOG.maxIn, v); else LOG.maxOut = Math.max(LOG.maxOut, v);
   } else o.v = Math.min(v, vmax(p, i.mine));
   o.x = p.x; o.y = p.y;
  });
 }

 /* ---------- a shot while he is out: open net, or a diving save if he is nearly back ---------- */
 // where is he vs his spot (y inside the cage mouth counts as "on his spot": that is normal set-up / shot tracking)
 function outBy(gk, h) { return Math.hypot(gk.x - h[0], Math.max(0, Math.abs(gk.y - CY) - MOUTH)); }
 function lvl() { try { return typeof DF !== 'undefined' && DF && DF.level != null ? DF.level : 2; } catch (e) { return 2; } }
 function diveP(gk, mine, dg) {
  let r = 0;
  try { r = typeof rf === 'function' ? rf(gk.pl, 'sav') : 0; } catch (e) { r = 0; }
  let p = K.dive0 + K.diveSav * r + (mine ? 0 : K.diveLvl * (lvl() - 2.5));
  p = Math.max(K.diveMin, Math.min(K.diveMax, p));
  const k = Math.max(0, Math.min(1, (dg - K.set) / (K.dive - K.set)));
  return p * (1.15 - .6 * k);          // nearly back: a bit better than his base dive; at the edge of the range: much less
 }
 function shotCtx(G) {
  const b = G.ball, s = scr();
  if (!b || b.state !== 'shot') return null;
  if (s === 'live') {
   if (!(b.vx > 1)) return null;
   const gk = G.goalie;
   if (!gk || !G.players.includes(gk)) return null;
   let line = GX - 5;
   try { if (b.s25 && W.SHOT26 && SHOT26.glx) line = SHOT26.glx(gk); } catch (e) {}
   return { b, gk, mine: false, h: home(false), line, dir: 1, goalX: GX };
  }
  if (s === 'defense') {
   if (!(b.vx < -1)) return null;
   const gk = G.players.find(p => p.team === 'G2');
   if (!gk) return null;
   return { b, gk, mine: true, h: home(true), line: DGX + 5, dir: -1, goalX: DGX };
  }
  return null;
 }
 let PEND = null;
 function pre(G, dt) {
  PEND = null;
  const c = shotCtx(G);
  if (!c) return;
  const { b, gk } = c;
  const ahead = (c.line - b.x) * c.dir;
  if (ahead < -.5 || ahead > Math.abs(b.vx) * dt * 1.6 + 2) return;     // not crossing his line this frame
  const cyG = b.y + b.vy * (c.goalX - b.x) / b.vx;
  if (Math.abs(cyG - CY) > MOUTH - .5) return;                          // going wide: nothing to save
  const cy = Math.max(CY - MOUTH - 1, Math.min(CY + MOUTH + 1, b.y + b.vy * (c.line - b.x) / b.vx));
  let D = b.v548d;
  if (!D || D.gk !== gk) {
   const dg = outBy(gk, c.h);
   if (dg <= K.set) D = { gk, res: 'set', dg };
   else if (gk.down > 0 || gk.stun > 0) D = { gk, res: 'goal', dg, why: 'down' };
   else if (dg <= K.dive) { const p = diveP(gk, c.mine, dg); D = { gk, res: Math.random() < p ? 'save' : 'goal', dg, p, dive: 1 }; }
   else D = { gk, res: 'goal', dg, why: 'open' };
   b.v548d = D;
   if (D.res !== 'set') {
    LOG.shotsOut++;
    if (D.dive) { LOG.dives++; if (D.res === 'save') LOG.diveSaves++; } else LOG.openNet++;
    if (LOG.ev.length < 80) LOG.ev.push({ side: c.mine ? 'U' : 'C', res: D.res, dg: Math.round(dg), p: D.p != null ? +D.p.toFixed(2) : null, t: +(+G.t || 0).toFixed(2) });
    if (D.dive) {   // the dive itself: stretch frame toward the ball
     try { gk.saveT0 = menuT; gk.saveFr = Math.abs(cy - gk.y) <= 3 ? 'save_low' : cy < gk.y ? 'save_high' : 'save_side'; } catch (e) {}
    }
   }
  }
  if (D.res === 'set') return;
  const reach = gk.reach || GK.reach || 2, y0 = gk.y;
  b.aim14 = null;
  if (b.s25) { b.s25.read = false; b.s25.own = D.res === 'save'; }
  let ySet;
  let r0 = null;
  if (D.res === 'save') { ySet = cy; r0 = gk.reach; gk.reach = Math.max(reach, 3); }   // he gets a piece of it (even if a 'beaten' state shrank his reach)
  else ySet = cy + (y0 >= cy ? 1 : -1) * (reach + 9);                  // beaten: nowhere near it
  gk.y = ySet;
  PEND = { G, b, gk, D, y0, ySet, cy, r0, rSet: r0 !== null };
 }
 function postDive(G) {
  const P0 = PEND; PEND = null;
  if (!P0) return;
  const { b, gk, D, y0, ySet, cy } = P0;
  if (P0.rSet) gk.reach = P0.r0;
  const moved = gk.y - ySet;
  const done = !b || b.state !== 'shot';
  if (D.res === 'save' && done) {
   // saved: he stays stretched out where he got it (a short lunge), and the crowd hears about it
   gk.y = Math.max(FT + 12, Math.min(FB - 3, cy));
   if (D.dive) {
    try { gk.saveT0 = menuT; gk.saveFr = Math.abs(cy - y0) <= 3 ? 'save_low' : cy < y0 ? 'save_high' : 'save_side'; } catch (e) {}
    try { addFx('cue', 0, 0, { s: 'DIVING SAVE!', col: '#7dff7a', life: 1.2 }); } catch (e) {}
   }
  } else {
   // dove and missed / open net: back to where he really is, leaning toward the ball a little
   let y = y0 + moved;
   if (D.dive && done) y += Math.max(-4, Math.min(4, (cy - y) * .5));
   gk.y = Math.max(FT + 12, Math.min(FB - 3, y));
  }
 }
 function shotEnd(G) {   // the shot is over: count it and forget the decision (the ball object is reused for the next shot)
  const b = G && G.ball;
  if (!b || !b.v548d || b.state === 'shot') return;
  const D = b.v548d; b.v548d = null;
  if (D.res !== 'set' && (b.state === 'net' || G.ripple)) LOG[D.dive ? 'diveGoals' : 'openGoals']++;
 }
 const o = W.step;
 if (typeof o !== 'function') { LOG.errs.push('no step'); W.V548GR = { on: () => false, LOG: LOG, K: K }; return; }
 W.step = function (dt) {
  try {
   const G = G0();
   if (!off() && okG(G) && typeof dt === 'number' && dt > 0 && dt <= .1) pre(G, dt); else PEND = null;
  } catch (e) { err(e, 'pre'); PEND = null; }
  const r = o.apply(this, arguments);
  try { if (PEND) postDive(PEND.G); shotEnd(G0()); } catch (e) { err(e, 'postDive'); PEND = null; }
  try {
   const G = G0();
   if (!off() && okG(G) && typeof dt === 'number' && dt > 0 && dt <= .1) post(G, dt);
   else { S.G = null; S.scr = ''; }
  } catch (e) { err(e, 'post'); S.G = null; }
  return r;
 };
 W.V548GR = { on: () => !off(), LOG: LOG, K: K, vmax: p => { const G = G0(); let mine = true; try { mine = !(p.team === 'G' || (G && (G.farC || []).includes(p))); } catch (e) {} return vmax(p, mine); } };
})();
