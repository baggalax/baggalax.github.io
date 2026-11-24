/* v560rel.js - Bagga Lax 1.3 release switches (loads last, after v559gsshine.js).
   1) GOOD STICK is public: LIVEOPS.shopOn('pack_goodstick') and GSC501.packOn() always read true, and the goodstick
      config reads enabled. Every Good Stick file (v501 / v504 / v531 / v534 / v537 / v538 / v543 / v559) already keys off
      those two, so the pack, sticks, tape, team, cards and boards all come on with no per-file edits. Owned items untouched.
   2) Good Stick sticks, tape and team tile: the same platinum card background the Good Stick player cards use (rx486).
   3) Career card: the ADD ITEMS button is gone (locker + career screen). Tapping the card is unchanged.
   Kill switch: window.__rl_no560rel = true (everything back as before).
   No ids, rl_* keys, saves or net protocol change. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no560rel || W.__rl560) return;
 const S = W.__rl560 = { err: [] };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + String(e && e.message || e)); };
 const off = () => !!W.__rl_no560rel;
 const PACK = 'pack_goodstick';

 // ---------- 1) Good Stick un-gated ----------
 function wrap(obj, name, make) {
  try {
   const f0 = obj && obj[name];
   if (typeof f0 !== 'function' || f0.__rl560) return !!(f0 && f0.__rl560);
   const f1 = make(f0);
   for (const k in f0) { try { f1[k] = f0[k]; } catch (e) {} }
   f1.__rl560 = true;
   obj[name] = f1;
   return true;
  } catch (e) { fail('wrap ' + name, e); return false; }
 }
 function patch() {
  let ok = true;
  const L = W.LIVEOPS;
  if (L) {
   // v565: the website config (Live-Ops panel) decides. Before the config has loaded (offline) it stays on, so it never flickers out.
   wrap(L, 'shopOn', s0 => function (id) { if (id === PACK && !off() && !L.ready) return true; return s0.apply(this, arguments); });
   wrap(L, 'goodstick', g0 => function () {
    const g = g0.apply(this, arguments);
    return off() || !g || typeof g !== 'object' ? g : Object.assign({}, g, { enabled: L.ready ? !!L.shopOn(PACK) : true });
   });
  } else if (!W.__rl_no502) ok = false;
  const G = W.GSC501;
  if (G) wrap(G, 'packOn', p0 => function () { if (!off()) { try { if (W.LIVEOPS && LIVEOPS.ready) return !!LIVEOPS.shopOn(PACK); } catch (e) {} return true; } return p0.apply(this, arguments); });
  else if (!W.__rl_no501gsc) ok = false;
  return ok;
 }
 if (!patch()) { let n = 0; const iv = setInterval(() => { if (patch() || ++n > 40) clearInterval(iv); }, 250); }
 setInterval(() => { try { if (!off()) patch(); } catch (e) {} }, 2000);

 // ---------- 2) platinum Good Stick items + 3) no ADD ITEMS ----------
 try {
  const css = [
   '#panel .c17.rx486i:not(.lk){border-color:#cfd6dc!important;background:linear-gradient(160deg,#ffffff 0%,#e4e8ec 26%,#b8c0c8 50%,#eef1f4 70%,#c2c9d0 100%)!important;box-shadow:inset 0 0 0 1px #f6f8fa,inset 0 0 0 3px #111214,0 0 0 1px #000,0 0 9px 1px rgba(235,242,255,.75)!important;position:relative;overflow:hidden;animation:rx486glow 2.4s ease-in-out infinite!important}',
   '#panel .c17.rx486i:not(.lk)::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 41%,rgba(255,255,255,.85) 47%,rgba(214,232,255,.45) 51%,transparent 57%)!important;animation:rx486shine 2.4s steps(12) infinite;pointer-events:none}',
   '#panel .c17.rx486i:not(.lk) .art{background:radial-gradient(circle at 50% 40%,#ffffff,#cdd3d9 55%,#76808a)!important;border-color:#111214!important}',
   '#panel .c17.rx486i:not(.lk) .nm{color:#11161b!important}',
   '#panel .c17.rx486i:not(.lk) .rr{color:#000!important;text-shadow:none!important;font-weight:bold}',
   '#panel .c17.rx486i:not(.lk) .by486{color:#3a434c!important}',
   '#panel .cc523 button[data-a="cc523"],#panel .cc523b{display:none!important}',
   '#panel .c9main{overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y}',
   '#panel .c9offers{flex:0 0 auto!important;overflow:visible!important;max-height:none!important}'
  ].join('\n');
  const st = document.createElement('style');
  st.id = 'v560relcss';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  const hide = root => {
   if (off() || !root || !root.querySelectorAll) return;
   for (const b of root.querySelectorAll('.cc523 button,.cc523b button')) if (/^\s*ADD ITEMS\s*$/i.test(b.textContent || '')) b.style.display = 'none';
  };
  const mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) hide(n); });
  const start = () => { try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { fail('mo', e); } };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
 } catch (e) { fail('css', e); }
 S.on = true;
})();
