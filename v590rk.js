/* v590rk.js - 1.5 LOCKER LEAGUE core: rank tiers, badge art, ranked API client, my rank, Live-Ops rows (Bagga Lax 1.5).
 * What: tiers SQUID, FISH, DIRTY (broom badge), GROSS, NASTY, BAGGATWAAN, each I-V (100 rank points per division), then
 *   v2 (1.5d, Charlie: divisions count UP): SQUID I .. BAGGATWAAN V, then the JADE KING tier (earned). The #1 player wears the Jade King uni. New accounts: SQUID I, tied at the bottom.
 * Server: the accounts Worker's additive /api/rk15/* routes (server/baggalax-server accounts-api, migration 0002_ranked15).
 *   The server decides results + rank points. THE ONE PLACE for the client API base: RK15_API below.
 * Fallback: if the routes are not deployed yet (404 / no route / no connection), RK15.down = true and every ranked screen
 *   shows "RANKINGS COMING SOON"; menus, locker and offline play keep working.
 * No existing ids, rl_ keys or net messages are changed. New storage key: rl_rk15 (my last known rank, per phone).
 * Kill switch: window.__rl_no590 = true (all 1.5 online add-ons read it).
 */
(function () {
 'use strict';
 const Wn = window;
 const RK15_API = Wn.RK15_API || '/api/rk15'; // <- client API base (same host rules as acct23: relative /api, the iOS shell rewrites it)
 const off = () => !!(Wn.__rl_no590 || Wn.__rl_v124gb);
 const TIERS = [
  { n: 'SQUID', k: 'squid', L: '#a77bff', M: '#6a3fc4', D: '#4b2a92', X: '#1c0f3a' },
  { n: 'FISH', k: 'fish', L: '#5a9cff', M: '#2a6fd6', D: '#1a4a99', X: '#0b1f3d' },
  { n: 'DIRTY', k: 'dirty', L: '#55c95d', M: '#2f9e3a', D: '#1e6e27', X: '#0a2a0e' },
  { n: 'GROSS', k: 'gross', L: '#c4ca52', M: '#7a7f2a', D: '#55591a', X: '#23250a' },
  { n: 'NASTY', k: 'nasty', L: '#ff5a4a', M: '#b3121e', D: '#6e0a12', X: '#2a0608' },
  { n: 'BAGGATWAAN', k: 'baggatwaan', L: '#ffd23a', M: '#d9a01e', D: '#9a6a0a', X: '#2e1f04' },
  { n: 'JADE KING', k: 'jadeking', L: '#3dff8a', M: '#1fbf5f', D: '#0c6a33', X: '#06301a' }
 ];
 const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
 const tierOf = n => TIERS.find(t => t.n === n) || TIERS[0];
 // RANKED RULES v2 (mirror of the server's RK15_RULES): 30 division steps SQUID I .. BAGGATWAAN V (divisions count UP, I = bottom), then the JADE KING tier.
 // The #1 player (jk) wears the Jade King uni but keeps the tier they earned.
 const ofPts = pts => { const ix = Math.max(0, Math.min(30, Math.floor((+pts || 0) / 100))); if (ix >= 30) return { tier: 'JADE KING', div: 1, ix: 30 }; return { tier: TIERS[Math.floor(ix / 5)].n, div: ix % 5 + 1, ix: ix }; };
 const RULES = { SQUID: { winsPer: 1, lossesPer: 2, botPer: 2, upsetLoss: 1 }, FISH: { winsPer: 1, lossesPer: 2, botPer: 2, upsetLoss: 1 }, DIRTY: { winsPer: 1, lossesPer: 2, botPer: 3, upsetLoss: 1 }, GROSS: { winsPer: 1, lossesPer: 2, botPer: 3, upsetLoss: 1 }, NASTY: { winsPer: 1, lossesPer: 1, botPer: 4, upsetLoss: 1 }, BAGGATWAAN: { winsPer: 2, lossesPer: 1, botPer: 0, upsetLoss: 1 }, 'JADE KING': { winsPer: 0, lossesPer: 1, botPer: 0, upsetLoss: 1 } };
 const ruleOf = tier => RULES[tier] || RULES.SQUID;
 const ruleTxt = tier => { const r = ruleOf(tier); return (r.winsPer === 0 ? 'TOP TIER - HOLD IT' : r.winsPer === 1 ? 'WIN = +1' : r.winsPer + ' WINS = +1') + ' - ' + (r.lossesPer === 1 ? 'LOSS = -1' : r.lossesPer + ' LOSSES = -1') + ' - ' + (r.botPer ? r.botPer + ' CPU WINS = +1' : 'CPU WINS DON\'T COUNT'); };
 const dTxt = d => { d = d | 0; if (!d) return 'NO DIVISION CHANGE'; const a = Math.abs(d), n = Math.floor(a / 100), f = a % 100, fr = f ? (f >= 66 ? '2/3' : f >= 50 ? '1/2' : f >= 33 ? '1/3' : '1/4') : ''; return (d > 0 ? '+' : '-') + (n ? n + (fr ? ' ' + fr : '') : fr) + (n > 1 || (n === 1 && fr) ? ' DIVISIONS' : ' DIVISION'); };
 const lbl = (tier, div) => tier === 'JADE KING' ? 'JADE KING' : tier + ' ' + ROMAN[(div || 1) - 1];
 const url = (tier, div, kind) => { const t = tierOf(tier), jk = t.n === 'JADE KING'; return 'rk15/' + t.k + (kind === 'emblem' ? '' : '_' + (kind === 'chest' ? 'chest' : kind === 'mini' ? 'mini' : (jk ? 1 : div || 1) + (kind === 'shine' ? '_shine' : ''))) + (kind === 'shine' ? '.webp' : '.png'); };
 const IMG = {};
 function img(tier, div, kind) { const u = url(tier, div, kind); let i = IMG[u]; if (!i) { i = IMG[u] = new Image(); i.src = u; } return i; }
 // canvas badge (game pixels): 20x22 (JADE KING 20x26), k = scale
 function drawBadge(x, y, tier, div, k) {
  const i = img(tier, div); k = k || 1;
  if (i.complete && i.naturalWidth) { try { g.imageSmoothingEnabled = false; g.drawImage(i, Math.round(x), Math.round(y), i.naturalWidth * k, i.naturalHeight * k); } catch (e) {} }
  return i;
 }
 const tag = (tier, div, sz) => { const jk = tier === 'JADE KING', k = sz || 1; return '<img class="rk15b" src="' + url(tier, div) + '" alt="' + lbl(tier, div) + '" style="width:' + 20 * k + 'px;height:' + (jk ? 26 : 22) * k + 'px;image-rendering:pixelated;vertical-align:middle;flex:0 0 auto' + (jk ? ';margin-top:-4px' : '') + '">'; };
 // kid-safe name filter (same list as the server)
 const BAD = ['fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut', 'fag', 'nigg', 'nigga', 'retard', 'rape', 'nazi', 'hitler', 'porn', 'sex', 'penis', 'vagina', 'boob', 'tits', 'anal', 'cum', 'jizz', 'kys', 'killyourself', 'asshole', 'bastard', 'damn', 'piss', 'wank', 'twat', 'dildo', 'hoe'];
 const bad = s => { const n = String(s || '').toLowerCase().replace(/[013457$@!]/g, c => ({ '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '$': 's', '@': 'a', '!': 'i' })[c]).replace(/[^a-z]/g, ''); return BAD.some(w => n.includes(w)); };
 const safeName = s => bad(s) ? '*****' : String(s || '').toUpperCase();
 const cname = s => safeName(s).replace(/_/g, '-'); // canvas font has no underscore
 const A = () => { try { return Wn.V23 && V23.A ? V23.A() : {}; } catch (e) { return {}; } };
 const signedIn = () => { try { return !!(Wn.V23 && V23.signedIn && V23.signedIn()); } catch (e) { return false; } };
 const dev = () => { try { return Wn.RLNET && RLNET.dev || localStorage.getItem('rl_dev') || ''; } catch (e) { return ''; } };
 const R = Wn.RK15 = { TIERS, ROMAN, tierOf, ofPts, RULES, ruleOf, ruleTxt, dTxt, lbl, url, img, drawBadge, tag, bad, safeName, cname, signedIn, off, down: false, downWhy: '', me: null, meT: 0, api: RK15_API, log: [] };
 function markDown(why) { R.down = true; R.downWhy = why; R.downT = Date.now(); }
 async function call(path, body, quiet) {
  try {
   const a = A(), b = Object.assign({ dev: dev() }, a.tok ? { tok: a.tok } : {}, body || {});
   const r = await fetch(RK15_API + '/' + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
   let j = null; try { j = await r.json(); } catch (e) { j = null; }
   if (r.status === 404 && !(j && /NO PLAYER/.test(j.error || ''))) { /* old Worker: 'unknown api'; no API host: an HTML 404 */ markDown('not deployed'); return { ok: false, down: true, error: 'RANKINGS COMING SOON' }; }
   if (!j) { if (r.status >= 500 || r.status === 404) markDown('bad answer ' + r.status); return { ok: false, down: R.down, error: 'RANKINGS COMING SOON' }; }
   if (j.ok) { R.down = false; }
   try { if (!Wn.__rl_no597rk) normWalk(j, 0); } catch (e) {}
   if (j && j.auth === false) j.error = 'SIGN IN TO PLAY RANKED';
   return j;
  } catch (e) { markDown('no connection'); return { ok: false, down: true, error: 'NO CONNECTION - RANKINGS COMING SOON' }; }
 }
 R.call = call;
 // 1.5d RANK: ONE source of truth. The server's pts decide the tier + division; the client always turns pts into the label
 // with ofPts (Charlie: divisions count UP - I = bottom of a tier, V = top; v1 Workers already sent div 1 = bottom). The 1.5c client had it the other way, which is how
 // the same 0-pt account read SQUID I in one place and SQUID V in another. Every server answer is normalised here, once.
 function norm(o) {
  if (!o || typeof o !== 'object' || Wn.__rl_no597rk) return o;
  if (o.ranked === false || (o.games === 0 && o.pts == null)) { o.tier = 'SQUID'; o.div = 1; return o; }
  if (o.pts != null && isFinite(+o.pts) && (o.tier != null || o.div != null)) { const t = ofPts(+o.pts); o.tier = t.tier; o.div = t.div; }
  else if (o.tier != null && !(o.div >= 1 && o.div <= 5)) o.div = 1;
  return o;
 }
 function normWalk(o, d) { if (!o || typeof o !== 'object' || d > 6) return; if (Array.isArray(o)) { o.forEach(x => normWalk(x, d + 1)); return; } norm(o); for (const k in o) if (o[k] && typeof o[k] === 'object') normWalk(o[k], d + 1); }
 R.norm = norm; R.normWalk = normWalk;
 R.fmt = o => { o = norm(Object.assign({}, o || {})); return lbl(o.tier || 'SQUID', o.div || 1); }; // the ONE label formatter (find match, lobby, profile, rankings, versus, rank-up, friends)
 // the 1.4 shop / gear panel button look on the canvas: 1px dark border, top gloss, bottom inner shade, hard 2px drop
 R.btn = function (x, y, w, h, bg, label, o) {
  o = o || {};
  rect(x, y + 2, w, h, '#000');
  rect(x, y, w, h, '#0b1a20'); rect(x + 1, y + 1, w - 2, h - 2, bg);
  rect(x + 1, y + 1, w - 2, 1, 'rgba(255,255,255,.55)'); rect(x + 1, y + h - 3, w - 2, 2, 'rgba(0,0,0,.25)');
  if (label != null && !o.noLabel) { const sc = o.sc || (h >= 24 && textW(label, 2) + 8 < w ? 2 : 1); text(label, Math.round(x + w / 2), Math.round(y + (h - 5 * sc) / 2) - (h >= 12 ? 1 : 0), sc, o.fg || '#0b1a20', 'center'); }
 };
 // textMini at the largest pixel cell that really fits (textMini snaps its cell to whole screen pixels: width = len*4*cell - cell)
 R.miniFit = function (s, cx, y, maxW, col, kmax) {
  s = String(s); const rr = typeof RR !== 'undefined' ? RR : 2;
  let c = Math.max(1, Math.round((kmax || .75) * rr));
  while (c > 1 && (s.length * 4 - 1) * c / rr > maxW) c--;
  const cell = c / rr, w = (s.length * 4 - 1) * cell;
  if (w > maxW) { g.save(); g.beginPath(); g.rect(cx - maxW / 2, y - 2, maxW, 5 * cell + 4); g.clip(); try { textMini(s, cx, y, col, cell); } finally { g.restore(); } return maxW; }
  textMini(s, cx, y, col, cell); return w;
 };
 R.miniW = (s, k) => { const rr = typeof RR !== 'undefined' ? RR : 2, cell = Math.max(1, Math.round((k || .75) * rr)) / rr; return (String(s).length * 4 - 1) * cell; };
 // my rank (cached; per phone copy so the menu can show a badge before the server answers)
 try { const s = JSON.parse(localStorage.getItem('rl_rk15') || 'null'); if (s && s.u) R.me = norm(s); } catch (e) {}
 let meBusy = false;
 R.refresh = async function (force) {
  if (off() || !signedIn() || meBusy) return R.me;
  if (!force && Date.now() - R.meT < 6e4) return R.me;
  meBusy = true; R.meT = Date.now();
  try {
   const j = await call('me', {});
   if (j && j.ok) { R.me = j; try { localStorage.setItem('rl_rk15', JSON.stringify({ u: j.u, pts: j.pts, tier: j.tier, div: j.div, jk: j.jk, rank: j.rank, tied: j.tied, total: j.total, lk: j.lk, lkRank: j.lkRank, top10lk: j.top10lk, lk1: j.lk1, best: j.best })); } catch (e) {} }
  } finally { meBusy = false; }
  return R.me;
 };
 // what to show for ME right now (never blank): server answer > last known > new account (SQUID I, tied at the bottom)
 R.mine = function () {
  const a = A(), m = R.me && (!a.u || !R.me.u || String(R.me.u).toLowerCase() === String(a.u).toLowerCase()) ? R.me : null;
  return m ? norm(m) : { u: a.u || 'YOU', pts: 0, tier: 'SQUID', div: 1, jk: false, rank: null, tied: true, total: null, lk: 0, fresh: true };
 };
 R.real = () => !R.down && !!R.me && !R.mine().fresh; // a real server rank (not 'coming soon' / a guess)
 R.mineLbl = () => R.fmt(R.mine());
 R.rankTxt = (m) => { m = m || R.mine(); if (R.down || m.rank == null) return 'RANKINGS COMING SOON'; return (m.tied ? '#' + m.rank.toLocaleString() + ' TIED' : 'RANK ' + m.rank.toLocaleString()) + (m.total ? ' / ' + m.total.toLocaleString() : ''); };
 // highest tier ever reached on this phone/account (Ranked Unis are kept forever)
 R.bestIx = function () {
  let b = -1; const m = R.mine();
  try { const s = JSON.parse(localStorage.getItem('rl_rk15u') || 'null'); if (s && s.best != null) b = s.best | 0; } catch (e) {}
  if (!m.fresh) { const ix = TIERS.findIndex(t => t.n === m.tier); b = Math.max(b, ix); /* v2: being #1 never unlocks tier unis */ if (m.best && m.best.tier) b = Math.max(b, TIERS.findIndex(t => t.n === m.best.tier)); }
  return Math.max(0, b);
 };
 // locker rating (flex only): every owned item counted once, weighted by rarity + every owned player card
 R.lockerRating = function () {
  let n = 0;
  try { const BY = V17.BY, inv = V17.ST().inv || {}; for (const id in inv) if ((inv[id] | 0) > 0 && BY[id]) n += [1, 3, 8, 15][Math.max(0, Math.min(3, BY[id].rar | 0))]; } catch (e) {}
  try { const c = Wn.V22 && V22.ownedIds ? V22.ownedIds() : null; if (c && c.length) n += c.length * 2; } catch (e) {}
  return n;
 };
 // Live-Ops: register the new mode, rewards + run out so they show in the panel
 const LO_ROWS = [
  { id: 'mode_ll15', kind: 'mode', name: 'LOCKER LEAGUE (RANKED ONLINE)', past: false, text: 'Ranked online: FIND MATCH, CPU bot after no player, server-decided rank points, leaderboards.' },
  { id: 'bot_ll15', kind: 'mode', name: 'LOCKER LEAGUE CPU BOTS', past: false, text: 'GOBBLERS, INVADERS, WARFARE, GRAVEYARD, DEEP SEA DOGS, DOGFIGHT, BEACHHEAD, RIPTIDE. Half rank points.' },
  { id: 'rku15', kind: 'item', name: 'RANKED UNI (SQUID - BAGGATWAAN, HOME + AWAY)', price: 0, past: false, section: 'reward', text: 'Reward only. Reach the tier = kept forever.' },
  { id: 'rku15_jadecrown', kind: 'item', name: 'JADE CROWN', price: 0, past: false, section: 'reward', text: 'Reward only. Only while you are the #1 player.' },
  { id: 'rku15_jade', kind: 'item', name: 'JADE', price: 0, past: false, section: 'reward', text: 'Reward only. Hit #1 once = kept forever.' },
  { id: 'rku15_davy', kind: 'item', name: 'DAVY JONES', price: 0, past: false, section: 'reward', text: 'Reward only. #1 locker once = kept forever.' },
  { id: 'run15_dutch', kind: 'item', name: 'THE FLYING DUTCHMAN (RUN OUT)', price: 0, past: false, section: 'reward', text: 'Free run out for everyone.' },
  { id: 'bdg15_top10', kind: 'item', name: 'TOP 10 LOCKER BADGE', price: 0, past: false, section: 'reward', text: 'Reward only. Green locker on the arm while your locker is top 10.' }
 ];
 R.LIVEOPS = LO_ROWS;
 function regLO() {
  try {
   const L = Wn.LIVEOPS; if (!L || typeof L.catalog !== 'function' || L.catalog.__rk15) return;
   const c0 = L.catalog; L.catalog = function () { const out = c0.apply(this, arguments); try { const seen = new Set(out.map(r => r.id)); LO_ROWS.forEach(r => { if (!seen.has(r.id)) out.push(Object.assign({}, r)); }); } catch (e) {} return out; };
   L.catalog.__rk15 = 1;
  } catch (e) {}
 }
 regLO(); setTimeout(regLO, 0);
 // preload the small badges
 TIERS.forEach(t => { for (let d = 1; d <= (t.n === 'JADE KING' ? 1 : 5); d++) img(t.n, d); img(t.n, 1, 'mini'); img(t.n, 1, 'emblem'); });
 // keep my rank fresh while on the menu
 setInterval(() => { try { if (!off() && signedIn() && typeof screen !== 'undefined' && screen === 'menu') R.refresh(); } catch (e) {} }, 5e3);
 setTimeout(() => { try { R.refresh(true); } catch (e) {} }, 2500);
})();
