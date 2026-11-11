/* V40.1.6p: your ball carrier NEVER passes by himself, in any play type.
   v404g (V40.0.4) blocked the two known auto passes, but only by call site (inside playTick / updateDefense).
   This makes the rule total and future-proof: during a game tick, a pass for YOUR carrier only happens when it
   comes from your own input (tap / touch / click / key). Anything else the game tries (set plays, end line and
   sideline restarts, man-up / EMO, playmaker plays, timeout plays, clears, faceoff follow-ups, v27 "prep" passes,
   the goalie's clear outlet) is dropped and counted. Teammates still run their routes; the PASS ring still shows
   the play's target - you decide when and where to pass. CPU teams are untouched (they pass through their own code).
   Online games are untouched (net protocol unchanged).
   Kill switch: window.__rl_no416p = true -> behaves exactly like before.
   (window.__rl_no404gclr = true still brings back only the goalie's automatic clear outlet.) */
(function () {
 'use strict';
 const off = () => !!window.__rl_no416p;
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen === 'string' ? screen : '');
 const online = G => !!(G && (G.online || (G.meta && G.meta.online)));
 const ST = { blocked: 0, blockedClr: 0, userPass: 0, last: null };
 let tick = 0, inp = 0;
 const UI = /^(pointer|touch|mouse|click|key)/;
 function userInput() {
  if (inp > 0) return true;
  try { const e = window.event; return !!(e && UI.test(e.type)); } catch (_) { return false; }
 }
 function depth(name, add) {
  const f = window[name];
  if (typeof f !== 'function') return false;
  window[name] = function () {
   add(1);
   try { return f.apply(this, arguments); } finally { add(-1); }
  };
  return true;
 }
 // the whole game tick (live, defense, clears, restarts, play runners all run inside it)
 const hasTick = depth('step2317', d => { tick += d; });
 // the canvas input handlers: a tap on a mate (pass) and a tap during the clear both go through inUp
 depth('inUp', d => { inp += d; });
 depth('inDown', d => { inp += d; });
 function why(G) {
  if (!G) return '';
  if (G.el2314 || G.elSet && G.readyT > 0) return 'endline';
  if (G.pset) return 'set:' + (G.pset.pl ? G.pset.pl.cat || '' : '');
  if (G.playRun && !G.playRun.done) return 'play:' + (G.playRun.pl ? G.playRun.pl.cat || '' : '');
  if (G.cset) return 'clear';
  if (G.pen) return 'manup';
  return 'other';
 }
 if (hasTick && typeof window.throwPass === 'function') {
  const TP0 = window.throwPass;
  window.throwPass = function (to) {
   const G = G_();
   if (!off() && tick > 0 && G && scr() === 'live' && !online(G) && G.carrier && G.carrier.team === 'O') {
    if (!userInput()) {
     ST.blocked++;
     G.noAuto416 = (G.noAuto416 || 0) + 1;
     ST.last = { t: +(+G.t || 0).toFixed(2), why: why(G), from: G.carrier.idx, to: to ? to.idx : null };
     return;
    }
    ST.userPass++;
   }
   return TP0.apply(this, arguments);
  };
 }
 if (hasTick && typeof window.dThrowClear === 'function') {
  const DT0 = window.dThrowClear;
  window.dThrowClear = function (to) {
   const G = G_();
   if (!off() && !window.__rl_no404gclr && tick > 0 && G && G.dclear && !G.tutorial && !online(G) && !userInput()) {
    ST.blockedClr++;
    G.noAutoClr416 = (G.noAutoClr416 || 0) + 1;
    return;
   }
   return DT0.apply(this, arguments);
  };
 }
 window.V416P = { ST: ST, on: () => !off() && hasTick };
})();
