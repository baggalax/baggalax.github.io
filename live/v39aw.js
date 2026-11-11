(function() {
 'use strict';
 const FISH = () => !!window.__rl_v124gb;
 const on7 = () => !FISH() && !window.__rl_no39aw;
 const on8 = () => !FISH() && !window.__rl_no39aa;
 const LOG = {
  wrapped: [],
  off1: [],
  offAll: [],
  put: [],
  grant8: [],
  sweep8: 0,
  swaps: 0,
  err: []
 };
 const AWARD = {
  chest_aa35: 'aa',
  chest_ult35: 'ult',
  chest_tew25: 'tew'
 };
 const isUAA = pid => /^U_AA25-/.test(String(pid || ''));
 const B = () => window.V35 && V35.b35 || null;
 const CS = () => {
  try {
   const b = B();
   return b && b.st ? b.st() : null;
  } catch (e) {
   return null;
  }
 };
 const x39 = () => {
  const c = CS();
  if (!c) return null;
  if (!c.x39 || typeof c.x39 !== 'object' || Array.isArray(c.x39)) c.x39 = {};
  return c.x39;
 };
 const csSave = () => {
  try {
   const c = CS();
   if (c) LS.set('v35chest', c);
  } catch (e) {
   LOG.err.push('cs ' + e);
  }
 };
 const live = () => {
  try {
   const b = B();
   return !!(b && b.ownsMarks && b.ownsMarks());
  } catch (e) {
   return false;
  }
 };
 function xOff(pid) {
  if (!on7() || !isUAA(pid)) return false;
  const c = CS();
  return !!(c && c.x39 && c.x39[pid]);
 }
 function aaKind(pid) {
  return on8() && /^TW25-/.test(String(pid || ''));
 }
 const hasMark = (pid, t) => {
  try {
   const b = B();
   return !!(b && b.marks && b.marks(pid).includes(t));
  } catch (e) {
   return false;
  }
 };
 function isOn(pid, id) {
  const t = AWARD[id];
  if (!t || !pid) return false;
  if (t === 'tew') {
   try {
    return !!(window.HON25 && HON25.glowOn(pid));
   } catch (e) {
    return false;
   }
  }
  return hasMark(pid, t);
 }
 const nm = pid => {
  try {
   return lastName(PP(pid));
  } catch (e) {
   return '';
  }
 };
 const say = (id, pid) => {
  try {
   const it = V17.BY[id];
   V17.toast((it ? it.n : 'BADGE') + ' OFF ' + nm(pid), '#ff9a8a');
  } catch (e) {}
 };
 function off1(pid, id, quiet) {
  const t = AWARD[id], b = B();
  if (!t || !b || !isOn(pid, id)) return false;
  if (t === 'tew') {
   HON25.glowSet(pid, false);
  } else if (t === 'ult') {
   if (b.chosen(pid) === 'ult') b.off(pid);
  } else {
   if (isUAA(pid)) {
    const X = x39();
    if (X) {
     X[pid] = 1;
     csSave();
    }
    if (b.chosen(pid) === 'aa') b.off(pid);
   } else b.off(pid);
  }
  try {
   V17.save();
  } catch (e) {}
  LOG.off1.push([ pid, id ]);
  if (!quiet) say(id, pid);
  return true;
 }
 function offAll(pid) {
  let n = 0;
  for (const id of Object.keys(AWARD)) if (off1(pid, id, true)) n++;
  if (n) LOG.offAll.push([ pid, n ]);
  return n;
 }
 function hasAward(pid) {
  try {
   const b = B();
   return !!pid && (b && b.kinds(pid).length > 0 || !!(window.HON25 && HON25.isTew(pid)));
  } catch (e) {
   return false;
  }
 }
 function wrapB35() {
  const b = B();
  if (!b || b.__aw39) return !!b;
  const put0 = b.put, eq0 = b.eqHook;
  b.put = function(pid, id) {
   if (on7() && live() && id === 'chest_aa35' && isUAA(pid)) {
    const X = x39();
    if (X && X[pid]) {
     delete X[pid];
     csSave();
    }
    LOG.put.push(pid);
    try {
     b.inv();
    } catch (e) {}
    return true;
   }
   return put0.apply(this, arguments);
  };
  b.eqHook = function(pid, e) {
   const o = eq0.apply(this, arguments);
   if (!on7() || !isUAA(pid) || !live()) return o;
   if (o && o.chest) return o;
   if (!hasMark(pid, 'aa')) return o;
   return Object.assign({}, o || {}, {
    chest: 'chest_aa35'
   });
  };
  b.__aw39 = true;
  LOG.wrapped.push('b35');
  return true;
 }
 let dragAt = 0, dn = null;
 window.addEventListener('pointerdown', e => {
  dn = {
   x: e.clientX,
   y: e.clientY,
   id: e.pointerId,
   m: false
  };
 }, true);
 window.addEventListener('pointermove', e => {
  if (dn && e.pointerId === dn.id && Math.hypot(e.clientX - dn.x, e.clientY - dn.y) > 8) dn.m = true;
 }, true);
 window.addEventListener('pointerup', e => {
  if (dn && e.pointerId === dn.id && dn.m) dragAt = performance.now();
  dn = null;
 }, true);
 const dragged = () => performance.now() - dragAt < 450;
 function trayPid() {
  try {
   const s = lobbyState();
   return s && !s.locked ? s.pid : null;
  } catch (e) {
   return null;
  }
 }
 function afterHome(n0) {
  if (!on7() || !live()) return;
  const T = V17.tray && V17.tray();
  if (!T || T.slot !== 'chest' || !Array.isArray(T.items)) return;
  const pid = trayPid();
  if (!pid || !hasAward(pid)) return;
  const k = screenKey() + '|';
  for (let i = n0; i < uiSpecs.length; i++) {
   const s = uiSpecs[i];
   if (!s || !s.key.startsWith(k)) continue;
   const lab = s.key.slice(k.length);
   if (lab === 'TAKE OFF') {
    const f0 = s.fn;
    s.fn = () => {
     f0();
     offAll(pid);
    };
    LOG.swaps++;
    continue;
   }
   if (lab.startsWith('TRAY ')) {
    const id = lab.slice(5);
    if (AWARD[id] && isOn(pid, id)) {
     s.fn = () => {
      if (dragged()) return;
      off1(pid, id);
     };
     s.label = 'TAKE OFF ' + (V17.BY[id] ? V17.BY[id].n : id);
     LOG.swaps++;
    }
   }
  }
  let eq = {};
  try {
   eq = V17.eqOf(pid) || {};
  } catch (e) {}
  const vals = Object.values(eq);
  let any = false;
  for (const q of T.items) {
   if (!AWARD[q.id] || !isOn(pid, q.id)) continue;
   any = true;
   if (vals.includes(q.id)) continue;
   rect(q.x, q.y + 2, q.w, q.h - 2, '#3a3410');
   rect(q.x, q.y + q.h - 2, q.w, 2, '#ffe14d');
   try {
    const c = V17.icon(q.id, false);
    if (c) g.drawImage(c, Math.round(q.x + 2), Math.round(q.y + 4 + (typeof SA2403B !== 'undefined' && SA2403B ? sa2403By(0) : 0)), 20, 20);
   } catch (e) {}
   try {
    textMini('x' + Math.max(0, V17.freeCount(q.id) + 1), q.x + q.w / 2, q.y + 25, '#cfe');
   } catch (e) {}
  }
  if (any) try {
   const L = T.items.length ? Math.max(...T.items.map(q => q.x + q.w)) : 60;
   textMini('TAP A LIT BADGE TO TAKE IT OFF', Math.max(64, Math.min(L / 2 + 2, 110)), T.items[0].y + 35, '#ffe14d');
  } catch (e) {}
 }
 function wrapHome() {
  if (!window.V17 || typeof V17.drawHome !== 'function' || V17.drawHome.__aw39) return !!(window.V17 && V17.drawHome && V17.drawHome.__aw39);
  const d0 = V17.drawHome;
  const d1 = function() {
   const n0 = uiSpecs.length;
   const r = d0.apply(this, arguments);
   try {
    afterHome(n0);
   } catch (e) {
    LOG.err.push('home ' + e);
   }
   return r;
  };
  d1.__aw39 = true;
  V17.drawHome = d1;
  LOG.wrapped.push('drawHome');
  return true;
 }
 const hon = () => {
  try {
   return window.HON25 && HON25.st ? HON25.st() : null;
  } catch (e) {
   return null;
  }
 };
 const honSave = () => {
  try {
   const S = hon();
   if (S) LS.set('hon25', S);
  } catch (e) {
   LOG.err.push('hs ' + e);
  }
 };
 function give8(list) {
  if (!on8() || !window.HON25 || !HON25.on() || !window.V22 || !V22.on()) return [];
  const got = [], P0 = V22.popup;
  got.done = [];
  try {
   V22.popup = function() {};
   for (const b of list) {
    const p = b && PP(b);
    if (!p || p.leg) {
     LOG.wait8 = (LOG.wait8 || 0) + 1;
     continue;
    }
    if (V22.owned('AA25-' + b)) {
     got.done.push(b);
     continue;
    }
    const tw = PP('TW25-' + b), r = HON25.grant('aa', b, tw && tw.team || p.team);
    if (r && r.isNew) {
     got.push(r.pid);
     LOG.grant8.push(r.pid);
    }
    if (V22.owned('AA25-' + b)) got.done.push(b);
   }
  } catch (e) {
   LOG.err.push('g8 ' + e);
   console.error(e);
  } finally {
   V22.popup = P0;
  }
  return got;
 }
 function sweep8(popup) {
  if (!on8() || !window.HON25 || !HON25.on() || !window.V22 || !V22.on()) return [];
  const S = hon();
  if (!S || !S.cards || typeof S.cards !== 'object') return [];
  if (!S.aa39 || typeof S.aa39 !== 'object' || Array.isArray(S.aa39)) S.aa39 = {};
  const todo = [];
  for (const pid of Object.keys(S.cards)) {
   if (!/^TW25-/.test(pid)) continue;
   const b = pid.slice(5);
   if (S.aa39[b]) continue;
   if (!V22.owned(pid)) continue;
   todo.push(b);
  }
  if (!todo.length) return [];
  const got = give8(todo);
  for (const b of got.done) S.aa39[b] = Date.now();
  honSave();
  LOG.sweep8++;
  if (got.length && popup && V22.popup) try {
   V22.popup('aa39|' + got.join(','), 'ALL-AMERICAN CARD!', got.length === 1 ? 'YOUR BAAGAADOWEWINA WINNER IS AN ALL-AMERICAN TOO (+3 OVR CARD)' : 'YOUR BAAGAADOWEWINA WINNERS ARE ALL-AMERICANS TOO (+3 OVR CARDS)', got);
  } catch (e) {
   console.error(e);
  }
  return got;
 }
 function wrapGrant() {
  if (!window.HON25 || typeof HON25.grant !== 'function' || HON25.grant.__aw39) return !!(window.HON25 && HON25.grant && HON25.grant.__aw39);
  const g0 = HON25.grant;
  const g1 = function(kind) {
   const r = g0.apply(this, arguments);
   if (kind === 'tew' && on8()) setTimeout(() => {
    try {
     sweep8(true);
    } catch (e) {
     LOG.err.push('sw ' + e);
    }
   }, 0);
   return r;
  };
  g1.__aw39 = true;
  HON25.grant = g1;
  LOG.wrapped.push('grant');
  return true;
 }
 window.V39AW = {
  LOG: LOG,
  xOff: xOff,
  aaKind: aaKind,
  isOn: isOn,
  off1: off1,
  offAll: offAll,
  sweep8: sweep8,
  give8: give8,
  on7: on7,
  on8: on8,
  AWARD: AWARD
 };
 function init() {
  let ok = true;
  try {
   ok = wrapB35() && ok;
  } catch (e) {
   LOG.err.push('b35 ' + e);
  }
  try {
   ok = wrapHome() && ok;
  } catch (e) {
   LOG.err.push('wh ' + e);
  }
  try {
   ok = wrapGrant() && ok;
  } catch (e) {
   LOG.err.push('wg ' + e);
  }
  return ok;
 }
 if (!init()) {
  let n = 0;
  const iv = setInterval(() => {
   if (init() || ++n > 200) clearInterval(iv);
  }, 25);
 }
 for (const ms of [ 1500, 6e3, 2e4 ]) setTimeout(() => {
  try {
   sweep8(true);
  } catch (e) {
   LOG.err.push('boot ' + e);
  }
 }, ms);
})();
