// ===== BAGGA LAX v600ll72.js - 1.5 B72: LOCKER LEAGUE RANKED vs a real player: locked settings, no settings screen,
//        no ghost opponents, queue only while searching, every exit back to the Locker League lobby =====
// 1) LOCKED SETTINGS (Charlie: "professional settings and on nasty"): every ranked match (player or CPU) plays NASTY with
//    the pro format: 4 quarters of the standard quarter length, no 2-point goals, under the PLL rules (v599rules picks PLL
//    for online / Locker League). The host's room settings are these (v590ll); the CPU match uses them too, and your own
//    SETTINGS come back after. LOCK600 is the one place to change them.
// 2) NO SETTINGS SCREEN: while the paired room (the old Play-a-Friend lobby) is being set up, a MATCH FOUND card covers it
//    (no taps under it); v590ll already auto-sends team + ready, the host starts, coin flip, match.
// 3) GHOSTS: a found match whose opponent never gets ready within 8 s is dropped: "OPPONENT LEFT", the room is left, the
//    match is reported 0-0 (void after the server's one-report window; it also takes you out of that pairing) and you go
//    straight back to searching. A closed app is also never "searching": see 4.
// 4) QUEUE ONLY WHILE SEARCHING: FIND MATCH -> searching screen is the only queued state. Leaving it (other screen, app to
//    the background / closed / pagehide, connection lost) sends 'cancel' at once. Opening the lobby never queues (it never
//    did: the queue call only runs from the searching screen; the server keeps a row 9 s after the last poll).
// 5) EXITS: after a ranked player match, any way out (match end, BACK, opponent left, disconnect, forfeit) that lands on the
//    old ONLINE menu / room goes to the Locker League lobby instead.
// Kill switch: window.__rl_no600ll72
(function () {
 'use strict';
 const Wn = window;
 const off = () => !!Wn.__rl_no600ll72;
 const LOG = Wn.__ll72log = { ghost: 0, cancel: [], back: 0, lock: 0 };
 const LOCK600 = Wn.LOCK600 = { diff: 4, halves: false, twoPt: false }; // + qlen: the standard quarter (QLEN)
 const lock = () => off() ? null : Object.assign({ qlen: typeof QLEN !== 'undefined' ? QLEN : 90 }, LOCK600);
 let saved = null;
 const LL600 = Wn.LL600 = {
  lock: () => { const L = lock(); if (L) LOG.lock++; return L; },
  lockBot: () => { const L = lock(); if (!L) return; saved = { qlen: SETTINGS.qlen, halves: SETTINGS.halves, twoPt: SETTINGS.twoPt }; Object.assign(SETTINGS, { qlen: L.qlen, halves: L.halves, twoPt: L.twoPt }); },
  unlockBot: () => { if (saved) { Object.assign(SETTINGS, saved); saved = null; } }
 };
 const LL = () => Wn.RK15LL || null, N = () => Wn.RLNET || null;
 // ---- 4: leave the queue the moment you are not on the searching screen ----
 function cancel(why) {
  const L = LL(); if (!L || !(L.mode === 'search' || L.mode === 'offer')) return;
  try { if (Wn.RK15 && !RK15.down) RK15.call('cancel', {}); } catch (e) {}
  L.mode = 'lobby'; L.match = null; LOG.cancel.push(why);
 }
 Wn.LL600.cancel = cancel;
 const hide = why => { if (!off()) cancel(why); };
 document.addEventListener('visibilitychange', () => { if (document.hidden) hide('hidden'); });
 Wn.addEventListener('pagehide', () => hide('pagehide'));
 Wn.addEventListener('offline', () => hide('offline'));
 try { const A = Wn.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App; if (A && A.addListener) { A.addListener('appStateChange', s => { if (s && !s.isActive) hide('app bg'); }); A.addListener('pause', () => hide('app pause')); } } catch (e) {}
 // ---- 2 + 3 + 5: one watcher ----
 let P0 = null, lastPvp = 0;
 // net.js quitOnline leaves the room 300 ms later (that sets screen 'online' again): open the lobby once more after it
 let reloUntil = 0; const relo = () => { reloUntil = Date.now() + 6000; }; // net.js quitOnline / the 'leave' paths leave the room up to ~2 s later and set screen 'online' again: keep sending them to the lobby for 6 s
 const ONL = [ 'online', 'onJoin', 'onTeam', 'onLobby', 'onSeason', 'onSeasonTeam' ];
 setInterval(() => {
  try {
   if (off()) return;
   const L = LL(), n = N(); if (!L) return;
   const sc = typeof screen !== 'undefined' ? screen : '';
   if (L.mode === 'search' && sc !== 'gear17') cancel('left the screen');
   const P = L.pvp;
   const gearOn = typeof GEAR17 !== 'undefined' && !!GEAR17;
   const dropped = ONL.includes(sc) && !(n && (n.inGame || n.code));
   // after the match started: the opponent left / you quit / MENU on the final -> net.js puts you on the PLAY page ('menu') or the old online page
   if (reloUntil && Date.now() < reloUntil && !L.pvp && (ONL.includes(sc) || sc === 'menu' && !gearOn) && !(n && (n.inGame || n.code))) { try { screen = 'menu'; L.open(); } catch (e) {} }
   if (gearOn && !L.pvp) lastPvp = 0; // back in the Locker League lobby: done (a later BACK to the PLAY page is the player's choice)
   const outOfMatch = !(n && n.inGame) && (ONL.includes(sc) || sc === 'menu' && !gearOn || (typeof game === 'undefined' || !game) && !gearOn && sc !== 'final' && !(n && n.code)); // not while a game is up: v592ff lets the CPU take over a player who left, the match goes on
   if (P) {
    lastPvp = Date.now();
    if (P !== P0) { P0 = P; P.t600 = Date.now(); }
    const st = n && n.lobby && n.lobby.state;
    const both = !!(st && st.hready && st.gready);
    if (n && n.inGame) P.ok600 = 1;
    // 1.5 B74 (Charlie, 2 phones on a slow connection: 'took ~3 tries, kept bouncing back to MATCH FOUND'): the B72 8 s timer
    // counted from the tap, so a join + team + ready over a 300-800 ms connection (8-12 s) was called a ghost and requeued.
    // Now only a TRUE no-show requeues: the opponent was in the room (version hello) and nobody got both ready in 15 s, or the
    // opponent never showed up 25 s after I got into the room, or I could not get into the room at all in 30 s.
    const inRoom = !!(n && n.code && n.code === P.code && n.lobby && n.lobby.state);
    if (inRoom && !P.in74) P.in74 = Date.now();
    if (inRoom && n.oppVer && !P.seen74) P.seen74 = Date.now();
    const age = Date.now() - P.t600, noShow = Wn.__rl_no74ghost ? age > 8000 || dropped && age > 3000 : P.seen74 ? Date.now() - P.seen74 > 15e3 : P.in74 ? Date.now() - P.in74 > 25e3 : age > 30e3;
    LOG.join74 = { inRoom: P.in74 ? P.in74 - P.t600 : null, seen: P.seen74 ? P.seen74 - P.t600 : null };
    if (!P.ok600 && !both && !P.dead600 && noShow) {
     P.dead600 = 1; LOG.ghost++;
     const mid = (st && st.ll15) || (L.match && L.match.mid);
     try { if (mid) (L.left74 = L.left74 || new Set()).add(mid); } catch (e) {}
     try { if (mid && Wn.RK15) RK15.call('result', { mid: mid, my: 0, opp: 0 }); } catch (e) {}
     try { if (n && n.code) n.leave(); } catch (e) {}
     L.pvp = null; P0 = null; lastPvp = 0;
     try { if (Wn.V17 && V17.toast) V17.toast('OPPONENT LEFT - SEARCHING AGAIN', '#ffb14d'); } catch (e) {}
     try { screen = 'menu'; if (L.leave600) L.leave600(true); else L.open(); } catch (e) {}
     setTimeout(() => { try { const sc = screen; if ((ONL.includes(sc) || sc === 'menu') && !(Wn.RLNET && RLNET.code)) { screen = 'menu'; LL().open(); if (LL().search600 && LL().mode === 'lobby') LL().search600(); } } catch (e) {} }, 600);
     return;
    }
    // 5: the match was on and it dropped / was quit (BACK, forfeit, disconnect) -> Locker League lobby
    if (P.ok600 && outOfMatch) { LOG.back++; lastPvp = 0; P0 = null; try { screen = 'menu'; if (L.leave600) L.leave600(false); else { L.pvp = null; L.open(); } } catch (e) {} relo(); return; }
   }
   // 5: after a ranked player match, anything that still lands on the old online menu / room -> Locker League lobby
   if (!P && lastPvp && Date.now() - lastPvp < 10 * 60e3 && (dropped || sc === 'menu' && !gearOn && !(n && (n.inGame || n.code)))) {
    lastPvp = 0; LOG.back++;
    try { screen = 'menu'; L.open(); } catch (e) {} relo();
   }
  } catch (e) {}
 }, 250);
 // ---- 2: the MATCH FOUND card over the paired room (old Play-a-Friend settings screen) ----
 if (typeof Wn.render === 'function') {
  const R0 = Wn.render;
  Wn.render = function () {
   const r = R0.apply(this, arguments);
   try {
    const L = LL(), n = N();
    if (!off() && L && L.pvp && n && !n.inGame && typeof screen !== 'undefined' && (screen === 'onLobby' || screen === 'online' || screen === 'onJoin')) {
     const t = performance.now() / 1000;
     rect(0, 0, W, H, '#0b1118');
     text('LOCKER LEAGUE - RANKED', W / 2, 40, 2, '#ffe14d', 'center', '#000');
     text('MATCH FOUND', W / 2, 66, 3, '#7dff7a', 'center', '#000');
     let opp = ''; try { opp = L.match && L.match.opp && (L.match.opp.u || L.match.opp.name) || ''; } catch (e) {}
     if (opp) text('VS ' + String(opp).toUpperCase().slice(0, 16), W / 2, 98, 2, '#ffffff', 'center', '#000');
     text('PRO RULES - NASTY', W / 2, 124, 1, '#8fe3f0', 'center');
     text('STARTING' + '...'.slice(0, 1 + Math.floor(t * 3) % 3), W / 2, 140, 1, '#c9d6d9', 'center');
     if (typeof uiSpecs !== 'undefined' && Array.isArray(uiSpecs)) uiSpecs.length = 0; // nothing under the card is tappable (the room sets itself up)
    }
   } catch (e) {}
   return r;
  };
 }
})();
