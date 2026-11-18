/* v532appscope.js - Bagga Lax 1.3 APP SCOPE: the iPhone / iPad app ships WITHOUT controller (gamepad / PS5 / Xbox)
   support and WITHOUT computer keyboard / mouse controls. PASSER PRO stays in.
   Charlie (Nov 11 11:48 PM): "For 1.3 release everything besides the psf and computer control" + "Still release passer pro tho".

   ONLY inside the native app shell: window.Capacitor.isNativePlatform() is true (same check as v454force / v470ads /
   v527gsweb), or the page is served from capacitor:// . NOT window.__rl_ios (index.html sets that by hand on the website
   too). On every website (retrolax / baggalax.sites.tab.bot, baggalax.github.io, localhost) this file does nothing.

   In the app:
   - CONTROLLER: navigator.getGamepads() reports no pads, so v468ctl (pad play, pad faceoffs, CONTROLLER tab + rebinding,
     OPTIONS pause menu), v507fake / v521tutfake (pad fake + tutorial), v522padpick (double-click R3 pick) and any later pad
     file (v528padshoot) never see a controller. v522padpick / v528padshoot kill switches are set too.
   - KEYBOARD / MOUSE: v467keys (WASD play) is switched off by its own kill switch; keys pressed outside a text field reach
     the game as "Unidentified" (no binding matches, so v468's keyboard faceoff and any other key handler stay idle);
     typing in name / text fields works as before. v481tutkeys (keyboard / controller tutorial wording) is switched off.
   - INPUT MODE is always TOUCH: v468's input mode (window.__rl468 / V468CTL.st) reads 'touch', so the tutorial, the fake
     tutorial, the cut / pick hints and v483pull show the touch directions; "OPTIONS / START" and key names never show.
     A trackpad / mouse pointer does not switch the game to desktop mode (pointer: fine / hover media checks read false).
   - SETTINGS > CONTROLS stays, as the phone page: AUTO SWITCH / AUTO CHIRP / AUTO CELLY + PASS MODE: SHOOTER PRO /
     PASSER PRO (v472pass). No KEYS tab, no CONTROLLER tab, no RESET KEYS / RESET CONTROLLER, no rebinding.
   - PASSER PRO (v472pass + v474passfix: tap the right side of the screen and the ball goes to the teammate your
     joystick points at) is untouched and works in the app: it uses V468CTL.aimedMate, which stays loaded.
   No files are removed, no ids, rl_* keys, saves or net protocol change.
   Kill switch: window.__rl_no532as = true (read live: controller + keyboard come straight back). */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_no532as || W0.__rl532) return;
 function nativeShell() {
  try {
   const C = W0.Capacitor;
   if (C && typeof C.isNativePlatform === 'function' && C.isNativePlatform()) return true;
  } catch (e) {}
  try { if (String(location.protocol) === 'capacitor:') return true; } catch (e) {}
  return false;
 }
 const S = W0.__rl532 = { native: nativeShell(), on: false, err: [], keysBlocked: 0 };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + String(e && e.message || e)); };
 if (!S.native) return;            // every website: nothing below runs
 const off = () => !!W0.__rl_no532as;
 S.on = true;

 // ---- kill switches of the controller / keyboard files (each reads its own flag live) ----
 const FLAGS = [ '__rl_no467keys', '__rl_no481', '__rl_no522pp', '__rl_no528ps' ];
 const prev = {};
 for (const f of FLAGS) prev[f] = W0[f];
 function flags() {
  for (const f of FLAGS) {
   const want = off() ? prev[f] : true;
   if (W0[f] !== want) W0[f] = want;
  }
 }
 flags();

 // ---- controller: no gamepads in the app ----
 try {
  const N = navigator, g0 = N.getGamepads ? N.getGamepads.bind(N) : null;
  Object.defineProperty(N, 'getGamepads', {
   configurable: true,
   value: function () { if (off() || !g0) return g0 ? g0() : []; return []; }
  });
 } catch (e) { fail('pads', e); }
 try {
  const stopPad = e => { if (!off()) { try { e.stopImmediatePropagation(); } catch (x) {} } };
  W0.addEventListener('gamepadconnected', stopPad, true);
  W0.addEventListener('gamepaddisconnected', stopPad, true);
 } catch (e) { fail('padev', e); }

 // ---- keyboard: keys outside a text field are "Unidentified" (typing in inputs is untouched) ----
 function editable(t) {
  try {
   if (!t || t.nodeType !== 1) return false;
   const tg = String(t.tagName || '').toUpperCase();
   return tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || !!t.isContentEditable;
  } catch (e) { return false; }
 }
 try {
  const KP = W0.KeyboardEvent && KeyboardEvent.prototype;
  const swap = (name, blank) => {
   const d = Object.getOwnPropertyDescriptor(KP, name);
   if (!d || typeof d.get !== 'function') return;
   const get0 = d.get;
   Object.defineProperty(KP, name, {
    configurable: true, enumerable: d.enumerable,
    get: function () {
     const v = get0.call(this);
     if (off() || editable(this.target) || editable(document.activeElement)) return v;
     S.keysBlocked++;
     return blank;
    }
   });
  };
  swap('key', 'Unidentified'); swap('code', ''); swap('keyCode', 0); swap('which', 0); swap('charCode', 0);
 } catch (e) { fail('keys', e); }

 // ---- a trackpad / mouse never flips the game into desktop mode ----
 try {
  const mm0 = W0.matchMedia ? W0.matchMedia.bind(W0) : null;
  if (mm0) W0.matchMedia = function (q) {
   try {
    if (!off() && typeof q === 'string') {
     const s = q.replace(/\s+/g, '').toLowerCase();
     if (/\((any-)?pointer:fine\)|\((any-)?hover:hover\)/.test(s)) return mm0('not all');
     if (/\((any-)?pointer:coarse\)|\((any-)?hover:none\)/.test(s)) return mm0('all');
    }
   } catch (e) {}
   return mm0.apply(W0, arguments);
  };
 } catch (e) { fail('mm', e); }

 // ---- input mode: always touch (v468ctl's shared state, read by the tutorials and hint files) ----
 let st = null;
 function hookState() {
  const s = W0.__rl468 || (W0.V468CTL && V468CTL.st);
  if (!s || s.__rl532) return !!s;
  try {
   const im0 = s.inputMode, tm0 = s.tutMode;
   s.inputMode = function () { return off() ? (im0 ? im0.apply(this, arguments) : 'touch') : 'touch'; };
   s.tutMode = function () { return off() ? (tm0 ? tm0.apply(this, arguments) : null) : null; };
   let sk = !!s.sawKey, sm = !!s.sawMouse, md = s.mode;
   Object.defineProperty(s, 'sawKey', { configurable: true, get: () => off() ? sk : false, set: v => { sk = !!v; } });
   Object.defineProperty(s, 'sawMouse', { configurable: true, get: () => off() ? sm : false, set: v => { sm = !!v; } });
   Object.defineProperty(s, 'mode', { configurable: true, get: () => off() ? md : (md == null ? null : 'touch'), set: v => { md = v; } });
   if (s.padOn) s.padOn = false;
   if (s.tab === 'keys' || s.tab === 'pad') s.tab = 'none';
   s.cap = null;
   s.__rl532 = true;
   st = s;
   return true;
  } catch (e) { fail('state', e); return false; }
 }
 if (!hookState()) { let n = 0; const t = setInterval(() => { n++; if (hookState() || n > 40) clearInterval(t); }, 250); }
 S.state = () => st;

 setInterval(() => {
  try {
   flags();
   if (!off() && st) {
    if (st.cap) st.cap = null;                       // no rebinding capture
    if (st.tab === 'keys' || st.tab === 'pad') st.tab = 'none';
   }
  } catch (e) { fail('tick', e); }
 }, 400);
})();
