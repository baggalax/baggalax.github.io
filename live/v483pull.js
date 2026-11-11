/* v483pull.js - Bagga Lax computer mouse: the LEFT-CLICK shot pull can start ANYWHERE (V41.3.1 / 1.2, ?v=4083).
   Charlie (Nov 9 2026, 10:15 PM): "For the right click and left click pull, you can do it from anywhere, not just pulling from
   the player. The string should always come from the player, though, so it's aligned."
   - Mouse only (pointerType 'mouse'), live play, your guy has the ball: a left press that the game would not use (not on the cage,
     not on / near a teammate, not on a screen-edge arrow, not behind the cage at X) starts the same SHOT26 aim the cage press
     starts, as if you had pressed the middle of the cage: only the drag counts (pull back = power, up / down = aim height).
     The aim string is the game's own drawAim, drawn from your player to the goal as always, so what you see lines up.
   - A click with no pull-back on such a spot is NOT a shot (no tap-in from far away): in PASSER PRO it passes to the ringed
     teammate (V472PASS.target, the game's throwPass), in SHOOTER PRO it does nothing.
   - Presses on the cage, on teammates (pass / pick / cut), touch and the controller are exactly as before.
   - The right-click dodge from anywhere is v482roll.js (the stroke's shape, wherever it starts).
   - Crease finish circles: keys 1 / 2 / 3 / 4 = top-left / bottom-left / top-right / bottom-right, numbered on the circles.
   Kill switch: window.__rl_no483 = true. No storage, no net, no ids. */
