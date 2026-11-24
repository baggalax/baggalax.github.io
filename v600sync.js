// ===== BAGGA LAX v600sync.js - 1.5 B68: ONLINE WALK-IN SKIP VOTES + CELLY SYNC (Charlie approved 2 added messages) =====
// 1) WALK-INS (pregame walk / haka): both players get SKIP. A tap is a vote: the walk-in keeps playing for both until BOTH
//    voted, then it ends on both phones together. One vote alone: "WAITING FOR OPPONENT TO SKIP".
//    Before: each phone's SKIP ended only its own walk-in. Message: { t: 'wsk600' } (added type).
// 2) CELLYS: before, online cellies ran on the host phone only (the guest never saw one). Now the host tells the guest
//    { t: 'cel600', a: 's', cid, ck, side, pid, ct, dur } when a celly starts and { a: 'e' } when it ends, so BOTH phones
//    play it together. Only the scoring team's phone has SKIP: the host for its own team, the guest for the guest's
//    team ({ a: 'k' } -> the host skips it). Any skip or end closes it on both phones (v600skip keeps the host's
//    SKIP off for the guest's celly).
// Backward compatible: older apps ignore the two unknown types (old peer: walk-ins run to their natural end, cellies
// stay host-only as before). Net protocol otherwise unchanged; ids, rl_* keys untouched.
// Kill switches: window.__rl_no600wsk (walk votes), window.__rl_no600cel (celly sync).
(function () {
 'use strict';
 const Wn = window, N = Wn.RLNET;
 if (!N || !N.Link || !N.Link.prototype || typeof Wn.walkEnd2314 !== 'function') return;
 const LOG = Wn.__sync600log = { wsk: [], cel: [], err: [] };
 const er = (w, e) => { if (LOG.err.length < 20) LOG.err.push(w + ': ' + String(e && e.message || e)); };
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const send = o => { try { if (N.link) N.link.send(o); } catch (e) { er('send', e); } };
 const live = () => !!(N.inGame && N.link);
 const nowS = () => performance.now() / 1000;

 // ---------- 1: walk-in votes ----------
 const WK = { walk: null, me: 0, him: 0 };
 const wReset = G => { if (G && G.walk !== WK.walk) { WK.walk = G.walk; WK.me = 0; WK.him = (WK.early && WK.early === G.walk) ? 1 : 0; } };
 const E0 = Wn.walkEnd2314;
 let ending = 0;
 Wn.walkEnd2314 = function (G, how) {
  if (ending || how !== 'skip' || Wn.__rl_no600wsk || !live() || !G || G.walkDone) return E0.apply(this, arguments);
  wReset(G);
  if (!WK.me) { WK.me = 1; send({ t: 'wsk600' }); LOG.wsk.push(['me', +(G.walk ? G.walk.t : 0).toFixed(2)]); }
  if (WK.him) { ending = 1; try { return E0.call(this, G, 'skip'); } finally { ending = 0; } }
 };
 function wVote() {
  const G = G0(); LOG.wsk.push(['him']);
  if (!G || G.walkDone) return;
  if (!G.walk) { WK.early = 1; return; }
  wReset(G); WK.him = 1;
  if (WK.me) { ending = 1; try { E0.call(Wn, G, 'skip'); } finally { ending = 0; } }
 }
 if (typeof Wn.drawWalkUI2314 === 'function') {
  const U0 = Wn.drawWalkUI2314;
  Wn.drawWalkUI2314 = function () {
   const r = U0.apply(this, arguments);
   try {
    const G = G0();
    if (G && G.walk && live() && !Wn.__rl_no600wsk) {
     wReset(G);
     const msg = WK.me ? 'WAITING FOR OPPONENT TO SKIP' : WK.him ? 'OPPONENT WANTS TO SKIP - TAP SKIP' : null;
     if (msg) { rect(0, H - 12, W, 12, 'rgba(0,0,0,.85)'); text(msg, W / 2, H - 9, 1, WK.me ? '#ffb14d' : '#7dff7a', 'center'); }
    }
   } catch (e) { er('wui', e); }
   return r;
  };
 }

 // ---------- 2: celly sync ----------
 const HC = { cur: null };        // host: the celly last announced
 let GC = null, gPrev = 0;        // guest: the celly playing here
 const BASE_DUR = { v491chop: 3.7, v491fw: 3.4 };
 function prepGuest(c) { // the add-on cellies move their actors aside before drawing (their pre() only runs on 'banner')
  if (c.ck === 'wplank' && Wn.WP600) { c.wp = c.actors; c.actors = []; c.dur = WP600.dur; c.wp600 = 1; }
  else if (BASE_DUR[c.ck]) { c.a491 = c.actors; c.actors = []; c.dur = BASE_DUR[c.ck]; c.v491 = 1; }
 }
 function gStart(e) {
  const G = G0(); if (!G || Wn.__rl_no600cel) return;
  if (GC) gEnd('restart');
  if (!Wn.V17 || !V17.BY || !V17.BY[e.cid]) { LOG.cel.push(['g-nocid', e.cid]); return; }
  const side = e.side === 0 ? 1 : 0, prev = G.c17; // host side 0 = the other team here
  G.c17 = null;
  try { V17.cellyStart(side, e.pid, e.cid); } catch (x) { er('start', x); }
  const c = G.c17; G.c17 = prev || null;
  if (!c) { LOG.cel.push(['g-nostart', e.cid, side, !!prev]); return; }
  c.t = Math.max(0, +e.ct || 0); if (e.dur) c.dur = +e.dur; c.ck = e.ck || c.ck; c.net600 = 1;
  prepGuest(c);
  GC = c; gPrev = nowS();
  LOG.cel.push(['g-start', e.cid, side]);
 }
 function gEnd(why) {
  const G = G0();
  if (GC) { for (const a of (GC.wp || GC.a491 || GC.actors || [])) if (a && a.src) a.src._c17h = false; }
  if (GC) LOG.cel.push(['g-end', why, +(GC.t || 0).toFixed(2)]);
  GC = null;
 }
 Wn.CEL600 = { guest: () => GC, host: () => HC.cur };
 // receive
 const LP = N.Link.prototype, GE0 = LP.gotEvent, SEEN = new Set();
 LP.gotEvent = function (e) {
  let dup = false; // p2p + relay backup deliver twice: handle each of OUR messages once (own key set; other wrappers fill .seen first)
  if (e && (e.t === 'wsk600' || e.t === 'cel600') && e.q != null) { const k = (e.s || '') + ':' + e.q; dup = SEEN.has(k); SEEN.add(k); if (SEEN.size > 200) SEEN.clear(); }
  try {
   if (dup) {} else if (e && e.t === 'wsk600' && !Wn.__rl_no600wsk) wVote();
   else if (e && e.t === 'cel600' && !Wn.__rl_no600cel) {
    if (N.auth) { if (e.a === 'k') { const G = G0(); if (G && G.c17 && G.c17.side === 1) { LOG.cel.push(['h-skip-by-guest']); V17.cellySkip(); } } }
    else if (e.a === 's') gStart(e); else if (e.a === 'e') gEnd('host');
   }
  } catch (x) { er('recv', x); }
  return GE0.apply(this, arguments);
 };
 // host: announce start / end; guest: play + draw + SKIP for our own celly
 if (typeof Wn.render === 'function') {
  const R0 = Wn.render;
  Wn.render = function () {
   const r = R0.apply(this, arguments);
   try {
    const G = G0(); LOG.rc = (LOG.rc | 0) + 1;
    if (!G || Wn.__rl_no600cel || !live()) return r;
    if (N.auth) {
     const c = G.c17;
     if (c && c !== HC.cur) { HC.cur = c; send({ t: 'cel600', a: 's', cid: c.cid, ck: c.ck, side: c.side, pid: c.pid, ct: +(c.t || 0).toFixed(2), dur: c.dur }); LOG.cel.push(['h-start', c.cid, c.side]); }
     if (HC.cur && G.c17 !== HC.cur) { send({ t: 'cel600', a: 'e' }); LOG.cel.push(['h-end']); HC.cur = null; }
    } else if (GC) {
     const t1 = nowS(); GC.t += Math.min(.1, t1 - gPrev); gPrev = t1;
     const last = N.view && N.view.last;
     if (GC.t >= GC.dur || (last && last.scr && last.scr !== 'banner' && GC.t > .5)) { gEnd(GC.t >= GC.dur ? 'done' : 'banner over'); return r; }
     const prev = G.c17; G.c17 = GC;
     g.save();
     try { g.translate(-Math.round(camX), 0); V17.drawCelly35(); } catch (x) { er('draw', x); } finally { g.restore(); G.c17 = prev; }
     if (GC.side === 0) { // our team scored: we own SKIP
      const x = Math.round(W / 2 - 60), y = H - 11;
      hit('SKIP CELLY', x - 6, y - 4, 40, 15, () => { send({ t: 'cel600', a: 'k' }); gEnd('skip'); }, 'SKIP CELLY');
      rect(x, y + 1, 32, 10, '#000'); rect(x, y, 32, 10, '#ffffff'); text('SKIP', x + 16, y + 3, 1, '#0b1a20', 'center');
     }
    }
   } catch (e) { er('render', e); }
   return r;
  };
 }
})();
