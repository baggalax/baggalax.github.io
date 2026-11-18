/* v531gshide.js - Good Stick Co.: FULLY HIDDEN until it is released + the pack lives in the regular shop (Bagga Lax 1.3).
   Charlie (Nov 11 11:49 PM): "Yea fully hidden and the uniforms shouldn't be in lockeroom until release either."
   Charlie (Nov 11 11:54 PM): "Also no collab shop section, it should just be in the regular shop."

   RELEASED = exactly the condition that already shows the GOOD STICK PACK: LIVEOPS.shopOn('pack_goodstick') is true,
   i.e. https://baggalax.github.io/config/liveops.json lists pack_goodstick in "shop" (v502live.js), or the retrolax
   test-site gate in v527gsweb.js is on (it makes shopOn('pack_goodstick') read true on retrolax.sites.tab.bot only).
   Re-read twice a second and on every shop / team-picker draw, so flipping the config releases it with no app update.

   NOT RELEASED (the app, baggalax.sites.tab.bot, baggalax.github.io until the config flips):
     - v501gsc.js / v504gs.js / v527gsweb.js are switched off LIVE through v501's own kill switch window.__rl_no501gsc
       (every Good Stick hook reads it on each call: quick-play COLLAB tab + team card, COLLAB uniform group in the
       Locker Room and the uniform pickers, kits, badge, cards' COLLAB frame, billboard, field boards, buying).
       The flag is only cleared again if this file set it (a real kill switch set by hand stays on).
     - the COLLAB team tab is closed if it was open, a saved quick-play team of GSC is not used.
     - Good Stick items (sticks, tape, team unlock, player cards) are left out of the Locker Room / card lists.
     - the Yard Sale shows NO Good Stick pack and NO collab section.
   A player who already owns Good Stick items keeps every one of them in the save (nothing is deleted or rewritten).

   SHOP (on every host): the separate SHOP / COLLAB tab row in the Yard Sale is gone. When released, the GOOD STICK PACK
   card (same card, price 20 / 15 with follow, same buy / see-inside / follow buttons from v501 / v504) sits in the regular
   shop list right after the event packs. When not released there is nothing to show and no empty section.

   No ids, rl_* keys, saves or net protocol change. Kill switch: window.__rl_no531gh = true (everything back as before). */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_no531gh || W0.__rl531) return;
 const S = W0.__rl531 = { hidden: null, flips: 0, set: false, err: [], shop: 0 };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + String(e && e.message || e)); };
 const ID = 'GSC', PACK = 'pack_goodstick';
 const killed0 = !!W0.__rl_no501gsc;        // v501 killed at boot: nothing of Good Stick exists, leave it alone
 const off = () => !!W0.__rl_no531gh;
 function released() {
  try { const L = W0.LIVEOPS; return !!(L && typeof L.shopOn === 'function' && L.shopOn(PACK)); } catch (e) { return false; }
 }
 S.released = released;
 const hiddenNow = () => !off() && !killed0 && !released();
 S.hiddenNow = hiddenNow;
 function dirty() { try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {} }
 function apply() {
  try {
   if (off() || killed0) { if (S.set) { W0.__rl_no501gsc = false; S.set = false; dirty(); } S.hidden = false; return; }
   const hide = !released();
   if (hide) {
    if (!W0.__rl_no501gsc) { W0.__rl_no501gsc = true; S.set = true; }
    if (W0.__gscCollab) W0.__gscCollab = false;
   } else if (S.set) { W0.__rl_no501gsc = false; S.set = false; }
   if (hide !== S.hidden) { S.hidden = hide; S.flips++; dirty(); }
  } catch (e) { fail('apply', e); }
 }
 apply();
 setInterval(apply, 500);

 // a saved quick-play team of GSC is not used while hidden
 try {
  const q0 = W0.qTeam16;
  if (typeof q0 === 'function') W0.qTeam16 = function () {
   const r = q0.apply(this, arguments);
   try { if (r === ID && hiddenNow()) return null; } catch (e) {}
   return r;
  };
 } catch (e) { fail('q', e); }

 // team pickers: re-check right before every draw (so a config flip shows / hides on the very next frame)
 try {
  const tg0 = W0.teamGrid;
  if (typeof tg0 === 'function') {
   const tg1 = function () { apply(); return tg0.apply(this, arguments); };
   for (const k in tg0) try { tg1[k] = tg0[k]; } catch (e) {}
   W0.teamGrid = tg1;
  }
 } catch (e) { fail('grid', e); }

 // Good Stick items out of the Locker Room / card lists while hidden (owned copies stay in the save)
 const gsItem = id => { try { const it = W0.V17 && V17.BY && V17.BY[id]; return !!(it && it.gsc501); } catch (e) { return false; } };
 function stripItems(root) {
  if (!hiddenNow() || !root || !root.querySelectorAll) return;
  try {
   for (const el of root.querySelectorAll('[data-a="v17lsel"],[data-a="gsc501item"],[data-a="gsc501kit"]')) {
    const v = el.getAttribute('data-v') || '';
    if (el.getAttribute('data-a') === 'v17lsel' && !gsItem(v)) continue;
    const tile = el.closest('.c17') || el;
    tile.remove();
   }
   for (const el of root.querySelectorAll('[data-a="v17uni"],[data-a="v17unig"]')) {
    const v = el.getAttribute('data-v') || '';
    if (v.indexOf(ID + '|') === 0 || (el.getAttribute('data-a') === 'v17unig' && v === 'cb')) el.remove();
   }
  } catch (e) { fail('strip', e); }
 }
 S.stripItems = stripItems;
 try {
  const mo = new MutationObserver(ms => {
   if (!hiddenNow()) return;
   for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) stripItems(n.parentNode || n);
  });
  const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { fail('mo', e); } };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
 } catch (e) { fail('observer', e); }

 // ---------- the Yard Sale: no COLLAB tab, the pack in the regular list ----------
 function packBlock() {
  try {
   if (!released() || !W0.GSC501 || typeof GSC501.shopBlock !== 'function') return '';
   return GSC501.shopBlock() || '';
  } catch (e) { fail('block', e); return ''; }
 }
 function shopFix(h) {
  if (off() || typeof h !== 'string' || h.indexOf('lo502tabs') < 0) return h;
  let doc;
  try { doc = new DOMParser().parseFromString('<div id="rl531">' + h + '</div>', 'text/html'); } catch (e) { return h; }
  const root = doc.getElementById('rl531');
  if (!root) return h;
  const tabs = root.querySelector('.lo502tabs');
  if (tabs) {
   const nx = tabs.nextElementSibling;
   if (nx && nx.classList.contains('st') && /COLLAB/.test(nx.textContent)) nx.remove();
   tabs.remove();
  }
  const col = root.querySelector('#loCollab');
  if (col) col.remove();   // only if the old COLLAB tab was still selected (it is switched back to SHOP below)
  const shop = root.querySelector('#loShop');
  if (shop && !shop.querySelector('#gsc501tile')) {
   const blk = packBlock();
   if (blk) {
    const wrap = doc.createElement('div');
    wrap.id = 'rl531gs';
    wrap.innerHTML = blk;
    const after = shop.querySelector('#vets489tile') || shop.querySelector('#hw16tile');
    const before = shop.querySelector('#shopList');
    const hd = shop.querySelector('.hd');
    if (after && after.parentNode) after.parentNode.insertBefore(wrap, after.nextSibling);
    else if (before && before.parentNode) before.parentNode.insertBefore(wrap, before);
    else if (hd && hd.parentNode) hd.parentNode.insertBefore(wrap, hd.nextSibling);
    else shop.insertBefore(wrap, shop.firstChild);
   }
  }
  S.shop++;
  return root.innerHTML;
 }
 S.shopFix = shopFix;
 const T0 = Date.now();
 function hookShop() {
  try {
   if (typeof PANEL_RENDER !== 'object' || typeof PANEL_RENDER.shop17 !== 'function') return;
   const cur = PANEL_RENDER.shop17;
   if (cur.__rl531) return;
   // go on top of v502's live-ops wrapper (it hooks when its config read ends); without v502 go on after 15 s
   if (!cur.__lo502 && W0.LIVEOPS && !W0.__rl_no502 && Date.now() - T0 < 15000) return;
   const wrapped = function () {
    apply();
    try { if (!off() && W0.LIVEOPS && LIVEOPS.tab === 'collab') LIVEOPS.tab = 'shop'; } catch (e) {}
    let h = cur.apply(this, arguments);
    try { h = shopFix(h); } catch (e) { fail('shop', e); }
    return h;
   };
   for (const k in cur) try { wrapped[k] = cur[k]; } catch (e) {}   // carries v502's __lo502 mark: v502 does not wrap again
   wrapped.__rl531 = true;
   PANEL_RENDER.shop17 = wrapped;
  } catch (e) { fail('hook', e); }
 }
 hookShop();
 setInterval(hookShop, 300);
 S.on = true;
})();
