/* v491vi: VETERANS DAY HONOR PACK - the pack's extra ITEMS (Bagga Lax).
   Charlie: "Add to the pack as well some red white and blue sticks, a celly of a helicopter flying by, player grabs the rope
   and it flys him off the screen, and the fire work celly: player launches red white and blue fire works."
   - 3 STICKS (the game's own 'cstick' art: head colour, shaft colour, striped shaft), RARE durability:
       stick_v491ss  STARS + STRIPES STICK   blue head, red shaft with white stripes
       stick_v491rwb RED WHITE + BLUE STICK  red head, blue shaft with white stripes
       stick_v491hw  HONOR WHITE STICK       white head, navy shaft with red stripes
   - 2 CELLYS (the game's own celly items: CELLY box, auto-celly, CELLY button, SKIP, previews):
       celly_v491chop CHOPPER EXTRACT  a helicopter flies in over the scorer, drops a rope ladder, he grabs it and is flown up
                                       and off the screen while his teammates wave.
       celly_v491fw   FIREWORKS        the scorer plants three rockets and launches red, white and blue fireworks.
   - All 5 are b2504 items (the game's "pack only" flag): never in card packs, weekly rewards, the pass or crew pools.
     In the LOCKER they sit in their own "N/A - HONOR PACK" row under STICKS / CELLYS (locked until the pack is owned).
   - GRANTED when the Honor pack is owned: localStorage rl_vets489own truthy (checked on load + every 1.5 s), or
     window.__rl491grant() (v489 can call it on purchase). Granted once each (rl_vi491got), so a broken stick stays broken
     like every other stick. Test hook: window.__rl491test = 1 grants all 5.
   - Cellies are LOCAL visuals only (the base game's cellies are too): nothing goes over the net. CPU / online opponents
     never get these two (a pack celly rolled for the other side is swapped for a base one).
   New save key: rl_vi491got. Ids, other rl_* keys, __rl_* flags and the net protocol are unchanged.
   Kill switch: window.__rl_no491vi = true (load before this file). */
