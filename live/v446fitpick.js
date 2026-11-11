/* v446fitpick.js - THE WHALE / THE CROWN as the LAST option of every team's uniforms (Bagga Lax V40.1.12).
   Sits on top of v445fit.js (needs window.V445). Kill switch: window.__rl_no446fit = true (set before load).
   - (OFF unless __rl_446locker; Charlie wants it in the lobby arrows only, locker shows no fit tile) Locker Room > Uniforms: the fit you OWN is the last tile of EVERY team (every tab). The one you don't own is not shown.
     Tap it = that team wears it. Tap a normal uniform of that team = it comes off. (Replaces v445's N/A-only block.)
   - The in-menu uniform arrows (quick game lobby, matchup, pregame): after the last uniform comes the fit, then it wraps.
   - Worn per team (rl_fit46 {t:{<team base>:1}}), offline games only, team helmet + gloves stay (v445 drawing).
   - Menu heroes (lobby / matchup / pregame) now draw the fit too (before, only the field did, so it looked like it was not on). */
(function(){
 'use strict';
 if (window.__rl_no446fit || window.__rl_no445fit) return;
 const F = window.V445, U = window.UNI21;
 if (!F || !F.on || !U || typeof U.gameKits !== 'function') return;
 const off = () => !!window.__rl_no446fit || !F.on();
 const NAME = { whale: 'THE WHALE', crown: 'THE CROWN' };
 const LSK = 'rl_fit46';
 const toast = (m, c) => { try { (window.V17 && V17.toast || window.toast || (() => {}))(m, c); } catch (e) {} };
 const bse = tid => { try { return U.base ? U.base(tid) : tid; } catch (e) { return tid; } };
 const tname = tid => { try { return T(tid).name.toUpperCase(); } catch (e) { return String(tid || ''); } };
 function lsGet() { try { const v = JSON.parse(localStorage.getItem(LSK) || 'null'); return v && typeof v === 'object' && v.t && typeof v.t === 'object' ? v : null; } catch (e) { return null; } }
 function lsSet(v) { try { localStorage.setItem(LSK, JSON.stringify(v)); } catch (e) {} syncOld(v); }
 // keep v445's own flag in step (its shop card says "YOUR TEAM WEARS IT" from it); the per-team list is the truth here
 function syncOld(v) {
  try { const o = JSON.parse(localStorage.getItem('rl_fit45') || 'null'); if (!o || typeof o !== 'object') return;
   const any = !!(v && Object.keys(v.t).length); if ((o.wear === true) !== any) { o.wear = any; localStorage.setItem('rl_fit45', JSON.stringify(o)); } } catch (e) {}
 }
 function myTeam() {
  try { if (typeof season !== 'undefined' && season && season.team) return season.team; } catch (e) {}
  try { const q = JSON.parse(localStorage.getItem('rl_qteam16') || 'null'); if (q) return q; } catch (e) {}
  try { if (typeof TEAMS !== 'undefined' && TEAMS[0]) return TEAMS[0].id; } catch (e) {}
  return null;
 }
 function state() {
  let v = lsGet();
  if (!v) { // first run: carry over v445's old on/off switch to the team you play with
   v = { t: {} };
   try { if (F.wearing() && myTeam()) v.t[bse(myTeam())] = 1; } catch (e) {}
   try { localStorage.setItem(LSK, JSON.stringify(v)); } catch (e) {}
  }
  return v;
 }
 const own = () => { try { return off() ? null : F.pick(); } catch (e) { return null; } };
 const wears = tid => !!(tid && own() && state().t[bse(tid)]);
 function setOn(tid, on) {
  const v = state(), b = bse(tid);
  if (on) v.t[b] = 1; else delete v.t[b];
  lsSet(v);
 }
 const fitKit = (kit, w) => Object.assign({}, kit, { fit45: w });
 const strip = kit => { if (!kit || !kit.fit45) return kit; const k = Object.assign({}, kit); delete k.fit45; return k; };

 /* ---------- games: the team you play with wears it when it's on for that team (offline only, net untouched) ---------- */
 const gk1 = U.gameKits;
 U.gameKits = function(user, opp, userHome, mode, meta) {
  const r = gk1.apply(this, arguments);
  try {
   if (off() || !r || !r[0]) return r;
   const online = !!(meta && meta.online) || mode === 'online';
   const w = own();
   if (!online && w && wears(user) && !r[0].g27) r[0] = fitKit(r[0], w);
   else if (r[0].fit45) r[0] = strip(r[0]);
  } catch (e) {}
  return r;
 };

 /* ---------- menu heroes draw the fit (lobby, matchup, pregame) ---------- */
 const scr = () => { try { return typeof screen !== 'undefined' ? screen : ''; } catch (e) { return ''; } };
 const ELIG = { menu: 1, matchup: 1, pregame: 1 };
 function editable() {
  const s = scr();
  if (!ELIG[s]) return false;
  if (s === 'pregame') { try { if (!game || game.online || (game.meta && game.meta.online)) return false; } catch (e) { return false; } }
  try { return U.canEdit(0); } catch (e) { return false; }
 }
 const hk0 = U.heroKit;
 if (typeof hk0 === 'function') U.heroKit = function(i, tid) {
  const k = hk0.apply(this, arguments);
  try {
   if (off() || i || !tid || !k) return k;
   const s = scr();
   if (s === 'pregame') return k; // game.uk already carries it (gameKits / the arrows below)
   if (ELIG[s] && wears(tid) && !k.g27) return fitKit(k, own());
  } catch (e) {}
  return k;
 };
 const isFit = kit => !!(kit && (kit.fit45 === 'whale' || kit.fit45 === 'crown') && !kit.g27 && !off());
 let heroOn = 0;
 const lb0 = window.lobbyBake, lh0 = window.lobbyHero;
 if (typeof lb0 === 'function' && typeof lh0 === 'function' && typeof RL12 !== 'undefined') {
  window.lobbyBake = function(name, kit, skin, gray, flip) {
   if (heroOn && !gray && isFit(kit) && /__w45$/.test(name)) {
    try {
     const base = name.slice(0, -5), pid = window.__v17hp;
     let gr = null; try { gr = pid && V17.gearOfP ? V17.gearOfP(pid, kit) : null; } catch (e) {}
     const c = F.bakeFit(base, kit, !!flip, skin | 0, gr || {}, false, true);
     if (c) return c;
    } catch (e) {}
   }
   return lb0.apply(this, arguments);
  };
  window.lobbyHero = function(cx, feetY, pos, kit, skin, gray, k, tt, alpha, slide, flip, side) {
   if (gray || !isFit(kit) || typeof lobbyFrame !== 'function') return lh0.apply(this, arguments);
   let name = null, f0 = null;
   try { name = lobbyFrame(pos, side); f0 = RL12.FR[name]; } catch (e) {}
   const nn = f0 && F.padFrame(name);
   if (!nn || !RL12.FR[nn]) return lh0.apply(this, arguments);
   // the fit art is drawn on a padded frame (crown on top, straight khakis); let the hero use that frame for this one draw
   const lf0 = window.lobbyFrame;
   heroOn++;
   try {
    window.lobbyFrame = function(p, s) { const n = lf0.apply(this, arguments); return n === name ? nn : n; };
    return lh0.apply(this, arguments);
   } finally {
    window.lobbyFrame = lf0; heroOn = Math.max(0, heroOn - 1);
   }
  };
 }

 /* ---------- the uniform arrows: ... LAST UNIFORM > THE WHALE > BASIC ... ---------- */
 function listFor(tid) {
  const N = U.nK(tid), s = scr(), out = [];
  for (let k = 0; k < N; k++) if (U.okK(tid, k) && (s === 'matchup' || U.has(tid, k))) out.push(k);
  return out;
 }
 function setK(tid, k) { // take the fit off and put uniform k on, the way each screen keeps it
  setOn(tid, false);
  const s = scr(), has = U.has(tid, k);
  if (s === 'matchup') {
   const m = U.matchSel(); m.v[0] = k; if (has) m.k[0] = k;
   U.U.pend = { u: menuSel.team, o: menuSel.opp, k: m.k.slice() };
   if (has) U.save(tid, k);
  } else if (s === 'pregame') {
   const kit = U.kitOf(tid, k); kit.k21 = k; game.uk = kit; U.save(tid, k);
  } else if (has) U.save(tid, k);
 }
 function putFit(tid) {
  const w = own(); if (!w) return;
  setOn(tid, true);
  if (scr() === 'pregame' && game && game.uk && !game.uk.g27) game.uk = fitKit(game.uk, w);
  toast(tname(tid) + ' WEARS ' + NAME[w], '#7dff7a');
 }
 function step(tid, d) {
  const L = listFor(tid);
  if (!L.length) return U.step(0, tid, d);
  if (wears(tid)) { setK(tid, d > 0 ? L[0] : L[L.length - 1]); return; }
  let vk; try { vk = scr() === 'pregame' ? (game.uk && game.uk.k21 != null ? game.uk.k21 : 0) : scr() === 'matchup' ? U.matchSel().v[0] : U.savedK(tid); } catch (e) { vk = 0; }
  const p = L.indexOf(vk);
  if (p >= 0 && ((d > 0 && p === L.length - 1) || (d < 0 && p === 0))) { putFit(tid); return; }
  U.step(0, tid, d);
 }
 const dt0 = U.drawToggle;
 if (typeof dt0 === 'function' && typeof hit === 'function') U.drawToggle = function(i, tid, axl, axr, ay, live) {
  if (off() || i || !tid || !own() || !editable() || !U.on()) return dt0.apply(this, arguments);
  try {
   if (live) { // registered first, so these win over the stock arrows drawn just below (first key wins in syncUI)
    const p = window.__rl_no281uni ? 3 : 0;
    hit('UNI L PREV', axl - 3, ay - p, 24, 18 + p, () => step(tid, -1), 'UNI L PREV');
    hit('UNI L NEXT', axr - 3, ay - p, 24, 18 + p, () => step(tid, 1), 'UNI L NEXT');
   }
  } catch (e) { return dt0.apply(this, arguments); }
  const r = dt0.apply(this, arguments);
  try { if (r && wears(tid)) { const w = own(); r.txt = NAME[w]; r.locked = false; r.fit46 = w; } } catch (e) {}
  return r;
 };
 const lab0 = U.label;
 if (typeof lab0 === 'function') U.label = function(i, tid) {
  try { if (!off() && !i && tid && wears(tid) && editable()) return NAME[own()]; } catch (e) {}
  return lab0.apply(this, arguments);
 };

 /* ---------- locker room: the owned fit is the LAST tile of every team ---------- */
 const ICON = {
  whale: ['.......aaaaaa.......', '......abbbbbbaa.....', '......abbbbbbbba....', '.......aaaaaaaa.....', '....................', '.....aaaccccaaa.....', '...aacccaccacccaa...', '..accccccaacccccca..', '.acccccccccccccccca.', 'accccaccccccccacccca', 'accca.adddddda.accca', '.aaa..aeeeeeea..aaa.', '......acccccca......', '......acccccca......', '......affffffa......', '......affffffa......', '......affaaffa......', '......aggaagga......', '......ahhaahha......', '....................'],
  crown: ['.......a.aa.a.......', '.......aaaaaa.......', '......bccccccbb.....', '......bccccccccb....', '.......bbbbbbbb.....', '.....bdddeedddb.....', '...bbddddeeddddbb...', '..bddddddddddddddb..', '.bddddddddddfdddddb.', 'bddddbddddddddbddddb', 'bdddbbddddddddbbdddb', 'bdddb.bddddddb.bdddb', '.bbb..bddddddb..bbb.', '......bggggggb......', '......bggbbggb......', '......bggbbggb......', '......bggbbggb......', '......bhhbbhhb......', '......biibbiib......', '....................']
 };
 const ICOL = { whale: { a: '#000000', c: '#ff8cc6', d: '#1d2a5e', e: '#f4f4f4', f: '#d2bc8a', g: '#e0ac7c', h: '#7a4f2a' },
                crown: { a: '#ffcc33', b: '#000000', d: '#a6d8f7', e: '#4a6f8e', f: '#ffffff', g: '#d2bc8a', h: '#e0ac7c', i: '#7a4f2a' } };
 const icons = new Map;
 function iconUrl(w, helm) {
  const key = w + '|' + helm; if (icons.has(key)) return icons.get(key);
  const c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d');
  const pal = Object.assign({}, ICOL[w]); if (w === 'whale') pal.b = helm; else pal.c = helm;
  ICON[w].forEach((row, y) => { for (let i = 0; i < 20; i++) { const ch = row[i]; if (ch === '.' || !pal[ch]) continue; x.fillStyle = pal[ch]; x.fillRect(i, y, 1, 1); } });
  const u = c.toDataURL(); icons.set(key, u); return u;
 }
 function helmOf(tid) { try { const k = U.kitOf(tid, U.savedK(tid)); if (k && k.helm) return k.helm; } catch (e) {} try { return T(tid).c1 || '#1d2a5e'; } catch (e) { return '#1d2a5e'; } }
 const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 function tileHtml(tid, w) {
  const on = wears(tid);
  return '<button type="button" class="c17 uni17 fit46' + (on ? ' wr17' : '') + '" data-a="v46fit" data-v="' + esc(tid) + '" aria-label="' + esc(tname(tid) + ' ' + NAME[w] + (on ? ' (WEARING)' : '')) + '">' +
   '<div class="art"><img src="' + iconUrl(w, helmOf(tid)) + '" alt=""></div><div class="nm">' + NAME[w] + '</div><div class="rr">' + (on ? 'WEARING' : 'TAP TO WEAR') + '</div></button>';
 }
 function lockerPass(h) {
  if (h.indexOf('fit45sec') < 0 && h.indexOf('uni2319" data-t="') < 0) return h;
  const tp = document.createElement('template'); tp.innerHTML = h;
  tp.content.querySelectorAll('.fit45sec').forEach(n => n.remove());
  const w = window.__rl_446locker ? own() : null; // Charlie 7:38 PM: not in the locker, lobby arrows only
  if (w) tp.content.querySelectorAll('.sec17.uni2319[data-t]').forEach(sec => {
   const tid = sec.getAttribute('data-t'), grid = sec.querySelector('.grid17');
   if (!tid || !grid) return;
   if (wears(tid)) grid.querySelectorAll('.wr17').forEach(b => { b.classList.remove('wr17'); const rr = b.querySelector('.rr'); if (rr && rr.textContent === 'WEARING') rr.textContent = 'TAP TO WEAR'; const al = b.getAttribute('aria-label') || ''; b.setAttribute('aria-label', al.replace(' (WEARING)', '')); });
   const box = document.createElement('template'); box.innerHTML = tileHtml(tid, w);
   grid.appendChild(box.content);
  });
  return tp.innerHTML;
 }
 if (typeof PANEL_RENDER !== 'undefined' && typeof PANEL_ACT !== 'undefined') {
  const lk1 = PANEL_RENDER.locker17;
  if (typeof lk1 === 'function') PANEL_RENDER.locker17 = function() {
   const h = lk1.apply(this, arguments);
   if (off() || typeof h !== 'string') return h;
   try { return lockerPass(h); } catch (e) { return h; }
  };
  const uni0 = PANEL_ACT.v17uni;
  PANEL_ACT.v46fit = function(v) {
   const w = own(); if (!w || !v) return;
   if (wears(v)) { toast(tname(v) + ' ALREADY WEARS ' + NAME[w] + ' - TAP A UNIFORM TO TAKE IT OFF', '#7dff7a'); return; }
   setOn(v, true);
   toast(tname(v) + ' WEARS ' + NAME[w] + ' - TEAM HELMET + GLOVES STAY', '#7dff7a');
  };
  if (typeof uni0 === 'function') PANEL_ACT.v17uni = function(v) {
   let tid = null, k = null;
   try { const a = String(v).split('|'); if (a.length > 1) { tid = a[0]; k = a[1] | 0; } } catch (e) {}
   const r = uni0.apply(this, arguments);
   try { if (!off() && tid != null && U.has(tid, k) && wears(tid)) setOn(tid, false); } catch (e) {}
   return r;
  };
 }
 try { state(); } catch (e) {}
 window.V446 = { on: () => !off(), wears: wears, set: setOn, state: state, step: step };
})();
