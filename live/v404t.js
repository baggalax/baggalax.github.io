
// v404t.js - V40.0.4: PLAY DESIGNER "HOW TO" (animated pointing hand over the real buttons),
// tutorial playmaker step on the new designer, and tutorial / coach / help text that matches tonight's game changes.
// Kill switch: window.__rl_no404t (set before load = today's behavior).
(function() {
 'use strict';
 const OFF = () => !!(window.__rl_no404t || window.__rl_v124gb);
 const LOG = { opened: [], steps: 0, tut: [], txt: [], errs: [] };
 window.V404T = { on: () => false, LOG: LOG };
 if (OFF()) return;
 const need = [ 'openPlaymaker', 'drawPlaymaker', 'pmDown', 'pmMove', 'pmUp', 'pmTick', 'pmSetCat' ];
 if (need.some(n => typeof window[n] !== 'function')) return;
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   console.error(e);
  } catch (x) {}
 };
 const rt = () => performance.now() / 1e3;
 const PDON = () => !!(window.PD42 && PD42.on && PD42.on());
 const DD = () => window.PD42 && PD42.D ? PD42.D() : null;
 const KEY = 'rl_pdhelp404';
 const seen = () => {
  try {
   return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch (e) {
   return {};
  }
 };
 const markSeen = k => {
  try {
   const s = seen();
   s[k] = 1;
   localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {}
 };
 // first-time auto open: real phones always; headless test browsers only when asked (same rule the tutorial uses)
 const autoOK = () => !navigator.webdriver || !!window.__rl_pdhelpAuto;
 const HS = {
  open: false,
  kind: null,
  i: 0,
  t0: 0,
  why: '',
  tut: false
 };
 function kindOf() {
  const d = DD();
  if (!d || typeof PM === 'undefined' || !PM) return null;
  if (d.mode === 'sets') return 'SETS';
  return pmCat(PM.play);
 }
 // ---------- hand sprite (same pixel hand the tutorial uses) ----------
 const HAND = [ '...##......', '..#ww#.....', '..#ww#.....', '..#ww###...', '..#ww#ww##.', '###ww#ww#w#', '#ww#wwwww#w#', '#wwwwwwwwww#', '.#wwwwwwwww#', '..#wwwwwww#.', '...#wwwwww#.', '...#wwwwww#.', '...########.' ];
 const HCOL = {
  '#': '#0b1a20',
  w: '#ffe9c9'
 };
 function drawHand(x, y, down) {
  const ox = Math.round(x) - 3, oy = Math.round(y) + (down ? 0 : 2);
  g.save();
  g.globalAlpha = .96;
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
 function dotLine(x0, y0, x1, y1, col, step) {
  const d = Math.hypot(x1 - x0, y1 - y0);
  if (d < 1) return;
  for (let i = 0; i <= d; i += step || 2) {
   const t = i / d;
   rect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1, col);
  }
 }
 function outline(r, col, pad) {
  const p = pad == null ? 1 : pad, x = Math.round(r.x - p), y = Math.round(r.y - p), w = Math.round(r.w + p * 2), h = Math.round(r.h + p * 2);
  rect(x, y, w, 1, col);
  rect(x, y + h - 1, w, 1, col);
  rect(x, y, 1, h, col);
  rect(x + w - 1, y, 1, h, col);
 }
 function ringAt(x, y, r, frac, col) {
  try {
   ringPx(Math.round(x), Math.round(y), r, frac, col);
  } catch (e) {}
 }
 // keyframes: [t(0..1), x, y, down]
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
  tap: (x, y) => [ [ 0, x + 10, y + 14, 0 ], [ .35, x, y, 0 ], [ .42, x, y, 1 ], [ .6, x, y, 1 ], [ .66, x, y, 0 ], [ .9, x + 10, y + 14, 0 ], [ 1, x + 10, y + 14, 0 ] ],
  hold: (x, y) => [ [ 0, x + 10, y + 14, 0 ], [ .15, x, y, 0 ], [ .2, x, y, 1 ], [ .78, x, y, 1 ], [ .82, x, y, 0 ], [ 1, x + 10, y + 14, 0 ] ],
  drag: (x, y, x2, y2) => [ [ 0, x + 8, y + 12, 0 ], [ .15, x, y, 0 ], [ .2, x, y, 1 ], [ .65, x2, y2, 1 ], [ .72, x2, y2, 0 ], [ .9, x2 + 6, y2 + 10, 0 ], [ 1, x2 + 6, y2 + 10, 0 ] ]
 };
 // ---------- geometry of the real designer ----------
 const view = () => {
  try {
   return pmView();
  } catch (e) {
   return null;
  }
 };
 function scr(wx, wy) {
  const v = view();
  return v ? [ v.ox + wx * v.k, v.oy + wy * v.k ] : [ wx - Math.round(camX), wy ];
 }
 const vk = () => {
  const v = view();
  return v ? v.k : 1;
 };
 function curPos() {
  const d = DD();
  if (d && d.phase === 'play' && d.live && d.live.pos) return d.live.pos;
  return PM && PM.play && PM.play.start || [];
 }
 function guyXY(i) {
  const p = curPos()[i];
  if (!p) return [ W / 2, H / 2 ];
  return scr(p[0], p[1] - 6);
 }
 const sab = () => typeof sa2403Dy === 'function' ? sa2403Dy(H - 16, 15) : 0;
 const barY = () => H - 17 - (typeof sa2403Dy === 'function' ? sa2403Dy(H - 17, 17) : 0);
 let SPECS = [];
 const spec = lab => SPECS.find(s => s.label === lab) || null;
 function barLayout(labels) {
  const out = {};
  let bx = W - 2;
  const y = H - 16 - sab();
  for (const l of labels.slice().reverse()) {
   const w = textW(l, 1) + 10;
   bx -= w;
   out[l] = {
    x: bx,
    y: y,
    w: w,
    h: 13,
    label: l
   };
   bx -= 3;
  }
  return out;
 }
 const TABS = () => (typeof PM_CATS !== 'undefined' ? PM_CATS : [ 'OFFENSE', 'MAN-UP', 'END LINE', 'CLEAR', 'RIDES', 'D' ]).concat([ 'SETS' ]);
 function tabRect(c) {
  const s = spec('TAB ' + c);
  if (s) return {
   x: s.x,
   y: s.y,
   w: s.w,
   h: s.h,
   real: true
  };
  const T = TABS(), tw = Math.floor((W - 4) / T.length), i = Math.max(0, T.indexOf(c));
  return {
   x: 2 + i * tw,
   y: 18,
   w: tw - 2,
   h: 10,
   real: false
  };
 }
 // a button of the bottom bar: the real one if it is on screen now, else where it shows up in that step
 function btnRect(label, layout) {
  const s = spec(label);
  if (s && s.y > H / 2) return {
   x: s.x,
   y: s.y,
   w: s.w,
   h: s.h,
   real: true
  };
  const L = barLayout(layout || [ label ]);
  return Object.assign({
   real: false
  }, L[label] || L[Object.keys(L)[0]]);
 }
 function topRect(label) {
  const s = spec(label);
  return s && s.y < 17 ? {
   x: s.x,
   y: s.y,
   w: s.w,
   h: s.h,
   real: true
  } : null;
 }
 let EXCL = null;
 function guysFree(y0, y1) {
  const pos = curPos(), cat = kindOf();
  let n = 0;
  pos.forEach((q, i) => {
   if (cat === 'D' && i === 6) return;
   const [x, y] = scr(q[0], q[1] - 6);
   if (x > 14 && x < W - 14 && y > 34 && y < barY() - 12 && !(y > y0 - 8 && y < y1 + 12)) n++;
  });
  return n;
 }
 function demoGuys() {
  const pos = curPos(), cat = kindOf(), ok = [], all = [];
  pos.forEach((q, i) => {
   let gk = false;
   try {
    gk = typeof pmRole === 'function' && pmRole(i) === 'G';
   } catch (e) {}
   if (cat === 'D' && i === 6) gk = true;
   const [x, y] = scr(q[0], q[1] - 6);
   const ex = EXCL && y > EXCL.y0 - 8 && y < EXCL.y1 + 12;
   if (!gk && x > 14 && x < W - 14 && y > 34 && y < barY() - 12) (ex ? all : ok).push([ i, x, y ]);
  });
  if (ok.length < 2) ok.push(...all.sort((u, v) => Math.abs(u[2] - (EXCL ? (EXCL.y0 + EXCL.y1) / 2 : 0)) < Math.abs(v[2] - (EXCL ? (EXCL.y0 + EXCL.y1) / 2 : 0)) ? 1 : -1));
  if (!ok.length) return [ 0, 1 ];
  const cx = W / 2, cy = EXCL ? (EXCL.y0 > 40 ? (34 + EXCL.y0) / 2 : (EXCL.y1 + barY()) / 2) : (30 + barY()) / 2;
  ok.sort((a, b) => Math.hypot(a[1] - cx, a[2] - cy) - Math.hypot(b[1] - cx, b[2] - cy));
  const a = ok[0];
  let b = ok.slice(1).sort((u, v) => Math.hypot(u[1] - a[1], u[2] - a[2]) - Math.hypot(v[1] - a[1], v[2] - a[2])).find(u => Math.hypot(u[1] - a[1], u[2] - a[2]) > 14);
  return [ a[0], b ? b[0] : ok[1] ? ok[1][0] : a[0] ];
 }
 // ---------- gestures (each one: {dur, keys(), fx(p,q), pts(), mock}) ----------
 function gTap(rf, layout, label) {
  return {
   dur: 1.5,
   label: label,
   rect: rf,
   layout: layout,
   keys: () => {
    const r = rf();
    return K.tap(r.x + r.w / 2, r.y + r.h / 2 + 1);
   },
   fx: (p, q) => {
    const r = rf(), on = q.down;
    outline(r, on ? '#ffffff' : Math.floor(rt() * 4) % 2 ? '#ffe14d' : '#ff9a4a', 1);
    outline(r, 'rgba(0,0,0,.6)', 2);
   }
  };
 }
 function gDrag(iF, dx, dy0) {
  const P = () => {
   const dy = EXCL && EXCL.y0 > 40 ? -Math.abs(dy0) : Math.abs(dy0);
   const i = iF(), [x, y] = guyXY(i);
   const x2 = Math.max(10, Math.min(W - 10, x + dx)), y2 = Math.max(34, Math.min(barY() - 10, y + dy));
   return [ x, y, x2, y2 ];
  };
  return {
   dur: 2,
   label: 'DRAG',
   guys: true,
   keys: () => {
    const [x, y, x2, y2] = P();
    return K.drag(x, y, x2, y2);
   },
   pts: () => {
    const p = P();
    return [ [ p[0], p[1] ], [ p[2], p[3] ] ];
   },
   fx: (p, q) => {
    const [x, y] = P(), k = vk();
    ringAt(x, y, Math.round(10 * k), 1, 'rgba(255,225,77,.55)');
    if (q.down || p > .6) {
     dotLine(x, y, q.x, q.y, '#ffe14d', 2);
     ringAt(q.x, q.y, Math.round(9 * k), 1, '#ffe14d');
     rect(Math.round(q.x) - 2, Math.round(q.y) - 3, 5, 7, 'rgba(44,196,220,.85)');
     rect(Math.round(q.x) - 1, Math.round(q.y) - 5, 3, 2, 'rgba(255,233,201,.9)');
    }
   }
  };
 }
 function gHold(iF, ball) {
  return {
   dur: 2,
   label: 'HOLD',
   guys: true,
   keys: () => {
    const [x, y] = guyXY(iF());
    return K.hold(x, y);
   },
   pts: () => [ guyXY(iF()) ],
   fx: (p, q) => {
    const [x, y] = guyXY(iF()), k = vk(), f = Math.max(0, Math.min(1, (p - .2) / .38));
    if (q.down) ringAt(x, y, Math.round(12 * k), f, '#ffe14d');
    if (f >= 1 && p < .95) {
     ringAt(x, y, Math.round(13 * k), 1, '#7dff7a');
     if (ball) {
      rect(Math.round(x) + 4, Math.round(y) - 2, 3, 3, '#ffffff');
      rect(Math.round(x) + 4, Math.round(y) + 1, 3, 1, '#0b1a20');
     }
    }
   }
  };
 }
 const JOY = () => [ Math.round(W * .17), Math.round(EXCL && EXCL.y0 > 40 ? Math.max(48, EXCL.y0 - 26) : barY() - 26) ];
 function gJoy(iF, dx, dy0) {
  const DY = () => EXCL && EXCL.y0 > 40 ? -Math.abs(dy0) : Math.abs(dy0);
  return {
   dur: 2.4,
   label: 'LEFT THUMB',
   guys: true,
   keys: () => {
    const [x, y] = JOY(), dy = DY();
    return [ [ 0, x + 8, y + 12, 0 ], [ .12, x, y, 0 ], [ .17, x, y, 1 ], [ .35, x + dx, y + dy, 1 ], [ .82, x + dx, y + dy, 1 ], [ .86, x + dx, y + dy, 0 ], [ 1, x + dx + 8, y + dy + 12, 0 ] ];
   },
   pts: () => {
    const [x, y] = JOY(), G = guyXY(iF()), dy = DY();
    return [ [ x, y ], [ x + dx, y + dy ], G, [ G[0] + dx * 2, G[1] + dy * 2 ] ];
   },
   fx: (p, q) => {
    const [x, y] = JOY(), [gx, gy] = guyXY(iF()), k = vk(), dy = DY();
    ringAt(gx, gy, Math.round(12 * k), 1, '#7dff7a');
    if (q.down) {
     ringAt(x, y, 14, 1, 'rgba(255,255,255,.55)');
     ringAt(q.x, q.y, 5, 1, '#ffe14d');
    }
    const run = Math.max(0, Math.min(1, (p - .3) / .55)), L = Math.hypot(dx, dy) || 1, len = 34 * run;
    if (run > 0) {
     const ex = gx + dx / L * len, ey = gy + dy / L * len;
     dotLine(gx, gy, ex, ey, '#7dff7a', 2);
     rect(Math.round(ex) - 2, Math.round(ey) - 3, 5, 7, 'rgba(44,196,220,.9)');
     rect(Math.round(ex) - 1, Math.round(ey) - 5, 3, 2, 'rgba(255,233,201,.9)');
    }
   }
  };
 }
 function gPass(aF, bF) {
  return {
   dur: 2.2,
   label: 'TAP',
   guys: true,
   two: true,
   keys: () => {
    const [x, y] = guyXY(bF());
    return K.tap(x, y);
   },
   pts: () => [ guyXY(aF()), guyXY(bF()) ],
   fx: (p, q) => {
    const [ax, ay] = guyXY(aF()), [bx, by] = guyXY(bF()), k = vk();
    const pos = curPos();
    pos.forEach((qq, i) => {
     if (i === aF()) return;
     const [x, y] = scr(qq[0], qq[1] - 6);
     if (EXCL && y > EXCL.y0 - 12 && y < EXCL.y1 + 12) return;
     ringAt(x, y, Math.round(11 * k), 1, 'rgba(125,255,122,.45)');
    });
    ringAt(ax, ay, Math.round(12 * k), 1, '#ffe14d');
    const f = Math.max(0, Math.min(1, (p - .45) / .3));
    const bxx = ax + (bx - ax) * f, byy = ay + (by - ay) * f - Math.sin(f * Math.PI) * 8;
    if (f > 0 && f < 1) dotLine(ax, ay, bxx, byy, 'rgba(255,225,77,.8)', 3);
    rect(Math.round(bxx) + 3, Math.round(byy) - 1, 3, 3, '#ffffff');
    if (f >= 1) ringAt(bx, by, Math.round(13 * k), 1, '#7dff7a');
   }
  };
 }
 // ---------- the help pages ----------
 const LAY = {
  set: [ 'START STAGE 1' ],
  stage: [ 'GO TO STAGE 2', 'ADD BALL' ],
  ball: [ 'START PLAY' ],
  done: [ 'PREVIEW', 'SAVE' ],
  clear: [ 'SAVE' ],
  rides: [ 'MAN', 'ZONE', 'SAVE' ],
  d: [ 'MAN', 'ZONE', 'SLIDE AJ', 'SLIDE CREASE', 'SAVE' ],
  sets: [ 'SAVE SET' ]
 };
 const A = () => demoGuys()[0], B = () => demoGuys()[1];
 function pagesFor(kind) {
  const isPlay = kind === 'OFFENSE' || kind === 'MAN-UP' || kind === 'END LINE';
  const tabStep = {
   t: 'THE TABS (TOP ROW)',
   l: [ 'TAP A TAB TO PICK WHAT YOU MAKE.', 'OFFENSE, MAN-UP, END LINE = PLAYS YOU CALL IN GAMES.', 'CLEAR, RIDES, D, SETS = SHAPES. THEY JUST HAPPEN.' ],
   g: [ gTap(() => tabRect(kind)) ],
   tabs: true
  };
  const back = PM && PM.origin === 'menu' ? 'PLAYS' : 'CANCEL';
  const topStep = {
   t: 'THE TOP BAR',
   l: [ 'UNDO = TAKE BACK A STEP. CLEAR = START OVER.', back === 'PLAYS' ? 'PLAYS = YOUR SAVED PLAYS. BACK = LEAVE.' : 'CANCEL = LEAVE WITHOUT SAVING.', 'HOW TO = THIS HELP, ANY TIME.' ],
   g: [ gTap(() => topRect('UNDO') || {
    x: W - 113,
    y: 2,
    w: 34,
    h: 13
   }), gTap(() => topRect('CLEAR') || {
    x: W - 76,
    y: 2,
    w: 34,
    h: 13
   }), gTap(() => topRect(back) || {
    x: W - 39,
    y: 2,
    w: 34,
    h: 13
   }), gTap(() => helpRect()) ]
  };
  if (isPlay) {
   const el = kind === 'END LINE', mu = kind === 'MAN-UP';
   const P = [ tabStep ];
   P.push({
    t: '1. SET',
    l: el ? [ 'DRAG EACH GUY TO WHERE HE STARTS.', 'END LINE: ONE GUY STARTS IN THE CORNER.', 'THE CORNER GUY ALWAYS STARTS WITH THE BALL.' ] : mu ? [ 'DRAG EACH GUY TO WHERE HE STARTS.', 'MAN-UP = YOUR 6 VS THEIR 5 IN A BOX + 1.', 'THE GHOST D SHOWS WHERE THEY STAND.' ] : [ 'DRAG EACH GUY TO WHERE HE STARTS.', 'THE GHOST D SHOWS WHERE THEY STAND.' ],
    g: [ gDrag(A, 22, 14) ]
   });
   P.push({
    t: '2. START STAGE 1',
    l: [ 'EVERYONE SET? TAP START STAGE 1.', 'A STAGE = GUYS WHO RUN AT THE SAME TIME.' ],
    g: [ gTap(() => btnRect('START STAGE 1', LAY.set), LAY.set) ]
   });
   P.push({
    t: 'HOLD A GUY',
    l: [ 'HOLD YOUR FINGER ON A GUY.', 'THE RING FILLS = NOW YOU CONTROL HIM.' ],
    g: [ gHold(A) ]
   });
   P.push({
    t: 'RUN HIM',
    l: [ 'PUT YOUR LEFT THUMB DOWN ANYWHERE + DRAG.', 'HE RUNS THAT WAY. THE RUN IS RECORDED.', 'HOLD ANOTHER GUY TO SWITCH TO HIM.' ],
    g: [ gJoy(A, 12, -8) ]
   });
   P.push({
    t: 'MORE STAGES',
    l: [ 'GO TO STAGE 2 = RUNS THAT START', 'WHEN STAGE 1 ENDS. UP TO 6 STAGES.' ],
    g: [ gTap(() => btnRect('GO TO STAGE 2', LAY.stage), LAY.stage) ]
   });
   P.push({
    t: '3. ADD BALL',
    l: el ? [ 'TAP ADD BALL.', 'THE CORNER GUY GETS IT BY HIMSELF.' ] : [ 'TAP ADD BALL.', 'THEN HOLD THE GUY WHO STARTS WITH IT.' ],
    g: el ? [ gTap(() => btnRect('ADD BALL', LAY.stage), LAY.stage) ] : [ gTap(() => btnRect('ADD BALL', LAY.stage), LAY.stage), gHold(B, true) ]
   });
   P.push({
    t: '4. START PLAY',
    l: [ 'TAP START PLAY. READY... GO!', 'EVERYONE RUNS HIS STAGES.', 'YOUR LEFT THUMB MOVES THE GUY WITH THE BALL.' ],
    g: [ gTap(() => btnRect('START PLAY', LAY.ball), LAY.ball), gJoy(B, 10, 8) ]
   });
   P.push({
    t: 'PASS',
    l: [ 'TAP A TEAMMATE = PASS. NOW YOU RUN THE CATCHER.', 'EVERYONE KEEPS RUNNING TO HIS SPOTS,', 'EVEN AFTER A PASS.' ],
    g: [ gPass(B, A) ]
   });
   P.push({
    t: '5. PREVIEW + SAVE',
    l: [ 'PREVIEW = WATCH THE WHOLE PLAY.', 'SAVE = NAME IT. IT GOES TO YOUR PLAYS.' ],
    g: [ gTap(() => btnRect('PREVIEW', LAY.done), LAY.done), gTap(() => btnRect('SAVE', LAY.done), LAY.done) ]
   });
   P.push({
    t: 'IN A GAME',
    l: [ 'TAP PLAYBOOK, PICK YOUR PLAY: SET, THEN RUN.', mu ? 'MAN-UP: CLOSEST SPOTS, PASS TO THE STARTER.' : el ? 'END LINE PLAYS START IN THE SET.' : 'YOU STILL MAKE EVERY PASS + THE SHOT.', mu || el ? 'YOU STILL MAKE EVERY PASS + THE SHOT.' : '' ].filter(Boolean),
    g: [],
    chips: [ 'SET', 'RUN' ]
   });
   P.push(topStep);
   return P;
  }
  const P = [ tabStep ];
  if (kind === 'SETS') {
   P.push({
    t: 'DRAG INTO A SHAPE',
    l: [ 'DRAG YOUR 6 GUYS INTO A SHAPE.' ],
    g: [ gDrag(A, 20, 12) ]
   });
   P.push({
    t: 'SAVE SET',
    l: [ 'TAP SAVE SET + NAME IT.', 'IT BECOMES YOUR OFFENSE SET (PLAYBOOK > SETS).' ],
    g: [ gTap(() => btnRect('SAVE SET', LAY.sets), LAY.sets) ]
   });
   P.push({
    t: 'IN A GAME',
    l: [ 'YOUR GUYS FLOW INTO YOUR SET ON THEIR OWN', 'AFTER EVERY CLEAR + KEEP PLAYING NORMAL.', 'NO SET BUTTON.' ],
    g: []
   });
  } else if (kind === 'CLEAR') {
   P.push({
    t: 'DRAG INTO A SHAPE',
    l: [ 'DRAG YOUR GUYS INTO YOUR CLEAR SHAPE.', 'FULL FIELD - ALL 10 OF YOUR GUYS.' ],
    g: [ gDrag(A, 20, 12) ]
   });
   P.push({
    t: 'SAVE',
    l: [ 'TAP SAVE + NAME IT.' ],
    g: [ gTap(() => btnRect('SAVE', LAY.clear), LAY.clear) ]
   });
   P.push({
    t: 'IN A GAME',
    l: [ 'PICK IT IN A TIMEOUT (CLEAR). WHEN YOU CLEAR,', 'YOUR GUYS FLOW INTO IT ON THEIR OWN', 'AND PLAY NORMAL. NO SET BUTTON.' ],
    g: []
   });
  } else if (kind === 'RIDES') {
   P.push({
    t: 'DRAG INTO A SHAPE',
    l: [ 'DRAG YOUR RIDERS INTO A SHAPE.' ],
    g: [ gDrag(A, -20, 12) ]
   });
   P.push({
    t: 'MAN OR ZONE',
    l: [ 'MAN = EACH RIDER TAKES THE CLOSEST GUY.', 'ZONE = EACH RIDER HOLDS HIS AREA.' ],
    g: [ gTap(() => btnRect('MAN', LAY.rides), LAY.rides), gTap(() => btnRect('ZONE', LAY.rides), LAY.rides) ]
   });
   P.push({
    t: 'SAVE',
    l: [ 'TAP SAVE + NAME IT.' ],
    g: [ gTap(() => btnRect('SAVE', LAY.rides), LAY.rides) ]
   });
   P.push({
    t: 'IN A GAME',
    l: [ 'PICK IT IN A TIMEOUT (RIDE). WHEN THEY CLEAR,', 'YOUR GUYS RIDE IN IT ON THEIR OWN', 'AND PLAY NORMAL. NO SET BUTTON.' ],
    g: []
   });
  } else {
   P.push({
    t: 'DRAG INTO A SHAPE',
    l: [ 'DRAG YOUR D INTO A SHAPE.', 'THE GOALIE STAYS IN THE CAGE.' ],
    g: [ gDrag(A, -18, 12) ]
   });
   P.push({
    t: 'MAN OR ZONE',
    l: [ 'MAN = EVERYONE TAKES A MAN.', 'ZONE = EVERYONE HOLDS HIS AREA.' ],
    g: [ gTap(() => btnRect('MAN', LAY.d), LAY.d), gTap(() => btnRect('ZONE', LAY.d), LAY.d) ]
   });
   P.push({
    t: 'THE SLIDE (MAN ONLY)',
    l: [ 'WHO SLIDES WHEN A GUY GETS BEAT:', 'SLIDE AJ = THE GUY NEXT TO HIM.', 'SLIDE CREASE = YOUR CREASE GUY.' ],
    g: [ gTap(() => btnRect('SLIDE AJ', LAY.d), LAY.d), gTap(() => btnRect('SLIDE CREASE', LAY.d), LAY.d) ]
   });
   P.push({
    t: 'SAVE',
    l: [ 'TAP SAVE + NAME IT.' ],
    g: [ gTap(() => btnRect('SAVE', LAY.d), LAY.d) ]
   });
   P.push({
    t: 'IN A GAME',
    l: [ 'PICK IT IN A TIMEOUT (DEFENSE). YOUR D', 'SETS UP IN YOUR SHAPE ON ITS OWN', 'AND PLAYS D NORMAL. NO SET BUTTON.' ],
    g: []
   });
  }
  P.push(topStep);
  return P;
 }
 // ---------- open / close ----------
 function open(kind, why) {
  if (!DD()) return false;
  HS.open = true;
  HS.kind = kind || kindOf() || 'OFFENSE';
  HS.i = 0;
  HS.t0 = rt();
  HS.why = why || 'button';
  HS.pages = pagesFor(HS.kind);
  HS.cardY = null;
  markSeen(HS.kind);
  LOG.opened.push([ HS.kind, HS.why ]);
  try {
   SFX.tap();
  } catch (e) {}
  return true;
 }
 function close() {
  HS.open = false;
  HS.pages = null;
 }
 function go(n) {
  if (!HS.open) return;
  const N = HS.pages.length;
  if (HS.i + n >= N) return close();
  HS.i = Math.max(0, HS.i + n);
  HS.t0 = rt();
  LOG.steps++;
  try {
   SFX.tap();
  } catch (e) {}
 }
 let helpBtn = null;
 function helpRect() {
  if (helpBtn) return helpBtn;
  const w = textW('HOW TO', 1) + 8;
  return {
   x: W - 113 - 3 - w,
   y: 2,
   w: w,
   h: 13
  };
 }
 // ---------- drawing ----------
 function wrapTxt(s, n) {
  const w = String(s).split(' '), out = [ '' ];
  for (const x of w) {
   const L = out[out.length - 1];
   if (!L.length) out[out.length - 1] = x; else if ((L + ' ' + x).length <= n) out[out.length - 1] = L + ' ' + x; else out.push(x);
  }
  return out;
 }
 function drawHelpBtn(look) {
  const r = helpRect(), on = Math.floor(rt() * 2) % 2 && !seen()[kindOf()];
  if (!look) hit('HOW TO', r.x, r.y, r.w, r.h, () => open(kindOf(), 'button'), 'HOW TO');
  rect(r.x, r.y + 2, r.w, r.h, '#000');
  rect(r.x, r.y, r.w, r.h, on ? '#ffe14d' : '#7dff7a');
  rect(r.x, r.y, r.w, 1, 'rgba(255,255,255,.35)');
  text('HOW TO', r.x + r.w / 2, r.y + 4, 1, '#0b1a20', 'center');
 }
 function drawMockBar(layout) {
  const hy = barY();
  rect(0, hy, W, H - hy, '#0b0f14');
  rect(0, hy, W, 1, 'rgba(255,225,77,.35)');
  text('THIS STEP:', 4, hy + 3, 1, '#8a99a3');
  const L = barLayout(layout);
  for (const l of layout) {
   const r = L[l];
   rect(r.x, r.y + 2, r.w, r.h, '#000');
   rect(r.x, r.y, r.w, r.h, /SAVE|START|DONE/.test(l) ? '#7dff7a' : l === 'ADD BALL' ? '#ffe14d' : l === 'PREVIEW' || /^GO TO/.test(l) ? '#8fe3f0' : '#c9d6d9');
   text(l, r.x + r.w / 2, r.y + 4, 1, '#0b1a20', 'center');
  }
 }
 function drawMockTabs(kind) {
  const T = TABS();
  for (const c of T) {
   const r = tabRect(c), on = c === kind;
   rect(r.x, r.y + 1, r.w, r.h, '#000');
   rect(r.x, r.y, r.w, r.h, on ? '#ffe14d' : '#5a6a75');
   text(c, r.x + r.w / 2, r.y + 3, 1, on ? '#0b1a20' : '#e6f0f2', 'center');
  }
 }
 function stepPts(st) {
  const pts = [];
  for (const gg of st.g) {
   if (gg.pts) for (const p of gg.pts()) pts.push(p);
   if (gg.rect) {
    const r = gg.rect();
    pts.push([ r.x + r.w / 2, r.y + r.h / 2 ]);
   }
  }
  return pts;
 }
 let CARD = null;
 function drawOverlay() {
  const st = HS.pages[HS.i], N = HS.pages.length;
  const hy = barY();
  // dim the field only, keep the bars readable
  rect(0, 17, W, hy - 17, 'rgba(0,0,0,.42)');
  // the step's own UI: mock tabs / mock bottom bar when those buttons are not on screen yet
  if (st.tabs && !spec('TAB ' + HS.kind)) drawMockTabs(HS.kind);
  const lay = (st.g.find(x => x.layout && x.rect && !x.rect().real) || {}).layout;
  if (lay) drawMockBar(lay);
  // card
  const cw = Math.min(W - 12, 300), nC = Math.floor((cw - 10) / 4);
  let lines = [];
  for (const l of st.l) lines = lines.concat(wrapTxt(l, nC));
  lines = lines.slice(0, 4);
  const ch = 14 + lines.length * 8 + 17 + (st.chips ? 14 : 0);
  const cx = Math.round((W - cw) / 2);
  const ghostTop = H - 16 - sab() - 15;
  const yTop = st.tabs ? 42 : 31, yBot = Math.max(yTop, Math.min(hy, ghostTop) - ch - 3);
  let cy = HS.cardY;
  if (HS.cardY == null || HS.cardStep !== HS.i) {
   // top unless the players the hand needs are all under it
   const need = st.g.some(x => x.two) ? 2 : st.g.some(x => x.guys) ? 1 : 0, joy = st.g.some(x => x.label === 'LEFT THUMB');
   cy = !need || guysFree(yTop, yTop + ch) >= need || guysFree(yBot, yBot + ch) < need ? yTop : yBot;
  }
  EXCL = {
   y0: cy,
   y1: cy + ch
  };
  HS.cardY = cy;
  HS.cardStep = HS.i;
  rect(cx, cy + 2, cw, ch, 'rgba(0,0,0,.6)');
  rect(cx, cy, cw, ch, 'rgba(11,15,20,.95)');
  rect(cx, cy, cw, 1, '#ffe14d');
  text('HOW TO: ' + st.t, cx + 5, cy + 4, 1, '#ffe14d');
  lines.forEach((l, i) => text(l, cx + 5, cy + 14 + i * 8, 1, '#ffffff'));
  if (st.chips) {
   let x = cx + 5;
   const y = cy + 14 + lines.length * 8 + 1;
   st.chips.forEach((c, j) => {
    const w = textW(c, 1) + 10, lit = Math.floor(rt() * 1.2) % 2 === j;
    rect(x, y + 1, w, 10, '#000');
    rect(x, y, w, 10, lit ? '#7dff7a' : '#56606a');
    text(c, x + w / 2, y + 3, 1, lit ? '#0b1a20' : '#e6f0f2', 'center');
    x += w + 3;
    if (j < st.chips.length - 1) {
     text('>', x, y + 3, 1, '#ffe14d');
     x += 8;
    }
   });
  }
  // footer: BACK  n/N  NEXT, X top-right
  const fy = cy + ch - 14;
  const nx = HS.i >= N - 1 ? 'GOT IT' : 'NEXT >', nw = textW(nx, 1) + 10, bw = textW('< BACK', 1) + 10;
  const rN = {
   x: cx + cw - nw - 4,
   y: fy,
   w: nw,
   h: 11
  }, rB = {
   x: cx + 4,
   y: fy,
   w: bw,
   h: 11
  }, rX = {
   x: cx + cw - 13,
   y: cy + 2,
   w: 11,
   h: 9
  };
  if (HS.i > 0) {
   rect(rB.x, rB.y, rB.w, rB.h, '#56606a');
   text('< BACK', rB.x + rB.w / 2, rB.y + 3, 1, '#e6f0f2', 'center');
  }
  rect(rN.x, rN.y, rN.w, rN.h, '#7dff7a');
  text(nx, rN.x + rN.w / 2, rN.y + 3, 1, '#0b1a20', 'center');
  rect(rX.x, rX.y, rX.w, rX.h, '#ff8a7a');
  text('X', rX.x + rX.w / 2, rX.y + 2, 1, '#0b1a20', 'center');
  const pg = (HS.i + 1) + '/' + N;
  text(pg, cx + cw / 2, fy + 3, 1, '#8a99a3', 'center');
  CARD = {
   x: cx,
   y: cy,
   w: cw,
   h: ch,
   next: rN,
   back: rB,
   x2: rX
  };
  // the animated hand
  if (st.g.length) {
   const per = st.g.reduce((s, x) => s + x.dur, 0), t = (rt() - HS.t0) % per;
   let acc = 0, gg = st.g[0], p = 0;
   for (const x of st.g) {
    if (t < acc + x.dur) {
     gg = x;
     p = (t - acc) / x.dur;
     break;
    }
    acc += x.dur;
   }
   const q = at(gg.keys(), p);
   try {
    gg.fx(p, q);
   } catch (e) {
    err(e, 'fx');
   }
   drawHand(q.x, q.y, q.down);
   if (gg.label === 'LEFT THUMB') {
    const [jx, jy] = JOY(), s = 'LEFT THUMB', w = textW(s, 1) + 4;
    rect(jx - w / 2, jy + 17, w, 8, 'rgba(0,0,0,.65)');
    text(s, jx, jy + 18, 1, '#ffe14d', 'center');
   }
  }
  return {
   rN: rN,
   rB: rB,
   rX: rX
  };
 }
 function regOverlayHits(R) {
  // the designer's own buttons are off while HOW TO is open; ours go in
  uiSpecs.splice(0, uiSpecs.length);
  hit('HOW TO CLOSE', R.rX.x - 2, R.rX.y - 2, R.rX.w + 4, R.rX.h + 4, () => close(), 'HOW TO CLOSE');
  hit('HOW TO NEXT', R.rN.x - 1, R.rN.y - 2, R.rN.w + 2, R.rN.h + 4, () => go(1), 'HOW TO NEXT');
  if (HS.i > 0) hit('HOW TO BACK', R.rB.x - 1, R.rB.y - 2, R.rB.w + 2, R.rB.h + 4, () => go(-1), 'HOW TO BACK');
 }
 // ---------- tutorial: the playmaker step runs on the new designer ----------
 const TUT_LIST = [ [ 'pmMove', 'STAGE: HOLD A GUY + RUN HIM' ], [ 'pmPass', 'START PLAY + TAP A TEAMMATE' ], [ 'pmPrev', 'PREVIEW IT' ], [ 'pmSaved', 'SAVE IT' ] ];
 const tutOn = () => !!(HS.tut && typeof PM !== 'undefined' && PM && PM.origin === 'tutorial' && typeof game !== 'undefined' && game && game.tutorial && DD());
 function tutFlags() {
  const d = DD();
  if (!d) return;
  const f = game.tutorial.f;
  if (!f.pmMove && (d.rec || d.stages.some(st => Object.keys(st).length))) {
   tutFlag('pmMove');
   LOG.tut.push('pmMove');
  }
  const ps = d.live && d.live.passes || d.play && d.play.passes || [];
  if (!f.pmPass && ps.length) {
   tutFlag('pmPass');
   LOG.tut.push('pmPass');
  }
  if (!f.pmPrev && d.pv) {
   tutFlag('pmPrev');
   LOG.tut.push('pmPrev');
  }
 }
 function tutMissing() {
  const f = game.tutorial.f;
  const m = TUT_LIST.slice(0, 3).find(([k]) => !f[k]);
  return m ? m[1] : null;
 }
 function drawTutList() {
  const f = game.tutorial.f, w = 132, y = 31, x = 2;
  rect(x, y, w, 10 + TUT_LIST.length * 8, 'rgba(0,0,0,.72)');
  text('TUTORIAL - DO ALL 4:', x + 4, y + 2, 1, '#ffe14d');
  TUT_LIST.forEach(([k, s], i) => {
   const ok = !!f[k];
   rect(x + 4, y + 11 + i * 8, 5, 5, ok ? '#7dff7a' : '#3a4a55');
   text(s, x + 12, y + 11 + i * 8, 1, ok ? '#7dff7a' : '#fff');
  });
 }
 // ---------- wrappers ----------
 const OP = window.openPlaymaker, DR = window.drawPlaymaker, DN = window.pmDown, MV = window.pmMove, UP = window.pmUp, TK = window.pmTick, SC = window.pmSetCat;
 window.openPlaymaker = function(origin, play, cat) {
  if (!OFF() && origin === 'tutorial' && PDON() && typeof game !== 'undefined' && game && game.tutorial) {
   const r = OP.call(this, 'menu', play, cat);
   try {
    if (PM) PM.origin = 'tutorial';
    HS.tut = !!DD();
    LOG.tut.push('open:' + (HS.tut ? 'new' : 'old'));
    if (HS.tut) {
     close();
     HS.autoTut = true;
    }
   } catch (e) {
    err(e, 'openTut');
   }
   return r;
  }
  HS.tut = false;
  close();
  return OP.apply(this, arguments);
 };
 window.pmSetCat = function(c) {
  if (!OFF() && typeof PM !== 'undefined' && PM && PM.origin === 'tutorial' && HS.tut) {
   PM.origin = 'menu';
   try {
    return SC.apply(this, arguments);
   } finally {
    if (PM) PM.origin = 'tutorial';
   }
  }
  return SC.apply(this, arguments);
 };
 window.drawPlaymaker = function() {
  const r = DR.apply(this, arguments);
  if (OFF()) return r;
  try {
   if (!DD() || screen !== 'playmaker') {
    if (HS.open) close();
    helpBtn = null;
    return r;
   }
   const k = kindOf();
   if (!HS.open) {
    if (HS.autoTut && tutOn() && autoOK()) {
     HS.autoTut = false;
     open(k, 'tutorial');
    } else if (autoOK() && k && !seen()[k] && !tutOn()) open(k, 'first');
   }
   if (HS.open && HS.kind !== k) close();
   SPECS = uiSpecs.slice();
   if (tutOn() && !HS.open) drawTutList();
   if (HS.open) {
    drawHelpBtn(true);
    const R = drawOverlay();
    regOverlayHits(R);
   } else {
    helpBtn = null;
    helpBtn = helpRect();
    drawHelpBtn();
   }
  } catch (e) {
   err(e, 'draw');
   close();
  }
  return r;
 };
 window.pmDown = function(pt) {
  if (!OFF() && HS.open && DD()) {
   pt.h404 = 1;
   pt.pd = null;
   return;
  }
  return DN.apply(this, arguments);
 };
 window.pmMove = function(pt) {
  if (pt && pt.h404) return;
  return MV.apply(this, arguments);
 };
 window.pmUp = function(pt, cancel) {
  if (pt && pt.h404) {
   if (!cancel && HS.open && (pt.moved || 0) < 14) {
    // a tap on the card's X / BACK is handled by its own button; anywhere else = next
    go(1);
   }
   return;
  }
  return UP.apply(this, arguments);
 };
 window.pmTick = function(dt) {
  if (!OFF() && HS.open && screen === 'playmaker' && DD()) return;
  const r = TK.apply(this, arguments);
  if (OFF()) return r;
  try {
   if (tutOn()) {
    tutFlags();
    if (screen === 'pmSave') {
     const miss = tutMissing();
     if (miss) {
      screen = 'playmaker';
      panelDirty();
      const d = DD();
      d.msg = 'TUTORIAL - FIRST: ' + miss;
      d.flash = 2;
      try {
       SFX.bad();
      } catch (e) {}
     }
    }
   }
  } catch (e) {
   err(e, 'tick');
  }
  return r;
 };
 // ---------- text that matches tonight's game ----------
 const swap = (arr, i, v, tag) => {
  try {
   if (Array.isArray(arr) && i < arr.length) {
    const was = Array.isArray(arr[i]) ? arr[i][1] : arr[i];
    if (Array.isArray(arr[i])) arr[i][1] = v; else arr[i] = v;
    LOG.txt.push([ tag, was, v ]);
   }
  } catch (e) {
   err(e, 'swap ' + tag);
  }
 };
 const setAll = (arr, lines, tag) => {
  try {
   if (!Array.isArray(arr)) return;
   LOG.txt.push([ tag, arr.join(' | '), lines.join(' | ') ]);
   arr.splice(0, arr.length, ...lines);
  } catch (e) {
   err(e, 'set ' + tag);
  }
 };
 try {
  if (PDON()) {
   // playmaker words (only when the new designer is on; with it off the old editor + old words stay)
   if (typeof TUT !== 'undefined') {
    const i = TUT.findIndex(x => x && x[0] === 'PLAYMAKER');
    if (i >= 0) swap(TUT, i, 'OPEN PLAYMAKER. A HAND SHOWS EACH STEP: SET, STAGE, BALL, PASS, SAVE.', 'TUT PLAYMAKER');
    const j = TUT.findIndex(x => x && x[0] === 'DRAW PLAY');
    if (j >= 0) swap(TUT, j, 'IN A TIMEOUT, DRAW PLAY OPENS PLAYMAKER. TAP ANYWHERE TO GO ON.', 'TUT DRAW PLAY');
   }
   if (typeof TUT_DRAW !== 'undefined') setAll(TUT_DRAW, [ 'TIMEOUT > DRAW PLAY OPENS PLAYMAKER RIGHT IN THE GAME.', 'BUILD IT THE SAME WAY (TAP HOW TO IN THERE), SAVE.', 'IT IS IN YOUR PLAYBOOK: PICK IT, SET, THEN RUN.', 'PLAYMAKER IS ALSO ON THE HOME SCREEN.' ], 'TUT_DRAW');
   if (typeof TUT_PM13 !== 'undefined') setAll(TUT_PM13, [ 'PLAYMAKER TABS: OFFENSE, MAN-UP, END LINE = PLAYS YOU CALL.', 'CLEAR, RIDES, D, SETS = SHAPES: DRAG YOUR GUYS, SAVE.', 'D + RIDES: MAN OR ZONE. D ON MAN: SLIDE AJ OR SLIDE CREASE.', 'MAN-UP = 6 ON 5. THEIR D SITS IN A BOX + 1 (THE GHOSTS).', 'STUCK? TAP HOW TO (TOP BAR) - A HAND SHOWS EACH STEP.', 'TAP ANYWHERE TO GO ON.' ], 'TUT_PM13');
   if (typeof TUT_TO13 !== 'undefined') setAll(TUT_TO13, [ 'TIMEOUT (TOP BAR): 2 A HALF - THE CLOCK STOPS.', 'WHO STARTS: TAP A GUY - HE HAS THE BALL WHEN PLAY STARTS AGAIN.', 'DRAW PLAY: BUILD ONE IN PLAYMAKER, SAVE, THEN SET + RUN IT.', 'ALSO: YOUR SET, D, RIDE + CLEAR - WHAT YOU PICK JUST HAPPENS.', 'TAP ANYWHERE TO GO ON.' ], 'TUT_TO13');
  }
  // game-behavior words (sets / clears / rides / D happen on their own, no auto pass)
  if (typeof TUT_CARD182 !== 'undefined') setAll(TUT_CARD182, [ 'PLAYBOOK HAS 2 TABS: SETS AND PLAYS.', 'SETS: PICK ONE FORMATION (1-4-1, 2-2-2...). ONLY ONE IS ON.', 'YOUR GUYS FLOW INTO IT ON THEIR OWN. NO SET BUTTON.', 'PLAYS: PICK ONE, SET, RUN. MAN-UP + END LINE START IN THE SET.', 'TAP ANYWHERE TO GO ON.' ], 'TUT_CARD182');
  if (typeof TUT_V182 !== 'undefined') {
   const i = TUT_V182.findIndex(x => x && x[0] === 'SETS VS PLAYS');
   if (i >= 0) swap(TUT_V182, i, 'SETS JUST HAPPEN. PLAYS: PICK, SET, RUN. TAP TO GO ON.', 'TUT_V182');
  }
  if (typeof TUT !== 'undefined') {
   const i = TUT.findIndex(x => x && x[0] === 'PASS');
   if (i >= 0) swap(TUT, i, 'QUICK TAP A TEAMMATE TO PASS. YOUR GUY NEVER PASSES ON HIS OWN.', 'TUT PASS');
  }
  if (typeof TUT_V13 !== 'undefined') {
   const i = TUT_V13.findIndex(x => x && x[0] === 'TIMEOUTS');
   if (i >= 0) swap(TUT_V13, i, 'TIMEOUT (TOP BAR): WHO STARTS, SET, D, RIDE, CLEAR. TAP TO GO ON.', 'TUT_V13 TIMEOUTS');
  }
 } catch (e) {
  err(e, 'text');
 }
 // coach answers
 const coach = () => {
  try {
   const C = window.V4014C, Q = C && Array.isArray(C.QA) ? C.QA : null;
   if (!Q) return;
   const set = (id, a) => {
    const q = Q.find(x => x.id === id);
    if (q && q.a !== a) {
     LOG.txt.push([ 'coach ' + id, q.a, a ]);
     q.a = a;
    }
   };
   if (PDON()) set('playbook', 'IN A GAME TAP PLAYBOOK, PICK A PLAY: SET, THEN RUN. YOU MAKE THE PASSES. BUILD ONE IN PLAYMAKER - TAP HOW TO IN THERE. SETS, CLEARS, RIDES + D JUST HAPPEN.');
   set('pass', 'QUICK TAP A TEAMMATE = PASS. YOUR GUY NEVER PASSES ON HIS OWN. GREEN RING = OPEN. DRIVE, MAKE THE D SLIDE, HIT THE GUY THEY LEFT.');
   set('timeout', 'TIMEOUT (TOP BAR): WHO STARTS, YOUR SET, D, RIDE, CLEAR, OR DRAW A PLAY. WHAT YOU PICK JUST HAPPENS. TWO A GAME, I NEVER NEEDED ONE.');
   set('clear', 'GOALIE HAS IT: TAP AN OPEN TEAMMATE (GREEN RING) = OUTLET. YOUR GUYS FLOW INTO YOUR CLEAR ON THEIR OWN. OVER MIDFIELD IN 10 SEC.');
  } catch (e) {
   err(e, 'coach');
  }
 };
 coach();
 // timeout panel words
 try {
  if (typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.timeout) {
   const RT = PANEL_RENDER.timeout;
   PANEL_RENDER.timeout = function() {
    let h = RT.apply(this, arguments);
    if (OFF()) return h;
    try {
     h = h.replace('CLEARING IT: TAP SET (BOTTOM RIGHT), THEN RUN', 'WHEN YOU CLEAR, YOUR GUYS FLOW INTO IT ON THEIR OWN').replace('OFFENSE SET (WHERE YOUR OFF-BALL GUYS SET UP + CUT)', 'OFFENSE SET (YOUR GUYS FLOW INTO IT ON THEIR OWN + KEEP PLAYING)').replace('PLAYBOOK (YOUR GUYS RUN IT ON OFFENSE)', 'PLAYBOOK (PICK A PLAY, THEN SET + RUN. YOU MAKE THE PASSES)');
    } catch (e) {}
    return h;
   };
  }
 } catch (e) {
  err(e, 'timeout');
 }
 // tutorial step 10 card on the live screen (game.js draws the old lines; ours go on top)
 const TUT10 = [ 'OPEN PLAYMAKER - A HAND SHOWS YOU EVERY STEP.', 'SET YOUR GUYS. STAGE 1: HOLD A GUY, LEFT THUMB RUNS HIM.', 'ADD BALL, START PLAY, TAP A TEAMMATE = PASS.', 'PREVIEW + SAVE. THEN CALL IT FROM THE PLAYBOOK.' ];
 if (typeof window.drawTutorial === 'function') {
  const DT = window.drawTutorial;
  window.drawTutorial = function() {
   const r = DT.apply(this, arguments);
   try {
    const G = typeof game !== 'undefined' ? game : null, Tt = G && G.tutorial;
    if (!OFF() && PDON() && Tt && !Tt.complete && Tt.step === 10 && Tt.doneT <= 0 && screen === 'live') {
     TUT10.forEach((l, i) => {
      rect(10, 100 + i * 10, W - 20, 10, '#0b0f14');
      text(l, W / 2, 102 + i * 10, 1, i ? '#fff' : '#ffe14d', 'center');
     });
    }
   } catch (e) {
    err(e, 'drawTut');
   }
   return r;
  };
 }
 window.V404T = {
  on: () => !OFF(),
  LOG: LOG,
  open: k => open(k || kindOf(), 'api'),
  close: close,
  next: () => go(1),
  back: () => go(-1),
  state: () => ({
   open: HS.open,
   kind: HS.kind,
   i: HS.i,
   n: HS.pages ? HS.pages.length : 0,
   title: HS.pages ? HS.pages[HS.i].t : null,
   card: CARD,
   tut: HS.tut,
   seen: seen()
  }),
  pages: k => pagesFor(k || kindOf()).map(p => ({
   t: p.t,
   l: p.l
  })),
  KEY: KEY,
  coach: coach,
  dbg: () => ({
   EXCL: EXCL,
   guys: demoGuys(),
   xy: demoGuys().map(guyXY),
   joy: JOY(),
   barY: barY(),
   sab: sab()
  })
 };
})();
