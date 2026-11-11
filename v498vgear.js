/* v498vgear: GEAR on the GET READY screen for the VETERANS TOURNAMENT (Bagga Lax 1.2).
   Charlie (Nov 10 2026, screenshot of GET READY - SPACE FORCE vs MARINES): "Can't put gear on them here" /
   "There's no button to put it on".
   Cause: a normal quick game goes PICK TEAM > PICK OPPONENT > MATCHUP, and the MATCHUP screen has the GEAR button
   (openGear17 -> match gear store -> V17.gameStart puts it on the players). The VETERANS TOURNAMENT (v489vets.js,
   playStep) calls newGame() straight from its bracket, so the player lands on GET READY (drawPregame), which never had
   a GEAR button -> no way to gear a Veterans team for a tournament game.
   Fix: on GET READY of a Veterans tournament game (game.vets489) - and of any offline quick game where you play an
   N/A team (the six service teams or the Ghosts) - a GEAR button opens the same gear screen (openGear17, kind
   'match') the MATCHUP screen uses. Back on GET READY the game's gear is rebuilt with the game's own V17.gameStart
   (item boosts are first rolled back to what they were before the first gameStart, so nothing is counted twice).
   The game object, game.vets489 and the tournament's result tracking stay the same.
   Ids, rl_* keys, __rl_* flags and the net protocol are unchanged. No new save keys.
   Kill switch: window.__rl_no498vg = true (set before this file loads). */
