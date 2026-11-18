// ===== BAGGA LAX v519joy.js - SMOOTHER JOYSTICK, NO MORE RANDOM STOPS =====
// Charlie (Nov 11, 10:47 PM, web 55w): "There's a new joystick glitch, keeps making me stop moving ... make the joystick movement
//  more fluent and smooth, sometimes it stops your player".
// What stopped the player while the thumb was still on the stick (game.js joyMove / joyRelease / watchScreen / inDown / liveTap):
//  1) DEAD-ZONE SNAP: the stick's centre follows the thumb once it goes past the edge (JOY_MAX 54 px). Pull the thumb back a little
//     after that and it lands inside the 6 px dead zone of the moved centre -> joyRelease -> G.run = null + "STOP" flash, even though
//     the thumb never let go. Measured in headless touch runs: 5% of held frames (runs of 2-22 frames) were full stops from this.
//  2) A SECOND-FINGER TAP on empty field (to shoot / pass / FAKE and missing by a bit) = liveTap() "tap to stop" -> G.run = null and
//     the stop flash for a frame while the stick is held (joyTick re-applied it a frame later). Same inline stop on defense.
//  3) SCREEN BLIPS: any screen change that isn't live <-> defense (a banner / call / whistle that comes straight back) released the
//     stick AND marked the held thumb stale, so the stick stayed dead until you lifted and re-placed the thumb.
//  4) A thumb put down during the 0.25 s input lock after a screen change was marked stale for good (same: dead until re-placed).
//  5) A lost touch (touchcancel from the OS, no touchend) stopped you on the spot.
// Not the cause: the FAKE button (v507). Its handlers only take the finger that taps the button (changedTouches / its own pointer);
//  bisected with window.__rl_no507fake / __rl_no513chk - identical stop counts with and without them.
// What this file does (offline and online alike - input only; player speeds, ids, rl_* keys and the net protocol are untouched):
//  - the stick keeps tracking its own touch id; other fingers' touchend / touchcancel / taps never stop it (a 2nd-finger miss-tap
//    while you are running is ignored instead of "stop").
//  - the centre no longer chases the thumb at the edge: past the edge the push is clamped (full speed), and the centre only follows
//    once the thumb is K.follow px away (so pulling back a bit never lands in the dead zone).
//  - small dead zone (K.dead px) with a short hold: the run eases off and only stops after the thumb has sat in the dead zone for
//    K.relHold s (a deliberate "thumb back to centre" still stops you; jitter through the centre doesn't).
//  - analog speed (unchanged formula) with a short ease (K.ease s) so speed changes glide instead of jump.
//  - a touch lost without touchend keeps the last direction for K.lostKeep s before stopping.
//  - a held thumb survives screen blips (banner / call) and comes back as the stick when play resumes (live / defense); a thumb
//    put down during the input lock, or held on the left half through a faceoff / whistle, becomes the stick once play is on and
//    the lock has ended (centred where the thumb is; if it only taps, the tap is swallowed, like before).
// Kill switch: window.__rl_no519joy = true -> exactly 55w. Stats: window.V519J.ST.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_no519joy || W0.V519J) return;
 const need = [ 'joyMove', 'joyApply', 'joyRelease', 'joyTick', 'joyStart', 'watchScreen', 'inDown', 'inUp', 'liveTap', 'setRun' ];
 for (const n of need) if (typeof W0[n] !== 'function') return;
 try { if (typeof joy === 'undefined' || typeof pointers === 'undefined' || typeof JOY_MAX === 'undefined') return; } catch (e) { return; }
 const K = { dead: 5, follow: 88, relHold: .14, ease: .07, lostKeep: .12, blipMax: 4, adoptHold: .1 };
 const ST = { dzHeld: 0, dzStops: 0, follow: 0, tapIgnored: 0, restored: 0, lostKeep: 0, blipKeep: 0, adopted: 0, errs: [] };
 const V = W0.V519J = { on: true, K: K, ST: ST };
 const off = () => !!(W0.__rl_no519joy || W0.__rl_v124gb);
 const err = (e, w) => { try { if (ST.errs.length < 8) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v519joy', w, e); } } catch (x) {} };
 const T = () => now();
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const held = () => !!(joy && pointers.has(joy.id));
 const JM0 = W0.joyMove, JR0 = W0.joyRelease, JT0 = W0.joyTick, WS0 = W0.watchScreen, ID0 = W0.inDown, IU0 = W0.inUp, LT0 = W0.liveTap, JA0 = W0.joyApply;
 let blip = null;    // { id, ox, oy, t } a held stick thumb during a non-play screen
 // ---------- joystick vector: clamp at the edge, follow only far out, dead zone with a short hold ----------
 W0.joyMove = function (pt) {
  if (off()) return JM0.apply(this, arguments);
  try {
   if (!joy || joy.id !== pt.id) return;
   let vx = pt.cx - joy.ox, vy = pt.cy - joy.oy, d = Math.hypot(vx, vy);
   if (d > K.follow) {
    joy.ox = pt.cx - vx / d * K.follow; joy.oy = pt.cy - vy / d * K.follow;
    vx = pt.cx - joy.ox; vy = pt.cy - joy.oy; d = K.follow; ST.follow++;
   }
   const dz = joy.on ? K.dead : (joy.dead || JOY_DEAD);
   if (d < dz) {
    if (joy.on && !joy.dz519) { joy.dz519 = T(); ST.dzHeld++; }
    return;
   }
   joy.dz519 = 0;
   const dc = Math.min(d, JOY_MAX);
   const m = .3 + .7 * cl((dc - JOY_DEAD) / (JOY_MAX - JOY_DEAD), 0, 1);
   joy.d231 = dc;
   joy.mT519 = m;
   joyApply(vx / d, vy / d, m);
  } catch (e) { err(e, 'move'); return JM0.apply(this, arguments); }
 };
 // ease the speed: joyApply sets the target; the run's m glides to it
 W0.joyApply = function (ux, uy, m) {
  if (off()) return JA0.apply(this, arguments);
  const m0 = joy && joy.on && joy.mE519 != null ? joy.mE519 : null;
  const r = JA0.apply(this, arguments);
  try {
   const G = game;
   if (joy) { joy.mT519 = m; if (m0 != null) { joy.m = m0; if (G && G.run && G.run.joy) G.run.m = m0; } joy.mE519 = joy.m; }
  } catch (e) { err(e, 'apply'); }
  return r;
 };
 W0.joyRelease = function (end) {
  try { if (joy) { joy.dz519 = 0; joy.mE519 = null; joy.lost519 = 0; } } catch (e) {}
  return JR0.apply(this, arguments);
 };
 // ---------- per frame ----------
 W0.joyTick = function () {
  if (off()) return JT0.apply(this, arguments);
  try {
   const G = game;
   adoptTick();
   if (G && joy && joy.on) {
    const t = T();
    if (joy.lost519) {   // touch vanished without a touchend: keep going a moment
     if (t - joy.lost519 >= K.lostKeep) { JR0(true); return; }
     if (!G.run && !(G.pset && screen === 'live')) { setRun(joy.ux, joy.uy, false); if (G.run) { G.run.m = joy.m; G.run.joy = true; } }
     return;
    }
    if (joy.dz519) {   // thumb back in the dead zone: ease off, stop only if it stays there
     const el = t - joy.dz519;
     if (el >= K.relHold) { joy.dz519 = 0; ST.dzStops++; JR0(false); return; }
     joy.mT519 = .3;
    }
    if (joy.mT519 != null) {
     const dt = Math.max(0, Math.min(.05, t - (joy.mt519 || t)));
     const cur = joy.mE519 != null ? joy.mE519 : joy.m, tg = joy.mT519;
     const k = K.ease > 0 ? Math.min(1, dt / K.ease) : 1;
     const nm = cur + (tg - cur) * k;
     joy.m = joy.mE519 = nm;
     if (G.run && G.run.joy) G.run.m = nm;
    }
    joy.mt519 = t;
   }
  } catch (e) { err(e, 'tick'); }
  return JT0.apply(this, arguments);
 };
 // ---------- other fingers can't stop the stick ----------
 W0.liveTap = function () {
  if (!off()) try { if (joy && joy.on && held() && game && game.run) { ST.tapIgnored++; return; } } catch (e) {}
  return LT0.apply(this, arguments);
 };
 W0.inUp = function (id, e, cancel) {
  if (off()) return IU0.apply(this, arguments);
  let isJoy = false, sf = 0, wasRun = false;
  try {
   const pt = pointers.get(id);
   isJoy = !!(pt && joy && joy.id === id);
   if (pt && pt.adopt519 && !pt.swiped) pt.stale = true;   // an adopted thumb that only tapped: swallow the tap, as before
   if (isJoy && cancel && joy.on && !(pt && pt.stale)) {   // lost touch (touchcancel): keep the last direction briefly
    pointers.delete(id);
    joy.lost519 = T(); ST.lostKeep++;
    if (stick && stick.id === id) stick = null;
    return;
   }
   if (!isJoy && joy && joy.on && held()) { const G = game; sf = G ? G.stopFlash || 0 : 0; wasRun = !!(G && G.run && G.run.joy); }
  } catch (x) { err(x, 'up0'); }
  const r = IU0.apply(this, arguments);
  try {
   const G = game;
   if (!isJoy && wasRun && G && joy && joy.on && held() && !G.run && (screen === 'live' || screen === 'defense')) {   // e.g. defense's inline field-tap "stop"
    setRun(joy.ux, joy.uy, false);
    if (G.run) { G.run.m = joy.m; G.run.joy = true; G.stopFlash = sf; ST.restored++; }
   }
  } catch (x) { err(x, 'up1'); }
  return r;
 };
 // ---------- screen blips + the input lock ----------
 W0.watchScreen = function () {
  if (off()) return WS0.apply(this, arguments);
  let pre = null;
  try {
   const k = screen + (paused ? '+P' : '');
   if (k !== seenKey && joy && held() && /^(live|defense)$/.test(seenKey) && !/^(live|defense)$/.test(k) && !paused) {
    pre = { id: joy.id, ox: joy.ox, oy: joy.oy, t: T(), ux: joy.ux, uy: joy.uy, on: joy.on };
   }
  } catch (e) { err(e, 'ws0'); }
  const r = WS0.apply(this, arguments);
  try {
   if (pre) blip = pre;
   if (blip && (paused || T() - blip.t > K.blipMax || !pointers.has(blip.id))) blip = null;
   if (blip && !joy && (screen === 'live' || screen === 'defense') && game) {
    const pt = pointers.get(blip.id);
    const b = blip; blip = null;
    if (pt) {
     pt.stale = false; pt.role = 'field'; pt.screen = screen; pt.zone = 'L'; pt.adopt519 = true; pt.swiped = true;
     joyStart(pt);
     joy.ox = b.ox; joy.oy = b.oy;
     ST.blipKeep++;
     W0.joyMove(pt);
    }
   }
  } catch (e) { err(e, 'ws1'); }
  return r;
 };
 W0.inDown = function (id, e) {
  const r = ID0.apply(this, arguments);
  if (off()) return r;
  try {
   const pt = pointers.get(id);
   if (pt && pt.stale && pt.zone === 'L' && (screen === 'live' || screen === 'defense') && now() < inputLockUntil && !(joy && held())) pt.lock519 = true;
  } catch (x) { err(x, 'down'); }
  return r;
 };
 function adoptTick() {
  if (joy && held()) return;
  if (!(screen === 'live' || screen === 'defense') || now() < inputLockUntil || !game) return;
  for (const pt of pointers.values()) {
   if (!pt.stale || pt.zone !== 'L' || pt.role === 'pm') continue;
   const fresh = !!pt.lock519 && pt.screen === screen;
   if (fresh && now() - pt.t0 < K.adoptHold && pt.moved < JOY_DEAD * 2) continue;
   pt.lock519 = false; pt.stale = false; pt.role = 'field'; pt.adopt519 = true; pt.screen = screen;
   joyStart(pt);
   if (!fresh) { joy.ox = pt.cx; joy.oy = pt.cy; }   // a thumb held over from the last screen: the stick centres where it is now
   ST.adopted++;
   W0.joyMove(pt);
   return;
  }
 }
})();
