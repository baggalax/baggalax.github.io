/* v467keys.js - Bagga Lax desktop keyboard controls (V41.2, ?v=4067).
   Replaces the unshipped v443keys.js (keyboard part only; its mouse layer is NOT carried:
   the game's own pointer handlers already treat a mouse exactly like a finger).
   Charlie's map (Nov 9 2026): W A S D = move; Left = split left, Right = split right,
   Up = swim, Down = toe drag. Extra kept from v443: Shift = check (tap) / big hit (hold) on
   defense (v443's E = sub and Esc = pause were dropped: not part of the spec, untested).
   Input only: every key calls the same game function the touch control calls
   (setRun = joystick, doDodge = dodge swipe, dCheck/dHit = defense hold).
   Nothing runs until a real (trusted) keydown, so phones and tablets are untouched.
   Kill switch: window.__rl_no467keys = true. Self-contained: drops onto the 1.1 tree too. */
(function () {
 'use strict';
 if (window.__rl_no467keys) return;
 window.__rl_no443keys = true;            // v467 replaces v443 if both ever load
 const off = () => !!window.__rl_no467keys;
 const K = { w: 0, a: 0, s: 0, d: 0 };
 // V41.3 (v468ctl): keys come from rl_binds467 (CONTROLS > KEYS), else Charlie's defaults.
 const KDEF = { up: 'w', left: 'a', down: 's', right: 'd', splitL: 'ArrowLeft', splitR: 'ArrowRight', swim: 'ArrowUp', toe: 'ArrowDown', check: 'Shift', foSet: ' ' };
 const MOVE = { up: 'w', left: 'a', down: 's', right: 'd' }, DODGE_K = { splitL: 'ArrowLeft', splitR: 'ArrowRight', swim: 'ArrowUp', toe: 'ArrowDown' };
 let B = null;
 function binds() {
  if (B) return B;
  B = Object.assign({}, KDEF);
  try { const o = JSON.parse(localStorage.getItem('rl_binds467') || 'null'); if (o) for (const a in KDEF) if (typeof o[a] === 'string' && o[a]) B[a] = o[a]; } catch (e) {}
  return B;
 }
 function act(k) { const b = binds(); for (const a in b) if (b[a] === k) return a; return null; }
 window.addEventListener('rl-binds', () => { B = null; K.w = K.a = K.s = K.d = 0; });
 window.addEventListener('storage', e => { if (!e.key || e.key === 'rl_binds467') B = null; });
 const st = { armed: false, dir: null, hist: [], lastSharp: -9, shift: null, log: [], last: null };
 window.__rl467 = st;
 const T = () => (typeof now === 'function' ? now() : performance.now() / 1e3);
 const note = (k, v) => { st.last = { k: k, v: v, t: +T().toFixed(2) }; st.log.push(st.last); if (st.log.length > 60) st.log.shift(); };
 function typing() {
  const a = document.activeElement;
  if (!a || a === document.body) return false;
  const tg = (a.tagName || '').toUpperCase();
  return tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || !!a.isContentEditable;
 }
 function inGame() { try { return gameInputOn() && (screen === 'live' || screen === 'defense'); } catch (e) { return false; } }
 function gameScreen() { try { return typeof GAME_SCREENS !== 'undefined' && GAME_SCREENS.includes(screen); } catch (e) { return false; } }
 function touchJoy() { try { return !!(joy && joy.on); } catch (e) { return false; } }
 function wasd() {
  const x = K.d - K.a, y = K.s - K.w, L = Math.hypot(x, y);
  return L ? [ x / L, y / L ] : null;      // diagonals run the same speed as straight
 }
 // ---- movement: the joystick's own calls (joyApply in game.js: setRun + G.run, full stick) ----
 function stopRun() {
  const G = game;
  st.dir = null;
  if (G && G.run && G.run.kb467) { G.run = null; G.stopFlash = .25; }
 }
 function applyMove() {
  if (!st.armed || off() || touchJoy()) return;
  const G = game; if (!G) return;
  const u = inGame() ? wasd() : null;
  if (!u) { if (st.dir) stopRun(); return; }
  if (G.pset && screen === 'live' && !(G.pset.p284 && typeof on284 === 'function' && on284())) return;
  const t = T();
  st.hist.push([ t, u[0], u[1] ]);
  while (st.hist.length > 2 && st.hist[1][0] < t - .2) st.hist.shift();
  const ref = st.hist[0], dot = ref[1] * u[0] + ref[2] * u[1];
  const changed = !st.dir || st.dir[0] !== u[0] || st.dir[1] !== u[1];
  const had = !!(G.run && G.run.kb467);
  if (!had) setRun(u[0], u[1], !st.dir);
  else if (changed && dot < .25 && T() - st.lastSharp > .35) { st.lastSharp = t; st.hist = [ [ t, u[0], u[1] ] ]; setRun(u[0], u[1], true); }
  if (G.run) { G.run.x = u[0]; G.run.y = u[1]; G.run.m = 1; G.run.joy = true; G.run.kb467 = true; }
  st.dir = u;
 }
 function loop() {
  if (off()) { if (st.dir) { try { stopRun(); } catch (e) {} } st.armed = false; return; }
  try { applyMove(); } catch (e) { console.warn('v467keys', e); }
  requestAnimationFrame(loop);
 }
 function arm() { if (st.armed) return; st.armed = true; note('armed', true); requestAnimationFrame(loop); }
 // ---- dodges: doDodge(kind, ux, uy, spin), the exact call the touch dodge swipe makes ----
 // Split: a straight swipe; (ux,uy) is the swipe's screen direction, so Left = a swipe to the
 // left, Right = a swipe to the right (doDodge names those sides 'left'/'right').
 // Swim / toe drag: the C strokes; (ux,uy) is the stroke's chord = the sideways step. Keys use
 // W/S if held (up/down the screen), else the side of the carrier's run toward the cage.
 function lateralDir() {
  const c = game.carrier, vy = K.s - K.w;
  if (vy) return [ 0, vy ];
  const f = wasd() || carrierFace(), tx = GX - c.x, ty = CY - c.y, p = [ -f[1], f[0] ];
  return p[0] * tx + p[1] * ty >= 0 ? p : [ -p[0], -p[1] ];
 }
 function dodgeKey(k) {
  if (screen !== 'live' || !canShoot()) { note('dodge', { key: k, ok: false, why: 'no ball' }); return false; }
  let kind, r;
  if (k === 'ArrowLeft') { kind = 'split'; r = doDodge('split', -1, 0, -1); }
  else if (k === 'ArrowRight') { kind = 'split'; r = doDodge('split', 1, 0, 1); }
  else {
   kind = k === 'ArrowUp' ? 'swim' : 'toe';
   const u = lateralDir(), spin = kind === 'swim' ? 1 : -1;
   if (typeof m28on === 'function' && !m28on()) kind = 'roll';   // same fallback the C swipe takes when swim/toe are off
   r = doDodge(kind, u[0], u[1], spin);
  }
  try { lastTap = { kind: kind, ok: !!r, side: r ? r.side : null, kb: k }; } catch (e) {}
  note('dodge', { key: k, kind: kind, ok: !!r });
  return !!r;
 }
 // ---- defense: Shift = the touch hold (G.dHold) -> dCheck() on a tap, dHit() past DZ.hitHold ----
 function shiftDown() {
  const G = game;
  if (screen !== 'defense' || !G || G.ball.state === 'clear') return;
  if (G.ball.state === 'held' && G.dcar) { st.shift = { t0: T() }; G.dHold = { id: 'kb467', t0: T() }; }
  else if (G.ball.state !== 'held' && dLateTarget()) st.shift = { t0: T(), late: true };
 }
 function shiftUp() {
  const S0 = st.shift; st.shift = null;
  const G = game;
  if (G && G.dHold && G.dHold.id === 'kb467') G.dHold = null;
  if (!S0 || screen !== 'defense') return;
  const dur = T() - S0.t0, hit = dur >= DZ.hitHold, r = hit ? dHit() : dCheck();
  try { lastTap = { kind: hit ? 'hit' : 'check', r: r, kb: true }; } catch (e) {}
  note(hit ? 'hit' : 'check', r);
 }
 const ARROWS = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1 };
 const HELD = new Set;
 window.addEventListener('keydown', e => {
  if (off() || !e.isTrusted || typing() || e.ctrlKey || e.metaKey || e.altKey) return;
  arm();
  const k = e.key, low = k.length === 1 ? k.toLowerCase() : k, a = act(low);
  if ((ARROWS[k] || k === ' ' || (a && k.length === 1 && !/[a-z0-9]/i.test(k))) && gameScreen()) e.preventDefault();      // no page scroll in a game
  const rep = e.repeat || HELD.has(e.code); HELD.add(e.code);
  if (MOVE[a]) { K[MOVE[a]] = 1; if (inGame()) { e.preventDefault(); applyMove(); } return; }
  if (rep) return;
  if (!inGame()) return;
  if (DODGE_K[a]) { e.preventDefault(); dodgeKey(DODGE_K[a]); return; }
  if (a === 'check') shiftDown();
 }, false);
 window.addEventListener('keyup', e => {
  HELD.delete(e.code);
  if (off() || !st.armed) return;
  const k = e.key, low = k.length === 1 ? k.toLowerCase() : k, a = act(low);
  if (MOVE[a]) { K[MOVE[a]] = 0; try { applyMove(); } catch (er) {} return; }
  if (a === 'check') { try { shiftUp(); } catch (er) {} }
 }, false);
 window.addEventListener('blur', () => { if (!st.armed) return; K.w = K.a = K.s = K.d = 0; HELD.clear(); st.shift = null; try { applyMove(); } catch (e) {} });
 window.V467KEYS = { on: () => !off(), armed: () => st.armed, st: st, keys: K, binds: () => Object.assign({}, binds()), act: act };
})();
