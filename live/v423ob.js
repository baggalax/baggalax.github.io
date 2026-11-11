// ===== BAGGA LAX v423ob.js - OUT OF BOUNDS: LAST TOUCH, RESTART AT THE SPOT, KNOCKED OUT ON A HIT =====
// Charlie, Nov 3: "Should be last person to touch the ball it's out on so goes to other team" / "when the ball goes out the endline
// you should start back up with it right where it went out. Not just the corner bottom" / "I don't want to be able to step out tho but
// if i get checked and ball goes out it out on me and if i get hit on the sideline i should be able to get hit out".
// Before (V40.1.3): every ball out of bounds went to the team CLOSEST to it; restarts were clamped (setupPossession GX-60, resumeOurs GX-6,
// startDefense DGX+40, rulesAfterBanner) and a wide shot backed up by the closest player was snapped to the corner (h3Corner: ENDX-6 / DEND+8,
// FT+13 or FB-4) - that is the "corner bottom". Players can never step out (field clamps) - unchanged.
// Now (offline games only):
//  1. LAST TOUCH: a non-shot ball out of bounds (loose ball after a check / hit / drop, faceoff-free play) goes to the team that did NOT touch it
//     last. Last touch = the team that last held it, passed it or popped it loose (a check that knocks it loose counts as the carrier's touch;
//     this game has no "touch without possession", every scoop that touches the ball wins it). Tracked every frame before the game update.
//  2. SHOTS: a shot that goes out (wide -> backing-up chase, off the pipe and out) keeps the CLOSEST-player rule. Shot = the ball was last in
//     the 'shot' state (releaseShot / dShoot) before it went loose or into the chase; a pass is never a shot.
//  3. RESTART AT THE SPOT: the ball is spotted where it crossed the line; the restart carrier stands just inside so the ball in his stick is on
//     that spot (clamped only to the playable band and kept out of the crease). During the whistle he jogs there at his own top speed (the banner
//     waits up to 5 s), so nothing teleports (v418t / tp35 untouched).
//  4. KNOCKED OUT: players still cannot run out. A carrier who is LEVELED within a few px of the sideline/endline by a hit that pushes him
//     outward (75%) is carried over the line with the ball: whistle, KNOCKED OUT OF BOUNDS, other team's ball at that spot. Both ways (CPU slide
//     on you, your hit or slide on their carrier). A hit elsewhere still pops the ball, and if that ball rolls out it is on the carrier (rule 1).
// Online, tutorial and BRAVEHEART: unchanged. Kill switch: window.__rl_no423ob = true (V40.1.3 behaviour exactly).
(function() {
 'use strict';
 if (typeof window === 'undefined' || typeof step !== 'function') return;
 const off = () => !!(window.__rl_no423ob || window.__rl_v124gb);
 const netIn = () => { try { return !!(window.RLNET && RLNET.inGame); } catch (e) { return false; } };
 const okG = G => !!G && !!G.players && !!G.ball && !G.online && !G.tutorial && !G.brave && !netIn();
 const on = () => !off() && okG(game);
 const LOG = window.V423 = { oob: 0, by: {}, shotOob: 0, ltU: 0, ltC: 0, ltNone: 0, toU: 0, toC: 0, ko: 0, koU: 0, koC: 0, koSkip: 0, koCand: 0,
  walks: 0, walkMax: 0, walkLate: 0, chaseFix: 0, h3fix: 0, fallback: 0, restarts: [], last: null, errs: 0, err: [] };
 const err = (w, e) => { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(w + ': ' + String(e && e.message || e)); };
 const K = LOG.K = { band: [ () => DEND + 8, () => ENDX - 3, () => FT + 12, () => FB - 2 ], koNear: 9, koDot: .45, koP: .75, walkMax: 5, minBanner: 1.2 };
 const OFF = { U: [ () => BX, () => BY ], C: [ () => -10, () => -9 ] };
 const pk = p => (typeof tp35key === 'function' ? tp35key(p) : null);
 const allP = G => (G.players || []).concat(G.farU || [], G.farC || []);
 const field = p => p && (p.team === 'O' || p.team === 'D') && !p.gk && !p.far;
 const teamOf = p => p && (p.team === 'O' || p.team === 'G2' || p.team === 'U') ? 'U' : 'C';
 const capOf = p => { try { return tp35cap(p); } catch (e) { return 60; } };
 const oppName = () => { try { return T(game.opp).name; } catch (e) { return 'THEIR'; } };
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
  const lt = G.lt423 || null;
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
  if (cause === 'ko') sub = team === 'U' ? 'HIT OUT WITH IT - YOUR BALL' : 'HIT OUT WITH IT - ' + opp + ' BALL';
  else if (why === 'last') sub = team === 'U' ? 'OFF ' + opp + ' - YOUR BALL' : 'OFF YOU - ' + opp + ' BALL';
  else if (why === 'shot') sub = team === 'U' ? 'SHOT - YOU WERE CLOSEST - YOUR BALL' : 'SHOT - THEY WERE CLOSEST - THEIR BALL';
  else sub = team === 'U' ? 'YOU WERE CLOSEST - YOUR BALL' : 'THEY WERE CLOSEST - THEIR BALL';
  if (scr0 === 'live') endPossession(team === 'U' ? 'ours' : 'turnover', txt, sub);
  else ruleBanner(team === 'U' ? 'rturnU' : 'rturn', txt, sub);
  if (team === 'C' && scr0 === 'live') try { SFX.whistle(); } catch (e) {}
  if (G.banner) G.banner.ob423 = plan;
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
  const P = G.banner && G.banner.ob423;
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
  const W = G.w423;
  if (!W) return;
  if (screen !== W.scr || !(G.readyT > 0)) { G.w423 = null; return; }
  W.t += dt;
  const p = findKey(G, W.k);
  if (!p) { G.w423 = null; return; }
  const ok = walkTo(p, W.x, W.y, dt);
  const b = G.ball;
  if (b.state === 'held' && (G.dcar === p || G.carrier === p)) { if (G.dcar === p) { const s = dStick(p); b.x = s[0]; b.y = s[1]; } else { b.x = p.x + BX; b.y = p.y + BY; } }
  if (!ok && W.t < K.walkMax) G.readyT = Math.max(G.readyT, .25);
  else { LOG.walks++; LOG.walkMax = Math.max(LOG.walkMax, +W.t.toFixed(2)); if (!ok) LOG.walkLate++; G.w423 = null; }
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
   G.resume = { p: w && w.team === 'O' ? w : nearestTo('O', P.spot.x, P.spot.y), x: P.spot.x, y: P.spot.y, chase: P.why === 'shot', ob423: P };
   G.ob423spot = P.spot;
   try { resumeOurs(); } finally { G.ob423spot = null; }
   if (screen === 'live') placeCar(G, G.carrier, P);
   G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
   return logRestart(G, P, 'resumeOurs');
  }
  if (P.scr0 === 'live' && P.team === 'C') {
   b.x = P.out.x; b.y = P.out.y; G.turnSpot = null;
   if (!startDefenseLive()) { startCpu(); return logRestart(G, P, 'startCpu'); }
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
  const G = game, P = G && G.banner && G.banner.ob423;
  if (!P || off() || !okG(G)) return oAfter.apply(this, arguments);
  try { if (typeof v14PreBanner === 'function' && v14PreBanner(G.banner.kind)) return; } catch (e) { err('v14', e); }
  G.banner.ob423 = null;
  try { return restart(G, P); } catch (e) { err('restart', e); return oAfter.apply(this, arguments); }
 };
 const oResume = window.resumeOurs;
 if (typeof oResume === 'function') window.resumeOurs = function() {
  const G = game, R = G && G.resume;
  // a backed-up wide shot (closest-player rule, game.js chase branch): restart where it went out, not at the corner
  if (R && !R.ob423 && R.chase && on() && G.ob423chase) { G.ob423spot = G.ob423chase; }
  const r = oResume.apply(this, arguments);
  if (G && G.ob423spot && screen === 'live' && G.carrier && !(R && R.ob423)) placeCar(G, G.carrier, { spot: G.ob423spot });
  if (G && !(R && R.ob423)) { G.ob423spot = null; G.ob423chase = null; }
  return r;
 };
 const oH3 = window.h3Corner;
 if (typeof oH3 === 'function') window.h3Corner = function(G, side) {
  if (!on() || !G) return oH3.apply(this, arguments);
  const u = side === 'U', c = u ? G.carrier : G.dcar;
  if (!c) return oH3.apply(this, arguments);
  let s = u ? G.ob423spot : null;
  if (!u) { // CPU backs up our wide shot: game.js put him on the endline at the ball's y; keep that, jog him there
   s = { x: c.x, y: Math.max(FT + 12, Math.min(FB - 2, c.y)) };
   G.w423 = { k: pk(c), x: s.x, y: s.y, t: 0, scr: screen };
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
  G.h3 = { side: side, cx: c.x, cy: c.y, dx: sx, dy: sy, gap: Math.hypot(sx - c.x, sy - c.y), ob423: 1 };
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
  if (!KO || kind !== 'hit' || !on()) return false;
  const k = KO; KO = null;
  if (G.t !== k.t) return false;
  const c = k.c, w = k.w;
  if (!((screen === 'live' && G.carrier === c) || (screen === 'defense' && G.dcar === c))) return false;
  // the ball goes over with him: spot = where he crosses the line, just inside
  const team = k.team, o = OFF[team];
  const lineX = w.side === 'end' ? (w.ox > MIDX ? ENDX : DEND) : Math.max(DEND, Math.min(ENDX, w.ox + o[0]()));
  const lineY = w.side === 'top' ? FT : w.side === 'bottom' ? FB : Math.max(FT, Math.min(FB, w.oy + o[1]()));
  LOG.ko++; if (team === 'U') LOG.koU++; else LOG.koC++;
  G.ko423 = (G.ko423 || 0) + 1;
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
    if (ht) G.lt423 = { team: ht, shot: st === 'shot', st: st };
    else if (st === 'fo' || screen === 'faceoff') G.lt423 = null;
    if (screen === 'banner') bannerTick(G, dt);
    if (G.w423) readyWalkTick(G, dt);
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
    if (G.lastChase && G.lastChase !== lc0 && screen === 'banner' && G.banner && !G.banner.ob423) {
     const L = G.lastChase, team = L.team === 'O' ? 'U' : 'C';
     const ox = L.x, oy = L.y, spot = legal(team, ox, oy);
     LOG.chaseFix++; LOG.shotOob++;
     if (team === 'U' && G.resume && G.resume.p) {
      G.resume.x = spot.x; G.resume.y = spot.y;
      G.banner.ob423 = { team: 'U', why: 'shot', cause: 'chase', scr0: 'live', out: { x: ox, y: oy }, spot: spot, wk: pk(G.resume.p), t: 0, ko: null };
     } else if (team === 'C') {
      const w = nearest(G, 'C', spot.x, spot.y);
      G.banner.ob423 = { team: 'C', why: 'shot', cause: 'chase', scr0: 'live', out: { x: ox, y: oy }, spot: spot, wk: pk(w), t: 0, ko: null };
     }
     G.lastOob = { team: L.team, x: ox, y: oy, why: 'shot', cause: 'chase' };
    }
   }
  } catch (e) { err('post', e); }
  if (KO && game && KO.t !== game.t) KO = null;
  return r;
 };
})();
