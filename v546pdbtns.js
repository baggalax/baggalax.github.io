/* v546pdbtns.js - PLAY DESIGNER buttons no longer stack.
 * Cause: the designer's top-right row is drawn by three files that never knew about each other:
 *   v42pd.js puts UNDO / CLEAR / PLAYS at W-113 / W-76 / W-39, v404t.js puts HOW TO just left of UNDO (W-147),
 *   and v421s.js later added the playmaker SUB button at a FIXED x = 205. The logical width W runs 300..400 with
 *   the phone's shape (an iPhone in the app is ~333), so on most phones SUB (205..239) lands right on top of
 *   HOW TO and UNDO - the tap goes to whichever button was made last.
 * Also: GHOST MAN floated over the field above the bottom bar (W-62, just over the goal side), and its tap area
 *   blocked grabbing any guy standing under it.
 * Fix (draw-time only, nothing saved, no ids/keys/net changed): while the play designer draws, the row is laid out
 *   right to left with its own slot each: [HOW TO][SUB][UNDO][CLEAR][PLAYS]. The SUB button and HOW TO move left,
 *   UNDO/CLEAR/PLAYS stay where they always were. A long phase name under the title drops to the mini font so it
 *   never runs under HOW TO. GHOST MAN moves down into the bottom bar left of START STAGE 1 (the hint text re-wraps
 *   into the room left of it), so it no longer covers the field.
 * Kill switch: window.__rl_no546pb = true.
 */
