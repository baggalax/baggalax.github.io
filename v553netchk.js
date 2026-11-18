// v553netchk.js - V55.3: CHECKS + KNOCKDOWNS ONLINE (Charlie, Nov 12 9:28 AM: "port them now. Online should be the same.").
// Before: v513chk (fair stick checks), v520midchk (midfield checks) and v541blocklive knockdowns were OFFLINE ONLY. Online the
// other phone's checks went through net.js remoteCheck: a random land roll (60% +/- ratings), a random instant-strip roll and
// 3 landed checks anywhere; CPU checks on the ball carrier kept the old "SLAP" whiffs; hard blocked shots never knocked anyone down.
// How online works: the phone whose team has the ball RUNS the play (the "authority"); the other phone shows its snapshots and sends
// its stick input ('chk' / 'hit' messages for check / big hit). So every check and every block is decided on the authority phone
// and both screens show its result (positions, falls, "DODGED!", "1/2" ride the snapshot) - nothing new can desync.
// Now, when BOTH phones run this build (old peer = exactly today's online rules for that match):
//  CHECKS (v513 rule, same as offline, both players):
//   - the other phone's check ('chk' message) lands every time his defender is in range (DZ.checkR, plus net.js' lag slack) and the
//     carrier is not dodging at that moment; no random whiffs, no instant-strip roll. Too far = "MISSED - TOO FAR", carrier mid-dodge
//     = "DODGED!". Landed checks that strip: 1 in the box, 2 on the wings / up top, +1 stick on the far side, +1 Squid/Fish/Beginner
//     (V513.need). The count decays after V513.K.decay s. Gear stick snap/drop rolls off (V513.K.gear). Penalty roll unchanged.
//   - CPU defenders' checks on the carrier (authority phone, game.js loop inside updateLive): a swing the old odds take ALWAYS lands
//     unless he dodges (shows "DODGED!"); a swing it passes on shows nothing (no SLAP). Strip count = the same v513 table.
//  MIDFIELD (v520 Part A, both ways): carrier between the restraining lines -> an in-range, non-dodged check lands 45% (else
//   "WHIFF!") and 3 landed checks strip him (+1 far side, +1 easy modes). v520 Part B (CPU carrier reads your checks and dodges) has
//   no online counterpart: online the ball carrier is always a person.
//  KNOCKDOWNS (v541): a blocked HARD shot (speed >= 320) knocks the blocker down 25% of the time ("STUNG!", knocked back along the
//   shot line); the defender the other phone is steering gets his stick in the lane (6 px instead of 3.5) like your defender offline.
//   INJURIES stay offline: an injury writes the season's injury list and swaps the roster on one phone only (online seasons are a
//   shared server record), so it can't be made to agree safely.
// The other phone's "n/3" check counter over the carrier shows the real number needed (snapshot field nd553).
// Old peer: capability flag in the lobby 'ver' message (field c553) + added hello 'n53h'; the host turns it on for the match only when
// the guest has it ('n53m' -> guest). Net protocol: only ADDED message types (n53h, n53m) and fields (ver.c553, snapshot nd553).
// Kill switch: window.__rl_no553nc = true (exactly today's online behaviour). No ids, rl_* keys or saves touched. Telemetry: window.V553NC.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v553nc_loaded) return;
 W0.__rl_v553nc_loaded = 1;
 const N = W0.RLNET;
 if (!N || !N.Link || !N.Link.prototype || typeof W0.step !== 'function') { W0.V553NC = { on: () => false, why: 'no net' }; return; }
 const killed = () => !!(W0.__rl_no553nc || W0.__rl_v124gb);
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const MT = () => { try { return menuT; } catch (e) { return 0; } };
 const now = () => performance.now();
 const LOG = { ev: [], err: 0, errs: [], st: { rChk: 0, rFar: 0, rDodged: 0, rWhiff: 0, rLand: 0, rStrip: 0, rFlag: 0, cSwing: 0, cHeld: 0, cDodged: 0, cMidMiss: 0, kdRoll: 0, kd: 0, stickLane: 0 } };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 200) LOG.ev.shift(); };
 const er = (e, w) => { LOG.err++; if (LOG.errs.length < 8) LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.err < 4) try { console.warn('v553', w, e); } catch (x) {} };
 // ---------- capability handshake (same shape as v545) ----------
 const CP = { peer: false, on: false, hellos: 0, helloT: 0, mT: 0, onAt: 0, linkRef: null, wasIn: false };
 const active = () => !killed() && CP.on && !!N.inGame && !!G_() && !G_().tutorial;
 const authOn = () => active() && !!N.auth && !N.applying;
 function peerCap(why) { if (!CP.peer) lg({ ev: 'cap', why: why }); CP.peer = true; if (N.side === 'h' && N.inGame && !killed()) hostOn(why); }
 function hostOn(why) {
  if (N.side !== 'h' || !CP.peer || !N.link) return;
  if (!CP.on) { CP.on = true; lg({ ev: 'on', by: why }); }
  if (now() - CP.mT > 4000) { CP.mT = now(); try { N.link.send({ t: 'n53m', on: 1 }); } catch (x) {} }
 }
 const v513 = () => !!(W0.V513 && V513.on !== false && typeof V513.need === 'function' && typeof V513.dodging === 'function' && !W0.__rl_no513chk);
 const v520 = () => !!(W0.V520 && V520.on !== false && typeof V520.mid === 'function' && typeof V520.need === 'function' && V520.K && V520.K.partA !== false && !W0.__rl_no520mc);
 const K513 = () => (W0.V513 && V513.K) || { grace: .12, decay: 2.5, gear: false };
 const midOn = c => v520() && V520.mid(c);
 function needFor(c, d) {
  if (midOn(c)) return V520.need(c, d, GX);
  return V513.need(c, d, GX);
 }
 // ---------- link hooks: ADD fields / messages only ----------
 const LP = N.Link.prototype;
 const SEND0 = LP.send;
 LP.send = function (e) {
  try { if (e && !killed() && e.t === 'ver') e.c553 = 1; } catch (x) { er(x, 'send'); }
  return SEND0.apply(this, arguments);
 };
 const LAT0 = LP.latest;
 LP.latest = function (o) {
  try {
   if (o && o.k === 's' && authOn() && v513()) {
    const G = G_(), c = G.carrier;
    if (c && G.uchk && G.uchk.who === c && G.uchk.n > 0) { const d = remoteD(G); o.nd553 = G.uchk.need || (d ? needFor(c, d) : 2); }
   }
  } catch (x) { er(x, 'latest'); }
  return LAT0.apply(this, arguments);
 };
 let viewNeed = 0, viewNeedAt = 0;
 const GL0 = LP.gotLatest;
 LP.gotLatest = function (o) {
  try { if (o && o.k === 's' && active() && !N.auth) { viewNeed = +o.nd553 || 0; viewNeedAt = now(); } } catch (x) { er(x, 'gotLatest'); }
  return GL0.apply(this, arguments);
 };
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try {
   if (e && !killed()) {
    switch (e.t) {
     case 'ver': if (e.c553) peerCap('ver'); break;
     case 'n53h': peerCap('hello'); break;
     case 'n53m': if (N.side !== 'h' && e.on) { CP.onAt = now(); if (N.inGame && !CP.on) { CP.on = true; lg({ ev: 'on', by: 'n53m' }); } } break;
     case 'chk':
      if (authOn() && v513() && scr() === 'live') {
       const dk = (e.s || '') + ':' + e.q;
       if (e.q != null && this.seen && this.seen.has(dk)) break;   // duplicate copy (relay + socket): net.js drops it
       let r;
       try { r = check553(e.vd); } catch (x) { er(x, 'check'); r = 'err'; }
       N.lastChk = r;
       lg({ ev: 'chk', r: r });
       // net.js still books the message (dedupe, clocks) but must not run its own check: hand it an unknown type
       const e2 = Object.assign({}, e, { t: 'chk553' });
       return GE0.call(this, e2);
      }
      break;
    }
   }
  } catch (x) { er(x, 'gotEvent'); }
  return GE0.apply(this, arguments);
 };
 // ---------- the other phone's check (runs on the authority phone) ----------
 function remoteD(G) { return G && G.players ? G.players.find(p => p.team === 'D' && p.netCtl) : null; }
 function slack() { try { return N.link ? Math.max(8, Math.min(22, 6 + (N.link.oneWay() + (N.view && N.view.D || 0)) * .05)) : 16; } catch (e) { return 16; } }
 function check553(vd) {
  const G = G_(), c = G.carrier, d = remoteD(G), b = G.ball;
  if (!d || d.down > 0 || d.netStun > 0 || d.stun > 0) return;
  if ((d.netChkCd || 0) > G.t) return 'cooldown';
  d.netChkCd = G.t + DZ.checkCd;
  d.chkT0 = MT();
  G.netChecks = (G.netChecks || 0) + 1;
  LOG.st.rChk++;
  if (typeof setSag17 === 'function' && setSag17()) {
   G.net17 = (G.net17 || 0) + 1;
   addFx('txt', d.x, d.y - 24, { s: 'THEY\'RE SETTING UP', col: '#ffe14d', life: .6 });
   return 'set17';
  }
  if (!c || b.state !== 'held') { addFx('txt', d.x, d.y - 24, { s: 'NOBODY HAS IT', col: '#ffe14d', life: .6 }); return 'none'; }
  const dd = Math.hypot(c.x - d.x, c.y - d.y);
  if (dd > DZ.checkR && !(vd != null && vd <= DZ.checkR && dd <= DZ.checkR + slack())) {
   LOG.st.rFar++;
   addFx('txt', d.x, d.y - 32, { s: 'MISSED - TOO FAR', col: '#ff9a8a', life: .7 });
   return 'far';
  }
  if (penaltyRoll('check', d)) { LOG.st.rFlag++; return 'flag'; }
  if (V513.dodging(G, c)) {
   LOG.st.rDodged++;
   addFx('txt', d.x, d.y - 24, { s: 'DODGED!', col: '#8fe3f0', life: .7 });
   return 'dodged';
  }
  const mid = midOn(c);
  if (mid && Math.random() >= (+V520.K.midLand || .45)) {
   LOG.st.rWhiff++;
   addFx('txt', d.x, d.y - 24, { s: 'WHIFF!', col: '#ff9a8a', life: .6 });
   return 'whiff';
  }
  if (!G.uchk || G.uchk.who !== c) G.uchk = { who: c, n: 0, lastLand: G.t };
  if (G.uchk.lastLand != null && G.t - G.uchk.lastLand > (K513().decay || 2.5)) G.uchk.n = 0;
  G.uchk.n++;
  G.uchk.lastLand = G.t;
  G.netLanded = (G.netLanded || 0) + 1;
  G.uSlow = Math.max(G.uSlow || 0, .22);
  LOG.st.rLand++;
  try { sfx12('check_clack', .75); } catch (e) {}
  addFx('pop', c.x + 6, c.y - 9);
  { const g17 = G.g17; if (!K513().gear) G.g17 = null; try { v14Check(c, d); } catch (e) {} finally { G.g17 = g17; } }
  const nd = G.uchk.need = needFor(c, d);
  if (G.uchk.n >= nd) {
   G.uchk.n = 0;
   G.netStrips = (G.netStrips || 0) + 1;
   LOG.st.rStrip++;
   try { st14('ct', d.pl); } catch (e) {}
   try { if (W0.V17) V17.say('cto', d.x, d.y - 30); } catch (e) {}
   checkPop();
   return 'strip';
  }
  addFx('txt', c.x, c.y - 30, { s: G.uchk.n + '/' + nd, col: '#ffe14d', life: .6 });
  return 'land';
 }
 // ---------- CPU defenders' checks on the carrier (authority phone, inside updateLive) ----------
 let inUL = false, dodgeNow = false, held = null, missNow = false, skipSnd = false, lastD = null, uSlow0 = 0;
 const NEED0 = W0.chkNeed2403;
 if (typeof NEED0 === 'function') W0.chkNeed2403 = function (c, d, gx) {
  try { if (inUL && c && authOn() && v513()) { if (missNow) return 99; return needFor(c, d); } } catch (e) { er(e, 'need'); }
  return NEED0.apply(this, arguments);
 };
 const V140 = W0.v14Check;
 if (typeof V140 === 'function') W0.v14Check = function (c, d) {
  if (!inUL) return V140.apply(this, arguments);
  const G = G_();
  try {
   if (!missNow && c && G && G.carrier === c && c.team === 'O' && midOn(c) && G.uchk) {
    if (Math.random() >= (+V520.K.midLand || .45)) {
     LOG.st.cMidMiss++;
     missNow = true; lastD = d;
     G.uchk.n = Math.max(0, (G.uchk.n || 0) - 1);
     G.cpuLanded = Math.max(0, (G.cpuLanded || 0) - 1);
     G.uSlow = uSlow0;
     return false;
    }
   }
  } catch (e) { er(e, 'v14'); }
  const g = G && G.g17;
  if (g && !K513().gear) G.g17 = null;
  try { return V140.apply(this, arguments); } finally { if (g) G.g17 = g; }
 };
 const AF0 = W0.addFx;
 W0.addFx = function (type, x, y, extra) {
  if (inUL && extra && typeof extra.s === 'string') {
   try {
    if (extra.s === 'SLAP') {
     if (dodgeNow) { LOG.st.cDodged++; LOG.st.cSwing++; return AF0.call(this, type, x, y, Object.assign({}, extra, { s: 'DODGED!', col: '#8fe3f0', life: .6 })); }
     LOG.st.cHeld++;
     if (held) for (const p of game.players) if (p.team === 'D' && p.x === x && p.y - 24 === y) held.add(p);
     return;
    }
    if (extra.s.indexOf('CHECKED ') === 0) {
     LOG.st.cSwing++;
     if (missNow) {
      missNow = false; skipSnd = true;
      const G = G_(), c = G.carrier, d = lastD;
      if (G.uchk && c) G.uchk.need = needFor(c, d);
      return AF0.call(this, 'txt', d ? d.x : x, d ? d.y - 24 : y, { s: 'WHIFF!', col: 'rgba(255,255,255,.75)', life: .45 });
     }
    }
   } catch (e) { er(e, 'fx'); }
  }
  return AF0.apply(this, arguments);
 };
 const SFX0 = W0.sfx12;
 if (typeof SFX0 === 'function') W0.sfx12 = function (name) {
  if (skipSnd && inUL && name === 'check_clack') { skipSnd = false; return; }
  return SFX0.apply(this, arguments);
 };
 const UL0 = W0.updateLive;
 if (typeof UL0 === 'function') W0.updateLive = function (dt) {
  const G = G_();
  if (inUL || !authOn() || !v513() || scr() !== 'live' || !G) return UL0.apply(this, arguments);
  const c = G.carrier;
  let snap = null;
  const ck = DF.chk, dec = UCHK.decay;
  try {
   dodgeNow = !!(c && c.team === 'O' && V513.dodging(G, c));
   if (dodgeNow) DF.chk = 1e-9;
   UCHK.decay = K513().decay;
   uSlow0 = G.uSlow || 0;
   snap = new Map; held = new Set;
   for (const p of G.players) if (p.team === 'D') snap.set(p, p.chkT0);
  } catch (e) { er(e, 'ul-pre'); }
  inUL = true; missNow = false; skipSnd = false;
  try { return UL0.apply(this, arguments); }
  finally {
   inUL = false; DF.chk = ck; UCHK.decay = dec;
   try { if (held && held.size) for (const p of held) p.chkT0 = snap.get(p); } catch (e) {}
   held = null; dodgeNow = false; missNow = false; skipSnd = false; lastD = null;
  }
 };
 // ---------- knockdowns on blocked hard shots + the steered defender's stick in the lane ----------
 const CFG = () => (W0.V541 && V541.cfg) || { HARD: 320, kdP: .25, downMul: .65, laneP: .5, laneNearP: .15, stickLane: 6 };
 const v541 = () => !!(W0.V541 && V541.cfg && !W0.__rl_no541bl);
 function knock553(G, p, ux, uy, h) {
  const C = CFG(), HD = (typeof HIT === 'object' && HIT.down) || 1.25, kbT = (typeof HIT === 'object' && HIT.kbT) || .18;
  const dn = HD * C.downMul * (.9 + .3 * h);
  p.down = dn; p.stun = dn; p.downT0 = dn;
  p.kb = { vx: ux * 6 / kbT, vy: uy * 6 / kbT, t: kbT };
  p.fallDir = ux >= 0 ? 1 : -1;
  try { addFx('txt', p.x, p.y - 28, { s: 'STUNG!', col: '#ff9a8a', life: .9 }); } catch (e) {}
  try { if (typeof hit12 === 'function') hit12(.55); } catch (e) {}
  G.blkKd541 = (G.blkKd541 || 0) + 1;
  LOG.st.kd++;
 }
 const EP0 = W0.endPossession;
 if (typeof EP0 === 'function') W0.endPossession = function (kind, txt, sub) {
  const G = G_();
  let pre = null;
  try {
   if (txt === 'BLOCKED!' && authOn() && v541() && scr() === 'live' && G && G.ball && G.players) {
    const b = G.ball, sp = Math.hypot(b.vx || 0, b.vy || 0) || 200;
    pre = { n: V541.blocks, sp: sp, ux: (b.vx || -1) / sp, uy: (b.vy || 0) / sp, x: b.x, y: b.y };
   }
  } catch (e) { er(e, 'ep-pre'); pre = null; }
  const r = EP0.apply(this, arguments);
  try {
   if (pre && V541.blocks > pre.n && V541.last && !V541.last.kd) {
    const C = CFG();
    if (pre.sp >= C.HARD) {
     LOG.st.kdRoll++;
     if (Math.random() < C.kdP || W0.__rl_force553kd) {
      const who = V541.last.who;
      let blk = null, bd = 1e9;
      for (const p of G.players) if (p.team === 'D' && !p.gk && p.role !== 'G' && (!who || (p.pl && p.pl.id === who))) { const dd = Math.hypot(p.x - pre.x, p.y - 6 - pre.y); if (dd < bd) { bd = dd; blk = p; } }
      if (blk && bd < 60) { knock553(G, blk, pre.ux, pre.uy, Math.max(0, Math.min(1, (pre.sp - C.HARD) / 140))); V541.last.kd = true; V541.last.kd553 = 1; lg({ ev: 'kd', who: blk.pl && blk.pl.id }); }
     }
    }
   }
  } catch (e) { er(e, 'ep-post'); }
  return r;
 };
 const RS0 = W0.releaseShot;
 if (typeof RS0 === 'function') W0.releaseShot = function () {
  const r = RS0.apply(this, arguments);
  try {
   const G = G_(), b = G && G.ball;
   if (authOn() && v541() && b && b.state === 'shot' && !b.block && scr() === 'live') {
    const d = remoteD(G), C = CFG(), sh = b.shooter || G.carrier;
    if (d && !(d.down > 0) && !d.gk) {
     const sp = Math.hypot(b.vx, b.vy) || 1, vx = b.vx / sp, vy = b.vy / sp;
     const rx = d.x - b.x, ry = d.y - 6 - b.y, proj = rx * vx + ry * vy, perp = Math.abs(rx * vy - ry * vx);
     if (proj >= 4 && proj <= 70 && perp >= 3.5 && perp < C.stickLane) {
      const near = sh ? Math.hypot(sh.x - GX, sh.y - CY) < 44 : false;
      if (Math.random() < (near ? C.laneNearP : C.laneP) || W0.__rl_force553lane) {
       b.block = { dist: proj }; b.pipe = null; b.blk541 = d;
       LOG.st.stickLane++;
       lg({ ev: 'lane', proj: +proj.toFixed(1), perp: +perp.toFixed(1) });
      }
     }
    }
   }
  } catch (e) { er(e, 'rs'); }
  return r;
 };
 // ---------- the other phone: "n/3" counter shows the real number needed ----------
 const T0 = W0.text;
 if (typeof T0 === 'function') W0.text = function (s) {
  if (typeof s === 'string' && s.length <= 4 && viewNeed > 0 && /^\d\/3$/.test(s)) {
   try {
    if (active() && !N.auth && scr() === 'netview' && now() - viewNeedAt < 1500) { const a = Array.prototype.slice.call(arguments); a[0] = s.slice(0, 2) + viewNeed; return T0.apply(this, a); }
   } catch (e) {}
  }
  return T0.apply(this, arguments);
 };
 // ---------- frame: handshake + match start / end ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  const r = ST0.apply(this, arguments);
  try {
   if (!killed()) {
    if (N.inGame && !CP.wasIn) { CP.on = false; if (N.side !== 'h' && CP.onAt && now() - CP.onAt < 20000) CP.on = true; lg({ ev: 'begin', side: N.side, cap: CP.peer, on: CP.on }); }
    if (!N.inGame && CP.wasIn) CP.on = false;
    CP.wasIn = !!N.inGame;
    if (!N.link) { CP.peer = false; CP.hellos = 0; CP.onAt = 0; }
    else if (CP.linkRef !== N.link) { CP.linkRef = N.link; CP.peer = false; CP.hellos = 0; CP.onAt = 0; }
    if (N.link && !CP.peer && CP.hellos < 12 && now() - CP.helloT > 3000) { CP.helloT = now(); CP.hellos++; try { N.link.send({ t: 'n53h', c: 553 }); } catch (e) {} }
    if (N.inGame && N.side === 'h' && CP.peer) hostOn('frame');
   }
  } catch (e) { er(e, 'frame'); }
  return r;
 };
 W0.V553NC = { on: active, auth: authOn, CP: CP, LOG: LOG, check: check553, needFor: needFor };
})();
