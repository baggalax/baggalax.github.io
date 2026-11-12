/* v511fakeset.js - BAGGA LAX 1.3: FAKES ON / OFF.
 * Charlie (Nov 11, 7:43 PM): "make fakes a setting that can be turned on or off if it's turned off then not faking doesn't
 *  affect the goalie so crease shots will just almost always go in. In online games it needs to be marked yes or no for fakes
 *  same with before a season." (7:43 PM) "Make sure it looks neat no settings overlapping buttons or anything."
 * 1) SETTINGS: a FAKES: ON / OFF toggle (new key rl_fakes511, default ON) in the right-hand column under CHIRPS, sharing the
 *    space of the CONTROLS button (CONTROLS keeps its spot, just half as tall). OFF = no FAKE button, v507's crease roll is
 *    skipped entirely, and crease finishes almost always go in (K.offConv below: the game's own finish measured only
 *    61-72 % on GROSS+, so 70 % of its would-be saves go in -> ~88-92 %). Quick games + practice use it.
 * 2) SEASONS (season / college / world games / ultimate): after the season's difficulty (and the item / 2-pointer questions)
 *    one more YES / NO box: FAKES THIS SEASON? The answer is saved with that season (fk511 on the season save, like
 *    diff2503 / q333) and its games use it; the settings toggle can't change it mid-season. A season started before this
 *    file has no answer saved and follows the settings toggle.
 * 3) ONLINE: the lobby shows a FAKES row to both players once the friend is in (the host sets it, the guest sees it). Online games never had
 *    fakes (v507 skips them) and still don't: YES shows greyed "COMING SOON" (ONLINE_READY below). The flag would ride inside
 *    the lobby's existing settings object as an optional field fk511:1 (like V28's st28); no message shape changes; a lobby
 *    without the field = fakes OFF.
 * How it switches v507 (and v510's practice copy) off: v507 reads its kill switch window.__rl_no507fake live on every check,
 *    so this file sets it each frame from the rule above (and leaves it on for good if it was set at boot).
 * Kill switch: window.__rl_no511fs = true -> exactly as before (fakes always on where v507 puts them).
 */
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_no511fs || W0.__rl_v124gb) return;
 const KILL0 = !!W0.__rl_no507fake;   // v507 killed at boot: stays killed
 const KEY = 'fakes511';
 const ONLINE_READY = false;          // online fakes not built yet (see the report): YES stays greyed
 const LOG = { asks: [], sets: [], errs: [] };
 const err = (e, w) => { try { if (LOG.errs.length < 10) { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v511fakeset', w, e); } } catch (x) {} };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 function globalOn() { try { return LS.get(KEY, true) !== false; } catch (e) { return true; } }
 function setGlobal(v) { try { LS.set(KEY, !!v); LOG.sets.push([ 'global', !!v ]); } catch (e) { err(e, 'set'); } }
 // ---------------- which season a game belongs to ----------------
 function compOf(kind) {
  try {
   if (kind === 'season') return typeof season !== 'undefined' && season && !season.online ? season : null;
   if (kind === 'world') return typeof wgame !== 'undefined' ? wgame : null;
   if (kind === 'college') return W0.COL25 && COL25.cur ? COL25.cur() : null;
   if (kind === 'ult') return W0.COL25 && COL25.ucur ? COL25.ucur() : null;
  } catch (e) {}
  return null;
 }
 function saveComp(kind) {
  try { if (kind === 'season') LS.set('season', season); else if (kind === 'world') wgSave16(); else if (W0.COL25 && COL25.save) COL25.save(); } catch (e) { err(e, 'save'); }
 }
 function compForGame(G) {
  try {
   if (!G || G.online || G.meta && G.meta.online) return null;
   if (G.practice) return G.practice.season && typeof season !== 'undefined' && season && !season.online ? season : null;
   if (G.mode === 'season' || G.mode === 'world' || G.mode === 'college') {
    if (W0.V333 && V333.compFor) return V333.compFor(G.mode, G.meta);
    if (G.mode === 'season') return compOf('season');
    if (G.mode === 'world') return compOf('world');
   }
  } catch (e) {}
  return null;
 }
 function lobbyFk(st) { return !!(ONLINE_READY && st && st.settings && st.settings.fk511 === 1); }
 function online(G) { return !!(G && (G.online || G.meta && G.meta.online)) || !!(W0.RLNET && RLNET.inGame); }
 // the rule: does this game have fakes?
 function fakesOn(G) {
  if (!G) return globalOn();
  if (G.practice && G.practice.fake507) return true;   // the mandatory fake tutorial always has them
  if (online(G)) return lobbyFk(W0.RLNET && RLNET.st);   // (v507 skips online games anyway)
  const C = compForGame(G);
  if (C && typeof C.fk511 === 'boolean') return C.fk511;
  return globalOn();
 }
 function why(G) {
  if (!G) return 'menu';
  if (G.practice && G.practice.fake507) return 'tutorial';
  if (online(G)) return 'online';
  const C = compForGame(G);
  return C && typeof C.fk511 === 'boolean' ? 'season' : 'setting';
 }
 let lastSet = null;
 function sync() {
  const v = KILL0 || !fakesOn(G0());
  if (W0.__rl_no507fake !== v) W0.__rl_no507fake = v;
  lastSet = v;
 }
 sync();

 // ---------------- fakes OFF: crease finishes almost always go in ----------------
 // Measured (Nov 11, 300 crease finishes per level, v507 off = the game's own pre-1.3 crease finish): 72 % GROSS, 68 % NASTY,
 // 61 % BAGGATWAAN go in - not "almost always". So with fakes OFF this share of the would-be saves on a crease finish
 // (any shot released while the 4 yellow crease circles are up, offline) goes in too -> about 92 / 90 / 88 %.
 // The goalie is never made to save; a shot that rolls "no" just plays out as the game's own finish.
 const K = { offConv: .70 };
 const SH = W0.SHOT26;
 function circOn() { try { return SCR() === 'live' && canShoot() && !SH.S.aim && SH.circlesOn() && SH.inTap(); } catch (e) { return false; } }
 function offOk(G) { return !!G && !online(G) && !G.tutorial && !G.brave && !(G.practice && G.practice.fake507) && !fakesOn(G); }
 const ROLLS = [];
 if (SH && typeof W0.releaseShot === 'function') {
  const RS0 = W0.releaseShot;
  W0.releaseShot = function () {
   let pre = null;
   try { const G = G0(), c = G && G.carrier; if (c && c.team === 'O' && offOk(G) && circOn()) pre = { c: c, done: false }; } catch (e) { err(e, 'pre'); }
   const r = RS0.apply(this, arguments);
   try { const b = G0() && game.ball; if (pre && b && b.state === 'shot' && b.shooter === pre.c && !b.f507 && !b.f510) b.f511 = pre; } catch (e) { err(e, 'rel'); }
   return r;
  };
 }
 function settle(G) {
  const b = G.ball, P = b.f511;
  if (!P || P.done) return;
  P.done = true;
  const roll = Math.random(), goal = roll < K.offConv;
  P.goal = goal;
  if (goal) {
   const gk = G.goalie, s = b.s25;
   const ty0 = b.target && typeof b.target.y === 'number' ? b.target.y : b.y + b.vy * (GX - b.x) / Math.max(1, b.vx);
   const top = ty0 < CY, ty = CY + (top ? -1 : 1) * Math.min(Math.max(Math.abs(ty0 - CY), 2), MOUTH - 2);
   if (s) { s.own = false; s.read = false; s.reach = null; }
   b.block = null; b.pipe = null; b.aim14 = null;
   if (gk) { gk.reach = .001; gk.react = 9; }
   const sp = Math.hypot(b.vx, b.vy) || 200, a = Math.atan2(ty - b.y, GX - b.x);
   b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
   b.v452 = true;
  }
  ROLLS.push({ roll: +roll.toFixed(3), goal: goal, lv: (function () { try { return DF.level; } catch (e) { return null; } })() });
  if (ROLLS.length > 60) ROLLS.shift();
 }
 function hold(G) {
  const b = G.ball, P = b && b.f511;
  if (!P || !P.goal || b.state !== 'shot') return;
  const gk = G.goalie;
  if (gk) { gk.reach = .001; gk.react = 9; }
  b.aim14 = null; if (b.s25) b.s25.own = false;
 }
 const ST0 = W0.step;
 if (typeof ST0 === 'function') W0.step = function () {
  try { sync(); const G = G0(); if (G && G.ball && G.ball.f511 && G.ball.state === 'shot') { settle(G); hold(G); } } catch (e) { err(e, 'step'); }
  return ST0.apply(this, arguments);
 };

 // ---------------- 1) the settings toggle ----------------
 function lockLabel() {
  const G = G0();
  if (!G) return null;
  if (online(G)) return 'FAKES: ' + (fakesOn(G) ? 'YES' : 'NO') + ' (ONLINE)';
  const C = compForGame(G);
  return C && typeof C.fk511 === 'boolean' ? 'FAKES: ' + (C.fk511 ? 'YES' : 'NO') + ' (SEASON)' : null;
 }
 const SETL = { drawn: 0, at: null, skip: 0 };
 const DS0 = W0.drawSettings;
 if (typeof DS0 === 'function') W0.drawSettings = function (inGame) {
  const B0 = W0.button;
  let ctl = null;
  W0.button = function (label, x, y, w, h) {
   if (String(label) === 'CONTROLS' && h >= 18 && !ctl) {
    // where button() would really put the full-height CONTROLS (it lifts bottom rows above the iPhone home bar), so the two
    // halves stack inside exactly that box and neither gets lifted again
    let yf = y;
    try { if (typeof SA2403B === 'undefined' || !SA2403B) yf = y - sa2403Dy(y, h + 2); } catch (e) {}
    ctl = { x: x, y: yf, w: w, h: h };
    const a = Array.from(arguments), h1 = Math.floor((h - 2) / 2);
    a[2] = yf; a[4] = h1;
    return B0.apply(this, a);
   }
   return B0.apply(this, arguments);
  };
  let r;
  try { r = DS0.apply(this, arguments); } finally { W0.button = B0; }
  try {
   if (ctl) {
    const h1 = Math.floor((ctl.h - 2) / 2), y2 = ctl.y + h1 + 2, h2 = ctl.h - h1 - 2;
    const lk = inGame ? lockLabel() : null, on = globalOn();
    if (lk) button(lk, ctl.x, y2, ctl.w, h2, () => { try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: '#5a6670', fg: '#cfe', fit: true });
    else button('FAKES: ' + (on ? 'ON' : 'OFF'), ctl.x, y2, ctl.w, h2, () => { setGlobal(!on); sync(); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: on ? '#7dff7a' : '#3a4a55', fg: on ? '#0b1a20' : '#cfe', fit: true });
    SETL.drawn++; SETL.at = { x: ctl.x, y: y2, w: ctl.w, h: h2 };
   } else SETL.skip++;
  } catch (e) { err(e, 'setdraw'); }
  return r;
 };

 // ---------------- 2) seasons: FAKES THIS SEASON? ----------------
 function askBox(title, sub, def, onPick) {
  const old = document.getElementById('ask511'); if (old) old.remove();
  const d = document.createElement('div');
  d.id = 'ask511';
  d.style.cssText = 'position:fixed;inset:0;z-index:87;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ffcc33;box-shadow:0 3px 0 #000;padding:8px 12px 10px;max-width:92%;text-align:center;box-sizing:border-box';
  const h = document.createElement('div'); h.textContent = title; h.style.cssText = 'color:#ffcc33;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:3px'; box.appendChild(h);
  const s = document.createElement('div'); s.textContent = sub; s.style.cssText = 'color:#cfe;font-size:10px;margin-bottom:8px'; box.appendChild(s);
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:10px;justify-content:center';
  for (const [lab, v] of [ [ 'YES', true ], [ 'NO', false ] ]) {
   const b = document.createElement('button');
   b.id = 'ask511' + (v ? 'y' : 'n'); b.type = 'button'; b.textContent = lab;
   b.style.cssText = 'font:inherit;font-size:13px;min-width:92px;padding:8px 10px;border:0;border-radius:0;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;' + (v === def ? 'background:#ffd23a;color:#0b1a20' : 'background:#3a4a55;color:#cfe');
   b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); d.remove(); try { SFX.tap && SFX.tap(); } catch (e) {} onPick(v); });
   row.appendChild(b);
  }
  box.appendChild(row); d.appendChild(box); document.body.appendChild(d);
  return d;
 }
 function askSeason(kind) {
  const run = kind === 'world' || kind === 'ult', w = run ? 'RUN' : 'SEASON';
  const nm = { season: 'SEASON', college: 'COLLEGE SEASON', world: 'WORLD GAMES RUN', ult: 'ULTIMATE RUN' }[kind] || 'SEASON';
  const C0 = compOf(kind);
  if (!C0) return;
  const fin = v => {
   try {
    const C = compOf(kind);
    if (!C || C !== C0) return;   // a different season by now: leave it alone
    C.fk511 = !!v; saveComp(kind); LOG.asks.push([ kind, !!v ]); sync();
   } catch (e) { err(e, 'attach'); }
  };
  if (W0.__rl_df2503auto) return fin(globalOn());
  askBox('FAKES THIS ' + w + '?', 'FOR YOUR WHOLE ' + nm + '. YES = FAKE BUTTON ON CREASE (GROSS AND UP). NO = NO FAKES, CREASE SHOTS ALMOST ALWAYS GO IN.', globalOn(), fin);
 }
 function hookAsk() {
  const A0 = W0.ask2503;
  if (typeof A0 !== 'function' || A0.__a511) return;
  W0.ask2503 = function (kind, go) {
   return A0.call(this, kind, function (lv) {
    const r = go.apply(this, arguments);   // the season is made (and v333's questions stored) first, then this one
    try { if (compOf(kind)) setTimeout(() => askSeason(kind), 0); } catch (e) { err(e, 'ask'); }
    return r;
   });
  };
  for (const k of Object.keys(A0)) try { W0.ask2503[k] = A0[k]; } catch (e) {}
  W0.ask2503.__a511 = true;
 }
 try { hookAsk(); } catch (e) { err(e, 'hook'); }

 // ---------------- 3) online lobby ----------------
 const LOB = { drawn: 0, at: null };
 function setLobbyFk(v) {
  try {
   const N = RLNET, L = N.lobby; if (!ONLINE_READY || !L || N.side !== 'h') return;
   const S0 = Object.assign({}, L.state && L.state.settings || {});
   if (v) S0.fk511 = 1; else delete S0.fk511;
   N.sseq = Math.max(Date.now(), (N.sseq || 0) + 1);
   N.hostSet = S0; N.hostSetT = performance.now();
   N.patchLobby({ settings: S0, sseq: N.sseq });
   L.state.settings = S0; L.state.hready = false; L.state.gready = false;
  } catch (e) { err(e, 'lobset'); }
 }
 function drawLobbyRow() {
  const N = W0.RLNET, L = N && N.lobby;
  if (SCR() !== 'onLobby' || !L || N.inGame) return;
  const st = L.state || {};
  if (st.season) return;                                     // online seasons: home team's rules, no fakes online
  const onInv = N.on2312 && N.on2312();
  if (!onInv || !L.hasGuest) return;                         // the top band holds the invite button / the code then
  const host = N.side === 'h', x0 = 106, gw = W - 2 * x0, y = 23, h = 9;
  if (gw < 70) return;
  const on = lobbyFk(st), w1 = Math.floor((gw - 3) / 2), w2 = gw - w1 - 3;
  const pick = (opts, w) => opts.find(s => textW(s, 1) <= w - 4) || opts[opts.length - 1];   // never wider than its button
  if (host) {
   button(pick([ 'FAKES: NO', 'NO' ], w1), x0, y, w1, h, () => { setLobbyFk(false); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: !on ? '#ffd23a' : '#3a4a55', fg: !on ? '#0b1a20' : '#cfe', fit: true });
   if (ONLINE_READY) button(pick([ 'FAKES: YES', 'YES' ], w2), x0 + w1 + 3, y, w2, h, () => { setLobbyFk(true); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: on ? '#7dff7a' : '#3a4a55', fg: on ? '#0b1a20' : '#cfe', fit: true });
   else {
    const soon = performance.now() - (LOB.soonT || -1e9) < 1600;   // a tap answers on the button itself (no banner over the lobby)
    button(soon ? pick([ 'ONLINE FAKES: SOON', 'COMING SOON', 'SOON!' ], w2) : pick([ 'YES - COMING SOON', 'YES - SOON', 'SOON' ], w2), x0 + w1 + 3, y, w2, h, () => { LOB.soonT = performance.now(); try { SFX.tap && SFX.tap(); } catch (e) {} }, { bg: soon ? '#5a6670' : 'rgba(40,52,62,.6)', fg: soon ? '#ffe14d' : '#6c7f8a', fit: true });
   }
  } else {
   const lab = pick([ 'FAKES: ' + (on ? 'YES' : 'NO') + ' (HOME SETS IT)', 'FAKES: ' + (on ? 'YES' : 'NO') + ' (HOME)', 'FAKES: ' + (on ? 'YES' : 'NO') ], gw);
   rect(x0, y, gw, h, on ? '#7dff7a' : '#ffd23a');
   if (textW(lab, 1) > gw - 2) textMini(lab, x0 + gw / 2, y + 3, '#0b1a20'); else text(lab, x0 + gw / 2, y + 2, 1, '#0b1a20', 'center');
  }
  LOB.drawn++; LOB.at = { x: x0, y: y, w: gw, h: h, host: host };
 }
 const RD0 = W0.render;
 if (typeof RD0 === 'function') W0.render = function () {
  try { sync(); } catch (e) { err(e, 'sync2'); }
  const r = RD0.apply(this, arguments);
  if (SCR() === 'onLobby') {
   g.save();
   try { g.setTransform(RR, 0, 0, RR, 0, 0); g.globalAlpha = 1; drawLobbyRow(); } catch (e) { err(e, 'lobdraw'); } finally { g.restore(); }
  }
  return r;
 };

 W0.V511FS = {
  KEY: KEY, ONLINE_READY: ONLINE_READY, LOG: LOG, SETL: SETL, LOB: LOB,
  on: globalOn, set: v => { setGlobal(v); sync(); }, fakesOn: fakesOn, why: why, sync: sync, compForGame: compForGame,
  askSeason: askSeason, lobbyFk: lobbyFk, K: K, ROLLS: ROLLS, get flag() { return lastSet; }
 };
})();
