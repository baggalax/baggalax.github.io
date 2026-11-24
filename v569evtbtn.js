/* v569evtbtn.js - the SPECIAL GAMES button wears the event's theme (Bagga Lax 1.4, Nov 2026). Kill switch: window.__rl_no569 = true.
 * Charlie: when I switch on a game in Special Games, the button on the PLAY page changes to that event's theme and says the
 * game mode (like Veterans did) - not just a blue button with text.
 * One reusable theme list: EVT569.reg(modeId, { name, short, bg, bg2, fg, shadow, sub, pattern, icon, open }).
 *   pattern: 'plaid' (fall flannel) / 'stars' / none.  icon: 'drumstick' / 'star' (pixel sprites below).
 * When exactly ONE themed special is on, the button takes its colors, pattern, icon and name, shows its timer, and opens it.
 * Several on: v502 / v526 list as before. None on: v526 gray lock as before.
 * Wraps menuBars / menuBar outside v526 (waits for it). No ids, rl_ keys or net touched. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v569_loaded || W.__rl_v124gb) return;
 W.__rl_v569_loaded = 1;
 const T = {};
 const V = W.EVT569 = { log: [], err: [], reg: (id, th) => { T[id] = th; }, get: id => T[id] || null, themes: T };
 const off = () => !!W.__rl_no569 || !W.LIVEOPS;
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e)); };
 // Veterans: the look it already had, now from the theme list
 V.reg('mode_vets489', { name: 'VETERANS TOURNAMENT', short: 'VETERANS', bg: '#5aa0ff', bg2: '#3f86e6', fg: '#0b1a20', shadow: null, sub: '#fff', pattern: 'stars', icon: 'star',
  open: () => { try { VETS489.openTour(); } catch (e) {} } });
 const ICONS = {
  drumstick: { rows: [ '..ooo......', '.oMmmo.....', 'oMmmmmo....', 'ommmmmo....', 'ommmmmo....', '.ommmmbo...', '..ooobbbo..', '......obbww', '.......owww', '........ow.' ],
   pal: { o: '#2a1606', m: '#9b5a26', M: '#d98a4a', b: '#f4ecd8', w: '#f4ecd8' } },
  star: { rows: [ '....o....', '...oyo...', '...oyo...', 'ooooyoooo', 'oyyyyyyyo', '.oyyyyyo.', '..oyyyo..', '.oyyoyyo.', '.oyo.oyo.', '.oo...oo.' ], pal: { o: '#0b1a20', y: '#ffd84d' } } // 1.5c (Jonny): cleaner outlined star (the 7x6 one read as noise)
 };
 function sprite(name, x, y, sc) {
  const I = ICONS[name];
  if (!I) return 0;
  I.rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = I.pal[r[i]]; if (c) rect(x + i * sc, y + j * sc, sc, sc, c); } });
  return I.rows[0].length * sc;
 }
 const iconH = name => ICONS[name] ? ICONS[name].rows.length : 0;
 function pattern(b, th) {
  if (th.pattern === 'plaid') {
   const c = th.bg2 || 'rgba(0,0,0,.15)';
   for (let x = b.x + 6; x < b.x + b.w; x += 18) rect(x, b.y, 4, b.h, c);
   for (let y = b.y + 5; y < b.y + b.h - 3; y += 11) rect(b.x, y, b.w, 2, 'rgba(255,214,120,.18)');
  } else if (th.pattern === 'stars') {
   for (let x = b.x + 9, k = 0; x < b.x + b.w - 4; x += 23, k++) rect(x, b.y + (k % 2 ? 5 : b.h - 8), 1, 1, 'rgba(255,255,255,.55)');
  }
 }
 function on1() {
  let on = [];
  try { on = (LIVEOPS.activeSpecials() || []).filter(s => !/^(gift_|mode_turkey565)/.test(s.id)); } catch (e) {}
  return on.length === 1 && T[on[0].id] ? on[0].id : null;
 }
 V.current = on1;
 function fix(rows) {
  if (off() || !Array.isArray(rows)) return rows;
  const id = on1();
  if (!id) return rows;
  const th = T[id];
  for (const r of rows) {
   if (!Array.isArray(r)) continue;
   for (let k = 0; k < r.length; k++) {
    const b = r[k];
    if (!b || !b.lo502 || b.v569) continue;
    r[k] = Object.assign({}, b, { v569: id, v526: 1, label: th.name, bg: th.bg, fg: th.fg, loOff: false, fn: th.open || b.fn });
   }
  }
  return rows;
 }
 function fitLeft(id, avail) {
  let L = '';
  try { L = LIVEOPS.leftText(id) || ''; } catch (e) {}
  if (!L) return '';
  const rest = L.replace(/^LEAVES IN /, '');
  for (const s of [ L, 'ENDS ' + rest, rest + ' LEFT', rest, rest.split(' ')[0] ]) if (textW(s, 1) <= avail) return s;
  return '';
 }
 // same chunky bar as v469 / v526, in the event's colors, with its pattern + pixel icon
 function draw(b) {
  const th = T[b.v569];
  rect(b.x, b.y + 3, b.w, b.h, '#000');
  rect(b.x, b.y, b.w, b.h, th.bg);
  pattern(b, th);
  rect(b.x, b.y, b.w, 2, 'rgba(255,255,255,.45)');
  rect(b.x, b.y + b.h - 3, b.w, 3, 'rgba(0,0,0,.2)');
  rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
  const left = fitLeft(b.v569, Math.max(0, b.w - 12));
  const sub = left ? 7 : 0;
  const ih = iconH(th.icon), isc = ih && b.h - sub >= ih * 2 + 4 ? 2 : 1, iw = ih ? ICONS[th.icon].rows[0].length * isc : 0;
  const fits = (s, sc) => textW(s, sc) + iw + 4 * sc + 16 <= b.w;
  let label = th.name, sc = 2;
  if (!fits(label, 2)) { label = th.short || th.name; if (!fits(label, 2)) sc = 1; }
  if (!left && fits(label, 3) && b.h >= 22) sc = 3;
  const tw0 = textW(label, sc), cx = Math.round(b.x + b.w / 2);
  const ty = Math.round(b.y + (b.h - sub - 5 * sc) / 2);
  const x0 = Math.round(cx - (tw0 + iw + 3 * sc) / 2);
  if (iw) sprite(th.icon, x0, Math.round(ty + (5 * sc - ih * isc) / 2), isc);
  text(label, x0 + iw + 3 * sc, ty, sc, th.fg || '#0b1a20', 'left', th.shadow || undefined);
  if (left) text(left, cx, b.y + b.h - 9, 1, th.sub || '#fff', 'center', 'rgba(0,0,0,.35)');
 }
 V.draw = draw;
 function wrap() {
  const v526ok = !!W.__rl_no526vb || !!(W.V526VB && V526VB.log.indexOf('bars') >= 0 && V526VB.log.indexOf('bar') >= 0);
  if (!v526ok || !W.menuBars || !W.menuBars.__lo502 && !W.menuBars.__d563) return;
  if (typeof W.menuBars === 'function' && !W.menuBars.__v569) {
   const m0 = W.menuBars;
   const w = function () { const rows = m0.apply(this, arguments); try { return fix(rows); } catch (e) { fail('bars', e); return rows; } };
   Object.assign(w, m0);
   w.__lo502 = w.__v526 = w.__v569 = true;
   W.menuBars = w;
   V.log.push('bars');
  }
  if (typeof W.menuBar === 'function' && !W.menuBar.__v569) {
   const b0 = W.menuBar;
   const w = function (b, live) {
    if (off() || !b || !b.v569 || !T[b.v569]) return b0.apply(this, arguments);
    try {
     if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
     draw(b);
     return;
    } catch (e) { fail('bar', e); return b0.apply(this, arguments); }
   };
   Object.assign(w, b0);
   w.__lo502 = w.__v526 = w.__v569 = true;
   W.menuBar = w;
   V.log.push('bar');
  }
  // the SPECIAL GAMES list (several on): PLAY on a themed mode opens it
  try {
   if (typeof PANEL_ACT === 'object' && !V.act) {
    let inner = PANEL_ACT.lo502mode;
    Object.defineProperty(PANEL_ACT, 'lo502mode', {
     configurable: true, enumerable: true,
     get: () => function (id) { if (!off() && T[id] && T[id].open && id !== 'mode_vets489') return T[id].open(); return inner ? inner.apply(this, arguments) : undefined; },
     set: f => { inner = f; }
    });
    V.act = 1;
   }
  } catch (e) { fail('act', e); }
 }
 wrap();
 setInterval(() => { try { if (!off()) wrap(); } catch (e) { fail('wrap', e); } }, 400);
})();
