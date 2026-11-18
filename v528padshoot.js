/* v528padshoot.js - Bagga Lax: CONTROLLER L1 / R1 = BOTTOM CORNER FINISH + a clean CONTROLS -> CONTROLLER page (V41.3, ?v=5280).
   Charlie (Nov 11 2026, 11:29 PM): "L1 and R1 aren't working to shoot. They are supposed to be the bottom corners in the finish."
   Before this file L1 (button 4) and R1 (button 5) did nothing anywhere on a controller (v468ctl only names them in the rebind
   list; no default bind, menu, faceoff, defense or fake code reads them).
   Now, on OFFENSE with your guy holding the ball (screen 'live', canShoot):
    - Crease finish circles up (SHOT26.circlesOn - the 4 yellow circles near the cage):
        L1 = quick tap on the BOTTOM-LEFT circle, R1 = quick tap on the BOTTOM-RIGHT circle - the same circles keys 2 / 4 tap
        (v483pull), sent through the game's own inDown / inUp, so it is the game's own crease finish (corner, goalie, fake
        rolls in v507fake - fake one side then finish the other still beats the goalie).
        FAKE armed (TRIANGLE / Y, circles red): L1 / R1 fake to that bottom circle instead (V507FAKE.doFake), like tapping a
        red circle on touch. Then finish with L1 / R1 (or R2 as usual).
    - Farther out: L1 / R1 = an immediate shot at that same corner (engine corner 2 / 3, the corners those two circles finish
        in), through the SHOT26 cage-press path (press the cage at that corner's aim line, pull back, let go) so power /
        accuracy / goalie / pipe rules are the normal shot's. If SHOT26 does not take the press, releaseShot(held, corner).
   R2 hold + right stick aim is untouched. If you rebound PASS / SHOOT / R3 (cut) to L1 or R1 in CONTROLS, that button keeps
   your bind and this file leaves it alone. Defense, faceoffs, menus, settings: L1 / R1 still do nothing.
   Also: pad labels 'L1' / 'R1' drawn on the two bottom circles; CONTROLS -> CONTROLLER gets a FINISH block (right column)
   and its rows no longer overlap (the safe-area dodge was pushing each bottom-ish bind button up into the row above:
   the Settings band squeeze sa2403Band moved rows by different amounts, so rows 3-8 and FO SET stacked and PLAY hid under
   the CONTROLLER tab; this page now skips the squeeze and uses a 9 px row grid with DONE above the home bar); pad tutorial lines for crease finishes name L1 / R1.
   Controller menus (Charlie 11:36 PM): in a game / practice the pad's CROSS no longer presses the HUD's PAUSE / EXIT /
   SCHEME / TIMEOUT buttons between plays (that is what opened the menu right after a shot); OPTIONS opens the pause menu
   and resumes from it. 'OPTIONS TO EXIT' shows top right in practice while a controller is in use.
   Kill switch: window.__rl_no528ps = true. No storage, no net, no ids. */
