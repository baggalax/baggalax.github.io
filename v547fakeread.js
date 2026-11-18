/* v547fakeread.js - BAGGA LAX 1.3: GOOD GOALIES READ SOME FAKES.
 * Charlie (Nov 12, 12:47 AM): "Make sure fakes don't always work. They should work a large majority of the time, but a good
 *  goalie should not fall for it sometimes."
 * Before: every crease fake (v507fake's FAKE button, and v510pracfake's practice copy of it) made the goalie bite, every time.
 *  The shot after it was then settled by v507's table: faked one side + shot the other = 95 / 93 / 90 % goal on GROSS / NASTY /
 *  BAGGATWAAN - so a fake was close to automatic.
 * Now: the moment a fake is made, the goalie gets one READ roll. Bite chance by difficulty (DF.level), then nudged by the goalie's
 *  own SAV rating (-2.5 % bite per rating unit, at most +-5 %), clamped 62 - 97 %:
 *     SQUID 95 %   FISH 93 %   BEGINNER 90 %   GROSS 85 %   NASTY 79 %   BAGGATWAAN 70 %
 *  RECOVERY DIVE (Charlie, 12:48 AM: "Also rare diving saves on crease if he falls for a fake then dives back and saves it"):
 *   when he BITES and you shoot the other side (the shot v507 has already decided is a goal), he sometimes dives back across and
 *   saves it: SQUID 3 %  FISH 4 %  BEGINNER 5 %  GROSS 6 %  NASTY 8 %  BAGGATWAAN 10 % of those shots, +-2 % by SAV rating
 *   (save-dive pose, "DIVING SAVE!" over him). Never in the tutorials.
 *  (fakes only exist in real games on GROSS / NASTY / BAGGATWAAN; the three lower levels only matter in PRACTICE, where v510 runs fakes.)
 *  BITE (most of the time) = exactly as before: he lunges at the fake, "FAKE! HE BIT", the other side is almost always a goal.
 *  READ = he does not bite: no lunge, no save animation, he stays square in the cage ("FAKE!" / "HE READ IT" over him) and the
 *   shot is settled as a normal, un-faked crease shot (v507's own no-fake odds, or the game's own finish on GROSS) - so it is
 *   neither a free goal nor punished: a plain save attempt.
 *  How: v507 / v510 keep the fake in their F.fake (exposed as V507FAKE.F / V510PF.F); a read clears it before their bite code and
 *   their shot release see it (checked before and after every game step), and cancels the goalie's save pose that the fake started.
 * Never a read: the separate fake drill (practice.fake507), the main tutorial's fake step (v521tutfake), any G.tutorial game - so
 *  new players always see the fake work. Test hook window.__rl_547force = 'bite' | 'read' forces the roll.
 * CPU fakes: the CPU never fakes (no code path for it exists). If one is added, V547FR.roll(G, goalie) is the same rule for the
 *  user's goalie AI. Online: v507 / v510 never run fakes online, so nothing changes there. If an online fake port settles fakes,
 *  the roll is made on the host only (a guest never rolls: today's behaviour) and stored as an added field F.fake.r547 = 0 | 1
 *  ('bite' / 'read') a net layer can carry; no message shapes change.
 * Unfaked shots, odds tables, saves, rl_* keys, ids and the net protocol are untouched. Active on all hosts and the app.
 * Test hooks: __rl_547force = 'bite' | 'read', __rl_547dive = 'yes' | 'no'.
 * Kill switch: window.__rl_no547fr = true -> exactly as before (checked live). Test hook / stats: window.V547FR.
 */
