/* v453fo.js - V45.3: FACEOFF TAP METER - no stutter, no slide-back, no audio churn while you mash (Bagga Lax 1.1).
 * Charlie (Nov 8, 1.1 TestFlight, World Games on BAGGATWAAN): "towards the end of my game my faceoff bar starts glitching
 * and when I tap it barely goes up it like stutters".
 * What was measured (headless, full games, real touch events at 8 taps/s): every tap adds the same amount in Q1 and Q4
 * (no fatigue / score / clock / difficulty term touches the tap count), frame time and memory are flat across the game,
 * and no tap is dropped even at ~30 fps. What does make the meter look broken:
 *  1) the YOU bar (v4012tut) carries a FOGO-rating ramp. For a FOGO rated under the league norm (most World Games
 *     FOGOs, and any non-FOGO who ends up on the X after an injury / ejection / sub) that ramp is NEGATIVE, so between
 *     taps the bar slides BACK: tap +7%, slide -2..3%, tap +7%... = "barely goes up, it stutters".
 *  2) on GROSS + BAGGATWAAN (faceoff leveling, v4012tut 'fol') the CPU bar is computed from YOUR bar, so it jumps up on
 *     the same frame as every one of your taps - it looks like your taps do nothing.
 *  3) after the app has been in the background (switching to Messages mid-game), the iPhone can leave the AudioContext
 *     'interrupted'. Every touchstart/touchend then calls audioInit(), which re-asks resume() and every 0.7 s throws the
 *     AudioContext away and builds a new one - during a faceoff mash that is ~120 resume() calls and 6-7 new
 *     AudioContexts per faceoff, all on the main thread, exactly while you mash.
 * This file:
 *  A) draws the bars with the negative rating ramp moved onto the CPU bar (the GAP between the bars - and the
 *     faceoff math - is unchanged; your bar just never moves backward), and smooths the CPU bar on GROSS/BAGGATWAAN so
 *     it no longer jumps in lockstep with your taps (display only, resolves to the same value).
 *  B) while a faceoff is in GET READY / SET / GO, audio recovery runs at most once every 2.5 s (instead of on every
 *     touch), and an AudioContext is never rebuilt more often than every 2.5 s anywhere. Sound still comes back.
 * Win odds, tap counting, CPU tap rate, the 'fol' leveling, fatigue, items: untouched. Online: the audio guard (B) is
 * client-side and applies online too; the bar change (A) is off online (the bars there stay exactly as they were).
 * Kill switch: window.__rl_no453fo = true -> exactly the old behaviour. No storage keys, no net protocol.
 */
