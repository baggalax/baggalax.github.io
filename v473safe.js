/* v473safe.js - BAGGA LAX 4.7.3 (redone 4.7.3b): keep buttons and text clear of the Dynamic Island / notch in landscape,
 * while the picture (field, stands, menu backgrounds) still runs FULL SCREEN, edge to edge.
 * Player report (iPhone 17 Pro): text and buttons on the LEFT edge sat under the Dynamic Island, worst on the menus.
 * Why it happened: index.html had no viewport-fit=cover, so the iOS app's WKWebView reported env(safe-area-inset-*) as 0,
 * and game.js resize() (game.js:49) sized the canvas to the FULL screen width. Every canvas screen draws its UI from x=0..W
 * (main menu tiles at x=5, CHINOS chip at x=1, pause at x=4, edge-mate arrows at x=0), so the outer ~60 px went under the island.
 * First try (4.7.3) shrank the whole canvas into the safe area and filled the side strips with colour bands sampled from the
 * canvas edge. Charlie: "Just move the buttons don't stop the screen from going to the edge of the phone" - so this version:
 *  1. index.html has viewport-fit=cover, so iOS reports the real insets (about 62 px each side in landscape on island iPhones).
 *  2. LAYOUT (W, every button, every hit-test, #ui tap buttons, #panel) still lives in the safe area: same math as game.js
 *     resize() with the inset width taken off, so W comes out a little narrower (339 units on a 17 Pro). #stage is that safe box.
 *  3. The CANVAS ELEMENT itself is wider than #stage: it runs from the left screen edge to the right one (negative margin), and the
 *     off-screen buffer is RL473.Wf = W + l + r units wide. Logical x=0 sits RL473.l units in from the physical left edge: the base
 *     transform setTransform(RR,0,0,RR,0,0) is applied with that offset (only the exact "base reset" call is shifted; identity /
 *     DOMMatrix calls are left alone because they are built from getTransform() and already carry it).
 *     cv.getBoundingClientRect() answers the SAFE box (the logical 0..W part), so every tap maps exactly as before.
 *  4. In a match the world pass (stands, field, players, lights, night tint) is drawn over the FULL width: from rantWatch() to the
 *     g.restore() after drawLvlFx() (or after drawNight15() on a night game) W = Wf, camX is moved l units left and the offset is 0,
 *     so the field reaches both phone edges. Then W, camX and the offset go back and the HUD / buttons draw in the safe area.
 *  5. Menus: full-width fills (backgrounds, dims, header bars: any fillRect covering logical 0..W under the base transform) and
 *     full-width background images are stretched over the strips too, so backgrounds still reach the edges; tiles and text stay in.
 *  6. Full-screen HTML overlays (account, college, trade, modals...) get side padding = the inset; their backgrounds still fill.
 *  7. Minimum 48 px a side when running on iOS (app or iPhone Safari) on a tall (>= 2:1) screen in landscape, even if env() says 0.
 *     Desktop, iPad and 16:9 iPhones: env() is 0 there and the minimum does not apply, so nothing changes.
 * Test hook: window.__rl_safeTest = 59 (or {l:59,r:59}) forces the insets.  Read-back: window.RL473 (l/r = insets in CSS px,
 *   lu/ru = the strips in canvas units, W = safe width, Wf = full width, mode = 'ui' | 'world').
 * Kill switch: window.__rl_no473safe = true -> old full-width layout, and viewport-fit=cover is taken back off.
 * Ids, rl_* keys, __rl_* flags and the net protocol are unchanged.
 */
