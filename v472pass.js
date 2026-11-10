/* v472pass.js - Bagga Lax PASS MODE (V41.4 / 1.2, ?v=4072).
   Settings > CONTROLS gets PASS MODE: SHOOTER PRO (default, today's touch passing: tap the teammate you
   want, game.js inUp ~2775) or PASSER PRO (tap the right side of the screen and the ball goes to the
   teammate the move joystick points at; joystick idle = the nearest teammate).
   - The target comes from the SAME picker the controller Cross pass uses (v468ctl aimedMate over
     liveMates()), and the pass is still thrown by the game's own inUp -> throwPass path (so the v404g /
     v416p "user pass" guards, tutorials, lastTap and online host sync see a normal tap pass).
     Only a quick tap that would have been a plain field tap (role 'field', right zone, not the joystick
     finger) changes target; shots (goal corner / SHOT26 cage), dodges, ground-ball switches, cut / pick
     calls and the joystick finger are untouched.
   - A yellow pixel ring under the feet of the teammate who will get the ball, live with the stick.
     Shown in PASSER PRO (touch / mouse) and ALWAYS for a controller (controllers are passer-style).
   - Stored in rl_passmode472 ("shooter" | "passer"). Tutorials keep SHOOTER PRO (their text teaches the tap).
   Kill switch: window.__rl_no472pass = true (no toggle, no ring, passing exactly as before). */
