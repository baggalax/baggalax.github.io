'use strict';

const ULT_BOOST = 5;

const ULT331 = (() => {
 const on = () => !window.__rl_v124gb && !window.__rl_no331ult && !!window.V22;
 const PFX = 'U_';
 const isU = id => typeof id === 'string' && id.length > 2 && id.slice(0, 2) === PFX;
 const srcOf = id => isU(id) ? id.slice(2) : id;
 const LOG = {
  made: 0,
  err: []
 };
 function make(id) {
  if (PLAYERS[id]) return PLAYERS[id];
  if (!on() || !isU(id) || isU(srcOf(id))) return null;
  const src = srcOf(id);
  try {
   if (!PLAYERS[src] && window.HON25 && HON25.kindOf && HON25.kindOf(src) && HON25.make) HON25.make(src);
  } catch (e) {}
  const b = PP(src);
  if (!b || !b.r || typeof b.r !== 'object') return null;
  const r = {};
  for (const k of Object.keys(b.r)) r[k] = Math.max(0, Math.min(99, (+b.r[k] || 0) + ULT_BOOST));
  const p = Object.assign({}, b, {
   id: id,
   r: r,
   ult331: 1,
   base331: src,
   base25: b.base25 || src,
   real: !!b.real
  });
  if (p.leg) {
   p.leg331 = p.leg;
   delete p.leg;
  }
  delete p.ovr;
  p.ovr = ovrOf(p);
  try {
   p.skin = b.skin != null ? b.skin : skinOf(b);
  } catch (e) {}
  PLAYERS[id] = p;
  LOG.made++;
  return p;
 }
 function ensure(ids) {
  if (!on()) return;
  for (const id of ids || []) if (isU(id) && !PLAYERS[id]) {
   try {
    make(id);
   } catch (e) {
    LOG.err.push(String(e));
   }
  }
 }
 function ensureOwned() {
  try {
   if (window.V22 && V22.st) ensure(Object.keys(V22.st().cards || {}));
  } catch (e) {}
  try {
   const o = LS.get('bl33_cardteams', null);
   if (o) for (const k of [ 'pro', 'col' ]) for (const t of o[k] || []) ensure(t && t.ids);
  } catch (e) {}
 }
 ensureOwned();
 setInterval(() => {
  try {
   ensureOwned();
  } catch (e) {}
 }, 3e3);
 if (window.V22 && V22.subIds) {
  const si0 = V22.subIds;
  V22.subIds = function(lu) {
   try {
    if (on() && lu && typeof lu === 'object') {
     const a = [];
     for (const k in lu) {
      const v = lu[k];
      for (const x of Array.isArray(v) ? v : [ v ]) if (typeof x === 'string') a.push(x);
     }
     ensure(a);
    }
   } catch (e) {}
   return si0.apply(this, arguments);
  };
 }
 function variant(src) {
  let k = null;
  try {
   k = window.HON25 && HON25.kindOf ? HON25.kindOf(src) : null;
  } catch (e) {}
  const sub = s => {
   try {
    return window.N31 && N31.sub ? N31.sub(s) : s;
   } catch (e) {
    return s;
   }
  };
  return k === 'aa' ? 'ALL AMERICAN' : k === 'tew' ? sub('BAGGATWAAN') : '';
 }
 const label = id => {
  const p = PP(id);
  if (!p) return '';
  const v = variant(srcOf(id));
  return (v ? v + ' ' : '') + 'ULTIMATE ' + String(p.n || '').toUpperCase();
 };
 const tag = id => {
  const v = variant(srcOf(id));
  return (v ? v + ' ' : '') + 'ULTIMATE';
 };
 return {
  on: on,
  PFX: PFX,
  isU: isU,
  srcOf: srcOf,
  make: make,
  ensure: ensure,
  ensureOwned: ensureOwned,
  variant: variant,
  label: label,
  tag: tag,
  LOG: LOG
 };
})();

window.ULT331 = ULT331;

