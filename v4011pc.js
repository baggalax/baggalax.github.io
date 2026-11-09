var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 var N = window.N31;
 window.V4011PC = {
  on: false
 };
 if (window.__rl_no4011pc || window.__rl_no4011 || window.__rl_v124gb || window.__rl_no31names || !N || !N.on || !N.D || !N.DEF || !N.DEF.teams) return;
 var D = N.D, DEF = N.DEF, ED = N.ED || {}, LOG = {
  teams: 0,
  rows: 0,
  text: 0,
  renamed: [],
  errs: []
 };
 var WAT_NAME = 'Pittsburgh', WAT_TAG = 'PGH';
 var PC = {
  ATL: [ 'Pennsylvania', 'PA', 'New York', 'NY' ],
  WAT: [ WAT_NAME, WAT_TAG, 'Philadelphia', 'PHI' ],
  WHP: [ 'Baltimore', 'BAL', __x("TWFyeWxhbmQ="), 'MD' ],
  OUT: [ 'Colorado', 'COL', __x("RGVudmVy"), 'DEN' ]
 };
 var REALT = [ 'ARC', 'ATL', 'CAN', 'CHA', 'OUT', 'RED', 'WAT', 'WHP' ];
 function hh(str) {
  var h1 = 3735928559, h2 = 1103547991;
  for (var i = 0, ch; i < str.length; i++) {
   ch = str.charCodeAt(i);
   h1 = Math.imul(h1 ^ ch, 2654435761);
   h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 ^= Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 ^= Math.imul(h1 ^ h1 >>> 13, 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
 }
 var OTH = {
  "ARC": "blvyrbaw69",
  "ATL": "19cmutcax6c",
  "CAN": "1mvfo8o0j4e",
  "CHA": "1xrw2ibw2ls",
  "OUT": "1rv8gmgg0al",
  "RED": "271xruex4nm",
  "WAT": "a7xoxdyeqh",
  "WHP": "1z6pd7krut6"
 };
 function cl(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
 }
 function U(s) {
  return cl(s).toUpperCase();
 }
 function edName(tid) {
  var v = cl((ED.t || {})[tid]);
  return v && v.length <= 24 ? v : '';
 }
 var rows = {};
 try {
  ((window.RL_DATA || {}).teams || []).forEach(function(t) {
   if (t && t.id) rows[t.id] = t;
  });
 } catch (e) {}
 try {
  Object.keys(PC).forEach(function(tid) {
   var m = PC[tid], d = D.T[tid], def = DEF.teams[tid], t = rows[tid];
   if (!d || !def || U(d.n) !== U(m[2])) return;
   d.n = m[0];
   d.f = m[0];
   d.a = m[1];
   d.i = N.glyph(m[0]);
   def.name = m[0];
   def.abbr = m[1];
   LOG.teams++;
   if (!t) return;
   var nn = edName(tid);
   if (nn && nn !== def.name) {
    t.abbr = N.abbrOf(nn, def.name, def.abbr);
    LOG.renamed.push(tid);
   } else {
    t.name = m[0];
    t.full = m[0];
    t.abbr = m[1];
    t.icon = d.i.slice();
    t.city = '';
    LOG.rows++;
   }
  });
  REALT.forEach(function(tid) {
   var t = rows[tid], nn = edName(tid);
   if (!t || !nn) return;
   if (OTH[tid] && hh(U(nn)) === OTH[tid]) {
    t.abbr = tid;
    return;
   }
   if (PC[tid] && U(nn) === U(PC[tid][2])) t.abbr = PC[tid][3];
  });
 } catch (e) {
  LOG.errs.push('teams: ' + String(e && e.message || e).slice(0, 160));
 }
 function addText() {
  try {
   var X = D.X || (D.X = []);
   var R = N.lg('RLL').a;
   var cur = function(tid) {
    return edName(tid) || DEF.teams[tid].name;
   };
   Object.keys(PC).forEach(function(tid) {
    var m = PC[tid], c = U(cur(tid)), o = U(m[2]);
    if (c === o) return;
    [ 'BLL', 'BLS', 'RLL' ].forEach(function(lg) {
     X.push([ o + ' ' + lg, c + ' ' + R, 1 ]);
     LOG.text++;
    });
    if (tid === 'WHP' || tid === 'OUT') {
     X.push([ o, cur(tid) ]);
     LOG.text++;
    }
   });
  } catch (e) {
   LOG.errs.push('text: ' + String(e && e.message || e).slice(0, 160));
  }
 }
 if (LOG.teams) {
  var ready0 = N.ready, done = false;
  N.ready = function() {
   if (!done) {
    done = true;
    addText();
   }
   return ready0.apply(this, arguments);
  };
 }
 window.V4011PC = {
  on: LOG.teams > 0,
  LOG: LOG,
  PC: PC
 };
})();
