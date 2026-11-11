/* v457shot.js - V45.7: shots that turned into dodges (or did nothing). Kill switch: window.__rl_no457shot = true
 * Charlie (Nov 9 12:33 AM): "someone said sometimes they try to shoot and it just doesn't work or makes them dodge ...
 * if it is the hit box maybe make it slightly bigger but not to much ... if it's a glitch fix it".
 * How a shot starts (shot26.js SHOT26.down, called first by game.js inDown on the live screen): the touch must land in
 * the cage box (cageBox() +- CFG.aimSlop = 16 world px) AND the ball must already be in your stick AND no teammate may be
 * within 35 css px of the touch. If any of those fail, the touch becomes a normal field touch, and game.js turns a
 * pull of 30+ px into a split dodge (classifySwipe / doDodge), a still hold into a bull dodge (bullHoldTick), or nothing.
 * Measured with real touch events (932x430): every pull that started on the net with the ball held was a shot, but
 *  1. catch-and-shoot: touch the net while the pass (or a loose ball) is still coming, pull after the catch -> dodge/bull
 *  2. a teammate on the crease next to the net: the pass-tap rule (s231) eats the touch -> the pull is a split dodge
 *  3. a touch a hair outside the box -> dodge (short pulls -> nothing)
 * Fix: such a touch is remembered as a shot candidate. Nothing changes until the finger actually PULLS BACK (left, the
 * same direction a shot uses): then (and only if the ball is in your stick by then) it is handed to SHOT26 from the spot
 * where the touch started, so the normal aim line / power / release logic runs. A tap is still a pass, a tap on the field
 * is still a tap, an up / down / forward swipe is still a dodge, a hold is still a bull (except a hold that began on the
 * net before the catch: on the net a hold is an aim, as it already is with the ball in your stick).
 * Hitbox: the candidate box is the cage box + 19 px instead of 16 (+3 world px a side: 14% wider, 12% taller), and only a
 * pull-back from that thin new band becomes a shot. Taps/dodges there are unchanged.
 * Not touched: tutorials, the X / behind-the-cage rules, the air dive, online guest input (net.js netview), ids, rl_* keys.
 */
