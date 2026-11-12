// ===== BAGGA LAX v512netspd.js - BAGGATWAAN SPEED ONLINE (both apps must agree) =====
// Charlie (Nov 11, 8:40 PM): "Yea slow in online too". v509spd slowed Bagga offline (spd 1.25 -> 1.12, CPU D 1.15 -> 1.13).
// How online moves players (net.js): the side with the ball is the AUTHORITY (N.auth) and simulates every player with
// ITS OWN DF table; the other side only shows snapshots and sends stick input + a predicted spot for the one defender
// it drives, predicted at the speed the authority puts in each snapshot (s.cs). So whoever has the ball decides the
// speed for that possession. If only one app were slowed, speed would flip every change of possession.
// So: new apps advertise with an OPTIONAL field sp5:1 on the existing 'ver' hello and on every snapshot ('s') and input
// ('i') packet. A new app uses the slower Bagga numbers online ONLY once it has heard sp5 from this opponent; an older
// app (App Store 1.2, a 1.3 build without this file, or one with a kill switch on) never sends it and ignores the extra
// field, so both sides stay on the old 1.25 / 1.15 for the whole game. No message, field or meaning was changed.
// Lobby / settings text for Bagga follows what will really happen (DIFF_INFO[5], DIFF_INFO_2403[5]).
// Kill switch: window.__rl_no512ns = true (also off when v509spd is off: __rl_no509spd / __rl_v124gb).
(function () {
 'use strict';
 if (typeof window === 'undefined' || !window.RLNET) return;
 const N = window.RLNET;
 const off = () => !!(window.__rl_no512ns || window.__rl_no509spd || window.__rl_v124gb || !(window.V509S && V509S.on));
 const NS = window.V512NS = { on: false, peer: null, link: null, adv: 0, heard: 0, errs: [] };
 // peer: true = opponent's app has this (heard sp5), false = its hello came without sp5 (older app), null = not heard yet
 NS.ok = () => !off() && NS.peer === true;
 const err = e => { if (NS.errs.length < 6) NS.errs.push(String(e && e.message || e)); };
 if (window.__rl_no512ns || window.__rl_v124gb) return;
 NS.on = true;

 // ---- protocol: optional sp5 field, added on send, read on receive (Link prototype, patched once) ----
 function patchLink(lk) {
  if (lk !== NS.link) { NS.link = lk; NS.peer = null; }
  const P = Object.getPrototypeOf(lk);
  if (!P || P.__v512) return;
  const s0 = P.send, l0 = P.latest, e0 = P.gotEvent, g0 = P.gotLatest;
  if (typeof s0 !== 'function' || typeof l0 !== 'function' || typeof e0 !== 'function' || typeof g0 !== 'function') return;
  P.__v512 = 1;
  P.send = function (e) {
   try { if (e && e.t === 'ver' && !off()) { e.sp5 = 1; NS.adv++; } } catch (x) { err(x); }
   return s0.apply(this, arguments);
  };
  P.latest = function (o) {
   try { if (o && (o.k === 's' || o.k === 'i') && !off()) o.sp5 = 1; } catch (x) { err(x); }
   return l0.apply(this, arguments);
  };
  P.gotEvent = function (e) {
   try {
    if (this === NS.link && e) {
     if (e.s && this.peerSid && e.s !== this.peerSid) NS.peer = null;   // a different opponent session on this link
     if (e.t === 'ver') { NS.peer = e.sp5 === 1; NS.heard++; }
     else if (e.sp5 === 1) NS.peer = true;
    }
   } catch (x) { err(x); }
   return e0.apply(this, arguments);
  };
  P.gotLatest = function (o) {
   try { if (this === NS.link && o && o.sp5 === 1 && NS.peer !== true) { NS.peer = true; NS.heard++; } } catch (x) { err(x); }
   return g0.apply(this, arguments);
  };
 }
 try {
  let L = N.link;
  Object.defineProperty(N, 'link', {
   configurable: true, enumerable: true,
   get() { return L; },
   set(v) { L = v; if (v) try { patchLink(v); } catch (x) { err(x); } }
  });
  if (L) patchLink(L);
 } catch (x) { err(x); }

 // ---- text: say what will really happen ----
 const T = {
  i5: {
   slow: '~12% FASTER, 2 CHECKS POP IT, MORE HITS - YOU ARE THE UNDERDOG',
   old: '~25% FASTER, 2 CHECKS POP IT, MORE HITS - YOU ARE THE UNDERDOG',
   oldApp: '~25% FASTER (OPP HAS OLDER APP), MORE HITS - YOU ARE THE UNDERDOG',
   wait: '~12% FASTER (25% VS OLDER APPS), MORE HITS - YOU ARE THE UNDERDOG'
  },
  i2403: {
   slow: '~12% FASTER, MORE HITS, REAL PLAYS - YOU ARE THE UNDERDOG',
   old: '~25% FASTER, MORE HITS, REAL PLAYS - YOU ARE THE UNDERDOG',
   oldApp: '~25% FASTER (OPP HAS OLDER APP), MORE HITS, REAL PLAYS',
   wait: '~12% FASTER (25% VS OLDER APPS), MORE HITS, REAL PLAYS'
  }
 };
 NS.T = T;
 function onlineCtx() {
  try {
   if (N.inGame) return true;
   if (typeof game !== 'undefined' && game && game.online && !game.over) return true;
   const s = typeof screen !== 'undefined' ? screen : '';
   return s === 'online' || /^on[A-Z]/.test(s) || (s === 'vsRoster' && typeof PS !== 'undefined' && PS.vs && PS.vs.back === 'onLobby');
  } catch (e) { return false; }
 }
 NS.onlineCtx = onlineCtx;
 function pick(t) {
  const v509on = !!(window.V509S && V509S.on) && !window.__rl_no509spd;
  if (!v509on) return t.old;                       // offline + online both on the old numbers
  if (!onlineCtx()) return t.slow;                 // offline: v509spd numbers
  if (window.__rl_no512ns) return t.old;           // online without negotiation: old numbers
  if (NS.peer === true) return t.slow;
  if (NS.peer === false) return t.oldApp;
  return t.wait;
 }
 NS.text5 = () => pick(T.i5);
 function accessor(obj, key, t) {
  try {
   Object.defineProperty(obj, key, { configurable: true, enumerable: true, get() { return pick(t); }, set(v) {} });
  } catch (x) { err(x); }
 }
 try { if (typeof DIFF_INFO !== 'undefined') accessor(DIFF_INFO, 5, T.i5); } catch (x) { err(x); }
 try { if (typeof DIFF_INFO_2403 !== 'undefined') accessor(DIFF_INFO_2403, 5, T.i2403); } catch (x) { err(x); }
})();
