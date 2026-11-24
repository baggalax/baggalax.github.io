/* v590uni.js - 1.5 RANKED UNI (board 1.5-7): per-tier uniforms (home + away) with the real tier badge on the chest,
 * JADE CROWN (only while #1), JADE (hit #1 once = forever), DAVY JONES (#1 locker once = forever).
 * - Unlocked = kept forever even if you drop (rl_rk15u.best = best tier ever on this account/phone).
 * - Worn per team (rl_rk15u.t[team] = 'fish_h' | 'fish_a' | 'jadecrown' | 'jade' | 'davy'), like The Whale / The Crown.
 *   The Locker League card team wears your current tier's home uni until you pick something else.
 * - Locker: LOCKER ROOM > UNIFORMS > N/A, a RANKED UNI group under WHALE / CROWN; EQUIP on owned tiles, locked tiles say how.
 * - The Crown / The Whale no longer come up when cycling the uniform arrow (v446): only EQUIP in the locker or the new
 *   UNIFORMS button on the pre-match screen puts them (or a Ranked Uni) on.
 * - Online: your worn Ranked Uni rides in your card-team lobby payload (hszn/gszn.rk15u, existing key) so the other phone
 *   draws it too. Chest badges are stamped by v590stick.js (RK15U.chestFor).
 * New storage key: rl_rk15u. Kill switch: window.__rl_no590uni.
 */
