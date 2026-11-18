/* v521tutfake.js - BAGGA LAX 1.3: THE FAKE LESSON IS A REAL STEP OF THE MAIN (FIRST-TIME) TUTORIAL.
 * Charlie (Nov 11, 11:00 PM): "add fakes to the tutorial" / 11:06 PM: "Yea" (when asked: actually inside the main tutorial,
 *  not only the separate drill afterwards) / 11:08 PM: "for computer they tap the fake button with mouse".
 * What this does:
 *  1) Two new steps in the MAIN tutorial track, right after the SHOOTING step (v38t's 'SHOOTING', else the old 'SHOOT'):
 *     a) FAKES card (tap anywhere to go on, like the RULES / SETTINGS cards): what the FAKE button does.
 *     b) FAKE live step: your guy starts at the crease, the red FAKE button shows (same spot / look as v507's), tap it ->
 *        circles turn red -> tap a red circle (you fake there, the goalie bites - v507's own doFake) -> shoot the other side.
 *        The shot is marked exactly like v507's own fake drill (ball.f507 with k 9 -> v507 settles it: other side = goal,
 *        same side / no fake = save, then you get another try). A goal off a fake = step done. SKIP > / SKIP TUTORIAL and
 *        v4012tut's "moving on" after 3 tries work like on every other step.
 *  2) Finishing that step saves v507's own done flag (rl_fake507 / KEY 'fake507'), so the separate one-time fake drill does
 *     not run again after the tutorial for new players. Skipped = not saved = they still get the drill once (unchanged).
 *     Players who already finished the main tutorial never see these steps; they still get v507's drill once (unchanged).
 *  3) Words follow the input in use (v468ctl's inputMode, the same swap pattern as v468ctl / v481tutkeys):
 *     touch = TAP, computer = CLICK FAKE (TOP RIGHT) with the mouse (F key still works, not advertised),
 *     controller = TRIANGLE / Y (again = fake high, stick down = low). The same CLICK / TRIANGLE words also go on v507's
 *     separate fake drill (its top bar, cues and its two DOM cards).
 *  Mouse clicks on the FAKE button: answered on 'pointerdown' (mouse, pen and every finger) on the drawn button's spot, like
 *  v507b, plus the game's own #ui hit button.
 * No new save keys (only v507's rl_fake507 is written, the same value v507 writes). Ids, other rl_* keys, net protocol and
 * online untouched (the tutorial is offline only).
 * Kill switch: window.__rl_no521tf = true -> exactly as before. Test hook: window.V521TF.
 */
