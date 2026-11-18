/* v542vetline.js - Veterans entrance LINEUP spacing (Bagga Lax). Charlie (Nov 12 2026, 12:37 AM): "The animation for
 * veteran team entering when the teams lineup they are kind inside eachother."
 * Root cause: v490entr.js lines each branch team up in a 5-wide x 2-deep block that starts beside its vehicle and runs
 * TOWARD midfield (columns only 11 px apart, which is a body width). The vehicles park at 27% / 73% of the screen, so on a
 * phone-width view (300-360 game px) each block runs past the center line: two branch teams end up standing inside each
 * other in the middle, and team-mates touch. Nothing kept a block inside its own half.
 * Fix (wrapper only, v490entr.js untouched): when v490 builds a show, its home spots are re-laid out as a neat lineup in
 * the team's OWN half: columns 15 px apart (a body is ~10 px), rows 20-24 px apart, the inner column 13 px off the center
 * line so the two teams face each other with a clear gap, as many columns as fit between the vehicle and midfield (2-5),
 * extra rows when fewer fit, kept on the field (and above the landing ship for NAVY). If even two columns do not fit, the
 * vehicle parks a little further out. Works for the walk in, the lineup, and the walk back out after the final whistle.
 * Regular (non-branch) teams: the season / world "TEAMS TAKE THE FIELD" walk lined each team up 11 px apart in one row
 * (touching, sticks crossing) and the ritual circle put 10 players on a 16x9 px ring (about 8 px apart). Those spots get
 * the same treatment: 14 px apart in the line, a 28x13 px ring.
 * How it reaches v490's closure: the show object passes through shows.push() inside v490's start(); while v490's
 * wrapped startFaceoff / walkTick2314 / drawGear run, push() is watched for exactly that object and nothing else is
 * changed. No storage keys, no net protocol, ids untouched. Kill switch: window.__rl_no542vl = true.
 */
