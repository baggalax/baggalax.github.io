'use strict';

/* v436hb - ALL-AMERICAN BADGE + BAGGATWAAN GLOW BELONG TO THE CARD THAT EARNED THEM.
   Before: honors25 stored every honor under the real player (S.aa / S.tew / S.glow keyed by the base id, with
   AA25- / TW25- stripped). So once ANY version of a player won (his ultimate card on a college card team, his
   Baggatwan card...), the plain roster player glowed everywhere (his school, Quick Game, CPU teams), and the
   ultimate card that actually won it did NOT (U_ ids were never looked up), not even the BAGGATWAAN ULTIMATE.
   Now (rule): separate cards = separate identities.
     - an honor card IS its honor: AA25-x = All-American; TW25-x = Baggatwan (+ All-American, v39aa rule);
       their ultimates U_AA25-x / U_TW25-x carry the same honor (they are made from that card).
     - any other honor is kept on the exact card that earned it (the id on the roster that won it:
       regular x, or the ultimate U_x, ...). The regular player does not get the ultimate's honor and the
       ultimate does not get the regular player's honor. Draft copies (CD36-x) are the same card as x.
     - glow on/off is remembered per card.
   Earned honors are read from the college season record (col25 cur.hon keeps the ids exactly as they were on
   the roster), new seasons included. Old saves migrate once into the new key 'hb436' (the old 'hon25' save is
   never changed or wiped): see REPORT / HB436.LOG.mig for each decision. Nothing is ever deleted.
   honors25.js asks window.__hb436 for isTew / isAA / glowPref / glowSet (all draw paths, the glow item,
   locker, lobby hero). Kill switch: window.__rl_no436hb = true -> exactly the old per-player behaviour. */
