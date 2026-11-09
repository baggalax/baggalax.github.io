(function() {
 'use strict';
 var SN = window.N31;
 if (!SN || !SN.on) return;
 try {
  SN.college();
 } catch (e) {
  console.error(e);
 }
 var DEF = SN.DEF, KEY = SN.KEY, LGDEF = SN.LGDEF;
 SN.ready();
 (function() {
  var sub = SN.sub;
  if (typeof window.fold2318 === 'function') {
   var f0 = window.fold2318;
   window.fold2318 = function(s) {
    return sub(f0.apply(this, arguments));
   };
  }
  if (typeof window.textW === 'function') {
   var w0 = window.textW;
   window.textW = function(s, sc) {
    return w0.call(this, sub(String(s)), sc);
   };
  }
  var busy = false;
  function walk(n) {
   if (!n) return;
   if (n.nodeType === 3) {
    var v = n.nodeValue, w = sub(v);
    if (w !== v) n.nodeValue = w;
    return;
   }
   if (n.nodeType !== 1 || n.id === 'ed31' || n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'TEXTAREA' || n.tagName === 'INPUT') return;
   for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  function inEd(n) {
   for (var x = n; x; x = x.parentNode) if (x.id === 'ed31') return true;
   return false;
  }
  function start() {
   var mo = new MutationObserver(function(ms) {
    if (busy) return;
    busy = true;
    try {
     ms.forEach(function(m) {
      if (inEd(m.target)) return;
      if (m.type === 'characterData') walk(m.target); else m.addedNodes.forEach(walk);
     });
    } finally {
     busy = false;
    }
   });
   mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
   });
   walk(document.body);
   try {
    if (document.title) {
     var tt = sub(document.title);
     if (tt !== document.title) document.title = tt;
    }
   } catch (e) {}
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
 })();
 var BAD = [ 'fuck', 'fuk', 'fck', 'phuck', 'shit', 'sh1t', 'bitch', 'biatch', 'cunt', 'cock', 'dick', 'dik', 'pussy', 'puss', 'asshole', 'arsehole', 'bastard', 'slut', 'whore', 'hoe', 'fag', 'faggot', 'nigger', 'nigga', 'niga', 'nig', 'retard', 'rape', 'rapist', 'porn', 'penis', 'vagina', 'boob', 'tits', 'titty', 'cum', 'jizz', 'dildo', 'anal', 'anus', 'horny', 'sex', 'sexy', 'nazi', 'hitler', 'kkk', 'isis', 'molest', 'pedo', 'pedophile', 'wank', 'twat', 'prick', 'douche', 'spic', 'chink', 'kike', 'gook', 'wetback', 'tranny', 'dyke', 'queer', 'homo', 'lesbo', 'skank', 'thot', 'milf', 'blowjob', 'handjob', 'boner', 'erection', 'orgasm', 'cocaine', 'heroin', 'meth', 'killyourself', 'kys', 'terrorist', 'jihad', 'buttplug', 'arse', 'bollocks', 'fux', 'fuxk', 'ballsack', 'scrotum', 'testicle', 'semen', 'clit', 'labia', 'queef', 'rimjob', 'shlong', 'schlong', 'sodomy', 'incest', 'bestiality', 'genocide' ];
 var SUBSTR = [ 'fuck', 'fvck', 'phuck', 'cunt', 'nigg', 'whore', 'slut', 'porn', 'dildo', 'blowjob', 'handjob', 'jizz', 'rapist', 'molest', 'hitler', 'nazi', 'kkk', 'twat', 'wank', 'faggot', 'killyourself', 'asshole', 'pussy', 'bitch', 'motherf' ];
 BAD = BAD.concat([ 'shit', 'shits', 'shitty', 'shithead', 'shitface', 'bullshit', 'dick', 'dicks', 'dickhead', 'cock', 'cocks', 'pedo', 'pedos', 'tits', 'boner', 'cum', 'cums', 'rape', 'raped', 'fag', 'fags', 'penis', 'vagina', 'semen', 'sex' ]);
 function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[0@]/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[4]/g, 'a').replace(/[5$]/g, 's').replace(/7/g, 't').replace(/8/g, 'b');
 }
 function badWord(w) {
  if (!w) return false;
  var s3 = w.replace(/(.)\1{2,}/g, '$1');
  if (BAD.indexOf(w) >= 0 || BAD.indexOf(s3) >= 0) return true;
  return SUBSTR.some(function(x) {
   return w.indexOf(x) >= 0 || s3.indexOf(x) >= 0;
  });
 }
 function nameProblem(raw) {
  var s = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim();
  if (!s) return 'TYPE A NAME FIRST';
  if (s.length > 24) return 'MAX 24 CHARACTERS';
  if (!/^[A-Za-z0-9\u00C0-\u024F .,'\u2019&!-]+$/.test(s)) return "LETTERS, NUMBERS, SPACE AND . , ' - & ! ONLY";
  var words = norm(s).split(/[^a-z]+/).filter(Boolean);
  if (words.some(badWord)) return 'THAT NAME IS NOT ALLOWED';
  var run = '', runs = [];
  words.forEach(function(w) {
   if (w.length === 1) run += w; else {
    if (run.length > 1) runs.push(run);
    run = '';
   }
  });
  if (run.length > 1) runs.push(run);
  if (runs.some(badWord)) return 'THAT NAME IS NOT ALLOWED';
  return null;
 }
 function numProblem(v) {
  var s = String(v == null ? '' : v).trim();
  if (!s) return null;
  if (!/^\d{1,2}$/.test(s)) return 'NUMBER = 0 TO 99, DIGITS ONLY';
  return null;
 }
 function clean(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
 }
 function save(ed) {
  localStorage.setItem(KEY, JSON.stringify(ed));
 }
 var W = SN.load(), changed = false;
 function teamName(tid) {
  return W.t[tid] || DEF.teams[tid].name;
 }
 function coachName(tid) {
  return W.c && W.c[tid] || DEF.teams[tid].coach || '';
 }
 function plName(pid) {
  var e = W.p[pid];
  return e && e.n || DEF.players[pid].n;
 }
 function plNum(pid) {
  var e = W.p[pid];
  if (e && e.no != null && e.no !== '') return +e.no;
  var d = DEF.players[pid].no;
  if (d != null) return d;
  try {
   var p = PP(pid);
   var v = window.jerseyNo(p, 'real', DEF.players[pid].tid);
   return v === '' ? null : v;
  } catch (e2) {
   return null;
  }
 }
 function commit() {
  save(W);
  changed = true;
 }
 var LGK = [ 'RLL', 'TLL', 'COLLEGE', 'WORLD' ];
 function lgProblem(f, a) {
  if (f) {
   var p = nameProblem(f);
   if (p) return p;
  }
  if (a) {
   if (!/^[A-Za-z0-9]{2,5}$/.test(a)) return 'SHORT NAME = 2 TO 5 LETTERS / NUMBERS';
   if (nameProblem(a)) return 'THAT NAME IS NOT ALLOWED';
  }
  return null;
 }
 function exportObj() {
  return {
   format: 'retrolax-sim-names',
   v: 1,
   l: W.l || {},
   t: W.t,
   p: W.p,
   c: W.c || {},
   g: W.g || {}
  };
 }
 function toCode(o) {
  var s = JSON.stringify(o);
  return 'RLSIM1:' + btoa(unescape(encodeURIComponent(s)));
 }
 function parseAny(text) {
  var s = String(text || '').trim();
  if (!s) throw new Error('NOTHING TO IMPORT');
  if (/^RLSIM1:/i.test(s)) {
   try {
    s = decodeURIComponent(escape(atob(s.slice(7).replace(/\s+/g, ''))));
   } catch (e) {
    throw new Error('THAT CODE IS NOT VALID');
   }
  }
  var o;
  try {
   o = JSON.parse(s);
  } catch (e) {
   throw new Error('NOT A NAMES FILE OR CODE');
  }
  if (!o || typeof o !== 'object' || o.format && o.format !== 'retrolax-sim-names') throw new Error('NOT A NAMES FILE OR CODE');
  return o;
 }
 function validate(o) {
  var ed = {
   t: {},
   p: {},
   c: {},
   l: {},
   g: {}
  }, errs = [], n = {
   t: 0,
   p: 0,
   c: 0,
   no: 0,
   l: 0,
   g: 0
  };
  var ts = o.t || {}, ps = o.p || {}, cs = o.c || {}, ls = o.l || {}, gs = o.g || {};
  if (typeof gs !== 'object' || Array.isArray(gs)) errs.push('BAD LEGACY NAMES'); else Object.keys(gs).forEach(function(id) {
   var LD = DEF.legacy || {};
   if (!LD[id]) return errs.push('NO LEGACY PLAYER ' + id);
   var v = clean(gs[id]);
   if (!v) return;
   var pr = nameProblem(v);
   if (pr) return errs.push(id + ': ' + pr);
   if (v !== LD[id]) {
    ed.g[id] = v;
    n.g++;
   }
  });
  if (typeof ls === 'object') Object.keys(ls).forEach(function(k) {
   if (!LGDEF[k]) return errs.push('NO LEAGUE ' + k);
   var e = ls[k] || {}, f = clean(e.f), a = clean(e.a), pr = lgProblem(f, a);
   if (pr) return errs.push(k + ': ' + pr);
   var out = {};
   if (f && f.toUpperCase() !== LGDEF[k].f) out.f = f.toUpperCase();
   if (a && a.toUpperCase() !== LGDEF[k].a) out.a = a.toUpperCase();
   if (out.f || out.a) {
    ed.l[k] = out;
    n.l++;
   }
  });
  if (typeof ts !== 'object' || typeof ps !== 'object' || typeof cs !== 'object') {
   errs.push('BAD FILE SHAPE');
   return {
    ed: ed,
    errs: errs,
    n: n
   };
  }
  Object.keys(ts).forEach(function(id) {
   if (!DEF.teams[id]) return errs.push('NO TEAM ' + id);
   var v = clean(ts[id]), pr = nameProblem(v);
   if (pr) return errs.push(id + ': ' + pr);
   if (v !== DEF.teams[id].name) {
    ed.t[id] = v;
    n.t++;
   }
  });
  Object.keys(cs).forEach(function(id) {
   if (!DEF.teams[id]) return errs.push('NO TEAM ' + id);
   var v = clean(cs[id]), pr = nameProblem(v);
   if (pr) return errs.push(id + ' COACH: ' + pr);
   if (v !== DEF.teams[id].coach) {
    ed.c[id] = v;
    n.c++;
   }
  });
  Object.keys(ps).forEach(function(id) {
   if (!DEF.players[id]) return errs.push('NO PLAYER ' + id);
   var e = ps[id] || {}, out = {};
   if (typeof e === 'string') e = {
    n: e
   };
   if (e.n != null && clean(e.n) !== '') {
    var v = clean(e.n), pr = nameProblem(v);
    if (pr) return errs.push(id + ': ' + pr);
    if (v !== DEF.players[id].n) out.n = v;
   }
   if (e.no != null && String(e.no).trim() !== '') {
    var q = numProblem(e.no);
    if (q) return errs.push(id + ': ' + q);
    out.no = +String(e.no).trim();
   }
   if (out.n || out.no != null) {
    ed.p[id] = out;
    if (out.n) n.p++;
    if (out.no != null) n.no++;
   }
  });
  return {
   ed: ed,
   errs: errs,
   n: n
  };
 }
 window.ED31_nameProblem = nameProblem;
 window.ED31_validate = function(txt) {
  return validate(parseAny(txt));
 };
 var css = document.createElement('style');
 css.textContent = '#ed31{display:none;position:absolute;inset:0;z-index:6;pointer-events:auto;flex-direction:column;background:rgba(8,14,20,.97);color:#e8f4f6;font:bold 11px/1.25 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.3px;text-transform:uppercase;padding:6px 8px;box-sizing:border-box;gap:5px;touch-action:manipulation;-webkit-user-select:none;user-select:none}' + '#ed31.open{display:flex}#ed31 .hd{display:flex;align-items:center;gap:6px;flex:0 0 auto}#ed31 .hd img{width:26px;height:30px;image-rendering:pixelated;flex:0 0 auto}#ed31 .tt{font-size:14px;color:#fff;line-height:1.1}#ed31 .st{font-size:10px;color:#8fe3f0}#ed31 .sp{flex:1}' + '#ed31 .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;flex:0 0 auto}#ed31 .scroll{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;border:1px solid #22313d;background:rgba(0,0,0,.25);padding:4px;box-sizing:border-box}' + '#ed31 button{font:inherit;text-transform:uppercase;border:0;border-radius:3px;padding:6px 9px;background:#2cc4dc;color:#0b1a20;box-shadow:0 2px 0 #000;-webkit-appearance:none;appearance:none;cursor:pointer;min-height:28px;touch-action:manipulation}' + '#ed31 button.g{background:#c9d6d9}#ed31 button.y{background:#ffd23a}#ed31 button.r{background:#ff8a7a}#ed31 button.d{background:#22313d;color:#cfe}#ed31 button.on{background:#ffe14d}#ed31 button.p{background:#ff5ad2}' + '#ed31 .grid{display:flex;flex-wrap:wrap;gap:5px;align-content:flex-start}#ed31 .tm{display:flex;align-items:center;gap:5px;width:calc(25% - 4px);min-width:120px;box-sizing:border-box;background:#22313d;color:#e8f4f6;text-align:left;padding:4px 6px}#ed31 .tm img{width:18px;height:21px;image-rendering:pixelated;flex:0 0 auto}#ed31 .tm span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' + '#ed31 .ed{color:#ffe14d}#ed31 .pl{display:flex;width:100%;gap:8px;align-items:center;background:transparent;color:#e8f4f6;box-shadow:none;border-bottom:1px solid #1a2630;border-radius:0;text-align:left;min-height:26px;padding:3px 4px}#ed31 .pl .no{width:28px;color:#8fe3f0}#ed31 .pl .ps{width:30px;color:#9fb}#ed31 .pl .nm{flex:1}#ed31 .pl .ov{color:#8fe3f0}' + '#ed31 input,#ed31 textarea{font:inherit;text-transform:none;background:#0b1a20;color:#fff;border:1px solid #2cc4dc;border-radius:3px;padding:5px 6px;min-height:26px;box-sizing:border-box;-webkit-user-select:text;user-select:text}#ed31 input.nm{width:190px}#ed31 input.num{width:44px}#ed31 textarea{width:100%;flex:1 1 auto;min-height:60px;resize:none}' + '#ed31 .msg{min-height:13px;color:#ff9a8a;flex:0 0 auto}#ed31 .msg.ok{color:#7dff7a}#ed31 .ef{display:flex;gap:5px;align-items:center;flex-wrap:wrap;padding:4px;background:#13212b;border:1px solid #2cc4dc;margin:2px 0}';
 document.head.appendChild(css);
 var root = null, view = {
  s: 'list',
  grp: 'RLL',
  tid: null,
  edit: null
 }, msgEl = null;
 function el(tag, cls, kids, attrs) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  (kids || []).forEach(function(k) {
   if (k == null) return;
   e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
  });
  if (attrs) Object.keys(attrs).forEach(function(a) {
   e.setAttribute(a, attrs[a]);
  });
  return e;
 }
 function bt(label, cls, fn, aria) {
  var b = el('button', cls || '', [ label ], {
   type: 'button',
   'aria-label': aria || label
  });
  b.addEventListener('click', function(ev) {
   ev.stopPropagation();
   fn(ev);
  });
  return b;
 }
 function say(s, ok) {
  if (msgEl) {
   msgEl.textContent = s || '';
   msgEl.className = 'msg' + (ok ? ' ok' : '');
  }
 }
 function badgeSrc(tid) {
  try {
   var t = T(tid);
   return window.badgeUrl ? badgeUrl(t) : '';
  } catch (e) {
   return '';
  }
 }
 function previewBadge(tid) {
  try {
   var t = Object.assign({}, T(tid)), nm = teamName(tid), d = DEF.teams[tid];
   t.id = 'SIMPREV-' + tid + '-' + nm;
   t.abbr = SN.abbrOf(nm, d.name, d.abbr);
   t.icon = SN.glyph(nm);
   return badgeUrl(t);
  } catch (e) {
   return badgeSrc(tid);
  }
 }
 function ensure() {
  if (root) return root;
  root = el('div', '', [], {
   id: 'ed31',
   role: 'dialog',
   'aria-label': 'EDIT NAMES'
  });
  [ 'keydown', 'keyup', 'keypress' ].forEach(function(k) {
   root.addEventListener(k, function(e) {
    e.stopPropagation();
   });
  });
  [ 'touchstart', 'touchmove', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click' ].forEach(function(k) {
   root.addEventListener(k, function(e) {
    e.stopPropagation();
   }, false);
  });
  (document.getElementById('stage') || document.body).appendChild(root);
  return root;
 }
 var GRPS = [ [ 'RLL', 'RLL' ], [ 'TLL', 'TLL' ], [ 'COLLEGE', 'COLLEGE' ], [ 'WORLD', 'WORLD' ] ];
 function lgName(k) {
  var e = (W.l || {})[k] || {};
  return {
   f: e.f || LGDEF[k].f,
   a: e.a || LGDEF[k].a,
   ef: !!e.f,
   ea: !!e.a
  };
 }
 function idsOf(grp) {
  return DEF.order.filter(function(id) {
   return DEF.teams[id].grp === grp;
  });
 }
 function render() {
  var r = ensure();
  r.innerHTML = '';
  if (view.s === 'one') return renderOne(r);
  if (view.s === 'list') renderList(r); else if (view.s === 'team') renderTeam(r); else if (view.s === 'export') renderExport(r); else if (view.s === 'import') renderImport(r); else if (view.s === 'confirm') renderConfirm(r);
 }
 function renderList(r) {
  r.appendChild(el('div', 'hd', [ el('div', '', [ el('div', 'tt', [ 'EDIT NAMES' ]), el('div', 'st', [ 'TAP A TEAM TO RENAME IT, ITS COACH AND PLAYERS' ]) ]), el('span', 'sp'), bt('EXPORT', 'y', function() {
   view.s = 'export';
   render();
  }), bt('IMPORT', 'y', function() {
   view.s = 'import';
   view.imp = null;
   render();
  }), bt('RESET ALL', 'r', function() {
   confirmBox('RESET ALL?', 'EVERY TEAM, COACH, PLAYER NAME AND NUMBER GOES BACK TO THE DEFAULT. CARDS SHOW THE NEW NAMES.', 'RESET ALL', function() {
    W = {
     t: {},
     p: {},
     c: {},
     l: {},
     g: {}
    };
    commit();
    view.s = 'list';
    render();
    say('EVERYTHING IS BACK TO THE DEFAULTS', true);
   });
  }), bt('DONE', 'g', close) ]));
  var tabs = el('div', 'row');
  tabs.appendChild(bt('LEAGUES', view.grp === 'LEAGUES' ? 'on' : 'd', function() {
   view.grp = 'LEAGUES';
   render();
  }, 'LEAGUES'));
  GRPS.forEach(function(g) {
   tabs.appendChild(bt(lgName(g[0]).a + ' (' + idsOf(g[0]).length + ')', view.grp === g[0] ? 'on' : 'd', function() {
    view.grp = g[0];
    render();
   }, g[1]));
  });
  tabs.appendChild(bt((window.__rl_no32na ? 'LEGACY (' : 'N/A (') + (DEF.legOrder || []).length + ')', view.grp === 'LEGACY' ? 'on' : 'd', function() {
   view.grp = 'LEGACY';
   view.edit = null;
   render();
  }, window.__rl_no32na ? 'LEGACY' : 'N/A'));
  r.appendChild(tabs);
  if (view.grp === 'LEAGUES') {
   renderLeagues(r);
   return;
  }
  if (view.grp === 'LEGACY') {
   renderLegacy(r);
   return;
  }
  var grid = el('div', 'scroll grid', [], {
   id: 'ed31Grid'
  });
  idsOf(view.grp).forEach(function(id) {
   var edited = !!W.t[id] || Object.keys(W.p).some(function(k) {
    return DEF.players[k] && DEF.players[k].tid === id;
   }) || !!(W.c && W.c[id]);
   var b = bt('', 'tm', function() {
    view.s = 'team';
    view.tid = id;
    view.edit = null;
    render();
   }, 'TEAM ' + id);
   b.appendChild(el('img', '', [], {
    alt: '',
    src: previewBadge(id)
   }));
   b.appendChild(el('span', edited ? 'ed' : '', [ teamName(id).toUpperCase() ]));
   b.setAttribute('data-tid', id);
   grid.appendChild(b);
  });
  r.appendChild(grid);
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
 }
 function renderLeagues(r) {
  var box = el('div', 'scroll', [], {
   id: 'ed31Leagues'
  });
  LGK.forEach(function(k) {
   var cur = lgName(k), d = LGDEF[k], f = el('div', 'ef');
   var fi = el('input', 'nm', [], {
    id: 'ed31LgF-' + k,
    maxlength: '24',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    'aria-label': k + ' full name'
   });
   fi.value = cur.f;
   var ai = el('input', 'num', [], {
    id: 'ed31LgA-' + k,
    maxlength: '4',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    'aria-label': k + ' short name',
    style: 'width:58px'
   });
   ai.value = cur.a;
   var go = function() {
    var fv = clean(fi.value).toUpperCase(), av = clean(ai.value).toUpperCase();
    var pr = lgProblem(fv, av);
    if (pr) return say(pr);
    W.l = W.l || {};
    var o = {};
    if (fv && fv !== d.f) o.f = fv;
    if (av && av !== d.a) o.a = av;
    if (o.f || o.a) W.l[k] = o; else delete W.l[k];
    commit();
    render();
    say('SAVED - SHOWS EVERYWHERE AFTER DONE', true);
   };
   [ fi, ai ].forEach(function(x) {
    x.addEventListener('keydown', function(e) {
     if (e.key === 'Enter') go();
    });
   });
   f.appendChild(el('span', 'st', [ d.a + ' (DEFAULT ' + d.f + ')' ]));
   f.appendChild(el('span', 'sp'));
   var row2 = el('div', 'row', [ el('span', 'st', [ 'NAME' ]), fi, el('span', 'st', [ 'SHORT' ]), ai, bt('SAVE', '', go, 'SAVE LEAGUE ' + k), bt('RESET', 'g', function() {
    if (W.l) delete W.l[k];
    commit();
    render();
    say(k + ' BACK TO ' + d.f, true);
   }, 'RESET LEAGUE ' + k) ]);
   f.appendChild(row2);
   box.appendChild(f);
  });
  r.appendChild(box);
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
 }
 function legName(id) {
  return W.g && W.g[id] || DEF.legacy[id];
 }
 function renderLegacy(r) {
  var list = el('div', 'scroll', [], {
   id: 'ed31Legacy'
  });
  var sec32 = '';
  (DEF.legOrder || []).forEach(function(id) {
   var p = typeof PP === 'function' && PP(id) || {}, d = DEF.legacy[id];
   if (!window.__rl_no32na) {
    var s32 = /^LEG-/.test(id) ? 'LEGACY' : typeof GH_REG !== 'undefined' && GH_REG.GHO && GH_REG.GHO.name || 'NEW ORLEANS GHOSTS';
    if (s32 !== sec32) {
     sec32 = s32;
     list.appendChild(el('div', 'st', [ s32 ], {
      'data-sec32': s32,
      style: 'padding:6px 4px 2px;color:#ffe14d'
     }));
    }
   }
   if (view.edit === id) {
    list.appendChild(editRow((p.pos || '') + ' (DEFAULT ' + d.toUpperCase() + ')', legName(id), null, function(nm) {
     W.g = W.g || {};
     if (!nm || nm === d) delete W.g[id]; else {
      var pr = nameProblem(nm);
      if (pr) return say(pr);
      W.g[id] = nm;
     }
     commit();
     view.edit = null;
     render();
     say('SAVED - SHOWS EVERYWHERE AFTER DONE', true);
    }, function() {
     if (W.g) delete W.g[id];
     commit();
     view.edit = null;
     render();
     say('LEGACY NAME RESET', true);
    }));
    return;
   }
   var b = bt('', 'pl', function() {
    view.edit = id;
    render();
   }, 'EDIT LEGACY ' + id);
   b.setAttribute('data-leg', id);
   b.appendChild(el('span', 'no', [ /^LEG-/.test(id) ? 'LEG' : 'GHO' ]));
   b.appendChild(el('span', 'ps', [ p.pos || '' ]));
   b.appendChild(el('span', 'nm' + (W.g && W.g[id] ? ' ed' : ''), [ legName(id).toUpperCase() ]));
   b.appendChild(el('span', 'ov', [ 'OVR ' + (p.ovr || '') ]));
   list.appendChild(b);
  });
  r.appendChild(list);
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
 }
 function renderTeam(r) {
  var tid = view.tid, d = DEF.teams[tid], t = T(tid);
  var inp = el('input', 'nm', [], {
   id: 'ed31Team',
   maxlength: '24',
   autocomplete: 'off',
   autocorrect: 'off',
   spellcheck: 'false',
   'aria-label': 'team name',
   enterkeyhint: 'done'
  });
  inp.value = teamName(tid);
  function saveTeam() {
   var v = clean(inp.value);
   if (!v || v === d.name) {
    delete W.t[tid];
    commit();
    render();
    say(v ? 'SAVED' : 'TEAM NAME RESET TO ' + d.name.toUpperCase(), true);
    return;
   }
   var pr = nameProblem(v);
   if (pr) return say(pr);
   W.t[tid] = v;
   commit();
   render();
   say('SAVED', true);
  }
  inp.addEventListener('keydown', function(e) {
   if (e.key === 'Enter') saveTeam();
  });
  r.appendChild(el('div', 'hd', [ el('img', '', [], {
   alt: '',
   src: previewBadge(tid)
  }), inp, bt('SAVE', '', saveTeam, 'SAVE TEAM'), bt('RESET', 'g', function() {
   delete W.t[tid];
   commit();
   render();
   say('TEAM NAME RESET TO ' + d.name.toUpperCase(), true);
  }, 'RESET TEAM'), el('span', 'sp'), bt('BACK', 'g', function() {
   view.s = 'list';
   render();
  }) ]));
  var list = el('div', 'scroll', [], {
   id: 'ed31Roster'
  });
  if (view.edit === 'coach') list.appendChild(editRow('HEAD COACH', coachName(tid), null, function(nm) {
   if (!nm || nm === d.coach) {
    delete W.c[tid];
   } else {
    var pr = nameProblem(nm);
    if (pr) return say(pr);
    W.c[tid] = nm;
   }
   commit();
   view.edit = null;
   render();
   say('SAVED', true);
  }, function() {
   delete W.c[tid];
   commit();
   view.edit = null;
   render();
   say('COACH RESET', true);
  })); else {
   var cb = bt('', 'pl', function() {
    view.edit = 'coach';
    render();
   }, 'EDIT COACH');
   cb.appendChild(el('span', 'no', [ 'HC' ]));
   cb.appendChild(el('span', 'ps', [ '' ]));
   cb.appendChild(el('span', 'nm' + (W.c && W.c[tid] ? ' ed' : ''), [ 'HEAD COACH: ' + coachName(tid) ]));
   list.appendChild(cb);
  }
  (t.roster || []).forEach(function(pid) {
   if (!DEF.players[pid]) return;
   var p = PP(pid) || {}, e = W.p[pid];
   if (view.edit === pid) {
    list.appendChild(editRow(p.pos || '', plName(pid), plNum(pid), function(nm, no) {
     var out = {};
     if (nm && nm !== DEF.players[pid].n) {
      var pr = nameProblem(nm);
      if (pr) return say(pr);
      out.n = nm;
     }
     var q = numProblem(no);
     if (q) return say(q);
     if (String(no).trim() !== '') out.no = +String(no).trim();
     if (out.n || out.no != null) W.p[pid] = out; else delete W.p[pid];
     commit();
     view.edit = null;
     render();
     say('SAVED', true);
    }, function() {
     delete W.p[pid];
     commit();
     view.edit = null;
     render();
     say('PLAYER RESET', true);
    }, pid));
    return;
   }
   var b = bt('', 'pl', function() {
    view.edit = pid;
    render();
   }, 'EDIT PLAYER ' + pid);
   b.setAttribute('data-pid', pid);
   var no = plNum(pid);
   b.appendChild(el('span', 'no' + (e && e.no != null ? ' ed' : ''), [ '#' + (no == null ? '--' : no) ]));
   b.appendChild(el('span', 'ps', [ p.pos || '' ]));
   b.appendChild(el('span', 'nm' + (e && e.n ? ' ed' : ''), [ plName(pid).toUpperCase() ]));
   b.appendChild(el('span', 'ov', [ 'OVR ' + (p.ovr || '') ]));
   list.appendChild(b);
  });
  r.appendChild(list);
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
 }
 function editRow(label, nm, no, onSave, onReset, pid) {
  var f = el('div', 'ef', [], {
   id: 'ed31Edit'
  });
  var ni = el('input', 'nm', [], {
   id: 'ed31Name',
   maxlength: '24',
   autocomplete: 'off',
   autocorrect: 'off',
   spellcheck: 'false',
   'aria-label': 'name',
   enterkeyhint: 'done'
  });
  ni.value = nm || '';
  var nu = null;
  f.appendChild(el('span', 'st', [ label ]));
  if (no !== null || pid) {
   nu = el('input', 'num', [], {
    id: 'ed31Num',
    maxlength: '2',
    inputmode: 'numeric',
    pattern: '[0-9]*',
    'aria-label': 'number',
    autocomplete: 'off'
   });
   nu.value = no == null ? '' : String(no);
   f.appendChild(el('span', 'st', [ '#' ]));
   f.appendChild(nu);
  }
  f.appendChild(ni);
  var go = function() {
   onSave(clean(ni.value), nu ? nu.value : '');
  };
  [ ni, nu ].forEach(function(x) {
   if (x) x.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') go();
   });
  });
  if (nu) nu.addEventListener('input', function() {
   nu.value = nu.value.replace(/\D/g, '').slice(0, 2);
  });
  f.appendChild(bt('SAVE', '', go, 'SAVE PLAYER'));
  f.appendChild(bt('RESET', 'g', onReset, 'RESET PLAYER'));
  f.appendChild(bt('CANCEL', 'd', function() {
   view.edit = null;
   render();
  }));
  setTimeout(function() {
   try {
    ni.focus({
     preventScroll: true
    });
   } catch (e) {}
  }, 30);
  return f;
 }
 function confirmBox(title, txt, yes, fn) {
  view.prev = view.s;
  view.s = 'confirm';
  view.cf = {
   title: title,
   txt: txt,
   yes: yes,
   fn: fn
  };
  render();
 }
 function renderConfirm(r) {
  var c = view.cf;
  r.appendChild(el('div', 'hd', [ el('div', '', [ el('div', 'tt', [ c.title ]), el('div', 'st', [ c.txt ]) ]) ]));
  r.appendChild(el('div', 'row', [ bt(c.yes, 'r', function() {
   c.fn();
  }, 'CONFIRM ' + c.yes), bt('CANCEL', 'g', function() {
   view.s = view.prev || 'list';
   render();
  }, 'CANCEL CONFIRM') ]));
  r.appendChild(el('div', 'sp'));
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
 }
 function renderExport(r) {
  var o = exportObj(), code = toCode(o), n = Object.keys(o.l).length + Object.keys(o.t).length + Object.keys(o.p).length + Object.keys(o.c).length + Object.keys(o.g).length;
  r.appendChild(el('div', 'hd', [ el('div', '', [ el('div', 'tt', [ 'EXPORT NAMES' ]), el('div', 'st', [ n + ' EDITS - SAVE THE FILE OR COPY THE CODE' ]) ]), el('span', 'sp'), bt('BACK', 'g', function() {
   view.s = 'list';
   render();
  }) ]));
  var ta = el('textarea', '', [], {
   id: 'ed31Code',
   readonly: 'readonly',
   'aria-label': 'export code'
  });
  ta.value = code;
  var row = el('div', 'row');
  row.appendChild(bt('DOWNLOAD FILE', 'y', function() {
   try {
    var blob = new Blob([ JSON.stringify(o, null, 1) ], {
     type: 'application/json'
    }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bagga-lax-names.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
     URL.revokeObjectURL(a.href);
     a.remove();
    }, 1500);
    say('FILE SAVED (bagga-lax-names.json)', true);
   } catch (e) {
    say('COULD NOT SAVE A FILE - COPY THE CODE INSTEAD');
   }
  }));
  row.appendChild(bt('COPY CODE', '', function() {
   var done = function() {
    say('CODE COPIED', true);
   }, fb = function() {
    try {
     ta.removeAttribute('readonly');
     ta.focus();
     ta.select();
     ta.setSelectionRange(0, ta.value.length);
     var ok = document.execCommand('copy');
     ta.setAttribute('readonly', 'readonly');
     ok ? done() : say('SELECT THE CODE AND COPY IT');
    } catch (e) {
     say('SELECT THE CODE AND COPY IT');
    }
   };
   try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, fb); else fb();
   } catch (e) {
    fb();
   }
  }));
  if (navigator.share) row.appendChild(bt('SHARE', 'g', function() {
   try {
    navigator.share({
     title: 'Bagga Lax names',
     text: code
    }).catch(function() {});
   } catch (e) {}
  }));
  r.appendChild(row);
  r.appendChild(ta);
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
 }
 function renderImport(r) {
  r.appendChild(el('div', 'hd', [ el('div', '', [ el('div', 'tt', [ 'IMPORT NAMES' ]), el('div', 'st', [ 'PICK A FILE OR PASTE A CODE - IT REPLACES ALL CURRENT EDITS' ]) ]), el('span', 'sp'), bt('BACK', 'g', function() {
   view.s = 'list';
   render();
  }) ]));
  var ta = el('textarea', '', [], {
   id: 'ed31Paste',
   placeholder: 'PASTE THE CODE OR FILE TEXT HERE',
   'aria-label': 'import code',
   autocomplete: 'off',
   autocorrect: 'off',
   spellcheck: 'false'
  });
  var fi = el('input', '', [], {
   type: 'file',
   accept: '.json,.txt,application/json,text/plain',
   id: 'ed31File',
   style: 'display:none'
  });
  var check = function(txt) {
   var res;
   try {
    res = validate(parseAny(txt));
   } catch (e) {
    return say(e.message || 'NOT A NAMES FILE OR CODE');
   }
   if (res.errs.length) return say(res.errs.length + ' PROBLEM' + (res.errs.length > 1 ? 'S' : '') + ': ' + res.errs.slice(0, 3).join(' / '));
   var n = res.n;
   confirmBox('IMPORT THESE NAMES?', (n.l ? n.l + ' LEAGUE NAMES, ' : '') + n.t + ' TEAM NAMES, ' + n.c + ' COACHES, ' + n.p + ' PLAYER NAMES, ' + (n.g ? n.g + (window.__rl_no32na ? ' LEGACY NAMES, ' : ' N/A NAMES, ') : '') + n.no + ' NUMBERS. YOUR CURRENT EDITS ARE REPLACED. CARDS SHOW THE NEW NAMES.', 'IMPORT', function() {
    W = res.ed;
    commit();
    view.s = 'list';
    render();
    say('IMPORTED - TAP DONE TO PLAY WITH THEM', true);
   });
   view.prev = 'import';
  };
  fi.addEventListener('change', function() {
   var f = fi.files && fi.files[0];
   if (!f) return;
   var rd = new FileReader;
   rd.onload = function() {
    ta.value = String(rd.result || '');
    check(ta.value);
   };
   rd.onerror = function() {
    say('COULD NOT READ THAT FILE');
   };
   rd.readAsText(f);
  });
  r.appendChild(el('div', 'row', [ bt('PICK FILE', 'y', function() {
   fi.click();
  }), bt('CHECK + IMPORT', '', function() {
   check(ta.value);
  }, 'CHECK IMPORT'), fi ]));
  r.appendChild(ta);
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
 }
 function canOne(pid) {
  return !window.__rl_no32pen && !!pid && (!!DEF.players[pid] || !!(DEF.legacy && DEF.legacy[pid]));
 }
 function oneDef(pid) {
  return DEF.players[pid] ? DEF.players[pid].n : DEF.legacy[pid];
 }
 function oneName(pid) {
  return DEF.players[pid] ? plName(pid) : legName(pid);
 }
 function live1(pid) {
  var v = oneName(pid);
  try {
   var p = PP(pid);
   if (p) p.n = v;
  } catch (e) {}
  if (SN.CUR) SN.CUR[pid] = v;
  if (SN.ED) {
   if (DEF.players[pid]) {
    if (W.p[pid]) SN.ED.p[pid] = W.p[pid]; else delete SN.ED.p[pid];
   } else {
    SN.ED.g = SN.ED.g || {};
    if (W.g && W.g[pid]) SN.ED.g[pid] = W.g[pid]; else delete SN.ED.g[pid];
   }
  }
  if (SN.ready) SN.ready();
  try {
   if (window.panelDirty) panelDirty();
  } catch (e) {}
 }
 function openOne(pid) {
  if (!canOne(pid)) return false;
  W = SN.load();
  changed = false;
  view = {
   s: 'one',
   pid: pid
  };
  ensure().classList.add('open');
  render();
  return true;
 }
 function renderOne(r) {
  var pid = view.pid, p = typeof PP === 'function' && PP(pid) || {}, isP = !!DEF.players[pid], d = oneDef(pid);
  var inp = el('input', 'nm', [], {
   id: 'ed32Name',
   maxlength: '24',
   autocomplete: 'off',
   autocorrect: 'off',
   spellcheck: 'false',
   'aria-label': 'player name',
   enterkeyhint: 'done'
  });
  inp.value = oneName(pid);
  function shut() {
   changed = false;
   close();
  }
  function saveIt() {
   var v = clean(inp.value);
   if (!v || v === d) {
    if (isP) {
     var e = W.p[pid];
     if (e) {
      delete e.n;
      if (e.no == null || e.no === '') delete W.p[pid];
     }
    } else if (W.g) delete W.g[pid];
   } else {
    var pr = nameProblem(v);
    if (pr) return say(pr);
    if (isP) W.p[pid] = Object.assign({}, W.p[pid] || {}, {
     n: v
    }); else {
     W.g = W.g || {};
     W.g[pid] = v;
    }
   }
   save(W);
   live1(pid);
   shut();
  }
  inp.addEventListener('keydown', function(e) {
   if (e.key === 'Enter') saveIt();
  });
  r.appendChild(el('div', 'hd', [ el('div', '', [ el('div', 'tt', [ 'RENAME PLAYER' ]), el('div', 'st', [ ((p.pos || '') + ' - DEFAULT: ' + String(d || '')).toUpperCase() ]) ]), el('span', 'sp'), bt('CANCEL', 'g', shut, 'CANCEL RENAME') ]));
  r.appendChild(el('div', 'ef', [ inp, bt('SAVE', '', saveIt, 'SAVE NAME'), bt('RESET', 'g', function() {
   inp.value = '';
   saveIt();
  }, 'RESET NAME') ], {
   id: 'ed32One'
  }));
  msgEl = el('div', 'msg');
  r.appendChild(msgEl);
  setTimeout(function() {
   try {
    inp.focus({
     preventScroll: true
    });
   } catch (e) {}
  }, 30);
 }
 function open() {
  W = SN.load();
  changed = false;
  view = {
   s: 'list',
   grp: 'RLL',
   tid: null,
   edit: null
  };
  ensure().classList.add('open');
  render();
 }
 function close() {
  if (!root) return;
  root.classList.remove('open');
  if (changed) {
   root.classList.add('open');
   root.innerHTML = '';
   root.appendChild(el('div', 'hd', [ el('div', 'tt', [ 'SAVED - LOADING YOUR NAMES...' ]) ]));
   setTimeout(function() {
    location.reload();
   }, 150);
  }
 }
 window.ED31 = {
  open: open,
  openPlayer: openOne,
  canRename: canOne,
  close: close,
  isOpen: function() {
   return !!root && root.classList.contains('open');
  },
  state: function() {
   return {
    W: W,
    view: view,
    changed: changed
   };
  }
 };
})();
