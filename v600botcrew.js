/* v600botcrew.js - Bagga Lax 1.5f: Locker League CPU bot teams get a crew card
 * Ask (Charlie): online bot teams have no crew card, real players do. Give every bot team one that fits its rank.
 * Cause: v590bot builds the bot as a card team (SZ_REG RK15BOT) with no g17 loadout, and oppView's bot profile has no
 *   team.crew, so nothing showed and nothing applied in the match.
 * Fix: crewFor(info) picks one crew card deterministically from the bot TEAM name (slot) and its TIER (rarity):
 *   SQUID / FISH = BASIC, DIRTY / GROSS = RARE, NASTY and up = LEGENDARY. Same bot team + tier = same card on every phone.
 *   - match: SZ_REG bot team gets g17 {gear:{}, crew:{slot: value}} with the SAME value formula as a player's LL crew card
 *     (v590ll myLoadout: (level + 1) * CREW_K - 1). items17 loads a card team's g17 for that side; V232.crewOff rules
 *     still apply to both sides the same way. Gear stays empty (as before).
 *   - show: the bot profile (versus screen + public profile) carries team.crew, so placeCards draws it like a player's.
 * Kill switch: window.__rl_no600botcrew
 */
(function () {
 const Wn = window;
 const off = () => !!Wn.__rl_no600botcrew || !Wn.RK15BOT || !Wn.V17 || !V17.BY;
 const SLOTS = ['trainer', 'speed', 'strength', 'oc', 'dc', 'fo', 'gk'];
 const hash = s => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
 const rarOf = tier => { const ix = Wn.RK15 && RK15.TIERS ? RK15.TIERS.findIndex(t => t.n === tier) : 0; return ix <= 1 ? 0 : ix <= 3 ? 1 : 2; };
 function crewFor(info) {
  if (!info || !info.name) return null;
  const fx = RK15BOT.crew600 && RK15BOT.crew600[info.name]; if (fx && V17.BY[fx]) return fx; // a team's own crew card (v600bots)
  const id = 'crew_' + SLOTS[hash('botcrew|' + info.name) % SLOTS.length] + '_' + rarOf(info.tier);
  return V17.BY[id] ? id : null;
 }
 const K = () => (Wn.RK15LL && RK15LL.CREW_K) || .6;
 function loadout(id) { const it = V17.BY[id], lvl = (+String(id).split('_').pop()) || (it.rar | 0), c = {}; c[it.crew] = (lvl + 1) * K() - 1; return { gear: {}, crew: c, cel: {}, f: .25 }; }
 function tag(sid, info) { try { const t = SZ_REG[sid], id = crewFor(info); if (t && id) { t.g17 = loadout(id); t.crew600 = id; } } catch (e) {} }
 const mk0 = RK15BOT.make;
 RK15BOT.make = function (info) { const r = mk0.apply(this, arguments); try { if (!off() && r) tag(r, info); } catch (e) {} return r; };
 const pv0 = RK15BOT.previewTid;
 RK15BOT.previewTid = function (info) { const r = pv0.apply(this, arguments); try { if (!off() && r && SZ_REG[r] && !SZ_REG[r].crew600) tag(r, info); } catch (e) {} return r; };
 // the bot's profile (versus screen + public profile) shows it like a player's crew card
 const r0 = Wn.render;
 if (typeof r0 === 'function') Wn.render = function () {
  try {
   const LL = Wn.RK15LL, v = LL && LL.oppV, m = LL && LL.match;
   if (!off() && v && v.cpu && m && m.bot && v.prof && v.prof.team && !v.prof.team.crew) { const id = crewFor(LL.bot || { name: LL.botName, tier: m.opp && m.opp.tier }); if (id) v.prof.team.crew = id; }
  } catch (e) {}
  return r0.apply(this, arguments);
 };
 RK15BOT.crewFor = crewFor;
})();
