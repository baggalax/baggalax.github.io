// v425sp.js - V42.5: SUB SCREEN (in game, vs CPU / offline).
// Tap SUB by your bench -> the game FREEZES (no clock, no physics, no AI) on the live field, every one of your
// guys labelled under his feet (number, name, position, legs). Tap the guy you want OFF right on the field ->
// a menu: who comes ON from the bench, BOX or MIDLINE, and WHEN (NOW / 2 / 5 / 10 SEC / DEAD BALL) -> CONFIRM.
// The game is live again the moment you confirm; the subs then run off and on with play going, through the
// v421s live machinery (S421.subBox: off guy jogs to the box, new guy runs on from it, man short till then,
// ST422.onSub stamina hook). MIDLINE = Charlie's real-lacrosse order in ONE call: the off guy goes through the
// box FIRST, then the sub runs on from the box, THEN your crosser goes over the midline (the new guy fills the
// crosser's side while he is over, so you never have 11 and stay onside).
// Online matches never see this screen (v421s keeps subs off there). Kill switch: window.__rl_no425sp = true
// -> the old v421s picker.
// V42.5b (merge): the coach's "SUB HIM, HE'S TIRED" note sits in a strip under the top bar while you pick, and the
// tired z's (v422st) stay over the tired guys' heads on the frozen field (drawn above the dim layer, labels keep clear
// of them). A guy whose stick snapped (items17 v426sb: he is already jogging to the box) can't be picked again.
// V42.5c (Charlie 9:14 PM): MIDLINE picked your ball carrier as the guy going over and pinned him at the line waiting for
// you. Now: the crosser is picked for you (never your ball carrier / the guy you control / the goalie, never a pole sent to
// the offensive end unless you tap him yourself), he runs over on his own, nobody is ever held in place, and if the cross
// can't happen only the cross is called off. The new guy meets him at the midline and takes his spot, he takes the spot of
// the guy who went off: the count on each side never changes (always onside, never 11). And the SUB button moved to the
// bottom row, right of the SET (1-4-1) and D (MAN) buttons, where your thumb is.
(function () {
 'use strict';
 const W0 = window;
 const S4 = W0.S421;
 const need = [ 'step', 'render', 'syncUI', 'hit', 'rect', 'text', 'drawText', 'PP' ];
 const miss = need.filter(n => { try { return typeof eval(n) !== 'function'; } catch (e) { return true; } });
 if (!S4 || typeof S4.subBox !== 'function' || !S4.UI || miss.length) { W0.S425 = { on: () => false, why: miss.concat(S4 ? [] : [ 'S421' ]) }; return; }
 const G_ = () => { try { return game; } catch (e) { return null; } };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const tnow = () => performance.now() / 1e3;
 const killed = () => !!(W0.__rl_no425sp || W0.__rl_no421s || W0.__rl_v124gb);
 const offG = G => killed() || !G || !!G.tutorial || !!G.online || !!G.brave || !!G.over;
 const liveScr = () => { const s = scr(); return s === 'live' || s === 'defense'; };
 const canUse = G => !offG(G) && liveScr() && !(G.farMode === 'fo') && !(S4.on && !S4.on());
 const CX = () => { try { return Math.round(camX); } catch (e) { return 0; } };
 const LOG = { ev: [], err: 0, opens: 0, frozenFrames: 0 };
 const lg = o => { LOG.ev.push(o); if (LOG.ev.length > 200) LOG.ev.shift(); };
 const er = e => { LOG.err++; try { console.error(e); } catch (x) {} };
 const ya = y => { try { return SA2403B ? sa2403By(y) : y; } catch (e) { return y; } };

 // ---------- who is who ----------
 const posOf = id => { const p = PP(id); return p ? p.pos : null; };
 const POS = { A: 'ATT', M: 'MID', D: 'D', LSM: 'LSM', FO: 'FO', G: 'G', SSDM: 'SSDM' };
 const posL = id => { const p = posOf(id); return POS[p] || p || '?'; };
 const grp = id => { const p = posOf(id); return p === 'A' ? 'A' : (p === 'D' || p === 'LSM') ? 'D' : p === 'G' ? 'G' : 'M'; };
 const nm = id => { try { const s = fold2318(lastName(PP(id)) || '').toUpperCase().replace(/[^A-Z0-9.'\- ]/g, '').trim(); if (s) return s.slice(0, 10); } catch (e) {} try { return tagName(PP(id)); } catch (e) { return String(id); } };
 const num = id => { try { const n = gameNum15(PP(id)); return n == null ? '' : String(n); } catch (e) { return ''; } };
 const stam = id => { try { return W0.ST422 && ST422.on() ? Math.round(ST422.get(id, 0)) : null; } catch (e) { return null; } };
 const label = id => { const n = num(id); return (n ? n + ' ' : '') + nm(id) + ' ' + posL(id); }; // (the pixel font has no '#': the number leads, in yellow on the field)
 function uEnts(G) {
  const out = [];
  for (const p of G.players || []) if ((p.team === 'O' || p.team === 'G2') && p.pl) out.push(p);
  if (G.farU && G.farMode !== 'fo') for (const f of G.farU) if (f.pl && !(f.role === 'G' && out.some(q => q.team === 'G2' || q.gk))) out.push(f);
  return out;
 }
 const isGk = e => !!(e.gk || e.team === 'G2' || e.role === 'G' || (e.pl && e.pl.pos === 'G'));
 const findEnt = (G, id) => uEnts(G).find(e => e.pl && e.pl.id === id) || null;
 const hasBall = (G, e) => !!e && (G.carrier === e || (G.dclear && G.dclear.holder === e) || (G.ball && G.ball.state === 'pass' && G.ball.to === e));

 // ---------- state ----------
 const SP = { open: false, stage: 'field', sel: null, mode: 'box', on: null, over: null, when: 0, queue: [], msg: '', lock: 0, guard: 0, t: null, clock: null, page: 0 };
 const PEND = [];
 const WHEN = [ [ 0, 'NOW' ], [ 2, '2 SEC' ], [ 5, '5 SEC' ], [ 10, '10 SEC' ], [ -1, 'DEAD BALL' ] ];
 const taken = () => { const s = new Set; for (const q of SP.queue.concat(PEND.filter(p => p.st !== 'done'))) { s.add(q.off); if (q.on) s.add(q.on); if (q.over) s.add(q.over); } return s; };
 function busy(G) {
  const s = taken();
  try { for (const j of S4.S().jobs) if (j.phase !== 'done') { s.add(j.outId); if (j.inId) s.add(j.inId); if (j.stepId) s.add(j.stepId); if (j.overId) s.add(j.overId); } } catch (e) {}
  try { for (const p of G.players || []) if (p.ns17 && p.pl && (p.team === 'O' || p.team === 'G2')) s.add(p.pl.id); } catch (e) {} // no stick: items17 already has him (jog to the box / WHO SUBS IN)
  return s;
 }
 function bench(G) {
  const b = busy(G), og = SP.sel ? grp(SP.sel) : null;
  let ids = [];
  try { ids = S4.benchIds() || []; } catch (e) { er(e); }
  ids = ids.filter(id => !b.has(id) && posOf(id) !== 'G');
  // same kind of player first (a D for a D), then the freshest legs
  return ids.map(id => [ id, (grp(id) === og ? 0 : 1), -(stam(id) == null ? 100 : stam(id)) ]).sort((a, b2) => a[1] - b2[1] || a[2] - b2[2]).map(r => r[0]);
 }
 // MIDLINE (V42.5c): who goes over. He comes from the OTHER half than the guy going off, and ends up in that guy's spot;
 // the new guy comes on at the box (on the midline) and takes the crosser's spot. Never your ball carrier or the guy you
 // control (he is yours to run), never the goalie, never a guy already in a sub; poles are never sent to the offensive end
 // and attackmen never sent back on their own (both stay pickable by hand, listed last).
 const sideX = x => (x >= MIDX ? 1 : -1); // +1 = your offensive half (you attack right), -1 = your defensive half
 function sideOf(G, id) { const e = findEnt(G, id); return e ? sideX(e.x) : 0; }
 const userOwn = (G, e) => !!e && (hasBall(G, e) || G.ctrl === e || G.dctl === e);
 const PREF_O = { A: 0, M: 1, FO: 1, SSDM: 2 }, PREF_D = { D: 0, LSM: 0, SSDM: 1, M: 2, FO: 2 };
 function rankCross(G, sd, excl) { // sd = the half the crosser goes TO
  if (!sd) return [];
  const b = busy(G), pref = sd > 0 ? PREF_O : PREF_D;
  return uEnts(G).filter(e => !isGk(e) && !excl.includes(e.pl.id) && !b.has(e.pl.id) && !userOwn(G, e) && !e.ns17 && sideX(e.x) !== sd)
   .map(e => { const r = pref[posOf(e.pl.id)]; return { id: e.pl.id, auto: r != null, r: r == null ? 9 : r, d: Math.abs(e.x - MIDX) }; })
   .sort((a, c) => a.r - c.r || a.d - c.d);
 }
 function crossers(G) { return SP.sel ? rankCross(G, sideOf(G, SP.sel), [ SP.sel ]).map(o => o.id) : []; }
 function defCrosser(G) { const r = SP.sel ? rankCross(G, sideOf(G, SP.sel), [ SP.sel ]).find(o => o.auto) : null; return r ? r.id : null; }

 // ---------- open / close ----------
 function openSP(G) {
  SP.open = true; SP.stage = 'field'; SP.sel = null; SP.on = null; SP.over = null; SP.when = 0; SP.mode = 'box'; SP.queue = []; SP.msg = ''; SP.page = 0;
  SP.lock = tnow() + .25; SP.t = G.t; SP.clock = G.clock; LOG.opens++;
  lg({ t: +G.t.toFixed(2), ev: 'open', clock: G.clock, scr: scr() });
  try { SFX.tap(); } catch (e) {}
 }
 function closeSP(why) {
  const G = G_();
  SP.open = false; SP.stage = 'field'; SP.sel = null;
  SP.guard = tnow() + .4; // the tap that closed the screen (and a fast second tap) never reaches a button underneath
  if (G) lg({ t: +G.t.toFixed(2), ev: 'close', why: why, frozenT: +(G.t - (SP.t || 0)).toFixed(3), clockSame: G.clock === SP.clock });
 }
 const act = fn => () => { if (tnow() < SP.lock) return; try { fn(); } catch (e) { er(e); } };
 function pickPlayer(id) {
  const G = G_();
  SP.sel = id; SP.stage = 'menu'; SP.on = null; SP.msg = ''; SP.page = 0; SP.lock = tnow() + .25;
  SP.over = SP.mode === 'mid' ? defCrosser(G) : null; SP.overAuto = SP.over;
  const b = bench(G); if (SP.mode === 'box' && b.length) SP.on = null;
 }
 function curPick() { const G = G_(); return SP.sel && SP.on ? { off: SP.sel, on: SP.on, over: SP.mode === 'mid' ? SP.over : null, mode: SP.mode, when: SP.when, dir: G ? sideOf(G, SP.sel) : 0, overHand: SP.mode === 'mid' && !!SP.over && SP.over !== SP.overAuto } : null; }
 function addCur() { const p = curPick(); if (!p) return false; SP.queue.push(p); SP.sel = null; SP.on = null; SP.over = null; SP.stage = 'field'; SP.lock = tnow() + .25; return true; }
 function confirm() {
  const G = G_();
  if (SP.stage === 'menu' && !addCur()) { SP.msg = 'PICK WHO COMES ON'; return; }
  if (!SP.queue.length) { closeSP('empty'); return; }
  for (const q of SP.queue) {
   const p = Object.assign({ id: PEND.length + 1, st: 'wait', tConf: G.t, poss: G.possCount, dead: 0, scr0: scr() }, q);
   p.fireAt = q.when >= 0 ? G.t + q.when : null;
   PEND.push(p);
   lg({ t: +G.t.toFixed(2), ev: 'confirm', id: p.id, mode: p.mode, off: p.off, on: p.on, over: p.over, when: q.when });
  }
  const q0 = SP.queue[0];
  try { addFx('cue', 0, 0, { s: SP.queue.length > 1 ? SP.queue.length + ' SUBS CALLED' : (q0.when ? 'SUB IN ' + (q0.when > 0 ? q0.when + ' SEC' : 'AT THE DEAD BALL') + ': ' : 'SUB: ') + nm(q0.off) + ' OFF, ' + nm(q0.on) + ' ON', col: '#ffe14d', life: 1.6 }); } catch (e) {}
  SP.queue = [];
  closeSP('confirm');
 }

 // ---------- the frozen game ----------
 const ST0 = W0.step;
 W0.step = function (dt) {
  const G = G_();
  try {
   if (S4.UI.open && canUse(G)) { S4.UI.open = false; if (!SP.open) openSP(G); }
   if (SP.open) {
    if (!canUse(G)) closeSP('gone'); // the game ended / the screen changed under us
    else { LOG.frozenFrames++; return; } // true freeze: no clock, no physics, no AI
   }
  } catch (e) { er(e); }
  const r = ST0.apply(this, arguments);
  try { const G2 = G_(); if (G2 && G2 === G && !offG(G2)) tick(G2, dt); } catch (e) { er(e); }
  return r;
 };

 // ---------- after you confirm: the subs happen with play going ----------
 const VRUN = () => (typeof PACE !== 'undefined' ? PACE.run : 22) * 1.3;
 function drive(e, tx, ty, dt, v) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), s = Math.min(d, v * dt);
  if (d > .01) { e.x += dx / d * s; e.y += dy / d * s; e.anim = (e.anim || 0) + s * 1.2; e.face421 = dx >= 0 ? 1 : -1; }
  e.tx = tx; e.ty = ty; if (e.rest) e.rest = [ tx, ty ];
  return d - s;
 }
 function anc(e, p, k) { if (p[k] == null || Math.hypot(e.x - p[k][0], e.y - p[k][1]) > 6) p[k] = [ e.x, e.y ]; e.x = p[k][0]; e.y = p[k][1]; }
 function release(e) { if (!e) return; e.tx = e.x; e.ty = e.y; e.wander = 0; e.react = 0; if (e.rest && e.home) e.rest = e.home.slice ? e.home.slice() : e.rest; }
 function tick(G, dt) {
  if (!PEND.length) return;
  const live = liveScr();
  for (const p of PEND) {
   if (p.st === 'done') continue;
   if (!live) { p.dead = 1; if (p.st === 'cross') endCross(G, p, 'dead'); else if (p.st === 'after') done(G, p, 'ok'); continue; }
   if (p.st === 'wait') {
    const due = p.fireAt != null ? G.t >= p.fireAt : (p.dead || G.possCount !== p.poss);
    if (!due) continue;
    if (!findEnt(G, p.off)) { if (G.t - p.tConf > 25) done(G, p, 'offGone'); continue; }
    const j = S4.subBox(p.off, p.on, 'sp425', { sp425: p.id });
    if (!j) { if (!p.failT) p.failT = G.t; if (G.t - p.failT > 6) { done(G, p, 'cant'); try { addFx('cue', 0, 0, { s: 'SUB CALLED OFF: ' + nm(p.on) + ' CAN\'T GO ON NOW', col: '#ff9a8a', life: 1.4 }); } catch (x) {} } continue; }
    p.job = j; p.st = 'fired'; p.tFire = G.t; { const oe = findEnt(G, p.off); if (oe) p.sd = sideX(oe.x); }
    lg({ t: +G.t.toFixed(2), ev: 'fire', id: p.id, off: p.off, on: p.on });
    continue;
   }
   if (p.st === 'fired') {
    const j = p.job;
    // MIDLINE: nobody is held while the off guy jogs to the box and the new guy comes on - the crosser just plays
    if (!p.tBox && j.tBox) p.tBox = j.tBox;
    if (j.phase === 'on' || j.phase === 'onRun' || (j.phase === 'done' && j.tOn)) {
     p.tOn = j.tOn || G.t;
     lg({ t: +p.tOn.toFixed(2), ev: 'on', id: p.id, on: p.on, off: p.off });
     if (p.mode === 'mid') startCross(G, p); else done(G, p, 'ok');
    } else if (j.phase === 'done') done(G, p, 'job:' + j.why);
    continue;
   }
   if (p.st === 'cross') crossTick(G, p, dt);
   else if (p.st === 'after') afterTick(G, p);
  }
 }
 // ---- MIDLINE cross (V42.5c) ----
 // The new guy (in the off guy's spot, at the box on the midline) and the crosser run to the same point ON the midline;
 // when they meet they trade spots (the crosser takes the off guy's spot, the new guy the crosser's) and each runs into his
 // half. A man on the midline counts on both halves, so the count on each side never changes: onside the whole time.
 // Nobody is ever held still: both run every frame, the cross has 8 s, and the moment either guy is yours (the ball, your
 // control) the cross is called off and both just play (the new guy simply plays the off guy's spot).
 function saveRest(e) { return e && e.rest ? e.rest.slice() : null; }
 function freeE(e, rest) { if (!e) return; release(e); if (rest && !e.home) e.rest = rest.slice(); }
 function startCross(G, p) {
  const n = findEnt(G, p.on);
  if (!n) { done(G, p, 'cross:noNew'); return; }
  const sd = p.sd || p.dir || 0; // the half the off guy played in = where the crosser goes
  const okC = id => { const e = id ? findEnt(G, id) : null; return !!e && !isGk(e) && !userOwn(G, e) && !e.ns17 && sideX(e.x) !== sd && id !== p.on && id !== p.off; };
  let id = p.over;
  if (id && !okC(id)) { // the guy you had going over can't now (he has the ball / is yours / moved): the next best one
   const r = rankCross(G, sd, [ p.on, p.off ].concat(id ? [ id ] : [])).find(o => o.auto);
   const was = id; id = r ? r.id : null;
   lg({ t: +G.t.toFixed(2), ev: 'repick', id: p.id, was: was, now: id });
  }
  if (!id) { lg({ t: +G.t.toFixed(2), ev: 'plain', id: p.id }); done(G, p, 'cross:plain'); return; }
  p.over = id; p.st = 'cross'; p.tC0 = G.t; p.sd = sd;
  const c = findEnt(G, id);
  p.cRest = saveRest(c); p.nRest = saveRest(n); p.ca = null; p.na = null;
  p.lim = 3 + 1.6 * Math.hypot(MIDX - c.x, (c.y + n.y) / 2 - c.y) / VRUN(); // time to get there, plus room
  lg({ t: +G.t.toFixed(2), ev: 'crossGo', id: p.id, over: id, to: sd > 0 ? 'O' : 'D', cx: Math.round(c.x), nx: Math.round(n.x) });
  try { addFx('txt', c.x, c.y - 24, { s: nm(id) + ' GO OVER!', col: '#ffe14d', life: 1.2 }); } catch (x) {}
 }
 function crossTick(G, p, dt) {
  const c = findEnt(G, p.over), n = findEnt(G, p.on), v = VRUN();
  if (!c || !n) { endCross(G, p, 'gone'); return; }
  if (userOwn(G, c) || userOwn(G, n)) { endCross(G, p, 'yours'); return; } // your guy: you run him, nobody is held
  if (G.t - p.tC0 > (p.lim || 8)) { endCross(G, p, 'slow'); return; }
  const my = clamp((c.y + n.y) / 2, FT + 14, FB - 14);
  // the new guy times his run to get there when the crosser does (he keeps moving, never parks on the line)
  const dC = Math.hypot(MIDX - c.x, my - c.y), dN = Math.hypot(MIDX - n.x, my - n.y), tC = dC / v;
  const vN = tC > .05 ? Math.min(v, Math.max(v * .4, dN / tC)) : v;
  anc(c, p, 'ca'); drive(c, MIDX, my, dt, v); p.ca = [ c.x, c.y ];
  // he steps onto the line first (from the box), so the half he is leaving is never a man short while he waits
  anc(n, p, 'na'); if (Math.abs(n.x - MIDX) > 2) drive(n, MIDX, n.y + clamp(my - n.y, -4, 4), dt, v); else drive(n, MIDX, my, dt, vN); p.na = [ n.x, n.y ];
  p.crossF = (p.crossF || 0) + 1;
  if (Math.hypot(c.x - n.x, c.y - n.y) < 3) meet(G, p, c, n);
 }
 function meet(G, p, c, n) {
  // same spot, so trading the two players between the two spots moves nobody (no jump)
  const mx = (c.x + n.x) / 2, myy = (c.y + n.y) / 2;
  c.x = n.x = mx; c.y = n.y = myy;
  const pc = c.pl, pn = n.pl;
  c.pl = pn; n.pl = pc;
  for (const k of [ 'stun', 'dropT', 'gbReact' ]) { const t0 = c[k]; c[k] = n[k]; n[k] = t0; }
  freeE(c, p.cRest); freeE(n, p.nRest);
  p.tMeet = G.t; p.st = 'after';
  lg({ t: +G.t.toFixed(2), ev: 'meet', id: p.id, over: p.over, on: p.on, at: [ Math.round(mx), Math.round(myy) ] });
 }
 // after the trade: nobody is driven, we only watch the crosser get into his new half (for the log)
 function afterTick(G, p) {
  const c = findEnt(G, p.over);
  if (!c) { done(G, p, 'ok'); return; }
  if (sideX(c.x) === p.sd && Math.abs(c.x - MIDX) > 3) { p.tOver = G.t; lg({ t: +G.t.toFixed(2), ev: 'over', id: p.id, over: p.over }); done(G, p, 'ok'); return; }
  if (G.t - p.tMeet > 6) done(G, p, 'ok:notYet');
 }
 function endCross(G, p, why) {
  freeE(findEnt(G, p.over), p.cRest); freeE(findEnt(G, p.on), p.nRest);
  lg({ t: +G.t.toFixed(2), ev: 'crossOff', id: p.id, why: why });
  done(G, p, 'cross:' + why);
 }
 function done(G, p, why) { if (p.st === 'done') return; p.st = 'done'; p.why = why; p.tDone = G.t; lg({ t: +G.t.toFixed(2), ev: 'done', id: p.id, why: why }); }

 // ---------- the coach's note + the tired z's ----------
 const STC = () => { try { return W0.ST422 && ST422.on() && ST422.CFG ? ST422.CFG : null; } catch (e) { return null; } };
 // who the coach wants off: anyone of yours on the field under the coach's line (v422st coachAt), plus anyone the coach
 // already called out who has not got his legs back yet (his tired spell); the most tired first. Then the z guys.
 function tiredList(G) {
  const C = STC(); if (!C) return { gassed: [], zs: [] };
  const st = G.st422 || {}, sp = st.spell || {}, gassed = [], zs = [];
  const seen = new Set;
  for (const e of uEnts(G)) {
   const id = e.pl.id; if (seen.has(id) || isGk(e)) continue; seen.add(id);
   const v = stam(id); if (v == null) continue;
   if (v < C.coachAt || sp['u:' + id]) gassed.push([ id, v ]); else if (v < C.z1) zs.push([ id, v ]);
  }
  const by = (a, b) => a[1] - b[1];
  return { gassed: gassed.sort(by).map(r => r[0]), zs: zs.sort(by).map(r => r[0]) };
 }
 const STRIP = 11; // the coach strip under the top bar (logical px)
 function drawCoach(G) {
  const y = 17, T = tiredList(G), b = busy(G);
  rect(0, y, W, STRIP, '#0c0a04'); rect(0, y + STRIP, W, 1, 'rgba(255,225,77,.55)');
  const parts = [ [ 'COACH: ', '#ffe14d' ] ];
  const who = (id, last) => { const n = num(id); if (n) parts.push([ n + ' ', '#ffe14d' ]); parts.push([ nm(id) + ' ', '#ffffff' ]); parts.push([ posL(id) + (b.has(id) ? ' (SUBBING)' : '') + (last ? '' : ' + '), '#7fe3ff' ]); };
  let list = T.gassed, tail = '';
  if (list.length) { parts.push([ 'SUB ', '#ffffff' ]); list = list.slice(0, 3); list.forEach((id, i) => who(id, i === list.length - 1)); tail = list.length > 1 ? ", THEY'RE TIRED" : ", HE'S TIRED"; }
  else if (T.zs.length) { list = T.zs.slice(0, 2); list.forEach((id, i) => who(id, i === list.length - 1)); tail = list.length > 1 ? ' ARE GETTING TIRED' : ' IS GETTING TIRED'; }
  else tail = 'LEGS LOOK GOOD - NOBODY NEEDS A SUB YET';
  parts.push([ tail, list.length ? '#ff9a4a' : '#9fb3bd' ]);
  // the z guys too, when there is room (most tired first)
  if (T.gassed.length && T.zs.length) {
   const more = [ [ '   ALSO GETTING TIRED: ', '#9fb3bd' ] ];
   T.zs.slice(0, 2).forEach((id, i, a) => { const n = num(id); more.push([ (n ? n + ' ' : '') + nm(id) + (i < a.length - 1 ? ', ' : ''), '#cfd8dc' ]); });
   const w0 = parts.concat(more).reduce((a, p) => a + textW(p[0], 1), 0);
   if (w0 * .7 <= W - 16) for (const m of more) parts.push(m);
  }
  const tw = parts.reduce((a, p) => a + textW(p[0], 1), 0), k = Math.min(.9, (W - 16) / Math.max(1, tw));
  let xx = 4;
  if (T.gassed.length) { zGl(xx + 1, y + 3, '#f2f8ff', .9); xx += 7; }
  for (const [s0, c] of parts) xx += txt(s0, xx, y + (STRIP - 5 * k) / 2, k, c);
  SP.coach = { gassed: T.gassed.slice(), zs: T.zs.slice(), text: parts.map(p => p[0]).join('') };
 }
 // a small pixel z (same look as v422st's, kept small)
 function zGl(x, y, col, a, sz) {
  const n = sz || 3, d = (ox, oy, c) => { rect(x + ox, y + oy, n, 1, c); for (let i = 1; i < n - 1; i++) rect(x + ox + n - 1 - i, y + oy + i, 1, 1, c); rect(x + ox, y + oy + n - 1, n, 1, c); };
  const a0 = g.globalAlpha; g.globalAlpha = a0 * (a == null ? 1 : a);
  try { d(1, 1, 'rgba(0,0,0,.5)'); d(0, 0, col); } finally { g.globalAlpha = a0; }
 }
 // the z's over tired heads on the frozen field: v422st draws them with the field, the dim layer goes over them, so they
 // are drawn again on top here (same spots, same look) - you can still see who needs a sub
 const ZL = { dx: 4, dy: 6, y0: 14, sp: .3 }; // must match v422st drawZ (the smaller z's)
 function zRect(o) { return [ o.x + 2, o.y - ZL.y0 - ZL.dy - 1, ZL.dx + 6, ZL.dy + 6 ]; }
 function drawZs(G, list) {
  const C = STC(); if (!C) return;
  const t = typeof menuT === 'number' ? menuT : performance.now() / 1e3;
  for (const o of list) {
   const v = stam(o.id); if (v == null || v >= C.z1 || isGk(o.e)) continue;
   const lvl = v < C.z3 ? 3 : v < C.z2 ? 2 : 1, ph = ((parseInt(String(o.id).replace(/\D/g, ''), 10) || 0) % 7) * .23;
   for (let i = 0; i < lvl; i++) {
    const u = ((t * ZL.sp + ph + i / lvl) % 1), a = u < .12 ? u / .12 : u > .82 ? (1 - u) / .18 : 1;
    zGl(o.x + 3 + Math.round(u * ZL.dx), o.y - ZL.y0 - Math.round(u * ZL.dy), '#f2f8ff', Math.max(0, Math.min(1, a)) * .95, u > .45 ? 4 : 3);
   }
  }
 }

 // ---------- drawing ----------
 function txt(s, x, y, k, col) { // the game's pixel font at any size, no blur
  g.save(); g.translate(Math.round(x * RR) / RR, Math.round(ya(y) * RR) / RR); g.scale(k, k);
  try { drawText(s, 0, 0, 1, col); } finally { g.restore(); }
  return textW(s, 1) * k;
 }
 const K = .78; // label scale: a touch bigger than the ball-carrier tag
 function chip(key, x, y, w, h, lab, on, fn, dim, sub) {
  hit(key, x, y, w, h, act(fn), lab);
  rect(x, y + 1, w, h, '#000');
  rect(x, y, w, h, on ? '#ffe14d' : dim ? 'rgba(40,50,60,.95)' : '#c9d6d9');
  const col = on ? '#2a0b20' : dim ? '#7a8a95' : '#0b1a20';
  let k = 1; const tw = textW(lab, 1); if (tw > w - 4) k = Math.max(.55, (w - 4) / tw);
  const ty = sub != null ? y + 2 : y + Math.round((h - 5 * k) / 2);
  txt(lab, x + (w - tw * k) / 2, ty, k, col);
  if (sub != null) { const bw = w - 8, f = Math.max(0, Math.min(1, sub / 100)); rect(x + 4, y + h - 4, bw, 2, 'rgba(0,0,0,.35)'); rect(x + 4, y + h - 4, Math.round(bw * f), 2, f > .6 ? '#2fae4a' : f > .35 ? '#e0b030' : '#d04a3a'); }
 }
 function lblParts(id) { return [ [ num(id) ? num(id) + ' ' : '', '#ffe14d' ], [ nm(id) + ' ', '#ffffff' ], [ posL(id), '#7fe3ff' ] ]; }
 function drawLabel(id, cx, y, sel, dimmed) {
  const parts = lblParts(id), w = parts.reduce((a, p) => a + textW(p[0], 1), 0) * K + 4, h = 5 * K + 3;
  const x = Math.round(cx - w / 2);
  rect(x, y, w, h, sel ? 'rgba(120,90,0,.92)' : 'rgba(6,10,16,.82)');
  if (sel) { rect(x, y - 1, w, 1, '#ffe14d'); rect(x, y + h, w, 1, '#ffe14d'); }
  let xx = x + 2;
  for (const [s, c] of parts) xx += txt(s, xx, y + 1.5, K, dimmed ? '#8a96a0' : c);
  const st = stam(id);
  if (st != null) { const f = st / 100; rect(x, y + h, Math.round(w * f), 1, f > .6 ? '#2fae4a' : f > .35 ? '#e0b030' : '#d04a3a'); }
  return [ x, y, w, h + 1 ];
 }
 function ring(x, y, col) { rect(x - 7, y - 1, 14, 1, col); rect(x - 7, y + 2, 14, 1, col); rect(x - 8, y, 1, 2, col); rect(x + 7, y, 1, 2, col); }
 function drawField(G) {
  const cx = CX(), es = uEnts(G), b = busy(G), placed = [], edgeL = [], edgeR = [];
  rect(0, 0, W, H, 'rgba(0,0,10,.28)');
  const list = es.map(e => ({ e, id: e.pl.id, x: Math.round(e.x - cx), y: Math.round(e.y) })).sort((a, c) => a.y - c.y);
  SP.drawn = [];
  const C = STC(), top = C ? 17 + STRIP + 2 : 14;
  // keep the labels off the tired z's
  if (C) for (const o of list) { const v = stam(o.id); if (v != null && v < C.z1 && !isGk(o.e) && o.x >= 6 && o.x <= W - 6) placed.push(zRect(o)); }
  for (const o of list) {
   const gk = isGk(o.e), bz = b.has(o.id), sel = SP.sel === o.id;
   if (o.x < 6) { edgeL.push(o); continue; } if (o.x > W - 6) { edgeR.push(o); continue; }
   ring(o.x, o.y, sel ? '#ffe14d' : gk || bz ? '#7a8a95' : hasBall(G, o.e) ? '#ffffff' : '#2cc4dc');
   const w = (textW(lblParts(o.id).map(p => p[0]).join(''), 1) * K + 4), h = 5 * K + 4;
   let ly = null;
   for (const dy of [ 3, 9, 15, -27, -33, 21 ]) {
    const yy = o.y + dy, xx = o.x - w / 2;
    if (yy < top || yy + h > H - 2) continue;
    if (!placed.some(r => xx < r[0] + r[2] + 1 && xx + w + 1 > r[0] && yy < r[1] + r[3] + 1 && yy + h + 1 > r[1])) { ly = yy; break; }
   }
   if (ly == null) ly = clamp(o.y + 3, top, H - 2 - h);
   const xs = clamp(o.x, w / 2 + 1, W - w / 2 - 1);
   const r = drawLabel(o.id, xs, ly, sel, gk || bz);
   placed.push(r);
   if (Math.abs(ly - o.y) > 4) rect(o.x, Math.min(ly, o.y + 3), 1, Math.abs(ly - o.y - 3), 'rgba(255,255,255,.35)');
   if (bz && !gk) txt(o.e.ns17 ? 'NO STICK' : SP.queue.some(q => q.off === o.id) ? 'OFF' : 'SUB', r[0] + r[2] + 1, r[1] + 1, .6, '#ff9a4a');
   SP.drawn.push({ id: o.id, x: o.x, y: o.y, lx: r[0], ly: r[1], gk: gk });
   if (!gk && !bz && SP.stage === 'field') {
    hit('SP425 P ' + o.id, o.x - 12, o.y - 22, 24, 26, act(() => pickPlayer(o.id)), label(o.id));
    hit('SP425 L ' + o.id, r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2, act(() => pickPlayer(o.id)), 'LBL ' + label(o.id));
   }
  }
  // your guys out of view (the far end of the field): tappable chips on that edge
  const edge = (arr, left) => arr.filter(o => !isGk(o.e)).forEach((o, i) => {
   const lab = (left ? '< ' : '') + (num(o.id) ? num(o.id) + ' ' : '') + nm(o.id) + ' ' + posL(o.id) + (left ? '' : ' >');
   const w = Math.min(96, textW(lab, 1) * K + 6), x = left ? 2 : W - w - 2, y = (STC() ? 32 : 30) + i * 13;
   if (SP.stage === 'field' && !b.has(o.id)) chip('SP425 E ' + o.id, x, y, w, 11, lab, false, () => pickPlayer(o.id));
   else { rect(x, y, w, 11, SP.sel === o.id ? '#ffe14d' : 'rgba(6,10,16,.82)'); txt(lab, x + 3, y + 3, K * .9, SP.sel === o.id ? '#2a0b20' : '#8a96a0'); }
  });
  edge(edgeL, true); edge(edgeR, false);
  drawZs(G, list.filter(o => o.x >= 6 && o.x <= W - 6));
 }
 function drawTop(G) {
  rect(0, 0, W, 16, '#060a10'); rect(0, 16, W, 1, '#2cc4dc');
  txt('PAUSED', 4, 4, 1, '#ffe14d');
  let ck = ''; try { const c = Math.max(0, Math.ceil(G.clock)); ck = 'Q' + G.q + ' ' + Math.floor(c / 60) + ':' + String(c % 60).padStart(2, '0'); } catch (e) {}
  txt(ck, W - 50 - textW(ck, 1) * .9, 4, .9, '#9fb3bd');
  const m = SP.stage === 'field' ? (SP.queue.length ? 'TAP ANOTHER GUY, OR CONFIRM' : 'TAP THE PLAYER YOU WANT TO SUB OFF') : 'OFF: ' + label(SP.sel);
  txt(m, 34, 4, .9, '#ffffff');
  chip('SP425 X', W - 46, 1, 44, 11, SP.stage === 'menu' ? 'BACK' : 'CANCEL', false, () => { if (SP.stage === 'menu') { SP.stage = 'field'; SP.sel = null; SP.lock = tnow() + .25; } else closeSP('cancel'); });
  if (SP.stage === 'field' && SP.queue.length) {
   const y = H - 18; rect(0, y - 2, W, 20, 'rgba(6,10,16,.92)');
   const s = SP.queue.map(q => nm(q.off) + '>' + nm(q.on) + (q.mode === 'mid' ? ' (MID)' : '')).join('  ');
   txt('QUEUED: ' + s, 4, y + 4, .75, '#7dff7a');
   chip('SP425 UNDO', W - 132, y, 40, 15, 'UNDO', false, () => { SP.queue.pop(); });
   chip('SP425 QGO', W - 88, y, 84, 15, 'CONFIRM', true, confirm); // its own key: a key reused across stages keeps its old place in the button stack
  }
 }
 function drawMenu(G) {
  const mid = SP.mode === 'mid';
  const PH = mid ? 104 : 82, X = 4, PW = W - 8;
  const s = (SP.drawn || []).find(d => d.id === SP.sel);
  // keep the guy you picked in view: top (under the coach strip) or bottom, whichever covers him less
  const yT = STC() ? 17 + STRIP + 1 : 17, yB = H - PH - 2, cov = y0 => s ? Math.max(0, Math.min(y0 + PH, s.y + 6) - Math.max(y0, s.y - 22)) : 0;
  const Y = s && cov(yT) < cov(yB) ? yT : yB;
  hit('SP425 PANEL', X, Y, PW, PH, () => {}, 'SUB PANEL');
  rect(X, Y, PW, PH, 'rgba(8,12,18,.95)'); rect(X, Y, PW, 1, '#2cc4dc'); rect(X, Y + PH - 1, PW, 1, '#2cc4dc');
  let y = Y + 3, x = X + 4;
  txt('HOW', x, y + 3, .9, '#9fb3bd'); x += 16;
  chip('SP425 BOX', x, y, 36, 11, 'BOX', !mid, () => { SP.mode = 'box'; SP.over = null; }); x += 38;
  chip('SP425 MID', x, y, 46, 11, 'MIDLINE', mid, () => { SP.mode = 'mid'; if (!SP.over) { SP.over = defCrosser(G_()); SP.overAuto = SP.over; } }); x += 54;
  txt('WHEN', x, y + 3, .9, '#9fb3bd'); x += 20;
  for (const [v, l] of WHEN) { const w = l === 'DEAD BALL' ? 44 : l === '10 SEC' ? 34 : l === 'NOW' ? 26 : 30; chip('SP425 W ' + l, x, y, w, 11, l, SP.when === v, () => { SP.when = v; }); x += w + 2; }
  y += 15;
  const b = bench(G), per = 10, pages = Math.max(1, Math.ceil(b.length / per)); SP.page = Math.min(SP.page, pages - 1);
  const st = stam(SP.sel);
  txt('WHO COMES ON FROM THE BENCH' + (st != null ? '   (' + nm(SP.sel) + ' LEGS ' + st + ')' : ''), X + 4, y, .8, '#7dff7a');
  if (pages > 1) chip('SP425 MORE', X + PW - 52, y - 2, 48, 8, 'MORE ' + (SP.page + 1) + '/' + pages, false, () => { SP.page = (SP.page + 1) % pages; });
  y += 7;
  const cw = Math.floor((PW - 8 - 4 * 2) / 5), ch = 15;
  b.slice(SP.page * per, SP.page * per + per).forEach((id, i) => {
   const cx = X + 4 + (i % 5) * (cw + 2), cy = y + Math.floor(i / 5) * (ch + 2);
   chip('SP425 ON ' + id, cx, cy, cw, ch, label(id), SP.on === id, () => { SP.on = id; SP.msg = ''; }, false, stam(id));
  });
  if (!b.length) txt('NOBODY ON THE BENCH', X + 120, y + 6, 1, '#9fb3bd');
  y += 2 * (ch + 2) + 1;
  if (mid) {
   const toD = sideOf(G, SP.sel) < 0;
   txt('WHO GOES OVER ' + (toD ? 'BACK TO YOUR D END' : 'UP TO YOUR O END') + ' (PICKED FOR YOU - TAP TO CHANGE)', X + 4, y, .8, '#ffe14d'); y += 7;
   const cr = crossers(G); cr.slice(0, 5).forEach((id, i) => chip('SP425 OVER ' + id, X + 4 + i * (cw + 2), y, cw, 12, label(id), SP.over === id, () => { SP.over = SP.over === id ? null : id; }));
   if (!cr.length) txt('NOBODY FREE ON THE OTHER SIDE - IT IS A PLAIN SWAP AT THE BOX', X + 8, y + 4, .8, '#ff9a8a');
   y += 15;
  }
  const ok = !!curPick();
  const ord = mid ? (SP.over ? '1 ' + nm(SP.sel) + ' OFF THRU THE BOX  2 ' + (SP.on ? nm(SP.on) : '?') + ' ON  3 ' + nm(SP.over) + ' GOES OVER' : nm(SP.sel) + ' OFF THRU THE BOX, ' + (SP.on ? nm(SP.on) : '?') + ' ON IN HIS SPOT (NOBODY GOES OVER)') : (nm(SP.sel) + ' RUNS OFF TO THE BOX, ' + (SP.on ? nm(SP.on) : '?') + ' RUNS ON. GAME KEEPS GOING.');
  const by = Y + PH - 18;
  { const s1 = SP.msg || ord, room = PW - 158; let k1 = .72; try { k1 = Math.max(.5, Math.min(.72, room / Math.max(1, textW(s1, 1)))); } catch (e) {} txt(s1, X + 4, by + 6, k1, SP.msg ? '#ff9a8a' : '#cfe'); }
  chip('SP425 ADD', X + PW - 150, by, 58, 15, '+ ANOTHER', false, () => { if (!addCur()) SP.msg = 'PICK WHO COMES ON'; }, !ok);
  chip('SP425 GO', X + PW - 88, by, 84, 15, 'CONFIRM', ok, confirm, !ok);
 }
 const RN0 = W0.render;
 W0.render = function () {
  const r = RN0.apply(this, arguments);
  try {
   const G = G_();
   if (SP.open && canUse(G)) {
    g.save();
    try { drawField(G); drawTop(G); if (STC()) drawCoach(G); if (SP.stage === 'menu' && SP.sel) drawMenu(G); } finally { g.restore(); }
   }
   // pending subs called with a delay: a small tag so you see who is about to go
   else if (G && liveScr() && PEND.some(p => p.st !== 'done')) {
    const cx0 = CX(), tg = (id, s, col) => { const e = findEnt(G, id); if (!e) return; const x = Math.round(e.x - cx0), y = Math.round(e.y) - 26; if (x < -10 || x > W + 10) return; const w = textW(s, 1) * .6 + 3; rect(x - w / 2, y - 1, w, 6, 'rgba(0,0,0,.65)'); txt(s, x - w / 2 + 1.5, y, .6, col); };
    for (const p of PEND) if (p.mode === 'mid' && p.over && p.st === 'cross') tg(p.over, 'OVER', '#ffe14d');
    const cx = CX();
    for (const p of PEND) if (p.st === 'wait') { const e = findEnt(G, p.off); if (!e) continue; const x = Math.round(e.x - cx), y = Math.round(e.y) - 19; if (x < -10 || x > W + 10) continue; const s = p.fireAt != null ? 'OFF ' + Math.max(0, Math.ceil(p.fireAt - G.t)) : 'OFF DB'; rect(x - 10, y - 1, 21, 7, 'rgba(0,0,0,.65)'); txt(s, x - 9, y, .6, '#ff9a4a'); }
   }
  } catch (e) { er(e); }
  return r;
 };
 // ---------- V42.5c: the SUB button lives in the bottom row, right of the SET (1-4-1) and D (MAN) buttons ----------
 // (Charlie: by the bench it sat in the far corner when you were on the right side.) v421s still owns the button and what
 // a tap does; we only take its drawing + tap area out of the corner and put the same button here. Kill: __rl_no425sp.
 const SB = { w: 26, h: 10 }, MV = { frames: 0, at: null, moved: 0 };
 function btnSpot() {
  const y = H - 11 - (typeof sa2403Dy === 'function' ? sa2403Dy(H - 11, 11) : 0);
  let x = Math.round(W / 2 + 45 + 26 + 3);
  try { const k0 = screenKey() + '|', d = uiSpecs.find(q => q.key === k0 + 'DEFENSE MAN ZONE'); if (d) x = Math.round(d.x + d.w + 3); } catch (e) {}
  return { x: Math.min(x, W - SB.w - 4), y: y, w: SB.w, h: SB.h };
 }
 function drawBtn(fn) {
  const r = btnSpot();
  let bz = PEND.some(p => p.st !== 'done');
  try { bz = bz || S4.S().jobs.some(j => j.phase !== 'done'); } catch (e) {}
  hit('SUB421', r.x - 1, r.y - 3, r.w + 4, r.h + 6, fn, 'SUB'); // the MAN button's tap area ends 3 px to the left
  rect(r.x, r.y + 1, r.w, r.h, '#000');
  rect(r.x, r.y, r.w, r.h, S4.UI.open ? '#ffe14d' : bz ? '#ff9a4a' : '#2cc4dc');
  rect(r.x, r.y, r.w, 1, 'rgba(255,255,255,.35)');
  text('SUB', r.x + r.w / 2, r.y + 3, 1, '#0b1a20', 'center');
  try { const T0 = S4.S(); if (T0) T0.btnAt = [ r.x, r.y ]; } catch (e) {}
  MV.at = [ r.x, r.y ]; MV.frames++;
 }
 const DCB = W0.drawChirpBtn;
 if (typeof DCB === 'function') W0.drawChirpBtn = function () {
  if (killed()) return DCB.apply(this, arguments);
  const H0 = W0.hit, R0 = W0.rect, T0 = W0.text;
  let fn = null, skip = 0;
  // v421s draws its SUB button as: hit('SUB421'), 3 rects, text 'SUB'. Take exactly those, keep everything else.
  W0.hit = function (key) { if (key === 'SUB421' && !fn) { fn = arguments[5]; skip = 1; return; } return H0.apply(this, arguments); };
  W0.rect = function () { if (skip && skip < 4) { skip++; return; } return R0.apply(this, arguments); };
  W0.text = function (s0) { if (skip) { skip = 0; if (s0 === 'SUB') return; } return T0.apply(this, arguments); };
  let r;
  try { r = DCB.apply(this, arguments); } finally { W0.hit = H0; W0.rect = R0; W0.text = T0; }
  if (fn) { MV.moved++; try { drawBtn(fn); } catch (e) { er(e); } }
  return r;
 };
 // while the screen is up the game's own buttons are not drawn either (they would sit under the labels)
 for (const nm0 of [ 'drawControls', 'drawGameButtons', 'drawPlaybookBtn', 'drawEdgeMates', 'drawPlaySetBtn', 'drawChirpBtn', 'drawEl2314', 'drawClrBtn' ]) {
  const F0 = W0[nm0]; if (typeof F0 !== 'function') continue;
  W0[nm0] = function () { if (SP.open && !killed()) return; return F0.apply(this, arguments); };
 }
 // while the screen is up, only its own buttons exist (nothing underneath can be hit); a short guard after it closes
 const SY0 = W0.syncUI;
 W0.syncUI = function () {
  try {
   const G = G_();
   const k0 = (typeof screenKey === 'function' ? screenKey() : scr()) + '|';
   if (SP.open && canUse(G)) {
    const mineS = uiSpecs.filter(s => s.key.indexOf('|SP425 ') > 0);
    uiSpecs.length = 0;
    uiSpecs.push({ key: k0 + 'SP425 ALL', x: 0, y: 0, w: W, h: H, fn: () => {}, label: 'SUB SCREEN' });
    for (const s of mineS) uiSpecs.push(s);
   } else if (tnow() < SP.guard && G && liveScr()) {
    uiSpecs.push({ key: k0 + 'SP425 GUARD', x: 0, y: 0, w: W, h: H, fn: () => {}, label: 'SUB GUARD' });
   }
  } catch (e) { er(e); }
  return SY0.apply(this, arguments);
 };
 W0.S425 = { on: () => !killed(), SP: SP, PEND: PEND, LOG: LOG, open: () => { const G = G_(); if (canUse(G)) openSP(G); return SP.open; }, close: closeSP, pick: pickPlayer, confirm: confirm, bench: () => bench(G_()), crossers: () => crossers(G_()), defCrosser: () => defCrosser(G_()), label: label, MV: MV, btnSpot: btnSpot };
})();
