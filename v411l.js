/* V40.1.1 LOCK OFF - Playbook category: tap one of THEIR guys, then tap YOUR guy -> yours face-guards him the whole
   possession (tight, between him and the ball, never slides off). The rest of your D plays the call you picked around him.
   Saved per opponent in localStorage 'rl_lockoff411'. Kill switch: window.__rl_no411l = true -> exactly like before. */
(function () {
 'use strict';
 if (window.__rl_v411l_loaded) return;
 window.__rl_v411l_loaded = 1;
 const off = () => !!window.__rl_no411l || !!window.__rl_v124gb;
 const LOG = { errs: [], frames: 0, dsum: 0, dmax: 0, near: 0, denied: 0, passTo: 0, swaps: 0, zoneRemap: 0, slideBlock: 0 };
 window.V411L = { on: false, LOG: LOG };
 if (off()) return;
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const err = (e, w) => { try { LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.error(e); } catch (x) {} };
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function () { return f.call(this, o, arguments); };
  return true;
 };
 const KEY = 'rl_lockoff411', MAXP = 3;
 const HOWTO = 'HOW TO: 1) TAP ONE OF THEIR GUYS  2) TAP YOUR GUY. YOUR GUY FACE-GUARDS HIM ALL GAME SO HE CANT GET THE BALL. THE REST OF YOUR D PLAYS YOUR D CALL.';
 const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

 /* ---------------- storage ---------------- */
 function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; }
 }
 function save(S) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
 const okG = G => !!G && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !G.brave;
 const keyOf = G => (G && G.opp != null ? String(G.opp) : '_slots');
 function pairs(G) {
  if (!G) { const S = load(); return Array.isArray(S._slots) ? S._slots : (S._slots = []); }
  if (!Array.isArray(G.lk411)) {
   const S = load(), L = S.byOpp && S.byOpp[keyOf(G)];
   G.lk411 = Array.isArray(L) ? L.filter(p => p && p.o != null && p.d != null).slice(0, MAXP).map(p => ({ o: p.o, d: p.d })) : [];
  }
  return G.lk411;
 }
 function persist(G) {
  const S = load();
  if (!G) { save(S); return; }
  S.byOpp = S.byOpp || {};
  const L = pairs(G);
  if (L.length) S.byOpp[keyOf(G)] = L.map(p => ({ o: p.o, d: p.d })); else delete S.byOpp[keyOf(G)];
  save(S);
 }
 function setPair(G, o, d) {
  let L = G ? pairs(G) : pairs(null);
  L = L.filter(p => String(p.o) !== String(o) && String(p.d) !== String(d));
  L.push({ o: o, d: d });
  while (L.length > MAXP) L.shift();
  if (G) G.lk411 = L; else { const S = load(); S._slots = L; save(S); return; }
  persist(G);
 }
 function clearPair(G, o) {
  if (G) { G.lk411 = pairs(G).filter(p => String(p.o) !== String(o)); persist(G); }
  else { const S = load(); S._slots = (S._slots || []).filter(p => String(p.o) !== String(o)); save(S); }
 }
 function clearAll(G) {
  if (G) { G.lk411 = []; persist(G); } else { const S = load(); S._slots = []; save(S); }
 }

 /* ---------------- who's who ---------------- */
 const srcOf = G => G.src || (G.mode === 'season' ? 'season' : 'real');
 const PPs = id => { try { return typeof PP === 'function' ? PP(id) : null; } catch (e) { return null; } };
 const lname = pl => { try { return String(lastName(pl) || '').toUpperCase().slice(0, 9); } catch (e) { return String(pl && (pl.n || pl.name) || '').split(' ').slice(-1)[0].toUpperCase().slice(0, 9); } };
 const numOf = pl => { try { const n = typeof gameNum15 === 'function' ? gameNum15(pl) : pl.num; return n == null || n === '' ? '' : String(n); } catch (e) { return ''; } };
 const tagOf = pl => pl ? ((numOf(pl) ? '#' + numOf(pl) + ' ' : '') + lname(pl)) : '?';
 const posOf = pl => pl && pl.pos ? String(pl.pos) : '';
 const GENERIC_O = [ 'M1', 'M2', 'M3', 'A1', 'A2', 'A3' ], GENERIC_D = [ 'SSDM', 'LSM', 'SSDM2', 'D1', 'D2', 'D3' ];
 function theirSix(G) {
  // [{id, pl, x, y}] their offensive six, at the spots they attack from (left cage, where they attack you)
  const out = [];
  try {
   if (G && G.players && G.lk411Def && G.players.some(p => p.team === 'D' && p.pl)) {
    for (const a of G.players) if (a.team === 'D' && a.pl) out.push({ id: a.pl.id, pl: a.pl, x: a.x, y: a.y });
    if (out.length) return out;
   }
  } catch (e) {}
  const setN = G && G.cpuSet && SETS[G.cpuSet] ? G.cpuSet : '3-3';
  const SP = SETS[setN].map(([x, y]) => [ FL - x, y ]);
  let ou = [];
  try { ou = G && G.lu && G.lu[1] ? offUnit(G.lu[1]) : []; } catch (e) { ou = []; }
  SP.forEach((s, i) => {
   const pl = ou[i];
   out.push(pl ? { id: pl.id, pl: pl, x: s[0], y: s[1] } : { id: 'slot:' + i, pl: null, gen: GENERIC_O[i], x: s[0], y: s[1] });
  });
  return out;
 }
 function theirBench(G, six) {
  if (!G || !G.opp) return [];
  try {
   const ids = new Set(six.map(s => s.id));
   return teamRosterIds(G.opp, srcOf(G)).map(PPs).filter(pl => pl && !ids.has(pl.id) && pl.pos !== 'G' && pl.pos !== 'FO' && pl.pos !== 'D' && pl.pos !== 'LSM' && pl.pos !== 'SSDM').slice(0, 10);
  } catch (e) { return []; }
 }
 function mySix(G) {
  const out = [];
  try {
   if (G && G.players && G.lk411Def && G.players.some(p => p.team === 'O' && p.pl)) {
    for (const d of G.players) if (d.team === 'O' && d.pl) out.push({ id: d.pl.id, pl: d.pl });
    if (out.length) return out;
   }
  } catch (e) {}
  let du = [];
  try { du = G && G.lu && G.lu[0] ? defUnit(G.lu[0]) : []; } catch (e) { du = []; }
  if (du.length) return du.map((pl, i) => pl ? { id: pl.id, pl: pl } : { id: 'slot:' + i, pl: null, gen: GENERIC_D[i] });
  return GENERIC_D.map((g, i) => ({ id: 'slot:' + i, pl: null, gen: g }));
 }
 function myBench(G, six) {
  if (!G || !G.user) return [];
  try {
   const ids = new Set(six.map(s => s.id));
   return teamRosterIds(G.user, srcOf(G)).map(PPs).filter(pl => pl && !ids.has(pl.id) && pl.pos !== 'G').slice(0, 14);
  } catch (e) { return []; }
 }
 function nameFor(G, id, mine) {
  if (String(id).startsWith('slot:')) return (mine ? GENERIC_D : GENERIC_O)[+String(id).slice(5)] || '?';
  const pl = PPs(id);
  return pl ? tagOf(pl) : '?';
 }

 /* ---------------- the LOCK OFF screen (inside the PLAYBOOK panel) ---------------- */
 const UI = { o: null, from: null };
 function fieldSvg(G, six, L) {
  const xs = six.map(s => s.x), ys = six.map(s => s.y);
  const x0 = Math.min(DGX - 14, Math.min.apply(null, xs) - 20), x1 = Math.max(DGX + 150, Math.max.apply(null, xs) + 22);
  const y0 = Math.min(CY - 70, Math.min.apply(null, ys) - 16), y1 = Math.max(CY + 70, Math.max.apply(null, ys) + 20);
  const vw = x1 - x0, vh = y1 - y0, X = x => (x - x0).toFixed(1), Y = y => (y - y0).toFixed(1);
  const lockedBy = id => L.find(p => String(p.o) === String(id));
  let s = '<svg id="lk411f" width="' + Math.round(vw * 1.55) + '" height="' + Math.round(vh * 1.55) + '" viewBox="0 0 ' + vw.toFixed(0) + ' ' + vh.toFixed(0) + '" style="flex:0 0 auto;background:#1f6b35;border:1px solid #9fd8a8;border-radius:3px;touch-action:manipulation">';
  s += '<circle cx="' + X(DGX) + '" cy="' + Y(CY) + '" r="' + CREASE + '" fill="none" stroke="#fff" stroke-width="1.2"/>';
  s += '<rect x="' + (+X(DGX) - 4) + '" y="' + (+Y(CY) - 5) + '" width="4" height="10" fill="#ff5a4a"/>';
  six.forEach(q => {
   const sel = UI.o != null && String(UI.o) === String(q.id), lk = lockedBy(q.id);
   const lab = q.pl ? (numOf(q.pl) || posOf(q.pl)) : q.gen;
   const nm = q.pl ? lname(q.pl) : q.gen;
   s += '<g data-a="lk411O" data-v="' + escH(q.id) + '" style="cursor:pointer">';
   s += '<circle cx="' + X(q.x) + '" cy="' + Y(q.y) + '" r="13" fill="rgba(0,0,0,0)"/>';
   if (sel) s += '<circle cx="' + X(q.x) + '" cy="' + Y(q.y) + '" r="10.5" fill="none" stroke="#ffe14d" stroke-width="2"/>';
   s += '<circle cx="' + X(q.x) + '" cy="' + Y(q.y) + '" r="7.5" fill="' + (lk ? '#7a1f1f' : '#ff5a4a') + '" stroke="' + (lk ? '#ffe14d' : '#000') + '" stroke-width="1.5"/>';
   s += '<text x="' + X(q.x) + '" y="' + (+Y(q.y) + 2.6) + '" font-size="7" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#fff">' + escH(String(lab).slice(0, 3)) + '</text>';
   s += '<text x="' + X(q.x) + '" y="' + (+Y(q.y) + 15.5) + '" font-size="5.6" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#fff" stroke="#000" stroke-width=".25">' + escH(nm.slice(0, 9)) + '</text>';
   if (lk) {
    s += '<rect x="' + (+X(q.x) - 15) + '" y="' + (+Y(q.y) - 19) + '" width="30" height="8" rx="1.5" fill="#ffe14d"/>';
    s += '<text x="' + X(q.x) + '" y="' + (+Y(q.y) - 13) + '" font-size="5.4" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#000">LOCK ' + escH(String(nameFor(G, lk.d, true)).split(' ')[0].slice(0, 4)) + '</text>';
   }
   s += '</g>';
  });
  return s + '</svg>';
 }
 function renderLock() {
  const G = G0(), live = !!G, L = pairs(G);
  const six = theirSix(G), mine = mySix(G);
  const tabs = '<div class="row tabs">' + btn('SETS', 'pbTab', 'SETS', 'd') + btn('PLAYS', 'pbTab', 'PLAYS', 'd') + btn('LOCK OFF', 'pbTab', 'LOCK', 'on') + '<span class="dim2">' + (live && G.opp ? 'VS ' + escH(T(G.opp).name || '') : 'ANY TEAM') + '</span></div>';
  const step = UI.o == null ? 1 : 2;
  const stepTxt = step === 1 ? 'STEP 1: TAP ONE OF THEIR GUYS TO LOCK OFF' : 'STEP 2: TAP YOUR GUY TO FACE-GUARD ' + escH(nameFor(G, UI.o, false));
  let right = '<div style="display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 auto">';
  right += '<div class="note" style="color:' + (step === 1 ? '#8fe3f0' : '#ffe14d') + '">' + stepTxt + '</div>';
  if (step === 1) {
   const bench = theirBench(G, six);
   if (bench.length) right += '<div class="dim2">OR THEIR BENCH:</div><div class="row">' + bench.map(pl => btn(tagOf(pl), 'lk411O', pl.id, L.some(p => String(p.o) === String(pl.id)) ? 'on' : 'd')).join('') + '</div>';
  } else {
   const bench = myBench(G, mine);
   right += '<div class="dim2">YOUR D ON THE FIELD:</div><div class="row">' + mine.map(q => btn(q.pl ? tagOf(q.pl) + (posOf(q.pl) ? ' ' + posOf(q.pl) : '') : q.gen, 'lk411D', q.id, L.some(p => String(p.d) === String(q.id)) ? 'on' : 'y')).join('') + '</div>';
   if (bench.length) right += '<div class="dim2">YOUR BENCH:</div><div class="row">' + bench.map(pl => btn(tagOf(pl), 'lk411D', pl.id, 'd')).join('') + '</div>';
   right += '<div class="row">' + btn('CANCEL', 'lk411X', null, 'g') + '</div>';
  }
  if (L.length) {
   right += '<div class="note" style="padding-top:2px">LOCKED OFF:</div>';
   right += L.map(p => '<div class="row"><span class="dim2" style="color:#ffe14d">' + escH(nameFor(G, p.d, true)) + ' ON ' + escH(nameFor(G, p.o, false)) + '</span>' + btn('CLEAR', 'lk411C', p.o, 'g') + '</div>').join('');
   if (L.length > 1) right += '<div class="row">' + btn('CLEAR ALL', 'lk411A', null, 'g') + '</div>';
  } else right += '<div class="dim2">NOBODY LOCKED OFF YET (UP TO ' + MAXP + ')</div>';
  right += '<div class="dim2" style="color:#c9d6d9">' + escH(HOWTO) + '</div></div>';
  return '<div class="hd"><div><div class="tt">PLAYBOOK - LOCK OFF</div><div class="st">ONE OF YOUR GUYS FACE-GUARDS ONE OF THEIRS ALL GAME - HE CANT GET THE BALL</div></div><div class="sp"></div>' + btn('DONE', 'lk411Done', null, 'y') + btn('BACK', 'lk411Back', null, 'g') + '</div>' + tabs +
   '<div class="scroll" id="lk411scroll" style="border:0;background:none"><div class="row" style="align-items:flex-start;gap:8px;flex-wrap:nowrap">' + fieldSvg(G, six, L) + right + '</div></div>';
 }
 function lockSection(G) {
  const L = pairs(G);
  return '<div class="note">LOCK OFF - ONE OF YOUR GUYS FACE-GUARDS ONE OF THEIRS ALL GAME</div><div class="row">' + btn(L.length ? 'LOCK OFF (' + L.length + ')' : 'LOCK OFF', 'lk411Open', 'pb', L.length ? 'on' : '') +
   (L.length ? '<span class="dim2" style="color:#ffe14d">' + L.map(p => escH(nameFor(G, p.d, true)) + ' ON ' + escH(nameFor(G, p.o, false))).join(', ') + '</span>' : '<span class="dim2">TAP THEIR GUY, THEN YOUR GUY</span>') + '</div>';
 }
 try {
  if (typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.playbook && typeof PANEL_ACT !== 'undefined') {
   const R0 = PANEL_RENDER.playbook;
   PANEL_RENDER.playbook = function () {
    if (off()) return R0.apply(this, arguments);
    if (PS.pbTab === 'LOCK') { try { return renderLock(); } catch (e) { err(e, 'render'); PS.pbTab = 'PLAYS'; } }
    let h = R0.apply(this, arguments);
    try {
     const G = G0();
     // third tab next to SETS / PLAYS
     const pl0 = btn('PLAYS', 'pbTab', 'PLAYS', 'on'), pl1 = btn('PLAYS', 'pbTab', 'PLAYS', 'd'), lk = btn('LOCK OFF', 'pbTab', 'LOCK', 'd');
     if (h.indexOf(pl0) >= 0) h = h.replace(pl0, pl0 + lk); else if (h.indexOf(pl1) >= 0) h = h.replace(pl1, pl1 + lk);
     // PLAYS tab: LOCK OFF category after D
     if (PS.pbTab !== 'SETS') { const nb = h.lastIndexOf('<div class="note">BUILD YOUR OWN'); h = nb > 0 ? h.slice(0, nb) + lockSection(G) + h.slice(nb) : h + lockSection(G); }
    } catch (e) { err(e, 'pbInject'); }
    return h;
   };
   if (PANEL_RENDER.timeout) {
    const RT = PANEL_RENDER.timeout;
    PANEL_RENDER.timeout = function () {
     let h = RT.apply(this, arguments);
     if (off()) return h;
     try {
      const G = G0(), n = G ? pairs(G).length : 0, b = btn(n ? 'LOCK OFF (' + n + ')' : 'LOCK OFF', 'lk411Open', 'to', n ? 'on' : 'd');
      const k1 = btn('BLACK', 'dset', 'black', 'on'), k2 = btn('BLACK', 'dset', 'black', 'd');
      const k = h.indexOf(k1) >= 0 ? k1 : h.indexOf(k2) >= 0 ? k2 : null;
      if (k) {
       // after BLACK + any custom D buttons, before the description span
       const at = h.indexOf(k) + k.length, sp = h.indexOf('<span class="dim2">', at);
       h = sp > 0 ? h.slice(0, sp) + b + h.slice(sp) : h.slice(0, at) + b + h.slice(at);
      }
     } catch (e) { err(e, 'toInject'); }
     return h;
    };
   }
   const PT0 = PANEL_ACT.pbTab;
   PANEL_ACT.pbTab = function (v) {
    if (!off() && v === 'LOCK') { PS.pbTab = 'LOCK'; UI.o = null; if (!UI.from) UI.from = 'playbook'; return; }
    UI.o = null;
    return PT0.apply(this, arguments);
   };
   PANEL_ACT.lk411Open = function (v) {
    UI.o = null;
    UI.from = v === 'to' ? screen : 'playbook';
    PS.pbTab = 'LOCK';
    screen = 'playbook';
   };
   PANEL_ACT.lk411O = function (v) {
    UI.o = UI.o != null && String(UI.o) === String(v) ? null : String(v);
   };
   PANEL_ACT.lk411D = function (v) {
    if (UI.o == null) return;
    setPair(G0(), String(UI.o), String(v));
    UI.o = null;
   };
   PANEL_ACT.lk411X = function () { UI.o = null; };
   PANEL_ACT.lk411C = function (v) { clearPair(G0(), v); UI.o = null; };
   PANEL_ACT.lk411A = function () { clearAll(G0()); UI.o = null; };
   const leave = toGame => {
    UI.o = null;
    const fr = UI.from;
    UI.from = null;
    PS.pbTab = 'PLAYS';
    if (fr === 'timeout' && G0()) { screen = 'timeout'; return; }
    if (toGame) screen = G0() ? 'live' : 'menu'; else screen = 'playbook';
   };
   PANEL_ACT.lk411Back = function () { leave(false); };
   PANEL_ACT.lk411Done = function () { leave(true); };
  }
 } catch (e) { err(e, 'ui'); }

 /* ---------------- in-game: the face-guard ---------------- */
 let ACT = null; // Set of lock defenders, only while updateDefense runs
 function resolve(G) {
  if (!okG(G) || !G.players) return [];
  const L = pairs(G);
  if (!L.length) return [];
  const def = G.players.filter(p => p.team === 'O'), atk = G.players.filter(p => p.team === 'D');
  const byId = (arr, id) => {
   const s = String(id);
   if (s.startsWith('slot:')) return arr[+s.slice(5)] || null;
   return arr.find(p => p.pl && String(p.pl.id) === s) || null;
  };
  const out = [], usedD = new Set, usedA = new Set;
  for (const pr of L) {
   const d = byId(def, pr.d), a = byId(atk, pr.o);
   if (!d || !a || usedD.has(d) || usedA.has(a)) continue; // either guy off the field -> paused
   if (d.r26) continue;
   usedD.add(d); usedA.add(a);
   out.push({ d: d, a: a });
  }
  return out;
 }
 const steering = (G, d) => d === G.dctl && !!G.run;
 wrapG('updateDefense', function (o, a) {
  const G = G0();
  if (G) G.lk411Def = 1;
  if (off() || !G || screen !== 'defense') return o.apply(this, a);
  let P = [];
  try { P = resolve(G); } catch (e) { err(e, 'resolve'); P = []; }
  if (!P.length) { G.lk411On = 0; return o.apply(this, a); }
  const dt = a[0], pre = new Map;
  try {
   const def = G.players.filter(p => p.team === 'O');
   for (const { d, a: m } of P) {
    if (d.mark !== m) {
     const other = def.find(q => q !== d && q.mark === m);
     if (other) other.mark = d.mark && G.players.includes(d.mark) ? d.mark : null;
     d.mark = m;
     LOG.swaps++;
    }
    if (G.dSlide === d) { G.dSlide = null; G.dRot = null; LOG.slideBlock++; }
    if (G.dRot && (G.dRot.d === d || G.dRot.m === m)) G.dRot = null;
    if (G.hotP === d) G.hotP = null;
    pre.set(d, [ d.x, d.y ]);
   }
  } catch (e) { err(e, 'pre'); }
  ACT = new Set(P.map(q => q.d));
  let r;
  try { r = o.apply(this, a); } finally { ACT = null; }
  try {
   if (screen !== 'defense' || !G.players) return r;
   G.lk411On = P.length;
   const b = G.ball, c = G.dcar;
   if (G.dSlide && P.some(q => q.d === G.dSlide)) { G.dSlide = null; G.dRot = null; LOG.slideBlock++; }
   for (const { d, a: m } of P) {
    if (!G.players.includes(d) || !G.players.includes(m)) continue;
    if (d.stun > 0 || d.down > 0 || steering(G, d)) continue;
    if (!b || !(b.state === 'held' || b.state === 'pass') || b.clear || b.state === 'clear') continue;
    const p0 = pre.get(d);
    if (p0) { d.x = p0[0]; d.y = p0[1]; }
    const bref = c || (b.state === 'pass' && b.to) || b;
    let tx, ty, spd = PACE.dBall * 1.06;
    if (c && m === c) {
     // he caught it anyway: play him goal-side, tight
     const dx = DGX - m.x, dy = CY - m.y, L = Math.hypot(dx, dy) || 1;
     tx = m.x + dx / L * 5 - 2; ty = m.y + dy / L * 5;
     spd = PACE.dBall * 1.05;
    } else {
     // face-guard: between him and the ball, tight
     const bx = bref.x - m.x, by = bref.y - m.y, L = Math.hypot(bx, by) || 1;
     let tight = 4;
     if (b.state === 'pass' && b.to === m) { tight = 2.5; spd = PACE.dBall * 1.25; }
     tx = m.x + bx / L * tight - 1; ty = m.y + by / L * tight;
    }
    tx = Math.min(tx, MIDX - 4);
    const gap = Math.hypot(tx - d.x, ty - d.y);
    if (gap > 14) spd = Math.max(spd, (PACE.chase || PACE.dBall) * .95);
    d.t30 = [ tx, ty ];
    moveTo(d, tx, ty, spd, dt);
    const dd = Math.hypot(d.x - m.x, d.y - m.y);
    LOG.frames++; LOG.dsum += dd; LOG.dmax = Math.max(LOG.dmax, dd); if (dd < 10) LOG.near++;
    G.lk411Log = G.lk411Log || { frames: 0, dsum: 0, dmax: 0 };
    G.lk411Log.frames++; G.lk411Log.dsum += dd; G.lk411Log.dmax = Math.max(G.lk411Log.dmax, dd);
   }
  } catch (e) { err(e, 'post'); }
  return r;
 });
 // a new CPU possession: your lock guy lines up on his man from the start (swap spots with whoever drew him)
 wrapG('startDefense', function (o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0();
   if (!off() && G && screen === 'defense') {
    G.lk411Def = 1;
    const def = G.players.filter(p => p.team === 'O');
    for (const { d, a: m } of resolve(G)) {
     if (d.mark === m) continue;
     const other = def.find(q => q !== d && q.mark === m);
     if (other) {
      const x = d.x, y = d.y, mk = d.mark;
      d.x = other.x; d.y = other.y; other.x = x; other.y = y;
      other.mark = mk && G.players.includes(mk) ? mk : null;
     }
     d.mark = m;
     LOG.swaps++;
    }
    const nd = G.players.find(p => p.team === 'O' && p.mark === G.dcar);
    if (nd && G.dctl && G.dctl.mark !== G.dcar) G.dctl = nd;
   }
  } catch (e) { err(e, 'start'); }
  return r;
 });
 wrapG('updateLive', function (o, a) { const G = G0(); if (G) G.lk411Def = 0; return o.apply(this, a); });
 // the lock guy is never a slider / rotator / hot help, and the zone is built from the rest of the D
 const drop = arr => Array.isArray(arr) && ACT ? arr.filter(d => !ACT.has(d)) : arr;
 wrapG('slideBest', function (o, a) { if (!ACT) return o.apply(this, a); const x = Array.from(a); x[0] = drop(x[0]); return o.apply(this, x); });
 wrapG('hotPick', function (o, a) { if (!ACT) return o.apply(this, a); const x = Array.from(a); x[0] = drop(x[0]); const r = o.apply(this, x); return r && ACT.has(r) ? null : r; });
 wrapG('rotatePick', function (o, a) { if (!ACT) return o.apply(this, a); const x = Array.from(a); x[0] = drop(x[0]); const r = o.apply(this, x); return r && ACT.has(r) ? null : r; });
 wrapG('zoneTargets', function (o, a) {
  const list = a[0];
  if (!ACT || !Array.isArray(list) || a[4] !== true || !list.some(d => ACT.has(d))) return o.apply(this, a);
  const rest = list.filter(d => !ACT.has(d));
  if (!rest.length) return o.apply(this, a);
  const x = Array.from(a); x[0] = rest;
  const z = o.apply(this, x);
  if (!z || !Array.isArray(z.pts)) return z;
  const pts = [], map = [];
  let k = 0;
  list.forEach((d, i) => { if (ACT.has(d)) { pts.push([ d.x, d.y ]); } else { map[k] = i; pts.push(z.pts[k] || [ d.x, d.y ]); k++; } });
  LOG.zoneRemap++;
  return Object.assign({}, z, { pts: pts, onBall: z.onBall >= 0 && map[z.onBall] != null ? map[z.onBall] : -1 });
 });
 // CPU passing: a locked-off guy is covered - they look elsewhere
 wrapG('dPassTo', function (o, a) {
  const G = G0(), c = a[0], r = a[1];
  try {
   if (!off() && G && screen === 'defense' && r && r !== c) {
    const P = resolve(G), pr = P.find(q => q.a === r);
    if (pr) {
     LOG.passTo++;
     const dd = Math.hypot(pr.d.x - r.x, pr.d.y - r.y);
     if (dd < 14 && !(pr.d.down > 0) && !(pr.d.stun > 0) && Math.random() < .88) {
      const def = G.players.filter(p => p.team === 'O'), locked = new Set(P.map(q => q.a));
      const opts = G.players.filter(p => p.team === 'D' && p !== c && p !== r && !locked.has(p) && !(p.down > 0)).map(p => {
       let md = 99;
       for (const d of def) md = Math.min(md, Math.hypot(d.x - p.x, d.y - p.y));
       return { p: p, s: Math.min(md, 25) - Math.hypot(p.x - DGX, p.y - CY) * .08 };
      }).sort((u, v) => v.s - u.s);
      LOG.denied++;
      if (opts.length) { const x = Array.from(a); x[1] = opts[0].p; return o.apply(this, x); }
      return; // nobody else - he holds it
     }
    }
   }
  } catch (e) { err(e, 'pass'); }
  return o.apply(this, a);
 });
 // a small yellow LOCK tag over your lock guy while you defend
 wrapG('drawTopLayer', function (o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0();
   if (!off() && G && screen === 'defense' && G.lk411On) {
    for (const { d } of resolve(G)) {
     const x = Math.round(d.x), y = Math.round(d.y);
     rect(x - 6, y + 2, 12, 1, '#ffe14d');
     text('LOCK', x, y - 26, 1, '#ffe14d', 'center', '#000');
    }
   }
  } catch (e) { err(e, 'draw'); }
  return r;
 });
 window.V411L = { on: true, LOG: LOG, pairs: pairs, setPair: setPair, clearAll: clearAll, resolve: resolve, KEY: KEY, UI: UI };
})();
