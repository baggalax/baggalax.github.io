/* v492fix.js - Bagga Lax 1.2 blocker fix (kill switch: window.__rl_no492fix = true -> exactly the old behaviour).
 * Charlie (Nov 10, 11:10 AM, beta site): "when the goalie saves it it just gives it to one of my defenders not the goalie".
 * Root cause (reproduced headless with real touch events, 4 of 5 runs): on D you tap the shooter to CHECK him (game.js inDown
 * gives that touch role 'field' while the shot is in the air). If the save lands while the finger is still down, or you tap
 * again a moment later (mashing CHECK), game.js inUp (the ball.state === 'clear' branch, ~L2856) reads the release as a
 * clear OUTLET tap and dThrowClear() throws the ball straight to whichever of your defenders is within MATE_PX (50 css px)
 * of where you tapped - i.e. the defender standing next to the shooter. From the phone: SAVE!, then the ball is instantly
 * on a defender, never in the goalie's stick (the goalie is often off camera there, so it reads as "given" to the D-man).
 * Fix: after a save / goalie scoop (any startClear by your goalie), a tap counts as an outlet only when the finger went
 * down AFTER the clear began plus a short grace (GRACE s) and is not part of the same tap train (a tap starting less than
 * TRAIN s after the previous tap ended, while that train began before the save, up to TRAIN_MAX s after it). Touches
 * already down at the save and a CHECK mash that runs on after it do nothing; the goalie keeps the ball. Lift, look,
 * tap a teammate (a pause of TRAIN s or more) and the outlet works exactly as before,
 * and so do the joystick (carry it out), the edge arrows, the controller / keyboard outlet and every CPU path.
 * Offline and online both use the same local touch handling; no ids, rl_* keys, __rl_* flags or net messages change.
 * Read-back: window.V492 (LOG.blocked / LOG.passed / LOG.last).
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v492fix_loaded) return;
 W0.__rl_v492fix_loaded = 1;
 const off = () => !!W0.__rl_no492fix || !!W0.__rl_v124gb;
 const GRACE = 0.45, TRAIN = 0.35, TRAIN_MAX = 2.0;
 let lastUp = -1e9, lastHot = false;
 const LOG = { clears: 0, blocked: 0, passed: 0, last: null, err: 0 };
 W0.V492 = { on: () => !off(), LOG: LOG, GRACE: GRACE, TRAIN: TRAIN, TRAIN_MAX: TRAIN_MAX };
 if (typeof W0.startClear !== 'function' || typeof W0.inUp !== 'function' || typeof W0.inDown !== 'function') { W0.V492.why = 'no hooks'; return; }
 const T = () => { try { return now(); } catch (e) { return performance.now() / 1e3; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const PT = id => { try { return pointers.get(id); } catch (e) { return null; } };
 const isGk = h => !!h && (h.team === 'G2' || !!h.gk);
 // 1. remember when your goalie's clear began
 const SC0 = W0.startClear;
 W0.startClear = function (holder) {
  const r = SC0.apply(this, arguments);
  try { const G = G_(); if (G && G.dclear && isGk(G.dclear.holder)) { G.clr492 = { t: T(), h: G.dclear.holder }; LOG.clears++; } } catch (e) { LOG.err++; }
  return r;
 };
 // 2. tag every touch with the ball state it started in
 const ID0 = W0.inDown;
 W0.inDown = function (id) {
  const r = ID0.apply(this, arguments);
  try {
   const pt = PT(id), G = G_();
   if (pt && G && G.ball) {
    const t = T(); pt.bs492 = G.ball.state; pt.t492 = t;
    const C = G.clr492;
    pt.hot492 = scr() === 'defense' && (G.ball.state !== 'clear' || !C || t < C.t + GRACE || (lastHot && t - lastUp < TRAIN && t < C.t + TRAIN_MAX));
   }
  } catch (e) { LOG.err++; }
  return r;
 };
 // 3. a touch that began before (or right at) the goalie's save is not an outlet pass
 const IU0 = W0.inUp;
 W0.inUp = function (id, e, cancel) {
  try {
   const G = G_(), pt = PT(id);
   if (!off() && pt && G && !G.tutorial && scr() === 'defense' && G.ball && G.ball.state === 'clear' && G.dclear && isGk(G.dclear.holder)
     && G.clr492 && G.clr492.h === G.dclear.holder && (pt.role === 'field' || pt.role === 'tap' || pt.role === 'dhold' || pt.role === 'dsw')) {
    const t0 = pt.t492 != null ? pt.t492 : pt.t0;
    const early = pt.bs492 !== 'clear' || t0 < G.clr492.t + GRACE || !!pt.hot492;
    if (early) {
     pt.stale = true;          // game.js inUp: still releases the joystick, then returns before any tap handling
     LOG.blocked++; LOG.last = { t: +(+G.t || 0).toFixed(2), role: pt.role, bs0: pt.bs492 || '', dt: +(t0 - G.clr492.t).toFixed(2) };
    } else LOG.passed++;
   }
  } catch (x) { LOG.err++; }
  try { const pt = PT(id); if (pt) { lastUp = T(); lastHot = !!pt.hot492 && scr() === 'defense'; } } catch (x) {}
  return IU0.apply(this, arguments);
 };
})();

/* ---- Bug 3: "My World Games didn't save" (live 1.1 too; old code, not today's) ----
 * Root cause: game.js loads the saved run at script-load time (L15462: let wgame = (() => { const w = LS.get('wg'); return wgOk16(w) ? w : null })()).
 * wgOk16 checks the current 30-country format (v 2318) against WG30_POOLS, which is a const declared ~280 lines LOWER in
 * game.js (L15742). At L15462 it is still in its temporal dead zone, so the check throws ReferenceError, the try/catch
 * returns false, and every v2318 run (the format all new World Games use) boots as "no run" - although rl_wg on disk is
 * intact (gp:1 after one game in the test). The run then looks gone, and starting a new one overwrites it for good.
 * Saving was never the problem: wgPlayed16 already writes rl_wg after every result.
 * Fix: right after load (this file runs after game.js and every add-on), if no run is in memory but rl_wg holds a valid
 * one, load it through the game's own __rl.reloadWg(). Belt and braces asked for in the steer: write rl_wg again on
 * entering the World Games lobby (wgHub) and on visibilitychange->hidden and pagehide (same rl_wg key, same LS.set).
 */
