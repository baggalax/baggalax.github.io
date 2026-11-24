/* v524fit.js - THE WHALE + THE CROWN back in LOCKER ROOM > UNIFORMS > N/A (Bagga Lax, Nov 11 2026).
   Kill switch: window.__rl_no524fit = true (set before load).
   Why they were missing: v445 put a WHALE / CROWN block in the N/A uniforms tab, then v446 (lobby-arrows
   version) strips that block on every render and only re-adds per-team tiles behind __rl_446locker (off).
   The N/A tab has no teams of its own, so it showed nothing at all.
   This file adds the block back, last in the locker render chain:
   - owned fit: TAP TO WEAR / WEARING for the team you play with (season team, else quick-game team),
     using v446's own per-team switch (rl_fit46), so games, lobby arrows and the shop card all agree.
   - not owned: LOCKED tile + "SHOP - 200 DIMES" (like other locked uniforms + where to get them);
     the other one after you picked: LOCKED + "YOU PICKED THE ...". Choose-one rule untouched (v445 buy()).
   No new rl_* keys, no item id changes, no net changes. */
(function () {
 'use strict';
 if (window.__rl_no524fit || window.__rl_no445fit) return;
 const W = window, F = W.V445;
 if (!F || !F.on || typeof PANEL_RENDER === 'undefined' || typeof PANEL_ACT === 'undefined') return;
 const off = () => !!W.__rl_no524fit || !F.on();
 const NAME = { whale: 'THE WHALE', crown: 'THE CROWN' };
 const PRICE = F.PRICE || 200;
 const toast = (m, c) => { try { (W.V17 && V17.toast || (() => {}))(m, c); } catch (e) {} };
 const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 const v46 = () => !!(W.V446 && V446.on && V446.on());
 function myTeam() {
  // 1.5f (Jonny H1 / M1): the team of the LOBBY YOU CAME FROM first (Locker League card team, card-team / quick / season
  // lobby). Before, a Locker League card team got season.team / the quick team / TEAMS[0] ("UTAH WEARS IT"), so the
  // Whale went on the wrong team and the card team kept its ranked uni. Kill switch: window.__rl_no598fitteam
  if (!W.__rl_no598fitteam) {
   try { const L = W.RK15LL, sc = typeof screen !== 'undefined' ? screen : ''; if (sc === 'gear17' && typeof GEAR17 !== 'undefined' && GEAR17 && GEAR17.tid) return GEAR17.tid; if (L && L.extraBack && L.extraBack.tid && sc !== 'menu') return L.extraBack.tid; } catch (e) {}
   try { const n = W.V581G && V581G.lobbyNow && V581G.lobbyNow(); if (n && n.tid) return n.tid; } catch (e) {}
  }
  try { if (typeof season !== 'undefined' && season && season.team) return season.team; } catch (e) {}
  try { const q = JSON.parse(localStorage.getItem('rl_qteam16') || 'null'); if (q) return q; } catch (e) {}
  try { if (typeof TEAMS !== 'undefined' && TEAMS[0]) return TEAMS[0].id; } catch (e) {}
  return null;
 }
 const tname = tid => { try { return T(tid).name.toUpperCase(); } catch (e) { return 'YOUR TEAM'; } };
 const own = () => { try { return F.pick(); } catch (e) { return null; } };
 function worn(w) {
  if (own() !== w) return false;
  try { if (v46()) { const t = myTeam(); return !!(t && V446.wears(t)); } } catch (e) {}
  try { return F.wearing() === w; } catch (e) { return false; }
 }
 function helm() {
  const t = myTeam();
  try { const U = W.UNI21; if (U && t) { const k = U.kitOf(t, U.savedK(t)); if (k && k.helm) return k.helm; } } catch (e) {}
  try { return T(t).c1 || '#1d2a5e'; } catch (e) { return '#1d2a5e'; }
 }
 const ICON = {
  whale: ['.......aaaaaa.......', '......abbbbbbaa.....', '......abbbbbbbba....', '.......aaaaaaaa.....', '....................', '.....aaaccccaaa.....', '...aacccaccacccaa...', '..accccccaacccccca..', '.acccccccccccccccca.', 'accccaccccccccacccca', 'accca.adddddda.accca', '.aaa..aeeeeeea..aaa.', '......acccccca......', '......acccccca......', '......affffffa......', '......affffffa......', '......affaaffa......', '......aggaagga......', '......ahhaahha......', '....................'],
  crown: ['.......a.aa.a.......', '.......aaaaaa.......', '......bccccccbb.....', '......bccccccccb....', '.......bbbbbbbb.....', '.....bdddeedddb.....', '...bbddddeeddddbb...', '..bddddddddddddddb..', '.bddddddddddfdddddb.', 'bddddbddddddddbddddb', 'bdddbbddddddddbbdddb', 'bdddb.bddddddb.bdddb', '.bbb..bddddddb..bbb.', '......bggggggb......', '......bggbbggb......', '......bggbbggb......', '......bggbbggb......', '......bhhbbhhb......', '......biibbiib......', '....................']
 };
 const ICOL = { whale: { a: '#000000', c: '#ff8cc6', d: '#1d2a5e', e: '#f4f4f4', f: '#d2bc8a', g: '#e0ac7c', h: '#7a4f2a' },
                crown: { a: '#ffcc33', b: '#000000', d: '#a6d8f7', e: '#4a6f8e', f: '#ffffff', g: '#d2bc8a', h: '#e0ac7c', i: '#7a4f2a' } };
 const icons = new Map;
 function iconUrl(w, hm) {
  const key = w + '|' + hm; if (icons.has(key)) return icons.get(key);
  let u = '';
  try {
   const c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d');
   const pal = Object.assign({}, ICOL[w]); if (w === 'whale') pal.b = hm; else pal.c = hm;
   ICON[w].forEach((row, y) => { for (let i = 0; i < 20; i++) { const ch = row[i]; if (ch === '.' || !pal[ch]) continue; x.fillStyle = pal[ch]; x.fillRect(i, y, 1, 1); } });
   u = c.toDataURL();
  } catch (e) {}
  icons.set(key, u); return u;
 }
 function tile(w, have, hm) {
  const mine = have === w, on = mine && worn(w);
  const rr = mine ? (on ? 'WEARING' : 'TAP TO WEAR') : 'LOCKED';
  const sub = mine ? '' : '<small class="wh17">' + (have ? 'YOU PICKED ' + NAME[have] : 'SHOP - ' + PRICE + ' DIMES') + '</small>';
  return '<button type="button" class="c17 uni17 v524fit' + (mine ? '' : ' lk') + (on ? ' wr17' : '') + '" data-a="v524fit" data-v="' + w + '" aria-label="' + esc(NAME[w] + (mine ? (on ? ' (WEARING)' : '') : ' (LOCKED)')) + '">' +
   '<div class="art"><img src="' + iconUrl(w, hm) + '" alt=""></div><div class="nm">' + NAME[w] + '</div><div class="rr">' + rr + '</div>' + sub + '</button>';
 }
 function block() {
  const have = own(), hm = helm(), t = myTeam();
  const note = have ? 'TAP ' + NAME[have] + ' = ' + esc(tname(t)) + ' WEARS IT (TEAM HELMET + GLOVES STAY). TAP AGAIN = BACK TO THE TEAM UNIFORM.'
                    : 'PICK ONE IN THE SHOP FOR ' + PRICE + ' DIMES. YOU CAN ONLY EVER OWN ONE - THE OTHER LOCKS FOR GOOD.';
  return '<div class="sec17 uni2319 v524sec"><div class="sh17">WHALE / CROWN <span>' + (have ? 1 : 0) + ' / 1</span></div>' +
   '<div class="det17" style="margin:2px 0 4px">' + note + '</div><div class="grid17">' + tile('whale', have, hm) + tile('crown', have, hm) + '</div></div>';
 }
 const naOn = h => /data-a="v17unig"[^>]*data-v="na"[^>]*class="on"/.test(h) || /data-v="na"[^>]*data-a="v17unig"[^>]*class="on"/.test(h);
 function pass(h) {
  if (typeof h !== 'string' || !naOn(h)) return h;
  const m = '<div class="scroll" id="lockList">';
  const i = h.indexOf(m); if (i < 0) return h;
  const tp = document.createElement('template'); tp.innerHTML = h;
  const list = tp.content.querySelector('#lockList'); if (!list) return h;
  list.querySelectorAll('.fit45sec,.v524sec').forEach(n => n.remove());
  // the empty-set note ("NO UNIFORMS IN THIS SET YET") goes once the block is there
  [...list.children].forEach(n => { if (n.classList && n.classList.contains('note') && /NO UNIFORMS/.test(n.textContent || '')) n.remove(); });
  const box = document.createElement('template'); box.innerHTML = block();
  list.insertBefore(box.content, list.firstChild);
  return tp.innerHTML;
 }
 const lk0 = PANEL_RENDER.locker17;
 if (typeof lk0 === 'function') PANEL_RENDER.locker17 = function () {
  const h = lk0.apply(this, arguments);
  if (off()) return h;
  try { return pass(h); } catch (e) { return h; }
 };
 PANEL_ACT.v524fit = function (w) {
  if (off() || !NAME[w]) return;
  const have = own();
  if (have !== w) { toast('LOCKED - ' + (have ? 'YOU PICKED ' + NAME[have] : 'GET ' + NAME[w] + ' IN THE SHOP - ' + PRICE + ' DIMES'), '#ff9a8a'); return; }
  const t = myTeam();
  if (v46() && t) {
   const on = !V446.wears(t);
   V446.set(t, on);
   toast(on ? tname(t) + ' WEARS ' + NAME[w] + ' - TEAM HELMET + GLOVES STAY' : NAME[w] + ' OFF - BACK TO THE TEAM UNIFORM', '#7dff7a');
   return;
  }
  try { F.setWear(w); } catch (e) {}
 };
 W.V524 = { on: () => !off(), team: myTeam, worn: worn };
})();
