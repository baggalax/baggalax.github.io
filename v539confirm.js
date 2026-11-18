/* v539confirm.js - YARD SALE confirm popups show on screen, wherever the shop is scrolled (Bagga Lax).
   Charlie (Nov 12 2026 12:21 AM ET): tapping PICK on THE WHALE / THE CROWN or BUY on the CAREER ticket opens the
   confirm popup at the TOP of the shop instead of where he's scrolled, so he can't see it.
   Cause: every shop popup is the game's .pop17 overlay (position:absolute; inset:0). It is drawn inside the scrolling
   shop content (v502's #loShop box), so "inset:0" pins it to the top of the content, not to the screen. Scrolled down
   to the WHALE / CROWN tile it sits several hundred pixels above the visible area (measured: box at -412 px at 932x430).
   Fix: while the YARD SALE (shop17) or a pack's SEE WHAT'S INSIDE view (bnd17) is open, every .pop17 is fixed to the
   screen, full size, above everything, so its box is centered in what you see. Covers all shop popups (WHALE / CROWN
   pick + preview, CAREER ticket, GOOD STICK, item cards...), whatever file draws them.
   Ids, rl_* keys, saves and the net protocol are unchanged. No new save keys.
   Kill switch: window.__rl_no539cf = true (read live). */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no539cf || W.__rl539cf) return;
 const S = W.__rl539cf = { err: [], on: false };
 const SHOP = { shop17: 1, bnd17: 1 };
 const scr = () => { try { return typeof screen === 'string' ? screen : ''; } catch (e) { return ''; } };
 try {
  const st = document.createElement('style');
  st.id = 'v539cfcss';
  st.textContent = '#panel[data-cf539="1"] .pop17{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;' +
   'inset:0!important;width:auto!important;height:auto!important;margin:0!important;transform:none!important;z-index:2147483000!important;' +
   'padding:max(6px,env(safe-area-inset-top)) max(6px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left));box-sizing:border-box}' +
   '#panel[data-cf539="1"] .pop17>.pbox17{max-height:calc(100% - 4px)}';
  (document.head || document.documentElement).appendChild(st);
 } catch (e) { S.err.push('css: ' + (e && e.message || e)); }
 function tick() {
  try {
   const p = document.getElementById('panel');
   if (!p) return;
   const want = !W.__rl_no539cf && !!SHOP[scr()];
   if (want && p.dataset.cf539 !== '1') p.dataset.cf539 = '1';
   else if (!want && p.dataset.cf539) delete p.dataset.cf539;
   S.on = want;
  } catch (e) { if (S.err.length < 10) S.err.push('tick: ' + (e && e.message || e)); }
 }
 tick();
 setInterval(tick, 120);
 // a tap that opens a popup re-renders the panel in the same frame; tick on taps too so the rule is on before paint
 try { document.addEventListener('pointerdown', tick, true); document.addEventListener('click', tick, true); } catch (e) {}
})();
