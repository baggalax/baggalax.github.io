'use strict';

const DR36 = (() => {
 const CPU_VERSIONS = false;
 const cpuVer = () => CPU_VERSIONS || !!window.__rl36cpuv;
 const PFX = 'CD36-';
 const off = () => !!window.__rl_no36dr || !!window.__rl_no35draft || !!window.__rl_v124gb;
 const LOG = {
  pools: [],
  made: 0,
  scan: 0,
  block: [],
  errs: [],
  tc: 0,
  sz: 0
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 200));
   if (LOG.errs.length > 30) LOG.errs.shift();
  } catch (x) {}
 };
 const isC = id => typeof id === 'string' && id.length > PFX.length && id.slice(0, PFX.length) === PFX;
 const srcOf = id => isC(id) ? id.slice(PFX.length) : id;
 function make(id) {
  if (!isC(id)) return null;
  if (PLAYERS[id]) return PLAYERS[id];
  const src = srcOf(id);
  if (isC(src)) return null;
  let b = null;
  try {
   b = PLAYERS[src] || PP(src) || null;
  } catch (e) {
   b = null;
  }
  if (!b || !b.r || typeof b.r !== 'object' || b.leg || b.gho16 || b.egg13) return null;
  const p = Object.assign({}, b, {
   id: id,
   r: Object.assign({}, b.r),
   cd36: 1,
   cd36b: src,
   base25: b.base25 || src,
   real: !!b.real
  });
  try {
   p.skin = b.skin != null ? b.skin : skinOf(b);
  } catch (e) {}
  PLAYERS[id] = p;
  LOG.made++;
  return p;
 }
 function scan() {
  try {
   for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || k.slice(0, 3) !== 'rl_') continue;
    const v = localStorage.getItem(k);
    if (!v || v.indexOf(PFX) < 0) continue;
    const re = /"CD36-([A-Za-z0-9_.-]{1,60})"/g;
    let m;
    while (m = re.exec(v)) {
     const id = PFX + m[1];
     if (!PLAYERS[id] && make(id)) LOG.scan++;
    }
   }
  } catch (e) {
   err(e, 'scan');
  }
 }
 scan();
 const KEY = new Map;
 function personOf(id) {
  if (KEY.has(id)) return KEY.get(id);
  let q = null;
  try {
   q = PP(id);
  } catch (e) {
   q = null;
  }
  for (let i = 0; i < 5 && q; i++) {
   const b = q.cd36b || q.base25 || q.base331;
   if (!b || b === q.id) break;
   let r = null;
   try {
    r = PP(b);
   } catch (e) {
    r = null;
   }
   if (!r) break;
   q = r;
  }
  const k = q ? q.real ? 'n:' + String(q.n0 != null ? q.n0 : q.n || '').toLowerCase().trim() : 'i:' + q.id : 'i:' + id;
  if (q) KEY.set(id, k);
  return k;
 }
 const keysOf = ids => {
  const s = new Set;
  for (const id of ids || []) s.add(personOf(id));
  return s;
 };
 function blockedIds(D, team) {
  const ros = D && D.rosters && D.rosters[team];
  if (!Array.isArray(ros) || !ros.length || !Array.isArray(D.pool)) return [];
  const ks = keysOf(ros);
  return D.pool.filter(id => ks.has(personOf(id)));
 }
 const isVer = id => {
  try {
   if (window.ULT331 && ULT331.isU && ULT331.isU(id)) return true;
   if (window.HON25 && HON25.kindOf && HON25.kindOf(id)) return true;
  } catch (e) {}
  return false;
 };
 const isCustom = id => typeof id === 'string' && /^CU30-/.test(id);
 const isCT = id => {
  try {
   return !!(window.V33 && V33.kindOf && V33.kindOf(id));
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
 function humanOnly(id) {
  let p = null;
  try {
   p = PP(id);
  } catch (e) {
   p = null;
  }
  if (!p || p.leg || p.gho16 || p.egg13) return true;
  if (isVer(id) || isCustom(id)) return !cpuVer();
  return false;
 }
 const sub = s => {
  try {
   return window.N31 && N31.sub ? N31.sub(s) : s;
  } catch (e) {
   return s;
  }
 };
 function verOf(id, D) {
  try {
   if (window.ULT331 && ULT331.isU && ULT331.isU(id)) {
    const v = ULT331.variant(ULT331.srcOf(id));
    const w = v === 'ALL AMERICAN' ? 'AA' : v;
    return {
     t: (w ? w + ' ' : '') + 'ULTIMATE',
     s: (w ? (w === 'AA' ? 'AA' : w.slice(0, 4)) + ' ' : '') + 'ULT',
     c: 'u'
    };
   }
   const k = window.HON25 && HON25.kindOf ? HON25.kindOf(id) : null;
   if (k === 'aa') return {
    t: 'AA',
    s: 'AA',
    c: 'a'
   };
   if (k === 'tew') {
    const w = sub('BAGGATWAAN');
    return {
     t: w,
     s: w.slice(0, 4),
     c: 't'
    };
   }
  } catch (e) {}
  if (isC(id) || D && D.dr36 && Array.isArray(D.dr36.c) && D.dr36.c.indexOf(id) >= 0) return {
   t: '(CARD)',
   s: '(CARD)',
   c: 'c',
   suf: true
  };
  return null;
 }
 const labOn = () => {
  try {
   return !off() && typeof screen !== 'undefined' && screen === 'draft' && typeof season !== 'undefined' && !!season && !!season.draft && !online(season);
  } catch (e) {
   return false;
  }
 };
 function labHtml(id, h, inline) {
  const v = verOf(id, season && season.draft);
  if (!v) return h;
  const t = v.suf ? 'CARD' : v.t;
  if (inline) return v.suf ? h + ' <span class="dr36v dr36c">(CARD)</span>' : '<span class="dr36v dr36' + v.c + '">' + esc(t) + '</span> ' + h;
  return '<span class="dr36v dr36b dr36' + v.c + '">' + esc(t) + '</span>' + h;
 }
 function css() {
  if (document.getElementById('dr36css')) return;
  const s = document.createElement('style');
  s.id = 'dr36css';
  s.textContent = '#panel .dr36v{font-size:.74em;letter-spacing:.3px;padding:0 2px;border-radius:2px;vertical-align:1px;white-space:nowrap}' + '#panel .dr36u{color:#0b1a20;background:linear-gradient(90deg,#e9f2ff,#b9c8d8)}#panel .dr36t{color:#0b1a20;background:#ffcc33}#panel .dr36a{color:#fff;background:#3d6fd8}' + '#panel .dr36c{color:#9fd3ff;background:rgba(61,139,255,.18);box-shadow:inset 0 0 0 1px rgba(61,139,255,.5)}' + '#panel .dr36b{display:block;width:max-content;font-size:.6em;line-height:1.15;margin:0 0 1px;padding:0 3px}';
  (document.head || document.documentElement).appendChild(s);
 }
 function addCards(D, S) {
  const ctIn = Array.isArray(D.dr35h) ? D.dr35h.slice() : [], ctSet = new Set(ctIn), inPool = new Set(D.pool), clones = [];
  for (const t of S.teams) {
   if (!t || t === 'BYE' || !isCT(t)) continue;
   for (const id of rosterOf(t)) {
    if (ctSet.has(id) || !inPool.has(id) || isC(id) || isVer(id) || isCustom(id)) continue;
    let p = null;
    try {
     p = PP(id);
    } catch (e) {
     p = null;
    }
    if (!p || !p.real || p.leg || p.gho16 || p.egg13) continue;
    const cid = PFX + id;
    if (inPool.has(cid) || !make(cid)) continue;
    D.pool.push(cid);
    inPool.add(cid);
    clones.push(cid);
   }
  }
  const all = ctIn.concat(clones);
  D.dr35h = all.filter(humanOnly);
  D.dr36 = {
   v: 1,
   c: all,
   cl: clones.length,
   cpu: cpuVer()
  };
  return {
   clones: clones,
   all: all
  };
 }
 const DONE = {};
 function install() {
  if (typeof window.makeDraft === 'function' && window.makeDraft.__dr35 && !window.makeDraft.__dr36) {
   const MD = window.makeDraft;
   const f = function(S) {
    const D = MD.apply(this, arguments);
    try {
     if (!off() && S && !online(S) && Array.isArray(S.teams) && D && Array.isArray(D.pool)) {
      const before = D.pool.length, x = addCards(D, S);
      LOG.pools.push({
       teams: S.teams.length,
       before: before,
       n: D.pool.length,
       picks: (D.order ? D.order.length : 0) * (D.rounds | 0),
       clones: x.clones.length,
       cards: x.all.length,
       human: D.dr35h.length
      });
      if (LOG.pools.length > 20) LOG.pools.shift();
     }
    } catch (e) {
     console.error(e);
     err(e, 'pool');
    }
    return D;
   };
   for (const k of Object.keys(MD)) f[k] = MD[k];
   f.__dr36 = true;
   window.makeDraft = f;
  }
  if (typeof window.cpuChoice === 'function' && window.cpuChoice.__dr35 && !window.cpuChoice.__dr36) {
   const CC = window.cpuChoice;
   const f = function(D, team) {
    try {
     if (!off() && D && Array.isArray(D.pool) && D.pool.length) {
      const bl = blockedIds(D, team);
      if (bl.length) {
       const B = new Set(bl), pool = D.pool.filter(id => !B.has(id));
       if (pool.length) return CC.call(this, Object.assign({}, D, {
        pool: pool
       }), team);
      }
     }
    } catch (e) {
     err(e, 'cpu');
    }
    return CC.apply(this, arguments);
   };
   for (const k of Object.keys(CC)) f[k] = CC[k];
   f.__dr36 = true;
   window.cpuChoice = f;
  }
  if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT && typeof PANEL_ACT.draft === 'function' && !PANEL_ACT.draft.__dr36) {
   const PD = PANEL_ACT.draft;
   PANEL_ACT.draft = function() {
    try {
     const S = season, D = S && S.draft;
     if (!off() && S && !online(S) && D && PS.draftSel && draftTurn(D) === S.team && blockedIds(D, S.team).indexOf(PS.draftSel) >= 0) {
      LOG.block.push(PS.draftSel);
      if (LOG.block.length > 20) LOG.block.shift();
      return;
     }
    } catch (e) {
     err(e, 'pick');
    }
    return PD.apply(this, arguments);
   };
   PANEL_ACT.draft.__dr36 = true;
  }
  if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT && typeof PANEL_ACT.dsel === 'function' && !PANEL_ACT.dsel.__dr36) {
   const DS = PANEL_ACT.dsel;
   PANEL_ACT.dsel = function() {
    const r = DS.apply(this, arguments);
    try {
     patchList();
    } catch (e) {
     err(e, 'dsel');
    }
    return r;
   };
   PANEL_ACT.dsel.__dr36 = true;
  }
  if (typeof window.nameCell === 'function' && !window.nameCell.__dr36) {
   const NC = window.nameCell;
   window.nameCell = function(p) {
    const h = NC.apply(this, arguments);
    try {
     if (p && p.id && labOn()) return labHtml(p.id, h);
    } catch (e) {
     err(e, 'name');
    }
    return h;
   };
   window.nameCell.__dr36 = true;
  }
  if (typeof window.lastName === 'function' && !window.lastName.__dr36) {
   const LN = window.lastName;
   window.lastName = function(p) {
    const s = LN.apply(this, arguments);
    try {
     if (p && p.id && labOn()) {
      const v = verOf(p.id, season.draft);
      if (v) return v.suf ? s + ' ' + v.s : v.s + ' ' + s;
     }
    } catch (e) {
     err(e, 'last');
    }
    return s;
   };
   window.lastName.__dr36 = true;
  }
  if (typeof window.szRegister15 === 'function' && !window.szRegister15.__dr36) {
   const SR = window.szRegister15;
   window.szRegister15 = function(d, mine) {
    try {
     if (d && typeof d === 'object' && Array.isArray(d.ids) && d.ids.some(isC)) {
      d = mapSz(d);
      LOG.sz++;
     }
    } catch (e) {
     err(e, 'sz');
    }
    return SR.apply(this, [ d ].concat([].slice.call(arguments, 1)));
   };
   window.szRegister15.__dr36 = true;
  }
  if (typeof window.szBuild15 === 'function' && !window.szBuild15.__dr36) {
   const SB = window.szBuild15;
   window.szBuild15 = function() {
    let cl = [];
    try {
     const S = season, r = S && S.rosters && S.rosters[S.team];
     cl = Array.isArray(r) ? r.filter(isC) : [];
    } catch (e) {
     cl = [];
    }
    const t = SB.apply(this, arguments);
    try {
     if (t && cl.length && t.g17 && typeof t.g17 === 'object' && typeof window.myLoadout === 'function') {
      const L = window.myLoadout(cl) || {}, G = t.g17.gear = t.g17.gear || {}, C = t.g17.cel;
      for (const c of cl) {
       const b = srcOf(c);
       if (!t.roster || t.roster.indexOf(b) < 0) continue;
       delete G[b];
       if (L.gear && L.gear[c]) G[b] = L.gear[c];
       if (C && typeof C === 'object') {
        delete C[b];
        if (L.cel && L.cel[c]) C[b] = L.cel[c];
       }
      }
     }
    } catch (e) {
     err(e, 'szgear');
    }
    return t;
   };
   window.szBuild15.__dr36 = true;
  }
  if (window.V28 && typeof V28.cardGear === 'function' && !V28.cardGear.__dr36) {
   const CG = V28.cardGear;
   V28.cardGear = function(pid) {
    return CG.apply(this, isC(pid) ? [ srcOf(pid) ].concat([].slice.call(arguments, 1)) : arguments);
   };
   for (const k of Object.keys(CG)) V28.cardGear[k] = CG[k];
   V28.cardGear.__dr36 = true;
  }
  if (window.HON25 && typeof HON25.eqHook === 'function' && !HON25.eqHook.__dr36) {
   const EH = HON25.eqHook;
   HON25.eqHook = function(pid) {
    return EH.apply(this, isC(pid) ? [ srcOf(pid) ].concat([].slice.call(arguments, 1)) : arguments);
   };
   HON25.eqHook.__dr36 = true;
  }
  if (window.V35 && V35.b35 && typeof V35.b35.eqHook === 'function' && !V35.b35.eqHook.__dr36) {
   const BH = V35.b35.eqHook;
   V35.b35.eqHook = function(pid) {
    return BH.apply(this, isC(pid) ? [ srcOf(pid) ].concat([].slice.call(arguments, 1)) : arguments);
   };
   V35.b35.eqHook.__dr36 = true;
  }
  if (window.V22 && typeof V22.titleCheck === 'function' && !V22.titleCheck.__dr36) {
   const TC = V22.titleCheck;
   const f = function(Sz) {
    let arr = null;
    try {
     if (Sz && Sz.rosters && Sz.team && Array.isArray(Sz.rosters[Sz.team]) && Sz.rosters[Sz.team].some(isC)) {
      arr = Sz.rosters[Sz.team];
      Sz.rosters[Sz.team] = realIds(arr);
      LOG.tc++;
     }
    } catch (e) {
     arr = null;
     err(e, 'tc');
    }
    try {
     return TC.apply(this, arguments);
    } finally {
     if (arr) Sz.rosters[Sz.team] = arr;
    }
   };
   for (const k of Object.keys(TC)) f[k] = TC[k];
   f.__dr36 = true;
   V22.titleCheck = f;
  }
  if (window.V22 && typeof V22.grantIds === 'function' && !V22.grantIds.__dr36) {
   const GI = V22.grantIds;
   V22.grantIds = function(ids) {
    return GI.apply(this, Array.isArray(ids) && ids.some(isC) ? [ realIds(ids) ].concat([].slice.call(arguments, 1)) : arguments);
   };
   V22.grantIds.__dr36 = true;
  }
  if (window.V22 && typeof V22.flipSplit === 'function' && !V22.flipSplit.__dr36) {
   const FS = V22.flipSplit;
   V22.flipSplit = function(ids) {
    return FS.apply(this, Array.isArray(ids) && ids.some(isC) ? [ realIds(ids) ].concat([].slice.call(arguments, 1)) : arguments);
   };
   V22.flipSplit.__dr36 = true;
  }
  if (window.__rl && typeof window.__rl.reloadSeason === 'function' && !window.__rl.reloadSeason.__dr36) {
   const RS = window.__rl.reloadSeason;
   window.__rl.reloadSeason = function() {
    scan();
    return RS.apply(this, arguments);
   };
   window.__rl.reloadSeason.__dr36 = true;
  }
 }
 function realIds(ids) {
  const out = [], seen = new Set;
  for (const id of ids) {
   const r = srcOf(id);
   if (seen.has(r)) continue;
   seen.add(r);
   out.push(r);
  }
  return out;
 }
 function mapSz(d) {
  const m = id => typeof id === 'string' ? srcOf(id) : id, o = Object.assign({}, d);
  o.ids = realIds(d.ids);
  for (const k of [ 'boost', 'nums' ]) if (d[k] && typeof d[k] === 'object') {
   const x = {};
   for (const id in d[k]) {
    const r = m(id);
    if (isC(id) && x[r] != null) continue;
    x[r] = d[k][id];
   }
   o[k] = x;
  }
  if (d.lu && typeof d.lu === 'object') {
   const walk = v => Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, w]) => [ k, walk(w) ])) : m(v);
   o.lu = walk(d.lu);
  }
  return o;
 }
 function patchHtml(h) {
  const S = season, D = S && S.draft;
  if (!D || online(S)) return h;
  const total = D.order.length * D.rounds;
  if (D.n >= total) return h;
  const bl = new Set(blockedIds(D, S.team));
  const fix = s => s.replace(/<tr data-a="dsel" data-v="([^"]+)"( class="([^"]*)")?/g, (m0, v, c1, cls) => bl.has(v) && cls !== 'sel' ? '<tr data-a="dsel" data-v="' + v + '" class="dimrow"' : m0);
  if (bl.size) {
   h = fix(h);
   try {
    if (Array.isArray(draftRest)) draftRest = draftRest.map(fix);
   } catch (e) {
    err(e, 'rest');
   }
   if (PS.draftSel && bl.has(PS.draftSel) && draftTurn(D) === S.team) h = h.replace(/<button type="button" data-a="draft"( class="[^"]*")?( disabled)? aria-label="[^"]*">[^<]*<\/button>/, (m0, c) => '<button type="button" data-a="draft"' + (c || '') + ' disabled aria-label="YOU HAVE HIM">YOU HAVE HIM</button>');
  }
  const mk = '<div class="note" style="margin-top:6px">LAST PICKS</div>', i = h.indexOf(mk), end = '</div></div>';
  const last = D.picks.slice(-8).reverse();
  if (i >= 0 && h.slice(-end.length) === end && last.some(([, id]) => verOf(id, D))) {
   const tl = t => {
    try {
     if (isCT(t)) return String(T(t).abbr || T(t).name || t);
     return T(t).id;
    } catch (e) {
     return t;
    }
   };
   const log = last.map(([t, id]) => {
    const p = PP(id);
    return p ? '<div>' + esc(tl(t)) + ': ' + labHtml(id, esc(p.n), true) + ' <span class="dim2">' + p.pos + ' ' + p.ovr + '</span></div>' : '';
   }).join('');
   h = h.slice(0, i + mk.length) + (log || '<div class="dim2">-</div>') + end;
  }
  return h;
 }
 function patchList() {
  if (!labOn()) return;
  const S = season, D = S.draft, list = document.getElementById('draftList');
  if (!list || D.n >= D.order.length * D.rounds) return;
  const bl = blockedIds(D, S.team);
  if (!bl.length) return;
  for (const id of bl) {
   const tr = list.querySelector('tr[data-a="dsel"][data-v="' + id + '"]');
   if (tr && tr.className !== 'sel') tr.className = 'dimrow';
  }
  if (PS.draftSel && bl.indexOf(PS.draftSel) >= 0 && draftTurn(D) === S.team) {
   const b = panel.querySelector('button[data-a="draft"]');
   if (b) {
    b.disabled = true;
    b.textContent = 'YOU HAVE HIM';
    b.setAttribute('aria-label', 'YOU HAVE HIM');
   }
  }
 }
 function installDraft() {
  if (typeof PANEL_RENDER === 'undefined' || typeof PANEL_RENDER.draft !== 'function' || PANEL_RENDER.draft.__dr36) return;
  const RD = PANEL_RENDER.draft;
  const f = function() {
   let h = RD.apply(this, arguments);
   try {
    if (typeof h === 'string' && labOn()) {
     css();
     h = patchHtml(h);
    }
   } catch (e) {
    err(e, 'draft');
   }
   return h;
  };
  for (const k of Object.keys(RD)) f[k] = RD[k];
  f.__dr36 = true;
  PANEL_RENDER.draft = f;
 }
 try {
  install();
  installDraft();
 } catch (e) {
  console.error(e);
  err(e, 'install');
 }
 function tick() {
  try {
   install();
   installDraft();
  } catch (e) {
   err(e, 'tick');
  }
  setTimeout(tick, 500);
 }
 setTimeout(tick, 0);
 return {
  LOG: LOG,
  CPU_VERSIONS: CPU_VERSIONS,
  PFX: PFX,
  isC: isC,
  srcOf: srcOf,
  make: make,
  scan: scan,
  personOf: personOf,
  blockedIds: blockedIds,
  humanOnly: humanOnly,
  verOf: verOf,
  keepBase: () => !off(),
  off: off,
  realIds: realIds,
  mapSz: mapSz
 };
})();

window.DR36 = DR36;
