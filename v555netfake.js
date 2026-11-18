/* v555netfake.js - BAGGA LAX 1.3.1: CREASE FAKES + SHOOTING FIXES ONLINE (Charlie, Nov 12 9:28 AM: "port them now. Online should be the same.").
 * Before: crease fakes (v507fake FAKE button, v547fakeread "HE READ IT" / recovery DIVING SAVE), v506goalie (an open, quick, fully
 *  pulled-back shot from range can beat the goalie) and part 2 of v544shotturn (a pull-back that starts just outside the cage target
 *  is a shot, not a backward split dodge) were all switched off in online matches (game.online / RLNET.inGame gates).
 * How online works: the phone whose team has the ball RUNS the play (RLNET.auth); the other phone shows its snapshots (positions,
 *  poses incl. the goalie's save pose, and on-field text) and sends back its stick input. The shooter is always on the phone that
 *  runs the play, and the goalie he shoots at is simulated there too - so every roll (the fake bite / read, the crease finish, the
 *  recovery dive, the range-shot beat) is made on that one phone and both screens see the same result. No guessing on the other side.
 * Now, when BOTH phones run this build (capability flag; an older app on either side = today's online game, no fakes):
 *  - FAKE button near the cage (GROSS / NASTY / BAGGATWAAN, the lobby difficulty both phones already share), same rules as offline:
 *    tap FAKE -> circles go red -> tap a circle = pump fake there -> the goalie gets v547's READ roll (V547FR.roll: bite most of the
 *    time, good goalies read some) -> shoot. v507's crease-finish table (with v518's tier rule) and v547's rare recovery dive apply.
 *    "FAKE! HE BIT" / "FAKE! HE READ IT" / "DIVING SAVE!" are on-field text, so the other phone sees them in the normal snapshots.
 *    Keys: F then 1-4 (crease circle keys); controller TRIANGLE / Y like offline.
 *  - v506: open, quick, fully pulled-back range shots can beat the goalie (same table, the shooter's phone rolls).
 *  - v544 part 2 (pull-back starting just outside the cage target = shot). Part 1 of v544 (a flick release is a shot, not a face
 *    dodge) never had an online gate: it already works on whichever phone has the ball (host or guest) - checked two-client.
 * The v511 lobby FAKES row stays as it is: v518 turned the whole v511 file off ("fakes always on"), so there is no row to show.
 * Net protocol: only ADDED - field ver.nf555 and an added hello message 'nf5h' {c:555, a:0|1}. Nothing changed / removed.
 * Kill switch: window.__rl_no555nf = true (checked live) -> exactly today's online game. Also honours __rl_no507fake / __rl_no547fr /
 *  __rl_no506gk / __rl_no544st. No ids, rl_* keys or saves touched. Test hooks / stats: window.V555NF.
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v555nf_loaded) return;
 W0.__rl_v555nf_loaded = 1;
 const N = W0.RLNET, SH = W0.SHOT26;
 const need = [ 'step', 'render', 'releaseShot', 'drawPlayers', 'hit', 'text', 'addFx' ];
 const miss = need.filter(n => typeof W0[n] !== 'function');
 if (!N || !N.Link || !N.Link.prototype || !SH || miss.length) { W0.V555NF = { on: () => false, why: miss.concat(N ? [] : [ 'RLNET' ], SH ? [] : [ 'SHOT26' ]) }; return; }
 const killed = () => !!(W0.__rl_no555nf || W0.__rl_v124gb);
 const rt = () => performance.now() / 1e3;
 const now = () => performance.now();
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const ST = { fakes: 0, arms: 0, bites: 0, reads: 0, dives: 0, rolls: [], beat506: 0, elig506: 0, ring: 0, errs: [], hellos: 0, cap: null };
 const err = (e, w) => { try { if (ST.errs.length < 10) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v555netfake', w, e); } } catch (x) {} };
 // ---------------- capability (both phones must run this build) ----------------
 const C = { peer: false, link: null, helloT: 0, n: 0, acked: false };
 const LP = N.Link.prototype;
 const SEND0 = LP.send;
 LP.send = function (e) {
  try { if (e && e.t === 'ver' && !killed()) e.nf555 = 1; } catch (x) {}
  return SEND0.apply(this, arguments);
 };
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try {
   if (e && !killed()) {
    if (e.t === 'ver' && e.nf555) peerCap('ver');
    else if (e.t === 'nf5h') { peerCap('hello'); if (!e.a && !C.acked) { C.acked = true; try { N.link && N.link.send({ t: 'nf5h', c: 555, a: 1 }); } catch (x) {} } }
   }
  } catch (x) { err(x, 'ev'); }
  return GE0.apply(this, arguments);
 };
 function peerCap(why) { if (!C.peer) ST.cap = { why: why, at: Math.round(now()) }; C.peer = true; }
 function capTick() {
  if (!N.link) { C.peer = false; C.n = 0; C.acked = false; C.link = null; return; }
  if (C.link !== N.link) { C.link = N.link; C.peer = false; C.n = 0; C.acked = false; }
  if (!killed() && !C.peer && C.n < 12 && now() - C.helloT > 3000) { C.helloT = now(); C.n++; ST.hellos++; try { N.link.send({ t: 'nf5h', c: 555, a: 0 }); } catch (e) {} }
 }
 function online(G) { return !!(G && (G.online || G.meta && G.meta.online)) || !!N.inGame; }
 // this phone runs the play and both phones have the port
 function act(G) { return !killed() && !!G && !!N.inGame && !!N.auth && C.peer && !G.tutorial && !G.practice && !G.brave && online(G); }
 // ======================================================================================================================
 // 1) CREASE FAKES (v507 rules, v547 read / dive) on the phone running the play
 // ======================================================================================================================
 const V7 = () => W0.V507FAKE || null;
 const K = (V7() && V7().K) ? V7().K : { base: [ .55, .50, .45 ], opp: [ .95, .93, .90 ], same: [ .15, .12, .10 ], near: [ .35, .30, .25 ],
  gkK: .04, gkMax: .08, finK: .02, finMax: .04, lowConv: .35, win: 2.0, biteSpd: 400, preR: 10, noFakeNormalBelow: 1 };
 const F = { armed: false, used: false, fake: null, offT: 0, car: null };
 function tier() { try { const l = DF && DF.level; return l === 3 ? 0 : l === 4 ? 1 : l === 5 ? 2 : -1; } catch (e) { return -1; } }
 function fakeOn(G) { return act(G) && !W0.__rl_no507fake && tier() >= 0; }
 function car() { const G = G0(); return G && G.carrier && G.ball && G.ball.state === 'held' && G.carrier.team === 'O' ? G.carrier : null; }
 function circOn() { try { return SCR() === 'live' && canShoot() && !SH.S.aim && SH.circlesOn() && SH.inTap(); } catch (e) { return false; } }
 function nearOn() {
  const c = car(); if (!c || SCR() !== 'live') return false;
  try { if (!canShoot()) return false; } catch (e) { return false; }
  return c.x < GX && Math.hypot(GX - c.x, CY - c.y) <= SH.CFG.tapR + K.preR;
 }
 function btnShown() { const G = G0(); return !!G && fakeOn(G) && !F.used && (F.armed || nearOn()); }
 const BR = 12;
 function btnPos() { return { x: W - BR - 6, y: 42 }; }
 function arm(src) {
  if (!btnShown() || F.armed) return false;
  F.armed = true; ST.arms++;
  try { SH.S.slowUntil = rt() + 1.6; } catch (e) {}
  try { SFX.tap && SFX.tap(); } catch (e) {}
  ST.lastArm = src || 'tap';
  return true;
 }
 function disc(x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
 const BTNR = { x: 0, y: 0, w: 0, h: 0, t: -9 };
 function drawBtn() {
  if (!btnShown()) return;
  const p = btnPos(), live = circOn(), t = rt();
  const pulse = F.armed ? 1 : .5 + .5 * Math.sin(t * 8);
  g.save();
  g.globalAlpha = F.armed ? .85 : live ? .7 : .45;
  disc(p.x + .5, p.y + 2.5, BR, '#000');
  disc(p.x + .5, p.y + .5, BR, F.armed ? '#ffffff' : '#d8261c');
  disc(p.x + .5, p.y + .5, BR - 2, F.armed ? '#ff3b2e' : '#ff4a3a');
  g.strokeStyle = F.armed ? '#ffe14d' : 'rgba(255,255,255,' + (.45 + .4 * pulse).toFixed(2) + ')';
  g.lineWidth = 1; g.beginPath(); g.arc(p.x + .5, p.y + .5, BR - .5, 0, Math.PI * 2); g.stroke();
  g.restore();
  g.save(); g.globalAlpha = F.armed ? .85 : live ? .7 : .45;
  text('FAKE', p.x + 1, p.y - 2, 1, '#ffffff', 'center', '#5a0000');
  g.restore();
  if (!F.armed) hit('fake555', p.x - BR - 3, p.y - BR - 3, 2 * BR + 6, 2 * BR + 6, () => arm('tap'), 'FAKE');
  BTNR.x = p.x - BR - 3; BTNR.y = p.y - BR - 3; BTNR.w = 2 * BR + 6; BTNR.h = 2 * BR + 6; BTNR.t = rt();
 }
 function drawRed() {
  if (!F.armed || !circOn()) return;
  const t = rt();
  for (const q of SH.circles()) {
   const R = SH.CFG.circR;
   g.fillStyle = 'rgba(255,48,36,' + (.55 + .15 * Math.sin(t * 9)).toFixed(2) + ')';
   g.beginPath(); g.arc(q.x + .5, q.y + .5, R, 0, Math.PI * 2); g.fill();
   g.strokeStyle = '#ff3b2e'; g.lineWidth = 1;
   g.beginPath(); g.arc(q.x + .5, q.y + .5, R - .5, 0, Math.PI * 2); g.stroke();
  }
 }
 // on-field text: an 'txt' fx rides the normal snapshot, so the other phone shows it over the same goalie
 function say(s, col, gk, dy, life) {
  try { if (gk) addFx('txt', Math.round(gk.x), Math.round(gk.y) - (dy || 30), { s: s, col: col, life: life || .9 }); } catch (e) { err(e, 'say'); }
 }
 function readRoll(G, gk) {
  // v547's rule (bite chance by difficulty and the goalie's SAV). Its own check() only watches v507 / v510, so it never doubles this.
  try { if (!W0.__rl_no547fr && W0.V547FR && V547FR.on && V547FR.on() && typeof V547FR.roll === 'function') return V547FR.roll(G, gk); } catch (e) { err(e, 'roll'); }
  return { bite: true, p: 1, none: 1 };
 }
 function doFake(q, src) {
  const G = G0(), c = car(); if (!G || !c || !q) return false;
  F.armed = false; F.used = true;
  const gk = G.goalie;
  const fk = { name: q.name, top: q.top, high: q.high, t: rt(), y: CY + (q.top ? -1 : 1) * (MOUTH + 2), gy0: gk ? gk.y : null };
  ST.fakes++; ST.lastFake = { name: q.name, src: src || 'tap' };
  try { c.shot20 = { type: q.high ? 'over' : 'under', t0: menuT, one: false, top: q.top, x: c.x, y: c.y, f507: true }; } catch (e) {}
  try { SFX.shot && SFX.shot(.15); } catch (e) {}
  try { SH.S.slowUntil = rt() + 1.4; } catch (e) {}
  const o = readRoll(G, gk);
  fk.r547 = o.bite ? 0 : 1;
  if (o.bite) {
   ST.bites++;
   F.fake = fk;
   if (gk) { try { gk.saveT0 = menuT; gk.saveFr = q.high ? 'save_high' : 'save_side'; } catch (e) {} }
   say('FAKE!', '#ff5a4a', gk, 30); setTimeout(() => { try { if (G0() === G) say('HE BIT', '#ffffff', gk, 23, .75); } catch (e) {} }, 150);
  } else {
   ST.reads++;
   F.fake = null;   // READ: as far as the goalie and the shot are concerned the fake never happened (v547)
   say('FAKE!', '#ff5a4a', gk, 38); setTimeout(() => { try { if (G0() === G) say('HE READ IT', '#ffe14d', gk, 31, .85); } catch (e) {} }, 150);
  }
  ST.rolls.push({ ev: 'fake', bite: o.bite, p: o.p != null ? +(+o.p).toFixed(3) : null, side: N.side, lv: (typeof DF !== 'undefined' ? DF.level : null) });
  if (ST.rolls.length > 60) ST.rolls.shift();
  return true;
 }
 const D0 = SH.down;
 SH.down = function (pt, p) {
  try {
   const G = G0();
   if (G && F.armed && fakeOn(G) && SCR() === 'live' && car()) {
    const wx = p.x + Math.round(camX), wy = p.y, tq = circOn() ? SH.quad(wx, wy, true) : null;
    if (tq) { doFake(tq, 'tap'); pt.role = 'shot26'; pt.f555 = true; return true; }
   }
  } catch (e) { err(e, 'down'); }
  return D0.apply(this, arguments);
 };
 // the 1-4 crease keys go through V483PULL.tapCircle -> SHOT26.down too; nothing extra needed
 const RS0 = W0.releaseShot;
 W0.releaseShot = function () {
  let pre = null;
  try {
   const G = G0(), c = G && G.carrier;
   if (G && c && c.team === 'O' && SCR() === 'live' && fakeOn(G) && circOn()) pre = { k: tier(), fake: F.fake && rt() - F.fake.t <= K.win ? Object.assign({}, F.fake) : null, c: c };
  } catch (e) { err(e, 'pre'); }
  const r = RS0.apply(this, arguments);
  try { const b = G0() && game.ball; if (pre && b && b.state === 'shot' && b.shooter === pre.c && !b.f507) { b.f555 = pre; b.v452 = true; } } catch (e) { err(e, 'rel'); }
  return r;
 };
 function aimTo(b, ty) { const sp = Math.hypot(b.vx, b.vy) || 200, a = Math.atan2(ty - b.y, GX - b.x); b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; }
 function diveP(gk) { try { if (W0.V547FR && V547FR.diveP) return V547FR.diveP(gk); } catch (e) {} return 0; }
 function settle(G) {
  const b = G.ball, P = b.f555;
  if (!P || P.done) return;
  P.done = true;
  const gk = G.goalie, s = b.s25, c = P.c;
  const ty0 = b.target && typeof b.target.y === 'number' ? b.target.y : b.y + b.vy * (GX - b.x) / Math.max(1, b.vx);
  const top = ty0 < CY;
  const hi = !!(b.target && (b.target.high != null ? b.target.high : b.high));
  let p, kind;
  const k = P.k, fk = P.fake;
  if (fk && fk.top !== top) { kind = 'opp'; p = K.opp[k]; }
  else if (fk && fk.high === hi) { kind = 'same'; p = K.same[k]; }
  else if (fk) { kind = 'near'; p = K.near[k]; }
  else if (k < K.noFakeNormalBelow) { kind = 'none'; p = null; }
  else {
   kind = 'none';
   let adj = 0;
   try { adj -= cl(K.gkK * rf(gk && gk.pl, 'sav'), -K.gkMax, K.gkMax); } catch (e) {}
   try { adj += cl(K.finK * pr(c, 'fin'), -K.finMax, K.finMax); } catch (e) {}
   p = cl(K.base[k] + adj, .3, .7);
  }
  const roll = Math.random();
  let goal = p == null ? null : roll < p;
  // v547 recovery dive: he bit, you shot the other side (a goal by the table) - sometimes he dives back across and saves it
  let dive = false;
  if (goal === true && kind === 'opp' && !W0.__rl_no547fr) {
   const f = W0.__rl_547dive, dp = diveP(gk), r2 = Math.random();
   dive = f === 'yes' ? true : f === 'no' ? false : r2 < dp;
   if (dive) { goal = false; ST.dives++; }
  }
  const ty = CY + (top ? -1 : 1) * cl(Math.abs(ty0 - CY), 2, MOUTH - 2);
  if (goal === true) {
   if (s) { s.own = false; s.read = false; s.reach = null; }
   b.block = null; b.pipe = null; b.aim14 = null;
   if (gk) { gk.reach = .001; gk.react = 9; }
   aimTo(b, ty);
   P.force = 'goal';
  } else if (goal === false) {
   b.block = null; b.pipe = null; b.aim14 = null;
   aimTo(b, ty);
   if (s) s.own = true;
   if (gk) { gk.reach = Math.max(gk.reach || 0, 9); gk.react = 0; gk.dive = ty; }
   if (dive && gk) { try { gk.saveT0 = menuT; gk.saveFr = hi ? 'save_high' : 'save_side'; } catch (e) {} say('DIVING SAVE!', '#7dd8ff', gk, 36, 1.3); }
   P.force = 'save';
  } else { b.v452 = false; P.force = null; }
  P.kind = kind; P.p = p; P.top = top; P.dive = dive;
  ST.rolls.push({ ev: 'shot', k: k, kind: kind, p: p == null ? null : +p.toFixed(3), roll: +roll.toFixed(3), force: P.force, dive: dive, side: N.side });
  if (ST.rolls.length > 60) ST.rolls.shift();
 }
 function hold(G) {
  const b = G.ball, P = b && b.f555;
  if (!P || !P.force || b.state !== 'shot') return;
  const gk = G.goalie;
  if (P.force === 'goal') { if (gk) { gk.reach = .001; gk.react = 9; } b.aim14 = null; if (b.s25) b.s25.own = false; }
 }
 // ======================================================================================================================
 // 2) v506goalie: open, quick, fully pulled-back range shot can beat the goalie (same table; the shooter's phone rolls)
 // ======================================================================================================================
 const K6 = (W0.V506GK && V506GK.K) ? V506GK.K : { beat: [ .36, .4, .31, .39, .34, .22 ], minD: 55, p0: .5, p1: .9, d1: 95, d2: 135, dFar: .45, o0: 2, o1: 5.5, oAt: .15, s0: .5, s1: 1.2, sMin: .25 };
 const ramp = (v, a, b) => cl((v - a) / (b - a), 0, 1);
 function check506(G) {
  const b = G.ball;
  if (!b || b.state !== 'shot' || b.v506 || b.v555g || !b.shooter || b.shooter.team !== 'O') return;
  b.v555g = 1;
  if (b.pipe || b.block || (G.lastShot && G.lastShot.flub)) return;
  const lv = (typeof DF !== 'undefined' && DF.level != null) ? DF.level : -1, pb = K6.beat[lv];
  if (!(pb > 0)) return;
  const f = b.shotFrom || [ b.x, b.y ], d = Math.hypot(GX - f[0], CY - f[1]);
  if (d < K6.minD) return;
  let corner, held = 0;
  if (b.s25) {
   const Ls = SH.S && SH.S.last;
   corner = !!Ls && Ls.place === 'circle' && Ls.type === 'SHOT' && !Ls.short;
   held = Ls && Ls.stare && typeof Ls.stare.held === 'number' ? Ls.stare.held : 0;
  } else corner = !!b.target && Math.abs(b.target.y - CY) >= 4;
  if (!corner) return;
  const fp = ramp(b.power || 0, K6.p0, K6.p1);
  if (!(fp > 0)) return;
  const gk = G.goalie, ay = b.target && typeof b.target.y === 'number' ? b.target.y : CY;
  const gap = gk ? Math.abs(ay - gk.y) : K6.o1;
  const fd = 1 - (1 - K6.dFar) * ramp(d, K6.d1, K6.d2);
  const fo = K6.oAt + (1 - K6.oAt) * ramp(gap, K6.o0, K6.o1);
  const fq = 1 - (1 - K6.sMin) * ramp(held, K6.s0, K6.s1);
  const p = pb * fp * fd * fo * fq;
  ST.elig506++;
  const r = Math.random();
  ST.last506 = { lv: lv, d: +d.toFixed(1), gap: +gap.toFixed(1), held: +held.toFixed(2), p: +p.toFixed(3), beat: r < p };
  if (r >= p) return;
  if (gk) { gk.reach = .001; gk.react = 9; }
  b.aim14 = null; b.v452 = true;
  if (b.s25) { b.s25.own = false; b.s25.read = false; }
  ST.beat506++;
 }
 if (typeof W0.updateLive === 'function') {
  const UL0 = W0.updateLive;
  W0.updateLive = function (dt) {
   try { const G = G0(); if (act(G) && !W0.__rl_no506gk && SCR() === 'live') check506(G); } catch (e) { err(e, '506'); }
   return UL0.apply(this, arguments);
  };
 }
 // ======================================================================================================================
 // 3) v544 part 2: a pull-back that starts just outside the cage target is a shot (not a backward split dodge)
 // ======================================================================================================================
 const C4 = (W0.V544ST && V544ST.CFG) ? V544ST.CFG : { dwell: .15, over: 24, ring: 14, backK: .6, minBack: 20 };
 let pass = false;
 function kOf(pt) { try { return pt && pt.k || SCALE; } catch (e) { return (pt && pt.k) || 1; } }
 function inRing(wx, wy) { const b = SH.cageBox(), sl = SH.CFG.aimSlop + 3 + C4.ring; return !(wx < b.x0 - sl || wx > b.x1 + sl || wy < b.y0 - sl || wy > b.y1 + sl); }
 function atXNoShot(c) { try { return atX231(c) && !(W0.V28 && V28.otsOk && V28.otsOk(c)); } catch (e) { return false; } }
 function liveShootOk() { try { return SCR() === 'live' && !!G0() && canShoot(); } catch (e) { return false; } }
 function ringOk(pt) {
  if (W0.__rl_no544st || !pt || pt.role !== 'field' || pt.stale || pt.joy || pt.zone !== 'R' || pt.screen !== 'live') return false;
  if (pt.v544done || pt.cutDone || pt.pickCalled || pt.bullDone || pt.gsw || pt.dsw || pt.cutMate) return false;
  if (!act(G0())) return false;
  if (!SH.on || !SH.on() || !liveShootOk()) return false;
  if (atXNoShot(game.carrier)) return false;
  return true;
 }
 function pulledBack(pt, cx, cy) {
  const path = pt.path || [], s = [ pt.scx, pt.scy ], pts = path.concat([ [ cx, cy ] ]);
  let far = 0, fx0 = 0;
  for (const q of pts) { const qx = q[0] - s[0], qy = q[1] - s[1], d = Math.hypot(qx, qy); if (d > far) { far = d; fx0 = qx; } }
  const dx = cx - s[0], dy = cy - s[1], d = Math.hypot(dx, dy);
  return -dx >= C4.minBack && -dx >= C4.backK * d && -fx0 >= C4.backK * far;
 }
 function ringConvert(pt, cx, cy) {
  if (!ringOk(pt)) return false;
  const wx = pt.sx + Math.round(camX), wy = pt.sy;
  if (!inRing(wx, wy) || !pulledBack(pt, cx, cy)) return false;
  const sl0 = SH.CFG.aimSlop;
  pt.v544done = true;
  let ok = false;
  pass = true;
  try {
   SH.CFG.aimSlop = sl0 + 3 + C4.ring;
   const r0 = pt.role;
   ok = !!SH.down(pt, { x: pt.sx, y: pt.sy, cx: pt.scx, cy: pt.scy, k: pt.k }) && pt.role === 'shot26';
   if (!ok) pt.role = r0;
  } catch (e) { err(e, 'ring'); ok = false; }
  finally { SH.CFG.aimSlop = sl0; pass = false; }
  if (!ok) return false;
  pt.dodgeStroke = false; pt.v544ring = true;
  try { if (typeof shootP !== 'undefined' && shootP && shootP.id === pt.id) shootP = null; } catch (e) {}
  ST.ring++;
  return true;
 }
 function wrapG(name, fn) { const o = W0[name]; if (typeof o !== 'function') return false; W0[name] = function (...a) { return fn.call(this, o, ...a); }; return true; }
 let wiredRing = false;
 function wireRing() {
  if (wiredRing) return true;
  if (typeof W0.inMove !== 'function' || typeof W0.inUp !== 'function' || typeof W0.nearestMateCss !== 'function') return false;
  wiredRing = true;
  wrapG('nearestMateCss', function (o, ...a) { if (pass) return null; return o.apply(this, a); });
  wrapG('inMove', function (o, id, e) {
   try { if (e && act(G0())) { const pt = pointers.get(id); if (pt && pt.role === 'field' && !pt.v544done) { const p = toLogical(e); ringConvert(pt, p.cx, p.cy); } } } catch (x) { err(x, 'mv'); }
   return o.call(this, id, e);
  });
  wrapG('inUp', function (o, id, e, cancel) {
   let xz = null, xpt = null;
   try {
    if (!cancel && e && act(G0())) {
     const pt = pointers.get(id);
     if (pt && pt.role === 'xnone231' && pt.cageStart && pt.zone === 'R' && !pt.joy && !W0.__rl_no544st) {
      const p = toLogical(e);
      if (pulledBack(pt, p.cx, p.cy) && liveShootOk()) { xz = pt.zone; xpt = pt; pt.zone = 'X544'; }
     }
     if (pt && pt.role === 'field' && !pt.v544done) {
      const p = toLogical(e);
      if (ringConvert(pt, p.cx, p.cy)) { pt.x = p.x; pt.y = p.y; pt.cx = p.cx; pt.cy = p.cy; SH.move(pt); }
     }
    }
   } catch (x) { err(x, 'up'); }
   try { return o.call(this, id, e, cancel); } finally { if (xpt) xpt.zone = xz; }
  });
  return true;
 }
 if (!wireRing()) W0.addEventListener('load', wireRing);
 // ======================================================================================================================
 // per frame
 // ======================================================================================================================
 function preStep() {
  const G = G0(); if (!G || !G.ball) return;
  if (G.ball.f555 && G.ball.state === 'shot') { settle(G); hold(G); }
 }
 function postStep(dt) {
  capTick();
  const G = G0();
  if (!G || !act(G)) { F.armed = false; F.used = false; F.fake = null; F.car = null; return; }
  const c = car();
  if (F.fake && rt() - F.fake.t < K.win && G.goalie && G.ball && G.ball.state === 'held') {   // the goalie bites on the fake
   const gk = G.goalie, el = rt() - F.fake.t, ty = F.fake.y;
   if (el < 1.2) { const m = K.biteSpd * dt; gk.y += cl(ty - gk.y, -m, m); gk.ty = gk.y; gk.tx = gk.x; }
  }
  if (c && c.shot20 && c.shot20.f507 && menuT - c.shot20.t0 > .45) c.shot20 = null;
  const zone = c && nearOn();
  if (c !== F.car) { F.car = c; if (c) { F.used = false; F.armed = false; } }
  if (zone) F.offT = 0; else { F.offT += dt; if (F.offT > .5 && !(G.ball && G.ball.state === 'shot')) { F.armed = false; F.used = false; if (!G.ball || G.ball.state !== 'shot') F.fake = null; } }
  if (F.armed && !circOn() && F.offT > .3) F.armed = false;
  if (!fakeOn(G)) F.armed = false;
  padPoll();
 }
 const ST0 = W0.step;
 W0.step = function (dt) {
  try { if (!killed()) preStep(); } catch (e) { err(e, 'pre'); }
  const r = ST0.apply(this, arguments);
  try { postStep(arguments[0] || 0); } catch (e) { err(e, 'post'); }
  return r;
 };
 const DP0 = W0.drawPlayers;
 W0.drawPlayers = function () {
  if (F.armed && circOn() && !SH.S.aim && fakeOn(G0())) {
   const S = SH.S;
   try { drawRed(); } catch (e) { err(e, 'red'); }
   S.aim = { f507: true, f555: true, id: -555, ax: 0, ay: 0, tx: 0, ty: 0, t0: 1e12, hist: [] };   // SHOT26 draws no yellow circles while an aim is live
   try { return DP0.apply(this, arguments); } finally { if (S.aim && S.aim.f555) S.aim = null; }
  }
  return DP0.apply(this, arguments);
 };
 const RD0 = W0.render;
 W0.render = function () {
  const r = RD0.apply(this, arguments);
  if (SCR() !== 'live' || !btnShown()) return r;
  g.save();
  try { g.setTransform(RR, 0, 0, RR, 0, 0); g.globalAlpha = 1; drawBtn(); } catch (e) { err(e, 'btn'); } finally { g.restore(); }
  return r;
 };
 // FAKE tap answered on pointerdown (a tap made while the run thumb is down sends no click - v507b)
 function onBtn(e) {
  try {
   const k = e.target && e.target.dataset && e.target.dataset.k;
   if (k && /\|fake555$/.test(k)) return true;
   if (rt() - BTNR.t > .25 || !BTNR.w || typeof cv === 'undefined') return false;
   const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return false;
   const lx = (e.clientX - r.left) / r.width * W, ly = (e.clientY - r.top) / r.height * H;
   let by = BTNR.y; try { if (typeof SA2403B !== 'undefined' && SA2403B && typeof sa2403By === 'function') by = sa2403By(by); } catch (x) {}
   const s = 4;
   return lx >= BTNR.x - s && lx <= BTNR.x + BTNR.w + s && ly >= by - s && ly <= by + BTNR.h + s;
  } catch (x) { return false; }
 }
 W0.addEventListener('pointerdown', e => {
  try {
   if (killed() || SCR() !== 'live' || !btnShown() || F.armed || !onBtn(e)) return;
   if (arm('tap')) { ST.pdArms = (ST.pdArms || 0) + 1; }
   BTNR.ate = rt();
   e.preventDefault(); e.stopPropagation();
  } catch (x) { err(x, 'pd'); }
 }, true);
 W0.addEventListener('touchstart', e => {
  try {
   if (killed() || !BTNR.ate || rt() - BTNR.ate > .4) return;
   for (const t of e.changedTouches) if (onBtn({ target: e.target, clientX: t.clientX, clientY: t.clientY })) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); return; }
  } catch (x) { err(x, 'ts'); }
 }, { capture: true, passive: false });
 function keyUsed(k) { try { const b = W0.V468CTL && V468CTL.kb ? V468CTL.kb() : {}; for (const a in b) if (String(b[a]).toLowerCase() === k) return true; } catch (e) {} return false; }
 W0.addEventListener('keydown', e => {
  if (killed() || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key && e.key.length === 1 ? e.key.toLowerCase() : '';
  if (k !== 'f' || keyUsed('f')) return;
  try { if (W0.__rl468 && __rl468.open) return; } catch (x) {}
  if (arm('key')) e.preventDefault();
 }, false);
 const PD = { prev: false };
 function padPoll() {
  let ps = [];
  try { ps = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected !== false); } catch (e) { return; }
  if (!ps.length) { PD.prev = false; return; }
  const p = ps[0], b = p.buttons && p.buttons[3], down = !!(b && (typeof b === 'object' ? b.pressed || b.value > .5 : b > .5));
  if (down && !PD.prev) {
   if (F.armed && circOn()) { const ly = p.axes && p.axes[1] || 0, top = !(ly > .35); doFake(SH.circles().find(c => c.top === top && c.high), 'pad'); }
   else arm('pad');
  }
  PD.prev = down;
 }
 W0.V555NF = { on: () => !killed(), act: () => act(G0()), fakeOn: () => fakeOn(G0()), cap: () => C.peer, C: C, F: F, K: K, K6: K6, ST: ST,
  arm: arm, btnShown: btnShown, circOn: circOn, nearOn: nearOn, tier: tier,
  test: { fake: (name) => { if (!arm('test')) return false; const q = SH.circles().find(c => c.name === name); return doFake(q, 'test'); } } };
})();
