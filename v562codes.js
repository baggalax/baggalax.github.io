/* v562codes.js - Bagga Lax 1.3 redeem codes. Loaded BEFORE v549code.js (which asks RL562.take(code) first).
   - every legacy code (USAGOLD, PLANES, JARVISKIT) now reads INVALID CODE
   - BAGGALAX: the Instagram competition code, 200 dimes, ONE use in total (one device ever): goes to the server check
     (v549code.js). The server must register BAGGALAX as 1 use and answer {ok:true, dimes:200, rid:'BAGGALAX'}.
   - FREECLONE: the one-time lost-Cyclone recovery code; goes on to the server check (v549code.js, POST /api/code549/redeem),
     which must have FREECLONE registered as ONE use for item fo_warp (the Cyclone stick)
   Kill switch: window.__rl_no562code. No ids / rl_* keys / protocol change. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no562code || W.RL562) return;
 const norm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
 const LEGACY = new Set([ 'USAGOLD', 'PLANES', 'JARVISKIT' ]);
 const say = (s, col) => {
  try { menuMsg = { s: s, t: 2.6 }; } catch (e) {}
  try { if (W.V17 && V17.toast) V17.toast(s, col || '#ffe14d'); } catch (e) {}
 };
 const sfx = k => { try { if (W.SFX && SFX[k]) SFX[k](); } catch (e) {} };
 const R = W.RL562 = {
  // true = handled here (caller stops); false = not ours
  take: function (raw) {
   const c = norm(raw);
   if (LEGACY.has(c)) { say('INVALID CODE', '#ff7a7a'); sfx('bad'); return true; }
   return false;
  }
 };
})();
