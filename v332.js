'use strict';
var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());


const V332 = (() => {
 const on = k => !window.__rl_v124gb && !window['__rl_no332' + k];
 const LOG = {
  pass: null,
  ask: [],
  coll: [],
  top: null,
  kit: null,
  glow: 0
 };
 const lsGet = (k, d) => {
  try {
   return LS.get(k, d);
  } catch (e) {
   return d;
  }
 };
 const lsSet = (k, v) => {
  try {
   LS.set(k, v);
  } catch (e) {}
 };
 const st17 = () => window.V17 && V17.ST ? V17.ST() : null;
 const SETS = [ [ 'tape_white', 'p:basic', 'p:chirp', 'visor_smoke', 'p:legendary' ], [ 'crew_fo_0', 'p:basic', 'p:tape', 'crew_oc_1', __x("Y2xlYXRzX2hlcm1lcw==") ], [ 'stick_blue', 'p:gear', 'p:basic', 'cleats_gremlin', 'p:legendary' ], [ 'collar_gray', 'p:chirp', 'p:rare', 'fo_stallion', 'visor_gold' ], [ 'tape_black', 'p:basic', 'p:uniw', 'crew_gk_1', 'p:legendary' ], [ 'shorts_short', 'p:stick', 'p:basic', 'stick_yinyang', 'crew_dc_2' ], [ 'helm_leather', 'p:crew', 'p:basic', 'visor_mirror', 'p:legendary' ], [ 'tape_red', 'p:unip', 'p:rare', 'st28_beach', __x("c2FiZXJfYmx1ZQ==") ], [ 'crew_speed_0', 'p:basic', 'p:gear', 'stick_candycane', 'p:legendary' ], [ 'cleats_pink', 'p:chirp', 'p:basic', 'crew_strength_1', 'fo_warp' ], [ 'stick_red', 'p:tape', 'p:rare', 'visor_red', 'p:legendary' ], [ 'tape_purple', 'p:unic', 'p:basic', window.__rl_no34col || window.__rl_v124gb ? 'collar_blue' : 'collar_silver', 'crew_gk_2' ], [ 'shorts_baggy', 'p:basic', 'p:crew', 'st28_cloud', 'p:legendary' ], [ 'stick_black', 'p:gear', 'p:rare', 'crew_trainer_1', 'st28_moon' ], [ 'tape_teal', 'p:basic', 'p:chirp', 'stick_cottoncandy', 'p:legendary' ], [ 'crew_dc_0', 'p:unip', 'p:rare', 'visor_clear', __x("c2FiZXJfZ3JlZW4=") ], [ 'stick_yellow', 'p:basic', 'p:tape', 'st28_under', 'p:legendary' ], [ 'tape_orange', 'p:gear', 'p:rare', 'crew_fo_1', 'crew_speed_2' ], [ 'stick_white', 'p:basic', 'p:uniw', 'stick_pencil', 'p:legendary' ], [ 'tape_pink', 'p:rare', 'p:legendary', 'crew_dc_1', __x("bGVnX2dhcnJ5") ] ];
 const GEAR = new Set([ 'helmet', 'visor', 'collar', 'chest', 'legs', 'cleats', 'stick', 'tape' ]);
 function qty(it) {
  if (!it || !it.slot || !GEAR.has(it.slot) || it.crew || it.leg20 || it.st28 || it.tew25 || it.b35 || it.pc27 || it.sec === 'uni21') return 1;
  if (it.sec === 'tape') return 16;
  return [ 16, 3, 2 ][it.rar | 0] || 1;
 }
 function buildPass() {
  const BY = V17.BY, PK = V17.PACKS || {}, out = [];
  for (const s of SETS) for (const x of s) {
   if (x.startsWith('p:')) {
    const k = x.slice(2);
    out.push({
     pack: PK[k] ? k : 'basic'
    });
    continue;
   }
   const it = BY[x];
   if (!it) {
    out.push({
     pack: 'rare'
    });
    continue;
   }
   const q = qty(it);
   out.push(q > 1 ? {
    id: x,
    q332: q
   } : {
    id: x
   });
  }
  return out;
 }
 function passInstall() {
  if (!on('pass') || !window.V17 || !Array.isArray(V17.PASS) || V17.PASS.v332) return;
  const P = V17.PASS, nw = buildPass();
  if (nw.length !== 100) return;
  const old = P.length;
  P.length = 0;
  for (const t of nw) P.push(t);
  P.v332 = 1;
  const ST = st17();
  if (ST && ST.pass) {
   if (!ST.pass.v332) {
    ST.pass.v332 = {
     at: Date.now(),
     got0: ST.pass.got | 0,
     stars0: ST.pass.stars | 0,
     owned0: !!ST.pass.owned,
     tiers0: old
    };
    try {
     V17.save();
    } catch (e) {}
   }
   if ((ST.pass.got | 0) > P.length) ST.pass.got = P.length;
  }
  LOG.pass = {
   old: old,
   n: P.length
  };
 }
 function passTable() {
  return (window.V17 && V17.PASS || []).map((t, i) => ({
   lv: i + 1,
   what: t.pack ? (V17.PACKS[t.pack] || {}).n : (V17.BY[t.id] || {}).n,
   id: t.id || null,
   pack: t.pack || null,
   q: t.q332 || 1,
   rar: t.pack ? t.pack === 'legendary' ? 2 : t.pack === 'rare' ? 1 : 0 : (V17.BY[t.id] || {}).rar
  }));
 }
 let visit = 0, lastScr = null, answered = -1;
 function scrTick() {
  try {
   const s = typeof screen !== 'undefined' ? screen : null;
   if (s !== lastScr) {
    if (s === 'matchup' && lastScr !== 'lineup') visit++;
    lastScr = s;
   }
  } catch (e) {}
  requestAnimationFrame(scrTick);
 }
 function haveCards() {
  try {
   if (!window.V22 || !V22.on()) return false;
   const ids = V22.ownedIds ? V22.ownedIds() : [];
   if (ids.some(id => PP(id) && !(window.C30 && C30.parse && C30.parse(id) && !C30.parse(id).made))) return true;
   return !!(window.V20 && V20.ownedLeg && V20.ownedLeg().length);
  } catch (e) {
   return false;
  }
 }
 function needAsk() {
  try {
   return on('set') && window.CP2319 && CP2319.on() && typeof menuSel !== 'undefined' && menuSel.mode === 'quick' && screen === 'matchup' && answered !== visit && haveCards();
  } catch (e) {
   return false;
  }
 }
 function askBox(title, sub, def, onPick) {
  if (document.getElementById('ask332')) return null;
  const d = document.createElement('div');
  d.id = 'ask332';
  d.style.cssText = 'position:fixed;inset:0;z-index:87;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ffcc33;box-shadow:0 3px 0 #000;padding:8px 12px 10px;max-width:92%;text-align:center;box-sizing:border-box';
  const h = document.createElement('div');
  h.textContent = title;
  h.style.cssText = 'color:#ffcc33;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:3px';
  box.appendChild(h);
  const s = document.createElement('div');
  s.textContent = sub;
  s.style.cssText = 'color:#cfe;font-size:10px;margin-bottom:8px';
  box.appendChild(s);
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;justify-content:center';
  for (const [lab, v] of [ [ 'YES', true ], [ 'NO', false ] ]) {
   const b = document.createElement('button');
   b.id = 'ask332' + (v ? 'y' : 'n');
   b.textContent = lab;
   b.style.cssText = 'font:inherit;font-size:13px;min-width:92px;padding:8px 10px;border:0;box-shadow:0 2px 0 #000;' + (v === def ? 'background:#ffd23a;color:#0b1a20' : 'background:#3a4a55;color:#cfe');
   b.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    d.remove();
    try {
     SFX.tap && SFX.tap();
    } catch (e) {}
    onPick(v);
   });
   row.appendChild(b);
  }
  box.appendChild(row);
  d.appendChild(box);
  document.body.appendChild(d);
  return d;
 }
 function askQuick(then) {
  const def = CP2319.quick();
  askBox('CARD PLAYERS THIS GAME?', 'YOUR PLAYER CARDS + LEGACY CARDS CAN BE SUBBED INTO YOUR LINEUP', def, v => {
   CP2319.quick(v);
   answered = visit;
   LOG.ask.push([ 'quick', v ]);
   then();
  });
 }
 function hookAsk() {
  if (typeof window.newGame === 'function' && !window.newGame.__a332) {
   const NG = window.newGame;
   window.newGame = function(user, opp, mode) {
    if (mode === 'quick' && needAsk()) {
     const a = arguments, self = this;
     askQuick(() => NG.apply(self, a));
     return;
    }
    return NG.apply(this, arguments);
   };
   window.newGame.__a332 = true;
  }
  if (typeof window.openLineup === 'function' && !window.openLineup.__a332) {
   const OL = window.openLineup;
   window.openLineup = function(teamId, src, back) {
    if (back === 'matchup' && needAsk()) {
     const a = arguments, self = this;
     askQuick(() => OL.apply(self, a));
     return;
    }
    return OL.apply(this, arguments);
   };
   window.openLineup.__a332 = true;
  }
  if (typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.seasonSetup && !PANEL_RENDER.seasonSetup.__a332) {
   const RS = PANEL_RENDER.seasonSetup;
   PANEL_RENDER.seasonSetup = function() {
    const h = RS.apply(this, arguments);
    try {
     if (!on('set') || !window.CP2319 || !CP2319.on() || typeof h !== 'string' || h.indexOf('id="ss232dr"') < 0) return h;
     const base = window.V232 && V232.sChoice ? !!V232.sChoice().base : false;
     if (base) return h;
     const d = CP2319.draft(), b = (lab, v, sel) => btn(lab, 'cp332', v, sel ? 'y' : 'd');
     const row = '<div class="row" id="cp332dr"><span class="note" style="align-self:center">CARD PLAYERS IN THE DRAFT?</span>' + b('YES', '1', d) + b('NO', '0', !d) + '<span class="note" style="align-self:center">' + (d ? 'YOUR LEGACY + NEW ORLEANS GHOST CARDS GO IN THE DRAFT POOL' : 'NO CARDS IN THE DRAFT POOL') + '</span></div>';
     const i = h.indexOf('id="ss232it"');
     if (i >= 0) {
      const j = h.lastIndexOf('<div', i);
      return h.slice(0, j) + row + h.slice(j);
     }
     const k = h.lastIndexOf('<div class="row" style="flex-direction:column');
     return k >= 0 ? h.slice(0, k) + row + h.slice(k) : h + row;
    } catch (e) {
     console.error(e);
     return h;
    }
   };
   PANEL_RENDER.seasonSetup.__a332 = true;
   PANEL_ACT.cp332 = function(v) {
    try {
     CP2319.draft(String(v) === '1');
     LOG.ask.push([ 'draft', String(v) === '1' ]);
     try {
      SFX.tap && SFX.tap();
     } catch (e) {}
     panelDirty();
    } catch (e) {
     console.error(e);
    }
   };
  }
  if (window.V232 && V232.crewOff && !V232.crewOff.__a332) {
   const CO = V232.crewOff;
   V232.crewOff = function(G) {
    if (!on('set') || !G || !V232.crewOn() || ![ 'quick', 'online' ].includes(G.mode) || G.online || G.meta && G.meta.online) return CO.apply(this, arguments);
    return !(window.V17 && V17.itemFx && V17.itemFx());
   };
   V232.crewOff.__a332 = true;
   const CS = V232.crewSet;
   V232.crewSet = function(v) {
    if (v == null && on('set') && window.V17 && V17.itemFx) return V17.itemFx();
    return CS.apply(this, arguments);
   };
  }
 }
 const SEEN = 'v332seen', P_WHY = /^CARD DROP/;
 function coachSnap() {
  const o = {};
  try {
   if (window.V232 && V232.coaches) {
    const c = V232.coaches();
    for (const k in c) o['k|' + k] = c[k];
   }
  } catch (e) {}
  try {
   if (window.D30 && D30.own) {
    const c = D30.own();
    for (const k in c) if (/^dc\|/.test(k)) o[k] = c[k];
   }
  } catch (e) {}
  return o;
 }
 function cardSnap() {
  try {
   return window.V22 && V22.st ? V22.st().cards || {} : {};
  } catch (e) {
   return {};
  }
 }
 function collTick() {
  if (!on('collect') || !window.V27 || !V27.queue || !window.V22 || !V22.on || !V22.on()) return;
  let S = lsGet(SEEN, null);
  const cs = cardSnap(), co = coachSnap();
  if (!S || typeof S !== 'object' || !S.p) {
   S = {
    p: {},
    k: {},
    at: Date.now()
   };
   for (const k in cs) S.p[k] = 1;
   for (const k in co) S.k[k] = 1;
   lsSet(SEEN, S);
   return;
  }
  const newP = [], newK = [];
  for (const k in cs) if (!S.p[k]) {
   S.p[k] = 1;
   const c = cs[k] || {};
   if (P_WHY.test(String(c.w || ''))) newP.push(k);
  }
  for (const k in co) if (!S.k[k]) {
   S.k[k] = 1;
   const w = String((co[k] || {}).w || '');
   if (/^dc\|/.test(k) || /SEASON|WORLD|NATTY|DRAFTED|TITLE|ONLINE/.test(w)) newK.push(k);
  }
  if (!newP.length && !newK.length) {
   if (S.dirty) {
    delete S.dirty;
    lsSet(SEEN, S);
   }
   return;
  }
  lsSet(SEEN, S);
  const RC = [ '#9aa3ab', '#3d8bff', '#ffcc33' ], RN = [ 'COMMON', 'RARE', 'LEGENDARY' ];
  const tiles = newP.filter(id => PP(id)).map(id => {
   const r = V22.rarOf ? V22.rarOf(id) : 0;
   let img = '';
   try {
    img = V22.artUrl ? V22.artUrl(id, V22.teamOfCard ? V22.teamOfCard(id) : undefined) : '';
   } catch (e) {}
   let tm = '';
   try {
    tm = String(T(V22.teamOfCard(id)).abbr || '');
   } catch (e) {}
   return {
    img: img,
    n: String(PP(id).n || id).toUpperCase(),
    sub: RN[r] + (tm ? ' - ' + tm : ''),
    col: RC[r]
   };
  });
  const ctiles = newK.map(k => {
   const c = co[k] || {};
   let img = '', sub = 'HEAD COACH CARD';
   try {
    if (/^dc\|/.test(k)) {
     img = D30.artUrl ? D30.artUrl(k) : '';
     sub = 'DRAFTED COACH CARD - ' + (c.r ? 'RARE' : 'COMMON');
    } else {
     const tid = k.slice(2);
     sub = 'HEAD COACH CARD - ' + String(T(tid).name || tid).toUpperCase();
    }
   } catch (e) {}
   return {
    img: img,
    n: String(c.n || k).toUpperCase(),
    sub: sub,
    col: '#ffcc33'
   };
  });
  const groups = [];
  if (tiles.length) groups.push({
   label: tiles.length === 1 ? 'NEW PLAYER CARD' : tiles.length + ' NEW PLAYER CARDS',
   tiles: tiles
  });
  if (ctiles.length) groups.push({
   label: ctiles.length === 1 ? 'NEW COACH CARD' : ctiles.length + ' NEW COACH CARDS',
   tiles: ctiles
  });
  if (!groups.length) return;
  const n = tiles.length + ctiles.length, id = 'n332|' + newP.concat(newK).join(',').slice(0, 120) + '|' + Date.now();
  V27.queue({
   id: id,
   head: n === 1 ? 'NEW CARD!' : n + ' NEW CARDS!',
   sub: 'IT IS IN YOUR LOCKER ROOM (CARDS)',
   col: '#ffcc33',
   groups: groups
  });
  LOG.coll.push({
   id: id,
   p: newP,
   k: newK
  });
 }
 function topUp() {
  const ST = st17();
  if (!ST || ST.b332 || !on('bundle') || window.__rl_no30stacks) return;
  const BY = V17.BY, PK = V17.PACKS || {}, got = [];
  const owned = k => {
   try {
    if (k === 'halloween') return !!(V17.hw16 && V17.hw16.owned && V17.hw16.owned());
    const b = PK[k] && PK[k].bundle;
    if (!b) return false;
    return !!(ST.b287 || {})[k] || b.every(id => (ST.seen || {})[id]);
   } catch (e) {
    return false;
   }
  };
  const lists = {
   halloween: V17.hw16 && V17.hw16.IDS ? V17.hw16.IDS : [],
   b2504c: (PK.b2504c || {}).bundle || [],
   b2504l: (PK.b2504l || {}).bundle || []
  };
  for (const k in lists) {
   if (!owned(k)) continue;
   for (const id of lists[k]) {
    const it = BY[id], q = qty(it);
    if (!it || q <= 1) continue;
    const have = ST.inv[id] | 0;
    if (have >= q) continue;
    const ex = q - Math.max(1, have);
    if (ex <= 0) continue;
    ST.inv[id] = have + ex;
    ST.seen[id] = true;
    ST.b30 = ST.b30 && typeof ST.b30 === 'object' ? ST.b30 : {};
    ST.b30[id] = (ST.b30[id] || 0) + ex;
    got.push([ k, id, ex ]);
   }
  }
  ST.b332 = {
   at: Date.now(),
   n: got.length
  };
  try {
   V17.save();
  } catch (e) {}
  LOG.top = got;
 }
 function glowTick() {
  try {
   if (!on('ncx') || !window.HON25 || !HON25.on() || !window.V22) return;
   const ST = st17();
   if (!ST || (ST.inv || {}).chest_tew25) return;
   if (!(V22.ownedIds ? V22.ownedIds() : []).some(id => /^(U_)?TW25-/.test(id))) return;
   ST.inv.chest_tew25 = 1;
   ST.seen.chest_tew25 = true;
   V17.save();
   LOG.glow++;
  } catch (e) {
   console.error(e);
  }
 }
 try {
  passInstall();
 } catch (e) {
  console.error(e);
 }
 try {
  hookAsk();
 } catch (e) {
  console.error(e);
 }
 if (!window.__rl_v124gb) {
  try {
   requestAnimationFrame(scrTick);
  } catch (e) {}
 }
 setTimeout(() => {
  try {
   topUp();
  } catch (e) {
   console.error(e);
  }
  try {
   glowTick();
  } catch (e) {
   console.error(e);
  }
 }, 900);
 if (!window.__rl_v124gb) setInterval(() => {
  try {
   collTick();
  } catch (e) {
   console.error(e);
  }
  try {
   glowTick();
  } catch (e) {
   console.error(e);
  }
 }, 1e3);
 function markSeen() {
  const S = {
   p: {},
   k: {},
   at: Date.now()
  };
  for (const k in cardSnap()) S.p[k] = 1;
  for (const k in coachSnap()) S.k[k] = 1;
  lsSet(SEEN, S);
 }
 return {
  on: on,
  LOG: LOG,
  SETS: SETS,
  buildPass: buildPass,
  passTable: passTable,
  qty: qty,
  collTick: collTick,
  topUp: topUp,
  glowTick: glowTick,
  needAsk: needAsk,
  askBox: askBox,
  markSeen: markSeen,
  get visit() {
   return visit;
  },
  markAsked35() {
   answered = visit;
  },
  cardsDef35: () => CP2319.quick(),
  cardsSet35(v) {
   CP2319.quick(!!v);
   LOG.ask.push([ 'quick35', !!v ]);
  }
 };
})();