(function () {
 'use strict';
 if (window.__rl_no472pass) return;
 const KEY = 'rl_passmode472';
 const off = () => !!window.__rl_no472pass;
 const ST = { n: 0, last: null, ring: null, rings: 0 };
 function mode() { try { return localStorage.getItem(KEY) === 'passer' ? 'passer' : 'shooter'; } catch (e) { return 'shooter'; } }
 function setMode(m) { try { localStorage.setItem(KEY, m === 'passer' ? 'passer' : 'shooter'); } catch (e) {} }
 const C = () => window.V468CTL && V468CTL.st;
 const picker = () => window.V468CTL && typeof V468CTL.aimedMate === 'function' ? V468CTL.aimedMate : null;
 const padIn = () => { const s = C(); return !!(s && s.padOn && s.inputMode && s.inputMode() === 'pad'); };
 // where the carrier is being steered right now: the touch joystick, else a keyboard run, else idle
 function moveDir() {
  try { if (typeof joy !== 'undefined' && joy && joy.on && pointers.has(joy.id)) return { x: joy.ux, y: joy.uy, m: joy.m || 1 }; } catch (e) {}
  const G = typeof game !== 'undefined' ? game : null, r = G && G.run;
  if (r && r.kb467) { const d = Math.hypot(r.x, r.y) || 1; return { x: r.x / d, y: r.y / d, m: 1 }; }
  return { x: 0, y: 0, m: 0 };
 }
 function carrying() {
  const G = typeof game !== 'undefined' ? game : null;
  try { return !!(G && screen === 'live' && G.carrier && canShoot() && !G.over); } catch (e) { return false; }
 }
 // touch / mouse PASSER PRO is live for this play
 function passerLive() { return !off() && mode() === 'passer' && carrying() && !game.tutorial && !!picker(); }
 function pick(dir) { const f = picker(); if (!f) return null; let list = []; try { list = liveMates(); } catch (e) {} return list.length ? f(dir, list) : null; }

 // ---------------- the pass: re-aim the tap pass inside the game's own inUp ----------------
 let aim = null;   // set only while inUp handles a PASSER PRO tap
 function eligible(pt, cancel) {
  if (cancel || !pt || pt.stale || pt.screen !== 'live' || pt.zone !== 'R' || pt.role !== 'field' || pt.joy) return false;
  if (pt.cutDone || pt.pickCalled || pt.bullDone || pt.swiped || pt.dodgeStroke) return false;
  return passerLive();
 }
 const IU0 = window.inUp, NM0 = window.nearestMateCss;
 if (typeof IU0 === 'function' && typeof NM0 === 'function') {
  window.inUp = function (id, e, cancel) {
   let pt = null;
   try { pt = pointers.get(id); if (eligible(pt, cancel)) aim = { dir: moveDir(), id: id }; } catch (er) { aim = null; }
   try { return IU0.apply(this, arguments); } finally { aim = null; }
  };
  window.nearestMateCss = function (cx, cy, k, rad) {
   if (aim && !off()) {
    const m = pick(aim.dir);
    if (m) {
     ST.n++;
     ST.last = { to: m.idx, dir: [ +aim.dir.x.toFixed(2), +aim.dir.y.toFixed(2), +(+aim.dir.m).toFixed(2) ], t: +(game.t || 0).toFixed(2) };
     aim = null;
     return m;
    }
   }
   return NM0.apply(this, arguments);
  };
 }

 // ---------------- the ring under the receiver ----------------
 function ringTarget() {
  if (off() || !carrying() || !picker()) return null;
  const G = game;
  if (G.carrier.team !== 'O') return null;
  if (padIn()) { const L = C().padL || { x: 0, y: 0, m: 0 }; return pick(L); }
  if (!passerLive()) return null;
  return pick(moveDir());
 }
 function drawRing() {
  const p = ringTarget(); ST.ring = p ? p.idx : null;
  if (!p) return;
  ST.rings++;
  const x = p.x + (p._sox || 0), y = p.y + (p._soy || 0), t = (typeof menuT === 'number' ? menuT : performance.now() / 1e3), r = 9 + (Math.floor(t * 6) % 2);
  for (let a = 0; a < 6.283; a += .12) {
   const cx = x + Math.cos(a) * r, cy = y + Math.sin(a) * r * .45;
   px(cx, cy + 1, 'rgba(0,0,0,.6)');
   px(cx, cy, '#ffe14d');
   px(x + Math.cos(a) * (r + 1), y + Math.sin(a) * (r + 1) * .45, '#ffe14d');
  }
 }
 // drawGear runs inside the world transform right before the live players are drawn, so the ring sits under the feet
 const DG0 = window.drawGear;
 if (typeof DG0 === 'function') {
  window.drawGear = function () {
   const r = DG0.apply(this, arguments);
   try { if (screen === 'live') drawRing(); } catch (e) { console.warn(e); }
   return r;
  };
 }

 // ---------------- CONTROLS panel row (drawn by v468ctl drawControls) ----------------
 const TXT = {
  shooter: 'SHOOTER PRO: TAP THE TEAMMATE YOU WANT TO PASS TO HIM.',
  passer: "PASSER PRO: TAP THE RIGHT SIDE TO HIT THE MATE YOU'RE RUNNING AT."
 };
 function pickBtn(lbl, m, x, y, w, h) {
  const on = mode() === m;
  button(lbl, x, y, w, h, () => { setMode(m); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: on ? '#ffe14d' : '#3a4a55', fg: on ? '#0b1a20' : '#cfe', fit: true });
 }
 function drawCtl(o) {
  if (off()) return;
  const m = mode();
  if (o.phone) {
   text(o.pad ? 'TOUCH PASS MODE' : 'PASS MODE', W / 2, 59, 1, '#ffe14d', 'center');
   const bw = Math.floor((o.gw - 6) / 2);
   pickBtn('SHOOTER PRO', 'shooter', o.x0, 67, bw, 18);
   pickBtn('PASSER PRO', 'passer', o.x0 + bw + 6, 67, o.gw - bw - 6, 18);
   text(TXT[m], W / 2, 92, 1, '#cfe', 'center');
   if (o.pad) text('CONTROLLER: ALWAYS PASSER PRO', W / 2, 104, 1, '#8fe3f0', 'center');
   return;
  }
  // keys / controller tabs: one cycle button left of DONE, one line right of it
  const y = 158, w = W / 2 - 50 - 4 - o.x0;
  const lbl = (o.pad ? 'TOUCH: ' : 'PASS: ') + (m === 'passer' ? 'PASSER PRO' : 'SHOOTER PRO');
  button(lbl, o.x0, y, w, 18, () => { setMode(m === 'passer' ? 'shooter' : 'passer'); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: m === 'passer' ? '#ffe14d' : '#3a4a55', fg: m === 'passer' ? '#0b1a20' : '#cfe', fit: true });
  const xr = W / 2 + 54;
  if (o.pad) { text('CONTROLLER: ALWAYS', xr, y + 2, 1, '#8fe3f0'); text('PASSER PRO (CONTROLLER)', xr, y + 10, 1, '#8fe3f0'); }
  else { text(m === 'passer' ? 'CLICK = PASS TO THE MATE' : 'CLICK THE TEAMMATE', xr, y + 2, 1, '#cfe'); text(m === 'passer' ? 'YOU ARE RUNNING AT' : 'YOU WANT TO PASS TO', xr, y + 10, 1, '#cfe'); }
 }
 window.V472PASS = { mode: mode, setMode: setMode, drawCtl: drawCtl, st: ST, target: ringTarget, moveDir: moveDir, KEY: KEY };
})();
