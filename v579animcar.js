'use strict';
/* v579animcar - 1.4 CAREER SCENES: SIGNING DAY + DRAFT NIGHT (Bagga Lax 1.4, Vidze's career_signing.gif / career_draft.gif).
   Signing (after CAR459.sign(college) succeeds): your player behind a desk in a polo made from his high-school jersey
   colours, no helmet, his own skin/face/hair (hair = the game's own braid hair colour for him), hand + pen moving, scribble
   appears, polo turns the college's colours, SIGNED! stamp, welcome plate with the REAL college name. The raised hand
   comes back down to the desk at the end (no arm left hanging).
   Draft (after CAR459.runDraft() returns a pick): board counts the picks up to YOUR real pick, you walk up in your college
   kit, then DRAFTED #N OVERALL by the REAL team in their pro kit. The player is drawn through the game's gear path
   (V17.bakeGear with V17.heroGear for the career player while walking, the full lobbyHero chain for the pro-kit pose),
   so every equipped item shows and moves with him.
   Nothing about the career changes: the original sign / runDraft run first and their result is returned untouched.
   SKIP on both. Any throw ends the scene. Kill switches: window.__rl_no579anim (all), __rl_no579car. */
(function () {
 const W0 = window, A = W0.AN579, CA = W0.CAR459;
 if (!A || !CA) return;
 const noCar = () => !A.on() || !!W0.__rl_no579car;
 const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = x => 1 - (1 - x) * (1 - x);
 const q = (v, s) => Math.round(v / s) * s;
 const ME = CA.ME || 'CAR459-ME';
 const mix = (a, b, t) => { const p = s => [ 1, 3, 5 ].map(i => parseInt(s.slice(i, i + 2), 16)); try { const X = p(a), Y = p(b); return '#' + X.map((v, i) => Math.round(v + (Y[i] - v) * t).toString(16).padStart(2, '0')).join(''); } catch (e) { return a; } };
 const hex = c => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '#3a4650');
 const conf = Array.from({ length: 70 }, (_, i) => ({ x: (i * 97) % 844, v: 70 + (i * 37) % 90, ph: (i * 13) % 100 / 100, c: i % 3, s: i % 2 ? 8 : 4, sw: 8 + i % 5 }));
 function scene(kind, render) {
  return A.stage({ kind: kind, z: 2147483200, render: (cx, t, S) => A.withG(cx, () => render(cx, t, S)) });
 }
 const R = (cx, x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
 function confetti(cx, t, t0, cols) {
  if (t < t0) return;
  for (const p of conf) { const u = t - t0 - p.ph * .6; if (u < 0) continue; const y = q(-20 + p.v * u * 1.6, 4), x = q(p.x + Math.sin(u * p.sw * .6) * 14, 4); if (y > 390) continue; R(cx, x, y, p.s, p.s, cols[p.c % cols.length]); }
 }
 function banner(cx, txt, y, sc, col, bg, shake) {
  const Wd = 844, w = textW(txt, sc) + 24, x = Math.round(Wd / 2 - w / 2) + (shake || 0);
  R(cx, x - 4, y - 4, w + 8, 8 * sc + 16, '#05080b'); R(cx, x, y, w, 8 * sc + 8, bg); R(cx, x, y, w, 3, 'rgba(255,255,255,.3)');
  text(txt, Wd / 2 + (shake || 0), y + 6, sc, col, 'center', '#000');
 }
 function spr(cx, name, x, y, kit, faceRight, k, skin) {
  const f = RL12.FR[name]; if (!f) return;
  const c = RL12.bake(name, kit, !faceRight, skin), ax = faceRight ? f[0] : c.width - 1 - f[0];
  R(cx, x - 5 * k, y - k, 11 * k, 2 * k, 'rgba(0,0,0,.28)');
  cx.drawImage(c, 0, 0, c.width, c.height, Math.round(x - ax * k), Math.round(y - f[1] * k), c.width * k, c.height * k);
 }
 // the career player through the game's gear path (all equipped items)
 function sprMe(cx, name, x, y, kit, faceRight, k, skin) {
  const f = RL12.FR[name]; if (!f) return;
  let c = null;
  try { const gr = gearMe(kit); c = V17.bakeGear(name, kit, !faceRight, skin, gr || {}, false, { nopad: true }); } catch (e) { A.fail('bakeGear', e); }
  if (!c) c = RL12.bake(name, kit, !faceRight, skin);
  const pad = c.pad17 || 0, ax = faceRight ? f[0] : c.width - 1 - pad * 2 - f[0];
  R(cx, x - 5 * k, y - k, 11 * k, 2 * k, 'rgba(0,0,0,.28)');
  cx.drawImage(c, 0, 0, c.width, c.height, Math.round(x - (ax + pad) * k), Math.round(y - (f[1] + pad) * k), c.width * k, c.height * k);
 }
 // career items live on the career card (v523: V523.gear / V523.liveId), not on CAR459-ME
 const heroPid = () => { try { return W0.V523 && V523.liveId && V523.liveId() || ME; } catch (e) { return ME; } };
 const gearMe = kit => { try { const g0 = W0.V523 && V523.gear ? V523.gear() : null; if (g0) return g0; return V17.heroGear ? V17.heroGear(heroPid(), kit) : null; } catch (e) { return null; } };
 const skinMe = () => { try { return skinOf(PP(ME)); } catch (e) { try { return CA.get().me.skin | 0; } catch (_) { return 0; } } };
 const hairMe = () => { try { return [ '#1a120c', '#2a1b10', '#120d0a', '#33241a' ][seedOf('braid:' + ME) % 4]; } catch (e) { return '#2a1b10'; } };
 function floorWood(cx, y0) { R(cx, 0, y0, 844, 390 - y0, '#6b4a2a'); for (let y = y0; y < 390; y += 14) R(cx, 0, y, 844, 2, '#4d3419'); for (let i = 0; i < 40; i++) R(cx, (i * 97 + ((i * 31) % 3) * 40) % 844, y0 + 4 + (i * 53) % (390 - y0 - 8), 30, 2, '#7c5832'); R(cx, 0, y0, 844, 4, '#3a2614'); }

 /* ---- polo frame: bench_idle0 without helmet cage / stick, collar + placket (Vidze's pixel edits) ---- */
 let POLO = null;
 function poloFrame() {
  if (POLO) return POLO;
  const f = RL12.FR.bench_idle0, PL = 3, PT = 3;
  const Wd = f[3][0].length + PL + 3, Hd = f[3].length + PT + 1;
  const G = Array.from({ length: Hd }, () => Array(Wd).fill('.'));
  f[3].forEach((r, y) => [ ...r ].forEach((ch, x) => { G[y + PT][x + PL] = ch; }));
  const set = (r, c, ch) => { G[r + PT][c + PL] = ch; };
  const at = (r, c) => G[r + PT][c + PL];
  for (let r = 0; r < 22; r++) for (let c = 11; c < 16; c++) if ('MmnX'.includes(at(r, c))) set(r, c, '.');
  for (let r = 0; r < 22; r++) for (let c = 0; c < 14; c++) if (at(r, c) === 'c') set(r, c, 'S');
  for (let c = 3; c <= 10; c++) if (at(4, c) === 'o') set(4, c, 'S');
  set(4, 3, 'S'); set(4, 10, 'S');
  const neck = { 4: 'W', 5: 'S', 6: 's', 7: 'S', 8: 'W' };
  for (const c in neck) set(8, +c, neck[c]);
  set(8, 3, 'o'); set(8, 9, 'o');
  const v = { 4: 'W', 5: 's', 6: 'S', 7: 's', 8: 'W' };
  for (const c in v) set(9, +c, v[c]);
  for (const r of [ 10, 11, 12 ]) set(r, 6, r === 11 ? 'W' : 'T');
  set(12, 0, '.'); set(12, 1, 'o'); set(13, 0, '.'); set(13, 1, 'o'); set(12, 11, 'J'); set(12, 12, 'o'); set(13, 11, 'o'); set(13, 12, '.');
  POLO = { G: G, PT: PT, PL: PL, ax: f[0] + PL, ay: f[1] + PT };
  return POLO;
 }
 function poloName(blink) {
  const P = poloFrame(), G = P.G.map(r => r.slice());
  // both eyes: the two 'o' between skin on the eye row (cols 4 and 8)
  if (blink) { G[6 + P.PT][4 + P.PL] = 'S'; G[6 + P.PT][8 + P.PL] = 'S'; }
  const rows = G.map(r => r.join('')), key = 'an579polo' + (blink ? 'b' : '');
  if (!RL12.FR[key]) RL12.FR[key] = [ P.ax, P.ay, null, rows ];
  return key;
 }

 /* ---- SIGNING DAY ---- */
 function playSign(colId) {
  const COL = T(colId); if (!COL) return;
  const c1 = hex(COL.c1), c2 = hex(COL.c2), NAME = String(COL.name || colId).toUpperCase();
  let hs = null; try { const C = CA.get(); hs = C && C.hs && C.hs.team ? CA.tobj(C.hs.team) : null; } catch (e) {}
  const hs1 = hex(hs && hs.c1 || '#e6e6e6'), hs2 = hex(hs && hs.c2 || '#2a2f45');
  const SKIN = skinMe(), HAIR = hairMe(), K = 6, KP = 8;
  scene('sign', (cx, t) => {
   R(cx, 0, 0, 844, 300, mix('#0b0f14', c1, .32));
   for (let x = 0; x < 844; x += 60) R(cx, x, 0, 2, 300, 'rgba(0,0,0,.2)');
   for (let i = 0, x = 0; x < 844; i++, x += 44) { const c = i % 2 ? c2 : c1; for (let r = 0; r < 18; r++) R(cx, x + 4 + r, 36 + r, 36 - r * 2, 1, c); R(cx, x, 34, 44, 3, '#05080b'); }
   badge(COL, 70, 70, 6); text(NAME.length > 16 ? NAME.slice(0, 16) : NAME, 109, 172, 2, '#ffffff', 'center', '#000');
   floorWood(cx, 300);
   const clap = t > 3.3 ? 'coach_cheer' : (Math.floor(t * 2) % 2 ? 'coach_idle1' : 'coach_idle0');
   spr(cx, clap, 725, 335, { jersey: c1, trim: c2, helm: c1 }, false, K, 2);
   const signed = t >= 3.3;
   const kit = { jersey: signed ? c1 : hs1, trim: signed ? c2 : hs2, helm: HAIR };
   const bob = signed && t < 4.4 ? Math.floor(t * 2) % 2 : 0;
   const blink = (t > .55 && t < .72) || (t > 5.0 && t < 5.17);
   const c = RL12.bake(poloName(blink), kit, false, SKIN), PX = 440, X0 = PX - 11 * KP, Y0 = 96 + (bob ? KP : 0), crop = 17;
   cx.drawImage(c, 0, 0, c.width, crop, X0, Y0, c.width * KP, crop * KP);
   const DT = 96 + 17 * KP;
   R(cx, 250, DT, 380, 26, '#9a6a3a'); R(cx, 250, DT, 380, 4, '#c99a68'); R(cx, 250, DT + 22, 380, 4, '#5c3c1c');
   R(cx, 256, DT + 26, 368, 300 - DT + 14, c1); R(cx, 256, DT + 26, 368, 5, c2); R(cx, 256, 330, 368, 7, c2);
   text(String(COL.abbr || NAME.slice(0, 4)).toUpperCase(), 440, DT + 52, 3, '#fff', 'center', '#000');
   const PXL = 384, PY = DT + 4;
   R(cx, PXL, PY, 112, 20, '#f2f2f2'); R(cx, PXL, PY + 18, 112, 2, '#b9b9b9'); R(cx, PXL + 8, PY + 14, 40, 2, '#c8c8c8');
   const N = 24, prog = clamp((t - .9) / 2.3, 0, 1), cnt = Math.floor(prog * N);
   const wy = i => Math.round(3 * Math.sin(i * .95) + (i % 9 === 0 ? 3 : 0));
   for (let i = 0; i < cnt; i++) R(cx, PXL + 14 + i * 4, PY + 7 + q(wy(i), 3), 4, 4, '#1a2a6a');
   const tipX = PXL + 14 + cnt * 4, tipY = PY + 7 + q(wy(cnt), 3);
   const pal = RL12.palette(kit, SKIN), OUT = '#0d0d0d';
   // pen hand: writes, lifts on SIGNED (3.3-4.2), then comes back down and rests on the desk
   const lift = t >= 3.3 && t < 4.2 ? 3 * KP : t >= 4.2 && t < 4.5 ? q(3 * KP * (1 - (t - 4.2) / .3), KP) : 0;
   const restX = PXL + 14 + N * 4 + 8, hx = q((signed ? restX : tipX + 8), KP / 2), hy = q((signed ? PY + 7 : tipY) - 14, KP / 2) - lift;
   const shx = X0 + 14 * KP, shy = Y0 + 15 * KP, lhx = X0 + 7 * KP, lhy = PY + 4;
   const arm = (x0, y0, x1, y1) => { const stp = 6; for (let i = 0; i <= stp; i++) { const x = q(x0 + (x1 - x0) * i / stp, KP), y = q(y0 + (y1 - y0) * i / stp, KP); R(cx, x - 2, y - 2, KP + 4, KP + 4, OUT); } for (let i = 0; i <= stp; i++) { const x = q(x0 + (x1 - x0) * i / stp, KP), y = q(y0 + (y1 - y0) * i / stp, KP); R(cx, x, y, KP, KP, pal.S); } };
   arm(shx, shy, hx, hy);
   arm(X0 + 4 * KP, Y0 + 15 * KP, lhx + 2 * KP, lhy);
   R(cx, hx - 2, hy - 2, 2 * KP + 4, 2 * KP + 4, OUT); R(cx, hx, hy, 2 * KP, 2 * KP, pal.S); R(cx, hx, hy + KP, 2 * KP, KP, pal.s);
   if (!signed || t >= 4.5) { R(cx, hx - KP, hy + KP, KP, KP, '#05080b'); R(cx, hx - 2 * KP, hy + 2 * KP, KP, KP, '#1a2a6a'); }
   R(cx, lhx - 2, lhy - 2, 2 * KP + 4, 2 * KP + 4, OUT); R(cx, lhx, lhy, 2 * KP, 2 * KP, pal.S);
   const ft = t - 3.3;
   if (ft >= 0 && ft < .25) { cx.globalAlpha = (1 - ft / .25) * .55; R(cx, 0, 0, 844, 390, '#ffffff'); cx.globalAlpha = 1; }
   confetti(cx, t, 3.35, [ c1, c2, '#ffffff', '#ffcc33' ]);
   banner(cx, 'SIGNING DAY', 4, 3, '#ffcc33', '#101827');
   if (t >= 3.4) { const sh = t < 3.9 ? (Math.floor(t * 24) % 2 ? 4 : -4) : 0; banner(cx, 'SIGNED!', 46, 5, '#ffffff', c1, sh); }
   if (t >= 4.3) { const u = clamp((t - 4.3) / .3, 0, 1), y = 335 + (1 - ease(u)) * 55, s = 'WELCOME TO ' + NAME; banner(cx, s, Math.round(y) + 8, textW(s, 2) > 760 ? 1 : 2, '#ffffff', '#101827'); }
   return t < 7.2;
  });
 }

 /* ---- DRAFT NIGHT ---- */
 function playDraft(D, colId) {
  const PRO = T(D.team); if (!PRO || !D.no) return;
  const p1 = hex(PRO.c1), p2 = hex(PRO.c2), NAME = String(PRO.name || D.team).toUpperCase(), N = D.no | 0;
  const COLT = colId ? T(colId) : null;
  const kitCol = COLT ? { jersey: hex(COLT.c1), trim: hex(COLT.c2), helm: hex(COLT.c1) } : { jersey: '#e6e6e6', trim: '#2a2f45', helm: '#e6e6e6' };
  let kitPro = { jersey: p1, trim: p2, helm: p1 };
  try { if (W0.UNI21 && UNI21.on() && UNI21.heroKit) kitPro = UNI21.heroKit(0, D.team) || kitPro; } catch (e) {}
  const SKIN = skinMe(), K = 6, pos = (() => { try { return PP(ME).pos; } catch (e) { return 'M'; } })();
  const kitSuit = { jersey: '#1b1b2a', trim: '#ffcc33', helm: '#1b1b2a' };
  const T_CNT = 1.6;
  scene('draft', (cx, t) => {
   R(cx, 0, 0, 844, 390, '#070b12');
   for (let i = 0; i < 4; i++) { const bx = 120 + i * 200 + q(Math.sin(t * 1.2 + i * 1.7) * 30, 4); cx.fillStyle = 'rgba(255,248,216,.045)'; for (let r = 0; r < 24; r++) cx.fillRect(bx - 6 - r * 2, 20 + r * 11, 12 + r * 4, 11); R(cx, bx - 10, 8, 20, 8, '#fff8d8'); }
   R(cx, 214, 16, 416, 92, '#05080b'); R(cx, 220, 22, 404, 80, '#0d1830'); R(cx, 220, 22, 404, 4, '#2cc4dc');
   const shown = Math.max(1, Math.min(N, 1 + Math.floor(clamp((t - .35) / T_CNT, 0, 1) * N)));
   let sub = 'ROUND ' + (D.rd || 1);
   if (t >= .35) sub = 'ON THE CLOCK: PICK ' + shown;
   if (t >= 3.4) sub = 'PICK ' + N + ': ' + (PRO.abbr || NAME).toUpperCase() + ' SELECTS';
   text('DRAFT NIGHT', 422, 32, 4, '#ffcc33', 'center', '#000');
   text(sub, 422, 74, 2, '#8fe3f0', 'center', '#000');
   R(cx, 0, 300, 844, 90, '#1a0d10'); for (let x = 0; x < 844; x += 24) R(cx, x, 300, 12, 90, '#22101a'); R(cx, 0, 300, 844, 4, '#7a1f2c');
   R(cx, 150, 296, 600, 8, '#c8a14a'); R(cx, 150, 296, 600, 2, '#fff2a0');
   const cm = t > 3.3 ? 'coach_cheer' : (t > 2.2 ? 'coach_point' : (Math.floor(t * 2) % 2 ? 'coach_idle1' : 'coach_idle0'));
   spr(cx, cm, 740, 300, kitSuit, false, K, 0);
   R(cx, 600, 236, 100, 64, '#2b1b3a'); R(cx, 600, 236, 100, 5, '#ffcc33'); R(cx, 600, 292, 100, 8, '#ffcc33');
   badge(PRO, 637, 248, 2);
   const FEET = 338;
   if (t < 3.4) {
    let px, fr;
    if (t < .5) { px = -60; fr = 'run0'; } else if (t < 2.2) { px = -60 + 460 * ((t - .5) / 1.7); fr = RL12.ANIM.run[Math.floor(t * 9) % RL12.ANIM.run.length]; } else { px = 400; fr = 'idle'; }
    sprMe(cx, fr, px, FEET, kitCol, true, K, SKIN);
   } else {
    // pro kit: the full lobby hero chain (gear, uniform art, special kits), 1 px hop while he celebrates
    const hop = t < 4.6 && Math.floor(t * 4) % 2 ? K : 0, hp0 = W0.__v17hp;
    W0.__v17hp = heroPid();
    const sc0 = screen;
    try { lobbyPad(400, FEET + 1, p1, t); if (heroPid() !== ME) screen = 'card28'; /* the game reads a career card's items on the card screen */ lobbyHero(400, FEET - hop, pos, kitPro, SKIN, false, K, 0, 1, 0, false, false); } catch (e) { A.fail('drafthero', e); sprMe(cx, 'bench_cheer0', 400, FEET, kitPro, true, K, SKIN); } finally { W0.__v17hp = hp0; screen = sc0; }
   }
   const ft = t - 3.4;
   if (ft >= 0 && ft < .25) { cx.globalAlpha = (1 - ft / .25) * .55; R(cx, 0, 0, 844, 390, p1); cx.globalAlpha = 1; }
   confetti(cx, t, 3.45, [ p1, p2, '#ffffff', '#ffcc33' ]);
   if (t >= 2.3 && t < 3.4) { const s = 'WITH PICK ' + N + ', ' + NAME + ' SELECTS...'; const nn = Math.min(s.length, Math.floor((t - 2.3) / .028)); banner(cx, s.slice(0, nn), 112, textW(s, 2) > 760 ? 1 : 2, '#ffffff', '#101827'); }
   if (t >= 3.5) { const sh = t < 3.9 ? (Math.floor(t * 24) % 2 ? 4 : -4) : 0; banner(cx, 'DRAFTED #' + N + ' OVERALL', 112, 4, '#ffffff', p1, sh); }
   if (t >= 4.1) { const s = NAME + (D.rd ? ' - ROUND ' + D.rd + ', PICK ' + (D.inRd || N) : ''); banner(cx, s, 166, textW(s, 2) > 760 ? 1 : 2, '#ffcc33', '#101827'); }
   return t < 7.4;
  });
 }

 function wrap(name, after) {
  const f0 = CA[name];
  if (typeof f0 !== 'function' || f0.__an579) return;
  const f1 = function () {
   const r = f0.apply(this, arguments);
   try { if (!noCar()) after(r, arguments); } catch (e) { A.fail('car ' + name, e); }
   return r;
  };
  f1.__an579 = true;
  CA[name] = f1;
 }
 wrap('sign', (r, a) => { if (r === true) playSign(a[0]); });
 wrap('runDraft', r => { if (r && r.no) { let col = null; try { col = CA.get().col.team; } catch (e) {} playDraft(r, col); } });
 A.playSign = playSign; A.playDraft = playDraft;
})();
