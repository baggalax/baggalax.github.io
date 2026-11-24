/* v590ui.js - 1.5 ONLINE menus + LEADERBOARD (Bagga Lax 1.5, Chucks' approved boards 1.5-1, 1.5-2, 1.5-5, 1.5-6).
 * 1) PLAY page: PLAY REGULAR goes teal; PLAY ONLINE (above SPECIAL GAMES) is GRAY + LOCKED with "LOCKED - MAKE AN ACCOUNT"
 *    when signed out (tap = the real MAKE YOUR ACCOUNT screen), GREEN with your rank badge when signed in (tap = ONLINE page).
 * 2) ONLINE page (V469.page 'onl'): badge + division + world rank up top; FIND MATCH (= LOCKER LEAGUE), PLAY A FRIEND
 *    (the old ONLINE), ONLINE SEASON, PROFILE + FRIENDS, BACK. ONLINE stays out of GAME MODES (v469, unchanged).
 * 3) LEADERBOARD panel (rk15lb): PLAYER RANK / LOCKER RANK tabs, every account (new ones tied at the bottom), pages load
 *    as you scroll both ways all the way to the bottom, JUMP TOP / ME / BOTTOM, tap a row = public profile.
 * 4) FRIENDS (acct23 panel): rank badge + division next to every friend name.
 * Wraps menuBars / menuBar / PANEL_RENDER only. No ids, rl_ keys or net messages changed. Kill switch: window.__rl_no590ui.
 */
