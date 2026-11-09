(function() {
 'use strict';
 const off = () => !!(window.__rl_no42pd || window.__rl_v124gb);
 const need = [ 'openPlaymaker', 'drawPlaymaker', 'pmDown', 'pmMove', 'pmUp', 'pmTick', 'pmSetCat', 'pmSaveAsk' ];
 if (need.some(n => typeof window[n] !== 'function')) {
  window.PD42 = {
   on: () => false
  };
  return;
 }
 const CATS = [ 'OFFENSE', 'MAN-UP', 'END LINE', 'CLEAR', 'RIDES', 'D' ];
 const CLRP = () => catOf() === 'CLEAR' && !!(window.V420C && window.V420C.pm && window.V420C.pm()), SHP = () => catOf() === 'D' || catOf() === 'RIDES' || catOf() === 'CLEAR' && !CLRP(), SHAPE = d => !!d && (d.mode === 'sets' || SHP()), DK_LBL = d => catOf() === 'CLEAR' ? 'CLEAR SHAPE' : catOf() === 'RIDES' ? d.dk === 'zone' ? 'ZONE RIDE' : 'MAN RIDE' : d.dk === 'zone' ? 'ZONE' : 'MAN - SLIDE ' + (d.slide === 'crease' ? 'CREASE' : 'AJ'), FULL = c => typeof pmFull === 'function' && pmFull(c), NOBALL = c => c === 'RIDES' || c === 'D', catOf = () => pmCat(PM && PM.play), spdOf = () => FULL(catOf()) ? SPD * 1.5 : SPD;
 if (typeof window.pmGhosts === 'function' && !window.pmGhosts.mu42) {
  const G0 = window.pmGhosts;
  window.pmGhosts = function(pl, pos) {
   if (off() || pmCat(pl) !== 'MAN-UP' || typeof PM !== 'undefined' && PM && PM.ghost === 'ZONE' || !pos || !pos.length) return G0.apply(this, arguments);
   const st = pl.start && pl.start.length === pos.length ? pl.start : pos, dg = q => Math.hypot(q[0] - GX, q[1] - CY);
   let top = 0;
   st.forEach((q, i) => {
    if (dg(q) > dg(st[top]) + .5 || Math.abs(dg(q) - dg(st[top])) <= .5 && Math.abs(q[1] - CY) < Math.abs(st[top][1] - CY)) top = i;
   });
   const out = ZONES['BOX + 1'].slice(0, 4).map(([dx, dy]) => [ GX - dx, CY + dy ]), q = pos[top], vx = GX - q[0], vy = CY - q[1], L = Math.hypot(vx, vy) || 1;
   out.push([ q[0] + vx / L * 8, q[1] + vy / L * 8 ]);
   out.push([ GX - 5, CY ]);
   return out;
  };
  window.pmGhosts.mu42 = 1;
 }
 const H7 = () => !window.__rl_no427pm && window.PM427 || null; // V42.7 hooks (v427pm.js): subs on the field in PLAY + PREVIEW
const IDLE_END = 1.5, HOLD = .35, SPD = (typeof PACE !== 'undefined' ? PACE.run : 22) * 1.05, PASS_SPD = 170, SAMPLE = .1, MAX_STAGE_T = 20, MAX_PLAY_T = 30, MAX_STAGES = 6, REJOIN = 1.3;
 const STAGE_COL = [ '#ffffff', '#8fe3f0', '#ff9a4a', '#c08cff', '#7dff7a', '#ff8ad8' ];
 const LOG = {
  ev: []
 };
 const lg = o => {
  LOG.ev.push(o);
  if (LOG.ev.length > 200) LOG.ev.shift();
 };
 const r2 = v => Math.round(v * 100) / 100, r1 = v => Math.round(v * 10) / 10;
 const D = () => typeof PM !== 'undefined' && PM && PM.pd42 || null;
 const eligible = (origin, play, cat) => !off() && origin !== 'tutorial' && CATS.includes(cat || 'OFFENSE');
 function fresh(pl) {
  return {
   v: 1,
   phase: 'set',
   stage: 1,
   stages: [ {} ],
   order: [ [] ],
   car0: null,
   sel: null,
   rec: null,
   live: null,
   play: null,
   pv: null,
   joy: null,
   msg: '',
   flash: 0,
   anim: {},
   last: {}
  };
 }
 function attach(pl) {
  if (!PM) return;
  const d = fresh(pl);
  if (pl && pl.pd42 && Array.isArray(pl.pd42.stages)) {
   const s = pl.pd42;
   d.stages = JSON.parse(JSON.stringify(s.stages));
   d.order = d.stages.map(st => Object.keys(st).map(Number));
   d.car0 = s.car0 != null ? s.car0 : pl.car;
   d.play = s.play ? JSON.parse(JSON.stringify(s.play)) : null;
   d.stage = Math.max(1, d.stages.length);
   d.phase = d.play ? 'done' : d.car0 != null ? 'ball' : 'stage';
   d.msg = 'EDITING ' + (pl.name || 'PLAY');
   d.flash = 1.4;
  } else if (pl && Array.isArray(pl.steps) && (pl.steps.length || pl.car != null)) convertOld(d, pl);
  PM.pd42 = d;
  PM.preview = null;
  if (SHP()) {
   Object.assign(d, {
    phase: 'set',
    stages: [ {} ],
    order: [ [] ],
    stage: 1,
    play: null,
    car0: null,
    dk: pl ? pl.dk || 'zone' : 'man',
    slide: pl && pl.slide === 'crease' ? 'crease' : 'adj'
   });
   d.msg = pl ? 'EDITING ' + (pl.name || catOf()) : catOf() + ': DRAG YOUR GUYS INTO A SHAPE, PICK MAN OR ZONE';
   d.flash = 1.6;
   return;
  }
  if (NOBALL(catOf()) && d.phase === 'done' && !d.play) simPlay(d);
  if (CLRP() && d.car0 == null) d.car0 = pl && pl.car != null && pl.car >= 0 && pl.start && pl.start[pl.car] ? pl.car : 0;
  if (catOf() === 'END LINE' && d.phase === 'set') elCorner(d);
 }
 function convertOld(d, pl) {
  const pos = pl.start.map(q => q.slice()), byPg = {}, spd = spdOf();
  for (const s of pl.steps || []) if ((s.t === 'move' || s.t === 'pick') && pos[s.p]) {
   const k = Math.max(1, Math.min(MAX_STAGES, s.pg || 1));
   (byPg[k] = byPg[k] || []).push(s);
  }
  d.stages = [];
  d.order = [];
  for (const k of Object.keys(byPg).map(Number).sort((a, b) => a - b)) {
   const st = {}, o = [];
   for (const s of byPg[k]) {
    const i = s.p;
    if (!st[i]) {
     st[i] = [ [ 0, r1(pos[i][0]), r1(pos[i][1]) ] ];
     o.push(i);
    }
    const path = st[i], e = pend(path), dur = Math.max(.2, Math.hypot(s.x - e[1], s.y - e[2]) / spd), n = Math.max(1, Math.ceil(dur / SAMPLE));
    for (let j = 1; j <= n; j++) path.push([ r2(e[0] + dur * j / n), r1(e[1] + (s.x - e[1]) * j / n), r1(e[2] + (s.y - e[2]) * j / n) ]);
    pos[i] = [ s.x, s.y ];
   }
   for (const i in st) if (st[i].length < 2) delete st[i];
   d.stages.push(st);
   d.order.push(o.filter(i => st[i]));
  }
  if (!d.stages.length) {
   d.stages = [ {} ];
   d.order = [ [] ];
  }
  d.stage = d.stages.length;
  d.car0 = !NOBALL(pmCat(pl)) && pl.car != null && pl.car >= 0 && pl.start[pl.car] ? pl.car : null;
  const moves = d.stages.some(st => Object.keys(st).length);
  if (NOBALL(pmCat(pl))) d.phase = moves ? 'done' : 'set'; else d.phase = d.car0 != null ? 'ball' : moves ? 'stage' : 'set';
  d.msg = 'OLD PLAY: ITS RUNS ARE STAGES NOW' + (NOBALL(pmCat(pl)) || d.car0 == null ? '' : ' - START PLAY TO DO THE PASSES');
  d.flash = 2.2;
 }
 function simPlay(d) {
  const T = Math.max(.2, startsOf(d).total), N = Math.round(T / SAMPLE), frames = [];
  for (let j = 0; j <= N; j++) {
   const t = Math.min(T, j * SAMPLE);
   frames.push([ r2(t), PM.play.start.map((q, i) => {
    const p = stagePos(d, i, t);
    return [ r1(p[0]), r1(p[1]) ];
   }), null, null ]);
  }
  d.play = {
   T: r2(T),
   frames: frames,
   passes: [],
   car0: null
  };
  d.car0 = null;
  d.live = null;
  d.sel = null;
  d.phase = 'done';
  compile(d);
 }
 function noBallDone(d) {
  finishRec(d);
  while (d.stages.length > 1 && !Object.keys(d.stages[d.stages.length - 1]).length) {
   d.stages.pop();
   d.order.pop();
  }
  d.stage = Math.max(1, d.stages.length);
  simPlay(d);
  d.msg = 'DONE - PREVIEW TO WATCH IT, OR SAVE';
  d.flash = 1.4;
 }
 const CORNERS = () => [ [ ENDX - 6, FT + 13 ], [ ENDX - 6, FB - 4 ] ];
 function elCorner(d, only) {
  const st = PM.play.start;
  let best = -1, bd = 1e9, bc = null;
  st.forEach((q, i) => {
   if (only != null && i !== only) return;
   for (const c of CORNERS()) {
    const dd = Math.hypot(q[0] - c[0], q[1] - c[1]);
    if (dd < bd) {
     bd = dd;
     best = i;
     bc = c;
    }
   }
  });
  if (best < 0) return -1;
  st[best] = bc.slice();
  d.elCar = best;
  return best;
 }
 function clampC(x, y) {
  const c = catOf();
  if (FULL(c)) return [ clamp(x, 10, ENDX - 6), clamp(y, FT + 12, FB - 4) ];
  if (c === 'D') return [ clamp(x, MIDX + 10, ENDX - 6), clamp(y, FT + 12, FB - 4) ];
  return clampF(x, y);
 }
 function clampF(x, y) {
  x = clamp(x, MIDX + 10, ENDX - 6);
  y = clamp(y, FT + 12, FB - 4);
  const cx = x - GX, cy = y - CY, cd = Math.hypot(cx, cy);
  if (cd < CREASE + 4) {
   x = GX + cx / (cd || 1) * (CREASE + 4);
   y = CY + cy / (cd || 1) * (CREASE + 4);
  }
  return [ x, y ];
 }
 function at(path, t) {
  if (!path || !path.length) return null;
  if (t <= path[0][0]) return [ path[0][1], path[0][2] ];
  const L = path[path.length - 1];
  if (t >= L[0]) return [ L[1], L[2] ];
  let lo = 0, hi = path.length - 1;
  while (hi - lo > 1) {
   const m = lo + hi >> 1;
   if (path[m][0] <= t) lo = m; else hi = m;
  }
  const a = path[lo], b = path[hi], f = (t - a[0]) / (b[0] - a[0] || 1);
  return [ a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f ];
 }
 const pend = path => path[path.length - 1];
 function stageDur(st) {
  let m = 0;
  for (const k in st) {
   const p = st[k];
   if (p && p.length) m = Math.max(m, pend(p)[0]);
  }
  return m;
 }
 function usedStages(d) {
  const n = d.stages.length;
  let k = n;
  while (k > 0 && !Object.keys(d.stages[k - 1] || {}).length) k--;
  return k;
 }
 function startsOf(d) {
  const S = [];
  let s = 0;
  for (let k = 0; k < usedStages(d); k++) {
   S.push(s);
   s += stageDur(d.stages[k]);
  }
  return {
   S: S,
   total: s
  };
 }
 function posBefore(d, k) {
  const pos = PM.play.start.map(q => q.slice());
  for (let j = 0; j < k - 1 && j < d.stages.length; j++) for (const i in d.stages[j]) {
   const p = d.stages[j][i];
   if (p && p.length) pos[i] = [ pend(p)[1], pend(p)[2] ];
  }
  return pos;
 }
 function stagePos(d, i, T) {
  let pos = PM.play.start[i].slice(), s = 0;
  const n = usedStages(d);
  for (let k = 0; k < n; k++) {
   const st = d.stages[k], dur = stageDur(st), p = st[i];
   if (p && p.length) {
    if (T < s) return pos;
    pos = at(p, T - s);
   }
   s += dur;
  }
  return pos;
 }
 function endOf(d, i) {
  let s = 0, e = null;
  const n = usedStages(d);
  for (let k = 0; k < n; k++) {
   const st = d.stages[k], p = st[i];
   if (p && p.length) e = s + pend(p)[0];
   s += stageDur(st);
  }
  return e;
 }
 function rejoinTo(d, i, p, T, e) {
  for (let t = T; t <= e + 1e-6; t += .1) {
   const q = stagePos(d, i, t);
   if (Math.hypot(q[0] - p[0], q[1] - p[1]) <= spdOf() * REJOIN * (t - T) + 1) return q;
  }
  return stagePos(d, i, e + 1);
 }
 function pieceAt(w, pos, skip) {
  return pmPieceAt(w.x, w.y, pos, skip);
 }
 function rdp(pts, eps) {
  if (pts.length < 3) return pts.slice();
  const a = pts[0], b = pts[pts.length - 1], dx = b[1] - a[1], dy = b[2] - a[2], L = Math.hypot(dx, dy);
  let best = -1, bd = 0;
  for (let i = 1; i < pts.length - 1; i++) {
   const p = pts[i];
   const dd = L < 1e-6 ? Math.hypot(p[1] - a[1], p[2] - a[2]) : Math.abs(dy * p[1] - dx * p[2] + b[1] * a[2] - b[2] * a[1]) / L;
   if (dd > bd) {
    bd = dd;
    best = i;
   }
  }
  if (bd <= eps) return [ a, b ];
  return rdp(pts.slice(0, best + 1), eps).slice(0, -1).concat(rdp(pts.slice(best), eps));
 }
 function selectGuy(d, i) {
  finishRec(d);
  d.sel = i;
  d.msg = pmLbl(i) + ': MOVE HIM WITH THE STICK (LEFT THUMB)';
  d.flash = 1.2;
  try {
   SFX.catch();
  } catch (e) {}
  lg({
   ev: 'sel',
   stage: d.stage,
   i: i
  });
 }
 function startRec(d) {
  const i = d.sel, had = d.stages[d.stage - 1][i];
  if (had && had.length > 1) {
   const e = pend(had);
   d.rec = {
    p: i,
    t: e[0],
    path: had.map(q => q.slice()),
    x: e[1],
    y: e[2],
    lastS: e[0],
    lastMove: e[0]
   };
   return;
  }
  const p0 = posBefore(d, d.stage)[i];
  d.rec = {
   p: i,
   t: 0,
   path: [ [ 0, r1(p0[0]), r1(p0[1]) ] ],
   x: p0[0],
   y: p0[1],
   lastS: 0,
   lastMove: 0
  };
 }
 function finishRec(d) {
  const R = d.rec;
  if (!R) return false;
  d.rec = null;
  let path = R.path;
  while (path.length > 1 && path[path.length - 1][0] > R.lastMove + 1e-6) path.pop();
  if (pend(path)[0] < R.lastMove) path.push([ r2(R.lastMove), r1(R.x), r1(R.y) ]);
  const moved = path.some(q => Math.hypot(q[1] - path[0][1], q[2] - path[0][2]) > 2);
  if (!moved || path.length < 2) {
   lg({
    ev: 'rec-drop',
    i: R.p
   });
   return false;
  }
  const st = d.stages[d.stage - 1];
  st[R.p] = path;
  const o = d.order[d.stage - 1];
  const k = o.indexOf(R.p);
  if (k >= 0) o.splice(k, 1);
  o.push(R.p);
  d.play = null;
  lg({
   ev: 'rec',
   stage: d.stage,
   i: R.p,
   n: path.length,
   dur: pend(path)[0]
  });
  return true;
 }
 function joyVec(d) {
  const J = d.joy;
  return J && J.on ? {
   ux: J.ux,
   uy: J.uy,
   m: J.m
  } : null;
 }
 function tickStage(d, dt) {
  if (d.sel == null) return;
  const v = joyVec(d);
  if (!d.rec) {
   if (!v) return;
   startRec(d);
  }
  const R = d.rec;
  R.t += dt;
  if (v) {
   const s = spdOf() * v.m * dt, q = clampC(R.x + v.ux * s, R.y + v.uy * s);
   if (Math.hypot(q[0] - R.x, q[1] - R.y) > .01) {
    R.lastMove = R.t;
    d.anim[R.p] = (d.anim[R.p] || 0) + s;
   }
   R.x = q[0];
   R.y = q[1];
  }
  if (R.t - R.lastS >= SAMPLE - 1e-6 && R.lastMove === R.t) {
   R.path.push([ r2(R.t), r1(R.x), r1(R.y) ]);
   R.lastS = R.t;
  }
  if (!v && R.t - R.lastMove > IDLE_END) {
   finishRec(d);
   return;
  }
  if (R.t >= MAX_STAGE_T) {
   finishRec(d);
   d.sel = null;
   d.msg = 'STAGE ' + d.stage + ': ' + MAX_STAGE_T + ' SEC IS THE MOST FOR ONE GUY';
   d.flash = 1.5;
  }
 }
 function startPlay(d) {
  if (d.car0 == null) {
   d.msg = 'HOLD THE GUY WHO STARTS WITH THE BALL FIRST';
   d.flash = 1.2;
   try {
    SFX.bad();
   } catch (e) {}
   return;
  }
  d.phase = 'play';
  d.pv = null;
  d.play = null;
  d.sel = null;
  const pos = PM.play.start.map(q => q.slice());
  d.live = {
   T: 0,
   cd: 1.2,
   pos: pos,
   car: d.car0,
   had: {
    [d.car0]: 0
   },
   fly: null,
   passes: [],
   frames: [],
   lastF: -1,
   lastMove: 0,
   lastCatch: 0,
   lastJoy: -9,
   lastRun: 0,
   off: {},
   ff: false
  };
  try { H7() && H7().start(d); } catch (e) {}
  snap(d.live);
  lg({
   ev: 'play-start',
   car: d.car0
  });
 }
 function snap(L) {
  L.frames.push([ r2(L.T), L.pos.map(q => [ r1(q[0]), r1(q[1]) ]), L.car, L.fly ? [ r1(L.fly.x), r1(L.fly.y) ] : null ]);
  L.lastF = L.T;
 }
 function tickPlay(d, dt) {
  const L = d.live;
  if (!L) return;
  if (L.cd > 0) {
   L.cd -= dt;
   if (L.cd <= 0) {
    L.cd = 0;
    try {
     SFX.whistle ? SFX.whistle() : SFX.tap();
    } catch (e) {}
   }
   return;
  }
  L.T += dt;
  for (let i = 0; i < L.pos.length; i++) {
   const ctl = i === L.car, v = ctl && !L.ff ? joyVec(d) : null;
   if (v) {
    const s = spdOf() * v.m * dt, q = clampC(L.pos[i][0] + v.ux * s, L.pos[i][1] + v.uy * s);
    if (Math.hypot(q[0] - L.pos[i][0], q[1] - L.pos[i][1]) > .01) {
     L.lastMove = L.T;
     L.lastJoy = L.T;
     L.off[i] = 1;
     d.anim[i] = (d.anim[i] || 0) + s;
    }
    L.pos[i] = q;
    continue;
   }
   const e = endOf(d, i);
   if (e == null) continue;
   if (ctl && (L.T - L.lastJoy < .3 || L.T >= e)) continue;
   const tq = stagePos(d, i, L.T), p = L.pos[i];
   if (!L.off[i] || Math.hypot(tq[0] - p[0], tq[1] - p[1]) < .9) {
    L.off[i] = 0;
    d.anim[i] = (d.anim[i] || 0) + Math.hypot(tq[0] - p[0], tq[1] - p[1]);
    L.pos[i] = tq;
    continue;
   }
   const gq = rejoinTo(d, i, p, L.T, e), dx = gq[0] - p[0], dy = gq[1] - p[1], dd = Math.hypot(dx, dy), st = Math.min(dd, spdOf() * REJOIN * dt);
   if (dd > .01) {
    L.pos[i] = [ p[0] + dx / dd * st, p[1] + dy / dd * st ];
    d.anim[i] = (d.anim[i] || 0) + st;
    L.lastRun = L.T;
   }
  }
  try { H7() && H7().tick(d, L, dt); } catch (e) {}
  if (L.fly) {
   const F = L.fly, tp = L.pos[F.to], tx = tp[0] + BX, ty = tp[1] + BY, dx = tx - F.x, dy = ty - F.y, dd = Math.hypot(dx, dy), s = PASS_SPD * dt;
   if (dd <= s + 1) {
    L.car = F.to;
    L.had[F.to] = L.T;
    L.fly = null;
    L.lastCatch = L.T;
    L.lastJoy = -9;
    const ps = L.passes[L.passes.length - 1];
    if (ps) ps.t1 = r2(L.T);
    try {
     SFX.catch();
    } catch (e) {}
    d.msg = pmLbl(L.car) + ' HAS IT - YOU CONTROL HIM NOW';
    d.flash = 1.2;
   } else {
    F.x += dx / dd * s;
    F.y += dy / dd * s;
   }
  }
  if (L.T - L.lastF >= SAMPLE - 1e-6) snap(L);
  if (L.T >= MAX_PLAY_T && !L.ff) endPlay(d, 'max');
 }
 function passTo(d, i) {
  const L = d.live;
  if (!L || L.cd > 0) return;
  if (L.car < 0 || L.fly) return;
  try { if (H7() && i !== L.car && !H7().passOk(d, i)) return; } catch (e) {}
  if (i === L.car) {
   d.msg = 'HE HAS IT - MOVE HIM WITH THE STICK';
   d.flash = 1;
   return;
  }
  const a = L.pos[L.car];
  L.fly = {
   from: L.car,
   to: i,
   x: a[0] + BX,
   y: a[1] + BY
  };
  L.passes.push({
   t0: r2(L.T),
   from: L.car,
   to: i,
   t1: null
  });
  L.car = -1;
  try {
   SFX.pass();
  } catch (e) {}
  lg({
   ev: 'pass',
   to: i,
   T: r2(L.T)
  });
 }
 function endPlay(d, why) {
  const L = d.live;
  if (!L) return !!d.play;
  if (L.fly) {
   d.msg = 'WAIT FOR THE CATCH';
   d.flash = 1;
   return false;
  }
  if (L.cd > 0 || L.T < .2) {
   d.live = null;
   d.phase = 'ball';
   d.msg = 'START PLAY, THEN MOVE HIM';
   d.flash = 1;
   return false;
  }
  const {total: total} = startsOf(d);
  L.ff = true;
  const busy = () => (() => { try { return !!(H7() && H7().busy(d, L)); } catch (e) { return false; } })() || L.pos.some((q, i) => {
   const e = endOf(d, i);
   return e != null && L.off[i] && !(i === L.car && L.T >= e);
  });
  for (let n = 0; n < 1200 && L.T < MAX_PLAY_T && (L.T < total || busy()); n++) tickPlay(d, 1 / 30);
  L.ff = false;
  snap(L);
  const end = Math.min(L.T, Math.max(L.lastMove, L.lastCatch, L.lastRun, total) + .3);
  const frames = L.frames.filter(f => f[0] <= end + 1e-6);
  if (frames[frames.length - 1][0] < end) {
   const f = JSON.parse(JSON.stringify(L.frames[L.frames.length - 1]));
   f[0] = r2(end);
   frames.push(f);
  }
  d.play = {
   T: r2(end),
   frames: frames,
   passes: L.passes.slice(),
   car0: d.car0
  };
  try { H7() && H7().done(d, L); } catch (e) {}
  d.live = null;
  d.phase = 'done';
  lg({
   ev: 'play-end',
   why: why,
   T: d.play.T,
   passes: d.play.passes.length
  });
  compile(d);
  return true;
 }
 function compile(d) {
  const pl = PM.play, n = usedStages(d), {S: S, total: total} = startsOf(d), P = d.play;
  const pgAt = t => {
   if (!n) return 1;
   for (let k = 0; k < n; k++) if (t < S[k] + stageDur(d.stages[k]) - 1e-6) return k + 1;
   return n + 1;
  };
  const caught = {};
  if (P && d.car0 != null) {
   caught[d.car0] = 0;
   for (const ps of P.passes) if (ps.t1 != null && caught[ps.to] == null) caught[ps.to] = ps.t1;
  }
  const out = [];
  for (let k = 0; k < n; k++) for (const i0 of d.order[k] || Object.keys(d.stages[k]).map(Number)) {
   const i = +i0, path = d.stages[k][i];
   if (!path || caught[i] != null) continue;
   const c = rdp(path.map(q => [ S[k] + q[0], q[1], q[2] ]), 2.5);
   for (let j = 1; j < c.length; j++) out.push([ k + 1, c[j][0], {
    t: 'move',
    p: i,
    x: Math.round(c[j][1]),
    y: Math.round(c[j][2])
   } ]);
  }
  if (P) {
   const done = P.passes.filter(ps => ps.t1 != null);
   for (const ps of done) out.push([ pgAt(ps.t0), ps.t1 - 1e-4, {
    t: 'pass',
    from: ps.from,
    to: ps.to
   } ]);
   for (const c0 in caught) {
    const c = +c0, pts = P.frames.map(f => [ f[0], f[1][c][0], f[1][c][1] ]);
    if (pts.length < 2) continue;
    const cc = rdp(pts, 2.5);
    for (let j = 1; j < cc.length; j++) {
     if (Math.hypot(cc[j][1] - cc[j - 1][1], cc[j][2] - cc[j - 1][2]) <= 1) continue;
     let t = cc[j][0];
     for (const ps of done) if (ps.from === c && t > ps.t0 && t < ps.t1) t = ps.t1;
     out.push([ pgAt(t), t, {
      t: 'move',
      p: c,
      x: Math.round(cc[j][1]),
      y: Math.round(cc[j][2])
     } ]);
    }
   }
  }
  try { H7() && H7().strip(d, out); } catch (e) {}
  out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  pl.steps = out.map(([pg, t, s]) => {
   if (pg > 1) s.pg = pg;
   return s;
  });
  pl.car = NOBALL(pmCat(pl)) ? pl.steps.length ? -2 : null : d.car0;
  pl.pd42 = {
   v: 1,
   stages: JSON.parse(JSON.stringify(d.stages.slice(0, Math.max(1, n)))),
   car0: d.car0,
   play: P ? JSON.parse(JSON.stringify(P)) : null
  };
  return pl;
 }
 function pvAt(d, t) {
  const F = d.play.frames;
  let lo = 0, hi = F.length - 1;
  if (t <= F[0][0]) hi = 0; else if (t >= F[hi][0]) lo = hi; else while (hi - lo > 1) {
   const m = lo + hi >> 1;
   if (F[m][0] <= t) lo = m; else hi = m;
  }
  const a = F[lo], b = F[hi], f = hi === lo ? 0 : (t - a[0]) / (b[0] - a[0] || 1);
  const pos = a[1].map((q, i) => [ q[0] + (b[1][i][0] - q[0]) * f, q[1] + (b[1][i][1] - q[1]) * f ]);
  let ball = null;
  if (a[3]) {
   const c = b[3] || a[3];
   ball = [ a[3][0] + (c[0] - a[3][0]) * f, a[3][1] + (c[1] - a[3][1]) * f ];
  }
  return {
   pos: pos,
   car: a[2],
   ball: ball
  };
 }
 function preview(d) {
  if (d.phase === 'play') {
   if (!endPlay(d, 'preview')) return;
  }
  if (!d.play) {
   d.msg = 'START PLAY AND RUN IT FIRST';
   d.flash = 1.2;
   try {
    SFX.bad();
   } catch (e) {}
   return;
  }
  if (d.pv) {
   d.pv = null;
   return;
  }
  d.pv = {
   t: -.4
  };
  lg({
   ev: 'preview',
   T: d.play.T
  });
 }
 function save(d) {
  if (d.mode === 'sets') {
   screen = 'pmSave';
   panelDirty();
   return;
  }
  if (SHP()) {
   const pl = PM.play;
   pl.steps = [];
   pl.car = null;
   pl.dk = d.dk === 'zone' ? 'zone' : 'man';
   if (catOf() === 'CLEAR') delete pl.dk;
   if (pl.dk === 'man' && catOf() === 'D') pl.slide = d.slide === 'crease' ? 'crease' : 'adj'; else delete pl.slide;
   delete pl.pd42;
   screen = 'pmSave';
   panelDirty();
   return;
  }
  if (NOBALL(catOf()) && (d.phase === 'set' || d.phase === 'stage')) noBallDone(d);
  if (CLRP() && (d.phase === 'set' || d.phase === 'stage' || d.phase === 'ball')) { const c0 = d.car0 == null ? 0 : d.car0; noBallDone(d); d.car0 = c0; compile(d); }
  if (d.phase === 'play') {
   if (!endPlay(d, 'save')) return;
  }
  if (!d.play) {
   d.msg = d.car0 == null ? 'ADD BALL + START PLAY FIRST' : 'START PLAY AND RUN IT FIRST';
   d.flash = 1.4;
   try {
    SFX.bad();
   } catch (e) {}
   return;
  }
  d.pv = null;
  compile(d);
  screen = 'pmSave';
  panelDirty();
 }
 function undo(d) {
  d.pv = null;
  if (SHAPE(d)) {
   d.msg = 'DRAG A GUY TO MOVE HIM. CLEAR = START OVER';
   d.flash = 1.2;
   return;
  }
  if (d.phase === 'done' && NOBALL(catOf())) {
   d.play = null;
   d.phase = usedStages(d) ? 'stage' : 'set';
   d.msg = d.phase === 'stage' ? 'BACK TO STAGE ' + d.stage : 'BACK TO THE SET';
   d.flash = 1.2;
   return;
  }
  if (d.phase === 'play' || d.phase === 'done') {
   d.live = null;
   d.play = null;
   d.phase = 'ball';
   d.msg = 'BALL PART CLEARED - START PLAY AGAIN';
   d.flash = 1.2;
   return;
  }
  if (d.phase === 'ball') {
   if (d.car0 != null) {
    d.car0 = null;
    d.msg = 'HOLD THE GUY WHO STARTS WITH THE BALL';
   } else {
    d.phase = 'stage';
    d.msg = 'BACK TO STAGE ' + d.stage;
   }
   d.flash = 1.2;
   return;
  }
  if (d.phase === 'stage') {
   if (d.rec) {
    d.rec = null;
    d.msg = 'CANCELLED';
    d.flash = 1;
    return;
   }
   const o = d.order[d.stage - 1];
   if (o.length) {
    const i = o.pop();
    delete d.stages[d.stage - 1][i];
    d.msg = 'UNDO: ' + pmLbl(i) + ' STAGE ' + d.stage + ' RUN';
    d.flash = 1.2;
    d.play = null;
    return;
   }
   d.sel = null;
   if (d.stage > 1) {
    d.stages.pop();
    d.order.pop();
    d.stage--;
    d.msg = 'BACK TO STAGE ' + d.stage;
    d.flash = 1.2;
    return;
   }
   d.phase = 'set';
   d.msg = 'BACK TO THE SET';
   d.flash = 1.2;
   return;
  }
 }
 function reset(d) {
  const c = pmCat(PM.play);
  PM.play = {
   id: null,
   name: '',
   cat: c,
   start: pmStartFor(c),
   car: null,
   steps: []
  };
  PM.editId = null;
  PM.pd42 = fresh();
  if (d.mode) PM.pd42.mode = d.mode;
  PM.pd42.msg = 'CLEARED - SET UP YOUR GUYS';
  PM.pd42.flash = 1.2;
 }
 function goStage(d, k) {
  finishRec(d);
  if (k > 1 && !Object.keys(d.stages[k - 2] || {}).length) {
   d.msg = 'MOVE SOMEONE ON STAGE ' + (k - 1) + ' FIRST';
   d.flash = 1.2;
   try {
    SFX.bad();
   } catch (e) {}
   return;
  }
  if (k > MAX_STAGES) {
   d.msg = MAX_STAGES + ' STAGES IS THE MOST';
   d.flash = 1.2;
   return;
  }
  if (k === 1 && d.phase === 'set' && catOf() === 'END LINE' && d.elCar == null) elCorner(d);
  while (d.stages.length < k) {
   d.stages.push({});
   d.order.push([]);
  }
  d.phase = 'stage';
  d.stage = k;
  d.sel = null;
  d.msg = 'STAGE ' + k + (k > 1 ? ': THESE MOVES START AFTER STAGE ' + (k - 1) : '');
  d.flash = 1.4;
  try {
   SFX.tap();
  } catch (e) {}
 }
 function addBall(d) {
  finishRec(d);
  while (d.stages.length > 1 && !Object.keys(d.stages[d.stages.length - 1]).length) {
   d.stages.pop();
   d.order.pop();
  }
  d.stage = Math.max(1, d.stages.length);
  d.phase = 'ball';
  d.sel = null;
  d.msg = 'HOLD THE GUY WHO STARTS WITH THE BALL';
  d.flash = 1.4;
  if (catOf() === 'END LINE' && d.elCar != null && PM.play.start[d.elCar]) giveBall(d, d.elCar);
 }
 function down(pt) {
  const d = D();
  if (!d) return;
  const w = pmWorld(pt);
  pt.pd = null;
  if (d.pv) return;
  if (d.phase === 'set') {
   const i = pieceAt(w, PM.play.start);
   if (i >= 0 && catOf() === 'D' && pmRole(i) === 'G') {
    d.msg = 'THE GOALIE STAYS IN THE CAGE';
    d.flash = 1;
    return;
   }
   if (i >= 0) pt.pd = {
    k: 'drag',
    i: i,
    at: PM.play.start[i].slice()
   };
   return;
  }
  if (d.phase === 'stage') {
   const pos = shownPos(d), i = pieceAt(w, pos);
   if (i >= 0 && i !== d.sel) {
    pt.pd = {
     k: 'hold',
     i: i,
     t0: now()
    };
    return;
   }
   pt.pd = {
    k: 'joy'
   };
   joyStart(d, pt);
   return;
  }
  if (d.phase === 'ball') {
   const i = pieceAt(w, PM.play.start);
   if (i >= 0) pt.pd = {
    k: 'hold',
    i: i,
    t0: now()
   };
   return;
  }
  if (d.phase === 'play' && d.live) {
   const L = d.live, i = pieceAt(w, L.pos);
   if (i >= 0 && i !== L.car && L.car >= 0) {
    pt.pd = {
     k: 'tap',
     i: i,
     t0: now()
    };
    joyStart(d, pt, true);
    return;
   }
   pt.pd = {
    k: 'joy'
   };
   joyStart(d, pt);
   return;
  }
 }
 function joyStart(d, pt, soft) {
  if (d.joy && pointers.has(d.joy.id) && d.joy.id !== pt.id) return;
  d.joy = {
   id: pt.id,
   ox: pt.scx,
   oy: pt.scy,
   ux: 0,
   uy: 0,
   m: 0,
   on: false,
   dead: soft ? 16 : JOY_DEAD
  };
 }
 function move(pt) {
  const d = D();
  if (!d || !pt.pd) return;
  const P = pt.pd;
  if (P.k === 'drag') {
   const w = pmWorld(pt);
   P.at = pmClampSpot(w.x, w.y + 6, pmCat(PM.play));
   return;
  }
  if (P.k === 'hold' && pt.moved >= 9 && d.phase === 'stage') {
   pt.pd = {
    k: 'joy'
   };
   joyStart(d, pt);
  }
  const J = d.joy;
  if (!J || J.id !== pt.id) return;
  let vx = pt.cx - J.ox, vy = pt.cy - J.oy, dd = Math.hypot(vx, vy);
  if (dd > JOY_MAX) {
   J.ox = pt.cx - vx / dd * JOY_MAX;
   J.oy = pt.cy - vy / dd * JOY_MAX;
   vx = pt.cx - J.ox;
   vy = pt.cy - J.oy;
   dd = JOY_MAX;
  }
  if (dd < (J.on ? JOY_DEAD : J.dead)) {
   J.on = false;
   J.m = 0;
   return;
  }
  J.ux = vx / dd;
  J.uy = vy / dd;
  J.m = .3 + .7 * clamp((dd - JOY_DEAD) / (JOY_MAX - JOY_DEAD), 0, 1);
  J.on = true;
  if (pt.pd.k === 'tap') pt.pd.k = 'joy';
  if (d.phase === 'stage' && d.sel == null && !J.warned) {
   J.warned = true;
   d.msg = 'HOLD A GUY FIRST - THEN THE STICK MOVES HIM';
   d.flash = 1.4;
  }
 }
 function up(pt, cancel) {
  const d = D();
  if (!d) return;
  const P = pt.pd;
  pt.pd = null;
  if (d.joy && d.joy.id === pt.id) d.joy = null;
  if (!P || cancel) return;
  if (P.k === 'drag') {
   if (P.at) {
    PM.play.start[P.i] = P.at.slice();
    d.play = null;
    d.msg = pmLbl(P.i) + ' STARTS HERE';
    d.flash = .8;
    if (catOf() === 'END LINE' && d.mode !== 'sets') {
     const q = P.at, nearC = CORNERS().some(c => Math.hypot(q[0] - c[0], q[1] - c[1]) < 26);
     if (nearC) {
      elCorner(d, P.i);
      d.msg = pmLbl(P.i) + ' IN THE CORNER - HE STARTS WITH THE BALL';
     } else if (d.elCar === P.i) d.elCar = null;
    }
   }
   return;
  }
  if (P.k === 'hold' && !P.done && pt.moved < TAP_PX) {
   if (d.phase === 'stage') selectGuy(d, P.i); else if (d.phase === 'ball') giveBall(d, P.i);
   return;
  }
  if (P.k === 'tap' && pt.moved < TAP_PX && now() - P.t0 < .45) passTo(d, P.i);
 }
 function giveBall(d, i) {
  if (catOf() === 'END LINE' && d.elCar != null && i !== d.elCar) {
   d.msg = 'END LINE: THE GUY IN THE CORNER (' + pmLbl(d.elCar) + ') STARTS WITH IT, LIKE IN A GAME';
   d.flash = 1.6;
   return;
  }
  d.car0 = i;
  d.play = null;
  d.msg = pmLbl(i) + ' STARTS WITH THE BALL - START PLAY';
  d.flash = 1.6;
  try {
   SFX.catch();
  } catch (e) {}
  lg({
   ev: 'ball',
   i: i
  });
 }
 function tick(dt) {
  const d = D();
  if (!d) return;
  PM.t += dt;
  d.flash = Math.max(0, d.flash - dt);
  if (d.joy && !pointers.has(d.joy.id)) d.joy = null;
  for (const pt of pointers.values()) {
   const P = pt.pd;
   if (!P || P.k !== 'hold' || P.done) continue;
   if (now() - P.t0 >= HOLD && pt.moved < 9) {
    P.done = true;
    if (d.phase === 'stage') selectGuy(d, P.i); else if (d.phase === 'ball') giveBall(d, P.i);
   }
  }
  if (d.pv) {
   d.pv.t += dt;
   if (d.pv.t > d.play.T + 1.2) d.pv = null;
   return;
  }
  if (d.phase === 'stage') tickStage(d, dt); else if (d.phase === 'play') tickPlay(d, dt);
 }
 function shownPos(d) {
  const pos = posBefore(d, d.stage), R = d.rec;
  if (R) {
   const st = d.stages[d.stage - 1];
   for (const i in st) if (+i !== R.p) pos[i] = at(st[i], R.t);
   pos[R.p] = [ R.x, R.y ];
  }
  return pos;
 }
 function kitOf() {
  return game ? game.uk : {
   jersey: '#2cc4dc',
   trim: '#111111',
   helm: '#2cc4dc'
  };
 }
 function piece(x, y, i, kit) {
  const a = d0anim(i), p = {
   x: x,
   y: y,
   anim: a
  };
  drawPlayer(p, kit, true);
  drawStick(p, true, false);
  text(pmLbl(i), x, y - 27 < FT + 2 ? y + 6 : y - 27, 1, pmRole(i) === 'A' ? '#ffd6d6' : '#d6ffdc', 'center', '#000');
 }
 let curD = null;
 const d0anim = i => curD && curD.anim[i] || 0;
 function ballOn(q) {
  for (let a = 0; a < 6.28; a += .35) px(q[0] + Math.cos(a) * 8, q[1] + 1 + Math.sin(a) * 3, '#ffe14d');
  ballAt(q[0] + BX, q[1] + BY);
 }
 function ballAt(x, y) {
  rect(x - 2, y - 2, 5, 5, '#000');
  rect(x - 1, y - 1, 3, 3, '#ffe14d');
 }
 function dots(path, off, col, S) {
  for (let j = 0; j < path.length; j += 2) px(path[j][1], path[j][2] - 2, col);
  if (path.length) {
   const e = pend(path);
   rect(e[1] - 1, e[2] - 3, 3, 3, col);
  }
 }
 function draw() {
  const d = D();
  curD = d;
  const pl = PM.play, cat = pmCat(pl), kit = kitOf();
  rect(0, 0, W, H, '#0b0f14');
  g.save();
  const vw = pmView();
  if (vw) {
   g.translate(vw.ox, vw.oy);
   g.scale(vw.k, vw.k);
  } else g.translate(-Math.round(camX), 0);
  if (game && !vw) drawStadium();
  drawField();
  let pos, car = null, ball = null, holdI = -1, holdF = 0;
  for (const pt of pointers.values()) {
   const P = pt.pd;
   if (P && P.k === 'hold' && !P.done) {
    holdI = P.i;
    holdF = clamp((now() - P.t0 - .08) / (HOLD - .08), 0, 1);
   }
  }
  if (d.pv) {
   const S = pvAt(d, Math.max(0, d.pv.t));
   for (let i = 0; i < S.pos.length; i++) {
    const L0 = d.last[i];
    if (L0) d.anim[i] = (d.anim[i] || 0) + Math.hypot(S.pos[i][0] - L0[0], S.pos[i][1] - L0[1]);
   }
   d.last = S.pos.map(q => q.slice());
   pos = S.pos;
   car = S.car;
   ball = S.ball;
  } else if (d.phase === 'set') {
   pos = pl.start.map(q => q.slice());
   for (const pt of pointers.values()) if (pt.pd && pt.pd.k === 'drag' && pt.pd.at) pos[pt.pd.i] = pt.pd.at;
   if (cat === 'END LINE' && d.mode !== 'sets' && d.elCar != null) car = d.elCar;
   if (CLRP()) car = d.car0;
  } else if (d.phase === 'stage') {
   pos = shownPos(d);
   if (!d.rec) {
    for (let k = 0; k < d.stage; k++) for (const i in d.stages[k]) dots(d.stages[k][i], 0, k === d.stage - 1 ? STAGE_COL[k % 6] : 'rgba(255,255,255,.28)');
   } else for (const i in d.stages[d.stage - 1]) if (+i !== d.rec.p) dots(d.stages[d.stage - 1][i], 0, 'rgba(255,255,255,.35)');
   if (d.rec) dots(d.rec.path, 0, '#7dff7a');
   if (CLRP()) car = d.car0;
  } else if (d.phase === 'ball') {
   pos = pl.start.map(q => q.slice());
   car = d.car0;
   for (let k = 0; k < d.stages.length; k++) for (const i in d.stages[k]) dots(d.stages[k][i], 0, STAGE_COL[k % 6]);
  } else if (d.phase === 'play' && d.live) {
   const L = d.live;
   pos = L.pos;
   car = L.car;
   ball = L.fly ? [ L.fly.x, L.fly.y ] : null;
   for (let k = 0; k < d.stages.length; k++) for (const i in d.stages[k]) dots(d.stages[k][i], 0, 'rgba(255,255,255,.22)');
  } else if (d.phase === 'done' && d.play) {
   const F = d.play.frames, E = F[F.length - 1];
   pos = PM.play.start.map(q => q.slice());
   car = d.car0;
   for (let i = 0; i < pos.length; i++) for (let j = 1; j < F.length; j += 1) {
    const q = F[j][1][i], p0 = F[j - 1][1][i];
    if (Math.hypot(q[0] - p0[0], q[1] - p0[1]) > .2 && j % 2) px(q[0], q[1] - 2, F[j][2] === i ? '#ffe14d' : 'rgba(255,255,255,.45)');
   }
   for (const ps of d.play.passes) {
    const f0 = F.find(f => f[0] >= ps.t0) || E, f1 = F.find(f => ps.t1 != null && f[0] >= ps.t1) || E, a = f0[1][ps.from], c = f1[1][ps.to];
    for (let u = 0; u <= 1; u += .04) if (Math.floor(u * 25) % 2) px(a[0] + BX + (c[0] - a[0]) * u, a[1] + BY + (c[1] - a[1]) * u, 'rgba(255,225,77,.85)');
   }
  } else pos = pl.start.map(q => q.slice());
  try {
   drawGhosts(pl, pos);
  } catch (e) {}
  const order = pos.map((q, i) => i).sort((a, b) => pos[a][1] - pos[b][1]);
  for (const i of order) {
   const q = pos[i];
   piece(q[0], q[1], i, kit);
   if (d.phase === 'stage' && !d.pv && i === d.sel) ringPx(q[0], q[1] - 6, 12 + Math.sin(PM.t * 8) * .6, 1, '#7dff7a');
   if (i === holdI && holdF > 0) ringPx(q[0], q[1] - 6, 12, holdF, '#ffe14d');
   if (car === i && !ball) ballOn(q);
  }
  if (ball) ballAt(ball[0], ball[1]);
  if (d.phase === 'play' && d.live && !d.pv && d.live.car >= 0 && !d.live.fly) for (let i = 0; i < pos.length; i++) if (i !== d.live.car) {
   const q = pos[i];
   ringPx(q[0], q[1] - 6, 11, 1, 'rgba(125,255,122,.5)');
  }
  g.restore();
  if (d.phase === 'play' && d.live && d.live.cd > 0) text(d.live.cd > .45 ? 'READY...' : 'GO!', W / 2, 52, 2, '#ffe14d', 'center', '#000');
  if (d.pv) text('PREVIEW', W / 2, 22, 1, '#8fe3f0', 'center', '#000');
  if (!d.pv) rect(0, 17, W, 13, 'rgba(11,15,20,.92)');
  if (d.phase === 'set' && !d.pv) {
   const TABS = PM_CATS.concat([ 'SETS' ]), tw = Math.floor((W - 4) / TABS.length);
   TABS.forEach((c, i) => {
    const x = 2 + i * tw, on = d.mode === 'sets' ? c === 'SETS' : c === cat;
    hit('TAB ' + c, x, 18, tw - 2, 10, () => pmSetCat(c), 'TAB ' + c);
    rect(x, 19, tw - 2, 10, '#000');
    rect(x, 18, tw - 2, 10, on ? '#ffe14d' : '#5a6a75');
    text(c, x + (tw - 2) / 2, 21, 1, on ? '#0b1a20' : '#e6f0f2', 'center');
   });
  } else if (!d.pv) steps(d);
  rect(0, 0, W, 17, 'rgba(11,15,20,.92)');
  button('BACK', 2, 2, 28, 13, () => {
   PM.pd42 = null;
   pmBack();
  }, {
   bg: '#c9d6d9'
  });
  text('PLAY DESIGNER', 34, 3, 1, '#ffe14d');
  text(phaseName(d), 34, 10, 1, '#8fe3f0');
  const bw = 34, gap = 3;
  let x = W - (bw + gap) * 3 - 2;
  button('UNDO', x, 2, bw, 13, () => undo(d), {
   bg: d.phase === 'set' ? '#56606a' : '#c9d6d9'
  });
  x += bw + gap;
  button('CLEAR', x, 2, bw, 13, () => reset(d), {
   bg: '#ff8a7a'
  });
  x += bw + gap;
  if (PM.origin === 'menu') button('PLAYS', x, 2, bw, 13, () => {
   screen = 'plays';
   panelDirty();
  }, {
   bg: '#ffd23a'
  }); else button('CANCEL', x, 2, bw, 13, () => {
   PM.pd42 = null;
   pmBack();
  }, {
   bg: '#c9d6d9'
  });
  if (d.phase === 'set' && (cat === 'OFFENSE' || cat === 'MAN-UP' || cat === 'END LINE')) button('GHOST ' + (PM.ghost === 'ZONE' ? 'ZONE' : 'MAN'), W - 62, H - 16 - sa2403Dy(H - 16, 15) - 15, 58, 12, () => pmGhostToggle(), {
   bg: PM.ghost === 'ZONE' ? '#ff9a4a' : '#c9d6d9'
  });
  const B = bottomBtns(d);
  let bx = W - 2, bwAll = 0;
  for (const b of B) bwAll += b.w + 3;
  const dy = sa2403Dy(H - 17, 17), hy = H - 17 - dy;
  rect(0, hy, W, H - hy, 'rgba(11,15,20,.85)');
  const hint = d.flash > 0 && d.msg ? d.msg : hintOf(d), maxC = Math.max(10, Math.floor((W - bwAll - 8) / 4));
  const lines = wrap(hint, maxC);
  text(lines[0] || '', 4, hy + 3, 1, '#fff');
  if (lines[1]) text(lines[1], 4, hy + 10, 1, '#fff');
  for (const b of B.slice().reverse()) {
   bx -= b.w;
   button(b.label, bx, H - 16, b.w, 13, b.fn, {
    bg: b.bg,
    fg: b.fg
   });
   bx -= 3;
  }
 }
 function wrap(s, n) {
  const w = String(s).split(' '), out = [ '' ];
  for (const x of w) {
   const L = out[out.length - 1];
   if (!L.length) out[out.length - 1] = x; else if ((L + ' ' + x).length <= n) out[out.length - 1] = L + ' ' + x; else out.push(x);
  }
  if (out.length > 2) {
   out.length = 2;
   out[1] = out[1].slice(0, n - 2) + '..';
  }
  return out.map(l => l.slice(0, n));
 }
 function steps(d) {
  const n = Math.max(d.stage, d.stages.length), it = [ [ 'SET', 'set' ] ];
  for (let k = 1; k <= n; k++) it.push([ 'STAGE ' + k, 'stage' + k ]);
  if (NOBALL(catOf())) it.push([ 'PREVIEW + SAVE', 'done' ]); else it.push([ 'BALL', 'ball' ], [ 'PLAY', 'play' ], [ 'PREVIEW + SAVE', 'done' ]);
  const cur = d.phase === 'stage' ? 'stage' + d.stage : d.phase;
  const idx = it.findIndex(q => q[1] === cur);
  let x = 3;
  const y = 20;
  it.forEach(([lab, k], j) => {
   const w = textW(lab, 1) + 6;
   if (x + w > W - 2) return;
   rect(x, y, w, 9, j === idx ? '#ffe14d' : j < idx ? '#3d6b4a' : 'rgba(0,0,0,.55)');
   text(lab, x + w / 2, y + 2, 1, j === idx ? '#0b1a20' : '#e6f0f2', 'center');
   x += w + 2;
  });
 }
 function phaseName(d) {
  if (d.pv) return 'PREVIEW';
  if (d.mode === 'sets') return 'MAKE A SET';
  if (SHP()) return catOf() === 'CLEAR' ? 'CLEAR SHAPE' : (catOf() === 'D' ? 'D' : 'RIDE') + ' SHAPE - ' + DK_LBL(d);
  if (d.phase === 'set') return 'SET';
  if (d.phase === 'stage') return 'STAGE ' + d.stage + (d.rec ? '  REC ' + d.rec.t.toFixed(1) + 'S' : '');
  if (d.phase === 'ball') return 'ADD BALL';
  if (d.phase === 'play') return d.live && d.live.cd > 0 ? 'PLAY - READY' : 'PLAY  ' + (d.live ? d.live.T.toFixed(1) : '0') + 'S';
  return NOBALL(catOf()) ? 'READY' : 'PLAY READY';
 }
 function hintOf(d) {
  if (d.pv) return 'WATCHING YOUR PLAY...';
  if (SHP() && d.mode !== 'sets') return catOf() === 'CLEAR' ? 'DRAG YOUR GUYS INTO YOUR CLEAR SHAPE, THEN SAVE. IN GAMES THEY FLOW INTO IT WHEN YOU CLEAR' : catOf() === 'RIDES' ? 'DRAG YOUR RIDERS INTO A SHAPE. MAN = EACH TAKES THE CLOSEST GUY, ZONE = HOLD YOUR AREA. SAVE' : 'DRAG YOUR D INTO A SHAPE. PICK MAN OR ZONE' + (d.dk === 'zone' ? '' : ' + THE SLIDE') + ', THEN SAVE';
  if (d.mode === 'sets') return 'DRAG YOUR 6 GUYS INTO A SHAPE, THEN SAVE SET. IT BECOMES AN OFFENSE SET';
  if (CLRP() && (d.phase === 'set' || d.phase === 'stage' && !d.rec && d.sel == null)) return 'CLEAR: DRAG GUYS TO SPOTS, HOLD A GUY + MOVE HIM = HIS RUN, ADD BALL = WHO HAS IT. SAVE ANY TIME';
  if (d.phase === 'set') return NOBALL(catOf()) ? 'DRAG EVERY GUY TO HIS SPOT. SAVE IT AS IS, OR START STAGE 1 TO ADD RUNS' : 'DRAG EVERY GUY TO HIS SPOT, THEN START STAGE 1';
  if (d.phase === 'stage') {
   const n = Object.keys(d.stages[d.stage - 1]).length;
   if (d.rec) return 'MOVE ' + pmLbl(d.rec.p) + ' WITH THE STICK. HOLD ANOTHER GUY TO SWITCH';
   if (d.sel != null) return pmLbl(d.sel) + ': DRAG YOUR LEFT THUMB = HE RUNS THAT WAY';
   if (!n) return 'HOLD A GUY = YOU CONTROL HIM. MOVE HIM WITH THE STICK';
   return n + ' GUY' + (n > 1 ? 'S' : '') + ' MOVE AT ONCE. HOLD ANOTHER GUY, NEXT STAGE OR ' + (NOBALL(catOf()) ? 'DONE' : 'ADD BALL');
  }
  if (d.phase === 'ball') return d.car0 == null ? 'HOLD THE GUY WHO STARTS WITH THE BALL' : pmLbl(d.car0) + ' HAS THE BALL - START PLAY';
  if (d.phase === 'play') return 'STICK = MOVE THE BALL CARRIER. TAP A TEAMMATE = PASS';
  return NOBALL(catOf()) ? 'PREVIEW TO WATCH IT, SAVE TO SAVE IT. UNDO = BACK TO THE STAGES' : 'PREVIEW TO WATCH IT, SAVE TO SAVE IT. UNDO = RUN THE BALL PART AGAIN';
 }
 function bottomBtns(d) {
  const B = [], mk = (label, fn, bg, fg) => B.push({
   label: label,
   fn: fn,
   bg: bg,
   fg: fg,
   w: textW(label, 1) + 10
  });
  if (d.pv) {
   mk('STOP', () => {
    d.pv = null;
   }, '#8fe3f0');
   mk('SAVE', () => save(d), '#7dff7a');
   return B;
  }
  const nb = NOBALL(catOf());
  if (d.mode === 'sets') mk('SAVE SET', () => save(d), '#7dff7a'); else if (SHP()) {
   const tg = (lab, on, fn) => mk(lab, () => {
    fn();
    try {
     SFX.tap();
    } catch (e) {}
   }, on ? '#ffe14d' : '#56606a', on ? '#0b1a20' : '#e6f0f2');
   if (catOf() !== 'CLEAR') {
    tg('MAN', d.dk !== 'zone', () => d.dk = 'man');
    tg('ZONE', d.dk === 'zone', () => d.dk = 'zone');
   }
   if (d.dk !== 'zone' && catOf() === 'D') {
    tg('SLIDE AJ', d.slide !== 'crease', () => d.slide = 'adj');
    tg('SLIDE CREASE', d.slide === 'crease', () => d.slide = 'crease');
   }
   try { if (H7() && H7().hasSubs()) mk('PREVIEW', () => H7().shapePreview(d), '#8fe3f0'); } catch (e) {} // V42.7: watch the subs come on (rides / D sets)
   mk('SAVE', () => save(d), '#7dff7a');
  } else if (d.phase === 'set') {
   if (nb || CLRP()) mk('SAVE', () => save(d), '#8fe3f0');
   mk('START STAGE 1', () => goStage(d, 1), '#7dff7a');
  } else if (d.phase === 'stage') {
   const has = Object.keys(d.stages[d.stage - 1]).length > 0 || !!d.rec;
   if (d.stage < MAX_STAGES) mk('GO TO STAGE ' + (d.stage + 1), () => goStage(d, d.stage + 1), has ? '#8fe3f0' : '#56606a');
   if (nb) mk('DONE', () => noBallDone(d), '#ffe14d'); else mk('ADD BALL', () => addBall(d), '#ffe14d');
   if (CLRP()) mk('SAVE', () => save(d), '#8fe3f0');
  } else if (d.phase === 'ball') { mk('START PLAY', () => startPlay(d), d.car0 != null ? '#7dff7a' : '#56606a'); if (CLRP()) mk('SAVE', () => save(d), '#8fe3f0'); } else {
   mk('PREVIEW', () => preview(d), '#8fe3f0');
   mk('SAVE', () => save(d), '#7dff7a');
  }
  return B;
 }
 const OP = window.openPlaymaker, DR = window.drawPlaymaker, DN = window.pmDown, MV = window.pmMove, UP = window.pmUp, TK = window.pmTick, SC = window.pmSetCat, SA = window.pmSaveAsk;
 window.openPlaymaker = function(origin, play, cat) {
  const r = OP.apply(this, arguments);
  try {
   if (PM) {
    PM.pd42 = null;
    if (eligible(origin || 'menu', play, pmCat(PM.play))) attach(play);
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 window.pmSetCat = function(c) {
  if (c === 'SETS') {
   if (off() || !PM) return false;
   const r = SC.call(this, 'OFFENSE');
   try {
    PM.pd42 = null;
    attach(null);
    const d = D();
    d.mode = 'sets';
    d.msg = 'SETS: DRAG YOUR GUYS INTO A SHAPE, THEN SAVE SET';
    d.flash = 1.6;
   } catch (e) {
    console.error(e);
   }
   return r;
  }
  const r = SC.apply(this, arguments);
  try {
   if (PM) {
    PM.pd42 = null;
    if (eligible(PM.origin, null, pmCat(PM.play))) attach(null);
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 window.drawPlaymaker = function() {
  if (D()) {
   try {
    return draw();
   } catch (e) {
    console.error(e);
    PM.pd42 = null;
   }
  }
  return DR.apply(this, arguments);
 };
 window.pmDown = function(pt) {
  if (D()) return down(pt);
  return DN.apply(this, arguments);
 };
 window.pmMove = function(pt) {
  if (D()) return move(pt);
  return MV.apply(this, arguments);
 };
 window.pmUp = function(pt, cancel) {
  if (D()) return up(pt, cancel);
  return UP.apply(this, arguments);
 };
 window.pmTick = function(dt) {
  if (D()) return tick(dt);
  return TK.apply(this, arguments);
 };
 function saveSet(d, name) {
  const nm = String(name || '').replace(/[^\w #&'!?.+-]/g, '').trim().toUpperCase().slice(0, 12) || 'MY SET';
  let got = null;
  try {
   if (window.V404G && V404G.saveSet) got = V404G.saveSet(nm, PM.play.start.map(q => [ Math.round(q[0]), Math.round(q[1]) ]));
  } catch (e) {
   console.error(e);
  }
  if (got && typeof SETS !== 'undefined' && SETS[got]) {
   try {
    if (game && typeof setOffense === 'function') setOffense(got); else LS.set('oset', got);
   } catch (e) {}
  }
  screen = 'playmaker';
  panelDirty();
  d.msg = got ? 'SET SAVED: ' + got + ' - IT IS YOUR OFFENSE SET NOW (PLAYBOOK > SETS)' : 'COULD NOT SAVE THE SET';
  d.flash = 2.6;
  try {
   got ? SFX.catch() : SFX.bad();
  } catch (e) {}
 }
 try {
  if (typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.pmSave) {
   const RP = PANEL_RENDER.pmSave;
   PANEL_RENDER.pmSave = function() {
    const d = D();
    if (d && d.mode === 'sets') return '<div class="hd"><div><div class="tt">NAME YOUR SET</div><div class="st">IT GOES TO PLAYBOOK > SETS + BECOMES YOUR OFFENSE SET</div></div><div class="sp"></div>' + btn('CANCEL', 'pmSaveNo', null, 'g') + '</div>' + '<div class="row"><input id="pmname" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" value="MY SET" aria-label="set name">' + btn('SAVE SET', 'pmSaveGo', null, 'y') + '</div>' + '<div class="note">IN GAMES YOUR GUYS FLOW INTO IT ON THEIR OWN</div>';
    const h = RP.apply(this, arguments);
    if (d && SHP()) return h.replace(/\d+ STEPS/, (catOf() === 'D' ? 'DEFENSE - ' : '') + DK_LBL(d)).replace(/SAVED PLAYS SHOW UP IN THE PLAYBOOK BUTTON[^<]*/, 'IT SHOWS UP IN TIMEOUTS UNDER ' + ({ D: 'DEFENSE', RIDES: 'RIDE', CLEAR: 'CLEAR' }[catOf()] || catOf()) + '. PICK IT AND YOUR GUYS USE IT ON THEIR OWN');
    return h;
   };
  }
 } catch (e) {}
 if (typeof window.pmSaveGo === 'function') {
  const SG = window.pmSaveGo;
  window.pmSaveGo = function(name) {
   {
    const d = D();
    if (d && d.mode === 'sets') return saveSet(d, name);
   }
   const r = SG.apply(this, arguments);
   try {
    const d = D();
    if (d && PM.msg) {
     d.msg = PM.msg;
     d.flash = 2;
    }
   } catch (e) {}
   return r;
  };
 }
 window.pmSaveAsk = function() {
  const d = D();
  if (d) return save(d);
  return SA.apply(this, arguments);
 };
 try {
  const C = window.V4014C, q = C && C.on && Array.isArray(C.QA) && C.QA.find(x => x.id === 'playbook');
  if (q && /DRAG A ROUTE/.test(q.a)) q.a = 'IN A GAME TAP PLAYBOOK, PICK A PLAY. MAKE YOUR OWN IN PLAYMAKER: SET YOUR GUYS, STAGES (HOLD A GUY, MOVE HIM), ADD BALL, START PLAY, PREVIEW, SAVE.';
 } catch (e) {}
 if (typeof window.penaltyChoose === 'function' && typeof window.penPlay18 === 'function') {
  const PC = window.penaltyChoose, PP = window.penPlay18, muOff = () => off() || !!window.__rl_no404mu;
  window.penaltyChoose = function(v) {
   try {
    if (!muOff() && game && game.pen && game.pen.side === 'C') game.cpuMD = 'BOX + 1';
   } catch (e) {}
   return PC.apply(this, arguments);
  };
  for (const fn of [ 'liveClear', 'applyPenaltyLive' ]) if (typeof window[fn] === 'function') {
   const F0 = window[fn];
   window[fn] = function() {
    const r = F0.apply(this, arguments);
    try {
     if (!muOff() && game && game.pen && game.pen.side === 'C' && game.cpuMD) game.cpuMD = 'BOX + 1';
    } catch (e) {}
    return r;
   };
  }
  function nearMU405(G, S, pl, c) {
   const sp = S.spots, n = sp.length;
   if (!c || c.team !== 'O' || !Array.isArray(sp) || !n || n > 7) return false;
   const O = G.players.filter(p => p.team === 'O' && !p.gk && p.idx >= 0 && !p.far && p !== c);
   if (!O.length || O.length >= n) return false;
   const must = pl.car != null && pl.car >= 0 && pl.car < n ? pl.car : -1;
   const dist = (p, j) => Math.hypot(p.x - sp[j][0], p.y - sp[j][1]);
   // spots the ball goes through (passes / shots) should not be the one left empty
   const ballSp = new Set();
   for (const st of pl.steps || []) if (st && (st.t === 'pass' || st.t === 'shot')) for (const k of [ st.from, st.to, st.p ]) if (k != null) ballSp.add(k);
   let best = null, bs = 1e9, bd = 0;
   const perm = [], used = new Array(n).fill(false);
   const go = (i, acc) => {
    if (acc >= bs) return;
    if (i === O.length) {
     if (must >= 0 && !used[must]) return;
     let pen = 0;
     for (let j = 0; j < n; j++) if (!used[j] && ballSp.has(j)) pen += 200;
     if (acc + pen >= bs) return;
     bs = acc + pen;
     bd = acc;
     best = perm.slice();
     return;
    }
    for (let j = 0; j < n; j++) {
     if (used[j]) continue;
     used[j] = true;
     perm[i] = j;
     go(i + 1, acc + dist(O[i], j));
     used[j] = false;
    }
   };
   go(0, 0);
   if (!best) return false;
   let old = 0;
   S.map.forEach((p, i) => { if (p && p !== c && sp[i]) old += dist(p, i); });
   const map = new Array(n).fill(null);
   best.forEach((j, i) => { map[j] = O[i]; });
   const left = map.findIndex(p => !p); // left empty: your guy holds the ball wherever you take him
   S.map = map;
   S.st17 = must >= 0 ? map[must] : null;
   S.ap17 = null; // no auto pass - you pass to the guy who starts
   S.mu405 = { old: Math.round(old), now: Math.round(bd), emptySpot: left, starter: must >= 0 && map[must] ? map[must].idx : null };
   for (const p of O) { p.playHold = null; p.pickSet = null; p.callPick = null; }
   map.forEach((p, i) => { if (p) p.home = sp[i].slice(); });
   G.mu405n = (G.mu405n || 0) + 1;
   return true;
  }
  function placeMU() {
   const G = game, S = G && G.pset;
   if (muOff() || !S || S.mu404 || !G.pen || G.pen.side !== 'C' || !S.pl || pmCat(S.pl) !== 'MAN-UP') return;
   S.mu404 = 1;
   const pl = S.pl, c = G.carrier;
   // V40.0.5: everyone but your guy walks to the CLOSEST open spot of the play (min total distance; the play's
   // starting spot always gets filled). Your guy with the ball is not moved or teleported - you walk him and
   // pass to the guy who starts. Kill switch: window.__rl_no405s = true -> V40.0.4 placement (teleport).
   let near = false;
   if (!window.__rl_no405s) try { near = nearMU405(G, S, pl, c); } catch (e) { console.error(e); }
   if (!near && c && pl.car != null && pl.car >= 0 && S.map[pl.car] !== c) {
    const j = S.map.indexOf(c);
    if (j >= 0) {
     S.map[j] = S.map[pl.car];
     S.map[pl.car] = c;
    }
    S.st17 = c;
    S.ap17 = null;
   }
   if (!near) S.map.forEach((p, i) => {
    const q = S.spots[i];
    if (!p || !q) return;
    p.x = p.tx = q[0];
    p.y = p.ty = q[1];
    p.home = q.slice();
    p.down = 0;
    p.kb = null;
   });
   if (c && G.ball) {
    G.ball.x = c.x + BX;
    G.ball.y = c.y + BY;
   }
   G.cpuMD = 'BOX + 1';
   for (const d of G.players) if (d.team === 'D' && typeof settledSpot === 'function') {
    const q = settledSpot(d, GX);
    d.x = d.tx = q[0];
    d.y = d.ty = q[1];
    d.settled = q;
   }
   G.mu404 = {
    near: near ? S.mu405 : null,
    id: pl.id,
    spots: S.spots.map(q => q.slice()),
    pos: S.map.map(p => p ? [ Math.round(p.x), Math.round(p.y) ] : null),
    carOk: S.map[pl.car] === c,
    nD: G.players.filter(p => p.team === 'D').length,
    md: G.cpuMD
   };
  }
  if (typeof window.playSet === 'function') {
   const PS0 = window.playSet;
   window.playSet = function() {
    const r = PS0.apply(this, arguments);
    try {
     if (r) placeMU();
    } catch (e) {
     console.error(e);
    }
    return r;
   };
  }
 }
 // V40.0.4: PLAYS list - a shape (clear / ride) shows SHAPE (+ MAN / ZONE) instead of "0 STEPS"
 if (typeof PANEL_RENDER === 'object' && typeof PANEL_RENDER.plays === 'function') {
  const PR0 = PANEL_RENDER.plays;
  PANEL_RENDER.plays = function() {
   let h = PR0.apply(this, arguments);
   if (off() || typeof h !== 'string') return h;
   try {
    playsAll().forEach(p => {
     if (p && Array.isArray(p.steps) && !p.steps.length && p.car == null) {
      const k = '<span class="pname">' + esc(p.name) + '</span><span class="dim2">0 STEPS';
      h = h.split(k).join('<span class="pname">' + esc(p.name) + '</span><span class="dim2">SHAPE' + (p.dk ? ' - ' + String(p.dk).toUpperCase() : ''));
     }
    });
   } catch (e) {}
   return h;
  };
 }

 window.PD42 = {
  on: () => !off(),
  LOG: LOG,
  D: D,
  compile: () => D() && compile(D()),
  stagePos: (i, T) => D() && stagePos(D(), i, T),
  pvAt: t => D() && pvAt(D(), t),
  goStage: k => D() && goStage(D(), k),
  addBall: () => D() && addBall(D()),
  startPlay: () => D() && startPlay(D()),
  endPlay: () => D() && endPlay(D(), 'test'),
  preview: () => D() && preview(D()),
  save: () => D() && save(D()),
  CATS: CATS
 };
})();