(function () {
 'use strict';
 const W = window;
 const off = () => !!(W.__rl_no457shot || W.__rl_v124gb);
 const CFG = { extra: 3, earlyExtra: 2, pullMin: 20, minPx: 30, backK: .45 };
 const LOG = W.V457S = { CFG: CFG, n: 0, by: { early: 0, mate: 0, band: 0 }, cand: 0, last: null, errs: 0 };
 let pass = false;
 function S26() { return W.SHOT26 && typeof SHOT26.down === 'function' && SHOT26.on() ? SHOT26 : null; }
 function liveOk() {
  try {
   return !off() && typeof screen !== 'undefined' && screen === 'live' && typeof game !== 'undefined' && !!game && !game.tutorial && !!S26();
  } catch (e) { return false; }
 }
 function inBox(wx, wy, sl) {
  const b = SHOT26.cageBox();
  return !(wx < b.x0 - sl || wx > b.x1 + sl || wy < b.y0 - sl || wy > b.y1 + sl);
 }
 function atXNoShot(c) {
  try { return atX231(c) && !(W.V28 && V28.otsOk && V28.otsOk(c)); } catch (e) { return false; }
 }
 function mateBlocks(pt) {
  try { return s231on() && !(W.V20 && V20.airReady && V20.airReady()) && !!nearestMateCss(pt.scx, pt.scy, pt.k, MATE_PX * MATE231); } catch (e) { return false; }
 }
 function mark(pt) {
  if (!pt || pt.role !== 'field' || pt.stale || pt.joy || pt.screen !== 'live') return;
  const sl = SHOT26.CFG.aimSlop, wx = pt.sx + Math.round(camX), wy = pt.sy, G = game, b = G.ball;
  if (!b) return;
  let why = null;
  if (canShoot()) {
   const c = G.carrier;
   if (atXNoShot(c)) return;
   if (inBox(wx, wy, sl)) why = mateBlocks(pt) ? 'mate' : null;
   else if (inBox(wx, wy, sl + CFG.extra)) why = 'band';
  } else if (b.state !== 'shot' && !G.dcar && inBox(wx, wy, sl + CFG.extra)) why = 'early';
  if (!why) return;
  pt.v457 = why;
  pt.v457in = inBox(wx, wy, sl);
  LOG.cand++;
 }
 function pulled(pt, cx, cy) {
  const dx = cx - pt.scx, dy = cy - pt.scy, d = Math.hypot(dx, dy);
  return -dx >= CFG.backK * d && (-dx >= CFG.pullMin || d >= CFG.minPx);
 }
 function convert(pt, cx, cy) {
  if (!pt || !pt.v457 || pt.v457done || pt.role !== 'field' || pt.stale || pt.joy) return false;
  if (pt.cutDone || pt.pickCalled || pt.bullDone || pt.swiped || pt.gsw || pt.dsw) return false;
  if (!liveOk() || !canShoot()) return false;
  if (pt.dodgeStroke) return false;
  if (!pulled(pt, cx, cy)) return false;
  const G = game, c = G.carrier;
  if (atXNoShot(c)) return false;
  pt.v457done = true;
  const S = SHOT26, sl0 = S.CFG.aimSlop;
  let ok = false;
  pass = true;
  try {
   S.CFG.aimSlop = sl0 + CFG.extra + (pt.v457 === 'early' ? CFG.earlyExtra : 0);
   const pd = { x: pt.sx, y: pt.sy, cx: pt.scx, cy: pt.scy, k: pt.k };
   const keep = { role: pt.role };
   ok = !!S.down(pt, pd) && pt.role === 'shot26';
   if (!ok) pt.role = keep.role;
  } catch (e) {
   LOG.errs++;
   if (LOG.errs < 4) console.warn('v457shot', e);
   ok = false;
  } finally {
   S.CFG.aimSlop = sl0;
   pass = false;
  }
  if (!ok) return false;
  pt.mate = null;
  pt.cutMate = null;
  pt.dodgeStroke = false;
  try { if (typeof shootP !== 'undefined' && shootP && shootP.id === pt.id) shootP = null; } catch (e) {}
  LOG.n++;
  LOG.by[pt.v457] = (LOG.by[pt.v457] || 0) + 1;
  LOG.last = { why: pt.v457, t: G.t, c: [ +(c.x - GX).toFixed(1), +(c.y - CY).toFixed(1) ], at: [ Math.round(pt.sx + Math.round(camX) - GX), Math.round(pt.sy - CY) ] };
  return true;
 }
 function wrap(name, fn) {
  const o = W[name];
  if (typeof o !== 'function') return false;
  W[name] = function (...a) { return fn.call(this, o, ...a); };
  return true;
 }
 function wire() {
  if (!W.SHOT26 || typeof W.inDown !== 'function' || typeof W.nearestMateCss !== 'function') return false;
  wrap('nearestMateCss', function (o, ...a) {
   if (pass) return null;
   return o.apply(this, a);
  });
  wrap('inDown', function (o, id, e) {
   const r = o.call(this, id, e);
   try { if (liveOk()) mark(pointers.get(id)); } catch (er) { LOG.errs++; }
   return r;
  });
  wrap('inMove', function (o, id, e) {
   try {
    const pt = pointers.get(id);
    if (pt && pt.v457 && !pt.v457done && e && liveOk()) {
     const p = toLogical(e);
     convert(pt, p.cx, p.cy);
    }
   } catch (er) { LOG.errs++; }
   return o.call(this, id, e);
  });
  wrap('inUp', function (o, id, e, cancel) {
   try {
    const pt = pointers.get(id);
    if (!cancel && pt && pt.v457 && !pt.v457done && e && liveOk()) {
     const p = toLogical(e);
     if (convert(pt, p.cx, p.cy)) {
      pt.x = p.x; pt.y = p.y; pt.cx = p.cx; pt.cy = p.cy;
      SHOT26.move(pt);
     }
    }
   } catch (er) { LOG.errs++; }
   return o.call(this, id, e, cancel);
  });
  // a hold that began ON the net before the catch is an aim (as it is with the ball in your stick), not a bull dodge
  wrap('bullArmed', function (o, pt) {
   if (!off() && pt && pt.v457 === 'early' && pt.v457in && !pt.v457done && pt.moved < TAP_PX) return false;
   return o.call(this, pt);
  });
  return true;
 }
 if (!wire()) W.addEventListener('load', wire);
})();
