var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 const OFF = () => !!window.__rl_no4012tut || !!window.__rl_v124gb;
 const LOG = {
  air: [],
  skips: 0,
  passes: [],
  fo: {
   held: 0,
   left: 0,
   boost: 0
  },
  ots: [],
  hand: 0,
  errs: []
 };
 window.V4012T = {
  on: false,
  LOG: LOG
 };
 if (OFF()) return;
 if (typeof TUTX === 'undefined' || typeof TUT_MAIN_181 === 'undefined' || typeof TV20 === 'undefined' || typeof tutSetup !== 'function' || typeof drawTutorial !== 'function') return;
 const on = k => !OFF() && !window['__rl_no4012' + k];
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   console.error(e);
  } catch (x) {}
 };
 const rt = () => performance.now() / 1e3;
 const G0 = () => typeof game !== 'undefined' ? game : null;
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function() {
   return f.call(this, o, arguments);
  };
  return true;
 };
 const TT = () => {
  const G = G0(), Tt = G && G.tutorial;
  return Tt && !Tt.complete ? Tt : null;
 };
 const track = Tt => Tt && Tt.track || 'main';
 const idx = n => TUTX.findIndex(s => s && s[0] === n);
 const def = v => typeof v === 'number' && v >= 0 ? v : -99;
 const ST = {
  FSET: def(typeof TF181 !== 'undefined' ? TF181 : -1),
  FO1: def(typeof TUT_FO_STEP !== 'undefined' ? TUT_FO_STEP : -1),
  FORM: def(typeof TV131 !== 'undefined' ? TV131.FORM : -1),
  DOWN: def(typeof TV131 !== 'undefined' ? TV131.DOWN : -1),
  WING: def(typeof TV131 !== 'undefined' ? TV131.WING : -1),
  MOVE: 0,
  PASS: 1,
  SHOOT: 2,
  GB: 3,
  CHASE: 4,
  DODGE: 9,
  PM: 10,
  PB: 11,
  SPLIT: 14,
  ROLL: 15,
  PICK: 16,
  POLE: 17,
  GK: 18,
  CUT: def(typeof TCUT181 !== 'undefined' ? TCUT181 : -1),
  SHOT38: def(idx('SHOOTING')),
  FD38: def(idx('FACE DODGE')),
  SWIM: def(typeof TV28 !== 'undefined' ? TV28.SWIM : -1),
  TOE: def(typeof TV28 !== 'undefined' ? TV28.TOE : -1),
  ROLL28: def(typeof TV28 !== 'undefined' ? TV28.ROLL : -1),
  OTS: def(typeof TV28 !== 'undefined' ? TV28.OTS : -1),
  AIR: def(TV20.AIR),
  BULL: def(typeof TB !== 'undefined' ? TB.BULL : -1),
  CHIRP: def(typeof TV !== 'undefined' ? TV.CHIRP : -1),
  CHECK: def(typeof TD !== 'undefined' ? TD.CHECK : -1),
  STRIP: def(typeof TD !== 'undefined' ? TD.STRIP : -1),
  HIT: def(typeof TD !== 'undefined' ? TD.HIT : -1),
  TAPSW: def(typeof TD !== 'undefined' ? TD.TAP : -1),
  OUTLET: def(typeof TC !== 'undefined' ? TC.OUTLET : -1),
  ANY: def(typeof TC !== 'undefined' ? TC.ANY : -1),
  CARRY: def(typeof TC !== 'undefined' ? TC.CARRY : -1),
  COUNT: def(typeof TC !== 'undefined' ? TC.COUNT : -1),
  V20CUT: def(TV20.CUT),
  V20ROLL: def(TV20.ROLL),
  V20ONE: def(TV20.ONE),
  V20TOE: def(TV20.TOE),
  OVER: def(TV20.OVER),
  UNDER: def(TV20.UNDER),
  SIDE: def(TV20.SIDE)
 };
 const FO_STEPS = [ ST.FO1, ST.FSET, ST.FORM, ST.DOWN, ST.WING ];
 const isCard = s => {
  try {
   return typeof tutIsCard === 'function' && tutIsCard(s);
  } catch (e) {
   return false;
  }
 };
 window.V4012T = {
  on: true,
  LOG: LOG,
  ST: ST,
  st: () => S
 };
 const KEY = 'rl4012tut';
 let S = {};
 try {
  S = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
 } catch (e) {
  S = {};
 }
 const saveS = () => {
  try {
   localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
 };
 if (on('air')) {
  try {
   const i = TUT_MAIN_181.indexOf(TV20.AIR);
   if (i >= 0) TUT_MAIN_181.splice(i, 1);
  } catch (e) {
   err(e, 'air-main');
  }
  const cache = new WeakMap;
  wrapG('tutList', function(o, a) {
   const L = o.apply(this, a);
   const Tt = G0() && G0().tutorial;
   if (!on('air') || track(Tt) !== 'main' || !Array.isArray(L) || !L.includes(TV20.AIR)) return L;
   let c = cache.get(L);
   if (!c) {
    c = L.filter(s => s !== TV20.AIR);
    cache.set(L, c);
   }
   return c;
  });
 }
 const owns = id => {
  try {
   const s = window.V17 && V17.ST && V17.ST();
   return !!(s && s.inv && s.inv[id] > 0);
  } catch (e) {
   return false;
  }
 };
 const v20done = () => {
  try {
   const v = LS.get('v20', null);
   return !!(v && v.airDone);
  } catch (e) {
   return false;
  }
 };
 const airDue = () => on('air') && !!window.V20 && owns(__x("bGVnX2dhcnJ5")) && !S.air && !v20done();
 function legName() {
  try {
   const p = PP('LEG-0');
   return String(fold2318(p && p.n || 'THE LEGEND')).toUpperCase();
  } catch (e) {
   return 'THE LEGEND';
  }
 }
 function airMark(how) {
  if (!S.air) {
   S.air = how;
   S.airAt = Date.now();
   saveS();
   LOG.air.push(how);
  }
  try {
   if (!v20done() && window.V20 && V20.tutComplete) V20.tutComplete('air');
  } catch (e) {
   err(e, 'airMark');
  }
 }
 function airSkip() {
  const G = G0();
  S.air = 'skipped';
  S.airAt = Date.now();
  saveS();
  LOG.air.push('skipped');
  airMark('skipped');
  try {
   if (G && G.tutorial) G.tutorial.complete = true;
  } catch (e) {}
  game = null;
  screen = 'menu';
  try {
   shootP = null;
   stick = null;
  } catch (e) {}
  try {
   menuMsg = {
    s: 'AIR DIVE TUTORIAL SKIPPED',
    t: 2.2
   };
  } catch (e) {}
 }
 window.V4012T.airSkip = airSkip;
 window.V4012T.airDue = airDue;
 let airAt = 0;
 if (window.V20 && typeof V20.drawHome === 'function') {
  const dh0 = V20.drawHome;
  V20.drawHome = function(bars, modal) {
   try {
    if (airDue() && !modal && screen === 'menu' && !G0() && !(typeof tutAsk !== 'undefined' && tutAsk) && !(typeof tutGate !== 'undefined' && tutGate) && !(window.TUT26 && TUT26.need && (TUT26.need() || TUT26.active()))) {
     if (!airAt) airAt = rt();
     if (rt() - airAt > .6 || window.__rl_4012airNow) {
      airAt = 0;
      airMark('shown');
      startTutorial('air');
      const G = G0();
      if (G && G.tutorial) G.tutorial.air4012 = rt();
      return;
     }
     return;
    }
    airAt = 0;
    if (on('air') && S.air && owns(__x("bGVnX2dhcnJ5")) && !v20done() && V20.tutComplete) V20.tutComplete('air');
   } catch (e) {
    err(e, 'airHome');
   }
   return dh0.apply(this, arguments);
  };
 }
 const foStep = () => {
  const Tt = TT();
  return !!Tt && FO_STEPS.includes(Tt.step) && screen === 'faceoff' && !!(game && game.fo);
 };
 if (on('fo')) {
  try {
   if (Array.isArray(window.TUT_FO231) || typeof TUT_FO231 !== 'undefined') {
    TUT_FO231[3] = 'WHISTLE = SWIPE IN ANY DIRECTION. THE BALL POPS OUT THAT WAY.';
   }
   if (typeof TUT_FO !== 'undefined' && TUT_FO.length >= 6) {
    TUT_FO[4] = 'WHISTLE / GO!: SWIPE IN ANY DIRECTION. PICKED A WING? IT POPS TO HIM.';
    TUT_FO[5] = 'QUICK SWIPE + MORE TAPS + BETTER FOGO = MORE WINS.';
   }
   if (typeof TUT_FOW231 !== 'undefined') TUT_FOW231[2] = 'WHISTLE = SWIPE IN ANY DIRECTION (OR TAP) TO WIN IT.';
   if (ST.FO1 >= 0 && TUTX[ST.FO1]) TUTX[ST.FO1][1] = 'MASH THE BUTTON. ON THE WHISTLE: SWIPE IN ANY DIRECTION.';
   if (ST.WING >= 0 && TUTX[ST.WING]) TUTX[ST.WING][1] = 'HOLD A WING. MASH. ON THE WHISTLE: SWIPE ANY WAY = POPS TO HIM.';
  } catch (e) {
   err(e, 'foText');
  }
  wrapG('updateFaceoff', function(o, a) {
   try {
    const F = game && game.fo, dt = +a[0] || 0;
    if (foStep() && F.phase === 'go' && F.whistleT != null) {
     F.g4012 = (F.g4012 || 0) + dt;
     if (F.t - F.whistleT > .4 && F.g4012 < 10) {
      F.whistleT = F.t - .4;
      F.held4012 = 1;
     }
    }
   } catch (e) {
    err(e, 'foHold');
   }
   return o.apply(this, a);
  });
  wrapG('foPointerDown', function(o, a) {
   try {
    const pt = a[0], F = game && game.fo;
    if (foStep() && F.phase === 'go' && pt && pt.zone === 'L') {
     pt.zone = 'R';
     LOG.fo.left++;
    }
   } catch (e) {
    err(e, 'foLeft');
   }
   return o.apply(this, a);
  });
  wrapG('foResolve', function(o, a) {
   const F = game && game.fo;
   let b = 0;
   try {
    const Tt = TT();
    if (foStep() && Tt && (Tt.foLoss4012 || 0) >= 1) {
     b = .8;
     F.cpuReact += b;
     LOG.fo.boost++;
    }
   } catch (e) {
    err(e, 'foBoost');
   }
   try {
    return o.apply(this, a);
   } finally {
    try {
     if (b) F.cpuReact -= b;
     const Tt = TT();
     if (Tt && F && F.win === false) Tt.foLoss4012 = (Tt.foLoss4012 || 0) + 1;
     if (F && F.held4012) LOG.fo.held++;
    } catch (e) {}
   }
  });
 }
 const FOL = {
  3: {
   mid: .52
  },
  5: {
   mid: .48
  }
 }, FOL_LOG = LOG.fol = {
  n: 0,
  last: null
 };
 const folOn = G => on('fol') && !!G && !G.tutorial && !G.practice && typeof DF !== 'undefined' && !!FOL[DF.level] && !(window.RLNET && RLNET.inGame);
 function folTarget(G, F) {
  const pTaps = F.taps / F.setDur * (F.tapMulU || 1), react = F.t - F.whistleT;
  const raw = (pTaps - F.cpuRate) * .07 + (F.cpuReact - react) * 1.2;
  const press = Math.max(-.15, Math.min(.05, raw * .12));
  const foEdge = .11 * (rf(G.foMe.pl, 'fo') - rf(G.foThem.pl, 'fo'));
  const want = Math.max(.2, Math.min(.8, FOL[DF.level].mid + press + foEdge));
  return {
   pTaps: pTaps,
   react: react,
   raw: raw,
   foEdge: foEdge,
   want: want,
   cpuReact: react + (want - .5 - foEdge - (pTaps - F.cpuRate) * .07) / 1.2
  };
 }
 window.V4012T.folTarget = (G, F) => folTarget(G || game, F || game && game.fo);
 wrapG('foResolve', function(o, a) {
  const G = G0(), F = G && G.fo;
  let r0 = null;
  try {
   if (folOn(G) && F && F.phase === 'go' && G.foMe && G.foThem) {
    const t = folTarget(G, F);
    r0 = F.cpuReact;
    F.cpuReact = t.cpuReact;
    FOL_LOG.n++;
    FOL_LOG.last = {
     lvl: DF.level,
     want: +t.want.toFixed(3),
     raw: +t.raw.toFixed(3),
     foEdge: +t.foEdge.toFixed(3)
    };
   }
  } catch (e) {
   err(e, 'fol');
   r0 = null;
  }
  try {
   return o.apply(this, a);
  } finally {
   if (r0 !== null && F) F.cpuReact = r0;
  }
 });
 const KTAP = .11 / .07;
 const online = () => !!(window.RLNET && RLNET.inGame);
 function barVals(G, F) {
  const sd = F.setDur || 1.2, prog = Math.max(0, Math.min(1, F.t / sd)), meR = rf(G.foMe.pl, 'fo'), thR = rf(G.foThem.pl, 'fo');
  const me = F.taps * (F.tapMulU || 1) + KTAP * meR * sd * prog;
  let cpu = F.cpuRate * Math.min(F.t, sd) + KTAP * thR * sd * prog;
  if (folOn(G) && F.phase !== 'scrum') {
   const pT = F.taps / Math.max(.2, Math.min(F.t, sd)) * (F.tapMulU || 1), press = Math.max(-.15, Math.min(.05, (pT - F.cpuRate) * .07 * .12));
   const want = Math.max(.2, Math.min(.8, FOL[DF.level].mid + press + .11 * (meR - thR)));
   cpu = Math.max(0, me - (want - .5) / .07 * sd * prog);
  }
  return {
   me: me,
   cpu: cpu,
   max: sd * 11
  };
 }
 function drawBars(G, F) {
  const mid = Math.round(W / 2), my = F.v131 ? 52 : 22, v = barVals(G, F), on2 = online();
  rect(mid - 62, my, 124, 18, 'rgba(0,0,0,.9)');
  const f = x => Math.round(100 * Math.max(0, Math.min(1, x / v.max)));
  text('YOU', mid - 58, my + 3, 1, '#8fe3f0');
  rect(mid - 42, my + 3, 100, 4, '#333');
  rect(mid - 42, my + 3, f(v.me), 4, '#2cc4dc');
  text(on2 ? 'THM' : 'CPU', mid - 58, my + 10, 1, '#ff9a8a');
  rect(mid - 42, my + 10, 100, 4, '#333');
  if (on2) {
   const a = Math.floor(rt() * 3) % 2;
   text('?', mid + 8, my + 9, 1, a ? '#ff9a8a' : '#7a8a95', 'center');
  } else rect(mid - 42, my + 10, f(v.cpu), 4, '#ff5a4a');
 }
 if (on('bar')) wrapG('drawFaceoffUI', function(o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0(), F = G && G.fo;
   if (on('bar') && F && (F.phase === 'set' || F.phase === 'go') && G.foMe && G.foThem) drawBars(G, F);
  } catch (e) {
   err(e, 'bar');
  }
  return r;
 });
 let oddsN = null, oddsUntil = 0, odds = null;
 function drawOdds() {
  const N = window.RLNET;
  if (!on('bar') || !N || !N.inGame) return;
  const L = N.foLast;
  if (L && L.n !== oddsN) {
   oddsN = L.n;
   if (L.p != null) {
    const pm = N.side === 'h' ? L.p : 1 - L.p;
    odds = {
     me: pm,
     win: !!L.win
    };
    oddsUntil = rt() + 1.8;
   } else odds = null;
  }
  if (!odds || rt() > oddsUntil) return;
  const mid = Math.round(W / 2), y = 30, pm = Math.round(odds.me * 100), s = 'FACEOFF ODDS  YOU ' + pm + '%  THEM ' + (100 - pm) + '%' + (odds.win ? '  - WON IT' : '  - LOST IT');
  const w = Math.max(textW(s) + 10, 130);
  rect(mid - w / 2, y, w, 20, 'rgba(0,0,0,.85)');
  text(s, mid, y + 3, 1, odds.win ? '#7dff7a' : '#ff9a8a', 'center');
  rect(mid - 50, y + 12, 100, 4, '#ff5a4a');
  rect(mid - 50, y + 12, Math.round(100 * odds.me), 4, '#2cc4dc');
 }
 window.V4012T.barVals = () => {
  const G = G0();
  return G && G.fo ? barVals(G, G.fo) : null;
 };
 if (on('bar')) wrapG('drawHUD', function(o, a) {
  const r = o.apply(this, a);
  try {
   drawOdds();
  } catch (e) {
   err(e, 'odds');
  }
  return r;
 });
 if (on('dodge')) try {
  if (TUTX[ST.DODGE]) TUTX[ST.DODGE][1] = 'LEFT THUMB = MOVE. RUN, THEN SWIPE YOUR RIGHT THUMB ACROSS = DODGE.';
  if (TUTX[ST.SPLIT]) TUTX[ST.SPLIT][1] = 'LEFT THUMB RUNS. RIGHT THUMB: SWIPE STRAIGHT ANY WAY = SPLIT DODGE.';
  if (ST.SWIM >= 0) TUTX[ST.SWIM][1] = 'LEFT THUMB RUNS. RIGHT THUMB: DRAW A BACKWARDS C = SWIM PAST HIM.';
  if (ST.TOE >= 0) TUTX[ST.TOE][1] = 'LEFT THUMB RUNS. RIGHT THUMB: DRAW A C = TOE DRAG PAST HIM.';
  if (TUTX[ST.ROLL]) TUTX[ST.ROLL][1] = 'RUN WITH YOUR LEFT THUMB, THEN DRAW A C WITH IT = ROLL AND TURN BACK.';
  if (ST.BULL >= 0) TUTX[ST.BULL][1] = 'LEFT THUMB RUNS AT HIM. HOLD YOUR RIGHT THUMB DOWN = BULL DODGE.';
 } catch (e) {
  err(e, 'dodgeText');
 }
 const DODGE_GUIDE = () => [ ST.DODGE, ST.SPLIT, ST.SWIM, ST.TOE, ST.ROLL, ST.ROLL28, ST.BULL, ST.V20CUT, ST.V20ROLL, ST.V20TOE ];
 const OTSZ = {
  back: 12,
  front: 26,
  yMin: 9,
  yMax: 64
 };
 const otsStep = () => {
  const Tt = TT();
  return !!Tt && ST.OTS >= 0 && Tt.step === ST.OTS;
 };
 const inOtsZone = c => !!c && c.x - GX <= OTSZ.back && GX - c.x <= OTSZ.front && Math.abs(c.y - CY) >= OTSZ.yMin && Math.abs(c.y - CY) <= OTSZ.yMax;
 if (on('ots')) try {
  if (ST.OTS >= 0) TUTX[ST.OTS][1] = 'RUN TO THE PINK RING. TOUCH THE GOAL, DRAG YOUR THUMB BACK, LET GO.';
  if (window.V28 && typeof V28.otsOk === 'function') {
   const ok0 = V28.otsOk;
   V28.otsOk = function(c) {
    try {
     if (on('ots') && otsStep() && screen === 'live' && c && c === game.carrier && c.team === 'O' && game.ball && game.ball.state === 'held' && inOtsZone(c)) return true;
    } catch (e) {
     err(e, 'otsOk');
    }
    return ok0.apply(this, arguments);
   };
  }
 } catch (e) {
  err(e, 'ots');
 }
 const CFG = window.SHOT26 && SHOT26.CFG;
 if (on('ots') && CFG && typeof CFG.pullMin === 'number') try {
  let PULL0 = CFG.pullMin;
  Object.defineProperty(CFG, 'pullMin', {
   configurable: true,
   enumerable: true,
   set(v) {
    PULL0 = v;
   },
   get() {
    try {
     const Tt = TT();
     if (on('ots') && Tt && (Tt.step === ST.OTS || Tt.step === ST.SHOT38) && screen === 'live') return Math.min(PULL0, 12);
    } catch (e) {}
    return PULL0;
   }
  });
 } catch (e) {
  err(e, 'pull');
 }
 function pullTune() {}
 const X = {
  step: -1,
  track: '',
  tries: 0,
  t: 0,
  hintAt: 30,
  autoAt: 90,
  msg: null,
  shots: 0,
  fds: 0,
  lost: 0,
  retryAt: 0,
  otsTries: 0,
  upAt: 0
 };
 function say(s, col, life) {
  X.msg = {
   s: s,
   col: col || '#ffe14d',
   until: rt() + (life || 1.6)
  };
 }
 function passStep(why, txt) {
  const Tt = TT();
  if (!Tt || Tt.doneT > 0) return;
  Tt.doneT = 1.3;
  Tt.pass4012 = why;
  LOG.passes.push({
   s: Tt.step,
   why: why,
   tries: X.tries,
   t: +X.t.toFixed(1)
  });
  try {
   SFX.cheer();
  } catch (e) {}
  say(txt || 'NICE - MOVING ON', '#7dff7a', 1.5);
 }
 const playScr = () => [ 'live', 'defense', 'faceoff', 'banner', 'cpu' ].includes(screen);
 wrapG('tutSetup', function(o, a) {
  const G = G0(), Tt = G && G.tutorial, s0 = Tt ? Tt.step : -1, tr = track(Tt);
  const same = !!Tt && !Tt.complete && s0 === X.step && tr === X.track;
  const r = o.apply(this, a);
  try {
   const T2 = G0() && G0().tutorial;
   if (!T2) return r;
   if (!same || T2.step !== s0) {
    X.step = T2.step;
    X.track = track(T2);
    X.tries = 0;
    X.t = 0;
    X.otsTries = 0;
    X.lost = 0;
    X.retryAt = 0;
    X.msg = null;
   } else if (on('stuck') && tr !== 'air' && !T2.complete) {
    X.tries++;
    if (X.tries >= 3 && !(T2.doneT > 0)) passStep('tries');
   }
   if (window.SHOT26 && SHOT26.S) {
    X.shots = SHOT26.S.shots || 0;
    X.fds = SHOT26.S.fds || 0;
   }
  } catch (e) {
   err(e, 'setup');
  }
  return r;
 });
 wrapG('drawTutorial', function(o, a) {
  const Tt = TT();
  let g0 = null;
  try {
   if (on('stuck') && Tt && track(Tt) === 'main' && typeof tutGate !== 'undefined' && tutGate) {
    g0 = tutGate;
    tutGate = false;
   }
  } catch (e) {
   g0 = null;
  }
  try {
   return o.apply(this, a);
  } finally {
   if (g0 !== null) try {
    tutGate = g0;
   } catch (e) {}
  }
 });
 function tick(dt) {
  const G = G0(), Tt = TT();
  pullTune();
  if (!Tt) return;
  if (track(Tt) === 'air' && on('air') && !S.air) airMark('shown');
  if (Tt.doneT > 0) return;
  if (Tt.step !== X.step || track(Tt) !== X.track) {
   X.step = Tt.step;
   X.track = track(Tt);
   X.tries = 0;
   X.t = 0;
   X.otsTries = 0;
   X.lost = 0;
   X.retryAt = 0;
  }
  if (playScr() && !(typeof paused !== 'undefined' && paused)) X.t += dt;
  if (on('ots') && Tt.step === ST.OTS && !Tt.f.ots28) {
   const S2 = window.SHOT26 && SHOT26.S, c = G.carrier;
   if (S2 && (S2.shots || 0) !== X.shots) {
    X.shots = S2.shots || 0;
    const p = c && c.team === 'O' && G.ball && G.ball.state === 'held' ? c : X.lastC, near = !!p && inOtsZone(p);
    LOG.ots.push({
     near: near,
     x: p ? Math.round(p.x - GX) : null,
     y: p ? Math.round(p.y - CY) : null
    });
    if (near) {
     tutFlag('ots28');
     say('OVER THE SHOULDER!', '#7dff7a', 1.4);
     return;
    }
    X.otsTries++;
    X.retryAt = rt() + 1.1;
    X.retryMsg = 'TOO FAR OUT - SHOOT FROM THE PINK RING';
   }
   X.lastC = c && c.team === 'O' && G.ball && G.ball.state === 'held' ? {
    x: c.x,
    y: c.y
   } : X.lastC;
   if (S2 && (S2.fds || 0) !== X.fds) {
    X.fds = S2.fds || 0;
    X.otsTries++;
    X.retryAt = rt() + .9;
    X.retryMsg = 'DON\'T PUSH FORWARD - DRAG BACK AND LET GO';
   }
   if (!X.retryAt && (screen !== 'live' || !c || c.team !== 'O' || !G.ball || G.ball.state !== 'held')) {
    X.lost += dt;
    if (X.lost > 1.2) {
     X.otsTries++;
     X.retryAt = rt();
     X.retryMsg = 'LOST IT - TRY AGAIN';
    }
   } else X.lost = 0;
   if (X.retryAt && rt() >= X.retryAt) {
    X.retryAt = 0;
    X.lost = 0;
    if (X.otsTries >= 3) {
     tutFlag('ots28', 'help');
     passStep('ots', 'NICE - MOVING ON');
     return;
    }
    const k = X.tries;
    tutSetup();
    X.tries = k;
    say(X.retryMsg || 'TRY AGAIN', '#ff9a8a', 2.6);
   }
  }
  if (on('stuck') && track(Tt) !== 'air' && !isCard(Tt.step) && Tt.step !== ST.PM && X.t >= X.autoAt) passStep('time', 'MOVING ON');
 }
 wrapG('tutTick', function(o, a) {
  const r = o.apply(this, a);
  try {
   tick(+a[0] || 0);
  } catch (e) {
   err(e, 'tick');
  }
  return r;
 });
 const HAND = [ '...##......', '..#ww#.....', '..#ww#.....', '..#ww###...', '..#ww#ww##.', '###ww#ww#w#', '#ww#wwwww#w#', '#wwwwwwwwww#', '.#wwwwwwwww#', '..#wwwwwww#.', '...#wwwwww#.', '...#wwwwww#.', '...########.' ];
 const HCOL = {
  '#': '#0b1a20',
  w: '#ffe9c9'
 };
 function drawHand(x, y, down, alpha) {
  const ox = Math.round(x) - 3, oy = Math.round(y) + (down ? 0 : 2);
  g.save();
  g.globalAlpha = alpha == null ? .92 : alpha;
  for (let r = 0; r < HAND.length; r++) {
   const row = HAND[r];
   for (let c = 0; c < row.length; c++) {
    const ch = row[c];
    if (ch !== '.') {
     g.fillStyle = HCOL[ch];
     g.fillRect(ox + c, oy + r, 1, 1);
    }
   }
  }
  g.restore();
 }
 function ring(x, y, r, col, a) {
  g.save();
  g.globalAlpha = a == null ? .9 : a;
  circle(Math.round(x), Math.round(y), r, col, .12);
  g.restore();
 }
 function trail(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0);
  if (d < 1) return;
  g.save();
  g.globalAlpha = .7;
  for (let i = 0; i <= d; i += 2) {
   const t = i / d;
   g.fillStyle = '#ffe14d';
   g.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1);
  }
  g.restore();
 }
 function arrowHead(x, y, ux, uy, col, n) {
  const px2 = -uy, py2 = ux;
  n = n || 6;
  for (const [c2, o] of [ [ '#0b1a20', 1 ], [ col, 0 ] ]) {
   g.fillStyle = c2;
   for (let k = 0; k < n; k++) for (let j = -k; j <= k; j++) g.fillRect(Math.round(x - ux * k + px2 * j + o), Math.round(y - uy * k + py2 * j + o), 1, 1);
  }
 }
 function at(keys, p) {
  for (let i = 1; i < keys.length; i++) {
   const a = keys[i - 1], b = keys[i];
   if (p <= b[0]) {
    const f = b[0] > a[0] ? (p - a[0]) / (b[0] - a[0]) : 1;
    return {
     x: a[1] + (b[1] - a[1]) * f,
     y: a[2] + (b[2] - a[2]) * f,
     down: !!a[3] && (f < 1 || !!b[3])
    };
   }
  }
  const z = keys[keys.length - 1];
  return {
   x: z[1],
   y: z[2],
   down: !!z[3]
  };
 }
 const K = {
  tap: (x, y) => [ [ 0, x + 9, y + 12, 0 ], [ .3, x, y, 0 ], [ .34, x, y, 1 ], [ .55, x, y, 1 ], [ .6, x, y, 0 ], [ .8, x + 9, y + 12, 0 ], [ 1, x + 9, y + 12, 0 ] ],
  mash: (x, y) => {
   const k = [ [ 0, x, y, 0 ] ];
   for (let i = 0; i < 6; i++) {
    k.push([ .04 + i * .16, x, y, 1 ], [ .12 + i * .16, x, y, 0 ]);
   }
   k.push([ 1, x, y, 0 ]);
   return k;
  },
  hold: (x, y) => [ [ 0, x + 9, y + 12, 0 ], [ .2, x, y, 0 ], [ .24, x, y, 1 ], [ .8, x, y, 1 ], [ .84, x, y, 0 ], [ 1, x + 9, y + 12, 0 ] ],
  swipe: (x, y, dx, dy) => [ [ 0, x, y, 0 ], [ .15, x, y, 1 ], [ .45, x + dx, y + dy, 1 ], [ .5, x + dx, y + dy, 0 ], [ .8, x + dx, y + dy, 0 ], [ 1, x, y, 0 ] ],
  path: (pts, hold) => {
   const k = [ [ 0, pts[0][0], pts[0][1], 0 ], [ .1, pts[0][0], pts[0][1], 1 ] ];
   const n = pts.length - 1, span = hold ? .72 : .62;
   pts.forEach((p, i) => {
    if (i) k.push([ .1 + span * i / n, p[0], p[1], 1 ]);
   });
   const e = pts[n];
   k.push([ .1 + span + .05, e[0], e[1], 0 ], [ 1, e[0], e[1], 0 ]);
   return k;
  },
  arc: (x, y, r, a0, a1, n) => {
   const p = [];
   for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    p.push([ x + Math.cos(a) * r, y + Math.sin(a) * r * .8 ]);
   }
   return p;
  },
  pull: (x, y, back, ret) => ret ? [ [ 0, x, y, 0 ], [ .12, x, y, 1 ], [ .42, x - back, y, 1 ], [ .5, x - back, y, 1 ], [ .7, x - 2, y, 1 ], [ .74, x - 2, y, 0 ], [ 1, x - 2, y, 0 ] ] : [ [ 0, x, y, 0 ], [ .12, x, y, 1 ], [ .5, x - back, y, 1 ], [ .6, x - back, y, 1 ], [ .64, x - back, y, 0 ], [ 1, x - back, y, 0 ] ]
 };
 const cam = () => Math.round(camX);
 const scr = (wx, wy) => [ Math.round(wx - cam()), Math.round(wy) ];
 const onScr = (p, m) => {
  const [x, y] = scr(p.x, p.y);
  return x > (m || 6) && x < W - (m || 6) && y > 30 && y < H - 20;
 };
 function mateFor(G, team, not, prefer) {
  let best = null, bd = 1e9;
  const ref = prefer || not;
  for (const p of G.players || []) {
   if (p.team !== team || p === not || p.gk || p.role === 'G' || p.down > 0 || !onScr(p, 14)) continue;
   const d = ref ? Math.hypot(p.x - ref.x, p.y - ref.y) : 0;
   if (d < bd) {
    bd = d;
    best = p;
   }
  }
  return best;
 }
 const body = p => {
  const [x, y] = scr(p.x, p.y);
  return [ x, y - 7 ];
 };
 const goalPt = () => scr(GX + 4, CY);
 const LJ = () => [ Math.round(W * .2), H - 52 ], RS = () => [ Math.round(W * .74), H - 58 ];
 function joyTo(dx, dy, len) {
  const [x, y] = LJ(), d = Math.hypot(dx, dy) || 1;
  len = len || 18;
  return K.path([ [ x, y ], [ x + dx / d * len * .5, y + dy / d * len * .5 ], [ x + dx / d * len, y + dy / d * len ] ], true);
 }
 function gesture(G, Tt) {
  const s = Tt.step, c = G.carrier, out = [], add = (keys, per, label, extra) => out.push(Object.assign({
   keys: keys,
   per: per || 1.8,
   label: label
  }, extra || {}));
  if (screen === 'faceoff' && G.fo) {
   const F = G.fo, B = FO_BTN();
   if (F.phase === 'form') {
    if ((s === ST.FSET || s === ST.FORM || s === ST.FO1) && !(Tt.f.foWingMv && Tt.f.foAtkMv)) {
     const w = !Tt.f.foWingMv ? foWings()[0] : null, at2 = !w ? foAtk()[0] : null, p = w || at2;
     if (p) {
      const [x, y] = body(p);
      add(K.path([ [ x, y ], [ x + 8, y + (w ? 8 : -8) ], [ x + 16, y + (w ? 12 : -12) ] ]), 1.8, 'DRAG HIM');
      return out;
     }
    }
    const D = FO_DOWN_BTN();
    add(K.tap(D.x, D.y), 1.4, 'TAP DOWN');
    return out;
   }
   if (F.phase === 'ready') {
    if (s === ST.WING && !F.hold && !F.target && foWings()[0]) {
     const [x, y] = body(foWings()[0]);
     add(K.hold(x, y), 1.6, 'HOLD A WING');
     return out;
    }
    add(K.hold(B.x, B.y), 1.4, 'THUMB HERE');
    return out;
   }
   if (F.phase === 'set') {
    add(K.mash(B.x, B.y), 1.2, 'MASH!');
    return out;
   }
   if (F.phase === 'go') {
    const k = Math.floor(rt() / .9) % 4, d = [ [ 0, -20 ], [ 20, 0 ], [ 0, 20 ], [ -20, 0 ] ][k];
    add(K.swipe(B.x, B.y, d[0], d[1]), .9, null);
    return out;
   }
   return out;
  }
  if (screen === 'live' && c && c.team === 'O' && G.ball && G.ball.state === 'held') {
   const m = mateFor(G, 'O', c), [gx, gy] = goalPt();
   if (s === ST.MOVE) {
    add(K.path([ [ LJ()[0], LJ()[1] ], [ LJ()[0] + 18, LJ()[1] ], [ LJ()[0] + 18, LJ()[1] - 14 ], [ LJ()[0], LJ()[1] - 14 ] ], true), 2.4, 'LEFT THUMB: DRAG');
    return out;
   }
   if (s === ST.PASS && m) {
    const [x, y] = body(m);
    add(K.tap(x, y), 1.4, 'TAP HIM');
    return out;
   }
   if (s === ST.CUT && m) {
    const [x, y] = body(m);
    add(K.swipe(x, y, 22, m.y < CY ? 8 : -8), 1.6, 'SWIPE HIM');
    return out;
   }
   if (s === ST.PICK && m) {
    const [x, y] = body(m);
    add(K.hold(x, y), 1.8, 'HOLD ON HIM');
    return out;
   }
   if (s === ST.SHOOT || s === ST.SHOT38) {
    add(K.pull(gx, gy, 28, false), 1.9, 'DRAG BACK, LET GO');
    return out;
   }
   if (s === ST.FD38) {
    add(K.pull(gx, gy, 26, true), 2, 'BACK, THEN BACK IN');
    return out;
   }
   if (s === ST.OVER || s === ST.UNDER || s === ST.SIDE) {
    const dy = s === ST.OVER ? -14 : s === ST.UNDER ? 14 : 0;
    add([ [ 0, gx, gy, 0 ], [ .1, gx, gy, 1 ], [ .45, gx - 24, gy, 1 ], [ .6, gx - 30, gy + dy, 1 ], [ .64, gx - 30, gy + dy, 0 ], [ 1, gx - 30, gy + dy, 0 ] ], 2, 'HOLD, SWIPE, LET GO');
    return out;
   }
   if (s === ST.OTS) {
    if (!inOtsZone(c)) {
     add(joyTo(-1, 0, 18), 1.8, 'LEFT THUMB: RUN UP');
     return out;
    }
    add(K.pull(gx, gy, 28, false), 1.8, 'DRAG BACK, LET GO');
    return out;
   }
   if (s === ST.AIR) {
    let q = null;
    try {
     q = window.SHOT26 && SHOT26.circlesOn() && SHOT26.circles()[0];
    } catch (e) {}
    const [ax, ay] = q ? scr(q.x, q.y) : [ gx, gy ];
    add(K.tap(ax, ay), 1.4, 'TAP THE NET');
    return out;
   }
   if (s === ST.DODGE || s === ST.SPLIT || s === ST.V20CUT) {
    const [lx, ly] = LJ(), [rx, ry] = RS(), up = Math.floor(rt() / 2.2) % 2 ? 1 : -1;
    add([ [ 0, lx, ly, 0 ], [ .08, lx, ly, 1 ], [ .35, lx + 16, ly, 1 ], [ .9, lx + 16, ly, 1 ], [ .95, lx + 16, ly, 0 ], [ 1, lx, ly, 0 ] ], 2.2, 'LEFT: RUN');
    add([ [ 0, rx, ry, 0 ], [ .4, rx, ry, 0 ], [ .45, rx, ry, 1 ], [ .7, rx, ry + 22 * up, 1 ], [ .74, rx, ry + 22 * up, 0 ], [ 1, rx, ry, 0 ] ], 2.2, 'RIGHT: SWIPE');
    return out;
   }
   if (s === ST.ROLL || s === ST.ROLL28 || s === ST.V20ROLL) {
    const [lx, ly] = LJ();
    add(K.path([ [ lx, ly ] ].concat(K.arc(lx + 10, ly, 10, Math.PI, Math.PI * 3, 10).slice(1))), 2.2, 'LEFT THUMB: DRAW A C');
    return out;
   }
   if (s === ST.SWIM || s === ST.TOE || s === ST.V20TOE) {
    const [lx, ly] = LJ(), [rx, ry] = RS(), swim = s === ST.SWIM;
    add([ [ 0, lx, ly, 0 ], [ .08, lx, ly, 1 ], [ .3, lx + 16, ly, 1 ], [ .9, lx + 16, ly, 1 ], [ .95, lx + 16, ly, 0 ], [ 1, lx, ly, 0 ] ], 2.4, 'LEFT: RUN');
    const arc = swim ? K.arc(rx, ry, 11, -Math.PI / 2, Math.PI / 2, 8) : K.arc(rx, ry, 11, -Math.PI / 2, -Math.PI * 1.5, 8);
    const k = [ [ 0, arc[0][0], arc[0][1], 0 ], [ .38, arc[0][0], arc[0][1], 0 ], [ .42, arc[0][0], arc[0][1], 1 ] ];
    arc.forEach((p, i) => {
     if (i) k.push([ .42 + .3 * i / (arc.length - 1), p[0], p[1], 1 ]);
    });
    const e = arc[arc.length - 1];
    k.push([ .76, e[0], e[1], 0 ], [ 1, e[0], e[1], 0 ]);
    add(k, 2.4, swim ? 'RIGHT: BACKWARDS C' : 'RIGHT: DRAW A C');
    return out;
   }
   if (s === ST.BULL) {
    const [rx, ry] = RS();
    add(joyTo(1, 0, 16), 2, 'LEFT: RUN');
    add(K.hold(rx, ry), 2, 'RIGHT: HOLD');
    return out;
   }
   if (s === ST.PB) {
    add(K.tap(25, 24), 1.4, 'TAP PLAYBOOK');
    return out;
   }
   if (window.V406B && V406B.on && typeof V406B.hand === 'function') {
    const h6 = V406B.hand();
    if (h6) {
     add(K.tap(h6.x, h6.y), 1.4, h6.label);
     return out;
    }
   }
   if (s === ST.CHIRP) {
    try {
     const y = H - 11 - sa2403Dy(H - 11, 11), w = CHIRP_BTN.w, x = chirpX18(y, w);
     add(K.tap(x + w / 2, y + 5), 1.4, 'TAP CHIRP');
    } catch (e) {}
    return out;
   }
   if (s === ST.CARRY || s === ST.COUNT) {
    add(joyTo(1, 0, 18), 1.8, 'LEFT THUMB: RUN IT UP');
    return out;
   }
   return out;
  }
  if (screen === 'live' && G.ball && G.ball.state === 'loose' && (s === ST.GB || s === ST.CHASE)) {
   const u = typeof ctrlOk === 'function' && G.ctrl ? G.ctrl : null, b = G.ball;
   if (u) add(joyTo(b.x - u.x, b.y - u.y, 18), 1.6, 'LEFT THUMB: RUN TO IT');
   return out;
  }
  if (screen === 'defense') {
   const d = G.dctl, car = G.dcar;
   if ((s === ST.CHECK || s === ST.STRIP) && d && car) {
    add(joyTo(car.x - d.x, car.y - d.y, 14), 1.8, 'LEFT: GET ON HIM');
    const [rx, ry] = RS();
    add([ [ 0, rx, ry, 0 ], [ .45, rx, ry, 0 ], [ .5, rx, ry, 1 ], [ .6, rx, ry, 0 ], [ .7, rx, ry, 1 ], [ .8, rx, ry, 0 ], [ 1, rx, ry, 0 ] ], 1.8, 'RIGHT: TAP');
    return out;
   }
   if (s === ST.HIT && d && car) {
    add(joyTo(car.x - d.x, car.y - d.y, 16), 2, 'LEFT: RUN AT HIM');
    const [rx, ry] = RS();
    add([ [ 0, rx, ry, 0 ], [ .3, rx, ry, 0 ], [ .34, rx, ry, 1 ], [ .8, rx, ry, 1 ], [ .84, rx, ry, 0 ], [ 1, rx, ry, 0 ] ], 2, 'RIGHT: HOLD, LET GO');
    return out;
   }
   if (s === ST.TAPSW && d) {
    const o2 = mateFor(G, 'O', d);
    if (o2) {
     const [x, y] = body(o2);
     add(K.tap(x, y), 1.4, 'TAP HIM');
    }
    return out;
   }
   const hold = G.dclear && G.dclear.holder;
   if ((s === ST.OUTLET || s === ST.ANY) && hold) {
    const o2 = mateFor(G, 'O', hold);
    if (o2) {
     const [x, y] = body(o2);
     add(K.tap(x, y), 1.4, 'TAP HIM');
    }
    return out;
   }
   if ((s === ST.GK || s === ST.POLE || s === ST.CARRY || s === ST.COUNT) && hold) {
    add(joyTo(1, 0, 18), 1.8, 'LEFT THUMB: CARRY IT');
    return out;
   }
  }
  return out;
 }
 let handHideUntil = 0;
 function drawHands() {
  const G = G0(), Tt = TT();
  if (!on('hand') || !G || !Tt || Tt.doneT > 0 || paused) return;
  try {
   if (typeof tutAsk !== 'undefined' && tutAsk) return;
   if (typeof tutFoHold18 === 'function' && tutFoHold18()) return;
  } catch (e) {}
  let down = false;
  try {
   for (const p of pointers.values()) if (!p.stale) down = true;
  } catch (e) {}
  if (down) {
   handHideUntil = rt() + 1;
   return;
  }
  if (rt() < handHideUntil) return;
  const L = gesture(G, Tt);
  if (!L.length) return;
  LOG.hand++;
  for (const h of L) {
   const p = rt() % h.per / h.per, q = at(h.keys, p);
   if (q.down) {
    let x0 = null, y0 = null;
    for (const k of h.keys) {
     if (k[0] > p) break;
     if (k[3] && x0 === null) {
      x0 = k[1];
      y0 = k[2];
     }
     if (!k[3]) x0 = null;
    }
    if (x0 !== null) trail(x0, y0, q.x, q.y);
    ring(q.x, q.y, 4 + rt() * 8 % 2, '#ffe14d', .85);
   }
   drawHand(q.x, q.y, q.down, .9);
   if (h.label) {
    const lx = Math.round(Math.min(W - textW(h.label) / 2 - 3, Math.max(textW(h.label) / 2 + 3, q.x + 3))), ly = Math.round(Math.min(H - 8, q.y + 17));
    rect(lx - textW(h.label) / 2 - 2, ly - 1, textW(h.label) + 4, 8, 'rgba(0,0,0,.6)');
    text(h.label, lx, ly, 1, '#ffe14d', 'center');
   }
  }
 }
 function drawFoPrompt() {
  if (!on('fo') || !foStep()) return;
  const F = game.fo, B = FO_BTN(), mid = Math.round(W / 2);
  if (F.phase === 'set') {
   const s = 'MASH! THEN SWIPE ON THE WHISTLE', w = textW(s) + 8;
   rect(B.x - w / 2, B.y - B.r - 22, w, 10, 'rgba(0,0,0,.75)');
   text(s, B.x, B.y - B.r - 20, 1, '#ffffff', 'center');
  }
  if (F.phase === 'go') {
   const s = 'SWIPE IN ANY DIRECTION!', w = textW(s, 2) + 12, y = 92, fl = Math.floor(rt() * 6) % 2;
   rect(mid - w / 2, y - 3, w, 20, 'rgba(0,0,0,.82)');
   rect(mid - w / 2, y - 3, w, 1, '#ffe14d');
   text(s, mid, y + 1, 2, fl ? '#ffe14d' : '#ffffff', 'center', '#000');
   const o = 8 + rt() * 20 % 6, r = B.r + o;
   [ [ 0, -1 ], [ 1, 0 ], [ 0, 1 ], [ -1, 0 ] ].forEach(([ux, uy]) => {
    arrowHead(B.x + ux * r, B.y + uy * r, ux, uy, '#ffe14d');
   });
  }
 }
 function drawSideGuide() {
  const Tt = TT();
  if (!on('dodge') || !Tt || screen !== 'live' || !DODGE_GUIDE().includes(Tt.step) || Tt.doneT > 0) return;
  const y = 62, l = Tt.step === ST.ROLL || Tt.step === ST.ROLL28 || Tt.step === ST.V20ROLL ? 'LEFT THUMB: MOVE + DRAW THE C' : 'LEFT THUMB: MOVE', r = Tt.step === ST.BULL ? 'RIGHT THUMB: HOLD' : Tt.step === ST.SWIM || Tt.step === ST.TOE || Tt.step === ST.V20TOE ? 'RIGHT THUMB: DRAW THE C' : Tt.step === ST.ROLL || Tt.step === ST.ROLL28 || Tt.step === ST.V20ROLL ? 'RIGHT THUMB: -' : 'RIGHT THUMB: SWIPE = DODGE';
  g.save();
  g.globalAlpha = .85;
  for (let yy = 72; yy < H - 30; yy += 4) {
   g.fillStyle = 'rgba(255,255,255,.35)';
   g.fillRect(Math.round(W / 2), yy, 1, 2);
  }
  const lw = textW(l) + 6, rw = textW(r) + 6;
  rect(Math.round(W / 4 - lw / 2), y - 2, lw, 9, 'rgba(0,0,0,.6)');
  text(l, Math.round(W / 4), y, 1, '#8fe3f0', 'center');
  rect(Math.round(W * 3 / 4 - rw / 2), y - 2, rw, 9, 'rgba(0,0,0,.6)');
  text(r, Math.round(W * 3 / 4), y, 1, '#ffe14d', 'center');
  g.restore();
 }
 function drawMine() {
  const G = G0(), Tt = G && G.tutorial;
  if (!Tt) return;
  if (!Tt.complete) {
   drawSideGuide();
   drawFoPrompt();
   drawHands();
   if (on('ots') && Tt.step === ST.OTS && screen === 'live' && !Tt.f.ots28 && G.carrier && G.carrier.team === 'O') {
    const s = inOtsZone(G.carrier) ? 'NOW: TOUCH THE GOAL, DRAG YOUR THUMB BACK, LET GO (DON\'T PUSH FORWARD)' : 'FIRST: LEFT THUMB - RUN UP TO THE PINK RING BESIDE THE CAGE', w = textW(s) + 8;
    rect(4, 40, w, 10, 'rgba(0,0,0,.65)');
    text(s, 8, 42, 1, inOtsZone(G.carrier) ? '#7dff7a' : '#ff9ade');
   }
   if (on('stuck') && track(Tt) !== 'air' && !isCard(Tt.step) && X.t >= X.hintAt && !(Tt.doneT > 0)) {
    const s = '< STUCK? TAP SKIP', sy = typeof sa2403Dy === 'function' ? sa2403Dy(H - 14, 13) : 0, x = 62, y = H - 14 - sy;
    if (Math.floor(rt() * 3) % 2) {
     rect(x - 2, y + 1, textW(s) + 4, 11, 'rgba(0,0,0,.75)');
     text(s, x, y + 4, 1, '#ffe14d');
    }
   }
   if (on('air') && track(Tt) === 'air') {
    const w = 54, h = 16, x = W - w - 4, y = 34;
    hit('SKIP AIR DIVE 4012', x, y, w, h, () => airSkip(), 'SKIP AIR DIVE TUTORIAL');
    rect(x, y + 2, w, h, '#000');
    rect(x, y, w, h, '#ffe14d');
    text('SKIP', x + w / 2, y + 4, 2, '#0b1a20', 'center');
    const t0 = Tt.air4012 || 0;
    if (t0 && rt() - t0 < 4) {
     const s = 'NEW MOVE UNLOCKED: AIR DIVE', s2 = legName() + ' AT X (BEHIND THE CAGE): TAP THE NET', ww = Math.max(textW(s, 2), textW(s2)) + 14, xx = Math.round(W / 2 - ww / 2);
     rect(xx, 56, ww, 30, 'rgba(0,0,0,.85)');
     rect(xx, 56, ww, 1, '#ffe14d');
     text(s, W / 2, 60, 2, '#ffe14d', 'center', '#000');
     text(s2, W / 2, 75, 1, '#ffffff', 'center');
    }
   }
  }
  if (X.msg && rt() < X.msg.until) {
   const s = X.msg.s, w = textW(s, 2) + 12, y = 62;
   rect(Math.round(W / 2 - w / 2), y - 3, w, 18, 'rgba(0,0,0,.8)');
   text(s, W / 2, y, 2, X.msg.col, 'center', '#000');
  }
 }
 wrapG('drawTutBtns231', function(o, a) {
  try {
   drawMine();
  } catch (e) {
   err(e, 'draw');
  }
  return o.apply(this, a);
 });
})();
