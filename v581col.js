/* v581col.js - 1.4 EVERY REWARD GOES THROUGH THE LOBBY COLLECT SCREEN (Bagga Lax 1.4, Charlie's Nov 19 list: #8).
 * Bug: Charlie got cards from a game and back in the lobby there was NO collect screen.
 * Cause: the lobby collect screens only show what a source QUEUES (v27claims via V27.queue, V17 chalClaim via
 *   V22.popup, v494 queue, v579 trophy queue). Every reward path that grants and queues works (checked in the
 *   harness: quick-play card drop -> v332 queue -> lobby COLLECT). But some paths grant cards with NO queue at all,
 *   e.g. CAREER title cards (v459car titleCards: 'CAREER NATTY' / 'CAREER PRO TITLE' grantIds, nothing shown), the
 *   career player card ('CAREER'), and any grant whose own banner was a final-screen canvas line (v579 now keeps the
 *   final screen clear). Those cards were added silently.
 * Fix (general, not per path): V22.grantIds and V17.grant are wrapped (outermost). Each grant made outside the
 *   shop / locker panels is remembered for a few seconds together with a snapshot of every collect queue. If no queue
 *   changed and nothing showed it (pack screen, FIRST WIN pack, v332 card queue, chalClaim popup, v27 screen, trophy
 *   reveal queue), the cards / items are queued as one normal v27 COLLECT screen ("NEW CARD!" / "NEW ITEM!"),
 *   so it opens in the lobby like every other reward (v579 keeps it off the final screen, v419c/v27 show it).
 *   Items count only when they come from a game (a game exists) - shop / code / migration grants are left alone.
 *   Plus a watchdog: a v27 collect screen that waits 15 s on an idle lobby with nothing on top is opened directly.
 * Exactly once: nothing here grants anything; the queue id is unique per grant batch; v27 COLLECT only clears it.
 * Storage: none new (uses v27's own rl_v27claims queue). Kill switch: window.__rl_no581col = true.
 */