(function() {
 'use strict';
 const off = () => !!(window.__rl_no498vg || window.__rl_v124gb);
 if (off() || !window.V17 || typeof window.drawPregame !== 'function' || typeof window.openGear17 !== 'function') return;
 const V = window.V498VG = { log: [], err: [] };
 const note = s => { V.log.push(s); if (V.log.length > 30) V.log.shift(); };
 const fail = (w, e) => { V.err.push(w + ': ' + String(e && e.message || e)); try { console.warn('v498', w, e); } catch (x) {} };

 // ---------- remember the item boosts from before the game's own gear step ----------
 const B0 = new WeakMap, B1 = new WeakMap;
 const getB = () => { try { return BOOST; } catch (e) { return undefined; } };
 const setB = b => { try { BOOST = b; return true; } catch (e) { return false; } };
 const GS0 = V17.gameStart;
 if (typeof GS0 === 'function') V17.gameStart = function(G) {
  const pre = getB();
  const r = GS0.apply(this, arguments);
  try { if (G && typeof G === 'object') { B0.set(G, pre); B1.set(G, getB()); } } catch (e) {}
  return r;
 };

 const naTeam = id => { try { return !!(id && typeof GH_REG !== 'undefined' && GH_REG[id]); } catch (e) { return false; } };
 function want(G) {
  if (off() || !G || screen !== 'pregame') return false;
  if (G.online || G.tutorial || G.mode !== 'quick' || G.meta && (G.meta.online || G.meta.ult25 || G.meta.car459 || G.meta.fm460)) return false;
  if (G.coin && G.coin.phase !== 'done') return false;
  if (G.preT > 50) return false;           // START already tapped
  if (G.walk) return false;
  return !!(G.vets489 || naTeam(G.user));
 }

 let pend = null;   // the game whose gear screen is open
 function rebuild(G) {
  try {
   if (B1.has(G) && getB() === B1.get(G)) setB(B0.get(G));
   else if (B0.has(G)) { setB(B0.get(G)); note('boost changed after start; rolled back to pre-start'); }
   V17.gameStart(G);
   try { if (typeof VS !== 'undefined' && VS && VS.side) for (const s of VS.side) s.key = null; } catch (e) {}
   note('rebuilt gear ' + G.user + ' ' + JSON.stringify(G.g17 && G.g17.gear || {}).length);
  } catch (e) { fail('rebuild', e); }
 }

 const DP0 = window.drawPregame;
 window.drawPregame = function() {
  const G = typeof game !== 'undefined' ? game : null;
  if (pend) {
   const p = pend;
   pend = null;
   if (G && G === p && !off()) rebuild(G);
  }
  const r = DP0.apply(this, arguments);
  try {
   if (want(G)) button('GEAR', 6, 4, 40, 14, () => {
    if (!want(G)) return;
    pend = G;
    try { openGear17(G.user, 'pregame'); } catch (e) { pend = null; fail('open', e); }
    if (screen !== 'gear17') pend = null;
   }, { bg: '#ffcc33' });
  } catch (e) { fail('btn', e); }
  return r;
 };
 // leaving the gear screen any other way than back to GET READY: forget it
 try {
  const tick = () => { if (pend && screen !== 'gear17' && screen !== 'pregame') pend = null; };
  setInterval(tick, 500);
 } catch (e) {}

 // ---------- equipped items REPLACE the built-in parts of the Veterans looks ----------
 // Charlie (Nov 10): "like with the Space Force uniform that has a visor on the helmet already - if you add a visor it
 // actually is replaced and shown. Same for all other items."
 // The Veterans looks (v489vets.js) recolour pixels through RL12.g27, which the gear bake asks AFTER the item pixels but
 // BEFORE the item palette. So: a visor item painted only its band while the astronaut gold / pilot dark visor kept the
 // rest of the face; the leather helmet (a palette item) lost to the camo / pilot / astronaut / galaxy helmet colours.
 // Here, inside a gear bake (rows are the bake's own copy, not the plain frame), a Veterans look steps back:
 //  - a visor item is on -> no built-in visor: the face shows the player's skin + cage, and the item's visor band;
 //  - a helmet item is on (the bake reshaped the helmet rows) -> no built-in helmet colour: the item's helmet shows.
 // Collar, cleats, stick, tape, shorts and cellys already drew over the looks; plain (no-gear) bakes are untouched.
 try {
  if (typeof RL12 !== 'undefined' && RL12 && typeof RL12.g27 === 'function' && typeof RL12.palette === 'function' && V17.BY) {
   let ctx = null;
   const PAL0 = RL12.palette;
   RL12.palette = function() {
    if (!off()) {
     const c = ctx = { visor: false };
     try { queueMicrotask(() => { if (ctx === c) ctx = null; }); } catch (e) {}
    }
    return PAL0.apply(this, arguments);
   };
   for (const it of Object.values(V17.BY)) {
    if (!it || it.slot !== 'visor' || !it.id) continue;
    const d = Object.getOwnPropertyDescriptor(V17.BY, it.id);
    if (!d || !d.configurable || !('value' in d)) continue;
    let v = d.value;
    Object.defineProperty(V17.BY, it.id, { configurable: true, enumerable: d.enumerable, get() { if (ctx) ctx.visor = true; return v; }, set(n) { v = n; } });
   }
   const isSk = ch => ch === 'S' || ch === 's' || ch === 'Z';
   const isJ = ch => ch === 'J' || ch === 'j';
   const rinfo = new WeakMap;
   function info(rows, name) {
    let a = rinfo.get(rows);
    if (a) return a;
    let jTop = -1, faceTop = -1, helm = false;
    for (let r = 0; r < rows.length; r++) if (jTop < 0 && /[Jj]/.test(rows[r])) jTop = r;
    if (jTop < 0) jTop = rows.length;
    for (let r = 0; r < jTop; r++) if (faceTop < 0 && /[SsZ]/.test(rows[r])) faceTop = r;
    try {
     const o = RL12.FR[name] && RL12.FR[name][3];
     const hc = ch => ch === 'H' || ch === 'h' || ch === 'w';
     if (o) for (let r = 0; r < Math.min(jTop, o.length) && !helm; r++) {
      const A = String(o[r]), B = String(rows[r]);
      if (A !== B) for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i] && (hc(A[i]) || hc(B[i]))) { helm = true; break; }
     }
    } catch (e) {}
    a = { jTop: jTop, faceTop: faceTop, helm: helm, visor: !!(ctx && ctx.visor) };
    rinfo.set(rows, a);
    return a;
   }
   const G27 = RL12.g27;
   RL12.g27 = function(kit, ch, q, r, rows, name) {
    try {
     const m = kit && kit.g27;
     if (!off() && typeof m === 'string' && m.indexOf('v489') === 0 && rows && RL12.FR && RL12.FR[name] && rows !== RL12.FR[name][3]) {
      const a = info(rows, name), above = r < a.jTop;
      if (above && a.visor && (m === 'v489astro' || m === 'v489pilot') && a.faceTop >= 0 && r >= a.faceTop && (isSk(ch) || ch === 'C' || ch === 'c')) return null;
      if (above && a.helm && (ch === 'H' || ch === 'h' || ch === 'w')) return null;
     }
    } catch (e) {}
    return G27.apply(this, arguments);
   };
   V.rinfo = rinfo;
   note('looks: items win');
  }
 } catch (e) { fail('looks', e); }
 note('on');
})();
