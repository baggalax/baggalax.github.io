(function() {
 'use strict';
 const off = () => !!(window.__rl_no38p || window.__rl_v124gb);
 const v17 = () => !!(window.V17 && V17.BY && V17.PACKS);
 const v22 = () => !!(window.V22 && V22.on && V22.on());
 const c30 = () => !!(window.C30 && C30.on && C30.on());
 const LOG = {
  pack: [],
  reroll: [],
  keep: []
 };
 const lg = (a, o) => {
  a.push(o);
  if (a.length > 300) a.shift();
 };
 const BASIC = [ 88.5, 10.5, 1 ];
 const DEF = {
  cu38: {
   n: 'CUSTOM CARD PACK',
   cost: 65,
   col: '#c060ff',
   lab: 'CUSTOM',
   odds: '5 CUSTOM PLAYER CARDS - 2+ RARES, A LEGENDARY ABOUT EVERY OTHER PACK'
  },
  pc38c: {
   n: 'COMMON PLAYER PACK',
   cost: 40,
   col: '#9aa3ab',
   lab: 'PLAYERS',
   odds: '5 PLAYER CARDS YOU DON\'T HAVE - MOSTLY COMMONS',
   slots: [ BASIC, BASIC, BASIC, BASIC, BASIC ]
  },
  pc38r: {
   n: 'RARE PLAYER PACK',
   cost: 70,
   col: '#3d8bff',
   lab: 'PLAYERS',
   odds: '5 PLAYER CARDS YOU DON\'T HAVE - 1 GUARANTEED RARE (OR BETTER)',
   slots: [ [ 82, 15, 3 ], [ 82, 15, 3 ], [ 82, 15, 3 ], [ 82, 15, 3 ], [ 0, 92, 8 ] ]
  },
  pc38l: {
   n: 'LEGENDARY PLAYER PACK',
   cost: 80,
   col: '#ffcc33',
   lab: 'PLAYERS',
   odds: '5 PLAYER CARDS YOU DON\'T HAVE - 1 GUARANTEED LEGENDARY + BETTER ODDS',
   slots: [ [ 0, 0, 100 ], [ 25, 45, 30 ], [ 25, 45, 30 ], [ 25, 45, 30 ], [ 25, 45, 30 ] ]
  }
 };
 const KEYS = Object.keys(DEF);
 const avail = k => !off() && v17() && v22() && !!window.V27 && !!V27.pool && !!V27.cardItem && (k !== 'cu38' || c30());
 const mine = k => !!DEF[k] && avail(k);
 const rarRoll = (o, r) => {
  const x = r() * 100;
  return x < o[0] ? 0 : x < o[0] + o[1] ? 1 : 2;
 };
 const owned = pid => {
  try {
   return V22.owned(pid);
  } catch (e) {
   return false;
  }
 };
 const isCu = pid => {
  try {
   return !!(window.C30 && C30.isC30(pid));
  } catch (e) {
   return false;
  }
 };
 function rarOrder(rar) {
  return rar === 2 ? [ 2, 1, 0 ] : rar === 1 ? [ 1, 0, 2 ] : [ 0, 1, 2 ];
 }
 function freshPlayer(rar, r, taken) {
  const P = V27.pool();
  for (const q of rarOrder(rar)) {
   const L = (P.by[q] || []).filter(pid => !owned(pid) && !taken.has(pid));
   if (L.length) return L[Math.floor(r() * L.length) % L.length];
  }
  return null;
 }
 function customRars(r) {
  const out = [ 0, 1, 2 ].map(() => r() < .75 ? 0 : 1).concat([ 1, 1 ]);
  if (r() < .5) out[2] = 2;
  return out;
 }
 function makeCustom(rar, taken) {
  for (let g = 0; g < 10; g++) {
   const id = C30.freshId(rar);
   if (!id || taken.has(id.slice(0, 10))) continue;
   if (!C30.make(id)) return null;
   taken.add(id.slice(0, 10));
   const ci = V27.cardItem(id), it = V17.BY[ci], p = PP(id);
   if (it) {
    it.c30 = 1;
    it.d = 'CUSTOM PLAYER CARD - ' + [ 'COMMON', 'RARE', 'LEGENDARY' ][rar] + ' ' + p.pos + ', OVR ' + p.ovr + '. CREATE HIM IN THE LOCKER ROOM: NAME, SKIN, BRAID.';
   }
   return ci;
  }
  return null;
 }
 function open(kind, r) {
  r = typeof r === 'function' ? r : Math.random;
  const out = [];
  if (kind === 'cu38') {
   const taken = new Set;
   for (const rar of customRars(r)) {
    const ci = makeCustom(rar, taken);
    if (ci) out.push(ci);
   }
   lg(LOG.pack, {
    kind: kind,
    r: out.map(ci => V17.BY[ci] && V17.BY[ci].rar)
   });
   return out;
  }
  const taken = new Set, rs = [];
  for (const o of DEF[kind].slots) {
   const rar = rarRoll(o, r);
   let pid = freshPlayer(rar, r, taken);
   if (!pid) {
    const L = V27.pool().by[rar] || V27.pool().ids;
    pid = L[Math.floor(r() * L.length) % L.length];
    lg(LOG.keep, {
     kind: kind,
     pid: pid,
     why: 'all owned'
    });
   }
   if (!pid) continue;
   taken.add(pid);
   out.push(V27.cardItem(pid));
   rs.push(V22.rarOf(pid));
  }
  lg(LOG.pack, {
   kind: kind,
   r: rs
  });
  return out;
 }
 function itemPool(it, P) {
  const ST = V17.ST(), has = id => (ST.inv[id] || 0) > 0;
  const okIt = x => x && x.id !== it.id && !has(x.id) && x.rar === it.rar && !x.trophy && !x.st28 && !x.tew25 && !x.b35 && !x.hw && !x.b2504 && !x.leg20 && !x.start && (!V17.vis16 || V17.vis16(x));
  if (it.sec === 'uni21') {
   const U = window.UNI21;
   if (!U || !U.on || !U.on()) return [];
   const cat = P && P.cat || '', col = (U.col2504 || []).filter(x => V17.BY[x.id]);
   let L;
   if (cat === 'unic') L = col; else if (cat === 'unip' || cat === 'uniw') {
    const ids = new Set((cat === 'unip' ? typeof TEAMS !== 'undefined' ? TEAMS : [] : typeof WTEAMS !== 'undefined' ? WTEAMS : []).map(t => t.id));
    L = U.items().filter(x => x.uni21 && ids.has(x.uni21.tid) && x.uni21.k >= 2 && x.uni21.k <= 6);
   } else L = U.items().concat(col);
   const alt = new Set((U.alt2504 || []).map(x => x.id));
   return L.map(x => V17.BY[x.id] || x).filter(x => okIt(x) && !alt.has(x.id));
  }
  if (it.crew) return V17.I.filter(x => x.crew && okIt(x));
  if (it.sec === 'chirp') return V17.I.filter(x => x.sec === 'chirp' && okIt(x));
  return [];
 }
 function noRepeat(kind, cards, r) {
  if (off() || !v17() || !Array.isArray(cards)) return 0;
  r = typeof r === 'function' ? r : Math.random;
  const ST = V17.ST(), has = id => (ST.inv[id] || 0) > 0, P = V17.PACKS[kind] || {}, BY = V17.BY;
  const seenP = new Set, seenI = new Set;
  let n = 0;
  for (const id of cards) {
   const it = BY[id];
   if (it && it.pc27 && !owned(it.pc27)) seenP.add(it.pc27);
  }
  const firstP = new Set;
  for (let i = 0; i < cards.length; i++) {
   const id = cards[i], it = BY[id];
   if (!it) continue;
   if (it.pc27) {
    const pid = it.pc27;
    if (isCu(pid)) continue;
    if (!owned(pid) && !firstP.has(pid)) {
     firstP.add(pid);
     continue;
    }
    if (!v22() || !window.V27 || !V27.pool) continue;
    const taken = new Set([ ...seenP, ...firstP ]), np = freshPlayer(V22.rarOf(pid), r, taken);
    if (np) {
     cards[i] = V27.cardItem(np);
     firstP.add(np);
     seenP.add(np);
     n++;
     lg(LOG.reroll, {
      kind: kind,
      from: pid,
      to: np
     });
    } else lg(LOG.keep, {
     kind: kind,
     pid: pid
    });
    continue;
   }
   if (it.crew || it.sec === 'uni21' || it.sec === 'chirp') {
    if (!has(id) && !seenI.has(id)) {
     seenI.add(id);
     continue;
    }
    const L = itemPool(it, P).filter(x => !seenI.has(x.id) && !cards.includes(x.id));
    if (L.length) {
     const x = L[Math.floor(r() * L.length) % L.length];
     cards[i] = x.id;
     seenI.add(x.id);
     n++;
     lg(LOG.reroll, {
      kind: kind,
      from: id,
      to: x.id
     });
    } else {
     seenI.add(id);
     lg(LOG.keep, {
      kind: kind,
      id: id
     });
    }
   }
  }
  return n;
 }
 const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 function shopHtml(coinHtml) {
  if (off() || !v17()) return '';
  const ST = V17.ST(), ks = KEYS.filter(mine);
  if (!ks.length) return '';
  return '<div class="sh17 spt17" id="v38packs">PLAYER CARD PACKS <span>ONLY PLAYER CARDS - 5 CARDS - NEVER ONE YOU ALREADY HAVE (CUSTOM CARDS CAN REPEAT)</span></div><div class="shop17 sp17">' + ks.map(k => {
   const P = V17.PACKS[k], fp = ST.freePacks && ST.freePacks[k] || 0, ok = fp > 0 || ST.chinos >= P.cost;
   let img = '';
   try {
    img = V17.packUrl(k);
   } catch (e) {}
   return '<div class="spk17 ' + k + '"><img alt="" src="' + img + '"><b>' + esc(P.n) + '</b><small>' + esc(DEF[k].odds) + '</small><button type="button" data-a="v17buy" data-v="' + k + '" class="' + (fp > 0 ? 'y' : ok ? '' : 'd') + '" aria-label="BUY ' + esc(P.n) + '">' + (fp > 0 ? 'OPEN FREE (' + fp + ')' : coinHtml + P.cost) + '</button></div>';
  }).join('') + '</div>';
 }
 const art = k => mine(k) ? {
  col: DEF[k].col,
  lab: DEF[k].lab
 } : null;
 function install() {
  if (off() || !v17()) return false;
  for (const k of KEYS) if (avail(k) && !V17.PACKS[k]) V17.PACKS[k] = {
   n: DEF[k].n,
   cost: DEF[k].cost,
   cat: 'v38',
   v38: 1,
   slots: (DEF[k].slots || [ BASIC, BASIC, BASIC, BASIC, BASIC ]).map(s => s.slice())
  };
  return true;
 }
 install();
 window.V38P = {
  on: () => !off(),
  mine: mine,
  open: open,
  noRepeat: noRepeat,
  shopHtml: shopHtml,
  art: art,
  install: install,
  DEF: DEF,
  KEYS: KEYS,
  LOG: LOG,
  customRars: customRars
 };
})();