(function () {
 'use strict';
 var WIN = window, D = document;
 var meta = D.querySelector('meta[name=viewport]');
 if (WIN.__rl_no473safe || WIN.__rl_v124gb) {
  try { if (meta) meta.setAttribute('content', meta.getAttribute('content').replace(/,?\s*viewport-fit=cover/, '')); } catch (e) { }
  return;
 }
 try { if (meta && !/viewport-fit=cover/.test(meta.getAttribute('content'))) meta.setAttribute('content', meta.getAttribute('content') + ',viewport-fit=cover'); } catch (e) { }
 if (typeof resize !== 'function' || typeof cv === 'undefined' || !cv || typeof stage === 'undefined') return;

 var MIN = 48;
 var S = WIN.RL473 = { on: false, l: 0, r: 0, lu: 0, ru: 0, src: 'none', env: null, W: 0, Wf: 0, mode: 'ui', fixes: 0, worldFrames: 0 };
 var ua = navigator.userAgent || '';
 function isIOS() {   // an iPhone: Safari, the home-screen app or the Capacitor shell (its WKWebView UA says iPhone too). Not iPad.
  var R = WIN.RL41; return /iPhone|iPod/.test(ua) || !!(R && R.plat === 'ios' && (navigator.maxTouchPoints || 0) > 0 && !/iPad/.test(ua));
 }
 function tall() {
  var sc = WIN.screen, a = sc ? Math.max(sc.width, sc.height) : 0, b = sc ? Math.min(sc.width, sc.height) : 0;
  return b > 0 && a / b >= 2;
 }
 var probe = null;
 function envRead() {
  try {
   if (!probe) {
    probe = D.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:0 env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px)';
    D.body.appendChild(probe);
   }
   var cs = getComputedStyle(probe);
   S.env = { l: parseFloat(cs.paddingLeft) || 0, r: parseFloat(cs.paddingRight) || 0 };
  } catch (e) { S.env = { l: 0, r: 0 }; }
  return S.env;
 }
 function dims() {   // the same viewport read as game.js resize()
  var vv = WIN.visualViewport, q = typeof vp2318 === 'function' ? vp2318() : null;
  var iw = q ? q[0] : Math.round(vv ? Math.min(WIN.innerWidth, vv.width * vv.scale) : WIN.innerWidth);
  var ih = q ? q[1] : Math.round(vv ? Math.min(WIN.innerHeight, vv.height * vv.scale) : WIN.innerHeight);
  return [iw, ih];
 }
 function insets(iw, ih) {
  if (WIN.__rl_no473safe) return { l: 0, r: 0, src: 'off' };
  if (ih > iw * 1.05) return { l: 0, r: 0, src: 'portrait' };
  var t = WIN.__rl_safeTest;
  if (t != null && t !== false) {
   if (typeof t === 'object') return { l: +t.l || 0, r: +t.r || 0, src: 'test' };
   return { l: +t || 0, r: +t || 0, src: 'test' };
  }
  var e = S.env || envRead(), l = e.l, r = e.r, src = l || r ? 'env' : 'none';
  if (isIOS() && tall() && iw > ih) { if (l < MIN || r < MIN) src = src === 'env' ? 'env+min' : 'ios-min'; l = Math.max(l, MIN); r = Math.max(r, MIN); }
  return { l: Math.round(l), r: Math.round(r), src: src };
 }

 // ---------- the 2D context of the off-screen buffer: the logical (safe) origin sits S.lu units in from the left edge ----------
 var gx = off.getContext('2d');
 var P = CanvasRenderingContext2D.prototype, setT0 = P.setTransform, restore0 = P.restore, fillRect0 = P.fillRect, drawImage0 = P.drawImage, getT0 = P.getTransform;
 var curOff = 0;   // canvas units added to the base transform right now (S.lu in the UI pass, 0 in the full-width world pass)
 function base(o) { setT0.call(gx, RR, 0, 0, RR, o * RR, 0); }
 gx.setTransform = function (a, b, c, d, e, f) {
  // only the game's exact base reset (RR,0,0,RR,0,0) is moved; identity / DOMMatrix forms are built from getTransform() already
  if (curOff && arguments.length >= 6 && a === RR && d === RR && !b && !c && !e && !f) return setT0.call(this, a, 0, 0, d, curOff * RR, 0);
  return setT0.apply(this, arguments);
 };
 function atBase(m) { return m.a === RR && m.d === RR && !m.b && !m.c && Math.abs(m.e - curOff * RR) < 0.01 && !m.f; }
 // backgrounds, dims, header bars and side panels that reach the edge of the logical (safe) area are carried on over the side
 // strips: a fill covering 0..W goes out to both screen edges; a tall one (>= 60% of H) touching one side goes out on that side.
 // Only fills under the plain base transform count (not world, sprite or translated art).
 gx.fillRect = function (x, y, w, h) {
  if (curOff && S.on && S.mode === 'ui' && w > 0 && h > 0) {
   var L0 = x <= 0.5, R0 = x + w >= W - 0.5;
   if ((L0 && R0 || (L0 || R0) && h >= H * 0.6) && w < W + 8 && atBase(getT0.call(this))) {
    var x0 = L0 ? -S.lu : x, x1 = R0 ? W + S.ru : x + w;
    return fillRect0.call(this, x0, y, x1 - x0, h);
   }
  }
  return fillRect0.apply(this, arguments);
 };
 gx.drawImage = function (img, a1, a2, a3, a4, a5, a6, a7, a8) {
  var n = arguments.length;
  if (curOff && S.on && S.mode === 'ui' && (n === 5 || n === 9)) {
   var dx = n === 5 ? a1 : a5, dw = n === 5 ? a3 : a7;
   if (dx <= 0.5 && dx + dw >= W - 0.5 && dw < W + 8 && dw > W * 0.9 && atBase(getT0.call(this))) {
    // stretch the full-width background image over the strips (as it looked before 4.7.3)
    if (n === 5) return drawImage0.call(this, img, -S.lu, a2, W + S.lu + S.ru, a4);
    return drawImage0.call(this, img, a1, a2, a3, a4, -S.lu, a6, W + S.lu + S.ru, a8);
   }
  }
  return drawImage0.apply(this, arguments);
 };

 var lastKey = '', lastCss = '', Ws = 0;
 function fix(force) {
  var d = dims(), iw = d[0], ih = d[1], i = insets(iw, ih);
  var key = iw + 'x' + ih + '|' + i.l + '|' + i.r + '|' + (WIN.devicePixelRatio || 1);
  var on = i.l + i.r > 0;
  S.l = i.l; S.r = i.r; S.src = i.src;
  if (!on) {
   if (S.on) {
    S.on = false; curOff = 0; S.lu = S.ru = 0; D.documentElement.classList.remove('rl473');
    stage.style.left = ''; stage.style.width = ''; cv.style.marginLeft = ''; lastKey = ''; lastCss = ''; resize0();
   }
   return false;
  }
  if (!force && key === lastKey && cv.style.width === lastCss) return false;
  // game.js resize() with the safe width
  var sw = Math.max(200, iw - i.l - i.r);
  portrait = ih > iw * 1.05;
  D.body.classList.toggle('portrait', portrait);
  DPR = Math.min(WIN.devicePixelRatio || 1, 3);
  W = Math.max(300, Math.min(400, Math.round(H * sw / ih)));
  SCALE = Math.min(sw / W, ih / H);
  var cw = Math.round(W * SCALE), ch = Math.round(H * SCALE);
  // body centres #stage (now exactly the safe box) on the full screen; shift it into the middle of the band from l to iw-r
  var mid = i.l + (iw - i.l - i.r) / 2, dx = Math.round(mid - iw / 2);
  var left = (iw - cw) / 2 + dx;
  // the picture runs on past the safe box to both screen edges: lu / ru whole canvas units each side
  var lu = Math.max(0, Math.ceil(left / SCALE - 0.02)), ru = Math.max(0, Math.ceil((iw - left - cw) / SCALE - 0.02));
  var lpx = Math.round(lu * SCALE), rpx = Math.round(ru * SCALE), fw = cw + lpx + rpx;
  stage.style.width = cw + 'px';
  stage.style.left = dx ? dx + 'px' : '';
  cv.style.width = fw + 'px';
  cv.style.height = ch + 'px';
  cv.style.marginLeft = -lpx + 'px';
  var pw = Math.round(fw * DPR), ph = Math.round(ch * DPR);
  if (cv.width !== pw) cv.width = pw;
  if (cv.height !== ph) cv.height = ph;
  RR = Math.max(1, Math.min(5, Math.round(SCALE * DPR)));
  off.width = (W + lu + ru) * RR;
  off.height = H * RR;
  g.imageSmoothingEnabled = false;
  Ws = W; S.lu = lu; S.ru = ru; S.Wf = W + lu + ru; curOff = lu; S.mode = 'ui';
  var de = D.documentElement;
  de.classList.add('rl473');
  de.style.setProperty('--rl473l', i.l + 'px');
  de.style.setProperty('--rl473r', i.r + 'px');
  S.on = true; S.W = W; S.fixes++;
  lastKey = key; lastCss = cv.style.width;
  if (WIN.scrollX || WIN.scrollY) WIN.scrollTo(0, 0);
  return true;
 }
 var resize0 = resize;
 WIN.resize = function () {
  var r = resize0.apply(this, arguments);
  try { lastKey = ''; fix(true); } catch (e) { console.error(e); }
  return r;
 };

 // every hit-test in the game maps through cv.getBoundingClientRect() and W: answer the safe (logical 0..W) part of the canvas
 var gbr0 = Element.prototype.getBoundingClientRect;
 cv.getBoundingClientRect = function () {
  var r = gbr0.call(this);
  if (!S.on || !(S.lu + S.ru)) return r;
  var k = r.width / (Ws + S.lu + S.ru), x = r.left + S.lu * k, w = Ws * k;
  try { return new DOMRect(x, r.top, w, r.height); } catch (e) { return { left: x, top: r.top, right: x + w, bottom: r.bottom, width: w, height: r.height, x: x, y: r.top }; }
 };

 // ---------- in a match: the world pass is drawn over the full width ----------
 var shifted = 0, pendExit = false, nightPend = false, specs0 = -1;   // worldSpecs: tap boxes made during the world pass (read-back for tests)
 function enterWorld() {
  if (!S.on || shifted || !(S.lu + S.ru)) return;
  // keep the whole full-width view on the pitch: the game clamps its camera for the safe width (0 .. FL - W + PADW), which at
  // either end would leave the strip past the end boards empty. The camera itself is held l / r units further in (it is not
  // put back after the frame), so the world, the taps (p.x + camX) and the HUD all agree.
  try { if (typeof FL === 'number' && typeof PADW === 'number') { var lo = S.lu, hi = FL - Ws + PADW - S.ru; if (hi >= lo) camX = Math.max(lo, Math.min(hi, camX)); } } catch (e) { }
  shifted = S.lu; camX -= shifted; W = S.Wf; curOff = 0; S.mode = 'world'; S.worldFrames++;
  try { specs0 = uiSpecs.length; } catch (e) { specs0 = -1; }
  base(0);
 }
 function exitWorld() {
  pendExit = false; nightPend = false;
  if (!shifted) return;
  camX += shifted; shifted = 0; W = Ws; curOff = S.lu; S.mode = 'ui';
  try { if (specs0 >= 0 && uiSpecs.length > specs0) S.worldSpecs = uiSpecs.slice(specs0).map(function (s) { return s.key; }); } catch (e) { }
  base(curOff);
 }
 if (typeof rantWatch === 'function') {
  var RW0 = rantWatch;
  WIN.rantWatch = function () {   // called once, at the top of the in-match branch of render, before the camera translate
   var r = RW0.apply(this, arguments);
   try { enterWorld(); } catch (e) { console.error(e); }
   return r;
  };
 }
 if (typeof drawLvlFx === 'function') {
  var LF0 = WIN.drawLvlFx || drawLvlFx;
  WIN.drawLvlFx = function () {   // the last call of the world pass; the g.restore() right after it closes the camera translate
   try { return LF0.apply(this, arguments); } finally { if (shifted) pendExit = true; }
  };
 }
 gx.restore = function () {
  var r = restore0.apply(this, arguments);
  if (pendExit) {
   pendExit = false;
   try { if (shifted && typeof game !== 'undefined' && game && game.night && typeof drawNight15 === 'function') nightPend = true; else exitWorld(); } catch (e) { exitWorld(); }
  }
  return r;
 };
 if (typeof drawNight15 === 'function') {
  var N0 = drawNight15;
  WIN.drawNight15 = function () {   // the night tint is screen-wide: drawn full width too, then back to the safe layout
   try { return N0.apply(this, arguments); } finally { if (nightPend) exitWorld(); }
  };
 }

 // game.js registered its ORIGINAL resize directly on a few events (and 200/600 ms timers after a rotation), so check every
 // frame too: if the layout was put back to full width, redo it before this frame draws (the off canvas is re-set up).
 if (typeof render === 'function') {
  var R0 = render;
  WIN.render = function () {
   try {
    fix(false);
    if (S.on) {
     shifted = 0; pendExit = false; nightPend = false; curOff = S.lu; S.mode = 'ui'; W = Ws;
     setT0.call(gx, 1, 0, 0, 1, 0, 0); gx.clearRect(0, 0, off.width, off.height);
     base(curOff); gx.imageSmoothingEnabled = false; gx.globalAlpha = 1;
    }
   } catch (e) { console.error(e); }
   try { return R0.apply(this, arguments); } finally { if (shifted) exitWorld(); }
  };
 }

 // ---------- menu backgrounds that are drawn as a pattern (not one fill) ----------
 // the green stripes behind most menus: drawn over the full width, so the stripes run on to both screen edges
 if (typeof bgStripes === 'function') {
  var BS0 = bgStripes;
  WIN.bgStripes = function () {
   if (!(S.on && S.mode === 'ui' && curOff)) return BS0.apply(this, arguments);
   g.save(); g.translate(-S.lu, 0); W = S.Wf;
   try { return BS0.apply(this, arguments); } finally { W = Ws; g.restore(); }
  };
 }
 // the locker room on the left of the home / play menus: one more locker bay (same 28-unit spacing) is drawn into the left strip
 if (typeof drawLobbyLeft === 'function' && typeof lobbyRoom === 'function') {
  var DLL0 = drawLobbyLeft;
  WIN.drawLobbyLeft = function (L, live) {
   if (S.on && S.mode === 'ui' && curOff && S.lu > 0) {
    try {
     var st = lobbyState(), locked = st.locked, kit = WIN.UNI21 && UNI21.on() && !locked && st.tid ? UNI21.heroKit(0, st.tid) : lobbyKit(st.tid);
     var sh = 28 * Math.ceil(S.lu / 28), el = WIN.lobbyEllipse;
     g.save(); g.beginPath(); g.rect(-S.lu, 0, S.lu, H); g.clip(); g.translate(-sh, 0);
     if (typeof el === 'function') WIN.lobbyEllipse = function () { };
     try { lobbyRoom(sh + 4, kit, locked, menuT); } finally { if (typeof el === 'function') WIN.lobbyEllipse = el; g.restore(); }
    } catch (e) { }
   }
   return DLL0.apply(this, arguments);
  };
 }

 // the safe area moves with rotation / multitasking / the app returning: read env() again
 var again = function () { S.env = null; lastKey = ''; };
 ['resize', 'orientationchange', 'pageshow'].forEach(function (ev) { WIN.addEventListener(ev, function () { again(); setTimeout(again, 400); setTimeout(again, 1000); }); });
 if (WIN.visualViewport) WIN.visualViewport.addEventListener('resize', again);

 // the game's own 24.0.3 safe-area code shifts the pause button by the left inset (v463pz.js); the layout is already inside
 // the safe area now, so it sees no side insets while this is on (the bottom inset is left exactly as it was).
 if (typeof sa2403Insets === 'function') {
  var I0 = sa2403Insets;
  WIN.sa2403Insets = function () {
   var o = I0.apply(this, arguments);
   if (S.on && o && (o.l || o.r)) return { b: o.b, l: 0, r: 0, src: o.src };
   return o;
  };
 }

 // ---------- CSS: HTML overlays ----------
 var css = 'html.rl473 .rl473p{padding-left:calc(var(--rl473l,0px) + 4px)!important;padding-right:calc(var(--rl473r,0px) + 4px)!important;box-sizing:border-box!important}' +
  'html.rl473 #ugc41lb{right:calc(var(--rl473r,0px) + 6px)!important}' +
  'html.rl473 #i23{max-width:calc(100vw - var(--rl473l,0px) - var(--rl473r,0px) - 12px)}';
 var st = D.createElement('style'); st.id = 'rl473css'; st.textContent = css; D.head.appendChild(st);

 // full-screen fixed overlays (made by many files, some on the fly): mark them so their content gets the side padding
 var SKIP = { stage: 1, rotate: 1, rl454: 0 };
 function mark() {
  if (!S.on) return;
  var iw = WIN.innerWidth, kids = D.body ? D.body.children : [];
  for (var k = 0; k < kids.length; k++) {
   var el = kids[k];
   if (!el.id || SKIP[el.id] === 1 || el.classList.contains('rl473p') || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
   var cs = getComputedStyle(el);
   if (cs.position !== 'fixed' || cs.display === 'none') continue;
   var b = el.getBoundingClientRect();
   if (b.left <= 1 && b.width >= iw * 0.9) el.classList.add('rl473p');
  }
 }
 setInterval(mark, 400);
 try { new MutationObserver(function () { mark(); }).observe(D.body, { childList: true, attributes: true, attributeFilter: ['style', 'class'] }); } catch (e) { }

 lastKey = ''; fix(true);
})();
