'use strict';
var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());


const V20 = (() => {
 const off = () => !!window.__rl_v124gb;
 const ONEH = {
  "zack merriman": 1,
  'garrett wickliffe': 1,
  'alvin howland': 1
 };
 const S3_204 = {
  r: 16 * 448 / 80,
  k1: .22,
  d1: 30,
  k2: .25,
  d2: 60,
  m: 1,
  q: .04
 };
 const CP20 = {
  better: .3,
  sideWide: .35,
  sideIn: .75,
  sideSpd: 1.12
 };
 const AIR20 = {
  p: .18,
  dur: .95,
  rel: .5
 };
 const ROLL20 = {
  turn: 2.4,
  wait: .05,
  still: .07,
  max: .32,
  turn1: 2.35,
  max1: .42,
  spd: 24,
  jump: .9
 };
 let S20 = (() => {
  const s = LS.get('v20', null);
  return s && typeof s === 'object' ? s : {};
 })();
 const save = () => LS.set('v20', S20);
 if (!off() && !window.__rl_no204f7d && S20.redeemed && S20.redeemed.USAGOLD && !S20.f7d204) {
  if (!S20.cpUnl) {
   S20.cpUnl = 1;
   S20.cpOn = true;
  }
  S20.f7d204 = 1;
  save();
 }
 const F7E_204 = [ 'crew_trainer_2', 'stick_pencil' ];
 function f7eGrant() {
  if (!window.V17 || !V17.grant || !V17.ST) return false;
  for (const id of F7E_204) if (!((V17.ST().inv || {})[id] > 0)) V17.grant(id, 1);
  try {
   V17.save && V17.save();
  } catch (e) {}
  S20.f7e204 = 1;
  save();
  return true;
 }
 if (!off() && !window.__rl_no204f7e && S20.redeemed && S20.redeemed.USAGOLD && !S20.f7e204) {
  try {
   f7eGrant();
  } catch (e) {
   console.error(e);
  }
 }
 const ST17 = () => window.V17 ? V17.ST() : null;
 function wins() {
  const s = ST17();
  return s && s.stats ? s.stats.wins || 0 : 0;
 }
 function cpUnlocked() {
  if (!S20.cpUnl && wins() >= 2) {
   S20.cpUnl = 1;
   if (t1On()) S20.cpOn = true;
   save();
  }
  return !!S20.cpUnl;
 }
 function t1On() {
  return !off() && !window.__rl_no204t1;
 }
 function has(id) {
  const s = ST17();
  return !!(s && s.inv && s.inv[id] > 0);
 }
 const CPSTEPS = () => [ TV20.OVER, TV20.UNDER, TV20.SIDE, TV20.CP ];
 function cp32gone() {
  return !off() && !window.__rl_no32cp;
 }
 function cpOn() {
  const G = game;
  if (off()) return false;
  if (G && G.tutorial && !G.tutorial.complete) return CPSTEPS().includes(G.tutorial.step);
  if (cp32gone()) return false;
  return !!(S20.cpOn && S20.cpTut && cpUnlocked());
 }
 function gate() {
  if (has(__x("bGVnX2dhcnJ5")) && !S20.airDone) return 'air';
  if (!cp32gone() && cpUnlocked() && !S20.cpTut) return 'cp';
  return null;
 }
 function isOHS(pl) {
  return false;
 }
 function ownedLeg() {
  return window.V17 ? V17.I.filter(it => it.leg20 && has(it.id)).map(it => it.leg20) : [];
 }
 let jh = [], pend = null;
 function joyFeed(ux, uy) {
  const t = now();
  jh.push([ t, Math.atan2(uy, ux) ]);
  while (jh.length > 2 && jh[0][0] < t - .7) jh.shift();
  if (pend) resolve(false);
 }
 function turnSince(t0) {
  let s = 0;
  for (let i = 1; i < jh.length; i++) {
   if (jh[i][0] < t0) continue;
   let d = jh[i][1] - jh[i - 1][1];
   while (d > Math.PI) d -= 2 * Math.PI;
   while (d < -Math.PI) d += 2 * Math.PI;
   s += d;
  }
  return s;
 }
 function curl20(t0) {
  let s = 0;
  for (let i = 1; i < jh.length; i++) {
   if (jh[i][0] < t0) continue;
   let d = jh[i][1] - jh[i - 1][1];
   while (d > Math.PI) d -= 2 * Math.PI;
   while (d < -Math.PI) d += 2 * Math.PI;
   const dt = jh[i][0] - jh[i - 1][0];
   if (Math.abs(d) > ROLL20.jump || dt > 0 && Math.abs(d) / dt > ROLL20.spd) {
    s = 0;
    continue;
   }
   if (s && Math.abs(d) > .03 && Math.sign(d) !== Math.sign(s)) s = 0;
   s += d;
  }
  return s;
 }
 function joyCut(ux, uy) {
  const G = game;
  window.__jc20 = [ screen, canShoot(), !!(G && G.carrier), !!(G && G.pset), ctrlOk() ];
  if (off() || !G || screen !== 'live' || !canShoot() || !G.carrier || G.pset || ctrlOk()) return false;
  setRun(ux, uy, false);
  pend = pend && !window.__rl_no2001f4 ? Object.assign(pend, {
   ux: ux,
   uy: uy
  }) : {
   t0: now(),
   from: now() - .35,
   ux: ux,
   uy: uy
  };
  resolve(false);
  return true;
 }
 function resolve(force) {
  const G = game;
  if (!pend) return;
  if (!G || screen !== 'live' || !canShoot()) {
   pend = null;
   return;
  }
  const f4 = !window.__rl_no2001f4, t = now(), tr = f4 ? curl20(pend.t0 - .45) : turnSince(pend.from), el = t - pend.t0, roll = Math.abs(tr) >= (f4 ? ROLL20.turn1 : ROLL20.turn);
  const still = !jh.length || t - jh[jh.length - 1][0] > ROLL20.still;
  if (!roll && !force && el < (f4 ? ROLL20.max1 : ROLL20.max) && !(still && el >= ROLL20.wait)) return;
  const j = joy && joy.on ? [ joy.ux, joy.uy ] : [ pend.ux, pend.uy ];
  pend = null;
  const kind = roll ? 'roll' : 'split';
  const r = doDodge(kind, j[0], j[1], tr >= 0 ? 1 : -1);
  G.lastCut20 = {
   kind: kind,
   ok: !!r,
   turn: +tr.toFixed(2),
   to: r ? r.to : null
  };
  G.cuts20 = (G.cuts20 || 0) + 1;
  if (r) {
   tutFlag(roll ? 'roll20' : 'split20');
   if (G.carrier) G.carrier.oneHand20 = G.carrier.oneHand20 && !roll;
  }
 }
 function rightStroke(sw, pt) {
  const G = game, c = G && G.carrier;
  if (off() || !c || !canShoot()) return false;
  if (sw.kind === 'split') {
   c.oneHand20 = !c.oneHand20;
   G.oneHands20 = (G.oneHands20 || 0) + 1;
   addFx('txt', c.x, c.y - 34, {
    s: c.oneHand20 ? 'ONE HAND' : 'TWO HANDS',
    col: '#ffe14d',
    life: .7
   });
   try {
    SFX.tap();
   } catch (e) {}
   tutFlag(c.oneHand20 ? 'one20' : 'two20');
   lastTap = {
    kind: 'onehand',
    on: !!c.oneHand20,
    fromCage: !!pt.cageStart
   };
   return true;
  }
  const p0 = pt.path[0], p1 = pt.path[pt.path.length - 1];
  let dy = p1[1] - p0[1];
  if (Math.abs(dy) < 6) dy = sw.spin;
  const toR = dy > 0, r = doDodge('split', 0, toR ? 1 : -1, toR ? 1 : -1);
  if (r) {
   G.dodge.toe20 = true;
   G.lastDodge.toe20 = true;
   G.toes20 = (G.toes20 || 0) + 1;
   for (let i = fx.length - 1; i >= 0; i--) if (fx[i].type === 'txt' && fx[i].s === 'SPLIT DODGE!') {
    fx[i].s = 'TOE DRAG!';
    break;
   }
   tutFlag('toe20');
  }
  lastTap = {
   kind: 'toe',
   ok: !!r,
   to: toR ? 'right' : 'left',
   fromCage: !!pt.cageStart
  };
  return true;
 }
 function twoHands(c) {
  if (c) c.oneHand20 = false;
 }
 function cpStroke(pt) {
  if (!pt.cageStart || !pt.cp20 || !cpOn() || !canShoot()) return false;
  const e = pt.path[pt.path.length - 1], dx = e[0] - pt.cp20.x, dy = e[1] - pt.cp20.y;
  const type = Math.abs(dy) >= Math.abs(dx) ? dy < 0 ? 'over' : 'under' : 'side';
  lastTap = {
   kind: 'shot',
   corner: pt.cp20.corner,
   type: type
  };
  releaseShot(Math.max(.05, pt.cp20.held), pt.cp20.corner, type);
  return true;
 }
 function shot(c, b, tg, type, sp) {
  const G = game;
  if (!c || !b || b.state !== 'shot') return;
  const one = false;
  c.oneHand20 = false;
  c.shot20 = {
   type: type || null,
   t0: menuT,
   one: one,
   top: !!tg.top,
   x: c.x,
   y: c.y
  };
  if (one) {
   addFx('txt', c.x, c.y - 42, {
    s: 'ONE-HANDED!',
    col: '#ffcc33',
    life: .8
   });
   if (G.lastShot) G.lastShot.oneHand20 = true;
  }
  if (!type || off()) return;
  const gk = G.goalie, top = !!tg.top, ls = G.lastShot || {};
  ls.type20 = type;
  tutFlag(type + '20');
  if (type === 'side') {
   if (!b.force18) {
    const r = Math.random(), v = (sp || Math.hypot(b.vx, b.vy)) * CP20.sideSpd;
    shotForce18(r < CP20.sideWide ? 'wide' : Math.random() < CP20.sideIn ? 'goal' : 'save', b, gk, GX, top, v);
   }
   ls.planes20 = 'side';
  } else if (type === 'under' && top || type === 'over' && !top) {
   if (!b.force18 && Math.random() < CP20.better) shotForce18('goal', b, gk, GX, top, sp);
   ls.planes20 = 'better';
   tutFlag('cpBetter');
  } else ls.planes20 = 'mid';
  if (type === 'under' && !b.force18 && !window.__rl_no204s3) {
   const d = Math.hypot(GX - c.x, CY - c.y), past = d - S3_204.r;
   if (past > 0 && gk) {
    const rel = S3_204.k1 * clamp(past / S3_204.d1, 0, 1) + S3_204.k2 * clamp((past - S3_204.d1) / S3_204.d2, 0, 1);
    gk.reach *= 1 - S3_204.m * rel;
    ls.under204 = +rel.toFixed(3);
    const q = S3_204.q * clamp((past - S3_204.d1 - 10) / 20, 0, 1);
    if (q > 0 && Math.random() < q) {
     shotForce18('goal', b, gk, GX, top, sp);
     ls.under204g = 1;
    }
   }
  }
  (G.cp20log = G.cp20log || []).push({
   type: type,
   top: top,
   res: b.force18 || null
  });
 }
 function atX(c) {
  return !!c && (window.__rl_no2002f6 ? c.x > GX - 2 && Math.abs(c.y - CY) < CREASE + 16 : c.x > GX - 4 && Math.abs(c.y - CY) < CREASE + 26);
 }
 function airReady() {
  const G = game, c = G && G.carrier;
  return !off() && !window.__rl_no2002f6 && !!c && !!c.pl && c.pl.id === 'LEG-0' && (G.air20 ? G.air20.who === c && !G.air20.firing : atX(c) && canShoot());
 }
 function preShot(held, corner) {
  const G = game, c = G && G.carrier;
  if (off() || !c || !c.pl || c.pl.id !== 'LEG-0') return false;
  if (G.air20 && G.air20.firing) return false;
  if (G.air20) return true;
  if (!atX(c)) return false;
  const sd = c.y <= CY ? -1 : 1;
  G.air20 = {
   who: c,
   t: 0,
   x0: c.x,
   y0: c.y,
   sd: sd,
   corner: corner == null ? sd < 0 ? 0 : 2 : corner,
   held: Math.max(.4, held || 0)
  };
  c.air20 = true;
  G.run = null;
  G.airGates20 = (G.airGates20 || 0) + 1;
  tutFlag('air20');
  addFx('txt', c.x, c.y - 34, {
   s: 'AIR DIVE!',
   col: '#ffcc33',
   life: .9
  });
  try {
   SFX.pass();
  } catch (e) {}
  lastTap = {
   kind: 'airgate',
   corner: corner
  };
  return true;
 }
 function airPos(A, u) {
  const R = CREASE + 4, a0 = Math.atan2(A.y0 - CY, A.x0 - GX), a1 = Math.PI + A.sd * .35, da = (a1 - a0 + (A.sd < 0 ? -2 * Math.PI : 0)) % (2 * Math.PI);
  const a = a0 + (A.sd < 0 ? -Math.abs(da) : Math.abs(da)) * u, r = Math.hypot(A.x0 - GX, A.y0 - CY) * (1 - u) + (R + 6 * u) * u;
  return [ GX + Math.cos(a) * r, CY + Math.sin(a) * r, Math.sin(Math.PI * Math.min(1, u * 1.15)) * 14 ];
 }
 function airTick(dt) {
  const G = game, A = G && G.air20;
  if (!A) return;
  const c = A.who;
  A.t += dt;
  const u = Math.min(1, A.t / AIR20.dur), [x, y, lift] = airPos(A, u);
  A.lift = lift;
  A.gx = x;
  A.gy = y;
  if (c && G.players.includes(c)) {
   c.x = x;
   c.y = y;
   c.tx = x;
   c.ty = y;
   c.spd = 0;
  }
  if (!A.shot && u >= AIR20.rel && G.carrier === c && canShoot()) {
   A.firing = true;
   const ox = c.x;
   c.x = Math.min(c.x, GX - 16);
   try {
    releaseShot(A.held, A.corner);
   } finally {
    A.firing = false;
    c.x = ox;
   }
   A.shot = true;
   const b = G.ball;
   if (b.state === 'shot') {
    b.creaseShot = false;
    shotForce18(Math.random() < AIR20.p ? 'goal' : 'wide', b, G.goalie, GX, A.corner < 2, Math.hypot(b.vx, b.vy));
    if (G.lastShot) G.lastShot.air20 = true;
    (G.air20log = G.air20log || []).push({
     res: b.force18
    });
   }
  }
  if (u >= 1) {
   if (c) {
    c.air20 = false;
    if (g1On()) g1Start(c); else c.down = Math.max(c.down || 0, .35);
   }
   G.air20 = null;
  }
 }
 const G1 = {
  down: 1,
  hunch: 1,
  slow: .45
 };
 function g1On() {
  return !off() && !window.__rl_no204g1;
 }
 function g1Start(c) {
  const G = game;
  c.down = Math.max(c.down || 0, G1.down);
  c.downT0 = c.down;
  c.kb = null;
  c.fallDir = c.team === 'D' ? 1 : -1;
  G.h204 = {
   id: c.pl && c.pl.id,
   ref: c,
   left: G1.hunch,
   on: false
  };
  G.g1n204 = (G.g1n204 || 0) + 1;
  const fresh = G.back20 && G.back20.who === c && menuT - G.back20.t0 < .8;
  G.back20 = {
   who: c,
   t0: menuT,
   g1: true
  };
  if (!fresh) {
   G.backs20 = (G.backs20 || 0) + 1;
   back206('oldman_back') || groan();
  }
 }
 function g1Tick(dt) {}
 function onGoal(sh) {
  const G = game;
  if (!sh || !sh.pl || sh.pl.id !== 'LEG-0' || off()) return;
  if (G.back20 && G.back20.g1 && menuT - G.back20.t0 < 2.2) return;
  if (g1On() && G.air20 && G.air20.who === sh) {
   sh.air20 = false;
   G.air20 = null;
   g1Start(sh);
   return;
  }
  G.back20 = {
   who: sh,
   t0: menuT
  };
  G.backs20 = (G.backs20 || 0) + 1;
  back206('oldman_groan') || groan();
 }
 function groan() {
  try {
   if (typeof AC === 'undefined' || !AC) return;
   const t = AC.currentTime + .05, d = 1.25;
   const o = AC.createOscillator(), o2 = AC.createOscillator(), vib = AC.createOscillator(), vg = AC.createGain(), trem = AC.createOscillator(), tg = AC.createGain();
   const f1 = AC.createBiquadFilter(), f2 = AC.createBiquadFilter(), gn = AC.createGain(), out = AC.createGain();
   o.type = 'sawtooth';
   o2.type = 'square';
   o.frequency.setValueAtTime(118, t);
   o.frequency.linearRampToValueAtTime(92, t + .5);
   o.frequency.linearRampToValueAtTime(74, t + d);
   o2.frequency.setValueAtTime(59, t);
   o2.frequency.linearRampToValueAtTime(37, t + d);
   vib.frequency.value = 6.5;
   vg.gain.value = 5;
   vib.connect(vg);
   vg.connect(o.frequency);
   vg.connect(o2.frequency);
   trem.frequency.value = 9;
   tg.gain.value = .35;
   trem.connect(tg);
   f1.type = 'bandpass';
   f1.frequency.setValueAtTime(620, t);
   f1.frequency.linearRampToValueAtTime(420, t + d);
   f1.Q.value = 5;
   f2.type = 'bandpass';
   f2.frequency.value = 1050;
   f2.Q.value = 7;
   gn.gain.setValueAtTime(1e-4, t);
   gn.gain.exponentialRampToValueAtTime(.5, t + .12);
   gn.gain.setValueAtTime(.45, t + .8);
   gn.gain.exponentialRampToValueAtTime(1e-4, t + d);
   tg.connect(gn.gain);
   out.gain.value = .6;
   o.connect(f1);
   o.connect(f2);
   o2.connect(f1);
   f1.connect(gn);
   f2.connect(gn);
   gn.connect(out);
   out.connect(AC.destination);
   for (const n of [ o, o2, vib, trem ]) {
    n.start(t);
    n.stop(t + d + .05);
   }
  } catch (e) {}
 }
 const on206 = () => !off() && !window.__rl_no206;
 const mute206 = () => typeof muted !== 'undefined' && !!muted;
 const rnd206 = (() => {
  const u = new Uint32Array(1);
  return () => {
   try {
    crypto.getRandomValues(u);
    return u[0] / 4294967296;
   } catch (e) {
    return Date.now() % 997 / 997;
   }
  };
 })();
 let back206Src = null;
 function back206(key) {
  if (!on206() || typeof sfx12 !== 'function') return false;
  if (game) (game.v206 = game.v206 || []).push([ key, +(+game.t || 0).toFixed(2) ]);
  if (mute206()) return true;
  if (back206Src) {
   try {
    back206Src.stop();
   } catch (e) {}
   back206Src = null;
  }
  const s = sfx12(key, .75, 1);
  if (s && typeof s === 'object') {
   back206Src = s;
   return true;
  }
  return false;
 }
 function ew206() {
  if (!on206() || typeof sfx12 !== 'function') return false;
  if (game) game.ew206 = (game.ew206 || 0) + 1;
  if (mute206()) return true;
  const s = sfx12('crowd_ewww', .9, 1);
  return !!(s && typeof s === 'object');
 }
 const TC206 = {
  vol: .42,
  life: 1.8,
  cpuOuter: 2 / 3,
  cpuTop: .5
 };
 function goal206(side, b, cy) {
  const G = game;
  if (!G || G.tutorial || !on206() || !b) return false;
  if (typeof SET171 !== 'undefined' && SET171.chirps === false) return false;
  let top = false;
  if (side === 'u') top = b.corner === 0 || b.corner === 2; else top = cy != null && Math.abs(cy - CY) >= MOUTH * TC206.cpuOuter && rnd206() < TC206.cpuTop;
  if (!top) return false;
  G.top206 = (G.top206 || 0) + 1;
  (G.top206Log = G.top206Log || []).push([ side, b.corner != null ? b.corner : null, +(+G.t || 0).toFixed(2) ]);
  const sh = b.shooter, x = sh && sh.x != null ? sh.x : side === 'u' ? GX : DGX, y = sh && sh.y != null ? sh.y - 30 : CY - MOUTH - 14;
  if (typeof pop12 === 'function') pop12('TOP CHEDDDD!', x, y, '#ffe14d', TC206.life, true);
  if (!mute206() && typeof sfx12 === 'function') {
   try {
    if (typeof voiceSrc !== 'undefined' && voiceSrc) {
     try {
      voiceSrc.stop();
     } catch (e) {}
     voiceSrc = null;
    }
   } catch (e) {}
   const s = sfx12('top_cheddar', TC206.vol, 1);
   if (s && typeof s === 'object') try {
    voiceSrc = s;
    voiceEndAt = AC.currentTime + (RL12A.DUR && RL12A.DUR.top_cheddar || 2) + .1;
   } catch (e) {}
  }
  return true;
 }
 function tick(dt) {
  if (pend) resolve(false);
  airTick(dt);
  g1Tick(dt);
 }
 const SCOL = {
  over: '#ffe14d',
  under: '#7dff7a',
  side: '#ff9a4a',
  ots: '#ff5ad2'
 };
 const SARC = {
  over: [ -2.6, .45 ],
  under: [ 2.7, -.75 ],
  side: [ 3, .05 ],
  ots: [ -1, -2.8 ]
 };
 function stickAt(p, a, flat, col) {
  const cx = p.x - 1, cy = p.y - 14, L = 12;
  const hx = cx + Math.cos(a) * L, hy = cy + Math.sin(a) * L * (flat ? .35 : 1);
  const n = 10;
  for (let i = 0; i <= n; i++) px(Math.round(cx + (hx - cx) * i / n), Math.round(cy + (hy - cy) * i / n), col);
  rect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3, '#ffffff');
  rect(Math.round(hx), Math.round(hy), 1, 1, '#9aa3ab');
 }
 const POSE20 = {
  over: [ [ -3, -16, -2.3 ], [ 7, -11, .6 ] ],
  under: [ [ -6, -6, 2.75 ], [ 7, -11, -1.05 ] ],
  side: [ [ -5, -10, 3.05 ], [ 7, -10, .12 ] ],
  ots: [ [ 5, -13, -1 ], [ -3, -19, -2.75 ] ]
 };
 const SH20 = {
  f: [ 4, -12 ],
  b: [ -3, -12 ]
 };
 function otsAim282(p) {
  const G = typeof game !== 'undefined' ? game : null;
  if (window.__rl_no282otsface || off() || window.__rl_no2002f5 || !G || !p || screen !== 'live' || G.carrier !== p || p.shot20) return false;
  return !!(window.SHOT26 && SHOT26.S && SHOT26.S.aim && SHOT26.on() && window.V28 && V28.otsOk && V28.otsOk(p));
 }
 function shotBody(p) {
  if (otsAim282(p)) {
   shotBody({
    shot20: {
     type: 'ots',
     t0: menuT
    }
   });
   return 'f20_shotBody';
  }
  const S = p && p.shot20;
  if (!S || !S.type || off() || window.__rl_no2002f5 || menuT - S.t0 > .5 || menuT < S.t0) return null;
  if (!RL12.FR.f20_shotBody) {
   const I = RL12.FR.idle;
   RL12.FR.f20_shotBody = [ I[0], I[1], null, I[3].map(r => r.replace(/[MmnXGg]/g, '.')) ];
  }
  return 'f20_shotBody';
 }
 function shotArt(p, type, k, stickCol) {
  const [A, B] = POSE20[type], f = p.shot20 && p.shot20.type === 'ots' && p.shot20.f28 ? p.shot20.f28 : p._fright === false ? -1 : 1, X = Math.round(p.x), Y = Math.round(p.y), flat = type === 'side' ? .45 : 1;
  const hx = A[0] + (B[0] - A[0]) * k, hy = A[1] + (B[1] - A[1]) * k + (type === 'under' ? 1 - k : 0), a = A[2] + (B[2] - A[2]) * k, dx = Math.cos(a), dy = Math.sin(a) * flat;
  const P = (x, y, c) => rect(X + (f > 0 ? Math.round(x) : -Math.round(x) - 1), Y + Math.round(y), 1, 1, c);
  const line = (x0, y0, x1, y1, c) => {
   const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
   for (let i = 0; i <= n; i++) P(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c);
  };
  const sc = window.V17 && V17.handStickCols && V17.handStickCols(p) || {
   X: '#2a2a30',
   M: '#e8e8e8',
   m: '#ffffff',
   n: '#9aa3ab'
  };
  const kit = p._kit, pal = kit ? RL12.palette(kit, skinOf(p.pl)) : null;
  const bx = hx - dx * 4, by = hy - dy * 4, tx = hx + dx * 13, ty = hy + dy * 13;
  scaled12(X, Y, () => {
   if (stickCol) {
    line(bx, by, tx, ty, stickCol);
    return;
   }
   const arm = pal ? pal.J : '#888', glove = pal ? pal.G || '#222' : '#222', g2c = pal ? pal.g || glove : glove, ol = pal ? pal.o || '#000' : '#000';
   line(SH20.b[0], SH20.b[1] + 1, hx - dx * 3, hy - dy * 3 + 1, ol);
   line(SH20.f[0], SH20.f[1] + 1, hx, hy + 1, ol);
   line(SH20.b[0], SH20.b[1], hx - dx * 3, hy - dy * 3, arm);
   line(SH20.f[0], SH20.f[1], hx, hy, arm);
   line(bx, by, tx, ty, sc.X || '#2a2a30');
   for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) P(tx + i, ty + j, i || j ? sc.M || '#e8e8e8' : sc.n || '#9aa3ab');
   P(hx, hy, glove);
   P(hx + 1, hy, g2c);
   P(hx - dx * 3, hy - dy * 3, glove);
   P(hx - dx * 3 + 1, hy - dy * 3, g2c);
   P(hx, hy - 1, ol);
  });
 }
 function drawWorld() {
  const G = game;
  if (!G || !G.players) return;
  if (G.carrier && otsAim282(G.carrier)) {
   try {
    shotArt(G.carrier, 'ots', 0, null);
   } catch (e) {
    console.error(e);
   }
  }
  for (const p of G.players) {
   const S = p.shot20;
   if (!S) continue;
   const e = menuT - S.t0;
   if (e > .5) {
    p.shot20 = null;
    continue;
   }
   if (!S.type) continue;
   const u = e / .42, ph = u < .22 ? 0 : u < .62 ? (u - .22) / .4 : 1, ease = ph * ph * (3 - 2 * ph);
   if (window.__rl_no2002f5) {
    const [a0, a1] = SARC[S.type], flat = S.type === 'side', a = a0 + (a1 - a0) * ease;
    if (ph > 0) for (let k = 1; k <= 4; k++) {
     const ak = a0 + (a1 - a0) * Math.max(0, ease - k * .12);
     g.globalAlpha = .5 - k * .1;
     stickAt(p, ak, flat, SCOL[S.type]);
    }
    g.globalAlpha = u > 1 ? Math.max(0, 1 - (u - 1) * 6) : 1;
    stickAt(p, a, flat, '#c9a46b');
    g.globalAlpha = 1;
   } else {
    if (ph > 0 && ph < 1) for (let k = 1; k <= 3; k++) {
     g.globalAlpha = .45 - k * .12;
     shotArt(p, S.type, Math.max(0, ease - k * .12), SCOL[S.type]);
    }
    g.globalAlpha = 1;
    shotArt(p, S.type, ease, null);
   }
   const b = G.ball;
   if (b && (b.state === 'shot' || b.state === 'net') && e < .45) {
    const sx = S.x + 6, sy = S.y - 12, n = 14;
    for (let i = 0; i < n; i++) {
     const f = i / n;
     g.globalAlpha = .15 + .6 * f;
     px(Math.round(sx + (b.x - sx) * f), Math.round(sy + (b.y - sy) * f), SCOL[S.type]);
    }
    g.globalAlpha = 1;
   }
   if (e < .5) text(S.type === 'ots' ? 'OVER THE SHOULDER' : S.type === 'over' ? 'OVERHAND' : S.type === 'under' ? 'UNDERHAND' : 'SIDEARM', Math.round(S.x), Math.round(S.y) - 40, 1, SCOL[S.type], 'center', '#000');
  }
  const A = G.air20;
  if (A) {
   g.globalAlpha = .35;
   rect(Math.round(A.gx) - 4, Math.round(A.gy + A.lift), 9, 2, '#000');
   g.globalAlpha = 1;
  }
  const B = G.back20;
  if (B) {
   const e = menuT - B.t0, p = B.who;
   if (e > 2.6 || !p) G.back20 = null; else {
    const x = Math.round(p.x), y = Math.round(p.y), hand = '#f0c090';
    if (!B.g1 || hunch204(p)) {
     rect(x - 5, y - 9, 2, 3, hand);
     rect(x - 6, y - 8, 1, 1, '#000');
    }
    const s = B.g1 ? e < 2.2 ? 'OH MY BACK!' : 'NOT AT MY AGE...' : e < 1.3 ? 'OH MY BACK...' : 'NOT AT MY AGE...', w = textW(s) + 8, bx = x - Math.round(w / 2), by = y - 48 - Math.round(Math.sin(e * 3) * 1);
    rect(bx - 1, by - 1, w + 2, 12, '#000');
    rect(bx, by, w, 10, '#ffffff');
    rect(x - 2, by + 10, 4, 2, '#ffffff');
    rect(x - 1, by + 12, 2, 2, '#ffffff');
    text(s, x, by + 2, 1, '#0b1a20', 'center');
   }
  }
 }
 function arrow(x, y, dir, col) {
  const b = Math.floor(menuT * 4) % 2 ? 2 : 0;
  if (dir === 2) {
   rect(x - 2, y - 8 + b, 5, 6, col);
   for (let i = 0; i < 5; i++) rect(x - 4 + i, y - 2 + b + i, 9 - 2 * i, 1, col);
   return;
  }
  const xo = x - dir * b;
  rect(dir > 0 ? xo - 12 : xo + 6, y - 2, 7, 5, col);
  for (let i = 0; i < 6; i++) rect(dir > 0 ? xo - 6 + i : xo + 5 - i, y - 5 + i, 1, 11 - 2 * i, col);
 }
 function drawSettings(inGame) {
  const cw = Math.max(110, Math.min(148, Math.floor(W / 2 - 42)));
  redeemBtn(cw);
  if (cp32gone()) return;
  const unl = cpUnlocked(), done = !!S20.cpTut, on = cpOn() && !(game && game.tutorial), w = cw, h = 17, x = W - 6 - w, y = 1;
  const bg = !unl ? '#3a4a55' : !done ? Math.floor(menuT * 3) % 2 ? '#ffd23a' : '#ffb14d' : on ? '#7dff7a' : '#3a4a55', fg = !unl ? '#9aa3ab' : !done || on ? '#0b1a20' : '#cfe';
  hit('CHANGING PLANES SHOOTING', x, y, w, h, () => {
   if (!cpUnlocked()) {
    try {
     SFX.bad();
    } catch (e) {}
    return;
   }
   if (!S20.cpTut) {
    if (inGame) {
     toast20('FINISH THIS GAME, THEN TURN IT ON FROM HOME');
     return;
    }
    S20.cpOn = true;
    save();
    startTutorial('cp');
    return;
   }
   S20.cpOn = !S20.cpOn;
   save();
   try {
    SFX.tap();
   } catch (e) {}
  }, 'CHANGING PLANES SHOOTING');
  rect(x, y + 2, w, h, '#000');
  rect(x, y, w, h, bg);
  text('CHANGING PLANES SHOOTING', x + w / 2, y + 2, 1, fg, 'center');
  const l2 = !unl ? 'WIN 2 GAMES TO UNLOCK (' + Math.min(2, wins()) + '/2)' : !done ? 'TAP TO TURN ON' : on ? 'ON - SWIPE AS YOU LET GO' : 'OFF';
  if (!unl) {
   const lx = Math.round(x + w / 2 - textW(l2) / 2) - 9;
   rect(lx, y + 11, 5, 4, fg);
   rect(lx + 1, y + 9, 1, 2, fg);
   rect(lx + 3, y + 9, 1, 2, fg);
   rect(lx + 1, y + 8, 3, 1, fg);
  }
  text(l2, x + w / 2 + (unl ? 0 : 4), y + 10, 1, fg, 'center');
  if (unl && !done) {
   arrow(x - 4, y + 8, 1, '#ffe14d');
  }
 }
 const CODES20 = {
  USAGOLD: 1,
  PLANES: 1
 };
 if (!window.__rl_v124gb && !window.__rl_no332kit) CODES20.JARVISKIT = 1;
 function redeemBtn(w) {
  const x = 6, y = 1, h = 17, R = S20.redeemed || {}, used = !!R.USAGOLD, pl = !!R.PLANES && !window.__rl_no2314;
  const kit = !!R.JARVISKIT && !!CODES20.JARVISKIT, nR = [ used, pl, kit ].filter(Boolean).length;
  const sub0 = used && pl ? textW('USAGOLD + PLANES REDEEMED') <= w - 4 ? 'USAGOLD + PLANES REDEEMED' : 'BOTH CODES REDEEMED' : used ? 'USAGOLD REDEEMED' : pl ? 'PLANES REDEEMED' : 'TAP TO ENTER A CODE';
  const sub = !kit ? sub0 : nR === 1 ? textW('JARVISKIT REDEEMED') <= w - 4 ? 'JARVISKIT REDEEMED' : 'CODE REDEEMED' : textW(nR + ' CODES REDEEMED') <= w - 4 ? nR + ' CODES REDEEMED' : 'CODES REDEEMED';
  hit('REDEEM CODE', x, y, w, h, () => redeem20(), 'REDEEM CODE');
  rect(x, y + 2, w, h, '#000');
  rect(x, y, w, h, '#3a4a55');
  text('REDEEM CODE', x + w / 2, y + 2, 1, '#ffe14d', 'center');
  text(sub, x + w / 2, y + 10, 1, '#cfe', 'center');
 }
 function redeem20(code) {
  if (code == null) {
   try {
    code = window.prompt('REDEEM CODE');
   } catch (e) {
    code = null;
   }
  }
  const c = String(code || '').trim().toUpperCase();
  if (!c) return null;
  if (!CODES20[c] || c === 'PLANES' && (window.__rl_no2314 || cp32gone())) {
   toast20('THAT CODE ISN\'T VALID');
   try {
    SFX.bad();
   } catch (e) {}
   return {
    ok: false,
    why: 'bad'
   };
  }
  S20.redeemed = S20.redeemed || {};
  if (S20.redeemed[c]) {
   toast20('ALREADY REDEEMED ON THIS DEVICE');
   return {
    ok: false,
    why: 'used'
   };
  }
  if (c === 'JARVISKIT') {
   if (!window.KIT332 || !KIT332.ready()) {
    toast20('TRY AGAIN IN A SEC');
    return {
     ok: false,
     why: 'kit'
    };
   }
   S20.redeemed.JARVISKIT = Date.now();
   save();
   let r = null;
   try {
    r = KIT332.redeem();
   } catch (e) {
    console.error(e);
   }
   return Object.assign({
    ok: true
   }, r || {});
  }
  if (c === 'PLANES') {
   S20.redeemed.PLANES = Date.now();
   if (!S20.cpUnl) {
    S20.cpUnl = 1;
    S20.cpOn = true;
   }
   save();
   toast20('PLANES: CHANGING PLANES UNLOCKED!');
   return {
    ok: true,
    trophies: [],
    ach: [],
    items: []
   };
  }
  if (!window.V17 || !V17.award || !V17.ST) {
   toast20('TRY AGAIN IN A SEC');
   return {
    ok: false,
    why: 'v17'
   };
  }
  const ST = V17.ST(), a0 = Object.assign({}, ST.ach || {}), t0 = Object.assign({}, ST.trophies || {});
  S20.redeemed[c] = Date.now();
  if (!window.__rl_no204f7d) {
   if (!S20.cpUnl) {
    S20.cpUnl = 1;
    S20.cpOn = true;
   }
   S20.f7d204 = 1;
  }
  save();
  try {
   LS.set('wgTitles', Math.max(1, LS.get('wgTitles', 0) || 0));
  } catch (e) {}
  V17.award('trophy_globe');
  if (ST.trophies.trophy_globe) ST.trophies.trophy_globe.team = 'WUSA';
  if (ST.ach && !ST.ach.passport) ST.ach.passport = Date.now();
  if (!window.__rl_no204f7e) {
   try {
    f7eGrant();
   } catch (e) {
    console.error(e);
   }
  }
  if (window.V22) {
   try {
    V22.usaGrant(false);
   } catch (e) {
    console.error(e);
   }
  }
  try {
   V17.save && V17.save();
  } catch (e) {}
  const got = {
   trophies: Object.keys(ST.trophies || {}).filter(k => !t0[k]),
   ach: Object.keys(ST.ach || {}).filter(k => !a0[k]),
   items: window.__rl_no204f7e ? [] : F7E_204.filter(id => (ST.inv || {})[id] > 0)
  };
  toast20(window.__rl_no204f7d ? 'USAGOLD: GOLD GLOBE (TEAM USA) UNLOCKED!' : 'USAGOLD: GOLD GLOBE, ' + (cp32gone() ? '' : 'CHANGING PLANES, ') + (window.__rl_no30crew ? 'DOCTOR DOUM' : 'DOCTOR GLOOM') + ' + #2 PENCIL!');
  return Object.assign({
   ok: true
  }, got);
 }
 function toast20(s) {
  try {
   menuMsg = {
    s: s,
    t: 2.2
   };
  } catch (e) {}
  if (window.V17 && V17.toast) V17.toast(s, '#ffe14d');
 }
 const PLAY = [ 'QUICK GAME', 'ONLINE', 'SEASON', 'CONTINUE SEASON', 'PLAY SEASON', 'PLAY WORLD GAMES', 'WORLD GAMES', 'PRACTICE' ];
 function gateRows(rows) {
  for (const r of rows) for (const e of r) if (PLAY.includes(e.label)) {
   const fn = e.fn;
   e.fn = () => {
    const k = gate();
    if (!k) return fn();
    blocked(k);
   };
  }
 }
 function blocked(k) {
  try {
   SFX.bad && SFX.bad();
  } catch (e) {}
  if (k === 'air') {
   menuMsg = {
    s: 'PLAY THE AIR DIVE TUTORIAL FIRST',
    t: 2
   };
   startTutorial('air');
   return;
  }
  if (k === 'cp' && t1On()) {
   menuMsg = {
    s: 'PLAY THE CHANGING PLANES TUTORIAL FIRST',
    t: 2
   };
   S20.cpAuto = 1;
   S20.cpOn = true;
   save();
   startTutorial('cp');
   return;
  }
  menuMsg = {
   s: 'TURN ON CHANGING PLANES IN SETTINGS FIRST',
   t: 2.4
  };
 }
 function drawHome(bars, modal) {
  const k = gate();
  if (!k || modal) return;
  if (k === 'air' && !S20.airAuto) {
   S20.airAuto = 1;
   save();
   startTutorial('air');
   return;
  }
  if (k === 'cp' && t1On() && !S20.cpAuto) {
   S20.cpAuto = 1;
   S20.cpOn = true;
   save();
   startTutorial('cp');
   return;
  }
  const top = 'NEW: ' + (k === 'cp' ? 'CHANGING PLANES SHOOTING UNLOCKED!' : 'OLD FOXWORTH UNLOCKED - AIR DIVE LESSON'), b = (bars || []).find(q => q.label === (k === 'cp' ? 'GAME SETTINGS' : 'QUICK GAME'));
  if (b) {
   arrow(b.x - 3, b.y + Math.round(b.h / 2), 1, '#ffe14d');
   const s = k === 'cp' ? 'TAP SETTINGS' : 'TAP TO START IT', tw = textW(s) + 6;
   rect(b.x - tw - 2, b.y - 11, tw, 9, 'rgba(0,0,0,.75)');
   text(s, b.x - 2 - tw / 2, b.y - 9, 1, '#ffe14d', 'center');
   const w = textW(top) + 8;
   rect(Math.round(b.x + b.w / 2 - w / 2), 20, w, 9, 'rgba(0,0,0,.8)');
   text(top, Math.round(b.x + b.w / 2), 22, 1, '#ffe14d', 'center');
  }
 }
 function tutSetup(s) {
  const G = game;
  if (s === TV20.CUT || s === TV20.ROLL || s === TV20.ONE || s === TV20.TOE) {
   setupPossession(GX - 130, CY);
   G.run = null;
   return true;
  }
  if (CPSTEPS().includes(s)) {
   setupPossession(420, 80);
   G.run = null;
   if (G.tutorial && G.tutorial.track === 'cp' && t1On()) {
    for (const d of G.players.filter(q => q.team === 'D' && !q.gk)) dropPlayer(d);
    G.noD204 = 1;
   }
   return true;
  }
  if (s === TV20.AIR) {
   setupPossession(420, 80);
   const c = G.carrier;
   if (!c) return true;
   c.pl = PP('LEG-0');
   c.x = GX + 16;
   c.y = CY - 5;
   c.tx = c.x;
   c.ty = c.y;
   G.run = null;
   G.air20 = null;
   for (const d of G.players) if (d.team === 'D' && !d.gk && Math.hypot(d.x - c.x, d.y - c.y) < 30) {
    d.x -= 30;
    d.react = 2;
   }
   return true;
  }
  return false;
 }
 function tutDone(i) {
  const f = game.tutorial.f;
  return !!{
   [TV20.CUT]: f.split20,
   [TV20.ROLL]: f.roll20,
   [TV20.ONE]: f.one20,
   [TV20.TOE]: f.toe20,
   [TV20.OVER]: f.over20,
   [TV20.UNDER]: f.under20,
   [TV20.SIDE]: f.side20,
   [TV20.CP]: f.cpBetter,
   [TV20.OHS]: f.card,
   [TV20.LEG]: f.card,
   [TV20.AIR]: f.air20
  }[i];
 }
 function tutComplete(tr) {
  if (tr === 'cp') {
   S20.cpTut = 1;
   S20.cpOn = true;
   save();
  }
  if (tr === 'air') {
   S20.airDone = 1;
   save();
  }
 }
 const noSkip = tr => tr === 'cp' || tr === 'air';
 const GAR34 = () => !window.__rl_v124gb && !window.__rl_no34gar;
 const LEGTXT = {
  'LEG-0': GAR34() ? 'HIGH FLYER: FROM X (BEHIND THE CAGE) TAP THE NET - HE JUMPS OVER THE BACK OF THE CREASE, SHOOTS IN MID-AIR, DIVES OUT THE FRONT (DISTANCE-SHOT ODDS). LEGEND RATINGS, A LITTLE SLOWER (SPEED 78). GRABS HIS BACK AFTER HE SCORES. TOP LEVEL OF THE SEASON 1 GAME PASS.' : 'AIR DIVE: FROM X (BEHIND THE CAGE) TAP THE NET - HE JUMPS OVER THE BACK OF THE CREASE, SHOOTS IN MID-AIR, DIVES OUT THE FRONT (DISTANCE-SHOT ODDS). LEGEND RATINGS, A LITTLE SLOWER (SPEED 78). GRABS HIS BACK AFTER HE SCORES. TOP LEVEL OF THE SEASON 1 GAME PASS.',
  'LEG-1': 'A LEGEND FROM THE OLD DAYS - THE HIGHEST OVERALL OF ANYONE, LEGENDS INCLUDED.',
  'LEG-2': 'BUILT LIKE A TRUCK, FAST AS A DEER, WITH A CANNON FOR A SHOT. NO TEAM YET.',
  'LEG-3': 'A LOCKDOWN LONG POLE FROM BACK IN THE DAY. NO TEAM YET.'
 };
 const LEGSUB = ' SUB HIM ONTO ANY TEAM IN QUICK PLAY + ONLINE GAMES (YOUR LINEUP). UNLOCKED = HE IS IN YOUR SEASON DRAFTS (ONLINE DRAFTS: IF ANYONE IN THE LOBBY HAS HIM, EVERYONE CAN PICK HIM).';
 const SPEC22 = {
  'LEG-0': GAR34() ? 'SPECIAL: THE HIGH FLYER - FROM X (BEHIND THE CAGE) TAP THE NET: HE JUMPS OVER THE CREASE, SHOOTS IN MID-AIR, DIVES OUT THE FRONT. GRABS HIS BACK AFTER HE SCORES. LEGEND RATINGS, SPEED 78.' : 'SPECIAL: THE AIR DIVE - FROM X (BEHIND THE CAGE) TAP THE NET: HE JUMPS OVER THE CREASE, SHOOTS IN MID-AIR, DIVES OUT THE FRONT. GRABS HIS BACK AFTER HE SCORES. LEGEND RATINGS, SPEED 78.',
  'LEG-1': 'A LEGEND FROM THE OLD DAYS - THE HIGHEST OVERALL OF ANYONE, LEGENDS INCLUDED.',
  'LEG-2': 'BUILT LIKE A TRUCK, FAST AS A DEER, WITH A CANNON FOR A SHOT. NO TEAM YET.',
  'LEG-3': 'SPECIAL: A LONG POLE - A LOCKDOWN DEFENDER. NO BACK-GRAB (THAT\'S OLD FOXWORTH\'S). NO TEAM YET.'
 };
 const LEGSUB22 = ' HE IS IN YOUR SEASON DRAFTS TOO.';
 function legText(pid) {
  const p = PP(pid);
  if (window.V22 && V22.on()) return (SPEC22[pid] || LEGTXT[pid] || '') + (p ? ' OVR ' + p.ovr + '.' : '') + LEGSUB22;
  return (LEGTXT[pid] || '') + (p ? ' OVR ' + p.ovr + '.' : '') + LEGSUB;
 }
 function draftLeg() {
  return Array.isArray(window.__leg20Pool) ? window.__leg20Pool.slice() : ownedLeg();
 }
 function luExtra(ids) {
  if (typeof PS !== 'undefined' && PS.luSrc === 'season') return [];
  if (window.CP2319 && !CP2319.luOk()) return [];
  return ownedLeg().filter(id => !ids.includes(id)).concat(window.V22 ? V22.subExtra(ids) : []);
 }
 function cardTag(pid) {
  const p = PP(pid);
  return p && p.leg ? '  LEGACY' + (pid === 'LEG-0' ? GAR34() ? '  HIGH FLYER' : '  AIR DIVE' : '') : '';
 }
 return {
  redeem20: redeem20,
  shotBody: shotBody,
  otsAim282: otsAim282,
  airReady: airReady,
  joyFeed: joyFeed,
  joyCut: joyCut,
  tick: tick,
  rightStroke: rightStroke,
  cpStroke: cpStroke,
  shot: shot,
  preShot: preShot,
  onGoal: onGoal,
  drawWorld: drawWorld,
  drawSettings: drawSettings,
  gateRows: gateRows,
  drawHome: drawHome,
  tutSetup: tutSetup,
  tutDone: tutDone,
  tutComplete: tutComplete,
  noSkip: noSkip,
  legText: legText,
  draftLeg: draftLeg,
  luExtra: luExtra,
  cardTag: cardTag,
  twoHands: twoHands,
  isOHS: isOHS,
  ownedLeg: ownedLeg,
  gate: gate,
  cpOn: cpOn,
  cpUnlocked: cpUnlocked,
  groan: groan,
  back206: back206,
  ew206: ew206,
  goal206: goal206,
  TC206: TC206,
  st: () => S20,
  set: o => {
   Object.assign(S20, o);
   save();
  },
  CP20: CP20,
  AIR20: AIR20,
  ROLL20: ROLL20,
  ONEH: ONEH
 };
})();

window.V20 = V20;
