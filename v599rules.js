/* v599rules.js - Bagga Lax 1.5f: REAL LACROSSE RULES PER LEAGUE (Charlie approved, rules_sheet_v1.md APPROVED section,
 * shot clock change of Nov 22: 20 s in every league).
 * Bug / ask: one hard-coded rule set for every mode (flat 30 s penalties, full shot-clock reset on every kept possession,
 *  every save ends the possession, random "whistle" fights, an OT picking menu, plays that wait for the pass).
 * Fix (wrappers; game.js only had CLEAR_T / BOX_T / CREASE_CT and PEN_LEN turned from const into var):
 *  RULES profile per league, chosen in newGame:  college -> NCAA, world -> WORLD, everything else (season, quick, career,
 *  ultimate, online, Locker League) -> PLL. Shot clock 20 s everywhere (v517sc's +10 is switched off while a league is on).
 *  Every other timer = real time x (20 / real shot clock), rounded to 0.5 s, never under 2 s:
 *   NCAA / WORLD x0.25: clear 5, kept save / pipe reset 15, technical 7.5, 1 min 15, 2 min 30, 3 min 45, crease 2.
 *   PLL x0.385: after a faceoff win 12.5, clear 7.5, kept save / pipe reset 20, technical 11.5, 1 min 23, 2 min 46, 3 min 69.
 *  Penalties typed (technical / personal 1-2-3 min / nonreleasable); a goal releases only releasable time; time carries
 *   across periods (as before).
 *  Saves: the goalie keeps it, or it rebounds live (with a small TIP chance behind the cage); the offense keeping it resets
 *   the clock to the league reset value (never full). Pipe hits the same.
 *  Faceoff violation: their ball (as before) and your faceoff man sits out the next faceoff.
 *  Overtime: sudden victory, OT length = real OT / real quarter x the game quarter (NCAA 4/15, PLL 12/12, WORLD 3/12),
 *   repeat; no OT menu. ONLINE: 30 s, 30 s, then Braveheart.
 *  Fights: never from a random whistle roll (hits / cheap plays only); both fighters sit equal time = no man-up; the
 *   winner's team gets the ball (game.js fightBall14, as before).
 *  Shot backup: when you are about to shoot, the teammate nearest the end line runs to X behind the cage (not during a play).
 *  Plays: routes run on their own clock from the start; the pass never holds a route (needBall + V27.pgWait off).
 *  Online: both phones pick PLL from the same match flags; random save rebounds are off online (always a catch) so the two
 *   phones cannot disagree. No net message changes.
 * Kill switches: window.__rl_no599 (everything), __rl_no599pen, __rl_no599sc, __rl_no599save, __rl_no599fo, __rl_no599ot,
 *  __rl_no599fight, __rl_no599backup, __rl_no599play.
 */
