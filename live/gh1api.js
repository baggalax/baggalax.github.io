// gh1api.js - Bagga Lax on GitHub Pages (https://baggalax.github.io) ONLY.
// GitHub Pages is static, so the game's relative '/api/...' calls would 404 there. This sends them to the real game server,
// https://retrolax.sites.tab.bot, which answers CORS for exactly https://baggalax.github.io (GH1 CORS block in its _worker.js).
// Covers fetch (string, URL, Request; relative '/api...' or absolute same-origin '/api...') and XMLHttpRequest.open.
// The online relay socket (net.js WS_BASE) and minver.json are already absolute URLs, so they need nothing here.
// Does nothing on any other host: retrolax.sites.tab.bot, the beta, localhost and the iPhone app (capacitor://) are untouched.
// Load it in index.html right after <script>window.__rl_ios=true</script> and BEFORE v41ios.js / net.js, so every later
// fetch wrapper sits on top of it. Kill switch: window.__rl_nogh1 = true. Ids, rl_* keys and the net protocol are unchanged.
(function () {
  'use strict';
  var W = window;
  if (W.__rl_nogh1 || location.hostname !== 'baggalax.github.io') return;
  var BASE = 'https://retrolax.sites.tab.bot';
  var isApi = function (p) { return p === '/api' || p.indexOf('/api/') === 0 || p.indexOf('/api?') === 0; };
  // returns the rewritten absolute URL, or null when the URL is not one of our own /api calls
  var fix = function (u) {
    try {
      if (u == null) return null;
      var s = String(u);
      if (s.charAt(0) === '/' && s.charAt(1) !== '/') return isApi(s) ? BASE + s : null;
      var a = new URL(s, location.href);
      if (a.origin === location.origin && isApi(a.pathname)) return BASE + a.pathname + a.search;
    } catch (e) { }
    return null;
  };
  var F0 = W.fetch;
  if (typeof F0 === 'function') {
    W.fetch = function (input, init) {
      try {
        if (typeof input === 'string' || (typeof URL !== 'undefined' && input instanceof URL)) {
          var f = fix(input); if (f) input = f;
        } else if (input && typeof input.url === 'string') {
          var g = fix(input.url); if (g) input = new Request(g, input);
        }
      } catch (e) { }
      return F0.call(this, input, init);
    };
    W.fetch.__rlgh1 = true;
  }
  var XO = W.XMLHttpRequest && W.XMLHttpRequest.prototype.open;
  if (XO) {
    W.XMLHttpRequest.prototype.open = function (m, u) {
      var a = Array.prototype.slice.call(arguments);
      try { var f = fix(u); if (f) a[1] = f; } catch (e) { }
      return XO.apply(this, a);
    };
  }
  W.RLGH1 = { base: BASE, fix: fix };
})();
