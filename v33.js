'use strict';

const V33 = (() => {
 const off = k => !!(window.__rl_v124gb || window.__rl_no33 || k && window['__rl_no33' + k]);
 const onCT = () => !off('ct') && !!(window.V22 && V22.on && V22.on());
 const KEY = 'bl33_cardteams', MAX = {
  pro: 8,
  col: 2
 }, ROSTER = 17, NAMEMAX = 16;
 const MINR = () => window.__rl_no331min ? ROSTER : 15;
 const LOG = {
  reg: [],
  save: [],
  err: []
 };
 let D = load();
 function load() {
  let o = null;
  try {
   o = LS.get(KEY, null);
  } catch (e) {
   o = null;
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
  for (const k of [ 'pro', 'col' ]) o[k] = Array.isArray(o[k]) ? o[k].filter(t => t && typeof t === 'object' && /^SZ0[PC][1-8][0-9A-Z]$/.test(String(t.id || ''))) : [];
  if (!o.v) o.v = 1;
  return o;
 }
 function save() {
  try {
   LS.set(KEY, D);
  } catch (e) {
   console.error(e);
  }
 }
 const kindOf = id => /^SZ0P/.test(String(id || '')) ? 'pro' : /^SZ0C/.test(String(id || '')) ? 'col' : null;
 const list = kind => (onCT() ? D[kind] : []).slice();
 const all = () => list('pro').concat(list('col'));
 const isCT = id => !!kindOf(id) && all().some(t => t.id === id) && !!SZ_REG[id];
 const getT = id => all().find(t => t.id === id) || null;
 function isColCard(id) {
  const p = PP(id);
  if (!p) return false;
  if (p.col25) return true;
  const b = p.base25 && PP(p.base25);
  if (b && b.col25) return true;
  try {
   if (!window.__rl_v124gb && !window.__rl_no332ncx && window.C30) {
    const s = String(id).replace(/^U_/, '').replace(/^(AA25-|TW25-)/, '');
    const c = C30.parse(s);
    if (c && c.made) return true;
   }
  } catch (e) {}
  return false;
 }
 function ownedCards() {
  const a = [];
  try {
   if (window.V22 && V22.on()) a.push(...V22.ownedIds());
   if (window.V20 && V20.ownedLeg) a.push(...V20.ownedLeg());
  } catch (e) {}
  return [ ...new Set(a) ].filter(id => {
   const p = PP(id);
   if (!p || QUOTA[p.pos] == null) return false;
   try {
    if (window.C30 && C30.parse) {
     const c = C30.parse(id);
     if (c && !c.made) return false;
    }
   } catch (e) {}
   return !!p.leg || !!(window.V22 && V22.okSub(id));
  });
 }
 function usedElse(exceptId) {
  const s = new Set;
  for (const t of all()) if (t.id !== exceptId) for (const id of t.ids || []) s.add(id);
  return s;
 }
 function eligible(kind, exceptId) {
  const used = usedElse(exceptId);
  return ownedCards().filter(id => !used.has(id) && (kind !== 'col' || isColCard(id))).sort((a, b) => PP(b).ovr - PP(a).ovr);
 }
 function canMake(kind) {
  const e = eligible(kind, null);
  return {
   n: e.length,
   g: e.filter(id => PP(id).pos === 'G').length,
   ok: e.length >= MINR() && e.some(id => PP(id).pos === 'G')
  };
 }
 function autoFill(kind, exceptId, keep) {
  const pool = eligible(kind, exceptId), out = (keep || []).filter(id => pool.includes(id)).slice(0, ROSTER), need = Object.assign({}, QUOTA);
  for (const id of out) if (need[PP(id).pos] > 0) need[PP(id).pos]--;
  for (const id of pool) {
   if (out.length >= ROSTER) break;
   const ps = PP(id).pos;
   if (!out.includes(id) && need[ps] > 0) {
    out.push(id);
    need[ps]--;
   }
  }
  for (const id of pool) {
   if (out.length >= ROSTER) break;
   if (!out.includes(id)) out.push(id);
  }
  return posSort(out);
 }
 const PO = {
  A: 0,
  M: 1,
  FO: 2,
  LSM: 3,
  D: 4,
  G: 5
 };
 function posSort(ids) {
  return ids.slice().sort((a, b) => PO[PP(a).pos] - PO[PP(b).pos] || PP(b).ovr - PP(a).ovr);
 }
 function cleanName(s) {
  return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9 .'&-]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAMEMAX).trim();
 }
 function nameWhy(raw) {
  const nm = cleanName(raw);
  if (!nm) return 'TYPE A TEAM NAME';
  if (!/[A-Z]/.test(nm)) return 'USE AT LEAST ONE LETTER';
  try {
   if (window.C30 && C30.badName) {
    const w = C30.badName(nm);
    if (w) return w;
   }
  } catch (e) {}
  return null;
 }
 function uniGroups() {
  const g = {
   PRO: TEAMS.map(t => t.id),
   WORLD: [],
   COLLEGE: [],
   'N/A': []
  };
  try {
   g.WORLD = (typeof wtList2318 === 'function' ? wtList2318() : WTEAMS).map(t => t.id);
  } catch (e) {}
  try {
   const c = window.COL25 && COL25.groups ? COL25.groups() : {};
   g.COLLEGE = (c.COLLEGE || []).slice();
   g['N/A'] = (c['N/A'] || []).slice();
  } catch (e) {}
  if (!g['N/A'].length && typeof GH_REG !== 'undefined') g['N/A'] = Object.keys(GH_REG);
  for (const k in g) g[k] = g[k].filter(id => !kindOf(id) && T(id) && T(id).id === id);
  return g;
 }
 const uniOk = id => !!id && Object.values(uniGroups()).some(a => a.includes(id));
 function abbrOf(nm) {
  const w = String(nm).split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w.map(x => x[0]).join('') : String(nm)).slice(0, 3).toUpperCase() || 'CT';
 }
 function build(t, kind) {
  const b = T(t.uni);
  if (!b || b.id !== t.uni) return null;
  const mk35 = id => {
   if (PP(id) || window.__rl_no35gear) return !!PP(id);
   try {
    if (window.HON25 && HON25.kindOf && HON25.kindOf(id) && HON25.make) HON25.make(id);
    if (window.ULT331 && ULT331.isU && ULT331.isU(id) && ULT331.make) ULT331.make(id);
   } catch (e) {}
   return !!PP(id);
  };
  const ids = (t.ids || []).filter(id => mk35(id));
  if (ids.length < 12) return null;
  let co = 'YOU';
  try {
   if (window.V33 && V33.coachOf) co = V33.coachOf(t) || 'YOU';
  } catch (e) {
   co = 'YOU';
  }
  const tm = {
   id: t.id,
   abbr: abbrOf(t.name),
   name: cleanName(t.name) || 'CARD TEAM',
   full: cleanName(t.name),
   city: '',
   lg: kind === 'col' ? 'COLLEGE CARD TEAM' : 'CARD TEAM',
   era: 'CARD TEAM',
   c1: b.c1,
   c2: b.c2,
   icon: b.icon,
   coach: co,
   coachNote: 'CARD TEAM',
   off: 4,
   def: 4,
   roster: ids,
   sz: true,
   szBase: b.id,
   boost: {},
   nums: {},
   szLu: null,
   mine: false,
   ct33: kind
  };
  if (b.acc16) tm.acc16 = b.acc16;
  return tm;
 }
 function reg(t, kind) {
  try {
   const tm = build(t, kind);
   if (!tm) {
    delete SZ_REG[t.id];
    return null;
   }
   SZ_REG[t.id] = tm;
   return tm;
  } catch (e) {
   console.error(e);
   LOG.err.push(String(e));
   return null;
  }
 }
 function regAll() {
  for (const k of [ 'pro', 'col' ]) for (const t of D[k]) {
   if (onCT()) reg(t, k); else delete SZ_REG[t.id];
  }
 }
 function newId(kind) {
  const L = D[kind], used = new Set(L.map(t => t.id.slice(4, 5)));
  let slot = null;
  for (let i = 1; i <= MAX[kind]; i++) if (!used.has(String(i))) {
   slot = i;
   break;
  }
  if (slot == null) return null;
  const gen = (LS.get('bl33_gen', 0) | 0) + 1;
  LS.set('bl33_gen', gen);
  return 'SZ0' + (kind === 'pro' ? 'P' : 'C') + slot + '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[gen % 36];
 }
 function validate(E) {
  const kind = E.kind, why = nameWhy(E.name);
  if (why) return why;
  if (!uniOk(E.uni)) return 'PICK A UNIFORM SET';
  const pool = new Set(eligible(kind, E.id)), ids = (E.ids || []).filter(Boolean), mn = MINR();
  if (ids.length < mn || ids.length > ROSTER || new Set(ids).size !== ids.length) return 'PICK ' + (mn < ROSTER ? mn + '-' + ROSTER : ROSTER) + ' DIFFERENT PLAYERS (' + new Set(ids).size + '/' + ROSTER + ')';
  if (kind === 'col' && ids.some(id => !isColCard(id))) return 'COLLEGE CARD TEAMS: COLLEGE PLAYER CARDS ONLY';
  if (ids.some(id => !pool.has(id))) return 'ONE OF THOSE CARDS IS NOT YOURS / IS ON ANOTHER CARD TEAM';
  if (!ids.some(id => PP(id).pos === 'G')) return 'YOU NEED A GOALIE';
  let lu = null;
  try {
   lu = autoLineup(ids);
  } catch (e) {
   lu = null;
  }
  if (!lu || !lineupValid(lu, ids)) return 'THOSE CARDS CANNOT MAKE A LINEUP';
  return null;
 }
 function saveTeam(E) {
  if (!onCT()) return {
   err: 'CARD TEAMS ARE OFF'
  };
  const why = validate(E);
  if (why) return {
   err: why
  };
  const kind = E.kind, L = D[kind];
  let t = E.id ? L.find(x => x.id === E.id) : null;
  if (!t) {
   if (L.length >= MAX[kind]) return {
    err: 'MAX ' + MAX[kind] + ' ' + (kind === 'col' ? 'COLLEGE ' : '') + 'CARD TEAMS'
   };
   const c = canMake(kind);
   if (!c.ok) return {
    err: notEnough(kind, c)
   };
   const id = newId(kind);
   if (!id) return {
    err: 'NO FREE SLOT'
   };
   t = {
    id: id,
    at: Date.now()
   };
   L.push(t);
  }
  t.name = cleanName(E.name);
  t.uni = E.uni;
  t.ids = E.ids.filter(Boolean);
  save();
  reg(t, kind);
  LOG.save.push({
   id: t.id,
   kind: kind
  });
  return {
   id: t.id
  };
 }
 function delTeam(id) {
  const k = kindOf(id);
  if (!k) return false;
  const n = D[k].length;
  D[k] = D[k].filter(t => t.id !== id);
  delete SZ_REG[id];
  save();
  try {
   if (window.V33 && V33.onDelete) V33.onDelete(id);
  } catch (e) {}
  return D[k].length < n;
 }
 function notEnough(kind, c) {
  return 'NOT ENOUGH CARDS: A CARD TEAM NEEDS ' + MINR() + ' ' + (kind === 'col' ? 'COLLEGE PLAYER ' : 'PLAYER ') + 'CARDS INCLUDING A GOALIE - YOU HAVE ' + c.n + (c.n && !c.g ? ' (NO GOALIE)' : '') + (kind === 'col' ? '. COLLEGE CARD TEAMS USE COLLEGE PLAYER CARDS ONLY' : '') + (all().length ? '. CARDS ALREADY ON A CARD TEAM DO NOT COUNT' : '');
 }
 const sig = () => onCT() ? '|ct' + D.col.map(t => t.id + t.name + t.uni).join(',') + '|' + menuSel.mode : '';
 return {
  sig: sig,
  off: off,
  onCT: onCT,
  KEY: KEY,
  MAX: MAX,
  ROSTER: ROSTER,
  get MINR() {
   return MINR();
  },
  NAMEMAX: NAMEMAX,
  LOG: LOG,
  get D() {
   return D;
  },
  load: () => {
   D = load();
   regAll();
  },
  save: save,
  kindOf: kindOf,
  list: list,
  all: all,
  isCT: isCT,
  getT: getT,
  isColCard: isColCard,
  ownedCards: ownedCards,
  eligible: eligible,
  canMake: canMake,
  autoFill: autoFill,
  cleanName: cleanName,
  nameWhy: nameWhy,
  uniGroups: uniGroups,
  uniOk: uniOk,
  build: build,
  reg: reg,
  regAll: regAll,
  abbrOf: abbrOf,
  validate: validate,
  saveTeam: saveTeam,
  delTeam: delTeam,
  notEnough: notEnough
 };
})();

