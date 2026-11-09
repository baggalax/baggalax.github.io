(function() {
 'use strict';
 const off = () => !!(window.__rl_no42crew || window.__rl_v124gb);
 const LOG = {
  swap: [],
  pay: []
 };
 const lg = (a, o) => {
  a.push(o);
  if (a.length > 300) a.shift();
 };
 const ready = () => !!(window.V17 && V17.BY && V17.I && V17.ST && V17.PACKS);
 function okPool(x) {
  if (!x || x.trophy || x.st28 || x.tew25 || x.b35 || x.hw || x.b2504 || x.leg20 || x.start || x.j1 || x.pc27 || x.sec === 'uni21') return false;
  if (x.s16 && !(V17.hw16 && V17.hw16.s16on && V17.hw16.s16on())) return false;
  try {
   if (V17.vis16 && !V17.vis16(x)) return false;
  } catch (e) {}
  return true;
 }
 function pick(L, r) {
  return L[Math.floor(r() * L.length) % L.length];
 }
 function crewPass(kind, cards, r) {
  if (off() || !ready() || !Array.isArray(cards)) return 0;
  r = typeof r === 'function' ? r : Math.random;
  const ST = V17.ST(), BY = V17.BY, has = id => ((ST.inv || {})[id] || 0) > 0, P = V17.PACKS[kind] || {}, crewOnly = P.cat === 'crew';
  const kept = new Set;
  let n = 0, pay = 0;
  for (let i = 0; i < cards.length; i++) {
   const id = cards[i], it = BY[id];
   if (!it || !it.crew) continue;
   if (!has(id) && !kept.has(id)) {
    kept.add(id);
    continue;
   }
   const taken = new Set(cards), free = x => !taken.has(x.id) && !has(x.id);
   let L = V17.I.filter(x => x.crew && x.rar === it.rar && okPool(x) && free(x)), why = 'crew same rarity';
   if (!L.length && !crewOnly) {
    const base = V17.I.filter(x => x.rar === it.rar && okPool(x) && !x.crew && x.id !== 'stick_reg' && (x.sec === 'celly' || x.sec === 'chirp' || x.slot && x.sec !== 'tape'));
    L = base.filter(free);
    why = 'pack card same rarity';
    if (!L.length) {
     L = base.filter(x => x.slot && x.sec !== 'celly' && !taken.has(x.id));
     why = 'gear stack';
    }
   }
   if (!L.length) {
    const order = [ it.rar - 1, it.rar - 2, it.rar + 1, it.rar + 2 ].filter(q => q >= 0 && q <= 2);
    for (const q of order) {
     L = V17.I.filter(x => x.crew && x.rar === q && okPool(x) && free(x));
     if (L.length) {
      why = 'crew rarity ' + q;
      break;
     }
    }
   }
   if (L.length) {
    const x = pick(L, r);
    cards[i] = x.id;
    if (x.crew) kept.add(x.id);
    n++;
    lg(LOG.swap, {
     kind: kind,
     from: id,
     to: x.id,
     why: why
    });
   } else {
    kept.add(id);
    pay += V17.sell232 ? V17.sell232(it.rar) : 1;
    lg(LOG.pay, {
     kind: kind,
     id: id
    });
   }
  }
  if (pay > 0 && V17.dd232on && V17.dd232on() && V17.give232) {
   try {
    V17.give232(pay);
   } catch (e) {
    console.error(e);
   }
  }
  return n;
 }
 function install() {
  if (!window.V38P || typeof V38P.noRepeat !== 'function' || V38P.noRepeat.v42) return !!(window.V38P && V38P.noRepeat && V38P.noRepeat.v42);
  const nr0 = V38P.noRepeat;
  const nr = function(kind, cards, r) {
   const out = nr0.apply(this, arguments);
   try {
    crewPass(kind, cards, r);
   } catch (e) {
    console.error(e);
   }
   return out;
  };
  for (const k of Object.keys(nr0)) nr[k] = nr0[k];
  nr.v42 = 1;
  V38P.noRepeat = nr;
  return true;
 }
 install();
 window.V42C = {
  on: () => !off(),
  LOG: LOG,
  crewPass: crewPass,
  install: install
 };
})();
