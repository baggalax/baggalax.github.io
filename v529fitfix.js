/* v529fitfix.js - WHALE + CROWN always in LOCKER ROOM > UNIFORMS > N/A (Bagga Lax, Nov 11 2026).
   Kill switch: window.__rl_no529ff = true (set before load).
   v524fit adds the WHALE / CROWN row inside the locker's HTML render. On Charlie's phone it still did not show
   on 64w. This file makes the row impossible to lose:
   1) after every script has loaded, it wraps the locker render once more (outermost), so no later file can
      draw over it;
   2) it watches the locker on screen and puts the row back at the top of the N/A list if anything redraws the
      list without it (soft refreshes, controller focus, other files touching #panel directly);
   3) web only (*.sites.tab.bot): when the app comes back to the front on the main menu and a newer build is
      live, it reloads once, so a PWA resumed from the update notification runs the new code instead of the
      old page still in memory.
   Tiles reuse v524's actions (data-a="v524fit"), its rules (choose-one, rl_fit45/rl_fit46) and its art
   (uniform icon: helmet + jersey + shorts in the fit colors). No new rl_* keys, no id or net changes. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no529ff || W.__rl_no524fit || W.__rl_no445fit) return;
 const F = W.V445;
 if (!F || !F.on || typeof PANEL_RENDER === 'undefined' || typeof PANEL_ACT === 'undefined') return;
 const off = () => !!(W.__rl_no529ff || W.__rl_no524fit || W.__rl_no445fit) || !F.on() || typeof PANEL_ACT.v524fit !== 'function';
 const NAME = { whale: 'THE WHALE', crown: 'THE CROWN' };
 const PRICE = F.PRICE || 200;
 const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 const scr = () => { try { return typeof screen === 'string' ? screen : ''; } catch (e) { return ''; } };
 const LOG = W.__rl529 = { adds: 0, dom: 0, errs: [], reload: null };
 const fail = (w, e) => { try { if (LOG.errs.length < 20) LOG.errs.push(w + ': ' + (e && e.message || e)); } catch (x) {} };
 function myTeam() {
  try { if (W.V524 && V524.team) return V524.team(); } catch (e) {}
  try { if (typeof season !== 'undefined' && season && season.team) return season.team; } catch (e) {}
  try { const q = JSON.parse(localStorage.getItem('rl_qteam16') || 'null'); if (q) return q; } catch (e) {}
  return null;
 }
 const tname = t => { try { return T(t).name.toUpperCase(); } catch (e) { return 'YOUR TEAM'; } };
 const own = () => { try { return F.pick(); } catch (e) { return null; } };
 function worn(w) {
  try { if (W.V524 && V524.worn) return !!V524.worn(w); } catch (e) {}
  return false;
 }
 function helm() {
  const t = myTeam();
  try { const U = W.UNI21; if (U && t) { const k = U.kitOf(t, U.savedK(t)); if (k && k.helm) return k.helm; } } catch (e) {}
  try { return T(t).c1 || '#1d2a5e'; } catch (e) { return '#1d2a5e'; }
 }
 // uniform art like the other uniform tiles (helmet, jersey with sleeves, shorts - no body, no legs), fit colors
 const FC = { whale: { j: '#ff8cc6', t: '#1d2a5e', l: '#1d2a5e', s: '#d2bc8a' }, crown: { j: '#a6d8f7', t: '#4a6f8e', l: '#ffffff', s: '#d2bc8a' } };
 const icons = new Map;
 function iconUrl(w, hm) {
  const key = w + '|' + hm; if (icons.has(key)) return icons.get(key);
  let u = '';
  try {
   const g = []; for (let y = 0; y < 20; y++) g.push(new Array(20).fill(null));
   const R = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; };
   const P = (x, y, c) => { g[y][x] = c; };
   const C = FC[w] || FC.whale;
   R(7, 2, 12, 3, hm); R(6, 4, 14, 4, hm);                     // helmet + brim
   R(2, 7, 17, 9, C.j); R(5, 7, 14, 13, C.j);                  // sleeves + body
   P(2, 7, C.t); P(2, 8, C.t); P(2, 9, C.t); P(17, 7, C.t); P(17, 8, C.t); P(17, 9, C.t); // cuffs
   if (w === 'whale') { R(8, 7, 11, 7, C.t); R(7, 10, 12, 11, C.t); R(12, 9, 13, 9, C.t); P(8, 10, C.l); }  // collar + whale
   else { R(9, 7, 10, 10, C.t); P(12, 9, C.l); R(7, 0, 12, 1, '#ffcc33'); P(8, 0, null); P(11, 0, null); P(9, 0, null); P(10, 0, null); P(7, 0, '#ffcc33'); P(12, 0, '#ffcc33'); P(9, 0, '#ffcc33'); } // zip + logo + crown
   R(5, 14, 14, 16, C.s); P(9, 16, null); P(10, 16, null);     // shorts
   const c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d');
   for (let y = 0; y < 20; y++) for (let i = 0; i < 20; i++) {
    if (g[y][i]) { x.fillStyle = g[y][i]; x.fillRect(i, y, 1, 1); continue; }
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const yy = y + dy, xx = i + dx; return yy >= 0 && yy < 20 && xx >= 0 && xx < 20 && g[yy][xx]; });
    if (nb) { x.fillStyle = '#000000'; x.fillRect(i, y, 1, 1); }
   }
   u = c.toDataURL();
  } catch (e) { fail('icon', e); }
  icons.set(key, u); return u;
 }
 function restyle(root) {
  let n = 0;
  root.querySelectorAll('.v524sec .v524fit[data-v]').forEach(b => {
   const w = b.getAttribute('data-v'), im = b.querySelector('.art img'); if (!im || !FC[w]) return;
   const u = iconUrl(w, helm()); if (u && im.getAttribute('src') !== u) { im.setAttribute('src', u); n++; }
  });
  return n;
 }
 function tile(w, have, hm) {
  const mine = have === w, on = mine && worn(w);
  const rr = mine ? (on ? 'WEARING' : 'TAP TO WEAR') : 'LOCKED';
  const sub = mine ? '' : '<small class="wh17">' + (have ? 'YOU PICKED ' + NAME[have] : 'SHOP - ' + PRICE + ' DIMES') + '</small>';
  return '<button type="button" class="c17 uni17 v524fit' + (mine ? '' : ' lk') + (on ? ' wr17' : '') + '" data-a="v524fit" data-v="' + w + '" aria-label="' + esc(NAME[w] + (mine ? (on ? ' (WEARING)' : '') : ' (LOCKED)')) + '">' +
   '<div class="art"><img src="' + iconUrl(w, hm) + '" alt=""></div><div class="nm">' + NAME[w] + '</div><div class="rr">' + rr + '</div>' + sub + '</button>';
 }
 function blockHtml() {
  const have = own(), hm = helm(), t = myTeam();
  const note = have ? 'TAP ' + NAME[have] + ' = ' + esc(tname(t)) + ' WEARS IT (TEAM HELMET + GLOVES STAY). TAP AGAIN = BACK TO THE TEAM UNIFORM.'
                    : 'PICK ONE IN THE SHOP FOR ' + PRICE + ' DIMES. YOU CAN ONLY EVER OWN ONE - THE OTHER LOCKS FOR GOOD.';
  return '<div class="sec17 uni2319 v524sec v529sec"><div class="sh17">WHALE / CROWN <span>' + (have ? 1 : 0) + ' / 1</span></div>' +
   '<div class="det17" style="margin:2px 0 4px">' + note + '</div><div class="grid17">' + tile('whale', have, hm) + tile('crown', have, hm) + '</div></div>';
 }
 // N/A chip on? (attribute order / extra classes don't matter)
 const naChipOn = root => { const c = root && root.querySelector('[data-a="v17unig"][data-v="na"]'); return !!(c && c.classList.contains('on')); };
 function ensure(root) {
  // root: a DocumentFragment (render pass) or the live #panel. Returns true when it added the row.
  if (!root || !naChipOn(root)) return false;
  const list = root.querySelector('#lockList'); if (!list) return false;
  if (list.querySelector('.v524sec')) return restyle(list) > 0;
  [...list.children].forEach(n => { if (n.classList && n.classList.contains('note') && /NO UNIFORMS/.test(n.textContent || '')) n.remove(); });
  const box = document.createElement('template'); box.innerHTML = blockHtml();
  list.insertBefore(box.content, list.firstChild);
  return true;
 }
 // 1) outermost render pass, installed after every script has run
 let wrapped = 0;
 function wrap() {
  try {
   const cur = PANEL_RENDER.locker17;
   if (typeof cur !== 'function' || cur.__v529) return;
   const lk = function () {
    const h = cur.apply(this, arguments);
    if (off() || typeof h !== 'string' || h.indexOf('lockList') < 0 || h.indexOf('data-v="na"') < 0) return h;
    try {
     const tp = document.createElement('template'); tp.innerHTML = h;
     if (ensure(tp.content)) { LOG.adds++; return tp.innerHTML; }
    } catch (e) { fail('render', e); }
    return h;
   };
   lk.__v529 = 1; PANEL_RENDER.locker17 = lk; wrapped++;
  } catch (e) { fail('wrap', e); }
 }
 wrap();
 setTimeout(wrap, 0);
 if (document.readyState === 'complete') setTimeout(wrap, 50); else W.addEventListener('load', () => setTimeout(wrap, 50));
 // 2) live safety net on the drawn panel
 let queued = false;
 function check() {
  queued = false;
  try {
   if (off() || scr() !== 'locker17') return;
   const p = document.getElementById('panel'); if (!p) return;
   if (ensure(p)) LOG.dom++;
  } catch (e) { fail('dom', e); }
 }
 function watch() {
  const p = document.getElementById('panel');
  if (!p || p.__v529) return !!p;
  p.__v529 = 1;
  try { new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(check); } }).observe(p, { childList: true, subtree: true }); } catch (e) { fail('mo', e); }
  return true;
 }
 if (!watch()) { let n = 0; const iv = setInterval(() => { if (watch() || ++n > 60) clearInterval(iv); }, 500); }
 // 3) web only: a PWA resumed from the update notification reloads into the new build (main menu only)
 try {
  const web = /\.sites\.tab\.bot$/.test(location.hostname) && !(W.Capacitor && W.Capacitor.isNativePlatform && W.Capacitor.isNativePlatform());
  if (web && !W.__rl_no529reload) {
   let ver0 = null, busy = false;
   const getVer = () => fetch('update.json?nc=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => j && j.ver || null).catch(() => null);
   getVer().then(v => { ver0 = v; LOG.reload = { ver0: v }; });
   const onFront = () => {
    if (document.visibilityState !== 'visible' || busy || !ver0) return;
    busy = true;
    getVer().then(v => {
     busy = false;
     LOG.reload = { ver0: ver0, now: v };
     if (!v || v === ver0) return;
     let online = false; try { online = !!(typeof NET !== 'undefined' && NET && (NET.connected || NET.inMatch)); } catch (e) {}
     if (scr() === 'menu' && !online) { try { sessionStorage.setItem('rl529rl', v); } catch (e) {} location.reload(); }
    });
   };
   document.addEventListener('visibilitychange', onFront);
   W.addEventListener('pageshow', e => { if (e && e.persisted) onFront(); });
  }
 } catch (e) { fail('reload', e); }
 W.V529 = { on: () => !off(), ensure: () => { const p = document.getElementById('panel'); return ensure(p); }, wrapped: () => wrapped };
})();
