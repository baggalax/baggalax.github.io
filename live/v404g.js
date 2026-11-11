/* V40.0.4g - in-game: (A) offense flows into the selected set by itself after a transition
   (nearest open spot, no SET press); (B) the user's ball carrier never passes on his own;
   (C) custom offensive sets (saved from the play designer's SETS tab) work like built-in ones.
   Kill switch: window.__rl_no404g = true  -> behaves exactly like before. */
(function () {
 'use strict';
 if (window.__rl_v404g_loaded) return;
 window.__rl_v404g_loaded = 1;
 const off = () => !!window.__rl_no404g || !!window.__rl_v124gb;
 const G_ = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const online = G => !!(G && (G.online || G.meta && G.meta.online));
 const hyp = Math.hypot;

 /* ---------------- (C) custom sets ---------------- */
 const KEY = 'usersets'; // stored as rl_usersets through the game's LS wrapper
 const BUILTIN = new Set([].concat(
  typeof USER_SETS !== 'undefined' ? USER_SETS.slice() : [],
  typeof SET_NAMES !== 'undefined' ? SET_NAMES : [],
  typeof EMO !== 'undefined' ? Object.keys(EMO) : [],
  typeof SETS !== 'undefined' ? Object.keys(SETS) : []));
 const lsGet = () => {
  try { const v = typeof LS !== 'undefined' ? LS.get(KEY, []) : JSON.parse(localStorage.getItem('rl_' + KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
 };
 const lsSet = v => {
  try { if (typeof LS !== 'undefined') LS.set(KEY, v); else localStorage.setItem('rl_' + KEY, JSON.stringify(v)); } catch (e) {}
 };
 const cleanName = n => {
  let s = String(n == null ? '' : n).toUpperCase().replace(/[^A-Z0-9 \-.!#']/g, '').replace(/\s+/g, ' ').trim().slice(0, 12).trim();
  return s || 'MY SET';
 };
 const cleanSpots = sp => {
  if (!Array.isArray(sp) || sp.length !== 6) return null;
  const out = [];
  for (const q of sp) {
   const x = +(q && q[0]), y = +(q && q[1]);
   if (!isFinite(x) || !isFinite(y)) return null;
   out.push(typeof pmClampSpot === 'function' ? pmClampSpot(x, y) : [ Math.round(x), Math.round(y) ]);
  }
  return out;
 };
 const reg = (name, spots) => {
  if (typeof SETS === 'undefined' || BUILTIN.has(name)) return;
  SETS[name] = spots.map(q => q.slice());
  if (typeof USER_SETS !== 'undefined' && !USER_SETS.includes(name)) USER_SETS.push(name);
  if (typeof SET_INFO !== 'undefined') SET_INFO[name] = 'YOUR SET';
 };
 const unreg = name => {
  if (typeof SETS === 'undefined' || BUILTIN.has(name)) return;
  delete SETS[name];
  if (typeof USER_SETS !== 'undefined') { const i = USER_SETS.indexOf(name); if (i >= 0) USER_SETS.splice(i, 1); }
  if (typeof SET_INFO !== 'undefined') delete SET_INFO[name];
 };
 function sets() {
  return lsGet().filter(s => s && typeof s.name === 'string' && cleanSpots(s.spots)).map(s => ({ name: s.name, spots: s.spots.map(q => q.slice()) }));
 }
 function saveSet(name, spots) {
  const sp = cleanSpots(spots);
  if (!sp) return null;
  let base = cleanName(name), nm = base, k = 2;
  while (BUILTIN.has(nm)) { const suf = ' ' + k++; nm = base.slice(0, 12 - suf.length).trim() + suf; }
  const L = lsGet().filter(s => s && s.name !== nm);
  L.push({ name: nm, spots: sp });
  lsSet(L);
  if (!off()) {
   reg(nm, sp);
   const G = G_();
   if (G && G.oset === nm && typeof setOffense === 'function') { try { setOffense(nm); } catch (e) {} }
  }
  return nm;
 }
 function delSet(name) {
  const nm = String(name || '');
  if (BUILTIN.has(nm)) return false;
  const L = lsGet(), M = L.filter(s => s && s.name !== nm);
  if (M.length === L.length && !(typeof SETS !== 'undefined' && SETS[nm])) return false;
  lsSet(M);
  unreg(nm);
  const G = G_();
  try {
   if (G && G.oset === nm) { if (typeof setOffense === 'function') setOffense('3-3'); else G.oset = '3-3'; }
   else if (typeof LS !== 'undefined' && LS.get('oset', '3-3') === nm) LS.set('oset', '3-3');
  } catch (e) {}
  return true;
 }
 if (!off()) for (const s of sets()) reg(s.name, cleanSpots(s.spots));

 /* ---------------- (B) no auto pass for the user's carrier ---------------- */
 let autoDepth = 0;
 const userCarrier = () => { const G = G_(); return !!(G && scr() === 'live' && G.carrier && G.carrier.team === 'O' && !online(G)); };
 if (typeof window.throwPass === 'function') {
  const TP0 = window.throwPass;
  window.throwPass = function (to) {
   if (autoDepth > 0 && !off() && userCarrier()) {
    const G = G_();
    G.noAuto404 = (G.noAuto404 || 0) + 1; // a pass the game tried to throw for you - blocked
    return;
   }
   return TP0.apply(this, arguments);
  };
 }
 // SET used to auto-pass the ball to the play's starting carrier. Now the guy holding the ball takes that role instead.
 if (typeof window.playSet === 'function') {
  const PS0 = window.playSet;
  window.playSet = function () {
   const r = PS0.apply(this, arguments);
   try {
    const G = G_(), S = G && G.pset;
    if (r && S && !off() && S.ap17 === 'wait' && G.carrier && S.pl && S.pl.car != null) {
     const c = S.pl.car, k = S.map.indexOf(G.carrier);
     if (k >= 0 && k !== c) { const t = S.map[c]; S.map[c] = G.carrier; S.map[k] = t; }
     S.st17 = G.carrier;
     S.ap17 = null;
     G.apSwap404 = (G.apSwap404 || 0) + 1;
    }
   } catch (e) { console.error(e); }
   return r;
  };
 }

 /* ---------------- (A) flow into the selected set ---------------- */
 const ARR = 12, MAXT = 12; // jog into the spot's area, then the normal off-ball AI plays around it
 function assign(P, SP) {
  // minimum total distance: nobody crosses the field, nobody is tied to a fixed spot
  const n = P.length, m = SP.length, D = P.map(p => SP.map(q => hyp(p.x - q[0], p.y - q[1])));
  let best = null, bs = 1e9;
  const used = new Array(m).fill(false), perm = [];
  const go = (i, acc) => {
   if (acc >= bs) return;
   if (i === n) { bs = acc; best = perm.slice(); return; }
   for (let j = 0; j < m; j++) { if (used[j]) continue; used[j] = true; perm[i] = j; go(i + 1, acc + D[i][j]); used[j] = false; }
  };
  go(0, 0);
  return best;
 }
 const busy = (G, p) => p.gk || p.down > 0 || p.pickSet || p.callPick || p.cut181 || G.help18 === p || (typeof isChaser === 'function' && isChaser(p));
 function release(G, restoreHome) {
  const A = G && G.ag404;
  if (!A) return;
  for (const p of G.players || []) {
   if (p.ag404) { if (p.playT === p.ag404) p.playT = null; p.ag404 = null; }
   if (restoreHome && A.mine && A.mine.has(p) && p.home && typeof curSpots === 'function') { const s = curSpots()[p.idx]; if (s) p.home = s.slice(); }
  }
  G.ag404 = null;
 }
 function settleTick(dt) {
  const G = G_();
  if (!G) return;
  if (off()) { if (G.ag404) release(G, true); return; }
  if (scr() !== 'live' || G.tutorial || online(G) || typeof curSpots !== 'function') return;
  const settled = typeof canShoot === 'function' && canShoot() && !G.clearing;
  const other = G.pset || (G.playRun && !G.playRun.done) || G.cset;
  let A = G.ag404;
  if (!settled || other) {
   if (A && A.moving) { for (const p of G.players) if (p.ag404) { if (p.playT === p.ag404) p.playT = null; p.ag404 = null; } A.moving = false; }
   if (A && A.poss !== G.possCount) release(G, false);
   return;
  }
  const SP = curSpots();
  const P = G.players.filter(p => p.team === 'O' && !p.gk && p.idx >= 0 && !p.far);
  const car = G.carrier;
  const sig = P.map(p => p.idx).join(',') + '|' + (car ? car.idx : -1);
  if (!A || A.poss !== G.possCount || A.sp !== SP) {
   release(G, false);
   A = G.ag404 = { poss: G.possCount, sp: SP, sig: '', map: new Map(), mine: new Set(), free: new Set(), t: 0, rt: 0, moving: true, n: (G.ag404n = (G.ag404n || 0) + 1) };
  }
  A.rt -= dt;
  if (A.sig !== sig || A.rt <= 0) {
   // the guy with the ball owns the spot nearest him; everyone else takes the nearest open spot
   // (min total distance). Re-checked every second so spots stay filled as the ball moves,
   // but only swapped when it clearly helps, so nobody flip-flops.
   A.rt = 1;
   let cs = -1;
   if (car && P.includes(car)) { let bd = 1e9; SP.forEach((q, j) => { const d = hyp(car.x - q[0], car.y - q[1]); if (d < bd) { bd = d; cs = j; } }); }
   const Q = P.filter(p => p !== car), idx = SP.map((q, j) => j).filter(j => j !== cs);
   const pick = assign(Q, idx.map(j => SP[j])) || [];
   const M = new Map();
   if (cs >= 0) M.set(car, cs);
   Q.forEach((p, i) => { if (pick[i] != null) M.set(p, idx[pick[i]]); });
   const cost = m => { let c = 0; for (const [p, j] of m) if (p !== car) c += hyp(p.x - SP[j][0], p.y - SP[j][1]); return c; };
   const keep = A.sig === sig && A.map.size === M.size && [...A.map.values()].every(j => j !== cs || A.map.get(car) === cs);
   if (!keep || cost(M) < cost(A.map) - 20) { A.map = M; A.swaps = (A.swaps || 0) + 1; }
   A.sig = sig;
  }
  A.t += dt;
  let left = 0;
  for (const [p, j] of A.map) {
   if (!G.players.includes(p)) continue;
   const q = SP[j];
   if (!q) continue;
   if (!p.home || p.home[0] !== q[0] || p.home[1] !== q[1]) p.home = q.slice();
   A.mine.add(p);
   // V40.0.5: a set is only the starting shape. Once a guy has reached his spot, had the ball, or been
   // told to cut / pick, he is playing lacrosse again (normal off-ball AI) and is never pulled back to it.
   const v405 = !window.__rl_no405s;
   if (v405 && (p === G.carrier || busy(G, p))) A.free.add(p);
   if (!A.moving || p === G.carrier || busy(G, p) || (v405 && A.free.has(p))) { if (p.ag404) { if (p.playT === p.ag404) p.playT = null; p.ag404 = null; } continue; }
   const d = hyp(p.x - q[0], p.y - q[1]);
   if (d > ARR && A.t < MAXT) {
    left++;
    if (p.playT && p.playT !== p.ag404) continue; // someone else steering him
    const w = typeof aroundCage === 'function' ? aroundCage(p, q[0], q[1]) : q.slice();
    p.ag404 = w;
    p.playT = w;
    p.playHold = null;
   } else if (p.ag404) {
    // in his spot's area: hand him back to the normal off-ball AI (cuts, picks, wander around his new home)
    if (p.playT === p.ag404) p.playT = null;
    p.ag404 = null;
    p.wander = 0;
    if (!window.__rl_no405s) { A.free.add(p); G.free405 = (G.free405 || 0) + 1; }
   } else if (!window.__rl_no405s && d <= ARR) A.free.add(p); // already in his spot's area: free to play from the start
  }
  if (A.moving && (left === 0 || A.t >= MAXT)) {
   A.moving = false;
   A.doneT = +A.t.toFixed(2);
   G.ag404done = (G.ag404done || 0) + 1;
  }
 }
 if (typeof window.playTick === 'function') {
  const PT0 = window.playTick;
  window.playTick = function (dt) {
   autoDepth++;
   let r;
   try { r = PT0.apply(this, arguments); } finally { autoDepth--; }
   try { settleTick(dt); } catch (e) { console.error(e); }
   return r;
  };
 }

 /* ---- (B2) the clear: your goalie/holder no longer throws the outlet on his own ---- */
 let defDepth = 0;
 const offClr = () => off() || !!window.__rl_no404gclr;
 if (typeof window.updateDefense === 'function') {
  const UD0 = window.updateDefense;
  window.updateDefense = function () {
   defDepth++;
   try { return UD0.apply(this, arguments); } finally { defDepth--; }
  };
 }
 if (typeof window.dThrowClear === 'function') {
  const DT0 = window.dThrowClear;
  window.dThrowClear = function () {
   const G = G_();
   if (defDepth > 0 && !offClr() && G && !G.tutorial && !online(G) && G.dclear) {
    G.noAutoClr404 = (G.noAutoClr404 || 0) + 1;
    return;
   }
   return DT0.apply(this, arguments);
  };
 }

 /* ---- (A2) a selected CLEAR sets itself and runs itself (SET / RUN buttons still work) ---- */
 function autoClear() {
  const G = G_();
  if (!G || G.tutorial || online(G) || typeof clrSel !== 'function' || typeof clrCtx !== 'function' || !clrSel()) return;
  const ctx = clrCtx();
  if (!ctx) return;
  if (!G.cset) {
   const key = ctx === 'd' ? G.dclear : 'l' + G.possCount;
   if (G.ac404k === key) return;
   if (ctx === 'l' && G.ac404skip === key) return; // this clear already started on the defense screen
   G.ac404k = key;
   if (typeof clrSet === 'function' && clrSet()) {
    G.cset.ac404 = 1;
    if (ctx === 'd') G.ac404skip = 'l' + (G.possCount + 1);
    G.autoClr404 = (G.autoClr404 || 0) + 1;
   }
   return;
  }
  if (G.cset.phase === 'ready' && typeof clrGo === 'function' && clrGo()) G.autoClrRun404 = (G.autoClrRun404 || 0) + 1;
 }
 if (typeof window.clrTick === 'function') {
  const CT0 = window.clrTick;
  window.clrTick = function () {
   if (!off()) try { autoClear(); } catch (e) { console.error(e); }
   return CT0.apply(this, arguments);
  };
 }
 /* ---- V40.0.5 (C2) setting up a PLAY: your guy with the ball is never auto-walked to his spot (you move him);
    in a man-up play he also stays yours once it runs. Kill switch: window.__rl_no405s = true ---- */
 const off405 = () => off() || !!window.__rl_no405s;
 if (typeof window.psetTick === 'function') {
  const PST0 = window.psetTick;
  window.psetTick = function (dt) {
   const G = G_(), S = G && G.pset;
   if (off405() || !S || G.tutorial || online(G) || !G.carrier || G.carrier.team !== 'O' || !Array.isArray(S.map)) return PST0.apply(this, arguments);
   const c = G.carrier, k = S.map.indexOf(c), run = G.run;
   if (k < 0) return PST0.apply(this, arguments);
   S.map[k] = null; // the set-up step skips him: no auto walk, no stopping your stick
   try { return PST0.apply(this, arguments); } finally {
    if (G.pset === S && S.map[k] == null) S.map[k] = c;
    if (G.pAuto && G.pAuto[2]) G.pAuto = null;
    if (G.run == null && run) G.run = run;
    G.carFree405 = (G.carFree405 || 0) + 1;
   }
  };
 }
 if (typeof window.playGo === 'function') {
  const PG0 = window.playGo;
  window.playGo = function () {
   const G = G_(), S = G && G.pset;
   const r = PG0.apply(this, arguments);
   try { if (r && !off405() && S && S.mu405 && G.playRun) { G.playRun.userTook = true; G.playRun.mu405 = 1; } } catch (e) { console.error(e); }
   return r;
  };
 }
 window.V404G = { saveSet: saveSet, sets: sets, delSet: delSet, assign: assign, on: () => !off() };
})();
