/* v592ff.js - Bagga Lax 1.5c: ONLINE FORFEIT + DISCONNECT -> CPU TAKES OVER
 * Bug/ask (Charlie): leaving an online game ended it with "NO RESULT" for both, so quitting dodged losses; no forfeit.
 * Fix:
 *  1 FORFEIT in the online pause menu (new button style, in-page confirm). Forfeiter = full loss (rewards of a loss),
 *    opponent = full win. Wire: no new message type. The forfeiter first marks the existing lobby field [me]szn with an
 *    extra member rk15ff (same trick as rk15u), then sends the existing 'leave' message. The other phone reads the room
 *    state when 'leave' arrives: rk15ff = forfeit win, otherwise = the player left.
 *  2 LEFT / DISCONNECTED (leave message, or ~12 s with no packets): the game goes on for the player still in. The
 *    leaver's team stays exactly as it was (players, uniform, items, score, clock); the CPU plays it on NASTY (online level). If the
 *    play was running on the other phone, it restarts with a faceoff. Banner: OPPONENT LEFT - CPU TAKING OVER.
 *    Win = full win rewards. Loss / tie vs the CPU = nothing (no loss, no rank change).
 *  3 Ranked (Locker League): results go to the server with new optional flags (ff / oppff / cpu / gone). A match left
 *    unfinished is remembered (rl_rk15pend) and reported as "gone" (forfeit loss) on the next launch. The server
 *    decides each match once, whoever reports first.
 * Online season games keep their own flow (their result lives in the season schedule) - not changed here.
 * Kill switch: window.__rl_no592ff
 */
