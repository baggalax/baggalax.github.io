/* v522padpick.js - Bagga Lax: CALL A PICK FROM A CONTROLLER (V41.3, ?v=5220).
   Charlie (Nov 11 2026): a controller button to call a pick. Touch calls one by holding a thumb on a
   teammate (game.js holdTick -> callPick(m) + tutFlag('pickCalled')).
   Pad: DOUBLE-CLICK R3 (the 'hit' bind, default button 11) on OFFENSE with the ball = callPick on the
   teammate the LEFT stick points at (V468CTL.aimedMate, same picker as pad passes), or the nearest
   teammate to the carrier when the left stick is neutral. Same feedback as touch (PICK! / SET!).
   Double-click = second press within K.win s of the first, first press released within K.tap s, the
   right stick never past K.rs in between and no cut sent. A single press / hold + right stick still
   sends the cut exactly as v468ctl does (this file never delays or eats input; it only watches edges).
   Defense unchanged (R3 = big hit). Reads navigator.getGamepads() itself in a rAF loop only while a pad
   is connected. Also: 'PICK: DOUBLE-CLICK R3' row in CONTROLS -> CONTROLLER, and the pad tutorial text.
   Kill switch: window.__rl_no522pp = true. */
(function () {
 'use strict';
 if (window.__rl_no522pp) return;
 const off = () => !!window.__rl_no522pp;
 const K = { win: .38, tap: .3, rs: .4, lsAim: .35 };
 const S = { on: false, prev: false, t1: -9, up1: -9, rsMax: 0, n: 0, last: null, log: [] };
 window.__rl522 = S; S.K = K;
 const C = () => window.V468CTL || null;
 const st = () => window.__rl468 || null;
 const T = () => performance.now() / 1e3;
 const note = (k, v) => { S.last = { k: k, v: v, t: +T().toFixed(2) }; S.log.push(S.last); if (S.log.length > 40) S.log.shift(); };
 function pads() { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected !== false); } catch (e) { return []; } }
 const pressed = (p, i) => { const b = p.buttons[i]; return !!(b && (typeof b === 'object' ? b.pressed || b.value > .5 : b > .5)); };
 function hitBtn() { try { const c = C(); return c && c.pb ? c.pb().hit : 11; } catch (e) { return 11; } }
 function btnShort() { const i = hitBtn(); if (i === 11) return 'R3'; if (i === 10) return 'L3'; try { return C().padName(i); } catch (e) { return 'R3'; } }
 function canPick() {
  try {
   if (screen !== 'live' || !game || !gameInputOn() || !canShoot()) return false;
   const G = game, c = G.carrier;
   return !!(c && G.ball && G.ball.state === 'held' && !G.fo);
  } catch (e) { return false; }
 }
 function mates() {
  const G = game, c = G.carrier;
  let L = [];
  try { L = liveMates(); } catch (e) {}
  return L.filter(p => G.players.includes(p) && p !== c && !p.gk && !(typeof isKeeper === 'function' && isKeeper(p)) && !(p.down > 0));
 }
 function doPick(Ls) {
  if (!canPick()) { note('pick', { ok: false, why: 'state' }); return false; }
  const G = game, c = G.carrier, list = mates();
  if (!list.length) { note('pick', { ok: false, why: 'no mate' }); return false; }
  let m = null;
  if (Ls && Ls.m > K.lsAim && C() && C().aimedMate) m = C().aimedMate(Ls, list);
  if (!m) { let bd = 1e9; for (const p of list) { const d = Math.hypot(p.x - c.x, p.y - c.y); if (d < bd) { bd = d; m = p; } } }
  if (!m) return false;
  let ok = false;
  try { ok = callPick(m) !== false; } catch (e) { console.warn('v522 pick', e); }
  if (ok) { try { tutFlag('pickCalled'); } catch (e) {} S.n++; }
  note('pick', { ok: ok, to: m.idx, aimed: !!(Ls && Ls.m > K.lsAim) });
  return ok;
 }
 function stickR(p) { const x = p.axes[2] || 0, y = p.axes[3] || 0; return Math.hypot(x, y); }
 function poll() {
  if (off()) { S.on = false; return; }
  const ps = pads();
  if (!ps.length) { S.on = false; S.prev = false; return; }
  requestAnimationFrame(poll);
  try {
   const p = ps[0], s = st();
   if (s && s.open) { S.prev = pressed(p, hitBtn()); S.t1 = -9; return; }
   const cur = pressed(p, hitBtn()), t = T(), r = stickR(p);
   const P = s && s.P;
   if (cur) S.rsMax = Math.max(S.rsMax, r); else if (S.t1 > 0 && t - S.t1 < K.win) S.rsMax = Math.max(S.rsMax, r);
   if (cur && !S.prev) {
    const dbl = S.t1 > 0 && t - S.t1 <= K.win && S.up1 >= S.t1 && S.up1 - S.t1 <= K.tap && S.rsMax <= K.rs && !(P && (P.cutSent || P.shot));
    if (dbl && canPick()) {
     doPick(s && s.padL ? s.padL : null);
     S.t1 = -9;
    } else {
     S.t1 = t; S.up1 = -9; S.rsMax = r;
    }
   } else if (!cur && S.prev) {
    if (S.t1 > 0) S.up1 = t;
   }
   if (P && P.cutSent) S.t1 = -9;
   if (S.t1 > 0 && t - S.t1 > K.win + .1) S.t1 = -9;
   S.prev = cur;
  } catch (e) { console.warn('v522 pad', e); }
 }
 function start() { if (S.on || off() || !pads().length) return; S.on = true; S.prev = false; S.t1 = -9; note('pad', 'on'); requestAnimationFrame(poll); }
 window.addEventListener('gamepadconnected', start);
 S.start = start; S.doPick = doPick;

 // ---- tutorial text (pad mode): the touch PICK line becomes the pad line ----
 const TOUCH = { 'HOLD YOUR THUMB ON A TEAMMATE = HE COMES OVER AND SETS A PICK.': 1, 'HOLD YOUR THUMB ON A TEAMMATE = HE COMES OVER + SETS A PICK.': 1 };
 function tr(s) {
  if (typeof s !== 'string' || !TOUCH[s] || off()) return s;
  try {
   const x = st(); if (!x || !x.tutMode || x.tutMode() !== 'pad' || window.__rl_no468ctl) return s;
   return 'DOUBLE-CLICK ' + btnShort() + ' = A TEAMMATE COMES OVER AND SETS A PICK.';
  } catch (e) { return s; }
 }
 function wrapText() {
  const T0 = window.text, W0 = window.textW;
  if (typeof T0 !== 'function' || typeof W0 !== 'function') return;
  window.text = function (s) { if (typeof s === 'string' && TOUCH[s]) { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return T0.apply(this, b); } } return T0.apply(this, arguments); };
  window.textW = function (s) { if (typeof s === 'string' && TOUCH[s]) { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return W0.apply(this, b); } } return W0.apply(this, arguments); };
 }
 // ---- CONTROLS -> CONTROLLER: one more info row under D: BIG HIT ----
 function padConnected() { return pads().length > 0; }
 function wrapSettings() {
  const DS0 = window.drawSettings;
  if (typeof DS0 !== 'function') return;
  window.drawSettings = function () {
   const r = DS0.apply(this, arguments);
   try {
    const x = st();
    if (!off() && !window.__rl_no468ctl && x && x.open && x.tab === 'pad' && padConnected()) text('PICK: DOUBLE-CLICK ' + btnShort(), 8 + 3, 66 + 8 * 10 + 2, 1, '#8fe3f0');
   } catch (e) {}
   return r;
  };
 }
 wrapText();
 wrapSettings();
 if (pads().length) start();
})();