(function () {
 'use strict';
 const W0 = window;
 const off = () => !!W0.__rl_no542vl;
 const V = W0.V542 = { shows: 0, moved: 0, walks: 0, errs: [], last: null };
 const err = (e, w) => { try { if (V.errs.length < 8) { V.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v542vetline', w, e); } } catch (x) {} };
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const VW = () => { try { return W; } catch (e) { return 380; } };
 const camx = () => { try { return camX; } catch (e) { return 0; } };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const NUM = (n, d) => { try { const v = n(); return typeof v === 'number' && isFinite(v) ? v : d; } catch (e) { return d; } };
 const FT0 = () => NUM(() => FT, 32), FB0 = () => NUM(() => FB, 170), CY0 = () => NUM(() => CY, 101), MID0 = () => NUM(() => MIDX, 260);
 const OFF0 = { airforce: 40, army: 44, spaceforce: 24, navy: 30, marines: 34, coastguard: 30 };
 const DX = 15, GAP = 13;

 /* ---------- branch entrance lineup ---------- */
 // columns that fit between a side's vehicle (parked where v490 parks it) and its edge of the center gap
 function colsFor(side, kind) {
  const vw = VW(), cam = camx(), dir = side === 0 ? 1 : -1, inner = cam + vw / 2 - dir * GAP;
  const stopX = Math.max(cam + vw * .13, Math.min(cam + vw * .87, cam + vw * (side === 0 ? .27 : .73)));
  const avail = dir * (inner - (stopX + dir * ((OFF0[kind] || 34) - 4)));
  return cl(Math.floor(Math.max(0, avail) / DX) + 1, 2, 5);
 }
 function otherKind(S) {
  try {
   const s = 1 - S.side, f = s === 0 ? W0.__rl490force : W0.__rl490force2, G = G0();
   if (typeof f === 'string' && OFF0[f]) return f;
   if (G && W0.V490 && V490.kindOf) { const k = V490.kindOf(s === 0 ? G.user : G.opp); return OFF0[k] ? k : null; }
  } catch (e) {}
  return null;
 }
 function layout(S) {
  if (!S || S.__v542 || !Array.isArray(S.actors) || !S.actors.length) return;
  S.__v542 = true;
  const vw = VW(), cam = camx(), cx = cam + vw / 2, dir = S.dir || (S.side === 0 ? 1 : -1), k = S.kind;
  const n = S.actors.length, off0 = OFF0[k] || 34;
  const inner = cx - dir * GAP;
  let clear = S.stopX + dir * (off0 - 4);
  let avail = dir * (inner - clear);
  if (avail < DX) { // even two columns would reach the vehicle: park it further out (stays on screen)
   const lim = cam + vw * (dir > 0 ? .13 : .87), need = DX - avail;
   const ns = dir > 0 ? Math.max(lim, S.stopX - need) : Math.min(lim, S.stopX + need);
   if (ns !== S.stopX) { S.stopX = ns; V.moved++; }
   clear = S.stopX + dir * (off0 - 4); avail = dir * (inner - clear);
  }
  const ok2 = otherKind(S);
  let cols = cl(Math.floor(Math.max(0, avail) / DX) + 1, 2, 5);
  if (ok2) cols = Math.min(cols, colsFor(1 - S.side, ok2)); // both branch teams line up in the same shape
  const rows = Math.ceil(n / cols);
  const yMin = FT0() + 18, yMax = k === 'navy' ? CY0() + 35 : FB0() - 6;
  const c0 = (k === 'navy' ? CY0() + 30 : S.gy) - 1;
  const dy = rows > 1 ? cl((yMax - yMin) / (rows - 1), 17, rows <= 3 ? 24 : 22) : 0, hgt = dy * (rows - 1);
  const top = cl(c0 - hgt / 2, yMin, Math.max(yMin, yMax - hgt));
  for (const a of S.actors) {
   const i = a.i != null ? a.i : S.actors.indexOf(a), r = Math.floor(i / cols), c = i % cols;
   const hx = Math.round(inner - dir * c * DX), hy = Math.round(top + r * dy);
   a.hx = hx; a.hy = hy;
   if (a.p) { a.p.x = hx; a.p.y = hy; a.p.tx = hx; a.p.ty = hy; }
  }
  V.shows++;
  V.log = (V.log || []).slice(-11); V.log.push(k + ':' + cols + 'x' + rows);
  V.last = { kind: k, side: S.side, cols, rows, dy: +dy.toFixed(1), inner: Math.round(inner), stopX: Math.round(S.stopX), vw };
 }
 V.layout = layout;
 const isShow = o => !!(o && typeof o === 'object' && Array.isArray(o.actors) && typeof o.kind === 'string' && typeof o.stopX === 'number' && 'gy' in o && o.actors.length && o.actors[0] && o.actors[0].p && o.actors[0].p.e490);
 const AP = Array.prototype, PUSH0 = AP.push;
 let depth = 0;
 function watchedPush() {
  try { for (let j = 0; j < arguments.length; j++) if (isShow(arguments[j])) layout(arguments[j]); } catch (e) { err(e, 'layout'); }
  return PUSH0.apply(this, arguments);
 }
 function watch(fn, self, args) {
  if (depth === 0) AP.push = watchedPush;
  depth++;
  try { return fn.apply(self, args); }
  finally { depth--; if (depth === 0 && AP.push === watchedPush) AP.push = PUSH0; }
 }
 const v490st = () => { try { return W0.V490 && V490.state ? V490.state() : null; } catch (e) { return null; } };
 const has490 = () => !!(W0.V490 && V490.on && V490.on());
 if (typeof W0.startFaceoff === 'function') {
  const SF = W0.startFaceoff;
  W0.startFaceoff = function (opening) {
   if (off() || opening !== true || !has490() || v490st()) return SF.apply(this, arguments);
   return watch(SF, this, arguments);
  };
 }
 if (typeof W0.walkTick2314 === 'function') {
  const WT = W0.walkTick2314;
  W0.walkTick2314 = function (G) {
   if (off() || !G || G.walk || !has490() || v490st()) return WT.apply(this, arguments);
   return watch(WT, this, arguments);
  };
 }
 if (typeof W0.drawGear === 'function') {
  const DG = W0.drawGear;
  W0.drawGear = function () {
   let G = null;
   if (!off() && has490() && SCR() === 'final' && !v490st() && (G = G0()) && G.over && G.e490out !== 'done') return watch(DG, this, arguments);
   return DG.apply(this, arguments);
  };
 }

 /* ---------- regular "teams take the field" walk + ritual ring ---------- */
 function walkFix(G) {
  const Wk = G && G.walk;
  if (!Wk || Wk.__v542 || !Array.isArray(Wk.actors)) return;
  Wk.__v542 = true;
  const vw = VW(), mid = MID0(), out = NUM(() => WALK2314.out, 1.25);
  const per = [0, 0];
  for (const a of Wk.actors) if (a && a.bench && a.side != null) per[a.side] = Math.max(per[a.side], (a.i || 0) + 1);
  for (const a of Wk.actors) {
   if (!a || !a.bench || a.side == null || a.hx == null) continue;
   const nn = Math.max(1, per[a.side] - 1), sp = cl((vw / 2 - 14 - 7) / nn, 12, 14), i = a.i || 0;
   const x = a.side === 0 ? mid - 14 - i * sp : mid + 14 + i * sp;
   const dist = Math.hypot(x - a.x, a.ty - a.y);
   if (a.tx === a.hx) a.tx = x;
   a.hx = x;
   a.spd = Math.max(30, dist / Math.max(.3, out - .12 - i * .05));
   a.__v542w = true;
  }
  V.walks++;
 }
 if (typeof W0.walkStart2314 === 'function') {
  const WS = W0.walkStart2314;
  W0.walkStart2314 = function (G) {
   const r = WS.apply(this, arguments);
   try { if (!off()) walkFix(G); } catch (e) { err(e, 'walk'); }
   return r;
  };
 }
 if (typeof W0.actorTick14 === 'function') {
  const AT = W0.actorTick14;
  W0.actorTick14 = function (a, dt) {
   try {
    if (a && a.__v542w && !off()) {
     const G = G0(), Wk = G && G.walk;
     if (Wk && Wk.adv && Wk.P && Array.isArray(Wk.P.rit)) {
      const t = Wk.t, r = Wk.P.rit.find(q => q.side === a.side && t >= q.t0 && t < q.t1);
      if (r && r.kind === 'rite') {
       const ang = (a.i || 0) / 10 * Math.PI * 2;
       a.tx = Wk.adv.x + Math.cos(ang) * 28;
       a.ty = Wk.adv.y + Math.sin(ang) * 13;
      }
     }
    }
   } catch (e) { err(e, 'rite'); }
   return AT.apply(this, arguments);
  };
 }
})();