(function () {
 'use strict';
 const W = window, D = document;
 if (W.__rl_no581col || W.__rl_v124gb || W.V581C) return;
 const V = W.V581C = { err: [], log: [], pend: [] };
 const off = () => !!(W.__rl_no581col || W.__rl_v124gb);
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e).slice(0, 200)); };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const T0 = Date.now(), WAIT = 4000;
 const scr = () => { try { return typeof screen === 'string' ? screen : ''; } catch (e) { return ''; } };
 const G = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 function panelOpen() {
  try { const p = D.getElementById('panel'); return !!(p && p.dataset && p.dataset.scr && p.offsetParent !== null && p.children.length); } catch (e) { return false; }
 }
 // every place a reward can be queued: entries keyed by id, so a check can see which ones are NEW
 function queues() {
  const out = [];
  try { for (const c of (W.V27 && V27.claims ? V27.claims() : [])) if (c) out.push([ 'v27:' + c.id, c ]); } catch (e) {}
  try { for (const c of (V17.chalClaim() || [])) if (c) out.push([ 'ch:' + c.id, c ]); } catch (e) {}
  try { const q = (LS.get('an579q', null) || {}).q || []; q.forEach((x, i) => out.push([ 'an:' + i + ':' + x, x ])); } catch (e) {}
  try { const v = LS.get('vc494', null); (v && Array.isArray(v.q) ? v.q : []).forEach((x, i) => out.push([ 'vc:' + i + ':' + JSON.stringify(x).slice(0, 80), x ])); } catch (e) {}
  return out;
 }
 const sig = () => queues().map(x => x[0]);
 // a NEW queue entry that names one of these ids (or the card's player name) = this grant was queued by its source
 function queuedSince(keys, ids) {
  const old = new Set(keys), fresh = queues().filter(x => !old.has(x[0]));
  if (!fresh.length) return false;
  const txt = JSON.stringify(fresh.map(x => x[1])).toUpperCase();
  return ids.some(id => {
   if (txt.indexOf(String(id).toUpperCase()) >= 0) return true;
   try { const n = PP(id) && PP(id).n; if (n && txt.indexOf(String(n).toUpperCase()) >= 0) return true; } catch (e) {}
   try { const it = V17.BY[id]; if (it && it.n && txt.indexOf(String(it.n).toUpperCase()) >= 0) return true; } catch (e) {}
   return false;
  });
 }
 function shownNow(ids) {
  try { if (/^pack/.test(scr()) || D.getElementById('fw37') || D.getElementById('c27') || D.getElementById('c419') || D.getElementById('vc494pop')) return true; } catch (e) {}
  try { const p = V17.pop && V17.pop(); if (p && /pack|claim/.test(String(p.kind || ''))) return true; } catch (e) {}
  return false;
 }
 function inPack(ids) {
  try { const P = V17.lastPack && V17.lastPack(); if (P && Array.isArray(P.cards) && ids.some(id => P.cards.indexOf(id) >= 0 || P.cards.indexOf('pc27|' + id) >= 0)) return true; } catch (e) {}
  try { const f = V22.st().fw37; if (f && Array.isArray(f.ids) && ids.some(id => f.ids.indexOf(id) >= 0)) return true; } catch (e) {}
  return false;
 }
 function remember(kind, ids, why) {
  if (off() || !ids || !ids.length) return;
  if (Date.now() - T0 < 8000) return;                 // start-up migrations
  if (panelOpen()) return;                            // shop / locker / trade / code screens show their own result
  if (kind === 'item' && !G()) return;                // items: only rewards from a game
  const key = kind + '|' + ids.join(',') + '|' + why;
  if (V.pend.some(p => p.key === key && Date.now() - p.t < 1500)) return;   // same grant seen through a 2nd wrapper
  V.pend.push({ key: key, k: kind, ids: ids.slice(0, 40), why: String(why || ''), t: Date.now(), s: sig(), shown: shownNow(ids) });
  if (V.pend.length > 30) V.pend.shift();
 }
 // wraps (outermost: loaded last)
 let wC = false, wI = false;
 function wrapGrants() {
  try {
   if (!wC && W.V22 && typeof V22.grantIds === 'function' && !V22.grantIds.__v581) {
    wC = true;
    const g0 = V22.grantIds;
    const g1 = function (ids, tid, why) {
     const out = g0.apply(this, arguments);
     try { if (Array.isArray(out) && out.length) remember('card', out, why); } catch (e) { fail('rem', e); }
     return out;
    };
    for (const k of Object.keys(g0)) { try { g1[k] = g0[k]; } catch (e) {} }
    g1.__v581 = 1; V22.grantIds = g1;
   }
  } catch (e) { fail('wrapC', e); }
  try {
   if (!wI && W.V17 && typeof V17.grant === 'function' && !V17.grant.__v581) {
    wI = true;
    const g0 = V17.grant;
    const g1 = function (id, n) {
     let had = 0; try { had = (V17.ST().inv[id] | 0); } catch (e) {}
     const r = g0.apply(this, arguments);
     try { const it = V17.BY[id]; if (it && !it.pc27 && !had && (V17.ST().inv[id] | 0) > 0) remember('item', [ id ], 'item'); } catch (e) { fail('remI', e); }
     return r;
    };
    for (const k of Object.keys(g0)) { try { g1[k] = g0[k]; } catch (e) {} }
    g1.__v581 = 1; V17.grant = g1;
   }
  } catch (e) { fail('wrapI', e); }
 }
 wrapGrants();
 const RC = [ '#9aa3ab', '#3d8bff', '#ffcc33' ], RN = [ 'COMMON', 'RARE', 'LEGENDARY' ];
 function cardTile(id) {
  let img = '', r = 0, tm = '';
  try { r = V22.rarOf ? V22.rarOf(id) | 0 : 0; } catch (e) {}
  try { img = V22.artUrl ? V22.artUrl(id, V22.teamOfCard ? V22.teamOfCard(id) : undefined) : ''; } catch (e) {}
  try { tm = String(T(V22.teamOfCard(id)).abbr || ''); } catch (e) {}
  let n = id; try { n = String(PP(id).n || id).toUpperCase(); } catch (e) {}
  return { img: img, n: n, sub: (RN[r] || 'CARD') + (tm ? ' - ' + tm : ''), col: RC[r] || '#ffcc33' };
 }
 function itemTile(id) {
  const it = V17.BY[id] || {};
  let img = ''; try { img = V17.iconUrl(id); } catch (e) {}
  return { img: img, n: String(it.n || id).toUpperCase(), sub: RN[it.rar | 0] || 'ITEM', col: RC[it.rar | 0] || '#7dff7a' };
 }
 function queueFor(list) {
  if (!W.V27 || typeof V27.queue !== 'function') return false;
  const cards = [], items = [];
  for (const p of list) for (const id of p.ids) { if (p.k === 'card') { if (cards.indexOf(id) < 0) cards.push(id); } else if (items.indexOf(id) < 0) items.push(id); }
  const groups = [];
  if (cards.length) groups.push({ label: cards.length === 1 ? 'NEW PLAYER CARD' : cards.length + ' NEW PLAYER CARDS', tiles: cards.slice(0, 24).map(cardTile) });
  if (items.length) groups.push({ label: items.length === 1 ? 'NEW ITEM' : items.length + ' NEW ITEMS', tiles: items.slice(0, 24).map(itemTile) });
  if (!groups.length) return false;
  const n = cards.length + items.length, why = list.map(p => p.why).filter(Boolean)[0] || '';
  const id = 'c581|' + cards.concat(items).join(',').slice(0, 100) + '|' + Date.now();
  const ok = V27.queue({ id: id, head: n === 1 ? (cards.length ? 'NEW CARD!' : 'NEW ITEM!') : n + (cards.length && !items.length ? ' NEW CARDS!' : ' NEW REWARDS!'),
   sub: (why && !/^item$/.test(why) ? why.toUpperCase() + ' - ' : '') + 'IT IS IN YOUR LOCKER ROOM', col: '#ffcc33', groups: groups });
  note('queued ' + id + ' ' + ok);
  return ok !== false;
 }
 V.queueFor = queueFor;
 function check() {
  if (off() || !V.pend.length) return;
  const now = Date.now(), due = V.pend.filter(p => now - p.t >= WAIT);
  if (!due.length) return;
  V.pend = V.pend.filter(p => now - p.t < WAIT);
  const miss = [];
  for (const p of due) {
   const covered = p.shown || queuedSince(p.s, p.ids) || inPack(p.ids);
   note((covered ? 'ok ' : 'MISS ') + p.k + ' ' + p.why + ' ' + p.ids.slice(0, 4).join(','));
   if (!covered) {
    // still owned? (a trade / refund may have taken it back)
    if (p.k === 'card') { try { p.ids = p.ids.filter(id => V22.owned ? V22.owned(id) : true); } catch (e) {} }
    else { try { p.ids = p.ids.filter(id => (V17.ST().inv[id] | 0) > 0); } catch (e) {} }
    if (p.ids.length) miss.push(p);
   }
  }
  if (miss.length) try { queueFor(miss); } catch (e) { fail('queue', e); }
 }
 // watchdog: a waiting v27 collect screen that never opens on an idle lobby
 let waitSince = 0;
 function watchdog() {
  if (off()) { waitSince = 0; return; }
  let q = [];
  try { q = W.V27 && V27.claims ? V27.claims() : []; } catch (e) { q = []; }
  const g = G();
  let idle = scr() === 'menu' && q.length && !(g && !g.over) && !panelOpen();
  try { if (idle && V17.modal && V17.modal()) idle = false; } catch (e) {}
  try { if (idle && (V17.chalClaim() || []).length) idle = false; } catch (e) {}
  try { if (idle && [ 'c27', 'c419', 'vc494pop', 'fw37', 'tut26card', 'shop26', 'df2503', 'tt27' ].some(id => D.getElementById(id))) idle = false; } catch (e) {}
  try { if (idle && [ ...D.querySelectorAll('[role=dialog]') ].some(e => e.offsetParent !== null)) idle = false; } catch (e) {}
  try { if (idle && W.AN579 && AN579.active && AN579.active()) idle = false; } catch (e) {}
  if (!idle) { waitSince = 0; return; }
  if (!waitSince) { waitSince = Date.now(); return; }
  if (Date.now() - waitSince < 15000) return;
  waitSince = 0;
  try { if (typeof V27.showClaim === 'function') { V27.showClaim(q[0]); note('watchdog ' + q[0].id); } } catch (e) { fail('wd', e); }
 }
 setInterval(() => { try { wrapGrants(); check(); } catch (e) { fail('tick', e); } }, 1000);
 setInterval(() => { try { watchdog(); } catch (e) { fail('wd2', e); } }, 1000);
})();
