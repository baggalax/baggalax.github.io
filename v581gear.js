/* v581gear.js - 1.4 TAKE ALL ITEMS OFF + AUTO BEST (Bagga Lax 1.4, Charlie's Nov 19 list: #5, #6).
 * #5 Ask: send items back to the locker in one tap - (a) everything off ONE team, (b) everything off EVERY team.
 *    LOCKER ROOM, ALL tab: "ALL ITEMS OFF: <TEAM>" (the team of the lobby you came from) + "ALL ITEMS OFF: EVERY TEAM".
 *    LOBBY, next to the HELMET slot: ALL OFF (this team) + AUTO BEST. Every button asks once (tap again: SURE?).
 *    One team: the game's own V17.unequip(pid, slot) for every slot on every lobby player (so card players, tape,
 *    no-stick and team-gear stores are handled exactly like taking items off by hand).
 *    Every team: every gear store in the save is emptied (ST.equip season, ST.mequip / ST.tequip[team] quick play,
 *    ST.wequip world, V28 card-team store). Card-bound honours stay on (All-American / Ultimate badge, Baggatwaan glow):
 *    they belong to the card, not the locker.
 * #6 Ask: AUTO BEST - equip the lobby team with the items you own where they help most.
 *    Players are ranked by the lobby order (current overall, best first); goalies come first for visors (visors only
 *    help goalies vs the sun). For each slot the best HELPFUL item the player can wear goes on: rarity first, then its
 *    real effect (collar concussion, visor sun, tape stick skill, cleats speed / defense / dodging, sticks that break
 *    less, faceoff sticks for the FOGO). Style-only items do nothing, so they are never chosen; a style item the
 *    player was wearing goes back on when no helpful item is left for that slot. Slots, positions (goalie / FO /
 *    field-only sticks) and owned counts are checked by the game's own V17.canEquip / V17.freeCount, so a stacking
 *    item is never used more times than you own it. Cellys and chirps are not touched.
 * No ids, rl_* keys or net protocol changed; online games use the same loadout path as before (myLoadout).
 * Kill switch: window.__rl_no581gear = true.
 */