(function () {
 'use strict';
 const W0 = window;
 const OFF = () => !!(W0.__rl_no521tf || W0.__rl_v124gb);
 if (OFF()) return;
 if (typeof TUTX === 'undefined' || typeof tutSetup !== 'function' || typeof tutDone !== 'function' || typeof tutList !== 'function' || typeof tutIsCard !== 'function' || typeof drawTutorial !== 'function') return;
 const A5 = W0.V507FAKE, SH = W0.SHOT26;
 if (!A5 || !A5.doFake || !A5.F || !SH || typeof SH.circles !== 'function' || typeof W0.step !== 'function' || typeof W0.render !== 'function' || typeof W0.releaseShot !== 'function' || typeof W0.drawPlayers !== 'function') return;
 const rt = () => performance.now() / 1e3;
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const ST = { errs: [], arms: 0, fakes: 0, shots: [], setups: 0, done: 0, flag: 0, txt: 0, lastArm: null };
 const err = (e, w) => { try { if (ST.errs.length < 10) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v521tf', w, e); } } catch (x) {} };
 const wrapG = (n, f) => { const o = W0[n]; if (typeof o !== 'function') return false; W0[n] = function () { return f.call(this, o, arguments); }; return true; };
 function mode() { try { const s = W0.__rl468; const m = s && s.inputMode ? s.inputMode() : 'touch'; return m === 'key' || m === 'pad' ? m : 'touch'; } catch (e) { return 'touch'; } }

 // ---------------- the two steps ----------------
 const LIVE_T = 'NEAR THE CAGE TAP FAKE, THEN TAP A RED CIRCLE, THEN SHOOT THE OTHER SIDE.';
 const FSC = TUTX.length, FS = FSC + 1;
 TUTX.push([ 'FAKES', 'FAKES BEAT THE GOALIE. TAP ANYWHERE TO GO ON.' ], [ 'FAKE', LIVE_T ]);
 const CARD = [ 'FAKES: CLOSE TO THE CAGE A RED FAKE BUTTON POPS UP (TOP RIGHT).', '1. TAP FAKE - THE CIRCLES TURN RED.', '2. TAP A RED CIRCLE - YOU FAKE THERE, THE GOALIE BITES.', '3. NOW SHOOT THE OTHER SIDE. FAKES BEAT THE GOALIE.', 'TAP ANYWHERE TO GO ON.' ];
 const H1 = '1. TAP FAKE (TOP RIGHT)', H2 = '2. TAP A RED CIRCLE TO FAKE', H3 = '3. NOW SHOOT THE OTHER SIDE';
 // computer / controller words (exact lines, outermost text() swap like v468ctl / v481tutkeys)
 const MAP = {
  key: {
   [LIVE_T]: 'CLICK FAKE (TOP RIGHT), THEN CLICK A RED CIRCLE, THEN SHOOT THE OTHER SIDE.',
   'FAKES BEAT THE GOALIE. TAP ANYWHERE TO GO ON.': 'FAKES BEAT THE GOALIE. CLICK ANYWHERE TO GO ON.',
   [CARD[0]]: 'FAKES: CLOSE TO THE CAGE A RED FAKE BUTTON POPS UP (TOP RIGHT).',
   [CARD[1]]: '1. CLICK FAKE WITH THE MOUSE - THE CIRCLES TURN RED.',
   [CARD[2]]: '2. CLICK A RED CIRCLE - YOU FAKE THERE, THE GOALIE BITES.',
   [CARD[4]]: 'CLICK ANYWHERE TO GO ON.',
   [H1]: '1. CLICK FAKE (TOP RIGHT)', [H2]: '2. CLICK A RED CIRCLE TO FAKE',
   // v507's separate drill
   '1. TAP FAKE (TOP RIGHT)': '1. CLICK FAKE (TOP RIGHT)', '2. TAP A RED CIRCLE TO FAKE': '2. CLICK A RED CIRCLE TO FAKE',
   'TAP A YELLOW CIRCLE ON THE OTHER SIDE': 'CLICK A YELLOW CIRCLE ON THE OTHER SIDE',
   'TAP THE RED FAKE BUTTON': 'CLICK THE RED FAKE BUTTON', 'NOW TAP A RED CIRCLE': 'NOW CLICK A RED CIRCLE',
   'TAP THE RED FAKE BUTTON FIRST': 'CLICK THE RED FAKE BUTTON FIRST', 'TAP FAKE FIRST (TOP RIGHT)': 'CLICK FAKE FIRST (TOP RIGHT)',
   'TAP': 'CLICK'
  },
  pad: {
   [LIVE_T]: 'TRIANGLE / Y = FAKE, AGAIN = FAKE HIGH (STICK DOWN = LOW). SHOOT THE OTHER SIDE.',
   'FAKES BEAT THE GOALIE. TAP ANYWHERE TO GO ON.': 'FAKES BEAT THE GOALIE. OPTIONS / START TO GO ON.',
   [CARD[0]]: 'FAKES: CLOSE TO THE CAGE THE RED FAKE BUTTON POPS UP (TOP RIGHT).',
   [CARD[1]]: '1. PRESS TRIANGLE / Y = FAKE - THE CIRCLES TURN RED.',
   [CARD[2]]: '2. TRIANGLE / Y AGAIN = FAKE HIGH (LEFT STICK DOWN = LOW).',
   [CARD[3]]: '3. NOW SHOOT THE OTHER SIDE (R2 / RT). FAKES BEAT THE GOALIE.',
   [CARD[4]]: 'OPTIONS / START TO GO ON.',
   [H1]: '1. PRESS TRIANGLE / Y = FAKE', [H2]: '2. TRIANGLE / Y AGAIN = FAKE (STICK DOWN = LOW)',
   '1. TAP FAKE (TOP RIGHT)': '1. PRESS TRIANGLE / Y = FAKE', '2. TAP A RED CIRCLE TO FAKE': '2. TRIANGLE / Y AGAIN = FAKE (STICK DOWN = LOW)',
   'TAP A YELLOW CIRCLE ON THE OTHER SIDE': 'SHOOT THE OTHER SIDE (R2 / RT)',
   'TAP THE RED FAKE BUTTON': 'PRESS TRIANGLE / Y = FAKE', 'NOW TAP A RED CIRCLE': 'TRIANGLE / Y AGAIN = FAKE',
   'TAP THE RED FAKE BUTTON FIRST': 'PRESS TRIANGLE / Y FIRST', 'TAP FAKE FIRST (TOP RIGHT)': 'PRESS TRIANGLE / Y FIRST',
   'TAP': 'Y / TRI'
  }
 };
 // v507's drill DOM cards (intro + done): the same words for the computer / controller
 const DOMMAP = {
  key: {
   '1. TAP FAKE - THE CIRCLES TURN RED.': '1. CLICK FAKE WITH THE MOUSE - THE CIRCLES TURN RED.',
   '2. TAP A RED CIRCLE - YOU FAKE THERE AND THE GOALIE BITES.': '2. CLICK A RED CIRCLE - YOU FAKE THERE AND THE GOALIE BITES.',
   'KEYS: F = FAKE, THEN 1-4. CONTROLLER: TRIANGLE / Y = FAKE, TRIANGLE / Y AGAIN = FAKE TOP (STICK DOWN = BOTTOM).': 'COMPUTER: CLICK FAKE (TOP RIGHT), THEN CLICK A RED CIRCLE. CONTROLLER: TRIANGLE / Y = FAKE, AGAIN = FAKE TOP (STICK DOWN = BOTTOM).'
  },
  pad: {
   '1. TAP FAKE - THE CIRCLES TURN RED.': '1. PRESS TRIANGLE / Y = FAKE - THE CIRCLES TURN RED.',
   '2. TAP A RED CIRCLE - YOU FAKE THERE AND THE GOALIE BITES.': '2. TRIANGLE / Y AGAIN = FAKE HIGH (STICK DOWN = LOW). THE GOALIE BITES.',
   '3. THE CIRCLES TURN YELLOW - SHOOT THE OTHER SIDE.': '3. THE CIRCLES TURN YELLOW - SHOOT THE OTHER SIDE (R2 / RT).'
  }
 };
 function tr(s) {
  if (typeof s !== 'string' || OFF()) return s;
  const m = mode(); if (m === 'touch') return s;
  const r = MAP[m][s];
  if (r == null) return s;
  if (s === 'TAP') { const T5 = A5.T; if (!(T5 && T5.active) && !mine()) return s; }   // the arrow word beside the FAKE button only
  ST.txt++;
  return r;
 }
 (function hookText() {
  const T0 = W0.text, X0 = W0.textW;
  if (typeof T0 !== 'function' || typeof X0 !== 'function') return;
  W0.text = function (s) { if (typeof s === 'string') { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return T0.apply(this, b); } } return T0.apply(this, arguments); };
  W0.textW = function (s) { if (typeof s === 'string') { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return X0.apply(this, b); } } return X0.apply(this, arguments); };
 })();
 function domCards() {
  const d = document.getElementById('tut507card'); if (!d) return;
  const m = mode(), key = m + ':' + (d.dataset.step || '');
  if (d.dataset.v521 === key) return;
  d.dataset.v521 = key;
  if (m === 'touch') return;
  for (const el of d.querySelectorAll('div')) { if (el.children.length) continue; const r = DOMMAP[m][el.textContent]; if (r) el.textContent = r; }
 }

 // ---------------- state ----------------
 const X = { armed: false, stage: null, placedAt: 0, pend: null, retryAt: 0, retryMsg: null, lostT: 0, tries: 0, msg: null, cur: -1, padPrev: false, tp: null, tpN: 0 };
 function TT() { const G = G0(), Tt = G && G.tutorial; return Tt && !Tt.complete && (Tt.track || 'main') === 'main' ? Tt : null; }
 function mine() { const Tt = TT(); return Tt && Tt.step === FS && !OFF() ? Tt : null; }
 function live() { const Tt = mine(); return !!Tt && Tt.doneT <= 0 && SCR() === 'live'; }
 function car() { const G = G0(); return G && G.carrier && G.ball && G.ball.state === 'held' && G.carrier.team === 'O' ? G.carrier : null; }
 function circOn() { try { return SCR() === 'live' && canShoot() && !SH.S.aim && SH.circlesOn() && SH.inTap(); } catch (e) { return false; } }
 function nearOn() { const c = car(); if (!c) return false; try { return c.x < GX && Math.hypot(GX - c.x, CY - c.y) <= SH.CFG.tapR + 10; } catch (e) { return false; } }
 function say(s, col, life) { X.msg = { s: s, col: col || '#ffe14d', until: rt() + (life || 1.8) }; }
 function btnShown() { return live() && !!car() && (X.stage === 'arm' || X.stage === 'fake') && nearOn(); }

 // ---------------- tutorial list / done / card / setup ----------------
 const cache = new WeakMap();
 wrapG('tutList', function (o, a) {
  const L = o.apply(this, a);
  try {
   if (OFF() || !Array.isArray(L)) return L;
   const G = G0(), tr0 = G && G.tutorial && G.tutorial.track || 'main';
   if (tr0 !== 'main' || L.includes(FS)) return L;
   let M = cache.get(L);
   if (!M) {
    M = L.slice();
    const iS = TUTX.findIndex(s => s && s[0] === 'SHOOTING');
    let at = iS >= 0 ? M.indexOf(iS) : -1;
    if (at < 0) at = M.indexOf(2);
    if (at < 0) at = Math.max(0, M.length - 1); else at++;
    M.splice(at, 0, FSC, FS);
    cache.set(L, M);
   }
   return M;
  } catch (e) { err(e, 'list'); return L; }
 });
 wrapG('tutIsCard', function (o, a) { if (!OFF() && a[0] === FSC) return true; return o.apply(this, a); });
 wrapG('tutDone', function (o, a) {
  const i = a[0];
  if (!OFF() && (i === FSC || i === FS)) {
   const G = G0(), f = G && G.tutorial && G.tutorial.f;
   return !!(f && (i === FSC ? f.card : f.fake521));
  }
  return o.apply(this, a);
 });
 function place() {
  const G = G0(); if (!G) return;
  setupPossession(GX - 60, CY + (X.tries % 2 ? 8 : -8));
  G.run = null;
  const c = G.carrier; if (!c) return;
  const x = GX - (CREASE + 9), y = CY + (X.tries % 2 ? 4 : -4);
  c.x = x; c.y = y; c.tx = x; c.ty = y;
  G.ball.x = c.x + BX; G.ball.y = c.y + BY; G.ball.state = 'held';
  for (const d of G.players) if (d.team === 'D' && !d.gk && d.role !== 'G' && !d.far) { d.x = Math.max(8, c.x - 70); d.y = c.y < CY ? FB - 8 : FT + 8; d.tx = d.x; d.ty = d.y; d.stun = 9; d._p26 = [ d.x, d.y ]; d._v26 = [ 0, 0 ]; }
  const F = A5.F; F.armed = false; F.used = false; F.fake = null; F.car = c; F.offT = 0;
  X.armed = false; X.stage = 'arm'; X.pend = null; X.retryAt = 0; X.lostT = 0; X.placedAt = rt();
  // v418t's anti-teleport clamp would pull him back next frame: let this placement through (2 frames), like v507's drill
  if (X.tp == null) X.tp = { prev: W0.__rl_no418tx };
  X.tpN = 2; W0.__rl_no418tx = true;
 }
 function tpTick() { if (X.tp && --X.tpN <= 0) { W0.__rl_no418tx = X.tp.prev; X.tp = null; } }
 wrapG('tutSetup', function (o, a) {
  const r = o.apply(this, a);
  try {
   const Tt = TT(), s = Tt ? Tt.step : -1;
   if (s !== FS) { if (X.cur === FS) { X.armed = false; X.stage = null; X.pend = null; } X.cur = s; }
   if (s === FSC) {
    X.cardAt = rt();
    if (SCR() !== 'live') setupPossession();
    try { camX = Math.max(0, Math.min(GX + 40 - W, GX - Math.round(W * .7))); } catch (e) {}
   } else if (s === FS) {
    if (X.cur !== FS) { X.tries = 0; X.cur = FS; } else X.tries++;
    ST.setups++;
    place();
    say(mode() === 'pad' ? H1 : 'TAP FAKE (TOP RIGHT) - FAKES BEAT THE GOALIE', '#ff6a5a', 2.4);
   }
  } catch (e) { err(e, 'setup'); }
  return r;
 });

 // ---------------- the FAKE button (same spot and look as v507's) ----------------
 const BR = 12;
 function bpos() { try { return A5.btnPos(); } catch (e) { return { x: W - BR - 6, y: 42 }; } }
 function arm(src) {
  if (!btnShown() || X.armed) return false;
  X.armed = true; X.stage = 'fake'; ST.arms++; ST.lastArm = src || 'tap';
  try { SH.S.slowUntil = rt() + 1.6; } catch (e) {}
  try { SFX.tap && SFX.tap(); } catch (e) {}
  say(mode() === 'pad' ? MAP.pad[H2] : 'NOW TAP A RED CIRCLE', '#ff6a5a');
  return true;
 }
 function fake(q, src) {
  if (!q || !live() || !X.armed) return false;
  let ok = false;
  try { ok = A5.doFake(q, src); } catch (e) { err(e, 'dofake'); }
  if (!ok) return false;
  X.armed = false; X.stage = 'shoot'; ST.fakes++;
  say('NOW SHOOT THE OTHER SIDE!', '#7dff7a');
  return true;
 }
 function disc(x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
 const BTNR = { x: 0, y: 0, w: 0, h: 0, t: -9, ate: 0 };
 function drawBtn() {
  if (!btnShown()) return;
  const p = bpos(), lv = circOn(), t = rt(), arm0 = X.armed;
  const pulse = arm0 ? 1 : .5 + .5 * Math.sin(t * 8);
  g.save();
  g.globalAlpha = arm0 ? .85 : lv ? .7 : .45;
  disc(p.x + .5, p.y + 2.5, BR, '#000');
  disc(p.x + .5, p.y + .5, BR, arm0 ? '#ffffff' : '#d8261c');
  disc(p.x + .5, p.y + .5, BR - 2, arm0 ? '#ff3b2e' : '#ff4a3a');
  g.strokeStyle = arm0 ? '#ffe14d' : 'rgba(255,255,255,' + (.45 + .4 * pulse).toFixed(2) + ')';
  g.lineWidth = 1; g.beginPath(); g.arc(p.x + .5, p.y + .5, BR - .5, 0, Math.PI * 2); g.stroke();
  g.restore();
  g.save(); g.globalAlpha = arm0 ? .85 : lv ? .7 : .45;
  text('FAKE', p.x + 1, p.y - 2, 1, '#ffffff', 'center', '#5a0000');
  g.restore();
  if (!arm0) {   // arrow at the button
   const a = Math.round(4 * Math.sin(t * 7));
   text('TAP', p.x - BR - 14 + a, p.y - 2, 1, '#ffe14d', 'center', '#000');
   rect(p.x - BR - 6 + a, p.y, 3, 1, '#ffe14d');
   hit('fake521', p.x - BR - 3, p.y - BR - 3, 2 * BR + 6, 2 * BR + 6, () => arm('tap'), 'FAKE');
  }
  BTNR.x = p.x - BR - 3; BTNR.y = p.y - BR - 3; BTNR.w = 2 * BR + 6; BTNR.h = 2 * BR + 6; BTNR.t = rt();
 }
 function drawRed() {
  if (!X.armed || !circOn()) return;
  const t = rt(), R = SH.CFG.circR;
  for (const q of SH.circles()) {
   g.fillStyle = 'rgba(255,48,36,' + (.55 + .15 * Math.sin(t * 9)).toFixed(2) + ')';
   g.beginPath(); g.arc(q.x + .5, q.y + .5, R, 0, Math.PI * 2); g.fill();
   g.strokeStyle = '#ff3b2e'; g.lineWidth = 1;
   g.beginPath(); g.arc(q.x + .5, q.y + .5, R - .5, 0, Math.PI * 2); g.stroke();
  }
 }
 function drawHi() {   // after the fake: ring the other-side circles
  const F = A5.F;
  if (!live() || X.stage !== 'shoot' || !F.fake || !circOn()) return;
  const t = rt();
  for (const q of SH.circles()) if (q.top !== F.fake.top) {
   g.strokeStyle = 'rgba(125,255,122,' + (.5 + .5 * Math.sin(t * 8)).toFixed(2) + ')'; g.lineWidth = 1;
   g.beginPath(); g.arc(q.x + .5, q.y + .5, SH.CFG.circR + 2.5, 0, Math.PI * 2); g.stroke();
  }
 }
 function onBtn(e) {
  try {
   const k = e.target && e.target.dataset && e.target.dataset.k;
   if (k && /\|fake521$/.test(k)) return true;
   if (rt() - BTNR.t > .25 || !BTNR.w || typeof cv === 'undefined') return false;
   const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return false;
   const lx = (e.clientX - r.left) / r.width * W, ly = (e.clientY - r.top) / r.height * H;
   let by = BTNR.y; try { if (typeof SA2403B !== 'undefined' && SA2403B && typeof sa2403By === 'function') by = sa2403By(by); } catch (x) {}
   const s = 4;
   return lx >= BTNR.x - s && lx <= BTNR.x + BTNR.w + s && ly >= by - s && ly <= by + BTNR.h + s;
  } catch (x) { return false; }
 }
 // pointerdown fires for the mouse, pens and every finger (a click is not sent for a second finger on phones - v507b)
 W0.addEventListener('pointerdown', e => {
  if (OFF()) return;
  try {
   if (!btnShown() || X.armed || !onBtn(e)) return;
   if (arm('pointerdown:' + (e.pointerType || '?'))) { BTNR.ate = rt(); e.preventDefault(); e.stopPropagation(); }
  } catch (x) { err(x, 'pd'); }
 }, true);
 W0.addEventListener('touchstart', e => {
  try {
   if (OFF() || !BTNR.ate || rt() - BTNR.ate > .4) return;
   for (const t of e.changedTouches) if (onBtn({ target: e.target, clientX: t.clientX, clientY: t.clientY })) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); return; }
  } catch (x) { err(x, 'ts'); }
 }, { capture: true, passive: false });
 W0.addEventListener('mousedown', e => {   // the same mouse press must not also start an aim / run on the canvas
  try { if (!OFF() && BTNR.ate && rt() - BTNR.ate < .4 && onBtn(e)) { e.stopPropagation(); e.preventDefault(); } } catch (x) {}
 }, true);
 // the FAKES card: a mouse click anywhere on the field (or Enter) goes on, like a tap does on a phone. (In headless desktop runs
 // the game's own card tap never fired for a mouse click - its RULES card too - so this card does not rely on it.)
 function cardOn() { const Tt = TT(); return !!Tt && !OFF() && Tt.step === FSC && Tt.doneT <= 0 && SCR() === 'live' && rt() - (X.cardAt || 0) > .35; }
 W0.addEventListener('pointerup', e => {
  try {
   if (!cardOn() || e.button > 0) return;
   const t = e.target; if (t && t.closest && t.closest('button') && !(typeof cv !== 'undefined' && t === cv)) return;   // EXIT / SKIP buttons keep their job
   tutFlag('card'); ST.cardBy = 'pointerup:' + (e.pointerType || '?');
  } catch (x) { err(x, 'card'); }
 }, true);
 function keyUsed(k) { try { const b = W0.V468CTL && V468CTL.kb ? V468CTL.kb() : {}; for (const a in b) if (String(b[a]).toLowerCase() === k) return true; } catch (e) {} return false; }
 W0.addEventListener('keydown', e => {   // F still fakes on the computer (not advertised - the mouse is the way)
  if (OFF() || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter' && cardOn()) { tutFlag('card'); ST.cardBy = 'enter'; return; }
  if (!mine()) return;
  const k = e.key && e.key.length === 1 ? e.key.toLowerCase() : '';
  if (k !== 'f' || keyUsed('f')) return;
  if (arm('key')) e.preventDefault();
 }, false);
 function padPoll() {
  let ps = [];
  try { ps = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected !== false); } catch (e) { return; }
  if (!ps.length) { X.padPrev = false; return; }
  const p = ps[0], b = p.buttons && p.buttons[3], down = !!(b && (typeof b === 'object' ? b.pressed || b.value > .5 : b > .5));
  if (down && !X.padPrev && live()) {
   if (X.armed && circOn()) {
    const ly = p.axes && p.axes[1] || 0, top = !(ly > .35);
    fake(SH.circles().find(c => c.top === top && c.high), 'pad');
   } else arm('pad');
  }
  X.padPrev = down;
 }

 // circle taps (touch, mouse, the 1-4 keys) come through SHOT26.down
 const D0 = SH.down;
 if (typeof D0 === 'function') SH.down = function (pt, p) {
  try {
   if (live() && car() && p) {
    const tq = circOn() ? SH.quad(p.x + Math.round(camX), p.y, true) : null;
    const swallow = () => { pt.role = 'shot26'; pt.f507 = true; return true; };
    if (X.armed) { if (tq) fake(tq, 'tap'); return swallow(); }
    if (X.stage === 'arm' || X.stage === 'fake') { if (tq || circOn()) say(mode() === 'pad' ? MAP.pad['TAP FAKE FIRST (TOP RIGHT)'] : 'TAP FAKE FIRST (TOP RIGHT)', '#ff9a8a'); return swallow(); }
    if (X.stage === 'wait') return swallow();
   }
  } catch (e) { err(e, 'down'); }
  return D0.apply(this, arguments);
 };

 // the shot: marked like v507's own drill (k 9) so v507 settles it - faked one side + shot the other = goal, else a save
 wrapG('releaseShot', function (o, a) {
  let pre = null;
  try {
   const G = G0(), c = G && G.carrier;
   if (live() && c && c.team === 'O' && G.ball && G.ball.state === 'held' && SH.circlesOn() && SH.inTap()) {
    const F = A5.F, win = (A5.K && A5.K.win) || 2;
    pre = { k: 9, fake: F.fake && rt() - F.fake.t <= win ? Object.assign({}, F.fake) : null, c: c, v521: 1 };
   }
  } catch (e) { err(e, 'pre'); }
  const r = o.apply(this, a);
  try { const G = G0(), b = G && G.ball; if (pre && b && b.state === 'shot' && b.shooter === pre.c && !b.f507) { b.f507 = pre; b.v452 = true; X.stage = 'wait'; } } catch (e) { err(e, 'rel'); }
  return r;
 });

 function finish() {
  tutFlag('fake521');
  ST.done++;
  try { if (!LS.get(A5.KEY || 'fake507', false)) { LS.set(A5.KEY || 'fake507', true); ST.flag++; } } catch (e) { err(e, 'flag'); }
 }
 function tick(dt) {
  const Tt = mine();
  if (!Tt) return;
  padPoll();
  if (Tt.doneT > 0) return;
  const G = G0();
  for (const d of G.players || []) if (d.team === 'D' && !d.gk && d.role !== 'G' && !d.far) d.stun = Math.max(d.stun || 0, 1);
  const b = G.ball, c = car();
  if (c && (X.stage === 'arm' || X.stage === 'fake' || X.stage === 'shoot') && !X.retryAt) {
   if (!nearOn() && rt() - X.placedAt > .35) { const st = X.stage; const F = A5.F; const fk = F.fake; place(); if (st === 'shoot' && fk) { F.fake = fk; X.stage = 'shoot'; } }   // drifted off the crease: back to it
  }
  if (b && b.f507 && b.f507.v521 && b.f507.done && !X.pend && b.state === 'shot') X.pend = b.f507;
  if (X.pend && b && b.state !== 'shot') {
   const P = X.pend; X.pend = null;
   const bt = G.banner && G.banner.txt || '';
   const scored = b.state === 'net' || /GOAL/.test(bt) && !/NO GOAL/.test(bt);
   ST.shots.push({ kind: P.kind, scored: scored, fake: P.fake ? P.fake.name : null });
   if (ST.shots.length > 20) ST.shots.shift();
   if (scored && P.kind === 'opp') { say('GOAL! FAKED HIM OUT', '#7dff7a'); finish(); return; }
   X.retryMsg = P.kind === 'same' ? 'SAME SIDE - HE WAS THERE. SHOOT THE OTHER SIDE' : !P.fake ? 'FAKE FIRST, THEN SHOOT THE OTHER SIDE' : 'SHOOT THE OTHER SIDE OF YOUR FAKE';
   X.retryAt = rt() + 1.1;
  }
  if (!X.retryAt && !X.pend && X.stage !== 'wait' && (SCR() !== 'live' || !c)) { X.lostT += dt; if (X.lostT > 1.5) { X.retryAt = rt(); X.retryMsg = 'LOST IT - TRY AGAIN'; } } else X.lostT = 0;
  if (X.stage === 'wait' && !X.pend && b && b.state !== 'shot' && !(b.f507 && b.f507.v521) && !X.retryAt) { X.lostT += dt; if (X.lostT > 2) { X.retryAt = rt(); X.retryMsg = 'TRY AGAIN'; } }
  if (X.retryAt && rt() >= X.retryAt) {
   const m = X.retryMsg; X.retryAt = 0;
   tutSetup();   // same step again (v4012tut counts it as a try: 3 tries = "moving on", like every other step)
   if (mine() && m) say(m, '#ff9a8a', 2.6);
  }
 }
 wrapG('step', function (o, a) {
  const r = o.apply(this, a);
  try { if (!OFF()) { tick(+a[0] || 0); if (X.tp) tpTick(); } } catch (e) { err(e, 'tick'); }
  return r;
 });
 wrapG('drawPlayers', function (o, a) {
  if (live() && X.armed && circOn() && !SH.S.aim) {
   const S = SH.S;
   try { drawRed(); } catch (e) { err(e, 'red'); }
   S.aim = { f507: true, f521: true, id: -521, ax: 0, ay: 0, tx: 0, ty: 0, t0: 1e12, hist: [] };   // SHOT26 draws no yellow circles while an aim is live
   try { return o.apply(this, a); } finally { if (S.aim && S.aim.f521) S.aim = null; }
  }
  const r = o.apply(this, a);
  try { drawHi(); } catch (e) { err(e, 'hi'); }
  return r;
 });
 wrapG('drawTutorial', function (o, a) {
  const r = o.apply(this, a);
  try {
   const Tt = TT();
   if (Tt && Tt.doneT <= 0 && Tt.step === FSC) {   // the FAKES card (same look as the RULES / SETTINGS cards)
    const bw = W - 30, bh = 12 + CARD.length * 9;
    rect(15, 44, bw, bh, 'rgba(0,0,0,.82)');
    rect(15, 44, bw, 1, '#ff4a3a');
    CARD.forEach((l, i) => text(l, W / 2, 50 + i * 9, 1, i === 0 ? '#ff6a5a' : i % 2 ? '#ffffff' : '#ffe14d', 'center'));
   }
   if (Tt && Tt.step === FS && Tt.doneT <= 0 && SCR() === 'live') {
    const s = X.stage, h = s === 'arm' ? H1 : s === 'fake' ? H2 : s === 'shoot' ? H3 : '';
    if (h) { const y = 40, w = textW(h) + 8; rect(4, y, w, 10, 'rgba(0,0,0,.6)'); text(h, 8, y + 2, 1, s === 'shoot' ? '#7dff7a' : '#ffd23a'); }
   }
   if (Tt && Tt.step === FS && X.msg && rt() < X.msg.until) { const w = textW(X.msg.s, 1) + 10; rect(Math.round(W / 2 - w / 2), 56, w, 11, 'rgba(0,0,0,.78)'); text(X.msg.s, W / 2, 59, 1, X.msg.col, 'center'); }
  } catch (e) { err(e, 'draw'); }
  return r;
 });
 const RD0 = W0.render;
 W0.render = function () {
  const r = RD0.apply(this, arguments);
  try {
   if (!OFF()) domCards();
   if (!OFF() && btnShown()) {
    g.save();
    try { g.setTransform(RR, 0, 0, RR, 0, 0); g.globalAlpha = 1; drawBtn(); } finally { g.restore(); }
   }
  } catch (e) { err(e, 'render'); }
  return r;
 };
 W0.V521TF = { on: () => !OFF(), FSC: FSC, FS: FS, X: X, ST: ST, mine: () => !!mine(), arm: arm, fake: fake, btnShown: btnShown, circOn: circOn, mode: mode, tr: tr,
  test: { fake: name => { if (!arm('test')) return false; return fake(SH.circles().find(c => c.name === name), 'test'); } } };
})();
