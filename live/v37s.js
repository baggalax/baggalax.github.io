(function() {
 'use strict';
 if (typeof RL12 === 'undefined' || !RL12.FR || typeof frame12 !== 'function' || typeof drawPlayer12 !== 'function') return;
 const ADD = {
  scoop37_sr: [ 7, 15, [ 17, -2 ], [ ".................ooooo......", "...............ooHHHHwoo....", "..............oHHHHHHHHwo...", ".......ooooooohHHHHHHHHHHo..", "......oJJJJJJohHHHHHHHooooo.", ".....ojJJJJjohhhHHHHoZcScco.", "....ojJJJJJJoohhhhHoSSccScco", "...ojJJJJJJJJJoooooSSScScco.", "...ojjjjjjjjjjjojjooCCCCCo..", "...ojJJJjJJJJo..GGgo........", "..oJJJJooJJJJo..gGGX........", ".oJJJJo..oJJJJo....X........", ".oSSo....osso.......X..MM...", "oWWo......ovvo.......XMmnMM.", "oKKKo.....oKKKo......MmnmnmM", ".ooo.......ooo........MMMMM." ] ],
  scoop37_sm: [ 7, 18, [ 15, -6 ], [ "............ooooo.........", "..........ooHHHHwoo.......", ".........oHHHHHHHHwo......", "........ohHHHHHHHHHHo.....", "........ohHHHHHHHooooo....", ".......ohhhHHHHoZcScco....", ".......oohhhhHoSSccScco...", "......ojJoooooSSScScco....", "....ojJJJjjooooCCCCCo.....", "...ojJJJJJjjjjj...........", "...ojjjjjjjjjGGGGGX...MM..", "...ojJJJJJJJJggGgG.XMMnmMM", "...ojJJJjJJJJo.....MmnmnmM", "..oJJJJooJJJJo......MMMMM.", ".oJJJJo..oJJJJo...........", ".oSSo....osso.............", "oWWo......ovvo............", "oKKKo.....oKKKo...........", ".ooo.......ooo............" ] ],
  scoop37_sl: [ 7, 20, [ 15, -14 ], [ ".........ooooo...........", ".......ooHHHHwoo.........", "......oHHHHHHHHwo........", ".....ohHHHHHHHHHHo....MM.", ".....ohHHHHHHHooooo..MnmM", "....ohhhHHHHoZcScco.MmnmM", "....oohhhhHoSSccSccMnmnM.", "......oooooSSScSccMmnmM..", "......oJooooCCCCCoXMMM...", ".....ojJJJJJjJJo.X.......", "....ojJJJjjjjjo..X.......", "...ojJJJJJjjjjj.X........", "...ojjjjjjjjjGGGG........", "...ojJJJJJJJJgGgG........", "...ojJJJjJJJJo...........", "..oJJJJooJJJJo...........", ".oJJJJo..oJJJJo..........", ".oSSo....osso............", "oWWo......ovvo...........", "oKKKo.....oKKKo..........", ".ooo.......ooo..........." ] ],
  scoop37_pr: [ 7, 15, [ 20, -2 ], [ ".................ooooo.........", "...............ooHHHHwoo.......", "..............oHHHHHHHHwo......", ".......ooooooohHHHHHHHHHHo.....", "......oJJJJJJohHHHHHHHooooo....", ".....ojJJJJjohhhHHHHoZcScco....", "....ojJJJJJJoohhhhHoSSccScco...", "...ojJJJJJJJJJoooooSSScScco....", "...ojjjjjjjjjjjojjooCCCCCo.....", "...ojJJJjJJJJo..GGgo...........", "..oJJJJooJJJJo..gGGX...........", ".oJJJJo..oJJJJo....XX..........", ".oSSo....osso........XX...MM...", "oWWo......ovvo.........XXMmnMM.", "oKKKo.....oKKKo.........MmnmnmM", ".ooo.......ooo...........MMMMM." ] ],
  scoop37_pm: [ 7, 18, [ 19, -7 ], [ "............ooooo.............", "..........ooHHHHwoo...........", ".........oHHHHHHHHwo..........", "........ohHHHHHHHHHHo.........", "........ohHHHHHHHooooo........", ".......ohhhHHHHoZcScco........", ".......oohhhhHoSSccScco.......", "......ojJoooooSSScScco........", "....ojJJJjjooooCCCCCo.........", "...ojJJJJJjjjjj..........MM...", "...ojjjjjjjjjGGGGGXXX..MMnmMM.", "...ojJJJJJJJJggGgG...XXMmnmnmM", "...ojJJJjJJJJo.........MMMMMM.", "..oJJJJooJJJJo................", ".oJJJJo..oJJJJo...............", ".oSSo....osso.................", "oWWo......ovvo................", "oKKKo.....oKKKo...............", ".ooo.......ooo................" ] ],
  scoop37_pl: [ 7, 20, [ 18, -15 ], [ ".........ooooo..............", ".......ooHHHHwoo............", "......oHHHHHHHHwo...........", ".....ohHHHHHHHHHHo.......MM.", ".....ohHHHHHHHooooo.....MnmM", "....ohhhHHHHoZcScco....MmnmM", "....oohhhhHoSSccScco..MnmnM.", "......oooooSSScScco..MmnmM..", "......oJooooCCCCCo..XMMM....", ".....ojJJJJJjJJo...X........", "....ojJJJjjjjjo...X.........", "...ojJJJJJjjjjj..X..........", "...ojjjjjjjjjGGGG...........", "...ojJJJJJJJJgGgG...........", "...ojJJJjJJJJo..............", "..oJJJJooJJJJo..............", ".oJJJJo..oJJJJo.............", ".oSSo....osso...............", "oWWo......ovvo..............", "oKKKo.....oKKKo.............", ".ooo.......ooo.............." ] ],
  scoop37_gr: [ 7, 15, [ 18, -2 ], [ ".................ooooo........", "...............ooHHHHwoo......", "..............oHHHHHHHHwo.....", ".......ooooooohHHHHHHHHHHo....", "......oJJJJJJohHHHHHHHooooo...", ".....ojJJJJjohhhHHHHoZcScco...", "....ojJJJJJJoohhhhHoSSccScco..", "...ojJJJJJJJJJoooooSSScScco...", "...ojjjjjjjjjjjojjooCCCCCo....", "...ojJJJjJJJJo..GGgo..........", "..oJJJJooJJJJo..gGGX..........", ".oJJJJo..oJJJJo....X..........", ".oSSo....osso.......X.MMMMM...", "oWWo......ovvo.......MnmnmnmM.", "oKKKo.....oKKKo.....MmnmnmnmnM", ".ooo.......ooo.......MMMMMMMM." ] ],
  scoop37_gm: [ 7, 18, [ 16, -8 ], [ "............ooooo............", "..........ooHHHHwoo..........", ".........oHHHHHHHHwo.........", "........ohHHHHHHHHHHo........", "........ohHHHHHHHooooo.......", ".......ohhhHHHHoZcScco.......", ".......oohhhhHoSSccScco......", "......ojJoooooSSScScco.......", "....ojJJJjjooooCCCCCoMMMMM...", "...ojJJJJJjjjjj.....MnmnmnmM.", "...ojjjjjjjjjGGGGGXMmnmnmnmnM", "...ojJJJJJJJJggGgG.MnmnmnmnM.", "...ojJJJjJJJJo......MMMMMMM..", "..oJJJJooJJJJo...............", ".oJJJJo..oJJJJo..............", ".oSSo....osso................", "oWWo......ovvo...............", "oKKKo.....oKKKo..............", ".ooo.......ooo..............." ] ],
  scoop37_gl: [ 7, 20, [ 16, -14 ], [ ".........ooooo..............", ".......ooHHHHwoo............", "......oHHHHHHHHwo......MMM..", ".....ohHHHHHHHHHHo....MnmnM.", ".....ohHHHHHHHooooo..MnmnmnM", "....ohhhHHHHoZcScco.MmnmnmnM", "....oohhhhHoSSccSccMnmnmnmM.", "......oooooSSScSccoMmnmnmM..", "......oJooooCCCCCoXMMMMM....", ".....ojJJJJJjJJo.X..........", "....ojJJJjjjjjo..X..........", "...ojJJJJJjjjjj.X...........", "...ojjjjjjjjjGGGG...........", "...ojJJJJJJJJgGgG...........", "...ojJJJjJJJJo..............", "..oJJJJooJJJJo..............", ".oJJJJo..oJJJJo.............", ".oSSo....osso...............", "oWWo......ovvo..............", "oKKKo.....oKKKo.............", ".ooo.......ooo.............." ] ]
 };
 let added = false;
 function addFrames() {
  if (added) return;
  added = true;
  for (const k in ADD) if (!RL12.FR[k]) RL12.FR[k] = ADD[k];
 }
 const T_REACH = .05, T_MID = .12, DUR = .23, REACH = 15, NEAR_LOOSE = 26;
 function on() {
  return !window.__rl_no37s && !window.__rl_v124gb && typeof HAS12 !== 'undefined' && HAS12;
 }
 const S = {
  G: null,
  t: 0,
  mt: null,
  prevH: null,
  looseT: -9,
  lx: 0,
  ly: 0,
  sc: null,
  reach: new Set,
  pos: new WeakMap,
  scr: new WeakMap,
  n: 0,
  scoops: 0,
  reachFrames: 0,
  scoopFrames: 0,
  ballFrames: 0,
  log: []
 };
 function holderOf(G) {
  const b = G.ball;
  if (!b) return null;
  if (b.state === 'held') {
   if (screen === 'live' || screen === 'netview') return G.carrier || null;
   if (screen === 'defense') return G.dcar || null;
   return null;
  }
  if (b.state === 'clear') {
   if (screen === 'defense' && G.dclear && G.dclear.holder) return G.dclear.holder;
   if (screen === 'netview') {
    if (G.carrier) return G.carrier;
    let best = null, bd = 16;
    for (const p of G.players) {
     if (p.far || p.down > 0) continue;
     const d = Math.hypot(p.x - b.x, p.y + 10 - b.y);
     if (d < bd) {
      bd = d;
      best = p;
     }
    }
    return best;
   }
  }
  return null;
 }
 function kindOf(p) {
  const gk = typeof isKeeper === 'function' ? isKeeper(p) : p.team === 'G' || p.team === 'G2';
  if (gk) return 'g';
  return typeof isPole === 'function' && isPole(p) || p.far && p.role === 'D' ? 'p' : 's';
 }
 function reset(G) {
  S.G = G;
  S.prevH = null;
  S.looseT = -9;
  S.sc = null;
  S.reach.clear();
  S.pos = new WeakMap;
 }
 function update() {
  const G = typeof game !== 'undefined' ? game : null;
  if (!G || !G.ball || !G.players) {
   if (S.G) reset(null);
   return;
  }
  if (G !== S.G) reset(G);
  const mt = menuT;
  if (S.mt == null) S.mt = mt;
  const d = mt - S.mt;
  S.mt = mt;
  if (d === 0) return;
  if (!paused && d > 0 && d < .5) S.t += d;
  const b = G.ball, loose = b.state === 'loose' || b.state === 'chase', H = holderOf(G);
  if (H && S.prevH == null && S.t - S.looseT < .5 && Math.hypot(H.x - S.lx, H.y - S.ly) < NEAR_LOOSE && !(H.down > 0)) {
   S.sc = {
    p: H,
    t0: S.t,
    k: kindOf(H)
   };
   S.scoops++;
   if (S.log.length < 50) S.log.push({
    t: +S.t.toFixed(2),
    scr: screen,
    team: H.team,
    role: H.role || '',
    k: S.sc.k,
    x: Math.round(H.x),
    y: Math.round(H.y)
   });
  }
  if (S.sc && (S.sc.p !== H || S.t - S.sc.t0 >= DUR || S.sc.p.down > 0)) S.sc = null;
  S.prevH = H;
  if (loose) {
   S.looseT = S.t;
   S.lx = b.x;
   S.ly = b.y;
  }
  S.reach.clear();
  if (b.state === 'loose' && (b.z || 0) <= 6) {
   const best = {};
   for (const p of G.players) {
    const q = S.pos.get(p);
    S.pos.set(p, [ p.x, p.y ]);
    if (p.down > 0 || p.far || p.stun > 0 || p.dropT > G.t) continue;
    const dd = Math.hypot(p.x + 2 - b.x, (p.y - b.y) * 1.2);
    if (dd > REACH) continue;
    const toward = q && (p.x - q[0]) * (b.x - p.x) + (p.y - q[1]) * (b.y - p.y) > 0;
    if (!toward && dd > 9) continue;
    const k = p.team;
    if (!best[k] || dd < best[k][1]) best[k] = [ p, dd ];
   }
   for (const k in best) S.reach.add(best[k][0]);
  } else for (const p of G.players) S.pos.set(p, [ p.x, p.y ]);
 }
 function scoopOn(p) {
  return !!(S.sc && S.sc.p === p && S.t - S.sc.t0 < DUR);
 }
 const BAD = /shoot|hit|check|save|fall|down|getup|chirp|outlet|bench|coach|lobby/, OK = /idle|run|cradle|move|^d8/;
 let cur = null;
 function pick(p, n, faceRight) {
  if (p.down > 0 || p.dodgeA || p.shot20 || p.lvl || BAD.test(n) || !OK.test(n)) return null;
  if (scoopOn(p)) {
   addFrames();
   const el = S.t - S.sc.t0;
   return 'scoop37_' + S.sc.k + (el < T_REACH ? 'r' : el < T_MID ? 'm' : 'l');
  }
  if (S.reach.has(p)) {
   const b = game.ball;
   if ((b.x - p.x) * (faceRight ? 1 : -1) > -2) {
    addFrames();
    return 'scoop37_' + kindOf(p) + 'r';
   }
  }
  return null;
 }
 const fr0 = frame12;
 frame12 = function(p) {
  const n = fr0.apply(this, arguments);
  if (!cur || cur.p !== p || !on()) return n;
  try {
   const m = pick(p, n, cur.f);
   if (m) {
    if (m.endsWith('r') && !scoopOn(p)) S.reachFrames++; else S.scoopFrames++;
   }
   return m || n;
  } catch (e) {
   return n;
  }
 };
 const dp0 = drawPlayer12;
 drawPlayer12 = function(p, kit, faceRight) {
  const c0 = cur;
  cur = {
   p: p,
   f: faceRight
  };
  if (window.__s37pos && typeof g !== 'undefined') {
   try {
    const m = g.getTransform();
    S.scr.set(p, [ m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f ]);
   } catch (e) {}
  }
  try {
   return dp0.apply(this, arguments);
  } finally {
   cur = c0;
  }
 };
 if (typeof drawPlayers === 'function') {
  const dps0 = drawPlayers;
  drawPlayers = function() {
   if (on()) {
    try {
     update();
    } catch (e) {}
   } else if (S.G) reset(null);
   return dps0.apply(this, arguments);
  };
 }
 if (typeof drawDodger === 'function') {
  const dd0 = drawDodger;
  drawDodger = function(p, kit, faceRight) {
   if (on() && p && (scoopOn(p) || S.reach.has(p)) && typeof drawPlayer === 'function') {
    let n = null;
    try {
     n = pick(p, fr0(p), faceRight);
    } catch (e) {
     n = null;
    }
    if (n) {
     drawPlayer(p, kit, faceRight);
     return;
    }
   }
   return dd0.apply(this, arguments);
  };
 }
 if (typeof drawBallNow === 'function') {
  const db0 = drawBallNow;
  drawBallNow = function() {
   if (!on() || !S.sc) return db0.apply(this, arguments);
   const G = game, b = G && G.ball, p = S.sc.p;
   if (!b || !scoopOn(p) || holderOf(G) !== p || !/^scoop37_/.test(p._fr || '') || typeof ballVis12 !== 'function') return db0.apply(this, arguments);
   const pk = RL12.pocket(p._fr, p._fright);
   if (!pk) return db0.apply(this, arguments);
   ballVis12(b);
   const sm = typeof sm211on === 'function' && sm211on(), x = Math.round(p.x + (sm ? p._sox || 0 : 0)) + pk[0] * PSC, y = Math.round(p.y + (sm ? p._soy || 0 : 0)) + pk[1] * PSC;
   bv12.x = x - b.x;
   bv12.y = y - b.y;
   if (typeof bj287 !== 'undefined') {
    bj287.x = 0;
    bj287.y = 0;
   }
   rect(b.x - 1, b.y + 2, 2, 1, 'rgba(0,0,0,.3)');
   ballDot(Math.round(x) - 1, Math.round(y) - 1);
   S.ballFrames++;
   if (window.__s37probe) window.__s37probe.push({
    fr: p._fr,
    right: p._fright,
    px: Math.round(p.x),
    py: Math.round(p.y),
    bx: Math.round(x),
    by: Math.round(y)
   });
  };
 }
 window.V37S = {
  on: on,
  S: S,
  frames: ADD,
  addFrames: addFrames,
  kindOf: kindOf,
  holderOf: holderOf
 };
})();
