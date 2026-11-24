// ===== BAGGA LAX v600tape.js - 1.5 B65: EVERY TAPE COPY KEEPS ITS OWN DURABILITY =====
// Bug:   tape went back to full (3 games) whenever it was taken off and put back on (TAKE OFF, AUTO BEST, ALL OFF,
//        manual unequip, swapping it to another team, new season / world reset, sell + re-buy).
// Cause: wear lives only per PLAYER slot (ST.tape[pk] = games used). items17 equip() sets it to 0 and every removal
//        just forgot it, so the copy came back fresh.
// Fix:   per-copy wear pool. ST.tw600 = { v:1, m:{pk:[id,used]} (copies on season / world players),
//        p:{id:[used,...]} (part-used copies not on a wearing player) }. items17 save() calls TW600.sync(ST), which
//        runs after EVERY gear change, so no path can skip it:
//        - a tape that left a slot parks its wear (max of slot value and last seen value) in the pool (3 = broke = gone)
//        - a tape that arrived in a slot takes the MOST worn free copy of that id from the pool
//        - the same id put back over itself keeps its wear (never lowers)
//        - pool is trimmed to the free copies of that id; the FRESHEST copies go first (sold copies count as the
//          fresh ones, so sell + re-buy gains nothing)
//        Locker tape tiles (TAPE tab + ALL) show the durability bar of the next copy you will get.
//        The lobby TAPE bar already reads ST.tape, which sync keeps right. Wear rules themselves are unchanged
//        (season + world only; quick play / online tape never wears, as before). Kill switch: window.__rl_no600tape
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no600tape) return;
 const isTape = id => typeof id === 'string' && (() => { try { const it = V17.BY[id]; return !!(it && it.slot === 'tape'); } catch (e) { return /^tape_/.test(id); } })();
 const tracked = ST => {
  const out = {};
  for (const [st, pre] of [ [ ST.equip, '' ], [ ST.wequip, 'w:' ] ]) if (st && typeof st === 'object') for (const pid in st) {
   const e = st[pid], id = e && e.tape;
   if (id && isTape(id)) out[pre + pid] = id;
  }
  return out;
 };
 function sync(ST) {
  if (W.__rl_no600tape || !ST || typeof ST !== 'object') return;
  if (!ST.tape || typeof ST.tape !== 'object') return;
  let T = ST.tw600;
  const now = tracked(ST);
  if (!T || typeof T !== 'object' || T.v !== 1 || !T.m || !T.p) {
   // first run: adopt what is on players now, wear as it stands
   T = ST.tw600 = { v: 1, m: {}, p: {} };
   for (const pk in now) T.m[pk] = [ now[pk], Math.max(0, Math.min(3, ST.tape[pk] | 0)) ];
   return;
  }
  const M = T.m, P = T.p;
  const park = (id, u) => { if (u > 0 && u < 3) (P[id] || (P[id] = [])).push(u); };
  // 1) left or changed
  for (const pk of Object.keys(M)) {
   const [id, u0] = M[pk];
   if (now[pk] === id) {
    const u = Math.max(u0 | 0, ST.tape[pk] | 0);
    if ((ST.tape[pk] | 0) !== u) ST.tape[pk] = u;
    M[pk][1] = u;
    continue;
   }
   park(id, Math.max(u0 | 0, now[pk] ? 0 : ST.tape[pk] | 0));
   delete M[pk];
  }
  // 2) trim pool to free copies (inventory minus copies on wearing players); freshest go first
  const on = {};
  for (const pk in now) if (M[pk]) on[now[pk]] = (on[now[pk]] || 0) + 1;
  const arriving = Object.keys(now).filter(pk => !M[pk]);
  for (const id of Object.keys(P)) {
   const a = (P[id] || []).filter(u => u > 0 && u < 3).sort((x, y) => y - x);
   const free = Math.max(0, ((ST.inv && ST.inv[id]) | 0) - (on[id] || 0));
   a.length = Math.min(a.length, free);
   if (a.length) P[id] = a; else delete P[id];
  }
  // 3) arrived: most worn free copy
  for (const pk of arriving) {
   const id = now[pk], a = P[id];
   let u = 0;
   if (a && a.length) { u = a.shift(); if (!a.length) delete P[id]; }
   ST.tape[pk] = u;
   M[pk] = [ id, u ];
  }
 }
 // wear of the next free copy of id (what you get when you put it on); 0 = fresh
 function next(id) {
  try { const a = V17.ST().tw600.p[id]; return a && a.length ? a[0] : 0; } catch (e) { return 0; }
 }
 W.TW600 = { sync: sync, next: next };
 // adopt current state once the game is up (no wear change)
 const boot = () => { try { const S = V17.ST(); if (S && !S.tw600) { sync(S); V17.save(); } } catch (e) {} };
 if (W.V17) boot(); else W.addEventListener('load', boot);

 // ---- locker bars ----
 const css = document.createElement('style');
 css.textContent = '.c17 .art{position:relative}.c17 .art .tw600{position:absolute;left:4px;right:4px;top:3px;height:4px;background:#05080b;box-shadow:0 0 0 1px #000;pointer-events:none;z-index:2}' +
  '.c17 .tw600 i{display:block;height:100%}';
 document.head.appendChild(css);
 const COL = left => left >= 3 ? '#3fe05a' : left === 2 ? '#ffd23a' : '#ff4a3a';
 function bars(root) {
  if (W.__rl_no600tape) return;
  let S;
  try { S = V17.ST(); } catch (e) { return; }
  if (!S) return;
  for (const el of root.querySelectorAll('.c17[data-v]:not(.lk)')) {
   const id = el.getAttribute('data-v');
   if (!isTape(id)) continue;
   let spare = 0;
   try { spare = V17.spare(id); } catch (e) {}
   const left = 3 - next(id), key = spare > 0 ? String(left) : '';
   const art = el.querySelector('.art') || el, old = art.querySelector(':scope > .tw600');
   if ((old ? old.getAttribute('data-l') : '') === key) continue;
   if (old) old.remove();
   if (!key) continue;
   const b = document.createElement('div');
   b.className = 'tw600';
   b.setAttribute('data-l', key);
   b.setAttribute('aria-label', 'DURABILITY ' + left + ' OF 3 GAMES');
   b.innerHTML = '<i style="width:' + Math.round(100 * left / 3) + '%;background:' + COL(left) + '"></i>';
   art.appendChild(b);
  }
 }
 let q = 0;
 const mo = new MutationObserver(() => { if (q) return; q = 1; requestAnimationFrame(() => { q = 0; try { bars(document); } catch (e) {} }); });
 const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); bars(document); } catch (e) {} };
 if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
