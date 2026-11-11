/* v433np.js — Bagga Lax: no position reset on live possession-change pauses.
   Charlie (Nov 3): "when the game pauses after the other team wins a faceoff everyone should be in the same
   spot as they were before the pause and message. Same with picked off passes".

   What it does (offline / vs-CPU games only; online, tutorial and every dead-ball restart are untouched):
   1. LOST FACEOFF / TOO SLOW! (the CPU wins the faceoff live): game.js threw the faceoff guys away and built
      a fresh CPU offense set (startCpu -> startDefense), so the FOGOs and wings vanished and middies appeared
      on set spots with the ball. Now, once that set is built, every player who was on the field when the
      whistle went keeps his exact spot: the faceoff guys take over the new slots (closest slot to where they
      stand), the CPU player who won it holds the ball right where he scooped it, and everyone then RUNS to
      the set (the set spots stay as movement targets). The FOGO then subs off the normal way (v428as).
   2. During any live turnover / lost-faceoff message the camera holds still (it used to pan to the far end
      during the PICKED OFF! banner when the pick happened in a clear, which made the whole field slide).
   3. Safety net for picked-off passes (and every other live turnover pause): whatever game.js builds after
      the message, anyone who was on the field before the pause is put back on his exact pre-pause spot.
   Kill switch: window.__rl_no433np = true -> exactly today's behaviour. */
