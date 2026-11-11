/* v456ult.js - V45.6: ULTIMATE + CARD TEAMS fix, and the YARD SALE name (Bagga Lax 1.1).
 * Charlie (Nov 8 4:38 PM): "Yes fix that". Bug: PLAY > ULTIMATE, INCLUDE CARD TEAMS? = NO (the default), CARD TEAMS tab,
 * tap your card team -> the tournament was built WITHOUT your team and opened already over, another team champion.
 * Root cause: college25.js newUlt2501() only puts a card team in the field through V33.eff('ult'). With INCLUDE = NO the card
 * teams are not in eff, so v35u.js lets the tap through with a one-shot ARMED id that its V33.eff wrapper adds once. But the
 * difficulty (ask2503) and ask333 dialogs redraw the pick screen first, V33.domRows() calls V33.eff('ult') on that redraw and
 * spends ARMED, so newUlt2501() then builds the field from allTeams() (no card teams). uRest() sees no game for your team and
 * sims the whole bracket at once: phase 'done', champ = someone else.
 * Fix:
 *  1. Tapping a card team on the ULTIMATE pick screen turns INCLUDE CARD TEAMS to YES first (V33.setInc), and turns that
 *     card team back on if it had been unticked, so the normal V33 path puts it in the field. A short note says so.
 *  2. Guard: until the new Ultimate is made, V33.eff('ult') always carries the tapped card team (not one-shot), and right after
 *     it is made (qt26 hook, then the ask2503 callback as a second net) a bracket WITHOUT your team is never kept: it is rebuilt
 *     with your team; if that still fails your team takes the lowest seed's spot. No tournament opens already over.
 *  3. YARD SALE: the home tile already draws YARD SALE (v40home SHOP_LABEL + v39cur), but VoiceOver labels still said
 *     STRING SHOP. aria-label text "STRING SHOP" now reads "YARD SALE". Internal hit labels/keys are untouched (the menu
 *     tour finds the tile by them).
 * Saved games: an Ultimate already in progress is never touched (only one created by this tap is checked).
 * Kill switch: window.__rl_no456ult = true. No new storage keys, no net protocol touched.
 */
