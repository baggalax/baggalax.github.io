/* v533milshow.js - the MILITARY (Veterans) uniforms always show in Locker Room > Uniforms, grayed out + LOCKED until bought.
   Charlie (Nov 11 11:53 PM): "the military uniforms need to be in the uniform section just locked like grayed out like other
   uniforms people don't have, cuz they just aren't there till you buy it."
   Before: v489vets.js lists the six service teams (ARMY, NAVY, AIR FORCE, MARINES, COAST GUARD, SPACE FORCE) in the Locker
   Room only after the HONOR PACK is owned (UNI21X.lockerTeams() returns [] until then), so they were simply missing.
   Now (every host, the app too): they are always listed in Locker Room > Uniforms (N/A tab, where they sit once owned, each
   team its own row). Without the HONOR PACK every one of their tiles is drawn like any locked uniform (gray, LOCKED,
   "IN THE HONOR PACK") and tapping one only says LOCKED - nothing is equipped. Once the pack is owned this file steps aside
   and v489's own tiles (wear / tap to wear, pack uniforms by item) show exactly as before.
   Prices, the pack, what is buyable, ids, rl_* keys, saves and the net protocol do not change.
   Kill switch: window.__rl_no533ms = true (read live). Also off when v489vets is killed. */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_no533ms || W0.__rl533) return;
 const S = W0.__rl533 = { err: [], added: 0, locked: 0 };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + String(e && e.message || e)); };
 const V = () => (!W0.__rl_no489vets && !W0.__rl_v124gb && W0.VETS489 && Array.isArray(VETS489.ids)) ? VETS489 : null;
 const off = () => !!W0.__rl_no533ms || !V();
 const owns = () => { try { return !!(V() && VETS489.owns && VETS489.owns()); } catch (e) { return false; } };
 const isVet = id => { try { return !!(V() && VETS489.isVet && VETS489.isVet(id)); } catch (e) { return false; } };
 const exists = id => { try { return typeof T === 'function' && !!T(id) && T(id).id === id; } catch (e) { return false; } };
 const showLocked = () => !off() && !owns();
 S.showLocked = showLocked;

 // 1) list them in the Locker Room even before the pack
 function hookList() {
  const X = W0.UNI21X;
  if (!X || typeof X.lockerTeams !== 'function') return false;
  if (X.lockerTeams.__rl533) return true;
  const l0 = X.lockerTeams;
  const l1 = function () {
   let a = [];
   try { a = l0.apply(this, arguments) || []; } catch (e) { fail('list0', e); a = []; }
   try {
    if (showLocked()) {
     a = a.slice();
     for (const id of VETS489.ids) if (exists(id) && a.indexOf(id) < 0) { a.push(id); S.added++; }
    }
   } catch (e) { fail('list', e); }
   return a;
  };
  l1.__rl533 = true;
  X.lockerTeams = l1;
  return true;
 }
 if (!hookList()) { let n = 0; const t = setInterval(() => { n++; if (hookList() || n > 40) clearInterval(t); }, 250); }
 // something may replace UNI21X later (another collab file): re-hook
 setInterval(() => { try { hookList(); } catch (e) {} }, 1000);

 // 2) their tiles look locked until the pack is owned
 const WHERE = 'IN THE HONOR PACK';
 function lockTiles(root) {
  if (!showLocked() || !root || !root.querySelectorAll) return;
  try {
   for (const b of root.querySelectorAll('button.uni17[data-a="v17uni"]')) {
    const v = b.getAttribute('data-v') || '';
    const tid = v.split('|')[0];
    if (!isVet(tid) || b.getAttribute('data-rl533')) continue;
    b.classList.add('lk');
    b.classList.remove('wr17');
    const rr = b.querySelector('.rr');
    if (rr) rr.textContent = 'LOCKED';
    if (!b.querySelector('.wh17')) { const s = document.createElement('small'); s.className = 'wh17'; s.textContent = WHERE; b.appendChild(s); }
    const al = b.getAttribute('aria-label') || '';
    b.setAttribute('aria-label', al.replace(/ \(WEARING\)$/, '') + (/\(LOCKED\)$/.test(al) ? '' : ' (LOCKED)'));
    b.setAttribute('data-rl533', '1');
    S.locked++;
   }
   for (const sec of root.querySelectorAll('.sec17.uni2319')) {
    const tid = sec.getAttribute('data-t');
    if (!isVet(tid)) continue;
    const sp = sec.querySelector('.sh17 span');
    if (sp && !sp.getAttribute('data-rl533')) { const m = /\/\s*(\d+)/.exec(sp.textContent); if (m) sp.textContent = '0 / ' + m[1]; sp.setAttribute('data-rl533', '1'); }
   }
  } catch (e) { fail('tiles', e); }
 }
 S.lockTiles = lockTiles;
 try {
  const mo = new MutationObserver(ms => {
   if (!showLocked()) return;
   for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) lockTiles(n.parentNode || n);
  });
  const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); lockTiles(document); } catch (e) { fail('mo', e); } };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
 } catch (e) { fail('observer', e); }

 // 3) tapping one before the pack only says LOCKED (nothing is equipped)
 function hookAct() {
  if (typeof PANEL_ACT !== 'object' || typeof PANEL_ACT.v17uni !== 'function') return false;
  if (PANEL_ACT.v17uni.__rl533) return true;
  const a0 = PANEL_ACT.v17uni;
  const a1 = function (v) {
   try {
    const tid = String(v == null ? '' : v).split('|')[0];
    if (showLocked() && isVet(tid)) {
     try { (W0.V17 && V17.toast ? V17.toast : toast)('LOCKED - ' + WHERE, '#ff9a8a'); } catch (e) {}
     try { SFX.bad(); } catch (e) {}
     return W0.PANEL_KEEP;
    }
   } catch (e) { fail('act', e); }
   return a0.apply(this, arguments);
  };
  for (const k in a0) try { a1[k] = a0[k]; } catch (e) {}
  a1.__rl533 = true;
  PANEL_ACT.v17uni = a1;
  return true;
 }
 if (!hookAct()) { let n = 0; const t = setInterval(() => { n++; if (hookAct() || n > 40) clearInterval(t); }, 250); }
 setInterval(() => { try { hookAct(); } catch (e) {} }, 1000);
 S.on = true;
})();
