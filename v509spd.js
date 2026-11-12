// ===== BAGGA LAX v509spd.js - BAGGATWAAN SPEED: HARD, NOT A BLUR =====
// Charlie (Nov 11, 7:38 PM, 1.3 web test): "Bagga mode is way to fast" -> "Slow it down".
// Where Bagga's speed came from (game.js DIFF_T, applied by applyDiff into DF): every field player's run speed is
// x DF.spd (spdMul, game.js:5581) and CPU defenders also x DF.dSpd (moveTo, game.js:7265). Per tier
// [SQUID, FISH, BEGINNER, GROSS, NASTY, BAGGATWAAN]: spd [1,1,1,1,1.10,1.25], dSpd [.9,1,1.05,1.09,1.12,1.15].
// Nothing else scales with difficulty: ball / pass / shot speeds, goalie movement and the game clock are the same on
// every tier (the per-tier tables in v448ai slideSpd / v452hard denySpd are slide targets that go through the same
// multipliers). Measured in headless full matches (mean speed of moving field players, field units/s):
//   GROSS 24.1 / 23.1 (our / their), NASTY 26.1 / 26.2, BAGGA 29.3 / 29.7 -> Bagga was ~12-14% faster than Nasty.
// Now: Bagga runs at Nasty pace + ~2% (spd 1.12, dSpd 1.13); its difficulty stays in what made it hard besides speed:
// faster D reactions / slides, 2 checks pop it, more hits, the best goalie, smarter CPU (DIFF_T react, slide, chk, gk ...,
// v448ai, v452hard, v506goalie) - none of those are touched.
// Offline games. Online: only when v512netspd.js has confirmed the opponent's app has it too (V512NS.ok()); otherwise
// online keeps the shared 1.25 / 1.15 so both apps agree. Kill switch: window.__rl_no509spd = true.
(function () {
 'use strict';
 if (typeof window === 'undefined' || typeof applyDiff !== 'function') return;
 // per tier [SQUID, FISH, BEGINNER, GROSS, NASTY, BAGGATWAAN] - only BAGGATWAAN differs from the shipped DIFF_T
 const K = {
  spd:  [ 1, 1, 1, 1, 1.10, 1.12 ],   // was 1.25 on BAGGATWAAN
  dSpd: [ .9, 1, 1.05, 1.09, 1.12, 1.13 ], // was 1.15 on BAGGATWAAN
  info5: '~12% FASTER, 2 CHECKS POP IT, MORE HITS - YOU ARE THE UNDERDOG'
 };
 const LOG = window.V509S = { on: false, K: K, applied: 0, errs: [] };
 const off = () => !!(window.__rl_no509spd || window.__rl_v124gb);
 const online = () => { try { const G = game; return !!(G && (G.online || G.meta && G.meta.online)) || !!(window.RLNET && RLNET.inGame); } catch (e) { return false; } };
 const onlineOld = () => online() && !(window.V512NS && V512NS.ok && V512NS.ok());
 if (off()) return;
 LOG.on = true;
 let info0 = null;
 function fix() {
  try {
   const lv = DF.level;
   if (off() || onlineOld() || lv !== 5) return;
   DF.spd = K.spd[lv];
   DF.dSpd = K.dSpd[lv];
   LOG.applied++;
  } catch (e) { if (LOG.errs.length < 6) LOG.errs.push(String(e && e.message || e)); }
 }
 const A0 = window.applyDiff;
 window.applyDiff = function () {
  const r = A0.apply(this, arguments);
  fix();
  return r;
 };
 // DF is re-read every frame by spdMul / moveTo; re-assert once per frame in case an online->offline switch or
 // another file re-ran the original table (cheap: two property writes on Bagga only).
 const S0 = window.step;
 if (typeof S0 === 'function') window.step = function (dt) {
  try { if (DF.level === 5) { if (onlineOld()) { DF.spd = DIFF_T.spd[5]; DF.dSpd = DIFF_T.dSpd[5]; } else fix(); } } catch (e) {}
  return S0.apply(this, arguments);
 };
 try { info0 = DIFF_INFO[5]; DIFF_INFO[5] = K.info5; } catch (e) {}
 try { fix(); } catch (e) {}
})();
