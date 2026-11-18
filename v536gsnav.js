/* v536gsnav.js - Good Stick pack: never stuck on the "NICE PULL!" screen (Bagga Lax).
   Bug: after buying the GOOD STICK PACK, v501gsc.js shows its NICE PULL! result inside the YARD SALE panel by
   setting a private view flag, and only its own CLOSE action cleared that flag. The YARD SALE / BACK buttons on
   that screen (v17shop) and the menu's YARD SALE button just open the shop again, so the flag stayed set and
   the shop kept showing NICE PULL! (YARD SALE looked like it did nothing). Same for SEE WHAT'S INSIDE -> BACK.
   Fix: the YARD SALE / BACK / LOCKER ROOM buttons clear that flag first, and opening the Yard Sale from anywhere
   else (main menu etc.) always starts on the real shop. Right after a buy the NICE PULL! screen still shows.
   No ids, rl_* keys, saves or net protocol change. Kill switch: window.__rl_no536gn = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no536gn || W.GSN536) return;
 const S = W.GSN536 = { resets: 0, err: [] };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!W.__rl_no536gn;
 function clear() {
  try { if (typeof PANEL_ACT === 'object' && typeof PANEL_ACT.gsc501close === 'function') { PANEL_ACT.gsc501close(); S.resets++; } } catch (e) { fail('close', e); }
  // land on the regular SHOP tab (not the COLLAB tab the pack was bought from)
  try { if (W.LIVEOPS && LIVEOPS.tab === 'collab' && typeof PANEL_ACT.lo502tab === 'function') PANEL_ACT.lo502tab('shop'); } catch (e) { fail('tab', e); }
 }
 const scr = () => { try { return typeof screen !== 'undefined' ? String(screen) : ''; } catch (e) { return ''; } };
 try {
  if (typeof PANEL_ACT === 'object' && PANEL_ACT) {
   for (const k of [ 'v17shop', 'v17locker' ]) {
    const a0 = PANEL_ACT[k];
    if (typeof a0 !== 'function' || a0.__gsn536) continue;
    const a1 = function () { if (!off()) clear(); return a0.apply(this, arguments); };
    a1.__gsn536 = true;
    PANEL_ACT[k] = a1;
   }
  }
 } catch (e) { fail('act', e); }
 // entering the Yard Sale from another screen (menu, home buttons...) always starts on the shop itself
 let last = scr();
 function hook() {
  try {
   if (typeof PANEL_RENDER !== 'object' || !PANEL_RENDER || typeof PANEL_RENDER.shop17 !== 'function') return false;
   if (PANEL_RENDER.shop17.__gsn536) return true;
   const R0 = PANEL_RENDER.shop17;
   const R1 = function () {
    try { if (!off() && last !== 'shop17') clear(); } catch (e) {}
    last = 'shop17';
    return R0.apply(this, arguments);
   };
   for (const k in R0) { try { R1[k] = R0[k]; } catch (e) {} }
   R1.__gsn536 = true;
   PANEL_RENDER.shop17 = R1;
   return true;
  } catch (e) { fail('hook', e); return false; }
 }
 hook();
 // keep track of the screen so a return to the shop is noticed
 setInterval(() => {
  const s = scr();
  if (s !== 'shop17') last = s;
 }, 250);
})();