(function () {
 'use strict';
 const LOG = { on: false, fo: 0, foSwap: 0, foCarrier: 0, foLeft: 0, foExtra: 0, keep: 0, keepMoved: 0, keepMax: 0, cam: 0, err: [], last: null, hist: [] };
 window.V433NP = { LOG: LOG };
 const off = () => !!window.__rl_no433np;
 const err = (w, e) => { try { if (LOG.err.length < 20) LOG.err.push(w + ': ' + String(e && e.message || e).slice(0, 160)); } catch (x) {} };
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const okG = G => !!G && !G.tutorial && !G.over && !G.online && !(G.meta && G.meta.online) && !G.brave &&
  !(typeof N !== 'undefined' && N && N.inGame);
 const keyOf = p => (p && p.pl && (p.pl.id || p.pl.name)) || null;
 const isUserTeam = t => t === 'O' || t === 'G2' || t === 'U';
 const isGk = p => !!p && (p.gk || p.team === 'G' || p.team === 'G2' || p.role === 'G' || p.role === 'g' || p.role === 'g2');
 // the live pauses we keep still. Dead-ball restarts (out of bounds, violations, fouls, goals) keep v424rs/v423ob rules.
 const FO_LIVE = { 'LOST FACEOFF': 1, 'TOO SLOW!': 1 };
 const DEAD_TXT = /OUT OF BOUNDS|THEIR BALL$|VIOLATION|OVER EARLY|TOO EARLY|SHOT CLOCK|CLEAR COUNT|OFFSIDE|CREASE|FLAG|PENALTY/;
 function liveTurnover(B) {
  if (!B) return false;
  if (B.kind === 'folose') return !!FO_LIVE[B.txt];
  if (B.kind !== 'turnover') return false;
  if (B.txt === 'PICKED OFF!') return true;
  // other live turnovers that pause (a save is the goalie's live ball; a scooped ground ball)
  if (B.txt === 'SAVED!' || B.txt === 'GROUND BALL') return true;
  return false;
 }
 function snapAll(G) {
  const m = new Map();
  const add = (p, near) => { const k = keyOf(p); if (!k || m.has((isUserTeam(p.team) ? 'U|' : 'C|') + k)) return; m.set((isUserTeam(p.team) ? 'U|' : 'C|') + k, { x: p.x, y: p.y, near: near, team: p.team, gk: isGk(p), pl: p.pl }); };
  for (const p of G.players || []) add(p, true);
  for (const f of G.farU || []) add(f, false);
  for (const f of G.farC || []) add(f, false);
  return m;
 }
 const sideKey = p => (isUserTeam(p.team) ? 'U|' : 'C|') + keyOf(p);
 const allEnts = G => (G.players || []).concat(G.farU || [], G.farC || []);
 let CUR = null;   // what the current afterBanner call is fixing (for the log)
 function place(p, q, track) {
  const dd = Math.hypot(p.x - q.x, p.y - q.y);
  if (dd > .01) {
   if (track && dd > LOG.keepMax) LOG.keepMax = +dd.toFixed(1);
   if (track === 2 && dd > 6 && LOG.hist.length < 40) LOG.hist.push({ t: +((G_() || {}).t || 0).toFixed(2), why: CUR, k: keyOf(p), team: p.team, far: !!p.far, from: [ Math.round(p.x), Math.round(p.y) ], to: [ Math.round(q.x), Math.round(q.y) ], d: Math.round(dd) });
   p.x = q.x; p.y = q.y;
   p.h7v = 0; p.h7w = 0;
   if (p.lx != null) { p.lx = p.x; p.ly = p.y; }
   return true;
  }
  return false;
 }
 // ---------- 1. lost faceoff: keep the faceoff guys where they are ----------
 function remapFaceoff(G, pre, preBall) {
  const post = allEnts(G);
  const postKeys = new Set(post.map(sideKey));
  const res = { swaps: 0, kept: 0, left: 0, extra: 0, carrier: null };
  for (const side of [ 'C', 'U' ]) {
   const nearTeam = side === 'C' ? 'D' : 'O';
   const slots = G.players.filter(p => p.team === nearTeam && p.pl && !isGk(p));
   const newcomers = slots.filter(p => !pre.has(side + '|' + keyOf(p)));
   // leavers = anyone of this side who was on the field before the whistle and is nowhere in the new set
   // (the faceoff guys, plus a far guy the man-down count dropped)
   const leavers = [];
   for (const [k, q] of pre) if (k.startsWith(side + '|') && !q.gk && !postKeys.has(k)) leavers.push(q);
   leavers.sort((a, b) => (b.near ? 1 : 0) - (a.near ? 1 : 0));
   // greedy: the slot whose set spot is closest to where the leaver stands gets him (shortest run to the set)
   const spot = p => (p.home ? { x: p.home[0], y: p.home[1] } : p.tgt ? { x: p.tgt[0], y: p.tgt[1] } : { x: p.x, y: p.y });
   const pairs = [];
   newcomers.forEach((s, i) => leavers.forEach((q, j) => { const sp = spot(s); pairs.push([ Math.hypot(sp.x - q.x, sp.y - q.y), i, j ]); }));
   pairs.sort((a, b) => a[0] - b[0]);
   const ui = new Set(), uj = new Set();
   for (const [, i, j] of pairs) {
    if (ui.has(i) || uj.has(j)) continue;
    ui.add(i); uj.add(j);
    const s = newcomers[i], q = leavers[j];
    s.pl = q.pl;
    s.anim = 0;
    place(s, q);
    s.down = 0; s.stun = 0;
    res.swaps++;
   }
   res.extra += newcomers.length - ui.size;   // more slots than faceoff guys (should not happen; logged)
   res.left += leavers.length - uj.size;      // a faceoff guy with no slot (penalty man-down case; logged)
  }
  // everybody else who was on the field (far guys, goalies) keeps his exact spot too
  for (const p of allEnts(G)) { const q = pre.get(sideKey(p)); if (q && place(p, q, true)) res.kept++; }
  // the CPU player who won it has the ball where he scooped it
  let best = null, bd = 1e9;
  for (const p of G.players) if (p.team === 'D' && p.pl && !isGk(p)) { const d = Math.hypot(p.x - preBall.x, p.y - preBall.y); if (d < bd) { bd = d; best = p; } }
  if (best && G.ball && typeof dStick === 'function') {
   if (best !== G.dcar) {
    G.dcar = best;
    G.chk = { n: 0, cd: 0, t: 0, who: best };
    const dd = G.players.find(p => p.team === 'O' && p.mark === best);
    if (dd) G.dctl = dd; else if (typeof nearestTo === 'function') G.dctl = nearestTo('O', best.x, best.y) || G.dctl;
    res.carrier = keyOf(best);
   }
   const b = G.ball; b.state = 'held'; b.vx = 0; b.vy = 0;
   const s = dStick(G.dcar); b.x = s[0]; b.y = s[1];
  }
  return res;
 }
 // ---------- 3. generic: put pre-pause players back on their exact spots after a live turnover ----------
 function keepAll(G, pre) {
  let n = 0;
  for (const p of allEnts(G)) { const q = pre.get(sideKey(p)); if (q && place(p, q, 2)) n++; }
  if (n) {
   const b = G.ball;
   if (b && b.state === 'held' && typeof dStick === 'function') {
    if (scr() === 'defense' && G.dcar) { const s = dStick(G.dcar); b.x = s[0]; b.y = s[1]; }
    else if (scr() === 'live' && G.carrier && typeof BX !== 'undefined') { b.x = G.carrier.x + BX; b.y = G.carrier.y + BY; }
   }
  }
  return n;
 }
 // ---------- wrap afterBanner (outermost: loaded after every other wrapper) ----------
 const oAfter = window.afterBanner;
 if (typeof oAfter !== 'function') { err('init', 'no afterBanner'); return; }
 window.afterBanner = function () {
  const G = G_();
  let pre = null, preBall = null, B = null;
  try {
   B = G && G.banner ? { kind: G.banner.kind, txt: G.banner.txt } : null;
   if (!off() && okG(G) && scr() === 'banner' && liveTurnover(B) && !G.penPending) {
    pre = snapAll(G);
    preBall = G.ball ? { x: G.ball.x, y: G.ball.y } : null;
   }
  } catch (e) { err('pre', e); pre = null; }
  const r = oAfter.apply(this, arguments);
  if (!pre || G !== G_() || off()) return r;
  try {
   const S = scr();
   CUR = B.kind + ':' + B.txt + '>' + S;
   if (S !== 'defense' && S !== 'live') return r;   // fight / timeout / penalty / quarter end: not ours
   if (B.kind === 'folose' && S === 'defense' && preBall) {
    const res = remapFaceoff(G, pre, preBall);
    LOG.fo++; LOG.foSwap += res.swaps; LOG.foLeft += res.left; LOG.foExtra += res.extra; if (res.carrier) LOG.foCarrier++;
    LOG.last = { t: +(G.t || 0).toFixed(2), kind: B.kind, txt: B.txt, res: res };
   } else {
    const n = keepAll(G, pre);
    LOG.keep++; LOG.keepMoved += n;
    LOG.last = { t: +(G.t || 0).toFixed(2), kind: B.kind, txt: B.txt, moved: n };
   }
  } catch (e) { err('post', e); }
  return r;
 };
 // ---------- 2. camera holds still during the message ----------
 const oStep = window.step;
 if (typeof oStep === 'function') window.step = function () {
  let G = null;
  try {
   G = G_();
   if (G && !off() && okG(G) && scr() === 'banner' && liveTurnover(G.banner) && G.camHold == null && !G.__np433cam && typeof camX !== 'undefined') {
    G.camHold = camX; G.__np433cam = { v: camX, b: G.banner }; LOG.cam++;
   }
  } catch (e) { err('cam', e); }
  const r = oStep.apply(this, arguments);
  try {
   const H = G && G.__np433cam;
   if (H && (scr() !== 'banner' || G.banner !== H.b || G !== G_() || off())) {
    if (G.camHold === H.v) G.camHold = null;
    G.__np433cam = null;
   }
  } catch (e) { err('cam2', e); }
  return r;
 };
 LOG.on = true;
})();
