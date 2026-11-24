/* v527gsweb.js - Good Stick pack: TEST release on the browser test site only, plus two Good Stick look fixes.
   1) RELEASE (test site only): turns the GOOD STICK PACK on ONLY when the page is served from
      https://retrolax.sites.tab.bot (or http://127.0.0.1:8896 for local tests). Everywhere else
      (baggalax.sites.tab.bot, baggalax.github.io, the native app on capacitor://localhost / https://localhost)
      the release part does nothing, so the pack stays hidden until https://baggalax.github.io/config/liveops.json
      lists pack_goodstick. How: wraps LIVEOPS.shopOn / LIVEOPS.goodstick so 'pack_goodstick' reads as on.
      Price, buying, team, items all stay the code in v501gsc.js / v504gs.js.
   2) LOOK (wherever the Good Stick team exists; it changes how things are drawn, never what is unlocked):
      - Locker Room > Uniforms: the GOOD STICK CO. HOME / AWAY tiles are drawn as jersey tiles like every other
        team's uniform tiles (they were drawn as a full player sprite).
      - PICK YOUR TEAM grids: the COLLAB tab sits in the same top row as PRO / WORLD / COLLEGE / N/A (it was
        alone under the title, over the grid). The row shifts left to fit and the title moves left of it.
   No ids, rl_* keys or net protocol change.
   Kill switches: window.__rl_no527gs = true (everything), window.__rl_no527look = true (only part 2). */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_no527gs || W0.__rl527) return;
 const S = W0.__rl527 = { on: false, host: '', wrapped: false, look: false, err: [] };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + (e && e.message || e)); };

 // ---------- 1) release on the test site only ----------
 let host = '', proto = '', port = '';
 try { host = String(location.hostname || '').toLowerCase(); proto = String(location.protocol || ''); port = String(location.port || ''); } catch (e) {}
 S.host = host;
 let native = false;
 try { native = !!(W0.Capacitor && (typeof W0.Capacitor.isNativePlatform === 'function' ? W0.Capacitor.isNativePlatform() : W0.Capacitor.isNative)); } catch (e) {}
 const testSite = proto === 'https:' && host === 'retrolax.sites.tab.bot';
 const localTest = proto === 'http:' && host === '127.0.0.1' && port === '8896';
 const PACK = 'pack_goodstick';
 function wrap() {
  const L = W0.LIVEOPS;
  if (!L || typeof L.shopOn !== 'function') return false;
  if (L.shopOn.__gs527) return true;
  try {
   const s0 = L.shopOn;
   const s1 = function (id) { if (id === PACK && !W0.__rl_no527gs) return true; return s0.apply(this, arguments); };
   s1.__gs527 = true;
   L.shopOn = s1;
   const g0 = typeof L.goodstick === 'function' ? L.goodstick : null;
   const g1 = function () {
    const g = g0 ? g0.apply(this, arguments) : null;
    if (W0.__rl_no527gs) return g || { enabled: false, roster: [] };
    return Object.assign({}, g || { roster: [] }, { enabled: true });
   };
   g1.__gs527 = true;
   L.goodstick = g1;
   S.wrapped = true;
   try { if (W0.GSC501 && GSC501.applyRoster) GSC501.applyRoster(); } catch (e) {}
   try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {}
   return true;
  } catch (e) { fail('wrap', e); return false; }
 }
 if (!native && (testSite || localTest)) {
  S.on = true;
  if (!wrap()) { let n = 0; const t = setInterval(() => { n++; if (wrap() || n > 60) clearInterval(t); }, 250); }
 }

 // ---------- 2) look fixes ----------
 const lookOff = () => !!(W0.__rl_no527look || W0.__rl_no527gs || W0.__rl_no501gsc || !W0.GSC501);
 const ID = 'GSC';

 // 2a) uniform tiles: jersey, not a player
 const jerseyUrl = {};
 function jersey(k) {
  k = (k | 0) === 1 ? 1 : 0;
  if (jerseyUrl[k]) return jerseyUrl[k];
  const V = W0.V17, U = W0.UNI21;
  if (!V || !V.BY || typeof V.icon !== 'function' || !U || typeof U.kitOf !== 'function') return null;
  const tmp = 'gs527uni_' + k;
  const k0 = U.kitOf;
  let url = null;
  try {
   const kit = Object.assign({}, k0.call(U, ID, k) || {});
   delete kit.g27;
   U.kitOf = function (tid, kk) { if (tid === ID) return Object.assign({}, kit); return k0.apply(this, arguments); };
   V.BY[tmp] = { id: tmp, n: '', sec: 'uni21', rar: 1, art: 'uni21', uni21: { tid: ID, k: k }, col: kit.jersey || '#c5c8ce', lk286: 1 };
   const cv = V.icon(tmp, false);
   url = cv && cv.toDataURL ? cv.toDataURL() : null;
  } catch (e) { fail('jersey', e); }
  finally { U.kitOf = k0; try { delete V.BY[tmp]; } catch (e) {} }
  if (url) jerseyUrl[k] = url;
  return url;
 }
 S.jersey = jersey;
 function fixTiles(root) {
  if (lookOff()) return;
  try {
   const list = (root && root.querySelectorAll ? root : document).querySelectorAll('.uni17');
   for (const b of list) {
    const v = b.getAttribute('data-v') || '';
    let k = null;
    if (v.indexOf(ID + '|') === 0) k = +v.split('|')[1] | 0;
    else if (/^GOOD STICK/i.test(b.getAttribute('aria-label') || '') && /^\d+$/.test(v)) k = +v;
    if (k == null) continue;
    const img = b.querySelector('img');
    if (!img || img.getAttribute('data-gs527') === String(k)) continue;
    const u = jersey(k);
    if (!u) continue;
    img.src = u;
    img.setAttribute('data-gs527', String(k));
   }
  } catch (e) { fail('tiles', e); }
 }
 S.fixTiles = fixTiles;
 function watch() {
  try {
   if (typeof MutationObserver === 'undefined' || !document.body) return false;
   let q = false;
   new MutationObserver(() => { if (q) return; q = true; Promise.resolve().then(() => { q = false; fixTiles(document); }); }).observe(document.body, { childList: true, subtree: true });
   fixTiles(document);
   return true;
  } catch (e) { fail('watch', e); return false; }
 }
 if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch);

 // 2b) PICK YOUR TEAM: COLLAB tab in the top row
 const TABS = { 'PRO': 1, 'WORLD': 1, 'COLLEGE': 1, 'N/A': 1 };
 let rec = null;
 function hookGrid() {
  if (typeof W0.teamGrid !== 'function' || typeof W0.button !== 'function' || typeof W0.text !== 'function') return false;
  if (W0.teamGrid.__gs527) return true;
  const tg0 = W0.teamGrid, b0 = W0.button, t0 = W0.text;
  W0.button = function (label, x, y, w, h) {
   if (rec && h === 11 && ((y === 3 && TABS[label]) || (label === 'COLLAB' && y === 16 && x === 2))) { rec.btn.push(Array.prototype.slice.call(arguments)); if (label === 'COLLAB') rec.cb = true; return; }
   if (rec && y <= 6 && x < 120 && !W0.__rl_no566sz) rec.leftX = Math.max(rec.leftX || 0, x + w);   // a button left of the title (SEASON team): keep the title clear of it
   return b0.apply(this, arguments);
  };
  W0.text = function (s, x, y, sc) {
   if (rec && !rec.titleArgs && s === rec.title && y <= 6) { rec.titleArgs = Array.prototype.slice.call(arguments); return; }
   return t0.apply(this, arguments);
  };
  const tg1 = function (title, sub, onPick, opts) {
   let willCB = false;
   try {
    const o = opts || {};
    willCB = !lookOff() && !rec && !!o.world && !o.pool && !o.col29 && !W0.__gscCollab && typeof WTEAMS !== 'undefined' && WTEAMS.length > 0 && !!(W0.GSC501 && GSC501.on && GSC501.on());
   } catch (e) { willCB = false; }
   if (!willCB) return tg0.apply(this, arguments);
   const me = rec = { title: title, btn: [], cb: false, titleArgs: null };
   let r;
   try { r = tg0.apply(this, arguments); }
   finally {
    rec = null;
    try { paintRow(me, b0, t0); } catch (e) { fail('row', e); try { for (const a of me.btn) b0.apply(null, a); if (me.titleArgs) t0.apply(null, me.titleArgs); } catch (x) {} }
   }
   return r;
  };
  tg1.__gs527 = true;
  W0.teamGrid = tg1;
  return true;
 }
 function paintRow(me, b0, t0) {
  if (!me.cb) {
   if (me.titleArgs) t0.apply(null, me.titleArgs);
   for (const a of me.btn) b0.apply(null, a);
   return;
  }
  const Wd = typeof W !== 'undefined' ? W : 390;
  const order = [ 'PRO', 'WORLD', 'COLLEGE', 'N/A', 'COLLAB' ];
  const row = me.btn.slice().sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  const gap = 2;
  const width = a => a[0] === 'COLLAB' ? 40 : a[3];
  const total = row.reduce((s, a) => s + width(a), 0) + gap * (row.length - 1);
  let x = Math.max(2, Wd - 6 - total);
  const left = x;
  S.row = [];
  for (const a of row) {
   const b = a.slice();
   b[1] = x; b[2] = 3; b[3] = width(a);
   if (b[0] === 'COLLAB') {
    const on = !!W0.__gscCollab;
    b[6] = Object.assign({}, b[6] || {}, { bg: on ? '#f4f4f4' : '#3a4a55', fg: on ? '#111' : '#cfe' });
   }
   b0.apply(null, b);
   S.row.push([ b[0], b[1], b[2], b[3], b[4] ]);
   x += b[3] + gap;
  }
  if (me.titleArgs) {
   const t = me.titleArgs.slice();
   const s = String(t[0]), L = (me.leftX || 0) + 4, R = left - 4;
   const tw = n => (typeof textW === 'function' ? textW(s, n) : s.length * 4 * n);
   if (Wd / 2 + tw(2) / 2 <= R && Wd / 2 - tw(2) / 2 >= L) t0.apply(null, t);
   else if (R - L >= tw(2)) { t[1] = Math.round((L + R) / 2); t[2] = 4; t[3] = 2; t[5] = 'center'; t0.apply(null, t); }
   else { t[1] = Math.round((L + R) / 2); t[2] = 6; t[3] = 1; t[5] = 'center'; t0.apply(null, t); }
  }
 }
 if (!hookGrid()) { let n = 0; const t = setInterval(() => { n++; if (hookGrid() || n > 60) clearInterval(t); }, 250); }
 S.look = true;
})();
