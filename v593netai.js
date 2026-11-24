/* v593netai.js - Bagga Lax 1.5c: ONLINE AI = REGULAR GAME AI (Charlie: "as smart as the regular game, staying in sync")
 * Bug/ask: a set of the regular game's AI / rules switches were gated "!G.online", so online play was dumber than offline.
 * Cause: those gates predate the online model where ONE phone runs the play (RLNET.auth = the team with the ball) and the
 *   other phone only shows its snapshots (screen 'netview'). AI that runs only on the phone running the play cannot drift:
 *   the other phone never simulates, it draws the positions it is sent.
 * Fix: each gate is wrapped. While THIS phone runs the play (N.inGame && N.auth, not the watching 'netview'), the gate is
 *   asked with the game marked offline for that one call, so the regular-game AI runs exactly as offline. The watching phone
 *   gets the untouched answer (off). Randomness therefore only ever happens on one phone. No new messages, no protocol change.
 * ON (each has its own kill switch window.__rl_no593_<name>):
 *   man30   MAN D sag / help-side                    on2403  slides + recover (the 2403 defense pack)
 *   on110   the 1.1.0 shot / D pack                  tp35on  teammates keep their spots (v35 positioning)
 *   conv18  off-ball conversion / get back           over37  over-and-back guard (keeps 4 back)
 *   clr26ok clearing helpers for the far guys        safe18  stuck-play guard + recovery
 *   el2314On elite play calls (offense = this phone)  sv2111On goalie save -> outlet ball in the stick
 * OFF on purpose (see report): r26On + the updateDefense block (the 'defense' screen is never used online: the defending
 *   phone only watches, rides already come from v495ride), sun glare (sunOn18/coinBegin15: needs one shared seed on both
 *   phones and changes the online coin flow), lock2503 (season difficulty lock: online uses the host's settings).
 * Kill switch for all: window.__rl_no593na. Stats: window.V593NA (calls lifted per switch).
 */
(function () {
 const Wn = window;
 const N = () => Wn.RLNET;
 const SW = ['man30', 'on2403', 'on110', 'tp35on', 'conv18', 'over37', 'clr26ok', 'safe18', 'el2314On', 'sv2111On'];
 const ST = Wn.V593NA = { lift: {}, on: {}, err: [] };
 const runsPlay = () => { try { const n = N(); return !!(n && n.inGame && n.auth && typeof game !== 'undefined' && game && game.online && !game.tutorial && screen !== 'netview'); } catch (e) { return false; } };
 function wrap(name) {
  const o = Wn[name];
  if (typeof o !== 'function') { ST.err.push('no ' + name); return; }
  ST.on[name] = true;
  Wn[name] = function () {
   if (Wn.__rl_no593na || Wn['__rl_no593_' + name] || !runsPlay()) return o.apply(this, arguments);
   const G = game, m = G.meta, w0 = G.online, w1 = m ? m.online : undefined;
   G.online = false; if (m && w1) m.online = false;
   try { ST.lift[name] = (ST.lift[name] || 0) + 1; return o.apply(this, arguments); }
   finally { G.online = w0; if (m && w1) m.online = w1; }
  };
 }
 SW.forEach(wrap);
 ST.runsPlay = runsPlay;
})();
