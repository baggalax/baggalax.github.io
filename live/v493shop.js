/* v493shop.js - Bagga Lax shop + team changes for the Veterans Day drop (Charlie, Nov 10 2026):
 *  1. "They should be n/a not pro": the six Veterans Day service teams move from the PRO team grid to the N/A tab,
 *     beside the New Orleans Ghosts, wherever the canvas team grid is used (quick match team + opponent, browse).
 *  2. "Remove the two college uniform packs from shop when this drops": the SKY CHROME / CHROME DOME pack (b2504c)
 *     and the GOLD CROWN / LUCKY pack (b2504l) come off sale. Owned pieces stay owned.
 *  3. "Remove halloween pack from shop with a 3 day count down": the HALLOWEEN PACK stays for 3 days from the first
 *     open with this file (rl_hw493start) with a LEAVES IN countdown, then it is gone (the game's own off switch
 *     window.__rl_32hwOff). Owned Halloween items stay.
 *  4. "buy new orleans ghosts by clicking their team in n/a section, 1000 dimes, you don't get the ghost white or
 *     the skeleton uniform": a locked Ghosts tile in N/A opens a BUY? prompt; YES spends 1000 dimes and unlocks the
 *     team only (rl_gho493own + ST.gho493). The Halloween pack still unlocks the Ghosts as before.
 *  Steer (12:28 PM): "Make sure the ghost and skeleton uniforms are not able to be gotten after this": the two
 *     Ghosts uniforms (uni21|GHO|2 WHITE GHOST, uni21|GHO|3 SKELETON) can only be held by a save that owns the
 *     Halloween pack (ST.hw2316) or already holds them. Every other grant path is refused (see V493.paths).
 *  New save keys: rl_hw493start, rl_gho493own (+ ST.gho493, ST.gho493had). No net protocol.
 *  1:32 PM "No make it so they can use ghosts": dime-bought Ghosts work ONLINE too. Online 1v1 lobbies already use
 *     the N/A tile below (GHO16.owned). Online SEASON lobbies asked the Halloween pack itself (v232 ghOwned, v35
 *     ghOwned35 -> V17.hw16.owned()); V17.hw16.owned answers yes for a dime buyer ONLY inside those online team-pick
 *     checks (T232.pickOpts + the v35 N/A TEAMS? ask), never anywhere else, so no Halloween-owner extras
 *     (GHOST WHITE, SKELETON, the Halloween stadium, stacks) come with it. Same team id 'GHO' over the wire.
 *  Kill switch: window.__rl_no493shop = true (before load = nothing changes; at runtime the wrappers step aside and
 *  the college packs / Halloween pack come back).
 */
