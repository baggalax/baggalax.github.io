/* v595uni.js - Bagga Lax 1.5c: LOCKER UNIFORMS TAB FOLLOWS THE TEAM + MODE YOU CAME FROM (TestFlight 3)
 * Asks (Charlie):
 *  - Opened from a lobby (LOCKER ROOM / UNIFORM), the online lobby or the pregame, the UNIFORMS tab shows ONLY what that team
 *    can wear in that mode: the same RK15U.allowed list as the pickers. World Games USA = USA's kits (+ Crown / Whale if owned).
 *  - Opened plainly from the main menu: the full collection, each tile with a small note saying where it can be worn.
 *  - Crown / Whale can be put on ANY team in ANY mode, from the locker too (v446's per-team fit tile, off in the locker before).
 *  - Changing uniform sometimes "took several taps": cause = a worn Ranked Uni beats the team uniform / fit, so tapping one
 *    changed nothing you could see. Picking a team uniform or the fit now takes that team's Ranked Uni off.
 * How: the screen the locker was opened FROM is remembered when it opens; PANEL_RENDER.locker17 output is filtered (DOM only).
 * 1.5f: the locker no longer filters (full collection + where-to-wear notes from anywhere); it still opens on the team's group.
 * Kill switch: window.__rl_no595uni (old filter back: window.__rl_no600lockall)
 */
