// ===== BAGGA LAX v541blocklive.js - BLOCKED SHOTS PLAY ON: LIVE GROUND BALL OFF THE BLOCKER, HARD SHOTS CAN DROP HIM (BOTH WAYS) =====
// Charlie, Nov 12 12:27 AM: "Blocked shots shouldn't go back to being your ball it should play out bounce off the player and be a
// ground ball live no more blocked message. If it's a hard shot sometimes it will knock the player over and rare cases injure them."
// + "Same for cpu if they hit you" (12:27 AM): symmetric, your blocks of CPU shots work the same way.
// Before: YOUR shots: releaseShot (game.js) rolls b.block = {dist} when a CPU defender stands in the lane (50%, 15% in close). When
// the ball reached that distance updateLive popped it dead and called endPossession(35% 'keep' / 65% 'turnover', 'BLOCKED!', ...):
// whistle, BLOCKED! banner, restart. CPU shots (dShoot, defense screen) could never be blocked at all - they went through your guys.
// No block stat existed; the shot already counts in releaseShot (stats.shots / box 'sh') and dShoot.
// Now:
//  * Your shot blocked: that endPossession('BLOCKED!') is intercepted. No banner, no whistle.
//  * CPU shot: right after dShoot the same lane rule is rolled against YOUR players (same 50% / 15%, same 4-70 px lane, 3.5 px wide;
//    the defender you are steering gets his stick in it too: 6 px).
//  * Either way the ball deflects off the blocker's body: back out at 15-30% of the shot's speed with a random spread, or 25% of the
//    time a glancing tip that keeps going sideways at 22-34% - and becomes a LIVE ground ball through the game's own popLoose /
//    dPopLoose (same scoop, chase, last-touch and out-of-bounds code as a check or a pipe). Anyone can scoop it.
//  * Hard shots (speed >= 320, about 60% power and up) knock the blocker down 25% of the time: short down (~0.8-0.95 s), knocked back
//    along the shot line, "STUNG!". 2% of those knockdowns force the game's own injuryRoll for the blocker (injuries only exist in
//    season games and ghost games; the game's own per-game cap and sub-in still apply).
//  * Counters: game.blk541 [your blocks, cpu blocks], game.blkKd541, game.blkInj541; window.V541 log. Saves untouched.
// Tutorial (its shooting drill reads the BLOCKED outcome) and a remote banner being applied online: unchanged.
// Online: your blocked shot is resolved inside updateLive on the authoritative side only and becomes popLoose there - the same path a
// remote hit already uses (net.js remoteHit) - so the other phone just sees the loose ball. Knockdowns/injuries and the new CPU-shot
// blocks are offline only (online has no CPU shooter).
// Kill switch: window.__rl_no541bl = true (old behaviour: BLOCKED! banner, CPU shots unblockable).
(function () {
 'use strict';
 if (typeof window === 'undefined' || typeof window.endPossession !== 'function' || typeof window.popLoose !== 'function') return;
 const W = window;
 const off = () => !!(W.__rl_no541bl || W.__rl_v124gb);
 const netIn = () => { try { return !!(W.RLNET && RLNET.inGame); } catch (e) { return false; } };
 const applying = () => { try { return !!(W.RLNET && RLNET.applying); } catch (e) { return false; } };
 const gm = () => (typeof game !== 'undefined' ? game : null);
 const CFG = { HARD: 320, kdP: .25, injP: .02, downMul: .65, vLo: .15, vHi: .30, vMin: 38, vMax: 105, glance: .25, laneP: .5, laneNearP: .15, stickLane: 6 };
 const LOG = W.V541 = { cfg: CFG, blocks: 0, userBlocks: 0, cpuBlocks: 0, cpuRolls: 0, legacy: 0, hard: 0, kd: 0, inj: 0, injTry: 0, online: 0, last: null, errs: 0, err: [], ev: [] };
 const err = (w, e) => { LOG.errs++; if (LOG.err.length < 6) LOG.err.push(w + ': ' + String(e && e.message || e)); };
 const rr = (a, b) => a + Math.random() * (b - a);
 const cl = (v, a, b) => Math.max(a, Math.min(b, v));
 const field = p => p && !p.gk && p.role !== 'G' && p.team !== 'G' && p.team !== 'G2';
 const body = (p, b) => Math.hypot(p.x - b.x, p.y - 6 - b.y); // the game's lane test uses (p.x, p.y - 6) as the body point

 // the defender of team `team` the lane roll would pick (or null), using releaseShot's rule
 function laneBlocker(G, b, team, roll, near) {
  const sp = Math.hypot(b.vx, b.vy) || 1, vx = b.vx / sp, vy = b.vy / sp;
  let best = null, bp = 1e9;
  for (const d of G.players || []) {
   if (d.team !== team || !field(d) || d.down > 0) continue;
   const rx = d.x - b.x, ry = d.y - 6 - b.y, proj = rx * vx + ry * vy;
   if (proj < 4 || proj > 70) continue;
   // 3.5 px = the game's own lane; the defender YOU are steering on D also gets his stick in it (6 px)
   const w = team === 'O' && d === G.dctl ? CFG.stickLane : 3.5;
   if (Math.abs(rx * vy - ry * vx) < w && proj < bp) { bp = proj; best = d; }
  }
  if (!best) return null;
  if (roll && !(Math.random() < (near ? CFG.laneNearP : CFG.laneP))) return null;
  return { p: best, dist: bp };
 }
 function nearestOfTeam(G, b, team) {
  let best = null, bd = 1e9;
  for (const p of G.players || []) { if (p.team !== team || !field(p)) continue; const d = body(p, b); if (d < bd) { bd = d; best = p; } }
  return best && bd < 60 ? best : null;
 }

 function knock(G, p, ux, uy, h) {
  const HD = (typeof HIT === 'object' && HIT.down) || 1.25, kbT = (typeof HIT === 'object' && HIT.kbT) || .18;
  const dn = HD * CFG.downMul * (.9 + .3 * h);
  p.down = dn; p.stun = dn; p.downT0 = dn;
  p.kb = { vx: ux * 6 / kbT, vy: uy * 6 / kbT, t: kbT };
  p.fallDir = ux >= 0 ? 1 : -1;
  try { addFx('txt', p.x, p.y - 28, { s: 'STUNG!', col: '#ff9a8a', life: .9 }); } catch (e) {}
  try { if (typeof hit12 === 'function') hit12(.55); } catch (e) {}
  G.blkKd541 = (G.blkKd541 || 0) + 1; LOG.kd++;
  let hurt = false;
  if (Math.random() < CFG.injP || W.__rl_force541inj) {
   LOG.injTry++;
   const n0 = G.injN ? G.injN[0] + G.injN[1] : 0;
   G.forceInj = true;
   try { if (typeof injuryRoll === 'function') hurt = !!injuryRoll(p.team === 'O' ? 'cpuHit' : 'hit', p); } catch (e) { err('inj', e); }
   G.forceInj = false; // injuryRoll only clears it once it reaches its roll; never leave it armed
   if (hurt || (G.injN && G.injN[0] + G.injN[1] > n0)) { hurt = true; G.blkInj541 = (G.blkInj541 || 0) + 1; LOG.inj++; }
  }
  return hurt;
 }

 // ball is at the block point; blk = the blocker; side 0 = your player blocked, 1 = cpu blocked
 function deflect(G, blk, side, pop) {
  const b = G.ball, sp = Math.hypot(b.vx || 0, b.vy || 0) || 200;
  const ux = (b.vx || (side ? 1 : -1)) / sp, uy = (b.vy || 0) / sp;
  const inA = Math.atan2(uy, ux);
  let a, v;
  if (Math.random() < CFG.glance) { a = inA + (Math.random() < .5 ? -1 : 1) * rr(.9, 1.6); v = sp * rr(.22, .34); }
  else { a = inA + Math.PI + rr(-1.15, 1.15); v = sp * rr(CFG.vLo, CFG.vHi); }
  v = cl(v, CFG.vMin, CFG.vMax);
  const x = b.x, y = b.y;
  b.block = null; b.pipe = null; b.aim14 = null; b.blk541 = null; b.dblk541 = null;
  pop(x, y, Math.cos(a) * v, Math.sin(a) * v, 'block');
  try { addFx('pop', x, y); } catch (e) {}
  G.blk541 = G.blk541 || [0, 0]; G.blk541[side]++;
  LOG.blocks++; if (side === 0) LOG.userBlocks++; else LOG.cpuBlocks++;
  const hard = sp >= CFG.HARD;
  if (hard) LOG.hard++;
  let kd = false, hurt = false;
  if (blk && hard && !netIn() && !G.online && (Math.random() < CFG.kdP || W.__rl_force541kd)) { hurt = knock(G, blk, ux, uy, cl((sp - CFG.HARD) / 140, 0, 1)); kd = true; }
  LOG.last = { side: side ? 'cpu blocked' : 'you blocked', scr: screen, t: +(+G.t || 0).toFixed(2), sp: Math.round(sp), v: Math.round(v), a: +a.toFixed(2), hard: hard, kd: kd, hurt: hurt, who: blk && blk.pl ? blk.pl.id : null };
  LOG.ev.push(LOG.last); if (LOG.ev.length > 40) LOG.ev.shift();
 }

 // ---------- YOUR shots (live screen): replace the BLOCKED! whistle ----------
 if (typeof W.releaseShot === 'function') {
  const RS0 = W.releaseShot;
  W.releaseShot = function () {
   const r = RS0.apply(this, arguments);
   try { // remember which CPU defender the game's lane roll picked (releaseShot stores only the distance)
    const G = gm(), b = G && G.ball;
    if (!off() && b && b.state === 'shot') { b.blk541 = null; if (b.block && b.block.dist > 0) { const L = laneBlocker(G, b, 'D', false); if (L) b.blk541 = L.p; } }
   } catch (e) { err('tag', e); }
   return r;
  };
 }
 const EP0 = W.endPossession;
 W.endPossession = function (kind, txt, sub) {
  try {
   const G = gm();
   if (txt === 'BLOCKED!' && !off() && G && !G.over && !G.tutorial && !applying() && screen === 'live' && G.ball && G.players) {
    if (netIn()) LOG.online++;
    const b = G.ball, pre = b.blk541;
    const blk = pre && G.players.includes(pre) && pre.team === 'D' && body(pre, b) < 45 ? pre : nearestOfTeam(G, b, 'D');
    deflect(G, blk, 1, popLoose);
    return;
   }
   if (txt === 'BLOCKED!') LOG.legacy++;
  } catch (e) { err('ep', e); }
  return EP0.apply(this, arguments);
 };

 // ---------- CPU shots (defense screen): your players can block them now ----------
 const cpuOk = G => !off() && G && !G.tutorial && !G.over && !netIn() && !G.online && screen === 'defense' && typeof W.dPopLoose === 'function';
 if (typeof W.dShoot === 'function') {
  const DS0 = W.dShoot;
  W.dShoot = function (c) {
   const r = DS0.apply(this, arguments);
   try {
    const G = gm(), b = G && G.ball;
    if (b) b.dblk541 = null;
    if (cpuOk(G) && b.state === 'shot' && b.shooter === c) {
     LOG.cpuRolls++;
     const near = typeof DGX === 'number' ? Math.hypot(c.x - DGX, c.y - CY) < 44 : false;
     const L = W.__rl_force541cpu ? laneBlocker(G, b, 'O', false, near) : laneBlocker(G, b, 'O', true, near);
     if (L) b.dblk541 = { p: L.p, dist: L.dist, x0: b.x, y0: b.y };
    }
   } catch (e) { err('dshoot', e); }
   return r;
  };
 }
 if (typeof W.updateDefense === 'function') {
  const UD0 = W.updateDefense;
  W.updateDefense = function (dt) {
   try {
    const G = gm(), b = G && G.ball, k = b && b.dblk541;
    if (k) {
     if (b.state !== 'shot' || !cpuOk(G)) b.dblk541 = null;
     else {
      const nx = b.x + b.vx * dt, ny = b.y + b.vy * dt;
      if (Math.hypot(nx - k.x0, ny - k.y0) >= k.dist) {
       const sp = Math.hypot(b.vx, b.vy) || 1;
       b.x = k.x0 + b.vx / sp * k.dist; b.y = k.y0 + b.vy / sp * k.dist;
       const blk = G.players.includes(k.p) && body(k.p, b) < 45 ? k.p : nearestOfTeam(G, b, 'O');
       deflect(G, blk, 0, dPopLoose);
      }
     }
    }
   } catch (e) { err('ud', e); }
   return UD0.apply(this, arguments);
  };
 }
})();