(function () {
 'use strict';
 const W0 = window;
 const OFF = () => !!(W0.__rl_no547fr || W0.__rl_v124gb);
 if (W0.__rl_no547fr) return;
 if (typeof W0.step !== 'function' || typeof W0.render !== 'function') return;
 const rt = () => performance.now() / 1e3;
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 // bite chance per difficulty: SQUID, FISH, BEGINNER, GROSS, NASTY, BAGGATWAAN
 const K = { bite: [ .95, .93, .90, .85, .79, .70 ], savK: .025, savMax: .05, lo: .62, hi: .97, txt: 1.0,
  dive: [ .03, .04, .05, .06, .08, .10 ], diveK: .01, diveMax: .02 };
 const ST = { fakes: 0, bites: 0, reads: 0, skipped: 0, oppShots: 0, dives: 0, byLv: {}, last: null, log: [], errs: [] };
 const err = (e, w) => { try { if (ST.errs.length < 10) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v547fakeread', w, e); } } catch (x) {} };
 function level() { try { const l = DF && DF.level; return typeof l === 'number' && l >= 0 ? Math.min(5, Math.round(l)) : 3; } catch (e) { return 3; } }
 function sav(gk) { try { return gk && gk.pl && typeof rf === 'function' ? rf(gk.pl, 'sav') : 0; } catch (e) { return 0; } }
 function biteP(gk, lv) {
  const l = lv == null ? level() : lv;
  const b = (K.bite[l] != null ? K.bite[l] : K.bite[3]) - cl(K.savK * sav(gk), -K.savMax, K.savMax);
  return cl(b, K.lo, K.hi);
 }
 function online(G) { return !!(G && (G.online || G.meta && G.meta.online)) || !!(W0.RLNET && RLNET.inGame); }
 function isHost() {
  try { const s = W0.RLNET && RLNET.side; return s === 'host' || s === 'H' || s === 'h' || s === 0 || s === 'home' || (W0.RLNET && RLNET.host === true); } catch (e) { return false; }
 }
 function tutorial(G) {
  if (!G) return true;
  if (G.tutorial || G.practice && G.practice.fake507) return true;
  try { if (W0.V521TF && V521TF.mine && V521TF.mine()) return true; } catch (e) {}
  try { if (W0.V507FAKE && V507FAKE.T && V507FAKE.T.active) return true; } catch (e) {}
  return false;
 }
 // the one rule (also the API a CPU-fake / goalie-AI path would use): true = the goalie bites
 function roll(G, gk) {
  const f = W0.__rl_547force;
  if (f === 'bite') return { bite: true, p: 1, forced: 1 };
  if (f === 'read') return { bite: false, p: 0, forced: 1 };
  const p = biteP(gk), r = Math.random();
  return { bite: r < p, p: p, r: r };
 }
 const seen = new WeakSet();
 const R = { t: -9, x: 0, y: 0, gk: null };   // the last read, for the "HE READ IT" text
 function srcs() {
  const a = [];
  try { if (W0.V507FAKE && V507FAKE.F) a.push([ 'v507', V507FAKE.F ]); } catch (e) {}
  try { if (W0.V510PF && V510PF.F) a.push([ 'v510', V510PF.F ]); } catch (e) {}
  return a;
 }
 function check(when) {
  if (OFF()) return;
  const G = G0(); if (!G) return;
  for (const [nm, F] of srcs()) {
   const fk = F.fake;
   if (!fk || typeof fk !== 'object' || seen.has(fk)) continue;
   seen.add(fk);
   if (tutorial(G)) { ST.skipped++; fk.r547 = 0; fk.t547 = 1; continue; }
   if (online(G) && !isHost()) { ST.skipped++; fk.t547 = 1; continue; }   // a guest never rolls: the host's word (fk.r547) or today's behaviour
   const gk = G.goalie, lv = level(), o = roll(G, gk);
   ST.fakes++;
   const b = ST.byLv[lv] || (ST.byLv[lv] = { fakes: 0, reads: 0 });
   b.fakes++;
   fk.r547 = o.bite ? 0 : 1;
   ST.last = { src: nm, when: when, lv: lv, p: +o.p.toFixed(3), bite: o.bite, sav: +sav(gk).toFixed(2), fake: fk.name };
   ST.log.push(ST.last); if (ST.log.length > 40) ST.log.shift();
   if (o.bite) { ST.bites++; continue; }
   // READ: he doesn't bite - the fake never happened as far as the goalie and the shot are concerned
   ST.reads++; b.reads++;
   F.fake = null;
   try { if (gk) { gk.saveT0 = null; gk.saveFr = null; if (typeof fk.gy0 === 'number') { gk.y = fk.gy0; gk.ty = fk.gy0; } } } catch (e) {}
   if (gk) { R.t = rt(); R.gk = gk; R.nod = 0; }
  }
 }
 // remember where the goalie stood when the fake was made (so a 1-frame lunge from a controller fake is undone on a read)
 function remember() {
  const G = G0(); if (!G || !G.goalie) return;
  for (const [, F] of srcs()) { const fk = F.fake; if (fk && typeof fk === 'object' && !seen.has(fk) && typeof fk.gy0 !== 'number') fk.gy0 = G.goalie.y; }
 }

 // ---------------- the rare recovery dive (he bit, you shot the other side, he dives back and saves it) ----------------
 function diveP(gk, lv) {
  const l = lv == null ? level() : lv;
  return cl((K.dive[l] != null ? K.dive[l] : K.dive[3]) + cl(K.diveK * sav(gk), -K.diveMax, K.diveMax), 0, .2);
 }
 const D = { t: -9, gk: null };
 function dive(when) {
  if (OFF()) return;
  const G = G0(), b = G && G.ball;
  if (!b || b.state !== 'shot') return;
  for (const P of [ b.f507, b.f510 ]) {
   if (!P || !P.done || P.d547 || P.k === 9 || P.v521) continue;
   P.d547 = 1;
   if (P.force !== 'goal' || P.kind !== 'opp' || !P.fake || P.fake.t547) continue;
   if (online(G) && !isHost()) continue;
   const gk = G.goalie, lv = level();
   const f = W0.__rl_547dive, p = diveP(gk, lv), r = Math.random();
   const yes = f === 'yes' ? true : f === 'no' ? false : r < p;
   ST.oppShots++;
   const bl = ST.byLv[lv] || (ST.byLv[lv] = { fakes: 0, reads: 0 });
   bl.opp = (bl.opp || 0) + 1;
   if (!yes) continue;
   ST.dives++; bl.dives = (bl.dives || 0) + 1;
   P.force = 'save'; P.dive547 = 1;
   try {
    const ty = b.target && typeof b.target.y === 'number' ? b.target.y : b.y;
    b.block = null; b.pipe = null; b.aim14 = null;
    if (b.s25) b.s25.own = true;
    if (gk) { gk.reach = Math.max(gk.reach || 0, 9); gk.react = 0; gk.dive = ty; gk.saveT0 = menuT; gk.saveFr = b.target && (b.target.high != null ? b.target.high : b.high) ? 'save_high' : 'save_side'; }
   } catch (e) { err(e, 'dive'); }
   D.t = rt(); D.gk = gk;
   ST.log.push({ dive: 1, lv: lv, p: +p.toFixed(3), when: when }); if (ST.log.length > 40) ST.log.shift();
  }
 }
 const ST0 = W0.step;
 W0.step = function (dt) {
  try { if (!OFF()) { remember(); check('pre'); dive('pre'); } } catch (e) { err(e, 'pre'); }
  const r = ST0.apply(this, arguments);
  try { if (!OFF()) { check('post'); dive('post'); } } catch (e) { err(e, 'post'); }
  return r;
 };
 // "HE READ IT" over the goalie (same spot / style as v507's "FAKE! HE BIT")
 const RD0 = W0.render;
 W0.render = function () {
  const r = RD0.apply(this, arguments);
  if (OFF()) return r;
  const G = G0(), gk = G && G.goalie;
  if (!gk) return r;
  const ed = rt() - D.t;
  if (ed >= 0 && ed < 1.3 && gk === D.gk && SCR() !== 'menu') {   // also over the dead-ball dim right after the save
   try {
    g.save(); g.setTransform(RR, 0, 0, RR, 0, 0); g.globalAlpha = 1;
    text('DIVING SAVE!', Math.round(gk.x - Math.round(camX)), Math.round(gk.y) - 36 - Math.round(Math.min(.25, ed) * 16), 1, '#7dd8ff', 'center', '#000');
   } catch (e) { err(e, 'ddraw'); } finally { try { g.restore(); } catch (x) {} }
   return r;
  }
  const el = rt() - R.t;
  if (SCR() !== 'live' || el < 0 || el > K.txt || gk !== R.gk) return r;
  try {
   g.save();
   g.setTransform(RR, 0, 0, RR, 0, 0); g.globalAlpha = 1;
   const x = Math.round(gk.x - Math.round(camX)), y = Math.round(gk.y) - 38 - Math.round(Math.min(.25, el) * 16);   // a bit above v507's spot: clear of the carrier's name tag
   text('FAKE!', x, y, 1, '#ff5a4a', 'center', '#000');
   if (el > .15) text('HE READ IT', x, y + 7, 1, '#ffe14d', 'center', '#000');
   // a quick nod: two small head dips drawn as a dark tick above him in the first half second
   if (el < .5 && Math.floor(el * 8) % 2 === 0) { g.fillStyle = '#ffe14d'; g.fillRect(x - 1, Math.round(gk.y) - 16, 3, 1); }
  } catch (e) { err(e, 'draw'); } finally { try { g.restore(); } catch (x) {} }
  return r;
 };
 W0.V547FR = { on: () => !OFF(), K: K, ST: ST, biteP: biteP, diveP: diveP, roll: roll, level: level, check: check,
  table: () => K.bite.map((b, i) => ({ lv: i, bite: b, read: +(1 - b).toFixed(2) })) };
})();