(function () {
 'use strict';
 if (window.__rl_no528ps) return;
 const off = () => !!window.__rl_no528ps;
 const BTN = [ 4, 5 ];
 const CIRC = { 4: 'BOTTOM-LEFT', 5: 'BOTTOM-RIGHT' };
 const LBL = { 4: 'L1', 5: 'R1' };
 const K = { pull: 72, held: .9 };   // far shot: 72 logical px pull = SHOT26 power .15 + .85 * 72 / 90 = .83
 const S = { on: false, prev: {}, n: 0, finishes: 0, fakes: 0, shots: 0, last: null, log: [] };
 window.__rl528 = S; S.K = K;
 const st = () => window.__rl468 || null;
 const SH = () => window.SHOT26 || null;
 const T = () => performance.now() / 1e3;
 const note = (k, v) => { S.last = { k: k, v: v, t: +T().toFixed(2) }; S.log.push(S.last); if (S.log.length > 40) S.log.shift(); };
 function pads() { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected !== false); } catch (e) { return []; } }
 const pressed = (p, i) => { const b = p.buttons[i]; return !!(b && (typeof b === 'object' ? b.pressed || b.value > .5 : b > .5)); };
 function pb() { try { return window.V468CTL && V468CTL.pb ? V468CTL.pb() : { pass: 0, shoot: 7, hit: 11 }; } catch (e) { return { pass: 0, shoot: 7, hit: 11 }; } }
 function free(i) { const b = pb(); return b.pass !== i && b.shoot !== i && b.hit !== i; }
 function padMode() { try { const x = st(); return !!(x && x.inputMode && x.inputMode() === 'pad'); } catch (e) { return false; } }
 function why() {
  try {
   const x = st();
   if (window.__rl_no468ctl || !x) return 'no468';
   if (x.open) return 'settings';
   if (screen !== 'live' || !game || !gameInputOn() || !canShoot() || game.ball.state !== 'held') return 'state ' + screen + ' ' + (game && game.ball ? game.ball.state : '-');
   if (game.over || game.pset) return 'over';
   const tut = game.tutorial;
   if (tut && !tut.complete && typeof tutIsCard === 'function' && tutIsCard(tut.step)) return 'tutcard';
   if (x.P && (x.P.shot || x.P.cutSent)) return 'r2/r3 busy';   // an R2 wind-up / an R3 cut is in progress
   const s = SH(); if (s && s.S && s.S.aim) return 'aim held';   // some other aim is already held
   return '';
  } catch (e) { return 'err'; }
 }
 const ready = () => !why();
 S.why = why;
 function circlesLive() { try { const s = SH(); return !!(s && s.on() && s.circlesOn()); } catch (e) { return false; } }
 const cssAt = (lx, ly) => { const r = cv.getBoundingClientRect(); return { clientX: r.left + lx * r.width / W, clientY: r.top + ly * r.height / H, preventDefault() {}, pointerType: 'pad528' }; };
 function tapCircle(i) {
  const s = SH(), q = s.circles().find(c => c.name === CIRC[i]); if (!q) return false;
  const F = window.V507FAKE && V507FAKE.on && V507FAKE.on() ? V507FAKE.F : null;
  if (F && F.armed && typeof V507FAKE.doFake === 'function') {
   const ok = V507FAKE.doFake(q, 'pad528') !== false;
   if (ok) S.fakes++;
   note('fake', { btn: LBL[i], q: q.name, ok: ok });
   return ok;
  }
  const ev = cssAt(q.x - Math.round(camX), q.y);
  inDown('pad528', ev);
  const pt = typeof pointers !== 'undefined' && pointers.get ? pointers.get('pad528') : null;
  if (pt && pt.stale) { inUp('pad528', ev, true); note('finish', { btn: LBL[i], locked: true }); return false; }
  inUp('pad528', ev, false);
  const b = game.ball, ok = b.state === 'shot';
  if (ok) S.finishes++;
  note('finish', { btn: LBL[i], q: q.name, corner: q.corner, ball: b.state, shotCorner: b.corner, ty: b.target ? +b.target.y.toFixed(1) : null, type: b.s25 && b.s25.type || null });
  return ok;
 }
 function farShot(i) {
  const s = SH(), c = game.carrier, corner = i === 4 ? 2 : 3;
  let via = 'direct';
  if (s && s.on() && s.corners && s.relPt) {
   const q = s.corners(s.relPt(c)).find(o => o.corner === corner);
   if (q) {
    const wy0 = Math.max(CY - MOUTH - 1, Math.min(CY + MOUTH + 1, q.by));
    const lx = GX + 2 - Math.round(camX), ly = Math.round(wy0);
    inDown('pad528s', cssAt(lx, ly));
    const pt = typeof pointers !== 'undefined' && pointers.get ? pointers.get('pad528s') : null;
    if (pt && pt.stale) { try { inUp('pad528s', cssAt(lx, ly), true); } catch (e) {} note('shot', { btn: LBL[i], locked: true }); return false; }   // the game's own input lock (right after a play): touch is ignored too
    if (pt && pt.role === 'shot26' && s.S.aim) {
     const ty = ly + (q.by - ly) / (s.CFG.vert || .5);
     inMove('pad528s', cssAt(lx - K.pull, ty));
     inUp('pad528s', cssAt(lx - K.pull, ty), false);
     via = 'shot26';
    } else { try { inUp('pad528s', cssAt(lx, ly), true); } catch (e) {} }
   }
  }
  if (via === 'direct' && canShoot()) { try { releaseShot(K.held, corner); } catch (e) { console.warn('v528 shot', e); } }
  const b = game.ball, ok = b.state === 'shot';
  if (ok) S.shots++;
  note('shot', { btn: LBL[i], via: via, want: corner, ball: b.state, shotCorner: b.corner, ty: b.target ? +b.target.y.toFixed(1) : null });
  return ok;
 }
 function act(i) {
  const w = why(); if (w) { note('skip', { btn: LBL[i], why: w }); return false; }
  S.n++;
  try { return circlesLive() ? tapCircle(i) : farShot(i); } catch (e) { console.warn('v528 pad', e); return false; }
 }
 function poll() {
  if (off()) { S.on = false; return; }
  const ps = rawPads();
  if (!ps.length) { S.on = false; S.prev = {}; return; }
  requestAnimationFrame(poll);
  try {
   const p = ps[0];
   if (padTick(p)) { for (const i of BTN) S.prev[i] = pressed(p, i); return; }
   for (const i of BTN) {
    const cur = pressed(p, i);
    if (cur && !S.prev[i] && free(i)) act(i);
    S.prev[i] = cur;
   }
  } catch (e) { console.warn('v528 poll', e); }
 }
 function start() { if (S.on || off() || !pads().length) return; S.on = true; S.prev = {}; note('pad', 'on'); requestAnimationFrame(poll); }
 window.addEventListener('gamepadconnected', start);
 S.start = start; S.act = act;

 // ---- 'L1' / 'R1' on the two bottom crease circles (controller only) ----
 const DP = window.drawPlayers;
 if (typeof DP === 'function') {
  window.drawPlayers = function () {
   const r = DP.apply(this, arguments);
   try {
    if (!off() && padMode() && ready() && circlesLive()) {
     const s = SH();
     for (const i of BTN) { if (!free(i)) continue; const q = s.circles().find(c => c.name === CIRC[i]); if (q) text(LBL[i], q.x + .5, q.y - 2, 1, '#0b1a20', 'center'); }
    }
   } catch (e) {}
   return r;
  };
 }

 // ---- pad tutorial lines for crease finishes ----
 const TUT = {
  'CREASE FINISHES: QUICK TAP A YELLOW CIRCLE': 'CREASE FINISHES: L1 / R1 = BOTTOM CORNERS',
  'QUICK TAP A CIRCLE = YOU FINISH IN THAT CORNER. NO PULL-BACK NEEDED.': 'L1 = BOTTOM LEFT, R1 = BOTTOM RIGHT. TOP CORNERS: R2 + RIGHT STICK UP.',
  'TAP A CIRCLE QUICKLY - NO PULL-BACK': 'PRESS L1 OR R1 - NO PULL-BACK',
  'QUICK TAP A CIRCLE = YOU FINISH IN THAT CORNER. NO PULL-BACK NEEDED': 'L1 = BOTTOM LEFT, R1 = BOTTOM RIGHT. NO PULL-BACK NEEDED'
 };
 function tr(s) {
  if (typeof s !== 'string' || !TUT[s] || off() || window.__rl_no468ctl) return s;
  try { const x = st(); if (!x || !x.tutMode || x.tutMode() !== 'pad' || !free(4) || !free(5)) return s; } catch (e) { return s; }
  return TUT[s];
 }

 // ---- CONTROLS -> CONTROLLER page: re-space the rows, add FINISH ----
 // v468 draws rows at y = 66 + i * 10 (h 9) and DONE at 158 (h 18); v522 adds PICK at row 8; v472 puts TOUCH: ... left of
 // DONE and two lines right of it. With a bottom safe area the game's button() dodge (sa2403Dy) lifts each low button by up
 // to its overlap with the home bar, so rows 5-8 slid into each other and FO SET into MOVE PICKED. Here (pad tab only) every
 // y is mapped onto a 9 px grid (rows 66..146) and the bottom row to 150 (h 13), all above a ~15 px home bar, so nothing lifts.
 const L = { y0: 66, rs: 9, rh: 8, by: 150, bh: 13 };
 let remap = false, inBtn = 0;
 function rowY(y, off0) { const i = Math.round((y - 66 - off0) / 10); return { i: i, y: L.y0 + i * L.rs + off0 }; }
 function wrapDraw() {
  const B0 = window.button, T0 = window.text, W0 = window.textW;
  if (typeof B0 !== 'function' || typeof T0 !== 'function') return false;
  window.button = function (label, x, y, w, h) {
   if (remap && !inBtn && typeof y === 'number') {
    const a = Array.from(arguments);
    if (y >= 64 && y < 157 && h <= 10) { a[2] = rowY(y, 0).y; a[4] = L.rh; }
    else if (y >= 157 && y < 170) { a[2] = L.by; a[4] = L.bh; }
    inBtn++; try { return B0.apply(this, a); } finally { inBtn--; }
   }
   inBtn++; try { return B0.apply(this, arguments); } finally { inBtn--; }
  };
  window.text = function (s, x, y) {
   if (typeof s === 'string' && TUT[s]) { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return T0.apply(this, b); } }
   if (remap && !inBtn && typeof y === 'number') {
    const a = Array.from(arguments);
    if (y >= 66 && y < 157) a[2] = rowY(y, 2).y;
    else if (y >= 157 && y < 175) a[2] = y - 8;
    return T0.apply(this, a);
   }
   return T0.apply(this, arguments);
  };
  if (typeof W0 === 'function') window.textW = function (s) { if (typeof s === 'string' && TUT[s]) { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return W0.apply(this, b); } } return W0.apply(this, arguments); };
  return true;
 }
 function padName(i) { try { return V468CTL.padName(i); } catch (e) { return i === 4 ? 'L1 / LB' : 'R1 / RB'; } }
 function drawFinish() {
  const x0 = 8, gw = W - 16, cw = Math.floor((gw - 6) / 2), xr = x0 + cw + 6, y = L.y0 + 4 * L.rs + 4;
  T0d('FINISH (NEAR THE CAGE)', xr, y, '#ffe14d');
  const row = (i, k) => T0d((i === 4 ? 'BOTTOM LEFT: ' : 'BOTTOM RIGHT: ') + (free(i) ? padName(i) : 'OFF (BUTTON IN USE)'), xr + 3, y + 9 + k * L.rs, '#8fe3f0');
  row(4, 0); row(5, 1);
  T0d('FAR OUT: SAME CORNER SHOT', xr + 3, y + 9 + 2 * L.rs, '#cfe');
  T0d('MENU / SUBS / SET: OPTIONS', xr + 3, y + 9 + 3 * L.rs, '#ffe14d');
 }
 let T0d = (s, x, y, c) => text(s, x, y, 1, c);
 function wrapSettings() {
  const DS0 = window.drawSettings;
  if (typeof DS0 !== 'function') return;
  window.drawSettings = function () {
   const x = st();
   const on = !off() && !window.__rl_no468ctl && x && x.open && x.tab === 'pad' && pads().length > 0;
   if (!on) return DS0.apply(this, arguments);
   // the Settings band squeeze (sa2403Band: y >= 58 up 6, >= 88 up 10, >= 116.5 up 12, >= 127 up 17 ...) is what
   // stacked these rows; this page gets its own grid instead, kept above the home bar by button()'s own dodge.
   const sb = window.SA2403B;
   remap = true; window.SA2403B = null;
   let r;
   try { r = DS0.apply(this, arguments); } finally { remap = false; window.SA2403B = sb; }
   try { if (x.open && x.tab === 'pad') { window.SA2403B = null; try { drawFinish(); } finally { window.SA2403B = sb; } } } catch (e) {}
   return r;
  };
 }


 // ---- in-game menus on a controller: OPTIONS only ----
 // Charlie (11:36 PM): "in practice after I shoot with controller the menu screen opens cuz it's with the same buttons."
 // Cause: between plays (screen 'banner' after a shot / goal, 'cpu', 'pregame' ...) v468ctl hands the pad to v500v13's
 // menu navigator, and its CROSS (= pass) press clicks the first canvas button on screen - the HUD's PAUSE / EXIT / SCHEME
 // (practice) or TIMEOUT (games). So a CROSS right after a shot opened a menu. Now, while a game is on, the HUD buttons are
 // hidden from that navigator; the only way into a menu on a pad is OPTIONS.
 // Charlie (11:44 PM): "For PS controller you can't access buttons like sub, set, playbook, so have the OPTIONS button freeze
 // the game and then your joystick goes through those buttons." OPTIONS (button 9) in any match / practice: offline the game
 // freezes (the game's own pause); online nothing is frozen for the other player, the list just opens. The list is built from
 // the on-screen buttons that exist right now (OFFENSE SET, DEFENSE MAN / ZONE, PLAYBOOK, SUB, TIMEOUT, COACH, SCHEME, EXIT,
 // CHIRP, CLIP ...) plus RESUME, SETTINGS and QUIT. Left stick / D-pad moves the highlight, CROSS picks (it presses that very
 // button, so it opens exactly what a tap opens), CIRCLE or OPTIONS resumes. While the list is open every other pad reader
 // sees a released pad (no passes / shots / fakes leak through), and stays masked until the buttons are let go.
 // In a panel a pick opened (timeout / subs / playbook): stick + CROSS already work (v500v13); CIRCLE now backs out.
 // Hints while a controller is in use: 'OPTIONS TO EXIT' (practice), 'OPTIONS: MENU' (matches).
 const HUD = { PAUSE: 1, TIMEOUT: 1, EXIT: 1, SCHEME: 1, FAKE: 1, 'OFFENSE SET': 1, 'DEFENSE MAN ZONE': 1, PLAYBOOK: 1, SUB: 1, CHIRP: 1, CLIP: 1, COACH: 1 };
 const NAME = { 'OFFENSE SET': 'OFFENSE SET', 'DEFENSE MAN ZONE': 'DEFENSE: MAN / ZONE', PLAYBOOK: 'PLAYBOOK', SUB: 'SUBS', TIMEOUT: 'TIMEOUT', COACH: 'COACH', SCHEME: 'THEIR SCHEME', EXIT: 'EXIT PRACTICE', CHIRP: 'CHIRP', CLIP: 'SAVE CLIP' };
 const SKIPM = { PAUSE: 1, FAKE: 1, RESUME: 1, SETTINGS: 1, 'QUIT TO MENU': 1, MUTE: 1 };
 const isPaused = () => { try { return typeof paused !== 'undefined' && !!paused; } catch (e) { return false; } };
 function panelOpen() { const p = document.getElementById('panel'); return !!(p && p.style.display && p.style.display !== 'none'); }
 function inGame() { try { return !!game && typeof GAME_SCREENS !== 'undefined' && GAME_SCREENS.includes(screen) && screen !== 'final'; } catch (e) { return false; } }
 function hudOn() { return inGame() && !isPaused() && !panelOpen(); }
 function online() { try { const G = game; return !!(G && (G.online || (G.meta && G.meta.online) || (window.RLNET && RLNET.inGame))); } catch (e) { return false; } }
 function hbs(lbl) { const ui = document.getElementById('ui'); return ui ? Array.from(ui.querySelectorAll('button.hb')).filter(b => b.getBoundingClientRect().width > 1 && (!lbl || b.getAttribute('aria-label') === lbl)) : []; }
 function clickHb(lbl) { const b = hbs(lbl)[0]; if (!b) return false; b.click(); return true; }
 const M = { el: null, items: [], i: 0, froze: false, navT: 0, dir: '', mask: false, opened: 0, picks: 0 };
 S.menu = M;
 // other pad readers (v468ctl, v522, v507, v521) see a released pad while the list is open
 const GP0 = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : null;
 function rawPads() { try { return Array.from(GP0 ? GP0() : []).filter(p => p && p.connected !== false); } catch (e) { return []; } }
 function maskPad(p) {
  if (!p) return p;
  const z = { pressed: false, touched: false, value: 0 };
  return { id: p.id, index: p.index, connected: p.connected, mapping: p.mapping, timestamp: p.timestamp, axes: (p.axes || []).map(() => 0), buttons: (p.buttons || []).map(() => z), vibrationActuator: p.vibrationActuator };
 }
 try {
  if (GP0) navigator.getGamepads = function () { const a = GP0(); if (!M.mask || off()) return a; return Array.from(a).map(p => p ? maskPad(p) : p); };
 } catch (e) {}
 function css() {
  if (document.getElementById('v528css')) return;
  const s = document.createElement('style'); s.id = 'v528css';
  s.textContent = '#v528menu{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation}' +
   '#v528menu .bx{background:#14222b;border-top:2px solid #ffd23a;box-shadow:0 3px 0 #000;padding:8px 12px 9px;min-width:210px;max-width:92vw;max-height:92vh;overflow:auto}' +
   '#v528menu .hd{color:#ffd23a;font-size:14px;text-shadow:2px 2px 0 #000;text-align:center;margin-bottom:2px}#v528menu .sb{color:#8fe3f0;text-align:center;margin-bottom:6px;font-size:10px}' +
   '#v528menu button{display:block;width:100%;margin:3px 0;font:inherit;font-size:12px;border:0;border-radius:0;padding:5px 10px;background:#3a4a55;color:#cfe;text-align:left;cursor:pointer;box-shadow:0 2px 0 #000;text-transform:uppercase}' +
   '#v528menu button.on{background:#ffd23a;color:#0b1a20;outline:2px solid #fff;outline-offset:1px}#v528menu button.q{background:#5a2a2a;color:#ffcfc8}#v528menu button.q.on{background:#ff8a7a;color:#0b1a20}';
  document.head.appendChild(s);
 }
 function buildItems() {
  const out = [ { k: 'RESUME', t: 'RESUME' } ], seen = {};
  for (const b of hbs()) {
   const l = b.getAttribute('aria-label') || '';
   if (!l || seen[l] || SKIPM[l] || /^SOUND|^MUSIC/.test(l)) continue;
   if (!HUD[l] && !NAME[l]) continue;
   seen[l] = 1; out.push({ k: l, t: NAME[l] || l });
  }
  if (!online()) out.push({ k: 'SETTINGS', t: 'SETTINGS', paused: true });
  if (!(game && game.practice)) out.push({ k: 'QUIT TO MENU', t: 'QUIT TO MENU', paused: true, q: true });
  return out;
 }
 const CYCLE = { 'OFFENSE SET': 1, 'DEFENSE MAN ZONE': 1 };
 function label(it) {
  try {
   if (it.k === 'OFFENSE SET') return 'OFFENSE SET: ' + (game.pen && game.pen.side === 'C' ? 'EMO' : String(game.oset || ''));
   if (it.k === 'DEFENSE MAN ZONE') return 'DEFENSE: ' + (typeof dsetLabel === 'function' ? dsetLabel(game) : String(game.dset || ''));
  } catch (e) {}
  return it.t;
 }
 function render() {
  if (!M.el) return;
  const bx = M.el.querySelector('.bx');
  bx.innerHTML = '';
  const h = document.createElement('div'); h.className = 'hd'; h.textContent = M.froze ? 'PAUSED' : 'MENU'; bx.appendChild(h);
  const sb = document.createElement('div'); sb.className = 'sb'; sb.textContent = 'STICK = MOVE  X = PICK  O / OPTIONS = BACK'; bx.appendChild(sb);
  M.items.forEach((it, j) => {
   const b = document.createElement('button'); b.type = 'button'; b.textContent = label(it) + (CYCLE[it.k] ? '  >' : ''); b.dataset.k = it.k;
   b.className = (j === M.i ? 'on' : '') + (it.q ? ' q' : '');
   b.addEventListener('click', e => { e.stopPropagation(); M.i = j; pick(); });
   bx.appendChild(b);
   if (j === M.i) try { b.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  });
 }
 function openMenu() {
  if (M.el) return;
  css();
  M.items = buildItems(); M.i = 0; M.opened++;
  M.froze = false;
  if (!online()) { try { paused = true; M.froze = true; } catch (e) {} }
  const d = document.createElement('div'); d.id = 'v528menu';
  const bx = document.createElement('div'); bx.className = 'bx'; d.appendChild(bx);
  d.addEventListener('click', e => { if (e.target === d) closeMenu(true); });
  document.body.appendChild(d); M.el = d; M.mask = true;
  // the press that opened the list must not also close it: start the edge reader from the pad as it is now
  try { const p = rawPads()[0]; S.mprev = {}; if (p) for (const i of [ 0, 1, 9, 12, 13 ]) S.mprev[i] = pressed(p, i); else S.mprev[9] = true; } catch (e) { S.mprev = { 9: true }; }
  render();
  note('menu', { open: true, froze: M.froze, items: M.items.map(x => x.k) });
 }
 function closeMenu(resume) {
  if (M.el) { M.el.remove(); M.el = null; }
  if (resume && M.froze) { try { paused = false; } catch (e) {} }
  M.froze = false;
  // keep other readers masked until every button / stick is let go, so the closing press never reaches the game
  note('menu', { open: false, resume: !!resume });
 }
 function pick() {
  const it = M.items[M.i]; if (!it) return;
  M.picks++;
  note('pick', { k: it.k });
  if (it.k === 'RESUME') return closeMenu(true);
  if (CYCLE[it.k]) { const ok = clickHb(it.k); note('picked', { k: it.k, ok: ok, now: label(it) }); render(); return; }   // cycles in place (X again = next)
  if (it.paused) { closeMenu(false); try { paused = true; } catch (e) {} requestAnimationFrame(() => requestAnimationFrame(() => { const ok = clickHb(it.k); note('picked', { k: it.k, ok: ok, scr: screen }); })); return; }
  closeMenu(true);
  // the on-screen button re-registers on the next unpaused frame; press that very button
  requestAnimationFrame(() => requestAnimationFrame(() => { const ok = clickHb(it.k); note('picked', { k: it.k, ok: ok, scr: screen, panel: panelOpen() }); }));
 }
 function menuNav(p) {
  const prev = S.mprev || {}, cur = {};
  for (const i of [ 0, 1, 9, 12, 13 ]) cur[i] = pressed(p, i);
  const down = i => cur[i] && !prev[i];
  S.mprev = cur;
  let dy = 0;
  if (down(12)) dy = -1; else if (down(13)) dy = 1;
  else {
   const ly = p.axes[1] || 0, t = performance.now();
   if (Math.abs(ly) > .55) { const d = ly < 0 ? 'u' : 'd'; if (d !== M.dir || t - M.navT > 220) { M.dir = d; M.navT = t; dy = d === 'u' ? -1 : 1; } } else M.dir = '';
  }
  if (dy && M.items.length) { M.i = (M.i + dy + M.items.length) % M.items.length; render(); }
  if (down(0)) { pick(); return; }
  if (down(1) || down(9)) closeMenu(true);
 }
 function optionsPress() {
  try {
   const x = st();
   if (window.__rl_no468ctl || (x && x.open)) return;
   if (game && game.tutorial && !game.tutorial.complete) return;   // v468ctl: OPTIONS steps tutorial cards
   if (M.el) return closeMenu(true);
   if (!inGame()) return;
   if (panelOpen()) return;
   if (isPaused()) { const ok = clickHb('RESUME'); note('options', { resume: ok }); return; }   // the game's own pause screen
   openMenu();
  } catch (e) { console.warn('v528 options', e); }
 }
 function panelBack() {
  const p = document.getElementById('panel'); if (!p) return false;
  const bs = Array.from(p.querySelectorAll('button, [data-a]')).filter(b => b.getBoundingClientRect().width > 1);
  const b = bs.find(e => /^(RESUME|BACK|DONE|CLOSE|X)$/i.test((e.textContent || '').trim())) || bs.find(e => /RESUME|BACK|DONE|CLOSE/i.test(e.textContent || ''));
  if (!b) return false;
  b.click(); note('panelBack', { t: (b.textContent || '').trim().slice(0, 20) });
  return true;
 }
 S.optionsPress = optionsPress; S.hudOn = hudOn; S.openMenu = openMenu; S.closeMenu = closeMenu;

 // ---- canvas pickers on a pad (the SUB screen: v425sp / v421s draw it on the canvas, its chips are canvas hit areas) ----
 // Stick / D-pad moves a yellow frame between the chips, CROSS taps the framed chip, CIRCLE closes (its X chip).
 const CN = { key: '', el: null, dir: '', navT: 0, prev: {}, on: false };
 S.cn = CN;
 function cnTargets() {
  return hbs().filter(b => { const k = b.dataset.k || ''; const l = b.getAttribute('aria-label') || ''; return /\|(SUB421|SP425) /.test(k) && !/PANEL|SP425 ALL|SP425 P /.test(k) && l !== 'SUB PANEL'; });
 }
 const keyOf = b => (b.dataset.k || '').replace(/^[^|]*\|/, '');
 function cnFrame(b) {
  if (!CN.el) { CN.el = document.createElement('div'); CN.el.id = 'v528focus'; CN.el.style.cssText = 'position:fixed;pointer-events:none;z-index:60;border:2px solid #ffd23a;box-shadow:0 0 0 1px #000,0 0 6px #ffd23a;border-radius:2px'; document.body.appendChild(CN.el); }
  if (!b) { CN.el.style.display = 'none'; return; }
  const r = b.getBoundingClientRect();
  Object.assign(CN.el.style, { display: 'block', left: (r.left - 2) + 'px', top: (r.top - 2) + 'px', width: r.width + 'px', height: r.height + 'px' });
 }
 function cnMove(ts, dx, dy) {
  const cur = ts.find(b => keyOf(b) === CN.key);
  if (!cur) return ts[0];
  const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  let best = null, bs = 1e9;
  for (const b of ts) {
   if (b === cur) continue;
   const r = b.getBoundingClientRect(), vx = r.left + r.width / 2 - ax, vy = r.top + r.height / 2 - ay;
   const along = vx * dx + vy * dy, side = Math.abs(vx * dy) + Math.abs(vy * dx);
   if (along <= 2) continue;
   const sc = along + side * 2.5;
   if (sc < bs) { bs = sc; best = b; }
  }
  return best || cur;
 }
 function cnTick(p) {
  const ts = cnTargets();
  if (!ts.length) { if (CN.on) { CN.on = false; CN.key = ''; cnFrame(null); note('cn', { on: false }); } return false; }
  const cur = {}; for (const i of [ 0, 1, 9, 12, 13, 14, 15 ]) cur[i] = pressed(p, i);
  if (!CN.on) { CN.on = true; CN.prev = cur; const first = ts.find(b => /^SUB421 OFF |^SP425 L /.test(keyOf(b))) || ts[0]; CN.key = keyOf(first); note('cn', { on: true, n: ts.length }); }
  const was = CN.prev || {};
  const down = i => cur[i] && !was[i];
  CN.prev = cur;
  let dx = 0, dy = 0;
  if (down(12)) dy = -1; else if (down(13)) dy = 1; else if (down(14)) dx = -1; else if (down(15)) dx = 1;
  else {
   const ax = p.axes[0] || 0, ay = p.axes[1] || 0, t = performance.now();
   if (Math.hypot(ax, ay) > .55) {
    const d = Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? 'l' : 'r') : (ay < 0 ? 'u' : 'd');
    if (d !== CN.dir || t - CN.navT > 230) { CN.dir = d; CN.navT = t; if (d === 'l') dx = -1; else if (d === 'r') dx = 1; else if (d === 'u') dy = -1; else dy = 1; }
   } else CN.dir = '';
  }
  if (dx || dy) { const b = cnMove(ts, dx, dy); if (b) CN.key = keyOf(b); }
  let f = ts.find(b => keyOf(b) === CN.key); if (!f) { f = ts.find(b => /^(SP425|SUB421) ON /.test(keyOf(b))) || ts.find(b => /^SP425 L |^SUB421 OFF /.test(keyOf(b))) || ts[0]; CN.key = keyOf(f); }
  cnFrame(f);
  if (down(0)) { note('cnPick', { k: CN.key }); f.click(); }
  else if (down(1) || down(9)) { const x = ts.find(b => keyOf(b) === 'SUB421 X' || keyOf(b) === 'SP425 X'); note('cnBack', { ok: !!x }); if (x) x.click(); }
  M.mask = true;   // the game sees a released pad while a picker is up
  return true;
 }
 function padTick(p) {
  // OPTIONS / CIRCLE handling, menu nav, unmask once released (runs inside the L1 / R1 poll)
  const o9 = pressed(p, 9), c1 = pressed(p, 1);
  if (M.el) { menuNav(p); S.prev[9] = o9; S.prev[1] = c1; return true; }
  if (cnTick(p)) { S.prev[9] = o9; S.prev[1] = c1; return true; }
  if (M.mask && !p.buttons.some((b, i) => pressed(p, i)) && Math.hypot(p.axes[0] || 0, p.axes[1] || 0) < .3 && Math.hypot(p.axes[2] || 0, p.axes[3] || 0) < .3) M.mask = false;
  if (o9 && !S.prev[9]) optionsPress();
  if (c1 && !S.prev[1] && game && panelOpen() && inGame() === false && /timeout|lineup|playbook|penalty|coachPick/.test(String(screen))) panelBack();
  S.prev[9] = o9; S.prev[1] = c1;
  return M.mask;
 }
 function wrapMenu() {
  const M0 = window.__rl500menu;
  if (typeof M0 !== 'function' || M0.__v528) return;
  const M1 = function (p, L, edge) {
   if (off()) return M0.apply(this, arguments);
   if (M.el || M.mask) return;   // our list is open (or its closing press is still held)
   if (!hudOn()) return M0.apply(this, arguments);
   const hide = hbs().filter(b => HUD[b.getAttribute('aria-label')] && !b.disabled);
   hide.forEach(b => { b.disabled = true; });
   try { return M0.apply(this, arguments); } finally { hide.forEach(b => { b.disabled = false; }); }
  };
  M1.__v528 = true;
  window.__rl500menu = M1;
 }
 const DH = window.drawHUD;
 if (typeof DH === 'function') {
  window.drawHUD = function () {
   const r = DH.apply(this, arguments);
   try {
    if (!off() && game && rawPads().length && padMode() && GAME_SCREENS.includes(screen) && screen !== 'final' && !M.el) {
     const s = game.practice ? 'OPTIONS TO EXIT' : 'OPTIONS: MENU', w = textW(s, 1), y = 28;
     rect(W - w - 8, y - 2, w + 6, 9, 'rgba(0,0,0,.72)');
     text(s, W - 5, y, 1, '#ffe14d', 'right');
    }
   } catch (e) {}
   return r;
  };
 }
 wrapDraw();
 wrapSettings();
 wrapMenu();
 setTimeout(wrapMenu, 0);
 if (pads().length) start();
})();
