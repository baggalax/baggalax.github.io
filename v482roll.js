/* v482roll.js - Bagga Lax computer dodges: RIGHT CLICK dodge + the WASD ROLL (V41.3.1 / 1.2, ?v=4082).
   Charlie (Nov 9 2026, 10:10-10:13 PM): "it's not possible to roll dodge, I should roll dodge if I click W and A at the same time
   ... whatever buttons are up field and away from goal at the time" + "left click to shoot, right click to dodge".
   Desktop scheme: W A S D = move, LEFT mouse = shoot / pass (the game's own touch handlers, unchanged), RIGHT mouse = dodge.
   1) RIGHT CLICK on the field while your guy has the ball (screen 'live'):
      - right-button drag / flick = the phone's dodge swipe: the path goes to the game's own classifySwipe() and its answer to
        the real doDodge(kind, ux, uy, spin): straight flick = SPLIT that way, C stroke = SWIM / TOE DRAG (curve28 decides,
        same as a thumb), a loop (the stroke turns 240 degrees or more) = ROLL toward where the stroke ends.
      - a plain right click (no drag) = SPLIT toward the mouse side (mouse right of your guy = split right, left = split left),
        the same doDodge('split', +-1, 0, +-1) call as the v467 split keys.
      The right button never reaches the game's finger handlers on the live screen (so it can't pass or shoot by accident).
      Defense and menus are untouched (a right click there still acts like a tap, as in 1.1). The browser menu is already
      blocked by game.js (contextmenu preventDefault).
   2) WASD ROLL: a FRESH press of two movement keys together (both keydowns within 100 ms, neither held before) where the
      sideways key points AWAY from the goal (goal at GX: in front of the cage that is A, behind it (X) that is D) and the other
      is up or down = doDodge('roll', diagonal, spin) - the touch roll's call (croll231: G.pre231 = the run before, spin from
      the turn). Holding keys or pressing one after the other is normal diagonal running, toward-goal diagonals never roll.
      Uses the player's own move binds (CONTROLS > KEYS).
   Kill switch: window.__rl_no482 = true. No storage, no net, no ids. Input only. */