(function () {
 'use strict';
 if (window.__rl_no546pb) return;
 const W0 = window;
 if (typeof W0.drawPlaymaker !== 'function' || typeof W0.button !== 'function' || typeof W0.rect !== 'function' || typeof W0.text !== 'function' || typeof W0.hit !== 'function') return;
 const OFF = () => !!window.__rl_no546pb;
 const LOG = { frames: 0, moved: { how: 0, sub: 0, ghost: 0, phase: 0, hint: 0 }, errs: [] };
 const er = e => { try { if (LOG.errs.length < 20) LOG.errs.push(String(e && e.stack || e).slice(0, 300)); } catch (x) {} };
 const BW = 34, GAP = 3, SUB_X0 = 205, SUB_TX0 = 222, GH_W = 58;
 const tw = (s, sc) => { try { return textW(s, sc || 1); } catch (e) { return String(s).length * 4 - 1; } };
 let on = false, inBtn = 0;
 let cur = null;              // this frame's layout
 let prev = { sub: true, how: true, botMin: null };
 let seen = null, hintBuf = null, ghostArgs = null;
 function drawGhost() { if (!ghostArgs) return; const g = ghostArgs; ghostArgs = null; inBtn++; try { B0.apply(g[0], g[1]); } catch (e) { er(e); } finally { inBtn--; } }
 function hy0() { try { return H - 17 - (typeof sa2403Dy === 'function' ? sa2403Dy(H - 17, 17) : 0); } catch (e) { return H - 17; } }
 function mkLayout() {
  const howW = tw('HOW TO', 1) + 8, undoX = W - (BW + GAP) * 3 - 2;
  const subX = undoX - GAP - BW;
  const howX = (prev.sub ? subX : undoX) - GAP - howW;
  const left = prev.how ? howX : prev.sub ? subX : undoX;
  const botMin = prev.botMin != null && prev.botMin > 60 && prev.botMin < W ? prev.botMin : W - 2 - 64;
  return { howW, howX0: undoX - 3 - howW, howX, subX, undoX, left, ghostX: Math.max(4, botMin - GAP - GH_W), hy: hy0(), ghost: false };
 }
 function inTop(y) { return y === 2 || y === 4; }
 // ---- hint text: re-wrap into the room left of the moved GHOST button ----
 function wrapN(s, n) {
  const w = String(s).split(' '), out = [ '' ];
  for (const x of w) { const L = out[out.length - 1]; if (!L.length) out[out.length - 1] = x; else if ((L + ' ' + x).length <= n) out[out.length - 1] = L + ' ' + x; else out.push(x); }
  return out.map(l => l.slice(0, n));
 }
 function flushHint(T0) {
  if (!hintBuf) return;
  const b = hintBuf; hintBuf = null;
  try {
   let s = b.lines.map(l => l[0]).join(' ').replace(/\.\.$/, '').replace(/\s+/g, ' ').trim();
   const room = cur.ghostX - 8, hy = cur.hy;
   const n1 = Math.max(8, Math.floor(room / 4));
   let L = wrapN(s, n1);
   if (L.length <= 2) {
    L.forEach((l, i) => T0.call(W0, l, 4, hy + 3 + i * 7, 1, '#fff'));
   } else if (typeof textMini === 'function') {
    const n2 = Math.max(8, Math.floor(room / 2.6));
    L = wrapN(s, n2);
    if (L.length > 3) { L.length = 3; L[2] = L[2].slice(0, n2 - 2) + '..'; }
    L.forEach((l, i) => { const w = l.length * 2.6; textMini(l, 4 + w / 2, hy + 2 + i * 5, '#fff'); });
   } else {
    L.length = 2; L[1] = L[1].slice(0, n1 - 2) + '..';
    L.forEach((l, i) => T0.call(W0, l, 4, hy + 3 + i * 7, 1, '#fff'));
   }
   LOG.moved.hint++;
  } catch (e) { er(e); try { for (const l of b.lines) T0.apply(W0, l); } catch (x) {} }
 }
 // ---- wrappers (active only while the play designer draws) ----
 const B0 = W0.button;
 W0.button = function (label, x, y, w, h, fn, opt) {
  if (on && !inBtn) {
   try {
    flushHint(T0);
    const lab = String(label);
    if (/^GHOST /.test(lab) && x === W - 62 && w === GH_W) {
     // drawn later, after the bottom bar's dark strip, so it is not dimmed by it
     cur.ghost = true; LOG.moved.ghost++;
     ghostArgs = [ this, [ label, cur.ghostX, H - 16, w, 13, fn, opt ] ];
     return;
    } else if (y === H - 16 && h === 13) {
     seen.botMin = seen.botMin == null ? x : Math.min(seen.botMin, x);
     drawGhost();
    }
   } catch (e) { er(e); }
  }
  inBtn++;
  try { return B0.call(this, label, x, y, w, h, fn, opt); } finally { inBtn--; }
 };
 const R0 = W0.rect;
 W0.rect = function (x, y, w, h, c) {
  if (on && !inBtn) {
   try {
    if (hintBuf) flushHint(T0);
    if (inTop(y) && (h === 13 || h === 1)) {
     if (w === cur.howW && x === cur.howX0) { x = cur.howX; seen.how = true; }
     else if (w === BW && x === SUB_X0 && h === 13) { x = cur.subX; seen.sub = true; }
    }
   } catch (e) { er(e); }
  }
  return R0.call(this, x, y, w, h, c);
 };
 const T0 = W0.text;
 W0.text = function (s, x, y, sc, col, align, shadow) {
  if (on && !inBtn) {
   try {
    const S = String(s);
    if (y === 6 && S === 'HOW TO' && x === cur.howX0 + cur.howW / 2) { x = cur.howX + cur.howW / 2; LOG.moved.how++; }
    else if (y === 6 && x === SUB_TX0 && /^(SUB( \d+)?|DONE)$/.test(S)) { x = cur.subX + BW / 2; LOG.moved.sub++; }
    else if (x === 34 && y === 10 && col === '#8fe3f0') {
     if (hintBuf) flushHint(T0);
     const room = cur.left - GAP - 34;
     if (tw(S, 1) > room && typeof textMini === 'function') {
      let t = S; const n = Math.max(4, Math.floor(room / 2.6));
      if (t.length > n) t = t.slice(0, n - 2) + '..';
      LOG.moved.phase++;
      return textMini(t, 34 + t.length * 2.6 / 2, 11, col);
     }
    } else if (cur.ghost && x === 4 && (sc === 1 || sc == null) && col === '#fff' && (y === cur.hy + 3 || y === cur.hy + 10)) {
     if (!hintBuf) hintBuf = { lines: [] };
     hintBuf.lines.push([ S, x, y, sc, col, align, shadow ]);
     if (y === cur.hy + 10) flushHint(T0);
     return;
    } else if (hintBuf) flushHint(T0);
   } catch (e) { er(e); }
  }
  return T0.call(this, s, x, y, sc, col, align, shadow);
 };
 const H0 = W0.hit;
 W0.hit = function (key, x, y, w, h, fn, label) {
  if (on && !inBtn) {
   try {
    if (hintBuf) flushHint(T0);
    const k = String(key);
    if (k === 'HOW TO' && x === cur.howX0 && w === cur.howW) { x = cur.howX; seen.how = true; }
    else if (k === 'SUB421 PM' && x === SUB_X0 && w === BW) { x = cur.subX; seen.sub = true; }
   } catch (e) { er(e); }
  }
  return H0.call(this, key, x, y, w, h, fn, label);
 };
 const DP0 = W0.drawPlaymaker;
 W0.drawPlaymaker = function () {
  let act = false;
  try { act = !OFF() && typeof screen !== 'undefined' && screen === 'playmaker' && typeof PM !== 'undefined' && !!PM && !!PM.pd42; } catch (e) { act = false; }
  if (!act) return DP0.apply(this, arguments);
  try { cur = mkLayout(); seen = { how: false, sub: false, botMin: null }; hintBuf = null; ghostArgs = null; } catch (e) { er(e); return DP0.apply(this, arguments); }
  on = true;
  try { return DP0.apply(this, arguments); }
  finally {
   try { if (hintBuf) flushHint(T0); } catch (e) { er(e); }
   try { drawGhost(); } catch (e) { er(e); }
   on = false; hintBuf = null; ghostArgs = null;
   prev = { sub: seen.sub, how: seen.how, botMin: seen.botMin != null ? seen.botMin : prev.botMin };
   LOG.frames++;
  }
 };

 // ---- a guy standing under a bottom-bar button can still be grabbed ----
 // A drag that STARTS on a bottom-bar button over a guy (set / add-ball phase) goes to the field instead;
 // a plain tap (no movement) still presses the button.
 (function () {
  let G = null, killClick = 0;
  const now2 = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function bottomHb(el) {
   try {
    const b = el && el.closest && el.closest('#ui .hb'); if (!b) return null;
    const r = b.getBoundingClientRect(), c = cv.getBoundingClientRect();
    return r.top > c.top + c.height * .6 ? b : null;
   } catch (e) { return null; }
  }
  function pieceUnder(cx, cy) {
   try {
    if (OFF() || screen !== 'playmaker' || !PM || !PM.pd42 || !PM.play || !Array.isArray(PM.play.start)) return false;
    const d = PM.pd42; if (d.pv || !(d.phase === 'set' || d.phase === 'ball')) return false;
    if (typeof gameInputOn === 'function' && !gameInputOn()) return false;
    const w = pmWorld(toLogical({ clientX: cx, clientY: cy }));
    return pmPieceAt(w.x, w.y, PM.play.start) >= 0;
   } catch (e) { er(e); return false; }
  }
  const pt = (x, y) => ({ clientX: x, clientY: y });
  function startDrag() { if (G.drag) return; G.drag = true; LOG.passDrags = (LOG.passDrags || 0) + 1; inDown(G.k + G.id, pt(G.x0, G.y0)); }
  const opt = { capture: true, passive: false };
  document.addEventListener('touchstart', e => {
   try {
    if (G || !e.changedTouches || !e.changedTouches.length) return;
    const t = e.changedTouches[0], el = bottomHb(e.target);
    if (!el || !pieceUnder(t.clientX, t.clientY)) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    G = { k: 't', id: t.identifier, x0: t.clientX, y0: t.clientY, el, drag: false };
   } catch (x) { er(x); G = null; }
  }, opt);
  document.addEventListener('touchmove', e => {
   if (!G || G.k !== 't') return;
   try {
    for (const t of e.changedTouches) if (t.identifier === G.id) {
     if (!G.drag && Math.hypot(t.clientX - G.x0, t.clientY - G.y0) > 6) startDrag();
     if (G.drag) inMove('t' + G.id, t);
     if (e.cancelable) e.preventDefault();
     e.stopPropagation();
    }
   } catch (x) { er(x); }
  }, opt);
  const tEnd = cancel => e => {
   if (!G || G.k !== 't') return;
   try {
    for (const t of e.changedTouches) if (t.identifier === G.id) {
     const g = G; G = null;
     if (e.cancelable) e.preventDefault();
     e.stopPropagation();
     if (g.drag) inUp('t' + g.id, cancel ? null : t, !!cancel);
     else if (!cancel) { LOG.passTaps = (LOG.passTaps || 0) + 1; g.el.click(); }
    }
   } catch (x) { er(x); G = null; }
  };
  document.addEventListener('touchend', tEnd(false), opt);
  document.addEventListener('touchcancel', tEnd(true), opt);
  // mouse / pen
  document.addEventListener('pointerdown', e => {
   try {
    if (G || e.pointerType === 'touch') return;
    const el = bottomHb(e.target);
    if (!el || !pieceUnder(e.clientX, e.clientY)) return;
    G = { k: 'p', id: e.pointerId, x0: e.clientX, y0: e.clientY, el, drag: false };
   } catch (x) { er(x); G = null; }
  }, true);
  document.addEventListener('pointermove', e => {
   if (!G || G.k !== 'p' || e.pointerId !== G.id) return;
   try {
    if (!G.drag && Math.hypot(e.clientX - G.x0, e.clientY - G.y0) > 6) startDrag();
    if (G.drag) { inMove('p' + G.id, e); e.stopPropagation(); }
   } catch (x) { er(x); }
  }, true);
  const pEnd = cancel => e => {
   if (!G || G.k !== 'p' || e.pointerId !== G.id) return;
   const g = G; G = null;
   try { if (g.drag) { e.stopPropagation(); inUp('p' + g.id, cancel ? null : e, !!cancel); killClick = now2() + 600; } } catch (x) { er(x); }
  };
  document.addEventListener('pointerup', pEnd(false), true);
  document.addEventListener('pointercancel', pEnd(true), true);
  document.addEventListener('click', e => { if (killClick && now2() < killClick && bottomHb(e.target)) { killClick = 0; e.preventDefault(); e.stopPropagation(); } }, true);
 })();
 window.__rl546 = { LOG, layout: () => cur, prev: () => prev };
})();
