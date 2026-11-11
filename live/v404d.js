/* v404d.js - V40.0.4 custom DEFENSE plays (MAN/ZONE + slide AJ/CREASE) and custom RIDES (MAN/ZONE) in games.
   Kill switch: window.__rl_no404d (set it and everything behaves exactly as before). */
(function () {
 'use strict';
 if (typeof dCustomOn !== 'function' || typeof hotPick !== 'function') return;
 const off = () => !!window.__rl_no404d;
 const O = {
  dCustomOn: dCustomOn,
  hotPick: hotPick,
  slideBest: slideBest,
  startDefense: startDefense,
  rideXTick: typeof rideXTick === 'function' ? rideXTick : null,
  zoneTargets: zoneTargets
 };
 const hyp = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
 function online() {
  const N = window.RLNET, G = game;
  return !!(N && N.inGame) || !!(G && (G.online || (G.meta && G.meta.online)));
 }
 function dPlay() {
  try { return dCustomPlay(); } catch (e) { return null; }
 }
 const isMan = p => !!p && p.dk === 'man';
 const slideOf = p => p && p.slide === 'crease' ? 'crease' : 'adj';
 const userD = () => typeof screen !== 'undefined' && (screen === 'defense' || screen === 'cpu');

 /* ---------- online: a MAN custom D plays as plain man (tell the other side 'man') ---------- */
 function hookNet() {
  const N = window.RLNET, L = N && N.link;
  if (!L || L.__d404 || typeof L.send !== 'function') return;
  const s0 = L.send;
  L.__d404 = true;
  L.send = function (m) {
   try {
    if (m && m.t === 'ds26' && m.d === 'custom' && !off() && isMan(dPlay())) m = Object.assign({}, m, { d: 'man' });
   } catch (e) {}
   return s0.apply(this, arguments.length > 1 ? [ m ].concat([].slice.call(arguments, 1)) : [ m ]);
  };
 }

 /* ---------- MAN custom D: line up in the drawn shape, then everyone takes a man ---------- */
 function state() {
  const G = game;
  const key = screen === 'cpu' ? G.cpu : G.d404k;
  if (!G.d404 || G.d404.key !== key) G.d404 = { key: key, shape: true, inAt: null, slides: [] };
  return G.d404;
 }
 function clockOf(G) {
  return screen === 'cpu' ? (G.cpu && G.cpu.t) || 0 : G.dLive || 0;
 }
 function assignMen(G) {
  if (G.pen) return 0;
  const def = G.players.filter(p => p.team === 'O' && !p.r26 && !(p.down > 0));
  const atk = G.players.filter(p => p.team === 'D' && !p.r26);
  if (def.length !== atk.length || def.length < 4) return 0;
  const pairs = [];
  for (const d of def) for (const a of atk) pairs.push([ hyp(d.x, d.y, a.x, a.y), d, a ]);
  pairs.sort((x, y) => x[0] - y[0]);
  const ud = new Set, ua = new Set;
  let n = 0;
  for (const [, d, a] of pairs) {
   if (ud.has(d) || ua.has(a)) continue;
   ud.add(d); ua.add(a);
   d.mark = a; a.mark0 = d; n++;
  }
  G.dRot = null;
  return n;
 }
 function shapeNow() {
  const G = game;
  if (!G || !userD()) return false;
  const S = state(), t = clockOf(G);
  if (!S.shape) return false;
  const b = G.ball;
  let c = null;
  if (screen === 'cpu') c = G.cpu && G.cpu.holder; else c = G.dcar && b && b.state === 'held' ? G.dcar : null;
  if (S.inAt == null && ((c && c.x < RL_L) || (b && b.x < RL_L && b.state !== 'clear'))) S.inAt = t;
  const why = t > 7 ? 'time' : G.dBeat > 0 ? 'dodge' : S.inAt != null && t - S.inAt >= 1.2 ? 'set' : b && (b.state === 'shot' || b.state === 'loose') ? b.state : screen === 'cpu' && t > 1.6 ? 'sim' : '';
  const done = !!why;
  if (done) {
   S.shape = false;
   S.men = assignMen(G);
   S.manAt = +t.toFixed(2);
   G.d404log = G.d404log || [];
   G.d404log.push({ ev: 'man', why: why, t: S.manAt, men: S.men });
  }
  return !done;
 }
 window.dCustomOn = function () {
  const r = O.dCustomOn.apply(this, arguments);
  if (off() || !r) return r;
  const p = dPlay();
  if (!isMan(p)) return r;
  if (online()) { hookNet(); return false; }
  return shapeNow();
 };
 window.startDefense = function () {
  const G = game;
  if (G && !off()) { G.d404k = (G.d404k || 0) + 1; G.d404 = null; }
  return O.startDefense.apply(this, arguments);
 };

 /* ---------- drawn shape (MAN or ZONE play): each defender flows to his NEAREST drawn spot (old plays: by index, as before) ---------- */
 window.zoneTargets = function (list, kind, bx, by, left) {
  const z = O.zoneTargets.apply(this, arguments);
  if (off() || kind !== '__dc' || !left || !userD() || !z || !list) return z;
  const p = dPlay(), G = game;
  if (!p || (p.dk !== 'man' && p.dk !== 'zone')) return z;
  const key = screen === 'cpu' ? G.cpu : G.d404k, ph = screen === 'cpu' ? (G.cpu && G.cpu.t) || 0 : G.dLive || 0;
  const tk = ph < 2.4 ? Math.floor(ph / .4) : 'set';
  let A = G.d404z;
  if (!A || A.key !== key || A.tk !== tk || A.pl !== p.id || A.list.length !== list.length || A.list.some((d, i) => d !== list[i])) {
   const n = list.length, m = z.pts.length;
   let perm = list.map(() => -1);
   if (n <= 7 && m >= n) {
    /* best total (squared) distance: nobody crosses the field to a far spot */
    const c2 = list.map(d => z.pts.map(q => (d.x - q[0]) ** 2 + (d.y - q[1]) ** 2));
    let best = 1e18;
    const cur = [], used = new Array(m).fill(false);
    const go = (i, acc) => {
     if (acc >= best) return;
     if (i === n) { best = acc; perm = cur.slice(); return; }
     for (let j = 0; j < m; j++) if (!used[j]) { used[j] = true; cur[i] = j; go(i + 1, acc + c2[i][j]); used[j] = false; }
    };
    go(0, 0);
   } else {
    const pairs = [], uj = new Set;
    list.forEach((d, i) => z.pts.forEach((q, j) => pairs.push([ hyp(d.x, d.y, q[0], q[1]), i, j ])));
    pairs.sort((a, q) => a[0] - q[0]);
    for (const [, i, j] of pairs) if (perm[i] < 0 && !uj.has(j)) { perm[i] = j; uj.add(j); }
   }
   A = G.d404z = { key: key, tk: tk, pl: p.id, list: list.slice(), perm: perm, at: list.map(d => [ Math.round(d.x), Math.round(d.y) ]), pts: z.pts.map(q => [ Math.round(q[0]), Math.round(q[1]) ]) };
  }
  const pts = A.perm.map((j, i) => z.pts[j >= 0 ? j : i]);
  return { pts: pts, onBall: z.onBall >= 0 ? A.perm.indexOf(z.onBall) : -1 };
 };

 /* ---------- slide package: who is the hot slider ---------- */
 function slider404(def, c, excl) {
  const G = game, p = dPlay();
  if (off() || !G || !userD() || !isMan(p) || online() || !c || c.team !== 'D') return undefined;
  if (G.d404 && G.d404.shape) return undefined;
  const ok = d => d && d.team === 'O' && d !== excl && d.mark !== c && d !== c.mark0 && !(d.stun > 0) && !(d.down > 0) && !d.busy && !d.r26;
  const cand = def.filter(ok);
  if (!cand.length) return undefined;
  let best = null, bd = 1e9;
  if (slideOf(p) === 'crease') {
   for (const d of cand) { const k = hyp(d.x, d.y, DGX, CY); if (k < bd) { bd = k; best = d; } }
  } else {
   const adj = G.players.filter(q => q.team === 'D' && q !== c && !q.r26).sort((a, q) => hyp(a.x, a.y, c.x, c.y) - hyp(q.x, q.y, c.x, c.y)).slice(0, 2);
   for (const d of cand) if (d.mark && adj.includes(d.mark)) { const k = hyp(d.x, d.y, c.x, c.y); if (k < bd) { bd = k; best = d; } }
   if (!best) for (const d of cand) { const k = hyp(d.x, d.y, c.x, c.y); if (k < bd) { bd = k; best = d; } }
  }
  return best;
 }
 window.hotPick = function (def, c, adj, prev, excl) {
  const s = slider404(def, c, excl);
  if (s !== undefined) return s;
  return O.hotPick.apply(this, arguments);
 };
 window.slideBest = function (def, c, adj, excl) {
  const s = slider404(def, c, excl);
  if (s !== undefined) return s;
  return O.slideBest.apply(this, arguments);
 };

 /* ---------- custom RIDES: MAN / ZONE ---------- */
 const ZR = 70, MR = 150;
 function clearers(G) {
  return G.players.filter(p => (p.team === 'D' || p.team === 'G') && !(p.down > 0)).concat((G.farC || []).filter(f => !(f.down > 0)));
 }
 const legal = (role, x) => role === 'A' ? x >= MIDX + 6 : role === 'D' || role === 'G' ? x <= MIDX - 6 : x >= MIDX - 30;
 function faceSpot(m, b, role) {
  const dx = b.x - m.x, dy = b.y - m.y, L = Math.hypot(dx, dy) || 1, fo = (typeof RIDE !== 'undefined' && RIDE.faceOff) || 6;
  return f10Spot([ m.x + dx / L * fo, m.y + dy / L * fo ], role);
 }
 if (O.rideXTick) window.rideXTick = function () {
  const m = O.rideXTick.apply(this, arguments);
  const G = game;
  if (off() || !m || !G || online()) return m;
  const pl = typeof rideCustom === 'function' ? rideCustom() : null;
  if (!pl || (pl.dk !== 'man' && pl.dk !== 'zone') || !G.rideXA) return m;
  const b = G.ball, ten = myTen(), cl = clearers(G);
  const rs = ten.filter(t => m.has(t.o)).map(t => ({ o: t.o, role: t.role, i: G.rideXA.map.get(t.o) })).filter(r => r.i != null && pl.start[r.i]);
  rs.forEach(r => { r.spot = f10Spot(pl.start[r.i], r.role); });
  const R = G.ride404 = G.ride404 && G.ride404.pl === pl.id && G.ride404.sig === G.rideXA.sig ? G.ride404 : { pl: pl.id, sig: G.rideXA.sig, kind: pl.dk, own: new Map };
  R.kind = pl.dk;
  if (pl.dk === 'man') {
   /* man-to-man: a rider keeps his man; only riders without one (start, man gone, or man crossed to where the rider can't go) pick the free clearer closest to their drawn spot */
   const keep = new Map, ux = new Set;
   for (const r of rs) { const x = R.own.get(r.o); if (x && cl.includes(x) && legal(r.role, x.x) && !ux.has(x)) { keep.set(r.o, x); ux.add(x); } }
   const free = rs.filter(r => !keep.has(r.o));
   if (free.length) {
    const pairs = [];
    for (const r of free) for (const x of cl) if (!ux.has(x) && legal(r.role, x.x) && hyp(r.spot[0], r.spot[1], x.x, x.y) <= MR) pairs.push([ hyp(r.spot[0], r.spot[1], x.x, x.y), r, x ]);
    pairs.sort((a, q) => a[0] - q[0]);
    for (const [, r, x] of pairs) {
     if (keep.has(r.o) || ux.has(x)) continue;
     keep.set(r.o, x); ux.add(x);
     if (G.ride404log) G.ride404log.push({ t: +(G.t || 0).toFixed(2), r: r.i, man: cl.indexOf(x) });
    }
   }
   R.own = keep;
   for (const r of rs) { const x = R.own.get(r.o); if (x) m.set(r.o, faceSpot(x, b, r.role)); }
  } else {
   const cellOf = x => {
    let best = null, bd = 1e9;
    for (const r of rs) { const k = hyp(r.spot[0], r.spot[1], x.x, x.y); if (k < bd) { bd = k; best = r; } }
    return bd <= ZR ? best : null;
   };
   const inZone = new Map;
   for (const x of cl) { const r = cellOf(x); if (r) { if (!inZone.has(r.o)) inZone.set(r.o, []); inZone.get(r.o).push(x); } }
   const own = new Map;
   for (const r of rs) {
    const L = inZone.get(r.o) || [], prev = R.own.get(r.o);
    let x = prev && L.includes(prev) ? prev : null;
    if (!x && L.length) x = L.slice().sort((a, q) => (hyp(a.x, a.y, b.x, b.y) < 4 ? -1e4 : 0) + hyp(a.x, a.y, r.spot[0], r.spot[1]) - ((hyp(q.x, q.y, b.x, b.y) < 4 ? -1e4 : 0) + hyp(q.x, q.y, r.spot[0], r.spot[1])))[0];
    if (x) { own.set(r.o, x); m.set(r.o, faceSpot(x, b, r.role)); }
   }
   if (G.ride404log) for (const [r, x] of own) if (R.own.get(r) !== x) G.ride404log.push({ t: +(G.t || 0).toFixed(2), r: (rs.find(q => q.o === r) || {}).i, pick: cl.indexOf(x) });
   R.own = own;
  }
  G.ride404F = (G.ride404F || 0) + 1;
  return m;
 };


 /* ---------- 2 slide always (+ a 3 slide some of the time for good teams), CPU D and the user's AI D ----------
    kill switch: __rl_no404d or __rl_no404s */
 const offS = () => off() || !!window.__rl_no404s;
 const lerp = (a, b, t) => a + (b - a) * t;
 const cl01 = v => Math.max(0, Math.min(1, v));
 function dStr(list) {
  let n = 0, s = 0;
  for (const d of list) if (d && d.pl) { try { const o = ovrOf(d.pl); if (isFinite(o)) { s += o; n++; } } catch (e) {} }
  return n ? cl01((s / n - 66) / 16) : .5;
 }
 const p3Of = st => st < .3 ? 0 : st < .6 ? lerp(.02, .3, (st - .3) / .3) : lerp(.3, .68, (st - .6) / .4);
 const okD = (d, c, excl) => d && d !== excl && d.mark !== c && !(d.down > 0) && !(d.stun > 0) && !d.gk && !d.r26 && !d.busy;
 function nearestTo(list, m, skip) {
  let best = null, bd = 1e9;
  for (const d of list) if (!skip.has(d)) { const k = hyp(d.x, d.y, m.x, m.y); if (k < bd) { bd = k; best = d; } }
  return best;
 }
 function guardSpot(m, gx) {
  const dx = gx - m.x, dy = CY - m.y, L = Math.hypot(dx, dy) || 1;
  return [ m.x + dx / L * 7, m.y + dy / L * 7 ];
 }
 function sideCtx(G, scr) {
  if (scr === 'live') return { slider: G.slide, rk: 'rot', def: G.players.filter(p => p.team === 'D'), c: G.carrier, gx: GX, excl: null, side: 'C' };
  if (scr === 'defense') return { slider: G.dSlide, rk: 'dRot', def: G.players.filter(p => p.team === 'O'), c: G.dcar, gx: DGX, excl: G.dctl, side: 'U' };
  return null;
 }
 function slidePre(G, scr) {
  const st = G.s404;
  if (st && st.three && st.scr === scr) st.pre = [ st.three.x, st.three.y, st.three.anim ];
 }
 function slidePost(G, scr, dt) {
  const X = sideCtx(G, scr);
  if (!X) return;
  let st = G.s404;
  if (!X.slider || !X.c || !G.players.includes(X.slider)) { if (st) G.s404 = null; return; }
  if (!st || st.slider !== X.slider || st.scr !== scr) {
   const str = dStr(X.def), left = markOf(X.slider) || X.slider.mark || null;
   st = G.s404 = { scr: scr, side: X.side, slider: X.slider, str: str, t: 0, two: null, m2: null, three: null, m3: null, forced: false };
   let R = G[X.rk];
   if (!(R && R.d && R.m && G.players.includes(R.d))) {
    if (left && G.players.includes(left)) {
     const pick = nearestTo(X.def.filter(d => okD(d, X.c, X.excl) && d !== X.slider), left, new Set);
     if (pick) { R = G[X.rk] = { d: pick, m: left }; st.forced = true; }
    }
   }
   if (R && R.d && R.m) {
    st.two = R.d; st.m2 = R.m;
    R.d.react = Math.max(0, lerp(.42, .04, str) + rnd(-.03, .03));
    if (st.two === X.excl) st.two = null;
   }
   st.p3 = p3Of(str);
   if (st.two && Math.random() < st.p3) {
    const m3 = markOf(st.two);
    if (m3 && m3 !== X.c) {
     const skip = new Set([ X.slider, st.two ]);
     const three = nearestTo(X.def.filter(d => okD(d, X.c, X.excl) && d.mark !== m3), m3, skip);
     if (three && three !== X.excl) { st.three = three; st.m3 = m3; st.d3 = lerp(.5, .14, str); }
    }
   }
   G.s404log = G.s404log || [];
   G.s404log.push({ side: X.side, str: +str.toFixed(2), two: st.two ? X.def.indexOf(st.two) : -1, forced: st.forced, three: st.three ? X.def.indexOf(st.three) : -1, p3: +st.p3.toFixed(2), t: +(G.t || 0).toFixed(2) });
   return;
  }
  st.t += dt;
  const R = G[X.rk];
  if (st.two && R && R.d === st.two && G.players.includes(st.m2) && !(st.two.react > 0) && !(st.two.down > 0)) {
   const q = guardSpot(st.m2, X.gx);
   if (hyp(st.two.x, st.two.y, q[0], q[1]) > 3) moveTo(st.two, q[0], q[1], PACE.dBall * .4 * st.str, dt);
   if (st.arr2 == null && hyp(st.two.x, st.two.y, st.m2.x, st.m2.y) < 13) st.arr2 = +st.t.toFixed(2);
  }
  if (st.two && st.m2) { const g = Math.round(hyp(st.two.x, st.two.y, st.m2.x, st.m2.y)); if (st.g0 == null) st.g0 = g; if (st.g6 == null && st.t >= .6) st.g6 = g; if (st.g12 == null && st.t >= 1.2) st.g12 = g; }
  if (st.three) {
   const th = st.three;
   if (!G.players.includes(th) || !G.players.includes(st.m3) || th.down > 0 || th === (X.side === 'U' ? G.dctl : null)) { st.three = null; return; }
   if (st.pre) { th.x = st.pre[0]; th.y = st.pre[1]; th.anim = st.pre[2]; st.pre = null; }
   if (st.t >= st.d3) {
    const q = guardSpot(st.m3, X.gx);
    moveTo(th, q[0], q[1], PACE.dBall * lerp(.9, 1.1, st.str), dt);
    if (st.arr3 == null && hyp(th.x, th.y, st.m3.x, st.m3.y) < 13) st.arr3 = +st.t.toFixed(2);
   }
  }
  if (G.s404log && G.s404log.length) { const L = G.s404log[G.s404log.length - 1]; L.arr2 = st.arr2; L.arr3 = st.arr3; L.g0 = st.g0; L.g6 = st.g6; L.g12 = st.g12; }
 }
 for (const [nm, scr] of [ [ 'updateLive', 'live' ], [ 'updateDefense', 'defense' ] ]) {
  const f0 = window[nm];
  if (typeof f0 !== 'function') continue;
  window[nm] = function (dt) {
   const G = game;
   const on = !offS() && G && !G.tutorial && !G.practice && !online() && G.players;
   if (on) try { slidePre(G, scr); } catch (e) {}
   const r = f0.apply(this, arguments);
   if (on && screen === scr && game === G) try { slidePost(G, scr, dt || 0); } catch (e) { console.warn(e); }
   return r;
  };
 }

 /* ---------- timeout panel labels ---------- */
 if (typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.timeout) {
  const rt0 = PANEL_RENDER.timeout;
  PANEL_RENDER.timeout = function () {
   let h = rt0.apply(this, arguments);
   if (off() || typeof h !== 'string') return h;
   try {
    const G = game, p = G && G.dset === 'custom' ? dPlay() : null;
    if (p && (p.dk === 'man' || p.dk === 'zone')) {
     const t = p.dk === 'zone' ? 'ZONE - EVERYONE HOLDS THE SHAPE YOU DREW, THE CLOSEST GUY PLAYS THE BALL' : slideOf(p) === 'crease' ? 'MAN - SLIDE CREASE - LINE UP IN YOUR SHAPE, THEN EVERYONE TAKES A MAN, THE CREASE GUY SLIDES' : 'MAN - SLIDE AJ - LINE UP IN YOUR SHAPE, THEN EVERYONE TAKES A MAN, THE ADJACENT GUY SLIDES';
     h = h.replace('YOUR SET - EVERYONE HOLDS THE SPOT YOU DREW, THE CLOSEST GUY PLAYS THE BALL', t);
    }
    const rp = typeof rideCustom === 'function' ? rideCustom() : null;
    if (rp && (rp.dk === 'man' || rp.dk === 'zone')) h = h.replace('YOUR RIDE - EVERYONE TAKES THE SPOT YOU DREW (NOBODY GOES OFFSIDE)', rp.dk === 'man' ? 'MAN RIDE - EVERYONE PICKS UP THE GUY CLOSEST TO HIS SPOT (NOBODY GOES OFFSIDE)' : 'ZONE RIDE - HOLD YOUR ZONE, TAKE WHOEVER COMES IN, PASS HIM TO THE NEXT ZONE');
   } catch (e) {}
   return h;
  };
 }
 window.V404D = { on: () => !off(), slider: slider404 };
})();
