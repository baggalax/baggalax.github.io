/* v422st.js - V42.2 stamina (kill switch: window.__rl_no422st = true; CPU subs only: window.__rl_no422stc = true)
 * Charlie (Nov 3): "add stamina if a middie is going back and fourth he should get tired and need a sub eventually ...
 * i dont want this to have a huge affect on the game but be a small add so you dont use the same guys all game.
 * It should mainly affect middies and LSM but can affect all players ... zzzs start forming over his head and get
 * slightly just slightly slower and then the coach will say you should probably sub him off".
 * Model: every player has 0-100 stamina per game (both teams). It drains while he is on the field (G.players and the
 * far-end players), more the more he runs; middies / LSM / FOGO drain at full rate, attack and D at a fraction, goalies
 * barely. It comes back slowly while his unit is off (O middies on a D possession), a little in every dead ball and at the
 * quarter breaks, and fast on the bench (not in the lineup). Rates scale with the game length (periods x quarter length),
 * so a middie who never comes off gets tired around half time whatever the quarter length.
 * Effect: speed only, and only below 40: x1.00 at 40+, down to x0.93 at 0 (spdMul hook). Nothing else changes.
 * Visuals: pixel z's over a tired player's head (1 z under 50, 2 under 35, 3 under 20); at the next whistle the user's
 * coach points and says "#NN IS GASSED - SUB HIM OFF?" (live-play bubbles are hidden by v40msg, and a whistle is when you
 * can sub) - once per player per tired spell (spell ends when he is back over 60), 12 s apart.
 * Subs: presence based - whatever path takes a player off the field (existing lineup/timeout, injuries, stick subs,
 * v421s box/midline subs) he starts recovering the frame he is gone; window.ST422.onSub(offId, onId) is there for
 * explicit bookkeeping. CPU: the game's CPU never subbed on its own (only injuries / ejections / broken sticks); at a dead
 * ball it now swaps a gassed middie / LSM / D / attackman (< 30) for its most rested player of the same kind (65+): a bench
 * guy through the game's own subFor, or a lineup guy whose unit is off the field (slot swap). __rl_no422stc turns that off.
 * Off in online games, the tutorial, practice and BRAVEHEART. Net protocol untouched. No storage keys.
 */
