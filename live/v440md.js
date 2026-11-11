(function() {
 'use strict';
 if (window.__rl_v440md_loaded) return;
 window.__rl_v440md_loaded = 1;
 const W0 = window;
 const off = () => !!W0.__rl_no440md || !!W0.__rl_v124gb;
 const G_ = () => {
  try {
   return game;
  } catch (e) {
   return null;
  }
 };
 const scr = () => {
  try {
   return screen;
  } catch (e) {
   return '';
  }
 };
 const liveScr = () => {
  const s = scr();
  return s === 'live' || s === 'defense';
 };
 const okG = G => !!G && !!G.players && !!G.lu && !G.tutorial && !G.online && !(G.meta && G.meta.online) && !G.brave && !G.practice && !G.over && G.farMode !== 'fo';
 const LOG = {
  restored: [],
  owed: [],
  penShort: 0,
  net: 0,
  unweld: 0,
  noId: 0,
  err: [],
  shortFrames: {
   U: 0,
   C: 0
  }
 };
 const er = (e, w) => {
  try {
   if (LOG.err.length < 20) LOG.err.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
  } catch (x) {}
 };
 const isGk = p => !!(p.gk || p.team === 'G' || p.team === 'G2' || p.role === 'G');
 const nearT = s => s === 'U' ? 'O' : 'D';
 function count(G, s) {
  const t = nearT(s), near = G.players.filter(p => p.team === t && !isGk(p)), far = ((s === 'U' ? G.farU : G.farC) || []).filter(f => !isGk(f));
  return {
   near: near,
   far: far,
   n: near.length + far.length
  };
 }
 function want(G, s) {
  return 9 - (G.pen && G.pen.side === s && !G.penPending ? 1 : 0);
 }
 const idOf = x => x && x.pl ? String(x.pl.id) : null;
 function outIds(G) {
  const o = new Set;
  for (const L of [ G.ejected, G.ns17, G.concOut, G.gout16 ]) for (const x of L || []) o.add(String(x && x.id != null ? x.id : x));
  return o;
 }
 function freeId(G, s, prefer, roleK) {
  const si = s === 'U' ? 0 : 1, lu = G.lu[si] || {}, out = outIds(G), on = new Set;
  for (const p of G.players) {
   const id = idOf(p);
   if (id) on.add(id);
  }
  for (const f of (G.farU || []).concat(G.farC || [])) {
   const id = idOf(f);
   if (id) on.add(id);
  }
  if (G.pen && G.pen.side === s && !G.penPending && G.pen.who) on.add(String(G.pen.who.id));
  const ok = id => {
   if (id == null) return false;
   id = String(id);
   if (on.has(id) || out.has(id)) return false;
   const P = PP(id);
   if (!P || P.pos === 'G') return false;
   try {
    if (G.mode === 'season' && typeof injOf === 'function' && injOf(id)) return false;
   } catch (e) {}
   return true;
  };
  if (prefer && ok(prefer)) return String(prefer);
  const order = roleK === 'A' ? 'AMD' : roleK === 'D' ? 'DMA' : 'MDA', c = [];
  for (const k of order) for (const id of lu[k] || []) c.push(id);
  try {
   for (const sl of SLOTS) {
    const id = slotGet(lu, sl[0]);
    if (typeof id === 'string') c.push(id);
   }
  } catch (e) {}
  for (const id of c) if (ok(id)) return String(id);
  try {
   for (const id of teamRosterIds(si === 0 ? G.user : G.opp, G.mode === 'season' ? 'season' : 'real') || []) if (ok(id)) return String(id);
  } catch (e) {}
  return null;
 }
 const BOX = s => [ MIDX + (s === 'U' ? -20 : 20), FT + 12 ];
 function freeIdx(G, t) {
  const u = new Set(G.players.filter(p => p.team === t).map(p => p.idx));
  for (let i = 0; i < 6; i++) if (!u.has(i)) return i;
  return null;
 }
 function insertNear(G, p) {
  if (p.team === 'O') {
   const k = G.players.findIndex(q => q.team === 'G2');
   G.players.splice(k >= 0 ? k : G.players.length, 0, p);
  } else {
   const k = G.players.findIndex(q => q.team === 'G');
   G.players.splice(k >= 0 ? k : G.players.length, 0, p);
  }
 }
 function restore(G, s, why, prefer) {
  const live = scr() === 'live', t = nearT(s), c = count(G, s);
  const attacking = s === 'U' ? live : !live;
  const roleK = attacking ? c.near.filter(p => (p.rr || '') === 'A').length < 3 ? 'A' : 'M' : 'D';
  const id = freeId(G, s, prefer, roleK);
  if (!id) {
   LOG.noId++;
   return false;
  }
  const pl = PP(id), bx = BOX(s), idx = freeIdx(G, t);
  let p = null, where = '';
  if (idx != null && c.near.length < 6) {
   if (attacking) {
    p = mkPlayer(t, idx, live ? Math.max(bx[0], MIDX + 6) : Math.min(bx[0], MIDX - 6), bx[1]);
    p.pl = pl;
    p.rr = idx <= 2 ? 'M' : 'A';
    if (live) {
     const sp = curSpots();
     p.home = (sp[idx] || sp[0]).slice();
     p.tx = p.home[0];
     p.ty = p.home[1];
     p.wander = .3;
    } else {
     const sp = (SETS[G.cpuSet] || SETS[SET_NAMES[0]])[idx] || [ FL - MIDX - 40, CY ];
     p.home = [ FL - sp[0], sp[1] ];
     p.wt = rnd(.2, 1);
     p.tgt = p.home.slice();
    }
    const d = G.players.find(q => q.team === (t === 'O' ? 'D' : 'O') && !isGk(q) && (!q.mark || !G.players.includes(q.mark)));
    if (d) {
     d.mark = p;
     p.mark0 = d;
    }
   } else {
    p = mkPlayer(t, idx, live ? Math.max(bx[0], MIDX + 4) : Math.min(bx[0], MIDX - 4), bx[1]);
    p.pl = pl;
    p.rr = idx <= 2 ? 'M' : 'D';
    p.react = .3;
    const opp = t === 'O' ? 'D' : 'O';
    const a = G.players.find(q => q.team === opp && !isGk(q) && !G.players.some(d => d.team === t && d.mark === q)) || G.players.filter(q => q.team === opp && !isGk(q)).sort((u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y))[0] || null;
    p.mark = a;
    if (a) a.mark0 = p; else p.hole = true;
   }
   insertNear(G, p);
   where = 'near';
  } else {
   const K = s === 'U' ? 'farU' : 'farC', L = G[K] = G[K] || [];
   const role = attacking ? 'D' : 'A';
   const back = s === 'U' ? live ? MIDX - 55 : MIDX - 55 : live ? MIDX + 55 : MIDX + 55;
   const ride = s === 'U' ? MIDX + 44 : MIDX - 44;
   const rx = role === 'D' ? back : ride;
   p = farMk(s, role, role === 'D' ? s === 'U' ? MIDX - 6 : MIDX + 6 : s === 'U' ? MIDX + 6 : MIDX - 6, bx[1], pl);
   p.rest = [ rx, CY - 44 + 44 * (L.length % 3) ];
   L.push(p);
   try {
    farPair(G);
   } catch (e) {}
   where = 'far';
  }
  const rec = {
   t: +(+G.t || 0).toFixed(2),
   q: G.q,
   side: s,
   id: id,
   why: why,
   where: where,
   scr: scr(),
   had: c.n,
   want: want(G, s),
   pen: G.pen ? G.pen.side : null
  };
  LOG.restored.push(rec);
  if (LOG.restored.length > 200) LOG.restored.shift();
  try {
   console.warn('[440md] restored', JSON.stringify(rec));
  } catch (e) {}
  return true;
 }
 const PO0 = W0.penaltyOver;
 if (typeof PO0 === 'function') W0.penaltyOver = function(why) {
  const G = G_();
  let pen = null, b = null;
  try {
   if (!off() && okG(G) && G.pen) {
    pen = {
     side: G.pen.side,
     who: G.pen.who ? String(G.pen.who.id) : null
    };
    b = count(G, pen.side).n;
   }
  } catch (e) {
   er(e, 'po0');
  }
  const r = PO0.apply(this, arguments);
  try {
   if (pen && game === G && !G.pen) {
    const a = count(G, pen.side).n;
    if (a <= b) {
     (G.md440 = G.md440 || {
      owed: []
     }).owed.push({
      side: pen.side,
      who: pen.who,
      why: why,
      scr: scr(),
      t: G.t
     });
     LOG.owed.push({
      side: pen.side,
      who: pen.who,
      why: why,
      scr: scr(),
      q: G.q
     });
     if (why !== 'goal') LOG.penShort++;
    }
   }
  } catch (e) {
   er(e, 'po');
  }
  return r;
 };
 const shortT = {
  U: 0,
  C: 0
 };
 function tick(G) {
  if (!liveScr() || !G.ball || G.ball.state === 'dead' || G.penPending) {
   shortT.U = shortT.C = 0;
   return;
  }
  const M = G.md440 = G.md440 || {
   owed: []
  };
  for (const s of [ 'U', 'C' ]) {
   const c = count(G, s), w = want(G, s);
   if (c.n >= w) {
    shortT[s] = 0;
    M.owed = M.owed.filter(o => o.side !== s);
    continue;
   }
   LOG.shortFrames[s]++;
   const ow = M.owed.find(o => o.side === s);
   if (ow) {
    M.owed.splice(M.owed.indexOf(ow), 1);
    if (restore(G, s, 'penaltyOver:' + ow.why + '@' + ow.scr, ow.who)) {
     shortT[s] = 0;
     continue;
    }
   }
   shortT[s]++;
   if (shortT[s] >= 12) {
    shortT[s] = 0;
    if (restore(G, s, 'net', null)) LOG.net++;
   }
  }
 }
 const weld = {
  t: 0
 };
 function weldTick(G, dt) {
  if (scr() !== 'defense' || !G.ball || G.ball.state !== 'held' || !G.dcar || !G.dctl || !G.players.includes(G.dctl)) {
   weld.t = 0;
   return;
  }
  const me = G.dctl, c = G.dcar, d = Math.hypot(me.x - c.x, me.y - c.y);
  if (d >= 2.5) {
   weld.t = 0;
   return;
  }
  weld.t += dt;
  if (weld.t < 1) return;
  weld.t = 0;
  const ux = d > .01 ? (me.x - c.x) / d : -1, uy = d > .01 ? (me.y - c.y) / d : 0;
  me.x = Math.max(DEND + 4, Math.min(ENDX - 6, c.x + ux * 7));
  me.y = Math.max(FT + 12, Math.min(FB - 2, c.y + uy * 7));
  me.tx = me.x;
  me.ty = me.y;
  me.kb = null;
  me.stun = 0;
  if (me.down > 0) me.down = 0;
  if (G.dHold) G.dHold = null;
  LOG.unweld++;
  try {
   console.warn('[440md] unweld', JSON.stringify({
    t: +(+G.t || 0).toFixed(2),
    id: idOf(me),
    car: idOf(c)
   }));
  } catch (e) {}
 }
 const ST0 = W0.step;
 if (typeof ST0 === 'function') W0.step = function(dt) {
  const r = ST0.apply(this, arguments);
  try {
   const G = G_();
   if (!off() && okG(G)) {
    tick(G);
    weldTick(G, dt || 0);
   }
  } catch (e) {
   er(e, 'tick');
  }
  return r;
 };
 W0.V440MD = {
  LOG: LOG,
  on: () => !off(),
  counts: () => {
   const G = G_();
   return G && G.players ? {
    U: count(G, 'U').n,
    C: count(G, 'C').n,
    wantU: want(G, 'U'),
    wantC: want(G, 'C')
   } : null;
  }
 };
})();
