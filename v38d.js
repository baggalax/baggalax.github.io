(function() {
 'use strict';
 const off = () => !!window.__rl_no38d || !!window.__rl_v124gb;
 const part = k => !off() && !window['__rl_no38d' + k];
 const offline = G => !!G && !G.online && !(G.meta && G.meta.online) || !!window.V39D && V39D.auth(G);
 const N = {
  ride: 0,
  zc: 0,
  zu: 0,
  zuHold: 0,
  far: 0,
  farD: 0,
  emo: 0,
  sw: 0,
  swOnBall: 0,
  swFast: 0
 };
 const V = window.V38D = {
  N: N,
  on: () => !off()
 };
 const hyp = Math.hypot;
 const HIST = new WeakMap;
 function lagged(G, p, lag) {
  let H = HIST.get(p);
  if (!H || H.G !== G || G.t < H.last) {
   H = {
    G: G,
    last: G.t,
    h: []
   };
   HIST.set(p, H);
  }
  const h = H.h;
  if (!h.length || h[h.length - 1][0] !== G.t) h.push([ G.t, p.x, p.y ]);
  H.last = G.t;
  while (h.length > 2 && h[1][0] <= G.t - lag) h.shift();
  return h[0];
 }
 function phase(p) {
  const s = String(p.pl && p.pl.id || p.idx || p.role || 'x') + (p.team || '');
  let h = 7;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return (h >>> 0) % 6283 / 1e3;
 }
 const SIDE = new WeakMap;
 const RS = new WeakMap;
 V.rideFar = function(G, f, car, dt) {
  if (!part('r') || !G || !f || !car || !offline(G) || G.tutorial) return null;
  let st = RS.get(f);
  if (!st || st.G !== G || st.car !== car) {
   st = {
    G: G,
    car: car,
    near: 0,
    back: 0,
    jam: 0
   };
   RS.set(f, st);
  }
  const ph = phase(f), d = hyp(f.x - car.x, f.y - car.y), step = dt || 1 / 60;
  let sd = SIDE.get(f);
  const rel = f.y - car.y;
  if (sd == null || !(st.flipT > 0) && rel * sd < 0 && Math.abs(rel) > 5) {
   sd = rel < 0 ? -1 : 1;
   SIDE.set(f, sd);
  }
  N.ride++;
  G.ride38 = (G.ride38 || 0) + 1;
  const mates = (G.players || []).filter(p => p !== f && p !== car && (p.team === 'D' || p.team === 'G') && !(p.down > 0)).concat((G.farC || []).filter(p => p !== f));
  const free = (x, y) => {
   for (const o of mates) if (hyp(o.x - x, o.y - y) < 9) return false;
   return true;
  };
  const spot = (sd_, s, a0, r, dx0) => [ s[1] + Math.cos(sd_ * a0) * r + dx0, s[2] + Math.sin(sd_ * a0) * r ];
  if (d < 5.5) st.jam += step; else st.jam = Math.max(0, st.jam - step);
  {
   const s = lagged(G, car, .2), a = spot(sd, s, .96, 8.5, 0), b = spot(-sd, s, .96, 8.5, 0);
   st.flipT = (st.flipT || 0) - step;
   if (st.flipT <= 0 && (!free(a[0], a[1]) && free(b[0], b[1]) || st.jam > .6)) {
    st.flipT = 1;
    sd = -sd;
    SIDE.set(f, sd);
    if (st.jam > .6) {
     st.jam = 0;
     st.back = Math.max(st.back, .6);
    }
    N.rideFlip = (N.rideFlip || 0) + 1;
   }
  }
  if (st.back > 0) {
   st.back -= step;
   const s = lagged(G, car, .5), q = spot(sd, s, 1.25, 13, -3);
   return [ q[0], q[1], 25 ];
  }
  const s = lagged(G, car, .2);
  const ang = sd * (.96 + Math.sin(G.t * 2.1 + ph) * .3);
  const cush = 8.5 + Math.sin(G.t * 2.9 + ph * 1.3) * 1.2;
  if (d < 10) {
   st.near += step;
   if (st.near > 1.05 + Math.sin(ph) * .25) {
    st.near = 0;
    st.back = .8 + Math.cos(ph) * .2;
    N.rideBack = (N.rideBack || 0) + 1;
   }
  } else st.near = Math.max(0, st.near - step * .5);
  return [ s[1] + Math.cos(ang) * cush, s[2] + Math.sin(ang) * cush, 40 ];
 };
 V.rideNear = function(G, p, c, dt) {
  if (!part('r') || !G || !p || !c || p.netCtl || !offline(G) || G.tutorial) return null;
  const q = V.rideFar(G, p, c, dt);
  if (!q) return null;
  N.rideNear = (N.rideNear || 0) + 1;
  return q;
 };
 function cush38(G, p, c, gx, drive) {
  let th = null;
  if (gx > MIDX && typeof window.v36sagTh === 'function') {
   try {
    th = window.v36sagTh(G, p, c);
   } catch (e) {
    th = null;
   }
  }
  if (th == null) th = threatOf(c, gx, true, drive);
  return 7 + (SAG.cush - 7) * (1 - clamp(th, 0, 1));
 }
 V.zoneC = function(G, p, c) {
  if (!part('z') || !G || !p || !c || !offline(G) || G.tutorial || p.netCtl) return false;
  const s = lagged(G, c, .15), ph = phase(p);
  const dx = GX - s[1], dy = CY - s[2], L = hyp(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const t = cush38(G, p, c, GX, !!G.drive), sw = Math.sin(G.t * 1.7 + ph) * 1.2;
  p.tx = s[1] + ux * t + 2 - uy * sw;
  p.ty = s[2] + uy * t + ux * sw;
  N.zc++;
  return true;
 };
 V.zoneU = function(G, d, c, q) {
  if (!part('z') || !G || !d || !c || !offline(G) || G.tutorial) return null;
  const me = G.dctl;
  if (me && me !== d && !(me.down > 0) && G.run && hyp(me.x - c.x, me.y - c.y) < 12 && q) {
   N.zuHold++;
   return [ q[0] + (c.x - q[0]) * .25, q[1] + (c.y - q[1]) * .25, PACE.dBall * .9 ];
  }
  const s = lagged(G, c, .15), ph = phase(d);
  const drive = hyp(c.x - DGX, c.y - CY) < 70 || G.dBeat > 0;
  const dx = DGX - s[1], dy = CY - s[2], L = hyp(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const t = cush38(G, d, c, DGX, drive), sw = Math.sin(G.t * 1.7 + ph) * 1.2;
  N.zu++;
  return [ s[1] + ux * t - 2 - uy * sw, s[2] + uy * t + ux * sw, PACE.dBall ];
 };
 const drift0 = typeof drift193 === 'function' ? drift193 : null;
 if (drift0) drift193 = function(G, f, dt) {
  const j = drift0.apply(this, arguments);
  if (!part('f') || !G || !f || !offline(G) || G.tutorial || f.role === 'G' || !on193(G)) return j;
  const b = G.ball;
  if (!b) return j;
  if (f.role === 'A' || f.role === 'R') {
   if (f.team === 'C' ? b.x < MIDX : b.x > MIDX) return j;
   if (G.rideX && G.rideX.get(f)) return j;
   const ph = phase(f), t = G.t;
   N.far++;
   return [ Math.sin(t * .55 + ph) * 13 + Math.sin(t * 1.3 + ph * 2.1) * 4, Math.sin(t * .43 + ph * 1.7) * 15 + Math.cos(t * 1.1 + ph) * 4 ];
  }
  if (f.role === 'D' && f.mk) {
   if (f.team === 'U' && screen === 'live' && G.clearing && b.x < MIDX && clr26ok(G)) return j;
   const m = f.mk, s = lagged(G, m, .35), ph = phase(f);
   N.farD++;
   return [ j[0] * .4 + (s[1] - m.x) + Math.sin(G.t * .9 + ph) * 2.2, j[1] * .4 + (s[2] - m.y) + Math.cos(G.t * .7 + ph) * 2.2 ];
  }
  return j;
 };
 const PL = new WeakMap;
 function plantTick(dt) {
  const G = game;
  if (!part('e') || !G || screen !== 'live' || !offline(G) || G.tutorial || !G.players) return;
  const b = G.ball, c = G.carrier;
  if (!b || b.state !== 'held' || !c || c.team !== 'O') return;
  for (const p of G.players) {
   if (p.team !== 'O' || p === c || p === G.ctrl || p.gk || p.down > 0 || p.stun > 0 || p.playT || p.pickSet || p.callPick || p.cut181 || G.help18 === p || p.coverT > 0 || isChaser(p) || p.playHold && (G.playRun && !G.playRun.done || G.pset || G.cset)) {
    PL.delete(p);
    continue;
   }
   let s = PL.get(p);
   if (!s || s.G !== G) {
    PL.set(p, {
     G: G,
     x: p.x,
     y: p.y,
     t: 0,
     n: 0
    });
    continue;
   }
   if (hyp(p.x - s.x, p.y - s.y) > 2.5) {
    s.x = p.x;
    s.y = p.y;
    s.t = 0;
    continue;
   }
   s.t += dt;
   if (s.t < 1.8) continue;
   const cg = hyp(p.x - GX, p.y - CY);
   let ux, uy;
   if (cg < CREASE + 16) {
    ux = (p.x - GX) / (cg || 1);
    uy = (p.y - CY) / (cg || 1);
    const k = s.n % 2 ? 1 : -1;
    const rx = -uy * k, ry = ux * k;
    ux = ux * .5 + rx * .85;
    uy = uy * .5 + ry * .85;
   } else {
    const tx = GX - 70, ty = CY + (c.y - CY) * .3;
    ux = tx - p.x;
    uy = ty - p.y;
    const l = hyp(ux, uy) || 1;
    ux /= l;
    uy /= l;
    const a = s.n % 2 ? .6 : -.6;
    const ca = Math.cos(a), sa = Math.sin(a);
    const vx = ux * ca - uy * sa, vy = ux * sa + uy * ca;
    ux = vx;
    uy = vy;
   }
   const l2 = hyp(ux, uy) || 1;
   ux /= l2;
   uy /= l2;
   let nx = clamp(p.x + ux * 20, MIDX + 24, GX - 20), ny = clamp(p.y + uy * 20, FT + 14, FB - 8);
   if (hyp(nx - GX, ny - CY) < CREASE + 6) {
    const k = (CREASE + 8) / (hyp(nx - GX, ny - CY) || 1);
    nx = GX + (nx - GX) * k;
    ny = CY + (ny - CY) * k;
   }
   if (hyp(nx - c.x, ny - c.y) < 24) {
    nx = clamp(p.x - ux * 16, MIDX + 24, GX - 20);
    ny = clamp(p.y - uy * 16, FT + 14, FB - 8);
   }
   p.tx = nx;
   p.ty = ny;
   p.spd = PACE.cut;
   p.wander = 1.1;
   s.t = 0;
   s.n++;
   s.x = p.x;
   s.y = p.y;
   N.emo++;
   G.plant38 = (G.plant38 || 0) + 1;
  }
 }
 const live0 = typeof updateLive === 'function' ? updateLive : null;
 if (live0) updateLive = function(dt) {
  const r = live0.apply(this, arguments);
  try {
   plantTick(dt);
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 const SW = {
  onBall: 10,
  hyst: 5,
  farMe: 30
 };
 function pick38(G, c, def, me) {
  const cl = dClosest(c, def, null);
  if (cl && hyp(cl.x - c.x, cl.y - c.y) <= SW.onBall) {
   if (me !== cl && !(me.down > 0) && hyp(me.x - c.x, me.y - c.y) <= SW.onBall) return me;
   return cl;
  }
  const cg = c7GoalD(c), prev = G._d38w;
  let best = null, bd = 1e9;
  const cand = def.filter(d => d && d.team === 'O' && !(d.down > 0));
  if (r26On(G) && c.x > MIDX && !(G.no26 > G.t)) for (const f of r26Riders(G)) cand.push(f);
  for (const d of cand) {
   const lim = cg - C7.behind + (d === me || d === prev ? SW.hyst : 0);
   if (c7GoalD(d) >= lim) continue;
   const k = hyp(d.x - c.x, d.y - c.y);
   if (k < bd) {
    bd = k;
    best = d;
   }
  }
  G._d38w = best;
  return best || cl;
 }
 const auto1 = typeof dAutoTick === 'function' ? dAutoTick : null;
 if (auto1) dAutoTick = function(G, c, b, def, manual, dt) {
  if (!part('sw') || !G || !offline(G) || !C7on(G) || !window.V361D || !V361D.on() || window.__rl_no361dsw) return auto1.apply(this, arguments);
  if (!c || b.state !== 'held') return auto1.apply(this, arguments);
  const me = G.dctl;
  if (!me || me.down > 0) return auto1.apply(this, arguments);
  if (!dAutoOn() || manual || G.dHold || G.chk && G.chk.cd > 0) return auto1.apply(this, arguments);
  const want = pick38(G, c, def, me);
  if (!want || want === me) {
   G.dSwT = 0;
   G.c7T = 0;
   G._d361w = null;
   return;
  }
  const dm = hyp(me.x - c.x, me.y - c.y), dw = hyp(want.x - c.x, want.y - c.y);
  const beaten = dm > SW.onBall && c7GoalD(me) > c7GoalD(c) + C7.behind;
  const fast = dw <= SW.onBall && dm > SW.farMe;
  const since = G.t - (G.dSwAt != null ? G.dSwAt : -99);
  if (G._d361w !== want) {
   G._d361w = want;
   G.dSwT = 0;
   G.c7T = 0;
  }
  if (since < C7.cd && !fast) return;
  const hold = beaten ? C7.hold : DSW38.hold;
  G.dSwT = (G.dSwT || 0) + dt;
  if (G.dSwT >= hold && dTake(G, want, beaten ? 'c7beat' : fast ? 'onball38' : 'run38')) {
   if (beaten) G.c7n = (G.c7n || 0) + 1; else G.sw38 = (G.sw38 || 0) + 1;
   if (window.V361D) {
    V361D.N.sw++;
   }
   G.d361sw = (G.d361sw || 0) + 1;
   G.c7T = 0;
   G._d361w = null;
   N.sw++;
   if (fast) N.swFast++;
   if (dw <= SW.onBall) N.swOnBall++;
  }
 };
})();
