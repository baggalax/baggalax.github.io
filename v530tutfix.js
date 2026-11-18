/* v530tutfix.js - BAGGA LAX 1.3: SHORTER MAIN TUTORIAL, PLAYBOOK HINT ON THE REAL (BOTTOM) BUTTON, BIG HIT ALWAYS LANDS.
 * Charlie (Nov 11, 11:39-11:43 PM): "In tutorial take out run guy over ball and chase the shot. Also it says tap playbook
 *  in the old spot it needs to move to the bottom now." / "Make sure the hit in the tutorial is actually gonna knock someone
 *  over every time" / "Get rid of the run it over midfield step" / "Remove playmaker from tutorial, still have them click
 *  playbook tho then just click out" / "Keep the playmaker tutorial inside of playmaker itself" / "add fake to tutorial".
 * What this does (MAIN track only, first-time tutorial):
 *  1) Steps taken out of the list: GROUND BALL (run your guy over the ball), CHASE (chase the missed shot), PLAYMAKER,
 *     CARRY IT OVER (run it over midfield). FAKES card + FAKE step (v521) stay right after SHOOTING.
 *  2) PLAYBOOK step: the pointing hand now taps the real PLAYBOOK button where it draws today (bottom row, V39PB.lastRect /
 *     the 'live|PLAYBOOK' hit spot) instead of the old top-left spot. Words: TAP PLAYBOOK (BOTTOM LEFT), THEN TAP OUT.
 *     Done = the playbook opened and then closed (back to the game). Picking a play still counts too.
 *  3) PLAYMAKER teaching lives inside PLAYMAKER: v404t's own HOW TO (animated hand, BACK / NEXT / GOT IT / X to skip)
 *     already opens by itself the first time each kind of playmaker is opened and is saved once (rl_pdhelp404). With the
 *     tutorial step gone nothing marks it seen early, so a new player gets it the first time they open PLAYMAKER.
 *  4) BIG HIT step: the hit always connects and knocks him down (run-up, from-behind and the dice are waved in this
 *     step only; he is pulled into reach when you are close). Normal games unchanged.
 *  5) Words follow the input (v468ctl inputMode): touch TAP, computer CLICK, controller names the buttons.
 * Skip / SKIP TUTORIAL / finish flags unchanged (finishing still sets the usual done flag; v521 still saves rl_fake507).
 * No new save keys. Ids, rl_* keys, net protocol untouched (the tutorial is offline only).
 * Kill switch: window.__rl_no530tf = true -> exactly as before. Test hook: window.V530TF.
 */