(function () {
 const Wn = window, off = () => !!Wn.__rl_no592ff || !Wn.RLNET;
 const N = () => Wn.RLNET;
 const fail = (w, e) => { try { (Wn.__rk15err = Wn.__rk15err || []).push('ff ' + w + ': ' + (e && e.message || e)); } catch (x) {} };
 const DC_MS = 12e3;
 const PK = 'rl_rk15pend';
 const season = () => { try { return !!(N().st && N().st.season); } catch (e) { return false; } };
 const live = () => { const n = N(); return !!(n && n.inGame && typeof game !== 'undefined' && game && screen !== 'final' && !season()); };
 const nonce = () => { const n = N(); let s = String(n.code || '') + '|' + JSON.stringify(n.st && n.st.start || '') + '|' + (n.st && n.st.sseq || ''), h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
 const BTN = (x, y, w, h, bg, label) => { try { if (Wn.RK15 && RK15.btn) return RK15.btn(x, y, w, h, bg, label); } catch (e) {} rect(x, y, w, h, bg); text(label, x + w / 2, y + Math.round((h - 5) / 2), 1, '#0b1a20', 'center'); };
 // ---------- results ----------
 function endWith(G, iWin) { // finish the game now with this winner (the loser keeps their goals; the winner gets one more if needed)
  try {
   if (iWin && G.score[0] <= G.score[1]) G.score[0] = G.score[1] + 1;
   if (!iWin && G.score[1] <= G.score[0]) G.score[1] = G.score[0] + 1;
   G.clock = 0; finishGame();
  } catch (e) { fail('end', e); }
 }
 // ---------- 1: FORFEIT ----------
 let ask = false;
 async function forfeit() {
  const n = N(), G = game; if (!live() || G.ff15) return;
  G.ff15 = 'me'; ask = false; n.quitAsk = false;
  try { const me = n.side === 'h' ? 'h' : 'g', st = n.lobby && n.lobby.state || {}, nv = Object.assign({}, st[me + 'szn'] || {}, { rk15ff: nonce() }); st[me + 'szn'] = nv; await Promise.race([n.patchLobby({ [me + 'szn']: nv }), new Promise(r => setTimeout(r, 2500))]); } catch (e) { fail('mark', e); }
  try { n.link && n.link.send({ t: 'leave' }); } catch (e) {}
  endWith(G, false);
 }
 // ---------- 2: LEFT / DISCONNECTED ----------
 let restore = null, bannerT = 0;
 function takeover(why) {
  const n = N(), G = game; if (!live() || G.cpu15 || G.ff15) return;
  const keep = Object.assign({}, SETTINGS), saved = n.savedSettings ? Object.assign({}, n.savedSettings) : null, mid = n.st && n.st.ll15 || null, netview = screen === 'netview' || !n.auth;
  try { n.endOnlineGame(); } catch (e) { fail('endOnline', e); }
  Object.assign(SETTINGS, keep); SETTINGS.diff = 4; try { applyDiff(); } catch (e) {} // same match settings; online is always NASTY (v594)
  restore = { G: G, set: saved };
  G.online = false; G.cpu15 = { why: why, t: Date.now() };
  if (mid) G.meta = Object.assign({}, G.meta || {}, { ll15: { mid: mid, pvp: 1 } }); // ranked: still reported (as cpu)
  try { n.view = null; } catch (e) {}
  if (netview || !/^(play|faceoff|banner|defense|cpu|qbreak|pregame|timeout|lineup|playbook|playmaker)$/.test(screen)) { try { startFaceoff(true); } catch (e) { fail('fo', e); } }
  bannerT = Date.now();
  setTimeout(() => { try { if (N().code && game === G) { const sc = screen; N().leave(); screen = sc; } } catch (e) {} }, 400); // close the room; N.leave() would jump to the ONLINE screen
 }
 function onLeave() {
  const n = N(), G = game, o = n.side === 'h' ? 'g' : 'h', code = n.code, want = nonce();
  let done = false; const go = ff => { if (done || game !== G) return; done = true; if (ff) { G.ff15 = 'opp'; try { n.quitAsk = false; } catch (e) {} endWith(G, true); } else takeover('left'); };
  Promise.resolve(n.call('/room/' + code + '/state')).then(r => { const d = r && r.state && r.state[o + 'szn']; go(!!(d && d.rk15ff === want)); }).catch(() => go(false));
  setTimeout(() => go(false), 2500);
 }
 function hookLink() {
  const n = N(), L = n && n.link; if (!L || typeof L.onEvent !== 'function' || L.onEvent.__ff592) return;
  const o = L.onEvent, f = function (e) { try { if (!off() && e && e.t === 'leave' && live()) { onLeave(); return; } } catch (x) { fail('leave', x); } return o.apply(this, arguments); };
  f.__ff592 = 1; L.onEvent = f;
 }
 // rewards: a loss / tie vs the CPU after the other player left = nothing recorded
 if (Wn.V17 && typeof V17.gameOver === 'function') { const go0 = V17.gameOver; V17.gameOver = function (G, win) { try { if (!off() && G && G.cpu15 && !win) return; } catch (e) {} return go0.apply(this, arguments); }; }
 // ---------- 3: ranked bookkeeping (a match you never finished = forfeit loss on the next launch) ----------
 const rd = () => { try { return JSON.parse(localStorage.getItem(PK) || 'null'); } catch (e) { return null; } };
 const wr = v => { try { if (v) localStorage.setItem(PK, JSON.stringify(v)); else localStorage.removeItem(PK); } catch (e) {} };
 function curMid() { try { const n = N(), G = typeof game !== 'undefined' ? game : null; if (n && n.inGame && n.st && n.st.ll15) return n.st.ll15; if (G && G.meta && G.meta.ll15 && G.meta.ll15.mid && screen !== 'final' && !G.over) return G.meta.ll15.mid; } catch (e) {} return null; }
 let sentGone = false;
 function pendTick() {
  const m = curMid(), p = rd();
  if (m && (!p || p.mid !== m)) wr({ mid: m, t: Date.now() });
  if (!m && p && !sentGone && Wn.RK15 && RK15.signedIn && RK15.signedIn() && Date.now() - (p.t || 0) > 5e3) {
   const G = typeof game !== 'undefined' ? game : null; if (G && G.over) return; // the normal report is on its way
   sentGone = true; Promise.resolve(RK15.call('result', { mid: p.mid, my: 0, opp: 0, gone: 1 }, true)).then(j => { if (j && j.ok && j.st !== 'pending') wr(null); else if (j && j.st === 'pending') wr(Object.assign(p, { sent: 1 })); }).catch(() => {}).then(() => { setTimeout(() => { sentGone = false; }, 6e4); });
  }
 }
 Wn.RK15FF = { clear: mid => { const p = rd(); if (p && (!mid || p.mid === mid)) wr(null); }, takeover: takeover, forfeit: forfeit, DC_MS: DC_MS };
 // ---------- loop ----------
 const st0 = Wn.step;
 if (typeof st0 === 'function') Wn.step = function (dt) {
  try {
   if (!off()) {
    hookLink();
    const n = N();
    if (live() && n.dc && performance.now() - n.dc.t0 > DC_MS) takeover('dc');
   }
  } catch (e) { fail('step', e); }
  return st0.apply(this, arguments);
 };
 setInterval(() => { try { if (off()) return; pendTick(); if (restore && (typeof game === 'undefined' || game !== restore.G)) { if (restore.set) { Object.assign(SETTINGS, restore.set); try { applyDiff(); } catch (e) {} } restore = null; } } catch (e) { fail('tick', e); } }, 1000);
 // ---------- drawing: FORFEIT in the pause overlay + confirm, CPU banner ----------
 const r0 = Wn.render;
 if (typeof r0 === 'function') Wn.render = function () {
  const r = r0.apply(this, arguments);
  try {
   if (off()) return r;
   const n = N(), G = typeof game !== 'undefined' ? game : null;
   if (live() && (n.quitAsk || ask) && !n.dc) { // the confirm replaces the leave overlay (so its buttons are gone too); online never pauses
    if (!ask) { hit('rk15ff', W / 2 - 50, 136, 100, 14, () => { ask = true; n.quitAsk = false; }, 'rk15ff'); BTN(W / 2 - 50, 136, 100, 14, '#ff5a4a', 'FORFEIT'); }
    else {
     rect(0, 0, W, H, 'rgba(5,8,11,.94)');
     text('FORFEIT THIS GAME?', W / 2, 46, 2, '#ff9a8a', 'center', '#000');
     textMini('YOUR OPPONENT GETS THE WIN. YOU TAKE A FULL LOSS.', W / 2, 66, '#e8f4f6');
     hit('rk15ffno', W / 2 - 110, 84, 104, 18, () => { ask = false; }, 'rk15ffno'); BTN(W / 2 - 110, 84, 104, 18, '#7dff7a', 'KEEP PLAYING');
     hit('rk15ffyes', W / 2 + 6, 84, 104, 18, () => forfeit(), 'rk15ffyes'); BTN(W / 2 + 6, 84, 104, 18, '#ff5a4a', 'YES, FORFEIT');
    }
   } else ask = false;
   if (G && G.cpu15 && screen !== 'final' && (Wn.__rl_no74cpu || !(G.meta && G.meta.ll15 && G.meta.ll15.pvp))) { // 1.5 B74: ranked = no sign the CPU took over (Charlie)
    const s = Date.now() - bannerT < 5e3 ? 'OPPONENT LEFT - CPU TAKING OVER' : 'VS CPU - OPPONENT LEFT', w = Math.max(90, s.length * 4 + 10), x = Math.round(W / 2 - w / 2), y = 20;
    rect(x - 1, y - 1, w + 2, 11, '#000'); rect(x, y, w, 9, Date.now() - bannerT < 5e3 ? '#ffd23a' : 'rgba(29,42,53,.85)');
    textMini(s, W / 2, y + 3, Date.now() - bannerT < 5e3 ? '#0b1a20' : '#ffe14d');
   }
  } catch (e) { fail('draw', e); }
  return r;
 };
 // ---------- 1.5e (Charlie): FORFEIT for ONLINE BOT games too (ranked bot / the bot offer). They pause like an offline game, so
 // the pause menu's QUIT TO MENU becomes FORFEIT (tap twice). A forfeit vs a bot = a normal bot loss through the usual result
 // route (finishGame -> the Locker League report), so the half-loss rule applies. Kill switch: window.__rl_no597botff
 let botAsk = false;
 const isBotLL = () => { try { const G = typeof game !== 'undefined' ? game : null; return !!(G && G.meta && G.meta.ll15 && !(N() && N().inGame)); } catch (e) { return false; } };
 const dp0 = Wn.drawPause;
 if (typeof dp0 === 'function') Wn.drawPause = function () {
  if (off() || Wn.__rl_no597botff || !isBotLL()) { botAsk = false; return dp0.apply(this, arguments); }
  const b0 = Wn.button;
  Wn.button = function (label, x, y, w, h, fn, o) {
   if (label === 'QUIT TO MENU') {
    const a = Array.prototype.slice.call(arguments);
    a[0] = botAsk ? 'TAP AGAIN: FORFEIT' : 'FORFEIT';
    a[5] = () => { if (!botAsk) { botAsk = true; return; } botAsk = false; try { paused = false; pauseSet = false; } catch (e) {} const G = game; if (G && !G.__botff597) { G.__botff597 = 1; endWith(G, false); } }; // no ff flag: a normal bot loss (half-loss rule)
    a[6] = Object.assign({}, o || {}, { bg: '#ff5a4a' });
    return b0.apply(this, a);
   }
   return b0.apply(this, arguments);
  };
  try { return dp0.apply(this, arguments); } finally { Wn.button = b0; }
 };
})();