(function () {
 'use strict';
 const Wn = window, R = Wn.RK15;
 if (!R || !Wn.UNI21) return;
 const off = () => !!(Wn.__rl_no590uni || R.off());
 const U = Wn.UNI21;
 let S = { t: {}, best: -1, jade: 0, davy: 0 };
 try { const s = JSON.parse(localStorage.getItem('rl_rk15u') || 'null'); if (s && typeof s === 'object') S = Object.assign(S, s, { t: s.t || {} }); } catch (e) {}
 const save = () => { try { localStorage.setItem('rl_rk15u', JSON.stringify(S)); } catch (e) {} };
 // unique jersey colours (the chest stamp keys on them; away whites differ by 1 step per tier so nobody can tell)
 const K = {};
 R.TIERS.slice(0, 6).forEach((t, i) => {
  K[t.k + '_h'] = { jersey: t.k === 'fish' && !Wn.__rl_no596fish ? '#1b3f9e' : t.M, trim: t.L, helm: t.D, rk15: t.k, nm: t.n + ' HOME', tier: t.n }; // 1.5c (Jonny): FISH HOME is a deeper royal blue - its old blue sat too close to Pennsylvania's on the field
  K[t.k + '_a'] = { jersey: '#e8eef' + i, trim: t.M, helm: t.M, rk15: t.k, nm: t.n + ' AWAY', tier: t.n };
 });
 K.jadecrown = { jersey: '#1fbf5e', trim: '#ffd23a', helm: '#0c6a33', rk15: 'jadeking', crown: 1, nm: 'JADE CROWN', tier: 'JADE KING' };
 K.jade = { jersey: '#1fbf5d', trim: '#7dffb0', helm: '#0c6a33', rk15: 'jade', nm: 'JADE', tier: 'JADE KING' };
 K.davy = { jersey: '#2f6f5d', trim: '#c9a227', helm: '#14231e', rk15: 'davy', nm: 'DAVY JONES', tier: null };
 const ORDER = [].concat(...R.TIERS.slice(0, 6).map(t => [t.k + '_h', t.k + '_a'])).concat(['jadecrown', 'jade', 'davy']);
 // 1.5c (TestFlight 3): the chest badge is painted INTO the sprite at bake time, by uni id (no colour detection - the device's
 // colour read-back + online lighting broke the old overlay). Tier art = rk15/<tier>_mini.png (5x6 whole sprite pixels).
 const BG = {}; const tierK = key => { const k = K[key]; if (!k || !k.tier || key === 'jade') return null; return R.tierOf(k.tier).k; };
 R.TIERS.forEach(t => { try { const im = R.img(t.n, 1, 'mini'); const load = () => { try { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data, g = []; for (let r = 0; r < c.height; r++) { const row = []; for (let q = 0; q < c.width; q++) { const i = (r * c.width + q) * 4; row.push(d[i + 3] > 100 ? 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')' : null); } g.push(row); } BG[t.k] = g; } catch (e) {} }; if (im.complete && im.naturalWidth) load(); else im.addEventListener('load', load, { once: true }); } catch (e) {} });
 const JCP = { J: '#1fbf5f', L: '#3fe081', l: '#7dffb0', f: '#f0fff6', D: '#0c6a33', v: '#d9e6ee', a: '#a9b2b8', W: '#f4f4f4' };
 const ONE = ['.oyo.', 'oyyo.', '.oyo.', '.oyo.', '.oyo.', 'oyyyo'].map(r => r.split('').map(c => c === 'y' ? '#ffd23a' : c === 'o' ? '#3a2400' : null)); // the gold 1 from jcFront
 const ANC = ['..y..', '.yyy.', '..y..', 'y.y.y', '.yyy.', '..y..'].map(r => r.split('').map(c => c === 'y' ? '#ffd23a' : null));
 const noBake = () => !!Wn.__rl_no595chest;
 const kitOf = key => { const k = K[key]; if (!k) return null; const o = { jersey: k.jersey, trim: k.trim, helm: k.helm, rk15: key };
  if (key === 'davy') o.g27 = 'rk15davy'; else if (key === 'jadecrown' && !Wn.__rl_no600jc) o.g27 = 'rk15jc'; else if (key === 'jade' && !Wn.__rl_no600jade) o.g27 = 'rk15jd'; /* 1.5 B65: plain JADE = the Jade Crown look without crown + gold 1 (mockup jFront / jSide) */ else { const tk = tierK(key); if (tk && !noBake()) o.g27 = 'rk15c:' + tk + (BG[tk] ? '' : '~'); }
  return o; };
 // where the badge sits in a frame: 2 rows under the top of the jersey, centred on it (same spot the old overlay used)
 const chestA = new WeakMap;
 function chestAt(rows) {
  if (!rows || typeof rows !== 'object') return null; let a = chestA.get(rows); if (a !== undefined) return a; a = null;
  const at = (r, q) => rows[r][q];
  let r0 = -1; for (let r = 0; r < rows.length && r0 < 0; r++) for (let q = 0; q < rows[r].length; q++) if (at(r, q) === 'J') { r0 = r; break; }
  if (r0 >= 0) { let mn = 99, mx = -1; for (let r = r0; r <= r0 + 1 && r < rows.length; r++) for (let q = 0; q < rows[r].length; q++) if (at(r, q) === 'J') { mn = Math.min(mn, q); mx = Math.max(mx, q); } a = { x: Math.round((mn + mx) / 2) - 2, y: r0 + 2 }; }
  chestA.set(rows, a); return a;
 }
 const onShirt = ch => ch === 'J' || ch === 'j' || ch === 'T' || ch === 't';
 const FRONT597 = n => Wn.__rl_no597front || n == null || /^(d8S_|bench_|lobby_|coach_)/.test(String(n)); // 1.5e (Charlie): the badge is on the FRONT only - side views get none, back views get the number
 function badgePx(g, ch, q, r, rows, name) { if (!g || !onShirt(ch) || !FRONT597(name)) return null; const A = chestAt(rows); if (!A) return null; const gy = r - A.y, gx = q - A.x; return gy >= 0 && gy < g.length && gx >= 0 && gx < g[0].length ? g[gy][gx] : null; }
 // DAVY JONES on every body + pose (field, long pole, goalie, faceoff, lobby, cards): a per-pixel look from the approved art
 // (djF / djS / djR palette): tattered sea-green coat, gold trim, black tricorn with a gold rim, chain belt, one glowing
 // green eye + an eye patch (on the cage, never the face), fading boots. Skin / face / hands are NEVER touched, so ghost
 // (green), skeleton or any other skin keeps its own colour.
 const DJP = { coat: '#1d5c49', coatL: '#256d55', coatD: '#0e362a', hat: '#141414', hatD: '#0c0e0d', gold: '#c9a227', goldD: '#8a6a12', chain: '#889099', chainD: '#4a5058', glow: '#3dff8a', patch: '#05080b' };
 const djRows = new WeakMap();
 function djInfo(rows) {
  let o = djRows.get(rows); if (o) return o; o = { belt: -1, eyeG: null, eyeP: null };
  const str = r => typeof r === 'string' ? r : r.join('');
  let jr0 = -1; for (let r = 0; r < rows.length; r++) { const t = str(rows[r]); if (jr0 < 0 && /J/.test(t)) jr0 = r; if (jr0 >= 0 && r > jr0 + 1 && /j{4,}/.test(t)) { o.belt = r; break; } }
  for (let r = 0; r < rows.length; r++) { const t = str(rows[r]), cs = []; for (let q = 0; q < t.length; q++) if (t[q] === 'c') cs.push(q); if (cs.length) { o.eyeG = [cs[Math.min(cs.length - 1, Math.floor(cs.length * .65))], r]; if (cs.length > 1) o.eyeP = [cs[Math.floor(cs.length * .25)], r]; break; } }
  djRows.set(rows, o); return o;
 }
 try {
  if (typeof RL12 !== 'undefined') { const g0 = RL12.g27;
   RL12.g27 = function (kit, ch, q, r, rows) {
    if (kit && typeof kit.g27 === 'string' && kit.g27.indexOf('rk15c:') === 0) { try { return badgePx(BG[kit.g27.slice(6).replace('~', '')], ch, q, r, rows, arguments[5]); } catch (e) { return null; } }
    if (kit && (kit.g27 === 'rk15jc' || kit.g27 === 'rk15jd') && !off()) { // 1.5f JADE CROWN on the field (every body + pose): the approved jcFront look per pixel - emerald facets, white bands, white cleats, gold 1 on the chest (front only), silver crown (v590stick). Skin never touched.
     try {
      const b = kit.g27 === 'rk15jc' ? badgePx(ONE, ch, q, r, rows, arguments[5]) : null; if (b) return b;
      const f = (q * 3 + r * 5) % 7;
      if (ch === 'J') return f === 0 ? JCP.l : f === 1 ? JCP.D : f === 3 ? JCP.f : f === 5 ? JCP.L : JCP.J;
      if (ch === 'j') return f === 2 ? JCP.J : JCP.D;
      if (ch === 'H') return f === 0 ? JCP.l : f === 2 ? JCP.f : f === 4 ? JCP.J : JCP.L;
      if (ch === 'h') return JCP.J;
      if (ch === 'T') return JCP.v; if (ch === 't') return JCP.a; if (ch === 'C') return JCP.v; if (ch === 'G') return JCP.v;
      if (ch === 'K') return JCP.W; if (ch === 'k') return JCP.a;
     } catch (e) {}
     return null;
    }
    if (kit && kit.g27 === 'rk15davy' && !off()) {
     try {
      if (!noBake()) { const b = badgePx(ANC, ch, q, r, rows, arguments[5]); if (b) return b; } // the gold anchor, painted in
      const I = rows ? djInfo(rows) : { belt: -1 };
      if (ch === 'J') return (q * 7 + r * 13) % 11 === 0 ? DJP.coatL : (q * 5 + r * 3) % 13 === 0 ? DJP.coatD : DJP.coat;
      if (ch === 'j') return r === I.belt ? ((q % 2) ? DJP.chain : DJP.chainD) : DJP.coatD;
      if (ch === 'T') return DJP.gold; if (ch === 't') return DJP.goldD;
      if (ch === 'H') return DJP.hat; if (ch === 'h') return Wn.__rl_no597davy ? DJP.hatD : DJP.gold; if (ch === 'w') return Wn.__rl_no597davy ? DJP.gold : '#e8e2cc'; /* 1.5d (mockup): gold brim tips + cream skull band */
      if (!Wn.__rl_no597davy) { if (ch === 'C') return DJP.gold; if (ch === 'G') return DJP.coatD; if (ch === 'g') return DJP.hatD; if (ch === 'W') return '#eef6f0'; if (ch === 'K') return '#0c0e0d'; } /* gold collar, dark cuffs, white boot tops, black boots */
      if (ch === 'K') return 'rgba(125,255,176,.45)'; if (ch === 'W') return 'rgba(29,92,73,.6)';
      if (ch === 'c' && I.eyeG && q === I.eyeG[0] && r === I.eyeG[1]) return DJP.glow;
      if (ch === 'c' && I.eyeP && q === I.eyeP[0] && r === I.eyeP[1]) return DJP.patch;
     } catch (e) {}
     return null;
    }
    return typeof g0 === 'function' ? g0.apply(this, arguments) : null;
   }; }
 } catch (e) {}
 // chest stamps (5x6 badge minis, whole sprite pixels)
 const ANCHOR = (() => { const c = document.createElement('canvas'); c.width = 5; c.height = 6; const x = c.getContext('2d'); const P = ['..y..', '.yyy.', '..y..', 'y.y.y', '.yyy.', '..y..']; P.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === 'y') { x.fillStyle = '#ffd23a'; x.fillRect(i, j, 1, 1); } }); return c; })();
 const chest = {};
 ORDER.forEach(key => { const k = K[key]; if (key === 'davy') chest[k.jersey] = { img: ANCHOR }; /* gold anchor on the chest; the body keeps the player's own frame + skin */ else if (key === 'jade') chest[k.jersey] = null; else chest[k.jersey.toLowerCase()] = { img: R.img(k.tier === 'JADE KING' ? 'JADE KING' : k.tier, 1, 'chest'), half: 1, crown: !!k.crown }; });
 const near = {};
 function chestNear(hex) { // exact key, else the closest Ranked Uni jersey within a few steps (iPhone WebKit canvas colour read-back is not always exact)
  hex = String(hex).toLowerCase(); if (chest[hex] !== undefined) return chest[hex] || null; if (near[hex] !== undefined) return near[hex];
  const v = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)); let best = null, bd = 13; const a = v(hex);
  for (const k in chest) { if (!chest[k]) continue; const b = v(k), dd = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]); if (dd < bd) { bd = dd; best = chest[k]; } }
  return (near[hex] = best);
 }
 const best = () => { let b = Math.max(S.best == null ? -1 : S.best | 0, R.bestIx ? R.bestIx() : -1); const m = R.mine(); if (m.fresh) b = Math.max(b, 0); if (b > (S.best == null ? -1 : S.best | 0)) { S.best = b; save(); } return b; }; // never shrinks
 function owned(key) {
  const k = K[key]; if (!k) return false;
  if (key === 'jadecrown') return !!R.mine().jk;
  if (key === 'jade') return !!(S.jade || R.mine().jk);
  if (key === 'davy') return !!(S.davy || R.mine().lk1);
  const ix = R.TIERS.findIndex(t => t.n === k.tier); return ix >= 0 && ix <= best();
 }
 const how = key => key === 'jadecrown' ? '#1 PLAYER ONLY' : key === 'jade' ? 'HIT #1 ONCE' : key === 'davy' ? '#1 LOCKER ONCE' : 'REACH ' + K[key].tier + (Wn.__rl_no600rklock ? '' : ' I');
 const base = tid => { try { return U.base ? U.base(tid) : tid; } catch (e) { return tid; } };
 const llTid = () => { try { return Wn.RK15LL && RK15LL.store && RK15LL.store.tid || null; } catch (e) { return null; } };
 const remote = {}, remoteK = {}; // remoteK: opponent / public-profile team variant ('k:N' in the profile's existing rku field)
 // 1.5b (Charlie): Ranked Unis only on CARD TEAMS, in online matches and friend games - never on regular / season / pro teams offline
 const isCard = tid => { try { const t = SZ_REG[tid]; return !!(t && (t.ct33 || t.rk15remote) && !t.rk15bot); } catch (e) { return false; } };
 const onlineNow = () => { try { return !!(Wn.RLNET && (RLNET.inGame || (RLNET.code && /^on/.test(typeof screen !== 'undefined' ? screen : '')))) || !!(typeof game !== 'undefined' && game && game.online); } catch (e) { return false; } };
 const mayWear = (tid, online) => isCard(tid) || !!online || onlineNow();
 const WHY = 'RANKED UNIS: CARD TEAMS, ONLINE + FRIEND GAMES ONLY';
 function wornKey(tid, online) {
  if (!tid || off()) return null;
  if (remote[tid] === undefined && !mayWear(tid, online)) return null;
  if (remote[tid] !== undefined) return remote[tid] && K[remote[tid]] ? remote[tid] : null;
  // 1.5 B77 (Charlie: 'DAVY JONES on, the match put me in GALAXY'): online the card team plays under its v331 alias id
  // (SZ1xxx), so the uni worn on the card team (saved under its own id) was not found -> the uni set's other variant showed.
  if (S.t[tid] === undefined && !Wn.__rl_no77uni) { try { const m = JSON.parse(localStorage.getItem('rl_bl331_alias') || localStorage.getItem('bl331_alias') || 'null') || (Wn.LS && LS.get('bl331_alias', null)) || {}; const ct = Object.keys(m).find(c => m[c] === tid); if (ct && S.t[ct] !== undefined) tid = ct; } catch (e) {} }
  let k = S.t[tid];
  if (k === 'off') return null;
  // 1.5f (Jonny H1): a team wearing THE WHALE / THE CROWN wears no ranked uni - not the saved one, not the Locker League
  // default. Picking a ranked uni turns the fit off (pickUni / picker), so the last choice always wins. Kill: __rl_no598fitwin
  try { if (!Wn.__rl_no598fitwin && Wn.V446 && V446.wears && V446.wears(tid)) return null; } catch (e) {}
  if (!k && tid === llTid() && R.real && R.real()) { const m = R.mine(); k = m.jk ? 'jadecrown' : R.tierOf(m.tier).k + '_h'; }
  return k && K[k] && owned(k) ? k : null;
 }
 function wear(tid, key) {
  if (!tid) return; if (key && !mayWear(tid)) { try { V17.toast && V17.toast(WHY, '#ffb14d'); } catch (e) {} return; } const b = tid; /* 1.5c: per exact team - never shared through a base uniform set */
  if (!key) S.t[b] = 'off'; else { S.t[b] = key; try { if (Wn.V446 && V446.wears(tid)) V446.set(tid, false); } catch (e) {} }
  save();
  try { if (typeof game !== "undefined" && game && screen === 'pregame' && game.user === tid) game.uk = key ? Object.assign(kitOf(key), { k21: game.uk && game.uk.k21 }) : U.kitOf(tid, U.savedK(tid)); } catch (e) {}
  try { if (typeof screen !== 'undefined' && screen === 'locker17' && V17.toast) V17.toast(key ? 'WEARING ' + K[key].nm : 'TEAM UNIFORM ON', '#7dff7a'); } catch (e) {} // no canvas tag over the lobby's STICK slot
 }
 // keep "best ever" + jade/davy flags in step with the server rank
 function sync() { const m = R.mine(); if (m.fresh) return; const ix = R.TIERS.findIndex(t => t.n === m.tier); /* v2: tier unis only from the tier actually reached */ let ch = false; if (ix > (S.best | 0)) { S.best = ix; ch = true; } if (m.jk && !S.jade) { S.jade = 1; ch = true; } if (m.lk1 && !S.davy) { S.davy = 1; ch = true; } if (ch) save(); }
 setInterval(() => { try { sync(); } catch (e) {} }, 3e3);
 Wn.RK15U = { K: K, ORDER: ORDER, how: key => K[key] ? how(key) : '', icon: key => iconUrl(key), kitFor: (key, away) => kitOf(K[key] ? key : key + (away ? '_a' : '_h')), chestFor: hex => off() ? null : chestNear(hex), owned: owned, wornKey: wornKey, wear: wear, sync: sync,
  wornName: tid => { const k = wornKey(tid); return k ? K[k].nm.replace(/ HOME$| AWAY$/, '') + (K[k].tier && !/JADE|DAVY/.test(K[k].nm) ? ' RANKED UNI' : '') : ''; },
  chestForKey: key => { const k = K[key]; return k ? chest[k.jersey.toLowerCase()] || null : null; }, baked: () => !noBake(),
  setRemote: (tid, key) => { remote[tid] = key && K[key] ? key : null; const m = /^k:(\d{1,2})$/.exec(key || ''); if (m) remoteK[tid] = +m[1]; else delete remoteK[tid]; const f = /^fit:(whale|crown)$/.exec(key || ''); if (f && !Wn.__rl_no600fitpub) remoteFit[tid] = f[1]; else delete remoteFit[tid]; }, remoteK: remoteK, pubKey: tid => { const w = wornKey(tid, true); if (w) return w; try { if (!Wn.__rl_no600fitpub && Wn.V446 && V446.wears(tid) && Wn.V445 && V445.pick && V445.pick()) return 'fit:' + V445.pick(); } catch (e) {} /* 1.5f: the Whale / Crown is the shown uni (same rku field; older apps read it as no ranked uni) */ try { return 'k:' + (U.savedK(tid) | 0); } catch (e) { return null; } }, mayWear: mayWear, isCard: isCard, WHY: WHY, kitOf: kitOf };
 // ---- put the kit on: lobby heroes + games ----
 const hk0 = U.heroKit;
 U.heroKit = function (side, tid) { const k = hk0.apply(this, arguments); try { if (typeof screen !== 'undefined' && screen === 'pregame' && typeof game !== 'undefined' && game && game.uk) return k; /* pregame: game.uk / game.ok are the truth, per side */ if (side === 1 && typeof screen !== 'undefined' && screen === 'onLobby' && Wn.RLNET && RLNET.lobby && RLNET.lobby.state) { const st = RLNET.lobby.state, d = st[(RLNET.side === 'h' ? 'g' : 'h') + 'szn']; return d && d.rk15u && K[d.rk15u] ? kitOf(d.rk15u) : d && (d.rk15fit === 'whale' || d.rk15fit === 'crown') && k ? Object.assign({}, k, { fit45: d.rk15fit }) : k; } /* 1.5c: the online lobby shows the uni the other phone sent */ const w = wornKey(tid); if (w) return kitOf(w); if (remoteFit[tid] && k && !(typeof screen !== 'undefined' && screen === 'pregame')) return Object.assign({}, k, { fit45: remoteFit[tid] }); if (remoteK[tid] != null && !off() && !Wn.__rl_no591uni && U.okK(tid, remoteK[tid]) && !(typeof screen !== 'undefined' && screen === 'pregame')) { const kk = U.kitOf(tid, remoteK[tid]); kk.k21 = remoteK[tid]; return kk; } } catch (e) {} return k; };
 const remoteFit = {};
 const gk0 = U.gameKits;
 U.gameKits = function (user, opp, userHome, mode, meta) {
  const r = gk0.apply(this, arguments);
  try {
   if (off() || !Array.isArray(r)) return r;
   if (meta && meta.online && Wn.RLNET && RLNET.lobby && RLNET.lobby.state) { const st = RLNET.lobby.state, op = RLNET.side === 'h' ? 'g' : 'h', d = st[op + 'szn']; remote[opp] = d && d.rk15u && K[d.rk15u] ? d.rk15u : null; }
   const onl = !!(meta && meta.online), a = wornKey(user, onl), b = remote[opp] !== undefined ? wornKey(opp, onl) : null; // 1.5c: the opponent only ever wears what the other phone sent
   if (a) r[0] = Object.assign(kitOf(a), { k21: r[0] && r[0].k21 });
   if (b) r[1] = Object.assign(kitOf(b), { k21: r[1] && r[1].k21 });
   if (onl && !Wn.__rl_no595fit) { // 1.5c: Crown / Whale online too (own: v446's choice; theirs: szn.rk15fit, the same existing lobby object)
    const w = Wn.V445 && V445.pick && V445.pick(); if (!a && w && Wn.V446 && V446.wears(user) && r[0] && !r[0].fit45) r[0] = Object.assign({}, r[0], { fit45: w });
    try { const st = RLNET.lobby.state, d = st[(RLNET.side === 'h' ? 'g' : 'h') + 'szn'], f = d && d.rk15fit; if (!b && (f === 'whale' || f === 'crown') && r[1]) r[1] = Object.assign({}, r[1], { fit45: f }); } catch (e) {}
   }
  } catch (e) {}
  return r;
 };
 // ---- uniform arrow: never lands on The Whale / The Crown (registered first = wins over v446's arrows) ----
 const dt0 = U.drawToggle;
 if (typeof dt0 === 'function') U.drawToggle = function (i, tid, axl, axr, ay, live) {
  try {
   if (!off() && live && !i && tid && typeof hit === 'function') {
    const p = Wn.__rl_no281uni ? 3 : 0;
    const step = d => { try { if (Wn.V446 && V446.wears(tid)) V446.set(tid, false); if (S.t[tid] && S.t[tid] !== 'off') { S.t[tid] = 'off'; save(); } U.step(0, tid, d); } catch (e) {} };
    hit('UNI L PREV', axl - 3, ay - p, 24, 18 + p, () => step(-1), 'UNI L PREV');
    hit('UNI L NEXT', axr - 3, ay - p, 24, 18 + p, () => step(1), 'UNI L NEXT');
   }
  } catch (e) {}
  const r = dt0.apply(this, arguments);
  try { if (!i && typeof g !== 'undefined' && !(Wn.RK15LL && RK15LL.__pv) && (screen === 'menu' || screen === 'gear17')) U.__band597 = { x0: 0, y0: 0, x1: (typeof L !== 'undefined' ? L : axr + 40), y1: ay + 19, m: g.getTransform(), t: performance.now() }; } catch (e) {} /* 1.5d: the plate band (team + uni name) for STICK590.heroOver */
  try { const w = wornKey(tid); if (r && w && !i) { r.txt = K[w].nm; r.locked = false; } } catch (e) {}
  try { if (r && !i && !Wn.__rl_no597fit && !wornKey(tid) && Wn.V446 && V446.wears(tid) && Wn.V445 && V445.pick && V445.pick()) { r.txt = V445.pick() === 'crown' ? 'THE CROWN' : 'THE WHALE'; r.locked = false; } } catch (e) {} // 1.5e: the plate said BASIC under a Whale
  return r;
 };
 // ---- locker tiles: UNIFORMS > N/A, under WHALE / CROWN ----
 const icons = {};
 function iconUrl(key) {
  if (icons[key]) return icons[key];
  const k = K[key], g2 = []; for (let y = 0; y < 20; y++) g2.push(new Array(20).fill(null));
  const Rr = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g2[y][x] = c; };
  Rr(7, 2, 12, 3, k.helm); Rr(6, 4, 14, 4, k.helm); Rr(2, 7, 17, 9, k.jersey); Rr(5, 7, 14, 13, k.jersey); [7, 8, 9].forEach(y => { g2[y][2] = k.trim; g2[y][17] = k.trim; }); Rr(8, 7, 11, 7, k.trim); Rr(5, 14, 14, 16, k.helm === '#e8eef2' ? k.trim : k.helm); g2[16][9] = null; g2[16][10] = null;
  if (k.crown) { Rr(7, 0, 12, 1, '#d9e2e8'); g2[0][8] = g2[0][10] = null; g2[1][9] = '#3dff8a'; }
  const jd6 = key === 'jade' && !Wn.__rl_no600jade, jc6 = key === 'jadecrown' && !Wn.__rl_no600jcicon || jd6; // 1.5 B65: plain Jade = same icon, no crown spikes, no gold 1 // 1.5f B64: Jade Crown in the same jersey-icon format - emerald facets, white bands, crown spikes, gold 1
  if (jc6) {
   const F = (x, y, a) => { const f = (x * 3 + y * 5) % 7; return f === 0 ? '#7dffb0' : f === 1 ? '#0c6a33' : f === 3 ? '#f0fff6' : a; };
   for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) { const c = g2[y][x]; if (!c) continue; if (y <= 4) g2[y][x] = (x + y) % 2 ? '#3fe081' : '#7dffb0'; else if (y <= 13) g2[y][x] = F(x, y, '#1fbf5f'); else g2[y][x] = F(x, y + 1, '#1a9a4c'); }
   [7, 8, 9].forEach(y => { g2[y][2] = '#e6eef4'; g2[y][17] = '#e6eef4'; }); Rr(8, 7, 11, 7, '#e6eef4'); Rr(5, 13, 14, 13, '#e6eef4'); // cuffs, collar, belt
   if (!jd6) {
   Rr(7, 1, 12, 1, '#e6eef4'); g2[0][7] = g2[0][9] = g2[0][11] = '#e6eef4'; g2[0][8] = g2[0][10] = g2[0][12] = null; g2[1][9] = '#3dff8a'; g2[1][11] = '#3dff8a'; // crown spikes + gems
   [[10, 8], [9, 9], [10, 9], [10, 10], [10, 11], [9, 12], [10, 12], [11, 12]].forEach(([x, y]) => { g2[y][x] = '#ffd23a'; }); [[9, 8], [8, 9], [9, 10], [9, 11], [8, 12]].forEach(([x, y]) => { g2[y][x] = '#3a2400'; }); // the gold 1
   }
  }
  const c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d');
  for (let y = 0; y < 20; y++) for (let i = 0; i < 20; i++) { if (g2[y][i]) { x.fillStyle = g2[y][i]; x.fillRect(i, y, 1, 1); continue; } if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const yy = y + dy, xx = i + dx; return yy >= 0 && yy < 20 && xx >= 0 && xx < 20 && g2[yy][xx]; })) { x.fillStyle = '#000'; x.fillRect(i, y, 1, 1); } }
  const ch = jc6 ? null : chest[k.jersey.toLowerCase()]; if (ch && ch.img && (ch.img.complete || ch.img.tagName === 'CANVAS')) { try { const hw = ch.half ? .5 : 1; x.drawImage(ch.img, 7, 8, (ch.img.naturalWidth || ch.img.width) * hw, (ch.img.naturalHeight || ch.img.height) * hw); } catch (e) {} } else if (ch && ch.img) { ch.img.addEventListener('load', () => { delete icons[key]; }, { once: true }); }
  return (icons[key] = c.toDataURL());
 }
 const teamNow = () => { try { if (Wn.V524 && V524.team) return V524.team(); } catch (e) {} try { return llTid() || (typeof season !== 'undefined' && season && season.team) || JSON.parse(localStorage.getItem('rl_qteam16') || 'null'); } catch (e) { return null; } };
 function tile(key) {
  const k = K[key], own = owned(key), tid = teamNow(), on = own && tid && wornKey(tid) === key;
  return '<button type="button" class="c17 uni17 rk15u' + (own ? '' : ' lk') + (on ? ' wr17' : '') + '" data-a="rk15eq" data-v="' + key + '" aria-label="' + k.nm + (own ? on ? ' (WEARING)' : '' : ' (LOCKED)') + '"><div class="art"><img src="' + iconUrl(key) + '" alt="">' + (own || Wn.__rl_no600rklock ? '' : '<i class="rk600lock"></i>') + '</div><div class="nm">' + k.nm + '</div>' +
   (on ? '<div class="rr">WEARING</div>' : own ? '<div class="rr"><span class="rk15eqb">EQUIP</span></div>' : '<div class="rr">LOCKED</div><small class="wh17">' + how(key) + '</small>') + '</button>';
 }
 function block() {
  const n = ORDER.filter(owned).length;
  return '<div class="sec17 uni2319 rk15usec"><div class="sh17">RANKED UNI <span>' + n + ' / ' + ORDER.length + '</span></div><div class="det17" style="margin:2px 0 4px">FREE. REACH A TIER = ITS HOME + AWAY, KEPT FOREVER (EVEN IF YOU DROP). ONLY JADE CROWN IS WHILE YOU ARE #1. JADE = HIT #1 ONCE. DAVY JONES = #1 LOCKER ONCE.</div><div class="grid17">' + ORDER.map(tile).join('') + '</div></div>';
 }
 const css = document.createElement('style');
 css.textContent = '.big77{align-items:center!important;justify-content:center!important}.big77>.hd .tt{font-size:22px!important;color:#ffe14d!important;letter-spacing:1px}.big77 .grid17 .c17{transform:scale(1.25);margin:10px!important}.big77 .sec{font-size:14px!important}' + '#panel .rk15u .rk15eqb{display:inline-block;background:#ffd23a;color:#0b1a20;padding:2px 8px;box-shadow:0 2px 0 #7a5a00}#panel .rk15u .art img{image-rendering:pixelated}' + (Wn.__rl_no600rklock ? '' : '#panel .rk15u.lk .art{position:relative}#panel .rk15u.lk .art img{filter:brightness(0);opacity:.92}#panel .rk15u.lk .art .rk600lock{position:absolute;left:50%;top:50%;width:27%;aspect-ratio:9/11;transform:translate(-50%,-38%);background:url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 9 11%22 shape-rendering=%22crispEdges%22%3E%3Cpath d=%22M2 0h5v1h1v4h1v6H0V5h1V1h1z%22 fill=%22%23000%22/%3E%3Cpath d=%22M3 1h3v1h1v3H6V2H3v3H2V2h1z%22 fill=%22%23c9d6d9%22/%3E%3Cpath d=%22M1 6h7v4H1z%22 fill=%22%23ffd23a%22/%3E%3Cpath d=%22M4 7h1v2H4z%22 fill=%22%23000%22/%3E%3C/svg%3E") center/contain no-repeat;image-rendering:pixelated}#panel .rk15u.lk .wh17{color:#ffd23a}');
 document.head.appendChild(css);
 const naOn = root => { const c = root && root.querySelector('[data-a="v17unig"][data-v="na"]'); return !!(c && c.classList.contains('on')); };
 function ensure(root) {
  if (off() || !root || !naOn(root)) return false;
  const list = root.querySelector('#lockList'); if (!list || list.querySelector('.rk15usec')) return false;
  const tp = document.createElement('template'); tp.innerHTML = block();
  const after = list.querySelector('.v524sec');
  if (after && after.nextSibling) list.insertBefore(tp.content, after.nextSibling); else if (after) list.appendChild(tp.content); else list.insertBefore(tp.content, list.firstChild);
  return true;
 }
 function wrapLocker() {
  const cur = PANEL_RENDER.locker17; if (typeof cur !== 'function' || cur.__rk15u) return;
  const f = function () { const h = cur.apply(this, arguments); if (off() || typeof h !== 'string' || h.indexOf('lockList') < 0) return h; try { const tp = document.createElement('template'); tp.innerHTML = h; if (ensure(tp.content)) return tp.innerHTML; } catch (e) {} return h; };
  f.__rk15u = 1; PANEL_RENDER.locker17 = f;
 }
 setTimeout(wrapLocker, 60); if (document.readyState === 'complete') setTimeout(wrapLocker, 120); else Wn.addEventListener('load', () => setTimeout(wrapLocker, 120));
 setInterval(() => { try { if (screen === 'locker17') { wrapLocker(); const p = document.getElementById('panel'); if (p) ensure(p); } } catch (e) {} }, 500);
 PANEL_ACT.rk15eq = v => { if (!K[v] || !owned(v)) { try { V17.toast && V17.toast(K[v] ? how(v) + ' TO UNLOCK' : '', '#ffb14d'); } catch (e) {} return PANEL_KEEP; } const tids = [teamNow(), llTid()].filter((x, i, a) => x && a.indexOf(x) === i && isCard(x)); if (!tids.length) { try { V17.toast && V17.toast(WHY, '#ffb14d'); } catch (e) {} return PANEL_KEEP; } const on = tids[0] && wornKey(tids[0]) === v; tids.forEach(t => wear(t, on ? null : v)); };
 // ---- pre-match: BACK (every mode) + UNIFORMS (top left, new button style). UNIFORMS opens locker-style uniform tiles
 // with ONLY what this match allows: the team's own uniforms, The Whale / The Crown (offline, if owned), Ranked Unis
 // (card teams / online only). The picker is a DOM layer over the game, so START / "tap anywhere" can't fire under it.
 let pickEl = null, pickG = null;
 const css2 = document.createElement('style');
 css2.textContent = '#rk15pick{position:fixed;inset:0;z-index:30;background:rgba(5,8,11,.86);display:none;flex-direction:column;align-items:center;padding:10px 12px;box-sizing:border-box;font:bold 11px ui-monospace,Menlo,Consolas,monospace;color:#e8f4f6;text-transform:uppercase}#rk15pick .hd{display:flex;align-items:center;gap:10px;width:100%;max-width:760px;margin-bottom:6px}#rk15pick .tt{flex:1;color:#ffe14d;font-size:14px}#rk15pick .grid17{max-width:760px;width:100%;overflow:auto}#rk15pick .x{background:#ff9a3d;color:#0b1a20;border:2px solid #0b1a20;border-radius:0;padding:6px 12px;font:inherit;box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000}#rk15pick .sec{width:100%;max-width:760px;color:#8fe3f0;margin:4px 0 2px;font-size:10px}';
 document.head.appendChild(css2);
 let cssDone = false;
 function copyCss() { if (cssDone) return; cssDone = true; try { const out = []; for (const sh of document.styleSheets) { let rr; try { rr = sh.cssRules; } catch (e) { continue; } for (const r of rr) if (r.selectorText && r.selectorText.indexOf('#panel') >= 0 && /c17|uni17|grid17|wr17|\.lk\b|\.art|\.nm|\.rr/.test(r.selectorText)) out.push(r.cssText.split('#panel').join('#rk15pick')); } const st = document.createElement('style'); st.textContent = out.join('\n'); document.head.appendChild(st); } catch (e) {} }
 function closePick() { if (pickEl) pickEl.style.display = 'none'; pickG = null; pickCb = null; }
 function fitIcon(w, helm) { // same uniform-tile art as the N/A WHALE / CROWN tiles
  const FC = { whale: { j: '#ff8cc6', t: '#1d2a5e', s: '#d2bc8a' }, crown: { j: '#a6d8f7', t: '#4a6f8e', s: '#d2bc8a' } }[w], c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d');
  const R2 = (x0, y0, x1, y1, col) => { x.fillStyle = col; x.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1); };
  if (!Wn.__rl_no600fiticon) { // 1.5f B64: the same jersey-icon format as every other uni tile (black outline, cuffs, collar, shorts gap)
   const g2 = []; for (let y = 0; y < 20; y++) g2.push(new Array(20).fill(null)); const Rr = (x0, y0, x1, y1, cc) => { for (let y = y0; y <= y1; y++) for (let q = x0; q <= x1; q++) g2[y][q] = cc; };
   Rr(7, 2, 12, 3, helm || '#1d2a5e'); Rr(6, 4, 14, 4, helm || '#1d2a5e'); Rr(2, 7, 17, 9, FC.j); Rr(5, 7, 14, 13, FC.j); [7, 8, 9].forEach(y => { g2[y][2] = FC.t; g2[y][17] = FC.t; }); Rr(8, 7, 11, 7, FC.t); Rr(5, 14, 14, 16, FC.t); g2[16][9] = g2[16][10] = null;
   if (w === 'crown') { Rr(7, 1, 12, 1, '#ffcc33'); g2[0][7] = g2[0][9] = g2[0][11] = '#ffcc33'; }
   for (let y = 0; y < 20; y++) for (let i = 0; i < 20; i++) { if (g2[y][i]) { x.fillStyle = g2[y][i]; x.fillRect(i, y, 1, 1); continue; } if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const yy = y + dy, xx = i + dx; return yy >= 0 && yy < 20 && xx >= 0 && xx < 20 && g2[yy][xx]; })) { x.fillStyle = '#000'; x.fillRect(i, y, 1, 1); } }
   return c.toDataURL();
  }
  R2(7, 2, 12, 3, helm || '#1d2a5e'); R2(6, 4, 14, 4, helm || '#1d2a5e'); R2(2, 7, 17, 9, FC.j); R2(5, 7, 14, 13, FC.j); R2(8, 7, 11, 7, FC.t); R2(5, 14, 14, 16, FC.s); if (w === 'crown') R2(7, 0, 12, 1, '#ffcc33');
  return c.toDataURL();
 }
 // 1.5c (Charlie): ONE allowed-list for every uniform picker (pregame UNIFORMS, lobby UNIFORM buttons, LL arrows, alternate uni).
 // online = this match is online / a friend game. Returns [{key:'k:N'|'fit'|'r:KEY', nm, img, kit, sec}]
 function allowed(tid, online) {
  const out = []; if (!tid) return out;
  try { for (let k = 0; k < U.nK(tid); k++) if (U.okK(tid, k) && U.has(tid, k)) { const kit = U.kitOf(tid, k); kit.k21 = k; out.push({ key: 'k:' + k, nm: U.styN ? U.styN(tid, k) : 'UNIFORM ' + (k + 1), img: V17.uniIcon17 ? V17.uniIcon17(tid, k) : '', kit: kit, sec: 'TEAM UNIFORMS' }); } } catch (e) {}
  try { const w = Wn.V445 && V445.pick && V445.pick(); if (w) out.push({ key: 'fit', nm: w === 'whale' ? 'THE WHALE' : 'THE CROWN', img: fitIcon(w, (U.kitOf(tid, U.savedK(tid)) || {}).helm), kit: Object.assign({}, U.kitOf(tid, U.savedK(tid)), { fit45: w }), sec: 'WHALE / CROWN' }); } catch (e) {}
  try { if (mayWear(tid, online)) ORDER.filter(owned).forEach(k => out.push({ key: 'r:' + k, nm: K[k].nm, img: iconUrl(k), kit: kitOf(k), sec: 'RANKED UNI' })); } catch (e) {}
  return out;
 }
 // the key of what this team wears right now (for WEARING marks + profile)
 function curKey(tid, G) {
  try { if (G && G.uk) return G.uk.rk15 ? 'r:' + G.uk.rk15 : G.uk.fit45 ? 'fit' : 'k:' + (G.uk.k21 != null ? G.uk.k21 : U.savedK(tid)); } catch (e) {}
  const w = wornKey(tid); if (w) return 'r:' + w;
  try { if (Wn.V446 && V446.wears(tid)) return 'fit'; } catch (e) {}
  return 'k:' + U.savedK(tid);
 }
 const esc2 = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
 function ensurePickEl() {
  copyCss();
  if (pickEl) return;
  pickEl = document.createElement('div'); pickEl.id = 'rk15pick'; document.body.appendChild(pickEl);
  pickEl.addEventListener('click', e => { const b = e.target.closest('[data-u]'); if (e.target.closest('.x')) { const f = pickCb; closePick(); if (f && f.close) f.close(); return; } if (!b || !pickCb) return; e.stopPropagation(); const f = pickCb; closePick(); f.pick(b.getAttribute('data-u')); });
  ['pointerdown', 'touchstart', 'mousedown'].forEach(t => pickEl.addEventListener(t, e => e.stopPropagation(), { passive: true }));
 }
 let pickCb = null;
 // generic tile picker: list = allowed()-style entries; o = { title, cur, pick(key), close(), noClose, note, timer }
 function showList(list, o) {
  ensurePickEl(); pickCb = o;
  const tile = e => '<button type="button" class="c17 uni17' + (e.key === o.cur ? ' wr17' : '') + '" data-u="' + esc2(e.key) + '" aria-label="' + esc2(e.nm) + '"><div class="art"><img alt="" src="' + e.img + '" style="image-rendering:pixelated' + (/davy/.test(e.img) ? ';height:100%;object-fit:contain' : '') + '"></div><div class="nm">' + esc2(e.nm) + '</div><div class="rr">' + (e.key === o.cur ? 'WEARING' : o.sub || 'TAP = WEAR') + '</div></button>';
  const secs = []; list.forEach(e => { let s = secs.find(x => x.n === e.sec); if (!s) secs.push(s = { n: e.sec, h: [] }); s.h.push(tile(e)); });
  pickEl.innerHTML = '<div class="hd"><div class="tt">' + esc2(o.title) + '</div>' + (o.timer ? '<div class="tm" style="color:#ffe14d;font-size:14px"></div>' : '') + (o.noClose ? '' : '<button type="button" class="x">CLOSE</button>') + '</div>' + (o.note ? '<div class="sec" style="color:#ffb14d">' + esc2(o.note) + '</div>' : '') +
   secs.map(s => '<div class="sec">' + esc2(s.n) + '</div><div class="grid17">' + s.h.join('') + '</div>').join('') + (o.foot ? '<div class="sec" style="color:#9fb8c4">' + esc2(o.foot) + '</div>' : '');
  pickEl.style.display = 'flex';
  pickEl.classList.toggle('big77', !!o.big77); // 1.5 B77: the uniform clash picker is big + centred (v591alt)
  return pickEl;
 }
 function openPick(G) {
  const tid = G.user; pickG = G;
  showList(allowed(tid, G.online), { title: 'UNIFORMS - ' + (T(tid) ? T(tid).name.toUpperCase() : ''), cur: curKey(tid, G), pick: key => applyPick(G, key), foot: mayWear(tid, G.online) ? '' : WHY });
 }
 // lobby UNIFORM buttons: same list, saved as the team's choice
 function openFor(tid, online) {
  if (!tid) return false;
  showList(allowed(tid, online), { title: 'UNIFORM - ' + (T(tid) ? T(tid).name.toUpperCase() : ''), cur: curKey(tid), pick: key => applySaved(tid, key, online), foot: mayWear(tid, online) ? '' : WHY });
  return true;
 }
 function applySaved(tid, key, online) {
  try {
   if (key === 'fit') { S.t[tid] = 'off'; save(); V446.set(tid, true); return; }
   if (key.indexOf('r:') === 0) { if (!mayWear(tid, online)) return; S.t[tid] = key.slice(2); try { if (Wn.V446 && V446.wears(tid)) V446.set(tid, false); } catch (e) {} save(); return; }
   S.t[tid] = 'off'; save(); try { if (Wn.V446 && V446.wears(tid)) V446.set(tid, false); } catch (e) {}
   U.save(tid, +key.slice(2));
  } catch (e) {}
  try { if (Wn.RK15LL && RK15LL.pushTeam) RK15LL.pushTeam(true); } catch (e) {}
 }
 function applyPick(G, key) {
  const tid = G.user;
  try {
   if (key === 'fit') { S.t[tid] = 'off'; save(); V446.set(tid, true); G.uk = Object.assign({}, U.kitOf(tid, U.savedK(tid)), { fit45: V445.pick() }); return; }
   if (key.indexOf('r:') === 0) { wear(tid, key.slice(2)); return; }
   const k = +key.slice(2); S.t[tid] = 'off'; save(); try { if (Wn.V446 && V446.wears(tid)) V446.set(tid, false); } catch (e) {}
   const kit = U.kitOf(tid, k); kit.k21 = k; G.uk = kit; U.save(tid, k);
  } catch (e) {}
 }
 const backTo = G => { try { if (G.meta && G.meta.ll15) return () => { closePick(); game = null; Wn.RK15LL && RK15LL.open(); };
  const m = G.mode; return () => { closePick(); try { if (m === 'season') screen = 'season'; else if (m === 'world') screen = 'wgHub'; else screen = 'menu'; game = null; panelDirty(); } catch (e) {} }; } catch (e) { return () => { closePick(); screen = 'menu'; }; } };
 const dp0 = Wn.drawPregame;
 if (typeof dp0 === 'function') Wn.drawPregame = function () {
  const G = typeof game !== 'undefined' ? game : null;
  const started = !G || G.preT >= 50 || !!(G.coin && G.coin.phase && G.coin.phase !== 'idle');
  if (pickG && (started || pickG !== G)) closePick();
  const r = dp0.apply(this, arguments);
  try {
   if (off() || !G || G.online || G.tutorial || started || pickG) return r;
   hit('rk15back', 4, 3, 44, 13, backTo(G), 'rk15back'); R.btn(4, 3, 44, 13, '#c9d6d9', 'BACK');
   hit('rk15unis', 4, 19, 56, 13, () => openPick(G), 'rk15unis'); R.btn(4, 19, 56, 13, '#b48aff', 'UNIFORMS');
  } catch (e) {}
  return r;
 };
 setInterval(() => { try { if (pickG && (typeof screen === 'undefined' || screen !== 'pregame')) closePick(); } catch (e) {} }, 300);
 Wn.RK15U.clearRanked = tid => { if (tid && S.t[tid] !== 'off' && (S.t[tid] || Wn.__rl_no597fit || wornKey(tid))) { S.t[tid] = 'off'; save(); } }; // 1.5e: also the DEFAULT ranked uni (no saved choice) - it kept a g27 kit on, which hides Crown / Whale
 Object.assign(Wn.RK15U, { allowed: allowed, curKey: curKey, openFor: openFor, applySaved: applySaved, showList: showList, closePick: closePick, pickOpen: () => !!(pickEl && pickEl.style.display !== 'none') });
})();
