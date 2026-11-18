/* v515ovb.js - BAGGA LAX 1.3: OVER AND BACK ONLY AFTER A TOUCH IN YOUR BOX.
 * Charlie (Nov 11 2026, 10:29 PM): "in 1.3 make sure over and back is only if you go into the box and get a touch then go back over"
 * Before (game.js): your team's "over" flag (game.overSeen) turned on the moment you CLEARED midfield (the CLEARED! cue), when a
 *  possession resumed past midfield, or as soon as your carrier was 8px past midfield - no box touch needed. Their flag
 *  (game.cpuOverSeen) turned on when they cleared, or 3px past midfield. With the flag on, going back over = OVER AND BACK.
 * Now: the flag only counts once a player of the team with the ball has HELD it inside the offensive box (past the restraining
 *  line, the same box the "get it in the box" count uses: x > RL_R+2 for you, x < RL_L-2 for them). That "established" mark is
 *  cleared on every change of possession, faceoff, goal and whistle/restart (any time the game resets its own flag, a new
 *  possession/screen starts, or startFaceoff/endPossession/startDefense/startCpu run).
 *  - carried back over after a box touch -> OVER AND BACK (same banner as before)
 *  - passed back over and CAUGHT by your own guy in your half after a box touch -> OVER AND BACK (before, a deep catch quietly
 *    restarted the clear for you while the CPU got called for the same thing; now both sides are called the same way)
 *  - over midfield but never touched in the box (faceoff scramble, early carry, pass never caught in the box), loose balls,
 *    deflections, shots and rebounds -> no call (loose-ball pickups behind midfield restart the clear exactly as before)
 * Only the authoritative sim (offline / online host-side updateLive/updateDefense) runs this; no net message or field changes.
 * Kill switch: window.__rl_no515ovb (checked live). window.__rl_515nopass = old pass-back behaviour only.
 */
(function () {
 'use strict';
 if (window.__rl_no515ovb) return;
 const WIN = window;
 const need = ['updateLive', 'updateDefense', 'ruleCall'];
 for (const n of need) if (typeof WIN[n] !== 'function') { WIN.V515 = { on: false, err: 'missing ' + n }; return; }
 const V = WIN.V515 = { on: true, ver: 5150, calls: { u: 0, c: 0, upass: 0 }, est: { u: 0, c: 0 }, err: null };
 const off = () => !!WIN.__rl_no515ovb;
 const err = (e, w) => { V.err = (w || '') + ': ' + String(e && e.message || e).slice(0, 160); try { console.warn('[v515ovb]', w, e); } catch (_) {} };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 let gMID = 260, gRLR = 334, gRLL = 186;
 try { gMID = MIDX; gRLR = RL_R; gRLL = RL_L; } catch (e) {}

 function chkU(G, S) {
  if (G.possCount !== S.pc) { S.pc = G.possCount; S.estU = false; }
  const b = G.ball, c = G.carrier;
  if (!S.estU && scr() === 'live' && b && b.state === 'held' && c && c.team === 'O' && b.x > gRLR + 2) { S.estU = true; V.est.u++; }
 }
 function chkC(G, S) {
  const b = G.ball, c = G.dcar;
  if (!S.estC && scr() === 'defense' && b && b.state === 'held' && c && b.x < gRLL - 2) { S.estC = true; V.est.c++; }
 }
 function inst(G) {
  if (!G || typeof G !== 'object' || G.__ovb515) return G && G.__ovb515;
  const d0 = Object.getOwnPropertyDescriptor(G, 'overSeen'), d1 = Object.getOwnPropertyDescriptor(G, 'cpuOverSeen');
  if ((d0 && (d0.get || d0.configurable === false)) || (d1 && (d1.get || d1.configurable === false))) return null;
  const S = { rawU: !!(d0 && d0.value), rawC: !!(d1 && d1.value), estU: false, estC: false, pc: G.possCount, last: '' };
  Object.defineProperty(G, '__ovb515', { value: S, enumerable: false, configurable: true });
  Object.defineProperty(G, 'overSeen', { configurable: true, enumerable: true,
   get() { if (off()) return S.rawU; try { chkU(G, S); } catch (e) { err(e, 'getU'); } return S.rawU && S.estU; },
   set(v) { S.rawU = !!v; if (!v) S.estU = false; else try { chkU(G, S); } catch (e) { err(e, 'setU'); } } });
  Object.defineProperty(G, 'cpuOverSeen', { configurable: true, enumerable: true,
   get() { if (off()) return S.rawC; try { chkC(G, S); } catch (e) { err(e, 'getC'); } return S.rawC && S.estC; },
   set(v) { S.rawC = !!v; if (!v) S.estC = false; else try { chkC(G, S); } catch (e) { err(e, 'setC'); } } });
  return S;
 }
 function resetAll() { try { const G = game; const S = G && G.__ovb515; if (S) { S.estU = false; S.estC = false; } } catch (e) {} }
 V.reset = resetAll;
 V.state = () => { try { const S = game && game.__ovb515; return S ? { rawU: S.rawU, estU: S.estU, rawC: S.rawC, estC: S.estC } : null; } catch (e) { return null; } };

 for (const n of ['startFaceoff', 'endPossession', 'startDefense', 'startDefenseLive', 'startCpu']) {
  const o = WIN[n]; if (typeof o !== 'function') continue;
  WIN[n] = function () { resetAll(); return o.apply(this, arguments); };
 }

 const oLive = WIN.updateLive, oDef = WIN.updateDefense;
 WIN.updateLive = function (dt) {
  let G = null, S = null, pre = false, rc0 = null;
  try {
   G = game; S = inst(G);
   if (S) {
    if (S.last !== 'live') { S.estU = false; S.last = 'live'; }
    if (!off() && !WIN.__rl_515nopass && !G.tutorial && G.ball && G.ball.state === 'pass') { chkU(G, S); pre = S.estU; rc0 = G.ruleCall; }
   }
  } catch (e) { err(e, 'preLive'); }
  const r = oLive.apply(this, arguments);
  if (pre) try {
   const b = G.ball, c = G.carrier;
   if (game === G && scr() === 'live' && !G.over && G.ruleCall === rc0 && b && b.state === 'held' && c && c.team === 'O' && Math.min(c.x, b.x) < gMID - 1) {
    G.userCause = true; V.calls.upass++; V.lastPass = { from: Math.round(b.fromX || 0), caught: Math.round(c.x), t: +(+G.t || 0).toFixed(1) };
    WIN.ruleCall('OVER AND BACK', 'BACK OVER MIDFIELD - TURNOVER', 'uturn');
   }
  } catch (e) { err(e, 'postLive'); }
  return r;
 };
 WIN.updateDefense = function (dt) {
  try { const G = game, S = inst(G); if (S && S.last !== 'defense') { S.estC = false; S.last = 'defense'; } } catch (e) { err(e, 'preDef'); }
  return oDef.apply(this, arguments);
 };
 const oRule = WIN.ruleCall;
 WIN.ruleCall = function (label) {
  const sc = scr();
  const r = oRule.apply(this, arguments);
  try { if (r && label === 'OVER AND BACK') { if (sc === 'live') V.calls.u++; else V.calls.c++; } } catch (e) {}
  return r;
 };
})();