window.V33 = V33;

V33.regAll();

(function() {
 const E = {
  kind: 'pro',
  id: null,
  name: '',
  uni: null,
  ids: [],
  msg: '',
  back: 'pickTeam',
  refuse: null
 };
 V33.E = E;
 const POSN = {
  A: 'ATTACK',
  M: 'MIDFIELD',
  FO: 'FACEOFF',
  LSM: 'LSM',
  D: 'DEFENSE',
  G: 'GOALIE'
 }, PORD = [ 'A', 'M', 'FO', 'LSM', 'D', 'G' ];
 const tst = (s, c) => {
  try {
   if (typeof toast === 'function') toast(s, c || '#ffd23a');
  } catch (e) {}
 };
 const nm = id => {
  const t = T(id);
  return t ? String(t.name || id).toUpperCase() : id;
 };
 function open(kind, id) {
  if (!V33.onCT()) return;
  E.kind = kind === 'col' ? 'col' : 'pro';
  E.id = id || null;
  E.msg = '';
  E.back = screen === 'ct33' ? E.back : screen;
  E.refuse = null;
  if (id) {
   const t = V33.getT(id);
   if (!t) return;
   E.name = t.name;
   E.uni = t.uni;
   E.ids = (t.ids || []).slice();
  } else {
   const c = V33.canMake(E.kind), mx = V33.MAX[E.kind];
   if (V33.list(E.kind).length >= mx) E.refuse = 'YOU ALREADY HAVE ' + mx + ' ' + (E.kind === 'col' ? 'COLLEGE ' : '') + 'CARD TEAMS (THE MAX). TAP ONE TO EDIT OR DELETE IT.'; else if (!c.ok) E.refuse = V33.notEnough(E.kind, c); else {
    E.name = '';
    const g = V33.uniGroups();
    E.uni = E.kind === 'col' ? g.COLLEGE[0] || TEAMS[0].id : TEAMS[0].id;
    E.ids = V33.autoFill(E.kind, null, []);
   }
  }
  try {
   if (V33.onOpen) V33.onOpen(E);
  } catch (e) {
   console.error(e);
  }
  screen = 'ct33';
  panelDirty();
 }
 function opt(v, label, sel) {
  return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(label) + '</option>';
 }
 function render() {
  const col = E.kind === 'col', title = (E.id ? 'EDIT ' : 'ADD ') + (col ? 'COLLEGE ' : '') + 'CARD TEAM';
  if (E.refuse) {
   return '<div class="hd"><div><div class="tt">' + title + '</div><div class="st">' + (col ? 'COLLEGE PLAYER CARDS ONLY - MAX 2' : 'ANY OF YOUR PLAYER CARDS - MAX 8') + '</div></div><div class="sp"></div>' + btn('BACK', 'ct33back') + '</div>' + '<div class="ct33msg" id="ct33refuse">' + esc(E.refuse) + '</div>';
  }
  const ub = T(E.uni), why = V33.validate(E), pool = V33.eligible(E.kind, E.id);
  const g = V33.uniGroups(), uni = '<select data-ct33="uni" id="ct33uni" aria-label="UNIFORM SET">' + Object.keys(g).filter(k => g[k].length).map(k => '<optgroup label="' + k + '">' + g[k].map(id => opt(id, nm(id), id === E.uni)).join('') + '</optgroup>').join('') + '</select>';
  const rows = E.ids.concat(Array(Math.max(0, V33.ROSTER - E.ids.length)).fill('')).slice(0, V33.ROSTER).map((id, i) => {
   const p = id ? PP(id) : null, taken = new Set(E.ids.filter((x, j) => x && j !== i));
   const cand = pool.filter(x => !taken.has(x) || x === id);
   const opts = (id ? V33.MINR < V33.ROSTER ? opt('', '- EMPTY SLOT -', false) : '' : opt('', '- PICK A PLAYER -', true)) + PORD.map(ps => {
    const a = cand.filter(x => PP(x).pos === ps);
    return a.length ? '<optgroup label="' + POSN[ps] + '">' + a.map(x => opt(x, PP(x).pos + '  ' + PP(x).n + '  ' + PP(x).ovr, x === id)).join('') + '</optgroup>' : '';
   }).join('');
   return '<tr><td>' + (p ? posTag(p) : '') + '</td><td class="n"><select data-ct33="slot" data-i="' + i + '" aria-label="PLAYER ' + (i + 1) + '">' + opts + '</select></td><td class="' + (p ? rc(p.ovr) : '') + '">' + (p ? p.ovr : '') + '</td></tr>';
  }).join('');
  return '<div class="hd ct33hd">' + (ub ? '<img alt="" src="' + badgeUrl(ub) + '">' : '') + '<div><div class="tt">' + title + '</div><div class="st">' + (col ? 'COLLEGE PLAYER CARDS ONLY' : 'ANY OF YOUR PLAYER CARDS') + ' - ' + (V33.MINR < V33.ROSTER ? V33.MINR + '-' : '') + V33.ROSTER + ' PLAYERS (1+ GOALIE)</div></div><div class="sp"></div>' + btn('AUTO FILL', 'ct33auto') + (E.id ? btn('DELETE', 'ct33del', null, 'warn') : '') + btn('SAVE TEAM', 'ct33save', null, why ? '' : 'go', !!why) + btn('BACK', 'ct33back') + '</div>' + '<div class="row ct33row"><span>NAME</span><input id="ct33name" data-ct33="name" maxlength="' + V33.NAMEMAX + '" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(E.name || '') + '" aria-label="TEAM NAME"><span>UNIFORM SET</span>' + uni + '</div>' + '<div class="ct33why" id="ct33why">' + esc(E.msg || why || 'READY - TAP SAVE TEAM') + '</div>' + '<div class="scroll" id="ct33list"><table class="ct33t">' + rows + '</table></div>';
 }
 let css = false;
 function addCss() {
  if (css) return;
  css = true;
  const s = document.createElement('style');
  s.textContent = '#panel .ct33hd button{padding:4px 7px}#panel button.go{background:#7dff7a;color:#0b1a20}#panel button.warn{background:#ff7a6a;color:#0b1a20}' + '#panel .ct33row{flex-wrap:nowrap;gap:5px;font-size:10px}#panel .ct33row input{font:inherit;text-transform:uppercase;width:9.5em;min-width:0;padding:3px 4px;background:#0b1a20;color:#fff;border:1px solid #3a4a55;border-radius:3px}' + '#panel select{-webkit-appearance:none;appearance:none;font:inherit;font-size:10px;max-width:100%;min-width:0;background:#0b1a20;color:#fff;border:1px solid #3a4a55;border-radius:3px;padding:2px}#panel .ct33row select{flex:1 1 auto;width:8em}' + '#panel .ct33why{font-size:10px;color:#ffd23a;flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#panel .ct33t{width:100%;border-collapse:collapse}#panel .ct33t td{padding:1px 3px;border-bottom:1px solid #1c2a35}#panel .ct33t td.n{width:100%}#panel .ct33t select{width:100%}' + '#panel .ct33msg{margin:auto;max-width:34em;text-align:center;font-size:12px;color:#ffd23a;line-height:1.5}' + '#panel .tp33{display:flex;flex-wrap:wrap;gap:3px;align-content:flex-start;padding:3px}#panel .tp33 button{font-size:9px;padding:3px 5px;max-width:13em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#panel .tp33 button.on{background:#7dff7a;color:#0b1a20}#panel .tp33 button.offt{background:#3a4a55;color:#9fb3bd;text-decoration:line-through}' + '#panel .tp33h{font-size:10px;color:#8fe3f0;width:100%;margin-top:2px}#panel .warn33{color:#ff5a4a;font-size:11px;line-height:1.3;border:2px solid #ff5a4a;padding:3px 5px;background:rgba(80,0,0,.35)}#panel .ok33{color:#7dff7a;font-size:10px}' + '#panel .cf33{font-size:9px;color:#ffd23a;margin-left:2px}';
  document.head.appendChild(s);
 }
 addCss();
 try {
  if (!PANEL_SCREENS.includes('ct33')) PANEL_SCREENS.push('ct33');
 } catch (e) {}
 PANEL_RENDER.ct33 = render;
 const back = () => {
  screen = E.back && E.back !== 'ct33' ? E.back : 'pickTeam';
  panelDirty();
 };
 PANEL_ACT.ct33back = back;
 PANEL_ACT.ct33auto = () => {
  E.msg = '';
  E.ids = V33.autoFill(E.kind, E.id, []);
 };
 PANEL_ACT.ct33save = () => {
  const i = document.getElementById('ct33name');
  if (i) E.name = i.value;
  const r = V33.saveTeam(E);
  if (r.err) {
   E.msg = r.err;
   return;
  }
  tst('CARD TEAM SAVED: ' + nm(r.id));
  E.id = null;
  back();
 };
 PANEL_ACT.ct33del = () => {
  const t = V33.getT(E.id);
  if (!t) return back();
  const use = V33.inUse ? V33.inUse(E.id) : '';
  if (use) {
   E.msg = 'IT PLAYS IN YOUR ' + use + ' - FINISH IT (OR START A NEW ONE) FIRST';
   panelDirty();
   return;
  }
  if (!window.confirm('DELETE THE CARD TEAM ' + nm(E.id) + '? YOUR CARDS STAY IN YOUR LOCKER ROOM.')) return;
  V33.delTeam(E.id);
  tst('CARD TEAM DELETED');
  E.id = null;
  back();
 };
 panel.addEventListener('change', ev => {
  const t = ev.target;
  if (!t || !t.dataset || !t.dataset.ct33 || screen !== 'ct33') return;
  if (t.dataset.ct33 === 'slot') {
   const i = +t.dataset.i;
   while (E.ids.length <= i) E.ids.push('');
   E.ids[i] = t.value;
   E.msg = '';
   panelDirty();
  } else if (t.dataset.ct33 === 'uni') {
   E.uni = t.value;
   E.msg = '';
   panelDirty();
  } else if (t.dataset.ct33 === 'name') {
   E.name = t.value;
  }
 });
 panel.addEventListener('input', ev => {
  const t = ev.target;
  if (t && t.id === 'ct33name' && screen === 'ct33') {
   E.name = t.value;
   const w = document.getElementById('ct33why');
   const why = V33.validate(E);
   if (w) w.textContent = why || 'READY - TAP SAVE TEAM';
   const sv = panel.querySelector('[data-a="ct33save"]');
   if (sv) {
    sv.disabled = !!why;
    sv.className = why ? '' : 'go';
   }
  }
 });
 V33.open = open;
 V33.proTiles = function(opts) {
  if (!V33.onCT() || opts && opts.pool) return [];
  return V33.list('pro').map(t => SZ_REG[t.id]).filter(Boolean);
 };
 V33.tileMark = function(tm, cx, cy, cw, chh) {
  if (!tm || !tm.ct33) return;
  rect(cx, cy, 1, chh, '#ffd23a');
  rect(cx + cw - 1, cy, 1, chh, '#ffd23a');
  rect(cx, cy + chh - 1, cw, 1, '#ffd23a');
 };
 V33.proExtra = function(by, opts, wv, na, cl) {
  if (!V33.onCT() || opts && opts.pool || menuSel.mode !== 'browse' || screen !== 'pickTeam' || wv || na || cl) return;
  const n = V33.list('pro').length, lab = n < V33.MAX.pro ? 'ADD CARD TEAM' : 'CARD TEAMS 8/8';
  button(lab, 70, by, textW(lab) + 14, 19, () => open('pro', null), {
   bg: n < V33.MAX.pro ? '#ffd23a' : '#3a4a55',
   fg: n < V33.MAX.pro ? '#0b1a20' : '#cfe'
  });
 };
 {
  const OR0 = window.openRoster;
  if (typeof OR0 === 'function') window.openRoster = function(teamId, src, back) {
   if (V33.onCT() && V33.isCT(teamId) && screen === 'pickTeam' && menuSel.mode === 'browse') return open(V33.kindOf(teamId), teamId);
   return OR0.apply(this, arguments);
  };
 }
 V33.colQp = function(box, exclude, onPick, only, el, grid) {
  if (!V33.onCT()) return 0;
  const ids = V33.list('col').map(t => t.id).filter(id => SZ_REG[id] && id !== exclude && (!only || only.includes(id)));
  const browse = menuSel.mode === 'browse' && screen === 'pickTeam';
  if (!ids.length && !browse) return 0;
  box.appendChild(el('div', {
   class: 'cf',
   text: 'COLLEGE CARD TEAMS'
  }));
  if (browse) {
   const n = V33.list('col').length, ok = n < V33.MAX.col;
   box.appendChild(el('div', {
    class: 'ct33add'
   }, [ el('button', {
    type: 'button',
    class: 'ct33addb',
    id: 'ct33addcol',
    text: ok ? 'ADD COLLEGE CARD TEAM' : 'COLLEGE CARD TEAMS 2/2',
    on: {
     click: e => {
      e.stopPropagation();
      e.preventDefault();
      open('col', null);
     }
    }
   }) ]));
  }
  if (ids.length) {
   const g = grid(ids, null, browse ? id => open('col', id) : onPick, null, null);
   box.appendChild(g);
   if (V33.holdBind && g && g.querySelectorAll) for (const t of g.querySelectorAll('[data-tid]')) V33.holdBind(t, 'col', t.dataset.tid);
  }
  return ids.length;
 };
 {
  const s = document.createElement('style');
  s.textContent = '.ct33add{padding:2px 0 4px}.ct33addb{font:bold 10px ui-monospace,Menlo,monospace;background:#ffd23a;color:#0b1a20;border:0;border-radius:3px;padding:5px 8px;text-transform:uppercase}';
  document.head.appendChild(s);
 }
})();

