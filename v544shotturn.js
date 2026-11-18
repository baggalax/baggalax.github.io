/* v544shotturn.js - Bagga Lax: SHOOTING NO LONGER TURNS YOU AROUND (V41.4, ?v=5441).
 * Charlie (Nov 12 2026, 12:43 AM): "sometimes when I shoot it turns me around instead of shooting, which kinda messes me up";
 *  12:45 AM: it happens "in pull back", "anywhere".
 * Cause (measured with real touch events at 932x430 / 667x375): a touch shot is press the cage -> pull back -> let go (shot26.js).
 *  1) FLICK RELEASE = FACE DODGE. SHOT26.up() treats "pulled back 20+ px, but the thumb is back within 20 px of where it started
 *     at the moment you let go" as the FACE DODGE (tut26: pull back like a shot, bring the thumb back, let go). A thumb that
 *     flicks forward as it lets go of a normal shot (very natural on a phone) lands inside that 20 px, so instead of the shot the
 *     carrier does the face dodge: a split dodge, stick swings across the face to the other hand, "FACE DODGE" text = the turn.
 *     Any pull, any power, anywhere on the field, as long as the release came with a forward flick.
 *  2) A PULL THAT STARTS JUST OUTSIDE THE CAGE TARGET (more than the cage box + 19 world px: v457 already rescues 16..19) is a
 *     field swipe: straight back = SPLIT DODGE toward your own end (he turns and runs away from the goal), back-and-forward =
 *     the v39fd face dodge. Rarer (the target is big), but it is the literal "turns me around".
 * Fix:
 *  1) The face dodge now needs its own deliberate input: bring the thumb back to where it started and HOLD IT THERE a beat
 *     (>= 0.15 s) before letting go, without flicking past the start. A release that comes back fast (a flick) is the SHOT,
 *     fired with the aim + power you had at your deepest pull (the moment before the flick) - the same shot SHOT26 fires for a
 *     clean release from that spot, so accuracy / power / goalie rules are unchanged. The FACE DODGE tutorial step keeps the
 *     old rule (so the drill can't get harder). Same for a pull from a crease circle that flicks back (before: nothing,
 *     "tap too slow"): it is the pulled shot at that circle.
 *  2) A pull-back (thumb going mostly LEFT, 20+ px) that starts within 14 world px around the existing cage target is handed to
 *     SHOT26 as a cage press (same as v457 does for its 3 px band), so it is a shot with the normal aim line, not a backward
 *     split. Up / down / forward swipes there are still dodges, taps still pass, a pull off a teammate still calls his cut.
 *  3) Behind the cage (X), where the game has no shot (a tap on the cage there already does nothing), a pull-back that starts
 *     ON the cage now also does nothing instead of a split dodge. Over-the-shoulder shots from GLE (v28) are untouched.
 * Not touched: crease circles (taps), fakes (v507 FAKE button / F key / TRIANGLE-Y), the controller (R2, L1 / R1) and keyboard
 *  shots, mouse pulls (v483), tutorials, online guest input, ids, rl_* keys, saves, the net protocol.
 * Kill switch: window.__rl_no544st = true -> exactly as before. Test hooks: window.V544ST (counts, last decision).
 */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no544st) return;
 const off = () => !!(W.__rl_no544st || W.__rl_v124gb);
 const CFG = { dwell: .15, over: 24, ring: 14, backK: .6, minBack: 20 };
 const ST = W.V544ST = { CFG: CFG, flickShots: 0, faceKept: 0, ringShots: 0, errs: 0, last: null, log: [] };
 const rt = () => performance.now() / 1e3;
 const note = o => { ST.last = o; ST.log.push(o); if (ST.log.length > 40) ST.log.shift(); };
 const err = e => { ST.errs++; if (ST.errs < 4) try { console.warn('v544shotturn', e); } catch (x) {} };
 const SH = () => (W.SHOT26 && typeof SHOT26.up === 'function' && SHOT26.S ? SHOT26 : null);
 function kOf(pt) { try { return pt && pt.k || SCALE; } catch (e) { return (pt && pt.k) || 1; } }
 function fdTut() {
  try { const T = W.TUT26 && TUT26.T; return !!(T && T.active && /^(fd|fwait|fdok)$/.test(T.step)); } catch (e) { return false; }
 }
 function liveShootOk() {
  try { return typeof screen !== 'undefined' && screen === 'live' && typeof game !== 'undefined' && !!game && canShoot(); } catch (e) { return false; }
 }
 // ---------- 1) the flick release ----------
 function track(pt) {
  const S = SH(); if (!S) return;
  const A = S.S.aim;
  if (!A || !pt || A.id !== pt.id) return;
  const k = kOf(pt), pm = S.CFG.pullMin, pull = Math.max(0, A.ax - A.tx) * k;
  let P = A.p544;
  if (!P) P = A.p544 = { peak: 0, ptx: A.tx, pty: A.ty, inT: null, over: 0 };
  if (pull >= P.peak) { P.peak = pull; P.ptx = A.tx; P.pty = A.ty; }
  if (P.peak >= pm) {
   if (pull < pm) { if (P.inT == null) P.inT = rt(); } else P.inT = null;
  }
  P.over = Math.max(P.over, (A.tx - A.ax) * k);
 }
 function wireShot() {
  const S = SH();
  if (!S || S.__w544) return !!S;
  S.__w544 = true;
  const oDown = S.down, oMove = S.move, oUp = S.up;
  S.down = function (pt, p) {
   const r = oDown.apply(this, arguments);
   try { if (r && !off()) { const A = S.S.aim; if (A && pt && A.id === pt.id) A.p544 = { peak: 0, ptx: A.tx, pty: A.ty, inT: null, over: 0 }; } } catch (e) { err(e); }
   return r;
  };
  S.move = function (pt) {
   const r = oMove.apply(this, arguments);
   try { if (!off()) track(pt); } catch (e) { err(e); }
   return r;
  };
  S.up = function (pt, cancelled) {
   try {
    const A = S.S.aim;
    if (!off() && !cancelled && A && pt && A.id === pt.id && A.p544 && !fdTut() && liveShootOk()) {
     const k = kOf(pt), pm = S.CFG.pullMin, pull = Math.max(0, A.ax - A.tx) * k;
     if (pull < pm && (A.maxPull || 0) >= pm) {
      const P = A.p544, dwell = P.inT == null ? 0 : rt() - P.inT;
      // on a crease circle there is no face dodge (that release was "tap too slow" = nothing): a pulled shot is a shot
      const deliberate = !A.tq && dwell >= CFG.dwell && P.over <= CFG.over;
      const d = { kind: deliberate ? 'face' : A.tq ? 'circle-shot' : 'flick-shot', dwell: +dwell.toFixed(3), over: Math.round(P.over), peak: Math.round(P.peak), rel: Math.round(pull), t: +rt().toFixed(2) };
      if (!deliberate && P.peak >= pm) {
       A.tx = P.ptx; A.ty = P.pty;
       ST.flickShots++;
      } else ST.faceKept++;
      note(d);
     }
    }
   } catch (e) { err(e); }
   return oUp.apply(this, arguments);
  };
  return true;
 }
 // ---------- 2) a pull-back that starts just outside the cage target ----------
 let pass = false;
 function inRing(wx, wy) {
  const S = SH(), b = S.cageBox(), sl = S.CFG.aimSlop + 3 + CFG.ring;
  return !(wx < b.x0 - sl || wx > b.x1 + sl || wy < b.y0 - sl || wy > b.y1 + sl);
 }
 function atXNoShot(c) { try { return atX231(c) && !(W.V28 && V28.otsOk && V28.otsOk(c)); } catch (e) { return false; } }
 function ringOk(pt) {
  if (!pt || pt.role !== 'field' || pt.stale || pt.joy || pt.zone !== 'R' || pt.screen !== 'live') return false;
  if (pt.v544done || pt.cutDone || pt.pickCalled || pt.bullDone || pt.gsw || pt.dsw || pt.cutMate) return false;
  try { if (game.tutorial || game.online || game.practice) return false; } catch (e) { return false; }
  if (fdTut() || (W.TUT26 && TUT26.active && TUT26.active())) return false;
  const S = SH(); if (!S || !S.on || !S.on() || !liveShootOk()) return false;
  if (atXNoShot(game.carrier)) return false;
  return true;
 }
 function pulledBack(pt, cx, cy) {
  const path = pt.path || [], s = [ pt.scx, pt.scy ];
  const pts = path.concat([ [ cx, cy ] ]);
  let far = 0, fx = 0, fy = 0;
  for (const q of pts) { const qx = q[0] - s[0], qy = q[1] - s[1], d = Math.hypot(qx, qy); if (d > far) { far = d; fx = qx; fy = qy; } }
  const dx = cx - s[0], dy = cy - s[1], d = Math.hypot(dx, dy);
  // the stroke so far is a pull back: mostly left, from the start, nothing big up / down / forward first
  return -dx >= CFG.minBack && -dx >= CFG.backK * d && -fx >= CFG.backK * far;
 }
 function ringConvert(pt, cx, cy) {
  if (!ringOk(pt)) return false;
  const wx = pt.sx + Math.round(camX), wy = pt.sy;
  if (!inRing(wx, wy)) return false;
  if (!pulledBack(pt, cx, cy)) return false;
  const S = SH(), sl0 = S.CFG.aimSlop;
  pt.v544done = true;
  let ok = false;
  pass = true;
  try {
   S.CFG.aimSlop = sl0 + 3 + CFG.ring;
   const r0 = pt.role;
   ok = !!S.down(pt, { x: pt.sx, y: pt.sy, cx: pt.scx, cy: pt.scy, k: pt.k }) && pt.role === 'shot26';
   if (!ok) pt.role = r0;
  } catch (e) { err(e); ok = false; }
  finally { S.CFG.aimSlop = sl0; pass = false; }
  if (!ok) return false;
  pt.dodgeStroke = false;
  pt.v544ring = true;
  try { if (typeof shootP !== 'undefined' && shootP && shootP.id === pt.id) shootP = null; } catch (e) {}
  ST.ringShots++;
  note({ kind: 'ring-shot', at: [ Math.round(wx - GX), Math.round(wy - CY) ], t: +rt().toFixed(2) });
  return true;
 }
 function wrap(name, fn) {
  const o = W[name];
  if (typeof o !== 'function') return false;
  W[name] = function (...a) { return fn.call(this, o, ...a); };
  return true;
 }
 let wiredRing = false;
 function wireRing() {
  if (wiredRing) return true;
  if (!SH() || typeof W.inMove !== 'function' || typeof W.inUp !== 'function' || typeof W.nearestMateCss !== 'function') return false;
  wiredRing = true;
  wrap('nearestMateCss', function (o, ...a) { if (pass) return null; return o.apply(this, a); });
  wrap('inMove', function (o, id, e) {
   try {
    if (!off() && e) {
     const pt = pointers.get(id);
     if (pt && pt.role === 'field' && !pt.v544done) { const p = toLogical(e); ringConvert(pt, p.cx, p.cy); }
    }
   } catch (er) { err(er); }
   return o.call(this, id, e);
  });
  wrap('inUp', function (o, id, e, cancel) {
   let xz = null, xpt = null;
   try {
    if (!off() && !cancel && e) {
     const pt = pointers.get(id);
     // 3) behind the cage (X) the game has no shot (role xnone231: a tap on the cage there does nothing). A pull-back that
     //    started ON the cage there used to fall through to the dodge swipe (split toward the front / your own end). Now it
     //    does what the tap does there: nothing. Swipes that start on the field are still dodges.
     if (pt && pt.role === 'xnone231' && pt.cageStart && pt.zone === 'R' && !pt.joy) {
      const p = toLogical(e);
      if (pulledBack(pt, p.cx, p.cy) && liveShootOk()) { xz = pt.zone; xpt = pt; pt.zone = 'X544'; ST.xNoDodge = (ST.xNoDodge || 0) + 1; note({ kind: 'x-no-dodge', t: +rt().toFixed(2) }); }
     }
     if (pt && pt.role === 'field' && !pt.v544done) {
      const p = toLogical(e);
      if (ringConvert(pt, p.cx, p.cy)) { pt.x = p.x; pt.y = p.y; pt.cx = p.cx; pt.cy = p.cy; SHOT26.move(pt); }
     }
    }
   } catch (er) { err(er); }
   try { return o.call(this, id, e, cancel); } finally { if (xpt) xpt.zone = xz; }
  });
  return true;
 }
 function wire() { const a = wireShot(), b = wireRing(); return a && b; }
 if (!wire()) W.addEventListener('load', wire);
})();
