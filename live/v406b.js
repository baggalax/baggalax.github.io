/* V40.0.6b - (B) Playbook PLAYS no longer lists set names (OPEN, 2-2-2) or BLACK - those are the bottom-right
   SET + D buttons. (C) Tutorial: two steps that teach the bottom-right SET and D buttons.
   Kill switch: window.__rl_no406b = true -> behaves exactly like before. */
(function () {
 'use strict';
 if (window.__rl_v406b_loaded) return;
 window.__rl_v406b_loaded = 1;
 const off = () => !!window.__rl_no406b || !!window.__rl_v124gb;
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const LOG = { removed: [], tut: [], errs: [] };
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.error(e); } catch (x) {} };
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function () { return f.call(this, o, arguments); };
  return true;
 };
 if (off()) { window.V406B = { on: false, LOG: LOG }; return; }

 /* ---------------- (B) playbook: no set names / BLACK in PLAYS ---------------- */
 try {
  if (typeof PM_BUILTIN !== 'undefined' && Array.isArray(PM_BUILTIN)) {
   const setNames = new Set([].concat(typeof USER_SETS !== 'undefined' ? USER_SETS : [], typeof SET_NAMES !== 'undefined' ? SET_NAMES : [], typeof SETS !== 'undefined' ? Object.keys(SETS) : []));
   for (let i = PM_BUILTIN.length - 1; i >= 0; i--) {
    const p = PM_BUILTIN[i];
    if (!p || !p.builtin) continue;
    if ((p.cat === 'OFFENSE' && setNames.has(p.name)) || (p.cat === 'D' && p.dcall)) { LOG.removed.push(p.name); PM_BUILTIN.splice(i, 1); }
   }
  }
 } catch (e) { err(e, 'pb'); }
 // a saved pick of a removed play falls back to NO PLAYS (playById -> null)
 wrapG('drawPlaybookBtn', function (o, a) {
  try { const G = G0(); if (G && G.playSel && typeof playById === 'function' && !playById(G.playSel)) G.playSel = null; } catch (e) {}
  return o.apply(this, a);
 });

 /* ---------------- (C) tutorial: bottom-right SET + D buttons ---------------- */
 const okTut = typeof TUTX !== 'undefined' && typeof TUT_MAIN_181 !== 'undefined' && typeof tutDone === 'function' && typeof tutSetup === 'function' && !window.__rl_no406bt;
 const TSB = okTut ? TUTX.length : -99, TDB = okTut ? TUTX.length + 1 : -99;
 const X = { oT: '2-2-2', dT: 'black', prevO: null, prevD: null, prevDP: null };
 function btnXY(which) {
  const cx = W / 2, y = H - 11 - (typeof sa2403Dy === 'function' ? sa2403Dy(H - 11, 11) : 0);
  if (which === 'o') return [ Math.round(cx + 12 + 15), y + 5 ];
  const G = G0(), lab = G && typeof dsetLabel === 'function' ? dsetLabel(G) : 'MAN', w = Math.max(26, textW(lab) + 4);
  return [ Math.round(cx + 45 + w / 2), y + 5 ];
 }
 function mine() {
  const G = G0(), Tt = G && G.tutorial;
  if (!okTut || off() || !Tt || Tt.complete || (Tt.track || 'main') !== 'main') return 0;
  return Tt.step === TSB || Tt.step === TDB ? Tt.step : 0;
 }
 if (okTut) {
  TUTX.push([ 'SET BUTTON', 'THE SET BUTTON (BOTTOM) IS YOUR OFFENSE SET. TAP IT TILL IT SAYS ' + X.oT + '.' ],
   [ 'D BUTTON', 'THE D BUTTON (BOTTOM) PICKS YOUR D. TAP IT TILL BLACK = EVERYONE LOCKS OFF.' ]);
  const cache = new Map();
  wrapG('tutList', function (o, a) {
   const L = o.apply(this, a);
   if (off() || !Array.isArray(L)) return L;
   const G = G0(), tr = G && G.tutorial && G.tutorial.track || 'main';
   if (tr !== 'main' || L.includes(TSB)) return L;
   let M = cache.get(L);
   if (!M) {
    M = L.slice();
    let at = M.indexOf(11);
    if (at < 0) at = M.indexOf(10);
    at = at < 0 ? Math.max(0, M.length - 1) : at + 1;
    M.splice(at, 0, TSB, TDB);
    cache.set(L, M);
   }
   return M;
  });
  wrapG('tutDone', function (o, a) {
   const i = a[0], G = G0();
   if (!off() && (i === TSB || i === TDB)) {
    if (!G || screen !== 'live' && screen !== 'cpu') return false;
    return i === TSB ? G.oset === X.oT : G.dset === X.dT;
   }
   return o.apply(this, a);
  });
  wrapG('tutSetup', function (o, a) {
   const r = o.apply(this, a);
   try {
    const s = mine(), G = G0();
    if (typeof LS !== 'undefined') {
     // the tutorial's taps must not change the player's saved SET / D for real games
     if (X.prevO != null && s !== TSB) { LS.set('oset', X.prevO); X.prevO = null; }
     if (X.prevD != null && s !== TDB) { LS.set('dset', X.prevD); if (X.prevDP != null) LS.set('dplay', X.prevDP); X.prevD = X.prevDP = null; }
     if (s === TSB && X.prevO == null) X.prevO = LS.get('oset', G.oset || '3-3');
     if (s === TDB && X.prevD == null) { X.prevD = LS.get('dset', 'man'); X.prevDP = LS.get('dplay', null); }
    }
    if (s) {
     if (s === TSB) X.oT = G.oset === '2-2-2' ? '1-4-1' : '2-2-2';
     if (s === TDB) X.dT = G.dset === 'black' ? 'zone' : 'black';
     TUTX[TSB][1] = 'THE SET BUTTON (BOTTOM) IS YOUR OFFENSE SET. TAP IT TILL IT SAYS ' + X.oT + '.';
     TUTX[TDB][1] = X.dT === 'black' ? 'THE D BUTTON (BOTTOM) PICKS YOUR D. TAP IT TILL BLACK = EVERYONE LOCKS OFF.' : 'THE D BUTTON (BOTTOM) PICKS YOUR D. TAP IT TILL IT SAYS ZONE.';
     if (typeof setupPossession === 'function') { setupPossession(GX - 110, CY); G.run = null; }
     LOG.tut.push(s);
    }
   } catch (e) { err(e, 'tutSetup'); }
   return r;
  });
  // the game hides the bottom-right buttons during the tutorial; show them on these two steps
  wrapG('drawGameButtons', function (o, a) {
   const G = G0();
   if (!mine() || !G) return o.apply(this, a);
   const T0 = G.tutorial;
   try { G.tutorial = null; return o.apply(this, a); } finally { G.tutorial = T0; }
  });
  wrapG('drawTutorial', function (o, a) {
   const r = o.apply(this, a);
   try {
    const s = mine(), G = G0();
    if (s && G.tutorial.doneT <= 0 && screen === 'live') {
     const [x, y] = btnXY(s === TSB ? 'o' : 'd'), lab = s === TSB ? 'TAP: SET' : 'TAP: D';
     // pulsing box around the real button (the hand comes from the tutorial's hand layer)
     const t = performance.now() / 1e3, pul = (Math.sin(t * 6) + 1) / 2;
     const w = s === TSB ? 30 : Math.max(26, textW(typeof dsetLabel === 'function' ? dsetLabel(G) : 'MAN') + 4), bx = s === TSB ? Math.round(W / 2 + 12) : Math.round(W / 2 + 45), by = y - 5;
     g.save(); g.globalAlpha = .55 + .45 * pul; g.strokeStyle = '#ffe14d'; g.lineWidth = 1;
     g.strokeRect(bx - 1.5, by - 1.5, w + 3, 13); g.restore();
     const tw = textW(lab) + 4, lx = Math.min(W - tw - 2, Math.round(x - tw / 2)), ly = by - 11;
     rect(lx, ly, tw, 8, 'rgba(0,0,0,.65)'); text(lab, lx + 2, ly + 1, 1, '#ffe14d');
    }
   } catch (e) { err(e, 'draw'); }
   return r;
  });
 }
 window.V406B = {
  on: true, LOG: LOG, X: X, TSB: TSB, TDB: TDB, mine: mine,
  // for the tutorial hand layer (v4012tut.js): where to tap on these steps
  hand: function () { const s = mine(); if (!s) return null; const q = btnXY(s === TSB ? 'o' : 'd'); return { x: q[0], y: q[1], label: s === TSB ? 'TAP TILL ' + X.oT : 'TAP TILL ' + X.dT.toUpperCase() }; }
 };
})();
