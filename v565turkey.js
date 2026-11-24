/* v565turkey.js - Bagga Lax 1.3 THANKSGIVING (hidden until switched on from the admin).
   Charlie: Turkey Leg Lacrosse Stick (rare), TURKEY TROTTERS (N/A) with a brown turkey onesie + red gobble on the helmet chin,
   alt = lighter tan, yellow bird legs, small feather tail, roster named after Thanksgiving dishes, a CHICKEN DANCE celly,
   all items on a soft lemon-yellow card with a leaf pattern, and a gift flag that gives everyone 1 Wooden Stick.
   Switches (LIVEOPS specials list, set from the admin):  mode_turkey565 = the team + cards + win unlocks
                                                          gift_wood565   = 1 Wooden Stick for every player (once)
   Shop pack id: pack_turkey565 (45 dimes) lists the stick + celly + 6 cards.
   Test in a console:  window.__rl565test = true.   Kill switch: window.__rl_no565 = true (before load).
   Tail / legs / gobble only exist on the two turkey kits (g27 tk565H / tk565A). Whale / Crown or any other uniform replaces the kit,
   so they vanish. No ids, rl_* keys (other than rl_tk565*), net protocol or saves are changed. */
(function () {
 'use strict';
 const win = window;
 const off = () => !!(win.__rl_no565 || win.__rl_v124gb);
 if (off() || win.TK565 || typeof PLAYERS === 'undefined' || typeof GH_REG === 'undefined' || !win.V17 || !V17.BY || !Array.isArray(V17.I)) return;
 const ID = 'TKT', ST = () => { try { return V17.ST(); } catch (e) { return null; } };
 const V = win.TK565 = { log: [], err: [], ID: ID };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e)); try { console.warn('v565', w, e); } catch (x) {} };
 const lsGet = (k, d) => { try { return LS.get(k, d); } catch (e) { return d; } };
 const lsSet = (k, v) => { try { LS.set(k, v); } catch (e) {} };
 const lo = () => win.LIVEOPS && LIVEOPS.ready ? LIVEOPS : null;
 const on = () => { if (off()) return false; if (win.__rl565test) return true; try { const L = lo(); return !!(L && L.specialOn('mode_turkey565')); } catch (e) { return false; } };
 const giftOn = () => { if (off()) return false; try { const L = lo(); return !!(L && L.specialOn('gift_wood565')); } catch (e) { return false; } };
 const hx = c => { c = c.replace('#', ''); return [ 0, 2, 4 ].map(i => parseInt(c.substr(i, 2), 16)); };
 const rgb = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
 const mul = (c, f) => rgb(hx(c).map(v => v * f));
 const mix = (a, b, f) => rgb(hx(a).map((v, i) => v * (1 - f) + hx(b)[i] * f));

 // ---------- the ten Thanksgiving dishes + ten more = 20 players ----------
 const DISH = [
  [ 'Mashed Potatoes', 'A', 1 ], [ 'Candied Yams', 'A', 2 ], [ 'Green Bean Casserole', 'A', 7 ], [ 'Sweet Potato Pie', 'A', 12 ], [ 'Pecan Pie', 'A', 19 ], [ 'Deviled Eggs', 'A', 22 ],
  [ 'Macaroni Cheese', 'M', 3 ], [ 'Stuffing', 'M', 8 ], [ 'Cranberry Sauce', 'M', 11 ], [ 'Pumpkin Pie', 'M', 15 ], [ 'Dinner Roll', 'M', 27 ], [ 'Corn Bread', 'M', 5 ],
  [ 'Gravy Boat', 'FO', 4 ], [ 'Brussels Sprout', 'LSM', 37 ],
  [ 'Collard Greens', 'D', 33 ], [ 'Honey Ham', 'D', 41 ], [ 'Baked Beans', 'D', 44 ], [ 'Corn On The Cob', 'D', 46 ],
  [ 'Whole Turkey', 'G', 30 ], [ 'Apple Cider', 'G', 31 ]
 ];
 // overall bump per player: a few stars, mostly mid, some low (so the cards have different rarities + stats)
 const BUMP = [ 14, 4, -2, 9, -6, -10, 12, 2, -4, 7, -8, 0, 5, -3, 3, 10, -5, -9, 13, -7 ];
 const skinFor = i => [ 0, 1, 2, 3, 1, 4, 0, 2 ][i % 8];
 const PIDS = DISH.map((d, i) => ID + '-' + i);
 const tm = { id: ID, abbr: 'TKT', name: 'TURKEY TROTTERS', full: 'Turkey Trotters', city: 'THANKSGIVING', lg: 'N/A', era: 'THANKSGIVING',
  c1: '#8a5a2b', c2: '#d6202c', icon: [ '.#.#.', '#####', '.###.', '.#.#.', '..#..', '.###.', '.#.#.' ], coach: '', coachNote: '', off: 4, def: 4, tk565: true, roster: PIDS.slice() };
 function buildPlayers() {
  let src = [];
  try {
   const ovr = t => { const ps = (t.roster || []).map(id => PLAYERS[id]).filter(Boolean); return ps.length ? ps.reduce((a, p) => a + (p.ovr || 0), 0) / ps.length : 0; };
   const mid = TEAMS.slice().sort((a, b) => ovr(a) - ovr(b))[Math.floor(TEAMS.length / 2)];
   src = (mid && mid.roster || []).map(id => PLAYERS[id]).filter(Boolean);
  } catch (e) {}
  const by = {}, used = {};
  for (const p of src) (by[p.pos] = by[p.pos] || []).push(p);
  DISH.forEach((d, i) => {
   if (PLAYERS[PIDS[i]]) return;
   const pool = by[d[1]] && by[d[1]].length ? by[d[1]] : src, sp = pool.length ? pool[(used[d[1]] = (used[d[1]] || 0) + 1) % pool.length] : null;
   const p = { id: PIDS[i], n: d[0], pos: d[1], r: {}, real: false, team: ID, tk565: true, nocard486: true, wnum: d[2], skin: skinFor(i) };
   if (typeof SKILLS !== 'undefined') SKILLS.forEach(k => { const b = sp && sp.r && sp.r[k] != null ? sp.r[k] : 72; p.r[k] = Math.max(35, Math.min(99, b + BUMP[i] + ((i * 7 + k.length * 3) % 5) - 2)); });
   p.ovr = typeof ovrOf === 'function' ? ovrOf(p) : 72;
   PLAYERS[p.id] = p;
  });
 }
 try { buildPlayers(); } catch (e) { fail('players', e); }
 // the team is only in GH_REG while the switch is on
 const own565 = () => !!lsGet('tk565own', null);
 // the team also unlocks when the pack's items are in the inventory (covers any way the pack gets bought)
 function packOwned() {
  try {
   const S = ST(), P = V17.PACKS && V17.PACKS.tk565;
   if (!S || !P) return false;
   if (S.b287 && S.b287.tk565) return true;
   return !!(S.inv && ((S.inv[TEAMC] || 0) > 0 || P.bundle.filter(id => id !== TEAMC).every(id => (S.inv[id] || 0) > 0)));
  } catch (e) { return false; }
 }
 function ensure() {
  try {
   try {
    const S0 = ST();
    if (S0 && S0.inv && (S0.inv[TEAMC] || 0) > 0) { if (window.V550IS && V550IS.allow) V550IS.allow(() => { delete S0.inv[TEAMC]; }); else delete S0.inv[TEAMC]; lsSet('tk565own', Date.now()); try { V17.save(); } catch (e) {} note('team card -> team'); }
   } catch (e) { fail('teamcard', e); }
   if (!own565() && packOwned()) { lsSet('tk565own', Date.now()); note('pack owned'); }
   const want = own565(); // 1.4: the team is yours for good once you own the pack (uniforms, card teams, locker), not only during the event
   if (want && !GH_REG[ID]) { GH_REG[ID] = tm; note('team on'); try { win.panelDirty && panelDirty(); } catch (e) {} }
   else if (!want && GH_REG[ID] === tm) { delete GH_REG[ID]; note('team off'); }
   // pack player cards: the bundle buy puts them in the inventory only, but the CARDS collection (sub them in, Locker CARDS) is V22.
   // Put them in the collection too - also fixes a pack bought before this (its cards are already in the inventory).
   try {
    const S1 = ST();
    if (own565() && win.V22 && V22.grantIds && V22.owned && S1 && S1.inv) {
     const miss = PIDS.filter(pid => (S1.inv['pc27|' + pid] || 0) > 0 && !V22.owned(pid));
     if (miss.length) { const got = V22.grantIds(miss, ID, 'TURKEY TROTTERS PACK'); note('cards ' + (got ? got.length : 0)); if (got && got.length) try { win.panelDirty && panelDirty(); } catch (e) {} }
    }
   } catch (e) { fail('cards22', e); }
  } catch (e) { fail('ensure', e); }
 }

 // ---------- the two uniforms ----------
 const HOME = { jersey: '#8a5a2b', trim: '#d9a066', helm: '#8a5a2b', shorts: '#8a5a2b', acc: '#8a5a2b', g27: 'tk565H' };
 const AWAY = { jersey: '#c9a06a', trim: '#f0d9b0', helm: '#c9a06a', shorts: '#c9a06a', acc: '#c9a06a', g27: 'tk565A' };
 const kitOf = k => Object.assign({}, (k | 0) === 1 ? AWAY : HOME);
 // the TEAM card picture: a Pilgrim turkey on a shield, tail fan behind
 function teamIcon(sil) {
  const cv = document.createElement('canvas'); cv.width = 20; cv.height = 20;
  const x = cv.getContext('2d');
  const r = (a, b, w, h, c) => { x.fillStyle = sil ? '#06080c' : c; x.fillRect(a, b, w, h); };
  r(1, 1, 18, 18, '#000'); r(2, 2, 16, 16, '#2e1c0c');
  r(2, 2, 16, 1, '#ffe27a');
  r(3, 6, 2, 7, '#d6202c'); r(5, 4, 2, 9, '#e8741a'); r(7, 3, 2, 10, '#f2c230'); r(11, 3, 2, 10, '#f2c230'); r(13, 4, 2, 9, '#e8741a'); r(15, 6, 2, 7, '#d6202c');
  r(7, 11, 6, 6, '#8a5a2b'); r(8, 13, 4, 3, '#d9a066');
  r(8, 8, 4, 4, '#8a5a2b'); r(8, 9, 1, 1, '#fff'); r(11, 9, 1, 1, '#fff'); r(9, 10, 2, 1, '#f2c230'); r(9, 11, 2, 3, '#d6202c');
  r(7, 7, 6, 1, '#000'); r(8, 4, 4, 3, '#000'); r(8, 6, 4, 1, '#f2c230');
  r(8, 17, 1, 1, '#f2c230'); r(11, 17, 1, 1, '#f2c230');
  return cv;
 }
 // the Chicken Dance card picture: a little turkey-onesie player, wings out
 function chickenIcon(sil) {
  const cv = document.createElement('canvas'); cv.width = 20; cv.height = 20;
  const x = cv.getContext('2d');
  const r = (a, b, w, h, c) => { x.fillStyle = sil ? '#06080c' : c; x.fillRect(a, b, w, h); };
  const O = '#1b0f06', B = '#8a5a2b', D = '#5a3a1a', T = '#d9a066', R = '#d6202c', Y = '#f2c230', F = '#f0c090';
  // wings out + flapping
  r(1, 7, 2, 2, O); r(2, 8, 4, 3, B); r(3, 8, 2, 1, T); r(14, 8, 4, 3, B); r(17, 7, 2, 2, O); r(15, 8, 2, 1, T);
  r(0, 6, 2, 1, T); r(18, 6, 2, 1, T);
  // body
  r(6, 9, 8, 6, O); r(7, 9, 6, 5, B); r(7, 10, 6, 1, D); r(8, 12, 4, 1, T);
  // tail feathers
  r(15, 13, 3, 1, R); r(16, 12, 2, 1, Y); r(15, 14, 2, 1, D);
  // head + helmet
  r(6, 2, 8, 7, O); r(7, 3, 6, 5, B); r(7, 3, 6, 1, T); r(8, 5, 4, 3, F); r(9, 6, 1, 1, O); r(11, 6, 1, 1, O);
  // beak + gobble hanging down the neck
  r(9, 7, 2, 1, Y); r(9, 8, 2, 4, R); r(10, 11, 1, 1, D);
  // yellow bird legs + feet
  r(8, 15, 1, 3, Y); r(11, 15, 1, 3, Y); r(6, 18, 4, 1, Y); r(10, 18, 4, 1, Y); r(5, 19, 2, 1, Y); r(13, 19, 2, 1, Y);
  return cv;
 }
 // the Turkey Leg Stick picture: a bone handle with a knuckle, a roasted drumstick head (crispy spots, shine, a paper frill)
 function legIcon(sil) {
  const cv = document.createElement('canvas'); cv.width = 20; cv.height = 20;
  const x = cv.getContext('2d');
  const r = (a, b, w, h, c) => { x.fillStyle = sil ? '#06080c' : c; x.fillRect(a, b, w, h); };
  const O = '#2a1406', BN = '#f1e6cc', BS = '#cdbb92', M1 = '#b5601f', M2 = '#8a4416', HL = '#eaa55c', CR = '#5e2a0c';
  // bone shaft, bottom-left to the meat (diagonal, 2 px thick, outlined)
  for (let i = 0; i < 9; i++) { r(3 + i, 16 - i, 2, 2, O); }
  for (let i = 0; i < 9; i++) { r(4 + i, 16 - i, 1, 1, BN); r(3 + i, 17 - i, 1, 1, i % 3 ? BN : BS); }
  // knuckle at the handle end: two round bumps
  r(0, 15, 4, 3, O); r(2, 17, 3, 3, O); r(1, 16, 2, 1, BN); r(3, 18, 1, 1, BN); r(2, 16, 1, 2, BS);
  // paper frill where bone meets meat
  r(10, 9, 2, 2, '#ffffff'); r(9, 10, 1, 1, '#ffffff'); r(11, 11, 1, 1, '#d8d8d8');
  // the drumstick meat
  r(11, 2, 6, 1, O); r(10, 3, 8, 1, O); r(9, 4, 10, 5, O); r(10, 9, 8, 1, O); r(11, 10, 5, 1, O);
  r(11, 3, 6, 1, M1); r(10, 4, 8, 5, M1); r(11, 9, 6, 1, M2); r(16, 5, 2, 4, M2); r(12, 8, 4, 1, M2);
  r(11, 4, 3, 1, HL); r(11, 5, 1, 2, HL); r(12, 5, 1, 1, '#ffd9a0');
  r(14, 6, 1, 1, CR); r(16, 4, 1, 1, CR); r(13, 7, 1, 1, CR);
  return cv;
 }
 const prevX = win.UNI21X;
 win.UNI21X = {
  own: tid => !!(prevX && prevX.own && prevX.own(tid)) || (!off() && tid === ID && !!GH_REG[ID]),
  nK: tid => tid === ID ? 2 : prevX && prevX.nK ? prevX.nK(tid) : 2,
  styN: (tid, k) => tid === ID ? ((k | 0) === 1 ? 'ALT TAN' : 'TURKEY BROWN') : prevX && prevX.styN ? prevX.styN(tid, k) : 'BASIC',
  kitOf: (tid, k) => tid === ID ? kitOf(k) : prevX && prevX.kitOf ? prevX.kitOf(tid, k) : null,
  lockerTeams: () => { const a = prevX && prevX.lockerTeams ? prevX.lockerTeams() : []; if (!off() && GH_REG[ID] && a.indexOf(ID) < 0) a.push(ID); return a; },
  icon: (it, sil) => it && it.id === 'stick_tk565leg' ? legIcon(sil) : it && it.id === 'celly_tk565chk' ? chickenIcon(sil) : it && it.id === 'team_tk565' ? teamIcon(sil) : prevX && prevX.icon ? prevX.icon(it, sil) : null
 };
 // pixel recolor: onesie head to toe, yellow bird legs, red chin guard (the gobble's top)
 try {
  if (typeof RL12 !== 'undefined' && RL12) {
   const g0 = RL12.g27;
   RL12.g27 = function (kit, ch, q, r, rows) {
    try {
     if (!off() && kit && (kit.g27 === 'tk565H' || kit.g27 === 'tk565A') && rows && ch && ch !== '.') {
      let jTop = 0;
      for (let i = 0; i < rows.length; i++) if (/[Jj]/.test(rows[i])) { jTop = i; break; }
      if ((ch === 'S' || ch === 's' || ch === 'W' || ch === 'v') && r >= jTop + 8) return ch === 's' ? '#c98a14' : '#f2c230';
      if ((ch === 'K' || ch === 'k') && r >= jTop + 8) return '#c98a14';
      return null;
     }
    } catch (e) {}
    return typeof g0 === 'function' ? g0.apply(this, arguments) : null;
   };
  }
 } catch (e) { fail('g27', e); }
 // tail fan + hanging gobble (V56.5b). Pixels are worked out once per frame + jersey color, in sprite pixels (unflipped).
 // The tail fan only goes where the sprite is empty (it sits BEHIND the player); the gobble hangs over the collar/chest.
 const TKP = new Map();
 const viewOf = n => /^d8N_/.test(n) ? 'back' : /^(bench|lobby|d8S_)/.test(n) ? 'front' : 'side';
 function tkPix(name, kit) {
  const key = name + '|' + (kit && kit.jersey);
  if (TKP.has(key)) return TKP.get(key);
  let out = null;
  try {
   const f = typeof RL12 !== 'undefined' && RL12.FR && RL12.FR[name];
   if (f && !/^prop_/.test(name)) {
    const rows = f[3], h = rows.length, w = rows[0].length, view = viewOf(name);
    const solid = (q, r) => r >= 0 && r < h && q >= 0 && q < w && rows[r][q] !== '.';
    const jr = []; rows.forEach((row, r) => { if (/J/.test(row)) jr.push(r); });
    const tail = [], gob = [];
    if (jr.length) {
     const cy0 = jr[0] + Math.floor(jr.length * .4), row = rows[cy0];
     let q0 = w, q1 = -1;
     for (let q = 0; q < row.length; q++) if (/[Jj]/.test(row[q])) { q0 = Math.min(q0, q); q1 = Math.max(q1, q); }
     if (q1 >= 0) {
      const front = view !== 'side';
      const cx = front ? (q0 + q1) / 2 : q0 + 1, cy = front ? jr[0] + 1 : cy0 - 1, R = front ? Math.max(12, (q1 - q0 + 1) * 1.3) : 9.5;
      // fan: front/back = the upper half circle; side = pointing back and up (sprite faces right before the flip)
      const a0 = front ? -18 : 92, a1 = front ? 198 : 222, n = front ? 9 : 5, sp = (a1 - a0) / n;
      const BR = '#6b3d1c', RU = '#b4521e', DK = '#3b2412', TIP = '#f2deb0', LN = '#2a180a', GD = '#d99a2b';
      for (let r = Math.floor(cy - R - 1); r <= cy + 2; r++) for (let q = Math.floor(cx - R - 1); q <= Math.ceil(cx + R + 1); q++) {
       if (solid(q, r)) continue;
       const dx = q + .5 - (cx + .5), dy = -(r + .5 - (cy + .5)), d = Math.hypot(dx, dy);
       if (d < 2) continue;
       let a = Math.atan2(dy, dx) * 180 / Math.PI; if (a < -90) a += 360;
       if (a < a0 || a > a1) continue;
       const fi = Math.floor((a - a0) / sp), u = (a - a0) / sp - fi;
       const Rf = R * (.86 + .14 * Math.sin(Math.PI * u));
       if (d > Rf) continue;
       const t = d / Rf;
       let c = t > .9 ? TIP : t > .8 ? DK : t > .55 ? (fi % 2 ? GD : RU) : (fi % 2 ? mul(BR, .85) : BR);
       if (t <= .9 && (u < .1 || u > .94)) c = LN;
       tail.push([ q, r, c ]);
      }
     }
    }
    // gobble: starts UNDER the chin (row below the face mask, never on the mouth) and hangs down the chest
    const isM = ch => /[ScZ]/.test(ch);
    let rm = -1; for (let r = 0; r < (jr.length ? jr[0] : h); r++) if ([ ...rows[r] ].some(isM)) rm = r;
    if (rm >= 0 && view !== 'back') {
     const RD = '#d6202c', DKR = '#8e1019', LT = '#ff5a5a';
     const ms = []; for (let q = 0; q < w; q++) if (isM(rows[rm][q])) ms.push(q);
     if (view === 'front') {
      const m = ms[Math.floor(ms.length / 2)];
      [ [ m, rm + 1, DKR ], [ m, rm + 2, RD ], [ m + 1, rm + 2, RD ], [ m, rm + 3, RD ], [ m + 1, rm + 3, DKR ], [ m, rm + 4, RD ], [ m + 1, rm + 4, DKR ], [ m - 1, rm + 5, RD ], [ m, rm + 5, RD ], [ m + 1, rm + 5, DKR ], [ m, rm + 6, DKR ] ].forEach(p => gob.push(p));
     } else {
      const m = ms[ms.length - 1];
      [ [ m - 1, rm + 1, DKR ], [ m - 1, rm + 2, RD ], [ m - 2, rm + 2, RD ], [ m - 1, rm + 3, RD ], [ m - 2, rm + 3, DKR ], [ m - 1, rm + 4, RD ], [ m - 2, rm + 4, DKR ], [ m - 1, rm + 5, DKR ] ].forEach(p => gob.push(p));
     }
    }
    out = { w, tail, gob };
   }
  } catch (e) { fail('tkPix', e); }
  if (TKP.size > 400) TKP.clear();
  TKP.set(key, out);
  return out;
 }
 // put(X, Y, color) gets canvas pixels already flipped
 function deco(put, name, kit, flip) {
  const P = tkPix(name, kit);
  if (!P) return;
  const X = q => flip ? P.w - 1 - q : q;
  for (const [ q, r, c ] of P.tail) put(X(q), r, c);
  for (const [ q, r, c ] of P.gob) put(X(q), r, c);
 }
 V.deco = deco;
 const isTk = kit => !off() && !!kit && (kit.g27 === 'tk565H' || kit.g27 === 'tk565A');
 // RL12.draw: plain sprites (bench, cards, cutscenes, players with no gear)
 try {
  if (typeof RL12 !== 'undefined' && typeof RL12.draw === 'function') {
   const D0 = RL12.draw;
   RL12.draw = function (gg, name, x, y, kit, faceRight, opts) {
    const r = D0.apply(this, arguments);
    try {
     if (isTk(kit) && !(RL12.__tkSkip)) {
      const f = RL12.FR[name];
      if (!f) return r;
      const w = f[3][0].length, ax = faceRight ? f[0] : w - 1 - f[0], bx = Math.round(x) - ax, by = Math.round(y) - f[1];
      const a0 = gg.globalAlpha;
      if (opts && opts.alpha != null) gg.globalAlpha = opts.alpha;
      deco((q, rr, c) => { gg.fillStyle = c; gg.fillRect(bx + q, by + rr, 1, 1); }, name, kit, !faceRight);
      gg.globalAlpha = a0;
     }
    } catch (e) { fail('deco', e); }
    return r;
   };
  }
 } catch (e) { fail('draw', e); }
 // ---------- the Turkey Leg Stick on the body sprite: drumstick head + bone shaft with a knuckle (any team can carry it) ----------
 const LEGP = new Map();
 function legPix(name) {
  if (LEGP.has(name)) return LEGP.get(name);
  let out = null;
  try {
   const f = RL12.FR[name];
   if (f && !/^prop_/.test(name)) {
    const rows = f[3], h = rows.length, w = rows[0].length, at = (q, r) => r >= 0 && r < h && q >= 0 && q < w ? rows[r][q] : '.';
    const head = [], shaft = [];
    for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) { const ch = rows[r][q]; if (ch === 'M' || ch === 'm' || ch === 'n') head.push([ q, r, ch ]); else if (ch === 'X') shaft.push([ q, r ]); }
    if (head.length) {
     const px = [], O = '#2a1406', M1 = '#b5601f', M2 = '#8a4416', HL = '#eaa55c', BN = '#f1e6cc', BS = '#d6c59c';
     const hx = head.reduce((a, p) => a + p[0], 0) / head.length, hy = head.reduce((a, p) => a + p[1], 0) / head.length;
     const top = Math.min(...head.map(p => p[1]));
     const isHead = (q, r) => /[Mmn]/.test(at(q, r));
     // fatter drumstick: a dark crust ring around the head where the sprite is empty
     const ring = new Set();
     for (const [ q, r ] of head) for (const [ dq, dr ] of [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ 0, 1 ] ]) { const k = (q + dq) + ',' + (r + dr); if (at(q + dq, r + dr) === '.' && !ring.has(k)) { ring.add(k); px.push([ q + dq, r + dr, O ]); } }
     let hl = false;
     for (const [ q, r, ch ] of head) {
      const edge = [ [ -1, 0 ], [ 1, 0 ], [ 0, -1 ], [ 0, 1 ] ].some(([ dq, dr ]) => !isHead(q + dq, r + dr));
      let c = edge ? M2 : ch === 'n' && (q + r) % 3 === 0 ? M2 : M1;
      if (!hl && !edge && r <= top + 2 && q <= hx) { c = HL; hl = true; }
      px.push([ q, r, c ]);
     }
     // bone shaft: cream with a little shading, a knuckle at the end farthest from the meat
     let far = null, fd = -1;
     // 1.4: the tape zone - same rule as items17 (shaft pixels 1-3 rows under the head, within 2 columns): marked 'T'
     const tz = (q, r) => head.some(p => Math.abs(p[0] - q) <= 2 && r - p[1] >= 1 && r - p[1] <= 3);
     shaft.forEach(([ q, r ], i) => { px.push([ q, r, (q + r) % 4 === 0 ? BS : BN, tz(q, r) ? 'T' : '' ]); const d = Math.hypot(q - hx, r - hy); if (d > fd) { fd = d; far = [ q, r ]; } });
     if (far) for (const [ dq, dr, c ] of [ [ -1, 0, BN ], [ 1, 0, BN ], [ -1, 1, BS ], [ 1, 1, BS ], [ 0, 1, BN ] ]) if (at(far[0] + dq, far[1] + dr) === '.') px.push([ far[0] + dq, far[1] + dr, c ]);
     out = { w, px };
    }
   }
  } catch (e) { fail('legPix', e); }
  if (LEGP.size > 300) LEGP.clear();
  LEGP.set(name, out);
  return out;
 }
 function legPaint(put, name, flip, tape) {
  const P = legPix(name);
  if (!P) return;
  for (const [ q, r, c, z ] of P.px) put(flip ? P.w - 1 - q : q, r, z === 'T' && tape ? tape : c);
 }
 // 1.4 (Charlie): tape shows on the Turkey Leg too - the equipped tape's color, like on every other stick
 const tapeOf = gr => { try { return gr && gr.tape && V17.BY[gr.tape] && V17.BY[gr.tape].col || null; } catch (e) { return null; } };
 V.legPaint = legPaint;
 const legOn = gr => !off() && !!gr && gr.stick === STICK;
 // the stick in the hands during play (game.js drawHandStick, colors from V17.handStickCols)
 try {
  if (typeof V17.handStickCols === 'function' && !V17.handStickCols.__tk565) {
   const H0 = V17.handStickCols;
   const H1 = function (p) {
    const r = H0.apply(this, arguments);
    try { const gr = V17.gearOfP ? V17.gearOfP(p.pl) : null; if (r && p && legOn(gr)) return Object.assign({}, r, { X: '#f1e6cc', M: '#b5601f', m: '#eaa55c', n: '#8a4416', glow: null, tkleg: 1, tape: tapeOf(gr) }); } catch (e) {}
    return r;
   };
   H1.__tk565 = 1;
   V17.handStickCols = H1;
  }
 } catch (e) { fail('hsc', e); }
 try {
  if (typeof win.drawHandStick === 'function' && !win.drawHandStick.__tk565) {
   const DH0 = win.drawHandStick;
   const DH1 = function (x, y, hx, hy, long) {
    const sc = win.__v17sc;
    if (!sc || !sc.tkleg || off() || typeof HAS12 === 'undefined' || !HAS12) return DH0.apply(this, arguments);
    try {
     const P = (a, b, c) => { g.fillStyle = c; g.fillRect(a, b, 1, 1); };
     const BN = '#f1e6cc', BS = '#cdbb92', O = '#2a1406', M1 = '#b5601f', M2 = '#8a4416', HL = '#eaa55c';
     // bone shaft + knuckle at the hands end
     line(x, y - 11, hx, hy + 3, BN);
     P(x - 1, y - 12, BN); P(x + 1, y - 12, BN); P(x - 1, y - 10, BS); P(x + 1, y - 10, BS); P(x, y - 10, BS);
     // the drumstick: 7 wide, 7 tall, crust outline, shine top-left, crispy spots
     const MAP = [ '..ooo..', '.oHmmo.', 'oHmmmmo', 'ommnmmo', 'ommmmno', '.onmmo.', '..ooo..' ];
     MAP.forEach((row, r) => { for (let q = 0; q < 7; q++) { const ch = row[q]; if (ch === '.') continue; P(hx - 3 + q, hy - 3 + r, ch === 'o' ? O : ch === 'H' ? HL : ch === 'n' ? M2 : M1); } });
     P(hx, hy + 4, '#ffffff'); P(hx - 1, hy + 4, '#ffffff');
     try { const tc = sc.tape; if (tc) { for (let i = 5; i <= 6; i++) { const tx = Math.round(hx + (x - hx) * i / 14), ty = Math.round(hy + (y - 11 - hy) * i / 14); P(tx, ty, tc); P(tx + 1, ty, tc); } } } catch (e) {}
    } catch (e) { fail('leghand', e); return DH0.apply(this, arguments); }
   };
   DH1.__tk565 = 1;
   win.drawHandStick = DH1;
  }
 } catch (e) { fail('dhs', e); }
 // V17.drawP: players with gear in a game (drawn from a baked gear canvas, RL12.draw is skipped)
 try {
  if (typeof V17.drawP === 'function' && !V17.drawP.__tk565) {
   const P0 = V17.drawP;
   const P1 = function (gx, n, p, kit, faceRight) {
    const ok = P0.apply(this, arguments);
    try {
     const f = ok && p ? RL12.FR[n] : null;
     if (f) {
      const w = f[3][0].length, ax = faceRight ? f[0] : w - 1 - f[0], bx = Math.round(p.x) - ax, by = Math.round(p.y) - f[1];
      const put = (q, rr, c) => { gx.fillStyle = c; gx.fillRect(bx + q, by + rr, 1, 1); };
      const gr565 = V17.gearOfP ? V17.gearOfP(p.pl, kit) : null;
      if (!p.ns17 && legOn(gr565)) legPaint(put, n, !faceRight, tapeOf(gr565));
      if (isTk(kit)) deco(put, n, kit, !faceRight);
     }
    } catch (e) { fail('drawP', e); }
    return ok;
   };
   P1.__tk565 = 1;
   V17.drawP = P1;
  }
 } catch (e) { fail('drawP0', e); }
 // the big player on the team / menu screens (game.js lobbyHero, drawn scaled from its own bake)
 try {
  if (typeof win.lobbyHero === 'function' && !win.lobbyHero.__tk565) {
   const L0 = win.lobbyHero;
   const L1 = function (cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) {
    const r = L0.apply(this, arguments);
    try {
     const hg565 = win.__v17hp && V17.heroGear ? V17.heroGear(win.__v17hp, kit) : null;
     const pid = win.__v17hp, leg = !gray && !side && pid && !(V17.heroNoStick && V17.heroNoStick(pid)) && legOn(hg565);
     if (!gray && (isTk(kit) || leg) && typeof lobbyFrame === 'function' && typeof lobbyHeroGeo === 'function') {
      const name = lobbyFrame(pos, side), f = RL12.FR[name];
      if (f) {
       const x0 = lobbyHeroGeo(cx, pos, k, flip, side).x0 + Math.round(slide || 0), y0 = Math.round(feetY - f[1] * k);
       const cut = Math.max(1, f[1] - 12), br = Math.round((Math.sin(t * 2.4) + 1) * .75);
       const gg = g, a0 = gg.globalAlpha;
       gg.globalAlpha = alpha == null ? 1 : alpha;
       const put = (q, rr, c) => { gg.fillStyle = c; gg.fillRect(x0 + q * k, y0 + rr * k - (rr < cut ? br : 0), k, k); };
       if (leg) legPaint(put, name, !!flip, tapeOf(hg565));
       if (isTk(kit)) deco(put, name, kit, !!flip);
       gg.globalAlpha = a0;
      }
     }
    } catch (e) { fail('lobby', e); }
    return r;
   };
   L1.__tk565 = 1;
   win.lobbyHero = L1;
  }
 } catch (e) { fail('lobby0', e); }
 try {
  if (V17.bakeGear && !V17.bakeGear.__tk565) {
   const B0 = V17.bakeGear;
   const B1 = function (name, kit, flip, skin, gr, gray, o) {
    const c = B0.apply(this, arguments);
    try {
     if (c && isTk(kit) && !c.tk565 && !gray) {
      const pad = c.pad17 || 0, x2 = c.getContext('2d');
      deco((q, rr, col) => { x2.fillStyle = col; x2.fillRect(pad + q, pad + rr, 1, 1); }, name, kit, !!flip);
      c.tk565 = 1;
     }
    } catch (e) { fail('gearDeco', e); }
    return c;
   };
   B1.__tk565 = 1;
   V17.bakeGear = B1;
  }
 } catch (e) { fail('gear', e); }

 // ---------- the badge ----------
 try {
  const B0 = win.badge;
  if (typeof B0 === 'function') win.badge = function (team, x, y, sc) {
   if (off() || !team || team.id !== ID) return B0.apply(this, arguments);
   sc = sc || 1;
   const w = 13, h = 15;
   for (let r = 0; r < h; r++) {
    const inset = r < 9 ? 0 : r - 8;
    for (let c = inset; c < w - inset; c++) {
     const edge = r === 0 || c === inset || c === w - 1 - inset || r === h - 1;
     g.fillStyle = edge ? '#f2c230' : '#8a5a2b';
     g.fillRect(Math.round(x) + c * sc, Math.round(y) + r * sc, sc, sc);
    }
   }
   const ix = Math.round(x) + 3 * sc, iy = Math.round(y) + 2 * sc;
   const px = [ [ 0, 0, '#d6202c' ], [ 2, 0, '#c98a14' ], [ 4, 0, '#d6202c' ], [ 1, 1, '#c98a14' ], [ 2, 1, '#c98a14' ], [ 3, 1, '#c98a14' ], [ 1, 2, '#d9a066' ], [ 2, 2, '#d9a066' ], [ 3, 2, '#d9a066' ], [ 2, 3, '#d6202c' ], [ 2, 4, '#d6202c' ], [ 1, 5, '#f2c230' ], [ 3, 5, '#f2c230' ] ];
   for (const [a, b, c] of px) { g.fillStyle = c; g.fillRect(ix + a * sc, iy + b * sc, sc, sc); }
   if (sc >= 2) drawText('TKT', Math.round(x) + 6.5 * sc - textW('TKT', 1) / 2, Math.round(y) + 9 * sc, 1, '#fff8d0');
  };
 } catch (e) { fail('badge', e); }

 // ---------- the N/A tab tile: registers into the shared N/A grid (v493shop naGrid) ----------
 try {
  win.NAX_REG = win.NAX_REG || [];
  if (!win.NAX_REG.some(e => e.id === ID)) win.NAX_REG.push({
   id: ID, tm: () => tm, show: () => !off() && (on() || own565()), sub: 'THANKSGIVING', accent: '#f2c230',
   lock: () => own565() ? null : [ '45 DIMES' ],
   onLocked: () => { try { V17.toast('TURKEY TROTTERS: IN THE TURKEY PACK (YARD SALE)', '#f2c230'); } catch (e) {} }
  });
 } catch (e) { fail('grid', e); }

 // ---------- items: Turkey Leg stick, Chicken Dance celly, 20 player cards ----------
 // b2504 = a bundle (pack-only) item: keeps it out of card packs, weekly rewards, crew/trade-in pools (they all skip b2504)
 const add = it => { it.b2504 = 1; if (!V17.BY[it.id]) { V17.BY[it.id] = it; V17.I.push(it); } };
 const STICK = 'stick_tk565leg', CEL = 'celly_tk565chk', TEAMC = 'team_tk565';
 try {
  add({ id: STICK, n: 'TURKEY LEG STICK', sec: 'stick', slot: 'stick', rar: 1, art: 'cstick', col: '#9b5a26', col2: '#f4ecd8', brk: .012, tk565: 1, x489: 1,
   d: 'THANKSGIVING. A WHITE BONE SHAFT WITH A COOKED DRUMSTICK HEAD. LESS LIKELY TO BREAK.' });
  add({ id: TEAMC, n: 'TURKEY TROTTERS TEAM', sec: 'tk565team', rar: 2, tk565: 1, x489: 1,
   d: 'THE TEAM ITSELF, NOT A CARD YOU KEEP. IT UNLOCKS THE TURKEY TROTTERS TO PLAY AS (N/A TAB IN QUICK PLAY) WITH BOTH TURKEY UNIFORMS.' });
  add({ id: CEL, n: 'CHICKEN DANCE', sec: 'celly', slot: 'celly', rar: 1, art: 'celly', ck: 'tk565chk', tk565: 1, x489: 1,
   d: 'THANKSGIVING. FLAP YOUR WINGS, BOB YOUR HEAD, BAWK. COSMETIC ONLY.' });
 } catch (e) { fail('items', e); }
 const cardId = i => { try { return V27 && V27.cardItem ? V27.cardItem(PIDS[i]) : 'pc27|' + PIDS[i]; } catch (e) { return 'pc27|' + PIDS[i]; } };
 const CARDS = () => PIDS.map((p, i) => { const id = cardId(i); const it = V17.BY[id]; if (it) { it.tk565 = 1; it.n = DISH[i][0].toUpperCase(); const PN = { A: 'ATTACK', M: 'MIDFIELD', D: 'DEFENSE', LSM: 'LSM', FO: 'FACEOFF', G: 'GOALIE' }; it.role27 = (PN[DISH[i][1]] || DISH[i][1]) + ' - TKT'; it.d = 'PLAYER CARD: ' + it.n + ' (TURKEY TROTTERS) - OVR ' + ((PLAYERS[PIDS[i]] || {}).ovr || '') + '. SUB HIM ONTO YOUR TEAM IN QUICK PLAY + ONLINE.'; } return id; });
 V.cards = CARDS;
 const grantOne = id => { try { V17.grant(id, 1); return true; } catch (e) { const s = ST(); if (s && s.inv) { s.inv[id] = (s.inv[id] || 0) + 1; return true; } return false; } };

 // ---------- unlocks: 2 cards after the first win as Turkey Trotters; the rest from the pack / season-win flips ----------
 try {
  const GO0 = V17.gameOver;
  if (typeof GO0 === 'function') V17.gameOver = function (G, won) {
   const r = GO0.apply(this, arguments);
   try {
    if (!off() && on() && G && G.user === ID && won && !G.tutorial && !(G.meta && G.meta.online) && G.mode !== 'online' && !lsGet('tk565win', null)) {
     lsSet('tk565win', Date.now());
     const ids = CARDS(), low = ids.slice(0, 20).map((id, i) => [ id, (PLAYERS[PIDS[i]] || {}).ovr || 0 ]).sort((a, b) => a[1] - b[1]);
     grantOne(low[0][0]); grantOne(low[1][0]);
     try { V17.save(); } catch (e) {}
     try { V17.toast('TURKEY TROTTERS WIN: 2 NEW PLAYER CARDS', '#f2c230'); } catch (e) {}
     note('win cards');
    }
   } catch (e) { fail('win', e); }
   return r;
  };
 } catch (e) { fail('over', e); }
 // the shop pack: stick + celly + 6 cards (hidden until pack_turkey565 is in the shop list)
 try {
  if (V17.PACKS && !V17.PACKS.tk565) V17.PACKS.tk565 = { n: 'TURKEY TROTTERS PACK', cost: 45, bundle: [ TEAMC, STICK, CEL ].concat([ 0, 6, 12, 14, 18, 19 ].map(cardId)) };
 } catch (e) { fail('pack', e); }
 // buying the pack is the only way to own the team: set the flag when the dimes actually leave
 try {
  if (typeof PANEL_ACT === 'object' && typeof PANEL_ACT.v17buy === 'function' && !PANEL_ACT.v17buy.__tk565) {
   const B0 = PANEL_ACT.v17buy;
   const B1 = function (k) {
    if (k === 'tk565' && own565() && !(V17.rebuy580 && V17.rebuy580('tk565'))) { try { V17.toast('YOU ALREADY HAVE THE TURKEY TROTTERS PACK', '#7dff9a'); } catch (e) {} return; }
   let before = null;
    try { if (k === 'tk565') before = V17.ST().chinos; } catch (e) {}
    const r = B0.apply(this, arguments);
    try {
     if (k === 'tk565' && before != null && V17.ST().chinos < before) { lsSet('tk565own', Date.now()); ensure(); try { win.panelDirty && panelDirty(); } catch (e) {} note('pack bought'); }
    } catch (e) { fail('buy', e); }
    return r;
   };
   B1.__tk565 = 1;
   PANEL_ACT.v17buy = B1;
  }
 } catch (e) { fail('buywrap', e); }
 // card art: the real turkey uniform (side profile), even before the team is registered
 const isTkPid = pid => typeof pid === 'string' && /^TKT-\d+$/.test(pid);
 function tkArt(pid, tid, sil) {
  const p = PLAYERS[pid]; if (!p || typeof RL12 === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = 32; c.height = 32;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const F = RL12.FR, n = p.pos === 'G' && F.g_idle ? 'g_idle' : (p.pos === 'D' || p.pos === 'LSM') && F.pole_idle ? 'pole_idle' : 'idle', f = F[n];
  if (!f) return null;
  const ax = Math.round(16 - f[3][0].length / 2 + f[0]);
  RL12.draw(x, n, ax, 30, kitOf(0), true, { skin: p.skin | 0 });
  if (sil) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#05080b'; x.fillRect(0, 0, 32, 32); x.globalCompositeOperation = 'source-over'; }
  return c;
 }
 let artHooked = false;
 function hookArt() {
  try {
   if (artHooked || !win.HON25 || typeof HON25.art !== 'function') return;
   const A0 = HON25.art;
   HON25.art = function (pid, tid, sil) {
    try { if (!off() && isTkPid(pid)) { const c = tkArt(pid, tid, sil); if (c) return c; } } catch (e) { fail('art', e); }
    return A0.apply(this, arguments);
   };
   artHooked = true;
  } catch (e) { fail('arthook', e); }
 }
 hookArt();
 // the shop tile (the shop list is hand-built, so insert it like the Veterans tile does)
 try {
  // the pack picture: a Pilgrim turkey with a rainbow tail fan on a harvest-gold pack
  let packUrlC = null;
  function packArt() {
   if (packUrlC) return packUrlC;
   const cv = document.createElement('canvas'); cv.width = 44; cv.height = 60;
   const x = cv.getContext('2d'), r = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
   r(2, 0, 40, 60, '#000'); r(3, 1, 38, 58, '#e0a020');
   for (let i = 0; i < 38; i += 3) { r(3 + i, 1, 1, 3, '#8a5a2b'); r(3 + i, 56, 1, 3, '#8a5a2b'); }
   r(5, 6, 34, 40, '#2e1c0c'); r(5, 6, 34, 1, '#ffe27a'); r(6, 7, 32, 1, '#5a3a18');
   // tail fan
   const F = [ [ 10, 24, 20, '#d6202c' ], [ 15, 18, 16, '#e8741a' ], [ 20, 14, 12, '#f2c230' ], [ 25, 18, 16, '#e8741a' ], [ 30, 24, 20, '#d6202c' ] ];
   for (const f of F) { r(f[0], f[1], 5, 31 - f[1], f[3]); r(f[0] + 1, f[1] - 1, 3, 1, f[3]); r(f[0] + 2, f[1] + 3, 1, 12, '#8a5a2b'); }
   r(12, 26, 22, 3, '#8a5a2b');
   // body + belly
   r(14, 27, 16, 13, '#8a5a2b'); r(15, 26, 14, 1, '#8a5a2b'); r(17, 31, 10, 8, '#d9a066'); r(14, 27, 16, 1, '#a8703a');
   // head, eyes, beak, gobble
   r(19, 21, 6, 7, '#8a5a2b'); r(20, 23, 1, 1, '#fff'); r(23, 23, 1, 1, '#fff'); r(20, 24, 1, 1, '#000'); r(24, 24, 1, 1, '#000');
   r(21, 25, 2, 2, '#f2c230'); r(21, 27, 2, 5, '#d6202c'); r(22, 30, 1, 2, '#8e1019');
   // pilgrim hat
   r(17, 20, 10, 2, '#000'); r(19, 15, 6, 5, '#000'); r(19, 19, 6, 1, '#f2c230'); r(21, 19, 2, 1, '#fff3a0');
   // legs
   r(17, 40, 2, 4, '#f2c230'); r(25, 40, 2, 4, '#f2c230'); r(15, 44, 5, 1, '#f2c230'); r(24, 44, 5, 1, '#f2c230');
   // leaves along the bottom label
   r(5, 48, 34, 7, '#7a4a14'); r(6, 49, 32, 1, '#ffe27a');
   const leaf = (a, b, c) => { r(a, b, 3, 2, c); r(a + 1, b - 1, 1, 1, c); r(a + 3, b + 1, 1, 1, '#4a2a08'); };
   leaf(8, 52, '#d6202c'); leaf(14, 52, '#e8741a'); leaf(20, 52, '#f2c230'); leaf(26, 52, '#e8741a'); leaf(32, 52, '#d6202c');
   packUrlC = cv.toDataURL();
   return packUrlC;
  }  V.packArt = packArt; // 1.4: v570 hello popup

  const tkTile = () => {
   const L = lo();
   if (!L || !L.ready || !L.shopOn || !L.shopOn('pack_turkey565')) return '';
   const P = V17.PACKS && V17.PACKS.tk565;
   if (!P) return '';
   let bal = 0; try { bal = V17.ST().chinos || 0; } catch (e) {}
   let ok = true, minis = '';
   try { ok = V17.state ? true : true; } catch (e) {}
   minis = P.bundle.filter(id => V17.BY[id]).map(id => '<span class="hwi16" style="border-color:#d8c93a"><img alt="" src="' + V17.iconUrl(id) + '"></span>').join('');
   const left = L.leftText ? L.leftText('pack_turkey565') : '';
   const own = own565();
   return '<div class="hw16 b2504 tk565t" id="tk565tile">' + (left ? '<i class="lo502left tile">' + left + '</i>' : '') +
    '<img class="hwp16" alt="" src="' + packArt() + '" style="filter:drop-shadow(0 0 8px #fff3a0)"><div class="hwb16"><b>TURKEY TROTTERS PACK</b>' +
    '<small>THE TURKEY TROTTERS TEAM TO PLAY AS + THE TURKEY LEG STICK + THE CHICKEN DANCE + 6 TURKEY PLAYER CARDS. THANKSGIVING ONLY.</small><div class="hwr16">' + minis + '</div></div>' +
    '<div class="hwc16"><button type="button" class="g" data-a="v17b2504" data-v="tk565" aria-label="SEE WHAT\'S INSIDE">SEE WHAT\'S INSIDE</button>' +
    (own && !(V17.rebuy580 && V17.rebuy580('tk565')) ? '<button type="button" class="d" aria-label="OWNED">OWNED</button>' : own ? '<button type="button" data-a="v17buy" data-v="tk565" class="' + (bal >= P.cost ? 'y' : 'd') + '" aria-label="BUY AGAIN - TURKEY LEG STICK ONLY"><span class="coin17"></span>' + P.cost + ' AGAIN</button>' : '<button type="button" data-a="v17buy" data-v="tk565" class="' + (bal >= P.cost ? 'y' : 'd') + '" aria-label="BUY TURKEY TROTTERS PACK"><span class="coin17"></span>' + P.cost + '</button>') + '</div></div>';
  };
  const R0 = PANEL_RENDER.shop17;
  if (typeof R0 === 'function' && !R0.__tk565) {
   const W1 = function () {
    const h = R0.apply(this, arguments);
    if (off() || typeof h !== 'string') return h;
    try { const t = tkTile(), mark = '<div class="scroll" id="shopList">'; if (t && h.indexOf(mark) >= 0) return h.replace(mark, mark + t); } catch (e) { fail('shoptile', e); }
    return h;
   };
   W1.__tk565 = 1;
   PANEL_RENDER.shop17 = W1;
  }
 } catch (e) { fail('tile', e); }

 // ---------- the gift: 1 Wooden Stick for everyone (once per device) ----------
 function gift() {
  try {
   if (!giftOn() || lsGet('tk565gift', null)) return;
   const s = ST();
   if (!s || !s.inv) return;
   if (grantOne('stick_wood')) {
    lsSet('tk565gift', Date.now());
    try { V17.save(); } catch (e) {}
    try { V17.toast('HAPPY THANKSGIVING: 1 WOODEN STICK', '#f2c230'); } catch (e) {}
    note('gift');
   }
  } catch (e) { fail('gift', e); }
 }

 // ---------- the leaf card look (soft lemon yellow, not gold) ----------
 try {
  const leaf = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><g fill='%23a8b84a' opacity='.55'><path d='M5 12c0-5 4-8 8-8 0 5-3 9-8 8z'/><path d='M19 24c0-4 3-7 7-7 0 4-3 8-7 7z'/></g><g fill='%23c9a640' opacity='.45'><path d='M20 8c-3 0-5-2-5-5 3 0 5 2 5 5z'/><path d='M4 26c0-3 2-5 5-5 0 3-2 5-5 5z'/></g></svg>\")";
  const leafS = leaf.replace("opacity='.55'", "opacity='.95'").replace("opacity='.45'", "opacity='.85'").replace('%23a8b84a', '%238fa22a').replace('%23c9a640', '%23b8761a');
  const css0 = '.tk565t{position:relative;overflow:hidden;border:3px solid #8a5a2b!important;background:' + leafS + ',linear-gradient(135deg,#fff3a0,#f2c230 58%,#e0a020)!important;box-shadow:0 0 0 2px #000,0 0 14px 3px rgba(255,200,40,.75);animation:tk565glow 2.2s ease-in-out infinite}'
   + '@keyframes tk565glow{50%{box-shadow:0 0 0 2px #000,0 0 24px 8px rgba(255,150,30,.95)}}'
   + '.tk565t::after{content:"";position:absolute;top:0;bottom:0;width:26%;left:-40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);animation:tk565shine 3.6s linear infinite;pointer-events:none}@keyframes tk565shine{to{left:135%}}'
   + '.tk565t .hwb16 b{color:#4a2a08!important;text-shadow:0 1px 0 rgba(255,255,255,.5)}.tk565t .hwb16 small{color:#5a3a10!important}.tk565t .hwi16{border-color:#8a5a2b!important;background:#fff6c0}'
   + '@media (prefers-reduced-motion:reduce){.tk565t,.tk565t::after{animation:none}}';
  const TKN = DISH.map(d => d[0].toUpperCase()).concat([ 'TURKEY LEG STICK', 'CHICKEN DANCE', 'TURKEY TROTTERS TEAM' ]);
  const sel = suf => TKN.map(n => '#panel .c17[aria-label^="' + n + '"]' + (suf || '')).join(',');
  const css1 = sel(' .nm') + ',' + sel(' .rr') + ',' + sel(' .role17') + ',' + sel(' .bst17') + ',#panel .c17.tk565 .nm,#panel .c17.tk565 .n,#panel .c17.tk565 .rr,#panel .c17.tk565 .role17,#panel .c17.tk565 .bst17,#panel .c17.tk565 .ct{color:#000!important;opacity:1!important;text-shadow:none!important}'
   + sel('') + ',#panel .c17.tk565{border-color:#d8c93a!important;background:' + leafS + ',linear-gradient(#f7ec78,#eadb4a)!important;animation:none!important}';
  const css = css0 + css1 + '.c17.tk565,#panel .c17.tk565{border-color:#d8c93a;background:' + leaf + ',linear-gradient(#f7ec78,#eadb4a);animation:none}'
   + '#panel .c17.tk565 .rr,.c17.tk565 .rr{color:#6a5a10}#panel .c17.tk565::after{background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.35) 50%,transparent 60%)}'
   + '.c17.tk565 .nm,.c17.tk565 .n,.c17.tk565 .role17,.c17.tk565 .bst17,.c17.tk565 .ct{color:#3d3208}#panel .c17.tk565 .role17,#panel .c17.tk565 .bst17{color:#4a3d0a;opacity:1}#tr24 .cd.tk565{border-color:#d8c93a!important;background:' + leaf + ',linear-gradient(#f7ec78,#eadb4a)}';
  const st = document.createElement('style'); st.id = 'tk565css'; st.textContent = css; (document.head || document.documentElement).appendChild(st);
  const isTkId = v => v === STICK || v === CEL || /^pc27\|TKT-\d+$/.test(v || '');
  const NAMES = {}; DISH.forEach(d => { NAMES[d[0].toUpperCase()] = 1; }); NAMES['TURKEY LEG STICK'] = 1; NAMES['CHICKEN DANCE'] = 1; NAMES['TURKEY TROTTERS TEAM'] = 1;
  const fixDom = root => { if (off() || !root || !root.querySelectorAll) return; for (const el of root.querySelectorAll('.c17')) { if (el.classList.contains('tk565')) continue; const dv = el.getAttribute('data-v'), pid = el.getAttribute('data-pid'), lb = String(el.getAttribute('aria-label') || '').split(' - ')[0].toUpperCase(); if ((dv && isTkId(dv)) || (pid && /^TKT-\d+$/.test(pid)) || NAMES[lb]) el.classList.add('tk565'); } };
  const mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) fixDom(n.matches && n.matches('.c17') ? n.parentNode || n : n); });
  const go = () => { try { fixDom(document.body); mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { fail('mo', e); } };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
 } catch (e) { fail('css', e); }

 // ---------- CHICKEN DANCE celly ----------
 const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
 const FRM = [ 'bench_cheer0', 'bench_idle0', 'bench_cheer1', 'bench_clap' ];
 const DUR = 3.6;
 function drawDance(c, t) {
  const A = c.a565 || c.actors || [], a = A[0];
  if (!a) return;
  const x = c.sx, y = c.sy, k = Math.floor(t * 6) % 4, bob = (k % 2) ? 1 : 0;
  R(x - 4, y, 9, 2, 'rgba(0,0,0,.25)');
  const fr = RL12.FR[FRM[k]] ? FRM[k] : 'idle';
  try {
   scaled12(Math.round(x), Math.round(y - bob), () => { RL12.draw(g, fr, Math.round(x), Math.round(y - bob), a.kit, true, { skin: skinOf(a.pl), shadow: false }); });
  } catch (e) { fail('dance', e); }
  // feathers + BAWK
  for (let i = 0; i < 7; i++) {
   const ph = (t * .8 + i * .31) % 1, fx = x + Math.sin(i * 2.1 + t * 3) * 14, fy = y - 30 + ph * 32;
   g.globalAlpha = 1 - ph * .6; R(fx, fy, 2, 1, i % 2 ? '#c98a14' : '#8a5a2b'); R(fx + 1, fy + 1, 1, 1, '#d6202c'); g.globalAlpha = 1;
  }
  if (Math.floor(t * 3) % 2 === 0) { const s = 'BAWK!', w = textW(s, 1); R(x + 8, y - 40, w + 4, 9, '#fff8d0'); text(s, x + 10, y - 38, 1, '#8a5a2b'); }
 }
 let CUR = null;
 const BASE_AI = [ 'celly_bowling', 'celly_rowboat', 'celly_dominoes' ];
 function pre() {
  const G = typeof game !== 'undefined' ? game : null, c = G && G.c17;
  if (CUR && (!c || c !== CUR)) { for (const a of CUR.a565 || []) if (a.src) a.src._c17h = false; CUR = null; }
  if (!c || c.v565 || c.ck !== 'tk565chk') return;
  c.v565 = 1;
  if (c.side !== 0) {
   const L = BASE_AI.filter(id => V17.BY[id]), id = L[Math.floor(Math.random() * L.length)] || 'celly_sweep';
   c.cid = id; c.ck = V17.BY[id].ck; return;
  }
  c.a565 = c.actors; c.actors = []; c.dur = DUR; CUR = c;
 }
 function post() {
  const G = typeof game !== 'undefined' ? game : null, c = G && G.c17;
  if (!c || c.ck !== 'tk565chk' || screen !== 'banner' || G.tutorial) return;
  g.save();
  try { g.translate(-Math.round(camX), 0); drawDance(c, c.t); } catch (e) { fail('post', e); } finally { g.restore(); }
  try { const x = Math.round(W / 2 - 60), y = H - 11; rect(x, y + 1, 32, 10, '#000'); rect(x, y, 32, 10, '#ffffff'); text('SKIP', x + 16, y + 3, 1, '#0b1a20', 'center'); } catch (e) {}
 }
 if (typeof render === 'function') {
  const R0 = render;
  render = function () {
   if (off()) return R0.apply(this, arguments);
   try { pre(); } catch (e) { fail('pre', e); }
   const r = R0.apply(this, arguments);
   try { post(); } catch (e) { fail('postr', e); }
   return r;
  };
 }
 if (typeof V17.drawCelly35 === 'function') {
  const D0 = V17.drawCelly35;
  V17.drawCelly35 = function () {
   const r = D0.apply(this, arguments);
   try { const c = game && game.c17; if (!off() && c && c.ck === 'tk565chk') drawDance(c, c.t); } catch (e) { fail('clip', e); }
   return r;
  };
 }

 // ---------- one light timer ----------
 let cardsFixed = false;
 setInterval(() => { try { ensure(); gift(); hookArt(); if (!cardsFixed && !off() && V17 && V17.BY) { CARDS(); const c0 = V17.BY['pc27|' + PIDS[0]]; cardsFixed = !!(c0 && c0.tk565); } } catch (e) {} }, 1500);
 ensure();
 note('ready');
})();
