/* v590b.js - 1.5 TestFlight round 2 (Charlie, Nov 22):
 * 1) AUTO BEST + TAKE OFF in the Locker League lobby. Cause: v581gear only shows its buttons on screen 'menu'; the
 *    Locker League lobby is the gear screen ('gear17'). Fix: the same two buttons (v581gear's own autoBest / offTeam)
 *    next to the HELMET slot there.
 * 2) UNIFORM button right under every LOCKER ROOM button (home / play hub bar and the small lobby button): opens the
 *    locker straight on the UNIFORMS tab.
 * 3) Locker League lobby: the uniform arrows are back: cycle the card team's own uniforms + your owned Ranked Unis.
 * Buttons use the shop / gear panel style (RK15.btn). Kill switch: window.__rl_no590b.
 */
(function () {
 'use strict';
 const Wn = window, R = Wn.RK15;
 if (!R) return;
 const off = () => !!(Wn.__rl_no590b || R.off());
 const F = Wn.B590 = { err: [] };
 const fail = (w, e) => { if (F.err.length < 20) F.err.push(w + ': ' + String(e && e.message || e).slice(0, 160)); };
 const llOn = () => typeof screen !== 'undefined' && screen === 'gear17' && typeof GEAR17 !== 'undefined' && GEAR17 && GEAR17.ll15 && !(Wn.RK15LL && (RK15LL.view || RK15LL.mode !== 'lobby'));
 // ---- 1: AUTO BEST / TAKE OFF ----
 let box = null;
 function mk(label, bg, fn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.style.cssText = 'pointer-events:auto;font:bold 9px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.5px;text-transform:uppercase;color:#0b1a20;background:' + bg + ';border:2px solid #0b1a20;border-radius:0;padding:0 3px;min-height:0;white-space:nowrap;overflow:hidden;line-height:1;cursor:pointer;-webkit-appearance:none;appearance:none;box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000;touch-action:manipulation';
  b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); try { fn(); } catch (er) { fail(label, er); } }); ['pointerdown', 'touchstart', 'mousedown'].forEach(t => b.addEventListener(t, e => e.stopPropagation(), { passive: true })); return b; }
 function tick() {
  const h = !off() && llOn() ? document.querySelector('.hb[aria-label="GEAR HELMET"]') : null, G = Wn.V581G;
  if (!h || !h.offsetParent || !G || !G.autoBest) { if (box) box.style.display = 'none'; return; }
  if (!box || !box.isConnected || box.parentNode !== h.parentNode) {
   if (box) box.remove();
   box = document.createElement('div'); box.id = 'b590gear'; box.style.cssText = 'position:absolute;z-index:3;display:flex;flex-direction:column;gap:4px;pointer-events:none';
   const toast = (m, c) => { try { V17.toast(m, c); } catch (e) {} };
   box.appendChild(mk('AUTO BEST', '#7dff7a', () => { const n = G.autoBest(G.lobbyNow()); toast(n >= 0 ? 'AUTO BEST: ' + n + ' ITEMS ON' : 'PICK A TEAM FIRST', '#7dff7a'); }));
   box.appendChild(mk('TAKE OFF', '#c9d6d9', () => { const n = G.offTeam(G.lobbyNow()); toast(n >= 0 ? n + ' ITEMS BACK IN THE LOCKER' : 'PICK A TEAM FIRST', '#c9d6d9'); }));
   h.parentNode.appendChild(box);
  }
  const w = Math.max(64, Math.round(h.offsetWidth * 1.4)), bh = Math.max(14, Math.floor((h.offsetHeight - 4) / 2));
  box.style.display = 'flex'; box.style.left = (h.offsetLeft + h.offsetWidth + 3) + 'px'; box.style.top = h.offsetTop + 'px'; box.style.width = w + 'px';
  for (const b of box.children) b.style.height = bh + 'px';
 }
 setInterval(() => { try { tick(); } catch (e) { fail('tick', e); } }, 250);
 // ---- 2: UNIFORM under LOCKER ROOM ----
 function openUnisLocker() { try { V17.openLocker(); } catch (e) { try { screen = 'locker17'; } catch (x) {} } setTimeout(() => { try { if (PANEL_ACT.v17sec) PANEL_ACT.v17sec('uni'); panelDirty(); } catch (e) {} }, 0); }
 // 1.5c: the button shows ONLY what this team may wear in this mode (same list as the pregame picker: RK15U.allowed)
