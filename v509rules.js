// ===== BAGGA LAX v509rules.js - FOUL-OUT RULE MATCHES REAL LACROSSE =====
// Charlie (Nov 11, 7:39 PM): "Also check to make sure all rules follow real lacrosse rules."
// Audit result (full table in the 1.3 rules report): almost every rule the game calls matches NCAA / NFHS men's field
// lacrosse in spirit (time-based counts are scaled to the shorter arcade quarters). The one clearly wrong, cheap fix:
//  FOUL-OUT. The game ejected a player after ANY 3 penalties (game.js penCountUp: G.pf >= 3), technicals included.
//  Real rule: NCAA Rule 5 - "Any player who accumulates five minutes of personal fouls shall be disqualified from the
//  game" (NFHS: five personal fouls); technical fouls (pushing, holding, interference, offsides, illegal pick...) never
//  count toward it. Now: only PERSONAL fouls count (slashing, illegal body check, cross check, tripping, unnecessary
//  roughness, unsportsmanlike, illegal crosse) and the 5th one fouls him out ("FOULED OUT", a sub takes his spot, his
//  team still serves the penalty - same flow as the old ejection). Techs still put you man-down exactly as before.
// Offline games only (online keeps the shared 1.3 count so both clients agree). Kill switch: window.__rl_no509rules = true.
(function () {
 'use strict';
 if (typeof window === 'undefined' || typeof penCountUp !== 'function' || typeof foulCall !== 'function') return;
 const K = { foulOut: 5, personal: /SLASHING|ILLEGAL BODY CHECK|CROSS CHECK|TRIPPING|UNNECESSARY ROUGHNESS|UNSPORTSMANLIKE|ILLEGAL CROSSE/ };
 const LOG = window.V509R = { on: false, K: K, counted: 0, techSkipped: 0, fouledOut: 0, errs: [] };
 const off = () => !!(window.__rl_no509rules || window.__rl_v124gb);
 const netIn = () => { try { return !!(window.RLNET && RLNET.inGame); } catch (e) { return false; } };
 const on = () => { try { const G = game; return !off() && !!G && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !netIn(); } catch (e) { return false; } };
 const err = (w, e) => { if (LOG.errs.length < 6) LOG.errs.push(w + ': ' + String(e && e.message || e).slice(0, 160)); };
 if (off()) return;
 LOG.on = true;
 let fouledOut = 0;   // set by our penCountUp on a 5th personal foul; the game's next EJECTED banner is renamed
 const lastLabel = G => { const L = G && G.foulLog; return L && L.length ? String(L[L.length - 1].foul || '') : ''; };
 const fix = (txt, sub) => {
  if (!fouledOut || txt !== 'EJECTED') return null;
  fouledOut = 0;
  return [ 'FOULED OUT', String(sub || '').replace('3RD PENALTY', '5TH PERSONAL FOUL').replace('3 PENALTIES', '5 PERSONAL FOULS') ];
 };
 for (const nm of [ 'endPossession', 'dEnd', 'ruleBanner' ]) {
  const f0 = window[nm];
  if (typeof f0 !== 'function') continue;
  window[nm] = function (kind, txt, sub) {
   try { const r = on() ? fix(txt, sub) : null; if (r) { const a = Array.prototype.slice.call(arguments); a[1] = r[0]; a[2] = r[1]; return f0.apply(this, a); } } catch (e) { err(nm, e); }
   return f0.apply(this, arguments);
  };
 }
 const PC0 = window.penCountUp;
 window.penCountUp = function (whoP, side) {
  if (!on()) return PC0.apply(this, arguments);
  try {
   const G = game, pl = whoP && whoP.pl;
   if (!G || !pl) return PC0.apply(this, arguments);
   const label = lastLabel(G);                        // foulCall logs the foul (foulLog) right before it counts it
   if (!K.personal.test(label)) { LOG.techSkipped++; return false; }   // technicals never count toward fouling out
   const fk = G.dup2504 && G.dup2504.includes(pl.id) ? side + '|' + pl.id : pl.id;
   G.pf509 = G.pf509 || {};
   const n = G.pf509[fk] = (G.pf509[fk] || 0) + 1;
   LOG.counted++;
   G.pf = G.pf || {};
   G.pf[fk] = n >= K.foulOut ? 2 : 0;            // the game's own count trips (>= 3) only on the 5th personal foul
   const r = PC0.apply(this, arguments);
   if (r) {
    fouledOut = 1; LOG.fouledOut++;
    if (G.ejBanner) { G.ejBanner.txt = 'FOULED OUT'; G.ejBanner.sub = lastName(pl) + ' IS DONE - 5 PERSONAL FOULS'; }
   }
   return r;
  } catch (e) { err('count', e); return PC0.apply(this, arguments); }
 };
 try {
  const i = TUT_PEN.findIndex(s => /3 PENALTIES/.test(s));
  if (i >= 0) TUT_PEN[i] = '5 PERSONAL FOULS IN ONE GAME = FOULED OUT - A SUB GOES IN.';
 } catch (e) { err('tut', e); }
})();
