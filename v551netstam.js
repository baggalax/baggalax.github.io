// v551netstam.js - V55.1: STAMINA + AUTO SUBS ONLINE (Charlie, Nov 12 9:28 AM: "port them now. Online should be the same.")
// Before: v422st stamina (tired z's, x0.93 speed under 40, coach "#NN IS GASSED - SUB HIM OFF?") and v428as auto specialist
// subs / follow the sub / CANCEL FOLLOW were switched off in online matches (they check game.online), because only the phone
// whose team has the ball runs the play (the "authority") and nothing about them was ever sent to the other phone.
// Now, when BOTH phones run this build (and v545 live subs are on for the match):
//  STAMINA - the phone running the play drains / rests every player (both teams) with v422st's own numbers (ST422.CFG) and
//   sends the values every 0.4 s with its snapshots (added field 's51') and in the 'poss' hand-off (added field 's51'), so the
//   other phone shows the same tired guys and carries on with the same numbers after a turnover. Dead balls with nobody
//   running the play (faceoff wait, quarter break): both phones add the same rest from the same (synced) lineups and the next
//   snapshot squares them up. Speed effect only on the phone running the play (x1.00 at 40+, down to x0.93 at 0), z's over
//   tired heads on both screens, your own coach tells YOU at the whistle "#NN IS GASSED - SUB HIM OFF?" (once per tired spell),
//   and the SUB picker (v545) shows a little stamina bar under every name. Offline the CPU rotated its own tired guys at dead
//   balls; online both teams are people, so (like your team offline) nobody is rotated for you - the coach tells you.
//  AUTO SUBS (v428as rules, on top of the v545 sub jobs) - the phone running the play:
//   1) once your team has the ball safely in their end (the clear is over / settled possession over the midline), your FOGO, LSM
//      and D-middies still on the field jog off one at a time through your box and the most rested offensive middie comes on;
//      never the carrier / a pass target / a guy who is down or in a ground ball, once per possession, a guy you subbed back on
//      yourself stays on, nobody if no O-middie is on the bench; turned over before he reaches the box -> he stays on and plays D.
//   2) FOLLOW THE SUB: a mismatched defender (O-middie / attackman / FOGO on D) whose man jogs off follows him off and his team's
//      best defensive middie comes on. Called off if his man stays on or his team gets the ball.
//   3) CANCEL FOLLOW button (top centre) on the phone whose guy is following: tap -> he stays on (request 'n551c' if the other
//      phone is running the play). Every sub is a normal v545 job, so both screens show the same OFF / ON tags and lineups.
// Old peer: capability rides the lobby 'ver' message (added field ns551) and an added 'n551h' hello; if the other phone is an
// older build nothing here runs for the match (today's behaviour). Net protocol: only ADDED messages (n551h, n551c, n551s) and
// fields (ver.ns551, poss.s51, snapshot s51). Kill switches: window.__rl_no551ns = true (everything here off, exactly the old
// behaviour), window.__rl_no551as = true (auto subs only off). No ids, rl_* keys or saves touched.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v551ns_loaded) return;
 W0.__rl_v551ns_loaded = 1;
 const N = W0.RLNET;
 if (!N || !N.Link || !N.Link.prototype || typeof W0.step !== 'function' || typeof W0.spdMul !== 'function') { W0.V551NS = { on: () => false, why: 'missing' }; return; }
 const killed = () => !!(W0.__rl_no551ns || W0.__rl_v124gb);
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const now = () => performance.now();
 const LOG = { ev: [], err: 0, lastErr: null, stats: { adopt: 0, sent: 0, coach: 0, auto: 0, follow: 0, cancel: 0, cancelReq: 0, stayOn: 0, guard: 0, zFrames: 0 } };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 300) LOG.ev.shift(); };
 const er = (e, w) => { LOG.err++; LOG.lastErr = (w || '') + ': ' + String(e && e.message || e).slice(0, 160); if (LOG.err < 4) try { console.warn('v551', w, e); } catch (x) {} };
 const CFG = (W0.ST422 && W0.ST422.CFG) || { ref: 360, base: .18, mv: .29, posF: { M: 1, LSM: .85, SSDM: 1, FO: 1, A: .45, D: .5, G: .12 }, unitRest: .11, dead: .22, bench: 1.6, qbreak: 4, half: 10, z1: 50, z2: 35, z3: 20, slowAt: 40, slowMax: .07, coachAt: 35, spellEnd: 60, coachCd: 12 };
 const S = { ep: (Math.random() * 1e9 | 0).toString(36), cap: false, hellos: 0, helloT: 0, replied: 0, linkRef: null, v: {}, last: new Map, spell: {}, coachT: -99, q: null, sentAt: 0, authEp: 0, wasAuth: false, auto: {}, follow: {}, poss: null, uLast: -9, followed: {}, inGame: false };
 function resetMatch() { S.v = {}; S.last = new Map; S.spell = {}; S.coachT = -99; S.q = null; S.auto = {}; S.follow = {}; S.poss = null; S.followed = {}; S.uLast = -9; }
 const NSon = () => { try { return !!(W0.V545NS && W0.V545NS.on && W0.V545NS.on()); } catch (e) { return false; } };
 const on = () => { const G = G_(); return !killed() && S.cap && !!N.inGame && !!G && !G.tutorial && !G.practice && !G.brave; };
 const asOn = () => on() && !W0.__rl_no551as && NSon();
 const other = sd => sd === 'h' ? 'g' : 'h';
 const mySide = () => N.side === 'g' ? 'g' : 'h';
 const sideOfP = p => (p.team === 'O' || p.team === 'G2' || p.team === 'U') ? mySide() : other(mySide());
 const keyOf = p => p && p.pl && p.pl.id != null ? sideOfP(p) + ':' + p.pl.id : null;
 const PPx = id => { try { return PP(id) || PP(+id); } catch (e) { return null; } };
 const posOf = id => { const p = PPx(id); return p ? p.pos : null; };
 const teamId = sd => { const st = N.st || {}; return sd === 'h' ? st.hteam : st.gteam; };
 const src0 = G => G && G.mode === 'season' ? 'season' : 'real';
 const ln = id => { try { return lastName(PPx(id)); } catch (e) { return String(id); } };
 const numOf = (id, sd) => { try { const G = G_(); const n = jerseyNo(PPx(id), src0(G), teamId(sd)); return n === '' || n == null ? '' : String(n); } catch (e) { return ''; } };
 const tag = (id, sd) => { const n = numOf(id, sd); return (n ? n + ' ' : '') + ln(id); };
 const luOf = (G, sd) => (G && G.lu && G.lu[sd === mySide() ? 0 : 1]) || {};
 function luIds(G, sd) { const lu = luOf(G, sd), out = new Set; if (typeof SLOTS === 'undefined') return out; for (const sl of SLOTS) { const id = slotGet(lu, sl[0]); if (id != null) out.add(String(id)); } return out; }
 const fieldList = G => (G.players || []).concat(G.farU || [], G.farC || []);
 const posF = pos => { const f = CFG.posF[pos]; return f == null ? .6 : f; };
 const scale = G => Math.max(.25, Math.min(4, CFG.ref / Math.max(30, (G.periods || 4) * (G.qlen || 90))));
 const val = k => { const v = S.v[k]; return v == null ? 100 : v; };
 const mulOf = v => v >= CFG.slowAt ? 1 : 1 - CFG.slowMax * (CFG.slowAt - Math.max(0, v)) / CFG.slowAt;
 const viewScr = () => { const V = N.view; return V && V.scr || ''; };
 // ---------- stamina engine ----------
 function rest(G, dt, fo) {
  // nobody is running the play (or a dead ball on the phone that is): lineup guys get the dead-ball rest, bench guys the bench rest
  const k = scale(G);
  for (const sd of [ 'h', 'g' ]) {
   const lu = luIds(G, sd);
   for (const id of lu) { if (fo) continue; const key = sd + ':' + id; S.v[key] = Math.min(100, val(key) + CFG.dead * k * dt); }
   for (const key in S.v) if (key[0] === sd && !lu.has(key.slice(2))) S.v[key] = Math.min(100, S.v[key] + CFG.bench * k * dt);
  }
 }
 function qBump(G) {
  if (S.q == null) { S.q = G.q; return; }
  if (G.q !== S.q) { const b = S.q === 2 && G.q === 3 ? CFG.half : CFG.qbreak; for (const key in S.v) S.v[key] = Math.min(100, S.v[key] + b); S.q = G.q; }
 }
 function authTick(G, dt, sc) {
  const k = scale(G), active = sc === 'live' || sc === 'defense', fo = sc === 'faceoff', dead = !active && !fo;
  if (dead) { rest(G, dt, false); S.last = new Map; return; }
  const seen = new Set, nl = new Map;
  for (const p of fieldList(G)) {
   const key = keyOf(p);
   if (!key || seen.has(key)) continue;
   seen.add(key);
   const q = S.last.get(key);
   let v = 0;
   if (q && q[2] === p) { const d = Math.hypot(p.x - q[0], p.y - q[1]); if (d < 4) v = d / dt; }
   nl.set(key, [ p.x, p.y, p ]);
   const run = Math.min(1.6, v / ((typeof PACE !== 'undefined' && PACE.run) || 22));
   S.v[key] = Math.max(0, val(key) - k * posF(p.pl.pos || 'M') * ((active ? CFG.base : 0) + CFG.mv * run) * dt);
  }
  S.last = nl;
  const lu = { h: luIds(G, 'h'), g: luIds(G, 'g') };
  for (const key in S.v) {
   if (seen.has(key)) continue;
   const inLu = lu[key[0]] && lu[key[0]].has(key.slice(2));
   S.v[key] = Math.min(100, S.v[key] + (!inLu ? CFG.bench : CFG.unitRest) * k * dt);
  }
 }
 function tick(dt) {
  const G = G_();
  if (!N.inGame) { if (S.inGame) { S.inGame = false; resetMatch(); } return; }
  if (!S.inGame) { S.inGame = true; resetMatch(); lg({ ev: 'begin', side: N.side, cap: S.cap }); }
  if (!on() || !(dt > 0) || dt > .25) return;
  const sc = scr();
  if (sc === 'final' || sc === 'pregame') return;
  if (N.auth && !S.wasAuth) { S.authEp++; S.last = new Map; }
  S.wasAuth = !!N.auth;
  qBump(G);
  if (N.auth) authTick(G, dt, sc);
  else {
   const vs = viewScr();
   if (sc === 'netview' && (vs === 'live' || vs === 'defense' || vs === 'scene')) { /* the other phone's numbers arrive with its snapshots */ }
   else rest(G, dt, sc === 'faceoff' || vs === 'faceoff');
  }
  for (const key in S.spell) if (val(key) >= CFG.spellEnd) delete S.spell[key];
  try { coach(G); } catch (e) { er(e, 'coach'); }
  if (N.auth && asOn()) { try { autoTick(G, dt); } catch (e) { er(e, 'auto'); } }
 }
 const COACHSCR = { banner: 1, faceoff: 1, penalty: 1, qbreak: 1 };
 function coach(G) {
  const sc = scr(), vs = viewScr();
  if (!COACHSCR[sc] && !(sc === 'netview' && COACHSCR[vs])) return;
  const t = typeof menuT === 'number' ? menuT : now() / 1e3, me = mySide(), lu = luIds(G, me);
  if (t - S.coachT < CFG.coachCd) return;
  let worst = null;
  for (const key in S.v) {
   if (key[0] !== me || S.spell[key]) continue;
   const v = S.v[key], id = key.slice(2);
   if (v >= CFG.coachAt || posOf(id) === 'G' || !lu.has(id)) continue;
   if (!worst || v < worst[1]) worst = [ key, v, id ];
  }
  if (!worst) return;
  S.spell[worst[0]] = true; S.coachT = t;
  const pl = PPx(worst[2]);
  let num = '';
  try { num = pl ? (typeof gameNum15 === 'function' ? gameNum15(pl) : jerseyNo(pl)) : ''; } catch (e) { num = ''; }
  const s = (num !== '' && num != null ? '#' + num : pl ? String(lastName(pl)).toUpperCase() : 'HE') + ' IS GASSED - SUB HIM OFF?';
  try {
   if (typeof pop12 === 'function' && typeof coachX === 'function') pop12(s, clamp(coachX('u'), Math.round(camX) + 70, Math.round(camX) + W - 70), H - 36, '#ffe14d', 2.8, true);
   else addFx('cue', 0, 0, { s: s, col: '#ffe14d', life: 2.4 });
  } catch (e) { er(e, 'pop'); }
  LOG.stats.coach++; lg({ ev: 'coach', id: worst[2], v: Math.round(worst[1]), s: s });
 }
 // ---------- wire ----------
 function pack() {
  const v = {}; for (const k in S.v) v[k] = Math.round(S.v[k] * 10);
  return { e: S.ep, v: v, a: Object.keys(S.auto), f: Object.keys(S.follow).map(id => [ id, S.follow[id] ]) };
 }
 function adopt(o, why) {
  if (!o || typeof o.v !== 'object') return;
  for (const k in o.v) { const x = +o.v[k]; if (isFinite(x)) S.v[k] = Math.max(0, Math.min(100, x / 10)); }
  if (Array.isArray(o.a)) { S.auto = {}; for (const id of o.a) S.auto[id] = 1; }
  if (Array.isArray(o.f)) { S.follow = {}; for (const p of o.f) if (Array.isArray(p)) S.follow[p[0]] = p[1]; }
  LOG.stats.adopt++;
  if (why !== 'snap') lg({ ev: 'adopt', why: why, n: Object.keys(o.v).length });
 }
 const LP = N.Link.prototype;
 const SEND0 = LP.send;
 LP.send = function (e) {
  try {
   if (e && !killed()) {
    if (e.t === 'ver') e.ns551 = 1;
    if (e.t === 'poss' && on()) { e.s51 = pack(); lg({ ev: 'handOut' }); }
   }
  } catch (x) { er(x, 'send'); }
  return SEND0.apply(this, arguments);
 };
 const LAT0 = LP.latest;
 LP.latest = function (o) {
  try { if (o && o.k === 's' && on() && N.auth && now() - S.sentAt > 400) { S.sentAt = now(); o.s51 = pack(); LOG.stats.sent++; } } catch (x) { er(x, 'latest'); }
  return LAT0.apply(this, arguments);
 };
 const GL0 = LP.gotLatest;
 LP.gotLatest = function (o) {
  try { if (o && o.k === 's' && o.s51 && on() && !N.auth) adopt(o.s51, 'snap'); } catch (x) { er(x, 'gotLatest'); }
  return GL0.apply(this, arguments);
 };
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  try { if (e && !killed()) inEvent(e, this); } catch (x) { er(x, 'event'); }
  return GE0.apply(this, arguments);
 };
 function inEvent(e, link) {
  switch (e.t) {
   case 'ver': if (e.ns551) setCap('ver'); break;
   case 'n551h': setCap('hello'); if (!e.re && S.replied < 3) { S.replied++; try { N.link.send({ t: 'n551h', c: 551, re: 1 }); } catch (x) {} } break;
   case 'poss': if (e.s51 && on()) adopt(e.s51, 'poss'); break;
   case 'n551s': if (e.s && on() && !N.auth) adopt(e.s, 'resync'); break;
   case 'n551c': if (on() && N.auth && e.id) cancelFollow(String(e.id), 'peer'); break;
   case 'hello': if (on() && e.rejoin) { try { N.link.send({ t: 'n551s', s: pack() }); } catch (x) {} } break;
  }
 }
 function setCap(why) { if (!S.cap) lg({ ev: 'cap', why: why }); S.cap = true; }
 // ---------- speed (only below 40) ----------
 const SM0 = W0.spdMul;
 W0.spdMul = function (p) {
  const r = SM0.apply(this, arguments);
  try {
   if (!p || !p.pl || p.gk || p.team === 'G' || p.team === 'G2' || !on()) return r;
   const v = S.v[keyOf(p)];
   return v == null || v >= CFG.slowAt ? r : r * mulOf(v);
  } catch (e) { return r; }
 };
 // ---------- ST422 API answers online too (v545 / tests read it) ----------
 if (W0.ST422) {
  const ST = W0.ST422, o0 = {};
  for (const k of [ 'on', 'get', 'tiredIds', 'snap' ]) o0[k] = ST[k];
  const sdOf = side => side === 1 || side === 'c' ? other(mySide()) : mySide();
  ST.on = function () { return on() ? true : o0.on.apply(this, arguments); };
  ST.get = function (id, side) {
   if (!on()) return o0.get.apply(this, arguments);
   let k = sdOf(side) + ':' + id;
   if (side == null && S.v[k] == null && S.v[other(mySide()) + ':' + id] != null) k = other(mySide()) + ':' + id;
   return Math.round(val(k) * 10) / 10;
  };
  ST.tiredIds = function (side) {
   if (!on()) return o0.tiredIds.apply(this, arguments);
   const G = G_(), sd = sdOf(side), lu = luIds(G, sd);
   return Object.keys(S.v).filter(k => k[0] === sd && S.v[k] < CFG.coachAt && posOf(k.slice(2)) !== 'G' && lu.has(k.slice(2))).map(k => k.slice(2));
  };
  ST.snap = function () {
   if (!on()) return o0.snap.apply(this, arguments);
   const o = {}, me = mySide(); for (const k in S.v) o[(k[0] === me ? 'u' : 'c') + ':' + k.slice(2)] = Math.round(S.v[k]); return o;
  };
 }
 // ---------- z's over tired heads (both screens) ----------
 const SHOWZ = { live: 1, defense: 1, faceoff: 1, banner: 1, penalty: 1, timeout: 1, netview: 1 };
 function zGlyph(x, y, n, col) {
  const d = (ox, oy, c) => { rect(x + ox, y + oy, n, 1, c); for (let i = 1; i < n - 1; i++) rect(x + ox + n - 1 - i, y + oy + i, 1, 1, c); rect(x + ox, y + oy + n - 1, n, 1, c); };
  d(1, 1, 'rgba(0,0,0,.55)'); d(0, 0, col);
 }
 function drawZ(G) {
  const t = typeof menuT === 'number' ? menuT : now() / 1e3, seen = new Set;
  for (const p of fieldList(G)) {
   const key = keyOf(p);
   if (!key || seen.has(key)) continue;
   seen.add(key);
   const v = S.v[key];
   if (v == null || v >= CFG.z1 || p.gk || p.team === 'G' || p.team === 'G2' || (p.role === 'G' && p.far)) continue;
   const lvl = v < CFG.z3 ? 3 : v < CFG.z2 ? 2 : 1;
   const X = Math.round(p.x + (p._sox || 0)), Y = Math.round(p.y + (p._soy || 0));
   const ph = ((parseInt(String(p.pl.id).replace(/\D/g, ''), 10) || 0) % 7) * .23;
   for (let i = 0; i < lvl; i++) {
    const u = ((t * .3 + ph + i / lvl) % 1), a = u < .12 ? u / .12 : u > .82 ? (1 - u) / .18 : 1;
    g.globalAlpha = Math.max(0, Math.min(1, a)) * .8;
    zGlyph(X + 3 + Math.round(u * 4), Y - 14 - Math.round(u * 6), u > .45 ? 4 : 3, '#f2f8ff');
   }
   g.globalAlpha = 1;
  }
  LOG.stats.zFrames++;
 }
 const DP0 = W0.drawPlayers;
 if (typeof DP0 === 'function') W0.drawPlayers = function () {
  const r = DP0.apply(this, arguments);
  try { const G = G_(); if (on() && G && SHOWZ[scr()]) drawZ(G); } catch (e) { try { g.globalAlpha = 1; } catch (x) {} er(e, 'z'); }
  return r;
 };
 // ---------- AUTO SUBS (on the phone running the play, through the v545 sub jobs) ----------
 const NSX = () => W0.V545NS && W0.V545NS.NS;
 const liveJobs = () => { const X = NSX(); return X ? X.jobs.filter(j => j.ph !== 'done') : []; };
 const preSwap = j => j && (j.ph === 'wait' || j.ph === 'toBox');
 function busyIds(sd) { const s = new Set; const X = NSX(); if (!X) return s; for (const j of liveJobs()) if (!sd || j.tm === sd) { s.add(j.out); s.add(j.inn); } for (const q of (X.inReqs || [])) if (!sd || q.tm === sd) { s.add(q.out); s.add(q.inn); } return s; }
 function ents(G, sd) {
  const mine = sd === mySide(), out = [];
  for (const p of G.players || []) if (!p.far && p.pl && !p.gk && (mine ? p.team === 'O' : p.team === 'D')) out.push(p);
  const far = mine ? G.farU : G.farC;
  if (far && G.farMode !== 'fo') for (const f of far) if (f && f.pl && f.role !== 'G' && !out.some(q => q.pl.id === f.pl.id)) out.push(f);
  return out;
 }
 const near = (G, sd) => (G.players || []).filter(p => !p.far && p.pl && !p.gk && (sd === mySide() ? p.team === 'O' : p.team === 'D'));
 function outIds(G) {
  const s = new Set([].concat(G.ejected || [], G.concOut || [], G.gout16 || [], G.ns17 || []));
  if (G.pen && G.pen.who) s.add(G.pen.who.id || G.pen.who);
  for (const q of (Array.isArray(G.pens) ? G.pens : [])) if (q && q.who) s.add(q.who.id || q.who);
  return s;
 }
 function onField(G, sd) { const s = new Set; for (const p of ents(G, sd)) s.add(p.pl.id); for (const p of (G.players || [])) if (p.pl && p.gk && (sd === mySide() ? p.team === 'G2' : p.team === 'G')) s.add(p.pl.id); return s; }
 function bench(G, sd) {
  let ros = []; try { ros = teamRosterIds(teamId(sd), src0(G)) || []; } catch (e) {}
  const ON = onField(G, sd), OUT = outIds(G), B = busyIds(sd);
  const inj = id => { try { return G.mode === 'season' && typeof injOf === 'function' && injOf(id); } catch (e) { return false; } };
  return ros.filter(id => { const p = PPx(id); return p && p.pos !== 'G' && !ON.has(id) && !OUT.has(id) && !B.has(id) && !inj(id); });
 }
 function kindOf(G, sd, id) {
  const L = luOf(G, sd), pos = posOf(id);
  if (!id || pos === 'G') return null;
  if ((L.M || []).includes(id) || (L.A || []).includes(id)) return null;
  if (id === L.FO || pos === 'FO') return 'FOGO';
  if (id === L.LSM || pos === 'LSM') return 'LSM';
  if (id === L.SSDM || id === L.SSDM2) return 'DMID';
  return null;
 }
 function mismatched(G, sd, id) {
  const L = luOf(G, sd), pos = posOf(id);
  if (!id || pos === 'G') return null;
  if (id === L.FO || pos === 'FO') return 'FOGO';
  if (id === L.SSDM || id === L.SSDM2 || id === L.LSM || pos === 'LSM' || pos === 'D' || (L.D || []).includes(id)) return null;
  if ((L.M || []).includes(id)) return 'OMID';
  if ((L.A || []).includes(id) || pos === 'A') return 'ATT';
  if (pos === 'M') return 'OMID';
  return null;
 }
 const stam = (sd, id) => val(sd + ':' + id);
 function pickOMid(G, sd, b) {
  const L = luOf(G, sd);
  const ok = b.filter(id => posOf(id) === 'M' && id !== L.SSDM && id !== L.SSDM2 && id !== L.FO);
  const pri = id => (L.M || []).includes(id) ? 0 : 1;
  ok.sort((x, y) => pri(x) - pri(y) || stam(sd, y) - stam(sd, x));
  return ok[0] || null;
 }
 function pickDef(G, sd, b) {
  const L = luOf(G, sd);
  const rt = id => { const p = PPx(id); return p && p.r ? +p.r.def || 0 : 0; };
  const pri = id => (id === L.SSDM || id === L.SSDM2) ? 0 : (id === L.LSM || posOf(id) === 'LSM') ? 1 : posOf(id) === 'M' && !(L.M || []).includes(id) ? 2 : posOf(id) === 'M' ? 3 : posOf(id) === 'D' ? 4 : 9;
  const ok = b.filter(id => pri(id) < 9 && posOf(id) !== 'FO' && id !== L.FO);
  ok.sort((x, y) => pri(x) - pri(y) || (stam(sd, y) - stam(sd, x)) * .5 + (rt(y) - rt(x)));
  return ok[0] || null;
 }
 const ballTo = G => { const b = G.ball; return b && b.state === 'pass' ? b.to : null; };
 const hasBall = (G, e) => !!e && (G.carrier === e || G.dcar === e || (G.dclear && G.dclear.holder === e) || ballTo(G) === e);
 function inPlay(G, e) {
  if (!e) return true;
  if (e.down > 0 || e.stun > 0 || e.ns17 || e.lunge) return true;
  if (G.gb && (G.gb.p === e || G.gb.who === e)) return true;
  if (G.chase === e || (Array.isArray(G.chasers) && G.chasers.includes(e))) return true;
  const b = G.ball; if (b && (b.state === 'loose' || b.state === 'ground') && Math.hypot(e.x - b.x, e.y - b.y) < 40) return true;
  return false;
 }
 function possSide(G) {
  const b = G.ball; if (!b) return null;
  const isMine = p => p.team === 'O' || p.team === 'G2' || p.team === 'U';
  if (b.state === 'held' || b.state === 'clear') { const c = G.carrier || G.dcar || (G.dclear && G.dclear.holder); return c ? (isMine(c) ? mySide() : other(mySide())) : null; }
  if (b.state === 'pass' && b.to) return isMine(b.to) ? mySide() : other(mySide());
  return null;
 }
 function inject(G, sd, out, inn, kind) {
  const X = NSX(); if (!X) return null;
  const id = 'a5' + kind[0] + (++S.seqN || (S.seqN = 1)) + '-' + (Date.now() % 1e6).toString(36);
  X.inReqs.push({ id: id, tm: sd, out: out, inn: inn, at: now() });   // v545 starts it next frame, exactly like a SUB-screen request
  return id;
 }
 function possKey(G) { return S.authEp + ':' + scr(); }
 function P(G) { const k = possKey(G); if (!S.poss || S.poss.k !== k) S.poss = { k: k, t0: G.t, done: {}, manual: {}, clrT: null, wasClr: !!G.clearing }; return S.poss; }
 function cancelJob(G, j, why) {
  if (!j || !preSwap(j)) return false;
  j.ph = 'done'; j.why = 'timeout'; j.tDone = G.t; j.c551 = why;
  const X = NSX(); if (X) X.n++;
  const e = ents(G, j.tm).find(p => p.pl && p.pl.id === j.out);
  if (e) { e.tx = e.x; e.ty = e.y; e.wander = 0; e.react = 0; }
  lg({ ev: 'cancel', id: j.id, tm: j.tm, out: j.out, why: why });
  return true;
 }
 function cancelFollow(id, src) {
  const G = G_(); if (!G) return 0;
  let n = 0;
  for (const j of liveJobs()) if ((id == null || j.id === id) && S.follow[j.id] != null && preSwap(j)) { if (cancelJob(G, j, 'cancelFollow:' + src)) { n++; delete S.follow[j.id]; } }
  if (n) { LOG.stats.cancel += n; try { addFx('cue', 0, 0, { s: 'FOLLOW CANCELLED - HE STAYS ON', col: '#7dff7a', life: 1.2 }); } catch (x) {} }
  return n;
 }
 function autoTick(G, dt) {
  const sc = scr(), live = sc === 'live' || sc === 'defense';
  const jobs = liveJobs(), byId = new Map(jobs.map(j => [ j.id, j ]));
  for (const id in S.auto) if (!byId.has(id) || !preSwap(byId.get(id))) { if (!byId.has(id) || byId.get(id).ph !== 'on') delete S.auto[id]; }
  for (const id in S.follow) if (!byId.has(id)) delete S.follow[id];
  if (!live) return;
  const pz = possSide(G), p = P(G), me = mySide();
  // a guy subbed back on by a person (a SUB-screen job, not one of ours) stays on this possession
  for (const j of jobs) if (S.auto[j.id] == null && S.follow[j.id] == null && kindOf(G, j.tm, j.inn)) p.manual[j.tm + ':' + j.inn] = 1;
  // turned over / loose before he got to the box: he stays on and plays D
  for (const j of jobs) if (S.auto[j.id] != null && preSwap(j) && pz !== j.tm && pz != null) { if (cancelJob(G, j, 'turnover')) { LOG.stats.stayOn++; delete S.auto[j.id]; } }
  // follow guard: his man stayed on, or his own team has the ball
  for (const j of jobs) {
   const man = S.follow[j.id]; if (man == null || !preSwap(j)) continue;
   const mj = (NSX().jobs || []).find(q => q.id === man);
   const stopped = !!mj && mj.ph === 'done' && (mj.why === 'timeout' || mj.why === 'peerDead');   // gone from the list = it finished long ago
   if (stopped || (pz === j.tm && G.t - (j.t0 || 0) > .5)) { if (cancelJob(G, j, stopped ? 'manStayedOn' : 'ourBall')) { LOG.stats.guard++; delete S.follow[j.id]; } }
  }
  // 1) specialists off once the ball is safe in their end
  if (pz === me && sc === 'live') {
   if (p.wasClr && !G.clearing && p.clrT == null) p.clrT = G.t;
   p.wasClr = !!G.clearing;
   const c = G.carrier, over = c && c.x > MIDX + 6;
   const settled = !G.clearing && over && ((p.clrT != null && G.t - p.clrT > .6) || G.t - p.t0 > 2.2);
   if (settled && G.t - S.uLast >= 1.4 && !jobs.some(j => S.auto[j.id] != null && preSwap(j)) && !(NSX().inReqs || []).some(q => String(q.id).indexOf('a5') === 0)) {
    const busy = busyIds(me), bx = [ MIDX - 8, FB - 2 ], ord = { FOGO: 0, LSM: 1, DMID: 2 };
    const cands = near(G, me).map(e => ({ e: e, id: e.pl.id, k: kindOf(G, me, e.pl.id) })).filter(x => x.k);
    cands.sort((x, y) => ord[x.k] - ord[y.k] || Math.hypot(x.e.x - bx[0], x.e.y - bx[1]) - Math.hypot(y.e.x - bx[0], y.e.y - bx[1]));
    for (const x of cands) {
     if (p.done[x.id] || busy.has(x.id) || p.manual[me + ':' + x.id] || hasBall(G, x.e) || inPlay(G, x.e)) continue;
     const inn = pickOMid(G, me, bench(G, me));
     if (!inn) { p.done[x.id] = 1; lg({ ev: 'skip', out: x.id, why: 'no O-mid on the bench' }); continue; }
     const jid = inject(G, me, x.id, inn, 'auto');
     if (!jid) break;
     S.auto[jid] = 1; p.done[x.id] = 1; S.uLast = G.t; LOG.stats.auto++;
     lg({ ev: 'auto', tm: me, kind: x.k, out: x.id, in: inn, id: jid, t: +G.t.toFixed(2) });
     try { addFx('cue', 0, 0, { s: 'AUTO SUB: ' + tag(x.id, me) + ' (' + (x.k === 'DMID' ? 'D-MID' : x.k) + ') OFF, ' + tag(inn, me) + ' ON', col: '#9fe8ff', life: 1.4 }); } catch (e) {}
     break;
    }
   }
  }
  // 2) follow the sub: the defender on a man who jogs off (his team has the ball) follows him off if he is a mismatch
  for (const j of jobs) {
   if (j.ph !== 'toBox' || S.follow[j.id] != null || pz !== j.tm) continue;
   const leaver = ents(G, j.tm).find(q => q.pl && q.pl.id === j.out); if (!leaver) continue;
   const fs = other(j.tm);
   for (const d of near(G, fs)) {
    if (!d.pl || (d.mark !== leaver && d.mark0 !== leaver)) continue;
    const fk = j.id + ':' + d.pl.id;
    if (S.followed[j.id] || S.followed[fk]) continue;
    S.followed[fk] = 1;
    const mk = mismatched(G, fs, d.pl.id);
    if (!mk || Math.hypot(d.x - leaver.x, d.y - leaver.y) > 90) continue;
    const ownHalf = fs === me ? d.x < MIDX + 10 : d.x > MIDX - 10;   // a rider in the other half rides on
    if (!ownHalf || hasBall(G, d) || d.ns17 || d.down > 0 || busyIds(fs).has(d.pl.id)) continue;
    const inn = pickDef(G, fs, bench(G, fs));
    if (!inn) { lg({ ev: 'skip', out: d.pl.id, why: 'follow: nobody defensive on the bench' }); continue; }
    const jid = inject(G, fs, d.pl.id, inn, 'follow');
    if (!jid) continue;
    S.follow[jid] = j.id; S.followed[j.id] = 1; LOG.stats.follow++;
    lg({ ev: 'follow', tm: fs, kind: mk, out: d.pl.id, in: inn, man: j.out, id: jid, t: +G.t.toFixed(2) });
    try { addFx('txt', d.x, d.y - 30, { s: 'FOLLOWS HIS MAN OFF', col: '#ffe14d', life: 1.2 }); } catch (e) {}
   }
  }
 }
 // ---------- CANCEL FOLLOW button (the phone whose guy is following) ----------
 const BTN = { w: 70, h: 12 };
 const myFollows = () => liveJobs().filter(j => S.follow[j.id] != null && preSwap(j) && j.tm === mySide());
 function tapCancel() {
  const F = myFollows(); if (!F.length) return;
  if (N.auth) cancelFollow(null, 'tap');
  else { for (const j of F) { try { N.link.send({ t: 'n551c', id: j.id }); } catch (e) {} } LOG.stats.cancelReq++; try { addFx('cue', 0, 0, { s: 'FOLLOW CANCELLED - HE STAYS ON', col: '#7dff7a', life: 1.2 }); } catch (x) {} }
  try { SFX.tap(); } catch (x) {}
 }
 function drawCancel() {
  if (!asOn()) return;
  const sc = scr(), vs = viewScr();
  if (!(sc === 'live' || sc === 'defense' || (sc === 'netview' && (vs === 'live' || vs === 'defense')))) return;
  try { if (W0.V545NS && V545NS.UI && V545NS.UI.open) return; } catch (e) {}
  const F = myFollows(); if (!F.length) return;
  const r = { x: Math.round(W / 2 - BTN.w / 2), y: 20, w: BTN.w, h: BTN.h };
  hit('CANCEL551', r.x - 2, r.y - 2, r.w + 4, r.h + 4, tapCancel, 'CANCEL FOLLOW');
  rect(r.x, r.y + 1, r.w, r.h, '#000');
  rect(r.x, r.y, r.w, r.h, '#ffe14d');
  rect(r.x, r.y, r.w, 1, 'rgba(255,255,255,.45)');
  text('CANCEL FOLLOW', r.x + r.w / 2, r.y + 3, 1, '#2a0b20', 'center');
  try { textMini(F.map(j => numOf(j.out, j.tm) || ln(j.out)).join(' ') + ' FOLLOWING HIS MAN OFF', r.x + r.w / 2, r.y + r.h + 3, '#ffe14d'); } catch (e) {}
  S.btnFrames = (S.btnFrames || 0) + 1;
 }
 // stamina bars under the names in the v545 SUB picker
 function drawPickerBars() {
  if (!on() || typeof uiSpecs === 'undefined' || !W0.V545NS || !V545NS.UI || !V545NS.UI.open) return;
  const me = mySide();
  for (const q of uiSpecs) {
   const m = /SUB545 (OFF|ON) (.+)$/.exec(q.key || ''); if (!m) continue;
   const v = Math.round(val(me + ':' + m[2])), w = Math.max(4, q.w - 6);
   rect(q.x + 3, q.y + q.h - 3, w, 2, '#1b2430');
   rect(q.x + 3, q.y + q.h - 3, Math.max(1, Math.round(w * v / 100)), 2, v < CFG.z2 ? '#ff5a4a' : v < CFG.z1 ? '#ffe14d' : '#2fbf4a');
  }
 }
 if (typeof W0.render === 'function') {
  const R0 = W0.render;
  W0.render = function () {
   const r = R0.apply(this, arguments);
   try { drawCancel(); } catch (e) { er(e, 'cancelBtn'); }
   try { drawPickerBars(); } catch (e) { er(e, 'bars'); }
   return r;
  };
 }
 // ---------- frame ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  const r = ST0.apply(this, arguments);
  try {
   if (!killed()) {
    if (!N.link) { S.cap = false; S.hellos = 0; S.replied = 0; }
    else if (S.linkRef !== N.link) { S.linkRef = N.link; S.cap = false; S.hellos = 0; S.replied = 0; }
    if (N.link && !S.cap && S.hellos < 12 && now() - S.helloT > 3000) { S.helloT = now(); S.hellos++; try { N.link.send({ t: 'n551h', c: 551 }); } catch (e) {} }
    tick(+dt || 0);
   }
  } catch (e) { er(e, 'step'); }
  return r;
 };
 W0.V551NS = {
  on: () => on(), asOn: () => asOn(), S: S, LOG: LOG, CFG: CFG, pack: pack,
  get: (sd, id) => Math.round(val(sd + ':' + id) * 10) / 10,
  set: (sd, id, v) => { S.v[sd + ':' + id] = Math.max(0, Math.min(100, +v)); return true; },
  cancelFollow: () => tapCancel(),
  follows: () => Object.keys(S.follow).map(id => [ id, S.follow[id] ]), autos: () => Object.keys(S.auto)
 };
})();
