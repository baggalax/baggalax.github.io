(function() {
 'use strict';
 const off = () => !!(window.__rl_no38g || window.__rl_v124gb);
 const V = window.V38G = {
  log6: [],
  log10: [],
  log11: [],
  n10: {
   u: 0,
   c: 0,
   sv: 0
  },
  n11: {
   tries: 0,
   go: 0,
   stay: 0,
   right: 0,
   wrong: 0,
   whiff: 0,
   lev: 0
  }
 };
 V.on6 = () => !off() && !window.__rl_no38g6;
 V.on10 = () => !off() && !window.__rl_no38g10;
 V.on11 = () => !off() && !window.__rl_no38g11;
 const push = (L, o) => {
  if (L.length < 60) L.push(o);
 };
 V.gk = function(G, c, b) {
  const S = G.g38 || (G.g38 = {
   who: null,
   left: false
  });
  if (!(c && c.gk && b && b.state === 'held')) {
   S.who = null;
   S.left = false;
   G.gkOut = false;
   return false;
  }
  const out = Math.hypot(c.x - DGX, c.y - CY) > CREASE + 1;
  if (S.who !== c) {
   S.who = c;
   S.left = out;
   push(V.log6, {
    t: +(+G.t || 0).toFixed(2),
    gain: out ? 'outside' : 'inside'
   });
  } else if (out && !S.left) {
   S.left = true;
   push(V.log6, {
    t: +(+G.t || 0).toFixed(2),
    left: 1
   });
  }
  G.gkOut = S.left;
  return S.left;
 };
 const curG = () => typeof game !== 'undefined' ? game : null;
 const reset6 = () => {
  const G = curG();
  if (G) G.g38 = null;
 };
 const brave10 = G => V.on10() && !!G && !!G.brave && !G.tutorial && !G.practice && !G.penPending && !G.over && !!G.players && !!G.lu;
 const isGk = p => p.team === 'G' || p.team === 'G2' || p.role === 'g' || p.role === 'g2' || !!p.gk;
 const keepDown = (a, src) => {
  if (src && src.down > 0) {
   a.down = src.down;
   a.downT0 = src.downT0;
   a.fallDir = src.fallDir;
   a.stun = src.stun;
   a.kb = src.kb;
  }
 };
 function braveLiveClear(p, why) {
  const G = game, prev = G.players.slice();
  const gkC = p.team === 'G2' || p.far && p.role === 'G' || p.team === 'O' && !!p.gk;
  const fieldO = prev.filter(q => q.team === 'O' && !q.gk && q !== p), fieldD = prev.filter(q => q.team === 'D');
  const g2 = prev.find(q => q.team === 'G2') || G.gk2 || null;
  const cg = prev.find(q => q.team === 'G') || (G.farC || []).find(f => f.role === 'G') || null;
  const SP = curSpots(), P = [];
  const mkO = (i, src) => {
   const a = mkPlayer('O', i, src.x, src.y);
   a.pl = src.pl;
   a.home = (SP[i] || SP[SP.length - 1]).slice();
   a.anim = src.anim || 0;
   keepDown(a, src);
   a.tx = a.home[0];
   a.ty = a.home[1];
   a.wander = Math.hypot(a.home[0] - a.x, a.home[1] - a.y) / PACE.cut + .4;
   a.spd = PACE.cut * 1.1;
   P.push(a);
   return a;
  };
  const c = mkO(0, p);
  c.rr = 'M';
  if (gkC) {
   c.gk = true;
   c.spd = 30;
   c.push = true;
   if (!c.pl) c.pl = PP(G.lu[0].G);
  }
  fieldO.forEach((q, i) => {
   const a = mkO(i + 1, q);
   a.rr = 'M';
  });
  fieldD.forEach((src, i) => {
   const d = mkPlayer('D', i, src.x, src.y);
   d.anim = src.anim || 0;
   keepDown(d, src);
   d.pl = src.pl;
   d.rr = 'M';
   d.react = rnd(.15, .4);
   const m = P[i] || c;
   d.mark = m;
   m.mark0 = d;
   P.push(d);
  });
  const gk = mkPlayer('G', 0, cg ? cg.x : GX - 5, cg ? cg.y : CY);
  gk.pl = PP(G.lu[1].G);
  P.push(gk);
  G.farU = gkC ? [] : [ farMk('U', 'G', g2 ? g2.x : DGX + 5, g2 ? g2.y : CY, PP(G.lu[0].G)) ];
  G.farC = [];
  G.farMode = 'uO';
  farPair(G);
  const cc = G.cc;
  G.players = P;
  G.goalie = gk;
  G.carrier = c;
  G.dcar = null;
  G.dclear = null;
  G.ball = {
   x: c.x + BX,
   y: c.y + BY,
   state: 'held',
   vx: 0,
   vy: 0
  };
  resetPossState();
  G.gkOver = gkC ? {
   t: 0
  } : null;
  G.poleOver = null;
  if (gkC) G.gkClears = (G.gkClears || 0) + 1;
  G.cc = cc || {
   t: CLEAR_T
  };
  G.ruleGrace = .5;
  G.clearing = true;
  G.clears8 = (G.clears8 || 0) + 1;
  G.checkT = -1;
  G.run = {
   x: 1,
   y: 0
  };
  stick = null;
  shootP = null;
  screen = 'live';
  addFx('txt', c.x, c.y - 26, {
   s: why || 'CARRY IT UP!',
   col: '#7dff7a',
   life: 1
  });
  addFx('cue', 0, 0, {
   s: gkC ? 'CAGE TO CAGE!' : 'CARRY IT UP!',
   col: '#7dff7a',
   life: 1.4
  });
  SFX.catch();
  V.n10.u++;
  push(V.log10, {
   side: 'U',
   t: +(+G.t || 0).toFixed(2),
   who: gkC ? 'gk' : 'field',
   x: Math.round(c.x),
   y: Math.round(c.y)
  });
  return true;
 }
 function braveDefLive(sv) {
  const G = game, prev = G.players.slice();
  const pO = prev.filter(q => q.team === 'O' && !q.gk), pD = prev.filter(q => q.team === 'D'), pG = prev.find(q => q.team === 'G') || null;
  const pOgk = prev.find(q => q.team === 'O' && q.gk) || null;
  const pG2 = pOgk || (G.farU || []).find(f => f.role === 'G') || null;
  if (!pD.length) return false;
  startDefense();
  if (screen !== 'defense' || !G.players) return true;
  const atk = dAtk(), def = dDef();
  atk.forEach((a, i) => {
   const s = pD[i];
   if (!s) return;
   a.x = s.x;
   a.y = s.y;
   a.anim = s.anim || 0;
   keepDown(a, s);
   if (s.pl) a.pl = s.pl;
   a.wt = rnd(.3, .8);
  });
  def.forEach((d, i) => {
   const s = pO[i];
   if (!s) return;
   d.x = s.x;
   d.y = s.y;
   d.anim = s.anim || 0;
   keepDown(d, s);
   if (s.pl) d.pl = s.pl;
  });
  const g2 = G.players.find(q => q.team === 'G2');
  if (g2 && pG2) {
   g2.x = pG2.x;
   g2.y = pG2.y;
   g2.anim = pG2.anim || 0;
   if (pOgk) g2.homeRun = true;
  }
  G.gkOver = null;
  const car = atk[0];
  if (!car) return true;
  G.dcar = car;
  [G.ball.x, G.ball.y] = dStick(car);
  G.ball.state = 'held';
  G.chk = {
   n: 0,
   cd: 0,
   t: 0,
   who: car
  };
  G.dDecide = rnd(.6, 1);
  car.tgt = [ clamp(car.x - 90, DGX + 60, MIDX - 20), clamp(car.y + rnd(-15, 15), FT + 16, FB - 8) ];
  G.dctl = def.find(d => d.mark === car) || nearestTo('O', car.x, car.y);
  G.farC = (G.farC || []).filter(f => f.role !== 'G');
  const gk = mkPlayer('G', 0, pG ? pG.x : GX - 5, pG ? pG.y : CY);
  gk.pl = PP(G.lu[1].G);
  G.players.push(gk);
  if (sv) {
   sv2111Begin(G, gk, car);
   V.n10.sv++;
  }
  G.cpuClear = true;
  G.cpuClears = (G.cpuClears || 0) + 1;
  G.ccC = {
   t: CLEAR_T
  };
  G.ruleGrace = .5;
  addFx('cue', 0, 0, {
   s: sv ? 'SAVE - THEY CLEAR IT - RIDE!' : 'THEY CLEAR IT - RIDE!',
   col: '#ff9a8a',
   life: 1.3
  });
  V.n10.c++;
  push(V.log10, {
   side: 'C',
   sv: !!sv,
   t: +(+G.t || 0).toFixed(2),
   x: Math.round(car.x),
   y: Math.round(car.y)
  });
  return true;
 }
 V.braveLiveClear = braveLiveClear;
 V.braveDefLive = braveDefLive;
 const GK11 = {
  load: .15,
  spd: 65,
  reach: 7,
  rel: .24,
  relStk: .05,
  turn: .3,
  pBase: .75,
  pSav: .1,
  pLo: .55,
  pHi: .95,
  whiff: 8
 };
 V.GK11 = GK11;
 V.read11 = function(p, gk, gx, live) {
  const hx = gx + (live ? -5 : 5), d = Math.hypot(p.x - gk.x, p.y - gk.y);
  const tGK = GK11.load + Math.max(0, d - GK11.reach) / GK11.spd;
  const f = facingOf(p, gx), tx = gx - p.x, ty = CY - p.y, tl = Math.hypot(tx, ty) || 1, cos = (f[0] * tx + f[1] * ty) / tl, turn = (1 - clamp(cos, -1, 1)) / 2;
  const tRel = GK11.rel - GK11.relStk * clamp(pr(p, 'stk'), -2, 2) + GK11.turn * turn;
  return {
   d: +d.toFixed(1),
   tGK: +tGK.toFixed(3),
   tRel: +tRel.toFixed(3),
   turn: +turn.toFixed(2),
   should: tGK < tRel,
   home: [ hx, CY ]
  };
 };
 V.pRight11 = gk => clamp(GK11.pBase + GK11.pSav * rf(gk && gk.pl, 'sav'), GK11.pLo, GK11.pHi);
 function whiff11(gk, p, live) {
  const G = game, dx = p.x - gk.x, dy = p.y - gk.y, L = Math.hypot(dx, dy) || 1;
  gk.lvl = {
   t0: menuT,
   ux: dx / L,
   uy: dy / L
  };
  gk.x += dx / L * Math.min(GK11.whiff, L * .6);
  gk.y += dy / L * Math.min(GK11.whiff * .6, L * .6);
  addFx('txt', gk.x, gk.y - 30, {
   s: 'MISSED HIM!',
   col: live ? '#7dff7a' : '#ff9a8a',
   life: .9
  });
  G.gkWhiffs38 = (G.gkWhiffs38 || 0) + 1;
 }
 function goalieLevel38(p, gk, gx, live) {
  const G = game;
  if (!gk || !p || Math.hypot(p.x - gx, p.y - CY) > GLV.r) return false;
  {
   const b = G.ball, fx = b && b.fromX != null ? b.fromX : b && b.from ? b.from.x : null;
   if (fx != null && (live ? fx >= gx : fx <= gx)) {
    G.gkLevelX = (G.gkLevelX || 0) + 1;
    return false;
   }
  }
  if (gk.down > 0 || gk.stun > 0 || Math.hypot(gk.x - (gx + (live ? -5 : 5)), gk.y - CY) > GLV.inCrease) return false;
  const mates = G.players.filter(q => q.team === (live ? 'D' : 'O') && !(q.down > 0) && Math.hypot(q.x - p.x, q.y - p.y) < 6);
  if (mates.length) return false;
  G.gkLevelTries = (G.gkLevelTries || 0) + 1;
  const verdict = goalieLevelVerdict(gk, p, gx);
  const R = V.read11(p, gk, gx, live), pRight = V.pRight11(gk);
  const right = Math.random() < pRight;
  let go = right ? R.should : !R.should;
  if (verdict === 'behind') go = false;
  V.n11.tries++;
  V.n11[go ? 'go' : 'stay']++;
  V.n11[go === (R.should && verdict !== 'behind') ? 'right' : 'wrong']++;
  push(V.log11, {
   side: live ? 'C' : 'U',
   d: R.d,
   tGK: R.tGK,
   tRel: R.tRel,
   turn: R.turn,
   should: R.should,
   verdict: verdict,
   go: go,
   right: right,
   pRight: +pRight.toFixed(2),
   t: +(+G.t || 0).toFixed(2)
  });
  if (!go) {
   if (verdict === 'behind') {
    G.gkLevelBehind = (G.gkLevelBehind || 0) + 1;
   }
   return false;
  }
  if (!R.should) {
   whiff11(gk, p, live);
   V.n11.whiff++;
   return false;
  }
  G.gkLevelLog = G.gkLevelLog || [];
  G.gkLevelLog.push({
   side: live ? 'C' : 'U',
   verdict: verdict,
   t: +(G.t || 0).toFixed(2)
  });
  voice12('goalie_level', clamp(gk.x, Math.round(camX) + 60, Math.round(camX) + W - 60), gk.y - 32, 0, true);
  G.gkLevelChirps = (G.gkLevelChirps || 0) + 1;
  knockDown(p, gk);
  gk.hitT0 = menuT;
  G.gkLevels = (G.gkLevels || 0) + 1;
  if (!live) G.gkLevelsU = (G.gkLevelsU || 0) + 1;
  const b = G.ball, a = Math.atan2(p.y - gk.y, p.x - gk.x) + rnd(-.8, .8), v = rnd(40, 58);
  if (live) popLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'level'); else dPopLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'level');
  glvAnim(gk, p);
  p.dropT = G.t + 1;
  V.n11.lev++;
  return true;
 }
 V.goalieLevel38 = goalieLevel38;
 const wrap = (n, fn) => {
  const o = window[n];
  if (typeof o !== 'function') {
   console.warn('V38G: no ' + n);
   return;
  }
  window[n] = function() {
   return fn.call(this, o, arguments);
  };
 };
 [ 'setupPossession', 'startDefense', 'startClear', 'startFaceoff', 'liveClear' ].forEach(n => wrap(n, function(o, a) {
  if (V.on6()) reset6();
  return o.apply(this, a);
 }));
 wrap('liveClear', function(o, a) {
  const r = o.apply(this, a);
  if (r) return r;
  const G = curG(), p = a[0];
  if (!brave10(G) || !p || p.team !== 'O' && p.team !== 'G2' && !(p.far && p.role === 'G')) return r;
  try {
   return braveLiveClear(p, a[1]);
  } catch (e) {
   console.error(e);
   return false;
  }
 });
 wrap('startDefenseLive', function(o, a) {
  const G = curG();
  const sv = !!G && !!G.sv2111 && G.sv2111 === G.banner && screen === 'banner' && sv2111On(G);
  const r = o.apply(this, a);
  if (r) return r;
  if (!brave10(G) || G.online || G.meta && G.meta.online || window.RLNET && RLNET.inGame) return r;
  try {
   return braveDefLive(sv);
  } catch (e) {
   console.error(e);
   return false;
  }
 });
 wrap('goalieLevel', function(o, a) {
  return V.on11() ? goalieLevel38.apply(this, a) : o.apply(this, a);
 });
})();
