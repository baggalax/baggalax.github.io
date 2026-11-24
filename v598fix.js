/* v598fix.js - Bagga Lax 1.5f: Jonny's release-sweep LOW items (REPORT.md L1, L4, L5, L6, L7).
 * L4 bug: the FACEOFF / GET READY banner showed through PAUSED. Cause: drawPause dims with a 70% black only. Fix: one
 *    more dark layer under the pause menu (the menu itself is unchanged), so the field banners are hidden while paused.
 * L5 bug: the achievement toast (.ban17) slid down over the DIMES counter. Cause: style.css pins it at top:6px. Fix: it
 *    drops in under the header / HUD row (top 54px, below the notch inset).
 * L6 bug: on iPad the Friends / account panel (#acct23) used only the top-left corner. Fix: on big screens the panel
 *    content is centred and scaled up.
 * L7 bug: the Friends footer sat in the home-bar strip. Fix: bottom padding that clears the home bar.
 * Toasts are hidden while the game is paused (they landed on the PAUSED title).
 * L1: the pack-open SKIP button (v579animpk) in the new button style.
 * Kill switch: window.__rl_no598fix
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__rl_no598fix || Wn.__v598fix) return; Wn.__v598fix = 1;
 try {
  const s = document.createElement('style'); s.id = 'v598fixcss';
  s.textContent =
   '.ban17{top:calc(env(safe-area-inset-top) + 54px)!important}html.p598 .ban17{visibility:hidden!important}' +
   '#acct23{padding-bottom:max(28px,calc(env(safe-area-inset-bottom) + 16px))!important}' +
   '@media (min-width:900px) and (min-height:600px){#acct23>*{zoom:1.35;max-width:760px;margin-left:auto!important;margin-right:auto!important}#acct23>*:first-child{margin-top:6vh!important}}' +
   '#an579skip{font:bold 12px ui-monospace,Menlo,Consolas,monospace!important;letter-spacing:.5px;color:#0b1a20!important;background:#c9d6d9!important;border:2px solid #0b1a20!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.45),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000!important;padding:6px 14px!important;min-height:30px;right:max(50px,calc(env(safe-area-inset-right) + 12px))!important}';
  document.head.appendChild(s);
 } catch (e) {}
 // achievement toasts never sit on the pause screen (Jonny): hidden while paused, they show again on RESUME
 setInterval(() => { try { const on = typeof paused !== 'undefined' && !!paused && typeof game !== 'undefined' && !!game; document.documentElement.classList.toggle('p598', on); } catch (e) {} }, 150);
 // build number on the version label ("V1.5 B53"), read from sw.js's cache name so it always matches the bundle
 Wn.RL_BUILD = Wn.RL_BUILD || null;
 try { fetch('sw.js', { cache: 'no-store' }).then(r => r.text()).then(t => { const m = /retrolax-[a-z0-9-]*?-v(\d+)['"]/.exec(t); if (m) Wn.RL_BUILD = +m[1]; }).catch(() => {}); } catch (e) {}
 try { const t0 = Wn.text; if (typeof t0 === 'function' && !t0.__b598) { const t1 = function (s) { if (s === 'V1.5' && Wn.RL_BUILD && !Wn.__rl_no598build) { const a = Array.prototype.slice.call(arguments); a[0] = 'V1.5 B' + Wn.RL_BUILD; return t0.apply(this, a); } return t0.apply(this, arguments); }; t1.__b598 = 1; Wn.text = t1; } } catch (e) {}
 // Lobby toasts (AUTO BEST, TAKE OFF, equip, sales bar, achievements ...) are drawn on the canvas, so the DOM player / crew
 // cards covered them. In a lobby they are now a DOM layer above everything, centred over the player (left stage), not
 // under a card. Elsewhere they stay on the canvas as before. Kill switch: window.__rl_no598toast
 let tl = null;
 const inLobby = () => { try { if (typeof screen === 'undefined') return false; if (screen === 'gear17') return true; if (screen === 'menu' && typeof lobby !== 'undefined' && lobby && lobby.layout && Wn.M37 && M37.page !== 'home') return true; } catch (e) {} return false; };
 Wn.TOAST598 = function (list) {
  if (!inLobby()) { if (tl) tl.style.display = 'none'; return false; }
  const now = typeof menuT === 'number' ? menuT : performance.now() / 1000;
  for (let i = list.length - 1; i >= 0; i--) if (now - list[i].t0 > 2.6) list.splice(i, 1);
  if (!tl) { tl = document.createElement('div'); tl.id = 'toast598'; tl.style.cssText = 'position:fixed;z-index:2147482000;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:'+Math.round(2*(innerWidth/ (typeof W==='number'?W:400)))+'px;transform:translateX(-50%)'; document.body.appendChild(tl); }
  if (!list.length) { tl.style.display = 'none'; return true; }
  let cx = innerWidth / 2, top = 40;
  try { const st = (document.getElementById('stage') || document.querySelector('canvas')).getBoundingClientRect(), L = (lobby && lobby.layout && lobby.layout.L) || W * .6, hx = (lobby && lobby.layout && lobby.layout.hx) || L * .48; cx = st.left + hx / W * st.width; top = st.top + (Wn.__t598y || 54) / H * st.height; } catch (e) {}
  tl.style.display = 'flex'; tl.style.left = Math.round(cx) + 'px'; tl.style.top = Math.round(top) + 'px';
  let sc = 3; try { const st = (document.getElementById('stage') || document.querySelector('canvas')).getBoundingClientRect(); sc = st.width / W; } catch (e) {}
  const pix = t => { const k = t.s + '|' + t.col; if (Wn.__t598c && Wn.__t598c[k]) return Wn.__t598c[k]; const c = document.createElement('canvas'), w = textW(t.s) + 10; c.width = w; c.height = 11; const x = c.getContext('2d'), g0 = g; try { g = x; rect(0, 0, w, 11, 'rgba(0,0,0,.86)'); rect(0, 0, w, 1, t.col); text(t.s, w / 2, 3, 1, t.col, 'center'); } finally { g = g0; } const u = c.toDataURL(); Wn.__t598c = Wn.__t598c || {}; Wn.__t598c[k] = [u, w]; return [u, w]; }; // the game's own pixel font, drawn off screen
  const html = list.slice(-3).reverse().map(t => { const e = now - t.t0, a = e > 2.2 ? Math.max(0, (2.6 - e) / .4) : 1, p = pix(t); return '<img alt="" src="' + p[0] + '" style="display:block;opacity:' + a.toFixed(2) + ';width:' + Math.round(p[1] * sc) + 'px;height:' + Math.round(11 * sc) + 'px;image-rendering:pixelated;max-width:' + Math.round(innerWidth * .6) + 'px">'; }).join('');
  if (tl.__h !== html) { tl.__h = html; tl.innerHTML = html; }
  return true;
 };
 try {
  const dp0 = Wn.drawPause;
  if (typeof dp0 === 'function' && !dp0.__f598) {
   const dp = function () { try { if (typeof pauseSet === 'undefined' || !pauseSet) rect(0, 0, W, H, 'rgba(4,8,12,.92)'); } catch (e) {} return dp0.apply(this, arguments); };
   dp.__f598 = 1; Wn.drawPause = dp;
  }
 } catch (e) {}
})();

// 1.5f: the uniform plate in the Locker League / card-team lobby said BASIC while the team wore The Whale / The Crown
// (v446's label only names the fit on 'editable' screens). Kill switch: window.__rl_no600fitlabel
(function () {
 const Wn = window;
 setTimeout(() => {
  try {
   const U = Wn.UNI21; if (!U || typeof U.label !== 'function') return; const l0 = U.label;
   U.label = function (i, tid) { try { if (!Wn.__rl_no600fitlabel && !i && tid && !(Wn.RK15U && RK15U.wornKey(tid)) && Wn.V446 && V446.wears(tid) && Wn.V445 && V445.pick && V445.pick()) return V445.pick() === 'crown' ? 'THE CROWN' : 'THE WHALE'; } catch (e) {} return l0.apply(this, arguments); };
  } catch (e) {}
 }, 0);
})();
// 1.5f (Jonny B61 LOW 1): the NEW IN THE YARD SALE popup (tut26 #shop26) could open in a lobby and stay into a match, where
// it ate the online DOWN tap. It only shows on the main menu now: anywhere else it is closed WITHOUT marking the items as
// seen, so it comes back the next time the menu shows. Kill switch: window.__rl_no600shop26
(function () {
 const Wn = window;
 const away = () => { try { if (Wn.RLNET && (RLNET.on || RLNET.inGame)) return true; return typeof screen !== 'undefined' && screen !== 'menu'; } catch (e) { return false; } };
 const sweep = () => { try { if (Wn.__rl_no600shop26) return; const d = document.getElementById('shop26'); if (d && away()) d.remove(); } catch (e) {} };
 setInterval(sweep, 150);
 try { const ng = Wn.newGame; if (typeof ng === 'function') Wn.newGame = function () { sweep(); try { const d = document.getElementById('shop26'); if (d && !Wn.__rl_no600shop26) d.remove(); } catch (e) {} return ng.apply(this, arguments); }; } catch (e) {}
})();
// 1.5f (Jonny B61/B62 LOW): while a panel (shop, packs, locker...) is open the achievement toast covered the DIMES chip,
// BUY buttons and prices, and at 800x360 it slid in below the bottom edge. It is now HELD while a panel is open and shown
// (top, its normal spot) once the panel closes. Kill switch: window.__rl_no600banpos
(function () {
 const Wn = window, held = []; let busy = 0;
 const panelOn = () => { try { if (typeof screen !== 'undefined' && /^pack/.test(screen)) return true; const p = document.getElementById('panel'); return !!p && p.style.display !== 'none' && p.offsetWidth > 0; } catch (e) { return false; } }; // pack opening counts too
 function replay(el0) { try { const el = el0.cloneNode(true); busy = Date.now() + 3400; el.classList.remove('on'); (document.getElementById('stage') || document.body).appendChild(el); setTimeout(() => el.classList.add('on'), 30); setTimeout(() => { el.classList.remove('on'); setTimeout(() => { try { el.remove(); } catch (e) {} }, 400); }, 2800); } catch (e) {} }
 try {
  new MutationObserver(ms => { if (Wn.__rl_no600banpos || !panelOn()) return; for (const m of ms) for (const n of m.addedNodes) if (n && n.classList && n.classList.contains('ban17') && !n.__held600) { n.__held600 = 1; held.push(n); try { n.remove(); } catch (e) {} } })
   .observe(document.body, { childList: true, subtree: true });
 } catch (e) {}
 setInterval(() => { try { if (held.length && !panelOn() && Date.now() > busy) { const el = held.shift(); replay(el); } } catch (e) {} }, 700);
})();
