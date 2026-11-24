/* v590fix.js - 1.5 fix list (Open issues "Next update") + the RUN OUTS locker tab (board 1.5-7) + THE FLYING DUTCHMAN (1.5-8).
 * 1) Braids in the lobby: front-facing frames drew braids on both sides of the head. Cause: lobbyBake's front braid pass.
 *    Fix: front-facing lobby frames bake without braids (side frames keep them).
 * 2) Reactive kits in the lobby (Ghosts SKELETON green parts, SPACE FORCE GALAXY animation) only showed with an item on.
 *    Cause: the item path (V17.bakeGear) keys its cache on kit.g27, the plain lobby bake (lobbyBake0) does not, so the first
 *    phase / first special look was cached and reused. Fix: kits with a g27 look skip that cache (RL12.bake keys on g27).
 * 3) Custom packs: a COLLAB (Good Stick) card could replace a custom card (v538 swaps 10% of player slots in every pack).
 *    Fix: custom pack slots are restored after every pack hook; collab cards never stay in a custom pack.
 *    Regular packs: N/A team players with cards (Veterans, Turkey Trotters, Ghosts) can now drop, rarer (3% per player slot).
 * 4) FREE LEGENDARY PACK ad row: shows the real legendary pack art next to it like the other shop rows.
 * 5) MY TEAMS: card teams are listed in LOCKER ROOM > MY TEAMS; quick play's SEASON TEAMS button becomes MY TEAMS
 *    (same list as the locker tab; picking one puts it on your quick-play home team and comes back).
 * 6) Locker tabs in one clear order: ALL, MY TEAMS, CARDS, UNIFORMS | STICKS, HELMETS + VISORS, COLLARS, CHEST, SHORTS,
 *    CLEATS, TAPE | CELLYS, CHIRPS, RUN OUTS, STADIUMS | TROPHIES, ACHIEVEMENTS.
 * 7) RUN OUTS tab: THE FLYING DUTCHMAN (free) + the 1.4 entrances (Honor Pack). Tap one = your team runs out on it before
 *    the opening faceoff of an offline game (uses v490entr's own player; the Dutchman is drawn over the landing ship).
 * 8) Ghost uniforms (WHITE GHOST / SKELETON): a leather-helmet item no longer turns their helmet brown (black + white
 *    like before) - items17 v582 fix 5 now skips the helmet on those two kits (core one-liner, same switch).
 * New storage key: rl_run15 (picked run out). Kill switch: window.__rl_no590fix (each part also: __rl_no590fixN).
 */