(function() {
 const onInc = () => V33.onCT() && !V33.off('inc');
 const onPick = () => !V33.off('pick');
 const MIN = 5;
 const KN = {
  pro: 'SEASON',
  ult: 'ULTIMATE',
  col: 'COLLEGE LAX SEASON',
  wg: 'WORLD GAMES'
 };
 const SEL = {};
 const incSaved = () => {
  const o = LS.get('bl33_inc', null);
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
 };
 function sel(kind) {
  if (!SEL[kind]) SEL[kind] = {
   off: new Set,
   ctOn: null,
   inc: !!incSaved()[kind]
  };
  return SEL[kind];
 }
 function reset(kind) {
  const s = sel(kind);
  s.off = new Set;
  s.ctOn = null;
 }
 V33.np = S => !!(S && S.np33 && !V33.off('pick'));
 function universe(kind) {
  const u = {
   base: [],
   na: [],
   ct: [],
   ctBad: {}
  };
  try {
   if (kind === 'pro') {
    const c = window.V232 && V232.sChoice ? V232.sChoice() : {
     lg: 'ALL',
     na: false
    };
    u.base = window.V232 && V232.lgTeams ? V232.lgTeams(c.lg) : TEAMS.map(t => t.id);
    u.na = c.na && V232.naTeams ? V232.naTeams() : [];
    u.ct = V33.list('pro').map(t => t.id);
   } else if (kind === 'ult') {
    u.base = window.COL25 && COL25.ultTeams33 ? COL25.ultTeams33() : [];
    u.ct = V33.list('pro').concat(V33.list('col')).map(t => t.id);
   } else if (kind === 'col') {
    u.base = window.COL25 && COL25.groups ? COL25.groups().COLLEGE.slice() : [];
    u.ct = V33.list('col').concat(V33.list('pro')).map(t => t.id);
    for (const id of u.ct) {
     const t = V33.getT(id);
     if (t && (t.ids || []).some(x => !V33.isColCard(x))) u.ctBad[id] = 'MUST BE COLLEGE-ONLY CARDS FOR COLLEGE SEASONS';
    }
   } else if (kind === 'wg') {
    u.base = typeof wtList2318 === 'function' ? wtList2318().map(t => t.id) : [];
   }
  } catch (e) {
   console.error(e);
  }
  u.ct = u.ct.filter(id => SZ_REG[id]);
  return u;
 }
 function incOn(kind) {
  return onInc() && kind !== 'wg' && sel(kind).inc && universe(kind).ct.length > 0;
 }
 function ctPicked(kind) {
  const s = sel(kind), u = universe(kind);
  if (!incOn(kind)) return [];
  if (!s.ctOn) s.ctOn = new Set(u.ct.filter(id => !u.ctBad[id]));
  return u.ct.filter(id => s.ctOn.has(id) && !u.ctBad[id]);
 }
 function eff(kind) {
  const s = sel(kind), u = universe(kind), out = onPick() ? id => !s.off.has(id) : () => true;
  const base = u.base.filter(out), na = u.na.filter(out), ct = ctPicked(kind).filter(out);
  const removed = u.base.filter(id => !base.includes(id)), ids = base.concat(na, ct);
  const custom = removed.length > 0 || ct.length > 0 || na.length !== u.na.length;
  return {
   ids: ids,
   base: base,
   na: na,
   ct: ct,
   removed: removed,
   custom: custom,
   np: removed.length > 0,
   ok: ids.length >= MIN,
   n: ids.length,
   u: u
  };
 }
 V33.sel = sel;
 V33.eff = eff;
 V33.universe = universe;
 V33.incOn = incOn;
 V33.reset = reset;
 V33.MIN = MIN;
 V33.onInc = onInc;
 V33.onPick = onPick;
 function setInc(kind, v) {
  const s = sel(kind);
  s.inc = !!v;
  s.ctOn = null;
  const o = incSaved();
  o[kind] = !!v;
  LS.set('bl33_inc', o);
 }
 function toggle(kind, id) {
  const s = sel(kind), u = universe(kind);
  if (u.ct.includes(id)) {
   if (u.ctBad[id]) return u.ctBad[id];
   ctPicked(kind);
   if (s.ctOn.has(id)) s.ctOn.delete(id); else s.ctOn.add(id);
   s.off.delete(id);
   return null;
  }
  if (s.off.has(id)) s.off.delete(id); else s.off.add(id);
  return null;
 }
 V33.setInc = setInc;
 V33.toggle = toggle;
 const nm = id => {
  const t = T(id);
  return t ? String(t.name || id).toUpperCase() : id;
 };
 const WARN = 'HEADS UP: TAKE OUT ANY BASE TEAM AND THIS SEASON GIVES NO TROPHY AND NO SEASON PRIZES - NO TITLE, NO PLAYER CARDS, NO COACH CARDS, NO UNIFORMS, NO WIN PACKS. KEEP EVERY BASE TEAM IN TO PLAY FOR THE TROPHY.';
 function status(kind) {
  const e = eff(kind), tot = e.u.base.length + e.u.na.length + (incOn(kind) ? e.u.ct.filter(id => !e.u.ctBad[id]).length : 0);
  if (!e.ok) return {
   cls: 'warn33',
   t: e.n + ' TEAMS - EVERY SEASON NEEDS AT LEAST ' + MIN + ' TEAMS'
  };
  if (e.np) return {
   cls: 'warn33',
   t: e.n + ' OF ' + tot + ' TEAMS - ' + e.removed.length + ' BASE TEAM' + (e.removed.length > 1 ? 'S' : '') + ' TAKEN OUT: NO TROPHY + NO PRIZES THIS SEASON'
  };
  return {
   cls: 'ok33',
   t: e.n + ' OF ' + tot + ' TEAMS - EVERY BASE TEAM IS IN: TROPHY + PRIZES ON'
  };
 }
 V33.status = status;
 V33.WARN = WARN;
 let ov = null, ovKind = null, ovMsg = '', ovDone = null, ovOpen = false;
 const isOpen = () => ovOpen;
 function css() {
  if (document.getElementById('tp33css')) return;
  const s = document.createElement('style');
  s.id = 'tp33css';
  s.textContent = '#tp33{position:fixed;inset:0;z-index:70;pointer-events:auto;display:none;flex-direction:column;gap:4px;background:#080e14;color:#e8f4f6;font:bold 11px/1.25 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.3px;' + 'padding:calc(6px + env(safe-area-inset-top)) calc(8px + env(safe-area-inset-right)) calc(6px + var(--sab33,0px) + env(safe-area-inset-bottom)) calc(8px + env(safe-area-inset-left));box-sizing:border-box;touch-action:manipulation}' + '#tp33 .h{display:flex;gap:6px;align-items:center;flex:0 0 auto}#tp33 .h .tt{font-size:13px;color:#fff;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' + '#tp33 button{font:inherit;font-size:10px;border:0;border-radius:3px;padding:4px 7px;background:#c9d6d9;color:#0b1a20;text-transform:uppercase;flex:0 0 auto}#tp33 button.y{background:#ffd23a}#tp33 button.g{background:#7dff7a}' + '#tp33 .w{flex:0 0 auto;color:#ff5a4a;font-size:10px;line-height:1.3;border:2px solid #ff5a4a;padding:3px 5px;background:rgba(80,0,0,.4)}#tp33 .st{flex:0 0 auto;font-size:11px}#tp33 .st.ok33{color:#7dff7a}#tp33 .st.warn33{color:#ff5a4a}#tp33 .m{flex:0 0 auto;color:#ffd23a;font-size:10px;min-height:0}' + '#tp33 .sc{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;border:1px solid #22313d;background:rgba(0,0,0,.25);padding:3px}' + '#tp33 .gh{font-size:10px;color:#8fe3f0;margin:4px 0 2px}#tp33 .gr{display:flex;flex-wrap:wrap;gap:3px}#tp33 .gr button{max-width:15em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:#7dff7a;padding:4px 6px}' + '#tp33 .gr button.x{background:#3a4a55;color:#9fb3bd;text-decoration:line-through}#tp33 .gr button.ct{box-shadow:inset 0 0 0 2px #ffd23a}#tp33 .gr button.bad{background:#5a2a2a;color:#ff9a8a}#tp33 .gr button i{font-style:normal;color:#0b1a20;opacity:.7;margin-left:4px;font-size:9px}#tp33 .gr button.x i{color:#9fb3bd}';
  document.head.appendChild(s);
 }
 function groupsFor(kind) {
  const e = eff(kind), u = e.u, out = [];
  if (kind === 'col' && window.COL25 && COL25.confsNow33) {
   const C = COL25.confsNow33(u.base.concat(ctPicked(kind)), true);
   for (const k of Object.keys(C)) out.push([ k, C[k].filter(id => u.base.includes(id)) ]);
  } else if (kind === 'ult' && window.COL25 && COL25.groups) {
   const g = COL25.groups();
   for (const k of [ 'PRO', 'WORLD', 'COLLEGE', 'N/A' ]) out.push([ k + ' TEAMS', (g[k] || []).filter(id => u.base.includes(id)) ]);
  } else out.push([ kind === 'wg' ? 'COUNTRIES (BASE TEAMS)' : 'BASE TEAMS', u.base.slice() ]);
  if (u.na.length) out.push([ 'N/A TEAMS (EXTRAS - NO PRIZE RULE)', u.na.slice() ]);
  if (incOn(kind)) out.push([ 'CARD TEAMS (EXTRAS - NO PRIZE RULE)', u.ct.slice() ]);
  return out.filter(x => x[1].length);
 }
 function chip(kind, id, s, u, cpk) {
  const ct = u.ct.includes(id), bad = ct && u.ctBad[id], on = ct ? cpk.includes(id) && !s.off.has(id) : !s.off.has(id);
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.tid = id;
  b.className = (on ? '' : 'x') + (ct ? ' ct' : '') + (bad ? ' bad' : '');
  b.textContent = nm(id);
  const cf = V33.confTag ? V33.confTag(kind, id) : '';
  if (cf) {
   const i = document.createElement('i');
   i.textContent = cf;
   b.appendChild(i);
  }
  b.setAttribute('aria-label', nm(id) + (on ? ' IN' : ' OUT'));
  b.addEventListener('click', ev => {
   ev.preventDefault();
   ev.stopPropagation();
   if (b.__held33) {
    b.__held33 = false;
    return;
   }
   const why = toggle(kind, id);
   ovMsg = why || '';
   draw();
  });
  if (V33.holdBind) V33.holdBind(b, kind, id);
  return b;
 }
 function draw() {
  if (!ov || !ovOpen) return;
  const kind = ovKind, s = sel(kind), u = universe(kind), cpk = ctPicked(kind), st = status(kind), sc = ov.querySelector('.sc'), top = sc ? sc.scrollTop : 0;
  ov.innerHTML = '';
  const h = document.createElement('div');
  h.className = 'h';
  const tt = document.createElement('div');
  tt.className = 'tt';
  tt.textContent = 'PICK THE TEAMS - ' + KN[kind];
  h.appendChild(tt);
  const mk = (lab, cls, fn, id) => {
   const b = document.createElement('button');
   b.type = 'button';
   b.textContent = lab;
   if (cls) b.className = cls;
   if (id) b.id = id;
   b.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    fn();
   });
   return b;
  };
  h.appendChild(mk('SELECT ALL', '', () => {
   s.off = new Set;
   s.ctOn = null;
   ovMsg = '';
   draw();
  }, 'tp33all'));
  if (V33.balanceBtn) {
   const bb = V33.balanceBtn(kind, draw);
   if (bb) h.appendChild(bb);
  }
  h.appendChild(mk('DONE', 'g', () => close(true), 'tp33done'));
  ov.appendChild(h);
  const w = document.createElement('div');
  w.className = 'w';
  w.id = 'tp33warn';
  w.textContent = WARN;
  ov.appendChild(w);
  const sd = document.createElement('div');
  sd.className = 'st ' + st.cls;
  sd.id = 'tp33st';
  sd.textContent = st.t;
  ov.appendChild(sd);
  const m = document.createElement('div');
  m.className = 'm';
  m.id = 'tp33msg';
  m.textContent = ovMsg || (V33.holdBind && kind === 'col' && !window.__rl_no33conf ? 'TAP A TEAM = IN / OUT.  HOLD A TEAM = ITS CONFERENCE.' + (V33.confWarn && V33.confWarn() ? '  ' + V33.confWarn() : '') : 'TAP A TEAM = IN / OUT.');
  ov.appendChild(m);
  const box = document.createElement('div');
  box.className = 'sc';
  box.id = 'tp33list';
  for (const [hd, ids] of groupsFor(kind)) {
   const gh = document.createElement('div');
   gh.className = 'gh';
   gh.textContent = hd;
   box.appendChild(gh);
   const gr = document.createElement('div');
   gr.className = 'gr';
   for (const id of ids) gr.appendChild(chip(kind, id, s, u, cpk));
   box.appendChild(gr);
  }
  ov.appendChild(box);
  box.scrollTop = top;
 }
 function open(kind, done) {
  if (!onPick() && !V33.incOn(kind)) return;
  css();
  if (!ov) {
   ov = document.createElement('div');
   ov.id = 'tp33';
   document.body.appendChild(ov);
   [ 'pointerdown', 'touchstart', 'click' ].forEach(t => ov.addEventListener(t, e => e.stopPropagation()));
  }
  ovKind = kind;
  ovMsg = '';
  ovDone = done || null;
  ovOpen = true;
  try {
   const sb = getComputedStyle(document.documentElement).getPropertyValue('--sab');
   ov.style.setProperty('--sab33', '0px');
  } catch (e) {}
  ov.style.display = 'flex';
  draw();
 }
 function close(check) {
  if (check && !eff(ovKind).ok) {
   ovMsg = 'PICK AT LEAST ' + MIN + ' TEAMS - EVERY SEASON NEEDS ' + MIN + '+';
   draw();
   return;
  }
  ovOpen = false;
  if (ov) {
   ov.style.display = 'none';
   ov.innerHTML = '';
  }
  const f = ovDone;
  ovDone = null;
  if (f) {
   try {
    f();
   } catch (e) {
    console.error(e);
   }
  }
  try {
   panelDirty();
  } catch (e) {}
 }
 V33.pickerOpen = open;
 V33.pickerClose = close;
 V33.pickerIsOpen = isOpen;
 V33.pickerDraw = draw;
 V33.rowsHtml = function(kind, act) {
  const u = universe(kind), out = [];
  if (onInc() && kind !== 'wg' && u.ct.length) {
   const on = sel(kind).inc, cpk = ctPicked(kind);
   out.push('<div class="row" id="ss33inc"><span class="note" style="align-self:center">INCLUDE CARD TEAMS?</span>' + btn('YES', act, kind + '|inc|1', on ? 'y' : 'd') + btn('NO', act, kind + '|inc|0', !on ? 'y' : 'd') + (on ? u.ct.map(id => btn((cpk.includes(id) ? '' : 'X ') + nm(id), act, kind + '|ct|' + id, u.ctBad[id] ? 'd bad33' : cpk.includes(id) ? 'g' : 'd')).join('') : '<span class="note" style="align-self:center">YOUR CARD TEAMS PLAY IN THIS SEASON</span>') + '</div>');
  }
  if (kind === 'pro' && u.na.length) {
   const s = sel(kind);
   out.push('<div class="row" id="ss33na"><span class="note" style="align-self:center">WHICH N/A TEAMS?</span>' + u.na.map(id => btn((s.off.has(id) ? 'X ' : '') + nm(id), act, kind + '|na|' + id, s.off.has(id) ? 'd' : 'g')).join('') + '</div>');
  }
  if (onPick()) {
   const st = status(kind);
   out.push('<div class="row" id="ss33pick">' + btn('PICK TEAMS', act, kind + '|pick|1', 'y') + '<span class="' + st.cls + '" id="ss33st" style="align-self:center">' + esc(st.t) + '</span></div>');
  }
  if (V33.msg33 && V33.msg33[kind]) out.push('<div class="warn33" id="ss33msg">' + esc(V33.msg33[kind]) + '</div>');
  return out.join('');
 };
 V33.msg33 = {};
 V33.rowAct = function(v, redraw) {
  const [kind, k, x] = String(v).split('|');
  V33.msg33[kind] = '';
  if (k === 'inc') setInc(kind, x === '1'); else if (k === 'ct' || k === 'na') {
   const why = toggle(kind, x);
   if (why) V33.msg33[kind] = why;
  } else if (k === 'pick') {
   open(kind, redraw);
   return;
  }
  if (redraw) redraw();
 };
 V33.startOk = function(kind) {
  if (!onPick() && !incOn(kind)) return true;
  const e = eff(kind);
  if (!e.ok) {
   V33.msg33[kind] = 'PICK AT LEAST ' + MIN + ' TEAMS - EVERY SEASON NEEDS ' + MIN + '+ (TAP PICK TEAMS)';
   return false;
  }
  if (e.np && !window.confirm('NO TROPHY + NO PRIZES THIS SEASON\n\nYOU TOOK OUT ' + e.removed.length + ' BASE TEAM' + (e.removed.length > 1 ? 'S' : '') + ' (' + e.removed.slice(0, 4).map(nm).join(', ') + (e.removed.length > 4 ? '...' : '') + ').\nA SEASON WITHOUT EVERY BASE TEAM GIVES NO TROPHY, NO TITLE, NO PLAYER / COACH CARDS AND NO OTHER SEASON PRIZES.\n\nSTART IT ANYWAY?')) return false;
  return true;
 };
 const RS1 = PANEL_RENDER.seasonSetup;
 PANEL_RENDER.seasonSetup = function() {
  const h = RS1.apply(this, arguments);
  if (!onPick() && !(onInc() && universe('pro').ct.length)) return h;
  const k = h.lastIndexOf('<div class="row" style="flex-direction:column;align-items:stretch">');
  if (k < 0) return h;
  return h.slice(0, k) + V33.rowsHtml('pro', 'ss33') + h.slice(k);
 };
 PANEL_ACT.ss33 = v => V33.rowAct(v, () => panelDirty());
 {
  const LG0 = PANEL_ACT.league;
  PANEL_ACT.league = function() {
   if (screen === 'seasonSetup' && !V33.startOk('pro')) {
    panelDirty();
    return;
   }
   return LG0.apply(this, arguments);
  };
 }
 if (window.V232 && V232.seasonPickOpts) {
  const SPO = V232.seasonPickOpts;
  V232.seasonPickOpts = function() {
   const o = SPO.apply(this, arguments) || {};
   if (!onPick() && !onInc()) return o;
   const e = eff('pro');
   return e.custom || V33.list('pro').length ? Object.assign({}, o, {
    only: e.ids
   }) : o;
  };
 }
 {
  const SS0 = PANEL_ACT.ss232;
  if (typeof SS0 === 'function') PANEL_ACT.ss232 = function(v) {
   const r = SS0.apply(this, arguments);
   if (/^lg:/.test(String(v))) {
    const s = sel('pro');
    s.off = new Set([ ...s.off ].filter(id => !TEAMS.some(t => t.id === id)));
   }
   return r;
  };
 }
 const MS1 = window.makeSeason;
 window.makeSeason = function(teamId) {
  const e = onPick() || onInc() ? eff('pro') : null;
  const S = MS1.apply(this, arguments);
  try {
   if (S && e && e.custom && e.ids.includes(teamId)) custom(S, teamId, e);
  } catch (er) {
   console.error(er);
   LOG33.push(String(er));
  }
  return S;
 };
 const LOG33 = [];
 V33.LOG33 = LOG33;
 function custom(S, teamId, e) {
  const ids = [ teamId, ...e.ids.filter(id => id !== teamId).sort(() => Math.random() - .5) ];
  const sch = window.V232 && V232.schedule ? V232.schedule(ids) : null;
  if (!sch) return;
  const table = {};
  ids.forEach(i => table[i] = {
   w: 0,
   l: 0,
   gf: 0,
   ga: 0
  });
  Object.assign(S, {
   teams: ids,
   rounds: sch,
   table: table,
   week: 0,
   playoff: null,
   champ: null,
   results: []
  });
  if (!S.lg232) S.lg232 = (window.V232 && V232.sChoice ? V232.sChoice().lg : 'ALL') || 'ALL';
  if (S.na232 && !e.na.length) delete S.na232;
  S.t33 = {
   removed: e.removed.slice(),
   card: e.ct.slice(),
   na: e.na.slice(),
   n: ids.length
  };
  if (e.np) S.np33 = 1; else delete S.np33;
  const drafting = !(S.base232 || S.phase !== 'draft'), dU = drafting && !!V33.kindOf(teamId) && !!(window.V331 && V331.draftCT && V331.draftCT());
  if (window.V331 && V331.draftCT && V331.draftCT() && V33.kindOf(teamId)) S.ct331 = dU ? 'draft' : 'own'; else delete S.ct331;
  const cards = new Set, ctIds = ids.filter(id => V33.kindOf(id) && !(dU && id === teamId));
  for (const id of ctIds) for (const p of T(id).roster || []) cards.add(p);
  if (!drafting) {
   S.rosters = {};
   S.lineups = {};
   for (const t of ids) {
    S.rosters[t] = (T(t).roster || []).filter(id => PP(id));
    S.lineups[t] = autoLineup(S.rosters[t]);
   }
   delete S.draft;
   S.phase = 'reg';
  } else {
   const draftTeams = ids.filter(id => !V33.kindOf(id) || dU && id === teamId);
   const D = makeDraft(Object.assign({}, S, {
    teams: draftTeams.length ? draftTeams : ids
   }));
   {
    const cnt = {};
    for (const id of D.pool) {
     const ps = PP(id).pos;
     cnt[ps] = (cnt[ps] || 0) + 1;
    }
    const nT = D.order.length;
    D.pool = D.pool.filter(id => {
     if (!cards.has(id)) return true;
     const ps = PP(id).pos;
     if ((cnt[ps] || 0) - 1 >= (QUOTA[ps] || 0) * nT + 2) {
      cnt[ps]--;
      return false;
     }
     return true;
    });
   }
   for (const id of ctIds) D.rosters[id] = (T(id).roster || []).filter(x => PP(x));
   D.user = S.team;
   S.draft = D;
   if (V33.kindOf(S.team) && !dU || !draftTeams.length) {
    S.draft.order = draftTeams;
    finishDraft(S);
    S.phase = 'reg';
   } else draftRunCpu(S.draft, S.team);
  }
 }
 {
  const DM0 = window.drawMenu;
  if (typeof DM0 === 'function') window.drawMenu = function() {
   if (!ovOpen) for (const k in SEL) {
    if (SEL[k].off.size || SEL[k].ctOn) reset(k);
   }
   return DM0.apply(this, arguments);
  };
 }
})();

