/* v578ui.js - 1.4 UI refresh, canvas screens (Chucks' approved mockups 01 home, 02 play, 05 matchup).
 * Bug/ask: Charlie approved Chucks' refresh: clearer hierarchy (one hero PLAY, calm secondary bars, sub-lines, chips, icons)
 *   while every button stays in the same place, every feature stays, same retro pixel look.
 * Cause: the old look is drawn by V40H.draw (left hub), menuBar (right column) and drawMatchup (quick-game matchup).
 * Fix: pure paint-over. Every original draw call still runs first (so every hit() rect, label, fn and side effect is
 *   exactly the same), then this file repaints the same rectangles in the new style:
 *   - V40H.draw wrapper (left hub on HOME + PLAY): slabs, icons, sub-lines, PASS/WEEKLY progress, badges, hint plate.
 *   - menuBar wrapper (right column on HOME and the PLAY pick page): hero PLAY (gold ring + START HERE), colour-chip
 *     secondary bars, PLAY REGULAR / CAREER / ONLINE with sub-lines + chips, BACK. The themed SPECIAL GAMES button
 *     (v569evtbtn) is not repainted, it only gets a LIMITED ribbon. GAME MODES / CAREER sub-pages are untouched.
 *   - drawMenu wrapper: QUICK / TITLES footer chips + the LIMITED ribbon (skipped while a lobby card / ask is open).
 *   - drawMatchup wrapper: OVR chips, YOU/CPU chips, team-colour stripe, repainted buttons (LINEUP, PLAY = green + gold
 *     glow), DAY/NIGHT switch. Players, sticks, gear, uniforms and the name plates' see-through backing are NOT touched:
 *     nothing is drawn over a player sprite (the old name plate keeps drawing exactly as before).
 * No ids, rl_* keys, hit keys or network protocol touched. Gameplay screens are never painted.
 * Kill switch: window.__rl_no578ui = true (read every frame; the old look comes straight back).
 */
