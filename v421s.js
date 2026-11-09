// v421s.js - V42.1: LIVE SUBS. A small SUB button by your bench: pick who comes off + who goes on,
// then FROM BOX (he runs to the substitution box, the new guy runs on from it - you play a man short till he is on)
// or FROM MIDLINE (your guy goes over the midline; an attackman - or a D if an attackman comes back - steps off
// at the box while he is over, then steps back on when he comes back, so you stay onside).
// Subs work in a live clear (no pause, no reset). Playmaker: add SUB steps to any play (saved on the play as
// play.sub421); when the play runs in a game the sub happens by itself. Same team = those exact players,
// another team = by position (that team's LSM off, a random bench middie on).
// Kill switch: window.__rl_no421s = true   (sub-switches: __rl_no421slow = no slow-mo while the picker is open,
// __rl_no421pm = no playmaker SUB steps, __rl_no421rt = old saved sub steps never fire)
(function () {
 'use strict';
 const W0 = window;
 const need = [ 'step', 'drawChirpBtn', 'ruleCounts', 'drawBench', 'benchTick', 'hit', 'rect', 'text', 'teamRosterIds', 'slotGet', 'slotSet', 'addFx', 'drawPlaymaker', 'pmDown', 'pmMove', 'pmUp' ];
 if (need.some(n => typeof W0[n] !== 'function')) { W0.S421 = { on: () => false, why: need.filter(n => typeof W0[n] !== 'function') }; return; }
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const off = () => !!(W0.__rl_no421s || W0.__rl_v124gb);
 const offG = G => off() || !G || !!G.tutorial || !!G.online || !!G.brave || !!G.over;
 const LOG = { ev: [], err: 0 };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 300) LOG.ev.shift(); };
 const er = e => { LOG.err++; try { console.error(e); } catch (x) {} };
 const MX = () => MIDX, BOXP = () => [ MIDX - 8, FB - 2 ];
 const VRUN = () => (typeof PACE !== 'undefined' ? PACE.run : 22) * 1.3;
 const posOf = id => { const p = PP(id); return p ? p.pos : null; };
 const grpOf = pos => pos === 'G' ? 'G' : (pos === 'D' || pos === 'LSM') ? 'D' : pos === 'A' ? 'A' : 'M';
 const ln = id => { try { return lastName(PP(id)); } catch (e) { return String(id); } };
 const POSL = pos => pos === 'FO' ? 'FO' : pos || '?';
 const src0 = G => G.mode === 'season' ? 'season' : 'real';
 const isU = p => p && (p.team === 'O' || p.team === 'G2' || p.team === 'U');
 function S(G) {
  G = G || G_();
  if (!G) return null;
  if (!G.s421) G.s421 = { jobs: [], sched: [], runs: {}, freeze: [], seq: 0, stats: { box: 0, mid: 0, done: 0, play: 0, skip: 0, lost: 0, blockedPass: 0, cpuLost: 0 }, ser: [], hideBench: {} };
  return G.s421;
 }
 // ---------- who is where ----------
 function uEnts(G) {
  const out = [];
  for (const p of G.players || []) if ((p.team === 'O' || p.team === 'G2') && p.pl) out.push(p);
  if (G.farU && G.farMode !== 'fo') for (const f of G.farU) if (f.pl && !(f.role === 'G' && out.some(q => q.team === 'G2' || q.gk))) out.push(f);
  return out;
 }
 function findEnt(G, id) {
  if (!id) return null;
  return uEnts(G).find(p => p.pl && p.pl.id === id) || null;
 }
 function outIds(G) {
  const s = new Set([].concat(G.ejected || [], G.concOut || [], G.gout16 || [], G.ns17 || []));
  if (G.pen && G.pen.who) s.add(G.pen.who.id || G.pen.who);
  for (const q of (Array.isArray(G.pens) ? G.pens : [])) if (q && q.who) s.add(q.who.id || q.who);
  return s;
 }
 function onField(G) { return new Set(uEnts(G).map(p => p.pl.id)); }
 function busyIds(G) {
  const s = new Set, T = S(G);
  for (const j of T.jobs) if (j.phase !== 'done') { s.add(j.outId); if (j.inId) s.add(j.inId); if (j.stepId) s.add(j.stepId); }
  return s;
 }
 function benchIds(G, offId) {
  const src = src0(G), OUT = outIds(G), ON = onField(G), busy = busyIds(G);
  let ros = [];
  try { ros = teamRosterIds(G.user, src) || []; } catch (e) {}
  const offP = offId ? PP(offId) : null;
  return ros.filter(id => PP(id) && !ON.has(id) && !OUT.has(id) && !busy.has(id) && !(src === 'season' && typeof injOf === 'function' && injOf(id)) && (offP ? (offP.pos === 'G') === (PP(id).pos === 'G') : PP(id).pos !== 'G'));
 }
 function fieldIds(G) {
  const busy = busyIds(G);
  const order = { A: 0, M: 1, FO: 1, LSM: 2, D: 3, G: 4 };
  return uEnts(G).filter(p => !busy.has(p.pl.id) && !(p.gk || p.team === 'G2' || p.role === 'G')).map(p => p.pl.id).sort((a, b) => (order[posOf(a)] || 0) - (order[posOf(b)] || 0));
 }
 // ---------- onside: players exiting through the box do not count (real rule) ----------
 function exempt(G) {
  const T = G && G.s421, out = [];
  if (!T) return out;
  for (const j of T.jobs) {
   if (j.kind === 'box' && (j.phase === 'toBox' || j.phase === 'boxWait')) out.push(j.outId);
   if (j.kind === 'mid' && (j.phase === 'stepOff' || j.phase === 'inBox')) out.push(j.stepId);
   if (j.kind === 'mid' && j.phase === 'waitOver') { const c = findEnt(G, j.overId); if (c && overSide(j, c)) out.push(j.stepId); }
  }
  return out;
 }
 const RC0 = W0.ruleCounts;
 W0.ruleCounts = function () {
  const r = RC0.apply(this, arguments);
  try {
   const G = G_();
   if (!offG(G) && G.s421 && r && r.U) {
    for (const id of exempt(G)) {
     const e = findEnt(G, id);
     if (!e) continue;
     const x = e.far && typeof fx2403 === 'function' ? e.x : e.x;
     r.U.n--; if (x < MIDX + 3) r.U.back--; if (x > MIDX - 3) r.U.up--;
     r.U.back++; r.U.up++; // one fewer on the field: "too many over / too many back" counts shift by one
     G.s421.exN = (G.s421.exN || 0) + 1;
    }
    if (r.C) for (const id of cpuExempt(G)) {
     const e = cEnts(G).find(p => p.pl.id === id); if (!e) continue;
     r.C.n--; if (e.x > MIDX - 3) r.C.back--; if (e.x < MIDX + 3) r.C.up--;
     r.C.back++; r.C.up++;
    }
   }
  } catch (e) { er(e); }
  return r;
 };
 // ---------- jobs ----------
 function ctrlSwap(G, e) {
  const pick = () => { let q = null, bd = 1e9; for (const o of G.players) if (o !== e && (o.team === 'O') && !o.gk && !o.far) { const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; q = o; } } return q; };
  if (G.ctrl === e) G.ctrl = pick();
  if (G.dctl === e) G.dctl = pick();
 }
 const hasBall = (G, e) => !!e && (G.carrier === e || (G.dclear && G.dclear.holder === e) || (G.ball && G.ball.state === 'pass' && G.ball.to === e));
 function newJob(G, o) {
  const T = S(G);
  const j = Object.assign({ id: ++T.seq, side: 0, t0: G.t, phase: 'wait', src: 'btn' }, o);
  T.jobs.push(j);
  T.stats[j.kind]++;
  lg({ t: +G.t.toFixed(2), ev: 'new', kind: j.kind, out: j.outId || j.overId, in: j.inId || j.stepId, src: j.src, scr: scr() });
  if (j.kind === 'box' && j.inId) { T.hideBench[j.inId] = 1; j.inPos = null; }
  return j;
 }
 function subBox(outId, inId, src, extra) {
  const G = G_();
  if (offG(G)) return null;
  if (!outId || !inId || outId === inId) return null;
  if (!findEnt(G, outId)) return null;
  if (!benchIds(G, outId).includes(inId)) return null;
  return newJob(G, Object.assign({ kind: 'box', outId: outId, inId: inId, src: src || 'btn' }, extra || {}));
 }
 function subMid(overId, stepId, src, extra) {
  const G = G_();
  if (offG(G)) return null;
  if (!overId || !stepId || overId === stepId || !findEnt(G, overId) || !findEnt(G, stepId)) return null;
  return newJob(G, Object.assign({ kind: 'mid', overId: overId, stepId: stepId, src: src || 'btn', overT: 0 }, extra || {}));
 }
 function crossGrp(id) { const g = grpOf(posOf(id)); return g === 'A' ? 'A' : 'D'; }
 function overSide(j, c) { return crossGrp(j.overId) === 'A' ? c.x < MIDX - 3 : c.x > MIDX + 3; }
 function stepFor(G, overId) {
  const want = crossGrp(overId) === 'A' ? [ 'D', 'LSM' ] : [ 'A' ], bx = BOXP();
  const c = uEnts(G).filter(p => p.pl.id !== overId && want.includes(p.pl.pos) && !busyIds(G).has(p.pl.id)).sort((a, b) => Math.hypot(a.x - bx[0], a.y - bx[1]) - Math.hypot(b.x - bx[0], b.y - bx[1]));
  return c.length ? c[0].pl.id : null;
 }
 function drive(e, tx, ty, dt, v) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), s = Math.min(d, v * dt);
  if (d > .01) { e.x += dx / d * s; e.y += dy / d * s; e.anim = (e.anim || 0) + s * 1.2; e.face421 = dx >= 0 ? 1 : -1; }
  e.tx = tx; e.ty = ty;
  if (e.rest) e.rest = [ tx, ty ];
  return d - s;
 }
 function hold(e, j) { // keeps the job's guy on our track (after the game's own update), no jumps
  if (j.hx == null) { j.hx = e.x; j.hy = e.y; }
  e.x = j.hx; e.y = j.hy;
 }
 // a restart / dead ball / another file can move him for real: then follow him from there, never snap him back (no teleports)
 function anc(e, j, kx, ky) { if (j[kx] == null || Math.hypot(e.x - j[kx], e.y - j[ky]) > (j.f428 ? 24 : W0.__rl_no427pm ? 6 : 2.5)) { j[kx] = e.x; j[ky] = e.y; } e.x = j[kx]; e.y = j[ky]; } // V42.7: only tiny drift is pulled back (a 3-6 px pull read as a hitch); f428 = V42.8b pushed-through runner (v428as): only a real jump moves him
 // stamina (v422st.js, optional): tired legs run a touch slower; a sub resets its distance bookkeeping
 function stv(id, side) { try { return W0.ST422 && typeof ST422.speedMul === 'function' ? Math.max(.85, Math.min(1, +ST422.speedMul(id, side) || 1)) : 1; } catch (e) { return 1; } }
 function stSub(offId, onId, side) { try { if (W0.ST422 && typeof ST422.onSub === 'function') ST422.onSub(offId, onId, side); } catch (e) {} }
 function release(e) { if (!e) return; e.tx = e.x; e.ty = e.y; e.wander = 0; e.react = 0; if (e.rest && e.home) e.rest = e.home.slice ? e.home.slice() : e.rest; }
 function lineupSwap(G, outId, inId) {
  const lu = G.lu && G.lu[0];
  if (!lu || typeof SLOTS === 'undefined') return 0;
  const inLu = SLOTS.some(s => slotGet(lu, s[0]) === inId);
  if (inLu) return 0; // he already has a slot (other unit): situational sub, the lineup stays
  let n = 0;
  for (const s of SLOTS) if (slotGet(lu, s[0]) === outId) { slotSet(lu, s[0], inId); n++; }
  if (n) (G.subs = G.subs || []).push({ side: 0, out: outId, in: inId, s421: 1 });
  return n;
 }
 function loseTrack(G, e) {
  // the ride/defense sometimes loses the guy coming out of the box
  const T = S(G);
  const cs = (G.players || []).filter(q => (q.team === 'D') && !q.gk && Math.hypot(q.x - e.x, q.y - e.y) < 70 && (q.mark === e || q.mark0 === e || true)).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y));
  const q = cs[0];
  if (!q || Math.random() >= .5) return false;
  T.freeze.push({ q: q, until: G.t + 1 + Math.random() * .7, x: q.x, y: q.y });
  T.stats.cpuLost++;
  try { addFx('txt', q.x, q.y - 26, { s: '?', col: '#ffe14d', life: 1 }); } catch (x) {}
  return true;
 }
 function swapAt(G, j, e) {
  const old = e.pl, inP = PP(j.inId);
  if (!inP) return false;
  e.pl = inP;
  stSub(j.outId, j.inId, 0);
  e.stun = 0; e.ns17 = null; e.dropT = 0; e.gbReact = 0;
  const n = lineupSwap(G, j.outId, j.inId);
  j.luN = n;
  j.phase = 'on'; j.tOn = G.t; j.onX = e.x; j.onY = e.y;
  delete S(G).hideBench[j.inId];
  release(e);
  e.wander = 0;
  if (Array.isArray(j.onPath) && j.onPath.length > 1) { j.phase = 'onRun'; j.owp = 1; j.hx = e.x; j.hy = e.y; }
  try { addFx('txt', e.x, e.y - 24, { s: tagW(j.inId) + ' ON', col: '#7dff7a', life: 1.2 }); } catch (x) {}
  lg({ t: +G.t.toFixed(2), ev: 'swap', out: old && old.id, in: j.inId, lu: n, scr: scr(), clr: clrNow(G) });
  if (clrNow(G)) S(G).stats.clrSwap = (S(G).stats.clrSwap || 0) + 1;
  try { loseTrack(G, e); } catch (x) { er(x); }
  return true;
 }
 function clrNow(G) {
  const b = G.ball;
  return !!(b && ((scr() === 'defense' && (b.state === 'clear' || (b.state === 'pass' && b.clear))) || (scr() === 'live' && G.clearing)));
 }
 function liveScr() { const s = scr(); return s === 'live' || s === 'defense'; }
 function jobTick(G, dt) {
  const T = S(G);
  if (!T.jobs.length) return;
  const bx = BOXP(), v = VRUN();
  for (const j of T.jobs) {
   if (j.phase === 'done') continue;
   if (G.t - j.t0 > 40) { finish(G, j, 'timeout'); continue; }
   if (j.kind === 'box') {
    const e = findEnt(G, j.outId);
    if (j.phase === 'wait') {
     if (!e) { finishGone(G, j); continue; }
     if (hasBall(G, e)) { if (!j.waitMsg) { j.waitMsg = 1; try { addFx('cue', 0, 0, { s: 'SUB WAITS: ' + ln(j.outId) + ' HAS THE BALL', col: '#ffe14d', life: 1.4 }); } catch (x) {} } continue; }
     j.phase = 'toBox'; j.tBox = G.t; j.hx = e.x; j.hy = e.y;
     ctrlSwap(G, e);
     try { addFx('txt', e.x, e.y - 24, { s: tagW(j.outId) + ' OFF', col: '#ff9a8a', life: 1.2 }); } catch (x) {}
    }
    if (j.phase === 'toBox') {
     if (!e) { finishGone(G, j); continue; }
     if (hasBall(G, e)) { j.phase = 'wait'; j.waitMsg = 0; j.hx = null; continue; }
     ctrlSwap(G, e);
     anc(e, j, 'hx', 'hy');
     // a drawn OFF run (playmaker): he jogs his drawn path, then into the box
     let tx = bx[0], ty = bx[1];
     if (Array.isArray(j.path) && j.path.length > 2) {
      if (j.wp == null) { let bi = 0, bd = 1e9; for (let i = 0; i < j.path.length - 1; i++) { const dd = Math.hypot(j.path[i][0] - e.x, j.path[i][1] - e.y); if (dd < bd) { bd = dd; bi = i; } } j.wp = bi + 1; }
      while (j.wp < j.path.length - 1 && Math.hypot(j.path[j.wp][0] - e.x, j.path[j.wp][1] - e.y) < 3) j.wp++;
      if (j.wp < j.path.length - 1) { tx = j.path[j.wp][0]; ty = j.path[j.wp][1]; }
     }
     const left = drive(e, tx, ty, dt, v * stv(j.outId, 0));
     j.hx = e.x; j.hy = e.y;
     if (tx === bx[0] && ty === bx[1] && left < 1.5) { if (G.t - j.t0 < (j.onDelay || 0)) { j.phase = 'boxWait'; j.tWait = G.t; } else swapAt(G, j, e); }
    } else if (j.phase === 'boxWait') {
     // the new guy waits for his drawn time (+N SEC): you are a man short till then
     if (!e) { finishGone(G, j); continue; }
     ctrlSwap(G, e);
     anc(e, j, 'hx', 'hy');
     drive(e, bx[0], bx[1], dt, v); j.hx = e.x; j.hy = e.y;
     if (G.t - j.t0 >= (j.onDelay || 0) || G.t - j.tWait > 10) swapAt(G, j, e);
    } else if (j.phase === 'onRun') {
     // a drawn ON run: the new guy runs his drawn path from the box, then plays his spot
     const n = findEnt(G, j.inId);
     if (!n) { finish(G, j, 'gone'); continue; }
     if (hasBall(G, n) || G.ctrl === n || G.dctl === n || G.t - j.tOn > 12) { release(n); finish(G, j, 'ok'); continue; }
     anc(n, j, 'hx', 'hy');
     while (j.owp < j.onPath.length && Math.hypot(j.onPath[j.owp][0] - n.x, j.onPath[j.owp][1] - n.y) < 3) j.owp++;
     if (j.owp >= j.onPath.length) { release(n); finish(G, j, 'ok'); continue; }
     drive(n, j.onPath[j.owp][0], j.onPath[j.owp][1], dt, v * stv(j.inId, 0));
     j.hx = n.x; j.hy = n.y;
    } else if (j.phase === 'on') {
     if (G.t - j.tOn > 1.2) finish(G, j, 'ok');
    }
   } else {
    // ---- midline ----
    const c = findEnt(G, j.overId), s = findEnt(G, j.stepId);
    if (!c || !s) { stepBack(G, j, s); finish(G, j, 'gone'); continue; }
    const over = overSide(j, c);
    if (j.phase === 'wait') { j.phase = 'waitOver'; j.goT = G.t; }
    // the swap is for your possession (a clear / a D pushing over): if they get the ball, everybody goes back to normal
    let pt = null; try { pt = typeof possTeam === 'function' ? possTeam() : null; } catch (x) {}
    j.cT = pt === 'C' ? (j.cT || 0) + dt : 0;
    if (j.cT > .5) { if (j.phase === 'stepOff' || j.phase === 'inBox') stepBack(G, j, s); finish(G, j, 'theirBall'); continue; }
    if (j.phase === 'waitOver') {
     if (over) { j.phase = 'stepOff'; j.tOver = G.t; j.hx = s.x; j.hy = s.y; ctrlSwap(G, s); try { addFx('txt', s.x, s.y - 24, { s: ln(j.stepId) + ' STEPS OFF', col: '#ff9a8a', life: 1.3 }); } catch (x) {} }
     else if (!hasBall(G, c) && G.ctrl !== c && G.dctl !== c && G.t - j.goT < 12) {
      // off the ball: he goes over on his own
      anc(c, j, 'cx', 'cy');
      const tx = crossGrp(j.overId) === 'A' ? MIDX - 26 : MIDX + 26;
      drive(c, tx, clamp(c.y, FT + 14, FB - 14), dt, v);
      j.cx = c.x; j.cy = c.y;
      continue;
     } else if (G.t - j.goT >= 12) { finish(G, j, 'neverOver'); continue; }
     else { j.cx = null; continue; }
    }
    if (j.phase === 'stepOff' || j.phase === 'inBox') {
     anc(s, j, 'hx', 'hy');
     const left = drive(s, bx[0], bx[1] + 3, dt, v);
     j.hx = s.x; j.hy = s.y;
     if (j.phase === 'stepOff' && left < 1.5) { j.phase = 'inBox'; j.tIn = G.t; }
     j.overT = (j.overT || 0) + (over ? dt : 0);
     // the crosser holds over the line a while when he is off the ball
     if (over && !hasBall(G, c) && G.ctrl !== c && G.dctl !== c && G.t - j.tOver < 8) {
      anc(c, j, 'cx', 'cy');
      const tx = crossGrp(j.overId) === 'A' ? Math.min(c.x, MIDX - 20) : Math.max(c.x, MIDX + 20);
      drive(c, tx, c.y, dt, v); j.cx = c.x; j.cy = c.y;
     } else j.cx = null;
     const back = !over && G.t - j.tOver > .4;
     const dead = !liveScr() || (G.t - j.tOver > 20);
     if (back || dead) { stepBack(G, j, s); finish(G, j, back ? 'back' : 'dead'); }
    }
   }
  }
  T.jobs = T.jobs.filter(j => j.phase !== 'done' || G.t - (j.tDone || 0) < 3);
 }
 function stepBack(G, j, s) {
  if (s) { release(s); try { addFx('txt', s.x, s.y - 24, { s: ln(j.stepId) + ' BACK ON', col: '#7dff7a', life: 1.2 }); } catch (x) {} }
 }
 function finishGone(G, j) {
  // he left the field another way (unit change / dead ball): the sub still counts on the lineup
  if (j.kind === 'box' && j.inId) j.luN = lineupSwap(G, j.outId, j.inId);
  finish(G, j, 'gone');
 }
 function finish(G, j, why) {
  if (j.phase === 'done') return;
  const T = S(G);
  if (j.kind === 'box' && j.inId) delete T.hideBench[j.inId];
  j.phase = 'done'; j.why = why; j.tDone = G.t;
  T.stats.done++;
  lg({ t: +G.t.toFixed(2), ev: 'done', kind: j.kind, why: why, dur: +(G.t - j.t0).toFixed(2) });
 }
 function freezeTick(G) {
  const T = S(G);
  T.freeze = T.freeze.filter(f => f.until > G.t && (G.players || []).includes(f.q));
  for (const f of T.freeze) { f.q.x = f.x; f.q.y = f.y; f.q.tx = f.x; f.q.ty = f.y; }
 }
 // ---------- playmaker sub steps at run time ----------
 function playCat(pl) { try { return typeof pmCat === 'function' ? pmCat(pl) : pl.cat || 'OFFENSE'; } catch (e) { return pl.cat || 'OFFENSE'; } }
 function activeRuns(G) {
  const out = [], s = scr(), b = G.ball;
  if (!b) return out;
  // clears (base game G.cset, selected clear, or any runner that keeps clrSel/clrCtx)
  let ctx = null;
  try { ctx = typeof clrCtx === 'function' ? clrCtx() : null; } catch (e) {}
  const inClr = !!ctx || (s === 'defense' && b.state === 'pass' && b.clear) || (s === 'live' && G.clearing);
  if (inClr) {
   let pl = G.cset && G.cset.pl || null;
   if (!pl) try { pl = typeof clrSel === 'function' ? clrSel() : null; } catch (e) {}
   if (!pl && W0.V420C && typeof V420C.curClear === 'function') try { pl = V420C.curClear(); } catch (e) {}
   if (pl) out.push({ k: 'CLEAR', pl: pl });
  }
  // rides (your ride while they clear)
  if (s === 'defense' && G.cpuClear) {
   let pl = null;
   try { pl = typeof rideCustom === 'function' ? rideCustom() : null; } catch (e) {}
   if (pl) out.push({ k: 'RIDES', pl: pl });
  }
  // plays you run on offense
  if (s === 'live' && G.playRun && G.playRun.pl && (!G.playRun.done || G.playRun.poss === G.possCount)) out.push({ k: 'PLAY', pl: G.playRun.pl, run: G.playRun });
  // your custom D set
  if (s === 'defense' && !G.cpuClear && G.dset === 'custom' && G.dPlay) {
   let pl = null;
   try { pl = typeof playById === 'function' ? playById(G.dPlay) : null; } catch (e) {}
   if (pl) out.push({ k: 'D', pl: pl });
  }
  return out;
 }
 function stepsOf(pl) { return pl && Array.isArray(pl.sub421) ? pl.sub421.filter(x => x && x.off && x.on) : []; }
 function runTick(G, dt) {
  if (W0.__rl_no421rt) return;
  const T = S(G), act = activeRuns(G), now = new Set;
  for (const a of act) {
   if (!stepsOf(a.pl).length) continue;
   const key = a.k + ':' + a.pl.id;
   now.add(key);
   let R = T.runs[key];
   if (!R || (a.run && R.run !== a.run)) {
    R = T.runs[key] = { t0: G.t, pl: a.pl, run: a.run || null, fired: {}, last: G.t, k: a.k, a: a, poss: G.possCount };
    // the same play picked up again in the same possession (defense -> live, a context blink): its subs already ran once
    // (the clear going from the save screen into live play, a context blink): its subs already ran once
    const dp = (T.ended = T.ended || {});
    if (!a.run && dp[key] != null && G.t - dp[key] < 4) { stepsOf(a.pl).forEach((x, i) => { R.fired[i] = 1; }); T.stats.refireBlocked = (T.stats.refireBlocked || 0) + 1; }
    lg({ t: +G.t.toFixed(2), ev: 'run', k: a.k, pl: a.pl.name, n: stepsOf(a.pl).length });
   }
   R.last = G.t;
   const el = G.t - R.t0;
   stepsOf(a.pl).forEach((st, i) => {
    if (R.fired[i] || el + 1e-6 < (+st.at || 0)) return;
    R.fired[i] = 1;
    fireStep(G, st, a, el);
   });
  }
  // a run is over when its context has been gone a little while (bridges the defense -> live frame)
  // a short play can finish before its "+3 SEC" sub: same possession, still live -> the sub still happens on time
  for (const k of Object.keys(T.runs)) {
   if (now.has(k)) continue;
   const R = T.runs[k], st = stepsOf(R.pl), el = G.t - R.t0, maxAt = Math.max(0, ...st.map(x => +x.at || 0));
   if ((R.a || R.ext) && R.poss === G.possCount && liveScr() && (R.ext || el < maxAt + .5) && st.some((x, i) => !R.fired[i])) {
    st.forEach((x, i) => { if (R.fired[i] || el + 1e-6 < (+x.at || 0)) return; R.fired[i] = 1; fireStep(G, x, R.a || { k: R.k, pl: R.pl }, el); });
    R.last = G.t; continue;
   }
   if (G.t - R.last > .6) { (T.ended = T.ended || {})[k] = R.last; delete T.runs[k]; }
  }
 }
 function resolveStep(G, st) {
  const sameTeam = st.team === G.user;
  const ents = uEnts(G).filter(p => !(p.gk || p.team === 'G2' || p.role === 'G') || st.off.pos === 'G');
  const busy = busyIds(G);
  const pickOn = (pos, exclude) => ents.filter(p => p.pl.pos === pos && !busy.has(p.pl.id) && p.pl.id !== exclude);
  let offId = null, onId = null, how = sameTeam ? 'exact' : 'pos';
  if (sameTeam && st.off.id && findEnt(G, st.off.id) && !busy.has(st.off.id)) offId = st.off.id;
  else {
   if (sameTeam) how = 'pos(off not on field)';
   let c = pickOn(st.off.pos);
   // only middies fall back to any middie (M / FO); an LSM, D, attackman or goalie step needs that exact position on the field,
   // otherwise the step is skipped (a second clear in the same game must not pull a close D-man off because the LSM is already gone)
   if (!c.length && (st.off.pos === 'M' || st.off.pos === 'FO')) c = ents.filter(p => (p.pl.pos === 'M' || p.pl.pos === 'FO') && !busy.has(p.pl.id));
  // V42.7 (Charlie): the play subs the LSM but there is no LSM on the field -> the 3rd middie (the middie in the clear's LSM spot) subs instead
  if (!c.length && st.off.pos === 'LSM' && !W0.__rl_no427pm) { c = ents.filter(p => (p.pl.pos === 'M' || p.pl.pos === 'FO') && !busy.has(p.pl.id)); const sl = G.cset && Array.isArray(G.cset.slots) ? G.cset.slots.find(s => s && s.i === 6 && s.o && c.includes(s.o)) : null; if (sl) c = [ sl.o ]; if (c.length) how += ', LSM->3rd middie'; }
   if (c.length) { const bx = BOXP(); c.sort((a, b) => Math.hypot(a.x - bx[0], a.y - bx[1]) - Math.hypot(b.x - bx[0], b.y - bx[1])); offId = c[0].pl.id; }
  }
  if (!offId) return { why: 'no ' + st.off.pos + ' on the field' };
  if (st.mode === 'mid') {
   if (sameTeam && st.on.id && findEnt(G, st.on.id) && st.on.id !== offId) onId = st.on.id;
   else {
    let c = pickOn(st.on.pos, offId);
    if (!c.length) c = ents.filter(p => grpOf(p.pl.pos) === grpOf(st.on.pos) && p.pl.id !== offId && !busy.has(p.pl.id));
    if (c.length) onId = c[Math.floor(Math.random() * c.length)].pl.id; else onId = stepFor(G, offId);
   }
   return onId ? { offId, onId, how } : { why: 'nobody to step off' };
  }
  const bench = benchIds(G, offId);
  if (sameTeam && st.on.id && bench.includes(st.on.id)) onId = st.on.id;
  else {
   if (sameTeam && how === 'exact') how = 'exact off, pos on (he is not on the bench)';
   let c = bench.filter(id => posOf(id) === st.on.pos);
   if (!c.length && st.on.pos === 'LSM' && !W0.__rl_no427pm) { c = bench.filter(id => posOf(id) === 'M' || posOf(id) === 'FO'); if (c.length) how += ', LSM on->middie'; } // V42.7: no LSM on the bench -> a middie
   if (!c.length) c = bench.filter(id => grpOf(posOf(id)) === grpOf(st.on.pos));
   if (c.length) onId = c[Math.floor(Math.random() * c.length)];
  }
  return onId ? { offId, onId, how } : { why: 'no ' + st.on.pos + ' on the bench' };
 }
 function fireStep(G, st, a, el) {
  const T = S(G), r = resolveStep(G, st);
  const rec = { t: +G.t.toFixed(2), ev: 'fire', k: a.k, pl: a.pl.name, at: +st.at || 0, el: +el.toFixed(2), mode: st.mode, team: st.team, user: G.user };
  if (!r.offId) { rec.skip = r.why; T.stats.skip++; lg(rec); try { addFx('cue', 0, 0, { s: 'PLAY SUB SKIPPED: ' + r.why.toUpperCase(), col: '#9aa', life: 1.2 }); } catch (x) {} return null; }
  const ex = { playId: a.pl.id };
  if (st.mode !== 'mid') {
   if (Array.isArray(st.offPath) && st.offPath.length > 2) ex.path = st.offPath.map(q => [ +q[0], +q[1] ]);
   if (Array.isArray(st.onPath) && st.onPath.length > 1) ex.onPath = st.onPath.map(q => [ +q[0], +q[1] ]);
   if (st.onAt != null && isFinite(+st.onAt)) ex.onDelay = Math.max(0, +st.onAt - (+st.at || 0));
  }
  const j = st.mode === 'mid' ? subMid(r.offId, r.onId, 'play', ex) : subBox(r.offId, r.onId, 'play', ex);
  Object.assign(rec, { off: r.offId, offPos: posOf(r.offId), on: r.onId, onPos: posOf(r.onId), how: r.how, ok: !!j, drawn: !!(ex.path || ex.onPath), onDelay: ex.onDelay || 0 });
  lg(rec);
  (T.fires = T.fires || []).push(rec);
  if (j) { T.stats.play++; try { addFx('cue', 0, 0, { s: 'PLAY SUB: ' + tagW(r.offId) + (st.mode === 'mid' ? ' OVER, ' + tagW(r.onId) + ' STEPS OFF' : ' OFF, ' + tagW(r.onId) + ' ON'), col: '#ff9a4a', life: 1.6 }); } catch (x) {} }
  else T.stats.skip++;
  return j;
 }

 // ---------- CPU subs: on some of its clears the CPU gets its pole off - LSM runs to the box, an offensive middie runs on ----------
 // (real lacrosse: after a save/turnover the LSM sprints to the box on the clear and an O-middie comes on; no lineup change,
 //  the LSM comes back on at the next defensive rebuild like any unit swap. Off in online/tutorial via offG.)
 const offCPU = G => offG(G) || !!W0.__rl_no421cpu;
 const CBOX = () => [ MIDX + 8, FB - 2 ];
 function cEnts(G) { const out = (G.players || []).filter(p => p.team === 'D' && p.pl && !p.gk); if (G.farC && G.farMode !== 'fo') for (const f of G.farC) if (f.pl && f.role !== 'G' && !out.some(q => q.pl.id === f.pl.id)) out.push(f); return out; }
 function cBall(G, e) { const b = G.ball; return !!(b && e && (G.dcar === e || G.carrier === e || (b.state === 'pass' && b.to === e))); }
 function cpuExempt(G) { const C = G && G.s421 && G.s421.cpu; return C && C.job && C.job.phase === 'toBox' ? [ C.job.outId ] : []; }
 function cpuTick(G, dt) {
  const T = S(G), C = T.cpu || (T.cpu = { was: false, job: null, n: 0, tries: 0, done: 0, log: [] });
  const live = scr() === 'live' || scr() === 'defense';
  if (C.job && (!live || G.ball && G.ball.state === 'dead')) cpuEnd(G, C, 'stop');
  const now = live && !!G.cpuClear;
  if (now && !C.was && !C.job) {
   C.tries++;
   const rate = typeof W0.__rl_421cpuRate === 'number' ? W0.__rl_421cpuRate : .45;
   C.pend = Math.random() < rate ? G.t : null;     // decided at the turnover; the pole gets a moment to find his feet
  }
  if (C.pend != null && !C.job) { if (!now || G.t - C.pend > 2) C.pend = null; else if (G.t - C.pend > .3) { cpuStart(G, C); if (C.job) C.pend = null; } }
  C.was = now;
  if (C.job) cpuRun(G, C, dt);
 }
 function cpuStart(G, C) {
  const lu = G.lu && G.lu[1]; if (!lu) return;
  // the pole first (LSM), else a short-stick d-middie: both get swapped for an offensive middie on a clear
  const ce = cEnts(G);
  const e = ce.find(p => p.pl.pos === 'LSM' || p.pl.id === lu.LSM) || ce.find(p => (p.pl.id === lu.SSDM || p.pl.id === lu.SSDM2) && p.x > MIDX - 30);
  const why = w => { C.no = C.no || {}; C.no[w] = (C.no[w] || 0) + 1; };
  if (!e) return why('noPoleOrSSDM');
  if (e.x < MIDX - 30) return why('lsmOver');    // he has to be on (or right at) his own defensive side to run off
  const OUT = outIds(G), ON = new Set(cEnts(G).map(p => p.pl.id));
  const pool = (lu.M || []).filter(id => id && PP(id) && !ON.has(id) && !OUT.has(id));
  if (!pool.length) { C.skip = (C.skip || 0) + 1; return why('noBench'); }
  const inId = pool[Math.floor(Math.random() * pool.length)];
  C.job = { outId: e.pl.id, inId: inId, e: e, phase: 'toBox', t0: G.t };
  C.n++;
  lg({ t: +G.t.toFixed(2), ev: 'cpuSub', out: e.pl.id, in: inId });
 }
 function cpuRun(G, C, dt) {
  const j = C.job, e = j.e;
  if (!e || (G.players.indexOf(e) < 0 && (G.farC || []).indexOf(e) < 0)) return cpuEnd(G, C, 'gone');
  if (G.t - j.t0 > 9) return cpuEnd(G, C, 'slow');
  if (j.phase === 'toBox') {
   if (cBall(G, e)) { j.hx = null; return; }     // he has it: let the game play him until he gives it up
   anc(e, j, 'hx', 'hy');                        // the game's own ride/defense logic would pull him back every frame
   const bx = CBOX(), left = drive(e, bx[0], bx[1], dt, (PACE.run || 22) * 1.3);
   j.hx = e.x; j.hy = e.y;
   if (left < 1.5) {
    const inP = PP(j.inId); if (!inP) return cpuEnd(G, C, 'noP');
    e.pl = inP; e.stun = 0;
    stSub(j.outId, j.inId, 1);
    j.phase = 'on'; j.tOn = G.t;
    try { addFx('txt', e.x, e.y - 24, { s: ln(j.inId) + ' ON', col: '#ff9a8a', life: 1.1 }); } catch (x) {}
    lg({ t: +G.t.toFixed(2), ev: 'cpuSwap', out: j.outId, in: j.inId });
   }
  } else if (j.phase === 'on') {
   if (G.t - j.tOn > .6) return cpuEnd(G, C, 'ok');
   anc(e, j, 'hx', 'hy');
   drive(e, MIDX + 24, FB - 24, dt, (PACE.run || 22) * 1.2);
   j.hx = e.x; j.hy = e.y;
  }
 }
 function cpuEnd(G, C, why) {
  const j = C.job; C.job = null;
  if (!j) return;
  if (why === 'ok') C.done++;
  C.log.push({ t: +G.t.toFixed(2), out: j.outId, in: j.inId, why: why, ph: j.phase });
  if (C.log.length > 40) C.log.shift();
 }

 // ---------- frame hooks ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  const G0 = G_();
  let d2 = dt;
  try { if (!offG(G0) && UI.open && !W0.__rl_no421slow && liveScr()) d2 = dt * .5; } catch (e) {}
  const r = ST0.call(this, d2);
  try {
   const G = G_();
   if (!offG(G) && G === G0) {
    if (liveScr()) {
     runTick(G, d2);
     jobTick(G, d2);
     freezeTick(G);
     if (!offCPU(G)) cpuTick(G, d2);
     const T = S(G);
     if (T.rec) T.ser.push([ +G.t.toFixed(2), uEnts(G).length - exempt(G).length, uEnts(G).length, scr() ]);
     if (T.ser.length > 4000) T.ser.shift();
    } else if (G.s421 && G.s421.jobs.length) {
     for (const j of G.s421.jobs) {
      if (j.phase === 'done') continue;
      if (j.kind === 'mid') { stepBack(G, j, findEnt(G, j.stepId)); finish(G, j, 'deadball'); }
      // goal / new period: the sub just happens on the whistle (lineup swap), nobody is left mid-run into the next faceoff
      else if (scr() === 'faceoff') { if (j.phase === 'on' || j.phase === 'onRun') finish(G, j, 'ok'); else finishGone(G, j); }
      else { j.hx = null; j.cx = null; }
     }
    }
    if (UI.open && !liveScr()) UI.open = false;
   }
  } catch (e) { er(e); }
  return r;
 };
 // passes: the guy running off is not a target (yours are blocked; the game's own outlet goes to the next open man)
 const AUTO = { d: 0 };
 if (typeof W0.updateDefense === 'function') {
  const UD0 = W0.updateDefense;
  W0.updateDefense = function () { AUTO.d++; try { return UD0.apply(this, arguments); } finally { AUTO.d--; } };
 }
 for (const nm of [ 'throwPass', 'dThrowClear' ]) {
  const F0 = W0[nm];
  if (typeof F0 !== 'function') continue;
  W0[nm] = function (to) {
   try {
    const G = G_();
    if (!offG(G) && to && to.pl && G.s421 && exempt(G).includes(to.pl.id) && AUTO.d > 0 && nm === 'dThrowClear') {
     // the game's own outlet picked the guy running off: give it the most open teammate who is still playing
     const ex = exempt(G), h = G.dclear && G.dclear.holder;
     let best = null, bs = -1e9;
     for (const d of (G.players || [])) if (d.team === 'O' && d !== h && d !== to && !(d.pl && ex.includes(d.pl.id))) { let md = 99; for (const a of G.players) if (a.team === 'D') md = Math.min(md, Math.hypot(a.x - d.x, a.y - d.y)); if (md > bs) { bs = md; best = d; } }
     G.s421.stats.autoRedirect = (G.s421.stats.autoRedirect || 0) + 1;
     if (best) return F0.call(this, best);
     return;
    }
    if (!offG(G) && to && to.pl && G.s421 && exempt(G).includes(to.pl.id)) { G.s421.stats.blockedPass++; try { addFx('txt', to.x, to.y - 24, { s: 'HE IS SUBBING OFF', col: '#ff9a8a', life: 1 }); } catch (x) {} return; }
   } catch (e) { er(e); }
   return F0.apply(this, arguments);
  };
 }
 // bench: the guy going on waits in the box, not on the bench; no double runner after the swap
 const BT0 = W0.benchTick;
 W0.benchTick = function (side) {
  const B = BT0.apply(this, arguments);
  try {
   const G = G_();
   if (!offG(G) && side === 'u' && B && G.s421) {
    const T = G.s421;
    for (const j of T.jobs) if (j.kind === 'box' && j.inId && (j.phase === 'on' || j.phase === 'onRun' || j.phase === 'done') && G.t - (j.tOn || 0) < 2) B.run = B.run.filter(r => !(r.id === j.inId && Math.abs(r.x1 - (MIDX - 8)) < 12));
    for (const id of Object.keys(T.hideBench)) B.arr[id] = menuT + 1;
   }
  } catch (e) { er(e); }
  return B;
 };
 const DB0 = W0.drawBench;
 W0.drawBench = function () {
  const r = DB0.apply(this, arguments);
  try {
   const G = G_();
   if (!offG(G) && G.s421 && liveScr()) drawWaiters(G);
  } catch (e) { er(e); }
  return r;
 };
 function drawWaiters(G) {
  const T = G.s421, bx = BOXP();
  // the sub box (a painted rectangle at the midline, your side)
  if (T.jobs.some(j => j.phase !== 'done')) { rect(MIDX - 16, FB + 1, 15, 1, 'rgba(255,225,77,.85)'); }
  for (const j of T.jobs) {
   if (j.kind !== 'box' || !j.inId || !(j.phase === 'wait' || j.phase === 'toBox' || j.phase === 'boxWait')) continue;
   // he jogs from the bench to the box and waits there
   if (!j.inPos) { let sx = MIDX - 84; try { const B = G.bench && G.bench.u; const i = B ? B.ids.indexOf(j.inId) : -1; if (i >= 0) sx = benchSlotX('u', i); } catch (e) {} j.inPos = [ sx, H - 4 ]; j.inT = menuT; }
   const k = clamp((menuT - j.inT) / 1.4, 0, 1), x = j.inPos[0] + (bx[0] + 2 - j.inPos[0]) * k, y = j.inPos[1] + (bx[1] + 3 - j.inPos[1]) * k;
   const fr = k < 1 ? RUN_N[Math.floor(k * 14) & 3] : 'idle';
   try { scaled12(x, y, () => RL12.draw(g, fr, x, y, G.uk, true, { skin: skinOf(PP(j.inId)) })); } catch (e) {}
   T.waitDraw = (T.waitDraw || 0) + 1;
  }
 }
 // ---------- the SUB button by your bench + the picker ----------
 const UI = { open: false, mode: 'box', off: null, on: null, msg: '' };
 const BTN = { w: 26, h: 11 };
 function btnRect() {
  let wx = 0; try { wx = benchX('u') - 4 - BTN.w; } catch (e) { wx = MIDX - 134; }
  let x = Math.round(wx - camX);
  x = clamp(x, 2, W - BTN.w - 2);
  const y = H - 12;
  return { x, y, w: BTN.w, h: BTN.h };
 }
 function canSub(G) { return !offG(G) && liveScr() && !G.over && !(G.farMode === 'fo'); }
 function drawSubBtn() {
  const G = G_();
  if (!canSub(G)) return;
  const r = btnRect(), busy = S(G).jobs.some(j => j.phase !== 'done');
  hit('SUB421', r.x - 2, r.y - 3, r.w + 4, r.h + 4, () => { UI.open ? closeUI() : openUI(); }, 'SUB');
  rect(r.x, r.y + 1, r.w, r.h, '#000');
  rect(r.x, r.y, r.w, r.h, UI.open ? '#ffe14d' : busy ? '#ff9a4a' : '#2cc4dc');
  rect(r.x, r.y, r.w, 1, 'rgba(255,255,255,.35)');
  text('SUB', r.x + r.w / 2, r.y + 3, 1, '#0b1a20', 'center');
  S(G).btnFrames = (S(G).btnFrames || 0) + 1;
  S(G).btnAt = [ r.x, r.y ];
 }
 // who is who in game: jersey number + last name (+ position on the picker)
 function numG(id) { try { const G = G_(); const n = jerseyNo(PP(id), G ? src0(G) : 'real', G ? G.user : null); return n === '' || n == null ? '' : String(n); } catch (e) { return ''; } }
 function tagW(id) { const n = numG(id); return (n ? n + ' ' : '') + ln(id); }
 function lblG(id) { return tagW(id) + ' ' + POSL(posOf(id)); }
 const PICK = () => ({ x: 4, y: 14, w: W - 8, h: 128 });
 function openUI() { UI.open = true; UI.off = null; UI.on = null; UI.msg = ''; const G = G_(); if (G) S(G).opens = (S(G).opens || 0) + 1; }
 function closeUI() { UI.open = false; }
 function chip(key, x, y, w, h, lab, on, fn, dim) {
  hit(key, x, y, w, h, fn, lab);
  rect(x, y + 1, w, h, '#000');
  rect(x, y, w, h, on ? '#ffe14d' : dim ? 'rgba(40,50,60,.95)' : '#c9d6d9');
  try { if (typeof textW === 'function' && textW(lab, 1) > w - 4) textMini(lab, x + w / 2, y + Math.round((h - 3) / 2), on ? '#2a0b20' : dim ? '#7a8a95' : '#0b1a20'); else text(lab, x + w / 2, y + Math.round((h - 5) / 2), 1, on ? '#2a0b20' : dim ? '#7a8a95' : '#0b1a20', 'center'); } catch (e) {}
 }
 function drawPicker() {
  const G = G_();
  if (!UI.open || !canSub(G)) return;
  const X = 4, Y = 14, PW = W - 8, PH = 128;
  hit('SUB421 PANEL', X, Y, PW, PH, () => {}, 'SUB PANEL');
  rect(X, Y, PW, PH, 'rgba(8,12,18,.93)');
  rect(X, Y, PW, 1, '#2cc4dc');
  text('SUB', X + 6, Y + 5, 1, '#ffe14d');
  chip('SUB421 BOX', X + 28, Y + 2, 70, 12, 'FROM BOX', UI.mode === 'box', () => { UI.mode = 'box'; UI.on = null; });
  chip('SUB421 MID', X + 102, Y + 2, 82, 12, 'FROM MIDLINE', UI.mode === 'mid', () => { UI.mode = 'mid'; UI.on = UI.off ? stepFor(G, UI.off) : null; });
  chip('SUB421 X', X + PW - 22, Y + 2, 18, 12, 'X', false, closeUI);
  const live = clrNow(G) ? 'LIVE CLEAR - GAME KEEPS GOING' : 'GAME KEEPS GOING (SLOW-MO)';
  textMini(live, X + 260, Y + 6, '#9fb3bd');
  const fld = fieldIds(G);
  const row2 = UI.mode === 'box' ? benchIds(G, UI.off) : fld.filter(id => id !== UI.off && (UI.off ? (crossGrp(UI.off) === 'A' ? [ 'D', 'LSM' ] : [ 'A' ]).includes(posOf(id)) : true));
  text(UI.mode === 'box' ? 'OFF' : 'GOES OVER', X + 4, Y + 20, 1, '#ff9a8a');
  const cw = 74, ch = 14, gap = 2, x0 = X + 4;
  fld.slice(0, 10).forEach((id, i) => {
   const cx = x0 + (i % 5) * (cw + gap), cy = Y + 28 + Math.floor(i / 5) * (ch + gap);
   const has = hasBall(G, findEnt(G, id));
   chip('SUB421 OFF ' + id, cx, cy, cw, ch, lblG(id), UI.off === id, () => { UI.off = id; if (UI.mode === 'mid') UI.on = stepFor(G, id); else if (UI.on && !benchIds(G, id).includes(UI.on)) UI.on = null; });
   if (has) { rect(cx + cw - 7, cy + 5, 4, 4, '#ffffff'); rect(cx + cw - 7, cy + 5, 1, 1, '#9fb3bd'); }
  });
  text(UI.mode === 'box' ? 'ON (FROM THE BENCH)' : 'STEPS OFF AT THE BOX WHILE HE IS OVER', X + 4, Y + 62, 1, '#7dff7a');
  row2.slice(0, 10).forEach((id, i) => {
   const cx = x0 + (i % 5) * (cw + gap), cy = Y + 70 + Math.floor(i / 5) * (ch + gap);
   chip('SUB421 ON ' + id, cx, cy, cw, ch, lblG(id), UI.on === id, () => { UI.on = id; });
  });
  if (!row2.length) textMini(UI.mode === 'box' ? 'NOBODY ON THE BENCH' : 'PICK WHO GOES OVER FIRST', X + 120, Y + 76, '#9fb3bd');
  const ok = !!(UI.off && UI.on);
  chip('SUB421 GO', X + PW - 60, Y + PH - 18, 56, 15, 'GO', ok, () => { if (ok) goUI(); }, !ok);
  textMini(UI.msg || (UI.mode === 'box' ? 'HE RUNS TO THE BOX, THEN THE NEW GUY RUNS ON. MAN SHORT TILL THEN.' : 'WHILE HE IS OVER, THE OTHER GUY WAITS IN THE BOX - YOU STAY ONSIDE.'), X + 140, Y + PH - 12, '#cfe');
 }
 function goUI() {
  const G = G_();
  const j = UI.mode === 'box' ? subBox(UI.off, UI.on, 'btn') : subMid(UI.off, UI.on, 'btn');
  if (!j) { UI.msg = 'CAN\'T DO THAT SUB RIGHT NOW'; return; }
  try { addFx('cue', 0, 0, { s: UI.mode === 'box' ? 'SUB: ' + tagW(UI.off) + ' OFF, ' + tagW(UI.on) + ' ON' : 'MIDLINE: ' + tagW(UI.off) + ' GOES OVER, ' + tagW(UI.on) + ' STEPS OFF', col: '#ffe14d', life: 1.5 }); } catch (e) {}
  try { SFX.tap(); } catch (e) {}
  closeUI();
 }
 // tiny OFF / ON tags over the players in a sub, so you can see who is leaving and who is coming
 function drawTags() {
  const G = G_(); if (!G || !G.s421 || !['live', 'defense'].includes(scr())) return;
  const cj = G.s421.cpu && G.s421.cpu.job;
  if (cj && cj.e && (cj.phase === 'toBox' || cj.phase === 'on')) { const x = Math.round(cj.e.x - camX), y = Math.round(cj.e.y) - 19; if (x > -10 && x < W + 10) { rect(x - 8, y - 1, 17, 7, 'rgba(0,0,0,.65)'); textMini(cj.phase === 'on' ? 'ON' : 'OFF', x, y, '#ff9a8a'); } }
  for (const j of G.s421.jobs) {
   if (j.phase === 'done') continue;
   const tag = (id, t, c) => { const e = findEnt(G, id); if (!e) return; const n = numG(id), s = (n ? n + ' ' : '') + t, x = Math.round(e.x - camX), y = Math.round(e.y) - 19; if (x < -10 || x > W + 10) return; const w = Math.max(17, Math.round(s.length * 2.7) + 4); rect(x - Math.round(w / 2), y - 1, w, 7, 'rgba(0,0,0,.65)'); textMini(s, x, y, c); };
   if (j.kind === 'box') { if (j.phase === 'toBox' || j.phase === 'wait' || j.phase === 'boxWait') tag(j.outId, 'OFF', '#ff9a4a'); if (j.phase === 'on' || j.phase === 'onRun') tag(j.inId, 'ON', '#7dff7a'); }
   else if (j.phase === 'stepOff' || j.phase === 'inBox') { if (j.phase === 'stepOff') tag(j.stepId, 'OFF', '#ff9a4a'); tag(j.overId, 'OVER', '#ffe14d'); }
  }
 }
 const DC0 = W0.drawChirpBtn;
 W0.drawChirpBtn = function () {
  try { if (!off()) { drawTags(); drawSubBtn(); drawPicker(); } } catch (e) { er(e); }
  return DC0.apply(this, arguments);
 };
 // ---------- timeout panel: the old way still edits your lineup; live subs point to the bench button ----------
 if (typeof W0.renderTimeout === 'function') {
  const RT0 = W0.renderTimeout;
  W0.renderTimeout = function () {
   let h = RT0.apply(this, arguments);
   try { if (!off() && typeof h === 'string') h = h.replace('<span class="note">ON THE FIELD:', '<span class="note">LIVE SUBS: TAP SUB BY YOUR BENCH. ON THE FIELD:'); } catch (e) { er(e); }
   return h;
  };
 }

 // ---------- PLAYMAKER: SUBS ARE DRAWN RUNS from / to the sideline bench + the sub box (play.sub421) ----------
 // SUB (top bar) turns SUB MODE on: your bench stands on the sideline (number + name), the sub box is marked at midfield.
 //  - tap (or drag from) a guy on the field and run him INTO THE BOX = he comes off (OFF run, at the OFF @ time)
 //  - tap a bench guy, then drag / tap where he runs = he comes on FROM THE BOX (ON run). A bench guy only goes on after
 //    someone went off (never 11): his run pairs with the first OFF run that has nobody coming on yet.
 //  - quick: bench guy + tap a field guy = that guy runs off, the bench guy runs on to his spot.
 // A step stays {v:1, mode:'box', at, team, src, off:{id,pos}, on:{id,pos}, dot} (+ optional offPath, onPath, onAt, drawn).
 // Old steps (no paths) still load, draw and run.  Kill: __rl_no421pm (playmaker part), __rl_no421s (everything).
 const offPM = () => off() || !!W0.__rl_no421pm;
 const PMS = { open: false, mode: 'box', off: null, on: null, at: 0, msg: '', sel: null, dr: null, pick: -1, ops: [], tGuard: -9, warn: '', supp: [], hits: 0 };
 const AT = [ 0, 1, 2, 3, 5 ], ONAT = [ null, 1, 2, 3, 5, 8 ];
 const nowS = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
 function pmTeam() {
  let id = null, src = 'real', lu = null;
  try {
   const G = G_();
   if (G && G.user) { id = G.user; src = src0(G); lu = G.lu && G.lu[0] ? JSON.parse(JSON.stringify(G.lu[0])) : null; }
   else if (typeof menuSel !== 'undefined' && menuSel.mode === 'season' && season && season.team) { id = season.team; src = 'season'; }
   else id = typeof menuSel !== 'undefined' ? menuSel.team : null;
   if (!lu && id && typeof lineupFor === 'function') lu = lineupFor(id, src);
  } catch (e) { er(e); }
  return { id, src, lu };
 }
 function pmCatNow() { try { return pmCat(PM.play); } catch (e) { return 'OFFENSE'; } }
 // the players on the field for this kind of play, in the order of the editor's dots
 function catField(cat, lu) {
  if (!lu) return [];
  const A = lu.A || [], M = lu.M || [], D = lu.D || [];
  let ids;
  if (cat === 'CLEAR') ids = W0.__rl_no427pm ? [ lu.G, D[0], D[1], D[2], lu.SSDM, lu.LSM, lu.SSDM2, A[0], A[1], A[2] ] : [ lu.G, D[0], D[1], D[2], lu.SSDM, lu.SSDM2, lu.LSM || (M.find(x => x && x !== lu.SSDM && x !== lu.SSDM2) || null), A[0], A[1], A[2] ]; // V42.7: dot 6 = LSM (no LSM = the 3rd middie)
  else if (cat === 'RIDES') ids = [ lu.G, D[0], D[1], D[2], M[0], M[1], M[2], A[0], A[1], A[2] ];
  else if (cat === 'D') ids = [ lu.SSDM, lu.LSM, lu.SSDM2, D[0], D[1], D[2], lu.G ];
  else ids = [ M[0], M[1], M[2], A[0], A[1], A[2] ];
  return ids.map((id, dot) => ({ id, dot, pos: posOf(id) })).filter(o => o.id && PP(o.id));
 }
 function pmLists() {
  const tm = pmTeam(), cat = pmCatNow(), all = catField(cat, tm.lu), fld = all.filter(o => o.pos !== 'G');
  let ros = [];
  try { ros = teamRosterIds(tm.id, tm.src) || []; } catch (e) {}
  const onF = new Set(all.map(o => o.id));
  const bench = ros.filter(id => PP(id) && !onF.has(id) && PP(id).pos !== 'G');
  return { tm, cat, fld, bench, all };
 }
 function pmSteps() { const pl = PM && PM.play; if (!pl) return []; if (!Array.isArray(pl.sub421)) pl.sub421 = []; return pl.sub421; }
 function numOf(id, tm) { try { const n = jerseyNo(PP(id), tm ? tm.src : 'real', tm ? tm.id : null); return n === '' || n == null ? '' : String(n); } catch (e) { return ''; } }
 function who(id, tm) { const n = numOf(id, tm); return (n ? n + ' ' : '') + ln(id); }
 function stepLabel(st) {
  const tm = { id: st.team, src: st.src || 'real' };
  if (st.mode === 'mid') return POSL(st.off.pos) + ' ' + who(st.off.id, tm) + ' OVER, ' + (st.on ? POSL(st.on.pos) + ' ' + who(st.on.id, tm) : '?') + ' STEPS OFF AT +' + (st.at || 0) + 'S';
  return who(st.off.id, tm) + ' ' + POSL(st.off.pos) + ' OFF +' + (st.at || 0) + 'S, ' + (st.on ? who(st.on.id, tm) + ' ' + POSL(st.on.pos) + ' ON' + (st.onAt != null ? ' +' + st.onAt + 'S' : '') : 'NOBODY ON YET');
 }
 function w2s(x, y) {
  let pv = null;
  try { pv = typeof pmView === 'function' ? pmView() : null; } catch (e) {}
  return pv ? [ pv.ox + x * pv.k, pv.oy + y * pv.k ] : [ x - Math.round(camX), y ];
 }
 const VK = () => { try { const v = pmView(); return v ? v.k : 1; } catch (e) { return 1; } };
 // ---- where a dot is at play time T (same math as the editor's stages) ----
 function pAt(path, t) {
  if (!path || !path.length) return null;
  if (t <= path[0][0]) return [ path[0][1], path[0][2] ];
  const Lp = path[path.length - 1];
  if (t >= Lp[0]) return [ Lp[1], Lp[2] ];
  let lo = 0, hi = path.length - 1;
  while (hi - lo > 1) { const m = lo + hi >> 1; if (path[m][0] <= t) lo = m; else hi = m; }
  const p = path[lo], q = path[hi], f = (t - p[0]) / (q[0] - p[0] || 1);
  return [ p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f ];
 }
 function sDur(st) { let m = 0; for (const k in st) { const p = st[k]; if (p && p.length) m = Math.max(m, p[p.length - 1][0]); } return m; }
 function posAt(i, T) {
  const pl = PM && PM.play, d = PM && PM.pd42;
  let pos = pl && pl.start && pl.start[i] ? pl.start[i].slice() : [ MIDX, CY ];
  if (!d || !Array.isArray(d.stages)) return pos;
  let n = d.stages.length; while (n > 0 && !Object.keys(d.stages[n - 1] || {}).length) n--;
  let s = 0;
  for (let k = 0; k < n; k++) { const st = d.stages[k], dur = sDur(st), p = st[i]; if (p && p.length) { if (T < s) return pos; pos = pAt(p, T - s); } s += dur; }
  return pos;
 }
 const BOXW = () => [ MIDX - 8, FB - 2 ];
 const nearBox = (w, r) => Math.hypot(w.x - BOXW()[0], w.y - BOXW()[1]) < (r || 20);
 const cl = (x, y) => [ Math.round(clamp(x, 8, FL - 8)), Math.round(clamp(y, FT + 6, FB - 2)) ];
 function thin(pts) { // keep the shape, drop the noise: a point every ~7 units, at most 16
  const out = [ pts[0] ];
  for (let i = 1; i < pts.length; i++) { const L0 = out[out.length - 1]; if (Math.hypot(pts[i][0] - L0[0], pts[i][1] - L0[1]) >= 7) out.push(pts[i]); }
  const last = pts[pts.length - 1], L1 = out[out.length - 1];
  if (L1 !== last && Math.hypot(last[0] - L1[0], last[1] - L1[1]) > 1) out.push(last);
  while (out.length > 16) { for (let i = out.length - 2; i > 0 && out.length > 16; i -= 2) out.splice(i, 1); }
  return out.map(q => cl(q[0], q[1]));
 }
 function d42() { return PM && PM.pd42 || null; }
 function shapeCat() { const c = pmCatNow(); try { return c === 'D' || c === 'RIDES' || (c === 'CLEAR' && !(W0.V420C && V420C.pm && V420C.pm())); } catch (e) { return false; } }
 function subbedOff() { const s = new Set; for (const st of pmSteps()) if (st && st.off) s.add(st.off.id); return s; }
 function wentOn() { const s = new Set; for (const st of pmSteps()) if (st && st.on) s.add(st.on.id); return s; }
 function benchNow(L) { const on = wentOn(), offs = subbedOff(); return L.bench.filter(id => !on.has(id) && !offs.has(id)); }
 function say(s, t) { PMS.msg = s; PMS.msgT = nowS() + (t || 2.6); }
 function guard() { PMS.tGuard = nowS(); }
 // field guy under a world point (his spot at the OFF @ time, or where he stands)
 function fieldAt(w, L) {
  let best = null, bd = VK() < 1 ? 18 : 14;
  const offs = subbedOff();
  for (const o of L.fld) {
   if (offs.has(o.id)) continue;
   for (const q of [ posAt(o.dot, PMS.at), PM.play.start[o.dot] ]) { if (!q) continue; const dd = Math.hypot(q[0] - w.x, q[1] - 6 - w.y); if (dd < bd) { bd = dd; best = o; } }
  }
  return best;
 }
 function stepTagAt(w) {
  const S2 = pmSteps(), k = VK();
  for (let i = S2.length - 1; i >= 0; i--) {
   const st = S2[i], ps = tagPts(st);
   for (const q of ps) if (q && Math.hypot(q[0] - w.x, q[1] - w.y) < 14 / Math.max(.6, k)) return i;
  }
  return -1;
 }
 function offStart(st) { return st.dot != null && PM.play.start[st.dot] ? posAt(st.dot, +st.at || 0) : null; }
 function offPts(st) { const s0 = offStart(st); if (!s0) return null; const p = Array.isArray(st.offPath) && st.offPath.length > 1 ? st.offPath.slice(1) : [ BOXW() ]; return [ s0 ].concat(p); }
 function onPts(st) {
  if (!st.on) return null;
  if (Array.isArray(st.onPath) && st.onPath.length > 1) return st.onPath;
  const s0 = offStart(st); // old steps: he takes the spot of the guy he replaced
  return s0 ? [ BOXW(), s0 ] : null;
 }
 function tagPts(st) { const a = offPts(st), b = onPts(st); return [ a && a[0], b && b[b.length - 1] ]; }
 // ---- making runs ----
 function newStep(o, L) {
  return { v: 1, mode: 'box', at: PMS.at, team: L.tm.id, src: L.tm.src, off: { id: o.id, pos: o.pos || posOf(o.id) }, on: null, dot: o.dot, drawn: 1 };
 }
 function offRun(o, pts, L) {
  const S2 = pmSteps();
  let i = S2.findIndex(s => s && s.off && s.off.id === o.id);
  let st = i >= 0 ? S2[i] : null;
  if (!st) { if (S2.length >= 6) { say('6 SUBS IS THE MOST FOR ONE PLAY'); return null; } st = newStep(o, L); S2.push(st); i = S2.length - 1; PMS.ops.push({ st, part: 'off' }); }
  const s0 = posAt(o.dot, +st.at || 0);
  const body = pts.slice(1, -1).filter(q => Math.hypot(q[0] - s0[0], q[1] - s0[1]) > 4);
  st.offPath = thin([ s0 ].concat(body, [ BOXW() ]));
  PMS.pick = i; PMS.sel = null;
  say(who(o.id, L.tm) + ' RUNS OFF AT ' + (st.at ? '+' + st.at + 'S' : 'THE START') + (st.on ? '' : ' - NOW TAP WHO GOES ON (BENCH)'), 3);
  check(L);
  lg({ ev: 'pmOff', id: o.id, at: st.at, n: st.offPath.length });
  return st;
 }
 function onRun(id, pts, L) {
  const S2 = pmSteps();
  let i = S2.findIndex(s => s && s.off && !s.on);
  if (i < 0) {
   const j = S2.findIndex(s => s && s.on && s.on.id === id);
   if (j >= 0) i = j; // redraw his run
   else { say('TAKE SOMEONE OFF FIRST: RUN A GUY INTO THE BOX. NEVER 11 ON THE FIELD', 3); try { SFX.bad(); } catch (e) {} PMS.warnN = (PMS.warnN || 0) + 1; return null; }
  }
  const st = S2[i], had = !!st.on;
  st.on = { id, pos: posOf(id) };
  const b = BOXW(), body = pts.filter(q => Math.hypot(q[0] - b[0], q[1] - b[1]) > 6);
  st.onPath = thin([ b ].concat(body.length ? body : [ [ b[0] + 10, b[1] - 20 ] ]));
  if (!had) PMS.ops.push({ st, part: 'on' });
  PMS.pick = i; PMS.sel = null;
  say(who(id, L.tm) + ' COMES ON FROM THE BOX WHEN ' + who(st.off.id, L.tm) + ' IS OFF', 3);
  check(L);
  lg({ ev: 'pmOn', id, off: st.off.id, n: st.onPath.length });
  return st;
 }
 function quickSub(o, id, L) {
  const st = offRun(o, [ posAt(o.dot, PMS.at), BOXW() ], L);
  if (!st) return;
  let dest = posAt(o.dot, 999);
  if (st.on && st.on.id !== id) { say(who(o.id, L.tm) + ' ALREADY HAS ' + who(st.on.id, L.tm) + ' COMING ON'); return; }
  onRun(id, [ BOXW(), dest ], L);
 }
 // never more than 10, offside at the end of the play (full-field plays: 4 back incl. the goalie, 3 over)
 function check(L) {
  PMS.warn = '';
  const S2 = pmSteps();
  for (const st of S2) if (st && st.on && st.onAt != null && st.onAt < (+st.at || 0)) { st.onAt = null; PMS.warn = 'ON GUY CAN\'T GO BEFORE THE OFF GUY - SET TO WHEN HE IS OFF'; }
  const pend = S2.filter(s => s && s.off && !s.on);
  if (pend.length) PMS.warn = who(pend[0].off.id, L.tm) + ' HAS NOBODY COMING ON (THAT SUB WON\'T RUN)';
  let pf = false; try { pf = pmFull(L.cat); } catch (e) {}
  if (!pf) return PMS.warn;
  const end = {};
  for (const o of L.all) end[o.dot] = posAt(o.dot, 999);
  for (const st of S2) { if (!st || st.dot == null) continue; const p = onPts(st); end[st.dot] = st.on && p ? p[p.length - 1] : null; }
  let back = 0, up = 0;
  for (const k in end) { const q = end[k]; if (!q) continue; if (q[0] < MIDX) back++; else up++; }
  PMS.cnt = { back, up };
  if (back < 4) PMS.warn = 'OFFSIDE AT THE END: ONLY ' + back + ' BACK (NEED 4 WITH THE GOALIE)';
  else if (up < 3) PMS.warn = 'OFFSIDE AT THE END: ONLY ' + up + ' OVER MIDFIELD (NEED 3)';
  return PMS.warn;
 }
 function pmUndoSub() {
  guard();
  if (PMS.dr) { PMS.dr = null; return; }
  if (PMS.sel) { PMS.sel = null; return; }
  const S2 = pmSteps();
  let op = PMS.ops.pop();
  while (op && !S2.includes(op.st)) op = PMS.ops.pop();
  if (op && op.part === 'on') { op.st.on = null; delete op.st.onPath; delete op.st.onAt; say('UNDO: ON RUN REMOVED'); }
  else if (op) { S2.splice(S2.indexOf(op.st), 1); say('UNDO: SUB REMOVED'); }
  else if (S2.length) { S2.pop(); say('UNDO: LAST SUB REMOVED'); }
  else say('NO SUBS TO UNDO');
  PMS.pick = -1; check(pmLists());
 }
 function pmClearSubs() { guard(); const S2 = pmSteps(); const n = S2.length; S2.length = 0; PMS.ops = []; PMS.pick = -1; PMS.sel = null; say(n ? 'ALL SUBS REMOVED (YOUR PLAY IS UNTOUCHED)' : 'NO SUBS ON THIS PLAY'); check(pmLists()); }
 function delPick() { guard(); const S2 = pmSteps(); if (PMS.pick < 0 || !S2[PMS.pick]) return; S2.splice(PMS.pick, 1); PMS.pick = -1; say('SUB DELETED'); check(pmLists()); }
 function setMode(on) {
  guard();
  const d = d42();
  if (on && d && d.phase === 'play') { say('FINISH THE BALL PART FIRST, THEN ADD SUBS'); if (d) { d.msg = PMS.msg; d.flash = 1.4; } return; }
  PMS.open = !!on; PMS.sel = null; PMS.dr = null; if (!on) PMS.pick = -1;
  if (on) { PMS.pick = -1; say('SUB MODE: RUN A GUY INTO THE BOX = OFF. TAP A BENCH GUY + RUN HIM ON', 4); check(pmLists()); }
  else if (d) { d.msg = pmSteps().length ? pmSteps().length + ' SUB' + (pmSteps().length > 1 ? 'S' : '') + ' ON THIS PLAY' : ''; d.flash = 1.2; }
 }
 // ---- touch / mouse on the field while SUB MODE is on (the editor's own runs are left alone) ----
 function sDown(pt) {
  const d = d42();
  if (d && d.pv) return;
  const w = pmWorld(pt), L = pmLists();
  PMS.dr = { id: pt.id, pts: [ [ w.x, w.y ] ], f: fieldAt(w, L), box: nearBox(w), w0: w };
 }
 function sMove(pt) {
  const D = PMS.dr; if (!D || D.id !== pt.id) return;
  const w = pmWorld(pt), Lq = D.pts[D.pts.length - 1];
  if (Math.hypot(w.x - Lq[0], w.y - Lq[1]) >= 2) D.pts.push([ w.x, w.y ]);
 }
 function sUp(pt, cancel) {
  const D = PMS.dr; PMS.dr = null; guard();
  if (!D || cancel || D.id !== pt.id) return;
  const L = pmLists(), w = pmWorld(pt), tapPx = typeof TAP_PX !== 'undefined' ? TAP_PX : 20;
  const span = D.pts.reduce((m, q) => Math.max(m, Math.hypot(q[0] - D.w0.x, q[1] - D.w0.y)), 0);
  const tap = (pt.moved == null ? span < 6 : pt.moved < tapPx) && span < 10;
  const sel = PMS.sel;
  if (tap) {
   const ti = stepTagAt(w);
   const f = fieldAt(w, L);
   if (sel && sel.k === 'on' && f) { quickSub(f, sel.id, L); return; }
   if (sel && sel.k === 'off' && nearBox(w, 22)) { offRun(sel.o, [ posAt(sel.o.dot, PMS.at), BOXW() ], L); return; }
   if (f) { PMS.sel = sel && sel.k === 'off' && sel.o.id === f.id ? null : { k: 'off', o: f }; PMS.pick = -1; if (PMS.sel) say(who(f.id, L.tm) + ' ' + POSL(f.pos) + ': DRAG HIM INTO THE BOX (OR TAP THE BOX), OR TAP A BENCH GUY TO SWAP', 4); return; }
   if (sel && sel.k === 'on') { onRun(sel.id, [ BOXW(), cl(w.x, w.y + 6) ], L); return; }
   if (ti >= 0) { PMS.pick = ti === PMS.pick ? -1 : ti; PMS.sel = null; if (PMS.pick >= 0) say('SUB ' + (ti + 1) + ': ' + stepLabel(pmSteps()[ti]) + ' - CHANGE THE TIME UP TOP OR DEL', 4); return; }
   if (sel && sel.k === 'off') { say('TAP THE SUB BOX (OR DRAG HIM INTO IT) TO TAKE HIM OFF'); return; }
   PMS.sel = null; PMS.pick = -1;
   return;
  }
  const pts = D.pts.map(q => [ q[0], q[1] + 6 ]); // finger = his feet
  const endW = { x: D.pts[D.pts.length - 1][0], y: D.pts[D.pts.length - 1][1] };
  const runner = D.f || (sel && sel.k === 'off' ? sel.o : null);
  if (runner && !(sel && sel.k === 'on' && !D.f)) {
   if (nearBox(endW, 26)) { offRun(runner, pts, L); return; }
   say('END HIS RUN IN THE SUB BOX TO TAKE HIM OFF (HIS NORMAL RUNS: TAP DONE)', 3); PMS.sel = { k: 'off', o: runner }; return;
  }
  if (sel && sel.k === 'on') { onRun(sel.id, pts, L); return; }
  say('TAP A GUY ON THE FIELD OR ON THE BENCH FIRST');
 }
 for (const nm of [ 'pmDown', 'pmMove', 'pmUp' ]) {
  const F0 = W0[nm];
  W0[nm] = function (pt, cancel) {
   if (!offPM() && PMS.open && scr() === 'playmaker' && PM) {
    try { if (nm === 'pmDown') sDown(pt); else if (nm === 'pmMove') sMove(pt); else sUp(pt, cancel); } catch (e) { er(e); }
    return;
   }
   return F0.apply(this, arguments);
  };
 }
 // ---- the wipe bug: taps must never fall through to the editor's category tabs (they make a NEW play) ----
 // cause: the old SUB panel's X sat exactly on the SETS tab (SETS = switch to OFFENSE + new play) and the panel's
 // buttons only beat the tabs when they were created after them. Now: in SUB MODE the tabs / stage buttons are not
 // there at all, a tab tap right after any sub tap is ignored, and sub buttons are kept on top of the others.
 const SUPP = /^(TAB .*|GHOST .*|START STAGE.*|GO TO STAGE.*|ADD BALL|START PLAY|DONE)$/;
 const HIT0 = W0.hit;
 W0.hit = function (key, x, y, w, h, fn, label) {
  try {
   if (!off()) {
    const k = String(key);
    if (!offPM() && PMS.open && PM && scr() === 'playmaker') {
     if (SUPP.test(k)) { PMS.supp.push([ x, y, w, h ]); return; }
     if (y > 120 && !/421/.test(k)) PMS.botX = Math.min(PMS.botX0 == null ? W : PMS.botX0, x), PMS.botX0 = PMS.botX;
     if (k === 'UNDO') fn = pmUndoSub;
     else if (k === 'CLEAR') { fn = pmClearSubs; PMS.clrBtn = [ x, y, w, h ]; }
    }
    if (UI.open && !/421/.test(k) && liveScr()) { const P = PICK(); if (x < P.x + P.w && x + w > P.x && y < P.y + P.h && y + h > P.y) return; }
   }
  } catch (e) { er(e); }
  return HIT0.call(this, key, x, y, w, h, fn, label);
 };
 if (typeof W0.pmSetCat === 'function') {
  const SC0 = W0.pmSetCat;
  W0.pmSetCat = function (c) {
   try { if (!offPM() && scr() === 'playmaker' && (PMS.open || nowS() - PMS.tGuard < .8)) { PMS.blockedTab = (PMS.blockedTab || 0) + 1; lg({ ev: 'tabBlocked', c }); return false; } } catch (e) {}
   return SC0.apply(this, arguments);
  };
 }
 if (typeof W0.syncUI === 'function') {
  const SU0 = W0.syncUI;
  W0.syncUI = function () {
   const r = SU0.apply(this, arguments);
   try {
    if (!off() && (PMS.open || UI.open)) {
     const box = document.getElementById('ui');
     if (box) {
      let mine = false, need = false;
      for (const el of box.children) { const o = /421/.test(el.dataset && el.dataset.k || ''); if (o) mine = true; else if (mine) { need = true; break; } }
      if (need) { for (const el of [ ...box.children ].filter(el => /421/.test(el.dataset && el.dataset.k || ''))) box.appendChild(el); PMS.hoist = (PMS.hoist || 0) + 1; }
     }
    }
   } catch (e) { er(e); }
   return r;
  };
 }
 // ---- drawing ----
 function dash(pts, col, ph) {
  if (!pts || pts.length < 2) return;
  let acc = ph || 0;
  for (let i = 1; i < pts.length; i++) {
   const a = w2s(pts[i - 1][0], pts[i - 1][1] - 2), b = w2s(pts[i][0], pts[i][1] - 2), L0 = Math.hypot(b[0] - a[0], b[1] - a[1]);
   for (let u = 0; u < L0; u += 1) { if (Math.floor((acc + u) / 3) % 2 === 0) px(Math.round(a[0] + (b[0] - a[0]) * u / L0), Math.round(a[1] + (b[1] - a[1]) * u / L0), col); }
   acc += L0;
  }
  const e = w2s(pts[pts.length - 1][0], pts[pts.length - 1][1] - 2);
  rect(Math.round(e[0]) - 1, Math.round(e[1]) - 1, 3, 3, col);
 }
 function tag(x, y, s, bg, fg) {
  const w = Math.max(14, Math.round(s.length * 2.7) + 4);
  rect(Math.round(x - w / 2), Math.round(y), w, 6, bg);
  textMini(s, Math.round(x), Math.round(y) + 1.5, fg || '#0b1a20');
 }
 function drawBox() {
  const b = w2s(BOXW()[0], BOXW()[1]), x = Math.round(b[0]), y = Math.round(b[1]);
  rect(x - 9, y - 4, 18, 9, 'rgba(255,225,77,.18)');
  rect(x - 9, y - 4, 18, 1, '#ffe14d'); rect(x - 9, y + 4, 18, 1, '#ffe14d'); rect(x - 9, y - 4, 1, 9, '#ffe14d'); rect(x + 8, y - 4, 1, 9, '#ffe14d');
  textMini('SUB BOX', x, y - 1, '#ffe14d');
 }
 function drawSteps(L) {
  const S2 = pmSteps(), d = d42(), pv = d && d.pv;
  if (!S2.length && !PMS.open) return;
  drawBox();
  if (pv) return drawPreviewTags(L);
  S2.forEach((st, i) => {
   if (!st || !st.off) return;
   const hl = i === PMS.pick, a = offPts(st), b = onPts(st);
   if (a) dash(a, hl ? '#ffe14d' : '#ff9a4a');
   if (b) dash(b, hl ? '#ffe14d' : '#7dff7a');
   const ty = y => Math.max(41, Math.round(y));
   let sa = null;
   if (a) { const s = w2s(a[0][0], a[0][1]); sa = [ s[0], ty(s[1] - 30) ]; tag(sa[0], sa[1], 'OFF ' + who(st.off.id, L.tm) + (st.at ? ' +' + st.at + 'S' : ''), hl ? '#ffe14d' : '#ff9a4a'); }
   if (b) { const e = w2s(b[b.length - 1][0], b[b.length - 1][1]); let y = ty(e[1] - 30); if (sa && Math.abs(sa[0] - e[0]) < 40 && Math.abs(sa[1] - y) < 7) y = sa[1] + 7; tag(e[0], y, 'ON ' + who(st.on.id, L.tm) + (st.onAt != null ? ' +' + st.onAt + 'S' : ''), hl ? '#ffe14d' : '#7dff7a'); }
   else if (a && PMS.open) { const s = w2s(BOXW()[0], BOXW()[1]); tag(s[0], s[1] - 14 - i * 7, 'WHO GOES ON?', '#ff8a7a'); }
  });
 }
 // the preview (PREVIEW button): the guy jogs off his drawn path to the box, the new guy comes out and runs his
 function tl(pts, t0, v) { const out = [ [ t0, pts[0][0], pts[0][1] ] ]; let t = t0; for (let i = 1; i < pts.length; i++) { t += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) / v; out.push([ t, pts[i][0], pts[i][1] ]); } return out; }
 function fAt(F, i, t) { let k = 0; while (k < F.length - 1 && F[k + 1][0] <= t) k++; const a = F[k], b = F[Math.min(F.length - 1, k + 1)], f = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0]), 0, 1) : 0; return [ a[1][i][0] + (b[1][i][0] - a[1][i][0]) * f, a[1][i][1] + (b[1][i][1] - a[1][i][1]) * f ]; }
 function subEvents(P) {
  const v = VRUN(), ev = [];
  for (const st of pmSteps()) {
   if (!st || !st.off || st.dot == null || !P.frames[0][1][st.dot]) continue;
   const t0 = +st.at || 0, p0 = fAt(P.frames, st.dot, t0), op = offPts(st);
   const offTL = tl([ p0 ].concat(op ? op.slice(1) : [ BOXW() ]), t0, v), tArr = offTL[offTL.length - 1][0];
   let onTL = null, tOn = null;
   const np = onPts(st);
   if (st.on && np) { tOn = Math.max(tArr, st.onAt != null ? +st.onAt : tArr); onTL = tl(np, tOn, v); }
   ev.push({ st, t0, tArr, tOn, offTL, onTL, tEnd: onTL ? onTL[onTL.length - 1][0] : tArr });
  }
  return ev;
 }
 function subPlay(d) {
  const P = d.play; if (!P || !Array.isArray(P.frames) || !P.frames.length || !pmSteps().length) return null;
  const key = JSON.stringify(pmSteps()) + '|' + P.T + '|' + P.frames.length + '|' + JSON.stringify(PM.play.start);
  if (PMS.pvKey === key && PMS.pvBase === P) return PMS.pvPlay;
  if (!W0.__rl_no427pm && P.sub427 && P.sub427 === JSON.stringify(pmSteps())) { if (PMS.pvBase !== P) { PMS.pvEv = subEvents(P); PMS.pvBase = P; PMS.pvKey = null; PMS.pvPlay = null; } return null; } // V42.7: recorded with the subs in it
  const ev = subEvents(P); if (!ev.length) return null;
  const F = JSON.parse(JSON.stringify(P.frames));
  let T = P.T; for (const e of ev) T = Math.max(T, e.tEnd + .4);
  let last = F[F.length - 1];
  while (last[0] < T - 1e-6) { const f = JSON.parse(JSON.stringify(last)); f[0] = Math.round(Math.min(T, last[0] + .1) * 100) / 100; F.push(f); last = f; }
  for (const f of F) for (const e of ev) {
   const t = f[0], i = e.st.dot; if (t < e.t0) continue;
   const q = t <= e.tArr ? pAt(e.offTL, t) : !e.onTL || t < e.tOn ? BOXW() : pAt(e.onTL, t);
   f[1][i] = [ Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10 ];
  }
  PMS.pvKey = key; PMS.pvBase = P; PMS.pvEv = ev;
  PMS.pvPlay = { T: Math.round(T * 100) / 100, frames: F, passes: P.passes, car0: P.car0 };
  return PMS.pvPlay;
 }
 function drawPreviewTags(L) {
  const d = d42(); if (!d || !d.pv || !PMS.pvEv || PMS.pvBase !== d.play && PMS.pvPlay !== d.play) return;
  const t = Math.max(0, d.pv.t), kit = kitNow();
  for (const e of PMS.pvEv) {
   const st = e.st;
   if (t >= e.t0 && t <= e.tArr + .3) { const q = pAt(e.offTL, t), s = w2s(q[0], q[1]); tag(s[0], s[1] - 30, 'OFF ' + who(st.off.id, L.tm), '#ff9a4a'); }
   if (st.on && e.onTL && t >= e.t0 && t < e.tOn) { const s = w2s(BOXW()[0] + 6, BOXW()[1]); mini(s[0], s[1], kit, .55); tag(s[0], s[1] - 18, who(st.on.id, L.tm), '#7dff7a'); }
   if (st.on && e.onTL && t >= e.tOn && t <= e.tEnd + 1.2) { const q = pAt(e.onTL, t), s = w2s(q[0], q[1]); tag(s[0], s[1] - 30, 'ON ' + who(st.on.id, L.tm), '#7dff7a'); }
  }
  PMS.pvDrawn = (PMS.pvDrawn || 0) + 1;
 }
 function kitNow() { try { return game ? game.uk : { jersey: '#2cc4dc', trim: '#111111', helm: '#2cc4dc' }; } catch (e) { return { jersey: '#2cc4dc', trim: '#111111', helm: '#2cc4dc' }; } }
 function mini(x, y, kit, s) { try { g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(s, s); drawPlayer({ x: 0, y: 0, anim: 0 }, kit, true); g.restore(); } catch (e) { try { g.restore(); } catch (x2) {} rect(x - 2, y - 8, 5, 8, kit.jersey || '#2cc4dc'); } }
 // the bench: full-field plays = a strip under the field; half-field plays = two columns on the empty half by midfield
 function botY() { try { return H - 17 - (typeof sa2403Dy === 'function' ? sa2403Dy(H - 17, 17) : 0); } catch (e) { return H - 17; } }
 function benchArea() {
  if (pmView()) return { x: 2, y: 137, w: Math.max(120, (PMS.botX || W) - 6), h: Math.max(18, Math.min(30, botY() + 15 - 137)) };
  return { x: 0, y: 32, w: Math.min(w2s(MIDX, CY)[0] - 4, 110), h: botY() - 34 };
 }
 function benchSlots(n) {
  const out = [], A = benchArea();
  if (pmView()) {
   const bx = w2s(BOXW()[0], BOXW()[1])[0], gap0 = bx - 12, gap1 = bx + 12, inGap = gap1 > A.x && gap0 < A.x + A.w;
   const span = A.w - (inGap ? gap1 - gap0 : 0), sw = Math.max(17, Math.min(40, span / Math.max(1, n)));
   let x = A.x;
   for (let i = 0; i < n; i++) { if (inGap && x + sw > gap0 && x < gap1) x = gap1; if (x + sw > A.x + A.w + .5) break; out.push({ x: x, y: A.y, w: sw - 1, h: A.h, row: 1 }); x += sw; }
  } else {
   const cw = Math.floor((A.w - 2) / 2), rh = 17;
   for (let i = 0; i < n; i++) { const c = i % 2, r = Math.floor(i / 2), y = A.y + 1 + r * rh; if (y + rh > A.y + A.h + 1) break; out.push({ x: 2 + c * cw, y, w: cw - 1, h: rh - 1, row: 0 }); }
  }
  return out;
 }
 function drawBench(L) {
  const ids = benchNow(L), sl = benchSlots(ids.length), kit = kitNow();
  const A = benchArea();
  rect(A.x - 2, A.y - 1, A.w + 4, A.h + 2, pmView() ? '#080c11' : 'rgba(6,10,14,.8)'); rect(A.x - 2, A.y - 1, A.w + 4, 1, 'rgba(255,255,255,.25)');
  if (pmView()) textMini('BENCH', A.x + 12, A.y - 4.5, '#9fb3bd');
  sl.forEach((s, i) => {
   const id = ids[i], on = PMS.sel && PMS.sel.k === 'on' && PMS.sel.id === id, n = numOf(id, L.tm), nm = ln(id);
   hit('SB421 B ' + id, s.x, s.y, s.w, s.h, () => { guard(); PMS.pick = -1; PMS.sel = on ? null : { k: 'on', id }; const Lb = pmLists(); if (!on) { if (PMS.selPrev && PMS.selPrev.k === 'off') {} say(who(id, Lb.tm) + ' ' + POSL(posOf(id)) + ': DRAG WHERE HE RUNS ON (FROM THE BOX), OR TAP THE GUY HE REPLACES', 4); } }, 'BENCH ' + (n ? n + ' ' : '') + nm);
   if (on) rect(s.x, s.y, s.w, s.h, 'rgba(255,225,77,.35)');
   if (s.row) {
    text(n ? n : '?', s.x + s.w / 2 - 3, s.y + 1, 1, on ? '#ffe14d' : '#ffffff', 'center');
    textMini(POSL(posOf(id)), s.x + s.w / 2 + 8, s.y + 2, '#8fe3f0');
    mini(s.x + s.w / 2, s.y + s.h - 6, kit, .45);
    textMini(nm.slice(0, Math.max(3, Math.floor((s.w - 1) / 2.7))), s.x + s.w / 2, s.y + s.h - 4.5, on ? '#ffe14d' : '#cfe');
   } else {
    mini(s.x + 5, s.y + s.h - 1, kit, .45);
    text((n ? n : '') + ' ' + POSL(posOf(id)), s.x + 11, s.y + 2, 1, on ? '#ffe14d' : '#ffffff');
    textMini(nm.slice(0, Math.floor((s.w - 12) / 2.7)), s.x + 11 + Math.min(nm.length, Math.floor((s.w - 12) / 2.7)) * 1.35, s.y + 10, on ? '#ffe14d' : '#cfe');
   }
  });
  if (ids.length > sl.length) textMini('+' + (ids.length - sl.length) + ' MORE', A.x + A.w - 14, A.y + (pmView() ? -4.5 : A.h - 4), '#9fb3bd');
  if (!ids.length) textMini('NOBODY LEFT ON THE BENCH', A.x + A.w / 2, A.y + A.h / 2, '#9fb3bd');
  PMS.benchN = sl.length;
 }
 function chipS(key, x, y, w, h, lab, on, fn, dim) { chip(key, x, y, w, h, lab, on, () => { guard(); fn(); }, dim); }
 function drawToolbar(L) {
  rect(0, 17, W, 14, 'rgba(11,15,20,.97)');
  const S2 = pmSteps(), pk = PMS.pick >= 0 ? S2[PMS.pick] : null;
  let x = 3;
  text('OFF', x, 21, 1, '#ff9a4a'); x += 14;
  AT.forEach(a => { const cur = pk ? (+pk.at || 0) : PMS.at; chipS('PM421 AT ' + a, x, 18, 22, 11, a ? '+' + a : 'GO', cur === a, () => { PMS.at = a; if (pk) { pk.at = a; if (pk.offPath && pk.dot != null) pk.offPath[0] = cl(...posAt(pk.dot, a)); check(pmLists()); say('OFF AT ' + (a ? '+' + a + 'S' : 'THE START')); } }); x += 23; });
  x += 4;
  const okOn = !!(pk && pk.on);
  text('ON', x, 21, 1, okOn ? '#7dff7a' : '#56606a'); x += 10;
  ONAT.forEach(a => { const v = okOn ? pk.onAt : undefined, lab = a == null ? 'BOX' : '+' + a; chipS('PM421 ON ' + (a == null ? 'BOX' : a), x, 18, a == null ? 20 : 17, 11, lab, okOn && v === a, () => { if (!okOn) { say('PICK A SUB THAT HAS AN ON GUY (TAP HIS TAG)'); return; } if (a != null && a < (+pk.at || 0)) { pk.onAt = null; say('HE CAN\'T GO ON BEFORE ' + who(pk.off.id, L.tm) + ' IS OFF'); try { SFX.bad(); } catch (e) {} } else { pk.onAt = a; say(a == null ? 'ON AS SOON AS HE IS OFF' : 'ON AT +' + a + 'S (WAITS IN THE BOX)'); } check(pmLists()); }, !okOn); x += a == null ? 21 : 18; });
  x += 4;
  chipS('PM421 DEL', x, 18, 22, 11, 'DEL', false, delPick, !pk); x += 25;
  const nn = S2.length;
  const tl0 = pk ? 'EDIT ' + who(pk.off.id, L.tm) : nn + ' SUB' + (nn === 1 ? '' : 'S'); textMini(tl0, Math.min(W - tl0.length * 1.4 - 2, x + tl0.length * 1.35 + 2), 22, pk ? '#ffe14d' : '#cfe');
 }
 const DP0 = W0.drawPlaymaker;
 W0.drawPlaymaker = function () {
  const d = PM && PM.pd42;
  let saved = null;
  PMS.supp = []; PMS.clrBtn = null; PMS.botX0 = null;
  try {
   if (!offPM() && PM && scr() === 'playmaker') {
    if (PMS.open && d) { const hint = PMS.warn && !(PMS.msgT > nowS()) ? 'WARNING: ' + PMS.warn : PMS.msg; d.msg = hint || 'SUB MODE'; d.flash = .3; }
    if (d && d.pv) { const m = subPlay(d); if (m) { saved = d.play; d.play = m; } }
   }
  } catch (e) { er(e); }
  let r;
  try { r = DP0.apply(this, arguments); } finally { if (saved) d.play = saved; }
  try {
   if (!offPM() && PM && PM.play && scr() === 'playmaker') {
    const L = pmLists();
    if (PMS.open) {
     for (const s of PMS.supp) rect(s[0], s[1], s[2], s[3] + 2, 'rgba(11,15,20,.92)');
     if (PMS.clrBtn) { const c = PMS.clrBtn; rect(c[0], c[1], c[2], c[3], '#ff8a7a'); textMini('NO SUBS', c[0] + c[2] / 2, c[1] + 5, '#2a0b20'); }
     drawBench(L);
     drawToolbar(L);
    }
    drawSteps(L);
    if (PMS.open) {
     const sel = PMS.sel;
     if (sel && sel.k === 'off') { const q = posAt(sel.o.dot, PMS.at), s = w2s(q[0], q[1] - 6); ringPx(Math.round(s[0]), Math.round(s[1]), 10, 1, '#ff9a4a'); }
     const D = PMS.dr;
     if (D && D.pts.length > 1) dash(D.pts.map(q => [ q[0], q[1] + 6 ]), D.f ? '#ff9a4a' : '#7dff7a');
     const m = PMS.msgT > nowS() ? PMS.msg : PMS.warn ? '! ' + PMS.warn : (PMS.sel ? '' : 'RUN A GUY INTO THE BOX = OFF. TAP A BENCH GUY + RUN HIM ON. DONE = BACK TO RUNS');
     if (m) { const mw = Math.min(W - 4, m.length * 2.7 + 8); rect(Math.round(W / 2 - mw / 2), 32, Math.round(mw), 7, 'rgba(0,0,0,.72)'); textMini(m, W / 2, 33.5, PMS.msgT > nowS() ? '#ffe14d' : PMS.warn ? '#ff8a7a' : '#cfe'); }
    }
    const n = pmSteps().length;
    hit('SUB421 PM', 205, 2, 34, 13, () => setMode(!PMS.open), 'SUB');
    rect(205, 4, 34, 13, '#000');
    rect(205, 2, 34, 13, PMS.open ? '#ffe14d' : n ? '#ff9a4a' : '#c9d6d9');
    text(PMS.open ? 'DONE' : n ? 'SUB ' + n : 'SUB', 222, 6, 1, '#0b1a20', 'center');
   } else if (scr() !== 'playmaker') { PMS.open = false; PMS.sel = null; PMS.dr = null; }
  } catch (e) { er(e); }
  return r;
 };
 if (typeof W0.pmTick === 'function') {
  const TK0 = W0.pmTick;
  W0.pmTick = function () {
   const d = PM && PM.pd42; let saved = null;
   try { if (!offPM() && d && d.pv) { const m = subPlay(d); if (m) { saved = d.play; d.play = m; } } } catch (e) { er(e); }
   try { return TK0.apply(this, arguments); } finally { if (saved && d.play === PMS.pvPlay) d.play = saved; else if (saved && !d.play) d.play = saved; }
  };
 }
 if (typeof W0.openPlaymaker === 'function') {
  const OP0 = W0.openPlaymaker;
  W0.openPlaymaker = function () { PMS.open = false; PMS.sel = null; PMS.dr = null; PMS.pick = -1; PMS.ops = []; PMS.warn = ''; return OP0.apply(this, arguments); };
 }

 W0.S421 = {
  on: () => !off(), LOG: LOG, UI: UI, S: () => S(G_()), subBox: subBox, subMid: subMid, benchIds: () => benchIds(G_()), fieldIds: () => fieldIds(G_()),
  findEnt: id => findEnt(G_(), id), exempt: () => exempt(G_()), stepFor: id => stepFor(G_(), id), resolveStep: st => resolveStep(G_(), st),
  // for other runners (e.g. a custom clear/ride runner): fire a play's sub steps now
  runPlay: function (pl, k) { const G = G_(); if (offG(G) || !pl) return 0; const T = S(G), key = (k || 'EXT') + ':' + pl.id; T.runs[key] = { t0: G.t, pl: pl, run: null, fired: {}, last: G.t, k: k || 'EXT', ext: 1, poss: G.possCount }; return stepsOf(pl).length; },
  openUI: openUI, closeUI: closeUI, goUI: goUI, btnRect: btnRect, PMS: PMS, pmLists: pmLists, catField: catField, pm: { setMode: setMode, steps: pmSteps, posAt: posAt, box: BOXW, check: () => check(pmLists()), benchNow: () => benchNow(pmLists()), slots: n => benchSlots(n), lblG: lblG, offPts: offPts, onPts: onPts, who: who, tl: tl, vrun: VRUN, mini: mini, kit: kitNow, w2s: w2s, vk: VK }, cpu: () => { const G = G_(); return G && G.s421 && G.s421.cpu ? { n: G.s421.cpu.n, done: G.s421.cpu.done, tries: G.s421.cpu.tries, skip: G.s421.cpu.skip || 0, no: G.s421.cpu.no || {}, job: G.s421.cpu.job ? { out: G.s421.cpu.job.outId, in: G.s421.cpu.job.inId, ph: G.s421.cpu.job.phase } : null, log: G.s421.cpu.log.slice(-10) } : null; }
 };
})();
