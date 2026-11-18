/* v538gscards.js - GOOD STICK CO. player cards are the REAL roster only (Bagga Lax).
   Charlie (Nov 12): "Make it so you can only get cards of goodstick players that are the real people in the roster."
   + "their cards need to be the same platinum color ... rarity's based on overalls but say collab on them and are
   sorted into their rarity section" + get 2 for playing with the team, the rest in card packs.
   The GSC roster (v501gsc.js) is 10 real players + 10 made-up fillers (gscFiller). Fillers still play in matches;
   they never become cards.
   Card paths covered:
   - V22.grantIds (every grant: title flips, ghosts win, card drops, pack pulls, ultimate, career, test kit, trades)
     drops filler ids; a save write of the cards (LS 'v22') drops any filler card that was not already in the save
     (direct writes in honors25 / trade24 / closure grants). Flip decks never hold fillers.
   - V27.pool / V27.pickPlayer / V27.packCards (daily, basic, rare, legendary packs, free packs, player card packs
     pc38*, odds packs): fillers are never in the pool; a filler card in a pack is swapped for a real GSC player of the
     same rarity (or another player). Real GSC players are in the pool for everyone, and a player-card slot in a regular
     pack turns into a real GSC card you don't have yet 10% of the time.
   - V28 card drops: no card drop from games played AS the Good Stick Co. (their cards come from the reward below).
   - v501's hidden gscard_N items: filler ones are never granted.
   - REWARD: the first time you finish a match with the GOOD STICK CO., 2 random real players you don't own.
   - LOOK: every GSC player card is the platinum COLLAB card (v504's rx486 frame) with a COLLAB tag; rarity stays the
     normal overall-based one, so they sort into LEGENDARY / RARE / COMMON in CARDS.
   - Old saves holding filler GSC cards: hidden from CARDS, lineups and trades; the save keeps them.
   Gate: same as the Good Stick pack (GSC501.packOn(): LIVEOPS lists pack_goodstick or the retrolax test gate). Not
   released = no reward / boost / look, and no GSC card comes out of a pack; the filler guard is always on.
   No ids, rl_* keys or net protocol change. Kill switch: window.__rl_no538gc = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no538gc || W.GSC538 || !W.V17 || typeof GH_REG === 'undefined') return;
 const ID = 'GSC';
 const S = W.GSC538 = { err: [], blocked: [], swapped: [], boosted: [], reward: null, hidden: 0 };
 const fail = (w, e) => { if (S.err.length < 30) S.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!(W.__rl_no538gc || W.__rl_no501gsc);
 const released = () => { try { return !off() && !!(W.GSC501 && typeof GSC501.packOn === 'function' && GSC501.packOn()); } catch (e) { return false; } };
 S.released = released;
 const team = () => GH_REG[ID] || null;
 const ros = () => { const t = team(); return t && Array.isArray(t.roster) ? t.roster : []; };
 const PL = id => { try { return typeof PLAYERS !== 'undefined' ? PLAYERS[id] : null; } catch (e) { return null; } };
 // a GSC base id from any card id ("GSC-12", "pc27|GSC-12", derived ultimate ids ending in GSC-12)
 const gscBase = id => { const m = /(?:^|[|:_~])(GSC-\d+)$/.exec(String(id || '')); return m ? m[1] : null; };
 const isGsc = id => !!gscBase(id);
 const isFiller = id => {
  const b = gscBase(id);
  if (!b) return false;
  const p = PL(b);
  if (p) return !!p.gscFiller;
  return true; // unknown GSC slot = not a real player
 };
 const realIds = () => ros().filter(id => { const p = PL(id); return p && !p.gscFiller; });
 S.realIds = realIds;
 S.fillerIds = () => ros().filter(id => { const p = PL(id); return p && p.gscFiller; });
 S.isFiller = isFiller;
 const V22ok = () => !!(W.V22 && V22.st);
 const rarOf = pid => { try { return V22.rarOf(pid); } catch (e) { return 0; } };
 const cardsObj = () => { try { const s = V22.st(); return s && s.cards && typeof s.cards === 'object' ? s.cards : null; } catch (e) { return null; } };
 const ownedRaw = pid => { const c = cardsObj(); return !!(c && c[pid]); };

 // ---------- 1) grants: fillers never become cards ----------
 const pre = new Set();
 try { const c = cardsObj(); if (c) for (const k in c) if (isFiller(k)) pre.add(k); } catch (e) { fail('pre', e); }
 S.preFillers = [ ...pre ];
 function wrapGrant() {
  if (!W.V22 || typeof V22.grantIds !== 'function' || V22.grantIds.__gc538) return;
  const G0 = V22.grantIds;
  const G1 = function (ids) {
   const a = Array.prototype.slice.call(arguments);
   if (!off() && Array.isArray(ids)) {
    const bad = ids.filter(isFiller);
    if (bad.length) { bad.forEach(b => { if (S.blocked.length < 50) S.blocked.push(b); }); a[0] = ids.filter(id => !isFiller(id)); }
   }
   return G0.apply(this, a);
  };
  for (const k of Object.keys(G0)) { try { G1[k] = G0[k]; } catch (e) {} }
  G1.__gc538 = true;
  V22.grantIds = G1;
 }
 try { wrapGrant(); } catch (e) { fail('grant', e); }
 // direct writes / closure grants: strip new filler cards before the save hits storage; flip decks lose fillers too
 try {
  if (typeof LS !== 'undefined' && LS && typeof LS.set === 'function' && !LS.set.__gc538) {
   const set0 = LS.set;
   const set1 = function (k, v) {
    try {
     if (!off() && v && typeof v === 'object') {
      if (k === 'v22' && v.cards && typeof v.cards === 'object') {
       for (const id of Object.keys(v.cards)) if (isFiller(id) && !pre.has(id)) { delete v.cards[id]; if (S.blocked.length < 50) S.blocked.push(id); }
      } else if (k === 'v34flip' && Array.isArray(v.q)) {
       for (const d of v.q) if (d && Array.isArray(d.ids) && d.ids.some(isFiller)) {
        // keep the flips already made (indexes in d.f) pointing at the same cards
        const keep = [], f2 = [];
        d.ids.forEach((id, i) => { if (!isFiller(id)) { if (Array.isArray(d.f) && d.f.includes(i)) f2.push(keep.length); keep.push(id); } });
        d.ids = keep; if (Array.isArray(d.f)) d.f = f2;
        if (typeof d.need === 'number') d.need = Math.min(d.need, keep.length);
        if (Array.isArray(d.all35)) d.all35 = d.all35.filter(id => !isFiller(id));
       }
      }
     }
    } catch (e) { fail('lsset', e); }
    return set0.apply(this, arguments);
   };
   set1.__gc538 = true;
   LS.set = set1;
  }
 } catch (e) { fail('ls', e); }
 // flip decks in memory (built before the save)
 try {
  if (W.V22 && typeof V22.flipSplit === 'function' && !V22.flipSplit.__gc538) {
   const F0 = V22.flipSplit;
   const F1 = function (ids) { const a = Array.prototype.slice.call(arguments); if (!off() && Array.isArray(ids)) a[0] = ids.filter(id => !isFiller(id)); return F0.apply(this, a); };
   F1.__gc538 = true;
   V22.flipSplit = F1;
  }
 } catch (e) { fail('flip', e); }

 // ---------- 2) hide filler cards an old save already holds (save untouched) ----------
 function wrapOwned() {
  if (!W.V22) return;
  if (typeof V22.owned === 'function' && !V22.owned.__gc538) {
   const o0 = V22.owned;
   const o1 = function (pid) { if (!off() && isFiller(pid)) return false; return o0.apply(this, arguments); };
   o1.__gc538 = true; V22.owned = o1;
  }
  if (typeof V22.ownedIds === 'function' && !V22.ownedIds.__gc538) {
   const i0 = V22.ownedIds;
   const i1 = function () { const r = i0.apply(this, arguments); return !off() && Array.isArray(r) ? r.filter(id => !isFiller(id)) : r; };
   i1.__gc538 = true; V22.ownedIds = i1;
  }
 }
 // run fn with the filler cards lifted out of the in-memory save, then put them back exactly
 function withoutFillers(fn, self, args) {
  const c = off() ? null : cardsObj();
  const stash = {};
  let n = 0;
  if (c) for (const k of Object.keys(c)) if (isFiller(k)) { stash[k] = c[k]; delete c[k]; n++; }
  try { return fn.apply(self, args); } finally { if (c) for (const k in stash) c[k] = stash[k]; S.hidden = n; }
 }
 S.withoutFillers = withoutFillers;
 function wrapRender(name) {
  if (!W.V22 || typeof V22[name] !== 'function' || V22[name].__gc538) return;
  const r0 = V22[name];
  const r1 = function () { return withoutFillers(r0, this, arguments); };
  for (const k of Object.keys(r0)) { try { r1[k] = r0[k]; } catch (e) {} }
  r1.__gc538 = true;
  V22[name] = r1;
 }
 try { wrapOwned(); [ 'playersHtml', 'popHtml', 'subIds', 'subExtra', 'lobbyLineup', 'okSub' ].forEach(wrapRender); } catch (e) { fail('hide', e); }

 // ---------- 3) packs: pool without fillers, real GSC for everyone, filler swaps, boost ----------
 let poolSrc = null, poolOut = null, poolRel = null;
 function filteredPool(P) {
  const rel = released();
  if (P === poolSrc && poolRel === rel && poolOut) return poolOut;
  const ok = id => !isGsc(id) || (rel && !isFiller(id));
  const ids = (P.ids || []).filter(ok);
  const by = [ 0, 1, 2 ].map(r => ((P.by || [])[r] || []).filter(ok));
  if (rel) for (const id of realIds()) if (ids.indexOf(id) < 0) { ids.push(id); const r = rarOf(id); (by[r] = by[r] || []).push(id); }
  poolSrc = P; poolRel = rel;
  poolOut = Object.assign({}, P, { ids: ids, by: by });
  return poolOut;
 }
 function pickOther(rar, r) {
  // a non-GSC player of this rarity from the game's pool
  try {
   const P = W.V27 && V27.pool ? V27.pool() : null;
   const L = P && (P.by[rar] && P.by[rar].length ? P.by[rar] : P.ids) || [];
   const L2 = L.filter(id => !isGsc(id));
   if (L2.length) return L2[Math.floor(r() * L2.length) % L2.length];
  } catch (e) { fail('other', e); }
  return null;
 }
 function pickGsc(rar, r, freshOnly) {
  const all = realIds().filter(id => rarOf(id) === rar);
  const fresh = all.filter(id => !ownedRaw(id));
  const L = fresh.length ? fresh : freshOnly ? [] : all;
  return L.length ? L[Math.floor(r() * L.length) % L.length] : null;
 }
 const BOOST = 0.10;
 S.BOOST = BOOST;
 function fixPack(kind, cards, r) {
  if (off() || !Array.isArray(cards) || !W.V27 || !V27.cardItem) return;
  r = typeof r === 'function' ? r : Math.random;
  const rel = released();
  for (let i = 0; i < cards.length; i++) {
   const cid = cards[i];
   if (typeof cid !== 'string' || cid.indexOf('pc27|') !== 0) continue;
   const pid = cid.slice(5);
   const it = V17.BY && V17.BY[cid];
   const rar = it && typeof it.rar === 'number' ? it.rar : rarOf(pid);
   let np = null;
   if (isGsc(pid) && (isFiller(pid) || !rel)) {
    np = rel ? pickGsc(rar, r, false) : null;
    if (!np) np = pickOther(rar, r);
    if (np) S.swapped.length < 60 && S.swapped.push([ kind, pid, np ]);
   } else if (rel && !isGsc(pid) && r() < (typeof W.__rl_gc538boost === 'number' ? W.__rl_gc538boost : BOOST)) {
    np = pickGsc(rar, r, true);
    if (np) S.boosted.length < 60 && S.boosted.push([ kind, pid, np ]);
   }
   if (np) { try { cards[i] = V27.cardItem(np); } catch (e) { fail('swap', e); } }
  }
 }
 S.fixPack = fixPack;
 function wrapV27() {
  if (!W.V27) return;
  if (typeof V27.pool === 'function' && !V27.pool.__gc538) {
   const p0 = V27.pool;
   const p1 = function () { const P = p0.apply(this, arguments); try { return off() || !P ? P : filteredPool(P); } catch (e) { fail('pool', e); return P; } };
   p1.__gc538 = true; V27.pool = p1;
  }
  if (typeof V27.pickPlayer === 'function' && !V27.pickPlayer.__gc538) {
   const k0 = V27.pickPlayer;
   const k1 = function (rar, r) {
    let pid = k0.apply(this, arguments);
    try {
     if (!off() && isGsc(pid) && (isFiller(pid) || !released())) pid = (released() && pickGsc(rar | 0, r || Math.random, false)) || pickOther(rar | 0, r || Math.random) || pid;
    } catch (e) { fail('pick', e); }
    return pid;
   };
   k1.__gc538 = true; V27.pickPlayer = k1;
  }
  if (typeof V27.packCards === 'function' && !V27.packCards.__gc538) {
   const c0 = V27.packCards;
   const c1 = function (kind, cards, r) {
    const n = c0.apply(this, arguments);
    try { fixPack(kind, cards, r); } catch (e) { fail('pack', e); }
    return n;
   };
   for (const k of Object.keys(c0)) { try { c1[k] = c0[k]; } catch (e) {} }
   c1.__gc538 = true; V27.packCards = c1;
  }
 }
 try { wrapV27(); } catch (e) { fail('v27', e); }
 // last line of defence for any pack path: the pack opener's own list of cards (V38P.noRepeat runs on every pack)
 try {
  if (W.V38P && typeof V38P.noRepeat === 'function' && !V38P.noRepeat.__gc538) {
   const n0 = V38P.noRepeat;
   const n1 = function (kind, cards, r) {
    const out = n0.apply(this, arguments);
    try {
     if (!off() && Array.isArray(cards)) for (let i = 0; i < cards.length; i++) {
      const cid = cards[i];
      if (typeof cid !== 'string' || cid.indexOf('pc27|') !== 0) continue;
      const pid = cid.slice(5);
      if (isGsc(pid) && (isFiller(pid) || !released())) {
       const rar = rarOf(pid), rr = typeof r === 'function' ? r : Math.random;
       const np = (released() && pickGsc(rar, rr, false)) || pickOther(rar, rr);
       if (np) { cards[i] = V27.cardItem(np); S.swapped.length < 60 && S.swapped.push([ kind, pid, np, 'late' ]); }
      }
     }
    } catch (e) { fail('late', e); }
    return out;
   };
   n1.__gc538 = true; V38P.noRepeat = n1;
  }
 } catch (e) { fail('v38p', e); }

 // v501's hidden gscard_N items: no filler ones
 try {
  if (typeof V17.grant === 'function' && !V17.grant.__gc538) {
   const g0 = V17.grant;
   const g1 = function (id) {
    try {
     const m = /^gscard_(\d+)$/.exec(String(id || ''));
     if (!off() && m && isFiller(ID + '-' + m[1])) { if (S.blocked.length < 50) S.blocked.push(id); return; }
    } catch (e) {}
    return g0.apply(this, arguments);
   };
   for (const k of Object.keys(g0)) { try { g1[k] = g0[k]; } catch (e) {} }
   g1.__gc538 = true; V17.grant = g1;
  }
 } catch (e) { fail('v17grant', e); }

 // ---------- 4) 2 cards the first time you finish a match with the Good Stick Co.; no V28 drops in GSC games ----------
 const STv = () => { try { return V17.ST(); } catch (e) { return null; } };
 function reward(G) {
  const s = STv();
  if (!s || s.gsc538r || !V22ok() || (V22.on && !V22.on())) return null;
  const fresh = realIds().filter(id => !ownedRaw(id));
  const a = fresh.slice(), pick = [];
  while (pick.length < 2 && a.length) pick.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  let got = [];
  try { got = pick.length ? V22.grantIds(pick, ID, 'GOOD STICK CO.') : []; } catch (e) { fail('reward', e); }
  s.gsc538r = Date.now();
  try { V17.save(); } catch (e) {}
  S.reward = got;
  if (got && got.length) {
   try { if (V22.popup) V22.popup('gsc538', 'GOOD STICK CO. - 2 PLAYER CARDS!', 'YOU PLAYED WITH THE GOOD STICK CO.: 2 PLATINUM COLLAB PLAYER CARDS ARE IN YOUR CARDS. THE REST OF THE TEAM DROPS FROM CARD PACKS.', got); } catch (e) { fail('popup', e); }
   try { if (V17.toast) V17.toast('GOOD STICK CARDS: ' + got.map(id => (PL(id) || {}).n).join(' + '), '#e6ecf2'); } catch (e) {}
  }
  return got;
 }
 S.reward_ = reward;
 let paidKey = null;
 setInterval(() => {
  try {
   if (off() || !released()) return;
   const G = typeof game !== 'undefined' ? game : W.game;
   if (!G || G.user !== ID || G.tutorial || G.practice || G.mode === 'tutorial' || G.mode === 'practice') return;
   if (!G.over && G.drop28 === undefined) G.drop28 = null; // no V28 card drop from a GSC game
   if (!G.over) return;
   const key = (G.user || '') + '|' + (G.opp || '') + '|' + (G.t0 || G.seed || 0);
   if (paidKey === key) return;
   paidKey = key;
   reward(G);
  } catch (e) { fail('tick', e); }
 }, 700);

 // ---------- 5) look: platinum COLLAB card, normal rarity ----------
 try {
  const css = '.c17.gsc538 .gsc538t{position:absolute;top:2px;right:2px;left:auto;z-index:2;background:#111214;color:#f4f4f4;font-style:normal;font-size:6px;line-height:8px;padding:0 2px;border:1px solid #cfd6dc}' +
   '.c17.gsc538 .rr{color:#000!important}.c17.gsc538.gsc538h{display:none!important}';
  const st = document.createElement('style'); st.id = 'gsc538css'; st.textContent = css; (document.head || document.documentElement).appendChild(st);
 } catch (e) { fail('css', e); }
 const SEL = '.c17[data-pid^="GSC-"],.c17[data-v^="GSC-"],.c17[data-v^="pc27|GSC-"]';
 // pack reveals draw player cards with no id on them: know a Good Stick card by its art (same art = same kit)
 let artSet = null;
 function arts() {
  if (artSet && artSet.size) return artSet;
  artSet = new Set();
  try { for (const pid of realIds()) { const cid = V27.cardItem(pid); const u = V17.iconUrl(cid); if (u) artSet.add(u); } } catch (e) { fail('arts', e); }
  return artSet;
 }
 function deco(root) {
  if (off() || !root || !root.querySelectorAll) return;
  const list = [ ...(root.matches && root.matches(SEL) ? [ root ] : root.querySelectorAll(SEL)) ];
  const rel = released();
  if (rel && W.V27 && V27.cardItem) {
   const cand = root.matches && root.matches('.c17') ? [ root ] : root.querySelectorAll('.c17:not([data-pid]):not([data-v])');
   if (cand.length) {
    const A = arts();
    for (const el of cand) { const im = el.querySelector('.art img'); if (im && A.has(im.getAttribute('src')) && list.indexOf(el) < 0) { el.__gc538 = 1; list.push(el); } }
   }
  }
  for (const el of list) {
   const pid = el.__gc538 ? 'GSC-0' : gscBase(el.getAttribute('data-pid') || el.getAttribute('data-v'));
   if (!pid) continue;
   if (isFiller(pid)) { el.classList.add('gsc538', 'gsc538h'); continue; }
   if (!rel || el.classList.contains('gsc538')) continue;
   el.classList.add('gsc538', 'rx486');
   if (!el.querySelector('.gsc538t')) { const t = document.createElement('i'); t.className = 'tag2311 gsc538t'; t.textContent = 'COLLAB'; el.insertBefore(t, el.firstChild); }
   if (!el.querySelector('.by486')) { const rr = el.querySelector('.rr'); const b = document.createElement('div'); b.className = 'by486'; b.textContent = 'by The Good Stick Co.'; if (rr) rr.insertAdjacentElement('afterend', b); }
  }
 }
 S.deco = deco;
 try {
  const mo = new MutationObserver(ms => { if (off()) return; for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) deco(n); });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true }); deco(document.body); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
 } catch (e) { fail('observer', e); }

 // late-loaded wrappers (files that re-wrap V22 / V27 after us): re-assert once things settle
 let n = 0;
 const iv = setInterval(() => { n++; try { wrapGrant(); wrapOwned(); [ 'playersHtml', 'popHtml' ].forEach(wrapRender); wrapV27(); } catch (e) {} if (n > 20) clearInterval(iv); }, 1500);
})();