(function () {
 const W0 = window;
 if (W0.__rl_v492wg_loaded) return;
 W0.__rl_v492wg_loaded = 1;
 const off = () => !!W0.__rl_no492fix || !!W0.__rl_v124gb;
 const L = { restored: 0, saves: 0, why: [], err: 0 };
 (W0.V492 = W0.V492 || {}).WG = L;
 const R = () => W0.__rl;
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 function boot() {
  try {
   if (off() || !R() || R().wgame) return;
   let raw = null; try { raw = JSON.parse(localStorage.getItem('rl_wg') || 'null'); } catch (e) { return; }
   if (!raw || !R().wgOk16(raw)) return;
   const w = R().reloadWg();
   if (w) { L.restored++; L.why.push('boot'); try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {} }
  } catch (e) { L.err++; }
 }
 function save(why) {
  try {
   if (off() || !R() || !R().wgame || typeof wgSave16 !== 'function') return;
   wgSave16(); L.saves++; if (L.why.length < 40) L.why.push(why);
  } catch (e) { L.err++; }
 }
 boot();
 try { document.addEventListener('DOMContentLoaded', boot); W0.addEventListener('load', boot); } catch (e) {}
 try {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save('hidden'); });
  W0.addEventListener('pagehide', () => save('pagehide'));
 } catch (e) {}
 let lastScr = '';
 setInterval(() => { try { const s = scr(); if (s === 'wgHub' && lastScr !== 'wgHub') save('lobby'); lastScr = s; } catch (e) {} }, 250);
 L.boot = boot; L.save = save;
})();