(function () {
 'use strict';
 const Wn = window, R = Wn.RK15;
 if (!R || typeof Wn.menuBars !== 'function' || typeof Wn.menuBar !== 'function') return;
 const off = () => !!(Wn.__rl_no590ui || R.off() || !Wn.M37 || !Wn.V469);
 const DK = '#0b1a20';
 const U = Wn.RK15UI = { err: null };
 const fail = e => { U.err = String(e && e.stack || e); };
 const TT = () => typeof menuT !== 'undefined' ? menuT : performance.now() / 1e3;
 // ---- shared canvas pieces (same recipe as v578ui slabs) ----
 function slab(x, y, w, h, bg) { R.btn(x, y, w, h, bg, null, { noLabel: 1 }); } // 1.5b: shop / gear panel button style
 function ring(x, y, w, h) { const a = .55 + .45 * Math.sin(TT() * 4), c = 'rgba(255,225,77,' + a.toFixed(2) + ')'; rect(x - 2, y - 2, w + 4, 1, c); rect(x - 2, y + h + 3, w + 4, 1, c); rect(x - 2, y - 2, 1, h + 6, c); rect(x + w + 1, y - 2, 1, h + 6, c); rect(x - 1, y - 1, w + 2, 1, DK); rect(x - 1, y - 1, 1, h + 3, DK); rect(x + w, y - 1, 1, h + 3, DK); }
 function tri(x, y, k, col) { for (let i = 0; i < 3 * k; i++) rect(x + i, y + Math.round(i / 2), 1, Math.max(1, 5 * k - 2 * Math.round(i / 2)), col); }
 function chip(s, xr, y, bg, fg) { const w = textW(s) + 6; rect(xr - w - 1, y - 1, w + 2, 9, DK); rect(xr - w, y, w, 7, bg || '#ffe14d'); text(s, xr - w + 3, y + 1, 1, fg || DK); return w; }
 function lock(x, y, col) { rect(x + 1, y, 4, 1, col); rect(x, y + 1, 1, 3, col); rect(x + 5, y + 1, 1, 3, col); rect(x - 1, y + 4, 8, 6, col); rect(x + 2, y + 6, 2, 2, DK); }
 function subFit(list, x, w, y, col) { const avail = w - 12, t = list.find(s => R.miniW(s) <= avail) || list[list.length - 1]; R.miniFit(t, x + w / 2, y, avail, col || 'rgba(11,26,32,.75)', .75); }
 // big label with the play triangle; lx = left room reserved (badge)
 function bigLab(b, lab, lx, subTxt) {
  const x = b.x + lx, w = b.w - lx, avail = w - 14, sc = textW(lab, 2) + 11 <= avail ? 2 : 1, ty = b.y + (subTxt ? Math.max(3, Math.round((b.h - 5 * sc - 9) / 2)) : Math.round((b.h - 5 * sc) / 2));
  const tw = textW(lab, sc) + 4 * sc + 3, x0 = Math.round(x + (w - tw) / 2);
  tri(x0, ty + (sc === 2 ? 0 : 0), sc === 2 ? 2 : 1, DK); text(lab, x0 + 4 * sc + 3, ty, sc, DK);
  return ty + 5 * sc + 3;
 }
 const friendsOn = () => { try { const F = V23.st && V23.st.fr; return F && F.friends ? F.friends.filter(x => x.on).length : 0; } catch (e) { return 0; } };
 const onlineN = () => { try { const o = R.me && R.me.online; return o ? Math.max(o.on | 0, 1) : 0; } catch (e) { return 0; } };
 function openAccount() { try { V23.open('new', { gate: true }); } catch (e) { try { V23.open('in', { gate: true }); } catch (x) {} } }
 const goOnl = () => { R.refresh(true); try { Wn.RK15LL && RK15LL.open(); } catch (e) { fail(e); } }; // 1.5c: ONLINE goes straight to the online (Locker League) lobby
 // ---- ONLINE page rows ----
 function onlRows() {
  const mk = (o) => Object.assign({ t469: 'onl', rk15: 1, m37: 1 }, o);
  const ll = () => { try { Wn.RK15LL && RK15LL.open(); } catch (e) { fail(e); } };
  const fr = () => { try { RLNET.openOnline(); V23.open(null, { pick: true }); } catch (e) { fail(e); } };
  const ss = () => { try { RLNET.openOnline(); } catch (e) { fail(e); } };
  const pf = () => { try { Wn.RK15LL && RK15LL.profile(R.mine().u, true); } catch (e) { fail(e); } };
  const fs = () => { try { V23.open(null); } catch (e) { fail(e); } };
  return [
   [mk({ label: 'FIND MATCH', fn: ll, bg: '#7dff7a', h37: 34, rk15k: 'find' })],
   [mk({ label: 'PLAY A FRIEND', fn: fr, bg: '#2cc4dc', h37: 24, rk15k: 'friend' })],
   [mk({ label: 'ONLINE SEASON', fn: ss, bg: '#ffd23a', h37: 24, rk15k: 'season' })],
   [mk({ label: 'PROFILE', fn: pf, bg: '#b48aff', h37: 18, rk15k: 'prof' }), mk({ label: 'FRIENDS', fn: fs, bg: '#ff9a3d', h37: 18, rk15k: 'friends' })],
   [mk({ label: 'BACK', fn: () => { V469.page = 'pick'; }, bg: '#c9d6d9', m37: 'back', h37: 13, rk15k: 'back' })]
  ];
 }
 const MB0 = Wn.menuBars;
 Wn.menuBars = function () {
  const rows = MB0.apply(this, arguments);
  if (off()) return rows;
  try {
   if (M37.page !== 'play') return rows;
   if (V469.page === 'onl') { V469.page = 'pick'; if (R.signedIn()) setTimeout(goOnl, 0); return rows; } // old in-between page: any path that still lands here opens the online lobby
   if (V469.page !== 'pick' || !Array.isArray(rows)) return rows;
   const top = !Wn.__rl_no590top; Wn.__rk15top = top;
   let out = rows.map(r => r.map(b => {
    if (!b) return b;
    if (b.label === 'PLAY REGULAR') return Object.assign({}, b, { bg: '#2cc4dc' }, top ? { h37: 28 } : {});
    if (b.label === 'PLAY ONLINE') return Object.assign({}, b, { bg: R.signedIn() ? '#7dff7a' : '#5a6570', fn: () => R.signedIn() ? goOnl() : openAccount(), rk15k: 'online' }, top ? { h37: 40, rk15hero: 1 } : {});
    return b;
   }));
   if (top) { const i = out.findIndex(r => r && r[0] && r[0].label === 'PLAY ONLINE'); if (i > 0) { const r0 = out.splice(i, 1)[0]; out.unshift(r0); const f = out[1] && out[1][0]; if (f && f.first37) { r0[0] = Object.assign({}, r0[0], { first37: true }); out[1][0] = Object.assign({}, f, { first37: false }); } } } // 1.5c: ONLINE / RANKED is the first (hero) button
   return out;
  } catch (e) { fail(e); return rows; }
 };
 // ---- painting ----
 function paintOnlineBtn(b) {
  const sin = R.signedIn();
  if (b.rk15hero && sin) ring(b.x, b.y, b.w, b.h);
  slab(b.x, b.y, b.w, b.h, sin ? '#7dff7a' : '#5a6570');
  if (sin) {
   const m = R.mine(), jk = m.tier === 'JADE KING', bh = jk ? 26 : 22, k = b.h - 4 >= bh ? 1 : (b.h - 4) / bh;
   if (R.real()) R.drawBadge(b.x + 7, b.y + Math.round((b.h - bh * k) / 2), m.tier, m.div, k);
   const sy = bigLab(b, 'PLAY ONLINE', 24, 1), n = friendsOn();
   subFit(['RANKED - ' + n + ' FRIEND' + (n === 1 ? '' : 'S') + ' ON', 'RANKED - ' + n + ' ON', 'RANKED'], b.x + 24, b.w - 24, sy);
  } else {
   const sy = bigLab(b, 'PLAY ONLINE', 0, 1);
   lock(b.x + b.w - 16, b.y + Math.round(b.h / 2) - 5, '#c9d6d9');
   subFit(['LOCKED - MAKE AN ACCOUNT', 'MAKE AN ACCOUNT'], b.x, b.w - 14, sy, '#e8eef2');
  }
 }
 function onlHead(b) {
  const lb = lobbyBounds(), L = lb.L, cx = Math.round(lb.bx + lb.bw / 2), m = R.mine();
  g.save(); g.beginPath(); g.rect(L + 2, 22, W - L - 2, b.y - 22); g.clip();
  try { bgStripes(); rect(L, 0, W - L, H, 'rgba(0,0,0,.35)'); } finally { g.restore(); }
  const real = R.real(), s = !real ? 'RANKINGS COMING SOON' : R.mineLbl() + ' - ' + (R.down ? 'RANKINGS SOON' : m.rank == null ? 'NEW' : (m.tied ? '#' + m.rank + ' TIED' : 'RANK ' + m.rank.toLocaleString()));
  const tw = textW(s), bw = 22, x0 = Math.round(cx - (tw + bw + 4) / 2), y = b.y - 22;
  if (real) R.drawBadge(x0, y - (m.tier === 'JADE KING' ? 4 : 0), m.tier, m.div, 1);
  text(s, real ? x0 + bw + 4 : cx - textW(s) / 2, y + 8, 1, '#ffe14d', 'left', '#000');
 }
 function paintOnl(b) {
  const k = b.rk15k;
  if (k === 'back') { R.btn(b.x, b.y, b.w, b.h, '#2a3a44', null, { noLabel: 1 }); for (let i = 0; i < 3; i++) rect(b.x + 8 - i, b.y + Math.round(b.h / 2) - 2 + i, 1, 5 - 2 * i, '#c9d6d9'); text('BACK', b.x + b.w / 2, b.y + Math.round((b.h - 5) / 2), 1, '#c9d6d9', 'center'); return; }
  if (k === 'find') ring(b.x, b.y, b.w, b.h);
  slab(b.x, b.y, b.w, b.h, b.bg);
  if (k === 'prof' || k === 'friends') {
   text(b.label, b.x + b.w / 2 + 3, b.y + Math.round((b.h - 5) / 2), 1, DK, 'center'); tri(b.x + b.w / 2 - textW(b.label) / 2 - 6, b.y + Math.round((b.h - 5) / 2), .6, DK);
   if (k === 'friends') { const n = friendsOn(); if (n) chip(n + ' ON', b.x + b.w - 2, b.y - 5); }
   return;
  }
  const sy = bigLab(b, b.label, 0, 1);
  if (k === 'find') { subFit(['LOCKER LEAGUE - RANKED - ABOUT 20 SEC', 'LOCKER LEAGUE - RANKED', 'RANKED'], b.x, b.w, sy); const n = onlineN(); if (n) chip(n.toLocaleString() + ' ON', b.x + b.w - 6, b.y - 5); }
  if (k === 'friend') subFit(['INVITE AN ONLINE FRIEND', 'INVITE A FRIEND'], b.x, b.w, sy);
  if (k === 'season') subFit(['A FULL SEASON VS REAL TEAMS', 'SEASON VS REAL TEAMS'], b.x, b.w, sy);
 }
 const MBar0 = Wn.menuBar;
 Wn.menuBar = function (b, live) {
  if (off() || !b || screen !== 'menu' || M37.page !== 'play') return MBar0.apply(this, arguments);
  if (b.rk15 && V469.page === 'onl') {
   try {
    if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, 'rk15' + b.label);
    if (b.rk15k === 'find') onlHead(b);
    paintOnl(b);
   } catch (e) { fail(e); }
   return;
  }
  const r = MBar0.apply(this, arguments);
  try { if (b.rk15k === 'online' && V469.page === 'pick') paintOnlineBtn(b); } catch (e) { fail(e); }
  return r;
 };
 // the PLAY page hint plate on the left reads "PICK A MODE"; fine for the online page too.

 /* ================= LEADERBOARD (DOM panel) ================= */
 const LB = U.lb = { tab: 'player', rows: [], lo: 0, hi: 0, total: 0, busy: false, err: '', mePos: null, back: 'menu', want: null };
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
 const css = document.createElement('style');
 css.textContent = '#panel .rk15tabs{display:flex;gap:8px;align-items:center;margin:0 0 6px;flex-wrap:nowrap}#panel .rk15tabs button{background:#14232b;color:#9fb8c4;border:2px solid #0b1a20;box-shadow:0 2px 0 #000;padding:5px 10px;border-radius:0;min-height:0;min-width:0;width:auto;font-size:11px}#panel .rk15tabs button.on{background:#ffcc33;color:#0b1a20;box-shadow:0 2px 0 #000,0 0 0 2px #fff6c0}#panel .rk15tabs .jl{margin-left:auto;font-size:9px;color:#9fb8c4;letter-spacing:1px}#panel .rk15tabs button.jmp{background:rgba(11,26,32,.8);color:#fff;border:2px solid #fff;padding:4px 8px}' +
  '#panel .rk15wrap{display:flex;gap:12px;align-items:stretch;min-height:0;flex:1 1 auto;overflow:hidden}#panel #rk15list{flex:1 1 0;min-width:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-right:4px}#panel .rk15side{width:220px;flex:0 0 auto;overflow-y:auto}' +
  '.rk15row{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.35);border:1px solid #2c4452;padding:4px 8px;margin:0 0 4px;min-height:26px;cursor:pointer}.rk15row .no{width:44px;text-align:center;color:#ffe14d;font-size:12px;flex:0 0 auto;line-height:11px}.rk15row .no.t{color:#a77bff;font-size:9px}.rk15row .nm{flex:1 1 auto;color:#fff;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rk15row .tr{font-size:10px;color:#9fb8c4;white-space:nowrap}' +
  '.rk15row.me{border-color:#7dff7a;background:rgba(125,255,122,.12)}.rk15row.jk{border:2px solid #ffd23a;background:linear-gradient(90deg,#0f7a3c,#1fbf5f 55%,#0f7a3c);box-shadow:0 0 8px #3dff8a}.rk15row.jk .nm,.rk15row.jk .tr,.rk15row.jk .no{color:#06121a}.rk15row.tied{border:1px dashed #6a3fc4;background:rgba(106,63,196,.12)}.rk15row.lk1{border:2px solid #c9a227;background:linear-gradient(90deg,#06140f,#1d5a48 55%,#06140f)}' +
  '.rk15tier{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.35);border:1px solid #2c4452;padding:1px 8px;margin:0 0 3px;min-height:24px;font-size:11px}.rk15tier .tr{margin-left:auto;font-size:9px;color:#9fb8c4}.rk15more{text-align:center;color:#9fb8c4;font-size:10px;padding:6px}.rk15box{background:rgba(0,0,0,.35);border:1px solid #2c4452;padding:8px 10px;font-size:10px;line-height:15px;color:#cfe9ff}' +
  '@media (max-width:700px){#panel .rk15side{display:none}}' +
  '#panel[data-scr="rk15lb"] button{border:2px solid #0b1a20!important;border-radius:0!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000!important}#panel[data-scr="rk15lb"] .rk15tabs button:not(.on):not(.jmp){box-shadow:inset 0 2px 0 rgba(255,255,255,.12),0 3px 0 #000!important}#panel[data-scr="rk15lb"] .rk15tabs button.jmp{background:rgba(11,26,32,.85);border-color:#fff!important}';
 document.head.appendChild(css);
 function rowHtml(r) {
  const lk = LB.tab === 'locker';
  if (lk) { // LOCKER RANK: a plain numbered list (server position), no tier badges; #1 shows the Davy Jones uni
   const cls = 'rk15row' + (r.me ? ' me' : '') + (r.r === 1 ? ' lk1' : '');
   const nm = (r.me ? 'YOU - ' : '') + R.safeName(r.u), tr = (r.lk | 0) > 0 ? 'RATING ' + (r.lk | 0).toLocaleString() + (r.r === 1 ? ' - DAVY JONES' : '') : 'EMPTY LOCKER';
   return '<div class="' + cls + '" data-a="rk15pf" data-v="' + esc(r.u) + '"><span class="no">#' + r.r.toLocaleString() + '</span>' + (r.r === 1 ? '<img src="rk15/davy.webp" alt="DAVY JONES" style="width:22px;height:24px;object-fit:contain;image-rendering:pixelated;flex:0 0 auto">' : '') + '<span class="nm">' + esc(nm) + '</span><span class="tr">' + esc(tr) + '</span></div>';
  }
  const cls = 'rk15row' + (r.me ? ' me' : '') + (r.jk ? ' jk' : '') + (r.tied ? ' tied' : '');
  const no = r.tied ? '<span class="no t">#' + r.r.toLocaleString() + '<br>TIED</span>' : '<span class="no">' + r.r.toLocaleString() + '</span>';
  const nm = (r.me ? 'YOU - ' : '') + R.safeName(r.u);
  const tr = r.tied ? 'SQUID I - NO RANKED GAME YET' : R.lbl(r.tier, r.div);
  return '<div class="' + cls + '" data-a="rk15pf" data-v="' + esc(r.u) + '">' + no + R.tag(r.tied ? 'SQUID' : r.tier, r.tied ? 1 : r.div) /* 1.5d: tied = SQUID I badge (the bottom), same as its text */ + '<span class="nm">' + esc(nm) + '</span><span class="tr">' + esc(tr) + '</span></div>';
 }
 function listHtml() {
  if (R.down) return '<div class="rk15box" style="margin-top:20px;text-align:center;font-size:13px;color:#ffe14d">RANKINGS COMING SOON<br><span style="color:#9fb8c4;font-size:10px">THE LEADERBOARD GOES LIVE WITH THE RANKED SERVER. EVERYTHING ELSE WORKS.</span></div>';
  if (!LB.rows.length) return '<div class="rk15more">' + (LB.err ? esc(LB.err) : 'LOADING...') + '</div>';
  return (LB.lo > 0 ? '<div class="rk15more" id="rk15up">LOADING ABOVE...</div>' : '') + LB.rows.map(rowHtml).join('') + (LB.hi < LB.total ? '<div class="rk15more" id="rk15dn">LOADING MORE...</div>' : '<div class="rk15more">BOTTOM - ' + LB.total.toLocaleString() + ' ACCOUNTS</div>');
 }
 function sideHtml() {
  if (LB.tab === 'locker') return '<div class="sh17">LOCKER RATING</div><div class="rk15box">HOW GOOD YOUR WHOLE COLLECTION IS: CARDS, GEAR, UNIFORMS. EVERY ITEM COUNTS ONCE, RARER = MORE. NOT YOUR WINS - IT IS JUST A FLEX.<br><br>A PLAIN LIST: #1, #2, #3 ... NO TIERS HERE.<br><br><span style="color:#7dffb0">#1 LOCKER GETS DAVY JONES - YOURS FOREVER.</span><br><br><span style="color:#9fb8c4">TOP 10 LOCKERS = GREEN LOCKER BADGE ON THE ARM.</span></div>';
  return '<div class="sh17">TIERS <span>I - V EACH</span></div>' + R.TIERS.slice().reverse().map(t => '<div class="rk15tier">' + R.tag(t.n, t.n === 'JADE KING' ? 1 : 3) + '<span style="color:' + t.L + '">' + t.n + '</span><span class="tr">' + (t.n === 'JADE KING' ? 'PAST BAGGATWAAN I' : 'V - I') + '</span></div><div class="rk15box" style="margin:0 0 4px;font-size:9px">' + R.ruleTxt(t.n) + '</div>').join('') + '<div class="rk15box">BEAT SOMEONE HIGHER = +1 EXTRA. LOSE TO SOMEONE LOWER = -1 AT ONCE (-2 FROM NASTY UP). THE #1 PLAYER WEARS THE JADE KING UNI + EARNS JADE FOREVER.</div>';
 }
 PANEL_SCREENS.push('rk15lb');
 PANEL_RENDER.rk15lb = function () {
  const m = R.mine();
  return '<div class="hd"><div><div class="tt">LEADERBOARD</div><div class="st">' + (LB.tab === 'locker' ? 'LOCKER RANK - EVERY LOCKER BY LOCKER RATING' : 'WORLD - EVERY ACCOUNT IS ON IT' + (LB.total && !R.down ? ' (' + LB.total.toLocaleString() + ')' : '')) + '</div></div><div class="sp"></div><button type="button" class="y" data-a="rk15fr">FRIENDS</button><button type="button" class="g" data-a="rk15back">BACK</button></div>' +
   '<div class="rk15tabs"><button type="button" class="' + (LB.tab === 'player' ? 'on' : '') + '" data-a="rk15tab" data-v="player">PLAYER RANK</button><button type="button" class="' + (LB.tab === 'locker' ? 'on' : '') + '" data-a="rk15tab" data-v="locker">LOCKER RANK</button><span class="jl">JUMP</span><button type="button" class="jmp" data-a="rk15jmp" data-v="top">TOP</button><button type="button" class="jmp" data-a="rk15jmp" data-v="me">ME</button><button type="button" class="jmp" data-a="rk15jmp" data-v="bottom">BOTTOM</button></div>' +
   '<div class="rk15wrap"><div id="rk15list" class="scroll">' + listHtml() + '</div><div class="rk15side">' + sideHtml() + '</div></div>';
 };
 const N = 40;
 async function load(o) { // o: {off} | {jump} | {more:'up'|'dn'}
  if (LB.busy) return; LB.busy = true;
  try {
   let body = { tab: LB.tab, n: N };
   if (o.more === 'dn') body.off = LB.hi; else if (o.more === 'up') body.off = Math.max(0, LB.lo - N), body.n = LB.lo - body.off; else if (o.jump) body.jump = o.jump, body.off = 0; else body.off = o.off || 0;
   if (!body.n) return;
   const j = await R.call('board', body);
   if (!j || !j.ok) { LB.err = j && j.error || 'NO CONNECTION'; repaint(); return; }
   LB.total = j.total | 0; LB.mePos = j.mePos;
   if (o.more === 'dn') { LB.rows = LB.rows.concat(j.rows); LB.hi = j.off + j.rows.length; }
   else if (o.more === 'up') { LB.rows = j.rows.concat(LB.rows); LB.lo = j.off; }
   else { LB.rows = j.rows; LB.lo = j.off; LB.hi = j.off + j.rows.length; }
   if (LB.rows.length > 400) { if (o.more === 'up') { LB.rows = LB.rows.slice(0, 400); LB.hi = LB.lo + 400; } else { const cut = LB.rows.length - 400; LB.rows = LB.rows.slice(cut); LB.lo += cut; } }
   repaint(o);
  } finally { LB.busy = false; }
 }
 function repaint(o) {
  if (screen !== 'rk15lb') return;
  const el = document.getElementById('rk15list'); if (!el) { panelDirty(); return; }
  const prevH = el.scrollHeight, prevT = el.scrollTop;
  el.innerHTML = listHtml();
  const st = document.querySelector('#panel .hd .st'); if (st && LB.tab !== 'locker') st.textContent = 'WORLD - EVERY ACCOUNT IS ON IT' + (LB.total && !R.down ? ' (' + LB.total.toLocaleString() + ')' : '');
  if (o && o.more === 'up') el.scrollTop = prevT + (el.scrollHeight - prevH);
  else if (o && o.jump === 'me') { const me = el.querySelector('.rk15row.me'); el.scrollTop = me ? Math.max(0, me.offsetTop - el.clientHeight / 2) : 0; }
  else if (o && o.jump === 'bottom') el.scrollTop = el.scrollHeight;
  else if (o && !o.more) el.scrollTop = 0;
  bindScroll(el);
 }
 function bindScroll(el) {
  if (el.__rk15) return; el.__rk15 = 1;
  el.addEventListener('scroll', () => {
   if (LB.busy) return;
   if (el.scrollTop + el.clientHeight > el.scrollHeight - 60 && LB.hi < LB.total) load({ more: 'dn' });
   else if (el.scrollTop < 40 && LB.lo > 0) load({ more: 'up' });
  }, { passive: true });
 }
 U.openBoard = function (tab, back) {
  LB.tab = tab || LB.tab || 'player'; LB.back = back || (typeof screen !== 'undefined' ? screen : 'menu'); LB.rows = []; LB.lo = LB.hi = 0; LB.err = '';
  screen = 'rk15lb'; panelDirty();
  load({ off: 0 });
 };
 PANEL_ACT.rk15tab = v => { LB.tab = v === 'locker' ? 'locker' : 'player'; LB.rows = []; LB.lo = LB.hi = 0; panelDirty(); setTimeout(() => load({ off: 0 }), 0); };
 PANEL_ACT.rk15jmp = v => { if (v === 'top') load({ off: 0 }).then(() => repaint({})); else load({ jump: v }); return PANEL_KEEP; };
 PANEL_ACT.rk15back = () => { screen = LB.back === 'rk15lb' ? 'menu' : LB.back || 'menu'; };
 PANEL_ACT.rk15fr = () => { try { V23.open(null); } catch (e) {} return PANEL_KEEP; };
 PANEL_ACT.rk15pf = v => { try { Wn.RK15LL && RK15LL.profile(v, false, 'rk15lb'); } catch (e) { fail(e); } };
 // keep the list bound after any re-render
 const sp0 = Wn.syncPanel;
 if (typeof sp0 === 'function') Wn.syncPanel = function () { const r = sp0.apply(this, arguments); try { if (screen === 'rk15lb') { const el = document.getElementById('rk15list'); if (el) bindScroll(el); } } catch (e) {} return r; };

 /* ================= FRIENDS: badge + division by every name ================= */
 const rkCache = {};
 let frBusy = false, frT = 0;
 function badgeFriends() {
  const root = document.getElementById('acct23'); if (!root || root.style.display === 'none' || off()) return;
  const rows = [...root.querySelectorAll('.row.fr23[data-u], .row.inc23')];
  const need = [];
  rows.forEach(r => { const u = r.getAttribute('data-u') || (r.querySelector('.n') && r.querySelector('.n').textContent.split(' ')[0]); if (!u) return; const k = u.toLowerCase(); const c = rkCache[k];
   if (c && !r.querySelector('.rk15b')) { const n = r.querySelector('.n'); if (n) { n.style.minWidth = '9ch'; n.style.flex = '1 0 auto'; n.style.maxWidth = '45%'; n.insertAdjacentHTML('afterend', R.tag(c.ranked ? c.tier : 'SQUID', c.ranked ? c.div : 1, .8)); const b = n.nextElementSibling; if (b) { b.title = c.ranked ? R.lbl(c.tier, c.div) : 'SQUID V'; b.style.margin = '0 4px'; } } /* 1.5c: USERNAME always shows (it was squeezed to 0 width), the rank badge right next to it */ }
   if (!c) need.push(k); });
  if (need.length && !frBusy && Date.now() - frT > 8e3 && !R.down) { frBusy = true; frT = Date.now(); R.call('ranks', { us: need }).then(j => { if (j && j.ok) j.ranks.forEach(x => rkCache[String(x.u).toLowerCase()] = x); need.forEach(k => { if (!rkCache[k]) rkCache[k] = { ranked: false }; }); frBusy = false; badgeFriends(); }).catch(() => { frBusy = false; }); }
 }
 setInterval(() => { try { badgeFriends(); } catch (e) {} }, 700);
})();
