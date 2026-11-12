/* v507fake.js - BAGGA LAX 1.3: CREASE FAKES (GROSS / NASTY / BAGGATWAAN only).
 * Charlie (Nov 11, 6:55 PM): "for on crease i wanna add a fake button when you get close to the goal right before the yellow
 *  circles pop up a red circle that says fake should pop up as well in the top right area of your screen right off the field
 *  ... you click it and the circles turn red you can then click a circle and it fakes it to that spot then they turn yellow
 *  again and you click one and it shoots. Almost all shots that are faked one side and shot the opposite side should go in on
 *  crease. 50 percent of shots that don't fake should go in on crease depending on the goalie and difficulty. There should be
 *  a tutorial on fakes for everyone once it's added mandatory. Fakes are only in gross mode and up all other modes crease
 *  shots should mostly go in and there's no fakes in it"
 * What this does (offline games only - online PvP, brave mode and the old tutorials are untouched):
 *  1) GROSS+ : when your carrier gets near the cage (a little before SHOT26's 4 yellow crease circles appear) a round red FAKE
 *     button shows at the top right of the field, under the score bar, inside the safe area (the canvas's logical 0..W, which
 *     v473safe keeps clear of the Dynamic Island in landscape). Tap it -> the circles turn RED (slow-mo, like aiming).
 *     Tap a red circle -> your guy pump-fakes there (shot wind-up, no release), the goalie bites to that side, circles go
 *     yellow again; tap one -> the normal SHOT26 crease finish. One fake per crease chance.
 *     Keys: F = FAKE, then 1-4 (the crease circle keys) fake to that circle. Controller: TRIANGLE / Y = FAKE, then TRIANGLE / Y
 *     again fakes to the top (left stick down = bottom) side; shoot as usual.
 *  2) The crease finish result (any of your shots released while the crease circles are up) is rolled here on GROSS+:
 *     faked one side + shot the other side (within 2 s) ~ 95 / 93 / 90 %, shot the same spot you faked ~ 15 / 12 / 10 %,
 *     same side other height ~ 35 / 30 / 25 %, no fake ~ 55 / 50 / 45 % (+- a little for the goalie's SAV and your FIN).
 *     Below GROSS: no FAKE button; crease finishes go in a bit more often (a third of what would have been saves go in -
 *     ~78 % -> ~85 %).
 *  3) Mandatory one-time FAKE TUTORIAL for everyone (after the main tutorial and the shooting tutorial): a short practice drill
 *     at the crease - TAP FAKE -> TAP A CIRCLE TO FAKE -> NOW SHOOT THE OTHER SIDE. No skip button; done is saved in
 *     rl_fake507 (new key). Quit it and it comes back next time you're on the menu.
 * New: localStorage rl_fake507 only. Ids, other rl_* keys, net protocol unchanged.
 * Kill switch: window.__rl_no507fake = true -> exactly as before. Test hooks: __rl_skip507 (no tutorial), __rl_force507tut.
 */