(function () {
 if (window.__rl_rules600 === false) return; // 1.5f: the RULES project is ON; window.__rl_rules600 = false (set before load) turns all of it off = the game plays exactly as before.
 'use strict';
 const Wn = window;
 if (Wn.RULES599) return;
 const off = k => !!(Wn.__rl_no599 || (k && Wn['__rl_no599' + k]));
 const r5 = x => Math.max(2, Math.round(x * 2) / 2);
 const SHOT = 20;
 function mk(id, real) { // real seconds -> game seconds with the league ratio
  const k = SHOT / real.shot, s = x => r5(x * k);
  return {
   id: id, ratio: k, shot: SHOT, foClock: real.shotFO ? s(real.shotFO) : null, reset: real.reset ? Math.min(SHOT, s(real.reset)) : SHOT,
   // 1.5 B77 (Charlie): the crease count is 6 s of game time in every league (scaled it was 1-1.5 s = called right after the save); the clear count never under 8 s (a human needs it on a phone)
   clear: Wn.__rl_no77t ? s(real.clear) : Math.max(8, s(real.clear)), crease: Wn.__rl_no77t ? s(real.crease) : 6, pen: { tech: s(30), p1: s(60), p2: s(120), p3: s(180) },
   ot: real.ot, rebP: .38, tipP: .06
  };
 }
 const P = {
  NCAA: mk('NCAA', { shot: 80, clear: 20, reset: 60, crease: 4, ot: 4 / 15 }),
  PLL: mk('PLL', { shot: 52, shotFO: 32, clear: 20, reset: 52, crease: 4, ot: 12 / 12 }),
  WORLD: mk('WORLD', { shot: 80, clear: 20, reset: 60, crease: 4, ot: 3 / 12 })
 };
 // 1.5 B66 timeouts per league (rules_research.md 12): NCAA 2 a half (no carry-over) + 1 per OT period, up to 2 min;
 // PLL 3 a game (60 s, 60 s, 30 s), at most 2 in the second half, none in OT; WORLD 2 a half, 90 s, none in sudden victory.
 // Lengths in game seconds with the league ratio (same as every other timer). Used by v600to.js.
 P.NCAA.to = { per: 'half', n: 2, ot: 1, len: [ r5(120 * P.NCAA.ratio) ] };
 P.PLL.to = { per: 'game', lens: [ 60, 60, 30 ].map(x => r5(x * P.PLL.ratio)), real: [ 60, 60, 30 ], max2: 2, ot: 0 };
 P.WORLD.to = { per: 'half', n: 2, ot: 0, len: [ r5(90 * P.WORLD.ratio) ] };
 // spec rounding (Charlie's table): PLL 1 min = 23, 2 min = 46
 P.PLL.pen.p1 = 23; P.PLL.pen.p2 = 46;
 const DEF = { CLEAR_T: 10, CREASE_CT: 4, PEN_LEN: 30 };
 const R = Wn.RULES599 = { P: P, log: [], err: [], forMode: null };
 const fail = (w, e) => { try { R.err.push(w + ': ' + (e && e.message || e)); } catch (x) {} };
 function forMode(mode, meta) {
  meta = meta || {};
  if (mode === 'tutorial' || mode === 'practice') return null;
  if (meta.online || mode === 'online') return 'PLL';
  if (mode === 'college' || meta.col25) return 'NCAA';
  if (mode === 'world') return 'WORLD';
  return 'PLL';
 }
 R.forMode = forMode;
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const RU = G => (!off() && G && G.rules && P[G.rules.id]) ? G.rules : null;
 function setGlobals(rl) {
  try {
   if (rl) { CLEAR_T = rl.clear; CREASE_CT = rl.crease; PEN_LEN = rl.pen.p1; } else { CLEAR_T = DEF.CLEAR_T; CREASE_CT = DEF.CREASE_CT; PEN_LEN = DEF.PEN_LEN; }
   if (Wn.V517) V517.ADD = rl && !off('sc') ? SHOT - V517.base : 10;
  } catch (e) { fail('globals', e); }
 }
 // ---------- 1: the profile on every new game ----------
 const ng0 = Wn.newGame;
 if (typeof ng0 === 'function') Wn.newGame = function (user, opp, mode, userHome, meta) {
  const r = ng0.apply(this, arguments);
  try {
   const G = G0(), id = off() ? null : forMode(mode, meta);
   if (G) { G.rules = id ? Object.assign({}, P[id], { pen: Object.assign({}, P[id].pen) }) : null; if (G.online && G.rules) G.rules.rebP = 0; }
   setGlobals(G && G.rules);
   if (G && G.rules && typeof G.shotClock === 'number' && G.shotClock > SHOT) G.shotClock = SHOT;
   R.log.push(['game', mode, id]); if (R.log.length > 60) R.log.shift();
  } catch (e) { fail('newGame', e); }
  return r;
 };
 // keep the globals right when an old game object is reloaded / resumed
 setInterval(() => { try { const G = G0(), rl = RU(G); if ((rl && CLEAR_T !== rl.clear) || (!rl && G && !G.rules && CLEAR_T !== DEF.CLEAR_T)) setGlobals(rl); } catch (e) {} }, 500);

 // ---------- 2: typed penalties ----------
 const NR = /UNSPORTS|TRASH|TAUNT|CONDUCT|FIGHT|SPEAR|ABUSE/;
 const P2 = /ROUGH|SPEAR|ILLEGAL BODY|CHECK TO THE HEAD|HEAD/;
 const TECH = /PUSH|HOLD|OFFSIDE|PICK|INTERFER|WARD|CREASE|DELAY|ILLEGAL PROCEDURE|STALL|WITHHOLD|SCREEN|OVER AND BACK/;
 function classify(foul) {
  const f = String(foul || '').toUpperCase();
  if (NR.test(f)) return { t: /FIGHT/.test(f) ? 'p3' : 'p2', nr: true };
  if (P2.test(f)) return { t: 'p2', nr: false };
  if (TECH.test(f)) return { t: 'tech', nr: false };
  return { t: 'p1', nr: false }; // SLASHING, TRIPPING, CROSS-CHECK, LATE HIT ... = personal 1 min
 }
 R.classify = classify;
 const sp0 = Wn.startPenalty;
 if (typeof sp0 === 'function') Wn.startPenalty = function () {
  const G = G0(), pp = G && G.penPending;
  const r = sp0.apply(this, arguments);
  try {
   const rl = RU(G);
   if (r && rl && !off('pen') && G.pen) { const c = classify(pp && pp.foul); G.pen.type = c.t; G.pen.nr = c.nr; G.pen.left = rl.pen[c.t]; G.pen.len599 = G.pen.left; R.log.push(['pen', rl.id, pp && pp.foul, c.t, c.nr, G.pen.left]); }
  } catch (e) { fail('pen', e); }
  return r;
 };
 const po0 = Wn.penaltyOver;
 if (typeof po0 === 'function') Wn.penaltyOver = function (why) {
  try {
   const G = G0();
   if (why === 'goal' && RU(G) && !off('pen') && G.pen && G.pen.nr) { R.log.push(['pen-kept', G.pen.left]); try { addFx('cue', 0, 0, { s: 'GOAL - NONRELEASABLE PENALTY STAYS', col: '#ff9a8a', life: 1.4 }); } catch (e) {} return; }
  } catch (e) { fail('penOver', e); }
  return po0.apply(this, arguments);
 };

 // ---------- 3: shot clock on pipes / kept saves / after a faceoff win ----------
 let scBefore = null;
 const pb0 = Wn.pipeBonk;
 if (typeof pb0 === 'function') Wn.pipeBonk = function () { try { const G = G0(); scBefore = G ? G.shotClock : null; } catch (e) {} return pb0.apply(this, arguments); };
 const pl0 = Wn.popLoose;
 if (typeof pl0 === 'function') Wn.popLoose = function (x, y, vx, vy, kind) {
  const r = pl0.apply(this, arguments);
  try { const G = G0(), rl = RU(G); if (rl && !off('sc') && kind === 'pipe' && scBefore != null) { G.shotClock = Math.max(Math.min(scBefore, SHOT), rl.reset); R.log.push(['pipe-reset', rl.id, scBefore, G.shotClock]); } } catch (e) { fail('pipe', e); }
  scBefore = null;
  return r;
 };
 const fr0 = Wn.foResolve;
 if (typeof fr0 === 'function') Wn.foResolve = function () { const r = fr0.apply(this, arguments); try { const G = G0(); if (RU(G)) G.__fo599 = G.t || 1; } catch (e) {} return r; };

 // ---------- 4: saves - catch, live rebound or tip ----------
 const ep0 = Wn.endPossession;
 if (typeof ep0 === 'function') Wn.endPossession = function (kind, label) {
  try {
   const G = G0(), rl = RU(G);
   if (rl && !off('save') && kind === 'turnover' && label === 'SAVED!' && !G.tutorial && !G.online && !(G.meta && G.meta.online) && !(Wn.RLNET && RLNET.inGame) && rl.rebP > 0 && typeof screen !== 'undefined' && screen === 'live') {
    const x = Math.random();
    if (x < rl.rebP + rl.tipP) {
     const tip = x < rl.tipP, b = G.ball, gx = (typeof GX !== 'undefined' ? GX : b.x), cy = b.y;
     const vx = tip ? rnd(18, 34) : -rnd(45, 85), vy = tip ? rnd(-30, 30) : rnd(-55, 55);
     const keep = G.shotClock;
     popLoose(Math.min(b.x, gx) - (tip ? -2 : 6), cy, vx, vy, tip ? 'tip' : 'save');
     G.shotClock = Math.max(Math.min(keep, SHOT), rl.reset); // the offense keeps it -> league reset; the defense picks it up -> their own new clock
     try { addFx('cue', 0, 0, { s: tip ? 'TIPPED!' : 'REBOUND!', col: '#8fe3f0', life: 1 }); } catch (e) {}
     R.log.push([tip ? 'tip' : 'rebound', rl.id, keep, G.shotClock]);
     return;
    }
    R.log.push(['catch', rl.id]);
   }
   // sudden victory in OT (all leagues): the first goal ends it
   if (RU(G) && !off('ot') && (kind === 'goal') && (G.otq || 0) >= 1 && !G.brave) { G.ot = true; G.gg516 = true; G.ggEnd516 = true; R.log.push(['sv-goal', G.q]); }
  } catch (e) { fail('save', e); }
  return ep0.apply(this, arguments);
 };
 for (const [n, test] of [['dEnd', k => k === 'cgoal']]) {
  const o = Wn[n]; if (typeof o !== 'function') continue;
  Wn[n] = function (kind) { try { const G = G0(); if (test(kind) && RU(G) && !off('ot') && (G.otq || 0) >= 1 && !G.brave) { G.ot = true; G.gg516 = true; G.ggEnd516 = true; R.log.push(['sv-cgoal', G.q]); } } catch (e) {} return o.apply(this, arguments); };
 }
 { const o = Wn.afterCpu; if (typeof o === 'function') Wn.afterCpu = function () { try { const G = G0(); if (G && G.cpu && G.cpu.outcome === 'goal' && RU(G) && !off('ot') && (G.otq || 0) >= 1 && !G.brave) { G.ot = true; G.gg516 = true; G.ggEnd516 = true; } } catch (e) {} return o.apply(this, arguments); }; }

 // ---------- 5: faceoff violation - the violator sits the next faceoff ----------
 const fv0 = Wn.foViolation;
 if (typeof fv0 === 'function') Wn.foViolation = function () { try { const G = G0(); if (RU(G) && !off('fo') && G.lu && G.lu[0]) { G.__foSit599 = G.lu[0].FO; R.log.push(['fo-viol', G.lu[0].FO]); } } catch (e) {} return fv0.apply(this, arguments); };
 const sf0 = Wn.startFaceoff;
 if (typeof sf0 === 'function') Wn.startFaceoff = function () {
  const G = G0();
  let L0 = null, orig = null;
  try {
   if (G && G.__foSit599 && RU(G) && !off('fo') && G.lu && G.lu[0]) {
    L0 = G.lu[0]; orig = L0.FO;
    const pool = [...(L0.M || []), ...(L0.A || []), L0.LSM, L0.SSDM, ...(L0.D || [])].filter(id => id && id !== orig && PP(id)).sort((a, b) => ((PP(b).r || {}).fo || 0) - ((PP(a).r || {}).fo || 0));
    if (pool[0]) { L0.FO = pool[0]; R.log.push(['fo-sub', orig, pool[0]]); try { addFx('cue', 0, 0, { s: lastName(PP(orig)) + ' SITS - FACEOFF VIOLATION', col: '#ffb14d', life: 1.6 }); } catch (e) {} } else L0 = null;
    G.__foSit599 = null;
   }
  } catch (e) { fail('foSit', e); L0 = null; }
  try { return sf0.apply(this, arguments); } finally { if (L0) L0.FO = orig; }
 };

 // 1.5f (Jonny B61 HIGH): the online OT break froze when the GUEST was in control - the OT branch below never called the
 // wrapped endQuarter, so 'qend' was never sent and only the host may start the faceoff. Online now goes through the normal
 // endQuarter on both phones; game.js does OT, OT, then Braveheart and asks otLen173 for the OT length: 30 s online.
 { const ol0 = Wn.otLen173; if (typeof ol0 === 'function') Wn.otLen173 = function (G) { try { if (G && G.online && !Wn.__rl_no600otnet && RU(G) && !off('ot')) { G.ot = false; G.gg516 = false; G.ot516k = G.q; G.ot516pend = false; return 30; } } catch (e) {} return ol0.apply(this, arguments); }; }
 // after the second online OT game.js starts BRAVEHEART; v516ot (friend-game OT rule, default 'golden') would turn that
 // into a golden-goal period. Mark the Braveheart period as handled before v516 sees it (step runs on both phones).
 { const st0 = Wn.step; if (typeof st0 === 'function') Wn.step = function () { try { const G = G0(); if (G && G.online && G.brave && !Wn.__rl_no600otnet && RU(G) && !off('ot') && G.q > (G.periods || 4)) G.ot516k = G.q; } catch (e) {} return st0.apply(this, arguments); }; }
 // ---------- 6: overtime - sudden victory per league, no menu; online 30 s, 30 s, Braveheart ----------
 const eq0 = Wn.endQuarter;
 if (typeof eq0 === 'function') Wn.endQuarter = function () {
  try {
   const G = G0(), rl = RU(G);
   if (rl && !off('ot') && !G.tutorial && !G.practice) {
    const NP = G.periods || 4;
    if (G.q >= NP + (G.otq || 0) && G.score[0] === G.score[1] && !G.brave) {
     const q0 = G.qlen || QLEN, quarter = NP === 2 ? q0 / 2 : q0;
     if (G.online && !Wn.__rl_no600otnet) { R.log.push(['ot-net', G.q, G.otq || 0]); return eq0.apply(this, arguments); } // 1.5f: online OT = the normal quarter break (net.js sends 'qend', both phones run the same game.js OT step; length below)
     if (G.online) {
      if ((G.otq || 0) >= 2) { R.log.push(['ot-brave', G.q]); return eq0.apply(this, arguments); }
      G.otq = (G.otq || 0) + 1; G.clock = 30;
     } else { G.otq = (G.otq || 0) + 1; G.clock = Math.max(10, Math.round(rl.ot * quarter * 2) / 2); }
     G.q++; G.ot = false; G.gg516 = false; G.ot516k = G.q; G.ot516pend = false; screen = 'qbreak'; G.qT = 0;
     R.log.push(['ot', rl.id, G.otq, G.clock]);
     return;
    }
   }
  } catch (e) { fail('ot', e); }
  return eq0.apply(this, arguments);
 };

 // ---------- 7: fights - no random whistle fights, no man-up ----------
 let stop0 = null;
 function fightRules(G) {
  try {
   if (typeof FIGHT === 'undefined') return;
   if (stop0 == null) stop0 = FIGHT.stop;
   const on = !!(RU(G) && !off('fight'));
   FIGHT.stop = on ? 0 : stop0;
   if (on && G.pen && G.pen.f29 && !G.pen.eq599) { R.log.push(['fight-equal', G.pen.side, G.pen.left]); G.pen = null; try { addFx('cue', 0, 0, { s: 'BOTH FIGHTERS SIT - EVEN STRENGTH', col: '#ffb14d', life: 1.6 }); } catch (e) {} }
  } catch (e) { fail('fight', e); }
 }

 // ---------- 8: shot backup + PLL faceoff clock (per frame) ----------
 function backup(G, dt) {
  if (off('backup') || !RU(G) || typeof screen === 'undefined' || screen !== 'live' || G.online && false) return;
  if (G.play || G.play27 || (G.pm && G.pm.run) || (typeof G.playR !== 'undefined' && G.playR)) { G.bk599 = null; return; }
  const c = G.carrier;
  if (!c || c.team !== 'O' || !G.ball || G.ball.state !== 'held') { G.bk599 = null; return; }
  const gx = typeof GX !== 'undefined' ? GX : 0, cy = typeof CY !== 'undefined' ? CY : 0;
  const near = Math.hypot(gx - c.x, cy - c.y) < 78 && c.x < gx;
  if (!near) { G.bk599 = null; return; }
  let bk = G.bk599 && G.players.includes(G.bk599) ? G.bk599 : null;
  if (!bk) { const mates = G.players.filter(p => p.team === 'O' && p !== c && p.pos !== 'G' && !(p.pl && p.pl.pos === 'G')); mates.sort((a, b) => Math.abs(gx + 16 - a.x) - Math.abs(gx + 16 - b.x)); bk = mates[0] || null; G.bk599 = bk; if (bk) R.log.push(['backup', bk.pl && bk.pl.id]); }
  if (!bk) return;
  const tx = gx + 16, ty = cy + (c.y < cy ? 6 : -6), dx = tx - bk.x, dy = ty - bk.y, d = Math.hypot(dx, dy);
  if (d > 1.5) { const v = Math.min(d, 62 * dt); bk.x += dx / d * v; bk.y += dy / d * v; bk.tx = tx; bk.ty = ty; }
 }
 const st0 = Wn.step;
 if (typeof st0 === 'function') Wn.step = function (dt) {
  const r = st0.apply(this, arguments);
  try {
   const G = G0();
   if (G && !G.over) {
    fightRules(G);
    const rl = RU(G);
    if (rl && G.__fo599 && typeof screen !== 'undefined' && (screen === 'live' || screen === 'cpu')) {
     if (!off('sc') && rl.foClock && screen === 'live' && G.carrier && G.carrier.team === 'O' && G.shotClock > rl.foClock) { G.shotClock = rl.foClock; R.log.push(['fo-clock', rl.id, rl.foClock]); }
     G.__fo599 = 0;
    }
    backup(G, typeof dt === 'number' ? dt : 1 / 60);
   }
  } catch (e) { fail('step', e); }
  return r;
 };

 // ---------- 9: plays run on their own timeline ----------
 const pp0 = Wn.playPlan;
 if (typeof pp0 === 'function') Wn.playPlan = function () {
  const r = pp0.apply(this, arguments);
  try { if (!off('play') && r && r.routes) { for (const route of r.routes) for (const seg of route) if (seg) seg.needBall = 0; R.log.push(['play-free']); } } catch (e) { fail('play', e); }
  return r;
 };
 function v27wrap() {
  try {
   if (!Wn.V27 || V27.__w599 || typeof V27.pgWait !== 'function') return;
   const w0 = V27.pgWait; V27.pgWait = function () { if (!off('play')) return false; return w0.apply(this, arguments); }; V27.__w599 = 1;
  } catch (e) {}
 }
 v27wrap(); setTimeout(v27wrap, 1500);
 // ---- 1.5f: SLOW-WHISTLE WIPE + OFFSETTING FOULS ----
 // Slow whistle (flag down, play goes on): if the fouled team scores before the whistle, a TECHNICAL is wiped out; a
 // personal foul is still served. Offsetting: if the man-up team fouls while the other team is serving, the fouls offset:
 // the running penalty ends (even strength again) and the new foul is the usual turnover. Kill: __rl_no599wipe, __rl_no599offset
 const cue = s2 => { try { addFx('cue', 0, 0, { s: s2, col: '#ffe14d', life: 2 }); } catch (e) {} };
 function wipe(G, scorer) { // scorer 'U' (user goal) or 'C' (CPU goal)
  try {
   const pp = G && G.penPending; if (!pp || off('wipe') || !RU(G)) return;
   const fouler = pp.side === 'U' ? 'U' : 'C'; if (fouler === scorer) return; // only the FOULED team's goal wipes
   if (classify(pp.foul).t !== 'tech') { R.log.push(['wipe-no', pp.foul]); return; }
   R.log.push(['wipe', pp.foul]); G.penPending = null; if (G.ruleCall === pp) G.ruleCall = null; cue('GOAL - ' + String(pp.foul || 'TECHNICAL').toUpperCase() + ' WIPED OUT');
  } catch (e) { fail('wipe', e); }
 }
 { const ep = Wn.endPossession; if (typeof ep === 'function') Wn.endPossession = function (kind) { try { if (kind === 'goal') wipe(G0(), 'U'); } catch (e) {} return ep.apply(this, arguments); }; }
 { const ac = Wn.afterCpu; if (typeof ac === 'function') Wn.afterCpu = function () { try { const G = G0(); if (G && G.cpu && G.cpu.outcome === 'goal') wipe(G, 'C'); } catch (e) {} return ac.apply(this, arguments); }; }
 { const rc = Wn.ruleCall; if (typeof rc === 'function') Wn.ruleCall = function (label, sub, kind) {
  try {
   const G = G0();
   if (G && RU(G) && !off('offset') && G.pen && (kind === 'upen' || kind === 'cpen')) {
    const fouler = kind === 'upen' ? 'U' : 'C';
    if (G.pen.side !== fouler && typeof penaltyOver === 'function') { R.log.push(['offset', label, G.pen.side]); penaltyOver('offset'); cue('OFFSETTING FOULS - EVEN STRENGTH'); }
   }
  } catch (e) { fail('offset', e); }
  return rc.apply(this, arguments);
 }; }
 R.wipe = wipe;
 R.on = () => !off();
 // 1.5 B77: the CREASE COUNT call says the real count (was a fixed '4 SECONDS')
 try { if (typeof Wn.ruleCall === 'function' && !Wn.ruleCall.__c77) { const rc0 = Wn.ruleCall; const rc1 = function (lab, sub) { try { if (lab === 'CREASE COUNT' && typeof sub === 'string' && typeof CREASE_CT !== 'undefined') { const a = Array.prototype.slice.call(arguments); a[1] = sub.replace(/^\d+ SECONDS/, Math.round(CREASE_CT) + ' SECONDS'); return rc0.apply(this, a); } } catch (e) {} return rc0.apply(this, arguments); }; rc1.__c77 = 1; Wn.ruleCall = rc1; } } catch (e) {}
})();
