/* v504gs.js - The Good Stick Co. LOOK for the 1.3 collab (Bagga Lax 1.3).
   v501gsc.js (Cursor) owns the team, roster, COLLAB quick-play tab, lock-until-owned, the pack id pack_goodstick,
   its LIVEOPS gating, prices, buying, follow, promo and card rewards. This file only changes how it LOOKS:
   - kit: gray home / white away, black yoke, long sleeves with stripes, round logo on the chest (in-match sprites,
     lobby / gear front view, uniform tiles). Same kit ids (g27 gscH / gscA) and the same UNI21X hooks.
   - the team badge is the round Good Stick logo (quick play COLLAB tab, center field, team lists).
   - item art: GOOD STICK SHORTIE, GOALIE STICK, GOOD STICK TAPE (black + white stripes on the stick), the team unlock
     and the GOOD STICK CO. player cards; COLLAB platinum frames with glow + shine on their cards.
   - GOOD STICK CO. players carry the Good Stick sticks in their games (only empty stick slots), white shimmer on the stick
     in the big front view.
   - the GOOD STICK PACK card in the YARD SALE COLLAB tab: pack art, item minis, ABOUT panel with the logo.
     Same buttons/actions as v501 (gsc501buy / gsc501inside / gsc501follow), same price, same gating.
   - their billboard joins the stadium boards only in games the GOOD STICK CO. plays.
   No new ids, rl_* keys, __rl_* flags (other than this kill switch) or net changes.
   Kill switch: window.__rl_no504gs = true (also off when __rl_no501gsc is set). */
