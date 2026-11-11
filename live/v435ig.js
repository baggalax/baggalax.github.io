(function() {
 'use strict';
 // v435ig: an item put on an ULTIMATE card (U_<id>) - or an ALL AMERICAN (AA25-<id>) /
 // BAGGATWAAN (TW25-<id>) card - stays on THAT card. The regular player <id> no longer
 // borrows it. Before this, v35ag.js layered every variant card's items onto the plain
 // player, so the ultimate's glow stick showed up on the regular guy on his pro team.
 // Kill switch: window.__rl_no435ig = true -> exactly today's behaviour.
 // Optional: window.__rl_435ig_ultonly = true -> only ultimates are split (AA/TW keep layering).
 // Card items already live under the card's own id in rl_v28.cequip (U_<id> etc.), so nothing
 // has to move. The only write is a one-time cleanup of silent copies (see migrate() below),
 // recorded with a backup in rl_v435ig. Inventory and other rl_* keys are never touched.
 const LOG = {
  wrap: false,
  calls: 0,
  blocked: 0,
  err: []
 };
 const off = () => !!window.__rl_no435ig || !!window.__rl_v124gb;
 const err = (e, w) => {
  try {
   LOG.err.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.err.length > 20) LOG.err.shift();
  } catch (x) {}
 };
 const UPFX = () => window.ULT331 && ULT331.PFX || 'U_';
 // is this id a separate card version of a base player?
 function isSep(id) {
  if (typeof id !== 'string') return false;
  if (id.indexOf(UPFX()) === 0 && id.length > UPFX().length) return true;
  if (window.__rl_435ig_ultonly) return false;
  return /^(AA25|TW25)-./.test(id);
 }
 // the plain player behind a draft copy (CD36-<id>), same mapping v36dr.js uses
 function drMap(pid) {
  try {
   if (window.DR36 && DR36.isC && DR36.srcOf && DR36.isC(pid)) return DR36.srcOf(pid);
  } catch (e) {}
  return pid;
 }
 function wrap() {
  const V = window.V28;
  if (!V || typeof V.cardGear !== 'function') return false;
  const CUR = V.cardGear;
  if (CUR.__ig435) return true;
  const RAW = typeof CUR.__orig === 'function' ? CUR.__orig : null;
  const NG = function(pid) {
   LOG.calls++;
   // v35ag not in the chain, or its own kill switch on: nothing is layered, keep the chain
   if (off() || !RAW || !CUR.__ag35 || window.__rl_no35ag || typeof pid !== 'string') return CUR.apply(this, arguments);
   try {
    const p = drMap(pid), own = RAW.call(this, p);
    // what v35ag would have added: only from variants that are NOT their own card
    let o = null;
    const vs = window.V35AG && V35AG.variants ? V35AG.variants(p) : [];
    for (const v of vs) {
     if (isSep(v)) {
      try {
       if (RAW.call(this, v)) LOG.blocked++;
      } catch (e) {}
      continue;
     }
     const e = RAW.call(this, v);
     if (e && typeof e === 'object') {
      if (!o) o = Object.assign({}, own || {});
      for (const k of Object.keys(e)) if (e[k]) o[k] = e[k];
     }
    }
    if (!o) return own;
    return Object.keys(o).length ? o : own;
   } catch (e) {
    err(e, 'cg');
    return CUR.apply(this, arguments);
   }
  };
  for (const k of Object.keys(CUR)) NG[k] = CUR[k];
  NG.__ig435 = true;
  NG.__prev435 = CUR;
  V.cardGear = NG;
  LOG.wrap = true;
  return true;
 }
 if (!wrap()) {
  let n = 0;
  const iv = setInterval(() => {
   if (wrap() || ++n > 200) clearInterval(iv);
  }, 25);
 }

 // One-time repair of old saves (runs once, logged in rl_v435ig, never wipes anything).
 // While the bug was live, the regular player's GEAR screen showed the card's items as if
 // they were his, and equipping anything there saved a silent COPY of the card's items onto
 // the regular player too. Rule: if a regular player's own slot holds exactly the same item as
 // the same slot on his ultimate/AA/BAGGATWAAN card, that copy is taken off the regular
 // player (it stays on the card, where it was put; the item never leaves the locker).
 // Anything else he put on the regular player stays on the regular player.
 const baseOf = id => {
  const P = UPFX();
  if (typeof id !== 'string') return null;
  if (id.indexOf(P) === 0) return id.slice(P.length);
  const m = /^(AA25|TW25)-(.+)$/.exec(id);
  return m ? m[2] : null;
 };
 function migrate() {
  if (off()) return null;
  const LSx = typeof LS !== 'undefined' ? LS : null;
  if (!LSx || !window.V17 || !V17.ST || !window.V28 || !V28.st) return null;
  let rec = null;
  try {
   rec = LSx.get('v435ig', null);
  } catch (e) {}
  if (rec && rec.v >= 1) return rec;
  const ST = V17.ST(), C = V28.st() && V28.st().cequip || {};
  const out = {
   v: 1,
   at: Date.now(),
   moved: [],
   backup: {}
  };
  const stores = [ [ 'equip', ST.equip ], [ 'wequip', ST.wequip ], [ 'mequip', ST.mequip ] ];
  for (const t of Object.keys(ST.tequip || {})) stores.push([ 'tequip.' + t, ST.tequip[t] ]);
  for (const cid of Object.keys(C)) {
   if (!isSep(cid)) continue;
   const b = baseOf(cid), ce = C[cid];
   if (!b || !ce || typeof ce !== 'object') continue;
   for (const [nm, st] of stores) {
    const e = st && typeof st === 'object' ? st[b] : null;
    if (!e || typeof e !== 'object') continue;
    for (const k of Object.keys(e)) if (e[k] && ce[k] === e[k]) {
     if (!out.backup[nm + '|' + b]) out.backup[nm + '|' + b] = Object.assign({}, e);
     out.moved.push({
      store: nm,
      pid: b,
      slot: k,
      item: e[k],
      keptOn: cid
     });
     delete e[k];
    }
    if (!Object.keys(e).length) delete st[b];
   }
  }
  try {
   if (out.moved.length && V17.save) V17.save();
  } catch (e) {
   err(e, 'save');
  }
  try {
   LSx.set('v435ig', out);
  } catch (e) {
   err(e, 'rec');
  }
  LOG.mig = out.moved.length;
  return out;
 }
 try {
  migrate();
 } catch (e) {
  err(e, 'mig');
 }
 window.V435IG = {
  migrate: migrate,
  LOG: LOG,
  isSep: isSep,
  on: () => !off()
 };
})();
