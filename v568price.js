/* v568price.js - Dime prices set from the Live-Ops website (Bagga Lax 1.4, Nov 2026). Kill switch: window.__rl_no568price = true.
 * Charlie: change how many dimes shop items and packs cost from the shop website (config/admin.html -> liveops.json "price").
 * Only in-game dimes. Real-money (App Store / Play) prices are not touched here.
 * 1. Safety limits: a price from the website is rounded and kept between 25% and 10x the normal price (never under 1, never over 5000).
 *    Free things (daily pack) stay free. A bad / missing number = normal price.
 * 2. Every pack that charges V17.PACKS[k].cost (base packs, Sky Chrome / Gold Crown bundles, Veterans, Turkey Trotters) and the
 *    Halloween pack now use the website price; the tile shows the same number it charges. Relax Pal, Season Pass and
 *    The Whale or the Crown read it through LIVEOPS.price (small edits in items17.js / v445fit.js). Good Stick already did.
 * No ids, rl_ keys or net changes. */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_v568_loaded) return;
 W.__rl_v568_loaded = 1;
 const LOG = W.V568P = { n: 0, errs: [], applied: {} };
 const off = () => !!W.__rl_no568price;
 const fail = (w, e) => { if (LOG.errs.length < 20) LOG.errs.push(w + ': ' + String(e && e.message || e).slice(0, 140)); };
 // live-ops shop id -> V17.PACKS key (base packs come from LIVEOPS.PACK_META too)
 const KEYS = { pack_b2504c: 'b2504c', pack_b2504l: 'b2504l', pack_vets489: 'vets489', pack_turkey565: 'tk565' };
 const base = {}; // normal price per live-ops id (before any website price)
 let defs = null;
 function defaults() {
  if (defs) return defs;
  defs = {};
  try { (W.LIVEOPS.catalog() || []).forEach(c => { if (c && c.id && c.price != null) defs[c.id] = +c.price; }); } catch (e) { fail('cat', e); defs = null; return {}; }
  return defs;
 }
 function clampFor(id, p) {
  if (p == null || !isFinite(+p)) return null;
  const d = base[id] != null ? base[id] : defaults()[id];
  if (d === 0) return null;                       // free stays free
  let v = Math.round(+p);
  if (d > 0) v = Math.max(Math.max(1, Math.ceil(d / 4)), Math.min(Math.min(5000, d * 10), v));
  else v = Math.max(1, Math.min(5000, v));
  return v;
 }
 LOG.clamp = clampFor;
 function hookPrice() {
  const L = W.LIVEOPS;
  if (!L || typeof L.price !== 'function' || L.price.__v568) return !!(L && L.price && L.price.__v568);
  const p0 = L.price;
  const f = function (id) {
   const r = p0.apply(this, arguments);
   if (off()) return r;
   try { return clampFor(id, r); } catch (e) { fail('clamp', e); return null; }
  };
  f.__v568 = 1;
  L.price = f;
  return true;
 }
 function packMap() {
  const m = Object.assign({}, KEYS);
  try { Object.keys(W.LIVEOPS.PACK_META || {}).forEach(id => { m[id] = id.replace(/^pack_/, ''); }); } catch (e) {}
  return m;
 }
 function apply() {
  const L = W.LIVEOPS, P = W.V17 && V17.PACKS;
  if (!L || !P || !L.ready) return;
  const m = packMap();
  for (const id in m) {
   const k = m[id], pk = P[k];
   if (!pk || pk.cost == null) continue;
   if (base[id] == null) base[id] = defaults()[id] != null ? defaults()[id] : pk.cost;
   const p = off() ? null : L.price(id);
   let want = pk.cost;
   if (p != null) { if (!pk.__s568) { pk.__c568 = pk.cost; pk.__s568 = 1; } want = p; }
   else if (pk.__s568) { want = pk.__c568; pk.__s568 = 0; }
   if (pk.cost !== want) { pk.cost = want; LOG.n++; }
   LOG.applied[id] = want;
  }
  try {
   const H = V17.hw16 && V17.hw16.pack;
   if (H && H.cost != null) {
    if (base.pack_halloween == null) base.pack_halloween = defaults().pack_halloween != null ? defaults().pack_halloween : H.cost;
    const p = off() ? null : L.price('pack_halloween');
    if (p != null) { if (!H.__s568) { H.__c568 = H.cost; H.__s568 = 1; } H.cost = p; }
    else if (H.__s568) { H.cost = H.__c568; H.__s568 = 0; }
    LOG.applied.pack_halloween = H.cost;
   }
  } catch (e) { fail('hw', e); }
 }
 LOG.apply = apply;
 function tick() {
  try { if (hookPrice()) apply(); } catch (e) { fail('tick', e); }
 }
 tick();
 setInterval(tick, 1000);
})();
