// v540subpass.js - V54.0: PASS TO A GUY SUBBING OFF (Charlie, Nov 12 12:26 AM: "I should be able to pass to players subbing off
// the field and it stops their sub while they have the ball, then after the pass they continue off").
// Before: a guy jogging off through the box on a live box sub (SUB screen, playmaker SUB step, auto specialist sub, follow the sub)
// could not be passed to: v421s's throwPass / dThrowClear hook dropped the pass and flashed "HE IS SUBBING OFF".
// Now (your team, offline / vs-CPU only - live subs do not exist online, v421s keeps them off there):
//  - a pass to him goes (tap pass, aimed pass, PASSER PRO, controller, keys, a goalie/D clear you pick - they all end in the game's
//    own throwPass / dThrowClear, so one hook covers every path). The moment it leaves the stick his sub PAUSES: the job goes back
//    to v421s's own 'wait' phase (he is a normal player again, counts on the field for offside, you can control him, the new guy
//    keeps waiting in the box) and "SUB WAITS: <NAME> HAS THE BALL" shows.
//  - when he passes, shoots, gets checked loose or the pass to him is picked off, v421s's 'wait' phase sees he has no ball and the
//    sub RESUMES on its own: he jogs off again (control moves to the nearest teammate) and the new guy comes on at the box.
//  - goal / period end / faceoff while paused: v421s's dead-ball path finishes the sub on the lineup (no extra man, nobody left
//    mid-run). The 40 s sub timeout is frozen while he holds it, so a long possession can't silently cancel the sub.
//  - he picks the ball up while waiting at the box (boxWait): the same pause.
// Not changed: the game's own automatic goalie outlet still skips him (it hits the most open man who is staying on); midline
// step-offs (the attackman stepping off while your crosser is over) stay blocked - passing to him would put you offside;
// the CPU's own subs are unchanged.
// Kill switch: window.__rl_no540sp = true (exactly the old behaviour). No ids, rl_* keys, saves or net protocol touched.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v540sp_loaded) return;
 W0.__rl_v540sp_loaded = 1;
 const S4 = W0.S421;
 if (!S4 || typeof S4.S !== 'function' || typeof S4.findEnt !== 'function' || typeof W0.step !== 'function') { W0.V540SP = { on: () => false, why: 'no S421' }; return; }
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const off = () => !!(W0.__rl_no540sp || W0.__rl_no421s || W0.__rl_v124gb || !(S4.on && S4.on()));
 const offG = G => off() || !G || !!G.tutorial || !!G.online || !!G.brave || !!G.over;
 const LOG = { ev: [], err: 0, stats: { pause: 0, resume: 0, boxPause: 0, deadBall: 0, gone: 0, frozenSec: 0 } };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 200) LOG.ev.shift(); };
 const er = e => { LOG.err++; if (LOG.err < 4) try { console.error(e); } catch (x) {} };
 const ln = id => { try { return lastName(PP(id)); } catch (e) { return String(id); } };
 const isU = p => !!p && (p.team === 'O' || p.team === 'G2' || p.team === 'U');
 const hasBall = (G, e) => !!e && (G.carrier === e || (G.dclear && G.dclear.holder === e) || (G.ball && G.ball.state === 'pass' && G.ball.to === e));
 function jobsOf(G) { const T = G && G.s421; return T && Array.isArray(T.jobs) ? T.jobs : []; }
 // the live box job taking this entity off (on his way / waiting at the box)
 function runJob(G, e) {
  if (!e || !e.pl || !isU(e)) return null;
  for (const j of jobsOf(G)) if (j.kind === 'box' && (j.phase === 'toBox' || j.phase === 'boxWait') && j.outId === e.pl.id) return j;
  return null;
 }
 function pause(G, j, e, why) {
  j.phase = 'wait'; j.waitMsg = 0; j.hx = null; j.hy = null; j.wp = null;
  j.p540 = { t: G.t, why: why, n: ((j.p540 && j.p540.n) || 0) + 1 };
  if (e) { e.tx = e.x; e.ty = e.y; e.wander = 0; }
  LOG.stats[why === 'box' ? 'boxPause' : 'pause']++;
  lg({ t: +G.t.toFixed(2), ev: 'pause', why: why, id: j.outId, in: j.inId, job: j.id });
 }
 // ---------- passes: open the guy jogging off as a target, pause his sub as the ball leaves ----------
 const AI = { d: 0 };
 if (typeof W0.updateDefense === 'function') {
  const UD0 = W0.updateDefense;
  W0.updateDefense = function () { AI.d++; try { return UD0.apply(this, arguments); } finally { AI.d--; } };
 }
 for (const nm of [ 'throwPass', 'dThrowClear' ]) {
  const F0 = W0[nm];
  if (typeof F0 !== 'function') continue;
  W0[nm] = function (to) {
   let j = null, G = null, prev = null;
   try {
    G = G_();
    // the game's own goalie outlet (inside updateDefense) keeps its old choice: v421s sends it to the most open man staying on
    if (!offG(G) && to && !(nm === 'dThrowClear' && AI.d > 0)) {
     j = runJob(G, to);
     if (j) { prev = { phase: j.phase, hx: j.hx, hy: j.hy, wp: j.wp, waitMsg: j.waitMsg, p540: j.p540 }; pause(G, j, to, 'pass'); }
    }
   } catch (e) { er(e); j = null; }
   const r = F0.apply(this, arguments);
   try {
    // the pass did not leave (no ball / blocked further down): put his run back exactly as it was
    if (j && prev && !(G.ball && G.ball.state === 'pass' && G.ball.to === to)) { Object.assign(j, prev); LOG.stats.pause--; lg({ t: +G.t.toFixed(2), ev: 'undo', id: j.outId }); }
   } catch (e) { er(e); }
   return r;
  };
 }
 // ---------- frame: hold the pause while he has it, freeze the sub's timeout clock, log the resume ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  let G = G_();
  try {
   if (!offG(G) && (scr() === 'live' || scr() === 'defense')) {
    // he picked the ball up at the box while the new guy waits for his time: pause there too
    for (const j of jobsOf(G)) if (j.kind === 'box' && j.phase === 'boxWait') { const e = S4.findEnt(j.outId); if (e && hasBall(G, e)) pause(G, j, e, 'box'); }
   }
  } catch (e) { er(e); }
  const r = ST0.apply(this, arguments);
  try {
   G = G_();
   if (!offG(G)) {
    const live = scr() === 'live' || scr() === 'defense';
    for (const j of jobsOf(G)) {
     if (!j.p540 || j.p540.end) continue;
     if (j.phase === 'wait') {
      const e = S4.findEnt(j.outId);
      if (e && hasBall(G, e) && live) { const d = Math.max(0, Math.min(.25, +dt || 0)); j.t0 += d; LOG.stats.frozenSec += d; if (j.p540.held == null) j.p540.held = G.t; }
     } else {
      j.p540.end = j.phase === 'done' ? (j.why || 'done') : 'resume';
      const k = j.phase === 'done' ? (j.why === 'gone' ? 'gone' : 'deadBall') : 'resume';
      LOG.stats[k] = (LOG.stats[k] || 0) + 1;
      lg({ t: +G.t.toFixed(2), ev: k, id: j.outId, in: j.inId, ph: j.phase, why: j.why || null, scr: scr(), held: +(G.t - j.p540.t).toFixed(2) });
     }
    }
   }
  } catch (e) { er(e); }
  return r;
 };
 W0.V540SP = { on: () => !off(), LOG: LOG, runJob: e => runJob(G_(), e),
  paused: () => jobsOf(G_()).filter(j => j.p540 && !j.p540.end && j.phase === 'wait').map(j => ({ id: j.outId, in: j.inId, job: j.id })) };
})();
