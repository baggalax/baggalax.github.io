/* v468ctl.js - Bagga Lax CONTROLS section in Settings + controller play (V41.3, ?v=4068).
   1) Settings: AUTO SWITCH DEFENDER, AUTO CHIRP and AUTO CELLY leave the right column of SETTINGS and
      live in a new CONTROLS panel (same storage: SET171.autoSw / set171Save, V17.autoChirp, V17.autoCelly).
      CHIRPS stays in Settings; a big CONTROLS button takes the freed space.
   2) CONTROLS panel: title, one sentence, the three toggles, then (keyboard/mouse only) KEYS binds and
      (only with a gamepad connected) CONTROLLER binds, RESET, one big DONE. Phones see the toggles only.
      Key binds are stored in rl_binds467 (read by v467keys.js), pad binds in rl_pad468. Tap an action,
      press a key (or pad button) to rebind; Esc cancels; a bind already in use swaps.
   3) Controller play (standard mapping): polls navigator.getGamepads() in a rAF loop only while a pad is
      connected. Every input calls the game's own touch functions: setRun (LS), classifySwipe -> doDodge
      (RS gesture), throwPass (CROSS), the SHOT26 cage drag via inDown/inMove/inUp (hold R2, RS aims),
      dSwitchTo / dCheck / dHit on defense, and the faceoff touch path (inDown/inMove/inUp on the
      player, FO_DOWN_BTN and FO_BTN) for pick / move / set / tap / pull.
   4) Keyboard faceoff (v467 only covers live/defense): move keys pick, dodge keys move the picked
      player, SET key (Space) sets / taps, move keys on the whistle pull - same faceoff touch path.
   5) Tutorial text follows the input in use (touch text untouched).
   Kill switch: window.__rl_no468ctl = true (old Settings, no pad, no keyboard faceoff). */
