// V40.4.8 - hard-mode CPU brains for GROSS, NASTY and BAGGATWAAN (v448ai.js)
// Charlie (Nov 8): "gross - bagga hard modes defense needs to be a lil harder ... he probably shouldn't catch it that
//  often unless he's really good or far enough away from defender sticks ... make the o more likely to score but not
//  dumb shots ... plays picks and cuts and get good shots" + "they need to slide and have a 2 ready on d"
//  + (BAGGATWAAN only) "the coach should be really smart locking off your best guys even before the game starts ...
//  running black on your pole" - "in Bagga it should happen ANYTIME a pole has the ball" - "If the pole beats his man
//  someone needs to slide still".
// Tiers: GROSS (3) < NASTY (4) < BAGGATWAAN (5); every number below steps up per tier. SQUID/FISH/BEGINNER untouched
// (no code path here runs, no extra random numbers are drawn there).
// CPU D (you on offense):
//  1) contested catches: a receiver with a CPU stick on him (or a stick in the passing lane near him) catches less;
//     a wide-open receiver (no D within the open radius) is untouched, great sticks still catch most.
//  2) slide + the 2: when you beat your man (SHOOK HIM / he's behind you going to the cage) the nearest help slides
//     right away and a second defender rotates to the slider's man. Also during BLACK (the pole beat his man).
// CPU O (you on defense):
//  3) smarter, not luckier: more ball movement / cuts / picks (team IQ bumped per tier); bad shots (long, contested,
//     bad angle) get passed up for a swing to the open man while the shot clock allows; good looks finish a bit better.
// BAGGATWAAN coach only:
//  4) scouting lock-off: at the first possession the coach face-guards your 2 best scorers ("COACH: LOCKING OFF #X").
//  5) BLACK every time one of your poles has the ball on their end (the game's existing BLACK set).
//  6) their O hunts matchups: swings the ball away from your pole and attacks your weakest short stick.
// Not in online games, tutorial, practice or brave. Kill switch: window.__rl_no448ai = true -> exactly like before.
(function() {
 'use strict';
 const ST = { catchAdj: 0, catchCov: 0, laneHit: 0, tewaCap: 0, slides: 0, slidesBlack: 0, slideFr: 0, rots: 0, badSkip: 0, badSkipPass: 0, goodShot: 0, finBoost: 0, avoidPole: 0, weakHunt: 0, lockCalls: 0, lock2Fr: 0, blackCalls: 0, blackFr: 0, errs: [] };
 const V = window.V448 = { on: false, ST: ST, locks: [] };
 const OFF = () => !!(window.__rl_no448ai || window.__rl_v124gb);
 if (OFF()) return;
 const need = [ 'updateLive', 'catchOdds', 'off110Decide', 'off110Tick', 'dShoot', 'dPassTo', 'H2on', 'readyTick', 'slideBest', 'rotatePick' ];
 for (const n of need) if (typeof window[n] !== 'function') return;
 V.on = true;
 const err = (e, w) => { try { if (ST.errs.length < 8) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v448ai', w, e); } } catch (x) {} };
 const cl = (v, a, b) => v < a ? a : v > b ? b : v;
 const lerp = (a, b, t) => a + (b - a) * t;
 const hyp = Math.hypot;
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 // per tier: [GROSS, NASTY, BAGGATWAAN]
 const K = V.K = {
  r1: [ 18, 19.5, 21 ],          // "has a stick on him" radius (game: 16) - farther than this = open, untouched
  r0: [ 7, 7.5, 8 ],           // fully covered inside this (game: 6)
  contLo: [ .45, .38, .28 ],   // covered catch % for a poor stick (game: .60)
  contHi: [ .82, .77, .66 ],   // covered catch % for an elite stick (game: .90)
  laneR: [ 5, 6, 7 ],          // a CPU stick this close to the last part of the passing lane = contested
  laneCov: [ .55, .65, .75 ],
  slideDelay: [ .25, .16, .08 ], // seconds after you beat him before help commits
  beatGap: [ 5, 4, 3 ],        // carrier this much closer to the cage than his defender = beaten
  slideR: [ 85, 95, 105 ],     // only inside this distance of the cage
  slideSpd: [ 26, 28, 30 ],    // slider speed (game: 20.5; a carrier runs ~22, a chase is 30)
  iqB: [ .3, .45, .6 ],       // team-IQ bump for their offense (0 = the game's own, 1 = smartest)
  pickK: [ 1.05, 1.1, 1.15 ],  // pick / dodge success on top of the game's
  fin: [ .12, .17, .22 ],      // goalie reach cut on GOOD looks only (close, open, good angle)
  finReact: [ .02, .03, .04 ], // + goalie reaction time on GOOD looks only
  finP: [ .2, .24, .32 ],
  takeGood: [ .3, .35, .4 ],   // per decision: let a wide-open good look go      // chance a GOOD look beats the goalie clean (placed shot)
  badD: [ 58, 55, 52 ],        // past this = a long shot
  badNd: [ 4.5, 5, 5.5 ],      // a D stick this close = contested
  badAng: [ 64, 62, 60 ],      // degrees off the cage's face = bad angle
  badKeep: [ .75, .82, .9 ]    // chance a bad look gets passed up (shot clock permitting)
 };
 function tier() {
  try { const l = DF && DF.level; return l === 3 ? 0 : l === 4 ? 1 : l === 5 ? 2 : -1; } catch (e) { return -1; }
 }
 function okG(G) {
  return !!G && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !G.practice && !G.brave && !(window.RLNET && RLNET.inGame) && !OFF();
 }
 const isPole = p => !!(p && p.pl && (p.pl.pos === 'D' || p.pl.pos === 'LSM'));
 const ndTo = (p, team) => { let n = 99, w = null; for (const d of game.players) if (d.team === team && d !== p && !d.gk && !(d.down > 0)) { const k = hyp(d.x - p.x, d.y - p.y); if (k < n) { n = k; w = d; } } return { n: n, d: w }; };
 // ================= 1) contested catches (CPU D, you on offense) =================
 const CO0 = window.catchOdds;
 window.catchOdds = function(p, defTeam) {
  const o = CO0.apply(this, arguments);
  try {
   const k = tier(), G = G0();
   if (k < 0 || defTeam !== 'D' || !okG(G) || SCR() !== 'live' || !o || !p || p.team !== 'O') return o;
   const nd = o.nd != null ? o.nd : ndTo(p, 'D').n;
   let cov = cl((K.r1[k] - nd) / (K.r1[k] - K.r0[k]), 0, 1);
   // a CPU stick in the passing lane close to the receiver
   const b = G.ball, f = b && b.from;
   if (f && f !== p) {
    const fx = f.x, fy = f.y, L = hyp(p.x - fx, p.y - fy) || 1;
    for (const d of G.players) {
     if (d.team !== 'D' || d.gk || d.down > 0 || d.stun > 0) continue;
     const t = ((d.x - fx) * (p.x - fx) + (d.y - 6 - fy) * (p.y - fy)) / (L * L);
     if (t < .6 || t > 1.02) continue;
     const qx = fx + (p.x - fx) * t, qy = fy + (p.y - fy) * t;
     if (hyp(d.x - qx, d.y - 6 - qy) < K.laneR[k]) { if (cov < K.laneCov[k]) { cov = K.laneCov[k]; ST.laneHit++; } break; }
    }
   }
   cov = Math.max(cov, o.cov || 0);
   if (!(cov > 0)) return o;
   const s = o.s != null ? o.s : .5;
   const CA = typeof CATCH !== 'undefined' ? CATCH : { openLo: .91, openHi: .98 };
   const open = CA.openLo + (CA.openHi - CA.openLo) * s, cont = K.contLo[k] + (K.contHi[k] - K.contLo[k]) * s;
   const p2 = open + (cont - open) * cov;
   ST.catchCov++;
   if (p2 < o.p) { ST.catchAdj++; return Object.assign({}, o, { p: p2, cov: cov, p0: o.p }); }
   return o;
  } catch (e) { err(e, 'catch'); return o; }
 };
 // BAGGATWAAN's "CHECKED!" roll never makes a covered catch easier than the odds above
 if (typeof window.tewaCheck1401 === 'function') {
  const TW0 = window.tewaCheck1401;
  window.tewaCheck1401 = function(p, o) {
   const r = TW0.apply(this, arguments);
   try { if (r && o && o.p0 != null && tier() >= 0 && okG(G0()) && r.p > o.p) { r.p = o.p; ST.tewaCap++; } } catch (e) { err(e, 'tewa'); }
   return r;
  };
 }
 // ================= 2) slide + the 2, 4) lock-offs, 5) BLACK on the pole (CPU D) =================
 let inLive = false, did = false, black448 = false;
 const S4 = new WeakMap();
 function gs(G) { let s = S4.get(G); if (!s) { s = { beatAt: -9, beatC: null, scout: false, lock2: null, blackPid: null, bl: false }; S4.set(G, s); } return s; }
 const v410 = () => { try { return window.V410D && V410D.on && V410D.st ? V410D.st() : null; } catch (e) { return null; } };
 function numOf(pl) { try { return pl.num != null ? pl.num : pl.number != null ? pl.number : jerseyNo(pl); } catch (e) { return '?'; } }
 function offScore(pl) { let v = 0; try { v = typeof ovrOf === 'function' ? ovrOf(pl) : pl.ovr || 0; } catch (e) {} return (+v || 0) + .15 * (pl.r ? (pl.r.fin || 0) + (pl.r.acc || 0) - 140 : 0); }
 function scout(G, s4) {
  // BAGGATWAAN: scout your roster before the first possession and lock off the 2 best scorers
  s4.scout = true;
  const s = v410();
  if (!s || window.__rl_no410dl) return;
  const cand = G.players.filter(p => p.team === 'O' && p.pl && !p.gk && (p.pl.pos === 'A' || p.pl.pos === 'M'));
  const seen = new Set, top = [];
  for (const p of cand.sort((a, b) => offScore(b.pl) - offScore(a.pl))) if (!seen.has(p.pl.id)) { seen.add(p.pl.id); top.push(p); if (top.length >= 2) break; }
  if (!top.length) return;
  const n1 = numOf(top[0].pl);
  if (!s.lock) { s.lock = { id: top[0].pl.id, num: n1, d: null, scout448: true }; s.locks = (s.locks || 0) + 1; s.lockMiss = 0; }
  if (top[1]) s4.lock2 = { id: top[1].pl.id, num: numOf(top[1].pl), d: null };
  V.locks = top.map(p => p.pl.id);
  const txt = 'COACH: LOCKING OFF ' + n1 + (s4.lock2 ? ' + ' + s4.lock2.num : '') + '!';
  s.q.push({ txt: txt, sub: 'SCOUTED YOUR BEST - THEY GET FACE-GUARDED', kind: 'lock' });
  ST.lockCalls++;
 }
 function beaten(G, c, k) {
  if (G.beatT > 0) return true;
  let m = null;
  for (const d of G.players) if (d.team === 'D' && !d.gk && d.mark === c && !(d.down > 0)) { m = d; break; }
  if (!m) return false;
  return hyp(m.x - GX, m.y - CY) > hyp(c.x - GX, c.y - CY) + K.beatGap[k] + 3 && hyp(m.x - c.x, m.y - c.y) > 7;
 }
 const why = w => { const W = ST.why || (ST.why = {}); W[w] = (W[w] || 0) + 1; };
 function slideTick(G, s4, k) {
  const c = G.carrier, b = G.ball;
  if (!c || c.team !== 'O' || !b || b.state !== 'held' || G.clearing || G.cpuClear || G.dclear || c.gk) { s4.beatAt = -9; s4.beatC = null; return; }
  if (G.cpuDef === 'zone' || G.zoneD) { zoneSlide(G, s4, k, c); return; }
  const dl = G.players.filter(d => d.team === 'D' && !d.gk), ol = G.players.filter(d => d.team === 'O' && !d.gk);
  if (dl.length !== ol.length || G.pen) { why('uneven'); return; }
  if (hyp(c.x - GX, c.y - CY) > K.slideR[k] || c.x < MIDX) { s4.beatAt = -9; return; }
  if (!beaten(G, c, k)) { if (G.t - s4.beatAt > 1.2) s4.beatAt = -9; return; }
  if (s4.beatC !== c || s4.beatAt < 0) { s4.beatC = c; s4.beatAt = G.t; }
  if (G.slide && G.players.includes(G.slide)) { why('hasSlide'); return; }
  if (G.t - s4.beatAt < K.slideDelay[k]) return;
  const adj = G.adj instanceof Set ? G.adj : new Set;
  let best = null;
  try { best = slideBest(dl, c, adj, null); } catch (e) { best = null; }
  if (!best || best.mark === c) {
   best = null;
   let bd = 1e9; for (const d of dl) if (d.mark !== c && !(d.down > 0) && !(d.stun > 0)) { const dd = hyp(d.x - c.x, d.y - c.y); if (dd < bd) { bd = dd; best = d; } }
  }
  if (!best) { why('noBest'); return; }
  why('slide');
  G.slide = best;
  best.react = Math.min(best.react || 0, .05);
  G.cpuSlides = (G.cpuSlides || 0) + 1;
  ST.slides++; if (G.cpuDef === 'black') ST.slidesBlack++;
  try { if (typeof fireCall === 'function') fireCall(G.goalie); } catch (e) {}
  const left = typeof markOf === 'function' ? markOf(best) : best.mark;
  let rb = null;
  try { rb = left ? rotatePick(dl, best, left, c, adj, null) : null; } catch (e) { rb = null; }
  if (!rb && left) { let bd = 1e9; for (const d of dl) if (d !== best && d.mark !== c && !(d.down > 0)) { const dd = hyp(d.x - left.x, d.y - left.y); if (dd < bd) { bd = dd; rb = d; } } }
  G.rot = rb && left ? { d: rb, m: left } : null;
  if (G.rot) ST.rots++;
  G.calmT = 0;
 }

 // in a ZONE the help man next to the beaten one steps up to the ball, the zone shifts behind him (the 2)
 function zoneSlide(G, s4, k, c) {
  const z = s4.zs;
  if (z && (z.c !== c || G.t - z.t0 > 1.6 || !G.players.includes(z.d) || z.d.down > 0)) s4.zs = null;
  if (s4.zs) return;
  const dl = G.players.filter(d => d.team === 'D' && !d.gk && !(d.down > 0) && !(d.stun > 0));
  if (dl.length < 3 || hyp(c.x - GX, c.y - CY) > K.slideR[k] || c.x < MIDX) { s4.zBeat = -9; return; }
  const dc = d => hyp(d.x - c.x, d.y - c.y), dg = hyp(c.x - GX, c.y - CY);
  const near = dl.slice().sort((p, q) => dc(p) - dc(q));
  const on = near[0];
  const beat = G.beatT > 0 || on && hyp(on.x - GX, on.y - CY) > dg + K.beatGap[k] + 3 && dc(on) > 7;
  if (!beat) { s4.zBeat = -9; why('zoneOk'); return; }
  if (s4.zBeat < 0 || s4.zC !== c) { s4.zBeat = G.t; s4.zC = c; }
  if (G.t - s4.zBeat < K.slideDelay[k]) return;
  // the closest defender who is still goal-side of the ball
  const help = near.find(d => d !== on && hyp(d.x - GX, d.y - CY) < dg + 2) || near[1];
  if (!help) return;
  s4.zs = { d: help, c: c, t0: G.t };
  G.cpuSlides = (G.cpuSlides || 0) + 1;
  ST.slides++; ST.zoneSlides = (ST.zoneSlides || 0) + 1; why('zoneSlide');
  try { if (typeof fireCall === 'function') fireCall(G.goalie); } catch (e) {}
 }
 function deny(p, m, b, spd) {
  const L = hyp(b.x - m.x, b.y - m.y) || 1, t = 4;
  p.tx = m.x + (b.x - m.x) / L * t + 1; p.ty = m.y + (b.y - m.y) / L * t;
  p.spd = Math.max(p.spd || 0, spd);
 }
 function postMove(G, k) {
  // runs right before the players move (after the game's, v410d's and v413m's targets)
  const c = G.carrier, b = G.ball;
  if (!c || !b || c.team !== 'O') return;
  // the slider attacks the ball even in BLACK (the pole beat his man), the 2 takes the slider's man
  if (G.slide && G.players.includes(G.slide) && !(G.slide.down > 0) && !(G.slide.stun > 0) && b.state === 'held' && G.cpuDef !== 'zone' && !G.zoneD) {
   const p = G.slide;
   if (G.cpuDef === 'black') {
    const dx = GX - c.x, dy = CY - c.y, L = hyp(dx, dy) || 1;
    p.tx = c.x + dx / L * 4 + 2; p.ty = c.y + dy / L * 4 + (p.y < c.y ? -3 : 3);
    if (G.rot && G.rot.d && G.players.includes(G.rot.m) && !(G.rot.d.down > 0)) deny(G.rot.d, G.rot.m, b, PACE.dBall * 1.1);
   }
   // the slide gets there: a hard-mode slider sprints at the ball, the 2 hustles to the open man
   if (hyp(p.x - c.x, p.y - c.y) > 6) { p.spd = Math.max(p.spd || 0, K.slideSpd[k]); if (p.react > .05) p.react = .05; ST.slideFr++; }
   if (G.rot && G.rot.d && !(G.rot.d.down > 0) && G.players.includes(G.rot.m)) G.rot.d.spd = Math.max(G.rot.d.spd || 0, PACE.dBall * 1.1);
  }
  const s4 = gs(G);
  if (s4.zs && b.state === 'held' && s4.zs.c === c && (G.cpuDef === 'zone' || G.zoneD)) {
   const p = s4.zs.d, dx = GX - c.x, dy = CY - c.y, L = hyp(dx, dy) || 1;
   if (G.players.includes(p) && !(p.down > 0)) { p.tx = c.x + dx / L * 4 + 2; p.ty = c.y + dy / L * 4; p.spd = Math.max(p.spd || 0, K.slideSpd[k]); p.react = 0; ST.slideFr++; }
  }
  // BAGGATWAAN: the 2nd scouted guy gets face-guarded too
  if (k === 2 && s4.lock2 && G.cpuDef !== 'zone' && !G.zoneD) {
   const hot = G.players.find(p => p.team === 'O' && p.pl && p.pl.id === s4.lock2.id);
   const dl = G.players.filter(d => d.team === 'D' && !d.gk), ol = G.players.filter(d => d.team === 'O' && !d.gk);
   if (hot && hot !== c && dl.length === ol.length && !G.clearing) {
    const s = v410(), lockD = s && s.lock && s.lock.d;
    let d = s4.lock2.d && dl.includes(s4.lock2.d) && !(s4.lock2.d.down > 0) ? s4.lock2.d : dl.find(q => q.mark === hot && !(q.down > 0));
    if (d && d !== lockD && d !== G.slide && !(G.rot && G.rot.d === d) && !(d.stun > 0) && !(d.coverT > 0)) {
     s4.lock2.d = d;
     deny(d, hot, b, b.state === 'pass' && b.to === hot ? PACE.dBall * 1.2 : PACE.dBall);
     ST.lock2Fr++;
    }
   }
  }
 }
 const H0 = window.H2on;
 window.H2on = function() {
  const r = H0.apply(this, arguments);
  if (inLive && !did) { did = true; try { const G = G0(), k = tier(); if (k >= 0 && okG(G)) postMove(G, k); } catch (e) { err(e, 'post'); } }
  return r;
 };
 // BLACK goes on before the game's updateLive reads G.cpuDef (v410d resets it to its own D at the top of each frame)
 const RT0 = window.readyTick;
 window.readyTick = function() {
  if (inLive && black448) { try { const G = G0(); if (G && G.cpuDef !== 'black') G.cpuDef = 'black'; } catch (e) {} }
  return RT0.apply(this, arguments);
 };
 function blackPre(G, s4) {
  // BAGGATWAAN: every time your pole has it on their end, they go BLACK (the existing D set)
  const c = G.carrier, b = G.ball, s = v410();
  let want = false;
  if (s && !window.__rl_no410db && c && c.team === 'O' && isPole(c) && b && b.state === 'held' && c.x >= MIDX - 6 && !G.pen && !G.penPending && !G.fb222) {
   const dl = G.players.filter(d => d.team === 'D' && !d.gk), ol = G.players.filter(d => d.team === 'O' && !d.gk);
   want = dl.length === ol.length;
  }
  if (want) {
   if (s4.blackPid !== c.pl.id) {
    s4.blackPid = c.pl.id;
    let v414 = false; try { v414 = !!(window.V414B && V414B.state && V414B.state() && V414B.state().on); } catch (e) {}
    if (!v414 && !(s.call && /BLACK/.test(s.call.txt || '')) && !s.q.some(q => /BLACK/.test(q.txt || ''))) s.q.push({ txt: 'COACH: BLACK!', sub: 'POLE HAS IT - LOCK EVERYONE OFF', kind: 'sit:black448' });
    ST.blackCalls++;
    if (!s4.bl) { G.slide = null; G.rot = null; G.hotP = null; }
   }
   s4.bl = true; ST.blackFr++;
  } else if (s4.bl) {
   s4.bl = false; s4.blackPid = null;
   if (s) { s.q = s.q.filter(q => q.kind !== 'sit:black448'); if (s.call && s.call.kind === 'sit:black448') s.call = null; }
  }
  return want;
 }
 const L0 = window.updateLive;
 window.updateLive = function(dt) {
  const G = G0(), k = tier();
  if (k < 0 || !okG(G) || SCR() !== 'live') return L0.apply(this, arguments);
  const s4 = gs(G);
  black448 = false;
  try {
   if (k === 2) {
    if (!s4.scout && G.players && G.carrier && G.carrier.team === 'O') scout(G, s4);
    black448 = blackPre(G, s4);
   }
  } catch (e) { err(e, 'pre'); }
  inLive = true; did = false;
  let r;
  try { r = L0.apply(this, arguments); }
  finally { inLive = false; if (black448) { try { if (G.cpuDef !== 'black') G.cpuDef = 'black'; } catch (e) {} } black448 = false; }
  try { if (game === G && SCR() === 'live') slideTick(G, s4, k); } catch (e) { err(e, 'slide'); }
  return r;
 };
 // ================= 3) smarter CPU offense, 6) matchup hunting (you on defense) =================
 const pairs = () => { const O = window.V36AI && V36AI.OFF; return O || null; };
 function withIQ(k, fn) {
  const O = pairs();
  if (!O) return fn();
  const b = K.iqB[k], saved = {};
  for (const key in O) {
   const v = O[key];
   if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number') { saved[key] = v; O[key] = [ lerp(v[0], v[1], b), v[1] ]; }
  }
  const w0 = O.w0; if (Array.isArray(w0) && Array.isArray(O.w1)) { saved.w0 = w0; O.w0 = w0.map((x, i) => lerp(x, O.w1[i], b)); }
  const cb = DF.cpuBeat; DF.cpuBeat = (cb || 1) * K.pickK[k];
  try { return fn(); } finally { Object.assign(O, saved); DF.cpuBeat = cb; }
 }
 const dOn = G => okG(G) && SCR() === 'defense';
 const OT0 = window.off110Tick;
 window.off110Tick = function() {
  const G = G0(), k = tier();
  if (k < 0 || !dOn(G)) return OT0.apply(this, arguments);
  const self = this, a = arguments;
  return withIQ(k, () => OT0.apply(self, a));
 };
 let inDec = 0, decK = -1, decArgs = null;
 function lookOf(G, c) {
  let nd = 99; for (const d of dDef()) if (!(d.down > 0) && !d.gk) nd = Math.min(nd, hyp(d.x - c.x, d.y - c.y));
  const dist = hyp(c.x - DGX, c.y - CY), ang = Math.abs(Math.atan2(c.y - CY, c.x - DGX)) * 180 / Math.PI;
  return { nd: nd, dist: dist, ang: c.x <= DGX + 2 ? 99 : ang };
 }
 function badLook(L, k, G) {
  if (G.dBeat > 0 && L.dist < 48 && L.ang < 70) return false; // he beat his man - that's a real look
  return L.dist > K.badD[k] || L.nd < K.badNd[k] && L.dist > 24 || L.ang > K.badAng[k];
 }
 const goodLook = L => L.dist <= 45 && L.nd >= 7 && L.ang <= 55;
 function openMate(G, c, atk, def, minMd, better) {
  let best = null;
  for (const a of atk) {
   if (a === c || a.down > 0 || a.gk || a.x < DGX + 4) continue;
   const o = open110(G, a, def, c), L = hyp(a.x - c.x, a.y - c.y);
   if (!o.lane || o.md < minMd || L < 12 || L > 140) continue;
   const dA = hyp(a.x - DGX, a.y - CY), aA = Math.abs(Math.atan2(a.y - CY, a.x - DGX)) * 180 / Math.PI;
   if (better && (dA > 50 || aA > 58)) continue;
   const s = Math.min(o.md, 25) - dA * .08;
   if (!best || s > best.s) best = { a: a, s: s, o: o };
  }
  return best;
 }
 const DS0 = window.dShoot;
 window.dShoot = function(c) {
  const G = G0(), k = tier();
  if (k < 0 || !dOn(G) || !c || G.ball && G.ball.state !== 'held') return DS0.apply(this, arguments);
  let L = null;
  try {
   L = lookOf(G, c);
   if (inDec > 0 && decArgs && G.shotClock > 5 && badLook(L, k, G) && Math.random() < K.badKeep[k]) {
    // pass up the dumb shot when a teammate has a better look: swing it to the open man
    const atk = decArgs[2], def = decArgs[3];
    const m = openMate(G, c, atk, def, 9, true);
    if (m) { ST.badSkip++; ST.badSkipPass++; dPassTo(c, m.a); G.dHeld = 0; try { st2403x(G, 'pass'); } catch (e) {} return; }
    // nobody better: a really bad one (way out / smothered) gets reset, the rest still go up
    if (G.shotClock > 8 && (L.dist > K.badD[k] + 12 || L.nd < 3.5 && L.dist > 30)) {
     ST.badSkip++; ST.badReset = (ST.badReset || 0) + 1;
     c.tgt = [ clamp(DGX + 34 + Math.random() * 14, DGX + 26, MIDX - 10), clamp(CY + (c.y - CY) * .45, FT + 16, FB - 8) ];
     G.dDecide = .3;
     return;
    }
   }
  } catch (e) { err(e, 'bad'); }
  const r = DS0.apply(this, arguments);
  try {
   if (L && goodLook(L) && G.ball && G.ball.state === 'shot' && G.gk2) {
    ST.goodShot++;
    const gk = G.gk2;
    if (!(gk.reach >= 9)) { // a goalie who read the shooter (forced save) keeps it
     gk.reach *= 1 - K.fin[k]; gk.react = (gk.react || 0) + K.finReact[k];
     if (Math.random() < K.finP[k] && typeof shotForce18 === 'function') { const b = G.ball; shotForce18('goal', b, gk, DGX, gk.y > CY, Math.hypot(b.vx, b.vy)); ST.finClean = (ST.finClean || 0) + 1; } // a great look, placed away from the goalie
     ST.finBoost++;
    }
   }
  } catch (e) { err(e, 'fin'); }
  return r;
 };
 const OD0 = window.off110Decide;
 window.off110Decide = function(G, c, atk, def, dGoal, pres, onb, ond) {
  const k = tier();
  if (k < 0 || !dOn(G) || !c || !atk || !def) return OD0.apply(this, arguments);
  const self = this, a = arguments;
  // BAGGATWAAN: hunt matchups - get the ball away from your pole, attack your weakest short stick
  try {
   if (k === 2 && !window.__rl_t448nohunt && onb && G.ball && G.ball.state === 'held' && G.shotClock > 6 && !(G.dBeat > 0) && pres <= 1) {
    const inside = dGoal < OFF110.inD && c.x > DGX + 4;
    const O110 = G.o110;
    if (O110 && !O110.hunt448 && isPole(onb) && !inside && (G.dHeld || 0) > .8 && Math.random() < .5) {
     O110.hunt448 = true;
     let best = null;
     for (const m of atk) {
      if (m === c || m.down > 0 || m.gk || m.x < DGX + 4) continue;
      const md = def.filter(d => !(d.down > 0) && !d.gk).sort((p, q) => hyp(p.x - m.x, p.y - m.y) - hyp(q.x - m.x, q.y - m.y))[0];
      if (!md || isPole(md) || pr(md, 'def') > 0) continue;
      if (hyp(m.x - DGX, m.y - CY) > hyp(c.x - DGX, c.y - CY) + 20) continue;
      const o = open110(G, m, def, c);
      if (!o.lane || o.md < 10) continue;
      const s = -pr(md, 'def') * 6 + Math.min(o.md, 20) - hyp(m.x - DGX, m.y - CY) * .05;
      if (!best || s > best.s) best = { m: m, s: s };
     }
     if (best) { ST.avoidPole++; dPassTo(c, best.m); G.dHeld = 0; try { st2403x(G, 'pass'); } catch (e) {} return true; }
    }
   }
  } catch (e) { err(e, 'hunt'); }
  // a good look (close, open, good angle) gets let go - smart O takes the shot it worked for
  try {
   if (G.ball && G.ball.state === 'held' && G.dcar === c && (G.dHeld || 0) > .2) {
    const L = lookOf(G, c);
    if (goodLook(L) && L.nd >= 9 && Math.random() < K.takeGood[k]) { ST.takeGood = (ST.takeGood || 0) + 1; dShoot(c); return true; }
   }
  } catch (e) { err(e, 'take'); }
  const weak = k === 2 && !window.__rl_t448nohunt && onb && !isPole(onb) && pr(onb, 'def') < -.25;
  if (weak) ST.weakHunt++;
  inDec++; decK = k; decArgs = a;
  const cb = DF.cpuBeat;
  if (weak) DF.cpuBeat = (cb || 1) * 1.12;
  try { return withIQ(k, () => OD0.apply(self, a)); }
  finally { inDec--; decArgs = inDec > 0 ? decArgs : null; DF.cpuBeat = cb; }
 };
 V.tier = tier;
})();
