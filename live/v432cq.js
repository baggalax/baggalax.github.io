// v432cq.js - V43.2 CLEARS QA FIXES (release pass). Kill switch: window.__rl_no432cq = true -> exactly the old behaviour.
// Hooks from outside (loaded after v428as.js / v427pm.js); no ids, rl_* keys, __rl_* flags or net protocol touched; offline only.
// (1) NO CLONES: a live box sub (SUB screen, playmaker clear/ride sub, auto sub, follow) picks its ON guy from the bench when it
//     fires; a unit rebuild during the clear (defense -> offense, a new possession) can put that same guy back on the field before
//     the OFF guy reaches the box, and the swap then put him on the field twice (one copy at the box that jumped ~90 px to the
//     other). Now, while the OFF guy is still on his way, an ON guy who is already on the field is replaced by another bench guy
//     of the same position group (or the sub is called off cleanly if there is nobody). Same for the CPU's sub jobs.
// (2) THE BOX IS NEVER BLOCKED: the guy jogging off (or stepping off at the midline) had the game's spacing push (unstack46)
//     shoving him back while his sub run pulled him on - with a teammate standing on the box spot he vibrated next to the box and
//     the swap never fired. The runner now has right of way: the spacing push moves the other guy, never the runner.
// (4) Charlie's ride idea: you clear with the LSM in the M3 spot, then your ride's SUB takes M3 off for a fresh middie. With the
//     drawn M3 guy not on the field (the LSM took his spot), the sub used to pull a short-stick middie and leave the LSM on.
//     Now the LSM (he plays the M3 spot - LSM counts as a middie in the spot rule) is the one who jogs off.
// (5) a CPU guy jogging off who picks up the ball (ground ball, clear pass) stops his sub and plays on - no OFF tag on a ball carrier.
// (6) one guy, two subs: when you send a guy over the midline on the SUB screen, a play/auto sub that also wanted him off is dropped
//     (he used to freeze at the midline, pulled two ways).
// (3) CPU never passes to its own guy who is jogging off (his OFF tag stayed on while he carried it); it hits the next open man.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v432cq_loaded) return;
 W0.__rl_v432cq_loaded = 1;
 const S4 = W0.S421;
 if (!S4 || typeof S4.S !== 'function' || typeof W0.step !== 'function') { W0.V432CQ = { on: () => false, why: 'no S421' }; return; }
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const off = () => !!(W0.__rl_no432cq || W0.__rl_no421s || W0.__rl_v124gb || !(S4.on && S4.on()));
 const offG = G => off() || !G || !!G.tutorial || !!G.online || !!G.brave || !!G.over;
 const liveScr = () => { const s = scr(); return s === 'live' || s === 'defense'; };
 const LOG = { ev: [], err: 0, stats: { rideLsm: 0, reOn: 0, cancelOn: 0, cpuReOn: 0, cpuCancelOn: 0, runnerFixed: 0, cpuPassRedirect: 0 } };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 200) LOG.ev.shift(); };
 const er = e => { LOG.err++; if (LOG.err < 4) try { console.error(e); } catch (x) {} };
 const PPx = id => { try { return PP(id); } catch (e) { return null; } };
 const grp = id => { const p = PPx(id), pos = p && p.pos; return pos === 'G' ? 'G' : (pos === 'D' || pos === 'LSM') ? 'D' : pos === 'A' ? 'A' : 'M'; };
 const isU = p => p && (p.team === 'O' || p.team === 'G2' || p.team === 'U');
 function uIds(G) { const s = new Set; for (const p of G.players || []) if ((p.team === 'O' || p.team === 'G2') && p.pl) s.add(p.pl.id); if (G.farU && G.farMode !== 'fo') for (const f of G.farU) if (f.pl) s.add(f.pl.id); return s; }
 function cEnts(G) { const out = (G.players || []).filter(p => p.team === 'D' && p.pl); if (G.farC && G.farMode !== 'fo') for (const f of G.farC) if (f.pl && !out.some(q => q.pl.id === f.pl.id)) out.push(f); return out; }
 function cIds(G) { const s = new Set; for (const p of cEnts(G)) s.add(p.pl.id); for (const p of G.players || []) if (p.team === 'G' && p.pl) s.add(p.pl.id); return s; }
 const preSwap = j => j && j.kind === 'box' && (j.phase === 'wait' || j.phase === 'toBox' || j.phase === 'boxWait');
 // ---------- (1) no clones ----------
 function guardUser(G) {
  const T = S4.S(); if (!T || !T.jobs || !T.jobs.length) return;
  let ON = null;
  for (const j of T.jobs) {
   if (!preSwap(j) || !j.inId) continue;
   ON = ON || uIds(G);
   if (!ON.has(j.inId)) continue;
   const old = j.inId, g = grp(old);
   const taken = new Set; for (const k of T.jobs) if (k !== j && k.phase !== 'done') { if (k.inId) taken.add(k.inId); if (k.outId) taken.add(k.outId); }
   let bench = []; try { bench = (S4.benchIds() || []).filter(id => id !== old && !ON.has(id) && !taken.has(id) && grp(id) !== 'G'); } catch (e) {}
   const same = bench.filter(id => grp(id) === g), pick = (same.length ? same : g === 'M' ? bench.filter(id => grp(id) === 'M') : [])[0] || null;
   if (pick) {
    j.inId = pick; j.re432 = old;
    if (T.hideBench) { delete T.hideBench[old]; T.hideBench[pick] = 1; }
    try { for (const p of (W0.S425 && W0.S425.PEND) || []) if (p && p.st !== 'done' && p.on === old && p.off === j.outId) p.on = pick; } catch (e) {}
    LOG.stats.reOn++; lg({ t: +G.t.toFixed(2), ev: 'reOn', out: j.outId, was: old, now: pick, src: j.src || '' });
   } else {
    // nobody left on the bench for him: the sub is off, the runner just plays on (no tag, no swap)
    const e = S4.findEnt(j.outId);
    j.phase = 'done'; j.why = 'inOnField432'; j.tDone = G.t;
    if (T.hideBench) delete T.hideBench[old];
    if (e) { e.tx = e.x; e.ty = e.y; e.wander = 0; }
    LOG.stats.cancelOn++; lg({ t: +G.t.toFixed(2), ev: 'cancelOn', out: j.outId, in: old, src: j.src || '' });
   }
  }
 }
 function guardCpu(G) {
  let ON = null;
  const A = G.a428;
  if (A && A.cpuJobs) for (const j of A.cpuJobs) {
   if (j.phase !== 'toBox' || !j.inId) continue;
   ON = ON || cIds(G);
   if (!ON.has(j.inId)) continue;
   const old = j.inId, g = grp(old);
   let bench = []; try { bench = (W0.V428AS && V428AS.cBench ? V428AS.cBench() : []) || []; } catch (e) {}
   bench = bench.filter(id => id !== old && !ON.has(id) && grp(id) !== 'G');
   const same = bench.filter(id => grp(id) === g), pick = (same.length ? same : bench.filter(id => grp(id) === 'M'))[0] || null;
   if (pick) { j.inId = pick; LOG.stats.cpuReOn++; lg({ t: +G.t.toFixed(2), ev: 'cpuReOn', out: j.outId, was: old, now: pick }); }
   else { j.phase = 'done'; j.end = 'inOnField432'; j.tDone = G.t; LOG.stats.cpuCancelOn++; lg({ t: +G.t.toFixed(2), ev: 'cpuCancelOn', out: j.outId, in: old }); }
  }
  const C = G.s421 && G.s421.cpu, cj = C && C.job;
  if (cj && cj.phase === 'toBox' && cj.inId) {
   ON = ON || cIds(G);
   if (ON.has(cj.inId)) {
    const lu = G.lu && G.lu[1], OUT = new Set([].concat(G.ejected || [], G.concOut || [], G.gout16 || [], G.ns17 || []));
    const pool = ((lu && lu.M) || []).filter(id => id && id !== cj.inId && PPx(id) && !ON.has(id) && !OUT.has(id));
    if (pool.length) { lg({ t: +G.t.toFixed(2), ev: 'cpuReOn', out: cj.outId, was: cj.inId, now: pool[0], k: 'c421' }); cj.inId = pool[0]; LOG.stats.cpuReOn++; }
    else { C.job = null; (C.log = C.log || []).push({ t: +G.t.toFixed(2), out: cj.outId, in: cj.inId, why: 'inOnField432', ph: cj.phase }); LOG.stats.cpuCancelOn++; }
   }
  }
 }

 // ---------- (4) ride SUB on M3 with the LSM playing that spot -> the LSM goes off ----------
 function rideLsm(G) {
  const T = S4.S(); if (!T || !T.fires) return;
  T.n432 = T.n432 || 0;
  while (T.n432 < T.fires.length) {
   const f = T.fires[T.n432++];
   if (!f || f.k !== 'RIDES' || !f.ok || f.offPos !== 'M' || f.onPos == null || !/^pos\(off not on field\)/.test(f.how || '') || G.t - f.t > .5) continue;
   const j = T.jobs.find(k => k.kind === 'box' && k.src === 'play' && k.outId === f.off && k.inId === f.on && k.phase !== 'done');
   if (!j || !(j.phase === 'wait' || j.phase === 'toBox')) continue;
   const busy = new Set; for (const k of T.jobs) if (k !== j && k.phase !== 'done') { busy.add(k.outId); if (k.inId) busy.add(k.inId); if (k.stepId) busy.add(k.stepId); }
   const car = G.carrier || G.dcar || (G.dclear && G.dclear.holder);
   let lsm = null;
   for (const id of uIds(G)) { const p = PPx(id); if (!p || busy.has(id) || id === j.inId) continue; if (p.pos === 'LSM') { const e = S4.findEnt(id); if (e && e !== car && !e.gk) { lsm = e; break; } } }
   if (!lsm) continue;
   const was = S4.findEnt(j.outId);
   j.outId = lsm.pl.id; j.hx = null; j.hy = null; j.wp = null; j.ride432 = f.off;
   if (was) { was.tx = was.x; was.ty = was.y; was.wander = 0; }
   f.off = lsm.pl.id; f.offPos = 'LSM'; f.how = (f.how || '') + ', M3 spot -> LSM';
   try { addFx('cue', 0, 0, { s: 'PLAY SUB: ' + lastName(PPx(j.outId)) + ' (LSM) OFF', col: '#ff9a4a', life: 1.4 }); } catch (e) {}
   LOG.stats.rideLsm = (LOG.stats.rideLsm || 0) + 1; lg({ t: +G.t.toFixed(2), ev: 'rideLsm', was: j.ride432, now: j.outId, in: j.inId });
  }
 }

 // ---------- (5) a CPU guy jogging off who ends up with the ball plays on (no OFF tag on the ball carrier) ----------
 // ---------- (6) one guy, two subs: a play/auto box sub never takes the guy you just sent over the midline on the SUB screen ----------
 function holds(G, e) { return !!e && (G.carrier === e || G.dcar === e || (G.dclear && G.dclear.holder === e) || (G.ball && G.ball.state === 'pass' && G.ball.to === e)); }
 function oneJobEach(G) {
  const C = G.s421 && G.s421.cpu, cj = C && C.job;
  if (cj && cj.phase === 'toBox' && holds(G, cj.e)) {
   C.job = null; (C.log = C.log || []).push({ t: +G.t.toFixed(2), out: cj.outId, in: cj.inId, why: 'carrier432', ph: cj.phase });
   LOG.stats.cpuCarrier = (LOG.stats.cpuCarrier || 0) + 1; lg({ t: +G.t.toFixed(2), ev: 'cpuCarrier', out: cj.outId, k: 'c421' });
  }
  if (G.a428) for (const j of G.a428.cpuJobs) {
   if (j.phase !== 'toBox' || j.kind === 'follow') continue;
   const e = cEnts(G).find(p => p.pl.id === j.outId);
   if (e && holds(G, e)) { j.phase = 'done'; j.end = 'carrier432'; j.tDone = G.t; LOG.stats.cpuCarrier = (LOG.stats.cpuCarrier || 0) + 1; lg({ t: +G.t.toFixed(2), ev: 'cpuCarrier', out: j.outId, k: 'a428' }); }
  }
  const P = W0.S425 && W0.S425.PEND; if (!P || !P.length) return;
  const T = S4.S(); if (!T || !T.jobs) return;
  for (const p of P) {
   if (!p || p.mode !== 'mid' || p.st === 'done' || !p.over) continue;
   for (const j of T.jobs) {
    if (j.kind !== 'box' || j.src === 'sp425' || j.outId !== p.over || !preSwap(j)) continue;
    const e = S4.findEnt(j.outId);
    j.phase = 'done'; j.why = 'crosser432'; j.tDone = G.t;
    if (T.hideBench && j.inId) delete T.hideBench[j.inId];
    if (e && e !== G.carrier) { e.tx = e.x; e.ty = e.y; }
    LOG.stats.crosser = (LOG.stats.crosser || 0) + 1; lg({ t: +G.t.toFixed(2), ev: 'crosser', out: j.outId, in: j.inId, src: j.src });
   }
  }
 }
 // ---------- runners (OFF guys on their way to the box) ----------
 function runners(G) {
  const out = [];
  try {
   const T = S4.S();
   for (const j of (T && T.jobs) || []) {
    if (j.phase === 'done') continue;
    if (j.kind === 'box' && (j.phase === 'toBox' || j.phase === 'boxWait')) { const e = S4.findEnt(j.outId); if (e) out.push(e); }
    if (j.kind === 'mid' && (j.phase === 'stepOff' || j.phase === 'inBox')) { const e = S4.findEnt(j.stepId); if (e) out.push(e); }
   }
   const cj = G.s421 && G.s421.cpu && G.s421.cpu.job; if (cj && cj.phase === 'toBox' && cj.e) out.push(cj.e);
  } catch (e) {}
  try { if (G.a428) for (const j of G.a428.cpuJobs) if (j.phase === 'toBox') { const e = cEnts(G).find(p => p.pl.id === j.outId); if (e) out.push(e); } } catch (e) {}
  return out;
 }
 // ---------- (2) right of way for the runner in the spacing push ----------
 if (typeof W0.unstack46 === 'function') {
  const U0 = W0.unstack46;
  W0.unstack46 = function () {
   const G = G_();
   if (offG(G) || !liveScr()) return U0.apply(this, arguments);
   let rs = [];
   try { rs = runners(G).filter(e => !e.fo); for (const e of rs) e.fo = 1; if (rs.length) LOG.stats.runnerFixed++; } catch (e) { er(e); rs = []; }
   try { return U0.apply(this, arguments); }
   finally { for (const e of rs) if (e.fo === 1) delete e.fo; }
  };
 }
 // ---------- (3) the CPU does not pass to its own guy jogging off ----------
 if (typeof W0.dPassTo === 'function') {
  const P0 = W0.dPassTo;
  W0.dPassTo = function (c, r) {
   try {
    const G = G_();
    if (!offG(G) && c && r && r.team === 'D' && c.team === 'D') {
     const rs = runners(G);
     if (rs.includes(r)) {
      const alt = (G.players || []).filter(p => p.team === 'D' && p !== c && p !== r && !p.gk && p.pl && !rs.includes(p) && !(p.down > 0))
       .sort((a, b) => Math.hypot(a.x - r.x, a.y - r.y) - Math.hypot(b.x - r.x, b.y - r.y))[0];
      if (alt) { LOG.stats.cpuPassRedirect++; return P0.call(this, c, alt); }
     }
    }
   } catch (e) { er(e); }
   return P0.apply(this, arguments);
  };
 }
 // ---------- frame hook: guard before and after the frame (other systems rebuild units inside it) ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  let G = G_();
  try { if (!offG(G) && liveScr()) { guardUser(G); guardCpu(G); } } catch (e) { er(e); }
  const r = ST0.apply(this, arguments);
  try { G = G_(); if (!offG(G) && liveScr()) { rideLsm(G); oneJobEach(G); guardUser(G); guardCpu(G); } } catch (e) { er(e); }
  return r;
 };
 W0.V432CQ = { on: () => !off(), LOG: LOG, runners: () => { const G = G_(); return G ? runners(G).map(e => e.pl && e.pl.id) : []; } };
})();