(function () {
 'use strict';
 const W = window, D = document;
 if (W.__rl_no581gear || W.__rl_v124gb || W.V581G) return;
 const V = W.V581G = { err: [], log: [] };
 const off = () => !!(W.__rl_no581gear || W.__rl_v124gb);
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e).slice(0, 200)); };
 const note = s => { V.log.push(s); if (V.log.length > 30) V.log.shift(); };
 const ST = () => { try { return V17.ST(); } catch (e) { return null; } };
 const BY = id => { try { return V17.BY[id]; } catch (e) { return null; } };
 const P = pid => { try { return PP(pid); } catch (e) { return null; } };
 const GEAR = [ 'helmet', 'visor', 'collar', 'chest', 'legs', 'cleats', 'stick', 'tape' ];
 const ALL = GEAR.concat([ 'celly' ]);
 const bound = id => { const it = BY(id); return !!(it && (it.b35 || it.tew25)); };   // card-bound honours stay
 const toast = (s, c) => { try { V17.toast(s, c || '#7dff7a'); } catch (e) {} };
 const teamName = tid => { try { const t = T(tid), nm = String(t && t.name || ''); return String(nm && nm.length <= 14 ? nm : t && (t.abbr || t.name) || tid).toUpperCase(); } catch (e) { return String(tid || ''); } };

 /* ---------- the lobby team ---------- */
 function lobbyNow() {
  try {
   if (typeof lobbyTeam !== 'function' || typeof lobbyIds !== 'function') return null;
   const tid = lobbyTeam(), ids = tid ? lobbyIds() : null;
   return tid && Array.isArray(ids) && ids.length ? { tid: tid, ids: ids.slice() } : null;
  } catch (e) { return null; }
 }
 V.lobbyNow = lobbyNow;

 /* ---------- #5a everything off one team (the lobby team) ---------- */
 function offTeam(L, slots) {
  L = L || lobbyNow();
  if (!L) return -1;
  let n = 0;
  for (const pid of L.ids) {
   let e = {};
   try { e = V17.eqOf(pid) || {}; } catch (er) { e = {}; }
   for (const k of slots || ALL) {
    const id = e[k];
    if (!id || bound(id)) continue;
    try { V17.unequip(pid, k); n++; } catch (er) { fail('unequip ' + pid + ' ' + k, er); }
   }
  }
  try { V17.save(); } catch (e) {}
  note('offTeam ' + L.tid + ' ' + n);
  return n;
 }
 V.offTeam = offTeam;

 /* ---------- #5b everything off every team ---------- */
 function offEvery() {
  const S = ST();
  if (!S) return -1;
  let n = 0;
  const strip = st => {
   if (!st || typeof st !== 'object') return false;
   let ch = false;
   for (const pid of Object.keys(st)) {
    const e = st[pid];
    if (!e || typeof e !== 'object') continue;
    const keep = {};
    for (const k of Object.keys(e)) { if (e[k] && bound(e[k])) keep[k] = e[k]; else if (e[k]) n++; }
    if (Object.keys(keep).length !== Object.keys(e).length) { ch = true; if (Object.keys(keep).length) st[pid] = keep; else delete st[pid]; }
   }
   return ch;
  };
  try { strip(S.equip); strip(S.mequip); strip(S.wequip); if (S.tequip && typeof S.tequip === 'object') for (const t of Object.keys(S.tequip)) strip(S.tequip[t]); } catch (e) { fail('stores', e); }
  try { const C = W.V28 && V28.cardStore && V28.cardStore(); if (strip(C)) try { V28.save(); } catch (e) {} } catch (e) { fail('c28', e); }
  try { V17.save(); } catch (e) {}
  note('offEvery ' + n);
  return n;
 }
 V.offEvery = offEvery;

 /* ---------- #6 auto best ---------- */
 // 1.4 (Charlie): items go where they help - defense items to defenders, dodge/stick items to attack + middies,
 // speed to middies first, faceoff tap to FOGOs, visors to goalies.
 const grpOf = p => { const q = p && p.pos; return q === 'G' ? 'G' : (q === 'D' || q === 'LSM') ? 'D' : q === 'A' ? 'A' : 'M'; };
 const FIT = {
  def: { D: 1, M: .45, A: .1, G: .15 },
  dodge: { A: 1, M: .9, D: .25, G: 0 },
  stk: { A: 1, M: .9, D: .7, G: .5 },     // tape: every player gets a roll
  spd: { A: 1, M: 1, D: .3, G: 0 },       // Golden Racers: offense (attack + middies)
  conc: { A: 1, M: 1, D: 1, G: 1 }
 };
 function effVal(it, p) {
  let v = 0;
  const e = it.eff || {}, g = grpOf(p);
  for (const k of Object.keys(e)) {
   const x = +e[k];
   if (!isFinite(x)) continue;
   const w = FIT[k] ? FIT[k][g] : 1;
   if (k === 'visor') v += p && p.pos === 'G' ? x * 200 : 0;
   else if (k === 'tap') v += p && p.pos === 'FO' && it.fo ? 60 + (x - 1) * 400 : 0;  // FOGOs: best faceoff stick always
   else if (k === 'conc') v += x * 20 * w;
   else if (x > 1 && x < 2) v += (x - 1) * 100 * w;  // multipliers (dodge 1.08 ...)
   else if (x > 0 && x < 1) v += x * 20 * w;
   else if (x >= 2) v += x * 2 * w;                  // flat points (stk 2, spd 4, def 4 ...)
  }
  if (it.slot === 'stick') {
   const b = it.brk != null ? +it.brk : .05;
   if (isFinite(b) && b < .05) v += (.05 - b) * 400;  // breaks less than the regular stick
   if (it.gscGk && p && p.pos === 'G') v += 60;          // goalies: best goalie stick
   if (it.fo && p && p.pos !== 'FO') v = 0;
  }
  return v;
 }
 function score(it, p) {
  const v = effVal(it, p);
  if (!(v > .5)) return 0;
  // fit first (a defense item scores low on an attackman however rare it is), rarity scales it up
  return v * (1 + .35 * (it.rar | 0)) + (it.leg20 ? 15 : 0);
 }
 const ovrOf = p => { const o = p && (p.ovr != null ? p.ovr : p.r && p.r.ovr); return isFinite(+o) ? +o : 70; };
 V.score = (id, pid) => { const it = BY(id); return it ? score(it, P(pid)) : 0; };
 function autoBest(L) {
  L = L || lobbyNow();
  if (!L) return -1;
  const S = ST(); if (!S || !S.inv) return -1;
  const before = {};
  for (const pid of L.ids) { try { before[pid] = Object.assign({}, V17.eqOf(pid) || {}); } catch (e) { before[pid] = {}; } }
  offTeam(L, GEAR);
  const owned = Object.keys(S.inv).map(id => BY(id)).filter(it => it && it.slot && GEAR.indexOf(it.slot) >= 0 && !it.b35 && !it.tew25 && (S.inv[it.id] | 0) > 0);
  const can = (pid, id) => { try { return !V17.canEquip(pid, id) && V17.freeCount(id) > 0; } catch (e) { return false; } };
  let n = 0;
  const order = [ 'stick', 'collar', 'cleats', 'tape', 'visor', 'helmet', 'legs', 'chest' ];
  for (const slot of order) {
   const list = owned.filter(it => it.slot === slot);
   if (!list.length) continue;
   // best pairs first across the whole team: (fit x rarity) x player quality, so the best items land on the best
   // players at the positions they help, and nothing goes where it does nothing
   const pairs = [];
   for (const pid of L.ids) { const p = P(pid); if (!p) continue; for (const it of list) { const sc = score(it, p); if (sc > 0) pairs.push([ sc * (1 + ovrOf(p) / 100), pid, it ]); } }
   pairs.sort((a, b) => b[0] - a[0]);
   const done = new Set();
   for (const [ , pid, it ] of pairs) {
    if (done.has(pid) || !can(pid, it.id)) continue;
    try { if (V17.equip(pid, it.id)) { n++; done.add(pid); } } catch (e) { fail('equip', e); }
   }
  }
  // style items the player wore come back where nothing helpful went on (helmet + visor share the HELMET tray)
  let back = 0;
  for (const pid of L.ids) {
   let e = {};
   try { e = V17.eqOf(pid) || {}; } catch (er) {}
   for (const k of GEAR) {
    const id = before[pid] && before[pid][k];
    if (!id || e[k] || bound(id)) continue;
    if (can(pid, id)) { try { if (V17.equip(pid, id)) back++; } catch (er) {} }
   }
  }
  try { V17.save(); } catch (e) {}
  note('auto ' + L.tid + ' ' + n + ' +' + back);
  return n;
 }
 V.autoBest = autoBest;

 /* ---------- pixel buttons (game font) ---------- */
 const pxC = {};
 function pxTxt(s, col, sc) {
  sc = sc || 1.5;
  let F = null; try { F = FONT; } catch (e) {}
  if (!F) return '<b>' + s + '</b>';
  const k = s + col + sc;
  if (!pxC[k]) {
   const cs = Math.round(sc * 2), c = D.createElement('canvas'); c.width = Math.max(1, (s.length * 4 - 1) * cs); c.height = 5 * cs;
   const x = c.getContext('2d'); x.fillStyle = col;
   for (let i = 0; i < s.length; i++) { const gl = F[s[i]] || F['?']; if (!gl) continue; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (gl[r] && gl[r][q] === '#') x.fillRect((i * 4 + q) * cs, r * cs, cs, cs); }
   pxC[k] = '<img alt="' + s + '" src="' + c.toDataURL() + '" style="width:' + c.width / 2 + 'px;height:' + c.height / 2 + 'px;image-rendering:pixelated;pointer-events:none">';
  }
  return pxC[k];
 }
 try {
  const css = '.g581{position:absolute;z-index:3;display:flex;flex-direction:column;gap:3px;pointer-events:none}'
   + '.g581 button,.g581l button{pointer-events:auto;font:bold 9px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.5px;text-transform:uppercase;border:2px solid #05080b;border-radius:0;box-shadow:0 2px 0 #000;padding:2px 4px;min-height:0;cursor:pointer;touch-action:manipulation;-webkit-appearance:none;appearance:none;display:flex;align-items:center;justify-content:center;line-height:1}'
   + '.g581 .ab{background:#7dff7a;color:#0b1a20}.g581 .ao{background:#c9d6d9;color:#0b1a20}.g581 .sure,.g581l .sure{background:#ffd23a!important}'
   + '.g581l{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px}.g581l button{font-size:11px;padding:6px 10px;background:#c9d6d9!important;color:#0b1a20}.g581l button.ev{background:#ff9a8a!important}';
  const st = D.createElement('style'); st.id = 'v581gearcss'; st.textContent = css; (D.head || D.documentElement).appendChild(st);
 } catch (e) { fail('css', e); }
 // tap once = SURE?, tap again within 3 s = do it
 function armed(b, label, col, fn, sc) {
  b.addEventListener('click', ev => {
   ev.preventDefault(); ev.stopPropagation();
   try { if (W.SFX && SFX.tap) SFX.tap(); } catch (e) {}
   if (!b.__arm || Date.now() - b.__arm > 3000) {
    b.__arm = Date.now(); try { if (!b.style.minWidth) b.style.minWidth = b.offsetWidth + 'px'; } catch (e) {} b.classList.add('sure'); b.innerHTML = pxTxt('SURE?', '#0b1a20', sc);
    setTimeout(() => { if (b.__arm && Date.now() - b.__arm >= 2900) { b.__arm = 0; b.classList.remove('sure'); b.innerHTML = pxTxt(label, col, sc); } }, 3050);
    return;
   }
   b.__arm = 0; b.classList.remove('sure'); b.innerHTML = pxTxt(label, col, sc);
   try { fn(); } catch (e) { fail('btn ' + label, e); }
   try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {}
  });
  ['pointerdown', 'touchstart', 'mousedown'].forEach(t => b.addEventListener(t, e => e.stopPropagation(), { passive: true }));
 }
 function mkBtn(cls, label, col, fn, aria, sc) {
  const b = D.createElement('button'); b.type = 'button'; b.className = cls; b.innerHTML = pxTxt(label, col, sc); b.setAttribute('aria-label', aria || label);
  armed(b, label, col, fn, sc); return b;
 }

 /* ---------- lobby: next to the HELMET slot ---------- */
 let box = null;
 function lobbyTick() {
  const h = !off() && typeof screen !== 'undefined' && screen === 'menu' ? D.querySelector('.hb[aria-label="GEAR HELMET"]') : null;
  const L = h ? lobbyNow() : null;
  let ok = !!(h && L && h.offsetParent);
  try { if (ok && V17.modal && V17.modal()) ok = false; } catch (e) {}
  if (!ok) { if (box) box.style.display = 'none'; return; }
  if (!box || !box.isConnected || box.parentNode !== h.parentNode) {
   if (box) box.remove();
   box = D.createElement('div'); box.className = 'g581'; box.id = 'g581lobby';
   box.appendChild(mkBtn('ab', 'AUTO BEST', '#0b1a20', () => { const L2 = lobbyNow(); const n = autoBest(L2); toast(n >= 0 ? 'AUTO BEST: ' + n + ' ITEMS ON ' + teamName(L2 && L2.tid) : 'PICK A TEAM FIRST', n >= 0 ? '#7dff7a' : '#ff9a8a'); }, 'AUTO BEST: EQUIP THIS TEAM WITH YOUR BEST ITEMS'));
   box.appendChild(mkBtn('ao', 'ALL OFF', '#0b1a20', () => { const L2 = lobbyNow(); const n = offTeam(L2); toast(n >= 0 ? n + ' ITEMS BACK IN THE LOCKER (' + teamName(L2 && L2.tid) + ')' : 'PICK A TEAM FIRST', n >= 0 ? '#c9d6d9' : '#ff9a8a'); }, 'TAKE ALL ITEMS OFF THIS TEAM'));
   h.parentNode.appendChild(box);
  }
  const w = Math.max(60, Math.round(h.offsetWidth * 1.25)), bh = Math.max(14, Math.floor((h.offsetHeight - 3) / 2));
  box.style.display = 'flex';
  box.style.left = (h.offsetLeft + h.offsetWidth + 3) + 'px';
  box.style.top = h.offsetTop + 'px';
  box.style.width = w + 'px';
  for (const b of box.children) b.style.height = bh + 'px';
 }
 setInterval(() => { try { lobbyTick(); } catch (e) { fail('lobby', e); if (box) box.style.display = 'none'; } }, 250);

 /* ---------- locker room, ALL tab ---------- */
 function lockerPass() {
  if (off()) return;
  const pn = D.getElementById('panel'); if (!pn || pn.dataset.scr !== 'locker17') return;
  const allOn = pn.querySelector('button[data-a="v17sec"][data-v="all"].on');
  const row0 = pn.querySelector('#g581lk');
  if (!allOn) { if (row0) row0.remove(); return; }
  if (row0) return;
  const prog = pn.querySelector('.u578prog') || [...pn.querySelectorAll('div')].find(e => /^\d+ \/ \d+ UNLOCKED/.test(e.textContent.trim()) && e.children.length < 8);
  if (!prog || !prog.parentNode) return;
  const row = D.createElement('div'); row.className = 'g581l'; row.id = 'g581lk';
  const L = lobbyNow();
  if (L) { const nm = teamName(L.tid); row.appendChild(mkBtn('', 'ALL ITEMS OFF: ' + nm, '#0b1a20', () => { const n = offTeam(lobbyNow()); toast(n >= 0 ? n + ' ITEMS BACK IN THE LOCKER (' + nm + ')' : 'NO TEAM', '#c9d6d9'); }, 'TAKE ALL ITEMS OFF ' + nm, 2)); }
  row.appendChild(mkBtn('ev', 'ALL ITEMS OFF: EVERY TEAM', '#0b1a20', () => { const n = offEvery(); toast(n + ' ITEMS BACK IN THE LOCKER (EVERY TEAM)', '#c9d6d9'); }, 'TAKE ALL ITEMS OFF EVERY TEAM', 2));
  prog.parentNode.insertBefore(row, prog.nextSibling);
 }
 function boot() {
  const pn = D.getElementById('panel');
  if (!pn || typeof MutationObserver !== 'function') { setTimeout(boot, 600); return; }
  let q = false;
  new MutationObserver(() => { if (q) return; q = true; Promise.resolve().then(() => { q = false; try { lockerPass(); } catch (e) { fail('locker', e); } }); }).observe(pn, { childList: true, subtree: true });
 }
 if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