const HB436 = (() => {
 const off = () => !!window.__rl_no436hb || !!window.__rl_v124gb;
 const KEY = 'hb436';
 const LOG = {
  mig: [],
  hon: [],
  err: [],
  ctx: 0
 };
 const err = (e, w) => {
  try {
   LOG.err.push(w + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.err.length > 30) LOG.err.shift();
  } catch (_) {}
 };
 function load() {
  let o = null;
  try {
   o = LS.get(KEY, null);
  } catch (e) {
   o = null;
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
  for (const k of [ 'who', 'glow', 'hon', 'mig' ]) if (!o[k] || typeof o[k] !== 'object' || Array.isArray(o[k])) o[k] = {};
  o.v = 1;
  return o;
 }
 let D = load();
 const save = () => {
  try {
   LS.set(KEY, D);
  } catch (e) {
   err(e, 'save');
  }
 };
 const hon = () => {
  try {
   return window.HON25 && HON25.st ? HON25.st() : null;
  } catch (e) {
   return null;
  }
 };
 // the card identity of an id: draft copies are the card they copy; everything else is itself
 const canon = id => {
  let s = String(id == null ? '' : id);
  while (s.indexOf('CD36-') === 0) s = s.slice(5);
  return s;
 };
 const tewI = s => /^(U_)?TW25-/.test(s);
 const aaI = s => /^(U_)?(AA25-|TW25-)/.test(s);
 const realOf = s => String(s).replace(/^U_/, '').replace(/^(AA25-|TW25-)/, '');
 const hKey = s => String(s).replace(/^(AA25-|TW25-)/, '');
 const rec = s => Object.prototype.hasOwnProperty.call(D.who, s) ? D.who[s] : null;
 function isTew(pid) {
  const s = canon(pid);
  if (!s) return false;
  const r = rec(s);
  return tewI(s) || !!(r && r.tew);
 }
 function isAA(pid) {
  const s = canon(pid);
  if (!s) return false;
  const r = rec(s);
  return aaI(s) || !!(r && (r.aa || r.tew));
 }
 function glowPref(pid) {
  const s = canon(pid);
  if (Object.prototype.hasOwnProperty.call(D.glow, s)) return D.glow[s];
  const H = hon(), g = H && H.glow;
  if (!g) return true;
  if (g[hKey(s)] === false || g[realOf(s)] === false) return false;
  return true;
 }
 function glowSet(pid, v) {
  const s = canon(pid);
  if (!s) return false;
  D.glow[s] = !!v;
  save();
  return true;
 }
 // honors25 accepted this honor for the player behind s (so legends / refused ones never light up)
 function accepted(s, kind) {
  const H = hon();
  if (!H) return false;
  const ks = [ hKey(s), realOf(s) ];
  for (const k of ks) {
   if (H[kind] && H[kind][k]) return true;
   if (kind === 'aa' && H.tew && H.tew[k]) return true;
  }
  return false;
 }
 function give(id, kind, why) {
  const s = canon(id);
  if (!s || (kind === 'tew' ? tewI(s) : aaI(s))) return false;
  if (!D.who[s] || typeof D.who[s] !== 'object') D.who[s] = {};
  if (D.who[s][kind]) return false;
  D.who[s][kind] = Date.now();
  LOG.hon.push([ s, kind, why ]);
  return true;
 }
 // 1) the college season record: C.hon.tew / C.hon.aa are the roster ids exactly as they won
 function seasonHon() {
  let C = null;
  try {
   C = window.COL25 && COL25.st ? COL25.st().cur : null;
  } catch (e) {
   C = null;
  }
  const H = C && C.hon;
  if (!H || typeof H !== 'object' || (!H.tew && !Array.isArray(H.aa))) return false;
  const key = (C.n || 0) + '|' + C.team + '|' + (H.at || 0);
  if (D.hon[key]) return false;
  const won = [];
  if (H.tew && accepted(canon(H.tew), 'tew')) {
   give(H.tew, 'tew', 'season ' + key);
   won.push([ canon(H.tew), 'tew' ]);
  }
  for (const id of Array.isArray(H.aa) ? H.aa : []) if (id && accepted(canon(id), 'aa')) {
   give(id, 'aa', 'season ' + key);
   won.push([ canon(id), 'aa' ]);
  }
  D.hon[key] = {
   at: Date.now(),
   won: won
  };
  save();
  return true;
 }
 // card ids Charlie put on college card teams, and school / card seasons he archived
 function evidence() {
  const card = new Set, school = new Set;
  try {
   const o = LS.get('bl33_cardteams', null);
   for (const t of o && Array.isArray(o.col) ? o.col : []) for (const id of t && Array.isArray(t.ids) ? t.ids : []) card.add(canon(id));
  } catch (e) {
   err(e, 'ev33');
  }
  try {
   const a = LS.get('cs429', null);
   for (const d of Array.isArray(a) ? a : []) {
    if (!d || !Array.isArray(d.ids)) continue;
    const isC = /^SZ0C/.test(String(d.base || '')) || d.ids.some(id => /^(U_|AA25-|TW25-|CD36-)/.test(String(id)));
    for (const id of d.ids) (isC ? card : school).add(canon(id));
   }
  } catch (e) {
   err(e, 'ev429');
  }
  try {
   const C = window.COL25 && COL25.st ? COL25.st().cur : null;
   if (C && C.team) {
    const ids = T(C.team).roster || [], isC = !(COL25.isCol && COL25.isCol(C.team));
    for (const id of ids) (isC ? card : school).add(canon(id));
   }
  } catch (e) {
   err(e, 'evcur');
  }
  return {
   card: card,
   school: school
  };
 }
 // 2) old saves: every per-player flag in hon25 gets an owner card, once. Never deleted.
 function migrate() {
  const H = hon();
  if (!H) return 0;
  let n = 0, ev = null;
  for (const kind of [ 'tew', 'aa' ]) for (const b of Object.keys(H[kind] || {})) {
   const mk = kind + ':' + b;
   if (D.mig[mk]) continue;
   let to = [], why = '';
   if (/^U_/.test(b)) {
    to = [ b ];
    why = 'already stored on the ultimate card itself';
   } else {
    const have = Object.keys(D.who).filter(s => realOf(s) === b && D.who[s][kind]);
    if (have.length) {
     to = have.slice();
     why = 'from the college season record';
     ev = ev || evidence();
     if (!have.includes(b) && ev.school.has(b)) {
      to.push(b);
      why += ', and the regular player played a school season too: ambiguous, kept on both';
     }
    } else {
     ev = ev || evidence();
     const V = [ ...ev.card ].filter(s => realOf(s) === b && !aaI(s));
     if (!V.length) {
      to = [ b ];
      why = 'no card team ever had another version of him: kept on the regular player (same as before)';
     } else {
      to = V.slice();
      why = 'his ' + V.join(' + ') + ' played on your college card team';
      if (!V.includes(b) && ev.school.has(b)) {
       to.push(b);
       why += ', and the regular player played a school season too: ambiguous, kept on both';
      } else if (V.length > 1) why += ': ambiguous, kept on all of them';
     }
    }
   }
   for (const s of to) give(s, kind, 'migrate');
   D.mig[mk] = {
    to: to,
    why: why,
    at: Date.now()
   };
   LOG.mig.push([ mk, to, why ]);
   n++;
  }
  if (n) save();
  return n;
 }
 function tick() {
  if (off()) return;
  try {
   seasonHon();
  } catch (e) {
   err(e, 'season');
  }
  try {
   migrate();
  } catch (e) {
   err(e, 'mig');
  }
 }
 const R = {
  isTew: isTew,
  isAA: isAA,
  glowPref: glowPref,
  glowSet: glowSet
 };
 if (!off()) {
  tick();
  window.__hb436 = R;
  setInterval(tick, 3e3);
  // a new honor: read the season record right after it is written
  if (window.HON25 && typeof HON25.grant === 'function' && !HON25.grant.__hb436) {
   const g0 = HON25.grant;
   const g1 = function() {
    const r = g0.apply(this, arguments);
    try {
     setTimeout(tick, 0);
    } catch (e) {}
    return r;
   };
   for (const k of Object.keys(g0)) g1[k] = g0[k];
   g1.__hb436 = true;
   HON25.grant = g1;
  }
  // v331 asks HON25.isAA(<source card>) to decide the ultimate's All-American patch (only when the v35 chest
  // badges are off). Answer for the ultimate card being drawn, not for the card it was made from.
  let ctx = null;
  const dp0 = window.drawPlayer12;
  if (typeof dp0 === 'function') window.drawPlayer12 = function(p) {
   const prev = ctx;
   ctx = p && p.pl ? p.pl.id : null;
   try {
    return dp0.apply(this, arguments);
   } finally {
    ctx = prev;
   }
  };
  const lb0 = window.lobbyBake;
  if (typeof lb0 === 'function') window.lobbyBake = function() {
   const prev = ctx;
   ctx = window.__v17hp || null;
   try {
    return lb0.apply(this, arguments);
   } finally {
    ctx = prev;
   }
  };
  if (window.HON25 && typeof HON25.isAA === 'function') {
   const ia0 = HON25.isAA;
   HON25.isAA = function(pid) {
    try {
     if (!off() && ctx && window.ULT331 && ULT331.isU && ULT331.isU(String(ctx)) && pid != null && String(pid) === String(ULT331.srcOf(ctx))) {
      LOG.ctx++;
      return HON25.on() && isAA(ctx);
     }
    } catch (e) {
     err(e, 'isAA');
    }
    return ia0.apply(this, arguments);
   };
  }
  // v35 chest badges: the ultimate of a Baggatwan card is an All-American card too (like TW25- itself), and an
  // ultimate card that earned All-American can wear the badge. Default badge stays the ULTIMATE one.
  if (window.V39AW && typeof V39AW.aaKind === 'function') {
   const ak0 = V39AW.aaKind;
   V39AW.aaKind = function(pid) {
    const r = ak0.apply(this, arguments);
    if (r || off()) return r;
    try {
     const s = canon(pid);
     if (/^U_TW25-/.test(s)) return true;
     const q = rec(s);
     if (/^U_/.test(s) && q && (q.aa || q.tew)) return true;
    } catch (e) {
     err(e, 'aaKind');
    }
    return r;
   };
  }
 }
 return {
  on: () => !off(),
  KEY: KEY,
  LOG: LOG,
  st: () => D,
  isTew: isTew,
  isAA: isAA,
  glowPref: glowPref,
  glowSet: glowSet,
  give: give,
  tick: tick,
  migrate: migrate,
  evidence: evidence,
  canon: canon,
  reload: () => {
   D = load();
   return D;
  }
 };
})();

window.HB436 = HB436;