const lobTid = () => { try { if (typeof screen !== 'undefined' && screen === 'menu' && !(Wn.M37 && (M37.page === 'home' || M37.page === 'play')) && typeof lobbyState === 'function') { const st = lobbyState(); if (st && st.tid && T(st.tid)) return st.tid; } } catch (e) {} /* 1.5c: the team this lobby shows (World Games = the national team) */ try { if (llOn() || (typeof screen !== 'undefined' && screen === 'gear17' && GEAR17 && GEAR17.tid)) return GEAR17.tid; } catch (e) {} try { if (typeof screen !== 'undefined' && screen === 'onLobby' && Wn.RLNET && RLNET.lobby) { const st = RLNET.lobby.state || {}; return RLNET.side === 'h' ? st.hteam : st.gteam; } } catch (e) {} try { if (Wn.V524 && V524.team) return V524.team(); } catch (e) {} try { return (typeof menuSel !== 'undefined' && menuSel && menuSel.team) || JSON.parse(localStorage.getItem('rl_qteam16') || 'null'); } catch (e) { return null; } };
 const lobOnline = () => { try { return llOn() || (typeof screen !== 'undefined' && /^on/.test(screen)) || !!(Wn.RLNET && RLNET.code); } catch (e) { return false; } };
 F.openUnis = () => openUnis();
 function openUnis() { if (Wn.__rl_no591uni || !Wn.RK15U || !RK15U.openFor) return openUnisLocker(); const tid = lobTid(); if (!tid || !T(tid) || !RK15U.openFor(tid, lobOnline())) openUnisLocker(); }
 F.openUnis = openUnis;
 if (!Wn.__rl_595hubuni && Wn.V40H && typeof V40H.draw === 'function' && typeof V40H.rects === 'function' && false) { // 1.5c (TestFlight 3): no UNIFORM on the main menu - only lobbies with the player on the left. hub: a strip across the bottom of the LOCKER ROOM bar (registered first, so it wins there)
  const d0 = V40H.draw;
  V40H.draw = function (L, live) {
   let r0 = null;
   try { if (!off()) { r0 = V40H.rects().find(r => r.key === 'LOCKER ROOM') || null; if (r0 && live) hit('UNIFORM', r0.x, r0.y + r0.h - 9, r0.w, 11, openUnis, 'rk15uni590'); } } catch (e) { fail('hub0', e); }
   const res = d0.apply(this, arguments);
   try { const r = V40H.rects().find(x => x.key === 'LOCKER ROOM'); if (!off() && r) R.btn(r.x + 2, r.y + r.h - 9, r.w - 4, 10, '#ffd23a', 'UNIFORM'); } catch (e) { fail('hub', e); }
   return res;
  };
 }
 if (Wn.V17 && typeof V17.drawHome === 'function') { // the small lobby LOCKER ROOM button (2, 146, 50 x 11): UNIFORM right under it
  const h0 = V17.drawHome;
  V17.drawHome = function (L, modal, o) {
   const res = h0.apply(this, arguments);
   try { if (!off() && !(o && o.gearOnly) && typeof screen !== 'undefined' && screen === 'menu' && !(Wn.M37 && (M37.page === 'home' || M37.page === 'play'))) { if (Wn.V17 && ((V17.tray && V17.tray()) || (V17.pop && V17.pop()))) {} else { if (!modal) hit('UNIFORM', 2, 159, 50, 10, openUnis, 'rk15uni590b'); R.btn(2, 159, 50, 10, '#ffd23a', 'UNIFORM'); } } } catch (e) { fail('lob', e); }
   return res;
  };
 }
 // ---- 3: Locker League lobby uniform arrows ----
 function unisFor(tid) { try { if (!Wn.__rl_no591uni && RK15U.allowed) return RK15U.allowed(tid, true).filter(e => e.key !== 'fit').map(e => e.key[0] === 'r' ? { r: e.key.slice(2), nm: e.nm } : { k: +e.key.slice(2), nm: e.nm }); } catch (e) {}
  const U = Wn.UNI21, out = [];
  try { for (let k = 0; k < U.nK(tid); k++) if (U.okK(tid, k) && U.has(tid, k)) out.push({ k: k, nm: U.styN ? U.styN(tid, k) : 'UNIFORM ' + (k + 1) }); } catch (e) {}
  try { if (Wn.RK15U && RK15U.mayWear(tid)) RK15U.ORDER.filter(RK15U.owned).forEach(r => out.push({ r: r, nm: RK15U.K[r].nm })); } catch (e) {}
  return out;
 }
 function stepUni(tid, d) {
  const L = unisFor(tid); if (!L.length) return;
  const w = Wn.RK15U ? RK15U.wornKey(tid) : null; let i = w ? L.findIndex(x => x.r === w) : L.findIndex(x => x.k === UNI21.savedK(tid)); if (i < 0) i = 0;
  const n = L[(i + d + L.length) % L.length];
  if (n.r) RK15U.wear(tid, n.r); else { RK15U.wear(tid, null); UNI21.save(tid, n.k); }
 }
 if (typeof Wn.drawGear17 === 'function') {
  const g0 = Wn.drawGear17;
  Wn.drawGear17 = function () {
   const res = g0.apply(this, arguments);
   try {
    if (off() || !llOn() || lobby.card) return res;
    const L = lobbyBounds().L, tid = GEAR17.tid, list = unisFor(tid); if (list.length < 2) return res;
    const w = Wn.RK15U ? RK15U.wornKey(tid) : null, fw = !w && !Wn.__rl_no600fitlabel && Wn.V446 && V446.wears(tid) && Wn.V445 && V445.pick ? V445.pick() : null, cur = w ? RK15U.K[w].nm : fw ? (fw === 'crown' ? 'THE CROWN' : 'THE WHALE') : (list.find(x => x.k === UNI21.savedK(tid)) || list[0]).nm; // 1.5f: names the Whale / Crown
    const N8 = !Wn.__rl_no598lob, cx = Math.round(L * .48), y = N8 ? 15 : 17, cap = N8 ? Math.max(24, 2 * Math.min(cx - 72, L - 73 - cx)) : 999, tw = Math.min(cap, textW(cur) + 8), x0 = Math.round(cx - tw / 2); // 1.5f: capped so its arrows clear AUTO BEST and WEEKLY at every width
    rect(x0 - 3, y - 1, tw + 6, 11, '#05080b'); /* 1.5c (Jonny): covers the game's own label underneath (its ':' showed in the gap) */ rect(x0, y, tw, 9, '#0b1a20'); if (textW(cur) + 8 <= tw) text(cur, cx, y + 2, 1, '#ffd23a', 'center'); else R.miniFit(cur, cx, y + 2.5, tw - 5, '#ffd23a', .9);
    [[-1, x0 - 13], [1, x0 + tw + 2]].forEach(([d, x]) => { hit('UNI' + d, x - 2, y - 3, 15, 15, () => stepUni(tid, d), 'rk15ua' + d); R.btn(x, y - 1, 11, 11, '#ffe14d', null, { noLabel: 1 }); for (let k = 0; k < 3; k++) rect(d < 0 ? x + 6 - k : x + 4 + k, y + 2 + k, 1, 5 - 2 * k, '#0b1a20'); });
   } catch (e) { fail('arrows', e); }
   return res;
  };
 }
})();
/* 1.5c (Charlie): PLAY A FRIEND is not ranked, so any team can play: the online team picker also shows the COLLEGE tab
 * (its own col2504 grid; college ids are the same on every phone) next to PRO / WORLD / N/A, card teams (v331) and the
 * SEASON TEAMS list. Only FIND MATCH stays card teams only. A Ranked Uni worn in a friend game rides in the existing
 * lobby field hszn/gszn (extra member rk15u), so the other phone draws it too. Kill switch: window.__rl_no590b.
 */