(function() {
 const nm = id => {
  const t = T(id);
  return t ? String(t.name || id).toUpperCase() : id;
 };
 V33.domRows = function(kind, root, el, redraw) {
  const u = V33.universe(kind), out = {
   only: null,
   ct: [],
   tab: false
  };
  if (!V33.onPick() && !(V33.onInc() && u.ct.length)) return null;
  const box = el('div', {
   class: 'ss33',
   id: 'ss33' + kind
  });
  const b = (lab, cls, fn, id) => {
   const x = el('button', {
    class: cls || '',
    id: id || '',
    type: 'button',
    on: {
     click: ev => {
      ev.preventDefault();
      ev.stopPropagation();
      fn();
      redraw();
     }
    }
   }, [ lab ]);
   return x;
  };
  if (V33.onInc() && kind !== 'wg' && u.ct.length) {
   const on = V33.sel(kind).inc, e = V33.eff(kind), r = el('div', {
    class: 'ss33r',
    id: 'ss33inc' + kind
   }, [ el('span', {
    class: 'sm',
    text: 'INCLUDE CARD TEAMS?'
   }) ]);
   r.appendChild(b('YES', on ? 'y' : 'w', () => V33.setInc(kind, true), 'ss33incY'));
   r.appendChild(b('NO', !on ? 'y' : 'w', () => V33.setInc(kind, false), 'ss33incN'));
   if (on) for (const id of u.ct) {
    const inn = e.ct.includes(id);
    r.appendChild(b((inn ? '' : 'X ') + nm(id), u.ctBad[id] ? 'w bad33' : inn ? 'g' : 'w', () => {
     const why = V33.toggle(kind, id);
     V33.msg33[kind] = why || '';
    }, 'ss33ct_' + id));
   } else r.appendChild(el('span', {
    class: 'sm',
    text: 'YOUR CARD TEAMS PLAY IN IT'
   }));
   box.appendChild(r);
  }
  if (V33.onPick()) {
   const st = V33.status(kind), r = el('div', {
    class: 'ss33r',
    id: 'ss33pick' + kind
   });
   r.appendChild(b('PICK TEAMS', 'y', () => V33.pickerOpen(kind, redraw), 'ss33pickb'));
   r.appendChild(el('span', {
    class: st.cls,
    id: 'ss33st' + kind,
    text: st.t
   }));
   box.appendChild(r);
  }
  if (V33.msg33[kind]) box.appendChild(el('div', {
   class: 'warn33',
   id: 'ss33msg' + kind,
   text: V33.msg33[kind]
  }));
  root.appendChild(box);
  const e = V33.eff(kind);
  out.ct = e.ct.slice();
  out.tab = e.ct.length > 0;
  out.only = e.custom ? e.ids : null;
  return out;
 };
 V33.ultRows = (root, el, redraw) => window.COL25 && COL25.on2501 && COL25.on2501() ? V33.domRows('ult', root, el, redraw) : null;
 const s = document.createElement('style');
 s.textContent = '.ss33{flex:0 0 auto;display:flex;flex-direction:column;gap:3px;margin:2px 0}.ss33r{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.ss33r button{font:inherit;font-size:10px;padding:3px 7px}' + '.ss33 .ok33{color:#7dff7a;font-size:10px}.ss33 .warn33,.warn33{color:#ff5a4a;font-size:10px}.ss33r button.g{background:#7dff7a;color:#0b1a20}.ss33r button.y{background:#ffd23a;color:#0b1a20}.ss33r button.bad33{background:#5a2a2a;color:#ff9a8a}';
 document.head.appendChild(s);
})();

