/* v474passfix.js - Bagga Lax PASSER PRO fixes (V41.4 / 1.2, ?v=4074).
   Charlie (beta, Nov 9): "in passer pro a lot of times it doesn't let me pass while I'm moving or dodging",
   "I'm clicking and nothing happens", "make sure it's very accurate to where your joystick is aiming",
   "I should be able to pass to a player behind another player by slightly moving it", "make the ring green
   and less distracting", "ring should be red if the player's not open, same as normal".
   Why taps were dropped (PASSER PRO only, touch or mouse):
   - A tap that lands on the cage area (cage box + slop, shot26.js:289-312, grabbed at game.js:2527) becomes a
     SHOT26 shot gesture. A quick tap with no pull-back is then cancelled ("shot25 no pull-back" / "tap too
     slow", shot26.js:462-467) and NOTHING happens. Running/dodging at the net is exactly when the cage sits on
     the right side of the screen, so that is where the taps vanished.
   - With the carrier at X (behind the goal line, game.js:2177) a tap on the cage becomes role 'xnone231'
     (game.js:2534-2569) and inUp ends on "cage at X (no shot)" (game.js:2798-2803): nothing happens.
   - The pass target was read from the stick only at the finger's release (v472pass moveDir); if the thumb
     eased into the dead zone just before/while tapping, the stick read idle and the ball went to the nearest
     mate instead of the one the stick was aiming at.
   What this file does (PASSER PRO only; SHOOTER PRO, shots, dodges, controllers and keys are untouched):
   - A plain tap (no pull-back, no swipe, no hold) that the cage/X rules would have swallowed passes instead.
     Real shots are unchanged: a pull-back shot, a tap-in at the crease and a goal-corner tap still shoot.
   - Any PASSER PRO tap that still ends with nothing done passes; if the ball can't be thrown that instant
     (mid-move) the pass is queued (tap flash + click) and fires the moment it can (max 0.6 s).
   - Target = pure angle: the mate with the smallest angle to the stick wins, near or far; distance only breaks
     ties inside 3 degrees. Direction = the stick at the moment the finger touches (or its last strong
     direction in the previous 150 ms if the thumb just eased off). The ring shows that same receiver.
   - Ring: thin, soft, semi-transparent, no pulse; green when the receiver is open, red when covered
     (the game's own isOpen, game.js:6064, the same rule as the normal open-mate markers).
   Kill switch: window.__rl_no474 = true (v472pass behaves exactly as before). */
