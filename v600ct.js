// ===== BAGGA LAX v600ct.js - 1.5 B72: MAKE A CARD TEAM -> TEAMS + RATINGS; UNNAMED CUSTOM CARDS COUNT =====
// 1) Bug: Locker League's "MAKE A CARD TEAM" opened the QUICK MATCH page. Now it opens TEAMS + RATINGS with the card-team
//    builder (V33 'ADD CARD TEAM'); SAVE or BACK returns to the Locker League lobby you came from.
// 2) Unnamed custom cards (C30 'nn' slots) now count as cards everywhere (c30.js / v33.js / v332.js, flag __rl_no600cu)
//    with a default name ('CUSTOM 347', from the card's own seed, the same on every phone, so v600opp needs no def).
//    Naming one later changes its id (C30.create moves the card to the named id), so this file follows that rename in
//    every card team (V33) - the team keeps the card. No new cards are made and nothing new can be sold.
// Kill switch: window.__rl_no600ct (redirect + rename follow; the counting has its own __rl_no600cu)
(function () {
 'use strict';
 const Wn = window;
 const off = () => !!Wn.__rl_no600ct;
 const LOG = Wn.__ct600log = { opens: 0, back: 0, remap: [] };
 const S = { ret: null };
 // B72: the STARTER GIFT (v598new: 10 custom cards + 1 BASIC coach card, needed to save a card team) opens on the menu; a
 // player who goes straight to the Locker League (e.g. before the first cloud sync) could tap MAKE A CARD TEAM without it.
 // Then the gift opens first (its normal pack reveal) and the builder opens when the reveal is closed.
 let giftWait = null;
 function giftFirst(from) {
  try { const G = Wn.WT598; if (Wn.__rl_no72gift || !G || !G.giftClaimed || G.giftClaimed() || !G.giveGift) return false;
   try { if (Wn.RK15LL && RK15LL.close && screen === 'gear17') RK15LL.close(); } catch (e) {}
   try { GEAR17 = null; } catch (e) {} screen = 'menu';
   if (!G.giveGift()) return false;
   LOG.gift = (LOG.gift | 0) + 1; giftWait = { from: from, t: Date.now() };
   const iv = setInterval(() => { try { if (!giftWait) { clearInterval(iv); return; } if (screen !== 'pack17' && Date.now() - giftWait.t > 800) { const f = giftWait.from; giftWait = null; clearInterval(iv); make(f); } else if (Date.now() - giftWait.t > 10 * 60e3) { giftWait = null; clearInterval(iv); } } catch (e) {} }, 300);
   return true;
  } catch (e) { return false; }
 }
 function make(from) {
  if (off() || !Wn.V33 || !V33.open) return false;
  if (giftFirst(from)) return true;
  try { if (Wn.RK15LL && RK15LL.close && screen === 'gear17') RK15LL.close(); } catch (e) {}
  try { GEAR17 = null; } catch (e) {}
  try { menuSel.mode = 'browse'; } catch (e) {}
  screen = 'pickTeam';
  S.ret = from || null; LOG.opens++;
  V33.open('pro', null); // E.back = 'pickTeam' (TEAMS + RATINGS)
  return true;
 }
 function goBack() {
  const r = S.ret; S.ret = null;
  if (r === 'll') { try { screen = 'menu'; RK15LL.open(); LOG.back++; } catch (e) {} }
 }
 const wrap = (k, after) => { const o = typeof PANEL_ACT === 'object' && PANEL_ACT[k]; if (typeof o !== 'function' || o.__ct600) return; const f = function () { const r = o.apply(this, arguments); try { if (!off() && S.ret) after(); } catch (e) {} return r; }; f.__ct600 = 1; PANEL_ACT[k] = f; };
 // SAVE: only when it really saved (the editor closed); BACK: always
 const hook = () => { wrap('ct33save', () => { if (screen !== 'ct33') goBack(); }); wrap('ct33back', goBack); };
 hook(); setInterval(hook, 1000);
 Wn.CT600 = { make: make, S: S };
 // ---- follow a custom card's rename (unnamed 'nn' id -> named id) inside every card team ----
 const PFXLEN = 13; // 'CU30-' + seed(5) + copy + rar + pos
 function sweep() {
  if (off() || !Wn.V33 || !Wn.V22 || !V22.on || !V22.on() || !Wn.C30) return;
  let C; try { C = V22.st().cards || {}; } catch (e) { return; }
  let ch = false;
  for (const t of V33.all()) {
   if (!t || !Array.isArray(t.ids)) continue;
   t.ids = t.ids.map(id => {
    if (typeof id !== 'string' || !/^CU30-/.test(id) || C[id]) return id;
    const d = C30.parse(id); if (!d || d.made) return id;
    const nid = Object.keys(C).find(k => k.slice(0, PFXLEN) === id.slice(0, PFXLEN) && k !== id);
    if (!nid) return id;
    ch = true; LOG.remap.push([ id, nid ]); return nid;
   });
  }
  if (ch) { try { V33.save(); V33.regAll(); } catch (e) {} }
 }
 setInterval(sweep, 1500);
 // ---- 3) B72 HIGH: your card team must never carry the opponent's name ----
 // Cause (net.js alias72): card team ids are per-phone slot ids, so two players' first card teams share 'SZ0P11'; the
 // opponent's team was registered over yours. net.js now keeps the opponent in a remote-only copy; this part repairs what
 // the bug already did: the live entries (SZ_REG) are rebuilt from your own saved teams when they differ, and a saved name
 // that equals a recent opponent's team name goes back to the name you gave it (kept in 'bl72_ctnm' from now on).
 // Kill switch: window.__rl_no72rep
 const offR = () => !!Wn.__rl_no72rep, KN = 'bl72_ctnm', KO = 'bl72_opp';
 const ls = (k, d) => { try { const v = LS.get(k, d); return v == null ? d : v; } catch (e) { return d; } };
 const cn = s => { try { return V33.cleanName(s); } catch (e) { return String(s || '').toUpperCase(); } };
 Wn.__ct72log = { fix: [], live: 0 };
 function remember() { // the names the player gave (only ones that are not an opponent's)
  const bk = ls(KN, {}), opp = new Set(ls(KO, [])); let ch = false;
  for (const t of V33.all()) if (t && t.name && bk[t.id] !== t.name && !opp.has(cn(t.name))) { bk[t.id] = t.name; ch = true; }
  if (ch) try { LS.set(KN, bk); } catch (e) {}
 }
 function oppSeen() { // the opponent's team names in a lobby / match (the payload names + their EDIT NAMES team name)
  try {
   const N = Wn.RLNET; if (!N || !N.code || !N.side) return;
   const st = (N.inGame ? N.st : N.lobby && N.lobby.state) || {}, o = N.side === 'h' ? 'g' : 'h', d = st[o + 'szn'];
   const ns = [ d && d.name, d && d.nm33 && d.nm33.t ].filter(Boolean).map(cn);
   if (!ns.length) return;
   const mine = new Set(V33.all().map(t => cn(t.name))), L = ls(KO, []);
   let ch = false; for (const n of ns) if (!L.includes(n) && !mine.has(n)) { L.push(n); ch = true; }
   if (ch) try { LS.set(KO, L.slice(-8)); } catch (e) {}
  } catch (e) {}
 }
 function repair() {
  if (offR() || !Wn.V33 || !V33.all) return;
  const N = Wn.RLNET, live = !!(N && N.inGame);
  oppSeen();
  const bk = ls(KN, {}), opp = new Set(ls(KO, [])); let ch = false;
  for (const t of V33.all()) {
   if (t && opp.has(cn(t.name)) && bk[t.id] && bk[t.id] !== t.name) { Wn.__ct72log.fix.push([ t.id, t.name, bk[t.id] ]); t.name = bk[t.id]; ch = true; }
  }
  if (ch) try { V33.save(); } catch (e) {}
  remember();
  if (live) return; // the match is using the entries: fix them after it
  let bad = ch;
  for (const t of V33.all()) { const r = typeof SZ_REG !== 'undefined' && SZ_REG[t.id]; if (r && (r.rem72 || r._raw || r.ct33 == null || r.name !== (cn(t.name) || 'CARD TEAM'))) bad = true; }
  if (bad) { Wn.__ct72log.live++; try { V33.regAll(); } catch (e) {} }
 }
 setTimeout(repair, 1200); setInterval(repair, 3000);
 Wn.CT600.repair = repair;
})();
