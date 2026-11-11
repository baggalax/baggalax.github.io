/* V40.1.7 LOCK OFF STICKS - your locked-off guy (v411l) stays on his man everywhere: ground balls, shots, your clears
   after a save/turnover (his man rides, he rides with him), transitions. The auto-switch never puts you on your locked
   guy unless HIS man has the ball (then it does). Tapping/switch button to him still works like before.
   Kill switch: window.__rl_no417k = true -> exactly V40.1.2 LOCK OFF behaviour. */
(function () {
 'use strict';
 if (window.__rl_v417k_loaded) return;
 window.__rl_v417k_loaded = 1;
 const off = () => !!window.__rl_no417k || !!window.__rl_no411l || !!window.__rl_v124gb;
 const LOG = { errs: [], subPick: 0, takeSub: 0, takeBlocked: 0, ctlFix: 0, toLock: 0, helpGb: 0, stick: 0, gbOwn: 0, liveMark: 0, catchup: 0 };
 window.V417K = { on: false, LOG: LOG };
 if (window.__rl_no417k) return;
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.error(e); } catch (x) {} };
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function () { return f.call(this, o, arguments); };
  return true;
 };
 const GB_NEAR = 14;
 const CATCHUP = 30;      // farther than this from his man -> recovery sprint (+20%)      // a loose ball this close to BOTH him and his man is his to fight for
 const hyp = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

 /* ---------- who is locked (same pairs v411l resolves) ---------- */
 let CUR = null;
 function build(G) {
  const L = { byD: new Map, byA: new Map };
  try {
   if (!off() && G && screen === 'defense' && G.players && window.V411L && typeof V411L.resolve === 'function') {
    for (const q of V411L.resolve(G)) { L.byD.set(q.d, q.a); L.byA.set(q.a, q.d); }
   }
  } catch (e) { err(e, 'locks'); }
  return L;
 }
 const locks = G => CUR || build(G);
 // his man has the ball (or it's in the air to his man)
 function manHas(G, d, L) {
  const m = L.byD.get(d), b = G.ball;
  if (!m || !b) return false;
  return G.dcar === m || b.state === 'pass' && b.to === m;
 }
 // control on him is fine: his man has it, HE has it / it's coming to him, or the user picked him by hand
 function ctlOk(G, d, L) {
  const b = G.ball;
  if (manHas(G, d, L)) return true;
  if (b && b.state === 'pass' && b.to === d) return true;
  if (G.dclear && G.dclear.holder === d) return true;
  if (G.k417man === d) return true;
  return false;
 }
 const free = (G, L) => G.players.filter(p => p.team === 'O' && !p.far && !(p.down > 0) && !L.byD.has(p));

 /* ---------- 1) auto-switch pickers skip locked guys unless the carrier is their man ---------- */
 const filt = (G, c, def) => {
  const L = locks(G);
  if (!L.byD.size || !Array.isArray(def)) return def;
  const f = def.filter(d => !L.byD.has(d) || L.byD.get(d) === c);
  if (f.length !== def.length) LOG.subPick++;
  return f.length ? f : def;
 };
 for (const n of [ 'dClosest', 'dGoalSide' ]) wrapG(n, function (o, a) {
  const G = G0();
  if (off() || !G || screen !== 'defense') return o.apply(this, a);
  try { const x = Array.from(a); x[1] = filt(G, x[0], x[1]); return o.apply(this, x); } catch (e) { err(e, n); return o.apply(this, a); }
 });
 // best unlocked guy for the user: goal-side nearest to the ball, like the game's own pick
 function subFor(G, L) {
  const b = G.ball, ref = G.dcar || (b && b.state === 'pass' && b.to) || b;
  if (!ref) return null;
  const cand = free(G, L);
  if (!cand.length) return null;
  let pick = null;
  try { if (G.dcar && typeof c7Pick === 'function') pick = c7Pick(G.dcar, cand); } catch (e) { pick = null; }
  if (!pick || L.byD.has(pick)) pick = cand.slice().sort((p, q) => hyp(p, ref) - hyp(q, ref))[0];
  return pick || null;
 }
 // backstop for every other picker: a switch onto a locked guy goes to the best unlocked guy instead
 wrapG('dTake', function (o, a) {
  const G = a[0], p = a[1], why = a[2];
  try {
   if (!off() && G && p && screen === 'defense') {
    const L = locks(G);
    if (L.byD.has(p) && !manHas(G, p, L) && !(G.dclear && G.dclear.holder === p)) {
     const s = subFor(G, L);
     LOG.takeBlocked++;
     if (!s || s === G.dctl) return false;
     const me = G.dctl, ref = G.dcar || G.ball;
     // a "he's closer" switch must still be a real improvement over where you are
     if (me && !(me.down > 0) && ref && /run|c7|onball/.test(String(why)) && hyp(s, ref) + 8 >= hyp(me, ref)) return false;
     LOG.takeSub++;
     const x = Array.from(a); x[1] = s; return o.apply(this, x);
    }
   }
  } catch (e) { err(e, 'take'); }
  return o.apply(this, a);
 });
 // his man catches it -> NOW you get put on your locked guy (only then)
 wrapG('dNewCarrier', function (o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0(), c = a[0];
   if (!off() && G && c && screen === 'defense') {
    const L = locks(G), d = L.byA.get(c);
    const autoOn = typeof dAutoOn !== 'function' || dAutoOn();
    if (d && autoOn && G.dctl !== d && !(d.down > 0) && G.players.includes(d)) {
     if (typeof dTake === 'function' && dTake(G, d, 'lock417')) LOG.toLock++;
    }
   }
  } catch (e) { err(e, 'newcar'); }
  return r;
 });
 // remember a hand-picked switch onto the locked guy (switch button / tap) - that one stays yours
 wrapG('dSwitchTo', function (o, a) {
  const r = o.apply(this, a);
  try { const G = G0(); if (G) G.k417man = a[0] && G.dctl === a[0] ? a[0] : null; } catch (e) {}
  return r;
 });
 function fixCtl(G, L) {
  const d = G.dctl;
  if (G.k417man && G.k417man !== d) G.k417man = null;
  if (!d || !L.byD.has(d) || ctlOk(G, d, L)) return;
  const s = subFor(G, L);
  if (!s || s === d) return;
  G.dctl = s;
  G.run = null;
  if (G.gbLock && G.gbLock.key === 'dctl' && G.gbLock.p === d) G.gbLock = null;
  LOG.ctlFix++;
 }

 /* ---------- 2) he stays on his man where v411l let go (loose ball, shot, your clear, your clear passes) ---------- */
 // the ground-ball helper is never him unless the ball is right on him and his man
 wrapG('liveGbTick', function (o, a) {
  const r = o.apply(this, a);
  try {
   const G = a[0], b = a[1];
   if (!off() && G && b && screen === 'defense' && G.dHelpGb) {
    const L = locks(G), d = G.dHelpGb, m = L.byD.get(d);
    if (m && !(hyp(d, b) < GB_NEAR && hyp(m, b) < GB_NEAR)) {
     const alt = free(G, L).filter(p => p !== G.dctl && !(p.stun > 0)).sort((p, q) => hyp(p, b) - hyp(q, b))[0] || null;
     G.dHelpGb = alt;
     LOG.helpGb++;
    }
   }
  } catch (e) { err(e, 'gb'); }
  return r;
 });
 function stickTarget(G, d, m) {
  const b = G.ball, bref = G.dcar || (b.state === 'pass' && b.to) || (G.dclear && G.dclear.holder) || b;
  const bx = bref.x - m.x, by = bref.y - m.y, Lz = Math.hypot(bx, by) || 1;
  return [ Math.min(m.x + bx / Lz * 4 - 1, MIDX - 4), m.y + by / Lz * 4 ];
 }
 wrapG('updateDefense', function (o, a) {
  const G = G0();
  if (off() || !G || screen !== 'defense') return o.apply(this, a);
  let L;
  try {
   L = build(G);
  } catch (e) { err(e, 'pre'); L = { byD: new Map, byA: new Map }; }
  if (!L.byD.size) return o.apply(this, a);
  const pre = new Map;
  for (const d of L.byD.keys()) pre.set(d, [ d.x, d.y ]);
  CUR = L;
  let r;
  try { try { fixCtl(G, L); } catch (e) { err(e, 'ctl0'); } r = o.apply(this, a); } finally { CUR = null; }
  try {
   if (screen !== 'defense' || !G.players) return r;
   const L2 = build(G);
   fixCtl(G, L2);
   // his man just got the ball (catch, scoop, restart, transition) -> you go to your locked guy
   const car = G.dcar, dl = car ? L2.byA.get(car) : null;
   if (dl && G.k417car !== car && G.dctl !== dl && !(dl.down > 0) && (typeof dAutoOn !== 'function' || dAutoOn()) && typeof dTake === 'function') {
    if (dTake(G, dl, 'lock417')) LOG.toLock++;
   }
   G.k417car = car || null;
   const b = G.ball, dt = a[0];
   if (!b) return r;
   const v411 = (b.state === 'held' || b.state === 'pass') && !b.clear && b.state !== 'clear';
   if (v411) {
    // v411l already face-guards him; when he's a long way off (transition, restart) he sprints a bit harder to get back on his man
    for (const [d, m] of L2.byD) {
     if (!G.players.includes(d) || !G.players.includes(m) || d.stun > 0 || d.down > 0 || d === G.dctl && G.run || !d.t30) continue;
     if (hyp(d, m) > CATCHUP) { moveTo(d, d.t30[0], d.t30[1], (PACE.chase || PACE.dBall) * .2, dt); LOG.catchup++; }
    }
    return r;
   }
   for (const [d, m] of L2.byD) {
    if (!G.players.includes(d) || !G.players.includes(m)) continue;
    if (d.stun > 0 || d.down > 0) continue;
    if (d === G.dctl && G.run) continue;                   // you're steering him yourself
    if (G.dclear && G.dclear.holder === d) continue;       // he has it on your clear
    if (b.state === 'pass' && b.to === d) continue;        // it's coming to him
    if (G.dHelpGb === d || G.dctl === d && b.state === 'loose') {
     if (hyp(d, b) < GB_NEAR && hyp(m, b) < GB_NEAR) { LOG.gbOwn++; continue; } // ball's on top of his man: fight for it
    }
    const p0 = pre.get(d);
    if (p0) { d.x = p0[0]; d.y = p0[1]; }
    const t = stickTarget(G, d, m);
    let spd = PACE.dBall * 1.06;
    if (Math.hypot(t[0] - d.x, t[1] - d.y) > 14) spd = Math.max(spd, (PACE.chase || PACE.dBall) * .95);
    d.t30 = t;
    if (d.clearTo) d.clearTo = null;
    moveTo(d, t[0], t[1], spd, dt);
    LOG.stick++;
   }
  } catch (e) { err(e, 'post'); }
  return r;
 });

 /* ---------- 3) a new possession / transition: he is assigned his man from the first frame (no teleport - he sprints to him) ---------- */
 function lineUp(G) {
  const L = build(G);
  if (!L.byD.size) return;
  for (const [d, m] of L.byD) {
   if (d.mark === m) continue;
   const mk = G.players.find(q => q.team === 'O' && q !== d && q.mark === m);
   if (mk) mk.mark = d.mark && d.mark !== m && G.players.includes(d.mark) ? d.mark : null;
   d.mark = m;
   LOG.liveMark++;
  }
  fixCtl(G, L);
 }
 for (const n of [ 'startDefenseLive', 'startDefense' ]) wrapG(n, function (o, a) {
  const r = o.apply(this, a);
  try { const G = G0(); if (!off() && G && screen === 'defense') lineUp(G); } catch (e) { err(e, n); }
  return r;
 });
 window.V417K = { on: true, LOG: LOG, locks: build };
})();
