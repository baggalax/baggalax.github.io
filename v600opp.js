// ===== BAGGA LAX v600opp.js - 1.5 B69: ONLINE OPPONENTS SEE YOUR CUSTOM CARDS =====
// Bug:   v590ll myPublic() sent the card team as ids only; on the other phone regRemote() kept only ids it knows (PP(id)),
//        so custom / UGC cards (made on your phone only) vanished from your team on his screen.
// Fix:   myPublic adds a compact card def `d` to entries whose player the other phone can't rebuild by itself (not a real
//        roster card, not a C30 / honors / ultimate id that every phone builds from the id): its own card name (filtered),
//        pos, ratings, skin, braid, number. regRemote turns a def into a temporary remote player 'rx:<id>' (in PLAYERS for
//        the match only: never in your collection, inventory or saves). Names go through RK15.cname (bad-word filter ->
//        *****) and are capped at 16; ratings are clamped 0..99 and the overall to 94 (the top custom card band).
//        Edit Names renames stay private (Charlie): only the card's own name is sent.
//        Old clients: no `d` -> today's behaviour (unknown ids dropped); an old receiver ignores the extra field.
// Kill switch: window.__rl_no600opp
(function () {
 'use strict';
 const Wn = window;
 const off = () => !!Wn.__rl_no600opp;
 const LOG = { out: 0, made: 0, bytes: 0, err: [] };
 const SK = [ 'spd', 'pow', 'acc', 'fin', 'stk', 'str', 'def', 'gb', 'fo', 'sav' ];
 const PP0 = id => { try { return typeof PP === 'function' ? PP(id) : null; } catch (e) { return null; } };
 const rebuildable = id => { try { if (/^CU30-/.test(id)) return true; if (Wn.HON25 && HON25.kindOf && HON25.kindOf(id)) return true; if (Wn.ULT331 && ULT331.isU && ULT331.isU(id)) return true; } catch (e) {} return false; };
 const cname = s => { try { return (Wn.RK15 && RK15.cname ? RK15.cname(s) : String(s || '').toUpperCase()).slice(0, 16); } catch (e) { return 'PLAYER'; } };
 // sender: the def for one card (null = the other phone has it already)
 function out(id, entry) {
  if (off()) return entry;
  try {
   const p = PP0(id);
   if (!p || p.real === true || rebuildable(id)) return entry;
   const r = {}; for (const k of SK) r[k] = Math.max(0, Math.min(99, (p.r && p.r[k]) | 0));
   const d = { n: String(p.n0 || p.n || 'PLAYER').slice(0, 24), p: p.pos, r: SK.map(k => r[k]), s: p.skin | 0 };
   if (p.c30br) d.b = 1;
   const num = p.num != null ? p.num : p.no; if (num != null && isFinite(+num)) d.u = Math.max(0, Math.min(99, +num | 0));
   entry.d = d; LOG.out++;
  } catch (e) { if (LOG.err.length < 10) LOG.err.push('out ' + e); }
  return entry;
 }
 // receiver: an id this phone doesn't know + a def -> 'rx:<id>'
 const POS = new Set([ 'A', 'M', 'D', 'LSM', 'SSDM', 'FO', 'G' ]);
 function inId(e, mk) {
  const id = e && e.id;
  try { if (!id || mk(id) || off() || !e.d || typeof e.d !== 'object') return id; } catch (x) { return id; }
  try {
   const d = e.d, pos = POS.has(d.p) ? d.p : 'M', rid = 'rx:' + String(id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
   if (!Array.isArray(d.r)) return id;
   const r = {}; SK.forEach((k, i) => { r[k] = Math.max(0, Math.min(99, +d.r[i] | 0)); });
   const p = { id: rid, n: cname(d.n || 'PLAYER'), pos: pos, r: r, real: false, team: 'RX600', rx600: 1, skin: Math.max(0, Math.min(9, d.s | 0)) };
   p.n0 = p.n;
   if (d.b) p.c30br = true;
   if (d.u != null) p.num = Math.max(0, Math.min(99, d.u | 0));
   // legal ranges: no 99-everything card - pull the strongest ratings down until the overall is in the top custom band
   for (let i = 0; i < 400 && ovrOf(p) > 94; i++) { const k = SK.slice().sort((a, b) => r[b] - r[a])[0]; r[k] = Math.max(0, r[k] - 1); }
   p.ovr = ovrOf(p);
   PLAYERS[rid] = p; LOG.made++;
   ALIAS[rid] = id;
   return rid;
  } catch (x) { if (LOG.err.length < 10) LOG.err.push('in ' + x); return id; }
 }
 const ALIAS = {};
 Wn.OPP600 = { out: out, inId: inId, alias: ALIAS, LOG: LOG };
})();