(function () {
 'use strict';
 const win = window;
 const off = () => !!(win.__rl_no504gs || win.__rl_no501gsc || win.__rl_v124gb);
 if (off() || win.GS504 || !win.GSC501 || !win.V17 || !V17.BY || typeof GH_REG === 'undefined' || !GH_REG.GSC) return;
 const X = win.GSC501;
 const ID = 'GSC';
 const V = win.GS504 = { log: [], err: [] };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e)); };
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
 const ST = () => { try { return V17.ST(); } catch (e) { return null; } };
 const IDS = { pro: 'stick_gsc_shortie', gk: 'stick_gsc_goalie', tape: 'tape_gsc', team: 'gsc_team' };
 const LOGO_PNG = 'gs486logo96.png', PACK_PNG = 'gs486pack.png', BOARD_PNG = 'ads/gs486-board.png';
 const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [ c, x ]; };
 const grid = (x, rows, pal) => rows.forEach((row, y) => [ ...row ].forEach((ch, q) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(q, y, 1, 1); } }));

 // ---------- COLLAB card look ----------
 const css = '.c17.rx486{position:relative;overflow:hidden;border-color:#cfd6dc!important;background:linear-gradient(160deg,#ffffff 0%,#e4e8ec 26%,#b8c0c8 50%,#eef1f4 70%,#c2c9d0 100%)!important;box-shadow:inset 0 0 0 1px #f6f8fa,inset 0 0 0 3px #111214,0 0 0 1px #000,0 0 9px 1px rgba(235,242,255,.75)!important;animation:rx486glow 1.8s ease-in-out infinite}' +
  '.c17.rx486::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 41%,rgba(255,255,255,.85) 47%,rgba(214,232,255,.45) 51%,transparent 57%);animation:rx486shine 2.4s steps(12) infinite;pointer-events:none}' +
  '.c17.rx486 .art{background:radial-gradient(circle at 50% 40%,#ffffff,#cdd3d9 55%,#76808a)!important;border-color:#111214!important}' +
  '.c17.rx486 .nm{color:#11161b!important}.c17.rx486 .rr{color:#000!important;font-weight:bold}' +
  '.c17.rx486 .by486{font-size:6px;color:#3a434c;margin-top:1px;text-align:center}.c17.rx486i .by486{font-size:6px;color:#cfd6dc;margin-top:1px;text-align:center}' +
  '@keyframes rx486shine{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}' +
  '@keyframes rx486glow{0%,100%{box-shadow:inset 0 0 0 1px #f6f8fa,inset 0 0 0 3px #111214,0 0 0 1px #000,0 0 6px 0 rgba(235,242,255,.55)}50%{box-shadow:inset 0 0 0 1px #f6f8fa,inset 0 0 0 3px #111214,0 0 0 1px #000,0 0 12px 2px rgba(235,242,255,.95)}}' +
  '#panel .c17.rx486i{border-color:#dfe5ea;background:linear-gradient(#4a535c,#14191e);animation:rx486gi 1.4s ease-in-out infinite}' +
  '#panel .c17.rx486i .rr{color:#eef2f6;font-weight:bold;text-shadow:0 0 3px rgba(235,242,255,.8)}' +
  '#panel .c17.rx486i::after{background:conic-gradient(transparent,rgba(235,242,255,.4),transparent 30%,rgba(255,255,255,.3),transparent 60%)}' +
  '#panel .c17.rx486i.lk{border-color:#3a434b;background:#0d1217;animation:none}#panel .c17.rx486i.lk::after{display:none}' +
  '#panel .fl17.on:has(.rx486i){filter:drop-shadow(0 0 10px #e8eef5)}' +
  '@keyframes rx486gi{0%,100%{box-shadow:0 0 4px rgba(225,233,240,.45)}50%{box-shadow:0 0 12px rgba(240,246,255,.95)}}' +
  '@media (prefers-reduced-motion:reduce){.c17.rx486,.c17.rx486::after,.c17.rx486i,.c17.rx486i::after{animation:none}}' +
  '.fol486{display:flex;align-items:center;justify-content:center;gap:8px;margin:4px auto;padding:4px 8px;border:2px solid #dfe5ea;border-radius:4px;background:rgba(10,16,24,.85);max-width:560px;color:#fff;font-size:9px;letter-spacing:1px}' +
  '.fol486 s{color:#ff9a8a}.fol486 b{color:#ffe14d;font-size:11px}.rule486{font-size:7px;color:#e6ecf2;letter-spacing:1px;margin-top:2px}.unl486{margin:6px auto;max-width:560px;padding:6px;border:2px solid #dfe5ea;border-radius:4px;background:rgba(10,16,24,.9);color:#fff;font-size:10px;letter-spacing:1px;text-align:center}' +
  '.tabs486{display:flex;gap:4px;margin:0 0 4px}#panel .tabs486 button.on486{background:linear-gradient(160deg,#fff,#c2c9d0)!important;color:#000!important;border:2px solid #111214!important;box-shadow:0 0 8px rgba(235,242,255,.8)!important}#panel .sh17.c486{color:#eef2f6}' +
  '.ab486{display:flex;gap:8px;align-items:center;border:3px solid #cfd6dc;box-shadow:inset 0 0 0 1px #f6f8fa,inset 0 0 0 3px #111214,0 0 0 1px #000,0 0 10px rgba(235,242,255,.6);background:linear-gradient(160deg,#ffffff 0%,#e4e8ec 26%,#b8c0c8 50%,#eef1f4 70%,#c2c9d0 100%);padding:6px 10px;border-radius:5px;color:#11161b;margin:6px auto;max-width:560px;text-align:left}' +
  '.ab486 img{width:64px;height:64px;image-rendering:pixelated;flex:none}.ab486 b{display:block;font-size:10px;letter-spacing:1px}.ab486 i{display:block;font-style:normal;font-size:6px;letter-spacing:1px;margin:1px 0 3px}.ab486 div div{font-size:7px;line-height:1.35}' +
  '.hw16.rx486t{border:3px solid #cfd6dc!important;background:linear-gradient(90deg,rgba(230,236,242,.55),rgba(10,16,24,.92) 45%,rgba(230,236,242,.35))!important;box-shadow:inset 0 0 0 1px #f6f8fa,inset 0 0 0 3px #111214,0 0 10px rgba(235,242,255,.6)!important}' +
  '.hw16.rx486t .hwp16{image-rendering:pixelated;filter:drop-shadow(0 0 6px #ffffff)}.hw16.rx486t .hwi16{border-color:#111214!important;background:#dfe4e9}';
 try { const st = document.createElement('style'); st.id = 'v504css'; st.textContent = css; document.head.appendChild(st); } catch (e) { fail('css', e); }

 // ---------- the kit ----------
 const GSV = {
  grey: { body: '#a3a7ac', bodyS: '#767a80', yoke: '#18181b', yokeS: '#0b0b0d', cuff: '#f4f4f4', cuffS: '#cfd3d6', logo: '#141416', logoR: '#5a5d62', sleeve: '#7f8389', str1: '#ffffff', str2: '#7f8389' },
  white: { body: '#f2f3f4', bodyS: '#c3c8cc', yoke: '#2a2b30', yokeS: '#18181b', cuff: '#2a2b30', cuffS: '#18181b', logo: '#101012', logoR: '#8a8d92', sleeve: '#cdd1d5', str1: '#18181b', str2: '#cdd1d5' }
 };

 const pmCache = new WeakMap;   // per rows array: gear bakes hand over edited copies of a frame under the same name
 function plan(rows, name) {
  const hit = pmCache.get(rows);
  if (hit && hit.name === name) return hit;
  const h = rows.length, w = rows[0].length, at = (q, r) => r >= 0 && r < h && q >= 0 && q < w ? rows[r][q] : '.';
  const isJ = ch => ch === 'J' || ch === 'j';
  let um = null;
  try { um = RL12.uniMask(rows, name); } catch (e) {}
  const shorts = um && um.shorts ? um.shorts : new Set;
  const P = new Map;
  let top = -1;
  for (let r = 0; r < h && top < 0; r++) for (let q = 0; q < w; q++) if (isJ(at(q, r)) && !shorts.has(q + ',' + r)) { top = r; break; }
  const cs = [];
  if (top >= 0) for (let q = 0; q < w; q++) if (isJ(at(q, top)) && !shorts.has(q + ',' + top)) cs.push(q);
  const lo = cs.length ? cs[0] : -1, hi = cs.length ? cs[cs.length - 1] : -1;
  let cx = cs.length ? Math.round((lo + hi) / 2) : -1;
  if (cs.length && hi - lo + 1 !== cs.length && top >= 0) {
   const c2 = [];
   for (let q = 0; q < w; q++) if (isJ(at(q, top + 1)) && !shorts.has(q + ',' + (top + 1))) c2.push(q);
   if (c2.length) cx = Math.round((c2[0] + c2[c2.length - 1]) / 2);
  }
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   const ch = at(q, r);
   if (!isJ(ch)) continue;
   const k = q + ',' + r;
   if (shorts.has(k)) { P.set(k, 'S'); continue; }
   if (r === top) P.set(k, 'Y'); else P.set(k, 'B');
  }
  // LONG SLEEVES: the arms are jersey-coloured all the way down to the glove, with the white sleeve stripes.
  const isG = ch => ch === 'G' || ch === 'g';
  const front = /^(bench|lobby|d8)/.test(name || '');   // the front / back views (lobby, bench, the in-match 8-way sprites)
  const A = new Map, sleeves = [];
  let belt = -1;
  for (let r = 0; r < h && belt < 0; r++) { let j = 0, J = 0; for (let q = 0; q < w; q++) { const ch = at(q, r); if (ch === 'j') j++; else if (ch === 'J') J++; } if (j >= 5 && J <= 1) belt = r; }
  // bare skin next to a glove between the shoulders and the belt is a forearm (the in-match running frames draw one): it gets sleeve
  const skinArm = new Set;
  if (top >= 0) for (let r = top; r <= (belt >= 0 ? belt : h - 1); r++) for (let q = 0; q < w; q++) {
   const ch = at(q, r);
   if (ch !== 'S' && ch !== 's' && ch !== 'Z') continue;
   let nearG = false;
   for (let dr = -1; dr <= 1; dr++) for (let dq = -1; dq <= 1; dq++) if (isG(at(q + dq, r + dr))) nearG = true;
   if (nearG) skinArm.add(q + ',' + r);
  }
  if (front) {
   // front / back views: the outermost jersey pixel on each side, from under the yoke down to the belt, is the arm
   const end = belt > top ? belt : h;
   if (top >= 0) for (const side of [ -1, 1 ]) {
    let qa = -1, r0 = -1, r1 = -1;
    for (let r = top + 1; r < end; r++) {
     let q = -1;
     if (side < 0) { for (let x = 0; x < w; x++) if (P.get(x + ',' + r) === 'B') { q = x; break; } }
     else for (let x = w - 1; x >= 0; x--) if (P.get(x + ',' + r) === 'B') { q = x; break; }
     if (q < 0) continue;
     const out = at(q + side, r);
     if (out !== 'o' && !isG(out) && out !== 'S' && out !== 's' && out !== 'Z') { if (r0 >= 0) break; continue; }
     if (r0 < 0) { r0 = r; qa = q; }
     A.set(q + ',' + r, r - r0); P.set(q + ',' + r, 'A');
     if (q === qa) r1 = r;
    }
    if (qa >= 0 && r0 >= 0) sleeves.push({ q: qa, r0: r0, r1: r1, side: side });
   }
  } else {
   // side views: the run of jersey pixels leading from each glove back toward the shoulder is the arm
   for (let r = 0; r < h; r++) {
    if (r === belt || r === top) continue;
    for (let q = 0; q < w; q++) {
     if (!isG(at(q, r))) continue;
     for (const dir of [ -1, 1 ]) {
      let x = q + dir, skip = 0, idx = 0;
      while (x >= 0 && x < w) {
       const ch = at(x, r), k = x + ',' + r;
       if (isG(ch) && idx === 0) { x += dir; continue; }
       if ((ch === 'X' || ch === 'x') && idx === 0 && skip < 2) { skip++; x += dir; continue; }
       if (ch === 'j' && P.get(k) === 'B' && idx < 5) { if (!A.has(k) || A.get(k) > idx) A.set(k, idx); idx++; x += dir; continue; }
       break;
      }
     }
    }
   }
   for (const [k, i] of A) P.set(k, 'A');
  }
  const back = /d8N|_N_|back/i.test(name || '');
  if (!back && cx >= 0 && top >= 0) {
   // chest width one row under the yoke: big fronts (lobby / bench) get the round 5x4 logo with its white stick, small sprites a 3x3 mark
   let w2 = 0;
   for (let q = 0; q < w; q++) if (P.get(q + ',' + (top + 1)) === 'B') w2++;
   const isB = (q, r) => P.get(q + ',' + r) === 'B';
   const HUGE = [ '.LLL.', 'LLLWL', 'LWLLL', '.LLL.' ];
   if (/^(bench|lobby)/.test(name || '') && w2 >= 9 && HUGE.every((row, dr) => [ ...row ].every((c, dq) => c === '.' || isB(cx - 2 + dq, top + 1 + dr)))) {
    // the big front view: the chest stays gray here; the logo is drawn over it at the screen's finer pixel size
    const out = { P: P, A: A, sleeves: sleeves, skinArm: skinArm, name: name, logo: { cx: cx + .5, cy: top + 3, d: 4.4, w: w } };
    try { pmCache.set(rows, out); } catch (e) {}
    return out;
   }
   const BIG = [ 'RLR', 'LWL', 'RLR' ];
   const bigOk = w2 >= 7 && BIG.every((row, dr) => [ ...row ].every((c, dq) => c === '.' || isB(cx - 1 + dq, top + 2 + dr)));
   if (bigOk) {
    BIG.forEach((row, dr) => [ ...row ].forEach((c, dq) => { const k = cx - 1 + dq + ',' + (top + 2 + dr); if (c === 'L') P.set(k, 'L'); else if (c === 'W') P.set(k, 'M'); else if (c === 'R') P.set(k, 'R'); }));
   } else {
    const ly = top + 2, pts = [ [ 0, -1 ], [ -1, 0 ], [ 1, 0 ], [ 0, 1 ], [ 0, 0 ] ], cor = [ [ -1, -1 ], [ 1, -1 ], [ -1, 1 ], [ 1, 1 ] ];
    if (pts.every(([dq, dr]) => isB(cx + dq, ly + dr))) {
     for (const [dq, dr] of pts) P.set(cx + dq + ',' + (ly + dr), 'L');
     for (const [dq, dr] of cor) if (isB(cx + dq, ly + dr)) P.set(cx + dq + ',' + (ly + dr), 'R');
    } else if (isB(cx, top + 1)) P.set(cx + ',' + (top + 1), 'L');
   }
  }
  const out = { P: P, A: A, sleeves: sleeves, skinArm: skinArm, name: name };
  try { pmCache.set(rows, out); } catch (e) {}
  return out;
 }
 function paint(kit, ch, q, r, rows, name) {
  const V = kit.g27 === 'gscA' ? GSV.white : GSV.grey;
  if (ch === 'H' || ch === 'h') return ch === 'H' ? '#ecedef' : '#b9bdc2';
  if (ch === 'T' || ch === 't') return ch === 'T' ? '#18181b' : '#0b0b0d';
  if (ch === 'G' || ch === 'g') return ch === 'G' ? '#26262a' : '#111113';
  if (ch === 'S' || ch === 's' || ch === 'Z') { const sa = plan(rows, name).skinArm; return sa && sa.has(q + ',' + r) ? V.sleeve : null; }
  if (ch !== 'J' && ch !== 'j') return null;
  const s = ch === 'j', pl = plan(rows, name), t = pl.P.get(q + ',' + r);
  switch (t) {
   case 'A': {   // the sleeve: jersey colour to the glove, stripes near the elbow (side views)
    const i = pl.A.get(q + ',' + r) | 0, front = pl.sleeves && pl.sleeves.length;
    if (front && /^(bench|lobby)/.test(name || '')) return s ? V.bodyS : V.body;   // the big front view draws its stripes finer
    if (front) return i === 0 ? V.str1 : V.sleeve;   // in-match front / back: stripe at the upper arm, sleeve down to the glove
    if (i === 2) return V.str1;
    if (i === 3) return V.str2;
    return V.sleeve;
   }
   case 'S': return kit.g27 === 'gscA' ? (s ? '#c3c8cc' : '#f2f3f4') : (s ? '#0b0b0d' : '#18181b');
   case 'Y': return s ? V.yokeS : V.yoke;
   case 'W': return s ? V.cuffS : V.cuff;
   case 'L': return V.logo;
   case 'R': return V.logoR;
   case 'M': return '#f4f4f4';
   default: return s ? V.bodyS : V.body;
  }
 }

 const KIT = {
  home: { jersey: '#a3a7ac', trim: '#18181b', helm: '#ecedef', shorts: '#18181b', acc: '#18181b', g27: 'gscH' },
  away: { jersey: '#f2f3f4', trim: '#18181b', helm: '#ecedef', shorts: '#f2f3f4', acc: '#18181b', g27: 'gscA' }
 };
 const kitFor = k => Object.assign({}, (k | 0) === 1 ? KIT.away : KIT.home);
 const isGsKit = k => !!k && (k.g27 === 'gscH' || k.g27 === 'gscA');
 V.kitFor = kitFor;
 try {
  if (typeof RL12 !== 'undefined') {
   const prev = RL12.g27;
   RL12.g27 = function (kit, ch, q, r, rows, name) {
    if (!off() && kit && (kit.g27 === 'gscH' || kit.g27 === 'gscA') && rows && rows.length) {
     try { return paint(kit, ch, q, r, rows, name); } catch (e) { if (!V.pErr) { V.pErr = 1; fail('paint', e); } }
    }
    return typeof prev === 'function' ? prev.apply(this, arguments) : null;
   };
  }
 } catch (e) { fail('painter', e); }
 try {
  const UX = win.UNI21X;
  if (UX && typeof UX.kitOf === 'function') {
   const K0 = UX.kitOf;
   UX.kitOf = function (tid, k) { if (!off() && tid === ID) return kitFor(k); return K0.apply(this, arguments); };
  }
 } catch (e) { fail('kitOf', e); }

 // ---------- the round logo (badge + chest) ----------
 const logoC = new Map;
 function logoRaster(n) {
  n = Math.max(8, Math.min(64, n | 0));
  if (logoC.has(n)) return logoC.get(n);
  const [c, x] = mk(n, n), r0 = n / 2, px = (q, r) => x.fillRect(q, r, 1, 1);
  x.fillStyle = '#121214';
  for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) if (Math.hypot(q + .5 - r0, r + .5 - r0) <= r0) px(q, r);
  x.fillStyle = '#f4f4f4';
  const S = v => Math.round(v * n);
  // the stick: head outline (top) + shaft
  const hx0 = S(.2), hx1 = S(.36), hy0 = S(.14), hy1 = S(.42), sx = S(.28);
  for (let r = hy0; r <= hy1; r++) {
   const t = (r - hy0) / Math.max(1, hy1 - hy0), half = Math.max(1, Math.round((hx1 - hx0) / 2 * (1 - .55 * t)));
   px(sx - half, r); px(sx + half, r);
   if (r === hy0) for (let q = sx - half; q <= sx + half; q++) px(q, r);
  }
  for (let r = hy1; r <= S(.86); r++) px(sx, r);
  // the words: four short lines of letter strokes
  const lines = [ [ .44, .24, 3 ], [ .44, .42, 4 ], [ .44, .6, 5 ], [ .5, .77, 3 ] ];
  for (const [lx, ly, nch] of lines) {
   const y = S(ly), cw = Math.max(3, Math.round(n * .12));
   for (let i = 0; i < nch; i++) {
    const q0 = S(lx) + i * cw;
    if (q0 + cw - 1 >= Math.round(r0 + Math.sqrt(Math.max(0, r0 * r0 - (y - r0) * (y - r0)))) - 1) break;
    for (let q = q0; q < q0 + cw - 1; q++) px(q, y);
    if (n >= 16) { px(q0 + (i % 2) * (cw - 2), y - 1); if ((i + nch) % 3 === 0) px(q0, y + 1); }
   }
  }
  logoC.set(n, c);
  return c;
 }

 V.logoRaster = logoRaster;

 const MARK16 = ['.....aaaaaa.....', '...aaabbbbaaa...', '..aabbaaaabbaa..', '.aabbaaaaaabbaa.', '.abbbbaaaabbbba.', 'aabbbbaaaabbbbaa', 'abbbbbbaabbbbbba', 'abbbbbbaabbbbbba', 'abbbbbbaabbbbbba', 'abbbbbbaabbbbbba', 'aabbbbbaabbbbbaa', '.abbbbbaabbbbba.', '.aabbbbaabbbbaa.', '..aabbbaabbbaa..', '...aaabbbbaaa...', '.....aaaaaa.....'];
 const MPAL = { a: '#f4f4f4', b: '#141416' };

 // the company's round logo (96x96 png); badges at 2x+ draw it scaled down smoothly, smaller ones use the 16x16 mark
 const logoImg = new Image();
 const logoAt = new Map;
 logoImg.onload = () => { logoAt.clear(); try { if (typeof badgeUrls === 'object' && badgeUrls) delete badgeUrls[ID]; } catch (e) {} };
 logoImg.src = LOGO_PNG;
 function logoCanvas(n) {
  n = Math.max(8, Math.min(96, n | 0));
  if (logoAt.has(n)) return logoAt.get(n);
  let c = null;
  if (logoImg.complete && logoImg.naturalWidth > 0) {
   const m = mk(n, n); c = m[0];
   m[1].imageSmoothingEnabled = true; try { m[1].imageSmoothingQuality = 'high'; } catch (e) {}
   m[1].drawImage(logoImg, 0, 0, n, n);
   logoAt.set(n, c);
  } else if (n <= 20) {
   const m = mk(16, 16); grid(m[1], MARK16, MPAL); c = m[0];
  } else c = logoRaster(n);
  return c;
 }
 V.logoCanvas = logoCanvas;
 let markC = null;
 function markCanvas() { if (!markC) { const m = mk(16, 16); grid(m[1], MARK16, MPAL); markC = m[0]; } return markC; }
 try {
  const B0 = win.badge;
  if (typeof B0 === 'function') win.badge = function (team, x, y, sc) {
   if (off() || !team || team.id !== ID) return B0.apply(this, arguments);
   try {
    sc = sc || 1;
    const n = 13 * sc, x0 = Math.round(x), y0 = Math.round(y + sc);
    const r0 = n / 2;
    g.fillStyle = '#e6eaee';
    for (let r = -1; r <= n; r++) for (let q = -1; q <= n; q++) { const d = Math.hypot(q + .5 - r0, r + .5 - r0); if (d <= r0 + 1 && d > r0 - .2) g.fillRect(x0 + q, y0 + r, 1, 1); }
    const s0 = g.imageSmoothingEnabled; g.imageSmoothingEnabled = false;
    if (n < 16) g.drawImage(logoRaster(n), x0, y0);
    else { const f = Math.floor(n / 16), m = 16 * f, o = Math.floor((n - m) / 2); g.drawImage(markCanvas(), x0 + o, y0 + o, m, m); }
    g.imageSmoothingEnabled = s0;
   } catch (e) { if (!V.bErr) { V.bErr = 1; fail('badge', e); } return B0.apply(this, arguments); }
  };
  try { if (typeof badgeUrls === 'object' && badgeUrls) delete badgeUrls[ID]; } catch (e) {}
 } catch (e) { fail('badge', e); }

 // ---------- big front view: chest logo, sleeve stripes, stick shimmer ----------
 function stickOf(pid) {   // the stick on this player in any of the game's gear stores
  try { const e = V17.eqOf(pid); if (e && e.stick) return e.stick; } catch (e) {}
  const S = ST();
  if (!S) return null;
  for (const S2 of [ S.mequip, S.equip, S.wequip ].concat(Object.values(S.tequip || {}))) {
   const e = S2 && (S2[pid] || S2['w:' + pid]);
   if (e && e.stick) return e.stick;
  }
  return null;
 }
 try {
  if (typeof window.lobbyHero === 'function' && typeof lobbyFrame === 'function' && typeof lobbyHeroGeo === 'function') {
   const LH0 = window.lobbyHero;
   window.lobbyHero = function(cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) {
    const r = LH0.apply(this, arguments);
    try {
     if (off() || gray || !isGsKit(kit) || !(k >= 2)) return r;
     const name = lobbyFrame(pos, side), f = RL12.FR[name];
     if (!f) return r;
     const pl = plan(f[3], name), L = pl && pl.logo;
     if (!L) return r;
     const n = Math.round(L.d * k), lc = logoRaster(n);
     const x0 = lobbyHeroGeo(cx, pos, k, flip, side).x0 + Math.round(slide), y0 = Math.round(feetY - f[1] * k);
     const ccx = flip ? L.w - L.cx : L.cx;
     const a0 = g.globalAlpha, s0 = g.imageSmoothingEnabled;
     g.globalAlpha = alpha == null ? 1 : alpha;
     g.imageSmoothingEnabled = false;
     if (lc) g.drawImage(lc, Math.round(x0 + ccx * k - n / 2), Math.round(y0 + L.cy * k - n / 2));
     // the long sleeves, drawn at the finer pixel size like the logo: a seam line between arm and body, and the
     // black / white / black sleeve stripes near the elbow, all the way down to the glove in jersey colour
     try {
      const fp = Math.max(1, Math.round(k / 10)), white = kit.g27 === 'gscA';
      for (const sv of pl.sleeves || []) {
       const qq = flip ? L.w - 1 - sv.q : sv.q, sx = Math.round(x0 + qq * k), sy = Math.round(y0 + sv.r0 * k), sh = (sv.r1 - sv.r0 + 1) * k;
       const leftEdge = (sv.side < 0) !== !!flip;   // this sleeve sits on the left of the body as drawn
       const inner = leftEdge ? sx + k - fp : sx;    // the edge that touches the body
       // the sprite's 1-pixel outline beside the arm becomes sleeve too (a thin outline is redrawn outside it),
       // so the arm reads two pixels wide, jersey-coloured from the shoulder to the glove
       const ox = leftEdge ? sx - k : sx + k, ax = Math.min(sx, ox);
       g.fillStyle = white ? GSV.white.body : GSV.grey.body;
       g.fillRect(ox, sy, k, sh);
       g.fillStyle = '#0d0d0d';
       g.fillRect(leftEdge ? ox : ox + k - fp, sy, fp, sh);
       g.fillStyle = '#18181b';
       g.fillRect(inner, sy, fp, sh);   // the seam: arm and body read as two pieces
       const ys = sy + Math.round(sh * .3);
       g.fillStyle = '#18181b'; g.fillRect(ax, ys, 2 * k, fp); g.fillRect(ax, ys + 3 * fp, 2 * k, fp);
       g.fillStyle = '#ffffff'; g.fillRect(ax + (leftEdge ? fp : 0), ys + fp, 2 * k - fp, 2 * fp);
      }
     } catch (e) {}
     // the Good Stick in his hands: a white shimmer sweeping down the stick (like the shine on the cards), no glow
     try {
      const hp = window.__v17hp, sid = hp && stickOf(hp);
      if (sid === IDS.pro || sid === IDS.gk) {
       const rows = f[3], w = rows[0].length, cells = [];
       rows.forEach((row, r) => [ ...row ].forEach((ch, q) => { if (ch === 'X' || ch === 'M' || ch === 'm' || ch === 'n') cells.push([ q, r ]); }));
       if (cells.length) {
        const r0 = Math.min(...cells.map(c => c[1])), r1 = Math.max(...cells.map(c => c[1])), qs = cells.map(c => flip ? -c[0] : c[0]), q0 = Math.min(...qs), span = r1 - r0 + 1 + (Math.max(...qs) - q0) * .5;
        // one bright pure-white diagonal band, 2-3 sprite pixels wide, sweeping down the head and the shaft every 1.6 s
        const tt = window.__gs504t != null ? window.__gs504t : t, ph = (tt % 1.6) / 1.6, pos = ph * (span + 6) - 3, cut = Math.max(1, f[1] - 12), br = Math.round((Math.sin(t * 2.4) + 1) * .75);
        g.fillStyle = '#ffffff';
        g.globalAlpha = alpha == null ? 1 : alpha;
        for (const [q, r] of cells) {
         const d = Math.abs(r - r0 + ((flip ? -q : q) - q0) * .5 - pos);
         if (d > 1.25) continue;
         g.fillRect(Math.round(x0 + (flip ? w - 1 - q : q) * k), Math.round(y0 + r * k - (r < cut ? br : 0)), k, k);
        }
       }
      }
     } catch (e) {}
     g.globalAlpha = a0; g.imageSmoothingEnabled = s0;
    } catch (e) { if (!V.lhErr) { V.lhErr = 1; fail('logo', e); } }
    return r;
   };
  }
 } catch (e) { fail('lobbyHero', e); }


 // ---------- item art ----------
 const SPAL = { o: '#000000', W: '#ffffff', m: '#c9d0d4', n: '#a9b2b8', X: '#2a2a30', K: '#141418', y: '#ffffff', P: '#dfe5ea' };
 const ART = {
  [IDS.pro]: [ '..........ooooooo...', '.........oWWWWyWWo..', '.........oWmnmnmWo..', '.........oWnmnmnWo..', '..........oWmnmWo...', '..........oWnmnWo...', '...........oWmWo....', '...........oWWWo....', '...........oKKo.....', '..........oXXo......', '.........oXXo.......', '........oXXo........', '.......oXXo.........', '......oXXo..........', '.....oXXo...........', '....oXXo............', '...oXXo.............', '..oXXo..............', '..ooo...............', '....................' ],
  [IDS.gk]: [ '........oooooooooo..', '.......oWWWWWWWWWyo.', '.......oWmnmnmnmnWo.', '.......oWnmnmnmnmWo.', '.......oWmnmnmnmnWo.', '.......oWnmnmnmnmWo.', '........oWmnmnmnWo..', '........oWnmnmnmWo..', '.........oWmnmnWo...', '..........oWWWWo....', '...........oKKo.....', '..........oXXo......', '.........oXXo.......', '........oXXo........', '.......oXXo.........', '......oXXo..........', '.....oXXo...........', '....oXXo............', '...oXXo.............', '...ooo..............' ]
 };
 // GOOD STICK TAPE: the game's tape roll, black with white stripes and a white tail end
