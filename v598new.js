/* v598new.js - Bagga Lax 1.5f (Charlie approved Bee's council version): STARTER GIFT, WELCOME TUTORIAL, COACH CARDS IN PACKS.
 *
 * 1. STARTER GIFT - once per ACCOUNT (rl_gift598, rides in the cloud save) AND once per DEVICE (rlx_gift598, not an rl_ key,
 *    so it survives sign-out / new accounts on this phone). Given only when BOTH say unclaimed: 10 random BASIC (common)
 *    custom player cards (C30) + 1 random BASIC coach card, shown with the normal pack reveal (a free 'gift598' pack).
 *    Signed in but not yet synced with the cloud = wait (no double gift on a second phone).
 *    Limit: a full app delete wipes the device flag too (iOS clears app storage); the account flag still blocks it on that account.
 * 2. WELCOME TUTORIAL - SHOW-ONLY (Charlie): a DOM spotlight over the real buttons, an arrow and a short tip, with
 *    BACK / NEXT / SKIP on every step. It only moves between screens to show things; it never taps, buys, sells, equips
 *    or saves anything, and it never waits for the player to do something. Three parts (8 steps or fewer each):
 *    A WHAT'S NEW, B ONLINE, C MAKING A CARD TEAM. SKIP (or the last NEXT) marks it done: rl_wt598 (once per account).
 *    Opening Locker League with no card team shows part C on Teams + Ratings (once, rl_wt598.c).
 *    No account on ONLINE: the FIND MATCH tip says a free account is needed (no forced detour: show-only, never stuck).
 * 3. COACH CARDS IN PACKS - card packs can now drop a BASIC or RARE head coach card at a modest rate. LEGENDARY coach
 *    cards never drop from packs (only from winning seasons, as before). WT598.simCoach(n) re-runs the check.
 * Registered in Live-Ops (v502live MODES): gift_starter598, tut_welcome598.
 * No ids, existing rl_ keys or net changes. Kill switches: window.__rl_no598gift, __rl_no598tut, __rl_no598coach.
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.WT598) return;
 const fail = (w, e) => { try { (Wn.WT598.err = Wn.WT598.err || []).push(w + ': ' + (e && e.message || e)); console.error(e); } catch (x) {} };
 const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
 const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const inGame = () => { try { return typeof game !== 'undefined' && !!game && !game.over; } catch (e) { return false; } };
 const WT = Wn.WT598 = { err: [], log: [] };

 // ---------------- 3. coach cards in packs ----------------
 const COACH_DROP = { daily: 0.02, basic: 0.03, rare: 0.05, legendary: 0.08 }; // chance per pack
 const COACH_RARE_SHARE = 0.2;                                                  // of those drops: 80% BASIC, 20% RARE
 const coachNameOf = k => { try { const c = Wn.V232 && V232.coaches && V232.coaches()[k]; if (c && c.n) return c.n; return k === 'WHAU' ? 'HOLLIS BRANNOCK' : String(T(k).coach || T(k).name + ' HEAD COACH').toUpperCase(); } catch (e) { return ''; } };
 const coachRar = k => { try { return Wn.V232 && V232.coachRar2403 ? V232.coachRar2403(coachNameOf(k)) | 0 : 0; } catch (e) { return 0; } };
 function coachPick(rnd, want) { // a non-legendary coach the player does not own yet (want: 0 basic / 1 rare)
  let P = []; try { P = Wn.V27 && V27.coachPool ? V27.coachPool() : []; } catch (e) {}
  const by = [[], []]; for (const k of P) { const r = coachRar(k); if (r === 0 || r === 1) by[r].push(k); } // LEGENDARY (2) is never in the list
  const L = by[want].length ? by[want] : by[1 - want]; if (!L.length) return null;
  return L[Math.floor(rnd() * L.length) % L.length];
 }
 WT.coachPick = coachPick; WT.coachRar = coachRar; WT.COACH_DROP = COACH_DROP;
 try {
  if (Wn.V27 && typeof V27.packCards === 'function' && !Wn.__rl_no598coach) {
   const pc0 = V27.packCards;
   V27.packCards = function (kind, cards, r) {
    const n = pc0.apply(this, arguments);
    try {
     const rnd = typeof r === 'function' ? r : Math.random, p = COACH_DROP[kind];
     if (p && !Wn.__rl_no598coach && Wn.V232 && V232.giveCoach && rnd() < p) {
      const k = coachPick(rnd, rnd() < COACH_RARE_SHARE ? 1 : 0);
      if (k && coachRar(k) < 2 && V232.giveCoach(k, 'CARD PACK') === 'new') WT.log.push(['coach', kind, k, coachRar(k)]);
     }
    } catch (e) { fail('coach', e); }
    return n;
   };
  }
 } catch (e) { fail('coachHook', e); }
 WT.simCoach = function (N) { // no real grants: counts what the drop roll would pick
  N = N || 100000; const out = { packs: N, drops: 0, basic: 0, rare: 0, legendary: 0 }; let s = 12345; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const kinds = Object.keys(COACH_DROP);
  for (let i = 0; i < N; i++) { const p = COACH_DROP[kinds[i % kinds.length]]; if (rnd() >= p) continue; const k = coachPick(rnd, rnd() < COACH_RARE_SHARE ? 1 : 0); if (!k) continue; out.drops++; out[['basic', 'rare', 'legendary'][coachRar(k)]]++; }
  return out;
 };

 // ---------------- 1. starter gift ----------------
 const GIFT_KEY = 'rl_gift598', GIFT_DEV = 'rlx_gift598';
 // 1.5 B72 (Charlie approved): the gift makes a FULL legal card team for a brand-new player: +1 custom GOALIE and +2 custom
 // field cards (the positions the player has fewest of), all BASIC (rar 0) like the other gift cards. With the 2 welcome
 // customs (C30 gift) that is 15 cards + the coach. Players who opened the old 10-card gift get the 3 once (backfill below,
 // flag rl_gift72, rides the cloud save like rl_gift598). Kill switch: window.__rl_no72gift3 (old 10-card gift, no backfill)
 const GIFT72 = 'rl_gift72', EXTRA72 = () => Wn.__rl_no72gift3 ? 0 : 3;
 let GIFT_CARDS = 10 + EXTRA72();
 function posCount() { const n = { A: 0, M: 0, D: 0, LSM: 0, FO: 0, G: 0 }; try { for (const id of V22.ownedIds()) { const p = PP(id); if (p && n[p.pos] != null) n[p.pos]++; } } catch (e) {} return n; }
 function extraPos() { const n = posCount(), f = [ 'A', 'M', 'D' ], out = [ 'G' ]; for (let k = 0; k < 2; k++) { f.sort((a, b) => n[a] - n[b]); out.push(f[0]); n[f[0]]++; } return out; }
 function freshAt(pos) { for (let i = 0; i < 600; i++) { const id = C30.freshId(0), d = id && C30.parse(id); if (d && d.pos === pos) return id; } return null; }
 let giftBusy = false;
 const giftClaimed = () => !!lsGet(GIFT_KEY, null) || !!lsGet(GIFT_DEV, null);
 function synced() { try { if (!Wn.V23 || !V23.signedIn()) return true; const A = V23.A(); return (A.rev | 0) > 0; } catch (e) { return true; } }
 function menuFree() {
  if (scr() !== 'menu') return false; // (a finished or demo game object can sit behind the menu)
  try { if (typeof tutGate !== 'undefined' && tutGate) return false; } catch (e) {}
  try { if (Wn.LS && !LS.get('tutDone', false)) return false; } catch (e) {}
  try { if (Wn.V17 && V17.modal && V17.modal()) return false; } catch (e) {}
  try { if (typeof ASK22 !== 'undefined' && ASK22) return false; } catch (e) {}
  try { const a = document.getElementById('acct23'); if (a && a.offsetParent) return false; } catch (e) {}
  try { if (Wn.TOUR17 && TOUR17.T && TOUR17.T.live) return false; } catch (e) {}
  try { if ([...document.querySelectorAll('#tut507card,#df2503,#shop26,#vets489pop,#qb35,#del41,#ss597,#tp598,#rk15pick,.pop17,[data-q597]')].some(e => e.offsetParent || getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0)) return false; } catch (e) {} // one popup at a time
  return true;
 }
 // the gift pack: a free pack kind whose cards are made here (same custom-card path as V38P's custom pack)
 let giftIds = null;
 function installGiftPack() {
  if (!Wn.V17 || !V17.PACKS || !Wn.V38P) return false;
  if (!V17.PACKS.gift598) V17.PACKS.gift598 = { n: 'STARTER GIFT', cost: 0, cat: 'v38', v38: 1, slots: Array.from({ length: GIFT_CARDS }, () => [100, 0, 0]) };
  if (!V38P.__g598) {
   const m0 = V38P.mine, o0 = V38P.open;
   V38P.mine = function (k) { return k === 'gift598' ? !!giftIds : m0.apply(this, arguments); };
   const a0 = V38P.art; if (typeof a0 === 'function') V38P.art = function (k) { return k === 'gift598' ? { col: '#7dff7a', lab: 'GIFT' } : a0.apply(this, arguments); };
   V38P.open = function (k) { if (k === 'gift598' && giftIds) { const r = giftIds; giftIds = null; return r; } return o0.apply(this, arguments); };
   V38P.__g598 = 1;
  }
  return true;
 }
 function makeCards() {
  const out = [], want = EXTRA72() ? extraPos() : [];
  for (let i = 0; i < GIFT_CARDS * 3 + 30 && out.length < GIFT_CARDS; i++) {
   const id = want.length > out.length ? freshAt(want[out.length]) : C30.freshId(0); if (!id || !C30.make(id)) continue;
   const ci = V27.cardItem(id), it = V17.BY[ci]; if (!it || out.includes(ci)) continue;
   it.c30 = 1; it.d = 'STARTER GIFT - BASIC CUSTOM PLAYER CARD. CREATE HIM IN THE LOCKER ROOM: NAME, SKIN, BRAID.';
   out.push(ci);
  }
  return out;
 }
 try { const st = document.createElement('style'); st.textContent = '.pack17:has(> :nth-child(6)){display:grid!important;grid-template-columns:repeat(5,auto)!important;justify-content:center!important;align-content:center!important;gap:8px!important;overflow:visible!important}'; document.head.appendChild(st); } catch (e) {} // 10-card gift reveal: 2 rows of 5 (normal packs have 5)
 // 1.5f BUG (Charlie: 3 GOOD STICK cards in his starter gift): the gift opens through buyPack, and every pack add-on
 // after it (v590fix's 3% N/A swap, v538's Good Stick pack fix, V38P.noRepeat) could swap a gift card for a collab / N/A one.
 // Fix: for the 'gift598' kind those hooks see the list but can never change it - the 10 BASIC custom cards stay exactly as
 // made here. Installed outermost right before the gift opens. Kill switch: window.__rl_no598giftguard
 function keepList(fn) { const g = function (kind, cards) { if (kind === 'gift598' && Array.isArray(cards) && !Wn.__rl_no598giftguard) { const snap = cards.slice(); let n; try { n = fn.apply(this, arguments); } finally { cards.length = 0; for (const c of snap) cards.push(c); } return n; } return fn.apply(this, arguments); }; for (const k of Object.keys(fn)) { try { g[k] = fn[k]; } catch (e) {} } g.__g598 = 1; return g; }
 function guardGift() {
  try { if (Wn.V27 && typeof V27.packCards === 'function' && !V27.packCards.__g598) V27.packCards = keepList(V27.packCards); } catch (e) {}
  try { if (Wn.V38P && typeof V38P.noRepeat === 'function' && !V38P.noRepeat.__g598) V38P.noRepeat = keepList(V38P.noRepeat); } catch (e) {}
 }
 WT.guardGift = guardGift; WT.makeCards = () => makeCards();
 function giveGift() {
  if (giftBusy || giftClaimed() || !synced()) return false;
  if (!Wn.C30 || !C30.on || !C30.on() || !Wn.V27 || !V27.cardItem || !installGiftPack()) return false;
  giftBusy = true;
  try {
   const cards = makeCards(); if (cards.length < GIFT_CARDS) { giftBusy = false; return false; }
   const stamp = { t: Date.now(), v: '1.5' };
   lsSet(GIFT_KEY, stamp); lsSet(GIFT_DEV, stamp); if (EXTRA72()) lsSet(GIFT72, stamp); // claimed BEFORE granting: a crash mid-way never gives it twice
   let coach = null; try { coach = coachPick(Math.random, 0); if (coach && coachRar(coach) === 0 && V232.giveCoach(coach, 'STARTER GIFT', true) !== 'new') coach = null; } catch (e) { coach = null; }
   const ST = V17.ST(); ST.freePacks = ST.freePacks || {}; ST.freePacks.gift598 = 1; giftIds = cards;
   guardGift();
   const p = V17.buyPack('gift598');
   try { V17.PACKS.gift598.bundle = cards.slice(); } catch (e) {} // pack art reads 'ALL 10' (set after the buy, so the buy itself used the free-pack path)
   if (p) { screen = 'pack17'; try { panelDirty(); } catch (e) {} }
   WT.gift = { cards: cards, coach: coach, t: Date.now() };
   setTimeout(() => { try { V17.toast('STARTER GIFT: ' + GIFT_CARDS + ' BASIC CUSTOM CARDS' + (coach ? ' + 1 COACH CARD' : ''), '#7dff7a'); if (coach) V17.toast('HEAD COACH CARD: ' + coachNameOf(coach), '#ffcc33'); } catch (e) {} }, 400);
   return true;
  } catch (e) { fail('gift', e); return false; } finally { giftBusy = false; }
 }
 WT.giveGift = giveGift; WT.giftClaimed = giftClaimed;
 // B72 backfill: the old gift (10 cards) was opened and the 3 extra cards were never given -> give them once, quietly
 function backfill72() {
  try {
   if (!EXTRA72() || !giftClaimed() || lsGet(GIFT72, null) || !synced()) return false;
   if (!Wn.C30 || !C30.on || !C30.on() || !Wn.V22 || !V22.grantIds) return false;
   const stamp = { t: Date.now(), v: '1.5 B72', fill: 1 }; lsSet(GIFT72, stamp); // flag first: never twice
   const ids = []; for (const pos of extraPos()) { const id = freshAt(pos); if (id && C30.make(id)) ids.push(id); }
   if (ids.length) { V22.grantIds(ids, C30.TID, 'STARTER GIFT'); try { V22.save(); } catch (e) {} }
   WT.fill72 = ids;
   setTimeout(() => { try { V17.toast('STARTER GIFT UPDATED: +1 GOALIE + 2 PLAYER CARDS', '#7dff7a'); } catch (e) {} }, 600);
   return true;
  } catch (e) { fail('fill72', e); return false; }
 }
 WT.backfill72 = backfill72;
 { let n72 = 0; const iv72 = setInterval(() => { if (++n72 > 120 || backfill72() || lsGet(GIFT72, null)) clearInterval(iv72); }, 2000); }

 // ---------------- 2. welcome tutorial (show-only) ----------------
 const TUT_KEY = 'rl_wt598';
 const tutState = () => lsGet(TUT_KEY, {}) || {};
 const tutDone = () => !!tutState().done;
 const cardTeams = () => { try { return (V33.D.pro || []).concat(V33.D.col || []).filter(t => SZ_REG[t.id]); } catch (e) { return []; } };
 const signed = () => { try { return !!(Wn.V23 && V23.signedIn()); } catch (e) { return false; } };
 // where to look: canvas hits (uiSpecs key / label) or a DOM element
 const H = (re) => ({ hit: re });
 const D = (sel, txt) => ({ dom: sel, txt: txt });
 // navigation used only to SHOW a screen (no taps, no saves)
 const NAV = {
  home() { try { if (Wn.RK15LL && RK15LL.close && scr() === 'gear17') RK15LL.close(); } catch (e) {} try { GEAR17 = null; } catch (e) {} try { screen = 'menu'; if (Wn.M37) M37.page = 'home'; } catch (e) {} },
  lobby() { // the regular (QUICK MATCH) lobby: the same page the PLAY > QUICK MATCH bar opens
   NAV.home();
   try { M37.page = 'play'; if (Wn.V469) V469.page = 'reg'; const q = menuBars(false).flat().find(b => b && b.label === 'QUICK MATCH'); if (q) q.fn(); } catch (e) { fail('navLobby', e); }
  },
  locker() { NAV.home(); try { V17.openLocker(); } catch (e) { fail('navLocker', e); } },
  ll() { NAV.home(); if (!signed()) return; /* show-only: never opens the account gate */ try { RK15LL.open(); } catch (e) { fail('navLL', e); } },
  teams() { NAV.home(); try { menuSel.mode = 'browse'; screen = 'pickTeam'; } catch (e) { fail('navTeams', e); } }
 };
 const RANKS = 'RANKS GO SQUID I UP TO BAGGATWAAN V, THEN JADE KING. +1 POINT PER WIN, HARDER HIGHER UP. THE #1 PLAYER WEARS THE JADE KING UNI.';
 const PARTS = {
  A: { n: "WHAT'S NEW", steps: [
   { go: 'home', t: null, tip: "BAGGA LAX 1.5! A QUICK LOOK AT WHAT'S NEW. THIS IS ONLY A TOUR: NOTHING HERE CHANGES YOUR GAME." },
   // 1.5f (Jonny B62): AUTO BEST / TAKE OFF steps removed - those buttons are not on a fresh save's quick lobby
   { go: 'lobby', t: H(/(^|\|)UNIFORM$/), tip: 'UNIFORM: PICK WHAT THIS TEAM WEARS, RANKED UNIS TOO.' },
   { go: 'locker', t: D('button', /EVERY TEAM/), tip: 'TAKE OFF ALL TEAMS: EVERY ITEM ON EVERY TEAM GOES BACK IN THE LOCKER.' },
   { go: 'locker', t: D('#lsb598'), tip: 'LOCKER SALES: SELLING ITEMS FILLS THIS BAR. RARER ITEMS FILL IT FASTER. A FULL BAR PAYS 10 DIMES.' }
  ] },
  B: { n: 'ONLINE', steps: [
   { go: 'll', t: H(/FIND MATCH$/), alt: H(/(^|\|)FRIENDS$|MAKE A CARD TEAM$/), tip: () => 'PLAY > ONLINE OPENS LOCKER LEAGUE. FIND MATCH: PLAY A REAL PLAYER NEAR YOUR RANK.' + (signed() ? '' : ' YOU NEED A FREE ACCOUNT FIRST (FRIENDS ON THE HOME SCREEN).') },
   { go: 'll', t: H(/RANKINGS$/), alt: H(/(^|\|)FRIENDS$/), tip: RANKS + ' YOUR LOCKER RANK COUNTS WHAT YOU OWN.' },
   { skip: () => !signed(), go: 'll', t: H(/(LINEUP|RATINGS)$/), all: 1, tip: 'LINEUP: WHO STARTS. RATINGS: EVERY OVR AND STAT ON YOUR CARD TEAM.' },
   { skip: () => !signed(), go: 'll', t: H(/PROFILE$/), tip: 'PROFILE: YOUR RANK, RECORD AND THE TEAM OTHERS SEE.' },
   { skip: () => !signed(), go: 'll', t: H(/FRIENDS$/), tip: 'FRIENDS: ADD FRIENDS AND INVITE THEM TO A GAME.' },
   { skip: () => !signed(), go: 'll', t: H(/SEASON$/), tip: 'SEASON: START AN ONLINE SEASON, WORLD GAMES OR COLLEGE TOURNAMENT.' },
   { skip: () => !signed(), go: 'll', t: H(/(^|\|)UNIFORM$/), tip: 'UNIFORM: PICK YOUR UNI. RANKED UNIS SHOW YOUR RANK BADGE ON THE CHEST.' },
   { skip: () => !signed(), go: 'll', t: H(/TEAM PLATE$/), tip: 'TAP THE TEAM NAME TO SWITCH CARD TEAMS.' }
  ] },
  C: { n: 'MAKING A CARD TEAM', steps: [
   { go: 'home', t: H(/TEAMS \+ RATINGS$/), tip: 'CARD TEAMS ARE MADE IN TEAMS + RATINGS.' },
   { go: 'teams', t: H(/ADD CARD TEAM$/), tip: 'ADD CARD TEAM MAKES A NEW TEAM FROM YOUR PLAYER CARDS.' },
   { go: 'teams', t: H(/ADD CARD TEAM$/), tip: 'ADD 12+ PLAYER CARDS WITH A GOALIE. YOUR STARTER GIFT CARDS COUNT.' },
   { go: 'teams', t: H(/TEAM-(ct|CT)/), tip: 'YOUR CARD TEAMS SHOW HERE. TAP ONE LATER TO EDIT IT.' },
   { skip: () => !signed(), go: 'll', t: H(/LINEUP$/), tip: 'SET THE LINEUP: WHO STARTS FOR YOUR CARD TEAM.' },
   { go: 'teams', t: H(/TEAM-(ct|CT)/), alt: H(/ADD CARD TEAM$/), tip: 'COACH CARD: IN YOUR CARD TEAM, PICK A COACH CARD IN THE HEAD COACH SLOT. IT BOOSTS YOUR TEAM.' }
  ] }
 };
 let cur = null, el = null; // cur = { parts: ['A','B','C'], p, i, why }
 function css() {
  if (document.getElementById('wt598css')) return;
  const s = document.createElement('style'); s.id = 'wt598css';
  s.textContent = '#wt598{position:fixed;inset:0;z-index:9000;font:bold 11px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;color:#fff;touch-action:none}' +
   '#wt598 .sh{position:fixed;inset:0;background:rgba(0,0,0,.62)}#wt598 .ho{position:fixed;box-shadow:0 0 0 9999px rgba(0,0,0,.62);outline:2px solid #ffe14d;pointer-events:none;animation:wt598b .6s steps(2) infinite}' +
   '@keyframes wt598b{50%{outline-color:#fff7b0}}#wt598 .ar{position:fixed;width:0;height:0;pointer-events:none;filter:drop-shadow(2px 2px 0 #000)}' +
   '#wt598 .bx{position:fixed;background:#10202a;border:2px solid #05080b;box-shadow:0 0 0 2px #ffe14d,0 5px 0 #000;padding:7px 8px 6px;box-sizing:border-box;width:min(300px,calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right)))}' +
   '#wt598 .hd{color:#ffe14d;font-size:10px;margin-bottom:4px;display:flex;gap:6px}#wt598 .hd i{font-style:normal;color:#9fb8c4;margin-left:auto}#wt598 .tx{font-size:11px;line-height:1.35;margin-bottom:6px}' +
   '#wt598 .rw{display:flex;gap:6px}#wt598 button{font:inherit;text-transform:uppercase;color:#0b1a20;border:2px solid #0b1a20;border-radius:0;box-shadow:inset 0 2px 0 rgba(255,255,255,.4),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000;padding:5px 8px;cursor:pointer;touch-action:manipulation;min-height:28px}' +
   '#wt598 .nx{background:#7dff7a;flex:1}#wt598 .bk{background:#c9d6d9}#wt598 .sk{background:#ff9a8a}#wt598 .bk[disabled]{opacity:.45}';
  document.head.appendChild(s);
 }
 function stageBox() { const st = document.getElementById('stage') || document.querySelector('canvas'); const r = st.getBoundingClientRect(); return { x: r.left, y: r.top, k: r.width / W, ky: r.height / H }; }
 const SCR = { home: 'menu', lobby: 'menu', locker: 'locker17', ll: 'gear17', teams: 'pickTeam' };
 function findRect(t, want) {
  if (!t) return null;
  try {
   if (t.hit) {
    const sc = scr(); if (want && sc !== want) return null; // only on the screen this step shows (no look-alike buttons elsewhere)
    const L = uiSpecs.filter(s => s.key.startsWith(sc + '|') && (t.hit.test(s.key) || t.hit.test(String(s.label || '')))); if (!L.length) return null;
    // 1.5f (Charlie: tips missed their buttons): the spotlight is the LIVE tap rect - the game's own #ui tap button for that
    // hit (.hb[data-k]); only if a hit has no tap button, its rect in #ui percent space (the same space the tap buttons use).
    // One button per step (the first live match), several only when the step asks for it (LINEUP + RATINGS).
    const ui = document.getElementById('ui'), U = ui ? ui.getBoundingClientRect() : null, rs = [];
    for (const sp of L) {
     let el = null; try { el = ui && ui.querySelector('.hb[data-k="' + (window.CSS && CSS.escape ? CSS.escape(sp.key) : sp.key) + '"]'); } catch (e) {}
     let r = null;
     if (el) { const b = el.getBoundingClientRect(); if (b.width > 1 && b.height > 1) r = { x: b.left, y: b.top, w: b.width, h: b.height }; }
     if (!r && U) r = { x: U.left + sp.x / W * U.width, y: U.top + sp.y / H * U.height, w: sp.w / W * U.width, h: sp.h / H * U.height };
     if (r) rs.push(r);
     if (!t.all && rs.length) break;
    }
    if (!rs.length) return null;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const r of rs) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
   }
   if (t.dom) {
    const L = [...document.querySelectorAll(t.dom)].filter(e => e.offsetParent && !e.closest('#wt598') && (!t.txt || t.txt.test(((e.textContent || '') + ' ' + (e.getAttribute('aria-label') || '')).toUpperCase())));
    const e = L[0]; if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 2) return null;
    return { x: r.left, y: r.top, w: r.width, h: r.height };
   }
  } catch (e) {}
  return null;
 }
 function step() { const P = PARTS[cur.parts[cur.p]]; return P && P.steps[cur.i]; }
 const live = st => !(st && st.skip && st.skip()); // 1.5f (Jonny M4): steps with nothing to show (signed out) are skipped, never a floating tip
 function count() { let n = 0, at = 0; cur.parts.forEach((k, j) => PARTS[k].steps.forEach((st, i) => { if (!live(st)) return; n++; if (j < cur.p || (j === cur.p && i <= cur.i)) at++; })); return [Math.max(1, at), n]; }
 function show() {
  const s = step(); if (!s) return end('done');
  css();
  if (!el) {
   el = document.createElement('div'); el.id = 'wt598';
   ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'click', 'wheel'].forEach(ev => el.addEventListener(ev, e => { e.stopPropagation(); if (!e.target.closest('button')) e.preventDefault(); }, { passive: false }));
   document.body.appendChild(el);
  }
  if (cur.went !== cur.p + ':' + cur.i) { cur.went = cur.p + ':' + cur.i; const prev = cur.goName; if (s.go && s.go !== prev) { try { NAV[s.go](); } catch (e) { fail('nav', e); } cur.goName = s.go; } cur.shown = 0; }
  draw();
 }
 function draw() {
  if (!cur || !el) return;
  const s = step(); if (!s) return;
  const r = findRect(s.t && s.all ? Object.assign({ all: 1 }, s.t) : s.t, SCR[s.go]) || (s.alt ? findRect(s.alt, null) : null), tip = typeof s.tip === 'function' ? s.tip() : s.tip, [k, n] = count(), part = PARTS[cur.parts[cur.p]];
  const vw = innerWidth, vh = innerHeight, pad = 4;
  let html = '';
  if (r) html += '<div class="ho" style="left:' + (r.x - pad) + 'px;top:' + (r.y - pad) + 'px;width:' + (r.w + pad * 2) + 'px;height:' + (r.h + pad * 2) + 'px"></div>';
  else html += '<div class="sh"></div>';
  html += '<div class="bx"><div class="hd"><span>' + part.n + '</span><i>' + k + '/' + n + '</i></div><div class="tx">' + String(tip).replace(/[<>&]/g, '') + '</div><div class="rw"><button type="button" class="bk"' + (k <= 1 ? ' disabled' : '') + ' aria-label="BACK">BACK</button><button type="button" class="nx" aria-label="NEXT">' + (k >= n ? 'DONE' : 'NEXT') + '</button><button type="button" class="sk" aria-label="SKIP">SKIP</button></div></div>';
  const key = html + vw + 'x' + vh;
  if (el.__k !== key) {
   el.__k = key; el.innerHTML = html;
   el.querySelector('.nx').onclick = e => { e.stopPropagation(); go(1); };
   el.querySelector('.bk').onclick = e => { e.stopPropagation(); go(-1); };
   el.querySelector('.sk').onclick = e => { e.stopPropagation(); end('skip'); };
   const bx = el.querySelector('.bx'), bw = bx.offsetWidth, bh = bx.offsetHeight;
   const sl = Math.max(8, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sal')) || 0);
   let x, y, ar = null;
   if (r) { // box beside the target (left or right, whichever has room), else above / below
    const cy = r.y + r.h / 2, roomR = vw - (r.x + r.w), roomL = r.x;
    if (roomR >= bw + 30 || roomL >= bw + 30) { const right = roomR >= roomL; x = right ? r.x + r.w + 22 : r.x - bw - 22; y = cy - bh / 2; ar = { x: right ? r.x + r.w + 8 : r.x - 8, y: cy, d: right ? 'l' : 'r' }; }
    else { const below = r.y + r.h / 2 < vh / 2; x = r.x + r.w / 2 - bw / 2; y = below ? r.y + r.h + 20 : r.y - bh - 20; ar = { x: r.x + r.w / 2, y: below ? r.y + r.h + 7 : r.y - 7, d: below ? 'u' : 'd' }; }
   } else { x = vw / 2 - bw / 2; y = vh / 2 - bh / 2; }
   const mg = vw >= bw + 110 ? 50 : 8; // 1.5f (Jonny L2): clear of the island / notch on both sides when there is room
   x = Math.max(Math.max(sl, mg), Math.min(vw - bw - mg, x)); y = Math.max(6, Math.min(vh - bh - 10, y));
   bx.style.left = Math.round(x) + 'px'; bx.style.top = Math.round(y) + 'px';
   if (ar) { const a = document.createElement('div'); a.className = 'ar'; const sz = 9; const b = 'border:' + sz + 'px solid transparent;';
    a.style.cssText = b + (ar.d === 'l' ? 'border-right-color:#ffe14d;left:' + (ar.x - sz) + 'px;top:' + (ar.y - sz) + 'px' : ar.d === 'r' ? 'border-left-color:#ffe14d;left:' + (ar.x - sz) + 'px;top:' + (ar.y - sz) + 'px' : ar.d === 'u' ? 'border-bottom-color:#ffe14d;left:' + (ar.x - sz) + 'px;top:' + (ar.y - sz) + 'px' : 'border-top-color:#ffe14d;left:' + (ar.x - sz) + 'px;top:' + (ar.y - sz) + 'px');
    el.appendChild(a); }
  }
  WT.at = { part: cur.parts[cur.p], i: cur.i, k: k, n: n, found: !!r, rect: r, tip: tip };
 }
 let R598skip = 0; WT.skipped = () => R598skip;
 function go(d) {
  if (!cur) return;
  cur.dir = d; cur.miss = 0;
  let p = cur.p, i = cur.i;
  for (let guard = 0; guard < 60; guard++) {
   i += d;
   if (i < 0) { if (p > 0) { p--; i = PARTS[cur.parts[p]].steps.length; continue; } return; }
   if (i >= PARTS[cur.parts[p]].steps.length) { p++; i = -1; if (p >= cur.parts.length) return end('done'); continue; }
   if (live(PARTS[cur.parts[p]].steps[i])) break;
  }
  cur.p = p; cur.i = i; show();
 }
 function end(how) {
  const c = cur; cur = null;
  if (el) { el.remove(); el = null; }
  const st = tutState();
  if (c && c.why === 'partC') st.c = how; else { st.done = how; st.c = st.c || how; }
  st.t = Date.now(); lsSet(TUT_KEY, st); WT.ended = how;
  try { if (c && c.back) c.back(); else if (c && c.why !== 'partC') NAV.home(); } catch (e) {}
 }
 function start(parts, why) {
  if (cur || Wn.__rl_no598tut) return false;
  cur = { parts: parts || ['A', 'B', 'C'], p: 0, i: 0, why: why || 'welcome', went: '', goName: null };
  show(); return true;
 }
 WT.start = start; WT.end = end; WT.next = () => go(1); WT.back = () => go(-1); WT.PARTS = PARTS; WT.tutDone = tutDone;
 // keep the spotlight on its target (layout changes, rotation, panels that render a frame later)
 (function loop() { try { if (cur) { draw(); const s0 = step(); if (s0 && s0.t && !(WT.at && WT.at.found)) { cur.miss = cur.miss || performance.now(); if (performance.now() - cur.miss > 1600 && !Wn.__rl_no598tutskip) { cur.miss = 0; R598skip++; go(cur.dir || 1); } } else if (cur) cur.miss = 0; } } catch (e) { fail('draw', e); } requestAnimationFrame(loop); })(); // every frame: follows layout + size changes; a step whose button never appears is skipped
 // Locker League with no card team: part C (show-only) on Teams + Ratings, once
 try {
  const LLo = Wn.RK15LL;
  if (LLo && typeof LLo.open === 'function') {
   const o0 = LLo.open;
   LLo.open = function () {
    const r = o0.apply(this, arguments);
    try { if (!cur && !Wn.__rl_no598tut && LLo.mode === 'noteam' && !cardTeams().length && !tutState().c) { NAV.teams(); start(['C'], 'partC'); } } catch (e) { fail('partC', e); }
    return r;
   };
  }
 } catch (e) {}
 // ---------------- driver: gift first (pack reveal), then the welcome tour on the home menu ----------------
 let idleSince = 0;
 setInterval(() => {
  try {
   if (cur) return;
   if (!menuFree()) { idleSince = 0; return; }
   if (!idleSince) { idleSince = Date.now(); return; }
   if (Date.now() - idleSince < 1200) return;
   if (!Wn.__rl_no598gift && !giftClaimed() && synced()) { if (giveGift()) { idleSince = 0; return; } }
   if (!Wn.__rl_no598tut && !tutDone() && (Wn.M37 ? M37.page === 'home' : true)) start(['A', 'B', 'C'], 'welcome');
  } catch (e) { fail('driver', e); }
 }, 400);
})();