(function () {
 'use strict';
 const W0 = window;
 const OFF = () => !!(W0.__rl_no530tf || W0.__rl_v124gb);
 if (OFF()) return;
 if (typeof TUTX === 'undefined' || typeof tutList !== 'function' || typeof tutDone !== 'function') return;
 const ST = { errs: [], hits: [], snaps: 0, pbOpen: 0, pbClose: 0, hand: 0, txt: 0 };
 const err = (e, w) => { try { if (ST.errs.length < 10) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v530tf', w, e); } } catch (x) {} };
 const wrapG = (n, f) => { const o = W0[n]; if (typeof o !== 'function') return false; W0[n] = function () { return f.call(this, o, arguments); }; return true; };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const rt = () => performance.now() / 1e3;
 function mode() { try { const s = W0.__rl468; const m = s && s.inputMode ? s.inputMode() : 'touch'; return m === 'key' || m === 'pad' ? m : 'touch'; } catch (e) { return 'touch'; } }
 function TT() { const G = G0(), Tt = G && G.tutorial; return Tt && !Tt.complete && (Tt.track || 'main') === 'main' ? Tt : null; }

 // ---------------- 1) steps out of the main list ----------------
 const idx = n => TUTX.findIndex(r => r && r[0] === n);
 const PB = typeof TUT_PB_STEP !== 'undefined' ? TUT_PB_STEP : idx('PLAYBOOK');
 const HIT = (typeof TD !== 'undefined' && TD && TD.HIT != null) ? TD.HIT : idx('BIG HIT');
 const DROP = [];
 for (const [n, i] of [ [ 'GROUND BALL', 3 ], [ 'CHASE', 4 ], [ 'PLAYMAKER', 10 ], [ 'CARRY IT OVER', (typeof TC !== 'undefined' && TC && TC.CARRY) ] ]) {
  const k = i != null && TUTX[i] && TUTX[i][0] === n ? i : idx(n);
  if (k >= 0) DROP.push(k);
 }
 const cache = new WeakMap();
 wrapG('tutList', function (o, a) {
  const L = o.apply(this, a);
  try {
   if (OFF() || !Array.isArray(L)) return L;
   const G = G0(), tr0 = G && G.tutorial && G.tutorial.track || 'main';
   if (tr0 !== 'main') return L;
   let M = cache.get(L);
   if (!M) { M = L.filter(s => !DROP.includes(s)); cache.set(L, M); }
   // a save sitting on a dropped step (old in-progress tutorial) moves on to the next kept one
   const Tt = G && G.tutorial;
   if (Tt && !Tt.complete && DROP.includes(Tt.step)) {
    const i = L.indexOf(Tt.step);
    let nx = null;
    for (let j = i + 1; j < L.length; j++) if (!DROP.includes(L[j])) { nx = L[j]; break; }
    if (nx != null) { Tt.step = nx; Tt.doneT = 0; try { if (typeof tutSetup === 'function') setTimeout(() => { try { tutSetup(); } catch (e) { err(e, 'resetup'); } }, 0); } catch (e) {} }
   }
   return M;
  } catch (e) { err(e, 'list'); return L; }
 });

 // ---------------- 2) PLAYBOOK step ----------------
 const PBT = {
  touch: 'TAP PLAYBOOK (BOTTOM LEFT), THEN TAP OUT OF IT.',
  key: 'CLICK PLAYBOOK (BOTTOM LEFT), THEN CLICK OUT OF IT.',
  pad: 'PRESS SHARE / VIEW = PLAYBOOK, THEN O / B TO CLOSE IT.'
 };
 const PBT2 = { touch: 'NOW TAP BACK', key: 'NOW CLICK BACK', pad: 'NOW PRESS O / B' };
 const PBL = { touch: 'TAP PLAYBOOK', key: 'CLICK PLAYBOOK', pad: 'SHARE / VIEW' };
 const pbStep = () => { const Tt = TT(); return Tt && Tt.step === PB && !OFF() ? Tt : null; };
 function setPbText() {
  try { if (!pbStep() || !TUTX[PB]) return; const s = PBT[mode()]; if (TUTX[PB][1] !== s) { TUTX[PB][1] = s; ST.txt++; } } catch (e) { err(e, 'pbtxt'); }
 }
 // v39pb rewrites the row every frame inside drawPlaybookBtn; ours goes on right after it
 wrapG('drawPlaybookBtn', function (o, a) { const r = o.apply(this, a); setPbText(); return r; });
 wrapG('render', function (o, a) { setPbText(); return o.apply(this, a); });
 function pbRect() {
  try { const R = W0.V39PB && V39PB.lastRect; if (R && V39PB.mode && V39PB.mode !== 'v38') return { x: R[0], y: R[1], w: R[2], h: R[3] }; } catch (e) {}
  try { const s = (typeof uiSpecs !== 'undefined' && uiSpecs || []).find(q => q && q.label === 'PLAYBOOK' && /^live\|/.test(q.key || '')); if (s) return { x: s.x, y: s.y, w: s.w, h: s.h }; } catch (e) {}
  return null;
 }
 // open -> closed watcher (the playbook is a DOM panel; the canvas loop may not tick while it is up)
 setInterval(() => {
  try {
   const Tt = pbStep(); if (!Tt) return;
   const s = SCR();
   if (s === 'playbook' && !Tt.f.pb530open) { Tt.f.pb530open = 1; ST.pbOpen++; }
   if (Tt.f.pb530open && s === 'live' && !Tt.f.pb530shut) { Tt.f.pb530shut = 1; ST.pbClose++; }
  } catch (e) { err(e, 'pbwatch'); }
 }, 80);
 // controller: no pad button opens the playbook anywhere else, so on this step SHARE / VIEW (8) opens it, O / B (1) or SHARE closes
 const PADP = { prev: [] };
 function padPoll() {
  try {
   const Tt = pbStep();
   const gp = Tt && navigator.getGamepads ? [ ...navigator.getGamepads() ].find(p => p && p.connected) : null;
   if (!gp) { PADP.prev = []; return; }
   const cur = gp.buttons.map(b => !!(b && (b.pressed || b.value > .5)));
   const dn = i => cur[i] && !PADP.prev[i];
   const s = SCR();
   if (s === 'live' && dn(8) && Tt.doneT <= 0) { screen = 'playbook'; try { panelDirty(); } catch (e) {} ST.padOpen = (ST.padOpen || 0) + 1; }
   else if (s === 'playbook' && (dn(1) || dn(8))) { screen = 'live'; try { panelDirty(); } catch (e) {} ST.padClose = (ST.padClose || 0) + 1; }
   PADP.prev = cur;
  } catch (e) { err(e, 'pad'); }
 }
 setInterval(padPoll, 50);
 wrapG('tutDone', function (o, a) {
  if (!OFF() && a[0] === PB) { const Tt = TT(); if (Tt && Tt.f && Tt.f.pb530open && Tt.f.pb530shut) return true; }
  return o.apply(this, a);
 });
 // hand: v4012tut's own hand points at the old top-left spot on this step -> hide that one here, draw ours on the button
 const HAND = [ '...##......', '..#ww#.....', '..#ww#.....', '..#ww###...', '..#ww#ww##.', '###ww#ww#w#', '#ww#wwwww#w#', '#wwwwwwwwww#', '.#wwwwwwwww#', '..#wwwwwww#.', '...#wwwwww#.', '...#wwwwww#.', '...########.' ];
 const HCOL = { '#': '#0b1a20', w: '#ffe9c9' };
 function drawHand(x, y, down) {
  const ox = Math.round(x) - 3, oy = Math.round(y) + (down ? 0 : 2);
  g.save(); g.globalAlpha = .95;
  for (let r = 0; r < HAND.length; r++) { const row = HAND[r]; for (let c = 0; c < row.length; c++) { const ch = row[c]; if (ch !== '.') { g.fillStyle = HCOL[ch]; g.fillRect(ox + c, oy + r, 1, 1); } } }
  g.restore();
 }
 function pbHandOn() { const Tt = pbStep(); return !!Tt && Tt.doneT <= 0 && SCR() === 'live' && !(typeof paused !== 'undefined' && paused); }
 function drawPbHand() {
  const R = pbRect(); if (!R) return;
  const Tt = pbStep(), opened = Tt && Tt.f.pb530open;
  const cx = R.x + R.w / 2, cy = R.y + R.h / 2, p = rt() % 1.4 / 1.4, down = p > .3 && p < .6;
  // pulsing frame round the real button
  if (Math.floor(rt() * 3) % 2 === 0) { rect(R.x - 2, R.y - 2, R.w + 4, 1, '#ffe14d'); rect(R.x - 2, R.y + R.h + 1, R.w + 4, 1, '#ffe14d'); rect(R.x - 2, R.y - 2, 1, R.h + 4, '#ffe14d'); rect(R.x + R.w + 1, R.y - 2, 1, R.h + 4, '#ffe14d'); }
  // the hand comes from above, finger on the button
  const hy = down ? cy - 1 : cy - 6;
  drawHand(cx, hy - 2, down);
  const lab = opened ? PBT2[mode()] : PBL[mode()];
  const lw = textW(lab), lx = Math.round(Math.min(W - lw / 2 - 3, Math.max(lw / 2 + 3, cx))), ly = Math.round(R.y - 12);
  rect(lx - lw / 2 - 2, ly - 1, lw + 4, 8, 'rgba(0,0,0,.65)');
  text(lab, lx, ly, 1, '#ffe14d', 'center');
  ST.hand++;
 }
 if (!wrapG('drawTutBtns231', function (o, a) {
  if (!pbHandOn()) return o.apply(this, a);
  const was = W0.__rl_no4012hand;
  W0.__rl_no4012hand = true;
  let r;
  try { r = o.apply(this, a); } finally { W0.__rl_no4012hand = was; }
  try { drawPbHand(); } catch (e) { err(e, 'hand'); }
  return r;
 })) {
  wrapG('drawTutorial', function (o, a) { const r = o.apply(this, a); try { if (pbHandOn()) drawPbHand(); } catch (e) { err(e, 'hand2'); } return r; });
 }

 // ---------------- 4) BIG HIT always lands (tutorial step only) ----------------
 function hitStep() { const Tt = TT(); return !!Tt && Tt.step === HIT && !OFF(); }
 wrapG('dHit', function (o, a) {
  if (!hitStep()) return o.apply(this, a);
  const G = G0(), c = G && G.dcar, d = G && G.dctl;
  const saved = {}, swap = (n, f) => { if (typeof W0[n] === 'function') { saved[n] = W0[n]; W0[n] = f; } };
  const R0 = Math.random;
  try {
   if (c && d && G.ball && G.ball.state === 'held') {
    const R = (typeof DZ !== 'undefined' && DZ.hitR) || 14, dist = Math.hypot(c.x - d.x, c.y - d.y);
    if (dist > R * .8 && dist < R * 3.5 + 20) { const k = R * .7 / dist; d.x = c.x - (c.x - d.x) * k; d.y = c.y - (c.y - d.y) * k; ST.snaps++; }
    if (d.stun > 0) d.stun = 0;
   }
   swap('hasRunUp', () => true);
   swap('fromBehind', () => false);
   swap('hitChance', () => 99);
   swap('dLateTarget', () => null);
   swap('keeperInCrease', () => null);
   Math.random = () => R0() * .9;
   const r = o.apply(this, a);
   ST.hits.push(r);
   return r;
  } catch (e) { err(e, 'hit'); return 'none'; }
  finally { Math.random = R0; for (const n in saved) W0[n] = saved[n]; }
 });

 const HTAIL = / ?NO RUN-UP = (JUST )?A SHOVE\.?( GET MOVING FIRST\.?)?/;
 (function hookText() {
  const T0 = W0.text;
  if (typeof T0 !== 'function') return;
  W0.text = function (s) {
   if (typeof s === 'string' && HTAIL.test(s) && hitStep0()) {
    // translate for the computer / controller first (the inner text hooks know the full line), then drop the shove tail
    let r = s;
    if (mode() !== 'touch') { try { if (W0.V481TUT && V481TUT.tr) r = V481TUT.tr(r); } catch (e) {} try { const q = W0.__rl468; if (q && q.trTut) r = q.trTut(r); } catch (e) {} }
    const b = Array.from(arguments); b[0] = r.replace(HTAIL, '').trim(); if (!b[0]) return; return T0.apply(this, b);
   }
   return T0.apply(this, arguments);
  };
 })();
 function hitStep0() { const Tt = TT(); return !!Tt && Tt.step === HIT && !OFF(); }
 W0.V530TF = { ST: ST, DROP: DROP, PB: PB, HIT: HIT, mode: mode, pbRect: pbRect, PBT: PBT };
})();