(function () {
 'use strict';
 if (window.__rl_no468ctl) return;
 const KB_KEY = 'rl_binds467', PAD_KEY = 'rl_pad468';
 const KDEF = { up: 'w', left: 'a', down: 's', right: 'd', splitL: 'ArrowLeft', splitR: 'ArrowRight', swim: 'ArrowUp', toe: 'ArrowDown', check: 'Shift', foSet: ' ' };
 const PDEF = { pass: 0, shoot: 7, sw: 0, check: 2, hit: 11, foSet: 2 };
 const PGRP = { pass: 'o', shoot: 'o', sw: 'd', check: 'd', hit: 'd', foSet: 'f' };
 const PADN = [ 'CROSS / A', 'CIRCLE / B', 'SQUARE / X', 'TRIANGLE / Y', 'L1 / LB', 'R1 / RB', 'L2 / LT', 'R2 / RT', 'SHARE / BACK', 'OPTIONS / START', 'L3 / LS', 'R3 / RS', 'D-PAD UP', 'D-PAD DOWN', 'D-PAD LEFT', 'D-PAD RIGHT', 'PS / HOME' ];
 const st = { open: false, tab: 'keys', cap: null, mode: null, sawKey: false, sawMouse: false, lastDraw: 0, padOn: false, pad: null, log: [], last: null, fo: { sel: null, kv: [ 0, 0 ] } };
 window.__rl468 = st;
 const off = () => !!window.__rl_no468ctl;
 const T = () => (typeof now === 'function' ? now() : performance.now() / 1e3);
 const note = (k, v) => { st.last = { k: k, v: v, t: +T().toFixed(2) }; st.log.push(st.last); if (st.log.length > 80) st.log.shift(); };
 const load = (k, d) => { const o = Object.assign({}, d); try { const s = JSON.parse(localStorage.getItem(k) || 'null'); if (s) for (const a in d) if (typeof s[a] === typeof d[a]) o[a] = s[a]; } catch (e) {} return o; };
 const kb = () => (window.V467KEYS && V467KEYS.binds ? V467KEYS.binds() : load(KB_KEY, KDEF));
 const pb = () => load(PAD_KEY, PDEF);
 function saveKb(o) { try { localStorage.setItem(KB_KEY, JSON.stringify(o)); } catch (e) {} window.dispatchEvent(new Event('rl-binds')); }
 function savePad(o) { try { localStorage.setItem(PAD_KEY, JSON.stringify(o)); } catch (e) {} }
 function keyName(k) {
  if (k === ' ') return 'SPACE';
  const m = { ArrowLeft: '<', ArrowRight: '>', ArrowUp: '^', ArrowDown: 'v', Shift: 'SHIFT', Enter: 'ENTER', Tab: 'TAB', Control: 'CTRL', Alt: 'ALT', Backspace: 'BKSP', CapsLock: 'CAPS' };
  if (m[k]) return m[k];
  return String(k).toUpperCase().replace(/[^A-Z0-9<>^,.\/;:'\[\]\-=+]/g, '').slice(0, 6) || '?';
 }
 const padName = i => PADN[i] || 'BUTTON ' + i;
 window.V468CTL = { st: st, kb: kb, pb: pb, keyName: keyName, padName: padName, KDEF: KDEF, PDEF: PDEF };
 V468CTL.aimedMate = (L, list) => aimedMate(L, list);   // v472pass: the same pass-target picker for touch PASSER PRO + the ring

 // ---------------- input mode ----------------
 function pads() { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected !== false); } catch (e) { return []; } }
 function padConnected() { return pads().length > 0; }
 function desk() { return st.sawKey || st.sawMouse || (window.matchMedia && matchMedia('(pointer: fine)').matches && !matchMedia('(pointer: coarse)').matches); }
 function setMode(m) { if (st.mode !== m) { st.mode = m; note('mode', m); } }
 window.addEventListener('keydown', e => { if (e.isTrusted && !off()) { st.sawKey = true; setMode('key'); } }, true);
 window.addEventListener('pointerdown', e => {
  if (off()) return;
  if (e.pointerType === 'mouse') { st.sawMouse = true; setMode('key'); } else if (e.pointerType === 'touch' || e.pointerType === 'pen') setMode('touch');
 }, true);
 st.inputMode = () => st.mode || (padConnected() && st.padUsed ? 'pad' : desk() ? 'key' : 'touch');

 // ---------------- settings: move the toggles ----------------
 const RE_AUTO = /^AUTO SWITCH DEFENDER/, RE_CHIRPS = /^CHIRPS:/, RE_AC = /^(AUTO ?)?CHIRP:? (ON|OFF)$/, RE_ACE = /^(AUTO ?)?CELLY:? (ON|OFF)$/;
 function tog(lbl, on, x, y, w, h, fn) {
  button(lbl + ': ' + (on ? 'ON' : 'OFF'), x, y, w, h, () => { fn(!on); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: on ? '#7dff7a' : '#3a4a55', fg: on ? '#0b1a20' : '#cfe', fit: true });
 }
 function hasV17() { return !!(window.V17 && V17.autoChirp && V17.autoCelly); }
 const FR = { n: 0 };
 (function tick() { FR.n++; requestAnimationFrame(tick); })();
 function wrapSettings() {
  const DS0 = window.drawSettings;
  if (typeof DS0 !== 'function') return;
  window.drawSettings = function (inGame) {
   if (off()) return DS0.apply(this, arguments);
   // left Settings since the last draw (a frame with no drawSettings call): the panel closes
   if (FR.n - st.lastDraw > 3) { st.open = false; st.cap = null; }
   st.lastDraw = FR.n;
   if (st.open) return drawControls(inGame);
   const B0 = window.button; let slot = null, chirpsY = null, rowBottom = 0;
   window.button = function (label, x, y, w, h) {
    const L = String(label);
    if (RE_AUTO.test(L)) { slot = { x: x, y: y, w: w, h: h }; return; }
    if (RE_AC.test(L) || RE_ACE.test(L)) { rowBottom = Math.max(rowBottom, y + h); return; }
    if (RE_CHIRPS.test(L) && slot) { chirpsY = y; rowBottom = Math.max(rowBottom, y + h); const a = Array.from(arguments); a[2] = slot.y; return B0.apply(this, a); }
    return B0.apply(this, arguments);
   };
   let r;
   try { r = DS0.apply(this, arguments); } finally { window.button = B0; }
   if (slot) {
    const y = chirpsY != null ? chirpsY : slot.y, bot = Math.max(rowBottom, y + slot.h, y + 18);
    button('CONTROLS', slot.x, y, slot.w, bot - y, () => { st.open = true; st.cap = null; st.tab = st.tab === 'pad' && !padConnected() ? 'keys' : st.tab; try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: '#ffd23a', fg: '#0b1a20' });
   }
   return r;
  };
 }

 // ---------------- the CONTROLS panel ----------------
 const KROWS = [ [ 'up', 'MOVE UP' ], [ 'left', 'MOVE LEFT' ], [ 'down', 'MOVE DOWN' ], [ 'right', 'MOVE RIGHT' ], [ 'splitL', 'SPLIT LEFT' ], [ 'splitR', 'SPLIT RIGHT' ], [ 'swim', 'SWIM' ], [ 'toe', 'TOE DRAG' ], [ 'check', 'CHECK TAP / HIT HOLD' ] ];
 function kbInfo(b) { return [ [ 'PICK PLAYER', [ b.up, b.left, b.down, b.right ].map(keyName).join(' ') ], [ 'MOVE PICKED', [ b.splitL, b.splitR, b.swim, b.toe ].map(keyName).join(' ') ], [ 'SET + SPAM TO TAP', null, 'foSet' ], [ 'PULL ON WHISTLE', [ b.up, b.left, b.down, b.right ].map(keyName).join(' ') ], [ 'PASS', 'CLICK A MATE' ], [ 'SHOOT', 'DRAG BACK FROM CAGE' ] ]; }
 const PROWS = [ [ 'MOVE', 'LEFT STICK' ], [ 'SPLIT', 'FLICK RIGHT STICK' ], [ 'SWIM / TOE', 'RIGHT STICK C' ], [ 'PASS TO STICK DIR', null, 'pass' ], [ 'SHOOT HOLD, RS AIM', null, 'shoot' ], [ 'D: SWITCH', null, 'sw' ], [ 'D: CHECK', null, 'check' ], [ 'D: BIG HIT', null, 'hit' ] ];
 const PFO = [ [ 'PICK PLAYER', 'LEFT STICK' ], [ 'MOVE PICKED', 'RIGHT STICK' ], [ 'SET + SPAM TO TAP', null, 'foSet' ], [ 'PULL ON WHISTLE', 'LEFT STICK' ] ];
 function capLabel(name, cur, wait) { return name + ': ' + (wait ? 'PRESS...' : cur); }
 function bindBtn(kind, act, name, cur, x, y, w, h) {
  const wait = st.cap && st.cap.kind === kind && st.cap.act === act;
  button(capLabel(name, cur, wait), x, y, w, h, () => { st.cap = wait ? null : { kind: kind, act: act, t0: performance.now() }; note('capture', st.cap); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: wait ? '#ffd23a' : '#2cc4dc', fg: '#0b1a20', fit: true });
 }
 function info(name, val, x, y, w) { text(name + ': ' + val, x + 3, y + 2, 1, '#8fe3f0'); }
 function drawControls(inGame) {
  if (inGame) rect(0, 0, W, H, 'rgba(0,0,0,.86)'); else bgStripes(true);
  const isDesk = desk(), pad = padConnected();
  if (st.tab === 'pad' && !pad) st.tab = 'keys';
  if (!isDesk && !pad) st.tab = 'none';
  else if (st.tab === 'none') st.tab = pad && !isDesk ? 'pad' : 'keys';
  if (!isDesk && pad && st.tab === 'keys') st.tab = 'pad';
  text('CONTROLS', W / 2, 5, 2, '#2cc4dc', 'center', '#000');
  const line = st.cap ? (st.cap.kind === 'pad' ? 'PRESS A CONTROLLER BUTTON NOW. ESC CANCELS.' : 'PRESS A KEY NOW. ESC CANCELS.') : st.tab === 'none' ? 'TURN THE AUTO HELPERS ON OR OFF.' : st.tab === 'pad' ? 'TAP AN ACTION, THEN PRESS A BUTTON TO REBIND IT.' : 'TAP AN ACTION, THEN PRESS A KEY TO REBIND IT.';
  text(line, W / 2, 21, 1, st.cap ? '#ffe14d' : '#cfe', 'center');
  const PM = window.V472PASS && !window.__rl_no472pass ? V472PASS : null;   // v472pass hook
  const x0 = 8, gw = W - 16, ty = st.tab === 'none' ? (PM ? 36 : 50) : 30, th = st.tab === 'none' ? (PM ? 16 : 18) : 10, w3 = Math.floor((gw - 6) / 3);
  tog('AUTO SWITCH', !!SET171.autoSw, x0, ty, w3, th, v => { SET171.autoSw = v; set171Save(); });
  if (hasV17()) {
   tog('AUTO CHIRP', !!V17.autoChirp(), x0 + w3 + 3, ty, w3, th, v => V17.autoChirp(v));
   tog('AUTO CELLY', !!V17.autoCelly(), x0 + 2 * (w3 + 3), ty, gw - 2 * (w3 + 3), th, v => V17.autoCelly(v));
  }
  if (st.tab !== 'none') {
   const yt = 44, tw = Math.floor((gw - 6) / 3);
   const tab = (lbl, k, x, w) => button(lbl, x, yt, w, 10, () => { st.tab = k; st.cap = null; try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: st.tab === k ? '#ffe14d' : '#3a4a55', fg: st.tab === k ? '#0b1a20' : '#cfe' });
   if (isDesk) tab('KEYS', 'keys', x0, tw);
   if (pad) tab('CONTROLLER', 'pad', isDesk ? x0 + tw + 3 : x0, tw);
   button(st.tab === 'pad' ? 'RESET CONTROLLER' : 'RESET KEYS', x0 + 2 * (tw + 3), yt, gw - 2 * (tw + 3), 10, () => {
    st.cap = null;
    try { localStorage.removeItem(st.tab === 'pad' ? PAD_KEY : KB_KEY); } catch (e) {}
    window.dispatchEvent(new Event('rl-binds'));
    note('reset', st.tab);
    try { SFX.tap && SFX.tap(); } catch (e) {}
   }, { bg: '#ff8a5a', fg: '#0b1a20', fit: true });
   const cw = Math.floor((gw - 6) / 2), xr = x0 + cw + 6, rh = 9, rs = 10, y0 = 66;
   text('PLAY', x0, 58, 1, '#ffe14d'); text('FACEOFF', xr, 58, 1, '#ffe14d');
   if (st.tab === 'keys') {
    const b = kb();
    KROWS.forEach((r, i) => bindBtn('key', r[0], r[1], keyName(b[r[0]]), x0, y0 + i * rs, cw, rh));
    kbInfo(b).forEach((r, i) => r[2] ? bindBtn('key', r[2], r[0], keyName(b[r[2]]), xr, y0 + i * rs, cw, rh) : info(r[0], r[1], xr, y0 + i * rs, cw));
   } else {
    const b = pb();
    PROWS.forEach((r, i) => r[2] ? bindBtn('pad', r[2], r[1] == null ? r[0] : r[0], padName(b[r[2]]), x0, y0 + i * rs, cw, rh) : info(r[0], r[1], x0, y0 + i * rs, cw));
    PFO.forEach((r, i) => r[2] ? bindBtn('pad', 'fo_' + r[2], 'FO ' + r[0], padName(b[r[2]]), xr, y0 + i * rs, cw, rh) : info(r[0], r[1], xr, y0 + i * rs, cw));
   }
  }
  if (PM) try { PM.drawCtl({ x0: x0, gw: gw, phone: st.tab === 'none', pad: pad, desk: isDesk }); } catch (e) { console.warn(e); }   // v472pass hook
  button(inGame ? 'BACK TO SETTINGS' : 'DONE', W / 2 - 50, st.tab === 'none' ? 120 : 158, 100, st.tab === 'none' ? 31 : 18, () => { st.open = false; st.cap = null; try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: '#7dff7a', fg: '#0b1a20' });
 }
 function setKb(act, k) {
  const b = Object.assign({}, kb()), old = b[act];
  for (const a in b) if (a !== act && b[a] === k) b[a] = old;   // already used: swap
  b[act] = k; saveKb(b); note('bindKey', { act: act, key: k });
 }
 function setPad(act, i) {
  const b = pb(), a0 = act.replace(/^fo_/, ''), old = b[a0];
  for (const a in b) if (a !== a0 && PGRP[a] === PGRP[a0] && b[a] === i) b[a] = old;
  b[a0] = i; savePad(b); note('bindPad', { act: a0, btn: i });
 }
 // capture-phase: the rebinding key never reaches the game (v467keys) or the page
 window.addEventListener('keydown', e => {
  if (off() || !st.open || !st.cap) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (e.key === 'Escape') { st.cap = null; note('capture', 'cancel'); return; }
  if (st.cap.kind !== 'key' || e.repeat) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === 'Meta' || k === 'Dead' || k === 'Unidentified') return;
  setKb(st.cap.act, k); st.cap = null;
  try { SFX.tap && SFX.tap(); } catch (er) {}
 }, true);
 window.addEventListener('keyup', e => { if (!off() && st.open && (st.cap || st.capUp)) { e.stopImmediatePropagation(); st.capUp = false; } }, true);

 // ---------------- virtual pointer: the touch path, driven by keys / pad ----------------
 function cssOf(lx, ly) { const r = cv.getBoundingClientRect(); return { clientX: r.left + lx / W * r.width, clientY: r.top + ly / H * r.height }; }
 const VP = {};
 function vDown(id, lx, ly) { if (VP[id]) vUp(id); VP[id] = { x: lx, y: ly, x0: lx, y0: ly }; inDown(id, cssOf(lx, ly)); return pointers.get(id); }
 function vMove(id, lx, ly) { const v = VP[id]; if (!v) return; v.x = lx; v.y = ly; inMove(id, cssOf(lx, ly)); }
 function vUp(id, cancel) { const v = VP[id]; if (!v) return; delete VP[id]; inUp(id, cssOf(v.x, v.y), !!cancel); }
 function vClear() { for (const id in VP) { try { vUp(id, true); } catch (e) {} } }
 st.vp = VP;

 // ---------------- faceoff (pad + keys share this) ----------------
 function foList() {
  const F = game && game.fo; if (!F) return [];
  let L = [];
  try { L = (F.phase === 'form' ? foWings().concat(foAtk()) : F.v131 ? foWings().concat(foAtk()) : []); } catch (e) {}
  return L;
 }
 function foPickDir(ux, uy) {
  const G = game, me = G.foMe, L = foList();
  let best = null, bd = .3;
  for (const p of L) { const dx = p.x - me.x, dy = p.y - me.y, d = Math.hypot(dx, dy) || 1, s = (dx * ux + dy * uy) / d; if (s > bd) { bd = s; best = p; } }
  if (best && best !== st.fo.sel) {
   st.fo.sel = best;
   try { addFx('txt', best.x, best.y - 26, { s: 'PICKED', col: '#ffe14d', life: .8 }); SFX.tap(); } catch (e) {}
   note('foPick', { role: best.role, far: !!best.far, x: Math.round(best.x), y: Math.round(best.y) });
  }
  return best;
 }
 function foMovePicked(vx, vy, dt) {
  const G = game, F = G && G.fo, p = st.fo.sel;
  if (!F || !p || !foList().includes(p) || F.phase === 'done' || F.phase === 'scrum') { if (VP.fo468m) vUp('fo468m'); return; }
  if (!vx && !vy) { if (VP.fo468m) vUp('fo468m'); return; }
  if (!VP.fo468m) {
   const pt = vDown('fo468m', p.x - Math.round(camX), p.y - 9);
   if (!pt || pt.drag !== p) { if (pt && pt.role === 'foWing') { /* held a wing in ready/set: that is the touch pick */ } }
  }
  const v = VP.fo468m; if (!v) return;
  vMove('fo468m', v.x + vx * 70 * dt, v.y + vy * 70 * dt);
  st.fo.moved = (st.fo.moved || 0) + Math.hypot(vx, vy) * dt;
 }
 function foSetDown() {
  const F = game && game.fo; if (!F) return;
  if (F.phase === 'form') { const D = FO_DOWN_BTN(); vDown('fo468s', D.x, D.y); note('foSet', 'down'); }
  else { const B = FO_BTN(); const t0 = F.taps; vDown('fo468s', B.x, B.y); note('foSet', { phase: F.phase, taps: F.taps, tapped: F.taps > t0 }); }
 }
 function foSetUp() { if (VP.fo468s) vUp('fo468s'); }
 function foPull(ux, uy) {
  const F = game && game.fo; if (!F || F.phase !== 'go') return false;
  const B = FO_BTN();
  if (VP.fo468s) vUp('fo468s');
  vDown('fo468p', B.x, B.y);
  if (game.fo.phase === 'go') vMove('fo468p', B.x + ux * 16, B.y + uy * 16);
  vUp('fo468p');
  note('foPull', { ux: +ux.toFixed(2), uy: +uy.toFixed(2), win: game.fo ? game.fo.win : null, phase: game.fo ? game.fo.phase : null });
  return true;
 }
 function foActive() { try { return screen === 'faceoff' && game && game.fo && gameInputOn(); } catch (e) { return false; } }

 // keyboard faceoff
 const KH = new Set;
 function kact(k) { const b = kb(); for (const a in b) if (b[a] === k) return a; return null; }
 window.addEventListener('keydown', e => {
  if (off() || !e.isTrusted || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, a = kact(k);
  if (!a || !foActive()) return;
  const tg = document.activeElement && (document.activeElement.tagName || '').toUpperCase();
  if (tg === 'INPUT' || tg === 'TEXTAREA') return;
  e.preventDefault();
  const rep = e.repeat || KH.has(a); KH.add(a);
  if (rep) return;
  const F = game.fo, mv = { up: [ 0, -1 ], down: [ 0, 1 ], left: [ -1, 0 ], right: [ 1, 0 ] }[a];
  if (mv) { if (F.phase === 'go') foPull(mv[0], mv[1]); else foPickDir(mv[0], mv[1]); return; }
  if (a === 'foSet') foSetDown();
 }, false);
 window.addEventListener('keyup', e => {
  if (off()) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, a = kact(k);
  if (!a) return; KH.delete(a);
  if (a === 'foSet') foSetUp();
 }, false);
 window.addEventListener('blur', () => { KH.clear(); vClear(); });
 function kbFoTick(dt) {
  if (!foActive()) { if (VP.fo468m && !st.padFoMove) vUp('fo468m'); return; }
  const x = (KH.has('splitR') ? 1 : 0) - (KH.has('splitL') ? 1 : 0), y = (KH.has('toe') ? 1 : 0) - (KH.has('swim') ? 1 : 0);
  if (x || y || st.kbFoMove) { st.kbFoMove = !!(x || y); const L = Math.hypot(x, y) || 1; foMovePicked(x / L, y / L, dt); }
 }

 // ---------------- controller ----------------
 const DZ1 = .25;
 function stick(p, i) { const x = p.axes[i] || 0, y = p.axes[i + 1] || 0, m = Math.hypot(x, y); return m < DZ1 ? { x: 0, y: 0, m: 0 } : { x: x / m, y: y / m, m: Math.min(1, (m - DZ1) / (1 - DZ1)), rx: x, ry: y }; }
 const pressed = (p, i) => { const b = p.buttons[i]; return !!(b && (typeof b === 'object' ? b.pressed || b.value > .5 : b > .5)); };
 const P = { prev: [], run: false, rs: null, shot: null, lsWas: 0, hist: [], lastSharp: -9 };
 st.P = P;
 function inPlay() { try { return gameInputOn() && (screen === 'live' || screen === 'defense'); } catch (e) { return false; } }
 function padMove(L) {
  const G = game; if (!G) return;
  if (!L.m || !inPlay()) { if (P.run) { P.run = false; if (G.run && G.run.pad468) { G.run = null; G.stopFlash = .25; } } return; }
  if (G.pset && screen === 'live' && !(G.pset.p284 && typeof on284 === 'function' && on284())) return;
  if (G.run && G.run.kb467) return;
  const t = T();
  P.hist.push([ t, L.x, L.y ]); while (P.hist.length > 2 && P.hist[1][0] < t - .2) P.hist.shift();
  const ref = P.hist[0], dot = ref[1] * L.x + ref[2] * L.y, had = !!(G.run && G.run.pad468);
  if (!had) setRun(L.x, L.y, !P.run);
  else if (dot < .25 && t - P.lastSharp > .35) { P.lastSharp = t; P.hist = [ [ t, L.x, L.y ] ]; setRun(L.x, L.y, true); }
  if (G.run) { G.run.x = L.x; G.run.y = L.y; G.run.m = Math.max(.35, L.m); G.run.joy = true; G.run.pad468 = true; }
  P.run = true;
 }
 // RS gesture -> the swipe path (CSS px), classified by the game's own classifySwipe
 function rsGesture(R) {
  const t = T(), RAD = 60;
  if (!P.rs) { if (R.m > .55) P.rs = { t0: t, path: [ [ 0, 0 ], [ R.x * RAD, R.y * RAD ] ] }; return; }
  if (R.m > .35) { const l = P.rs.path[P.rs.path.length - 1], q = [ R.x * RAD, R.y * RAD ]; if (Math.hypot(q[0] - l[0], q[1] - l[1]) > 2) P.rs.path.push(q); return; }
  const g = P.rs; P.rs = null;
  if (screen !== 'live' || !canShoot()) { note('padDodge', { ok: false, why: 'no ball' }); return; }
  const dur = Math.min(t - g.t0, DODGE.maxDur * .95), sw = classifySwipe(g.path, dur);
  if (!sw) { note('padDodge', { ok: false, why: 'not a dodge', n: g.path.length }); return; }
  const r = doDodge(sw.kind, sw.ux, sw.uy, sw.spin);
  try { lastTap = { kind: sw.kind, ok: !!r, side: r ? r.side : null, pad: true }; } catch (e) {}
  note('padDodge', { kind: sw.kind, ok: !!r, ux: +sw.ux.toFixed(2), uy: +sw.uy.toFixed(2) });
 }
 function aimedMate(L, list) {
  const c = game.carrier || game.dctl; if (!list.length) return null;
  let best = null, bs = -2;
  for (const p of list) {
   const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy) || 1;
   const s = L.m ? (dx * L.x + dy * L.y) / d : -d / 1e4;
   if (s > bs) { bs = s; best = p; }
  }
  return best;
 }
 function padPass(L) {
  if (screen !== 'live' || !canShoot()) { note('padPass', { ok: false }); return; }
  const m = aimedMate(L, liveMates());
  if (!m) { note('padPass', { ok: false, why: 'no mate' }); return; }
  try { lastTap = { kind: 'pass', to: m.idx, pad: true }; } catch (e) {}
  throwPass(m);
  note('padPass', { ok: true, to: m.idx });
 }
 function cagePt() { return { x: GX - Math.round(camX), y: CY }; }
 function shotStart() {
  if (screen !== 'live' || !canShoot()) return;
  const c = cagePt(), pt = vDown('pad468shot', c.x, c.y);
  P.shot = { t0: T(), via: pt && pt.role === 'shot26' ? 'shot26' : 'direct', ax: c.x, ay: c.y };
  if (P.shot.via !== 'shot26') vUp('pad468shot', true);
  note('padShot', { start: P.shot.via });
 }
 function shotTick(R) {
  const S = P.shot; if (!S) return;
  const held = T() - S.t0, k = cv.getBoundingClientRect().width / W;
  S.aimY = R.m ? R.ry : 0;
  if (S.via === 'shot26') {
   const pull = Math.min(SHOT26P.full, 30 / k + held / SHOT26P.ramp * SHOT26P.full);
   vMove('pad468shot', S.ax - pull, S.ay + S.aimY * SHOT26P.ay);
  }
 }
 const SHOT26P = { full: 90, ramp: 1.1, ay: 24 };
 function shotEnd() {
  const S = P.shot; P.shot = null; if (!S) return;
  if (S.via === 'shot26') { vUp('pad468shot'); note('padShot', { fired: true, via: 'shot26', held: +(T() - S.t0).toFixed(2), ball: game.ball && game.ball.state }); return; }
  if (!canShoot()) return;
  const corner = (S.aimY > 0 ? 2 : 0) + (Math.abs(S.aimY || 0) < .5 ? 1 : 0);
  releaseShot(Math.min(1.2, T() - S.t0), corner);
  note('padShot', { fired: true, via: 'releaseShot', ball: game.ball && game.ball.state });
 }
 function defSwitch(L) {
  const G = game; if (screen !== 'defense' || !G) return;
  const list = G.players.filter(p => p.team === 'O' && p !== G.dctl && !p.gk && p.role !== 'g2');
  let best = null;
  if (L.m) best = aimedMate(L, list);
  else { const b = G.ball, tx = G.dcar ? G.dcar.x : b.x, ty = G.dcar ? G.dcar.y : b.y; let bd = 1e9; for (const p of list) { const d = Math.hypot(p.x - tx, p.y - ty); if (d < bd) { bd = d; best = p; } } }
  if (best) dSwitchTo(best);
  note('padSwitch', { ok: !!best });
 }
 function padClear(L) {
  const G = game, h = G.dclear && G.dclear.holder;
  const list = dClearMates().filter(q => q !== h);
  const save = G.carrier; let m = null;
  if (h && !G.carrier) { G.carrier = h; try { m = aimedMate(L, list); } finally { G.carrier = save; } } else m = aimedMate(L, list);
  if (!m) { note('padClear', { ok: false }); return; }
  try { if (m.far || m.x > MIDX - 40) tutFlag('anyMate'); lastTap = { kind: 'clear', to: m.far ? 'far' : m.idx, pad: true }; } catch (e) {}
  dThrowClear(m);
  note('padClear', { ok: true, to: m.far ? 'far' : m.idx });
 }
 function defCheck(hit) {
  if (screen !== 'defense') return;
  const r = hit ? dHit() : dCheck();
  try { lastTap = { kind: hit ? 'hit' : 'check', r: r, pad: true }; } catch (e) {}
  note(hit ? 'padHit' : 'padCheck', r);
 }
 let padPrevFo = { L: 0 };
 function padFo(p, L, R, edge, dt) {
  const F = game.fo, b = pb();
  if (L.m > .5) {
   if (F.phase === 'go') { if (!padPrevFo.L) foPull(L.x, L.y); }
   else if (F.phase !== 'scrum' && F.phase !== 'done') foPickDir(L.x, L.y);
  }
  padPrevFo.L = L.m > .5 ? 1 : 0;
  if (edge.down(b.foSet)) foSetDown();
  if (edge.up(b.foSet)) foSetUp();
  st.padFoMove = !!R.m;
  if (R.m || VP.fo468m) foMovePicked(R.m ? R.x * R.m : 0, R.m ? R.y * R.m : 0, dt);
 }
 let lastT = 0;
 function poll() {
  if (off()) { st.padOn = false; return; }
  const ps = pads();
  if (!ps.length) { st.padOn = false; P.prev = []; padMove({ m: 0 }); note('pad', 'gone'); return; }
  requestAnimationFrame(poll);
  const t = performance.now(), dt = Math.min(.05, lastT ? (t - lastT) / 1e3 : .016); lastT = t;
  const p = ps[0]; st.pad = { id: p.id, mapping: p.mapping };
  const cur = p.buttons.map((_, i) => pressed(p, i));
  const edge = { down: i => cur[i] && !P.prev[i], up: i => !cur[i] && P.prev[i] };
  const L = stick(p, 0), R = stick(p, 2), any = cur.some(Boolean) || L.m || R.m;
  st.padL = L;   // v472pass hook: the ring reads the live left stick
  if (any) { st.padUsed = true; setMode('pad'); }
  try {
   if (st.open && st.cap && st.cap.kind === 'pad') {
    const i = cur.findIndex((v, j) => v && !P.prev[j]);
    if (i >= 0) { setPad(st.cap.act, i); st.cap = null; }
   } else if (!st.open && foActive()) padFo(p, L, R, edge, dt);
   else if (!st.open && inPlay()) {
    padMove(L);
    const b = pb();
    const tutOn = game && game.tutorial && !game.tutorial.complete;
    const cardStep = tutOn && typeof tutIsCard === 'function' && tutIsCard(game.tutorial.step);
    if (tutOn && (edge.down(b.pass) || edge.down(9)) && (cardStep || game.tutorial.doneT > 0 || (screen === 'live' && !canShoot()))) {
     if (game.tutorial.doneT > 0 && typeof tutAdvance === 'function') tutAdvance();
     else if (cardStep) { vDown('pad468tap', W / 2, H / 2); vUp('pad468tap'); }
     else if (typeof tutSkip === 'function') tutSkip();
     note('padTutX', true);
    } else if (screen === 'live') {
     if (edge.down(b.shoot)) shotStart();
     const r3 = pressed(p, b.hit);
     if (r3) P.cutArm = true;
     if ((P.cutArm && !P.shot) || (P.cutSent && R.m >= .4)) {
      P.rs = null;
      const m = window.V472PASS && V472PASS.target && V472PASS.target();
      if (P.cutArm && m && R.m > .5 && !P.cutSent && typeof startCut181 === 'function') { startCut181(m, R.x, R.y); P.cutSent = true; note('padCut', { to: m.idx, x: +R.x.toFixed(2), y: +R.y.toFixed(2) }); }
     } else {
      if (P.shot) { shotTick(R); if (!cur[b.shoot]) shotEnd(); }
      else rsGesture(R);
      if (edge.down(b.pass)) padPass(L);
     }
     if (!r3) {
      P.cutArm = false;
      if (P.cutSent) { P.rs = null; if (R.m < .4) P.cutSent = false; }
      else P.cutSent = false;
     }
    } else if (screen === 'defense') {
     P.rs = null;
     if (game.ball && game.ball.state === 'clear') { if (edge.down(b.pass)) padClear(L); }
     else if (edge.down(b.sw)) defSwitch(L);
     if (edge.down(b.check)) defCheck(false);
     if (edge.down(b.hit)) defCheck(true);
    }
    if (screen !== 'live' && P.shot) { vUp('pad468shot', true); P.shot = null; }
   } else if (!st.cap) {
    if ((edge.down(9) || edge.down(pb().pass)) && game && game.tutorial && !game.tutorial.complete) {
     if (game.tutorial.doneT > 0 && typeof tutAdvance === 'function') tutAdvance();
     else { vDown('pad468tap', W / 2, H / 2); vUp('pad468tap'); }
     note('padTutX', 'menu');
    } else if (window.__rl500menu) window.__rl500menu(p, L, edge);
   }
  } catch (e) { console.warn('v468ctl pad', e); }
  P.prev = cur;
 }
 function padStart() { if (st.padOn || off()) return; if (!padConnected()) return; st.padOn = true; st.padUsed = true; setMode('pad'); lastT = 0; note('pad', 'on'); requestAnimationFrame(poll); }
 window.addEventListener('gamepadconnected', padStart);
 window.addEventListener('gamepaddisconnected', () => { st.padUsed = padConnected() && st.padUsed; });
 // keyboard faceoff move tick (only runs while a key is held on a faceoff)
 let kbLast = 0;
 function kbLoop() {
  if (off()) return;
  requestAnimationFrame(kbLoop);
  const t = performance.now(), dt = Math.min(.05, kbLast ? (t - kbLast) / 1e3 : .016); kbLast = t;
  if (!KH.size && !st.kbFoMove) return;
  try { kbFoTick(dt); } catch (e) { console.warn('v468ctl fo', e); }
 }
 let kbArmed = false;
 window.addEventListener('keydown', e => { if (!kbArmed && e.isTrusted && !off()) { kbArmed = true; requestAnimationFrame(kbLoop); } }, true);
 // faceoff over: drop held virtual pointers and the pick
 setInterval(() => { try { if (screen !== 'faceoff') { st.fo.sel = null; if (VP.fo468m || VP.fo468s) { delete VP.fo468m; delete VP.fo468s; pointers.delete('fo468m'); pointers.delete('fo468s'); } } } catch (e) {} }, 250);

 // ---------------- tutorial text follows the input in use ----------------
 // Touch keeps every original string. Key / pad mode swap the touch lines for the same step in
 // the current binds (drawn by the game's own text(); textW() is swapped too so boxes fit).
 function tutMap(mode) {
  const b = kb(), p = pb(), K = keyName, P = padName;
  const MV = [ b.up, b.left, b.down, b.right ].map(K).join(' '), SL = K(b.splitL), SR = K(b.splitR), SW = K(b.swim), TO = K(b.toe), CH = K(b.check), SP = K(b.foSet);
  const PA = P(p.pass), SH = P(p.shoot), SWB = P(p.sw), CK = P(p.check), HT = P(p.hit), FS = P(p.foSet);
  const k = mode === 'key';
  const m = {
   'JOYSTICK: PUT YOUR LEFT THUMB DOWN + DRAG ANY WAY. LET GO TO STOP.': k ? 'HOLD ' + MV + ' TO RUN ANY WAY. LET GO TO STOP.' : 'LEFT STICK = RUN ANY WAY. LET GO TO STOP.',
   'QUICK TAP A TEAMMATE TO PASS. YOUR GUY NEVER PASSES ON HIS OWN.': k ? 'CLICK A TEAMMATE TO PASS. YOUR GUY NEVER PASSES ON HIS OWN.' : 'POINT THE LEFT STICK AT A TEAMMATE + PRESS ' + PA + ' = PASS.',
   'TOUCH THE GOAL, PULL YOUR THUMB BACK (FARTHER = HARDER), LET GO = SHOT.': k ? 'CLICK THE GOAL, DRAG THE MOUSE BACK (FARTHER = HARDER), LET GO = SHOT.' : 'HOLD ' + SH + ' (LONGER = HARDER), RIGHT STICK AIMS, LET GO = SHOT.',
   'DRAG YOUR LEFT THUMB TO RUN YOUR GUY (BLUE RING) OVER THE BALL.': (k ? MV : 'LEFT STICK') + ': RUN YOUR GUY (BLUE RING) OVER THE BALL.',
   'LEFT THUMB = MOVE, TAP RIGHT SIDE = CHECK. 3 CHECKS KNOCK IT LOOSE.': k ? MV + ' = MOVE, TAP ' + CH + ' = CHECK. 3 CHECKS KNOCK IT LOOSE.' : 'LEFT STICK = MOVE, ' + CK + ' = CHECK. 3 CHECKS KNOCK IT LOOSE.',
   'RUN AT HIM, HOLD RIGHT SIDE (RING FILLS), LET GO = BIG HIT. NO RUN-UP = JUST A SHOVE.': k ? 'RUN AT HIM, HOLD ' + CH + ' (RING FILLS), LET GO = BIG HIT. NO RUN-UP = A SHOVE.' : 'RUN AT HIM, PRESS ' + HT + ' = BIG HIT. NO RUN-UP = JUST A SHOVE.',
   'YOUR GOALIE HAS IT! TAP AN OPEN TEAMMATE (GREEN RING) TO CLEAR IT.': k ? 'YOUR GOALIE HAS IT! CLICK AN OPEN TEAMMATE (GREEN RING) TO CLEAR IT.' : 'YOUR GOALIE HAS IT! LEFT STICK AT AN OPEN MATE + ' + PA + ' = CLEAR.',
   'LEFT THUMB = MOVE. RUN, THEN SWIPE YOUR RIGHT THUMB ACROSS = DODGE.': k ? MV + ' = MOVE. RUN, THEN ' + SL + ' OR ' + SR + ' = DODGE.' : 'LEFT STICK = MOVE. RUN, THEN FLICK THE RIGHT STICK ACROSS = DODGE.',
   'LEFT THUMB RUNS. RIGHT THUMB: SWIPE STRAIGHT ANY WAY = SPLIT DODGE.': k ? MV + ' RUNS. ' + SL + ' = SPLIT LEFT, ' + SR + ' = SPLIT RIGHT.' : 'LEFT STICK RUNS. FLICK THE RIGHT STICK STRAIGHT = SPLIT DODGE.',
   'RUN WITH YOUR LEFT THUMB, THEN DRAW A C WITH IT = ROLL AND TURN BACK.': k ? 'RUN, THEN DRAG A C WITH THE MOUSE ON THE LEFT SIDE = ROLL BACK.' : 'RUN, THEN DRAW A C WITH THE RIGHT STICK = ROLL / SWIM / TOE.',
   'HOLD YOUR THUMB ON A TEAMMATE = HE COMES OVER AND SETS A PICK.': k ? 'HOLD THE MOUSE ON A TEAMMATE = HE COMES OVER AND SETS A PICK.' : 'PICK: HOLD A TEAMMATE (TOUCH / MOUSE) = HE SETS A PICK.',
   'YOUR D POLE HAS IT: DRAG YOUR LEFT THUMB - HE CAN CARRY IT OVER.': 'YOUR D POLE HAS IT: ' + (k ? MV : 'LEFT STICK') + ' - HE CAN CARRY IT OVER.',
   'YOUR GOALIE HAS IT: DRAG HIM OUT - HE CAN GO CAGE TO CAGE.': 'YOUR GOALIE HAS IT: ' + (k ? MV : 'LEFT STICK') + ' - HE CAN GO CAGE TO CAGE.',
   'MASH THE BUTTON. ON THE WHISTLE: SWIPE IN ANY DIRECTION.': k ? 'MASH ' + SP + '. ON THE WHISTLE: PRESS ' + MV.replace(/ /g, '/') + ' = PULL THAT WAY.' : 'MASH ' + FS + '. ON THE WHISTLE: PUSH THE LEFT STICK = PULL.',
   'DRAG AN ATTACKMAN + A WING (GREEN RINGS) TO NEW SPOTS. DOWN.': k ? MV + ' PICKS A GUY, ' + [ SL, SR, SW, TO ].join(' ') + ' MOVES HIM. ' + SP + ' = DOWN.' : 'LEFT STICK PICKS A GUY, RIGHT STICK MOVES HIM. ' + FS + ' = DOWN.',
   'AFTER DOWN: HOLD A WING GUY (RING FILLS) = PICKED. HE GETS IT.': k ? 'AFTER DOWN: ' + MV + ' PICKS A WING. PULL TO HIM = HE GETS IT.' : 'AFTER DOWN: LEFT STICK PICKS A WING. PULL TO HIM = HE GETS IT.',
   'COUNTDOWN: PUT YOUR THUMB ON THE BUTTON (RIGHT SIDE).': k ? 'COUNTDOWN: FINGER ON ' + SP + '.' : 'COUNTDOWN: THUMB ON ' + FS + '.',
   'SET...: MASH IT FAST. MOVE YOUR THUMB TOO SOON = VIOLATION.': k ? 'SET...: MASH ' + SP + ' FAST. PULL TOO SOON = NOTHING.' : 'SET...: MASH ' + FS + ' FAST. PULL TOO SOON = NOTHING.',
   'WHISTLE / GO!: SWIPE IN ANY DIRECTION. PICKED A WING? IT POPS TO HIM.': k ? 'WHISTLE / GO!: ' + MV.replace(/ /g, '/') + ' = PULL THAT WAY. PICKED A WING? IT POPS TO HIM.' : 'WHISTLE / GO!: PUSH THE LEFT STICK ANY WAY. PICKED A WING? IT POPS TO HIM.',
   'QUICK SWIPE + MORE TAPS + BETTER FOGO = MORE WINS.': 'QUICK PULL + MORE TAPS + BETTER FOGO = MORE WINS.',
   'GET ON HIM (YELLOW DOTS = IN RANGE). TAP THE RIGHT SIDE = CHECK.': 'GET ON HIM (YELLOW DOTS = IN RANGE). ' + (k ? 'TAP ' + CH : CK) + ' = CHECK.',
   'RUN AT HIM, HOLD THE RIGHT SIDE (RING FILLS), LET GO = BIG HIT.': k ? 'RUN AT HIM, HOLD ' + CH + ' (RING FILLS), LET GO = BIG HIT.' : 'RUN AT HIM, PRESS ' + HT + ' = BIG HIT.',
   'TAP ANY OF YOUR DEFENDERS (EITHER SIDE) = NOW YOU CONTROL HIM.': k ? 'CLICK ANY OF YOUR DEFENDERS = NOW YOU CONTROL HIM.' : SWB + ' = SWITCH (LEFT STICK POINTS AT WHO).',
   'SAVE! YOUR GOALIE HAS IT. TAP AN OPEN TEAMMATE (GREEN RING) = OUTLET.': k ? 'SAVE! YOUR GOALIE HAS IT. CLICK AN OPEN TEAMMATE (GREEN RING) = OUTLET.' : 'SAVE! LEFT STICK AT AN OPEN TEAMMATE + ' + PA + ' = OUTLET.',
   'ANY GUY CAN GET IT - EVEN UP TOP. OFF SCREEN? TAP HIS EDGE ARROW.': k ? 'ANY GUY CAN GET IT - EVEN UP TOP. OFF SCREEN? CLICK HIS EDGE ARROW.' : 'ANY GUY CAN GET IT - EVEN UP TOP. POINT THE LEFT STICK AT HIM.',
   'DRAG YOUR LEFT THUMB - RUN IT OVER MIDFIELD (THE MIDDLE LINE).': (k ? MV : 'LEFT STICK') + ' - RUN IT OVER MIDFIELD (THE MIDDLE LINE).',
   'DRAG A WING OR AN ATTACKMAN (GREEN RINGS) WHERE YOU WANT HIM.': k ? MV + ' PICKS A WING OR ATTACKMAN, ' + [ SL, SR, SW, TO ].join(' ') + ' MOVES HIM.' : 'LEFT STICK PICKS A WING OR ATTACKMAN, RIGHT STICK MOVES HIM.',
   'TAP DOWN (LEFT SIDE) = YOUR FOGO GETS DOWN. THEN 3-2-1.': (k ? SP : FS) + ' = YOUR FOGO GETS DOWN (SET). THEN 3-2-1.',
   'HOLD A WING. MASH. ON THE WHISTLE: SWIPE ANY WAY = POPS TO HIM.': k ? 'MASH ' + SP + '. ON THE WHISTLE: PULL TOWARD A WING = POPS TO HIM.' : 'MASH ' + FS + '. ON THE WHISTLE: LEFT STICK AT A WING = POPS TO HIM.',
   'LEFT THUMB RUNS AT HIM. HOLD YOUR RIGHT THUMB DOWN = BULL DODGE.': k ? MV + ' RUNS AT HIM. HOLD THE MOUSE ON THE RIGHT SIDE = BULL DODGE.' : 'LEFT STICK RUNS AT HIM. BULL: HOLD THE RIGHT SIDE (TOUCH / MOUSE).',
   'DRAG YOUR WINGS + ATTACKMEN (GREEN RINGS) INTO A FORMATION.': k ? MV + ' PICKS, ' + [ SL, SR, SW, TO ].join(' ') + ' MOVES YOUR WINGS + ATTACKMEN.' : 'LEFT STICK PICKS, RIGHT STICK MOVES YOUR WINGS + ATTACKMEN.',
   'LEFT THUMB RUNS. RIGHT THUMB: DRAW A BACKWARDS C = SWIM PAST HIM.': k ? MV + ' RUNS. ' + SW + ' = SWIM PAST HIM.' : 'LEFT STICK RUNS. RIGHT STICK: DRAW A C = SWIM PAST HIM.',
   'LEFT THUMB RUNS. RIGHT THUMB: DRAW A C = TOE DRAG PAST HIM.': k ? MV + ' RUNS. ' + TO + ' = TOE DRAG PAST HIM.' : 'LEFT STICK RUNS. RIGHT STICK: DRAW A C THE OTHER WAY = TOE DRAG.',
   'RUN TO THE PINK RING. TOUCH THE GOAL, DRAG YOUR THUMB BACK, LET GO.': k ? 'RUN TO THE PINK RING. CLICK THE GOAL, DRAG THE MOUSE BACK, LET GO.' : 'RUN TO THE PINK RING. HOLD ' + SH + ', RIGHT STICK AIMS, LET GO.',
   'DOWN: TAP DOWN (LEFT SIDE) - OR WAIT, HE GETS DOWN BY HIMSELF.': 'DOWN: PRESS ' + (k ? SP : FS) + ' - OR WAIT, HE GETS DOWN BY HIMSELF.',
   'WHISTLE = SWIPE IN ANY DIRECTION. THE BALL POPS OUT THAT WAY.': 'WHISTLE = ' + (k ? MV.replace(/ /g, '/') : 'LEFT STICK') + ' ANY WAY. THE BALL POPS OUT THAT WAY.',
   'TAP DOWN, THEN HOLD ONE OF YOUR WINGS (RING FILLS) = PICKED.': 'PRESS ' + (k ? SP : FS) + ' = DOWN. ' + (k ? MV : 'LEFT STICK') + ' PICKS A WING.',
   'THUMB ON THE BUTTON (RIGHT SIDE), MASH IT ON SET...': 'MASH ' + (k ? SP : FS) + ' ON SET...',
   'WHISTLE = SWIPE IN ANY DIRECTION (OR TAP) TO WIN IT.': 'WHISTLE = ' + (k ? MV.replace(/ /g, '/') : 'LEFT STICK') + ' ANY WAY TO WIN IT.',
   "SWIPE ON THE RIGHT SIDE TO DODGE - NOT NEAR THE GOAL OR YOU'LL SHOOT": k ? SL + ' ' + SR + ' = SPLIT, ' + SW + ' = SWIM, ' + TO + ' = TOE DRAG' : 'FLICK THE RIGHT STICK = SPLIT. DRAW A C = SWIM / TOE DRAG',
   "HOLD ON THE RIGHT SIDE TO BULL DODGE - NOT NEAR THE GOAL OR YOU'LL SHOOT": k ? "HOLD THE MOUSE ON THE RIGHT SIDE = BULL - NOT NEAR THE GOAL" : 'BULL = HOLD THE RIGHT SIDE (TOUCH / MOUSE) - NOT NEAR THE GOAL',
   'GOT IT? TAP ANYWHERE - THEN THE FACEOFF STARTS': k ? 'GOT IT? CLICK ANYWHERE - THEN THE FACEOFF STARTS' : 'GOT IT? PRESS OPTIONS / START - THEN THE FACEOFF STARTS'
  };
  const mo = (s, kv, pv) => { m[s] = k ? kv : pv; };
  mo('TAP PLAYBOOK (TOP LEFT), PICK YOUR PLAY. THEN PICK NO PLAYS.', 'CLICK PLAYBOOK (TOP LEFT), PICK YOUR PLAY. THEN PICK NO PLAYS.', 'TAP / CLICK PLAYBOOK (TOP LEFT), PICK YOUR PLAY. THEN NO PLAYS.');
  mo('TAP CHIRP (BOTTOM MIDDLE) - YOUR BENCH LETS ONE FLY.', 'CLICK CHIRP (BOTTOM MIDDLE) - YOUR BENCH LETS ONE FLY.', 'TAP / CLICK CHIRP (BOTTOM MIDDLE) - YOUR BENCH LETS ONE FLY.');
  mo('SWIPE A TEAMMATE TO MAKE HIM CUT - HE RUNS THAT WAY.', 'DRAG THE MOUSE ACROSS A TEAMMATE = HE CUTS THAT WAY.', 'CUT: SWIPE A TEAMMATE (TOUCH / MOUSE) - HE RUNS THAT WAY.');
  mo('WITH THE BALL: RUN, THEN PUSH THE LEFT STICK TO HIS LEFT OR RIGHT = SPLIT THAT WAY.', 'WITH THE BALL: RUN, THEN ' + SL + ' OR ' + SR + ' = SPLIT THAT WAY.', 'WITH THE BALL: RUN, THEN FLICK THE RIGHT STICK LEFT / RIGHT = SPLIT.');
  mo('RUN, THEN DRAW A HALF CIRCLE WITH THE LEFT STICK = ROLL DODGE.', 'RUN, THEN DRAG A HALF CIRCLE WITH THE MOUSE (LEFT SIDE) = ROLL.', 'RUN, THEN DRAW A HALF CIRCLE WITH THE RIGHT STICK = ROLL / SWIM / TOE.');
  mo('SWIPE STRAIGHT ON THE RIGHT SIDE = ONE HAND. SWIPE AGAIN = TWO.', 'DRAG THE MOUSE STRAIGHT ON THE RIGHT SIDE = ONE HAND. AGAIN = TWO.', 'FLICK THE RIGHT STICK STRAIGHT = SPLIT (ONE HAND: TOUCH / MOUSE).');
  mo('DRAW A C ON THE RIGHT SIDE = TOE DRAG TO YOUR OTHER HAND.', TO + ' = TOE DRAG TO YOUR OTHER HAND.', 'RIGHT STICK C = TOE DRAG TO YOUR OTHER HAND.');
  mo('HOLD A SQUARE ON THE CAGE, SWIPE UP AS YOU LET GO = OVERHAND.', 'CLICK A SQUARE ON THE CAGE, DRAG UP AS YOU LET GO = OVERHAND.', 'HOLD ' + SH + ', RIGHT STICK UP = AIM HIGH. (OVERHAND: TOUCH / MOUSE)');
  mo('HOLD A SQUARE, SWIPE DOWN AS YOU LET GO = UNDERHAND.', 'CLICK A SQUARE, DRAG DOWN AS YOU LET GO = UNDERHAND.', 'HOLD ' + SH + ', RIGHT STICK DOWN = AIM LOW. (UNDERHAND: TOUCH / MOUSE)');
  mo('HOLD A SQUARE, SWIPE SIDEWAYS AS YOU LET GO = SIDEARM.', 'CLICK A SQUARE, DRAG SIDEWAYS AS YOU LET GO = SIDEARM.', 'SIDEARM: HOLD A SQUARE + SWIPE SIDEWAYS (TOUCH / MOUSE).');
  mo('OLD FOXWORTH AT X (BEHIND THE CAGE): TAP THE NET = AIR DIVE.', 'OLD FOXWORTH AT X (BEHIND THE CAGE): CLICK THE NET = AIR DIVE.', 'OLD FOXWORTH AT X (BEHIND THE CAGE): TAP / CLICK THE NET = AIR DIVE.');
  mo('ROLL IS LEFT STICK ONLY NOW: RUN, THEN DRAW A C WITH THE LEFT STICK.', 'ROLL: RUN, THEN DRAG A C WITH THE MOUSE ON THE LEFT SIDE.', 'ROLL: RUN, THEN DRAW A C WITH THE RIGHT STICK (SWIM / TOE OFF).');
  mo('PULL BACK LIKE A SHOT, THEN BRING YOUR THUMB BACK + LET GO = FAKE.', 'DRAG BACK LIKE A SHOT, THEN BRING THE MOUSE BACK + LET GO = FAKE.', 'FAKE: PULL BACK LIKE A SHOT, BRING IT BACK + LET GO (TOUCH / MOUSE).');
  mo('THE SET BUTTON (BOTTOM) IS YOUR OFFENSE SET. TAP IT TILL IT SAYS 2-2-2.', 'THE SET BUTTON (BOTTOM) IS YOUR OFFENSE SET. CLICK IT TILL IT SAYS 2-2-2.', 'THE SET BUTTON (BOTTOM) IS YOUR SET. TAP / CLICK IT TILL IT SAYS 2-2-2.');
  mo('THE D BUTTON (BOTTOM) PICKS YOUR D. TAP IT TILL BLACK = EVERYONE LOCKS OFF.', 'THE D BUTTON (BOTTOM) PICKS YOUR D. CLICK IT TILL BLACK = ALL LOCK OFF.', 'THE D BUTTON (BOTTOM) PICKS YOUR D. TAP / CLICK TILL BLACK = ALL LOCK OFF.');
  for (const s in m) if (m[s] == null) delete m[s];
  return m;
 }
 const TT = { mode: null, ver: '', map: null, cache: new Map };
 let W0x = s => s.length * 4;
 function trTut(s) {
  if (typeof s !== 'string' || off()) return s;
  let G; try { G = game; } catch (e) { return s; }
  if (!G || !G.tutorial) return s;
  const mode = st.tutMode(); if (!mode) return s;
  const ver = mode + JSON.stringify(kb()) + JSON.stringify(pb());
  if (TT.ver !== ver) { TT.ver = ver; TT.map = tutMap(mode); TT.cache.clear(); TT.mode = mode; }
  let r = TT.cache.get(s);
  if (r === undefined) {
   r = TT.map[s];
   if (r == null) {
    r = s;
    if (mode === 'key') r = r.replace(/\bTAP ANYWHERE\b/g, 'CLICK ANYWHERE').replace(/\bTAP TO GO ON\b/g, 'CLICK TO GO ON');
    else {
     const r0 = r;
     for (const w of [ 'OPTIONS / START TO GO ON', 'OPTIONS/START = GO ON', 'OPTIONS/START' ]) { r = r0.replace(/\bTAP (ANYWHERE )?TO GO ON\b/g, w); if (r === r0 || W0x(r) <= W - 12) break; }
    }
   }
   TT.cache.set(s, r);
  }
  return r;
 }
 st.trTut = trTut;
 function wrapText() {
  const T0 = window.text, W0 = window.textW;
  if (typeof T0 !== 'function' || typeof W0 !== 'function') return;
  W0x = s => W0(s, 1);
  window.text = function (s) { const a = arguments; if (typeof s === 'string') { const r = trTut(s); if (r !== s) { const b = Array.from(a); b[0] = r; return T0.apply(this, b); } } return T0.apply(this, a); };
  window.textW = function (s) { const a = arguments; if (typeof s === 'string') { const r = trTut(s); if (r !== s) { const b = Array.from(a); b[0] = r; return W0.apply(this, b); } } return W0.apply(this, a); };
 }

 st.tutMode = () => { const m = st.inputMode(); return m === 'pad' || m === 'key' ? m : null; };

 wrapSettings();
 wrapText();
 if (padConnected()) padStart();
})();