const V331 = (() => {
 const fish = () => !!window.__rl_v124gb;
 const onCT = () => !fish() && !window.__rl_no331ct && !!window.V33 && V33.onCT();
 const LOG = {
  pick: [],
  reg: [],
  block: [],
  err: []
 };
 const cl = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').slice(0, n);
 const disp = s => {
  try {
   return window.N31 && N31.sub ? N31.sub(String(s)) : String(s);
  } catch (e) {
   return String(s);
  }
 };
 const CK = 'bl331_coach';
 const cmap = () => {
  const o = LS.get(CK, null);
  return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
 };
 function ownedCoaches() {
  let a = [];
  try {
   if (window.HON25 && HON25.coachCards) a = HON25.coachCards() || []; else if (window.V232 && V232.coaches) {
    const c = V232.coaches();
    a = Object.keys(c).map(id => ({
     id: id,
     name: c[id].n
    }));
   }
  } catch (e) {
   a = [];
  }
  return a.filter(c => c && c.id && c.name).map(c => ({
   id: String(c.id),
   name: String(c.name).toUpperCase()
  }));
 }
 const coachCard = key => key ? ownedCoaches().find(c => c.id === key) || null : null;
 function coachKey(ctId) {
  if (!onCT()) return null;
  const k = cmap()[ctId];
  return k && coachCard(k) ? k : null;
 }
 function coachUsedBy(key, exceptCt) {
  const m = cmap();
  for (const id of Object.keys(m)) if (id !== exceptCt && m[id] === key && V33.getT(id)) return id;
  return null;
 }
 function setCoach(ctId, key) {
  const m = cmap();
  if (!key) {
   delete m[ctId];
   LS.set(CK, m);
   return null;
  }
  if (!coachCard(key)) return 'YOU DO NOT OWN THAT COACH CARD';
  const u = coachUsedBy(key, ctId);
  if (u) return 'THAT COACH ALREADY COACHES ' + String(T(u).name || u).toUpperCase() + ' (ONE CARD TEAM PER COACH CARD)';
  m[ctId] = key;
  LS.set(CK, m);
  return null;
 }
 V33.coachOf = t => {
  const k = t && coachKey(t.id), c = coachCard(k);
  return c ? c.name : 'YOU';
 };
 V33.onOpen = E => {
  E.co331 = E.id ? coachKey(E.id) || '' : '';
  E.co331msg = '';
 };
 {
  const SV0 = V33.saveTeam;
  V33.saveTeam = function(E) {
   if (onCT() && E && E.co331) {
    const u = coachUsedBy(E.co331, E.id);
    if (u) return {
     err: 'THAT COACH ALREADY COACHES ' + String(T(u).name || u).toUpperCase() + ' - ONE CARD TEAM PER COACH CARD'
    };
    if (!coachCard(E.co331)) return {
     err: 'YOU DO NOT OWN THAT COACH CARD'
    };
   }
   const r = SV0.apply(this, arguments);
   try {
    if (r && r.id && onCT()) {
     setCoach(r.id, E.co331 || null);
     const t = V33.getT(r.id);
     if (t) V33.reg(t, V33.kindOf(r.id));
     LOG.pick.push([ 'coach', r.id, E.co331 || null ]);
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 {
  const DT0 = V33.delTeam;
  V33.delTeam = function(id) {
   const r = DT0.apply(this, arguments);
   try {
    const m = cmap();
    if (m[id]) {
     delete m[id];
     LS.set(CK, m);
    }
   } catch (e) {}
   return r;
  };
 }
 {
  const R1 = PANEL_RENDER.ct33;
  PANEL_RENDER.ct33 = function() {
   const h = R1.apply(this, arguments);
   if (!onCT()) return h;
   const E = V33.E;
   if (!E || E.refuse) return h;
   const k = h.indexOf('<div class="ct33why"');
   if (k < 0) return h;
   const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
   }[ch]));
   const cur = E.co331 || '', list = ownedCoaches().filter(c => c.id === cur || !coachUsedBy(c.id, E.id));
   const o = '<option value=""' + (cur ? '' : ' selected') + '>YOU (NO COACH CARD)</option>' + list.map(c => '<option value="' + esc(c.id) + '"' + (c.id === cur ? ' selected' : '') + '>' + esc(disp(c.name)) + '</option>').join('');
   const row = '<div class="row ct33row" id="ct331co"><span>HEAD COACH</span><select data-ct331="coach" id="ct331coach" aria-label="HEAD COACH">' + o + '</select>' + '<span class="ct331n">' + esc(E.co331msg || (list.length ? 'ONE CARD TEAM PER COACH CARD' : 'NO COACH CARDS YET')) + '</span></div>';
   return h.slice(0, k) + row + h.slice(k);
  };
 }
 try {
  panel.addEventListener('change', ev => {
   const t = ev.target;
   if (!t || !t.dataset || t.dataset.ct331 !== 'coach' || screen !== 'ct33') return;
   const E = V33.E;
   E.co331 = t.value || '';
   E.co331msg = '';
   const nmEl = document.getElementById('ct33name');
   if (nmEl) E.name = nmEl.value;
   panelDirty();
  });
 } catch (e) {}
 {
  const s = document.createElement('style');
  s.textContent = '#panel #ct331co select{flex:0 1 auto;width:15em}#panel .ct331n{font-size:9px;color:#8fe3f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1 1 auto;min-width:0}';
  document.head.appendChild(s);
 }
 V33.regAll();
 return {
  onCT: onCT,
  LOG: LOG,
  cl: cl,
  disp: disp,
  CK: CK,
  cmap: cmap,
  ownedCoaches: ownedCoaches,
  coachCard: coachCard,
  coachKey: coachKey,
  coachUsedBy: coachUsedBy,
  setCoach: setCoach,
  ultMake: id => ULT331.make(id)
 };
})();

window.V331 = V331;

(function() {
 const C = V331, ON = () => C.onCT() && !!window.RLNET, UON = () => !!window.RLNET && ULT331.on() && !window.__rl_v124gb, ANY = () => ON() || UON();
 const MARK = () => Object.assign({}, ON() ? {
  v331: 1
 } : {}, UON() ? {
  u331: 1
 } : {});
 const AK = 'bl331_alias', A3 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 const N = () => window.RLNET;
 const lobbySt = () => {
  const R = N();
  return R && R.code && R.side && !R.inGame && R.lobby && R.lobby.state && !R.lobby.state.season ? R.lobby.state : null;
 };
 const isAlias = id => /^SZ1[A-Z2-9]{3}$/.test(String(id || ''));
 function aliasFor(ctId, avoid) {
  const m = (() => {
   const o = LS.get(AK, null);
   return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  })();
  let a = m[ctId];
  const dupe = x => Object.keys(m).some(k => k !== ctId && m[k] === x);
  if (!isAlias(a) || a === avoid || dupe(a)) {
   for (let n = 0; n < 200; n++) {
    a = 'SZ1';
    for (let i = 0; i < 3; i++) a += A3[Math.floor(Math.random() * A3.length)];
    if (a !== avoid && !dupe(a) && !SZ_REG[a]) break;
   }
   m[ctId] = a;
   LS.set(AK, m);
  }
  return a;
 }
 const ctOfAlias = a => {
  const o = LS.get(AK, null) || {};
  for (const k of Object.keys(o)) if (o[k] === a && V33.getT(k)) return k;
  return null;
 };
 function oldBase(uni) {
  if (TEAMS.some(t => t.id === uni)) return uni;
  const rgb = h => {
   const n = parseInt(String(h || '#000000').replace('#', '').slice(0, 6), 16) || 0;
   return [ n >> 16 & 255, n >> 8 & 255, n & 255 ];
  };
  const u = rgb(T(uni).c1);
  let best = TEAMS[0].id, bd = 1e9;
  for (const t of TEAMS) {
   const q = rgb(t.c1), d = Math.hypot(u[0] - q[0], u[1] - q[1], u[2] - q[2]);
   if (d < bd) {
    bd = d;
    best = t.id;
   }
  }
  return best;
 }
 function ensureIds(ids) {
  for (const id of ids || []) {
   try {
    if (typeof id !== 'string' || PLAYERS[id]) continue;
    if (window.HON25 && HON25.kindOf && HON25.kindOf(id) && HON25.make) HON25.make(id);
    if (window.ULT331 && ULT331.isU(id)) ULT331.make(id);
   } catch (e) {}
  }
 }
 C.ensureIds = ensureIds;
 function payload(ctId, alias) {
  const tm = SZ_REG[ctId], t = V33.getT(ctId);
  if (!tm || !t) return null;
  const ids = tm.roster.slice();
  let lu = null;
  try {
   const l = LS.get('lu_' + alias, null);
   lu = l && lineupValid(l, ids) ? l : lineupFor(ctId, 'real');
  } catch (e) {
   lu = null;
  }
  const nums = {};
  for (const id of ids) {
   try {
    nums[id] = jerseyNo(PP(id), 'real', ctId);
   } catch (e) {}
  }
  const p = {
   id: alias,
   base: oldBase(tm.szBase),
   name: tm.name,
   ids: ids,
   boost: {},
   nums: nums,
   lu: lu,
   ct331: {
    v: 1,
    k: tm.ct33 === 'col' ? 'col' : 'pro',
    u: tm.szBase,
    n: tm.name,
    co: C.cl(C.disp(tm.coach || 'YOU'), 32)
   }
  };
  try {
   if (typeof myLoadout === 'function') {
    const L = myLoadout(ids);
    p.g17 = {
     gear: L.gear,
     crew: L.crew,
     cel: L.cel,
     f: L.f
    };
   }
  } catch (e) {}
  return p;
 }
 C.netPayload = payload;
 const R0 = szRegister15;
 szRegister15 = function(d, mine) {
  if (d && d.ct331 && ON()) ensureIds(d.ids);
  const t = R0.apply(this, arguments);
  try {
   if (!t || !d || !d.ct331 || typeof d.ct331 !== 'object' || !ON() || !isAlias(d.id)) return t;
   const c = d.ct331, k = c.k === 'col' ? 'col' : 'pro';
   const tm = V33.build({
    id: d.id,
    name: C.cl(c.n, 24),
    uni: String(c.u || ''),
    ids: t.roster
   }, k);
   if (!tm) return t;
   Object.assign(tm, {
    roster: t.roster,
    boost: t.boost || {},
    nums: t.nums || {},
    szLu: t.szLu || null,
    mine: !!mine,
    coach: C.cl(c.co, 32) || 'YOU',
    ct331: k
   });
   delete tm.ct33;
   if (t.g17) tm.g17 = t.g17;
   SZ_REG[d.id] = tm;
   C.LOG.reg.push([ d.id, k, tm.roster.length, !!mine ]);
   return tm;
  } catch (e) {
   console.error(e);
   C.LOG.err.push(String(e));
   return t;
  }
 };
 const PT1 = V33.proTiles;
 V33.proTiles = function(opts) {
  if (typeof screen !== 'undefined' && screen === 'onTeam' && ON() && lobbySt() && !(opts && opts.pool)) return V33.list('pro').concat(V33.list('col')).map(t => SZ_REG[t.id]).filter(Boolean);
  return PT1.apply(this, arguments);
 };
 function pickCT(ctId) {
  const R = N(), st = lobbySt();
  if (!st || !V33.getT(ctId) || !SZ_REG[ctId]) return false;
  const host = R.side === 'h', me = host ? 'h' : 'g', other = st[host ? 'gteam' : 'hteam'];
  const alias = aliasFor(ctId, other), pay = payload(ctId, alias);
  if (!pay) return false;
  const t = szRegister15(pay, true);
  if (!t) {
   R.err = 'THAT CARD TEAM CAN NOT PLAY RIGHT NOW';
   return false;
  }
  window.__w172pick = null;
  const p = {
   [me + 'team']: alias,
   [me + 'ready']: false,
   [me + 'lu']: pay.lu,
   [me + 'szn']: Object.assign({}, pay, MARK())
  };
  Object.assign(st, p);
  R.patchLobby(p);
  C.LOG.pick.push([ 'net', ctId, alias ]);
  screen = 'onLobby';
  return true;
 }
 C.netPick = pickCT;
 {
  const TG0 = window.teamGrid;
  window.teamGrid = function(title, sub, onPick, opts) {
   if (typeof screen !== 'undefined' && screen === 'onTeam' && typeof onPick === 'function' && ON()) {
    const f = onPick;
    onPick = id => {
     if (V33.kindOf(id) && V33.getT(id)) {
      pickCT(id);
      return;
     }
     return f(id);
    };
   }
   return TG0.call(this, title, sub, onPick, opts);
  };
 }
 const SEEN = {};
 let pres = {
  key: '',
  t: 0
 }, last = {
  sig: '',
  t: 0
 };
 function opp(st) {
  const R = N(), op = R.side === 'h' ? 'g' : 'h';
  return {
   op: op,
   team: st[op + 'team'],
   name: st[op + 'name'] || '',
   szn: st[op + 'szn']
  };
 }
 function oppState(st) {
  const R = N(), o = opp(st);
  if (!o.team) return 'none';
  const key = R.code + '|' + o.op + '|' + o.name;
  if (o.szn && o.szn.v331) SEEN[key] = 1;
  if (SEEN[key]) return 'new';
  if (pres.key !== key) pres = {
   key: key,
   t: Date.now()
  };
  return Date.now() - pres.t < 3e3 ? 'check' : 'old';
 }
 C.oppState = () => {
  const st = lobbySt();
  return st ? oppState(st) : null;
 };
 const SEENU = {};
 function ultState(st) {
  const R = N(), o = opp(st);
  if (!o.team) return 'none';
  const key = R.code + '|' + o.op + '|' + o.name;
  if (o.szn && o.szn.u331) SEENU[key] = 1;
  if (SEENU[key]) return 'new';
  if (pres.key !== key) pres = {
   key: key,
   t: Date.now()
  };
  return Date.now() - pres.t < 3e3 ? 'check' : 'old';
 }
 function myUlt(st) {
  const me = N().side, a = [], lu = st[me + 'lu'], sz = st[me + 'szn'];
  if (lu && typeof lu === 'object') for (const k in lu) {
   const v = lu[k];
   for (const x of Array.isArray(v) ? v : [ v ]) a.push(x);
  }
  if (sz && Array.isArray(sz.ids) && sz.id && sz.id === st[me + 'team']) a.push(...sz.ids);
  return a.some(x => ULT331.isU(x));
 }
 C.ultState = () => {
  const st = lobbySt();
  return st ? ultState(st) : null;
 };
 C.myUlt = () => {
  const st = lobbySt();
  return st ? myUlt(st) : false;
 };
 const myCT = st => {
  const R = N(), me = R.side;
  const id = st[me + 'team'];
  return isAlias(id) && SZ_REG[id] && SZ_REG[id].ct331 ? id : null;
 };
 function why(st) {
  if (ON() && myCT(st)) {
   const s = oppState(st);
   if (s === 'none') return 'CARD TEAM: WAITING FOR YOUR OPPONENT (V33.1 ON BOTH PHONES)';
   if (s === 'check') return 'CARD TEAM: CHECKING YOUR OPPONENT\'S VERSION...';
   if (s !== 'new') return 'OPPONENT HAS AN OLDER BAGGA LAX - CARD TEAMS NEED V33.1 ON BOTH PHONES';
  }
  if (myUlt(st)) {
   const s = UON() ? ultState(st) : 'off';
   if (s === 'none') return 'ULTIMATE CARD: WAITING FOR YOUR OPPONENT (V33.1 ON BOTH PHONES)';
   if (s === 'check') return 'ULTIMATE CARD: CHECKING YOUR OPPONENT\'S VERSION...';
   if (s !== 'new') return 'YOUR OPPONENT\'S GAME CAN NOT PLAY ULTIMATE CARDS - TAKE HIM OUT OF YOUR LINEUP';
  }
  return '';
 }
 C.netWhy = () => {
  const st = lobbySt();
  return st ? why(st) : '';
 };
 function tick() {
  if (!ANY()) return;
  const st = lobbySt();
  if (!st) return;
  const R = N(), me = R.side, k = me + 'szn', cur = st[k], myTid = st[me + 'team'];
  if (ON() && myTid && V33.kindOf(myTid) && V33.getT(myTid) && SZ_REG[myTid]) {
   const sc = screen;
   if (pickCT(myTid)) screen = sc;
   return;
  }
  if (ON() && isAlias(myTid) && SZ_REG[myTid] && SZ_REG[myTid].ct331 && SZ_REG[myTid].mine && (!cur || cur.id !== myTid)) {
   const ct = ctOfAlias(myTid);
   if (ct && Date.now() - last.t > 1500) {
    const pay = payload(ct, myTid);
    if (pay) {
     const nv = Object.assign({}, pay, cur && cur.nm33 ? {
      nm33: cur.nm33
     } : {}, MARK());
     st[k] = nv;
     last = {
      sig: 'p' + myTid,
      t: Date.now()
     };
     R.patchLobby({
      [k]: nv
     });
    }
   }
   return;
  }
  const os8 = opp(st).szn, need8 = myUlt(st) || !!(os8 && (os8.v331 || os8.u331));
  if (myTid && need8 && (ON() && !(cur && cur.v331) || UON() && !(cur && cur.u331)) && !(cur && cur.id && cur.id !== myTid) && Date.now() - last.t > 1500) {
   const nv = Object.assign({}, cur || {}, MARK());
   st[k] = nv;
   last = {
    sig: 'm',
    t: Date.now()
   };
   R.patchLobby({
    [k]: nv
   });
  }
  const mine = ON() ? myCT(st) : null;
  if (mine) {
   const o = opp(st);
   if (o.team === mine && me === 'g') {
    const ct = ctOfAlias(mine);
    if (ct) {
     const sc = screen;
     LS.set(AK, Object.assign({}, LS.get(AK, {}) || {}, {
      [ct]: null
     }));
     if (pickCT(ct)) screen = sc;
     return;
    }
   }
  }
  C.ultOK = UON() && ultState(st) === 'new';
  if (st[me + 'ready'] && why(st)) {
   st[me + 'ready'] = false;
   R.patchLobby({
    [me + 'ready']: false
   });
   C.LOG.block.push([ 'unready', oppState(st), ultState(st) ]);
  }
 }
 setInterval(() => {
  try {
   tick();
  } catch (e) {
   console.error(e);
  }
 }, 300);
 C.netTick = tick;
 if (window.V22 && V22.subExtra) {
  const se1 = V22.subExtra;
  V22.subExtra = function() {
   const l = se1.apply(this, arguments);
   try {
    const R = N();
    if (Array.isArray(l) && R && R.inGame && !C.ultOK) return l.filter(id => !ULT331.isU(id));
   } catch (e) {}
   return l;
  };
 }
 const STAT = /^(AWAY TEAM IS PICKING\.\.\.|PICK YOUR TEAM, THEN READY UP|(HOME|AWAY) TEAM IS READY - READY UP!)$/;
 function shortWhy(st) {
  if (ON() && myCT(st)) {
   const s = oppState(st);
   if (s !== 'new') return s === 'none' ? 'CARD TEAM: WAITING FOR YOUR OPPONENT' : s === 'check' ? 'CARD TEAM: CHECKING YOUR OPPONENT...' : 'THEIR GAME IS OLDER - CARD TEAMS NEED V33.1';
  }
  if (myUlt(st)) {
   const s = UON() ? ultState(st) : 'off';
   if (s !== 'new') return s === 'none' ? 'ULTIMATE CARD: WAITING FOR YOUR OPPONENT' : s === 'check' ? 'ULTIMATE CARD: CHECKING YOUR OPPONENT...' : 'THEIR GAME IS OLDER - ULTIMATE CARDS NEED V33.1';
  }
  return '';
 }
 C.netShort = () => {
  const st = lobbySt();
  return st ? shortWhy(st) : '';
 };
 {
  const BT0 = window.button;
  window.button = function(label, x, y, w, h, fn, opts) {
   try {
    if (typeof screen !== 'undefined' && screen === 'onLobby' && label === 'READY UP' && ANY()) {
     const st = lobbySt();
     if (st) {
      const w8 = why(st);
      if (w8) {
       fn = () => {
        C.LOG.block.push([ 'ready', w8 ]);
       };
       opts = Object.assign({}, opts || {}, {
        bg: '#5a6670'
       });
      }
     }
    }
   } catch (e) {
    console.error(e);
   }
   return BT0.call(this, label, x, y, w, h, fn, opts);
  };
 }
 {
  const TX0 = window.text;
  window.text = function(s, x, y, sc, col) {
   try {
    if (typeof screen !== 'undefined' && screen === 'onLobby' && typeof s === 'string' && STAT.test(s) && ANY()) {
     const st = lobbySt();
     if (st) {
      const w8 = shortWhy(st);
      if (w8) {
       const a = Array.prototype.slice.call(arguments);
       a[0] = w8;
       a[4] = '#ff9a3d';
       C.LOG.stat = w8;
       return TX0.apply(this, a);
      }
     }
    }
   } catch (e) {
    console.error(e);
   }
   return TX0.apply(this, arguments);
  };
 }
})();

(function() {
 const C = V331;
 C.draftCT = () => C.onCT();
 C.noCards = S => {
  try {
   return !!(S && C.onCT() && (S.ct331 === 'own' || !('ct331' in S) && !S.rosters && V33.kindOf(S.team) && V33.getT(S.team)));
  } catch (e) {
   return false;
  }
 };
 function ownCoach() {
  const S = typeof season !== 'undefined' ? season : null;
  if (!C.onCT() || !S || S.ct331 !== 'own' || !S.hc17need || S.hc17 || S.coach331 || S.online || S.phase === 'draft' || S.phase === 'done') return false;
  const key = C.coachKey(S.team), card = C.coachCard(key);
  S.coach331 = card ? card.name : 'YOU';
  if (card) {
   let pool = [];
   try {
    pool = window.V17 && V17.coachPool && V17.coachPool() || [];
   } catch (e) {
    pool = [];
   }
   const i = pool.findIndex(c => String(c.n).toUpperCase() === card.name);
   if (i >= 0 && PANEL_ACT.v17hc) {
    S.basecoach30 = pool[i].n;
    PANEL_ACT.v17hc(i);
   } else {
    S.coach = {
     n: card.name,
     style: 'COACH CARD',
     k: null,
     v: 0,
     line: 'YOUR COACH CARD',
     since: S.week || 0
    };
    S.basecoach30 = card.name;
   }
  } else {
   S.coach = null;
  }
  delete S.hc17need;
  LS.set('season', S);
  C.LOG.pick.push([ 'owncoach', S.team, S.coach331 ]);
  return true;
 }
 C.ownCoach = ownCoach;
 if (typeof drawSeason === 'function') {
  const DS = drawSeason;
  drawSeason = function() {
   try {
    ownCoach();
   } catch (e) {
    console.error(e);
   }
   return DS.apply(this, arguments);
  };
 }
 const ctd332 = () => !window.__rl_v124gb && !window.__rl_no332ctd;
 const realT332 = pid => {
  try {
   const p = PP(pid);
   return p && p.team && (TEAMS.some(t => t.id === p.team) || typeof WT_REG !== 'undefined' && !!WT_REG[p.team]) ? p.team : null;
  } catch (e) {
   return null;
  }
 };
 const ctName332 = tid => {
  try {
   return String(T(tid).name || '').toUpperCase();
  } catch (e) {
   return '';
  }
 };
 if (window.V22 && V22.grantIds) {
  const G0 = V22.grantIds;
  V22.grantIds = function(ids, tid, why) {
   let ct = null;
   try {
    if (tid && V33.kindOf(tid) && SZ_REG[tid] && SZ_REG[tid].szBase) {
     ct = tid;
     tid = SZ_REG[tid].szBase;
    }
   } catch (e) {}
   if (!ct || !ctd332() || !Array.isArray(ids)) return G0.call(this, ids, tid, why);
   const out = [], nm = ctName332(ct);
   for (const id of ids) {
    const got = G0.call(this, [ id ], realT332(id) || tid, why);
    for (const g of got) {
     out.push(g);
     try {
      const c = V22.st().cards[g];
      if (c && nm) {
       c.wn332 = nm;
      }
     } catch (e) {}
    }
   }
   if (out.length) try {
    V22.save();
   } catch (e) {}
   return out;
  };
 }
 if (window.V22 && V22.titleCheck) {
  const TC0 = V22.titleCheck;
  V22.titleCheck = function(Sz) {
   const t0 = Date.now(), r = TC0.apply(this, arguments);
   try {
    const tid = Sz && Sz.team;
    if (tid && V33.kindOf(tid) && SZ_REG[tid] && SZ_REG[tid].szBase) {
     const cs = V22.st().cards, nm = ctName332(tid);
     let n = 0;
     for (const k in cs) {
      const q = cs[k];
      if (q && q.t === tid && (q.at || 0) >= t0) {
       q.t = ctd332() && realT332(k) || SZ_REG[tid].szBase;
       if (ctd332() && nm) q.wn332 = nm;
       n++;
      }
     }
     if (n) V22.save();
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 function luAll(lu) {
  const a = [];
  if (lu && typeof lu === 'object') for (const k in lu) {
   const v = lu[k];
   for (const x of Array.isArray(v) ? v : [ v ]) if (typeof x === 'string') a.push(x);
  }
  return [ ...new Set(a) ];
 }
 function ultSources(U) {
  let ids = [];
  try {
   const L = window.COL25;
   if (L && U.u2501 && L.on2501 && L.on2501()) {
    const R = U.br && U.br.rounds && U.br.rounds[U.br.rounds.length - 1], g = R && R.games && R.games[0], opp = g ? g.a === U.team ? g.b : g.a : null;
    let lu = null;
    try {
     lu = L.uLineup ? L.uLineup(opp) : null;
    } catch (e) {
     lu = null;
    }
    if (!lu) {
     const st = L.st && L.st();
     lu = st && st.ulu;
    }
    ids = luAll(lu);
   } else ids = (T(U.team).roster || []).slice();
  } catch (e) {
   console.error(e);
  }
  return ids.filter(id => PP(id) && !ULT331.isU(id) && !(PP(id).leg && !(window.V20 && V20.ownedLeg && V20.ownedLeg().includes(id))));
 }
 C.ultSources = ultSources;
 C.ultPrize = function(U, R, sell, newOnly) {
  if (!ULT331.on() || !window.V22 || !V22.on()) return;
  for (const src of ultSources(U)) {
   const uid = ULT331.PFX + src;
   if (!ULT331.make(uid)) continue;
   if (newOnly && V22.owned(uid)) continue;
   if (newOnly) {
    const p = PP(src), t = p && p.team && !(V33.kindOf && V33.kindOf(p.team)) ? p.team : U.team;
    V22.grantIds([ uid ], t, 'ULTIMATE CARD');
    R.ult.push({
     pid: uid
    });
    continue;
   }
   if (V22.owned(uid)) {
    R.ultC += sell(V22.rarOf(uid));
    R.ult.push({
     pid: uid,
     dup: 1
    });
   } else {
    V22.grantIds([ uid ], U.team, 'ULTIMATE CARD');
    R.ult.push({
     pid: uid
    });
   }
  }
  C.LOG.pick.push([ 'ult', R.ult.map(x => x.pid) ]);
 };
})();

(function() {
 if (!window.HON25 || !HON25.patchSpot) return;
 const GOLD = [ [ '#fff3a8', '#ffcc33', '#fff3a8' ], [ '#d19a00', '#ffcc33', '#d19a00' ] ];
 const FLAG = [ [ '#2a4bb8', '#d8202c', '#d8202c' ], [ '#2a4bb8', '#ffffff', '#ffffff' ] ];
 const on = () => ULT331.on() && HON25.on();
 const own35 = () => {
  try {
   return !!(window.V35 && V35.b35 && V35.b35.ownsMarks && V35.b35.ownsMarks());
  } catch (e) {
   return false;
  }
 };
 const srcBadge = pid => {
  try {
   return !!HON25.isAA(ULT331.srcOf(pid));
  } catch (e) {
   return false;
  }
 };
 const s2Cache = new WeakMap, dbg = {
  gold: 0,
  both: 0,
  hero: 0,
  no2: 0
 };
 function spot2(rows, name, s1) {
  if (s2Cache.has(rows)) return s2Cache.get(rows);
  let best = null;
  try {
   const m = RL12.uniMask(rows, name + '|h25'), at = (q, r) => (rows[r] || '')[q] || '.';
   const ok = (q, r) => {
    const ch = at(q, r);
    return (ch === 'J' || ch === 'j') && !m.shorts.has(q + ',' + r) && !m.accent.has(q + ',' + r);
   };
   let bs = 1e9;
   for (let r = 0; r < rows.length - 1; r++) for (let q = 0; q < rows[0].length - 2; q++) {
    if (Math.abs(q - s1[0]) < 3 && Math.abs(r - s1[1]) < 2) continue;
    let all = true;
    for (let a = 0; a < 3 && all; a++) for (let b = 0; b < 2; b++) if (!ok(q + a, r + b)) {
     all = false;
     break;
    }
    if (!all) continue;
    const sc = Math.abs(r - s1[1]) * 10 + Math.abs(q - s1[0]);
    if (sc < bs) {
     bs = sc;
     best = [ q, r ];
    }
   }
  } catch (e) {
   console.error(e);
  }
  s2Cache.set(rows, best);
  return best;
 }
 function spots(rows, name, both) {
  const s1 = HON25.patchSpot(rows, name);
  if (!s1) return null;
  if (!both) return {
   g: s1
  };
  const s2 = spot2(rows, name, s1);
  return s2 ? {
   a: s1,
   g: s2
  } : {
   a: s1,
   g: null
  };
 }
 function overlay(p) {
  const pl = p.pl, n = p._fr, f = n && RL12.FR[n];
  if (!pl || !f || !ULT331.isU(pl.id) || own35()) return;
  const both = srcBadge(pl.id), S = spots(f[3], n, both);
  if (!S) return;
  const fr = !!p._fright, x = Math.round(p.x), y = Math.round(p.y), X = q => fr ? x - f[0] + q : x + f[0] - q, Y = r => y - f[1] + r;
  scaled12(p.x, p.y, () => {
   const put = (s, C) => {
    for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) {
     g.fillStyle = C[r][q];
     g.fillRect(X(s[0] + q), Y(s[1] + r), 1, 1);
    }
   };
   if (S.a) put(S.a, FLAG);
   if (S.g) {
    put(S.g, GOLD);
    dbg.gold++;
    if (S.a) dbg.both++;
   } else dbg.no2++;
   if (window.__ult331probe && S.g) dbg.last = {
    pid: pl.id,
    n: n,
    a: S.a ? [ X(S.a[0]), Y(S.a[1]) ] : null,
    g: [ X(S.g[0]), Y(S.g[1]) ],
    fr: fr
   };
  });
 }
 {
  const dp0 = window.drawPlayer12;
  if (typeof dp0 === 'function') window.drawPlayer12 = function(p) {
   const r = dp0.apply(this, arguments);
   try {
    if (on() && p && p.pl) overlay(p);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 const baked = new WeakMap;
 {
  const lb0 = window.lobbyBake;
  if (typeof lb0 === 'function') window.lobbyBake = function(name, kit, skin, gray, flip) {
   const c0 = lb0.apply(this, arguments);
   try {
    const pid = window.__v17hp;
    if (on() && pid && !gray && c0 && ULT331.isU(pid) && !own35()) {
     const f = RL12.FR[name];
     if (!f) return c0;
     const both = srcBadge(pid), S = spots(f[3], name, both);
     if (!S) return c0;
     let m = baked.get(c0);
     if (!m) {
      m = {};
      baked.set(c0, m);
     }
     const key = name + '|' + (flip ? 1 : 0) + '|' + (both ? 1 : 0);
     if (m[key]) return m[key];
     const c = document.createElement('canvas');
     c.width = c0.width;
     c.height = c0.height;
     const x = c.getContext('2d');
     x.drawImage(c0, 0, 0);
     const w = f[3][0].length, put = (s, C) => {
      for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) {
       const qq = s[0] + q;
       x.fillStyle = C[r][q];
       x.fillRect(flip ? w - 1 - qq : qq, s[1] + r, 1, 1);
      }
     };
     if (S.a) put(S.a, FLAG);
     if (S.g) put(S.g, GOLD);
     dbg.hero++;
     m[key] = c;
     return c;
    }
   } catch (e) {
    console.error(e);
   }
   return c0;
  };
 }
 ULT331.badge = {
  spots: spots,
  spot2: spot2,
  dbg: dbg,
  GOLD: GOLD,
  FLAG: FLAG
 };
})();

(function() {
 const st = document.createElement('style');
 st.id = 'ult331css';
 document.head.appendChild(st);
 let last = '';
 function css() {
  const tw = ULT331.variant('TW25-x') || 'BAGGATWAAN';
  const P = '[data-pid^="U_"]', ban = s => s.replace(/"/g, '');
  return [ '#panel .c17' + P + '{border-color:#ffcc33;background:linear-gradient(#1c1500,#000 70%,#2a1f00);box-shadow:0 0 0 1px #000,0 0 7px #ffcc33;animation:glow17 1.4s ease-in-out infinite}', '#panel .c17' + P + '::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 36%,rgba(255,236,150,.6) 46%,rgba(255,204,51,.5) 52%,transparent 62%);animation:foil17 1.8s linear infinite;pointer-events:none}', '#panel .c17' + P + ' .art{background:radial-gradient(circle at 50% 40%,#fff1a0,#c99400 55%,#1c1300);border-color:#ffcc33}', '#panel .c17' + P + ' .rr{color:#ffe14d}#panel .c17' + P + ' .role17{color:#ffe9a0}', '#panel .c17' + P + ' .nm{flex-direction:column;justify-content:center}', '#panel .c17' + P + ' .nm::before{content:"ULTIMATE";display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;font-size:6px;letter-spacing:.3px;color:#000;background:linear-gradient(90deg,#ffcc33,#fff3a8,#ffcc33);border-top:1px solid #000;border-bottom:1px solid #000;padding:1px 2px;margin-bottom:1px;white-space:nowrap}', '#panel .c17[data-pid^="U_AA25-"] .nm::before{content:"ALL AMERICAN ULTIMATE"}', '#panel .c17[data-pid^="U_TW25-"] .nm::before{content:"' + ban(tw) + ' ULTIMATE"}', '#panel .c17[data-pid^="U_AA25-"] .nm::before,#panel .c17[data-pid^="U_TW25-"] .nm::before{white-space:normal;line-height:1.15;word-break:break-word;letter-spacing:0}', '#panel .pop17:has(.pcard17 .c17' + P + ') .pt17::before{content:"ULTIMATE ";color:#ffcc33}', '#panel .pop17:has(.pcard17 .c17[data-pid^="U_AA25-"]) .pt17::before{content:"ALL AMERICAN ULTIMATE "}', '#panel .pop17:has(.pcard17 .c17[data-pid^="U_TW25-"]) .pt17::before{content:"' + ban(tw) + ' ULTIMATE "}', '#panel .pcard17 .c17' + P + ' .nm::before{font-size:8px}', '.cd[data-k^="c:U_"]{border-color:#ffcc33!important;background:linear-gradient(#1c1500,#000)!important;box-shadow:0 0 7px #ffcc33}' ].join('\n');
 }
 function upd() {
  if (!ULT331.on()) {
   if (st.textContent) st.textContent = '';
   last = '';
   return;
  }
  const c = css();
  if (c !== last) {
   st.textContent = c;
   last = c;
  }
 }
 upd();
 setInterval(upd, 2e3);
 if (window.V28 && typeof V28.popLine === 'function') {
  const pl0 = V28.popLine;
  V28.popLine = function(pid) {
   let h = '';
   try {
    if (ULT331.on() && ULT331.isU(pid)) {
     const src = ULT331.srcOf(pid), v = ULT331.variant(src);
     h = '<span><b style="color:#ffcc33">' + ULT331.label(pid).replace(/[<>&"]/g, '') + '</b>: AN ULTIMATE TOURNAMENT CARD - EVERY RATING +' + ULT_BOOST + ' FROM HIS ' + (v ? v + ' ' : '') + 'CARD</span>';
    }
   } catch (e) {}
   return h + pl0.apply(this, arguments);
  };
 }
 ULT331.css = css;
})();

(function() {
 if (typeof PANEL_RENDER === 'undefined' || !PANEL_RENDER.ct33 || !window.V33) return;
 const on = () => V331.onCT() && !window.__rl_no331pick && !!(window.V22 && V22.cardHtml22);
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[ch]));
 const PORD = [ 'A', 'M', 'FO', 'D', 'LSM', 'SSDM', 'G' ], POSN = {
  A: 'ATTACK',
  M: 'MIDFIELD',
  FO: 'FACEOFF',
  D: 'DEFENSE',
  LSM: 'LSM',
  SSDM: 'SSDM',
  G: 'GOALIE'
 };
 function tile(pid) {
  let h = '';
  try {
   h = V22.cardHtml22(pid);
  } catch (e) {
   h = '';
  }
  if (!h) {
   const p = PP(pid);
   h = '<div class="c17" data-pid="' + esc(pid) + '"><div class="nm">' + esc(String(p.n).toUpperCase()) + '</div><div class="rr">' + p.ovr + '</div><div class="role17">' + esc(p.pos) + '</div></div>';
  }
  return h.replace(/ sel"/, '"').replace(/data-a="v22card" data-v="[^"]*"/, 'data-a="ct331put" data-v="' + esc(pid) + '"');
 }
 function pop(E) {
  const i = E.pick331, cur = E.ids[i] || '', taken = new Set(E.ids.filter((x, j) => x && j !== i));
  const pool = V33.eligible(E.kind, E.id).filter(x => PP(x) && !taken.has(x) && x !== cur);
  const secs = PORD.concat([ ...new Set(pool.map(x => PP(x).pos)) ].filter(p => !PORD.includes(p))).map(ps => {
   const a = pool.filter(x => PP(x).pos === ps).sort((x, y) => PP(y).ovr - PP(x).ovr);
   return a.length ? '<div class="sh17 ct331sh">' + esc(POSN[ps] || ps) + ' <span>' + a.length + '</span></div><div class="grid17 ct331g">' + a.map(tile).join('') + '</div>' : '';
  }).join('');
  const cp = cur ? PP(cur) : null;
  return '<div class="pop17 ct331pop" id="ct331pop" data-a="ct331close" data-v="bg"><div class="pbox17 ct331box" data-a="v17noop">' + '<div class="ct331ph"><div class="pt17">PLAYER ' + (i + 1) + ': ' + (cp ? esc(cp.pos + ' ' + String(cp.n).toUpperCase() + ' ' + cp.ovr) : 'PICK A CARD') + '</div><div class="sp"></div>' + (cur && V33.MINR < V33.ROSTER ? '<button type="button" data-a="ct331empty" id="ct331empty">EMPTY SLOT</button>' : '') + '<button type="button" class="g" data-a="ct331close" id="ct331close">CLOSE</button></div>' + '<div class="ct331sc" id="ct331sc">' + (secs || '<div class="note">NO OTHER CARDS FOR THIS SPOT - EVERY CARD YOU OWN IS ALREADY ON THIS TEAM</div>') + '</div></div></div>';
 }
 const R2 = PANEL_RENDER.ct33;
 PANEL_RENDER.ct33 = function() {
  let h = R2.apply(this, arguments);
  const E = V33.E;
  if (!on() || !E || E.refuse) {
   if (E) E.pick331 = null;
   return h;
  }
  h = h.replace(/<td class="n"><select data-ct33="slot" data-i="(\d+)"/g, (m, i) => '<td class="n ct331td"><button type="button" class="ct331tap" data-a="ct331slot" data-v="' + i + '" aria-label="PICK PLAYER ' + (+i + 1) + '"></button><select data-ct33="slot" data-i="' + i + '"');
  if (E.pick331 != null && E.pick331 >= 0) h += pop(E);
  return h;
 };
 const keepName = E => {
  const n = document.getElementById('ct33name');
  if (n) E.name = n.value;
 };
 PANEL_ACT.ct331slot = v => {
  const E = V33.E;
  if (!E) return;
  keepName(E);
  E.pick331 = Math.max(0, Math.min(V33.ROSTER - 1, +v | 0));
  C_LOG('open', E.pick331);
  panelDirty();
 };
 PANEL_ACT.ct331put = pid => {
  const E = V33.E;
  if (!E || E.pick331 == null) return;
  keepName(E);
  const i = E.pick331;
  if (!PP(pid) || E.ids.some((x, j) => x === pid && j !== i)) return;
  while (E.ids.length <= i) E.ids.push('');
  E.ids[i] = pid;
  E.pick331 = null;
  E.msg = '';
  C_LOG('put', i, pid);
  panelDirty();
 };
 PANEL_ACT.ct331empty = () => {
  const E = V33.E;
  if (!E || E.pick331 == null) return;
  keepName(E);
  if (E.ids.length > E.pick331) E.ids[E.pick331] = '';
  E.pick331 = null;
  E.msg = '';
  panelDirty();
 };
 PANEL_ACT.ct331close = () => {
  const E = V33.E;
  if (E) {
   keepName(E);
   E.pick331 = null;
  }
  panelDirty();
 };
 if (!PANEL_ACT.v17noop) PANEL_ACT.v17noop = () => {};
 function C_LOG() {
  V331.LOG.pick.push([ 'card' ].concat([].slice.call(arguments)));
 }
 {
  const O0 = V33.onOpen;
  V33.onOpen = function(E) {
   if (E) E.pick331 = null;
   return O0 ? O0.apply(this, arguments) : undefined;
  };
 }
 const s = document.createElement('style');
 s.textContent = '#panel .ct331td{position:relative}#panel .ct331tap{position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;background:transparent;opacity:0;z-index:2;cursor:pointer}' + '#panel .ct331pop{z-index:50}#panel .ct331box{display:flex;flex-direction:column;width:min(96vw,760px);max-width:96vw;max-height:calc(100% - 8px);box-sizing:border-box;overflow:hidden}' + '#panel .ct331ph{display:flex;align-items:center;gap:5px;flex:0 0 auto;min-width:0}#panel .ct331ph .pt17{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1 1 auto;text-align:left}#panel .ct331ph .sp{flex:0 0 0}#panel .ct331ph button{flex:0 0 auto;padding:4px 8px}' + '#panel .ct331sc{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px 1px 4px}#panel .ct331sh{margin:3px 0 1px;font-size:10px;color:#8fe3f0}#panel .ct331g{display:flex;flex-wrap:wrap;gap:4px}#panel .ct331g .c17{cursor:pointer}';
 document.head.appendChild(s);
})();