(function() {
 'use strict';
 const off = () => !!(window.__rl_no491vi || window.__rl_v124gb);
 if (off() || !window.V17 || !V17.BY || !Array.isArray(V17.I) || window.VI491) return;
 const V = window.VI491 = { log: [], err: [], granted: [], runs: [] };
 const fail = (w, e) => { V.err.push(w + ': ' + String(e && e.message || e)); if (V.err.length > 30) V.err.shift(); try { console.warn('v491', w, e); } catch (x) {} };
 const PACK = 'VETERANS DAY HONOR PACK';
 const STICKS = [
  { id: 'stick_v491ss', n: 'STARS + STRIPES STICK', col: '#2348b8', col2: '#d0202a', swirl: '#ffffff', d: 'BLUE HEAD, RED + WHITE STRIPED SHAFT.' },
  { id: 'stick_v491rwb', n: 'RED WHITE + BLUE STICK', col: '#e0262b', col2: '#2348b8', swirl: '#ffffff', d: 'RED HEAD, BLUE + WHITE STRIPED SHAFT.' },
  { id: 'stick_v491hw', n: 'HONOR WHITE STICK', col: '#f4f4f4', col2: '#1c2f7a', swirl: '#e0262b', d: 'WHITE HEAD, NAVY + RED STRIPED SHAFT.' }
 ];
 const CEL = {
  chop: { id: 'celly_v491chop', n: 'CHOPPER EXTRACT', dur: 3.7, d: 'A HELICOPTER FLIES IN, DROPS A ROPE LADDER, HE GRABS IT AND GETS FLOWN RIGHT OFF THE SCREEN.' },
  fw: { id: 'celly_v491fw', n: 'FIREWORKS', dur: 3.4, d: 'PLANTS THREE ROCKETS AND LAUNCHES RED, WHITE AND BLUE FIREWORKS.' }
 };
 const CK = { v491chop: 'chop', v491fw: 'fw' };
 const IDS = STICKS.map(s => s.id).concat([ CEL.chop.id, CEL.fw.id ]);
 V.ids = IDS.slice();
 const add = it => { if (!V17.BY[it.id]) { V17.BY[it.id] = it; V17.I.push(it); } };
 try {
  for (const s of STICKS) add({ id: s.id, n: s.n, sec: 'stick', slot: 'stick', rar: 1, art: 'cstick', col: s.col, col2: s.col2, swirl: s.swirl,
   brk: .012, b2504: 1, v491: 1, d: PACK + '. ' + s.d + ' LESS LIKELY TO BREAK.' });
  for (const k of [ 'chop', 'fw' ]) add({ id: CEL[k].id, n: CEL[k].n, sec: 'celly', slot: 'celly', rar: 2, art: 'celly', ck: 'v491' + k,
   b2504: 1, v491: 1, d: PACK + '. ' + CEL[k].d + ' COSMETIC ONLY.' });
 } catch (e) { fail('add', e); }

 // ---------- granting ----------
 const LSK = 'rl_vi491got';
 const got = () => { try { const a = JSON.parse(localStorage.getItem(LSK) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
 const packOwned = () => { try { const v = localStorage.getItem('rl_vets489own'); return !!v && v !== '0' && v !== 'false' && v !== 'null'; } catch (e) { return false; } };
 function grantAll(why) {
  if (off()) return 0;
  const S = V17.ST && V17.ST();
  if (!S || !S.inv) return 0;
  const g0 = got(); let n = 0;
  for (const id of IDS) {
   if (g0.includes(id)) continue;
   if (!(S.inv[id] > 0)) { try { V17.grant(id, 1); n++; } catch (e) { fail('grant', e); continue; } }
   g0.push(id);
  }
  if (n || g0.length) { try { localStorage.setItem(LSK, JSON.stringify(g0)); } catch (e) {} }
  if (n) { try { V17.save(); } catch (e) {} V.granted.push([ why, n, Date.now() ]); }
  return n;
 }
 window.__rl491grant = () => grantAll('call');
 V.grantAll = grantAll;
 const check = () => { try { if (!off() && (packOwned() || window.__rl491test) && got().length < IDS.length) grantAll(window.__rl491test ? 'test' : 'pack'); } catch (e) { fail('check', e); } };
 check();
 setInterval(check, 1500);

 // ---------- pixel helpers ----------
 const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
 const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
 const lerp = (a, b, k) => a + (b - a) * k;
 const hsh = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
 function body(fr, x, y, kit, faceRight, pl, rot) {
  try {
   if (!RL12.FR[fr]) fr = 'idle';
   const X = Math.round(x), Y = Math.round(y);
   g.save();
   if (rot) { g.translate(X, Y); g.rotate(rot); g.translate(-X, -Y); }
   try {
    scaled12(X, Y, () => {
     const gr = pl && game && game.g17 && game.g17.gear ? game.g17.gear[pl.id] : null;
     if (gr) {
      const f0 = RL12.FR[fr], cv2 = V17.bakeGear(fr, kit, !faceRight, skinOf(pl), gr, false);
      if (cv2) {
       const pad = cv2.pad17 || 0, w = f0[3][0].length, ax = faceRight ? f0[0] : w - 1 - f0[0];
       g.drawImage(cv2, X - ax - pad, Y - f0[1] - pad);
       return;
      }
     }
     RL12.draw(g, fr, X, Y, kit, faceRight, { skin: skinOf(pl) });
    });
   } finally { g.restore(); }
  } catch (e) { fail('body', e); }
 }
 const shadow = (x, y, a) => { g.fillStyle = 'rgba(0,0,0,' + (a == null ? .25 : a) + ')'; g.fillRect(Math.round(x) - 4, Math.round(y), 9, 2); };
 const actorsOf = c => c.a491 || c.actors || [];
 // teammates: run in, then wave / cheer (looking at the show)
 function mates(c, t, look) {
  const A = actorsOf(c);
  for (let i = 1; i < A.length; i++) {
   const a = A[i], ang = i * 1.3 + .4, tx = c.sx + Math.cos(ang) * 26, ty = Math.max(FT + 14, Math.min(FB - 3, c.sy + Math.sin(ang) * 11));
   const k = ease(t / .55), x = lerp(a.x0, tx, k), y = lerp(a.y0, ty, k);
   const fr = t < .55 ? [ 'run0', 'run1', 'run2', 'run3' ][Math.floor(t * 9) % 4] : [ 'bench_cheer0', 'bench_cheer1' ][Math.floor(t * (3 + i % 3)) % 2];
   shadow(x, y);
   body(fr, x, y, a.kit, look != null ? look(x) : tx < c.sx, a.pl, 0);
  }
 }

 // ---------- CHOPPER EXTRACT ----------
 // a generic pixel helicopter (no markings): olive body, bubble window, tail boom, tail rotor, skids, spinning rotor
 function heli(x, y, f, t, carry) {
  const X = Math.round(x), Y = Math.round(y), s = f;   // s = +1 nose right
  const P = (dx, dy, w, h, c) => R(s > 0 ? X + dx : X - dx - w + 1, Y + dy, w, h, c);
  const O = '#121a12', B = '#4f6b3a', b = '#3b5229', L = '#6f8c55', G = '#9fd8ff', g2 = '#e8f7ff';
  // tail boom + fin + tail rotor
  P(-26, -3, 16, 3, O); P(-25, -2, 15, 1, b);
  P(-28, -8, 4, 7, O); P(-27, -7, 2, 5, B);
  const tr = Math.floor(t * 30) % 2;
  if (tr) P(-29, -10, 1, 9, '#c8c8c8'); else P(-32, -6, 7, 1, '#c8c8c8');
  // a small red/white/blue stripe on the boom (our own touch, not an insignia)
  P(-18, -2, 2, 1, '#e0262b'); P(-16, -2, 2, 1, '#ffffff'); P(-14, -2, 2, 1, '#2348b8');
  // body
  P(-11, -8, 20, 10, O); P(-10, -7, 18, 8, B); P(-10, -1, 18, 2, b); P(-9, -7, 12, 1, L);
  // nose window
  P(6, -7, 5, 7, O); P(6, -6, 4, 5, G); P(7, -5, 2, 1, g2);
  // door + engine hump
  P(-5, -6, 6, 6, b); P(-4, -5, 4, 4, carry ? '#1a1a1a' : '#2b3a20');
  P(-6, -11, 10, 3, O); P(-5, -10, 8, 2, b);
  // mast + rotor (long blur / short blades)
  P(-1, -13, 2, 2, O);
  const ph = Math.floor(t * 24) % 3;
  if (ph === 0) { P(-24, -14, 48, 1, '#d0d0d0'); }
  else if (ph === 1) { P(-16, -14, 32, 1, '#e8e8e8'); P(-24, -14, 4, 1, 'rgba(220,220,220,.45)'); P(20, -14, 4, 1, 'rgba(220,220,220,.45)'); }
  else { P(-8, -14, 16, 1, '#f4f4f4'); g.fillStyle = 'rgba(220,220,220,.3)'; g.fillRect(X - 22, Y - 15, 44, 1); }
  // skids
  P(-9, 3, 1, 2, O); P(4, 3, 1, 2, O); P(-12, 5, 20, 1, O); P(8, 4, 1, 1, O);
 }
 function ladder(x, y0, y1, t) {
  const sw = Math.sin(t * 5) * 1.2;
  const n = Math.max(1, Math.round(y1 - y0));
  for (let i = 0; i <= n; i += 1) {
   const u = i / n, xx = Math.round(x + sw * u);
   R(xx - 2, y0 + i, 1, 1, '#c9a46b'); R(xx + 2, y0 + i, 1, 1, '#c9a46b');
   if (i % 3 === 2) R(xx - 1, y0 + i, 3, 1, '#e0c890');
  }
 }
 function drawChop(c, t, V0) {
  const A = actorsOf(c), sc = A[0], f = c.face || 1;
  const view = V0 || { l: camX, r: camX + W, top: 0 };
  const hoverY = Math.max(view.top + 16, c.sy - 58);
  const hx0 = f > 0 ? view.l - 50 : view.r + 50;
  // phases: fly in 0-1.0, hover + ladder 1.0-1.45, grab 1.45-1.75, lift + fly out 1.75-dur
  let hx, hy;
  const tIn = 1.0, tDrop = 1.45, tGrab = 1.75;
  if (t < tIn) { const k = ease(t / tIn); hx = lerp(hx0, c.sx - 3 * f, k); hy = lerp(hoverY - 18, hoverY, k) + Math.sin(t * 6) * 1; }
  else if (t < tGrab) { hx = c.sx - 3 * f; hy = hoverY + Math.sin(t * 6) * 1; }
  else { const u = t - tGrab; hx = c.sx - 3 * f + f * (u * u * 70 + u * 20); hy = hoverY - u * u * 42 - u * 6; }
  const tilt = t < tIn ? .12 * f * (1 - ease(t / tIn)) : t > tGrab ? .14 * f * Math.min(1, (t - tGrab) * 2) : 0;
  // rotor wash on the turf while it is low
  if (t > .6 && t < tGrab + .6) for (let i = 0; i < 6; i++) {
   const u = (t * 2.2 + i / 6) % 1, dx = (i % 2 ? 1 : -1) * (6 + u * 22);
   g.fillStyle = 'rgba(214,232,170,' + (.55 * (1 - u)).toFixed(2) + ')'; g.fillRect(Math.round(c.sx + dx), Math.round(c.sy + 1 - u * 3), 2, 1);
  }
  // ladder
  const ladTop = hy + 5;
  let ladBot = ladTop;
  if (t >= tIn) ladBot = t < tDrop ? lerp(ladTop, c.sy - 14, ease((t - tIn) / (tDrop - tIn))) : null;
  // the scorer
  const scX0 = sc ? sc.x0 : c.sx, scY0 = sc ? sc.y0 : c.sy;
  let px, py, fr, face = f > 0, rot = 0;
  if (t < .35) { const k = ease(t / .35); px = lerp(scX0, c.sx, k); py = lerp(scY0, c.sy, k); fr = [ 'run0', 'run1', 'run2', 'run3' ][Math.floor(t * 9) % 4]; }
  else if (t < tDrop) { px = c.sx; py = c.sy; fr = Math.floor(t * 4) % 2 ? 'bench_cheer0' : 'idle'; }
  else if (t < tGrab) { px = c.sx; py = c.sy - ease((t - tDrop) / (tGrab - tDrop)) * 3; fr = 'bench_cheer0'; }
  else { px = hx + 3 * f + Math.sin(t * 5) * 1.2; py = hy + 26; fr = Math.floor(t * 3) % 2 ? 'bench_cheer0' : 'bench_cheer1'; rot = Math.sin(t * 5) * .08; }
  if (t >= tDrop) ladBot = py - 13;
  mates(c, t, x => x < px);
  if (t < tGrab + .4) shadow(c.sx, c.sy, .25 * (t < tGrab ? 1 : 1 - (t - tGrab) / .4));
  // heli shadow on the turf
  if (hy > view.top - 20) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(Math.round(hx) - 14, Math.round(Math.min(FB - 4, c.sy + 6)), 28, 2); }
  if (t >= tIn) ladder(hx + 1 * f, ladTop, ladBot, t);
  if (sc) body(fr, px, py, sc.kit, face, sc.pl, rot);
  g.save();
  try {
   if (tilt) { g.translate(Math.round(hx), Math.round(hy)); g.rotate(tilt); g.translate(-Math.round(hx), -Math.round(hy)); }
   heli(hx, hy, f, t, t > tGrab);
  } finally { g.restore(); }
 }

 // ---------- FIREWORKS ----------
 const FWC = [ [ '#ff3b3b', '#ffb0a8' ], [ '#ffffff', '#fff6c8' ], [ '#3f7bff', '#a8c8ff' ] ];
 function drawFire(c, t, V0) {
  const A = actorsOf(c), sc = A[0], f = c.face || 1;
  const view = V0 || { l: camX, r: camX + W, top: 0 };
  // launch tubes planted beside him
  const tubes = [ -1, 0, 1 ].map(j => ({ x: c.sx + f * (12 + j * 7), y: c.sy + 1 }));
  const L1 = [ .8, 1.15, 1.5 ], L2 = [ 2.05, 2.25, 2.45 ];
  const shots = [];
  for (let i = 0; i < 3; i++) {
   const tx = tubes[i].x, top = Math.max(view.top + 12, c.sy - 74);
   shots.push({ t0: L1[i], x0: tx, y0: tubes[i].y - 4, x1: tx + (i - 1) * 16 * f + f * 6, y1: top + 8 + i % 2 * 9, col: FWC[i], n: 28 });
   shots.push({ t0: L2[i], x0: tx, y0: tubes[i].y - 4, x1: tx - (i - 1) * 22 * f - f * 18, y1: top + 2 + (2 - i) * 6, col: FWC[(i + 1) % 3], n: 24 });
  }
  // the scorer: runs in, kneels to plant (0.35-0.75), stands and points, then cheers
  const scX0 = sc ? sc.x0 : c.sx, scY0 = sc ? sc.y0 : c.sy;
  let px = c.sx, py = c.sy, fr = 'idle';
  if (t < .35) { const k = ease(t / .35); px = lerp(scX0, c.sx, k); py = lerp(scY0, c.sy, k); fr = [ 'run0', 'run1', 'run2', 'run3' ][Math.floor(t * 9) % 4]; }
  else if (t < .75) fr = Math.floor(t * 8) % 2 ? 'check0' : 'check1';
  else if (t < 1.7) fr = Math.floor(t * 6) % 3 === 0 ? 'shoot1' : 'bench_cheer0';
  else fr = [ 'bench_cheer0', 'bench_cheer1' ][Math.floor(t * 4) % 2];
  mates(c, t, x => x < c.sx + f * 10);
  // tubes: appear as he plants them
  for (let i = 0; i < 3; i++) {
   if (t < .4 + i * .1) continue;
   const tb = tubes[i];
   R(tb.x - 1, tb.y - 5, 3, 5, '#0d0d0d'); R(tb.x, tb.y - 4, 1, 4, FWC[i][0] === '#ffffff' ? '#dcdcdc' : FWC[i][0]);
   R(tb.x - 1, tb.y - 6, 3, 1, '#ffe14d');
   // fuse sparks before launch
   const nx = L1[i];
   if (t > nx - .3 && t < nx) { R(tb.x + (Math.floor(t * 20) % 2 ? 1 : -1), tb.y - 7 - Math.floor(t * 20) % 2, 1, 1, '#ffe14d'); }
  }
  if (sc) { shadow(px, py); body(fr, px, py, sc.kit, f > 0, sc.pl, 0); }
  // rockets + bursts
  for (const s of shots) {
   const u = t - s.t0;
   if (u < 0) continue;
   const rise = .45;
   if (u < rise) {
    const k = u / rise, kk = 1 - (1 - k) * (1 - k);
    const x = lerp(s.x0, s.x1, kk), y = lerp(s.y0, s.y1, kk);
    // trail
    for (let j = 1; j <= 5; j++) {
     const k2 = Math.max(0, kk - j * .05), x2 = lerp(s.x0, s.x1, k2), y2 = lerp(s.y0, s.y1, k2);
     g.fillStyle = j < 3 ? '#ffe9a0' : 'rgba(255,200,120,' + (.6 - j * .08).toFixed(2) + ')'; g.fillRect(Math.round(x2), Math.round(y2), 2, 2);
    }
    R(x - 1, y - 2, 3, 3, s.col[0]); R(x, y - 1, 1, 1, '#ffffff');
    continue;
   }
   const b = u - rise;
   if (b > 1.3) continue;
   // flash
   if (b < .1) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(Math.round(s.x1) - 4, Math.round(s.y1) - 4, 9, 9); }
   const a = Math.max(0, 1 - b / 1.3);
   for (let j = 0; j < s.n; j++) {
    const ang = j / s.n * Math.PI * 2 + s.t0, sp = 20 + hsh(j + s.t0 * 10) * 12;
    const d = sp * (1 - Math.exp(-b * 3.2)), x = Math.round(s.x1 + Math.cos(ang) * d), y = Math.round(s.y1 + Math.sin(ang) * d * .9 + b * b * 9);
    if (a < .35 && (j + Math.floor(b * 20)) % 2) continue;     // sparkle out
    g.globalAlpha = a * .45; g.fillStyle = '#0b1a10'; g.fillRect(x + 1, y + 1, 2, 2);
    g.globalAlpha = a;
    g.fillStyle = s.col[0]; g.fillRect(x, y, 2, 2);
    if (b < .5) { g.fillStyle = s.col[1]; g.fillRect(x, y, 1, 1); }
    if (b < .7) { g.fillStyle = s.col[0]; const x2 = s.x1 + Math.cos(ang) * d * .7, y2 = s.y1 + Math.sin(ang) * d * .63 + b * b * 7; g.fillRect(Math.round(x2), Math.round(y2), 1, 1); }
    g.globalAlpha = 1;
   }
   // twinkles
   if (b > .3) for (let j = 0; j < 6; j++) {
    if ((Math.floor(b * 14) + j) % 3) continue;
    const ang = hsh(j * 7 + s.t0) * 6.28, d = 6 + hsh(j * 3 + s.t0) * 16;
    const x = s.x1 + Math.cos(ang) * d, y = s.y1 + Math.sin(ang) * d + b * b * 10;
    g.globalAlpha = a; R(x - 1, y, 3, 1, '#fff8d0'); R(x, y - 1, 1, 3, '#fff8d0'); g.globalAlpha = 1;
   }
  }
 }
 const DRAW = { chop: drawChop, fw: drawFire };
 V.draw = (c, t, view) => { const k = CK[c && c.ck]; if (k) DRAW[k](c, t, view); };

 // ---------- hooking into the game's celly flow ----------
 const BASE_AI = { 0: [ 'celly_sweep', 'celly_salute', 'celly_pushups', 'celly_guitar', 'celly_sprinkler' ], 1: [ 'celly_chestbump', 'celly_worm', 'celly_kneeslide' ], 2: [ 'celly_bowling', 'celly_rowboat', 'celly_dominoes' ] };
 let CUR = null;
 function pre() {
  const G = typeof game !== 'undefined' ? game : null, c = G && G.c17;
  if (CUR && (!c || c !== CUR)) { for (const a of CUR.a491 || []) if (a.src) a.src._c17h = false; CUR = null; }
  if (!c || c.v491 || !CK[c.ck]) return;
  c.v491 = 1;
  if (c.side !== 0 && !window.__rl491aiTest) {
   // the other side never gets a pack celly: swap for a base one of the same rarity
   const L = BASE_AI[2].filter(id => V17.BY[id]), id = L[Math.floor(Math.random() * L.length)] || 'celly_sweep';
   c.cid = id; c.ck = V17.BY[id].ck;
   try { const lg = G.c17log && G.c17log[G.c17log.length - 1]; if (lg && lg.cid) lg.cid = id; } catch (e) {}
   return;
  }
  c.a491 = c.actors;
  c.actors = [];
  c.dur = CEL[CK[c.ck]].dur;
  CUR = c;
  V.runs.push({ ck: c.ck, side: c.side, t: G.t });
  if (V.runs.length > 20) V.runs.shift();
 }
 function post() {
  const G = typeof game !== 'undefined' ? game : null, c = G && G.c17;
  if (!c || !CK[c.ck] || screen !== 'banner' || G.tutorial) return;
  g.save();
  try { g.translate(-Math.round(camX), 0); V.draw(c, c.t); } catch (e) { fail('draw', e); } finally { g.restore(); }
  // the base SKIP button sits under the show: paint it again on top (its tap area is the game's own)
  try {
   const x = Math.round(W / 2 - 60), y = H - 11;
   rect(x, y + 1, 32, 10, '#000'); rect(x, y, 32, 10, '#ffffff'); text('SKIP', x + 16, y + 3, 1, '#0b1a20', 'center');
  } catch (e) {}
 }
 if (typeof render === 'function') {
  const R0 = render;
  render = function() {
   if (off()) return R0.apply(this, arguments);
   try { pre(); } catch (e) { fail('pre', e); }
   const r = R0.apply(this, arguments);
   try { post(); } catch (e) { fail('post', e); }
   return r;
  };
 }
 // clips (v35) replay cellies through V17.drawCelly35 inside the world transform
 if (typeof V17.drawCelly35 === 'function') {
  const D0 = V17.drawCelly35;
  V17.drawCelly35 = function() {
   const r = D0.apply(this, arguments);
   try { const c = game && game.c17; if (!off() && c && CK[c.ck]) V.draw(c, c.t); } catch (e) { fail('clip', e); }
   return r;
  };
 }

 // ---------- celly preview in the item popup (canvas.cprev17, 160x64) ----------
 let PV = { id: null, t0: 0 };
 setInterval(() => {
  try {
   if (off()) return;
   const cv2 = document.querySelector && document.querySelector('canvas.cprev17');
   if (!cv2 || !CK[(V17.BY[cv2.dataset.c] || {}).ck]) return;
   const it = V17.BY[cv2.dataset.c], k = CK[it.ck];
   if (PV.id !== it.id) PV = { id: it.id, t0: performance.now() };
   const dur = CEL[k].dur, t = Math.min((performance.now() - PV.t0) / 1e3 % (dur + .8), dur);
   const S = typeof season !== 'undefined' ? season : null, tid = typeof lobbyTeam === 'function' && lobbyTeam() || S && S.team || null;
   const kit = tid && typeof lobbyKit === 'function' ? lobbyKit(tid) : { jersey: '#2c6bd8', trim: '#ffffff', helm: '#2c6bd8' };
   const fx = 400, fy = CY, c = { ck: it.ck, t: t, dur: dur, sx: fx, sy: fy, face: 1, actors: [] };
   for (let i = 0; i < 3; i++) c.actors.push({ src: null, pl: null, x0: fx, y0: fy, kit: kit });
   const x = cv2.getContext('2d'), kk = g, G0 = game;
   x.imageSmoothingEnabled = false;
   g = x;
   try {
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = k === 'fw' ? '#10183a' : '#7ec4ff'; x.fillRect(0, 0, cv2.width, cv2.height - 22);
    x.fillStyle = '#2f7d3a'; x.fillRect(0, cv2.height - 22, cv2.width, 22);
    x.fillStyle = '#358a41'; for (let i = 0; i < cv2.width; i += 16) x.fillRect(i, cv2.height - 22, 8, 22);
    x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, cv2.height - 8, cv2.width, 1);
    x.translate(cv2.width / 2 - fx, cv2.height - 14 - fy);
    game = { c17: c, g17: null, t: t };
    V.draw(c, t, { l: fx - 80, r: fx + 80, top: fy - (cv2.height - 14) });
   } finally { game = G0; x.setTransform(1, 0, 0, 1, 0, 0); g = kk; }
  } catch (e) { fail('preview', e); }
 }, 50);

 // ---------- icons (20x20 tiles) for the two cellies ----------
 const ICON = {};
 function mkIcon(k, sil) {
  const cv = document.createElement('canvas'); cv.width = 20; cv.height = 20;
  const x = cv.getContext('2d'), r = (i, j, w, h, c) => { x.fillStyle = sil ? '#000' : c; x.fillRect(i, j, w, h); };
  const fig = (ox, oy) => { r(ox - 2, oy - 4, 1, 4, '#2c6bd8'); r(ox + 1, oy - 4, 1, 4, '#2c6bd8'); r(ox - 2, oy - 10, 4, 6, '#2c6bd8'); r(ox - 2, oy - 14, 4, 4, '#1d4fa8'); r(ox - 3, oy - 15, 1, 5, '#f0c090'); r(ox + 2, oy - 15, 1, 5, '#f0c090'); };
  if (k === 'chop') {
   r(1, 1, 18, 1, '#d0d0d0'); r(9, 2, 2, 1, '#121a12');
   r(4, 3, 10, 5, '#121a12'); r(5, 4, 8, 3, '#4f6b3a'); r(11, 4, 3, 3, '#9fd8ff');
   r(0, 4, 5, 2, '#121a12'); r(1, 5, 3, 1, '#3b5229'); r(0, 2, 1, 4, '#c8c8c8');
   r(5, 9, 8, 1, '#121a12');
   for (let j = 9; j <= 13; j++) { r(8, j, 1, 1, '#c9a46b'); r(10, j, 1, 1, '#c9a46b'); if (j % 2) r(8, j, 3, 1, '#e0c890'); }
   fig(9, 19);
  } else {
   const b = (cx, cy, c) => { for (let a = 0; a < 8; a++) { const d = 3; r(Math.round(cx + Math.cos(a * .785) * d), Math.round(cy + Math.sin(a * .785) * d), 1, 1, c); } r(cx, cy, 1, 1, c); };
   b(4, 4, '#ff3b3b'); b(15, 3, '#3f7bff'); b(10, 8, '#ffffff');
   r(13, 13, 1, 6, '#0d0d0d'); r(15, 14, 1, 5, '#0d0d0d'); r(13, 12, 1, 1, '#ffe14d');
   r(14, 9, 1, 3, '#ffe9a0');
   fig(6, 19);
  }
  return cv.toDataURL();
 }
 const iconFor = (id, sil) => { const k = CK[(V17.BY[id] || {}).ck], key = id + (sil ? 's' : ''); return k ? ICON[key] || (ICON[key] = mkIcon(k, sil)) : null; };
 V.iconFor = iconFor;
 // the game draws celly tiles with its own stick-figure art: swap in ours wherever an item card's <img> is rendered
 // both pack cellies share the game's fallback tile, so each <img> takes the icon of the nearest item id before it
 let SWAP = null;
 const swaps = () => {
  if (SWAP) return SWAP;
  SWAP = [];
  for (const sil of [ false, true ]) {
   try { const u = V17.iconUrl(CEL.chop.id, sil); if (u) SWAP.push([ u, sil ]); } catch (e) {}
  }
  return SWAP;
 };
 const fixHtml = h => {
  if (typeof h !== 'string' || h.indexOf('celly_v491') < 0) return h;
  for (const [a, sil] of swaps()) {
   if (h.indexOf(a) < 0) continue;
   let out = '', i = 0, j;
   while ((j = h.indexOf(a, i)) >= 0) {
    const back = h.slice(Math.max(0, j - 900), j), pc = back.lastIndexOf(CEL.chop.id), pf = back.lastIndexOf(CEL.fw.id);
    const id = pc < 0 && pf < 0 ? null : pc > pf ? CEL.chop.id : CEL.fw.id;
    out += h.slice(i, j) + (id ? iconFor(id, sil) : a);
    i = j + a.length;
   }
   h = out + h.slice(i);
  }
  return h;
 };

 // ---------- LOCKER: an N/A (HONOR PACK) row under STICKS and CELLYS ----------
 const NA = { stick: STICKS.map(s => s.id), celly: [ CEL.chop.id, CEL.fw.id ] };
 function lockerHtml(h) {
  if (typeof h !== 'string' || h.indexOf('data-v="stick_v491') < 0 && h.indexOf('data-v="celly_v491') < 0) return h;
  const T = document.createElement('template');
  T.innerHTML = h;
  const S = V17.ST(), own = id => !!(S && S.inv && S.inv[id] > 0);
  let ch = false;
  for (const k of [ 'stick', 'celly' ]) {
   const cards = NA[k].map(id => T.content.querySelector('[data-v="' + id + '"]')).filter(Boolean);
   if (!cards.length) continue;
   const sec = cards[0].closest('.sec17');
   if (!sec || sec.classList.contains('na491')) continue;
   const out = document.createElement('div');
   out.className = 'sec17 na491';
   const un = NA[k].filter(own).length;
   out.innerHTML = '<div class="sh17">N/A ' + (k === 'stick' ? 'STICKS' : 'CELLYS') + ' - VETERANS DAY HONOR PACK <span>' + un + ' / ' + NA[k].length + '</span></div><div class="grid17"></div>';
   const grid = out.querySelector('.grid17');
   for (const cd of cards) grid.appendChild(cd);
   // the main row's own count: take ours out of it
   try {
    const sp = sec.querySelector('.sh17 span'), m = sp && /^(\d+) \/ (\d+)$/.exec(sp.textContent.trim());
    if (m) sp.textContent = (+m[1] - un) + ' / ' + (+m[2] - NA[k].length);
   } catch (e) {}
   sec.after(out);
   ch = true;
  }
  return ch ? T.innerHTML : h;
 }
 try {
  if (typeof PANEL_RENDER === 'object' && PANEL_RENDER) {
   for (const key of Object.keys(PANEL_RENDER)) {
    const R1 = PANEL_RENDER[key];
    if (typeof R1 !== 'function') continue;
    PANEL_RENDER[key] = function() {
     let h = R1.apply(this, arguments);
     if (off() || typeof h !== 'string') return h;
     try { if (key === 'locker17') h = lockerHtml(h); } catch (e) { fail('locker', e); }
     try { h = fixHtml(h); } catch (e) { fail('icon', e); }
     return h;
    };
   }
  }
 } catch (e) { fail('panels', e); }
 try {
  const st = document.createElement('style');
  st.textContent = '#panel .sec17.na491 .sh17{color:#ffe14d}#panel .sec17.na491 .sh17::before{content:"";display:inline-block;width:12px;height:6px;margin-right:4px;vertical-align:middle;background:linear-gradient(#e0262b 0 33%,#fff 33% 66%,#2348b8 66%)}';
  document.head.appendChild(st);
 } catch (e) {}
 V.log.push('ready ' + IDS.length + ' items');
})();
