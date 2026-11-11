// V40.1.4 - CPU BLACK only when it's realistic (v414b.js)
// Charlie: "cpus only go black if like a dpole takes it over the midline ... or sometimes if fogo has it
//  ... or faceoff sometimes, and they go right back to normal after the d pole or fogo passes it ...
//  it's not all the time, better teams do it more"
// 1) No CPU team plays BLACK as its base D any more (the 4 BLACK teams play MAN with quick slides) and the
//    coach's switch only goes MAN <-> ZONE. The hot-scorer "LOCK OFF 23" call is unchanged.
// 2) Situational BLACK: when YOUR d-pole (D / LSM) or your FOGO carries the ball over the midline (or the
//    FOGO comes out of a faceoff win already over it), their coach MAY call BLACK - one roll per carry.
//    Chance scales with their team strength: pole 15% (weakest) .. 60% (best), FOGO 10% .. 40%.
// 3) It ends the moment that carrier gives the ball up (first pass) or the possession ends (shot, turnover,
//    goal, loose ball, ball back over midline, screen change) - then they're right back in their normal D.
// Normal CPU games only (rides on v410d's state: not practice, online, tutorial). Practice THEIR D: BLACK
// is untouched. Man-down still forces zone/BOX + 1. Kill switch: __rl_no414b (back to v410d behaviour).
(function() {
 'use strict';
 const LOG = { rolls: [], ends: [], fixes: [], swFix: [], errs: [] };
 const V = window.V414B = { on: false, LOG: LOG };
 if (window.__rl_no414b || window.__rl_v124gb) return;
 const V4 = window.V410D;
 if (!V4 || !V4.on || typeof V4.st !== 'function' || typeof V4.scoreTick !== 'function') return;
 if (typeof window.updateLive !== 'function' || typeof window.drawHUD !== 'function') return;
 V.on = true;
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.errs.length < 6) console.warn('v414b', w, e); } catch (x) {} };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const MID = () => { try { return MIDX; } catch (e) { return 0; } };
 // ---- chances (tunable) ----
 const CH = { pole: [ .15, .60 ], fogo: [ .10, .40 ] };
 V.CH = CH;
 // ---- 1) identities: BLACK base -> MAN with quick slides ----
 const ident0 = V4.ident;
 function ident(id) {
  const r = ident0 ? ident0(id) : { d: 'man', slide: 'normal' };
  if (r.d === 'black') return { d: 'man', slide: 'quick', key: r.key, was: 'black' };
  return r;
 }
 V.ident = ident;
 V4.ident = ident; // what tests / other files read
 const SAY = { zone: 'GO ZONE!', man: 'BACK TO MAN!' };
 const SUB = { zone: 'THEY SWITCH TO A ZONE', man: 'THEY GO BACK TO MAN' };
 const A = new WeakMap();
 function ax(G) { let a = A.get(G); if (!a) { a = { fixed: false, on: false, prev: null, lastPid: null, lastX: 0, foSeen: G.foLiveAt, calls: 0, str: null, n: 0 }; A.set(G, a); } return a; }
 function relabel(s, from, to, txt, sub) {
  txt = txt || 'COACH: ' + SAY[to]; sub = sub || SUB[to];
  const pre = 'd:' + from, fx = q => { if (q && String(q.kind || '').indexOf(pre) === 0) { q.txt = txt; q.sub = sub; q.kind = 'd:' + to + String(q.kind).slice(pre.length); return true; } return false; };
  for (const q of s.q) fx(q);
  if (s.call) fx(s.call);
  try { const lc = V4.LOG.calls; for (let i = lc.length - 1; i >= 0; i--) if (String(lc[i].kind || '').indexOf('d:') === 0) { fx(lc[i]); break; } } catch (e) {}
 }
 // fix a freshly made v410d state + undo any coach BLACK switch
 function fix(G, s, a) {
  if (!a.fixed) {
   a.fixed = true;
   if (s.base === 'black') {
    s.base = 'man'; s.slide = 'quick';
    if (s.cur === 'black') s.cur = 'man';
    s.used = s.used.map(d => d === 'black' ? 'man' : d);
    LOG.fixes.push({ opp: String(G.opp), from: 'black', to: 'man' });
   }
   if (!s.used.includes('black')) s.used.push('black'); // nextD() never picks it while unused options remain
   if (!a.on && G.cpuDef === 'black') G.cpuDef = s.cur;
  }
  if (s.cur === 'black') {
   // the coach switch landed on BLACK (only reachable as its 3rd call): make it the other half-court D
   const to = a.prev === 'man' ? 'zone' : a.prev === 'zone' ? 'man' : (s.base === 'zone' ? 'man' : 'zone');
   s.cur = to; if (!a.on) G.cpuDef = to;
   relabel(s, 'black', to);
   LOG.swFix.push({ prev: a.prev, to: to });
  }
  if (a.sw == null) a.sw = s.sw;
  if (s.sw !== a.sw) {
   a.sw = s.sw;
   // a ZONE team going to man for the first time: "GO MAN!" (v410d only had "BACK TO MAN!")
   if (s.cur === 'man' && s.base === 'zone') relabel(s, 'man', 'man', 'COACH: GO MAN!', 'THEY SWITCH TO MAN-TO-MAN');
  }
  a.prev = s.cur;
 }
 // team strength 0..1 among the league (team overall from its lineup)
 function strength(G, a) {
  if (a.str != null) return a.str;
  let v = .5;
  try {
   const src = G.src || 'real';
   const all = TEAMS.map(t => { try { return teamOvr(t.id, src); } catch (e) { return null; } }).filter(x => typeof x === 'number' && isFinite(x));
   const o = luOvr(G.lu[1]);
   const lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
   if (isFinite(o) && hi > lo) v = Math.max(0, Math.min(1, (o - lo) / (hi - lo)));
   a.ovr = o; a.lo = lo; a.hi = hi;
  } catch (e) { err(e, 'str'); }
  return a.str = v;
 }
 function chance(G, a, kind) { const r = CH[kind], s = strength(G, a); return r[0] + (r[1] - r[0]) * s; }
 V.chance = kind => { const G = G0(); return G ? chance(G, ax(G), kind) : null; };
 V.strength = () => { const G = G0(); return G ? strength(G, ax(G)) : null; };
 const isPoleP = p => !!(p && p.pl && (p.pl.pos === 'D' || p.pl.pos === 'LSM'));
 function isFogo(G, p) {
  if (!p || !p.pl) return false;
  if (p.pl.pos === 'FO') return true;
  try { if (G.lu && G.lu[0] && G.lu[0].FO === p.pl.id) return true; } catch (e) {}
  try { if (G.foMe && G.foMe.pl && G.foMe.pl.id === p.pl.id) return true; } catch (e) {}
  return false;
 }
 function kindOf(G, c) { return isPoleP(c) ? 'pole' : isFogo(G, c) ? 'fogo' : null; }
 function roll(G, s, a, c, how) {
  const kind = kindOf(G, c);
  if (!kind) { LOG.rolls.push({ how: how, kind: 'short', hit: false }); return; }
  if (G.pen || G.brave || G.penPending) { LOG.rolls.push({ how: how, kind: kind, hit: false, skip: 'pen' }); return; }
  const p = chance(G, a, kind), r = typeof V.forceRoll === 'number' ? V.forceRoll : Math.random(), hit = r < p;
  LOG.rolls.push({ how: how, kind: kind, p: +p.toFixed(3), hit: hit, opp: String(G.opp) });
  if (!hit) return;
  a.on = true; a.kind = kind; a.pid = c.pl.id; a.t0 = performance.now(); a.f = 0; a.sc = G.score[0] + ':' + G.score[1]; a.n++; a.clr0 = !!G.clearing;
  G.cpuDef = 'black'; G.slide = null; G.rot = null; G.hotP = null;
  if (a.calls < 1) {
   a.calls++;
   s.q.push({ txt: 'COACH: BLACK!', sub: kind === 'pole' ? 'POLE HAS IT - LOCK EVERYONE OFF' : 'FOGO HAS IT - LOCK EVERYONE OFF', kind: 'sit:black' });
  }
 }
 function end(G, s, a, why) {
  a.on = false;
  LOG.ends.push({ why: why, kind: a.kind, frames: a.f, ms: Math.round(performance.now() - a.t0) });
  G.cpuDef = s.cur;
  if (s.call && s.call.kind === 'sit:black') s.call = null;
  s.q = s.q.filter(q => q.kind !== 'sit:black');
  a.lastPid = null;
 }
 V.state = () => { const G = G0(); if (!G) return null; const a = ax(G); return { on: a.on, kind: a.kind || null, n: a.n, str: a.str, ovr: a.ovr, lo: a.lo, hi: a.hi, cpuDef: G.cpuDef }; };
 function tick(G) {
  const s = V4.st();
  if (!s) return null;
  const a = ax(G);
  V4.scoreTick();
  fix(G, s, a);
  const c = G.carrier, b = G.ball, MX = MID();
  if (a.on) {
   let why = null;
   if (SCR() !== 'live') why = 'screen';
   else if (G.score[0] + ':' + G.score[1] !== a.sc) why = 'goal';
   else if (!b) why = 'state';
   else if (b.state === 'pass') why = 'pass';
   else if (b.state === 'shot') why = 'shot';
   else if (b.state !== 'held') why = 'loose';
   else if (!c || c.team !== 'O' || !c.pl) why = 'turnover';
   else if (c.pl.id !== a.pid) why = 'pass';
   else if (c.x < MX - 6 || G.clearing && !a.clr0) why = 'back';
   if (!G.clearing) a.clr0 = false;
   if (why) end(G, s, a, why);
  }
  if (!a.on && SCR() === 'live' && b && c && b.state === 'held' && c.team === 'O' && !c.gk && c.pl) {
   // straight off a faceoff win, already over the midline
   let rolled = false;
   if (G.foLiveAt != null && G.foLiveAt !== a.foSeen) {
    a.foSeen = G.foLiveAt;
    if (c.x >= MX) { roll(G, s, a, c, 'faceoff'); rolled = true; }
   }
   // carried over the midline (one roll per carry)
   if (!rolled && !a.on && a.lastPid === c.pl.id && a.lastX < MX && c.x >= MX) roll(G, s, a, c, 'carry');
   a.lastPid = c.pl.id; a.lastX = c.x;
  } else if (!a.on) { a.lastPid = null; if (G.foLiveAt != null) a.foSeen = G.foLiveAt; }
  return { s: s, a: a };
 }
 V.tick = () => { const G = G0(); return G ? !!tick(G) : false; };
 const L0 = window.updateLive;
 window.updateLive = function(dt) {
  const G = G0();
  let t = null;
  try { if (G && !G.online && !G.tutorial) t = tick(G); } catch (e) { err(e, 'tick'); }
  if (!t || !t.a.on) return L0.apply(this, arguments);
  const s = t.s, real = s.cur;
  s.cur = 'black'; // v410d copies s.cur into G.cpuDef at the top of its frame
  t.a.f++;
  try { return L0.apply(this, arguments); }
  finally { if (s.cur === 'black') s.cur = real; if (t.a.on) G.cpuDef = 'black'; }
 };
 const D0 = window.drawHUD;
 window.drawHUD = function() {
  const G = G0();
  let t = null;
  try { if (G && G.players && G.score && !G.online && !G.tutorial) t = tick(G); } catch (e) { err(e, 'hud0'); }
  const r = D0.apply(this, arguments);
  try {
   if (t && t.a.on) {
    const sc = SCR();
    if (sc !== 'final' && sc !== 'defense' && sc !== 'cpu' && typeof V4.label === 'function') {
     // repaint v410d's tag in red while the situational BLACK is on
     const s = t.s, lab = 'THEIR D: ' + V4.label() + (s.lock ? ' + LOCK ' + s.lock.num : ''), lw = textW(lab);
     rect(W - 98 - lw, 17, lw + 4, 9, 'rgba(0,0,0,.9)');
     text(lab, W - 96, 18, 1, '#ff6b6b', 'right', '#000');
     t.a.tagFrames = (t.a.tagFrames || 0) + 1;
    }
   }
  } catch (e) { err(e, 'hud'); }
  return r;
 };
})();