(function () {
 const Wn = window, off = () => !!Wn.__rl_no595uni || !Wn.RK15U || !RK15U.allowed;
 let ctx = null, prev = null;
 function ctxFrom(p) {
  try {
   if (!p) return null;
   if (p.scr === 'gear17' && p.gear) return { tid: p.gear, online: !!p.ll };
   if (p.scr === 'onLobby' && p.on) return { tid: p.on, online: true };
   if (p.scr === 'pregame' && p.user) return { tid: p.user, online: !!p.online };
   if (p.scr === 'menu' && !p.hub && p.lob) return { tid: p.lob, online: false };
  } catch (e) {}
  return null;
 }
 function snap() {
  const o = { scr: screen };
  try { if (screen === 'gear17' && GEAR17) { o.gear = GEAR17.tid; o.ll = !!GEAR17.ll15; } } catch (e) {}
  try { if (screen === 'onLobby' && RLNET.lobby) { const st = RLNET.lobby.state || {}; o.on = RLNET.side === 'h' ? st.hteam : st.gteam; } } catch (e) {}
  try { if (screen === 'pregame' && game) { o.user = game.user; o.online = !!game.online; } } catch (e) {}
  try { o.hub = !!(Wn.M37 && (M37.page === 'home' || M37.page === 'play')); if (screen === 'menu' && !o.hub && typeof lobbyState === 'function') { const s = lobbyState(); o.lob = s && !s.locked ? s.tid : null; } } catch (e) {}
  return o;
 }
 setInterval(() => { try { if (typeof screen === 'undefined') return; if (screen === 'locker17') { if (prev !== 'in') { ctx = ctxFrom(prev); prev = 'in'; RK15U.lockCtx = ctx; grpFor(); } } else { prev = snap(); } } catch (e) {} }, 120);
 // open on the group that holds the context team
 function grpFor() {
  try { if (!ctx || typeof PANEL_ACT.v17unig !== 'function') return; for (const g of ['pro', 'col', 'world', 'na']) { PANEL_ACT.v17unig(g); const h = PANEL_RENDER.locker17(); if (typeof h === 'string' && h.indexOf('data-t="' + ctx.tid + '"') >= 0) { panelDirty(); return; } } panelDirty(); } catch (e) {}
 }
 const WHERE = { r: 'CARD TEAMS + ONLINE', fit: 'ANY TEAM, ANY MODE' };
 function filter(root) {
  const secs = root.querySelectorAll('.sec17.uni2319[data-t]');
  if (!secs.length && !root.querySelector('.rk15usec')) return false;
  if (ctx && Wn.__rl_no600lockall) { // 1.5f (Charlie): the LOCKER ROOM always shows the FULL collection, from anywhere; the wearable-only list is the UNIFORM button / pregame picker's job (RK15U.allowed there). Kill switch restores the old filter.
   const A = new Set(RK15U.allowed(ctx.tid, ctx.online).map(e => e.key));
   secs.forEach(sec => { if (sec.getAttribute('data-t') !== ctx.tid) { sec.remove(); return; }
    sec.querySelectorAll('[data-a="v17uni"]').forEach(b => { const v = String(b.getAttribute('data-v')), k = v.indexOf('|') >= 0 ? v.split('|')[1] : v; if (!A.has('k:' + (k | 0))) b.remove(); });
    sec.querySelectorAll('[data-a="v46fit"]').forEach(b => { if (!A.has('fit')) b.remove(); }); });
   root.querySelectorAll('[data-a="rk15eq"]').forEach(b => { if (!A.has('r:' + b.getAttribute('data-v'))) b.remove(); });
   root.querySelectorAll('.rk15usec').forEach(s => { if (!s.querySelector('[data-a="rk15eq"]')) s.remove(); });
   const list = root.querySelector('#lockList'); if (list && !list.querySelector('.rk15ctx')) { const n = document.createElement('div'); n.className = 'det17 rk15ctx'; n.style.cssText = 'color:#ffe14d;margin:2px 0 4px'; let nm = ''; try { nm = T(ctx.tid).name.toUpperCase(); } catch (e) {} n.textContent = 'SHOWING WHAT ' + nm + ' CAN WEAR ' + (ctx.online ? 'ONLINE' : 'HERE'); list.insertBefore(n, list.firstChild); }
  }
  if (!(ctx && Wn.__rl_no600lockall)) {
   const note = (b, s) => { if (b.querySelector('.rk15wh')) return; const n = document.createElement('small'); n.className = 'wh17 rk15wh'; n.textContent = s; b.appendChild(n); };
   root.querySelectorAll('[data-a="rk15eq"]').forEach(b => note(b, WHERE.r));
   root.querySelectorAll('[data-a="v46fit"]').forEach(b => note(b, WHERE.fit));
   secs.forEach(sec => { let nm = ''; try { nm = T(sec.getAttribute('data-t')).abbr || ''; } catch (e) {} sec.querySelectorAll('[data-a="v17uni"]:not(.lk)').forEach(b => note(b, (nm ? nm + ' ' : '') + 'ONLY')); });
  }
  return true;
 }
 function wrap() {
  const cur = PANEL_RENDER.locker17; if (typeof cur !== 'function' || cur.__rk595) return;
  const f = function () { const h = cur.apply(this, arguments); if (off() || typeof h !== 'string' || h.indexOf('lockList') < 0) return h; try { const tp = document.createElement('template'); tp.innerHTML = h; if (filter(tp.content)) return tp.innerHTML; } catch (e) {} return h; };
  f.__rk595 = 1; PANEL_RENDER.locker17 = f;
 }
 setInterval(() => { try { if (!off()) { wrap(); Wn.__rl_446locker = true; /* Crown / Whale tiles on every team in the locker */ } } catch (e) {} }, 400);
 // a team uniform or the fit picked = that team's Ranked Uni comes off (it used to win, so the tap looked dead)
 function wrapAct() {
  try {
   if (PANEL_ACT.v17uni && !PANEL_ACT.v17uni.__rk595) { const a0 = PANEL_ACT.v17uni; const f = function (v) { try { if (!off()) { const s = String(v); const tid = s.indexOf('|') >= 0 ? s.split('|')[0] : (ctx && ctx.tid); if (tid) RK15U.clearRanked(tid); } } catch (e) {} return a0.apply(this, arguments); }; f.__rk595 = 1; PANEL_ACT.v17uni = f; }
   if (PANEL_ACT.v46fit && !PANEL_ACT.v46fit.__rk595) { const a1 = PANEL_ACT.v46fit; const f = function (v) { try { if (!off() && v) RK15U.clearRanked(v); } catch (e) {} return a1.apply(this, arguments); }; f.__rk595 = 1; PANEL_ACT.v46fit = f; }
  } catch (e) {}
 }
 setInterval(wrapAct, 500);
 Wn.V595U = { ctx: () => ctx };
})();
