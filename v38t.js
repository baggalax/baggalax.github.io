(function() {
 'use strict';
 const on = () => !window.__rl_no38t && !window.__rl_v124gb && !window.__rl_no26 && !!window.SHOT26;
 if (!on()) return;
 if (typeof TUTX === 'undefined' || typeof TUT_MAIN_181 === 'undefined' || typeof tutSetup !== 'function' || typeof tutDone !== 'function') return;
 const rt = () => performance.now() / 1e3;
 const TS38 = TUTX.length, TFD38 = TS38 + 1;
 TUTX.push([ 'SHOOTING', 'TOUCH THE GOAL, PULL YOUR THUMB BACK (FARTHER = HARDER), LET GO = SHOT.' ], [ 'FACE DODGE', 'PULL BACK LIKE A SHOT, THEN BRING YOUR THUMB BACK + LET GO = FAKE.' ]);
 const HINT = {
  [TS38]: [ 'SLIDE UP / DOWN TO AIM. LINE ON A YELLOW CIRCLE = THAT CORNER. SCORE OR HIT THE CAGE.', 'MOUSE: CLICK THE GOAL, DRAG BACK (LEFT), LET GO.' ],
  [TFD38]: [ 'WAIT TILL HE RUNS AT YOU, THEN FAKE IT. HE BITES AND FLIES RIGHT PAST YOU.', 'MOUSE: CLICK THE GOAL, DRAG BACK, DRAG IT BACK TO THE GOAL, LET GO.' ]
 };
 const MAX_TRIES = 6;
 const mouse = () => {
  try {
   return window.__rl_38tMouse != null ? !!window.__rl_38tMouse : !!(window.matchMedia && matchMedia('(pointer: fine)').matches);
  } catch (e) {
   return false;
  }
 };
 let MAIN38 = null;
 function main38() {
  if (MAIN38) return MAIN38;
  const L = TUT_MAIN_181.slice(), i2 = L.indexOf(2);
  if (i2 >= 0) L[i2] = TS38; else L.splice(Math.max(0, L.indexOf(3)), 0, TS38);
  let at = L.indexOf(16);
  if (at < 0) at = L.indexOf(15) + 1;
  if (at <= 0) at = L.indexOf(TS38) + 1;
  L.splice(at, 0, TFD38);
  return MAIN38 = L;
 }
 const X = {
  T: null,
  setAt: 0,
  step: -1,
  tries: 0,
  pend: null,
  shots: 0,
  fds: 0,
  retryAt: 0,
  charger: null,
  chargeAt: 0,
  lostT: 0,
  log: []
 };
 const G0 = () => typeof game !== 'undefined' ? game : null;
 function mine() {
  const G = G0(), Tt = G && G.tutorial;
  if (!on() || !Tt || Tt.complete || (Tt.track || 'main') !== 'main') return 0;
  return Tt.step === TS38 || Tt.step === TFD38 ? Tt.step : 0;
 }
 function cue(s, col, life) {
  X.msg = {
   s: s,
   col: col || '#ffe14d',
   until: rt() + (life || 1.6)
  };
 }
 function dOf(c) {
  const G = G0();
  let d = G.players.find(p => p.team === 'D' && !p.gk && p.role !== 'G' && p.mark === c);
  if (!d) {
   let bd = 1e9;
   for (const q of G.players) if (q.team === 'D' && !q.gk && q.role !== 'G') {
    const dd = Math.hypot(q.x - c.x, q.y - c.y);
    if (dd < bd) {
     bd = dd;
     d = q;
    }
   }
  }
  return d;
 }
 function setup38(s) {
  const G = G0(), Tt = G.tutorial;
  if (Tt.t38s !== s) {
   Tt.t38s = s;
   X.tries = 0;
  }
  X.step = s;
  X.pend = null;
  X.retryAt = 0;
  X.lostT = 0;
  X.charger = null;
  const S = SHOT26.S;
  X.shots = S.shots || 0;
  X.fds = S.fds || 0;
  if (s === TS38) {
   const y = CY + (X.tries % 2 ? 16 : -16);
   setupPossession(GX - 100, y);
   G.run = null;
   const c = G.carrier;
   if (!c) return;
   const lx = GX - c.x, ly = CY - c.y, ll = Math.hypot(lx, ly) || 1;
   for (const d of G.players) {
    if (d.team !== 'D' || d.gk || d.role === 'G') continue;
    let mv = false;
    if (Math.hypot(d.x - c.x, d.y - c.y) < 40) {
     d.x -= 40;
     mv = true;
    }
    const t = ((d.x - c.x) * lx + (d.y - c.y) * ly) / (ll * ll), off = ((d.x - c.x) * ly - (d.y - c.y) * lx) / ll;
    if (t > -.1 && t < 1.05 && Math.abs(off) < 24) {
     const sg = off >= 0 ? 1 : -1, k = 24 - Math.abs(off) + 4;
     d.x += ly / ll * sg * k;
     d.y = Math.max(FT + 4, Math.min(FB - 4, d.y - lx / ll * sg * k));
     mv = true;
    }
    if (mv) {
     d.tx = d.x;
     d.ty = d.y;
     d._p26 = [ d.x, d.y ];
     d._v26 = [ 0, 0 ];
    }
    d.react = 3;
   }
  } else {
   const y = CY + (X.tries % 2 ? 12 : -12);
   setupPossession(GX - 112, y);
   G.run = null;
   const c = G.carrier;
   if (!c) return;
   const d = dOf(c);
   for (const q of G.players) if (q.team === 'D' && !q.gk && q.role !== 'G' && q !== d && Math.hypot(q.x - c.x, q.y - c.y) < 70) {
    q.x = Math.max(DGX + 20, q.x - 50);
    q.tx = q.x;
    q.ty = q.y;
    q.react = 4;
    q._p26 = [ q.x, q.y ];
    q._v26 = [ 0, 0 ];
   }
   if (d) {
    d.x = c.x + 46;
    d.y = c.y + (c.y < CY ? 6 : -6);
    d.tx = d.x;
    d.ty = d.y;
    d.stun = .6;
    d.ovr26 = null;
    d.charge26 = 0;
    d._p26 = [ d.x, d.y ];
    d._v26 = [ 0, 0 ];
    X.charger = d;
    X.chargeAt = rt() + .7;
   }
  }
  X.setAt = rt();
  X.log.push({
   s: s,
   tries: X.tries,
   at: +rt().toFixed(2)
  });
 }
 function retry(msg) {
  X.tries++;
  const Tt = G0() && G0().tutorial;
  if (X.tries >= MAX_TRIES) {
   tutFlag(X.step === TS38 ? 'shot38' : 'fd38', 'help');
   try {
    const c = G0().carrier;
    if (c) addFx('txt', c.x, c.y - 34, {
     s: 'KEEP PRACTICING IT!',
     col: '#ffe14d',
     life: 1.4
    });
   } catch (e) {}
   return;
  }
  tutSetup();
  if (Tt) Tt.t38s = X.step;
  cue(msg || 'TRY AGAIN', '#ff9a8a', 2.6);
 }
 function tick(dt) {
  const s = mine();
  if (!s) {
   X.step = -1;
   return;
  }
  const G = G0(), Tt = G.tutorial;
  if (Tt.doneT > 0 || Tt.f.shot38 || Tt.f.fd38) return;
  if (X.step !== s) return;
  const S = SHOT26.S;
  if (X.retryAt) {
   if (rt() >= X.retryAt) {
    const m = X.retryMsg;
    X.retryAt = 0;
    retry(m);
   }
   return;
  }
  const later = (msg, w) => {
   X.retryAt = rt() + (w || 1.1);
   X.retryMsg = msg;
  };
  if (s === TS38) {
   if (screen === 'live') for (const d of G.players) if (d.team === 'D' && !d.gk && d.role !== 'G') d.react = Math.max(d.react || 0, .3);
   if ((S.shots || 0) !== X.shots) {
    X.shots = S.shots || 0;
    X.pend = S.last || {};
   }
   if (X.pend && (screen === 'live' || screen === 'banner' || screen === 'defense')) {
    const o = SHOT26.outcome(), c = G.carrier, gkHas = G.ball && G.ball.state === 'held' && c && (c.gk || c.role === 'G');
    if (o) {
     const p = X.pend;
     X.pend = null;
     X.log.push({
      s: s,
      o: o,
      circle: p.circle,
      onNet: p.onNet,
      power: p.power,
      type: p.type
     });
     if (o === 'goal' || o === 'save' || gkHas && p.onNet) {
      tutFlag('shot38', o);
      cue(o === 'goal' ? p.circle ? 'CORNER! THAT\'S THE SHOT' : 'GOAL! THAT\'S THE SHOT' : 'ON GOAL! THAT\'S THE SHOT', '#7dff7a', 1.4);
      return;
     }
     later(o === 'short' ? 'TOO SOFT - PULL BACK FARTHER' : o === 'blocked' ? 'BLOCKED - FIND A LANE AND TRY AGAIN' : 'MISSED - PUT THE LINE ON THE GOAL');
     cue(o === 'short' ? 'TOO SOFT!' : o === 'blocked' ? 'BLOCKED!' : 'MISSED!', '#ff9a8a', 1);
     return;
    }
   }
   if (!X.pend && (screen !== 'live' || !G.carrier || G.carrier.team !== 'O')) {
    X.lostT += dt;
    if (X.lostT > .8) later('LOST IT - TRY AGAIN', .1);
   } else X.lostT = 0;
   return;
  }
  if ((S.fds || 0) !== X.fds) {
   X.fds = S.fds || 0;
   const f = S.fd || {};
   X.log.push({
    s: s,
    fd: 1,
    overrun: f.overrun || 0,
    near: (f.near || []).length,
    since: +(rt() - X.setAt).toFixed(2)
   });
   if (f.overrun > 0) {
    tutFlag('fd38', true);
    cue('HE BIT! THAT\'S THE FACE DODGE', '#7dff7a', 1.4);
    return;
   }
   later(f.near && f.near.length ? 'WAIT FOR HIM TO RUN AT YOU, THEN FAKE IT' : 'TOO EARLY - LET HIM GET CLOSER FIRST', .9);
   cue('NOT YET!', '#ff9a8a', .9);
   return;
  }
  if ((S.shots || 0) !== X.shots) {
   X.shots = S.shots || 0;
   later('THAT WAS A SHOT - BRING YOUR THUMB BACK, THEN LET GO', 1.2);
   return;
  }
  const d = X.charger, c = G.carrier;
  if (screen !== 'live' || !c || c.team !== 'O') {
   X.lostT += dt;
   if (X.lostT > .8) later('LOST IT - TRY AGAIN', .1);
   return;
  }
  X.lostT = 0;
  if (d && rt() >= X.chargeAt && !d.ovr26 && G.players.includes(d)) {
   const dx = c.x - d.x, dy = c.y - d.y, L = Math.hypot(dx, dy) || 1;
   if (L < 7) {
    d.charge26 = 0;
    later('TOO LATE - FAKE IT WHILE HE IS COMING', .4);
   } else {
    const v = 45 * dt;
    d.x += dx / L * v;
    d.y += dy / L * v;
    d.tx = d.x;
    d.ty = d.y;
    d.stun = .12;
    d.charge26 = 45;
   }
  }
 }
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function() {
   return f.call(this, o, arguments);
  };
  return true;
 };
 wrapG('tutList', function(o, a) {
  const L = o.apply(this, a);
  return on() && L === TUT_MAIN_181 ? main38() : L;
 });
 wrapG('tutDone', function(o, a) {
  const i = a[0];
  if (on() && (i === TS38 || i === TFD38)) {
   const G = G0(), f = G && G.tutorial && G.tutorial.f;
   return !!(f && (i === TS38 ? f.shot38 : f.fd38));
  }
  return o.apply(this, a);
 });
 wrapG('tutSetup', function(o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0(), Tt = G && G.tutorial;
   if (on() && Tt) {
    if (Tt.complete && (Tt.track || 'main') === 'main' && !LS.get('tut26', false)) LS.set('tut26', true); else if (!Tt.complete && (Tt.step === TS38 || Tt.step === TFD38)) setup38(Tt.step); else X.step = -1;
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 wrapG('tutSkipAll', function(o, a) {
  const r = o.apply(this, a);
  try {
   if (on() && LS.get('tutDone', false) && !LS.get('tut26', false)) LS.set('tut26', true);
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 wrapG('step', function(o, a) {
  const r = o.apply(this, a);
  try {
   if (mine()) tick(a[0] || 0);
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 wrapG('drawTutorial', function(o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0(), Tt = G && G.tutorial;
   if (on() && Tt && !Tt.complete && (Tt.track || 'main') === 'main' && screen !== 'faceoff') {
    const L = tutList(), n = L.length, pos = Math.max(0, L.indexOf(Tt.step)), st = TUTX[Math.min(Tt.step, TUTX.length - 1)];
    const hd = pos + 1 + '/' + n + ' ' + st[0], tw = textW(hd), d0 = W - 12 - n * 7;
    if (8 + tw + 1 > d0) {
     rect(6, 19 + 2, tw + 4, 8, '#0d1216');
     text(hd, 8, 19 + 3, 1, '#ffe14d');
    }
   }
   const s = mine();
   if (s && Tt.doneT <= 0 && screen !== 'faceoff') {
    let yy = 19 + 21;
    const line1 = (l, col) => {
     const w = textW(l) + 8;
     rect(4, yy, w, 10, 'rgba(0,0,0,.6)');
     text(l, 8, yy + 2, 1, col);
     yy += 10;
    };
    const line = (l, col) => {
     const max = W - 14;
     if (textW(l) <= max) return line1(l, col);
     const ws = l.split(' ');
     let cur = '';
     for (const w of ws) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && textW(t) > max) {
       line1(cur, col);
       cur = w;
      } else cur = t;
     }
     if (cur) line1(cur, col);
    };
    for (const l of HINT[s]) {
     const ms = l.startsWith('MOUSE');
     if (ms && !mouse()) continue;
     line(l, ms ? '#ffd23a' : '#8fe3f0');
    }
    if (X.tries > 0) line('TRY ' + (X.tries + 1) + ' OF ' + MAX_TRIES, '#ffffff');
    if (X.msg && rt() < X.msg.until) line(X.msg.s, X.msg.col);
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 if (window.TUT26) {
  const k0 = TUT26.keeperOff, f0 = TUT26.forceOverrun;
  if (typeof k0 === 'function') TUT26.keeperOff = function() {
   return k0.apply(this, arguments) || mine() === TS38;
  };
  if (typeof f0 === 'function') TUT26.forceOverrun = function() {
   return f0.apply(this, arguments) || mine() === TFD38;
  };
 }
 window.V38T = {
  on: on,
  TS38: TS38,
  TFD38: TFD38,
  X: X,
  main38: main38,
  mine: mine,
  MAX_TRIES: MAX_TRIES,
  HINT: HINT
 };
})();
