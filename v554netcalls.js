// v554netcalls.js - V55.4: OUT OF BOUNDS, CALLS AND THE SLOW WHISTLE ONLINE (Charlie, Nov 12 9:28 AM: "port them now. Online should be the same.").
// Before: these offline rules were switched off in online matches (each file falls through when RLNET.inGame):
//   v423ob   last-touch out of bounds, restart at the spot, knocked out of bounds on a hit
//   v488oob  no "random" out of bounds (knock-outs only within the hit's reach, airborne ball out only when it lands, pops start inside)
//   v509calls moving picks need a real moving screen (no dice roll), stick reach at the top sideline / left end line, goalie counts as
//            the closest player on a wide shot
//   v509rules foul-out = 5 PERSONAL fouls (technicals never count) instead of any 3 penalties
//   v450slow slow whistle: FLAG DOWN - PLAY ON while the fouled team has the ball, whistle when it loses it / the shot ends / 7 s
// How online works: the phone whose team has the ball RUNS the play (the "authority"); the other phone shows its snapshots (positions,
// banners, text) and gets the ball in a 'poss' hand-off that carries score, clock, penalties, foul counts and lineups.
// Now, when BOTH phones run this build, each rule runs on the authority phone exactly as offline (this file carries a copy of each of
// those files whose only change is its gate: "online, both phones have it, this phone runs the play" instead of "offline"), so the
// call is made once, on one phone, and the other phone sees the same whistle, banner and possession:
//  - Out of bounds their way: the hand-off carries the out point (added 'poss' field ob554 {x,y,id}); the phone that gets the ball
//    restarts with its man (the one who jogged to the spot, if he is on the field) standing on that spot - offline does the same.
//    (Before, an online hand-off always restarted the new carrier near midfield.) Banner words use YOUR / THEIR BALL + team names so
//    the other phone's own POV swap (net.js pov26) reads right on both screens.
//  - Foul-out count: the personal-foul count (G.pf554) rides every shared-state message as an ADDED field (sh.pf554), so both phones
//    count the same fouls whoever runs the play when they happen.
//  - Slow whistle: the flag tag (FLAG DOWN - PLAY ON) shows on the other phone too (snapshot field sw554). A pick-off / scoop that
//    hands the ball over while the flag is down blows the whistle first (the flag is enforced, as offline where the turnover blows it).
//    A flag still down at the end of a period is waved off online (offline it is served after the period banner; online the next
//    period starts with a faceoff on both phones).
// Old peer: capability flag in the lobby 'ver' message (field c554) + added hello 'n54h'; the host turns it on for the match only when
// the guest has it ('n54m' -> guest). Older app on either side = today's online calls for that match.
// Net protocol: only ADDED message types (n54h, n54m) and fields (ver.c554, poss.ob554, sh.pf554, snapshot sw554).
// Kill switch: window.__rl_no554nc = true (exactly today's online behaviour). The old files' own kill switches still apply.
// No ids, rl_* keys or saves touched. Telemetry: window.V554NC.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v554nc_loaded) return;
 W0.__rl_v554nc_loaded = 1;
 const N = W0.RLNET;
 if (!N || !N.Link || !N.Link.prototype || typeof W0.step !== 'function') { W0.V554NC = { on: () => false, why: 'no net' }; return; }
 const killed = () => !!(W0.__rl_no554nc || W0.__rl_v124gb);
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const now = () => performance.now();
 const OB = { ev: [], errs: [], pend: null, koOff: false, st: { obOut: 0, obIn: 0, obPlaced: 0, pfOut: 0, pfIn: 0 } };
 const lg = o => { OB.ev.push(o); if (OB.ev.length > 200) OB.ev.shift(); };
 const er = (e, w) => { if (OB.errs.length < 8) OB.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); try { console.warn('v554', w, e); } catch (x) {} };
 // ---------- capability handshake (same shape as v545) ----------
 const CP = { peer: false, on: false, hellos: 0, helloT: 0, mT: 0, onAt: 0, linkRef: null, wasIn: false };
 const active = () => !killed() && CP.on && !!N.inGame && !!G_() && !G_().tutorial;
 const authOn = () => active() && !!N.auth && !N.applying;
 function peerCap(why) { if (!CP.peer) lg({ ev: 'cap', why: why }); CP.peer = true; if (N.side === 'h' && N.inGame && !killed()) hostOn(why); }
 function hostOn(why) {
  if (N.side !== 'h' || !CP.peer || !N.link) return;
  if (!CP.on) { CP.on = true; lg({ ev: 'on', by: why }); }
  if (now() - CP.mT > 4000) { CP.mT = now(); try { N.link.send({ t: 'n54m', on: 1 }); } catch (x) {} }
 }
 const flipKey = k => typeof k === 'string' && /^[UC]\|/.test(k) ? (k[0] === 'U' ? 'C' : 'U') + k.slice(1) : k;
 // ---------- link hooks: ADD fields / messages only ----------
 const LP = N.Link.prototype;
 const SEND0 = LP.send;
 LP.send = function (e) {
  try {
   if (e && !killed()) {
    if (e.t === 'ver') e.c554 = 1;
    if (active()) {
     const G = G_();
     if (e.sh && G && G.pf554) { e.sh.pf554 = Object.assign({}, G.pf554); OB.st.pfOut++; }
     if (e.t === 'poss' && OB.pend) { e.ob554 = OB.pend; OB.st.obOut++; lg({ ev: 'obOut', p: OB.pend }); }
    }
   }
  } catch (x) { er(x, 'send'); }
  return SEND0.apply(this, arguments);
 };
 const LAT0 = LP.latest;
 LP.latest = function (o) {
  try { if (o && o.k === 's' && authOn() && OB.flagDown && OB.flagDown()) o.sw554 = 1; } catch (x) { er(x, 'latest'); }
  return LAT0.apply(this, arguments);
 };
 const GE0 = LP.gotEvent;
 LP.gotEvent = function (e) {
  let post = null;
  try {
   if (e && !killed()) {
    switch (e.t) {
     case 'ver': if (e.c554) peerCap('ver'); break;
     case 'n54h': peerCap('hello'); break;
     case 'n54m': if (N.side !== 'h' && e.on) { CP.onAt = now(); if (N.inGame && !CP.on) { CP.on = true; lg({ ev: 'on', by: 'n54m' }); } } break;
    }
    if (active() && !(e.q != null && this.seen && this.seen.has((e.s || '') + ':' + e.q))) {
     if (e.sh && e.sh.pf554) post = Object.assign(post || {}, { pf: e.sh.pf554 });
     if (e.t === 'poss' && e.ob554) post = Object.assign(post || {}, { ob: e.ob554 });
    }
   }
  } catch (x) { er(x, 'gotEvent'); }
  const r = GE0.apply(this, arguments);
  if (post) {
   try {
    const G = G_();
    if (post.pf && G) { const m = {}; for (const k in post.pf) m[flipKey(k)] = post.pf[k]; G.pf554 = m; OB.st.pfIn++; }
    if (post.ob && G && N.auth) placeOb(G, post.ob);
   } catch (x) { er(x, 'post'); }
  }
  return r;
 };
 // the phone that got the ball after an out of bounds call restarts at the spot (offline v423ob restart(): carrier feet so the ball
 // in his stick sits on the out point, clamped to the playable band and out of both creases)
 function placeOb(G, o) {
  OB.st.obIn++;
  if (scr() !== 'live' || !G.carrier || !G.ball) { lg({ ev: 'obSkip', scr: scr() }); return; }
  const ox = FL - (+o.x || 0), oy = +o.y || CY;
  const band = [ DEND + 8, ENDX - 3, FT + 12, FB - 2 ];
  let x = Math.max(band[0], Math.min(band[1], ox - BX)), y = Math.max(band[2], Math.min(band[3], oy - BY));
  for (const gx of [ GX, DGX ]) { const dx = x - gx, dy = y - CY, d = Math.hypot(dx, dy), R = CREASE + 5; if (d < R) { const L = d || 1; x = gx + dx / L * R; y = CY + (d ? dy / L : 1) * R; } }
  let c = G.carrier;
  // the restart man the other phone walked to the spot: give him the ball if he is on the field here
  if (o.id && !(c.pl && c.pl.id === o.id)) {
   const w = G.players.find(p => p.team === 'O' && !p.gk && p.pl && p.pl.id === o.id);
   if (w && w !== c) { const t = c.pl; c.pl = w.pl; w.pl = t; const tx = c.x, ty = c.y; c.x = w.x; c.y = w.y; w.x = tx; w.y = ty; }
  }
  c.x = x; c.y = y; c.tx = x; c.ty = y;
  G.ball.x = c.x + BX; G.ball.y = c.y + BY;
  G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
  OB.st.obPlaced++;
  lg({ ev: 'obPlaced', x: +x.toFixed(1), y: +y.toFixed(1), from: [ ox, oy ] });
 }

 // ======== v423ob (online copy; only the gate changed) ========