(function () {
 'use strict';
 const W0 = window;
 const off = () => !!(W0.__rl_no493shop || W0.__rl_v124gb);
 if (off() || !W0.V17 || !V17.ST || W0.V493) return;
 const V = W0.V493 = { log: [], err: [], blocked: [], stripped: [], paths: [] };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { if (V.err.length < 20) V.err.push(w + ': ' + String(e && e.message || e)); try { console.warn('v493', w, e); } catch (x) {} };
 const ST = () => { try { return V17.ST(); } catch (e) { return null; } };
 const dirty = () => { try { panelDirty(); } catch (e) {} };
 const toast17 = (s, c) => { try { V17.toast(s, c || '#ffd23a'); } catch (e) {} };
 const lsGet = (k, d) => { try { return LS.get(k, d); } catch (e) { return d; } };
 const lsSet = (k, v) => { try { LS.set(k, v); } catch (e) {} };
 function left(ms) {
  const m = Math.floor(Math.max(0, ms) / 60000), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
  return 'LEAVES IN ' + (d > 0 ? d + 'D ' + h + 'H' : h > 0 ? h + 'H ' + mm + 'M' : Math.max(1, mm) + 'M');
 }

 // ---------- 2. the two college uniform packs come off sale ----------
 const COL = [ 'b2504c', 'b2504l' ], pulled = {};
 function colTick() {
  try {
   const P = V17.PACKS;
   if (!P) return;
   if (off()) { for (const k in pulled) if (!P[k]) P[k] = pulled[k]; return; }
   for (const k of COL) if (P[k]) { pulled[k] = P[k]; delete P[k]; }
  } catch (e) { fail('col', e); }
 }
 colTick();
 V.colPulled = () => Object.keys(pulled);

 // ---------- 3. the Halloween pack: 3 days, then gone ----------
 const HW_HOURS = 72;
 let hwStart = lsGet('hw493start', null);
 if (!hwStart) { hwStart = Date.now(); lsSet('hw493start', hwStart); }
 const hwEnd = () => W0.__rl493hwEndTest != null ? +W0.__rl493hwEndTest : (+hwStart || Date.now()) + HW_HOURS * 3600e3;
 const hwLive = () => Date.now() < hwEnd();
 const hwLeft = () => left(hwEnd() - Date.now());
 let hwByUs = false;
 function hwTick() {
  try {
   if (off()) { if (hwByUs) { W0.__rl_32hwOff = false; hwByUs = false; dirty(); } return; }
   if (!hwLive() && !W0.__rl_32hwOff) { W0.__rl_32hwOff = true; hwByUs = true; note('halloween gone'); dirty(); }
  } catch (e) { fail('hw', e); }
 }
 hwTick();
 V.hwEnd = hwEnd; V.hwLive = hwLive; V.hwLeft = hwLeft;
 try {
  const css = '.hw16 .lt493,.hd .lt493{display:inline-block;margin-left:6px;padding:1px 4px;background:#c8102e;color:#fff;font-style:normal;font-size:9px;border:1px solid #ffcc33;vertical-align:middle}';
  const s = document.createElement('style'); s.id = 'v493css'; s.textContent = css; (document.head || document.documentElement).appendChild(s);
 } catch (e) { fail('css', e); }
 const badge493 = () => '<i class="lt493">' + hwLeft() + '</i>';
 try {
  const R0 = PANEL_RENDER.shop17;
  if (typeof R0 === 'function') PANEL_RENDER.shop17 = function () {
   colTick(); hwTick();
   const h = R0.apply(this, arguments);
   if (off() || typeof h !== 'string' || !hwLive()) return h;
   try {
    const i = h.indexOf('id="hw16tile"');
    if (i < 0) return h;
    const j = h.indexOf('<b>HALLOWEEN PACK</b>', i);
    if (j < 0) return h;
    return h.slice(0, j) + '<b>HALLOWEEN PACK ' + badge493() + '</b>' + h.slice(j + 21);
   } catch (e) { fail('shop', e); return h; }
  };
  const H0 = PANEL_RENDER.hw17;
  if (typeof H0 === 'function') PANEL_RENDER.hw17 = function () {
   hwTick();
   const h = H0.apply(this, arguments);
   if (off() || typeof h !== 'string' || !hwLive()) return h;
   try { return h.replace('<div class="tt">HALLOWEEN PACK</div>', '<div class="tt">HALLOWEEN PACK ' + badge493() + '</div>'); } catch (e) { return h; }
  };
 } catch (e) { fail('render', e); }

 // ---------- 4. the New Orleans Ghosts for 1000 dimes (team only) ----------
 const GHO_COST = 1000, GU = [ 'uni21|GHO|2', 'uni21|GHO|3' ];
 const G = W0.GHO16;
 const ghoBought = () => { if (lsGet('gho493own', null)) return true; const S = ST(); return !!(S && S.gho493); };
 const hwOwn = () => { const S = ST(); return !!(S && S.hw2316); };
 V.ghoBought = ghoBought;
 if (G && typeof G.owned === 'function') {
  const O0 = G.owned;
  G.owned = function () { let r = false; try { r = O0.apply(this, arguments); } catch (e) {} return !!r || (!off() && ghoBought()); };
 }
 function buyGho() {
  if (off() || !G) return false;
  if (G.owned()) { toast17('YOU ALREADY HAVE THE NEW ORLEANS GHOSTS', '#7dff9a'); return false; }
  const S = ST();
  if (!S) return false;
  if ((+S.chinos || 0) < GHO_COST) { toast17('NOT ENOUGH DIMES - THE GHOSTS ARE ' + GHO_COST + ' DIMES', '#ff9a8a'); return false; }
  S.chinos -= GHO_COST;
  if (S.stats) S.stats.spent = (+S.stats.spent || 0) + GHO_COST;
  S.gho493 = Date.now();
  S.gho493had = GU.filter(id => S.inv && S.inv[id] > 0);
  lsSet('gho493own', S.gho493);
  try { V17.save(); } catch (e) { fail('save', e); }
  try { SFX && SFX.cheer && SFX.cheer(); } catch (e) {}
  toast17('THE NEW ORLEANS GHOSTS ARE YOURS - PICK THEM IN N/A', '#7dff9a');
  note('ghosts bought');
  return true;
 }
 V.buyGho = buyGho; V.GHO_COST = GHO_COST;

 // ---------- steer: WHITE GHOST + SKELETON only with the Halloween pack ----------
 const uniOk = id => { const S = ST(); return !!(S && (S.hw2316 || S.inv && S.inv[id] > 0)); };
 V.paths = [
  'HALLOWEEN PACK buy (items17 buyHw): open only while the pack is live; after the countdown __rl_32hwOff turns it off',
  'v27 ghoMigrate: Halloween pack owners only (ST.hw2316) - unchanged',
  'v332 topUp stacks: Halloween pack owners only - unchanged',
  'title / World Games / Ultimate / college uniform rewards (items17 u1Unlock, v27 ultimate, college25 uniGrant): UNI21.itemId hands them a missing id for GHO 2/3 unless the save owns the pack',
  'any V17.grant(id): refused for GHO 2/3 unless the save owns the pack or already holds it',
  'card packs, challenges, crew, daily picks: already exclude Halloween (hw) items',
  'trades (trade24): only legend items + player cards, no uniforms',
  'safety net: a save that bought the Ghosts for dimes without the pack loses a GHO 2/3 it did not hold at purchase'
 ];
 try {
  const UN = W0.UNI21;
  if (UN && typeof UN.itemId === 'function') {
   const I0 = UN.itemId;
   UN.itemId = function (tid, k) {
    const id = I0.apply(this, arguments);
    try { if (!off() && GU.includes(id) && !uniOk(id)) { V.blocked.push('itemId ' + id); return id + '|x493'; } } catch (e) {}
    return id;
   };
  }
  const GR0 = V17.grant;
  if (typeof GR0 === 'function') V17.grant = function (id) {
   try { if (!off() && GU.includes(id) && !uniOk(id)) { V.blocked.push('grant ' + id); return; } } catch (e) {}
   return GR0.apply(this, arguments);
  };
 } catch (e) { fail('uniguard', e); }
 function strip() {
  try {
   if (off() || !ghoBought() || hwOwn()) return;
   const S = ST();
   if (!S || !S.inv) return;
   const had = Array.isArray(S.gho493had) ? S.gho493had : [];
   let n = 0;
   for (const id of GU) if (S.inv[id] > 0 && !had.includes(id)) { delete S.inv[id]; V.stripped.push(id); n++; }
   if (n) { try { V17.save(); } catch (e) {} note('stripped ' + n); }
  } catch (e) { fail('strip', e); }
 }

 // ---------- 1 + 4. the N/A tab: Ghosts + the six service teams ----------
 const VX = () => { try { return !W0.__rl_no489vets && W0.VETS489 && VETS489.ids && VETS489.ids.length ? VETS489 : null; } catch (e) { return null; } };
 const gridOk = () => { try { return (screen === 'pickTeam' || screen === 'pickOpp') && menuSel && menuSel.mode !== 'season' && !(W0.RLNET && RLNET.lobby); } catch (e) { return false; } };
 const vetsOn = () => { const X = VX(); try { return !!X && gridOk() && (X.owns() || X.live()); } catch (e) { return false; } };
 const vetLocked = () => { const X = VX(); try { return !!X && screen === 'pickTeam' && menuSel.mode !== 'browse' && !X.owns(); } catch (e) { return false; } };
 // PRO: the service teams are not PRO teams any more
 try {
  if (W0.V33 && V33.proTiles) {
   const P0 = V33.proTiles;
   V33.proTiles = function () {
    if (off() || !VX()) return P0.apply(this, arguments);
    const k = W0.__rl_no489vets;
    W0.__rl_no489vets = true;
    try { return P0.apply(this, arguments); } finally { W0.__rl_no489vets = k; }
   };
  }
 } catch (e) { fail('pro', e); }
 const GREEN = '#7dff9a';
 let ask = false, lastDraw = 0;
 V.ask = () => ask;
 function lockIcon(cx, ly) {
  rect(cx - 4, ly + 5, 9, 7, '#ffcc33'); rect(cx - 3, ly, 7, 1, '#ffcc33'); rect(cx - 3, ly, 1, 5, '#ffcc33'); rect(cx + 3, ly, 1, 5, '#ffcc33');
 }
 const fitTxt = (s, w) => { try { return textW(s, 1) <= w; } catch (e) { return s.length * 4 <= w; } };
 function ghoTile(onPick, opts, cx, cy, cw, chh, live) {
  const tm = G.tm, own = G.owned(), taken = opts && opts.exclude === G.ID, mx = cx + Math.round(cw / 2);
  rect(cx, cy + 2, cw, chh, '#000');
  rect(cx, cy, cw, chh, '#141a22');
  rect(cx, cy, cw, 2, GREEN);
  badge(tm, mx - 20, cy + 6, 3);
  text(tm.name, mx, cy + 58, 1, '#fff', 'center');
  let ovr = '';
  try { ovr = typeof teamOvr === 'function' ? teamOvr(G.ID, 'real') : ''; } catch (e) {}
  const s1 = own ? taken ? 'TAKEN BY THE OTHER PLAYER' : fitTxt('LEGENDS FROM BEYOND - OVR ' + ovr, cw - 4) ? 'LEGENDS FROM BEYOND - OVR ' + ovr : 'LEGENDS - OVR ' + ovr : 'LOCKED';
  text(s1, mx, cy + 67, 1, own ? '#9affb4' : '#ff9a8a', 'center');
  if (!own) {
   g.globalAlpha = .55; rect(cx, cy, cw, chh, '#05060a'); g.globalAlpha = 1;
   lockIcon(mx, cy + 17);
   text('TEAM ONLY: ' + GHO_COST + ' DIMES', mx, cy + 76, 1, '#ffcc33', 'center');
   text(fitTxt('NO GHOST WHITE / SKELETON UNI', cw - 4) ? 'NO GHOST WHITE / SKELETON UNI' : 'NO UNIFORMS INCLUDED', mx, cy + 85, 1, '#ff9a3a', 'center');
   if (chh > 102) text('TAP TO BUY THE TEAM', mx, cy + 94, 1, '#cfe', 'center');
   if (live) hit('TEAM-' + G.ID, cx, cy, cw, chh, () => { ask = true; }, tm.name + ' (LOCKED) - BUY FOR ' + GHO_COST + ' DIMES');
   return;
  }
  if (!taken && live) hit('TEAM-' + G.ID, cx, cy, cw, chh, () => onPick(G.ID), tm.name);
 }
 function vetTile(tm, onPick, cx, cy, cw, chh, lk, live) {
  const mx = cx + Math.round(cw / 2);
  rect(cx, cy + 2, cw, chh, '#000');
  rect(cx, cy, cw, chh, '#1a2430');
  let ac = tm.c1;
  try { if (typeof accent === 'function') ac = accent(tm); } catch (e) {}
  rect(cx, cy, cw, 2, ac);
  badge(tm, mx - 13, cy + 5, 2);
  const nm = fitTxt(tm.name, cw - 2) ? tm.name : tm.abbr || tm.id;
  text(nm, mx, cy + 39, 1, '#fff', 'center');
  text('VETERANS DAY', mx, cy + 47, 1, '#7f9aa6', 'center');
  rect(cx + cw - 7, cy + 3, 2, 5, '#c8102e'); rect(cx + cw - 5, cy + 3, 2, 5, '#ffffff'); rect(cx + cw - 3, cy + 3, 2, 5, '#1c3f8c');
  if (lk) {
   g.globalAlpha = .55; rect(cx, cy, cw, chh, '#05060a'); g.globalAlpha = 1;
   lockIcon(mx, cy + Math.max(2, Math.round(chh / 2) - 8));
   if (live) hit('TEAM-' + tm.id, cx, cy, cw, chh, () => toast17('VETERANS DAY TEAMS: IN THE HONOR PACK (YARD SALE)', '#ffd84d'), tm.name + ' (LOCKED)');
   return;
  }
  if (live) hit('TEAM-' + tm.id, cx, cy, cw, chh, () => onPick(tm.id), tm.name);
 }
 function askBox() {
  const S = ST(), have = S ? (+S.chinos || 0) : 0, bw = Math.min(W - 24, 250), bh = 104, bx = Math.round(W / 2 - bw / 2), by = 30, mx = Math.round(W / 2);
  g.globalAlpha = .72; rect(0, 0, W, H, '#000'); g.globalAlpha = 1;
  rect(bx - 2, by - 2, bw + 4, bh + 4, '#000');
  rect(bx, by, bw, bh, '#141a22');
  rect(bx, by, bw, 2, GREEN);
  text('NEW ORLEANS GHOSTS - TEAM ONLY', mx, by + 8, 1, '#ffe14d', 'center');
  text(GHO_COST + ' DIMES - YOU HAVE ' + have, mx, by + 20, 1, have >= GHO_COST ? '#e8f4f6' : '#ff9a8a', 'center');
  text('YOU GET THE TEAM TO PLAY AS (ON + OFFLINE).', mx, by + 32, 1, '#e8f4f6', 'center');
  text('GHOST WHITE + SKELETON UNIFORMS', mx, by + 44, 1, '#ff9a3a', 'center');
  text('ARE NOT INCLUDED.', mx, by + 54, 1, '#ff9a3a', 'center');
  button('BACK', bx + 12, by + bh - 28, 70, 19, () => { ask = false; }, { bg: '#c9d6d9' });
  button('YES BUY', bx + bw - 92, by + bh - 28, 80, 19, () => { ask = false; buyGho(); }, { bg: have >= GHO_COST ? '#ffd23a' : '#3a4a55', fg: have >= GHO_COST ? '#0b1a20' : '#cfe' });
 }
 function naGrid(onPick, opts) {
  const t = Date.now();
  if (t - lastDraw > 600) ask = false;
  lastDraw = t;
  const live = !ask;
  let vets = [];
  if (vetsOn()) vets = VX().ids.map(id => T(id)).filter(tm => tm && tm.id !== opts.exclude && (!opts.only || opts.only.includes(tm.id)));
  if (!vets.length) {
   const cw = 150, chh = 92;
   ghoTile(onPick, opts, Math.round(W / 2 - cw / 2), 30, cw, chh, live);
  } else {
   const gx = 8, gy = 26, gw = 118, gh = 112;
   ghoTile(onPick, opts, gx, gy, gw, gh, live);
   const vx0 = gx + gw + 6, avail = W - 8 - vx0, cols = 3, gap = 3, cw = Math.floor((avail - gap * (cols - 1)) / cols), chh = Math.floor((gh - gap) / 2);
   const lk = vetLocked();
   vets.forEach((tm, i) => vetTile(tm, onPick, vx0 + i % cols * (cw + gap), gy + Math.floor(i / cols) * (chh + gap), cw, chh, lk, live));
   text(lk ? 'VETERANS DAY TEAMS: IN THE HONOR PACK' : 'VETERANS DAY TEAMS', Math.round(vx0 + avail / 2), H - 20, 1, '#ffd84d', 'center', '#000');
  }
  if (ask) askBox();
 }
 if (G && typeof G.grid === 'function') {
  const GG0 = G.grid;
  G.grid = function (onPick, opts) {
   if (off()) return GG0.apply(this, arguments);
   try { return naGrid(onPick, opts || {}); } catch (e) { fail('grid', e); ask = false; return GG0.apply(this, arguments); }
  };
 }


 // ---------- 1:32 PM: dime-bought Ghosts can be picked ONLINE ----------
 // Only inside the online season team-pick checks does V17.hw16.owned() say yes for a dime buyer.
 let olScope = 0;
 V.olCalls = 0;
 const olOk = () => !off() && !W0.__rl_no497ol && ghoBought();
 try {
  const HW = V17.hw16;
  if (HW && typeof HW.owned === 'function' && !HW.owned.__v497) {
   const HO0 = HW.owned;
   const HO1 = function () {
    const r = HO0.apply(this, arguments);
    if (r) return r;
    try {
     if (!olOk()) return r;
     if (olScope > 0) { V.olCalls++; return true; }
     // the v35 'N/A TEAMS?' ask (naTick) on the online season team screen only
     if (screen === 'onSeasonTeam' && /naTick/.test(String(new Error().stack || ''))) { V.olCalls++; return true; }
    } catch (e) {}
    return r;
   };
   HO1.__v497 = true;
   HW.owned = HO1;
  }
 } catch (e) { fail('ol-own', e); }
 function olHook() {
  try {
   const TT = W0.T232;
   if (!TT || typeof TT.pickOpts !== 'function' || TT.pickOpts.__v497) return;
   const P0 = TT.pickOpts;
   const P1 = function () {
    olScope++;
    try { return P0.apply(this, arguments); } finally { olScope--; }
   };
   for (const k of Object.keys(P0)) P1[k] = P0[k];
   P1.__v497 = true;
   TT.pickOpts = P1;
  } catch (e) { fail('ol-pick', e); }
 }
 olHook();
 V.olHook = olHook;
 // ---------- one light timer ----------
 setInterval(() => { try { colTick(); hwTick(); strip(); olHook(); } catch (e) {} }, 2000);
 note('ready');
})();
