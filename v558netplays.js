/* v558netplays.js - BAGGA LAX 1.3.1: YOUR CUSTOM PLAYS NOW WORK IN ONLINE MATCHES, OFFENSE AND DEFENSE
 * Charlie, Nov 12 9:54 AM: "Ok fix it so you can use plays just make sure there's no bugs."
 * How online works: the phone whose team has the ball RUNS the play (RLNET.auth) - it moves all 20 guys (its own team, and the
 * other team's defenders, one of them steered by the other player's stick: p.netCtl) and sends spots to the other phone.
 * OFFENSE (your sets, your clears, set-ups, restarts in your picks) - v404g, v409s, v420c (your clear), v424rs: their own
 *   "is this online?" check now also asks V558NP.on() (this phone runs the play + both phones have this build + switch off),
 *   so they run exactly as offline, for the team with the ball, on the phone running the play. Nothing has to cross the wire:
 *   the team with the ball is always run by its own phone, from that player's own saved playbook.
 * DEFENSE - the defending player's own picks are sent to the phone running the play (ADDED message 'n558d', ~1 s on change,
 *   5 s heartbeat), which plays them for the defending team, exactly where offline would:
 *   - custom D, MAN type (v404d): the D lines up in the drawn shape, then everyone takes a man (box entry + 1.2 s, a dodge, a
 *     shot / loose ball, or 7 s), and the drawn slide package (ADJACENT / CREASE) picks the slider. (ZONE-type custom D already
 *     crossed online through 'ds26' - unchanged.)
 *   - LOCK OFF (v411l): the lock defender face-guards his man the whole possession, never slides; the zone is built from the rest.
 *   - picked RIDE (v415r / v420c): NORMAL RIDE = goalie stays home (online used to always play 10-MAN); 10-MAN RIDE = v415r's
 *     real 10-man (goalie takes the high attackman, plays the top of the box); a custom RIDE = the riders run to the drawn spots
 *     (mirrored), then ride MAN or ZONE as drawn (v420c's ride engine).
 *   The other player's own steered defender (netCtl) is never moved by any of this.
 * Old peer: capability rides the lobby 'ver' message (ADDED field np558) and an ADDED 'n558h' hello; an older app on either side
 *   = today's online game. Net protocol: only ADDED (ver.np558, n558h, n558d). Nothing changed or removed.
 * Kill switch: window.__rl_no558np = true (checked live) -> exactly today's online game (the edited old files see "online").
 * Offline: nothing here runs. No ids, rl_* keys or saves touched. Stats: window.V558NP.
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v558np_loaded) return;
 W0.__rl_v558np_loaded = 1;
 const N = W0.RLNET;
 if (!N || !N.Link || !N.Link.prototype || typeof W0.step !== 'function') { W0.V558NP = { on: () => false, cap: () => false, ride: () => null, why: 'missing' }; return; }
 const killed = () => !!(W0.__rl_no558np || W0.__rl_v124gb);
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const now = () => performance.now();
 const hyp = Math.hypot;
 const LOG = { ev: [], err: 0, lastErr: null, st: { sent: 0, recv: 0, shape: 0, man: 0, slides: 0, lockF: 0, lockSwaps: 0, zoneRemap: 0, rides: 0, rideNormal: 0, rideCustom: 0, dmF: 0 } };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 60) LOG.ev.shift(); };
 const er = (e, w) => { LOG.err++; LOG.lastErr = (w || '') + ': ' + String(e && e.message || e).slice(0, 160); if (LOG.err < 4) try { console.warn('v558', w, e); } catch (x) {} };
 const C = { peer: false, link: null, helloT: 0, n: 0, acked: false };
 const S = { his: null, hisAt: 0, sentKey: '', sentAt: 0, buildAt: 0, mine: null, epoch: 0, wasAuth: false };

 /* ---------------- capability ---------------- */
 const LP = N.Link.prototype;
 const SEND0 = LP.send;
 LP.send = function (e) { try { if (e && e.t === 'ver' && !killed()) e.np558 = 1; } catch (x) {} return SEND0.apply(this, arguments); };
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try {
   if (e && !killed()) {
    if (e.t === 'ver' && e.np558) peerCap('ver');
    else if (e.t === 'n558h') { peerCap('hello'); if (!e.a && !C.acked) { C.acked = true; try { N.link && N.link.send({ t: 'n558h', c: 558, a: 1 }); } catch (x) {} } }
    else if (e.t === 'n558d') { peerCap('d'); gotD(e); }
   }
  } catch (x) { er(x, 'event'); }
  return GE0.apply(this, arguments);
 };
 function peerCap(why) { if (!C.peer) lg({ ev: 'cap', why: why }); C.peer = true; }
 function capTick() {
  if (!N.link) { C.peer = false; C.n = 0; C.acked = false; C.link = null; S.his = null; S.sentKey = ''; return; }
  if (C.link !== N.link) { C.link = N.link; C.peer = false; C.n = 0; C.acked = false; S.his = null; S.sentKey = ''; }
  if (!killed() && !C.peer && C.n < 12 && now() - C.helloT > 3000) { C.helloT = now(); C.n++; try { N.link.send({ t: 'n558h', c: 558, a: 0 }); } catch (e) {} }
 }
 const okGame = G => !!G && !G.tutorial && !G.practice && !G.brave;
 // both phones have this build, in an online match (either phone)
 function cap() { if (killed() || !C.peer || !N.inGame) return false; const G = G_(); return okGame(G); }
 // ... and THIS phone runs the play
 function on() { return !!N.auth && cap(); }

 /* ---------------- what I send: my defensive picks ---------------- */
 const r1 = v => Math.round(v * 10) / 10;
 const CLp = (v, a, b) => Math.max(a, Math.min(b, v));
 function myD(G) {
  const o = {};
  // custom D, MAN type (v404d): drawn shape (cage-relative, the same form 'ds26' uses) + slide package
  try {
   if (!W0.__rl_no404d && G.dset === 'custom' && typeof dCustomPlay === 'function' && (typeof V13ON !== 'function' || V13ON())) {
    const p = dCustomPlay();
    if (p && p.dk === 'man' && Array.isArray(p.start) && p.start.length >= 6) o.dm = { sl: p.slide === 'crease' ? 'crease' : 'adj', z: p.start.slice(0, 6).map(q => [ r1(CLp(GX - q[0], CREASE + 4, 190)), r1(CLp(q[1] - CY, FT + 12 - CY, FB - 3 - CY)) ]) };
   }
  } catch (e) { er(e, 'myDm'); }
  // LOCK OFF (v411l): [their guy id, my guy id], max 3
  try {
   if (!W0.__rl_no411l && W0.V411L && W0.V411L.on) {
    let L = Array.isArray(G.lk411) ? G.lk411 : null;
    if (!L) {
     try { const s = JSON.parse(localStorage.getItem('rl_lockoff411') || 'null'); const a = s && s.byOpp && s.byOpp[G.opp != null ? String(G.opp) : '_slots']; L = Array.isArray(a) ? a : []; } catch (e) { L = []; }
    }
    let du = [], ou = [];
    try { du = defUnit(G.lu[0]) || []; ou = offUnit(G.lu[1]) || []; } catch (e) {}
    const res = (id, arr) => { const s = String(id); if (s.startsWith('slot:')) { const p = arr[+s.slice(5)]; return p && p.id != null ? String(p.id) : null; } return s; };
    const lk = [];
    for (const p of L.slice(-3)) { if (!p) continue; const a = res(p.o, ou), d = res(p.d, du); if (a && d) lk.push([ a, d ]); }
    if (lk.length) o.lk = lk;
   }
  } catch (e) { er(e, 'myLk'); }
  // RIDE pick: NORMAL / 10-MAN / custom (drawn spots in MY orientation: my cage left)
  try {
   if (typeof rideCall === 'function' && (typeof V13ON !== 'function' || V13ON())) {
    const c = rideCall('U');
    if (c === '10-MAN RIDE' || c === 'STANDARD RIDE') o.rd = { c: c };
    else if (!W0.__rl_no420c && W0.V420C && W0.V420C.on && typeof rideCustom === 'function') {
     const p = rideCustom();
     if (p && Array.isArray(p.start) && p.start.length >= 10 && p.start.slice(0, 10).every(q => Array.isArray(q) && isFinite(q[0]) && isFinite(q[1]))) o.rd = { c: 'C', k: p.dk === 'man' ? 'man' : 'zone', nm: String(p.name || 'RIDE').toUpperCase().slice(0, 14), s: p.start.slice(0, 10).map(q => [ r1(q[0]), r1(q[1]) ]) };
    }
   }
  } catch (e) { er(e, 'myRd'); }
  return o;
 }
 function sendTick() {
  const L = N.link;
  if (!L || !cap()) return;
  const t = now();
  if (t - S.buildAt < 700) return;
  S.buildAt = t;
  const G = G_();
  const o = myD(G), key = JSON.stringify(o);
  if (key !== S.sentKey || t - S.sentAt > 5000) {
   S.sentKey = key; S.sentAt = t; S.mine = o;
   try { L.send(Object.assign({ t: 'n558d', c: 558 }, o)); LOG.st.sent++; } catch (e) { er(e, 'send'); }
  }
 }
 // what the other player sent (sanitized)
 const num = v => typeof v === 'number' && isFinite(v);
 const pt = q => Array.isArray(q) && num(q[0]) && num(q[1]);
 function gotD(e) {
  const h = {};
  if (e.dm && Array.isArray(e.dm.z) && e.dm.z.length >= 6 && e.dm.z.slice(0, 6).every(pt)) h.dm = { sl: e.dm.sl === 'crease' ? 'crease' : 'adj', z: e.dm.z.slice(0, 6).map(q => [ CLp(q[0], 0, 220), CLp(q[1], -90, 90) ]) };
  if (Array.isArray(e.lk)) { const lk = e.lk.filter(q => Array.isArray(q) && q[0] != null && q[1] != null).slice(0, 3).map(q => [ String(q[0]), String(q[1]) ]); if (lk.length) h.lk = lk; }
  if (e.rd && (e.rd.c === '10-MAN RIDE' || e.rd.c === 'STANDARD RIDE')) h.rd = { c: e.rd.c };
  else if (e.rd && e.rd.c === 'C' && Array.isArray(e.rd.s) && e.rd.s.length >= 10 && e.rd.s.slice(0, 10).every(pt)) h.rd = { c: 'C', k: e.rd.k === 'man' ? 'man' : 'zone', nm: String(e.rd.nm || 'RIDE').replace(/[^A-Z0-9 '!?.#&-]/gi, '').toUpperCase().slice(0, 14) || 'RIDE', s: e.rd.s.slice(0, 10).map(q => [ CLp(q[0], 0, FL), CLp(q[1], FT, FB) ]) };
  const k = JSON.stringify(h);
  if (!S.his || S.hisKey !== k) lg({ ev: 'his', dm: !!h.dm, lk: h.lk ? h.lk.length : 0, rd: h.rd ? h.rd.c : null });
  S.his = h; S.hisKey = k; S.hisAt = now(); LOG.st.recv++;
 }

 /* ---------------- RIDES (phone running the play = the clearing team; riders = the other player's team) ---------------- */
 // v420c asks this (online only) for the ride its engine runs for the riding team
 function ride(G) {
  if (!on() || !S.his || !S.his.rd || S.his.rd.c !== 'C' || !W0.V420C || !W0.V420C.RIDES) return null;
  const rd = S.his.rd, key = 'n558:' + rd.nm;
  const R = W0.V420C.RIDES;
  const sk = JSON.stringify(rd.s) + rd.k;
  if (!R[key] || R[key].__k !== sk) R[key] = { k: rd.k, d: 'THEIR RIDE', s: rd.s.map(q => [ FL - q[0], q[1] ]), __k: sk };
  return key;
 }
 const wrapG = (n, f) => { const o = W0[n]; if (typeof o !== 'function') return false; W0[n] = function () { return f.call(this, o, arguments); }; return true; };
 wrapG('rideOn', function (o, a) {
  const r = o.apply(this, a);
  try {
   if (r && a[0] === 'C' && on() && S.his && S.his.rd) {
    const c = S.his.rd.c;
    if (c === 'STANDARD RIDE') { LOG.st.rideNormal++; return false; }
    if (c === 'C' && ride(G_())) { LOG.st.rideCustom++; return false; }
   }
  } catch (e) { er(e, 'rideOn'); }
  return r;
 });
 // v420c's ride cue, said neutrally (both phones see it)
 wrapG('addFx', function (o, a) {
  try {
   if (a[0] === 'txt' && a[3] && typeof a[3].s === 'string' && a[3].s.indexOf('THEY RIDE: n558:') === 0) { a = [ a[0], a[1], a[2], Object.assign({}, a[3], { s: 'RIDE: ' + a[3].s.slice(16) }) ]; LOG.st.rides++; }
  } catch (e) {}
  return o.apply(this, a);
 });

 /* ---------------- custom MAN D + LOCK OFF for the defending team (team 'D' on the phone running the play) ---------------- */
 const D = { key: null, shape: false, t0: 0, inAt: null, men: 0, why: '' };
 function liveDefOk(G) { return on() && scr() === 'live' && !!G && !!G.players && !!S.his; }
 function dmState(G) {
  const k = S.epoch + ':' + (G.possCount || 0);
  if (D.key !== k) { D.key = k; D.shape = true; D.t0 = G.t || 0; D.inAt = null; D.men = 0; D.why = ''; }
  return D;
 }
 function assignMen(G) {
  if (G.pen) return 0;
  const def = G.players.filter(p => p.team === 'D' && !p.r26 && !(p.down > 0));
  const atk = G.players.filter(p => p.team === 'O' && !p.r26);
  if (def.length !== atk.length || def.length < 4) return 0;
  const pairs = [];
  for (const d of def) for (const a of atk) pairs.push([ hyp(d.x - a.x, d.y - a.y), d, a ]);
  pairs.sort((x, y) => x[0] - y[0]);
  const ud = new Set, ua = new Set;
  let n = 0;
  for (const [, d, a] of pairs) { if (ud.has(d) || ua.has(a)) continue; ud.add(d); ua.add(a); d.mark = a; a.mark0 = d; n++; }
  G.slide = null; G.rot = null;
  return n;
 }
 // true while the drawn shape is held (called once a frame, before the game's live update)
 function shapeTick(G) {
  const st = dmState(G);
  if (!st.shape) return false;
  const t = (G.t || 0) - st.t0, b = G.ball, c = G.carrier && b && b.state === 'held' ? G.carrier : null;
  if (st.inAt == null && ((c && c.x > RL_R) || (b && b.x > RL_R && b.state !== 'clear'))) st.inAt = t;
  const why = t > 7 ? 'time' : (G.beatT > 0 || G.dodge) ? 'dodge' : st.inAt != null && t - st.inAt >= 1.2 ? 'set' : b && (b.state === 'shot' || b.state === 'loose') ? b.state : '';
  if (why) { st.shape = false; st.why = why; st.men = assignMen(G); LOG.st.man++; lg({ ev: 'man', why: why, t: +t.toFixed(2), men: st.men }); return false; }
  return true;
 }
 let SHAPE = false;     // this frame: custom MAN D shape phase active
 let MANON = false;     // this frame: custom MAN D (after the shape) active -> slide package
 let ACT = null;        // lock defenders while the live update runs
 function lockPairs(G) {
  const L = S.his && S.his.lk;
  if (!L || !L.length || W0.__rl_no411l) return [];
  const def = G.players.filter(p => p.team === 'D'), atk = G.players.filter(p => p.team === 'O');
  const out = [], ud = new Set, ua = new Set;
  for (const [o, d0] of L) {
   const d = def.find(p => p.pl && String(p.pl.id) === d0), a = atk.find(p => p.pl && String(p.pl.id) === o);
   if (!d || !a || ud.has(d) || ua.has(a) || d.r26 || d.netCtl) continue;
   ud.add(d); ua.add(a); out.push({ d: d, a: a });
  }
  return out;
 }
 wrapG('updateLive', function (o, a) {
  const G = G_();
  SHAPE = false; MANON = false;
  if (!liveDefOk(G)) return o.apply(this, a);
  let P = [];
  const pre = new Map;
  try {
   if (S.his.dm && !G.clearing) {
    if (shapeTick(G)) { SHAPE = true; G.cpuDef = 'zone'; LOG.st.shape++; } else { MANON = true; LOG.st.dmF++; }
   } else if (S.his.dm && G.clearing) { const st = dmState(G); if (st.shape) { st.t0 = G.t || 0; st.inAt = null; } }
   P = lockPairs(G);
   if (P.length) {
    const def = G.players.filter(p => p.team === 'D');
    for (const { d, a: m } of P) {
     if (d.mark !== m) { const other = def.find(q => q !== d && q.mark === m); if (other) other.mark = d.mark && G.players.includes(d.mark) ? d.mark : null; d.mark = m; m.mark0 = d; LOG.st.lockSwaps++; }
     if (G.slide === d) { G.slide = null; G.rot = null; }
     if (G.rot && (G.rot.d === d || G.rot.m === m)) G.rot = null;
     if (G.hotP === d) G.hotP = null;
     pre.set(d, [ d.x, d.y ]);
    }
    ACT = new Set(P.map(q => q.d));
   }
  } catch (e) { er(e, 'preLive'); P = []; ACT = null; }
  let r;
  try { r = o.apply(this, a); } finally { ACT = null; SHAPE = false; }
  try {
   if (P.length && scr() === 'live' && G.players) {
    const b = G.ball, c = G.carrier;
    if (G.slide && P.some(q => q.d === G.slide)) { G.slide = null; G.rot = null; }
    for (const { d, a: m } of P) {
     if (!G.players.includes(d) || !G.players.includes(m)) continue;
     if (d.stun > 0 || d.down > 0 || d.netCtl) continue;
     if (!b || !(b.state === 'held' || b.state === 'pass') || b.clear || b.state === 'clear') continue;
     const p0 = pre.get(d);
     if (p0) { d.x = p0[0]; d.y = p0[1]; }
     const bref = c || (b.state === 'pass' && b.to) || b;
     let tx, ty, spd = PACE.dBall * 1.06;
     if (c && m === c) { const dx = GX - m.x, dy = CY - m.y, L = hyp(dx, dy) || 1; tx = m.x + dx / L * 5 + 2; ty = m.y + dy / L * 5; spd = PACE.dBall * 1.05; }
     else { const bx = bref.x - m.x, by = bref.y - m.y, L = hyp(bx, by) || 1; let tight = 4; if (b.state === 'pass' && b.to === m) { tight = 2.5; spd = PACE.dBall * 1.25; } tx = m.x + bx / L * tight + 1; ty = m.y + by / L * tight; }
     tx = Math.max(tx, MIDX + 4);
     if (hyp(tx - d.x, ty - d.y) > 14) spd = Math.max(spd, (PACE.chase || PACE.dBall) * .95);
     moveTo(d, tx, ty, spd, a[0]);
     LOG.st.lockF++;
    }
   }
  } catch (e) { er(e, 'postLive'); }
  return r;
 });
 // drawn shape while it is held
 wrapG('cpuZoneKind181', function (o, a) {
  try { if (SHAPE && S.his && S.his.dm) { ZONES.__n558 = S.his.dm.z; return '__n558'; } } catch (e) {}
  return o.apply(this, a);
 });
 // the lock guy is never a slider / rotator / hot help; the zone is built from the rest of the D
 const drop = arr => Array.isArray(arr) && ACT ? arr.filter(d => !ACT.has(d)) : arr;
 function slider(def, c, excl) {
  const G = G_(), dm = S.his && S.his.dm;
  if (!MANON || !dm || !G || !c || c.team !== 'O') return undefined;
  const ok = d => d && d.team === 'D' && d !== excl && d.mark !== c && d !== c.mark0 && !(d.stun > 0) && !(d.down > 0) && !d.busy && !d.r26 && !d.netCtl && !(ACT && ACT.has(d));
  const cand = def.filter(ok);
  if (!cand.length) return undefined;
  let best = null, bd = 1e9;
  if (dm.sl === 'crease') { for (const d of cand) { const k = hyp(d.x - GX, d.y - CY); if (k < bd) { bd = k; best = d; } } }
  else {
   const adj = G.players.filter(q => q.team === 'O' && q !== c && !q.r26).sort((p, q) => hyp(p.x - c.x, p.y - c.y) - hyp(q.x - c.x, q.y - c.y)).slice(0, 2);
   for (const d of cand) if (d.mark && adj.includes(d.mark)) { const k = hyp(d.x - c.x, d.y - c.y); if (k < bd) { bd = k; best = d; } }
   if (!best) for (const d of cand) { const k = hyp(d.x - c.x, d.y - c.y); if (k < bd) { bd = k; best = d; } }
  }
  if (best) LOG.st.slides++;
  return best || undefined;
 }
 wrapG('slideBest', function (o, a) {
  try { const s = slider(a[0], a[1], a[3]); if (s !== undefined) return s; } catch (e) { er(e, 'slide'); }
  if (!ACT) return o.apply(this, a);
  const x = Array.from(a); x[0] = drop(x[0]); return o.apply(this, x);
 });
 wrapG('hotPick', function (o, a) {
  try { const s = slider(a[0], a[1], a[4]); if (s !== undefined) return s; } catch (e) { er(e, 'hot'); }
  if (!ACT) return o.apply(this, a);
  const x = Array.from(a); x[0] = drop(x[0]); const r = o.apply(this, x); return r && ACT.has(r) ? null : r;
 });
 wrapG('rotatePick', function (o, a) { if (!ACT) return o.apply(this, a); const x = Array.from(a); x[0] = drop(x[0]); const r = o.apply(this, x); return r && ACT.has(r) ? null : r; });
 wrapG('zoneTargets', function (o, a) {
  const list = a[0];
  if (!ACT || !Array.isArray(list) || a[4] !== false || !list.some(d => ACT.has(d))) return o.apply(this, a);
  const rest = list.filter(d => !ACT.has(d));
  if (!rest.length) return o.apply(this, a);
  const x = Array.from(a); x[0] = rest;
  const z = o.apply(this, x);
  if (!z || !Array.isArray(z.pts)) return z;
  const pts = [], map = [];
  let k = 0;
  list.forEach((d, i) => { if (ACT.has(d)) pts.push([ d.x, d.y ]); else { map[k] = i; pts.push(z.pts[k] || [ d.x, d.y ]); k++; } });
  LOG.st.zoneRemap++;
  return Object.assign({}, z, { pts: pts, onBall: z.onBall >= 0 && map[z.onBall] != null ? map[z.onBall] : -1 });
 });

 /* ---------------- per frame ---------------- */
 const ST0 = W0.step;
 W0.step = function () {
  try {
   capTick();
   if (!killed()) {
    const au = !!N.auth;
    if (au && !S.wasAuth) {
     S.epoch++;
     // this phone just started running the play: v420c's clear / ride edge memory is from before it last handed off
     // (it does not run while this phone only watches) - start clean so a new clear gets a fresh ride
     if (C.peer && N.inGame) { const G = G_(); if (G) { G.uc0420 = false; G.cc0420 = false; if (G.cr420) G.cr420.done = 1; } }
    }
    S.wasAuth = au;
    if (C.peer && N.inGame) sendTick();
   }
  } catch (e) { er(e, 'step'); }
  return ST0.apply(this, arguments);
 };
 W0.V558NP = { on: on, cap: cap, ride: ride, LOG: LOG, S: S, C: C, D: D, myD: () => { const G = G_(); return G ? myD(G) : null; },
  __t: { slider: (def, c) => { const m = MANON; MANON = true; try { return slider(def, c, null); } finally { MANON = m; } } } };
})();
