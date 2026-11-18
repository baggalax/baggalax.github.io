/* v526vetbtn.js - PLAY screen: the event button says VETERANS TOURNAMENT while the Veterans event runs (Bagga Lax).
   v502live renamed the v489 'VETERANS TOURNAMENT' button to 'SPECIAL GAMES' and put 'VETERANS TOURNAMENT LEAVES IN 3D 13H'
   under it, which ran off the right edge of the button on phones.
   - Veterans on (the only special on): title 'VETERANS TOURNAMENT' (just 'VETERANS' on buttons too narrow for it), blue, timer line 'LEAVES IN 3D 13H' (shortened to fit the
     button), tap opens the same Veterans tournament screen as before (v502's own openSpecials -> VETS489.openTour).
   - Nothing on (event over): title 'SPECIAL GAMES', gray + dimmed, lock icon, tap shows 'NONE AVAILABLE' and opens nothing.
   - Several specials on: 'SPECIAL GAMES' as v502 has it, timer line shortened to fit.
   Wraps menuBars / menuBar outside v502 (v502 hooks after its config fetch, so this waits for it). No ids, rl_ keys or net touched.
   Kill switch: window.__rl_no526vb = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no526vb) return;
 const V = W.V526VB = { log: [], err: [] };
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!W.__rl_no526vb || !W.LIVEOPS;
 const tw = s => (typeof textW === 'function' ? textW(s, 1) : String(s).length * 4 - 1);
 function fitLeft(id, avail) {
  let L = '';
  try { L = W.LIVEOPS.leftText(id) || ''; } catch (e) {}
  if (!L) return '';
  const rest = L.replace(/^LEAVES IN /, '');
  const c = [ L, 'ENDS ' + rest, rest + ' LEFT', rest, rest.split(' ')[0] ];
  for (const s of c) if (tw(s) <= avail) return s;
  return '';
 }
 function none() { try { V17.toast('NONE AVAILABLE', '#c8d0d4'); } catch (e) {} }
 function fix(rows) {
  if (off() || !Array.isArray(rows)) return rows;
  for (const r of rows) {
   if (!Array.isArray(r)) continue;
   for (let k = 0; k < r.length; k++) {
    const b = r[k];
    if (!b || !b.lo502 || b.v526) continue;
    let on = [];
    try { on = LIVEOPS.activeSpecials() || []; } catch (e) {}
    const nb = Object.assign({}, b, { v526: 1 });
    if (!on.length) {
     Object.assign(nb, { label: 'SPECIAL GAMES', fn: none, bg: '#5a6570', fg: '#9aa', loOff: true, loLeft: '', v526lock: 1 });
    } else if (on.length === 1 && on[0].id === 'mode_vets489') {
     Object.assign(nb, { label: 'VETERANS TOURNAMENT', bg: '#5aa0ff', loOff: false, v526id: 'mode_vets489' });
    } else {
     nb.v526multi = on.map(s => s.id);
    }
    r[k] = nb;
   }
  }
  return rows;
 }
 function lock(b) {
  const x = b.x + b.w - 14, y = Math.round(b.y + b.h / 2 - 5);
  rect(x + 1, y, 5, 1, '#c8d0d4'); rect(x, y + 1, 1, 4, '#c8d0d4'); rect(x + 6, y + 1, 1, 4, '#c8d0d4');
  rect(x - 1, y + 4, 9, 7, '#c8d0d4'); rect(x + 3, y + 6, 1, 3, '#2a3238');
 }
 // the event bar: same chunky look as v469's big PLAY bars, but the title sits high (scale 2) so the timer line fits under it
 function drawEvent(b, avail) {
  rect(b.x, b.y + 3, b.w, b.h, '#000');
  rect(b.x, b.y, b.w, b.h, b.bg || '#5aa0ff');
  rect(b.x, b.y, b.w, 2, 'rgba(255,255,255,.45)');
  rect(b.x, b.y + b.h - 3, b.w, 3, 'rgba(0,0,0,.2)');
  rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
  const left = fitLeft(b.v526id, avail);
  const sub = left ? 7 : 0;
  const fits = (s, sc) => textW(s, sc) + 5 * sc + 16 <= b.w;
  let label = 'VETERANS TOURNAMENT', sc = 2;
  if (!fits(label, 2)) { label = 'VETERANS'; if (!fits(label, 2)) sc = 1; }
  if (!left && fits(label, 3) && b.h >= 22) sc = 3;
  const tw0 = textW(label, sc), tri = 3 * sc, cx = Math.round(b.x + b.w / 2);
  const ty = Math.round(b.y + (b.h - sub - 5 * sc) / 2);
  const x0 = Math.round(cx - (tw0 + tri + 2 * sc) / 2);
  for (let i = 0; i < tri; i++) rect(x0 + i, ty + Math.round(i / 2), 1, 5 * sc - 2 * Math.round(i / 2), '#0b1a20');
  text(label, x0 + tri + 2 * sc, ty, sc, '#0b1a20', 'left');
  if (left) text(left, cx, b.y + b.h - 9, 1, '#fff', 'center', 'rgba(0,0,0,.35)');
 }
 function wrapBars() {
  const m0 = W.menuBars;
  const w = function () { const rows = m0.apply(this, arguments); try { return fix(rows); } catch (e) { fail('bars', e); return rows; } };
  w.__lo502 = true; w.__v526 = true;
  W.menuBars = w;
 }
 function wrapBar() {
  const b0 = W.menuBar;
  const w = function (b, live) {
   if (off() || !b || !b.v526) return b0.apply(this, arguments);
   let bb = b;
   try {
    const avail = Math.max(0, (b.w | 0) - (b.v526lock ? 24 : 12));
    if (b.v526id) {
     if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
     drawEvent(b, avail);
     return;
    }
    else if (b.v526multi) {
     let s = b.loLeft || '';
     if (tw(s) > avail) s = b.v526multi.length + ' ON NOW';
     bb = Object.assign({}, b, { loLeft: tw(s) <= avail ? s : '' });
    }
   } catch (e) { fail('fit', e); }
   const r = b0.call(this, bb, live);
   try {
    if (b.v526lock) { rect(b.x, b.y, b.w, b.h, 'rgba(20,26,30,.35)'); lock(b); }
   } catch (e) { fail('lock', e); }
   return r;
  };
  w.__lo502 = true; w.__v526 = true;
  W.menuBar = w;
 }
 function hook() {
  try {
   if (off()) return;
   if (typeof W.menuBars === 'function' && W.menuBars.__lo502 && !W.menuBars.__v526) { wrapBars(); V.log.push('bars'); }
   if (typeof W.menuBar === 'function' && W.menuBar.__lo502 && !W.menuBar.__v526) { wrapBar(); V.log.push('bar'); }
  } catch (e) { fail('hook', e); }
 }
 hook();
 setInterval(hook, 400);
})();
