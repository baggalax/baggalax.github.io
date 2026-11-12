/* v500v13.js - Bagga Lax 1.3 fixes.
   Kill switch: window.__rl_no500 = true (set before this file loads).
   Sticks, military cards + the N/A uniform picker, the check lock, Whale/Crown gear,
   Halloween kits on non-pro teams, season gear across leaving the app, controller menus. */
(function () {
 'use strict';
 if (window.__rl_no500 || window.V500) return;
 const W = window;
 const V = W.V500 = { log: [], err: [] };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { V.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!W.__rl_no500;

 const GREEN = [ 'stick_v491ss', 'stick_v491rwb', 'stick_v491hw' ];
 const PURP = 'stick_spooky';
 try {
  const st = document.createElement('style');
  st.id = 'v500css';
  st.textContent = [
   '#panel .c17.v13g,#panel .c17[data-v="stick_v491ss"],#panel .c17[data-v="stick_v491rwb"],#panel .c17[data-v="stick_v491hw"]{border-color:#5fbf4a;background:linear-gradient(#24401a,#0e1a0a);animation:none}',
   '#panel .c17.v13g .art,#panel .c17[data-v="stick_v491ss"] .art,#panel .c17[data-v="stick_v491rwb"] .art,#panel .c17[data-v="stick_v491hw"] .art{background:radial-gradient(circle,#2f6a32,#102010 70%)}',
   '#panel .c17.v13g .rr,#panel .c17[data-v="stick_v491ss"] .rr,#panel .c17[data-v="stick_v491rwb"] .rr,#panel .c17[data-v="stick_v491hw"] .rr{color:#c8f0b0}',
   '#panel .c17.v13g::after,#panel .c17[data-v="stick_v491ss"]::after,#panel .c17[data-v="stick_v491rwb"]::after,#panel .c17[data-v="stick_v491hw"]::after{background:linear-gradient(115deg,transparent 40%,rgba(150,230,120,.35) 50%,transparent 60%)}',
   '#panel .c17.v13p,#panel .c17[data-v="stick_spooky"]{border-color:#b48aff;background:linear-gradient(#3a1a5a,#170a26);animation:none}',
   '#panel .c17.v13p .art,#panel .c17[data-v="stick_spooky"] .art{background:radial-gradient(circle,#5a2a88,#1a0a28 70%)}',
   '#panel .c17.v13p .rr,#panel .c17[data-v="stick_spooky"] .rr{color:#d8c2ff}',
   '#panel .c17.v13p::after,#panel .c17[data-v="stick_spooky"]::after{background:linear-gradient(115deg,transparent 40%,rgba(200,160,255,.35) 50%,transparent 60%)}',
   '#ui button.hb.v500f,#panel .v500f{outline:2px solid #ffe14d;outline-offset:1px;z-index:2}'
  ].join('');
  document.head.appendChild(st);
 } catch (e) { fail('css', e); }

 try {
  if (W.V17 && typeof V17.cardHtml === 'function') {
   const ch0 = V17.cardHtml;
   V17.cardHtml = function (id) {
    let h = ch0.apply(this, arguments);
    if (typeof h !== 'string' || off()) return h;
    const cls = id === PURP ? ' v13p' : GREEN.indexOf(id) >= 0 ? ' v13g' : '';
    if (cls) h = h.replace('class="c17', 'class="c17' + cls);
    return h;
   };
  }
 } catch (e) { fail('cards', e); }

 // military player cards wear the branch kit (astronaut, camo, ...) not the flat team colours
 try {
  if (W.V22 && typeof V22.kitOf === 'function') {
   const k0 = V22.kitOf;
   V22.kitOf = function (pid) {
    try {
     const p = typeof PP === 'function' ? PP(pid) : null;
     const vt = p && p.team;
     if (!off() && p && (p.vc494 || p.vets489) && vt && W.VETS489 && VETS489.kitOf && VETS489.isVet && VETS489.isVet(vt)) {
      const k = W.UNI21 && UNI21.savedK ? UNI21.savedK(vt) : 0;
      const kit = VETS489.kitOf(vt, k);
      if (kit) return kit;
     }
    } catch (e) { fail('kit', e); }
    return k0.apply(this, arguments);
   };
  }
 } catch (e) { fail('kitwrap', e); }

 // N/A tab of the card-team uniform picker includes the six service teams
 try {
  if (W.V33 && typeof V33.uniGroups === 'function') {
   const ug0 = V33.uniGroups;
   V33.uniGroups = function () {
    const g = ug0.apply(this, arguments);
    try {
     if (off() || W.__rl_no489vets || !W.VETS489 || !VETS489.ids) return g;
     const na = g['N/A'] = (g['N/A'] || []).slice();
     for (const id of VETS489.ids) if (na.indexOf(id) < 0 && typeof T === 'function' && T(id)) na.push(id);
    } catch (e) { fail('na', e); }
    return g;
   };
  }
 } catch (e) { fail('ug', e); }

 // checking must not freeze the controlled defender on the player he checked
 function freeChk(name) {
  const f = W[name];
  if (typeof f !== 'function') return;
  W[name] = function () {
   const r = f.apply(this, arguments);
   try {
    const G = (typeof game !== 'undefined' ? game : null), d = G && G.dctl;
    if (!off() && d) { d.stun = 0; d.lunge = null; }
   } catch (e) {}
   return r;
  };
 }
 try { freeChk('dCheck'); freeChk('dHit'); } catch (e) { fail('chk', e); }
 try {
  if (typeof W.updateDefense === 'function') {
   const ud = W.updateDefense;
   W.updateDefense = function () {
    try {
     const G = (typeof game !== 'undefined' ? game : null), d = G && G.dctl;
     if (!off() && d && d.chkT0 != null && (typeof menuT !== 'number' || menuT - d.chkT0 < 1.2)) { d.stun = 0; d.lunge = null; }
    } catch (e) {}
    return ud.apply(this, arguments);
   };
  }
 } catch (e) { fail('def', e); }

 // season gear survives leaving the app: copy anything that landed on the quick shelf back onto the season roster
 try {
  const ST = W.V17 && V17.ST && V17.ST();
  const Sz = typeof season !== 'undefined' ? season : null;
  if (ST && Sz && Sz.team && ST.tequip && ST.tequip[Sz.team]) {
   const ros = new Set((Sz.rosters && Sz.rosters[Sz.team]) || []);
   const box = ST.tequip[Sz.team];
   let n = 0;
   for (const pid in box) {
    if (ros.size && !ros.has(pid)) continue;
    const e = box[pid];
    if (!e || typeof e !== 'object') continue;
    ST.equip[pid] = Object.assign({}, e, ST.equip[pid] || {});
    n++;
   }
   if (n) { try { V17.save(); } catch (e) {} note('seasonGear ' + n); }
  }
 } catch (e) { fail('gear', e); }
 try {
  const flush = () => { try { if (!off() && W.V17 && V17.save) V17.save(); } catch (e) {} };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); }, true);
  window.addEventListener('pagehide', flush, true);
 } catch (e) { fail('flush', e); }

 // Halloween kit (index 7) only on the two pro teams
 function stripHw(h) {
  if (off() || typeof h !== 'string' || h.indexOf('|7') < 0) return h;
  const tp = document.createElement('template');
  tp.innerHTML = h;
  let ch = false;
  tp.content.querySelectorAll('[data-v]').forEach(el => {
   const v = el.getAttribute('data-v') || '';
   const m = /^(.*)\|7$/.exec(v);
   if (!m) return;
   let base = m[1];
   try { if (W.UNI21 && UNI21.base) base = UNI21.base(base); } catch (e) {}
   if (base === 'WAT' || base === 'ARC') return;
   const nm = el.querySelector('.nm');
   if (nm && nm.textContent && nm.textContent.indexOf('HALLOWEEN') < 0) return;
   const sec = el.closest('.sec17');
   el.remove();
   ch = true;
   if (sec) {
    const sp = sec.querySelector('.sh17 span');
    const mm = sp && /^(\d+)\s*\/\s*(\d+)/.exec((sp.textContent || '').trim());
    if (mm) sp.textContent = mm[1] + ' / ' + Math.max(+mm[1], +mm[2] - 1);
   }
  });
  return ch ? tp.innerHTML : h;
 }
 try {
  if (typeof PANEL_RENDER === 'object' && PANEL_RENDER && typeof PANEL_RENDER.locker17 === 'function') {
   const lk = PANEL_RENDER.locker17;
   PANEL_RENDER.locker17 = function () {
    const h = lk.apply(this, arguments);
    try { return stripHw(h); } catch (e) { fail('hw', e); return h; }
   };
  }
 } catch (e) { fail('hw2', e); }

 // Whale / Crown: last tile of each uniform set in the card-team picker
 function fitState() {
  try { const v = JSON.parse(localStorage.getItem('rl_fit46') || 'null'); if (v && v.t && typeof v.t === 'object') return v; } catch (e) {}
  return { t: {} };
 }
 function fitOn(tid) {
  try { return !!(tid && W.UNI21 && fitState().t[UNI21.base(tid)]); } catch (e) { return false; }
 }
 function fitSet(tid, on) {
  const b = UNI21.base(tid), v = fitState();
  if (on) v.t[b] = 1; else delete v.t[b];
  try { localStorage.setItem('rl_fit46', JSON.stringify(v)); } catch (e) {}
  try {
   const o = JSON.parse(localStorage.getItem('rl_fit45') || 'null');
   if (o && typeof o === 'object') { o.wear = Object.keys(v.t).length > 0; localStorage.setItem('rl_fit45', JSON.stringify(o)); }
  } catch (e) {}
 }
 const swatch = w => {
  const c = document.createElement('canvas'); c.width = 20; c.height = 20;
  const x = c.getContext('2d');
  x.fillStyle = w === 'whale' ? '#ff8cc6' : '#a6d8f7';
  x.fillRect(4, 2, 12, 8);
  x.fillStyle = w === 'whale' ? '#1d2a5e' : '#4a6f8e';
  x.fillRect(4, 8, 12, 2);
  x.fillStyle = '#d2bc8a';
  x.fillRect(5, 11, 4, 6); x.fillRect(11, 11, 4, 6);
  x.fillStyle = '#7a4f2a';
  x.fillRect(5, 17, 4, 2); x.fillRect(11, 17, 4, 2);
  if (w === 'crown') { x.fillStyle = '#ffcc33'; x.fillRect(6, 0, 8, 2); x.fillRect(6, 0, 2, 3); x.fillRect(12, 0, 2, 3); }
  return c.toDataURL();
 };
 const SW = { whale: null, crown: null };
 function fitTile(tid, w) {
  const on = fitOn(tid), nm = w === 'whale' ? 'THE WHALE' : 'THE CROWN';
  if (!SW[w]) SW[w] = swatch(w);
  return '<button type="button" class="c17 uni17 v500fit' + (on ? ' wr17' : '') + '" data-a="v500fit" data-v="' + tid + '" aria-label="' + nm + (on ? ' (WEARING)' : '') + '"><div class="art"><img src="' + SW[w] + '" alt=""></div><div class="nm">' + nm + '</div><div class="rr">' + (on ? 'WEARING' : 'TAP TO WEAR') + '</div></button>';
 }
 // the set's grid is pointer-events:none (v35ct: a tap anywhere on a set picks the set) - the Whale/Crown tile takes its own taps
 try {
  if (!document.getElementById('v500fitcss')) {
   const st = document.createElement('style');
   st.id = 'v500fitcss';
   st.textContent = '#panel .ct35ur .grid17 .v500fit{pointer-events:auto;position:relative;z-index:3;cursor:pointer}';
   (document.head || document.documentElement).appendChild(st);
  }
 } catch (e) { fail('fitcss', e); }
 function addFits(h) {
  if (off() || typeof h !== 'string' || h.indexOf('ct35ug') < 0) return h;
  const w = W.V445 && V445.pick && V445.pick();
  if (w !== 'whale' && w !== 'crown') return h;
  const tp = document.createElement('template');
  tp.innerHTML = h;
  let ch = false;
  tp.content.querySelectorAll('.sec17.ct35ur').forEach(sec => {
   const tid = sec.getAttribute('data-v') || sec.getAttribute('data-t');
   const grid = sec.querySelector('.grid17');
   if (!tid || !grid || grid.querySelector('.v500fit')) return;
   const box = document.createElement('template');
   box.innerHTML = fitTile(tid, w);
   grid.appendChild(box.content);
   ch = true;
  });
  return ch ? tp.innerHTML : h;
 }
 try {
  if (typeof PANEL_RENDER === 'object' && PANEL_RENDER && typeof PANEL_RENDER.ct33 === 'function') {
   const r0 = PANEL_RENDER.ct33;
   PANEL_RENDER.ct33 = function () {
    let h = r0.apply(this, arguments);
    try { h = addFits(h); } catch (e) { fail('fit', e); }
    return h;
   };
  }
  if (typeof PANEL_ACT === 'object' && PANEL_ACT) {
   PANEL_ACT.v500fit = function (v) {
    if (off() || !v || !W.UNI21) return;
    const w = W.V445 && V445.pick && V445.pick();
    if (w !== 'whale' && w !== 'crown') return;
    fitSet(v, !fitOn(v));
    // wearing it on a set also picks that set for the card team (the tap no longer falls through to the set)
    try { if (fitOn(v) && typeof PANEL_ACT.ct35uput === 'function') { const sec = document.querySelector('#panel .sec17.ct35ur[data-v="' + v + '"]'); if (sec && !sec.classList.contains('on')) PANEL_ACT.ct35uput(v); } } catch (e) { fail('fitput', e); }
    try { if (W.V17 && V17.toast) V17.toast((fitOn(v) ? 'WEARING ' : 'OFF ') + (w === 'whale' ? 'THE WHALE' : 'THE CROWN'), '#7dff7a'); } catch (e) {}
   };
  }
 } catch (e) { fail('fit2', e); }

 // controller: move through menus with the left stick / d-pad, confirm with the pass button (Cross / A)
 const MF = { i: 0, dir: '', t: 0, el: null };
 function targets() {
  const out = [];
  const push = el => {
   if (!el || el.disabled) return;
   const r = el.getBoundingClientRect();
   if (r.width < 2 || r.height < 2) return;
   out.push({ el: el, x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };
  const panel = document.getElementById('panel');
  if (panel && panel.style.display !== 'none') panel.querySelectorAll('button, [data-a]').forEach(push);
  const ui = document.getElementById('ui');
  if (ui) ui.querySelectorAll('button.hb').forEach(push);
  out.sort((a, b) => (a.y - b.y) || (a.x - b.x));
  return out;
 }
 function focusAt(list, i) {
  if (MF.el) MF.el.classList.remove('v500f');
  if (!list.length) { MF.el = null; MF.i = 0; return; }
  MF.i = (i % list.length + list.length) % list.length;
  MF.el = list[MF.i].el;
  MF.el.classList.add('v500f');
  try { MF.el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
 }
 function stepFocus(dx, dy) {
  const list = targets();
  if (!list.length) return;
  if (!MF.el || list.every(t => t.el !== MF.el)) { focusAt(list, 0); return; }
  const cur = list.find(t => t.el === MF.el) || list[0];
  let best = null, bd = 1e9;
  for (let i = 0; i < list.length; i++) {
   const t = list[i];
   if (t.el === cur.el) continue;
   const vx = t.x - cur.x, vy = t.y - cur.y;
   if (dx && Math.sign(vx) !== dx) continue;
   if (dy && Math.sign(vy) !== dy) continue;
   if (dx && Math.abs(vx) < Math.abs(vy) && Math.abs(vy) > 8) continue;
   if (dy && Math.abs(vy) < Math.abs(vx) * .35) continue;
   const d = Math.hypot(vx, vy);
   if (d < bd) { bd = d; best = i; }
  }
  if (best == null) best = dy > 0 || dx > 0 ? MF.i + 1 : MF.i - 1;
  focusAt(list, best);
 }
 W.__rl500menu = function (p, L, edge) {
  if (off()) return;
  try {
   let dx = 0, dy = 0;
   if (edge.down(12)) dy = -1;
   else if (edge.down(13)) dy = 1;
   else if (edge.down(14)) dx = -1;
   else if (edge.down(15)) dx = 1;
   else if (L && L.m > .55) {
    const d = Math.abs(L.y) >= Math.abs(L.x) ? (L.y < 0 ? 'u' : 'd') : (L.x < 0 ? 'l' : 'r');
    const now = performance.now();
    if (d !== MF.dir || now - MF.t > 180) { MF.dir = d; MF.t = now; if (d === 'u') dy = -1; else if (d === 'd') dy = 1; else if (d === 'l') dx = -1; else dx = 1; }
   } else MF.dir = '';
   if (dx || dy) stepFocus(dx, dy);
   const b = W.V468CTL && V468CTL.pb ? V468CTL.pb() : { pass: 0 };
   if (edge.down(b.pass) || edge.down(0)) {
    const list = targets();
    if (!MF.el || list.every(t => t.el !== MF.el)) focusAt(list, 0);
    if (MF.el) MF.el.click();
   }
  } catch (e) { fail('menu', e); }
 };

 // tutorial lines on a controller name the real cut button
 try {
  if (typeof W.text === 'function') {
   const t0 = W.text;
   W.text = function (s) {
    try {
     if (!off() && typeof s === 'string' && W.__rl468 && __rl468.inputMode && __rl468.inputMode() === 'pad' && W.V468CTL) {
      const n = V468CTL.padName(V468CTL.pb().hit);
      if (s === 'SWIPE HIM' || s === 'FLICK HIM') s = 'HOLD ' + n + ', MOVE THE RIGHT STICK';
      else if (s === 'TAP HIM' || s === 'CLICK HIM') s = V468CTL.padName(V468CTL.pb().pass);
     }
    } catch (e) {}
    return t0.apply(this, arguments);
   };
  }
 } catch (e) { fail('text', e); }

 note('ready');
})();