(function () {
 'use strict';
 const W = window;
 const off = () => !!(W.__rl_no456ult || W.__rl_v124gb);
 const LOG = W.V456U = { log: [], fixes: [] };
 const lg = m => { try { LOG.log.push(m); if (LOG.log.length > 60) LOG.log.shift(); } catch (e) {} };
 const C = () => W.COL25 || null;
 const V = () => W.V33 || null;
 const inUPick = () => { try { return typeof screen !== 'undefined' && screen === 'col25' && C() && C().view() === 'upick'; } catch (e) { return false; } };
 let WANT = null, SNAP = null;
 function ctOk(id) {
  try { const u = V().universe('ult'); return u.ct.includes(id) && !u.ctBad[id]; } catch (e) { return false; }
 }
 // 1. the tap: INCLUDE CARD TEAMS -> YES
 document.addEventListener('click', ev => {
  try {
   if (off() || !inUPick() || !V()) return;
   const t = ev.target && ev.target.closest ? ev.target.closest('#col25 .tm[data-tid]') : null;
   const id = t ? t.getAttribute('data-tid') : null;
   if (!id) return;
   const st = C().st();
   SNAP = { un: st.un || 0, ult: st.ult || null, at: Date.now() };
   if (!ctOk(id)) { WANT = null; return; }
   WANT = id;
   let msg = '';
   if (V().onInc && V().onInc() && !V().sel('ult').inc) {
    V().setInc('ult', true);
    msg = 'INCLUDE CARD TEAMS SET TO YES - YOUR CARD TEAM PLAYS IN IT';
    lg('inc->yes ' + id);
   }
   if (V().incOn && V().incOn('ult') && !V().eff('ult').ct.includes(id) && V().toggle) {
    V().toggle('ult', id);
    lg('ct on ' + id);
   }
   if (msg) { V().msg33 = V().msg33 || {}; V().msg33.ult = msg; }
  } catch (e) { try { console.warn('v456ult click', e && e.message); } catch (x) {} }
 }, true);
 // 2a. eff('ult') keeps the tapped card team until the Ultimate is made (v35u's ARMED is one-shot and redraws spend it)
 function hookEff() {
  const v = V();
  if (!v || v.__v456 || typeof v.eff !== 'function') return !!(v && v.__v456);
  v.__v456 = true;
  const EF0 = v.eff;
  v.eff = function (kind) {
   const e = EF0.apply(this, arguments);
   try {
    if (off() || kind !== 'ult' || !WANT || !e || !Array.isArray(e.ids) || e.ids.includes(WANT) || !ctOk(WANT)) return e;
    if (SNAP && Date.now() - SNAP.at > 10 * 60 * 1000) { WANT = null; return e; }
    const ids = e.ids.concat([ WANT ]);
    return Object.assign({}, e, { ids: ids, ct: (e.ct || []).concat([ WANT ]), custom: true, n: ids.length, ok: ids.length >= (v.MIN || 5) });
   } catch (x) { return e; }
  };
  return true;
 }
 // 2b. never keep a fresh bracket that leaves the user's team out
 function fresh(U) {
  return !!(U && SNAP && U !== SNAP.ult && U.n === (SNAP.un || 0) + 1);
 }
 function swapIn(U) {
  // last resort: the user's team takes the lowest seed's place (field size + bracket shape unchanged)
  const f = U.field, out = f[f.length - 1];
  if (!out || out === U.team) return false;
  f[f.length - 1] = U.team;
  for (const R of U.br.rounds) for (const g of R.games) { if (g.a === out) g.a = U.team; if (g.b === out) g.b = U.team; }
  lg('swap ' + out + '->' + U.team);
  return true;
 }
 function repair(stage) {
  try {
   if (off() || !C() || !SNAP) return;
   const st = C().st(), U = st.ult;
   if (!fresh(U) || !U.team || !Array.isArray(U.field) || U.field.includes(U.team)) return;
   const team = U.team, diff = U.diff2503;
   lg('repair ' + stage + ' ' + team + ' phase=' + U.phase);
   const keepWant = WANT;
   WANT = team;
   if (V() && V().onInc && V().onInc() && !V().sel('ult').inc && ctOk(team)) V().setInc('ult', true);
   st.un = SNAP.un || 0;
   let N = null;
   try { N = C().newUlt(team); } catch (e) { console.warn('v456ult rebuild', e && e.message); }
   N = C().st().ult;
   if (!N || N.team !== team) { st.ult = U; N = U; st.un = (SNAP.un || 0) + 1; }
   if (!N.field.includes(team)) {
    // rebuild did not take: put the team into the original fresh bracket from scratch
    if (N.phase !== 'ko' || N.br.r > 0 || N.champ) { st.un = SNAP.un || 0; try { C().newUlt(team); } catch (e) {} N = C().st().ult; }
    swapIn(N);
   }
   if (diff != null) N.diff2503 = diff;
   if (stage === 'after') { try { C().uRest(N); } catch (e) { console.warn('v456ult uRest', e && e.message); } }
   C().save();
   LOG.fixes.push([ stage, team, N.field.includes(team), N.phase ]);
   WANT = keepWant;
  } catch (e) { try { console.warn('v456ult repair', e && e.message); } catch (x) {} }
 }
 function hookQt() {
  const q = W.qt26;
  if (typeof q !== 'function' || q.__v456) return;
  const f = function (id) {
   try { if (!off() && SNAP && inUPick()) repair('qt26'); } catch (e) {}
   return q.apply(this, arguments);
  };
  f.__v456 = true;
  W.qt26 = f;
 }
 function hookAsk() {
  const a = W.ask2503;
  if (typeof a !== 'function' || a.__v456) return;
  const f = function (kind, go) {
   if (kind !== 'ult' || typeof go !== 'function' || off()) return a.apply(this, arguments);
   const go2 = function () {
    const r = go.apply(this, arguments);
    try { repair('after'); } catch (e) {}
    WANT = null;
    return r;
   };
   return a.call(this, kind, go2);
  };
  f.__v456 = true;
  W.ask2503 = f;
 }
 // the no-dialog path (difficulty picker off): check on the next frame after the tap
 document.addEventListener('click', () => {
  if (off() || !SNAP) return;
  setTimeout(() => { try { if (C() && C().view() === 'uhub') { repair('after'); WANT = null; } } catch (e) {} }, 0);
 }, false);
 // 3. YARD SALE in accessibility labels
 const RX = /STRING SHOP/g, RXI = /string shop/gi;
 const ys = s => s.replace(RXI, m => m === m.toUpperCase() ? 'YARD SALE' : 'Yard Sale');
 const onYs = () => !off() && !W.__rl_no39ys;
 try {
  const sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
   if (n === 'aria-label' && typeof v === 'string' && RXI.test(v) && onYs()) { RXI.lastIndex = 0; v = ys(v); }
   RXI.lastIndex = 0;
   return sa.call(this, n, v);
  };
  const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (d && d.set) Object.defineProperty(Element.prototype, 'innerHTML', {
   configurable: true, enumerable: d.enumerable, get: d.get,
   set: function (h) {
    if (typeof h === 'string' && h.indexOf('aria-label="STRING SHOP') >= 0 && onYs()) h = h.replace(/aria-label="STRING SHOP/g, 'aria-label="YARD SALE');
    return d.set.call(this, h);
   }
  });
  // labels already on the page
  const fix = () => { try { if (!onYs()) return; for (const e of document.querySelectorAll('[aria-label]')) { const v = e.getAttribute('aria-label'); if (v && /string shop/i.test(v)) e.setAttribute('aria-label', v); } } catch (e) {} };
  fix(); W.addEventListener('load', fix);
 } catch (e) { console.warn('v456ult ys', e && e.message); }
 let tries = 0;
 const boot = () => { hookEff(); hookQt(); hookAsk(); if ((!V() || !V().__v456 || !(W.qt26 && W.qt26.__v456) || !(W.ask2503 && W.ask2503.__v456)) && tries++ < 40) setTimeout(boot, 250); };
 boot();
})();
