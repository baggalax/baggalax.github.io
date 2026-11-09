// v428as.js - V42.8: AUTO SPECIALIST SUBS + FOLLOW THE SUB + CANCEL FOLLOW (offline / vs-CPU only).
// 1) After your team has the ball SAFELY (the clear is over the midline, or the faceoff win is out of the scrum and
//    settled), every specialist still on the field - LSM, FOGO, defensive middie (SSDM slots) - jogs off through the
//    sub box and the most rested offensive middie on the bench runs on (the live S421 box sub: man short till he is
//    on, ST422 stamina hook, never 11 on, the guy in the box does not count for offside). One at a time, a short gap
//    between them. Never on defense, never on a loose ball, never the ball carrier / a pass target / a guy who is down
//    or has no stick, and never if no offensive middie is left on the bench. CPU teams always do it; your team does it
//    only when you have nothing set: a set clear whose SUB steps involve that player (subbed off OR on) leaves him
//    alone, and the auto subs wait until the play's own subs have all fired. Each specialist goes off once per
//    possession at most, and a guy you sub back on yourself (SUB screen) stays on for that possession.
//    If the ball is turned over before he gets to the box, he stays on and plays D.
// 2) FOLLOW THE SUB: a mismatched defender (an offensive middie / attackman playing D, or a FOGO on D) whose man jogs
//    off through the box follows him off, and his team's best defensive middie comes on from the box. Both teams.
// 3) CANCEL FOLLOW: while one of YOUR guys is following a sub, a small CANCEL FOLLOW button shows top-centre under
//    the score bar. Tap it: he drops back into the play, his replacement stays on the bench.
// Kill switch: window.__rl_no428as = true (exactly the old behaviour). Online / tutorial / BRAVEHEART: off.
// V42.8b (near the bottom): a guy going off leaves your called play and can never get stuck / vibrate. Kill switch __rl_no428vb.
// No storage keys, no net protocol, no lineup changes beyond what the S421 box sub already does.
(function () {
 'use strict';
 const W0 = window;
 const S4 = W0.S421;
 if (!S4 || typeof S4.subBox !== 'function' || typeof S4.S !== 'function' || typeof W0.step !== 'function') { W0.V428AS = { on: () => false, why: 'no S421' }; return; }
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const killed = () => !!W0.__rl_no428as || !!W0.__rl_no421s || !!W0.__rl_v124gb || !(S4.on && S4.on());
 const offG = G => killed() || !G || !!G.tutorial || !!G.online || !!G.brave || !!G.over || G.farMode === 'fo';
 const liveScr = () => { const s = scr(); return s === 'live' || s === 'defense'; };
 const LOG = { ev: [], err: 0, stats: { auto: 0, autoCpu: 0, follow: 0, followCpu: 0, swapCpu: 0, cancel: 0, cancelTap: 0, stayOn: 0, skipNoBench: 0, skipSet: 0, skipManual: 0 } };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 400) LOG.ev.shift(); };
 const er = e => { LOG.err++; try { console.error(e); } catch (x) {} };
 const PPx = id => { try { return PP(id); } catch (e) { return null; } };
 const posOf = id => { const p = PPx(id); return p ? p.pos : null; };
 const ln = id => { try { return lastName(PPx(id)); } catch (e) { return String(id); } };
 const src0 = G => G.mode === 'season' ? 'season' : 'real';
 const num = (id, side) => { try { const G = G_(); const n = jerseyNo(PPx(id), src0(G), side ? G.opp : G.user); return n === '' || n == null ? '' : String(n); } catch (e) { return ''; } };
 const tag = (id, side) => { const n = num(id, side); return (n ? n + ' ' : '') + ln(id); };
 const VRUN = () => (typeof PACE !== 'undefined' ? PACE.run : 22) * 1.3;
 const UBOX = () => [ MIDX - 8, FB - 2 ], CBOX = () => [ MIDX + 8, FB - 2 ];
 const stam = (id, side) => { try { return W0.ST422 && ST422.on && ST422.on() ? +ST422.get(id, side) : 100; } catch (e) { return 100; } };
 const stv = (id, side) => { try { return W0.ST422 && typeof ST422.speedMul === 'function' ? Math.max(.85, Math.min(1, +ST422.speedMul(id, side) || 1)) : 1; } catch (e) { return 1; } };
 const stSub = (a, b, side) => { try { if (W0.ST422 && typeof ST422.onSub === 'function') ST422.onSub(a, b, side); } catch (e) {} };
 function A(G) {
  if (!G.a428) G.a428 = { poss: {}, cpuJobs: [], seq: 0, followed: {}, uLast: -9, cLast: -9, wasClr: false, wasCClr: false, fx: [] };
  return G.a428;
 }
 // ---------- who is who ----------
 const lu = (G, side) => G.lu && G.lu[side] || {};
 function kindOf(G, side, id) {
  // the specialists Charlie named: LSM, FOGO, defensive middie. A guy who is also in the offensive unit is an O-mid.
  const L = lu(G, side), pos = posOf(id);
  if (!id || pos === 'G') return null;
  if ((L.M || []).includes(id) || (L.A || []).includes(id)) return null;
  if (id === L.FO || pos === 'FO') return 'FOGO';
  if (id === L.LSM || pos === 'LSM') return 'LSM';
  if (id === L.SSDM || id === L.SSDM2) return 'DMID';
  return null;
 }
 function mismatched(G, side, id) {
  // on D he does not belong there: an offensive middie / attackman, or a FOGO
  const L = lu(G, side), pos = posOf(id);
  if (!id || pos === 'G') return null;
  if (id === L.FO || pos === 'FO') return 'FOGO';
  if (id === L.SSDM || id === L.SSDM2 || id === L.LSM || pos === 'LSM' || pos === 'D' || (L.D || []).includes(id)) return null;
  if ((L.M || []).includes(id)) return 'OMID';
  if ((L.A || []).includes(id) || pos === 'A') return 'ATT';
  if (pos === 'M') return 'OMID';
  return null;
 }
 const isU = p => p && (p.team === 'O' || p.team === 'G2');
 function uNear(G) { return (G.players || []).filter(p => p.team === 'O' && p.pl && !p.gk && !p.far); }
 function cNear(G) { return (G.players || []).filter(p => p.team === 'D' && p.pl && !p.gk && !p.far); }
 function cEnts(G) { const out = (G.players || []).filter(p => p.team === 'D' && p.pl && !p.gk); if (G.farC && G.farMode !== 'fo') for (const f of G.farC) if (f.pl && f.role !== 'G' && !out.some(q => q.pl.id === f.pl.id)) out.push(f); return out; }
 function cFind(G, id) { return cEnts(G).find(p => p.pl.id === id) || null; }
 const ballTo = G => { const b = G.ball; return b && b.state === 'pass' ? b.to : null; };
 function uHas(G, e) { return !!e && (G.carrier === e || (G.dclear && G.dclear.holder === e) || ballTo(G) === e); }
 function cHas(G, e) { return !!e && (G.dcar === e || G.carrier === e || ballTo(G) === e); }
 function inPlay(G, e) {
  // ground-ball battle / chase / down / stickless / dodge: wait till he is off it
  if (!e) return true;
  if (e.down > 0 || e.stun > 0 || e.ns17 || e.lunge) return true;
  if (G.gb && (G.gb.p === e || G.gb.who === e)) return true;
  if (G.chase === e || (Array.isArray(G.chasers) && G.chasers.includes(e))) return true;
  const b = G.ball; if (b && (b.state === 'loose' || b.state === 'ground') && Math.hypot(e.x - b.x, e.y - b.y) < 40) return true;
  return false;
 }
 // who has the ball (settled possession only - a loose / shot / faceoff ball is nobody's)
 function poss(G) {
  const b = G.ball; if (!b) return null;
  if (b.state === 'held' || b.state === 'clear') {
   const c = G.carrier || G.dcar || (G.dclear && G.dclear.holder);
   if (c) return isU(c) || c.team === 'U' ? 'U' : c.team === 'D' ? 'C' : null;
   return null;
  }
  if (b.state === 'pass' && b.to) return isU(b.to) ? 'U' : b.to.team === 'D' ? 'C' : null;
  return null;
 }
 const carId = G => { const c = G.carrier || G.dcar || (G.dclear && G.dclear.holder); return c && c.pl ? c.pl.id : null; };
 // ---------- benches ----------
 function uBench(G, offId) { try { return S4.benchIds ? (W0.S421.benchIds() || []) : []; } catch (e) { return []; } }
 function cOut(G) {
  const s = new Set([].concat(G.ejected || [], G.concOut || [], G.gout16 || [], G.ns17 || []));
  if (G.pen && G.pen.who) s.add(G.pen.who.id || G.pen.who);
  for (const q of (Array.isArray(G.pens) ? G.pens : [])) if (q && q.who) s.add(q.who.id || q.who);
  return s;
 }
 function cBench(G) {
  let ros = [];
  try { ros = teamRosterIds(G.opp, src0(G)) || []; } catch (e) {}
  const L = lu(G, 1);
  const extra = [].concat(L.M || [], L.A || [], L.D || [], [ L.LSM, L.SSDM, L.SSDM2, L.FO ]).filter(Boolean);
  for (const id of extra) if (!ros.includes(id)) ros.push(id);
  const ON = new Set(cEnts(G).map(p => p.pl.id)), OUT = cOut(G), busy = new Set;
  for (const j of A(G).cpuJobs) if (j.phase !== 'done') { busy.add(j.outId); busy.add(j.inId); }
  try { const cj = S4.S().cpu && S4.S().cpu.job; if (cj) { busy.add(cj.outId); busy.add(cj.inId); } } catch (e) {}
  return ros.filter(id => PPx(id) && posOf(id) !== 'G' && !ON.has(id) && !OUT.has(id) && !busy.has(id) && !(src0(G) === 'season' && typeof injOf === 'function' && injOf(id)));
 }
 function pickOMid(G, side, bench) {
  // the most rested offensive middie: his unit's middies first, then any short-stick middie who is not a D-middie
  const L = lu(G, side);
  const ok = bench.filter(id => posOf(id) === 'M' && id !== L.SSDM && id !== L.SSDM2 && id !== L.FO);
  const pri = id => (L.M || []).includes(id) ? 0 : 1;
  ok.sort((a, b) => pri(a) - pri(b) || stam(b, side) - stam(a, side));
  return ok[0] || null;
 }
 function pickDef(G, side, bench) {
  // the best defensive guy to come on for a follower: a D-middie, then the LSM, then the best defensive short stick
  const L = lu(G, side);
  const rt = id => { const p = PPx(id); return p && p.r ? +p.r.def || 0 : 0; };
  const pri = id => (id === L.SSDM || id === L.SSDM2) ? 0 : (id === L.LSM || posOf(id) === 'LSM') ? 1 : posOf(id) === 'M' && !(L.M || []).includes(id) ? 2 : posOf(id) === 'M' ? 3 : posOf(id) === 'D' ? 4 : 9;
  const ok = bench.filter(id => pri(id) < 9 && posOf(id) !== 'FO' && id !== L.FO);
  ok.sort((a, b) => pri(a) - pri(b) || (stam(b, side) >= 50) - (stam(a, side) >= 50) || rt(b) - rt(a));
  return ok[0] || null;
 }
 // ---------- possession bookkeeping ----------
 function P(G) {
  // a possession = the game's possession count + which end the ball is at (a live turnover flips the screen, not the count)
  const T = A(G), k = G.possCount + ':' + scr();
  if (!T.poss[k]) { T.poss = { [k]: { t0: G.t, done: {}, manual: {}, clrT: null, cclrT: null, fo: G.foLiveAt != null && G.t - G.foLiveAt < 1.5, n: 0 } }; }
  return T.poss[k];
 }
 // a set clear this possession: its SUB steps (by player, or by position for another team's play) are hands-off
 function extBusy(G) {
  // players another sub system is already moving: a SUB-screen midline crosser waiting / crossing (v425sp), a midline step-off (v421s)
  const s = new Set;
  try { for (const p of (W0.S425 && W0.S425.PEND) || []) if (p && p.st !== 'done') { if (p.off) s.add(p.off); if (p.on) s.add(p.on); if (p.over) s.add(p.over); } } catch (e) {}
  try { for (const j of jobs(G)) if (j.kind === 'mid' && j.phase !== 'done') { if (j.stepId) s.add(j.stepId); if (j.overId) s.add(j.overId); } } catch (e) {}
  return s;
 }
 function unfreezeMine(G) {
  // v421s "the ride loses the guy" freezes a nearby defender for a second; never the one we are running off / on
  try { const T = S4.S(); if (!T || !T.freeze || !T.freeze.length) return; const mine = new Set; for (const j of A(G).cpuJobs) if (j.phase !== 'done') { const e = cFind(G, j.phase === 'on' ? j.inId : j.outId); if (e) mine.add(e); } if (mine.size) T.freeze = T.freeze.filter(f => !mine.has(f.q)); } catch (e) {}
 }
 function setScan(G) {
  // remember every set clear that ran (its run entry is dropped the moment the clear is over, the auto subs come after)
  const T = A(G); let S = null; try { S = S4.S(); } catch (e) {}
  if (!S) return;
  T.sets = T.sets || [];
  for (const k of Object.keys(S.runs || {})) {
   const R = S.runs[k]; if (!R || !R.pl || R.k !== 'CLEAR') continue;
   const st = Array.isArray(R.pl.sub421) ? R.pl.sub421.filter(x => x && x.off && x.on) : [];
   if (!st.length) continue;
   let m = T.sets.find(s => s.R === R);
   if (!m) { m = { R: R, t0: R.t0, poss: G.possCount, ids: new Set, pos: new Set, name: R.pl.name || '' }; T.sets.push(m); lg({ t: +G.t.toFixed(2), ev: 'setClear', name: m.name, n: st.length }); }
   m.last = G.t;
   st.forEach(x => { for (const s of [ x.off, x.on ]) { if (!s) continue; if (x.team === G.user && s.id) m.ids.add(s.id); if (s.pos) m.pos.add(s.pos); } });
   m.pending = st.some((x, i) => !R.fired || !R.fired[i]);
  }
  for (const f of (S.fires || [])) if (f.k === 'CLEAR' && !f.s428) { f.s428 = 1; const m = T.sets.find(s => Math.abs((s.last || 0) - f.t) < 30); if (m) { if (f.off) m.ids.add(f.off); if (f.on) m.ids.add(f.on); } }
  T.sets = T.sets.filter(s => G.t - (s.last || s.t0) < 40 && G.possCount - s.poss <= 1);
 }
 function setInfo(G) {
  // a set clear in THIS possession (it started on the save / turnover, the possession count moves on when it goes live)
  const out = { ids: new Set, pos: new Set, pending: false, any: false };
  const T = A(G);
  for (const s of T.sets || []) {
   if (G.possCount - s.poss > 1) continue;
   out.any = true; if (s.pending && G.t - s.last < 1) out.pending = true;
   s.ids.forEach(x => out.ids.add(x)); s.pos.forEach(x => out.pos.add(x));
  }
  let S = null; try { S = S4.S(); } catch (e) {}
  for (const j of (S && S.jobs) || []) if (j.phase !== 'done' && j.src === 'play') out.pending = true;   // its own subs still running
  return out;
 }
 function touchedBySet(G, id, si) {
  // your own play: that exact player. Another team's play (by position): only the LSM / FOGO spots, never "any middie"
  if (si.ids.has(id)) return true;
  const k = kindOf(G, 0, id);
  if (k === 'LSM' && si.pos.has('LSM')) return true;
  if (k === 'FOGO' && si.pos.has('FO')) return true;
  return false;
 }
 // ---------- your jobs (the S421 box sub) ----------
 const jobs = G => { try { return S4.S().jobs || []; } catch (e) { return []; } };
 const liveJob = j => j && j.kind === 'box' && j.phase !== 'done';
 const preSwap = j => j && j.kind === 'box' && (j.phase === 'wait' || j.phase === 'toBox' || j.phase === 'boxWait');
 function uInFlight(G) { return jobs(G).filter(j => preSwap(j)).length; }
 function release(e) { if (!e) return; e.tx = e.x; e.ty = e.y; e.wander = 0; e.react = 0; if (e.rest && e.home) e.rest = e.home.slice ? e.home.slice() : e.rest; }
 function cancelU(G, j, why) {
  if (!preSwap(j)) return false;
  const T = S4.S();
  j.phase = 'done'; j.why = why; j.tDone = G.t;
  if (T) { if (T.hideBench) delete T.hideBench[j.inId]; if (T.stats) T.stats.done++; }
  const e = S4.findEnt(j.outId); release(e);
  lg({ t: +G.t.toFixed(2), ev: 'cancel', side: 'U', out: j.outId, in: j.inId, why: why, src: j.src, scr: scr() });
  return true;
 }
 // you subbed a guy ON yourself (SUB screen / old picker / stick break): the auto sub leaves him alone this possession
 const SB0 = S4.subBox;
 S4.subBox = function (outId, inId, src, extra) {
  const j = SB0.apply(this, arguments);
  try {
   const G = G_();
   if (j && G && !offG(G) && src !== 'auto428' && src !== 'follow428') {
    const p = P(G);
    if (inId) p.manual[inId] = 1;
    // a manual sub of a guy who was already following / auto-leaving: the manual call wins
    if (kindOf(G, 0, inId)) lg({ t: +G.t.toFixed(2), ev: 'manualOn', side: 'U', in: inId, kind: kindOf(G, 0, inId), src: src || '' });
   }
  } catch (e) { er(e); }
  return j;
 };
 function uAutoTick(G) {
  const T = A(G), p = P(G);
  // the clear made it over: that is the moment (G.clearing true -> false on your ball)
  if (T.wasClr && !G.clearing && scr() === 'live' && p.clrT == null) p.clrT = G.t;
  T.wasClr = !!G.clearing && scr() === 'live';
  // turned over / loose before he got to the box: he stays on and plays D
  const pz = poss(G);
  for (const j of jobs(G)) if (j.src === 'auto428' && preSwap(j) && j.phase !== 'boxWait' && (scr() !== 'live' || pz === 'C')) { if (cancelU(G, j, 'turnover')) LOG.stats.stayOn++; }
  if (scr() !== 'live' || pz !== 'U') return;
  const why0 = k => { const D = LOG.dbg || (LOG.dbg = {}); D[k] = (D[k] || 0) + 1; };
  const settled = (p.clrT != null && G.t - p.clrT > .6) || (p.fo && G.t - p.t0 > 2.2 && !(G.foLive > 0));
  if (!settled || G.clearing) { why0(G.clearing ? 'clearing' : 'notSettled'); return; }
  if (G.t - T.uLast < 1.4 || uInFlight(G) > 0) { why0('gapOrInFlight'); return; }        // one at a time, a breath between them
  const si = setInfo(G);
  if (si.pending) { why0('playSubsPending'); return; }                                   // the play's own subs first
  const cands = uNear(G).map(e => ({ e: e, id: e.pl.id, k: kindOf(G, 0, e.pl.id) })).filter(c => c.k);
  if (!cands.length) { why0('noSpecialistOn'); return; }
  why0('cands');
  const busy = extBusy(G); for (const j of jobs(G)) if (liveJob(j)) { busy.add(j.outId); busy.add(j.inId); }
  const ord = { FOGO: 0, LSM: 1, DMID: 2 }, bx = UBOX();
  cands.sort((a, b) => ord[a.k] - ord[b.k] || Math.hypot(a.e.x - bx[0], a.e.y - bx[1]) - Math.hypot(b.e.x - bx[0], b.e.y - bx[1]));
  for (const c of cands) {
   if (p.done[c.id] || busy.has(c.id)) { why0(busy.has(c.id) ? 'xBusy' : 'xDone'); continue; }
   if (p.manual[c.id]) { if (!p.done['m' + c.id]) { p.done['m' + c.id] = 1; LOG.stats.skipManual++; lg({ t: +G.t.toFixed(2), ev: 'skip', side: 'U', out: c.id, why: 'you subbed him on' }); } continue; }
   if (si.any && touchedBySet(G, c.id, si)) { if (!p.done['s' + c.id]) { p.done['s' + c.id] = 1; LOG.stats.skipSet++; lg({ t: +G.t.toFixed(2), ev: 'skip', side: 'U', out: c.id, kind: c.k, why: 'your set clear has him' }); } continue; }
   if (uHas(G, c.e)) { why0('xCarrier'); continue; }
   if (inPlay(G, c.e)) { why0('xInPlay'); continue; }              // off the ball first
   const inId = pickOMid(G, 0, uBench(G, c.id));
   if (!inId) { if (!p.done['b' + c.id]) { p.done['b' + c.id] = 1; LOG.stats.skipNoBench++; lg({ t: +G.t.toFixed(2), ev: 'skip', side: 'U', out: c.id, why: 'no O-mid on the bench' }); } continue; }
   const why = p.clrT != null ? 'cleared' : 'faceoff won';
   const j = S4.subBox(c.id, inId, 'auto428', { auto428: c.k, why428: why });
   if (!j) continue;
   p.done[c.id] = 1; p.n++; T.uLast = G.t; LOG.stats.auto++;
   lg({ t: +G.t.toFixed(2), ev: 'auto', side: 'U', kind: c.k, out: c.id, in: inId, why: why, poss: G.possCount, ballX: Math.round(G.ball.x), scr: scr(), bst: G.ball.state, car: carId(G), has: poss(G) });
   try { addFx('cue', 0, 0, { s: 'AUTO SUB: ' + tag(c.id, 0) + ' (' + (c.k === 'DMID' ? 'D-MID' : c.k) + ') OFF, ' + tag(inId, 0) + ' ON', col: '#9fe8ff', life: 1.4 }); } catch (x) {}
   return;
  }
 }
 // ---------- CPU jobs (same rules: jog to its box, the new guy comes on there) ----------
 function cpuStart(G, outId, inId, kind, why, extra) {
  const T = A(G), e = cFind(G, outId);
  if (!e || !inId) return null;
  const j = Object.assign({ id: ++T.seq, side: 1, kind: kind, outId: outId, inId: inId, phase: 'toBox', t0: G.t, why: why }, extra || {});
  T.cpuJobs.push(j);
  lg({ t: +G.t.toFixed(2), ev: kind === 'follow' ? 'follow' : 'auto', side: 'C', kind: j.k428 || kind, out: outId, in: inId, why: why, poss: G.possCount, scr: scr(), bst: G.ball && G.ball.state, car: carId(G), has: poss(G) });
  return j;
 }
 function anc(e, j) { if (j.hx == null || Math.hypot(e.x - j.hx, e.y - j.hy) > (j.f428 ? 24 : 6)) { j.hx = e.x; j.hy = e.y; } e.x = j.hx; e.y = j.hy; } // f428: pushed through (V42.8b safety net)
 function drive(e, tx, ty, dt, v) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), s = Math.min(d, v * dt);
  if (d > .01) { e.x += dx / d * s; e.y += dy / d * s; e.anim = (e.anim || 0) + s * 1.2; e.face421 = dx >= 0 ? 1 : -1; }
  e.tx = tx; e.ty = ty; if (e.rest) e.rest = [ tx, ty ];
  return d - s;
 }
 function cpuEnd(G, j, why) { if (j.phase === 'done') return; j.phase = 'done'; j.end = why; j.tDone = G.t; lg({ t: +G.t.toFixed(2), ev: 'end', side: 'C', out: j.outId, in: j.inId, kind: j.kind, why: why }); }
 function cpuRun(G, dt) {
  const T = A(G);
  for (const j of T.cpuJobs) {
   if (j.phase === 'done') continue;
   if (!liveScr() || (G.ball && G.ball.state === 'dead')) { cpuEnd(G, j, 'deadball'); continue; }
   if (G.t - j.t0 > 14) { cpuEnd(G, j, 'slow'); continue; }
   const e = cFind(G, j.phase === 'on' ? j.inId : j.outId);
   if (!e) { cpuEnd(G, j, 'gone'); continue; }
   if (j.phase === 'toBox') {
    if (j.kind === 'auto' && poss(G) === 'U') { cpuEnd(G, j, 'turnover'); release(e); LOG.stats.stayOn++; continue; }
    if (cHas(G, e)) { j.hx = null; if (!j.ballT) j.ballT = G.t; if (G.t - j.ballT > 3) { cpuEnd(G, j, 'hasBall'); release(e); } continue; }
    if (j.cancelled) { cpuEnd(G, j, j.cancelled === true ? 'cancel' : j.cancelled); release(e); continue; }
    anc(e, j);
    const bx = CBOX(), left = drive(e, bx[0], bx[1], dt, VRUN() * stv(j.outId, 1));
    j.hx = e.x; j.hy = e.y;
    if (left < 1.5) {
     const inP = PPx(j.inId); if (!inP) { cpuEnd(G, j, 'noP'); continue; }
     e.pl = inP; e.stun = 0; e.ns17 = null;
     stSub(j.outId, j.inId, 1);
     j.phase = 'on'; j.tOn = G.t; j.hx = null; j.le = e; j.lx = e.x; j.ly = e.y;
     LOG.stats.swapCpu++;
     try { addFx('txt', e.x, e.y - 24, { s: tag(j.inId, 1) + ' ON', col: '#ff9a8a', life: 1.1 }); } catch (x) {}
     lg({ t: +G.t.toFixed(2), ev: 'swap', side: 'C', out: j.outId, in: j.inId, kind: j.kind, x: Math.round(e.x), y: Math.round(e.y) });
     release(e);
    }
   } else if (j.phase === 'on') {
    // the new guy plays his spot from the box at a run: the game's own AI may want him somewhere far away right now,
    // so his steps are capped at running speed until he has caught up (no jump)
    if (j.le !== e) { j.le = e; j.lx = e.x; j.ly = e.y; }
    const dx = e.x - j.lx, dy = e.y - j.ly, d = Math.hypot(dx, dy), lim = VRUN() * 1.2 * dt;
    if (d > lim && d > .01) { e.x = j.lx + dx / d * lim; e.y = j.ly + dy / d * lim; j.limT = G.t; j.limN = (j.limN || 0) + 1; }
    j.lx = e.x; j.ly = e.y;
    if ((G.t - j.tOn > .8 && G.t - (j.limT || j.tOn) > .4) || G.t - j.tOn > 5) cpuEnd(G, j, 'ok');
   }
  }
  if (T.cpuJobs.length > 60) T.cpuJobs = T.cpuJobs.filter(j => j.phase !== 'done' || G.t - (j.tDone || 0) < 30);
 }
 function cpuExempt(G) { const T = G && G.a428; return T ? T.cpuJobs.filter(j => j.phase === 'toBox').map(j => j.outId) : []; }
 function cpuAutoTick(G) {
  const T = A(G), p = P(G);
  if (T.wasCClr && !G.cpuClear && scr() === 'defense' && p.cclrT == null) p.cclrT = G.t;
  T.wasCClr = !!G.cpuClear && scr() === 'defense';
  if (scr() !== 'defense' || poss(G) !== 'C' || G.cpuClear) return;
  if (p.cclrT == null || G.t - p.cclrT < .6) return;
  const busyJ = T.cpuJobs.filter(j => j.phase === 'toBox');
  let cj = null; try { cj = S4.S().cpu && S4.S().cpu.job; } catch (e) {}
  if (busyJ.length || cj || G.t - T.cLast < 1.4) return;
  const ord = { FOGO: 0, LSM: 1, DMID: 2 }, bx = CBOX();
  const cands = cNear(G).map(e => ({ e: e, id: e.pl.id, k: kindOf(G, 1, e.pl.id) })).filter(c => c.k && !p.done['c' + c.id]);
  cands.sort((a, b) => ord[a.k] - ord[b.k] || Math.hypot(a.e.x - bx[0], a.e.y - bx[1]) - Math.hypot(b.e.x - bx[0], b.e.y - bx[1]));
  for (const c of cands) {
   if (cHas(G, c.e) || inPlay(G, c.e)) continue;
   const inId = pickOMid(G, 1, cBench(G));
   if (!inId) { p.done['c' + c.id] = 1; LOG.stats.skipNoBench++; lg({ t: +G.t.toFixed(2), ev: 'skip', side: 'C', out: c.id, why: 'no O-mid on the bench' }); continue; }
   const j = cpuStart(G, c.id, inId, 'auto', 'cleared', { k428: c.k });
   if (!j) continue;
   p.done['c' + c.id] = 1; T.cLast = G.t; LOG.stats.autoCpu++;
   return;
  }
 }
 // ---------- FOLLOW THE SUB ----------
 function leavers(G) {
  const out = [];
  for (const j of jobs(G)) if (j.kind === 'box' && j.phase === 'toBox' && j.src !== 'follow428') { const e = S4.findEnt(j.outId); if (e) out.push({ side: 0, id: j.outId, e: e, key: 'u' + j.id }); }
  for (const j of A(G).cpuJobs) if (j.phase === 'toBox' && j.kind !== 'follow') { const e = cFind(G, j.outId); if (e) out.push({ side: 1, id: j.outId, e: e, key: 'c' + j.id }); }
  try { const cj = S4.S().cpu && S4.S().cpu.job; if (cj && cj.phase === 'toBox' && cj.e) out.push({ side: 1, id: cj.outId, e: cj.e, key: 'v' + cj.outId + ':' + Math.round(cj.t0 * 10) }); } catch (e) {}
  return out;
 }
 function leaverState(G, key) {
  // is the man still going off? 'going' | 'swapped' | 'stopped'
  const k = key[0];
  if (k === 'u') { const id = +key.slice(1), j = jobs(G).find(x => x.id === id); if (!j) return 'stopped'; if (j.tOn) return 'swapped'; return preSwap(j) ? 'going' : 'stopped'; }
  if (k === 'c') { const id = +key.slice(1), j = A(G).cpuJobs.find(x => x.id === id); if (!j) return 'stopped'; if (j.tOn) return 'swapped'; return j.phase === 'toBox' ? 'going' : 'stopped'; }
  try { const C = S4.S().cpu, out = key.slice(1).split(':')[0]; if (C && C.job && C.job.outId === out) return C.job.phase === 'toBox' ? 'going' : 'swapped'; const L = C && C.log && C.log.slice().reverse().find(x => x.out === out); return L && (L.why === 'ok' || L.ph === 'on') ? 'swapped' : 'stopped'; } catch (e) { return 'stopped'; }
 }
 function followGuard(G) {
  // his man stayed on (turnover, ball, cancelled) or his own team got the ball back: the follower stays on too
  const T = A(G), pz = poss(G);
  for (const j of jobs(G)) {
   if (j.src !== 'follow428' || !preSwap(j) || j.phase === 'boxWait' || !j.lkey428) continue;
   const st = leaverState(G, j.lkey428);
   if (st === 'stopped') cancelU(G, j, 'manStayedOn');
   else if (pz === 'U' && G.t - j.t0 > .5) cancelU(G, j, 'ourBall');
  }
  for (const j of T.cpuJobs) {
   if (j.kind !== 'follow' || j.phase !== 'toBox' || !j.lkey) continue;
   const st = leaverState(G, j.lkey);
   if (st === 'stopped' || (pz === 'C' && G.t - j.t0 > .5)) { j.cancelled = st === 'stopped' ? 'manStayedOn' : 'theirBall'; }
  }
 }
 function followTick(G) {
  const T = A(G), pz = poss(G);
  for (const L of leavers(G)) {
   // the defenders of the other team who are on his man
   const defs = L.side === 0 ? cNear(G) : uNear(G);
   const fSide = 1 - L.side;
   if (pz !== (L.side === 0 ? 'U' : 'C')) continue;   // only a settled defense follows (his team has the ball; not on a loose ball / shot)
   for (const d of defs) {
    if (!d.pl || (d.mark !== L.e && d.mark0 !== L.e)) continue;
    if (T.followed[L.key] || T.followed[L.key + ':' + d.pl.id]) continue;   // one follower per man
    T.followed[L.key + ':' + d.pl.id] = 1;
    const mk = mismatched(G, fSide, d.pl.id);
    if (!mk) continue;
    if (Math.hypot(d.x - L.e.x, d.y - L.e.y) > 90) continue;          // not really on him
    if (fSide === 1 ? d.x < MIDX - 10 : d.x > MIDX + 10) continue;     // a rider in the other half rides on - only a guy stuck on D in his own end follows
    if ((fSide === 0 ? uHas(G, d) : cHas(G, d)) || d.ns17 || d.down > 0) continue;
    if (fSide === 0) {
     const busy = extBusy(G); for (const j of jobs(G)) if (liveJob(j)) { busy.add(j.outId); busy.add(j.inId); }
     if (busy.has(d.pl.id)) continue;
     const inId = pickDef(G, 0, uBench(G, d.pl.id));
     if (!inId) { lg({ t: +G.t.toFixed(2), ev: 'skip', side: 'U', out: d.pl.id, why: 'follow: nobody defensive on the bench' }); continue; }
     const j = S4.subBox(d.pl.id, inId, 'follow428', { follow428: L.id, k428: mk, lkey428: L.key });
     if (!j) continue;
     LOG.stats.follow++; T.followed[L.key] = 1;
     lg({ t: +G.t.toFixed(2), ev: 'follow', side: 'U', kind: mk, out: d.pl.id, in: inId, man: L.id, scr: scr(), poss: G.possCount, bst: G.ball && G.ball.state, car: carId(G), has: poss(G) });
     try { addFx('txt', d.x, d.y - 30, { s: 'FOLLOWS HIS MAN OFF', col: '#ffe14d', life: 1.2 }); } catch (x) {}
    } else {
     if (T.cpuJobs.some(j => j.phase !== 'done' && (j.outId === d.pl.id || j.inId === d.pl.id))) continue;
     const inId = pickDef(G, 1, cBench(G));
     if (!inId) { lg({ t: +G.t.toFixed(2), ev: 'skip', side: 'C', out: d.pl.id, why: 'follow: nobody defensive on the bench' }); continue; }
     const j = cpuStart(G, d.pl.id, inId, 'follow', 'follows ' + L.id, { k428: mk, man: L.id, lkey: L.key });
     if (j) { LOG.stats.followCpu++; T.followed[L.key] = 1; }
    }
   }
  }
 }
 // ---------- CANCEL FOLLOW (your team) ----------
 function myFollows(G) { return jobs(G).filter(j => j.src === 'follow428' && preSwap(j) && j.phase !== 'boxWait'); }
 function cancelFollow(src) {
  const G = G_(); if (!G || offG(G)) return 0;
  let n = 0;
  for (const j of myFollows(G)) if (cancelU(G, j, 'cancelFollow')) n++;
  if (n) { LOG.stats.cancel += n; if (src === 'tap') LOG.stats.cancelTap++; try { addFx('cue', 0, 0, { s: 'FOLLOW CANCELLED - HE STAYS ON', col: '#7dff7a', life: 1.2 }); } catch (x) {} try { SFX.tap(); } catch (x) {} }
  return n;
 }
 const BTN = { w: 70, h: 12 };
 function btnRect() { return { x: Math.round(W / 2 - BTN.w / 2), y: 20, w: BTN.w, h: BTN.h }; } // under the score bar, over the sideline ad board
 function drawCancel() {
  const G = G_(); if (!G || offG(G) || !liveScr()) return;
  try { if (W0.S425 && S425.SP && S425.SP.open) return; } catch (e) {}
  const F = myFollows(G); if (!F.length) return;
  const r = btnRect();
  hit('CANCEL428', r.x - 2, r.y - 2, r.w + 4, r.h + 4, () => cancelFollow('tap'), 'CANCEL FOLLOW');
  rect(r.x, r.y + 1, r.w, r.h, '#000');
  rect(r.x, r.y, r.w, r.h, '#ffe14d');
  rect(r.x, r.y, r.w, 1, 'rgba(255,255,255,.45)');
  text('CANCEL FOLLOW', r.x + r.w / 2, r.y + 3, 1, '#2a0b20', 'center');
  try { const who = F.map(j => num(j.outId, 0) || ln(j.outId)).join(' '); textMini(who + ' FOLLOWING HIS MAN OFF', r.x + r.w / 2, r.y + r.h + 3, '#ffe14d'); } catch (e) {}
  A(G).btnFrames = (A(G).btnFrames || 0) + 1;
 }
 function drawCpuTags(G) {
  for (const j of A(G).cpuJobs) {
   if (j.phase !== 'toBox') continue;
   const e = cFind(G, j.outId); if (!e) continue;
   const x = Math.round(e.x - camX), y = Math.round(e.y) - 19; if (x < -10 || x > W + 10) continue;
   const s = j.kind === 'follow' ? 'FOLLOW' : 'OFF';
   rect(x - 11, y - 1, 23, 7, 'rgba(0,0,0,.65)'); textMini(s, x, y, '#ff9a4a');
  }
 }
 // ---------- V42.8b: NOBODY GOING OFF IS EVER STUCK (Charlie 11/3: "56 OFF" vibrating instead of jogging off) ----------
 // Cause: a guy on his way off was still in your called play (PLAYBOOK set / running play: G.pset / G.playRun map). The
 // set pulls a late player toward his play spot 5 % of the distance a frame (a pick setter 10 %). Far from the spot that
 // pull is more than the 2.5 px the sub runner treats as "something really moved him", so the runner took it, stepped him
 // 0.5 px back toward the box, the pull won again next frame ... standing still with his legs going = vibrating.
 // Fix: the moment a guy is on his way off (any sub: auto, follow, SUB screen, playmaker, stick break, midline step-off)
 // he is out of the play - his play spot is left empty (the play runs without him, like a man in the box) and he drops
 // any pick / hold / play target. Safety net: anyone on his way off (yours or theirs) who has not moved 6 px in 1.5 s is
 // pushed through on his own straight line to the box (nothing else moves him); if even that gets him no closer for 2 s
 // the sub is called off cleanly (he plays on, no OFF tag). Kill switch: window.__rl_no428vb = true (old behaviour). Runs
 // whether or not the auto subs above are on (they are not the only way a guy goes off).
 const VB = { stats: { detach: 0, detachPlay: 0, stuck: 0, forced: 0, forcedDone: 0, cancelled: 0, boxClear: 0 }, ev: [] };
 const vbLg = o => { VB.ev.push(o); if (VB.ev.length > 200) VB.ev.shift(); };
 const vbOff = G => !!W0.__rl_no428vb || !!W0.__rl_no421s || !!W0.__rl_v124gb || !(S4.on && S4.on()) || !G || !!G.tutorial || !!G.online || !!G.brave || !!G.over || G.farMode === 'fo';
 function leaving(G) {
  // everyone with a run to the box right now: [key, side, job, entity, running (vs waiting in the box), box point, kind]
  const out = [], ub = UBOX(), cb = CBOX();
  for (const j of jobs(G)) {
   if (!j || j.phase === 'done') continue;
   if (j.kind === 'box' && (j.phase === 'toBox' || j.phase === 'boxWait')) { const e = S4.findEnt(j.outId); if (e) out.push({ k: 'u' + j.id, side: 0, j: j, e: e, run: j.phase === 'toBox', bx: ub, t: 'u' }); }
   else if (j.kind === 'mid' && (j.phase === 'stepOff' || j.phase === 'inBox')) { const e = S4.findEnt(j.stepId); if (e) out.push({ k: 'm' + j.id, side: 0, j: j, e: e, run: j.phase === 'stepOff', bx: [ ub[0], ub[1] + 3 ], t: 'm' }); }
  }
  for (const j of A(G).cpuJobs) if (j.phase === 'toBox') { const e = cFind(G, j.outId); if (e) out.push({ k: 'c' + j.id, side: 1, j: j, e: e, run: true, bx: cb, t: 'c' }); }
  try { const cj = S4.S().cpu && S4.S().cpu.job; if (cj && cj.phase === 'toBox' && cj.e) out.push({ k: 'v' + cj.outId + ':' + Math.round((cj.t0 || 0) * 100), side: 1, j: cj, e: cj.e, run: true, bx: cb, t: 'v' }); } catch (e) {}
  return out;
 }
 function detach(G, e) {
  // out of the play: his spot stays empty, nothing of the play pulls or holds him any more
  let n = 0;
  for (const S of [ G.pset, G.playRun ]) {
   if (!S || !Array.isArray(S.map)) continue;
   const i = S.map.indexOf(e);
   if (i < 0 || G.carrier === e) continue;
   S.map[i] = null; n++;
   if (S.st17 === e) { S.st17 = null; S.ap17 = null; }
   if (S.ring === e) S.ring = null;
  }
  let m = 0;
  if (e.pickSet) { e.pickSet = null; m++; }
  if (e.callPick) { e.callPick = null; m++; }
  if (e.playHold) { e.playHold = null; m++; }
  if (e.playT) { e.playT = null; m++; }
  if (e.set284) { e.set284 = false; m++; }
  if (n || m) { VB.stats.detach++; if (n) VB.stats.detachPlay++; vbLg({ t: +G.t.toFixed(2), ev: 'detach', id: e.pl && e.pl.id, play: n, marks: m }); }
 }
 function vbPre(G) {
  if (vbOff(G) || !liveScr()) return;
  for (const o of leaving(G)) detach(G, o.e);
 }
 const VBS = G => G.vb428 || (G.vb428 = { tr: {} });
 const hasAny = (G, o) => o.side ? cHas(G, o.e) : uHas(G, o.e);
 function vbCancel(G, o, r) {
  const e = o.e, j = o.j, id = e.pl && e.pl.id;
  j.f428 = 0; VB.stats.cancelled++;
  vbLg({ t: +G.t.toFixed(2), ev: 'cancel', id: id, k: o.k, why: 'stuck' });
  if (o.t === 'u') { cancelU(G, j, 'stuck'); try { addFx('cue', 0, 0, { s: 'SUB CALLED OFF: ' + tag(id, 0) + ' STAYS ON', col: '#ffe14d', life: 1.4 }); } catch (x) {} }
  else if (o.t === 'm') { j.phase = 'done'; j.why = 'stuck'; j.tDone = G.t; release(e); }
  else if (o.t === 'c') { cpuEnd(G, j, 'stuck'); release(e); }
  else { j.t0 = G.t - 1e3; release(e); } // v421s's own CPU sub: its clock runs out next frame ('slow') and it stops
  delete VBS(G).tr[o.k];
 }
 function vbForce(G, o, r, dt) {
  const e = o.e, f = r.f, dB = Math.hypot(o.bx[0] - f.x, o.bx[1] - f.y);
  if (f.best == null || dB < f.best - 1) { f.best = dB; f.bt = G.t; }
  if (G.t - f.bt > 2 || G.t - f.t0 > 20) { vbCancel(G, o, r); return; } // even pushed through he gets nowhere: call it off
  if (!o.run) { o.j.f428 = 0; VB.stats.forcedDone++; vbLg({ t: +G.t.toFixed(2), ev: 'forcedDone', id: e.pl && e.pl.id, k: o.k, s: +(G.t - f.t0).toFixed(2) }); r.f = null; r.h = []; return; }
  if (hasAny(G, o) || e.down > 0 || e.stun > 0) { f.x = e.x; f.y = e.y; f.bt = G.t; return; } // a real thing (ball / knocked down): follow him
  const v = VRUN() * stv(e.pl && e.pl.id, o.side), dx = o.bx[0] - f.x, dy = o.bx[1] - f.y, d = Math.hypot(dx, dy), s = Math.min(d, v * dt);
  if (d > .01) { f.x += dx / d * s; f.y += dy / d * s; e.anim = (e.anim || 0) + s * 1.2; e.face421 = dx >= 0 ? 1 : -1; }
  e.x = f.x; e.y = f.y; e.tx = o.bx[0]; e.ty = o.bx[1]; if (e.rest) e.rest = [ o.bx[0], o.bx[1] ];
  o.j.hx = e.x; o.j.hy = e.y; // the runner's own anchor = where we put him (no step back next frame)
  detach(G, e);
 }
 // a teammate parked on the box spot (usually the guy who just came on: the swap leaves his target on the box, or a
 // jobless pole) blocks the next man coming off - the game's spacing pushes the runner back every frame while the sub
 // runner pulls him in. When a runner is close, anyone of his team standing on the box (not on the ball, not yours to
 // steer) gets a target a few steps up the field.
 function clearBox(G, o, gone) {
  const e = o.e;
  if (!o.run || Math.hypot(e.x - o.bx[0], e.y - o.bx[1]) > 70) return;
  const team = o.side ? 'D' : 'O', tx = o.bx[0] + (o.side ? 26 : -26), ty = o.bx[1] - 34;
  for (const p of G.players || []) {
   if (p === e || p.team !== team || !p.pl || p.gk || gone.has(p) || G.ctrl === p || G.dctl === p || G.carrier === p) continue;
   if (Math.hypot(p.x - o.bx[0], p.y - o.bx[1]) > 14) continue;
   if ((p.tx === tx && p.ty === ty) || G.t - (p.vbClr428 || -9) < 1.2) continue; // once is enough; his own AI takes it from there
   p.vbClr428 = G.t;
   p.tx = tx; p.ty = ty; p.wander = 0; p.playHold = null;
   VB.stats.boxClear = (VB.stats.boxClear || 0) + 1;
   vbLg({ t: +G.t.toFixed(2), ev: 'boxClear', id: p.pl.id, for: e.pl && e.pl.id });
  }
 }
 function vbPost(G, dt) {
  if (vbOff(G) || !liveScr() || !(dt > 0)) return;
  const T = VBS(G), seen = new Set, LV = leaving(G), gone = new Set(LV.map(o => o.e));
  for (const o of LV) {
   seen.add(o.k);
   clearBox(G, o, gone);
   const e = o.e, r = T.tr[o.k] || (T.tr[o.k] = { h: [], t0: G.t, f: null });
   if (r.f) { vbForce(G, o, r, dt); continue; }
   if (!o.run || hasAny(G, o) || e.down > 0 || e.stun > 0) { r.h = []; continue; }
   const h = r.h; h.push([ G.t, e.x, e.y ]);
   while (h.length > 2 && G.t - h[1][0] >= 1.5) h.shift();
   if (G.t - h[0][0] < 1.5) continue;
   const net = Math.hypot(e.x - h[0][1], e.y - h[0][2]), dB = Math.hypot(e.x - o.bx[0], e.y - o.bx[1]);
   if (net < 6 && dB > 1.5) { // 1.5 = the runner's own 'in the box' distance
    VB.stats.stuck++; VB.stats.forced++;
    r.f = { t0: G.t, x: e.x, y: e.y }; o.j.f428 = 1; // the runner (v421s / ours) now ignores anything but a real jump
    vbLg({ t: +G.t.toFixed(2), ev: 'stuck', id: e.pl && e.pl.id, k: o.k, side: o.side, net: +net.toFixed(2), dBox: Math.round(dB), x: Math.round(e.x), y: Math.round(e.y) });
    detach(G, e);
   }
  }
  for (const k of Object.keys(T.tr)) if (!seen.has(k)) delete T.tr[k];
 }
 // ---------- hooks ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  const G0 = G_(), t0 = G0 ? G0.t : 0;
  try { if (G0) vbPre(G0); } catch (e) { er(e); }
  const r = ST0.apply(this, arguments);
  try {
   const G = G_();
   if (G && G === G0 && !offG(G) && liveScr() && G.t > t0) {   // G.t not moving = frozen (sub screen / pause): nothing happens
    setScan(G);
    uAutoTick(G);
    cpuAutoTick(G);
    followTick(G);
    followGuard(G);
    cpuRun(G, G.t - t0);
    unfreezeMine(G);
   } else if (G && G.a428 && !liveScr()) {
    for (const j of G.a428.cpuJobs) if (j.phase !== 'done') cpuEnd(G, j, 'deadball');
    G.a428.wasClr = false; G.a428.wasCClr = false;
   }
  } catch (e) { er(e); }
  try { const G = G_(); if (G && G === G0 && G.t > t0) vbPost(G, G.t - t0); } catch (e) { er(e); }
  return r;
 };
 const RC0 = W0.ruleCounts;
 if (typeof RC0 === 'function') W0.ruleCounts = function () {
  const r = RC0.apply(this, arguments);
  try {
   const G = G_();
   if (!offG(G) && G.a428 && r && r.C) for (const id of cpuExempt(G)) {
    const e = cFind(G, id); if (!e) continue;
    r.C.n--; if (e.x > MIDX - 3) r.C.back--; if (e.x < MIDX + 3) r.C.up--;
    r.C.back++; r.C.up++;
   }
  } catch (e) { er(e); }
  return r;
 };
 const DC0 = W0.drawChirpBtn;
 if (typeof DC0 === 'function') W0.drawChirpBtn = function () {
  try { const G = G_(); if (G && !offG(G) && G.a428) { drawCpuTags(G); drawCancel(); } } catch (e) { er(e); }
  return DC0.apply(this, arguments);
 };
 W0.V428AS = {
  on: () => !killed(), LOG: LOG, A: () => { const G = G_(); return G ? A(G) : null; }, P: () => { const G = G_(); return G ? P(G) : null; },
  cancelFollow: () => cancelFollow('api'), follows: () => { const G = G_(); return G ? myFollows(G).map(j => ({ out: j.outId, in: j.inId, ph: j.phase, man: j.follow428 })) : []; },
  kindOf: (side, id) => kindOf(G_(), side, id), mismatched: (side, id) => mismatched(G_(), side, id), cpuJobs: () => { const G = G_(); return G && G.a428 ? G.a428.cpuJobs.map(j => ({ out: j.outId, in: j.inId, kind: j.kind, ph: j.phase, end: j.end })) : []; },
  cpuStart: (o, i, k) => cpuStart(G_(), o, i, k || 'auto', 'test'), btnRect: btnRect, cBench: () => cBench(G_()), poss: () => poss(G_()),
  VB: VB, vbOn: () => !vbOff(G_())
 };
})();
