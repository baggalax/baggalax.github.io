// ===== BAGGA LAX v600crew74.js - 1.5 B74: LOCKER LEAGUE = 1 CREW CARD, ON THE BENCH TOO =====
// Bug (Charlie, ranked on 2 phones): the bench showed his WHOLE crew, but a Locker League match allows 1 crew card.
// Cause: items17 drawSidelineCrew18 draws every equipped crew slot (ST.crew) next to YOUR bench in any match, and the online
//   lobby payload (V17.lobPay -> items17's own myLoadout) sent the whole crew too, so the other phone (which may run the
//   match) used all of them for your side, while your own phone used only the 1 Locker League card (v590ll myLoadout).
// Fix: in a Locker League match (ranked vs a player, vs a CPU bot, and the CPU takeover after a player left):
//   - your bench shows only your 1 Locker League crew card; the opponent's bench shows their 1 card (from their lobby
//     payload, or the bot team's card), on both phones;
//   - the lobby payload carries only that 1 card, at the same Locker League value as v590ll (both phones the same).
//   Offline modes are unchanged. Kill switch: window.__rl_no74crew
(function () {
 'use strict';
 const Wn = window, off = () => !!Wn.__rl_no74crew || !Wn.V17;
 const LL = () => Wn.RK15LL || null;
 const llGame = G => !!(G && (G.meta && G.meta.ll15 || G.online && Wn.RLNET && RLNET.st && RLNET.st.ll15));
 const lvlOf = id => { const it = V17.BY[id]; return (+String(id).split('_').pop()) || (it && it.rar | 0) || 0; };
 const K = () => (LL() && LL().CREW_K) || 0.6;
 const myCrew = () => { try { const id = LL() && LL().store && LL().store.crew; return id && V17.BY[id] && V17.BY[id].crew ? id : null; } catch (e) { return null; } };
 // 1) the lobby payload: just the 1 card (only while a ranked room is being set up)
 if (typeof V17.lobPay === 'function' && !V17.lobPay.__c74) {
  const lp0 = V17.lobPay;
  const lp1 = function (tid) {
   const r = lp0.apply(this, arguments);
   try {
    const P = LL() && LL().pvp;
    if (!off() && P && Wn.RLNET && RLNET.code === P.code) {
     const id = myCrew(), c = {};
     if (id) c[V17.BY[id].crew] = (lvlOf(id) + 1) * K() - 1;
     if (r) r.crew = c; else if (id) return { gear: {}, crew: c, cel: {}, f: .25 };
    }
   } catch (e) {}
   return r;
  };
  lp1.__c74 = 1; V17.lobPay = lp1;
 }
 // the opponent's 1 card: their payload (value -> level), or the CPU bot team's card
 function oppCrew(G) {
  if (G.__oc74 !== undefined) return G.__oc74;
  let id = null;
  try {
   const t = SZ_REG[G.opp]; if (t && t.crew600 && V17.BY[t.crew600]) id = t.crew600;
   const n = Wn.RLNET, st = n && n.st;
   if (!id && st && st.ll15 && n.side) {
    const o = n.side === 'h' ? 'g' : 'h', c = st[o + '17'] && st[o + '17'].crew, slot = c && Object.keys(c)[0];
    if (slot) { const lvl = Math.max(0, Math.round((+c[slot] + 1) / K() - 1)); const cand = [ 'crew_' + slot + '_' + lvl, 'crew_' + slot + '_' + Math.min(2, lvl) ]; id = cand.find(x => V17.BY[x] && V17.BY[x].crew) || Object.keys(V17.BY).find(x => V17.BY[x].crew === slot) || null; }
   }
  } catch (e) { id = null; }
  if (id || (G.online === false && G.cpu15)) G.__oc74 = id; // keep it through the CPU takeover (the room is gone then)
  return id;
 }
 // 2) the bench: draw with only the 1 card (own side), then the opponent's card by their bench
 if (typeof V17.drawSidelineCrew18 === 'function' && !V17.drawSidelineCrew18.__c74) {
  const d0 = V17.drawSidelineCrew18;
  const one = (id, fn) => { const ST = V17.ST(), keep = ST.crew; try { const c = {}; if (id) c[V17.BY[id].crew] = id; ST.crew = c; return fn(); } finally { ST.crew = keep; } };
  const d1 = function (ctx, bx, y) {
   const G = typeof game !== 'undefined' ? game : null;
   if (off() || !llGame(G)) return d0.apply(this, arguments);
   let n = 0;
   try { const mine = myCrew(); if (mine) n = one(mine, () => d0.call(this, ctx, bx, y)); } catch (e) {}
   try { const oc = oppCrew(G); if (oc && typeof benchX === 'function') one(oc, () => d0.call(this, ctx, benchX('o') + 88, y)); } catch (e) {}
   try { G.crewSide18 = n; } catch (e) {}
   return n;
  };
  d1.__c74 = 1; V17.drawSidelineCrew18 = d1;
 }
 Wn.CREW74 = { oppCrew: oppCrew, myCrew: myCrew };
})();
