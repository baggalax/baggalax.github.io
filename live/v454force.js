/* v454force.js - V45.4: FORCED UPDATE (Bagga Lax 1.1, iPhone app only).
 * Charlie (Nov 8 2:17 PM): "Can we require updates?" -> yes.
 * What it does, ONLY inside the native iOS app (never on the website):
 *  - on launch, and again when the app comes back from the background (at most once every 10 min), it reads
 *    https://retrolax.sites.tab.bot/minver.json  (no-store + a cache-busting ?t=, 4 s timeout), shaped like
 *      {"min":"1.1","title":"UPDATE REQUIRED","body":"A NEW VERSION OF BAGGA LAX IS OUT. UPDATE TO KEEP PLAYING.",
 *       "url":"https://apps.apple.com/us/app/bagga-lax/id6829999730"}
 *  - if this app's version (APP_VER below) is LOWER than "min" (1.10 > 1.9, 1.0.1 < 1.1), a full-screen
 *    UPDATE REQUIRED screen covers everything and eats every touch; its one button opens the App Store.
 *  - FAIL OPEN: offline, timeout, 404, bad JSON, a "min" that is not a version -> nothing happens, they play.
 *  - a live ONLINE match or a purchase in flight is never interrupted: the screen waits until the match / purchase ends.
 *    An offline game in progress on resume is paused under the screen.
 *  - a later check that says they're fine (min lowered) takes the screen away again.
 * Raising the minimum needs NO new build: edit minver.json on the website.
 * Native detection: window.Capacitor.isNativePlatform() + getPlatform()==='ios', or the page running from capacitor://.
 *   (NOT window.__rl_ios: index.html sets __rl_ios=true by hand, and the website's index.html carries the same line.)
 * Version: APP_VER is the bundle's MARKETING_VERSION written into this file (the app has no @capacitor/app plugin, so JS
 *   cannot read CFBundleShortVersionString). BUMP IT WITH EVERY RELEASE - codemagic.yaml fails the build if it differs.
 * Test flags (QA only, never set by the game): __rl_454native = true (act as native), __rl_454url = '<url>' (minver
 *   source), __rl_454ver = '1.0' (pretend installed version), __rl_454every = ms (re-check spacing).
 * Kill switch: window.__rl_no454force = true. No storage keys, no ids, no net protocol touched.
 */
