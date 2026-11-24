// ===== BAGGA LAX v600pb74.js - 1.5 B74: ONLINE PLAYBOOK = BOTH PLAYERS IN THEIR PLAYBOOK; TIMEOUT = PLAYBOOK FOR THE OTHER =====
// Bug (Charlie, 2 phones): one player opened his PLAYBOOK, the other phone just froze (the phone running the match stops
//   while a panel is open, so the other phone got no more frames).
// Fix (online human matches only):
//   - PLAYBOOK: opening it tells the other phone (ADDED message 'pb74' {o:1|0}; an older app ignores it = today's game).
//     The other phone opens ITS playbook with "OPPONENT IS IN THEIR PLAYBOOK" and can change its own calls (offense or
//     defense). Play goes on for both only when the player who opened it closes it (if both opened it: when both closed).
//     Closing yours early while the opponent is still in his keeps you in the playbook (with the note).
//   - TIMEOUT: the phone that did NOT call it now gets the PLAYBOOK (not the plain timeout card) with "OPPONENT CALLED A
//     TIMEOUT"; only the caller ends it (existing rule, v600to / net.js 'tor'), the screen comes back with the caller's RESUME.
//   Calls made in there apply at resume through the existing syncs: offense = the phone with the ball runs its own picks;
//   defense = v558 'n558d' (sent on change); lineups ride the existing 'tor'. Nothing in the match state changes here.
// Kill switch: window.__rl_no74pb
(function () {
 'use strict';
 const Wn = window, N = Wn.RLNET;
 if (!N || !N.Link || !N.Link.prototype) return;
 const off = () => !!Wn.__rl_no74pb || !N.inGame;
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const LOG = Wn.__pb74log = { sent: [], got: [], force: 0 };
 const send = o => { try { if (N.link) { N.link.send(o); LOG.sent.push([o.o, Date.now()]); } } catch (e) {} };
 const PLAY = s => s === 'live' || s === 'netview';
 const SUB = s => s === 'playbook' || s === 'playmaker' || s === 'lineup' || /^pm/.test(s || '');
 const S = () => { const G = G0(); if (!G) return null; if (!G.pb74) G.pb74 = { loc: 0, rem: 0, prev: null }; return G.pb74; };
 const toHold = G => !!(G && G.to19 && G.to19.hold && G.toHold18);
 let last = '';
 function back(st) { const s = st.prev && PLAY(st.prev) ? st.prev : N.auth ? 'live' : 'netview'; st.prev = null; screen = s; try { panelDirty(); } catch (e) {} }
 setInterval(() => {
  try {
   if (off()) { last = typeof screen !== 'undefined' ? screen : ''; return; }
   const G = G0(), st = S(); if (!G || !st) return;
   const sc = screen;
   // my own playbook opened from play / closed back to play
   if (sc === 'playbook' && PLAY(last) && !st.loc && !st.rem && !toHold(G) && !st.forced) { st.loc = 1; st.prev = last; send({ t: 'pb74', o: 1 }); }
   if (st.loc && !SUB(sc)) { st.loc = 0; send({ t: 'pb74', o: 0 }); }
   // keep this phone in the playbook while the other player is still in his (or in a timeout the other phone called)
   if ((st.rem || toHold(G)) && PLAY(sc)) { if (!st.prev) st.prev = sc; screen = 'playbook'; st.forced = 1; LOG.force++; try { panelDirty(); } catch (e) {} }
   if (st.forced && !st.rem && !toHold(G) && sc === 'playbook' && !st.loc) { st.forced = 0; back(st); }
   if (!st.rem && !toHold(G)) st.forced = 0;
   last = screen;
  } catch (e) {}
 }, 100);
 // the same 'keep him in the playbook' check BEFORE every game step (net.js drops a timeout hold the moment the screen is not a
 // huddle screen; a 100 ms timer is too late for that)
 if (typeof Wn.step === 'function' && !Wn.step.__pb74) {
  const st0 = Wn.step;
  const st1 = function () {
   try { if (!off()) { const G = G0(), st = G && G.pb74; if (G && st && (st.rem || toHold(G)) && PLAY(screen)) { if (!st.prev) st.prev = screen; screen = 'playbook'; st.forced = 1; LOG.force++; try { panelDirty(); } catch (e) {} } } } catch (e) {}
   return st0.apply(this, arguments);
  };
  st1.__pb74 = 1; Wn.step = st1;
 }
 // receive
 const LP = N.Link.prototype, GE0 = LP.gotEvent, SEEN = new Set();
 LP.gotEvent = function (e) {
  try {
   if (e && e.t === 'pb74' && !Wn.__rl_no74pb) {
    const k = (e.s || '') + ':' + e.q; if (e.q != null && SEEN.has(k)) return GE0.apply(this, arguments); SEEN.add(k); if (SEEN.size > 200) SEEN.clear();
    const G = G0(), st = S(); LOG.got.push([e.o, Date.now()]);
    if (G && st && N.inGame) {
     if (e.o) { st.rem = 1; if (PLAY(screen)) { st.prev = screen; screen = 'playbook'; st.forced = 1; try { panelDirty(); } catch (x) {} } }
     else { st.rem = 0; if (st.forced && !st.loc && !toHold(G) && SUB(screen)) { st.forced = 0; back(st); } }
    }
   }
  } catch (x) {}
  return GE0.apply(this, arguments);
 };
 // the non-caller of a timeout: the playbook instead of the plain timeout card (v600to already makes him "done" at once)
 setInterval(() => {
  try {
   if (off()) return;
   const G = G0(); if (!toHold(G) || !G.to19.me) return;
   if (screen === 'timeout') { const st = S(); st.prev = st.prev || (N.auth ? 'live' : 'netview'); st.forced = 1; screen = 'playbook'; try { panelDirty(); } catch (e) {} }
  } catch (e) {}
 }, 150);
 // the note on top of the playbook panel
 try {
  if (typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.playbook && !PANEL_RENDER.playbook.__pb74) {
   const R0 = PANEL_RENDER.playbook;
   const R1 = function () {
    const h = R0.apply(this, arguments);
    try {
     if (off()) return h;
     const G = G0(), st = G && G.pb74;
     const s = toHold(G) ? 'OPPONENT CALLED A TIMEOUT - MAKE YOUR CALLS, PLAY STARTS WHEN THEY TAP RESUME' : st && st.rem ? 'OPPONENT IS IN THEIR PLAYBOOK - MAKE YOUR CALLS, PLAY STARTS WHEN THEY ARE DONE' : st && st.loc ? 'YOUR OPPONENT WAITS WHILE YOU ARE IN HERE' : '';
     return s ? '<div class="note" id="pb74" style="color:' + (st && st.loc && !st.rem ? '#ffb14d' : '#7dff7a') + ';text-align:center">' + s + '</div>' + h : h;
    } catch (e) { return h; }
   };
   R1.__pb74 = 1; PANEL_RENDER.playbook = R1;
  }
 } catch (e) {}
 // a fresh note when the other side opens / closes
 setInterval(() => { try { const G = G0(), st = G && G.pb74; const k = st ? '' + st.rem + st.loc + toHold(G) : ''; if (k !== R.k) { R.k = k; if (screen === 'playbook') panelDirty(); } } catch (e) {} }, 300);
 const R = { k: '' };
})();
