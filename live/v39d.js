(function() {
 'use strict';
 const off = () => !!window.__rl_no39d || !!window.__rl_v124gb || !!window.__rl_no38d;
 const N = {
  auth: 0,
  swCar: 0,
  swIdle: 0,
  keep: 0,
  mine: 0
 };
 const V = window.V39D = {
  N: N,
  on: () => !off(),
  SW: {
   onBall: 10,
   farMe: 30,
   idleMs: 2e3,
   manual: 2,
   hold: .25,
   gap: 1.2
  }
 };
 const hyp = Math.hypot;
 function authLive(G) {
  const R = window.RLNET;
  return !!G && !!G.online && !!R && !!R.inGame && !!R.auth && typeof game !== 'undefined' && G === game && screen === 'live' && !G.tutorial && !G.practice;
 }
 V.auth = function(G) {
  if (off() || window.__rl_no39dg || !authLive(G)) return false;
  N.auth++;
  return true;
 };
 if (window.V38D) for (const k of [ 'zoneC', 'rideNear' ]) {
  const f0 = V38D[k];
  if (typeof f0 !== 'function') continue;
  V38D[k] = function(G, p) {
   if (p && p.netCtl && !off() && !window.__rl_no39dg && authLive(G)) {
    p.netCtl = false;
    N.mine++;
    try {
     return f0.apply(this, arguments);
    } finally {
     p.netCtl = true;
    }
   }
   return f0.apply(this, arguments);
  };
 }
 const R = window.RLNET;
 if (R && typeof R.liveD === 'function') {
  const live0 = R.liveD;
  let idleT = 0, lastIdle = -99;
  R.liveD = function(G, dt, c, b) {
   try {
    if (!off() && !window.__rl_no39dsw && authLive(G) && c && b && b.state === 'held') {
     const D = G.players.filter(p => p.team === 'D' && !(p.down > 0));
     if (D.length) {
      let cl = null, cd = 1e9;
      for (const d of D) {
       const k = hyp(d.x - c.x, d.y - c.y);
       if (k < cd) {
        cd = k;
        cl = d;
       }
      }
      const me = D.find(p => p.idx === R.ctlIdx) || null, sinceMan = G.t - (R.manualSw != null ? R.manualSw : -9);
      if (c !== R.lastCar) {
       if (sinceMan > 1.5 && cl && cd <= V.SW.onBall) {
        const keep = me && hyp(me.x - c.x, me.y - c.y) <= V.SW.onBall;
        R.lastCar = c;
        R.ctlIdx = keep ? me.idx : cl.idx;
        idleT = 0;
        if (keep) N.keep++; else N.swCar++;
        G.sw39 = (G.sw39 || 0) + (keep ? 0 : 1);
       }
      } else {
       const r = R.rin, moving = r && r.j && r.j[2] > 0 && performance.now() - (R.rinAt || 0) < 1500;
       const idle = !moving && performance.now() - (R.rinMoveAt || -1e9) > V.SW.idleMs;
       if (idle && sinceMan > V.SW.manual && me && cl && cl !== me && cd <= V.SW.onBall && hyp(me.x - c.x, me.y - c.y) >= V.SW.farMe && G.t - lastIdle >= V.SW.gap) {
        idleT += dt || 0;
        if (idleT >= V.SW.hold) {
         R.ctlIdx = cl.idx;
         idleT = 0;
         lastIdle = G.t;
         N.swIdle++;
         G.sw39 = (G.sw39 || 0) + 1;
         G.sw39i = (G.sw39i || 0) + 1;
        }
       } else idleT = 0;
      }
     }
    }
   } catch (e) {
    console.error(e);
   }
   return live0.apply(this, arguments);
  };
 }
})();
