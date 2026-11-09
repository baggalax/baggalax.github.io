(function() {
 'use strict';
 const off = () => !!window.__rl_no361d || !!window.__rl_v124gb;
 const offline = G => !!G && !G.online && !(G.meta && G.meta.online);
 const N = {
  face: 0,
  sw: 0,
  jk: 0,
  ct: 0,
  ctFall: 0
 };
 const V = window.V361D = {
  N: N,
  on: () => !off()
 };
 const FACE_V = 12;
 const G0 = () => game;
 const face0 = typeof face21a === 'function' ? face21a : null;
 function userD(p) {
  const G = game;
  return !!G && screen === 'defense' && p === G.dctl && p.team === 'O' && !(p.down > 0) && !isChaser(p);
 }
 if (face0) face21a = function(p, def) {
  if (off() || !p || !userD(p)) return face0(p, def);
  const d0 = p.d21, f0 = p.f21;
  const r = face0(p, def);
  if (p._v211x || p._f21hold > G0().t) {
   p._d361t = null;
   return r;
  }
  const G = game, d8 = D8on();
  if (p._d361t == null || G.t < p._d361t || G.t - p._d361t > .5) {
   p._d361t = G.t;
   p._d361x = p.x;
   p._d361y = p.y;
   p._d361v = [ 0, 0 ];
  } else if (G.t - p._d361t >= .1) {
   const k = G.t - p._d361t;
   p._d361v = [ (p.x - p._d361x) / k, (p.y - p._d361y) / k ];
   p._d361t = G.t;
   p._d361x = p.x;
   p._d361y = p.y;
  }
  const v = p._d361v || [ 0, 0 ], sp = Math.hypot(v[0], v[1]);
  p.d21 = d0;
  p.f21 = f0;
  if (d8 && p.d21 == null) p.d21 = (p.f21 != null ? p.f21 : def) ? 0 : 4;
  let dx, dy;
  if (sp > FACE_V) {
   dx = v[0];
   dy = v[1];
  } else {
   const b = G.ball, car = G.dcar, tgt = car || b && b.state === 'pass' && b.to || null;
   if (tgt) {
    dx = tgt.x - p.x;
    dy = tgt.y - p.y;
   } else if (b) {
    dx = b.x - p.x;
    dy = b.y - p.y;
   }
  }
  if (dx != null) {
   if (d8) {
    if (Math.hypot(dx, dy) > 2) setD21(p, d8of(dx, dy, p.d21));
   } else if (Math.abs(dx) > 2) p.f21 = dx > 0;
  }
  if (p.d21 !== d0 || p.f21 !== f0) N.face++;
  return p.f21 != null ? p.f21 : def;
 };
 const auto0 = typeof dAutoTick === 'function' ? dAutoTick : null;
 if (auto0) dAutoTick = function(G, c, b, def, manual, dt) {
  if (off() || window.__rl_no361dsw || !offline(G) || !C7on(G)) return auto0.apply(this, arguments);
  if (!c || b.state !== 'held') return auto0.apply(this, arguments);
  const me = G.dctl;
  if (!me || me.down > 0) return auto0.apply(this, arguments);
  if (!dAutoOn() || manual || G.dHold || G.chk && G.chk.cd > 0) return auto0.apply(this, arguments);
  const want = dGoalSide(c, def, null) || dClosest(c, def, null);
  if (!want || want === me) {
   G.dSwT = 0;
   G.c7T = 0;
   G._d361w = null;
   return;
  }
  const beaten = c7GoalD(me) > c7GoalD(c) + C7.behind;
  const since = G.t - (G.dSwAt != null ? G.dSwAt : -99);
  if (G._d361w !== want) {
   G._d361w = want;
   G.dSwT = 0;
   G.c7T = 0;
  }
  if (since < C7.cd) return;
  const hold = beaten ? C7.hold : DSW38.hold;
  G.dSwT = (G.dSwT || 0) + dt;
  if (G.dSwT >= hold && dTake(G, want, beaten ? 'c7beat' : 'run38')) {
   if (beaten) G.c7n = (G.c7n || 0) + 1; else G.sw38 = (G.sw38 || 0) + 1;
   G.c7T = 0;
   G._d361w = null;
   N.sw++;
   G.d361sw = (G.d361sw || 0) + 1;
  }
 };
 V.jockey = function(G, a, h, dt) {
  if (off() || !G || !a || !h || !offline(G) || G.tutorial) return false;
  const C = G.dclear;
  if (!C) return false;
  const J = C.j361 && C.j361.a === a ? C.j361 : C.j361 = {
   a: a,
   hist: [],
   ph: (a.idx || 0) * 1.7 + (C.outT || 0) * 3.1
  };
  J.hist.push([ G.t, h.x, h.y ]);
  while (J.hist.length > 2 && J.hist[1][0] <= G.t - .2) J.hist.shift();
  const s = J.hist[0];
  const kx = s[1], ky = s[2];
  let ang = Math.atan2(a.y - ky, a.x - kx);
  if (!isFinite(ang)) ang = 0;
  const lean = .35;
  let da = -ang;
  while (da > Math.PI) da -= 2 * Math.PI;
  while (da < -Math.PI) da += 2 * Math.PI;
  ang += da * lean + Math.sin(G.t * 2.3 + J.ph) * .35;
  const cush = 6.5 + Math.sin(G.t * 3.1 + J.ph * 1.3) * 1;
  moveTo(a, kx + Math.cos(ang) * cush, ky + Math.sin(ang) * cush, PACE.cut * 1.05, dt);
  N.jk++;
  return true;
 };
 const take0 = typeof cpuTakeover === 'function' ? cpuTakeover : null;
 if (take0) cpuTakeover = function() {
  const G = game;
  if (off() || window.__rl_no361dct || !G || !offline(G) || G.tutorial || G.practice || G.brave || screen !== 'live' || H7on()) return take0.apply(this, arguments);
  if (!G.ot && G.clock <= 0) return take0.apply(this, arguments);
  const ts = G.turnSpot;
  if (!(ts && ts.x < MIDX - 4)) return take0.apply(this, arguments);
  G.turnSpot = null;
  if (startDefenseLive()) {
   N.ct++;
   G.d361ct = (G.d361ct || 0) + 1;
   return;
  }
  G.turnSpot = ts;
  N.ctFall++;
  return take0.apply(this, arguments);
 };
})();
