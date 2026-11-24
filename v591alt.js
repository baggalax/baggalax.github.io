/* v591alt.js - Bagga Lax 1.5c: CHOOSE ALTERNATE UNI (online uniform clash)
 * Bug/ask: both players wear their picked uniforms online, so two kits can look the same (same uniform, or jersey +
 *   helmet + shorts too close). Nothing chose who changes.
 * Fix: after the coin toss (online pregame, friend / season / ranked PvP) both phones run the same clash test on the
 *   same two kits. If they clash, whoever LOST the toss gets a CHOOSE ALTERNATE UNI screen: locker-style tiles of the
 *   other uniforms in their current set that are NOT too close to the opponent. 8 s timer auto-picks the most different.
 *   Nothing in the set different enough -> the most different allowed uni they own -> else a plain contrast kit.
 *   The toss stays on its result card (both phones) until the pick lands.
 *   Wire: NO new message type. The pick rides in the existing lobby fields: [me]u21 (team variant), and an extra
 *   member "rk15alt" {n: match nonce, u: 'k:N' | 'r:KEY' | 'c:w' | 'c:b' | 'none'} inside the existing [me]szn
 *   object (same as rk15u). The winner's phone reads the room state and puts that kit on the opponent. Only if
 *   nothing arrives in 16 s (other phone gone) does it guess the auto-pick itself.
 *   Ranked vs CPU (no pregame): a quick coin flip when the match-found countdown ends; if you lose, the picker opens
 *   and the countdown waits; if the CPU loses it switches to its most different kit.
 * Kill switch: window.__rl_no591alt
 */
