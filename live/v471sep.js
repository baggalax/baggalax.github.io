/* v471sep.js - V47.1: FRANCHISE TEAM and CAREER CARD are fully separate saves (Bagga Lax 1.2 beta).
 * Charlie (Nov 9 4:51 PM): "Made my franchise coaches name h then went to my career card and it was already named h and started".
 * What the code says: the two modes never share a key (career: rl_car459 / rl_car459fr / rl_car459h / rl_car459cards,
 * franchise: rl_fm460 / rl_fm460fr, the person's Pro Season: rl_fr458), and a career is only ever made by
 * CAR459.create (v459car.js:388), called only from the career create screen's START CAREER (v459caru.js:423).
 * This file makes that a hard rule and repairs a career that was made by mistake next to a franchise:
 *  1. CAR459.create runs only while the CAREER create screen is open (screen 'car459' with its #c9name box);
 *     FM460.create runs only while the FRANCHISE screen is open (screen 'fm460'). Anything else is refused.
 *  2. One-time repair (rl_sep471): a career with 0 games played whose player has the SAME name as the franchise
 *     coach and was made within 2 hours of that franchise is cleared (CAR459.clear: rl_car459 + rl_car459fr only),
 *     so CAREER CARD shows the create screen again. Nothing is lost: 0 games played. The franchise is untouched.
 * No ids, rl_* keys (other than the new rl_sep471 marker), __rl_ flags or net protocol changed.
 * Kill switch: window.__rl_no471sep = true (no guards, no repair).
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__rl_no471sep || Wn.__rl_v124gb) return;
 const S = Wn.SEP471 = { refused: [], repaired: null, err: null };
 const scr = () => { try { return typeof screen === 'string' ? screen : ''; } catch (e) { return ''; } };
 // ---- 1. guards ----
 try {
  const CA = Wn.CAR459;
  if (CA && CA.on && typeof CA.create === 'function' && !CA.create.__s471) {
   const c0 = CA.create;
   const g = function (o) {
    if (!Wn.__rl_no471sep && !(scr() === 'car459' && document.getElementById('c9name'))) {
     S.refused.push('car@' + scr());
     return { ok: false, why: 'OPEN CAREER CARD TO MAKE A PLAYER' };
    }
    return c0.apply(this, arguments);
   };
   g.__s471 = true; CA.create = g;
  }
  const FM = Wn.FM460;
  if (FM && FM.on && typeof FM.create === 'function' && !FM.create.__s471) {
   const f0 = FM.create;
   const g = function (o) {
    if (!Wn.__rl_no471sep && scr() !== 'fm460') {
     S.refused.push('fm@' + scr());
     return { ok: false, why: 'OPEN FRANCHISE TEAM TO MAKE A COACH' };
    }
    return f0.apply(this, arguments);
   };
   g.__s471 = true; FM.create = g;
  }
 } catch (e) { console.warn('v471sep guard', e); S.err = String(e); }
 // ---- 2. one-time repair ----
 function gp(C) {
  let n = 0;
  try {
   n += (C.seasons || []).length;
   const L = C.L;
   if (L) {
    if (L.st && L.st.gp) n += L.st.gp | 0;
    if (L.wk) n += L.wk | 0;
    for (const R of (L.rounds || [])) for (const g of (R && R.games) || (Array.isArray(R) ? R : [])) if (g && g.s) n++;
   }
   if (C.last) n++;
  } catch (e) { n = 99; }
  return n;
 }
 S.gp = gp;
 function repair() {
  const MK = 'rl_sep471';
  try { if (localStorage.getItem(MK)) return null; } catch (e) { return null; }
  const CA = Wn.CAR459, FM = Wn.FM460;
  if (!CA || !CA.on || !FM || !FM.on) return null;
  let C = null, M = null;
  try { C = CA.get(); M = FM.get(); } catch (e) { return null; }
  if (!C || !M) return null; // nothing to compare yet: check again next launch
  const norm = s => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase();
  const same = norm(C.me && C.me.n) && norm(C.me && C.me.n) === norm(M.coach && M.coach.n);
  const near = Math.abs((+C.made || 0) - (+M.made || 0)) < 2 * 3600e3;
  const g = gp(C);
  const res = { same: !!same, near: near, gp: g, name: C.me && C.me.n, reset: false };
  if (same && near && g === 0 && C.stage === 'hs') { CA.clear(); res.reset = true; }
  try { localStorage.setItem(MK, JSON.stringify({ at: Date.now(), reset: res.reset })); } catch (e) {}
  return res;
 }
 try { S.repaired = repair(); } catch (e) { console.warn('v471sep repair', e); S.err = String(e); }
 S.repair = repair;
})();
