// V52.0 - MIDFIELD CHECKS + SMART CPU DODGES (v520midchk.js, ?v=5200). OFFLINE ONLY. Kill switch: window.__rl_no520mc = true -> exactly
//  the build without this file. Loads after v513chk.js (and after every other script).
// Charlie (Nov 11, 10:55-10:56 PM): "I can check players way too easy in the middle of the field between the boxes, it should be harder,
//  all my checks shouldn't land in that area, cuz no team can clear the ball against me, I just check them" / "If I go out and check crazy
//  on them they need to dodge past me, use IQ - if I'm playing you out there, dodge and use that to your advantage."
// BEFORE (v513): every in-range, non-dodged check landed everywhere. A carrier between the restraining lines (MIDFIELD) counted as
//  "up top" (or "wing" by a sideline): 2 landed checks stripped him (+1 stick far side, +1 Squid/Fish/Beginner). With the check
//  cooldown that is a strip about half a second after you reach him, so a defender who runs out and spams check wins most clears.
// PART A - MIDFIELD (carrier outside BOTH restraining boxes: RL_L <= x <= RL_R, the game's own restraining lines, wings included):
//  - an in-range, non-dodged check lands only K.midLand (45%) of the time; the rest is a plain "WHIFF!" (no strip, no count, no stun);
//  - K.midNeed (3) landed checks strip him; +1 stick far side, +1 Squid/Fish/Beginner (same extras as v513); decay unchanged;
//  - THE SAME FOR BOTH SIDES: a CPU check that would land on your carrier in midfield lands 45% of the time (else "WHIFF!") and it takes 3.
//  - inside either box, wings in the boxes and up top: unchanged v513. Needs window.V513 (web builds); without it Part A does nothing.
// PART B - SMART CPU CARRIER (defense screen, their carrier on a clear or in midfield = anywhere outside YOUR box):
//  - when your defender closes hard on him, or has just swung at him, or swings at him now, he reads it and dodges past you with the
//    game's own CPU dodges (split / roll / swim / toe drag - never a bull dodge), picking the move that fits where you are
//    (V36DG's situation), then bursts into the space you left (target past your shoulder toward the cage) instead of carrying into you.
//  - how often: K.readP (your swing) / K.closeP (you closing hard), by difficulty: Squid/Fish rarely, Gross/Nasty/Bagga often;
//    K.cd seconds between dodges for the same carrier. No speed numbers change (the dodge and its "beat" are the game's own).
//  - Part B does not need V513 (the 1.3 app build has no v513); it needs V28 + V36DG (the CPU dodge engine).
// Online (net.js) untouched: every hook falls through when the game is online. Stats: window.V520.ST.
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no520mc || W.V520) return;
 const K = {
  midLand: .45, midNeed: 3,
  // Part B, index = DF.level (0 SQUID, 1 FISH, 2 BEGINNER, 3 GROSS, 4 NASTY, 5 BAGGA)
  readP: [ .06, .1, .2, .6, .66, .72 ],
  closeP: [ .04, .07, .14, .45, .5, .55 ],
  cd: 1.1, think: .18, partA: true, partB: true, clearPad: 0, dodged: .55, closeR: 21, closeV: 22, swungT: .6, burst: .6, burstD: 46
 };
 const ST = { uMid: 0, uLand: 0, uMiss: 0, uStrip: 0, cMid: 0, cLand: 0, cMiss: 0, dodges: 0, dRead: 0, dClose: 0, dSwung: 0, kinds: {}, errs: [] };
 const V = W.V520 = { on: true, K: K, ST: ST };
 const off = () => !!(W.__rl_no520mc || W.__rl_v124gb);
 const err = (e, w) => { try { if (ST.errs.length < 8) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v520midchk', w, e); } } catch (x) {} };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const MT = () => { try { return menuT; } catch (e) { return 0; } };
 const LV = () => { try { return Math.max(0, Math.min(5, DF.level | 0)); } catch (e) { return 3; } };
 function offline(G) {
  return !!G && !off() && !G.online && !(G.meta && G.meta.online) && !(W.RLNET && RLNET.inGame);
 }
 // Part A rides on v513 (web builds only)
 function okA(G) {
  return K.partA && offline(G) && !!W.V513 && V513.on !== false && typeof V513.okG === 'function' && V513.okG(G) && !G.tutorial;
 }
 function mid(c) {
  if (!c || typeof RL_L !== 'number' || typeof RL_R !== 'number') return false;
  if (c.x >= RL_L && c.x <= RL_R) return true;
  // K.clearPad (default 0 = off): also count the top K.clearPad px of the CLEARING team's own box (its own end, not a scoring spot)
  const p = +K.clearPad || 0;
  if (p > 0) { const s = SCR(); if (s === 'defense' && c.team === 'D' && c.x > RL_R && c.x <= RL_R + p) return true; if (s === 'live' && c.team === 'O' && c.x < RL_L && c.x >= RL_L - p) return true; }
  return false;
 }
 function need520(c, d, gx) {
  let n = K.midNeed;
  try { if (typeof DF !== 'undefined' && DF.level <= 2) n++; } catch (e) {}
  try { if (d && typeof side110 === 'function' && side110(c, d, gx) === 'off') n++; } catch (e) {}
  return n;
 }
 V.mid = mid; V.need = need520;
 // ---------- need: the game asks chkNeed2403 for THEIR checks on YOUR carrier ----------
 let missNow = false, skipSnd = false, lastD = null, uSlow0 = 0, inUL = false;
 const NEED1 = W.chkNeed2403;
 if (typeof NEED1 === 'function') W.chkNeed2403 = function (c, d, gx) {
  try {
   const G = G0();
   if (okA(G) && c) {
    if (missNow) return 99;
    if (mid(c)) return need520(c, d, gx);
   }
  } catch (e) { err(e, 'need'); }
  return NEED1.apply(this, arguments);
 };
 // ---------- PART A: YOUR checks on their carrier in midfield ----------
 function midCheck(G, c, d) {
  try { spamCheck(); } catch (e) {}
  if (G.dcar !== c || G.dctl !== d || !G.ball || G.ball.state !== 'held' || G.chk.cd > 0 || d.stun > 0) return 'cooldown';
  const S5 = V513.ST || {};
  S5.uTap = (S5.uTap || 0) + 1;
  G.chk.cd = DZ.checkCd;
  d.chkT0 = MT();
  G.chk.t = 0;
  G.dChecks = (G.dChecks || 0) + 1;
  if (G.chk.who !== c) { G.chk.n = 0; G.chk.who = c; }
  if (dPenaltyRoll(PEN_DCHECK_P, d, 'SLASHING')) return 'flag';
  ST.uMid++;
  if (Math.random() >= K.midLand) {
   ST.uMiss++;
   addFx('txt', d.x, d.y - 24, { s: 'WHIFF!', col: '#ff9a8a', life: .6 });
   return 'whiff';
  }
  G.chk.n++;
  G.chk.last513 = G.t;
  ST.uLand++; S5.uLand = (S5.uLand || 0) + 1;
  try { sfx12('check_clack', .75); } catch (e) {}
  G.checkSnd = (G.checkSnd || 0) + 1;
  addFx('pop', c.x - 6, c.y - 9);
  try { tutFlag('checked'); } catch (e) {}
  try { if (W.V452 && V452.on) G.v452hot = G.t; } catch (e) {}
  const nd = G.chk.need = need520(c, d, DGX);
  try { chkStat2403('uLand_mid'); } catch (e) {}
  if (G.chk.n >= nd) {
   const n = G.chk.n;
   try { chkStat2403('uStrip_mid_' + n); } catch (e) {}
   ST.uStrip++; S5.uStrip = (S5.uStrip || 0) + 1;
   if (S5.uN) S5.uN[n] = (S5.uN[n] || 0) + 1;
   G.dDislodge = (G.dDislodge || 0) + 1;
   try { tutFlag('stripped'); } catch (e) {}
   const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1.6, 1.6), v = rnd(40, 60);
   dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'check');
   try { st14('ct', d.pl); } catch (e) {}
   try { if (W.V17) V17.say('cto', d.x, d.y - 30); } catch (e) {}
   c.stun = .4;
   G.lastDislodgeN = n;
   return 'dislodge';
  }
  addFx('txt', c.x, c.y - 30, { s: G.chk.n + '/' + nd, col: '#ffe14d', life: .6 });
  return 'land';
 }
 // ---------- PART B: the CPU carrier reads an aggressive checker ----------
 function okB(G) {
  return K.partB && offline(G) && !G.tutorial && !G.practice && !G.brave && SCR() === 'defense' && !!W.V28 && typeof V28.cpuDodge === 'function' &&
   !!W.V36DG && typeof V36DG.request === 'function' && typeof V36DG.situation === 'function' && (typeof V36DG.on !== 'function' || V36DG.on());
 }
 function carrierB(G, c, d) {
  return !!c && !!d && G.dcar === c && c.team === 'D' && !!G.ball && G.ball.state === 'held' && !(c.down > 0) && !(c.stun > 0) && !c.dodgeA &&
   !c.gk && typeof RL_L === 'number' && c.x >= RL_L - 4 && !(d.down > 0);
 }
 function ready(G, c) {
  return !(c.dg520t != null && G.t >= c.dg520t && G.t - c.dg520t < K.cd);
 }
 function dodgeNow(G, c, d, why) {
  let kind = 'split';
  try {
   const o = V36DG.situation(c, d);
   if (o && o.sc) { let bs = -1; for (const k of [ 'split', 'roll', 'swim', 'toe' ]) if (o.sc[k] > bs) { bs = o.sc[k]; kind = k; } }
  } catch (e) {}
  c.dg520t = G.t;
  V36DG.request(c, kind);
  const dd0 = G.dg36force;
  G.dg36force = null;
  try { V28.cpuDodge(c, d); } finally { G.dg36force = dd0; }
  if (!c.dodgeA) return false;
  ST.dodges++; ST.kinds[kind] = (ST.kinds[kind] || 0) + 1;
  if (why === 'read') ST.dRead++; else if (why === 'swung') ST.dSwung++; else ST.dClose++;
  G.cpuDodges = (G.cpuDodges || 0) + 1;
  G.dodges520 = (G.dodges520 || 0) + 1;
  // the space he left: forward (toward your cage) past your shoulder, on the side away from you
  let fx = DGX - c.x, fy = CY - c.y;
  const fl = Math.hypot(fx, fy) || 1; fx /= fl; fy /= fl;
  const lx = -fy, ly = fx, lat = (c.x - d.x) * lx + (c.y - d.y) * ly;
  let sd = Math.sign(lat) || (c.y < CY ? (ly < 0 ? 1 : -1) : (ly > 0 ? 1 : -1));
  const A = c.dodgeA;
  if (A && A.s && (A.s[0] || A.s[1])) { const s2 = Math.sign(A.s[0] * lx + A.s[1] * ly); if (s2) sd = s2; }
  const tx = clamp(c.x + fx * K.burstD + lx * sd * 14, DGX + 60, FL - 30), ty = clamp(c.y + fy * K.burstD + ly * sd * 14, FT + 14, FB - 8);
  c.b520 = { t: G.t, tgt: [ tx, ty ] };
  return true;
 }
 V.dodgeNow = dodgeNow;
 function tryB(G, c, d, why) {
  if (!okB(G) || !carrierB(G, c, d) || !ready(G, c)) return false;
  if (why !== 'read') {   // think again in K.think s, not every frame
   if (c.th520 != null && G.t >= c.th520 && G.t - c.th520 < K.think) return false;
   c.th520 = G.t;
  }
  const p = (why === 'read' ? K.readP : K.closeP)[LV()] || 0;
  if (Math.random() >= p) return false;
  return dodgeNow(G, c, d, why);
 }
 const prevPos = new WeakMap();
 function tickB(G, dt) {
  const c = G.dcar, d = G.dctl;
  if (!c || !d) return;
  // keep bursting into the space after a dodge (the game's own movement does the running)
  if (c.b520) {
   if (G.t - c.b520.t > K.burst || G.dcar !== c || !G.ball || G.ball.state !== 'held') c.b520 = null;
   else if (!c.dodgeA) { c.tgt = c.b520.tgt.slice(); G.dDecide = Math.max(G.dDecide || 0, .06); }
  }
  const pp = prevPos.get(d), now = [ d.x, d.y ];
  prevPos.set(d, now);
  if (!pp || !(dt > 0)) return;
  const rx = c.x - d.x, ry = c.y - d.y, dist = Math.hypot(rx, ry) || 1;
  if (dist > K.closeR) return;
  const closing = ((d.x - pp[0]) * rx + (d.y - pp[1]) * ry) / dist / dt;
  const swung = d.chkT0 != null && MT() - d.chkT0 >= 0 && MT() - d.chkT0 < K.swungT;
  if (swung) tryB(G, c, d, 'swung'); else if (closing > K.closeV) tryB(G, c, d, 'close');
 }
 // ---------- hooks ----------
 const DC1 = W.dCheck;
 if (typeof DC1 === 'function') W.dCheck = function () {
  const G = G0();
  if (!offline(G) || SCR() !== 'defense' || G.tutorial) return DC1.apply(this, arguments);
  let part = null;
  try {
   const c = G.dcar, d = G.dctl;
   if (c && d && G.ball && G.ball.state === 'held' && !(G.chk && G.chk.cd > 0) && !(d.stun > 0) && Math.hypot(c.x - d.x, c.y - d.y) <= DZ.checkR) {
    if (c.dodgeA && c.dg520t != null && G.t - c.dg520t >= 0 && G.t - c.dg520t < K.dodged) part = 'Bd';
    else if (tryB(G, c, d, 'read')) part = 'B';
    else if (okA(G) && mid(c) && !(typeof V513.dodging === 'function' && V513.dodging(G, c))) part = 'A';
   }
  } catch (e) { err(e, 'dCheck-pre'); part = null; }
  if (part === 'A') { try { return midCheck(G, G.dcar, G.dctl); } catch (e) { err(e, 'midCheck'); return 'cooldown'; } }
  // no v513 (the 1.3 app build): the old check code does not know about dodges, so a swing into one of OUR dodges is beaten here
  if (!(W.V513 && V513.on !== false) && (part === 'B' || part === 'Bd')) {
   try {
    const c = G.dcar, d = G.dctl;
    G.chk.cd = DZ.checkCd; d.chkT0 = MT(); G.chk.t = 0; G.dChecks = (G.dChecks || 0) + 1;
    ST.uDodged = (ST.uDodged || 0) + 1;
    addFx('txt', d.x, d.y - 24, { s: 'DODGED!', col: '#8fe3f0', life: .7 });
    return 'whiff';
   } catch (e) { err(e, 'dodged'); }
  }
  return DC1.apply(this, arguments);
 };
 const UD1 = W.updateDefense;
 if (typeof UD1 === 'function') W.updateDefense = function (dt) {
  const r = UD1.apply(this, arguments);
  try { const G = G0(); if (okB(G)) tickB(G, typeof dt === 'number' ? dt : 1 / 60); } catch (e) { err(e, 'tickB'); }
  return r;
 };
 // THEIR checks on YOUR carrier in midfield (live screen): a check the game + v513 would land is a whiff 55% of the time
 const UL1 = W.updateLive;
 if (typeof UL1 === 'function') W.updateLive = function (dt) {
  const G = G0();
  if (inUL || !okA(G) || SCR() !== 'live') return UL1.apply(this, arguments);
  inUL = true; missNow = false; skipSnd = false;
  try { uSlow0 = G.uSlow || 0; } catch (e) {}
  try { return UL1.apply(this, arguments); }
  finally { inUL = false; missNow = false; skipSnd = false; lastD = null; }
 };
 const V14 = W.v14Check;
 if (typeof V14 === 'function') W.v14Check = function (c, d) {
  try {
   const G = G0();
   if (inUL && !missNow && c && G && G.carrier === c && c.team === 'O' && mid(c) && okA(G) && G.uchk) {
    ST.cMid++;
    if (Math.random() >= K.midLand) {
     ST.cMiss++;
     missNow = true; lastD = d;
     G.uchk.n = Math.max(0, (G.uchk.n || 0) - 1);
     G.cpuLanded = Math.max(0, (G.cpuLanded || 0) - 1);
     G.uSlow = uSlow0;
     return false;
    }
    ST.cLand++;
   }
  } catch (e) { err(e, 'v14'); }
  return V14.apply(this, arguments);
 };
 const AF1 = W.addFx;
 W.addFx = function (type, x, y, extra) {
  if (missNow && inUL && extra && typeof extra.s === 'string' && extra.s.indexOf('CHECKED ') === 0) {
   missNow = false; skipSnd = true;
   try {
    const G = G0(), c = G.carrier, d = lastD;
    if (G.uchk && c) G.uchk.need = need520(c, d, GX);
    return AF1.call(this, 'txt', d ? d.x : x, d ? d.y - 24 : y, { s: 'WHIFF!', col: 'rgba(255,255,255,.75)', life: .45 });
   } catch (e) { err(e, 'fx'); return; }
  }
  return AF1.apply(this, arguments);
 };
 const SFX1 = W.sfx12;
 if (typeof SFX1 === 'function') W.sfx12 = function (name) {
  if (skipSnd && inUL && name === 'check_clack') { skipSnd = false; return; }
  return SFX1.apply(this, arguments);
 };
 // ---------- words ----------
 try {
  const list = W.V4014C && Array.isArray(V4014C.QA) ? V4014C.QA : [];
  for (const q of list) if (q && typeof q.a === 'string' && q.a.indexOf('2 ON THE WINGS OR UP TOP') >= 0 && q.a.indexOf('MIDFIELD') < 0)
   q.a = q.a.replace('2 ON THE WINGS OR UP TOP', '2 ON THE WINGS OR UP TOP, 3 IN MIDFIELD (BETWEEN THE BOXES ONLY ABOUT HALF LAND)');
 } catch (e) { err(e, 'coach'); }
})();
