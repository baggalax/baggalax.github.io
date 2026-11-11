var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 var N = window.N31;
 window.V38COL = {
  on: false
 };
 if (window.__rl_no38col || window.__rl_v124gb || !N || !N.on || !N.D || !N.D.T || !Array.isArray(window.RL_COL25)) return;
 var MAP = {
  CAF: [ "COLORADO SPRINGS", "COS", "Hawks" ],
  CALB: [ __x("QUxCQU5ZIENJVFk="), "ALC", "Hounds" ],
  CARMY: [ "HIGHLAND FALLS", "HFL", "Warriors" ],
  CBELL: [ "DERBY CITY", "DBY", "Spartans" ],
  CBING: [ __x("QklOR0hBTVRPTiBDSVRZ"), "BGC", "Bobcats" ],
  CBU: [ "BOSTON CITY", "BOC", "Bulldogs" ],
  CBRWN: [ "COLLEGE HILL", "CHL", "Sled Dogs" ],
  CBRY: [ "SMITHFIELD", "SMF", "Huskies" ],
  CBUCK: [ "LEWISBURG", "LEW", "Buffaloes" ],
  CCAN: [ "BUFFALO CITY", "BFC", "Gryphons" ],
  CCLEV: [ "CLEVELAND CITY", "CLC", "Sea Dragons" ],
  CCOLG: [ "MADISON HILLS", "MDH", "Trojans" ],
  CCORN: [ "ITHACA CITY", "ITC", "Red Bears" ],
  CDART: [ "UPPER VALLEY", "UPV", "Stags" ],
  CDEL: [ "DOVER", "DOV", "Owls" ],
  CDEN: [ __x("REVOVkVSIENJVFk="), "DVC", "Frontiersmen" ],
  CDET: [ "DETROIT CITY", "DTC", "Crusaders" ],
  CDREX: [ "PHILLY CITY", "PHC", "Pirates" ],
  CDUKE: [ "BULL CITY", "BUL", "Demons" ],
  CFAIR: [ __x("RkFJUkZJRUxEIENJVFk="), "FFC", "Elk" ],
  CGTWN: [ __x("R0VPUkdFVE9XTiBDSVRZ"), "GTC", "Bloodhounds" ],
  CHAMP: [ __x("SEFNUFRPTiBDSVRZ"), "HMC", "Buccaneers" ],
  CHARV: [ "CHARLES RIVER", "CHR", "Pilgrims" ],
  CHPU: [ __x("SElHSCBQT0lOVCBDSVRZ"), "HPC", "Cougars" ],
  CHOB: [ "SENECA LAKE", "SNL", __x("Q29sb25pYWxz") ],
  CHOF: [ "HEMPSTEAD", "HEM", "Lions" ],
  CHC: [ "WORCESTER", "WOR", "Knights" ],
  CIONA: [ "NEW ROCHELLE", "NRO", "Titans" ],
  CJAX: [ __x("SkFDS1NPTlZJTExFIENJVFk="), "JXC", "Sharks" ],
  CJHU: [ "CHARM CITY", "CHM", "Bluebirds" ],
  CLAF: [ "EASTON", "EAS", "Cheetahs" ],
  CLEH: [ "BETHLEHEM", "BTH", "Crows" ],
  CLEM: [ "DEWITT", "DEW", "Seahawks" ],
  CLIU: [ "BROOKVILLE", "BRK", "Sea Lions" ],
  CLOY: [ "ROLAND PARK", "RPK", "Terriers" ],
  CMAN: [ __x("TUFOSEFUVEFOIENJVFk="), "MNC", "Saints" ],
  CMAR: [ "POUGHKEEPSIE", "POK", "Silver Foxes" ],
  CMARQ: [ "BREW CITY", "BRW", "Thunderbirds" ],
  CUMD: [ "COLLEGE PARK", "CPK", "Turtles" ],
  CUMBC: [ "CATONSVILLE", "CTV", "Sheepdogs" ],
  CMASS: [ "PIONEER VALLEY", "PVY", "Soldiers" ],
  CUML: [ "LOWELL CITY", "LWC", "Night Owls" ],
  CMER: [ "MACON", "MAC", "Big Cats" ],
  CMHU: [ "ERIE", "ERI", "Sailors" ],
  CMACK: [ "NORTH ANDOVER", "NAN", "Raiders" ],
  CMICH: [ "ANN ARBOR", "ANN", "Wolves" ],
  CMON: [ "WEST LONG BRANCH", "WLB", "Ravens" ],
  CMSM: [ "EMMITSBURG", "EMM", "Pioneers" ],
  CNAVY: [ "SEVERN RIVER", "SEV", "Mariners" ],
  CNJIT: [ "NEWARK", "NWK", "Cadets" ],
  CUNC: [ "CHAPEL HILL", "CPH", "Rams" ],
  CND: [ "SOUTH BEND", "SBD", "Golden Hawks" ],
  COSU: [ "COLUMBUS", "CMB", "Wildcats" ],
  CPENN: [ "UNIVERSITY CITY", "UCY", "Pilgrims" ],
  CPSU: [ "BELLEFONTE", "BLF", "Mountain Lions" ],
  CPRIN: [ __x("UFJJTkNFVE9OIENJVFk="), "PRC", "Jaguars" ],
  CPROV: [ __x("UFJPVklERU5DRSBDSVRZ"), "PVC", "Monks" ],
  CQU: [ "MYERS PARK", "MYP", "Kings" ],
  CQUIN: [ "HAMDEN", "HMD", "Panthers" ],
  CRICH: [ __x("UklDSE1PTkQgQ0lUWQ=="), "RCC", "Cavaliers" ],
  CRMU: [ "MOON TOWNSHIP", "MNT", "Patriots" ],
  CRUT: [ "HUB CITY", "HUB", "Raiders" ],
  CSHU: [ "BLACK ROCK", "BKR", "Frontier Scouts" ],
  CSBU: [ "ALLEGANY", "ALG", "Wolfpack" ],
  CSTJ: [ "HILLCREST", "HLC", "Thunder Hawks" ],
  CSJ: [ "WYNNEFIELD", "WYN", "Falcons" ],
  CSIE: [ "LOUDONVILLE", "LDV", __x("RnJpYXJz") ],
  CSTB: [ __x("U1RPTlkgQlJPT0sgQ0lUWQ=="), "SBC", "Timber Wolves" ],
  CCUSE: [ __x("U1lSQUNVU0UgQ0lUWQ=="), "SYC", "Night Hawks" ],
  CTOW: [ __x("VE9XU09OIENJVFk="), "TWC", "Leopards" ],
  CUTAH: [ "SALT LAKE CITY", "SLC", "Eagles" ],
  CUVM: [ "BURLINGTON", "BRL", "Wildcats" ],
  CNOVA: [ "RADNOR", "RAD", "Mountain Cats" ],
  CUVA: [ "CHARLOTTESVILLE", "CVL", "Spartans" ],
  CVMI: [ "LEXINGTON", "LEX", "Soldiers" ],
  CWAG: [ "STATEN ISLAND", "STI", "Sea Eagles" ],
  CYALE: [ "ELM CITY", "ELM", "Hounds" ]
 };
 var CONF = [ [ __x("QU1FUklDQSBFQVNU"), "TIMBERLINE" ], [ __x("QVRMQU5USUMgMTA="), "SEABOARD" ], [ __x("QklHIEVBU1Q="), "BIG CITY" ], [ __x("QklHIFRFTg=="), "GRAIN BELT" ], [ __x("UEFUUklPVA=="), "IRONCLAD" ], [ __x("QVNVTg=="), "SUNRISE" ], [ __x("SVZZ"), "OLD BRICK" ], [ __x("TkVD"), "LAKESHORE" ], [ __x("Q0FB"), "HARBOR" ], [ __x("TUVUUk8="), "TURNPIKE" ], [ __x("QUND"), "PINE CREST" ] ];
 var ROUNDS = [ [ __x("RklOQUwgRk9VUg=="), "TITLE WEEKEND" ], [ __x("U1dFRVQgMTY="), "ROUND OF 16" ], [ __x("RUxJVEUgOA=="), "QUARTERFINAL" ] ];
 var OLD = {};
 var D = N.D, SAFE_OLD = [ 'WEST POINT', 'LOUISVILLE', 'HANOVER', 'DURHAM', 'CAMBRIDGE', 'GENEVA', 'MILWAUKEE', 'ANNAPOLIS', 'NEW BRUNSWICK', 'NEW HAVEN' ];
 function title(s) {
  return String(s).toLowerCase().replace(/(^|[\s'-])([a-z])/g, function(m, a, b) {
   return a + b.toUpperCase();
  });
 }
 var REAL = {};
 window.RL_COL25.forEach(function(t) {
  var m = MAP[t.id];
  if (!m) return;
  REAL[t.id] = {
   name: t.name,
   nick: t.nick,
   conf: t.conf
  };
  var d = D.T[t.id] || (D.T[t.id] = {}), old = String(d.n || '').toUpperCase();
  if (old && old !== m[0] && SAFE_OLD.indexOf(old) >= 0) OLD[old] = m[0];
  d.n = m[0];
  d.f = title(m[0]) + ' ' + m[2];
  d.a = m[1];
  d.i = N.glyph(m[0]);
  t.nick = m[2];
 });
 function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 }
 var PAIRS = [];
 Object.keys(OLD).forEach(function(k) {
  PAIRS.push([ k, OLD[k] ]);
 });
 ROUNDS.forEach(function(p) {
  PAIRS.push(p);
 });
 CONF.forEach(function(p) {
  if (p[0] !== __x("QUND")) PAIRS.push(p);
 });
 PAIRS.sort(function(a, b) {
  return b[0].length - a[0].length;
 });
 var TO = {};
 PAIRS.forEach(function(p) {
  TO[p[0]] = p[1];
 });
 var RE = new RegExp('(^|[^A-Za-z0-9_])(' + PAIRS.map(function(p) {
  return esc(p[0]);
 }).join('|') + ')(?=$|[^A-Za-z0-9_])', 'g');
 var STAT = /^(SPD|PWR|POW|ACC|FIN|STK|STR|DEF|GB|FO|SAV|OVR|IN|POS|ATT)$/;
 var ACC_RE = /(^|[^A-Za-z0-9_])ACC(?=$|[^A-Za-z0-9_])/g, ACC_TO = 'PINE CREST';
 function accSwap(s) {
  if (s.indexOf(__x("QUND")) < 0 || s.trim() === __x("QUND")) return s;
  return s.replace(ACC_RE, function(m, pre, off) {
   var at = off + pre.length, after = s.slice(at + 3), before = s.slice(0, at);
   if (/^\s*\d/.test(after)) return m;
   var nx = (after.match(/^\s+([A-Z]+)/) || [])[1], pv = (before.match(/([A-Z]+)\s+$/) || [])[1];
   if (nx && STAT.test(nx) || pv && STAT.test(pv)) return m;
   return pre + ACC_TO;
  });
 }
 var protRaw = null, prot = [], protAt = -1e9;
 function protList() {
  var now = Date.now();
  if (now - protAt < 1e3) return prot;
  protAt = now;
  var raw = '';
  try {
   raw = (localStorage.getItem('rl_bl33_conf') || '') + '|' + (localStorage.getItem(N.KEY) || '');
  } catch (e) {}
  if (raw === protRaw) return prot;
  protRaw = raw;
  var out = [];
  CACHE.clear();
  try {
   var o = JSON.parse(localStorage.getItem('rl_bl33_conf') || 'null');
   if (o && o.col && typeof o.col === 'object') {
    (Array.isArray(o.names) ? o.names : []).forEach(function(n) {
     out.push(n);
    });
    Object.keys(o.col).forEach(function(k) {
     if (o.col[k]) out.push(o.col[k]);
    });
   }
  } catch (e) {}
  try {
   var ed = N.ED && N.ED.t;
   if (ed) Object.keys(ed).forEach(function(k) {
    if (ed[k]) out.push(ed[k]);
   });
  } catch (e) {}
  prot = out.map(function(x) {
   return String(x).replace(/\s+/g, ' ').trim().toUpperCase();
  }).filter(function(x) {
   return x.length >= 2 && !Object.prototype.hasOwnProperty.call(TO, x) && x !== __x("QUND");
  });
  prot.sort(function(a, b) {
   return b.length - a.length;
  });
  return prot;
 }
 var CACHE = new Map;
 function x38(s) {
  if (typeof s !== 'string' || s.length < 2 || !/[A-Z]{2}/.test(s)) return s;
  var P = protList();
  var c = CACHE.get(s);
  if (c !== undefined) return c;
  var out = s, keep = [];
  if (P.length) {
   var U = out.toUpperCase();
   P.forEach(function(p) {
    var i;
    while ((i = U.indexOf(p)) >= 0) {
     keep.push(out.substr(i, p.length));
     var tok = '' + (keep.length - 1) + '';
     out = out.slice(0, i) + tok + out.slice(i + p.length);
     U = U.slice(0, i) + tok + U.slice(i + p.length);
    }
   });
  }
  RE.lastIndex = 0;
  out = out.replace(RE, function(m, pre, w) {
   return pre + TO[w];
  });
  out = accSwap(out);
  if (keep.length) out = out.replace(/\u0001(\d+)\u0002/g, function(m, i) {
   return keep[+i];
  });
  if (CACHE.size > 4e3) CACHE.clear();
  CACHE.set(s, out);
  return out;
 }
 var sub0 = N.sub;
 N.sub = function(s) {
  return x38(sub0.apply(this, arguments));
 };
 var CONFTO = {};
 CONF.forEach(function(p) {
  CONFTO[p[0]] = p[1];
 });
 function confName(c) {
  return Object.prototype.hasOwnProperty.call(CONFTO, c) ? CONFTO[c] : c;
 }
 function hdr(e) {
  if (e && e.childNodes.length === 1 && e.firstChild.nodeType === 3 && e.firstChild.nodeValue === __x("QUND")) e.firstChild.nodeValue = ACC_TO;
 }
 function hdrs(n) {
  if (!n || n.nodeType !== 1) return;
  if (n.classList && (n.classList.contains('cf') || n.classList.contains('gh'))) hdr(n);
  if (n.querySelectorAll) {
   var l = n.querySelectorAll('.cf,.gh');
   for (var i = 0; i < l.length; i++) hdr(l[i]);
  }
 }
 function late() {
  try {
   new MutationObserver(function(ms) {
    ms.forEach(function(m) {
     if (m.type === 'characterData') {
      var p = m.target.parentNode;
      if (p && p.classList && (p.classList.contains('cf') || p.classList.contains('gh'))) hdr(p);
     } else m.addedNodes.forEach(function(n) {
      if (n.nodeType === 3) {
       var p = n.parentNode;
       if (p && p.classList && (p.classList.contains('cf') || p.classList.contains('gh'))) hdr(p);
      } else hdrs(n);
     });
    });
   }).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
   });
   hdrs(document.body);
  } catch (e) {
   console.error(e);
  }
  try {
   if (window.V33 && typeof V33.confTag === 'function' && !V33.confTag.__v38) {
    var ct0 = V33.confTag;
    V33.confTag = function() {
     return confName(ct0.apply(this, arguments));
    };
    V33.confTag.__v38 = 1;
   }
  } catch (e) {
   console.error(e);
  }
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', late); else late();
 window.V38COL = {
  on: true,
  MAP: MAP,
  CONF: CONF,
  ROUNDS: ROUNDS,
  OLD: OLD,
  REAL: REAL,
  confName: confName,
  x: x38
 };
})();
