(function() {
 'use strict';
 if (typeof window.off110Tick !== 'function' || typeof window.off110Decide !== 'function' || typeof window.off110Move !== 'function' || typeof window.off2403on !== 'function' || typeof window.updateLive !== 'function') return;
 const O_TICK = window.off110Tick, O_DEC = window.off110Decide, O_MOVE = window.off110Move, O_24 = window.off2403on, O_LIVE = window.updateLive;
 const offAll = () => !!(window.__rl_no36ai || window.__rl_v124gb);
 const offO = () => offAll() || !!window.__rl_no36aioff;
 const offS = () => offAll() || !!window.__rl_no36aisag;
 const st = (k, n) => {
  const S = window.__st36 = window.__st36 || {};
  S[k] = (S[k] || 0) + (n == null ? 1 : n);
 };
 const lerp = (a, b, t) => a + (b - a) * t;
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const hyp = Math.hypot;
 const V = window.V36AI = {
  lastQ: null,
  lastOvr: null
 };
 const OFF36 = V.OFF = {
  ovr0: 66,
  ovr1: 88,
  nastyQ: 0,
  cd: [ 1.05, .5 ],
  w0: [ .32, .3, .28, .1 ],
  w1: [ .5, .33, .12, .05 ],
  cut2: [ .3, .8 ],
  twoMan: [ .55, .95 ],
  emoHeld: [ 1.6, .9 ],
  feed: [ .6, .9 ],
  shootIn: [ .45, .8 ],
  outOpen: [ .11, .04 ],
  decide: [ 1.12, .85 ],
  hold: [ 2.6, 1.3 ],
  revB: [ 2, 8 ],
  noise: [ 14, 4 ],
  laneP: [ 4, 12 ],
  passMin: 9,
  dump: [ .3, .8 ],
  fill: [ .45, .95 ],
  fillR: 95,
  bad: .06,
  pickK: [ .85, 1.15 ],
  dumpR: 52,
  dumpMd: 12,
  swMd: [ 8, 14 ],
  swLane: 10
 };
 function offOn(G) {
  return !offO() && !!G && !G.practice && !G.tutorial && !G.brave && !G.online && !(G.meta && G.meta.online) && typeof screen !== 'undefined' && screen === 'defense' && on110(G);
 }
 function iq(G) {
  const C = G.iq36;
  if (C && C.pl === G.players && G.t - C.t < 2 && C.t <= G.t) return C.q;
  let s = 0, n = 0;
  for (const p of G.players || []) if (p && p.team === 'D' && p.pl && !p.gk) {
   const o = p.pl.ovr != null ? +p.pl.ovr : ovrOf(p.pl);
   if (isFinite(o)) {
    s += o;
    n++;
   }
  }
  const ovr = n ? s / n : 76, q0 = cl((ovr - OFF36.ovr0) / (OFF36.ovr1 - OFF36.ovr0), 0, 1);
  const q = cl(q0 + (DF && DF.level >= 4 ? OFF36.nastyQ : 0), 0, 1);
  G.iq36 = {
   t: G.t,
   q: q,
   ovr: Math.round(ovr),
   pl: G.players
  };
  V.lastQ = +q.toFixed(3);
  V.lastOvr = Math.round(ovr);
  return q;
 }
 function withP(G, fn) {
  if (window.__rl_t36noP) return fn();
  const q = iq(G);
  const s24 = {
   cd: OFF2403.cd,
   w: OFF2403.w,
   cut2: OFF2403.cut2,
   twoMan: OFF2403.twoMan,
   emoHeld: OFF2403.emoHeld
  };
  const s110 = {
   feed: OFF110.feed,
   shootIn: OFF110.shootIn,
   outOpen: OFF110.outOpen
  };
  OFF2403.cd = lerp(OFF36.cd[0], OFF36.cd[1], q);
  OFF2403.w = OFF36.w0.map((v, i) => lerp(v, OFF36.w1[i], q));
  OFF2403.cut2 = lerp(OFF36.cut2[0], OFF36.cut2[1], q);
  OFF2403.twoMan = lerp(OFF36.twoMan[0], OFF36.twoMan[1], q);
  OFF2403.emoHeld = lerp(OFF36.emoHeld[0], OFF36.emoHeld[1], q);
  OFF110.feed = lerp(OFF36.feed[0], OFF36.feed[1], q);
  OFF110.shootIn = lerp(OFF36.shootIn[0], OFF36.shootIn[1], q);
  OFF110.outOpen = lerp(OFF36.outOpen[0], OFF36.outOpen[1], q);
  try {
   return fn();
  } finally {
   Object.assign(OFF2403, s24);
   Object.assign(OFF110, s110);
  }
 }
 window.off2403on = function(G) {
  const r = O_24.apply(this, arguments);
  if (r || !offOn(G) || window.__rl_no2403 || window.__rl_t36no24) return r;
  return true;
 };
 window.off110Tick = function(G, c, atk, def, dt) {
  if (!offOn(G)) return O_TICK.apply(this, arguments);
  const self = this, args = arguments;
  const cb = DF.cpuBeat;
  DF.cpuBeat = (cb || 1) * lerp(OFF36.pickK[0], OFF36.pickK[1], iq(G));
  let r;
  try {
   r = withP(G, () => O_TICK.apply(self, args));
  } finally {
   DF.cpuBeat = cb;
  }
  if (!window.__rl_t36nofill) try {
   fill36(G, c, atk);
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 function fill36(G, c, atk) {
  const O = G.o110;
  if (!O || !O.cutter || !O.cutUntil || O.fill36 === O.cutUntil) return;
  O.fill36 = O.cutUntil;
  const u = O.cutter;
  if (!u || !u.cut110 || !u.home || u.home[0] < DGX + 10 || !atk.includes(u)) return;
  st('cutSeen');
  if (Math.random() >= lerp(OFF36.fill[0], OFF36.fill[1], iq(G))) {
   st('fillSkip');
   return;
  }
  const A = O.a, busy = a => a === c || a === u || A && (A.s === a || A.u === a) || !!a.cut110 || a.down > 0 || !a.home || a.home[0] < DGX + 10 || a.fill36;
  const f = atk.filter(a => !busy(a)).sort((p, q) => hyp(p.x - u.home[0], p.y - u.home[1]) - hyp(q.x - u.home[0], q.y - u.home[1]))[0];
  if (!f || hyp(f.x - u.home[0], f.y - u.home[1]) > OFF36.fillR) return;
  const h = f.home;
  f.home = u.home;
  u.home = h;
  f.fill36 = {
   t: 1.6,
   x: f.home[0],
   y: f.home[1]
  };
  f.tgt = f.home.slice();
  f.wt = Math.max(f.wt || 0, 1);
  st('fill');
 }
 window.off110Move = function(G, a, dt) {
  const r = O_MOVE.apply(this, arguments);
  if (r || !a || !a.fill36) return r;
  if (!offOn(G) || a.fill36.t <= 0 || a.down > 0) {
   a.fill36 = null;
   return r;
  }
  a.fill36.t -= dt;
  moveTo(a, a.fill36.x, a.fill36.y, PACE.cut * 1.15, dt);
  if (hyp(a.x - a.fill36.x, a.y - a.fill36.y) < 3) a.fill36 = null;
  return true;
 };
 function lanePass(G, c, a, def) {
  const o = open110(G, a, def, c);
  return o;
 }
 function clearLane(G, c, a, def, m) {
  const [sx, sy] = dStick(c), [rx, ry] = dStick(a), L = hyp(rx - sx, ry - sy) || 1;
  for (const d of def) {
   if (d.down > 0 || d.gk) continue;
   const t = cl(((d.x - sx) * (rx - sx) + (d.y - 6 - sy) * (ry - sy)) / (L * L), 0, 1);
   if (t < .1 || t > .95) continue;
   if (hyp(d.x - (sx + (rx - sx) * t), d.y - 6 - (sy + (ry - sy) * t)) < m) return false;
  }
  return true;
 }
 function bestPass(G, c, atk, def, q, O, strict) {
  let best = null;
  for (const a of atk) {
   if (a === c || a.down > 0 || a.gk) continue;
   if (O.a && O.a.s === a && (O.a.ph === 'set' || O.a.ph === 'use')) continue;
   const o = lanePass(G, c, a, def), cross = (a.y - CY) * (c.y - CY) < 0, L = hyp(a.x - c.x, a.y - c.y);
   if (L > 150 || L < 12) continue;
   let s = Math.min(o.md, 25) + (o.lane ? 4 : -lerp(OFF36.laneP[0], OFF36.laneP[1], q)) - hyp(a.x - DGX, a.y - CY) * .06 + (cross ? lerp(OFF36.revB[0], OFF36.revB[1], q) : 0) + (a === O.cutter && G.t < (O.cutUntil || 0) ? OFF110.cutBonus : 0) + Math.random() * lerp(OFF36.noise[0], OFF36.noise[1], q);
   if (strict && (!o.lane || o.md < lerp(OFF36.swMd[0], OFF36.swMd[1], q) || !clearLane(G, c, a, def, OFF36.swLane))) s -= 30;
   if (!best || s > best.s) best = {
    a: a,
    s: s,
    skip: cross && Math.abs(a.y - c.y) > 50,
    cross: cross,
    o: o
   };
  }
  return best;
 }
 window.off110Decide = function(G, c, atk, def, dGoal, pres, onb, ond, look, shootOK) {
  if (!offOn(G) || !c || !atk || !def) return O_DEC.apply(this, arguments);
  const q = iq(G), O = G.o110 || {}, A = O.a;
  if (G.dDecide > 0) G.dDecide *= lerp(OFF36.decide[0], OFF36.decide[1], q);
  const inside = dGoal < OFF110.inD && c.x > DGX + 4;
  const old = () => withP(G, () => O_DEC.call(this, G, c, atk, def, dGoal, pres, onb, ond, look, shootOK));
  if (inside && (look && ond > 9 || G.dBeat > 0)) return old();
  if (G.shotClock < 4) return old();
  if (A && A.kind === 'on' && A.c === c && A.ph === 'set' && pres < 2) return old();
  if (G.el2403 && !G.el2403.on) return old();
  if (O.twoMan && atk.includes(O.twoMan)) return old();
  if (SETTINGS.twoPt && c.go2 && G.t - c.go2 < 5) return old();
  {
   const cuts = atk.filter(a => a !== c && !(a.down > 0) && (a === O.cutter && G.t < (O.cutUntil || 0) || hyp(a.x - DGX, a.y - CY) < OFF110.inD + 4) && a.x > DGX + 4);
   for (const a of cuts) {
    const o = open110(G, a, def, c);
    if (o.lane && o.md > 10) return old();
   }
  }
  try {
   const sl = G.dSlide && G.players.includes(G.dSlide) && !(G.dSlide.down > 0) && hyp(G.dSlide.x - c.x, G.dSlide.y - c.y) < 34 ? G.dSlide : null;
   if (sl && atk.length > 1 && !window.__rl_t36nodump) {
    const lm = sl.mark && atk.includes(sl.mark) && sl.mark !== c ? sl.mark : null;
    const cand = atk.filter(a => a !== c && !(a.down > 0) && !a.gk && a.x > DGX + 4 && hyp(a.x - DGX, a.y - CY) < OFF36.dumpR).map(a => ({
     a: a,
     o: lanePass(G, c, a, def)
    })).filter(x => x.o.lane && x.o.md > OFF36.dumpMd && clearLane(G, c, x.a, def, OFF36.swLane)).sort((u, v) => (v.a === lm) - (u.a === lm) || v.o.md - u.o.md);
    if (cand.length && Math.random() < lerp(OFF36.dump[0], OFF36.dump[1], q)) {
     dPassTo(c, cand[0].a);
     G.dHeld = 0;
     st('dump');
     if (G.ball && G.ball.intercept) st('dumpInt');
     st2403x(G, 'pass');
     return true;
    }
   }
   if (shootOK && !inside && pres >= 1 && q < .5 && Math.random() < OFF36.bad * (1 - 2 * q)) {
    st('badShot');
    dShoot(c);
    return true;
   }
   const hold = lerp(OFF36.hold[0], OFF36.hold[1], q);
   if (G.dHeld > hold && pres <= 1 && atk.length > 1 && G.dHeld <= 2.6 && !window.__rl_t36noswing) {
    const bp = bestPass(G, c, atk, def, q, O, q >= .5);
    if (bp && bp.s > (q >= .5 ? 6 : -99)) {
     dPassTo(c, bp.a);
     G.dHeld = 0;
     st('swing');
     if (G.ball && G.ball.intercept) st('swingInt');
     if (bp.cross) st('reversal');
     if (bp.skip) st2403x(G, 'skip');
     st2403x(G, 'pass');
     return true;
    }
    st('noForce');
   }
  } catch (e) {
   console.error(e);
  }
  return old();
 };
 const SAG36 = V.SAG = {
  N: 82,
  F: 128,
  F2: 30,
  shootF: 10,
  behind: 25,
  wide: .35,
  cushMax: 18,
  chkT: .55,
  idle0: [ 2.6, 1.8 ],
  ramp: 3.5,
  stepMax: .92,
  react: [ .35, .1 ],
  back: .9,
  bias: .3,
  spdIdle: 6,
  att0: .3,
  att1: .45
 };
 let FR = 0;
 function sagOn(G, c) {
  return !offS() && !!G && !!c && typeof screen !== 'undefined' && screen === 'live' && c.team === 'O' && !G.tutorial && !G.practice && !G.brave && !G.online && !(G.meta && G.meta.online) && !G.clearing && !G.cpuClear && !G.cset && !G.dclear && c.x >= RL_R && !(G.pen && G.pen.side === 'C');
 }
 const skill = p => cl(.5 + .35 * pr(p, 'def'), 0, 1);
 function biasOf(p) {
  const id = String(p.pl && p.pl.id || p.id || '');
  let h = 7;
  for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) >>> 0;
  return h % 1e3 / 1e3 * 2 - 1;
 }
 function sagPre(G, dt) {
  const c = G.carrier, b = G.ball;
  if (!sagOn(G, c) || !b || b.state !== 'held') {
   G.sag36 = null;
   return;
  }
  FR++;
  let S = G.sag36;
  if (!S || S.who !== c) S = G.sag36 = {
   who: c,
   k: FR,
   idle: 0,
   drv: 0,
   lx: c.x,
   ly: c.y,
   Tpos: 0,
   eff: 0,
   dt: dt,
   fr: FR,
   effFr: -9
  };
  S.dt = dt;
  S.fr = FR;
  const dx = GX - c.x, dy = CY - c.y, L = hyp(dx, dy) || 1;
  const mv = hyp(c.x - S.lx, c.y - S.ly) / Math.max(dt, .001);
  S.lx = c.x;
  S.ly = c.y;
  const run = G.run, rl = run ? hyp(run.x, run.y) : 0, rm = run && rl > .01 ? runMag() : 0;
  const toward = rm ? (run.x * dx + run.y * dy) / L / rl * rm : 0;
  const attack = cl((toward - SAG36.att0) / SAG36.att1, 0, 1);
  const dodge = !!(G.dodge || G.dodgeT > 0 || G.beatT > 0);
  if (dodge) S.drv = 1; else S.drv = attack > S.drv ? Math.min(attack, S.drv + dt / .12) : Math.max(attack, S.drv - dt / .8);
  const still = mv < SAG36.spdIdle && (!run || rm < .25), noProg = toward <= .15;
  let set = true;
  {
   let od = null;
   for (const d of G.players) if (d.team === 'D' && !(d.down > 0) && markOf(d) === c) {
    od = d;
    break;
   }
   if (od && hyp(od.x - c.x, od.y - c.y) > SAG36.cushMax + 8) set = false;
  }
  if (attack > .2 || dodge) S.idle = 0; else if (set) S.idle += still ? dt : noProg ? dt * .5 : 0;
  let de = hyp(c.x - GX, c.y - CY);
  if (c.x > GX - 2) de += SAG36.behind;
  de += Math.max(0, Math.abs(c.y - CY) - Math.abs(GX - c.x)) * SAG36.wide;
  const sh = cl((pr(c, 'pow') + pr(c, 'acc')) / 2, -1.5, 1.5), two = !!G.twoPt;
  const F = SAG36.F + (two ? SAG36.F2 : 0) + SAG36.shootF * sh;
  S.Tpos = cl((F - de) / (F - SAG36.N), 0, 1);
  const eff = S.effFr >= FR - 2 ? S.eff : Math.max(S.Tpos, S.drv * (.7 + .3 * S.Tpos), cl((S.idle - 1.6) / SAG36.ramp, 0, 1) * SAG36.stepMax);
  if (eff < SAG36.chkT) {
   for (const d of G.players) {
    if (d.team !== 'D' || d.netCtl || d.down > 0) continue;
    if (hyp(d.x - c.x, d.y - c.y) > UCHK.range + 3) continue;
    const cd = d.chkCd == null ? 0 : d.chkCd;
    if (cd - dt <= 0) st('chkHeld');
    d.chkCd = Math.max(cd, .2);
   }
   st('noThreatFr');
  }
 }
 if (typeof window.fbSkip2403 === 'function') {
  const O_FB = window.fbSkip2403;
  window.fbSkip2403 = function(G, d, b, offT, defT, dir) {
   const r = O_FB.apply(this, arguments);
   try {
    if (r || offS() || !G || !d || defT !== 'D' || typeof screen === 'undefined' || screen !== 'live') return r;
    const S = G.sag36, c = G.carrier, R = d.s36;
    if (!S || S.who !== c || S.fr !== FR || !c || markOf(d) !== c || !R || R.k !== S.k || R.fr !== FR) return r;
    const inEnd = p => !p.gk && !(p.down > 0) && (p.x - MIDX) * dir > -6;
    if (G.players.filter(p => p.team === defT && inEnd(p)).length < G.players.filter(p => p.team === offT && inEnd(p)).length) return r;
    st('fbKeep');
    return true;
   } catch (e) {
    console.error(e);
    return r;
   }
  };
 }
 window.updateLive = function(dt) {
  const G = typeof game !== 'undefined' ? game : null;
  if (G) {
   if (offS()) G.sag36 = null; else {
    try {
     sagPre(G, dt);
    } catch (e) {
     console.error(e);
     G.sag36 = null;
    }
   }
  }
  return O_LIVE.apply(this, arguments);
 };
 function engage36(c, reach) {
  const G = typeof game !== 'undefined' ? game : null, S = G && G.sag36;
  if (offS() || !G || !c || !S || S.who !== c || S.fr < FR - 1 || !sagOn(G, c)) return null;
  const dx = GX - c.x, dy = CY - c.y, L = hyp(dx, dy) || 1, ux = dx / L, uy = dy / L;
  let best = null, bd = 1e9;
  for (const q of G.players) {
   if (q.team !== 'D' || q.gk || q.netCtl || q.down > 0) continue;
   const dd = hyp(q.x - c.x, q.y - c.y);
   if (dd < reach) return null;
   if (q === G.slide || markOf(q) !== c) continue;
   const R = q.s36;
   if (!R || R.k !== S.k || R.fr < FR - 1) continue;
   if (dd > SAG36.cushMax + 10 || (q.x - c.x) * ux + (q.y - c.y) * uy < 0) continue;
   if (dd < bd) {
    bd = dd;
    best = q;
   }
  }
  if (!best) return null;
  const t0 = DEF.tight * (DF.tight || 1), tt = Math.min(t0, 5 * (DF.tight || 1));
  const vx = ux * tt + 2, vy = uy * tt;
  if (hyp(vx, vy) >= reach) return null;
  const o = {
   d: best,
   rx: best.x,
   ry: best.y,
   fx0: typeof fx !== 'undefined' && fx ? fx.length : -1,
   tx0: best.tx,
   ty0: best.ty
  };
  best.x = c.x + vx;
  best.y = c.y + vy;
  o.fxX = best.x;
  o.fxY = best.y;
  return o;
 }
 function release36(o, c) {
  const d = o.d, ox = o.rx - d.x, oy = o.ry - d.y;
  d.x = o.rx;
  d.y = o.ry;
  if ((d.tx !== o.tx0 || d.ty !== o.ty0) && !(d.tx === c.x && d.ty === c.y)) {
   d.tx += ox;
   d.ty += oy;
  }
  if (o.fx0 >= 0 && typeof fx !== 'undefined' && fx) for (let i = o.fx0; i < fx.length; i++) {
   const e = fx[i];
   if (e && e.x === o.fxX) {
    e.x += ox;
    e.y += oy;
   }
  }
  st('eng36');
 }
 function wrapEng(name, reachOf) {
  const O = window[name];
  if (typeof O !== 'function') return;
  window[name] = function() {
   let o = null;
   const G = typeof game !== 'undefined' ? game : null, c = G && G.carrier;
   try {
    o = engage36(c, reachOf());
   } catch (e) {
    console.error(e);
    o = null;
   }
   if (!o) return O.apply(this, arguments);
   try {
    return O.apply(this, arguments);
   } finally {
    try {
     release36(o, c);
    } catch (e) {
     console.error(e);
    }
   }
  };
 }
 wrapEng('doDodge', () => 14);
 wrapEng('doBull', () => typeof BULL !== 'undefined' && BULL.reach || 17);
 window.v36sagTh = function(G, p, c) {
  try {
   if (offS() || !G || !p || !c || p.netCtl || p.team !== 'D') return null;
   const S = G.sag36;
   if (!S || S.who !== c || S.fr !== FR || !sagOn(G, c)) return null;
   const sk = skill(p), tpos = cl(S.Tpos + biasOf(p) * (1 - sk) * SAG36.bias, 0, 1);
   const step = cl((S.idle - lerp(SAG36.idle0[0], SAG36.idle0[1], sk)) / SAG36.ramp, 0, 1) * SAG36.stepMax;
   const tgt = Math.max(tpos, S.drv * (.7 + .3 * tpos), step);
   let R = p.s36;
   if (!R || R.k !== S.k || R.fr < FR - 3) R = p.s36 = {
    k: S.k,
    th: tgt,
    fr: FR
   };
   if (R.fr !== FR) {
    const up = S.dt / lerp(SAG36.react[0], SAG36.react[1], sk), dn = S.dt / SAG36.back;
    R.th = tgt > R.th ? Math.min(tgt, R.th + up) : Math.max(tgt, R.th - dn);
    R.fr = FR;
   }
   S.eff = R.th;
   S.effFr = FR;
   const t0 = 5 * (DF.tight || 1), cush = t0 + (SAG36.cushMax - t0) * (1 - R.th);
   const th = cl(1 - (cush - t0) / Math.max(1, SAG.cush - t0), 0, 1);
   if (R.th < SAG36.chkT) st('sagFr');
   return th;
  } catch (e) {
   console.error(e);
   return null;
  }
 };
})();