ART[IDS.tape] = [ '....................', '....................', '....................', '....................', '....................', '......PPPPPPPP......', '....PPWWWWWWWWPP....', '...PWWKKKKKKKKWWP...', '..PKKKKKPPPKKKKKKP..', '..PKKKKP...PKKKKKP..', '..PKKKKP...PKKKKKP..', '..PKKKKKPPPKKKKKKP..', '...PKKKKKKKKKKKKWKWK', '....PPKKKKKKKKPP..PP', '......PPPPPPPP......', '....................', '....................', '....................', '....................', '....................' ];

 const SIL = '#0b1a20';
 function paintItem(id, c, sil) {
  const x = c.getContext('2d');
  c.width = 20; c.height = 20;
  x.imageSmoothingEnabled = false;
  const it = V17.BY[id];
  if (ART[id]) { grid(x, ART[id], sil ? Object.fromEntries(Object.keys(SPAL).map(k => [ k, SIL ])) : SPAL); return true; }
  if (id === IDS.team) {
   if (sil) { x.fillStyle = SIL; x.beginPath(); x.arc(10, 10, 9, 0, 7); x.fill(); return true; }
   x.fillStyle = '#dfe5ea'; x.beginPath(); x.arc(10, 10, 10, 0, 7); x.fill();
   grid(x, [ '', '' ].concat(MARK16.map(r => '..' + r)), MPAL);
   return true;
  }
  if (it && it.gscCard) {
   const grad = x.createLinearGradient(0, 0, 20, 20);
   grad.addColorStop(0, '#ffffff'); grad.addColorStop(.5, '#b8c0c8'); grad.addColorStop(1, '#eef1f4');
   x.fillStyle = sil ? SIL : grad; x.fillRect(0, 0, 20, 20);
   if (sil) return true;
   try {
    if (typeof RL12 !== 'undefined' && RL12.FR && RL12.FR.idle && RL12.draw) {
     const i = +String(id).split('_').pop() || 0;
     RL12.draw(x, 'idle', 9, 21, kitFor(0), true, { shadow: false, skin: i % 3 });
     return true;
    }
   } catch (e) {}
   grid(x, [ '', '' ].concat(MARK16.map(r => '..' + r)), MPAL);
   return true;
  }
  return false;
 }
 const gsItem = id => { const it = V17.BY && V17.BY[id]; return !!(it && it.gsc501); };
 const urlC = {};
 function urlOf(id, sil) {
  const k = id + (sil ? '#s' : '');
  if (urlC[k]) return urlC[k];
  let c = null;
  try { c = V17.icon(id, sil); } catch (e) {}
  if (c && !c.__gs504) { try { if (paintItem(id, c, sil)) c.__gs504 = 1; } catch (e) { fail('icon ' + id, e); } }
  if (!c || !c.__gs504) { const m = mk(20, 20); if (paintItem(id, m[0], sil)) c = m[0]; else return null; }
  return urlC[k] = c.toDataURL();
 }
 const allIds = () => Object.keys(V17.BY).filter(gsItem);
 V.urls = new Map;
 function paintAll() {
  for (const id of allIds()) for (const sil of [ false, true ]) {
   try { const u = urlOf(id, sil); if (u && !sil) V.urls.set(u, id); } catch (e) { fail('paintAll', e); }
  }
 }
 try { paintAll(); } catch (e) { fail('icons', e); }
 try {
  const iu = V17.iconUrl;
  if (typeof iu === 'function') V17.iconUrl = function (id, sil) {
   if (!off() && gsItem(id)) { const u = urlOf(id, sil); if (u) return u; }
   return iu.apply(this, arguments);
  };
 } catch (e) { fail('iconUrl', e); }

 // GOOD STICK TAPE on the stick: inside the game's gear bake (items17 bakeGear) the tape colour alternates black / white,
 // so the taped shaft reads striped; everywhere else it is plain black.
 try {
  const tp = V17.BY[IDS.tape];
  if (tp) {
   const base = tp.col || '#141418';
   let tn = 0;
   const inBake = () => { try { return /bakeGear/.test(new Error().stack || ''); } catch (e) { return false; } };
   Object.defineProperty(tp, 'col', { configurable: true, enumerable: true, get() { if (off() || !inBake()) return base; tn = (tn + 1) % 2; return tn ? base : '#f4f4f4'; }, set(v) {} });
  }
 } catch (e) { fail('tape', e); }

 // GOOD STICK CO. players carry the Good Stick sticks in their games (only where no stick was given)
 function gearPatch(G) {
  const g17 = G && G.g17;
  if (!g17 || g17.__gs504 || !g17.gear) return;
  g17.__gs504 = 1;
  try {
   for (const pid in g17.side || {}) {
    const p = PLAYERS[pid];
    if (!p || !p.gsc501 || p.pos === 'FO') continue;
    const e = g17.gear[pid] || {};
    if (!e.stick) g17.gear[pid] = Object.assign({}, e, { stick: p.pos === 'G' ? IDS.gk : IDS.pro });
   }
  } catch (e) { fail('gear', e); }
 }
 setInterval(() => { try { if (!off() && typeof game !== 'undefined' && game && (game.user === ID || game.opp === ID)) gearPatch(game); } catch (e) {} }, 250);

 // ---------- COLLAB frames on their cards (cards are html strings; decorated on the DOM by their icon) ----------
 const NAMES = new Set([ IDS.pro, IDS.gk, IDS.tape, IDS.team ].map(id => V17.BY[id] && V17.BY[id].n).filter(Boolean));
 function deco(root) {
  if (off() || !root || !root.querySelectorAll) return;
  const list = root.matches && root.matches('.c17') ? [ root ] : root.querySelectorAll('.c17');
  for (const el of list) {
   if (el.classList.contains('rx486') || el.classList.contains('rx486i')) continue;
   const im = el.querySelector('.art img'), nm = el.querySelector('.nm');
   const id = im && V.urls.get(im.getAttribute('src'));
   const byName = !id && nm && NAMES.has(nm.textContent.trim());
   if (!id && !byName) continue;
   const it = id ? V17.BY[id] : null;
   el.classList.add(it && it.gscCard ? 'rx486' : 'rx486i');
   const rr = el.querySelector('.rr');
   if (rr && rr.textContent !== 'LOCKED') rr.textContent = 'COLLAB';
   if (!el.querySelector('.by486')) { const b = document.createElement('div'); b.className = 'by486'; b.textContent = 'by The Good Stick Co.'; (rr || el).insertAdjacentElement(rr ? 'afterend' : 'beforeend', b); }
  }
 }
 V.deco = deco;
 try {
  const mo = new MutationObserver(ms => { if (off()) return; for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) deco(n); });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true }); deco(document.body); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
 } catch (e) { fail('observer', e); }

 // ---------- the GOOD STICK PACK card (YARD SALE, COLLAB tab) ----------
 const ABOUT = [
  'WE ONLY MANUFACTURE STICKS.',
  'HEADS ARE MOLDED AT A SMALL SHOP IN LIBEREC, CZECH REPUBLIC.',
  'EVERY STICK IS STRUNG BY HAND BY YOUNG CZECH PLAYERS.',
  'LOCALLY SOURCED. AFFORDABLE TO EVERYONE.',
  '"WE WANT A MILLION NEW PLAYERS, AND WE WANT EVERY SINGLE ONE OF THEM TO HAVE A GOOD STICK."',
  'IN BAGGA LAX: THE GOOD STICK SHORTIE, THE GOALIE STICK, GOOD STICK TAPE AND THE GOOD STICK CO. TEAM.'
 ];
 const followed = () => { try { return !!(win.LS && LS.get('gsc501follow', null)); } catch (e) { return false; } };
 const owned = () => { try { return !!(X.owned && X.owned()); } catch (e) { return false; } };
 const packOn = () => { try { return !!(X.packOn && X.packOn()); } catch (e) { return false; } };
 const price = () => { try { return X.price(); } catch (e) { return 20; } };
 const aboutHtml = () => '<div class="ab486" role="note" aria-label="ABOUT THE GOOD STICK CO."><img alt="" src="' + LOGO_PNG + '"><div><b>ABOUT THE GOOD STICK CO.</b><i>COLLAB SERIES PARTNER</i>' + ABOUT.map(a => '<div>- ' + esc(a) + '</div>').join('') + '</div></div>';
 function shopBlock() {
  if (!packOn() && !owned()) return '';
  const p = price(), own = owned(), S = ST() || {}, can = (S.chinos | 0) >= p;
  const minis = [ IDS.pro, IDS.gk, IDS.tape, IDS.team ].map(id => '<span class="hwi16"><img alt="" src="' + esc(V17.iconUrl(id)) + '"></span>').join('');
  const tile = '<div class="hw16 rx486t gsc501" id="gsc501tile"><img class="hwp16" alt="" src="' + PACK_PNG + '"><div class="hwb16"><b style="color:#ffffff">GOOD STICK PACK</b><small style="color:#e6ecf2">COLLAB - THE GOOD STICK CO. YOU GET: GOOD STICK SHORTIE + GOALIE STICK + GOOD STICK TAPE + THE GOOD STICK CO. TEAM. NO PLAYER CARDS IN THE PACK.</small><div class="hwr16">' + minis + '</div><div class="rule486">GOOD STICK CO. PLAYER CARDS: EARN 2 EACH GAME YOU PLAY AS THE TEAM</div></div><div class="hwc16"><button type="button" class="g" data-a="gsc501inside" aria-label="SEE WHAT\'S INSIDE">SEE WHAT\'S INSIDE</button>' + (own ? '<button type="button" class="d" aria-label="GOOD STICK PACK OWNED">OWNED</button>' : '<button type="button" class="' + (can ? 'y' : 'd') + '" data-a="gsc501buy" aria-label="BUY GOOD STICK PACK FOR ' + p + ' DIMES">' + (followed() ? '<s>20</s> ' : '') + '<span class="coin17"></span>' + p + '</button>') + '</div></div>';
  let promo = '';
  try { promo = X.promoHtml ? X.promoHtml() : ''; } catch (e) {}
  const fol = own ? '' : followed() ? '<div class="fol486" role="note"><span>THANKS FOR FOLLOWING THE GOOD STICK CO.: <s>20</s> <b>' + p + ' DIMES</b></span></div>'
   : '<div class="fol486" role="note"><span><s>20</s> FOLLOW = <b>15 DIMES</b></span><button type="button" class="y" data-a="gsc501follow" aria-label="FOLLOW THE GOOD STICK CO.">FOLLOW</button></div>';
  return tile + promo + fol + aboutHtml();
 }
 V.shopBlock = shopBlock;
 const cursorBlock = typeof X.shopBlock === 'function' ? X.shopBlock : null;
 X.shopBlock = function () {
  if (off()) return cursorBlock ? cursorBlock.apply(this, arguments) : '';
  try { return shopBlock(); } catch (e) { fail('shop', e); return cursorBlock ? cursorBlock.apply(this, arguments) : ''; }
 };
 // the pack's "NICE PULL!" screen (v501) appends v501's own block: swap it for this one
 try {
  if (typeof PANEL_RENDER === 'object' && typeof PANEL_RENDER.shop17 === 'function') {
   const r0 = PANEL_RENDER.shop17;
   const wrapped = function () {
    let h = r0.apply(this, arguments);
    try {
     if (!off() && cursorBlock && typeof h === 'string' && h.indexOf('id="gsc501tile"') >= 0 && h.indexOf('rx486t') < 0) {
      const o = cursorBlock();
      if (o && h.indexOf(o) >= 0) h = h.split(o).join(shopBlock());
     }
    } catch (e) { fail('pull', e); }
    return h;
   };
   for (const k in r0) try { wrapped[k] = r0[k]; } catch (e) {}
   PANEL_RENDER.shop17 = wrapped;
  }
 } catch (e) { fail('shop17', e); }

 // ---------- their billboard: only in games the GOOD STICK CO. plays ----------
 setInterval(() => {
  try {
   const A = win.RL_ADS39;
   if (!A || !Array.isArray(A.fallback)) return;
   const G = typeof game !== 'undefined' ? game : null;
   const want = !off() && !!(G && (G.user === ID || G.opp === ID));
   const i = A.fallback.indexOf(BOARD_PNG);
   if (want && i < 0) A.fallback.push(BOARD_PNG);
   else if (!want && i >= 0) A.fallback.splice(i, 1);
  } catch (e) {}
 }, 500);

 note('ready');
})();
