(function() {
 const el = document.getElementById('intro30');
 const ST = window.__rl30intro = {
  shown: false,
  done: false,
  why: '',
  t0: 0,
  ms: 6e3,
  lay: null,
  pass: false,
  skipOnly: false,
  side: false
 };
 if (window.__rl_no30intro || !el) {
  if (el) el.remove();
  ST.why = 'off';
  ST.done = true;
  return;
 }
 const TITLE = [ 'BAGGA', 'LAX' ];
 const BODY = "Lacrosse is the oldest sport in North America, first played by Indigenous nations and still called the Creator's Game by the Haudenosaunee. Bagga comes from baaga'adowe, the Ojibwe word for playing lacrosse. We made Bagga Lax to bring more kids into the game and build real lacrosse IQ: reading slides, running sets, making the right pass. Grab your stick and go grow the game.";
 const NOTE = 'All players and teams in this game are fictional.';
 const HINT = 'TAP ANYWHERE TO CONTINUE', HINT_SO = 'TAP SKIP WHEN YOU ARE READY', HINT_TURN = 'TURN YOUR PHONE';
 const F = typeof FONT !== 'undefined' && FONT || null;
 ST.pass = !!(navigator.webdriver && !window.__rl_30introReal);
 if (ST.pass) el.classList.add('pt');
 ST.skipOnly = !ST.pass && !window.__rl_301skiponly;
 if (ST.skipOnly) el.classList.add('so');
 const cv = document.createElement('canvas');
 cv.setAttribute('aria-hidden', 'true');
 el.appendChild(cv);
 const sk = document.createElement('button');
 sk.type = 'button';
 sk.id = 'intro30skip';
 sk.textContent = 'SKIP';
 sk.setAttribute('aria-label', 'SKIP');
 el.appendChild(sk);
 el.setAttribute('role', 'dialog');
 el.setAttribute('aria-label', 'BAGGA LAX. ' + BODY + ' ' + NOTE);
 const g = cv.getContext('2d');
 const up = s => String(s).toUpperCase();
 function wrap(s, n) {
  const out = [];
  let line = '';
  for (const w of up(s).split(/\s+/)) {
   if (!line) line = w; else if ((line + ' ' + w).length <= n) line += ' ' + w; else {
    out.push(line);
    line = w;
   }
  }
  if (line) out.push(line);
  return out;
 }
 function ins() {
  try {
   if (typeof sa2403Insets === 'function') {
    const i = sa2403Insets();
    return {
     b: +i.b || 0,
     l: +i.l || 0,
     r: +i.r || 0
    };
   }
  } catch (e) {}
  return {
   b: 0,
   l: 0,
   r: 0
  };
 }
 function vp() {
  const vv = window.visualViewport;
  const w = Math.round(vv ? Math.min(window.innerWidth, vv.width * vv.scale) : window.innerWidth), h = Math.round(vv ? Math.min(window.innerHeight, vv.height * vv.scale) : window.innerHeight);
  return {
   w: w || window.innerWidth,
   h: h || window.innerHeight
  };
 }
 let pr = null;
 function env4() {
  try {
   if (!pr) {
    pr = document.createElement('div');
    pr.setAttribute('aria-hidden', 'true');
    pr.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(pr);
   }
   const cs = getComputedStyle(pr);
   return {
    t: parseFloat(cs.paddingTop) || 0,
    r: parseFloat(cs.paddingRight) || 0,
    b: parseFloat(cs.paddingBottom) || 0,
    l: parseFloat(cs.paddingLeft) || 0
   };
  } catch (e) {
   return {
    t: 0,
    r: 0,
    b: 0,
    l: 0
   };
  }
 }
 function orient() {
  const v = vp(), side = !window.__rl_301introside && v.h > v.w * 1.05;
  ST.side = side;
  if (side) {
   el.classList.add('side');
   el.style.left = '0px';
   el.style.top = '0px';
   el.style.right = 'auto';
   el.style.bottom = 'auto';
   el.style.width = v.h + 'px';
   el.style.height = v.w + 'px';
   el.style.transformOrigin = '0 0';
   el.style.transform = 'translateX(' + v.w + 'px) rotate(90deg)';
  } else if (el.classList.contains('side')) {
   el.classList.remove('side');
   for (const k of [ 'left', 'top', 'right', 'bottom', 'width', 'height', 'transformOrigin', 'transform' ]) el.style[k] = '';
  }
  return side ? {
   vw: v.h,
   vh: v.w,
   I: (() => {
    const e = env4();
    return {
     l: e.t,
     r: e.b > 0 ? Math.max(e.b, 34) : 0,
     b: e.l,
     t: e.r
    };
   })()
  } : null;
 }
 function glyphs(s, x, y, c, col) {
  g.fillStyle = col;
  for (let i = 0; i < s.length; i++) {
   const gl = F && (F[s[i]] || F['?']) || null;
   if (!gl) continue;
   for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (gl[r][k] === '#') g.fillRect(x + (i * 4 + k) * c, y + r * c, c, c);
  }
 }
 const tw = (s, c) => (s.length * 4 - 1) * c;
 const ARW = [ '.###..', '#...#.', '#..###', '#...#.', '.###..' ];
 function turnArrow(x, y, c, col, p) {
  g.fillStyle = col;
  for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) if (ARW[r][k] === '#') g.fillRect(x + k * c, y + r * c, c, c);
 }
 function layout() {
  const O = orient();
  const vw = O ? O.vw : window.innerWidth, vh = O ? O.vh : window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 3), I = O ? O.I : ins();
  const pad = 10, x0 = I.l + pad, x1 = vw - I.r - pad, y0 = pad + (O ? O.I.t : 0), foot = 40, y1 = vh - I.b - pad;
  const cw = x1 - x0;
  let best = null;
  for (let d = Math.max(2, Math.round(3.2 * dpr)); d >= 2; d--) {
   const c = d / dpr, n = Math.floor((cw + c) / (4 * c));
   if (n < 24) continue;
   const lines = wrap(BODY, n), td = Math.max(d + 1, Math.round(d * 2.4)), nd = Math.max(1, Math.round(d * .75));
   const tW = tw('BAGGA LAX', td) / dpr;
   if (tW > cw) continue;
   const nl = wrap(NOTE, Math.floor((cw + nd / dpr) / (4 * nd / dpr)));
   const h = 5 * td / dpr + 7 * c + lines.length * 8 * c - 3 * c + 6 * c + nl.length * 7 * nd / dpr;
   if (h <= y1 - foot - y0) {
    best = {
     d: d,
     c: c,
     td: td,
     nd: nd,
     lines: lines,
     nl: nl,
     h: h
    };
    break;
   }
  }
  if (!best) {
   const d = 2, c = d / dpr, n = Math.max(10, Math.floor((cw + c) / (4 * c)));
   best = {
    d: d,
    c: c,
    td: 4,
    nd: 1,
    lines: wrap(BODY, n),
    nl: wrap(NOTE, n * 2),
    h: 0,
    tight: 1
   };
  }
  Object.assign(best, {
   vw: vw,
   vh: vh,
   dpr: dpr,
   x0: x0,
   x1: x1,
   y0: y0,
   y1: y1,
   foot: foot,
   I: I,
   side: !!O
  });
  best.top = Math.max(y0, Math.round(y0 + (y1 - foot - y0 - best.h) / 2));
  return best;
 }
 let L = null;
 function draw(p) {
  if (!L) return;
  const {vw: vw, vh: vh, dpr: dpr, d: d, td: td, nd: nd, lines: lines, nl: nl, x0: x0, x1: x1, top: top} = L, ph = p;
  p = ST.skipOnly ? ph : Math.min(1, ph);
  const W = Math.round(vw * dpr), H = Math.round(vh * dpr);
  if (cv.width !== W) cv.width = W;
  if (cv.height !== H) cv.height = H;
  cv.style.width = vw + 'px';
  cv.style.height = vh + 'px';
  g.fillStyle = '#0b1a20';
  g.fillRect(0, 0, W, H);
  const sw = Math.max(8, Math.round(24 * dpr));
  g.fillStyle = '#0e2129';
  for (let x = 0; x < W; x += sw * 2) g.fillRect(x, 0, sw, H);
  const cx = Math.round((x0 + x1) / 2 * dpr);
  let y = Math.round(top * dpr);
  const full = tw('BAGGA LAX', td), tx = Math.round(cx - full / 2), so = Math.max(1, Math.round(td / 3)), bob = Math.round(Math.sin(p * 6.28 * 1.5) * td * .25);
  glyphs('BAGGA LAX', tx + so, y + so + bob, td, '#000');
  glyphs('BAGGA', tx, y + bob, td, '#2cc4dc');
  glyphs('LAX', tx + 6 * 4 * td, y + bob, td, '#ffffff');
  y += 5 * td + 7 * d;
  for (const ln of lines) {
   const lx = Math.round(cx - tw(ln, d) / 2);
   glyphs(ln, lx + Math.max(1, Math.round(d / 2)), y + Math.max(1, Math.round(d / 2)), d, '#000');
   glyphs(ln, lx, y, d, '#e8f4f6');
   y += 8 * d;
  }
  y += 3 * d;
  for (const ln of nl) {
   glyphs(ln, Math.round(cx - tw(up(ln), nd) / 2), y, nd, '#7f9aa6');
   y += 7 * nd;
  }
  const fy = Math.round((L.y1 - 30) * dpr), hd = Math.max(1, Math.round(L.d * .75));
  const hy = fy + Math.round(9 * dpr) - Math.round(2.5 * hd);
  if (L.side) {
   const td2 = Math.max(hd + 1, Math.round(L.d)), ty2 = fy + Math.round(9 * dpr) - Math.round(2.5 * td2);
   glyphs(HINT_TURN, Math.round(x0 * dpr), ty2, td2, '#ffd23a');
   turnArrow(Math.round(x0 * dpr) + tw(HINT_TURN, td2) + 3 * td2, ty2, td2, '#ffd23a', p);
  } else if (ST.skipOnly) {
   if (Math.floor(p * 6) % 4 !== 3) glyphs(HINT_SO, Math.round(x0 * dpr), hy, hd, '#8fe3f0');
  } else if (Math.floor(p * 12) % 2 === 0 || ST.done) glyphs(HINT, Math.round(x0 * dpr), hy, hd, '#8fe3f0');
  if (!ST.skipOnly) {
   const bx = Math.round(x0 * dpr), bw = Math.round((x1 - x0 - 82) * dpr), by = Math.round((L.y1 - 4) * dpr), bh = Math.max(2, Math.round(3 * dpr));
   g.fillStyle = '#22313d';
   g.fillRect(bx, by, bw, bh);
   g.fillStyle = '#ffd23a';
   g.fillRect(bx, by, Math.round(bw * Math.min(1, p)), bh);
  }
  sk.style.right = L.I.r + 10 + 'px';
  sk.style.bottom = L.I.b + 10 + 'px';
  ST.lay = {
   side: !!L.side,
   hint: L.side ? HINT_TURN : ST.skipOnly ? HINT_SO : HINT,
   cellCss: L.c,
   titleCellCss: td / dpr,
   noteCellCss: nd / dpr,
   lines: lines.length,
   chars: lines.reduce((a, s) => Math.max(a, s.length), 0),
   textBottom: y / dpr,
   footTop: L.y1 - 30,
   tight: !!L.tight,
   vw: vw,
   vh: vh,
   insets: L.I
  };
 }
 let raf = 0;
 function frame() {
  if (ST.done) return;
  const t = performance.now() - ST.t0, p = ST.skipOnly ? t / ST.ms : Math.min(1, t / ST.ms);
  try {
   draw(p);
  } catch (e) {}
  try {
   if (typeof screen === 'string' && screen !== 'menu' || typeof game !== 'undefined' && game) return go('game');
  } catch (e) {}
  try {
   const pn = document.getElementById('panel');
   if (pn && getComputedStyle(pn).display !== 'none') return go('panel');
  } catch (e) {}
  if (!ST.skipOnly && t >= ST.ms) return go('auto');
  raf = requestAnimationFrame(frame);
 }
 function go(why) {
  if (ST.done) return;
  ST.done = true;
  ST.why = why;
  ST.t1 = performance.now();
  cancelAnimationFrame(raf);
  clearTimeout(ST.tm);
  for (const [t, f] of HL) window.removeEventListener(t, f, true);
  el.classList.add('out');
  setTimeout(() => {
   try {
    el.remove();
   } catch (e) {}
  }, 320);
 }
 const HL = [];
 if (ST.pass) {
  for (const t of [ 'pointerdown', 'touchstart', 'mousedown' ]) {
   const f = () => go('tap');
   HL.push([ t, f ]);
   window.addEventListener(t, f, true);
  }
 } else if (ST.skipOnly) {
  el.addEventListener('pointerdown', e => {
   e.preventDefault();
   e.stopPropagation();
   if (e.target === sk) go('skip'); else ST.taps = (ST.taps || 0) + 1;
  }, true);
  el.addEventListener('touchstart', e => {
   e.stopPropagation();
   if (e.target === sk) go('skip');
  }, {
   capture: true,
   passive: true
  });
 } else {
  el.addEventListener('pointerdown', e => {
   e.preventDefault();
   e.stopPropagation();
   go(e.target === sk ? 'skip' : 'tap');
  }, true);
  el.addEventListener('touchstart', e => {
   e.stopPropagation();
   go(e.target === sk ? 'skip' : 'tap');
  }, {
   capture: true,
   passive: true
  });
 }
 sk.addEventListener('click', e => {
  e.stopPropagation();
  go('skip');
 });
 if (!ST.skipOnly) {
  const f = e => {
   if (/^(Enter| |Escape|Spacebar)$/.test(e.key)) go('key');
  };
  HL.push([ 'keydown', f ]);
  window.addEventListener('keydown', f, true);
 }
 const relay = () => {
  L = layout();
 };
 window.addEventListener('resize', relay);
 if (window.visualViewport) window.visualViewport.addEventListener('resize', relay);
 window.addEventListener('orientationchange', () => {
  relay();
  for (const t of [ 200, 600 ]) setTimeout(() => {
   if (!ST.done) relay();
  }, t);
 });
 ST.t0 = performance.now();
 ST.shown = true;
 L = layout();
 draw(0);
 if (!ST.skipOnly) ST.tm = setTimeout(() => go('auto'), ST.ms + 400);
 raf = requestAnimationFrame(frame);
})();