(function () {
 'use strict';
 const Wn = window;
 if (typeof Wn.teamGrid === 'function') {
  const tg0 = Wn.teamGrid;
  Wn.teamGrid = function (title, sub, onPick, opts) {
   try { if (!Wn.__rl_no590b && typeof screen !== 'undefined' && screen === 'onTeam' && opts && opts.world && !opts.pool && !(Wn.RLNET && RLNET.lobby && RLNET.lobby.state && RLNET.lobby.state.ll15)) opts = Object.assign({}, opts, { col2504: true }); } catch (e) {}
   return tg0.call(this, title, sub, onPick, opts);
  };
 }
 setInterval(() => {
  try {
   const N = Wn.RLNET; if (Wn.__rl_no590b || !N || !N.code || !N.lobby || !N.lobby.state || N.inGame || !Wn.RK15U) return;
   const st = N.lobby.state; if (st.ll15 || st.season) return;
   const me = N.side === 'h' ? 'h' : 'g', tid = st[me + 'team']; if (!tid) return;
   const key = RK15U.wornKey(tid, true) || null, cur = st[me + 'szn'] || null, have = cur && cur.rk15u || null;
   let fit = null; try { fit = !key && Wn.V446 && V446.wears(tid) && Wn.V445 ? V445.pick() : null; } catch (e) {}
   if (key === have && (fit || null) === ((cur && cur.rk15fit) || null)) return;
   const nv = Object.assign({}, cur || {}, { rk15u: key, rk15fit: fit }); st[me + 'szn'] = nv; N.patchLobby({ [me + 'szn']: nv });
  } catch (e) {}
 }, 700);
})();
