// ===== BAGGA LAX v600to.js - 1.5 B66: TIMEOUTS PER LEAGUE (RULES profile in v599rules.js, P.<league>.to) =====
// Ask:   NCAA 2 a half (unused first-half ones do not carry over) + 1 per OT period. PLL 3 a game (60 s, 60 s, 30 s),
//        at most 2 in the second half, none in OT. WORLD 2 a half, none in OT (rules_research.md 12 / W2 44.9).
//        Each timeout lasts the league length scaled like every other timer. Counts in the HUD + pause screen.
//        Only with the ball or a dead ball (every league, CPU too) - game.js canTimeout already is exactly that
//        (your carrier holding it in live play / your clear on defense via v232 / a dead-ball banner or ready time);
//        cpuTimeoutMaybe only fires after a goal; online the host checks 'toq' against toDead(). This file adds the note.
// Before: game.js had one rule for all: G.tos = [2, 2], reset to [2, 2] at the half, no length.
// Fix:   G.tos stays THE counter every path already uses (button, CPU, online 'to'/'toq' messages, panels), so the
//        online sync is untouched. This file keeps a per-team ledger (G.to600) and sets G.tos to what the league
//        allows right now: a drop in G.tos = a timeout taken (PLL: the next length, 60 / 60 / 30), a new half / OT
//        period = that league's new allowance. Same code on both phones -> same counts. Your own timeout gets a
//        countdown on the TIMEOUT panel (frozen while you draw a play in Playmaker); at 0 it taps RESUME for you,
//        the same RESUME as before (online: the normal both-ready flow).
//        Kill switch: window.__rl_no600to (also off with the whole RULES project).
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__rl_rules600 === false || !Wn.RULES599 || typeof Wn.drawTimeoutBtn !== 'function') return;
 const off = () => !!(Wn.__rl_no600to || Wn.__rl_no599);
 const G0 = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const LOG = Wn.__to600log = { take: [], phase: [], auto: 0 };
 const RL = G => { try { const id = G && G.rules && G.rules.id; const p = id && RULES599.P[id]; return p && p.to ? p : null; } catch (e) { return null; } };
 const fmtS = s => Math.round(s) + 's';
 function phase(G) {
  if (G.brave || G.ot || G.otq) return 'ot' + (G.otq || 0) + (G.ot ? 's' : '') + (G.brave ? 'b' : '');
  return G.q > (G.periods || 4) / 2 ? 'h2' : 'h1';
 }
 function allow(G, S, i) {
  const to = S.to;
  if (to.per === 'game') { if (S.ph === 'h1') return S.lens[i].length; if (S.ph === 'h2') return Math.max(0, Math.min(S.lens[i].length, to.max2 - S.used2[i])); return 0; }
  return S.cnt[i];
 }
 function newPhase(S, ph) {
  const to = S.to;
  S.ph = ph;
  if (to.per === 'half') { const n = /^ot/.test(ph) ? to.ot : to.n; S.cnt = [ n, n ]; }
  LOG.phase.push(ph);
 }
 let busy = 0; // drawTimeoutBtn zeroes G.tos while the old pips draw: no ledger work then
 function sync(G) {
  if (busy) return G && G.to600 || null;
  if (!G || off() || G.tutorial || !Array.isArray(G.tos)) return null;
  const rl = RL(G); if (!rl) return null;
  let S = G.to600;
  const ph = phase(G);
  if (!S || S.id !== rl.id || (G.t || 0) < 1 && !S.took) {
   S = G.to600 = { id: rl.id, to: rl.to, ph: null, lens: rl.to.per === 'game' ? [ rl.to.lens.slice(), rl.to.lens.slice() ] : null, cnt: [ 0, 0 ], used2: [ 0, 0 ], hist: [ [], [] ], last: null, cur: null, took: 0 };
   newPhase(S, ph);
  } else if (S.ph !== ph) newPhase(S, ph);
  else if (S.last) for (let i = 0; i < 2; i++) {
   let d = (S.last[i] | 0) - (G.tos[i] | 0);
   while (d > 0) { // a timeout was taken (button, CPU, online message)
    d--; S.took++;
    let len;
    if (S.to.per === 'game') { len = S.lens[i].shift(); if (S.ph === 'h2') S.used2[i]++; } else { S.cnt[i] = Math.max(0, S.cnt[i] - 1); len = S.to.len[0]; }
    S.hist[i].push([ len, S.ph ]);
    if (i === 0) S.cur = len;
    LOG.take.push({ side: i, len: len, ph: S.ph });
   }
   while (d < 0) { // given back (online request refused / undo)
    d++;
    const h = S.hist[i].pop(); if (!h) break;
    if (S.to.per === 'game') { S.lens[i].unshift(h[0]); if (h[1] === 'h2') S.used2[i] = Math.max(0, S.used2[i] - 1); } else S.cnt[i]++;
   }
  }
  const a = [ allow(G, S, 0), allow(G, S, 1) ];
  G.tos[0] = a[0]; G.tos[1] = a[1];
  S.last = a.slice();
  return S;
 }
 Wn.TO600 = { sync: sync, label: side => label(G0(), side) };
 // "60s 60s 30s" (PLL) / "TO 2" (NCAA, WORLD)
 function label(G, side) {
  const S = sync(G); if (!S) return null;
  if (S.to.per === 'game') { const n = G.tos[side]; return S.lens[side].length ? S.lens[side].map((l, j) => j < n ? (S.to.real[S.to.lens.indexOf(l)] || Math.round(l)) + 's' : '(' + (S.to.real[S.to.lens.indexOf(l)] || Math.round(l)) + 's)').join(' ') : 'NONE'; }
  return 'TO ' + G.tos[side];
 }

 // ---- hooks: every reader of G.tos sees the league count ----
 [ 'canTimeout', 'callTimeout', 'cpuTimeoutMaybe' ].forEach(n => {
  const f = Wn[n]; if (typeof f !== 'function') return;
  Wn[n] = function () { try { sync(G0()); } catch (e) {} const r = f.apply(this, arguments); try { sync(G0()); } catch (e) {} return r; };
 });
 // note when the button is tapped without the ball (offline + online; net.js 2318f shows its own when it is on)
 {
  const c0 = Wn.callTimeout;
  Wn.callTimeout = function () {
   const G = G0(); let can = true; try { can = !!canTimeout(); } catch (e) {}
   const r = c0.apply(this, arguments);
   try { if (!off()) (typeof fx !== 'undefined' ? fx : []).forEach(f => { if (f && f.type === 'cue' && f.s === 'NO TIMEOUT ON DEFENSE') f.s = 'TIMEOUT: ONLY WITH THE BALL OR A DEAD BALL'; }); } catch (e) {}
   try {
    if (!r && !can && G && !G.tutorial && !G.over && !off() && G.tos[0] > 0 && !(Wn.RLNET && RLNET.inGame)) {
     const has = (typeof fx !== 'undefined' ? fx : []).some(f => f && f.type === 'cue' && f.s && /TIMEOUT/.test(f.s));
     if (!has) addFx('cue', 0, 0, { s: 'TIMEOUT: ONLY WITH THE BALL OR A DEAD BALL', col: '#ffb14d', life: 1.6 });
    }
   } catch (e) {}
   return r;
  };
 }
 // ---- HUD: league icons instead of the two fixed pips ----
 const D0 = Wn.drawTimeoutBtn;
 Wn.drawTimeoutBtn = function (bw) {
  const G = G0(); let S = null;
  try { S = sync(G); } catch (e) {}
  if (!S) return D0.apply(this, arguments);
  if (G.tutorial || screen === 'final' || screen === 'pregame') return D0.apply(this, arguments);
  // the old function draws 2 fixed pips per team (rect 4x3 at y 18); those calls are swapped for the league pips,
  // drawn through the very same rect (same transform / HUD shift as the original)
  const items = side => {
   const out = [];
   if (S.to.per === 'game') {
    const n = G.tos[side];
    S.lens[side].forEach((l, j) => out.push({ w: l >= S.to.lens[0] ? 4 : 2, on: j < n }));
    for (let j = S.lens[side].length; j < 3; j++) out.push({ w: 2, on: false, gone: 1 });
   } else {
    const cap = /^ot/.test(S.ph) ? S.to.ot : S.to.n;
    for (let j = 0; j < Math.max(cap, 0); j++) out.push({ w: 4, on: j < G.tos[side] });
   }
   return out;
  };
  // the old 2 pips per team sit at y 18, under the ticker (hidden); they are dropped and the league count is drawn
  // inside YOUR TIMEOUT button (bottom row), the same rect path as the button itself
  const R0 = Wn.rect;
  Wn.rect = function (x, y, w, h) { if (y === 18 && w === 4 && h === 3) return; return R0.apply(this, arguments); };
  let r;
  try { r = D0.apply(this, arguments); } finally { Wn.rect = R0; }
  try {
   const on = !!canTimeout(), it = items(0), span = it.reduce((a, q) => a + q.w + 1, 0) - 1, bx = bw + 4, bwid = 42;
   let xx = bx + Math.round((bwid - span) / 2);
   for (const q of it) { R0(xx, 12, q.w, 1, q.on ? (on ? '#0b1a20' : '#ffd23a') : (on ? 'rgba(0,0,0,.25)' : q.gone ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.22)')); xx += q.w + 1; }
   LOG.draw = (LOG.draw | 0) + 1;
  } catch (e) { LOG.err = String(e && e.stack || e); }
  return r;
 };
 // ---- pause screen line ----
 if (typeof Wn.drawPause === 'function') {
  const P0 = Wn.drawPause;
  Wn.drawPause = function () {
   const r = P0.apply(this, arguments);
   try {
    const G = G0();
    if (G && !off() && !pauseSet && RL(G)) { const a = label(G, 0), b = label(G, 1); if (a) text('TIMEOUTS  YOU: ' + a + '   THEM: ' + b, W / 2, 66, 1, '#ffd23a', 'center', '#000'); }
   } catch (e) {}
   return r;
  };
 }
 // ---- TIMEOUT panel: league count + countdown ----
 try {
  const R0 = PANEL_RENDER.timeout;
  PANEL_RENDER.timeout = function () {
   let h = R0.apply(this, arguments);
   try {
    const G = G0(), S = sync(G);
    const X = G && G.to19;
    if (S && X && X.hold && !Wn.__rl_no600tor && Wn.RLNET && RLNET.inGame) { // 1.5 B67: the phone that did NOT call it: no RESUME, just the clock
     const sec = S.tl != null ? Math.max(0, Math.ceil(S.tl)) : null;
     return '<div class="hd"><div><div class="tt big">TIMEOUT' + (sec != null ? ' \u2013 ' + sec + ' S' : '') + '</div><div class="st">' + esc(T(G.opp).name) + ' CALLED TIMEOUT - PLAY STARTS AGAIN WHEN THEY TAP RESUME OR THE TIME RUNS OUT</div></div></div>';
    }
    if (S) {
     const left = S.to.per === 'game' ? 'LEFT: ' + label(G, 0) : G.tos[0] + ' TIMEOUT' + (G.tos[0] === 1 ? '' : 'S') + ' LEFT';
     const tl = S.tl != null ? '  -  TIME ' + Math.max(0, Math.ceil(S.tl)) + 's' : '';
     h = h.replace(/\d+ TIMEOUTS? LEFT/, left + tl);
    }
   } catch (e) {}
   return h;
  };
 } catch (e) {}
 // ---- countdown ----
 let tPrev = performance.now(), shown = -1;
 setInterval(() => {
  const now = performance.now(), dt = Math.min(.5, (now - tPrev) / 1000); tPrev = now;
  try {
   const G = G0(); if (!G || off()) return;
   const S = G.to600; if (!S || !G.rules) return;
   const huddle = screen === 'timeout' || screen === 'playbook' || screen === 'lineup';
   if (!huddle) { if (S.tl != null && screen !== 'netview' && !/^pm/.test(screen)) { S.tl = null; S.auto = 0; } return; }
   const X = G.to19, other = !!(X && X.hold && Wn.RLNET && RLNET.inGame);
   if (S.tl == null) { const h1 = S.hist[1][S.hist[1].length - 1]; S.tl = other ? (h1 ? h1[0] : S.to.len ? S.to.len[0] : 23) : S.cur || (S.to.len ? S.to.len[0] : 23); S.auto = other ? 1 : 0; shown = -1; }
   // 1.5 B67: online, the phone that did NOT call it is "done" at once (no RESUME there; the existing 'tor' d19 message),
   // so the caller's RESUME (or his clock at 0) restarts both phones together. Kill switch: window.__rl_no600tor
   if (other && !X.me && !X.auto600 && !Wn.__rl_no600tor && screen === 'timeout') { X.auto600 = 1; try { resumeFromTimeout(); } catch (e) {} }
   if (typeof paused !== 'undefined' && paused) return;
   S.tl = Math.max(0, S.tl - dt);
   const sec = Math.ceil(S.tl);
   if (sec !== shown && screen === 'timeout') { shown = sec; try { panelDirty(); } catch (e) {} }
   if (S.tl <= 0 && screen === 'timeout' && !S.auto) { S.auto = 1; LOG.auto++; try { resumeFromTimeout(); } catch (e) {} }
  } catch (e) {}
 }, 100);
})();
