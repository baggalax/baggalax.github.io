// v437qa.js - V43.7 release QA fixes (offline / vs-CPU only; kill switch: window.__rl_no437qa = true -> exactly today's behaviour).
// Hooks from outside; edits no other file, no storage keys, no net protocol.
// (1) SUB screen (v425sp): a sub you called in a game you then QUIT no longer carries into your next game. The SUB screen's
//     pending list lived for the whole app session, so a DEAD BALL / 2-5-10 SEC sub fired ~15 s into the NEXT game with that
//     team, and a sub that was half-way (guy jogging to the box) stayed "pending" forever, greying both players out on the
//     SUB screen for every later game until the app was restarted. Now: a new game (or quitting to the menu) closes the screen
//     and calls off every sub still pending from the old game.
// (2) PLAYMAKER (v42pd): after START PLAY there is a 1.2 s READY... GO! countdown and a tap on a receiver during it did nothing
//     (no pass, no message), so the first tap often "didn't pass". Now a tap on a receiver during the countdown starts the
//     play right there (GO) and the pass goes.
(function () {
 'use strict';
 const W0 = window;
 if (W0.__rl_v437qa_loaded) return;
 W0.__rl_v437qa_loaded = 1;
 const off = () => !!W0.__rl_no437qa;
 const LOG = W0.QA437 = { purged: 0, games: 0, cdSkip: 0, err: 0, ev: [] };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 100) LOG.ev.shift(); };
 const er = e => { LOG.err++; if (LOG.err < 4) try { console.error(e); } catch (x) {} };
 const G_ = () => { try { return game; } catch (e) { return null; } };

 // ---------- (1) pending SUB-screen subs never outlive their game ----------
 function purge(why) {
  const S = W0.S425;
  if (!S || !S.PEND) return;
  let n = 0;
  for (const p of S.PEND) if (p && p.st !== 'done') { p.st = 'done'; p.why = 'qa437:' + why; n++; }
  try { if (S.SP) { S.SP.queue = []; if (S.SP.open) { S.SP.open = false; S.SP.stage = 'field'; S.SP.sel = null; } } } catch (e) {}
  if (n) { LOG.purged += n; lg({ ev: 'purge', n: n, why: why }); }
 }
 // every new game (quick game, season, playoffs, college, ultimate, rematch) goes through newGame(): the old game's
 // pending subs are called off before the new one is built (a replay/clip never calls newGame, so it never purges)
 const NG0 = W0.newGame;
 if (typeof NG0 === 'function') {
  W0.newGame = function () { if (!off()) { try { LOG.games++; purge('newGame'); } catch (e) { er(e); } } return NG0.apply(this, arguments); };
 }

 // ---------- (2) playmaker: a receiver tap during READY... GO! passes ----------
 const UP0 = W0.pmUp;
 if (typeof UP0 === 'function') {
  W0.pmUp = function (pt, cancel) {
   if (!off() && !cancel) {
    try {
     const d = W0.PD42 && W0.PD42.D && W0.PD42.D();
     const P = pt && pt.pd;
     if (d && d.phase === 'play' && d.live && d.live.cd > 0 && P && P.k === 'tap') {
      d.live.cd = 0; LOG.cdSkip++;
      try { SFX.whistle ? SFX.whistle() : SFX.tap(); } catch (x) {}
      if (P.t0 != null) { try { P.t0 = Math.max(P.t0, (performance.now() / 1e3) - .2); } catch (x) {} }
     }
    } catch (e) { er(e); }
   }
   return UP0.apply(this, arguments);
  };
 }
 // ---------- (3) the app going to the background mid-game pauses it (offline games only) ----------
 // Before: switching apps / locking the phone mid-play and coming back dropped you straight back into live play with no
 // pause. Now an offline game in play shows the normal PAUSED menu (RESUME) when the app comes back. Online: unchanged.
 try {
  document.addEventListener('visibilitychange', () => {
   if (off() || !document.hidden) return;
   try {
    const G = G_(); const s = screen;
    if (!G || G.online || G.over || G.tutorial || paused) return;
    try { if (W0.RLNET && RLNET.inGame) return; } catch (x) {}
    if (![ 'live', 'defense', 'faceoff', 'cpu', 'banner' ].includes(s)) return;
    paused = true; LOG.bgPause = (LOG.bgPause || 0) + 1;
   } catch (e) { er(e); }
  });
 } catch (e) { er(e); }
})();