(function () {
 'use strict';
 if (window.__rl_no482) return;
 const off = () => !!window.__rl_no482;
 const ST = { log: [], last: null, rc: null, rolls: 0, rdodges: 0 };
 const note = (k, v) => { ST.last = { k: k, v: v, t: +(performance.now() / 1e3).toFixed(2) }; ST.log.push(ST.last); if (ST.log.length > 60) ST.log.shift(); };
 const PAIR_MS = 100, LOOP = 4.2;   // 4.2 rad ~ 240 degrees
 function live() { try { return screen === 'live' && gameInputOn() && !!game && !!game.carrier && canShoot() && game.ball.state === 'held'; } catch (e) { return false; } }
 function typing() { const a = document.activeElement; if (!a || a === document.body) return false; const t = (a.tagName || '').toUpperCase(); return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || !!a.isContentEditable; }
 function setTap(kind, r, via) { try { lastTap = { kind: kind, ok: !!r, side: r ? r.side : null, via: via }; } catch (e) {} }
 // ---------------- WASD roll ----------------
 const MV = { up: [ 0, -1 ], down: [ 0, 1 ], left: [ -1, 0 ], right: [ 1, 0 ] };
 function binds() { try { if (window.V467KEYS && V467KEYS.binds) return V467KEYS.binds(); } catch (e) {} return { up: 'w', left: 'a', down: 's', right: 'd' }; }
 function moveAct(e) { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, b = binds(); for (const a in MV) if (b[a] === k) return a; return null; }
 const DN = {};   // move action -> keydown time, only while held
 function awaySide() { const c = game.carrier; return c.x <= GX ? 'left' : 'right'; }   // goal is at GX
 function prevDir() {
  const G = game, r = G.run;
  if (r && Math.hypot(r.x || 0, r.y || 0) > .1) { const L = Math.hypot(r.x, r.y); return [ r.x / L, r.y / L ]; }
  try { const f = carrierFace(); return [ f[0], f[1] ]; } catch (e) { return [ 1, 0 ]; }
 }
 function tryRoll(a, t) {
  const horiz = a === 'left' || a === 'right';
  const others = horiz ? [ 'up', 'down' ] : [ 'left', 'right' ];
  let b = null;
  for (const o of others) if (DN[o] != null && t - DN[o] <= PAIR_MS) b = o;
  if (!b) return false;
  for (const o in DN) if (o !== a && o !== b && DN[o] != null) return false;   // a third key held = not a clean pair
  if (!live()) { note('roll', { ok: false, why: 'no ball' }); return false; }
  const h = horiz ? a : b, v = horiz ? b : a;
  if (h !== awaySide()) { note('roll', { ok: false, why: 'toward goal', h: h }); return false; }
  const G = game, ux = MV[h][0] / Math.SQRT2, uy = MV[v][1] / Math.SQRT2;
  const p = ST.pre || prevDir(), cr = p[0] * uy - p[1] * ux, spin = cr >= 0 ? 1 : -1;
  G.pre231 = p;
  let r = null;
  try { r = doDodge('roll', ux, uy, spin); } finally { G.pre231 = null; }
  if (r) { ST.rolls++; if (G.run) { G.run.x = ux; G.run.y = uy; } }
  setTap('roll', r, 'keys482');
  note('roll', { ok: !!r, keys: [ h, v ], ux: +ux.toFixed(2), uy: +uy.toFixed(2), spin: spin });
  return !!r;
 }
 // capture phase: read the run direction BEFORE v467keys turns it toward the new keys
 window.addEventListener('keydown', e => {
  if (off() || !e.isTrusted || e.repeat || typing() || e.ctrlKey || e.metaKey || e.altKey) return;
  const a = moveAct(e); if (!a || DN[a] != null) return;
  try { if (live()) { const any = Object.keys(DN).some(o => DN[o] != null); ST.pre = any ? ST.pre : prevDir(); } } catch (er) {}
 }, true);
 window.addEventListener('keydown', e => {
  if (off() || !e.isTrusted || e.repeat || typing() || e.ctrlKey || e.metaKey || e.altKey) return;
  const a = moveAct(e); if (!a || DN[a] != null) return;
  const t = performance.now(); DN[a] = t;
  try { tryRoll(a, t); } catch (er) { console.warn('v482roll', er); }
 }, false);
 window.addEventListener('keyup', e => { const a = moveAct(e); if (a) DN[a] = null; if (!Object.keys(DN).some(o => DN[o] != null)) ST.pre = null; }, false);
 window.addEventListener('blur', () => { for (const o in DN) DN[o] = null; ST.pre = null; ST.rc = null; });
 // ---------------- right-click dodge ----------------
 function onField(e) { try { return e.target === cv; } catch (er) { return false; } }
 function start(e) { ST.rc = { id: e.pointerId, t0: performance.now(), path: [ [ e.clientX, e.clientY ] ] }; }
 function add(e) { const R = ST.rc, l = R.path[R.path.length - 1]; if (Math.hypot(e.clientX - l[0], e.clientY - l[1]) > 1.5) R.path.push([ e.clientX, e.clientY ]); }
 function turnOf(path) {
  let turn = 0, pa = null;
  for (let i = 1; i < path.length; i++) {
   const ax = path[i][0] - path[i - 1][0], ay = path[i][1] - path[i - 1][1];
   if (Math.hypot(ax, ay) <= 1.5) continue;
   const ang = Math.atan2(ay, ax);
   if (pa != null) { let d = ang - pa; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turn += d; }
   pa = ang;
  }
  return turn;
 }
 function finish(e) {
  const R = ST.rc;
  if (!R) return;
  if (e) add(e);
  ST.rc = null;
  if (!live()) { note('rclick', { ok: false, why: 'no ball' }); return; }
  const s = R.path[0], dur = Math.min((performance.now() - R.t0) / 1e3, DODGE.maxDur * .95);
  let far = 0; for (const q of R.path) far = Math.max(far, Math.hypot(q[0] - s[0], q[1] - s[1]));
  const rel = R.path.map(q => [ q[0] - s[0], q[1] - s[1] ]);
  let kind, ux, uy, spin, via;
  const turn = turnOf(rel);
  if (far >= Math.max(10, DODGE.minPx) && Math.abs(turn) >= LOOP) {
   // a loop = the roll; it rolls toward where the stroke ends (the last stretch of the path)
   const e1 = rel[rel.length - 1]; let j = rel.length - 2;
   while (j > 0 && Math.hypot(e1[0] - rel[j][0], e1[1] - rel[j][1]) < 12) j--;
   const dx = e1[0] - rel[j][0], dy = e1[1] - rel[j][1], L = Math.hypot(dx, dy) || 1;
   kind = 'roll'; ux = dx / L; uy = dy / L; spin = turn >= 0 ? 1 : -1; via = 'loop';
  } else {
   const sw = far >= DODGE.minPx ? classifySwipe(rel, dur) : null;
   if (sw) { kind = sw.kind; ux = sw.ux; uy = sw.uy; spin = sw.spin; via = 'swipe'; }
   else {
    // plain right click: split toward the mouse side of your guy
    const c = game.carrier, r = cv.getBoundingClientRect(), mx = (s[0] - r.left) * W / r.width + Math.round(camX);
    const d = mx >= c.x ? 1 : -1;
    kind = 'split'; ux = d; uy = 0; spin = d; via = 'click';
   }
  }
  let pre = null;
  if (kind === 'roll') { pre = prevDir(); game.pre231 = pre; }
  let r = null;
  try { r = doDodge(kind, ux, uy, spin); } finally { if (pre) game.pre231 = null; }
  if (r) ST.rdodges++;
  setTap(kind, r, 'rclick482');
  note('rclick', { ok: !!r, kind: kind, via: via, ux: +ux.toFixed(2), uy: +uy.toFixed(2), turn: +turn.toFixed(2), n: R.path.length });
 }
 window.addEventListener('pointerdown', e => {
  if (off() || e.button !== 2 || e.pointerType !== 'mouse' || !onField(e)) return;
  let sc = ''; try { sc = screen; } catch (er) {}
  if (sc !== 'live') return;            // defense / menus: unchanged
  e.preventDefault(); e.stopImmediatePropagation();
  start(e);
 }, true);
 window.addEventListener('pointermove', e => {
  if (off() || e.pointerType !== 'mouse') return;
  const R = ST.rc;
  if (!R) {
   // right button pressed while the left one is already down (no pointerdown for a second button)
   if (e.button === 2 && (e.buttons & 2) && onField(e)) { let sc = ''; try { sc = screen; } catch (er) {} if (sc === 'live') start(e); }
   return;
  }
  if (!(e.buttons & 2)) { finish(e); return; }
  add(e);
  if (!(e.buttons & 1)) e.stopImmediatePropagation();   // the game never sees the right-button stroke
 }, true);
 window.addEventListener('pointerup', e => {
  if (off() || e.pointerType !== 'mouse' || !ST.rc || e.button !== 2) return;
  e.preventDefault(); e.stopImmediatePropagation();
  finish(e);
 }, true);
 window.addEventListener('pointercancel', () => { ST.rc = null; }, true);
 window.addEventListener('contextmenu', e => { if (!off() && onField(e)) e.preventDefault(); }, true);
 window.V482ROLL = {
  on: () => !off(), st: ST,
  // the roll keys for tutorial text: the away-from-goal side key + up / down, from the player's binds
  hint: short => {
   const b = binds(), K = window.V468CTL ? V468CTL.keyName : (x => String(x).toUpperCase());
   let side = 'left'; try { if (game && game.carrier) side = awaySide(); } catch (e) {}
   return short ? K(b[side]) + ' + ' + K(b.up) + ' TOGETHER' : K(b[side]) + ' + ' + K(b.up) + ' (OR ' + K(b[side]) + ' + ' + K(b.down) + ') TOGETHER';
  }
 };
})();
