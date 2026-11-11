(function() {
 'use strict';
 const off = () => !!(window.__rl_no40odds || window.__rl_v124gb);
 if (off()) {
  window.V40O = {
   on: () => false
  };
  return;
 }
 const GOOD_OVR = 92, GOOD_P = .0686, SPECIAL_P = 1 / 40;
 const CAP = {
  ovr: 91,
  spd: 94,
  pow: 95,
  acc: 95,
  fin: 95,
  stk: 97,
  str: 95,
  def: 94,
  gb: 93,
  fo: 89,
  sav: 89
 };
 const SPID = 'CU30-BAGGA02M01MRp_BAGGA';
 const SPR = {
  spd: 97,
  pow: 97,
  acc: 97,
  fin: 97,
  stk: 97,
  str: 97,
  def: 96,
  gb: 92,
  fo: 74,
  sav: 30
 };
 const SPKIT = {
  jersey: '#1b1b20',
  trim: '#ffcc33',
  helm: '#ffcc33'
 };
 const SP_PACKS = {
  pc38c: 1,
  pc38r: 1,
  pc38l: 1,
  cu38: 1
 };
 const LOG = {
  leg: [],
  sp: [],
  cap: []
 };
 const lg = (a, o) => {
  a.push(o);
  if (a.length > 300) a.shift();
 };
 const rnd = () => (typeof window.__rl_40rnd === 'function' ? window.__rl_40rnd : Math.random)();
 const W = {
  A: {
   fin: .25,
   acc: .2,
   stk: .2,
   str: .15,
   pow: .1,
   spd: .1
  },
  M: {
   pow: .2,
   acc: .15,
   spd: .15,
   stk: .15,
   str: .15,
   fin: .1,
   def: .1
  },
  D: {
   def: .45,
   gb: .2,
   spd: .15,
   str: .1,
   stk: .1
  },
  LSM: {
   def: .35,
   gb: .3,
   spd: .2,
   stk: .15
  },
  FO: {
   fo: .6,
   gb: .25,
   spd: .15
  },
  G: {
   sav: .8,
   stk: .2
  }
 };
 const isC30 = id => typeof id === 'string' && id.startsWith('CU30-');
 const owned = pid => {
  try {
   return !!(window.V22 && V22.owned(pid));
  } catch (e) {
   return false;
  }
 };
 function capR(pos, r0, ovr0) {
  const w = W[pos] || W.M, ks = Object.keys(w).sort((a, b) => w[b] - w[a]);
  let need = ovr0 > CAP.ovr;
  for (const k in CAP) if (k !== 'ovr' && r0[k] > CAP[k]) need = true;
  if (!need) return null;
  const o = Object.assign({}, r0);
  for (const k in CAP) if (k !== 'ovr' && o[k] > CAP[k]) o[k] = CAP[k];
  const tgt = Math.min(ovr0, CAP.ovr);
  for (let i = 0; i < 3e3; i++) {
   const ov = ovrOf({
    pos: pos,
    r: o
   });
   if (ov === tgt) break;
   if (ov > tgt) {
    let b = null;
    for (const k of ks) if (o[k] > 30 && (b == null || o[k] > o[b])) b = k;
    if (!b) break;
    o[b]--;
   } else {
    let b = null;
    for (const k of ks) if (o[k] < Math.min(CAP[k] || 99, 99) && (b == null || o[k] < o[b])) b = k;
    if (!b) break;
    o[b]++;
   }
  }
  return o;
 }
 function special(p) {
  p.r = Object.assign({}, p.r, SPR);
  p.ovr = ovrOf(p);
  p.n = 'MR. BAGGA';
  p.c30br = true;
  p.sp40 = 1;
 }
 function fix(id) {
  const p = typeof PLAYERS !== 'undefined' && PLAYERS[id];
  if (!p || !p.c30 || p.cap40) return p;
  p.cap40 = 1;
  if (id === SPID) {
   special(p);
   return p;
  }
  const o = capR(p.pos, p.r, p.ovr);
  if (o) {
   const was = p.ovr;
   p.r = o;
   p.ovr = ovrOf(p);
   lg(LOG.cap, {
    id: id,
    was: was,
    now: p.ovr
   });
  }
  return p;
 }
 function sweep() {
  try {
   for (const id in PLAYERS) if (isC30(id)) fix(id);
  } catch (e) {}
 }
 let GRP = null;
 function groups() {
  if (GRP) return GRP;
  const P = V27.pool(), L = (P.by[2] || []).filter(pid => !isC30(pid));
  GRP = {
   good: L.filter(pid => PP(pid).ovr >= GOOD_OVR),
   rest: L.filter(pid => PP(pid).ovr < GOOD_OVR)
  };
  GRP.isGood = new Set(GRP.good);
  return GRP;
 }
 function legPass(kind, cards) {
  if (!window.V27 || !V27.pool || !V27.cardItem || !window.V22 || !V22.rarOf) return 0;
  const BY = V17.BY, G = groups();
  let n = 0;
  const inPack = new Set;
  for (const id of cards) {
   const it = BY[id];
   if (it && it.pc27) inPack.add(it.pc27);
  }
  for (let i = 0; i < cards.length; i++) {
   const it = BY[cards[i]];
   if (!it || !it.pc27) continue;
   const pid = it.pc27;
   if (isC30(pid) || V22.rarOf(pid) !== 2 || !(G.isGood.has(pid) || G.rest.includes(pid))) continue;
   const wantGood = rnd() < GOOD_P, fresh = L => L.filter(x => !owned(x) && !inPack.has(x));
   let L = fresh(wantGood ? G.good : G.rest);
   if (!L.length) L = fresh(wantGood ? G.rest : G.good);
   if (!L.length) continue;
   const np = L[Math.floor(rnd() * L.length) % L.length];
   inPack.delete(pid);
   inPack.add(np);
   cards[i] = V27.cardItem(np);
   n++;
   lg(LOG.leg, {
    kind: kind,
    from: pid,
    to: np,
    good: G.isGood.has(np)
   });
  }
  return n;
 }
 function spTag(ci) {
  const it = window.V17 && V17.BY && V17.BY[ci];
  if (!it) return;
  const p = PP(SPID);
  it.c30 = 1;
  it.sp40 = 1;
  it.n = 'MR. BAGGA';
  it.role27 = 'MIDFIELD - OVR ' + (p ? p.ovr : 97);
  it.d = 'SUPER RARE CUSTOM CARD (ABOUT 1 PACK IN 40) - MR. BAGGA, MIDFIELD, OVR ' + (p ? p.ovr : 97) + '. BETTER THAN EVERY REAL PLAYER.';
 }
 function css() {
  if (document.getElementById('v40odds-css')) return;
  const s = document.createElement('style');
  s.id = 'v40odds-css';
  const sel = x => [ '#panel .c17[data-pid="' + SPID + '"]', '#panel .fl17 .c17[aria-label="MR. BAGGA"]' ].map(b => b + x).join(',');
  s.textContent = [ sel('') + '{border-color:#fff1a8;background:linear-gradient(#141414,#000);animation:glow17 1.1s ease-in-out infinite}', sel('::after') + '{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,rgba(255,215,80,.5),transparent 22%,rgba(255,255,255,.35),transparent 50%,rgba(255,200,60,.4),transparent 75%);animation:spin17 2.2s linear infinite;pointer-events:none}', sel(' .art') + '{background:radial-gradient(circle at 50% 40%,#ffe27a,#8a6408 55%,#0a0700);border-color:#ffcc33}', sel(' .rr') + '{color:#ffe14d}', sel(' .role17') + '{color:#fff1a8}', sel(' .nm') + '{flex-direction:column;justify-content:center}', sel(' .nm::before') + '{content:"SUPER RARE";display:block;font-size:6px;letter-spacing:.5px;color:#000;background:linear-gradient(90deg,#ffcc33,#fff6c8,#ffcc33);padding:1px 2px;margin-bottom:1px;white-space:nowrap}' ].join('');
  (document.head || document.documentElement).appendChild(s);
 }
 function spCard() {
  if (!window.C30 || !C30.make || !C30.on || !C30.on()) return null;
  const p = C30.make(SPID);
  if (!p) return null;
  fix(SPID);
  const ci = V27.cardItem(SPID);
  spTag(ci);
  return ci;
 }
 function spPass(kind, cards) {
  if (!SP_PACKS[kind] || owned(SPID)) return null;
  for (const id of cards) {
   const it = V17.BY[id];
   if (it && it.pc27 === SPID) return null;
  }
  if (rnd() >= SPECIAL_P) return null;
  const ci = spCard();
  if (!ci) return null;
  cards.push(ci);
  lg(LOG.sp, {
   kind: kind,
   t: Date.now()
  });
  return ci;
 }
 function install() {
  if (!window.V38P || !V38P.noRepeat || V38P.noRepeat.v40) return false;
  const nr0 = V38P.noRepeat;
  const nr = function(kind, cards) {
   const n = nr0.apply(this, arguments);
   try {
    if (!off() && window.V17 && V17.BY && Array.isArray(cards)) {
     legPass(kind, cards);
     spPass(kind, cards);
    }
   } catch (e) {
    console.error(e);
   }
   return n;
  };
  nr.v40 = 1;
  V38P.noRepeat = nr;
  if (window.C30) {
   if (C30.make && !C30.make.v40) {
    const m0 = C30.make;
    const m = function(id) {
     const p = m0.apply(this, arguments);
     try {
      if (p) fix(id);
     } catch (e) {}
     return p;
    };
    m.v40 = 1;
    C30.make = m;
   }
   if (C30.kit && !C30.kit.v40) {
    const k0 = C30.kit;
    const k = function(pid) {
     if (pid === SPID && !off()) return SPKIT;
     return k0.apply(this, arguments);
    };
    k.v40 = 1;
    C30.kit = k;
   }
  }
  if (window.V27 && V27.cardItem && !V27.cardItem.v40) {
   const c0 = V27.cardItem;
   const c = function(pid) {
    try {
     if (isC30(pid)) fix(pid);
    } catch (e) {}
    const ci = c0.apply(this, arguments);
    try {
     if (pid === SPID) spTag(ci);
    } catch (e) {}
    return ci;
   };
   c.v40 = 1;
   V27.cardItem = c;
  }
  css();
  if (window.V22 && V22.grantIds && !V22.grantIds.v40) {
   const g0 = V22.grantIds;
   const g = function(ids) {
    try {
     for (const id of ids || []) if (isC30(id)) fix(id);
    } catch (e) {}
    const out = g0.apply(this, arguments);
    sweep();
    return out;
   };
   g.v40 = 1;
   V22.grantIds = g;
  }
  sweep();
  setInterval(sweep, 500);
  return true;
 }
 install();
 window.V40O = {
  on: () => !off(),
  GOOD_OVR: GOOD_OVR,
  GOOD_P: GOOD_P,
  SPECIAL_P: SPECIAL_P,
  CAP: CAP,
  SPID: SPID,
  SPR: SPR,
  SPKIT: SPKIT,
  SP_PACKS: SP_PACKS,
  LOG: LOG,
  capR: capR,
  fix: fix,
  sweep: sweep,
  groups: groups,
  legPass: legPass,
  spPass: spPass,
  spCard: spCard,
  install: install
 };
})();
