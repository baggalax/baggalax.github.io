(function() {
 'use strict';
 const off = () => !!window.__rl_no4011set || !!window.__rl_v124gb;
 const ST = {
  takes: 0,
  thumb: 0,
  swipe: 0,
  ready: 0
 };
 window.V4011SET = {
  ST: ST,
  on: () => !off()
 };
 const live = () => typeof screen === 'string' && screen === 'live' && typeof game !== 'undefined' && !!game;
 const thumbOn = () => {
  try {
   return !!joy && !!joy.on && pointers.has(joy.id) && (joy.m || 0) > 0;
  } catch (e) {
   return false;
  }
 };
 function take(S, why) {
  if (!S || S.u4011) return;
  S.u4011 = true;
  ST.takes++;
  ST[why]++;
  if (S.p284) S.user284 = true;
  try {
   game.set4011 = (game.set4011 || 0) + 1;
  } catch (e) {}
 }
 function noSet(fn) {
  const G = game, S = G.pset;
  G.pset = null;
  try {
   return fn();
  } finally {
   if (game === G && G.pset == null) G.pset = S;
  }
 }
 const setRun0 = window.setRun;
 if (typeof setRun0 === 'function') window.setRun = function(dx, dy, sharp) {
  if (off() || !live() || !game.pset || !canShoot()) return setRun0.apply(this, arguments);
  const S = game.pset, args = arguments, self = this;
  take(S, 'swipe');
  return noSet(() => setRun0.apply(self, args));
 };
 const joyTick0 = window.joyTick;
 if (typeof joyTick0 === 'function') window.joyTick = function() {
  if (off() || !live() || !game.pset || !canShoot() || !thumbOn()) return joyTick0.apply(this, arguments);
  const S = game.pset;
  take(S, 'thumb');
  const G = game;
  if (!G.run) {
   noSet(() => setRun0(joy.ux, joy.uy, false));
   if (G.run) {
    G.run.m = joy.m;
    G.run.joy = true;
   }
  }
 };
 const pset0 = window.psetTick;
 if (typeof pset0 === 'function') window.psetTick = function(dt) {
  const G = game, S = G && G.pset;
  if (off() || !S || !live()) return pset0.apply(this, arguments);
  if (!S.u4011 && thumbOn() && canShoot()) take(S, 'thumb');
  if (!S.u4011 || S.p284) return pset0.apply(this, arguments);
  const c = G.carrier, i = S.map.indexOf(c), run = G.run, sp = i >= 0 ? S.spots[i] : null, ph = S.phase;
  if (sp && c) S.spots[i] = [ c.x, c.y ];
  let r;
  try {
   r = pset0.apply(this, arguments);
  } finally {
   if (sp && G.pset === S) S.spots[i] = sp;
   if (game === G) {
    G.run = run;
    G.pAuto = null;
   }
  }
  if (ph === 'set' && S.phase === 'ready') ST.ready++;
  return r;
 };
})();
