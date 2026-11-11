(function() {
 'use strict';
 window.V401ED = {
  on: false
 };
 var N = window.N31, E = window.ED31;
 if (window.__rl_no401ed || window.__rl_v124gb || !N || !N.on || !N.DEF || !E || !E.openPlayer || !E.state) return;
 var DEF = N.DEF, KEY = N.KEY || 'bl31_names', LOG = {
  dup: 0,
  saved: 0,
  live: 0,
  errs: []
 };
 function err(e, w) {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 20) LOG.errs.shift();
  } catch (x) {}
 }
 function validNo(v) {
  return v != null && v !== '' && /^\d{1,2}$/.test(String(v));
 }
 function PPs(pid) {
  try {
   return typeof PP === 'function' ? PP(pid) : null;
  } catch (e) {
   return null;
  }
 }
 function nowNo(pid, W) {
  var e = W && W.p && W.p[pid];
  if (e && validNo(e.no)) return +e.no;
  var dp = DEF.players[pid];
  if (!dp) return null;
  try {
   var p = PPs(pid);
   if (p && typeof jerseyNo === 'function') {
    var v = jerseyNo(p, 'real', dp.tid);
    if (v !== '' && v != null) return +v;
   }
  } catch (x) {}
  return dp.no != null ? dp.no : null;
 }
 function nameOf(pid, W) {
  var e = W && W.p && W.p[pid];
  return String(e && e.n || DEF.players[pid] && DEF.players[pid].n || pid).toUpperCase();
 }
 function taken(pid, no, W) {
  var dp = DEF.players[pid];
  if (!dp || !validNo(no)) return null;
  no = +no;
  var ids = Object.keys(DEF.players);
  for (var i = 0; i < ids.length; i++) {
   var q = ids[i];
   if (q === pid || DEF.players[q].tid !== dp.tid) continue;
   if (nowNo(q, W) === no) return q;
  }
  return null;
 }
 function msg(sel, s) {
  var m = document.querySelector(sel);
  if (m) {
   m.textContent = s;
   m.className = 'msg';
  }
 }
 function edCheck(ev) {
  try {
   var box = document.getElementById('ed31Edit');
   if (!box) return;
   var t = ev.target, isSave = ev.type === 'click' ? !!(t && t.closest && t.closest('button') && t.closest('button').getAttribute('aria-label') === 'SAVE PLAYER' && box.contains(t)) : ev.key === 'Enter' && box.contains(t);
   if (!isSave) return;
   var st = E.state(), pid = st.view && st.view.edit, nu = document.getElementById('ed31Num');
   if (!pid || !DEF.players[pid] || !nu) return;
   var v = String(nu.value || '').trim();
   if (!validNo(v)) return;
   var q = taken(pid, v, st.W);
   if (!q) return;
   ev.stopImmediatePropagation();
   ev.preventDefault();
   LOG.dup++;
   msg('#ed31 .msg', '#' + +v + ' IS TAKEN BY ' + nameOf(q, st.W) + ' - PICK ANOTHER NUMBER');
  } catch (e) {
   err(e, 'ed');
  }
 }
 document.addEventListener('click', edCheck, true);
 document.addEventListener('keydown', edCheck, true);
 function liveNo(pid, no) {
  var dp = DEF.players[pid];
  if (!dp) return;
  if (!validNo(no)) no = dp.no;
  var p = PPs(pid);
  try {
   if (p && (p.world || p.col25 || p.gho16)) p.wnum = no; else if (p) {
    var k = p.team + '|' + (p.n0 != null ? p.n0 : p.n), R = window.RL_DATA && RL_DATA.nums || {};
    if (no != null) R[k] = no; else delete R[k];
   }
   if (p && (p.world || p.col25)) {
    var rows = [].concat(window.RL_DATA && RL_DATA.world || [], window.RL_COL25 || []);
    for (var i = 0; i < rows.length; i++) if (rows[i].id === dp.tid) {
     var row = rows[i].players && rows[i].players[+String(pid).slice(dp.tid.length + 1)];
     if (row) row[13] = no;
     break;
    }
   }
  } catch (e) {
   err(e, 'store');
  }
  try {
   NUM15 = null;
  } catch (e) {}
  try {
   SNUM15 = {
    key: null,
    S: null,
    map: null
   };
  } catch (e) {}
  try {
   if (typeof game !== 'undefined' && game) game.side15 = null;
  } catch (e) {}
  try {
   if (typeof SZ_REG !== 'undefined' && SZ_REG[dp.tid] && SZ_REG[dp.tid].nums && SZ_REG[dp.tid].nums[pid] != null && no != null) SZ_REG[dp.tid].nums[pid] = no;
  } catch (e) {}
  try {
   if (window.panelDirty) panelDirty();
  } catch (e) {}
  LOG.live++;
 }
 var OP0 = E.openPlayer;
 E.openPlayer = function(pid) {
  var r = OP0.apply(this, arguments);
  try {
   if (r && DEF.players[pid]) addNum(pid);
  } catch (e) {
   err(e, 'open');
  }
  return r;
 };
 function css() {
  if (document.getElementById('ed401css')) return;
  var s = document.createElement('style');
  s.id = 'ed401css';
  s.textContent = '#ed32One .n401{width:34px;flex:0 0 34px;text-align:center}#ed32One .h401{color:#8fe3f0;align-self:center;margin-right:-4px}';
  document.head.appendChild(s);
 }
 function addNum(pid) {
  var box = document.getElementById('ed32One');
  if (!box || document.getElementById('ed401Num')) return;
  css();
  var st = E.state(), W = st.W, cur = nowNo(pid, W);
  var nameIn = document.getElementById('ed32Name');
  var h = document.createElement('span');
  h.className = 'h401';
  h.textContent = '#';
  var nu = document.createElement('input');
  nu.id = 'ed401Num';
  nu.className = 'nm n401';
  nu.setAttribute('maxlength', '2');
  nu.setAttribute('inputmode', 'numeric');
  nu.setAttribute('pattern', '[0-9]*');
  nu.setAttribute('aria-label', 'number');
  nu.setAttribute('autocomplete', 'off');
  nu.value = cur == null ? '' : String(cur);
  nu.style.cssText = 'flex:0 0 46px;width:46px;min-width:0;max-width:46px;text-align:center;padding-left:2px;padding-right:2px';
  nu.addEventListener('input', function() {
   nu.value = nu.value.replace(/\D/g, '').slice(0, 2);
  });
  box.insertBefore(nu, nameIn);
  box.insertBefore(h, nu);
  var dflt = DEF.players[pid].no != null ? DEF.players[pid].no : null;
  var tt = document.querySelector('#ed31 .hd .tt');
  if (tt && tt.textContent === 'RENAME PLAYER') tt.textContent = 'NAME + NUMBER';
  var stl = document.querySelector('#ed31 .hd .st');
  if (stl && dflt != null && stl.textContent.indexOf(' #') < 0) stl.textContent = stl.textContent + ' #' + dflt;
  var btns = box.querySelectorAll('button'), save = null, reset = null;
  for (var i = 0; i < btns.length; i++) {
   var a = btns[i].getAttribute('aria-label');
   if (a === 'SAVE NAME') save = btns[i];
   if (a === 'RESET NAME') reset = btns[i];
  }
  function before(ev, isReset) {
   var Wn = E.state().W;
   Wn.p = Wn.p || {};
   var v = isReset ? '' : String(nu.value || '').trim();
   if (v !== '' && !validNo(v)) {
    ev.stopImmediatePropagation();
    ev.preventDefault();
    msg('#ed31 .msg', 'NUMBER = 0 TO 99, DIGITS ONLY');
    return;
   }
   if (v !== '') {
    var q = taken(pid, v, Wn);
    if (q) {
     ev.stopImmediatePropagation();
     ev.preventDefault();
     LOG.dup++;
     msg('#ed31 .msg', '#' + +v + ' IS TAKEN BY ' + nameOf(q, Wn) + ' - PICK ANOTHER NUMBER');
     return;
    }
   }
   var e = Wn.p[pid] && typeof Wn.p[pid] === 'object' ? Wn.p[pid] : {};
   if (v === '' || dflt != null && +v === dflt) delete e.no; else e.no = +v;
   if (e.no != null || e.n) Wn.p[pid] = e; else if (Wn.p[pid]) {
    Wn.p[pid] = e;
   }
   var no = e.no != null ? e.no : null;
   setTimeout(function() {
    try {
     var o = JSON.parse(localStorage.getItem(KEY) || 'null');
     if (o && o.p) {
      var en = o.p[pid];
      if (no == null && en) {
       delete en.no;
       if (!en.n) delete o.p[pid];
      }
      localStorage.setItem(KEY, JSON.stringify(o));
     }
     if (N.ED && N.ED.p) {
      if (o && o.p && o.p[pid]) N.ED.p[pid] = o.p[pid]; else delete N.ED.p[pid];
     }
     liveNo(pid, no);
     LOG.saved++;
    } catch (x) {
     err(x, 'after');
    }
   }, 0);
  }
  box.addEventListener('click', function(ev) {
   var b = ev.target && ev.target.closest && ev.target.closest('button');
   if (!b) return;
   if (b === save) before(ev, false); else if (b === reset) {
    nu.value = dflt == null ? '' : String(dflt);
    before(ev, true);
   }
  }, true);
  box.addEventListener('keydown', function(ev) {
   if (ev.key !== 'Enter') return;
   if (ev.target === nu) {
    ev.preventDefault();
    if (save) save.click();
   } else if (ev.target === nameIn) before(ev, false);
  }, true);
 }
 window.V401ED = {
  on: true,
  LOG: LOG,
  taken: function(pid, no) {
   return taken(pid, no, E.state().W);
  },
  nowNo: function(pid) {
   return nowNo(pid, E.state().W);
  }
 };
})();
