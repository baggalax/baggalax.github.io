// v545netsubs.js - V54.5: LIVE SUBS ONLINE (Charlie, Nov 12 12:43 AM: "Online needs live subs then").
// Before: live box subs (SUB by your bench -> who goes off / who comes on -> he jogs to the sub box at the midline, the new guy
// waits there and runs on when he arrives) were switched off in online matches by v421s.js (and v425sp / v428as / v540subpass
// with it), because only one phone runs the play at a time and the sub state was never sent.
// How online works: the phone whose team has the ball RUNS the play (the "authority"); the other phone shows what it sends ten-plus
// times a second (positions, who is who) and sends back its stick input. On a turnover the ball (and the running of the play) hops
// to the other phone in a 'poss' message that also carries the score, clock and both lineups.
// Now, when BOTH phones run this build:
//  - SUB button by your bench on both phones (with or without the ball). Pick who comes OFF and who comes ON -> GO.
//    The phone running the play starts the sub right away; the other phone sends a request ('ns5r') and the running phone starts it.
//  - The running phone moves the sub for BOTH teams (he jogs to his own team's sub box at the midline, the new guy comes on there:
//    the same player object changes who he is, so there are always exactly 10 a side - never 11) and sends the sub list with every
//    snapshot ('n5' field) and with the 'poss' hand-off, so the other phone shows the same OFF / ON tags and the run carries on
//    after a turnover. Positions are only ever simulated on one phone, so both screens agree.
//  - Pass to a guy jogging off (v540 rule, both teams): while the ball is on its way to him / he has it, his sub waits ("SUB WAITS");
//    once he moves it he jogs off again. The 40 s sub timeout is frozen while he holds it.
//  - Goal / end of period / faceoff / game over: an unfinished sub just happens on the whistle (lineup swap) on the running phone
//    BEFORE the faceoff / period message goes out (those messages carry the lineups), so the next faceoff lines up the same on both.
//  - Disconnect / rejoin: the phone that stayed finishes any sub on the spot (lineup swap) before it sends the 'resume' lineups,
//    so both restart from the same lineup at the pregame faceoff. Online has no pause;
//    timeouts / flags just hold the sub until play is live again.
// Old peer: a capability flag rides the lobby 'ver' message (field ns545) and an added 'ns5h' hello. The host turns live subs on for
// the match only when the guest has it ('ns5m' -> guest), so an older app on either side = today's behaviour (no live subs).
// Net protocol: only ADDED message types (ns5h, ns5m, ns5r, ns5s) and fields (ver.ns545, poss.n5, snapshot n5). Nothing changed/removed.
// Mirror match (both phones picked the same club): the same player ids exist on both teams, so every check is per team.
// Kill switch: window.__rl_no545ns = true (exactly the old behaviour). No ids, rl_* keys or saves touched.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v545ns_loaded) return;
 W0.__rl_v545ns_loaded = 1;
 const N = W0.RLNET;
 const need = [ 'step', 'render', 'hit', 'rect', 'text', 'addFx', 'teamRosterIds', 'slotGet', 'slotSet' ];
 const miss = need.filter(n => typeof W0[n] !== 'function');
 try { if (typeof PP !== 'function') miss.push('PP'); } catch (e) { miss.push('PP'); }
 if (!N || !N.Link || !N.Link.prototype || miss.length) { W0.V545NS = { on: () => false, why: miss.concat(N ? [] : [ 'RLNET' ]) }; return; }
 const killed = () => !!(W0.__rl_no545ns || W0.__rl_v124gb);
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const LOG = { ev: [], err: 0, stats: { reqSent: 0, reqIn: 0, jobs: 0, swaps: 0, rej: 0, pause: 0, dead: 0, adopt: 0, handIn: 0, handOut: 0 } };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 300) LOG.ev.shift(); };
 const er = e => { LOG.err++; if (LOG.err < 4) try { console.error(e); } catch (x) {} };
 const now = () => performance.now();
 // ---------- match state ----------
 const NS = { ep: (Math.random() * 1e9 | 0).toString(36), lastEp: '', capPeer: false, on: false, mGame: 0, n: 0, jobs: [], res: {}, myReqs: [], inReqs: [], seq: 0, helloT: 0, mT: 0, lastBig: 0 };
 function reset() { NS.on = false; NS.jobs = []; NS.res = {}; NS.myReqs = []; NS.inReqs = []; NS.n = 0; NS.mT = 0; }
 const active = () => !killed() && NS.on && !!N.inGame && !!G_() && !G_().tutorial;
 const isAuth = () => !!N.auth;
 const liveS = () => { const s = scr(); return s === 'live' || s === 'defense'; };
 const MID = () => MIDX;
 const boxOf = L => L === 'U' ? [ MIDX - 8, FB - 2 ] : [ MIDX + 8, FB - 2 ];
 const VRUN = () => (typeof PACE !== 'undefined' && PACE.run ? PACE.run : 22) * 1.3;
 const ln = id => { try { return lastName(PP(id)); } catch (e) { return String(id); } };
 const numOf = (id, tm) => { try { const G = G_(); const n = jerseyNo(PP(id), G && G.mode === 'season' ? 'season' : 'real', tm); return n === '' || n == null ? '' : String(n); } catch (e) { return ''; } };
 const sideL = tm => tm === N.side ? 'U' : 'C';               // this phone's view of a team owned by host 'h' / guest 'g'
 const mirror = () => { const st = N.st || {}; return !!st.hteam && st.hteam === st.gteam; };
 const teamId = tm => { const st = N.st || {}; return tm === 'h' ? st.hteam : st.gteam; };
 const tagW = (id, tm) => { const n = numOf(id, teamId(tm)); return (n ? n + ' ' : '') + ln(id); };
 // ---------- who is where (this phone's view: own team = O / G2 + farU, other team = D / G + farC) ----------
 function ents(G, L) {
  const out = [];
  const mine = L === 'U' ? (p => p.team === 'O') : (p => p.team === 'D');
  for (const p of G.players || []) if (!p.far && mine(p) && p.pl && !p.gk) out.push(p);
  const far = L === 'U' ? G.farU : G.farC;
  if (far && G.farMode !== 'fo') for (const f of far) if (f && f.pl && f.role !== 'G' && !out.some(q => q.pl.id === f.pl.id)) out.push(f);
  if (!G.farU && !G.farC) for (const p of G.players || []) if (p.far && p.pl && p.role !== 'G' && (L === 'U' ? p.team === 'U' : p.team === 'C') && !out.some(q => q.pl.id === p.pl.id)) out.push(p);
  return out;
 }
 const findEnt = (G, L, id) => id ? ents(G, L).find(p => p.pl && p.pl.id === id) || null : null;
 function outIds(G) {
  const s = new Set([].concat(G.ejected || [], G.concOut || [], G.gout16 || [], G.ns17 || []));
  if (G.pen && G.pen.who) s.add(G.pen.who.id || G.pen.who);
  for (const q of (Array.isArray(G.pens) ? G.pens : [])) if (q && q.who) s.add(q.who.id || q.who);
  return s;
 }
 const liveJobs = () => NS.jobs.filter(j => j.ph !== 'done');
 function busy(tm) { const s = new Set; for (const j of liveJobs()) if (!tm || j.tm === tm) { s.add(j.out); s.add(j.inn); } for (const r of NS.myReqs) if (!tm || r.tm === tm) { s.add(r.out); s.add(r.inn); } return s; }
 // a mirror match (both teams the same club) has the same player ids on both sides, so everything below is per team
 function onFieldOf(G, L) { const s = new Set; for (const p of ents(G, L)) s.add(p.pl.id); for (const p of (G.players || [])) if (p.pl && (L === 'U' ? (p.team === 'G2' || (p.far && p.team === 'U')) : (p.team === 'G' || (p.far && p.team === 'C')))) s.add(p.pl.id); return s; }
 function rosterOf(tm) { try { const G = G_(); return teamRosterIds(teamId(tm), G && G.mode === 'season' ? 'season' : 'real') || []; } catch (e) { return []; } }
 function onFieldAll(G) { const s = new Set; for (const p of (G.players || [])) if (p.pl) s.add(p.pl.id); for (const f of [].concat(G.farU || [], G.farC || [])) if (f && f.pl) s.add(f.pl.id); return s; }
 function benchFor(G, tm) {
  const OUT = outIds(G), ON = onFieldOf(G, sideL(tm)), B = busy(tm);
  const inj = id => { try { return G.mode === 'season' && typeof injOf === 'function' && injOf(id); } catch (e) { return false; } };
  return rosterOf(tm).filter(id => { const p = PP(id); return p && p.pos !== 'G' && !ON.has(id) && !OUT.has(id) && !B.has(id) && !inj(id); });
 }
 function fieldFor(G, tm) {
  const B = busy(tm), order = { A: 0, M: 1, FO: 1, LSM: 2, D: 3 };
  return ents(G, sideL(tm)).filter(p => !B.has(p.pl.id) && p.pl.pos !== 'G').map(p => p.pl.id).sort((a, b) => (order[(PP(a) || {}).pos] || 0) - (order[(PP(b) || {}).pos] || 0));
 }
 const hasBall = (G, e) => !!e && (G.carrier === e || G.dcar === e || (G.dclear && G.dclear.holder === e) || (G.ball && G.ball.state === 'pass' && G.ball.to === e));
 // ---------- state on the wire ----------
 function pack() {
  const G = G_(), t = G ? G.t : 0;
  const r = []; for (const k in NS.res) if (now() - NS.res[k].at < 15000) r.push([ k, NS.res[k].ok ]);
  return { e: NS.ep, n: NS.n, j: NS.jobs.filter(j => j.ph !== 'done' || t - (j.tDone || 0) < 3).map(j => [ j.id, j.tm, j.out, j.inn, j.ph, +Math.max(0, t - j.t0).toFixed(2), j.ph === 'on' ? +Math.max(0, t - (j.tOn || t)).toFixed(2) : 0, j.why || '' ]), r: r };
 }
 function adopt(s, why) {
  if (!s || typeof s.n !== 'number' || !Array.isArray(s.j)) return;
  // sub state counts up on the phone that sent it; a different phone (after a rejoin it restarts at 0) is always newer
  if (s.e && s.e !== NS.lastEp) NS.lastEp = s.e; else if (s.n < NS.n) return;
  const G = G_(), t = G ? G.t : 0;
  const old = new Map(NS.jobs.map(j => [ j.id, j ]));
  NS.jobs = s.j.map(a => { const o = old.get(a[0]) || {}; return Object.assign(o, { id: a[0], tm: a[1], out: a[2], inn: a[3], ph: a[4], t0: t - (+a[5] || 0), tOn: a[4] === 'on' ? t - (+a[6] || 0) : o.tOn, why: a[7] || '' }, a[4] !== o.ph ? { hx: null, hy: null } : null); });
  for (const p of (s.r || [])) if (!NS.res[p[0]]) { NS.res[p[0]] = { ok: p[1], at: now() }; }
  NS.myReqs = NS.myReqs.filter(q => { const rr = NS.res[q.id]; if (rr) { if (!rr.ok) flashMsg('CAN\'T DO THAT SUB RIGHT NOW'); return false; } return true; });
  NS.n = s.n;
  try { if (G && !isAuth()) for (const j of NS.jobs) if ((j.ph === 'on' || j.ph === 'done') && !j.luV && j.why !== 'peerDead' && j.why !== 'timeout') { j.luV = 1; luSwap(G, sideL(j.tm), j.out, j.inn); } } catch (e) { er(e); }
  if (why !== 'snap') { LOG.stats.adopt++; lg({ ev: 'adopt', why: why, n: s.n, j: NS.jobs.length }); }
 }
 const bump = () => { NS.n++; };
 function sendState(why) { try { if (N.link && active() && isAuth()) N.link.send({ t: 'ns5s', s: pack(), w: why || '' }); } catch (e) { er(e); } }
 // ---------- link hooks: ADD fields / messages only ----------
 const LP = N.Link.prototype;
 const SEND0 = LP.send;
 LP.send = function (e) {
  try {
   if (e && !killed()) {
    if (e.t === 'ver') e.ns545 = 1;
    if (e.t === 'poss' && active()) { e.n5 = pack(); LOG.stats.handOut++; lg({ ev: 'handOut', n: NS.n, j: liveJobs().length }); }
   }
  } catch (x) { er(x); }
  return SEND0.apply(this, arguments);
 };
 const LAT0 = LP.latest;
 LP.latest = function (o) {
  try {
   if (o && o.k === 's' && active() && isAuth()) {
    // run this frame's sub step before the snapshot leaves (the game's AI moved everybody already), then send the true spots
    if (!FR.ticked) { FR.ticked = true; authTick(G_(), FR.dt); }
    patchSnap(o);
    o.n5 = pack();
   }
  } catch (x) { er(x); }
  return LAT0.apply(this, arguments);
 };
 const GL0 = LP.gotLatest;
 LP.gotLatest = function (o) {
  try { if (o && o.k === 's' && o.n5 && active() && !isAuth()) adopt(o.n5, 'snap'); } catch (x) { er(x); }
  return GL0.apply(this, arguments);
 };
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try { if (e && !killed()) inEvent(e); } catch (x) { er(x); }
  return GE0.apply(this, arguments);
 };
 function inEvent(e) {
  switch (e.t) {
   case 'ver': if (e.ns545) peerCap('ver'); break;
   case 'ns5h': peerCap('hello'); break;
   case 'ns5m': if (N.side !== 'h' && e.on && !killed()) { NS.onAt = now(); if (N.inGame && !NS.on) { NS.on = true; lg({ ev: 'on', by: 'ns5m' }); } } break;
   case 'poss': if (e.n5 && active()) { adopt(e.n5, 'poss'); LOG.stats.handIn++; } break;
   case 'ns5s': if (active() && !isAuth()) adopt(e.s, 'ns5s'); break;
   case 'ns5r': if (active() && e.r && e.r.id) { LOG.stats.reqIn++; if (!NS.res[e.r.id] && !NS.inReqs.some(q => q.id === e.r.id)) NS.inReqs.push({ id: e.r.id, tm: e.r.tm, out: e.r.out, inn: e.r.inn, at: now() }); } break;
   case 'hello': if (active() && e.rejoin) { if (isAuth()) deadBall('rejoin'); else dropLocal('rejoin'); NS.jobs = []; NS.inReqs = []; } break;
   case 'fo': case 'qend': case 'final': if (active() && !isAuth()) dropLocal(e.t); break;
  }
 }
 function peerCap(why) {
  if (!NS.capPeer) lg({ ev: 'cap', why: why });
  NS.capPeer = true;
  if (N.side === 'h' && N.inGame && !killed()) hostOn('cap');
 }
 function hostOn(why) {
  if (N.side !== 'h' || !NS.capPeer || !N.link) return;
  if (!NS.on) { NS.on = true; lg({ ev: 'on', by: why }); }
  if (now() - NS.mT > 4000) { NS.mT = now(); try { N.link.send({ t: 'ns5m', on: 1, g: NS.mGame }); } catch (x) {} }
 }
 // ---------- requests ----------
 function flashMsg(s) { try { addFx('cue', 0, 0, { s: s, col: '#ffe14d', life: 1.4 }); } catch (e) {} }
 function request(out, inn) {
  const G = G_();
  if (!active() || !G) return false;
  const r = { id: N.side + (++NS.seq) + '-' + (Date.now() % 1e6).toString(36) + (Math.random() * 1e4 | 0), tm: N.side, out: out, inn: inn, at: now(), sentAt: 0 };
  NS.myReqs.push(r);
  LOG.stats.reqSent++;
  lg({ ev: 'req', id: r.id, out: out, inn: inn, auth: isAuth() });
  if (isAuth()) processReq(G, r, true); else sendReq(r);
  return true;
 }
 function sendReq(r) { try { r.sentAt = now(); N.link.send({ t: 'ns5r', r: { id: r.id, tm: r.tm, out: r.out, inn: r.inn } }); } catch (e) { er(e); } }
 function processReq(G, r, mine) {
  const L = sideL(r.tm), e = findEnt(G, L, r.out), inP = PP(r.inn);
  let why = '';
  const B = new Set; for (const j of liveJobs()) if (j.tm === r.tm) { B.add(j.out); B.add(j.inn); }
  if (!e) why = 'noOut'; else if (!inP || inP.pos === 'G' || (PP(r.out) || {}).pos === 'G') why = 'noIn';
  else if (B.has(r.out) || B.has(r.inn)) why = 'busy';
  else if (onFieldOf(G, L).has(r.inn) || (!mirror() && outIds(G).has(r.inn))) why = 'inOn';
  else { const ros = rosterOf(r.tm); if (ros.length && !ros.includes(r.inn)) why = 'notRoster'; }
  if (!why && liveJobs().filter(j => j.tm === r.tm).length >= 3) why = 'max';
  const ok = why ? 0 : 1;
  NS.res[r.id] = { ok: ok, at: now() };
  if (ok) {
   const j = { id: r.id, tm: r.tm, out: r.out, inn: r.inn, ph: 'wait', t0: G.t, why: '' };
   NS.jobs.push(j); LOG.stats.jobs++;
   try { addFx('cue', 0, 0, { s: 'SUB: ' + tagW(r.out, r.tm) + ' OFF, ' + tagW(r.inn, r.tm) + ' ON', col: '#ffe14d', life: 1.5 }); } catch (x) {}
  } else { LOG.stats.rej++; if (mine) flashMsg('CAN\'T DO THAT SUB RIGHT NOW'); }
  if (mine) NS.myReqs = NS.myReqs.filter(q => q.id !== r.id);
  lg({ ev: ok ? 'job' : 'rej', id: r.id, tm: r.tm, out: r.out, inn: r.inn, why: why });
  bump(); sendState(ok ? 'job' : 'rej');
 }
 // ---------- the sub run (only on the phone running the play) ----------
 function drive(e, tx, ty, dt, v) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), s = Math.min(d, v * dt);
  if (d > .01) { e.x += dx / d * s; e.y += dy / d * s; e.anim = (e.anim || 0) + s * 1.2; e.face421 = dx >= 0 ? 1 : -1; }
  e.tx = tx; e.ty = ty; if (e.rest) e.rest = [ tx, ty ];
  return d - s;
 }
 function anc(e, j) { if (j.hx == null || Math.hypot(e.x - j.hx, e.y - j.hy) > 24) { j.hx = e.x; j.hy = e.y; } e.x = j.hx; e.y = j.hy; }
 function release(e) { if (!e) return; e.tx = e.x; e.ty = e.y; e.wander = 0; e.react = 0; if (e.rest && e.home) e.rest = e.home.slice ? e.home.slice() : e.rest; }
 function ctrlOff(G, L, e) {
  const pickNear = team => { let q = null, bd = 1e9; for (const o of G.players || []) if (o !== e && o.team === team && !o.gk && !o.far && !(o.pl && busy(L === 'U' ? N.side : (N.side === 'h' ? 'g' : 'h')).has(o.pl.id))) { const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; q = o; } } return q; };
  if (L === 'U') { if (G.ctrl === e) G.ctrl = pickNear('O'); if (G.dctl === e) G.dctl = pickNear('O'); }
  else if (!e.far && e.team === 'D' && N.ctlIdx === e.idx) { const q = pickNear('D'); if (q) { N.ctlIdx = q.idx; N.manualSw = G.t; } }
 }
 function luSwap(G, L, out, inn) {
  const lu = G.lu && G.lu[L === 'U' ? 0 : 1];
  if (!lu || typeof SLOTS === 'undefined') return 0;
  if (SLOTS.some(s => slotGet(lu, s[0]) === inn)) return 0;
  let n = 0;
  for (const s of SLOTS) if (slotGet(lu, s[0]) === out) { slotSet(lu, s[0], inn); n++; }
  if (n) (G.subs = G.subs || []).push({ side: L === 'U' ? 0 : 1, out: out, in: inn, s545: 1 });
  return n;
 }
 function swap(G, j, e, why) {
  const L = sideL(j.tm), inP = PP(j.inn);
  if (!inP) return false;
  if (e && e.pl && e.pl.id === j.out) { e.pl = inP; e.stun = 0; e.ns17 = null; e.dropT = 0; e.gbReact = 0; release(e); }
  j.lu = luSwap(G, L, j.out, j.inn);
  j.ph = 'on'; j.tOn = G.t; j.hx = j.hy = null;
  LOG.stats.swaps++;
  if (e) try { addFx('txt', e.x, e.y - 24, { s: tagW(j.inn, j.tm) + ' ON', col: L === 'U' ? '#7dff7a' : '#ff9a8a', life: 1.2 }); } catch (x) {}
  lg({ ev: 'swap', id: j.id, tm: j.tm, out: j.out, inn: j.inn, lu: j.lu, why: why || 'box', scr: scr() });
  bump(); return true;
 }
 function finish(G, j, why) { if (j.ph === 'done') return; j.ph = 'done'; j.why = why; j.tDone = G.t; lg({ ev: 'done', id: j.id, why: why }); bump(); }
 function jobTick(G, dt) {
  let ch = false;
  for (const j of NS.jobs) {
   if (j.ph === 'done') continue;
   const L = sideL(j.tm), e = findEnt(G, L, j.out), bx = boxOf(L);
   if (j.ph === 'wait' || j.ph === 'toBox') {
    if (G.t - j.t0 > 40) { finish(G, j, 'timeout'); ch = true; continue; }
    if (!e) { if (!findEnt(G, L, j.inn)) { swap(G, j, null, 'gone'); finish(G, j, 'gone'); ch = true; } continue; }
    if (hasBall(G, e)) {
     // v540 rule: a pass to him / he has it -> his sub waits; the 40 s timeout is frozen while he holds it
     if (j.ph === 'toBox') { j.ph = 'wait'; j.hx = j.hy = null; LOG.stats.pause++; lg({ ev: 'pause', id: j.id }); bump(); ch = true; }
     if (!j.waitMsg) { j.waitMsg = 1; flashMsg('SUB WAITS: ' + ln(j.out) + ' HAS THE BALL'); }
     j.t0 += Math.max(0, Math.min(.25, dt));
     continue;
    }
    if (j.ph === 'wait') { j.ph = 'toBox'; j.waitMsg = 0; j.hx = e.x; j.hy = e.y; ch = true; bump(); try { addFx('txt', e.x, e.y - 24, { s: tagW(j.out, j.tm) + ' OFF', col: '#ff9a4a', life: 1.2 }); } catch (x) {} }
    ctrlOff(G, L, e);
    anc(e, j);
    const left = drive(e, bx[0], bx[1], dt, VRUN());
    j.hx = e.x; j.hy = e.y;
    if (left < 1.5) { swap(G, j, e, 'box'); ch = true; }
   } else if (j.ph === 'on') {
    if (G.t - (j.tOn || 0) > 1.2) { finish(G, j, 'ok'); ch = true; }
   }
  }
  const t = G.t;
  NS.jobs = NS.jobs.filter(j => j.ph !== 'done' || t - (j.tDone || 0) < 3);
  return ch;
 }
 // dead ball (goal / period / faceoff / final): every unfinished sub happens now, on the lineup, before the message carrying it goes out
 function deadBall(why) {
  const G = G_();
  if (!G || !active() || !isAuth()) return;
  let n = 0;
  for (const j of NS.jobs) {
   if (j.ph === 'done') continue;
   if (j.ph === 'wait' || j.ph === 'toBox') { const e = findEnt(G, sideL(j.tm), j.out); swap(G, j, e, 'dead:' + why); }
   finish(G, j, 'dead'); n++;
  }
  NS.inReqs = [];
  if (n) { LOG.stats.dead += n; lg({ ev: 'deadBall', why: why, n: n }); sendState('dead'); }
 }
 function dropLocal(why) {
  // the other phone's whistle: nothing to swap here (its lineups arrive in that message), just clear the tags
  if (liveJobs().length) lg({ ev: 'dropLocal', why: why, n: liveJobs().length });
  for (const j of NS.jobs) if (j.ph !== 'done') { j.ph = 'done'; j.why = 'peerDead'; }
  NS.myReqs = [];
 }
 for (const nm of [ 'startFaceoff', 'endQuarter', 'finishGame' ]) {
  const F0 = W0[nm];
  if (typeof F0 !== 'function') continue;
  W0[nm] = function () { try { if (active() && isAuth() && !N.applying) deadBall(nm); } catch (e) { er(e); } return F0.apply(this, arguments); };
 }
 // offside: a guy on his way to the box does not count (same rule v421s uses offline)
 if (typeof W0.ruleCounts === 'function') {
  const RC0 = W0.ruleCounts;
  W0.ruleCounts = function () {
   const r = RC0.apply(this, arguments);
   try {
    const G = G_();
    if (active() && isAuth() && G && r) for (const j of liveJobs()) {
     if (j.ph !== 'toBox') continue;
     const L = sideL(j.tm), e = findEnt(G, L, j.out), R = L === 'U' ? r.U : r.C;
     if (!e || !R) continue;
     R.n--;
     if (L === 'U') { if (e.x < MIDX + 3) R.back--; if (e.x > MIDX - 3) R.up--; } else { if (e.x > MIDX - 3) R.back--; if (e.x < MIDX + 3) R.up--; }
     R.back++; R.up++;
    }
   } catch (e) { er(e); }
   return r;
  };
 }
 // ---------- frame ----------
 let wasIn = false;
 const FR = { ticked: true, dt: 0 };
 const ST0 = W0.step;
 W0.step = function (dt) {
  FR.ticked = false; FR.dt = +dt || 0;
  const r = ST0.apply(this, arguments);
  try { frame(+dt || 0); } catch (e) { er(e); }
  FR.ticked = true;
  return r;
 };
 function patchSnap(o) {
  const G = G_(); if (!G) return;
  for (const j of liveJobs()) {
   if (j.ph !== 'toBox') continue;
   const L = sideL(j.tm), tP = L === 'U' ? 'O' : 'D', tF = L === 'U' ? 'U' : 'C';
   const e = findEnt(G, L, j.out); if (!e) continue;
   const x = +e.x.toFixed(1), y = +e.y.toFixed(1);
   for (const a of (o.P || [])) if (a && a[5] === j.out && a[0] === tP) { a[2] = x; a[3] = y; a[4] = +(e.anim || 0).toFixed(1); }
   for (const a of (o.F || [])) if (a && a[5] === j.out && a[0] === tF) { a[2] = x; a[3] = y; a[4] = +(e.anim || 0).toFixed(1); }
  }
 }
 function authTick(G, dt) {
  if (!G || !active() || !isAuth()) return;
  const s = scr();
  if (s === 'live' || s === 'defense') {
   for (const q of NS.inReqs.splice(0)) { if (now() - q.at < 10000) processReq(G, q, false); else { NS.res[q.id] = { ok: 0, at: now() }; bump(); } }
   for (const q of NS.myReqs.slice()) processReq(G, q, true);
   if (jobTick(G, dt)) sendState('tick');
  } else if (s === 'faceoff' || s === 'qbreak' || s === 'pregame' || s === 'final' || (s === 'banner' && G.banner && /goal/.test(G.banner.kind || ''))) deadBall(s);
 }
 function frame(dt) {
  if (killed()) return;
  const G = G_();
  // match start / end
  if (N.inGame && !wasIn) {
   reset(); NS.mGame = Date.now(); NS.hellos = 0;
   if (N.side !== 'h' && NS.onAt && now() - NS.onAt < 20000) NS.on = true;
   lg({ ev: 'begin', side: N.side, cap: NS.capPeer, on: NS.on });
  }
  if (!N.inGame && wasIn) { reset(); NS.hellos = 0; }
  wasIn = !!N.inGame;
  if (!N.link) { NS.capPeer = false; NS.hellos = 0; NS.onAt = 0; }
  else if (NS.linkRef !== N.link) { NS.linkRef = N.link; NS.capPeer = false; NS.hellos = 0; NS.onAt = 0; }
  // capability hello (lobby + match), until the other phone answers (an old app never does: stop after 12)
  if (N.link && !NS.capPeer && (NS.hellos || 0) < 12 && now() - NS.helloT > 3000) { NS.helloT = now(); NS.hellos = (NS.hellos || 0) + 1; try { N.link.send({ t: 'ns5h', c: 545 }); } catch (e) {} }
  if (N.inGame && N.side === 'h' && NS.capPeer) hostOn('frame');
  if (!active() || !G) return;
  const s = scr();
  if (isAuth()) {
   if (!FR.ticked) { FR.ticked = true; authTick(G, dt); }
  } else {
   // waiting on the other phone: re-send my request until it answers, give up after 8 s
   for (const q of NS.myReqs.slice()) {
    if (now() - q.at > 8000) { NS.myReqs = NS.myReqs.filter(x => x !== q); flashMsg('SUB DIDN\'T GO THROUGH - TRY AGAIN'); lg({ ev: 'reqTimeout', id: q.id }); continue; }
    if (now() - q.sentAt > 1500) sendReq(q);
   }
   if (s === 'faceoff' || s === 'qbreak' || s === 'pregame' || s === 'final') dropLocal(s);
  }
  if (UI.open && !canSub(G)) UI.open = false;
 }
 // ---------- bench: the guy going on waits at the box, not on the bench ----------
 if (typeof W0.benchTick === 'function') {
  const BT0 = W0.benchTick;
  W0.benchTick = function (side) {
   const B = BT0.apply(this, arguments);
   try {
    if (active() && B && B.arr) for (const j of liveJobs()) if ((j.ph === 'wait' || j.ph === 'toBox') && (sideL(j.tm) === 'U') === (side === 'u')) B.arr[j.inn] = menuT + 1;
   } catch (e) { er(e); }
   return B;
  };
 }
 // ---------- UI: SUB button + picker (both phones, ball or no ball) ----------
 const UI = { open: false, off: null, on: null, msg: '' };
 function viewLive() { const V = N.view; return scr() === 'netview' && V && (V.scr === 'live' || V.scr === 'defense'); }
 function canSub(G) { return active() && !!G && !G.over && !G.scene && (isAuth() ? liveS() && G.farMode !== 'fo' : viewLive()); } // the watching phone's farMode is not kept up to date
 const BTN = { w: 26, h: 10 };
 function btnRect() {
  // same spot as the offline SUB button (bottom row, right of the D / MAN button); slide right past any other button there
  const y = H - 11 - (typeof sa2403Dy === 'function' ? (sa2403Dy(H - 11, 11) || 0) : 0);
  let x = Math.round(W / 2 + 45 + 26 + 3);
  try {
   const k0 = (typeof screenKey === 'function' ? screenKey() : scr()) + '|';
   const d = uiSpecs.find(q => q.key === k0 + 'DEFENSE MAN ZONE'); if (d) x = Math.round(d.x + d.w + 3);
   for (let n = 0; n < 6; n++) {
    const o = uiSpecs.find(q => q.key.indexOf('SUB545') < 0 && q.y + q.h > y - 3 && q.y < y + BTN.h + 3 && q.x < x + BTN.w + 2 && q.x + q.w > x - 2);
    if (!o) break; x = Math.round(o.x + o.w + 3);
   }
  } catch (e) {}
  return { x: Math.max(2, Math.min(x, W - BTN.w - 4)), y: y, w: BTN.w, h: BTN.h };
 }
 function chip(key, x, y, w, h, lab, on, fn, dim) {
  hit(key, x, y, w, h, fn, lab);
  rect(x, y + 1, w, h, '#000');
  rect(x, y, w, h, on ? '#ffe14d' : dim ? 'rgba(40,50,60,.95)' : '#c9d6d9');
  try { if (typeof textW === 'function' && typeof textMini === 'function' && textW(lab, 1) > w - 4) textMini(lab, x + w / 2, y + Math.round((h - 3) / 2), on ? '#2a0b20' : dim ? '#7a8a95' : '#0b1a20'); else text(lab, x + w / 2, y + Math.round((h - 5) / 2), 1, on ? '#2a0b20' : dim ? '#7a8a95' : '#0b1a20', 'center'); } catch (e) {}
 }
 const mini = (s, x, y, c) => { try { if (typeof textMini === 'function') textMini(s, x, y, c); else text(s, x, y, 1, c, 'center'); } catch (e) {} };
 function lbl(id) { const p = PP(id); return tagW(id, N.side) + ' ' + (p ? p.pos : ''); }
 function drawUI() {
  const G = G_();
  if (!canSub(G)) { UI.open = false; return; }
  const r = btnRect(), mine = liveJobs().some(j => j.tm === N.side) || NS.myReqs.length;
  hit('SUB545', r.x - 2, r.y - 3, r.w + 4, r.h + 4, () => { UI.open = !UI.open; UI.off = UI.on = null; UI.msg = ''; }, 'SUB');
  rect(r.x, r.y + 1, r.w, r.h, '#000');
  rect(r.x, r.y, r.w, r.h, UI.open ? '#ffe14d' : mine ? '#ff9a4a' : '#2cc4dc');
  rect(r.x, r.y, r.w, 1, 'rgba(255,255,255,.35)');
  text('SUB', r.x + r.w / 2, r.y + 3, 1, '#0b1a20', 'center');
  NS.btnFrames = (NS.btnFrames || 0) + 1; NS.btnAt = [ r.x, r.y ];
  if (!UI.open) return;
  const X = 4, Y = 14, PW = W - 8, PH = 128;
  hit('SUB545 PANEL', X, Y, PW, PH, () => {}, 'SUB PANEL');
  rect(X, Y, PW, PH, 'rgba(8,12,18,.93)');
  rect(X, Y, PW, 1, '#2cc4dc');
  text('SUB', X + 6, Y + 5, 1, '#ffe14d');
  mini('ONLINE - THE GAME KEEPS GOING', X + 120, Y + 6, '#9fb3bd');
  chip('SUB545 X', X + PW - 22, Y + 2, 18, 12, 'X', false, () => { UI.open = false; });
  const fld = fieldFor(G, N.side), bench = benchFor(G, N.side);
  if (UI.off && !fld.includes(UI.off)) UI.off = null;
  if (UI.on && !bench.includes(UI.on)) UI.on = null;
  text('OFF', X + 4, Y + 20, 1, '#ff9a8a');
  const gap = 2, x0 = X + 4, cw = Math.max(40, Math.min(74, Math.floor((PW - 8 - 4 * gap) / 5))), ch = 14;
  fld.slice(0, 10).forEach((id, i) => {
   const cx = x0 + (i % 5) * (cw + gap), cy = Y + 28 + Math.floor(i / 5) * (ch + gap);
   chip('SUB545 OFF ' + id, cx, cy, cw, ch, lbl(id), UI.off === id, () => { UI.off = id; });
  });
  text('ON (FROM THE BENCH)', X + 4, Y + 62, 1, '#7dff7a');
  bench.slice(0, 10).forEach((id, i) => {
   const cx = x0 + (i % 5) * (cw + gap), cy = Y + 70 + Math.floor(i / 5) * (ch + gap);
   chip('SUB545 ON ' + id, cx, cy, cw, ch, lbl(id), UI.on === id, () => { UI.on = id; });
  });
  if (!bench.length) mini('NOBODY ON THE BENCH', X + 120, Y + 76, '#9fb3bd');
  const ok = !!(UI.off && UI.on);
  chip('SUB545 GO', X + PW - 60, Y + PH - 18, 56, 15, 'GO', ok, () => { if (!ok) return; if (request(UI.off, UI.on)) { try { SFX.tap(); } catch (e) {} UI.open = false; } else UI.msg = 'CAN\'T DO THAT SUB RIGHT NOW'; }, !ok);
  mini(UI.msg || 'HE RUNS TO THE BOX, THEN THE NEW GUY RUNS ON. MAN SHORT TILL THEN.', X + Math.round((PW - 64) / 2), Y + PH - 12, '#cfe');
 }
 // OFF / ON tags over the players in a sub (both phones, both teams)
 function drawTags() {
  const G = G_(); if (!G) return;
  for (const j of liveJobs()) {
   const L = sideL(j.tm);
   const id = j.ph === 'on' ? j.inn : j.out, e = findEnt(G, L, id); if (!e) continue;
   const s = (j.ph === 'on' ? 'ON' : j.ph === 'wait' ? 'SUB WAITS' : 'OFF'), x = Math.round(e.x - camX), y = Math.round(e.y) - 19;
   if (x < -10 || x > W + 10) continue;
   const w = Math.max(17, Math.round(s.length * 2.7) + 4);
   rect(x - Math.round(w / 2), y - 1, w, 7, 'rgba(0,0,0,.65)'); mini(s, x, y, j.ph === 'on' ? '#7dff7a' : '#ff9a4a');
  }
  // the new guy waiting at his team's box
  for (const j of liveJobs()) {
   if (!(j.ph === 'wait' || j.ph === 'toBox')) continue;
   const L = sideL(j.tm), bx = boxOf(L), x = bx[0] + 2 - camX, y = bx[1] + 3;
   try { if (typeof scaled12 === 'function' && W0.RL12 && RL12.draw) scaled12(x, y, () => RL12.draw(g, 'idle', x, y, L === 'U' ? G.uk : G.ok, true, { skin: typeof skinOf === 'function' ? skinOf(PP(j.inn)) : undefined })); } catch (e) {}
  }
 }
 const R0 = W0.render;
 W0.render = function () {
  const r = R0.apply(this, arguments);
  try {
   const G = G_();
   if (active() && G && (liveS() || scr() === 'netview')) { drawTags(); drawUI(); }
  } catch (e) { er(e); }
  return r;
 };
 W0.V545NS = {
  on: () => active(), NS: NS, LOG: LOG, UI: UI,
  request: (out, inn) => request(out, inn), bench: () => benchFor(G_(), N.side), field: () => fieldFor(G_(), N.side),
  jobs: () => NS.jobs.map(j => ({ id: j.id, tm: j.tm, out: j.out, inn: j.inn, ph: j.ph, why: j.why })), pack: pack,
  ents: L => ents(G_(), L || 'U').map(p => p.pl.id),
  dbg: () => { const G = G_(), V = N.view; return { act: active(), auth: isAuth(), scr: scr(), vscr: V && V.scr, scene: !!(G && G.scene), over: !!(G && G.over), fm: G && G.farMode, can: canSub(G), btn: NS.btnFrames || 0 }; }
 };
})();
