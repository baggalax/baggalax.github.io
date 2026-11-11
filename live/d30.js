const D30 = (() => {
 const LOG = [];
 const fish = () => {
  try {
   return typeof FISH === 'function' && FISH();
  } catch (e) {
   return false;
  }
 };
 const onDC = () => !fish() && !window.__rl_no30dcoach && !window.__rl_no232k && !!(window.V232 && V232.giveCoach);
 const onBC = () => !fish() && !window.__rl_no30basecoach;
 const DK = 'dcoach30';
 const own = () => {
  try {
   const c = LS.get(DK, {});
   return c && typeof c === 'object' ? c : {};
  } catch (e) {
   return {};
  }
 };
 const pool = () => {
  try {
   return window.V17 && V17.coachPool && V17.coachPool() || [];
  } catch (e) {
   return [];
  }
 };
 const poolC = n => pool().find(c => c.n === n) || null;
 const rarOf = n => {
  const c = poolC(n);
  return c && c.v >= 3 ? 1 : 0;
 };
 const teamOfCoach = n => {
  try {
   return TEAMS.find(t => t.coach === n) || null;
  } catch (e) {
   return null;
  }
 };
 const keyOf = n => 'dc|' + n;
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[ch]));
 const toast = (m, c) => {
  try {
   V17.toast(m, c);
  } catch (e) {}
 };
 function giveFor(Sz, quiet) {
  if (!onDC() || !Sz || Sz.online || Sz.phase !== 'done' || !Sz.champ || Sz.champ !== Sz.team) return null;
  const dn = typeof DRAFT_COACHES18 !== 'undefined' ? DRAFT_COACHES18.map(c => c.n) : [];
  if (Sz.basecoach30 || !Sz.coach || !Sz.coach.n || !(Sz.hc17 || dn.includes(Sz.coach.n))) return null;
  const n = String(Sz.coach.n);
  let mine = null;
  try {
   mine = T(Sz.team).coach;
  } catch (e) {}
  if (n === mine) return null;
  const tm = teamOfCoach(n);
  if (tm) {
   const r = V232.giveCoach(tm.id, 'DRAFTED COACH', quiet);
   LOG.push([ 'team', n, tm.id, r ]);
   return r === 'new' ? 'team' : r;
  }
  const c = own(), k = keyOf(n);
  if (c[k]) return 'have';
  c[k] = {
   n: n,
   at: Date.now(),
   r: rarOf(n),
   t: Sz.team,
   y: Sz.year || null
  };
  LS.set(DK, c);
  LOG.push([ 'dc', n, c[k].r ]);
  if (!quiet) toast('DRAFTED COACH CARD: ' + n.toUpperCase() + ' (' + (c[k].r ? 'RARE' : 'COMMON') + ')', '#ffcc33');
  return 'new';
 }
 const art = new Map;
 function artUrl(n) {
  if (art.has(n)) return art.get(n);
  let u = '';
  try {
   const G = V232.coachGrid2401, P0 = V232.coachPal2401 ? V232.coachPal2401(TEAMS[0].id) : null;
   const L = typeof COACH_LOOKS18 !== 'undefined' && COACH_LOOKS18[n] || {};
   if (G && P0) {
    const pal = Object.assign({}, P0, L.hair ? {
     H: L.hair,
     h: L.hair2 || L.hair
    } : {}, L.J ? {
     P: L.J,
     p: L.j || L.J,
     L: '#ffffff'
    } : {}, L.P ? {
     K: L.P,
     k: L.p || L.P
    } : {});
    const c = document.createElement('canvas');
    c.width = c.height = 48;
    const x = c.getContext('2d');
    G.forEach((r, y) => {
     for (let i = 0; i < r.length; i++) {
      const k = pal[r[i]];
      if (k) {
       x.fillStyle = k;
       x.fillRect(i, y, 1, 1);
      }
     }
    });
    if (L.glasses) {
     x.fillStyle = '#111111';
     x.fillRect(19, 6, 10, 1);
     x.fillRect(20, 7, 3, 1);
     x.fillRect(25, 7, 3, 1);
    }
    if (L.beard) {
     x.fillStyle = L.beard;
     x.fillRect(19, 10, 10, 2);
     x.fillRect(20, 12, 8, 1);
     x.fillRect(21, 13, 6, 1);
     x.fillStyle = '#a86452';
     x.fillRect(22, 11, 4, 1);
    }
    u = c.toDataURL();
   }
  } catch (e) {
   console.error(e);
  }
  art.set(n, u);
  return u;
 }
 const RN = [ 'COMMON', 'RARE', 'LEGENDARY' ];
 function tile(k, d) {
  return '<div class="c17 r' + d.r + ' cc232 cc2403 dc30" data-tid="' + esc(k) + '" data-rar="' + d.r + '" aria-label="' + esc(String(d.n).toUpperCase() + ' - ' + RN[d.r] + ' DRAFTED COACH') + '"><i class="tag2311 tag2403">COACH</i><div class="art"><img alt="" src="' + artUrl(d.n) + '"></div><div class="nm">' + esc(String(d.n).toUpperCase()) + '</div><div class="rr">' + RN[d.r] + ' - COACH</div><div class="role17">DRAFTED COACH</div></div>';
 }
 function hook() {
  if (window.V22 && V22.titleCheck && !V22.titleCheck.__d30) {
   const TC = V22.titleCheck;
   V22.titleCheck = function(Sz, w) {
    const r = TC.apply(this, arguments);
    try {
     giveFor(Sz);
    } catch (e) {
     console.error(e);
    }
    return r;
   };
   V22.titleCheck.__d30 = true;
  }
  if (window.V22 && V22.playersHtml && !V22.playersHtml.__d30) {
   const PH = V22.playersHtml;
   V22.playersHtml = function(legCards, legHave, legTot, crew) {
    if (!onDC() || !(V232.on2403 && V232.on2403())) return PH.apply(this, arguments);
    const c = own(), ks = Object.keys(c).filter(k => /^dc\|/.test(k) && c[k] && c[k].n).sort((a, b) => (c[a].at || 0) - (c[b].at || 0));
    if (!ks.length) return PH.apply(this, arguments);
    const cr = {};
    for (const k in crew || {}) cr[k] = Object.assign({}, crew[k]);
    for (const k of ks) {
     const d = c[k], r = d.r === 1 ? 1 : 0, q = cr[r] || (cr[r] = {
      cards: '',
      un: 0,
      tot: 0
     });
     q.cards += tile(k, Object.assign({}, d, {
      r: r
     }));
     q.un++;
     q.tot++;
    }
    return PH.call(this, legCards, legHave, legTot, cr);
   };
   V22.playersHtml.__d30 = true;
  }
  if (window.HON25 && HON25.coachCards && !HON25.coachCards.__d30) {
   const CC = HON25.coachCards;
   HON25.coachCards = function() {
    const a = CC.apply(this, arguments) || [];
    if (!onDC()) return a;
    const c = own();
    return a.concat(Object.keys(c).filter(k => /^dc\|/.test(k) && c[k] && c[k].n).map(k => ({
     id: k,
     name: String(c[k].n).toUpperCase(),
     team: ''
    })));
   };
   HON25.coachCards.__d30 = true;
  }
  if (typeof drawSeason === 'function' && !drawSeason.__d30) {
   const DS = drawSeason;
   drawSeason = function() {
    try {
     baseCoach();
    } catch (e) {
     console.error(e);
    }
    return DS.apply(this, arguments);
   };
   drawSeason.__d30 = true;
  }
 }
 function baseCoach() {
  const S = typeof season !== 'undefined' ? season : null;
  if (!onBC() || !S || !S.base232 || !S.hc17need || S.hc17 || S.online || !S.team || S.phase === 'draft' || S.phase === 'done') return false;
  let n = null;
  try {
   n = T(S.team).coach;
  } catch (e) {}
  const i = n ? pool().findIndex(c => c.n === n) : -1;
  if (i < 0 || !PANEL_ACT.v17hc) return false;
  S.basecoach30 = n;
  PANEL_ACT.v17hc(i);
  LOG.push([ 'base', S.team, n ]);
  return true;
 }
 try {
  hook();
 } catch (e) {
  console.error(e);
 }
 setTimeout(() => {
  try {
   const S = typeof season !== 'undefined' ? season : null;
   if (S) giveFor(S);
  } catch (e) {
   console.error(e);
  }
 }, 1200);
 return {
  on: onDC,
  onBC: onBC,
  own: own,
  giveFor: giveFor,
  artUrl: artUrl,
  rarOf: rarOf,
  baseCoach: baseCoach,
  keyOf: keyOf,
  LOG: LOG,
  DK: DK
 };
})();

window.D30 = D30;
