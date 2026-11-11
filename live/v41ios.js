// ===== BAGGA LAX V41 iOS APP SHELL GLUE (v41ios.js) - loaded FIRST (before roster.js) =====
// What it does ONLY inside the iPhone app (the Capacitor shell, see /w/ios) - the website is untouched:
//  1. window.__rl_ios = true when the page runs in the native iOS shell (Capacitor reports platform 'ios'). Test: ?ios41=1 on any copy.
//  2. API: the bundled game is served from capacitor://localhost, so the game's relative '/api/...' calls are sent to the real server
//     (RL41_API, default https://retrolax.sites.tab.bot). Only when the page is NOT already on an http(s) host (so ?ios41=1 tests on
//     localhost still talk to their own local server). The server must answer CORS for capacitor://localhost (server/_worker_app41.js does).
//  3. Apple 3.1.1 / 4.2 tidy-ups: the ribbon board's "YOUR AD HERE" placeholder becomes BAGGA LAX only; the web-push NOTIFICATIONS block
//     (and its "ADD BAGGA LAX TO YOUR HOME SCREEN" text) is hidden - web push does not exist inside an app; the "TURN YOUR PHONE SIDEWAYS"
//     cover never shows (the app is locked to landscape).
//  4. Safe area: WKWebView without viewport-fit=cover reports env() insets as 0 while the home bar still covers the bottom edge, so the
//     game's own 24.0.3 safe-area rule gets its bottom inset through its test flag (__rl_safeb2403 = 34) on home-indicator iPhones.
//  5. Links: PRIVACY / SUPPORT / TERMS open in the system browser (Capacitor Browser plugin when present, else a new window).
// Ids, save keys and the online protocol are unchanged. Off: window.__rl_no41ios (and always off in FISH, __rl_v124gb).
(function () {
  'use strict';
  var W = window;
  if (W.__rl_no41ios || W.__rl_v124gb) { W.__rl_ios = false; return; }
  var cap = W.Capacitor, plat = '';
  try { plat = cap && cap.getPlatform ? cap.getPlatform() : ''; } catch (e) { }
  var qs = /[?&]ios41=1(&|$)/.test(location.search);
  W.__rl_ios = W.__rl_ios === true || plat === 'ios' || qs;
  var R = W.RL41 = { ios: !!W.__rl_ios, plat: plat || (qs ? 'ios-test' : 'web'), api: '', log: [] };
  R.site = W.RL41_SITE || 'https://retrolax.sites.tab.bot';
  R.link = function (path) {   // privacy / support / terms: bundled pages inside the app, the site's own pages on the web
    var u = /^https?:/.test(path) ? path : (location.protocol === 'http:' || location.protocol === 'https:' ? path : R.site + '/' + path.replace(/^\//, ''));
    if (!R.ios) { try { W.open(u, '_blank', 'noopener'); } catch (e) { location.href = u; } return; }
    try { var B = cap && (cap.Plugins && cap.Plugins.Browser || (cap.registerPlugin && cap.registerPlugin('Browser'))); if (B && B.open && /^https?:/.test(u)) { B.open({ url: u }); return; } } catch (e) { }
    try { W.open(u, '_blank'); } catch (e) { location.href = u; }
  };
  if (!R.ios) return;
  document.documentElement.classList.add('ios41');
  // ---------- 2. the API base ----------
  var onWeb = location.protocol === 'http:' || location.protocol === 'https:';
  R.api = W.RL41_API || (onWeb ? '' : R.site);
  if (R.api) {
    var F0 = W.fetch;
    var fix = function (u) { return typeof u === 'string' && u.indexOf('/api') === 0 ? R.api + u : u; };
    W.fetch = function (input, init) {
      try {
        if (typeof input === 'string') input = fix(input);
        else if (input && typeof input.url === 'string' && input.url.indexOf(location.origin + '/api') === 0) input = new Request(R.api + input.url.slice(location.origin.length), input);
      } catch (e) { }
      return F0.call(this, input, init);
    };
    W.fetch.__rl41 = true;
  }
  // ---------- 5. keyboard: keep the game full size while typing (the keyboard shrinks the visual viewport) ----------
  if (!W.__rl_no41kb) {
    var isTyping = function () { var a = document.activeElement; return !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable); };
    var block = function (e) { if (isTyping()) { e.stopImmediatePropagation(); } };
    W.addEventListener('resize', block, true);
    if (W.visualViewport) W.visualViewport.addEventListener('resize', block, true);
    document.addEventListener('focusout', function () {
      [60, 350, 800].forEach(function (t) { setTimeout(function () { if (!isTyping()) { try { if (W.scrollX || W.scrollY) W.scrollTo(0, 0); if (typeof W.resize === 'function') W.resize(); } catch (e) { } } }, t); });
    }, true);
    document.addEventListener('focusin', function () { if (isTyping()) setTimeout(function () { try { W.scrollTo(0, 0); } catch (e) { } }, 50); }, true);
  }
  // ---------- 4. safe area (only when the page sets nothing itself) ----------
  try {
    var sc = W.screen, sw = Math.max(sc.width, sc.height), sh = Math.min(sc.width, sc.height) || 1;
    if (W.__rl_safeb2403 == null && sw / sh >= 2) W.__rl_safeb2403 = 34;
  } catch (e) { }
  // ---------- 3. tidy-ups ----------
  var css = 'html.ios41 #rotate{display:none!important}' +
    'html.ios41 #acct23 .rl41push{display:none!important}';
  function addCss() { var s = document.createElement('style'); s.id = 'ios41css'; s.textContent = css; (document.head || document.documentElement).appendChild(s); }
  addCss();
  function ads() {   // after ads39.js has defined the list
    var A = W.RL_ADS39; if (!A || A.__ios41) return; A.__ios41 = true;
    var fb = [].concat(A.fallback || A.boards || []).filter(function (f) { return !/your-ad/i.test(f); });
    A.fallback = fb.length ? fb : ['ads/bagga-lax.png'];
    A.segments = A.segments || 0;
  }
  function pushBlock(root) {   // acct23's NOTIFICATIONS heading + ENABLE / TEST / TURN OFF + the home-screen help line
    if (!root) return;
    var hs = root.querySelectorAll('h2'); for (var i = 0; i < hs.length; i++) if (/^NOTIFICATIONS$/i.test(hs[i].textContent.trim())) hs[i].classList.add('rl41push');
    ['b23push', 'b23test', 'b23poff', 'n23'].forEach(function (id) { var e = document.getElementById(id); if (e) { e.classList.add('rl41push'); var p = e.parentNode; if (p && p !== root && p.children.length <= 3 && /ON\s/.test(p.textContent)) p.classList.add('rl41push'); } });
  }
  function boot() {
    ads();
    var root = document.getElementById('acct23');
    if (root) { pushBlock(root); new MutationObserver(function () { pushBlock(root); }).observe(root, { childList: true, subtree: true }); }
    else setTimeout(boot, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  R.log.push('ios on, api=' + (R.api || '(same origin)'));
})();