(function () {
 'use strict';
 const W = window;
 const APP_VER = '1.2';
 const URL0 = 'https://retrolax.sites.tab.bot/minver.json';
 const STORE = 'https://apps.apple.com/us/app/bagga-lax/id6829999730';
 const TIMEOUT = 4000, EVERY = 10 * 60 * 1000;
 const off = () => !!(W.__rl_no454force || W.__rl_v124gb);
 const native = () => {
  if (W.__rl_454native === true) return true;
  try { const C = W.Capacitor; if (C && typeof C.isNativePlatform === 'function' && C.isNativePlatform() && (!C.getPlatform || C.getPlatform() === 'ios')) return true; } catch (e) { }
  return location.protocol === 'capacitor:';
 };
 const L = W.V454 = { checks: 0, last: null, blocked: false, shown: false, waiting: '', ver: '', min: '', log: [], opens: 0 };
 const lg = s => { L.log.push(Math.round(performance.now()) + ' ' + s); if (L.log.length > 40) L.log.shift(); };
 if (off() || !native()) { L.on = false; return; }
 L.on = true;

 /* ---- version compare: numeric parts, missing = 0. null when not a version ---- */
 const parse = v => { const s = String(v == null ? '' : v).trim().replace(/^v/i, ''); if (!/^\d+(\.\d+){0,3}$/.test(s)) return null; return s.split('.').map(n => parseInt(n, 10)); };
 const cmp = (a, b) => { const n = Math.max(a.length, b.length); for (let i = 0; i < n; i++) { const x = a[i] || 0, y = b[i] || 0; if (x !== y) return x < y ? -1 : 1; } return 0; };
 L.cmp = (a, b) => { const A = parse(a), B = parse(b); return A && B ? cmp(A, B) : null; };
 const myVer = () => String(W.__rl_454ver || APP_VER);

 /* ---- fetch with a hard timeout (the in-app fetch goes through the native proxy, which may ignore AbortController) ---- */
 const getJSON = () => {
  const base = W.__rl_454url || URL0;
  const u = base + (base.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
  let ac = null; try { ac = new AbortController(); } catch (e) { }
  const t = new Promise((_, rej) => setTimeout(() => { try { ac && ac.abort(); } catch (e) { } rej(new Error('timeout')); }, TIMEOUT));
  const f = fetch(u, { cache: 'no-store', credentials: 'omit', signal: ac ? ac.signal : undefined, headers: { 'Accept': 'application/json' } })
   .then(r => { if (!r || !r.ok) throw new Error('http ' + (r && r.status)); return r.text(); })
   .then(tx => JSON.parse(tx));
  return Promise.race([f, t]);
 };

 /* ---- the screen ---- */
 let ov = null, cfg = {};
 const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
 const clip = (s, n, d) => { s = typeof s === 'string' && s.trim() ? s.trim() : d; return s.slice(0, n).toUpperCase(); };
 const css = '#rl454{position:fixed;left:0;top:0;right:0;bottom:0;width:100vw;height:100vh;z-index:2147483600;background:#0b0f14;' +
  'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:auto;touch-action:none;' +
  '-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;' +
  'padding:calc(16px + env(safe-area-inset-top)) calc(24px + env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom)) calc(24px + env(safe-area-inset-left));' +
  'box-sizing:border-box;font:bold 12px/1.4 ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px;text-transform:uppercase;color:#fff;' +
  'background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 2px,transparent 2px 4px)}' +
  '#rl454 .f{border:3px solid #000;box-shadow:0 0 0 2px #2cc4dc,0 6px 0 2px #000;background:#0f1a22;padding:18px 22px 20px;max-width:560px;width:100%;box-sizing:border-box}' +
  '#rl454 .lg{color:#7dff7a;font-size:11px;letter-spacing:3px;margin-bottom:10px;text-shadow:2px 2px 0 #000}' +
  '#rl454 h1{margin:0 0 12px;font-size:26px;line-height:1.15;letter-spacing:2px;color:#fff;' +
  'text-shadow:-2px 0 #000,2px 0 #000,0 -2px #000,0 2px #000,-2px -2px #000,2px 2px #000,-2px 2px #000,2px -2px #000,4px 4px 0 #000}' +
  '#rl454 p{margin:0 0 16px;font-size:13px;color:#fff;text-shadow:-1px 0 #000,1px 0 #000,0 -1px #000,0 1px #000,2px 2px 0 #000}' +
  '#rl454 button{font:inherit;font-size:18px;letter-spacing:3px;text-transform:uppercase;border:3px solid #000;border-radius:3px;padding:12px 34px;min-height:52px;' +
  'background:#7dff7a;color:#0b1a20;box-shadow:0 4px 0 #000;cursor:pointer;-webkit-appearance:none;appearance:none;touch-action:manipulation;pointer-events:auto}' +
  '#rl454 button:active{transform:translateY(3px);box-shadow:0 1px 0 #000;filter:brightness(.9)}' +
  '#rl454 .v{margin-top:12px;font-size:9px;color:#7f9aa6;letter-spacing:1px}' +
  '@media (max-height:380px){#rl454 h1{font-size:20px;margin-bottom:8px}#rl454 p{font-size:11px;margin-bottom:10px}#rl454 .f{padding:12px 18px 14px}#rl454 button{min-height:44px;padding:9px 28px;font-size:16px}}';
 const open = () => {
  const u = /^https:\/\/(apps|itunes)\.apple\.com\//.test(cfg.url || '') ? cfg.url : STORE;
  L.opens++; L.lastOpen = u; lg('open ' + u);
  if (typeof W.__rl_454open === 'function') { try { W.__rl_454open(u); } catch (e) { } return; }
  // In the Capacitor shell a top-level navigation to an outside https URL is cancelled by the shell and handed to
  // UIApplication.open (WebViewDelegationHandler), which opens the App Store app straight on the Bagga Lax page - no
  // gesture rules involved. (RL41.link would show the web listing in an in-app Safari sheet instead: one extra tap.)
  if (W.Capacitor && W.__rl_454native !== true) { try { location.href = u; return; } catch (e) { } }
  try { if (W.open(u, '_blank')) return; } catch (e) { }
  try { if (W.RL41 && typeof RL41.link === 'function') { RL41.link(u); return; } } catch (e) { }
  try { location.href = u; } catch (e) { }
 };
 const eat = e => {
  if (!L.shown || !ov) return;
  const b = ov.querySelector('button');
  if (b && e.target && b.contains(e.target)) return;   // the UPDATE button keeps working
  try { e.stopImmediatePropagation(); e.stopPropagation(); if (e.cancelable && e.type !== 'keyup') e.preventDefault(); } catch (x) { }
 };
 ['touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointerup', 'pointermove', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'keydown', 'keyup', 'wheel', 'gesturestart']
  .forEach(t => { try { W.addEventListener(t, eat, { capture: true, passive: false }); document.addEventListener(t, eat, { capture: true, passive: false }); } catch (e) { } });
 const pauseGame = () => {
  try { if (typeof GAME_SCREENS !== 'undefined' && GAME_SCREENS.includes(screen) && screen !== 'final' && !(W.RLNET && RLNET.inGame)) { paused = true; lg('paused game'); } } catch (e) { }
 };
 const show = () => {
  if (!document.body) { document.addEventListener('DOMContentLoaded', show); return; }
  if (!document.getElementById('rl454css')) { const s = document.createElement('style'); s.id = 'rl454css'; s.textContent = css; document.head.appendChild(s); }
  if (!ov) {
   ov = document.createElement('div'); ov.id = 'rl454';
   ov.setAttribute('role', 'alertdialog'); ov.setAttribute('aria-modal', 'true');
   const stop = e => { if (!(e.target && e.target.tagName === 'BUTTON')) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); } };
   ['touchstart', 'touchmove', 'touchend', 'pointerdown', 'mousedown', 'click'].forEach(t => ov.addEventListener(t, stop, { passive: false }));
  }
  ov.innerHTML = '<div class="f"><div class="lg">BAGGA LAX</div><h1>' + esc(cfg.title) + '</h1><p>' + esc(cfg.body) + '</p>' +
   '<button type="button" id="rl454btn">UPDATE</button><div class="v">YOU HAVE ' + esc(L.ver) + ' &middot; NEED ' + esc(L.min) + '+</div></div>';
  const b = ov.querySelector('button');
  let lastT = 0;
  const go = e => { try { e.preventDefault(); e.stopPropagation(); } catch (x) { } const n = Date.now(); if (n - lastT < 600) return; lastT = n; open(); };
  b.addEventListener('click', go); b.addEventListener('touchend', go, { passive: false });
  if (ov.parentNode !== document.body) document.body.appendChild(ov);
  try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { }
  pauseGame();
  L.shown = true; lg('shown');
 };
 const hide = () => { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); if (L.shown) lg('hidden'); L.shown = false; };

 /* ---- wait for a live online match / a purchase in flight to end before covering the screen ---- */
 let waitT = 0;
 const busy = () => { try { if (W.RLNET && RLNET.inGame) return 'online match'; } catch (e) { } try { if (W.STORE41 && STORE41.busy) return 'purchase'; } catch (e) { } return ''; };
 const apply = () => {
  if (off()) { hide(); return; }
  if (!L.blocked) { hide(); L.waiting = ''; return; }
  const b = busy();
  if (b) { if (L.waiting !== b) lg('waiting: ' + b); L.waiting = b; clearTimeout(waitT); waitT = setTimeout(apply, 1500); return; }
  L.waiting = ''; show();
 };

 /* ---- the check ---- */
 let inflight = false, lastAt = -1e15;
 const check = why => {
  if (off() || inflight) return;
  inflight = true; lastAt = Date.now(); L.checks++;
  getJSON().then(j => {
   const min = j && typeof j === 'object' ? (j.min != null ? j.min : j.minVersion) : null;
   const c = L.cmp(myVer(), min);
   L.ver = myVer(); L.min = String(min);
   if (c === null) { L.last = why + ': no usable min (' + String(min).slice(0, 20) + ') -> play'; lg(L.last); L.blocked = false; apply(); return; }
   cfg = { title: clip(j.title, 40, 'UPDATE REQUIRED'), body: clip(j.body, 200, 'A NEW VERSION OF BAGGA LAX IS OUT. UPDATE TO KEEP PLAYING.'), url: typeof j.url === 'string' ? j.url : STORE };
   L.blocked = c < 0; L.last = why + ': have ' + L.ver + ' min ' + L.min + ' -> ' + (L.blocked ? 'BLOCK' : 'play'); lg(L.last);
   apply();
  }).catch(e => {
   L.last = why + ': fail open (' + String(e && e.message || e).slice(0, 60) + ')'; lg(L.last);
   // keep whatever an earlier SUCCESSFUL check decided this session; a first check that fails lets them play
   apply();
  }).then(() => { inflight = false; });
 };
 L.check = check;
 const every = () => (typeof W.__rl_454every === 'number' ? W.__rl_454every : EVERY);
 const resume = why => { if (document.visibilityState === 'hidden') return; if (Date.now() - lastAt >= every()) check(why); else if (L.blocked) apply(); };
 document.addEventListener('visibilitychange', () => resume('resume'));
 W.addEventListener('pageshow', e => { if (e.persisted) resume('pageshow'); });
 try { const C = W.Capacitor, A = C && C.Plugins && C.Plugins.App; if (A && A.addListener) A.addListener('resume', () => resume('appResume')); } catch (e) { }
 check('launch');
})();
