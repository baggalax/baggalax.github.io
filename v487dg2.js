// v487dg2.js - V48.7: the "diagonal / synced player" fix, part 3 (kill switch: window.__rl_no487dg2 = true).
// Charlie (Nov 10 12:36 AM, 1.2 beta site, Q2, MAN-UP running): "Diagonal glitched happens again" /
// "Think i was tryna check someone while going for ground ball".
// Root cause (game.js looseWatchdog, the defense branch L5096-5102, and the same live branch L5077-5083): when the ball has
// been on the ground for 0.8 s and your thumb is OFF the stick (you are tapping CHECK / HIT at someone), the game "helps"
// by writing G.run = { x, y } - ONE fixed direction from your guy to where the ball was at that instant. Nothing ever
// re-aims it: the ball rolls on, the CPU chaser cuts across, and your guy keeps running that frozen diagonal at the
// ground-ball pace (L24142); a CPU chaser on the same line ends up glued to him at the 4 px player spacing, the two
// moving as one (the "sync"), and your guy faces the frozen diagonal. Worse, it OUTLIVES the ground ball: the run has
// no .joy flag, so lifting / never touching the stick does not clear it (joyRelease only clears joy runs, L2411), dTake
// does not clear it when control stays on the same guy (L23639), and while it is set the game treats your thumb as ON
// the stick - updateDefense keeps running him along it (L24153), dAutoTick will not hand control to a better defender
// while a check is cooling down (L23671) or you are near the carrier with a run set (L23705/L23722), and v441dg (thumb
// off only) never engages. With AUTO SWITCH off in settings (dAutoTick returns at L23671) nothing at all ends it.
// Reproduced headless (test/h.py + test/mon.js; man-up and man-down D, the ball popped loose, CHECK/HIT tapped every
// 0.35 s, thumb never on the stick): the frozen run kept steering the defender after the CPU had the ball for up to
// 1.5 s (auto switch on) and up to 13 s (auto switch off) - he runs off on his own diagonal away from the play; in 2 of
// 40 runs it pinned him on a CPU player for 1.0-1.1 s; and during the ground ball itself the CPU chaser was glued to
// him for 1.28 s (2 of 48 runs, man-down) - both ran the same frozen line.
// Fix: only the run the watchdog itself wrote (tagged at the moment it is written; your own stick, keys and taps are
// never touched): while the ball is loose it is re-aimed at the ball every frame (so he chases the ball, not a stale
// spot), with a side-step around a player he is jammed on (> 0.3 s within 6.5 px) instead of riding his back; and the
// moment the ball is not loose any more (scooped, passed, clear) or the control switches, the helper run is dropped so
// the normal D (and v441dg) takes over exactly as with the thumb off (on offense, if YOU scoop it, the run is left to the
// game's own carrier rule L7322 exactly as before). Offline only; no ids, rl_* keys, __rl_* flags,
// net messages or fields change.
(function () {
 'use strict';
 const W0 = window;
 if (typeof W0.looseWatchdog !== 'function' || typeof W0.updateDefense !== 'function' || typeof W0.updateLive !== 'function') { W0.V487DG2 = { on: () => false, why: 'no hooks' }; return; }
 const off = () => !!W0.__rl_no487dg2 || !!W0.__rl_v124gb;
 const LOG = { tag: 0, aim: 0, side: 0, drop: 0, err: 0, last: null };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const offline = G => !!G && !G.online && !(G.meta && G.meta.online) && !G.tutorial;
 let PIN = null;   // { G, p, o, t, sd }
 const LW0 = W0.looseWatchdog;
 W0.looseWatchdog = function (dt, mode) {
  let G0 = null, r0 = null;
  try { G0 = game; r0 = G0 && G0.run; } catch (e) {}
  const out = LW0.apply(this, arguments);
  try {
   const G = game;
   if (!off() && G === G0 && offline(G) && G.run && G.run !== r0 && !G.run.joy) {
    G.run.auto487 = mode === 'live' ? 'live' : 'def';
    G.run.who487 = mode === 'live' ? G.ctrl : G.dctl;
    LOG.tag++;
   }
  } catch (e) { LOG.err++; }
  return out;
 };
 function fix(G, key) {
  const r = G.run;
  if (!r || !r.auto487) return;
  const p = G[key], b = G.ball;
  if (!b || (b.state !== 'loose' && b.state !== 'chase') || !p || r.who487 !== p || p.down > 0) {   // ground ball over / control moved: drop the helper run
   if (key === 'ctrl' && p && r.who487 === p && b && b.state !== 'loose' && b.state !== 'chase') { delete r.auto487; LOG.keepLive = (LOG.keepLive || 0) + 1; PIN = null; return; }   // you scooped it on offense: the game's own carry rule (L7322) keeps handling that run, as before
   G.run = null; PIN = null; LOG.drop++; LOG.last = { why: !b || b.state !== 'loose' ? 'ball ' + (b && b.state) : 'ctl', t: +G.t.toFixed(2) };
   return;
  }
  let ux = b.x - p.x, uy = b.y - p.y; const L = Math.hypot(ux, uy);
  if (L < .5) return;
  ux /= L; uy /= L;
  // jammed on a player between him and the ball: step round his shoulder instead of riding his back
  let o = null, od = 6.5;
  for (const q of G.players) {
   if (q === p || q.team === p.team || q.team === 'G' || q.team === 'G2' || q.down > 0) continue;
   const d = Math.hypot(q.x - p.x, q.y - p.y);
   if (d < od && ((q.x - p.x) * ux + (q.y - p.y) * uy) > -1) { od = d; o = q; }
  }
  if (o && L > 4) {
   if (!PIN || PIN.G !== G || PIN.p !== p || PIN.o !== o) PIN = { G: G, p: p, o: o, t: 0, sd: ((o.x - p.x) * -uy + (o.y - p.y) * ux) > 0 ? -1 : 1 };
   PIN.t += G.dt487 || 1 / 60;
   if (PIN.t > .3) {
    const sx = -uy * PIN.sd, sy = ux * PIN.sd;
    ux = ux * .55 + sx * .85; uy = uy * .55 + sy * .85;
    const l2 = Math.hypot(ux, uy) || 1; ux /= l2; uy /= l2;
    LOG.side++;
   }
  } else if (PIN && PIN.p === p) PIN.t = Math.max(0, PIN.t - (G.dt487 || 1 / 60) * 2);
  r.x = ux; r.y = uy; LOG.aim++;
 }
 function wrap(name, key, scrName) {
  const F0 = W0[name];
  W0[name] = function (dt) {
   try { const G = game; if (!off() && offline(G) && scr() === scrName && G.run && G.run.auto487) { G.dt487 = dt; fix(G, key); } } catch (e) { LOG.err++; }
   const out = F0.apply(this, arguments);
   try { const G = game; if (!off() && offline(G) && G && G.run && G.run.auto487 && (scr() !== scrName || !G.ball || (G.ball.state !== 'loose' && G.ball.state !== 'chase'))) { G.dt487 = dt; fix(G, key); } } catch (e) { LOG.err++; }
   return out;
  };
 }
 wrap('updateDefense', 'dctl', 'defense');
 wrap('updateLive', 'ctrl', 'live');
 W0.V487DG2 = { on: () => !off(), LOG: LOG };
})();