(function () {
 'use strict';
 const W0 = window;
 const off = () => !!(W0.__rl_no453fo || W0.__rl_v124gb);
 const LOG = W0.V453FO = { draws: 0, skipInit: 0, skipFresh: 0, inits: 0, errs: 0, lastErr: null, on: () => !off() };
 const err = (e, w) => { LOG.errs++; LOG.lastErr = (w || '') + ': ' + String(e && e.message || e).slice(0, 160); if (LOG.errs < 4) try { console.warn('v453fo', w, e); } catch (x) {} };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const online = () => { try { return !!(W0.RLNET && RLNET.inGame); } catch (e) { return false; } };
 const ms = () => performance.now();
 const KTAP = .11 / .07, GAP = 2500;

 /* ---------- B) audio recovery guard ---------- */
 const mashing = () => { const G = G0(), F = G && G.fo; return scr() === 'faceoff' && !!F && (F.phase === 'ready' || F.phase === 'set' || F.phase === 'go'); };
 const acDown = () => { try { return typeof AC !== 'undefined' && !!AC && AC.state !== 'running' && AC.state !== 'closed'; } catch (e) { return false; } };
 let lastInit = -1e9, lastFresh = -1e9;
 if (typeof W0.audioInit === 'function') {
  const AI0 = W0.audioInit;
  W0.audioInit = function () {
   if (!off()) {
    try {
     if (mashing() && acDown()) {
      const t = ms();
      if (t - lastInit < GAP) { LOG.skipInit++; return; }
      lastInit = t;
     }
    } catch (e) { err(e, 'init'); }
   }
   LOG.inits++;
   return AI0.apply(this, arguments);
  };
 }
 if (typeof W0.audioFresh === 'function') {
  const AF0 = W0.audioFresh;
  W0.audioFresh = function () {
   if (!off()) {
    try {
     const t = ms();
     if (t - lastFresh < GAP && typeof AC !== 'undefined' && AC && AC.state !== 'closed') {
      LOG.skipFresh++;
      try { AC.__askT = t; } catch (x) {}   // keep the current context, ask again later
      return;
     }
     lastFresh = t;
    } catch (e) { err(e, 'fresh'); }
   }
   return AF0.apply(this, arguments);
  };
 }

 /* ---------- A) the bars ---------- */
 const barOn = () => !off() && !online() && !!W0.V4012T && typeof V4012T.barVals === 'function' && !W0.__rl_no4012tut && !W0.__rl_no4012bar;
 const folLvl = () => { try { return !W0.__rl_no4012fol && typeof DF !== 'undefined' && (DF.level === 3 || DF.level === 5); } catch (e) { return false; } };
 let sm = null;   // { fo, cpu, t }
 function vals(G, F) {
  const v = V4012T.barVals();
  if (!v || !(v.max > 0)) return null;
  const sd = F.setDur || 1.2, prog = Math.max(0, Math.min(1, F.t / sd));
  let meR = 0;
  try { meR = rf(G.foMe.pl, 'fo'); } catch (e) {}
  const neg = meR < 0 ? -KTAP * meR * sd * prog : 0;   // >= 0: what the rating ramp takes away from your bar
  let me = v.me + neg, cpu = v.cpu + neg;               // same gap, your bar never slides back
  const t = ms();
  if (folLvl() && !G.tutorial && !G.practice) {
   if (!sm || sm.fo !== F) sm = { fo: F, cpu: cpu, t: t };
   const dt = Math.max(0, Math.min(.1, (t - sm.t) / 1e3));
   sm.cpu += (cpu - sm.cpu) * Math.min(1, dt * 7);
   sm.t = t;
   cpu = sm.cpu;
  } else sm = null;
  return { me: me, cpu: cpu, max: v.max };
 }
 function drawBars(G, F) {
  const v = vals(G, F);
  if (!v) return;
  const mid = Math.round(W / 2), my = F.v131 ? 52 : 22;
  const f = x => Math.round(100 * Math.max(0, Math.min(1, x / v.max)));
  rect(mid - 62, my, 124, 18, 'rgba(0,0,0,.9)');
  text('YOU', mid - 58, my + 3, 1, '#8fe3f0');
  rect(mid - 42, my + 3, 100, 4, '#333');
  rect(mid - 42, my + 3, f(v.me), 4, '#2cc4dc');
  text('CPU', mid - 58, my + 10, 1, '#ff9a8a');
  rect(mid - 42, my + 10, 100, 4, '#333');
  rect(mid - 42, my + 10, f(v.cpu), 4, '#ff5a4a');
  LOG.draws++;
  LOG.last = { me: +(v.me / v.max).toFixed(4), cpu: +(v.cpu / v.max).toFixed(4) };
 }
 if (typeof W0.drawFaceoffUI === 'function') {
  const D0 = W0.drawFaceoffUI;
  W0.drawFaceoffUI = function () {
   const r = D0.apply(this, arguments);
   try {
    const G = G0(), F = G && G.fo;
    if (barOn() && F && (F.phase === 'set' || F.phase === 'go') && G.foMe && G.foThem) drawBars(G, F);
   } catch (e) { err(e, 'bar'); }
   return r;
  };
 }
 LOG.vals = () => { const G = G0(), F = G && G.fo; return G && F && barOn() ? vals(G, F) : null; };
})();