(function() {
 V33.confMap = V33.confMap || (kind => ({}));
 V33.colSeason = function(C, team) {
  if (!V33.onPick() && !V33.incOn('col')) return;
  const e = V33.eff('col'), cm = V33.confMap('col') || {}, moved = Object.keys(cm).filter(id => e.ids.includes(id));
  if (!e.custom && !moved.length) return;
  if (!e.ids.includes(team)) return;
  C.ids33 = e.ids.slice();
  C.conf33 = {};
  for (const id of C.ids33) if (cm[id]) C.conf33[id] = cm[id];
  C.t33 = {
   removed: e.removed.slice(),
   card: e.ct.slice(),
   n: C.ids33.length
  };
  if (e.np) C.np33 = 1;
 };
})();

(function() {
 const on = () => V33.onPick();
 const nm = id => {
  const t = T(id);
  return t ? String(t.abbr || t.name || id).toUpperCase() : id;
 };
 V33.wgPool = list => {
  if (!on()) return list;
  const e = V33.eff('wg');
  return e.custom ? list.filter(t => e.ids.includes(t.id)) : list;
 };
 V33.wgExtra = function(by) {
  if (!on()) return;
  const e = V33.eff('wg'), x = 70, lab = 'PICK TEAMS';
  button(lab, x, by, textW(lab) + 12, 19, () => V33.pickerOpen('wg', () => {}), {
   bg: '#ffd23a'
  });
  const tot = e.u.base.length, s = !e.ok ? e.n + ' TEAMS - NEED ' + V33.MIN + '+' : e.np ? e.n + '/' + tot + ' - NO TROPHY + NO PRIZES' : e.n + '/' + tot + ' - TROPHY + PRIZES ON';
  const tx = x + textW(lab) + 18;
  if (tx + textW(s) <= W - 4) text(s, tx, by + 7, 1, e.np || !e.ok ? '#ff5a4a' : '#7dff7a'); else textMini(s, tx, by + 8, e.np || !e.ok ? '#ff5a4a' : '#7dff7a', .65);
 };
 function rr(ids) {
  const a = ids.slice();
  if (a.length % 2) a.push(null);
  const n = a.length, out = [];
  for (let r = 0; r < n - 1; r++) {
   const gs = [];
   for (let i = 0; i < n / 2; i++) {
    const x = a[i], y = a[n - 1 - i];
    if (x && y) gs.push(r % 2 ? [ y, x ] : [ x, y ]);
   }
   out.push(gs);
   a.splice(1, 0, a.pop());
  }
  return out;
 }
 function custom(team, ids, n) {
  const N = ids.length, P = N <= 8 ? 1 : N <= 16 ? 2 : 4, keys = WG_POOLS.slice(0, P), pools = {
   A: [],
   B: [],
   C: [],
   D: []
  };
  const seed = ids.slice().sort((a, b) => {
   try {
    return teamOvr(b, 'real') - teamOvr(a, 'real');
   } catch (e) {
    return 0;
   }
  });
  seed.forEach((id, i) => {
   const r = Math.floor(i / P), c = i % P;
   pools[keys[r % 2 ? P - 1 - c : c]].push(id);
  });
  const per = keys.map(k => rr(pools[k]).map(gs => gs.map(g => [ g[0], g[1], k ]))), R = Math.max(...per.map(x => x.length)), rounds = [];
  for (let r = 0; r < R; r++) rounds.push([].concat(...per.map(x => x[r] || [])));
  const table = {};
  for (const id of ids) table[id] = {
   w: 0,
   l: 0,
   gf: 0,
   ga: 0
  };
  return {
   v: 16,
   c33: 1,
   P: P,
   team: team,
   teams: seed,
   pools: pools,
   rounds: rounds,
   round: 0,
   phase: 'pool',
   table: table,
   results: [],
   ko: null,
   champ: null,
   stats: {},
   elim: false,
   finish: null,
   n: n
  };
 }
 function skip(w) {
  let k = 0;
  while (w && w.c33 && w.phase === 'pool' && w.round < w.rounds.length && !(w.rounds[w.round] || []).some(g => g[0] === w.team || g[1] === w.team) && k++ < 20) {
   for (const g of w.rounds[w.round]) {
    const [sa, sb] = wgSim16(g[0], g[1]);
    wgApply16(w, g[0], g[1], sa, sb, 'POOL ' + g[2] + ' - ROUND ' + (w.round + 1));
   }
   w.round++;
   if (w.round >= w.rounds.length) wgKoStart16(w);
  }
 }
 V33.wgSkip = skip;
 const WN0 = window.wgNew16;
 window.wgNew16 = function(team) {
  const e = on() ? V33.eff('wg') : null;
  const w = WN0.apply(this, arguments);
  try {
   if (w && e && e.custom && e.ids.includes(team)) {
    const c = custom(team, e.ids, w.n);
    c.t33 = {
     removed: e.removed.slice(),
     n: e.ids.length
    };
    if (e.np) c.np33 = 1;
    skip(c);
    return c;
   }
  } catch (er) {
   console.error(er);
  }
  return w;
 };
 const KS0 = window.wgKoStart16;
 window.wgKoStart16 = function(w) {
  if (!w || !w.c33 || w.P === 4) return KS0.apply(this, arguments);
  const s = {};
  for (const k of WG_POOLS) s[k] = wgStand16(w, k).map(r => r.id);
  w.phase = 'ko';
  if (w.P === 1) {
   w.ko = {
    round: 'semi',
    games: [ [ s.A[0], s.A[3] ], [ s.A[1], s.A[2] ] ],
    br: {
     qf: [],
     semi: [],
     final: []
    }
   };
   w.ko.br.semi = w.ko.games.map(g => [ g[0], g[1], null, null ]);
  } else {
   w.ko = {
    round: 'qf',
    games: [ [ s.A[0], s.B[3] ], [ s.B[1], s.A[2] ], [ s.B[0], s.A[3] ], [ s.A[1], s.B[2] ] ],
    br: {
     qf: [],
     semi: [],
     final: []
    }
   };
   w.ko.br.qf = w.ko.games.map(g => [ g[0], g[1], null, null ]);
  }
  if (!w.ko.games.some(g => g.includes(w.team))) {
   w.elim = true;
   w.finish = 'OUT IN POOL ' + wgPoolOf16(w, w.team);
   wgKoRest16(w);
  }
 };
 const WP0 = window.wgPlayed16;
 window.wgPlayed16 = function(w) {
  const r = WP0.apply(this, arguments);
  try {
   if (w && w.c33) {
    skip(w);
    wgSave16();
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 };
 const NX0 = window.wgNext16;
 window.wgNext16 = function(w) {
  const r = NX0.apply(this, arguments);
  if (r && w && w.c33 && w.phase === 'pool') r.label = 'POOL ' + r.g[2] + ' - ROUND ' + (w.round + 1) + ' OF ' + w.rounds.length;
  return r;
 };
 const SS0 = window.wgStatus16;
 window.wgStatus16 = function(w) {
  if (w && w.c33 && w.phase === 'pool' && !w.elim) return 'POOL ' + wgPoolOf16(w, w.team) + ' - ROUND ' + (w.round + 1) + ' OF ' + w.rounds.length + (V33.np(w) ? ' - NO TROPHY' : '');
  return SS0.apply(this, arguments);
 };
 V33.drawWgPools = function(w, x, y, wd) {
  const keys = WG_POOLS.filter(k => (w.pools[k] || []).length), P = keys.length, cols = P === 1 ? 1 : 2, pw = Math.floor((wd - (cols - 1) * 4) / cols);
  const rows = Math.max(...keys.map(k => w.pools[k].length)), rh = P === 4 ? 7 : 10, bh = 10 + rows * rh + 2;
  keys.forEach((k, pi) => {
   const px = x + pi % cols * (pw + 4), py = y + Math.floor(pi / cols) * (bh + 3);
   rect(px, py, pw, bh, 'rgba(10,16,22,.75)');
   text('POOL ' + k, px + 3, py + 2, 1, '#ffe14d');
   text('W-L', px + pw - 22, py + 2, 1, '#7f9aa6', 'center');
   text('+/-', px + pw - 7, py + 2, 1, '#7f9aa6', 'center');
   wgStand16(w, k).forEach((r, j) => {
    const yy = py + 10 + j * rh, mine = r.id === w.team, gd = r.gf - r.ga;
    if (mine) rect(px + 1, yy - 1, pw - 2, rh - 1, '#1f4a52');
    rect(px + 3, yy, 3, 5, accent(T(r.id)));
    text(nm(r.id), px + 9, yy, 1, mine ? '#ffe14d' : '#fff');
    text(r.w + '-' + r.l, px + pw - 22, yy, 1, '#fff', 'center');
    text((gd > 0 ? '+' : '') + gd, px + pw - 7, yy, 1, gd >= 0 ? '#7dff7a' : '#ff8a7a', 'center');
   });
  });
  if (V33.np(w)) text('NO TROPHY + NO PRIZES: COUNTRIES WERE TAKEN OUT', x + wd / 2, Math.min(H - 12, y + Math.ceil(P / cols) * (bh + 3) + 2), 1, '#ff5a4a', 'center');
 };
 V33.wgBrText = function(w, x, y, wd) {
  const t = w.P === 1 ? [ 'SEMIS AFTER POOL PLAY', '1 V 4   2 V 3', 'THEN THE FINAL' ] : w.P === 2 ? [ 'QUARTERFINALS AFTER POOL PLAY', 'A1 V B4   B2 V A3', 'B1 V A4   A2 V B3', 'THEN SEMIS + THE FINAL' ] : [ 'QUARTERFINALS AFTER POOL PLAY', 'A1 V B2   C1 V D2', 'B1 V A2   D1 V C2', 'THEN SEMIS + THE FINAL' ];
  t.forEach((s, i) => text(s, x + wd / 2, y + 4 + i * 14, 1, i ? '#cfe' : '#ffe14d', 'center'));
 };
})();

(function() {
 const off = () => !!window.__rl_no33names || !window.RLNET;
 const cl = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').slice(0, n);
 function idsOf(tid, lu) {
  const out = new Set(T(tid).roster || []);
  const walk = v => {
   if (Array.isArray(v)) v.forEach(walk); else if (typeof v === 'string') out.add(v);
  };
  if (lu && typeof lu === 'object') for (const k of Object.keys(lu)) walk(lu[k]);
  return [ ...out ].filter(id => PP(id));
 }
 function payload(tid, lu) {
  const t = T(tid);
  if (!t || t.id !== tid) return null;
  const p = {};
  for (const id of idsOf(tid, lu)) {
   const pl = PP(id);
   if (pl && pl.n) p[id] = cl(pl.n, 32);
  }
  return {
   tid: tid,
   t: cl(t.name, 32),
   f: cl(t.full || t.name, 48),
   a: cl(t.abbr || '', 5),
   p: p
  };
 }
 V33.namesPayload = payload;
 let applied = null;
 function restore() {
  if (!applied) return;
  const a = applied;
  applied = null;
  try {
   const t = T(a.team.tid);
   if (t && t.id === a.team.tid) {
    t.name = a.team.name;
    t.full = a.team.full;
    t.abbr = a.team.abbr;
   }
  } catch (e) {}
  for (const id of Object.keys(a.pl)) {
   try {
    const pl = PP(id);
    if (pl) pl.n = a.pl[id];
   } catch (e) {}
  }
 }
 function apply(d, mine) {
  const key = JSON.stringify(d) + '|' + mine;
  if (applied && applied.key === key) return;
  restore();
  const t = T(d.tid);
  if (!t || t.id !== d.tid) return;
  const myIds = new Set(mine ? T(mine).roster || [] : []), a = {
   key: key,
   team: {
    tid: d.tid,
    name: t.name,
    full: t.full,
    abbr: t.abbr
   },
   pl: {}
  };
  if (d.tid !== mine) {
   if (d.t) t.name = d.t;
   if (d.f) t.full = d.f;
   if (d.a) t.abbr = d.a;
  }
  for (const id of Object.keys(d.p || {})) {
   if (myIds.has(id)) continue;
   const pl = PP(id);
   if (!pl || typeof d.p[id] !== 'string' || !d.p[id]) continue;
   a.pl[id] = pl.n;
   pl.n = d.p[id];
  }
  applied = a;
 }
 V33.namesApplied = () => applied ? {
  tid: applied.team.tid,
  n: Object.keys(applied.pl).length
 } : null;
 let lastSend = {
  sig: '',
  t: 0
 };
 function tick() {
  if (off()) {
   restore();
   return;
  }
  const N = window.RLNET;
  if (!N.code || !N.side) {
   restore();
   return;
  }
  const st = (N.inGame ? N.st : N.lobby && N.lobby.state) || {};
  if (st.season) {
   restore();
   return;
  }
  const me = N.side, op = me === 'h' ? 'g' : 'h', myTid = st[me + 'team'], opTid = st[op + 'team'];
  if (!N.inGame && N.lobby && N.lobby.state && myTid) {
   const k = me + 'szn', cur = N.lobby.state[k], pay = payload(myTid, N.lobby.state[me + 'lu']);
   if (pay) {
    const sig = JSON.stringify(pay);
    if (!(cur && cur.nm33 && JSON.stringify(cur.nm33) === sig) && !(lastSend.sig === sig + k && Date.now() - lastSend.t < 4e3)) {
     const nv = cur && cur.id && cur.id === myTid ? Object.assign({}, cur, {
      nm33: pay
     }) : cur && cur.id ? null : {
      nm33: pay
     };
     if (nv) {
      lastSend = {
       sig: sig + k,
       t: Date.now()
      };
      N.lobby.state[k] = nv;
      try {
       N.patchLobby({
        [k]: nv
       });
      } catch (e) {}
     }
    }
   }
  }
  const d = st[op + 'szn'] && st[op + 'szn'].nm33;
  if (d && typeof d === 'object' && opTid && d.tid === opTid) apply(d, myTid); else restore();
 }
 setInterval(() => {
  try {
   tick();
  } catch (e) {
   console.error(e);
  }
 }, 300);
 V33.namesTick = tick;
 const PT0 = V33.proTiles;
 V33.proTiles = function(opts) {
  if (typeof screen !== 'undefined' && [ 'online', 'onJoin', 'onTeam', 'onLobby', 'onSeason', 'onSeasonTeam' ].includes(screen)) return [];
  return PT0.apply(this, arguments);
 };
})();

(function() {
 const KEY = 'bl33_conf', MAXC = 10, MINC = 4;
 const on = () => !window.__rl_no33conf && !!window.COL25 && !!COL25.CONFS33;
 const nm = id => {
  const t = T(id);
  return t ? String(t.name || id).toUpperCase() : id;
 };
 function load() {
  const o = LS.get(KEY, null);
  return o && typeof o === 'object' && o.col && typeof o.col === 'object' ? o : {
   col: {},
   names: [],
   v: 1
  };
 }
 function save(o) {
  LS.set(KEY, o);
 }
 const real = id => COL25.confOf33(id) || '';
 V33.confMap = function(kind) {
  if (kind !== 'col' || !on()) return {};
  const o = load(), out = {};
  for (const id of Object.keys(o.col)) {
   const c = o.col[id];
   if (!c) continue;
   if (V33.kindOf(id) ? !!SZ_REG[id] : real(id)) {
    if (c !== real(id)) out[id] = c;
   }
  }
  return out;
 };
 const confOf = id => V33.confMap('col')[id] || real(id) || 'CARD TEAMS';
 function sizes() {
  const e = V33.eff('col'), m = {};
  for (const id of e.ids) {
   const c = confOf(id);
   (m[c] = m[c] || []).push(id);
  }
  return m;
 }
 function names() {
  const o = load(), s = new Set(Object.keys(COL25.CONFS33));
  for (const n of o.names || []) s.add(n);
  s.add('CARD TEAMS');
  for (const c of Object.values(V33.confMap('col'))) s.add(c);
  return [ ...s ];
 }
 V33.confNames = names;
 V33.confOf = confOf;
 V33.confSizes = sizes;
 V33.confMove = function(id, c) {
  if (!on()) return 'OFF';
  const to = c || real(id) || 'CARD TEAMS', from = confOf(id);
  if (to === from) return null;
  const sz = sizes(), inSeason = V33.eff('col').ids.includes(id);
  if (inSeason && (sz[to] || []).length + 1 > MAXC) return to + ' IS FULL - CONFERENCES STAY BALANCED (MAX ' + MAXC + ' TEAMS)';
  if (inSeason && !V33.kindOf(id) && COL25.CONFS33[from] && (sz[from] || []).length - 1 < MINC) return from + ' WOULD DROP UNDER ' + MINC + ' TEAMS - CONFERENCES STAY BALANCED';
  const o = load();
  if (!c || c === real(id)) delete o.col[id]; else o.col[id] = c;
  if (c && !COL25.CONFS33[c] && c !== 'CARD TEAMS' && !(o.names || []).includes(c)) (o.names = o.names || []).push(c);
  save(o);
  return null;
 };
 V33.confNew = function(id, raw) {
  const s = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim().toUpperCase();
  if (!s) return 'TYPE A NAME FIRST';
  if (s.length > 18) return 'MAX 18 CHARACTERS';
  if (!/^[A-Z0-9 .'&-]+$/.test(s)) return "LETTERS, NUMBERS, SPACE AND . ' & - ONLY";
  try {
   const p = window.ED31_nameProblem ? ED31_nameProblem(s) : window.C30 && C30.badName ? C30.badName(s) : null;
   if (p) return p;
  } catch (e) {}
  return V33.confMove(id, s);
 };
 V33.confWarn = function() {
  if (!on()) return '';
  const sz = sizes(), small = Object.keys(sz).filter(c => sz[c].length < MINC);
  return small.length ? 'UNDER ' + MINC + ' TEAMS = NO AUTO BID: ' + small.map(c => c + ' (' + sz[c].length + ')').join(', ') : '';
 };
 V33.confTag = function(kind, id) {
  if (kind !== 'col' || !on()) return '';
  const m = V33.confMap('col');
  return V33.kindOf(id) || m[id] ? confOf(id) : '';
 };
 let menu = null, menuDone = null;
 function closeMenu() {
  if (menu) {
   menu.remove();
   menu = null;
  }
  const f = menuDone;
  menuDone = null;
  if (f) try {
   f();
  } catch (e) {
   console.error(e);
  }
 }
 V33.confMenu = function(id, done) {
  if (!on()) return;
  closeMenu();
  menuDone = done || null;
  menu = document.createElement('div');
  menu.id = 'cf33';
  [ 'pointerdown', 'touchstart', 'click' ].forEach(t => menu.addEventListener(t, e => e.stopPropagation()));
  const card = document.createElement('div');
  card.className = 'c';
  menu.appendChild(card);
  const sz = sizes(), cur = confOf(id), ct = !!V33.kindOf(id);
  const hd = document.createElement('div');
  hd.className = 'hd';
  hd.textContent = nm(id) + ' - CONFERENCE: ' + cur;
  card.appendChild(hd);
  const msg = document.createElement('div');
  msg.className = 'm';
  msg.id = 'cf33msg';
  msg.textContent = 'PICK ITS CONFERENCE (MAX ' + MAXC + ' TEAMS EACH)';
  const gr = document.createElement('div');
  gr.className = 'gr';
  const mk = (lab, cls, fn, bid) => {
   const b = document.createElement('button');
   b.type = 'button';
   b.textContent = lab;
   b.className = cls || '';
   if (bid) b.id = bid;
   b.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    fn();
   });
   return b;
  };
  const go = c => {
   const why = V33.confMove(id, c);
   if (why) {
    msg.textContent = why;
    msg.className = 'm bad';
    return;
   }
   closeMenu();
  };
  for (const c of names()) {
   if (c === cur || c === 'CARD TEAMS' && !ct) continue;
   gr.appendChild(mk(c + ' (' + (sz[c] || []).length + ')', '', () => go(c), 'cf33_' + c.replace(/[^A-Z0-9]/g, '_')));
  }
  card.appendChild(gr);
  const row = document.createElement('div');
  row.className = 'r';
  if (ct) row.appendChild(mk('+ ITS OWN NEW CONFERENCE', 'y', () => {
   let v = null;
   try {
    v = window.prompt('NAME THE NEW CONFERENCE (MAX 18):', nm(id).slice(0, 12) + ' CONF');
   } catch (e) {}
   if (v == null) return;
   const why = V33.confNew(id, v);
   if (why) {
    msg.textContent = why;
    msg.className = 'm bad';
    return;
   }
   closeMenu();
  }, 'cf33new'));
  if (!ct && cur !== real(id)) row.appendChild(mk('BACK TO ' + real(id), 'g', () => go(''), 'cf33real'));
  row.appendChild(mk('CANCEL', 'w', () => closeMenu(), 'cf33cancel'));
  card.appendChild(row);
  card.appendChild(msg);
  document.body.appendChild(menu);
 };
 V33.confMenuOpen = () => !!menu;
 V33.holdBind = function(el, kind, id) {
  if (kind !== 'col' || !on()) return;
  let tm = null, x0 = 0, y0 = 0;
  const clear = () => {
   if (tm) {
    clearTimeout(tm);
    tm = null;
   }
  };
  el.style.webkitTouchCallout = 'none';
  el.style.userSelect = 'none';
  el.style.webkitUserSelect = 'none';
  el.addEventListener('pointerdown', e => {
   x0 = e.clientX;
   y0 = e.clientY;
   clear();
   tm = setTimeout(() => {
    tm = null;
    el.__held33 = true;
    V33.confMenu(id, () => {
     if (V33.pickerIsOpen()) V33.pickerDraw();
     try {
      COL25.dirty();
     } catch (er) {}
    });
   }, 550);
  });
  el.addEventListener('pointermove', e => {
   if (Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 10) clear();
  });
  [ 'pointerup', 'pointercancel', 'pointerleave' ].forEach(t => el.addEventListener(t, clear));
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('click', e => {
   if (el.__held33) {
    el.__held33 = false;
    e.preventDefault();
    e.stopImmediatePropagation();
   }
  }, true);
 };
 const s = document.createElement('style');
 s.textContent = '#cf33{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe}' + '#cf33 .c{background:#0b1118;border:2px solid #ffd23a;padding:8px;max-width:min(92vw,620px);max-height:86vh;overflow:auto;display:flex;flex-direction:column;gap:6px;box-sizing:border-box}' + '#cf33 .hd{color:#ffd23a}#cf33 .gr,#cf33 .r{display:flex;flex-wrap:wrap;gap:4px}#cf33 button{font:inherit;font-size:10px;padding:5px 8px;background:#22313d;color:#cfe;border:1px solid #3a4a55}' + '#cf33 button.y{background:#ffd23a;color:#0b1a20}#cf33 button.g{background:#7dff7a;color:#0b1a20}#cf33 button.w{background:#c9d6d9;color:#0b1a20}#cf33 .m{font-size:10px;color:#8fe3f0}#cf33 .m.bad{color:#ff5a4a}' + '#tp33 .gr button i{font-style:normal;color:#ffd23a;margin-left:4px;font-size:9px}#tp33 .gr button{-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}';
 document.head.appendChild(s);
})();

(function() {
 const off = () => !!window.__rl_no33cu || !window.C30 || !window.V22;
 V33.cuBack = function(id, rec) {
  if (!off() && rec && !window.__rl_v124gb && !window.__rl_no332ncx && typeof id === 'string') id = id.replace(/^U_/, '').replace(/^(AA25-|TW25-)/, '');
  if (off() || !rec || !C30.isC30(id)) return false;
  const d = C30.parse(id);
  if (!d || !d.made) return false;
  if (rec.t && rec.t !== C30.TID) {
   rec.t = C30.TID;
   return true;
  }
  return false;
 };
})();

V33.inUse = function(id) {
 try {
  const S = typeof season !== 'undefined' ? season : null;
  if (S && S.phase !== 'done' && Array.isArray(S.teams) && S.teams.includes(id)) return 'SEASON';
 } catch (e) {}
 try {
  const C = window.COL25 && COL25.cur && COL25.cur();
  if (C && C.phase !== 'done' && Array.isArray(C.ids33) && C.ids33.includes(id)) return 'COLLEGE SEASON';
 } catch (e) {}
 try {
  const U = window.COL25 && COL25.ucur && COL25.ucur();
  if (U && U.phase === 'ko' && Array.isArray(U.field) && U.field.includes(id)) return 'ULTIMATE';
 } catch (e) {}
 return '';
};
