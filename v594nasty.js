/* v594nasty.js - Bagga Lax 1.5c: EVERY ONLINE GAME IS NASTY (Charlie)
 * Ask: ranked, online season, Play a Friend, the CPU takeover after a disconnect and ranked CPU matches all play on the
 *   game's NASTY difficulty. The host can't send anything else; both phones always use NASTY. Offline modes unchanged.
 * Cause: online games took the host's own difficulty (lobby settings.diff, default FISH), ranked CPU games FISH / BEGINNER.
 *   (Side effect: below GROSS there are no crease fakes, online included - that is why Charlie saw no fakes online.)
 * Fix: newGame() is wrapped: any online game (meta.online) or Locker League game (meta.ll15) starts with SETTINGS.diff =
 *   NASTY on this phone, whatever the lobby says (the net layer already restores the player's own offline level after the game;
 *   the LL CPU game restores LL.savedDiff). The online lobby's difficulty row can't be tapped and shows "LEVEL: NASTY"; the host
 *   also writes diff NASTY into the room settings so both screens read the same. No new message, no protocol change.
 * Kill switch: window.__rl_no594nasty
 */
(function () {
 const Wn = window, NASTY = 4;
 const off = () => !!Wn.__rl_no594nasty;
 const ng0 = Wn.newGame;
 if (typeof ng0 === 'function') Wn.newGame = function (user, opp, mode, home, meta) {
  try { if (!off() && meta && (meta.online || meta.ll15) && !meta.tutorial) { SETTINGS.diff = NASTY; applyDiff(); } } catch (e) {}
  const r = ng0.apply(this, arguments);
  try { if (!off() && meta && (meta.online || meta.ll15) && typeof game !== 'undefined' && game) { game.diff = NASTY; if (SETTINGS.diff !== NASTY) { SETTINGS.diff = NASTY; applyDiff(); } } } catch (e) {}
  return r;
 };
 // the online lobby: no difficulty choice
 const isDiff = k => { try { return typeof DIFF_NAMES !== 'undefined' && DIFF_NAMES.indexOf(k) >= 0; } catch (e) { return false; } };
 let box = null;
 const hit0 = Wn.hit;
 if (typeof hit0 === 'function') Wn.hit = function (key, x, y, w, h) {
  try { if (!off() && typeof screen !== 'undefined' && screen === 'onLobby' && isDiff(key)) { box = box ? { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x + w), y1: Math.max(box.y1, y + h) } : { x0: x, y0: y, x1: x + w, y1: y + h }; return; } } catch (e) {}
  return hit0.apply(this, arguments);
 };
 const r0 = Wn.render;
 if (typeof r0 === 'function') Wn.render = function () {
  box = null;
  const r = r0.apply(this, arguments);
  try {
   if (!off() && screen === 'onLobby' && box) {
    const b = box, w = b.x1 - b.x0, h = b.y1 - b.y0;
    rect(b.x0, b.y0, w, h, '#14222c'); rect(b.x0, b.y0, w, 1, '#ff8a5a'); rect(b.x0, b.y1 - 1, w, 1, '#ff8a5a');
    text('LEVEL: NASTY', b.x0 + w / 2, b.y0 + Math.max(1, Math.round(h / 2) - 6), 1, '#ff8a5a', 'center');
    textMini('EVERY ONLINE GAME IS NASTY', b.x0 + w / 2, b.y0 + Math.max(7, Math.round(h / 2) + 1), '#cfe');
   }
  } catch (e) {}
  return r;
 };
 // the host keeps the room on NASTY (so the settings line + any older code read the same level)
 setInterval(() => {
  try {
   const N = Wn.RLNET; if (off() || !N || N.inGame || N.side !== 'h' || !N.lobby || !N.lobby.state || !N.lobby.state.settings) return;
   const s = N.lobby.state.settings; if (s.diff === NASTY) return;
   const nv = Object.assign({}, s, { diff: NASTY }); N.hostSet = nv; N.hostSetT = performance.now(); N.lobby.state.settings = nv;
   N.patchLobby({ settings: nv, sseq: Date.now() });
  } catch (e) {}
 }, 1000);
 Wn.V594 = { NASTY: NASTY };
 // 1.5e (Charlie): during an ONLINE game (ranked, bot, bot offer, CPU takeover, online season, Play a Friend) every difficulty
 // label reads ONLINE (pregame LEVEL:, HUD, pause, results) - the game still plays NASTY. DIFF_NAMES is swapped while the game runs.
 let swapped = null;
 setInterval(() => { try {
  const G = typeof game !== 'undefined' ? game : null, on = !off() && !Wn.__rl_no597lbl && G && G.meta && (G.meta.online || G.meta.ll15) && !G.meta.tutorial;
  if (on && !swapped && typeof DIFF_NAMES !== 'undefined') { swapped = DIFF_NAMES.slice(); for (let i = 0; i < DIFF_NAMES.length; i++) DIFF_NAMES[i] = 'ONLINE'; }
  else if (!on && swapped) { for (let i = 0; i < swapped.length; i++) DIFF_NAMES[i] = swapped[i]; swapped = null; }
 } catch (e) {} }, 100);
})();