(function() {
 'use strict';
 if (typeof step !== 'function') return;
 const off = () => killed() || !!window.__rl_no423ob;
 const okG = G => !!G && !!G.players && !!G.ball && !G.tutorial && !G.brave && authOn();
 const on = () => !off() && okG(game);
 const LOG = OB.ob = { oob: 0, by: {}, shotOob: 0, ltU: 0, ltC: 0, ltNone: 0, toU: 0, toC: 0, ko: 0, koU: 0, koC: 0, koSkip: 0, koCand: 0,
  walks: 0, walkMax: 0, walkLate: 0, chaseFix: 0, h3fix: 0, fallback: 0, restarts: [], last: null, errs: 0, err: [] };
 const err = (w, e) => { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(w + ': ' + String(e && e.message || e)); };
 const K = LOG.K = { band: [ () => DEND + 8, () => ENDX - 3, () => FT + 12, () => FB - 2 ], koNear: 9, koDot: .45, koP: .75, walkMax: 5, minBanner: 1.2 };
 const OFF = { U: [ () => BX, () => BY ], C: [ () => -10, () => -9 ] };
 const pk = p => (typeof tp35key === 'function' ? tp35key(p) : null);
 const allP = G => (G.players || []).concat(G.farU || [], G.farC || []);
 const field = p => p && (p.team === 'O' || p.team === 'D') && !p.gk && !p.far;
 const teamOf = p => p && (p.team === 'O' || p.team === 'G2' || p.team === 'U') ? 'U' : 'C';
 const capOf = p => { try { return tp35cap(p); } catch (e) { return 60; } };
 const oppName = () => { try { return T(game.opp).name; } catch (e) { return 'THEM'; } };
 const myName = () => { try { return T(game.user).name; } catch (e) { return 'US'; } };
 function holderTeam(G) {
  const b = G.ball, s = b.state;
  if (screen === 'live') {
   if (s === 'held' && G.carrier) return teamOf(G.carrier);
   if (s === 'pass' || s === 'shot' || s === 'clear') return 'U';
   return null;
  }
  if (screen === 'defense') {
   if (G.dclear && G.dclear.holder && (s === 'clear' || s === 'held')) return 'U';
   if (s === 'held' && G.dcar) return 'C';
   if (s === 'pass') return b.clear ? 'U' : 'C';
   if (s === 'clear') return 'U';
   if (s === 'shot') return 'C';
  }
  return null;
 }
 // ---------- legal restart spot: carrier feet so the ball in his stick sits on the out point ----------
 function legal(team, ox, oy) {
  const o = OFF[team];
  let x = ox - o[0](), y = oy - o[1]();
  x = Math.max(K.band[0](), Math.min(K.band[1](), x));
  y = Math.max(K.band[2](), Math.min(K.band[3](), y));
  for (const gx of [ GX, DGX ]) {
   const dx = x - gx, dy = y - CY, d = Math.hypot(dx, dy), R = CREASE + 5;
   if (d < R) { const L = d || 1; x = gx + dx / L * R; y = CY + (d ? dy / L : 1) * R; }
  }
  return { x: x, y: y };
 }
 // far players (the other half's off-ball men) can be the restart man only where the restart takes them:
 // a CPU ball out of the live screen (startDefenseLive takes far attack/riders), our ball out of the defense screen (liveClear takes any far man)
 function farOk(G, team) {
  if (screen === 'live' && team === 'C') return f => f.role === 'A' || f.role === 'R';
  if (screen === 'defense' && team === 'U') return f => f.role && f.role !== 'G';
  return null;
 }
 function nearest(G, team, x, y, not) {
  let best = null, bd = 1e9;
  const fo = farOk(G, team), pool = G.players.concat(fo ? (team === 'U' ? G.farU || [] : G.farC || []).filter(fo) : []);
  for (const p of pool) if ((field(p) || p.far) && teamOf(p) === team && p !== not && !(p.down > 1)) {
   const d = Math.hypot(p.x - x, p.y - y);
   if (d < bd) { bd = d; best = p; }
  }
  return best;
 }
 function closestTeam(G, x, y) {
  let best = null, bd = 1e9;
  for (const p of G.players) if (p.team === 'O' || p.team === 'D') {
   const d = Math.hypot(p.x - x, p.y - y);
   if (d < bd) { bd = d; best = p; }
  }
  return best ? teamOf(best) : 'U';
 }
 // ---------- the call ----------
 function call(G, ox, oy, cause, extra) {
  const b = G.ball, scr0 = screen;
  ox = Math.max(DEND, Math.min(ENDX, ox));
  oy = Math.max(FT, Math.min(FB, oy));
  const lt = G.lt554 || null;
  let team, why;
  if (cause === 'ko') { team = extra.team === 'U' ? 'C' : 'U'; why = 'ko'; }
  else if (!lt) { team = closestTeam(G, ox, oy); why = 'closest'; LOG.ltNone++; }
  else if (lt.shot) { team = closestTeam(G, ox, oy); why = 'shot'; LOG.shotOob++; }
  else { team = lt.team === 'U' ? 'C' : 'U'; why = 'last'; if (lt.team === 'U') LOG.ltU++; else LOG.ltC++; }
  const spot = legal(team, ox, oy);
  const walker = nearest(G, team, spot.x, spot.y, extra && extra.ko);
  const plan = { team: team, why: why, cause: cause, scr0: scr0, out: { x: ox, y: oy }, spot: spot, wk: pk(walker), t: 0, ko: extra && extra.ko ? { k: pk(extra.ko), ox: extra.kox, oy: extra.koy, sx: extra.ko.x, sy: extra.ko.y, ix: extra.kix, iy: extra.kiy } : null };
  G.oob = (G.oob || 0) + 1;
  G.lastOob = { team: team === 'U' ? 'O' : 'D', x: ox, y: oy, why: why, lt: lt && lt.team, shot: !!(lt && lt.shot), cause: cause };
  LOG.oob++; LOG.by[cause + ':' + why] = (LOG.by[cause + ':' + why] || 0) + 1;
  if (team === 'U') LOG.toU++; else LOG.toC++;
  LOG.last = { cause: cause, why: why, team: team, out: [ +ox.toFixed(1), +oy.toFixed(1) ], spot: [ +spot.x.toFixed(1), +spot.y.toFixed(1) ], scr: scr0, lt: lt && lt.team, q: G.q, t: +G.t.toFixed(2) };
  b.state = 'dead'; b.vx = 0; b.vy = 0; b.z = 0; b.x = ox; b.y = oy;
  G.chasers = []; G.gb = null; G.dgb = null; G.run = null; G.chase = null;
  if (scr0 === 'live') G.carrier = null; else { G.dcar = null; }
  G.resume = null; G.turnSpot = null;
  const opp = oppName();
  let txt = cause === 'ko' ? 'KNOCKED OUT OF BOUNDS' : 'OUT OF BOUNDS', sub;
  const yb = team === 'U' ? 'YOUR BALL' : 'THEIR BALL';   // the other phone's pov26 turns YOUR <-> THEIR
  if (cause === 'ko') sub = 'HIT OUT WITH IT - ' + yb;
  else if (why === 'last') sub = 'OFF ' + (lt.team === 'U' ? myName() : opp) + ' - ' + yb;
  else if (why === 'shot') sub = 'SHOT - CLOSEST PLAYER - ' + yb;
  else sub = 'CLOSEST PLAYER - ' + yb;
  if (scr0 === 'live') endPossession(team === 'U' ? 'ours' : 'turnover', txt, sub);
  else ruleBanner(team === 'U' ? 'rturnU' : 'rturn', txt, sub);
  if (team === 'C' && scr0 === 'live') try { SFX.whistle(); } catch (e) {}
  if (G.banner) G.banner.ob554 = plan;
  G.bannerAuto = 1.3;
  return plan;
 }
 // ---------- predict a loose ball crossing the line this frame (same math as updateLooseBall / updateDefense) ----------
 function predictOut(G, dt) {
  const b = G.ball;
  if (b.state !== 'loose') return null;
  if (screen !== 'live' && screen !== 'defense') return null;
  if (G.readyT > 0 || G.el2314 && G.el2314.open) return null;
  const sp = Math.hypot(b.vx, b.vy);
  const out = (x, y) => y < FT || y > FB || x > ENDX || x < DEND;
  if (out(b.x, b.y)) return { x: b.x, y: b.y };
  if (sp < 10 && (b.z || 0) <= 1) return null; // gbStall18 nudges slow balls back in
  let vx = b.vx, vy = b.vy;
  if (sp > .5) { const ns = Math.max(0, sp - GB.fric * dt); vx *= ns / sp; vy *= ns / sp; } else { vx = 0; vy = 0; }
  const nx = b.x + vx * dt, ny = b.y + vy * dt;
  if (!out(nx, ny)) return null;
  // crossing point on the line
  let t = 1;
  if (ny < FT && vy < 0) t = Math.min(t, (FT - b.y) / (vy * dt));
  if (ny > FB && vy > 0) t = Math.min(t, (FB - b.y) / (vy * dt));
  if (nx > ENDX && vx > 0) t = Math.min(t, (ENDX - b.x) / (vx * dt));
  if (nx < DEND && vx < 0) t = Math.min(t, (DEND - b.x) / (vx * dt));
  t = Math.max(0, Math.min(1, t));
  return { x: b.x + vx * dt * t, y: b.y + vy * dt * t };
 }
 // ---------- walkers: the restart man jogs to the spot during the whistle ----------
 function findKey(G, k) { if (!k) return null; for (const p of allP(G)) if (pk(p) === k) return p; return null; }
 function walkTo(p, x, y, dt, f) {
  const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy);
  if (d < .3) { p.x = x; p.y = y; return true; }
  const s = Math.min(d, capOf(p) * (f || .97) * dt);
  p.x += dx / d * s; p.y += dy / d * s; p.anim = (p.anim || 0) + s;
  if (Math.abs(dx) > .5) p.face = dx > 0 ? 1 : -1;
  return d - s < .3;
 }
 function bannerTick(G, dt) {
  const P = G.banner && G.banner.ob554;
  if (!P) return;
  P.t += dt;
  let done = true;
  const w = findKey(G, P.wk);
  if (w) { if (!walkTo(w, P.spot.x, P.spot.y, dt)) done = false; }
  if (P.ko) {
   const k = findKey(G, P.ko.k);
   if (k) {
    if (P.t < .35) { const e = Math.min(1, P.t / .35), q = 1 - (1 - e) * (1 - e); k.x = P.ko.sx + (P.ko.ox - P.ko.sx) * q; k.y = P.ko.sy + (P.ko.oy - P.ko.sy) * q; done = false; }
    else if (P.t < 1.0) done = false;
    else { if (k.down > 0) k.down = Math.max(0, k.down - dt * 2); if (k.stun > 0) k.stun = Math.max(0, k.stun - dt * 2); if (!walkTo(k, P.ko.ix, P.ko.iy, dt, .6)) done = false; }
   }
  }
  const b = G.ball; if (b && b.state === 'dead') { b.x = P.out.x; b.y = P.out.y; }
  if (G.bannerAuto && G.bannerAuto < K.minBanner) G.bannerAuto = K.minBanner;
  const need = G.bannerAuto || 1.9;
  if (!done && P.t < K.walkMax) G.bannerT = Math.min(G.bannerT, need - .05);
  if (!done && P.t >= K.walkMax && !P.late) { P.late = 1; LOG.walkLate++; }
  if (done && !P.walked) { P.walked = 1; LOG.walks++; LOG.walkMax = Math.max(LOG.walkMax, +P.t.toFixed(2)); }
 }
 function readyWalkTick(G, dt) {
  const W = G.w554;
  if (!W) return;
  if (screen !== W.scr || !(G.readyT > 0)) { G.w554 = null; return; }
  W.t += dt;
  const p = findKey(G, W.k);
  if (!p) { G.w554 = null; return; }
  const ok = walkTo(p, W.x, W.y, dt);
  const b = G.ball;
  if (b.state === 'held' && (G.dcar === p || G.carrier === p)) { if (G.dcar === p) { const s = dStick(p); b.x = s[0]; b.y = s[1]; } else { b.x = p.x + BX; b.y = p.y + BY; } }
  if (!ok && W.t < K.walkMax) G.readyT = Math.max(G.readyT, .25);
  else { LOG.walks++; LOG.walkMax = Math.max(LOG.walkMax, +W.t.toFixed(2)); if (!ok) LOG.walkLate++; G.w554 = null; }
 }
 // ---------- restarts after the whistle ----------
 function logRestart(G, P, how) {
  const c = screen === 'live' ? G.carrier : screen === 'defense' ? (G.dcar || G.dclear && G.dclear.holder) : null, b = G.ball;
  const r = { how: how, team: P.team, why: P.why, cause: P.cause, out: [ +P.out.x.toFixed(1), +P.out.y.toFixed(1) ], spot: [ +P.spot.x.toFixed(1), +P.spot.y.toFixed(1) ],
   car: c ? [ +c.x.toFixed(1), +c.y.toFixed(1) ] : null, ball: b ? [ +b.x.toFixed(1), +b.y.toFixed(1) ] : null, scr: screen, walkT: +P.t.toFixed(2), t: +G.t.toFixed(2) };
  LOG.restarts.push(r); if (LOG.restarts.length > 60) LOG.restarts.shift();
 }
 function placeCar(G, c, P) {
  if (!c) return;
  const d = Math.hypot(c.x - P.spot.x, c.y - P.spot.y);
  // the restart man jogged to the spot during the whistle (v418t saw him there), so putting his rebuilt object on it moves nobody
  if (d < 26 || (P.walked && P.wk && pk(c) === P.wk)) { c.x = P.spot.x; c.y = P.spot.y; }
  c.tx = c.x; c.ty = c.y;
  const b = G.ball;
  if (screen === 'live' && G.carrier === c) { b.x = c.x + BX; b.y = c.y + BY; }
  else if (screen === 'defense' && G.dcar === c) { const s = dStick(c); b.x = s[0]; b.y = s[1]; }
 }
 function restart(G, P) {
  if (!G.ot && G.clock <= 0) { G.clock = 0; return endQuarter(); }
  const b = G.ball;
  const w = findKey(G, P.wk) || nearest(G, P.team, P.spot.x, P.spot.y);
  if (P.scr0 === 'live' && P.team === 'U') {
   G.resume = { p: w && w.team === 'O' ? w : nearestTo('O', P.spot.x, P.spot.y), x: P.spot.x, y: P.spot.y, chase: P.why === 'shot', ob554: P };
   G.ob554spot = P.spot;
   try { resumeOurs(); } finally { G.ob554spot = null; }
   if (screen === 'live') placeCar(G, G.carrier, P);
   G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
   return logRestart(G, P, 'resumeOurs');
  }
  if (P.scr0 === 'live' && P.team === 'C') {
   b.x = P.out.x; b.y = P.out.y; G.turnSpot = null;
   const wk = findKey(G, P.wk);
   OB.pend = { x: +P.out.x.toFixed(1), y: +P.out.y.toFixed(1), id: wk && wk.pl ? wk.pl.id : null, why: P.why, c: P.cause };
   let sdl;
   try { sdl = startDefenseLive(); } finally { OB.pend = null; }
   if (!sdl) { OB.pend = { x: +P.out.x.toFixed(1), y: +P.out.y.toFixed(1), id: wk && wk.pl ? wk.pl.id : null, why: P.why, c: P.cause }; try { startCpu(); } finally { OB.pend = null; } return logRestart(G, P, 'startCpu'); }
   if (screen === 'defense' && G.dcar) {
    const k = P.wk, c = G.dcar;
    if (k && pk(c) !== k) { const o = G.players.find(q => q.team === c.team && pk(q) === k); if (o && o !== c && (P.walked || Math.hypot(o.x - P.spot.x, o.y - P.spot.y) < 26)) { const t = c.pl; c.pl = o.pl; o.pl = t; const tx = c.x, ty = c.y; c.x = o.x; c.y = o.y; o.x = tx; o.y = ty; } }
    placeCar(G, G.dcar, P);
    G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
   }
   return logRestart(G, P, 'startDefenseLive');
  }
  if (P.scr0 === 'defense' && P.team === 'U') {
   const p = w && (w.team === 'O' || w.far) ? w : nearestTo('O', P.spot.x, P.spot.y);
   if (!p) { setupPossession(); return logRestart(G, P, 'setup'); }
   p.x = P.spot.x; p.y = P.spot.y;
   b.state = 'held';
   toOffense(p, 'YOUR BALL');
   if (screen === 'live' && G.carrier) {
    const c = G.carrier;
    if (pk(c) !== pk(p)) { const o = G.players.find(q => q.team === 'O' && pk(q) === pk(p)); if (o && o !== c && (P.walked || Math.hypot(o.x - P.spot.x, o.y - P.spot.y) < 26)) { const t = c.pl; c.pl = o.pl; o.pl = t; const tx = c.x, ty = c.y; c.x = o.x; c.y = o.y; o.x = tx; o.y = ty; } }
    placeCar(G, G.carrier, P);
   }
   G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
   return logRestart(G, P, 'toOffense');
  }
  // defense screen, CPU ball: restart in place with the same players (what the old OOB branch did, at the real spot)
  const c = w && w.team === 'D' ? w : nearest(G, 'C', P.spot.x, P.spot.y);
  if (!c) { if (!startDefenseLive()) startCpu(); return logRestart(G, P, 'fallbackC'); }
  const def = G.players.filter(p => p.team === 'O');
  c.x = P.spot.x; c.y = P.spot.y;
  b.state = 'held'; b.vx = 0; b.vy = 0; b.z = 0;
  G.dcar = c; G.dDecide = rnd(.8, 1.2);
  G.chk = { n: 0, cd: 0, t: 0, who: c };
  G.ruleGrace = 1.2; G.dgb = null; G.run = null;
  { const s = dStick(c); b.x = s[0]; b.y = s[1]; }
  screen = 'defense';
  try { if (c.x < DGX + 40) el2403Arm(G); } catch (e) {}
  if (c.x > MIDX && !G.cpuClear) { G.cpuClear = true; G.ccC = { t: CLEAR_T }; G.cpuOverSeen = false; G.bcC = null; }
  try { if (window.__rl_v124gb) { const md = def.find(d => d.mark === c); if (md) G.dctl = md; } else dNewCarrier(c, typeof dDef === 'function' ? dDef() : def); } catch (e) { err('dNewCarrier', e); }
  SFX.whistle();
  return logRestart(G, P, 'inPlaceC');
 }
 // ---------- wraps ----------
 const oAfter = window.afterBanner;
 if (typeof oAfter === 'function') window.afterBanner = function() {
  const G = game, P = G && G.banner && G.banner.ob554;
  if (!P || off() || !okG(G)) return oAfter.apply(this, arguments);
  try { if (typeof v14PreBanner === 'function' && v14PreBanner(G.banner.kind)) return; } catch (e) { err('v14', e); }
  G.banner.ob554 = null;
  try { return restart(G, P); } catch (e) { err('restart', e); return oAfter.apply(this, arguments); }
 };
 const oResume = window.resumeOurs;
 if (typeof oResume === 'function') window.resumeOurs = function() {
  const G = game, R = G && G.resume;
  // a backed-up wide shot (closest-player rule, game.js chase branch): restart where it went out, not at the corner
  if (R && !R.ob554 && R.chase && on() && G.ob554chase) { G.ob554spot = G.ob554chase; }
  const r = oResume.apply(this, arguments);
  if (G && G.ob554spot && screen === 'live' && G.carrier && !(R && R.ob554)) placeCar(G, G.carrier, { spot: G.ob554spot });
  if (G && !(R && R.ob554)) { G.ob554spot = null; G.ob554chase = null; }
  return r;
 };
 const oH3 = window.h3Corner;
 if (typeof oH3 === 'function') window.h3Corner = function(G, side) {
  if (!on() || !G) return oH3.apply(this, arguments);
  const u = side === 'U', c = u ? G.carrier : G.dcar;
  if (!c) return oH3.apply(this, arguments);
  let s = u ? G.ob554spot : null;
  if (!u) { // CPU backs up our wide shot: game.js put him on the endline at the ball's y; keep that, jog him there
   s = { x: c.x, y: Math.max(FT + 12, Math.min(FB - 2, c.y)) };
   G.w554 = { k: pk(c), x: s.x, y: s.y, t: 0, scr: screen };
  }
  if (!s) s = { x: c.x, y: c.y };
  LOG.h3fix++;
  c.x = s.x; c.y = s.y; c.tx = c.x; c.ty = c.y;
  if (u) { G.ball.x = c.x + BX; G.ball.y = c.y + BY; } else { const t = dStick(c); G.ball.x = t[0]; G.ball.y = t[1]; }
  const defs = G.players.filter(p => p.team === (u ? 'D' : 'O') && p.team !== 'G' && p.team !== 'G2');
  const d = defs.sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0];
  if (!d) return;
  const px = u ? GX - 34 : DGX + 34, dx = px - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1;
  let sx = c.x + dx / L * H3_GAP, sy = c.y + dy / L * H3_GAP;
  const gx = u ? GX : DGX, cx = sx - gx, cy = sy - CY, cd = Math.hypot(cx, cy) || 1;
  if (cd < CREASE + 3) { sx = gx + cx / cd * (CREASE + 3); sy = CY + cy / cd * (CREASE + 3); }
  d.x = sx; d.y = sy; d.tx = sx; d.ty = sy; d.settled = [ sx, sy ];
  for (const o of defs) if (o !== d && Math.hypot(o.x - c.x, o.y - c.y) < H3_GAP) {
   const ox = o.x - c.x, oy = o.y - c.y, ol = Math.hypot(ox, oy) || 1;
   o.x = c.x + ox / ol * (H3_GAP + 6); o.y = Math.max(FT + 12, Math.min(FB - 3, c.y + oy / ol * (H3_GAP + 6))); o.tx = o.x; o.ty = o.y; o.settled = [ o.x, o.y ];
  }
  G.h3 = { side: side, cx: c.x, cy: c.y, dx: sx, dy: sy, gap: Math.hypot(sx - c.x, sy - c.y), ob554: 1 };
 };
 // knocked out: knockDown marks a candidate, the 'hit' pop that follows is turned into a whistle with the ball still in his stick
 let KO = null;
 const oKD = window.knockDown;
 if (typeof oKD === 'function') window.knockDown = function(c, by, side, pow) {
  const r = oKD.apply(this, arguments);
  try {
   const G = game;
   if (on() && c && by && G.ball.state === 'held' && ((screen === 'live' && G.carrier === c) || (screen === 'defense' && G.dcar === c))) {
    const dx = c.x - by.x, dy = c.y - by.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const W = [ { d: c.y - K.band[2](), dot: -uy, ix: c.x, iy: K.band[2](), ox: c.x + ux * 6, oy: FT - 4, side: 'top' },
     { d: K.band[3]() - c.y, dot: uy, ix: c.x, iy: K.band[3](), ox: c.x + ux * 6, oy: FB + 4, side: 'bottom' },
     { d: K.band[1]() - c.x, dot: ux, ix: K.band[1](), iy: c.y, ox: ENDX + 4, oy: c.y + uy * 6, side: 'end' },
     { d: c.x - K.band[0](), dot: -ux, ix: K.band[0](), iy: c.y, ox: DEND - 4, oy: c.y + uy * 6, side: 'end' } ];
    const w = W.filter(q => q.d <= K.koNear && q.dot >= K.koDot).sort((a, b) => a.d - b.d)[0];
    if (w) {
     LOG.koCand++;
     if (Math.random() < K.koP) KO = { c: c, by: by, w: w, t: G.t, team: teamOf(c) }; else LOG.koSkip++;
    }
   }
  } catch (e) { err('kd', e); }
  return r;
 };
 function koPop(kind) {
  const G = game;
  if (!KO || kind !== 'hit' || !on() || OB.koOff) return false;
  const k = KO; KO = null;
  if (G.t !== k.t) return false;
  const c = k.c, w = k.w;
  if (!((screen === 'live' && G.carrier === c) || (screen === 'defense' && G.dcar === c))) return false;
  // the ball goes over with him: spot = where he crosses the line, just inside
  const team = k.team, o = OFF[team];
  const lineX = w.side === 'end' ? (w.ox > MIDX ? ENDX : DEND) : Math.max(DEND, Math.min(ENDX, w.ox + o[0]()));
  const lineY = w.side === 'top' ? FT : w.side === 'bottom' ? FB : Math.max(FT, Math.min(FB, w.oy + o[1]()));
  LOG.ko++; if (team === 'U') LOG.koU++; else LOG.koC++;
  G.ko554 = (G.ko554 || 0) + 1;
  try { addFx('txt', c.x, c.y - 30, { s: 'KNOCKED OUT!', col: '#ff5a4a', life: 1.2 }); } catch (e) {}
  call(G, lineX, lineY, 'ko', { team: team, ko: c, kox: Math.max(-2, Math.min(FL + 2, w.ox)), koy: Math.max(FT - 6, Math.min(FB + 6, w.oy)), kix: Math.max(K.band[0](), Math.min(K.band[1](), w.side === 'end' ? w.ix : w.ox)), kiy: Math.max(K.band[2](), Math.min(K.band[3](), w.side === 'end' ? w.oy : w.iy)) });
  return true;
 }
 const oPop = window.popLoose;
 if (typeof oPop === 'function') window.popLoose = function(x, y, vx, vy, kind) {
  try { if (koPop(kind)) return; } catch (e) { err('koPop', e); }
  return oPop.apply(this, arguments);
 };
 const oDPop = window.dPopLoose;
 if (typeof oDPop === 'function') window.dPopLoose = function(x, y, vx, vy, kind) {
  try { if (koPop(kind)) return; } catch (e) { err('koDPop', e); }
  return oDPop.apply(this, arguments);
 };
 // ---------- the frame ----------
 const oStep = window.step;
 window.step = function(dt) {
  const G = game;
  let lc0 = null, oob0 = 0, mine = 0, act = false;
  try {
   act = on() && typeof paused !== 'undefined' && !paused && dt > 0;
   if (act) {
    // 1. last touch: whoever held / passed / shot it last before it went loose
    const ht = holderTeam(G), st = G.ball.state;
    if (ht) G.lt554 = { team: ht, shot: st === 'shot', st: st };
    else if (st === 'fo' || screen === 'faceoff') G.lt554 = null;
    if (screen === 'banner') bannerTick(G, dt);
    if (G.w554) readyWalkTick(G, dt);
    oob0 = G.oob || 0; lc0 = G.lastChase;
    // 2. loose ball about to cross the line: our call instead of the closest-player one
    const o = predictOut(G, dt);
    if (o) { call(G, o.x, o.y, 'loose'); mine = 1; }
   }
  } catch (e) { err('pre', e); }
  const r = oStep.apply(this, arguments);
  try {
   if (act && game === G) {
    if ((G.oob || 0) > oob0 + mine) { LOG.fallback++; }
    // 3. backed-up wide shot (closest rule kept): spot = where it went out
    if (G.lastChase && G.lastChase !== lc0 && screen === 'banner' && G.banner && !G.banner.ob554) {
     const L = G.lastChase, team = L.team === 'O' ? 'U' : 'C';
     const ox = L.x, oy = L.y, spot = legal(team, ox, oy);
     LOG.chaseFix++; LOG.shotOob++;
     if (team === 'U' && G.resume && G.resume.p) {
      G.resume.x = spot.x; G.resume.y = spot.y;
      G.banner.ob554 = { team: 'U', why: 'shot', cause: 'chase', scr0: 'live', out: { x: ox, y: oy }, spot: spot, wk: pk(G.resume.p), t: 0, ko: null };
     } else if (team === 'C') {
      const w = nearest(G, 'C', spot.x, spot.y);
      G.banner.ob554 = { team: 'C', why: 'shot', cause: 'chase', scr0: 'live', out: { x: ox, y: oy }, spot: spot, wk: pk(w), t: 0, ko: null };
     }
     G.lastOob = { team: L.team, x: ox, y: oy, why: 'shot', cause: 'chase' };
    }
   }
  } catch (e) { err('post', e); }
  if (KO && game && KO.t !== game.t) KO = null;
  return r;
 };
})();

 // ======== v450slow (online copy; only the gate changed) ========
