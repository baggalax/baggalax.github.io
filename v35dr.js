'use strict';

const DR35 = (() => {
 const off = () => !!window.__rl_no35draft || !!window.__rl_v124gb;
 const LOG = {
  pools: [],
  redo: [],
  strip: 0,
  errs: [],
  short: []
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 200));
   if (LOG.errs.length > 30) LOG.errs.shift();
  } catch (x) {}
 };
 let CUR = null;
 const isCT = id => {
  try {
   return !!(window.V33 && V33.kindOf && V33.kindOf(id));
  } catch (e) {
   return false;
  }
 };
 const isPro = id => {
  try {
   return TEAMS.some(t => t.id === id);
  } catch (e) {
   return false;
  }
 };
 function rosterOf(id) {
  let r = null;
  try {
   const t = T(id);
   if (t && t.id === id && Array.isArray(t.roster)) r = t.roster;
  } catch (e) {}
  try {
   if (!r && typeof GH_REG !== 'undefined' && GH_REG[id]) r = GH_REG[id].roster;
  } catch (e) {}
  try {
   if (!r && typeof SZ_REG !== 'undefined' && SZ_REG[id]) r = SZ_REG[id].roster;
  } catch (e) {}
  return (r || []).filter(x => {
   try {
    return !!PP(x);
   } catch (e) {
    return false;
   }
  });
 }
 const online = S => !!(S && (S.online || S.meta && S.meta.online));
 const keyOf = p => String(p.n0 != null ? p.n0 : p.n || '').toLowerCase();
 function addExtra(D, teams) {
  const pool = D.pool, have = new Set(pool), orig = new Set(pool), out = {
   na: [],
   ct: [],
   swapped: []
  };
  const drop = id => {
   const i = pool.indexOf(id);
   if (i >= 0) pool.splice(i, 1);
   have.delete(id);
  };
  for (const t of teams) {
   if (!t || t === 'BYE' || isPro(t)) continue;
   const ct = isCT(t);
   for (const id of rosterOf(t)) {
    if (have.has(id)) continue;
    const p = PP(id);
    if (ct && p && p.real && !p.gho16 && !p.leg && !(window.DR36 && DR36.keepBase && DR36.keepBase())) {
     const b = typeof p.base25 === 'string' ? p.base25 : null, k = keyOf(p);
     for (const q of pool.slice()) {
      if (!orig.has(q) || q === id) continue;
      const qp = PP(q);
      if (!qp || qp.leg || qp.gho16 || qp.egg13) continue;
      if (q === b || qp.real && keyOf(qp) === k) {
       drop(q);
       out.swapped.push([ q, id ]);
      }
     }
    }
    pool.push(id);
    have.add(id);
    (ct ? out.ct : out.na).push(id);
   }
  }
  return out;
 }
 function topUp(D) {
  const H = new Set(D.dr35h || []), cpuOk = p => p && !p.leg && !p.gho16 && !p.egg13 && !H.has(p.id);
  const have = {};
  for (const id of D.pool) {
   const p = PP(id);
   if (cpuOk(p)) have[p.pos] = (have[p.pos] || 0) + 1;
  }
  const need = {}, n = D.order.length, added = [];
  for (const k in QUOTA) need[k] = QUOTA[k] * n + 2 - (have[k] || 0);
  const inP = new Set(D.pool);
  for (const id of typeof FREE_AGENTS !== 'undefined' ? FREE_AGENTS : []) {
   const p = PP(id);
   if (!cpuOk(p) || inP.has(id)) continue;
   if (need[p.pos] > 0) {
    D.pool.push(id);
    inP.add(id);
    need[p.pos]--;
    added.push(id);
   }
  }
  return added;
 }
 const DONE = {};
 function install() {
  if (typeof CP2319 !== 'undefined' && CP2319 && typeof CP2319.draftExtra === 'function' && !DONE.dx) {
   DONE.dx = 1;
   const DX = CP2319.draftExtra;
   CP2319.draftExtra = function() {
    const r = DX.apply(this, arguments);
    if (!CUR || off() || !r) return r;
    return {
     leg: true,
     gho: []
    };
   };
   CP2319.draftExtra.__dr35 = true;
  }
  if (typeof window.makeDraft === 'function' && !DONE.md) {
   DONE.md = 1;
   const MD = window.makeDraft;
   window.makeDraft = function(S) {
    if (off() || !S || online(S) || !Array.isArray(S.teams)) return MD.apply(this, arguments);
    CUR = S;
    let D;
    try {
     D = MD.apply(this, arguments);
    } finally {
     CUR = null;
    }
    try {
     if (D && Array.isArray(D.pool)) {
      const x = addExtra(D, S.teams);
      if (x.ct.length) D.dr35h = x.ct.slice();
      const fa = S.__dr35ct ? topUp(D) : [];
      LOG.pools.push({
       teams: S.teams.length,
       n: D.pool.length,
       na: x.na.length,
       ct: x.ct.length,
       swapped: x.swapped.length,
       fa: fa.length
      });
      if (LOG.pools.length > 20) LOG.pools.shift();
     }
    } catch (e) {
     console.error(e);
     err(e, 'pool');
    }
    return D;
   };
   window.makeDraft.__dr35 = true;
  }
  if (typeof window.cpuChoice === 'function' && !DONE.cc) {
   DONE.cc = 1;
   const CC = window.cpuChoice;
   window.cpuChoice = function(D, team) {
    try {
     if (!off() && D && Array.isArray(D.dr35h) && D.dr35h.length && Array.isArray(D.pool)) {
      const H = new Set(D.dr35h), pool = D.pool.filter(id => !H.has(id));
      if (pool.length && pool.length < D.pool.length) return CC.call(this, Object.assign({}, D, {
       pool: pool
      }), team);
     }
    } catch (e) {
     err(e, 'cpu');
    }
    return CC.apply(this, arguments);
   };
   window.cpuChoice.__dr35 = true;
  }
  if (typeof window.makeSeason === 'function' && !DONE.ms) {
   DONE.ms = 1;
   const MS = window.makeSeason;
   window.makeSeason = function(teamId) {
    const S = MS.apply(this, arguments);
    try {
     if (off() || !S || online(S) || S.base232 || !(S.draft || S.draftLog) || !Array.isArray(S.teams)) return S;
     const cts = S.teams.filter(isCT);
     if (!cts.length) return S;
     if (!(window.V331 && V331.draftCT && V331.draftCT())) return S;
     let D;
     try {
      S.__dr35ct = true;
      D = window.makeDraft(Object.assign({}, S, {
       teams: S.teams.slice()
      }));
     } finally {
      delete S.__dr35ct;
     }
     if (!D) return S;
     {
      const left = (D.order ? D.order.length : 0) * (D.rounds | 0) - (D.n | 0);
      if (!Array.isArray(D.pool) || D.pool.length < left) {
       LOG.short.push({
        teams: S.teams.length,
        ct: cts.length,
        pool: Array.isArray(D.pool) ? D.pool.length : -1,
        left: left
       });
       if (LOG.short.length > 20) LOG.short.shift();
       return S;
      }
     }
     D.user = S.team;
     S.draft = D;
     S.rosters = null;
     S.lineups = {};
     delete S.draftLog;
     S.phase = 'draft';
     if (isCT(S.team)) S.ct331 = 'draft';
     draftRunCpu(S.draft, S.team);
     LOG.redo.push({
      teams: S.teams.length,
      ct: cts.slice(),
      pool: D.pool.length,
      n: D.n
     });
    } catch (e) {
     console.error(e);
     err(e, 'season');
    }
    return S;
   };
   window.makeSeason.__dr35 = true;
  }
 }
 function installRow() {
  if (typeof PANEL_RENDER === 'undefined' || typeof PANEL_RENDER.seasonSetup !== 'function' || PANEL_RENDER.seasonSetup.__dr35) return;
  const RS = PANEL_RENDER.seasonSetup;
  const f = function() {
   let h = RS.apply(this, arguments);
   try {
    if (off() || typeof h !== 'string') return h;
    for (let n = 0; n < 4; n++) {
     const i = h.indexOf('<div class="row" id="cp332dr">');
     if (i < 0) break;
     const j = h.indexOf('</div>', i);
     if (j < 0) break;
     h = h.slice(0, i) + h.slice(j + 6);
     LOG.strip++;
    }
   } catch (e) {
    err(e, 'row');
   }
   return h;
  };
  try {
   for (const k of Object.keys(RS)) f[k] = RS[k];
  } catch (e) {}
  f.__dr35 = true;
  PANEL_RENDER.seasonSetup = f;
 }
 function installDraft() {
  if (typeof PANEL_RENDER === 'undefined' || typeof PANEL_RENDER.draft !== 'function' || PANEL_RENDER.draft.__dr35) return;
  const RD = PANEL_RENDER.draft;
  const f = function() {
   let h = RD.apply(this, arguments);
   try {
    if (off() || typeof h !== 'string' || typeof season === 'undefined' || !season || !Array.isArray(season.teams)) return h;
    for (const id of season.teams) {
     if (!isCT(id) || h.indexOf('<div>' + id + ': ') < 0) continue;
     let ab = '';
     try {
      ab = String(T(id).abbr || T(id).name || id);
     } catch (e) {
      ab = id;
     }
     h = h.split('<div>' + id + ': ').join('<div>' + esc(ab) + ': ');
    }
   } catch (e) {
    err(e, 'draftlbl');
   }
   return h;
  };
  try {
   for (const k of Object.keys(RD)) f[k] = RD[k];
  } catch (e) {}
  f.__dr35 = true;
  PANEL_RENDER.draft = f;
 }
 try {
  install();
  installRow();
  installDraft();
 } catch (e) {
  console.error(e);
  err(e, 'install');
 }
 function tick() {
  try {
   install();
   installRow();
   installDraft();
  } catch (e) {
   err(e, 'tick');
  }
  setTimeout(tick, 500);
 }
 setTimeout(tick, 0);
 return {
  LOG: LOG,
  addExtra: addExtra,
  install: install,
  installRow: installRow,
  installDraft: installDraft,
  off: off,
  DONE: DONE
 };
})();

window.DR35 = DR35;
