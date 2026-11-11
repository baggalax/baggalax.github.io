// 40.0.7 APP LOBBY MUSIC FIX (v406m.js) - iPhone app only (window.__rl_ios); the website is untouched.
// Why the app's music was silent while taps/sfx played: inside the app the game is served by Capacitor's capacitor://localhost file
// handler, which answers media files (.m4a/.mp3/...) with a plain, status-less response (URLResponse, not HTTPURLResponse), so
// fetch() hands back status 0 / ok=false. v4013mus.js checks r.ok, so every load "failed" (HTTP 0) and after 3 tries it gave up for
// good; audio12.js (voices/crowd) never checks r.ok, so it decoded the same kind of response fine, and the tap clicks are synthesized.
// Fix: (1) a status-0 same-origin media response gets re-wrapped as a normal 200 response with the same bytes; (2) if the music load
// had already given up, each real tap allows one more try (at most 8 extra). Kill switch: window.__rl_no406m. Off under FISH.
// Sound only: no game state, no RNG, no save key, no protocol change.
(function () {
  'use strict';
  var W = window;
  if (W.__rl_no406m || W.__rl_v124gb || !W.__rl_ios) { W.V406M = { on: false }; return; }
  var MEDIA = /\.(m4a|mp3|aac|wav|mp4|caf)(?:[?#]|$)/i, R = W.V406M = { on: true, fixed: 0, retries: 0, why: '' };
  var F0 = W.fetch;
  if (typeof F0 === 'function') {
    W.fetch = function (input, init) {
      var p = F0.apply(this, arguments), url = '';
      try { url = typeof input === 'string' ? input : (input && input.url) || String(input || ''); } catch (e) { }
      if (!url || !MEDIA.test(url) || !p || !p.then) return p;
      var same = true;
      try { same = new URL(url, location.href).origin === location.origin; } catch (e) { }
      if (!same) return p;
      return p.then(function (r) {
        if (!r || r.status !== 0 || r.type === 'opaque' || r.type === 'error') return r;
        var ct = 'application/octet-stream';
        try { ct = r.headers.get('Content-Type') || ct; } catch (e) { }
        return r.arrayBuffer().then(function (ab) {
          if (!ab || !ab.byteLength) { R.why = 'empty ' + url; return new Response(null, { status: 404 }); }
          R.fixed++;
          return new Response(ab, { status: 200, headers: { 'Content-Type': ct } });
        });
      });
    };
  }
  var retry = function (e) {
    if (e && e.isTrusted === false) return;
    try {
      var V = W.V4013MUS, M = V && V.M;
      if (!M || M.buf || M.loading || !(M.failed > 2) || R.retries >= 8) return;
      R.retries++; M.failed = 2; M.tapped = true;
      setTimeout(function () { try { V.frame(); } catch (x) { } }, 0);
    } catch (x) { }
  };
  ['touchend', 'click', 'pointerup', 'keydown'].forEach(function (ev) { W.addEventListener(ev, retry, true); });
})();