window.V332 = V332;

const KIT332 = (() => {
 const on = () => !window.__rl_v124gb && !window.__rl_no332kit;
 const LOG = {
  last: null
 };
 const ready = () => on() && !!(window.V17 && V17.ST && V17.grant && V17.BY && window.V22 && V22.on && V22.on());
 function redeem() {
  if (!ready()) return null;
  const ST = V17.ST(), BY = V17.BY, R = {
   items: 0,
   stacks: 0,
   crew: 0,
   uniforms: 0,
   stadiums: 0,
   coaches: 0,
   cards: 0,
   aa: 0,
   tew: 0,
   ult: 0,
   ultAA: 0,
   custom: 0,
   legacy: 0,
   chinos: 0,
   errs: []
  };
  const err = (k, e) => {
   R.errs.push(k + ': ' + String(e && e.message || e));
   console.error(e);
  };
  const has = id => (ST.inv[id] | 0) > 0;
  const pop0 = V22.popup;
  V22.popup = function() {
   return false;
  };
  const ac0 = window.V17 && V17.toast;
  let toastMute = true;
  if (ac0) V17.toast = function() {
   if (!toastMute) return ac0.apply(this, arguments);
  };
  try {
   try {
    if (window.UNI21 && UNI21.on && UNI21.on() && UNI21.items) UNI21.items();
   } catch (e) {
    err('uni', e);
   }
   for (const it of V17.I.slice()) {
    try {
     if (!it || !it.id || it.trophy || it.pc27) continue;
     if (it.leg20) {
      if (it.id === __x("bGVnX2dhcnJ5") && !has(it.id)) {
       V17.grant(it.id, 1);
       R.legacy++;
      }
      continue;
     }
     const q = window.V332 ? V332.qty(it) : 1;
     if (q > 1) {
      V17.grant(it.id, q);
      if (has(it.id)) {
       ST.b30 = ST.b30 && typeof ST.b30 === 'object' ? ST.b30 : {};
       ST.b30[it.id] = (ST.b30[it.id] || 0) + q - 1;
      }
      R.items++;
      R.stacks += q;
      continue;
     }
     if (has(it.id)) continue;
     V17.grant(it.id, 1);
     if (!has(it.id)) continue;
     if (it.crew) R.crew++; else if (it.st28) R.stadiums++; else R.items++;
    } catch (e) {
     err('item ' + it.id, e);
    }
   }
   for (const id of Object.keys(BY)) {
    if (!id.startsWith('uni21|') || has(id)) continue;
    try {
     V17.grant(id, 1);
     if (has(id)) R.uniforms++;
    } catch (e) {
     err('uni ' + id, e);
    }
   }
   const coach = tid => {
    try {
     if (V232.giveCoach(tid, 'TEST KIT', true) === 'new') R.coaches++;
    } catch (e) {}
   };
   if (window.V232 && V232.giveCoach) {
    for (const t of TEAMS) coach(t.id);
    if (typeof WT_REG !== 'undefined') for (const k in WT_REG) coach(k);
    if (window.COL25 && COL25.TEAMS) for (const t of COL25.TEAMS) {
     const id = t && (t.id || t);
     coach(window.HON25 && HON25.coachOwnerTid ? HON25.coachOwnerTid(id) : id);
    }
   }
   try {
    if (window.D30 && D30.giveFor && typeof DRAFT_COACHES18 !== 'undefined') for (const c of DRAFT_COACHES18) {
     const r = D30.giveFor({
      phase: 'done',
      champ: TEAMS[0].id,
      team: TEAMS[0].id,
      coach: {
       n: c.n
      },
      hc17: 1,
      year: 0
     }, true);
     if (r === 'new' || r === 'team') R.coaches++;
    }
   } catch (e) {
    err('dc', e);
   }
   const three = (tid, ros) => {
    try {
     const ids = (ros || []).filter(id => PP(id) && !PP(id).leg && !V22.owned(id)).sort((a, b) => PP(b).ovr - PP(a).ovr).slice(0, 3);
     if (ids.length) R.cards += V22.grantIds(ids, tid, 'TEST KIT').length;
    } catch (e) {
     err('cards ' + tid, e);
    }
   };
   for (const t of TEAMS) three(t.id, t.roster);
   if (window.COL25 && COL25.TEAMS) for (const t of COL25.TEAMS) {
    const id = t && (t.id || t);
    try {
     three(id, T(id).roster);
    } catch (e) {}
   }
   if (typeof WT_REG !== 'undefined') for (const k in WT_REG) {
    try {
     const t = T(k);
     if (t && t.roster) three(k, t.roster);
    } catch (e) {}
   }
   const colIds = [];
   try {
    if (window.COL25 && COL25.TEAMS) for (const t of COL25.TEAMS.slice(0, 12)) {
     const id = t && (t.id || t);
     const r = T(id).roster.filter(p => PP(p) && !PP(p).leg).sort((a, b) => PP(b).ovr - PP(a).ovr);
     if (r[0]) colIds.push([ r[0], id ]);
    }
   } catch (e) {
    err('col', e);
   }
   const aaIds = [];
   if (window.HON25 && HON25.on()) for (let i = 0; i < colIds.length && (R.aa < 3 || R.tew < 3); i++) {
    const [pid, tid] = colIds[i], k = R.aa < 3 ? 'aa' : 'tew', vid = (k === 'aa' ? 'AA25-' : 'TW25-') + pid;
    if (V22.owned(vid)) continue;
    try {
     const g = HON25.grant(k, pid, tid);
     if (g && g.isNew) {
      if (k === 'aa') {
       R.aa++;
       aaIds.push(g.pid);
      } else R.tew++;
     }
    } catch (e) {
     err('hon', e);
    }
   }
   if (window.ULT331 && ULT331.on && ULT331.on()) {
    const srcU = TEAMS.slice(0, 6).map(t => (t.roster || []).filter(p => PP(p) && !PP(p).leg).sort((a, b) => PP(b).ovr - PP(a).ovr)[0]).filter(Boolean);
    for (const src of srcU) {
     if (R.ult >= 2) break;
     const uid = ULT331.PFX + src;
     if (V22.owned(uid) || !ULT331.make(uid)) continue;
     if (V22.grantIds([ uid ], PP(src).team, 'TEST KIT').length) R.ult++;
    }
    for (const src of aaIds) {
     if (R.ultAA >= 2) break;
     const uid = ULT331.PFX + src;
     if (V22.owned(uid) || !ULT331.make(uid)) continue;
     if (V22.grantIds([ uid ], PP(src).team, 'TEST KIT').length) R.ultAA++;
    }
   }
   if (window.C30 && C30.on && C30.on()) {
    const mk = (rar, names) => {
     const a = C30.freshId(rar);
     if (!a) return null;
     C30.make(a);
     V22.grantIds([ a ], C30.TID, 'TEST KIT');
     for (const nm of names) {
      const r = C30.create(a, nm, 2, false);
      if (r && r.id) {
       R.custom++;
       return r.id;
      }
     }
     return null;
    };
    try {
     const one = mk(1, [ 'TEST ONE', 'TEST ONE B', 'TEST ONE C' ]), two = mk(2, [ 'TEST TWO', 'TEST TWO B', 'TEST TWO C' ]);
     if (one && window.HON25 && HON25.on()) {
      const g = HON25.grant('aa', one, C30.TID);
      if (g && g.isNew) R.aa++;
     }
     if (two && window.HON25 && HON25.on()) {
      const g = HON25.grant('tew', two, C30.TID);
      if (g && g.isNew) R.tew++;
     }
    } catch (e) {
     err('custom', e);
    }
   }
   ST.chinos = (+ST.chinos || 0) + 5e3;
   ST.stats.earned = (+ST.stats.earned || 0) + 5e3;
   R.chinos = 5e3;
   try {
    V17.save();
   } catch (e) {}
   try {
    V22.save();
   } catch (e) {}
  } finally {
   V22.popup = pop0;
   if (ac0) V17.toast = ac0;
   toastMute = false;
  }
  try {
   if (window.V332 && V332.markSeen) V332.markSeen();
  } catch (e) {}
  const nItems = R.items + R.crew + R.stadiums + R.legacy, nCards = R.cards + R.aa + R.tew + R.ult + R.ultAA + R.custom;
  R.summary = 'TEST KIT REDEEMED: ' + nItems + ' ITEMS, ' + nCards + ' CARDS, ' + R.uniforms + ' UNIFORMS';
  try {
   if (window.V27 && V27.queue) V27.queue({
    id: 'kit332|' + Date.now(),
    head: 'TEST KIT REDEEMED!',
    sub: nItems + ' ITEMS, ' + nCards + ' CARDS, ' + R.uniforms + ' UNIFORMS',
    col: '#7dff7a',
    groups: [ {
     label: 'WHAT YOU GOT',
     tiles: [ {
      img: '',
      n: nItems + ' ITEMS',
      sub: R.crew + ' CREW, ' + R.stadiums + ' STADIUMS' + (R.legacy ? ', OLD FOXWORTH' : ''),
      col: '#8fe3f0'
     }, {
      img: '',
      n: R.uniforms + ' UNIFORMS',
      sub: 'PRO, COLLEGE, WORLD + ALTERNATES',
      col: '#8fe3f0'
     }, {
      img: '',
      n: nCards + ' CARDS',
      sub: R.cards + ' PLAYERS, ' + R.aa + ' AA, ' + R.tew + ' BAGGA, ' + (R.ult + R.ultAA) + ' ULTIMATE, ' + R.custom + ' CUSTOM',
      col: '#ffcc33'
     }, {
      img: '',
      n: R.coaches + ' COACH CARDS',
      sub: 'HEAD + DRAFTED COACHES',
      col: '#ffcc33'
     }, {
      img: '',
      n: '+5000 CHINOS',
      sub: 'TEST KIT',
      col: '#ffe14d'
     } ]
    } ]
   });
  } catch (e) {
   console.error(e);
  }
  try {
   V17.toast(R.summary, '#7dff7a');
  } catch (e) {}
  LOG.last = R;
  return R;
 }
 return {
  on: on,
  ready: ready,
  redeem: redeem,
  LOG: LOG
 };
})();

window.KIT332 = KIT332;
