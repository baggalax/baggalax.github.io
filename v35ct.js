'use strict';

const V35CT = (() => {
 const LOG = {
  pick: [],
  block: [],
  icon: 0,
  errs: []
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 20) LOG.errs.shift();
  } catch (x) {}
 };
 const off = () => !!window.__rl_no35ct || !!window.__rl_v124gb;
 const hasV331 = () => typeof V331 !== 'undefined' && !!V331 && typeof V331.onCT === 'function';
 const on = () => !off() && !!window.V33 && V33.onCT() && hasV331() && V331.onCT();
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[ch]));
 const tst = (s, c) => {
  try {
   if (typeof toast === 'function') toast(s, c || '#ffd23a');
  } catch (e) {}
 };
 const disp = s => {
  try {
   return String(V331.disp(String(s))).toUpperCase();
  } catch (e) {
   return String(s);
  }
 };
 const nmOf = id => {
  try {
   const t = T(id);
   return String(t && t.name || id).toUpperCase();
  } catch (e) {
   return String(id);
  }
 };
 const MSG_PICK = 'PICK A COACH CARD TO SAVE', MSG_NONE = 'NEED A COACH CARD - GET ONE FROM PACKS';
 function ownIcon(name) {
  const s = String(name || '').toUpperCase();
  let gl = null;
  try {
   for (const ch of s) if (/[A-Z0-9]/.test(ch) && FONT[ch]) {
    gl = FONT[ch];
    break;
   }
   if (!gl) gl = FONT['?'] || null;
  } catch (e) {
   gl = null;
  }
  if (!gl) return null;
  const rows = [ '.....' ];
  for (let r = 0; r < 5; r++) rows.push('.' + String(gl[r] || '...').slice(0, 3).replace(/[^#]/g, '.').padEnd(3, '.') + '.');
  rows.push('.....');
  return rows;
 }
 const isCard = tm => !!tm && !!(tm.ct33 || tm.ct331);
 function fixTeam(tm) {
  if (off() || !isCard(tm)) return tm;
  try {
   const ic = ownIcon(tm.name);
   if (!ic) return tm;
   if (!tm.icon || tm.icon.join('|') !== ic.join('|')) {
    if (!tm.icon35b) tm.icon35b = tm.icon;
    tm.icon = ic;
    LOG.icon++;
    try {
     if (typeof badgeUrls !== 'undefined') delete badgeUrls[tm.id];
    } catch (e) {}
   }
  } catch (e) {
   err(e, 'fix');
  }
  return tm;
 }
 function fixAll() {
  try {
   if (off() || typeof SZ_REG === 'undefined') return;
   for (const id of Object.keys(SZ_REG)) fixTeam(SZ_REG[id]);
  } catch (e) {
   err(e, 'fixAll');
  }
 }
 const bUrl = new Map;
 function badgeImg(tm) {
  const key = [ tm.c1, tm.c2, tm.abbr, (tm.icon || []).join('') ].join('|');
  if (bUrl.has(key)) return bUrl.get(key);
  let u = '';
  try {
   const c = document.createElement('canvas');
   c.width = 39;
   c.height = 45;
   const keep = g;
   g = c.getContext('2d');
   try {
    badge(tm, 0, 0, 3);
   } finally {
    g = keep;
   }
   u = c.toDataURL();
  } catch (e) {
   err(e, 'badge');
  }
  bUrl.set(key, u);
  return u;
 }
 const RN = [ 'COMMON', 'RARE', 'LEGENDARY' ];
 function coachInfo(c) {
  const o = {
   id: c.id,
   name: disp(c.name),
   r: 0,
   img: '',
   sub: ''
  };
  try {
   if (/^dc\|/.test(c.id)) {
    const d = window.D30 && D30.own && D30.own()[c.id] || {};
    o.r = Math.max(0, Math.min(2, d.r | 0));
    o.img = window.D30 && D30.artUrl ? D30.artUrl(d.n || c.name) : '';
    o.sub = 'DRAFTED COACH';
   } else {
    o.r = window.V232 && V232.coachRar2403 ? Math.max(0, Math.min(2, V232.coachRar2403(c.name) | 0)) : 0;
    o.img = window.V232 && V232.coachArt ? V232.coachArt(c.id) : '';
    o.sub = nmOf(c.id);
   }
  } catch (e) {
   err(e, 'coachInfo');
  }
  return o;
 }
 const coaches = () => {
  try {
   return V331.ownedCoaches();
  } catch (e) {
   return [];
  }
 };
 const freeCoaches = E => coaches().filter(c => !V331.coachUsedBy(c.id, E ? E.id : null));
 const coachOk = E => !!(E && E.co331 && V331.coachCard(E.co331) && !V331.coachUsedBy(E.co331, E.id));
 const coachWhy = E => coachOk(E) ? null : freeCoaches(E).length ? MSG_PICK : MSG_NONE;
 function bestFree(E) {
  const a = freeCoaches(E).map(coachInfo).sort((x, y) => y.r - x.r || (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
  return a.length ? a[0].id : '';
 }
 function needsCoach(id) {
  try {
   return on() && !!id && V33.isCT(id) && !!V33.getT(id) && !V331.coachKey(id);
  } catch (e) {
   return false;
  }
 }
 function blockMsg(id) {
  return nmOf(id) + ' HAS NO HEAD COACH - ' + (freeCoaches({
   id: id
  }).length ? 'PICK A COACH CARD' : MSG_NONE);
 }
 function block(id, where) {
  LOG.block.push([ where, id ]);
  const m = blockMsg(id);
  tst(m, '#ff9a8a');
  try {
   if (typeof SFX !== 'undefined' && SFX.bad) SFX.bad();
  } catch (e) {}
  try {
   V33.open(V33.kindOf(id), id);
   if (V33.E) {
    V33.E.msg = m;
   }
   panelDirty();
  } catch (e) {
   err(e, 'block');
  }
 }
 function lockerTeams() {
  const U = window.UNI21, out = new Set;
  if (!U) return out;
  const add = tid => {
   try {
    const t = tid && T(tid);
    if (!t || t.gho16) return;
    out.add(U.base(tid));
   } catch (e) {}
  };
  try {
   const S = typeof season !== 'undefined' ? season : null;
   if (S && S.team) add(S.team);
  } catch (e) {}
  try {
   for (const t of typeof TEAMS !== 'undefined' ? TEAMS : []) add(t.id);
  } catch (e) {}
  try {
   for (const t of typeof WTEAMS !== 'undefined' ? WTEAMS : []) add(t.id);
  } catch (e) {}
  try {
   if (!window.__rl_no286lockcol && !window.__rl_no2319) for (const t of window.COL25 && COL25.TEAMS || []) add(t.id || t);
  } catch (e) {}
  try {
   if (U.g27 && U.g27() && typeof GH_REG !== 'undefined' && GH_REG.GHO && window.GHO16 && GHO16.on() && (GHO16.owned() || U.has('GHO', 2) || U.has('GHO', 3))) out.add('GHO');
  } catch (e) {}
  try {
   if (!window.__rl_no489vets && window.VETS489 && VETS489.ids) for (const id of VETS489.ids) if (T(id)) out.add(U.base(id));
  } catch (e) {}
  try {
   if (window.GSC501 && GSC501.ids) for (const id of GSC501.ids()) if (T(id)) out.add(U.base(id));
  } catch (e) {}
  return out;
 }
 const uniPickOn = () => on() && !!window.UNI21 && UNI21.on && UNI21.on() && !!UNI21.nK && !!(window.V17 && V17.uniIcon17);
 function uniSets() {
  const g = V33.uniGroups(), lk = lockerTeams(), out = {}, old = {};
  for (const k of Object.keys(g)) {
   old[k] = g[k].length;
   out[k] = g[k].filter(id => {
    try {
     return lk.has(UNI21.base(id)) && unlocked(id).length > 0;
    } catch (e) {
     return false;
    }
   });
  }
  return {
   groups: out,
   old: old
  };
 }
 function unlocked(tid) {
  const a = [];
  try {
   const N = UNI21.nK(tid);
   for (let k = 0; k < N; k++) if (UNI21.has(tid, k)) a.push(k);
  } catch (e) {}
  return a;
 }
 const kitName = (tid, k) => {
  try {
   const t = T(tid);
   if ((t.gho16 || t.vets489 || t.gsc501) && UNI21.styN) return UNI21.styN(tid, k);
   return UNI21.STY[k];
  } catch (e) {
   return '';
  }
 };
 function uniRow(tid, cur, bad) {
  const ks = unlocked(tid), N = (() => {
   try {
    return UNI21.nK(tid);
   } catch (e) {
    return ks.length;
   }
  })();
  const tiles = ks.map(k => {
   let src = '';
   try {
    src = V17.uniIcon17(tid, k);
   } catch (e) {}
   return '<div class="c17 uni17"><div class="art"><img src="' + src + '" alt=""></div><div class="nm">' + esc(kitName(tid, k)) + '</div></div>';
  }).join('');
  return '<div class="sec17 ct35ur' + (tid === cur ? ' on' : '') + '" data-a="ct35uput" data-v="' + esc(tid) + '" data-t="' + esc(tid) + '" role="button" aria-label="' + esc('UNIFORM SET ' + nmOf(tid)) + '">' + '<div class="sh17">' + esc(nmOf(tid)) + ' <span>' + ks.length + '/' + N + '</span>' + (tid === cur ? '<b class="ct35cur">' + (bad ? 'CURRENT - NOT UNLOCKED' : 'CURRENT') + '</b>' : '') + '</div><div class="grid17 ct35ug">' + tiles + '</div></div>';
 }
 const GO = [ 'PRO', 'WORLD', 'COLLEGE', 'N/A', 'COLLAB' ];
 function grpOf(tid, groups) {
  for (const k of Object.keys(groups)) if (groups[k].includes(tid)) return k;
  return null;
 }
 function uniPop(E) {
  const {groups: groups} = uniSets(), cur = E.uni, all = V33.uniGroups(), keys = GO.filter(k => groups[k] && groups[k].length).concat(Object.keys(groups).filter(k => !GO.includes(k) && groups[k].length));
  const curIn = !!grpOf(cur, groups);
  if (!E.ug35 || !keys.includes(E.ug35)) E.ug35 = (curIn ? grpOf(cur, groups) : null) || grpOf(cur, all) || keys[0] || 'PRO';
  const chips = '<div class="row tabs ct35chips">' + keys.map(k => '<button type="button" data-a="ct35ug" data-v="' + esc(k) + '" class="' + (E.ug35 === k ? 'on' : 'd') + '">' + esc(k) + '</button>').join('') + '</div>';
  let body = '';
  if (cur && !curIn && T(cur)) body += uniRow(cur, cur, true);
  body += (groups[E.ug35] || []).map(id => uniRow(id, cur, false)).join('');
  LOG.pick.push([ 'uniPop', E.ug35, (groups[E.ug35] || []).length ]);
  return '<div class="pop17 ct331pop ct35pop" id="ct35unipop" data-a="ct35close" data-v="bg"><div class="pbox17 ct331box" data-a="v17noop">' + '<div class="ct331ph"><div class="pt17">UNIFORM SET: ' + esc(cur ? nmOf(cur) : 'PICK ONE') + '</div><div class="sp"></div><button type="button" class="g" data-a="ct35close" id="ct35uniclose">CLOSE</button></div>' + chips + '<div class="ct331sc ct35sc" id="ct35unisc">' + (body ? '<div class="ct35wrap">' + body + '</div>' : '<div class="note">NO UNIFORM SETS IN THIS GROUP</div>') + '</div></div></div>';
 }
 function coachTile(ci, E) {
  const cur = E.co331 === ci.id, by = V331.coachUsedBy(ci.id, E.id), used = !!by && !cur;
  return '<div class="c17 r' + ci.r + ' cc232 cc2403 ct35co' + (cur ? ' sel ct35on' : '') + (used ? ' ct35used' : '') + '" data-a="' + (used ? 'ct35used' : 'ct35coput') + '" data-v="' + esc(ci.id) + '" data-tid="' + esc(ci.id) + '" role="button" aria-label="' + esc(ci.name + ' - ' + RN[ci.r] + ' HEAD COACH' + (used ? ' - COACHES ' + nmOf(by) : '')) + '">' + '<i class="tag2311 tag2403">COACH</i><div class="art"><img alt="" src="' + ci.img + '"></div><div class="nm">' + esc(ci.name) + '</div><div class="rr">' + RN[ci.r] + ' - COACH</div><div class="role17">' + esc(ci.sub) + '</div>' + (used ? '<div class="ct35by">COACHES ' + esc(nmOf(by)) + '</div>' : cur ? '<div class="ct35by ct35by2">CURRENT</div>' : '') + '</div>';
 }
 function coachPop(E) {
  const list = coaches().map(coachInfo).sort((x, y) => y.r - x.r || (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
  const free = list.filter(c => !V331.coachUsedBy(c.id, E.id) || c.id === E.co331), used = list.filter(c => !free.includes(c));
  const cur = E.co331 && V331.coachCard(E.co331);
  let body = '';
  if (!list.length) body = '<div class="note ct35note">' + MSG_NONE + '. EVERY TITLE GIVES THAT TEAM\'S HEAD COACH CARD TOO.</div>'; else {
   body = '<div class="grid17 ct331g">' + free.map(c => coachTile(c, E)).join('') + '</div>';
   if (!free.length) body = '<div class="note ct35note">' + MSG_NONE + ' - EVERY COACH CARD YOU OWN ALREADY COACHES ANOTHER CARD TEAM.</div>';
   if (used.length) body += '<div class="sh17 ct331sh">COACHING ANOTHER CARD TEAM <span>' + used.length + '</span></div><div class="grid17 ct331g">' + used.map(c => coachTile(c, E)).join('') + '</div>';
  }
  return '<div class="pop17 ct331pop ct35pop" id="ct35copop" data-a="ct35close" data-v="bg"><div class="pbox17 ct331box" data-a="v17noop">' + '<div class="ct331ph"><div class="pt17">HEAD COACH: ' + esc(cur ? disp(cur.name) : 'PICK A COACH CARD') + '</div><div class="sp"></div><button type="button" class="g" data-a="ct35close" id="ct35coclose">CLOSE</button></div>' + '<div class="ct331sm">ONE CARD TEAM PER COACH CARD - A CARD TEAM NEEDS ONE</div>' + '<div class="ct331sc ct35sc" id="ct35cosc">' + body + '</div></div></div>';
 }
 function hookEditor() {
  if (typeof PANEL_RENDER === 'undefined' || !PANEL_RENDER.ct33 || !window.V33) return;
  {
   const V0 = V33.validate;
   V33.validate = function(E) {
    const r = V0.apply(this, arguments);
    try {
     if (r || !on() || !E || E !== V33.E) return r;
     return coachWhy(E);
    } catch (e) {
     err(e, 'validate');
     return r;
    }
   };
  }
  const R0 = PANEL_RENDER.ct33;
  PANEL_RENDER.ct33 = function() {
   let h = R0.apply(this, arguments);
   const E = V33.E;
   if (!on() || !E || E.refuse) {
    if (E) E.pop35 = null;
    return h;
   }
   try {
    const ub = E.uni && T(E.uni);
    if (ub) {
     const tm = {
      c1: ub.c1,
      c2: ub.c2,
      abbr: V33.abbrOf(V33.cleanName(E.name) || 'CARD TEAM'),
      icon: ownIcon(V33.cleanName(E.name) || 'C')
     };
     h = h.replace(/(<div class="hd ct33hd"><img alt="" src=")[^"]*(")/, (m, a, b) => a + badgeImg(tm) + b);
    }
    if (uniPickOn()) h = h.replace(/<select data-ct33="uni" id="ct33uni"/, '<span class="ct35sw"><button type="button" class="ct35tap" data-a="ct35uni" id="ct35uni" aria-label="PICK A UNIFORM SET"></button><select data-ct33="uni" id="ct33uni"').replace(/(<select data-ct33="uni" id="ct33uni"[\s\S]*?<\/select>)/, '$1</span>');
    h = h.replace(/(<select data-ct331="coach" id="ct331coach"[^>]*>)<option value=""( selected)?>YOU \(NO COACH CARD\)<\/option>/, (m, s, sel) => s + (sel ? '<option value="" selected>- PICK A COACH CARD -</option>' : ''));
    h = h.replace(/<select data-ct331="coach" id="ct331coach"/, '<span class="ct35sw ct35cw"><button type="button" class="ct35tap" data-a="ct35co" id="ct35co" aria-label="PICK A HEAD COACH CARD"></button><select data-ct331="coach" id="ct331coach"').replace(/(<select data-ct331="coach" id="ct331coach"[\s\S]*?<\/select>)/, '$1</span>');
    const w = coachWhy(E);
    h = h.replace(/(<span class="ct331n">)[^<]*(<\/span>)/, (m, a, b) => a + esc(E.co331msg || (w === MSG_NONE ? MSG_NONE : w ? 'A CARD TEAM NEEDS A COACH CARD' : 'ONE CARD TEAM PER COACH CARD')) + b);
    if (w) h = h.replace('id="ct331co"', 'id="ct331co" data-need35="1"');
    if (E.pop35 === 'uni' && uniPickOn()) h += uniPop(E); else if (E.pop35 === 'co') h += coachPop(E); else E.pop35 = null;
   } catch (e) {
    err(e, 'render');
   }
   return h;
  };
  const keepName = E => {
   const n = document.getElementById('ct33name');
   if (n) E.name = n.value;
  };
  const E0 = () => V33.E;
  PANEL_ACT.ct35uni = () => {
   const E = E0();
   if (!E) return;
   keepName(E);
   if (E.pick331 != null) E.pick331 = null;
   E.pop35 = 'uni';
   E.ug35 = null;
   LOG.pick.push([ 'openUni', E.uni ]);
  };
  PANEL_ACT.ct35co = () => {
   const E = E0();
   if (!E) return;
   keepName(E);
   if (E.pick331 != null) E.pick331 = null;
   E.pop35 = 'co';
   LOG.pick.push([ 'openCo', E.co331 || '' ]);
  };
  PANEL_ACT.ct35close = () => {
   const E = E0();
   if (E) {
    keepName(E);
    E.pop35 = null;
   }
  };
  PANEL_ACT.ct35ug = v => {
   const E = E0();
   if (E) {
    keepName(E);
    E.ug35 = String(v || '');
   }
  };
  PANEL_ACT.ct35uput = v => {
   const E = E0();
   if (!E || !on()) return;
   keepName(E);
   const id = String(v || '');
   if (!V33.uniOk(id)) return;
   E.uni = id;
   E.msg = '';
   E.pop35 = null;
   LOG.pick.push([ 'uni', id ]);
  };
  PANEL_ACT.ct35coput = v => {
   const E = E0();
   if (!E || !on()) return;
   keepName(E);
   const k = String(v || '');
   if (!V331.coachCard(k)) return;
   const by = V331.coachUsedBy(k, E.id);
   if (by) {
    E.co331msg = 'THAT COACH ALREADY COACHES ' + nmOf(by) + ' (ONE CARD TEAM PER COACH CARD)';
    return;
   }
   E.co331 = k;
   E.co331msg = '';
   E.msg = '';
   E.pop35 = null;
   LOG.pick.push([ 'coach', k ]);
  };
  PANEL_ACT.ct35used = v => {
   const E = E0();
   if (!E) return PANEL_KEEP;
   const by = V331.coachUsedBy(String(v || ''), E.id);
   tst(by ? 'THAT COACH ALREADY COACHES ' + nmOf(by) + ' - ONE CARD TEAM PER COACH CARD' : 'ONE CARD TEAM PER COACH CARD', '#ff9a8a');
   return PANEL_KEEP;
  };
  if (!PANEL_ACT.v17noop) PANEL_ACT.v17noop = () => {};
  {
   const A0 = PANEL_ACT.ct33auto;
   PANEL_ACT.ct33auto = function() {
    const r = A0.apply(this, arguments);
    try {
     const E = E0();
     if (on() && E && !coachOk(E)) {
      const k = bestFree(E);
      if (k) {
       E.co331 = k;
       E.co331msg = '';
       LOG.pick.push([ 'autoCoach', k ]);
      }
     }
    } catch (e) {
     err(e, 'auto');
    }
    return r;
   };
  }
  {
   const S0 = PANEL_ACT.ct33save;
   PANEL_ACT.ct33save = function() {
    try {
     const E = E0();
     if (on() && E && !E.refuse) {
      keepName(E);
      const w = coachWhy(E);
      if (w) {
       E.msg = w;
       E.pop35 = null;
       LOG.block.push([ 'save', E.id || 'new' ]);
       return;
      }
     }
    } catch (e) {
     err(e, 'save');
    }
    return S0.apply(this, arguments);
   };
  }
  {
   const O0 = V33.onOpen;
   V33.onOpen = function(E) {
    if (E) {
     E.pop35 = null;
     E.ug35 = null;
    }
    return O0 ? O0.apply(this, arguments) : undefined;
   };
  }
  {
   const S1 = PANEL_ACT.ct331slot;
   if (typeof S1 === 'function') PANEL_ACT.ct331slot = function() {
    const E = E0();
    if (E) E.pop35 = null;
    return S1.apply(this, arguments);
   };
  }
 }
 function hookStarts() {
  const TG0 = window.teamGrid;
  if (typeof TG0 === 'function') window.teamGrid = function(title, sub, onPick, opts) {
   if (typeof onPick === 'function' && !off()) {
    const f = onPick;
    const args = [].slice.call(arguments);
    args[2] = function(id) {
     if (needsCoach(id) && !(screen === 'pickTeam' && menuSel.mode === 'browse')) {
      block(id, 'grid:' + screen);
      return;
     }
     return f.apply(this, arguments);
    };
    return TG0.apply(this, args);
   }
   return TG0.apply(this, arguments);
  };
  const NG0 = window.newGame;
  if (typeof NG0 === 'function') window.newGame = function(user, opp, mode) {
   try {
    if (on() && mode === 'quick' && (screen === 'matchup' || screen === 'final')) {
     const bad = [ user, opp ].find(needsCoach);
     if (bad) {
      block(bad, 'play:' + screen);
      return;
     }
    }
   } catch (e) {
    err(e, 'newGame');
   }
   return NG0.apply(this, arguments);
  };
  const SO0 = V33.startOk;
  if (typeof SO0 === 'function') V33.startOk = function(kind) {
   try {
    if (on() && V33.incOn && V33.incOn(kind)) {
     const e = V33.eff(kind), bad = (e && e.ct || []).filter(needsCoach);
     if (bad.length) {
      V33.msg33[kind] = bad.map(nmOf).join(', ') + (bad.length > 1 ? ' HAVE' : ' HAS') + ' NO HEAD COACH - PICK ' + (bad.length > 1 ? 'COACH CARDS' : 'A COACH CARD') + ' (TEAMS + ROSTERS) OR TAKE ' + (bad.length > 1 ? 'THEM' : 'IT') + ' OUT';
      LOG.block.push([ 'season:' + kind ].concat(bad));
      return false;
     }
    }
   } catch (e) {
    err(e, 'startOk');
   }
   return SO0.apply(this, arguments);
  };
 }
 function hookLogo() {
  {
   const B0 = V33.build;
   V33.build = function() {
    return fixTeam(B0.apply(this, arguments));
   };
  }
  for (const k of [ 'reg', 'regAll', 'load', 'saveTeam' ]) {
   const f = V33[k];
   if (typeof f === 'function') V33[k] = function() {
    const r = f.apply(this, arguments);
    fixAll();
    return r;
   };
  }
  fixAll();
  try {
   document.addEventListener('DOMContentLoaded', fixAll);
  } catch (e) {}
  setTimeout(fixAll, 0);
 }
 function addCss() {
  const s = document.createElement('style');
  s.id = 'ct35css';
  s.textContent = '#panel .ct35sw{position:relative;display:flex;flex:1 1 auto;min-width:0}#panel .ct35sw select{flex:1 1 auto;width:100%}#panel .ct35cw{flex:0 1 auto;width:15em}' + '#panel .ct35tap{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;background:transparent;opacity:0;z-index:2;cursor:pointer}' + '#panel #ct331co[data-need35] select{border-color:#ff7a6a;color:#ffb0a6}' + '#panel .ct35chips{flex:0 0 auto;gap:3px;margin:2px 0}#panel .ct35chips button{padding:3px 8px}' + '#panel .ct35wrap{display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start}' + '#panel .ct35ur{flex:0 0 auto;max-width:100%;box-sizing:border-box;cursor:pointer;border:2px solid #2a3a45;border-radius:4px;padding:2px 3px;margin:0;background:rgba(255,255,255,.03)}#panel .ct35ur.on{border-color:#ffd23a;background:rgba(255,210,58,.12)}' + '#panel .ct35ur .sh17{pointer-events:none;margin:0 0 2px;font-size:9px;white-space:normal;max-width:100%}#panel .ct35ur .grid17{pointer-events:none;display:flex;flex-wrap:wrap;gap:3px}#panel .ct35cur{display:block;color:#ffd23a;font-size:8px}' + '#panel .ct35co{cursor:pointer;position:relative}#panel .ct35co.ct35on{outline:2px solid #ffd23a;outline-offset:1px}#panel .ct35co.ct35used{cursor:default}#panel .ct35co.ct35used>:not(.ct35by){opacity:.42;filter:grayscale(1)}' + '#panel .ct35by{position:absolute;left:3px;right:3px;top:38%;z-index:3;font-size:8px;line-height:1.25;color:#ffb0a6;background:rgba(10,14,20,.88);border:1px solid #ff7a6a;border-radius:3px;padding:2px 1px;text-align:center;white-space:normal;overflow-wrap:anywhere;pointer-events:none}#panel .ct35by2{top:52%;color:#0b1a20;background:#ffd23a;border-color:#ffd23a;padding:1px}' + '#panel .ct331sm{font-size:9px;color:#8fe3f0;flex:0 0 auto;margin:1px 0}#panel .ct35note{font-size:10px;color:#ffd23a;padding:6px}';
  document.head.appendChild(s);
 }
 try {
  hookLogo();
 } catch (e) {
  err(e, 'hookLogo');
 }
 try {
  hookEditor();
 } catch (e) {
  err(e, 'hookEditor');
 }
 try {
  hookStarts();
 } catch (e) {
  err(e, 'hookStarts');
 }
 try {
  addCss();
 } catch (e) {
  err(e, 'css');
 }
 return {
  LOG: LOG,
  on: on,
  off: off,
  ownIcon: ownIcon,
  fixAll: fixAll,
  needsCoach: needsCoach,
  coachWhy: coachWhy,
  freeCoaches: freeCoaches,
  bestFree: bestFree,
  uniSets: uniSets,
  lockerTeams: lockerTeams,
  unlocked: unlocked,
  MSG_PICK: MSG_PICK,
  MSG_NONE: MSG_NONE
 };
})();

window.V35CT = V35CT;