(function () {
 'use strict';
 if (window.__rl_no483) return;
 const off = () => !!window.__rl_no483;
 const SH = window.SHOT26;
 if (!SH || typeof SH.down !== 'function' || typeof SH.up !== 'function' || !SH.S) return;
 const ST = { n: 0, shots: 0, passes: 0, last: null, ptype: {} };
 const note = (k, v) => { ST.last = { k: k, v: v }; };
 // which pointer is a mouse (inDown only gets the event; SHOT26.down gets pt) - recorded before game.js sees the press
 try { cv.addEventListener('pointerdown', e => { ST.ptype['p' + e.pointerId] = e.pointerType; }, true); } catch (e) {}
 const isMouse = pt => !!(pt && typeof pt.id === 'string' && ST.ptype[pt.id] === 'mouse');
 function canClaim(pt, p) {
  if (off() || !isMouse(pt) || pt.stale) return false;
  try {
   if (screen !== 'live' || !canShoot() || !game || !game.carrier || game.ball.state !== 'held') return false;
   if (game.over || game.pset) return false;
   const c = game.carrier;
   if (typeof atX231 === 'function' && atX231(c) && !(window.V28 && V28.otsOk && V28.otsOk(c))) return false;   // at X: no shot, same as the cage press
   if (p.x < 12 || p.x > W - 12 || p.y < 24 || p.y > H - 6) return false;                                            // edge arrows, HUD rows
   if (typeof nearestMateCss === 'function' && nearestMateCss(pt.scx, pt.scy, pt.k, (typeof MATE_PX === 'number' ? MATE_PX : 50))) return false;
   if (typeof goalCornerAt === 'function' && goalCornerAt(p.x + Math.round(camX), p.y) >= 0) return false;
  } catch (e) { return false; }
  return true;
 }
 const D0 = SH.down;
 SH.down = function (pt, p) {
  const r = D0.apply(this, arguments);
  if (r) return r;
  if (!canClaim(pt, p)) return r;
  const S = SH.S, wx = GX + 2, wy = CY;
  S.aim = { id: pt.id, wy: wy, tq: null, ax: p.x, ay: p.y, tx: p.x, ty: p.y, wy0: wy, depth: Math.max(0, Math.min(1, (wx - GX) / 10)),
   t0: (typeof rt === 'function' ? rt() : (typeof now === 'function' ? now() : performance.now() / 1e3)), pulled: 0, wx: wx, maxPull: 0, still0: null, anc: null, hist: [], any483: true };
  pt.role = 'shot26';
  pt.cageStart = true;
  pt.any483 = true;
  ST.n++;
  note('start', { x: Math.round(p.x), y: Math.round(p.y) });
  return true;
 };
 const U0 = SH.up;
 SH.up = function (pt, cancelled) {
  const A = SH.S.aim;
  if (!A || !A.any483 || A.id !== (pt && pt.id) || cancelled) return U0.apply(this, arguments);
  const k = pt.k || 1, CFG = SH.CFG || {}, min = CFG.pullMin || 12;
  const cssPull = Math.max(0, A.ax - A.tx) * k;
  if (cssPull >= min || (A.maxPull || 0) >= min) { ST.shots++; note('shot', { pull: Math.round(cssPull) }); return U0.apply(this, arguments); }
  // no pull-back: never a far tap-in. PASSER PRO: the ringed mate gets it; SHOOTER PRO: nothing.
  SH.S.aim = null;
  try {
   if (window.V472PASS && V472PASS.mode() === 'passer' && screen === 'live' && canShoot()) {
    const m = V472PASS.target();
    if (m) { try { lastTap = { kind: 'pass', to: m.idx, via: 'passer483' }; } catch (e) {} throwPass(m); ST.passes++; note('pass', { to: m.idx }); return; }
   }
  } catch (e) { console.warn('v483pull', e); }
  note('click', { none: true });
 };

 // ---------------- crease circles: keys 1 2 3 4 + small key labels (computer) ----------------
 // Charlie (Nov 9 10:30 PM): "There's no way to aim on crease." Near the crease SHOT26 shows 4 finish circles; a quick
 // tap / left click on one finishes in that corner (unchanged). Keys: 1 = TOP-LEFT, 2 = BOTTOM-LEFT, 3 = TOP-RIGHT,
 // 4 = BOTTOM-RIGHT, sent as the same quick tap on that circle through the game's own inDown / inUp.
 // the keys come from CONTROLS > KEYS (rl_binds467 creaseTL / creaseBL / creaseTR / creaseBR, defaults 1 2 3 4)
 const ACT = { creaseTL: 'TOP-LEFT', creaseBL: 'BOTTOM-LEFT', creaseTR: 'TOP-RIGHT', creaseBR: 'BOTTOM-RIGHT' };
 const DEFK = { creaseTL: '1', creaseBL: '2', creaseTR: '3', creaseBR: '4' };
 function kbinds() { try { if (window.V468CTL && V468CTL.kb) return V468CTL.kb(); } catch (e) {} return DEFK; }
 function nameForKey(k) { const b = kbinds(); for (const a in ACT) if ((b[a] || DEFK[a]) === k) return ACT[a]; return null; }
 function keyLabel(name) { const b = kbinds(); for (const a in ACT) if (ACT[a] === name) { const k = b[a] || DEFK[a]; return window.V468CTL ? V468CTL.keyName(k) : String(k).toUpperCase(); } return ''; }
 const deskMode = () => { try { const s = window.__rl468; return !!(s && s.inputMode && s.inputMode() === 'key'); } catch (e) { return false; } };
 function circlesLive() { try { return screen === 'live' && canShoot() && !SH.S.aim && SH.circlesOn(); } catch (e) { return false; } }
 function tapCircle(name) {
  const q = SH.circles().find(c => c.name === name); if (!q) return false;
  const r = cv.getBoundingClientRect(), ev = { clientX: r.left + (q.x - Math.round(camX)) * r.width / W, clientY: r.top + q.y * r.height / H, preventDefault() {}, pointerType: 'key483' };
  inDown('k483', ev); inUp('k483', ev, false);
  ST.crease = { key: keyLabel(name), name: name, ball: game.ball.state };
  return true;
 }
 window.addEventListener('keydown', e => {
  if (off() || !e.isTrusted || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key, name = nameForKey(k); if (!name) return;
  try { if (window.__rl468 && __rl468.open) return; } catch (er) {}
  if (!circlesLive()) return;
  e.preventDefault();
  try { tapCircle(name); } catch (er) { console.warn('v483pull', er); }
 }, false);
 const DP = window.drawPlayers;
 if (typeof DP === 'function') {
  window.drawPlayers = function () {
   const r = DP.apply(this, arguments);
   try {
    if (!off() && deskMode() && circlesLive()) for (const q of SH.circles()) { const l = keyLabel(q.name); text(l, q.x + .5 - (l.length > 1 ? 0 : 0), q.y - 2, 1, '#0b1a20', 'center'); }
   } catch (e) {}
   return r;
  };
 }
 window.V483PULL = { on: () => !off(), st: ST, tapCircle: tapCircle };
})();
