/* v525franlobby.js - V52.5: FRANCHISE LOBBY (Bagga Lax).
 * Charlie (Nov 11 11:19 PM): "in franchise mode there should be a lobby screen just like the others where you see your
 * team with the big player and can put items on them then when you hit play it pops up with the whole franchise menu
 * thing it is now" + "it should be the exact same as others with play practice and playmaker" + "play brings you to
 * menus - the franchise menu like what it is rn".
 * Before: PLAY > PLAY CAREER > FRANCHISE TEAM (or FRANCHISE MODE) opened the Franchise Mode panel (v460fmu, screen
 *   'fm460') straight away.
 * Now:  that button opens a FRANCHISE lobby page (M37.page = 'fr525', screen stays 'menu'): the same locker room as
 *   QUICK GAME / PRO SEASON / WORLD GAMES - your franchise team on the bench, the big player you can swipe through,
 *   the gear slots around him (tap one = the item tray), the player card, LOCKER ROOM / TEAM CREW / SHOP etc.
 *   Buttons, same as the other mode lobbies: PLAY FRANCHISE (START FRANCHISE when there is none yet) = opens the
 *   Franchise Mode panel exactly as before (FM460U.open('start')), PLAYMAKER, PRACTICE, BACK (> the CAREER screen).
 *   No franchise yet: gray locked locker room + "NO FRANCHISE TEAM YET", PLAY starts one the same way as before.
 * Items: the lobby shows your coached team as the game's own franchise slot team 'FM6U' (same shape v460fm builds for
 *   a franchise game), so the gear system treats it like a saved quick-game team: items you put on players go in the
 *   gear store's per-team box ST.tequip.FM6U (rl_ items save, persists, counts as "in use" like any saved team gear).
 *   When a franchise game starts (newGame('FM6U', ...,'career')), that box becomes the franchise team's loadout
 *   (SZ_REG.FM6U.g17 via the gear system's own myLoadout(..., 'match')), so the players wear the items and the item
 *   effects apply in the game. Players who left the team get their items back in the locker (pruned on lobby open).
 * Only wraps window.menuBars / menuBar / lobbyTeam / lobbyIds / lobbySrc / homeQuick16 / qTeam16 / qsz286 /
 *   homeWorld / drawLobbyLeftIn / drawLobbyCard / newGame (and V29R.wq, V17.drawHome) - each one only while the FRANCHISE page is
 *   up (or, for newGame, only for the franchise slot). No ids, rl_* keys, franchise saves or net protocol changed.
 * Kill switch: window.__rl_no525fl = true (read every call; FRANCHISE TEAM opens the panel directly again).
 */
