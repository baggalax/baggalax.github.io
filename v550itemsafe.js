// v550itemsafe.js - V55.0 ITEMS CAN NO LONGER DISAPPEAR (?v=5500). Kill switch: window.__rl_no550is = true -> exactly like before.
// Charlie (Nov 12 12:56 AM): a player's CYCLONE stick (id fo_warp, the purple FOGO stick) "just disappeared" - "double check items
// won't disappear" + "double check saving items in teams, you can go to the team to get them back and they aren't lost".
// What could take an owned item away before this file (all reproduced headless, see the task report):
//  1. CLOUD SAVE PICK: USE CLOUD SAVE / "NEWER SAVE FROM YOUR OTHER DEVICE" / "TWO DIFFERENT SAVES" (acct23 applySave) replaced the
//     WHOLE phone save with the cloud copy. Anything you got on this phone after that cloud copy (a Cyclone from a pack...) was gone.
//     KEEP THIS PHONE'S SAVE did the same to the cloud copy (an item got on the other device was gone once it loaded the cloud).
//  2. TRADES (trade24 applyLocal + the server's apply24): giving ONE item deleted the WHOLE stack (2 Cyclones -> trade 1 -> 0 left),
//     and receiving an item you already owned set it to 1 (2 -> 1).
//  3. TEAM LOADOUTS ON A TEAM THAT IS GONE: items saved on a team (ST.tequip) count as "in use" (Locker shows x0) until you go back
//     to that team. A season team is archived (SEASON TEAMS list, keeps only the last 12): when it rolls off the list the items on it
//     stayed "in use" forever - x0 in the Locker, can't equip, no team to go back to.
//  4. FOGO STICK "BREAK" (online checks): a faceoff stick is never used up (items17 spareFor skips fo sticks) but the break swapped it
//     off the FOGO for a REGULAR STICK and said "BROKE HIS CYCLONE", so it looked gone from him.
//  5. Two copies of the game open at once (two tabs) - the older one saving last wrote its older inventory over the newer one.
// The fix (nothing old is edited; ids, rl_* keys, saves and the net protocol are unchanged):
//  a. INVENTORY GUARD: V17.ST().inv is watched. An owned count can only go DOWN through a real spend the game shows you:
//     SELL, tape running out, a non-faceoff stick breaking, a trade (now exactly the traded count), crew/badge/rule re-counts,
//     START OVER (V17.reset). Anything else is refused (count kept) and noted in V550IS.blocked.
//  b. Every gain/spend is written to a small ledger (rl_ilog550, rides in the cloud save) + a rolling backup (rl_invbak550).
//     On load, an item that is lower than the backup with no spend in the ledger is put back.
//  c. CLOUD PICK MERGES ITEMS: after USE CLOUD SAVE the phone's items that the cloud copy never saw are added back (ledger), and an
//     item the phone had that the cloud copy has none of is kept. KEEP THIS PHONE'S SAVE first pulls in the cloud copy's items.
//     (UNDO LOAD is left exactly as before.)
//  d. GONE-TEAM LOADOUTS: items on a team that no longer exists go back to the Locker ("N ITEMS BACK IN YOUR LOCKER ROOM").
//  e. LOCKER: an item you own that is saved on a team shows "ON <TEAM>" instead of looking like x0 = gone.
//  f. A FOGO stick that "broke" goes back on its FOGO after the game (it was never used up).
//  g. Two tabs: a gain/spend in one open copy is applied in the other (storage event), so the last save can't undo it.
// Other files can spend on purpose with V550IS.allow(fn).
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no550is || W.__rl_v124gb || W.V550IS) return;
 if (!W.V17 || typeof V17.ST !== 'function') return;
 const off = () => !!(W.__rl_no550is || W.__rl_v124gb);
 const LOGK = 'rl_ilog550', BAKK = 'rl_invbak550', DONEK = 'x550bak23';
 const V = W.V550IS = { blocked: [], restored: [], merged: [], back: [], fogo: [], ev: 0, err: [], log: [] };
 const note = s => { V.log.push(Date.now() % 1e7 + ' ' + s); if (V.log.length > 60) V.log.shift(); };
 const fail = (w, e) => { try { if (V.err.length < 12) V.err.push(w + ': ' + String(e && e.message || e).slice(0, 160)); } catch (x) {} };
 const BY = () => V17.BY || {};
 const jget = k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
 const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
 const TAG = Math.random().toString(36).slice(2, 7);
 let seq = 0, allow = 0, quiet = 0;
 V.allow = fn => { allow++; try { return fn(); } finally { allow--; } };
 // ---------- ledger ----------
 let LOG = (() => { const o = jget(LOGK); return o && Array.isArray(o.ev) ? o : { ev: [] }; })();
 const known = new Set(LOG.ev.map(e => e[0]));
 function saveLog() {
  if (LOG.ev.length > 600) LOG.ev = LOG.ev.slice(-600);
  jset(LOGK, LOG);
 }
 function ev(id, d, why) {
  const k = TAG + '.' + (++seq) + '.' + (Date.now() % 1e8).toString(36);
  LOG.ev.push([k, id, d, why, Date.now()]);
  known.add(k);
  V.ev++;
  saveLog();
 }
 // ---------- which code is taking an item away ----------
 const RULES = [
  [/\bsell\b/, 'sell'], [/\bgameOver\b/, 'used'], [/\bspareFor\b/, 'broke'], [/\bstickBreak\b/, 'broke'],
  [/\bapplyLocal\b/, 'trade'], [/\bdd232\b/, 'dupe'], [/v35\.js/, 'badge'], [/v493shop\.js/, 'rule493'],
  [/honors25\.js/, 'honor'], [/\breset\b/, 'reset']
 ];
 function why(id) {
  if (allow) return 'allow';
  const it = BY()[id];
  if (it && (it.crew || it.b35)) return 'recount';
  let st = '';
  const L0 = Error.stackTraceLimit;
  try { Error.stackTraceLimit = 40; st = String(new Error().stack || ''); } catch (e) {} finally { try { Error.stackTraceLimit = L0; } catch (e) {} }
  for (const [re, w] of RULES) if (re.test(st)) return w;
  return null;
 }
 // ---------- the guard ----------
 const RAW = Symbol('raw550');
 function wrap() {
  try {
   const S = V17.ST();
   if (!S || !S.inv || typeof S.inv !== 'object') return;
   if (S.inv[RAW]) return;
   const raw = S.inv;
   S.inv = new Proxy(raw, {
    get(t, k, r) { if (k === RAW) return t; return Reflect.get(t, k, r); },
    set(t, k, v) {
     if (typeof k !== 'string' || off() || quiet) { t[k] = v; return true; }
     const o = Math.max(0, +t[k] || 0);
     let n = +v;
     if (!isFinite(n)) n = 0;
     if (n === 1 && o >= 1 && why550trade()) { v = o + 1; n = o + 1; }   // a trade GIVING you one you already own: +1, not "= 1"
     if (n < o) {
      const w = why(k);
      if (!w) { V.blocked.push([k, o, n, Date.now()]); note('blocked ' + k + ' ' + o + '->' + n); try { ev(k, 0, 'blk:' + o + '>' + n); } catch (e) {} return true; }
      t[k] = v;
      ev(k, n - o, w);
      return true;
     }
     t[k] = v;
     if (n !== o) ev(k, n - o, 'add');
     return true;
    },
    deleteProperty(t, k) {
     if (typeof k !== 'string' || off() || quiet) { delete t[k]; return true; }
     const o = Math.max(0, +t[k] || 0);
     if (!o) { delete t[k]; return true; }
     const w = why(k);
     if (!w) { V.blocked.push([k, o, 0, Date.now()]); note('blocked delete ' + k); try { ev(k, 0, 'blk:' + o + '>0'); } catch (e) {} return true; }
     if (w === 'trade' && o > 1) { t[k] = o - 1; ev(k, -1, 'trade'); return true; } // giving ONE away, not the stack
     delete t[k];
     ev(k, -o, w);
     return true;
    }
   });
   note('guard on');
  } catch (e) { fail('wrap', e); }
 }
 function why550trade() {
  let st = '';
  try { st = String(new Error().stack || ''); } catch (e) {}
  return /\bapplyLocal\b/.test(st);
 }
 const rawInv = () => { const S = V17.ST(); return S && S.inv ? (S.inv[RAW] || S.inv) : {}; };
 const save17 = () => { try { V17.save(); } catch (e) { fail('save', e); } };
 // ---------- rolling backup ----------
 let bakSig = '';
 function backup() {
  try {
   const inv = {}, r = rawInv();
   for (const k of Object.keys(r).sort()) if ((+r[k] || 0) > 0) inv[k] = +r[k];
   const n = LOG.ev.length ? LOG.ev[LOG.ev.length - 1][0] : '', sig = n + JSON.stringify(inv);
   if (sig === bakSig && localStorage.getItem(BAKK)) return;   // unchanged: no rewrite (the cloud save only uploads real changes)
   bakSig = sig;
   jset(BAKK, { t: Date.now(), n: n, inv: inv });
  } catch (e) { fail('backup', e); }
 }
 const restorable = id => { const it = BY()[id]; return !!it && !it.crew && !it.b35 && !it.trophy && !(W.V493 && (V493.stripped || []).includes(id)); };
 function checkBackup() {
  const b = jget(BAKK);
  if (!b || !b.inv) return 0;
  const S = V17.ST(), r = rawInv();
  // spends recorded after the backup was taken
  let i = LOG.ev.findIndex(e => e[0] === b.n);
  const after = i >= 0 ? LOG.ev.slice(i + 1) : LOG.ev.filter(e => e[4] > (b.t || 0));
  const spent = {};
  for (const e of after) if (e[2] < 0) spent[e[1]] = (spent[e[1]] || 0) - e[2];
  let n = 0;
  quiet++;
  try {
   for (const id in b.inv) {
    const want = (+b.inv[id] || 0) - (spent[id] || 0), cur = +r[id] || 0;
    if (want > cur && restorable(id)) {
     r[id] = want;
     S.seen[id] = true;
     V.restored.push([id, cur, want]);
     n++;
    }
   }
  } finally { quiet--; }
  if (n) { note('restored ' + n + ' from backup'); for (const [id, a, c] of V.restored) ev(id, c - a, 'restore'); save17(); }
  return n;
 }
 // ---------- cloud pick merge ----------
 const tradesOf = o => { try { const t = JSON.parse(o.rl_tr24 || '[]'); return Array.isArray(t) ? t.map(String) : []; } catch (e) { return []; } };
 // phone = the save being replaced / kept, cloud = the other one. Returns the merged inventory + ledger.
 function mergeInv(baseInv, baseLog, otherInv, otherLog, otherNewTrades) {
  const out = Object.assign({}, baseInv);
  const bk = new Set(baseLog.map(e => e[0]));
  const minT = baseLog.length ? Math.min(...baseLog.map(e => e[4])) : 0;
  const only = otherLog.filter(e => !bk.has(e[0]) && (!baseLog.length || e[4] >= minT) && !String(e[3]).startsWith('blk'));
  const d = {};
  for (const e of only) d[e[1]] = (d[e[1]] || 0) + (+e[2] || 0);
  const why = {};
  for (const id in d) if (d[id] > 0) { const it = BY()[id]; if (!it) continue; const v = (+out[id] || 0) + d[id]; out[id] = it.crew ? 1 : v; why[id] = 'ledger +' + d[id]; }
  // pre-ledger saves: the other copy owns an item this one has NONE of and nothing says it was spent -> keep it
  if (!otherNewTrades) {
   const neg = new Set(baseLog.concat(otherLog).filter(e => e[2] < 0).map(e => e[1]));
   for (const id in otherInv) {
    const n = +otherInv[id] || 0, it = BY()[id];
    if (n > 0 && !(+out[id] > 0) && !neg.has(id) && it && restorable(id) && it.sec !== 'tape' && id !== 'stick_reg') { out[id] = n; why[id] = 'kept ' + n; }
   }
  }
  const log = baseLog.concat(only).sort((a, b) => a[4] - b[4]).slice(-600);
  return { inv: out, log: log, why: why };
 }
 function afterCloudLoad() {
  try {
   const b = jget('rl_bak23'), A = W.V23 && V23.A ? V23.A() : null;
   if (!b || !b.data || !b.t) return 0;
   if (localStorage.getItem(DONEK) === String(b.t)) return 0;
   localStorage.setItem(DONEK, String(b.t));
   if (Date.now() - b.t > 6e5) return 0;                 // an old backup, not a load that just happened
   if (A && A.h === 'restore') { note('undo load - no merge'); return 0; }   // UNDO LOAD stays exactly as before
   const ph = (() => { try { return JSON.parse(b.data.rl_v17 || 'null'); } catch (e) { return null; } })();
   if (!ph || !ph.inv) return 0;
   const phLog = (() => { try { const o = JSON.parse(b.data[LOGK] || 'null'); return o && Array.isArray(o.ev) ? o.ev : []; } catch (e) { return []; } })();
   const cloudNow = {}; { const r = rawInv(); for (const k in r) cloudNow[k] = +r[k] || 0; }
   const cTr = tradesOf({ rl_tr24: localStorage.getItem('rl_tr24') }), pTr = new Set(tradesOf(b.data));
   const newTr = cTr.some(t => !pTr.has(t));
   const m = mergeInv(cloudNow, LOG.ev, ph.inv, phLog, newTr);
   const S = V17.ST(), r = rawInv();
   let n = 0;
   quiet++;
   try {
    for (const id in m.why) { if ((+m.inv[id] || 0) > (+r[id] || 0)) { V.merged.push([id, +r[id] || 0, m.inv[id], m.why[id]]); r[id] = m.inv[id]; S.seen[id] = true; n++; } }
    for (const id in (ph.seen || {})) if (ph.seen[id] && BY()[id]) S.seen[id] = true;
   } finally { quiet--; }
   LOG.ev = m.log; known.clear(); LOG.ev.forEach(e => known.add(e[0])); saveLog();
   save17();
   note('cloud load merge: ' + n + ' items kept from this phone');
   if (n) {
    toast550(n === 1 ? 'KEPT 1 ITEM FROM THIS PHONE' : 'KEPT ' + n + ' ITEMS FROM THIS PHONE');
    // upload the merged save once acct23 has adopted the loaded one
    setTimeout(() => { try { if (V23.A().tok) V23.put(false, 'itemsafe550'); } catch (e) { fail('mergeput', e); } }, 2500);
   }
   return n;
  } catch (e) { fail('cloudmerge', e); return 0; }
 }
 // KEEP THIS PHONE'S SAVE: pull the cloud copy's items in first, then let the button do its job
 let keepBusy = false;
 document.addEventListener('click', e => {
  if (off() || keepBusy) return;
  const t = e.target && e.target.closest ? e.target.closest('#p23local') : null;
  if (!t || t.__ok550) return;
  if (!W.V23 || !V23.A || !V23.A().tok || !V23.api) return;
  e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
  keepBusy = true;
  (async () => {
   try {
    const g = await V23.api('/save/get', { tok: V23.A().tok });
    if (g && g.ok && g.save && g.save.data) {
     const o = JSON.parse(g.save.data), cl = JSON.parse(o.rl_v17 || 'null') || {};
     const clLog = (() => { try { const x = JSON.parse(o[LOGK] || 'null'); return x && Array.isArray(x.ev) ? x.ev : []; } catch (er) { return []; } })();
     const pTr = new Set(tradesOf({ rl_tr24: localStorage.getItem('rl_tr24') }));
     const newTr = tradesOf(o).some(x => !pTr.has(x));
     const cur = {}; { const r = rawInv(); for (const k in r) cur[k] = +r[k] || 0; }
     const m = mergeInv(cur, LOG.ev, cl.inv || {}, clLog, newTr);
     const S = V17.ST(), r = rawInv();
     let n = 0;
     quiet++;
     try { for (const id in m.why) if ((+m.inv[id] || 0) > (+r[id] || 0)) { V.merged.push([id, +r[id] || 0, m.inv[id], 'keep: ' + m.why[id]]); r[id] = m.inv[id]; S.seen[id] = true; n++; } } finally { quiet--; }
     LOG.ev = m.log; known.clear(); LOG.ev.forEach(x => known.add(x[0])); saveLog();
     if (n) { save17(); toast550('KEPT ' + n + (n === 1 ? ' ITEM' : ' ITEMS') + ' FROM YOUR CLOUD SAVE'); }
     note('keep-phone merge ' + n);
    }
   } catch (er) { fail('keepmerge', er); }
   keepBusy = false;
   try { t.__ok550 = true; t.click(); } finally { t.__ok550 = false; }
  })();
 }, true);
 // ---------- team loadouts on a team that no longer exists ----------
 const teamOk = id => {
  try {
   if (!id) return false;
   if (typeof SZ_REG !== 'undefined' && SZ_REG[id]) return true;
   if (typeof WT_REG !== 'undefined' && WT_REG[id]) return true;
   if (typeof GH_REG !== 'undefined' && GH_REG[id]) return true;
   if (typeof TEAMS !== 'undefined' && TEAMS.some(t => t.id === id)) return true;
   if (typeof szArchList2314 === 'function' && szArchList2314().some(d => d && d.id === id)) return true;
   if (typeof wgArchList2314 === 'function' && wgArchList2314().some(d => d && (d.id === id || d.team === id))) return true;
  } catch (e) {}
  return false;
 };
 const teamName = id => { try { if (teamOk(id) && typeof T === 'function') { const t = T(id); if (t && t.name) return String(t.name).toUpperCase(); } } catch (e) {} return 'A TEAM'; };
 const strike = {};
 function sweepTeams() {
  try {
   if (off()) return 0;
   const S = V17.ST(), tq = S.tequip;
   if (!tq || typeof tq !== 'object') return 0;
   let n = 0;
   for (const k of Object.keys(tq)) {
    if (!/^SZ[A-Z0-9]{4}$/.test(k) || teamOk(k)) { delete strike[k]; continue; }   // only archived SEASON TEAMS ever roll off
    strike[k] = (strike[k] || 0) + 1;
    if (strike[k] < 2) continue;                       // gone on two checks in a row (10 s apart): give the items back
    const st = tq[k];
    let c = 0;
    if (st && typeof st === 'object') for (const pid in st) { const e = st[pid]; if (e && typeof e === 'object') for (const s in e) if (e[s] && BY()[e[s]]) c++; }
    delete tq[k];
    if (S.qk2403 && S.qk2403[k]) delete S.qk2403[k];
    V.back.push([k, c]);
    n += c;
    delete strike[k];
   }
   if (n) { save17(); toast550(n + (n === 1 ? ' ITEM' : ' ITEMS') + ' BACK IN YOUR LOCKER ROOM (THEIR TEAM IS GONE)'); note('gone-team items back ' + n); }
   return n;
  } catch (e) { fail('sweep', e); return 0; }
 }
 V.sweepTeams = sweepTeams;
 // ---------- where is it? (Locker) ----------
 function whereIs(id) {
  const S = V17.ST(), out = [];
  const scan = (st, label) => { if (st && typeof st === 'object') for (const pid in st) { const e = st[pid]; if (e && typeof e === 'object') for (const s in e) if (e[s] === id) out.push(label); } };
  try {
   scan(S.equip, 'SEASON TEAM'); scan(S.wequip, 'WORLD TEAM'); scan(S.mequip, 'QUICK TEAM');
   for (const k in (S.tequip || {})) scan(S.tequip[k], teamName(k));
   if (W.V28 && V28.cardStore) scan(V28.cardStore(), 'A CARD');
  } catch (e) {}
  return out;
 }
 V.whereIs = whereIs;
 function tagLocker() {
  try {
   if (off()) return;
   const cs = document.querySelectorAll('.c17[data-v] .ct');
   if (!cs.length) return;
   const r = rawInv();
   cs.forEach(ct => {
    const c = ct.closest('.c17'), id = c && c.getAttribute('data-v');
    if (!id || !BY()[id] || c.querySelector('.t550')) return;
    if (ct.textContent.trim() !== 'x0' || !((+r[id] || 0) > 0)) return;
    const w = whereIs(id);
    if (!w.length) return;
    const u = [...new Set(w)];
    const b = document.createElement('b');
    b.className = 't550';
    b.textContent = 'ON ' + u[0] + (u.length > 1 ? ' +' + (u.length - 1) : '');
    b.style.cssText = 'position:absolute;left:1px;right:1px;bottom:1px;font:bold 7px/1.1 "Courier New",monospace;color:#0b1a20;background:#7dff7a;text-align:center;padding:1px 0;pointer-events:none;z-index:2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
    const art = c.querySelector('.art') || c;
    if (getComputedStyle(art).position === 'static') art.style.position = 'relative';
    art.appendChild(b);
    c.setAttribute('aria-label', (c.getAttribute('aria-label') || '') + ' - ' + b.textContent);
   });
  } catch (e) { fail('tag', e); }
 }
 // ---------- a FOGO stick that "broke" goes back on its FOGO ----------
 function fogoBack(G) {
  try {
   if (off() || !G || !G.g17 || !Array.isArray(G.g17.breaks)) return;
   const S = V17.ST(), r = rawInv();
   for (const b of G.g17.breaks) {
    const it = b && BY()[b.id];
    if (!it || !it.fo || b.side !== 0) continue;
    if (!((+r[b.id] || 0) > 0) || V17.freeCount(b.id) <= 0) continue;
    const L0 = G.g17.L && G.g17.L[0], src = L0 && L0.src;
    const st = src === 'match' ? (V17.mStore ? V17.mStore() : S.mequip) : src === 'world' ? S.wequip : S.equip;   // same pick as items17 userTeamKind
    const e = st && st[b.pid];
    if (e && typeof e === 'object' && (!e.stick || e.stick === 'stick_reg')) {
     st[b.pid] = Object.assign({}, e, { stick: b.id });
     V.fogo.push([b.pid, b.id]);
     toast550('NO WORRIES - FACEOFF STICKS NEVER BREAK. ' + it.n + ' IS BACK ON HIM');
    }
   }
   save17();
  } catch (e) { fail('fogo', e); }
 }
 if (typeof V17.gameOver === 'function') {
  const go0 = V17.gameOver;
  V17.gameOver = function (G) {
   const r = go0.apply(this, arguments);
   try { setTimeout(() => fogoBack(G), 0); } catch (e) {}
   return r;
  };
 }
 // ---------- START OVER is a real reset ----------
 if (typeof V17.reset === 'function') {
  const rs0 = V17.reset;
  V17.reset = function () {
   allow++;
   try { return rs0.apply(this, arguments); } finally {
    allow--;
    LOG = { ev: [] }; known.clear(); saveLog();
    try { localStorage.removeItem(BAKK); } catch (e) {}
    setTimeout(() => { wrap(); backup(); }, 0);
   }
  };
 }
 // ---------- two open copies ----------
 W.addEventListener('storage', e => {
  try {
   if (off() || e.key !== LOGK || !e.newValue) return;
   const o = JSON.parse(e.newValue);
   if (!o || !Array.isArray(o.ev)) return;
   const S = V17.ST(), r = rawInv();
   let n = 0;
   quiet++;
   try {
    for (const x of o.ev) {
     if (known.has(x[0])) continue;
     if (!(+x[4] > Date.now() - 12e4)) { known.add(x[0]); continue; }   // only fresh moves from a copy open right now
     known.add(x[0]);
     LOG.ev.push(x);
     const d = +x[2] || 0;
     if (!d || !BY()[x[1]]) continue;
     r[x[1]] = Math.max(0, (+r[x[1]] || 0) + d);
     if (d > 0) S.seen[x[1]] = true;
     n++;
    }
   } finally { quiet--; }
   if (n) { note('applied ' + n + ' from the other tab'); try { LS.set('v17', S); } catch (er) {} }
  } catch (er) { fail('storage', er); }
 });
 function toast550(s) { try { if (V17.toast) V17.toast(s, '#7dff7a'); } catch (e) {} }
 // ---------- boot ----------
 wrap();
 try { afterCloudLoad(); } catch (e) { fail('boot cloud', e); }
 try { checkBackup(); } catch (e) { fail('boot backup', e); }
 backup();
 setInterval(() => { if (off()) return; wrap(); backup(); }, 4000);
 setInterval(() => { if (!off()) sweepTeams(); }, 10000);
 setTimeout(sweepTeams, 3000);
 setInterval(tagLocker, 600);
 W.addEventListener('pagehide', () => { try { if (!off()) backup(); } catch (e) {} });
 V.on = () => !off();
 V.mergeInv = mergeInv;
 V.wrap = wrap;
 V.backup = backup;
 V.checkBackup = checkBackup;
 V.fogoBack = fogoBack;
 V.ledger = () => LOG.ev.slice();
})();
