var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 var N = window.N31;
 window.V4011 = {
  on: false
 };
 if (window.__rl_no4011 || window.__rl_v124gb || window.__rl_no31names || !N || !N.on || !N.D || !N.DEF || !N.LGDEF) return;
 var D = N.D, DEF = N.DEF, ED = N.ED || {}, X = D.X || (D.X = []), LOG = {
  co: 0,
  lg: 0,
  col: 0,
  prot: 0,
  errs: []
 };
 function err(e, w) {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
  } catch (x) {}
 }
 function cl(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
 }
 function title(s) {
  return String(s).toLowerCase().replace(/(^|[\s'-])([a-z])/g, function(m, a, b) {
   return a + b.toUpperCase();
  });
 }
 var COACH = {
  WHAU: [ 'HOLLIS BRANNOCK', 'Hollis Brannock' ]
 };
 if (!window.__rl_no4011co) try {
  Object.keys(COACH).forEach(function(tid) {
   var t = DEF.teams[tid];
   if (!t || t.coachReal) return;
   t.coachReal = COACH[tid][0];
   t.coach = COACH[tid][1];
   if (D.C) D.C[tid] = COACH[tid][1];
   LOG.co++;
  });
 } catch (e) {
  err(e, 'co');
 }
 var COL = {
  "CAF": [ "BLACK FOREST", "BKF", "COLORADO SPRINGS" ],
  "CALB": [ "COHOES", "COH", __x("QUxCQU5ZIENJVFk=") ],
  "CBING": [ "JOHNSON CITY", "JNC", __x("QklOR0hBTVRPTiBDSVRZ") ],
  "CBU": [ "ALLSTON", "ALS", "BOSTON CITY" ],
  "CCAN": [ "CHEEKTOWAGA", "CHK", "BUFFALO CITY" ],
  "CCLEV": [ "SHAKER HEIGHTS", "SKH", "CLEVELAND CITY" ],
  "CCORN": [ "DRYDEN", "DRY", "ITHACA CITY" ],
  "CCUSE": [ "CICERO", "CIC", __x("U1lSQUNVU0UgQ0lUWQ==") ],
  "CDEN": [ "GREENWOOD VILLAGE", "GWV", __x("REVOVkVSIENJVFk=") ],
  "CDET": [ "HAMTRAMCK", "HMK", "DETROIT CITY" ],
  "CDREX": [ "MANAYUNK", "MYK", "PHILLY CITY" ],
  "CFAIR": [ "GREENS FARMS", "GRF", __x("RkFJUkZJRUxEIENJVFk=") ],
  "CGTWN": [ "BALLSTON", "BLN", __x("R0VPUkdFVE9XTiBDSVRZ") ],
  "CHAMP": [ "NEWPORT NEWS", "NPN", __x("SEFNUFRPTiBDSVRZ") ],
  "CHC": [ "MILLBURY", "MLB", "WORCESTER" ],
  "CHPU": [ "ARCHDALE", "ARD", __x("SElHSCBQT0lOVCBDSVRZ") ],
  "CIONA": [ "LARCHMONT", "LMT", "NEW ROCHELLE" ],
  "CJAX": [ "ORANGE PARK", "OPK", __x("SkFDS1NPTlZJTExFIENJVFk=") ],
  "CMAN": [ "RIVERDALE", "RVD", __x("TUFOSEFUVEFOIENJVFk=") ],
  "CMER": [ "WARNER ROBINS", "WRB", "MACON" ],
  "CMHU": [ "MILLCREEK", "MLC", "ERIE" ],
  "CMICH": [ "YPSILANTI", "YPS", "ANN ARBOR" ],
  "CND": [ "MISHAWAKA", "MSH", "SOUTH BEND" ],
  "COSU": [ "UPPER ARLINGTON", "UPA", "COLUMBUS" ],
  "CPRIN": [ "PLAINSBORO", "PLB", __x("UFJJTkNFVE9OIENJVFk=") ],
  "CPROV": [ "PAWTUCKET", "PAW", __x("UFJPVklERU5DRSBDSVRZ") ],
  "CRICH": [ "HENRICO", "HCO", __x("UklDSE1PTkQgQ0lUWQ==") ],
  "CSBU": [ "OLEAN", "OLN", "ALLEGANY" ],
  "CSTB": [ "SETAUKET", "STU", __x("U1RPTlkgQlJPT0sgQ0lUWQ==") ],
  "CTOW": [ "LUTHERVILLE", "LTV", __x("VE9XU09OIENJVFk=") ],
  "CUMD": [ "HYATTSVILLE", "HYV", "COLLEGE PARK" ],
  "CUML": [ "DRACUT", "DRC", "LOWELL CITY" ],
  "CUNC": [ "PITTSBORO", "PIT", "CHAPEL HILL" ],
  "CUTAH": [ "HOLLADAY", "HOL", "SALT LAKE CITY" ],
  "CUVA": [ "CROZET", "CRZ", "CHARLOTTESVILLE" ],
  "CUVM": [ "WINOOSKI", "WNK", "BURLINGTON" ],
  "CWAG": [ "GRYMES HILL", "GRH", "STATEN ISLAND" ]
 };
 if (!window.__rl_no4011col && Array.isArray(window.RL_COL25) && D.T) try {
  var OT = D.OT || (D.OT = {});
  window.RL_COL25.forEach(function(t) {
   var m = COL[t.id];
   if (!m) return;
   var d = D.T[t.id] || (D.T[t.id] = {});
   if (String(d.n || '').toUpperCase() !== m[2]) return;
   d.n = m[0];
   d.f = title(m[0]) + (t.nick ? ' ' + t.nick : '');
   d.a = m[1];
   d.i = N.glyph(m[0]);
   (OT[t.id] = OT[t.id] || []).push(m[2]);
   LOG.col++;
  });
 } catch (e) {
  err(e, 'col');
 }
 if (!window.__rl_no4011lg) try {
  var L = N.LGDEF;
  if (L.RLL && L.RLL.a === 'BLL') {
   L.RLL.f = 'BAGGA LACROSSE SERIES';
   L.RLL.a = 'BLS';
  }
  if (L.TLL && L.TLL.a === 'TLL') {
   L.TLL.f = 'THROWBACK LACROSSE SERIES';
   L.TLL.a = 'TLS';
  }
  var R = N.lg('RLL'), TL = N.lg('TLL'), C = N.lg('COLLEGE');
  [ [ 'BAGGA LAX LEAGUE', R.f ], [ 'BLL', R.a, 1 ], [ 'THROWBACK LAX LEAGUE', TL.f ], [ 'TLL', TL.a, 1 ], [ __x("UFJFTUlFUiBMQUNST1NTRSBMRUFHVUU="), R.f ], [ __x("UFJFTUlFUiBMQUNST1NTRQ=="), R.f ], [ __x("TUFKT1IgTEVBR1VFIExBQ1JPU1NF"), TL.f ], [ __x("QU4gTUxM"), (/^[AEIOU]/.test(TL.a) ? 'AN ' : 'A ') + TL.a, 1 ], [ __x("UExMICsgTUxM"), R.a + ' + ' + TL.a, 1 ], [ __x("UExMK01MTA=="), R.a + '+' + TL.a, 1 ], [ __x("UExM"), R.a, 1 ], [ __x("TUxM"), TL.a, 1 ], [ __x("TkNBQQ=="), C.f, 1 ], [ 'HIGH FLYER', 'AIR DIVE', 1 ], [ 'HIGH-FLYER', 'AIR-DIVE', 1 ], [ 'AIR GATE', 'AIR DIVE', 1 ] ].forEach(function(x) {
   if (x[0].toUpperCase() !== String(x[1]).toUpperCase()) {
    X.push(x);
    LOG.lg++;
   }
  });
 } catch (e) {
  err(e, 'lg');
 }
 if (!window.__rl_no4011prot) try {
  var P = [];
  function fold(s) {
   return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u0142\u0141]/g, function(c) {
    return c === 'ł' ? 'l' : 'L';
   }).replace(/[\u00f8\u00d8]/g, function(c) {
    return c === 'ø' ? 'o' : 'O';
   });
  }
  function addP(v) {
   v = cl(v);
   if (v.length < 2) return;
   var u = v.toUpperCase();
   [ u, fold(u), u.replace(/\u2019/g, "'") ].forEach(function(k) {
    if (P.indexOf(k) < 0) P.push(k);
   });
  }
  Object.keys(ED.p || {}).forEach(function(k) {
   var e = ED.p[k];
   if (e && typeof e === 'object') addP(e.n); else if (typeof e === 'string') addP(e);
  });
  [ 'c', 'g', 't' ].forEach(function(s) {
   Object.keys(ED[s] || {}).forEach(function(k) {
    addP(ED[s][k]);
   });
  });
  Object.keys(ED.l || {}).forEach(function(k) {
   var e = ED.l[k] || {};
   addP(e.f);
   addP(e.a);
  });
  P.sort(function(a, b) {
   return b.length - a.length;
  });
  LOG.prot = P.length;
  if (P.length) {
   var sub0 = N.sub, CACHE = new Map;
   N.sub = function(s) {
    if (typeof s !== 'string' || s.length < 2) return sub0.apply(this, arguments);
    var c = CACHE.get(s);
    if (c !== undefined) return c;
    var out = s, U = s.toUpperCase(), keep = [];
    for (var j = 0; j < P.length; j++) {
     var p = P[j], i = U.indexOf(p);
     while (i >= 0) {
      var a = i === 0 ? '' : U.charAt(i - 1), b = U.charAt(i + p.length);
      if (/[A-Z0-9_]/.test(a) || /[A-Z0-9_]/.test(b)) {
       i = U.indexOf(p, i + 1);
       continue;
      }
      keep.push(out.substr(i, p.length));
      var tok = '' + (keep.length - 1) + '';
      out = out.slice(0, i) + tok + out.slice(i + p.length);
      U = U.slice(0, i) + tok + U.slice(i + p.length);
      i = U.indexOf(p, i + tok.length);
     }
    }
    out = keep.length ? sub0.call(this, out).replace(/\u0001(\d+)\u0002/g, function(m, k) {
     return keep[+k];
    }) : sub0.call(this, s);
    if (CACHE.size > 4e3) CACHE.clear();
    CACHE.set(s, out);
    return out;
   };
  }
 } catch (e) {
  err(e, 'prot');
 }
 window.V4011 = {
  on: true,
  LOG: LOG,
  COACH: COACH,
  COL: COL
 };
})();