(function () {
 'use strict';
 const Wn = window;
 const offF = n => !!(Wn.__rl_no590fix || Wn['__rl_no590fix' + n] || Wn.__rl_v124gb);
 const F = Wn.FIX590 = { err: [] };
 const fail = (w, e) => { if (F.err.length < 30) F.err.push(w + ': ' + String(e && e.message || e).slice(0, 200)); };
 // ---------- 1 + 2: lobby bakes ----------
 if (typeof Wn.lobbyBake === 'function' && typeof Wn.lobbyBake0 === 'function') {
  const lb0 = Wn.lobbyBake;
  Wn.lobbyBake = function (name, kit, skin, gray, flip) {
   try { if (!offF(1) && !(kit && kit.fit45 && !Wn.__rl_no597fit) && typeof braidFront2402 === 'function' && braidFront2402(name)) return Wn.lobbyBake0(name, kit, skin, gray, flip); } /* 1.5e: never for Crown / Whale - this shortcut skipped the fit bake, so EQUIP showed nothing */ catch (e) { fail('braid', e); }
   return lb0.apply(this, arguments);
  };
  const b00 = Wn.lobbyBake0;
  Wn.lobbyBake0 = function (name, kit, skin, gray, flip) {
   try {
    if (!offF(2) && kit && kit.g27 && !gray) {
     if (Wn.__v17hp && Wn.V17) { const c17 = V17.bakeHero(name, kit, skin, gray, flip); if (c17) return c17; }
     return RL12.bake(name, kit, !!flip, skin);
    }
   } catch (e) { fail('g27', e); }
   return b00.apply(this, arguments);
  };
 }
 // ---------- 3: packs ----------
 const isCollab = cid => /(?:^|[|:_~])GSC-\d+$/.test(String(cid || ''));
 let naC = null, naT = 0;
 function naPool() { const t = Date.now(); if (naC && t - naT < 1000) return naC; naT = t; return (naC = naPool0()); }
 function naPool0() {
  const out = [];
  // 1.5c: every N/A team that is live (GH_REG: Veterans, Ghosts, Good Stick, any later set) + Turkey Trotters; collab (Good Stick)
  // cards drop from REGULAR packs at the 3% N/A rate too - custom packs never get them (cu38 is handled before this pool is used)
  const teams = [...new Set(['VTARM', 'VTNAV', 'VTAF', 'VTMAR', 'VTCG', 'VTSF', 'TKT', 'GHO'].concat(typeof GH_REG !== 'undefined' ? Object.keys(GH_REG) : []))];
  // Charlie: TURKEY TROTTERS cards are ALWAYS in the 3% N/A drop, for everyone (pack owned or not)
  try { if (!Wn.__rl_no596tkt) for (const id in PLAYERS) { const p = PLAYERS[id]; if (p && p.tk565 && !p.leg && !(Wn.V22 && V22.owned && V22.owned(id))) out.push(id); } } catch (e) {}
  try { for (const t of teams) { if (t === 'TKT' && !Wn.__rl_no596tkt) continue; const tm = T(t); if (tm && tm.id === t) for (const id of tm.roster || []) { const p = PP(id); if (p && !p.leg && (!isCollab(id) || !Wn.__rl_no595gsc) && !(Wn.V22 && V22.owned && V22.owned(id))) out.push(id); } } } catch (e) { fail('na', e); }
  return out;
 }
 // Charlie: N/A ITEMS THAT AFFECT PLAY can drop rarely from regular packs (same 3% rate, same rarity as the slot they replace).
 // Decided from each item's own data, never a hand list: N/A = tied to an N/A set (Veterans v491/x489/vets489, Turkey tk565,
 // Ghosts/Halloween hw, Good Stick gsc); affects play = has stat effects (eff), a stick break chance (brk) different from the regular stick's, or is a crew coach.
 // Never: cosmetics (cellys, chirps, uniforms, run outs, tape/collars with no effect), reward-only / shop-exclusive families
 // (trophies, legacy, stadiums, pass / tew25 / b35 / lg2313 rewards, team unlock tokens).
 const naSet = it => !!(it.v491 || it.x489 || it.vets489 || it.tk565 || it.hw || /(^|_)gsc(_|$)/.test(it.id));
 const excluded = it => !!(it.trophy || it.leg20 || it.st28 || it.tew25 || it.b35 || it.lg2313 || it.j1 || it.sec === 'tk565team' || it.sec === 'legacy' || it.sec === 'trophy' || it.sec === 'st28');
 const brk0 = () => { try { return V17.BY.stick_reg.brk; } catch (e) { return .05; } }; // the regular stick's break chance = no play effect
 const playFx = it => !!((it.eff && typeof it.eff === 'object' && Object.keys(it.eff).length) || (typeof it.brk === 'number' && it.brk !== brk0()) || it.crew);
 let npC = null, npN = -1;
 const naPlayItems = () => { try { if (npC && npN === V17.I.length) return npC; npN = V17.I.length; return (npC = V17.I.filter(it => it && naSet(it) && !excluded(it) && playFx(it))); } catch (e) { return []; } };
 Wn.V596NAITEMS = { list: () => naPlayItems().map(it => ({ id: it.id, sec: it.sec, rar: it.rar, why: it.eff ? 'eff ' + JSON.stringify(it.eff) : typeof it.brk === 'number' ? 'brk ' + it.brk : 'crew' })),
  cosmetic: () => { try { return V17.I.filter(it => it && naSet(it) && !(playFx(it) && !excluded(it))).map(it => it.id); } catch (e) { return []; } } };
 function wrapPacks() {
  if (!Wn.V27 || typeof V27.packCards !== 'function' || V27.packCards.__f590) return;
  const p0 = V27.packCards;
  const p1 = function (kind, cards, r) {
   const snap = Array.isArray(cards) ? cards.slice() : null;
   const n = p0.apply(this, arguments);
   try {
    if (offF(3) || !snap) return n;
    if (kind === 'cu38') { for (let i = 0; i < cards.length; i++) if (isCollab(cards[i]) && !isCollab(snap[i])) cards[i] = snap[i]; return n; }
    const rr = typeof r === 'function' ? r : Math.random, pool = naPool();
    if (pool.length) for (let i = 0; i < cards.length; i++) { const c = cards[i]; if (typeof c === 'string' && c.indexOf('pc27|') === 0 && !isCollab(c) && rr() < .03) cards[i] = V27.cardItem(pool[Math.floor(rr() * pool.length) % pool.length]); }
    if (!Wn.__rl_no596naitem && !/^pc38/.test(kind)) { // N/A play items: an item slot becomes one of the same rarity (a category pack keeps its own kind of item)
     const NA = naPlayItems(), P = V17.PACKS && V17.PACKS[kind], cat = P && P.cat;
     if (NA.length && (!cat || cat === 'stick' || cat === 'gear')) for (let i = 0; i < cards.length; i++) {
      const it = typeof cards[i] === 'string' ? V17.BY[cards[i]] : null; if (!it || naSet(it) || rr() >= .03) continue;
      const L = NA.filter(x => x.rar === it.rar && (!cat || (cat === 'stick' ? x.sec === 'stick' : x.sec !== 'stick' && x.sec !== 'fostick')));
      if (L.length) cards[i] = L[Math.floor(rr() * L.length) % L.length].id;
     }
    }
   } catch (e) { fail('pack', e); }
   return n;
  };
  for (const k of Object.keys(p0)) { try { p1[k] = p0[k]; } catch (e) {} }
  p1.__f590 = 1; V27.packCards = p1;
  if (Wn.V38P && typeof V38P.open === 'function' && !V38P.open.__f590) { const o0 = V38P.open; V38P.open = function (kind) { const out = o0.apply(this, arguments); try { if (!offF(3) && kind === 'cu38' && Array.isArray(out)) return out.filter(c => !isCollab(c)); } catch (e) {} return out; }; V38P.open.__f590 = 1; }
 }
 setTimeout(wrapPacks, 0); setTimeout(wrapPacks, 800);
 // ---------- 4: legendary pack art on the ad row ----------
 setInterval(() => {
  try {
   if (offF(4)) return; const t = document.getElementById('ad514leg'); if (!t || t.querySelector('.f590leg')) return;
   const im = document.createElement('img'); im.className = 'f590leg'; im.alt = 'LEGENDARY PACK'; im.src = V17.packUrl('legendary');
   im.style.cssText = 'width:30px;height:auto;image-rendering:pixelated;flex:0 0 auto;filter:drop-shadow(0 0 4px rgba(255,204,51,.7))';
   t.insertBefore(im, t.firstChild);
  } catch (e) {}
 }, 400);
 // ---------- 5: MY TEAMS (card teams) + quick play button ----------
 const cts = () => { try { return (V33.D.pro || []).concat(V33.D.col || []).filter(t => SZ_REG[t.id]); } catch (e) { return []; } };
 let mytBack = null;
 function pickCT(id) {
  try { LS.set('qteam16', id); setHome172('quick'); lobby.pid = null; lobby.key = ''; } catch (e) { fail('ct', e); }
  if (mytBack) { const b = mytBack; mytBack = null; screen = b; panelDirty(); return; }
 }
 const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 function addCT(root) {
  if (offF(5) || !root) return false;
  let gr = root.querySelector('.myt29g'); if (!gr && Wn.V29R && V29R.myt && V29R.myt()) { const l = root.querySelector('#lockList'); const nt = l && [...l.querySelectorAll('.note')].find(n => /NO SAVED TEAMS/.test(n.textContent)); if (nt) { gr = document.createElement('div'); gr.className = 'myt29g'; nt.replaceWith(gr); } } if (!gr || gr.querySelector('.ct590')) return false;
  const L = cts(); if (!L.length) return false;
  const tp = document.createElement('template');
  tp.innerHTML = L.map(t => { const tm = SZ_REG[t.id]; return '<button type="button" class="myt29 w ct590" data-a="f590ct" data-v="' + esc(t.id) + '" aria-label="' + esc(tm.name) + ' CARD TEAM"><i style="background:' + esc(tm.c1 || '#2cc4dc') + '"></i><b>' + esc(tm.name) + '</b><small>CARD TEAM - ' + tm.roster.length + ' CARDS</small></button>'; }).join('');
  gr.appendChild(tp.content); return true;
 }
 PANEL_ACT.f590ct = v => { pickCT(v); };
 if (Wn.V29R && typeof V29R.mytPick === 'function') { const mp0 = V29R.mytPick; V29R.mytPick = function () { const r = mp0.apply(this, arguments); try { if (mytBack) { const b = mytBack; mytBack = null; screen = b; panelDirty(); } } catch (e) {} return r; }; }
 if (typeof Wn.szDrop2314a === 'function') {
  const sd0 = Wn.szDrop2314a;
  Wn.szDrop2314a = function (by, onPick, world, ents) {
   if (offF(5) || world || !(Wn.V29R && V29R.mytOn && V29R.mytOn()) || /^on/.test(typeof screen !== 'undefined' ? screen : '')) return sd0.apply(this, arguments); // online pickers keep their own SEASON TEAMS list (it sends the team over the wire)
   try {
    if (!(ents && ents.length) && !cts().length) return sd0.apply(this, arguments);
    const lab = 'MY TEAMS', bw = textW('SEASON TEAMS') + 22;
    button(lab, 70, by, bw, 19, () => { mytBack = screen; try { V17.openLocker(); } catch (e) { screen = 'locker17'; } setTimeout(() => { try { PANEL_ACT.v29myt(); panelDirty(); } catch (e) {} }, 0); }, { bg: '#ffd23a' });
    DD2314 = null;
   } catch (e) { fail('qp', e); return sd0.apply(this, arguments); }
  };
 }
 // ---------- 8: the MORE > hint never sits over a readable tab: solid fade + room to scroll the last tab clear ----------
 { const st = document.createElement('style'); st.textContent = '#panel .row.tabs{padding-right:76px!important}#panel .u578more{background:linear-gradient(90deg,rgba(8,14,20,0),rgba(8,14,20,1) 28%)!important}'; document.head.appendChild(st); }
 // ---------- 6 + 7: locker tabs + RUN OUTS ----------
 let RUN = false;
 const RS = (() => { try { return JSON.parse(localStorage.getItem('rl_run15') || 'null') || { on: null }; } catch (e) { return { on: null }; } })();
 const saveRS = () => { try { localStorage.setItem('rl_run15', JSON.stringify(RS)); } catch (e) {} };
 const RUNS = [['dutch', 'THE FLYING DUTCHMAN', 'FREE'], ['airforce', 'FIGHTER JET', 'HONOR PACK'], ['army', 'TANKS', 'HONOR PACK'], ['spaceforce', 'ROCKET', 'HONOR PACK'], ['navy', 'LANDING SHIP', 'HONOR PACK'], ['marines', 'TRANSPORT HELI', 'HONOR PACK'], ['coastguard', 'RESCUE HELI', 'HONOR PACK']];
 // 1.5 B75 (Charlie approved): THE FLYING DUTCHMAN unlocks when your FIRST Locker League match ends (bot or player, win or
 // lose). Saved as rl_dutch75 (an rl_ key = it rides the cloud save); set once, never removed. Before that: LOCKED in RUN OUTS
 // ('PLAY AN ONLINE MATCH TO UNLOCK') and it never plays. On unlock: one popup + it goes on if no run out was picked.
 // Kill switch: window.__rl_no75dutch (= the old free Dutchman)
 const DK75 = 'rl_dutch75';
 const dutchOn = () => { if (Wn.__rl_no75dutch) return true; try { return !!localStorage.getItem(DK75); } catch (e) { return false; } };
 const runOwned = k => k === 'dutch' ? dutchOn() : !!(Wn.VETS489 && VETS489.owns && VETS489.owns());
 const ORDER = ['all', 'v29myt', 'legacy', 'uni', '|', 'stick', 'fostick', 'helmet', 'collar', 'chest', 'legs', 'cleats', 'tape', '|', 'celly', 'chirp', 'run15', 'st28', 'cload', '|', 'trophy', 'ach'];
 function tabKey(b) { const a = b.getAttribute('data-a'), v = b.getAttribute('data-v'); return a === 'v17sec' ? v : a === 'v29myt' ? 'v29myt' : a === 'f590run' ? 'run15' : a; }
 function reorderTabs(root) {
  const row = root.querySelector('.row.tabs'); if (!row || row.__f590) return;
  const btns = [...row.querySelectorAll('button')];
  if (!btns.some(b => b.getAttribute('data-a') === 'f590run')) { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-a', 'f590run'); b.className = RUN ? 'on' : 'd'; b.textContent = 'RUN OUTS'; btns.push(b); }
  const seps = [...row.children].filter(n => n.tagName !== 'BUTTON');
  const known = new Map(btns.map(b => [tabKey(b), b]));
  const frag = document.createDocumentFragment(); let sepI = 0, used = new Set();
  for (const k of ORDER) { if (k === '|') { const s = seps[sepI++]; if (s) frag.appendChild(s); continue; } const b = known.get(k); if (b) { frag.appendChild(b); used.add(b); } }
  btns.forEach(b => { if (!used.has(b)) frag.insertBefore(b, frag.lastChild); });
  seps.slice(sepI).forEach(s => s.remove());
  if (RUN) [...frag.querySelectorAll('button')].forEach(b => { if (b.getAttribute('data-a') === 'f590run') b.className = 'on'; else if (b.classList.contains('on')) { b.classList.remove('on'); b.classList.add('d'); } });
  row.innerHTML = ''; row.appendChild(frag); row.__f590 = 1;
 }
 function runHtml() {
  const n = RUNS.filter(r => runOwned(r[0])).length;
  return '<div class="sec17"><div class="sh17">RUN OUTS <span>' + n + ' / ' + RUNS.length + '</span></div><div class="det17" style="margin:2px 0 4px">YOUR TEAM SHOWS UP ON IT BEFORE THE OPENING FACEOFF. TAP ONE = THAT RUN OUT IS ON. TAP IT AGAIN = OFF. TAP THE GAME = SKIP. OFFLINE GAMES.</div><div class="grid17">' +
   RUNS.map(r => { const own = runOwned(r[0]), on = own && RS.on === r[0]; return '<button type="button" class="c17 uni17' + (own ? '' : ' lk') + (on ? ' wr17' : '') + '" data-a="f590runp" data-v="' + r[0] + '" aria-label="' + r[1] + (on ? ' (ON)' : own ? '' : ' (LOCKED)') + '"><div class="art" style="display:flex;align-items:center;justify-content:center;background:radial-gradient(#1d3a48,#071018)"><img alt="" src="' + runArt(r[0]) + '" style="max-width:92%;max-height:92%;image-rendering:pixelated' + (own ? '' : ';filter:grayscale(1) brightness(.6)') + '"></div><div class="nm">' + r[1] + '</div><div class="rr">' + (on ? 'ON' : own ? 'TAP = ON' : 'LOCKED') + '</div><small class="wh17" style="color:' + (own ? '#7dff7a' : '#ff9a8a') + '">' + (r[0] === 'dutch' && !own ? 'PLAY AN ONLINE MATCH TO UNLOCK' : r[0] === 'dutch' ? 'UNLOCKED' : r[2]) + '</small></button>'; }).join('') + '</div></div>';
 }
 function decorate(root) {
  if (offF(6) || !root) return false;
  if (!root.querySelector('.row.tabs')) return false;
  reorderTabs(root);
  if (RUN) { root.querySelectorAll('[data-a="v17unig"]').forEach(c => { const row = c.closest('.row') || c.parentElement; if (row && !row.classList.contains('tabs')) row.style.display = 'none'; else c.style.display = 'none'; }); }
  if (RUN) { const l = root.querySelector('#lockList'); if (l && !l.querySelector('.f590runs')) { l.innerHTML = '<div class="f590runs">' + runHtml() + '</div>'; } [...root.querySelectorAll('.det17')].forEach(d => { if (!d.closest('#lockList')) d.style.display = 'none'; }); }
  addCT(root);
  return true;
 }
 function wrapLocker() {
  const cur = PANEL_RENDER.locker17; if (typeof cur !== 'function' || cur.__f590) return;
  const f = function () { const h = cur.apply(this, arguments); if (offF(6) || typeof h !== 'string') return h; try { const tp = document.createElement('template'); tp.innerHTML = h; decorate(tp.content); return tp.innerHTML; } catch (e) { fail('lock', e); return h; } };
  f.__f590 = 1; PANEL_RENDER.locker17 = f;
 }
 setTimeout(wrapLocker, 200); Wn.addEventListener('load', () => setTimeout(wrapLocker, 300));
 setInterval(() => { try { if (screen === 'locker17') { wrapLocker(); const p = document.getElementById('panel'); if (p) { const row = p.querySelector('.row.tabs'); if (row && !row.__f590) decorate(p); else addCT(p); } } } catch (e) {} }, 400);
 PANEL_ACT.f590run = () => { RUN = true; };
 PANEL_ACT.f590runp = v => { if (!runOwned(v)) { try { V17.toast && V17.toast(v === 'dutch' ? 'PLAY AN ONLINE MATCH TO UNLOCK' : 'GET THE HONOR PACK FOR THIS RUN OUT', '#ffb14d'); } catch (e) {} return; } RS.on = RS.on === v ? null : v; saveRS(); };
 if (typeof PANEL_ACT.v17sec === 'function') { const s0 = PANEL_ACT.v17sec; PANEL_ACT.v17sec = function () { RUN = false; return s0.apply(this, arguments); }; }
 if (typeof PANEL_ACT.v29myt === 'function') { const m0 = PANEL_ACT.v29myt; PANEL_ACT.v29myt = function () { RUN = false; return m0.apply(this, arguments); }; }
 // ---------- the run out in a game: v490's own test hook for YOUR team; the Dutchman rides v490's landing ship ----------
 let forced = null, forcedG = null;
 setInterval(() => {
  try {
   if (offF(7)) return;
   const G = typeof game !== 'undefined' ? game : null, ok = G && !G.online && !G.tutorial && !G.practice && !(G.meta && G.meta.online) && RS.on && runOwned(RS.on);
   if (ok && !forced && (screen === 'pregame' || screen === 'live' || screen === 'walk')) { forced = RS.on; forcedG = G; Wn.__rl490force = RS.on === 'dutch' ? 'navy' : RS.on; Wn.__f590dutch = RS.on === 'dutch'; }
   // 1.5f BUG (Charlie: ARMY team + Dutchman equipped): the entrance used the Dutchman but the EXIT used the Army tanks.
   // Cause: the equipped run out was dropped as soon as the screen hit 'final' - and v490 starts the exit ON 'final', so the
   // exit fell back to the team's own branch. Fix: keep it until that game's exit has played (or a new game / the menu).
   const keep = !Wn.__rl_no598exit && G && G === forcedG && screen === 'final' && G.e490out !== 'done';
   if ((!G || screen === 'menu' || (screen === 'final' && !keep) || (forcedG && G !== forcedG)) && forced) { forced = null; forcedG = null; Wn.__rl490force = undefined; Wn.__f590dutch = false; }
  } catch (e) {}
 }, 300);
 // ---- B75: unlock at the end of the first Locker League match + the one-time popup ----
 let pop75 = false;
 setInterval(() => {
  try {
   if (Wn.__rl_no75dutch) return;
   const G = typeof game !== 'undefined' ? game : null;
   const ll = G && (G.meta && G.meta.ll15 || G.online && Wn.RLNET && RLNET.st && RLNET.st.ll15);
   if (ll && screen === 'final' && !dutchOn()) {
    try { localStorage.setItem(DK75, JSON.stringify({ t: Date.now(), v: '1.5 B75' })); } catch (e) {}
    try { localStorage.setItem(DK75 + 'p', '1'); } catch (e) {} // the popup is still owed (survives a closed app)
    if (!RS.on) { RS.on = 'dutch'; saveRS(); }
    F.dutch75 = (F.dutch75 | 0) + 1;
   }
   let owed = false; try { owed = !!localStorage.getItem(DK75 + 'p'); } catch (e) {}
   if (owed && !pop75 && (screen === 'gear17' || screen === 'menu') && !(G && screen === 'final') && !document.querySelector('.pop17:not([hidden]),#tp598,#ss597')) showPop75();
  } catch (e) { fail('d75', e); }
 }, 600);
 function showPop75() {
  pop75 = true;
  const d = document.createElement('div'); d.id = 'pop75';
  d.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(3,6,9,.82);display:flex;align-items:center;justify-content:center;font-family:' + (getComputedStyle(document.getElementById('panel') || document.body).fontFamily || 'monospace');
  let src = ''; try { src = ship(0).toDataURL(); } catch (e) {}
  d.innerHTML = '<div style="background:#0b1a20;border:2px solid #7dff7a;padding:12px 16px;max-width:86vw;text-align:center;color:#e8f4f6"><div style="color:#7dff7a;font-size:18px;letter-spacing:1px">THE DUTCHMAN RISES</div><div style="color:#ffe14d;font-size:13px;margin:2px 0 8px">RUN OUT UNLOCKED</div>' +
   '<div style="background:radial-gradient(#1d3a48,#071018);padding:8px;margin:0 auto 8px;width:min(260px,60vw)"><img alt="THE FLYING DUTCHMAN" src="' + src + '" style="width:100%;image-rendering:pixelated;animation:d75b 2.4s ease-in-out infinite"></div>' +
   '<div style="font-size:11px;margin-bottom:10px">' + (RS.on === 'dutch' ? 'IT IS ON: YOUR TEAM SAILS IN ON IT BEFORE THE OPENING FACEOFF.' : 'TURN IT ON IN THE LOCKER ROOM - RUN OUTS.') + '</div>' +
   '<button type="button" style="font:inherit;background:#7dff7a;color:#0b1a20;border:0;padding:6px 22px;font-size:14px" aria-label="OK">OK</button></div>' +
   '<style>@keyframes d75b{0%,100%{transform:translateY(2px)}50%{transform:translateY(-3px)}}</style>';
  d.querySelector('button').onclick = () => { try { localStorage.removeItem(DK75 + 'p'); } catch (e) {} d.remove(); };
  document.body.appendChild(d); F.pop75 = (F.pop75 | 0) + 1;
 }
 F.dutchOn = dutchOn;
 // ---- The Flying Dutchman art (original ghost galleon: tattered sails, glowing gun ports, gold trim; no skull, no real flag) ----
 function art(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2; const x = c.getContext('2d');
  const P = { r(a, b, ww, hh, col) { x.fillStyle = col; x.fillRect(a + 1, b + 1, ww, hh); }, p(pts, col) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const q of pts) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); } x.fillStyle = col; for (let yy = Math.floor(y0); yy <= Math.ceil(y1); yy++) for (let xx = Math.floor(x0); xx <= Math.ceil(x1); xx++) { const px0 = xx + .5, py0 = yy + .5; let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a[1] > py0) !== (b[1] > py0) && px0 < (b[0] - a[0]) * (py0 - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins; } if (ins) x.fillRect(xx + 1, yy + 1, 1, 1); } }, clr(a, b, ww, hh) { x.clearRect(a + 1, b + 1, ww, hh); } };
  fn(P);
  const im = x.getImageData(0, 0, c.width, c.height), d = im.data, W2 = c.width, H2 = c.height, o = new Uint8Array(W2 * H2);
  for (let i = 0; i < W2 * H2; i++) o[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  for (let yy = 0; yy < H2; yy++) for (let xx = 0; xx < W2; xx++) { const i = yy * W2 + xx; if (o[i]) continue; if ((xx > 0 && o[i - 1]) || (xx < W2 - 1 && o[i + 1]) || (yy > 0 && o[i - W2]) || (yy < H2 - 1 && o[i + W2])) { d[i * 4] = 6; d[i * 4 + 1] = 20; d[i * 4 + 2] = 15; d[i * 4 + 3] = 255; } }
  x.putImageData(im, 0, 0); return c;
 }
 function sail(P, x0, y0, w, h, seed) { P.p([[x0, y0], [x0 + w, y0], [x0 + w + 2, y0 + h * .5], [x0 + w, y0 + h], [x0, y0 + h], [x0 - 2, y0 + h * .5]], '#cfeedd'); P.r(x0, y0 + 1, 2, h - 1, '#9fd8bd'); P.r(x0 + Math.round(w * .55), y0 + 1, 2, h - 2, '#b5e6cf'); for (let i = 0; i < w; i += 3) if ((i + seed) % 2) P.clr(x0 + i, y0 + h - 1, 2, 1 + ((i * 7 + seed) % 3)); P.clr(x0 + 3 + seed % 5, y0 + 4 + seed % 4, 2, 2); P.clr(x0 + w - 6, y0 + h - 7, 3, 2); P.r(x0 - 1, y0 - 1, w + 2, 1, '#3a2e1e'); }
 const SHIP = {};
 function ship(ramp) {
  if (SHIP[ramp]) return SHIP[ramp];
  return (SHIP[ramp] = art(150, 66, P => {
   for (const mx of [40, 74, 106]) P.r(mx, 2, 2, 46, '#3a2e1e');
   sail(P, 30, 6, 22, 14, 1); sail(P, 28, 24, 26, 15, 2); sail(P, 62, 2, 26, 16, 3); sail(P, 60, 21, 30, 18, 4); sail(P, 96, 8, 22, 13, 5); sail(P, 94, 24, 26, 14, 6);
   P.p([[76, 0], [92, 2], [86, 4], [92, 6], [76, 7]], '#0e3329'); P.r(80, 2, 1, 4, '#c9a227'); P.r(79, 5, 3, 1, '#c9a227');
   P.p([[4, 44], [128, 44], [146, 34], [138, 58], [16, 64], [2, 54]], '#2a2418'); P.p([[4, 54], [138, 52], [138, 58], [16, 64], [2, 56]], '#1a1610');
   for (let i = 0; i < 4; i++) P.r(6, 47 + i * 4, 130 - i * 6, 1, '#3a3222');
   P.r(4, 44, 126, 2, '#c9a227'); P.r(2, 32, 30, 13, '#2a2418'); P.r(2, 32, 30, 2, '#c9a227'); P.r(6, 36, 22, 3, '#0e3329');
   for (let i = 0; i < 4; i++) P.r(7 + i * 6, 36, 3, 3, '#7dffb0');
   for (let i = 0; i < 9; i++) { P.r(22 + i * 12, 49, 4, 3, '#3dff8a'); P.r(23 + i * 12, 50, 2, 1, '#e9fff2'); }
   P.r(128, 36, 18, 1, '#3a2e1e'); P.r(140, 30, 10, 1, '#3a2e1e'); P.r(0, 26, 3, 6, '#3a2e1e'); P.r(-1, 24, 5, 3, '#3dff8a'); P.r(118, 40, 8, 4, '#c9a227');
   if (ramp) P.p([[122, 46], [148, 62], [148, 65], [120, 50]], '#5a4a30');
  }));
 }
 const ARTS = {};
 function runArt(k) {
  if (ARTS[k]) return ARTS[k];
  let u = '';
  try {
   const VA = Wn.V490 && V490.art, map = { airforce: 'jet', army: 'tank', spaceforce: 'rocket', navy: 'ship', marines: 'heliM', coastguard: 'heliC' };
   if (k === 'dutch') u = ship(0).toDataURL();
   else if (VA && VA[map[k]]) { const o = VA[map[k]](); u = (o.R || o).toDataURL(); }
   else { const c = document.createElement('canvas'); c.width = 40; c.height = 24; const x = c.getContext('2d'); const col = { airforce: '#8a96a6', army: '#4f5a2a', spaceforce: '#e6e8ec', navy: '#5a6a7a', marines: '#4f5a2a', coastguard: '#e8641c' }[k] || '#9aa';
    x.fillStyle = '#05080b'; x.fillRect(4, 9, 32, 9); x.fillStyle = col; x.fillRect(5, 10, 30, 7); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(5, 10, 30, 1);
    if (k === 'spaceforce') { x.fillStyle = '#05080b'; x.fillRect(17, 1, 7, 22); x.fillStyle = col; x.fillRect(18, 2, 5, 20); }
    if (k === 'marines' || k === 'coastguard') { x.fillStyle = '#05080b'; x.fillRect(2, 6, 36, 2); }
    if (k === 'airforce') { x.fillStyle = col; x.fillRect(14, 5, 6, 16); }
    u = c.toDataURL(); }
  } catch (e) { fail('art', e); }
  return (ARTS[k] = u);
 }
 F.ship = ship;
 // swap the landing ship (v490 navy vehicle, 128x48 canvas) for the Dutchman while it is the picked run out
 // 1.5f BUG (Charlie, season game): the CPU got the Dutchman too. Cause: the swap replaced EVERY 128x48 landing ship drawn,
 // so a CPU team that has its own NAVY run out (any team named NAVY, e.g. a college/season Navy) sailed in on the Dutchman.
 // Fix: only the player's side (v490 side 0, G.user) is swapped; v490 marks the side while it draws a vehicle. Kill: __rl_no598run
 const swap = di => function (im) {
  if (Wn.__f590dutch && !offF(7) && (Wn.__rl_no598run || Wn.__e490side === 0) && im && im.tagName === 'CANVAS' && im.width === 128 && im.height === 48 && arguments.length === 5) {
   const ramp = (() => { try { return im.getContext('2d').getImageData(124, 36, 1, 1).data[3] > 0 ? 1 : 0; } catch (e) { return 0; } })();
   const S = ship(ramp), [, dx, dy, dw, dh] = arguments, s = dw / 128, nw = S.width * s, nh = S.height * s, t = performance.now() / 1000;
   this.save();
   for (let i = 0; i < 7; i++) { this.fillStyle = 'rgba(61,255,138,' + (.10 + (i % 3) * .04) + ')'; this.fillRect(Math.round(dx + dw / 2 - nw / 2 - 10 + i * nw / 7 + Math.sin(t * 2 + i) * 3), Math.round(dy + dh - 8 * s - (i % 2) * 3), Math.round(nw / 5), 4 + (i % 3)); }
   this.globalAlpha *= .95; di.call(this, S, dx + dw / 2 - nw / 2, dy + dh - nh + 6 * s, nw, nh);
   for (let i = 0; i < 14; i++) { const ph = (t * .6 + i / 14) % 1, wx = dx + dw / 2 - nw / 2 + ((i * 53) % 100) / 100 * nw, wy = dy + dh - ph * nh * 1.1; this.globalAlpha = (1 - ph) * .7; this.fillStyle = i % 3 ? '#7dffb0' : '#e9fff2'; this.fillRect(Math.round(wx + Math.sin(ph * 6 + i) * 3), Math.round(wy), 1, 2); }
   this.restore(); return;
  }
  return di.apply(this, arguments);
 };
 try { const P = CanvasRenderingContext2D.prototype; P.drawImage = swap(P.drawImage); const gx = typeof off !== 'undefined' && off.getContext ? off.getContext('2d') : null; if (gx && Object.prototype.hasOwnProperty.call(gx, 'drawImage')) gx.drawImage = swap(gx.drawImage); } catch (e) { fail('swap', e); }

 // ---------- 9: fights (actors) draw the player's real gear, so a leather helmet stays brown there like in play ----------
 if (typeof Wn.drawActor14 === 'function' && typeof RL12 !== 'undefined') {
  const da0 = Wn.drawActor14;
  Wn.drawActor14 = function (a) { Wn.__f590a = a; try { return da0.apply(this, arguments); } finally { Wn.__f590a = null; } };
  const rd0 = RL12.draw;
  RL12.draw = function (gg, name, x, y, kit, faceRight, opts) {
   try {
    const a = Wn.__f590a, G = typeof game !== 'undefined' ? game : null;
    if (a && !offF(9) && a.pl && G && G.g17 && G.g17.gear && G.g17.gear[a.pl.id] && Wn.V17 && V17.bakeGear) {
     const f = RL12.FR[name], cv = f && V17.bakeGear(name, kit, !faceRight, (opts && opts.skin) || 0, G.g17.gear[a.pl.id], false);
     if (cv) { const pad = cv.pad17 || 0, w = f[3][0].length, ax = faceRight ? f[0] : w - 1 - f[0], X = Math.round(x), Y = Math.round(y); gg.fillStyle = 'rgba(0,0,0,.25)'; gg.fillRect(X - 4, Y, 9, 2); gg.drawImage(cv, X - ax - pad, Y - f[1] - pad); return; }
    }
   } catch (e) { fail('actor', e); }
   return rd0.apply(this, arguments);
  };
 }
 // ---------- 10: Turkey Trotters base team: the kit always carries its turkey look (tail fan + gobble) on the first render ----------
 const tkFix = (tid, k) => { try { if (tid !== 'TKT' || !k || k.g27 || !Wn.UNI21X) return k; const x = UNI21X.kitOf('TKT', k.k21 != null ? k.k21 : UNI21.savedK('TKT')); return x && x.g27 ? Object.assign({}, x, k.k21 != null ? { k21: k.k21 } : {}) : k; } catch (e) { return k; } };
 if (Wn.UNI21) {
  const hk = UNI21.heroKit; UNI21.heroKit = function (side, tid) { const k = hk.apply(this, arguments); return offF(10) ? k : tkFix(tid, k); };
  const gk = UNI21.gameKits; UNI21.gameKits = function (user, opp) { const r = gk.apply(this, arguments); try { if (!offF(10) && Array.isArray(r)) { r[0] = tkFix(user, r[0]); r[1] = tkFix(opp, r[1]); } } catch (e) {} return r; };
 }
 setInterval(() => { try { const G = typeof game !== 'undefined' ? game : null; if (!offF(10) && G && G.uk && G.user === 'TKT' && !G.uk.g27) G.uk = tkFix('TKT', G.uk); if (!offF(10) && G && G.ok && G.opp === 'TKT' && !G.ok.g27) G.ok = tkFix('TKT', G.ok); } catch (e) {} }, 500);
 // ---------- 11: TOP 10 LOCKER badge: a shiny green locker on the back arm, side view only, every player of that card team ----------
 const SIDE = /^(run|cradle|shoot|check|pole_run|pole_check)\d|^(idle|pole_idle)\d*$/; // B76: + the standing side frames (walk-in stops, versus side view)
 const armSpot = new Map();
 function spotOf(name) {
  if (armSpot.has(name)) return armSpot.get(name);
  let s = null; const f = RL12.FR[name];
  if (f && SIDE.test(name)) { const rows = f[3]; let jr0 = -1; for (let r = 0; r < rows.length && jr0 < 0; r++) if (rows[r].indexOf('J') >= 0) jr0 = r; if (jr0 >= 0) { const row = rows[jr0 + 1] || rows[jr0], q = row.search(/[Jj]/); if (q >= 0) s = [q + 1, jr0 + 1]; } }
  armSpot.set(name, s); return s;
 }
 F.t10 = { spotOf: n => spotOf(n), team: t => top10Team(t) };
 function top10Team(tid) {
  try {
   if (!tid || !SZ_REG[tid] || !SZ_REG[tid].ct33) return false;
   if (tid === 'RK15OPP') return !!(Wn.RK15LL && RK15LL.match && RK15LL.match.opp && RK15LL.match.opp.top10lk);
   if (SZ_REG[tid].rk15bot || SZ_REG[tid].rk15remote) return false;
   return !!(Wn.RK15 && RK15.mine().top10lk);
  } catch (e) { return false; }
 }
 if (typeof Wn.drawPlayer12 === 'function') {
  const dp0 = Wn.drawPlayer12;
  Wn.drawPlayer12 = function (p, kit, faceRight) {
   const r = dp0.apply(this, arguments);
   try {
    const G = typeof game !== 'undefined' ? game : null;
    if (offF(11) || !G || !p || !p.pl || p.gk) return r;
    if (!G.__t10) { G.__t10 = { u: top10Team(G.user), o: top10Team(G.opp), ids: new Set((JSON.stringify(G.lu && G.lu[0] || {}).match(/"[^"]+"/g) || []).map(x => x.slice(1, -1))) }; try { teamRosterIds(G.user, G.src || 'real').forEach(id => G.__t10.ids.add(id)); } catch (e) {} }
    const T10 = G.__t10, isU = T10.ids.has(p.pl.id);
    { const sh76 = Wn.T1076 ? T1076.shows(p.pl.id, isU) : null; if (sh76 === null ? !(isU ? T10.u : T10.o) : !sh76) return r; } // 1.5 B76: per player, the chest item (v600t10)
    const n = p._fr, s = n && spotOf(n); if (!s) return r;
    const f = RL12.FR[n], w = f[3][0].length, fr = !!faceRight, ax = fr ? f[0] : w - 1 - f[0], x0 = Math.round(p.x) - ax, y0 = Math.round(p.y) - f[1];
    const X = q => x0 + (fr ? q : w - 1 - q), sh = Math.floor(performance.now() / 200) % 6 === 0;
    scaled12(p.x, p.y, () => { g.fillStyle = '#0c6a33'; g.fillRect(X(s[0]), y0 + s[1], 1, 2); g.fillStyle = sh ? '#e9fff2' : '#3dff8a'; g.fillRect(X(s[0] + 1), y0 + s[1], 1, 2); });
   } catch (e) { fail('top10', e); }
   return r;
  };
 }
})();
