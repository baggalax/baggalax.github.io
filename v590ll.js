/* v590ll.js - 1.5 LOCKER LEAGUE: lobby, FIND MATCH, versus, CPU bot offer, ranked result, rank up, public profile.
 * Boards: 1.5-3 lobby (+ 1.5-3b tier theme), 1.5-11 searching/versus, 3 bot offer, 1.5-4 profile, 1.5-4b rank up.
 * How: the lobby is the game's own GEAR lobby screen (screen 'gear17', kind 'match') for your CARD TEAM, so the big player,
 *   gear slots, AUTO BEST / TAKE OFF and item effects are the real ones. GEAR17.ll15 marks it; drawGear17 is wrapped to
 *   draw the Locker League column, tier theme, real card + crew card, first-time steps, and the search/versus screens.
 * Matches: real player = the server pairs you and makes a normal online room (existing net protocol, no new messages);
 *   both phones auto-pick the card team (items ON, 1 crew card) and ready up. CPU bot = local quick game vs a bot card team
 *   (v590bot.js). Results go to the server (RK15.call 'result'), which decides the points. Card teams only.
 * New storage key: rl_ll15 (picked card team, crew card, first-time flag). Kill switch: window.__rl_no590ll.
 */
(function () {
 'use strict';
 const Wn = window, R = Wn.RK15;
 if (!R || typeof Wn.drawGear17 !== 'function') return;
 const off = () => !!(Wn.__rl_no590ll || R.off());
 const DK = '#0b1a20';
 const LL = Wn.RK15LL = { mode: 'lobby', err: null, view: null, match: null, bot: null, res: null, anim: null, t0: 0, log: [] };
 const fail = (w, e) => { LL.err = w + ': ' + String(e && e.stack || e).slice(0, 300); try { console.warn('v590ll', w, e); } catch (x) {} };
 const now = () => performance.now() / 1e3;
 const TT = () => typeof menuT !== 'undefined' ? menuT : now();
 const store = (() => { let s = {}; try { s = JSON.parse(localStorage.getItem('rl_ll15') || '{}') || {}; } catch (e) {} return s; })();
 const save = () => { try { localStorage.setItem('rl_ll15', JSON.stringify(store)); } catch (e) {} };
 LL.store = store;
 const cardTeams = () => { try { return (V33.D.pro || []).concat(V33.D.col || []).filter(t => SZ_REG[t.id]); } catch (e) { return []; } };
 function myTid() { const L = cardTeams(); if (!L.length) return null; if (!L.some(t => t.id === store.tid)) { store.tid = L[0].id; save(); } return store.tid; }
 const tname = tid => { try { return T(tid).name.toUpperCase(); } catch (e) { return 'CARD TEAM'; } };
 const ovrOf = tid => { try { const ids = teamRosterIds(tid, 'real').filter(id => PP(id)); const top = ids.map(id => curOvr14(id)).sort((a, b) => b - a).slice(0, 10); return Math.round(top.reduce((a, b) => a + b, 0) / Math.max(1, top.length)); } catch (e) { return 0; } };
 const tierCol = tier => R.tierOf(tier);
 // ---------- canvas pieces ----------
 function slab(x, y, w, h, bg) { R.btn(x, y, w, h, bg, null, { noLabel: 1 }); } // 1.5b: shop / gear panel button style
 function ring(x, y, w, h) { const a = .55 + .45 * Math.sin(TT() * 4), c = 'rgba(255,225,77,' + a.toFixed(2) + ')'; rect(x - 2, y - 2, w + 4, 1, c); rect(x - 2, y + h + 3, w + 4, 1, c); rect(x - 2, y - 2, 1, h + 6, c); rect(x + w + 1, y - 2, 1, h + 6, c); }
 function tri(x, y, k, col) { for (let i = 0; i < Math.round(3 * k); i++) rect(x + i, y + Math.round(i / 2), 1, Math.max(1, Math.round(5 * k) - 2 * Math.round(i / 2)), col); }
 function fitMini(s, cx, y, maxW, col, k0) { R.miniFit(s, cx, y, maxW - 4, col || 'rgba(11,26,32,.75)', k0 || .75); }
 // a 1.4 slab button; o: {x,y,w,h,bg,label,sub,fg,hero,tri,back,fn,key,chip}
 function NB(o, live) {
  if (live && o.fn) hit(o.label, o.x, o.y, o.w, o.h, o.fn, 'rk15' + (o.key || o.label));
  if (o.back) { R.btn(o.x, o.y, o.w, o.h, '#2a3a44', null, { noLabel: 1 }); for (let i = 0; i < 3; i++) rect(o.x + 8 - i, o.y + Math.round(o.h / 2) - 2 + i, 1, 5 - 2 * i, '#c9d6d9'); text(o.label, o.x + o.w / 2, o.y + Math.round((o.h - 5) / 2), 1, '#c9d6d9', 'center'); return; }
  if (o.hero) ring(o.x, o.y, o.w, o.h);
  slab(o.x, o.y, o.w, o.h, o.bg);
  const fg = o.fg || DK, lp = o.lpad || 0, sc = o.sc || (o.h >= 26 && textW(o.label, 2) + 16 < o.w - lp ? 2 : 1);
  const ty = o.y + (o.sub ? Math.max(2, Math.round((o.h - 5 * sc - 8) / 2)) : Math.round((o.h - 5 * sc) / 2));
  const tw = textW(o.label, sc) + (o.tri ? 4 * sc + 2 : 0), x0 = Math.round(o.x + lp + (o.w - lp - tw) / 2);
  if (o.tri) tri(x0, ty, sc === 2 ? 2 : 1, fg);
  text(o.label, x0 + (o.tri ? 4 * sc + 2 : 0), ty, sc, fg);
  if (o.sub) fitMini(o.sub, o.x + lp + (o.w - lp) / 2, ty + 5 * sc + 3, o.w - lp - 8, o.fg ? o.fg : 'rgba(11,26,32,.75)');
  if (o.chip) { const w = textW(o.chip) + 6; rect(o.x + o.w - w - 3, o.y - 6, w + 2, 9, DK); rect(o.x + o.w - w - 2, o.y - 5, w, 7, '#7dff7a'); text(o.chip, o.x + o.w - w + 1, o.y - 4, 1, DK); }
 }
 function stepDot(n, x, y) { rect(x - 1, y - 1, 9, 9, '#000'); rect(x, y, 7, 7, '#ffe14d'); text(String(n), x + 2, y + 1, 1, DK); }
 // ---------- remote card teams (opponent / public profile) ----------
 function regRemote(id, tm) {
  try {
   if (!tm || !tm.pl || !tm.pl.length) { delete SZ_REG[id]; return null; }
   const base = tm.uni && T(tm.uni) && T(tm.uni).id === tm.uni ? tm.uni : (TEAMS[0] && TEAMS[0].id);
   const mk = id2 => { if (PP(id2)) return true; try { if (HON25 && HON25.kindOf && HON25.kindOf(id2) && HON25.make) HON25.make(id2); if (Wn.ULT331 && ULT331.isU && ULT331.isU(id2) && ULT331.make) ULT331.make(id2); } catch (e) {} return !!PP(id2); };
   const ids = tm.pl.map(p => Wn.OPP600 ? OPP600.inId(p, mk) : p.id).filter(mk); // 1.5 B69: unknown custom cards with a def -> 'rx:' players (v600opp)
   if (!ids.length) { delete SZ_REG[id]; return null; }
   const b = T(base);
   SZ_REG[id] = { id: id, abbr: 'OPP', name: R.cname(tm.name || 'CARD TEAM'), full: R.cname(tm.name || 'CARD TEAM'), city: '', lg: 'CARD TEAM', era: 'CARD TEAM', c1: b.c1, c2: b.c2, icon: b.icon, coach: 'CPU', coachNote: 'CARD TEAM', off: 4, def: 4, roster: ids, sz: true, szBase: base, boost: {}, nums: {}, szLu: null, mine: false, ct33: 'pro', rk15remote: 1 };
   if (b.acc16) SZ_REG[id].acc16 = b.acc16;
   if (!Wn.__rl_no591uni) SZ_REG[id].szBase = b.id; // uniform set = the base team's, so 'k:N' variants resolve
   try { if (Wn.RK15U && RK15U.setRemote) RK15U.setRemote(id, tm.rku || null); } catch (e) {}
   return SZ_REG[id];
  } catch (e) { fail('regRemote', e); return null; }
 }
 LL.regRemote = regRemote;
 // my public online card team (sent to the server when you open the lobby / start a match)
 function myPublic(tid) {
  tid = tid || myTid(); if (!tid) return null;
  const pl = [];
  try {
   V17.setMTeam && V17.setMTeam(tid);
   const ids = teamRosterIds(tid, 'real').filter(id => PP(id)).sort((a, b) => curOvr14(b) - curOvr14(a));
   const st = V17.mStore ? V17.mStore() : null;
   for (const id of ids.slice(0, 20)) { const e = st && st[id] || {}, gear = {}; for (const k in e) if (typeof e[k] === 'string' && V17.BY[e[k]]) gear[k] = e[k]; pl.push(Wn.OPP600 ? OPP600.out(id, { id: id, card: id, gear: gear }) : { id: id, card: id, gear: gear }); } // 1.5 B69: custom card defs (v600opp)
  } catch (e) { fail('myPublic', e); }
  let rku = null; try { rku = Wn.RK15U ? (RK15U.pubKey && !Wn.__rl_no591uni ? RK15U.pubKey(tid) : RK15U.wornKey(tid)) : null; } catch (e) {} // 1.5c: exact variant ('k:N') or ranked uni key, in the existing rku field
  return { name: tname(tid), uni: SZ_REG[tid] ? SZ_REG[tid].szBase : '', rku: rku, crew: store.crew || '', pl: pl };
 }
 LL.myPublic = myPublic;
 let pushT = 0;
 function pushTeam(force) { if (!R.signedIn() || R.down || (!force && Date.now() - pushT < 3e4)) return; pushT = Date.now(); let items = [], cards = []; try { const inv = V17.ST().inv || {}; items = Object.keys(inv).filter(k => (inv[k] | 0) > 0); } catch (e) {} try { cards = Wn.V22 && V22.ownedIds ? V22.ownedIds() : []; } catch (e) {} R.call('team', { team: myPublic(), items: items, cards: cards }); } // the server works out the locker rating (a cloud save wins)
 // ---------- open / close ----------
 function setGear(o) { GEAR17 = Object.assign({ tid: o.tid, src: 'real', back: 'menu', kind: 'match', ll15: true }, o); try { if (V17.setMTeam) V17.setMTeam(o.tid); } catch (e) {} lobby.card = null; screen = 'gear17'; }
 // the old ONLINE page's options (host / join a code, invites, online season) live on the existing 'online' screen
 const ONL = ['online', 'onJoin', 'onTeam', 'onLobby', 'onSeason', 'onSeasonTeam'];
 function goOnline() { LL.fromLL = true; hideCards(); try { RLNET.openOnline(); } catch (e) { fail('online', e); } }
 // 1.5e (Charlie): SEASON opened the old ONLINE menu (invite, friends + account, invites panel...). It now opens a small
 // picker with only the season options; each one launches exactly what the old menu's button did. Kill: __rl_no597season
 let ssEl = null;
 function seasonPick() {
  if (Wn.__rl_no597season) return goOnline();
  try {
   const N = Wn.RLNET, T = Wn.T232, ms = N && N.mySeasons ? N.mySeasons() : [];
   const go = fn => { close(); LL.fromLL = true; hideCards(); try { N.openOnline(); } catch (e) { fail('online', e); } try { fn(); } catch (e) { fail('season', e); } };
   const close = () => { if (ssEl) ssEl.style.display = 'none'; };
   const opts = [['NEW ONLINE SEASON', '#ffd23a', () => go(() => N.seasonCreate())]];
   if (T && T.on && T.on()) opts.push(['NEW ONLINE WORLD GAMES', '#ffb14d', () => go(() => T.createWg())]);
   if (T && T.createCol && (!T.colOn || T.colOn())) opts.push(['NEW ONLINE COLLEGE TOURNAMENT', '#ff8ad8', () => go(() => T.createCol())]);
   if (ms.length) opts.push([ms.length > 1 ? 'MY SEASONS' : 'MY SEASON', '#7dff7a', () => go(() => N.seasonOpen(ms[0].code))]);
   opts.push(['BACK', '#c9d6d9', close]);
   if (!ssEl) {
    ssEl = document.createElement('div'); ssEl.id = 'ss597';
    ssEl.style.cssText = 'position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,6,9,.72);padding:max(8px,env(safe-area-inset-top)) max(10px,calc(env(safe-area-inset-right) + 6px)) max(8px,env(safe-area-inset-bottom)) max(10px,calc(env(safe-area-inset-left) + 6px));box-sizing:border-box;font:bold 12px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase';
    ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(t => ssEl.addEventListener(t, e => e.stopPropagation(), { passive: true }));
    ssEl.addEventListener('click', e => { if (e.target === ssEl) close(); });
    document.body.appendChild(ssEl);
   }
   ssEl.innerHTML = '<div style="background:#14222b;border:2px solid #0b1a20;box-shadow:0 0 0 2px #ffd23a,0 6px 0 #000;padding:10px 12px;max-width:420px;width:100%;max-height:100%;overflow:auto;box-sizing:border-box;text-align:center"><div style="color:#ffd23a;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:8px">ONLINE SEASON</div><div class="o" style="display:flex;flex-direction:column;gap:7px"></div></div>';
   const box = ssEl.querySelector('.o');
   opts.forEach(([lab, bg, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = lab; b.setAttribute('aria-label', lab); b.style.cssText = 'font:inherit;text-transform:uppercase;color:#0b1a20;background:' + bg + ';border:2px solid #0b1a20;border-radius:0;box-shadow:inset 0 2px 0 rgba(255,255,255,.45),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000;padding:8px 6px;cursor:pointer;touch-action:manipulation;white-space:normal'; b.addEventListener('click', e => { e.stopPropagation(); fn(); }); box.appendChild(b); });
   ssEl.style.display = 'flex';
  } catch (e) { fail('seasonPick', e); goOnline(); }
 }
 LL.seasonPick = seasonPick;
 function goFriend() { goOnline(); try { V23.open(null, { pick: true }); } catch (e) {} }
 LL.testFriend = goFriend;
 let lastScr = '';
 setInterval(() => { try { const sc = typeof screen !== 'undefined' ? screen : ''; if (LL.fromLL && sc === 'menu' && ONL.includes(lastScr) && !(Wn.RLNET && (RLNET.inGame || RLNET.code))) { LL.fromLL = false; LL.open(); } if (LL.fromLL && sc !== 'menu' && !ONL.includes(sc) && sc !== 'gear17') LL.fromLL = false; lastScr = sc; } catch (e) {} }, 150);
 LL.open = function () {
  if (off()) return; LL.more = false;
  if (!R.signedIn()) { try { V23.open('new', { gate: true }); } catch (e) {} return; }
  const tid = myTid();
  LL.view = null; LL.mode = 'lobby';
  if (!tid) { LL.mode = 'noteam'; setGear({ tid: TEAMS[0].id, noteam: true }); return; }
  setGear({ tid: tid });
  R.refresh(true); pushTeam(true); loadKing();
 };
 LL.close = function (to) { cancelSearch(); LL.view = null; LL.mode = 'lobby'; GEAR17 = null; hideCards(); screen = 'menu'; if (to !== 'menu') { try { M37.page = 'play'; V469.page = 'pick'; } catch (e) {} } }; // 1.5c: the online lobby IS the online page; BACK = the PLAY page
 LL.profile = async function (u, isMe, back) {
  if (off()) return;
  const back0 = { screen: back || (typeof screen !== 'undefined' ? screen : 'menu'), mode: LL.mode, tid: GEAR17 && GEAR17.tid, ll: !!(GEAR17 && GEAR17.ll15) };
  if (isMe || (R.mine().u && String(u).toLowerCase() === String(R.mine().u).toLowerCase())) {
   const m = R.mine(), tid = myTid();
   LL.view = { me: true, u: m.u, prof: Object.assign({}, m, { team: tid ? myPublic(tid) : null }), back: back0, idx: 0 };
   if (tid) { LL.view.tid = tid; setGear({ tid: tid, view: true }); } else { LL.view.tid = null; setGear({ tid: TEAMS[0].id, view: true, locked: true }); }
   return;
  }
  LL.view = { u: u, prof: null, loading: true, back: back0, idx: 0 };
  setGear({ tid: TEAMS[0].id, view: true, locked: true });
  const j = await R.call('prof', { u: u });
  if (!LL.view || LL.view.u !== u) return;
  LL.view.loading = false;
  if (!j || !j.ok) { LL.view.err = j && j.error || 'NO CONNECTION'; return; }
  LL.view.prof = j.prof;
  const tm = regRemote('RK15VIEW', j.prof.team);
  if (tm) { LL.view.tid = 'RK15VIEW'; GEAR17.tid = 'RK15VIEW'; GEAR17.locked = false; }
 };
 function closeView() {
  const b = LL.view && LL.view.back; LL.view = null; hideCards();
  if (b && b.ll && b.tid) { setGear({ tid: b.tid }); LL.mode = 'lobby'; return; }
  GEAR17 = null; screen = b && b.screen && b.screen !== 'gear17' ? b.screen : 'menu'; panelDirty();
 }
 // ---------- gear on the big player: my LL team = match store; a profile/opponent = their public gear ----------
 const remoteGear = (pid) => { const v = LL.view; const tm = v && v.prof && v.prof.team || LL.oppTeam; const pid0 = Wn.OPP600 && OPP600.alias[pid] || pid; const p = tm && tm.pl && tm.pl.find(x => x.id === pid0); return p && p.gear && Object.keys(p.gear).length ? p.gear : null; };
 if (Wn.V17 && typeof V17.bakeHero === 'function' && typeof V17.bakeGear === 'function') {
  const bh0 = V17.bakeHero;
  V17.bakeHero = function (name, kit, skin, gray, flip) {
   try {
    if (!off() && !gray && GEAR17 && GEAR17.ll15 && (LL.heroSide === 'opp' || (LL.view && !LL.view.me))) {
     const gr = remoteGear(Wn.__v17hp); if (!gr) return null;
     return V17.bakeGear(name, kit, !!flip, skin, gr, false, { nopad: true });
    }
   } catch (e) { fail('bakeHero', e); }
   return bh0.apply(this, arguments);
  };
 }
 // ---------- tier theme on the room ----------
 const lr0 = Wn.lobbyRoom;
 Wn.lobbyRoom = function (L, kit, locked, t) {
  const r = lr0.apply(this, arguments);
  try {
   if (!off() && screen === 'gear17' && GEAR17 && GEAR17.ll15 && !LL.noTheme) {
    if (!LL.view && !LL.themeTier && !R.real()) return r; // rankings not live: no tier theme
    const m = LL.view ? (LL.view.prof || {}) : R.mine(), tc = tierCol(LL.themeTier || (m.tier) || 'SQUID');
    g.save(); g.globalCompositeOperation = 'color'; g.globalAlpha = .6; g.fillStyle = tc.D; g.fillRect(0, 0, L, H); g.restore();
    g.save(); g.globalAlpha = .22; g.fillStyle = tc.X; g.fillRect(0, 0, L, H); g.restore();
    const em = R.img(tc.n, 1, 'emblem');
    if (em.complete && em.naturalWidth) { g.save(); g.globalAlpha = .38; g.imageSmoothingEnabled = false; const k = 4, w = em.naturalWidth * k, h = em.naturalHeight * k; g.drawImage(em, Math.round(L / 2 - w / 2), 10, w, h); g.restore(); }
   }
  } catch (e) { fail('room', e); }
  return r;
 };
 const lg0 = Wn.lobbyGlow;
 Wn.lobbyGlow = function () { if (!off() && screen === 'gear17' && GEAR17 && GEAR17.ll15) return '#7dff7a'; return lg0.apply(this, arguments); };
 // ---------- real card + crew card (DOM, top right of the lobby) ----------
 // real card + crew card as DOM over the canvas; several slots (lobby, profile, both sides of the versus screen)
 const SLOTS = {}; let cardsKey = '';
 let cssCopied = false;
 function copyCardCss() { // the card look is scoped to #panel; reuse the same rules for the card slots
  if (cssCopied) return; cssCopied = true;
  try { const out = []; for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; } for (const r of rules) { if (r.selectorText && r.selectorText.indexOf('#panel') >= 0 && /c17|gfa16|gfl16|v22|car4|cx4/.test(r.selectorText)) out.push(r.cssText.split('#panel').join('.rk15cards')); } }
   const st = document.createElement('style'); st.textContent = out.join('\n'); document.head.appendChild(st); } catch (e) { fail('css', e); }
 }
 function cardsBox(slot) { copyCardCss(); let o = SLOTS[slot]; if (!o) { const el = document.createElement('div'); el.className = 'rk15cards'; el.id = slot === 'main' ? 'rk15cards' : 'rk15cards-' + slot; el.style.cssText = 'position:fixed;z-index:6;pointer-events:none;display:none'; document.body.appendChild(el); o = SLOTS[slot] = { el: el, key: '', used: 0 }; } return o; }
 function hideCards(slot) { for (const k in SLOTS) if (!slot || k === slot) { SLOTS[k].el.style.display = 'none'; SLOTS[k].key = ''; } cardsKey = ''; }
 const css = document.createElement('style');
 css.textContent = '.rk15cards{font:bold 11px/1.25 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.3px;text-transform:uppercase;color:#e8f4f6}.rk15cards .c{transform-origin:0 0;position:absolute;top:0}.rk15cards .slot{position:absolute;top:0;border:2px dashed #2c4452;box-sizing:border-box;color:#9fb8c4;font:bold 9px ui-monospace,Menlo,monospace;display:flex;align-items:center;justify-content:center;text-align:center;background:rgba(0,0,0,.45)}';
 document.head.appendChild(css);
 let TX = { ox: 0, oy: 0, sc: 1 }; // the transform the current profile render is drawn with (game px)
 function placeCards(pid, crewId, x, y, hCard, hCrew, slot) {
  slot = slot || 'main'; const cv = document.querySelector('canvas'); if (!cv) return;
  const b = cv.getBoundingClientRect(), s = b.width / W, k = TX.sc, o = cardsBox(slot), el = o.el;
  const gx = TX.ox + x * k, gy = TX.oy + y * k, hC = hCard * k, hR = hCrew * k;
  el.style.display = 'block'; el.style.left = Math.round(b.left + gx * s) + 'px'; el.style.top = Math.round(b.top + gy * s) + 'px'; o.used = 1;
  const key = pid + '|' + crewId + '|' + Math.round(b.width) + '|' + hC.toFixed(1); if (key === o.key) return; o.key = key; cardsKey = key;
  let card = '', crew = '';
  try { card = pid && Wn.V22 && V22.cardHtml22 ? V22.cardHtml22(pid) : ''; } catch (e) {}
  try { crew = crewId && Wn.V17 && V17.cardHtml && V17.BY[crewId] ? V17.cardHtml(crewId, {}) : ''; } catch (e) {}
  el.innerHTML = '<div class="c c1">' + card + '</div><div class="c c2">' + (crew || '') + '</div>' + (crew || crewId === null ? '' : '<div class="slot c2e">CREW<br>CARD<br>+</div>');
  const fit = (cls, hh, left) => { const n = el.querySelector('.' + cls); if (!n) return 0; const r0 = n.firstElementChild ? n.firstElementChild.getBoundingClientRect() : n.getBoundingClientRect(); if (!r0.height) return 0; const kk = hh * s / r0.height; n.style.transform = 'scale(' + kk + ')'; n.style.left = left + 'px'; return r0.width * kk; };
  const w1 = card ? fit('c1', hC, 0) : 0;
  if (crew) fit('c2', hR, w1 ? w1 + 4 : 0); else if (crewId !== null) { const e = el.querySelector('.c2e'); if (e) { e.style.left = (w1 + 4) + 'px'; e.style.width = Math.round(hR * s * .68) + 'px'; e.style.height = Math.round(hR * s) + 'px'; } }
 }
 // the card + crew slot: right of the team sign, left of the STICK/TAPE/CELLY column; shrinks on narrow phones
 function cardSlot(L, tid) {
  const signR = Math.round(L * .48) + Math.max(70, textW(tname(tid)) + 16) / 2 + 14, right = L - 29, room = right - signR;
  let hC = 34, hR = 26; const need = () => hC * .68 + 3 + hR * .68;
  while (need() > room && hC > 18) { hC -= 1; hR = Math.round(hC * .76); }
  return { x: Math.round(right - need()), hC: hC, hR: hR, crewX: Math.round(right - hR * .68) };
 }
 // 1.5c (TestFlight 3): the player card is big on the free floor left of STATS / CHIRP LOADOUT; the crew card sits under
 // CHIRP LOADOUT (the regular lobby's TEAM CREW spot) as big as that corner allows. Narrow phones: the player card goes top-centre.
 function cardSpots(L, tid) {
  const cy = Wn.__rl_no597prof ? 147 : 145, ch = Math.max(26, H - cy - 1), c = { x: L - 46 + Math.max(0, Math.round((44 - ch * .68) / 2)), y: cy, h: ch };
  let p = null;
  if (!Wn.__rl_no598lob) return { p: { x: L - 46, y: 28, h: 31 }, c: { x: L - 23, y: 102, h: 31 } }; // 1.5f spec: player card left of STICK, crew card under CELLY (20 x 31, nothing below y 170)
  if (!Wn.__rl_no597card) { // 1.5e (Charlie): the player card sits TOP RIGHT, directly left of the STICK slot (L-23, y17..54),
   // under the YARD SALE / WEEKLY cluster and above the hero's right arrow (y 62) - the whole card shows, nothing on the floor
   const ph = 34, pw = Math.round(ph * .68); p = { x: L - 25 - pw, y: 26, h: ph };
  } else if (W >= 360) { const ph = Math.min(56, H - 124 - 2), pw = Math.round(ph * .68), px = L - 48 - pw; if (px > Math.round(L * .48) + 30) p = { x: px, y: H - 2 - ph, h: ph }; }
  if (!p) { const hh = Math.max(24, H - cy - 1), ww = Math.round(hh * .68); p = { x: L - 46, y: cy, h: hh }; c.x = L - 46 + ww + 2; c.h = hh; } // narrow: both cards under CHIRP LOADOUT
  return { p: p, c: c };
 }
 // the crew card list (tap the crew card): every crew card you own, tap one = it's your 1 online crew card
 let crewEl = null;
 function openCrewList() {
  try {
   const own = V17.I.filter(it => it.sec === 'crew' && (V17.ST().inv[it.id] | 0) > 0).map(it => it.id);
   if (!own.length) { V17.toast && V17.toast('NO CREW CARDS YET - OPEN A CREW PACK', '#ffb14d'); return; }
   copyCardCss();
   if (!crewEl) { crewEl = document.createElement('div'); crewEl.id = 'rk15crew'; crewEl.className = 'rk15cards'; crewEl.style.cssText = 'position:fixed;inset:0;z-index:31;background:rgba(5,8,11,.9);display:none;flex-direction:column;align-items:center;padding:10px;box-sizing:border-box;font:bold 12px ui-monospace,Menlo,monospace;color:#ffe14d;text-transform:uppercase';
    document.body.appendChild(crewEl);
    crewEl.addEventListener('click', e => { const b = e.target.closest('[data-crew]'); if (e.target.closest('.x') || b) { e.stopPropagation(); crewEl.style.display = 'none'; if (b) { store.crew = b.getAttribute('data-crew'); save(); cardsKey = ''; pushTeam(true); try { V17.toast(store.crew ? 'CREW CARD: ' + V17.BY[store.crew].n.toUpperCase() : 'NO CREW CARD', '#7dff7a'); } catch (x) {} } } });
    ['pointerdown', 'touchstart', 'mousedown'].forEach(t => crewEl.addEventListener(t, e => e.stopPropagation(), { passive: true })); }
   const cards = own.map(id => '<button type="button" data-crew="' + id + '" style="background:none;border:' + (id === store.crew ? '3px solid #7dff7a' : '3px solid transparent') + ';padding:2px;cursor:pointer;width:110px">' + V17.cardHtml(id, {}) + '</button>').join('');
   crewEl.innerHTML = '<div style="display:flex;gap:10px;align-items:center;width:100%;max-width:760px"><div style="flex:1">PICK YOUR CREW CARD (1 ONLINE)</div><button type="button" data-crew="" style="background:#c9d6d9;border:2px solid #0b1a20;padding:4px 8px;font:inherit">NONE</button><button type="button" class="x" style="background:#ff9a3d;border:2px solid #0b1a20;padding:4px 10px;font:inherit">CLOSE</button></div><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;overflow:auto;max-width:760px;margin-top:8px">' + cards + '</div>';
   crewEl.style.display = 'flex';
  } catch (e) { fail('crewList', e); }
 }
 LL.openCrewList = openCrewList;
 // 11: any sub-screen / overlay open over the lobby -> the lobby's own buttons + cards step aside
 function overlayOn() {
  try {
   if (Wn.V17 && V17.pop && V17.pop()) return true;
   if (Wn.V17 && V17.tray && V17.tray()) return true;
   for (const id of ['rk15pick', 'rk15crew', 'tp598', 'ss597', 'df2503', 'shop26', 'del41']) { const e = document.getElementById(id); if (e && e.style.display !== 'none' && e.style.display !== '') return true; }
   if (typeof lobby !== 'undefined' && lobby.card) return true;
   if (!Wn.__rl_no598cover && coverOn()) return true;
  } catch (e) {}
  return false;
 }
 // 1.5f (Charlie): ONE central check - any screen / panel / popup / tutorial laid over the lobby (Edit Names, Locker, Yard
 // Sale, Pass, Weekly, Chirp, Stats, Friends, Profile, Rankings, Season, the tour, any popup) hides every lobby overlay:
 // player + crew cards, team picker, AUTO BEST / TAKE OFF. Rule: a visible fixed / absolute element (not the game's own
 // stage, canvas, tap layer or our cards) covering 35%+ of the screen, or any panel screen. Kill switch: __rl_no598cover
 const OWN598 = el => el.id === 'stage' || el.id === 'ui' || el.tagName === 'CANVAS' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.classList.contains('rk15cards') || el.id === 'b590gear' || el.id === 'tp598' || el.id === 'wt598' || el.classList.contains('ban17') || el.classList.contains('toast') || el.id === 'toast17';
 let cov598 = { t: 0, v: false };
 function coverOn() {
  const now0 = performance.now(); if (now0 - cov598.t < 120) return cov598.v;
  let v = false;
  try {
   if (typeof PANEL_SCREENS !== 'undefined' && typeof screen !== 'undefined' && PANEL_SCREENS.includes(screen)) v = true;
   if (!v) { const pn = document.getElementById('panel'); if (pn && pn.offsetParent && pn.getBoundingClientRect().width > innerWidth * .5 && getComputedStyle(pn).display !== 'none' && pn.childElementCount) v = true; }
   if (!v) {
    const A = innerWidth * innerHeight;
    for (const el of document.body.querySelectorAll('body > *, #stage > *')) {
     if (OWN598(el) || el.id === 'panel') continue;
     const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || (cs.position !== 'fixed' && cs.position !== 'absolute')) continue;
     const r = el.getBoundingClientRect(); if (r.width * r.height >= A * .35) { v = true; break; }
    }
   }
  } catch (e) {}
  cov598 = { t: now0, v: v }; return v;
 }
 LL.coverOn = coverOn;
 setInterval(() => { // also when the lobby itself is not drawing (a panel screen took over)
  try {
   if (off() || Wn.__rl_no598cover) return;
   const ll = typeof GEAR17 !== 'undefined' && GEAR17 && GEAR17.ll15;
   if (!ll) return;
   const c = (typeof screen !== 'undefined' && screen !== 'gear17') || coverOn();
   if (c) { hideCards(); const t = document.getElementById('tp598'); if (t) t.style.display = 'none'; }
   const g = document.getElementById('b590gear'); if (g) g.style.visibility = c ? 'hidden' : '';
  } catch (e) {}
 }, 150);
 LL.overlayOn = overlayOn;
 // ---------- the Locker League column ----------
 function rightBg(L, tc) {
  for (let x = L; x < W; x += 12) rect(x, 0, 12, H, (Math.floor((x - L) / 12)) % 2 ? tc.X : '#0b1118');
  g.save(); g.globalAlpha = .5; rect(L, 0, W - L, H, tc.X); g.restore();
  rect(L, 0, 2, H, '#05080b');
 }
 function drawLobbyCol(L, live) {
  const N8 = !Wn.__rl_no598lob, m = R.mine(), tc = R.real() ? tierCol(m.tier) : { L: '#9fb8c4', X: '#14232b', n: '' }, X = L + (N8 ? 4 : 5), RW = W - X - (N8 ? 6 : 5), cx = Math.round(X + RW / 2);
  const Y = N8 && !Wn.__rl_no600kingpos ? { f: 17, fh: 26, r: 60, t: 1, l: 98, p: 126, b: 145, k: 47, kh: 10 } : N8 ? { f: 16, fh: 30, r: 56, t: 1, l: 98, p: 126, b: 145, k: 160, kh: 10 } : { f: 15, fh: 33, r: 57, t: 0, l: 96, p: 125, b: 146, k: 162, kh: 15 }; // 1.5f: Chucks's approved layout (sizes incl. the 2-unit drop)
  rightBg(L, tc);
  if (N8 && textW('LOCKER LEAGUE', 2) <= RW) text('LOCKER LEAGUE', cx, 3, 2, '#ffe14d', 'center', '#000'); else text('LOCKER LEAGUE', cx, 4, 1, '#ffe14d', 'center', '#000');
  const tid = GEAR17.tid;
  NB({ x: X, y: Y.f, w: RW, h: Y.fh, bg: '#7dff7a', label: 'FIND MATCH', sub: R.down ? 'RANKINGS SOON - PRACTICE VS CPU' : 'VS A REAL PLAYER - ABOUT 20 SEC', hero: 1, tri: 1, fn: () => startSearch() }, live);
  const real = R.real();
  NB({ x: X, y: Y.r, w: RW, h: N8 ? 22 : 24, bg: real ? tc.L : '#7f8f99', label: 'RANKINGS', lpad: real ? 24 : 0, sub: real ? R.mineLbl() + ' - ' + R.rankTxt(m) : 'COMING SOON', tri: 1, fn: () => { try { RK15UI.openBoard('player', 'gear17'); } catch (e) {} } }, live);
  if (real) R.drawBadge(X + 3, Y.r + 1 - (m.tier === 'JADE KING' ? 4 : 0), m.tier, m.div, 1);
  rect(X, 91 + Y.t, RW, 1, 'rgba(255,255,255,.15)'); rect(X, 87 + Y.t, 44, 7, '#0b1118'); textMini('YOUR TEAM', X + 20, 89 + Y.t, '#9fb8c4');
  const hw = Math.floor((RW - 4) / 2), tw3 = Math.floor((RW - 8) / 3);
  let fon = 0; try { const F = V23.st && V23.st.fr; fon = F && F.friends ? F.friends.filter(x => x.on).length : 0; } catch (e) {}
  if (LL.more) { // 1.5c: the old ONLINE page's extras, in a small MORE panel over the YOUR TEAM rows (never over FIND MATCH / RANKINGS / cards)
   rect(X - 2, 86, RW + 4, 56, 'rgba(5,8,11,.96)'); rect(X - 2, 86, RW + 4, 1, '#2cc4dc'); textMini('MORE ONLINE', X + 24, 89, '#8fe3f0');
   NB({ x: X, y: 96, w: RW, h: 16, bg: '#2cc4dc', label: 'PLAY A FRIEND', sub: 'INVITE A FRIEND - HOST OR JOIN A CODE', fn: () => { LL.more = false; goFriend(); } }, live);
   NB({ x: X, y: 117, w: RW - 34, h: 16, bg: '#ffd23a', label: 'ONLINE SEASON', sub: 'A FULL SEASON VS REAL TEAMS', fn: () => { LL.more = false; seasonPick(); } }, live);
   NB({ x: X + RW - 30, y: 117, w: 30, h: 16, bg: '#c9d6d9', label: 'X', fn: () => { LL.more = false; } }, live);
  } else {
   NB({ x: X, y: Y.l, w: hw, h: N8 ? 20 : 22, bg: '#ffd23a', label: 'LINEUP', sub: 'WHO STARTS', fn: () => openLineup(tid, 'real', 'gear17') }, live);
   NB({ x: X + hw + 4, y: Y.l, w: RW - hw - 4, h: N8 ? 20 : 22, bg: '#ff9a3d', label: 'RATINGS', sub: 'OVR + STATS', fn: () => openRoster(tid, 'real', 'gear17') }, live);
   NB({ x: X, y: Y.p, w: tw3, h: N8 ? 11 : 13, bg: '#b48aff', label: 'PROFILE', fn: () => LL.profile(m.u, true, 'gear17') }, live);
   NB({ x: X + tw3 + 4, y: Y.p, w: tw3, h: N8 ? 11 : 13, bg: '#2cc4dc', label: 'FRIENDS', chip: fon ? fon + ' ON' : '', fn: () => { try { V23.open(null); } catch (e) {} } }, live);
   NB({ x: X + 2 * (tw3 + 4), y: Y.p, w: RW - 2 * (tw3 + 4), h: N8 ? 11 : 13, bg: '#ffd23a', label: 'SEASON', fn: () => seasonPick() }, live); // 1.5c: online season; friends are invited from FRIENDS
  }
  NB({ x: X, y: Y.b, w: RW, h: N8 ? 10 : 12, label: 'BACK', back: 1, fn: () => LL.close() }, live);
  // 1.5c: the regular lobby's shop row (its top-right spot is under the player + crew cards here): same handlers
  if (!Wn.__rl_no592lob) { drawKing(L, live, { x: X, y: Y.k, w: RW, h: Y.kh }); } else if (false) { const t3 = Math.floor((RW - 8) / 3); let lv = 0, wk = 0; try { const S = V17.ST(); lv = Math.min(S.pass.stars, 99); wk = V17.chalSync().filter(c => !S.wk.done[c.id]).length; } catch (e) {}
   const SB = (key, x, w, bg, label, fn, chip) => { if (live) hit(key, x, 163, w, 13, () => extra(fn), key); R.btn(x, 163, w, 13, bg, null, { noLabel: 1 }); if (textW(label) <= w - 4) text(label, x + w / 2, 166, 1, '#0b1a20', 'center'); else fitMini(label, x + w / 2, 167, w - 2, '#0b1a20', 1); if (chip) { const cw = textW(chip) + 4; rect(x + w - cw - 1, 158, cw + 2, 8, '#000'); rect(x + w - cw, 159, cw, 6, '#7dff7a'); text(chip, x + w - cw + 2, 159.5, 1, '#0b1a20'); } };
   SB('YARD SALE', X, t3, '#7dff7a', 'YARD SALE', () => V17.openShop());
   SB('PASS', X + t3 + 4, t3, '#ffcc33', 'PASS LV' + lv, () => V17.openPass());
   SB('WEEKLY', X + 2 * (t3 + 4), RW - 2 * (t3 + 4), '#b9a8ff', 'WEEKLY', () => V17.openChal(), wk ? String(wk) : '');
  } else { let wr = ''; try { wr = Wn.RK15U ? RK15U.wornName(tid) : ''; } catch (e) {} fitMini(wr ? 'WEARING: ' + wr : 'ITEMS ON - 1 CREW CARD', cx, 168, RW, '#c9d6d9', .75); }
  if (!store.played) stepDot(3, X + RW - 6, 11);
 }
 // 1.5f (Charlie): switch card teams by TAPPING THE TEAM NAME plate: a small picker with a tile per card team (name, OVR,
 // mini uniform) + a "+ NEW TEAM" tile (Teams + Ratings). Same switch as before (store.tid, GEAR17.tid, setMTeam, pushTeam =
 // the existing 'team' route). The plate is only as wide as its text (no wide black band behind it: the old 110-unit band was
 // the black rectangle between DIMES and the plate). Kill switch: window.__rl_no598lob (old < 1/3 NAME > arrows come back).
 let tpEl = null;
 function switchTeam(id) { if (!id || id === GEAR17.tid) return; store.tid = id; save(); GEAR17.tid = id; lobby.pid = null; lobby.key = ''; cardsKey = ''; try { V17.setMTeam(id); } catch (e) {} pushTeam(true); }
 LL.switchTeam = switchTeam;
 function miniUni(tid) {
  try { const ids = teamRosterIds(tid, 'real').filter(i => PP(i) && PP(i).pos !== 'G'), id = ids[0]; if (!id) return '';
   let kit; try { kit = Wn.UNI21 && UNI21.on() ? UNI21.heroKit(0, tid) : lobbyKit(tid); } catch (e) { kit = lobbyKit(tid); }
   const b = lobbyBake(lobbyFrame(PP(id).pos, true), kit, skinOf(PP(id)), false, false); return b && b.toDataURL ? b.toDataURL() : ''; } catch (e) { return ''; }
 }
 function openTeamPick() {
  try {
   const close = () => { if (tpEl) tpEl.style.display = 'none'; };
   if (!tpEl) {
    tpEl = document.createElement('div'); tpEl.id = 'tp598';
    tpEl.style.cssText = 'position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,6,9,.72);padding:max(8px,env(safe-area-inset-top)) max(10px,calc(env(safe-area-inset-right) + 6px)) max(8px,env(safe-area-inset-bottom)) max(10px,calc(env(safe-area-inset-left) + 6px));box-sizing:border-box;font:bold 12px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase';
    ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(t => tpEl.addEventListener(t, e => e.stopPropagation(), { passive: true }));
    tpEl.addEventListener('click', e => { if (e.target === tpEl) close(); });
    document.body.appendChild(tpEl);
   }
   const list = cardTeams(), cur = GEAR17 && GEAR17.tid;
   tpEl.innerHTML = '<div style="background:#14222b;border:2px solid #0b1a20;box-shadow:0 0 0 2px #ffd23a,0 6px 0 #000;padding:8px 10px;max-width:560px;width:100%;max-height:100%;overflow:auto;box-sizing:border-box;text-align:center"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="flex:1;color:#ffd23a;font-size:14px;text-shadow:2px 2px 0 #000;text-align:left">PICK A CARD TEAM</div><button type="button" class="x" aria-label="CLOSE" style="font:inherit;color:#0b1a20;background:#c9d6d9;border:2px solid #0b1a20;border-radius:0;box-shadow:inset 0 2px 0 rgba(255,255,255,.45),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000;padding:5px 12px;min-height:30px;cursor:pointer;touch-action:manipulation">X</button></div><div class="o" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:7px"></div></div>';
   tpEl.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); close(); });
   const box = tpEl.querySelector('.o');
   const tile = (html, bg, fn, on, lab) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', lab); b.innerHTML = html; b.style.cssText = 'font:inherit;text-transform:uppercase;color:#0b1a20;background:' + bg + ';border:2px solid ' + (on ? '#ffd23a' : '#0b1a20') + ';border-radius:0;box-shadow:' + (on ? '0 0 0 2px #ffd23a,' : '') + 'inset 0 2px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000;padding:5px 4px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:6px;min-height:46px;text-align:left'; b.addEventListener('click', e => { e.stopPropagation(); fn(); }); box.appendChild(b); };
   list.forEach(t => { const u = miniUni(t.id), o = ovrOf(t.id), nm = tname(t.id), on = t.id === cur;
    tile((u ? '<img alt="" src="' + u + '" style="width:26px;height:auto;image-rendering:pixelated;flex:none">' : '<span style="width:26px;flex:none"></span>') + '<span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:11px;line-height:1.1;word-break:break-word">' + nm.replace(/[<>&]/g, '') + '</span><span style="font-size:10px;color:' + (on ? '#2a5a00' : '#33454f') + '">OVR ' + (o || '-') + (on ? ' - ON' : '') + '</span></span>', on ? '#7dff7a' : '#c9e3ee', () => { close(); switchTeam(t.id); }, on, nm); });
   tile('<span style="font-size:18px;line-height:1;flex:none;width:26px;text-align:center">+</span><span>NEW TEAM</span>', '#ffd23a', () => { close(); extra(() => { menuSel.mode = 'browse'; screen = 'pickTeam'; }); }, false, 'NEW TEAM');
   tpEl.style.display = 'flex';
  } catch (e) { fail('teamPick', e); }
 }
 LL.openTeamPick = openTeamPick;
 setInterval(() => { try { if (tpEl && tpEl.style.display !== 'none' && (typeof screen === 'undefined' || screen !== 'gear17' || LL.mode !== 'lobby' || LL.view || (typeof lobby !== 'undefined' && lobby.card))) tpEl.style.display = 'none'; } catch (e) {} }, 200); // 1.5f (Jonny M3): the picker never outlives the lobby under it
 function drawTeamPlate(L, live) {
  const L2 = cardTeams(); if (!L2.length) return;
  const y = 3, hx = Math.round(L * .48), nm = tname(GEAR17.tid), cap = 2 * Math.min(hx - 48, L - 62 - hx), hint = 7;
  let tw = Math.min(textW(nm) + 10 + hint, cap); const x0 = Math.round(hx - tw / 2), mini = textW(nm) + 10 + hint > cap;
  rect(x0 - 1, y - 1, tw + 2, 12, '#05080b'); rect(x0, y, tw, 10, '#0b1a20'); rect(x0, y, tw, 1, '#ffe14d');
  if (!mini) text(nm, x0 + 5, y + 3, 1, '#ffe14d'); else fitMini(nm, x0 + (tw - hint) / 2, y + 3, tw - hint - 4, '#ffe14d', .9);
  for (let k = 0; k < 3; k++) rect(x0 + tw - hint + k, y + 4 + k, 5 - 2 * k, 1, '#8fe3f0'); // small switch hint (a down arrow)
  if (live && !lobby.card) hit('TEAM PLATE', x0 - 2, y - 2, tw + 4, 14, () => openTeamPick(), 'SWITCH CARD TEAM');
  LL.plate598 = { x: x0, y: y, w: tw, h: 10 };
 }
 function drawTeamPicker(L, live) { // 1.5c: an obvious TEAM switch: < 1/3 TEAM NAME > on the team sign, new button style
  if (!Wn.__rl_no598lob) return drawTeamPlate(L, live);
  const L2 = cardTeams(); if (!L2.length) return;
  const i = Math.max(0, L2.findIndex(t => t.id === GEAR17.tid)), y = 3, cx = Math.round(L * .48);
  const go = d => { const n = L2[(i + d + L2.length) % L2.length]; store.tid = n.id; save(); GEAR17.tid = n.id; lobby.pid = null; lobby.key = ''; cardsKey = ''; try { V17.setMTeam(n.id); } catch (e) {} pushTeam(true); };
  const nm = tname(GEAR17.tid), cnt = L2.length > 1 ? (i + 1) + '/' + L2.length + ' ' : '', lab = cnt + nm, tw = textW(lab) + 10, x0 = Math.round(cx - tw / 2);
  { const uw = Math.max(tw, 110); rect(Math.round(cx - uw / 2) - 2, y - 2, uw + 4, 14, '#05080b'); } // 1.5c (Jonny): cover the lobby's own name plate fully (its ':' showed past ours)
  rect(x0 - 1, y - 1, tw + 2, 12, '#05080b'); rect(x0, y, tw, 10, '#0b1a20'); rect(x0, y, tw, 1, '#ffe14d');
  if (cnt) text(cnt, x0 + 5, y + 3, 1, '#9fb8c4'); text(nm, x0 + 5 + textW(cnt), y + 3, 1, '#ffe14d');
  if (L2.length < 2) return;
  for (const d of [-1, 1]) { const x = d < 0 ? x0 - 15 : x0 + tw + 3; if (live) hit('CT' + d, x - 3, y - 3, 18, 17, () => go(d), 'rk15ct' + d); R.btn(x, y - 1, 12, 12, '#ffe14d', null, { noLabel: 1 }); for (let k = 0; k < 3; k++) rect(d < 0 ? x + 7 - k : x + 4 + k, y + 2 + k, 1, 5 - 2 * k, '#0b1a20'); }
 }
 // 1.5c: bottom-right floor (the bottom-left now has EDIT NAMES / LOCKER ROOM / UNIFORM like the regular lobby)
 const brBox = L => ({ x: L - 46, y: 147, w: 44, h: 31 }); // the regular lobby's TEAM CREW spot (no TEAM CREW online: 1 crew card)
 function drawFirstTime(L) {
  if (store.played) return;
  const bb = brBox(L), x = bb.x, y = bb.y, w = bb.w, h = bb.h;
  rect(x - 1, y - 1, w + 2, h + 2, '#000'); rect(x, y, w, h, 'rgba(11,26,32,.95)'); rect(x, y, w, 1, '#ffe14d');
  fitMini('FIRST TIME?', x + w / 2, y + 3, w - 2, '#ffe14d', .7);
  [['1', 'PICK A CARD TEAM'], ['2', 'ADD 1 CREW CARD'], ['3', 'FIND MATCH']].forEach((r, i) => { const yy = y + 10 + i * 7; rect(x + 2, yy - 1, 5, 6, '#ffe14d'); textMini(r[0], x + 4.5, yy, '#0b1a20'); fitMini(r[1], x + 8 + (w - 9) / 2, yy, w - 9, '#ffffff', .55); });
  stepDot(1, Math.round(L * .48) - 78, 3);
 }
 // ---- v2 BEST-PLAYER card: the real #1, in the Jade King uni ("what you're chasing"). Empty = NO KING YET.
 // Bottom-left of the lobby, in the FIRST TIME spot (that box only shows before your first match). Tap = their profile.
 LL.king = undefined; let kingT = 0;
 function loadKing0() { if (R.down || Date.now() - kingT < 6e4) return; kingT = Date.now(); Promise.resolve(R.call('king', {}, true)).then(j => { if (j && j.ok) LL.king = j.king || null; }).catch(() => {}); }
 // 1.5f: the king comes from 'board' (every ranked server has it). Newer servers send board.king (and me.king); an older
 // server without it -> board row 1, if that player has played 1+ ranked game (bot games count: the server adds games+1
 // for a ranked bot result too). The old 'king' route on an older Worker answered 404, which marked ALL rankings down.
 // Refreshes on lobby entry, every 60 s and right after a ranked result. Kill switch: window.__rl_no600king
 const kingOf = j => { if (!j || !j.ok) return undefined; if ('king' in j) return j.king || null; const r = j.rows && j.rows[0]; return r && ((r.games | 0) >= 1 || r.ranked === true) ? { u: r.u, tier: r.tier, div: r.div, w: r.w | 0, l: r.l | 0, team: null, old600: 1 } : null; };
 let kingRes = null;
 function loadKing() {
  if (Wn.__rl_no600king) return loadKing0();
  try { if (LL.res && LL.res.st === 'done' && LL.res !== kingRes) { kingRes = LL.res; kingT = 0; } } catch (e) {}
  if (R.down || Date.now() - kingT < 6e4) return; kingT = Date.now();
  try { if (R.me && R.me.ok && 'king' in R.me && LL.king === undefined) LL.king = R.me.king || null; } catch (e) {}
  Promise.resolve(R.call('board', { tab: 'player', n: 1, off: 0 }, true)).then(j => { const k = kingOf(j); if (k !== undefined) { LL.king = k; LL.kingSrc = j && 'king' in j ? 'king' : 'row1'; } }).catch(() => {});
 }
 LL.loadKing = () => { kingT = 0; loadKing(); };
 function drawKing(L, live, bx) {
  if (Wn.__rl_no591king || R.down) return;
  const x = bx.x, y = bx.y, w = bx.w, h = bx.h;
  if (!store.played) { // FIRST TIME steps, one line
   rect(x, y, w, h, 'rgba(11,26,32,.95)'); rect(x, y, w, 1, '#ffe14d');
   if (!Wn.__rl_no598lob && h < 12) { fitMini('FIRST TIME?  1 PICK A CARD TEAM - 2 ADD 1 CREW CARD - 3 FIND MATCH', x + w / 2, y + 3, w - 6, '#ffe14d', .7); return; }
   if (!Wn.__rl_no597first && h < 18) return; // QA7: too short to read (667) - the step dots in the lobby already guide a first match
   if (Wn.__rl_no597first) fitMini('FIRST TIME?  1 PICK A CARD TEAM  -  2 ADD 1 CREW CARD  -  3 FIND MATCH', x + w / 2, y + 5, w - 6, '#ffe14d', .7);
   else { const lh = Math.min(8, Math.floor((h - 3) / 3)); fitMini('FIRST TIME?', x + w / 2, y + 3, w - 6, '#ffe14d', .85); fitMini('1 PICK A CARD TEAM  -  2 ADD 1 CREW CARD', x + w / 2, y + 3 + lh + 1, w - 6, '#ffffff', .75); fitMini('3 FIND MATCH', x + w / 2, y + 3 + 2 * lh + 2, w - 6, '#7dff7a', .75); } // QA6: 3 readable lines (one tiny line at 667)
   return;
  }
  // 1.5f: ONE #1 source with the Jade Crown grant (v590uni owned('jadecrown') = R.mine().jk): if I am #1, the card is me
  const myPub600 = () => { const tid = GEAR17 && GEAR17.tid || store.tid, c = LL.__meKT; if (c && c.tid === tid && Date.now() - c.t < 5000) return c.team; const team = myPublic(tid); LL.__meKT = { tid: tid, t: Date.now(), team: team }; return team; };
  let meK = null; try { const m = R.mine(); if (!Wn.__rl_no600king && m && m.jk) meK = { u: m.u, tier: m.tier, div: m.div, team: myPub600(), me600: 1 }; } catch (e) {}
  if (!meK && LL.king && !Wn.__rl_no600king) { try { const a = String(R.mine().u || '').toLowerCase(); if (a && String(LL.king.u || '').toLowerCase() === a) meK = Object.assign({}, LL.king, { me600: 1, team: LL.king.team || myPub600() }); } catch (e) {} }
  if (LL.king === undefined && !meK) { loadKing(); return; }
  loadKing();
  const k = meK || LL.king, J = '#3dff8a';
  rect(x, y, w, h, k ? '#0d3a22' : 'rgba(11,26,32,.92)'); rect(x, y, w, 1, k ? '#ffd23a' : '#6c7f8a');
  if (!k) { textMini('CHASING', x + 18, y + 5, '#9fb8c4'); fitMini('NO KING YET - BE THE FIRST #1', x + 36 + (w - 38) / 2, y + 5, w - 38, '#7dff7a', .7); return; }
  try {
   const kit = Wn.RK15U ? RK15U.kitFor('jadecrown') : null, pl = k.team && k.team.pl || [], id = (pl.find(p => PP(p.id) && PP(p.id).pos !== 'G') || {}).id || teamRosterIds(GEAR17.tid, 'real').find(i => PP(i) && PP(i).pos !== 'G');
   if (kit && id) { const f = lobbyFrame(PP(id).pos, true), b = lobbyBake(f, kit, skinOf(PP(id)), false, false), fit = y < 100 && !Wn.__rl_no600kingfit, sc = fit ? (h - 1) / (b.height + (kit.rk15 === 'jadecrown' ? 3 : 0)) : Math.min(1, 20 / b.height); const up = fit ? 0 : 6; g.save(); g.beginPath(); g.rect(x + 1, y - up, 18, h + up); g.clip(); g.drawImage(b, x + 2, y + h - 0.5 - b.height * sc, b.width * sc, b.height * sc); g.restore(); } // 1.5f B64: the whole player (crown included) fits the banner height
  } catch (e) { fail('king', e); }
  if (!Wn.__rl_no598lob && h < 12) textMini(k.me600 ? 'KING #1' : 'CHASING #1', x + (Wn.__rl_no600kingpos ? 26 : 20 + (k.me600 ? 7 : 10) * 2), y + 3, k.me600 ? J : '#ffd23a'); else { textMini('CHASING', x + 32, y + 3, '#ffd23a'); textMini('#1', x + 32, y + 9, J); }
  fitMini(k.me600 ? 'YOU ARE THE KING  -  ' + R.cname(k.u || '') : R.cname(k.u || '') + '  -  ' + R.lbl(k.tier || 'SQUID', k.div || 1), x + (Wn.__rl_no600kingpos ? 46 : 56) + (w - (Wn.__rl_no600kingpos ? 48 : 58)) / 2, y + 5, w - (Wn.__rl_no600kingpos ? 48 : 58), k.me600 ? '#3dff8a' : '#ffffff', .8);
  if (live) hit('KINGCARD', x, y, w, h, () => { try { LL.profile(k.u, false); } catch (e) {} }, 'rk15king');
 }
 // 1.5c (Charlie): every regular-lobby button here too, same handlers + spots (TEAM CREW left out: online = 1 crew card).
 // Each one comes back to this lobby (LL.extraBack watcher below).
 function extra(fn) { LL.extraBack = { t: Date.now(), tid: GEAR17 && GEAR17.tid }; try { fn(); } catch (e) { fail('extra', e); } }
 function sbtn(key, x, y, w, h, bg, label, fn, live) { if (live) hit(key, x, y, w, h, () => extra(fn), key); if (!Wn.__rl_no597sbtn && textW(label, 1) > w - 6) { R.btn(x, y, w, h, bg, null, { noLabel: 1 }); fitMini(label, x + w / 2, y + Math.round((h - 4) / 2), w, '#0b1a20', .9); } else R.btn(x, y, w, h, bg, label); } // 1.5d: long labels (LOCKER ROOM at 667) shrink to fit, never clip
 function drawLobbyExtras(L, live) {
  if (Wn.__rl_no592lob || lobby.card || overlayOn()) return;
  live = live && !(Wn.V17 && V17.pop && V17.pop());
  try { // DIMES (same pop as the regular lobby)
   const n = V17.ST().chinos | 0, cw = Math.max(40, textW(String(n)) + 30);
   if (live) hit('CHINOS', 1, 1, cw + 2, 13, () => { try { V17.setPop({ kind: 'chinos' }); } catch (e) {} }, 'DIMES ' + n);
   rect(2, 3, cw, 11, '#000'); rect(2, 2, cw, 11, '#14222c'); rect(2, 2, cw, 1, '#ffcc33');
   let coin = false; try { coin = !!(Wn.V39C && V39C.coin && V39C.coin(4, 4)); } catch (e) {} if (!coin) { rect(4, 5, 8, 6, '#05080b'); rect(5, 6, 6, 4, '#ffffff'); rect(5, 9, 6, 1, '#d6dde2'); } /* the game's own dime (V39C) */ text(String(n), 14, 5, 1, '#ffe14d'); textMini('DIMES', 14 + textW(String(n)) + 3 + 10, 5.5, '#cfe');
  } catch (e) { fail('dimes', e); }
  const N8 = !Wn.__rl_no598lob, cw2 = N8 ? 50 : W < 360 ? 46 : 50; // narrow phones: clear of the name tag
  if (Wn.ED31 && !Wn.__rl_no32ed) sbtn('EDIT NAMES', 2, 134, cw2, N8 ? 10 : 11, '#b9a8ff', 'EDIT NAMES', () => ED31.open(), live);
  sbtn('LOCKER ROOM', 2, 146, cw2, N8 ? 10 : 11, '#8fe3f0', 'LOCKER ROOM', () => V17.openLocker(), live);
  sbtn('UNIFORM', 2, N8 ? 158 : 159, cw2, 10, '#ffd23a', 'UNIFORM', () => { if (Wn.B590 && B590.openUnis) B590.openUnis(); }, live);
  { // 1.5c: same spots as every other lobby (L-58 / L-28 top right)
   let lv = 0, wk = 0; try { const S = V17.ST(); lv = Math.min(S.pass.stars, 99); wk = V17.chalSync().filter(c => !S.wk.done[c.id]).length; } catch (e) {}
   const two = (key, x, y, w, h, bg, a, b, fn) => { if (live) hit(key, x, y, w, h, () => extra(fn), key); R.btn(x, y, w, h, bg, null, { noLabel: 1 }); text(a, x + w / 2, y + 1, 1, '#0b1a20', 'center'); if (b) textMini(b, x + w / 2, y + 7, '#0b1a20'); };
   const B = (x, y, w, h, bg) => R.btn(x, y, w, h, bg, null, { noLabel: 1 }); // same cluster as every lobby (items17 drawHome, 1.5c)
   if (N8) { // 1.5f spec: YARD SALE L-58 / PASS L-28 (+ level notch bar) / WEEKLY L-58 (+ count chip)
    if (live) hit('YARD SALE', L - 58, 1, 28, 13, () => extra(() => V17.openShop()), 'YARD SALE'); B(L - 58, 2, 28, 10, '#7dff7a'); fitMini('YARD SALE', L - 44, 4.5, 26, '#0b1a20', .75);
    if (live) hit('PASS', L - 28, 1, 26, 17, () => extra(() => V17.openPass()), 'PASS'); B(L - 28, 2, 26, 11, '#ffcc33'); fitMini('PASS', L - 15, 3.5, 24, '#0b1a20', .75); fitMini('LV' + lv, L - 15, 8.5, 24, '#5a3d00', .55);
    { let st = 0; try { st = (V17.ST().pass.stars | 0) % 5; } catch (e) {} rect(L - 28, 14, 26, 3, '#05080b'); for (let i = 0; i < 5; i++) rect(L - 27 + i * 5, 15, 4, 1, i < st ? '#ffcc33' : '#3a4650'); }
    if (live) hit('WEEKLY', L - 58, 15, wk ? 34 : 26, 11, () => extra(() => V17.openChal()), 'WEEKLY'); B(L - 58, 15, 26, 9, '#b9a8ff'); fitMini('WEEKLY', L - 45, 17.5, 24, '#0b1a20', .75);
    if (wk) { rect(L - 31, 15, 6, 9, '#05080b'); text(String(wk), L - 30, 17, 1, '#ffe14d'); }
   } else {
   if (live) hit('YARD SALE', L - 59, 1, 31, 12, () => extra(() => V17.openShop()), 'YARD SALE'); B(L - 59, 1, 31, 12, '#7dff7a'); fitMini('YARD SALE', L - 43.5, 4.5, 31, '#0b1a20', .75);
   if (live) hit('PASS', L - 27, 1, 25, 12, () => extra(() => V17.openPass()), 'PASS'); B(L - 27, 1, 25, 12, '#ffcc33'); fitMini('PASS', L - 14.5, 2.5, 25, '#0b1a20', .75); fitMini('LV' + lv, L - 14.5, 7.5, 25, '#5a3d00', .55); /* 1.5d */
   if (live) hit('WEEKLY', L - 59, 14, 31, 10, () => extra(() => V17.openChal()), 'WEEKLY'); B(L - 59, 14, 31, 10, '#b9a8ff'); fitMini('WEEKLY', wk ? L - 46.5 : L - 43.5, 17, wk ? 25 : 32, '#0b1a20', .75);
   if (wk) { rect(L - 35, 15, 6, 8, '#05080b'); text(String(wk), L - 34, 16, 1, '#ffe14d'); }
   }
  }
  if (!Wn.__rl_no2402 && !Wn.__rl_v124gb) { const cx = L - 46, cy = N8 ? 158 : 133; if (live) hit('CHIRP LOADOUT', cx, cy, 44, N8 ? 12 : 11, () => extra(() => V17.openCload()), 'CHIRP LOADOUT'); R.btn(cx, cy, 44, N8 ? 10 : 11, '#ff9a4a', null, { noLabel: 1 }); if (Wn.__rl_no597chirp) { text('CHIRP', cx + 22, cy + 1, 1, '#0b1a20', 'center'); textMini('LOADOUT', cx + 22, cy + 7, '#0b1a20'); } else { fitMini('CHIRP', cx + 22, cy + (N8 ? 1 : 2), 44, '#0b1a20', .75); fitMini('LOADOUT', cx + 22, cy + (N8 ? 5.2 : 6.5), 44, '#0b1a20', .55); } } /* 1.5d: two lines that fit the 9px plate (LOADOUT was cut by the bottom shade) */
 }
 // back to the online lobby after any of those screens closes
 setInterval(() => { try { const b = LL.extraBack; if (!b || off()) return; if (Date.now() - b.t > 30 * 60e3) { LL.extraBack = null; return; }
  if (screen === 'gear17' && GEAR17 && GEAR17.ll15) { if (Date.now() - b.t > 1500) LL.extraBack = null; return; }
  if (screen === 'menu' && !(Wn.V17 && V17.pop && V17.pop()) && !document.querySelector('#rk15pick[style*="flex"]') && Date.now() - b.t > 300) { LL.extraBack = null; if (b.tid) store.tid = b.tid; LL.open(); }
 } catch (e) {} }, 250);
 function drawNoTeam(L, live) {
  const X = L + 5, RW = W - X - 5, cx = Math.round(X + RW / 2);
  rightBg(L, tierCol('SQUID'));
  text('LOCKER LEAGUE', cx, 4, 1, '#ffe14d', 'center', '#000');
  ['CARD TEAMS ONLY.', 'MAKE A CARD TEAM FROM', 'YOUR PLAYER CARDS FIRST', '(12+ CARDS WITH A GOALIE).'].forEach((s, i) => text(s, cx, 26 + i * 10, 1, i ? '#cfe' : '#ffe14d', 'center'));
  NB({ x: X, y: 76, w: RW, h: 24, bg: '#7dff7a', label: 'MAKE A CARD TEAM', tri: 1, fn: () => { try { if (Wn.CT600 && CT600.make('ll')) return; GEAR17 = null; screen = 'menu'; M37.page = 'play'; V469.page = 'reg'; const q = menuBars(false).flat().find(b => b && b.label === 'QUICK MATCH'); if (q) q.fn(); } catch (e) {} } }, live); // 1.5 B72: TEAMS + RATINGS card-team builder (v600ct)
  NB({ x: X, y: 146, w: RW, h: 12, label: 'BACK', back: 1, fn: () => LL.close() }, live);
 }
 // ---------- public profile column ----------
 function drawProfCol(L, live, v, vs) {
  v = v || LL.view; const p = v.prof || {};
  const  X = L + 5, RW = W - X - 5, cx = Math.round(X + RW / 2);
  const tier = (p.ranked === false || !p.tier ? 'SQUID' : p.tier), div = p.ranked === false ? 1 : p.div || 1, tc = tierCol(tier);
  rightBg(L, tc);
  const nm = R.cname(v.u || p.u || ''), sc = textW(nm, 2) <= RW ? 2 : 1;
  text(nm, cx, 3, sc, '#ffffff', 'center', '#000');
  textMini('PUBLIC PROFILE - LOOK ONLY', cx, 4 + 5 * sc + 2, '#7dff7a', .75);
  if (v.loading) { text('LOADING...', cx, 60, 1, '#cfe', 'center'); NB({ x: X, y: 160, w: RW, h: 12, label: 'BACK', back: 1, fn: closeView }, live); return; }
  if (v.err) { text(v.err, cx, 60, 1, '#ff9a8a', 'center'); NB({ x: X, y: 160, w: RW, h: 12, label: 'BACK', back: 1, fn: closeView }, live); return; }
  const sh = R.img(tier, div, 'shine'), by = 28;
  if (sh.complete && sh.naturalWidth) { g.imageSmoothingEnabled = false; g.drawImage(sh, X + 2, by, 40, 44); } else R.drawBadge(X + 12, by + 10, tier, div, 1);
  const tx = X + 48, tw2 = RW - 48;
  text(R.lbl(tier, div), tx, by + 2, 1, tc.L, 'left', '#000');
  const pts = p.pts | 0, inDiv = tier === 'JADE KING' ? 100 : pts % 100;
  fitMini(R.ruleTxt(tier), tx + tw2 / 2, by + 12, tw2, '#cfe', .75); // v2: this tier's rules (harder higher up); bar = banked progress
  for (let i = 0; i < 10; i++) rect(tx + i * Math.floor(tw2 / 10), by + 19, Math.floor(tw2 / 10) - 1, 4, i < Math.floor(inDiv / 10) ? '#7dff7a' : '#1c2a33');
  const nxt = tier === 'JADE KING' ? (p.jk ? 'NUMBER 1 PLAYER' : 'TOP TIER') : div < 5 ? 'NEXT: ' + R.lbl(tier, div + 1) : 'NEXT: ' + R.TIERS[R.TIERS.findIndex(t => t.n === tier) + 1].n + (R.TIERS.findIndex(t => t.n === tier) + 1 < 6 ? ' I' : '');
  fitMini(nxt, tx + tw2 / 2, by + 27, tw2, '#9fb8c4', .75);
  const rows = [['WORLD RANK', R.down ? 'SOON' : p.rank == null ? '-' : (p.tied ? '#' + p.rank.toLocaleString() + ' TIED' : p.rank.toLocaleString() + (p.total ? ' / ' + p.total.toLocaleString() : ''))], ['LOCKER RATING', (p.lk | 0) ? (p.lk | 0).toLocaleString() + (p.lkRank ? '  #' + p.lkRank : '') : '-'], ['RANKED', (p.w | 0) + '-' + (p.l | 0)]];
  rows.forEach((r, i) => { const y = 78 + i * 13; rect(X, y, RW, 11, 'rgba(11,26,32,.9)'); rect(X, y, 2, 11, '#ffe14d'); textMini(r[0], X + 9 + r[0].length * 1.6, y + 3, '#9fb8c4', .75); text(r[1], X + RW - 3, y + 3, 1, '#ffffff', 'right'); });
  const tm = p.team, tl = tm ? R.cname(tm.name) + (tm.rku ? ' - ' + String(tm.rku).split('_')[0].toUpperCase() + ' RANKED UNI' : '') : (p.ranked ? 'NO CARD TEAM SHARED' : 'NEW ACCOUNT - TIED AT THE BOTTOM');
  fitMini(tl, cx, 120, RW, '#ffd23a', .75);
  const hw = Math.floor((RW - 4) / 2);
  if (vs) { fitMini(v.cpu ? (Wn.__rl_no594nasty ? (v.diff || 'MEDIUM') : 'ONLINE') + ' CPU BOT - ' + (p.team && p.team.name || '') : 'GAME NAME ONLY - NO CHAT', cx, 132, RW, '#c9d6d9', .75); return; }
  if (!v.me) {
   NB({ x: X, y: 128, w: hw, h: 14, bg: '#ffd23a', label: v.added ? 'SENT' : 'ADD FRIEND', fn: () => { if (v.added) return; v.added = 1; try { V23.open(null); const f = document.getElementById('f23'); if (f) { f.value = v.u; const b = document.getElementById('b23add'); if (b) b.click(); } } catch (e) {} } }, live);
   NB({ x: X + hw + 4, y: 128, w: hw, h: 14, bg: v.reported ? '#7f8f99' : '#ff5a4a', label: v.reported ? 'REPORTED' : 'REPORT', fn: () => { if (v.reported) return; if (!confirm('REPORT ' + R.cname(v.u) + ' FOR A BAD NAME? WE CHECK EVERY REPORT.')) return; v.reported = 1; R.call('report', { u: v.u, why: 'name' }); } }, live);
  }
  NB({ x: X, y: 150, w: RW, h: 12, label: 'BACK', back: 1, fn: closeView }, live);
  fitMini('GAME NAME ONLY - NO CHAT', cx, 170, RW, '#c9d6d9', .75);
 }
 // ---------- read-only gear slots for a profile (their gear, not mine) ----------
 const icn = {};
 function iconImg(id) { if (!icn[id]) { icn[id] = new Image(); try { icn[id].src = V17.iconUrl(id); } catch (e) {} } return icn[id]; }
 function drawViewGear(L, pid) {
  const gr = remoteGear(pid) || {}, left = [['helmet', 'HELMET'], ['collar', 'COLLAR'], ['chest', 'CHEST'], ['legs', 'SHORTS'], ['cleats', 'CLEATS']], right = [['stick', 'STICK'], ['tape', 'TAPE'], ['celly', 'CELLY']];
  const box = (k, lab, x, y, w, h) => { rect(x, y, w, h, 'rgba(11,26,32,.88)'); rect(x, y, w, 1, gr[k] ? '#ffe14d' : '#2c4452'); const id = gr[k]; if (id) { const im = iconImg(id); if (im.complete && im.naturalWidth) { g.imageSmoothingEnabled = false; const s = Math.min((w - 4) / im.naturalWidth, (h - 8) / im.naturalHeight); g.drawImage(im, Math.round(x + w / 2 - im.naturalWidth * s / 2), y + 2, im.naturalWidth * s, im.naturalHeight * s); } } textMini(lab, x + w / 2, y + h - 5, gr[k] ? '#ffffff' : '#7f8f99', .6); };
  left.forEach((s, i) => box(s[0], s[1], 2, 16 + i * 21, 24, 19));
  right.forEach((s, i) => box(s[0], s[1], L - 26, 34 + i * 21, 24, 19));
 }

 // ---------- ONE profile renderer: the profile page AND both halves of the versus screen draw through this ----------
 // 1.5d (Charlie round 4): the player arrows on a PUBLIC PROFILE and on both sides of FINDING MATCH did nothing: their taps
 // stepped the MAIN lobby (the profile's lobby state is swapped back after every draw), the tap boxes ignored the room's
 // translate/scale, and the FINDING MATCH rooms drew the arrows with no tap box at all. Now each room's arrows get their own
 // DOM tap box (the same uiSpecs buttons as every lobby button - touch + mouse) in screen space, stepping that room's player.
 function stepView(P, d) {
  const sv = { tid: GEAR17.tid, locked: GEAR17.locked, view: LL.view, side: LL.heroSide, lob: { idx: lobby.idx, key: lobby.key, pid: lobby.pid, at: lobby.at, dir: lobby.dir, card: lobby.card } };
  try { GEAR17.tid = P.tid; GEAR17.locked = false; LL.view = P.v; LL.heroSide = P.v.me ? null : 'opp'; Object.assign(lobby, P.v.lob); lobbyStep(d); P.v.lob = { idx: lobby.idx, key: lobby.key, pid: lobby.pid, at: lobby.at, dir: lobby.dir }; }
  catch (e) { fail('stepView', e); }
  finally { GEAR17.tid = sv.tid; GEAR17.locked = sv.locked; LL.view = sv.view; LL.heroSide = sv.side; Object.assign(lobby, sv.lob); }
 }
 try { const hit0 = Wn.hit; if (typeof hit0 === 'function' && !hit0.__p597) { const hh = function (key, x, y, w, h, fn, label) { const P = LL.__pv; if (P && !Wn.__rl_no597arr) { const t = TX; let k2 = key; if (/^UNI L (PREV|NEXT)$/.test(key) && !P.v.me) return; /* someone else's profile / the opponent: no uniform switch (it sat over the player arrows) */ if (/^LOBBY (PREV|NEXT)$/.test(key)) { const d = /NEXT/.test(key) ? 1 : -1; fn = () => stepView(P, d); k2 = key + '|' + P.slot; } return hit0.call(this, k2, t.ox + x * t.sc, t.oy + y * t.sc, w * t.sc, h * t.sc, fn, label); } return hit0.apply(this, arguments); }; hh.__p597 = 1; Wn.hit = hh; } } catch (e) {}
 try { const la0 = Wn.lobbyArrowArt; if (typeof la0 === 'function' && !la0.__p597) { const la = function (x, y, dir) { const r = la0.apply(this, arguments); try { const P = LL.__pv; if (P && P.vs && !Wn.__rl_no597arr) hit(dir > 0 ? 'LOBBY NEXT' : 'LOBBY PREV', x - 3, y - 4, 24, 34, null, dir > 0 ? 'NEXT PLAYER' : 'PREVIOUS PLAYER'); } catch (e) {} return r; }; la.__p597 = 1; Wn.lobbyArrowArt = la; } } catch (e) {}
 try { const bt0 = Wn.button; if (typeof bt0 === 'function' && !bt0.__p597) { const bt = function (label, x, y, w, h) { if (LL.__prof597 && label === 'STATS') { const a = Array.prototype.slice.call(arguments); a[1] = 4; a[2] = H - h - 5; return bt0.apply(this, a); } return bt0.apply(this, arguments); }; bt.__p597 = 1; Wn.button = bt; } } catch (e) {}
 function drawProfileAt(v, ox, oy, sc, live, slot, vs, roomOnly) {
  const sv = { tid: GEAR17.tid, locked: GEAR17.locked, view: LL.view, side: LL.heroSide, lob: { idx: lobby.idx, key: lobby.key, pid: lobby.pid, at: lobby.at, dir: lobby.dir } };
  v.lob = v.lob || { idx: 0, key: '', pid: null, at: -9, dir: 0 };
  g.save(); g.translate(ox, oy); g.scale(sc, sc); g.beginPath(); g.rect(0, 0, roomOnly ? lobbyBounds().L : W, H); g.clip(); TX = { ox: ox, oy: oy, sc: sc };
  try {
   const tid = v.tid && SZ_REG[v.tid] || v.tid && T(v.tid) && T(v.tid).id === v.tid ? v.tid : null;
   GEAR17.tid = tid || TEAMS[0].id; GEAR17.locked = !tid; LL.view = v; LL.heroSide = v.me ? null : 'opp';
   Object.assign(lobby, v.lob);
   LL.__pv = tid ? { v: v, tid: tid, slot: slot || 'p', vs: !!vs } : null;
   const { L } = lobbyBounds();
   bgStripes(); rect(L, 0, W - L, H, 'rgba(0,0,0,.35)');
   LL.__prof597 = !roomOnly && !Wn.__rl_no597prof;
   try { if (!tid) { lobbyRoom(L, LOBBY_GRAY, true, TT()); lobbyLock(Math.round(L * .48), 90, 4); } else drawLobbyLeft(L, live); } finally { LL.__prof597 = false; }
   if (!roomOnly) drawProfCol(L, live, v, vs);
   if (tid && !LL.anim && !LL.reveal) { // 1.5c (TestFlight 3): player card top-right, off the player; crew card bottom-left
    const st = lobbyState(); const tm = v.prof && v.prof.team; const hC = Wn.__rl_no597card ? Math.min(56, Math.round(H * .3)) : 52, hR = Math.round(hC * .8);
    placeCards(st.pid, null, L - 2 - Math.round(hC * .68), Wn.__rl_no597card ? 16 : 3, hC, hR, slot); // 1.5e: card ends at y 55, clear of the right player arrow (y 58+)
    // 1.5d (Charlie round 4): player card TOP RIGHT, crew card BIGGER in the BOTTOM RIGHT (STATS moves to the bottom-left corner)
    const hX = Wn.__rl_no597prof ? hR : Math.min(Math.round(44 / .68), H - 96 - 4), cx = Wn.__rl_no597prof ? 26 : L - 3 - Math.round(hX * .68);
    if (tm && tm.crew && !roomOnly) placeCards(null, tm.crew, cx, H - hX - 4, hX, hX, slot + 'c'); else hideCards(slot + 'c');
   }
   else { hideCards(slot); hideCards(slot + 'c'); }
   v.lob = { idx: lobby.idx, key: lobby.key, pid: lobby.pid, at: lobby.at, dir: lobby.dir };
  } catch (e) { fail('profileAt', e); }
  finally { LL.__pv = null; g.restore(); TX = { ox: 0, oy: 0, sc: 1 }; GEAR17.tid = sv.tid; GEAR17.locked = sv.locked; LL.view = sv.view; LL.heroSide = sv.side; Object.assign(lobby, sv.lob); }
 }
 LL.drawProfileAt = drawProfileAt;
 function meView() { const m = R.mine(), tid = GEAR17 && GEAR17.tid || store.tid; const old = LL.meV; LL.meV = { me: true, u: m.u, tid: tid, prof: Object.assign({}, m, { team: myPublic(tid) }), lob: old && old.tid === tid ? old.lob : null }; return LL.meV; }
 function oppView() {
  const m = LL.match; if (!m) return null; const o = m.opp || {};
  if (LL.oppV && LL.oppV.mid === (m.mid || m.code || o.u)) return LL.oppV;
  let v;
  if (m.bot && SZ_REG.RK15BOT && LL.botName && SZ_REG.RK15BOT.name !== LL.botName) { SZ_REG.RK15BOT.name = LL.botName; SZ_REG.RK15BOT.full = LL.botName + ' (CPU)'; }
  if (LL.oppV && LL.oppV.mid === (m.mid || m.code || o.u)) return LL.oppV;
  if (m.bot) { const ids = (SZ_REG.RK15BOT && SZ_REG.RK15BOT.roster) || []; v = { cpu: true, diff: o.diff, u: (LL.botName || 'CPU') + ' CPU', tid: o.tid, prof: { u: (LL.botName || 'CPU'), tier: o.tier, div: o.div, ranked: true, rank: null, pts: (LL.bot && LL.bot.pts) || 0, w: 0, l: 0, team: { name: LL.botName || 'CPU', pl: ids.map(id => ({ id: id, card: id, gear: {} })) } } }; }
  else v = { u: o.u, tid: SZ_REG.RK15OPP ? 'RK15OPP' : null, prof: o };
  v.mid = m.mid || m.code || o.u; LL.oppV = v; return v;
 }
 // ---------- searching / found / versus ----------
 let qT = 0, qBusy = false;
 function cancelSearch() { if (LL.mode === 'search' || LL.mode === 'offer') { try { if (!R.down) R.call('cancel', {}); } catch (e) {} } if (LL.mode !== 'lobby') LL.mode = 'lobby'; LL.match = null; LL.bot = null; LL.heroSide = null; }
 function startSearch() {
  if (off()) return;
  const tid = GEAR17 && GEAR17.tid; if (!tid) return;
  store.tid = tid; save(); pushTeam(true);
  LL.mode = 'search'; LL.t0 = now(); LL.offerAt = 30; LL.match = null; LL.bot = null; LL.online = null; qT = 0;
  if (R.down) { LL.mode = 'offer'; LL.bot = null; botAsk(); }
 }
 async function poll() {
  if (qBusy || LL.mode !== 'search' && LL.mode !== 'offer') return;
  qBusy = true;
  try {
   const j = await R.call('queue', {});
   if (LL.mode !== 'search' && LL.mode !== 'offer') { if (!(j && j.match)) return; try { R.call('cancel', {}); } catch (e) {} return; }
   if (j && j.match && !Wn.__rl_no74old && LL.left74 && LL.left74.has(j.match.mid)) { // B74: never back into a match I already left (the server still hands it out until it is decided)
    try { R.call('result', { mid: j.match.mid, my: 0, opp: 0 }); } catch (e) {} LL.old74 = (LL.old74 | 0) + 1; return;
   }
   if (j && j.match) { found(j.match); return; }
   if (j && j.ok) { LL.online = j.online; }
   else if (j && j.down) { LL.mode = 'offer'; botAsk(); }
  } finally { qBusy = false; }
 }
 async function botAsk() {
  if (LL.botInfo) return;
  let info = null;
  if (!R.down) { const j = await R.call('bot', {}); if (j && j.ok) info = Object.assign({ mid: j.mid }, j.bot); }
  if (!info && Wn.RK15BOT) info = RK15BOT.localInfo(R.mine().pts | 0); // practice: no server, no points
  LL.botInfo = info;
 }
 function found(m) {
  LL.oppV = null; LL.match = m; LL.mode = 'found'; LL.foundT = now(); LL.oppTeam = m.opp && m.opp.team || null;
  regRemote('RK15OPP', LL.oppTeam);
 }
 function playBot() {
  const info = LL.botInfo; if (!info || !Wn.RK15BOT) return;
  try { if (!R.down && LL.mode === 'search') R.call('cancel', {}); } catch (e) {}
  const tid = RK15BOT.make(info, GEAR17.tid);
  if (!tid) { LL.err = 'bot team'; return; }
  LL.oppV = null; LL.bot = info; LL.botName = info.name; LL.mode = 'found'; LL.foundT = now(); LL.oppTeam = { name: info.name, pl: [] };
  LL.match = { bot: true, mid: info.mid || null, opp: { u: info.name + ' CPU', tier: info.tier, div: info.div, ranked: true, rank: null, team: null, cpu: true, diff: info.diff, tid: tid } };
 }
 function skipToss(G) { // pick the ends at random (what the CPU would do) and go straight to the faceoff / run out
  let n = 0; const iv = setInterval(() => { try { if (typeof game === 'undefined' || game !== G || ++n > 40) { clearInterval(iv); return; } const c = G.coin; if (!c) return; clearInterval(iv); if (c.phase !== 'done') { try { if (typeof coinPick15 === 'function' && typeof ENDS15 !== 'undefined') coinPick15(G, ENDS15[Math.random() < .5 ? 0 : 1], Math.random() < .5 ? 0 : 1); } catch (e) {} c.phase = 'done'; } } catch (e) { clearInterval(iv); } }, 30);
 }
 function startMatch() {
  const m = LL.match; if (!m) return;
  const tid = GEAR17.tid;
  store.played = 1; save();
  hideCards();
  LL.cur = { mid: m.mid, bot: !!m.bot, tid: tid, tier0: R.mine(), reported: false, t0: Date.now(), practice: !m.mid };
  if (m.bot && Wn.RK15ALT && RK15ALT.botGate(m, tid, () => startMatch())) return; // 1.5c: uniform clash vs CPU -> coin flip, loser picks (countdown waits)
  if (m.bot) {
   const info = LL.bot;
   LL.savedDiff = SETTINGS.diff;
   try { SETTINGS.diff = Wn.__rl_no594nasty ? (info.diff === 'GOOD' ? 2 : 1) : 4; applyDiff && applyDiff(); } catch (e) {} // 1.5c: online / ranked = NASTY
   try { if (Wn.LL600) LL600.lockBot(); } catch (e) {} // 1.5 B72: the same locked PRO settings vs the CPU
   GEAR17 = null; LL.mode = 'lobby';
   try { V17.setMTeam && V17.setMTeam(tid); } catch (e) {}
   newGame(tid, m.opp.tid, 'quick', true, { label: 'LOCKER LEAGUE', ll15: { mid: m.mid, bot: info.name, diff: info.diff }, items17: true, crew232: true });
   try { const A = m.alt15; if (A && typeof game !== 'undefined' && game) { if (A.myKit) game.uk = A.myKit; if (A.botKit) game.ok = A.botKit; } } catch (e) {}
   try { if (typeof game !== 'undefined' && game) { game.preT = 99; skipToss(game); } } catch (e) {} // the match-found countdown IS the pregame: no pregame, no dime toss
   return;
  }
  // real player: open the paired room through the normal online code (existing protocol)
  GEAR17 = null; LL.mode = 'lobby';
  LL.pvp = { code: m.code, host: m.host, sent: 0, tid: tid };
  try { RLNET.joinGame(m.code); } catch (e) { fail('join', e); }
 }
 // 1.5 B74 (Charlie, 2 phones: 'took ~3 tries, kept bouncing'): the room got the raw card-team id first and v331 swapped it to
 // the online alias right after; every team change resets BOTH ready flags, and the ready was re-sent every 400 ms while
 // v331 was still un-readying for its version check -> ready ping-pong for 10-20 s on a slow connection. Now one way:
 // 1) the card team goes in once, already as the v331 alias (netPick) + my gear / uni / settings, 2) READY only when my team
 // and the opponent's are in the room and v331 has nothing to wait for, 3) a lost READY is re-sent at most every 1.5 s.
 // Kill switch: window.__rl_no74flow (the old 1.5c steps)
 const cd77 = () => (!Wn.__rl_no77cd && LL.match && !LL.match.bot) ? 3 : 5; // 1.5 B77: 3 s match-found countdown vs a player (bots keep 5)
 function flow74(P, N, st, host, me) {
  const o = host ? 'g' : 'h', tid = P.tid, V = Wn.V331, t = Date.now();
  if (P.sent === 0) {
   P.sent = 1; P.f74 = 1;
   let picked = false; try { if (V && V.netPick && V.onCT && V.onCT() && Wn.V33 && V33.kindOf(tid)) picked = !!V.netPick(tid); } catch (e) {}
   const cur = st[me + 'szn'] || null, pay = picked && cur ? Object.assign({}, cur) : (typeof szPayload15 === 'function' ? szPayload15(tid) : null);
   try { if (pay && Wn.RK15U) pay.rk15u = RK15U.wornKey(tid); if (pay && !pay.rk15u && Wn.V446 && V446.wears(tid) && Wn.V445) pay.rk15fit = V445.pick(); } catch (e) {}
   const p = { [me + 'szn']: pay, [me + 'cz232']: true };
   if (!picked) { p[me + 'team'] = tid; p[me + 'lu'] = lineupFor(tid, 'real'); }
   try { if (V17.lobPay) p[me + '17'] = V17.lobPay(tid); } catch (e) {}
   try { if (Wn.UNI21 && UNI21.on()) p[me + 'u21'] = UNI21.viewK(0, tid); } catch (e) {}
   if (host) { p.settings = Object.assign({ diff: Wn.__rl_no594nasty ? SETTINGS.diff : 4, qlen: SETTINGS.qlen, halves: !!SETTINGS.halves, twoPt: !!SETTINGS.twoPt }, Wn.LL600 && LL600.lock() || {}, { items17: true, ll15: 1 }); p.sseq = Date.now(); }
   Object.assign(st, p); N.patchLobby(p).then(() => { P.sent = 2; P.rt = 0; });
   try { P.mine77 = { [me + 'team']: st[me + 'team'], [me + 'lu']: st[me + 'lu'], [me + 'szn']: st[me + 'szn'] }; Object.assign(P.mine77, p); delete P.mine77.sseq; } catch (e) {}
   LL.f74 = { pick: picked, t: t };
   return true;
  }
  if (!P.f74) return false;
  if (P.sent !== 2 || st.start) return true;
  const slot77 = Wn.__rl_no77fix ? true : (Date.now() % 3000 < 1500) === host; // B77: host + guest re-send in turns (the room server keeps only the last whole-state write)
  // 1.5 B77 (live server: 4 bounces in a row): the room's state is read + written whole per request, so when both phones patch
  // at the same moment one patch can be lost (the mock server never loses one). If my team / card-team data / settings are
  // missing or not what I sent, send them again (at most every 2 s; same values = no ready reset). Kill: __rl_no77fix
  if (!Wn.__rl_no77fix && P.mine77 && slot77 && t - (P.fx77 || 0) > 2000) {
   const M = P.mine77, lost = Object.keys(M).filter(k => k !== 'settings' && M[k] != null && (k === me + 'team' ? st[k] !== M[k] : k === me + 'szn' ? !(st[k] && st[k].id === M[k].id && (st[k].rk15u || null) === (M[k].rk15u || null) && (st[k].rk15fit || null) === (M[k].rk15fit || null)) : st[k] == null)).concat(host && M.settings && !(st.settings && st.settings.ll15) ? ['settings'] : []);
   if (lost.length) { P.fx77 = t; LL.fix77 = (LL.fix77 | 0) + 1; const q = {}; for (const k of lost) q[k] = M[k]; if (q.settings) q.sseq = Date.now(); Object.assign(st, q); N.patchLobby(q); return true; }
  }
  let why = ''; try { why = V && V.netWhy ? V.netWhy() : ''; } catch (e) {}
  if (!st[me + 'team'] || !st[o + 'team'] || why) return true;
  // B74 guard (Charlie: 'my next match had me playing as UTAH'): before READY (= before the coin flip) my side of the room must
  // be MY card team - a registered team of mine, never a fallback; otherwise pick it again (one way, still no loop)
  const mt = st[me + 'team'], mr = typeof SZ_REG !== 'undefined' && SZ_REG[mt];
  if (!mr || !(mr.mine || mt === tid)) { if ((P.re74 | 0) < 3) { P.re74 = (P.re74 | 0) + 1; P.sent = 0; LL.reg74 = (LL.reg74 | 0) + 1; } return true; }
  if (!st[me + 'ready'] && slot77 && t - (P.rt || 0) > 1500) { P.rt = t; st[me + 'ready'] = true; N.patchLobby({ [me + 'ready']: true }); }
  return true;
 }
 // auto pick + ready in the paired room
 setInterval(() => {
  try {
   const P = LL.pvp, N = Wn.RLNET; if (!P || !N || !N.code || N.code !== P.code || !N.lobby || !N.lobby.state) return;
   if (N.inGame) { P.sent = 9; return; }
   const st = N.lobby.state, host = N.side === 'h', me = host ? 'h' : 'g';
   if (!Wn.__rl_no74flow && flow74(P, N, st, host, me)) return;
   if (P.sent === 0) {
    P.sent = 1;
    const tid = P.tid, pay = typeof szPayload15 === 'function' ? szPayload15(tid) : null;
    try { if (pay && Wn.RK15U) pay.rk15u = RK15U.wornKey(tid); if (pay && !pay.rk15u && Wn.V446 && V446.wears(tid) && Wn.V445) pay.rk15fit = V445.pick(); } catch (e) {}
    const p = { [me + 'team']: tid, [me + 'lu']: lineupFor(tid, 'real'), [me + 'szn']: pay, [me + 'cz232']: true };
    try { if (V17.lobPay) p[me + '17'] = V17.lobPay(tid); } catch (e) {}
    try { if (Wn.UNI21 && UNI21.on()) p[me + 'u21'] = UNI21.viewK(0, tid); } catch (e) {}
    if (host) { p.settings = Object.assign({ diff: Wn.__rl_no594nasty ? SETTINGS.diff : 4, qlen: SETTINGS.qlen, halves: !!SETTINGS.halves, twoPt: !!SETTINGS.twoPt }, Wn.LL600 && LL600.lock() || {}, { items17: true, ll15: 1 }); p.sseq = Date.now(); } // 1.5 B72: ranked = locked PRO settings + NASTY (v600ll72)
    N.patchLobby(p).then(() => { N.patchLobby({ [me + 'ready']: true }); P.sent = 2; });
   } else if (P.sent === 2 && !st[me + 'ready'] && !st.start) { P.sent = 1; N.patchLobby({ [me + 'ready']: true }).then(() => { P.sent = 2; }); }
  } catch (e) { fail('pvp', e); }
 }, 400);
 // ---------- drawing the versus / search screen ----------
 function heroBox(x0, w, side, info, live) { // side: 'me' | 'opp' | 'search'
  const t = TT(), L = w;
  g.save(); g.translate(x0, 0); g.beginPath(); g.rect(0, 0, w, H); g.clip();
  try {
   let kit = LOBBY_GRAY, locked = true, pid = null, pos = 'A', tid = null;
   if (side === 'me') tid = info.tid; else if (side === 'opp') tid = info.tid;
   if (tid && T(tid)) { const ids = teamRosterIds(tid, 'real').filter(id => PP(id) && PP(id).pos !== 'G').sort((a, b) => curOvr14(b) - curOvr14(a)); pid = ids[0] || null; if (pid) { locked = false; pos = PP(pid).pos; try { kit = Wn.UNI21 && UNI21.on() ? UNI21.heroKit(0, tid) : lobbyKit(tid); } catch (e) { kit = lobbyKit(tid); } } }
   LL.themeTier = info.tier || 'SQUID'; LL.noTheme = side === 'search';
   lobbyRoom(L, locked ? LOBBY_GRAY : kit, locked, t);
   LL.themeTier = null; LL.noTheme = false;
   const cx = Math.round(L * .5), feetY = 150, k = 4;
   lobbyPad(lobbyHeroGeo(cx, pos, k).footX, feetY + 1, side === 'search' ? '#7dff7a' : tierCol(info.tier || 'SQUID').L, t);
   LL.heroSide = side === 'opp' ? 'opp' : null;
   Wn.__v17hp = locked ? null : pid;
   try { lobbyHero(cx, feetY, pos, kit, pid ? skinOf(PP(pid)) : 0, locked, k, t, 1, 0); } finally { Wn.__v17hp = null; LL.heroSide = null; }
   if (side === 'search') { const sy = (t * 60) % 150 + 10; g.save(); g.globalAlpha = .25; rect(0, sy, L, 6, '#7dff7a'); g.restore(); }
  } catch (e) { fail('heroBox', e); }
  g.restore();
 }
 function infoBox(x, y, w, side, info) {
  const tc = tierCol(info.tier || 'SQUID'), col = side === 'search' ? '#7dff7a' : tc.L;
  rect(x, y, w, 36, 'rgba(5,8,11,.94)'); rect(x, y, w, 1, col); rect(x, y + 35, w, 1, col); rect(x, y, 1, 36, col); rect(x + w - 1, y, 1, 36, col);
  if (side === 'search') {
   const s = Math.floor(now() - LL.t0), mm = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
   { const m = R.mine(); if (Wn.__rl_no597rk) R.drawBadge(x + 5, y + 7, 'SQUID', 1, 1); else R.drawBadge(x + 5, y + 7 - (m.tier === 'JADE KING' ? 4 : 0), m.tier || 'SQUID', m.div || 1, 1); } /* 1.5d: was a fixed SQUID I badge - the 'SQUID 1' Charlie saw while searching */
   text('SEARCHING ' + mm, x + 30, y + 5, 1, '#7dff7a');
   const on = LL.online ? Math.max(1, LL.online.on | 0) : 0;
   fitMini('NEAR ' + R.mineLbl() + (on ? ' - ' + on.toLocaleString() + ' ONLINE' : ''), x + 30 + (w - 34) / 2, y + 15, w - 34, '#cfe', .75);
   fitMini('BOT OFFER AFTER 0:30', x + 30 + (w - 34) / 2, y + 24, w - 34, '#9fb8c4', .75);
   return;
  }
  if (side === 'me' && !R.real()) { text('PRACTICE', x + 8, y + 5, 1, '#9fb8c4'); fitMini('RANKINGS COMING SOON', x + w / 2, y + 15, w - 8, '#ffffff', .75); fitMini((info.teamName || '') + (info.ovr ? ' - OVR ' + info.ovr : ''), x + w / 2, y + 24, w - 8, '#ffd23a', .75); return; }
  R.norm && R.norm(info); /* 1.5d: one rank source + formatter */
  R.drawBadge(x + 5, y + 7 - (info.tier === 'JADE KING' ? 4 : 0), info.ranked === false ? 'SQUID' : info.tier || 'SQUID', info.ranked === false ? 1 : info.div || 1, 1);
  text(info.ranked === false ? 'SQUID I' : R.fmt ? R.fmt(info) : R.lbl(info.tier || 'SQUID', info.div || 1), x + 30, y + 5, 1, col);
  if (info.cpu) { const cw = textW('CPU') + 4; rect(x + w - cw - 5, y + 4, cw, 7, '#c9d6d9'); text('CPU', x + w - cw - 3, y + 5, 1, DK); }
  const l2 = info.cpu ? (Wn.__rl_no594nasty ? (info.diff || 'MEDIUM') : 'ONLINE') + ' BOT - ' + (info.name || '') : 'WORLD ' + (info.rank == null ? '-' : (info.tied ? '#' + info.rank + ' TIED' : info.rank.toLocaleString())) + (info.lkRank ? ' - LOCKER ' + info.lkRank.toLocaleString() : '');
  fitMini(l2, x + 30 + (w - 34) / 2, y + 15, w - 34, '#ffffff', .75);
  fitMini((info.teamName || '') + (info.ovr ? ' - OVR ' + info.ovr : ''), x + 30 + (w - 34) / 2, y + 24, w - 34, '#ffd23a', .75);
 }
 function myInfo() { const m = R.mine(), tid = GEAR17 && GEAR17.tid || store.tid; return { u: m.u, tier: m.tier, div: m.div, rank: m.rank, tied: m.tied, lkRank: m.lkRank, tid: tid, teamName: tname(tid), ovr: ovrOf(tid) }; }
 function oppInfo() {
  const m = LL.match; if (!m) return null; const o = m.opp || {};
  if (m.bot) return { u: o.u, tier: o.tier, div: o.div, cpu: true, diff: o.diff, name: (LL.bot && LL.bot.name) || '', tid: o.tid, teamName: tname(o.tid), ovr: ovrOf(o.tid) };
  return { u: o.u, tier: o.ranked ? o.tier : 'SQUID', div: o.ranked ? o.div : 1, ranked: o.ranked, rank: o.rank, tied: o.tied, lkRank: o.lkRank, tid: SZ_REG.RK15OPP ? 'RK15OPP' : null, teamName: o.team ? R.cname(o.team.name) : '', ovr: SZ_REG.RK15OPP ? ovrOf('RK15OPP') : 0 };
 }
 function themeHalf(x0, w, tier, div) { // rank-themed art behind each half (tier colours, stripes, a big faded badge)
  const tc = tierCol(tier || 'SQUID');
  rect(x0, 0, w, H, tc.X || '#0b1118');
  for (let x = 0; x < w; x += 10) { g.save(); g.globalAlpha = .35; rect(x0 + x, 0, 5, H, tc.D || '#14232b'); g.restore(); }
  g.save(); g.globalAlpha = .18; try { R.drawBadge(x0 + Math.round(w / 2) - 30, H - 70, tier || 'SQUID', div || 1, 3); } catch (e) {} g.restore();
  g.save(); g.globalAlpha = .5; rect(x0, H - 40, w, 40, '#05080b'); g.restore();
 }
 // ---- 1.5f: Find Match / versus to Chucks's approved spec (vs_mock_sizes.png). Halves 0..W/2-4 and W/2+4..W, an 8-unit
 // divider, each half = room + 2 sitters (cx +-44) + hero k=4 at the half centre (feet y 120), the right one mirrored. Every
 // plate, card and label is drawn AFTER the hero (the stick only peeks through gaps). Cards on the OUTER edge (y 16 / 54),
 // team plate y 14, uni plate y 25, name y 123, number tag y 134, profile panel y 147..170, VS badge r 15 at (W/2, 74),
 // mode label y 92. No STATS button and no stray square here. Kill switch: window.__rl_no598vs (the old scaled-lobby VS).
 function uniName598(tid) { try { const w = Wn.RK15U && RK15U.wornKey(tid); if (w) return RK15U.K[w].nm; } catch (e) {} try { if (!Wn.__rl_no600fitname) { const k = UNI21.heroKit(0, tid); if (k && k.fit45) return k.fit45 === 'crown' ? 'THE CROWN' : 'THE WHALE'; } } catch (e) {} /* 1.5f: the plate said BASIC under a Whale */ try { return String(UNI21.label(0, tid)).replace(/ \(LOCKED\)$/, ''); } catch (e) { return ''; } }
 function vsHalf598(x0, w, side, v, info) {
  const t = TT(), cx = Math.round(w / 2), feetY = 120, k = 4, opp = side === 'opp', srch = side === 'search';
  let kit = LOBBY_GRAY, gray = true, pid = null, pos = 'A', tid = null;
  rect(x0, 0, w, H, srch ? '#141a1f' : '#141c24'); // base fill: the background bleeds past the safe box (v473safe), art stays inside
  let eL = 0, eR = 0; try { const S = Wn.RL473; if (S && S.on && !Wn.__rl_no598vs) { if (x0 <= 0) eL = Math.max(0, S.lu || 0); if (x0 + w >= W - .5) eR = Math.max(0, S.ru || 0); } } catch (e) {} // art bleeds under the island / notch
  g.save(); g.translate(x0, 0); g.beginPath(); g.rect(-eL, 0, w + eL + eR, H); g.clip();
  const sv = { pv: LL.__pv, view: LL.view, side: LL.heroSide, tid: GEAR17.tid };
  try {
   if (!srch) {
    tid = info && info.tid && (SZ_REG[info.tid] || T(info.tid)) ? info.tid : null;
    if (tid) {
     if (side === 'me') { try { const st = lobbyState(); pid = st.pid; } catch (e) {} }
     if (!Wn.__rl_no600vsarr && v && v.lob && v.lob.vs600 && v.lob.pid && PP(v.lob.pid)) pid = v.lob.pid; // 1.5f: picked with the versus arrows
     if (!pid || !PP(pid)) pid = (v && v.lob && v.lob.pid && PP(v.lob.pid)) ? v.lob.pid : teamRosterIds(tid, 'real').filter(id => PP(id) && PP(id).pos !== 'G').sort((a, b) => curOvr14(b) - curOvr14(a))[0] || null;
     if (opp) { LL.__pv = { v: v || {}, tid: tid, slot: 'vsB', vs: true }; LL.view = v || null; LL.heroSide = 'opp'; GEAR17.tid = tid; }
     if (pid) { gray = false; pos = PP(pid).pos; try { kit = Wn.UNI21 && UNI21.on() ? UNI21.heroKit(0, tid) : lobbyKit(tid); } catch (e) { kit = lobbyKit(tid); } }
    }
   }
   g.save(); g.translate(-eL, 0); try { lobbyRoom(w + eL + eR, gray ? LOBBY_GRAY : kit, gray, t); } finally { g.restore(); }
   let sk = [];
   try { sk = gray ? [0, 2] : teamRosterIds(tid, 'real').filter(id => id !== pid && PP(id)).slice(0, 2).map(id => skinOf(PP(id))); } catch (e) {}
   [cx - 44, cx + 44].forEach((x, i) => { try { lobbySitter(x, 110, gray ? LOBBY_GRAY : kit, sk[i] | 0, gray, 2, t, i * 1.9); } catch (e) {} if (srch) lobbyLock(x, 86, 1); });
   lobbyPad(lobbyHeroGeo(cx, pos, k).footX, feetY + 1, srch ? '#7dff7a' : tierCol(info && info.tier || 'SQUID').L, t);
   Wn.__v17hp = gray ? null : pid;
   try { lobbyHero(cx, feetY, pos, kit, pid ? skinOf(PP(pid)) : 0, gray, k, t, srch ? .7 : 1, 0, opp); } finally { Wn.__v17hp = null; }
   if (srch) { lobbyLock(cx, 70, 2); const sy = (t * 60) % 130 + 10; g.save(); g.globalAlpha = .3; rect(0, sy, w, 3, '#7dff7a'); g.restore(); }
  } catch (e) { fail('vsHalf', e); }
  finally { LL.__pv = sv.pv; LL.view = sv.view; LL.heroSide = sv.side; GEAR17.tid = sv.tid; g.restore(); }
  return { pid: pid, tid: tid, cx: x0 + cx };
 }
 function plate598(s, cx, y, h, maxW, col, mini) {
  s = String(s || ''); if (!s) return; const big = !mini && textW(s) + 8 <= maxW, tw = Math.min(maxW, big ? textW(s) + 8 : Math.max(20, s.length * 3 + 8)), x = Math.round(cx - tw / 2);
  rect(x - 1, y - 1, tw + 2, h + 2, '#05080b'); rect(x, y, tw, h, '#0b1a20'); rect(x, y, tw, 1, col);
  if (big) text(s, cx, y + Math.round((h - 5) / 2), 1, col, 'center'); else R.miniFit(s, cx, y + Math.round((h - 4) / 2), tw - 4, col, .8);
 }
 function line598(s, x, y, w, col) { s = String(s || ''); if (textW(s) <= w) text(s, x + w / 2, y, 1, col, 'center'); else fitMini(s, x + w / 2, y + .5, w + 4, col, .8); }
 function panel598(x, y, w, side, info) {
  const h = 23, tc = tierCol(info.tier || 'SQUID'), col = side === 'search' ? '#7dff7a' : tc.L;
  rect(x, y, w, h, 'rgba(5,8,11,.94)'); rect(x, y, w, 1, col); rect(x, y + h - 1, w, 1, col); rect(x, y, 1, h, col); rect(x + w - 1, y, 1, h, col);
  const tx = x + 22, tw = w - 25;
  try { const m = side === 'search' ? R.mine() : info; R.norm && side !== 'search' && R.norm(info); const tr = side !== 'search' && info.ranked === false ? 'SQUID' : m.tier || 'SQUID', dv = side !== 'search' && info.ranked === false ? 1 : m.div || 1; R.drawBadge(x + 3, y + 3 - (tr === 'JADE KING' ? 3 : 0), tr, dv, .8); } catch (e) {}
  if (side === 'search') {
   const s2 = Math.floor(now() - LL.t0), mm = Math.floor(s2 / 60) + ':' + String(s2 % 60).padStart(2, '0'), on = LL.online ? Math.max(1, LL.online.on | 0) : 0;
   line598('SEARCHING ' + mm, tx, y + 2, tw, '#7dff7a'); line598('NEAR ' + R.mineLbl() + (on ? ' - ' + on.toLocaleString() + ' ONLINE' : ''), tx, y + 8, tw, '#ffffff'); line598('BOT OFFER AFTER 0:30', tx, y + 14, tw, '#9fb8c4'); return;
  }
  if (side === 'me' && !R.real()) { line598('PRACTICE', tx, y + 2, tw, '#9fb8c4'); line598('RANKINGS COMING SOON', tx, y + 8, tw, '#ffffff'); line598((info.teamName || '') + (info.ovr ? ' - OVR ' + info.ovr : ''), tx, y + 14, tw, '#ffd23a'); return; }
  const l1 = (info.ranked === false ? 'SQUID I' : R.fmt ? R.fmt(info) : R.lbl(info.tier || 'SQUID', info.div || 1)) + (info.cpu ? ' - CPU' : '');
  const l2 = info.cpu ? (Wn.__rl_no594nasty ? (info.diff || 'MEDIUM') : 'ONLINE') + ' BOT - ' + (info.name || '') : 'WORLD ' + (info.rank == null ? '-' : (info.tied ? '#' + info.rank + ' TIED' : '#' + info.rank.toLocaleString())) + (info.lkRank ? ' - LOCKER ' + info.lkRank.toLocaleString() : '');
  line598(l1, tx, y + 2, tw, col); line598(l2, tx, y + 8, tw, '#ffffff'); line598((info.teamName || '') + (info.ovr ? ' - OVR ' + info.ovr : ''), tx, y + 14, tw, '#ffd23a');
 }
 function vsList600(tid) { try { const L = teamRosterIds(tid, 'real').filter(id => PP(id)); const ovr = id => { try { return curOvr14(id); } catch (e) { return 0; } }; return L.filter(id => PP(id).pos !== 'G').sort((a, b) => ovr(b) - ovr(a)).concat(L.filter(id => PP(id).pos === 'G')); } catch (e) { return []; } }
 // 1.5f: player arrows on BOTH profiles of the versus screen (the rebuilt 598 layout had none, so touch could not scroll). Kill switch: window.__rl_no600vsarr
 function vsArrows600(x0, w, side, r, v, live) {
  if (Wn.__rl_no600vsarr || side === 'search' || !r.tid || !r.pid || !v || LL.mode === 'offer') return;
  const list = vsList600(r.tid), n = list.length; if (n < 2) return;
  const step = d => { const i = Math.max(0, list.indexOf(r.pid)), pid = list[(i + d + n) % n]; v.lob = v.lob || { idx: 0, key: '', pid: null }; v.lob.pid = pid; v.lob.idx = list.indexOf(pid); v.lob.dir = d; v.lob.at = TT(); v.lob.vs600 = 1; try { if (typeof sfx === 'function') sfx('ui'); } catch (e) {} };
  const y = 118, ks = side === 'me' ? 'A' : 'B';
  [[-1, x0 + 5], [1, x0 + w - 17]].forEach(([d, x]) => { if (live) hit('VSP' + ks + d, x - 4, y - 5, 20, 22, () => step(d), 'vs600' + ks + d); R.btn(x, y - 1, 12, 13, '#ffe14d', null, { noLabel: 1 }); for (let k = 0; k < 3; k++) rect(d < 0 ? x + 7 - k : x + 4 + k, y + 3 + k, 1, 5 - 2 * k, '#0b1a20'); });
  const lab = (Math.max(0, list.indexOf(r.pid)) + 1) + '/' + n; textMini(lab, x0 + (side === 'me' ? 11 : w - 11), y + 14, '#9fb8c4');
 }
 function sideUi598(x0, w, side, r, info, v, live) {
  const cx = x0 + Math.round(w / 2), right = side !== 'me', ix = right ? x0 + w - 23 : x0 + 3, pw = w - 52;
  if (r.tid) {
   let uni = ''; const sv = LL.__pv; try { if (side === 'opp') LL.__pv = { v: v || {}, tid: r.tid, slot: 'vsB', vs: true }; uni = uniName598(r.tid); } finally { LL.__pv = sv; }
   plate598(info.teamName || tname(r.tid), cx, 14, 9, pw, '#ffe14d');
   plate598(uni, cx, 25, 8, pw - 8, '#8fe3f0', true);
  }
  if (r.pid && PP(r.pid)) {
   const nm = lastName(PP(r.pid)), sc = textW(nm, 2) <= w - 54 ? 2 : 1; text(nm, cx, sc === 2 ? 123 : 126, sc, '#ffffff', 'center', '#000');
   const num = jerseyNo(PP(r.pid)), sub = (POS_NAMES[PP(r.pid).pos] || PP(r.pid).pos).replace(/ \(.*\)/, ''), sw = (num != null ? lobbyNumW(num, 1) + 4 : 0) + textW(sub, 1), sx = Math.round(cx - sw / 2);
   rect(sx - 3, 134, sw + 6, 10, 'rgba(0,0,0,.6)'); if (num != null) { lobbyNum(num, sx, 136, 1, '#ffe14d'); text(sub, sx + lobbyNumW(num, 1) + 4, 136, 1, '#8fe3f0'); } else text(sub, sx, 136, 1, '#8fe3f0');
  }
  const u = side === 'search' ? '' : R.cname((v && v.u) || info.u || ''); if (u) { const hw2 = textW(u) + 6; rect(right ? x0 + w - 2 - hw2 : x0 + 2, 2, hw2, 10, 'rgba(5,8,11,.9)'); text(u, right ? x0 + w - 5 : x0 + 5, 5, 1, '#ffffff', right ? 'right' : 'left'); }
  panel598(x0 + 3, 147, w - 6, side, info || {});
  try { vsArrows600(x0, w, side, r, v, live); } catch (e) { fail('vsArr', e); }
  const slot = side === 'me' ? 'vsA' : 'vsB', busy = LL.mode === 'offer';
  if (r.pid && !busy && side !== 'search') { placeCards(r.pid, null, ix, 16, 31, 31, slot); const cr = side === 'me' ? store.crew : (v && v.prof && v.prof.team && v.prof.team.crew); if (cr) placeCards(null, cr, ix, 54, 31, 31, slot + 'c'); else hideCards(slot + 'c'); }
  else { hideCards(slot); hideCards(slot + 'c'); }
 }
 function drawVs598(live) {
  const t = now(), hw = Math.round(W / 2) - 4, rx = Math.round(W / 2) + 4, rw = W - rx, cx = Math.round(W / 2);
  const mv = meView(), mi = myInfo(), found = LL.mode === 'found', ov = found ? oppView() : null, oi = ov ? oppInfo() : null;
  const rL = vsHalf598(0, hw, 'me', mv, mi), rR = ov ? vsHalf598(rx, rw, 'opp', ov, oi) : vsHalf598(rx, rw, 'search', null, null);
  // divider (z1), then every plate / card / label (z3-4)
  rect(cx - 4, 0, 8, H, '#05080b'); for (let y = 1; y < H; y += 7) rect(cx - 1, y, 2, 4, '#ffd23a');
  sideUi598(0, hw, 'me', rL, mi, mv, live);
  if (ov) sideUi598(rx, rw, 'opp', rR, oi, ov, live);
  else {
   sideUi598(rx, rw, 'search', rR, {}, null);
   const s = 'FINDING PLAYER...', sw = textW(s) + 10, bx = Math.round(rx + rw / 2 - sw / 2);
   rect(bx - 1, 2, sw + 2, 13, '#000'); rect(bx, 3, sw, 11, '#0b1a20'); rect(bx, 3, sw, 1, '#ffd23a'); text(s, bx + 5, 6, 1, '#ffe14d');
   NB({ x: Math.round(rx + rw / 2 - 24), y: 126, w: 48, h: 10, bg: '#c9d6d9', label: 'CANCEL', fn: () => { cancelSearch(); LL.mode = 'lobby'; hideCards('vsA'); hideCards('vsB'); hideCards('vsAc'); hideCards('vsBc'); } }, live && LL.mode === 'search');
  }
  // VS badge + mode label on top of the divider
  const cy = 74;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * .6; g.save(); g.globalAlpha = .25; g.strokeStyle = '#ffd23a'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16); g.lineTo(cx + Math.cos(a) * 24, cy + Math.sin(a) * 24); g.stroke(); g.restore(); }
  g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffa63d'; g.beginPath(); g.arc(cx, cy, 13.5, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(cx - 3, cy - 4, 6, 0, Math.PI * 2); g.fill();
  text('VS', cx, cy - 5, 2, '#ffffff', 'center', '#000');
  { const s = 'LOCKER LEAGUE - RANKED', lw = 65; rect(Math.round(cx - lw / 2), 92, lw, 7, 'rgba(5,8,11,.92)'); R.miniFit(s, cx, 93.5, lw - 4, '#cfe', .7); }
  if (found && ov) {
   const left = Math.max(0, cd77() - (t - LL.foundT)), nsec = Math.max(1, Math.ceil(left)), cyC = 110;
   g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(cx, cyC, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#05080b'; g.beginPath(); g.arc(cx, cyC, 6.5, 0, Math.PI * 2); g.fill();
   text(String(nsec), cx, cyC - 2, 1, '#ffffff', 'center');
   if (live) { hit('VSGO', cx - 16, cy - 16, 32, 32, () => startMatch(), 'rk15vsgo'); hit('VSGO2', cx - 9, cyC - 9, 18, 18, () => startMatch(), 'rk15vsgo2'); }
   if (left <= 0) startMatch();
  } else {
   if (LL.mode === 'search' && now() - LL.t0 > LL.offerAt) { LL.mode = 'offer'; botAsk(); }
   if (now() - qT > 2 && !R.down) { qT = now(); poll(); }
   if (LL.mode === 'offer') { hideCards('vsA'); hideCards('vsAc'); drawOffer(live); }
  }
 }
 function drawVs(live) {
  if (!Wn.__rl_no598vs) return drawVs598(live);
  const t = now(), hw = Math.floor(W / 2) - 3, LB = lobbyBounds().L, oy = 14, sc = Math.min(hw / LB, (H - oy - 40 - 14) / H), ph = Math.round(H * sc), rw = Math.round(LB * sc), mx = Math.round((hw - rw) / 2);
  rect(0, 0, W, H, '#060a0e');
  const mv = meView(), mi = myInfo(); themeHalf(0, hw, mi.tier, mi.div);
  g.save(); g.beginPath(); g.rect(0, 0, hw, H); g.clip(); drawProfileAt(mv, mx, oy, sc, false, 'vsA', true, true); g.restore();
  infoBox(3, H - 39, hw - 6, 'me', mi);
  const ov = LL.mode === 'found' ? oppView() : null, rx = W - hw;
  if (ov) { const oi = oppInfo(); themeHalf(rx, hw, oi.tier, oi.div); g.save(); g.beginPath(); g.rect(rx, 0, hw, H); g.clip(); drawProfileAt(ov, rx + mx, oy, sc, false, 'vsB', true, true); g.restore(); infoBox(rx + 3, H - 39, hw - 6, 'opp', oi); }
  else { hideCards('vsB'); hideCards('vsBc'); themeHalf(rx, hw, 'SQUID'); heroBox(rx, hw, 'search', {}, live); infoBox(rx + 3, H - 39, hw - 6, 'search', {}); }
  // centre strip + VS
  const cx = Math.round(W / 2);
  for (let y = 0; y < H; y += 4) rect(cx - 2, y, 4, 2, '#ffd23a');
  const cy = oy + Math.round(ph / 2);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * .6; g.save(); g.globalAlpha = .25; g.strokeStyle = '#ffd23a'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); g.lineTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26); g.stroke(); g.restore(); }
  g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffa63d'; g.beginPath(); g.arc(cx, cy, 11, 0, Math.PI * 2); g.fill();
  text('VS', cx, cy - 5, 2, '#ffffff', 'center', '#000');
  const st = LL.mode === 'found' ? 'MATCH FOUND' : 'FINDING PLAYER...', sw = textW(st) + 8;
  rect(cx - sw / 2, 3, sw, 11, '#0b1a20'); rect(cx - sw / 2, 3, sw, 1, '#ffd23a'); text(st, cx, 6, 1, LL.mode === 'found' ? '#7dff7a' : '#ffe14d', 'center');
  text(R.cname(mv.u), 6, 6, 1, '#ffffff', 'left', '#000');
  const by = oy + ph + 1, cyC = cy + 36; // 1.5c: THEIR TEAM row on the right half's floor, countdown under the VS
  if (LL.mode === 'found' && ov) {
   text(R.cname(ov.u), W - 6, 6, 1, '#ffffff', 'right', '#000');
   // scroll their team during the countdown
   const n = (SZ_REG[ov.tid] && SZ_REG[ov.tid].roster || []).length, i = ov.lob ? ov.lob.idx + 1 : 1, lab = 'THEIR TEAM ' + i + '/' + Math.max(1, n), lw = textW(lab) + 10, lx = Math.round(rx + hw / 2 - lw / 2);
   rect(lx, by, lw, 11, '#0b1a20'); text(lab, lx + 5, by + 3, 1, '#ffe14d');
   const step = d => { ov.lob = ov.lob || { idx: 0, key: '', pid: null }; ov.lob.idx = (ov.lob.idx + d + Math.max(1, n)) % Math.max(1, n); ov.lob.dir = d; ov.lob.at = TT(); ov.lob.pid = null; };
   [[-1, lx - 16], [1, lx + lw + 4]].forEach(([d, x]) => { if (live) hit('VSP' + d, x - 3, by - 3, 18, 17, () => step(d), 'rk15vsp' + d); R.btn(x, by - 1, 12, 13, '#ffe14d', null, { noLabel: 1 }); for (let k = 0; k < 3; k++) rect(d < 0 ? x + 7 - k : x + 4 + k, by + 3 + k, 1, 5 - 2 * k, '#0b1a20'); });
   const left = Math.max(0, cd77() - (t - LL.foundT)), nsec = Math.ceil(left);
   g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(cx, cyC, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = '#05080b'; g.beginPath(); g.arc(cx, cyC, 11, 0, Math.PI * 2); g.fill();
   text(String(Math.max(1, nsec)), cx, cyC - 5, 2, '#ffffff', 'center');
   fitMini('TAP THE COUNTDOWN = START NOW', cx, cyC + 16, 120, '#9fb8c4', .6);
   if (live) hit('VSGO', cx - 30, cyC - 16, 60, 34, () => startMatch(), 'rk15vsgo');
   if (left <= 0) startMatch();
  } else {
   NB({ x: W - 54, y: by, w: 48, h: 12, bg: '#c9d6d9', label: 'CANCEL', fn: () => { cancelSearch(); LL.mode = 'lobby'; hideCards('vsA'); hideCards('vsB'); } }, live && LL.mode === 'search');
   fitMini('LOCKER LEAGUE - RANKED', cx, by + 4, 90, '#cfe', .6);
   if (LL.mode === 'search' && now() - LL.t0 > LL.offerAt) { LL.mode = 'offer'; botAsk(); }
   if (now() - qT > 2 && !R.down) { qT = now(); poll(); }
   if (LL.mode === 'offer') { hideCards('vsA'); drawOffer(live); }
  }
 }
 function drawOffer(live) {
  rect(0, 0, W, H, 'rgba(4,10,14,.72)');
  const w = 236, h = 120, x = Math.round(W / 2 - w / 2), y = Math.round(H / 2 - h / 2);
  rect(x - 1, y - 1, w + 2, h + 4, '#000'); rect(x, y, w, h, '#1b2430');
  const info = LL.botInfo;
  text(R.down ? 'PRACTICE - RANK DOES NOT MOVE' : 'NO PLAYERS FOUND. PLAY A BOT?', x + w / 2, y + 6, 1, '#ffd23a', 'center', '#000');
  fitMini(R.down ? 'RANKINGS ARE NOT LIVE YET - PRACTICE VS A CPU BOT' : 'NOBODY NEAR YOUR RANK IS ONLINE RIGHT NOW.', x + w / 2, y + 17, w - 10, '#cfe', .75);
  rect(x + 6, y + 26, w - 12, 40, '#0b1a20'); rect(x + 6, y + 26, w - 12, 1, '#2c4452');
  if (info) {
   const btid = Wn.RK15BOT ? RK15BOT.previewTid(info) : null;
   if (btid) { g.save(); g.beginPath(); g.rect(x + 7, y + 27, 74, 38); g.clip(); try { const kit = UNI21.heroKit(0, btid); const ids = teamRosterIds(btid, 'real').filter(id => PP(id) && PP(id).pos !== 'G').slice(0, 3); ids.forEach((id, i) => { const f = lobbyFrame(PP(id).pos, true); const b = lobbyBake(f, kit, skinOf(PP(id)), false, false); g.drawImage(b, x + 10 + i * 22, y + 64 - b.height * 1.4, b.width * 1.4, b.height * 1.4); }); } catch (e) {} g.restore(); }
   text(info.name, x + 86, y + 31, 1, '#ffffff'); const cw = textW('CPU') + 4; rect(x + 88 + textW(info.name), y + 30, cw, 7, '#c9d6d9'); text('CPU', x + 90 + textW(info.name), y + 31, 1, DK);
   if (R.norm) R.norm(info);
   R.drawBadge(x + 86, y + 41, info.tier, info.div, .8);
   text(R.fmt ? R.fmt(info) : R.lbl(info.tier, info.div), x + 105, y + 46, 1, tierCol(info.tier).L);
   const dl = Wn.__rl_no594nasty ? info.diff : 'ONLINE', dw = textW(dl) + 4; rect(x + 105, y + 56, dw, 7, '#2cc4dc'); text(dl, x + 107, y + 57, 1, DK);
  } else text('FINDING A BOT TEAM...', x + w / 2, y + 42, 1, '#9fb8c4', 'center');
  fitMini(R.down ? 'PRACTICE GAME - YOUR RANK DOES NOT MOVE' : (R.ruleOf(R.mine().tier).botPer ? R.ruleOf(R.mine().tier).botPer + ' CPU WINS = +1 DIVISION - A CPU LOSS = HALF A LOSS' : 'AT ' + R.mine().tier + ' CPU WINS DON\'T COUNT - A LOSS STILL DOES'), x + w / 2, y + 71, w - 10, '#7dff7a', .75);
  const bw = Math.floor((w - 18) / 2);
  NB({ x: x + 6, y: y + 80, w: bw, h: 18, bg: '#2a3a44', fg: '#ffffff', label: R.down ? 'BACK' : 'KEEP WAITING', fn: () => { if (R.down) { LL.mode = 'lobby'; return; } LL.mode = 'search'; LL.offerAt = now() - LL.t0 + 30; } }, live);
  NB({ x: x + 12 + bw, y: y + 80, w: bw, h: 18, bg: '#ffcc33', label: info ? (R.down ? 'PRACTICE' : 'PLAY ' + info.name) : '...', fn: () => playBot() }, live && !!info);
  fitMini('IF A REAL PLAYER QUEUES WHILE YOU WAIT, YOU GET THEM INSTEAD', x + w / 2, y + h - 12, w - 10, '#8fa6b0', .55);
 }
 // ---------- the wrapped GEAR screen ----------
 const dg0 = Wn.drawGear17;
 Wn.drawGear17 = function () {
  if (off() || !GEAR17 || !GEAR17.ll15) { hideCards(); return dg0.apply(this, arguments); }
  try {
   const live = !lobby.card && !LL.anim;
   if (!LL.view) hideCards('mainc'); // the profile's crew slot
   if (LL.mode === 'search' || LL.mode === 'found' || LL.mode === 'offer') { hideCards('main'); hideCards('crew'); if (Wn.__rl_no598vs) { hideCards('vsAc'); hideCards('vsBc'); } drawVs(live); return; }
   hideCards('vsA'); hideCards('vsB'); hideCards('vsAc'); hideCards('vsBc');
   const { L } = lobbyBounds();
   bgStripes(); rect(L, 0, W - L, H, 'rgba(0,0,0,.35)');
   if (LL.view) { hideCards('crew'); drawProfileAt(LL.view, 0, 0, 1, live, 'main', false); return; } // the same renderer the versus screen uses
   if (LL.mode === 'noteam') { hideCards(); bgStripes(); drawNoTeam(L, live); return; }
   drawLobbyLeft(L, live);
   drawLobbyCol(L, live);
   drawTeamPicker(L, live);
   if (Wn.V17) try { V17.drawHome(L, !!lobby.card, { gearOnly: true, kind: 'match' }); } catch (e) { console.error(e); }
   drawLobbyExtras(L, live);
   const cs = cardSpots(L, GEAR17.tid), busy = lobby.card || LL.anim || LL.reveal || overlayOn() || !!document.getElementById('wt598'); // the tour keeps the lobby buttons live (it points at them) but hides the cards
   if (!busy) { const st = lobbyState(); if (cs.p) placeCards(st.pid, null, cs.p.x, cs.p.y, cs.p.h, cs.p.h, 'main'); else hideCards('main'); placeCards(null, store.crew || '', cs.c.x, cs.c.y, cs.c.h, cs.c.h, 'crew'); if (!store.played) stepDot(2, cs.c.x - 9, cs.c.y); } else { hideCards('main'); hideCards('crew'); }
   if (live && !busy) hit('CREWSLOT', cs.c.x, cs.c.y, Math.round(cs.c.h * .68), cs.c.h, () => openCrewList(), 'rk15crew');
   if (lobby.card) drawLobbyCard();
  } catch (e) { fail('draw', e); try { return dg0.apply(this, arguments); } catch (x) {} }
 };
 // 1 crew card for the Locker League team (cycles through your owned crew cards; tap again past the last = empty)
 function pickCrew() {
  try {
   const own = V17.I.filter(it => it.sec === 'crew' && (V17.ST().inv[it.id] | 0) > 0).map(it => it.id);
   if (!own.length) { V17.toast && V17.toast('NO CREW CARDS YET - OPEN A CREW PACK', '#ffb14d'); return; }
   const i = own.indexOf(store.crew); store.crew = i + 1 < own.length ? own[i + 1] : ''; save(); cardsKey = ''; pushTeam(true);
   V17.toast && V17.toast(store.crew ? 'CREW CARD: ' + V17.BY[store.crew].n.toUpperCase() : 'NO CREW CARD', '#7dff7a');
  } catch (e) { fail('crew', e); }
 }
 // only 1 crew card in a Locker League match, at a smaller boost (60%: crewBoost uses (level + 1) * mul, so the level is scaled)
 LL.CREW_K = 0.6;
 if (Wn.V17 && typeof V17.myLoadout === 'function') {
  const ml0 = V17.myLoadout;
  V17.myLoadout = function () {
   const L = ml0.apply(this, arguments);
   try {
    const G = typeof game !== 'undefined' ? game : null;
    const ll = !off() && (G && (G.meta && G.meta.ll15 || G.online && Wn.RLNET && RLNET.st && RLNET.st.ll15) || LL.pvp && Wn.RLNET && RLNET.code === LL.pvp.code && !RLNET.inGame);
    if (ll && L) {
     const c = {}, it = store.crew && V17.BY[store.crew];
     if (it && it.crew) { const lvl = (+String(store.crew).split('_').pop()) || (it.rar | 0); c[it.crew] = (lvl + 1) * LL.CREW_K - 1; }
     L.crew = c;
    }
   } catch (e) { fail('crew1', e); }
   return L;
  };
 }
 // leaving the Gear screen any other way (e.g. lineup BACK lands on gear17 again) keeps the LL flag; hide cards off-screen
 const r0 = Wn.render;
 if (typeof r0 === 'function') Wn.render = function () {
  const r = r0.apply(this, arguments);
  try { if (!(screen === 'gear17' && GEAR17 && GEAR17.ll15) || LL.anim || LL.reveal) hideCards(); drawResult(); } catch (e) { fail('render', e); }
  return r;
 };
 // the lineup / ratings screens come back to 'gear17' with GEAR17 still set; nothing else to do.

 /* ================= RESULT: report, points, rank up, Ranked Uni reveal ================= */
 const isLL = G => !!(G && (G.meta && G.meta.ll15 || G.online && Wn.RLNET && RLNET.st && RLNET.st.ll15));
 async function report(G) {
  const c = LL.cur || {}, online = !!G.online, mid = online ? RLNET.st.ll15 : G.meta.ll15.mid;
  LL.res = { st: 'checking', delta: null, t: now(), mid: mid, practice: !mid };
  if (!mid) { LL.res.st = 'practice'; return; }
  const body = { mid: mid, my: G.score[0] | 0, opp: G.score[1] | 0 };
  if (G.cpu15) body.cpu = 1; if (G.ff15 === 'me') body.ff = 1; else if (G.ff15 === 'opp') body.oppff = 1; // 1.5c forfeit / left (optional, new)
  for (let i = 0; i < 40; i++) {
   const j = await R.call('result', body);
   if (!LL.res) return; // B74: the player left the result screen while the server was still deciding
   if (!j || !j.ok) { LL.res.st = j && j.down ? 'down' : 'err'; LL.res.err = j && j.error; return; }
   if (j.st === 'pending') { LL.res.st = 'pending'; await new Promise(r => setTimeout(r, 5e3)); if (!LL.res) return; continue; }
   LL.res.st = j.st; LL.res.delta = j.delta | 0; LL.res.won = j.won; try { Wn.RK15FF && RK15FF.clear(mid); } catch (e) {}
   const before = c.tier0 || R.mine();
   if (j.me) { R.me = Object.assign({}, R.me || {}, j.me); R.meT = Date.now(); try { localStorage.setItem('rl_rk15', JSON.stringify({ u: j.me.u, pts: j.me.pts, tier: j.me.tier, div: j.me.div, jk: j.me.jk, rank: j.me.rank, tied: j.me.tied, total: j.me.total, lk: j.me.lk, lkRank: j.me.lkRank, top10lk: j.me.top10lk, lk1: j.me.lk1, best: j.me.best })); } catch (e) {} }
   const a = j.me || {}, b4 = { tier: before.tier, div: before.div }, af = { tier: a.tier, div: a.div };
   const ix = o => o.tier === 'JADE KING' ? 30 : R.TIERS.findIndex(t => t.n === o.tier) * 5 + ((o.div || 1) - 1); // 1.5d: I = bottom of a tier (divisions count up)
   if (a.tier && ix(af) > ix(b4)) startAnim(b4, af);
   try { if (Wn.RK15U) RK15U.sync(); } catch (e) {}
   return;
  }
 }
 function startAnim(from, to) {
  const kind = to.tier === 'JADE KING' ? 'jade' : to.tier !== from.tier ? 'tier' : 'div';
  LL.anim = { from: from, to: to, kind: kind, t0: now(), dur: kind === 'jade' ? 3.3 : kind === 'tier' ? 2.8 : 1.7, reveal: kind !== 'div' };
 }
 LL.testAnim = startAnim; LL.testPlayBot = () => playBot(); LL.testStart = () => startMatch(); LL.search600 = () => startSearch(); LL.leave600 = f => leaveFinal(f); // 1.5 B72 (v600ll72)
 function badgeAt(tier, div, cx, cy, s, a) { const im = R.img(tier, div, 'shine'); if (!(im.complete && im.naturalWidth)) return; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.imageSmoothingEnabled = false; const w = 50 * s, h = (tier === 'JADE KING' ? 65 : 55) * s; g.drawImage(im, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h); g.restore(); }
 function drawAnim() {
  const A = LL.anim, t = now() - A.t0, p = Math.min(1, t / A.dur), cx = W / 2, cy = 84;
  const tc = tierCol(A.to.tier);
  rect(0, 0, W, H, 'rgba(3,6,9,.88)');
  if (A.kind !== 'div') for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + t; g.save(); g.globalAlpha = .18 * Math.min(1, t * 2); g.strokeStyle = tc.L; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 200, cy + Math.sin(a) * 200); g.stroke(); g.restore(); }
  const swap = A.dur * .45;
  if (t < swap) { const q = t / swap; badgeAt(A.from.tier, A.from.div, cx - (A.kind === 'div' ? 0 : 50 * q), cy, 1 - .2 * q, 1 - q * .8); }
  else { const q = Math.min(1, (t - swap) / .35), pop = q < 1 ? .6 + .6 * q : 1 + .04 * Math.sin(t * 6); if (A.kind !== 'div') badgeAt(A.from.tier, A.from.div, cx - 80, cy, .6, .35); badgeAt(A.to.tier, A.to.div, cx, cy, pop, 1);
   if (q < 1) { g.save(); g.globalAlpha = 1 - q; rect(0, 0, W, H, '#ffffff'); g.restore(); } }
  const head = A.kind === 'jade' ? 'JADE KING!' : A.kind === 'tier' ? 'NEW TIER!' : 'RANK UP!';
  text(head, cx, 18, A.kind === 'div' ? 2 : 3, '#ffe14d', 'center', '#000');
  if (t > swap) text(R.lbl(A.to.tier, A.to.div), cx, 128, 2, tc.L, 'center', '#000');
  if (A.kind === 'jade' && t > swap) { try { const kit = Wn.RK15U ? RK15U.kitFor('jadecrown') : null; if (kit) { const b = RL12.bake('bench_idle0', kit, false, 1); g.imageSmoothingEnabled = false; g.drawImage(b, cx + 46, cy - 20, b.width * 3, b.height * 3); } } catch (e) {} }
  fitMini('TAP = SKIP', cx, H - 10, 60, '#9fb8c4', .6);
  hit('ANIM', 0, 0, W, H, () => { A.t0 = now() - A.dur - 1; }, 'rk15anim');
  if (t > A.dur + .3) { if (A.reveal && Wn.RK15U) LL.reveal = { tier: A.to.tier, t0: now() }; LL.anim = null; }
 }
 function drawReveal() {
  const v = LL.reveal, tc = tierCol(v.tier), key = v.tier === 'JADE KING' ? 'jadecrown' : tc.k, cx = W / 2;
  rect(0, 0, W, H, 'rgba(3,6,9,.9)');
  text('NEW RANKED UNI', cx, 10, 2, '#ffe14d', 'center', '#000');
  fitMini(v.tier === 'JADE KING' ? 'JADE CROWN - ONLY WHILE YOU ARE #1. JADE - YOURS FOREVER.' : v.tier + ' HOME + AWAY - YOURS FOREVER, EVEN IF YOU DROP', cx, 26, 300, '#cfe', .75);
  try { const kh = RK15U.kitFor(key, false), ka = RK15U.kitFor(key === 'jadecrown' ? 'jade' : key, key !== 'jadecrown'); [kh, ka].forEach((k, i) => { const b = RL12.bake('bench_idle0', k, i === 1, 1); try { if (b && k && k.rk15 && !b.__rk15k) b.__rk15k = k.rk15; } catch (e) {} /* QA6: the crisp chest badge path knows the uni */ g.imageSmoothingEnabled = false; g.drawImage(b, Math.round(cx - 70 + i * 80), 40, b.width * 4, b.height * 4); }); } catch (e) {}
  NB({ x: cx - 100, y: H - 30, w: 92, h: 18, bg: '#7dff7a', label: 'WEAR IT', fn: () => { try { RK15U.wear(LL.cur && LL.cur.tid || store.tid, key === 'jadecrown' ? 'jadecrown' : key + '_h'); } catch (e) {} LL.reveal = null; } }, true);
  NB({ x: cx + 8, y: H - 30, w: 92, h: 18, bg: '#c9d6d9', label: 'LATER', fn: () => { LL.reveal = null; } }, true);
 }
 function drawResult() {
  const G = (typeof game !== "undefined" ? game : null);
  if (screen === 'final' && isLL(G)) {
   if (!G.__rk15) { G.__rk15 = 1; if (!G.meta || !G.meta.ll15 || G.meta.ll15.mid || true) report(G); restoreDiff(); }
   const r = LL.res || {}, cx = W / 2;
   const s = r.st === 'checking' || r.st === 'pending' ? 'LOCKER LEAGUE - SERVER CHECKING THE RESULT...' : r.st === 'done' ? R.dTxt(r.delta) : r.st === 'practice' ? 'PRACTICE VS CPU - RANKINGS COMING SOON' : r.st === 'void' ? 'NO RANK CHANGE (RESULT NOT CONFIRMED)' : r.st === 'down' ? 'RANKINGS COMING SOON' : r.st === 'err' ? 'COULD NOT REACH THE SERVER' : '';
   if (s) { const w = textW(s) + 10; rect(cx - w / 2, 108, w, 11, 'rgba(0,0,0,.85)'); text(s, cx, 111, 1, r.st === 'done' ? (r.delta >= 0 ? '#7dff7a' : '#ff9a8a') : '#ffe14d', 'center'); }
   const live = !LL.anim && !LL.reveal;
   NB({ x: cx - 110, y: 122, w: 104, h: 18, bg: '#7dff7a', label: 'FIND MATCH', fn: () => leaveFinal(true) }, live);
   NB({ x: cx + 6, y: 122, w: 104, h: 18, bg: '#c9d6d9', label: 'LOBBY', fn: () => leaveFinal(false) }, live);
  }
  if (LL.anim) drawAnim(); else if (LL.reveal) drawReveal();
 }
 function restoreDiff() { try { if (Wn.LL600) LL600.unlockBot(); } catch (e) {} if (LL.savedDiff != null) { try { SETTINGS.diff = LL.savedDiff; applyDiff && applyDiff(); } catch (e) {} LL.savedDiff = null; } }
 function leaveFinal(find) {
  try { if (Wn.RLNET && RLNET.inGame) RLNET.endOnlineGame(); if (Wn.RLNET && RLNET.code) RLNET.leave(); } catch (e) {}
  try { const mid = Wn.RLNET && RLNET.st && RLNET.st.ll15 || LL.match && LL.match.mid; if (mid) (LL.left74 = LL.left74 || new Set()).add(mid); } catch (e) {}
  LL.pvp = null; LL.res = null; try { game = null; } catch (e) {}
  try { if (Wn.RLNET && !RLNET.inGame) { RLNET.myTeam = null; RLNET.oppTeam = null; } } catch (e) {} // B74: no match team state carries into the next match
  if (Wn.RK15BOT) try { RK15BOT.clear(); } catch (e) {}
  LL.open(); if (find) startSearch();
 }
 // hide the stock final buttons (PLAY AGAIN / MENU / REMATCH) in a Locker League final; block other taps under the rank-up
 const HIDE = new Set(['PLAY AGAIN', 'MENU', 'REMATCH', 'BACK TO SEASON']);
 if (typeof Wn.button === 'function') { const b0 = Wn.button; Wn.button = function (label) { try { if (!off() && ((screen === 'final' && isLL(typeof game !== "undefined" ? game : null) && HIDE.has(label)) || ((LL.anim || LL.reveal) && screen === 'final'))) return; } catch (e) {} return b0.apply(this, arguments); }; }
 if (typeof Wn.hit === 'function') { const h0 = Wn.hit; Wn.hit = function (label, x, y, w, h, fn, key) { try { if (!off() && (LL.anim || LL.reveal) && !(typeof key === 'string' && key.indexOf('rk15') === 0)) return; } catch (e) {} return h0.apply(this, arguments); }; }
})();
