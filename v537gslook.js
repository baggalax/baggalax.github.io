/* v537gslook.js - Good Stick Co.: one tan skin tone, the stadium boards, and a FOLLOW button that goes somewhere (Bagga Lax).
   1) SKIN: every GOOD STICK CO. player (real + filler) wears ONE skin tone: index 2 of the game's palette
      (MEDIUM, #c48a56 - a tan, not too dark). v501gsc.js gave them i % 6 (all six tones). Applied to the
      roster (cards, lineups, both sides of a game) on load, after any roster refresh, and to a game in progress.
      Nothing is written to the save; the player's own skin edits for other teams are untouched.
   2) BOARDS (only while Good Stick is released = the pack's own gate, GSC501.packOn()):
      - In the GOOD STICK CO.'s own stadium (they are the home team) the whole board strip is ONE large
        Good Stick ad (logo + THE GOOD STICK CO.), no Bagga Lax boards.
      - In every other stadium exactly one of the small boards is a Good Stick board; every other board stays
        Bagga Lax (open slots for future sponsors). Built as a sponsor-slot list, window.RL_SPONSOR_BOARDS:
        add { id, img } entries to give more companies a board (slot 1 = Good Stick). A board that LIVEOPS
        already sold keeps its sponsor.
      Not released = every board stays exactly as before.
   3) FOLLOW (Good Stick pack, "FOLLOW = 15 DIMES", web): now opens The Good Stick Co.'s page in a new tab / the
      system browser (LIVEOPS goodstick.follow / .social url when the config gives one, else the promo url,
      else https://thegoodstick.co), then applies the 15-dime price (v501 read the
      LIVEOPS price first and ignored the follow, so the price never dropped; now following = 5 dimes off).
   No ids, rl_* keys, saves or net protocol change. Kill switch: window.__rl_no537gl = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no537gl || W.GSL537) return;
 const S = W.GSL537 = { err: [], banner: false, skinN: 0 };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!W.__rl_no537gl;
 const ID = 'GSC', TAN = 2, BOARD = 'ads/gs486-board.png', LOGO = 'gs486logo96.png';
 const released = () => { try { return !off() && !!(W.GSC501 && typeof GSC501.packOn === 'function' && GSC501.packOn()); } catch (e) { return false; } };

 // ---------- 1) one tan skin tone ----------
 function skins() {
  if (off()) return;
  try {
   if (typeof PLAYERS === 'undefined') return;
   const t = typeof GH_REG !== 'undefined' && GH_REG[ID];
   const ids = t && Array.isArray(t.roster) ? t.roster : [];
   let n = 0;
   for (const id of ids) { const p = PLAYERS[id]; if (p && p.skin !== TAN) { p.skin = TAN; n++; } }
   for (const id in PLAYERS) { const p = PLAYERS[id]; if (p && p.gsc501 && p.skin !== TAN) { p.skin = TAN; n++; } }
   const G = typeof game !== 'undefined' ? game : null;
   if (G && Array.isArray(G.players)) for (const a of G.players) {
    const pl = a && a.pl;
    if (pl && (pl.gsc501 || pl.team === ID || /^GSC-/.test(String(pl.id || ''))) && 'skin' in a && a.skin !== TAN) { a.skin = TAN; n++; }
   }
   S.skinN += n;
  } catch (e) { fail('skin', e); }
 }
 try {
  if (W.GSC501 && typeof GSC501.applyRoster === 'function' && !GSC501.applyRoster.__gsl537) {
   const a0 = GSC501.applyRoster;
   GSC501.applyRoster = function () { const r = a0.apply(this, arguments); try { skins(); } catch (e) {} return r; };
   GSC501.applyRoster.__gsl537 = true;
  }
 } catch (e) { fail('roster', e); }
 try {
  if (typeof newGame === 'function' && !W.newGame.__gsl537) {
   const n0 = W.newGame;
   W.newGame = function () { try { skins(); } catch (e) {} const r = n0.apply(this, arguments); try { skins(); } catch (e) {} return r; };
   W.newGame.__gsl537 = true;
  }
 } catch (e) { fail('newGame', e); }
 skins();

 // ---------- 2) boards ----------
 // sponsor slots: slot 1 = Good Stick. More companies = more entries ({ id, img, on: () => bool }).
 const SPONSORS = W.RL_SPONSOR_BOARDS = W.RL_SPONSOR_BOARDS || [];
 if (!SPONSORS.some(s => s && s.id === 'goodstick')) SPONSORS.unshift({ id: 'goodstick', img: BOARD, on: released });
 const BANNER = 'ads/gs537-banner.png'; // one long Good Stick ad: logo + THE GOOD STICK CO., no board seams
 S.banner = true;
 const inGame = () => { try { return typeof GAME_SCREENS !== 'undefined' && GAME_SCREENS.includes(screen) && typeof game !== 'undefined' && !!game; } catch (e) { return false; } };
 const gscHome = () => { try { return inGame() && typeof homeTeam === 'function' && homeTeam() && homeTeam().id === ID; } catch (e) { return false; } };
 const nSeg = () => { try { return W.V39B && V39B.count ? V39B.count() : 11; } catch (e) { return 11; } };
 function slotIdx(k, n) { // spread sponsors from the middle board out: mid, mid-3, mid+3, ...
  const mid = Math.floor(n / 2), d = Math.ceil(k / 2) * 3 * (k % 2 ? -1 : 1);
  return Math.max(0, Math.min(n - 1, mid + d));
 }
 function install() {
  const A = W.RL_ADS39;
  if (!A || A.__gsl537) return !!A;
  try {
   const base = { fallback: A.fallback, sponsors: A.sponsors, segments: A.segments, takeoverOn: A.takeoverOn };
   const live = () => !off() && released();
   Object.defineProperty(A, 'fallback', {
    configurable: true, enumerable: true,
    get() {
     const fb = Array.isArray(base.fallback) ? base.fallback : base.fallback ? [ base.fallback ] : [];
     if (!live()) return base.fallback;
     if (gscHome() && BANNER) return [ BANNER ];
     const out = fb.filter(f => f !== BOARD);
     return out.length ? out : [ 'ads/bagga-lax.png' ];
    },
    set(v) { base.fallback = v; }
   });
   Object.defineProperty(A, 'sponsors', {
    configurable: true, enumerable: true,
    get() {
     if (!live()) return base.sponsors;
     if (gscHome() && BANNER) return {};
     const o = Object.assign({}, base.sponsors || {}), n = nSeg();
     let k = 0;
     for (const s of SPONSORS) {
      if (!s || !s.img || (typeof s.on === 'function' && !s.on())) continue;
      const i = slotIdx(k++, n) + 1;
      const sold = o[i];
      if (!(Array.isArray(sold) ? sold.length : sold)) o[i] = [ s.img ];
     }
     return o;
    },
    set(v) { base.sponsors = v; }
   });
   Object.defineProperty(A, 'segments', {
    configurable: true, enumerable: true,
    get() { return live() && gscHome() && BANNER ? 1 : base.segments; },
    set(v) { base.segments = v; }
   });
   Object.defineProperty(A, 'takeoverOn', {
    configurable: true, enumerable: true,
    get() { return live() && gscHome() && BANNER ? false : base.takeoverOn; },
    set(v) { base.takeoverOn = v; }
   });
   A.__gsl537 = true;
   S.boards = true;
  } catch (e) { fail('ads', e); }
  return true;
 }
 if (!install()) { let t = 0; const iv = setInterval(() => { if (install() || ++t > 40) clearInterval(iv); }, 500); }

 // ---------- 3) FOLLOW opens their page, then the 15-dime price ----------
 function followUrl() {
  try {
   const g = W.LIVEOPS && LIVEOPS.goodstick && LIVEOPS.goodstick();
   for (const k of [ 'follow', 'followUrl', 'social', 'instagram' ]) {
    const v = g && (typeof g[k] === 'string' ? g[k] : g[k] && g[k].url);
    if (typeof v === 'string' && /^https?:\/\//i.test(v.trim())) return v.trim();
   }
  } catch (e) {}
  try { const p = W.GSC501 && GSC501.promo && GSC501.promo(); if (p && /^https?:\/\//i.test(p.url || '')) return p.url; } catch (e) {}
  return 'https://thegoodstick.co';
 }
 function openUrl(u) {
  try {
   const cap = W.Capacitor, native = !!(cap && (typeof cap.isNativePlatform === 'function' ? cap.isNativePlatform() : cap.isNative));
   if (native) {
    const B = cap.Plugins && cap.Plugins.Browser || (cap.registerPlugin && cap.registerPlugin('Browser'));
    if (B && B.open) { B.open({ url: u }); return 'browser'; }
   }
  } catch (e) { fail('cap', e); }
  try { const w = W.open(u, '_blank', 'noopener'); if (w || w === null) { /* null = opener cut by noopener; the tab still opens */ } return 'window'; } catch (e) { fail('open', e); }
  try { location.href = u; return 'location'; } catch (e) { return 'none'; }
 }
 S.followUrl = followUrl;
 // the follow discount. Root cause of "FOLLOW does nothing": v501gsc.js / v504gs.js read the follow flag through
 // window.LS, but the game's LS store is a script-level const (never on window), so the flag always read as
 // "not followed" (price stayed 20, the FOLLOW button never turned into THANKS FOR FOLLOWING). Exposing the same
 // store object on window makes those reads work; only the Good Stick files read window.LS.
 try { if (!W.LS && typeof LS !== 'undefined') W.LS = LS; } catch (e) { fail('ls', e); }
 // when LIVEOPS sets the pack price, v501 returns that and skips the follow: take 5 dimes off it too.
 try {
  if (W.GSC501 && typeof GSC501.price === 'function' && !GSC501.price.__gsl537) {
   const p0 = GSC501.price;
   const followed = () => { try { return !!(typeof LS !== 'undefined' && LS.get('gsc501follow', null)); } catch (e) { return false; } };
   const p1 = function () {
    const p = p0.apply(this, arguments);
    if (off() || !followed()) return p;
    let lo = null;
    try { lo = W.LIVEOPS && LIVEOPS.price ? LIVEOPS.price('pack_goodstick') : null; } catch (e) {}
    return lo != null && isFinite(+lo) && +p === +lo ? Math.max(0, +lo - 5) : p;
   };
   p1.__gsl537 = true;
   GSC501.price = p1;
  }
 } catch (e) { fail('price', e); }
 function hookFollow() {
  try {
   if (typeof PANEL_ACT !== 'object' || typeof PANEL_ACT.gsc501follow !== 'function') return false;
   if (PANEL_ACT.gsc501follow.__gsl537) return true;
   const f0 = PANEL_ACT.gsc501follow;
   const f1 = function () {
    // web only for now (the follow discount in the iOS app is still Charlie's call)
    let native = false;
    try { const cap = W.Capacitor; native = !!(cap && (typeof cap.isNativePlatform === 'function' ? cap.isNativePlatform() : cap.isNative)); } catch (e) {}
    if (!off() && !native) { try { S.lastFollow = { url: followUrl() }; S.lastFollow.how = openUrl(S.lastFollow.url); } catch (e) { fail('follow', e); } }
    return f0.apply(this, arguments);
   };
   f1.__gsl537 = true;
   PANEL_ACT.gsc501follow = f1;
   return true;
  } catch (e) { fail('hookf', e); return false; }
 }
 if (!hookFollow()) { let t = 0; const iv = setInterval(() => { if (hookFollow() || ++t > 40) clearInterval(iv); }, 500); }

 setInterval(() => { try { skins(); install(); hookFollow(); } catch (e) {} }, 1000);
})();