(function () {
 const Wn = window;
 const off = () => !!Wn.__rl_no591alt || !Wn.RK15U || !Wn.UNI21;
 const U = () => Wn.UNI21;
 const fail = (w, e) => { try { (Wn.__rk15err = Wn.__rk15err || []).push('alt ' + w + ': ' + (e && e.message || e)); } catch (x) {} };
 const rgb = h => { const n = parseInt(String(h || '#000').replace('#', '').slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
 const cd = (a, b) => { const p = rgb(a), q = rgb(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
 const SH = k => k && (k.shorts || k.helm || k.jersey);
 // main jersey counts double; helmet + shorts one each
 const dist0 = (a, b) => (2 * cd(a.jersey, b.jersey) + cd(a.helm, b.helm) + cd(SH(a), SH(b))) / 4;
 const dist = (a, b) => { try { if (Wn.ALT600 && Wn.ALT600.on()) return Wn.ALT600.dist(a, b); } catch (e) {} return dist0(a, b); }; // 1.5f: v600clash compares the colours actually drawn
 const THR = 75;
 const idOf = (tid, k) => { if (!k) return ''; if (k.rk15) return 'r:' + k.rk15; if (k.alt15) return 'c:' + k.alt15; let b = tid; try { b = U().base ? U().base(tid) : tid; } catch (e) {} return b + '/' + (k.fit45 || (k.k21 | 0)); };
 const same = (ta, a, tb, b) => !!a && !!b && idOf(ta, a) === idOf(tb, b);
 const clash = (ta, a, tb, b) => { try { if (Wn.ALT600 && Wn.ALT600.on()) return !!a && !!b && Wn.ALT600.clash(ta, a, tb, b); } catch (e) {} return !!a && !!b && (same(ta, a, tb, b) || dist(a, b) < THR); };
 // plain contrast kits (white / black), keeping the rest of the team kit
 function contrast(tid, w) { let k = {}; try { k = Object.assign({}, U().kitOf(tid, 0)); } catch (e) {} delete k.g27; delete k.rk15; return Object.assign(k, w === 'w' ? { jersey: '#f2f2ee', trim: '#1a1a1a', helm: '#f2f2ee', shorts: '#f2f2ee' } : { jersey: '#16181c', trim: '#e8e8e8', helm: '#16181c', shorts: '#16181c' }, { alt15: w, k21: 0 }); }
 function cIcon(w) { const c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d'); const j = w === 'w' ? '#f2f2ee' : '#16181c', t = w === 'w' ? '#1a1a1a' : '#e8e8e8'; const R = (a, b, cc, d, col) => { x.fillStyle = col; x.fillRect(a, b, cc - a + 1, d - b + 1); }; R(6, 1, 13, 5, '#000'); R(7, 2, 12, 4, j); R(1, 6, 18, 10, '#000'); R(4, 6, 15, 14, '#000'); R(2, 7, 17, 9, j); R(5, 7, 14, 13, j); R(8, 7, 11, 7, t); R(5, 14, 14, 16, j); return c.toDataURL(); }
 // what this team may switch to, given the opponent kit
 function kitFor(tid, key) {
  try {
   if (!key || key === 'none') return null;
   if (key.indexOf('k:') === 0) { const n = +key.slice(2); if (!U().okK(tid, n)) return null; const k = U().kitOf(tid, n); k.k21 = n; return k; }
   if (key.indexOf('r:') === 0) return RK15U.kitFor(key.slice(2)) || null;
   if (key === 'c:w' || key === 'c:b') return contrast(tid, key.slice(2));
  } catch (e) { fail('kitFor', e); }
  return null;
 }
 function options(tid, cur, opp, oppTid, online) {
  const all = RK15U.allowed(tid, online).filter(e => e.key !== 'fit' && e.kit);
  const curId = idOf(tid, cur), set = cur && cur.rk15 ? 'r:' : 'k:';
  const ok = e => idOf(tid, e.kit) !== curId && !clash(tid, e.kit, oppTid, opp);
  const by = (a, b) => dist(b.kit, opp) - dist(a.kit, opp);
  let L = all.filter(e => e.key.indexOf(set) === 0 && ok(e)).sort(by);
  if (L.length) return { list: L, why: '' };
  L = all.filter(ok).sort(by);
  if (L.length) return { list: L.slice(0, 1), why: 'NOTHING ELSE IN THIS SET IS DIFFERENT ENOUGH' };
  const cw = contrast(tid, 'w'), cb = contrast(tid, 'b');
  const c = [{ key: 'c:w', nm: 'PLAIN WHITE', img: cIcon('w'), kit: cw, sec: 'CONTRAST KIT' }, { key: 'c:b', nm: 'PLAIN BLACK', img: cIcon('b'), kit: cb, sec: 'CONTRAST KIT' }].sort(by);
  return { list: c, why: 'NO OTHER UNIFORM IS DIFFERENT ENOUGH' };
 }
 const autoKey = o => o.list[0].key; // lists are sorted most-different first
 // ---------- online (pregame coin toss) ----------
 const net = () => Wn.RLNET;
 function nonce() { const N = net(); let s = String(N && N.code || '') + '|' + JSON.stringify(N && N.st && N.st.start || '') + '|' + (N && N.st && N.st.sseq || ''); let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); }
 const SEC = Wn.__rl_no77alt ? 8 : 1e9, WAIT = Wn.__rl_no77alt ? 16 : 120; // 1.5 B77 (Charlie): never auto-pick - the player who has to change picks (the other phone waits for it; 120 s = he is gone)
 let timerIv = null;
 function sendPick(A, key) {
  const N = net(); if (!N || !N.patchLobby || !N.lobby) return;
  const me = N.side === 'h' ? 'h' : 'g', st = N.lobby.state || {}, cur = st[me + 'szn'] || null;
  const nv = Object.assign({}, cur || {}, { rk15alt: { n: A.n, u: key } });
  const p = { [me + 'szn']: nv };
  if (key.indexOf('k:') === 0) { p[me + 'u21'] = +key.slice(2); nv.rk15u = null; } else if (key.indexOf('r:') === 0) nv.rk15u = key.slice(2);
  try { st[me + 'szn'] = nv; N.patchLobby(p); } catch (e) { fail('send', e); }
 }
 function myPick(G, A, key) {
  if (A.done) return; A.done = true; A.hold = false; A.key = key;
  if (timerIv) { clearInterval(timerIv); timerIv = null; }
  try { RK15U.closePick(); } catch (e) {}
  const k = kitFor(G.user, key); if (k) G.uk = k;
  sendPick(A, key);
  // 1.5 B77: the room server can drop one of two patches written at the same moment; send the pick again a few times
  // (same nonce - the other phone takes it once). Kill switch: window.__rl_no77fix
  if (!Wn.__rl_no77fix) { let n = 0; const iv = setInterval(() => { try { if (++n > 6 || typeof game === 'undefined' || game !== G) { clearInterval(iv); return; } sendPick(A, key); } catch (e) { clearInterval(iv); } }, 2200); }
 }
 function oppPick(G, A, key) {
  if (A.got) return; A.got = true; A.hold = false; A.key = key;
  if (key !== 'none') { const k = kitFor(G.opp, key); if (k) G.ok = k; }
 }
 function openPicker(G, A, opt, done) {
  const t0 = Date.now();
  const el = RK15U.showList(opt.list, { title: Wn.__rl_no77alt ? 'CHOOSE ALTERNATE UNI' : 'UNIFORM CLASH - PICK ONE', big77: !Wn.__rl_no77alt, noClose: true, timer: !!Wn.__rl_no77alt, sub: 'TAP = WEAR', note: 'UNIFORMS TOO ALIKE - ' + (A.cpu ? 'YOU LOST THE COIN FLIP' : 'YOU LOST THE TOSS'), foot: opt.why, pick: key => done(key) });
  const tick = () => { const left = Math.max(0, SEC - (Date.now() - t0) / 1000); try { const t = el.querySelector('.tm'); if (t) t.textContent = Math.ceil(left) + 's'; } catch (e) {} if (left <= 0) { clearInterval(timerIv); timerIv = null; done(autoKey(opt)); } };
  if (timerIv) clearInterval(timerIv); timerIv = setInterval(tick, 200); tick();
 }
 function begin(G) {
  const c = G.coin, N = net();
  const A = G.alt15 = { n: nonce(), t0: Date.now(), loser: c.win === 0 ? 1 : 0, hold: false, done: false, got: false };
  A.clash = clash(G.user, G.uk, G.opp, G.ok);
  if (A.loser === 0) {
   if (!A.clash) { A.done = true; sendPick(A, 'none'); return; }
   A.opt = options(G.user, G.uk, G.ok, G.opp, true); A.hold = true;
   openPicker(G, A, A.opt, key => myPick(G, A, key));
  } else {
   A.got = false; A.hold = A.clash; // the winner waits on the result card while the other phone picks
   A.opt = options(G.opp, G.ok, G.uk, G.user, true);
  }
 }
 // winner: read the room state for the loser's pick (the in-game lobby poll is off)
 let pollBusy = false;
 function poll(G) {
  const A = G.alt15, N = net(); if (!A || A.loser !== 1 || A.got || pollBusy || !N || !N.call || !N.code) return;
  if (Date.now() - (A.pt || 0) < 700) return; A.pt = Date.now(); pollBusy = true;
  const o = N.side === 'h' ? 'g' : 'h';
  Promise.resolve(N.call('/room/' + N.code + '/state')).then(r => { const d = r && r.state && r.state[o + 'szn']; const a = d && d.rk15alt; if (a && a.n === A.n && typeof a.u === 'string' && G === game) oppPick(G, A, a.u); }).catch(() => {}).then(() => { pollBusy = false; });
  if (Date.now() - A.t0 > WAIT * 1000 && !A.got) { // never heard back: the same auto-pick the other phone makes
   if (A.clash) oppPick(G, A, autoKey(A.opt)); else A.got = true;
  }
 }
 const ct0 = Wn.coinTick15;
 if (typeof ct0 === 'function') Wn.coinTick15 = function (G, dt) {
  try {
   if (!off() && G && G.online && G.coin && G.coin.phase === 'show' && G.coin.win != null) {
    const c = G.coin;
    if (!G.alt15 && c.t + (dt || 0) >= COIN15.show - .15) begin(G);
    if (G.alt15 && G.alt15.hold) c.t = Math.min(c.t, COIN15.show - .2 - (dt || 0));
   }
   if (G && G.alt15) poll(G);
  } catch (e) { fail('tick', e); }
  return ct0.apply(this, arguments);
 };
 // keep listening after the toss card is gone (if the phones ever disagreed on "clash", the loser's pick still lands)
 setInterval(() => { try { const G = typeof game !== 'undefined' ? game : null; if (G && G.alt15 && G.online) poll(G); } catch (e) {} }, 800);
 // winner's wait card (on the coin result screen)
 const r0 = Wn.render;
 if (typeof r0 === 'function') Wn.render = function () {
  const r = r0.apply(this, arguments);
  try {
   const G = typeof game !== 'undefined' ? game : null, A = G && G.alt15;
   if (!off() && A && A.hold && A.loser === 1 && screen === 'pregame') {
    const w = Math.min(W - 16, 230), x = Math.round((W - w) / 2), y = H - 40, left = Math.max(0, Math.ceil(SEC - (Date.now() - A.t0) / 1000));
    rect(x - 2, y - 2, w + 4, 26, '#000'); rect(x, y, w, 22, '#1d2a35'); rect(x, y, w, 2, '#ffe14d');
    text('UNIFORMS TOO ALIKE', W / 2, y + 4, 1, '#ffe14d', 'center');
    textMini('OPPONENT IS CHOOSING AN ALTERNATE UNI' + (left ? ' - ' + left + 'S' : '...'), W / 2, y + 13, '#e8f4f6');
   }
  } catch (e) { fail('draw', e); }
  return r;
 };
 // ---------- ranked vs CPU: quick coin flip at the end of the match-found countdown ----------
 // returns true while the player is choosing (the countdown waits); cb() continues the start
 function botGate(m, tid, cb) {
  if (off()) return false;
  if (m.alt15) return !m.alt15.done;
  const A = m.alt15 = { done: false, cpu: true };
  try {
   const ks = U().gameKits(tid, m.opp.tid, true, 'quick', { ll15: 1 });
   const mine = ks[0], bot = ks[1];
   if (!clash(tid, mine, m.opp.tid, bot)) { A.done = true; return false; }
   A.flip = Math.random() < .5 ? 'cpu' : 'me';
   if (A.flip === 'cpu') { const o = options(m.opp.tid, bot, mine, tid, false); const L = o.list.filter(e => e.key.indexOf('r:') < 0); A.botKit = (L[0] || o.list[0]).kit; A.done = true; return false; }
   const o = options(tid, mine, bot, m.opp.tid, true);
   openPicker(null, A, o, key => { if (A.done) return; A.done = true; if (timerIv) { clearInterval(timerIv); timerIv = null; } try { RK15U.closePick(); } catch (e) {} A.myKit = kitFor(tid, key); cb(); });
   return true;
  } catch (e) { fail('bot', e); A.done = true; return false; }
 }
 Wn.RK15ALT = { dist: dist, clash: clash, options: options, kitFor: kitFor, botGate: botGate, THR: THR, SEC: SEC };
})();