(function () {
 'use strict';
 const Wn = window;
 const off = () => !!(Wn.__rl_no578ui || Wn.__rl_v124gb);
 const DK = '#0b1a20';
 const V = Wn.V578 = { err: null, n: 0 };
 let errLogged = false;
 const fail = e => { V.err = String(e && e.stack || e); if (!errLogged) { errLogged = true; console.warn('v578ui', e); } };

 /* ---------- pixel icons (Chucks' set: Charlie's v40home icons + new ones on the same grid/palette) ---------- */
 const ICON = {
  whistle: { p: { k: DK, g: '#e4ecf0', G: '#8a9aa6', y: '#ffe14d' }, r: ['y.........', '.y...kkkk.', 'kkkkkggggk', 'kggggggGGk', 'kkkkkgGGGk', '....kGGGk.', '.....kkk..'] },
  megaphone: { p: { k: DK, o: '#ffffff', O: '#c9d6d9', w: '#ff9a3d' }, r: ['......kk.', '....kkok.w', 'kkkkooOk..', 'koooooOk.w', 'koooooOk..', 'kkkkooOk.w', '..k.kkok..', '..k...kk.'] },
  trophy: { p: { k: DK, y: '#ffcc33', Y: '#c99400', w: '#fff6c0' }, r: ['.kkkkkkk.', 'kkwyyyYkk', 'ykwyyyYky', 'kkkyyyYkk', '..kyyYk..', '...kYk...', '...kyk...', '..kkkkk..', '..kYYYk..', '..kkkkk..'] },
  clapper: { p: { k: DK, w: '#ffffff', g: '#3a4652', r: '#ff9a3d' }, r: ['kwwkkwwkk', 'kkwwkkwwk', 'kkkkkkkkk', 'kgggggggk', 'kgwwrwwgk', 'kgggggggk', 'kgwwwwggk', 'kkkkkkkkk'] },
  pencil: { p: { k: DK, p: '#ff8fb0', y: '#ffd23a', Y: '#d99a10', t: '#f0c890' }, r: ['......kk.', '.....kppk', '....kyykk', '...kyyYk.', '..kyyYk..', '.ktyYk...', '.kttk....', 'kkkk.....', 'k........'] },
  star: { p: { k: DK, y: '#fff6c0', Y: '#ffffff', o: '#c99400' }, r: ['....k....', '...kYk...', 'kkkkYykkk', 'kYYYYyyok', '.kyyyyok.', '..kyyyok.', '.kyyokyok', '.kyk.kyk.', '.kk...kk.'] },
  locker: { p: { k: DK, g: '#c9d6d9', G: '#7f8f99', w: '#ffffff', y: '#ffcc33' }, r: ['kkkkkkk', 'kwggggk', 'kgkkkGk', 'kgggggk', 'kgkkkGk', 'kgggyGk', 'kgggyGk', 'kgggggk', 'kkkkkkk'] },
  tag: { p: { k: DK, y: '#ffe14d', Y: '#d99a10', w: '#ffffff' }, r: ['..kkkkkk.', '.kwyyyyyk', 'kwykyyyYk', 'kyyyyyyYk', '.kyyyyyYk', '..kyyyyYk', '...kyyyYk', '....kkkk.'] },
  cal: { p: { k: DK, w: '#ffffff', r: '#e8443a', g: '#c9d6d9', c: '#7dff7a' }, r: ['.k...k.', 'krrrrrk', 'kkkkkkk', 'kwwwwwk', 'kwcwgwk', 'kwwcwwk', 'kwwwwwk', 'kkkkkkk'] },
  bars: { p: { k: DK }, r: ['.....kk', '.....kk', '..kk.kk', '..kk.kk', 'kkkk.kk', 'kkkk.kk', 'kkkkkkk'] },
  gear: { p: { k: DK }, r: ['...k...', '.k.k.k.', '..kkk..', 'kkk.kkk', '..kkk..', '.k.k.k.', '...k...'] },
  qmark: { p: { k: DK }, r: ['.kkk.', 'k...k', '...k.', '..k..', '..k..', '.....', '..k..'] },
  pals: { p: { k: DK }, r: ['.kk...kk.', 'kkkk.kkkk', 'kkkk.kkkk', '.kk...kk.', '.........', 'kkkk.kkkk', 'kkkk.kkkk'] },
  helmet: { p: { k: DK, y: '#2cc4dc', Y: '#1f8fa0', w: '#ffffff', g: '#c9d6d9' }, r: ['..kkkk..', '.kwyyyk.', 'kwyyyyYk', 'kyyykkkk', 'kyyykgkg', 'kYYkgkgk', '.kkkkkkk'] },
  sun: { p: { k: DK }, r: ['k.k.k', '.kkk.', 'kkkkk', '.kkk.', 'k.k.k'] },
  moon: { p: { k: '#cfe' }, r: ['.kk..', 'kk...', 'kk...', 'kk...', '.kk..'] },
  clip: { p: { k: DK, w: '#ffffff', b: '#9a6a3a' }, r: ['..kkk..', 'kbkwkbk', 'kwwwwwk', 'kwkkkwk', 'kwwwwwk', 'kwkkwwk', 'kwwwwwk', 'kkkkkkk'] },
  stad: { p: { k: DK, w: '#ffffff', g: '#7dff7a' }, r: ['k.....k', 'kk...kk', 'kkkkkkk', 'kgggggk', 'kgwgwgk', 'kkkkkkk'] },
  tix: { p: { k: DK, t: '#3dffc8', T: '#1fb38a', w: '#ffffff' }, r: ['kkkkkkkkk', 'kttttTttk', '.ktwtTtk.', 'kttttTttk', 'kkkkkkkkk'] },
  // Team Crew (Charlie): three tiny helmeted players
  headA: { p: { k: DK, w: '#ffffff', b: '#2cc4dc', B: '#1f8fa0', g: '#c9d6d9', f: '#f1c27d' }, r: ['.kkkk.', 'kwbbBk', 'kbbbBk', 'kkgkgk', 'kgfgfk', '.kkkk.'] },
  headB: { p: { k: DK, w: '#ffffff', b: '#ffe14d', B: '#c99400', g: '#c9d6d9', f: '#c68642' }, r: ['.kkkk.', 'kwbbBk', 'kbbbBk', 'kkgkgk', 'kgfgfk', '.kkkk.'] },
  headC: { p: { k: DK, w: '#ffffff', b: '#ffffff', B: '#9aa3ab', g: '#c9d6d9', f: '#e0ac69' }, r: ['.kkkk.', 'kwbbBk', 'kbbbBk', 'kkgkgk', 'kgfgfk', '.kkkk.'] }
 };
 function ic(n, x, y, k) {
  const I = ICON[n]; k = k || 1;
  for (let r = 0; r < I.r.length; r++) {
   const row = I.r[r]; let c = 0;
   while (c < row.length) {
    const ch = row[c];
    if (ch === '.' || !I.p[ch]) { c++; continue; }
    let n2 = 1; while (row[c + n2] === ch) n2++;
    rect(x + c * k, y + r * k, n2 * k, k, I.p[ch]); c += n2;
   }
  }
 }
 const iw = n => ICON[n].r[0].length, ih = n => ICON[n].r.length;
 const TT = () => typeof menuT !== 'undefined' ? menuT : performance.now() / 1e3;

 /* ---------- shared pieces (the game's menuBar recipe + one detail pass) ---------- */
 function slab(x, y, w, h, bg, o) {
  o = o || {};
  rect(x, y + 2, w, h, '#000');
  if (o.sh3) rect(x + 1, y + 3, w, h, '#000');
  rect(x, y, w, h, bg);
  for (let k = y + 3; k < y + h - 3; k += 3) rect(x + 3, k, w - 3, 1, 'rgba(255,255,255,.07)');
  rect(x, y, w, 1, 'rgba(255,255,255,.45)');
  rect(x, y + h - 2, w, 2, 'rgba(0,0,0,.18)');
  rect(x, y, 3, h, 'rgba(0,0,0,.22)');
  if (!o.noRivet) { rect(x + w - 3, y + 2, 1, 1, 'rgba(0,0,0,.28)'); rect(x + w - 3, y + h - 4, 1, 1, 'rgba(0,0,0,.28)'); }
 }
 function chev(x, y, h, col) { col = col || 'rgba(11,26,32,.55)'; for (let i = 0; i < 3; i++) rect(x + i, Math.round(y + h / 2 - 3 + i), 1, 7 - 2 * i, col); }
 function tagChip(s, x, y, bg, fg, right) {
  const w = textW(s) + 4;
  if (right) x -= w;
  rect(x - 1, y - 1, w + 2, 9, DK); rect(x, y, w, 7, bg); rect(x, y, w, 1, 'rgba(255,255,255,.35)');
  text(s, x + 2, y + 1, 1, fg || '#fff');
  return w;
 }
 function dotNum(s, cx, cy) {
  s = String(s); const w = Math.max(7, textW(s) + 4);
  rect(cx - w / 2 - 1, cy - 4, w + 2, 9, DK); rect(cx - w / 2, cy - 3, w, 7, '#e8443a');
  rect(cx - w / 2 + 1, cy - 3, w - 2, 1, 'rgba(255,255,255,.4)');
  text(s, cx, cy - 2, 1, '#fff', 'center');
 }
 function heroRing(x, y, w, h) {
  const a = .55 + .45 * Math.sin(TT() * 4), c = 'rgba(255,225,77,' + a.toFixed(2) + ')';
  rect(x - 2, y - 2, w + 4, 1, c); rect(x - 2, y + h + 3, w + 4, 1, c); rect(x - 2, y - 2, 1, h + 6, c); rect(x + w + 1, y - 2, 1, h + 6, c);
  rect(x - 1, y - 1, w + 2, 1, DK); rect(x - 1, y - 1, 1, h + 3, DK); rect(x + w, y - 1, 1, h + 3, DK);
 }
 function ribbon(s, x, y, bg, fg) {
  const w = textW(s) + 6;
  rect(x - 1, y - 1, w + 2, 9, DK); rect(x, y, w, 7, bg || '#ffe14d'); rect(x, y, w, 1, 'rgba(255,255,255,.5)');
  rect(x - 1, y + 7, 2, 2, DK); rect(x, y + 7, 1, 1, '#a07a00');
  text(s, x + 3, y + 1, 1, fg || DK);
 }
 function playTri(x, y, k, col) { for (let i = 0; i < 4 * k; i++) rect(x + i, y + i / 2, 1, 8 * k - i, col); }
 function clipBg(x, y, w, h, fn) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); try { fn(); } finally { g.restore(); } }

 /* ---------- LEFT HUB (HOME + PLAY) ---------- */
 const hubOn = () => !off() && screen === 'menu' && Wn.M37 && (M37.page === 'home' || M37.page === 'play') && Wn.V40H && V40H.STYLE && !V40H.STYLE.personality && !Wn.__rl_40hp && !Wn.__rl_no40hp_force;
 let ROWS = null;
 function badgeOf(key) { if (!ROWS) return null; for (const r of ROWS) for (const b of r) if (b.key === key) return b.badge || null; return null; }
 function leftHub() {
  const R = {}; for (const r of V40H.rects()) R[r.key] = r;
  const t = TT(), I = V40H.info || {}, PASS = (Wn.V17 && V17.PASS) || [];
  let r = R.SHOP; if (r) {
   slab(r.x, r.y, r.w, r.h, '#7dff7a');
   for (let i = 0; i < r.w; i += 8) rect(r.x + i, r.y + 1, Math.min(4, r.w - i), 3, (i / 8) % 2 ? '#ffffff' : '#3fd94a');
   rect(r.x, r.y + 4, r.w, 1, 'rgba(0,0,0,.2)');
   for (let i = 0; i < r.w - 2; i += 4) rect(r.x + i + 1, r.y + 5, 2, 1, 'rgba(0,0,0,.12)');
   ic('tag', r.x + 9, r.y + 12, 1);
   const lab = V40H.SHOP_LABEL || 'YARD SALE';
   text(lab, r.x + r.w / 2 + 4, r.y + 11, textW(lab, 2) <= r.w - 34 ? 2 : 1, DK, 'center');
   textMini('PACKS + GEAR', r.x + r.w / 2 + 4, r.y + 23, 'rgba(11,26,32,.75)', .75);
   chev(r.x + r.w - 9, r.y + 2, r.h);
   if (badgeOf('SHOP')) tagChip('FREE', r.x + r.w - 2, r.y - 4, Math.floor(t * 3) % 2 ? '#e8443a' : '#ff3b3b', '#fff', true);
  }
  r = R['LOCKER ROOM']; if (r) {
   slab(r.x, r.y, r.w, r.h, '#8fe3f0');
   const cx = r.x + r.w / 2 + 10, tw = textW('LOCKER ROOM', 2);
   ic('locker', Math.round(cx - tw / 2 - 26), r.y + 4, 2);
   text('LOCKER ROOM', cx, r.y + 6, 2, DK, 'center');
   textMini('YOUR GEAR, CARDS + TEAMS', cx, r.y + 18, 'rgba(11,26,32,.7)', .75);
   chev(r.x + r.w - 9, r.y, r.h);
  }
  r = R.PASS; if (r) {
   slab(r.x, r.y, r.w, r.h, '#ffcc33');
   ic('star', r.x + 6, r.y + 3, 1);
   const lv = I.lv | 0, nn = I.nn | 0, max = PASS.length && lv >= PASS.length;
   text('PASS', r.x + 19, r.y + 4, 1, DK); textMini('LV ' + lv, r.x + 46, r.y + 4.5, 'rgba(11,26,32,.75)', .75);
   const bx = r.x + 19, bw = r.w - 34, by = r.y + 12, sw = bw / 5;
   rect(bx - 1, by - 1, bw + 2, 7, DK);
   for (let i = 0; i < 5; i++) {
    const on = i < nn, sx = Math.round(bx + i * sw + 1), ww = Math.round(sw - 2);
    rect(sx, by + 1, ww, 3, on ? '#c99400' : '#3a4652');
    if (on) rect(sx, by + 1, ww, 1, '#fff6c0');
   }
   textMini(max ? 'MAX' : nn + '/5', r.x + r.w - 7, by + .5, DK, .75);
   if (badgeOf('PASS')) dotNum('!', r.x + r.w - 2, r.y - 1);
  }
  r = R.WEEKLY; if (r) {
   slab(r.x, r.y, r.w, r.h, '#b9a8ff');
   ic('cal', r.x + 7, r.y + 4, 1);
   text('WEEKLY', r.x + 19, r.y + 4, 1, DK);
   const tot = Math.min(6, I.tot | 0), done = I.done | 0;
   const room = r.w - 19 - 37, st = tot && room / tot >= 9 ? 9 : 6, bw0 = st - 3; // narrow phones: smaller boxes, never under the DONE text
   for (let i = 0; i < tot; i++) { const px0 = r.x + 19 + i * st; rect(px0 - 1, r.y + 11, bw0 + 2, 7, DK); rect(px0, r.y + 12, bw0, 5, i < done ? '#7dff7a' : '#e7e0ff'); }
   textMini(done + '/' + (I.tot | 0) + ' DONE', r.x + r.w - 22, r.y + 13, 'rgba(11,26,32,.75)', .75);
   const b = badgeOf('WEEKLY'); if (b) dotNum(b, r.x + r.w - 2, r.y - 1);
  }
  r = R['TEAM CREW']; if (r) {
   slab(r.x, r.y, r.w, r.h, '#ff9a4a');
   const hy = r.y + Math.round((r.h - 9) / 2);
   ic('headA', r.x + 13, hy + 3, 1); ic('headC', r.x + 23, hy + 3, 1); ic('headB', r.x + 18, hy, 1);
   text('TEAM CREW', r.x + r.w / 2 + 6, r.y + Math.round((r.h - 5) / 2), 1, DK, 'center'); chev(r.x + r.w - 8, r.y, r.h);
  }
  r = R['CHIRP LOADOUT']; if (r && !Wn.__rl_no40chirp) { // keep the signature speech bubble, add the megaphone
   const x = r.x, w = r.w, h = r.h, Y = r.y, bh = h - 4, cr = '#fff6e0', tx = x + 12;
   const blob = (oy, c1, c2) => {
    rect(x + 2, oy, w - 4, bh, c1); rect(x, oy + 2, w, bh - 4, c1); rect(x + 1, oy + 1, w - 2, bh - 2, c1);
    rect(x + 3, oy + 1, w - 6, bh - 2, c2); rect(x + 1, oy + 3, w - 2, bh - 6, c2); rect(x + 2, oy + 2, w - 4, bh - 4, c2);
    rect(tx - 1, oy + bh - 1, 8, 1, c1); rect(tx, oy + bh - 1, 6, 1, c2); rect(tx - 2, oy + bh, 7, 1, c1); rect(tx - 1, oy + bh, 4, 1, c2); rect(tx - 3, oy + bh + 1, 5, 1, c1); rect(tx - 2, oy + bh + 1, 2, 1, c2); rect(tx - 4, oy + bh + 2, 3, 1, c1);
   };
   blob(Y + 2, '#000', '#000'); blob(Y, DK, cr);
   rect(x + 3, Y + 1, w - 6, 1, '#ffffff');
   ic('megaphone', x + 10, Y + Math.round((bh - 8) / 2), 1);
   text('CHIRP LOADOUT', x + w / 2 + 7, Math.round(Y + (bh - 5) / 2), 1, DK, 'center');
  }
  const small = [['CLIPS', '#ff5ad2', 'clapper'], ['EDIT NAMES', '#c9d6d9', 'pencil'], ['HOME TEAMS + RATINGS', '#8fe3f0', 'bars']];
  for (const s of small) {
   r = R[s[0]]; if (!r) continue;
   const lab = s[0] === 'HOME TEAMS + RATINGS' ? 'TEAMS + RATINGS' : s[0], icn = s[2];
   slab(r.x, r.y, r.w, r.h, s[1]);
   const tw = textW(lab), tot = iw(icn) + 4 + tw;
   if (r.w < 50 || tot > r.w - 8) { ic(icn, Math.round(r.x + r.w / 2 - iw(icn) / 2), r.y + 3, 1); text(lab, r.x + r.w / 2 + 1, r.y + 14, 1, DK, 'center'); }
   else { const x0 = Math.round(r.x + (r.w - tot) / 2 + 1); ic(icn, x0, r.y + Math.round((r.h - ih(icn)) / 2) - 1, 1); text(lab, x0 + iw(icn) + 4, r.y + Math.round((r.h - 5) / 2) - 1, 1, DK); }
  }
  // the hint plate: same spot, + a moving arrow pointing at the right-hand column
  const last = V40H.last; if (!last) return;
  const hy = last.bottom + 3, L = lobbyBounds().L;
  if (hy + 10 > H - 12) return;
  const hint = M37.page === 'home' ? 'TAP PLAY TO PICK A MODE' : 'PICK A MODE TO SEE YOUR TEAM';
  const hw = textW(hint) + 26, hx = Math.round(L / 2 - hw / 2);
  rect(hx - 6, hy - 1, hw + 12, 12, '#141c24');
  rect(hx, hy, hw, 11, DK); rect(hx, hy, hw, 1, '#2cc4dc');
  text(hint, hx + 5, hy + 3, 1, '#8fe3f0');
  const ax = hx + hw - 14 + (Math.floor(t * 4) % 3);
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) rect(ax + j * 4 + i, hy + 3 + i, 1, 5 - 2 * i, '#7dff7a');
 }
 if (Wn.V40H && typeof V40H.draw === 'function' && typeof V40H.layout === 'function') {
  const LY0 = V40H.layout;
  V40H.layout = function () { const rows = LY0.apply(this, arguments); ROWS = rows; return rows; };
  const D0 = V40H.draw;
  V40H.draw = function () {
   const r = D0.apply(this, arguments);
   if (hubOn()) try { leftHub(); V.n++; } catch (e) { fail(e); }
   return r;
  };
 }

 /* ---------- RIGHT COLUMN (menuBar) ---------- */
 function secBar(b, icn, lab) {
  const x = b.x, y = b.y, w = b.w, h = b.h, col = b.bg || '#2cc4dc';
  rect(x, y + 2, w, h, '#000');
  rect(x, y, w, h, '#1b2a33');
  for (let k = y + 3; k < y + h - 2; k += 3) rect(x + h, k, w - h, 1, 'rgba(255,255,255,.03)');
  rect(x, y, w, 1, 'rgba(255,255,255,.18)');
  rect(x, y, h, h, col); rect(x, y, h, 1, 'rgba(255,255,255,.45)'); rect(x, y + h - 2, h, 2, 'rgba(0,0,0,.18)');
  rect(x + h, y, 1, h, 'rgba(0,0,0,.5)');
  ic(icn, Math.round(x + (h - iw(icn)) / 2), Math.round(y + (h - ih(icn)) / 2), 1);
  textMini(lab, x + h + (w - h) / 2, y + Math.round((h - 7.5) / 2), '#f2fbfc', 1.5);
  chev(x + w - 8, y, h, col);
 }
 const SEC = { 'SETTINGS': ['gear', 'SETTINGS'], 'GAME SETTINGS': ['gear', 'SETTINGS'], 'HOW TO PLAY': ['qmark', 'HOW TO PLAY'], 'TUTORIAL': ['whistle', 'TUTORIAL'], 'FRIENDS': ['pals', 'FRIENDS'] };
 const sub = (s, x, y) => textMini(s, x, y, 'rgba(11,26,32,.75)', .75);
 const mw = s => { const c = Math.max(1, Math.round(.75 * (typeof RR !== 'undefined' ? RR : 2))) / (typeof RR !== 'undefined' ? RR : 2); return s.length * 4 * c - c; }; // 1.5: real textMini width at .75 (cells snap to screen pixels)
 let tixAt = -9, tixTxt = null;
 function careerChip() {
  const t = TT();
  if (Math.abs(t - tixAt) > 1) {
   tixAt = t; tixTxt = null;
   try { if (Wn.V479) tixTxt = V479.inProgress() ? 'ACTIVE' : (V479.ticket() ? '1' : '0') + ' TIX'; } catch (e) {}
  }
  return tixTxt;
 }
 function pickHead(b) { // v469's PLAY / sentence head -> one line, PICK A MODE (same place)
  const L = lobbyBounds().L;
  clipBg(L + 2, 20, W - L - 2, b.y - 20, () => { bgStripes(); rect(L, 0, W - L, H, 'rgba(0,0,0,.35)'); });
  text('PICK A MODE', b.x + b.w / 2, 26, 1, '#ffe14d', 'center', '#000');
 }
 function bigMode(b, bg, lab, subTxt, hero) { // label + subtitle always fit inside the button (Jonny: no edge clipping)
  const x = b.x, y = b.y, w = b.w, h = b.h;
  if (hero) heroRing(x, y, w, h);
  slab(x, y, w, h, bg, { noRivet: hero });
  if (hero) rect(x + 3, y + h - 5, w - 3, 3, 'rgba(0,0,0,.12)');
  const avail = w - 14, need = k => textW(lab, k) + 4 * k + 3; // triangle + gap + label
  const sc = textW(lab, 2) <= avail ? 2 : 1, ty = y + (subTxt ? 4 : Math.round((h - 5 * sc) / 2));
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  try {
   if (need(sc) > avail && textW(lab, 2) <= avail) text(lab, x + w / 2, ty, 2, DK, 'center'); // narrow phone: keep 2x, drop the arrow
   else if (need(sc) <= avail) {
    const x0 = Math.round(x + (w - need(sc)) / 2);
    playTri(x0, ty + (sc === 2 ? 1 : -1), sc === 2 ? 1 : .6, DK);
    text(lab, x0 + 4 * sc + 3, ty, sc, DK);
   } else textMini(lab, x + w / 2, ty, DK, Math.max(.5, avail / textW(lab)));
  } finally { g.restore(); }
  return ty + 5 * sc + 3;
 }
 function subFit(list, x, w, y) { // first subtitle that fits, else the last one shrunk to fit; clipped to the button
  const avail = w - 12, t = list.find(s => mw(s) <= avail) || list[list.length - 1], k = Math.min(.75, avail / (t.length * 4));
  g.save(); g.beginPath(); g.rect(x, y - 2, w, 8); g.clip();
  try { textMini(t, x + w / 2, y, 'rgba(11,26,32,.75)', k); } finally { g.restore(); }
 }
 function playPick(b) {
  const L = b.label, x = b.x, w = b.w;
  if (L === 'PLAY REGULAR') {
   const hero = !Wn.__rk15top; // 1.5c: when ONLINE / RANKED sits on top it is the hero button
   const sy = bigMode(b, b.bg || '#7dff7a', L, 1, hero);
   subFit(['QUICK - PRO - WORLD - COLLEGE - ULTIMATE', 'QUICK - PRO - WORLD - MORE', 'QUICK - PRO - MORE'], x, w, sy);
   if (hero) ribbon('START HERE', x + w - 50, b.y - 5);
   return true;
  }
  if (L === 'PLAY CAREER') {
   const sy = bigMode(b, b.bg || '#ffb14d', L, 1);
   const c = careerChip(), cw = c ? textW(c) + 15 : 0, room = w - 22 - (c ? cw + 8 : 0);
   const st = ['CAREER CARD + FRANCHISE', 'CARD + FRANCHISE'].find(t => mw(t) <= room);
   if (st) sub(st, x + 22 + mw(st) / 2, sy);
   if (c) { const cy = b.y + b.h - (Wn.__rk15top ? 6 : 11); rect(x + w - cw - 5, cy, cw, 9, DK); ic('tix', x + w - cw - 3, cy + 2, 1); text(c, x + w - cw + 8, cy + 2, 1, '#3dffc8'); } // 1.5c (Jonny): sits on the bottom edge, clear of the PLAY CAREER title
   return true;
  }
  if (L === 'PLAY ONLINE') {
   const sy = bigMode(b, b.bg || '#2cc4dc', L, 1);
   subFit(['VS REAL PLAYERS'], x, w, sy);
   return true;
  }
  if (L === 'BACK') {
   rect(x, b.y + 2, w, b.h, '#000'); rect(x, b.y, w, b.h, '#2a3a44'); rect(x, b.y, w, 1, 'rgba(255,255,255,.2)');
   for (let i = 0; i < 3; i++) rect(x + 8 - i, b.y + Math.round(b.h / 2) - 2 + i, 1, 5 - 2 * i, '#c9d6d9');
   text('BACK', x + w / 2, b.y + Math.round((b.h - 5) / 2), 1, '#c9d6d9', 'center');
   return true;
  }
  return false;
 }
 function homeBar(b) {
  if (b.label === 'PLAY' && b.m37 === 'play') {
   const x = b.x, y = b.y, w = b.w, h = b.h;
   heroRing(x, y, w, h);
   slab(x, y, w, h, b.bg || '#7dff7a', { noRivet: 1 });
   rect(x + 3, y + h - 6, w - 3, 4, '#5fe05c');
   const tw = textW('PLAY', 4) + 18, x0 = Math.round(x + (w - tw) / 2), ty = y + Math.round((h - 20) / 2) - 1;
   playTri(x0, ty + 2, 2, DK);
   text('PLAY', x0 + 18, ty, 4, DK);
   for (let i = 0; i < 5; i++) { const sx = x + 14 + ((i * 37 + Math.floor(TT() * 6) * 13) % (w - 20)); rect(sx, y + 3 + (i * 7) % 4, 1, 1, '#ffffff'); }
   ribbon('START HERE', x + w - 50, y - 4);
   return true;
  }
  const s = SEC[b.label];
  if (s && b.h <= 24) { secBar(b, s[0], s[1]); return true; }
  return false;
 }
 if (typeof Wn.menuBar === 'function') {
  const MB0 = Wn.menuBar;
  Wn.menuBar = function (b, live) {
   const r = MB0.apply(this, arguments);
   if (off() || !b || screen !== 'menu' || !Wn.M37 || (typeof tutGate !== 'undefined' && tutGate)) return r;
   try {
    if (M37.page === 'home' && !b.t469) homeBar(b);
    else if (M37.page === 'play' && b.t469 === 'pick' && Wn.V469 && V469.page === 'pick') {
     if (b.first37) pickHead(b);
     playPick(b);
    }
   } catch (e) { fail(e); }
   return r;
  };
 }

 /* ---------- drawMenu: footer chips + LIMITED ribbon on the special button ---------- */
 const specOf = (k) => { try { for (const s of uiSpecs) if (s.key === k) return s; } catch (e) {} return null; };
 function footer() {
  const L = lobbyBounds().L, bx = lobbyBounds().bx;
  let w0 = 0, l0 = 0, ti = 0;
  try { w0 = record.w; l0 = record.l; } catch (e) {}
  try { ti = LS.get('titles', 0); } catch (e) {}
  const q = 'QUICK ' + w0 + '-' + l0, tt = 'TITLES ' + ti;
  clipBg(bx - 2, H - 14, 132, 14, () => { bgStripes(); rect(L, 0, W - L, H, 'rgba(0,0,0,.35)'); });
  const qw = textW(q) + 16, y = H - 13;
  rect(bx, y, qw, 11, DK); rect(bx, y, qw, 1, '#2cc4dc');
  ic('whistle', bx + 2, y + 2, 1); text(q, bx + 14, y + 3, 1, '#cfe');
  const tx = bx + qw + 3, tw = textW(tt) + 16;
  rect(tx, y, tw, 11, DK); rect(tx, y, tw, 1, '#ffcc33');
  clipBg(tx, y + 1, tw, 10, () => ic('trophy', tx + 2, y + 1, 1));
  text(tt, tx + 14, y + 3, 1, '#ffd23a');
 }
 if (typeof Wn.drawMenu === 'function') {
  const DM0 = Wn.drawMenu;
  Wn.drawMenu = function () {
   const r = DM0.apply(this, arguments);
   if (off() || screen !== 'menu' || !Wn.M37) return r;
   try {
    const busy = (typeof lobby !== 'undefined' && lobby && lobby.card) || (typeof tutAsk !== 'undefined' && tutAsk) || (typeof tutGate !== 'undefined' && tutGate) || (typeof ASK22 !== 'undefined' && ASK22) || (typeof menuMsg !== 'undefined' && menuMsg);
    if (busy) return r;
    const pick = M37.page === 'play' && Wn.V469 && V469.page === 'pick';
    if (M37.page === 'home' || pick) footer();
    if (pick) { // the themed SPECIAL GAMES button (v569evtbtn) keeps its own art; it only gets the LIMITED sticker
     const back = specOf('menu|BACK'), on = specOf('menu|PLAY ONLINE');
     if (back && on) { let t = null; /* 1.5: ONLINE may sit on top, so the sticker goes on the lowest menu button above BACK (SPECIAL GAMES) */
      for (const s of uiSpecs) {
       if (s.key.indexOf('menu|') || s.key === 'menu|PLAY ONLINE' || s.x < back.x - 1 || s.y >= back.y - 2 || s.w < back.w - 2) continue;
       if (!Wn.__rk15top && s.y <= on.y + 2) continue;
       if (!t || s.y > t.y) t = s;
      }
      if (t) { if (Wn.__rk15top) ribbon('LIMITED', t.x + 3, t.y - 3, '#e8443a', '#ffffff'); else ribbon('LIMITED', t.x + t.w - 34, t.y - 4, '#e8443a', '#ffffff'); } // 1.5c (Jonny): top-left, so it never cuts the title or meets the TIX chip
     }
    }
   } catch (e) { fail(e); }
   return r;
  };
 }

 /* ---------- MATCHUP (quick game) ---------- */
 function matchupAfter(S) {
  const u = menuSel.team, o = menuSel.opp, cx = W / 2;
  // OVR chips (same line the old TEAM OVR text used)
  // stays inside the old TEAM OVR line's band (y-2 .. y+7) so KITS LOOK ALIKE (y+8) below it is never covered
  const oU = teamOvr(u, 'real'), oO = teamOvr(o, 'real'), fy = Wn.__rl286mu ? __rl286mu.fy : 124, cy = 113 - (124 - fy) - 2;
  const chip = (v, x, best) => {
   rect(x - 16, cy, 32, 9, DK); rect(x - 15, cy + 1, 30, 7, best ? '#ffcc33' : '#2a3a44');
   rect(x - 15, cy + 1, 30, 1, 'rgba(255,255,255,.4)');
   textMini('OVR', x - 6, cy + 2.5, best ? DK : '#cfe', .75); text(String(v), x + 7, cy + 2, 1, best ? DK : '#ffffff', 'center');
  };
  chip(oU, cx - 17, oU >= oO); chip(oO, cx + 17, oO > oU);
  let r = S.BACK; if (r) { slab(r.x, r.y, r.w, r.h, '#c9d6d9', { noRivet: 1 }); for (let i = 0; i < 3; i++) rect(r.x + 5 + 2 - i, r.y + 4 + i, 1, 5 - 2 * i, DK); text('BACK', r.x + r.w / 2 + 3, r.y + Math.round((r.h - 5) / 2), 1, DK, 'center'); }
  r = S.GEAR; if (r) { slab(r.x, r.y, r.w, r.h, '#ffcc33', { noRivet: 1 }); ic('helmet', r.x + 4, r.y + 3, 1); text('GEAR', r.x + r.w / 2 + 4, r.y + Math.round((r.h - 5) / 2), 1, DK, 'center'); }
  const d = S.DAY, n = S.NIGHT;
  if (d && n) {
   const nt = !!menuSel.night, x0 = d.x - 2, x1 = n.x + n.w + 2;
   rect(x0, d.y - 2, x1 - x0, d.h + 5, '#000'); rect(x0 + 1, d.y - 1, x1 - x0 - 2, d.h + 3, '#05080b');
   const seg = (s, on, lab, icn, bg) => {
    if (on) { rect(s.x, s.y, s.w, s.h, bg); rect(s.x, s.y, s.w, 1, 'rgba(255,255,255,.5)'); rect(s.x, s.y + s.h - 2, s.w, 2, 'rgba(0,0,0,.18)'); }
    else rect(s.x, s.y + 1, s.w, s.h - 1, '#1b2a33');
    if (on) ic(icn, s.x + 4, s.y + 4, 1); else { g.save(); g.globalAlpha = .5; ic(icn === 'sun' ? 'sun' : 'moon', s.x + 4, s.y + 4, 1); g.restore(); }
    text(lab, s.x + 10 + (s.w - 10) / 2, s.y + 4, 1, on ? DK : '#6f8590', 'center');
   };
   seg(d, !nt, 'DAY', 'sun', '#ffe14d'); seg(n, nt, 'NIGHT', 'moon', '#b9a8ff');
  }
  r = S['CHOOSE STADIUM']; if (r) { slab(r.x, r.y, r.w, r.h, '#ffd23a', { noRivet: 1 }); ic('stad', r.x + 7, r.y + 4, 1); text('CHOOSE STADIUM', r.x + r.w / 2 + 4, r.y + Math.round((r.h - 5) / 2), 1, DK, 'center'); chev(r.x + r.w - 7, r.y, r.h); }
  const lu = S['YOUR LINEUP'], rs = S['ROSTER & STATS'], pl = S.PLAY;
  if (lu && rs) { const tx0 = lu.x - 3, tx1 = rs.x + rs.w + 3; rect(tx0, lu.y - 3, tx1 - tx0, lu.h + 7, '#05080b'); rect(tx0, lu.y - 3, tx1 - tx0, 1, '#2cc4dc'); }
  if (lu) { slab(lu.x, lu.y, lu.w, lu.h, '#2cc4dc', { noRivet: 1 }); ic('clip', lu.x + 5, lu.y + 5, 1); text('LINEUP', lu.x + lu.w / 2 + 4, lu.y + Math.round((lu.h - 5) / 2), 1, DK, 'center'); }
  if (rs) { slab(rs.x, rs.y, rs.w, rs.h, '#8fe3f0', { noRivet: 1 }); ic('bars', rs.x + 6, rs.y + 6, 1); text('ROSTER + STATS', rs.x + rs.w / 2 + 5, rs.y + Math.round((rs.h - 5) / 2), 1, DK, 'center'); }
  if (pl) {
   heroRing(pl.x, pl.y, pl.w, pl.h);
   slab(pl.x, pl.y, pl.w, pl.h, '#7dff7a', { noRivet: 1, sh3: 1 });
   const tw = textW('PLAY', 2) + 12, x0 = Math.round(pl.x + (pl.w - tw) / 2);
   playTri(x0, pl.y + 3, 1.5, DK); text('PLAY', x0 + 12, pl.y + Math.round((pl.h - 10) / 2), 2, DK);
   const ax = pl.x + pl.w - 25 + (Math.floor(TT() * 4) % 3);
   for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) rect(ax + j * 4 + i, pl.y + 6 + i, 1, 5 - 2 * i, 'rgba(11,26,32,.6)');
  }
 }
 // text hook used only while drawMatchup runs: TEAM OVR line -> chips; "HOME - YOU" -> "HOME [YOU]" (same spot, same plate)
 function muText(T0) {
  return function (s, x, y, sc, col) {
   if (typeof s === 'string') {
    if (s.indexOf('TEAM OVR ') === 0) return;
    const m = /^(HOME|AWAY) - (YOU|CPU)$/.exec(s);
    if (m && (sc == null || sc === 1)) {
     const ha = m[1], who = m[2], you = who === 'YOU', w1 = textW(ha + ' ') + textW(who) + 4, x0 = Math.round(x - w1 / 2);
     T0.call(this, ha, x0, y, 1, you ? '#8fe3f0' : '#cfe');
     const cx0 = x0 + textW(ha + ' ') - 1;
     rect(cx0, y - 1, textW(who) + 4, 7, you ? '#2cc4dc' : '#5a6670'); rect(cx0, y - 1, textW(who) + 4, 1, 'rgba(255,255,255,.35)');
     T0.call(this, who, cx0 + 2, y, 1, you ? DK : '#fff');
     return;
    }
   }
   return T0.apply(this, arguments);
  };
 }
 if (typeof Wn.drawMatchup === 'function') {
  const DMU0 = Wn.drawMatchup;
  Wn.drawMatchup = function () {
   if (off()) return DMU0.apply(this, arguments);
   const T0 = Wn.text, hook = muText(T0);
   Wn.text = hook;
   let r;
   try { r = DMU0.apply(this, arguments); } finally { if (Wn.text === hook) Wn.text = T0; }
   if (screen !== 'matchup' || typeof menuSel === 'undefined' || !menuSel.opp) return r;
   try {
    const S = {};
    for (const s of uiSpecs) if (s.key.indexOf('matchup|') === 0) S[s.key.slice(8)] = s;
    if (S.PLAY) matchupAfter(S);
   } catch (e) { fail(e); }
   return r;
  };
 }
})();
