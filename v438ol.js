// v438ol.js - V43.8 ONLINE release QA fix: REMATCH no longer hangs on "REJOINING...".
// Kill switch: window.__rl_no438ol = true -> exactly today's behaviour.
// Client only. No net message, no lobby field, no server change: it only corrects how THIS phone reads the lobby state
// it already gets from /api/room/<code>/state, before net.js sees it.
//
// THE BUG (main + live site, net.js is the same file): the room server stamps state.startT ONCE, at the first game's start,
// and never again (checked against the live server: start #2 and #3 keep start #1's startT; a startT patch is ignored).
// net.js treats "start is set + startT older than 20 s" as "a game is already running, I am coming back" (the rejoin path:
// it sends hello/rejoin and shows REJOINING...). After REMATCH + both READY UP, the new start arrives with the OLD startT
// (minutes old), so BOTH phones take the rejoin path, nobody is in a game to answer, and both sit on REJOINING... forever.
//
// THE FIX:
//  (1) when the start in the lobby state is clearly newer than the server's startT (start.t is the host's Date.now() at the
//      start; > 20 s newer = startT belongs to an earlier game), read startT as start.t. The first game is untouched
//      (there start.t and startT are ~0.1 s apart), so a real rejoin after a crash/background still works the same.
//  (2) a phone that tapped REMATCH first still saw the finished game's start (the host had not cleared it yet) and went
//      into the rejoin path for the game that just ended (and its hello could pull the other phone out of the final
//      screen into a dead game). A start whose seed is the game this phone just finished is now read as "no start yet".
//  (3) N.rejoining left over from that is cleared once the lobby shows no start (there is no game to rejoin).
//
// SECOND BUG (also main + live): after a phone RELOADS / is killed and comes back with REJOIN, the OTHER phone's picture
// freezes (clock stuck, players stop) every time the rejoined phone has the ball - 5-10 s per possession in my runs, and it
// grows with how long the game ran before the reload. Cause: the receiving Link keeps lseqIn (the last snapshot number it
// took) from the peer's OLD session; the reloaded page starts counting from 1 again, so gotLatest drops every snapshot until
// the new count passes the old one. The jitter buffer also keeps the old session's clock offset. The other phone sees the
// peer's new session id (e.s) on its first message - that is the moment net.js already resets WebRTC for it.
// FIX (4): when a message arrives from a NEW session id of the peer, start lseqIn over and clear the jitter buffer.
// FIX (5): that same spot in net.js calls this.resetRTC(), which does not exist anywhere (main or live) -> TypeError
// "this.resetRTC is not a function", the message that carried the new session id is thrown away, and the WebRTC link is
// never rebuilt (the game stays on the slower relay for the rest of the match). v438ol adds resetRTC (only when it is
// missing): close the old peer connection so the host's existing startRTC() 300 ms later can build a fresh one.
(function () {
 'use strict';
 const W0 = window;
 const off = () => !!W0.__rl_no438ol || !!W0.__rl_v124gb;
 const LOG = W0.OL438 = { fixT: 0, hidOld: 0, clrRej: 0, done: [], err: [] };
 const er = (e, w) => { try { LOG.err.push((w || '') + ': ' + String(e && e.message || e).slice(0, 140)); if (LOG.err.length > 12) LOG.err.shift(); } catch (x) {} };
 const done = new Set();   // seeds of online games this phone has seen end (rematch guard)
 let cur = null;
 // remember the seed of the running online game and mark it done when the game is over
 function watch() {
  try {
   const N = W0.RLNET;
   if (N && N.inGame) {
    const a = N.st && N.st.start, b = N.lobby && N.lobby.state && N.lobby.state.start;
    const s = a && a.seed != null ? a.seed : N.st && N.st.seed != null ? N.st.seed : b && b.seed != null ? b.seed : null;
    if (s != null) cur = s;
    const G = typeof game !== 'undefined' ? game : null;
    if (G && G.over && cur != null && !done.has(cur)) { done.add(cur); LOG.done.push(cur); if (LOG.done.length > 8) LOG.done.shift(); }
   }
  } catch (e) { er(e, 'watch'); }
 }
 setInterval(watch, 400);
 function fixState(j) {
  if (off() || !j || typeof j !== 'object') return j;
  const s = j.state;
  if (!s || typeof s !== 'object') return j;
  const N = W0.RLNET;
  const inG = !!(N && N.inGame);
  const st = s.start;
  if (st && typeof st === 'object') {
   // (2) the finished game's start, seen after this phone left the final screen
   if (!inG && st.seed != null && done.has(st.seed)) { s.start = null; LOG.hidOld++; }
   // (1) a stale server startT from an earlier game in this room
   else if (typeof st.t === 'number' && typeof s.startT === 'number' && st.t - s.startT > 2e4) { s.startT = st.t; LOG.fixT++; }
  }
  // (3) nothing to rejoin
  if (!s.start && N && N.rejoining && !inG) { N.rejoining = false; LOG.clrRej++; }
  return j;
 }
 const RX = /\/api\/room\/[A-Za-z0-9]+\/state(\?|$)/;
 const F0 = W0.fetch;
 if (typeof F0 !== 'function') return;
 const F1 = function (input, init) {
  const p = F0.apply(this, arguments);
  if (off()) return p;
  let url = '';
  try { url = typeof input === 'string' ? input : (input && input.url) || ''; } catch (e) {}
  if (!RX.test(url)) return p;
  return p.then(async r => {
   try {
    if (!r || !r.ok) return r;
    const t = await r.clone().text();
    let j; try { j = JSON.parse(t); } catch (e) { return r; }
    const j2 = fixState(j);
    return new Response(JSON.stringify(j2), { status: r.status, statusText: r.statusText, headers: r.headers });
   } catch (e) { er(e, 'fetch'); return r; }
  });
 };
 try { Object.keys(F0).forEach(k => { F1[k] = F0[k]; }); } catch (e) {}
 W0.fetch = F1;
 LOG.fixState = fixState;
 // (4) peer came back with a new session: accept its snapshot numbers from the start, drop the old clock offset
 LOG.newSid = 0;
 function freshPeer(L, sid) {
  try {
   if (off() || !L || !sid) return;
   if (L.__ol438sid === sid) return;
   const known = L.__ol438sid || L.peerSid;
   L.__ol438sid = sid;
   if (!known || known === sid) return;
   L.lseqIn = 0;
   const J = W0.RLNET && RLNET.jb;
   if (J) { J.dS = []; J.gaps = []; J.base = null; J.newest = 0; J.lastArr = 0; }
   LOG.newSid++;
  } catch (e) { er(e, 'sid'); }
 }
 function hookLink() {
  const Lk = W0.RLNET && RLNET.Link;
  if (!Lk || !Lk.prototype || Lk.prototype.__ol438) return !!(Lk && Lk.prototype && Lk.prototype.__ol438);
  const P = Lk.prototype, ge = P.gotEvent, gl = P.gotLatest;
  if (typeof ge !== 'function' || typeof gl !== 'function') return false;
  P.gotEvent = function (e) { if (e && e.s) freshPeer(this, e.s); return ge.apply(this, arguments); };
  P.gotLatest = function (o) { if (o && o.s) freshPeer(this, o.s); return gl.apply(this, arguments); };
  if (typeof P.resetRTC !== 'function') {
   P.resetRTC = function () {
    if (off()) return;
    try { this.dcR && this.dcR.close(); } catch (e) {}
    try { this.dcU && this.dcU.close(); } catch (e) {}
    try { this.pc && this.pc.close(); } catch (e) {}
    this.dcR = null; this.dcU = null; this.pc = null; this.p2p = false; this.rtcTried = false;
    LOG.rtcReset = (LOG.rtcReset || 0) + 1;
   };
  }
  P.__ol438 = true;
  return true;
 }
 if (!hookLink()) { let n = 0; const iv = setInterval(() => { if (hookLink() || ++n > 50) clearInterval(iv); }, 200); }
})();
