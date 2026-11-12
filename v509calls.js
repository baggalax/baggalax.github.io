// ===== BAGGA LAX v509calls.js - NO MORE PHANTOM MOVING PICKS / UNREACHABLE SIDELINE BALLS =====
// Charlie (Nov 11, 7:39 PM, 1.3 web test): "I also get called for random out of bounds and illegal picks same for cpu team
//  they get random ones too sometimes check that".
// What instrumented headless matches showed (every whistle logged with positions, ball, carrier, speeds):
//  1. ILLEGAL PICK (game.js foulTick ~16997) was a dice roll, not a rule: ANY off-ball attacker moving > 14 u/s who came
//     within 4.6 u of ANY defender not guarding him, more than 24 u from the ball, had a 1.2% chance per brush (3 s cooldown)
//     to be flagged. Nothing checked that he moved INTO the defender, that the defender was guarding someone he was screening
//     off, or that the "speed" was real: the logged calls were (a) a CPU cutter 117 u from the ball brushed by a defender
//     running at full speed into HIM, (b) a "screener" whose speed read 137 u/s = a position snap after a restart (the
//     prev-position cache px/py is only refreshed while live, so the first live frame after a whistle reads a teleport),
//     (c) on Bagga, an attacker barely moving (15.8 u/s) hit by a defender at 52 u/s, 87 u from the ball. ~1 in 3 matches
//     had one, both teams, all random. Real rule (NCAA Rule 6-? "illegal offensive screening", NFHS 6-5: moving pick): an
//     offensive player may not MOVE INTO and make contact with a defender to block him from the man he is guarding.
//     Now the call needs all of that: screener really moving (14-60 u/s, not in the first 0.6 s after a restart), contact
//     (<= 4.6 u and the gap closing), moving INTO the defender (>= 15 u/s toward him and faster than the defender comes at
//     him), the defender right on his man (<= 25 u) and going after him, the screener in that lane (between them), near
//     the ball carrier (<= 70 u). Then the ref flags it 30% of the time (refs let incidental ones go). Your PICK play (hold a teammate) and set picks: never called,
//     same as before.
//  2. OUT OF BOUNDS at the TOP sideline: field players' feet are clamped at FT+12 (so the sprite stays on the field) but a
//     ground ball is scooped from the feet (reach 7 u, y x1.2) -> a loose ball in the top 6 u of the field (y 32-38) could
//     never be picked up and rolled out: 6 of 7 out-of-bounds calls in the first test batch were at the top line, with the
//     closest player standing right on it. Same 3 u strip on the left end line. Now a player standing at that clamp reaches
//     over with his stick: a loose ball on (or bouncing just off) the ground in that strip right next to him is pulled into his reach, so
//     he scoops it like anywhere else on the field.
//  3. SHOT OUT OF BOUNDS - closest player: the real rule counts EVERY player, goalies too; the game skipped goalies. Now
//     a goalie counts: a CPU shot wide on your end where YOUR goalie is closest to where it went out = your ball (was:
//     the nearest field player, often their attacker behind the cage); your wide shot where THEIR goalie is closest =
//     their ball.
// Offline games only (online, tutorial, BRAVEHEART unchanged). Kill switch: window.__rl_no509calls = true. Telemetry: window.V509C.
(function () {
 'use strict';
 if (typeof window === 'undefined' || typeof foulTick !== 'function' || typeof step !== 'function' || typeof FOUL === 'undefined') return;
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
 const LOG = window.V509C = { on: false, K: K, log: { pickCand: 0, picks: 0, pickRows: [], reach: 0, reachRows: [], gkChase: 0, gkWide: 0, rows: [], errs: [] } };
 const off = () => !!(window.__rl_no509calls || window.__rl_v124gb);
 const netIn = () => { try { return !!(window.RLNET && RLNET.inGame); } catch (e) { return false; } };
 const okG = G => !!G && !!G.players && !!G.ball && !G.online && !G.tutorial && !G.brave && !(G.meta && G.meta.online) && !netIn();
 const on = () => { try { return !off() && okG(game); } catch (e) { return false; } };
 const err = (w, e) => { const L = LOG.log; if (L.errs.length < 8) L.errs.push(w + ': ' + String(e && e.message || e).slice(0, 160)); };
 const r1 = v => Math.round(v * 10) / 10;
 const push = (arr, row, n) => { arr.push(row); if (arr.length > (n || 40)) arr.shift(); };
 if (off()) return;
 LOG.on = true;
 // ---------- 1. moving pick: the real rule ----------
 let lastFT = -1;
 function pickTick(dt) {
  const G = game, b = G.ball;
  if (G.over || (screen !== 'live' && screen !== 'defense')) return false;
  if (lastFT < 0 || G.t - lastFT > .1 || G.t < lastFT) G.l509 = G.t;
  lastFT = G.t;
  if (!(dt > 0) || G.t - (G.l509 || 0) < K.settle) return false;
  const offT = screen === 'live' ? 'O' : 'D', defT = screen === 'live' ? 'D' : 'O';
  const car = screen === 'live' ? G.carrier : G.dcar;
  if (!(b.state === 'held' || b.state === 'pass') || !car || G.pen && G.penPending) return false;
  G.pk509 = G.pk509 || {};
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
    if ((G.pk509[k] || -9) > G.t - K.cd) continue;
    G.pk509[k] = G.t;
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
