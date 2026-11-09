(function() {
 'use strict';
 const W = window;
 const FD39 = {
  back: .5,
  ret: .5,
  n: 0,
  last: null
 };
 W.FD39 = FD39;
 const off = () => !!(W.__rl_no39fd || W.__rl_v124gb);
 let pend = false;
 function outBack(path) {
  if (!path || path.length < 3) return null;
  const s = path[0], e = path[path.length - 1];
  let far = 0, fx = 0, fy = 0;
  for (const q of path) {
   const qx = q[0] - s[0], qy = q[1] - s[1], d = Math.hypot(qx, qy);
   if (d > far) {
    far = d;
    fx = qx;
    fy = qy;
   }
  }
  const L = Math.hypot(e[0] - s[0], e[1] - s[1]);
  const minPx = typeof DODGE !== 'undefined' && DODGE.minPx || 30;
  if (far < minPx) return null;
  if (!(fx < 0 && -fx >= FD39.back * far)) return null;
  const pullMin = W.SHOT26 && SHOT26.CFG && SHOT26.CFG.pullMin || 20;
  const back = s[0] - e[0] < pullMin && Math.abs(e[1] - s[1]) < FD39.ret * far;
  if (L > FD39.ret * far && !back) return null;
  return {
   far: Math.round(far),
   L: Math.round(L),
   fx: Math.round(fx),
   fy: Math.round(fy)
  };
 }
 function ok() {
  try {
   if (off() || typeof game === 'undefined' || !game || typeof screen === 'undefined' || screen !== 'live') return false;
   const G = game, c = G.carrier;
   if (!c || c.team !== 'O' || !G.ball || G.ball.state !== 'held') return false;
   if (typeof tut28Step === 'function' && tut28Step()) return false;
   return !!(W.SHOT26 && typeof SHOT26.faceDodge === 'function' && SHOT26.on && SHOT26.on());
  } catch (e) {
   return false;
  }
 }
 function wire() {
  if (typeof W.classifySwipe !== 'function' || typeof W.doDodge !== 'function') return false;
  const oCS = W.classifySwipe, oDD = W.doDodge;
  W.classifySwipe = function(path, dur) {
   const sw = oCS.apply(this, arguments);
   try {
    if (!sw || !ok()) return sw;
    const ob = outBack(path);
    if (!ob) return sw;
    pend = true;
    FD39.last = {
     from: sw.kind,
     ux: +(+sw.ux).toFixed(2),
     uy: +(+sw.uy).toFixed(2),
     far: ob.far,
     L: ob.L,
     t: game.t
    };
    const from = typeof handOf17 === 'function' ? handOf17(game.carrier) : 1;
    return Object.assign({}, sw, {
     kind: 'split',
     ux: .35,
     uy: from >= 0 ? 1 : -1,
     fd39: true
    });
   } catch (e) {
    console.error(e);
    return sw;
   }
  };
  W.doDodge = function(kind) {
   if (!pend) return oDD.apply(this, arguments);
   pend = false;
   try {
    if (!ok() || kind !== 'split') return oDD.apply(this, arguments);
    const G = game, n0 = SHOT26.S.fds || 0;
    SHOT26.faceDodge({
     maxPull: FD39.last ? FD39.last.far : 0,
     fd39: true
    });
    if ((SHOT26.S.fds || 0) > n0 && G.dodge && G.dodge.who === G.carrier) {
     FD39.n++;
     G.fd39 = (G.fd39 || 0) + 1;
     if (FD39.last) FD39.last.ok = true;
     return G.dodge;
    }
    return null;
   } catch (e) {
    console.error(e);
    return null;
   }
  };
  return true;
 }
 if (!wire()) W.addEventListener('load', wire);
})();