(function () {
 'use strict';
 const Wn = window;
 if (typeof Wn.menuBars !== 'function' || typeof Wn.menuBar !== 'function' || !Wn.M37 || !Wn.FM460 || !Wn.FM460U) return;
 const PG = 'fr525', SLOT = 'FM6U';
 const V = Wn.V525 = { n: 0, err: null, gearN: 0, pruned: 0, plays: 0, last: null };
 const off = () => {
  try { return !!(Wn.__rl_no525fl || Wn.__rl_v124gb || Wn.__rl_no37m || !Wn.FM460 || !FM460.on || FM460.OFF()); } catch (e) { return true; }
 };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const onPage = () => !off() && M37.page === PG;
 const here = () => onPage() && scr() === 'menu';
 const err = (e, k) => { try { console.error(e); V.err = k + ': ' + String(e && e.stack || e).slice(0, 300); } catch (x) {} };
 V.here = here;
 function fm() { try { const M = FM460.get(); return M && M.team ? M : null; } catch (e) { return null; } }

 // ---------- the franchise team as the game's own franchise slot 'FM6U' (same shape as v460fm teamFor) ----------
 let regAt = 0, regKey = '';
 function inFmGame() { try { return !!(game && game.fm460 && !game.over); } catch (e) { return false; } }
 function reg() {
  const M = fm();
  if (!M) return null;
  const cur = SZ_REG[SLOT];
  if (cur && !cur.fm460) return null;              // not a franchise slot: leave it alone
  if (inFmGame()) return cur ? SLOT : null;        // a franchise game owns the slot right now
  const t = performance.now();
  if (cur && cur.fm460 === M.team && t - regAt < 1500) return SLOT;
  regAt = t;
  try { FM460.ensure(); } catch (e) { err(e, 'ensure'); }
  let ro = [];
  try { ro = FM460.rosterOf(M.team) || []; } catch (e) { ro = []; }
  ro = ro.filter(id => PP(id));
  if (!ro.length) return cur && cur.fm460 ? SLOT : null;
  const key = M.team + ':' + ro.join(',');
  if (cur && cur.fm460 === M.team && key === regKey) return SLOT;
  const base = T(M.team);
  if (!base || base.id !== M.team) return null;
  const tm = Object.assign({}, base, { id: SLOT, szBase: base.id, roster: ro, fm460: M.team, v525: 1 });
  tm.nums = {};
  for (const x of ro) {
   const p = PP(x); if (!p) continue;
   let n = p.wnum;
   if (n == null && p.fm460b) try { n = jerseyNo(PP(p.fm460b), 'real', base.id); } catch (e) {}
   if (n == null && base.nums && base.nums[x] != null) n = base.nums[x];
   if (n != null && n !== '') tm.nums[x] = n;
  }
  SZ_REG[SLOT] = tm;
  regKey = key;
  prune(ro);
  return SLOT;
 }
 // items on players who left the franchise team go back to the locker room
 function prune(ro) {
  try {
   const tq = Wn.V17 && V17.tequip ? V17.tequip() : null, box = tq && tq[SLOT];
   if (!box || typeof box !== 'object' || ro.length < 10) return;
   const on = new Set(ro);
   let n = 0;
   for (const pid of Object.keys(box)) if (!on.has(pid)) { delete box[pid]; n++; }
   if (n) { V.pruned += n; try { V17.save && V17.save(); } catch (e) {} }
  } catch (e) { err(e, 'prune'); }
 }
 function teamIds() {
  const s = reg();
  if (!s) return null;
  const tm = SZ_REG[s];
  const ids = (tm && tm.roster || []).filter(id => PP(id));
  if (!ids.length) return null;
  return ids.slice().sort((a, b) => curOvr14(b) - curOvr14(a) || (a < b ? -1 : 1));
 }

 // ---------- lobby plumbing: while the FRANCHISE page is up, the locker room shows the franchise team ----------
 const wrapG = (name, fn) => {
  const f0 = Wn[name];
  if (typeof f0 !== 'function') return;
  Wn[name] = function () {
   if (!here()) return f0.apply(this, arguments);
   try { return fn.call(this, f0, arguments); } catch (e) { err(e, name); return f0.apply(this, arguments); }
  };
 };
 wrapG('lobbyTeam', (f0, a) => reg());
 wrapG('lobbyIds', (f0, a) => {
  try { if (V28c()) return f0.apply(this, a); } catch (e) {}
  return teamIds();
 });
 wrapG('lobbySrc', (f0, a) => 'real');
 wrapG('homeQuick16', (f0, a) => !!reg());
 wrapG('qTeam16', (f0, a) => reg());
 wrapG('qsz286', (f0, a) => false);
 wrapG('homeWorld', (f0, a) => false);
 function V28c() { try { return scr() === 'card28'; } catch (e) { return false; } }
 if (Wn.V29R && typeof V29R.wq === 'function') {
  const wq0 = V29R.wq;
  V29R.wq = function () { if (here()) return false; return wq0.apply(this, arguments); };
 }

 // ---------- the buttons ----------
 const say = s => { try { menuMsg = { s: s, t: 2.2 }; SFX.bad && SFX.bad(); } catch (e) {} };
 function playFn() {
  V.plays++;
  V.last = 'play';
  try { lobby.card = null; } catch (e) {}
  try { if (Wn.V17 && V17.trayClose) V17.trayClose(); } catch (e) {}
  FM460U.open('start');      // the Franchise Mode panel, exactly as the old button opened it
 }
 function pmFn() {
  V.last = 'pm';
  const s = reg();
  M37.pmTeam = s ? { tid: s, src: 'real' } : null;
  openPlaymaker('menu');
  try { if (typeof PM !== 'undefined' && PM && PM.origin === 'menu') PM.t37 = M37.pmTeam; } catch (e) {}
 }
 function prFn() {
  V.last = 'prac';
  try { M37.pracFirst && M37.pracFirst(); } catch (e) {}
  if (Wn.PRAC18) PRAC18.open();
 }
 function enter() {
  V.n++;
  try { lobby.card = null; } catch (e) {}
  try { if (Wn.V17 && V17.trayClose) V17.trayClose(); } catch (e) {}
  M37.go(PG);
  regAt = 0; regKey = '';
  reg();
 }
 V.enter = enter; V.play = playFn;
 function rows() {
  const has = !!fm();
  return [ [ { label: has ? 'PLAY FRANCHISE' : 'START FRANCHISE', fn: playFn, bg: '#ffb14d', big: true, sc: 2, m37: 'main', h37: 30, fr525: 1 } ],
   [ { label: 'PLAYMAKER', fn: pmFn, big: true, sc: 2, bg: '#ff9a4a', m37: 1, h37: 18, fr525: 1 } ],
   [ { label: 'PRACTICE', fn: prFn, big: true, sc: 2, bg: '#ff5ad2', m37: 1, h37: 18, fr525: 1 } ],
   [ { label: 'BACK', fn: () => { try { lobby.card = null; } catch (e) {} M37.go('play'); }, bg: '#c9d6d9', m37: 'back', h37: 15, fr525: 1 } ] ];
 }
 const MB0 = Wn.menuBars;
 Wn.menuBars = function () {
  if (off()) return MB0.apply(this, arguments);
  if (M37.page === PG) {
   try { if (typeof tutGate !== 'undefined' && tutGate) return MB0.apply(this, arguments); } catch (e) {}
   try { return rows(); } catch (e) { err(e, 'rows'); M37.page = 'play'; return MB0.apply(this, arguments); }
  }
  const r = MB0.apply(this, arguments);
  try {
   if (M37.page === 'play' && Array.isArray(r)) for (const row of r) for (let i = 0; row && i < row.length; i++) {
    const e = row[i];
    if (e && e.m37 && (e.label === 'FRANCHISE TEAM' || e.label === 'FRANCHISE MODE') && !e.fr525) row[i] = Object.assign({}, e, { fn: enter, fr525in: 1 });
   }
  } catch (e) { err(e, 'entry'); }
  return r;
 };
 const MBar0 = Wn.menuBar;
 Wn.menuBar = function (b, live) {
  if (!off() && b && b.fr525 && b.first37) try {
   const lb = lobbyBounds(), cx = Math.round(lb.bx + lb.bw / 2);
   text('FRANCHISE', cx, 22, 1, '#ffe14d', 'center', '#000');
  } catch (e) {}
  return MBar0.apply(this, arguments);
 };

 // ---------- no franchise yet: gray locker room sign + locked card ----------
 const DLL0 = Wn.drawLobbyLeftIn;
 if (typeof DLL0 === 'function') Wn.drawLobbyLeftIn = function (L) {
  const r = DLL0.apply(this, arguments);
  if (here() && !reg()) try {
   const s = 'NO FRANCHISE TEAM YET', sw = Math.min(L - 124, textW(s, 1) + 10);
   rect(Math.round(L / 2 - sw / 2), 3, sw, 10, '#05080b');
   text(s.slice(0, Math.floor((sw - 6) / 4)), L / 2, 5, 1, '#aab3ba', 'center');
  } catch (e) { err(e, 'sign'); }
  return r;
 };
 const DLC0 = Wn.drawLobbyCard;
 if (typeof DLC0 === 'function') Wn.drawLobbyCard = function () {
  const c = (() => { try { return lobby.card; } catch (e) { return null; } })();
  if (!(here() && c && c.kind === 'locked' && !reg())) return DLC0.apply(this, arguments);
  try {
   const w = 190, h = 92, x = Math.round(W / 2 - w / 2), y = Math.round(H / 2 - h / 2);
   hit('LOCKED CARD BLOCK', 0, 0, W, H, () => {}, 'LOCKED CARD BLOCK');
   rect(x - 2, y - 2, w + 4, h + 4, '#000');
   rect(x, y, w, h, '#14222c');
   rect(x, y, w, 14, '#ffd23a');
   text('NO FRANCHISE TEAM YET', x + w / 2, y + 4, 1, '#0b1a20', 'center');
   lobbyLock(x + w / 2, y + 20, 2);
   text('START A FRANCHISE TO FILL YOUR', x + w / 2, y + 42, 1, '#cfe', 'center');
   text('LOCKER ROOM WITH YOUR TEAM', x + w / 2, y + 50, 1, '#cfe', 'center');
   button('START FRANCHISE', x + 8, y + 62, w - 70, 20, () => { lobby.card = null; playFn(); }, { bg: '#ffd23a' });
   button('NOT NOW', x + w - 58, y + 62, 50, 20, () => { lobby.card = null; }, { bg: '#c9d6d9' });
  } catch (e) { err(e, 'lockcard'); return DLC0.apply(this, arguments); }
 };

 // off the FRANCHISE page, the gear system's match-team pointer never stays on the franchise box
 if (Wn.V17 && typeof V17.drawHome === 'function' && typeof V17.mteam === 'function') {
  const DH0 = V17.drawHome;
  V17.drawHome = function () {
   try { if (!here() && V17.mteam() === SLOT && scr() !== 'gear17') V17.setMTeam(null); } catch (e) {}
   return DH0.apply(this, arguments);
  };
 }

 // ---------- franchise games: the lobby's items go on the franchise team ----------
 function loadout(tm) {
  if (!Wn.V17 || !V17.tequip || typeof Wn.myLoadout !== 'function') return null;
  const box = V17.tequip()[SLOT];
  if (!box || typeof box !== 'object' || !Object.keys(box).length) return null;
  const m0 = V17.mteam ? V17.mteam() : null;
  try {
   V17.setMTeam(SLOT);
   const m = Wn.myLoadout(tm.roster.slice(), 'match');
   if (!m || !(Object.keys(m.gear || {}).length || Object.keys(m.cel || {}).length)) return null;
   return { gear: m.gear || {}, crew: {}, cel: m.cel || {}, f: +m.f || .25, v525: 1 };
  } finally {
   try { V17.setMTeam(m0); } catch (e) {}
  }
 }
 const NG0 = Wn.newGame;
 if (typeof NG0 === 'function') Wn.newGame = function (a, b, mode) {
  if (!off() && a === SLOT && mode === 'career') try {
   const tm = SZ_REG[SLOT];
   if (tm && tm.fm460 && Array.isArray(tm.roster)) {
    const g = loadout(tm);
    if (g) { tm.g17 = g; V.gearN = Object.keys(g.gear).length; } else { delete tm.g17; V.gearN = 0; }
   }
  } catch (e) { err(e, 'newGame'); }
  return NG0.apply(this, arguments);
 };
})();