(function () {
 'use strict';
 if (typeof window === 'undefined' || typeof step !== 'function' || typeof spdMul !== 'function') return;
 const off = () => !!(window.__rl_no422st || window.__rl_v124gb);
 const CFG = {
  ref: 360,            // game seconds (4 x 90) the rates below are tuned for; other lengths scale
  base: .18,          // drain/s on the field just for being out there (live / defense)
  mv: .29,            // + drain/s at full running speed (PACE.run), scales with speed, capped x1.6
  posF: { M: 1, LSM: .85, SSDM: 1, FO: 1, A: .45, D: .5, G: .12 },
  unitRest: .11,       // in the lineup but his unit is off (O middie on a D possession) - per live second
  dead: .22,           // everyone in the lineup, per dead-ball second (banner, timeout, penalty, faceoff wait)
  bench: 1.6,          // not in the lineup (subbed off) - per second, any screen
  qbreak: 4, half: 10, // quarter break / half time bump
  z1: 50, z2: 35, z3: 20,
  slowAt: 40, slowMax: .07,
  coachAt: 35, spellEnd: 60, coachCd: 12,
  cpuSub: 30, cpuFresh: 65
 };
 const LOG = window.V422ST = { CFG: CFG, frames: 0, coach: [], cpuSubs: [], zFrames: 0, errs: 0, lastErr: null };
 const ACTIVE = { live: 1, defense: 1, cpu: 1 };
 const SHOWZ = { live: 1, defense: 1, faceoff: 1, banner: 1, penalty: 1, timeout: 1, cpu: 1 };
 const COACHSCR = { banner: 1, faceoff: 1, penalty: 1, qbreak: 1 };   // live-play bubbles are hidden by v40msg - the coach talks at the whistle
 function err(e, w) { LOG.errs++; LOG.lastErr = (w || '') + ': ' + String(e && e.message || e).slice(0, 160); if (LOG.errs < 5) console.warn('v422st', w, e); }
 function G0() { try { return game; } catch (e) { return null; } }
 function scr() { try { return screen; } catch (e) { return ''; } }
 function on(G) {
  return !off() && !!G && !!G.lu && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !G.practice && !G.brave;
 }
 const sideOf = p => p.team === 'O' || p.team === 'G2' || p.team === 'U' ? 'u' : 'c';
 const keyOf = p => p && p.pl && p.pl.id != null ? sideOf(p) + ':' + p.pl.id : null;
 function S(G) {
  let s = G.st422;
  if (!s) s = G.st422 = { v: {}, pos: {}, last: new Map, spell: {}, coachT: -99, q: G.q, wasDead: false, swapT: {} };
  return s;
 }
 function luIds(G, side) {
  const lu = G.lu && G.lu[side === 'u' ? 0 : 1], out = new Set;
  if (!lu || typeof SLOTS === 'undefined') return out;
  for (const sl of SLOTS) { const id = slotGet(lu, sl[0]); if (id != null) out.add(id); }
  return out;
 }
 function fieldList(G) {
  return (G.players || []).concat(G.farU || [], G.farC || []);
 }
 function posF(pos) { const f = CFG.posF[pos]; return f == null ? .6 : f; }
 function scale(G) {
  const T = (G.periods || 4) * (G.qlen || 90);
  return Math.max(.25, Math.min(4, CFG.ref / Math.max(30, T)));
 }
 function val(G, k) { const s = G && G.st422; const v = s && s.v[k]; return v == null ? 100 : v; }
 function mulOf(v) { return v >= CFG.slowAt ? 1 : 1 - CFG.slowMax * (CFG.slowAt - Math.max(0, v)) / CFG.slowAt; }
 function tick(dt) {
  const G = G0();
  if (!on(G) || !(dt > 0) || dt > .25) return;
  const st = S(G), sc = scr(), k = scale(G);
  if (sc === 'final' || sc === 'pregame') return;
  LOG.frames++;
  // quarter breaks
  if (G.q !== st.q) {
   const bump = st.q === 2 && G.q === 3 ? CFG.half : CFG.qbreak;
   for (const key in st.v) st.v[key] = Math.min(100, st.v[key] + bump);
   st.q = G.q;
  }
  const active = !!ACTIVE[sc], fo = sc === 'faceoff', dead = !active && !fo;
  const seen = new Set, nl = new Map;
  if (!dead) {
   for (const p of fieldList(G)) {
    const key = keyOf(p);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const pos = p.pl.pos || 'M';
    st.pos[key] = pos;
    const q = st.last.get(key);
    let v = 0;
    if (q && q[2] === p) { const d = Math.hypot(p.x - q[0], p.y - q[1]); if (d < 4) v = d / dt; }
    nl.set(key, [ p.x, p.y, p ]);
    const run = Math.min(1.6, v / ((typeof PACE !== 'undefined' && PACE.run) || 22));
    const drain = k * posF(pos) * ((active ? CFG.base : 0) + CFG.mv * run) * dt;
    st.v[key] = Math.max(0, val(G, key) - drain);
   }
  }
  st.last = nl;
  const lu = { u: luIds(G, 'u'), c: luIds(G, 'c') };
  for (const key in st.v) {
   if (seen.has(key)) continue;
   const id = key.slice(2), inLu = lu[key[0]].has(id) || lu[key[0]].has(+id);
   const r = !inLu ? CFG.bench : dead ? CFG.dead : CFG.unitRest;
   st.v[key] = Math.min(100, st.v[key] + r * k * dt);
  }
  if (dead) for (const key of seen) st.v[key] = Math.min(100, st.v[key] + CFG.dead * k * dt);
  // tired spells + coach
  for (const key in st.v) {
   const v = st.v[key];
   if (st.spell[key] && v >= CFG.spellEnd) delete st.spell[key];
  }
  try { coach(G, st, sc, lu.u); } catch (e) { err(e, 'coach'); }
  try { if (dead && !st.wasDead) cpuSubs(G, st, lu.c); } catch (e) { err(e, 'cpusub'); }
  st.wasDead = dead;
 }
 function coach(G, st, sc, luU) {
  if (!COACHSCR[sc]) return;
  const now = typeof menuT === 'number' ? menuT : performance.now() / 1e3;
  let worst = null;
  for (const key in st.v) {
   if (key[0] !== 'u' || st.spell[key]) continue;
   const v = st.v[key], id = key.slice(2);
   if (v >= CFG.coachAt || st.pos[key] === 'G') continue;
   if (!(luU.has(id) || luU.has(+id))) continue;
   if (!worst || v < worst[1]) worst = [ key, v, id ];
  }
  if (!worst || now - st.coachT < CFG.coachCd) return;
  st.spell[worst[0]] = true;
  st.coachT = now;
  const pl = typeof PP === 'function' ? PP(worst[2]) || PP(+worst[2]) : null;
  let num = '';
  try { num = pl ? (typeof gameNum15 === 'function' ? gameNum15(pl) : jerseyNo(pl)) : ''; } catch (e) { num = ''; }
  const who = num !== '' && num != null ? '#' + num : pl ? String(lastName(pl)).toUpperCase() : 'HE';
  const s = who + ' IS GASSED - SUB HIM OFF?';
  try {
   if (typeof pop12 === 'function' && typeof coachX === 'function') {
    const cx = clamp(coachX('u'), Math.round(camX) + 70, Math.round(camX) + W - 70);
    pop12(s, cx, H - 36, '#ffe14d', 2.8, true);
   }
   G.coachPoint = G.coachPoint || {};
   G.coachPoint.u = now;
  } catch (e) { err(e, 'pop'); }
  LOG.coach.push({ id: worst[2], s: s, v: Math.round(worst[1]), q: G.q, clock: Math.round(G.clock || 0) });
  G.st422coach = (G.st422coach || 0) + 1;
 }
 const GROUP = { M: [ 'M', 'SSDM' ], SSDM: [ 'M', 'SSDM' ], LSM: [ 'LSM', 'D' ], D: [ 'D', 'LSM' ], A: [ 'A' ] };
 function outNow(G, id) {
  const has = L => (L || []).some(x => String(x) === String(id));
  if (has(G.ejected) || has(G.concOut) || has(G.gout16) || has(G.ns17)) return true;
  try { if (G.mode === 'season' && typeof injOf === 'function' && injOf(id)) return true; } catch (e) {}
  return false;
 }
 // swap a tired guy for the most rested player of his kind: a bench guy (the game's own subFor) or a lineup guy whose
 // unit is off the field right now (slot swap). Used by the CPU at dead balls; exposed as ST422.rotate for the user side.
 function rotate(G, side, id, minFresh) {
  const sd = side === 1 || side === 'c' ? 'c' : 'u', si = sd === 'u' ? 0 : 1, lu = G.lu[si], st = S(G);
  const me = typeof PP === 'function' ? PP(id) || PP(+id) : null;
  if (!me || me.pos === 'G' || me.pos === 'FO' || !lu) return null;
  const grp = GROUP[me.pos] || [ me.pos ], src = G.mode === 'season' ? 'season' : 'real';
  const ros = teamRosterIds(si === 0 ? G.user : G.opp, src);
  const slotOf = pid => SLOTS.map(s => s[0]).filter(k => String(slotGet(lu, k)) === String(pid));
  const myK = slotOf(id);
  if (!myK.length) return null;
  const myU = new Set(myK.map(unitOf)), now = typeof menuT === 'number' ? menuT : performance.now() / 1e3;
  if (st.swapT[id] != null && now - st.swapT[id] < 30) return null;   // just moved to a resting unit - let him rest
  const onF = new Set;
  for (const p of fieldList(G)) { const k = keyOf(p); if (k && k[0] === sd) onF.add(k.slice(2)); }
  let best = null;
  for (const cid of ros) {
   if (String(cid) === String(id) || outNow(G, cid)) continue;
   const c = PP(cid);
   if (!c || grp.indexOf(c.pos) < 0) continue;
   const v = val(G, sd + ':' + cid);
   if (v < (minFresh || 70)) continue;
   const ks = slotOf(cid);
   if (ks.length && (onF.has(String(cid)) || ks.some(k => k === 'G' || k === 'FO' || myU.has(unitOf(k))))) continue;
   if (st.swapT[cid] != null && now - st.swapT[cid] < 30) continue;
   const sc = v + (ks.length ? 0 : 5) + c.ovr * .1 + (c.pos === me.pos ? 8 : 0);
   if (!best || sc > best[0]) best = [ sc, cid, ks ];
  }
  if (!best) return null;
  const cid = best[1];
  if (!best[2].length) {
   const got = subFor(si, id, false, cid);
   if (got == null || String(got) !== String(cid)) return got;
  } else {
   for (const k of myK) slotSet(lu, k, cid);
   for (const k of best[2]) slotSet(lu, k, id);
   const tm = si === 0 ? [ 'O', 'U' ] : [ 'D', 'C' ];
   for (const p of fieldList(G)) if (p.pl && tm.includes(p.team) && String(p.pl.id) === String(id)) p.pl = PP(cid);
   (G.subs = G.subs || []).push({ side: si, out: id, in: cid, swap: true });
  }
  st.swapT[cid] = now;
  st.swapT[id] = now;
  st.last.delete(sd + ':' + id);
  st.last.delete(sd + ':' + cid);
  return cid;
 }
 function cpuSubs(G, st, luC) {
  if (window.__rl_no422stc || typeof subFor !== 'function') return;
  let n = 0;
  const tired = Object.keys(st.v).filter(k => k[0] === 'c' && st.v[k] < CFG.cpuSub && st.pos[k] !== 'G' && st.pos[k] !== 'FO').sort((a, b) => st.v[a] - st.v[b]);
  for (const key of tired) {
   const id = key.slice(2);
   if (!(luC.has(id) || luC.has(+id))) continue;
   const v = st.v[key], got = rotate(G, 1, id, CFG.cpuFresh);
   if (got == null) continue;
   LOG.cpuSubs.push({ off: id, on: got, v: Math.round(v), q: G.q, clock: Math.round(G.clock || 0) });
   if (++n >= 2) return;
  }
 }
 // ---- speed: only below 40, x0.93 at the bottom
 const SM0 = window.spdMul;
 window.spdMul = function (p) {
  const r = SM0.apply(this, arguments);
  try {
   const G = G0();
   if (!p || !p.pl || p.team === 'G' || p.team === 'G2' || !G || !G.st422 || !on(G)) return r;
   const v = G.st422.v[sideOf(p) + ':' + p.pl.id];
   return v == null || v >= CFG.slowAt ? r : r * mulOf(v);
  } catch (e) { return r; }
 };
 // ---- per-frame stamina after the game's own step
 const S0 = window.step;
 window.step = function (dt) {
  const r = S0.apply(this, arguments);
  try { tick(dt); } catch (e) { err(e, 'tick'); }
  return r;
 };
 // ---- z's over tired heads
 function zGlyph(x, y, n, col) {
  // n = 3 or 4 pixel "z" (V42.5b: was 4 -> 5), 1 px dark shadow
  const draw = (ox, oy, c) => {
   rect(x + ox, y + oy, n, 1, c);
   for (let i = 1; i < n - 1; i++) rect(x + ox + n - 1 - i, y + oy + i, 1, 1, c);
   rect(x + ox, y + oy + n - 1, n, 1, c);
  };
  draw(1, 1, 'rgba(0,0,0,.55)');
  draw(0, 0, col);
 }
 function drawZ(G) {
  const st = G.st422;
  if (!st) return;
  const t = typeof menuT === 'number' ? menuT : performance.now() / 1e3;
  const seen = new Set;
  for (const p of fieldList(G)) {
   const key = keyOf(p);
   if (!key || seen.has(key)) continue;
   seen.add(key);
   const v = st.v[key];
   if (v == null || v >= CFG.z1) continue;
   if (p.gk || p.team === 'G' || p.team === 'G2' || p.role === 'G' && p.far) continue;
   const lvl = v < CFG.z3 ? 3 : v < CFG.z2 ? 2 : 1;
   const X = Math.round(p.x + (p._sox || 0)), Y = Math.round(p.y + (p._soy || 0));
   const ph = ((parseInt(String(p.pl.id).replace(/\D/g, ''), 10) || 0) % 7) * .23;
   for (let i = 0; i < lvl; i++) {
    const u = ((t * .3 + ph + i / lvl) % 1);   // each z drifts slowly up and to the right, then starts over (V42.5b: smaller, softer)
    const zx = X + 3 + Math.round(u * 4), zy = Y - 14 - Math.round(u * 6);
    const a = u < .12 ? u / .12 : u > .82 ? (1 - u) / .18 : 1;
    g.globalAlpha = Math.max(0, Math.min(1, a)) * .8;
    zGlyph(zx, zy, u > .45 ? 4 : 3, '#f2f8ff');
   }
   g.globalAlpha = 1;
   G.st422z = (G.st422z || 0) + 1;
  }
  LOG.zFrames++;
 }
 const DP0 = window.drawPlayers;
 if (typeof DP0 === 'function') window.drawPlayers = function () {
  const r = DP0.apply(this, arguments);
  try { const G = G0(); if (on(G) && SHOWZ[scr()]) drawZ(G); } catch (e) { g.globalAlpha = 1; err(e, 'z'); }
  return r;
 };
 // ---- small stamina bar in the in-game LINEUP (timeout) list, optional
 function bar(G, id) {
  const v = Math.round(val(G, 'u:' + id)), col = v < CFG.z2 ? '#ff5a4a' : v < CFG.z1 ? '#ffe14d' : '#7dff7a';
  return '<span class="st422" title="STAMINA ' + v + '" style="display:inline-block;width:18px;height:4px;background:#1b2430;margin-left:4px;vertical-align:middle;border:1px solid #000"><span style="display:block;height:4px;width:' + v + '%;background:' + col + '"></span></span>';
 }
 try {
  if (typeof PANEL_RENDER !== 'undefined' && typeof PANEL_RENDER.lineup === 'function') {
   const RL0 = PANEL_RENDER.lineup;
   PANEL_RENDER.lineup = function () {
    const html = RL0.apply(this, arguments);
    try {
     const G = G0();
     if (!on(G) || !G.st422 || typeof PS === 'undefined' || PS.luBack !== 'timeout') return html;
     return html.replace(/(<tr data-a="assign" data-v="([^"]*)"[^>]*>.*?<td class="n">)(.*?)(<\/td>)/g, (m, a, id, b, c) => a + b + bar(G, id) + c)
      .replace(/(<button type="button" class="slot[^"]*" data-a="slot" data-v="([^"]*)"[^>]*>)(.*?)(<\/button>)/g, (m, a, sk, b, c) => { const id = slotGet(PS.lu, sk); return id == null ? m : a + b + bar(G, id) + c; });
    } catch (e) { err(e, 'lineup'); return html; }
   };
  }
 } catch (e) { err(e, 'lineupHook'); }
 // ---- API (also for v421s / tests)
 function find(G, id, side) {
  if (id && typeof id === 'object') return keyOf(id);
  if (side === 0 || side === 'u') return 'u:' + id;
  if (side === 1 || side === 'c') return 'c:' + id;
  const st = G && G.st422;
  if (st && st.v['u:' + id] != null) return 'u:' + id;
  if (st && st.v['c:' + id] != null) return 'c:' + id;
  const u = G && luIds(G, 'u');
  return u && (u.has(id) || u.has(+id)) ? 'u:' + id : 'c:' + id;
 }
 window.ST422 = {
  CFG: CFG,
  on: () => on(G0()),
  get(id, side) { const G = G0(); return on(G) ? Math.round(val(G, find(G, id, side)) * 10) / 10 : 100; },
  isTired(id, side) { return this.get(id, side) < CFG.slowAt; },
  speedMul(id, side) { return mulOf(this.get(id, side)); },
  tiredIds(side) { const G = G0(); if (!on(G) || !G.st422) return []; const sd = side === 1 || side === 'c' ? 'c' : 'u', lu = luIds(G, sd), st = G.st422;
   return Object.keys(st.v).filter(k => k[0] === sd && st.v[k] < CFG.coachAt && st.pos[k] !== 'G' && (lu.has(k.slice(2)) || lu.has(+k.slice(2)))).map(k => k.slice(2)); },
  rotate(id, side, minFresh) { const G = G0(); if (!on(G)) return null; try { return rotate(G, side == null ? 0 : side, id, minFresh); } catch (e) { err(e, 'rotate'); return null; } },
  onSub(offId, onId, side) {
   const G = G0(); if (!on(G)) return false; const st = S(G);
   const sd = side === 1 || side === 'c' ? 'c' : 'u';
   if (offId != null) st.last.delete(sd + ':' + offId);
   if (onId != null) st.last.delete(sd + ':' + onId);
   (LOG.subs = LOG.subs || []).push({ off: offId, on: onId, side: sd });
   return true;
  },
  set(id, v, side) { const G = G0(); if (!on(G)) return false; const st = S(G); st.v[find(G, id, side)] = Math.max(0, Math.min(100, +v)); return true; },
  snap() { const G = G0(); if (!G || !G.st422) return {}; const o = {}; for (const k in G.st422.v) o[k] = Math.round(G.st422.v[k]); return o; },
  report() { const G = G0(); return { coach: LOG.coach.slice(), cpuSubs: LOG.cpuSubs.slice(), errs: LOG.errs, lastErr: LOG.lastErr, coachN: G && G.st422coach || 0, pos: G && G.st422 ? Object.assign({}, G.st422.pos) : {} }; }
 };
})();
