'use strict';

/* v429st - COLLEGE SEASON TEAMS in Quick Game.
   Every college season you play (a school OR a college card team) is saved with its end-of-season roster,
   ratings, numbers, lineup, colors/badge and record (+ NATTY marker), and listed under SEASON TEAMS at the
   top of the COLLEGE tab of the Quick Game team picker (and as opponents). Existing saves are backfilled.
   Kill switch: window.__rl_no429st = true (nothing is archived, nothing is shown, old behaviour). */
const CS429 = (() => {
 const off = () => !!window.__rl_no429st || !!window.__rl_v124gb;
 const KEY = 'cs429', PKEY = 'cs429p', MAX = 30;
 const LOG = {
  arch: [],
  reg: [],
  bf: [],
  err: [],
  shown: 0
 };
 const err = (e, w) => {
  try {
   LOG.err.push(w + ': ' + (e && e.message || e));
  } catch (_) {}
 };
 const okId = id => /^SZ[A-Z0-9]{4}$/.test(String(id || ''));
 function list() {
  try {
   const a = LS.get(KEY, null);
   return Array.isArray(a) ? a.filter(d => d && okId(d.id) && Array.isArray(d.ids) && d.ids.length >= 12 && d.base) : [];
  } catch (e) {
   return [];
  }
 }
 function saveList(a) {
  try {
   LS.set(KEY, a.slice(-MAX));
  } catch (e) {
   err(e, 'save');
  }
 }
 const keyOf = C => (C.n || 0) + '|' + C.team + '|' + (C.seed || 0);
 function newId(a) {
  const used = new Set(a.map(d => d.id));
  try {
   if (typeof szArchList2314 === 'function') for (const d of szArchList2314()) used.add(d.id);
   used.add(LS.get('szid', ''));
   used.add(LS.get('szcid26', ''));
  } catch (e) {}
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let k = 0; k < 80; k++) {
   let id = 'SZ';
   for (let i = 0; i < 4; i++) id += A[Math.floor(Math.random() * A.length)];
   if (!used.has(id) && !SZ_REG[id]) return id;
  }
  return null;
 }
 const isCard = id => {
  try {
   return !!(window.V33 && V33.kindOf && V33.kindOf(id));
  } catch (e) {
   return false;
  }
 };
 function mk(id) {
  if (PP(id)) return true;
  try {
   if (window.HON25 && HON25.kindOf && HON25.kindOf(id) && HON25.make) HON25.make(id);
   if (window.ULT331 && ULT331.isU && ULT331.isU(id) && ULT331.make) ULT331.make(id);
  } catch (e) {}
  return !!PP(id);
 }
 // the team as it stands right now (school roster, or the card team's cards)
 function snapTeam(src) {
  const st = T(src);
  if (!st || st.id !== src || !Array.isArray(st.roster)) return null;
  const ids = st.roster.filter(id => mk(id));
  if (ids.length < 12) return null;
  const ct = isCard(src), base = ct ? st.szBase || src : src;
  let lu = null;
  try {
   lu = lineupFor(src, 'real');
   if (!lineupValid(lu, ids)) lu = null;
  } catch (e) {
   lu = null;
  }
  const nums = {}, r = {};
  for (const pid of ids) {
   try {
    const n = st.nums && st.nums[pid] != null ? st.nums[pid] : jerseyNo(PP(pid), 'real', src);
    if (n !== '' && n != null) nums[pid] = n;
   } catch (e) {}
   const p = PP(pid);
   if (p && p.r) {
    const o = {};
    for (const k of SKILLS) if (typeof p.r[k] === 'number') o[k] = p.r[k];
    r[pid] = o;
   }
  }
  let ovr = null;
  try {
   ovr = teamOvr(src, 'real');
  } catch (e) {}
  let gear = null;
  try {
   const ST = window.V17 && V17.ST ? V17.ST() : null, g = ST && ST.tequip && ST.tequip[src];
   if (g && typeof g === 'object') gear = JSON.parse(JSON.stringify(g));
  } catch (e) {}
  return {
   src: src,
   ct: ct ? 1 : 0,
   base: base,
   nm: String(st.name || src).toUpperCase(),
   vis: {
    abbr: st.abbr || null,
    c1: st.c1 || null,
    c2: st.c2 || null,
    icon: st.icon || null,
    coach: st.coach || null,
    full: st.full || null,
    city: st.city != null ? st.city : null
   },
   ids: ids,
   nums: nums,
   lu: lu,
   r: r,
   ovr: ovr,
   gear: gear
  };
 }
 function recOf(C) {
  const t = C.table && C.table[C.team] || {};
  const champ = C.phase === 'done' && C.champ === C.team;
  return {
   w: t.w || 0,
   l: t.l || 0,
   champ: champ ? 1 : 0,
   done: C.phase === 'done' ? 1 : 0,
   n: C.n || 0,
   games: Array.isArray(C.mine) ? C.mine.length : 0
  };
 }
 function nameFor(a, d) {
  const base = d.nm + (d.champ ? ' NATTY' : ' SEASON');
  const k = a.filter(x => x.src === d.src && !!x.champ === !!d.champ).length + 1;
  const s = k > 1 ? ' ' + k : '';
  return (base.length + s.length > 24 ? base.slice(0, 24 - s.length).trim() : base) + s;
 }
 function push(d) {
  const a = list();
  if (d.k && a.some(x => x.k === d.k)) return null;
  const id = newId(a);
  if (!id) return null;
  d.id = id;
  d.name = nameFor(a, d);
  d.at = d.at || Date.now();
  a.push(d);
  saveList(a);
  try {
   if (d.gear) {
    const ST = V17.ST();
    if (ST && ST.tequip && !ST.tequip[id]) {
     ST.tequip[id] = d.gear;
     V17.save && V17.save();
    }
   }
  } catch (e) {}
  delete d.gear;
  saveList(list().map(x => x.id === id ? d : x));
  reg(d);
  LOG.arch.push({
   id: id,
   name: d.name,
   src: d.src,
   champ: d.champ,
   n: d.n,
   bf: d.bf || 0,
   t: Date.now()
  });
  return d;
 }
 function archive(C, why) {
  if (!C || !C.team) return null;
  const s = snapTeam(C.team);
  if (!s) return null;
  return push(Object.assign(s, recOf(C), {
   k: keyOf(C),
   why: why
  }));
 }
 function fromPend(p) {
  if (!p || !p.snap || !p.k) return null;
  const a = list();
  if (a.some(x => x.k === p.k)) return null;
  return push(Object.assign({}, p.snap, p.rec, {
   k: p.k,
   why: 'abandoned'
  }));
 }
 // register an archived season team in SZ_REG (exact roster, ratings as boosts against today's cards)
 function reg(d) {
  try {
   if (off() || !d || !okId(d.id)) return null;
   const ex = SZ_REG[d.id];
   if (ex && !ex.cs429) return null;
   const ids = d.ids.filter(id => mk(id));
   if (ids.length < 12) return null;
   const b0 = T(d.base), b = b0 && b0.id === d.base ? b0 : null;
   const boost = {};
   for (const pid of ids) {
    const s = d.r && d.r[pid], p = PP(pid);
    if (!s || !p || !p.r) continue;
    const o = {};
    for (const k of SKILLS) {
     const v = typeof s[k] === 'number' && typeof p.r[k] === 'number' ? s[k] - p.r[k] : 0;
     if (v) o[k] = v;
    }
    if (Object.keys(o).length) boost[pid] = o;
   }
   const vis = {};
   for (const k in d.vis || {}) if (d.vis[k] != null) vis[k] = d.vis[k];
   const tm = Object.assign({}, b || {}, vis, {
    id: d.id,
    name: String(d.name || d.nm || 'COLLEGE SEASON').toUpperCase().slice(0, 24),
    roster: ids,
    sz: true,
    szBase: b ? d.base : d.src,
    boost: boost,
    nums: d.nums || {},
    szLu: d.lu || null,
    lg: 'COLLEGE SEASON',
    era: d.champ ? 'NATTY' : '',
    mine: false,
    cs429: 1,
    csChamp: d.champ ? 1 : 0
   });
   for (const k of [ 'col26', 'ct33', 'ct331', 'gho16', 'arch2314', 'players' ]) delete tm[k];
   if (!tm.c1) tm.c1 = '#888';
   if (!tm.c2) tm.c2 = '#fff';
   if (!d.ct) {
    try {
     const g = window.V17 && V17.colGear26 ? V17.colGear26(ids, d.src) : null;
     if (g) tm.g17 = g; else delete tm.g17;
    } catch (e) {}
   } else delete tm.g17;
   SZ_REG[d.id] = tm;
   LOG.reg.push(d.id);
   return tm;
  } catch (e) {
   err(e, 'reg');
   return null;
  }
 }
 function regAll() {
  let n = 0;
  for (const d of list()) if (reg(d)) n++;
  return n;
 }
 // ---- watching the college season (college25 keeps only ONE season slot: col25.cur) ----
 let pend = null, lastG = -1;
 function rawCur() {
  try {
   const S = window.COL25 && COL25.st ? COL25.st() : null, C = S && S.cur;
   return C && C.v === 25 && C.team ? C : null;
  } catch (e) {
   return null;
  }
 }
 function tick() {
  if (off()) return;
  try {
   const C = rawCur();
   const k = C ? keyOf(C) : null;
   if (pend && pend.k !== k) {
    // the season we were watching was replaced without finishing: keep it if games were played
    if (pend.rec && pend.rec.games > 0) fromPend(pend);
    pend = null;
    lastG = -1;
    try {
     LS.set(PKEY, null);
    } catch (e) {}
   }
   if (!C) return;
   const a = list();
   if (a.some(x => x.k === k)) {
    pend = {
     k: k,
     done: 1
    };
    return;
   }
   if (C.phase === 'done') {
    archive(C, 'done');
    pend = {
     k: k,
     done: 1
    };
    return;
   }
   const g = Array.isArray(C.mine) ? C.mine.length : 0;
   if (!pend || pend.k !== k || g !== lastG) {
    const s = snapTeam(C.team);
    if (s) {
     const gear = s.gear;
     delete s.gear;
     pend = {
      k: k,
      snap: Object.assign(s, {
       gear: gear
      }),
      rec: recOf(C)
     };
     lastG = g;
     if (g > 0) try {
      LS.set(PKEY, pend);
     } catch (e) {}
    }
   }
  } catch (e) {
   err(e, 'tick');
  }
 }
 // ---- backfill what the save still holds ----
 function backfill() {
  const out = [];
  try {
   // 1. a pending (in-progress, games played) season remembered by this file on an earlier run
   const p = LS.get(PKEY, null), C = rawCur();
   if (p && p.k && (!C || keyOf(C) !== p.k) && p.rec && p.rec.games > 0) {
    const d = fromPend(p);
    if (d) out.push(['pending', d.name]);
    LS.set(PKEY, null);
   }
   // 2. the season still in the college slot (finished = archived now; in progress = archived when it ends)
   if (C && C.phase === 'done' && !list().some(x => x.k === keyOf(C))) {
    const d = archive(C, 'backfill');
    if (d) {
     d.bf = 1;
     saveList(list().map(x => x.id === d.id ? Object.assign(x, {
      bf: 1
     }) : x));
     out.push(['slot', d.name]);
    } else out.push(['slot-fail', C.team]);
   }
   // 3. earlier NATTIES whose slot was overwritten. Two traces survive in the save:
   //    a) the natty flip-deck keys 'C|<season n>|<team>' (V22.flipSt: q/done/old) - written for school AND card-team natties
   //    b) natty player-card grants (V22 cards with w 'COLLEGE NATTY', t = team) - written when cards were granted without a flip
   //    Neither stores the end-of-season roster/ratings, so these are rebuilt from the team as it is now (flag bf:2).
   if (window.V22 && V22.st) {
    const tr = {}, add = (t, n, at) => {
     if (!t) return;
     const k = t + '|' + (n == null ? '?' : n);
     if (!tr[k]) tr[k] = { t: t, n: n == null ? null : n, at: at || 0 };
    };
    try {
     const F = V22.flipSt ? V22.flipSt() : null;
     const keys = [].concat(F && Array.isArray(F.q) ? F.q.map(d => d && d.k) : [], F && Array.isArray(F.done) ? F.done : [], F && Array.isArray(F.old) ? F.old : []);
     for (const k of keys) {
      const m = /^C\|(\d+)\|(.+)$/.exec(String(k || ''));
      if (m) add(m[2], +m[1], 0);
     }
    } catch (e) {}
    const cs = V22.st().cards || {}, seen = {};
    for (const id in cs) {
     const c = cs[id];
     if (c && c.w === 'COLLEGE NATTY' && c.t && !seen[c.t]) {
      seen[c.t] = 1;
      if (!Object.keys(tr).some(k => tr[k].t === c.t)) add(c.t, null, c.at);
     }
    }
    for (const k in tr) {
     const { t, n, at } = tr[k];
     const have = list().some(x => x.src === t && x.champ && (n == null || x.n == null || x.n === n));
     if (have) continue;
     if (!(T(t) && T(t).id === t)) {
      out.push(['natty-gone', t, n]);
      continue;
     }
     const s = snapTeam(t);
     if (!s) {
      out.push(['natty-fail', t, n]);
      continue;
     }
     const d = push(Object.assign(s, {
      w: null,
      l: null,
      champ: 1,
      done: 1,
      n: n,
      games: null,
      k: 'v22|' + t + '|' + (n == null ? '?' : n),
      why: 'backfill-natty-trace',
      bf: 2,
      at: at || Date.now()
     }));
     if (d) out.push(['natty', d.name, t, n]);
    }
   }
  } catch (e) {
   err(e, 'backfill');
  }
  LOG.bf = out;
  return out;
 }
 // ---- UI: SEASON TEAMS section at the top of the COLLEGE tab (DOM list of the quick game picker) ----
 const css = document.createElement('style');
 css.textContent = '#qpc26 .cf.cs429h{color:#ffd23a}#qpc26 .tm.cs429n{border-color:#ffd23a;background:#2a2410}#qpc26 .tm.cs429n i{color:#ffd23a}';
 try {
  document.head.appendChild(css);
 } catch (e) {}
 const info = id => {
  const d = list().find(x => x.id === id) || {};
  const o = d.ovr != null ? 'OVR ' + d.ovr : '';
  const r = d.w != null && d.l != null && (d.w || d.l) ? d.w + '-' + d.l : '';
  return [ o, d.champ ? 'NATTY' : r || (d.done ? 'DONE' : 'UNFINISHED'), d.n ? 'SZN ' + d.n : '' ].filter(Boolean).join(' ');
 };
 function section(box, exclude, onPick, only, el, grid) {
  if (off() || only || typeof el !== 'function' || typeof grid !== 'function') return 0;
  const ids = list().slice().reverse().map(d => d.id).filter(id => id !== exclude && (SZ_REG[id] || reg(list().find(x => x.id === id))));
  if (!ids.length) return 0;
  box.appendChild(el('div', {
   class: 'cf cs429h',
   text: 'SEASON TEAMS'
  }));
  const g = grid(ids, null, onPick, info, null);
  try {
   for (const t of g.querySelectorAll('[data-tid]')) {
    t.classList.add('cs429');
    if (SZ_REG[t.dataset.tid] && SZ_REG[t.dataset.tid].csChamp) t.classList.add('cs429n');
   }
  } catch (e) {}
  box.appendChild(g);
  LOG.shown = ids.length;
  return ids.length;
 }
 function hook() {
  if (!window.V33) return false;
  if (V33.colQp && !V33.colQp.__429) {
   const Q0 = V33.colQp;
   const Q1 = function(box, exclude, onPick, only, el, grid) {
    let n = 0;
    try {
     n = section(box, exclude, onPick, only, el, grid);
    } catch (e) {
     err(e, 'section');
    }
    return (Q0.apply(this, arguments) || 0) + n;
   };
   Q1.__429 = true;
   V33.colQp = Q1;
  }
  if (typeof V33.sig === 'function' && !V33.sig.__429) {
   const S0 = V33.sig;
   const S1 = function() {
    let s = '';
    try {
     s = S0.apply(this, arguments);
    } catch (e) {
     s = '';
    }
    if (off()) return s;
    const a = list();
    return s + '|cs429:' + a.length + ':' + (a.length ? a[a.length - 1].id : '');
   };
   S1.__429 = true;
   V33.sig = S1;
  }
  return true;
 }
 // MY TEAMS (v29r) entries - used by the optional one-line hook in v29r.js
 function myTeams(out) {
  if (off() || !Array.isArray(out)) return out;
  for (const d of list().slice().reverse()) {
   if (!SZ_REG[d.id] && !reg(d)) continue;
   out.push({
    key: 'cs429:' + d.id,
    kind: 'COLLEGE SEASON' + (d.n ? ' ' + d.n : ''),
    label: d.name,
    tid: d.id,
    gold: !!d.champ,
    done: true,
    pick: () => {
     window.__w172pick = null;
     qt26(d.id);
     return 'quick';
    }
   });
  }
  return out;
 }
 let started = false;
 function init() {
  if (started) return;
  started = true;
  try {
   hook();
   if (!off()) {
    regAll();
    backfill();
    tick();
   }
  } catch (e) {
   err(e, 'init');
  }
  setInterval(tick, 1500);
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
 return {
  LOG: LOG,
  list: list,
  reg: reg,
  regAll: regAll,
  tick: tick,
  backfill: backfill,
  archive: archive,
  snapTeam: snapTeam,
  myTeams: myTeams,
  off: off
 };
})();

window.CS429 = CS429;
