(function() {
 'use strict';
 const CFG = {
  slow: .4,
  tapSlow: 1,
  pullMin: 20,
  gain: 1.6,
  pullMax: 110,
  pullFull: 90,
  vert: .5,
  shortR: .9,
  fullR: 1.5,
  tapR: CREASE + 24,
  tapDur: .35,
  circR: 7,
  circHit: 11,
  cornR: 3.5,
  cornTol: 2.25,
  cornHi: 8,
  cornLo: 11,
  cornHx: 0,
  cornLx: -6,
  betwSave: .35,
  aimSlop: 16,
  hugGk: false,
  gkRx: 5,
  gkRy: 7,
  gkBack: 1.5,
  gkSpd: 48,
  arcGk: true,
  arcRx: 5,
  arcRy: 7,
  arcBack: 1.5,
  arcFull: 30 * Math.PI / 180,
  arcX: 12,
  arcSpd: 70,
  hugMin: .8,
  nearBeat: .1,
  farSave: .25,
  cornHiOut: .6,
  pipeBand: 1,
  lowCore: .75,
  cornHiOut282: 3.5,
  cornPipe: .05,
  stillPx: 1,
  stare0: .5,
  stareK: .08,
  stareMax: .25,
  quickT: .3,
  quickPx: 4,
  quickSave: .1,
  fdR: 36,
  fdV: 12,
  fdCos: .5,
  fdOver: .7,
  fdLost: 1,
  fdSlide: .45,
  gkA0: 5 * Math.PI / 180,
  gkA1: 22 * Math.PI / 180
 };
 const ASSIST = {
  2: {
   win: 4,
   k: 1
  },
  1: {
   win: 3,
   k: .85
  },
  3: {
   win: 2.2,
   k: .7
  },
  4: {
   win: 1.4,
   k: .5
  },
  5: {
   win: .8,
   k: .35
  },
  0: {
   win: 4,
   k: 1
  }
 };
 const PICK = [ 2, 1, 3, 4, 5 ];
 const SPOT_C = MOUTH - 2;
 const PIPE_OUT = MOUTH + .8;
 const TYPES = {
  SHOT: {
   spd: 1,
   spr: 1,
   rx: BX,
   ry: BY
  }
 };
 const S = {
  slowUntil: 0,
  aim: null,
  shots: 0,
  goals: 0,
  saves: 0,
  misses: 0,
  pending: null,
  resetAt: 0,
  log: [],
  last: null,
  spot: 'out',
  flash: null,
  started: false,
  taps: 0
 };
 const rt = () => performance.now() / 1e3;
 const R26 = () => typeof window.__rl_rng26 === 'function' ? window.__rl_rng26() : Math.random();
 function on() {
  return !window.__rl_no26 && !window.__rl_v124gb && typeof game !== 'undefined' && !!game && !(game.tutorial && game.tutorial.track && game.tutorial.track !== 'main' && game.tutorial.track !== 'm28');
 }
 function inTap() {
  const c = game && game.carrier;
  return !!(c && game.ball.state === 'held' && Math.hypot(GX - c.x, CY - c.y) <= CFG.tapR);
 }
 function circlesOn() {
  const c = game && game.carrier;
  return inTap() && (c.x < GX || !!(window.V361SC && V361SC.gle(c))) || air32();
 }
 function air32() {
  const G = game, c = G && G.carrier;
  return !window.__rl_no32air && !!c && !!c.pl && c.pl.id === 'LEG-0' && !G.air20 && G.ball.state === 'held' && !!(window.V20 && V20.airReady && V20.airReady());
 }
 function circles() {
  return [ [ true, true ], [ true, false ], [ false, true ], [ false, false ] ].map(([top, high]) => ({
   top: top,
   high: high,
   x: high ? GX - 4 : GX + 13,
   y: top ? CY - 11 : CY + 12,
   corner: (top ? 0 : 2) + (high ? 0 : 1),
   name: (top ? 'TOP' : 'BOTTOM') + '-' + (high ? 'LEFT' : 'RIGHT')
  }));
 }
 function quad(wx, wy, hitOnly) {
  let best = null, bd = 1e9;
  for (const q of circles()) {
   const d = Math.hypot(wx - q.x, wy - q.y);
   if (d < bd) {
    bd = d;
    best = q;
   }
  }
  return hitOnly && bd > CFG.circHit ? null : best;
 }
 function arcSpot(b) {
  const c = game.carrier, sx = c ? c.x : b.x, sy = c ? c.y : b.y, dx = sx - GX, dy = sy - CY;
  const t = dx < 0 ? Math.sign(dy) * Math.min(1, Math.atan2(Math.abs(dy), -dx) / CFG.arcFull) : clamp(dy / CFG.arcX, -1, 1);
  if (dx >= 0) return [ GX - CFG.arcBack, CY + CFG.arcRy * t, t ];
  const ph = t * Math.PI / 2;
  return [ Math.min(GX - CFG.arcBack, GX - CFG.arcRx * Math.cos(ph)), CY + CFG.arcRy * Math.sin(ph), t ];
 }
 function glx(k) {
  return CFG.arcGk && on() && k && k.hug25 ? clamp(k.x, GX - 5, GX - 1) : GX - 5;
 }
 function gk(p, b) {
  if (!CFG.hugGk && !CFG.arcGk || !on() || screen !== 'live' || !b) return;
  if (b.state === 'shot') {
   if (p.hug25) p.tx = p.x;
   return;
  }
  if (CFG.arcGk) {
   const q = arcSpot(b);
   p.tx = q[0];
   p.ty = q[1];
   p.spd = CFG.arcSpd;
   p.hug25 = true;
   p.arc26 = q[2];
   return;
  }
  const c = game.carrier, sx = c ? c.x : b.x, sy = c ? c.y : b.y;
  const dx = sx - GX, dy = sy - CY, sg = Math.abs(dy) > .5 ? Math.sign(dy) : p.hugSg25 || 1;
  p.hugSg25 = sg;
  const a = Math.atan2(Math.abs(dy), Math.max(.01, -dx));
  let s = clamp((a - CFG.gkA0) / (CFG.gkA1 - CFG.gkA0), 0, 1);
  s = s * s * (3 - 2 * s);
  const y = CY + sg * CFG.gkRy * s, x = Math.min(GX - CFG.gkBack, GX - CFG.gkRx * Math.sqrt(Math.max(0, 1 - s * s)));
  p.tx = x;
  p.ty = y;
  p.spd = Math.max(p.spd || 0, CFG.gkSpd);
  p.hug25 = true;
 }
 function faceFwd(p, car) {
  const b = game && game.ball;
  if (!p || !b) return false;
  return S.aim && p === car || b.shooter === p && S.relAt != null && (b.state === 'shot' || rt() - S.relAt < .6);
 }
 function cageBox() {
  const b = {
   x0: GX - 1,
   x1: GX + 10,
   y0: CY - MOUTH - 1,
   y1: CY + MOUTH + 2
  };
  return b;
 }
 const ots28 = c => !!(c && window.V28 && V28.otsOk && V28.otsOk(c));
 const otsX = () => GX - (window.__rl_no282otsspot ? 6 : 12);
 const ots28c = c => ots28(c) ? {
  x: Math.min(c.x, otsX()),
  y: c.y
 } : c;
 function relPt(c) {
  return {
   x: c.x + TYPES.SHOT.rx,
   y: c.y + TYPES.SHOT.ry
  };
 }
 function corners(s) {
  const out = [];
  for (const top of [ true, false ]) for (const high of [ true, false ]) {
   const sg = top ? -1 : 1, cy = CY + sg * (high ? CFG.cornHi : CFG.cornLo), cx = GX + (high ? CFG.cornHx : CFG.cornLx);
   const by = high ? cy : s.y + (cy - s.y) * (GX - s.x) / Math.max(1, cx - s.x);
   out.push({
    top: top,
    high: high,
    by: by,
    x: cx,
    y: cy,
    corner: (top ? 0 : 2) + (high ? 0 : 1),
    name: (top ? 'TOP' : 'BOTTOM') + '-' + (high ? 'HIGH' : 'LOW')
   });
  }
  return out;
 }
 function cornersOn() {
  const c = game && game.carrier, A = S.aim;
  return !!(A && c && ots28c(c).x < GX && Math.max(0, A.ax - A.tx) * SCALE >= CFG.pullMin);
 }
 function fix282() {
  return !window.__rl_no282pipe;
 }
 function hiOut() {
  return fix282() ? CFG.cornHiOut282 : CFG.cornHiOut;
 }
 function cornerHit(s, raw) {
  if (CFG.cornTol < 0) return null;
  let best = null, bd = 1e9;
  for (const q of corners(s)) {
   const d = Math.abs(raw - q.by), wide = (raw - q.by) * (q.top ? -1 : 1) > 0;
   if (d <= (q.high && wide ? hiOut() : !q.high && fix282() ? Math.max(CFG.cornTol, CFG.cornR * (GX - s.x) / Math.max(1, q.x - s.x)) : CFG.cornTol) && d < bd) {
    bd = d;
    best = q;
   }
  }
  return best;
 }
 function pipeAim(c, raw, q) {
  const e = Math.abs(raw - CY), lo = CFG.cornHi + hiOut();
  return !q && CFG.cornTol >= 0 && c.x < GX && e > lo && e <= lo + CFG.pipeBand;
 }
 function assist(ay) {
  const a = ASSIST[game && game.diff != null ? game.diff : SETTINGS.diff] || ASSIST[1], e = Math.abs(ay - CY), sg = ay < CY ? -1 : 1;
  if (e > SPOT_C && e <= MOUTH - .5) return CY + sg * (e - (e - SPOT_C) * a.k);
  if (e > PIPE_OUT && e <= PIPE_OUT + a.win) return CY + sg * (e - (e - SPOT_C) * a.k);
  return ay;
 }
 function aimNow(A) {
  const c = game.carrier;
  if (!c) return null;
  const s = relPt(ots28c(c));
  const pull = clamp(A.ax - A.tx, 0, CFG.pullMax), L = pull * CFG.gain;
  const raw = clamp(A.wy0 + (A.ty - A.ay) * CFG.vert, CY - MOUTH - 10, CY + MOUTH + 10);
  const q0 = ots28c(c).x < GX ? cornerHit(s, raw) : null;
  const pp = pipeAim(ots28c(c), raw, null) && !(q0 && (fix282() || !q0.high && Math.abs(raw - q0.by) <= CFG.lowCore));
  const q = pp ? null : q0;
  const ay = q ? CY + (q.top ? -1 : 1) * SPOT_C : pp ? CY + (raw < CY ? -1 : 1) * (MOUTH + .2) : assist(raw), D = Math.hypot(GX - s.x, ay - s.y), r = D > 0 ? L / D : 0;
  return {
   s: s,
   ay: ay,
   raw: raw,
   L: L,
   D: D,
   r: r,
   pull: pull,
   onNet: !!q || pp || Math.abs(ay - CY) <= PIPE_OUT,
   high: q ? q.high : A.depth >= .5,
   bow: 0,
   cq: q,
   pipe27: pp
  };
 }
 function down(pt, p) {
  if (!on() || !canShoot()) return false;
  const wx = p.x + Math.round(camX), wy = p.y, b = cageBox(), c = game.carrier;
  const tq = circlesOn() ? quad(wx, wy, true) : null;
  if (tq && air32()) {
   S.flash = {
    t: rt(),
    q: tq
   };
   try {
    releaseShot(.5, tq.corner);
   } catch (e) {
    console.error(e);
   }
   pt.role = 'shot26';
   pt.cageStart = true;
   return true;
  }
  if (!tq && atX231(c) && !ots28(c)) return false;
  if (!tq && s231on() && !(window.V20 && V20.airReady && V20.airReady()) && nearestMateCss(pt.scx, pt.scy, pt.k, MATE_PX * MATE231)) return false;
  const sl = CFG.aimSlop;
  if (!tq && (wx < b.x0 - sl || wx > b.x1 + sl || wy < b.y0 - sl || wy > b.y1 + sl)) return false;
  S.aim = {
   id: pt.id,
   wy: wy,
   tq: tq,
   ax: p.x,
   ay: p.y,
   tx: p.x,
   ty: p.y,
   wy0: clamp(wy, CY - MOUTH - 1, CY + MOUTH + 1),
   depth: clamp((wx - GX) / 10, 0, 1),
   t0: rt(),
   pulled: 0,
   wx: wx,
   maxPull: 0,
   still0: null,
   anc: null,
   hist: []
  };
  S.flash = {
   t: rt(),
   q: tq
  };
  pt.role = 'shot26';
  pt.cageStart = true;
  return true;
 }
 function move(pt) {
  const A = S.aim;
  if (!A || A.id !== pt.id) return;
  A.tx = pt.x;
  A.ty = pt.y;
  A.pulled = Math.max(A.pulled, pt.moved || 0);
  track(A, pt.k || SCALE);
 }
 function rawOf(A) {
  return clamp(A.wy0 + (A.ty - A.ay) * CFG.vert, CY - MOUTH - 10, CY + MOUTH + 10);
 }
 function track(A, k) {
  const t = rt(), raw = rawOf(A), cp = Math.max(0, A.ax - A.tx) * k;
  A.maxPull = Math.max(A.maxPull || 0, cp);
  A.hist.push([ t, raw ]);
  while (A.hist.length > 2 && t - A.hist[1][0] > .6) A.hist.shift();
  if (cp < CFG.pullMin) return;
  if (A.anc == null || Math.abs(raw - A.anc) > CFG.stillPx) {
   A.anc = raw;
   A.still0 = t;
  }
 }
 function stareMod(A) {
  const t = rt(), raw = rawOf(A);
  let mv = 0, before = null;
  for (const h of A.hist) {
   if (t - h[0] <= CFG.quickT) mv = Math.max(mv, Math.abs(h[1] - raw)); else before = h;
  }
  if (before) mv = Math.max(mv, Math.abs(before[1] - raw));
  const held = A.still0 == null ? 0 : t - A.still0, quick = mv >= CFG.quickPx;
  const stare = !quick && held > CFG.stare0 ? Math.min(CFG.stareMax, CFG.stareK * (held - CFG.stare0)) : 0;
  return {
   held: +held.toFixed(2),
   moved: +mv.toFixed(2),
   stare: +stare.toFixed(3),
   quick: quick,
   mod: quick ? -CFG.quickSave : stare
  };
 }
 function faceDodge(A) {
  const G = game, c = G.carrier;
  if (!c || !canShoot()) return cancel('no carrier');
  const from = typeof handOf17 === 'function' ? handOf17(c) : c.hand || 1;
  const r = doDodge('split', .35, from >= 0 ? 1 : -1);
  if (!r && !(G.dodge && G.dodge.who === c && G.dodge.t < .05)) return cancel('face dodge: dodge not ready');
  const near = [], tut = !!(window.TUT26 && TUT26.forceOverrun && TUT26.forceOverrun());
  for (const q of G.players) {
   if (q.team !== 'D' || q.gk || q.role === 'G' || q.down > 0 || q.stun > 0 && !q.charge26 || q.far) continue;
   const dx = c.x - q.x, dy = c.y - q.y, d = Math.hypot(dx, dy);
   if (d > CFG.fdR) continue;
   let v = q._v26 || [ 0, 0 ], sp = Math.hypot(v[0], v[1]);
   if (q.charge26) {
    sp = Math.max(sp, q.charge26);
    v = [ dx / (d || 1) * sp, dy / (d || 1) * sp ];
   }
   const toward = sp >= CFG.fdV && (v[0] * dx + v[1] * dy) / (sp * (d || 1)) >= CFG.fdCos;
   if (!toward) {
    near.push({
     d: +d.toFixed(1),
     sp: +sp.toFixed(1),
     toward: false
    });
    continue;
   }
   const roll = R26(), over = tut || roll < CFG.fdOver;
   if (over) {
    q.charge26 = 0;
    q.ovr26 = {
     t: CFG.fdLost,
     slide: CFG.fdSlide,
     vx: v[0] / sp,
     vy: v[1] / sp,
     sp: Math.max(sp, CFG.fdV)
    };
    q.stun = CFG.fdLost;
    G.fd26n = (G.fd26n || 0) + 1;
   }
   near.push({
    d: +d.toFixed(1),
    sp: +sp.toFixed(1),
    toward: true,
    roll: +roll.toFixed(3),
    overrun: over
   });
  }
  const n = near.filter(x => x.overrun).length;
  S.fd = {
   t: rt(),
   from: from >= 0 ? 'right' : 'left',
   near: near,
   overrun: n,
   maxPull: Math.round(A.maxPull)
  };
  S.fds = (S.fds || 0) + 1;
  try {
   addFx('txt', c.x, c.y - 26, {
    s: n ? 'FACE DODGE - HE BIT!' : 'FACE DODGE',
    col: '#ffe14d',
    life: .8
   });
  } catch (e) {}
  try {
   lastTap = {
    kind: 'face26',
    overrun: n
   };
  } catch (e) {}
  return true;
 }
 function cancel(why) {
  S.aim = null;
  try {
   lastTap = {
    kind: 'none',
    why: 'shot25 ' + why
   };
  } catch (e) {}
 }
 function up(pt, cancelled) {
  const A = S.aim;
  if (!A || A.id !== pt.id) return;
  S.aim = null;
  if (cancelled || !canShoot()) return cancel('cancelled');
  const c = game.carrier, dur = rt() - A.t0, cssPull = Math.max(0, A.ax - A.tx) * (pt.k || SCALE);
  if (cssPull < CFG.pullMin && !A.tq && (A.maxPull || 0) >= CFG.pullMin) return faceDodge(A);
  if (cssPull < CFG.pullMin) {
   const dc = Math.hypot(GX - c.x, CY - c.y);
   if (dur <= CFG.tapDur && dc <= CFG.tapR) return fire(A, {
    tapIn: true
   });
   return cancel(dc <= CFG.tapR ? 'tap too slow' : 'no pull-back');
  }
  return fire(A, {});
 }
 function fire(A, o) {
  const c = game.carrier, ots = !o.tapIn && ots28(c) && c.x > otsX(), ox = c ? c.x : 0, oy = c ? c.y : 0;
  if (ots) c.x = otsX();
  let r;
  try {
   r = fire0(A, o);
  } finally {
   if (ots) c.x = ox;
  }
  if (ots && game.ball.state === 'shot' && game.ball.shooter === c) {
   try {
    V28.otsFired(c, ox, oy);
   } catch (e) {
    console.error(e);
   }
  }
  return r;
 }
 function fire0(A, o) {
  const c = game.carrier, T = TYPES.SHOT;
  let m;
  if (o.tapIn) {
   const bx = c.x + BX, s = bx > GX - 7 ? {
    x: GX - 7,
    y: clamp(c.y + BY, CY - MOUTH - 4, CY + MOUTH + 4)
   } : {
    x: bx,
    y: c.y + BY
   };
   const q = A.tq || quad(A.wx, A.wy), ay = CY + (q.top ? -1 : 1) * SPOT_C;
   m = {
    s: s,
    ay: ay,
    raw: ay,
    L: 0,
    D: Math.hypot(GX - s.x, ay - s.y),
    r: 1,
    pull: 0,
    onNet: true,
    high: q.high,
    bow: 0,
    quad: q.name
   };
  } else m = aimNow(A);
  if (!m) return cancel('no carrier');
  const short = !o.tapIn && m.r < CFG.shortR;
  const power = o.tapIn ? .15 : short ? .15 : clamp(.15 + .85 * m.pull / CFG.pullFull, .15, 1);
  const corner = (m.ay < CY ? 0 : 2) + (m.high ? 0 : 1);
  const held = o.tapIn ? .1 : power * FULL_POWER_S;
  const cx0 = c.x;
  if (o.tapIn && c.x > GX - 6) c.x = GX - 6;
  try {
   releaseShot(held, corner);
  } finally {
   c.x = cx0;
  }
  const b = game.ball;
  if (b.state !== 'shot') return cancel('engine refused (' + b.state + ')');
  const anim = o.tapIn ? null : m.high ? 'under' : 'over';
  if (anim) {
   try {
    c.shot20 = {
     type: anim,
     t0: menuT,
     one: false,
     top: m.ay < CY,
     x: c.x,
     y: c.y
    };
   } catch (e) {}
  }
  const tg = b.target, sh = b.shooter, x0 = sh.x + BX, y0 = sh.y + BY;
  const ls = game.lastShot || {}, tutK = tut26Keeper();
  if (tutK) {
   ls.flub = false;
   b.pipe = null;
  }
  if (!ls.flub) {
   const f282 = fix282() && !!m.cq && !o.tapIn && !short, eng282 = !!b.pipe;
   const dev = f282 && eng282 ? 0 : Math.atan2(b.vy, b.vx) - Math.atan2(tg.y - y0, tg.x - x0);
   let sp = Math.hypot(b.vx, b.vy) * T.spd;
   const s = m.s;
   const clank = !o.tapIn && !short && m.cq && !tutK && Math.random() < CFG.cornPipe;
   if (b.pipe && !f282 && Math.abs(m.ay - CY) >= MOUTH - 2.5 || (m.pipe27 || clank) && !short && !b.block) {
    const py = CY + (m.ay < CY ? -1 : 1) * (MOUTH + .2), pa = Math.atan2(py - s.y, GX - s.x);
    b.pipe = {
     y: py,
     top: m.ay < CY
    };
    b.x = s.x;
    b.y = s.y;
    b.vx = Math.cos(pa) * sp;
    b.vy = Math.sin(pa) * sp;
   } else {
    b.pipe = null;
    const ang = Math.atan2(m.ay - s.y, GX - s.x) + dev * (window.__shot26_nospread || tutK ? 0 : T.spr);
    b.x = s.x;
    b.y = s.y;
    b.vx = Math.cos(ang) * sp;
    b.vy = Math.sin(ang) * sp;
    let yc = b.y + b.vy * (GX - b.x) / Math.max(1, b.vx), ec = Math.abs(yc - CY);
    if (f282 && ec > MOUTH - 1) {
     yc = CY + (yc < CY ? -1 : 1) * (MOUTH - 1);
     ec = MOUTH - 1;
     const a2 = Math.atan2(yc - b.y, GX - b.x);
     b.vx = Math.cos(a2) * sp;
     b.vy = Math.sin(a2) * sp;
    }
    if (!short && !b.block && ec > MOUTH - .5 && ec <= PIPE_OUT) {
     const py = CY + (yc < CY ? -1 : 1) * (MOUTH + .2), pa = Math.atan2(py - s.y, GX - s.x);
     b.pipe = {
      y: py,
      top: yc < CY
     };
     b.vx = Math.cos(pa) * sp;
     b.vy = Math.sin(pa) * sp;
    }
   }
   b.shotFrom = [ b.x, b.y ];
  }
  b.target = {
   x: GX,
   y: m.ay,
   high: m.high,
   top: m.ay < CY,
   left: m.high
  };
  const gk = game.goalie;
  if (gk && b.vx > 1) {
   const tt = (glx(gk) - b.x) / b.vx;
   gk.dive = clamp(b.y + b.vy * Math.max(0, tt), CY - MOUTH - 1, CY + MOUTH + 1);
  }
  let side26 = null;
  if (CFG.arcGk && gk && gk.arc26 != null && Math.abs(gk.arc26) >= CFG.hugMin && !o.tapIn && !short && !b.pipe && !b.block && !ls.flub && Math.abs(m.ay - CY) <= MOUTH - .5) {
   side26 = Math.sign(m.ay - CY) === Math.sign(gk.arc26) ? 'near' : 'far';
   if (side26 === 'near' && Math.random() < CFG.nearBeat) {
    gk.reach = .001;
    gk.react = 9;
    b.aim14 = null;
    side26 = 'near-beat';
   }
  }
  const betw = !o.tapIn && !short && !m.cq && !b.pipe && !b.block && !ls.flub && Math.abs(m.ay - CY) <= MOUTH - .5;
  let read = betw && Math.random() < CFG.betwSave || side26 === 'far' && Math.random() < CFG.farSave;
  const sd = o.tapIn ? null : stareMod(A), elig = !!sd && !short && !b.pipe && !b.block && !ls.flub && Math.abs(m.ay - CY) <= MOUTH - .5;
  let own = side26 === 'near', sdRes = null;
  if (elig && sd.mod > 0) {
   const r = R26();
   if (r < sd.mod) {
    read = true;
    sdRes = 'read';
   } else sdRes = 'no-read';
   sd.roll = +r.toFixed(3);
  } else if (elig && sd.mod < 0) {
   const r = R26();
   sd.roll = +r.toFixed(3);
   if (r < CFG.quickSave) {
    read = false;
    own = false;
    if (gk) {
     gk.reach = .001;
     gk.react = 9;
    }
    b.aim14 = null;
    sdRes = 'beat';
   } else sdRes = 'no-beat';
  }
  if (tutK) {
   read = false;
   own = false;
   if (gk) {
    gk.reach = .001;
    gk.react = 9;
   }
   b.aim14 = null;
  }
  b.s25 = {
   sx: b.x,
   sy: b.y,
   bow: 0,
   off: 0,
   reach: short ? Math.max(6, m.L) : null,
   type: o.tapIn ? 'TAP-IN' : 'SHOT',
   read: read,
   own: own
  };
  S.log = [ [ +b.x.toFixed(1), +b.y.toFixed(1) ] ];
  S.last = {
   type: b.s25.type,
   aimY: +m.ay.toFixed(2),
   rawY: +m.raw.toFixed(2),
   power: +power.toFixed(2),
   pull: +m.pull.toFixed(1),
   onNet: !!m.onNet,
   r: +m.r.toFixed(2),
   short: short,
   L: +m.L.toFixed(1),
   D: +m.D.toFixed(1),
   sx: +b.x.toFixed(1),
   sy: +b.y.toFixed(1),
   vx: +b.vx.toFixed(1),
   vy: +b.vy.toFixed(1),
   bow: 0,
   corner: corner,
   quad: m.quad || null,
   circle: m.cq ? m.cq.name : null,
   place: o.tapIn ? 'tap' : m.cq ? 'circle' : b.pipe ? 'pipe' : betw ? 'between' : 'off',
   read: read,
   side: side26,
   stare: sd,
   sd: sdRes,
   elig: elig,
   high: !!m.high,
   anim: anim,
   pipe: !!b.pipe,
   block: !!b.block,
   flub: !!ls.flub,
   outcome: null,
   log: S.log
  };
  S.relAt = rt();
  S.shots++;
  S.pending = S.last;
  S.resetAt = 0;
  if (o.tapIn) {
   S.slowUntil = rt() + CFG.tapSlow;
   S.taps++;
  }
  try {
   lastTap = {
    kind: 'shot25',
    type: b.s25.type
   };
  } catch (e) {}
 }
 function fly(b, dt) {
  const s = b.s25;
  if (!s) return false;
  if (s.read && b.vx > 1) {
   const gk = game.goalie, gx = glx(gk);
   if (gk && b.x < gx && b.x + b.vx * .05 >= gx - 30) {
    const cy = b.y + b.vy * (gx - b.x) / b.vx;
    gk.y += clamp(cy - gk.y, -6, 6);
    gk.ty = gk.y;
    gk.dive = cy;
    b.aim14 = null;
   }
  }
  if (s.own && b.vx > 1) {
   const gk = game.goalie, gl = glx(gk), ox = b.x - b.vx * dt;
   if (gk && ox < gl && b.x >= gl && Math.abs(b.y + (GX - b.x) * b.vy / b.vx - CY) <= MOUTH + 1) {
    const cy = clamp(b.y + (gl - b.x) * b.vy / b.vx, CY - MOUTH - 1, CY + MOUTH + 1);
    try {
     b.s25 = null;
     b.state = 'dead';
     SFX.save();
     addFx('pop', gl, cy);
     goalieSave12(gk, cy);
     endPossession('turnover', 'SAVED!', pick([ 'WHAT A STOP', 'GOALIE WINS THAT ONE', 'ROBBED!' ]));
     if (sv2111On(game)) {
      game.sv2111 = game.banner;
      [b.x, b.y] = sv2111Stick(gk);
     }
    } catch (e) {
     console.warn(e);
    }
    return true;
   }
  }
  if (S.log.length < 400) S.log.push([ +b.x.toFixed(1), +b.y.toFixed(1) ]);
  if (s.reach != null && Math.hypot(b.x - s.sx, b.y - s.off - s.sy) >= s.reach) {
   b.s25 = null;
   if (S.pending) S.pending.outcome = 'short';
   popLoose(b.x, b.y, b.vx * .12, b.vy * .12, 'check');
   return true;
  }
  return false;
 }
 const SLOW = {
  0: .35,
  2: .35,
  1: .38,
  3: .41,
  4: .44,
  5: .47
 };
 function slowF() {
  const d = game && game.diff != null ? game.diff : SETTINGS.diff;
  return SLOW[d] || CFG.slow;
 }
 function netSlow() {
  const NN = window.RLNET;
  return on() && NN && NN.inGame && !NN.auth && NN.slo26 && NN.slo26 < 1 && performance.now() - (NN.slo26At || 0) < 8e3 ? NN.slo26 : 1;
 }
 function tap286() {
  const b = game && game.ball;
  return !window.__rl_no286crease && !window.__rl_v124gb && !!b && b.state === 'shot' && !!b.s25 && b.s25.type === 'TAP-IN';
 }
 function slow() {
  if (!on()) return 1;
  const NN = window.RLNET;
  if (game && game.online && NN && NN.inGame && !NN.auth) return 1;
  return S.aim || rt() < S.slowUntil ? !S.aim && tap286() ? Math.min(1, slowF() * 2) : slowF() : 1;
 }
 function drawAim() {
  const G = game, cam = Math.round(camX);
  const A = S.aim;
  if (!A || !G.carrier) return;
  const m = aimNow(A);
  if (!m) return;
  const pulled = Math.max(0, A.ax - A.tx) * SCALE >= CFG.pullMin;
  if (!pulled) return;
  const ly = m.cq ? m.raw : m.ay;
  const dx = GX - m.s.x, dy = ly - m.s.y, D = Math.hypot(dx, dy), ux = dx / D, uy = dy / D;
  const Dq = m.cq ? (m.cq.x - m.s.x) / Math.max(.01, ux) : 0;
  const end = m.L < D ? m.L : m.cq ? Dq : m.onNet ? D : D + 400;
  for (let t = 3; t <= end; t += 3) {
   const x = m.s.x + ux * t - cam;
   if (x > W + 2) break;
   px(x, m.s.y + uy * t, '#ffffff');
  }
  if (m.L >= D * CFG.shortR) {
   const ex = m.cq ? m.s.x + ux * Dq : GX, ey = m.cq ? m.s.y + uy * Dq : m.ay;
   rect(Math.round(ex) - cam - 1, Math.round(ey) - 1, 3, 3, m.r >= CFG.fullR ? '#ff4a3a' : m.r >= 1.2 ? '#ffe14d' : '#7dff7a');
  }
 }
 function circ(x, y, R, on) {
  g.fillStyle = on ? 'rgba(255,225,77,.75)' : 'rgba(255,225,77,.28)';
  g.beginPath();
  g.arc(x + .5, y + .5, R, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#ffe14d';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(x + .5, y + .5, R - .5, 0, Math.PI * 2);
  g.stroke();
 }
 function drawCorners() {
  const G = game;
  if (!G || !on() || screen !== 'live' || !S.aim) return;
  if (!cornersOn()) return;
  const m = aimNow(S.aim);
  if (!m) return;
  for (const q of corners(m.s)) circ(q.x, q.y, CFG.cornR, !!(m.cq && m.cq.name === q.name));
 }
 function drawCircles() {
  const G = game;
  if (!G || !on() || screen !== 'live') return;
  if (S.aim) return;
  const fq = S.flash && S.flash.q && rt() - S.flash.t < .45 ? S.flash.q : null;
  if (!circlesOn() && !fq) return;
  for (const q of circles()) {
   if (!circlesOn() && q.name !== fq.name) continue;
   circ(q.x, q.y, CFG.circR, !!(fq && q.name === fq.name));
  }
 }
 function draw() {
  if (!on()) return;
  if (GAME_SCREENS.includes(screen)) drawAim();
 }
 function outcome() {
  const G = game, b = G.ball, P = S.pending, bt = G.banner && G.banner.txt || '';
  if (b.state === 'net' || /GOAL/.test(bt)) return 'goal';
  if (/SAVE/.test(bt)) return 'save';
  if (P && P.outcome === 'short') return 'short';
  if (b.state === 'shot') return null;
  if (/BLOCK/.test(bt)) return 'blocked';
  return 'miss';
 }
 function tick(dt) {
  const G = game;
  if (!G || !on()) {
   S.aim = null;
   return;
  }
  if (S.aim && (!canShoot() || !pointers.has(S.aim.id))) cancel('lost the ball');
  if (!G.players) return;
  for (const q of G.players) {
   if (q.team !== 'D') continue;
   if (q._p26 && dt > 0) {
    const vx = (q.x - q._p26[0]) / dt, vy = (q.y - q._p26[1]) / dt, o = q._v26 || [ vx, vy ];
    q._v26 = [ o[0] * .5 + vx * .5, o[1] * .5 + vy * .5 ];
   }
   q._p26 = [ q.x, q.y ];
   const O = q.ovr26;
   if (!O) continue;
   O.t -= dt;
   if (O.t <= 0) {
    q.ovr26 = null;
    q.stun = 0;
    continue;
   }
   if (O.slide > 0) {
    const k = Math.min(dt, O.slide), f = O.slide / CFG.fdSlide;
    q.x = clamp(q.x + O.vx * O.sp * f * k, FL0(), FR0());
    q.y = clamp(q.y + O.vy * O.sp * f * k, FT + 2, FB - 2);
    q.tx = q.x;
    q.ty = q.y;
    O.slide -= dt;
    q._p26 = [ q.x, q.y ];
   }
   q.stun = O.t;
  }
 }
 function FL0() {
  return 4;
 }
 function FR0() {
  return FL - 4;
 }
 function tut26Keeper() {
  return !!(window.TUT26 && TUT26.keeperOff && TUT26.keeperOff());
 }
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return;
  window[n] = function() {
   return f.call(this, o, arguments);
  };
 };
 wrapG('step', function(o, a) {
  const r = o.apply(this, a);
  try {
   tick(a[0] || 0);
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 wrapG('drawPlayers', function(o, a) {
  try {
   drawCircles();
  } catch (e) {
   console.error(e);
  }
  const r = o.apply(this, a);
  try {
   drawCorners();
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 wrapG('render', function(o, a) {
  const r = o.apply(this, a);
  try {
   draw();
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 window.SHOT26 = {
  netSlow: netSlow,
  on: on,
  faceFwd: faceFwd,
  gk: gk,
  arcSpot: arcSpot,
  glx: glx,
  quad: quad,
  circles: circles,
  inTap: inTap,
  circlesOn: circlesOn,
  corners: corners,
  cornersOn: cornersOn,
  cornerHit: cornerHit,
  relPt: relPt,
  SLOW: SLOW,
  slowF: slowF,
  down: down,
  move: move,
  up: up,
  fly: fly,
  slow: slow,
  CFG: CFG,
  ASSIST: ASSIST,
  TYPES: TYPES,
  S: S,
  assist: assist,
  aimNow: aimNow,
  cageBox: cageBox,
  stareMod: stareMod,
  faceDodge: faceDodge,
  outcome: outcome,
  PICK: PICK
 };
})();