(function () {
 'use strict';
 if (window.__rl_no474) return;
 if (!window.V472PASS || !window.V468CTL || typeof V468CTL.aimedMate !== 'function') return;
 const off = () => !!window.__rl_no474 || !!window.__rl_no472pass;
 const EASE = 0.15, TIE = 3 * Math.PI / 180, QMAX = 0.6;
 const ST = { conv: 0, xconv: 0, fallback: 0, queued: 0, fired: 0, expired: 0, eased: 0, ring: null, ringOpen: null, last: null, lastFire: null };
 const rt = () => performance.now() / 1e3;
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const passer = () => { try { return V472PASS.mode() === 'passer'; } catch (e) { return false; } };
 const padIn = () => { const s = V468CTL.st; return !!(s && s.padOn && s.inputMode && s.inputMode() === 'pad'); };
 function carrying() {
  const G = G_();
  try { return !!(G && screen === 'live' && G.carrier && G.carrier.team === 'O' && canShoot() && !G.over); } catch (e) { return false; }
 }
 const passerOn = () => { const G = G_(); return !off() && passer() && !!G && !G.tutorial && !padIn(); };
 const passerLive = () => passerOn() && carrying();
 // our player has the ball (canShoot may be false for a moment, e.g. mid-move): a tap now is queued, not lost
 const ourBall = () => { const G = G_(); try { return !!(G && screen === 'live' && G.carrier && G.carrier.team === 'O' && !G.over && G.ball && G.ball.state !== 'loose' && G.ball.state !== 'chase' && G.ball.state !== 'pass' && G.ball.state !== 'shot'); } catch (e) { return false; } };

 // ---------------- the stick direction, with a short memory ----------------
 const HIST = [];
 function rawDir() {
  try { if (typeof joy !== 'undefined' && joy && joy.on && pointers.has(joy.id)) return { x: joy.ux, y: joy.uy, m: joy.m || 1 }; } catch (e) {}
  const G = G_(), r = G && G.run;
  if (r && r.kb467) { const d = Math.hypot(r.x, r.y) || 1; return { x: r.x / d, y: r.y / d, m: 1 }; }
  return { x: 0, y: 0, m: 0 };
 }
 function sample() {
  const d = rawDir();
  if (d.m > 0) { HIST.push([ rt(), d.x, d.y, d.m ]); if (HIST.length > 40) HIST.shift(); }
 }
 function effDir() {
  const d = rawDir();
  if (d.m > 0) return d;
  const h = HIST[HIST.length - 1];
  if (h && rt() - h[0] <= EASE) return { x: h[1], y: h[2], m: h[3], eased: true };
  return d;
 }
 // pure angle: smallest angle to the stick wins; distance only inside a 3 degree tie; idle stick = nearest mate
 function pickMate(L, list) {
  const G = G_(), c = G && (G.carrier || G.dctl);
  if (!c || !list || !list.length) return null;
  const rows = list.map(p => { const dx = p.x - c.x, dy = p.y - c.y; return { p: p, d: Math.hypot(dx, dy) || 1, dx: dx, dy: dy }; });
  if (!L || !L.m) { rows.sort((a, b) => a.d - b.d); return rows[0].p; }
  const lm = Math.hypot(L.x, L.y) || 1;
  let amin = 9;
  for (const r of rows) { r.a = Math.acos(Math.max(-1, Math.min(1, (r.dx * L.x + r.dy * L.y) / (r.d * lm)))); if (r.a < amin) amin = r.a; }
  let best = null;
  for (const r of rows) if (r.a <= amin + TIE && (!best || r.d < best.d)) best = r;
  return best ? best.p : null;
 }
 let tapDir = null;   // the direction for the tap being released right now
 const AM0 = V468CTL.aimedMate;
 V468CTL.aimedMate = function (L, list) {
  if (off() || padIn() || !passer()) return AM0.apply(this, arguments);
  return pickMate(tapDir || effDir(), list);
 };
 function mates() { try { return liveMates(); } catch (e) { return []; } }

 // ---------------- the pass ----------------
 let tpN = 0;
 const TP0 = window.throwPass;
 if (typeof TP0 === 'function') window.throwPass = function () { tpN++; return TP0.apply(this, arguments); };
 function doPass(pt, dir, why) {
  const m = pickMate(dir, mates());
  if (!m) return false;
  try { lastTap = { kind: 'pass', to: m.idx, p474: why }; } catch (e) {}
  try { addFx('tap', pt.sx + Math.round(camX), pt.sy, { life: .35 }); } catch (e) {}
  const n0 = tpN;
  throwPass(m);
  const ok = tpN > n0 && G_().ball.state === 'pass';
  ST.last = { why: why, to: m.idx, ok: ok, eased: !!(dir && dir.eased), t: +((G_().t) || 0).toFixed(2) };
  return ok;
 }
 // a plain tap: right side, not the stick finger, not a swipe / hold / cut / pick
 function plainTap(pt, e, cancel) {
  if (cancel || !pt || pt.stale || pt.screen !== 'live' || pt.zone !== 'R' || pt.joy) return false;
  if (pt.cutDone || pt.pickCalled || pt.bullDone || pt.swiped || pt.dodgeStroke || pt.role === 'gsw') return false;
  let mv = pt.moved || 0;
  try { if (e) { const p = toLogical(e); mv = Math.max(mv, Math.hypot(p.cx - pt.scx, p.cy - pt.scy)); } } catch (er) {}
  return mv < TAP_PX && now() - pt.t0 < .8;
 }
 const NOOP = /^shot25 (no pull-back|tap too slow)$|^cage at X/;
 let Q = null;   // a queued pass {dir, t0, pt}
 const D0 = window.inDown;
 if (typeof D0 === 'function') window.inDown = function (id, e) {
  try { sample(); } catch (er) {}
  const r = D0.apply(this, arguments);
  try {
   const pt = pointers.get(id);
   if (pt && pt.zone === 'R' && !pt.joy && passerOn()) { const d = effDir(); pt.d474 = { x: d.x, y: d.y, m: d.m, eased: !!d.eased }; }
  } catch (er) {}
  return r;
 };
 const M0 = window.inMove;
 if (typeof M0 === 'function') window.inMove = function () { const r = M0.apply(this, arguments); try { sample(); } catch (er) {} return r; };
 const U0 = window.inUp;
 if (typeof U0 === 'function') window.inUp = function (id, e, cancel) {
  let pt = null, plain = false;
  try { pt = pointers.get(id); plain = !off() && passerOn() && ourBall() && plainTap(pt, e, cancel); } catch (er) { plain = false; }
  if (!plain) return U0.apply(this, arguments);
  const dir = pt.d474 && pt.d474.m ? pt.d474 : effDir();
  if (dir.eased) ST.eased++;
  if (pt.role === 'xnone231') { pt.role = 'field'; ST.xconv++; }   // at X: a plain tap on the cage is a pass, not "no shot"
  const n0 = tpN, lt0 = (function () { try { return lastTap; } catch (er) { return null; } })();
  let r;
  tapDir = dir;
  try { r = U0.apply(this, arguments); } finally { tapDir = null; }
  try {
   if (tpN > n0) return r;                       // the game passed
   const lt = lastTap, changed = lt !== lt0;
   if (changed && lt && lt.kind !== 'none' && lt.kind !== 'field') return r;   // a shot, a dodge, a switch...: not ours
   if (changed && lt && lt.kind === 'none' && !NOOP.test(String(lt.why || ''))) return r;
   const G = G_();
   if (carrying()) { if (doPass(pt, dir, changed && lt && lt.kind === 'none' ? 'cage' : 'fallback')) { if (changed && lt && lt.kind === 'none') ST.conv++; else ST.fallback++; } }
   else if (ourBall()) {
    Q = { dir: dir, t0: rt(), pt: { sx: pt.sx, sy: pt.sy } };
    ST.queued++;
    try { addFx('tap', pt.sx + Math.round(camX), pt.sy, { life: .35 }); SFX.tap && SFX.tap(); } catch (er) {}
   }
  } catch (er) { console.warn(er); }
  return r;
 };
 function fireQueued() {
  if (!Q) return;
  const G = G_();
  if (off() || !ourBall() || rt() - Q.t0 > QMAX) { Q = null; ST.expired++; return; }
  if (!passerLive()) return;
  const q = Q; Q = null;
  if (doPass(q.pt, q.dir, 'queued')) { ST.fired++; ST.lastFire = { wait: +(rt() - q.t0).toFixed(2) }; }
 }
 (function loop() { try { sample(); fireQueued(); } catch (e) {} requestAnimationFrame(loop); })();

 // ---------------- the ring: thin, soft, green open / red covered ----------------
 function heldTapDir() {
  try { for (const pt of pointers.values()) if (pt.d474 && pt.zone === 'R' && !pt.joy && !pt.stale && pt.d474.m) return pt.d474; } catch (e) {}
  return null;
 }
 function ringTarget() {
  if (off() || !carrying()) return null;
  if (padIn()) { const L = V468CTL.st.padL || { x: 0, y: 0, m: 0 }; return AM0(L, mates()); }
  if (!passerLive()) return null;
  return pickMate(Q ? Q.dir : heldTapDir() || effDir(), mates());
 }
 function drawRing() {
  const p = ringTarget();
  ST.ring = p ? p.idx : null;
  if (!p) { ST.ringOpen = null; return; }
  let open = true;
  try { open = isOpen(p); } catch (e) {}
  ST.ringOpen = open;
  const col = open ? 'rgba(125,255,122,.6)' : 'rgba(255,72,72,.6)';
  const x = p.x + (p._sox || 0), y = p.y + (p._soy || 0) + 1, rx = 9, ry = 4, seen = new Set();
  for (let a = 0; a < 6.283; a += .08) {
   const qx = Math.round(x + Math.cos(a) * rx), qy = Math.round(y + Math.sin(a) * ry), k = qx + ',' + qy;
   if (seen.has(k)) continue;
   seen.add(k);
   px(qx, qy, col);
  }
  if (Q) for (let a = 0; a < 6.283; a += .5) px(x + Math.cos(a) * (rx + 2), y + Math.sin(a) * (ry + 1), 'rgba(255,255,255,.7)');
 }
 const DG1 = window.drawGear;
 if (typeof DG1 === 'function') window.drawGear = function () {
  if (off()) return DG1.apply(this, arguments);
  const f = window.__rl_no472pass;
  window.__rl_no472pass = true;     // v472's own yellow ring stays off while ours draws
  let r;
  try { r = DG1.apply(this, arguments); } finally { window.__rl_no472pass = f; }
  try { if (screen === 'live') drawRing(); } catch (e) { console.warn(e); }
  return r;
 };
 window.V474PASS = { st: ST, pick: pickMate, dir: effDir, target: ringTarget };
})();