(function () {
 'use strict';
 const WIN = window;
 const need = [ 'foulCall', 'penaltyRoll', 'ruleCall', 'endPossession', 'afterBanner', 'updateLive', 'drawHUD', 'startPenalty' ];
 for (const n of need) if (typeof WIN[n] !== 'function') return;
 const SLOW_CAP = 7;
 const TECH = /PUSHING|HOLDING|INTERFERENCE|OFFSIDE|ILLEGAL PICK|MOVING PICK|WARDING|ILLEGAL PROCEDURE|WITHHOLDING|STALLING|DELAY|CREASE|THREE SECOND|TOO MANY/;
 const LOG = OB.s450 = { flags: 0, blown: {}, goals: 0, served: 0, wiped: 0, errs: [], last: null };
 const off = () => killed() || !!WIN.__rl_no450slow;
 const err = (e, w) => { try { if (LOG.errs.length < 8) LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v450slow', w, e); } catch (x) {} };
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const okMode = G => !!G && !G.over && !G.tutorial && !G.practice && !G.brave && !G.ot && authOn();
 const eligible = G => !off() && okMode(G) && scr() === 'live' && !G.pen && !G.penPending && !G.sw554;
 const isTech = label => TECH.test(String(label || '').toUpperCase());
 let busy = 0;   // re-entrancy: while we enforce a flag the originals run untouched

 const oFoul = WIN.foulCall, oRoll = WIN.penaltyRoll, oRule = WIN.ruleCall, oEnd = WIN.endPossession, oAfter = WIN.afterBanner, oLive = WIN.updateLive, oHud = WIN.drawHUD;

 function flagDown(G, s) {
  s.t0 = G.liveT || 0;
  s.g = G;
  s.tech = s.via === 'rule' ? true : isTech(s.label);
  G.sw554 = s;
  LOG.flags++;
  LOG.last = { label: s.label, via: s.via, tech: s.tech, t: +(G.t || 0).toFixed(2) };
  const b = G.ball, w = s.whoP && s.whoP.x != null ? s.whoP : b;
  try {
   addFx('txt', w.x, w.y - 26, { s: 'FLAG!', col: '#ffe14d', life: 1.2 });
   addFx('cue', 0, 0, { s: 'FLAG DOWN - PLAY ON', col: '#ffe14d', life: 1.8 });
  } catch (e) { err(e, 'fx'); }
  try {   // the ref throws the flag (no whistle - play on)
   if (G.refs && G.refs.length && b) {
    const r = G.refs.slice().sort((p, q) => Math.abs(p.x - b.x) - Math.abs(q.x - b.x))[0];
    G.refFlag = { r: r, t: 0, tx: clamp(b.x, 20, FL - 20), ty: clamp(b.y, FT + 10, FB - 6) };
    G.refFlags = (G.refFlags || 0) + 1;
   }
  } catch (e) { err(e, 'ref'); }
 }

 // enforce the flag now, exactly the old way (screen is still 'live')
 function blow(G, why) {
  const s = G && G.sw554;
  if (!s) return false;
  G.sw554 = null;
  LOG.blown[why] = (LOG.blown[why] || 0) + 1;
  if (scr() !== 'live' || G.pen || G.penPending) return late(G, s, why);
  busy++;
  let r = false;
  try {
   if (s.via === 'roll') { G.forcePen = 'C'; r = oRoll.call(WIN, 'check', s.chk); if (G.forcePen === 'C') G.forcePen = null; }
   else if (s.via === 'rule') r = oRule.apply(WIN, s.args);
   else r = oFoul.apply(WIN, s.args);
  } catch (e) { err(e, 'blow'); }
  finally { busy--; }
  if (G.banner && r) G.banner.slow554 = why;
  return !!r;
 }

 // personal-foul bookkeeping, same as foulCall/penaltyRoll/ruleCall would do, without touching the screen
 function bookPen(G, s) {
  if (s.via === 'roll') { G.penPending = { side: 'C', who: s.chk && s.chk.pl, foul: 'SLASHING' }; return; }
  if (s.via === 'rule') {
   const label = s.args[0];
   (G.ruleLog = G.ruleLog || []).push({ rule: label, kind: 'cpen', t: +G.t.toFixed(2), q: G.q, user: false });
   G.ruleCalls = G.ruleCalls || {}; G.ruleCalls[label] = (G.ruleCalls[label] || 0) + 1;
   G.penPending = { side: 'C', who: PP(G.lu[1].D[0]), foul: label };
   G.ruleCall = G.penPending;
   return;
  }
  const [label, sub, side, whoP] = s.args;
  bookFoul(G, s);
  const ej = penCountUp(whoP, side);
  G.penPending = { side: side, who: whoP && whoP.pl, foul: label, sub: sub, eject: ej };
 }
 function bookFoul(G, s, extra) {
  if (s.via !== 'call') { if (s.via === 'rule') { const label = s.args[0]; (G.ruleLog = G.ruleLog || []).push(Object.assign({ rule: label, kind: 'cpen', t: +G.t.toFixed(2), q: G.q, user: false }, extra || {})); G.ruleCalls = G.ruleCalls || {}; G.ruleCalls[label] = (G.ruleCalls[label] || 0) + 1; } return; }
  const [label, , side, whoP, opts] = s.args;
  foulLog(G, Object.assign({ foul: label, side: side, user: !!(opts && opts.user), tech: false }, extra || {}));
  if (side === 'U' && whoP && whoP.pl) st14('pen', whoP.pl);
  G.fouls = G.fouls || { U: 0, C: 0 };
  G.fouls[side]++;
  if (opts && opts.user) G.userFouls = (G.userFouls || 0) + 1; else G.aiFouls = (G.aiFouls || 0) + 1;
 }

 // the play left 'live' some other way: serve the flag after that banner
 function late(G, s, why) { G.sw554late = s; s.why = why; return false; }

 WIN.foulCall = function (label, sub, side, whoP, opts) {
  const G = G0();
  if (busy || off() || !G) return oFoul.apply(this, arguments);
  try {
   if (G.sw554 && scr() === 'live') {   // another call while the flag is down: whistle now, enforce the first flag
    blow(G, 'foul2');
    return true;
   }
   if (side === 'C' && !(opts && opts.tech) && eligible(G)) {
    flagDown(G, { via: 'call', label: label, args: [ label, sub, side, whoP, opts ], whoP: whoP });
    return true;
   }
  } catch (e) { err(e, 'foulCall'); }
  return oFoul.apply(this, arguments);
 };

 WIN.penaltyRoll = function (kind, chk) {
  const G = G0();
  if (busy || off() || !G) return oRoll.apply(this, arguments);
  try {
   if (kind === 'check' && G.forcePen === 'C' && G.sw554 && scr() === 'live') {   // another flag while one is down
    G.forcePen = null;
    blow(G, 'foul2');
    return true;
   }
   if (kind === 'check' && G.forcePen === 'C' && eligible(G)) {
    G.forcePen = null;
    flagDown(G, { via: 'roll', label: 'SLASHING', chk: chk, whoP: chk });
    return true;
   }
  } catch (e) { err(e, 'penaltyRoll'); }
  return oRoll.apply(this, arguments);
 };

 WIN.ruleCall = function (label, sub, kind, spot) {
  const G = G0();
  if (busy || off() || !G) return oRule.apply(this, arguments);
  try {
   if (G.sw554 && scr() === 'live') {
    if (G.sw554.via === 'rule' && G.sw554.label === label) return true;   // the same offsides still on: flag already down
    blow(G, 'rule');
    return true;
   }
   if (kind === 'cpen' && eligible(G)) {
    flagDown(G, { via: 'rule', label: label, args: [ label, sub, kind, spot ] });
    return true;
   }
  } catch (e) { err(e, 'ruleCall'); }
  return oRule.apply(this, arguments);
 };

 WIN.endPossession = function (kind, txt, sub) {
  const G = G0();
  if (busy || off() || !G || !G.sw554 || scr() !== 'live') return oEnd.apply(this, arguments);
  try {
   if (kind === 'goal') {   // goal counts
    const s = G.sw554;
    G.sw554 = null;
    LOG.goals++;
    const r = oEnd.apply(this, arguments);
    if (s.tech) {
     LOG.wiped++;
     bookFoul(G, s, { wiped554: true });
     if (G.banner) G.banner.sub = 'GOAL COUNTS - ' + s.label + ' WIPED OUT';
    } else {
     G.sw554goal = s;
     if (G.banner) G.banner.sub = 'GOAL COUNTS - ' + s.label + ' STILL SERVED';
    }
    return r;
   }
   const why = kind === 'turnover' ? 'turnover' : kind;
   if (blow(G, why)) return;
  } catch (e) { err(e, 'endPossession'); }
  return oEnd.apply(this, arguments);
 };

 WIN.afterBanner = function () {
  const G = G0();
  try {
   if (!off() && G && G.banner && authOn()) {
    const k = G.banner.kind;
    if (G.sw554goal && k === 'goal') {
     const s = G.sw554goal;
     G.sw554goal = null;
     if (!G.over && !G.pen && !G.penPending) {
      bookPen(G, s);
      LOG.served++;
      if (startPenalty()) return;
     }
    }
    if (G.sw554late) {
     const s = G.sw554late;
     G.sw554late = null;
     if (!G.over && !G.pen && !G.penPending && k !== 'goal' && k !== 'cgoal' && k !== 'flag') {
      bookPen(G, s);
      LOG.served++;
      LOG.lateServed = (LOG.lateServed || 0) + 1;
      if (startPenalty()) return;
     }
    }
   }
  } catch (e) { err(e, 'afterBanner'); }
  return oAfter.apply(this, arguments);
 };

 WIN.updateLive = function (dt) {
  const r = oLive.apply(this, arguments);
  try {
   const G = G0();
   if (G && G.sw554) {
    const s = G.sw554;
    if (s.g !== G || off() || !authOn()) { G.sw554 = null; return r; }
    if (scr() !== 'live') { G.sw554 = null; late(G, s, 'left:' + scr()); LOG.blown['left'] = (LOG.blown['left'] || 0) + 1; return r; }
    const b = G.ball, st = b && b.state;
    if (st === 'loose' || st === 'chase' || st === 'dead') blow(G, s.shot ? 'shot' : 'loose');
    else if (st === 'shot') s.shot = true;
    else if ((G.liveT || 0) - s.t0 >= SLOW_CAP && st !== 'shot') blow(G, 'cap');
   }
  } catch (e) { err(e, 'updateLive'); }
  return r;
 };

 // HUD tag while the flag is down (live text cues are hidden by v40msg): a waving flag + FLAG DOWN - PLAY ON, top-left
 WIN.drawHUD = function () {
  const r = oHud.apply(this, arguments);
  try {
   const G = G0();
   if (G && G.sw554 && !off() && scr() === 'live') {
    const s = 'FLAG DOWN - PLAY ON', tw = textW(s, 1), bx = 3, by = 18, bw = tw + 18;
    rect(bx, by, bw, 11, 'rgba(5,7,11,.92)');
    rect(bx, by, bw, 1, '#ffe14d');
    const fl = Math.floor((G.t || 0) * 4) % 2;
    rect(bx + 4, by + 2, 1, 8, '#e8e8e8');
    rect(bx + 5, by + 2 + fl, 5, 4, '#ffd200');
    text(s, bx + 13, by + 4, 1, '#ffe14d', 'left');
   }
  } catch (e) { err(e, 'hud'); }
  return r;
 };
 for (const nm of [ 'startDefenseLive', 'startDefense', 'startCpu' ]) {
  const f0 = WIN[nm];
  if (typeof f0 !== 'function') continue;
  WIN[nm] = function () {
   const G = G0();
   try {
    if (!busy && !off() && G && G.sw554 && authOn() && scr() === 'live') {
     if (blow(G, 'turnover')) { LOG.blown.handoff = (LOG.blown.handoff || 0) + 1; return nm === 'startDefenseLive' ? true : undefined; }
    }
   } catch (e) { err(e, nm); }
   return f0.apply(this, arguments);
  };
 }
 // period ends with the flag down: offline it is served after that banner; online the next period starts with a faceoff on both
 // phones, so the flag is waved off (logged) instead of being carried on one phone only
 const oEQ = WIN.endQuarter;
 if (typeof oEQ === 'function') WIN.endQuarter = function () {
  try { const G = G0(); if (G && (G.sw554 || G.sw554late) && authOn()) { G.sw554 = null; G.sw554late = null; LOG.horn = (LOG.horn || 0) + 1; } } catch (e) { err(e, 'eq'); }
  return oEQ.apply(this, arguments);
 };
 OB.flagDown = () => { const G = G0(); return !!(G && G.sw554 && !off()); };
})();

 // ======== v488oob (online copy; only the gate changed) ========
(function() {
 'use strict';
 if (typeof step !== 'function') return;
 const off = () => killed() || !!(window.__rl_no488oob || window.__rl_no423ob);
 const okG = G => !!G && !!G.players && !!G.ball && !G.tutorial && !G.brave && authOn();
 const on = () => { try { return !off() && okG(game) && !!OB.ob; } catch (e) { return false; } };
 const LOG = OB.ob488 = { koKept: 0, koDenied: 0, ko: [], air: 0, airFrames: 0, airLand: 0, airSaved: 0, spawn: 0, sp: [], errs: 0, err: [] };
 const err = (w, e) => { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(w + ': ' + String(e && e.message || e)); };
 const outXY = (x, y) => y < FT || y > FB || x > ENDX || x < DEND;
 const band = () => { const b = OB.ob.K.band; return [ b[0](), b[1](), b[2](), b[3]() ]; };
 // ---------- 1. knock-outs only within the hit's reach ----------
 const kd0 = window.knockDown;
 if (typeof kd0 === 'function') window.knockDown = function(c, by, side, pow) {
  let c0 = -1, s0 = 0;
  try { if (on()) { c0 = OB.ob.koCand; s0 = OB.ob.koSkip; } } catch (e) { c0 = -1; }
  const r = kd0.apply(this, arguments);
  try {
   const G = game;
   if (c0 >= 0 && c && by && OB.ob.koCand > c0 && OB.ob.koSkip === s0) {
    // v423 armed a knock-out: same side choice as v423 (nearest band edge within koNear the push points at)
    const K = OB.ob.K, B = band();
    const dx = c.x - by.x, dy = c.y - by.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const kb = c.kb, kx = kb ? kb.vx * kb.t : 0, ky = kb ? kb.vy * kb.t : 0;
    const S = [ { s: 'top', d: c.y - B[2], dot: -uy, reach: -ky }, { s: 'bottom', d: B[3] - c.y, dot: uy, reach: ky },
     { s: 'endR', d: B[1] - c.x, dot: ux, reach: kx }, { s: 'endL', d: c.x - B[0], dot: -ux, reach: -kx } ];
    const w = S.filter(q => q.d <= K.koNear && q.dot >= K.koDot).sort((a, b) => a.d - b.d)[0];
    if (w) {
     const ok = w.reach >= w.d - 1;
     const row = { side: w.s, d: +w.d.toFixed(1), reach: +w.reach.toFixed(1), ok: ok, t: +G.t.toFixed(2), car: [ +c.x.toFixed(1), +c.y.toFixed(1) ] };
     LOG.ko.push(row); if (LOG.ko.length > 30) LOG.ko.shift();
     if (ok) LOG.koKept++; else { LOG.koDenied++; G.no554ko = G.t; }
    }
   }
  } catch (e) { err('kd', e); }
  return r;
 };
 // ---------- 3. a pop that starts outside starts on the line ----------
 function fixSpawn(kind) {
  const G = game, b = G && G.ball;
  if (!b || b.state !== 'loose' || !outXY(b.x, b.y)) return;
  const x0 = b.x, y0 = b.y;
  b.x = Math.max(DEND + .5, Math.min(ENDX - .5, b.x));
  b.y = Math.max(FT + .5, Math.min(FB - .5, b.y));
  LOG.spawn++; LOG.sp.push({ kind: kind, from: [ +x0.toFixed(1), +y0.toFixed(1) ], to: [ +b.x.toFixed(1), +b.y.toFixed(1) ], v: [ +b.vx.toFixed(0), +b.vy.toFixed(0) ], scr: screen });
  if (LOG.sp.length > 30) LOG.sp.shift();
 }
 for (const nm of [ 'popLoose', 'dPopLoose' ]) {
  const p0 = window[nm];
  if (typeof p0 !== 'function') continue;
  window[nm] = function(x, y, vx, vy, kind) {
   const G = game;
   if (!on()) return p0.apply(this, arguments);
   let r;
   if (G && G.no554ko != null && kind === 'hit') {
    const was = OB.koOff;
    G.no554ko = null;
    OB.koOff = true; // the ob copy's koPop stands down for this one pop: a plain LEVELED! ground ball
    try { r = p0.apply(this, arguments); } finally { OB.koOff = was; }
   } else r = p0.apply(this, arguments);
   try { fixSpawn(kind); } catch (e) { err('spawn', e); }
   return r;
  };
 }
 // ---------- 2. airborne ball: out when it comes down outside ----------
 let H = null;
 const s0 = window.step;
 window.step = function(dt) {
  const G = game;
  let hold = null;
  try {
   if (G && G.no554ko != null && G.no554ko !== G.t) G.no554ko = null;
   if (on() && typeof paused !== 'undefined' && !paused && dt > 0 && (screen === 'live' || screen === 'defense') && !(G.readyT > 0) && !(G.el2314 && G.el2314.open)) {
    const b = G.ball;
    if (b.state === 'loose') {
     const z = b.z || 0, vz = b.vz || 0;
     const nz = z + (vz - 240 * dt) * dt;           // updateLooseBall's own z step
     const sp = Math.hypot(b.vx, b.vy);
     let vx = b.vx, vy = b.vy;
     if (sp > .5) { const ns = Math.max(0, sp - GB.fric * dt); vx *= ns / sp; vy *= ns / sp; } else { vx = 0; vy = 0; }
     const nx = b.x + vx * dt, ny = b.y + vy * dt;
     if ((outXY(b.x, b.y) || outXY(nx, ny)) && nz > 1) {
      // still in the air over the line: hold the ball's ground spot just inside for the game's frame, fly it on after
      if (!H || H.b !== b) H = { b: b, cx: Math.max(DEND, Math.min(ENDX, outXY(b.x, b.y) ? b.x : nx)), cy: Math.max(FT, Math.min(FB, outXY(b.x, b.y) ? b.y : ny)), n: 0 };
      if (!H.n) LOG.air++;
      H.n++; LOG.airFrames++;
      hold = { x: nx, y: ny, vx: vx, vy: vy };
      b.x = Math.max(DEND + .5, Math.min(ENDX - .5, b.x));
      b.y = Math.max(FT + .5, Math.min(FB - .5, b.y));
      if ((nx < DEND + .5 && b.vx < 0) || (nx > ENDX - .5 && b.vx > 0)) b.vx = 0;   // no outward ground motion this frame:
      if ((ny < FT + .5 && b.vy < 0) || (ny > FB - .5 && b.vy > 0)) b.vy = 0;       // nothing in the frame can call it yet
     } else if (H && H.b === b && H.n && outXY(b.x, b.y)) {
      // it came down outside: the call (v423ob predictOut) is made at the point where it crossed
      LOG.airLand++;
      if (H.cy <= FT) b.y = FT - .01; else if (H.cy >= FB) b.y = FB + .01;
      if (H.cx <= DEND) b.x = DEND - .01; else if (H.cx >= ENDX) b.x = ENDX + .01;
      if (H.cy > FT && H.cy < FB) b.y = H.cy;
      if (H.cx > DEND && H.cx < ENDX) b.x = H.cx;
      H = null;
     } else if (H && H.b === b && H.n && !outXY(b.x, b.y) && !outXY(nx, ny)) { LOG.airSaved++; H = null; }
    } else if (H) { if (H.n && b.state === 'held') LOG.airSaved++; H = null; }
   }
  } catch (e) { err('pre', e); hold = null; }
  const r = s0.apply(this, arguments);
  try {
   if (hold && game === G && G.ball.state === 'loose' && (screen === 'live' || screen === 'defense')) {
    const b = G.ball;
    b.x = hold.x; b.y = hold.y; b.vx = hold.vx; b.vy = hold.vy;
   }
  } catch (e) { err('post', e); }
  return r;
 };
})();

 // ======== v509calls (online copy; only the gate changed) ========
(function () {
 'use strict';
 if (typeof foulTick !== 'function' || typeof step !== 'function' || typeof FOUL === 'undefined') return;
 const K = {
  settle: .6,      // s after a restart before a pick can be judged (prev-position cache is stale until then)
  minSp: 14,       // screener speed (u/s): moving (same as the game's own threshold)
  maxSp: 60,       // above this the "speed" is a position snap, not running
  contact: 4.6,    // body contact (same radius the game used)
  into: 15,        // screener's speed component INTO the defender (u/s)
  manNear: 25,     // the defender is right on his man (a screen is set to free THAT man)
  chase: 8,        // the defender is moving toward his man (trying to follow him) at least this fast
  lane: 6,         // max distance of the screener from the defender->his-man line
  nearCar: 70,     // screen has to be part of the play
  ballMin: 24,     // same as the game: right next to the ball is a check/hit, not a pick
  cd: 3,           // s per screener/defender pair
  pCall: .3,       // the ref's whistle on a real moving pick
  reachTop: 6.6,   // top sideline strip: a stick reaches the ball this far from the line
  reachSpd: 70,    // only a ball rolling slower than this is pulled in (a hard-rolling ball still goes out)
  reachX: 7        // horizontal stick reach for the pull-in (= the game's scoop reach)
 };
 const LOG = OB.c509 = { on: false, K: K, log: { pickCand: 0, picks: 0, pickRows: [], reach: 0, reachRows: [], gkChase: 0, gkWide: 0, rows: [], errs: [] } };
 const off = () => killed() || !!window.__rl_no509calls;
 const okG = G => !!G && !!G.players && !!G.ball && !G.tutorial && !G.brave && authOn();
 const on = () => { try { return !off() && okG(game); } catch (e) { return false; } };
 const err = (w, e) => { const L = LOG.log; if (L.errs.length < 8) L.errs.push(w + ': ' + String(e && e.message || e).slice(0, 160)); };
 const r1 = v => Math.round(v * 10) / 10;
 const push = (arr, row, n) => { arr.push(row); if (arr.length > (n || 40)) arr.shift(); };
 LOG.on = true;
 // ---------- 1. moving pick: the real rule ----------
 let lastFT = -1;
 function pickTick(dt) {
  const G = game, b = G.ball;
  if (G.over || (screen !== 'live' && screen !== 'defense')) return false;
  if (lastFT < 0 || G.t - lastFT > .1 || G.t < lastFT) G.l554 = G.t;
  lastFT = G.t;
  if (!(dt > 0) || G.t - (G.l554 || 0) < K.settle) return false;
  const offT = screen === 'live' ? 'O' : 'D', defT = screen === 'live' ? 'D' : 'O';
  const car = screen === 'live' ? G.carrier : G.dcar;
  if (!(b.state === 'held' || b.state === 'pass') || !car || G.pen && G.penPending) return false;
  G.pk554 = G.pk554 || {};
  for (const a of G.players) {
   if (a.team !== offT || a === car || a.px == null || a.pickSet || a.callPick || a.down > 0) continue;
   const vx = (a.x - a.px) / dt, vy = (a.y - a.py) / dt, sp = Math.hypot(vx, vy);
   if (sp < K.minSp || sp > K.maxSp) continue;
   if (Math.hypot(a.x - b.x, a.y - b.y) <= K.ballMin || Math.hypot(a.x - car.x, a.y - car.y) > K.nearCar) continue;
   for (const d of G.players) {
    if (d.team !== defT || d.px == null || d.down > 0) continue;
    if (d === G.dctl && screen === 'defense' && G.run) continue;
    const rx = d.x - a.x, ry = d.y - a.y, d1 = Math.hypot(rx, ry);
    if (d1 > K.contact) continue;
    const m = d.mark;
    if (!m || m === a || m.ghost || !G.players.includes(m)) continue;
    const d0 = Math.hypot(d.px - a.px, d.py - a.py);
    if (!(d1 < d0 - .05)) continue;                                   // contact being made, not sliding past
    const rl = d1 || 1, into = (vx * rx + vy * ry) / rl;
    if (into < K.into) continue;                                     // he moved INTO the defender
    const dvx = (d.x - d.px) / dt, dvy = (d.y - d.py) / dt, dIn = -(dvx * rx + dvy * ry) / rl;
    if (Math.hypot(dvx, dvy) > K.maxSp || dIn > into) continue;      // the defender ran into him (or snapped)
    const mx = m.x - d.x, my = m.y - d.y, ml = Math.hypot(mx, my);
    if (ml < 6 || ml > K.manNear) continue;                         // defender is on his man
    if ((dvx * mx + dvy * my) / ml < K.chase) continue;              // ...and going after him
    const t = ((a.x - d.x) * mx + (a.y - d.y) * my) / (ml * ml), perp = Math.abs((a.x - d.x) * my - (a.y - d.y) * mx) / ml;
    if (t <= 0 || t >= 1 || perp > K.lane) continue;                 // standing in the defender's lane to his man
    const k = (a.idx * 7 + d.idx) + (a.team === 'O' ? 0 : 50);
    if ((G.pk554[k] || -9) > G.t - K.cd) continue;
    G.pk554[k] = G.t;
    const L = LOG.log; L.pickCand++;
    const row = { t: r1(G.t), scr: screen, team: a.team, sp: r1(sp), into: r1(into), dIn: r1(dIn), d: r1(d1), lane: r1(perp), toCar: r1(Math.hypot(a.x - car.x, a.y - car.y)), a: [ r1(a.x), r1(a.y) ], def: [ r1(d.x), r1(d.y) ], man: [ r1(m.x), r1(m.y) ], called: false };
    if (Math.random() < K.pCall) {
     row.called = true;
     push(L.pickRows, row);
     if (foulCall('ILLEGAL PICK', screen === 'live' ? 'MOVING PICK - TURNOVER' : 'MOVING PICK - YOUR BALL', screen === 'live' ? 'U' : 'C', a, { tech: true })) { L.picks++; return true; }
    } else push(L.pickRows, row);
   }
  }
  return false;
 }
 const FT0 = window.foulTick;
 window.foulTick = function (dt) {
  if (!on()) return FT0.apply(this, arguments);
  let G = null;
  try { G = game; if (pickTick(dt)) { /* flagged: the game's own tick still runs below (late checks + px refresh) */ } } catch (e) { err('pick', e); }
  const ap = FOUL.aiPick;
  if (!(G && G.forcePick)) FOUL.aiPick = 0;   // the old dice-roll pick is replaced (a scripted forcePick still works)
  try { return FT0.apply(this, arguments); } finally { FOUL.aiPick = ap; }
 };
 // ---------- 2. stick reach over the top sideline / left end line ----------
 function reachTick(dt) {
  const G = game, b = G.ball;
  if (b.state !== 'loose' || (b.z || 0) > 4 || G.readyT > 0) return;   // the game scoops at z <= 4 too
  if (Math.hypot(b.vx || 0, b.vy || 0) > K.reachSpd) return;
  const top = b.y < FT + K.reachTop && b.y >= FT - .5, left = b.x < DEND + 4 && b.x >= DEND - .5;
  if (!top && !left) return;
  let best = null, bd = 1e9;
  for (const p of G.players) {
   if (!(p.team === 'O' || p.team === 'D') || p.gk || p.down > 0 || p.stun > 0) continue;
   const sx = p.x + (screen === 'defense' && p.team === 'D' ? -2 : 2);
   if (top && p.y <= FT + 13.5 && Math.abs(sx - b.x) <= K.reachX) { const d = Math.abs(sx - b.x); if (d < bd) { bd = d; best = p; } }
   if (left && p.x <= DEND + 9.5 && Math.abs(p.y - b.y) <= K.reachX) { const d = Math.abs(p.y - b.y); if (d < bd) { bd = d; best = p; } }
  }
  if (!best) return;
  const L = LOG.log, from = [ r1(b.x), r1(b.y) ];
  if (top) { b.y = Math.max(b.y, best.y - 4); if (b.vy < 0) b.vy = 0; }
  if (left) { b.x = Math.max(b.x, best.x + (screen === 'defense' && best.team === 'D' ? -2 : 2) - 4); if (b.vx < 0) b.vx = 0; }
  L.reach++; push(L.reachRows, { t: r1(G.t), scr: screen, side: top ? 'top' : 'left', from: from, to: [ r1(b.x), r1(b.y) ], p: [ r1(best.x), r1(best.y) ], team: best.team });
 }
 // ---------- 3a. wide shot chase on your offense: their goalie counts as a player ----------
 const UL0 = window.updateLooseBall;
 if (typeof UL0 === 'function') window.updateLooseBall = function (dt) {
  let gk = null;
  try {
   const G = game, b = G.ball;
   if (on() && b.state === 'chase' && G.chase && screen === 'live') {
    const C = G.chase, sp = Math.hypot(b.vx, b.vy), ns = Math.max(C.vf, sp - C.a * dt), f = sp > 0 ? ns / sp : 0;
    const nx = b.x + b.vx * f * dt, ny = b.y + b.vy * f * dt;
    if (nx >= ENDX || ny <= FT || ny >= FB || C.t + dt > GB.chaseT + 1.5) {
     const ex = clamp(nx, MIDX, ENDX), ey = clamp(ny, FT, FB);
     let bd = 1e9, gd = 1e9, bt = null;
     for (const p of G.players) { const d = Math.hypot(p.x - ex, p.y - ey); if (p.team === 'O' || p.team === 'D') { if (d < bd) { bd = d; bt = p.team; } } else if (p.team === 'G' && d < gd) { gd = d; gk = p; } }
     if (gk && gd < bd && bt !== 'D') { gk.team = 'D'; LOG.log.gkChase++; push(LOG.log.rows, { k: 'chase', t: r1(G.t), out: [ r1(ex), r1(ey) ], gd: r1(gd), fd: r1(bd), was: bt }); } else gk = null;
    }
   }
  } catch (e) { err('chase', e); gk = null; }
  try { return UL0.apply(this, arguments); } finally { if (gk) gk.team = 'G'; }
 };
 // ---------- 3b. CPU wide shot on your end: your goalie counts as a player ----------
 let snap = null;
 const S0 = window.step;
 window.step = function (dt) {
  let act = false;
  try {
   act = on() && typeof paused !== 'undefined' && !paused && dt > 0 && (screen === 'live' || screen === 'defense');
   if (act) {
    const G = game;
    reachTick(dt);
    snap = null;
    if (screen === 'defense' && G.ball.state === 'shot' && G.gk2) snap = { dMiss: G.dMiss || 0, pos: G.players.map(p => [ p, p.x, p.y ]) };
   }
  } catch (e) { err('pre', e); }
  const r = S0.apply(this, arguments);
  try {
   const G = game;
   if (act && snap && G && (G.dMiss || 0) > snap.dMiss && screen === 'defense' && G.dcar && G.ball.state === 'held' && G.gk2 && G.players.includes(G.gk2)) {
    const c = G.dcar, gk = G.gk2, ex = DEND, ey = c.y;
    const pre = snap.pos.find(q => q[0] === c);
    const cd = pre ? Math.hypot(pre[1] - ex, pre[2] - ey) : 1e9, gd = Math.hypot(gk.x - ex, gk.y - ey);
    if (pre && gd < cd && Math.abs(c.x - (DEND + 8)) < .01 && !G.dclear) {
     c.x = pre[1]; c.y = pre[2];
     G.dcar = null; G.chk = null; G.el2403 = null;
     const b = G.ball;
     b.x = gk.x + 5; b.y = gk.y - 16;
     LOG.log.gkWide++; push(LOG.log.rows, { k: 'wide', t: +(G.t).toFixed(1), out: [ ex, r1(ey) ], gd: r1(gd), fd: r1(cd) });
     startClear(gk, 'WIDE! GOALIE WAS CLOSEST - YOUR BALL');
    }
   }
  } catch (e) { err('post', e); }
  snap = null;
  return r;
 };
})();

 // ======== v509rules (online copy; only the gate changed) ========
(function () {
 'use strict';
 if (typeof penCountUp !== 'function' || typeof foulCall !== 'function') return;
 const K = { foulOut: 5, personal: /SLASHING|ILLEGAL BODY CHECK|CROSS CHECK|TRIPPING|UNNECESSARY ROUGHNESS|UNSPORTSMANLIKE|ILLEGAL CROSSE/ };
 const LOG = OB.r509 = { on: false, K: K, counted: 0, techSkipped: 0, fouledOut: 0, errs: [] };
 const off = () => killed() || !!window.__rl_no509rules;
 const on = () => { try { const G = game; return !off() && !!G && !G.tutorial && authOn(); } catch (e) { return false; } };
 const err = (w, e) => { if (LOG.errs.length < 6) LOG.errs.push(w + ': ' + String(e && e.message || e).slice(0, 160)); };
 LOG.on = true;
 let fouledOut = 0;   // set by our penCountUp on a 5th personal foul; the game's next EJECTED banner is renamed
 const lastLabel = G => { const L = G && G.foulLog; return L && L.length ? String(L[L.length - 1].foul || '') : ''; };
 const fix = (txt, sub) => {
  if (!fouledOut || txt !== 'EJECTED') return null;
  fouledOut = 0;
  return [ 'FOULED OUT', String(sub || '').replace('3RD PENALTY', '5TH PERSONAL FOUL').replace('3 PENALTIES', '5 PERSONAL FOULS') ];
 };
 for (const nm of [ 'endPossession', 'dEnd', 'ruleBanner' ]) {
  const f0 = window[nm];
  if (typeof f0 !== 'function') continue;
  window[nm] = function (kind, txt, sub) {
   try { const r = on() ? fix(txt, sub) : null; if (r) { const a = Array.prototype.slice.call(arguments); a[1] = r[0]; a[2] = r[1]; return f0.apply(this, a); } } catch (e) { err(nm, e); }
   return f0.apply(this, arguments);
  };
 }
 const PC0 = window.penCountUp;
 window.penCountUp = function (whoP, side) {
  if (!on()) return PC0.apply(this, arguments);
  try {
   const G = game, pl = whoP && whoP.pl;
   if (!G || !pl) return PC0.apply(this, arguments);
   const label = lastLabel(G);                        // foulCall logs the foul (foulLog) right before it counts it
   if (!K.personal.test(label)) { LOG.techSkipped++; return false; }   // technicals never count toward fouling out
   const fk = G.dup2504 && G.dup2504.includes(pl.id) ? side + '|' + pl.id : pl.id;
   G.pf554 = G.pf554 || {};
   const n = G.pf554[fk] = (G.pf554[fk] || 0) + 1;
   LOG.counted++;
   G.pf = G.pf || {};
   G.pf[fk] = n >= K.foulOut ? 2 : 0;            // the game's own count trips (>= 3) only on the 5th personal foul
   const r = PC0.apply(this, arguments);
   if (r) {
    fouledOut = 1; LOG.fouledOut++;
    if (G.ejBanner) { G.ejBanner.txt = 'FOULED OUT'; G.ejBanner.sub = lastName(pl) + ' IS DONE - 5 PERSONAL FOULS'; }
   }
   return r;
  } catch (e) { err('count', e); return PC0.apply(this, arguments); }
 };
})();

 // ---------- the other phone: the slow-whistle flag tag (the authority phone draws it in drawHUD) ----------
 const RN0 = W0.render;
 if (typeof RN0 === 'function') W0.render = function () {
  const r = RN0.apply(this, arguments);
  try {
   const G = G_(), s = N.view && N.view.last;
   if (G && active() && !N.auth && scr() === 'netview' && s && s.sw554 && (s.scr === 'live' || s.scr === 'defense')) {
    const t = 'FLAG DOWN - PLAY ON', tw = textW(t, 1), bx = 3, by = 18, bw = tw + 18;
    rect(bx, by, bw, 11, 'rgba(5,7,11,.92)');
    rect(bx, by, bw, 1, '#ffe14d');
    const fl = Math.floor((G.t || menuT || 0) * 4) % 2;
    rect(bx + 4, by + 2, 1, 8, '#e8e8e8');
    rect(bx + 5, by + 2 + fl, 5, 4, '#ffd200');
    text(t, bx + 13, by + 4, 1, '#ffe14d', 'left');
    OB.st.tagDrawn = (OB.st.tagDrawn || 0) + 1;
   }
  } catch (e) { er(e, 'tag'); }
  return r;
 };
 // ---------- frame: handshake + match start / end ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  const r = ST0.apply(this, arguments);
  try {
   if (!killed()) {
    if (N.inGame && !CP.wasIn) { CP.on = false; if (N.side !== 'h' && CP.onAt && now() - CP.onAt < 20000) CP.on = true; lg({ ev: 'begin', side: N.side, cap: CP.peer, on: CP.on }); }
    if (!N.inGame && CP.wasIn) CP.on = false;
    CP.wasIn = !!N.inGame;
    if (!N.link) { CP.peer = false; CP.hellos = 0; CP.onAt = 0; }
    else if (CP.linkRef !== N.link) { CP.linkRef = N.link; CP.peer = false; CP.hellos = 0; CP.onAt = 0; }
    if (N.link && !CP.peer && CP.hellos < 12 && now() - CP.helloT > 3000) { CP.helloT = now(); CP.hellos++; try { N.link.send({ t: 'n54h', c: 554 }); } catch (e) {} }
    if (N.inGame && N.side === 'h' && CP.peer) hostOn('frame');
   }
  } catch (e) { er(e, 'frame'); }
  return r;
 };
 W0.V554NC = { on: active, auth: authOn, CP: CP, OB: OB, placeOb: placeOb };
})();
