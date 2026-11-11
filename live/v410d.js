// V40.1.0 - CPU defense identities + in-game coach adjustments (v410d.js)
// 1) Each CPU team has its own base D (MAN / ZONE / BLACK, deterministic per team) + a slide habit.
// 2) Their coach adjusts: user scores 3 straight (or 2 straight while up 3+) -> "COACH: GO ZONE!" etc.
//    A user player who scores a bunch (3 goals, or 2 within ~90s of play) -> "COACH: LOCK OFF 23!":
//    one CPU defender face-guards him everywhere, never slides off him; the rest play their D.
// 3) CPU BLACK really locks off: every off-ball defender face-guards his man tight (like the user's BLACK).
// Normal CPU games only for 1+2 (not practice, online, tutorial). Man-down still forces zone/box.
// Kill switches: __rl_no410d (all), __rl_no410db (BLACK face-guard only), __rl_no410dl (lock-off only).
(function() {
 'use strict';
 const OFF = () => !!window.__rl_no410d || !!window.__rl_v124gb;
 const LOG = { inits: [], calls: [], errs: [], blackFrames: 0, lockFrames: 0 };
 const V = window.V410D = { on: false, LOG: LOG };
 if (OFF()) return;
 if (typeof window.updateLive !== 'function' || typeof window.drawHUD !== 'function') return;
 V.on = true;
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.errs.length < 6) console.warn('v410d', w, e); } catch (x) {} };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 const NAME = { man: 'MAN', zone: 'ZONE', black: 'BLACK' };
 const SLIDE = { quick: 1.35, normal: 1, late: .7 };
 function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
 function teamKey(id) { try { const t = T(id); return String(t && (t.id != null ? t.id : t.name) || id); } catch (e) { return String(id); } }
 // base identity: ~50% MAN, ~25% ZONE, ~25% BLACK; MAN teams also get a slide habit
 function ident(id) {
  const k = teamKey(id), h = hash('D410|' + k) % 100, h2 = hash('s410|' + k) % 3;
  const d = h < 50 ? 'man' : h < 75 ? 'zone' : 'black';
  return { d: d, slide: d === 'man' ? [ 'quick', 'normal', 'late' ][h2] : 'normal', key: k };
 }
 V.ident = ident;
 const ST = new WeakMap();
 function eligible(G) { return !!G && !G.practice && !G.online && !G.tutorial && !(G.meta && G.meta.online) && G.opp != null; }
 function st(G) {
  if (!G) return null;
  let s = ST.get(G);
  if (s) return s.ok ? s : null;
  if (!eligible(G)) { if (G.practice || G.online || G.tutorial) ST.set(G, { ok: false }); return null; }
  const id = ident(G.opp);
  s = { ok: true, base: id.d, slide: id.slide, cur: id.d, used: [ id.d ], run: 0, sw: 0, lastS: [ G.score[0], G.score[1] ], nSc: (G.scorers || []).length, pt: 0, goals: {}, lock: null, locks: 0, lockMiss: 0, q: [], call: null };
  G.cpuDef = id.d;
  ST.set(G, s);
  LOG.inits.push({ opp: id.key, d: id.d, slide: id.slide });
  return s;
 }
 V.st = () => st(G0());
 function nextD(s) {
  const pref = { man: [ 'zone', 'black' ], zone: [ 'black', 'man' ], black: [ 'zone', 'man' ] }[s.cur] || [ 'zone' ];
  const un = pref.filter(d => !s.used.includes(d));
  if (un.length) return un[0];
  if (s.cur !== s.base) return s.base;
  return pref[0];
 }
 const SAY = { zone: 'GO ZONE!', black: 'BLACK! LOCK EVERYONE OFF!', man: 'BACK TO MAN!' };
 const SUB = { zone: 'THEY SWITCH TO A ZONE', black: 'THEY LOCK OFF EVERYBODY', man: 'THEY GO BACK TO MAN' };
 function callout(s, txt, sub, kind) {
  s.q.push({ txt: txt, sub: sub, kind: kind });
  LOG.calls.push({ txt: txt, sub: sub, kind: kind, score: game.score.slice() });
 }
 function switchD(s, why) {
  const d = nextD(s);
  s.cur = d; if (!s.used.includes(d)) s.used.push(d);
  s.sw++; s.run = 0;
  const G = game; G.cpuDef = d; G.slide = null; G.rot = null; G.hotP = null;
  callout(s, 'COACH: ' + SAY[d], SUB[d], 'd:' + d + ':' + why);
 }
 function numOf(pl) { try { const n = pl.num != null ? pl.num : pl.number != null ? pl.number : jerseyNo(pl); return n; } catch (e) { return '?'; } }
 function plById(id) { const G = game; for (const p of G.players) if (p.pl && p.pl.id === id) return p; return null; }
 // poll the score: runs from the game tick and the HUD
 function scoreTick(G, s) {
  const a = G.score[0], b = G.score[1];
  if (a === s.lastS[0] && b === s.lastS[1]) return;
  const du = a - s.lastS[0], dc = b - s.lastS[1];
  s.lastS = [ a, b ];
  const sc = G.scorers || [], newSc = sc.slice(s.nSc); s.nSc = sc.length;
  if (dc > 0) { s.run = 0; }
  if (du > 0) {
   s.run++;
   const lead = a - b;
   // hot-scorer lock off
   if (!window.__rl_no410dl) {
    for (const e of newSc) if (e && e[0] === 0 && e[1] != null) {
     const L = s.goals[e[1]] || (s.goals[e[1]] = []);
     L.push(s.pt);
     if (s.lock && s.lock.id !== e[1]) s.lockMiss++;
     const hot = L.length >= 3 || L.length >= 2 && s.pt - L[L.length - 2] < 90;
     if (hot && !(s.lock && s.lock.id === e[1]) && s.locks < 2 && !G.brave) {
      const p = plById(e[1]), n = p ? numOf(p.pl) : '?';
      s.lock = { id: e[1], num: n, d: null }; s.locks++; s.lockMiss = 0;
      callout(s, 'COACH: LOCK OFF ' + n + '!', 'ONE GUY FACE-GUARDS ' + n + ' EVERYWHERE', 'lock');
     }
    }
    if (s.lock && s.lockMiss >= 3) { s.lock = null; s.lockMiss = 0; callout(s, 'COACH: DROP THE LOCK!', 'EVERYBODY BACK IN THE ' + NAME[s.cur], 'unlock'); }
   }
   // D switch: 3 unanswered, or 2 unanswered with the user up 3+
   if (s.sw < 3 && !G.brave && (s.run >= 3 || s.run >= 2 && lead >= 3)) switchD(s, 'run' + s.run);
  }
 }
 V.scoreTick = () => { const G = G0(), s = st(G); if (s) scoreTick(G, s); };
 // ---- lock-off / BLACK face-guard (runs right before players move, inside updateLive) ----
 let inLive = false, did = false, lockD = null;
 function fg(p, m, c, b) {
  // face-guard target: tight, on the ball side of his man (like the user's BLACK)
  let tx, ty, spd = PACE.dBall;
  if (c && m === c) {
   const dx = GX - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1, t = Math.min(DEF.tight * (DF.tight || 1), 5 * (DF.tight || 1));
   tx = c.x + dx / L * t + 2; ty = c.y + dy / L * t;
  } else {
   const bx = b.x, by = b.y, L = Math.hypot(bx - m.x, by - m.y) || 1, t = 4;
   tx = m.x + (bx - m.x) / L * t + 1; ty = m.y + (by - m.y) / L * t;
   if (b.state === 'pass' && b.to === m && !b.intercept) spd = PACE.dBall * 1.2;
  }
  if (m.x > GX - 4 && tx > GX - 6 && typeof aroundCage === 'function') { const w = aroundCage(p, tx, ty); tx = w[0]; ty = w[1]; }
  if (G0().p5d && G0().p5d !== p) {
   const ex = tx - GX, ey = ty - CY, ed = Math.hypot(ex, ey), R5 = CREASE + 7;
   if (ed < R5) { const k5 = R5 / (ed || 1); tx = GX + (ed ? ex * k5 : -R5); ty = CY + (ed ? ey * k5 : 0); }
  }
  // off-ball: keep pace with his man (a face-guard is glued to him), extra burst when he's lost a step
  const gap = Math.hypot(tx - p.x, ty - p.y);
  if (m !== c && gap > 1.5) {
   const mm = typeof spdMul === 'function' ? spdMul(m) : 1, pm = (typeof spdMul === 'function' ? spdMul(p) : 1) * (DF.dSpd || 1) || 1;
   const want = (m.spd || 0) * mm / pm * (gap > 6 ? 1.25 : 1.08);
   spd = Math.min(PACE.chase, Math.max(spd, want, gap > 6 ? PACE.dBall * 1.15 : 0));
  } else if (m === c && gap > 14) spd = Math.max(spd, PACE.dBall * 1.1);
  p.tx = tx; p.ty = ty; p.spd = spd;
 }
 function skipD(p, G) {
  // (no reaction delay for a face-guard: he is glued to his man)
  return p.team !== 'D' || p.gk || p.down > 0 || p.coverT > 0 || p.stun > 0 || p === G.p5d || (typeof isChaser === 'function' && isChaser(p));
 }
 function preMove() {
  const G = game, b = G.ball, c = G.carrier;
  const why = k => { LOG.why = LOG.why || {}; LOG.why[k] = (LOG.why[k] || 0) + 1; };
  if (!G || G.online || G.tutorial || !b || !c || b.state !== 'held' && b.state !== 'pass') { lockD = null; why('state'); return; }
  if (typeof ballLive === 'function' && ballLive()) { why('live'); return; }
  if (G.clearing || G.rideC && G.rideC.mode === 'live' && G.rideC.phase === 'out') { why(G.clearing ? 'clear' : 'ride'); return; }
  const dl = G.players.filter(p => p.team === 'D' && !p.gk), ol = G.players.filter(p => p.team === 'O' && !p.gk);
  const even = dl.length === ol.length;
  const s = st(G);
  // 1) lock-off on a hot scorer (normal CPU games, even strength)
  lockD = null;
  if (s && s.lock && !window.__rl_no410dl && even) {
   const hot = G.players.find(p => p.team === 'O' && p.pl && p.pl.id === s.lock.id);
   if (hot) {
    let d = s.lock.d && dl.includes(s.lock.d) && !(s.lock.d.down > 0) ? s.lock.d : null;
    if (!d) d = dl.find(q => markOf(q) === hot && !(q.down > 0)) || null;
    if (!d) { let bd = 1e9; for (const q of dl) if (!(q.down > 0)) { const dd = Math.hypot(q.x - hot.x, q.y - hot.y); if (dd < bd) { bd = dd; d = q; } } }
    if (d) {
     s.lock.d = d;
     if (d.mark !== hot) { const o = dl.find(q => q !== d && q.mark === hot); if (o) o.mark = d.mark; d.mark = hot; }
     if (G.slide === d) { G.slide = null; G.rot = null; }
     if (G.rot && G.rot.d === d) G.rot = null;
     lockD = d;
     if (!skipD(d, G)) { fg(d, hot, c, b); LOG.lockFrames++; s.lockFrames = (s.lockFrames || 0) + 1; }
    }
   }
  }
  // 2) CPU BLACK: every defender face-guards his man, no slides (also practice "THEIR D: BLACK")
  if (window.__rl_no410db || G.zoneD || G.cpuDef !== 'black' || !even) return;
  if (G.fb222) { why('fb'); return; } // numbers-down transition: their fast-break D plan stands
  const sg = typeof setSag17 === 'function' && setSag17();
  for (const p of dl) {
   if (p === lockD || skipD(p, G)) continue;
   const m = markOf(p);
   if (!m) continue;
   if (sg && m === c) continue;
   fg(p, m, c, b);
  }
  LOG.blackFrames++;
 }
 V.preMove = preMove;
 // hook: H2on() is called once per updateLive frame right before the movement loop
 if (typeof window.H2on === 'function') {
  const H0 = window.H2on;
  window.H2on = function() {
   const r = H0.apply(this, arguments);
   if (inLive && !did) { did = true; try { preMove(); } catch (e) { err(e, 'preMove'); } }
   return r;
  };
 }
 // keep the locked defender out of slide / hot / rotate picks
 for (const fn of [ 'slideBest', 'hotPick', 'rotatePick' ]) {
  if (typeof window[fn] !== 'function') continue;
  const F0 = window[fn];
  window[fn] = function(def) {
   if (inLive && lockD && Array.isArray(def) && def.includes(lockD)) { const a = Array.prototype.slice.call(arguments); a[0] = def.filter(d => d !== lockD); return F0.apply(this, a); }
   return F0.apply(this, arguments);
  };
 }
 const L0 = window.updateLive;
 window.updateLive = function(dt) {
  const G = G0();
  let s = null, sl0, hadSl;
  try { s = st(G); if (s) { scoreTick(G, s); s.pt += dt || 0; if (G.cpuDef !== s.cur && !G.online) G.cpuDef = s.cur; } } catch (e) { err(e, 'tick'); }
  if (s && s.slide !== 'normal' && typeof DF === 'object') { hadSl = Object.prototype.hasOwnProperty.call(DF, 'slide'); sl0 = DF.slide; DF.slide = (sl0 || 1) * SLIDE[s.slide]; }
  inLive = true; did = false;
  try { return L0.apply(this, arguments); }
  finally {
   inLive = false;
   if (s && s.slide !== 'normal' && typeof DF === 'object') { if (hadSl) DF.slide = sl0; else delete DF.slide; }
  }
 };
 // ---- HUD: "THEIR D" tag + coach callout ----
 function dLabel(G) {
  const dl = G.players.filter(p => p.team === 'D' && !p.gk), ol = G.players.filter(p => p.team === 'O' && !p.gk);
  if (dl.length && ol.length && dl.length !== ol.length && dl.length < ol.length) return G.cpuMD || 'BOX + 1';
  return NAME[G.cpuDef] || 'MAN';
 }
 V.label = () => { const G = G0(); return G ? dLabel(G) : null; };
 function drawCall(G, s) {
  if (!s.call && s.q.length) { s.call = s.q.shift(); s.call.t0 = performance.now(); try { if (window.SFX && SFX.whistle) SFX.whistle(); } catch (e) {} }
  const C = s.call; if (!C) return;
  const t = (performance.now() - C.t0) / 1e3, DUR = 3.4;
  if (t > DUR) { s.call = null; return; }
  const a = Math.max(0, Math.min(1, t * 6, (DUR - t) * 3));
  const w = Math.max(textW(C.txt), textW(C.sub)) + 40, x0 = W - w - 4, y0 = 24, h = 30;
  g.globalAlpha = a;
  rect(x0, y0, w, h, 'rgba(0,0,0,.74)');
  rect(x0, y0, w, 2, G.ok && G.ok.jersey || '#ffe14d');
  try {
   if (typeof HAS12 !== 'undefined' && HAS12 && typeof RL12 !== 'undefined') {
    const X = x0 + 14, Y = y0 + h - 2;
    g.save(); g.translate(X, Y); g.scale(.8, .8); g.translate(-X, -Y);
    try { RL12.draw(g, RL12.frame('coach_cheer', typeof menuT === 'number' ? menuT : t, 3), X, Y, G.ok, true, { skin: pickSkin('coach-' + T(G.opp).id), shadow: false }); } finally { g.restore(); }
    s.coachDrawn = (s.coachDrawn || 0) + 1;
   }
  } catch (e) {}
  const bob = Math.floor(t * 4) % 2;
  text(C.txt, x0 + 30, y0 + 6 - bob, 1, '#ffe14d');
  text(C.sub, x0 + 30, y0 + 17, 1, '#ffffff');
  g.globalAlpha = 1;
  s.callFrames = (s.callFrames || 0) + 1;
 }
 const D0 = window.drawHUD;
 window.drawHUD = function() {
  const r = D0.apply(this, arguments);
  try {
   const G = G0(), s = st(G);
   if (s && G.players && G.score) {
    scoreTick(G, s);
    const sc = SCR();
    if (sc !== 'final' && sc !== 'defense' && sc !== 'cpu' && G.cpuDef) {
     const lab = 'THEIR D: ' + dLabel(G) + (s.lock ? ' + LOCK ' + s.lock.num : '');
     const lw = textW(lab);
     rect(W - 98 - lw, 17, lw + 4, 9, 'rgba(0,0,0,.72)');
     text(lab, W - 96, 18, 1, s.cur !== s.base ? '#ffb14d' : '#8fe3f0', 'right', '#000');
    }
    drawCall(G, s);
   }
  } catch (e) { err(e, 'hud'); }
  return r;
 };
})();