(function () {
 'use strict';
 const W0 = window;
 const OFF = () => !!(W0.__rl_no507fake || W0.__rl_v124gb);
 if (OFF()) return;
 if (!W0.SHOT26 || typeof W0.step !== 'function' || typeof W0.render !== 'function' || typeof W0.releaseShot !== 'function' || typeof W0.drawPlayers !== 'function') return;
 const SH = W0.SHOT26;
 const rt = () => performance.now() / 1e3;
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const ST = { fakes: 0, arms: 0, rolls: [], low: 0, errs: [], pad: 0 };
 const err = (e, w) => { try { if (ST.errs.length < 10) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v507fake', w, e); } } catch (x) {} };
 // per tier: [GROSS, NASTY, BAGGATWAAN]
 const K = {
  base: [ .55, .50, .45 ],   // no fake
  opp: [ .95, .93, .90 ],    // faked one side, shot the other side
  same: [ .15, .12, .10 ],   // shot the exact circle you faked
  near: [ .35, .30, .25 ],   // same side, other height
  gkK: .04, gkMax: .08,      // goalie SAV rating: -4 % per rating unit (max +-8 %)
  finK: .02, finMax: .04,    // shooter FIN rating
  lowConv: .35,              // below GROSS: this share of would-be saves on crease finishes go in
  win: 2.0,                  // s (real time) the goalie stays fooled after a fake
  biteSpd: 400,              // px/s the goalie lunges at the fake
  preR: 10                   // FAKE shows this many px before the circles do
 };
 const F = { armed: false, used: false, fake: null, offT: 0, car: null, pressT: 0 };
 function tier() { try { const l = DF && DF.level; return l === 3 ? 0 : l === 4 ? 1 : l === 5 ? 2 : -1; } catch (e) { return -1; } }
 function tutGame(G) { return !!(G && G.practice && G.practice.fake507); }
 function okG(G) {
  return !!G && !OFF() && !G.online && !(G.meta && G.meta.online) && !(W0.RLNET && RLNET.inGame) && !G.tutorial && !G.practice && !G.brave;
 }
 function fakeMode(G) { return tutGame(G) ? T.active : okG(G) && tier() >= 0; }
 function car() { const G = G0(); return G && G.carrier && G.ball && G.ball.state === 'held' && G.carrier.team === 'O' ? G.carrier : null; }
 function circOn() { try { return SCR() === 'live' && canShoot() && !SH.S.aim && SH.circlesOn() && SH.inTap(); } catch (e) { return false; } }
 function nearOn() {
  const c = car(); if (!c || SCR() !== 'live') return false;
  try { if (!canShoot()) return false; } catch (e) { return false; }
  return c.x < GX && Math.hypot(GX - c.x, CY - c.y) <= SH.CFG.tapR + K.preR;
 }
 function btnShown() { const G = G0(); return !!G && fakeMode(G) && !F.used && (F.armed || nearOn()) && !(T.active && T.step !== 'arm' && T.step !== 'fake'); }
 function btnLive() { return btnShown() && circOn(); }
 function opp(name) { return name.indexOf('TOP') === 0 ? name.replace('TOP', 'BOTTOM') : name.replace('BOTTOM', 'TOP'); }
 // ---------------- the button (drawn on the canvas, tapped through the game's own #ui hit buttons) ----------------
 const BR = 12;
 function btnPos() { return { x: W - BR - 6, y: 30 }; }  // top right, just under the score bar / timeout pips, in front of the boards
 function arm(src) {
  if (!btnShown() || F.armed) return false;   // v507b (Nov 11): a tap counts as soon as the button shows (it shows a moment before the circles), not only once they are up
  F.armed = true; ST.arms++;
  try { SH.S.slowUntil = rt() + 1.6; } catch (e) {}
  try { SFX.tap && SFX.tap(); } catch (e) {}
  if (T.active && T.step === 'arm') { T.step = 'fake'; say('NOW TAP A RED CIRCLE', '#ff6a5a'); }
  ST.lastArm = src || 'tap';
  return true;
 }
 function disc(x, y, r, col) {
  g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
 }
 function drawBtn() {
  if (!btnShown()) return;
  const p = btnPos(), live = circOn(), t = rt();
  const pulse = F.armed ? 1 : .5 + .5 * Math.sin(t * 8);
  g.save();
  g.globalAlpha = live ? 1 : .6;
  disc(p.x + .5, p.y + 2.5, BR, '#000');
  disc(p.x + .5, p.y + .5, BR, F.armed ? '#ffffff' : '#d8261c');
  disc(p.x + .5, p.y + .5, BR - 2, F.armed ? '#ff3b2e' : '#ff4a3a');
  g.strokeStyle = F.armed ? '#ffe14d' : 'rgba(255,255,255,' + (.45 + .4 * pulse).toFixed(2) + ')';
  g.lineWidth = 1; g.beginPath(); g.arc(p.x + .5, p.y + .5, BR - .5, 0, Math.PI * 2); g.stroke();
  g.restore();
  g.save(); g.globalAlpha = live ? 1 : .6;
  text('FAKE', p.x + 1, p.y - 2, 1, '#ffffff', 'center', '#5a0000');
  g.restore();
  if (T.active && T.step === 'arm') {   // tutorial: arrow at the button
   const a = Math.round(4 * Math.sin(t * 7));
   text('TAP', p.x - BR - 14 + a, p.y - 2, 1, '#ffe14d', 'center', '#000');
   rect(p.x - BR - 6 + a, p.y, 3, 1, '#ffe14d');
  }
  if (!F.armed) hit('fake507', p.x - BR - 3, p.y - BR - 3, 2 * BR + 6, 2 * BR + 6, () => arm('tap'), 'FAKE');   // v507b: tappable whenever it shows
  BTNR.x = p.x - BR - 3; BTNR.y = p.y - BR - 3; BTNR.w = 2 * BR + 6; BTNR.h = 2 * BR + 6; BTNR.t = rt();
 }
 // red circles: while armed SHOT26's yellow ones are hidden (it skips them while an aim is live) and these are drawn instead
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
 function drawTutHi() {   // tutorial: ring the other-side circles after the fake
  if (!T.active || T.step !== 'shoot' || !F.fake || !circOn()) return;
  const t = rt();
  for (const q of SH.circles()) if (q.top !== F.fake.top) {
   g.strokeStyle = 'rgba(125,255,122,' + (.5 + .5 * Math.sin(t * 8)).toFixed(2) + ')'; g.lineWidth = 1;
   g.beginPath(); g.arc(q.x + .5, q.y + .5, SH.CFG.circR + 2.5, 0, Math.PI * 2); g.stroke();
  }
 }
 // ---------------- the fake ----------------
 function doFake(q, src) {
  const G = G0(), c = car(); if (!G || !c || !q) return false;
  F.armed = false; F.used = true;
  F.fake = { name: q.name, top: q.top, high: q.high, t: rt(), y: CY + (q.top ? -1 : 1) * (MOUTH + 2) };
  ST.fakes++; ST.lastFake = { name: q.name, src: src || 'tap' };
  try { c.shot20 = { type: q.high ? 'over' : 'under', t0: menuT, one: false, top: q.top, x: c.x, y: c.y, f507: true }; } catch (e) {}
  const gk = G.goalie;
  if (gk) { try { gk.saveT0 = menuT; gk.saveFr = q.high ? 'save_high' : 'save_side'; } catch (e) {} }
  try { SFX.shot && SFX.shot(.15); } catch (e) {}
  try { SH.S.slowUntil = rt() + 1.4; } catch (e) {}
  if (T.active && T.step === 'fake') { T.step = 'shoot'; say('NOW SHOOT THE OTHER SIDE!', '#7dff7a'); }
  return true;
 }
 // circle taps go through SHOT26.down (game.js inDown -> SHOT26.down, also the 1-4 keys via V483PULL.tapCircle)
 const D0 = SH.down;
 SH.down = function (pt, p) {
  try {
   const G = G0();
   if (G && fakeMode(G) && SCR() === 'live' && car()) {
    const wx = p.x + Math.round(camX), wy = p.y, tq = circOn() ? SH.quad(wx, wy, true) : null;
    const swallow = () => { pt.role = 'shot26'; pt.f507 = true; return true; };
    if (F.armed) {
     if (tq) { doFake(tq, 'tap'); return swallow(); }
     if (T.active) return swallow();
    } else if (T.active) {
     if (T.step === 'arm' || T.step === 'fake') { if (tq || circOn()) say('TAP THE RED FAKE BUTTON FIRST', '#ff9a8a'); return swallow(); }
     if (T.step === 'shoot' && !tq) return swallow();
     if (T.step === 'done' || T.step === 'wait') return swallow();
    }
   }
  } catch (e) { err(e, 'down'); }
  return D0.apply(this, arguments);
 };
 // ---------------- the result of a crease finish ----------------
 const RS0 = W0.releaseShot;
 W0.releaseShot = function () {
  let pre = null;
  try {
   const G = G0(), c = G && G.carrier;
   if (G && c && c.team === 'O' && SCR() === 'live' && (okG(G) || tutGame(G) && T.active) && circOn()) {
    pre = { k: tutGame(G) ? 9 : tier(), fake: F.fake && rt() - F.fake.t <= K.win ? Object.assign({}, F.fake) : null, c: c };
   }
  } catch (e) { err(e, 'pre'); }
  const r = RS0.apply(this, arguments);
  try { const b = G0() && game.ball; if (pre && b && b.state === 'shot' && b.shooter === pre.c) { b.f507 = pre; b.v452 = true; } } catch (e) { err(e, 'rel'); }
  return r;
 };
 function aimTo(b, ty) {
  const sp = Math.hypot(b.vx, b.vy) || 200, a = Math.atan2(ty - b.y, GX - b.x);
  b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
 }
 function settle(G) {
  const b = G.ball, P = b.f507;
  if (!P || P.done) return;
  P.done = true;
  const gk = G.goalie, s = b.s25, c = P.c;
  const ty0 = b.target && typeof b.target.y === 'number' ? b.target.y : b.y + b.vy * (GX - b.x) / Math.max(1, b.vx);
  const top = ty0 < CY;
  let hi = !!(b.target && (b.target.high != null ? b.target.high : b.high));
  let p, kind;
  if (P.k === 9) {   // tutorial
   kind = P.fake ? (P.fake.top !== top ? 'opp' : 'same') : 'none';
   p = kind === 'opp' ? 1 : 0;
  } else if (P.k >= 0) {
   const k = P.k, fk = P.fake;
   if (fk && fk.top !== top) { kind = 'opp'; p = K.opp[k]; }
   else if (fk && fk.high === hi) { kind = 'same'; p = K.same[k]; }
   else if (fk) { kind = 'near'; p = K.near[k]; }
   else {
    kind = 'none';
    let adj = 0;
    try { adj -= cl(K.gkK * rf(gk && gk.pl, 'sav'), -K.gkMax, K.gkMax); } catch (e) {}
    try { adj += cl(K.finK * pr(c, 'fin'), -K.finMax, K.finMax); } catch (e) {}
    p = cl(K.base[k] + adj, .3, .7);
   }
  } else {
   // below GROSS: no fakes, a third of the would-be saves go in
   kind = 'low'; p = null;
   if (Math.random() < K.lowConv) p = 1;
  }
  const roll = Math.random();
  const goal = p == null ? null : roll < p;
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
   P.force = 'save';
  } else { b.v452 = false; P.force = null; }   // below GROSS and not converted: the game's own crease finish (v452 never runs there)
  P.kind = kind; P.p = p; P.top = top;
  ST.rolls.push({ k: P.k, kind: kind, p: p == null ? null : +p.toFixed(3), roll: +roll.toFixed(3), force: P.force, top: top, fake: P.fake ? P.fake.name : null });
  if (ST.rolls.length > 60) ST.rolls.shift();
  if (kind === 'low' && P.force) ST.low++;
 }
 function hold(G) {   // keep the decision while the ball flies (other files may poke the goalie)
  const b = G.ball, P = b && b.f507;
  if (!P || !P.force || b.state !== 'shot') return;
  const gk = G.goalie;
  if (P.force === 'goal') { if (gk) { gk.reach = .001; gk.react = 9; } b.aim14 = null; if (b.s25) b.s25.own = false; }
 }
 // ---------------- per frame ----------------
 function preStep() {
  const G = G0(); if (!G || !G.ball) return;
  if (G.ball.f507 && G.ball.state === 'shot') { settle(G); hold(G); }
 }
 function postStep(dt) {
  const G = G0();
  if (!G) { F.armed = false; F.used = false; F.fake = null; return; }
  const c = car();
  // goalie bites on the fake
  if (F.fake && rt() - F.fake.t < K.win && G.goalie && G.ball && G.ball.state === 'held') {
   const gk = G.goalie, el = rt() - F.fake.t, ty = F.fake.y;
   if (el < 1.2) { const m = K.biteSpd * dt; gk.y += cl(ty - gk.y, -m, m); gk.ty = gk.y; gk.tx = gk.x; }
  }
  if (c && c.shot20 && c.shot20.f507 && menuT - c.shot20.t0 > .45) c.shot20 = null;
  // a new crease chance resets the button
  const zone = c && nearOn();
  if (c !== F.car) { F.car = c; if (c) { F.used = false; F.armed = false; } }
  if (zone) F.offT = 0; else { F.offT += dt; if (F.offT > .5 && !(G.ball && G.ball.state === 'shot')) { F.armed = false; F.used = false; if (!G.ball || G.ball.state !== 'shot') F.fake = null; } }
  if (F.armed && !circOn() && F.offT > .3) F.armed = false;
  if (!fakeMode(G)) { F.armed = false; }
  padPoll();
  if (T.active) tutTick(dt);
  if (T.tp) tpTick();
 }
 const ST0 = W0.step;
 W0.step = function (dt) {
  try { preStep(); } catch (e) { err(e, 'pre'); }
  const r = ST0.apply(this, arguments);
  try { postStep(arguments[0] || 0); } catch (e) { err(e, 'post'); }
  return r;
 };
 const DP0 = W0.drawPlayers;
 W0.drawPlayers = function () {
  if (F.armed && circOn() && !SH.S.aim) {
   const S = SH.S;
   try { drawRed(); } catch (e) { err(e, 'red'); }
   S.aim = { f507: true, id: -507, ax: 0, ay: 0, tx: 0, ty: 0, t0: 1e12, hist: [] };   // SHOT26 draws no yellow circles while an aim is live
   try { return DP0.apply(this, arguments); } finally { if (S.aim && S.aim.f507) S.aim = null; }
  }
  const r = DP0.apply(this, arguments);
  try { drawTutHi(); } catch (e) { err(e, 'hi'); }
  return r;
 };
 const RD0 = W0.render;
 W0.render = function () {
  const r = RD0.apply(this, arguments);
  const need = SCR() === 'live' && (T.active || F.fake || btnShown());
  if (!need) return r;
  g.save();
  try {
   g.setTransform(RR, 0, 0, RR, 0, 0); g.globalAlpha = 1;   // the HUD's base transform (v473safe shifts this exact call into the safe box)
   try { drawFakeTxt(); } catch (e) { err(e, 'ftxt'); }
   try { if (T.active) drawTut(); } catch (e) { err(e, 'tutdraw'); }
   try { drawBtn(); } catch (e) { err(e, 'btn'); }
  } finally { g.restore(); }
  return r;
 };
 function drawFakeTxt() {
  const G = G0(), f = F.fake; if (!G || !f || SCR() !== 'live' || !G.goalie) return;
  const el = rt() - f.t; if (el > .9) return;
  const gk = G.goalie, x = Math.round(gk.x - Math.round(camX)), y = Math.round(gk.y) - 30 - Math.round(Math.min(.25, el) * 16);
  text('FAKE!', x, y, 1, '#ff5a4a', 'center', '#000');
  if (el > .15) text('HE BIT', x, y + 7, 1, '#ffffff', 'center', '#000');
 }
 // ---------------- keyboard + controller ----------------
 // v507b (Nov 11, Charlie: "I click it and they stay yellow"): the FAKE button went through the game's #ui DOM button, which only
 // acts on 'click'. On a phone you are still holding the run stick with one thumb when you tap FAKE with the other, and a browser
 // sends NO click for a tap made while another finger is down (iOS Safari / WKWebView and Android Chrome alike) - so the tap did
 // nothing and the circles stayed yellow. Fix: answer the FAKE tap on 'pointerdown' (fires for every finger, mouse and pen too),
 // on the #ui button itself or anywhere on the drawn button's spot (canvas included), before the game's own handlers see it.
 const BTNR = { x: 0, y: 0, w: 0, h: 0, t: -9 };
 function onBtn(e) {
  try {
   const k = e.target && e.target.dataset && e.target.dataset.k;
   if (k && /\|fake507$/.test(k)) return true;
   if (rt() - BTNR.t > .25 || !BTNR.w || typeof cv === 'undefined') return false;
   const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return false;
   const lx = (e.clientX - r.left) / r.width * W, ly = (e.clientY - r.top) / r.height * H;
   let by = BTNR.y; try { if (typeof SA2403B !== 'undefined' && SA2403B && typeof sa2403By === 'function') by = sa2403By(by); } catch (x) {}   // same shift hit() applies
   const s = 4;   // a little forgiveness around the drawn disc
   return lx >= BTNR.x - s && lx <= BTNR.x + BTNR.w + s && ly >= by - s && ly <= by + BTNR.h + s;
  } catch (x) { return false; }
 }
 W0.addEventListener('pointerdown', e => {
  if (OFF()) return;
  try {
   if (SCR() !== 'live' || !btnShown() || F.armed) return;
   if (!onBtn(e)) return;
   if (arm('tap')) { ST.pdArms = (ST.pdArms || 0) + 1; ST.lastArm = 'pointerdown:' + (e.pointerType || '?') + (e.isPrimary === false ? ':2nd' : ''); }
   BTNR.ate = rt();
   e.preventDefault(); e.stopPropagation();
  } catch (x) { err(x, 'pd'); }
 }, true);
 // the same finger's touchstart (canvas only; the #ui button never reaches the canvas) must not also start a run / aim there
 W0.addEventListener('touchstart', e => {
  try {
   if (OFF() || !BTNR.ate || rt() - BTNR.ate > .4) return;
   for (const t of e.changedTouches) if (onBtn({ target: e.target, clientX: t.clientX, clientY: t.clientY })) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); return; }
  } catch (x) { err(x, 'ts'); }
 }, { capture: true, passive: false });
 function keyUsed(k) { try { const b = W0.V468CTL && V468CTL.kb ? V468CTL.kb() : {}; for (const a in b) if (String(b[a]).toLowerCase() === k) return true; } catch (e) {} return false; }
 W0.addEventListener('keydown', e => {
  if (OFF() || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key && e.key.length === 1 ? e.key.toLowerCase() : '';
  if (k !== 'f' || keyUsed('f')) return;
  try { if (W0.__rl468 && __rl468.open) return; } catch (x) {}
  if (arm('key')) e.preventDefault();
 }, false);
 const PP = { prev: false };
 function padPoll() {
  let ps = [];
  try { ps = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected !== false); } catch (e) { return; }
  if (!ps.length) { PP.prev = false; return; }
  const p = ps[0], b = p.buttons && p.buttons[3], down = !!(b && (typeof b === 'object' ? b.pressed || b.value > .5 : b > .5));
  if (down && !PP.prev) {
   ST.pad++;
   if (F.armed && circOn()) {
    const ly = p.axes && p.axes[1] || 0, top = !(ly > .35);
    const q = SH.circles().find(c => c.top === top && c.high);
    doFake(q, 'pad');
   } else arm('pad');
  }
  PP.prev = down;
 }
 // ---------------- mandatory one-time tutorial ----------------
 const T = { active: false, step: null, msg: null, msgT: 0, setups: -1, menuT: 0, doneAt: 0, runs: 0, log: [], pend: null };
 const KEY = 'fake507';
 function need() {
  try {
   if (OFF() || W0.__rl_skip507) return false;
   if (W0.__rl_skip26 && !W0.__rl_force507tut) return false;
   if (W0.V28 && V28.drillNeed && V28.drillNeed()) return false;   // the older drill tutorials go first
   if (W0.TUT26 && TUT26.need && TUT26.need()) return false;
   return !LS.get(KEY, false) && !!LS.get('tutDone', false) && (!!LS.get('tut26', false) || !!W0.__rl_force507tut);
  } catch (e) { return false; }
 }
 function menuFree() {
  try {
   return SCR() === 'menu' && !G0() && !tutAsk && !(typeof ASK22 !== 'undefined' && ASK22) && !document.getElementById('df2503') && !document.getElementById('shop26') && !document.getElementById('tut26card') && !document.getElementById('tut507card') && !document.getElementById('c27') && !document.getElementById('tt27') && !(W0.TUT26 && TUT26.active && TUT26.active());
  } catch (e) { return false; }
 }
 function card(id, title, lines, btn, go) {
  const old = document.getElementById('tut507card'); if (old) old.remove();
  const d = document.createElement('div');
  d.id = 'tut507card'; d.dataset.step = id;
  d.style.cssText = 'position:fixed;inset:0;z-index:84;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62);font:bold 11px/1.3 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:max(6px,env(safe-area-inset-top)) max(6px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left));box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ff4a3a;box-shadow:0 3px 0 #000;padding:9px 14px 10px;max-width:92vw;max-height:94vh;overflow:auto;text-align:left';
  const h = document.createElement('div'); h.textContent = title;
  h.style.cssText = 'color:#ff6a5a;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:5px;text-align:center';
  box.appendChild(h);
  for (const l of lines) { const p = document.createElement('div'); p.textContent = l; p.style.cssText = 'margin:3px 0'; box.appendChild(p); }
  const b = document.createElement('button'); b.type = 'button'; b.textContent = btn;
  b.style.cssText = 'display:block;margin:8px auto 0;font:inherit;font-size:13px;border:0;border-radius:0;padding:7px 18px;background:#7dff7a;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000';
  b.addEventListener('click', e => { e.stopPropagation(); d.remove(); T.card = null; try { SFX.tap && SFX.tap(); } catch (x) {} go(); });
  box.appendChild(b); d.appendChild(box); document.body.appendChild(d);
  T.card = id;
 }
 const INTRO = [ 'NEW ON GROSS, NASTY AND BAGGATWAAN: A RED FAKE BUTTON POPS UP AT THE TOP RIGHT WHEN YOU GET CLOSE TO THE CREASE.', '1. TAP FAKE - THE CIRCLES TURN RED.', '2. TAP A RED CIRCLE - YOU FAKE THERE AND THE GOALIE BITES.', '3. THE CIRCLES TURN YELLOW - SHOOT THE OTHER SIDE.', 'FAKE ONE WAY + SHOOT THE OTHER = ALMOST ALWAYS A GOAL. NO FAKE ON THOSE MODES = ABOUT 50/50.' ];
 function start() {
  if (T.active) return;
  T.runs++;
  try {
   const SET = PRAC18.SET, saved = JSON.parse(JSON.stringify(SET)), key = typeof wgame !== 'undefined' && wgame && PRAC18.world && PRAC18.world() ? 'wteam' : 'team';
   const l = PRAC18.teams(), tm = l.find(x => x !== 'SEASON' && TEAMS.some(t => t.id === x && !t.sz)) || l.find(x => x !== 'SEASON') || l[0];
   SET.side = 'O'; SET.n = 1; SET.ghosts = 1; SET.drill = 'shoot'; SET[key] = tm;
   const ok = PRAC18.start();
   for (const k of Object.keys(SET)) if (!(k in saved)) delete SET[k];
   Object.assign(SET, saved);
   try { PRAC18.saveSet(); } catch (e) {}
   if (!ok || !game || !game.practice) throw new Error('practice did not start');
   game.practice.season = false; game.practice.fake507 = true; game.practice.counted = 'yes'; game.practice.xp232 = 1;
  } catch (e) { err(e, 'tutstart'); T.active = false; T.step = null; return; }
  T.active = true; T.step = 'intro'; T.setups = -1; T.pend = null; T.msg = null;
  F.armed = false; F.used = false; F.fake = null;
  card('intro', 'CREASE FAKES', INTRO, 'LET\'S GO', () => { T.step = 'arm'; place(); say('TAP THE RED FAKE BUTTON', '#ff6a5a'); });
 }
 function finish() {
  T.active = false; T.step = null; T.card = null; T.doneAt = rt();
  try { LS.set(KEY, true); } catch (e) {}
  try { game = null; screen = 'menu'; shootP = null; stick = null; menuMsg = { s: 'FAKE TUTORIAL DONE', t: 2 }; panelDirty(); } catch (e) {}
 }
 function place() {
  const G = G0(); if (!G || !G.carrier) return;
  const c = G.carrier, x = GX - (CREASE + 9), y = CY + (Math.random() * 10 - 5);
  c.x = x; c.y = y; c.tx = x; c.ty = y;
  G.ball.x = c.x + BX; G.ball.y = c.y + BY; G.ball.state = 'held'; G.carrier = c;
  for (const d of G.players) if (d.team === 'D' && !d.gk && d.role !== 'G' && !d.far) { d.x = Math.max(8, c.x - 70); d.y = c.y < CY ? FB - 8 : FT + 8; d.tx = d.x; d.ty = d.y; d.stun = 9; }
  F.armed = false; F.used = false; F.fake = null; F.car = c; F.offT = 0;
  T.placedAt = rt();
  // v418t's anti-teleport clamp would pull him back next frame: let this one placement through (2 frames), like a restart
  if (T.tp == null) T.tp = { prev: W0.__rl_no418tx };
  T.tpN = 2; W0.__rl_no418tx = true;
 }
 function tpTick() { if (T.tp && --T.tpN <= 0) { W0.__rl_no418tx = T.tp.prev; T.tp = null; } }
 function say(s, col) { T.msg = { s: s, col: col || '#ffe14d' }; T.msgT = rt(); }
 function tutTick() {
  const G = G0();
  if (!G || !G.practice || !G.practice.fake507) { T.active = false; T.step = null; const o = document.getElementById('tut507card'); if (o) o.remove(); T.card = null; return; }
  for (const d of G.players) if (d.team === 'D' && !d.gk && d.role !== 'G' && !d.far) d.stun = Math.max(d.stun || 0, 1);
  const c = car();
  if (c && (T.step === 'arm' || T.step === 'fake' || T.step === 'shoot')) {
   c.tx = c.x; c.ty = c.y;
   if (!nearOn() && G.ball.state === 'held' && rt() - (T.placedAt || 0) > .35) { const st = T.step; place(); if (st === 'shoot' || st === 'fake') { T.step = 'arm'; } }   // the drill moved him: back to the crease
  }
  if (G.practice.setups !== T.setups) { T.setups = G.practice.setups; if (T.step && T.step !== 'intro' && T.step !== 'done') { if (T.step !== 'wait') T.step = 'arm'; place(); } }
  const b = G.ball;
  if (b && b.f507 && b.f507.done && !T.pend && b.state === 'shot') T.pend = b.f507;
  if (T.pend && b && b.state !== 'shot') {
   const P = T.pend; T.pend = null;
   const scored = b.state === 'net' || /GOAL/.test(G.banner && G.banner.txt || '') && !/NO GOAL/.test(G.banner && G.banner.txt || '');
   T.log.push({ kind: P.kind, scored: scored });
   if (scored && P.kind === 'opp') {
    T.step = 'wait'; say('GOAL! FAKED HIM OUT', '#7dff7a');
    try { SFX.cheer && SFX.cheer(); } catch (e) {}
    setTimeout(() => { if (T.active && T.step === 'wait') { T.step = 'done'; card('done', 'FAKE TUTORIAL COMPLETE', [ 'FAKE ONE SIDE, SHOOT THE OTHER.', 'THE FAKE BUTTON SHOWS ON GROSS, NASTY AND BAGGATWAAN. ON THE EASIER MODES CREASE FINISHES MOSTLY GO IN - NO FAKES THERE.', 'KEYS: F = FAKE, THEN 1-4. CONTROLLER: TRIANGLE / Y = FAKE, TRIANGLE / Y AGAIN = FAKE TOP (STICK DOWN = BOTTOM).' ], 'PLAY', finish); } }, 1100);
   } else {
    say(P.kind === 'same' ? 'SAME SIDE - HE WAS THERE. SHOOT THE OTHER SIDE' : 'FAKE FIRST, THEN SHOOT THE OTHER SIDE', '#ff9a8a');
    T.step = 'arm';
    setTimeout(() => { try { if (T.active && T.step === 'arm') place(); } catch (e) {} }, 900);
   }
  }
 }
 function drawTut() {
  rect(0, 0, W, 17, '#0b0f14');
  rect(2, 2, 76, 13, '#8a1a12');
  text('FAKE TUTORIAL', 40, 5, 1, '#ffffff', 'center');
  const s = T.step;
  const a = s === 'arm' ? '1. TAP FAKE (TOP RIGHT)' : s === 'fake' ? '2. TAP A RED CIRCLE TO FAKE' : s === 'shoot' ? '3. NOW SHOOT THE OTHER SIDE' : s === 'wait' || s === 'done' ? 'NICE!' : '';
  text(a, 84, 3, 1, '#ffd23a');
  text(s === 'shoot' ? 'TAP A YELLOW CIRCLE ON THE OTHER SIDE' : 'CAN\'T SKIP THIS ONE - IT TAKES 10 SECONDS', 84, 10, 1, '#8fe3f0');
  if (T.msg && rt() - T.msgT < 1.8) { const w = textW(T.msg.s, 1) + 10; rect(Math.round(W / 2 - w / 2), 44, w, 11, 'rgba(0,0,0,.78)'); text(T.msg.s, W / 2, 47, 1, T.msg.col, 'center'); }
 }
 function menuTick() {
  if (T.active) { const G = G0(); if (!G || !G.practice || !G.practice.fake507) { T.active = false; T.step = null; const o = document.getElementById('tut507card'); if (o) o.remove(); T.card = null; } return; }
  if (SCR() === 'menu' && !G0()) { if (!T.menuT) T.menuT = rt(); } else T.menuT = 0;
  if (T.menuT && rt() - T.menuT > .9 && rt() - T.doneAt > 1 && menuFree() && need()) start();
 }
 // the menu has no game step: watch it from the frame loop through render
 const RD1 = W0.render;
 W0.render = function () { try { menuTick(); } catch (e) { err(e, 'menu'); } return RD1.apply(this, arguments); };
 W0.V507FAKE = {
  on: () => !OFF(), K: K, F: F, T: T, ST: ST, tier: tier, opp: opp, need: need, start: start, finish: finish,
  arm: arm, doFake: doFake, btnShown: btnShown, btnLive: btnLive, btnPos: btnPos, KEY: KEY,
  test: { fake: (name) => { if (!arm('test')) return false; const q = SH.circles().find(c => c.name === name); return doFake(q, 'test'); } }
 };
})();
