(function() {
 'use strict';
 const W = window;
 const off = k => !!(W.__rl_no36dg || W.__rl_v124gb || k && W['__rl_no36dg' + k]);
 const MV = {
  split: {
   S: 11.5,
   F: 6,
   dur: .32
  },
  roll: {
   S: 13,
   F: 8,
   dur: .46
  },
  bull: {
   S: 0,
   F: 10,
   dur: .36
  }
 };
 const MORE = {
  base: .45,
  add: .2,
  k: .05,
  lo: .5,
  hi: .78,
  cd: .75
 };
 const SMART = {
  base: .42,
  k: .2,
  lo: .15,
  hi: .88
 };
 const STEP = {
  stun: .3,
  beat: .45,
  sStun: .45,
  sBeat: .6
 };
 const WF = {
  at: .12,
  minJ: .25,
  cos: -.3,
  r: 18,
  fallDown: .6,
  beat: .6,
  fall: {
   b: .12,
   s: .03,
   d: .035,
   lo: .03,
   hi: .22
  },
  ankle: {
   b: .04,
   s: .01,
   d: .012,
   lo: .008,
   hi: .07
  }
 };
 const ST = {
  moves: {},
  smart: 0,
  picks: 0,
  wf: 0,
  wfFall: 0,
  wfAnk: 0,
  wfHip: 0,
  wfNone: 0,
  net: 0,
  bull: {
   win: 0,
   truck: 0,
   stood: 0,
   lost: 0,
   open: 0
  },
  err: []
 };
 const LOG = [];
 const HOOK = {
  rnd: null
 };
 const cl = (v, a, b) => Math.max(a, Math.min(b, v));
 const G0 = () => typeof game !== 'undefined' ? game : null;
 const scr = () => typeof screen !== 'undefined' ? screen : '';
 const mt = () => typeof menuT !== 'undefined' ? menuT : 0;
 const err = e => {
  try {
   console.error(e);
  } catch (x) {}
  if (ST.err.length < 5) ST.err.push(String(e && e.stack || e).slice(0, 200));
 };
 const okG = G => !!G && !G.tutorial && !G.practice && !G.brave;
 const skill = c => typeof dodgeSkill === 'function' ? dodgeSkill(c) : 0;
 function chances(def, sk) {
  sk = sk || 0;
  return {
   fall: +cl(WF.fall.b + WF.fall.s * sk - WF.fall.d * def, WF.fall.lo, WF.fall.hi).toFixed(4),
   ankle: +cl(WF.ankle.b + WF.ankle.s * sk - WF.ankle.d * def, WF.ankle.lo, WF.ankle.hi).toFixed(4)
  };
 }
 function want(c, onb, ond) {
  const r = Math.random(), G = G0();
  if (off() || off('more') || !okG(G) || !c) return r < .45 && !!onb && ond < 14;
  if (!onb || !(ond < 14)) return false;
  if (onb.down > 0) return false;
  if (c.dg36t != null && G.t >= c.dg36t && G.t - c.dg36t < MORE.cd) return false;
  return r < cl(MORE.base + MORE.add + MORE.k * skill(c), MORE.lo, MORE.hi);
 }
 function sit(G, c, onb) {
  let fx = DGX - c.x, fy = CY - c.y;
  const fl = Math.hypot(fx, fy) || 1;
  fx /= fl;
  fy /= fl;
  const lx = -fy, ly = fx, tg = c.tgt || [ c.x - 20, c.y ];
  let sd = Math.sign((tg[0] - c.x) * lx + (tg[1] - c.y) * ly);
  if (!sd) sd = c.y > CY ? ly < 0 ? 1 : -1 : ly > 0 ? 1 : -1;
  const o = {
   f: [ fx, fy ],
   s: [ lx * sd, ly * sd ],
   dist: 99,
   along: 0,
   lat: 0,
   closing: 0,
   reach: false,
   edge: 0,
   run: 0,
   margin: 0
  };
  const run = typeof spdMul === 'function' ? cl(((c.mvx || 0) * fx + (c.mvy || 0) * fy) / (PACE.run * (spdMul(c) || 1)), 0, 1.2) : 0;
  o.run = run;
  const sc = {
   split: .6,
   roll: .2,
   bull: 0,
   swim: .25,
   toe: .2
  };
  if (onb) {
   const rx = onb.x - c.x, ry = onb.y - c.y, d = Math.hypot(rx, ry) || 1;
   o.dist = d;
   o.along = rx * fx + ry * fy;
   o.lat = rx * o.s[0] + ry * o.s[1];
   o.closing = -((onb.mvx || 0) * rx + (onb.mvy || 0) * ry) / d;
   o.reach = onb.chkT0 != null && mt() - onb.chkT0 >= 0 && mt() - onb.chkT0 < .5 || d < 7;
   o.edge = pr(c, 'str') - (.75 * pr(onb, 'str') + .3 * pr(onb, 'def') + (typeof isPole === 'function' && isPole(onb) ? .25 : 0) - (onb.react > 0 ? .3 : 0));
   if (Math.abs(o.lat) < 3) sc.split += .3;
   if (o.lat > 2.5) sc.roll = .9 + Math.min(.6, o.lat / 8);
   const mg = o.edge + BULL.runW * run;
   o.margin = mg;
   if (mg >= 1 && run >= .35 && o.along > 2 && Math.abs(o.lat) < 6) sc.bull = .95 + Math.min(.5, .25 * (mg - 1)); else if (mg > .5) sc.bull = .3;
   if (o.reach && d < 10) sc.swim = 1.15;
   if (o.closing > 8 && d < 13) sc.toe = 1.05; else if (d < 11) sc.toe = .45;
  }
  let ideal = 'split', bs = -1;
  for (const k of [ 'split', 'roll', 'bull', 'swim', 'toe' ]) if (sc[k] > bs) {
   bs = sc[k];
   ideal = k;
  }
  o.sc = sc;
  o.ideal = ideal;
  return o;
 }
 function pickAny(o) {
  const w = {
   split: .28,
   roll: .2,
   swim: .2,
   toe: .2,
   bull: o.edge > -.3 ? .12 : .04
  };
  let t = 0;
  for (const k in w) t += w[k];
  let r = Math.random() * t;
  for (const k in w) {
   r -= w[k];
   if (r <= 0) return k;
  }
  return 'split';
 }
 function posA(A, u) {
  u = cl(u, 0, 1);
  const s = A.S * (1 - (1 - u) * (1 - u)), w = A.kind === 'bull' ? A.F * u : A.F * u * u;
  return [ A.o[0] + A.s[0] * s + A.f[0] * w, A.o[1] + A.s[1] * s + A.f[1] * w ];
 }
 function legal(q) {
  let x = Math.max(q[0], DGX - 26), y = cl(q[1], FT + 4, FB - 4);
  const cx = x - DGX, cy = y - CY, cd = Math.hypot(cx, cy);
  if (cd < CREASE + 5) {
   x = DGX + cx / (cd || 1) * (CREASE + 5);
   y = CY + cy / (cd || 1) * (CREASE + 5);
  }
  return [ x, y ];
 }
 const TXT = {
  split: 'SPLIT DODGE!',
  roll: 'ROLL DODGE!',
  bull: 'BULL DODGE!',
  swim: 'SWIM MOVE!',
  toe: 'TOE DRAG!'
 };
 let o28 = null;
 function cpuMove(G, c, onb) {
  const o = sit(G, c, onb), q = skill(c), pS = cl(SMART.base + SMART.k * q, SMART.lo, SMART.hi);
  const beatNow = G.dBeat === .9 && c.beatT === .9;
  let ideal = o.ideal;
  if (beatNow && ideal === 'bull') {
   o.sc.bull = -1;
   ideal = 'split';
   let bs = -1;
   for (const k of [ 'split', 'roll', 'swim', 'toe' ]) if (o.sc[k] > bs) {
    bs = o.sc[k];
    ideal = k;
   }
  }
  const req = c.dg36req && G.t - c.dg36req.t < 1.5 && G.t >= c.dg36req.t ? c.dg36req.kind : null;
  c.dg36req = null;
  const smart = Math.random() < pS;
  let kind = G.dg36force || req || (smart ? ideal : pickAny(o));
  if (beatNow && kind === 'bull' && !G.dg36force && !req) kind = ideal;
  if (!TXT[kind]) kind = 'split';
  const right = kind === ideal;
  ST.picks++;
  if (right) ST.smart++;
  ST.moves[kind] = (ST.moves[kind] || 0) + 1;
  (G.dg36moves = G.dg36moves || {})[kind] = (G.dg36moves[kind] || 0) + 1;
  c.dg36t = G.t;
  const rec = {
   kind: kind,
   ideal: ideal,
   smart: smart,
   right: right,
   pS: +pS.toFixed(2),
   dist: +o.dist.toFixed(1),
   lat: +o.lat.toFixed(1),
   edge: +o.edge.toFixed(2),
   t: +G.t.toFixed(2),
   user: !!onb && onb === G.dctl
  };
  if (LOG.length > 300) LOG.shift();
  LOG.push(rec);
  G.dg36last = rec;
  if (kind === 'swim' || kind === 'toe') {
   const f0 = W.__rl_cpu28force;
   W.__rl_cpu28force = kind;
   try {
    o28.call(W.V28, c, onb);
   } finally {
    W.__rl_cpu28force = f0;
   }
   const A = c.dodgeA;
   let s = o.s;
   if (A && A.s286) s = A.s286;
   if (right) stepOn(G, c, onb, true);
   wfArm(G, c, onb, s, kind, false);
   return;
  }
  const M = MV[kind], from = typeof handOf17 === 'function' ? handOf17(c) : c.hand || 1;
  let s = o.s.slice();
  if (kind === 'roll' && o.lat > 2.5) s = [ -s[0], -s[1] ];
  if (kind === 'bull') s = [ 0, 0 ];
  const vx0 = s[0] * M.S + o.f[0] * M.F, vy0 = s[1] * M.S + o.f[1] * M.F, vl = Math.hypot(vx0, vy0) || 1;
  const A = {
   kind: kind,
   t: 0,
   dur: M.dur,
   S: M.S,
   F: M.F,
   o: [ c.x, c.y ],
   s: s,
   f: o.f.slice(),
   vx: vx0 / vl,
   vy: vy0 / vl,
   from: from,
   side: kind === 'bull' ? from : -from,
   endHand: kind === 'bull' ? from : -from,
   spin: s[0] * o.f[1] - s[1] * o.f[0] >= 0 ? 1 : -1,
   face: o.f.slice(),
   dir: Math.sign(vx0) || 1,
   dg36: true
  };
  c.dodgeA = A;
  if (kind === 'split') c.hand = A.endHand;
  try {
   addFx('txt', c.x, c.y - 34, {
    s: TXT[kind],
    col: '#ff9a8a',
    life: .7
   });
  } catch (e) {}
  try {
   hardCut(c, A.vx, A.vy, true);
  } catch (e) {}
  if (kind === 'bull') {
   bullCpu(G, c, onb, o, A);
   return;
  }
  stepOn(G, c, onb, right);
  const e = posA(A, 1), tq = legal([ e[0] + o.f[0] * 24 + s[0] * 6, e[1] + o.f[1] * 24 + s[1] * 6 ]);
  c.tgt = tq;
  wfArm(G, c, onb, s, kind, false);
 }
 function stepOn(G, c, onb, right) {
  if (onb && onb !== G.dctl) onb.stun = Math.max(onb.stun || 0, right ? STEP.sStun : STEP.stun);
  c.beatT = Math.max(c.beatT || 0, right ? STEP.sBeat : STEP.beat);
  G.dBeat = Math.max(G.dBeat || 0, right ? STEP.sBeat : STEP.beat);
 }
 function bullCpu(G, c, onb, o, A) {
  c.bullT0 = mt();
  const f = o.f;
  let d = null, bs = 1e9;
  for (const q of G.players) {
   if (q.team !== 'O' || q.down > 0 || q.gk) continue;
   const dx = q.x - c.x, dy = q.y - c.y, dd = Math.hypot(dx, dy);
   if (dd > BULL.reach) continue;
   const al = dx * f[0] + dy * f[1];
   if (al < -3) continue;
   const sc = dd - al * .3;
   if (sc < bs) {
    bs = sc;
    d = q;
   }
  }
  const rec = G.dg36last;
  if (!d) {
   ST.bull.open++;
   rec.bull = 'open';
   c.beatT = Math.max(c.beatT || 0, .6);
   G.dBeat = Math.max(G.dBeat || 0, .6);
   c.tgt = legal([ c.x + f[0] * 30, c.y + f[1] * 30 ]);
   return;
  }
  const dStr = pr(d, 'str'), def = .75 * dStr + .3 * pr(d, 'def') + (typeof isPole === 'function' && isPole(d) ? .25 : 0) - (d.react > 0 ? .3 : 0);
  const margin = pr(c, 'str') + BULL.runW * o.run - def, pWin = cl((BULL.base + BULL.k * margin) * (typeof DF !== 'undefined' && DF.cpuBeat || 1), .06, .94);
  rec.pWin = +pWin.toFixed(3);
  rec.margin = +margin.toFixed(2);
  const fw = G.dg36forceBull, win = fw ? fw !== 'lose' : Math.random() < pWin;
  G.dg36forceBull = null;
  const ax = d.x - c.x, ay = d.y - c.y, al = Math.hypot(ax, ay) || 1, kx = f[0] * .7 + ax / al * .3, ky = f[1] * .7 + ay / al * .3;
  if (win) {
   const truck = fw === 'truck' || !fw && margin >= BULL.truckEdge && Math.random() < BULL.truckP, dn = truck ? HIT.down * .8 : BULL.stumble;
   d.down = dn;
   d.downT0 = dn;
   d.stun = dn;
   d.kb = {
    vx: kx * BULL.kb / HIT.kbT,
    vy: ky * BULL.kb / HIT.kbT,
    t: HIT.kbT
   };
   d.fallDir = kx >= 0 ? 1 : -1;
   d.react = Math.max(d.react || 0, dn + .3);
   c.beatT = Math.max(c.beatT || 0, .9);
   G.dBeat = Math.max(G.dBeat || 0, .9);
   c.tgt = legal([ c.x + f[0] * 34, c.y + f[1] * 34 ]);
   if (truck) {
    ST.bull.truck++;
    rec.bull = 'truck';
    addFx('txt', d.x, d.y - 46, {
     s: 'TRUCKED!',
     col: '#ff5a4a',
     life: 1
    });
   } else {
    ST.bull.win++;
    rec.bull = 'win';
    addFx('txt', c.x, c.y - 44, {
     s: 'RAN THROUGH HIM!',
     col: '#ff9a8a',
     life: .9
    });
   }
   try {
    hit12(cl(.35 + .25 * margin, .3, 1));
   } catch (e) {}
  } else {
   ST.bull.stood++;
   rec.bull = 'stood';
   c.dodgeA = null;
   c.bullT0 = null;
   d.hitT0 = mt();
   c.dg36noAnk = G.t;
   c.beatT = 0;
   G.dBeat = 0;
   if (d !== G.dctl) {
    d.react = 0;
   }
   if (onb && onb !== G.dctl) onb.stun = 0;
   c.tgt = [ c.x, c.y ];
   G.dDecide = Math.max(G.dDecide || 0, BULL.standDur);
   c.stun = Math.max(c.stun || 0, BULL.standDur * .6);
   addFx('txt', c.x, c.y - 44, {
    s: 'STOOD UP!',
    col: '#7dff7a',
    life: .9
   });
   try {
    hit12(.3);
   } catch (e) {}
   const pLose = cl(BULL.loseP - .06 * margin, .05, .4), fl = G.dg36forceBullLose;
   G.dg36forceBullLose = null;
   if (fl != null ? !!fl : Math.random() < pLose) {
    ST.bull.lost++;
    rec.bull = 'lost';
    const a = Math.atan2(-f[1], -f[0]) + (Math.random() * 2 - 1), v = 30 + Math.random() * 16;
    dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'bull');
   }
  }
 }
 function wfArm(G, c, onb, s, kind, net) {
  if (off('wf') || kind === 'bull') return;
  let d = null;
  if (net) d = onb; else {
   const u = G.dctl;
   if (u && !(u.down > 0) && G.players.includes(u) && Math.hypot(u.x - c.x, u.y - c.y) <= WF.r) d = u;
  }
  if (!d) return;
  const sl = Math.hypot(s[0], s[1]);
  if (!(sl > .01)) return;
  G.dg36wfp = {
   c: c,
   d: d,
   s: [ s[0] / sl, s[1] / sl ],
   t: 0,
   net: !!net,
   kind: kind
  };
 }
 function joyNow(P) {
  if (P.net) {
   const N = W.RLNET, r = N && N.rin;
   if (!r || !r.j || performance.now() - (N.rinAt || 0) > 700) return null;
   const m = +r.j[2] || 0, L = Math.hypot(r.j[0], r.j[1]);
   return L > .001 ? [ r.j[0] / L, r.j[1] / L, m ] : null;
  }
  const G = G0(), j = G && G.run;
  if (!j) return null;
  const L = Math.hypot(j.x || 0, j.y || 0);
  if (!(L > .001)) return null;
  return [ j.x / L, j.y / L, j.m != null ? +j.m : Math.min(1, L) ];
 }
 function wfTick(G, dt) {
  const P = G.dg36wfp;
  if (!P) return;
  P.t += dt;
  if (P.t < WF.at) return;
  G.dg36wfp = null;
  const c = P.c, d = P.d, live = scr() === 'live';
  if (!G.players.includes(d) || !G.players.includes(c) || d.down > 0 || !G.ball || G.ball.state !== 'held') return;
  if (P.net ? !(live && G.carrier === c && d.netCtl && W.RLNET && RLNET.inGame && RLNET.auth) : !(scr() === 'defense' && G.dcar === c && G.dctl === d)) return;
  if (Math.hypot(d.x - c.x, d.y - c.y) > WF.r + 4) return;
  const j = joyNow(P), cos = j ? j[0] * P.s[0] + j[1] * P.s[1] : 0;
  const fz = G.dg36forceWF;
  const wrong = fz ? fz !== 'none' : !!j && j[2] >= WF.minJ && cos < WF.cos;
  const ch = chances(pr(d, 'def'), skill(c));
  const rec = {
   kind: P.kind,
   net: P.net,
   cos: +cos.toFixed(2),
   mag: j ? +j[2].toFixed(2) : 0,
   wrong: wrong,
   def: +pr(d, 'def').toFixed(2),
   pFall: ch.fall,
   pAnkle: ch.ankle,
   t: +G.t.toFixed(2)
  };
  G.dg36wfLast = rec;
  (G.dg36wfLog = G.dg36wfLog || []).push(rec);
  if (G.dg36wfLog.length > 200) G.dg36wfLog.shift();
  if (!wrong) {
   if (j && cos > .3) ST.wfHip++; else ST.wfNone++;
   return;
  }
  ST.wf++;
  G.dg36wf = (G.dg36wf || 0) + 1;
  if (P.net) ST.net++;
  c.beatT = Math.max(c.beatT || 0, WF.beat);
  if (live) G.beatT = Math.max(G.beatT || 0, WF.beat); else G.dBeat = Math.max(G.dBeat || 0, WF.beat);
  const r = fz === 'ankle' ? 0 : fz === 'fall' ? ch.ankle : fz === 'step' ? 1 : (HOOK.rnd || Math.random)();
  if (r < ch.ankle) {
   if (ankleBreak(d, c)) {
    rec.res = 'ankles';
    ST.wfAnk++;
    G.dg36wfAnk = (G.dg36wfAnk || 0) + 1;
   }
   return;
  }
  if (r < ch.ankle + ch.fall) {
   const dn = WF.fallDown;
   d.down = dn;
   d.downT0 = dn;
   d.stun = dn;
   d.kb = null;
   d.fallDir = j && Math.abs(j[0]) > .2 ? j[0] > 0 ? 1 : -1 : c.x < d.x ? 1 : -1;
   d.react = Math.max(d.react || 0, .3);
   rec.res = 'fall';
   ST.wfFall++;
   G.dg36wfFall = (G.dg36wfFall || 0) + 1;
   try {
    addFx('txt', d.x, d.y - 30, {
     s: 'FELL OVER!',
     col: '#ffe14d',
     life: 1
    });
    SFX.catch();
   } catch (e) {}
   return;
  }
  rec.res = 'step';
 }
 function netDodge(kind, r) {
  const G = G0(), N = W.RLNET;
  if (!G || !r || !N || !N.inGame || !N.auth || scr() !== 'live' || off('wf')) return;
  const c = G.carrier;
  if (!c) return;
  const d = G.players.find(p => p.team === 'D' && p.netCtl && !(p.down > 0));
  if (!d || Math.hypot(d.x - c.x, d.y - c.y) > WF.r) return;
  wfArm(G, c, d, [ r.vx || 0, r.vy || 0 ], kind, true);
 }
 function tick(dt) {
  const G = G0();
  if (!G || !G.players) return;
  for (const p of G.players) {
   const A = p.dodgeA;
   if (!A || !A.dg36) continue;
   if (scr() !== 'defense' || G.dcar !== p || !G.ball || G.ball.state !== 'held' || p.down > 0) {
    p.dodgeA = null;
    if (A.kind === 'roll' && A.endHand) p.hand = A.endHand;
    continue;
   }
   A.t += dt;
   const q = legal(posA(A, A.t / A.dur));
   p.x = q[0];
   p.y = q[1];
   if (A.t >= A.dur) {
    p.dodgeA = null;
    if (A.kind === 'roll' && A.endHand) p.hand = A.endHand;
   }
  }
  if (G.dg36wfp) wfTick(G, dt);
 }
 function drawOk(p) {
  const A = p && p.dodgeA;
  return !!A && !!A.dg36 && A.kind !== 'bull' && !off() && !off('cpu');
 }
 function gkDraw(p) {
  return !off() && !off('gk') && !!p && p.team === 'O' && !!p.dodgeA && p.dodgeA.kind !== 'bull';
 }
 function request(c, kind) {
  const G = G0();
  if (!G || !c || !TXT[kind]) return false;
  c.dg36req = {
   kind: kind,
   t: G.t
  };
  return true;
 }
 function wire() {
  if (!W.V28 || typeof W.V28.cpuDodge !== 'function' || typeof W.dodgeTick !== 'function' || typeof W.doDodge !== 'function') {
   ST.err.push('wire: missing');
   return;
  }
  o28 = W.V28.cpuDodge;
  W.V28.cpuDodge = function(c, onb) {
   const G = G0();
   if (off() || off('cpu') || !okG(G) || W.__rl_cpu28force || !c || scr() !== 'defense' || W.V28.on && (!W.V28.on('moves') || !W.V28.on('cpu'))) return o28.apply(this, arguments);
   try {
    return cpuMove(G, c, onb);
   } catch (e) {
    err(e);
   }
  };
  const oDT = W.dodgeTick;
  W.dodgeTick = function(dt) {
   const r = oDT.apply(this, arguments);
   if (!off()) {
    try {
     tick(dt);
    } catch (e) {
     err(e);
    }
   }
   return r;
  };
  const oDD = W.doDodge;
  W.doDodge = function(kind) {
   const r = oDD.apply(this, arguments);
   if (r && !off()) {
    try {
     netDodge(kind, r);
    } catch (e) {
     err(e);
    }
   }
   return r;
  };
  const oAC = W.ankleChance;
  if (typeof oAC === 'function') W.ankleChance = function(c, d) {
   const G = G0();
   if (c && G && c.dg36noAnk != null && c.dg36noAnk === G.t && !off()) return 0;
   return oAC.apply(this, arguments);
  };
  ST.wired = true;
 }
 wire();
 W.V36DG = {
  want: want,
  drawOk: drawOk,
  gkDraw: gkDraw,
  request: request,
  chances: chances,
  situation: (c, onb) => {
   const G = G0();
   return G && c ? sit(G, c, onb) : null;
  },
  stats: () => JSON.parse(JSON.stringify(ST)),
  log: () => LOG.slice(),
  MV: MV,
  MORE: MORE,
  SMART: SMART,
  STEP: STEP,
  WF: WF,
  on: () => !off(),
  testRnd: f => {
   HOOK.rnd = typeof f === 'function' ? f : null;
  }
 };
})();
