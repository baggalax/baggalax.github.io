'use strict';
var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());


let W = 380;

const H = 180;

const no2314 = () => !!window.__rl_no2314;

const FL = 520;

const FT = 32, FB = 170, CY = 101;

const GX = FL - 36;

const DGX = 36;

const MIDX = FL / 2;

const CREASE = 15, MOUTH = 8;

const QLEN = 90, SHOT_CLOCK = 20;

const CLEAR_T = 10, BOX_T = 6, CREASE_CT = 4;

const cv = document.getElementById('game');

const ctx = cv.getContext('2d');

const off = document.createElement('canvas');

let g = off.getContext('2d');

let SCALE = 2, DPR = 1, portrait = false, RR = 1;

const stage = document.getElementById('stage');

const ui = document.getElementById('ui');

function vp2318() {
 if (window.__rl_no2318c) return null;
 const sa = navigator.standalone === true || !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
 if (!sa) return null;
 const vv = window.visualViewport, de = document.documentElement;
 return [ Math.round(Math.max(window.innerWidth || 0, de && de.clientWidth || 0, vv ? vv.width * vv.scale : 0)), Math.round(Math.max(window.innerHeight || 0, de && de.clientHeight || 0, vv ? vv.height * vv.scale : 0)) ];
}

function resize() {
 const vv = window.visualViewport, q18 = vp2318();
 const iw = q18 ? q18[0] : Math.round(vv ? Math.min(window.innerWidth, vv.width * vv.scale) : window.innerWidth);
 const ih = q18 ? q18[1] : Math.round(vv ? Math.min(window.innerHeight, vv.height * vv.scale) : window.innerHeight);
 portrait = ih > iw * 1.05;
 document.body.classList.toggle('portrait', portrait);
 DPR = Math.min(window.devicePixelRatio || 1, 3);
 W = Math.max(300, Math.min(400, Math.round(H * iw / ih)));
 SCALE = Math.min(iw / W, ih / H);
 const cw = Math.round(W * SCALE), ch = Math.round(H * SCALE);
 cv.style.width = cw + 'px';
 cv.style.height = ch + 'px';
 const pw = Math.round(cw * DPR), ph = Math.round(ch * DPR);
 if (cv.width !== pw) cv.width = pw;
 if (cv.height !== ph) cv.height = ph;
 RR = Math.max(1, Math.min(5, Math.round(SCALE * DPR)));
 off.width = W * RR;
 off.height = H * RR;
 g.imageSmoothingEnabled = false;
 if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
}

window.addEventListener('resize', resize);

window.addEventListener('orientationchange', () => {
 setTimeout(resize, 200);
 setTimeout(resize, 600);
});

if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);

(function() {
 const again = () => {
  if (window.__rl_no2318c) return;
  resize();
  for (const t of [ 100, 400, 1e3 ]) setTimeout(resize, t);
 };
 for (const ev of [ 'orientationchange', 'resize', 'pageshow' ]) window.addEventListener(ev, again);
 document.addEventListener('visibilitychange', again);
 if (window.visualViewport) window.visualViewport.addEventListener('resize', again);
})();

resize();

const DATA = window.RL_DATA || {
 teams: []
};

const SKILLS = [ 'spd', 'pow', 'acc', 'fin', 'stk', 'str', 'def', 'gb', 'fo', 'sav' ];

const SKILL_NAMES = {
 spd: 'SPEED',
 pow: 'SHOT POWER',
 acc: 'ACCURACY',
 fin: 'FINISHING',
 stk: 'STICK SKILL',
 str: 'STRENGTH',
 def: 'DEFENSE',
 gb: 'GROUND BALLS',
 fo: 'FACEOFF',
 sav: 'SAVES'
};

const POS_NAMES = {
 A: 'ATTACK',
 M: 'MIDFIELD',
 LSM: 'LONG-STICK MID',
 D: 'DEFENSE (POLE)',
 FO: 'FACEOFF (FOGO)',
 G: 'GOALIE'
};

const QUOTA = {
 A: 4,
 M: 5,
 FO: 1,
 LSM: 1,
 D: 4,
 G: 2
};

const PLAYERS = {};

function ovrOf(p) {
 const r = p.r, w = {
  A: {
   fin: .25,
   acc: .2,
   stk: .2,
   str: .15,
   pow: .1,
   spd: .1
  },
  M: {
   pow: .2,
   acc: .15,
   spd: .15,
   stk: .15,
   str: .15,
   fin: .1,
   def: .1
  },
  D: {
   def: .45,
   gb: .2,
   spd: .15,
   str: .1,
   stk: .1
  },
  LSM: {
   def: .35,
   gb: .3,
   spd: .2,
   stk: .15
  },
  FO: {
   fo: .6,
   gb: .25,
   spd: .15
  },
  G: {
   sav: .8,
   stk: .2
  }
 }[p.pos] || {
  spd: 1
 };
 let s = 0;
 for (const k in w) s += r[k] * w[k];
 return Math.round(s);
}

const TEAMS = DATA.teams.map(t => {
 const tm = {
  id: t.id,
  name: t.name.toUpperCase(),
  full: t.full || t.name,
  city: (t.city || '').toUpperCase(),
  lg: t.lg,
  era: t.era || '',
  c1: t.c1,
  c2: t.c2,
  icon: t.icon,
  coach: t.coach || '',
  coachNote: t.coachNote || '',
  off: 4,
  def: 4
 };
 if (t.abbr) tm.abbr = t.abbr;
 tm.roster = t.players.map((a, i) => {
  const p = {
   id: t.id + '-' + i,
   n: a[0],
   pos: a[1],
   r: {},
   real: !!a[12],
   team: t.id
  };
  if (a.n0 != null) p.n0 = a.n0;
  SKILLS.forEach((k, j) => p.r[k] = a[2 + j]);
  p.ovr = ovrOf(p);
  PLAYERS[p.id] = p;
  return p.id;
 });
 return tm;
});

const FREE_AGENTS = (DATA.free_agents || []).map((a, i) => {
 const p = {
  id: 'FA-' + i,
  n: a[0],
  pos: a[1],
  r: {},
  real: false,
  team: 'FA'
 };
 SKILLS.forEach((k, j) => p.r[k] = a[2 + j]);
 p.ovr = ovrOf(p);
 PLAYERS[p.id] = p;
 return p.id;
});

const EGG_PLAYERS = [ [ 'Charlie McGuire', 'M', 31, 31, 30, 29, 31, 29, 26, 29, 17, 0 ], [ 'Luke McKinney', 'D', 33, 19, 16, 14, 32, 36, 37, 33, 11, 0 ], [ 'Maddox Baucom', 'M', 37, 37, 37, 35, 37, 35, 31, 35, 20, 0 ], [ 'Carson Maloney', 'A', 35, 35, 37, 37, 37, 33, 16, 31, 9, 0 ], [ 'Chase BH', 'D', 33, 19, 18, 15, 32, 36, 37, 33, 12, 0 ], [ 'Van Jantzen', 'LSM', 34, 26, 23, 20, 30, 34, 36, 37, 30, 0 ], [ 'Trey Dixon', 'M', 24, 22, 21, 20, 23, 22, 20, 23, 18, 0 ], [ 'Jack McGuire', 'M', 65, 63, 56, 55, 60, 58, 46, 52, 25, 0 ], [ 'Conner Baucom', 'M', 38, 38, 37, 36, 38, 37, 32, 36, 22, 0 ], [ 'Adam Gonzalez', 'M', 40, 39, 37, 36, 37, 39, 32, 37, 21, 0 ], [ 'JJ Edwards', 'LSM', 37, 27, 24, 22, 36, 37, 39, 39, 24, 0 ], [ 'Joe Rubino', 'D', 33, 22, 19, 17, 33, 39, 39, 36, 14, 0 ], [ 'Lachlan Clark', 'A', 37, 38, 40, 41, 40, 35, 18, 34, 10, 0 ], [ 'CJ Zarcone', 'A', 39, 39, 39, 40, 39, 37, 19, 35, 10, 0 ], [ 'Carl Klepper', 'A', 54, 66, 64, 69, 58, 70, 24, 44, 10, 0 ], [ 'Chase Oropollo', 'A', 39, 40, 42, 42, 43, 37, 18, 35, 10, 0 ] ].map((a, i) => {
 const p = {
  id: 'EGG-' + i,
  n: a[0],
  pos: a[1],
  r: {},
  real: false,
  team: 'FA',
  egg: true,
  egg13: i >= 6
 };
 SKILLS.forEach((k, j) => p.r[k] = a[2 + j]);
 p.ovr = ovrOf(p);
 PLAYERS[p.id] = p;
 return p.id;
});

const EGG_D2301 = {
 "EGG-0": -23,
 "EGG-1": -23,
 "EGG-2": -23,
 "EGG-3": -23,
 "EGG-4": -23,
 "EGG-5": -22,
 "EGG-8": -23,
 "EGG-9": -23,
 "EGG-10": -23,
 "EGG-11": -23,
 "EGG-12": -23,
 "EGG-13": -23
};

function mig2301(S) {
 try {
  const o = S && typeof S === 'object' && S.ovr0;
  if (!o || typeof o !== 'object' || o.__e2301) return S;
  for (const id in EGG_D2301) if (typeof o[id] === 'number' && o[id] > 58) o[id] += EGG_D2301[id];
  o.__e2301 = 1;
 } catch (e) {}
 return S;
}

const EGG_D2313 = {
 "EGG-0": [ -17, 47 ],
 "EGG-1": [ -10, 45 ],
 "EGG-2": [ -10, 46 ],
 "EGG-3": [ -10, 46 ],
 "EGG-4": [ -10, 45 ],
 "EGG-5": [ -10, 45 ],
 "EGG-7": [ -12, 71 ],
 "EGG-8": [ -10, 47 ],
 "EGG-9": [ -10, 48 ],
 "EGG-10": [ -10, 48 ],
 "EGG-11": [ -10, 47 ],
 "EGG-12": [ -10, 49 ],
 "EGG-13": [ -10, 49 ]
};

function mig2313(S) {
 try {
  const o = S && typeof S === 'object' && S.ovr0;
  if (!o || typeof o !== 'object' || o.__e2313) return S;
  for (const id in EGG_D2313) if (typeof o[id] === 'number' && o[id] >= EGG_D2313[id][1] - 6) o[id] += EGG_D2313[id][0];
  o.__e2313 = 1;
 } catch (e) {}
 return S;
}

const LEG20_DEF = [ [ 'Old Foxworth', 'A', 78, 86, 92, 94, 97, 80, 38, 66, 10, 0 ], [ 'OG Thatcher', 'M', 95, 99, 97, 97, 98, 98, 90, 86, 30, 0 ], [ 'Reg Hollingsworth', 'M', 99, 98, 86, 88, 86, 99, 62, 78, 22, 0 ], [ 'Walt Houghton', 'D', 88, 45, 40, 36, 88, 92, 99, 92, 30, 0 ] ];

const LEG20_TEAM = {
 'LEG-0': null,
 'LEG-1': 'NYL',
 'LEG-2': null,
 'LEG-3': null
};

const LEGACY20 = LEG20_DEF.map((a, i) => {
 const p = {
  id: 'LEG-' + i,
  n: window.N31 && N31.on ? N31.leg('LEG-' + i, a[0]) : a[0],
  pos: a[1],
  r: {},
  real: false,
  team: 'LEG',
  leg: true,
  legTeam: LEG20_TEAM['LEG-' + i]
 };
 if (p.n !== a[0]) p.n0 = a[0];
 SKILLS.forEach((k, j) => p.r[k] = a[2 + j]);
 p.ovr = ovrOf(p);
 PLAYERS[p.id] = p;
 return p.id;
});

const SZ_REG = {};

const WT_REG = {};

const GH_REG = {};

const T = id => id && (SZ_REG[id] || WT_REG[id] || GH_REG[id]) || TEAMS.find(t => t.id === id) || TEAMS[0];

const PP = id => PLAYERS[id] || (typeof id === 'string' && id.startsWith('CU30-') && window.C30 ? C30.make(id) : undefined);

function lastName(p) {
 if (!p) return '';
 const w = p.n.split(' ');
 let s = w[w.length - 1];
 if (/^(JR\.?|SR\.?|II|III|IV)$/i.test(s) && w.length > 2) s = w[w.length - 2];
 return s.toUpperCase();
}

function lum(hex) {
 const [r, gg, b] = hexRgb(hex);
 return r * .3 + gg * .59 + b * .11;
}

const accent = t => lum(t.c1) < 45 ? t.c2 : t.c1;

function hexRgb(h) {
 const n = parseInt(h.slice(1), 16);
 return [ n >> 16, n >> 8 & 255, n & 255 ];
}

function cdist(a, b) {
 const x = hexRgb(a), y = hexRgb(b);
 return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

function textOn(hex) {
 const [r, gg, b] = hexRgb(hex);
 return r * .3 + gg * .59 + b * .11 > 150 ? '#0b0f14' : '#ffffff';
}

function kits(userId, oppId, userHome) {
 const u = T(userId), o = T(oppId);
 const home = t => ({
  jersey: '#f4f4f4',
  trim: accent(t),
  helm: t.c1
 });
 const away = t => ({
  jersey: t.c1,
  trim: t.c2,
  helm: t.c1
 });
 return userHome ? [ home(u), away(o) ] : [ away(u), home(o) ];
}

const on2503 = () => !window.__rl_no2503 && !window.__rl_v124gb;

let warn2503t = -1e9;

function saveWarn2503() {
 try {
  if (!on2503()) return;
  const t = Date.now();
  if (t - warn2503t < 12e3) return;
  warn2503t = t;
  if (!document.body) {
   document.addEventListener('DOMContentLoaded', () => {
    warn2503t = -1e9;
    saveWarn2503();
   });
   return;
  }
  let d = document.getElementById('sv2503');
  if (!d) {
   d = document.createElement('div');
   d.id = 'sv2503';
   d.setAttribute('role', 'alert');
   d.style.cssText = 'position:fixed;left:50%;top:max(8px,env(safe-area-inset-top));transform:translateX(-50%);z-index:90;width:max-content;max-width:92vw;padding:7px 12px;background:#2a0d0d;border:2px solid #ff5a4a;box-shadow:0 3px 0 #000;color:#fff;font:bold 12px/1.3 "Courier New",ui-monospace,monospace;text-transform:uppercase;text-align:center;pointer-events:none';
   document.body.appendChild(d);
  }
  d.textContent = "COULDN'T SAVE - YOUR PHONE STORAGE IS FULL OR SAVING IS BLOCKED";
  d.style.display = 'block';
  clearTimeout(d._t);
  d._t = setTimeout(() => {
   d.style.display = 'none';
  }, 4500);
  window.__sv2503n = (window.__sv2503n || 0) + 1;
 } catch (e) {}
}

try {
 const SI0 = Storage.prototype.setItem;
 Storage.prototype.setItem = function(k, v) {
  try {
   return SI0.call(this, k, v);
  } catch (e) {
   if (String(k).startsWith('rl_')) saveWarn2503();
   throw e;
  }
 };
} catch (e) {}

const LS = {
 get(k, d) {
  try {
   const v = localStorage.getItem('rl_' + k);
   if (!v) return d;
   try {
    return JSON.parse(v);
   } catch (e) {
    bak2503(k, v);
    return d;
   }
  } catch (e) {
   return d;
  }
 },
 set(k, v) {
  try {
   localStorage.setItem('rl_' + k, JSON.stringify(v));
  } catch (e) {
   saveWarn2503();
  }
 }
};

function bak2503(k, raw) {
 try {
  if (raw == null) raw = localStorage.getItem('rl_' + k);
  if (raw && raw !== 'null' && localStorage.getItem('rl_' + k + '_bak') !== raw) localStorage.setItem('rl_' + k + '_bak', raw);
 } catch (e) {}
}

const DIFF_NAMES = [ 'SQUID', 'FISH', 'BEGINNER', 'GROSS', 'NASTY', 'BAGGATWAAN' ];

const DIFF_INFO = [ 'WIDE OPEN D, LEAKY GOALIE', 'THE CLASSIC (V12.4) GAME', 'D CLOSES OUT, GOALIE WAKES UP', 'TIGHT D, MORE CHECKS, REAL GOALIE', 'EVERYONE ~10% FASTER, D SLIDES QUICK', '~25% FASTER, 2 CHECKS POP IT, MORE HITS - YOU ARE THE UNDERDOG' ];

const DIFF_T = {
 spd: [ 1, 1, 1, 1, 1.1, 1.25 ],
 gk: [ .72, 1, 1.2, 1.35, 1.52, 1.7 ],
 gkR: [ 1.3, 1, .85, .75, .68, .6 ],
 dSpd: [ .9, 1, 1.05, 1.09, 1.12, 1.15 ],
 tight: [ 1.35, 1, .87, .8, .74, .68 ],
 react: [ 1.4, 1, .8, .65, .55, .45 ],
 slide: [ .6, 1, 1.4, 1.8, 2.2, 2.6 ],
 slideT: [ 1.5, 1, .85, .7, .6, .5 ],
 chk: [ .6, 1, 1.25, 1.45, 1.65, 1.9 ],
 chkEvery: [ 1.25, 1, .9, .82, .75, .68 ],
 intc: [ .6, 1, 1.35, 1.7, 2, 2.4 ],
 ourGk: [ 1.15, 1, .95, .88, .8, .72 ],
 cpuSpread: [ 1.2, 1, .95, .88, .8, .72 ],
 uLand: [ 1.1, 1, .95, .88, .8, .7 ],
 cpuDecide: [ 1.15, 1, .95, .88, .8, .72 ],
 cpuShoot: [ .85, 1, 1.05, 1.12, 1.22, 1.32 ],
 cpuBeat: [ .8, 1, 1.07, 1.15, 1.3, 1.45 ],
 uBeat: [ 1.15, 1, .92, .85, .8, .74 ],
 foRate: [ 1, 1, 1, 1.08, 1.18, 1.25 ],
 foReact: [ 1, 1, 1, .88, .75, .66 ]
};

const QLEN_OPTS = [ 60, 90, 120, 180, 240, 300 ];

const ARC_R = 120;

const SETTINGS = (() => {
 const d = {
  diff: 2,
  qlen: QLEN,
  halves: false,
  twoPt: false
 };
 try {
  const raw = localStorage.getItem('rl_settings');
  if (raw) {
   const v = JSON.parse(raw);
   return Object.assign(d, v && typeof v === 'object' ? v : {});
  }
  if (Object.keys(localStorage).some(k => k.startsWith('rl_'))) d.diff = 1;
  localStorage.setItem('rl_settings', JSON.stringify(d));
 } catch (e) {}
 return d;
})();

function settingsFix() {
 const S = SETTINGS;
 S.diff = clamp(Math.round(+S.diff || 0), 0, 5);
 if (!QLEN_OPTS.includes(S.qlen)) S.qlen = QLEN;
 S.halves = !!S.halves;
 S.twoPt = !!S.twoPt;
}

const SET171 = (() => {
 let v = null;
 try {
  v = JSON.parse(localStorage.getItem('rl_set171') || 'null');
 } catch (e) {}
 v = v && typeof v === 'object' ? v : {};
 return {
  autoSw: v.autoSw !== false,
  chirps: v.chirps !== false
 };
})();

function set171Save() {
 try {
  localStorage.setItem('rl_set171', JSON.stringify({
   autoSw: !!SET171.autoSw,
   chirps: !!SET171.chirps
  }));
 } catch (e) {}
}

function settingsSave() {
 settingsFix();
 LS.set('settings', SETTINGS);
}

const DF = {};

function applyDiff() {
 settingsFix();
 const lk = typeof game !== 'undefined' && game && game.lk2503 != null && on2503() ? game.lk2503 : null, lv = lk != null ? lk : SETTINGS.diff;
 for (const k in DIFF_T) DF[k] = DIFF_T[k][lv];
 DF.level = lv;
 DF.name = DIFF_NAMES[lv];
 if (lk != null) game.diff = lk;
}

function okDiff2503(d) {
 return typeof d === 'number' && d >= 0 && d <= 5 && d === Math.round(d) ? d : null;
}

function lock2503(G) {
 if (!on2503() || !G || G.tutorial) return null;
 try {
  if (G.mode === 'season') return season && !season.online && !G.online ? okDiff2503(season.diff2503) : null;
  if (G.mode === 'world') return wgame ? okDiff2503(wgame.diff2503) : null;
  if (G.mode === 'college' && G.meta && G.meta.col25 && window.COL25 && COL25.diff2503) return okDiff2503(COL25.diff2503(G));
 } catch (e) {}
 return null;
}

const DCOL2503 = [ '#7dff7a', '#8fe3f0', '#ffd23a', '#ffb14d', '#ff8a5a', '#ff5a4a' ];

function ask2503(kind, go) {
 if (!on2503()) return go(null);
 if (window.__rl_df2503auto) return go(SETTINGS.diff);
 const old = document.getElementById('df2503');
 if (old) old.remove();
 const nm = {
  season: 'SEASON',
  college: 'COLLEGE SEASON',
  world: 'WORLD GAMES',
  ult: 'ULTIMATE'
 }[kind] || 'SEASON';
 const d = document.createElement('div');
 d.id = 'df2503';
 d.style.cssText = 'position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation';
 const box = document.createElement('div');
 box.style.cssText = 'background:#14222b;border-top:2px solid #ffe14d;box-shadow:0 3px 0 #000;padding:9px 12px 10px;max-width:94vw;text-align:center';
 const ln = (s, css) => {
  const e = document.createElement('div');
  e.textContent = s;
  e.style.cssText = css;
  box.appendChild(e);
  return e;
 };
 ln('PICK YOUR ' + nm + ' DIFFICULTY', 'color:#ffe14d;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:3px');
 ln('LOCKED UNTIL THIS ' + (kind === 'world' || kind === 'ult' ? 'RUN' : 'SEASON') + ' ENDS. GAME SETTINGS WON\'T CHANGE IT.', 'font-size:10px;margin-bottom:7px');
 const row = document.createElement('div');
 row.style.cssText = 'display:flex;gap:4px;justify-content:center;flex-wrap:wrap';
 box.appendChild(row);
 const info = ln(DIFF_INFO[SETTINGS.diff], 'font-size:10px;color:#fff;margin-top:6px;min-height:13px');
 const done = v => {
  d.remove();
  try {
   SFX.tap && SFX.tap();
  } catch (e) {}
  go(v);
 };
 DIFF_NAMES.forEach((n, i) => {
  const b = document.createElement('button');
  b.id = 'df2503_' + i;
  b.textContent = n;
  b.style.cssText = 'font:inherit;font-size:12px;border:0;border-radius:0;padding:7px 9px;margin:0;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;background:' + DCOL2503[i] + (i === SETTINGS.diff ? ';outline:2px solid #fff;outline-offset:1px' : '');
  b.addEventListener('pointerenter', () => {
   info.textContent = DIFF_INFO[i];
  });
  b.addEventListener('click', e => {
   e.stopPropagation();
   done(i);
  });
  row.appendChild(b);
 });
 const bk = document.createElement('button');
 bk.id = 'df2503_back';
 bk.textContent = 'BACK';
 bk.style.cssText = 'font:inherit;border:0;border-radius:0;padding:5px 12px;margin-top:7px;background:#c9d6d9;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000';
 bk.addEventListener('click', e => {
  e.stopPropagation();
  d.remove();
 });
 box.appendChild(bk);
 d.appendChild(box);
 document.body.appendChild(d);
}

let tutGate = (() => {
 try {
  if (LS.get('tutDone', false)) return false;
  if (LS.get('tutGate', false)) return true;
  if (Object.keys(localStorage).some(k => k.startsWith('rl_') && k !== 'rl_settings')) {
   LS.set('tutDone', 'legacy');
   return false;
  }
  LS.set('tutGate', true);
  return true;
 } catch (e) {
  return false;
 }
})();

let menuMsg = null;

let tutAsk = false;

function tutSkipAll() {
 tutAsk = false;
 LS.set('tutDone', true);
 tutGate = false;
 if (game && game.tutorial) game.tutorial.complete = true;
 game = null;
 screen = 'menu';
 shootP = null;
 stick = null;
 menuMsg = {
  s: 'TUTORIAL SKIPPED',
  t: 2
 };
}

let ASK22 = null;

function ask22Yes() {
 const k = ASK22 && ASK22.kind;
 ASK22 = null;
 if (k === 'season' || k === 'over') {
  menuSel.mode = 'season';
  screen = 'seasonSetup';
  panelDirty();
 } else if (k === 'world') {
  if (wgame && !no2314()) wgArchPush2314(wgame);
  wgame = null;
  LS.set('wg', null);
  setHome172('season');
  screen = 'wgPick';
  panelDirty();
 }
}

function drawAsk22() {
 if (!ASK22) return;
 hit('RESTART BLOCK', 0, 0, W, H, () => {}, 'RESTART BLOCK');
 const bw = 200, bh = 64, bx = Math.round(W / 2 - bw / 2), by = Math.round(H / 2 - bh / 2);
 rect(0, 0, W, H, 'rgba(0,0,0,.55)');
 rect(bx, by + 2, bw, bh, '#000');
 rect(bx, by, bw, bh, '#14222b');
 rect(bx, by, bw, 1, '#ffe14d');
 if (ASK22.kind === 'over') {
  text('YOUR SEASON IS OVER', W / 2, by + 6, 2, '#ffe14d', 'center', '#000');
  if (ASK22.how) text(ASK22.how, W / 2, by + 19, 1, ASK22.how === 'CHAMPIONS' ? '#7dff7a' : '#ff9a8a', 'center');
  text('START A NEW SEASON?', W / 2, by + (ASK22.how ? 28 : 22), 1, '#cfe', 'center');
 } else {
  text('ARE YOU SURE YOU WANT TO RESTART?', W / 2, by + 8, 1, '#ffe14d', 'center', '#000');
  text(ASK22.kind === 'world' ? 'THIS RESETS YOUR WORLD GAMES RUN ONLY.' : 'THIS STARTS A NEW SEASON.', W / 2, by + 22, 1, '#cfe', 'center');
 }
 const yb = by + 38, w2 = 70;
 hit('RESTART YES', bx + 20, yb, w2, 16, ask22Yes, 'RESTART YES');
 rect(bx + 20, yb + 2, w2, 16, '#000');
 rect(bx + 20, yb, w2, 16, '#ff8a7a');
 text('YES', bx + 20 + w2 / 2, yb + 6, 1, '#0b1a20', 'center');
 hit('RESTART NO', bx + bw - 20 - w2, yb, w2, 16, () => {
  const k = ASK22 && ASK22.kind;
  ASK22 = null;
  if (k === 'over' && season) {
   screen = 'season';
   seasonTab = 0;
   panelDirty();
  }
 }, 'RESTART NO');
 rect(bx + bw - 20 - w2, yb + 2, w2, 16, '#000');
 rect(bx + bw - 20 - w2, yb, w2, 16, '#c9d6d9');
 text('NO', bx + bw - 20 - w2 / 2, yb + 6, 1, '#0b1a20', 'center');
}

function drawTutAsk() {
 hit('SKIP TUTORIAL BLOCK', 0, 0, W, H, () => {}, 'SKIP TUTORIAL BLOCK');
 const bw = 176, bh = 60, bx = Math.round(W / 2 - bw / 2), by = Math.round(H / 2 - bh / 2);
 rect(0, 0, W, H, 'rgba(0,0,0,.55)');
 rect(bx, by + 2, bw, bh, '#000');
 rect(bx, by, bw, bh, '#14222b');
 rect(bx, by, bw, 1, '#ffe14d');
 text('SKIP TUTORIAL?', W / 2, by + 8, 2, '#ffe14d', 'center', '#000');
 text('YOU CAN REPLAY IT FROM THE LOBBY.', W / 2, by + 24, 1, '#cfe', 'center');
 const yb = by + 36, w2 = 70;
 hit('SKIP TUTORIAL YES', bx + 12, yb, w2, 16, () => tutSkipAll(), 'SKIP TUTORIAL YES');
 rect(bx + 12, yb + 2, w2, 16, '#000');
 rect(bx + 12, yb, w2, 16, '#7dff7a');
 text('YES', bx + 12 + w2 / 2, yb + 6, 1, '#0b1a20', 'center');
 hit('SKIP TUTORIAL NO', bx + bw - 12 - w2, yb, w2, 16, () => {
  tutAsk = false;
 }, 'SKIP TUTORIAL NO');
 rect(bx + bw - 12 - w2, yb + 2, w2, 16, '#000');
 rect(bx + bw - 12 - w2, yb, w2, 16, '#ff9a8a');
 text('NO', bx + bw - 12 - w2 / 2, yb + 6, 1, '#0b1a20', 'center');
}

const SKIN_MIX = [ .32, .16, .14, .14, .14, .1 ];

const SKIN_NAMES = [ 'LIGHT', 'LIGHT-MEDIUM', 'MEDIUM', 'MEDIUM-DARK', 'DARK', 'DEEP' ];

const SKIN_BASE = [ '#f0c090', '#dcac78', '#c48a56', '#a26a3e', '#7e4f2f', '#664029' ];

const SKIN_SET = {
 'charlie mcguire': 0,
 'luke mckinney': 0,
 'chase bh': 0,
 'van jantzen': 0,
 'carson maloney': 0,
 'maddox baucom': 1,
 'perry kenyon': 4,
 'trey dixon': 0,
 'jack mcguire': 0,
 'conner baucom': 1,
 'adam gonzalez': 4,
 'jj edwards': 1,
 'joe rubino': 0,
 'lachlan clark': 0,
 'cj zarcone': 0,
 'chase oropollo': 0
};

if (!window.__rl_no286skin && !window.__rl_v124gb) Object.assign(SKIN_SET, {
 'porter boothe': 0,
 'carl klepper': 0
});

function seedOf(s) {
 let h = 2166136261;
 s = String(s);
 for (let i = 0; i < s.length; i++) {
  h ^= s.charCodeAt(i);
  h = Math.imul(h, 16777619);
 }
 return h >>> 0;
}

function pickSkin(id) {
 let r = seedOf('skin:' + id) % 100003 / 100003;
 for (let i = 0; i < SKIN_MIX.length; i++) {
  if ((r -= SKIN_MIX[i]) < 0) return i;
 }
 return 0;
}

const SKINS = (() => {
 const s = LS.get('skins', null);
 return s && typeof s === 'object' ? s : {};
})();

function defaultSkin(p) {
 const k = String((p.n0 != null ? p.n0 : p.n) || '').toLowerCase().trim();
 return SKIN_SET[k] != null ? SKIN_SET[k] : pickSkin(p.id);
}

for (const id in PLAYERS) {
 const p = PLAYERS[id], v = SKINS[id];
 p.skin = v != null && v >= 0 && v <= 5 ? v | 0 : defaultSkin(p);
}

if (typeof LEGACY20 !== 'undefined' && SKINS['LEG-2'] == null) PLAYERS['LEG-2'].skin = 4;

function skinOf(p) {
 return p && p.skin != null ? p.skin : 0;
}

function setSkin(id, s) {
 const p = PP(id);
 if (!p) return -1;
 p.skin = ((s | 0) % 6 + 6) % 6;
 SKINS[id] = p.skin;
 LS.set('skins', SKINS);
 return p.skin;
}

let muted = LS.get('muted', false);

let AC = null;

const MASTER_VOL = .58;

function audioInit() {
 try {
  if (AC && AC.state === 'closed') AC = null;
  if (AC && AC.state !== 'running' && AC.__askT && performance.now() - AC.__askT > 700) audioFresh();
  if (!AC) {
   try {
    AC = new (window.AudioContext || window.webkitAudioContext);
   } catch (e) {}
  }
  if (AC && AC.state !== 'running') {
   const ac = AC;
   if (!ac.__askT) ac.__askT = performance.now();
   let p = null;
   try {
    p = ac.resume();
   } catch (e) {
    audioFresh();
   }
   if (p && p.then) p.then(() => {
    if (ac.state === 'running') ac.__askT = 0;
   }, () => {
    if (AC === ac) audioFresh();
   });
  } else if (AC) AC.__askT = 0;
  if (AC && typeof RL12A !== 'undefined') {
   try {
    RL12A.load(AC);
   } catch (e) {}
  }
  audioUnlockIOS();
 } catch (e) {}
}

function audioFresh() {
 const old = AC;
 AC = null;
 AUDIO_STATS.fresh++;
 try {
  if (old && old.state !== 'closed') old.close();
 } catch (e) {}
 try {
  AC = new (window.AudioContext || window.webkitAudioContext);
  if (AC.state !== 'running') {
   AC.__askT = performance.now();
   AC.resume().catch(() => {});
  }
 } catch (e) {
  AC = null;
 }
}

const AUDIO_STATS = {
 fresh: 0,
 unlock: 0,
 wake: 0
};

let audioUnlocked = false;

function audioUnlockIOS() {
 if (audioUnlocked) return;
 audioUnlocked = true;
 AUDIO_STATS.unlock++;
 try {
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
 } catch (e) {}
 try {
  const a = document.createElement('audio');
  a.setAttribute('playsinline', '');
  a.setAttribute('webkit-playsinline', '');
  a.preload = 'auto';
  a.src = SILENT_WAV;
  a.volume = 0;
  const p = a.play();
  if (p && p.catch) p.catch(() => {
   audioUnlocked = false;
  });
 } catch (e) {
  audioUnlocked = false;
 }
}

const SILENT_WAV = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

function audioWake() {
 if (!AC || AC.state === 'running') return;
 AUDIO_STATS.wake++;
 try {
  const p = AC.resume();
  if (p && p.catch) p.catch(() => {});
 } catch (e) {}
}

[ 'touchend', 'click', 'pointerup', 'keydown' ].forEach(ev => window.addEventListener(ev, () => audioInit(), true));

document.addEventListener('visibilitychange', () => {
 if (document.visibilityState === 'visible') audioWake();
});

window.addEventListener('pageshow', audioWake);

window.addEventListener('focus', audioWake);

function tone(f, d, type = 'square', vol = .08, when = 0, slide = 0) {
 if (muted || !AC) return;
 const t0 = AC.currentTime + when;
 const o = AC.createOscillator(), v = AC.createGain();
 o.type = type;
 o.frequency.setValueAtTime(f, t0);
 if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t0 + d);
 v.gain.setValueAtTime(Math.max(2e-4, vol * MASTER_VOL), t0);
 v.gain.exponentialRampToValueAtTime(1e-4, t0 + d);
 o.connect(v);
 v.connect(AC.destination);
 o.start(t0);
 o.stop(t0 + d + .02);
}

const SFX = {
 tap() {
  tone(520, .05, 'square', .05);
 },
 fo() {
  tone(300 + Math.random() * 80, .04, 'square', .05);
 },
 pass() {
  tone(660, .06, 'square', .06);
  tone(880, .05, 'square', .04, .05);
 },
 catch() {
  tone(990, .04, 'square', .05);
 },
 shot(p) {
  tone(300 + 500 * p, .18, 'sawtooth', .07, 0, -250);
 },
 goal() {
  [ 523, 659, 784, 1047, 784, 1047 ].forEach((f, i) => tone(f, .12, 'square', .07, i * .09));
 },
 save() {
  tone(140, .2, 'triangle', .15);
  tone(90, .2, 'square', .05, .05);
 },
 whistle() {
  tone(2100, .12, 'sine', .07);
  tone(2300, .25, 'sine', .07, .13);
 },
 bad() {
  tone(400, .15, 'square', .06, 0, -200);
  tone(250, .25, 'square', .06, .15, -120);
 },
 ping() {
  tone(2637, .42, 'sine', .11);
  tone(3951, .22, 'sine', .05, .004);
  tone(5274, .09, 'triangle', .03, .002);
  tone(1319, .06, 'square', .025);
 },
 ding() {
  tone(1760, .35, 'triangle', .12);
  tone(2640, .25, 'sine', .07, .01);
  tone(3520, .12, 'sine', .04, .02);
 },
 bonk() {
  tone(196, .16, 'triangle', .1, 0, -40);
  tone(311, .09, 'square', .028);
  tone(466, .06, 'triangle', .035, .004);
  tone(98, .12, 'sine', .06);
 },
 cheer() {
  [ 392, 523, 659, 784 ].forEach((f, i) => tone(f, .18, 'triangle', .08, i * .12));
 }
};

const VOL12 = .8 * MASTER_VOL;

function sfx12(name, vol, rate) {
 const v = Math.max(0, Math.min(1, vol == null ? 1 : vol)) * VOL12;
 if (window.__rlAudio) window.__rlAudio.push({
  n: name,
  v: +v.toFixed(3),
  t: game ? +(+game.t || 0).toFixed(2) : 0,
  s: screen
 });
 if (typeof RL12A === 'undefined' || !AC) return false;
 return RL12A.play(AC, name, v, rate);
}

const VOICE_TXT = typeof RL12A !== 'undefined' && RL12A.TEXT || {};

const VOICE_CAT = typeof RL12A !== 'undefined' && RL12A.CAT || {};

const VOICE_ALIAS = {
 goalie: 'save',
 ankles: 'ankle',
 bench: 'hit',
 benchGoal: 'goal_us',
 chirp: 'bench'
};

const VOICE_POOL = new Proxy({}, {
 get: (o, k) => k === 'userChirp' ? [].concat(VOICE_CAT.bench || [], VOICE_CAT.hit || [], VOICE_CAT.ankle || [], VOICE_CAT.miss || []) : VOICE_CAT[VOICE_ALIAS[k] || k] || []
});

const CHIRP = {
 gap: 6,
 fill: [ 15, 25 ],
 vol: .5,
 loud: .55
};

const voiceLast = {};

const vt = () => game && game.t != null ? game.t : menuT;

let voiceSrc = null, voiceEndAt = 0;

function voiceBusy() {
 return AC ? AC.currentTime < voiceEndAt : false;
}

const VOICE_W = id => /^save_muffin/.test(id) ? 2 : 1;

function voicePick(list) {
 let tot = 0;
 for (const id of list) tot += VOICE_W(id);
 let r = Math.random() * tot;
 for (const id of list) {
  r -= VOICE_W(id);
  if (r < 0) return id;
 }
 return list[list.length - 1];
}

function voice12(pool, x, y, gap, force) {
 const t = vt(), last = game ? game.voiceAt != null ? game.voiceAt : -99 : -99;
 if (!force && (t - last < (gap == null ? CHIRP.gap : Math.max(gap, CHIRP.gap)) || voiceBusy())) return null;
 const list = VOICE_POOL[pool];
 if (!list || !list.length) return null;
 let k, n = 0;
 do {
  k = voicePick(list);
 } while ((k === voiceLast[pool] || k === voiceLast._any) && list.length > 1 && ++n < 12);
 voiceLast[pool] = k;
 voiceLast._any = k;
 if (game) game.voiceAt = t;
 if (force && voiceSrc) {
  try {
   voiceSrc.stop();
  } catch (e) {}
  voiceSrc = null;
 }
 const cat = VOICE_ALIAS[pool] || pool, vol = cat === 'save' || cat === 'fire' || cat === 'coach_ref' ? CHIRP.loud : CHIRP.vol;
 const rate = .98 + Math.random() * .04, k17 = window.V17 ? V17.chirp(pool, k) : k;
 if (!k17 && game && window.V17 && V17.V172ON && V17.V172ON()) game.voiceAt = last;
 const s = k17 ? sfx12(k17, vol, rate) : null;
 if (s && typeof s === 'object') {
  voiceSrc = s;
  voiceEndAt = AC.currentTime + (typeof RL12A !== 'undefined' && RL12A.DUR[k17] || 1.6) + .1;
 }
 if (x != null && k17) pop12(VOICE_TXT[k17] || RL12A.TEXT && RL12A.TEXT[k17] || '', x, y, '#ffffff', 1.7, true);
 if (game) {
  game.voiceLog = game.voiceLog || [];
  game.voiceLog.push([ pool, k17 || null, +t.toFixed(2) ]);
 }
 return k;
}

function pop12(s, x, y, col, life, bub) {
 if (!game || !s) return;
 game.pops = (game.pops || []).filter(p => menuT - p.t0 < p.life);
 game.pops.push({
  s: s,
  x: x,
  y: y,
  col: col || '#fff',
  life: life || 1.4,
  bub: !!bub,
  t0: menuT
 });
}

function drawPops() {
 const G = game;
 if (!G || !G.pops) return;
 G.pops = G.pops.filter(p => menuT - p.t0 < p.life);
 const slR = [];
 for (const f of G.pops) {
  const e = menuT - f.t0, by = Math.round(f.y - e * 3);
  if (e < 0) continue;
  if (f.sl) {
   const w = textW(f.s) + 4, lo = camX + w / 2 + 2, hi = camX + W - w / 2 - 2;
   let x = f.x;
   if (x < lo || x > hi) x = f.alt != null ? camX + f.alt * W : x;
   const cx = Math.round(clamp(x, lo, Math.max(lo, hi)));
   let by2 = by;
   for (let k = 0; k < 6 && slR.some(q => Math.abs(q[0] - cx) < (q[1] + w) / 2 + 1 && Math.abs(q[2] - by2) < 10); k++) by2 -= 11;
   slR.push([ cx, w, by2 ]);
   rect(cx - Math.round(w / 2), by2 - 2, w, 9, 'rgba(255,255,255,.92)');
   rect(cx - 1, by2 + 7, 3, 2, 'rgba(255,255,255,.92)');
   text(f.s, cx, by2, 1, f.ew ? '#c0187a' : '#0b0f14', 'center');
   if (G.sl18Drawn != null || window.__rl18sl) G.sl18Drawn = (G.sl18Drawn || 0) + 1;
   continue;
  }
  if (f.bub) {
   const w = textW(f.s) + 4;
   rect(Math.round(f.x - w / 2), by - 2, w, 9, 'rgba(255,255,255,.92)');
   rect(Math.round(f.x) - 1, by + 7, 3, 2, 'rgba(255,255,255,.92)');
   text(f.s, f.x, by, 1, '#0b0f14', 'center');
  } else text(f.s, f.x, by, 1, f.col, 'center', '#000');
 }
}

const PING_R = CREASE * 1.5;

function pipeBonk(x, y) {
 SFX.bonk();
 const G = game;
 if (G) {
  G.bonks = (G.bonks || 0) + 1;
  G.bonkLog = G.bonkLog || [];
  G.bonkLog.push(+(G.t || 0).toFixed(2));
 }
 if (window.__rlAudio) window.__rlAudio.push({
  n: 'bonk',
  v: +(.1 * MASTER_VOL).toFixed(3),
  t: G ? +(+G.t || 0).toFixed(2) : 0,
  s: screen
 });
}

function goalPing(gx) {
 const b = game && game.ball, f = b && b.shotFrom;
 if (!f) return false;
 const d = Math.hypot(f[0] - gx, f[1] - CY), out = d > PING_R;
 game.pingLog = game.pingLog || [];
 game.pingLog.push({
  d: +d.toFixed(1),
  ping: out
 });
 if (out) {
  SFX.ping();
  if (window.__rlAudio) window.__rlAudio.push({
   n: 'ping',
   v: +(.11 * MASTER_VOL).toFixed(3),
   t: +(+game.t || 0).toFixed(2),
   s: screen
  });
 }
 b.shotFrom = null;
 return out;
}

function crowd12(user) {
 if (game) {
  game.cheers = game.cheers || [];
  game.cheers.push(user ? 'U' : 'C');
 }
 return user ? sfx12('crowd_cheer_big', .9) : sfx12('crowd_cheer', .4);
}

function hitStrength(by, c) {
 if (!by) return .6;
 const sp = Math.hypot(by.mvx || 0, by.mvy || 0), st = by.pl && by.pl.r ? by.pl.r.str : 70, cs = c && c.pl && c.pl.r ? c.pl.r.str : 70;
 return clamp(.25 + sp / 150 + (st - cs) / 120 + (isPole(by) ? .08 : 0), .2, 1);
}

function hit12(s) {
 if (game) {
  game.hitSnd = game.hitSnd || [];
  game.hitSnd.push(+s.toFixed(2));
 }
 return s >= .5 ? sfx12('hit_big', .35 + .65 * s) : sfx12('hit_light', .4 + .6 * s);
}

const FONT = {
 A: [ ".#.", "#.#", "###", "#.#", "#.#" ],
 B: [ "##.", "#.#", "##.", "#.#", "##." ],
 C: [ ".##", "#..", "#..", "#..", ".##" ],
 D: [ "##.", "#.#", "#.#", "#.#", "##." ],
 E: [ "###", "#..", "##.", "#..", "###" ],
 F: [ "###", "#..", "##.", "#..", "#.." ],
 G: [ ".##", "#..", "#.#", "#.#", ".##" ],
 H: [ "#.#", "#.#", "###", "#.#", "#.#" ],
 I: [ "###", ".#.", ".#.", ".#.", "###" ],
 J: [ "..#", "..#", "..#", "#.#", ".#." ],
 K: [ "#.#", "#.#", "##.", "#.#", "#.#" ],
 L: [ "#..", "#..", "#..", "#..", "###" ],
 M: [ "#.#", "###", "###", "#.#", "#.#" ],
 N: [ "##.", "#.#", "#.#", "#.#", "#.#" ],
 O: [ ".#.", "#.#", "#.#", "#.#", ".#." ],
 P: [ "##.", "#.#", "##.", "#..", "#.." ],
 Q: [ ".#.", "#.#", "#.#", "##.", ".##" ],
 R: [ "##.", "#.#", "##.", "#.#", "#.#" ],
 S: [ ".##", "#..", ".#.", "..#", "##." ],
 T: [ "###", ".#.", ".#.", ".#.", ".#." ],
 U: [ "#.#", "#.#", "#.#", "#.#", "###" ],
 V: [ "#.#", "#.#", "#.#", "#.#", ".#." ],
 W: [ "#.#", "#.#", "###", "###", "#.#" ],
 X: [ "#.#", "#.#", ".#.", "#.#", "#.#" ],
 Y: [ "#.#", "#.#", ".#.", ".#.", ".#." ],
 Z: [ "###", "..#", ".#.", "#..", "###" ],
 0: [ "###", "#.#", "#.#", "#.#", "###" ],
 1: [ ".#.", "##.", ".#.", ".#.", "###" ],
 2: [ "##.", "..#", ".#.", "#..", "###" ],
 3: [ "##.", "..#", ".#.", "..#", "##." ],
 4: [ "#.#", "#.#", "###", "..#", "..#" ],
 5: [ "###", "#..", "##.", "..#", "##." ],
 6: [ ".##", "#..", "###", "#.#", "###" ],
 7: [ "###", "..#", ".#.", ".#.", ".#." ],
 8: [ "###", "#.#", "###", "#.#", "###" ],
 9: [ "###", "#.#", "###", "..#", "##." ],
 ' ': [ "...", "...", "...", "...", "..." ],
 '.': [ "...", "...", "...", "...", ".#." ],
 ',': [ "...", "...", "...", ".#.", "#.." ],
 '!': [ ".#.", ".#.", ".#.", "...", ".#." ],
 '?': [ "##.", "..#", ".#.", "...", ".#." ],
 ':': [ "...", ".#.", "...", ".#.", "..." ],
 '-': [ "...", "...", "###", "...", "..." ],
 "'": [ ".#.", ".#.", "...", "...", "..." ],
 '/': [ "..#", "..#", ".#.", "#..", "#.." ],
 '+': [ "...", ".#.", "###", ".#.", "..." ],
 '<': [ "..#", ".#.", "#..", ".#.", "..#" ],
 '>': [ "#..", ".#.", "..#", ".#.", "#.." ],
 '(': [ ".#.", "#..", "#..", "#..", ".#." ],
 ')': [ ".#.", "..#", "..#", "..#", ".#." ],
 '=': [ "...", "###", "...", "###", "..." ],
 '"': [ "#.#", "#.#", "...", "...", "..." ],
 '#': [ "#.#", "###", "#.#", "###", "#.#" ],
 '&': [ ".#.", "#.#", ".#.", "#.#", ".##" ],
 '^': [ ".#.", "#.#", "...", "...", "..." ],
 'v': [ "...", "...", "...", "#.#", ".#." ]
};

function fold2318(s) {
 s = String(s);
 return /[\u00c0-\u024f]/.test(s) ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u0142\u0141]/g, c => c === 'ł' ? 'l' : 'L').replace(/[\u00f8\u00d8]/g, c => c === 'ø' ? 'o' : 'O').replace(/[\u0111\u0110]/g, c => c === 'đ' ? 'd' : 'D').replace(/\u00df/g, 'ss') : s;
}

function textW(s, sc = 1) {
 return String(s).length * 4 * sc - sc;
}

function text(s, x, y, sc = 1, col = '#fff', align = 'left', shadow = null) {
 if (SA2403B) y = sa2403By(y);
 s = fold2318(s);
 if (window.__rlTextLog) window.__rlTextLog.push(screen + '|' + s);
 if (s !== 'v') s = s.replace(/[a-uw-z]/g, ch => ch.toUpperCase());
 const w = textW(s, sc);
 if (align === 'center') x = Math.round(x - w / 2); else if (align === 'right') x = Math.round(x - w);
 if (shadow) {
  const so = Math.max(1, Math.round(sc / 3));
  drawText(s, x + so, y + so, sc, shadow);
 }
 drawText(s, x, y, sc, col);
 return w;
}

function drawText(s, x, y, sc, col) {
 g.fillStyle = col;
 for (let i = 0; i < s.length; i++) {
  const gl = FONT[s[i]] || FONT['?'];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === '#') g.fillRect(Math.round(x) + i * 4 * sc + c * sc, Math.round(y) + r * sc, sc, sc);
 }
}

function textMini(s, cx, y, col, k) {
 if (SA2403B) y = sa2403By(y);
 s = fold2318(s).toUpperCase();
 if (window.__rlTextLog) window.__rlTextLog.push(screen + '|' + s);
 const cell = Math.max(1, Math.round((k || .65) * RR)) / RR, w = s.length * 4 * cell - cell;
 const x0 = Math.round((cx - w / 2) * RR) / RR, y0 = Math.round(y * RR) / RR;
 g.fillStyle = col;
 for (let i = 0; i < s.length; i++) {
  const gl = FONT[s[i]] || FONT['?'];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === '#') g.fillRect(x0 + (i * 4 + c) * cell, y0 + r * cell, cell, cell);
 }
 return w;
}

function textFit333(s, cx, y, h, col, maxW) {
 if (SA2403B) y = sa2403By(y);
 s = fold2318(s).toUpperCase();
 if (window.__rlTextLog) window.__rlTextLog.push(screen + '|' + s);
 const n = s.length, lim = maxW * RR;
 let C = 1, Gp = 1;
 fit: for (let c = RR; c >= 1; c--) for (let gp = c; gp >= Math.max(1, Math.ceil(c / 2)); gp--) if (n * 3 * c + (n - 1) * gp <= lim) {
  C = c;
  Gp = gp;
  break fit;
 }
 const cell = C / RR, adv = (3 * C + Gp) / RR, w = n * 3 * cell + (n - 1) * Gp / RR;
 const x0 = Math.round((cx - w / 2) * RR) / RR, y0 = Math.round((y + (h - 5 * cell) / 2) * RR) / RR;
 g.fillStyle = col;
 for (let i = 0; i < n; i++) {
  const gl = FONT[s[i]] || FONT['?'];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === '#') g.fillRect(x0 + i * adv + c * cell, y0 + r * cell, cell, cell);
 }
 window.__fit333 = {
  s: s,
  x0: x0,
  w: w,
  y0: y0,
  hh: 5 * cell,
  cell: cell,
  gap: Gp / RR,
  RR: RR
 };
 return w;
}

function rect(x, y, w, h, c) {
 if (SA2403B) y = sa2403By(y);
 g.fillStyle = c;
 g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function px(x, y, c) {
 if (SA2403B) y = sa2403By(y);
 g.fillStyle = c;
 g.fillRect(Math.round(x), Math.round(y), 1, 1);
}

function line(x0, y0, x1, y1, c, th = 1) {
 if (SA2403B) {
  const d = Math.min(y0, y1) - sa2403By(Math.min(y0, y1));
  y0 -= d;
  y1 -= d;
 }
 x0 = Math.round(x0);
 y0 = Math.round(y0);
 x1 = Math.round(x1);
 y1 = Math.round(y1);
 const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
 let err = dx + dy;
 g.fillStyle = c;
 const o = Math.floor(th / 2);
 for (let n = 0; n < 600; n++) {
  g.fillRect(x0 - o, y0 - o, th, th);
  if (x0 === x1 && y0 === y1) break;
  const e2 = 2 * err;
  if (e2 >= dy) {
   err += dy;
   x0 += sx;
  }
  if (e2 <= dx) {
   err += dx;
   y0 += sy;
  }
 }
}

function circle(cx, cy, r, c, step = .05) {
 g.fillStyle = c;
 for (let a = 0; a < Math.PI * 2; a += step) g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
}

function disc(cx, cy, r, c) {
 g.fillStyle = c;
 for (let y = -r; y <= r; y++) {
  const w = Math.floor(Math.sqrt(r * r - y * y));
  g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
 }
}

function badge(team, x, y, sc = 1) {
 const w = 13, h = 15, fillCol = team.c1;
 const edgeCol = cdist(team.c1, team.c2) < 60 ? lum(team.c1) > 128 ? '#111111' : '#ffffff' : team.c2;
 const icCol = textOn(team.c1);
 for (let r = 0; r < h; r++) {
  const inset = r < 9 ? 0 : r - 8;
  for (let c = inset; c < w - inset; c++) {
   const edge = r === 0 || c === inset || c === w - 1 - inset || r === h - 1 || r >= 9 && (c === inset + 1 || c === w - 2 - inset);
   g.fillStyle = edge ? edgeCol : fillCol;
   g.fillRect(Math.round(x) + c * sc, Math.round(y) + r * sc, sc, sc);
  }
 }
 const ic = team.icon || [], ix = Math.round(x) + 4 * sc, iy = Math.round(y) + 2 * sc;
 g.fillStyle = icCol;
 for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (ic[r] && ic[r][c] === '#') g.fillRect(ix + c * sc, iy + r * sc, sc, sc);
 if (sc >= 2) {
  const s = team.abbr || team.szBase || team.id;
  drawText(s, ix + 2.5 * sc - textW(s, 1) / 2, iy + 8 * sc, 1, icCol);
 }
}

const badgeUrls = {};

function badgeUrl(team) {
 if (badgeUrls[team.id]) return badgeUrls[team.id];
 const c = document.createElement('canvas');
 c.width = 39;
 c.height = 45;
 const keep = g;
 g = c.getContext('2d');
 try {
  badge(team, 0, 0, 3);
 } finally {
  g = keep;
 }
 return badgeUrls[team.id] = c.toDataURL();
}

const BX = 6, BY = -12;

const now = () => performance.now() / 1e3;

const rnd = (a, b) => a + Math.random() * (b - a);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const pick = a => a[Math.floor(Math.random() * a.length)];

function gauss() {
 let u = 0, v = 0;
 while (!u) u = Math.random();
 while (!v) v = Math.random();
 return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

let screen = 'menu', paused = false;

let BOOST = null;

let menuSel = {
 mode: 'quick',
 team: LS.get('team', 'ATL'),
 opp: null,
 home: true
};

if (!TEAMS.some(t => t.id === menuSel.team)) menuSel.team = 'ATL';

let season = mig2313(mig2301(LS.get('season', null)));

const sk35off = () => !!window.__rl_no35seaskeep;

function seasonTeamOk35(id) {
 if (TEAMS.some(t => t.id === id)) return true;
 if (sk35off() || typeof id !== 'string' || !id) return false;
 try {
  if (GH_REG[id]) return true;
 } catch (e) {}
 try {
  if (window.V33 && V33.kindOf && V33.kindOf(id) && SZ_REG[id] && (!V33.isCT || V33.isCT(id))) return true;
 } catch (e) {}
 return false;
}

function seasonLoose35(s) {
 try {
  const str = id => typeof id === 'string' && !!id;
  return !!(s && s.v8 && Array.isArray(s.teams) && s.table && Array.isArray(s.rounds) && str(s.team) && s.teams.every(str));
 } catch (e) {
  return false;
 }
}

const SK35 = {
 log: []
};

function seasonOk(s) {
 try {
  if (!s || !s.v8 || !Array.isArray(s.teams) || !s.table || !Array.isArray(s.rounds)) return false;
  const ok = seasonTeamOk35;
  if (!ok(s.team) || !s.teams.every(ok)) return false;
  const ids = s.rosters ? Object.values(s.rosters).flat() : s.draft ? s.draft.pool.concat(...Object.values(s.draft.rosters)) : [];
  return ids.every(id => !!PLAYERS[id]);
 } catch (e) {
  return false;
 }
}

function seasonShape2503(s) {
 try {
  const ok = seasonTeamOk35;
  return !!(s && s.v8 && Array.isArray(s.teams) && s.table && Array.isArray(s.rounds) && ok(s.team) && s.teams.every(ok));
 } catch (e) {
  return false;
 }
}

let season2503 = null;

let season35w = false;

if (season && !seasonOk(season)) {
 if (seasonShape2503(season)) {
  season2503 = season;
  season = null;
 } else if (!sk35off() && seasonLoose35(season)) {
  season2503 = season;
  season = null;
  season35w = true;
 } else {
  bak2503('season');
  season = null;
  LS.set('season', null);
 }
}

function seasonFix2503(S) {
 const used = new Set, swaps = {};
 const ids = S.rosters ? Object.values(S.rosters).flat() : S.draft ? S.draft.pool.concat(...Object.values(S.draft.rosters)) : [];
 try {
  if (window.HON25 && HON25.make && HON25.kindOf && (!HON25.on || HON25.on())) for (const id of ids) if (!PLAYERS[id] && HON25.kindOf(id)) HON25.make(id);
 } catch (e) {}
 ids.forEach(id => used.add(id));
 const free = pos => {
  let best = null;
  for (const t of TEAMS) for (const id of t.roster || []) {
   const p = PLAYERS[id];
   if (p && !used.has(id) && (!pos || p.pos === pos) && (!best || ovrOf(p) > ovrOf(best))) best = p;
  }
  return best;
 };
 const posOf = id => {
  const m = /^[A-Z]+\d*-(.+)$/.exec(String(id));
  const b = m && PLAYERS[m[1]];
  return b ? b.pos : null;
 };
 const need = (arr, t) => {
  const c = {};
  if (!S.base232 && typeof QUOTA === 'object') Object.assign(c, QUOTA); else for (const id of T(t) && T(t).roster || []) {
   const p = PLAYERS[id];
   if (p) c[p.pos] = (c[p.pos] || 0) + 1;
  }
  for (const id of arr) {
   const p = PLAYERS[id];
   if (p) c[p.pos] = (c[p.pos] || 0) - 1;
  }
  let best = null;
  for (const k in c) if (best == null || c[k] > c[best]) best = k;
  return best;
 };
 const fix = (arr, t) => {
  for (let i = arr.length - 1; i >= 0; i--) {
   const id = arr[i];
   if (PLAYERS[id]) continue;
   const p = free(posOf(id) || need(arr, t)) || free(null);
   if (p) {
    arr[i] = p.id;
    used.add(p.id);
    swaps[id] = p.id;
   } else arr.splice(i, 1);
  }
 };
 if (S.rosters) for (const t in S.rosters) if (Array.isArray(S.rosters[t])) fix(S.rosters[t], t);
 if (S.draft) {
  if (Array.isArray(S.draft.pool)) S.draft.pool = S.draft.pool.filter(id => !!PLAYERS[id]);
  for (const t in S.draft.rosters || {}) fix(S.draft.rosters[t], t);
 }
 const n = Object.keys(swaps).length;
 if (n && S.lineups) {
  const walk = o => {
   for (const k in o) {
    const v = o[k];
    if (typeof v === 'string' && swaps[v]) o[k] = swaps[v]; else if (v && typeof v === 'object') walk(v);
   }
  };
  walk(S.lineups);
 }
 return n;
}

document.addEventListener('DOMContentLoaded', () => {
 const S = season2503;
 season2503 = null;
 const w35 = season35w;
 season35w = false;
 try {
  if (!S || season) return;
  if (w35) {
   const ready = !!(window.V33 && V33.kindOf) && Object.keys(GH_REG).length > 0;
   if (!ready) {
    SK35.log.push('wait');
    return;
   }
   if (!seasonShape2503(S)) {
    SK35.log.push('bad');
    bak2503('season');
    LS.set('season', null);
    return;
   }
   const C = JSON.parse(JSON.stringify(S)), n = seasonFix2503(C);
   if (!n && JSON.stringify(C) === JSON.stringify(S) && seasonOk(C)) {
    season = S;
    SK35.log.push('keep');
    return;
   }
   SK35.log.push('fix:' + n);
  }
  bak2503('season', JSON.stringify(S));
  seasonFix2503(S);
  if (seasonOk(S)) {
   season = S;
   LS.set('season', S);
  }
 } catch (e) {
  console.error(e);
 } finally {
  try {
   restore35();
  } catch (e) {
   console.error(e);
  }
 }
});

function restore35() {
 if (sk35off() || season) return;
 const raw = localStorage.getItem('rl_season');
 if (raw && raw !== 'null') return;
 const bk = localStorage.getItem('rl_season_bak');
 if (!bk || bk === 'null') return;
 let h = 5381;
 for (let i = 0; i < bk.length; i++) h = (h * 33 ^ bk.charCodeAt(i)) >>> 0;
 const sig = bk.length + ':' + h;
 if (LS.get('sk35r', null) === sig) {
  SK35.log.push('restored-before');
  return;
 }
 let B = null;
 try {
  B = mig2313(mig2301(JSON.parse(bk)));
 } catch (e) {
  B = null;
 }
 if (!B || typeof B !== 'object' || B.online || !seasonShape2503(B)) {
  SK35.log.push('bak-bad');
  return;
 }
 seasonFix2503(B);
 if (!seasonOk(B)) {
  SK35.log.push('bak-bad');
  return;
 }
 season = B;
 LS.set('season', B);
 LS.set('sk35r', sig);
 SK35.log.push('restored');
}

let record = LS.get('record', {
 w: 0,
 l: 0
});

let game = null, camX = 0, fx = [];

const pointers = new Map;

let stick = null;

let shootP = null;

const PADW = 12;

const PACE = {
 run: 22,
 cut: 20,
 dBall: 19,
 dOff: 16,
 chase: 30
};

const SWIPE_PX = 25;

const GB = {
 scoop: 7,
 user: 28,
 userChase: 28,
 cpu: 25,
 react0: .5,
 react1: .75,
 fric: 48,
 cone: .55,
 chaseT: 1.6,
 cReact0: .35,
 cReact1: .55
};

const PIPE_P = .072;

const ENDX = FL - 5;

const FULL_POWER_S = .9;

const GZ = {
 x0: GX - 26,
 x1: GX + 32,
 y0: CY - 34,
 y1: CY + 34
};

const GCX = GX + 4;

const CORNER_NAMES = [ 'TOP LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'BOTTOM RIGHT' ];

function goalCornerAt(wx, wy) {
 if (wx < GZ.x0 || wx > GZ.x1 || wy < GZ.y0 || wy > GZ.y1) return -1;
 const top = wy < CY, left = wx < GCX;
 return (top ? 0 : 2) + (left ? 1 : 0);
}

function aimHi1812(cn) {
 return {
  left: cn % 2 === 1,
  top: cn < 2
 };
}

const cssPx = d => d * SCALE;

const MENU_SCREENS = [ 'menu', 'help', 'settings', 'pickTeam', 'pickOpp', 'season', 'matchup' ];

const GAME_SCREENS = [ 'pregame', 'faceoff', 'live', 'banner', 'cpu', 'defense', 'qbreak', 'final' ];

function gameInputOn() {
 return !!game && !paused && !tutAsk && GAME_SCREENS.includes(screen) || pmInputOn();
}

function pmInputOn() {
 return screen === 'playmaker' && !!PM && !paused;
}

function screenKey() {
 return screen + (paused ? '+P' : '');
}

let screenSeq = 0, screenChangedAt = 0, seenKey = 'menu';

let inputLockUntil = 0;

function watchScreen() {
 const k = screenKey();
 if (k !== seenKey) {
  const keepJoy = joy && /^(live|defense)$/.test(seenKey) && /^(live|defense)$/.test(k);
  seenKey = k;
  screenSeq++;
  screenChangedAt = now();
  inputLockUntil = now() + .25;
  for (const pt of pointers.values()) if (!(keepJoy && pt.id === joy.id)) pt.stale = true;
  if (joy && !keepJoy) joyRelease(true);
  if (keepJoy) {
   const jp = pointers.get(joy.id);
   if (jp) {
    jp.role = 'field';
    jp.screen = screen;
   }
  }
  shootP = null;
  stick = null;
 }
}

const SA2403 = {
 k: '',
 b: 0,
 l: 0,
 r: 0,
 db: 0,
 pb: 0,
 probe: null,
 env: null
};

function sa2403Env() {
 try {
  let p = SA2403.probe;
  if (!p) {
   p = SA2403.probe = document.createElement('div');
   p.setAttribute('aria-hidden', 'true');
   p.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
   document.body.appendChild(p);
  }
  const cs = getComputedStyle(p);
  SA2403.env = {
   b: parseFloat(cs.paddingBottom) || 0,
   l: parseFloat(cs.paddingLeft) || 0,
   r: parseFloat(cs.paddingRight) || 0
  };
 } catch (e) {
  SA2403.env = {
   b: 0,
   l: 0,
   r: 0
  };
 }
 return SA2403.env;
}

function sa2403Insets() {
 if (window.__rl_no2403 || window.__rl_v124gb) return {
  b: 0,
  l: 0,
  r: 0,
  src: 'off'
 };
 const f = window.__rl_safeb2403;
 if (f != null && f !== false) return typeof f === 'object' ? {
  b: +f.b || 0,
  l: +f.l || 0,
  r: +f.r || 0,
  src: 'flag'
 } : {
  b: +f || 0,
  l: 0,
  r: 0,
  src: 'flag'
 };
 const e = SA2403.env || sa2403Env();
 if (e.b > 0 || e.l > 0 || e.r > 0) return {
  b: e.b > 0 ? Math.max(e.b, 34) : 0,
  l: e.l,
  r: e.r,
  src: 'env'
 };
 const sc = window.screen, sw = sc && Math.max(sc.width, sc.height) || 0, sh = sc && Math.min(sc.width, sc.height) || 1;
 if (navigator.standalone === true && innerWidth > innerHeight && sw / sh >= 2) return {
  b: 34,
  l: 0,
  r: 0,
  src: 'ios-standalone'
 };
 return {
  b: 0,
  l: 0,
  r: 0,
  src: 'none'
 };
}

function sa2403() {
 const i = sa2403Insets(), k = i.src + i.b + '|' + i.l + '|' + i.r + '|' + W + '|' + SCALE + '|' + innerHeight + '|' + innerWidth;
 if (k === SA2403.k) return SA2403;
 SA2403.k = k;
 SA2403.src = i.src;
 SA2403.b = i.b;
 SA2403.l = i.l;
 SA2403.r = i.r;
 SA2403.db = 0;
 SA2403.pb = 0;
 if (i.b > 0) {
  let gap = 0;
  try {
   const r = cv.getBoundingClientRect();
   gap = Math.max(0, innerHeight - r.bottom);
  } catch (e) {}
  const css = Math.max(0, i.b - gap);
  SA2403.pb = Math.ceil(css);
  SA2403.db = css / SCALE;
 }
 try {
  if (SA2403.pb > 0 || document.body.classList.contains('sa2403')) {
   document.body.classList.toggle('sa2403', SA2403.pb > 0);
   document.body.style.setProperty('--sab2403', SA2403.pb + 'px');
  }
 } catch (e) {}
 return SA2403;
}

var SA2403B = null;

const SA2403BANDS = [ [ 47, 1 ], [ 58, 6 ], [ 88, 10 ], [ 116.5, 12 ], [ 127, 17 ], [ 135, 18 ] ];

function sa2403By(y) {
 const L = SA2403B;
 let o = 0;
 for (const b of SA2403BANDS) if (y >= b[0]) o = Math.min(b[1], Math.round(L * b[1] / 18));
 return y - o;
}

function sa2403Band(fn) {
 const s = sa2403(), L = s.db > 0 ? Math.min(18, Math.max(0, Math.ceil(H + 1 - (H - s.db)))) : 0;
 if (!L) return fn();
 SA2403B = L;
 try {
  return fn();
 } finally {
  SA2403B = null;
 }
}

function sa2403Dy(y, hh) {
 const s = sa2403();
 return s.db > 0 ? Math.max(0, Math.ceil(y + hh - (H - s.db))) : 0;
}

(function() {
 try {
  const st = document.createElement('style');
  st.textContent = 'body.sa2403 #panel{padding-bottom:max(6px,var(--sab2403,0px))}body.sa2403 #acct23{padding-bottom:max(10px,var(--sab2403,0px))}';
  document.head.appendChild(st);
 } catch (e) {}
 const re = () => {
  SA2403.env = null;
  SA2403.k = '';
 };
 for (const ev of [ 'resize', 'orientationchange', 'pageshow' ]) window.addEventListener(ev, () => {
  re();
  setTimeout(re, 400);
 });
})();

let uiSpecs = [];

const uiEls = new Map;

let uiDown = {
 seq: -1,
 t: -9
};

ui.addEventListener('pointerdown', () => {
 audioInit();
 uiDown = {
  seq: screenSeq,
  t: now()
 };
}, true);

function hit(key, x, y, w, h, fn, label) {
 if (screen === 'pmSave') return;
 if (SA2403B) y = sa2403By(y);
 uiSpecs.push({
  key: screenKey() + '|' + key,
  x: x,
  y: y,
  w: w,
  h: h,
  fn: fn,
  label: label || key
 });
}

function onUiClick(key, ev) {
 ev.preventDefault();
 ev.stopPropagation();
 const r = uiEls.get(key);
 if (!r) return;
 watchScreen();
 if (r.scr !== screenKey()) return;
 if (uiDown.t > now() - 1.5 && uiDown.seq !== screenSeq) return;
 audioInit();
 SFX.tap();
 r.fn();
 watchScreen();
}

function syncUI() {
 sa2403();
 const seen = new Set;
 for (const s of uiSpecs) {
  if (seen.has(s.key)) continue;
  seen.add(s.key);
  let r = uiEls.get(s.key);
  if (!r) {
   const el = document.createElement('button');
   el.type = 'button';
   el.className = 'hb';
   el.setAttribute('aria-label', s.label);
   el.dataset.k = s.key;
   const key = s.key;
   el.addEventListener('click', ev => onUiClick(key, ev));
   ui.appendChild(el);
   r = {
    el: el,
    st: ''
   };
   uiEls.set(s.key, r);
  }
  r.fn = s.fn;
  r.scr = s.key.split('|')[0];
  const st = 'left:' + (s.x / W * 100).toFixed(3) + '%;top:' + (s.y / H * 100).toFixed(3) + '%;width:' + (s.w / W * 100).toFixed(3) + '%;height:' + (s.h / H * 100).toFixed(3) + '%';
  if (r.st !== st) {
   r.el.style.cssText = st;
   r.st = st;
  }
 }
 for (const [k, r] of uiEls) if (!seen.has(k)) {
  r.el.remove();
  uiEls.delete(k);
 }
 try {
  qpc26Sync();
 } catch (e) {
  console.error(e);
 }
}

function toLogical(e) {
 const r = cv.getBoundingClientRect();
 const cx = e.clientX - r.left, cy = e.clientY - r.top;
 return {
  x: cx / r.width * W,
  y: cy / r.height * H,
  cx: cx,
  cy: cy,
  k: r.width / W
 };
}

function mateCss(p, k) {
 return {
  x: (p.x - Math.round(camX)) * k,
  y: (p.y - 6) * k
 };
}

function mateTapCss(p, k) {
 const s = mateCss(p, k), wc = W * k;
 s.off = s.x < 4 * k ? -1 : s.x > wc - 4 * k ? 1 : 0;
 s.x = clamp(s.x, 12 * k, wc - 12 * k);
 s.y = clamp(s.y, 24 * k, (H - 6) * k);
 if (s.off) {
  const ey = edgeY(p);
  if (ey != null) s.y = ey * k;
 }
 return s;
}

function edgeY(p) {
 const G = game;
 if (!G) return null;
 const key = Math.round(camX) + '|' + menuT.toFixed(3);
 if (!G.edgeLay || G.edgeLay.key !== key) {
  const lay = new Map;
  for (const side of [ -1, 1 ]) {
   const list = offMates().filter(q => (q.x - Math.round(camX) > W / 2 ? 1 : -1) === side).map(q => ({
    q: q,
    y: clamp(q.y - 6, 24, H - 6)
   })).sort((a, b) => a.y - b.y);
   for (let i = 1; i < list.length; i++) list[i].y = Math.max(list[i].y, list[i - 1].y + 12);
   const over = list.length ? list[list.length - 1].y - (H - 6) : 0;
   if (over > 0) for (const e of list) e.y = Math.max(24, e.y - over);
   for (let i = 1; i < list.length; i++) list[i].y = Math.max(list[i].y, list[i - 1].y + 12);
   for (const e of list) lay.set(e.q, e.y);
  }
  G.edgeLay = {
   key: key,
   lay: lay
  };
 }
 const y = G.edgeLay.lay.get(p);
 return y == null ? null : y;
}

function liveMates() {
 const G = game;
 if (!G || !canShoot()) return [];
 const list = G.players.filter(p => (p.team === 'O' || p.team === 'G2') && p !== G.carrier);
 if (G.clearing || G.carrier && G.carrier.x < MIDX) for (const f of G.farU || []) if (f.far && (f.role === 'D' || f.role === 'M' || f.role === 'G')) list.push(f);
 return list;
}

function dClearMates() {
 const G = game;
 if (!G || screen !== 'defense' || !G.ball || G.ball.state !== 'clear') return [];
 const h = G.dclear && G.dclear.holder;
 return G.players.filter(p => (p.team === 'O' || p.team === 'G2') && p !== h).concat(clearFarMates());
}

function offMates() {
 const G = game;
 if (!G) return [];
 let list = [];
 if (screen === 'live' && canShoot()) list = liveMates(); else if (screen === 'defense' && G.ball && G.ball.state === 'clear') list = dClearMates();
 return list.filter(p => {
  const sx = p.x - Math.round(camX);
  return sx < 4 || sx > W - 4;
 });
}

function drawEdgeMates() {
 for (const p of offMates()) {
  const sx = p.x - Math.round(camX), right = sx > W / 2, x = right ? W - 5 : 4, ey = edgeY(p), y = ey != null ? clamp(ey, 26, H - 8) : clamp(p.y - 6, 26, H - 8), col = '#7dff7a';
  for (let i = 0; i < 4; i++) {
   rect(right ? x - i : x + i - 3, y - i, 1, 2 * i + 1, col);
  }
  rect(right ? x - 7 : x + 1, y - 1, 3, 3, 'rgba(0,0,0,.5)');
 }
}

const TAP_PX = 25, MATE_PX = 50;

const CUT181 = {
 hit: .45,
 dur: 1.2,
 spd: 1.5
};

function clr26ok(G) {
 return !!G && !G.tutorial && !window.__rl_noclr26 && !window.__rl_v124gb;
}

function cut26Far(m) {
 const G = game;
 return clr26ok(G) && screen === 'live' && !!m && !!m.far && m.team === 'U' && (m.role === 'M' || m.role === 'D') && (G.farU || []).includes(m);
}

const LEASH26 = 34;

function leash26(G, d, sx, sy) {
 const m = markOf(d);
 return clr26ok(G) && !!m && rrOf(m) === 'A' && Math.hypot(m.x - sx, m.y - sy) > LEASH26;
}

function startCut181(m, ux, uy) {
 const G = game;
 if (!G || !m || m === G.carrier || !(G.players.includes(m) || cut26Far(m))) return false;
 m.cut181 = {
  ux: ux,
  uy: uy,
  until: G.t + CUT181.dur
 };
 m.callPick = null;
 m.pickSet = null;
 m.playT = null;
 m.playHold = null;
 G.cuts181 = (G.cuts181 || 0) + 1;
 tutFlag('cut181');
 SFX.tap();
 addFx('txt', m.x, m.y - 26, {
  s: 'CUT!',
  col: '#8fe3f0',
  life: .7
 });
 return true;
}

function cutTick181(p) {
 const G = game, c = p.cut181;
 if (!c) return false;
 if (G.t >= c.until || p === G.carrier) {
  p.cut181 = null;
  p.wander = 0;
  return false;
 }
 p.tx = p.x + c.ux * 30;
 p.ty = p.y + c.uy * 30;
 p.spd = PACE.cut * CUT181.spd;
 return true;
}

function s26() {
 return window.SHOT26 && SHOT26.on() ? SHOT26 : null;
}

const MATE231 = .7;

function atX231(c) {
 return !!c && c.x > GX - 4 && Math.abs(c.y - CY) < CREASE + 26;
}

function nearestMateCss(cx, cy, k, rad) {
 if (!canShoot()) return null;
 let best = null, bd = rad || MATE_PX;
 for (const p of liveMates()) {
  const s = mateTapCss(p, k), d = Math.hypot(s.x - cx, s.y - cy);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 return best;
}

let lastTap = null;

const JOY_DEAD = 6, JOY_MAX = 54;

let joy = null, joyLog = null;

function joyWanted() {
 return screen === 'live' || screen === 'defense';
}

function nearPassMate(pt) {
 const G = game;
 if (!G || !pt.k) return false;
 let list = [];
 if (screen === 'live' && canShoot()) list = liveMates(); else if (screen === 'defense' && G.ball && G.ball.state === 'clear') list = dClearMates();
 return list.some(p => {
  const s = mateTapCss(p, pt.k);
  return Math.hypot(s.x - pt.scx, s.y - pt.scy) < MATE_PX * .7;
 });
}

function joyStart(pt) {
 joy = {
  id: pt.id,
  ox: pt.scx,
  oy: pt.scy,
  ux: 0,
  uy: 0,
  m: 0,
  on: false,
  hist: [],
  lastSharp: -9,
  t0: now(),
  dead: nearPassMate(pt) ? 16 : JOY_DEAD
 };
 pt.joy = true;
}

function joyMove(pt) {
 if (!joy || joy.id !== pt.id) return;
 let vx = pt.cx - joy.ox, vy = pt.cy - joy.oy, d = Math.hypot(vx, vy);
 if (d > JOY_MAX) {
  joy.ox = pt.cx - vx / d * JOY_MAX;
  joy.oy = pt.cy - vy / d * JOY_MAX;
  vx = pt.cx - joy.ox;
  vy = pt.cy - joy.oy;
  d = JOY_MAX;
 }
 if (d < (joy.on ? JOY_DEAD : joy.dead || JOY_DEAD)) {
  if (joy.on) joyRelease(false);
  return;
 }
 const ux = vx / d, uy = vy / d, m = .3 + .7 * clamp((d - JOY_DEAD) / (JOY_MAX - JOY_DEAD), 0, 1);
 joy.d231 = d;
 joyApply(ux, uy, m);
}

function joyApply(ux, uy, m) {
 const G = game;
 if (!G || !joy) return;
 const t = now();
 joy.hist.push([ t, ux, uy ]);
 while (joy.hist.length > 2 && joy.hist[1][0] < t - .2) joy.hist.shift();
 const ref = joy.hist[0], dot = ref[1] * ux + ref[2] * uy;
 const had = !!(G.run && G.run.joy);
 joy.ux = ux;
 joy.uy = uy;
 joy.m = m;
 joy.on = true;
 pointers.get(joy.id) && (pointers.get(joy.id).swiped = true);
 if (had && croll231(t, ux, uy)) {
  joy.lastSharp = t;
  joy.hist = [ [ t, ux, uy ] ];
 } else if (!had) {
  setRun(ux, uy, !joy.started);
  joy.started = true;
 } else if (dot < .25 && t - joy.lastSharp > .35) {
  joy.lastSharp = t;
  joy.hist = [ [ t, ux, uy ] ];
  setRun(ux, uy, true);
 }
 if (G.run) {
  G.run.x = ux;
  G.run.y = uy;
  G.run.m = m;
  G.run.joy = true;
 }
 joyLog = {
  ux: +ux.toFixed(3),
  uy: +uy.toFixed(3),
  m: +m.toFixed(3)
 };
}

const ROLL231 = {
 win: .4,
 minDeg: 145,
 maxDeg: 220,
 maxStep: 70,
 back: 18,
 minR: 20,
 minN: 3,
 round: .55
};

function s231on() {
 return !window.__rl_no231 && !window.__rl_v124gb;
}

function croll231(t, ux, uy) {
 const G = game;
 if (!joy) return false;
 if (!s231on() || !G || screen !== 'live' || !G.carrier || !canShoot() || G.ball.state !== 'held' || (joy.d231 || 0) < ROLL231.minR) {
  joy.arc231 = null;
  return false;
 }
 const a = Math.atan2(uy, ux);
 let A = joy.arc231;
 if (!A || !A.length) {
  joy.arc231 = [ {
   t: t,
   th: a,
   ux: ux,
   uy: uy,
   s: 0,
   r: joy.d231
  } ];
  return false;
 }
 const L = A[A.length - 1];
 let d = a - L.th;
 d = Math.atan2(Math.sin(d), Math.cos(d));
 const dd = d * 180 / Math.PI;
 if (Math.abs(dd) > ROLL231.maxStep) {
  joy.arc231 = [ {
   t: t,
   th: a,
   ux: ux,
   uy: uy,
   s: 0,
   r: joy.d231
  } ];
  return false;
 }
 if (Math.abs(dd) < .5) {
  L.t = t;
  L.r = joy.d231;
  return false;
 }
 const s = dd > 0 ? 1 : -1;
 if (L.s && s !== L.s && Math.abs(dd) > ROLL231.back) {
  joy.arc231 = [ {
   t: t,
   th: a,
   ux: ux,
   uy: uy,
   s: 0,
   r: joy.d231
  } ];
  return false;
 }
 A.push({
  t: t,
  th: L.th + d,
  ux: ux,
  uy: uy,
  s: L.s || s,
  r: joy.d231
 });
 while (A.length >= 2 && A[1].t < t - ROLL231.win) A.shift();
 const cur = A[A.length - 1], s0 = A[0], sweep = Math.abs(cur.th - s0.th) * 180 / Math.PI;
 if (A.length < ROLL231.minN + 1 || sweep < ROLL231.minDeg || sweep > ROLL231.maxDeg) return false;
 {
  let r0 = 1e9, r1 = 0;
  for (const q of A) if (q.r != null) {
   r0 = Math.min(r0, q.r);
   r1 = Math.max(r1, q.r);
  }
  if (r1 > 0 && r0 / r1 < ROLL231.round) return false;
 }
 const c = G.carrier, f0 = Math.abs(s0.ux) > .2 ? s0.ux > 0 : c.f21 != null ? !!c.f21 : true, d0 = d8of(s0.ux, s0.uy);
 G.pre231 = [ s0.ux, s0.uy ];
 const r = doDodge('roll', ux, uy, cur.th - s0.th >= 0 ? 1 : -1);
 G.pre231 = null;
 joy.arc231 = null;
 if (!r) return false;
 c._r21 = {
  f0: f0,
  vx: ux,
  d0: d0
 };
 r.c231 = true;
 G.croll231 = (G.croll231 || 0) + 1;
 G.lastC231 = {
  sweep: Math.round(sweep),
  n: A.length,
  dt: +(t - s0.t).toFixed(3),
  d0: d0,
  f0: f0,
  h0: r.from,
  h1: r.to
 };
 fx = fx.filter(f => !(f.type === 'txt' && f.s === 'DODGE!' && f.t < .45));
 if (G.run) {
  G.run.x = ux;
  G.run.y = uy;
 }
 return true;
}

function joyRelease(end) {
 const G = game;
 if (joy) {
  joy.on = false;
  joy.m = 0;
  joy.arc231 = null;
 }
 if (G && G.run && G.run.joy) {
  G.run = null;
  G.stopFlash = .25;
  if (G.tutorial && G.tutorial.f.swiped && canShoot()) tutFlag('stopped');
 }
 if (end) joy = null;
}

function joyTick() {
 const G = game;
 if (!G || !joy || !joy.on) return;
 if (!pointers.has(joy.id)) {
  joy = null;
  return;
 }
 if (G.pset && screen === 'live') return;
 if (!G.run) {
  setRun(joy.ux, joy.uy, false);
  if (G.run) {
   G.run.m = joy.m;
   G.run.joy = true;
  }
 }
}

function tutFoT18() {
 const G = game, Tt = G && G.tutorial;
 if (!Tt || Tt.complete || screen !== 'faceoff') return false;
 return Tt.step === TUT_FO_STEP || Tt.step === TF181 || Tt.step === TV131.FORM || Tt.step === TV131.DOWN || Tt.step === TV131.WING;
}

function tutFoHold18() {
 if (navigator.webdriver && !window.__rl_tutread18) return false;
 const Tt = game && game.tutorial;
 return tutFoT18() && !(Tt.doneT > 0) && Tt.foRead18 !== Tt.step;
}

function inDown(id, e) {
 const p = toLogical(e);
 const pt = {
  id: id,
  sx: p.x,
  sy: p.y,
  scx: p.cx,
  scy: p.cy,
  k: p.k,
  ax: p.x,
  ay: p.y,
  x: p.x,
  y: p.y,
  cx: p.cx,
  cy: p.cy,
  t0: now(),
  moved: 0,
  screen: screen,
  zone: p.x < W / 2 ? 'L' : 'R',
  path: [ [ p.cx, p.cy ] ],
  mvT: now(),
  anc: [ p.cx, p.cy ]
 };
 pointers.set(id, pt);
 if (pt.zone === 'L' && joy && joy.id !== id && pointers.has(joy.id)) pt.zone = 'R';
 if (game && game.huddle && huddleOn()) game.huddle.skip = true;
 if (now() < inputLockUntil) {
  pt.stale = true;
  return;
 }
 if (screen === 'playmaker') {
  pt.role = 'pm';
  return pmDown(pt);
 }
 if (screen === 'faceoff') {
  if (tutFoHold18()) {
   game.tutorial.foRead18 = game.tutorial.step;
   game.tutorial.foReads18 = (game.tutorial.foReads18 || 0) + 1;
   pt.stale = true;
   try {
    SFX.tap();
   } catch (e) {}
   return;
  }
  pt.role = 'fo';
  return foPointerDown(pt);
 }
 if (screen === 'defense') {
  const G = game;
  if (G.ball.state !== 'clear') {
   const sw = dTapDefender(p.cx, p.cy, p.k);
   if (sw) {
    pt.role = 'dsw';
    pt.dsw = sw;
    if (pt.zone === 'L') joyStart(pt);
    return;
   }
  }
  if (G.ball.state === 'held' && G.dcar && (pt.zone === 'R' || dPickCss(p.cx, p.cy, p.k) === G.dcar)) {
   pt.role = 'dhold';
   pt.pad = pt.zone === 'R';
   G.dHold = {
    id: pt.id,
    t0: now()
   };
   if (pt.zone === 'L') joyStart(pt);
   return;
  }
  if (pt.zone === 'R' && G.ball.state !== 'held' && G.ball.state !== 'clear' && dLateTarget()) {
   pt.role = 'dhold';
   pt.pad = true;
   pt.late = true;
   return;
  }
  pt.role = 'field';
  if (pt.zone === 'L') joyStart(pt);
  return;
 }
 if (screen === 'live') {
  if (canShoot() && s26() && SHOT26.down(pt, p)) return;
  let cn = canShoot() && (!s26() || atX231(game.carrier)) ? goalCornerAt(p.x + Math.round(camX), p.y) : -1, xNo231 = false;
  if (cn >= 0 && s231on()) {
   if (!(window.V20 && V20.airReady && V20.airReady()) && nearestMateCss(pt.scx, pt.scy, pt.k, MATE_PX * MATE231)) {
    cn = -1;
    pt.goal231 = true;
    game.goalMate231 = (game.goalMate231 || 0) + 1;
   } else if (atX231(game.carrier) && !(game.carrier.pl && game.carrier.pl.id === 'LEG-0')) {
    cn = -1;
    xNo231 = true;
    game.xNoShot231 = (game.xNoShot231 || 0) + 1;
   }
  }
  if (canShoot() && cn < 0) {
   const m = nearestMateCss(pt.scx, pt.scy, pt.k);
   if (m) {
    const s = mateCss(m, pt.k);
    if (Math.hypot(s.x - pt.scx, s.y - pt.scy) < MATE_PX * .7) pt.mate = m;
    if (pt.zone === 'R' && (!m.far && game.players.includes(m) || cut26Far(m)) && Math.hypot(s.x - pt.scx, s.y - pt.scy) < MATE_PX * CUT181.hit) pt.cutMate = m;
   }
  }
  if (ballLive()) {
   const sw = gbTapMate(p.cx, p.cy, p.k);
   if (sw) {
    pt.role = 'gsw';
    pt.gsw = sw;
    if (pt.zone === 'L') joyStart(pt);
    return;
   }
  }
  if (cn >= 0 && !shootP) {
   shootP = {
    id: pt.id,
    corner: cn,
    t0: now(),
    sx: p.x,
    sy: p.y
   };
   pt.role = 'shoot';
   pt.cageStart = true;
  } else if (xNo231 && !pt.mate) {
   pt.role = 'xnone231';
   pt.cageStart = true;
  } else {
   pt.role = 'field';
   if (pt.zone === 'L') joyStart(pt);
  }
 } else pt.role = 'tap';
}

function inMove(id, e) {
 const pt = pointers.get(id);
 if (!pt) return;
 const p = toLogical(e);
 pt.moved = Math.max(pt.moved, Math.hypot(p.cx - pt.scx, p.cy - pt.scy));
 pt.x = p.x;
 pt.y = p.y;
 pt.cx = p.cx;
 pt.cy = p.cy;
 if (pt.path && pt.path.length < 120) pt.path.push([ p.cx, p.cy ]);
 if (pt.anc && Math.hypot(p.cx - pt.anc[0], p.cy - pt.anc[1]) > BULL.still) {
  pt.anc = [ p.cx, p.cy ];
  pt.mvT = now();
 }
 if (pt.role === 'shot26' && window.SHOT26) return SHOT26.move(pt);
 if (pt.stale || !gameInputOn()) return;
 if (pt.role === 'pm') return pmMove(pt);
 if (stick && stick.id === pt.id) {
  stick.x = p.x;
  stick.y = p.y;
  if (screen === 'faceoff') foStickMove();
 }
 if (pt.role === 'foDrag' && screen === 'faceoff') foDragMove(pt);
 if (screen === 'live' && pt.cutMate && !pt.cutDone && !pt.pickCalled && pt.moved >= DODGE.minPx && canShoot()) {
  const dx = p.cx - pt.scx, dy = p.cy - pt.scy, L = Math.hypot(dx, dy) || 1;
  if (startCut181(pt.cutMate, dx / L, dy / L)) {
   pt.cutDone = true;
   if (shootP && shootP.id === pt.id) shootP = null;
  }
 }
 if (shootP && shootP.id === pt.id && !pt.cp20) {
  const q = pt.path.length > 1 ? pt.path[pt.path.length - 2] : [ pt.scx, pt.scy ], stp = Math.hypot(p.cx - q[0], p.cy - q[1]);
  if (stp >= 5 || pt.moved >= 12) pt.cp20 = pt.cpAim || {
   corner: shootP.corner,
   held: now() - shootP.t0,
   x: q[0],
   y: q[1]
  }; else pt.cpAim = {
   corner: shootP.corner,
   held: now() - shootP.t0,
   x: q[0],
   y: q[1]
  };
 }
 if (screen === 'live' && pt.zone === 'R' && !pt.joy && pt.moved >= DODGE.minPx && !pt.dodgeStroke && canShoot()) {
  pt.dodgeStroke = true;
  if (shootP && shootP.id === pt.id) {
   shootP = null;
   pt.role = 'field';
  }
 }
 if (shootP && shootP.id === pt.id) {
  const cn = goalCornerAt(p.x + Math.round(camX), p.y);
  if (cn >= 0) shootP.corner = cn;
  shootP.sx = p.x;
  shootP.sy = p.y;
 }
 if (pt.role === 'dsw' && screen === 'defense' && pt.joy && pt.moved >= JOY_DEAD * 2) {
  pt.role = 'field';
  pt.dsw = null;
 }
 if (pt.role === 'gsw' && screen === 'live' && pt.joy && pt.moved >= JOY_DEAD * 2) {
  pt.role = 'field';
  pt.gsw = null;
 }
 if (pt.role === 'dhold' && screen === 'defense' && pt.joy && pt.moved >= JOY_DEAD * 2) {
  pt.role = 'field';
  if (game.dHold && game.dHold.id === pt.id) game.dHold = null;
 }
 if (pt.joy && joy && joy.id === pt.id && pt.role === 'field' && joyWanted()) joyMove(pt);
}

function inUp(id, e, cancel) {
 const pt = pointers.get(id);
 if (!pt) return;
 pointers.delete(id);
 if (e) {
  const p = toLogical(e);
  pt.moved = Math.max(pt.moved, Math.hypot(p.cx - pt.scx, p.cy - pt.scy));
 }
 if (joy && joy.id === pt.id) {
  const wasOn = joy.on || pt.swiped;
  joyRelease(true);
  if (wasOn) pt.swiped = true;
 }
 if (stick && stick.id === pt.id) stick = null;
 if ((pt.role === 'foWing' || pt.role === 'foDrag') && screen === 'faceoff' && game && game.fo) foPointerUp(pt);
 if (pt.role === 'shot26' && window.SHOT26) return SHOT26.up(pt, cancel);
 if (pt.stale || pt.screen !== screen || !gameInputOn()) {
  if (shootP && shootP.id === pt.id) shootP = null;
  return;
 }
 if (pt.role === 'pm') return pmUp(pt, cancel);
 const dur = now() - pt.t0, tap = !cancel && pt.moved < TAP_PX && !(pt.joy && (pt.swiped || dur > .6));
 const quick = !cancel && dur < .3 && pt.moved < TAP_PX;
 if (screen === 'live' && game && game.tutorial && tutIsCard(game.tutorial.step) && !cancel) {
  if (game.tutorial.doneT <= 0 && pt.t0 >= (game.tutorial.setAt || 0)) tutFlag(game.tutorial.step === 8 ? 'rules' : 'card');
  return;
 }
 if (screen === 'defense' && !cancel && game && h4Ok(game) && pt.zone === 'R' && !pt.joy && pt.moved >= DODGE.minPx && pt.path) {
  const sw = classifySwipe(pt.path, dur);
  if (sw) {
   const G = game, h = G.dclear.holder;
   G.h4 = (G.h4 || 0) + 1;
   toOffense(h, 'CARRY IT UP!');
   const r = screen === 'live' && canShoot() ? doDodge(sw.kind, sw.ux, sw.uy, sw.spin) : null;
   lastTap = {
    kind: sw.kind,
    ok: !!r,
    side: r ? r.side : null,
    gk: true
   };
   return;
  }
 }
 if (screen === 'live') {
  const sp = shootP && shootP.id === pt.id ? shootP : null;
  if (sp) shootP = null;
  if (pt.bullDone) {
   lastTap = {
    kind: 'bull',
    ok: true,
    res: game.lastBull ? game.lastBull.res : null
   };
   tut28Say(null, 'hold');
   return;
  }
  if (pt.role === 'gsw') {
   if (cancel || pt.swiped || pt.moved >= TAP_PX * 1.6 || dur > 1.2) {
    lastTap = {
     kind: 'none',
     why: 'switch cancelled'
    };
    return;
   }
   const to = pt.gsw, G = game;
   if (!to || !G.players.includes(to) || !ballLive()) {
    lastTap = {
     kind: 'none',
     why: 'switch gone'
    };
    return;
   }
   addFx('tap', pt.sx + Math.round(camX), pt.sy, {
    life: .35
   });
   lastTap = {
    kind: 'switch',
    to: to.idx,
    via: 'gb'
   };
   gbSwitchTo('ctrl', to);
   return;
  }
  if (pt.cutDone) {
   lastTap = {
    kind: 'cut',
    to: pt.cutMate ? pt.cutMate.idx : null
   };
   tut28Say(null, 'mate');
   return;
  }
  if (pt.pickCalled) {
   lastTap = {
    kind: 'pick',
    to: pt.mate ? pt.mate.idx : null
   };
   tut28Say(null, 'mate');
   return;
  }
  if (!cancel && pt.zone === 'R' && !pt.joy && (pt.moved >= DODGE.minPx || pt.dodgeStroke) && canShoot()) {
   if (e) {
    const p2 = toLogical(e);
    const lp = pt.path[pt.path.length - 1];
    if (!lp || lp[0] !== p2.cx || lp[1] !== p2.cy) pt.path.push([ p2.cx, p2.cy ]);
   }
   if (window.V20 && V20.cpStroke(pt)) return;
   const sw = classifySwipe(pt.path, tut28Len(dur) ? Math.min(dur, DODGE.maxDur) : dur);
   if (sw) {
    const r = doDodge(sw.kind, sw.ux, sw.uy, sw.spin);
    lastTap = {
     kind: sw.kind,
     ok: !!r,
     side: r ? r.side : null,
     dev: sw.dev,
     fromCage: !!pt.cageStart
    };
    tut28Say(sw);
    return;
   }
   lastTap = {
    kind: 'none',
    why: 'swipe not a dodge',
    fromCage: !!pt.cageStart
   };
   tut28Say(null, dur > 1.6 ? 'slow' : 'small');
   return;
  }
  if ((tap || quick) && !(sp && dur >= .3) && !(sp && window.V20 && V20.airReady && V20.airReady())) {
   const mate = nearestMateCss(pt.scx, pt.scy, pt.k, sp && s231on() ? MATE_PX * MATE231 : 0);
   if (mate) {
    lastTap = {
     kind: 'pass',
     to: mate.idx
    };
    addFx('tap', pt.sx + Math.round(camX), pt.sy, {
     life: .35
    });
    return throwPass(mate);
   }
  }
  if (sp) {
   if (!cancel && canShoot()) {
    lastTap = {
     kind: 'shot',
     corner: sp.corner
    };
    releaseShot(now() - sp.t0, sp.corner);
   }
   return;
  }
  if (pt.role === 'xnone231') {
   lastTap = {
    kind: 'none',
    why: 'cage at X (no shot)'
   };
   return;
  }
  if (pt.role === 'field' && tap && !pt.swiped) {
   lastTap = {
    kind: 'field'
   };
   addFx('tap', pt.sx + Math.round(camX), pt.sy, {
    life: .35
   });
   return liveTap();
  }
  return;
 }
 if (screen === 'defense') {
  const G = game;
  if (pt.role === 'dsw') {
   if (cancel || pt.swiped || pt.moved >= TAP_PX * 1.6 || dur > 1.2) {
    lastTap = {
     kind: 'none',
     why: 'switch cancelled'
    };
    return;
   }
   const to = pt.dsw;
   if (!to || !G.players.includes(to) || G.ball.state === 'clear') {
    lastTap = {
     kind: 'none',
     why: 'switch gone'
    };
    return;
   }
   addFx('tap', pt.sx + Math.round(camX), pt.sy, {
    life: .35
   });
   lastTap = {
    kind: 'switch',
    to: to.idx,
    via: 'tap'
   };
   dSwitchTo(to);
   return;
  }
  if (pt.role === 'dhold') {
   if (G.dHold && G.dHold.id === pt.id) G.dHold = null;
   if (cancel) return;
   const hit = dur >= DZ.hitHold, r = hit ? dHit() : dCheck();
   lastTap = {
    kind: hit ? 'hit' : 'check',
    r: r,
    pad: !!pt.pad
   };
   return;
  }
  if ((!tap || pt.swiped) && !(quick && G.ball.state === 'clear')) return;
  if (G.ball.state === 'clear') {
   let best = null, bd = MATE_PX;
   const h = G.dclear && G.dclear.holder;
   for (const q of dClearMates()) {
    if (q === h) continue;
    const s = mateTapCss(q, pt.k), d = Math.hypot(s.x - pt.scx, s.y - pt.scy);
    if (d < bd) {
     bd = d;
     best = q;
    }
   }
   if (best) {
    const bs = mateTapCss(best, pt.k);
    if (best.far || bs.off || best.x > MIDX - 40) tutFlag('anyMate');
    lastTap = {
     kind: 'clear',
     to: best.far ? 'far' : best.idx,
     off: !!bs.off
    };
    dThrowClear(best);
   } else if (G.run) {
    G.run = null;
    lastTap = {
     kind: 'stop'
    };
   }
   return;
  }
  const t = dPickCss(pt.scx, pt.scy, pt.k);
  addFx('tap', pt.sx + Math.round(camX), pt.sy, {
   life: .35
  });
  if (t && t.team === 'O') {
   lastTap = {
    kind: 'switch',
    to: t.idx
   };
   dSwitchTo(t);
   return;
  }
  if (t && t === G.dcar) {
   lastTap = {
    kind: 'check',
    r: dCheck()
   };
   return;
  }
  lastTap = {
   kind: 'field'
  };
  if (G.run) {
   G.run = null;
   G.stopFlash = .6;
   SFX.tap();
  }
  return;
 }
 if (pt.role === 'tap' && tap && dur < 1.2) onTap(pt.x, pt.y);
}

const HAS_TOUCH = 'ontouchstart' in window;

cv.addEventListener('touchstart', e => {
 if (!gameInputOn()) return;
 if (e.cancelable) e.preventDefault();
 audioInit();
 for (const t of e.changedTouches) inDown('t' + t.identifier, t);
}, {
 passive: false
});

cv.addEventListener('touchmove', e => {
 if (e.cancelable && gameInputOn()) e.preventDefault();
 for (const t of e.changedTouches) inMove('t' + t.identifier, t);
}, {
 passive: false
});

cv.addEventListener('touchend', e => {
 if (e.cancelable && gameInputOn()) e.preventDefault();
 for (const t of e.changedTouches) inUp('t' + t.identifier, t, false);
}, {
 passive: false
});

cv.addEventListener('touchcancel', e => {
 for (const t of e.changedTouches) inUp('t' + t.identifier, null, true);
}, {
 passive: false
});

cv.addEventListener('pointerdown', e => {
 if (HAS_TOUCH && e.pointerType === 'touch' || !gameInputOn()) return;
 audioInit();
 e.preventDefault();
 try {
  cv.setPointerCapture(e.pointerId);
 } catch (_) {}
 inDown('p' + e.pointerId, e);
});

cv.addEventListener('pointermove', e => {
 if (!(HAS_TOUCH && e.pointerType === 'touch')) inMove('p' + e.pointerId, e);
});

cv.addEventListener('pointerup', e => {
 if (!(HAS_TOUCH && e.pointerType === 'touch')) inUp('p' + e.pointerId, e, false);
});

cv.addEventListener('pointercancel', e => {
 if (!(HAS_TOUCH && e.pointerType === 'touch')) inUp('p' + e.pointerId, null, true);
});

document.addEventListener('touchmove', e => {
 if (e.cancelable && !(e.target.closest && e.target.closest('#ui'))) e.preventDefault();
}, {
 passive: false
});

document.addEventListener('gesturestart', e => {
 if (e.cancelable) e.preventDefault();
}, {
 passive: false
});

document.addEventListener('contextmenu', e => e.preventDefault());

function refsInit(G) {
 G.refs = [ {
  x: MIDX + 60,
  y: FT + 3,
  lo: MIDX - 20,
  hi: ENDX - 24,
  anim: 0
 }, {
  x: MIDX - 60,
  y: FB + 3,
  lo: DEND + 24,
  hi: MIDX + 20,
  anim: 0
 } ];
 G.refFlag = null;
 G.refFlagFor = null;
}

function updateRefs(G, dt) {
 if (!G.refs) refsInit(G);
 const b = G.ball;
 if (!b) return;
 for (const r of G.refs) {
  const tx = clamp(b.x + (r.y < CY ? -18 : 18), r.lo, r.hi), dx = tx - r.x;
  const mv = clamp(dx, -38 * dt, 38 * dt);
  r.x += mv;
  r.anim = Math.abs(dx) > 2 ? r.anim + dt * 40 : 0;
 }
 const call = G.ruleCall && !G.ruleCall.flagged ? G.ruleCall : G.penPending && !G.penPending.flagged ? G.penPending : null;
 if (call && G.refFlagFor !== call) {
  G.refFlagFor = call;
  call.flagged = true;
  const r = G.refs.slice().sort((p, q) => Math.abs(p.x - b.x) - Math.abs(q.x - b.x))[0];
  G.refFlag = {
   r: r,
   t: 0,
   tx: clamp(b.x, 20, FL - 20),
   ty: clamp(b.y, FT + 10, FB - 6)
  };
  G.refFlags = (G.refFlags || 0) + 1;
  SFX.whistle();
 }
 if (G.refFlag) {
  G.refFlag.t += dt;
  if (G.refFlag.t > 4) G.refFlag = null;
 }
}

function drawRef(r, throwing) {
 const x = Math.round(r.x), y = Math.round(r.y), stp = Math.floor(r.anim / 3) % 2, out = '#0d0d0d', skin = '#f0c090';
 rect(x - 3, y, 7, 2, 'rgba(0,0,0,.25)');
 rect(x - 2, y - 3 + (stp ? 1 : 0), 2, 3 - (stp ? 1 : 0), out);
 rect(x + 1, y - 3 + (stp ? 0 : 1), 2, 3 - (stp ? 0 : 1), out);
 rect(x - 3, y - 5, 7, 2, '#111');
 rect(x - 4, y - 10, 9, 6, out);
 for (let i = 0; i < 7; i++) rect(x - 3 + i, y - 10, 1, 5, i % 2 ? '#111' : '#f4f4f4');
 if (throwing) {
  rect(x + 4, y - 15, 1, 6, '#f4f4f4');
 } else {
  rect(x - 5, y - 9, 1, 3, '#f4f4f4');
  rect(x + 5, y - 9, 1, 3, '#f4f4f4');
 }
 rect(x - 2, y - 14, 5, 4, skin);
 rect(x - 2, y - 15, 5, 2, '#111');
}

function drawRefs() {
 const G = game;
 if (!G || !G.refs || screen === 'pregame' || screen === 'qbreak' || screen === 'final') return;
 const F = G.refFlag;
 for (const r of G.refs) if (!r.v14down) drawRef(r, F && F.r === r && F.t < .35);
 if (F) {
  const k = clamp(F.t / .9, 0, 1), sx = F.r.x + 4, sy = F.r.y - 15;
  const fx2 = sx + (F.tx - sx) * k, fy2 = sy + (F.ty - sy) * k - Math.sin(k * Math.PI) * 26;
  const fxr = Math.round(fx2), fyr = Math.round(fy2);
  rect(fxr - 3, fyr - 3, 7, 5, '#0d0d0d');
  rect(fxr - 2, fyr - 2, 5, 3, '#ffd200');
  px(fxr - 2, fyr - 2, '#fff6a0');
  if (k >= 1) rect(Math.round(F.tx) - 2, Math.round(F.ty), 5, 1, 'rgba(0,0,0,.3)');
 }
}

const RL_R = GX - 150, RL_L = DGX + 150;

function rrOf(p) {
 if (p.rr) return p.rr;
 if (p.gk) return 'G';
 if (screen === 'defense') return p.team === 'D' ? p.idx <= 2 ? 'M' : 'A' : p.idx <= 2 ? 'M' : 'D';
 return p.team === 'O' ? p.idx <= 2 ? 'M' : 'A' : p.idx <= 2 ? 'M' : 'D';
}

function setRoles(list, roles) {
 list.forEach((p, i) => {
  p.rr = roles[Math.min(i, roles.length - 1)];
  p.push = false;
 });
}

function farMk(team, role, x, y, pl) {
 return {
  team: team,
  role: role,
  x: x,
  y: y,
  tx: x,
  ty: y,
  rest: [ x, y ],
  pl: pl || null,
  anim: 0,
  far: true,
  mk: null
 };
}

function farPair(G) {
 const rU = (G.farU || []).filter(f => f.role === 'A' || f.role === 'R'), rC = (G.farC || []).filter(f => f.role === 'A' || f.role === 'R');
 const dU = (G.farU || []).filter(f => f.role === 'D' || f.role === 'M'), dC = (G.farC || []).filter(f => f.role === 'D' || f.role === 'M');
 dU.forEach((d, i) => {
  d.mk = rC[i] || null;
 });
 dC.forEach((d, i) => {
  d.mk = rU[i] || null;
 });
}

function farInit(mode) {
 const G = game;
 if (!G || !G.lu) return;
 const L0 = G.lu[0], L1 = G.lu[1], ys = [ CY - 44, CY, CY + 44 ];
 const third = L => PP(L.A[2] || L.M[2] || L.A[0]);
 if (mode === 'uO') {
  G.farC = ys.map((y, i) => farMk('C', 'A', MIDX - 44 - (i === 1 ? 16 : 0), y + rnd(-4, 4), PP(L1.A[i])));
  G.farU = G.farC.map((a, i) => farMk('U', 'D', a.x - 11, a.y + (CY - a.y) * .1, PP(L0.D[i])));
  G.farU.push(farMk('U', 'G', DGX + 5, CY, PP(L0.G)));
 } else if (mode === 'cO') {
  G.farU = ys.map((y, i) => farMk('U', 'A', MIDX + 44 + (i === 1 ? 16 : 0), y + rnd(-4, 4), PP(L0.A[i])));
  G.farC = G.farU.map((a, i) => farMk('C', 'D', a.x + 11, a.y + (CY - a.y) * .1, PP(L1.D[i])));
  G.farC.push(farMk('C', 'G', GX - 5, CY, PP(L1.G)));
 } else if (mode === 'fo') {
  G.farU = [ [ RL_L - 30, CY - 30 ], [ RL_L - 30, CY + 30 ], [ RL_L - 46, CY ] ].map((q, i) => farMk('U', 'D', q[0], q[1], PP(L0.D[i]))).concat([ [ RL_R + 20, CY - 34 ], [ RL_R + 20, CY + 34 ], [ RL_R + 34, CY ] ].map((q, i) => farMk('U', 'A', q[0], q[1], PP(L0.A[i]))));
  G.farC = [ [ RL_R + 30, CY - 30 ], [ RL_R + 30, CY + 30 ], [ RL_R + 46, CY ] ].map((q, i) => farMk('C', 'D', q[0], q[1], PP(L1.D[i]))).concat([ [ RL_L - 20, CY - 34 ], [ RL_L - 20, CY + 34 ], [ RL_L - 34, CY ] ].map((q, i) => farMk('C', 'A', q[0], q[1], PP(L1.A[i]))));
 }
 G.farMode = mode;
 farPair(G);
}

function attSpot181(f) {
 const G = game, L = (G.farU || []).filter(q => q.role === 'A' || q.role === 'R'), i = Math.max(0, L.indexOf(f)), S = curSpots(), s = S[3 + i % 3] || S[S.length - 1] || [ MIDX + 120, CY ];
 return [ clamp(s[0], MIDX + 30, GX + 20), clamp(s[1], FT + 14, FB - 6) ];
}

function unstack46(dt) {
 const G = game;
 if (!G || !G.players || window.__rl_no46 || window.__rl_v124gb || G.tutorial) return;
 const car = screen === 'live' ? G.carrier : G.dcar, me = screen === 'live' ? G.ctrl : G.dctl, k = Math.min(2, 60 * dt);
 const fixed = p => p === car || p === me || p.gk || p.team === 'G' || p.team === 'G2' || p.role === 'G' || p.down > 0 || p.fo;
 const s23 = s2302on(), carU = !!car && (car.team === 'O' || car.team === 'G2'), b0 = G.ball;
 const loose23 = !!b0 && (b0.state === 'loose' || b0.state === 'chase');
 for (let it = 0; it < (s23 ? 3 : 1); it++) {
  let moved = 0;
  for (const L of [ G.players.filter(p => p.team === 'O' || p.team === 'G2').concat(G.farU || []), G.players.filter(p => p.team === 'D' || p.team === 'G').concat(G.farC || []) ]) {
   for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const a = L[i], b = L[j];
    let dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const R = s23 ? spread2302(G, a, b, car, carU, loose23) : 8, Ry = s23 && R > 8 && !!car && (a.team === 'O' || a.team === 'G2' || a.team === 'U') === carU ? 18 : R;
    if (s23 ? Math.hypot(dx / R, dy / Ry) >= 1 : d >= R) continue;
    const fa = fixed(a), fb = fixed(b);
    if (fa && fb) continue;
    if (s23 && d >= 8 && !fa && !fb && swap2302(G, a, b, car, me)) continue;
    const rdx = dx, rdy = dy;
    if (d < .01) {
     dx = 0;
     dy = j % 2 ? 1 : -1;
    } else {
     dx /= d;
     dy /= d;
    }
    const yOnly = on193(G) && !a.far && !b.far;
    const need = !s23 ? R - d : yOnly ? Ry * Math.sqrt(Math.max(0, 1 - rdx / R * (rdx / R))) - Math.abs(rdy) : d < .01 ? Ry : 1 / Math.hypot(dx / R, dy / Ry) - d;
    const push = Math.min(k, Math.max(0, need) / (fa || fb ? 1 : 2));
    if (yOnly) {
     dx = 0;
     dy = b.y >= a.y ? 1 : -1;
    }
    if (s23 && dx === 0) {
     const xs = b.x >= a.x ? 1 : -1;
     if (!fa && (a.y - dy * push < FT + 6 || a.y - dy * push > FB - 2)) {
      a.x -= xs * push;
      a.y += dy * push;
      G.side2302 = (G.side2302 || 0) + 1;
     }
     if (!fb && (b.y + dy * push < FT + 6 || b.y + dy * push > FB - 2)) {
      b.x += xs * push;
      b.y -= dy * push;
      G.side2302 = (G.side2302 || 0) + 1;
     }
    }
    if (!fa) {
     a.x -= dx * push;
     a.y -= dy * push;
    }
    if (!fb) {
     b.x += dx * push;
     b.y += dy * push;
    }
    for (const p of [ a, b ]) {
     p.y = clamp(p.y, FT + 6, FB - 2);
     if (p.far) {
      const nx = p.team === 'U' ? p.role === 'A' || p.role === 'R' ? Math.max(p.x, MIDX + 4) : Math.min(p.x, MIDX - 4) : p.role === 'A' || p.role === 'R' ? Math.min(p.x, MIDX - 4) : Math.max(p.x, MIDX + 4);
      if (Math.abs(nx - p.x) > 2 && tp2403on(G) && !H7on()) {
       if (!p.rb2403) G.tp2403n = (G.tp2403n || 0) + 1;
       p.rb2403 = true;
      } else h7snap(p, nx, p.y);
     }
    }
    G.unst46 = (G.unst46 || 0) + 1;
    if (d >= 8) G.unst2302 = (G.unst2302 || 0) + 1;
    moved++;
   }
  }
  if (!moved) break;
 }
}

function s2302on() {
 return !window.__rl_no2302 && !window.__rl_no46 && !window.__rl_v124gb;
}

function spread2302(G, a, b, car, carU, loose) {
 if (loose || a.pickSet || b.pickSet || a.callPick || b.callPick || a.fo || b.fo) return 8;
 if (car && a !== car && b !== car) {
  const aU = a.team === 'O' || a.team === 'G2' || a.team === 'U';
  if (aU !== carU && Math.hypot(a.x - car.x, a.y - car.y) < 18 && Math.hypot(b.x - car.x, b.y - car.y) < 18) return 8;
 }
 return 13;
}

function swap2302(G, a, b, car, me) {
 if (a.far || b.far || a === car || b === car || a === me || b === me) return false;
 const free = p => !p.playT && !p.playHold && !p.callPick && !p.pickSet && !(p.coverT > 0) && !(p.down > 0) && !p.gk && G.help18 !== p && !(typeof isChaser === 'function' && isChaser(p));
 if (!free(a) || !free(b)) return false;
 const off = screen === 'live' ? 'O' : 'D';
 if (a.team !== off || b.team !== off) return false;
 const ta = screen === 'live' ? [ a.tx, a.ty ] : a.tgt, tb = screen === 'live' ? [ b.tx, b.ty ] : b.tgt;
 if (!ta || !tb) return false;
 if (!((ta[1] - tb[1]) * (a.y - b.y) < 0 && Math.abs(ta[1] - tb[1]) > 10)) return false;
 if (screen === 'live') {
  const t = [ a.tx, a.ty ];
  a.tx = b.tx;
  a.ty = b.ty;
  b.tx = t[0];
  b.ty = t[1];
  const w = a.wander;
  a.wander = b.wander;
  b.wander = w;
 } else {
  const t = a.tgt;
  a.tgt = b.tgt;
  b.tgt = t;
  const w = a.wt;
  a.wt = b.wt;
  b.wt = w;
 }
 if (rrOf(a) === 'A' === (rrOf(b) === 'A') && a.home && b.home) {
  const h = a.home;
  a.home = b.home;
  b.home = h;
  if (screen === 'live') {
   const ix = a.idx;
   a.idx = b.idx;
   b.idx = ix;
  }
 }
 G.swap2302 = (G.swap2302 || 0) + 1;
 return true;
}

function fbPlan222(G, c, b, offT, defT, gx, dir, excl) {
 if (!G || window.__rl_no222f1 || window.__rl_v124gb || G.tutorial || G.brave || G.practice || !c || !b) return null;
 if (!(b.state === 'held' || b.state === 'pass')) {
  G.fb222 = null;
  return null;
 }
 const ref = b.state === 'pass' && b.to ? b.to : c;
 if ((ref.x - MIDX) * dir < 0 || Math.abs(ref.x - gx) < 6) {
  G.fb222 = null;
  return null;
 }
 const offs = G.players.filter(p => p.team === offT && !p.gk && !(p.down > 0));
 const att = offs.filter(p => (p.x - ref.x) * dir > -30 && (p.x - MIDX) * dir > -6);
 const defs = G.players.filter(p => p.team === defT && !p.gk && !(p.down > 0));
 const back = defs.filter(p => (p.x - ref.x) * dir > -4);
 if (att.length < 2 || !back.length || back.length >= att.length || back.length > 4 || defs.length <= back.length) {
  G.fb222 = null;
  return null;
 }
 const prev = G.fb222;
 G.fb222 = {
  n: back.length,
  a: att.length,
  t: prev ? prev.t : 0
 };
 G.fbFrames222 = (G.fbFrames222 || 0) + 1;
 const plan = new Map, sp = PACE.dBall * 1.15;
 const goalW = (x, y, k, deep) => {
  const dx = gx - x, dy = CY - y, L = Math.hypot(dx, dy) || 1;
  let tx = x + dx / L * k, ty = y + dy / L * k;
  if (deep && (gx - tx) * dir > deep) tx = gx - dir * deep;
  const ex = tx - gx, ey = ty - CY, ed = Math.hypot(ex, ey), R = CREASE + 5;
  if (ed < R) {
   tx = gx + (ed ? ex / ed * R : -dir * R);
   ty = CY + (ed ? ey / ed * R : 0);
  }
  return [ tx, ty ];
 };
 const others = att.filter(p => p !== ref).sort((p, q) => Math.hypot(p.x - gx, p.y - CY) - Math.hypot(q.x - gx, q.y - CY));
 const catcher = b.state === 'pass' && b.to && !b.intercept ? b.to : null;
 const use = back.filter(d => d !== excl);
 if (back.length === 1) {
  const d = back[0];
  if (d === excl) return plan;
  if (catcher) {
   plan.set(d, [ catcher.x + dir * 6, catcher.y, sp * 1.1 ]);
   return plan;
  }
  const o = others[0];
  const w = .45;
  const q = goalW(ref.x + (o.x - ref.x) * w, ref.y + (o.y - ref.y) * w, 7, 72);
  plan.set(d, [ q[0], q[1], sp ]);
  return plan;
 }
 const top = back.slice().sort((p, q) => Math.hypot(p.x - ref.x, p.y - ref.y) - Math.hypot(q.x - ref.x, q.y - ref.y))[0];
 const rest = back.filter(d => d !== top);
 const offb = others.slice(0, rest.length + 1).sort((p, q) => p.y - q.y);
 if (top !== excl) {
  const q = goalW(ref.x, ref.y, 5, 100);
  plan.set(top, [ q[0] + dir * 2, q[1], sp ]);
 }
 const slots = [];
 if (offb.length <= rest.length) for (const o of offb) slots.push(goalW(o.x, o.y, 6, 66)); else if (offb.length === rest.length + 1) for (let j = 0; j < rest.length; j++) {
  const a = offb[j], z = offb[j + 1];
  slots.push(goalW((a.x + z.x) / 2, (a.y + z.y) / 2, 8, 62));
 } else {
  const k = rest.length, m = offb.length;
  for (let j = 0; j < k; j++) {
   const g0 = offb.slice(Math.floor(j * m / k), Math.floor((j + 1) * m / k));
   slots.push(goalW(g0.reduce((s, p) => s + p.x, 0) / g0.length, g0.reduce((s, p) => s + p.y, 0) / g0.length, 8, 62));
  }
 }
 const free = rest.slice();
 const used = new Set;
 if (catcher && catcher !== ref) {
  let bd = null, bdd = 1e9;
  for (const d of rest) {
   const dd = Math.hypot(d.x - catcher.x, d.y - catcher.y);
   if (dd < bdd) {
    bdd = dd;
    bd = d;
   }
  }
  if (bd) {
   used.add(bd);
   if (bd !== excl) plan.set(bd, [ catcher.x + dir * 6, catcher.y, sp * 1.1 ]);
  }
 }
 for (const s of slots) {
  let bd = null, bdd = 1e9;
  for (const d of free) {
   if (used.has(d)) continue;
   const dd = Math.hypot(d.x - s[0], d.y - s[1]);
   if (dd < bdd) {
    bdd = dd;
    bd = d;
   }
  }
  if (!bd) break;
  used.add(bd);
  if (bd !== excl) plan.set(bd, [ s[0], s[1], sp ]);
 }
 return plan;
}

function on193(G) {
 return !!G && !window.__rl_v124gb && !window.__rl_no193 && !G.tutorial && !G.brave && G.farMode !== 'fo' && (screen === 'live' || screen === 'defense') && !!G.players && !G.over;
}

function free193(list) {
 const used = new Set(list.map(p => p.idx));
 for (let i = 0; i < 6; i++) if (!used.has(i)) return i;
 return null;
}

function trn193(G, why) {
 if (!on193(G)) return false;
 const live = screen === 'live', b = G.ball;
 if (!b) return false;
 const offT = live ? 'O' : 'D', defT = live ? 'D' : 'O', offS = live ? 'U' : 'C', defS = live ? 'C' : 'U';
 const offK = live ? 'farU' : 'farC', defK = live ? 'farC' : 'farU';
 G.farU = G.farU || [];
 G.farC = G.farC || [];
 const car = live ? G.carrier : G.dcar, me = live ? G.ctrl : G.dctl;
 const ride = f => f.role === 'A' || f.role === 'R';
 const penOn = s => !!(G.pen && G.pen.side === s && !G.penPending);
 let fixes = 0;
 const fl = [];
 const fx = t => {
  fixes++;
  fl.push(t);
 };
 for (const K of [ 'farU', 'farC' ]) {
  const seen = new Set;
  G[K] = G[K].filter(f => {
   if (seen.has(f) || G.players.includes(f)) {
    fx('f1');
    return false;
   }
   seen.add(f);
   return true;
  });
 }
 const SP = live ? curSpots() : null;
 const cpuHome = i => {
  const sp = (SETS[G.cpuSet] || SETS[SET_NAMES[0]])[i] || [ FL - MIDX - 40, CY ];
  return [ FL - sp[0], sp[1] ];
 };
 const nearOff = () => G.players.filter(p => p.team === offT && !p.r26), nearDef = () => G.players.filter(p => p.team === defT && !p.r26);
 const r26n = G.players.filter(p => p.r26).length;
 const want = s => 6 - (penOn(s) ? 1 : 0);
 const onOff = (f, role) => {
  const L = nearOff(), i = free193(L);
  if (i == null || G.players.filter(p => p.team === offT).length >= want(offS)) return false;
  const k = G[offK].indexOf(f);
  if (k < 0) return false;
  G[offK].splice(k, 1);
  const x = live ? Math.max(f.x, MIDX + 6) : Math.min(f.x, MIDX - 6), a = mkPlayer(offT, i, x, f.y);
  a.pl = f.pl;
  a.anim = f.anim || 0;
  a.rr = role;
  if (H7on()) {
   a.h7v = f.x - x + (f.h7v || 0);
   a.h7w = f.h7w || 0;
  }
  if (f.down > 0) {
   a.down = f.down;
   a.downT0 = f.downT0;
   a.fallDir = f.fallDir;
  }
  if (live) {
   a.home = (SP[role === 'A' ? 3 + i % 3 : i % 3] || SP[i] || [ MIDX + 60, CY ]).slice();
   a.tx = a.home[0];
   a.ty = a.home[1];
   a.wander = .3;
   a.spd = PACE.cut * 1.1;
  } else {
   a.home = cpuHome(role === 'A' ? 3 + i % 3 : i % 3);
   a.wt = rnd(.2, .8);
   a.tgt = a.home.slice();
  }
  const d = nearDef().find(q => !q.mark || !G.players.includes(q.mark));
  if (d) {
   d.mark = a;
   a.mark0 = d;
  }
  G.players.push(a);
  fx('f2');
  return true;
 };
 const onDef = f => {
  const L = nearDef(), i = free193(L);
  if (i == null || G.players.filter(p => p.team === defT).length >= want(defS)) return false;
  const k = G[defK].indexOf(f);
  if (k < 0) return false;
  G[defK].splice(k, 1);
  const x = live ? Math.max(f.x, MIDX + 4) : Math.min(f.x, MIDX - 4), d = mkPlayer(defT, i, x, f.y);
  d.pl = f.pl;
  d.anim = f.anim || 0;
  if (H7on()) {
   d.h7v = f.x - x + (f.h7v || 0);
   d.h7w = f.h7w || 0;
  }
  if (f.down > 0) {
   d.down = f.down;
   d.downT0 = f.downT0;
   d.fallDir = f.fallDir;
  }
  const free = nearOff().filter(a => !G.players.some(q => q.team === defT && q.mark === a)).sort((a, q) => live ? q.x - a.x : a.x - q.x)[0];
  d.mark = free || car || null;
  if (free) free.mark0 = d; else d.hole = true;
  d.rr = free && rrOf(free) === 'A' ? 'D' : 'M';
  d.react = rnd(.1, .3);
  G.players.push(d);
  fx('f3');
  return true;
 };
 const toFar = (p, K, team, role, x) => {
  const k = G.players.indexOf(p);
  if (k < 0) return null;
  G.players.splice(k, 1);
  const f = farMk(team, role, x, p.y, p.pl);
  f.anim = p.anim || 0;
  if (p.down > 0) {
   f.down = p.down;
   f.downT0 = p.downT0;
   f.fallDir = p.fallDir;
  }
  G[K].push(f);
  for (const q of G.players) {
   if (q.mark === p) q.mark = null;
   if (q.mark0 === p) q.mark0 = null;
  }
  if (G.dctl === p) G.dctl = null;
  if (G.ctrl === p) G.ctrl = null;
  if (G.dSlide === p) G.dSlide = null;
  if (G.hotP === p) G.hotP = null;
  fx('f4');
  return f;
 };
 const gkHome = live ? G.farU.some(f => f.role === 'G') || G.players.some(p => p.team === 'G2' && p.x < MIDX) : G.farC.some(f => f.role === 'G') || G.players.some(p => p.team === 'G' && p.x > MIDX);
 const backWant = 3 + (gkHome ? 0 : 1);
 for (const f of G[offK].filter(ride)) {
  if (nearOff().length < want(offS) && onOff(f, 'A')) continue;
  f.role = 'M';
  f.stay = true;
  f.mk = null;
  f.x = tpx2403(G, f, live ? Math.min(f.x, MIDX - 6) : Math.max(f.x, MIDX + 6));
  fx('f5');
 }
 {
  const backs = () => G[offK].filter(f => f.role === 'D' || f.role === 'M');
  while (backs().length > backWant && nearOff().length < want(offS)) {
   const f = backs().sort((p, q) => (p.role === 'M' ? 0 : 1) - (q.role === 'M' ? 0 : 1))[0];
   if (!onOff(f, 'M')) break;
  }
 }
 {
  const backs = () => G[offK].filter(f => f.role === 'D' || f.role === 'M');
  while (backs().length < backWant && nearOff().length > 3) {
   const m = nearOff().filter(p => p !== car && p !== me && rrOf(p) !== 'A' && !p.gk && !(p.down > 0) && !isChaser(p)).sort((p, q) => live ? p.x - q.x : q.x - p.x)[0];
   if (!m) break;
   const f = toFar(m, offK, offS, 'M', tpx2403(G, m, live ? Math.min(m.x, MIDX - 6) : Math.max(m.x, MIDX + 6)));
   if (!f) break;
   f.stay = true;
   if (m.rb2403) {
    f.rb2403 = true;
    m.rb2403 = false;
   }
  }
 }
 for (const f of G[defK].filter(f => f.role === 'D' || f.role === 'M')) {
  if (nearDef().length < want(defS)) onDef(f);
 }
 while (G[defK].filter(ride).length + r26n > 3) {
  const rs = G[defK].filter(ride), f = rs.sort((p, q) => (p.role === 'R' ? 0 : 1) - (q.role === 'R' ? 0 : 1))[0];
  if (nearDef().length < want(defS)) {
   if (!onDef(f)) break;
  } else {
   f.role = 'D';
   f.rest = null;
   fx('f6');
   break;
  }
 }
 {
  const rs = G[defK].filter(ride).length + r26n, nd = nearDef(), no = nearOff().length;
  if (rs < 3 && nd.length > no) {
   const sp = nd.filter(d => d !== me && !(d.down > 0) && !isChaser(d) && (!d.mark || !G.players.includes(d.mark) || d.hole)).sort((p, q) => live ? p.x - q.x : q.x - p.x)[0];
   if (sp) {
    const fr = toFar(sp, defK, defS, 'R', tpx2403(G, sp, live ? Math.min(sp.x, MIDX - 4) : Math.max(sp.x, MIDX + 4)));
    if (fr && sp.rb2403) {
     fr.rb2403 = true;
     sp.rb2403 = false;
    }
   }
  }
 }
 {
  const L = nearOff().filter(p => p !== car || true), att = L.filter(p => rrOf(p) === 'A');
  if (att.length > 3) for (const p of att.slice(3)) {
   if (p !== car) {
    p.rr = 'M';
    fx('f7');
   }
  } else if (att.length < 3 && L.length >= 4) {
   const cand = L.filter(p => rrOf(p) !== 'A' && p !== car && !p.gk && !p.push).sort((p, q) => live ? q.x - p.x : p.x - q.x);
   for (const p of cand.slice(0, 3 - att.length)) {
    p.rr = 'A';
    fx('f8');
   }
  }
  const used = new Map;
  for (const p of nearOff()) {
   if (p === car || !p.home) continue;
   const key = Math.round(p.home[0] / 12) + ':' + Math.round(p.home[1] / 12);
   if (used.has(key)) {
    const all = live ? SP : [ 0, 1, 2, 3, 4, 5 ].map(cpuHome);
    const att2 = rrOf(p) === 'A';
    const opts = (att2 ? [ 3, 4, 5, 0, 1, 2 ] : [ 0, 1, 2, 3, 4, 5 ]).map(i => all[i]).filter(Boolean);
    const sp = opts.find(s => !used.has(Math.round(s[0] / 12) + ':' + Math.round(s[1] / 12)));
    if (sp) {
     p.home = sp.slice();
     if (live) {
      p.tx = sp[0];
      p.ty = sp[1];
      p.wander = Math.min(p.wander || 9, .4);
     } else {
      p.tgt = sp.slice();
      p.wt = Math.min(p.wt || 9, .4);
     }
     fx('f9');
    }
   }
   used.set(Math.round(p.home[0] / 12) + ':' + Math.round(p.home[1] / 12), p);
  }
  const dl = nearDef().filter(p => p !== me), dD = dl.filter(p => rrOf(p) === 'D');
  if (dD.length < 3 && dl.length >= 4) {
   const cand = dl.filter(p => rrOf(p) !== 'D').sort((p, q) => {
    const m = x => x.mark && G.players.includes(x.mark) && rrOf(x.mark) === 'A' ? 0 : 1;
    return m(p) - m(q);
   });
   for (const p of cand.slice(0, 3 - dD.length)) {
    p.rr = 'D';
    fx('f10');
   }
  }
 }
 for (const [K, S, has] of [ [ offK, offS, true ], [ defK, defS, false ] ]) {
  const L = G[K], mine = S === 'U', bk = L.filter(f => f.role === 'D' || f.role === 'M'), rs = L.filter(ride);
  bk.forEach((f, i) => {
   const x = mine ? MIDX - (f.role === 'M' ? 34 : 55) - 16 * Math.floor(i / 3) : MIDX + (f.role === 'M' ? 34 : 55) + 16 * Math.floor(i / 3);
   const y = CY - 44 + 44 * (i % 3);
   if (!f.rest || Math.abs(f.rest[0] - x) > .5 || Math.abs(f.rest[1] - y) > .5) {
    f.rest = [ x, y ];
   }
  });
  rs.forEach((f, i) => {
   const x = mine ? MIDX + 44 + (i === 1 ? 16 : 0) : MIDX - 44 - (i === 1 ? 16 : 0), y = CY - 44 + 44 * (i % 3);
   f.rest = [ x, y ];
  });
 }
 if (fixes) {
  farPair(G);
  G.fix193 = (G.fix193 || 0) + fixes;
  (G.fix193log = G.fix193log || []).push([ why || 'tick', fl.join(','), +(G.t || 0).toFixed(1) ]);
  if (G.fix193log.length > 40) G.fix193log.shift();
 }
 return fixes > 0;
}

function tick193(G, dt) {
 if (!on193(G)) return;
 const b = G.ball;
 if (!b) return;
 G.t193 = (G.t193 || 0) - dt;
 if (G.t193 <= 0) {
  G.t193 = .25;
  if (b.state !== 'shot') try {
   trn193(G);
  } catch (e) {
   console.error(e);
  }
 }
}

function unstick193(G, dt) {
 if (!on193(G)) return;
 const live = screen === 'live', car = live ? G.carrier : G.dcar, me = live ? G.ctrl : G.dctl, offT = live ? 'O' : 'D';
 for (const p of G.players) {
  if (p.team !== offT || p === car || p === me || p.gk || p.down > 0 || p.pickSet || p.playHold || isChaser(p)) {
   p._u193 = null;
   continue;
  }
  const tg = live ? [ p.tx, p.ty ] : p.tgt || p.home;
  if (!tg) continue;
  const dist = Math.hypot(tg[0] - p.x, tg[1] - p.y), far = dist > 6;
  if (!p._u193) {
   p._u193 = {
    d: dist,
    t: 0
   };
   continue;
  }
  const U = p._u193;
  if (!far) {
   U.d = dist;
   U.t = 0;
   U.s = (U.s || 0) + dt;
   if (U.s > 2.2) {
    U.s = 0;
    if (live) p.wander = 0; else p.wt = 0;
    G.idle193 = (G.idle193 || 0) + 1;
   }
   continue;
  }
  U.s = 0;
  if (dist < U.d - 2.5 || dist > U.d + 12) {
   U.d = dist;
   U.t = 0;
   continue;
  }
  U.t += dt;
  if (U.t < .7) continue;
  U.t = 0;
  G.unstick193 = (G.unstick193 || 0) + 1;
  const sy = (p.y < CY ? 1 : -1) * rnd(14, 24);
  if (live) {
   p.playT = null;
   p.wander = rnd(.5, .9);
   p.tx = clamp(p.x + rnd(6, 16), MIDX + 24, GX - 20);
   p.ty = clamp(p.y + sy, FT + 14, FB - 8);
  } else {
   p.wt = rnd(.5, .9);
   p.tgt = [ clamp(p.x - rnd(6, 16), DGX + CREASE + 14, MIDX - 24), clamp(p.y + sy, FT + 14, FB - 8) ];
  }
 }
}

function drift193(G, f, dt) {
 if (!on193(G) || f.role === 'G') return [ 0, 0 ];
 f.jT = (f.jT || 0) - dt;
 if (f.jT <= 0) {
  f.jT = rnd(1.2, 2.4);
  f.jx = rnd(-7, 7);
  f.jy = rnd(-8, 8);
 }
 return [ f.jx || 0, f.jy || 0 ];
}

function dedupe2317(G) {
 if (window.__rl_no2317b || !G || !G.lu) return;
 for (const s of [ 0, 1 ]) {
  const far = s === 0 ? G.farU : G.farC;
  if (!far || !far.length) continue;
  const field = G.players.filter(q => s === 0 ? q.team === 'O' || q.team === 'G2' : q.team === 'D' || q.team === 'G');
  const seen = new Set(field.filter(q => q.pl).map(q => q.pl.id));
  const L = G.lu[s] || {};
  const pool = f => {
   const o = [];
   for (const k of f.role === 'D' ? 'DMA' : f.role === 'M' ? 'MDA' : 'AMD') for (const id of L[k] || []) if (id && !o.includes(id)) o.push(id);
   for (const sl of SLOTS) {
    const id = slotGet(L, sl[0]);
    if (typeof id === 'string' && !o.includes(id)) o.push(id);
   }
   return o;
  };
  const isG = f => f.role === 'G' || f.gk;
  let n = field.filter(q => !(q.team === 'G' || q.team === 'G2' || q.gk)).length + far.filter(f => !isG(f)).length;
  const out = id => (G.ejected || []).includes(id) || (G.ns17 || []).includes(id) || (G.concOut || []).includes(id);
  const keep = q => q === G.carrier || q === G.dcar || q === G.ctrl || q === G.dctl || isG(q) || q.team === 'G' || q.team === 'G2';
  const fs = new Set;
  for (const q of field.slice()) {
   if (!q.pl) continue;
   if (!fs.has(q.pl.id)) {
    fs.add(q.pl.id);
    continue;
   }
   G.dd2317 = (G.dd2317 || 0) + 1;
   const id = n > 9 && !keep(q) ? null : pool({
    role: q.rr || rrOf(q)
   }).find(x => !seen.has(x) && !out(x) && !(PP(x) && PP(x).pos === 'G'));
   if (id) {
    q.pl = PP(id);
    seen.add(id);
    fs.add(id);
    continue;
   }
   if (keep(q)) continue;
   const k = G.players.indexOf(q);
   if (k >= 0) G.players.splice(k, 1);
   n--;
   for (const r of G.players) {
    if (r.mark === q) r.mark = null;
    if (r.mark0 === q) r.mark0 = null;
   }
  }
  for (let i = 0; i < far.length; i++) {
   const f = far[i];
   if (!f.pl) continue;
   if (!seen.has(f.pl.id)) {
    seen.add(f.pl.id);
    continue;
   }
   G.dd2317 = (G.dd2317 || 0) + 1;
   const id = n > 9 && !isG(f) ? null : pool(f).find(x => !seen.has(x) && !out(x) && (isG(f) ? PP(x) && PP(x).pos === 'G' : !(PP(x) && PP(x).pos === 'G')));
   if (id) {
    f.pl = PP(id);
    seen.add(id);
    continue;
   }
   for (const q of far) if (q.mk === f) q.mk = null;
   far.splice(i, 1);
   i--;
   if (!isG(f)) n--;
  }
 }
}

const TP2403 = {
 spd: 40
};

function tpx2403(G, p, nx) {
 if (!tp2403on(G) || H7on() || Math.abs(nx - p.x) <= 2) return nx;
 if (!p.rb2403) G.tp2403n = (G.tp2403n || 0) + 1;
 p.rb2403 = true;
 return p.x;
}

function tp2403on(G) {
 return !!G && !window.__rl_no2403 && !window.__rl_v124gb && !G.tutorial && !G.brave;
}

function farTick(dt) {
 const G = game;
 if (!G || !G.farU || !G.farC || G.farMode === 'fo') return;
 const b = G.ball;
 if (!b) return;
 const riders = t => (t === 'U' ? G.farU : G.farC).filter(f => f.role === 'A' || f.role === 'R');
 if (!window.__rl_v124gb && !window.__rl_no28) {
  const rU = riders('U'), rC = riders('C');
  if (G.farU.some(f => f.mk && !rC.includes(f.mk)) || G.farC.some(f => f.mk && !rU.includes(f.mk)) || G.farU.some(f => (f.role === 'D' || f.role === 'M') && !f.mk && rC.some(r => !G.farU.some(d => d.mk === r))) || G.farC.some(f => (f.role === 'D' || f.role === 'M') && !f.mk && rU.some(r => !G.farC.some(d => d.mk === r)))) {
   farPair(G);
   G.repair18 = (G.repair18 || 0) + 1;
  }
 }
 for (const t of [ 'U', 'C' ]) {
  const rs = riders(t);
  let best = null, bd = 1e9;
  for (const f of rs) {
   f.chase = false;
   const d = Math.hypot(f.x - b.x, f.y - b.y);
   if (d < bd) {
    bd = d;
    best = f;
   }
  }
  if (best) best.chase = true;
 }
 let rideFar = null;
 if (V13ON() && !G.tutorial) {
  if (screen === 'defense' && G.cpuClear && rideOn('U') && b.x > MIDX) rideFar = rideMarks(riders('U').filter(f => !f.chase), (G.farC || []).filter(f => f.role !== 'A' && f.role !== 'R').concat(G.players.filter(p => p.team === 'G')), b); else if (screen === 'live' && G.clearing && (rideOn('C') || clr26ok(G)) && b.x < MIDX) rideFar = rideMarks(riders('C').filter(f => !f.chase), (G.farU || []).filter(f => f.role !== 'A' && f.role !== 'R'), b);
 }
 for (const f of G.farU.concat(G.farC)) {
  const x02403 = f.x;
  let tx = f.rest[0], ty = f.rest[1], spd = 30;
  const ride = f.role === 'A' || f.role === 'R';
  const RC = G.rideC && G.rideC.mode === 'far' ? G.rideC : null, rm = rideFar && rideFar.get(f);
  if (RC && f === RC.gk && (RC.phase === 'out' || RC.phase === 'back')) {
   const q = rideGkTarget(RC, false, GX);
   tx = q[0];
   ty = q[1];
   spd = q[2];
  } else if (RC && f === RC.cd && RC.phase === 'out') {
   tx = MIDX + RIDE.cdX;
   ty = CY + (b.y - CY) * .35;
   spd = 36;
  } else if (rm && !f.chase) {
   tx = rm.x;
   ty = rm.y;
   spd = 34;
  } else if (f.clrT && G.cset) {
   tx = f.clrT[0];
   ty = f.clrT[1];
   spd = 46;
  } else if (G.rideX && G.rideX.get(f) && !f.chase) {
   const q = G.rideX.get(f);
   tx = q[0];
   ty = q[1];
   spd = 34;
  } else if (f.role === 'G') {
   tx = f.team === 'U' ? DGX + 5 : GX - 5;
   ty = CY;
  } else if (ride && f.team === 'U' && screen === 'defense' && G.dclear && b.state === 'clear' && LIVE_GB() && !G.tutorial) {
   const q = attSpot181(f);
   tx = q[0];
   ty = q[1];
   spd = 30;
  } else if (ride && f.chase && f.team === 'C' && screen === 'live' && G.clearing && G.carrier && b.x < MIDX && clr26ok(G)) {
   const q38 = window.V38D && V38D.rideFar(G, f, G.carrier, dt);
   if (q38) {
    tx = q38[0];
    ty = q38[1];
    spd = q38[2];
   } else {
    tx = G.carrier.x + 7;
    ty = G.carrier.y;
    spd = 40;
   }
   f.ride26 = G.t;
  } else if (ride) {
   const onSide = f.team === 'C' ? b.x < MIDX : b.x > MIDX;
   if (onSide) {
    const w = f.chase ? .95 : .3;
    tx = f.rest[0] + (b.x - f.rest[0]) * w;
    ty = f.rest[1] + (b.y - f.rest[1]) * w;
    spd = f.chase ? 40 : 28;
   }
  } else if (f.role === 'D' && f.team === 'U' && screen === 'live' && G.clearing && b.x < MIDX && clr26ok(G)) {
   const car = G.carrier;
   tx = Math.min(f.rest[0] + 12, MIDX - 12);
   ty = f.rest[1];
   spd = 34;
   if (car) {
    const vx = tx - car.x, vy = ty - car.y, vl = Math.hypot(vx, vy);
    if (vl < 30) {
     const ux = vl > .01 ? vx / vl : 0, uy = vl > .01 ? vy / vl : f.y < CY ? -1 : 1;
     tx = car.x + ux * 30;
     ty = car.y + uy * 30;
    }
   }
  } else if (f.role === 'D') {
   const m = f.mk;
   if (m) {
    tx = m.x + (f.team === 'U' ? -11 : 11);
    ty = m.y + (CY - m.y) * .1;
    spd = 34;
    const car = screen === 'live' ? G.carrier : G.dcar;
    if (car && s2302on() && f.team === 'U' === (car.team === 'O' || car.team === 'G2')) {
     const vx = tx - car.x, vy = ty - car.y, vl = Math.hypot(vx, vy);
     if (vl < 24) {
      const ux = vl > .01 ? vx / vl : f.team === 'U' ? -1 : 1, uy = vl > .01 ? vy / vl : 0;
      tx = car.x + ux * 24;
      ty = car.y + uy * 24;
      G.room2302 = (G.room2302 || 0) + 1;
     }
    }
   }
  } else if (f.role === 'M' && f.rest && on193(G)) {
   tx = f.rest[0];
   ty = f.rest[1] + (b.y - CY) * .15;
   spd = 34;
  } else if (f.role === 'M') {
   tx = f.team === 'U' ? MIDX - 30 : MIDX + 30;
   ty = CY + (b.y - CY) * .3;
   spd = 34;
   if (!(window.__rl_no46 || window.__rl_v124gb)) {
    const ms = (f.team === 'U' ? G.farU : G.farC).filter(q => q.role === 'M'), k = ms.indexOf(f);
    if (k > 0) {
     ty += [ 0, -30, 30, -60, 60 ][k % 5];
     tx += (f.team === 'U' ? -1 : 1) * 14 * Math.floor(k / 5);
    }
   }
  }
  const clrD26 = f.role === 'D' && f.team === 'U' && screen === 'live' && G.clearing && b.x < MIDX && clr26ok(G);
  if (f.role === 'D' && f.mk && !clrD26 && !(f.clrT && G.cset) && !(G.rideX && G.rideX.get(f)) && !(RC && (f === RC.gk || f === RC.cd)) && on2403(G)) {
   const q = gs2403(f, f.mk, tx, ty, spd, f.team === 'U' ? DGX : GX, b, D2403.farMax);
   if (q) {
    tx = q[0];
    ty = q[1];
    spd = q[2];
    f.gs2403 = G.t;
   }
  }
  if (!rm && !(f.chase && (f.team === 'C' ? b.x < MIDX : b.x > MIDX)) && !(f.clrT && G.cset) && on193(G)) {
   const j = drift193(G, f, dt);
   tx += j[0];
   ty += j[1];
  }
  if (f.cut181) {
   if (G.t >= f.cut181.until || !cut26Far(f)) f.cut181 = null; else {
    tx = f.x + f.cut181.ux * 30;
    ty = f.y + f.cut181.uy * 30;
    spd = PACE.cut * CUT181.spd;
   }
  }
  const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy);
  if (d > .4) {
   const s = Math.min(d, spd * dt);
   f.x += dx / d * s;
   f.y += dy / d * s;
   f.anim += s;
  }
  {
   const nx = f.team === 'U' ? ride ? Math.max(f.x, MIDX + 4) : Math.min(f.x, MIDX - 4) : ride ? Math.min(f.x, MIDX - 4) : Math.max(f.x, MIDX + 4);
   if (!H7on() && tp2403on(G) && Math.abs(nx - f.x) > .01) {
    f.x = x02403 + clamp(nx - x02403, -TP2403.spd * dt, TP2403.spd * dt);
    if (!f.rb2403) G.tp2403n = (G.tp2403n || 0) + 1;
    f.rb2403 = true;
   } else {
    f.x = H7on() ? f.x + clamp(nx - f.x, -20 * dt, 20 * dt) : nx;
    f.rb2403 = false;
   }
  }
  if (H7on()) {
   const ex = clamp(f.x, DEND + 2, ENDX - 6);
   if (ex !== f.x) {
    if (Math.abs(ex - f.x) <= 3) f.x = ex; else h7snap(f, ex, f.y);
   }
  }
  f.y = clamp(f.y, FT + 12, FB - 2);
  if (!(window.__rl_no46 || window.__rl_v124gb)) for (const q of f.team === 'U' ? G.farU : G.farC) {
   if (q === f) break;
   if (Math.abs(q.x - f.x) < 4 && Math.abs(q.y - f.y) < 4) {
    f.y = clamp(f.y + (f.y < CY ? 1 : -1) * (H7on() ? 2 : 8), FT + 12, FB - 2);
    G.sep46 = (G.sep46 || 0) + 1;
    break;
   }
  }
 }
 if (clr26ok(G) && !G.online && screen === 'live' && G.clearing && G.carrier && b.state === 'held') {
  const c = G.carrier;
  for (const f of G.farC) {
   if (f.ride26 !== G.t) {
    f.chk26 = null;
    continue;
   }
   f.chk26 = (f.chk26 == null ? .8 : f.chk26) - dt;
   if (Math.hypot(f.x - c.x, f.y - c.y) < 9 && f.chk26 <= 0) {
    f.chk26 = .7;
    G.farChk26 = (G.farChk26 || 0) + 1;
    if (!window.__rl_clr26nostrip && Math.random() < .12 * clamp(1 - .1 * pr(c, 'stk'), .6, 1.3)) {
     G.run = null;
     G.farStrip26 = (G.farStrip26 || 0) + 1;
     checkPop();
     break;
    }
    addFx('txt', f.x, f.y - 24, {
     s: 'SLAP',
     col: 'rgba(255,255,255,.7)',
     life: .35
    });
   }
  }
 }
}

function ruleCounts() {
 const G = game, U = {
  back: 0,
  up: 0,
  n: 0
 }, C = {
  back: 0,
  up: 0,
  n: 0
 };
 const add = (S, mine, x) => {
  S.n++;
  if (mine ? x < MIDX + 3 : x > MIDX - 3) S.back++;
  if (mine ? x > MIDX - 3 : x < MIDX + 3) S.up++;
 };
 for (const p of G.players) {
  if (p.team === 'O' || p.team === 'G2') add(U, true, p.x); else if (p.team === 'D' || p.team === 'G') add(C, false, p.x);
 }
 const fx2403 = f => f.rb2403 && G.farMode !== 'fo' && tp2403on(G) ? f.team === 'U' ? f.role === 'A' || f.role === 'R' ? MIDX + 4 : MIDX - 4 : f.role === 'A' || f.role === 'R' ? MIDX - 4 : MIDX + 4 : f.x;
 for (const f of G.farU || []) add(U, true, fx2403(f));
 for (const f of G.farC || []) add(C, false, fx2403(f));
 return {
  U: U,
  C: C
 };
}

function possTeam() {
 const G = game, b = G.ball;
 if (!b) return null;
 if (screen === 'live') return b.state === 'held' && G.carrier || b.state === 'pass' || b.state === 'shot' ? 'U' : null;
 if (screen === 'defense') {
  if (b.state === 'clear') return 'U';
  if (b.state === 'held' && G.dcar) return 'C';
  if (b.state === 'pass') return b.clear ? 'U' : 'C';
  if (b.state === 'shot') return 'C';
 }
 return null;
}

function ruleBanner(kind, txt, sub) {
 const G = game;
 G.banner = {
  txt: txt,
  sub: sub,
  kind: kind
 };
 G.bannerT = 0;
 screen = 'banner';
 stick = null;
 shootP = null;
 G.dHold = null;
 G.bannerAuto = 2;
 SFX.whistle();
}

function ruleCall(label, sub, kind, spot) {
 const G = game;
 if (!G || G.over || G.tutorial) return false;
 if (screen !== 'live' && screen !== 'defense') return false;
 const b = G.ball;
 spot = spot || {
  x: b.x,
  y: b.y
 };
 if ((kind === 'upen' || kind === 'cpen') && (G.pen || G.penPending)) kind = kind === 'upen' ? 'cturnP' : 'uturnP';
 G.ruleLog = G.ruleLog || [];
 G.ruleLog.push({
  rule: label,
  kind: kind,
  t: +G.t.toFixed(2),
  q: G.q,
  user: !!G.userCause
 });
 G.ruleCalls = G.ruleCalls || {};
 G.ruleCalls[label] = (G.ruleCalls[label] || 0) + 1;
 G.ruleSpot = {
  x: spot.x,
  y: spot.y
 };
 G.userCause = false;
 G.run = null;
 G.cc = null;
 G.bc = null;
 G.ccC = null;
 G.bcC = null;
 if (kind === 'upen' || kind === 'cpen') {
  const side = kind === 'upen' ? 'U' : 'C';
  const who = side === 'U' ? G.dctl && G.dctl.pl || PP(G.lu[0].D[0]) : PP(G.lu[1].D[0]);
  G.penPending = {
   side: side,
   who: who,
   foul: label
  };
  G.ruleCall = G.penPending;
  if (side === 'U' && who) st14('pen', who);
  ruleBanner('flag', label, side === 'U' ? 'FLAG ON ' + (who ? lastName(who) : 'YOU') + ' - 30 SEC MAN-DOWN' : 'FLAG ON ' + T(G.opp).name + ' - YOU ARE MAN-UP');
  return true;
 }
 G.ruleCall = {
  label: label,
  t: G.t
 };
 if (kind === 'uturn' || kind === 'cturnP') ruleBanner('rturn', label, sub || 'TURNOVER - THEIR BALL'); else ruleBanner('rturnU', label, sub || 'THEIR VIOLATION - YOUR BALL');
 return true;
}

function rulesAfterBanner(k) {
 const G = game, s = G.ruleSpot || {
  x: MIDX,
  y: CY
 };
 if (k === 'rturn') {
  if (!G.ot && G.clock <= 0) {
   endQuarter();
   return true;
  }
  if (s.x < MIDX) {
   startDefense({
    x: clamp(s.x, DGX + 40, MIDX - 20),
    y: clamp(s.y, FT + 16, FB - 8)
   });
   return true;
  }
  if (startDefenseLive()) return true;
  startCpu();
  return true;
 }
 if (k === 'rturnU') {
  if (!G.ot && G.clock <= 0) {
   endQuarter();
   return true;
  }
  if (s.x >= MIDX || screen !== 'banner' || !G.players.some(p => p.team === 'O')) {
   setupPossession(clamp(s.x, MIDX + 12, GX - 60), s.y);
   return true;
  }
  const p = nearestTo('O', s.x, s.y);
  if (p) {
   p.x = clamp(s.x, DEND + 10, MIDX - 8);
   p.y = clamp(s.y, FT + 14, FB - 6);
   G.ball.state = 'held';
   toOffense(p, 'YOUR BALL');
   return true;
  }
  setupPossession();
  return true;
 }
 return false;
}

const ON28 = {
 line: 6,
 D: 55,
 M: 30,
 A: 44
};

function onside28(pre) {
 const G = game;
 if (!G || G.tutorial || G.over || window.__rl_v124gb || window.__rl_no28 || G.farMode === 'fo') return;
 if (on193(G)) return;
 const b = G.ball;
 if (!b || b.state === 'loose' || b.state === 'chase') return;
 if (pre) {
  for (const tm of [ 'U', 'C' ]) {
   if (!G.pen || G.pen.side !== tm) continue;
   const mine = tm === 'U', far = (mine ? G.farU : G.farC) || [], k = ruleCounts()[tm];
   if (k.up >= 3 || k.back < 5) continue;
   const f = far.filter(q => (q.role === 'D' || q.role === 'M') && !q.stay).sort((p, q) => Math.abs(p.x - MIDX) - Math.abs(q.x - MIDX))[0];
   if (!f) continue;
   f.role = 'R';
   f.mk = null;
   f.x = mine ? MIDX + 4 : MIDX - 4;
   f.rest = [ mine ? MIDX + ON28.A : MIDX - ON28.A, f.y ];
   if (f.tx != null) f.tx = f.rest[0];
   G.on28r = (G.on28r || 0) + 1;
   farPair(G);
  }
  return;
 }
 for (const tm of [ 'U', 'C' ]) {
  const mine = tm === 'U', far = (mine ? G.farU : G.farC) || [];
  const backOf = x => mine ? x < MIDX + 3 : x > MIDX - 3, upOf = x => mine ? x > MIDX - 3 : x < MIDX + 3;
  const legal = (fromX, toX) => {
   const k = ruleCounts()[tm];
   return k.back - (backOf(fromX) ? 1 : 0) + (backOf(toX) ? 1 : 0) >= 4 && k.up - (upOf(fromX) ? 1 : 0) + (upOf(toX) ? 1 : 0) >= 3;
  };
  for (const f of far) {
   if (f.role === 'G' || !f.rest || Math.abs(f.rest[0] - MIDX) > ON28.line) continue;
   const backRole = f.role === 'D' || f.role === 'M', off = f.role === 'D' ? ON28.D : f.role === 'M' ? ON28.M : ON28.A;
   const nx = mine === backRole ? MIDX - off : MIDX + off;
   if (!legal(f.x, nx)) continue;
   f.rest = [ nx, f.rest[1] ];
   if (f.tx != null) f.tx = nx;
   G.on28 = (G.on28 || 0) + 1;
  }
  if (screen !== 'live' || !mine) continue;
  for (const p of G.players) {
   if (p.team !== 'O' || p === G.carrier || p === G.ctrl || p.gk || !p.home || p.tx == null || Math.abs(p.tx - MIDX) > 1.5 || isChaser(p) || p.coverT > 0) continue;
   if (!legal(p.x, p.home[0])) continue;
   p.tx = p.home[0];
   p.ty = p.home[1];
   G.on28 = (G.on28 || 0) + 1;
  }
 }
}

const ONSIDE_R = 60;

const CONV18 = {
 pulls: 15,
 win: 1,
 settle: 2,
 gap: 20
};

function conv18(G, p, mine, needBack) {
 if (!window.__rl_c18on) return false;
 if (window.__rl_v124gb || window.__rl_no18c || G.tutorial || G.online || G.farMode === 'fo' || screen !== 'live' || G.clearing) return false;
 if (mine) return false;
 if (mine ? !needBack : needBack) return false;
 if (p === G.carrier || p === G.ctrl || p === G.dcar || p === G.dctl || p.gk || p.team === 'G' || p.team === 'G2' || isChaser(p)) return false;
 if (!(p.pull18t > G.t - CONV18.win)) p.pull18 = 0;
 p.pull18 = (p.pull18 || 0) + 1;
 p.pull18t = G.t;
 if (p.pull18 < CONV18.pulls) return false;
 const i = G.players.indexOf(p);
 if (i < 0) return false;
 const tm = mine ? 'U' : 'C', oth = mine ? 'C' : 'U';
 const set = G.set18t != null && G.t - G.set18t >= CONV18.settle;
 const nearN = G.players.filter(q => (mine ? q.team === 'O' : q.team === 'D') && !q.gk).length;
 const lastC = (G.c18last || {})[tm];
 if (!set || nearN < 6 || lastC != null && G.t - lastC < CONV18.gap) {
  p.pull18 = 0;
  G.conv18skip = (G.conv18skip || 0) + 1;
  return false;
 }
 (G.c18last = G.c18last || {})[tm] = G.t;
 const role = needBack ? mine ? 'M' : 'D' : 'A';
 const backX = mine ? MIDX - ON28.M : MIDX + ON28.D, upX = mine ? MIDX + ON28.A : MIDX - ON28.A;
 const fx = needBack ? mine ? Math.min(p.x, MIDX - 4) : Math.max(p.x, MIDX + 4) : mine ? Math.max(p.x, MIDX + 4) : Math.min(p.x, MIDX - 4);
 const f = farMk(tm, role, fx, p.y, p.pl);
 f.anim = p.anim || 0;
 f.rest = [ needBack ? backX : upX, clamp(p.y, FT + 16, FB - 8) ];
 if (mine && role === 'M') f.stay = true;
 G.players.splice(i, 1);
 (mine ? G.farU = G.farU || [] : G.farC = G.farC || []).push(f);
 const guards = mine ? G.players.filter(q => q.team === 'D' && q.mark === p && !q.gk && !isChaser(q)) : [];
 const gd = guards[0];
 if (gd) {
  const j = G.players.indexOf(gd);
  if (j >= 0) {
   G.players.splice(j, 1);
   const grole = needBack ? 'R' : 'D';
   const gx = mine ? needBack ? Math.min(gd.x, MIDX - 4) : Math.max(gd.x, MIDX + 4) : needBack ? Math.max(gd.x, MIDX + 4) : Math.min(gd.x, MIDX - 4);
   const g2 = farMk(oth, grole, gx, gd.y, gd.pl);
   g2.anim = gd.anim || 0;
   g2.rest = [ grole === 'R' ? oth === 'C' ? MIDX - ON28.A : MIDX + ON28.A : oth === 'U' ? MIDX - ON28.D : MIDX + ON28.D, clamp(gd.y, FT + 16, FB - 8) ];
   (oth === 'U' ? G.farU = G.farU || [] : G.farC = G.farC || []).push(g2);
   for (const q of G.players) {
    if (q.mark === gd) q.mark = null;
    if (q.mark0 === gd) q.mark0 = null;
   }
  }
 }
 for (const q of G.players) {
  if (q.mark === p) q.mark = null;
  if (q.mark0 === p) q.mark0 = null;
 }
 if (G.hotP === p) G.hotP = null;
 if (G.dSlide === p) G.dSlide = null;
 if (G.slide && (G.slide.who === p || G.slide.d === p)) G.slide = null;
 farPair(G);
 G.conv18 = (G.conv18 || 0) + 1;
 (G.conv18log = G.conv18log || []).push({
  t: +G.t.toFixed(2),
  scr: screen,
  tm: tm,
  role: role,
  guard: !!gd
 });
 return true;
}

function over37(G) {
 if (screen !== 'live' || window.__rl_v124gb || window.__rl_no37 || G.tutorial || G.online || G.pen || G.penPending || G.clearing || G.farMode === 'fo') return;
 const c = G.carrier;
 if (!c || !G.ball || G.ball.state !== 'held' || G.set18t == null || G.t - G.set18t < 2) return;
 if (G.t - (G.ov37t || -9) < .6) return;
 const k = ruleCounts().U;
 if (k.back <= 4) return;
 const m = G.players.filter(p => p.team === 'O' && !p.gk && p !== c && p !== G.ctrl && rrOf(p) !== 'D' && p.x < MIDX + 2 && !isChaser(p) && !(p.down > 0) && !p.stay).sort((a, b) => b.x - a.x)[0];
 if (!m) return;
 const hy = m.home ? m.home[1] : m.y, hx = m.home && m.home[0] > MIDX + 20 ? m.home[0] : MIDX + 45;
 m.home = [ hx, hy ];
 m.tx = hx;
 m.ty = hy;
 m.playHold = false;
 G.ov37t = G.t;
 G.over37 = (G.over37 || 0) + 1;
}

function aiOnside() {
 const G = game;
 if (!G || G.tutorial || G.over || !LIVE_GB()) return;
 const n193 = on193(G);
 if (!n193) over37(G);
 {
  const hc = screen === 'live' ? G.carrier : G.dcar, ok = hc && G.ball && G.ball.state === 'held' && !G.clearing && !G.cpuClear && (screen === 'live' ? hc.x > MIDX + 12 : hc.x < MIDX - 12);
  if (!ok) G.set18t = null; else if (G.set18t == null) G.set18t = G.t;
 }
 if (G.ball && (G.ball.state === 'loose' || G.ball.state === 'chase')) return;
 const me = screen === 'live' ? G.carrier || G.ctrl : G.dctl;
 const car = screen === 'live' ? G.carrier : G.dcar;
 for (const tm of [ 'U', 'C' ]) {
  const mine = tm === 'U';
  const field = G.players.filter(p => mine ? p.team === 'O' || p.team === 'G2' : p.team === 'D' || p.team === 'G');
  const far = G.farMode === 'fo' ? [] : (mine ? G.farU : G.farC) || [];
  const backOf = x => mine ? x < MIDX + 3 : x > MIDX - 3, upOf = x => mine ? x > MIDX - 3 : x < MIDX + 3;
  if (mine && me && G.players.includes(me) && G.run) {
   const r = rrOf(me);
   if (r === 'D' && !backOf(me.x) || r === 'A' && !upOf(me.x)) continue;
  }
  const ai = (n193 ? [] : field.filter(p => p !== car && p !== me && !(p.team === 'G' || p.team === 'G2') && !p.gk && !(G.dclear && G.dclear.holder === p) && !isChaser(p))).concat(far.filter(f => f.role !== 'G' && !(f.rb2403 && tp2403on(G))));
  for (let guard = 0; guard < 4; guard++) {
   const k = ruleCounts()[tm];
   if (k.back >= 4 && k.up >= 3) break;
   const needBack = k.back < 4;
   const cand = ai.filter(p => needBack ? !backOf(p.x) : !upOf(p.x)).map(p => ({
    p: p,
    d: Math.abs(p.x - MIDX)
   })).filter(o => o.d < ONSIDE_R).sort((a, b) => a.d - b.d)[0];
   if (!cand) {
    if (n193 && !G.on193fx) {
     G.on193fx = true;
     try {
      trn193(G, 'onside');
     } catch (e) {
      console.error(e);
     }
     G.on193fx = false;
    }
    break;
   }
   const p = cand.p, nx = mine ? needBack ? MIDX + 1 : MIDX - 1 : needBack ? MIDX - 1 : MIDX + 1;
   if (!p.far && conv18(G, p, mine, needBack)) continue;
   h7snap(p, nx, p.y);
   if (p.tx != null) p.tx = nx;
   if (p.rest) p.rest = [ nx, p.rest[1] ];
   G.onsideFix = (G.onsideFix || 0) + 1;
  }
 }
}

function ruleCheck(dt) {
 const G = game;
 if (G && H7on()) for (const p of G.players.concat(G.farU || [], G.farC || [])) if (p.h7v || p.h7w) {
  const L = Math.hypot(p.h7v || 0, p.h7w || 0), s = Math.max(0, L - (L > 60 ? 45 : 30) * dt) / (L || 1);
  p.h7v = (p.h7v || 0) * s;
  p.h7w = (p.h7w || 0) * s;
  if (L < .5) {
   p.h7v = 0;
   p.h7w = 0;
  }
 }
 if (!G || G.tutorial || G.over || G.brave) return;
 if (screen !== 'live' && screen !== 'defense') return;
 if (G.ball && (G.ball.state === 'loose' || G.ball.state === 'chase')) {
  G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
  return;
 }
 G.ruleGrace = Math.max(0, (G.ruleGrace || 0) - dt);
 if (G.ruleGrace > 0) return;
 const k = ruleCounts();
 G.lastCounts = k;
 G.rcMin = G.rcMin || {
  U: {
   back: 9,
   up: 9
  },
  C: {
   back: 9,
   up: 9
  }
 };
 for (const tm of [ 'U', 'C' ]) {
  G.rcMin[tm].back = Math.min(G.rcMin[tm].back, k[tm].back);
  G.rcMin[tm].up = Math.min(G.rcMin[tm].up, k[tm].up);
 }
 for (const tm of [ 'U', 'C' ]) {
  const c = k[tm];
  if (c.back >= 4 && c.up >= 3) continue;
  const pos = possTeam();
  const why = c.back < 4 ? 'TOO MANY OVER - 3 D + GOALIE STAY BACK' : 'TOO MANY BACK - 3 ATTACK STAY UP';
  const me0 = screen === 'live' ? G.carrier : G.dctl, uCause = tm === 'U' && !!(me0 && G.run && (rrOf(me0) === 'A' && me0.x < MIDX || rrOf(me0) === 'D' && me0.x > MIDX));
  if (!uCause && !window.__rl_v124gb && !window.__rl_no103) {
   G.h3n = (G.h3n || 0) + 1;
   if (!(G.h3t > G.t)) {
    G.h3t = G.t + .5;
    (G.h3log = G.h3log || []).push([ tm, c.back, c.up, screen, G.pen ? G.pen.side : null, +(G.t || 0).toFixed(1) ]);
    if (G.h3log.length > 20) G.h3log.shift();
    try {
     trn193(G, 'h3');
    } catch (e) {
     console.error(e);
    }
   }
   continue;
  }
  if (tm === 'U') {
   const me = screen === 'live' ? G.carrier : G.dctl;
   G.userCause = !!(me && G.run && (rrOf(me) === 'A' && me.x < MIDX || rrOf(me) === 'D' && me.x > MIDX));
   if (pos === 'U' || screen === 'live') ruleCall('OFFSIDES', why + ' - TURNOVER', 'uturn'); else ruleCall('OFFSIDES', why, 'upen');
  } else {
   if (pos === 'C') ruleCall('OFFSIDES', why + ' - YOUR BALL', 'cturn'); else ruleCall('OFFSIDES', why, 'cpen');
  }
  return;
 }
}

const J6_R = CREASE + .1;

function h7in(x, lo, hi, dt) {
 const n = clamp(x, lo, hi);
 return x + clamp(n - x, -70 * dt, 70 * dt);
}

function h7snap(p, nx, ny) {
 if (H7on() && (screen === 'live' || screen === 'defense')) {
  p.h7v = (p.h7v || 0) + (p.x - nx);
  p.h7w = (p.h7w || 0) + (p.y - ny);
 }
 p.x = nx;
 p.y = ny;
}

const SM211 = new Map;

let sm211S = '', sm211T = null;

function clrtp287() {
 return !window.__rl_no287clrtp && sm211on();
}

const bj287 = {
 x: 0,
 y: 0,
 bx: null,
 by: null,
 car: null
};

function sm211on() {
 return !window.__rl_no21 && !window.__rl_v124gb && !window.__rl_nosm211;
}

function sm211Frame(dt) {
 const G = game, ok = sm211on() && !!G && (screen === 'live' || screen === 'defense') && !G.tutorial;
 if (!ok || !(dt >= 0) || dt > .25) SM211.clear();
 sm211S = screen;
 if (!ok) {
  for (const p of G && G.players || []) {
   p._sox = 0;
   p._soy = 0;
  }
  return false;
 }
 const seen = new Set;
 for (const p of G.players.concat(G.farU || [], G.farC || [])) {
  const k = p.pl && p.pl.id != null ? (p.team === 'O' || p.team === 'G2' || p.team === 'U' ? 'u:' : 'c:') + p.pl.id : p;
  if (seen.has(k) && clrtp287()) {
   const s0 = SM211.get(k);
   p._sox = s0 ? s0.x + s0.ox - p.x : 0;
   p._soy = s0 ? s0.y + s0.oy - p.y : 0;
   continue;
  }
  seen.add(k);
  let s = SM211.get(k);
  if (!s) {
   SM211.set(k, {
    x: p.x,
    y: p.y,
    ox: 0,
    oy: 0
   });
   p._sox = 0;
   p._soy = 0;
   continue;
  }
  const jx = p.x - s.x, jy = p.y - s.y;
  if (Math.hypot(jx, jy) > Math.max(9, 240 * dt)) {
   s.ox -= jx;
   s.oy -= jy;
   G.sm211jumps = (G.sm211jumps || 0) + 1;
  }
  s.x = p.x;
  s.y = p.y;
  const cap = clrtp287() ? 480 : 240;
  let L = Math.hypot(s.ox, s.oy);
  if (L > cap) {
   s.ox *= cap / L;
   s.oy *= cap / L;
   L = cap;
  }
  if (L > 0) {
   const nL = Math.max(0, L - clamp(L * 4, 160, 450) * dt), f = nL < .5 ? 0 : nL / L;
   s.ox *= f;
   s.oy *= f;
  }
  p._sox = s.ox;
  p._soy = s.oy;
 }
 for (const k of [ ...SM211.keys() ]) if (!seen.has(k)) SM211.delete(k);
 return true;
}

const sx211 = p => p.x + (p._sox || 0), sy211 = p => p.y + (p._soy || 0);

function J7on() {
 return !window.__rl_no21 && !window.__rl_v124gb;
}

function face21(p, def) {
 const r = face21a(p, def);
 p._f211 = r;
 p._v211at = menuT;
 p._v211 = p._v211x ? null : D8on() ? D8VIEW[p.d21] || null : null;
 p._v211x = false;
 return r;
}

function D8on() {
 return J7on() && !window.__rl_no211;
}

const D8VIEW = [ null, 'SE', 'S', 'SE', null, 'NE', 'N', 'NE' ];

function d8of(dx, dy, cur) {
 const a = Math.atan2(dy, dx);
 let d = (Math.round(a / (Math.PI / 4)) % 8 + 8) % 8;
 if (cur != null) {
  let df = Math.abs(a - cur * Math.PI / 4) % (2 * Math.PI);
  df = Math.min(df, 2 * Math.PI - df);
  if (df < Math.PI / 8 + .17) d = cur;
 }
 return d;
}

function setD21(p, d) {
 p.d21 = d;
 if (d === 0 || d === 1 || d === 7) p.f21 = true; else if (d >= 3 && d <= 5) p.f21 = false;
}

function face21a(p, def) {
 const G = game;
 if (!J7on() || !G || G.tutorial && !s231on() || !(screen === 'live' || screen === 'defense')) {
  p._v211x = true;
  return def;
 }
 const d8 = D8on();
 if (d8 && p.d21 == null) p.d21 = (p.f21 != null ? p.f21 : def) ? 0 : 4;
 const car = screen === 'live' ? G.carrier : G.dcar;
 if (p.shot20 && p.shot20.type === 'ots' && p.shot20.f28 && shotNow204(p)) {
  p._v211x = true;
  return p.shot20.f28 > 0;
 }
 if (window.V20 && V20.otsAim282 && V20.otsAim282(p)) {
  p._v211x = true;
  return !def;
 }
 if (s26() && SHOT26.faceFwd(p, car) || p === car && (shootP || shotNow204(p) || G.ball && G.ball.state === 'shot' || G.cp20 && G.cp20.on)) {
  p._v211x = true;
  return def;
 }
 const A = p.dodgeA || (G.dodge && G.dodge.who === p ? G.dodge : null);
 if (A && A.kind === 'roll') {
  if (!p._r21) p._r21 = {
   f0: p.f21 != null ? p.f21 : def,
   vx: A.vx || 0,
   d0: p.d21
  };
  p._v211x = true;
 } else if (p._r21) {
  const R = p._r21;
  p._r21 = null;
  p.f21 = !R.f0;
  if (d8) p.d21 = R.d0 != null ? (R.d0 + 4) % 8 : p.f21 ? 0 : 4;
  p._f21t = G.t;
  p._f21x = p.x;
  p._f21y = p.y;
  p._f21hold = G.t + .35;
  return p.f21;
 }
 const isDef = screen === 'live' ? p.team === 'D' : p.team === 'O';
 if (isDef && !isChaser(p)) {
  const m = p.mark && G.players.includes(p.mark) ? p.mark : null, tgt = m && m !== car ? m : car;
  if (d8) {
   if (tgt && Math.hypot(tgt.x - p.x, tgt.y - p.y) > 2) setD21(p, d8of(tgt.x - p.x, tgt.y - p.y, p.d21));
  } else if (tgt && Math.abs(tgt.x - p.x) > 2) p.f21 = tgt.x > p.x;
  return p.f21 != null ? p.f21 : def;
 }
 if (p._f21t == null || G.t < p._f21t) {
  p._f21t = G.t;
  p._f21x = p.x;
  p._f21y = p.y;
  return p.f21 != null ? p.f21 : def;
 }
 const dtt = G.t - p._f21t;
 if (dtt >= .1) {
  const vx = (p.x - p._f21x) / dtt, vy = (p.y - (p._f21y != null ? p._f21y : p.y)) / dtt;
  p._f21t = G.t;
  p._f21x = p.x;
  p._f21y = p.y;
  if (!(p._f21hold > G.t)) {
   if (d8) {
    if (Math.hypot(vx, vy) > 7) setD21(p, d8of(vx, vy, p.d21));
   } else if (Math.abs(vx) > 7) p.f21 = vx > 0;
  }
 }
 return p.f21 != null ? p.f21 : def;
}

function d8live(p) {
 return !!(p && p._v211 && p._v211at === menuT && D8on());
}

function d8side(p) {
 const v = p._v211, right = handOf17(p) >= 0;
 let s = v === 'S' || v === 'SE' ? right ? 'L' : 'R' : right ? 'R' : 'L';
 if (!p._f211) s = s === 'L' ? 'R' : 'L';
 return s;
}

function d8head(p, x, y, hand) {
 const v = p._v211, right = hand >= 0;
 let s = v === 'S' || v === 'SE' ? right ? 'L' : 'R' : right ? 'R' : 'L';
 if (!p._f211) s = s === 'L' ? 'R' : 'L';
 const pk = RL12.pocket('d8' + v + '_cr0_' + s, p._f211);
 return pk ? [ x + pk[0], y + pk[1] ] : stickHeadAt(x, y, hand, p._f211);
}

function d8frame(p, fr) {
 if (!d8live(p)) return fr;
 const m = /^(pole_)?(idle|run(\d)|cradle(\d))$/.exec(fr);
 if (!m) return fr;
 const pole = !!m[1], pose = m[2] === 'idle' ? pole ? 'pidle' : 'idle' : m[3] != null ? (pole ? 'prun' : 'run') + m[3] : 'cr' + m[4];
 const n = 'd8' + p._v211 + '_' + pose + '_' + d8side(p);
 if (!has12(n)) return fr;
 if (game) {
  game.d8draws = (game.d8draws || 0) + 1;
  (game.d8seen = game.d8seen || {})[p._v211 + (p._f211 ? 'r' : 'l')] = 1;
 }
 return n;
}

const BRAID21 = new Map;

function braidOf21(pl) {
 return !!pl && !window.__rl_no21 && !window.__rl_v124gb && (pl.team === 'WHAU' || String(pl.id || '').startsWith('WHAU-'));
}

function braidSpot21(n) {
 if (BRAID21.has(n)) return BRAID21.get(n);
 let s = null;
 const f = RL12.FR[n];
 if (f && !/down|fall|getup|hit|prop_|coach/.test(n)) {
  const rows = f[3], isH = ch => ch === 'H' || ch === 'h' || ch === 'w';
  let yb = -1;
  rows.forEach((r, y) => {
   if ([ ...r ].some(isH)) yb = y;
  });
  if (yb >= 0) {
   let bx = 99;
   for (const y of [ yb, yb - 1 ]) if (y >= 0) [ ...rows[y] ].forEach((ch, x) => {
    if (isH(ch) && x < bx) bx = x;
   });
   if (bx < 99) s = {
    x: bx + 1,
    y: yb + 1,
    w: rows[0].length,
    f0: f[0],
    f1: f[1]
   };
  }
 }
 BRAID21.set(n, s);
 return s;
}

const BRAIDF2402 = new Map;

function braidFront2402(n) {
 if (window.__rl_no2402 || window.__rl_v124gb) return null;
 if (BRAIDF2402.has(n)) return BRAIDF2402.get(n);
 let r = null;
 const s = braidSpot21(n), f = RL12.FR[n];
 if (s && f) {
  const rows = f[3], at = (q, y) => (rows[y] || '')[q] || '.', CAGE = 'cSZCsz';
  let hit = false;
  for (let i = 0; i < 7; i++) {
   const q = i < 6 ? s.x - (i >= 3 ? 1 : 0) : s.x - 1;
   if (CAGE.includes(at(q, s.y + i)) || i < 6 && CAGE.includes(at(q + 1, s.y + i))) hit = true;
  }
  if (hit) {
   let y0 = -1;
   rows.forEach((row, y) => {
    if (y0 < 0 && [ ...row ].some(ch => 'cSZ'.includes(ch))) y0 = y;
   });
   if (y0 >= 0) {
    let L = 99, R = -1;
    for (const y of [ y0 - 1, y0, y0 + 1 ]) [ ...rows[y] || '' ].forEach((ch, q) => {
     if ('oHhwcSZC'.includes(ch)) {
      L = Math.min(L, q);
      R = Math.max(R, q);
     }
    });
    if (R >= 0) r = {
     L: L - 1,
     R: R + 1,
     y0: y0
    };
   }
  }
 }
 BRAIDF2402.set(n, r);
 return r;
}

function braidFrontPx2402(fr, hair, lit) {
 const out = [];
 for (const q of [ fr.L, fr.R ]) {
  for (let i = 0; i < 6; i++) out.push([ q, fr.y0 + i, i % 2 ? lit : hair ]);
  out.push([ q, fr.y0 + 6, '#c9a46b' ]);
 }
 return out;
}

function braids21(pl, n, x, y, faceRight) {
 if (!braidOf21(pl)) return;
 const hair = [ '#1a120c', '#2a1b10', '#120d0a', '#33241a' ][seedOf('braid:' + pl.id) % 4], lit = mixc21(hair, '#ffffff', .18);
 if (/^d8[SN]_/.test(n)) {
  const bob = /(run|cr|prun)[13]_/.test(n) ? 1 : 0, back = n[2] === 'N', X0 = Math.round(x), Y0 = Math.round(y) - 21 - bob + (back ? 8 : 5);
  for (const dx of back ? [ -2, 2 ] : [ -6, 6 ]) {
   for (let i = 0; i < 6; i++) px(X0 + dx, Y0 + i, i % 2 ? lit : hair);
   px(X0 + dx, Y0 + 6, '#c9a46b');
  }
  if (game) game.braids21 = (game.braids21 || 0) + 1;
  return;
 }
 const fr = braidFront2402(n);
 if (fr) {
  const rows = RL12.FR[n][3], f0 = RL12.FR[n][0], f1 = RL12.FR[n][1];
  for (const [q, r, c] of braidFrontPx2402(fr, hair, lit)) if (((rows[r] || '')[q] || '.') === '.') px(faceRight ? Math.round(x) - f0 + q : Math.round(x) + f0 - q, Math.round(y) - f1 + r, c);
  if (game) game.braids21 = (game.braids21 || 0) + 1;
  return;
 }
 const s = braidSpot21(n);
 if (!s) return;
 const X = q => faceRight ? Math.round(x) - s.f0 + q : Math.round(x) + s.f0 - q, Y = r => Math.round(y) - s.f1 + r;
 for (let i = 0; i < 6; i++) {
  const q = s.x - (i >= 3 ? 1 : 0) + (i % 2 ? 0 : 0);
  px(X(q), Y(s.y + i), i % 2 ? lit : hair);
  px(X(q + 1), Y(s.y + i), i % 2 ? hair : lit);
 }
 px(X(s.x - 1), Y(s.y + 6), '#c9a46b');
 if (game) game.braids21 = (game.braids21 || 0) + 1;
}

function mixc21(a, b, k) {
 const p = hexRgb(a), q = hexRgb(b);
 return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * k).toString(16).padStart(2, '0')).join('');
}

function H7on() {
 return !!window.__rl_h7old && !window.__rl_no21 && !window.__rl_v124gb;
}

function h7wall(p, dt) {
 if (!H7on() || p._h7ox == null) return 70 * dt;
 return Math.min(70 * dt, Math.max(0, PACE.chase * spdMul(p) * dt - Math.max(0, p._h7ox - p.x)));
}

function J6on() {
 return !window.__rl_no21 && !window.__rl_v124gb;
}

function inCrease(p, gx) {
 return !p.air20 && Math.hypot(p.x - gx, p.y - CY) < CREASE;
}

function gbTapMate(cx, cy, k) {
 const G = game;
 if (!G || screen !== 'live') return null;
 let best = null, bd = D_TAP_R * k;
 for (const p of G.players) {
  if (p.team !== 'O' || p === G.ctrl || p.down > 0) continue;
  const s = mateCss(p, k), d = Math.hypot(s.x - cx, s.y - cy);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 return best;
}

function gbSwitchTo(key, p) {
 const G = game, b = G.ball;
 G[key] = p;
 G.gbLock = {
  key: key,
  p: p,
  x: b.x,
  y: b.y
 };
 G.gbTapSwitches = (G.gbTapSwitches || 0) + 1;
 G.run = null;
 SFX.tap();
 addFx('catch', p.x, p.y - 6);
}

function autoCtrl(team, tg, key) {
 const G = game;
 let best = null, bd = 1e9;
 const lk = G.gbLock;
 if (lk && lk.key === key && G[key] === lk.p && G.players.includes(lk.p) && !(lk.p.down > 0) && Math.hypot(tg.x - lk.x, tg.y - lk.y) < 45) return;
 if (lk && lk.key === key) G.gbLock = null;
 for (const p of G.players) if (p.team === team && !(p.down > 0) && !p.ns17) {
  const d = Math.hypot(p.x - tg.x, p.y - tg.y);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 const cur = G[key];
 const cd = cur && G.players.includes(cur) && !(cur.down > 0) && !cur.ns17 && cur.team === team ? Math.hypot(cur.x - tg.x, cur.y - tg.y) : 1e9;
 const mg = !window.__rl_v124gb && G.run && cd < 40 ? 18 : 5;
 if (best && best !== cur && bd + mg < cd) {
  G[key] = best;
  G.ctrlSwitches = (G.ctrlSwitches || 0) + 1;
  addFx('catch', best.x, best.y - 6);
 }
}

function isChaser(p) {
 const G = game;
 if (screen === 'live') return p === G.ctrl || !!(G.chasers && G.chasers.includes(p)) || p === G.help18 && !!G.ball && (G.ball.state === 'loose' || G.ball.state === 'chase');
 if (screen === 'defense') return p === G.dctl && G.ball.state === 'loose' || !!(G.ball.state === 'loose' && (G.dChasers && G.dChasers.includes(p) || G.dHelpGb === p && LIVE_GB()));
 return false;
}

function coverTick() {
 const G = game, b = G.ball;
 if (!G || G.tutorial || !b) return;
 const k = ruleCounts();
 for (const tm of [ 'U', 'C' ]) {
  const team = tm === 'U' ? 'O' : 'D', upSide = x => tm === 'U' ? x > MIDX : x < MIDX;
  const list = G.players.filter(p => p.team === team);
  const goingUp = list.filter(p => isChaser(p) && !upSide(p.x) && upSide(b.x)).length;
  if (k[tm].back - goingUp >= 4) continue;
  const car = screen === 'live' ? G.carrier : G.dcar;
  const cand = list.filter(p => !isChaser(p) && p !== car && upSide(p.x) && !(p.coverT > 0) && !(p.down > 0)).sort((p, q) => Math.abs(p.x - MIDX) - Math.abs(q.x - MIDX))[0];
  if (cand) {
   cand.coverT = 3;
   cand.coverX = tm === 'U' ? MIDX - 20 : MIDX + 20;
   G.covers = (G.covers || 0) + 1;
  }
 }
}

function H2on() {
 return !window.__rl_v124gb && !window.__rl_no207h2;
}

function H3on() {
 return !window.__rl_v124gb && !window.__rl_no207h3;
}

const H3_YD = ARC_R / 16, H3_GAP = 5 * H3_YD;

function h3Corner(G, side) {
 const u = side === 'U', c = u ? G.carrier : G.dcar;
 if (!c) return;
 const top = c.y < CY;
 c.x = u ? ENDX - 6 : DEND + 8;
 c.y = top ? FT + 13 : FB - 4;
 c.tx = c.x;
 c.ty = c.y;
 if (u) {
  G.ball.x = c.x + BX;
  G.ball.y = c.y + BY;
 } else {
  const s = dStick(c);
  G.ball.x = s[0];
  G.ball.y = s[1];
 }
 const defs = G.players.filter(p => p.team === (u ? 'D' : 'O') && p.team !== 'G' && p.team !== 'G2');
 const d = defs.sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0];
 if (!d) return;
 const px = u ? GX - 34 : DGX + 34, dx = px - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1;
 let sx = c.x + dx / L * H3_GAP, sy = c.y + dy / L * H3_GAP;
 const gx = u ? GX : DGX, cx = sx - gx, cy = sy - CY, cd = Math.hypot(cx, cy) || 1;
 if (cd < CREASE + 3) {
  sx = gx + cx / cd * (CREASE + 3);
  sy = CY + cy / cd * (CREASE + 3);
 }
 d.x = sx;
 d.y = sy;
 d.tx = sx;
 d.ty = sy;
 if (u) d.settled = [ sx, sy ]; else d.settled = [ sx, sy ];
 for (const o of defs) if (o !== d && Math.hypot(o.x - c.x, o.y - c.y) < H3_GAP) {
  const ox = o.x - c.x, oy = o.y - c.y, ol = Math.hypot(ox, oy) || 1;
  o.x = c.x + ox / ol * (H3_GAP + 6);
  o.y = clamp(c.y + oy / ol * (H3_GAP + 6), FT + 12, FB - 3);
  o.tx = o.x;
  o.ty = o.y;
  o.settled = [ o.x, o.y ];
 }
 G.h3 = {
  side: side,
  cx: c.x,
  cy: c.y,
  dx: sx,
  dy: sy,
  gap: Math.hypot(sx - c.x, sy - c.y)
 };
}

function H4on() {
 return !window.__rl_v124gb && !window.__rl_no207h4;
}

function h4Ok(G) {
 const C = G.dclear, h = C && C.holder;
 return H4on() && !G.tutorial && G.ball && G.ball.state === 'clear' && !!h && h.team === 'G2' && !!C.left && Math.hypot(h.x - DGX, h.y - CY) > CREASE + 1;
}

function H5on() {
 return !window.__rl_v124gb && !window.__rl_no207h5;
}

const H5_R = 15 * ARC_R / 16;

function h5Threat(G, c) {
 const dg = Math.hypot(c.x - GX, c.y - CY);
 if (dg < 72) return true;
 if (dg > H5_R) {
  G.h5held = (G.h5held || 0) + 1;
  return false;
 }
 if (G.beatT > 0) return true;
 const goalSide = G.players.some(d => d.team === 'D' && !d.gk && !(d.down > 0) && Math.hypot(d.x - c.x, d.y - c.y) < 16 && Math.hypot(d.x - GX, d.y - CY) < dg);
 if (goalSide) G.h5held = (G.h5held || 0) + 1;
 return !goalSide;
}

function h5Pickup(G, c) {
 for (const d of G.players) {
  if (d.team !== 'D' || d.gk || d === G.slide || G.rot && G.rot.d === d || isChaser(d) || d.react > 0 || d.stun > 0 || d.down > 0) continue;
  const m = d.mark;
  if (!m || m === c || !G.players.includes(m) || m.rr !== 'A' && rrOf(m) !== 'A') continue;
  const dx = GX - m.x, dy = CY - m.y, L = Math.hypot(dx, dy) || 1, sx = m.x + dx / L * 9, sy = m.y + dy / L * 9;
  if (Math.hypot(d.tx - m.x, d.ty - m.y) > 16) {
   d.tx = sx;
   d.ty = sy;
   d.spd = Math.max(d.spd || 0, 26);
   G.h5pick = (G.h5pick || 0) + 1;
  }
 }
}

function H1on() {
 return !window.__rl_v124gb && !window.__rl_no207h1;
}

function h1Start(G, b) {
 if (!H1on() || G.tutorial || screen !== 'live' || !G.gb || G.gb.t < .12) return;
 const dist = p => Math.hypot(p.x - b.x, p.y - b.y);
 if (!G.help18 || !G.players.includes(G.help18) || G.help18.down > 0) {
  const u = G.players.filter(p => p.team === 'O' && p !== G.ctrl && !p.ns17 && !(p.down > 0) && !p.far).sort((p, q) => dist(p) - dist(q))[0];
  if (u) {
   G.help18 = u;
   G.h1help = (G.h1help || 0) + 1;
  }
 }
 const alive = (G.chasers || []).filter(p => G.players.includes(p) && !(p.down > 0));
 if (!alive.length) {
  const cpu = G.players.filter(p => p.team === 'D' && !(p.down > 0) && !p.far).sort((p, q) => dist(p) - dist(q)).slice(0, 2);
  cpu.forEach(p => {
   p.coverT = 0;
   if (!(p.gbReact > 0) || p.gbReact > .3) p.gbReact = .15;
  });
  G.chasers = cpu;
  G.h1cpu = (G.h1cpu || 0) + 1;
 }
}

function gbStall18(G, b, dt) {
 h1Start(G, b);
 if (Math.hypot(b.vx, b.vy) < 10 && (b.z || 0) <= 1) {
  if (b.y < FT + 9) {
   b.y = Math.min(FT + 9, b.y + 30 * dt);
   G.edge32 = (G.edge32 || 0) + 1;
  }
  if (b.y > FB - 2) b.y = Math.max(FB - 2, b.y - 30 * dt);
  if (b.x < DEND + 8) b.x = Math.min(DEND + 8, b.x + 30 * dt);
  if (b.x > ENDX - 5) b.x = Math.max(ENDX - 5, b.x - 30 * dt);
 }
 const near = G.players.filter(p => (p.team === 'O' || p.team === 'D') && !(p.down > 0) && !p.far);
 if (!near.length) return;
 const md = Math.min(...near.map(p => Math.hypot(p.x - b.x, p.y - b.y)));
 const S = G.st18 || (G.st18 = {
  best: md,
  t: 0
 });
 if (md < S.best - 1.5) {
  S.best = md;
  S.t = 0;
 } else S.t += dt;
 const onLine = Math.abs(b.x - MIDX) < 24 && !(S.lineT > G.t - .8);
 if (onLine) {
  S.lineT = G.t;
  G.line32 = (G.line32 || 0) + 1;
 } else if (S.t < .8) return;
 S.t = 0;
 S.best = md;
 G.stall18 = (G.stall18 || 0) + 1;
 const dist = p => Math.hypot(p.x - b.x, p.y - b.y);
 const cpu = near.filter(p => screen === 'live' ? p.team === 'D' : p.team === 'D').sort((p, q) => dist(p) - dist(q)).slice(0, 2);
 cpu.forEach(p => {
  p.gbReact = 0;
  p.coverT = 0;
 });
 if (screen === 'live') {
  G.chasers = cpu.concat((G.chasers || []).filter(p => G.players.includes(p) && !cpu.includes(p))).slice(0, 3);
  const u = near.filter(p => p.team === 'O' && p !== G.ctrl && !p.ns17).sort((p, q) => dist(p) - dist(q))[0];
  G.help18 = u || null;
 } else {
  G.dChasers = cpu;
  const u = near.filter(p => p.team === 'O' && p !== G.dctl && !p.ns17 && !p.r26).sort((p, q) => dist(p) - dist(q))[0];
  if (u) G.dHelpGb = u;
 }
}

function looseWatchdog(dt, mode) {
 const G = game, b = G.ball;
 if (!G || G.tutorial || !b) return;
 if (mode === 'live' && LIVE_GB() && G.chasers && G.chasers.some(p => p.down > 0 || !G.players.includes(p))) {
  const keep = G.chasers.filter(p => !(p.down > 0) && G.players.includes(p));
  const add = G.players.filter(p => p.team === 'D' && !(p.down > 0) && !keep.includes(p)).sort((p, q) => Math.hypot(p.x - b.x, p.y - b.y) - Math.hypot(q.x - b.x, q.y - b.y)).slice(0, 2 - keep.length);
  add.forEach(p => {
   p.gbReact = rnd(.08, .2);
  });
  G.chasers = keep.concat(add);
 }
 const dist = (p, q) => Math.hypot(p.x - b.x, p.y - b.y) - Math.hypot(q.x - b.x, q.y - b.y);
 if (mode === 'live') {
  const t = G.gb ? G.gb.t : 0;
  if (t > 1) {
   const alive = (G.chasers || []).filter(p => G.players.includes(p) && !(p.down > 0));
   if (!alive.length) {
    G.chasers = G.players.filter(p => p.team === 'D' && !(p.down > 0)).sort(dist).slice(0, 2);
    G.watchdog = (G.watchdog || 0) + 1;
   }
   for (const p of G.chasers) if (p.gbReact > .25) p.gbReact = .25;
  }
  if (t > (H1on() ? .8 : 2) && G.ctrl && !G.run) {
   const dx = b.x - G.ctrl.x, dy = b.y - G.ctrl.y, L = Math.hypot(dx, dy) || 1;
   G.run = {
    x: dx / L,
    y: dy / L
   };
   G.autoChase = (G.autoChase || 0) + 1;
  }
 } else {
  const t = G.dgb ? G.dgb.t : 0;
  if (t > 1) {
   const alive = (G.dChasers || []).filter(p => G.players.includes(p) && !(p.down > 0));
   if (!alive.length) {
    G.dChasers = G.players.filter(p => p.team === 'D' && !(p.down > 0)).sort(dist).slice(0, 2);
    G.watchdog = (G.watchdog || 0) + 1;
   }
   for (const p of G.dChasers) if (p.gbReact > .25) p.gbReact = .25;
  }
  if (t > (H1on() ? .8 : 2) && G.dctl && !G.run) {
   const dx = b.x - G.dctl.x, dy = b.y - G.dctl.y, L = Math.hypot(dx, dy) || 1;
   G.run = {
    x: dx / L,
    y: dy / L
   };
   G.autoChase = (G.autoChase || 0) + 1;
  }
 }
 coverTick();
}

function drawRuleCounts() {
 const G = game;
 if (!G || G.tutorial) return;
 let t = null, lab = '';
 if (screen === 'live') {
  if (G.cc) {
   t = G.cc.t;
   lab = 'CLEAR';
  } else if (G.bc) {
   t = G.bc.t;
   lab = 'GET IN';
  }
 } else if (screen === 'defense') {
  if (G.cc && G.ball.state === 'clear') {
   t = G.cc.t;
   lab = 'CLEAR';
  }
  if (G.dclear && G.dclear.holder && G.dclear.holder.team === 'G2' && G.dclear.crease != null && G.dclear.crease > 0 && Math.hypot(G.dclear.holder.x - DGX, G.dclear.holder.y - CY) < CREASE) {
   const ct = CREASE_CT - G.dclear.crease;
   if (t == null || ct < t) {
    t = ct;
    lab = 'CREASE';
   }
  }
  if (G.ccC) {
   t = G.ccC.t;
   lab = 'THEIR CLEAR';
  } else if (G.bcC) {
   t = G.bcC.t;
   lab = 'THEY GET IN';
  }
 }
 if (t == null || t > 5) return;
 const s = lab + ' ' + Math.max(0, Math.ceil(t)), w = s.length * 4 + 6;
 rect(W / 2 - w / 2, 18, w, 8, 'rgba(0,0,0,.6)');
 text(s, W / 2, 19, 1, t <= 2 && Math.floor(G.t * 4) % 2 ? '#ff4040' : '#ffd23a', 'center');
}

function onTap(x, y) {
 if (screen === 'banner' && game.bannerT > .5) game.bannerT = 99; else if (screen === 'cpu' && game.cpu && game.cpu.res && game.cpu.beats[game.cpu.bi].t > .5) afterCpu(); else if (screen === 'pregame' && game.walk && !game.walkDone) {
  if (game.walk.t > .15) walkEnd2314(game, 'tap');
 } else if (screen === 'pregame' && game.preT > .6) game.preT = 99; else if (screen === 'qbreak' && game.qT > .6) game.qT = 99;
}

function button(label, x, y, w, h, fn, opt = {}) {
 if (!SA2403B) y -= sa2403Dy(y, h + 2);
 hit(label, x, y, w, h, fn, label);
 rect(x, y + 2, w, h, '#000');
 rect(x, y, w, h, opt.bg || '#2cc4dc');
 rect(x, y, w, 1, 'rgba(255,255,255,.35)');
 const sc = opt.sc || 1;
 if (opt.pad333 && sc === 1 && !window.__rl_v124gb && !window.__rl_no333pad && textW(fold2318(label), 1) > w - 10) {
  textFit333(label, x + w / 2, y, h, opt.fg || '#0b1a20', w - 10);
  window.__fit333.bx = x;
  window.__fit333.bw = w;
  window.__fit333.by = y;
  window.__fit333.bh = h;
  return;
 }
 if (opt.fit && sc === 1 && textW(label, 1) > w - 2) {
  textMini(label, x + w / 2, y + Math.round((h - 3) / 2), opt.fg || '#0b1a20');
  return;
 }
 text(label, x + w / 2, y + Math.round((h - 5 * sc) / 2), sc, opt.fg || '#0b1a20', 'center');
}

const SPOTS = [ [ GX - 140, CY ], [ GX - 100, CY - 46 ], [ GX - 100, CY + 46 ], [ GX - 34, CY - 52 ], [ GX - 34, CY + 52 ] ];

function mkPlayer(team, idx, x, y) {
 return {
  team: team,
  idx: idx,
  x: x,
  y: y,
  tx: x,
  ty: y,
  spd: team === 'O' ? 44 : team === 'D' ? 40 : 30,
  anim: 0,
  wander: rnd(.5, 2.5),
  react: 0
 };
}

let newGameCount = 0;

function newGame(user, opp, mode, userHome, meta) {
 newGameCount++;
 if (mode === 'quick' && !(meta && meta.online) && window.GHO16 && GHO16.on() && (TEAMS.some(x => x.id === user) || WT_REG[user] || GH_REG[user])) {
  LS.set('qteam16', user);
  if (!window.__rl_noqt26) LS.set('qplay26', user);
 } else if (mode === 'quick' && !(meta && meta.online) && window.GHO16 && GHO16.on() && SZ_REG[user] && SZ_REG[user].col26) qt26(user);
 const [uk, ok] = window.UNI21 && UNI21.on() ? UNI21.gameKits(user, opp, userHome, mode, meta) : kits(user, opp, userHome);
 const src = mode === 'season' ? 'season' : 'real';
 game = {
  user: user,
  opp: opp,
  mode: mode,
  userHome: userHome,
  meta: meta || null,
  uk: uk,
  ok: ok,
  src: src,
  score: [ 0, 0 ],
  q: 1,
  clock: QLEN,
  ot: false,
  possCount: 0,
  diff: 1,
  periods: 4,
  qlen: QLEN,
  twoPt: false,
  pts2: [ 0, 0 ],
  players: [],
  ball: null,
  carrier: null,
  shotClock: SHOT_CLOCK,
  aimOff: 0,
  banner: null,
  bannerT: 0,
  cpuT: 0,
  cpu: null,
  t: 0,
  stats: {
   shots: 0,
   goals: 0,
   fow: 0,
   fot: 0
  },
  over: false,
  ripple: 0,
  crowd: 0,
  preT: 0,
  lu: [ lineupFor(user, src), lineupFor(opp, src) ],
  oset: LS.get('oset', '3-3'),
  dset: LS.get('dset', 'man'),
  rideU_call: LS.get('ride', '10-MAN RIDE'),
  clrSel: LS.get('clrSel', null),
  cpuDef: 'man',
  cpuSet: '3-3',
  tos: [ 2, 2 ],
  pen: null,
  pens: 0,
  emo: null,
  md: null,
  penLog: [],
  scorers: []
 };
 if (window.V22) V22.fixGame(game);
 if (window.CP2319) CP2319.stripGame(game);
 if (!SETS[game.oset]) game.oset = '3-3';
 game.dPlay = LS.get('dplay', null);
 if (game.dset === 'custom') {
  if (!(game.dPlay && dCustomPlays().some(p => p.id === game.dPlay))) game.dset = 'man';
 } else if (game.dset !== 'zone') game.dset = 'man';
 game.lk2503 = lock2503(game);
 applyDiff();
 game.diff = game.lk2503 != null ? game.lk2503 : SETTINGS.diff;
 game.periods = SETTINGS.halves ? 2 : 4;
 game.qlen = SETTINGS.qlen * (SETTINGS.halves ? 2 : 1);
 game.clock = game.qlen;
 game.twoPt = SETTINGS.twoPt;
 screen = 'pregame';
 camX = MIDX - W / 2;
 BOOST = null;
 const V = V14(game), lu0 = game.lu[0];
 V.lu0 = [ ...lu0.A, ...lu0.M, ...lu0.D, lu0.LSM, lu0.SSDM, lu0.SSDM2, lu0.FO, lu0.G ].filter(Boolean);
 if (mode === 'season' && season && season.team === user) {
  seasonInit14(season);
  BOOST = boostFor14(season);
  if (season.phase === 'reg' && season.punchWk >= 0 && !season.punchDone && season.week >= season.punchWk) game.punchArmed = true;
 }
 if (mode !== 'season') {
  const sz = [ user, opp ].map(id => SZ_REG[id]).filter(Boolean);
  if (sz.length) BOOST = Object.assign({}, ...sz.map(t => t.boost || {}));
 }
 game.night = meta && meta.night != null ? !!meta.night : mode === 'season' ? seasonNight15(season, meta && meta.label, opp) : mode === 'tutorial' ? false : !!menuSel.night;
 if (window.GHO16 && GHO16.on() && GH_REG[userHome ? user : opp]) game.night = true;
 if (window.V17) try {
  V17.gameStart(game);
 } catch (e) {
  console.error(e);
 }
}

function seasonNight15(S, label, opp) {
 if (!S) return false;
 return seedOf('tod|' + S.year + '|' + String(label || '').replace(/ OF \d+$/, '') + '|' + [ S.team, opp ].sort().join('-')) % 5 < 2;
}

function homeTeam() {
 if (!game) return T(TEAMS.some(t => t.id === menuSel.team) ? menuSel.team : 'ATL');
 if (game.st28home && (game.st28home === game.user || game.st28home === game.opp)) return T(game.st28home);
 return T(game.userHome ? game.user : game.opp);
}

function teamRosterIds(teamId, src) {
 if (src === 'season' && season && season.rosters && season.rosters[teamId]) return season.rosters[teamId];
 return T(teamId).roster;
}

function autoLineup(ids) {
 const ps = ids.map(PP).filter(Boolean);
 const offU = new Set, defU = new Set;
 const take = (set, pos, n, key, fb) => {
  const out = [];
  const rank = arr => arr.filter(p => !set.has(p.id)).sort((a, b) => key(b) - key(a));
  for (const p of rank(ps.filter(p => pos.includes(p.pos)))) {
   if (out.length >= n) break;
   out.push(p.id);
   set.add(p.id);
  }
  if (out.length < n) for (const p of rank(ps.filter(p => fb.includes(p.pos)))) {
   if (out.length >= n) break;
   out.push(p.id);
   set.add(p.id);
  }
  if (out.length < n) for (const p of rank(ps)) {
   if (out.length >= n) break;
   out.push(p.id);
   set.add(p.id);
  }
  return out;
 };
 const ovr = p => p.ovr, dk = p => p.r.def, fk = p => p.r.fo, sk = p => p.r.sav;
 const lu = {};
 lu.G = take(new Set, [ 'G' ], 1, sk, [])[0];
 offU.add(lu.G);
 defU.add(lu.G);
 lu.A = take(offU, [ 'A' ], 3, ovr, [ 'M' ]);
 lu.M = take(offU, [ 'M', 'A' ], 3, p => p.ovr + (p.pos === 'M' ? 3 : 0), [ 'LSM' ]);
 lu.D = take(defU, [ 'D' ], 3, ovr, [ 'LSM' ]);
 lu.LSM = take(defU, [ 'LSM' ], 1, ovr, [ 'D' ])[0];
 const ssdm = ps.filter(p => p.pos === 'M' && !lu.M.includes(p.id) && !defU.has(p.id)).sort((a, b) => b.r.def - a.r.def)[0];
 lu.SSDM = ssdm ? ssdm.id : take(defU, [ 'M' ], 1, dk, [ 'A', 'FO' ])[0];
 defU.add(lu.SSDM);
 const ssdm2 = ps.filter(p => p.pos === 'M' && !lu.M.includes(p.id) && !defU.has(p.id)).sort((a, b) => b.r.def - a.r.def)[0];
 lu.SSDM2 = ssdm2 ? ssdm2.id : take(defU, [ 'M', 'LSM' ], 1, dk, [ 'A', 'FO', 'D' ])[0];
 defU.add(lu.SSDM2);
 lu.FO = (ps.filter(p => p.pos === 'FO').sort((a, b) => b.r.fo - a.r.fo)[0] || ps.slice().sort((a, b) => b.r.fo - a.r.fo)[0]).id;
 return lu;
}

function lineupValid(lu, ids) {
 if (!lu || !lu.A || !lu.M || !lu.D || lu.A.length !== 3 || lu.M.length !== 3 || lu.D.length !== 3) return false;
 const has = new Set(ids);
 const all = [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ];
 if (!all.every(id => id && (has.has(id) || PP(id) && PP(id).leg || window.V22 && V22.okSub(id)) && PP(id))) return false;
 const o = [ ...lu.A, ...lu.M ], d = [ ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2 ];
 return new Set(o).size === 6 && new Set(d).size === 6 && !o.includes(lu.G) && !d.includes(lu.G);
}

function injOf(id) {
 return season && season.inj && season.inj[id] && season.inj[id].g > 0 ? season.inj[id] : null;
}

function availIds(teamId, src) {
 const ids = teamRosterIds(teamId, src);
 if (src !== 'season') return ids;
 const a = ids.filter(id => !injOf(id));
 return a.length >= 12 ? a : ids;
}

function migrateLineup(old, ids) {
 try {
  const has = new Set(ids), fresh = autoLineup(ids), lu = JSON.parse(JSON.stringify(old));
  if (!lu || !lu.A || !lu.M || !lu.D) return fresh;
  const used = new Set, ok = id => id && has.has(id) && PP(id);
  const fill = (k, cur, unitSet) => {
   if (ok(cur) && !unitSet.has(cur)) {
    unitSet.add(cur);
    return cur;
   }
   const alt = [ fresh[k] ].flat().concat(ids).find(id => ok(id) && !unitSet.has(id) && id !== lu.G);
   unitSet.add(alt);
   return alt;
  };
  if (!ok(lu.G)) lu.G = fresh.G;
  const o = new Set([ lu.G ]), d = new Set([ lu.G ]);
  lu.M = [ 0, 1, 2 ].map(i => fill('M', lu.M[i], o));
  lu.A = [ 0, 1, 2 ].map(i => fill('A', lu.A[i], o));
  lu.D = [ 0, 1, 2 ].map(i => fill('D', lu.D[i], d));
  lu.LSM = fill('LSM', lu.LSM, d);
  lu.SSDM = fill('SSDM', lu.SSDM, d);
  lu.SSDM2 = fill('SSDM2', lu.SSDM2, d);
  if (!ok(lu.FO)) lu.FO = fresh.FO;
  return lu;
 } catch (e) {
  return autoLineup(ids);
 }
}

function lineupFor(teamId, src) {
 const ids = availIds(teamId, src);
 let lu = src === 'season' ? season && season.lineups && season.lineups[teamId] : LS.get('lu_' + teamId, null) || SZ_REG[teamId] && SZ_REG[teamId].szLu || null;
 if (lu && !lineupValid(lu, ids)) lu = migrateLineup(lu, ids);
 if (!lineupValid(lu, ids)) lu = autoLineup(ids);
 return JSON.parse(JSON.stringify(lu));
}

function saveLineup(teamId, src, lu) {
 if (src === 'season' && season) {
  season.lineups = season.lineups || {};
  season.lineups[teamId] = lu;
  LS.set('season', season);
 } else LS.set('lu_' + teamId, lu);
}

const offUnit = lu => [ lu.M[0], lu.M[1], lu.M[2], lu.A[0], lu.A[1], lu.A[2] ].map(PP);

const defUnit = lu => [ lu.SSDM, lu.LSM, lu.SSDM2, lu.D[0], lu.D[1], lu.D[2] ].map(PP);

const NORM = {
 spd: 70,
 pow: 70,
 acc: 70,
 fin: 70,
 stk: 70,
 str: 70,
 def: 70,
 gb: 70,
 fo: 70,
 sav: 70
};

(function computeNorms() {
 const acc = {};
 SKILLS.forEach(k => acc[k] = []);
 for (const t of TEAMS) {
  const lu = autoLineup(t.roster), o = offUnit(lu), d = defUnit(lu);
  for (const p of o) [ 'pow', 'acc', 'fin', 'stk', 'str' ].forEach(k => acc[k].push(p.r[k]));
  for (const p of d) acc.def.push(p.r.def);
  for (const p of o.concat(d)) {
   acc.spd.push(p.r.spd);
   acc.gb.push(p.r.gb);
  }
  acc.fo.push(PP(lu.FO).r.fo);
  acc.sav.push(PP(lu.G).r.sav);
 }
 for (const k of SKILLS) if (acc[k].length) NORM[k] = acc[k].reduce((a, b) => a + b, 0) / acc[k].length;
})();

const EGG_NORM_V11 = {
 'Charlie McGuire': {
  spd: 36,
  gb: 32
 },
 'Luke McKinney': {
  spd: 30,
  gb: 30
 },
 'Maddox Baucom': {
  spd: 34,
  gb: 31
 },
 'Carson Maloney': {
  spd: 33,
  gb: 28
 },
 'Chase BH': {
  spd: 29,
  gb: 29
 },
 'Van Jantzen': {
  spd: 31,
  gb: 33
 }
};

const NORM_POS = {};

(function() {
 for (const pos of [ 'A', 'M', 'FO', 'LSM', 'D', 'G' ]) {
  const ps = Object.values(PLAYERS).filter(p => p.pos === pos && !p.egg13 && !p.leg);
  NORM_POS[pos] = {};
  for (const k of [ 'spd', 'gb' ]) NORM_POS[pos][k] = ps.length ? ps.reduce((a, p) => a + (EGG_NORM_V11[p.n] && p.egg ? EGG_NORM_V11[p.n][k] : p.r[k]), 0) / ps.length : NORM[k];
 }
})();

function wSkin16(p, set) {
 return set[seedOf('wskin:' + p.id) % set.length];
}

const WSKIN16 = {};

for (const t of TEAMS) for (const id of t.roster) {
 const p = PLAYERS[id];
 if (p && p.real) WSKIN16[(p.n0 != null ? p.n0 : p.n).toLowerCase()] = p.skin;
}

const WTEAMS = (DATA.world || []).map(t => {
 const tm = {
  id: t.id,
  abbr: t.abbr,
  name: t.name.toUpperCase(),
  full: t.full || t.name,
  city: (t.city || '').toUpperCase(),
  lg: 'WORLD TEAM',
  era: '2023 WORLDS',
  c1: t.c1,
  c2: t.c2,
  icon: t.icon,
  coach: t.coach || '',
  coachNote: t.coachNote || '',
  off: 4,
  def: 4,
  world: true,
  tier: t.tier,
  realBase: t.realBase
 };
 tm.roster = t.players.map((a, i) => {
  const p = {
   id: t.id + '-' + i,
   n: a[0],
   pos: a[1],
   r: {},
   real: !!a[12],
   team: t.id,
   world: true,
   wnum: a[13] != null ? a[13] : null
  };
  if (a.n0 != null) p.n0 = a.n0;
  SKILLS.forEach((k, j) => p.r[k] = a[2 + j]);
  p.ovr = ovrOf(p);
  PLAYERS[p.id] = p;
  const v = SKINS[p.id];
  p.skin = v != null && v >= 0 && v <= 5 ? v | 0 : WSKIN16[(p.n0 != null ? p.n0 : p.n).toLowerCase()] != null ? WSKIN16[(p.n0 != null ? p.n0 : p.n).toLowerCase()] : Array.isArray(t.skins) && t.skins.length ? wSkin16(p, t.skins) : defaultSkin(p);
  return p.id;
 });
 WT_REG[tm.id] = tm;
 return tm;
});

const WT16_2318 = WTEAMS.slice(0, 16).map(t => t.id);

function on2318() {
 return !window.__rl_no2318 && !window.__rl_v124gb;
}

function wtList2318() {
 return on2318() ? WTEAMS : WTEAMS.filter(t => WT16_2318.includes(t.id));
}

function rf(pl, k) {
 if (!pl || !pl.r) return 0;
 const n = (k === 'spd' || k === 'gb') && NORM_POS[pl.pos] && pl.n !== 'AVG' ? NORM_POS[pl.pos][k] : NORM[k];
 const bo = BOOST && BOOST[pl.id];
 return clamp((pl.r[k] + (bo ? bo[k] || 0 : 0) - n) / 12, -2, 2);
}

const pr = (p, k) => window.V17H && (k === 'stk' || k === 'acc') && p && p.pl && p.pl.r ? rf(p.pl, k) + window.V17H(p, k) : rf(p && p.pl, k);

function hunchTick204(G, dt) {
 const H = G && G.h204;
 if (!H) return;
 const p = G.players.includes(H.ref) ? H.ref : G.players.find(q => q.pl && q.pl.id === H.id && !q.far);
 if (!p) {
  H.on = false;
  return;
 }
 H.ref = p;
 if (p.down > 0) {
  H.on = false;
  return;
 }
 H.on = true;
 H.left -= dt;
 if (H.left <= 0) G.h204 = null;
}

function hunch204(p) {
 const H = game && game.h204;
 return !!(H && H.on && p && p === H.ref && (screen === 'live' || screen === 'defense'));
}

function spdMul(p) {
 return p && p.pl && p.team !== 'G' && p.team !== 'G2' ? (1 + .09 * rf(p.pl, 'spd')) * (DF.spd || 1) * (hunch204(p) ? .45 : 1) : 1;
}

function unitPower(lu) {
 const o = offUnit(lu), d = defUnit(lu);
 const shoot = p => rf(p, 'fin') * .25 + rf(p, 'acc') * .25 + rf(p, 'pow') * .2 + rf(p, 'str') * .15 + rf(p, 'stk') * .15;
 return {
  off: o.reduce((a, p) => a + shoot(p), 0) / o.length,
  def: d.reduce((a, p) => a + rf(p, 'def') * .7 + rf(p, 'gb') * .15 + rf(p, 'spd') * .15, 0) / d.length,
  gk: rf(PP(lu.G), 'sav'),
  fo: rf(PP(lu.FO), 'fo'),
  shoot: shoot
 };
}

const ON = id => game && game.lu ? game.lu[id] : null;

const SETS = {
 '3-3': [ [ GX - 140, CY ], [ GX - 104, CY - 50 ], [ GX - 104, CY + 50 ], [ GX - 36, CY - 54 ], [ GX - 36, CY + 54 ], [ GX - 26, CY ] ],
 '2-3-1': [ [ GX - 128, CY - 26 ], [ GX - 128, CY + 26 ], [ GX - 66, CY - 56 ], [ GX - 66, CY + 56 ], [ GX - 26, CY + 2 ], [ GX + 22, CY ] ],
 '1-4-1': [ [ GX - 140, CY ], [ GX - 92, CY - 52 ], [ GX - 92, CY + 52 ], [ GX - 27, CY - 25 ], [ GX - 27, CY + 25 ], [ GX + 22, CY + 4 ] ],
 '2-2-2': [ [ GX - 128, CY - 30 ], [ GX - 128, CY + 30 ], [ GX - 62, CY - 54 ], [ GX - 62, CY + 54 ], [ GX - 2, CY - 48 ], [ GX - 2, CY + 48 ] ]
};

SETS['OPEN'] = [ [ GX - 104, CY ], [ GX - 74, CY - 54 ], [ GX - 74, CY + 54 ], [ GX - 12, CY - 58 ], [ GX - 12, CY + 58 ], [ GX + 28, CY ] ];

const SET_NAMES = [ '3-3', '2-3-1', '1-4-1', '2-2-2', 'OPEN' ];

const SET_NAMES_V12 = [ '3-3', '2-3-1', '1-4-1', '2-2-2' ];

SETS['1-3-2'] = [ [ GX - 140, CY ], [ GX - 84, CY - 56 ], [ GX - 84, CY + 56 ], [ GX - 62, CY ], [ GX + 4, CY - 42 ], [ GX + 4, CY + 42 ] ];

const USER_SETS = [ '3-3', '2-3-1', '1-4-1', '1-3-2', '2-2-2', 'OPEN' ];

function V13ON() {
 return !window.__rl_v124gb && !window.__rl_v125;
}

const SET_INFO = {
 'OPEN': 'NOBODY ON THE CREASE - ALL 6 IN A BIG CIRCLE, SPACE TO DODGE',
 '3-3': 'THREE MIDDIES UP TOP, THREE ATTACK LOW - THE CLASSIC LOOK',
 '2-3-1': 'TWO TOP, TWO WINGS, ONE ON THE CREASE, ONE AT X',
 '1-4-1': 'ONE TOP, TWO WINGS, TWO ON THE CREASE, ONE AT X',
 '2-2-2': 'TWO TOP, TWO WINGS, TWO AT GLE',
 '1-3-2': 'ONE TOP, THREE ACROSS THE MIDDLE, TWO LOW AT GLE'
};

const EMO = {
 '3-3 EMO': [ [ GX - 118, CY - 40 ], [ GX - 128, CY ], [ GX - 118, CY + 40 ], [ GX - 32, CY - 46 ], [ GX - 32, CY + 46 ], [ GX - 24, CY ] ],
 '2-3-1 ROTATION': [ [ GX - 124, CY - 28 ], [ GX - 124, CY + 28 ], [ GX - 70, CY - 56 ], [ GX - 70, CY + 56 ], [ GX - 26, CY ], [ GX + 22, CY ] ],
 'SKIP TO CREASE': [ [ GX - 128, CY ], [ GX - 92, CY - 54 ], [ GX - 92, CY + 54 ], [ GX - 25, CY - 22 ], [ GX - 25, CY + 22 ], [ GX + 20, CY ] ]
};

const EMO_INFO = {
 '3-3 EMO': 'SPREAD THEM OUT, MOVE IT, SHOOT FROM UP TOP',
 '2-3-1 ROTATION': 'ROTATE IT AROUND THE PERIMETER, FEED FROM X',
 'SKIP TO CREASE': 'TWO GUYS ON THE CREASE - SKIP IT INSIDE'
};

const ZONES = {
 zone: [ [ 82, -40 ], [ 94, 0 ], [ 82, 40 ], [ 34, -34 ], [ 24, 0 ], [ 34, 34 ] ],
 'BOX + 1': [ [ 74, -28 ], [ 74, 28 ], [ 28, -28 ], [ 28, 28 ], [ 98, 0 ] ],
 'CREASE STRING': [ [ 66, 0 ], [ 24, -30 ], [ 28, 0 ], [ 24, 30 ], [ 86, -30 ] ],
 'ZONE ROTATE': [ [ 80, -34 ], [ 80, 34 ], [ 36, -36 ], [ 36, 36 ], [ 96, 0 ] ]
};

const MD_NAMES = [ 'CREASE STRING', 'BOX + 1', 'ZONE ROTATE' ];

const MD_INFO = {
 'CREASE STRING': 'SIT ON THE CREASE, TAKE AWAY THE INSIDE',
 'BOX + 1': 'A BOX THAT ROTATES, ONE PRESSES THE BALL',
 'ZONE ROTATE': 'HOLD YOUR AREAS, SLIDE TO THE BALL'
};

const EMO_VS = {
 '3-3 EMO': {
  'CREASE STRING': .06,
  'BOX + 1': -.02,
  'ZONE ROTATE': -.05
 },
 '2-3-1 ROTATION': {
  'CREASE STRING': -.03,
  'BOX + 1': .05,
  'ZONE ROTATE': -.02
 },
 'SKIP TO CREASE': {
  'CREASE STRING': -.07,
  'BOX + 1': .02,
  'ZONE ROTATE': .05
 }
};

function curSpots() {
 const G = game;
 if (!G) return SETS['3-3'];
 if (G.pen && G.pen.side === 'C' && G.emo) return EMO[G.emo];
 return SETS[G.oset] || SETS['3-3'];
}

function zoneTargets(list, kind, ballX, ballY, leftCage) {
 const spots = (ZONES[kind] || ZONES.zone).slice(0, list.length);
 const gx = leftCage ? DGX : GX, sgn = leftCage ? 1 : -1;
 const pts = spots.map(([dx, dy]) => {
  const x = gx + sgn * dx, y = CY + dy;
  return [ x + (ballX - x) * .22, y + (ballY - y) * .25 ];
 });
 let onBall = -1, bd = 1e9;
 pts.forEach((q, i) => {
  const d = Math.hypot(q[0] - ballX, q[1] - ballY);
  if (d < bd) {
   bd = d;
   onBall = i;
  }
 });
 return {
  pts: pts,
  onBall: bd < 60 ? onBall : -1
 };
}

function setupPossession(fromX, fromY) {
 if (game && game.cset) clrEnd();
 const PL = [], spots = curSpots(), ou = offUnit(game.lu[0]), du = defUnit(game.lu[1]);
 spots.forEach((s, i) => {
  const a = mkPlayer('O', i, s[0] + rnd(-4, 4), s[1] + rnd(-4, 4));
  a.home = s.slice();
  a.pl = ou[i];
  if (a.x > GX - 6) a.x = GX - 8 - rnd(0, 6);
  PL.push(a);
 });
 for (let i = 0; i < 6; i++) {
  const a = PL[i];
  const d = mkPlayer('D', i, a.x + 9, a.y + (CY - a.y) * .12);
  d.mark = a;
  a.mark0 = d;
  d.pl = du[i];
  PL.push(d);
 }
 const gk = mkPlayer('G', 0, GX - 5, CY);
 gk.pl = PP(game.lu[1].G);
 PL.push(gk);
 game.players = PL;
 game.goalie = gk;
 setRoles(PL.filter(p => p.team === 'O'), [ 'M', 'M', 'M', 'A', 'A', 'A' ]);
 setRoles(PL.filter(p => p.team === 'D'), [ 'M', 'M', 'M', 'D', 'D', 'D' ]);
 farInit('uO');
 applyPenaltyLive();
 const c = game.players.find(p => p.team === 'O');
 game.carrier = c;
 if (fromX != null) {
  c.x = clamp(fromX, MIDX + 6, GX - 60);
  c.y = clamp(fromY, FT + 10, FB - 10);
 } else {
  c.x = GX - 150;
 }
 game.ball = {
  x: c.x + BX,
  y: c.y + BY,
  state: 'held',
  vx: 0,
  vy: 0
 };
 resetPossState();
 screen = 'live';
}

function resetPossState() {
 game.uchk = null;
 game.uSlow = 0;
 game.shotClock = SHOT_CLOCK;
 game.checkT = 0;
 game.pressure = 0;
 game.slide = null;
 game.liveT = 0;
 game.aimOff = 0;
 game.run = null;
 game.stopFlash = 0;
 game.splitCd = 0;
 game.slide = null;
 game.rot = null;
 game.drive = false;
 game.driveT = 0;
 game.calmT = 0;
 game.beatT = 0;
 game.rippleL = false;
 game.checkT = -1.5;
 game.ctrl = null;
 game.gb = null;
 game.chase = null;
 game.chasers = [];
 game.help18 = null;
 game.st18 = null;
 game.clearing = false;
 game.cpuClear = false;
 game.cc = null;
 game.bc = null;
 game.overSeen = false;
 game.ruleGrace = .6;
 game.ruleCall = null;
 game.possCount++;
}

function liveFromFaceoff(scooper) {
 const G = game, F = G.players;
 const mine = F.filter(p => p.team === 'O'), theirs = F.filter(p => p.team === 'D');
 const wings = mine.filter(p => p !== scooper);
 const P = [];
 const mk = (src, team, i, x, y) => {
  const p = mkPlayer(team, i, x, y);
  if (src) {
   p.x = src.x;
   p.y = src.y;
   p.anim = src.anim;
   p.pl = src.pl;
  }
  return p;
 };
 const SP = curSpots(), ou = offUnit(G.lu[0]), du = defUnit(G.lu[1]);
 const c = mk(scooper, 'O', 0, 0, 0);
 c.home = SP[0].slice();
 P.push(c);
 wings.sort((a, b) => a.y - b.y);
 [ 1, 2 ].forEach((si, k) => {
  const w = wings[k];
  const a = mk(w, 'O', si, Math.min(GX - 8, SP[si][0]), SP[si][1]);
  if (!w) a.pl = ou[si];
  a.home = SP[si].slice();
  P.push(a);
 });
 const fa = (G.farU || []).filter(f => f.role === 'A');
 [ 3, 4, 5 ].forEach((si, k) => {
  const f = fa[k];
  const a = mkPlayer('O', si, f ? f.x : Math.min(GX - 8, SP[si][0]) + rnd(-3, 3), f ? f.y : SP[si][1] + rnd(-3, 3));
  a.home = SP[si].slice();
  a.pl = ou[si];
  P.push(a);
 });
 P.sort((a, b) => a.idx - b.idx);
 const tf = theirs.slice().sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y));
 const fdC = (G.farC || []).filter(f => f.role === 'D');
 for (let i = 0; i < 6; i++) {
  const a = P[i];
  let d;
  if (i === 0) d = mk(tf[0], 'D', 0, 0, 0); else if (i <= 2) {
   d = mk(tf[i], 'D', i, a.x + 9, a.y);
   if (!tf[i]) d.pl = du[i];
  } else {
   const fm = fdC.length === 3 && fa.length === 3 && fdC.every(q => q.foMark && fa.includes(q.foMark)) && new Set(fdC.map(q => q.foMark)).size === 3;
   const f = fm ? fdC.find(q => q.foMark === fa[i - 3]) : fdC[i - 3];
   d = mkPlayer('D', i, f ? f.x : a.x + 9, f ? f.y : a.y + (CY - a.y) * .12);
   d.pl = du[i];
  }
  d.mark = a;
  a.mark0 = d;
  d.react = i <= 2 ? rnd(.1, .3) : .05;
  P.push(d);
 }
 const gk = G.goalie;
 gk.team = 'G';
 P.push(gk);
 setRoles(P.filter(p => p.team === 'O'), [ 'M', 'M', 'M', 'A', 'A', 'A' ]);
 setRoles(P.filter(p => p.team === 'D'), [ 'M', 'M', 'M', 'D', 'D', 'D' ]);
 {
  const g2 = theirs.length >= 0 ? F.find(p => p.team === 'G2') || null : null;
  const fU = (G.farU || []).filter(f => f.role === 'D');
  fU.push(farMk('U', 'G', g2 ? g2.x : DGX + 5, g2 ? g2.y : CY, PP(G.lu[0].G)));
  const fC = (G.farC || []).filter(f => f.role === 'A');
  fC.forEach((f, i) => {
   f.rest = [ MIDX - 44 - (i === 1 ? 16 : 0), CY - 44 + 44 * i ];
  });
  fU.forEach((f, i) => {
   if (f.role === 'D') f.rest = [ MIDX - 55, CY - 44 + 44 * i ];
  });
  G.farU = fU;
  G.farC = fC;
  G.farMode = 'uO';
  farPair(G);
 }
 G.ruleGrace = .8;
 G.players = P;
 G.goalie = gk;
 G.carrier = c;
 applyPenaltyLive();
 for (const p of P) if (p.team === 'O' && p !== c) {
  p.tx = p.home[0];
  p.ty = p.home[1];
  p.wander = Math.hypot(p.home[0] - p.x, p.home[1] - p.y) / PACE.cut + .4;
  p.spd = PACE.cut * 1.1;
 }
 G.ball = {
  x: c.x + BX,
  y: c.y + BY,
  state: 'held',
  vx: 0,
  vy: 0
 };
 resetPossState();
 G.checkT = -1.2;
 G.run = {
  x: 1,
  y: 0
 };
 G.foLive = 1.2;
 addFx('txt', c.x, c.y - 26, {
  s: 'FACEOFF WIN!',
  col: '#ffe14d',
  life: 1.1
 });
 eventChirp('faceoff_win', .6, c.x, c.y - 36);
 stick = null;
 shootP = null;
 screen = 'live';
 try {
  trn193(G, 'faceoff');
 } catch (e) {
  console.error(e);
 }
}

function canShoot() {
 return screen === 'live' && game && game.ball.state === 'held' && game.carrier && game.carrier.team === 'O';
}

function ballLive() {
 return !!game && game.ball && (game.ball.state === 'loose' || game.ball.state === 'chase');
}

function ctrlOk() {
 return screen === 'live' && ballLive() && !!game.ctrl;
}

function nearestOf(team, x, y, list) {
 let best = null, bd = 1e9;
 for (const p of list || game.players) if (p.team === team) {
  const d = Math.hypot(p.x - x, p.y - y);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 return best;
}

function gbRest(b) {
 const sp = Math.hypot(b.vx, b.vy);
 if (sp < 1) return {
  x: b.x,
  y: b.y
 };
 const d = sp * sp / (2 * GB.fric);
 return {
  x: clamp(b.x + b.vx / sp * d, MIDX + 6, FL - 9),
  y: clamp(b.y + b.vy / sp * d, FT + 4, FB - 2)
 };
}

function pickChasers(x, y, n, chase) {
 const ds = game.players.filter(p => p.team === 'D').sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)).slice(0, n || 2);
 ds.forEach((d, i) => {
  d.gbReact = ((chase ? rnd(GB.cReact0, GB.cReact1) : rnd(GB.react0, GB.react1)) + i * .15) * clamp(1 - .08 * pr(d, 'gb'), .75, 1.25);
 });
 return ds;
}

const UCHK = {
 every: [ .6, .9 ],
 range: 11,
 open: .14,
 still: .4,
 traffic: .5,
 bump: .6,
 decay: 3,
 ride: .6
};

function checkPop() {
 const G = game, c = G.carrier;
 if (!c) return;
 addFx('pop', c.x, c.y + BY);
 sfx12('check_clack', .8);
 game.checkSnd = (game.checkSnd || 0) + 1;
 let chk = null, cd = 1e9;
 for (const d of G.players) if (d.team === 'D') {
  const dd = Math.hypot(d.x - c.x, d.y - c.y);
  if (dd < cd) {
   cd = dd;
   chk = d;
  }
 }
 const a = Math.atan2(c.y - chk.y, c.x - chk.x) + rnd(-2.2, 2.2), v = rnd(40, 62);
 G.checks = (G.checks || 0) + 1;
 popLoose(c.x + BX, c.y + 1, Math.cos(a) * v, Math.sin(a) * v, 'check');
 c.stun = .35;
 if (!G.chasers.includes(chk)) G.chasers.unshift(chk);
 chk.gbReact = rnd(.15, .3);
}

function popLoose(x, y, vx, vy, kind) {
 const G = game, b = G.ball;
 if (G.carrier && G.carrier.pl && kind !== 'pipe') st14('to', G.carrier.pl);
 if (G.v14) G.v14.lastFeed = null;
 b.state = 'loose';
 b.x = x;
 b.y = y;
 b.vx = vx;
 b.vy = vy;
 b.z = 7;
 b.vz = 30;
 G.carrier = null;
 G.run = null;
 shootP = null;
 G.slide = null;
 G.rot = null;
 G.drive = false;
 G.gb = {
  t: 0,
  kind: kind
 };
 G.st18 = null;
 G.help18 = null;
 for (const p of G.players) p.stun = 0;
 const r = gbRest(b);
 G.ctrl = nearestOf('O', (x + r.x) / 2, (y + r.y) / 2);
 G.chasers = pickChasers((x + r.x) / 2, (y + r.y) / 2, 2);
 addFx('cue', 0, 0, {
  s: kind === 'check' ? 'CHECKED! GROUND BALL!' : kind === 'pipe' ? 'PIPE! GROUND BALL!' : kind === 'hit' ? 'LEVELED! GROUND BALL!' : kind === 'drop' ? 'DROPPED! GROUND BALL!' : kind === 'level' ? 'GOALIE LEVELED HIM! GROUND BALL!' : kind === 'bull' ? 'STOOD UP! GROUND BALL!' : 'GROUND BALL!',
  col: '#ffe14d',
  life: 1.2
 });
}

const SAG = {
 near: 72,
 far: 150,
 near2: ARC_R + 10,
 far2: ARC_R + 62,
 offBall: .8,
 cush: 24,
 hole: 14,
 ghost: 26,
 off: false
};

function sagLive() {
 const G = game;
 if (!G || G.tutorial || G.clearing || G.cpuClear || G.dclear || G.cset || G.ball && G.ball.state === 'clear') return false;
 const c = screen === 'defense' ? G.dcar : G.carrier;
 if (!c) return false;
 return screen === 'defense' ? c.x > RL_L : c.x < RL_R;
}

function threatOf(m, gx, hasBall, drive) {
 if (SAG.off || !V13ON() || !m) return 1;
 if (drive && hasBall) return 1;
 const two = game ? !!game.twoPt : !!SETTINGS.twoPt, n = two ? SAG.near2 : SAG.near, f = two ? SAG.far2 : SAG.far;
 const d = Math.hypot(m.x - gx, m.y - CY) / (hasBall ? 1 : SAG.offBall);
 return clamp((f - d) / (f - n), 0, 1);
}

const DEF = {
 near: 45,
 span: 90,
 sag: 1.5,
 drive: 1,
 recut: .6,
 r0: .15,
 r1: .35,
 recover: 1.5,
 lag: 3,
 tight: 5,
 adjOff: 4.5,
 holeF: .55,
 hole0: 13,
 hole1: 24
};

function segDist(px0, py0, ax, ay, bx, by) {
 const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1;
 const t = clamp(((px0 - ax) * vx + (py0 - ay) * vy) / L2, 0, 1);
 return Math.hypot(px0 - (ax + vx * t), py0 - (ay + vy * t));
}

function isOpen(p) {
 for (const d of game.players) if (d.team === 'D' && Math.hypot(d.x - p.x, d.y - p.y) < 10) return false;
 return true;
}

function runMag() {
 const r = game && game.run;
 return r && r.m != null ? clamp(r.m, .2, 1) : 1;
}

function liveTap() {
 if (game && game.tutorial && game.tutorial.f.swiped && canShoot()) tutFlag('stopped');
 if (ctrlOk()) {
  if (game.run) {
   game.run = null;
   game.stopFlash = .6;
   SFX.tap();
  }
  return;
 }
 if (!canShoot()) return;
 if (game.run) {
  game.run = null;
  game.stopFlash = .6;
  SFX.tap();
 }
}

function setRun(dx, dy, sharpHint) {
 const G = game, c = G && G.carrier;
 if (G) G.lastRun23 = {
  x: dx,
  t: G.t || 0
 };
 if (screen === 'defense') {
  if (G.ball.state !== 'clear') {
   G.run = {
    x: dx,
    y: dy
   };
   G.stopFlash = 0;
  } else if (G.dclear && G.dclear.holder) {
   if (G.dclear.holder.team === 'O' && rrOf(G.dclear.holder) === 'D') tutFlag('pushed');
   G.run = {
    x: dx,
    y: dy
   };
   G.dclear.moved = true;
   G.gkCarries = (G.gkCarries || 0) + (G.dclear.holder.team === 'G2' && !G.dclear.counted ? 1 : 0);
   G.dclear.counted = true;
  }
  return;
 }
 if (G.pset && canShoot() && G.pset.p284 && on284()) G.pset.user284 = true; else if (G.pset && canShoot()) return;
 if (canShoot()) tutFlag('swiped');
 if (ctrlOk()) {
  G.run = {
   x: dx,
   y: dy
  };
  G.stopFlash = 0;
  return;
 }
 if (!canShoot() || !c) return;
 const prev = G.run;
 G.run = {
  x: dx,
  y: dy
 };
 G.stopFlash = 0;
 const sharp = sharpHint !== undefined ? !!sharpHint : !prev || prev.x * dx + prev.y * dy < .3;
 if (!sharp || G.splitCd > 0) return;
 G.splitCd = .5;
 if (prev) {
  hardCut(c, dx, dy, true);
  G.dodgeT = .3;
  G.dodges = (G.dodges || 0) + 1;
  tutFlag('dodged');
  addFx('txt', c.x, c.y - 34, {
   s: 'DODGE!',
   col: '#8fe3f0',
   life: .5
  });
 }
 SFX.pass();
 let best = null, bd = 13;
 for (const d of G.players) if (d.team === 'D') {
  const dd = Math.hypot(d.x - c.x, d.y - c.y);
  if (dd < bd) {
   bd = dd;
   best = d;
  }
 }
 if (!best) return;
 const pBeat = clamp(.37 + .06 * pr(c, 'str') + .03 * pr(c, 'spd') - .06 * pr(best, 'def') + (G.pressure >= 2 ? -.1 : 0), .15, .65) * (DF.uBeat || 1);
 if (Math.random() < pBeat) {
  best.react = rnd(.7, 1);
  best.tx = best.x - dx * 12;
  best.ty = best.y - dy * 12;
  best.spd = PACE.dOff;
  G.checkT = -.7;
  G.beatT = .9;
  addFx('txt', c.x, c.y - 26, {
   s: 'SHOOK HIM!',
   col: '#7dff7a',
   life: .9
  });
  SFX.catch();
 } else if (prev && SHAKE.on) {
  const sd = shakeDelay(c, best);
  best.react = Math.max(best.react || 0, sd);
  G.shakes = (G.shakes || 0) + 1;
  G.lastShake = +sd.toFixed(2);
  best.tx = best.x + prev.x * 40 * sd;
  best.ty = best.y + prev.y * 40 * sd;
 }
}

function throwPass(to) {
 const b = game.ball, c = game.carrier;
 {
  const G = game;
  const near = c ? G.players.filter(d => d.team === 'D' && !(d.stun > 0) && Math.hypot(d.x - c.x, d.y - c.y) < 9) : [];
  if (near.length && !G.tutorial && Math.random() < FOUL.aiLate * cMul18()) G.lateFoul = {
   t: G.t + .45,
   who: near[0],
   side: 'C',
   on: c
  };
 }
 b.state = 'pass';
 b.from = c;
 b.fromX = c.x;
 b.to = to;
 b.x = c.x + BX;
 b.y = c.y + BY;
 c.shootT0 = menuT;
 game.carrier = null;
 game.aimOff = 0;
 SFX.pass();
 const ex = to.x + BX, ey = to.y + BY, L = Math.hypot(ex - b.x, ey - b.y);
 b.intercept = null;
 if (!game.tutorial) for (const d of game.players) {
  if (d.team !== 'D') continue;
  const t = clamp(((d.x - b.x) * (ex - b.x) + (d.y - 6 - b.y) * (ey - b.y)) / (L * L), 0, 1);
  if (t < .15 || t > .9) continue;
  const qx = b.x + (ex - b.x) * t, qy = b.y + (ey - b.y) * t;
  const dist = Math.hypot(d.x - qx, d.y - 6 - qy);
  if (dist < 8) {
   const p = (1 - dist / 8) * .55 * clamp(L / 80, .6, 1.3) * clamp(1 - .3 * pr(c, 'stk') + .2 * pr(d, 'def'), .35, 1.8);
   if (Math.random() < p * (DF.intc || 1)) {
    b.intercept = {
     d: d,
     x: qx,
     y: qy
    };
    break;
   }
  }
 }
 for (const d of game.players) if (d.team === 'D') d.react = rnd(.15, .4) * (DF.react || 1);
}

const GK = {
 r0: .1,
 r1: .12,
 spd: 30,
 reach: 2,
 pos: 2,
 spr0: .006,
 spr: .035,
 tset: .2,
 v6: 1.4
};

function shotPower(held) {
 return clamp(held / FULL_POWER_S, 0, 1);
}

function netSpot181(cn) {
 const up = cn < 2, high = cn % 2 === 0;
 return [ GX + (high ? 7 : 2), CY + (up ? -1 : 1) * (high ? 3 : 6) ];
}

function cornerTarget(cn) {
 const top = cn < 2, left = cn % 2 === 0;
 return {
  x: GX,
  y: CY + (top ? -1 : 1) * (MOUTH - 2.5) + (top ? -1 : 1) * (left ? 1.2 : -1.2),
  high: left,
  top: top,
  left: left
 };
}

const TIGHT22 = {
 r0: 16,
 r1: 6,
 spr: .02,
 soft: .1
};

function tight2002(c, team) {
 if (window.__rl_v124gb || window.__rl_no2002f8 || !c || !game) return 0;
 let m = 0;
 for (const d of game.players) {
  if (d.team !== team || d.gk || d.down > 0 || (d.react || 0) > .3) continue;
  const dd = Math.hypot(d.x - c.x, d.y - c.y);
  m = Math.max(m, clamp((TIGHT22.r0 - dd) / (TIGHT22.r0 - TIGHT22.r1), 0, 1));
 }
 return m;
}

function releaseShot(held, corner, type20) {
 if (!canShoot()) return;
 if (game.ball.s25) game.ball.s25 = null;
 if (window.V20 && V20.preShot(held, corner)) return;
 if (game.carrier.x > GX - 5) {
  addFx('txt', game.carrier.x, game.carrier.y - 26, {
   s: 'GET IN FRONT!',
   col: '#ff9a8a',
   life: .8
  });
  return;
 }
 const power = Math.max(.15, shotPower(held));
 const c = game.carrier, b = game.ball, tg = cornerTarget(corner || 0);
 b.creaseShot = inCrease(c, GX);
 let sp = (140 + 300 * power) * (1 + .12 * pr(c, 'pow'));
 const near = Math.hypot(GX - c.x, CY - c.y) < 44;
 let ang = Math.atan2(tg.y - (c.y + BY), tg.x - (c.x + BX)) + gauss() * (near ? GK.spr0 * .5 : GK.spr0 + GK.spr * power * power) * clamp(1 - .3 * pr(c, 'acc'), .4, 1.8);
 const tm8 = tight2002(c, 'D');
 if (tm8 > 0) {
  ang += gauss() * TIGHT22.spr * tm8;
  sp *= 1 - TIGHT22.soft * tm8;
 }
 b.state = 'shot';
 c.shootT0 = menuT;
 b.x = c.x + BX;
 b.y = c.y + BY;
 b.shotFrom = [ b.x, b.y ];
 b.vx = Math.cos(ang) * sp;
 b.vy = Math.sin(ang) * sp;
 b.power = power;
 b.shooter = c;
 b.corner = corner || 0;
 b.target = tg;
 game.lastShot = {
  corner: b.corner,
  name: CORNER_NAMES[b.corner],
  ty: tg.y,
  power: power,
  sp: sp,
  near: near,
  reach: 0,
  by: c.pl ? c.pl.id : null
 };
 game.lastShot.tight = +tm8.toFixed(2);
 game.carrier = null;
 game.stats.shots++;
 st14('sh', c.pl);
 SFX.shot(power);
 if (power >= .6) tutFlag('shotHard');
 const gk = game.goalie, opp = T(game.opp);
 const tt = (GX - 5 - b.x) / b.vx;
 gk.react = GK.r0 + Math.random() * GK.r1;
 gk.dive = clamp(b.y + b.vy * Math.max(0, tt), CY - MOUTH - 1, CY + MOUTH + 1);
 gk.reach = GK.reach * clamp(tt / GK.tset, .45, 1);
 gk.reach *= Math.random() < .5 ? 1.15 : .85;
 if (near) {
  gk.reach *= .5 * clamp(1 - .32 * pr(c, 'fin'), .4, 1.7);
  gk.react += .06;
 }
 if (near && Math.random() < clamp(.04 - .12 * pr(c, 'fin'), 0, .45)) {
  const fa = Math.atan2(gk.y - (c.y + BY), GX - 5 - (c.x + BX));
  b.vx = Math.cos(fa) * sp;
  b.vy = Math.sin(fa) * sp;
  gk.dive = gk.y;
  gk.reach = Math.max(gk.reach, 2.5);
  gk.react = 0;
  game.lastShot.flub = true;
 } else gk.reach *= GK.v6 * clamp(1 - .07 * pr(c, 'acc'), .8, 1.2);
 gk.reach *= clamp(1 + .13 * rf(gk.pl, 'sav'), .7, 1.3);
 gk.react = Math.max(.05, gk.react - .012 * rf(gk.pl, 'sav'));
 gk.reach *= DF.gk || 1;
 gk.react = Math.max(.05, gk.react * (DF.gkR || 1));
 {
  const sm = sunMul18(game, gk, 'C');
  if (sm !== 1) {
   gk.reach *= sm;
   game.lastShot.sun18 = +sm.toFixed(3);
  }
 }
 b.high = tg.high;
 game.lastShot.reach = gk.reach;
 {
  const dd = Math.hypot(GX - c.x, CY - c.y);
  b.aim14 = DF.level >= 4 && !near && dd > OUT14.r && !game.lastShot.flub ? {
   d: dd,
   acc: pr(c, 'acc'),
   pow: pr(c, 'pow'),
   lvl: DF.level,
   two: tp26(c)
  } : null;
 }
 gk.gspd = GK.spd * rnd(.8, 1.15) * .95 * (1 + .06 * rf(gk.pl, 'sav'));
 b.block = null;
 const vx = Math.cos(ang), vy = Math.sin(ang);
 for (const d of game.players) {
  if (d.team !== 'D') continue;
  const rx = d.x - b.x, ry = d.y - 6 - b.y, proj = rx * vx + ry * vy;
  if (proj < 4 || proj > 70) continue;
  if (Math.abs(rx * vy - ry * vx) < 3.5 && Math.random() < (near ? .15 : .5)) {
   b.block = {
    dist: proj
   };
   break;
  }
 }
 b.pipe = null;
 if (!b.block && Math.random() < PIPE_P) {
  const py = CY + (tg.top ? -1 : 1) * (MOUTH + .2);
  const pa = Math.atan2(py - b.y, GX - b.x);
  b.vx = Math.cos(pa) * sp;
  b.vy = Math.sin(pa) * sp;
  b.pipe = {
   y: py,
   top: tg.top
  };
 }
 try {
  shotAdj18(c, b, tg, held, sp);
 } catch (e) {
  console.error(e);
 }
 try {
  read18(c, b.corner, b, gk, GX, !!tg.top, sp);
 } catch (e) {
  console.error(e);
 }
 if (window.V20) try {
  V20.shot(c, b, tg, type20, sp);
 } catch (e) {
  console.error(e);
 }
}

const TAP18 = {
 held: .25,
 r: 36,
 mid: 7,
 p: .8,
 pTew: .75
}, POLE18 = {
 p: .2,
 stk: 63,
 pStep: .3,
 spd: 1.3,
 wide: .5
};

function pole18(c) {
 const ps = c && c.pl && c.pl.pos;
 return ps === 'D' || ps === 'LSM';
}

const M23 = {
 cross: .35,
 pushV: 40,
 cover: 4,
 wrong: 1.5,
 wrongClr: 2
};

function mid23(dt) {
 const G = game;
 if (!G || G.tutorial || window.__rl_v124gb || window.__rl_nofix23 || screen !== 'live' || !(dt > 0)) return;
 const b = G.ball, c = G.carrier;
 if (!b || !c || b.state !== 'held') {
  if (c) c._x23 = null;
  return;
 }
 const fwd = G.run && G.run.x > .25 || G.pAuto && G.pAuto[0] > c.x + 4 || G.lastRun23 && G.lastRun23.x > .25 && (G.t || 0) - G.lastRun23.t < .8;
 if (fwd && c.x > MIDX - 16 && c.x < MIDX + 7) {
  if (c._x23 != null && c.x <= c._x23 + .4 * dt * 10) c._t23 = (c._t23 || 0) + dt; else c._t23 = 0;
  if (c._t23 > M23.cross) {
   c.x += M23.pushV * dt;
   c.stun = 0;
   G.stoodUp = 0;
   for (const q of G.players) if (q !== c && q.team !== 'O' && q.x > c.x - 2 && q.x < c.x + 10 && Math.abs(q.y - c.y) < 8) q.y = clamp(q.y + (q.y >= c.y ? 1 : -1) * 30 * dt, FT + 12, FB - 2);
   if (!c._p23) {
    c._p23 = true;
    G.cross23 = (G.cross23 || 0) + 1;
    (G.m23log = G.m23log || []).push({
     k: 'cross',
     t: +G.t.toFixed(1),
     x: +c.x.toFixed(1),
     clearing: !!G.clearing,
     gk: !!c.gk
    });
   }
  }
 } else {
  c._t23 = 0;
  c._p23 = false;
 }
 c._x23 = c.x;
 const settled = !G.clearing && b.x > MIDX + 6;
 for (const p of G.players) {
  if (p.team !== 'O' || p.gk || p === c || p.down > 0 || isChaser(p)) {
   p._w23 = 0;
   p._c23 = 0;
   continue;
  }
  if (p.coverT > 0) {
   p._c23 = (p._c23 || 0) + dt;
   if (p._c23 > M23.cover) {
    p.coverT = 0;
    p._c23 = 0;
    G.cover23 = (G.cover23 || 0) + 1;
   }
  } else p._c23 = 0;
  const back = p.x < MIDX - 4, lim = settled ? M23.wrong : G.clearing && rrOf(p) === 'A' ? M23.wrongClr : 0;
  if (!back || !lim || p.coverT > 0) {
   p._w23 = 0;
   continue;
  }
  const mvUp = p._lx23 != null && (p.x - p._lx23) / dt > 6;
  p._lx23 = p.x;
  if (mvUp) {
   p._w23 = 0;
   continue;
  }
  p._w23 = (p._w23 || 0) + dt;
  if (p._w23 > lim) {
   p._w23 = 0;
   G.wrong23 = (G.wrong23 || 0) + 1;
   if ((G.m23log = G.m23log || []).length < 40) G.m23log.push({
    k: 'wrong',
    t: +G.t.toFixed(1),
    id: p.pl ? p.pl.id : null,
    rr: rrOf(p),
    x: Math.round(p.x),
    home: p.home ? p.home.map(Math.round) : null,
    playT: !!p.playT,
    playHold: !!p.playHold,
    clearing: !!G.clearing
   });
   let s = null;
   try {
    const S = curSpots();
    s = S && S[p.idx];
   } catch (e) {}
   if (!s) s = [ MIDX + 40, p.y ];
   p.playT = null;
   p.playHold = null;
   p.callPick = null;
   p.pickSet = null;
   p.wander = 0;
   p.coverT = 0;
   const hx = Math.max(MIDX + 24, s[0]);
   if (!p.home || p.home[0] < MIDX + 4) p.home = [ hx, s[1] ];
   p.tx = p.home[0];
   p.ty = p.home[1];
  }
 }
}

const READ18 = {
 n: 4,
 need: 3,
 q: .6
};

function read18(c, sq, b, gk, gx, top, sp) {
 const G = game;
 if (!G || G.tutorial || window.__rl_v124gb || window.__rl_no18read || !c || !c.pl || b.force18) return false;
 G.read18h = G.read18h || {};
 const k = c.pl.id, h = G.read18h[k] = G.read18h[k] || [];
 if (h.length && h[h.length - 1] !== sq && h.filter(x => x === h[h.length - 1]).length >= READ18.need) h.length = 0;
 h.push(sq);
 if (h.length > READ18.n) h.shift();
 if (h.filter(x => x === sq).length < READ18.need) return false;
 G.read18n = (G.read18n || 0) + 1;
 if (Math.random() >= READ18.q) return false;
 shotForce18('save', b, gk, gx, top, sp);
 G.read18s = (G.read18s || 0) + 1;
 G.lastShot && (G.lastShot.read18 = true);
 return true;
}

function shotForce18(kind, b, gk, gx, top, sp) {
 const dir = Math.sign(gx - b.x) || 1, side = top ? -1 : 1;
 const ty = kind === 'wide' ? CY + side * (MOUTH + 3 + Math.random() * 10) : CY + side * (MOUTH - 2.5);
 const a = Math.atan2(ty - b.y, gx - b.x), v = sp || Math.hypot(b.vx, b.vy);
 b.vx = Math.cos(a) * v;
 b.vy = Math.sin(a) * v;
 b.block = null;
 b.pipe = null;
 if (kind === 'goal') {
  gk.reach = .001;
  gk.react = 9;
  b.aim14 = null;
 } else if (kind === 'save') {
  gk.reach = Math.max(gk.reach || 0, 9);
  gk.react = 0;
  gk.dive = ty;
  b.aim14 = null;
 }
 b.force18 = kind;
 void dir;
}

const PING18 = {
 gain: .75
};

function barDown18(b) {
 const G = game;
 if (!G || G.tutorial || b.corner == null || b.corner > 1) return;
 G.bdN18 = (G.bdN18 || 0) + 1;
 if (G.bdN18 % 3) return false;
 G.barDown18 = (G.barDown18 || 0) + 1;
 addFx('txt', GX + 4, CY - MOUTH - 10, {
  s: 'BAR DOWN!',
  col: '#ffe14d',
  life: 1.6
 });
 ewww18('bardown');
 addFx('pop', GX + 1, CY + (b.y < CY ? -1 : 1) * (MOUTH - 1));
 try {
  const ac = AC;
  if (ac && !muted && ac.state !== 'closed') {
   const t = ac.currentTime, gn = ac.createGain();
   gn.gain.setValueAtTime(1e-4, t);
   gn.gain.exponentialRampToValueAtTime(PING18.gain * MASTER_VOL, t + .005);
   gn.gain.exponentialRampToValueAtTime(1e-4, t + .6);
   gn.connect(ac.destination);
   G.ping18v = PING18.gain;
   for (const [f, a] of [ [ 2093, 1 ], [ 3136, .6 ], [ 4699, .35 ] ]) {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    og.gain.value = a;
    o.connect(og);
    og.connect(gn);
    o.start(t);
    o.stop(t + .62);
   }
  }
 } catch (e) {}
 return true;
}

let netBuf18 = null;

function netSnd18(delay) {
 try {
  const ac = AC;
  if (!ac || muted || ac.state === 'closed') return;
  const t = ac.currentTime + (delay || 0);
  const th = ac.createOscillator(), tg = ac.createGain();
  th.type = 'sine';
  th.frequency.setValueAtTime(120, t);
  th.frequency.exponentialRampToValueAtTime(48, t + .18);
  tg.gain.setValueAtTime(1e-4, t);
  tg.gain.exponentialRampToValueAtTime(.55 * MASTER_VOL, t + .008);
  tg.gain.exponentialRampToValueAtTime(1e-4, t + .22);
  th.connect(tg);
  tg.connect(ac.destination);
  th.start(t);
  th.stop(t + .25);
  if (!netBuf18 || netBuf18.sampleRate !== ac.sampleRate) {
   const n = Math.floor(ac.sampleRate * .5);
   netBuf18 = ac.createBuffer(1, n, ac.sampleRate);
   const d = netBuf18.getChannelData(0);
   let s = 22222;
   for (let i = 0; i < n; i++) {
    s = s * 1103515245 + 12345 & 2147483647;
    d[i] = s / 1073741823 - 1;
   }
  }
  const ns = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain();
  ns.buffer = netBuf18;
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(5200, t + .02);
  bp.frequency.exponentialRampToValueAtTime(2600, t + .42);
  bp.Q.value = .9;
  ng.gain.setValueAtTime(1e-4, t + .02);
  ng.gain.exponentialRampToValueAtTime(.32 * MASTER_VOL, t + .06);
  ng.gain.exponentialRampToValueAtTime(1e-4, t + .46);
  ns.connect(bp);
  bp.connect(ng);
  ng.connect(ac.destination);
  ns.start(t + .02);
  ns.stop(t + .5);
  game && (game.net18 = (game.net18 || 0) + 1);
 } catch (e) {}
}

function shotAdj18(c, b, tg, held, sp) {
 const G = game;
 if (!G || G.tutorial || window.__rl_v124gb || window.__rl_no18shot || !c || b.state !== 'shot') return;
 const gk = G.goalie, d = Math.hypot(GX - c.x, CY - c.y);
 if (held != null && held < TAP18.held && d < TAP18.r && (Math.abs(c.y - CY) <= TAP18.mid || c.y > CY === !!tg.top)) {
  const p = DF.level === 5 ? TAP18.pTew : TAP18.p, r = Math.random();
  G.tap18 = (G.tap18 || 0) + 1;
  G.lastShot.tap18 = true;
  shotForce18(r < p ? 'goal' : 'save', b, gk, GX, !!tg.top, sp);
  return;
 }
 if (pole18(c)) poleShot18(c, b, gk, GX, !!tg.top, sp, !!(G.run && G.run.x > .35) && d > 44 && d < 140);
}

function poleShot18(c, b, gk, gx, top, sp, running) {
 const G = game, good = c.pl.r && c.pl.r.stk >= POLE18.stk, step = running && good, r = Math.random(), r2 = Math.random();
 const p = step ? POLE18.pStep : POLE18.p, v = (sp || Math.hypot(b.vx, b.vy)) * (step ? POLE18.spd : 1);
 shotForce18(r < p ? 'goal' : r2 < POLE18.wide ? 'wide' : 'save', b, gk, gx, top, v);
 (G.pole18 = G.pole18 || []).push({
  step: step,
  good: good,
  res: b.force18,
  cpu: gx !== GX
 });
 if (G.lastShot && gx === GX) G.lastShot.pole18 = step ? 'step' : 'pole';
}

function addFx(type, x, y, extra) {
 fx.push(Object.assign({
  type: type,
  x: x,
  y: y,
  t: 0
 }, extra || {}));
}

function twoPtFrom(x, y, gx) {
 return Math.hypot(x - gx, y - CY) > ARC_R;
}

function twoPtShot(b, gx) {
 const G = game;
 return !!(G && G.twoPt && b && b.shotFrom && twoPtFrom(b.shotFrom[0], b.shotFrom[1], gx));
}

const TP26 = {
 a14: .65
};

function tp26(c) {
 const G = game;
 return !!(G && G.twoPt && c && !window.__rl_no2pt26 && !window.__rl_v124gb && !G.tutorial && twoPtFrom(c.x + BX, c.y + BY, GX));
}

function twoPtPop() {
 addFx('cue', 0, 0, {
  s: '2PT!',
  col: '#ffe14d',
  life: 1.6
 });
}

function drawArc(gx, dir) {
 const col = 'rgba(255,225,77,.85)';
 for (let a = -Math.PI / 2; a <= Math.PI / 2 + 1e-6; a += Math.PI / 72) {
  const x = gx - dir * Math.cos(a) * ARC_R, y = CY + Math.sin(a) * ARC_R;
  if (y < FT + 2 || y > FB - 2) continue;
  rect(Math.round(x) - 1, Math.round(y) - 1, 2, 2, col);
 }
}

function endPossession(kind, txt, sub) {
 if (game.over) return;
 game.banner = {
  txt: txt,
  sub: sub,
  kind: kind
 };
 game.bannerT = 0;
 screen = 'banner';
 stick = null;
 shootP = null;
 if (kind === 'goal') {
  const two = twoPtShot(game.ball, GX);
  game.score[0] += two ? 2 : 1;
  if (two) {
   game.pts2[0]++;
   game.banner.txt = '2PT GOAL!';
   twoPtPop();
  }
  game.runU = (game.runU || 0) + 1;
  game.stats.goals++;
  SFX.goal();
  goalPing(GX);
  crowd12(true);
  benchReact('u', 'goal');
  game.crowd = 2.5;
  if (game.pen && game.pen.side === 'C') penaltyOver('goal');
 } else if (kind === 'keep' || kind === 'ours') SFX.whistle(); else SFX.bad();
}

function gbTarget() {
 const G = game, b = G.ball;
 return b.state === 'chase' && G.chase ? {
  x: G.chase.ex,
  y: G.chase.ey
 } : {
  x: b.x - 2,
  y: b.y
 };
}

function adjacentSet(G, bx, by, c) {
 const offb = G.players.filter(p => p.team === 'O' && p !== c).sort((a, b) => Math.hypot(a.x - bx, a.y - by) - Math.hypot(b.x - bx, b.y - by));
 return new Set(offb.slice(0, 2));
}

function updateLive(dt) {
 const G = game, b = G.ball, c = G.carrier, live = ballLive();
 if (readyTick(dt)) {
  if (c) {
   b.x = c.x + BX;
   b.y = c.y + BY;
  }
  return;
 }
 G.foLive = Math.max(0, (G.foLive || 0) - dt);
 rideTick('live');
 if (!G.tutorial && c && b.state === 'held' && inCrease(c, GX)) {
  ruleCall('CREASE', 'IN THE CREASE WITH IT - TURNOVER', 'uturn');
  return;
 }
 if (live && !G.tutorial) autoCtrl('O', gbTarget(), 'ctrl');
 if (G.clearing && b.x > MIDX + 6 && (b.state === 'held' || b.state === 'pass')) {
  const g2 = G.players.find(p => p.team === 'G2');
  G.clearing = false;
  G.players = G.players.filter(p => p.team !== 'G2');
  G.clearedLive = (G.clearedLive || 0) + 1;
  if (G.farU && !G.farU.some(f => f.role === 'G') && !G.players.some(p => p.gk)) G.farU.push(farMk('U', 'G', g2 ? g2.x : DGX + 5, g2 ? g2.y : CY, PP(G.lu[0].G)));
  if (G.tutorial) {
   tutFlag('overMid');
   if (G.cc && G.cc.t > 0) tutFlag('beatCount');
  }
  G.cc = null;
  G.bc = {
   t: BOX_T
  };
  G.overSeen = true;
  addFx('cue', 0, 0, {
   s: 'CLEARED!',
   col: '#7dff7a',
   life: 1
  });
 }
 const bref = c ? c : b.state === 'pass' && b.to ? b.to : {
  x: b.x,
  y: b.y
 };
 G.adjT = (G.adjT || 0) - dt;
 if (!G.adj || G.adjT <= 0 || G.adjC !== c) {
  G.adj = adjacentSet(G, bref.x, bref.y, c);
  G.adjT = .5;
  G.adjC = c;
 }
 const adj = G.adj;
 if (shootP) dt *= .5;
 G.liveT += dt;
 if (window.V20) try {
  V20.tick(dt);
 } catch (e) {
  console.error(e);
 }
 G.splitCd = Math.max(0, (G.splitCd || 0) - dt);
 G.beatT = Math.max(0, (G.beatT || 0) - dt);
 G.stopFlash = Math.max(0, (G.stopFlash || 0) - dt);
 if (!G.ot && !G.tutorial) G.clock -= dt;
 if ((b.state === 'held' || b.state === 'pass') && !G.tutorial) G.shotClock -= dt;
 if (G.tutorial && G.tutorial.step === TC.COUNT && !G.tutorial.complete && G.clearing && G.cc && (b.state === 'held' || b.state === 'pass')) {
  G.cc.t -= dt;
  if (G.cc.t <= 0) {
   G.tutorial.countFails = (G.tutorial.countFails || 0) + 1;
   tutSetup();
   addFx('cue', 0, 0, {
    s: 'TOO SLOW! OVER IN 10 - TRY AGAIN',
    col: '#ff9a8a',
    life: 1.6
   });
   SFX.whistle();
   return;
  }
 }
 if (!G.tutorial && (b.state === 'held' || b.state === 'pass')) {
  if (G.clearing && G.cc) {
   G.cc.t -= dt;
   if (G.cc.t <= 0) {
    ruleCall('CLEAR COUNT', "DIDN'T GET IT OVER MIDFIELD IN TIME", 'uturn');
    return;
   }
  }
  if (!G.clearing && G.bc) {
   if (b.x > RL_R + 2) G.bc = null; else {
    G.bc.t -= dt;
    if (G.bc.t <= 0) {
     ruleCall('CLEAR COUNT', "DIDN'T GET IT INTO THE BOX IN TIME", 'uturn');
     return;
    }
   }
  }
 }
 const dl = G.players.filter(p => p.team === 'D'), ol = G.players.filter(p => p.team === 'O');
 const zoneD = G.cpuDef === 'zone' || dl.length !== ol.length && !(G.practice && G.practice.dScheme && G.cpuDef !== 'zone');
 const zd = zoneD ? {
  list: dl,
  z: zoneTargets(dl, cpuZoneKind181(G, dl), bref.x, bref.y, false)
 } : null;
 const blackD = !zoneD && G.cpuDef === 'black';
 if (zoneD) {
  G.slide = null;
  G.rot = null;
 }
 G.zoneD = zoneD;
 const sg17 = setSag17();
 if (sg17) {
  G.slide = null;
  G.rot = null;
  G.hotP = null;
 }
 G.p5d = null;
 if (c && !sg17 && !live && !window.__rl_v124gb && !window.__rl_no105 && !G.tutorial && b.state === 'held' && c.x > GX - 80 && Math.hypot(c.x - GX, c.y - CY) < 76) {
  const dl5 = G.players.filter(d => d.team === 'D' && !(d.down > 0)), dc = d => Math.hypot(d.x - c.x, d.y - c.y);
  const cand = [ G.slide, dl5.find(d => markOf(d) === c), zoneD && zd ? zd.list[zd.z.onBall] : null ].filter(d => d && dl5.includes(d));
  const keep = G.p5keep && dl5.includes(G.p5keep) && dc(G.p5keep) < 30 ? G.p5keep : null;
  G.p5d = keep || (cand.length ? cand : dl5).slice().sort((p, q) => dc(p) - dc(q))[0] || null;
  G.p5keep = G.p5d;
  if (G.p5d) G.p5n = (G.p5n || 0) + 1;
 }
 hunchTick204(G, dt);
 for (const p of G.players) {
  if (p.down > 0) {
   p.down -= dt;
   downTick(p, dt);
   p.tx = p.x;
   p.ty = p.y;
   p.spd = 0;
   continue;
  }
  if (p.coverT > 0 && p !== c && !isChaser(p) && (p.team === 'O' || p.team === 'D')) {
   p.coverT -= dt;
   p.tx = p.coverX;
   p.ty = p.y + (CY - p.y) * .1;
   p.spd = PACE.cut * 1.15;
   continue;
  }
  if (p.team === 'O') {
   if (live && p === G.ctrl) {
    if (p.stun > 0) {
     p.stun -= dt;
     p.tx = p.x;
     p.ty = p.y;
     p.spd = 0;
    } else if (G.run) {
     let dx = G.run.x, dy = G.run.y;
     const tg = gbTarget(), vx = tg.x - p.x, vy = tg.y - p.y, L = Math.hypot(vx, vy);
     if (L > .5 && (vx * dx + vy * dy) / L > GB.cone) {
      dx = vx / L;
      dy = vy / L;
     }
     p.tx = p.x + dx * 30;
     p.ty = p.y + dy * 30;
     p.spd = (b.state === 'chase' ? GB.userChase : GB.user) * runMag();
    } else {
     p.tx = p.x;
     p.ty = p.y;
     p.spd = 0;
    }
   } else if (p === c) {
    if (G.stoodUp > 0) {
     p.tx = p.x;
     p.ty = p.y;
     p.spd = 0;
    } else if (G.dodge && G.dodge.who === p && G.dodge.k286) {
     const D = G.dodge, q = pos286(D, (D.t + dt) / D.dur), dd = Math.hypot(q[0] - p.x, q[1] - p.y);
     if (dd < .3) {
      p.x = q[0];
      p.y = q[1];
     }
     p.tx = q[0];
     p.ty = q[1];
     p.spd = dd / Math.max(dt, 1e-4) / (spdMul(p) || 1);
    } else if (G.dodge && G.dodge.who === p) {
     const D = G.dodge;
     if (D.away && D.kind === 'roll') {
      const k = clamp(D.t / D.dur, 0, 1), w = 1.5 * (1 - k), ux = D.vx + D.away[0] * w, uy = D.vy + D.away[1] * w, L = Math.hypot(ux, uy) || 1;
      p.tx = p.x + ux / L * 30;
      p.ty = p.y + uy / L * 30;
     } else {
      p.tx = p.x + D.vx * 30;
      p.ty = p.y + D.vy * 30;
     }
     p.spd = PACE.run * (D.kind === 'roll' ? DODGE.rollSpd : D.kind === 'bull' ? BULL.spd : DODGE.splitSpd) * (G.uSlow > 0 ? .8 : 1);
    } else if (G.pAuto && (G.pAuto[2] || !G.run)) {
     p.tx = G.pAuto[0];
     p.ty = G.pAuto[1];
     p.spd = G.pAuto[2] ? PACE.run : PACE.cut * 1.15;
     if (G.pAuto[2]) G.run = null;
    } else if (G.run) {
     p.tx = p.x + G.run.x * 30;
     p.ty = p.y + G.run.y * 30;
     p.spd = (PACE.run * runMag() + (G.beatT > 0 ? 6 : 0) + (G.dodgeT > 0 ? 9 : 0)) * (G.uSlow > 0 ? .55 : 1) * (p.gk ? 1.3 : 1);
    } else {
     p.tx = p.x;
     p.ty = p.y;
     p.spd = 0;
    }
   } else if (live && G.help18 === p) {
    const tg = gbTarget();
    p.tx = tg.x - 2;
    p.ty = tg.y;
    p.spd = GB.cpu;
   } else if (cutTick181(p)) {} else if (p.callPick && p.callPick.phase === 'run') {
    p.tx = p.callPick.x;
    p.ty = p.callPick.y;
    p.spd = PACE.cut * 1.25;
   } else if (p.pickSet) {
    p.tx = p.x;
    p.ty = p.y;
    p.spd = 0;
   } else if (p.playT) {
    p.tx = p.playT[0];
    p.ty = p.playT[1];
    p.spd = PACE.cut * (p.clrFast && G.cset ? 1.7 : p.set284 && G.pset && on284() ? 1.6 : 1.15);
    p.playHold = null;
   } else if (p.playHold && (G.playRun && !G.playRun.done || G.pset || G.cset)) {
    p.tx = p.playHold[0];
    p.ty = p.playHold[1];
    p.spd = PACE.cut;
   } else {
    p.wander -= dt;
    let nd = null, ndd = 1e9;
    for (const d of G.players) if (d.team === 'D') {
     const dd = Math.hypot(d.x - p.x, d.y - p.y);
     if (dd < ndd) {
      ndd = dd;
      nd = d;
     }
    }
    const covered = ndd < 10;
    if (p.wander <= 0 || covered && p.wander > .45 && Math.random() < dt * DEF.recut || c && Math.hypot(p.tx - c.x, p.ty - c.y) < 24) {
     p.wander = rnd(.8, 1.6);
     const h = p.home, cands = [ [ h[0] + rnd(-14, 14), h[1] + rnd(-12, 12) ], [ h[0] + (GX - 30 - h[0]) * rnd(.35, .6), h[1] + (CY - h[1]) * rnd(.3, .55) ], [ h[0] - rnd(10, 24), h[1] + rnd(-10, 10) ], [ p.x + rnd(-30, 30), p.y + rnd(-26, 26) ] ];
     if (nd) {
      const ax = p.x - nd.x, ay = p.y - nd.y, al = Math.hypot(ax, ay) || 1;
      const r = rnd(16, 26);
      cands.push([ p.x + ax / al * r, p.y + ay / al * r ]);
     }
     let best = cands[0], bs = -1e9;
     for (const q0 of cands) {
      const behind = h[0] > GX, q = behind ? [ clamp(q0[0], GX + 14, GX + 30), clamp(q0[1], CY - 30, CY + 30) ] : [ clamp(q0[0], MIDX + 24, GX - 20), clamp(q0[1], FT + 14, FB - 8) ];
      if (Math.hypot(q[0] - GX, q[1] - CY) < CREASE + 6) continue;
      let md = 99;
      for (const d of G.players) if (d.team === 'D') md = Math.min(md, Math.hypot(d.x - q[0], d.y - q[1]));
      let mt = 99;
      for (const o of G.players) if (o.team === 'O' && o !== p) mt = Math.min(mt, Math.hypot(o.x - q[0], o.y - q[1]));
      let lane = 0;
      if (c) {
       lane = 10;
       for (const d of G.players) if (d.team === 'D' && segDist(d.x, d.y - 6, c.x + BX, c.y + BY, q[0] + BX, q[1] + BY) < 7) {
        lane = 0;
        break;
       }
      }
      const sc = Math.min(md, 34) + Math.min(mt, 28) * .55 + lane + rnd(0, 8) - Math.hypot(q[0] - p.x, q[1] - p.y) * .06;
      if (sc > bs) {
       bs = sc;
       best = q;
      }
     }
     p.tx = best[0];
     p.ty = best[1];
     p.spd = rnd(PACE.cut * .9, PACE.cut * 1.15);
     for (const d of G.players) if (d.team === 'D' && (d.mark === p || G.rot && G.rot.d === d && G.rot.m === p)) d.react = rnd(DEF.r0, DEF.r1) * (DF.react || 1);
    }
   }
  } else if (p.team === 'D') {
   if (live && G.chasers && G.chasers.includes(p)) {
    if (p.gbReact > 0) {
     p.gbReact -= dt;
     p.tx = p.x;
     p.ty = p.y;
     p.spd = 0;
    } else {
     const tg = gbTarget();
     p.tx = tg.x + 2;
     p.ty = tg.y;
     p.spd = GB.cpu;
    }
   } else if (G.rideC && G.rideC.mode === 'live' && G.rideC.phase === 'out' && G.rideC.cd === p && !live && !leash26(G, p, MIDX + RIDE.cdX, CY + (b.y - CY) * .35)) {
    p.tx = MIDX + RIDE.cdX;
    p.ty = CY + (b.y - CY) * .35;
    p.spd = PACE.dBall;
    G.rideCdFrames = (G.rideCdFrames || 0) + 1;
   } else if (p.react > 0) p.react -= dt; else if (p === G.p5d) {
    const gx5 = c.x > GX - 2 ? GX + 4 : GX, dx = gx5 - c.x, dy = CY - c.y, L5 = Math.hypot(dx, dy) || 1;
    p.tx = c.x + dx / L5 * 5 + (c.x > GX - 2 ? 0 : 2);
    p.ty = c.y + dy / L5 * 5;
    p.spd = PACE.dBall * (Math.hypot(p.x - c.x, p.y - c.y) > 10 ? 1.3 : 1.1);
   } else if (zoneD) {
    const k = zd.list.indexOf(p), q = zd.z.pts[k] || zd.z.pts[zd.z.pts.length - 1] || [ p.x, p.y ];
    if (k === zd.z.onBall && c && !sg17) {
     const dx = GX - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1;
     p.tx = c.x + dx / L * 5 + 2;
     p.ty = c.y + dy / L * 5;
     p.spd = PACE.dBall;
     if (window.V38D) V38D.zoneC(G, p, c);
    } else if (b.state === 'pass' && b.to && !sg17 && Math.hypot(b.to.x - q[0], b.to.y - q[1]) < 30) {
     p.tx = b.to.x + 6;
     p.ty = b.to.y;
     p.spd = PACE.dBall * 1.1;
    } else {
     p.tx = q[0];
     p.ty = q[1];
     p.spd = Math.hypot(q[0] - p.x, q[1] - p.y) > 6 ? PACE.dBall : PACE.dOff;
    }
    if (G.p5d && p !== G.p5d) {
     const ex = p.tx - GX, ey = p.ty - CY, ed = Math.hypot(ex, ey), R5 = CREASE + 7;
     if (ed < R5) {
      const k5 = R5 / (ed || 1);
      p.tx = GX + (ed ? ex * k5 : -R5);
      p.ty = CY + (ed ? ey * k5 : 0);
     }
    }
   } else {
    let m = markOf(p), tight = DEF.tight * (DF.tight || 1), spd = PACE.dOff;
    if (G.rot && G.rot.d === p && G.players.includes(G.rot.m)) m = G.rot.m;
    if (G.slide === p && c && !sg17) {
     m = c;
     tight = 4;
     spd = PACE.dBall * 1.08;
    }
    if (!m) {
     p.tx = GX - 22;
     p.ty = CY + ((c || b).y - CY) * .3;
     p.spd = G.drive ? PACE.dBall : PACE.dOff * DEF.recover;
     continue;
    }
    if (c && m === c && !sg17) {
     tight = Math.min(tight, 5 * (DF.tight || 1));
     spd = Math.max(spd, PACE.dBall);
    }
    if (c && m === c && sg17) {
     tight = SAG17.cush;
     spd = Math.max(spd, Math.hypot(p.x - c.x, p.y - c.y) < SAG17.cush ? PACE.chase : PACE.dBall * 1.3);
     G.sag17n = (G.sag17n || 0) + 1;
    }
    if (c && m === c && G.slide !== p && !sg17) {
     const th36 = typeof window.v36sagTh === 'function' ? window.v36sagTh(G, p, c) : null, th = th36 != null ? th36 : sagLive() ? threatOf(c, GX, true, G.drive) : 1;
     tight += (SAG.cush - tight) * (1 - th);
     G.sagLog = G.sagLog || {};
     G.sagLog.C = +th.toFixed(2);
    }
    const dx = GX - m.x, dy = CY - m.y, L = Math.hypot(dx, dy) || 1;
    let tx = m.x + dx / L * tight + 2, ty = m.y + dy / L * tight + (G.slide === p ? p.y < m.y ? -3 : 3 : 0);
    if (b.state === 'pass' && b.to === m && !b.intercept && !sg17) {
     spd = PACE.dBall * 1.2;
    } else if (m !== c && G.slide !== p) {
     const hx = GX - 24, hy = CY + (m.y - CY) * .3;
     const hl0 = Math.hypot(hx - m.x, hy - m.y) || 1;
     let off;
     if (adj.has(m)) {
      off = c ? DEF.adjOff + (G.drive ? DEF.drive : 0) : DEF.adjOff + 3;
      spd = PACE.dBall * 1.15;
     } else off = clamp(hl0 * DEF.holeF, DEF.hole0, DEF.hole1) + (G.drive ? DEF.drive : 0);
     {
      const th = sg17 ? 0 : sagLive() && c ? 1 - (1 - threatOf(m, GX, false, false)) * (1 - threatOf(c, GX, true, G.drive)) : 1, sg = Math.max(clamp(hl0 * DEF.holeF, DEF.hole0, DEF.hole1), SAG.hole);
      off = adj.has(m) ? off + (sg - off) * (1 - th) : off + SAG.hole * .5 * (1 - th);
     }
     off = Math.min(off * (DF.tight || 1), hl0);
     tx = m.x + (hx - m.x) / hl0 * off + 1;
     ty = m.y + (hy - m.y) / hl0 * off;
    }
    if (spd === PACE.dOff && Math.hypot(tx - p.x, ty - p.y) > DEF.lag) spd = PACE.dOff * DEF.recover;
    p.mk105 = !window.__rl_v124gb && !G.tutorial && !!m && m.x > GX - 4;
    if (p.mk105 && tx > GX - 6) {
     const w5 = aroundCage(p, tx, ty);
     tx = w5[0];
     ty = w5[1];
    }
    if (G.p5d && G.slide !== p) {
     const ex = tx - GX, ey = ty - CY, ed = Math.hypot(ex, ey), R5 = CREASE + 7;
     if (ed < R5) {
      const k5 = R5 / (ed || 1);
      tx = GX + (ed ? ex * k5 : -R5);
      ty = CY + (ed ? ey * k5 : 0);
     }
    }
    if (on2403(G) && !sg17 && G.slide !== p && m !== c && !(b.state === 'pass' && b.to === m) && rrOf(m) === 'A') {
     const q = gs2403(p, m, tx, ty, spd, GX, b);
     if (q) {
      tx = q[0];
      ty = q[1];
      spd = q[2];
     }
    }
    if (clr26ok(G) && m !== c && G.slide !== p && rrOf(m) === 'A' && Math.hypot(tx - p.x, ty - p.y) > 20) {
     spd = Math.max(spd, PACE.chase * .85);
     G.catch26 = (G.catch26 || 0) + 1;
    }
    p.tx = tx;
    p.ty = ty;
    p.spd = spd;
    if (c && m === c && G.clearing && G.slide !== p && !sg17 && window.V38D) {
     const q38 = V38D.rideNear(G, p, c, dt);
     if (q38) {
      p.tx = q38[0];
      p.ty = q38[1];
     }
    }
   }
  } else if (p.team === 'G') {
   const RC = G.rideC && G.rideC.mode === 'live' && G.rideC.gk === p && (G.rideC.phase === 'out' || G.rideC.phase === 'back') && b.state !== 'shot' ? G.rideC : null;
   if (RC) {
    const q = rideGkTarget(RC, true, GX);
    p.tx = q[0];
    p.ty = q[1];
    p.spd = q[2];
    continue;
   }
   if (b.state === 'shot') {
    if (p.react > 0) p.react -= dt; else {
     p.ty = p.dive;
     p.spd = p.gspd;
    }
   } else {
    p.ty = CY + clamp((b.y - CY) * .12, -GK.pos, GK.pos);
    p.spd = 28;
   }
   p.tx = GX - 5;
   if (s26()) SHOT26.gk(p, b);
  }
 }
 if (sg17 && c) for (const d of G.players) {
  if (d.team !== 'D' || d.gk || d.down > 0 || d.tx == null) continue;
  const ex = d.tx - c.x, ey = d.ty - c.y, ed = Math.hypot(ex, ey), R = SAG17.room;
  if (ed < R) {
   const ux = ed > .5 ? ex / ed : (GX - c.x) / (Math.hypot(GX - c.x, CY - c.y) || 1), uy = ed > .5 ? ey / ed : (CY - c.y) / (Math.hypot(GX - c.x, CY - c.y) || 1);
   d.tx = c.x + ux * R;
   d.ty = c.y + uy * R;
  }
 }
 {
  const fp = !live && !sg17 ? fbPlan222(G, c, b, 'O', 'D', GX, 1, null) : null;
  if (fp) for (const [d, q] of fp) {
   if (d.react > 0 || d.stun > 0 || d.down > 0 || isChaser(d) || fbSkip2403(G, d, b, 'O', 'D', 1)) continue;
   d.tx = q[0];
   d.ty = q[1];
   d.spd = q[2];
  }
 }
 if (H5on() && c && !live && !G.tutorial && G.foLiveAt != null && G.t - G.foLiveAt < 8 && !G.pen && !zoneD && !blackD) h5Pickup(G, c);
 G.drive = !!(c && (G.run && G.run.x > 0 || Math.hypot(c.x - GX, c.y - CY) < 72 || G.beatT > 0));
 if (G.drive) {
  G.driveT = (G.driveT || 0) + dt;
  G.calmT = 0;
 } else {
  G.calmT = (G.calmT || 0) + dt;
  G.driveT = 0;
 }
 G.hotP = c && !sg17 && !G.slide && !zoneD && !blackD && c.x > RL_R ? hotPick(G.players.filter(d => d.team === 'D'), c, adj, G.hotP) : null;
 if (c && !sg17 && G.drive && !G.slide && G.driveT > .3 * (DF.slideT || 1) && !zoneD && !blackD && (!H5on() || h5Threat(G, c))) {
  const dl0 = G.players.filter(d => d.team === 'D');
  let best = slideBest(dl0, c, adj, null);
  if (G.hotP && G.players.includes(G.hotP)) best = G.hotP;
  if (best && !slideOk2403(G, best, c, GX)) best = null;
  if (best && Math.random() < dt * 3 * (DF.slide || 1)) {
   G.slide = best;
   best.react = rnd(.05, .2);
   fireCall(G.goalie);
   G.cpuSlides = (G.cpuSlides || 0) + 1;
   if (freeD(best)) G.cpuFreeSlides = (G.cpuFreeSlides || 0) + 1;
   const left = markOf(best), rb = rotatePick(dl0, best, left, c, adj, null);
   G.rot = rb && slideOk2403(G, rb, c, GX) ? {
    d: rb,
    m: left
   } : null;
  }
 }
 if (G.slide && (!c || G.calmT > 1.1)) {
  G.slide = null;
  G.rot = null;
 }
 if (!c) {
  G.slide = null;
  G.rot = null;
 }
 if (G.online && window.RLNET) RLNET.liveD(G, dt, c, b);
 const h2w = H2on() && !G.tutorial && (G.clearing ? (G.h2T = G.t, true) : G.h2T != null && G.t - G.h2T < 4);
 for (const p of G.players) {
  const ox = p.x, oy = p.y;
  if (h2w) p._h2o = [ ox, oy ];
  const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
  if (d > .3 && p.spd > 0) {
   const s = Math.min(d, p.spd * spdMul(p) * (p.team === 'D' ? DF.dSpd || 1 : 1) * dt);
   p.x += dx / d * s;
   p.y += dy / d * s;
   p.anim += s;
  }
  if (p === c) p.prev = [ ox, oy ];
  if (p.team !== 'G' && p.team !== 'G2') {
   const xmax = live || p.team === 'O' && p !== c && p.home && p.home[0] > GX || p.team === 'O' && (p.playT || p.playHold || p === c && G.pAuto) || p.team === 'O' && (p === c || p === G.ctrl) && !window.__rl_v124gb || p.team === 'D' && (p === G.p5d || p.mk105 && !window.__rl_no105) ? ENDX - 3 : GX - 6;
   if (p.x > xmax) p.x = Math.max(xmax, p.x - 70 * dt);
   const free = isChaser(p) || p.coverT > 0;
   const wl = G.clearing || free ? DEND + 8 : p === c ? MIDX - 40 : MIDX + 4;
   if (p.x < wl) {
    let push = 70 * dt;
    if (H2on() && p.team === 'O' && p !== c) push = Math.min(push, Math.max(0, PACE.chase * spdMul(p) * dt - Math.max(0, p.x - ox)));
    p.x = Math.min(wl, p.x + push);
   }
   if (!free && p.team === 'O' && rrOf(p) === 'A' && p !== c && p.x < MIDX + 3) p.x = Math.min(MIDX + 3, p.x + 70 * dt);
   if (!free && p.team === 'D' && rrOf(p) === 'D' && p.x < MIDX + 3) p.x = Math.min(MIDX + 3, p.x + 70 * dt);
   p.y = clamp(p.y, FT + 12, FB - 2);
   const cx = p.x - GX, cy = p.y - CY, cd = Math.hypot(cx, cy);
   const kr = p.team === 'O' && (p === c || p === G.ctrl) && J6on() ? J6_R : CREASE + 3;
   if (cd < kr && p.team === 'O') {
    p.x = GX + cx / (cd || 1) * kr;
    p.y = CY + cy / (cd || 1) * kr;
   } else if (cd < CREASE - 2 && p.team === 'D') {
    p.x = GX + cx / (cd || 1) * (CREASE - 2);
    p.y = CY + cy / (cd || 1) * (CREASE - 2);
   }
  }
 }
 if (c && !sg17 && G.slide && !G.slide.slideHit && b.state === 'held' && Math.hypot(G.slide.x - c.x, G.slide.y - c.y) < 7 && !G.tutorial) {
  G.slide.slideHit = true;
  G.cpuSlideHits = (G.cpuSlideHits || 0) + 1;
  const face = G.run ? [ G.run.x, G.run.y ] : facingOf({
   x: c.x,
   y: c.y
  }, GX);
  if (fromBehind(G.slide, c, face)) {
   G.cpuBehind = (G.cpuBehind || 0) + 1;
   if (Math.random() < FOUL.aiBehind * cMul18()) {
    knockDown(c, G.slide);
    if (foulCall('PUSHING', 'HIT YOU FROM BEHIND', 'C', G.slide)) return;
   }
  } else if (hasRunUp(G.slide, c, PACE.dBall) && Math.random() < hitChance(G.slide, c) * .55 * (tewa181() ? 1.5 : 1)) {
   knockDown(c, G.slide);
   G.cpuLevels = (G.cpuLevels || 0) + 1;
   const a = Math.atan2(c.y - G.slide.y, c.x - G.slide.x) + rnd(-1.2, 1.2), v = rnd(42, 60);
   popLoose(c.x + BX, c.y + 1, Math.cos(a) * v, Math.sin(a) * v, 'hit');
   c.down = .9;
   c.stun = .9;
   return;
  }
 }
 G.dodgeT = Math.max(0, (G.dodgeT || 0) - dt);
 if (c && G.run && !G.run.joy && c.prev && dt > 0) {
  const prog = (c.x - c.prev[0]) * G.run.x + (c.y - c.prev[1]) * G.run.y;
  if (prog < PACE.run * dt * .35) {
   G.run = null;
   G.stopFlash = .4;
  }
 }
 for (let i = 0; i < G.players.length; i++) for (let j = i + 1; j < G.players.length; j++) {
  const a = G.players[i], q = G.players[j];
  if (a.team === 'G' || q.team === 'G') continue;
  const dx = q.x - a.x, dy = q.y - a.y, d = Math.hypot(dx, dy);
  if (d < 4 && d > .01) {
   const push = (4 - d) / 2;
   a.x -= dx / d * push;
   a.y -= dy / d * push;
   q.x += dx / d * push;
   q.y += dy / d * push;
  }
 }
 if (h2w) for (const p of G.players) {
  const o = p._h2o;
  p._h2o = null;
  if (!o || p.team !== 'O' || p === c || p === G.ctrl || p.gk) continue;
  const mx = p.x - o[0], my = p.y - o[1], m = Math.hypot(mx, my), cap = PACE.chase * spdMul(p) * dt;
  if (m > cap && m < 12) {
   p.x = o[0] + mx / m * cap;
   p.y = o[1] + my / m * cap;
   G.h2cap = (G.h2cap || 0) + 1;
  }
 }
 if (b.state === 'held' && c) {
  b.x = c.x + BX;
  b.y = c.y + BY;
  let n = 0;
  for (const d of G.players) if (d.team === 'D' && Math.hypot(d.x - c.x, d.y - c.y) < 9) n++;
  G.pressure = n;
  G.checkT += dt;
  if (!G.uchk || G.uchk.who !== c) G.uchk = {
   who: c,
   n: 0,
   lastLand: G.t
  };
  if (G.uchk.n > 0 && G.t - G.uchk.lastLand > UCHK.decay) {
   G.uchk.n--;
   G.uchk.lastLand = G.t;
  }
  G.uSlow = Math.max(0, (G.uSlow || 0) - dt);
  if (!G.tutorial && !sg17 && G.run && G.checkT > 0) for (const d of G.players) {
   if (d.team !== 'D' || d.stun > 0 || d.down > 0) continue;
   const rx = d.x - c.x, ry = d.y - c.y, dd = Math.hypot(rx, ry);
   if (dd < 7.5 && dd > .01 && (rx * G.run.x + ry * G.run.y) / dd > .45) {
    G.uSlow = Math.max(G.uSlow, .3);
    if (!d.bump && G.t - (d.bumpT == null ? -9 : d.bumpT) > .7) {
     d.bump = true;
     d.bumpT = G.t;
     d.chkCd = Math.min(d.chkCd == null ? 0 : d.chkCd, .08);
     G.bumps = (G.bumps || 0) + 1;
    }
   }
  }
  if (sg17) {
   G.set17t = (G.set17t || 0) + dt;
   for (const d of G.players) if (d.team === 'D') {
    d.bump = false;
    if (d.chkCd == null || d.chkCd < .15) d.chkCd = rnd(.15, .4);
   }
  }
  if (G.checkT > 0 && !G.tutorial && !sg17) {
   const moving = !!G.run && runMag() > .55 && !(G.uSlow > 0);
   for (const d of G.players) {
    if (d.team !== 'D' || d.netCtl) continue;
    const dd = Math.hypot(d.x - c.x, d.y - c.y);
    if (dd > UCHK.range || d.stun > 0 || d.down > 0) {
     if (d.chkCd == null || d.chkCd < .15) d.chkCd = rnd(.15, .4);
     d.bump = false;
     continue;
    }
    d.chkCd = (d.chkCd == null ? rnd(.15, .4) : d.chkCd) - dt;
    if (d.chkCd > 0) continue;
    d.chkCd = rnd(UCHK.every[0], UCHK.every[1]) * (DF.chkEvery || 1) / (tewa181() ? 1.5 : 1);
    G.checkRolls = (G.checkRolls || 0) + 1;
    G.cpuChecks = (G.cpuChecks || 0) + 1;
    if (penaltyRoll('check', d)) return;
    if (cMul18() > 1 && !G.pen && !G.penPending && Math.random() < Math.min(.3, RET18.k * chip18())) {
     G.ret18 = (G.ret18 || 0) + 1;
     knockDown(c, d);
     if (foulCall(Math.random() < .5 ? 'SLASHING' : 'ILLEGAL BODY CHECK', 'A CHEAP SHOT - THEY ARE GETTING CHIPPY', 'C', d)) return;
    }
    if (!G.clearing) {
     const face = G.run ? [ G.run.x, G.run.y ] : facingOf({
      x: c.x,
      y: c.y
     }, GX);
     if ((d.react > 0 || G.beatT > 0 || fromBehind(d, c, face)) && dd < 9) {
      G.chaseChecks = (G.chaseChecks || 0) + 1;
      if (Math.random() < FOUL.aiHack * cMul18()) {
       addFx('txt', c.x, c.y - 26, {
        s: 'HACK!',
        col: '#ff9a8a',
        life: .7
       });
       if (foulCall('SLASHING', 'HACKED YOU FROM BEHIND', 'C', d)) return;
      }
     }
    }
    const rmul = clamp(1 + .2 * pr(d, 'def') - .14 * pr(c, 'str') - .08 * pr(c, 'stk'), .45, 1.8);
    let pl = n >= 2 ? UCHK.traffic : moving ? UCHK.open : UCHK.still;
    if (d.bump) pl = Math.max(pl, UCHK.bump);
    d.bump = false;
    if (G.dodgeT > 0) pl *= .3;
    if (G.dodge) pl *= G.dodge.kind === 'roll' ? .15 : .5;
    pl *= rmul * (G.clearing ? UCHK.ride : 1) * (DF.chk || 1);
    const sd110 = chk110(G) ? side110(c, d, GX) : null;
    if (sd110 === 'off' && !inZone110(c, 'U')) pl *= CHK110.offLand;
    if (sd110) st110('cChk_' + sd110);
    if (Math.random() < pl) {
     if (sd110) st110('cLand_' + sd110);
     G.uchk.n++;
     G.uchk.lastLand = G.t;
     G.cpuLanded = (G.cpuLanded || 0) + 1;
     G.uSlow = Math.max(G.uSlow, .22);
     if (v14Check(c, d)) {
      G.uchk.n = 0;
      checkPop();
      return;
     }
     if (chkRule2403() ? (chkStat2403('cpuLand_' + chkZone2403(c)), G.uchk.n >= (G.uchk.need = chkNeed2403(c, d, GX))) : G.uchk.n >= chkNeed181() || sd110 && sd110 !== 'off' && inZone110(c, 'U')) {
      if (chkRule2403()) chkStat2403('cpuStrip_' + chkZone2403(c) + '_' + G.uchk.n); else if (sd110 && G.uchk.n < chkNeed181()) st110('cStripZone');
      G.uchk.n = 0;
      G.uStrips = (G.uStrips || 0) + 1;
      checkPop();
      return;
     }
     addFx('txt', c.x, c.y - 26, {
      s: 'CHECKED ' + G.uchk.n + '/' + (chkRule2403() && G.uchk.need ? G.uchk.need : chkNeed181()),
      col: '#ffb14d',
      life: .6
     });
     sfx12('check_clack', .65);
     G.checkSnd = (G.checkSnd || 0) + 1;
     d.chkT0 = menuT;
    } else {
     addFx('txt', d.x, d.y - 24, {
      s: 'SLAP',
      col: 'rgba(255,255,255,.7)',
      life: .35
     });
     d.chkT0 = menuT;
    }
   }
  }
 } else if (b.state === 'pass') {
  const tgt = b.intercept ? {
   x: b.intercept.x,
   y: b.intercept.y
  } : {
   x: b.to.x + BX,
   y: b.to.y + BY
  };
  if (b.intercept) {
   const d = b.intercept.d;
   d.tx = b.intercept.x;
   d.ty = b.intercept.y + 6;
   d.spd = PACE.chase;
   d.react = 0;
  }
  const dx = tgt.x - b.x, dy = tgt.y - b.y, d = Math.hypot(dx, dy), s = 180 * dt;
  if (d <= s) {
   if (b.intercept) {
    st14('to', b.from && b.from.pl);
    G.int222 = !window.__rl_no222f3 && !window.__rl_v124gb && b.intercept.d && b.intercept.d.pl ? {
     pl: b.intercept.d.pl,
     q: G.q,
     m: menuT
    } : null;
    endPossession('turnover', 'PICKED OFF!', 'INTERCEPTION');
    return;
   }
   if ((b.to.far || b.to.team === 'G2') && liveClear(b.to, 'OUTLET')) {
    G.backPasses = (G.backPasses || 0) + 1;
    SFX.catch();
    return;
   }
   if (!(setSag17() && G.pset.ap17 === 'fly' && b.to === G.pset.st17) && v13Catch(b.to, 'live')) return;
   b.state = 'held';
   G.carrier = b.to;
   feed14(b.from, b.to);
   G.slide = null;
   G.rot = null;
   G.driveT = 0;
   SFX.catch();
   tutFlag('caught');
   addFx('catch', b.to.x + BX, b.to.y + BY);
   G.checkT = -.4;
   G.aimOff = 0;
   G.run = null;
  } else {
   b.x += dx / d * s;
   b.y += dy / d * s;
  }
 } else if (b.state === 'shot') {
  if (b.vx < 1 || b.y < FT - 20 || b.y > FB + 20) {
   b.vx = 220;
   b.vy = 0;
   b.x = Math.min(b.x, GX - 8);
   b.y = b.y < CY ? CY - MOUTH - 22 : CY + MOUTH + 22;
   b.pipe = null;
   b.block = null;
  }
  const ox = b.x, oy = b.y;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  if (b.s25 && s26() && SHOT26.fly(b, dt)) return;
  if (b.block && Math.hypot(b.x - ox, 0) >= 0 && Math.hypot(b.x - (b.shooter.x + BX), b.y - (b.shooter.y + BY)) >= b.block.dist) {
   addFx('pop', b.x, b.y);
   b.state = 'dead';
   const keep = Math.random() < .35;
   endPossession(keep ? 'keep' : 'turnover', 'BLOCKED!', keep ? 'LOOSE BALL - STILL YOURS' : 'TURNOVER');
   return;
  }
  const gk = G.goalie, glx = s26() ? SHOT26.glx(gk) : GX - 5;
  if (b.pipe) {
   if (b.x >= GX - 1) {
    const top = b.pipe.top;
    b.x = GX - 1;
    b.y = b.pipe.y;
    pipeBonk(b.x, b.y);
    addFx('pop', b.x, b.y);
    G.pipes = (G.pipes || 0) + 1;
    G.shotClock = SHOT_CLOCK;
    const v = rnd(55, 85), a = Math.PI + (top ? 1 : -1) * rnd(.35, 1);
    popLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'pipe');
    return;
   }
  } else if (ox < glx && b.x >= glx) {
   const t = (glx - ox) / (b.x - ox), cy = oy + (b.y - oy) * t;
   const a14 = b.aim14 && Math.abs(cy - CY) <= MOUTH - .5 ? aimSave14(b.aim14, cy, gk) : null;
   const sm14 = a14 ? sunMul18(G, gk, 'C') : 1;
   if (a14 ? Math.random() < a14.p * (1 - (1 - sm14) * .5) : Math.abs(cy - gk.y) <= (gk.reach || GK.reach) && Math.abs(cy - CY) <= MOUTH + 2) {
    b.state = 'dead';
    SFX.save();
    addFx('pop', glx, cy);
    goalieSave12(gk, cy);
    endPossession('turnover', 'SAVED!', pick([ 'WHAT A STOP', 'GOALIE WINS THAT ONE', 'ROBBED!' ]));
    if (sv2111On(G)) {
     G.sv2111 = G.banner;
     [b.x, b.y] = sv2111Stick(gk);
    }
    return;
   }
  }
  if (b.x >= GX) {
   const t = (GX - ox) / (b.x - ox), cy = oy + (b.y - oy) * t;
   if (Math.abs(cy - CY) <= MOUTH - .5) {
    b.state = 'net';
    b.x = GX + 1;
    b.y = cy;
    b.vx = 40;
    b.vy *= .15;
    G.ripple = 1;
    b.net181 = b.corner != null ? netSpot181(b.corner) : null;
    const p = b.power;
    const who = b.shooter && b.shooter.pl ? lastName(b.shooter.pl) + ' - ' : '';
    if (!G.tutorial && (b.creaseShot || G.players.some(p => p.team === 'O' && inCrease(p, GX)))) {
     G.ripple = 0;
     G.creaseNoGoal = (G.creaseNoGoal || 0) + 1;
     ruleCall('CREASE', 'NO GOAL - IN THE CREASE', 'uturn', {
      x: GX - 24,
      y: CY
     });
     return;
    }
    if (b.shooter && b.shooter.pl) {
     G.scorers.push([ 0, b.shooter.pl.id ]);
     goal14(b.shooter);
    }
    if (window.V20) try {
     V20.onGoal(b.shooter);
    } catch (e) {}
    try {
     const bd = barDown18(b);
     netSnd18(bd ? .16 : 0);
    } catch (e) {}
    if (window.V20 && V20.goal206) try {
     V20.goal206('u', b, b.y);
    } catch (e) {}
    endPossession('goal', 'GOAL!', who + (p > .85 ? 'ABSOLUTE ROCKET' : p > .55 ? 'PICKED THE CORNER' : 'FINESSE FINISH'));
    return;
   }
   startChase();
   return;
  }
 }
 if (b.state === 'loose' || b.state === 'chase') {
  if (updateLooseBall(dt)) return;
 }
 if (!G.tutorial) {
  if (!G.clearing && c && b.state === 'held') {
   if (b.x > MIDX + 8) G.overSeen = true;
   if (G.overSeen && c.x < MIDX + 2 && !(G.run && G.run.x < 0)) {
    if (window.__rl_no222f2 || window.__rl_v124gb) c.x = MIDX + 2; else if (c.x >= MIDX - 8) c.x = Math.min(MIDX + 2, c.x + 60 * dt); else {
     G.clearing = true;
     G.cc = {
      t: CLEAR_T
     };
     G.overSeen = false;
     G.bc = null;
     G.f2clr = (G.f2clr || 0) + 1;
    }
   } else if (G.overSeen && b.x < MIDX - 1) {
    G.userCause = true;
    ruleCall('OVER AND BACK', 'BACK OVER MIDFIELD - TURNOVER', 'uturn');
    return;
   }
  }
  if (c && b.state === 'held' && inCrease(c, GX)) {
   ruleCall('CREASE', 'IN THE CREASE WITH IT - TURNOVER', 'uturn');
   return;
  }
 }
 tick193(game, dt);
 unstick193(game, dt);
 farTick(dt);
 unstack46(dt);
 try {
  onside28(true);
 } catch (e) {
  console.error(e);
 }
 aiOnside();
 try {
  onside28();
 } catch (e) {
  console.error(e);
 }
 ruleCheck(dt);
 if (screen !== 'live') return;
 try {
  mid23(dt);
 } catch (e) {
  console.error(e);
 }
 if (G.shotClock <= 0) {
  if (G.tutorial) {
   endPossession('turnover', 'SHOT CLOCK!', 'VIOLATION - TURNOVER');
   return;
  }
  st14('to', c && c.pl);
  ruleCall('SHOT CLOCK', 'VIOLATION - TURNOVER', 'uturn');
  return;
 }
 if (!G.ot && G.clock <= 0 && b.state !== 'shot' && b.state !== 'chase') {
  G.clock = 0;
  endPossession('buzzer', 'BUZZER!', 'END OF QUARTER');
  return;
 }
}

function startChase() {
 const G = game, b = G.ball;
 const sp0 = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / sp0, uy = b.vy / sp0;
 let d = 1e9;
 if (ux > .01) d = Math.min(d, (ENDX - b.x) / ux);
 if (uy < -.01) d = Math.min(d, (FT - b.y) / uy);
 if (uy > .01) d = Math.min(d, (FB - b.y) / uy);
 d = Math.max(4, Math.min(d, 120));
 const T = GB.chaseT, vf = 10, v0 = Math.max(vf, 2 * d / T - vf);
 b.state = 'chase';
 b.vx = ux * v0;
 b.vy = uy * v0;
 b.z = 4;
 b.vz = 40;
 G.chase = {
  t: 0,
  a: (v0 - vf) / T,
  vf: vf,
  ex: clamp(b.x + ux * d, MIDX, ENDX),
  ey: clamp(b.y + uy * d, FT, FB)
 };
 G.carrier = null;
 G.run = null;
 G.slide = null;
 G.rot = null;
 shootP = null;
 G.ctrl = nearestOf('O', G.chase.ex, G.chase.ey);
 G.chasers = pickChasers(G.chase.ex, G.chase.ey, 2, true);
 G.chases = (G.chases || 0) + 1;
 SFX.bad();
 addFx('cue', 0, 0, {
  s: 'CHASE!',
  col: '#ffe14d',
  life: 1.2
 });
}

function updateLooseBall(dt) {
 const G = game, b = G.ball;
 b.vz = (b.vz || 0) - 240 * dt;
 b.z = (b.z || 0) + b.vz * dt;
 if (b.z <= 0) {
  b.z = 0;
  b.vz = Math.abs(b.vz) > 25 ? -b.vz * .4 : 0;
 }
 const sp = Math.hypot(b.vx, b.vy);
 if (b.state === 'chase') {
  if (!G.chase) G.chase = {
   t: GB.chaseT + 2,
   vf: 0,
   a: 0,
   ex: b.x,
   ey: b.y
  };
  const C = G.chase;
  C.t += dt;
  const ns = Math.max(C.vf, sp - C.a * dt);
  if (sp > 0) {
   b.vx *= ns / sp;
   b.vy *= ns / sp;
  }
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  if (b.x >= ENDX || b.y <= FT || b.y >= FB || C.t > GB.chaseT + 1.5) {
   b.x = clamp(b.x, MIDX, ENDX);
   b.y = clamp(b.y, FT, FB);
   let best = null, bd = 1e9;
   for (const p of G.players) if (p.team === 'O' || p.team === 'D') {
    const dd = Math.hypot(p.x - b.x, p.y - b.y);
    if (dd < bd) {
     bd = dd;
     best = p;
    }
   }
   G.lastChase = {
    team: best.team,
    x: b.x,
    y: b.y,
    ctrlD: Math.hypot(G.ctrl.x - b.x, G.ctrl.y - b.y)
   };
   tutFlag('chase', best.team);
   b.state = 'dead';
   G.chasers = [];
   if (best.team === 'O') {
    G.resume = {
     p: best,
     x: b.x,
     y: b.y,
     chase: true
    };
    G.chaseWon = (G.chaseWon || 0) + 1;
    endPossession('ours', 'OUR BALL', 'CLOSEST WHEN IT WENT OUT');
   } else endPossession('turnover', 'THEIR BALL', 'THEY WERE CLOSEST WHEN IT WENT OUT');
   G.bannerAuto = 1;
   return true;
  }
  return false;
 }
 if (!G.gb) G.gb = {
  t: 0,
  kind: 'loose'
 };
 G.gb.t += dt;
 if (!G.tutorial && !window.__rl_v124gb) gbStall18(G, b, dt);
 if (sp > .5) {
  const ns = Math.max(0, sp - GB.fric * dt);
  b.vx *= ns / sp;
  b.vy *= ns / sp;
 } else {
  b.vx = 0;
  b.vy = 0;
 }
 b.x += b.vx * dt;
 b.y += b.vy * dt;
 if (G.tutorial) {
  if (b.y < FT + 4) {
   b.y = FT + 4;
   b.vy = Math.abs(b.vy) * .6;
  }
  if (b.y > FB - 2) {
   b.y = FB - 2;
   b.vy = -Math.abs(b.vy) * .6;
  }
  if (b.x < (G.clearing ? DEND + 6 : MIDX + 6)) {
   b.x = G.clearing ? DEND + 6 : MIDX + 6;
   b.vx = Math.abs(b.vx) * .6;
  }
  if (b.x > ENDX - 4) {
   b.x = ENDX - 4;
   b.vx = -Math.abs(b.vx) * .6;
  }
 } else if (b.y < FT || b.y > FB || b.x > ENDX || b.x < DEND) {
  b.x = clamp(b.x, DEND + 2, ENDX - 2);
  b.y = clamp(b.y, FT + 1, FB - 1);
  let best = null, bd = 1e9;
  for (const p of G.players) if (p.team === 'O' || p.team === 'D') {
   const dd = Math.hypot(p.x - b.x, p.y - b.y);
   if (dd < bd) {
    bd = dd;
    best = p;
   }
  }
  b.state = 'dead';
  G.chasers = [];
  G.oob = (G.oob || 0) + 1;
  G.lastOob = {
   team: best && best.team,
   x: b.x,
   y: b.y
  };
  if (best && best.team === 'O') {
   G.resume = {
    p: best,
    x: b.x,
    y: b.y
   };
   endPossession('ours', 'OUT OF BOUNDS', 'YOU WERE CLOSEST - YOUR BALL');
  } else {
   G.turnSpot = {
    x: b.x,
    y: b.y
   };
   endPossession('turnover', 'OUT OF BOUNDS', 'THEY WERE CLOSEST - THEIR BALL');
  }
  G.bannerAuto = 1.2;
  return true;
 }
 if (!G.tutorial) looseWatchdog(dt, 'live');
 {
  const cx = b.x - GX, cy = b.y - CY, cd = Math.hypot(cx, cy) || 1;
  if (cd < CREASE) {
   const nx = cx / cd, ny = cy / cd, dot = b.vx * nx + b.vy * ny;
   if (dot < 0) {
    b.vx -= 2 * dot * nx;
    b.vy -= 2 * dot * ny;
   }
   if (Math.hypot(b.vx, b.vy) < 22) {
    b.vx = nx * 26;
    b.vy = ny * 26;
   }
  }
 }
 if (b.z > 4) return false;
 let winner = null;
 const ds = p => Math.hypot(p.x + 2 - b.x, (p.y - b.y) * 1.2);
 {
  const u = G.ctrl;
  if (u && !window.__rl_v124gb && G.players.includes(u) && u.team === 'O' && !(u.dropT > G.t) && ds(u) < GB.scoop * (1 + .08 * pr(u, 'gb'))) winner = u;
 }
 if (!winner) for (const p of G.players) {
  if (p.team === 'O' && !(p.dropT > G.t) && ds(p) < GB.scoop * (1 + .08 * pr(p, 'gb'))) {
   winner = p;
   break;
  }
 }
 if (!winner) for (const p of G.players) if (p.team === 'D' && !(p.gbReact > 0) && ds(p) < GB.scoop * .85 * (1 + .08 * pr(p, 'gb'))) {
  winner = p;
  break;
 }
 if (!winner && H1on() && !G.tutorial) {
  const f = (G.farC || []).find(q => q.chase && !(q.down > 0) && Math.hypot(q.x - b.x, q.y - b.y) < GB.scoop + 1);
  if (f) {
   winner = nearestOf('D', b.x, b.y);
   if (winner) {
    G.h1farSpot = {
     x: f.x,
     y: f.y
    };
    G.h1far = (G.h1far || 0) + 1;
   }
  }
 }
 if (!winner && G.gb.t > (G.tutorial ? 8 : window.__rl_v124gb ? 5 : 3.5)) winner = [ nearestOf('O', b.x, b.y), nearestOf('D', b.x, b.y) ].filter(Boolean).sort((u, v) => ds(u) - ds(v))[0] || null;
 if (!winner) return false;
 G.lastGb = {
  team: winner.team,
  kind: G.gb.kind,
  ctrl: winner === G.ctrl,
  t: G.gb.t
 };
 G.chasers = [];
 if (winner.team === 'O') {
  G.gbWon = (G.gbWon || 0) + 1;
  tutFlag('scooped');
  st14('gb', winner.pl);
  if (window.V17) V17.say('gb', winner.x, winner.y - 30);
  b.state = 'held';
  G.carrier = winner;
  G.ctrl = null;
  G.gb = null;
  b.x = winner.x + BX;
  b.y = winner.y + BY;
  if (!G.tutorial) {
   G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
   if (b.x < MIDX && !G.clearing) {
    G.clearing = true;
    G.cc = {
     t: CLEAR_T
    };
    G.overSeen = false;
    G.bc = null;
    G.gkOut = false;
    G.gkCreaseT = 0;
   }
  }
  G.checkT = -.8;
  G.slide = null;
  G.rot = null;
  G.driveT = 0;
  SFX.catch();
  addFx('catch', b.x, b.y);
  addFx('txt', winner.x, winner.y - 26, {
   s: 'SCOOPED!',
   col: '#7dff7a',
   life: .9
  });
  return false;
 }
 b.state = 'dead';
 G.turnSpot = G.h1farSpot || {
  x: winner.x,
  y: winner.y
 };
 G.h1farSpot = null;
 if (G.tutorial) {
  endPossession('turnover', 'GROUND BALL', 'THEY SCOOPED IT - THEIR BALL');
  G.bannerAuto = 1.3;
  return true;
 }
 G.gbLostLive = (G.gbLostLive || 0) + 1;
 SFX.bad();
 stick = null;
 shootP = null;
 cpuTakeover();
 addFx('cue', 0, 0, {
  s: 'THEY SCOOPED IT - THEIR BALL',
  col: '#ff9a8a',
  life: 1.2
 });
 return true;
}

function cpuTakeover() {
 const G = game;
 if (!G.ot && G.clock <= 0) return endQuarter();
 if (H7on() && G.turnSpot && G.turnSpot.x < MIDX - 4) {
  G.h7live = (G.h7live || 0) + 1;
  G.turnSpot = null;
  if (startDefenseLive()) return;
 }
 {
  const ts = G.turnSpot;
  G.turnSpot = null;
  if (ts && ts.x < MIDX - 4) return startDefense({
   x: clamp(ts.x, DGX + 40, MIDX - 20),
   y: clamp(ts.y, FT + 16, FB - 8)
  });
 }
 if (startDefenseLive()) return;
 startCpu();
}

function settledSpot(d, cageX) {
 const m = d.mark;
 if (!m || m.ghost) return [ cageX + (cageX < MIDX ? 30 : -30), CY + (d.idx - 2.5) * 12 ];
 const dx = cageX - m.x, dy = CY - m.y, L = Math.hypot(dx, dy) || 1, k = Math.min(L - CREASE - 3, 7 + Math.max(0, L - 70) * .12);
 return [ m.x + dx / L * k, m.y + dy / L * k ];
}

function chaseReset(side) {
 const G = game;
 if (!G || G.tutorial) return;
 if (side === 'U') {
  const c = G.carrier, sp = curSpots();
  for (const p of G.players) if (p.team === 'O' && p !== c) {
   const h = sp[p.idx] || p.home;
   if (h) {
    p.home = h.slice();
    p.x = h[0];
    p.y = h[1];
    p.tx = h[0];
    p.ty = h[1];
    p.wander = rnd(.6, 1.2);
   }
   p.down = 0;
   p.kb = null;
   p.coverT = 0;
  }
  for (const d of G.players) if (d.team === 'D') {
   const s = settledSpot(d, GX);
   d.x = s[0];
   d.y = s[1];
   d.tx = s[0];
   d.ty = s[1];
   d.react = .1;
   d.down = 0;
   d.kb = null;
   d.stun = 0;
   d.coverT = 0;
   d.settled = s;
  }
  const gk = G.players.find(p => p.team === 'G');
  if (gk) {
   gk.x = GX - 5;
   gk.y = CY;
  }
  G.slide = null;
  G.rot = null;
  G.drive = false;
 } else {
  const c = G.dcar;
  for (const a of G.players) if (a.team === 'D' && a !== c && a.home) {
   a.x = a.home[0];
   a.y = a.home[1];
   a.tgt = a.home.slice();
   a.down = 0;
   a.kb = null;
   a.coverT = 0;
  }
  for (const d of G.players) if (d.team === 'O') {
   const s = settledSpot(d, DGX);
   d.x = s[0];
   d.y = s[1];
   d.down = 0;
   d.kb = null;
   d.stun = 0;
   d.coverT = 0;
   d.settled = s;
  }
  const g2 = G.players.find(p => p.team === 'G2');
  if (g2) {
   g2.x = DGX + 5;
   g2.y = CY;
  }
  G.dSlide = null;
  G.dRot = null;
 }
 if (H3on()) h3Corner(G, side);
 G.readyT = 1;
 G.chaseResets = (G.chaseResets || 0) + 1;
 G.lastReset = {
  side: side,
  t: +G.t.toFixed(2)
 };
 if (side === 'U' && el2314On(G) && elPlays2314().length) {
  G.el2314 = {
   t: 0,
   open: true,
   pick: null,
   auto: false,
   n: G.chaseResets
  };
  G.elAsked = (G.elAsked || 0) + 1;
 }
 addFx('cue', 0, 0, {
  s: 'GET READY...',
  col: '#ffe14d',
  life: 1
 });
}

function el2314On(G) {
 return !!G && !no2314() && !window.__rl_v124gb && !G.tutorial && !G.online && !G.brave;
}

function elPlays2314() {
 return pbAll().filter(p => pmCat(p) === 'END LINE' && Array.isArray(p.start) && p.start.length === 6);
}

function elPick2314(id) {
 const G = game, E = G && G.el2314;
 if (!E || !E.open) return false;
 E.open = false;
 E.pick = id || null;
 G.readyT = 1;
 const pl = id ? playById(id) : null;
 if (!pl || pmCat(pl) !== 'END LINE') {
  E.pick = null;
  return false;
 }
 choosePlay(id);
 const c = G.carrier, map = playMap(pl), spots = pl.start.map(q => pmClampSpot(q[0], q[1]));
 map.forEach((p, i) => {
  if (!p) return;
  const s = spots[i];
  p.x = s[0];
  p.y = s[1];
  p.tx = s[0];
  p.ty = s[1];
  p.home = s.slice();
  p.down = 0;
  p.kb = null;
 });
 if (c && G.ball) {
  G.ball.x = c.x + BX;
  G.ball.y = c.y + BY;
 }
 for (const d of G.players) if (d.team === 'D') {
  const s = settledSpot(d, GX);
  d.x = s[0];
  d.y = s[1];
  d.tx = s[0];
  d.ty = s[1];
  d.settled = s;
  d.react = .1;
 }
 if (c) {
  const defs = G.players.filter(p => p.team === 'D'), d = defs.slice().sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0];
  if (d) {
   const dx = GX - 34 - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1;
   let sx = c.x + dx / L * H3_GAP, sy = c.y + dy / L * H3_GAP;
   const cx = sx - GX, cy = sy - CY, cd = Math.hypot(cx, cy) || 1;
   if (cd < CREASE + 3) {
    sx = GX + cx / cd * (CREASE + 3);
    sy = CY + cy / cd * (CREASE + 3);
   }
   d.x = sx;
   d.y = clamp(sy, FT + 12, FB - 3);
   d.tx = d.x;
   d.ty = d.y;
   d.settled = [ d.x, d.y ];
  }
 }
 const ok = playSet();
 E.auto = !!ok;
 G.elSet = {
  id: id,
  car: c ? [ Math.round(c.x), Math.round(c.y) ] : null,
  spots: spots.map(s => s.slice())
 };
 addFx('cue', 0, 0, {
  s: 'END LINE: ' + pl.name,
  col: '#ffe14d',
  life: 1.2
 });
 return ok;
}

function drawEl2314() {
 const G = game, E = G && G.el2314;
 if (!E || !E.open || screen !== 'live') return;
 const list = elPlays2314().slice(-5), bw = 200, bh = 44 + list.length * 15, bx = Math.round(W / 2 - bw / 2), by = Math.max(18, Math.round(H / 2 - bh / 2) - 6);
 hit('EL2314 BLOCK', 0, 0, W, H, () => {}, 'EL2314 BLOCK');
 rect(bx, by + 2, bw, bh, '#000');
 rect(bx, by, bw, bh, 'rgba(20,34,43,.94)');
 rect(bx, by, bw, 1, '#ffe14d');
 text('END LINE PLAY?', W / 2, by + 5, 1, '#ffe14d', 'center', '#000');
 text('YOU WON THE CHASE - RESTART FROM THE END LINE', W / 2, by + 14, 1, '#cfe', 'center');
 list.forEach((p, i) => {
  const y = by + 24 + i * 15, nm = String(p.name || 'PLAY').toUpperCase().slice(0, 22) + (p.builtin ? '  (BUILT-IN)' : '');
  hit('EL ' + p.id, bx + 10, y, bw - 20, 13, () => {
   elPick2314(p.id);
   SFX.tap();
  }, 'EL ' + nm);
  rect(bx + 10, y + 1, bw - 20, 13, '#000');
  rect(bx + 10, y, bw - 20, 13, '#7dff7a');
  text(nm, W / 2, y + 4, 1, '#0b1a20', 'center');
 });
 const ny = by + 26 + list.length * 15;
 hit('EL NO PLAY', bx + 60, ny, bw - 120, 13, () => {
  elPick2314(null);
  SFX.tap();
 }, 'EL NO PLAY');
 rect(bx + 60, ny + 1, bw - 120, 13, '#000');
 rect(bx + 60, ny, bw - 120, 13, '#c9d6d9');
 text('NO PLAY', W / 2, ny + 4, 1, '#0b1a20', 'center');
}

function readyTick(dt) {
 const G = game;
 if (!G) return false;
 if (G.el2314 && G.el2314.open) {
  G.el2314.t += dt;
  if (G.el2314.t > 9) elPick2314(null); else {
   G.readyT = Math.max(G.readyT || 0, 1);
   return true;
  }
 }
 if (!(G.readyT > 0)) return false;
 G.readyT -= dt;
 if (G.readyT <= 0) {
  G.readyT = 0;
  SFX.whistle();
  addFx('cue', 0, 0, {
   s: 'PLAY!',
   col: '#7dff7a',
   life: .6
  });
 }
 return true;
}

function resumeOurs() {
 const G = game, R = G.resume;
 G.resume = null;
 if (!G.ot && G.clock <= 0) return endQuarter();
 if (!R) return setupPossession();
 const c = R.p;
 c.x = clamp(R.x, DEND + 8, GX - 6);
 c.y = clamp(R.y, FT + 12, FB - 2);
 const back = c.x < MIDX + 2;
 {
  const cx = c.x - GX, cy = c.y - CY, cd = Math.hypot(cx, cy) || 1;
  if (cd < CREASE + 4) {
   c.x = GX + cx / cd * (CREASE + 4);
   c.y = CY + cy / cd * (CREASE + 4);
   if (c.x > GX - 6) {
    c.x = GX - 6;
    c.y = CY + (cy < 0 ? -1 : 1) * (CREASE + 6);
   }
  }
 }
 G.carrier = c;
 G.ball.state = 'held';
 G.ball.x = c.x + BX;
 G.ball.y = c.y + BY;
 const pc = G.possCount;
 resetPossState();
 G.possCount = pc;
 if (back) {
  G.clearing = true;
  G.cc = {
   t: CLEAR_T
  };
 } else G.overSeen = true;
 G.checkT = -1.2;
 for (const p of G.players) if (p.team === 'O' && p !== c) {
  p.tx = p.home[0];
  p.ty = p.home[1];
  p.wander = rnd(.6, 1.2);
 }
 screen = 'live';
 if (R.chase && !back) chaseReset('U'); else SFX.whistle();
}

function afterBanner() {
 const G = game, k = G.banner.kind;
 if (G.tutorial) {
  if (k === 'tutdone') {
   game = null;
   screen = 'menu';
   return;
  }
  if (tutDone(G.tutorial.step)) {
   G.tutorial.doneT = 0;
   tutAdvance();
  }
  return tutSetup();
 }
 if (v14PreBanner(k)) return;
 if (rulesAfterBanner(k)) return;
 if (k === 'flag') return startPenalty() || setupPossession();
 if (k === 'goal') {
  if (G.ot) return finishGame();
  if (G.clock <= 0) return endQuarter();
  if (cpuTimeoutMaybe('goal')) return;
  return startFaceoff();
 }
 if (k === 'cputo') {
  if (G.banner.then === 'goal') return startFaceoff();
  return setupPossession();
 }
 if (k === 'cgoal') {
  if (G.ot) return finishGame();
  if (G.clock <= 0) return endQuarter();
  return startFaceoff();
 }
 if (k === 'keep') return setupPossession();
 if (k === 'ours') return resumeOurs();
 if (k === 'buzzer') return endQuarter();
 if (k === 'fowin') return setupPossession(G.ball.x, G.ball.y);
 if (k === 'folose') {
  if (!G.ot && G.clock <= 0) return endQuarter();
  return startCpu();
 }
 if (!G.ot && G.clock <= 0) return endQuarter();
 {
  const ts = G.turnSpot;
  G.turnSpot = null;
  if (ts && ts.x < MIDX - 4) return startDefense({
   x: clamp(ts.x, DGX + 40, MIDX - 20),
   y: clamp(ts.y, FT + 16, FB - 8)
  });
 }
 if (startDefenseLive()) return;
 startCpu();
}

const CPU_SPOTS = SPOTS.map(([x, y]) => [ FL - x, y ]);

const stickPos = p => p.team === 'D' ? [ p.x - 10, p.y - 9 ] : p.team === 'G2' ? [ p.x + 5, p.y - 16 ] : [ p.x + BX, p.y + BY ];

const CS = .62;

function moveTo(p, tx, ty, spd, dt) {
 const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
 if (d > .3) {
  const s = Math.min(d, spd * spdMul(p) * dt);
  p.x += dx / d * s;
  p.y += dy / d * s;
  p.anim += s;
 }
 p.y = clamp(p.y, FT + 12, FB - 3);
}

function wpick(ws) {
 let s = ws.reduce((a, b) => a + b, 0) * Math.random();
 for (let i = 0; i < ws.length; i++) {
  s -= ws[i];
  if (s <= 0) return i;
 }
 return ws.length - 1;
}

function cpuOdds() {
 const G = game, U = unitPower(G.lu[0]), O = unitPower(G.lu[1]), ou = offUnit(G.lu[1]);
 const shI = wpick(ou.map(p => Math.exp(1.3 * O.shoot(p)))), sh = ou[shI], shF = O.shoot(sh);
 const cpuUp = !!(G.pen && G.pen.side === 'U'), cpuDown = !!(G.pen && G.pen.side === 'C');
 let p = .36 + .05 * O.off + .06 * shF - .05 * U.def - .06 * U.gk + (G.userHome ? -.02 : .02);
 if (G.dset === 'zone') p += .04 * ((rf(sh, 'pow') + rf(sh, 'acc')) / 2 - rf(sh, 'str'));
 if (cpuUp) p = .42 + .04 * O.off - .05 * U.gk + ((EMO_VS[G.cpuEmo] || {})[G.md || 'ZONE ROTATE'] || 0);
 if (cpuDown) p *= .6;
 p = clamp(p, .06, .75);
 const wSave = 2 * clamp(1 + .3 * U.gk, .4, 1.8), wTo = 3 * clamp(1 + .25 * U.def, .5, 1.6);
 return {
  p: p,
  shI: shI,
  sh: sh,
  wSave: wSave,
  wTo: wTo,
  cpuUp: cpuUp,
  cpuDown: cpuDown
 };
}

function startCpu(force, forceTo) {
 if (!force && !forceTo) return startDefense();
 return startCpuAnim(force, forceTo);
}

function startCpuAnim(force, forceTo) {
 const G = game;
 const od = cpuOdds();
 G.lastCpuOdds = od;
 const goal = Math.random() < od.p;
 let outcome = goal ? 'goal' : [ 'save', 'miss', 'turnover' ][wpick([ od.wSave, 1, od.wTo ])];
 if (force) outcome = force;
 if (!force && penaltyRoll('cpu')) outcome = 'flag';
 if (G.forcePen === 'U' && !force) {
  G.forcePen = null;
  outcome = 'flag';
 }
 const toType = forceTo || (Math.random() < clamp(.5 + .12 * unitPower(G.lu[0]).def, .3, .75) ? 'check' : 'int');
 G.cpuSet = pick(V13ON() ? SET_NAMES : SET_NAMES_V12);
 if (od.cpuUp) G.cpuEmo = pick(Object.keys(EMO));
 const SP = (od.cpuUp ? EMO[G.cpuEmo] : SETS[G.cpuSet]).map(([x, y]) => [ FL - x, y ]);
 const ou = offUnit(G.lu[1]), du = defUnit(G.lu[0]);
 const PL = [];
 SP.forEach((s, i) => {
  const a = mkPlayer('D', i, Math.max(s[0], DGX + 30) + 26 + rnd(-6, 6), s[1] + rnd(-6, 6));
  a.pl = ou[i];
  a.home = [ s[0] + rnd(-5, 5), s[1] + rnd(-5, 5) ];
  a.wt = rnd(.2, 1);
  a.tgt = a.home.slice();
  PL.push(a);
 });
 const car = PL[0];
 car.x = MIDX - 34;
 car.y = CY + rnd(-22, 22);
 for (let i = 0; i < 5; i++) {
  const a = PL[i];
  const d = mkPlayer('O', i, a.x - 10, a.y + (CY - a.y) * .15);
  d.mark = a;
  a.mark0 = d;
  d.pl = du[i];
  PL.push(d);
 }
 const gk = mkPlayer('G2', 0, DGX + 5, CY);
 gk.team = 'G2';
 gk.pl = PP(G.lu[0].G);
 PL.push(gk);
 G.players = PL;
 G.carrier = null;
 G.goalie = null;
 G.hold = false;
 applyPenaltyCpu();
 const shooterP = G.players.find(p => p.team === 'D' && p.pl === od.sh) || car;
 G.ball = {
  x: car.x - 10,
  y: car.y - 9,
  state: 'held',
  vx: 0,
  vy: 0
 };
 stick = null;
 shootP = null;
 const beats = [ {
  k: 'drive',
  dur: rnd(1.7, 2.2),
  to: [ DGX + 112 + rnd(-8, 8), CY + rnd(-26, 26) ]
 } ];
 const nPass = outcome === 'turnover' && toType === 'int' ? 2 : Math.random() < .5 ? 1 : 2;
 for (let i = 0; i < nPass; i++) {
  beats.push({
   k: 'pass',
   toShooter: i === nPass - 1 && (outcome === 'goal' || outcome === 'save' || outcome === 'miss')
  });
  beats.push({
   k: 'drive',
   dur: rnd(.8, 1.2)
  });
 }
 if (outcome === 'turnover' && toType === 'int') {
  beats.push({
   k: 'dodge'
  });
  beats.push({
   k: 'drive',
   dur: .5
  });
  beats.push({
   k: 'pass',
   int: true
  });
 } else if (outcome === 'flag') {
  beats.push({
   k: 'dodge'
  });
  beats.push({
   k: 'flag'
  });
 } else {
  beats.push({
   k: 'dodge'
  });
  if (outcome === 'turnover') beats.push({
   k: 'check'
  }); else {
   beats.push({
    k: 'drive',
    shoot: true,
    dur: rnd(.5, .8)
   });
   beats.push({
    k: 'shot'
   });
  }
 }
 beats.push({
  k: 'result'
 });
 const used = outcome === 'flag' ? Math.round(rnd(6, 10)) : Math.round(rnd(12, 26));
 G.cpu = {
  outcome: outcome,
  toType: toType,
  used: used,
  scUsed: Math.min(used, Math.round(rnd(9, 17))),
  spent: 0,
  rate: used / 7.5,
  applied: false,
  t: 0,
  beats: beats,
  bi: 0,
  holder: car,
  slider: null,
  skipped: false,
  shooter: shooterP
 };
 G.shotClock = SHOT_CLOCK;
 G.cpuT = 0;
 screen = 'cpu';
 if (G.dset === 'zone' || od.cpuUp) addFx('cue', 0, 0, {
  s: od.cpuUp ? 'MAN-DOWN: ' + (G.md || 'ZONE ROTATE') : 'YOUR D: ZONE',
  col: '#8fe3f0',
  life: 1.2
 });
}

function nearestTo(team, x, y) {
 let best = null, bd = 1e9;
 for (const p of game.players) if (p.team === team) {
  const d = Math.hypot(p.x - x, p.y - y);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 return best;
}

function cpuResultIdx() {
 return game.cpu.beats.findIndex(b => b.k === 'result');
}

function applyCpu() {
 const G = game, C = G.cpu;
 if (C.applied) return;
 C.applied = true;
 if (C.outcome === 'goal') {
  G.score[1]++;
  G.runU = 0;
  if (G.pen && G.pen.side === 'U') penaltyOver('goal');
 }
 if (!G.ot) G.clock = Math.max(0, G.clock - (C.used - C.spent));
 C.spent = C.used;
 G.shotClock = SHOT_CLOCK - C.scUsed;
}

function skipCpu() {
 const G = game, C = G.cpu;
 if (!C || screen !== 'cpu') return;
 const ri = cpuResultIdx();
 if (C.bi >= ri) return afterCpu();
 const b = G.ball, gk = G.players.find(p => p.team === 'G2');
 C.skipped = true;
 if (C.outcome === 'goal') {
  b.state = 'net';
  b.x = DGX - 5;
  b.y = CY + rnd(-5, 5);
  b.vx = 0;
  b.vy = 0;
  C.holder = null;
 } else if (C.outcome === 'save') {
  C.holder = gk;
 } else if (C.outcome === 'miss') {
  b.state = 'dead';
  C.holder = null;
 } else if (C.outcome === 'flag') {
  if (!G.penPending) G.penPending = {
   side: 'U',
   who: PP(G.lu[0].D[0]),
   foul: 'PUSHING'
  };
 } else {
  const ref = C.holder || b;
  let best = null, bd = 1e9;
  for (const p of G.players) if (p.team === 'O') {
   const d = Math.hypot(p.x - ref.x, p.y - ref.y);
   if (d < bd) {
    bd = d;
    best = p;
   }
  }
  C.holder = best;
 }
 C.bi = ri;
}

function cpuEnd(txt, col, sub) {
 const C = game.cpu;
 C.res = {
  txt: txt,
  col: col,
  sub: sub
 };
}

function updateCpu(dt) {
 const G = game, C = G.cpu, b = G.ball;
 C.t += dt;
 G.cpuT += dt;
 let B = C.beats[C.bi];
 const isResult = B.k === 'result';
 if (!isResult && !C.applied) {
  const run = Math.min(dt * C.rate, Math.max(0, C.used - C.spent - .5));
  C.spent += run;
  if (!G.ot) G.clock = Math.max(0, G.clock - run);
  G.shotClock = SHOT_CLOCK - C.spent * C.scUsed / C.used;
 }
 const atk = G.players.filter(p => p.team === 'D'), def = G.players.filter(p => p.team === 'O');
 const gk = G.players.find(p => p.team === 'G2');
 const H0 = C.holder;
 for (const a of atk) {
  if (a === H0 || a.busy) continue;
  a.wt -= dt;
  if (a.wt <= 0) {
   a.wt = rnd(.7, 1.6);
   a.tgt = [ a.home[0] + rnd(-14, 12), a.home[1] + rnd(-12, 12) ];
  }
  if (a.home[0] < DGX) moveTo(a, clamp(a.tgt[0], DGX - 30, DGX - 14), clamp(a.tgt[1], CY - 30, CY + 30), 30 * CS, dt); else moveTo(a, Math.max(DGX + CREASE + 14, a.tgt[0]), a.tgt[1], 30 * CS, dt);
 }
 const dcU = def.length === atk.length && dCustomOn();
 const zl = def, zoneU = G.dset === 'zone' || def.length !== atk.length || dcU;
 const zz = zoneU ? zoneTargets(zl, def.length < 5 ? G.md || 'ZONE ROTATE' : dcU ? dCustomKind() : 'zone', b.x, b.y, true) : null;
 G.zoneU = zoneU;
 G.hotP = !zoneU && H0 && !C.slider && H0.x < RL_L && ![ 'result', 'shot', 'flag', 'check' ].includes(B.k) ? hotPick(def.filter(d => d !== H0.mark0), H0, null, G.hotP) : null;
 for (const d of def) {
  if (d === H0) continue;
  if (d.busy) continue;
  if (d.bite > 0) {
   d.bite -= dt;
   moveTo(d, d.x + 3, d.y + d.biteDir * 14, 22 * CS, dt);
   continue;
  }
  if (d === C.slider && C.holder) {
   const h = C.holder;
   moveTo(d, h.x - 7, h.y + (h.y < CY ? 4 : -4), 46 * CS, dt);
   continue;
  }
  if (zoneU) {
   const k = zl.indexOf(d), q = zz.pts[k] || zz.pts[zz.pts.length - 1] || [ d.x, d.y ];
   if (k === zz.onBall && C.holder && C.holder.team === 'D') moveTo(d, C.holder.x - 7, C.holder.y + (CY - C.holder.y) * .08, 40 * CS, dt); else moveTo(d, q[0], q[1], 34 * CS, dt);
   continue;
  }
  const m = d.mark, onBall = m === C.holder;
  moveTo(d, m.x - (onBall ? 7 : 10), m.y + (CY - m.y) * (onBall ? .08 : .18), (onBall ? 40 : 31) * CS, dt);
 }
 if (gk && !gk.busy) moveTo(gk, DGX + 5, clamp(b.y + 6, CY - MOUTH + 1, CY + MOUTH - 1), 30, dt);
 if (!B.init) {
  B.init = true;
  B.t = 0;
  cpuBeatStart(B);
 }
 B.t += dt;
 if (cpuBeatStep(B, dt, gk)) {
  C.bi++;
 }
 if (screen !== 'cpu' || G.cpu !== C) return;
 if (C.holder) {
  const [x, y] = stickPos(C.holder);
  b.x = x;
  b.y = y;
  b.state = 'held';
 }
}

function cpuBeatStart(B) {
 const G = game, C = G.cpu, b = G.ball, h = C.holder;
 const atk = G.players.filter(p => p.team === 'D');
 if (B.k === 'drive') {
  if (B.shoot) B.to = [ DGX + rnd(44, 58), CY + rnd(-20, 20) ]; else if (!B.to) B.to = [ Math.max(DGX + 56, h.x - rnd(22, 38)), h.y + (CY - h.y) * .35 ];
 } else if (B.k === 'pass') {
  const others = atk.filter(a => a !== h).sort((p, q) => p.x - q.x);
  let r = B.int ? pick(others.slice(0, 3)) : pick(others.slice(0, 4));
  if (B.toShooter && C.shooter && C.shooter !== h && G.players.includes(C.shooter)) r = C.shooter;
  B.r = r;
  B.from = stickPos(h);
  C.holder = null;
  C.slider = null;
  b.state = 'pass';
  b.x = B.from[0];
  b.y = B.from[1];
  SFX.pass();
  if (B.int) {
   const [rx, ry] = stickPos(r);
   B.pt = [ B.from[0] + (rx - B.from[0]) * .7, B.from[1] + (ry - B.from[1]) * .7 ];
   B.d = r.mark0 && G.players.includes(r.mark0) ? r.mark0 : nearestTo('O', B.pt[0], B.pt[1]);
   B.d.busy = true;
   B.spd = 95;
   B.ttime = Math.hypot(B.pt[0] - B.from[0], B.pt[1] - B.from[1]) / B.spd;
  } else B.spd = 130;
 } else if (B.k === 'dodge') {
  B.dir = h.y > CY + 6 ? -1 : h.y < CY - 6 ? 1 : Math.random() < .5 ? -1 : 1;
  const m = h.mark0;
  if (m) {
   m.bite = .75;
   m.biteDir = -B.dir;
  }
  SFX.pass();
 } else if (B.k === 'check') {
  B.d = C.slider || (h.mark0 && G.players.includes(h.mark0) ? h.mark0 : nearestTo('O', h.x, h.y));
  B.d.busy = true;
  B.ph = 0;
 } else if (B.k === 'shot') {
  const gk = G.players.find(p => p.team === 'G2'), o = C.outcome;
  const side = Math.random() < .5 ? -1 : 1;
  B.pipe = o === 'miss' && Math.random() < .4 ? side : 0;
  const ty = o === 'goal' ? CY + side * rnd(4.5, 6.5) : o === 'save' ? CY + rnd(-4, 4) : B.pipe ? CY + side * (MOUTH + .5) : CY + side * rnd(MOUTH + 3, MOUTH + 8);
  const [sx, sy] = stickPos(h);
  C.holder = null;
  C.shotBy = h.pl || null;
  const sp = 155, L = Math.hypot(DGX - sx, ty - sy);
  b.state = 'shot';
  b.x = sx;
  b.y = sy;
  b.shotFrom = [ sx, sy ];
  b.vx = (DGX - sx) / L * sp;
  b.vy = (ty - sy) / L * sp;
  b.power = .7;
  B.ty = ty;
  SFX.shot(.7);
  gk.busy = true;
  B.gk = gk;
  B.gTo = o === 'save' ? ty + 6 : o === 'goal' ? gk.y + (ty + 6 - gk.y) * .35 - side * 2 : gk.y;
 } else if (B.k === 'flag') {
  const d = h && h.mark0 && G.players.includes(h.mark0) ? h.mark0 : nearestTo('O', h ? h.x : MIDX, h ? h.y : CY);
  B.d = d;
  d.busy = true;
  SFX.whistle();
  G.penPending = {
   side: 'U',
   who: d.pl,
   foul: pick([ 'PUSHING', 'SLASHING', 'HOLDING', 'ILLEGAL BODY CHECK' ])
  };
  addFx('txt', h ? h.x : MIDX, (h ? h.y : CY) - 26, {
   s: 'FLAG!',
   col: '#ffe14d',
   life: 1.2
  });
 } else if (B.k === 'result') {
  applyCpu();
  const o = C.outcome, opp = T(G.opp);
  const shn = C.shotBy ? lastName(C.shotBy) : C.shooter && C.shooter.pl ? lastName(C.shooter.pl) : opp.name;
  if (o === 'goal') {
   cpuEnd('GOAL', '#ff5a4a', shn + ' SCORES FOR ' + opp.name);
   SFX.bad();
   goalPing(DGX);
   crowd12(false);
   benchReact('o', 'goal');
   if (!G.userHome) G.crowd = 2.5;
   G.rippleL = true;
   G.ripple = 1;
   G.scorers.push([ 1, (C.shotBy || C.shooter && C.shooter.pl || {}).id ]);
  } else if (o === 'flag') {
   const pp = G.penPending;
   cpuEnd('FLAG!', '#ffe14d', (pp ? pp.foul + ' ON ' + lastName(pp.who) : 'PENALTY') + ' - YOU ARE MAN-DOWN');
  } else if (o === 'save') {
   cpuEnd('SAVED!', '#7dff7a', 'SAVE BY ' + lastName(PP(G.lu[0].G)) + ' - YOUR BALL');
   if (C.skipped) {
    SFX.save();
    cheer18('save');
   }
  } else if (o === 'miss') {
   cpuEnd(B.pipe || (C.beats.find(x => x.k === 'shot') || {}).pipeT ? 'PIPE!' : 'WIDE!', '#7dff7a', 'YOUR BALL');
   eventChirp('miss', .75);
  } else cpuEnd(C.toType === 'int' ? 'PICKED OFF!' : 'TURNOVER!', '#7dff7a', 'YOUR BALL');
  if (o !== 'goal') SFX.cheer();
  B.dur = C.skipped ? 1.1 : 1.8;
 }
}

function cpuBeatStep(B, dt, gk) {
 const G = game, C = G.cpu, b = G.ball, h = C.holder;
 if (B.k === 'drive') {
  if (h) moveTo(h, Math.max(DGX + CREASE + 20, B.to[0]), B.to[1], 40 * CS, dt);
  return B.t >= B.dur || h && Math.hypot(h.x - B.to[0], h.y - B.to[1]) < 1 && B.t > .3;
 }
 if (B.k === 'pass') {
  if (B.int) {
   const d = B.d;
   moveTo(d, B.pt[0] - BX, B.pt[1] - BY, Math.max(40, Math.hypot(B.pt[0] - BX - d.x, B.pt[1] - BY - d.y) / Math.max(.05, B.ttime - B.t) * 1.15), dt);
   const dx = B.pt[0] - b.x, dy = B.pt[1] - b.y, L = Math.hypot(dx, dy), s = B.spd * dt;
   if (L <= s) {
    C.holder = d;
    d.busy = false;
    SFX.catch();
    addFx('catch', b.x, b.y);
    return true;
   }
   b.x += dx / L * s;
   b.y += dy / L * s;
   return false;
  }
  const r = B.r;
  r.busy = true;
  moveTo(r, r.x + 4, r.y, 12, dt);
  const [tx, ty] = stickPos(r), dx = tx - b.x, dy = ty - b.y, L = Math.hypot(dx, dy), s = B.spd * dt;
  if (L <= s) {
   C.holder = r;
   r.busy = false;
   SFX.catch();
   addFx('catch', tx, ty);
   return true;
  }
  b.x += dx / L * s;
  b.y += dy / L * s;
  return false;
 }
 if (B.k === 'dodge') {
  if (h) {
   if (B.t < .22) moveTo(h, h.x - 2, h.y - B.dir * 9, 30 * CS, dt); else moveTo(h, h.x - 40, h.y + B.dir * 60, 58 * CS, dt);
  }
  if (B.t > .3 && !C.slider && h) {
   let best = null, bd = 1e9;
   for (const d of G.players) if (d.team === 'O' && d !== h.mark0) {
    const dd = Math.hypot(d.x - h.x, d.y - h.y);
    if (dd < bd) {
     bd = dd;
     best = d;
    }
   }
   if (G.hotP && G.players.includes(G.hotP) && G.hotP !== h.mark0) best = G.hotP;
   C.slider = best;
   if (best) fireCall(G.players.find(p => p.team === 'G2'));
  }
  return B.t >= .7;
 }
 if (B.k === 'check') {
  const d = B.d;
  if (B.ph === 0) {
   if (h) moveTo(h, h.x - 10, h.y, 20, dt);
   moveTo(d, h.x - 6, h.y, 60, dt);
   if (Math.hypot(d.x - h.x, d.y - h.y) < 7 || B.t > .8) {
    B.ph = 1;
    C.holder = null;
    SFX.save();
    addFx('pop', b.x, b.y);
    const a = rnd(-2.2, 2.2);
    b.state = 'loose';
    b.vx = Math.cos(a) * 45 + 10;
    b.vy = Math.sin(a) * 45;
   }
   return false;
  }
  const sp = Math.hypot(b.vx, b.vy);
  if (sp > .5) {
   const ns = Math.max(0, sp - 70 * dt);
   b.vx *= ns / sp;
   b.vy *= ns / sp;
  }
  b.x += b.vx * dt;
  b.y = clamp(b.y + b.vy * dt, FT + 6, FB - 3);
  moveTo(d, b.x - BX, b.y - BY + 2, 52, dt);
  if (Math.hypot(d.x + BX - b.x, d.y + BY - b.y) < 5 || B.t > 2.2) {
   C.holder = d;
   d.busy = false;
   SFX.catch();
   return true;
  }
  return false;
 }
 if (B.k === 'shot') {
  moveTo(B.gk, DGX + 5, clamp(B.gTo, CY - MOUTH - 1, CY + MOUTH + 7), C.outcome === 'save' ? 70 : 26, dt);
  const ox = b.x;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  const o = C.outcome;
  if (o === 'save' && b.x <= DGX + 6) {
   B.gk.busy = false;
   C.holder = B.gk;
   SFX.save();
   cheer18('save');
   addFx('pop', DGX + 6, b.y);
   if (game && Math.random() < OUR_SAVE_P) {
    game.ourSaveChirps = (game.ourSaveChirps || 0) + 1;
    game.gChirpPend = {
     gk: B.gk,
     t: vt() + .35
    };
   }
   return true;
  }
  if (o === 'goal' && b.x <= DGX) {
   b.state = 'net';
   b.vx = -40;
   b.vy *= .15;
   B.gk.busy = false;
   return true;
  }
  if (o === 'miss' && B.pipe && !B.pipeT && b.x <= DGX + 1) {
   B.pipeT = B.t;
   pipeBonk(b.x, b.y);
   addFx('pop', b.x, b.y);
   b.vx = rnd(50, 70);
   b.vy = B.pipe * rnd(30, 50);
  }
  if (o === 'miss' && B.pipeT && B.t - B.pipeT > .45) {
   b.state = 'dead';
   B.gk.busy = false;
   return true;
  }
  if (o === 'miss' && b.x <= DGX - 18) {
   b.state = 'dead';
   B.gk.busy = false;
   return true;
  }
  return false;
 }
 if (B.k === 'flag') {
  if (h) moveTo(h, h.x - 6, h.y + 6, 12, dt);
  if (B.d) moveTo(B.d, h ? h.x - 8 : B.d.x, h ? h.y : B.d.y, 30, dt);
  return B.t >= .9;
 }
 if (B.k === 'result') {
  if (b.state === 'net') {
   b.x = Math.max(DGX - 7, b.x + b.vx * dt);
   b.y += b.vy * dt * .2;
  }
  if (h && h.team === 'O') moveTo(h, h.x + 30, h.y, 24 * CS, dt);
  if (B.t >= B.dur) {
   afterCpu();
   return false;
  }
  return false;
 }
 return true;
}

function afterCpu() {
 const G = game;
 applyCpu();
 const goal = G.cpu.outcome === 'goal';
 if (G.cpu.outcome === 'flag') {
  if (startPenalty()) return;
 }
 if (G.ot && goal) return finishGame();
 if (!G.ot && G.clock <= 0) {
  G.clock = 0;
  return endQuarter();
 }
 if (goal) return startFaceoff();
 setupPossession();
 SFX.whistle();
}

function endQuarter() {
 const G = game;
 const NP = G.periods || 4;
 if (G.q >= NP + (G.otq || 0)) {
  if (G.score[0] !== G.score[1]) return finishGame();
  if ((G.otq || 0) < 2) {
   G.otq = (G.otq || 0) + 1;
   G.q++;
   G.clock = otLen173(G);
   screen = 'qbreak';
   G.qT = 0;
   return;
  }
  G.brave = true;
  G.pen = null;
  G.penPending = null;
  G.ot = true;
  G.q++;
  G.clock = 0;
  screen = 'qbreak';
  G.qT = 0;
  return;
 }
 G.q++;
 G.clock = G.qlen || QLEN;
 screen = 'qbreak';
 G.qT = 0;
 if (G.q === NP / 2 + 1) G.tos = [ 2, 2 ];
}

function finishGame() {
 const G = game;
 G.over = true;
 const win = G.score[0] > G.score[1];
 screen = 'final';
 G.finalT = 0;
 if (win) SFX.cheer(); else SFX.bad();
 if (G.mode === 'quick') {
  record[win ? 'w' : 'l']++;
  LS.set('record', record);
 } else if (G.mode === 'season') {
  try {
   seasonGame14(season, G);
  } catch (e) {
   console.error(e);
  }
  seasonRecordGame(win, G.score.slice());
 } else if (G.mode === 'world') {
  try {
   wgGame16(G);
  } catch (e) {
   console.error(e);
  }
  wgRecord16(win, G.score.slice());
 }
 try {
  celebStart15(G);
 } catch (e) {
  console.error(e);
 }
 if (window.V17) try {
  V17.gameOver(G, win);
 } catch (e) {
  console.error(e);
 }
}

const COIN15 = {
 flip: 1.7,
 show: 1.4,
 auto: 6
};

const ENDS15 = [ 'EAST', 'WEST' ];

const otherEnd15 = e => e === 'EAST' ? 'WEST' : 'EAST';

function coinOn15(G) {
 return !!G && !G.tutorial && !(G.coin && G.coin.phase === 'done');
}

const SUN18 = {
 pen: .12,
 visor: .5,
 gold: .25
};

window.RL_F19 = window.RL_F19 != null ? window.RL_F19 : true;

function sunOn18(G) {
 return window.RL_F19 && !!G && !!G.sun18 && !G.night && !G.tutorial && !G.online && !(G.meta && G.meta.online) && !window.__rl_v124gb && !!G.atk15;
}

function atkNow18(G) {
 const NP = G.periods || 4;
 return G.q > NP / 2 ? otherEnd15(G.atk15) : G.atk15;
}

function sunFace18(G, side) {
 if (!sunOn18(G)) return false;
 const a = atkNow18(G);
 return side === 'U' ? G.sun18 === a : G.sun18 === otherEnd15(a);
}

function sunMul18(G, gk, side) {
 if (!sunFace18(G, side)) return 1;
 const gr = G.g17 && gk && gk.pl && G.g17.gear && (G.g17.fx || window.__rl_v124gb || window.__rl_no332fx) ? G.g17.gear[gk.pl.id] : null, v = gr && gr.visor;
 const k = v ? v === 'visor_gold' ? SUN18.gold : SUN18.visor : 1;
 G.sunHits18 = (G.sunHits18 || 0) + 1;
 if (v) G.visorHits18 = (G.visorHits18 || 0) + 1;
 return 1 - SUN18.pen * k;
}

function coinBegin15(G) {
 const c = G.coin = {
  phase: 'call',
  t: 0,
  call: null,
  res: null,
  win: null,
  end: null,
  picker: null,
  caller: G.userHome ? 1 : 0
 };
 G.sun18 = window.RL_F19 && !G.night && !G.tutorial && !G.online && !(G.meta && G.meta.online) && !window.__rl_v124gb ? ENDS15[(seedOf('sun18|' + G.user + '|' + G.opp + '|' + newGameCount) >>> 2) % 2] : null;
 if (c.caller === 1) c.phase = 'cpucall';
 return c;
}

function coinCall15(call) {
 const G = game, c = G && G.coin;
 if (!c || c.phase !== 'call') return;
 c.call = call;
 coinFlip15(G, Math.random() < .5 ? 'H' : 'T');
}

function coinFlip15(G, res) {
 const c = G.coin;
 c.res = res;
 c.phase = 'flip';
 c.t = 0;
 SFX.tap && SFX.tap();
}

function coinPick15(G, end, who) {
 const c = G && G.coin;
 if (!c || c.end || c.phase !== 'pick' && c.phase !== 'cpupick') return false;
 c.end = end;
 c.picker = who;
 c.phase = 'show';
 c.t = 0;
 G.atk15 = who === 0 ? end : otherEnd15(end);
 return true;
}

function coinTick15(G, dt) {
 const c = G.coin || coinBegin15(G);
 c.t += dt;
 if (c.phase === 'cpucall' && c.t > .8) {
  c.call = Math.random() < .5 ? 'H' : 'T';
  coinFlip15(G, Math.random() < .5 ? 'H' : 'T');
 } else if (c.phase === 'flip' && c.t >= COIN15.flip) {
  if (c.win == null) c.win = c.call === c.res ? c.caller : 1 - c.caller;
  c.phase = c.win === 0 ? 'pick' : 'cpupick';
  c.t = 0;
  if (c.win === 0) SFX.cheer && SFX.cheer();
  if (G.sun18 && !c.online && !c.pend) {
   c.sunAuto = true;
   coinPick15(G, c.win === 0 ? otherEnd15(G.sun18) : otherEnd15(G.sun18), c.win === 0 ? 0 : 1);
  }
  if (c.pend) {
   const p = c.pend;
   c.pend = null;
   coinPick15(G, p.end, p.who);
  }
 } else if (c.phase === 'cpupick' && !c.online && c.t > 1) coinPick15(G, ENDS15[(seedOf(G.user + G.opp + newGameCount) >> 3) % 2], 1); else if (c.phase === 'show' && c.t >= COIN15.show) {
  c.phase = 'done';
  if (!walkOn2314(G)) startFaceoff(true);
 }
}

function drawCoin15() {
 const G = game, c = G.coin;
 if (!c || c.phase === 'done') return;
 const cx = W / 2;
 rect(0, 0, W, H, 'rgba(6,10,16,.93)');
 text('COIN TOSS', cx, 6, 3, '#ffe14d', 'center', '#000');
 const u = T(G.user), o = T(G.opp);
 const callerName = c.online ? null : c.caller === 0 ? 'YOU' : o.name;
 let cy = 70, sq = 1, face = c.res || 'H';
 if (c.phase === 'flip') {
  const k = clamp(c.t / COIN15.flip, 0, 1);
  cy = 70 - Math.sin(k * Math.PI) * 38;
  sq = Math.abs(Math.cos(c.t * 22));
  face = Math.floor(c.t * 22 / Math.PI) % 2 ? 'T' : 'H';
  if (k >= 1) face = c.res;
 } else if (c.phase === 'call' || c.phase === 'cpucall' || c.phase === 'netwait') {
  sq = 1;
  face = 'H';
 }
 const r = 15, rw = Math.max(1, Math.round(r * sq));
 g.fillStyle = '#000';
 g.beginPath();
 g.ellipse(Math.round(cx), Math.round(cy) + 2, rw, r, 0, 0, 6.2832);
 g.fill();
 g.fillStyle = '#c9952a';
 g.beginPath();
 g.ellipse(Math.round(cx), Math.round(cy), rw, r, 0, 0, 6.2832);
 g.fill();
 g.fillStyle = '#ffd34a';
 g.beginPath();
 g.ellipse(Math.round(cx), Math.round(cy), Math.max(1, rw - 2), r - 2, 0, 0, 6.2832);
 g.fill();
 if (sq > .45) text(face, cx, Math.round(cy) - 5, 2, '#7a5410', 'center');
 rect(Math.round(cx - 40), 106, 80, 1, 'rgba(255,255,255,.12)');
 const line = (s, y, col) => text(s, cx, y, 1, col || '#fff', 'center', '#000');
 G.coinLog15 = c.phase;
 if (c.phase === 'call') {
  line('YOU ARE AWAY - CALL IT!', 112, '#8fe3f0');
  button('HEADS', Math.round(cx - 84), H - 40, 80, 20, () => coinCall15('H'), {
   sc: 2,
   bg: '#ffd34a'
  });
  button('TAILS', Math.round(cx + 4), H - 40, 80, 20, () => coinCall15('T'), {
   sc: 2,
   bg: '#ffd34a'
  });
 } else if (c.phase === 'cpucall') line(o.name + ' (AWAY) CALL IT...', 112, '#8fe3f0'); else if (c.phase === 'netwait') line('THE HOME TEAM IS FLIPPING...', 112, '#8fe3f0'); else if (c.phase === 'flip') line(c.online ? 'HEADS = HOME TEAM WINS THE TOSS' : callerName + ' CALLED ' + (c.call === 'H' ? 'HEADS' : 'TAILS'), 112, '#8fe3f0'); else {
  const winName = c.win === 0 ? 'YOU WIN THE TOSS!' : o.name + ' WIN THE TOSS';
  text((c.res === 'H' ? 'HEADS' : 'TAILS') + ' - ' + winName, cx, 100, 1, c.win === 0 ? '#7dff7a' : '#ff9a8a', 'center', '#000');
  if (c.phase === 'pick') {
   line('PICK THE END YOU ATTACK FIRST (SIDES SWITCH AT HALF)', 112, '#ffe14d');
   button('EAST END', Math.round(cx - 92), H - 40, 88, 20, () => coinPick15(G, 'EAST', 0), {
    sc: 1,
    bg: '#7dff7a'
   });
   button('WEST END', Math.round(cx + 4), H - 40, 88, 20, () => coinPick15(G, 'WEST', 0), {
    sc: 1,
    bg: '#7dff7a'
   });
   if (c.online) line('AUTO PICK IN ' + Math.max(0, Math.ceil(COIN15.auto - c.t)), H - 14, '#7f9aa6');
  } else if (c.phase === 'cpupick') line(o.name + ' ARE PICKING AN END...', 112, '#8fe3f0'); else if (c.phase === 'show') {
   if (c.sunAuto) line('SUN IN THE ' + G.sun18 + ' - ' + (c.win === 0 ? 'YOUR' : o.name + "'S") + ' GOALIE HAS IT AT HIS BACK (SWITCHES AT HALF)', 112, '#ffe14d'); else line(c.picker === 0 ? 'YOU PICKED THE ' + c.end + ' END' : o.name + ' PICKED THE ' + c.end + ' END', 112, '#fff');
   text('YOU ATTACK THE ' + G.atk15 + ' END FIRST', cx, 124, 2, '#ffe14d', 'center', '#000');
  }
 }
 void u;
}

let NIGHT15 = null;

function drawNight15() {
 const top = FT - 4;
 rect(0, 0, W, top, 'rgba(4,10,34,.56)');
 for (let i = 0; i < 4; i++) rect(0, top + i, W, 1, 'rgba(4,10,34,' + (.46 - i * .1).toFixed(2) + ')');
 rect(0, top + 4, W, H - top - 4, 'rgba(4,10,34,.12)');
 if (!NIGHT15 || NIGHT15.w !== W) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const q = c.getContext('2d');
  for (const fx of [ .1, .37, .63, .9 ]) {
   const x = W * fx, gr = q.createRadialGradient(x, -6, 2, x, -6, 130);
   gr.addColorStop(0, 'rgba(255,250,215,.30)');
   gr.addColorStop(.35, 'rgba(255,248,210,.10)');
   gr.addColorStop(1, 'rgba(255,248,210,0)');
   q.fillStyle = gr;
   q.fillRect(0, 0, W, H);
   q.fillStyle = '#fffbe2';
   for (let i = 0; i < 4; i++) q.fillRect(Math.round(x - 7 + i * 4), 0, 3, 2);
  }
  NIGHT15 = {
   w: W,
   c: c
  };
 }
 g.save();
 g.globalCompositeOperation = 'lighter';
 g.drawImage(NIGHT15.c, 0, 0, W, H);
 g.restore();
 if (game) game.nightFrames15 = (game.nightFrames15 || 0) + 1;
}

const CELEB15 = {
 line: 3.7,
 dur: 7.4
};

function celebStart15(G) {
 if (!G || G.tutorial || typeof RL12 === 'undefined' || !RL12.FR || !RL12.FR.f14_HG0) return;
 const win = G.score[0] > G.score[1] ? 0 : G.score[1] > G.score[0] ? 1 : -1;
 const actors = [], sp = 9;
 for (let s = 0; s < 2; s++) {
  const lu = G.lu[s], ids = [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.G ].filter(id => PP(id));
  ids.forEach((id, i) => {
   const x = s === 0 ? MIDX - 16 - i * sp : MIDX + 16 + i * sp, y = CY + (s === 0 ? -4 : 4), dist = ids.length * sp + 36;
   const a = mkActor({
    x: x,
    y: y,
    pl: PP(id)
   }, s, {
    bench: true,
    spd: dist / (CELEB15.line - .3),
    i: i,
    tx: x + (s === 0 ? dist : -dist),
    ty: y
   });
   a.five = new Set;
   actors.push(a);
  });
 }
 G.celeb = {
  t: 0,
  win: win,
  actors: actors,
  gear: [],
  done: false,
  phase: 'line',
  fives: 0
 };
}

function celebTick15(G, dt) {
 const C = G.celeb;
 if (!C || C.done) return;
 C.t += dt;
 const t = C.t;
 camX += (clamp(MIDX - W / 2, 0, FL - W + PADW) - camX) * Math.min(1, dt * 4);
 for (const a of C.actors) actorTick14(a, dt);
 if (C.phase === 'line') {
  const L0 = C.actors.filter(a => a.side === 0), L1 = C.actors.filter(a => a.side === 1);
  for (const a of L0) for (const b of L1) if (Math.abs(a.x - b.x) < 3 && !a.five.has(b.i)) {
   a.five.add(b.i);
   b.five.add(a.i);
   a.punchT = t;
   b.punchT = t;
   C.fives++;
  }
  if (t >= CELEB15.line) {
   C.phase = 'party';
   for (const a of C.actors) {
    const h = seedOf('c15' + a.side + a.i);
    if (C.win === -1 || a.side === C.win) {
     a.tx = MIDX + h % 90 - 45;
     a.ty = CY + (h >> 8) % 34 - 17;
     a.spd = 40;
     a.party = true;
     a.throwT = CELEB15.line + .35 + a.i * .07;
    } else {
     a.tx = a.side === 0 ? benchX('u') + 30 + h % 30 : benchX('o') + 30 + h % 30;
     a.ty = FB + 2;
     a.spd = 9;
     a.sad = true;
     a.face = a.tx < a.x ? -1 : 1;
    }
   }
  }
 } else {
  for (const a of C.actors) {
   if (a.party && !a.thrown && t >= a.throwT) {
    a.thrown = true;
    a.helm = false;
    a.gloves = false;
    const pal = RL12.palette(a.kit, a.skin || 0), h = seedOf('g15' + a.side + a.i);
    C.gear.push({
     type: 'helm',
     x: a.x,
     y: a.y,
     gy: a.y + 2 + h % 4,
     vx: (h >> 4) % 30 - 15,
     vz: 78 + (h >> 9) % 30,
     t0: t,
     col: pal.H,
     col2: pal.h
    });
    for (const s of [ -1, 1 ]) C.gear.push({
     type: 'glove',
     x: a.x + s * 3,
     y: a.y,
     gy: a.y + 3 + (h >> (s > 0 ? 12 : 14)) % 4,
     vx: s * (8 + (h >> 6) % 14),
     vz: 64 + (h >> (s > 0 ? 3 : 7)) % 30,
     t0: t + .05,
     col: pal.G,
     col2: pal.g
    });
   }
   if (a.sad && !a.moving) a.face = a.side === 0 ? -1 : 1;
  }
 }
 if (t >= CELEB15.dur) C.done = true;
}

function celebSkip15() {
 const G = game;
 if (G && G.celeb && !G.celeb.done) {
  G.celeb.done = true;
  G.celeb.skipped = true;
 }
}

function drawCeleb15() {
 const G = game, C = G.celeb;
 if (!C) return;
 const t = C.t;
 const list = C.actors.slice().sort((p, q) => p.y - q.y);
 for (const a of list) {
  let z = 0;
  if (a.party && a.thrown && !a.moving) z = Math.round(Math.abs(Math.sin((t - a.throwT) * 7 + a.i)) * 5);
  const y0 = a.y;
  a.y = y0 - z;
  if (a.sad) {
   const m = a.moving;
   a.moving = false;
   drawActor14(a, t);
   a.moving = m;
  } else drawActor14(a, t);
  a.y = y0;
 }
 for (const it of C.gear) {
  const e = t - it.t0;
  if (e < 0) continue;
  const T0 = it.vz / 95, k = Math.min(1, e / T0), ee = Math.min(e, T0);
  const zz = Math.max(0, it.vz * ee - 95 * ee * ee), x = Math.round(it.x + it.vx * ee), y = Math.round(it.y - 10 + (it.gy - (it.y - 10)) * k - zz);
  if (it.type === 'helm') {
   rect(x - 3, y - 2, 6, 4, '#0d0d0d');
   rect(x - 2, y - 2, 4, 3, it.col);
   rect(x - 2, y - 2, 4, 1, 'rgba(255,255,255,.35)');
   rect(x + 1, y - 1, 2, 2, '#c8c8c8');
  } else {
   rect(x - 1, y - 1, 3, 3, '#0d0d0d');
   rect(x - 1, y - 1, 2, 2, it.col);
  }
 }
 G.celebFrames15 = (G.celebFrames15 || 0) + 1;
}

function drawCeleb15UI() {
 const G = game, C = G.celeb, cx = W / 2;
 if (!C) return;
 const wName = C.win === 0 ? T(G.user).name : C.win === 1 ? T(G.opp).name : '';
 const cap = C.phase === 'line' ? 'GOOD GAME' : wName ? wName + ' WIN!' : 'GOOD GAME', sub = C.phase === 'line' ? 'HANDSHAKE LINE' : C.win === 0 ? 'HELMETS UP - YOU WON IT' : 'HEADS DOWN - TOUGH ONE';
 const w = Math.max(textW(cap) * 2, textW(sub)) + 12;
 rect(Math.round(cx - w / 2), 14, Math.round(w), 24, 'rgba(10,12,16,.82)');
 text(cap, cx, 17, 2, C.phase === 'line' ? '#fff' : '#ffe14d', 'center', '#000');
 text(sub, cx, 30, 1, '#8fe3f0', 'center');
 rect(Math.round(cx - 52), H - 13, 104, 9, 'rgba(0,0,0,.5)');
 text('TAP ANYWHERE TO SKIP', cx, H - 11, 1, '#cfe', 'center');
 hit('SKIP CELEBRATION', 0, 0, W, H, () => celebSkip15(), 'SKIP CELEBRATION');
}

const FO_BTN = () => ({
 x: Math.round(W * .8),
 y: 122,
 r: 22
});

function startFaceoff(opening) {
 const G = game, o = T(G.opp);
 if (G.v14) G.v14.gear = [];
 const v131 = V131ON();
 if (G.cset) clrEnd();
 G.fo = {
  phase: v131 ? 'form' : 'ready',
  v131: v131,
  formT: 0,
  hold: null,
  readyDur: opening === true ? 2.4 : 1.5,
  opening: opening === true,
  t: 0,
  setDur: rnd(1.05, 1.35),
  startT: G.t,
  taps: 0,
  cpuRate: 5.4 + .5 * rf(PP(G.lu[1].FO), 'fo') + rnd(-.8, .8),
  cpuReact: rnd(.35, .6),
  whistleT: 0,
  win: null
 };
 G.fo.cpuRate *= DF.foRate || 1;
 G.fo.cpuReact *= DF.foReact || 1;
 if (window.V17 && G.g17) V17.foStart(G.fo);
 const P = [];
 const add = (team, x, y, role) => {
  const p = mkPlayer(team, P.length, x, y);
  p.role = role;
  P.push(p);
  return p;
 };
 const L0 = G.lu[0], L1 = G.lu[1];
 G.foMe = add('O', MIDX - 7, CY + 3, 'fogo');
 G.foMe.pl = PP(L0.FO);
 {
  const w1 = add('O', MIDX - 8, FT + 16, 'wing');
  w1.pl = PP(L0.LSM);
  w1.wy = FT + 16;
  const w2 = add('O', MIDX - 8, FB - 6, 'wing');
  w2.pl = PP(L0.M[0] === L0.FO ? L0.M[1] : L0.M[0]);
  w2.wy = FB - 6;
 }
 G.foThem = add('D', MIDX + 7, CY + 3, 'fogo');
 G.foThem.pl = PP(L1.FO);
 add('D', MIDX + 8, FT + 16, 'wing').pl = PP(L1.LSM);
 add('D', MIDX + 8, FB - 6, 'wing').pl = PP(L1.SSDM);
 add('G', GX - 5, CY, 'g').pl = PP(L1.G);
 const g2 = add('G', DGX + 5, CY, 'g2');
 g2.team = 'G2';
 g2.pl = PP(L0.G);
 G.players = P;
 G.carrier = null;
 G.goalie = P[6];
 applyPenaltyFaceoff();
 farInit('fo');
 G.cc = null;
 G.bc = null;
 G.ccC = null;
 G.bcC = null;
 G.ruleCall = null;
 G.ball = {
  x: MIDX,
  y: CY,
  state: 'fo',
  vx: 0,
  vy: 0
 };
 stick = null;
 shootP = null;
 if (v131) {
  foFormApply();
  foMatchTick(0, true);
 }
 if (!v131) for (const pt of pointers.values()) if (pt.zone === 'R') {
  stick = {
   id: pt.id,
   sx: pt.x,
   sy: pt.y,
   x: pt.x,
   y: pt.y
  };
  break;
 }
 screen = 'faceoff';
}

function foPointerDown(pt) {
 const G = game, F = G.fo;
 if (F.v131 && foPointerDown131(pt)) return;
 if (pt.zone !== 'R') return;
 stick = {
  id: pt.id,
  sx: pt.x,
  sy: pt.y,
  x: pt.x,
  y: pt.y
 };
 pt.role = 'stick';
 if (F.v131 && F.phase === 'go' && foTargetWing()) {
  G.foTapClamps = (G.foTapClamps || 0) + 1;
  foResolve(1, 0);
  return;
 }
 if (F.phase === 'set') {
  F.taps++;
  SFX.fo();
  F.bump = 1;
 }
}

function foStickMove() {
 const F = game.fo;
 if (!stick) return;
 const dx = stick.x - stick.sx, dy = stick.y - stick.sy, d = Math.hypot(dx, dy);
 if (F.phase === 'set' && d > 15) {
  foViolation();
  return;
 }
 if (F.phase === 'go' && d > 9) foResolve(dx / d, dy / d);
}

function foViolation() {
 const F = game.fo;
 F.phase = 'done';
 stick = null;
 endPossession('folose', 'TOO EARLY!', 'FACEOFF VIOLATION - THEIR BALL');
}

function foResolve(dx, dy) {
 const G = game, F = G.fo;
 const react = F.t - F.whistleT;
 const pTaps = F.taps / F.setDur * (F.tapMulU || 1);
 const adv = (pTaps - F.cpuRate) * .07 + (F.cpuReact - react) * 1.2;
 const foEdge = .11 * (rf(G.foMe.pl, 'fo') - rf(G.foThem.pl, 'fo'));
 const pWin = clamp(.5 + adv + foEdge, .08, .92);
 F.pWin = pWin;
 F.win = Math.random() < pWin;
 F.phase = 'scrum';
 F.react = react;
 F.st = 0;
 G.stats.fot++;
 if (F.win) G.stats.fow++;
 {
  const fp = PP(G.lu[0].FO);
  st14('fot', fp);
  if (F.win) st14('fow', fp);
 }
 if (!F.win) {
  const a = rnd(-1.1, 1.1);
  dx = Math.cos(a);
  dy = Math.sin(a);
 }
 if (!F.win && F.v131 && !window.__rl_v124gb) {
  F.lost39 = {
   t: F.target ? 1 : 0,
   h: F.hold ? 1 : 0
  };
  F.target = null;
  F.hold = null;
  F.popTo = null;
  G.lost39 = (G.lost39 || 0) + 1;
 }
 if (dx < -.2 && F.win) dx = -.2;
 const L = Math.hypot(dx, dy) || 1;
 G.ball.state = 'loose';
 G.ball.vx = dx / L * 95;
 G.ball.vy = dy / L * 95;
 {
  const tw = F.v131 ? foTargetWing() : null;
  if (F.win && tw) foWingPop(tw);
 }
 SFX.pass();
 stick = null;
}

function updateFaceoff(dt) {
 const G = game, F = G.fo, b = G.ball;
 foMatchTick(dt);
 if (F.phase === 'form') {
  foFormTick(dt);
  return;
 }
 F.t += dt;
 if (F.bump) F.bump = Math.max(0, F.bump - dt * 6);
 if (F.v131) foPickTick(dt);
 if (F.v131 && foLineTick(dt)) return;
 if (F.phase === 'ready') {
  const n = Math.ceil((F.readyDur - F.t) / (F.readyDur / 3));
  if (n !== F.lastN) {
   F.lastN = n;
   if (n >= 1 && n <= 3) SFX.tap();
  }
  if (F.t >= F.readyDur) {
   F.phase = 'set';
   F.t = 0;
   if (stick) {
    stick.sx = stick.x;
    stick.sy = stick.y;
   }
  }
  return;
 }
 if (F.phase === 'set' && F.t >= F.setDur) {
  F.phase = 'go';
  F.whistleT = F.t;
  SFX.whistle();
  if (F.v131) foWhistle131();
 }
 if (F.phase === 'go' && F.t - F.whistleT > 1.6) {
  F.phase = 'done';
  endPossession('folose', 'TOO SLOW!', 'THEY WIN THE FACEOFF');
  return;
 }
 if (F.phase === 'set' || F.phase === 'go') {
  G.foThem.x = MIDX + 7 + Math.sin(F.t * 30) * .6;
  G.foMe.x = MIDX - 7 + (F.bump || 0) * 1;
 }
 if (F.phase === 'scrum') {
  F.st += dt;
  if (!G.ot) G.clock -= dt;
  const sp = Math.hypot(b.vx, b.vy);
  if (sp > .5) {
   const ns = Math.max(0, sp - 110 * dt);
   b.vx *= ns / sp;
   b.vy *= ns / sp;
  }
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  if (b.y < FT + 6) {
   b.y = FT + 6;
   b.vy = Math.abs(b.vy);
  }
  if (b.y > FB - 2) {
   b.y = FB - 2;
   b.vy = -Math.abs(b.vy);
  }
  b.x = clamp(b.x, DGX + 20, GX - 20);
  const mine = G.players.filter(p => p.team === 'O'), theirs = G.players.filter(p => p.team === 'D');
  const near = arr => arr.reduce((a, p) => Math.hypot(p.x - b.x, p.y - b.y) < Math.hypot(a.x - b.x, a.y - b.y) ? p : a);
  const self231 = s231on() && G.tutorial && !G.tutorial.complete && G.tutorial.step === TUT_FO_STEP && mine.includes(G.foMe);
  const cm = F.popTo && mine.includes(F.popTo) ? F.popTo : self231 ? G.foMe : near(mine), ct = near(theirs);
  cm.tx = b.x - 3;
  cm.ty = b.y + 7;
  cm.spd = F.win ? 66 : 40;
  ct.tx = b.x + 3;
  ct.ty = b.y + 7;
  ct.spd = F.win ? 40 : 66;
  for (const p of G.players) {
   if (p === cm || p === ct || p.team.startsWith('G')) continue;
   p.tx = p.x + (b.x - p.x) * .3;
   p.ty = p.y;
   p.spd = 20;
  }
  for (const p of G.players) {
   const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
   if (d > .3) {
    const s = Math.min(d, p.spd * spdMul(p) * dt);
    p.x += dx / d * s;
    p.y += dy / d * s;
    p.anim += s;
   }
  }
  const who = F.win ? cm : ct;
  if (Math.hypot(who.x + (F.win ? 3 : -3) - b.x, who.y - 7 - b.y) < 4 && F.st > .3) {
   F.phase = 'done';
   SFX.catch();
   if (F.win) {
    G.foLiveAt = G.t;
    G.foWho231 = who === G.foMe ? 'fogo' : who.role || '?';
    tutFlag('foWon');
    return liveFromFaceoff(who);
   }
   endPossession('folose', 'LOST FACEOFF', 'THEIR BALL');
   game.bannerAuto = 1.1;
  }
 }
}

const FO131 = {
 autoDown: 8,
 cpuViol: .012,
 forceCpu: false,
 wingL: MIDX - 40,
 wingR: MIDX + 40,
 hitR: 13,
 get off() {
  return !!window.__rl_fo130;
 },
 set off(v) {
  window.__rl_fo130 = !!v;
 }
};

function V131ON() {
 return V13ON() && !FO131.off;
}

function foWings() {
 const G = game;
 return G && G.players ? G.players.filter(p => p.team === 'O' && p.role === 'wing') : [];
}

function foAtk() {
 const G = game;
 return G && G.farU ? G.farU.filter(f => f.role === 'A') : [];
}

function foClampWing(p) {
 p.x = clamp(p.x, FO131.wingL, FO131.wingR);
 p.y = p.wy != null ? p.wy : p.y;
}

function foClampAtk(f, legal) {
 f.x = clamp(f.x, legal ? RL_R + 4 : MIDX + 4, ENDX - 6);
 f.y = clamp(f.y, FT + 14, FB - 3);
 const cx = f.x - GX, cy = f.y - CY, cd = Math.hypot(cx, cy);
 if (cd < CREASE + 4) {
  f.x = GX + cx / (cd || 1) * (CREASE + 4);
  f.y = CY + (cd ? cy / cd : -1) * (CREASE + 4);
 }
}

const FO133 = {
 mark: 8,
 spd: 320,
 wingGap: 12,
 off: false
};

function foMatchPairs(atk, dl) {
 const n = Math.min(atk.length, dl.length);
 if (!n) return [];
 const perms = n === 3 ? [ [ 0, 1, 2 ], [ 0, 2, 1 ], [ 1, 0, 2 ], [ 1, 2, 0 ], [ 2, 0, 1 ], [ 2, 1, 0 ] ] : n === 2 ? [ [ 0, 1 ], [ 1, 0 ] ] : [ [ 0 ] ];
 const cost = pm => pm.reduce((s, j, i) => s + Math.hypot(atk[i].x - dl[j].x, atk[i].y - dl[j].y), 0);
 let best = perms[0], bc = 1e9;
 for (const pm of perms) {
  const c = cost(pm);
  if (c < bc) {
   bc = c;
   best = pm;
  }
 }
 return best;
}

function foMarkSpot(a, gx, lineX, cpuSide) {
 const dx = gx - a.x, dy = CY - a.y, L = Math.hypot(dx, dy) || 1;
 let x = a.x + dx / L * FO133.mark, y = a.y + dy / L * FO133.mark;
 x = cpuSide ? Math.max(x, lineX + 3) : Math.min(x, lineX - 3);
 return [ x, clamp(y, FT + 8, FB - 2) ];
}

function foMatchTick(dt, snap) {
 const G = game, F = G && G.fo;
 if (!F || !F.v131 || FO133.off || !G.farU || !G.farC) return;
 if (F.phase === 'scrum' || F.phase === 'done') return;
 const jump = F.cpuJump && F.cpuJump.f;
 const side = (atk, dl, gx, lineX, cpuSide, key) => {
  if (!atk.length || !dl.length) return;
  let pm = F[key];
  const fresh = foMatchPairs(atk, dl);
  if (!pm || pm.length !== Math.min(atk.length, dl.length)) pm = fresh; else {
   const cost = q => q.reduce((s, j, i) => s + Math.hypot(atk[i].x - dl[j].x, atk[i].y - dl[j].y), 0);
   if (cost(fresh) < cost(pm) - 24) pm = fresh;
  }
  F[key] = pm;
  pm.forEach((j, i) => {
   const d = dl[j];
   if (!d || d === jump) return;
   const q = foMarkSpot(atk[i], gx, lineX, cpuSide), ddx = q[0] - d.x, ddy = q[1] - d.y, dd = Math.hypot(ddx, ddy);
   const s = snap ? dd : Math.min(dd, FO133.spd * dt);
   if (dd > .01) {
    d.x += ddx / dd * s;
    d.y += ddy / dd * s;
    d.anim = (d.anim || 0) + s;
   }
   d.rest = [ d.x, d.y ];
   d.tx = d.x;
   d.ty = d.y;
   d.foMark = atk[i];
  });
 };
 side(foAtk(), G.farC.filter(f => f.role === 'D'), GX, RL_R, true, 'mC');
 side(G.farC.filter(f => f.role === 'A'), G.farU.filter(f => f.role === 'D'), DGX, RL_L, false, 'mU');
 if (F.phase === 'form' || F.phase === 'ready' || F.phase === 'set') {
  const mine = foWings(), theirs = G.players.filter(p => p.team === 'D' && p.role === 'wing');
  for (const w of theirs) {
   const u = mine.slice().sort((a, b) => Math.abs(a.y - w.y) - Math.abs(b.y - w.y))[0];
   if (!u) continue;
   const tx = u.x + FO133.wingGap, dd = tx - w.x, s = snap ? Math.abs(dd) : Math.min(Math.abs(dd), FO133.spd * dt);
   w.x += Math.sign(dd) * s;
  }
 }
 G.foMatchFrames = (G.foMatchFrames || 0) + 1;
}

function foFormSave() {
 const G = game;
 if (!G) return;
 const w = foWings().map(p => Math.round(p.x)), a = foAtk().map(f => [ Math.round(f.x), Math.round(f.y) ]);
 G.foForm = {
  w: w,
  a: a
 };
 LS.set('foForm', G.foForm);
}

function foFormApply() {
 const G = game;
 let F = G.foForm || LS.get('foForm', null);
 if (!F || !Array.isArray(F.w) || !Array.isArray(F.a)) return false;
 foWings().forEach((p, i) => {
  if (typeof F.w[i] === 'number') {
   p.x = F.w[i];
   foClampWing(p);
  }
 });
 foAtk().forEach((f, i) => {
  const q = F.a[i];
  if (Array.isArray(q) && q.length === 2) {
   f.x = q[0];
   f.y = q[1];
   foClampAtk(f, true);
   f.rest = [ f.x, f.y ];
   f.tx = f.x;
   f.ty = f.y;
  }
 });
 G.foForm = F;
 return true;
}

function tutFoSetupLeft() {
 const G = game, Tt = G && G.tutorial;
 if (!Tt || Tt.complete || Tt.step !== TUT_FO_STEP && Tt.step !== TF181 || !G.fo || G.fo.phase !== 'form') return '';
 const a = !Tt.f.foAtkMv, w = !Tt.f.foWingMv;
 return a && w ? 'AN ATTACKMAN + A WING' : a ? 'AN ATTACKMAN' : w ? 'A WING' : '';
}

function foDown(auto) {
 const G = game, F = G && G.fo;
 if (!F || F.phase !== 'form') return false;
 F.phase = 'ready';
 F.t = 0;
 F.downAuto = !!auto;
 F.downT = G.t;
 G.foMe.x = MIDX - 7;
 G.foThem.x = MIDX + 7;
 foFormSave();
 G.foDowns = (G.foDowns || 0) + 1;
 if (auto) G.foAutoDowns = (G.foAutoDowns || 0) + 1;
 addFx('txt', G.foMe.x, G.foMe.y - 26, {
  s: 'DOWN',
  col: '#ffe14d',
  life: .9
 });
 SFX.tap();
 tutFlag('foDown');
 return true;
}

function foFormTick(dt) {
 const G = game, F = G.fo;
 F.formT += dt;
 G.foMe.x = MIDX - 11;
 G.foThem.x = MIDX + 11;
 const touching = [ ...pointers.values() ].some(p => p.role === 'foDrag');
 if (touching) F.formIdle = 0; else F.formIdle = (F.formIdle || 0) + dt;
 if (!(G.tutorial && !G.tutorial.complete && (G.tutorial.step === TV131.FORM || G.tutorial.step === TV131.DOWN || G.tutorial.step === TF181)) && !tutFoSetupLeft() && F.formIdle >= FO131.autoDown) foDown(true);
}

function foPick(wx, wy, list) {
 let best = null, bd = FO131.hitR;
 for (const p of list) {
  const d = Math.hypot(p.x - wx, p.y - 9 - wy);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 return best;
}

const FO_DOWN_BTN = () => ({
 x: 19,
 y: 122,
 r: 15
});

function tutFoBtn2318(pt) {
 if (window.__rl_no2318e || window.__rl_v124gb || !tutFoT18()) return false;
 return pt.zone === 'R' && foBtnHit(pt, 4);
}

function foBtnHit(pt, pad, B) {
 B = B || FO_BTN();
 return Math.hypot(pt.x - B.x, pt.y - B.y) <= B.r + (pad || 0);
}

function foPointerDown131(pt) {
 const G = game, F = G.fo, wx = pt.x + Math.round(camX), wy = pt.y;
 if (F.phase === 'form') {
  if (foBtnHit(pt, 4, FO_DOWN_BTN())) {
   if (tutFoSetupLeft()) {
    addFx('cue', 0, 0, {
     s: 'FIRST: DRAG ' + tutFoSetupLeft() + ' TO A NEW SPOT',
     col: '#ffe14d',
     life: 1.4
    });
    SFX.bad();
    G.tutFoBlocked = (G.tutFoBlocked || 0) + 1;
    return true;
   }
   foDown(false);
   stick = {
    id: pt.id,
    sx: pt.x,
    sy: pt.y,
    x: pt.x,
    y: pt.y
   };
   pt.role = 'stick';
   return true;
  }
  const who = foPick(wx, wy, foWings().concat(foAtk()));
  if (who) {
   pt.role = 'foDrag';
   pt.drag = who;
   pt.dox = who.x - wx;
   pt.doy = who.y - wy;
   pt.g0 = [ who.x, who.y ];
   tutFlag('foGrab');
   return true;
  }
  return true;
 }
 if (F.phase === 'ready' || F.phase === 'set' || F.phase === 'go') {
  if (tutFoBtn2318(pt)) return false;
  if (pt.zone === 'R' && foBtnHit(pt, -5)) return false;
  const w = foPick(wx, wy, foWings());
  if (w) {
   F.hold = {
    id: pt.id,
    p: w,
    held: 0
   };
   pt.role = 'foWing';
   G.foHolds = (G.foHolds || 0) + 1;
   tutFlag('foHold');
   return true;
  }
  const a = foPick(wx, wy, foAtk());
  if (a) {
   pt.role = 'foDrag';
   pt.drag = a;
   pt.dox = a.x - wx;
   pt.doy = a.y - wy;
   pt.live = true;
   return true;
  }
  if (pt.zone === 'R' && foBtnHit(pt, 8)) return false;
 }
 return false;
}

function foDragMove(pt) {
 const G = game, F = G && G.fo, p = pt.drag;
 if (!F || !p) return;
 const wx = pt.x + Math.round(camX) + pt.dox, wy = pt.y + pt.doy;
 if (F.phase === 'form') {
  p.x = wx;
  p.y = wy;
  if (p.role === 'wing') foClampWing(p); else {
   foClampAtk(p, true);
   p.rest = [ p.x, p.y ];
   p.tx = p.x;
   p.ty = p.y;
  }
  tutFlag('foDrag');
  {
   const Tt = G.tutorial;
   if (Tt && !Tt.complete && (Tt.step === TUT_FO_STEP || Tt.step === TF181) && pt.g0 && Math.hypot(p.x - pt.g0[0], p.y - pt.g0[1]) >= 6) {
    if (p.role === 'wing') Tt.f.foWingMv = true; else if (p.far) Tt.f.foAtkMv = true;
   }
  }
 } else if (pt.live && p.far && F.phase !== 'done') {
  p.x = wx;
  p.y = wy;
  foClampAtk(p, false);
  p.rest = [ p.x, p.y ];
 }
}

function foPointerUp(pt) {
 const G = game, F = G && G.fo;
 if (!F) return;
 if (pt.role === 'foWing' && F.hold && F.hold.id === pt.id) F.hold = null;
 if (pt.role === 'foDrag' && F.phase === 'form') foFormSave();
}

function foHeldWing() {
 const G = game, F = G && G.fo;
 if (!F || !F.hold || !pointers.has(F.hold.id)) return null;
 return G.players.includes(F.hold.p) ? F.hold.p : null;
}

const FO1401 = {
 hold: .3
};

function foPickTick(dt) {
 const G = game, F = G.fo;
 if (!(F.phase === 'ready' || F.phase === 'set' || F.phase === 'go')) return;
 const h = foHeldWing();
 if (!h || !F.hold) return;
 F.hold.held = (F.hold.held || 0) + dt;
 if (F.hold.held >= FO1401.hold && F.target !== h) {
  F.target = h;
  G.foPicks = (G.foPicks || 0) + 1;
  tutFlag('foPick');
  addFx('txt', h.x, h.y - 26, {
   s: 'PICKED',
   col: '#ffe14d',
   life: .8
  });
  SFX.tap();
 }
}

function foTargetWing() {
 const G = game, F = G && G.fo;
 if (!F) return null;
 const h = foHeldWing();
 if (h) return h;
 return F.target && G.players.includes(F.target) ? F.target : null;
}

function foWingPop(w) {
 const G = game, F = G.fo, b = G.ball;
 const tx = w.x + 3, ty = w.y - 7, dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1;
 const v = clamp(Math.sqrt(2 * 110 * d * .92), 60, 150);
 b.vx = dx / d * v;
 b.vy = dy / d * v;
 F.popTo = w;
 G.foPops = (G.foPops || 0) + 1;
 tutFlag('foPop');
 addFx('txt', w.x, w.y - 26, {
  s: 'POP!',
  col: '#7dff7a',
  life: .8
 });
}

function foWhistle131() {
 const G = game, F = G.fo;
 if (!G.tutorial && (FO131.forceCpu || Math.random() < FO131.cpuViol)) {
  const c = (G.farC || []).filter(f => f.role === 'A' || f.role === 'D');
  const f = c.length ? pick(c) : null;
  if (f) F.cpuJump = {
   f: f
  };
  FO131.forceCpu = false;
 }
}

function foViol(side, who) {
 const G = game, F = G.fo;
 if (F.phase === 'done') return true;
 F.phase = 'done';
 stick = null;
 F.hold = null;
 F.target = null;
 G.foViols = G.foViols || [];
 G.foViols.push({
  side: side,
  t: +G.t.toFixed(2),
  who: who && who.role
 });
 G.ruleLog = G.ruleLog || [];
 G.ruleLog.push({
  rule: 'RESTRAINING LINE',
  kind: side === 'U' ? 'uturn' : 'cturn',
  t: +G.t.toFixed(2),
  q: G.q,
  user: side === 'U'
 });
 G.ruleCalls = G.ruleCalls || {};
 G.ruleCalls['RESTRAINING LINE'] = (G.ruleCalls['RESTRAINING LINE'] || 0) + 1;
 if (side === 'U') endPossession('folose', 'OVER EARLY!', 'RESTRAINING LINE - THEIR BALL'); else {
  G.ball.x = MIDX;
  G.ball.y = CY;
  G.ball.state = 'fo';
  endPossession('fowin', 'OVER EARLY!', 'THEY LEFT THE RESTRAINING LINE - YOUR BALL');
 }
 if (G.banner) G.banner.sub2 = 'RESTRAINING LINE';
 return true;
}

function foLineTick(dt) {
 const G = game, F = G.fo;
 if (F.phase === 'done') return false;
 const b = G.ball, crossed = b && (b.x > RL_R || b.x < RL_L);
 if (crossed) return false;
 for (const f of foAtk()) if (f.x < RL_R - 1) return foViol('U', f);
 for (const f of G.farU || []) if (f.role === 'D' && f.x > RL_L + 1) return foViol('U', f);
 const J = F.cpuJump;
 if (J && (F.phase === 'go' || F.phase === 'scrum')) {
  const f = J.f;
  f.x += (f.role === 'A' ? 1 : -1) * 44 * dt;
  f.anim += 44 * dt;
 }
 for (const f of G.farC || []) {
  if (f.role === 'A' && f.x > RL_L + 1) return foViol('C', f);
  if (f.role === 'D' && f.x < RL_R - 1) return foViol('C', f);
 }
 return false;
}

function applyResult(S, a, b, sa, sb) {
 const ta = S.table[a], tb = S.table[b];
 const mckFirst = [ !(ta.w + ta.l), !(tb.w + tb.l) ];
 ta.gf += sa;
 ta.ga += sb;
 tb.gf += sb;
 tb.ga += sa;
 if (sa > sb) {
  ta.w++;
  tb.l++;
 } else {
  tb.w++;
  ta.l++;
 }
 injGameDone(S, a);
 injGameDone(S, b);
 try {
  if (mckFirst[0]) mck204Sim(S, a);
  if (mckFirst[1]) mck204Sim(S, b);
 } catch (e) {
  console.error(e);
 }
}

function standings(S) {
 return Object.keys(S.table).map(id => Object.assign({
  id: id
 }, S.table[id])).sort((x, y) => y.w - x.w || y.gf - y.ga - (x.gf - x.ga) || y.gf - x.gf);
}

function simWeekOthers(S) {
 const res = [];
 for (const [a, b] of S.rounds[S.week] || []) {
  if (a === S.team || b === S.team || a === 'BYE' || b === 'BYE') continue;
  const [sa, sb] = simScore(a, b);
  applyResult(S, a, b, sa, sb);
  res.push([ a, b, sa, sb, 'WK ' + (S.week + 1) ]);
  injSimGame(S, a);
  injSimGame(S, b);
  concSim14(S, a);
  concSim14(S, b);
 }
 S.results.push(...res);
 return res;
}

const PO_LABEL = {
 qf: 'QUARTER',
 semi: 'SEMI',
 final: 'FINAL'
};

const PO_NEXT = {
 qf: 'semi',
 semi: 'final',
 final: 'done'
};

function advanceWeek(S) {
 S.week++;
 if (S.week >= S.rounds.length) {
  const top = standings(S).slice(0, PLAYOFF_N).map(x => x.id), s = i => top[i];
  S.phase = 'playoff';
  S.playoff = {
   seeds: top,
   round: 'qf',
   games: [ [ s(0), s(7) ], [ s(3), s(4) ], [ s(1), s(6) ], [ s(2), s(5) ] ],
   results: []
  };
  if (!top.includes(S.team)) {
   S.elim = true;
   simPlayoffsRest(S);
  }
 }
}

function playoffAdvance(S, decided) {
 const P = S.playoff, winners = [];
 for (const gm of P.games) {
  const d = decided && decided.find(x => x.g === gm);
  if (d) {
   winners.push(d.w);
   continue;
  }
  const [a, b] = gm, [sa, sb] = simScore(a, b);
  P.results.push([ a, b, sa, sb, PO_LABEL[P.round] ]);
  winners.push(sa > sb ? a : b);
  injGameDone(S, a);
  injGameDone(S, b);
  injSimGame(S, a);
  injSimGame(S, b);
 }
 if (P.round === 'final') {
  S.champ = winners[0];
  P.round = 'done';
  S.phase = 'done';
  P.games = [];
  return;
 }
 P.round = PO_NEXT[P.round];
 P.games = [];
 for (let i = 0; i < winners.length; i += 2) P.games.push([ winners[i], winners[i + 1] ]);
}

function simPlayoffsRest(S) {
 let guard = 0;
 while (S.playoff && S.playoff.round !== 'done' && guard++ < 5) playoffAdvance(S);
}

function seasonRecordGame(win, sc) {
 const S = season;
 if (!S) return;
 const opp = game.opp;
 if (S.phase === 'reg') {
  applyResult(S, S.team, opp, sc[0], sc[1]);
  S.results.push([ S.team, opp, sc[0], sc[1], 'WK ' + (S.week + 1) ]);
  simWeekOthers(S);
  advanceWeek(S);
 } else if (S.phase === 'playoff') {
  const P = S.playoff, gm = P.games.find(x => x.includes(S.team));
  if (gm) {
   const lab = PO_LABEL[P.round], wasFinal = P.round === 'final';
   P.results.push([ S.team, opp, sc[0], sc[1], lab ]);
   injGameDone(S, S.team);
   injGameDone(S, opp);
   playoffAdvance(S, [ {
    g: gm,
    w: win ? S.team : opp
   } ]);
   if (!win) {
    S.elim = true;
    simPlayoffsRest(S);
   } else if (wasFinal && !(window.V33 && V33.np(S))) LS.set('titles', LS.get('titles', 0) + 1);
  }
 }
 LS.set('season', S);
}

function nextSeasonGame(S) {
 if (S.phase === 'reg') {
  const gm = (S.rounds[S.week] || []).find(x => x.includes(S.team));
  if (!gm) return null;
  return {
   opp: gm[0] === S.team ? gm[1] : gm[0],
   home: S.week % 2 === 0,
   label: 'WEEK ' + (S.week + 1) + ' OF ' + S.rounds.length
  };
 }
 if (S.phase === 'playoff' && !S.elim) {
  const P = S.playoff, seed = id => P.seeds.indexOf(id);
  let opp = null, label = '';
  const m = (P.games || []).find(x => x.includes(S.team));
  if (m) {
   opp = m[0] === S.team ? m[1] : m[0];
   label = {
    qf: 'PLAYOFF QUARTERFINAL',
    semi: 'PLAYOFF SEMIFINAL',
    final: 'CHAMPIONSHIP'
   }[P.round];
  }
  if (opp) return {
   opp: opp,
   home: seed(S.team) < seed(opp),
   label: label
  };
 }
 return null;
}

const CROWD = [];

for (let i = 0; i < 260; i++) CROWD.push({
 x: i * 2 + i % 3,
 row: i % 3,
 k: i * 7919 % 11,
 ph: i * 13 % 7
});

function drawStadium() {
 const ht = homeTeam(), c1 = accent(ht), c2 = ht.id === 'CHA' ? '#1b1b1b' : ht.c2;
 rect(0, 17, FL, FT - 17, '#141922');
 const pal = [ c1, c1, c2, '#ffffff', '#f0c090', c1, '#d9d9d9', c2, '#c48a5a', c1, '#ffffff' ];
 const jump = game.crowd > 0 ? 1 : 0;
 for (let i = 0; i < CROWD.length; i++) {
  const p = CROWD[i];
  for (let rep = 0; rep < 2; rep++) {
   const x = p.x + rep * 530 - 6;
   const y = 19 + p.row * 4 - (jump && Math.floor(game.t * 10 + p.ph) % 2 ? 1 : 0);
   rect(x, y, 2, 2, pal[p.k]);
   px(x, y + 2, '#0c0f14');
  }
 }
 rect(FL, 17, 120, H - 17, '#0f141c');
 rect(0, FT - 3, FL, 2, c1);
 rect(0, FB + 1, FL, H - FB, c1);
 rect(0, FB + 1, FL, 1, 'rgba(0,0,0,.35)');
 const tc = textOn(c1);
 for (let x = 10; x < FL; x += 100) {
  text(ht.name, x, FB + 3, 1, tc);
 }
 if (snow21(ht)) drawSnow21();
 if (window.GHO16 && GHO16.on() && ht && (ht.gho16 || window.V28 && V28.stGho())) GHO16.stadium();
}

const SNOW21 = [ 'ARC', 'ATL', 'NYL', 'LIL', 'ROC' ];

function snow21(ht) {
 if (window.__rl_no21 || window.__rl_v124gb || !ht) return false;
 const b = window.UNI21 ? UNI21.base(ht.id) : ht.id;
 return SNOW21.includes(b) || SNOW21.includes(ht.szBase);
}

function drawSnow21() {
 const t = game ? game.t : menuT, W2 = FL + 120;
 for (let x = 0; x < FL; x += 3) {
  const h = 1 + (x * 7 % 5 === 0 ? 1 : 0);
  rect(x, FT - 3 - h, 3, h, '#f4f8ff');
 }
 rect(0, FB + 1, FL, 1, '#f4f8ff');
 for (let x = 2; x < FL; x += 7) px(x, FB + 2, '#dfe8f2');
 for (let i = 0; i < 90; i++) px(i * 37 % FL, 18 + i * 11 % Math.max(1, FT - 22), '#e8f0fa');
 for (let i = 0; i < 140; i++) {
  const x0 = i * 53.7 % W2, sp = 6 + i % 5 * 2, top = i % 3 === 0, y0 = top ? 17 : FB + 4, hh = top ? FT - 21 : H - FB - 5;
  if (hh <= 2) continue;
  const y = y0 + (i * 7.3 + t * sp) % hh, x = x0 + Math.sin(t * .8 + i) * 2;
  px(Math.round(x), Math.round(y), i % 4 ? '#ffffff' : '#cfe0f0');
 }
 for (let i = 0; i < 30; i++) {
  const x = FL + i * 29 % 118, y = 17 + (i * 41 + t * (5 + i % 4)) % (H - 18);
  px(Math.round(x), Math.round(y), '#ffffff');
 }
}

function drawField() {
 const ht = homeTeam(), c1 = accent(ht);
 for (let x = 0; x < FL; x += 20) rect(x, FT - 1, 20, FB - FT + 2, (x / 20 | 0) % 2 ? '#3f9a40' : '#45a446');
 rect(0, FT - 1, 4, FB - FT + 2, c1);
 rect(FL - 4, FT - 1, 4, FB - FT + 2, c1);
 const L = '#e9f6e9';
 rect(4, FT, FL - 8, 1, L);
 rect(4, FB, FL - 8, 1, L);
 rect(4, FT, 1, FB - FT, L);
 rect(FL - 5, FT, 1, FB - FT + 1, L);
 g.globalAlpha = .5;
 badge(ht, MIDX - 19, CY - 26, 3);
 g.globalAlpha = .45;
 text(ht.name, MIDX, CY + 25, 2, '#ffffff', 'center');
 g.globalAlpha = 1;
 rect(MIDX, FT, 1, FB - FT, L);
 rect(MIDX - 2, CY - 2, 5, 1, L);
 rect(MIDX - 2, CY + 2, 5, 1, L);
 px(MIDX - 1, CY - 1, L);
 px(MIDX + 1, CY + 1, L);
 px(MIDX + 1, CY - 1, L);
 px(MIDX - 1, CY + 1, L);
 rect(MIDX - 1, FT + 10, 3, 1, L);
 rect(MIDX - 1, FB - 10, 3, 1, L);
 for (let y = FT; y < FB; y += 4) {
  rect(GX - 150, y, 1, 2, 'rgba(233,246,233,.6)');
  rect(DGX + 150, y, 1, 2, 'rgba(233,246,233,.6)');
 }
 if (game ? game.twoPt : SETTINGS.twoPt) {
  drawArc(GX, 1);
  drawArc(DGX, -1);
 }
 drawGoal(GX, 1);
 drawGoal(DGX, -1);
}

function drawGoal(gx, dir) {
 const L = '#e9f6e9';
 g.fillStyle = '#4fb050';
 for (let y = -CREASE; y <= CREASE; y++) {
  const w = Math.floor(Math.sqrt(CREASE * CREASE - y * y));
  g.fillRect(gx - w, CY + y, w * 2 + 1, 1);
 }
 circle(gx, CY, CREASE, L, .03);
 rect(gx, CY - MOUTH, 1, MOUTH * 2 + 1, L);
 const depth = 9, rip = !!game && game.ripple > 0 && (dir > 0 ? !game.rippleL : !!game.rippleL);
 for (let x = 1; x <= depth; x++) {
  const h = Math.round(MOUTH * (1 - x / (depth + 2)));
  for (let y = -h; y <= h; y++) if ((x + y) % 2 === 0) px(gx + x * dir, CY + y, rip && Math.random() < game.ripple ? '#ffffff' : '#c9d6d9');
 }
 const o = '#ff7a1a';
 line(gx, CY - MOUTH, gx + (depth + 1) * dir, CY, o);
 line(gx, CY + MOUTH, gx + (depth + 1) * dir, CY, o);
 rect(gx - 1, CY - MOUTH - 1, 3, 3, o);
 rect(gx - 1, CY + MOUTH - 1, 3, 3, o);
 rect(gx, CY - MOUTH, 1, MOUTH * 2 + 1, o);
}

const HAS12 = typeof RL12 !== 'undefined' && !!RL12.FR;

const PSC = .6;

function scaled12(x, y, fn) {
 const X = Math.round(x), Y = Math.round(y);
 g.save();
 g.translate(X, Y);
 g.scale(PSC, PSC);
 g.translate(-X, -Y);
 try {
  fn();
 } finally {
  g.restore();
 }
}

let tagQ = null, ballQ = false, topPass = false;

const tagCache = new Map;

function tagText(pl) {
 if (!pl) return '';
 let ln = '';
 try {
  ln = lastName(pl);
 } catch (e) {
  ln = String(pl.name || '').split(' ').slice(-1)[0];
 }
 ln = fold2318(ln || '').toUpperCase().replace(/[^A-Z0-9.'\- ]/g, '').trim().slice(0, 8);
 const n = pl.num != null ? pl.num : pl.number != null ? pl.number : jerseyNo(pl);
 return (ln + (n != null && n !== '' ? ' ' + n : '')).trim();
}

const RNUM15 = DATA.nums || {};

function realNum15(p) {
 if (!p) return null;
 if (p.world) return p.wnum != null ? p.wnum : null;
 const v = RNUM15[p.team + '|' + (p.n0 != null ? p.n0 : p.n)];
 return v == null ? null : v;
}

function seedNum15(id) {
 return seedOf('jno-' + id) % 99 + 1;
}

function assignNums15(ids, out) {
 const used = new Set, ps = ids.map(PP).filter(Boolean), rest = [];
 const reals = ps.filter(p => realNum15(p) != null).sort((a, b) => b.real - a.real || b.ovr - a.ovr);
 for (const p of reals) {
  const n = realNum15(p);
  if (!used.has(n)) {
   used.add(n);
   out[p.id] = n;
  } else rest.push(p);
 }
 for (const p of ps) if (realNum15(p) == null) rest.push(p);
 for (const p of rest) {
  let n = seedNum15(p.id), k = 0;
  while (used.has(n) && k++ < 100) n = n % 99 + 1;
  used.add(n);
  out[p.id] = n;
 }
 return out;
}

let NUM15 = null, SNUM15 = {
 key: null,
 S: null,
 map: null
};

function baseNums15() {
 if (NUM15) return NUM15;
 NUM15 = {};
 for (const t of TEAMS) assignNums15(t.roster, NUM15);
 for (const t of WTEAMS) assignNums15(t.roster, NUM15);
 return NUM15;
}

function seasonNums15() {
 const S = season;
 if (!S || !S.rosters) return null;
 let n = 0, cs = 0;
 for (const k in S.rosters) {
  const r = S.rosters[k] || [];
  n += r.length;
  if (r.length) cs = cs + seedOf(r[0] + r[r.length - 1]) >>> 0;
 }
 const key = S.year + '|' + S.team + '|' + n + '|' + cs;
 if (SNUM15.key === key && SNUM15.S === S) return SNUM15.map;
 const map = {};
 for (const k in S.rosters) assignNums15(S.rosters[k] || [], map);
 SNUM15 = {
  key: key,
  S: S,
  map: map
 };
 return map;
}

function jerseyNo(pl, src, tid) {
 if (!pl) return '';
 const id = pl.id;
 if (id == null) return '';
 const sz = tid && SZ_REG[tid];
 if (sz && sz.nums && sz.nums[id] != null) return sz.nums[id];
 if (src === 'season') {
  const m = seasonNums15();
  if (m && m[id] != null) return m[id];
 }
 const b = baseNums15();
 if (b[id] != null) return b[id];
 return seedNum15(id);
}

function gameNum15(pl) {
 const G = game;
 if (!G || !pl) return jerseyNo(pl);
 const src = G.src || (G.mode === 'season' ? 'season' : 'real');
 if (!G.side15) G.side15 = [ new Set(teamRosterIds(G.user, src)), new Set(teamRosterIds(G.opp, src)) ];
 const tid = G.side15[0].has(pl.id) ? G.user : G.side15[1].has(pl.id) ? G.opp : null;
 return jerseyNo(pl, src, tid);
}

function queueTag(p) {
 if (tagQ && p && p.pl && !tagQ.has(p)) tagQ.set(p, [ p.x, p.y ]);
}

function tagName(pl) {
 if (!pl) return '';
 let ln = '';
 try {
  ln = lastName(pl);
 } catch (e) {
  ln = String(pl.name || '').split(' ').slice(-1)[0];
 }
 return fold2318(ln || '').toUpperCase().replace(/[^A-Z0-9.'\- ]/g, '').trim().slice(0, 8);
}

function ballCarrier() {
 const G = game;
 if (!G || !G.ball || G.ball.state !== 'held') return null;
 if (screen === 'live') return G.carrier || null;
 if (screen === 'defense') return G.dcar || null;
 if (screen === 'cpu') return G.cpu && G.cpu.holder || null;
 return null;
}

const has12 = n => HAS12 && Object.prototype.hasOwnProperty.call(RL12.FR, n);

const isKeeper = p => !!(p && (p.team === 'G' || p.team === 'G2' || p.gk || p.far && p.role === 'G'));

function isBallCarrier(p) {
 const G = game;
 if (!G || !G.ball || G.ball.state !== 'held') return false;
 return screen === 'live' && p === G.carrier || screen === 'defense' && p === G.dcar;
}

const RUN_N = [ 'run0', 'run1', 'run2', 'run3' ], CR_N = [ 'cradle0', 'cradle1', 'cradle2', 'cradle3' ];

function frame12(p) {
 const t = menuT, gk = isKeeper(p), pole = !gk && (isPole(p) || p.far && p.role === 'D');
 if (gk && !(p.down > 0) && p.lvl) {
  const lv = glvOff(p);
  if (lv && has12(lv.fr)) return lv.fr;
 }
 if (p._la !== p.anim) {
  p._la = p.anim;
  p._mv = t;
 }
 const moving = t - (p._mv == null ? -9 : p._mv) < .12, stride = Math.floor((p.anim || 0) / 4) & 3;
 let fr;
 if (p.down > 0) {
  const T0 = p.downT0 || .9, el = T0 - p.down;
  fr = el < .12 ? 'hitreact' : el < .3 ? 'fall0' : p.down < .14 ? 'getup1' : p.down < .3 ? 'getup0' : 'down';
 } else if (gk && p.chirpT0 != null && t >= p.chirpT0 && t - p.chirpT0 < 1.1) fr = 'chirp'; else if (gk && p.saveT0 != null && t - p.saveT0 < .45 && t >= p.saveT0) fr = p.saveFr || 'save_side'; else if (!gk && (p.shot20 || window.V20 && V20.otsAim282 && V20.otsAim282(p)) && window.V20 && V20.shotBody && V20.shotBody(p)) return V20.shotBody(p); else if (p.shootT0 != null && t - p.shootT0 < .3 && t >= p.shootT0) fr = gk ? t - p.shootT0 < .12 ? 'outlet0' : 'outlet1' : t - p.shootT0 < .09 ? 'shoot1' : 'shoot2'; else if (p.bullT0 != null && t - p.bullT0 < BULL.pose && t >= p.bullT0) fr = t - p.bullT0 < .08 ? 'hit0' : 'hit1'; else if (p.hitT0 != null && t - p.hitT0 < .3 && t >= p.hitT0) fr = t - p.hitT0 < .1 ? 'hit0' : 'hit1'; else if (p.chkT0 != null && t - p.chkT0 < .26 && t >= p.chkT0) fr = t - p.chkT0 < .08 ? 'check0' : 'check1'; else if (!gk && isBallCarrier(p)) fr = CR_N[moving ? stride : Math.floor(t * 4) & 3]; else if (moving) fr = gk ? 'move' + (stride & 1) : RUN_N[stride]; else fr = 'idle';
 if (gk) {
  const n = 'g_' + fr;
  if (has12(n)) return n;
  if (fr.startsWith('run') || fr.startsWith('cradle')) return 'g_move' + (stride & 1);
  return has12(fr) ? fr : 'g_idle';
 }
 if (pole) {
  const n = 'pole_' + fr;
  if (has12(n)) return d8frame(p, n);
  if (fr === 'shoot1' || fr === 'shoot2') return 'pole_check1';
 }
 return d8frame(p, has12(fr) ? fr : 'idle');
}

function drawPlayer12(p, kit, faceRight) {
 const n = frame12(p);
 p._fr = n;
 p._fright = faceRight;
 p._kit = kit;
 scaled12(p.x, p.y, () => {
  if (!(window.V17 && game && (game.g17 || p.pl && p.pl.leg && !window.__rl_no2002f6 || window.FLIP2403 && FLIP2403.gho(p.pl)) && V17.drawP(g, n, p, kit, faceRight))) RL12.draw(g, n, p.x, p.y, kit, faceRight, {
   skin: skinOf(p.pl)
  });
  braids21(p.pl, n, p.x, p.y, faceRight);
 });
 queueTag(p);
 if (window.__rlOrder) window.__rlOrder.push('P');
 if (game) game.v12draws = (game.v12draws || 0) + 1;
}

const noStick12 = new Map;

function draw12ns(name, x, y, kit, faceRight, skin, shadow) {
 const f = RL12.FR[name];
 if (!f) return;
 if (window.__v17p && window.V17 && game && (game.g17 && V17.heroGear && game.g17.gear[window.__v17p.pl && window.__v17p.pl.id] || window.__v17p.pl && window.__v17p.pl.leg && !window.__rl_no2002f6 || window.FLIP2403 && FLIP2403.gho(window.__v17p.pl))) {
  if (shadow !== false) rect(Math.round(x) - 4, Math.round(y), 9, 2, 'rgba(0,0,0,.25)');
  if (V17.draw12nsGear(name, x, y, kit, faceRight, skin)) return;
 }
 const uk21 = RL12.uniKey ? RL12.uniKey(kit) : '', key = name + '|' + kit.jersey + kit.trim + kit.helm + (faceRight ? 'R' : 'L') + skin + uk21;
 let c = noStick12.get(key);
 if (!c) {
  const rows = f[3], h = rows.length, w = rows[0].length, pal = RL12.palette(kit, skin), flip = !faceRight;
  c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const xg = c.getContext('2d');
  const um = uk21 ? RL12.uniMask(rows, name) : null;
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   const ch = rows[r][q];
   if (ch === '.' || ch === 'X' || ch === 'M' || ch === 'm' || ch === 'n') continue;
   xg.fillStyle = um && RL12.uniColor(kit, um, q, r, ch) || pal[ch];
   xg.fillRect(flip ? w - 1 - q : q, r, 1, 1);
  }
  noStick12.set(key, c);
 }
 x = Math.round(x);
 y = Math.round(y);
 if (shadow !== false) rect(x - 4, y, 9, 2, 'rgba(0,0,0,.25)');
 g.drawImage(c, x - (faceRight ? f[0] : c.width - 1 - f[0]), y - f[1]);
}

function on286a() {
 return !window.__rl_no286dodgeanim && !window.__rl_v124gb;
}

function kf286(k, keys) {
 for (let i = 1; i < keys.length; i++) if (k <= keys[i][0]) {
  const a = keys[i - 1], b = keys[i], u = (k - a[0]) / Math.max(1e-6, b[0] - a[0]), e = u * u * (3 - 2 * u);
  return [ a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e ];
 }
 const z = keys[keys.length - 1];
 return [ z[1], z[2] ];
}

function head286(x, y, A, fr) {
 const k = clamp(A.t / A.dur, 0, 1), h0 = stickHeadAt(x, y, A.from || 1, fr), s = fr ? 1 : -1;
 if (A.kind === 'swim') return kf286(k, [ [ 0, h0[0], h0[1] ], [ .28, x + s * 13, y - 30 ], [ .5, x + s * 7, y - 33 ], [ .75, x - s * 3, y - 27 ], [ 1, h0[0], h0[1] ] ]);
 return kf286(k, [ [ 0, h0[0], h0[1] ], [ .18, x - s * 2, y - 12 ], [ .42, x + s * 10, y - 2 ], [ .62, x + s * 9, y - 2 ], [ 1, h0[0], h0[1] ] ]);
}

function pose286(A, k, s) {
 if (A.kind === 'swim') {
  const dip = k < .45 ? 0 : Math.sin((k - .45) / .55 * Math.PI);
  return [ Math.round(s * (1 + dip * 2)), Math.round(dip * 2), s * .22 * dip - s * .06 * Math.sin(Math.min(1, k / .45) * Math.PI) ];
 }
 const cr = k < .18 ? k / .18 : k < .62 ? 1 : Math.max(0, 1 - (k - .62) / .2), go = k < .62 ? 0 : Math.sin((k - .62) / .38 * Math.PI);
 return [ Math.round(-s * cr + s * go * 2), Math.round(cr * 2), -s * .1 * cr + s * .2 * go ];
}

function head28(x, y, A, fr) {
 if (on286a()) {
  const q = pose286(A, clamp(A.t / A.dur, 0, 1), fr ? 1 : -1), h = head286(x, y, A, fr);
  return [ h[0] + q[0], h[1] + q[1] ];
 }
 const k = clamp(A.t / A.dur, 0, 1), h0 = stickHeadAt(x, y, A.from || 1, fr), s = fr ? 1 : -1;
 const mid = A.kind === 'swim' ? [ x + s * 3, y - 35 ] : [ x + s * 8, y - 3 ], end = [ h0[0] + s * (A.kind === 'swim' ? 3 : -1), h0[1] ];
 const u = k < .5 ? k * 2 : (k - .5) * 2, a = k < .5 ? h0 : mid, b = k < .5 ? mid : end;
 const arc = A.kind === 'swim' ? -Math.sin(u * Math.PI) * 4 : Math.sin(u * Math.PI) * 2;
 return [ a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + arc ];
}

function drawMove286(p, A, k, x, y, kit, faceRight, sk, long) {
 const G = game, s = faceRight ? 1 : -1, q = pose286(A, k, s), h = head28(x, y, A, faceRight), fr = RUN_N[Math.floor((p.anim || 0) / 4) & 3];
 if (A.kind === 'toe' && k > .15 && k < .75) for (let i = 0; i < 5; i++) px(x + s * (5 + i * 2), y - i % 2, 'rgba(230,220,190,' + (.85 - k).toFixed(2) + ')');
 if (A.kind === 'toe' && k > .42 && k < .8) {
  const a = (.8 - (k - .42) * 2).toFixed(2);
  rect(x - s * 4 - 1, y, 3, 1, 'rgba(230,220,190,' + a + ')');
  rect(x - s * 6, y - 1, 2, 1, 'rgba(230,220,190,' + a + ')');
 }
 g.save();
 g.translate(x + q[0], y + q[1]);
 g.rotate(q[2]);
 g.translate(-x, -y);
 draw12ns(fr, x, y, kit, faceRight, sk);
 g.restore();
 p._fr = 'run1';
 p._fright = faceRight;
 if (A.kind === 'swim') {
  const n = Math.min(8, Math.floor(k * 11));
  for (let i = 0; i < n; i++) {
   const t = i / 7, hp = kf286(t, [ [ 0, x + s * 14, y - 27 ], [ .35, x + s * 8, y - 35 ], [ .7, x - s * 2, y - 30 ], [ 1, x - s * 6, y - 22 ] ]);
   rect(Math.round(hp[0]), Math.round(hp[1]), 2, 1, 'rgba(143,227,240,' + (.9 * (1 - k * .6)).toFixed(2) + ')');
  }
 }
 drawHandStick(x + q[0], y + q[1], Math.round(h[0]), Math.round(h[1]), long);
 for (let i = 1; i <= 3; i++) px(x - (A.vx || 0) * i * 3, y - 12 - (A.vy || 0) * i * 3, 'rgba(143,227,240,.7)');
 G.move28Frames = (G.move28Frames || 0) + 1;
 (G.move28Seen = G.move28Seen || {})[A.kind] = 1;
 G.move286 = (G.move286 || 0) + 1;
}

function drawMove28(p, A, k, x, y, kit, faceRight, sk, long) {
 if (on286a()) return drawMove286(p, A, k, x, y, kit, faceRight, sk, long);
 const G = game, s = faceRight ? 1 : -1, lean = A.kind === 'swim' ? Math.round(Math.sin(k * Math.PI) * 2) * s : 0, qx = x + lean;
 draw12ns(RUN_N[Math.floor((p.anim || 0) / 4) & 3], qx, y, kit, faceRight, sk);
 p._fr = 'run1';
 p._fright = faceRight;
 const h = head28(x, y, A, faceRight);
 if (A.kind === 'swim') {
  for (let i = 0; i < 7; i++) {
   const a = Math.PI * (.15 + .7 * i / 6);
   px(Math.round(x + s * Math.cos(a) * 7), Math.round(y - 27 - Math.sin(a) * 8), 'rgba(143,227,240,' + (.75 * (1 - k)).toFixed(2) + ')');
  }
 } else if (k < .7) for (let i = 0; i < 4; i++) px(x + s * (4 + i * 2), y - i % 2, 'rgba(230,220,190,' + (.8 - k).toFixed(2) + ')');
 drawHandStick(qx, y, Math.round(h[0]), Math.round(h[1]), long);
 for (let i = 1; i <= 3; i++) px(x - (A.vx || 0) * i * 3, y - 12 - (A.vy || 0) * i * 3, 'rgba(143,227,240,.7)');
 G.move28Frames = (G.move28Frames || 0) + 1;
 (G.move28Seen = G.move28Seen || {})[A.kind] = 1;
}

function drawDodger12(p, kit, faceRight) {
 queueTag(p);
 scaled12(p.x, p.y, () => {
  window.__v17p = p;
  window.__v17sc = window.V17 && game && game.g17 ? V17.handStickCols(p) : null;
  try {
   drawDodger12s(p, kit, faceRight);
  } finally {
   window.__v17p = null;
   window.__v17sc = null;
  }
 });
}

function drawDodger12s(p, kit, faceRight) {
 const G = game, A = p.dodgeA, long = isPole(p), sk = skinOf(p.pl);
 const x = Math.round(p.x), y = Math.round(p.y);
 if (!A) {
  const n = frame12(p), base = n.startsWith('cradle') ? n : n.startsWith('run') ? n : 'idle';
  draw12ns(base, x, y, kit, faceRight, sk);
  p._fr = base;
  p._fright = faceRight;
  const h = stickHeadAt(x, y, handOf17(p), faceRight);
  drawHandStick(x, y, h[0], h[1], long);
  return;
 }
 const k = clamp(A.t / A.dur, 0, 1);
 if (A.kind === 'split') {
  const lean = Math.round(Math.sin(k * Math.PI) * 2) * (A.vx >= 0 ? 1 : -1), qx = Math.round(p.x + lean * .5);
  const d8 = d8live(p);
  draw12ns(d8 ? d8frame(p, RUN_N[Math.floor((p.anim || 0) / 4) & 3]) : RUN_N[Math.floor((p.anim || 0) / 4) & 3], qx, y, kit, faceRight, sk);
  if (d8) G.d8splits = (G.d8splits || 0) + 1;
  if (k < .6) for (let i = 0; i < 4; i++) px(x - A.vx * (3 + i * 2) + (i % 2 ? 1 : -1), y - A.vy * (2 + i) + 1, 'rgba(230,220,190,' + (.8 - k).toFixed(2) + ')');
  const h0 = d8 ? d8head(p, x, y, -(A.side || -1)) : stickHeadAt(x, y, A.from, faceRight), h1 = d8 ? d8head(p, x, y, A.side) : stickHeadAt(x, y, A.side, faceRight), mid = [ x + (d8 ? 0 : faceRight ? 1 : -1), y - 27 ];
  const hx = k < .5 ? h0[0] + (mid[0] - h0[0]) * k * 2 : mid[0] + (h1[0] - mid[0]) * (k - .5) * 2;
  const hy = k < .5 ? h0[1] + (mid[1] - h0[1]) * k * 2 : mid[1] + (h1[1] - mid[1]) * (k - .5) * 2;
  drawHandStick(qx, y, Math.round(hx), Math.round(hy), long);
  for (let i = 1; i <= 3; i++) px(x - A.vx * i * 3, y - 12 - A.vy * i * 3, 'rgba(143,227,240,.7)');
  G.splitFrames = (G.splitFrames || 0) + 1;
  return;
 }
 if (A.kind === 'swim' || A.kind === 'toe') {
  drawMove28(p, A, k, x, y, kit, faceRight, sk, long);
  return;
 }
 const r2 = !window.__rl_no2002r2 && !window.__rl_v124gb, fr = r2 ? Math.min(2, Math.floor(k * 3)) : Math.min(3, Math.floor(k * 4)), spinR = (A.spin || 1) > 0;
 const order = r2 ? spinR ? [ 0, 1, 2 ] : [ 0, 3, 2 ] : spinR ? [ 0, 1, 2, 3 ] : [ 0, 3, 2, 1 ], f = order[fr];
 let r2F0 = A.face ? A.face[0] >= 0 : faceRight, r2F1 = A.vx >= 0;
 if (p._r21 && J7on()) {
  r2F0 = !!p._r21.f0;
  r2F1 = !r2F0;
 }
 if (f === 0 || f === 2) {
  const fr2 = r2 ? f === 0 ? r2F0 : r2F1 : f === 0 ? faceRight : !faceRight;
  draw12ns('run1', x, y, kit, fr2, sk);
  const sx = x + (fr2 ? -4 : 4);
  line(sx, y - 8, sx, y - 20, long ? '#3a3a44' : '#282830');
  rect(sx - 1, y - 24, 3, 4, '#ffffff');
 } else if (f === 3) draw12ns('bench_idle0', x, y, kit, true, sk); else {
  draw12ns('bench_idle0', x, y, kit, true, sk);
  const hc = kit.helm === '#111111' || kit.helm === '#1b1b1b' ? '#262626' : kit.helm;
  rect(x - 4, y - 17, 9, 4, hc);
  rect(x - 4, y - 14, 9, 1, 'rgba(0,0,0,.35)');
  line(x + 4, y - 9, x + 6, y - 22, long ? '#3a3a44' : '#282830');
  rect(x + 5, y - 25, 3, 4, '#ffffff');
 }
 for (let a = 0; a < (r2 ? 3.14 : 6.28) * k; a += .45) px(x + Math.cos(a * (spinR ? 1 : -1)) * 9, y - 10 + Math.sin(a * (spinR ? 1 : -1)) * 5, 'rgba(143,227,240,.75)');
 G.rollFrames = (G.rollFrames || 0) + 1;
 G.rollFrameSeen = G.rollFrameSeen || {};
 G.rollFrameSeen[f] = 1;
}

const bv12 = {
 x: 0,
 y: 0,
 t: 0
};

function ballVis12(b) {
 const G = game;
 let tx = 0, ty = 0, held = false;
 const car = b.state === 'held' ? screen === 'live' ? G.carrier : screen === 'defense' ? G.dcar : null : null;
 if (car && car._fr && !car.dodgeA && (handOf17(car) !== -1 || /^d8/.test(car._fr))) {
  const pk = RL12.pocket(car._fr, car._fright);
  if (pk) {
   tx = Math.round(car.x + (sm211on() ? car._sox || 0 : 0)) + pk[0] * PSC - b.x;
   ty = Math.round(car.y + (sm211on() ? car._soy || 0 : 0)) + pk[1] * PSC - b.y;
   held = true;
  }
 }
 const dt = Math.max(0, Math.min(.1, menuT - bv12.t));
 bv12.t = menuT;
 const k = held ? Math.min(1, dt * 30) : Math.min(1, dt * 14);
 if (!window.__rl_no30clrfix && held && b.state === 'held' && bj287.held && (screen === 'live' || screen === 'defense') && clrtp287() && Math.hypot(tx - bv12.x, ty - bv12.y) * k > 10) {
  bj287.x += bv12.x - tx;
  bj287.y += bv12.y - ty;
  bv12.x = tx;
  bv12.y = ty;
  G.bv30 = (G.bv30 || 0) + 1;
 }
 bv12.x += (tx - bv12.x) * k;
 bv12.y += (ty - bv12.y) * k;
 if (Math.abs(bv12.x) < .05 && Math.abs(bv12.y) < .05) {
  bv12.x = 0;
  bv12.y = 0;
 }
 if (clrtp287() && (screen === 'live' || screen === 'defense')) {
  const hb = b.state === 'held' || !window.__rl_no32clr && b.state === 'clear' && screen === 'defense' && !!(G.dclear && G.dclear.holder), jx = bj287.bx == null ? 0 : b.x - bj287.bx, jy = bj287.by == null ? 0 : b.y - bj287.by, J = Math.hypot(jx, jy);
  if (hb && bj287.held && J > Math.max(9, 240 * Math.max(dt, 1 / 120)) && J < 600) {
   bj287.x -= jx;
   bj287.y -= jy;
   G.bj287 = (G.bj287 || 0) + 1;
  } else if (!hb) {
   bj287.x = 0;
   bj287.y = 0;
  }
  let L = Math.hypot(bj287.x, bj287.y);
  if (L > 480) {
   bj287.x *= 480 / L;
   bj287.y *= 480 / L;
   L = 480;
  }
  if (L > 0) {
   const nL = Math.max(0, L - clamp(L * 4, 160, 450) * dt), f = nL < .5 ? 0 : nL / L;
   bj287.x *= f;
   bj287.y *= f;
  }
  bj287.bx = b.x;
  bj287.by = b.y;
  bj287.held = hb;
  return [ bv12.x + bj287.x, bv12.y + bj287.y ];
 }
 bj287.bx = null;
 bj287.by = null;
 bj287.x = 0;
 bj287.y = 0;
 bj287.held = false;
 return [ bv12.x, bv12.y ];
}

const BENCHN = {
 u: 5,
 o: 4
}, BENCH_Y = H - 4, SUB_RUN = 1.1;

function benchX(side) {
 return side === 'u' ? MIDX - 100 : MIDX + 16;
}

function benchSlotX(side, i) {
 return benchX(side) + 16 + i * 9;
}

function benchWant(side) {
 const G = game, lu = G.lu && G.lu[side === 'u' ? 0 : 1];
 if (!lu) return [];
 const on = new Set;
 const mine = p => side === 'u' ? p.team === 'O' || p.team === 'G2' : p.team === 'D' || p.team === 'G';
 for (const p of G.players || []) if (p.pl && (window.__rl_dup22 || mine(p))) on.add(p.pl.id);
 for (const f of window.__rl_dup22 ? (G.farU || []).concat(G.farC || []) : side === 'u' ? G.farU || [] : G.farC || []) if (f.pl) on.add(f.pl.id);
 const order = [ ...lu.M, ...lu.A, lu.FO, lu.SSDM, lu.LSM, lu.SSDM2, ...lu.D ].concat((() => {
  try {
   return teamRosterIds(side === 'u' ? G.user : G.opp, G.src === 'season' ? 'season' : 'real');
  } catch (e) {
   return [];
  }
 })().filter(id => PP(id) && PP(id).pos !== 'G'));
 const out = [];
 for (const id of order) if (id && !on.has(id) && !out.includes(id) && PP(id)) {
  out.push(id);
  if (out.length >= BENCHN[side]) break;
 }
 return out;
}

function benchTick(side) {
 const G = game;
 G.bench = G.bench || {};
 let B = G.bench[side];
 if (!B) {
  B = G.bench[side] = {
   ids: benchWant(side),
   arr: {},
   run: [],
   chk: menuT
  };
  return B;
 }
 if (menuT - B.chk < .25) return B;
 B.chk = menuT;
 const want = benchWant(side), cur = B.ids;
 if (want.join() === cur.join()) return B;
 const goOn = cur.filter(id => !want.includes(id)), comeOff = want.filter(id => !cur.includes(id));
 const box = [ MIDX + (side === 'u' ? -8 : 8), FB - 2 ];
 goOn.forEach((id, i) => {
  const j = cur.indexOf(id);
  B.run.push({
   id: id,
   x0: benchSlotX(side, j),
   y0: BENCH_Y,
   x1: box[0] + i * 3,
   y1: box[1] - i * 4,
   t0: menuT + i * .08
  });
 });
 comeOff.forEach((id, i) => {
  const j = want.indexOf(id);
  B.arr[id] = menuT + SUB_RUN + i * .08;
  B.run.push({
   id: id,
   x0: box[0] - i * 3,
   y0: box[1] - i * 4,
   x1: benchSlotX(side, j),
   y1: BENCH_Y,
   t0: menuT + i * .08
  });
 });
 if (goOn.length || comeOff.length) {
  G.benchSwaps = (G.benchSwaps || 0) + 1;
  G.benchSubsMoved = (G.benchSubsMoved || 0) + goOn.length + comeOff.length;
 }
 B.ids = want;
 return B;
}

function injOf17(pid, team) {
 const S = season, j = pid && S && S.inj && S.inj[pid];
 return j && j.g > 0 && (!team || j.team === team) ? j : null;
}

function injKind17(what) {
 const w = String(what || '');
 if (/ACL|BROKEN LEG/.test(w)) return 'cast';
 if (/ANKLE/.test(w)) return /SPRAIN/.test(w) ? 'bootc' : 'boot';
 if (/HAM/.test(w)) return 'wrap';
 if (/CONCUSSION|BELL/.test(w)) return 'head';
 if (/SHOULDER|COLLARBONE|STINGER/.test(w)) return 'sling';
 return 'wrap';
}

const INJ17_HEAD = [ '....oooo....', '...oHHHHo...', '..oHHHHHHo..', '..oHSSSSHo..', '..oSeSSeSo..', '..oSSSSSSo..', '...oSmmSo...', '....oSSo....' ];

const inj17Cache = new WeakMap;

function injMod17(src, ay, kind, flip, key) {
 const ck = kind + '|' + (flip ? 1 : 0) + '|' + ay;
 let cm = inj17Cache.get(src);
 if (!cm) {
  cm = {};
  inj17Cache.set(src, cm);
 }
 if (cm[ck]) return cm[ck];
 const w = src.width, h = src.height, c = document.createElement('canvas');
 c.width = w;
 c.height = h;
 const x = c.getContext('2d');
 x.imageSmoothingEnabled = false;
 x.drawImage(src, 0, 0);
 const bt = ay - 21, X = col => flip ? w - 1 - col : col;
 let skin = '#e0ac69';
 try {
  const sx = src.getContext ? src.getContext('2d') : null;
  if (sx) {
   for (const [cc, rr] of [ [ 3, 18 ], [ 3, 5 ], [ 7, 5 ] ]) {
    const d = sx.getImageData(X(cc), bt + rr, 1, 1).data;
    if (d[3] > 200) {
     skin = 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
     break;
    }
   }
  }
 } catch (e) {}
 const lum = (() => {
  const m = skin.match(/\d+/g);
  return m ? +m[0] * .3 + +m[1] * .59 + +m[2] * .11 : 180;
 })();
 const P = {
  o: '#0b0b0b',
  H: lum < 110 ? '#141010' : '#4a3020',
  S: skin,
  e: '#111111',
  m: '#7a3a2a',
  W: '#f2f2f2',
  w: '#c8c8c8',
  B: '#2b2b2b',
  b: '#8a8a8a',
  C: '#9aa3ab',
  K: '#555555'
 };
 const px = (cc, rr, col) => {
  x.fillStyle = P[col] || col;
  x.fillRect(X(cc), bt + rr, 1, 1);
 };
 const rowp = (rr, s, c0) => {
  for (let i = 0; i < s.length; i++) if (s[i] !== '.') px((c0 || 0) + i, rr, s[i]);
 };
 x.clearRect(Math.min(X(0), X(11)), bt, 12, 8);
 INJ17_HEAD.forEach((s, rr) => rowp(rr, s, 0));
 if (kind === 'head') {
  rowp(2, '...WWWWWW...', 0);
  rowp(3, '...WwWWWW...', 0);
  px(9, 3, 'W');
 } else if (kind === 'cast') {
  for (let rr = 14; rr <= 20; rr++) rowp(rr, rr === 20 ? '.oWWWo' : '.oWWww', 0);
  rowp(21, '..ooo.', 0);
  for (const cc of [ 0, 11 ]) {
   for (let rr = 9; rr <= 21; rr++) px(cc, rr, 'C');
   px(cc, 9, 'K');
   px(cc, 13, 'K');
  }
 } else if (kind === 'boot' || kind === 'bootc') {
  rowp(17, '.oBBBo', 0);
  rowp(18, '.oBbBo', 0);
  rowp(19, '.oBBBo', 0);
  rowp(20, 'oBbBBo', 0);
  rowp(21, '.oooo.', 0);
  if (kind === 'bootc') {
   for (let rr = 9; rr <= 21; rr++) px(0, rr, 'C');
   px(0, 9, 'K');
   px(0, 13, 'K');
  }
 } else if (kind === 'wrap') {
  rowp(14, '.oWWWo', 0);
  rowp(15, '.oWwWo', 0);
  rowp(16, '.oWWWo', 0);
 } else if (kind === 'sling') {
  rowp(11, '.oWWWWWWo', 0);
  rowp(12, '.oWwWWwWWo', 0);
  rowp(13, '..oWWWWWWo', 0);
  px(9, 9, 'W');
  px(8, 10, 'W');
  px(9, 10, 'W');
 }
 cm[ck] = c;
 return c;
}

function injSide17(side) {
 const G = game;
 if (!G || G.tutorial || G.mode !== 'season' || !season || !season.inj || !HAS12) return [];
 const tid = side === 'u' ? G.user : G.opp, on = new Set((G.players || []).map(p => p.pl && p.pl.id));
 const out = [];
 for (const pid in season.inj) {
  const j = season.inj[pid];
  if (j && j.g > 0 && j.team === tid && PP(pid) && !on.has(pid)) out.push({
   pid: pid,
   j: j
  });
 }
 return out.slice(0, 3);
}

function drawInjured17(side, bx, kit) {
 const list = injSide17(side);
 if (!list.length) return 0;
 const f = RL12.FR.bench_idle0;
 if (!f) return 0;
 list.forEach((o, i) => {
  const x = side === 'u' ? bx + 80 + i * 11 : bx + 97 + i * 11, y = BENCH_Y, sk = skinOf(PP(o.pid));
  const src = RL12.bake('bench_idle0', kit, false, sk), c = injMod17(src, f[1], injKind17(o.j.what), false, 'side|' + side + '|' + o.pid + '|' + (kit && kit.jersey));
  scaled12(x, y, () => {
   g.fillStyle = 'rgba(0,0,0,.25)';
   g.fillRect(Math.round(x) - 4, Math.round(y), 9, 2);
   g.drawImage(c, Math.round(x) - f[0], Math.round(y) - f[1]);
  });
 });
 game.inj17 = (game.inj17 || 0) + 1;
 return list.length;
}

const COACH_LOOKS18 = {
 'Coach Van': {
  skin: 0,
  hair: '#f4f4f4',
  hair2: '#cfd3d6',
  J: '#1f4fd1',
  j: '#163a9c',
  P: '#f5d10a',
  p: '#c9a800'
 },
 'Dezzy Dallas': {
  skin: 0,
  hair: '#a3a3a3',
  hair2: '#7a7a7a',
  part: true,
  glasses: true,
  beard: '#f2f2f2',
  J: '#ff7a1a',
  j: '#c95a0a',
  P: '#1fb5ad',
  p: '#15857f'
 }
};

const DRAFT_COACHES18 = [ {
 n: 'Coach Van',
 k: 'sav',
 v: 3,
 style: 'GOALIE WHISPERER',
 line: '+3 SAVES - HOT GOALIE'
}, {
 n: 'Dezzy Dallas',
 k: 'fo',
 v: 3,
 style: 'FACEOFF GURU',
 line: '+3 FACEOFF - WIN THE X'
} ];

function coachLook18(side) {
 const G = game;
 if (!window.RL_F19 || !G || G.mode !== 'season' || side !== 'u' || !season || !season.coach || G.user !== season.team) return null;
 return COACH_LOOKS18[season.coach.n] || null;
}

const coachBakes18 = new Map;

function coachBake18(name, kit, flip, L) {
 const f = RL12.FR[name];
 if (!f) return null;
 const key = name + '|' + kit.jersey + kit.trim + kit.helm + '|' + (flip ? 1 : 0) + '|' + L.hair + L.J;
 let c = coachBakes18.get(key);
 if (c) return c;
 const rows = f[3].map(r => r.split('')), h = rows.length, w = rows[0].length, pal = Object.assign({}, RL12.palette(kit, L.skin || 0));
 pal.H = L.hair;
 pal.h = L.hair2;
 pal.w = L.hair;
 pal.J = L.J;
 pal.j = L.j;
 pal.P = L.P;
 pal.p = L.p;
 const T = {}, at = (x, y) => y >= 0 && y < h && x >= 0 && x < w ? rows[y][x] : null;
 const hairYs = rows.map((r, y) => r.some(ch => ch === 'H' || ch === 'h' || ch === 'w') ? y : -1).filter(y => y >= 0);
 if (hairYs.length) {
  const hy1 = Math.max(...hairYs), xs = rows[hy1].map((ch, x) => ch === 'H' || ch === 'h' || ch === 'w' ? x : -1).filter(x => x >= 0), hx0 = Math.min(...xs), hx1 = Math.max(...xs), by = hy1 + 1;
  if (rows[by] && rows[by].filter(ch => ch === 'o').length >= hx1 - hx0 + 1) for (let x = 0; x < w; x++) {
   if (rows[by][x] !== 'o') continue;
   rows[by][x] = x < hx0 - 1 || x > hx1 + 1 ? '.' : x === hx0 - 1 || x === hx1 + 1 ? 'o' : 'H';
  }
  if (L.part) {
   const mx = Math.round((hx0 + hx1) / 2);
   for (const y of hairYs) if (rows[y][mx] === 'H' || rows[y][mx] === 'w' || rows[y][mx] === 'h') T[mx + ',' + y] = '#4a4a4a';
  }
  const fy = [];
  for (let y = by + 1; y < h; y++) {
   if (rows[y].some(ch => ch === 'J' || ch === 'j')) break;
   if (rows[y].some(ch => ch === 'S' || ch === 's' || ch === 'Z')) fy.push(y);
  }
  let ey = -1;
  for (const y of fy) {
   const r = rows[y];
   const sx = r.map((ch, x) => ch === 'S' || ch === 's' || ch === 'Z' ? x : -1).filter(x => x >= 0);
   if (sx.length && r.some((ch, x) => ch === 'o' && x > Math.min(...sx) && x < Math.max(...sx))) {
    ey = y;
    break;
   }
  }
  if (L.glasses && ey >= 0) {
   const r = rows[ey], sx = r.map((ch, x) => ch === 'S' || ch === 's' || ch === 'Z' ? x : -1).filter(x => x >= 0), lo = Math.min(...sx), hi = Math.max(...sx);
   for (let x = lo; x <= hi; x++) T[x + ',' + ey] = '#0b0b0b';
   T[lo + 1 + ',' + ey] = '#5a6470';
  }
  if (L.beard && ey >= 0) for (const y of fy) if (y > ey + 1 || y === ey + 1 && fy.length <= 3) rows[y].forEach((ch, x) => {
   if (ch === 'S' || ch === 's' || ch === 'Z') T[x + ',' + y] = L.beard;
  });
 }
 const cv2 = document.createElement('canvas');
 cv2.width = w;
 cv2.height = h;
 const x2 = cv2.getContext('2d');
 rows.forEach((r, y) => r.forEach((ch, xx) => {
  if (ch === '.') return;
  const col = T[xx + ',' + y] || pal[ch];
  if (!col) return;
  x2.fillStyle = col;
  x2.fillRect(flip ? w - 1 - xx : xx, y, 1, 1);
 }));
 coachBakes18.set(key, cv2);
 return cv2;
}

function coachDraw18(gg, name, x, y, kit, faceRight, opts, L) {
 if (!L) return RL12.draw(gg, name, x, y, kit, faceRight, opts);
 const f = RL12.FR[name], c = f && coachBake18(name, kit, !faceRight, L);
 if (!c) return RL12.draw(gg, name, x, y, kit, faceRight, opts);
 x = Math.round(x);
 y = Math.round(y);
 gg.fillStyle = 'rgba(0,0,0,.25)';
 gg.fillRect(x - 4, y, 9, 2);
 const ax = faceRight ? f[0] : c.width - 1 - f[0];
 gg.drawImage(c, x - ax, y - f[1]);
 if (game) game.coach18 = (game.coach18 || 0) + 1;
}

function drawBench() {
 const G = game;
 if (!HAS12 || !G || !G.lu) return;
 for (const side of [ 'u', 'o' ]) {
  const B = benchTick(side), kit = side === 'u' ? G.uk : G.ok, bx = benchX(side), team = T(side === 'u' ? G.user : G.opp);
  const cheer = G.benchCheer && G.benchCheer[side] != null && menuT - G.benchCheer[side] < 2.2;
  B.ids.forEach((id, i) => {
   if (B.arr[id] && menuT < B.arr[id]) return;
   const ph = seedOf(id) % 7 * .37, fn = cheer ? RL12.frame('bench_cheer', menuT + ph, 5) : RL12.frame('bench_idle', menuT + ph, 2);
   scaled12(benchSlotX(side, i), BENCH_Y, () => RL12.draw(g, fn, benchSlotX(side, i), BENCH_Y, kit, true, {
    skin: skinOf(PP(id)),
    shadow: false
   }));
  });
  scaled12(bx + 28, H - 1, () => RL12.draw(g, 'prop_bench', bx + 28, H - 1, kit, true));
  scaled12(bx + 51, H - 1, () => RL12.draw(g, 'prop_bench', bx + 51, H - 1, kit, true));
  const cx = side === 'u' ? bx + 11 : bx + 69, pointing = G.coachPoint && G.coachPoint[side] != null && menuT - G.coachPoint[side] < 1.6;
  const rant = rantOn(side), re = rant ? menuT - G.rant.t0 : 0;
  let cfr = cheer ? RL12.frame('coach_cheer', menuT, 3) : pointing ? 'coach_point' : RL12.frame('coach_idle', menuT + (side === 'u' ? 0 : .6), 1.5);
  if (rant) cfr = re < 1.3 ? RL12.frame('coach_cheer', menuT, 6) : re < 1.8 ? 'coach_point' : RL12.frame('coach_idle', menuT, 1.5);
  if (!huddleOn()) scaled12(cx, H - 1, () => coachDraw18(g, cfr, cx, H - 1, kit, side === 'u', {
   skin: pickSkin('coach-' + team.id)
  }, coachLook18(side)));
  if (rant && !huddleOn()) {
   drawClipboard(side);
   G.rantFrames = (G.rantFrames || 0) + 1;
  }
  scaled12(side === 'u' ? bx + 68 : bx + 10, H - 1, () => RL12.draw(g, 'prop_cooler', side === 'u' ? bx + 68 : bx + 10, H - 1, kit, true));
  if (side === 'u' && window.V17 && V17.drawSidelineCrew18) try {
   V17.drawSidelineCrew18(g, bx, H - 1);
  } catch (e) {
   console.error(e);
  }
  try {
   drawInjured17(side, bx, kit);
  } catch (e) {
   console.error(e);
  }
  B.run = B.run.filter(r => menuT - r.t0 < SUB_RUN);
  for (const r of B.run) {
   const k = clamp((menuT - r.t0) / SUB_RUN, 0, 1);
   if (k <= 0) continue;
   const x = r.x0 + (r.x1 - r.x0) * k, y = r.y0 + (r.y1 - r.y0) * k;
   scaled12(x, y, () => RL12.draw(g, RUN_N[Math.floor(k * 14) & 3], x, y, kit, r.x1 >= r.x0, {
    skin: skinOf(PP(r.id))
   }));
   G.subRunFrames = (G.subRunFrames || 0) + 1;
  }
 }
 G.benchFrames = (G.benchFrames || 0) + 1;
}

function drawPlayer(p, kit, faceRight) {
 if (window.__rlKitLog && p.team) window.__rlKitLog.push([ p.team, p.role || '', kit.jersey, kit.trim, kit.helm ]);
 if (HAS12) {
  drawPlayer12(p, kit, faceRight);
  return;
 }
 const x = Math.round(p.x), y = Math.round(p.y), step = Math.floor(p.anim / 3) % 2;
 const skin = '#f0c090', out = '#0d0d0d';
 rect(x - 3, y, 7, 2, 'rgba(0,0,0,.25)');
 rect(x - 2, y - 3, 2, 3, out);
 rect(x + 1, y - 3, 2, 3, out);
 if (step) {
  rect(x - 2, y - 1, 2, 1, skin);
  rect(x + 1, y - 2, 2, 1, skin);
 } else {
  rect(x - 2, y - 2, 2, 1, skin);
  rect(x + 1, y - 1, 2, 1, skin);
 }
 rect(x - 3, y - 5, 7, 2, kit.trim);
 rect(x - 4, y - 10, 9, 6, out);
 rect(x - 3, y - 10, 7, 5, kit.jersey);
 rect(x - 3, y - 8, 7, 1, kit.trim === kit.jersey ? '#ffffff' : kit.trim);
 rect(x - 5, y - 8, 1, 2, out);
 rect(x + 5, y - 8, 1, 2, out);
 rect(x - 3, y - 14, 7, 4, out);
 const hc = kit.helm === '#111111' || kit.helm === '#1b1b1b' ? '#262626' : kit.helm;
 rect(x - 2, y - 14, 5, 3, hc);
 rect(x - 2, y - 14, 5, 1, 'rgba(255,255,255,.3)');
 if (faceRight) {
  rect(x + 2, y - 13, 1, 2, '#bdbdbd');
  px(x + 1, y - 12, skin);
 } else {
  rect(x - 2, y - 13, 1, 2, '#bdbdbd');
  px(x - 1, y - 12, skin);
 }
}

function drawStick(p, faceRight, goalie, long) {
 if (HAS12) return;
 const x = Math.round(p.x), y = Math.round(p.y);
 if (goalie) {
  const d = faceRight ? 1 : -1;
  line(x + 5 * d, y - 4, x + 5 * d, y - 12, '#c9a46b');
  const hx = x + 5 * d - 4, hy = y - 21;
  rect(hx - 1, hy - 1, 11, 10, '#0d0d0d');
  rect(hx, hy, 9, 8, '#ffffff');
  for (let i = 1; i < 8; i++) for (let j = 1; j < 7; j++) px(hx + i, hy + j, (i + j) % 2 ? '#c8d2d6' : '#f2f6f7');
  rect(hx + 3, hy + 8, 3, 1, '#ffffff');
  return;
 }
 if (long) {
  if (faceRight) {
   line(x + 2, y - 3, x + 9, y - 16, '#6b6b78');
   rect(x + 8, y - 20, 3, 4, '#fff');
   px(x + 9, y - 19, '#cfcfcf');
  } else {
   line(x - 2, y - 4, x - 15, y - 10, '#6b6b78');
   rect(x - 18, y - 12, 3, 3, '#fff');
  }
  return;
 }
 if (faceRight) {
  line(x + 4, y - 6, x + 6, y - 10, '#c9a46b');
  rect(x + 5, y - 14, 3, 4, '#fff');
  px(x + 6, y - 13, '#cfcfcf');
 } else {
  line(x - 4, y - 6, x - 8, y - 8, '#c9a46b');
  rect(x - 11, y - 10, 3, 3, '#fff');
 }
}

function handOf17(p) {
 return p.hand || (window.V17L && p.pl && window.V17L(p.pl) ? -1 : 1);
}

function stickHeadAt(x, y, hand, faceRight) {
 const d = faceRight ? 1 : -1;
 if (HAS12) return hand >= 0 ? [ x + 6 * d, y - 23 ] : [ x - 7 * d, y - 25 ];
 return hand >= 0 ? [ x + 6 * d, y - 13 ] : [ x - 8 * d, y - 15 ];
}

function drawHandStick(x, y, hx, hy, long) {
 const sc = window.__v17sc;
 if (HAS12) {
  if (sc && sc.glow) {
   g.globalAlpha = .35;
   line(x, y - 11, hx, hy + 3, sc.glow, 3);
   g.globalAlpha = 1;
  }
  line(x, y - 11, hx, hy + 3, sc ? sc.X : long ? '#3a3a44' : '#282830');
  rect(hx - 2, hy - 2, 5, 6, '#0d0d0d');
  rect(hx - 1, hy - 1, 3, 4, sc ? sc.M : '#ffffff');
  px(hx, hy + 1, sc ? sc.m : '#cdd6da');
  px(hx, hy + 2, sc ? sc.n : '#96a0a6');
  return;
 }
 line(x, y - 7, hx, hy + 3, long ? '#6b6b78' : '#c9a46b');
 rect(hx - 1, hy - 1, 3, 4, '#fff');
 px(hx, hy, '#cfcfcf');
}

function shotNow204(p) {
 return !!(p && p.shot20 && !window.__rl_no204s1 && !window.__rl_v124gb && window.V20 && V20.shotBody && V20.shotBody(p));
}

function drawDodger(p, kit, faceRight) {
 if (HAS12) {
  drawDodger12(p, kit, faceRight);
  return;
 }
 const G = game, A = p.dodgeA, long = isPole(p);
 const x = Math.round(p.x), y = Math.round(p.y);
 if (!A) {
  drawPlayer(p, kit, faceRight);
  const h = stickHeadAt(x, y, handOf17(p), faceRight);
  drawHandStick(x, y, h[0], h[1], long);
  return;
 }
 const k = clamp(A.t / A.dur, 0, 1);
 if (A.kind === 'split' || A.kind === 'swim' || A.kind === 'toe') {
  const lean = Math.round(Math.sin(k * Math.PI) * 2) * (A.vx >= 0 ? 1 : -1);
  const q = {
   x: p.x + lean * .5,
   y: p.y,
   anim: p.anim
  };
  drawPlayer(q, kit, faceRight);
  if (k < .6) for (let i = 0; i < 4; i++) px(x - A.vx * (3 + i * 2) + (i % 2 ? 1 : -1), y - A.vy * (2 + i) + 1, 'rgba(230,220,190,' + (.8 - k).toFixed(2) + ')');
  const h0 = stickHeadAt(x, y, A.from, faceRight), h1 = stickHeadAt(x, y, A.side, faceRight);
  const mid = [ x + (faceRight ? 1 : -1), y - 18 ];
  const hx = k < .5 ? h0[0] + (mid[0] - h0[0]) * k * 2 : mid[0] + (h1[0] - mid[0]) * (k - .5) * 2;
  const hy = k < .5 ? h0[1] + (mid[1] - h0[1]) * k * 2 : mid[1] + (h1[1] - mid[1]) * (k - .5) * 2;
  drawHandStick(Math.round(q.x), y, Math.round(hx), Math.round(hy), long);
  for (let i = 1; i <= 3; i++) px(x - A.vx * i * 3, y - 8 - A.vy * i * 3, 'rgba(143,227,240,.7)');
  G.splitFrames = (G.splitFrames || 0) + 1;
  return;
 }
 const r2 = !window.__rl_no2002r2 && !window.__rl_v124gb, fr = r2 ? Math.min(2, Math.floor(k * 3)) : Math.min(3, Math.floor(k * 4)), spinR = (A.spin || 1) > 0;
 const order = r2 ? spinR ? [ 0, 1, 2 ] : [ 0, 3, 2 ] : spinR ? [ 0, 1, 2, 3 ] : [ 0, 3, 2, 1 ], f = order[fr];
 let r2F0 = A.face ? A.face[0] >= 0 : faceRight, r2F1 = A.vx >= 0;
 if (p._r21 && J7on()) {
  r2F0 = !!p._r21.f0;
  r2F1 = !r2F0;
 }
 if (f === 0 || f === 2) {
  const fr2 = r2 ? f === 0 ? r2F0 : r2F1 : f === 0 ? faceRight : !faceRight;
  drawPlayer(p, kit, fr2);
  const sx = x + (fr2 ? -4 : 4);
  line(sx, y - 4, sx, y - 13, long ? '#6b6b78' : '#c9a46b');
  rect(sx - 1, y - 16, 3, 3, '#fff');
 } else {
  const out = '#0d0d0d', skin = '#f0c090';
  rect(x - 3, y, 7, 2, 'rgba(0,0,0,.25)');
  rect(x - 2, y - 3, 2, 3, out);
  rect(x + 1, y - 3, 2, 3, out);
  rect(x - 3, y - 5, 7, 2, kit.trim);
  rect(x - 5, y - 10, 11, 6, out);
  rect(x - 4, y - 10, 9, 5, kit.jersey);
  rect(x - 3, y - 14, 7, 4, out);
  const hc = kit.helm === '#111111' || kit.helm === '#1b1b1b' ? '#262626' : kit.helm;
  rect(x - 2, y - 14, 5, 3, hc);
  if (f === 3) {
   rect(x - 2, y - 12, 5, 2, '#bdbdbd');
   px(x, y - 11, skin);
  } else {
   rect(x - 2, y - 11, 5, 1, 'rgba(0,0,0,.35)');
   line(x + 3, y - 6, x + 5, y - 15, long ? '#6b6b78' : '#c9a46b');
   rect(x + 4, y - 18, 3, 3, '#fff');
  }
 }
 for (let a = 0; a < (r2 ? 3.14 : 6.28) * k; a += .45) px(x + Math.cos(a * (spinR ? 1 : -1)) * 8, y - 7 + Math.sin(a * (spinR ? 1 : -1)) * 4, 'rgba(143,227,240,.75)');
 G.rollFrames = (G.rollFrames || 0) + 1;
 G.rollFrameSeen = G.rollFrameSeen || {};
 G.rollFrameSeen[f] = 1;
}

const isPole = p => !!(p && p.pl && (p.pl.pos === 'D' || p.pl.pos === 'LSM'));

function drawFar(f) {
 const G = game, kit = f.team === 'U' ? G.uk : G.ok;
 let right = f.team === 'U';
 if (f.role === 'A' && screen === 'faceoff' && s231on() && f.x != null) {
  right = f.x < MIDX;
  G.foFace231 = (G.foFace231 || 0) + 1;
 }
 if (f.role === 'G') {
  drawPlayer(f, kit, right);
  drawStick(f, right, true);
  return;
 }
 drawPlayer(f, kit, right);
 drawStick(f, right, false, f.role === 'D' || isPole(f));
}

function drawPlayers() {
 const G = game;
 let list = G.players;
 if (G.farU && G.farC && (screen === 'live' || screen === 'defense' || screen === 'faceoff' || screen === 'banner' || screen === 'penalty' || screen === 'timeout')) {
  const hasG2 = G.players.some(p => p.team === 'G2'), hasG = G.players.some(p => p.team === 'G');
  list = list.concat(G.farU.filter(f => f.role !== 'G' || !hasG2), G.farC.filter(f => f.role !== 'G' || !hasG));
 }
 const sorted = list.slice().sort((p, q) => p.y - q.y);
 const HB = G.huddleBack, hk = HB ? clamp((menuT - HB.t0) / .7, 0, 1) : 1;
 {
  const t = menuT, dt = sm211T == null ? -1 : t - sm211T;
  sm211T = t;
  sm211Frame(dt);
 }
 for (const p of sorted) {
  if ((p._sox || p._soy) && sm211on() && (screen === 'live' || screen === 'defense')) {
   const ox = p.x, oy = p.y;
   p.x += p._sox;
   p.y += p._soy;
   try {
    if (window.prac18Ghost && window.prac18Ghost(p)) {
     g.globalAlpha = .45;
     try {
      if (p.far) drawFar(p); else drawOne(p);
     } finally {
      g.globalAlpha = 1;
     }
    } else if (p.far) drawFar(p); else drawOne(p);
   } finally {
    p.x = ox;
    p.y = oy;
   }
   continue;
  }
  if (window.prac18Ghost && window.prac18Ghost(p)) {
   g.globalAlpha = .45;
   try {
    if (p.far) drawFar(p); else drawOne(p);
   } finally {
    g.globalAlpha = 1;
   }
   continue;
  }
  if ((p.h7v || p.h7w) && H7on()) {
   const ox = p.x, oy = p.y;
   p.x += p.h7v || 0;
   p.y += p.h7w || 0;
   try {
    if (p.far) drawFar(p); else drawOne(p);
   } finally {
    p.x = ox;
    p.y = oy;
   }
   continue;
  }
  if (p.far) {
   drawFar(p);
   continue;
  }
  const hs = hk < 1 && p.pl && HB.spots.get(p.pl.id);
  if (hs) {
   const ox = p.x, oy = p.y, e = hk * hk * (3 - 2 * hk);
   p.x = hs[0] + (ox - hs[0]) * e;
   p.y = hs[1] + (oy - hs[1]) * e;
   try {
    drawOne(p);
   } finally {
    p.x = ox;
    p.y = oy;
   }
   G.huddleBackFrames = (G.huddleBackFrames || 0) + 1;
   continue;
  }
  drawOne(p);
 }
 function drawOne(p) {
  if (!hunch204(p)) return drawOne0(p);
  const fr = p.team !== 'D', X = Math.round(p.x), Y = Math.round(p.y);
  g.save();
  g.translate(X, Y);
  g.rotate(fr ? .32 : -.32);
  g.translate(-X, -Y);
  try {
   drawOne0(p);
  } finally {
   g.restore();
  }
  if (game) game.hunchFrames204 = (game.hunchFrames204 || 0) + 1;
 }
 function drawOne0(p) {
  if (p.down > 0) {
   const kit = p.team === 'O' || p.team === 'G2' ? G.uk : G.ok, fd = p.fallDir || 1;
   const el = (p.downT0 || .9) - p.down, f = p.down < .3 ? Math.max(0, p.down / .3) : Math.min(1, el / .2);
   if (HAS12) {
    drawPlayer(p, kit, fd < 0);
    G.fallFrames = (G.fallFrames || 0) + 1;
    if (trip286(p)) tripDust286(p, el);
    return;
   }
   rect(p.x - 7, p.y, 14, 1, 'rgba(0,0,0,.3)');
   g.save();
   g.translate(Math.round(p.x), Math.round(p.y));
   g.rotate(fd * Math.PI / 2 * f);
   const q = {
    x: 0,
    y: 0,
    anim: 0
   };
   drawPlayer(q, kit, fd > 0);
   if (p.team === 'G' || p.team === 'G2') drawStick(q, fd > 0, true); else drawStick(q, fd > 0, false, isPole(p));
   g.restore();
   G.fallFrames = (G.fallFrames || 0) + 1;
   return;
  }
  if (p.team === 'G' || p.team === 'G2') {
   const k = p.team === 'G' ? G.ok : G.uk, lv = p.lvl ? glvOff(p) : null;
   if (lv) {
    const ox = p.x, oy = p.y, fx0 = Math.round(ox + lv.ox), fy0 = Math.round(oy + lv.oy), fr = lv.ox >= 0 ? true : false;
    p.x = ox + lv.ox;
    p.y = oy + lv.oy;
    try {
     g.save();
     g.translate(fx0, fy0);
     g.rotate((p.lvl.ux >= 0 ? 1 : -1) * lv.lean);
     g.translate(-fx0, -fy0);
     drawPlayer(p, k, p.lvl.ux >= 0);
     g.restore();
    } finally {
     p.x = ox;
     p.y = oy;
    }
    G.glvFrames = (G.glvFrames || 0) + 1;
    G.glvLast = {
     fr: p._fr,
     ox: +lv.ox.toFixed(1),
     lean: +lv.lean.toFixed(2),
     e: +lv.e.toFixed(2)
    };
    return;
   }
   drawPlayer(p, k, p.team === 'G2');
   drawStick(p, p.team === 'G2', true);
  } else if (p.gk && !(window.V36DG && V36DG.gkDraw(p))) {
   drawPlayer(p, G.uk, true);
   drawStick(p, true, true);
  } else if (p.team === 'O' && (p.dodgeA || handOf17(p) === -1 && !(face21(p, true), 
  d8live(p))) && !shotNow204(p)) drawDodger(p, G.uk, p.dodgeA ? face21(p, true) : p._f211); else if (p.team === 'D' && p.dodgeA && ((p.dodgeA.kind === 'swim' || p.dodgeA.kind === 'toe') && m28on() || window.V36DG && V36DG.drawOk(p))) drawDodger(p, G.ok, face21(p, false)); else {
   const kit = p.team === 'O' ? G.uk : G.ok, fr = face21(p, p.team === 'O');
   drawPlayer(p, kit, fr);
   if (!(p.team === 'D' && shotNow204(p))) drawStick(p, fr, false, isPole(p));
  }
 }
}

function drawBall() {
 if (topPass) {
  ballQ = true;
  return;
 }
 drawBallNow();
}

function drawBallNow() {
 const b = game.ball;
 if (b.state === 'dead') return;
 const z = b.state === 'loose' || b.state === 'chase' ? Math.round(b.z || 0) : 0;
 const c = screen === 'live' && b.state === 'held' ? game.carrier : null;
 if (c && (c.dodgeA || handOf17(c) === -1)) {
  let h = stickHeadAt(Math.round(c.x), Math.round(c.y), handOf17(c), true);
  const S = HAS12 ? PSC : 1, cx0 = Math.round(c.x), cy0 = Math.round(c.y);
  if (c.dodgeA && c.dodgeA.kind === 'roll') {
   ballDot(cx0 - 1, cy0 - Math.round((HAS12 ? 24 : 17) * S));
   return;
  }
  if (c.dodgeA && (c.dodgeA.kind === 'swim' || c.dodgeA.kind === 'toe')) {
   const hh = head28(cx0, cy0, c.dodgeA, c._fright !== false);
   ballDot(Math.round(cx0 + (hh[0] - cx0) * S) - 1, Math.round(cy0 + (hh[1] - cy0) * S));
   return;
  }
  if (c.dodgeA) {
   const A = c.dodgeA, k = clamp(A.t / A.dur, 0, 1), h0 = stickHeadAt(Math.round(c.x), Math.round(c.y), A.from, true);
   const mid = [ Math.round(c.x) + 1, Math.round(c.y) - (HAS12 ? 27 : 18) ];
   h = k < .5 ? [ h0[0] + (mid[0] - h0[0]) * k * 2, h0[1] + (mid[1] - h0[1]) * k * 2 ] : [ mid[0] + (h[0] - mid[0]) * (k - .5) * 2, mid[1] + (h[1] - mid[1]) * (k - .5) * 2 ];
  }
  h = [ cx0 + (h[0] - cx0) * S, cy0 + (h[1] - cy0) * S ];
  ballDot(Math.round(h[0]) - 1, Math.round(h[1]));
  return;
 }
 const vo = HAS12 ? ballVis12(b) : null, vx = vo ? vo[0] : 0, vy = vo ? vo[1] : 0;
 rect(b.x - 1, b.y + 2, 2, 1, 'rgba(0,0,0,.3)');
 ballDot(Math.round(b.x + vx) - 1, Math.round(b.y + vy) - 1 - z);
 if (b.state === 'loose' || b.state === 'chase') looseArrow(b.x, b.y - z);
 if (b.state === 'loose' || b.state === 'chase') {
  const r = 4 + Math.floor(game.t * 6) % 2;
  for (let a = 0; a < 6.28; a += .5) px(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r * .6, '#ffe14d');
 }
 if (b.state === 'shot') line(b.x, b.y, b.x - b.vx * .035, b.y - b.vy * .035, 'rgba(255,255,255,.5)');
}

function ballDot(x, y) {
 x = Math.round(x);
 y = Math.round(y);
 const o = 1 / (RR || 2);
 g.fillStyle = '#0b0b10';
 g.fillRect(x - o, y - o, 2 + 2 * o, 2 + 2 * o);
 g.fillStyle = '#ffffff';
 g.fillRect(x, y, 2, 2);
 if (game) {
  game.whiteBallFrames = (game.whiteBallFrames || 0) + 1;
  game.glowFrames = 0;
 }
}

function ballGlow(x, y) {
 const gr = g.createRadialGradient(x, y, .5, x, y, 5);
 gr.addColorStop(0, 'rgba(255,250,200,0.75)');
 gr.addColorStop(.45, 'rgba(255,240,150,0.32)');
 gr.addColorStop(1, 'rgba(255,240,150,0)');
 g.fillStyle = gr;
 g.beginPath();
 g.arc(x, y, 5, 0, 6.2832);
 g.fill();
 if (game) game.glowFrames = (game.glowFrames || 0) + 1;
}

function looseArrow(x, y) {
 const bob = Math.round(Math.sin(menuT * 7) * 1.5), ax = Math.round(x), ay = Math.round(y) - 20 + bob;
 rect(ax - 4, ay - 1, 9, 1, '#000');
 rect(ax - 4, ay, 9, 1, '#ffe14d');
 rect(ax - 3, ay + 1, 7, 1, '#ffe14d');
 rect(ax - 2, ay + 2, 5, 1, '#ffe14d');
 rect(ax - 1, ay + 3, 3, 1, '#ffe14d');
 px(ax, ay + 4, '#ffe14d');
 px(ax - 5, ay, '#000');
 px(ax + 5, ay, '#000');
 px(ax - 4, ay + 1, '#000');
 px(ax + 4, ay + 1, '#000');
 px(ax - 3, ay + 2, '#000');
 px(ax + 3, ay + 2, '#000');
 px(ax - 2, ay + 3, '#000');
 px(ax + 2, ay + 3, '#000');
 px(ax - 1, ay + 4, '#000');
 px(ax + 1, ay + 4, '#000');
 px(ax, ay + 5, '#000');
 rect(ax, ay - 5, 1, 4, '#ffe14d');
 px(ax - 1, ay - 5, '#000');
 px(ax + 1, ay - 5, '#000');
 if (game) {
  game.arrowFrames = (game.arrowFrames || 0) + 1;
  game.lastArrow = [ ax, ay ];
 }
}

function tagCanvas(s) {
 let c = tagCache.get(s);
 if (c) return c;
 const w = textW(s, 1) + 2, h = 7, g0 = g;
 c = document.createElement('canvas');
 c.width = w;
 c.height = h;
 g = c.getContext('2d');
 try {
  for (const [dx, dy] of [ [ 0, 1 ], [ 2, 1 ], [ 1, 0 ], [ 1, 2 ], [ 0, 0 ], [ 2, 0 ], [ 0, 2 ], [ 2, 2 ] ]) drawText(s, dx, dy, 1, '#0b0b10');
  drawText(s, 1, 1, 1, '#ffffff');
 } finally {
  g = g0;
 }
 tagCache.set(s, c);
 return c;
}

const TAG_SC = .6;

function drawTopLayer() {
 const G = game;
 if (G && G.hotP && (screen === 'live' || screen === 'defense' || screen === 'cpu') && G.players.includes(G.hotP)) drawFlame(G.hotP); else if (G) G.hotP = screen === 'live' || screen === 'defense' || screen === 'cpu' ? G.hotP : null;
 if (G) drawPops();
 if (tagQ && G) {
  G.tagLog = [];
  const placed = [], car = ballCarrier();
  for (const [p, xy] of tagQ) {
   if (p !== car) continue;
   const s = tagName(p.pl);
   if (!s) continue;
   const c = tagCanvas(s), w = c.width * TAG_SC, x = Math.round(xy[0]);
   let y = Math.round(xy[1]) + 3;
   for (let k = 0; k < 3 && placed.some(r => Math.abs(r[0] - x) < (r[2] + w) / 2 && Math.abs(r[1] - y) < 4.5); k++) y += 4.5;
   placed.push([ x, y, w ]);
   g.drawImage(c, x - w / 2, y, w, c.height * TAG_SC);
   G.tagLog.push([ s, x, y, p.team || '' ]);
   {
    const num = gameNum15(p.pl);
    if (num !== '' && num != null) {
     const cn = tagCanvas(String(num)), nw = cn.width * TAG_SC;
     g.drawImage(cn, Math.round(x - w / 2 - nw - 1), y, nw, cn.height * TAG_SC);
     G.numLog15 = [ String(num), s ];
    }
   }
  }
 }
 tagQ = null;
 if (window.__rlOrder) window.__rlOrder.push('T');
 if (ballQ && G) {
  ballQ = false;
  topPass = false;
  drawBallNow();
  G.ballTopN = (G.ballTopN || 0) + 1;
  G.lastDrawOp = 'ball';
  if (window.__rlOrder) window.__rlOrder.push('B');
 }
 if (window.__rlOrder) window.__rlOrder.push('|');
 topPass = false;
}

function drawLiveWorld() {
 const G = game, c = G.carrier;
 if (c && canShoot() && !G.dodge) for (const pt of pointers.values()) {
  if (!bullArmed(pt)) continue;
  const e = now() - pt.t0;
  if (e < .08) continue;
  const f = clamp(e / BULL.press, 0, 1);
  ringPx(c.x, c.y - 6, 11, f, f >= 1 ? '#ff4a3a' : '#ffe14d');
  G.bullRing = (G.bullRing || 0) + 1;
  break;
 }
 const ctl = ballLive() ? G.ctrl : null;
 if (ctl) {
  const pr = 8 + Math.sin(G.t * 12) * 1.5;
  for (let a = 0; a < 6.28; a += .2) px(sx211(ctl) + Math.cos(a) * pr, sy211(ctl) + Math.sin(a) * pr * .5, '#2cf0ff');
  text('YOU', sx211(ctl), sy211(ctl) + 4, 1, '#2cf0ff', 'center', '#000');
  const tg = gbTarget(), vx = tg.x - ctl.x, vy = tg.y - ctl.y, L = Math.hypot(vx, vy);
  if (L > 10) for (let k = 0; k < 3; k++) {
   const d = 10 + k * 4;
   px(ctl.x + vx / L * d, ctl.y - 4 + vy / L * d, k === 2 ? '#ffffff' : '#2cf0ff');
  }
 }
 for (const p of G.players) {
  if (p.team !== 'O' || p === c || p === ctl) continue;
  if (ctl) continue;
  const open = isOpen(p);
  const col = open ? '#7dff7a' : 'rgba(255,255,255,.55)';
  for (let a = 0; a < 6.28; a += .35) px(sx211(p) + Math.cos(a) * 6, sy211(p) + Math.sin(a) * 3, col);
 }
 for (const ptx of pointers.values()) {
  if (!ptx.mate || ptx.pickCalled || ptx.moved >= TAP_PX || !G.players.includes(ptx.mate)) continue;
  const fr = clamp((now() - ptx.t0 - .12) / (CALL_PICK.press - .12), 0, 1);
  if (fr > 0) ringPx(ptx.mate.x, ptx.mate.y - 6, 11, fr, '#ffe14d');
 }
 for (const p of G.players) if (p.callPick) {
  rect(p.x - 7, p.y + 1, 14, 2, p.callPick.phase === 'set' ? '#ffe14d' : 'rgba(255,225,77,.5)');
  if (p.callPick.phase === 'run') {
   const cp = p.callPick;
   for (let k = -2; k <= 2; k++) {
    px(cp.x + k, cp.y + k, '#ffe14d');
    px(cp.x + k, cp.y - k, '#ffe14d');
   }
  }
 }
 if (c) {
  const col = G.pressure >= 2 ? '#ff3b3b' : G.pressure === 1 ? '#ffb02e' : '#ffe14d';
  for (let a = 0; a < 6.28; a += .25) px(sx211(c) + Math.cos(a) * 7, sy211(c) + Math.sin(a) * 3.5, col);
 }
 drawPlayers();
 if (c && G.uchk && G.uchk.who === c && G.uchk.n > 0) {
  rect(c.x - 10, c.y - 40, 20, 9, 'rgba(0,0,0,.7)');
  text(G.uchk.n + '/' + (chkRule2403() && G.uchk.need ? G.uchk.need : chkNeed181()), c.x, c.y - 38, 1, '#ffb14d', 'center');
 }
 if (c) {
  const bob = Math.round(Math.sin(G.t * 8));
  const ax = Math.round(c.x), ay = Math.round(c.y - 22 + bob);
  rect(ax - 2, ay, 5, 1, '#ffe14d');
  rect(ax - 1, ay + 1, 3, 1, '#ffe14d');
  px(ax, ay + 2, '#ffe14d');
 }
 if (c && c.pl) text(lastName(c.pl), c.x, c.y - 29, 1, '#ffe14d', 'center', '#000');
 drawBall();
 if (canShoot()) drawAim();
 for (const f of fx) {
  if (f.type === 'catch') circle(f.x, f.y, 2 + f.t * 14, 'rgba(255,255,255,' + Math.max(0, 1 - f.t * 3) + ')', .3);
  if (f.type === 'pop') for (let i = 0; i < 8; i++) {
   const a = i / 8 * 6.28;
   px(f.x + Math.cos(a) * f.t * 30, f.y + Math.sin(a) * f.t * 30, '#fff');
  }
  if (f.type === 'limp') {
   const k = f.t / (f.life || 3), q = {
    x: f.x + (f.tx - f.x) * k,
    y: f.y + (f.ty - f.y) * k,
    anim: f.t * 9
   };
   const kit = f.kit === 'u' ? game.uk : game.ok;
   q.y += Math.floor(f.t * 6) % 2;
   drawPlayer(q, kit, f.tx > f.x);
   text(f.nm || '', q.x, q.y - 24, 1, '#ffb14d', 'center', '#000');
   text('+', q.x + 6, q.y - 16, 1, '#ff4a3a', 'center');
  }
  if (f.type === 'txt' && f.bub) {
   const w = f.s.length * 4 + 4, by = Math.round(f.y - f.t * 3);
   rect(Math.round(f.x - w / 2), by - 2, w, 9, 'rgba(255,255,255,.92)');
   rect(Math.round(f.x) - 1, by + 7, 3, 2, 'rgba(255,255,255,.92)');
   text(f.s, f.x, by, 1, '#0b0f14', 'center');
  } else if (f.type === 'txt') text(f.s, f.x, f.y - f.t * 10, 1, f.col, 'center', '#000');
  if (f.type === 'tap') circle(f.x, f.y, 3 + f.t * 10, 'rgba(255,255,255,' + Math.max(0, .8 - f.t * 2.2).toFixed(2) + ')', .25);
 }
 const rr = c || ctl;
 if (rr && game.run) {
  const c = rr, r = game.run, ax = c.x + r.x * 11, ay = c.y - 4 + r.y * 8, col = '#ffe14d';
  for (let k = 0; k < 3; k++) {
   const o = k - 1;
   px(ax - r.x * Math.abs(o) * 2 + r.y * o * 2, ay - r.y * Math.abs(o) * 2 + r.x * o * 2, col);
  }
  px(ax + r.x, ay + r.y, col);
 }
}

function drawAim() {
 const G = game, c = G.carrier;
 if (!shootP) return;
 const power = shotPower(now() - shootP.t0), tg = cornerTarget(shootP.corner);
 const sx = c.x + BX, sy = c.y + BY, col = power < .4 ? '#7dff7a' : power < .75 ? '#ffe14d' : '#ff4a3a';
 const L = Math.hypot(tg.x - sx, tg.y - sy), vx = (tg.x - sx) / L, vy = (tg.y - sy) / L;
 for (let t = 4; t < L; t += 3) px(sx + vx * t, sy + vy * t, 'rgba(255,255,255,.6)');
 rect(tg.x - 1, tg.y - 1, 3, 3, col);
 const mx = c.x - 12, my = c.y - 34;
 rect(mx - 1, my - 1, 26, 6, '#000');
 rect(mx, my, 24, 4, '#333');
 rect(mx, my, Math.round(24 * power), 4, col);
 if (power >= 1 && Math.floor(G.t * 10) % 2) rect(mx, my, 24, 4, '#fff');
}

function ringPx(cx, cy, r, frac, col) {
 const n = Math.max(12, Math.round(r * 5));
 for (let i = 0; i < n * frac; i++) {
  const a = -Math.PI / 2 + i / n * 6.283;
  px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, col);
 }
}

function drawControls() {
 const G = game, ok = canShoot();
 if (ok && !s26()) {
  const cam = Math.round(camX), zx = GZ.x0 - cam, zy = GZ.y0, zw = GZ.x1 - GZ.x0, zh = GZ.y1 - GZ.y0, mx = GCX - cam;
  const a = shootP ? .18 : .08 + .06 * (Math.sin(G.t * 3) + 1) / 2;
  const col = 'rgba(255,255,255,' + a.toFixed(3) + ')';
  for (let x = 0; x < zw; x += 4) {
   px(zx + x, zy, col);
   px(zx + x, zy + zh, col);
   px(zx + x, CY, col);
  }
  for (let y = 0; y < zh; y += 4) {
   px(zx, zy + y, col);
   px(zx + zw, zy + y, col);
   px(mx, zy + y, col);
  }
  if (shootP) {
   const cn = shootP.corner, {left: left, top: top} = aimHi1812(cn);
   rect(left ? zx : mx, top ? zy : CY, left ? mx - zx : zx + zw - mx, top ? CY - zy : zy + zh - CY, 'rgba(255,225,77,.13)');
   const qx = left ? GX - 2 - cam : GCX - cam, qy = top ? CY - MOUTH - 1 : CY, qw = left ? GCX - GX + 2 : GX + 11 - GCX, qh = MOUTH + 1;
   const blink = Math.floor(G.t * 8) % 2;
   rect(qx, qy, qw, qh, blink ? 'rgba(255,225,77,.75)' : 'rgba(255,225,77,.5)');
   const kx = left ? GX - 2 - cam : GX + 10 - cam, ky = top ? CY - MOUTH - 2 : CY + MOUTH - 1;
   rect(kx, ky, 3, 3, '#ffe14d');
   const p = shotPower(now() - shootP.t0), pc = p < .4 ? '#7dff7a' : p < .75 ? '#ffe14d' : '#ff4a3a';
   ringPx(shootP.sx, shootP.sy, 9, 1, 'rgba(0,0,0,.45)');
   ringPx(shootP.sx, shootP.sy, 9, p, pc);
   ringPx(shootP.sx, shootP.sy, 10, p, pc);
   if (p >= 1 && Math.floor(G.t * 10) % 2) ringPx(shootP.sx, shootP.sy, 11, 1, '#fff');
   text(CORNER_NAMES[cn], clamp(shootP.sx, 30, W - 30), clamp(shootP.sy - 19, 20, H - 10), 1, '#fff', 'center', '#000');
  }
 }
 const fx0 = (W - PADW) / 2;
 for (const f of fx) if (f.type === 'cue') {
  const s2 = f.t < .12 ? 3 : 2;
  rect(W / 2 - f.s.length * 4 * s2 / 2 - 4, 19, f.s.length * 4 * s2 + 8, 5 * s2 + 4, 'rgba(0,0,0,.55)');
  text(f.s, W / 2, 21, s2, f.col, 'center', '#000');
 }
}

function hudName27(nm, bw) {
 nm = String(nm || '');
 const av = bw - 2 - textW('00', 2) - 2 - 17;
 if (window.__rl_no27hudfit || window.__rl_no27 || textW(nm) <= av) return nm;
 let s = nm.replace(/^(PAST SEASON|SEASON|WORLD)\s+/, '');
 while (s.length > 1 && textW(s) > av) s = s.slice(0, -1).trimEnd();
 return s;
}

function drawHUD() {
 const G = game, u = T(G.user), o = T(G.opp);
 rect(0, 0, W, 17, '#0b0f14');
 const bw = 92;
 rect(1, 1, bw, 15, G.uk.jersey);
 badge(u, 2, 1, 1);
 text(hudName27(u.name, bw), 17, 3, 1, textOn(G.uk.jersey));
 text(G.userHome ? 'HOME' : 'AWAY', 17, 10, 1, textOn(G.uk.jersey) === '#ffffff' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.5)');
 text(G.score[0], bw - 2, 3, 2, textOn(G.uk.jersey), 'right');
 rect(W - 1 - bw, 1, bw, 15, G.ok.jersey);
 badge(o, W - 15, 1, 1);
 text(hudName27(o.name, bw), W - 17, 3, 1, textOn(G.ok.jersey), 'right');
 text(G.userHome ? 'AWAY' : 'HOME', W - 17, 10, 1, textOn(G.ok.jersey) === '#ffffff' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.5)', 'right');
 text(G.score[1], W - bw + 2, 3, 2, textOn(G.ok.jersey));
 const cx = W / 2;
 text(G.brave ? 'BRAVEHEART' : perLabel(G) + ' ' + (G.ot ? 'SUDDEN' : fmtClock(G.clock)), cx, 3, 1, G.brave || G.otq ? '#ff8a5a' : '#ffd23a', 'center');
 if (screen !== 'live' && screen !== 'cpu' && screen !== 'defense' && !(screen === 'banner' && G.carrier !== undefined)) text(DIFF_NAMES[G.diff != null ? G.diff : 1] + (G.twoPt ? ' - 2PT' : ''), cx, 10, 1, '#ff9a4a', 'center'); else if (!G.tutorial) text(DIFF_NAMES[G.diff != null ? G.diff : 1], bw + 4, 18, 1, '#ff9a4a', 'left', '#000');
 if (screen === 'live' || screen === 'cpu' || screen === 'defense' || screen === 'banner' && G.carrier !== undefined) {
  const sc = Math.ceil(Math.max(0, G.shotClock));
  text('SHOT :' + String(sc).padStart(2, '0'), cx, 10, 1, sc <= 5 && Math.floor(G.t * 4) % 2 ? '#ff4040' : '#8fe3f0', 'center');
  drawRuleCounts();
 }
 for (const B of [ G.injBanner, G.ejBanner ]) {
  if (!B) continue;
  const y0 = B === G.injBanner ? 34 : 56, a = Math.min(1, B.t * 5, (3.2 - B.t) * 3), w = Math.max(textW(B.sub) + 16, 120);
  g.globalAlpha = clamp(a, 0, 1);
  rect(cx - w / 2, y0, w, 20, 'rgba(0,0,0,.82)');
  rect(cx - w / 2, y0, w, 2, B.txt === 'EJECTED' ? '#ff4a3a' : '#ffb14d');
  text(B.txt, cx, y0 + 4, 1, B.txt === 'EJECTED' ? '#ff4a3a' : '#ffb14d', 'center');
  text(B.sub, cx, y0 + 12, 1, '#ffffff', 'center');
  g.globalAlpha = 1;
 }
 drawTimeoutBtn(bw);
 {
  const sy = sa2403Dy(H - 10, 10);
  if (screen !== 'final' && GAME_SCREENS.includes(screen)) hit('PAUSE', cx - 9, H - 10 - sy, 18, 10, () => {
   paused = true;
  });
  rect(cx - 7, H - 8 - sy, 14, 8, 'rgba(0,0,0,.55)');
  rect(cx - 3, H - 7 - sy, 2, 6, '#fff');
  rect(cx + 1, H - 7 - sy, 2, 6, '#fff');
 }
}

function drawTimeoutBtn(bw) {
 const G = game;
 if (!G || G.tutorial || screen === 'final' || screen === 'pregame') return;
 for (let i = 0; i < 2; i++) {
  rect(bw - 12 + i * 6, 18, 4, 3, i < G.tos[0] ? '#ffd23a' : 'rgba(255,255,255,.18)');
  rect(W - bw + 3 + i * 6, 18, 4, 3, i < G.tos[1] ? '#ffd23a' : 'rgba(255,255,255,.18)');
 }
 const on = canTimeout(), x = bw + 4, y = 2, w = 42, h = 13;
 if (GAME_SCREENS.includes(screen)) hit('TIMEOUT', x, y, w, h, () => callTimeout(), 'TIMEOUT');
 rect(x, y + 1, w, h - 1, '#000');
 rect(x, y, w, h - 1, on ? '#ffd23a' : 'rgba(40,50,60,.9)');
 text('TIMEOUT', x + w / 2, y + 3, 1, on ? '#0b1a20' : G.tos[0] > 0 ? '#9ab' : '#5a6670', 'center');
}

function perLabel(G) {
 return G.brave ? 'BRAVEHEART' : G.otq ? G.otq === 1 ? 'OT' : '2OT' : G.ot ? 'OT' : ((G.periods || 4) === 2 ? 'H' : 'Q') + G.q;
}

function otLen173(G) {
 return (G.periods || 4) === 2 ? Math.round((G.qlen || QLEN) / 2) : G.qlen || QLEN;
}

function otTag173(G) {
 return G.brave ? ' / BRAVEHEART' : G.otq === 2 ? ' / 2OT' : G.otq ? ' / OT' : G.ot ? ' / OT' : '';
}

function fmtClock(s) {
 s = Math.max(0, Math.ceil(s));
 return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function foDraw131(F, B) {
 const G = game, cx = Math.round(camX), mid = W / 2, blink = Math.floor(menuT * 4) % 2;
 const ring = (p, col) => {
  for (let a = 0; a < 6.28; a += .35) px(p.x - cx + Math.cos(a) * 7, p.y + Math.sin(a) * 3.5, col);
 };
 if (F.phase === 'form') {
  for (const y of [ FT + 10, FB - 10 ]) {
   rect(FO131.wingL - 4 - cx, y, FO131.wingR - FO131.wingL + 8, 1, 'rgba(255,225,77,.85)');
   rect(FO131.wingL - 4 - cx, y - 1, 1, 3, '#ffe14d');
   rect(FO131.wingR + 4 - cx, y - 1, 1, 3, '#ffe14d');
  }
  for (let y = FT; y < FB; y += 4) {
   rect(RL_R - cx, y, 1, 2, '#ffe14d');
   rect(RL_L - cx, y, 1, 2, '#ffe14d');
  }
  for (const p of foWings().concat(foAtk())) ring(p, blink ? '#7dff7a' : 'rgba(125,255,122,.5)');
  const by = 56, rd18 = tutFoHold18();
  if (!rd18) {
   rect(mid - 92, by, 184, 24, 'rgba(0,0,0,.62)');
   text(G.brave ? 'BRAVEHEART' : 'FACEOFF', mid, by + 3, 2, '#ffe14d', 'center', '#000');
   const tfl = G.tutorial && !G.tutorial.complete && (G.tutorial.step === TUT_FO_STEP || G.tutorial.step === TF181) ? G.tutorial.f : null, tfo = tfl && G.tutorial.step === TUT_FO_STEP;
   if (tfl) text((tfl.foAtkMv ? 'ATTACK: SET' : 'DRAG AN ATTACKMAN') + '  ' + (tfl.foWingMv ? 'WING: SET' : 'DRAG A WING') + (tfl.foAtkMv && tfl.foWingMv ? tfo ? '  > TAP DOWN' : '  > NICE!' : ''), mid, by + 15, 1, tfl.foAtkMv && tfl.foWingMv ? '#7dff7a' : '#ffffff', 'center'); else text(G.brave ? 'BRAVEHEART: 1 ON 1 - TAP DOWN' : 'DRAG YOUR WINGS + ATTACK, THEN TAP DOWN', mid, by + 15, 1, '#ffffff', 'center');
   const left = Math.max(0, FO131.autoDown - (F.formIdle || 0));
   if (!(G.tutorial && !G.tutorial.complete)) rect(mid - 92, by + 23, Math.round(184 * left / FO131.autoDown), 1, '#2cc4dc');
  }
  const D = FO_DOWN_BTN();
  disc(D.x, D.y + 2, D.r, '#000');
  disc(D.x, D.y, D.r, tutFoSetupLeft() ? '#6a6a52' : '#ffd23a');
  circle(D.x, D.y, D.r, '#ffffff', .04);
  text('DOWN', D.x, D.y - 4, 2, '#0b1a20', 'center');
  text('TAP', D.x, D.y + D.r + 4, 1, '#fff', 'center', '#000');
  return;
 }
 const hw = foHeldWing(), tw = F.target && G.players.includes(F.target) ? F.target : null;
 if (tw && (F.phase !== 'scrum' || F.popTo === tw)) {
  ring(tw, '#ffe14d');
  ringPx(tw.x - cx, tw.y - 9, 10, 1, '#ffe14d');
  const up = tw.y < CY, bx = tw.x - cx, bo = blink ? 1 : 0;
  if (!up) {
   const ay = tw.y - 34 + bo;
   rect(bx - 1, ay, 3, 4, '#ffe14d');
   rect(bx - 3, ay + 4, 7, 1, '#ffe14d');
   rect(bx - 2, ay + 5, 5, 1, '#ffe14d');
   rect(bx - 1, ay + 6, 3, 1, '#ffe14d');
   px(bx, ay + 7, '#ffe14d');
   if (F.phase !== 'scrum') text('HIS BALL', bx, ay - 7, 1, '#ffe14d', 'center', '#000');
  } else {
   const ay = tw.y + 4 - bo;
   px(bx, ay, '#ffe14d');
   rect(bx - 1, ay + 1, 3, 1, '#ffe14d');
   rect(bx - 2, ay + 2, 5, 1, '#ffe14d');
   rect(bx - 3, ay + 3, 7, 1, '#ffe14d');
   rect(bx - 1, ay + 4, 3, 4, '#ffe14d');
   if (F.phase !== 'scrum') text('HIS BALL', bx, ay + 10, 1, '#ffe14d', 'center', '#000');
  }
  G.foPickDrawn = (G.foPickDrawn || 0) + 1;
 }
 if (hw && hw !== tw && F.phase !== 'scrum') {
  ring(hw, '#ffffff');
  ringPx(hw.x - cx, hw.y - 9, 10, clamp((F.hold && F.hold.held || 0) / FO1401.hold, 0, 1), '#ffe14d');
 }
 if ((F.phase === 'ready' || F.phase === 'set') && !hw && !tw) text('HOLD A WING = PICK WHO GETS IT', mid, 112, 1, 'rgba(255,255,255,.85)', 'center', '#000');
 if (F.phase === 'go' && tw) text('TAP OR PUSH = CLAMP', mid, 112, 1, '#ffe14d', 'center', '#000');
}

function drawFaceoffUI() {
 const G = game, F = G.fo, B = FO_BTN();
 const mid = W / 2;
 if (F.v131 && !(s231on() && game.tutorial && tutFoHold18())) foDraw131(F, B);
 if (F.phase === 'form') return;
 if (F.phase === 'ready') {
  const left = (F.readyDur - F.t) / (F.readyDur / 3), n = clamp(Math.ceil(left), 1, 3), fr = left - Math.floor(left);
  if (F.v131) {
   rect(mid - 46, 52, 92, 30, 'rgba(0,0,0,.6)');
   text('GET READY', mid, 55, 1, '#ffffff', 'center');
   text(String(n), mid, fr > .8 ? 62 : 63, fr > .8 ? 3 : 2, '#8fe3f0', 'center', '#000');
  } else {
   rect(mid - 70, 22, 140, 62, 'rgba(0,0,0,.6)');
   text('FACEOFF', mid, 26, 3, '#ffe14d', 'center', '#000');
   text('GET READY', mid, 45, 1, '#ffffff', 'center');
   text(String(n), mid, fr > .8 ? 54 : 56, fr > .8 ? 5 : 4, '#8fe3f0', 'center', '#000');
  }
  disc(B.x, B.y + 2, B.r, '#000');
  disc(B.x, B.y, B.r, '#3d5a60');
  circle(B.x, B.y, B.r, 'rgba(255,255,255,.4)', .04);
  text('TAP!', B.x, B.y - 4, 2, '#9fb3b8', 'center');
  text('THUMB HERE', B.x, B.y + B.r + 4, 1, '#fff', 'center', '#000');
  return;
 }
 if (F.phase === 'set' || F.phase === 'go') {
  const max = 11;
  const you = clamp(F.taps / (F.setDur * max), 0, 1), cpu = clamp(F.cpuRate * Math.min(F.t, F.setDur) / (F.setDur * max), 0, 1);
  const my = F.v131 ? 52 : 22;
  rect(mid - 62, my, 124, 18, 'rgba(0,0,0,.65)');
  text('YOU', mid - 58, my + 3, 1, '#8fe3f0');
  rect(mid - 42, my + 3, 100, 4, '#333');
  rect(mid - 42, my + 3, Math.round(100 * you), 4, '#2cc4dc');
  text('CPU', mid - 58, my + 10, 1, '#ff9a8a');
  rect(mid - 42, my + 10, 100, 4, '#333');
  rect(mid - 42, my + 10, Math.round(100 * cpu), 4, '#ff5a4a');
  const sy = F.v131 ? 71 : 52, ss = F.v131 ? 2 : 3;
  if (F.phase === 'set') text('SET...', mid, sy, ss, '#ffffff', 'center', '#000'); else text('GO! PUSH!', mid, sy, ss, Math.floor(F.t * 10) % 2 ? '#ffe14d' : '#ffffff', 'center', '#000');
  const r = B.r + Math.round((F.bump || 0) * 3);
  let kx = B.x, ky = B.y;
  if (stick && F.phase === 'go') {
   const dx = stick.x - stick.sx, dy = stick.y - stick.sy, d = Math.hypot(dx, dy), m = Math.min(d, 14);
   if (d > 0) {
    kx += dx / d * m;
    ky += dy / d * m;
   }
  }
  disc(B.x, B.y + 2, r, '#000');
  disc(kx, ky, r, F.phase === 'set' ? '#2cc4dc' : '#ffd23a');
  circle(kx, ky, r, '#ffffff', .04);
  text(F.phase === 'set' ? 'TAP!' : 'PUSH', kx, ky - 4, 2, '#0b1a20', 'center');
  text(F.phase === 'set' ? 'MASH FAST' : 'ANY DIRECTION', B.x, B.y + r + 4, 1, '#fff', 'center', '#000');
 }
}

function card(x, y, w, h) {
 rect(x, y + 2, w, h, '#000');
 rect(x, y, w, h, 'rgba(10,16,24,.92)');
 rect(x, y, w, 1, '#2cc4dc');
}

function drawBanner() {
 const G = game, bn = G.banner, t = G.bannerT, k = bn.kind;
 const col = k === 'goal' || k === 'fowin' ? '#ffe14d' : k === 'keep' || k === 'ours' || k === 'rturnU' ? '#7dff7a' : '#ff5a4a';
 const y = 70, s = Math.min(1, t * 6);
 rect(0, y - 6, W, 36, 'rgba(0,0,0,' + .7 * s + ')');
 const sc = bn.txt.length > 9 ? 3 : 4, o = Math.round((1 - s) * -160);
 text(bn.txt, W / 2 + o, y - (sc === 4 ? 2 : 0), sc, k === 'goal' && Math.floor(t * 8) % 2 ? '#ffffff' : col, 'center', '#000');
 if (bn.sub) text(bn.sub, W / 2 - o, y + 22, 1, '#fff', 'center');
}

function drawCpuWorld() {
 const G = game, C = G.cpu, h = C && C.holder;
 if (h && h.team === 'D') for (let a = 0; a < 6.28; a += .25) px(h.x + Math.cos(a) * 7, h.y + Math.sin(a) * 3.5, 'rgba(255,90,74,.9)');
 drawPlayers();
 drawBall();
 if (h && h.pl) text(lastName(h.pl), h.x, h.y - 24, 1, h.team === 'D' ? '#ff9a8a' : '#7dff7a', 'center', '#000');
 for (const f of fx) {
  if (f.type === 'catch') circle(f.x, f.y, 2 + f.t * 14, 'rgba(255,255,255,' + Math.max(0, 1 - f.t * 3) + ')', .3);
  if (f.type === 'pop') for (let i = 0; i < 8; i++) {
   const a = i / 8 * 6.28;
   px(f.x + Math.cos(a) * f.t * 30, f.y + Math.sin(a) * f.t * 30, '#fff');
  }
 }
}

function drawCpu() {
 const G = game, C = G.cpu, o = T(G.opp);
 const lab = o.name + ' BALL', lw = lab.length * 4 + 18;
 rect(3, 20, lw, 11, 'rgba(0,0,0,.6)');
 rect(5, 22, 7, 7, G.ok.jersey);
 rect(5, 22, 7, 1, 'rgba(255,255,255,.4)');
 text(lab, 15, 23, 1, '#ffffff');
 if (C.res) {
  const B = C.beats[C.bi], t = B.t || 0, s = Math.min(1, t * 6), y = 70;
  rect(0, y - 6, W, 36, 'rgba(0,0,0,' + .6 * s + ')');
  const sc = C.res.txt.length > 9 ? 3 : 4, off = Math.round((1 - s) * -160);
  text(C.res.txt, W / 2 + off, y - (sc === 4 ? 2 : 0), sc, C.res.txt === 'GOAL' && Math.floor(t * 8) % 2 ? '#ffffff' : C.res.col, 'center', '#000');
  text(C.res.sub, W / 2 - off, y + 22, 1, '#fff', 'center');
 }
 const bw = 40, bh = 14, bx = W - bw - 4, by = H - bh - 5;
 hit('SKIP', bx, by, bw, bh, () => skipCpu());
 rect(bx, by + 2, bw, bh, '#000');
 rect(bx, by, bw, bh, 'rgba(20,28,36,.9)');
 rect(bx, by, bw, 1, '#2cc4dc');
 text('SKIP', bx + 15, by + 5, 1, '#ffffff', 'center');
 const tx = bx + 29, ty = by + 4;
 for (let k = 0; k < 4; k++) rect(tx + k, ty + k, 1, 7 - 2 * k, '#ffe14d');
}

function drawQBreak() {
 const G = game, cx = W / 2;
 card(cx - 95, 40, 190, 96);
 const NP = G.periods || 4, title = G.brave ? 'BRAVEHEART' : G.otq ? G.otq === 1 ? 'OVERTIME' : '2ND OVERTIME' : G.ot ? 'OVERTIME' : G.q === NP / 2 + 1 ? 'HALFTIME' : 'END OF Q' + (G.q - 1);
 text(title, cx, 50, 3, '#ffe14d', 'center', '#000');
 if (G.brave) text('STILL TIED - 1 ON 1 + GOALIES - NEXT GOAL WINS', cx, 72, 1, '#fff', 'center'); else if (G.otq) text('TIED - ONE MORE FULL QUARTER (' + fmtClock(otLen173(G)) + ')', cx, 72, 1, '#fff', 'center'); else if (G.ot) text('SUDDEN VICTORY - NEXT GOAL WINS', cx, 72, 1, '#fff', 'center'); else if (G.atk15 && G.q === NP / 2 + 1) text('SIDES SWITCH - YOU ATTACK THE ' + otherEnd15(G.atk15) + ' END', cx, 72, 1, '#8fe3f0', 'center');
 scoreLine(cx, 86);
 text('TAP TO CONTINUE', cx, 122, 1, Math.floor(G.t * 2) % 2 ? '#8fe3f0' : '#4b8a95', 'center');
}

function scoreLine(cx, y) {
 const G = game, u = T(G.user), o = T(G.opp);
 badge(u, cx - 80, y - 4, 2);
 badge(o, cx + 54, y - 4, 2);
 text(G.score[0] + ' - ' + G.score[1], cx, y + 4, 3, '#fff', 'center', '#000');
}

const WALK2314 = {
 out: 1.25,
 off: .35,
 anthem: 2.3,
 on: .35,
 hold: .2
};

const RITUAL2314 = {
 NZL: {
  kind: 'haka',
  dur: 5.2,
  cap: 'NEW ZEALAND TAKES THE FIELD'
 },
 HAU: {
  kind: 'rite',
  dur: 3.2,
  cap: 'HAUDENOSAUNEE: THE ORIGINAL LACROSSE NATION'
 }
};

function ritOf2314(tid) {
 const t = WT_REG[tid];
 if (!t) return null;
 const nm = String(t.name || '').toUpperCase(), k = nm === 'NEW ZEALAND' ? 'NZL' : nm === 'HAUDENOSAUNEE' ? 'HAU' : String(t.abbr || String(tid).replace(/^W/, '')).toUpperCase();
 return RITUAL2314[k] || null;
}

function haka2318(G) {
 return !!G && on2318() && (G.mode === 'quick' || G.mode === 'online') && !G.fo && !(G.coin && G.coin.rejoin) && [ G.user, G.opp ].some(id => {
  const r = ritOf2314(id);
  return !!r && r.kind === 'haka';
 });
}

function walkOn2314(G) {
 return !!G && !no2314() && !window.__rl_v124gb && !G.tutorial && (!G.online || haka2318(G)) && (G.mode === 'season' || G.mode === 'world' || haka2318(G)) && !G.walkDone && typeof RL12 !== 'undefined' && !!RL12.FR && !!RL12.FR.f14_NG0;
}

function walkPlan2314(G) {
 const rit = [];
 if (G.mode === 'world' || haka2318(G)) for (const s of [ 1, 0 ]) {
  const r = ritOf2314(s ? G.opp : G.user);
  if (r) rit.push(Object.assign({
   side: s
  }, r));
 }
 const P = {}, W0 = WALK2314;
 let t = 0;
 P.out = [ t, t += W0.out ];
 P.off = [ t, t += W0.off ];
 P.anthem = [ t, t += W0.anthem ];
 P.rit = rit.map(r => Object.assign(r, {
  t0: t,
  t1: t += r.dur
 }));
 P.on = [ t, t += W0.on ];
 P.hold = [ t, t += W0.hold ];
 P.dur = +t.toFixed(3);
 return P;
}

function walkStart2314(G) {
 const P = walkPlan2314(G), actors = [], sp = 11;
 for (let s = 0; s < 2; s++) {
  const lu = G.lu[s], ids = [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.G ].filter(id => PP(id)).slice(0, 10), side = s === 0 ? 'u' : 'o';
  ids.forEach((id, i) => {
   const x0 = benchSlotX(side, 2) + (s === 0 ? -i * 2 : i * 2), y0 = BENCH_Y + 4;
   const x = s === 0 ? MIDX - 14 - i * sp : MIDX + 14 + i * sp, y = FB - 10, dist = Math.hypot(x - x0, y - y0);
   const a = mkActor({
    x: x0,
    y: y0,
    pl: PP(id)
   }, s, {
    bench: true,
    i: i,
    tx: x,
    ty: y,
    spd: Math.max(30, dist / Math.max(.3, WALK2314.out - .12 - i * .05)),
    hx: x,
    hy: y,
    d0: i * .05
   });
   actors.push(a);
  });
 }
 G.walk = {
  t: 0,
  P: P,
  actors: actors,
  smoke: [],
  notes: false,
  hakaN: 0,
  adv: null,
  kind: G.mode
 };
 for (const r of P.rit) if (r.kind === 'rite') {
  const cx = r.side === 0 ? MIDX - 70 : MIDX + 70, cy = CY + 18;
  G.walk.adv = {
   x: cx,
   y: cy,
   side: r.side,
   kit: r.side === 0 ? G.uk : G.ok
  };
 }
 window.__rlWalk = {
  mode: G.mode,
  dur: P.dur,
  rit: P.rit.map(r => r.kind + ':' + (r.side ? G.opp : G.user)),
  start: performance.now(),
  end: null,
  how: null,
  gt: null
 };
}

function walkTick2314(G, dt) {
 if (!G.walk) walkStart2314(G);
 const Wk = G.walk, P = Wk.P;
 Wk.t += Math.min(dt, .1);
 const t = Wk.t;
 if (!Wk.notes && t >= P.anthem[0]) {
  Wk.notes = true;
  anthem2314();
 }
 for (const a of Wk.actors) {
  if (t < a.d0) continue;
  a.helm = !(t >= P.off[0] + a.i * .02 && t < P.on[0] + .12 + a.i * .015);
  const r = P.rit.find(q => q.side === a.side && t >= q.t0 && t < q.t1);
  if (r && r.kind === 'rite' && Wk.adv) {
   const ang = a.i / 10 * Math.PI * 2;
   a.tx = Wk.adv.x + Math.cos(ang) * 16;
   a.ty = Wk.adv.y + Math.sin(ang) * 9;
   a.spd = 70;
  } else if (r && r.kind === 'haka') {
   const dir = a.side === 0 ? -1 : 1, col = Math.floor(a.i / 2), row = a.i % 2;
   a.tx = MIDX + dir * (24 + col * 15 + row * 7);
   a.ty = CY + 8 + row * 18;
   a.spd = 75;
  } else if (P.rit.some(q => q.side === a.side && t >= q.t1)) {
   a.tx = a.hx;
   a.ty = a.hy;
   a.spd = 80;
  }
  actorTick14(a, Math.min(dt, .1));
  a.face = a.side === 0 ? 1 : -1;
  if (r && r.kind === 'rite' && Wk.adv && !a.moving) a.face = a.x < Wk.adv.x ? 1 : -1;
 }
 for (const r of P.rit) {
  if (r.kind === 'haka' && t >= r.t0 + .6 && t < r.t1 - .2) {
   const n = Math.floor((t - r.t0 - .6) / .55);
   if (n >= Wk.hakaN) {
    Wk.hakaN = n + 1;
    haka2314(n);
   }
  }
 }
 Wk.smoke = Wk.smoke.filter(s => t - s.t0 < 1.4);
 if (t >= P.dur) walkEnd2314(G, 'done');
}

function walkEnd2314(G, how) {
 if (!G || G.walkDone) return;
 G.walkDone = true;
 if (window.__rlWalk) {
  window.__rlWalk.end = performance.now();
  window.__rlWalk.how = how;
  window.__rlWalk.gt = G.walk ? +G.walk.t.toFixed(3) : 0;
 }
 G.walk = null;
 if (screen === 'pregame') startFaceoff(true);
}

function anthem2314() {
 const b = .25, N = [ [ 392, .75 ], [ 330, .25 ], [ 262, 1 ], [ 330, 1 ], [ 392, 1 ], [ 523, 2 ], [ 659, .75 ], [ 587, .25 ], [ 523, 1.5 ] ];
 let w = 0;
 for (const [f, d] of N) {
  tone(f, d * b * .95, 'square', .05, w);
  tone(f / 2, d * b * .95, 'triangle', .05, w);
  w += d * b;
 }
}

function haka2314(n) {
 tone(70, .16, 'square', .12, 0, -20);
 tone(140, .08, 'sawtooth', .05);
 if (n % 2 === 1) {
  tone(420, .18, 'sawtooth', .07, .05, -230);
  tone(300, .16, 'square', .04, .06, -150);
 }
}

function drawWalk2314() {
 const G = game, Wk = G.walk;
 if (!Wk) return;
 const t = Wk.t, P = Wk.P;
 if (Wk.adv) {
  const A = Wk.adv, r = P.rit.find(q => q.kind === 'rite');
  if (r && t >= r.t0 - .2 && t < r.t1 + .1) {
   scaled12(A.x, A.y, () => coachDraw18(g, 'coach_idle0', A.x, A.y, A.kit, A.side === 0, {
    skin: 4
   }, null));
   for (const s of Wk.smoke) {
    const k = (t - s.t0) / 1.4;
    g.globalAlpha = Math.max(0, .7 * (1 - k));
    px(Math.round(s.x + Math.sin((t - s.t0) * 5 + s.x) * 2), Math.round(s.y - k * 26), '#d8d8d8');
    px(Math.round(s.x + 1 + Math.sin((t - s.t0) * 4) * 2), Math.round(s.y - 2 - k * 26), '#bdbdbd');
    g.globalAlpha = 1;
   }
  }
 }
 const haka = P.rit.find(q => q.kind === 'haka' && t >= q.t0 && t < q.t1);
 const list = Wk.actors.filter(a => t >= a.d0).slice().sort((p, q) => p.y - q.y);
 for (const a of list) {
  if (haka && a.side === haka.side && !a.moving) {
   const ph = Math.floor((t - haka.t0) / .275 + a.i * 0), down = ph % 2 === 0;
   a.punchT = down ? t : -9;
   const y0 = a.y;
   a.y = y0 + (down ? 1 : 0);
   drawActor14(a, t);
   a.y = y0;
   if (down) {
    px(Math.round(a.x - 3), Math.round(a.y + 1), '#c9b38a');
    px(Math.round(a.x + 3), Math.round(a.y + 1), '#c9b38a');
   }
  } else drawActor14(a, t);
 }
}

function drawWalkUI2314() {
 const G = game, Wk = G.walk;
 if (!Wk) return;
 const t = Wk.t, P = Wk.P, cx = W / 2;
 const r = P.rit.find(q => t >= q.t0 && t < q.t1);
 const cap = t < P.off[0] ? 'TEAMS TAKE THE FIELD' : t < P.anthem[1] ? G.mode === 'world' || haka2318(G) ? 'HELMETS OFF - NATIONAL ANTHEMS' : 'HELMETS OFF - NATIONAL ANTHEM' : r ? r.cap : t < P.hold[0] ? 'HELMETS ON' : "LET'S GO";
 rect(0, 0, W, 16, 'rgba(0,0,0,.55)');
 text(cap, cx, 5, 1, '#ffe14d', 'center', '#000');
 if (t >= P.anthem[0] && t < P.anthem[1]) {
  const k = Math.floor(t * 4) % 3;
  text([ '~', '~ ~', '~ ~ ~' ][k], cx, 20, 1, '#cfe', 'center');
 }
 const sx = W - 46, sy = 2;
 hit('WALK SKIP', sx, sy, 42, 12, () => walkEnd2314(G, 'skip'), 'WALK SKIP');
 rect(sx, sy, 42, 12, 'rgba(0,0,0,.6)');
 text('SKIP >', sx + 21, sy + 4, 1, '#ffffff', 'center');
 text('TAP TO SKIP', cx, H - 9, 1, Math.floor(t * 2) % 2 ? '#8fa6b0' : '#5a6670', 'center');
}

function drawPregame() {
 const G = game, cx = W / 2, u = T(G.user), o = T(G.opp);
 const home = G.userHome ? u : o, away = G.userHome ? o : u;
 const src = G.mode === 'season' ? 'season' : G.mode === 'world' ? 'world' : 'real', live = !G.online && !G.tutorial && !(G.coin && G.coin.phase !== 'done');
 const rosterFn = j => openVsRoster([ [ G.user, src ], [ G.opp, src ] ], 'pregame', j);
 drawVsScreen({
  live: live,
  L: {
   tid: G.user,
   src: src,
   label: (G.userHome ? 'HOME' : 'AWAY') + ' - YOU',
   you: true
  },
  R: {
   tid: G.opp,
   src: src,
   label: (G.userHome ? 'AWAY' : 'HOME') + (G.online ? ' - OPPONENT' : ' - CPU')
  },
  mid: G.userHome ? 'VS' : 'AT',
  roster: live ? rosterFn : null,
  headY: 29,
  midY: 50,
  feetY: 128
 });
 text('GET READY', cx, 2, 2, '#ffe14d', 'center', '#000');
 text((G.mode === 'season' || G.mode === 'world') && G.meta ? G.meta.label : 'QUICK GAME', cx, 13, 1, '#ffd23a', 'center');
 text('LEVEL: ' + DIFF_NAMES[G.diff != null ? G.diff : 1] + '  -  ' + ((G.periods || 4) === 2 ? '2 HALVES' : '4 QUARTERS') + ' x ' + fmtClock(G.qlen || QLEN) + (G.twoPt ? '  -  2PT ON' : ''), cx, 20, 1, '#ff9a4a', 'center');
 text(away.name + ' AT ' + home.name + (G.night ? '  -  NIGHT GAME' : '  -  DAY GAME'), cx, 116, 1, '#cfe', 'center');
 const ready = G.preT > .6, blink = Math.floor(G.t * 2) % 2 ? '#ffe14d' : '#8a7a2a';
 if (live) {
  const bw1 = 84, bw2 = 84, by = H - 22 - sa2403Dy(H - 22, 20), x1 = Math.round(cx - bw1 - 3), x2 = Math.round(cx + 3);
  button('ROSTER & STATS', x1, by, bw1, 18, () => rosterFn(0), {
   bg: '#8fe3f0'
  });
  button('START', x2, by, bw2, 18, () => {
   if (G.preT > .6) G.preT = 99;
  }, {
   sc: 2,
   bg: ready ? '#7dff7a' : '#5a6670'
  });
  text(ready ? 'TAP START (OR ANYWHERE) TO FACE OFF' : 'GET READY...', cx, by - 9, 1, blink, 'center');
 } else text(ready ? 'TAP TO START THE FACEOFF' : 'GET READY...', cx, H - 14, 1, blink, 'center');
}

function drawFinal() {
 const G = game, cx = W / 2, win = G.score[0] > G.score[1];
 rect(0, 0, W, H, 'rgba(0,0,0,.55)');
 card(cx - 120, 14, 240, 156);
 text('FINAL' + otTag173(G) + '  -  ' + DIFF_NAMES[G.diff != null ? G.diff : 1], cx, 20, 1, '#9aa', 'center');
 text(win ? 'YOU WIN!' : 'TOUGH LOSS', cx, 30, 4, win ? '#ffe14d' : '#ff5a4a', 'center', '#000');
 scoreLine(cx, 64);
 const s = G.stats;
 text('SHOTS ' + s.shots + '   GOALS ' + s.goals + '   FACEOFFS ' + s.fow + '/' + s.fot, cx, 98, 1, '#cfe', 'center');
 if (G.mode === 'quick') {
  text('QUICK GAME RECORD ' + record.w + '-' + record.l, cx, 108, 1, '#8fe3f0', 'center');
  button('PLAY AGAIN', cx - 110, 122, 104, 18, () => newGame(G.user, G.opp, 'quick', G.userHome), {
   sc: 1
  });
  button('MENU', cx + 6, 122, 104, 18, () => {
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
 } else if (G.mode === 'world') {
  const w = wgame, row = w && w.table[w.team];
  if (w) text('WORLD GAMES ' + (row ? row.w + '-' + row.l : '') + '  -  ' + wgStatus16(w), cx, 108, 1, '#8fe3f0', 'center');
  button('WORLD GAMES', cx - 110, 122, 104, 18, () => {
   screen = w && w.phase === 'done' ? 'wgChamp' : 'wgHub';
  }, {
   sc: 1,
   bg: '#7dff7a'
  });
  button('MENU', cx + 6, 122, 104, 18, () => {
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
 } else {
  const S = season, row = S && S.table[S.team];
  if (row) text('SEASON RECORD ' + row.w + '-' + row.l, cx, 108, 1, '#8fe3f0', 'center');
  if (S && S.phase === 'done' && S.champ === S.team) text('CHAMPIONS!', cx, 112, 1, '#ffe14d', 'center');
  button('SEASON', cx - 110, 122, 104, 18, () => {
   screen = 'season';
  }, {
   sc: 1,
   bg: '#ffd23a'
  });
  button('MENU', cx + 6, 122, 104, 18, () => {
   screen = 'menu';
  }, {
   bg: '#c9d6d9'
  });
 }
 if (win) for (let i = 0; i < 40; i++) {
  const x = (i * 37 + G.finalT * 40 * (1 + i % 3)) % W, y = (i * 23 + G.finalT * 60 * (1 + i % 2)) % H;
  rect(x, y, 2, 2, [ '#2cc4dc', '#ffe14d', '#ff5a4a', '#ffffff' ][i % 4]);
 }
}

let pauseSet = false;

function drawSettings(inGame) {
 const S = SETTINGS, G = game;
 if (inGame) rect(0, 0, W, H, 'rgba(0,0,0,.86)'); else bgStripes(true);
 text('SETTINGS', W / 2, 5, 2, '#2cc4dc', 'center', '#000');
 const x0 = 8, gw = W - 16;
 const row = (labels, y, h, sel, fn, cols, pad) => {
  const n = labels.length, gap = 3, w = Math.floor((gw - gap * (n - 1)) / n);
  labels.forEach((lb, i) => button(lb, x0 + i * (w + gap), y, i === n - 1 ? gw - (n - 1) * (w + gap) : w, h, () => {
   fn(i);
   settingsSave();
   SFX.tap && SFX.tap();
  }, {
   bg: sel === i ? cols ? cols[i] : '#ffd23a' : '#3a4a55',
   fg: sel === i ? '#0b1a20' : '#cfe',
   pad333: pad
  }));
 };
 text('DIFFICULTY', x0, 20, 1, '#ffe14d');
 text('EASY', x0 + 48, 20, 1, '#7dff7a');
 text('HARD', W - 8, 20, 1, '#ff5a4a', 'right');
 row(DIFF_NAMES, 28, 16, S.diff, i => {
  S.diff = i;
  if (G && inGame) {
   G.diff = i;
  }
  applyDiff();
 }, [ '#7dff7a', '#8fe3f0', '#ffd23a', '#ffb14d', '#ff8a5a', '#ff5a4a' ], true);
 text(diffInfo2403(S.diff), W / 2, 48, 1, '#ffffff', 'center');
 text('QUARTER LENGTH (GAME CLOCK)', x0, 60, 1, '#ffe14d');
 row(QLEN_OPTS.map(fmtClock), 68, 14, QLEN_OPTS.indexOf(S.qlen), i => {
  S.qlen = QLEN_OPTS[i];
 });
 const hw = Math.floor((gw - 8) / 2), lay333 = !!window.V17 && !window.__rl_v124gb && !window.__rl_no333set;
 text('PERIODS', x0, 90, 1, '#ffe14d');
 if (!lay333) text(__x("Mi1QT0lOVEVSUyAoUExMIEFSQyk="), x0 + hw + 8, 90, 1, '#ffe14d');
 {
  const w = Math.floor(((lay333 ? gw : hw) - 3) / 2), pw = lay333 ? gw : hw;
  button('4 QUARTERS', x0, 98, w, 14, () => {
   S.halves = false;
   settingsSave();
  }, {
   bg: !S.halves ? '#ffd23a' : '#3a4a55',
   fg: !S.halves ? '#0b1a20' : '#cfe'
  });
  button('2 HALVES', x0 + w + 3, 98, pw - w - 3, 14, () => {
   S.halves = true;
   settingsSave();
  }, {
   bg: S.halves ? '#ffd23a' : '#3a4a55',
   fg: S.halves ? '#0b1a20' : '#cfe'
  });
  if (!lay333) {
   const bx = x0 + hw + 8;
   button('2PT OFF', bx, 98, w, 14, () => {
    S.twoPt = false;
    settingsSave();
    if (G && inGame) G.twoPt = false;
   }, {
    bg: !S.twoPt ? '#ffd23a' : '#3a4a55',
    fg: !S.twoPt ? '#0b1a20' : '#cfe'
   });
   button('2PT ON', bx + w + 3, 98, gw - hw - 8 - w - 3, 14, () => {
    S.twoPt = true;
    settingsSave();
    if (G && inGame) G.twoPt = true;
   }, {
    bg: S.twoPt ? '#ffd23a' : '#3a4a55',
    fg: S.twoPt ? '#0b1a20' : '#cfe'
   });
  }
 }
 text(S.halves ? '2 HALVES OF ' + fmtClock(S.qlen * 2) + ' - 2 TIMEOUTS A HALF' : '4 QUARTERS OF ' + fmtClock(S.qlen) + ' - 2 TIMEOUTS A HALF', x0, 117, 1, '#8fe3f0');
 if (!lay333) text(S.twoPt ? 'GOALS FROM OUTSIDE THE DOTTED ARC = 2' : 'EVERY GOAL = 1', x0 + hw + 8, 117, 1, '#8fe3f0');
 text(inGame ? lay333 ? 'LEVEL CHANGES NOW. CLOCK + PERIODS START NEXT GAME.' : 'LEVEL + 2PT CHANGE NOW. CLOCK + PERIODS START NEXT GAME.' : 'SAVED. APPLIES TO QUICK GAMES AND SEASON GAMES.', W / 2, 129, 1, '#cfe', 'center');
 {
  const on1 = SET171.autoSw, on2 = SET171.chirps;
  const tx = Math.round(W / 2 + 54), tw = W - 8 - tx;
  const th = window.V17 ? 9 : 11, ts = window.V17 ? 11 : 13, ty = window.V17 ? 136 : 137;
  const ty3 = lay333 ? ty + ts : ty;
  button('AUTO SWITCH DEFENDER: ' + (on1 ? 'ON' : 'OFF'), tx, ty3, tw, th, () => {
   SET171.autoSw = !on1;
   set171Save();
   SFX.tap && SFX.tap();
  }, {
   bg: on1 ? '#7dff7a' : '#3a4a55',
   fg: on1 ? '#0b1a20' : '#cfe'
  });
  button('CHIRPS: ' + (on2 ? 'ON' : 'OFF'), tx, ty3 + ts, tw, th, () => {
   SET171.chirps = !on2;
   set171Save();
   SFX.tap && SFX.tap();
  }, {
   bg: on2 ? '#7dff7a' : '#3a4a55',
   fg: on2 ? '#0b1a20' : '#cfe'
  });
  if (window.V17) {
   const on3 = V17.itemFx();
   if (!lay333) button('ITEM EFFECTS: ' + (on3 ? 'ON' : 'OFF'), tx, ty + 2 * ts, tw, th, () => {
    V17.itemFx(!on3);
    SFX.tap && SFX.tap();
   }, {
    bg: on3 ? '#7dff7a' : '#3a4a55',
    fg: on3 ? '#0b1a20' : '#cfe'
   });
   const on4 = V17.autoChirp(), on5 = V17.autoCelly(), hw2 = Math.floor((tw - 3) / 2);
   const fit20 = (a, b, w) => [ a + ': ' + b, a + ' ' + b, a.replace(' ', '') + ' ' + b ].find(s => textW(s) + 6 <= w) || a.replace('AUTO ', '') + ' ' + b;
   button(fit20('AUTO CHIRP', on4 ? 'ON' : 'OFF', hw2), tx, ty + 3 * ts, hw2, th, () => {
    V17.autoChirp(!on4);
    SFX.tap && SFX.tap();
   }, {
    bg: on4 ? '#7dff7a' : '#3a4a55',
    fg: on4 ? '#0b1a20' : '#cfe'
   });
   button(fit20('AUTO CELLY', on5 ? 'ON' : 'OFF', tw - hw2 - 3), tx + hw2 + 3, ty + 3 * ts, tw - hw2 - 3, th, () => {
    V17.autoCelly(!on5);
    SFX.tap && SFX.tap();
   }, {
    bg: on5 ? '#7dff7a' : '#3a4a55',
    fg: on5 ? '#0b1a20' : '#cfe'
   });
  }
 }
 if (window.V20) try {
  V20.drawSettings(inGame);
 } catch (e) {
  console.error(e);
 }
 if (!inGame && window.CP2319 && CP2319.on() && (window.__rl_v124gb || window.__rl_no332set)) {
  const C = CP2319, q = C.quick(), d = C.draft(), x1 = 8, xr = Math.round(W / 2 + 50), hw3 = Math.floor((xr - x1 - 3) / 2), y = H - 10, h = 9;
  const fit = (opts, w) => opts.find(s => textW(s) + 6 <= w) || opts[opts.length - 1];
  button(fit([ 'CARD PLAYERS IN QUICK/ONLINE GAMES: ' + (q ? 'ON' : 'OFF'), 'CARD PLAYERS QUICK/ONLINE: ' + (q ? 'ON' : 'OFF'), 'CARDS QUICK/ONLINE: ' + (q ? 'ON' : 'OFF'), 'CARDS QUICK+ONL ' + (q ? 'ON' : 'OFF') ], hw3), x1, y, hw3, h, () => {
   C.quick(!q);
   SFX.tap && SFX.tap();
  }, {
   bg: q ? '#7dff7a' : '#3a4a55',
   fg: q ? '#0b1a20' : '#cfe'
  });
  button(fit([ 'CARD PLAYERS IN DRAFTS: ' + (d ? 'ON' : 'OFF'), 'CARDS IN DRAFTS: ' + (d ? 'ON' : 'OFF'), 'CARDS DRAFTS ' + (d ? 'ON' : 'OFF') ], xr - x1 - hw3 - 3), x1 + hw3 + 3, y, xr - x1 - hw3 - 3, h, () => {
   C.draft(!d);
   SFX.tap && SFX.tap();
  }, {
   bg: d ? '#7dff7a' : '#3a4a55',
   fg: d ? '#0b1a20' : '#cfe'
  });
 }
 const lay332 = !inGame && window.V17 && !window.__rl_v124gb && !window.__rl_no332set;
 button(inGame ? 'BACK TO PAUSE' : 'DONE', W / 2 - 50, lay332 ? 147 : H - 30, 100, lay332 ? 31 : 18, () => {
  if (inGame) pauseSet = false; else screen = 'menu';
 }, {
  sc: 1,
  bg: '#7dff7a'
 });
}

function drawPause() {
 if (pauseSet) return sa2403Band(() => drawSettings(true));
 rect(0, 0, W, H, 'rgba(0,0,0,.7)');
 const cx = W / 2;
 text('PAUSED', cx, 40, 4, '#fff', 'center', '#000');
 button('RESUME', cx - 60, 80, 120, 20, () => {
  paused = false;
  pauseSet = false;
 }, {
  sc: 2
 });
 button('QUIT TO MENU', cx - 60, 110, 120, 16, () => {
  paused = false;
  pauseSet = false;
  screen = 'menu';
  game = null;
 }, {
  bg: '#ff8a7a'
 });
 button('SETTINGS', cx - 60, 150, 120, 14, () => {
  pauseSet = true;
 }, {
  bg: '#ffd23a'
 });
 button(muted ? 'SOUND: OFF' : 'SOUND: ON', cx - 60, 132, 120, 14, () => {
  muted = !muted;
  LS.set('muted', muted);
  if (!muted) {
   audioInit();
   SFX.tap();
  }
 }, {
  bg: muted ? '#5a6670' : '#7dff7a'
 });
 drawMuteBtn();
}

function bgStripes(dark) {
 for (let x = 0; x < W; x += 20) rect(x, 0, 20, H, (x / 20 | 0) % 2 ? '#1b3a26' : '#1f4329');
 if (dark) rect(0, 0, W, H, 'rgba(0,0,0,.4)');
}

let menuT = 0;

const LOBBY_LOCKED = [ [ 'A', 'ATTACK' ], [ 'A', 'ATTACK' ], [ 'A', 'ATTACK' ], [ 'M', 'MIDFIELD' ], [ 'M', 'MIDFIELD' ], [ 'M', 'MIDFIELD' ], [ 'FO', 'FACEOFF' ], [ 'LSM', 'LONG-STICK MID' ], [ 'D', 'DEFENSE' ], [ 'D', 'DEFENSE' ], [ 'D', 'DEFENSE' ], [ 'G', 'GOALIE' ] ];

const LOBBY_GRAY = {
 jersey: '#7d848b',
 trim: '#4f555b',
 helm: '#7d848b'
};

const lobby = {
 idx: 0,
 pid: null,
 dir: 0,
 at: -9,
 card: null,
 swipe: null,
 swallow: 0,
 hero: null,
 key: ''
};

const LOBBY_POS_ORDER = {
 A: 0,
 M: 1,
 FO: 2,
 LSM: 3,
 D: 4,
 G: 5
};

let HOME172 = LS.get('home172', 'season');

function wgTeam172() {
 return typeof wgame !== 'undefined' && wgame && wgame.team && T(wgame.team) ? wgame.team : null;
}

function homeWorld() {
 return HOME172 === 'world' && !!wgTeam172();
}

function setHome172(v) {
 HOME172 = v;
 LS.set('home172', v);
 lobby.card = null;
 if (window.V17 && V17.trayClose) V17.trayClose();
}

let GEAR17 = null;

function lobbySrc() {
 if (screen === 'card28') return 'real';
 if (screen === 'gear17' && GEAR17) return GEAR17.src;
 return homeWorld() || homeQuick16() && !qsz286() ? 'real' : 'season';
}

function qt26(id) {
 try {
  if (window.__rl_noqt26 || window.__rl_v124gb || !id) return;
  const s = SZ_REG[id];
  if (s) {
   if (!s.col26) {
    qsz286set(s);
    return;
   }
   id = s.szBase;
  }
  if (TEAMS.some(x => x.id === id) || WT_REG[id] || GH_REG[id]) {
   if (LS.get('qplay26', null) == null) LS.set('qplay26', LS.get('qteam16', '') || '');
   LS.set('qteam16', id);
  }
 } catch (e) {
  console.error(e);
 }
}

function qPlay26() {
 if (window.__rl_noqt26 || window.__rl_v124gb) return null;
 const t = LS.get('qplay26', null);
 if (t == null) return null;
 return t && (TEAMS.some(x => x.id === t) || WT_REG[t] || GH_REG[t]) ? t : '';
}

function no286q() {
 return !!(window.__rl_no286qteam || window.__rl_noqt26 || window.__rl_v124gb);
}

function qsz286set(s) {
 try {
  if (no286q() || !s || !s.sz || s.col26) return;
  if (s.mine && s.id === LS.get('szid', '')) {
   if (LS.get('qplay26', null) == null) LS.set('qplay26', LS.get('qteam16', '') || '');
   LS.set('qteam16', '@season');
   return;
  }
  const d = szPayload15(s.id);
  if (!d) return;
  if (s.arch2314) d.arch = 1;
  LS.set('qsz286', d);
  LS.set('qteam16', s.id);
 } catch (e) {
  console.error(e);
 }
}

function qseason286() {
 try {
  if (no286q() || !season || season.online || !season.team || !TEAMS.some(x => x.id === season.team)) return;
  if (LS.get('qplay26', null) == null) LS.set('qplay26', LS.get('qteam16', '') || '');
  LS.set('qteam16', '@season');
 } catch (e) {
  console.error(e);
 }
}

function qsSeason286() {
 if (no286q() || LS.get('qteam16', null) !== '@season') return null;
 const S = season;
 if (!S || S.online || !S.team || !TEAMS.some(x => x.id === S.team)) return null;
 const ids = teamRosterIds(S.team, 'season');
 return Array.isArray(ids) && ids.some(id => PP(id)) ? S.team : null;
}

function qsz286() {
 return HOME172 === 'quick' && !!qsSeason286();
}

function qTeam16() {
 if (!window.GHO16 || !GHO16.on()) return null;
 const t = LS.get('qteam16', null);
 if (!no286q() && t === '@season') return qsSeason286();
 if (!no286q() && t && /^SZ[A-Z0-9]{4}$/.test(t)) {
  if (!SZ_REG[t]) {
   const d = LS.get('qsz286', null);
   if (d && d.id === t) {
    try {
     szRegister15(d, false);
    } catch (e) {}
   }
  }
  return SZ_REG[t] && !SZ_REG[t].col26 ? t : null;
 }
 return t && (TEAMS.some(x => x.id === t) || WT_REG[t] || GH_REG[t] && GHO16.owned()) ? t : null;
}

function homeQuick16() {
 return HOME172 === 'quick' && !!qTeam16();
}

function lobbyTeam() {
 if (screen === 'card28' && window.V28 && V28.cardTid()) return V28.cardTid();
 if (screen === 'gear17' && GEAR17) return GEAR17.tid;
 if (homeQuick16()) return qTeam16();
 if (homeWorld()) return wgTeam172();
 const S = season;
 if (!S || !S.team) return null;
 const ids = teamRosterIds(S.team, 'season');
 if (!Array.isArray(ids) || !ids.some(id => PP(id))) return null;
 return S.team;
}

function lobbyIds() {
 if (screen === 'card28' && window.V28 && V28.cardPid()) return [ V28.cardPid() ];
 const tid = lobbyTeam();
 if (!tid) return null;
 return curIds2402(tid, lobbySrc()).filter(id => PP(id)).slice().sort((a, b) => curOvr14(b) - curOvr14(a) || (a < b ? -1 : 1));
}

function lobbyState() {
 const ids = lobbyIds(), locked = !ids, n = locked ? LOBBY_LOCKED.length : ids.length;
 const key = locked ? 'L' : lobbyTeam() + ':' + ids.join(',');
 if (key !== lobby.key) {
  lobby.key = key;
  if (!locked) {
   const i = lobby.pid ? ids.indexOf(lobby.pid) : -1;
   lobby.idx = i >= 0 ? i : 0;
  } else lobby.idx = clamp(lobby.idx, 0, n - 1);
 }
 lobby.idx = (lobby.idx % n + n) % n;
 return {
  locked: locked,
  ids: ids,
  n: n,
  tid: lobbyTeam(),
  pid: locked ? null : ids[lobby.idx]
 };
}

function lobbyStep(d) {
 const st = lobbyState();
 lobby.idx = (lobby.idx + d + st.n) % st.n;
 lobby.dir = d;
 lobby.at = menuT;
 if (!st.locked) lobby.pid = st.ids[lobby.idx];
 lobby.card = null;
}

function lobbyKit(tid) {
 if (!tid) return LOBBY_GRAY;
 const t = T(tid);
 return {
  jersey: t.c1,
  trim: t.c2,
  helm: t.c1
 };
}

function lobbyStick(pos) {
 return pos === 'D' || pos === 'LSM' ? 'pole' : pos === 'G' ? 'goalie' : 'short';
}

const LOBBY_E = 7;

function lobbyMakeFrames() {
 if (!HAS12 || !RL12.FR.bench_idle0 || RL12.FR.lobby_pole) return;
 const b = RL12.FR.bench_idle0, rows = b[3].map(r => r.split('')), W = rows[0].length, SH = 13, isHead = c => c === 'M' || c === 'm' || c === 'n';
 const body = rows.map(r => r.slice());
 for (let y = 0; y < 7; y++) for (let x = 11; x < W; x++) if (isHead(body[y][x])) body[y][x] = '.';
 body[3][11] = 'o';
 body[4][11] = 'o';
 const build = (head, hx0, w) => {
  const out = [];
  for (let y = 0; y < LOBBY_E + body.length; y++) {
   const r = new Array(w).fill('.');
   const by = y - LOBBY_E;
   if (by >= 0) for (let x = 0; x < W; x++) r[x] = body[by][x];
   out.push(r);
  }
  let hb = 0;
  head.forEach((hr, y) => {
   for (let x = 0; x < hr.length; x++) if (hr[x] !== '.') {
    out[y][hx0 + x] = hr[x];
    hb = Math.max(hb, y);
   }
  });
  for (let y = hb + 1; y <= LOBBY_E + 20; y++) if (out[y][SH] === '.' || isHead(out[y][SH])) out[y][SH] = 'X';
  return [ b[0], b[1] + LOBBY_E, null, out.map(r => r.join('')) ];
 };
 const shortHead = rows.slice(0, 7).map(r => r.slice(11).map(c => isHead(c) ? c : '.').join(''));
 RL12.FR.lobby_pole = build(shortHead, 11, W);
 const gi = RL12.FR.g_idle;
 if (gi) {
  const gh = gi[3].slice(0, 11).map(r => r.slice(13).split('').map(c => isHead(c) ? c : '.').join(''));
  RL12.FR.lobby_goalie = build(gh, 10, Math.max(W, 10 + gh[0].length));
 }
}

function vsFrame(pos) {
 const s = lobbyStick(pos), n = s === 'pole' ? 'pole_idle' : s === 'goalie' ? 'g_idle' : 'idle';
 return HAS12 && RL12.FR[n] ? n : 'idle';
}

function lobbyFrame(pos, side) {
 if (side) return vsFrame(pos);
 if (!HAS12 || !RL12.FR.bench_idle0) return 'idle';
 lobbyMakeFrames();
 const s = lobbyStick(pos), n = s === 'pole' ? 'lobby_pole' : s === 'goalie' ? 'lobby_goalie' : 'bench_idle0';
 return RL12.FR[n] ? n : 'bench_idle0';
}

const LOBBY_FW = 23;

const lobbyBakes = new Map;

function lobbyBake(name, kit, skin, gray, flip) {
 const pl21 = window.__v17hp ? PP(window.__v17hp) : null, c0 = lobbyBake0(name, kit, skin, gray, flip);
 if (!pl21 || gray || !braidOf21(pl21) || !c0) return c0;
 const s = braidSpot21(name);
 if (!s) return c0;
 const key = name + '|' + pl21.id + '|' + (flip ? 1 : 0) + '|' + kit.jersey + kit.helm + (RL12.uniKey ? RL12.uniKey(kit) : '');
 let c = BRAID21.get('bake|' + key);
 if (c && c.__src === c0) return c;
 c = document.createElement('canvas');
 c.width = c0.width;
 c.height = c0.height;
 c.__src = c0;
 const x = c.getContext('2d');
 x.drawImage(c0, 0, 0);
 const hair = [ '#1a120c', '#2a1b10', '#120d0a', '#33241a' ][seedOf('braid:' + pl21.id) % 4], lit = mixc21(hair, '#ffffff', .18), X = q => flip ? c.width - 1 - q : q;
 const fr = braidFront2402(name);
 if (fr) {
  const a = x.getImageData(0, 0, c.width, c.height).data;
  for (const [q, r, col] of braidFrontPx2402(fr, hair, lit)) {
   const xx = X(q);
   if (xx < 0 || xx >= c.width || r < 0 || r >= c.height || a[(r * c.width + xx) * 4 + 3]) continue;
   x.fillStyle = col;
   x.fillRect(xx, r, 1, 1);
  }
 } else {
  for (let i = 0; i < 6; i++) {
   const q = s.x - (i >= 3 ? 1 : 0);
   x.fillStyle = i % 2 ? lit : hair;
   x.fillRect(X(q), s.y + i, 1, 1);
   x.fillStyle = i % 2 ? hair : lit;
   x.fillRect(X(q + 1), s.y + i, 1, 1);
  }
  x.fillStyle = '#c9a46b';
  x.fillRect(X(s.x - 1), s.y + 6, 1, 1);
 }
 BRAID21.set('bake|' + key, c);
 return c;
}

function lobbyBake0(name, kit, skin, gray, flip) {
 if (window.__v17hp && window.V17) {
  const c17 = V17.bakeHero(name, kit, skin, gray, flip);
  if (c17) return c17;
 }
 const key = name + kit.jersey + kit.trim + kit.helm + '|' + skin + (gray ? 'g' : '') + (flip ? 'f' : '') + (RL12.uniKey ? RL12.uniKey(kit) : '');
 let c = lobbyBakes.get(key);
 if (c) return c;
 const b = RL12.bake(name, kit, !!flip, skin);
 c = document.createElement('canvas');
 c.width = b.width;
 c.height = b.height;
 const x = c.getContext('2d');
 x.drawImage(b, 0, 0);
 if (gray) {
  const im = x.getImageData(0, 0, c.width, c.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) {
   if (!d[i + 3]) continue;
   const l = Math.round(40 + (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) * .72);
   d[i] = l;
   d[i + 1] = l + 3;
   d[i + 2] = l + 7;
  }
  x.putImageData(im, 0, 0);
 }
 lobbyBakes.set(key, c);
 return c;
}

const SIT_ROWS = {
 top: 14,
 legs: [ 17, 18, 19, 20, 21 ]
};

function lobbySitter(x, seatY, kit, skin, gray, k, t, ph) {
 if (!HAS12 || !RL12.FR.bench_idle0) return;
 const b = lobbyBake('bench_idle0', kit, skin, gray, false), w = b.width;
 const bob = Math.sin(t * 2.2 + ph) > .55 ? 1 : 0;
 const glove = Math.sin(t * .9 + ph * 1.7) > .8;
 const x0 = Math.round(x - w / 2 * k), top = seatY - SIT_ROWS.top * k;
 g.fillStyle = 'rgba(0,0,0,.28)';
 g.fillRect(x0 + k, seatY + 5 * k - 1, (w - 2) * k, 2);
 g.drawImage(b, 0, 17, w, 5, x0, seatY - k, w * k, 5 * k);
 g.drawImage(b, 0, 8, w, 4, x0, top + 8 * k, w * k, 4 * k);
 g.drawImage(b, 0, 12, w, 2, x0, top + (glove ? 11 : 12) * k, w * k, 2 * k);
 g.drawImage(b, 0, 0, w, 8, x0, top + bob, w * k, 8 * k);
 if (gray) lobbyLock(x, top - 6, 1);
}

function lobbyLock(cx, y, sc) {
 const s = sc || 1, x = Math.round(cx - 3 * s);
 rect(x + s, y, 4 * s, s, '#d9dde0');
 rect(x + s, y, s, 3 * s, '#d9dde0');
 rect(x + 4 * s, y, s, 3 * s, '#d9dde0');
 rect(x - s, y + 3 * s, 8 * s, 6 * s, '#0d0d0d');
 rect(x, y + 3 * s, 6 * s, 5 * s, '#ffd23a');
 rect(x, y + 3 * s, 6 * s, s, '#fff2a0');
 rect(x + 2 * s, y + 5 * s, 2 * s, 2 * s, '#3a2a00');
}

function lobbyEllipse(cx, cy, rx, ry, col) {
 for (let dy = -ry; dy <= ry; dy++) {
  const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + .5)) ** 2)));
  rect(cx - hw, cy + dy, hw * 2, 1, col);
 }
}

function lobbyRoom(L, kit, locked, t) {
 const c1 = locked ? '#5a6168' : kit.jersey, c2 = locked ? '#3c4248' : kit.trim;
 rect(0, 0, L, H, '#141c24');
 rect(0, 0, L, 10, '#0c1218');
 for (let x = 4; x < L; x += 44) {
  rect(x + 14, 1, 14, 3, '#fff8d8');
  rect(x + 12, 4, 18, 2, 'rgba(255,248,216,.25)');
 }
 const lw = 26, top = 16, bot = 102;
 for (let x = 2, i = 0; x < L - 4; x += lw + 2, i++) {
  rect(x - 1, top - 1, lw + 2, bot - top + 2, '#05080b');
  rect(x, top, lw, bot - top, c1);
  rect(x, top, lw, 2, 'rgba(255,255,255,.22)');
  rect(x + lw - 2, top, 2, bot - top, 'rgba(0,0,0,.28)');
  rect(x + 2, top + 4, lw - 4, 12, 'rgba(0,0,0,.35)');
  for (let v = 0; v < 4; v++) rect(x + 6, top + 20 + v * 3, lw - 12, 1, 'rgba(0,0,0,.4)');
  rect(x + 4, top + 34, lw - 8, 7, c2);
  rect(x + 5, top + 35, lw - 10, 5, 'rgba(255,255,255,.18)');
  rect(x + lw - 6, top + 50, 2, 6, '#c9d0d6');
  rect(x + 3, top + 46, lw - 6, 40, 'rgba(0,0,0,.12)');
  rect(x + 7, top + 48, lw - 14, 14, c2);
  rect(x + 9, top + 50, lw - 18, 10, locked ? '#6b737a' : kit.jersey);
 }
 rect(0, bot, L, H - bot, '#24303a');
 rect(0, bot, L, 2, '#0c1218');
 for (let y = bot + 8, i = 0; y < H; y += 9 + i, i++) rect(0, y, L, 1, 'rgba(0,0,0,.22)');
 lobbyEllipse(Math.round(L / 2), 160, Math.round(L * .42), 12, locked ? '#2c343b' : c2);
 rect(0, 110, L, 4, '#9a6a3a');
 rect(0, 110, L, 1, '#c99a68');
 rect(0, 114, L, 2, '#5c3c1c');
 for (let x = 10; x < L; x += 48) rect(x, 116, 3, 10, '#3a2614');
}

function lobbyHeroGeo(cx, pos, k, flip, side) {
 const f = RL12.FR[lobbyFrame(pos, side)];
 if (!f) return {
  x0: cx,
  footX: cx,
  w: 0
 };
 const w = f[3][0].length, fx = flip ? w - 1 - f[0] : f[0];
 const x0 = side ? Math.round(cx - w * k / 2) : Math.round(cx - (fx + .5) * k);
 return {
  x0: x0,
  footX: Math.round(x0 + (fx + .5) * k),
  w: w
 };
}

function lobbyHero(cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) {
 const name = lobbyFrame(pos, side), f = RL12.FR[name];
 if (!f) return;
 let b = lobbyBake(name, kit, skin, gray, !!flip);
 if (!side && !gray) {
  const j = injOf17(window.__v17hp, season && season.team);
  if (j) b = injMod17(b, f[1], injKind17(j.what), !!flip, 'menu|' + name + '|' + window.__v17hp + '|' + (kit && kit.jersey) + '|' + skin);
 }
 const w = b.width, h = b.height;
 const x0 = lobbyHeroGeo(cx, pos, k, flip, side).x0 + Math.round(slide), y0 = Math.round(feetY - f[1] * k);
 const breathe = Math.round((Math.sin(t * 2.4) + 1) * .75);
 const cut = Math.max(1, f[1] - 12);
 const a0 = g.globalAlpha;
 g.globalAlpha = alpha;
 const gp16 = !gray && window.GHO16 && GHO16.on() && PP(window.__v17hp);
 if (gp16 && gp16.gho16) GHO16.flame(lobbyHeroGeo(cx, pos, k, flip, side).footX + Math.round(slide), feetY, k, t, 0);
 g.drawImage(b, 0, cut, w, h - cut, x0, y0 + cut * k, w * k, (h - cut) * k);
 g.drawImage(b, 0, 0, w, cut, x0, y0 + cut * k - cut * k - breathe, w * k, cut * k);
 if (breathe) g.drawImage(b, 0, cut, w, 1, x0, y0 + cut * k - breathe, w * k, breathe);
 if (gp16 && gp16.gho16) GHO16.flame(lobbyHeroGeo(cx, pos, k, flip, side).footX + Math.round(slide), feetY, k, t, 1);
 g.globalAlpha = a0;
 if (window.__rlHeroLog) window.__rlHeroLog.push(screen + '|' + pos + '|' + name + '|' + (flip ? 'L' : 'R'));
 if (gray) {
  g.globalAlpha = alpha;
  lobbyLock(lobbyHeroGeo(cx, pos, k, flip, side).footX + slide, feetY - 12 * k, 3);
  g.globalAlpha = a0;
 }
}

function lobbyPad(cx, cy, col, t) {
 const p = (Math.sin(t * 3) + 1) / 2;
 for (let i = 0; i < 26; i++) {
  const a = .13 * (1 - i / 26) * (.7 + .3 * p);
  g.fillStyle = hexA(col, a);
  g.fillRect(cx - 30 + Math.round(i * .4), cy - 4 - i * 5, 60 - Math.round(i * .8), 5);
 }
 lobbyEllipse(cx, cy + 2, 40, 9, 'rgba(0,0,0,.45)');
 lobbyEllipse(cx, cy, 38, 8, '#1b2229');
 lobbyEllipse(cx, cy - 1, 36, 7, '#2b353f');
 g.globalAlpha = .55 + .45 * p;
 lobbyEllipse(cx, cy - 1, 33, 6, col);
 g.globalAlpha = 1;
 lobbyEllipse(cx, cy - 1, 27, 4, '#2b353f');
 g.globalAlpha = .35 + .35 * p;
 lobbyEllipse(cx, cy - 1, 23, 3, col);
 g.globalAlpha = 1;
 for (let i = 0; i < 12; i++) {
  const s = seedOf('pt' + i), ph = (t * (.35 + s % 7 / 20) + s % 100 / 100) % 1, px0 = cx - 28 + s % 57, py = cy - 2 - ph * 70;
  g.globalAlpha = (1 - ph) * .9;
  rect(px0 + Math.round(Math.sin(t * 2 + i) * 2), py, (s & 1) + 1, (s & 1) + 1, i % 3 ? col : '#ffffff');
  g.globalAlpha = 1;
 }
}

function lobbyNum(n, x, y, sc, col, shadow) {
 const hs = [ '.#.#.', '#####', '.#.#.', '#####', '.#.#.' ], draw = (ox, oy, c) => {
  g.fillStyle = c;
  for (let r = 0; r < 5; r++) for (let q = 0; q < 5; q++) if (hs[r][q] === '#') g.fillRect(Math.round(ox) + q * sc, Math.round(oy) + r * sc, sc, sc);
 };
 if (shadow) draw(x + Math.max(1, Math.round(sc / 3)), y + Math.max(1, Math.round(sc / 3)), shadow);
 draw(x, y, col);
 return 6 * sc + text(String(n), x + 6 * sc, y, sc, col, 'left', shadow);
}

function lobbyNumW(n, sc) {
 return 6 * sc + textW(String(n), sc);
}

function hexA(hex, a) {
 const [r, gg, b] = hexRgb(hex);
 return 'rgba(' + r + ',' + gg + ',' + b + ',' + a.toFixed(3) + ')';
}

function lobbyArrow(key, x, y, dir, fn) {
 const w = 18, h = 26;
 hit(key, x - 3, y - 4, w + 6, h + 8, fn, key);
 rect(x, y + 2, w, h, '#000');
 rect(x, y, w, h, 'rgba(12,20,28,.82)');
 rect(x, y, w, 1, 'rgba(255,255,255,.35)');
 const cx = x + w / 2, cy = y + h / 2, pulse = Math.round((Math.sin(menuT * 5) + 1) * .6);
 for (let i = 0; i < 7; i++) {
  const xx = dir > 0 ? cx - 3 + i + pulse : cx + 3 - i - pulse;
  rect(xx, cy - (6 - i), 1, (6 - i) * 2 + 1, '#ffe14d');
 }
}

function lobbyGlow(tid) {
 if (!tid) return '#8fa0ad';
 const t = T(tid);
 return lum(t.c1) < 60 ? lum(t.c2) < 60 ? '#2cc4dc' : t.c2 : t.c1;
}

function lobbyCardData(pid) {
 const p = PP(pid);
 if (!p) return null;
 const S = season, rows = S ? statRows14(S) : [], row = rows.find(r => r.id === pid) || null;
 const keys = {
  A: [ 'fin', 'acc', 'stk', 'pow', 'spd', 'str' ],
  M: [ 'pow', 'acc', 'stk', 'spd', 'str', 'def' ],
  D: [ 'def', 'gb', 'spd', 'str', 'stk' ],
  LSM: [ 'def', 'gb', 'spd', 'stk', 'str' ],
  FO: [ 'fo', 'gb', 'spd', 'str' ],
  G: [ 'sav', 'stk', 'spd' ]
 }[p.pos] || SKILLS.slice(0, 5);
 const bo = (boostFor14(S) || {})[pid] || {};
 return {
  pid: pid,
  n: p.n,
  ln: lastName(p),
  num: jerseyNo(p, row ? 'season' : 'real'),
  pos: p.pos,
  posName: POS_NAMES[p.pos] || p.pos,
  ovr: curOvr14(pid, S),
  ovr0: row ? row.ovr0 : p.ovr,
  ratings: keys.map(k => [ k, p.r[k] + (bo[k] || 0) ]),
  season: row ? {
   gp: row.gp,
   g: row.g,
   a: row.a,
   pts: row.pts,
   sh: row.sh,
   gb: row.gb,
   ct: row.ct,
   to: row.to,
   pen: row.pen,
   fop: row.fop,
   fo: row.fo,
   sv: row.sv,
   svp: row.svp
  } : null,
  inj: row && row.inj ? row.inj : null,
  team: S ? S.team : null
 };
}

const SK_SHORT = {
 spd: 'SPEED',
 pow: 'POWER',
 acc: 'ACCURACY',
 fin: 'FINISHING',
 stk: 'STICK',
 str: 'STRENGTH',
 def: 'DEFENSE',
 gb: 'GROUND BALLS',
 fo: 'FACEOFF',
 sav: 'SAVES'
};

function lobbyStartSeason() {
 lobby.card = null;
 if (tutGate) {
  menuMsg = {
   s: 'FINISH THE TUTORIAL FIRST',
   t: 1.8
  };
  SFX.bad && SFX.bad();
  return;
 }
 if (season && season.phase === 'draft') {
  screen = 'draft';
  panelDirty();
  return;
 }
 menuSel.mode = 'season';
 screen = 'seasonSetup';
 panelDirty();
}

function drawLobbyCard() {
 const c = lobby.card;
 if (!c) return;
 rect(0, 0, W, H, 'rgba(0,0,0,.62)');
 hit('CLOSE CARD BG', 0, 0, W, H, () => {
  lobby.card = null;
 }, 'CLOSE CARD BG');
 if (c.kind === 'locked') {
  const w = 190, h = 92, x = Math.round(W / 2 - w / 2), y = Math.round(H / 2 - h / 2);
  rect(x - 2, y - 2, w + 4, h + 4, '#000');
  rect(x, y, w, h, '#14222c');
  rect(x, y, w, 14, '#ffd23a');
  text('NO SEASON TEAM YET', x + w / 2, y + 4, 1, '#0b1a20', 'center');
  lobbyLock(x + w / 2, y + 20, 2);
  text('START A SEASON TO FILL YOUR', x + w / 2, y + 42, 1, '#cfe', 'center');
  text('LOCKER ROOM WITH YOUR TEAM', x + w / 2, y + 50, 1, '#cfe', 'center');
  button(season && season.phase === 'draft' ? 'FINISH YOUR DRAFT' : 'START A SEASON', x + 8, y + 62, w - 70, 20, lobbyStartSeason, {
   bg: '#ffd23a'
  });
  button('NOT NOW', x + w - 58, y + 62, 50, 20, () => {
   lobby.card = null;
  }, {
   bg: '#c9d6d9'
  });
  return;
 }
 const d = lobbyCardData(c.pid);
 if (!d) {
  lobby.card = null;
  return;
 }
 const tm = T(d.team), w = 236, h = 150, x = Math.round(W / 2 - w / 2), y = Math.round(H / 2 - h / 2);
 rect(x - 2, y - 2, w + 4, h + 4, '#000');
 rect(x, y, w, h, '#101a22');
 rect(x, y, w, 26, tm.c1);
 rect(x, y + 24, w, 2, tm.c2);
 rect(x, y, w, 1, 'rgba(255,255,255,.3)');
 const fg = textOn(tm.c1);
 lobbyNum(d.num, x + 6, y + 4, 2, fg);
 text(d.ln, x + 6 + lobbyNumW(d.num, 2) + 8, y + 4, 2, fg);
 text(d.n.toUpperCase() + '  -  ' + d.posName, x + 6, y + 17, 1, fg);
 rect(x + w - 42, y + 3, 38, 20, '#0b1a20');
 text('OVR', x + w - 23, y + 5, 1, '#8fe3f0', 'center');
 text(String(d.ovr), x + w - 23, y + 12, 2, '#ffe14d', 'center');
 if (d.ovr !== d.ovr0) {
  const up = d.ovr > d.ovr0, ax = x + w - 7, ay = y + 14;
  for (let i = 0; i < 3; i++) rect(ax - i, up ? ay + i : ay + 2 - i, 2 * i + 1, 1, up ? '#3fe05a' : '#ff4a3a');
 }
 let yy = y + 32;
 text('RATINGS', x + 6, yy, 1, '#ffe14d');
 yy += 9;
 if (window.V17) {
  const s17 = V17.stickRatings(PP(d.pid));
  text((s17.hand === 'L' ? 'LEFTY' : 'RIGHTY') + '  R-STK ' + s17.R + '  L-STK ' + s17.L + (window.V20 ? V20.cardTag(d.pid) : ''), x + 6, y + h - 32, 1, '#ffe14d');
 }
 for (const [k, v] of d.ratings) {
  text(SK_SHORT[k] || k, x + 6, yy, 1, '#cfe');
  const bw = 62, bx = x + 58;
  rect(bx, yy, bw, 5, '#22313d');
  rect(bx, yy, Math.round(bw * clamp(v, 0, 99) / 99), 5, v >= 85 ? '#7dff7a' : v >= 70 ? '#ffd23a' : '#ff8a7a');
  text(String(v), bx + bw + 4, yy, 1, '#fff');
  yy += 8;
 }
 const sx = x + 140;
 let sy = y + 32;
 text('THIS SEASON', sx, sy, 1, '#ffe14d');
 sy += 9;
 const s = d.season;
 const lines = !s ? [ [ 'GP', 0 ] ] : d.pos === 'G' ? [ [ 'GP', s.gp ], [ 'SAVES', s.sv ], [ 'SV PCT', s.svp == null ? '-' : s.svp ], [ 'GB', s.gb ] ] : d.pos === 'FO' ? [ [ 'GP', s.gp ], [ 'FO', s.fo ], [ 'FO PCT', s.fop == null ? '-' : s.fop ], [ 'GB', s.gb ], [ 'G', s.g ], [ 'A', s.a ] ] : [ [ 'GP', s.gp ], [ 'G', s.g ], [ 'A', s.a ], [ 'PTS', s.pts ], [ 'GB', s.gb ], [ 'CT', s.ct ], [ 'TO', s.to ] ];
 for (const [lab, v] of lines) {
  text(lab, sx, sy, 1, '#cfe');
  text(String(v), x + w - 8, sy, 1, '#fff', 'right');
  sy += 8;
 }
 if (d.inj) {
  text((d.inj.conc ? 'CONCUSSION' : 'INJURED') + ' - ' + (d.inj.g >= 99 ? 'SEASON' : d.inj.g + ' G'), sx, sy + 1, 1, d.inj.conc ? '#ffb14d' : '#ff9a8a');
 }
 button('CLOSE', x + w / 2 - 34, y + h - 20, 68, 16, () => {
  lobby.card = null;
 }, {
  bg: '#c9d6d9'
 });
}

function over2503(S) {
 if (!on2503() || !S || S.online || S.phase !== 'done') return null;
 if (S.champ && S.champ === S.team) return 'CHAMPIONS';
 const r = (S.playoff && S.playoff.results || []).find(x => x[0] === S.team && x[2] < x[3] || x[1] === S.team && x[3] < x[2]);
 if (r) return {
  QUARTER: 'LOST IN QUARTERS',
  SEMI: 'LOST IN SEMIS',
  FINAL: 'LOST IN FINAL'
 }[r[4]] || 'KNOCKED OUT';
 return S.playoff && (S.playoff.seeds || []).includes(S.team) ? 'KNOCKED OUT' : 'MISSED PLAYOFFS';
}

function menuBars(hasSeason) {
 const goSeason = () => {
  if (hasSeason) {
   screen = season.phase === 'draft' ? 'draft' : 'season';
   panelDirty();
  } else {
   menuSel.mode = 'season';
   screen = 'seasonSetup';
   panelDirty();
  }
 };
 const newSeason = () => {
  menuSel.mode = 'season';
  screen = 'seasonSetup';
  panelDirty();
 };
 const goWG = () => {
  screen = wgame && wgame.phase !== 'done' ? 'wgHub' : 'wgPick';
  panelDirty();
 };
 const hasW = !!wgTeam172(), wf = homeWorld(), qf = homeQuick16();
 const rows = [ [ {
  label: homeQuick16() ? 'PLAY QUICK MATCH' : 'QUICK GAME',
  fn: () => {
   if (qTeam16() && !homeQuick16()) {
    setHome172('quick');
    return;
   }
   menuSel.mode = 'quick';
   screen = 'pickTeam';
  },
  big: true,
  sc: 2,
  bg: '#ff5ad2'
 } ], [ {
  label: 'ONLINE',
  fn: () => {
   if (qTeam16() && !homeQuick16()) {
    setHome172('quick');
    return;
   }
   if (window.RLNET) RLNET.openOnline();
  },
  big: true,
  sc: 2,
  bg: '#b6ff3a'
 } ], [ {
  label: !hasSeason ? 'SEASON' : wf || qf ? 'CONTINUE SEASON' : hasW ? 'PLAY SEASON' : 'CONTINUE SEASON',
  fn: !hasSeason ? qf ? () => setHome172('season') : goSeason : wf || qf ? () => setHome172('season') : goSeason,
  big: true,
  sc: 2,
  bg: '#ffd23a'
 } ], [ {
  label: hasW && !wf ? 'WORLD GAMES' : 'PLAY WORLD GAMES',
  fn: hasW && !wf ? () => setHome172('world') : goWG,
  big: true,
  sc: 2,
  bg: '#2cc4dc'
 } ], wf ? [ {
  label: 'RESTART WORLD GAMES',
  fn: () => {
   ASK22 = {
    kind: 'world'
   };
  },
  bg: '#2cc4dc'
 }, {
  label: 'TEAMS + RATINGS',
  fn: () => {
   menuSel.mode = 'browse';
   screen = 'pickTeam';
  },
  bg: '#8fe3f0'
 } ] : hasSeason ? [ {
  label: 'NEW SEASON',
  fn: () => {
   ASK22 = {
    kind: 'season'
   };
  },
  bg: '#ffd23a'
 }, {
  label: 'TEAMS + RATINGS',
  fn: () => {
   menuSel.mode = 'browse';
   screen = 'pickTeam';
  },
  bg: '#8fe3f0'
 } ] : [ {
  label: 'TEAMS + RATINGS',
  fn: () => {
   menuSel.mode = 'browse';
   screen = 'pickTeam';
  },
  bg: '#8fe3f0'
 } ], [ {
  label: 'PLAYMAKER',
  fn: () => openPlaymaker('menu'),
  bg: '#ff9a4a'
 }, {
  label: 'TUTORIAL',
  fn: () => startTutorial(),
  bg: '#ff5ad2'
 } ].concat(window.ED31 && window.__rl_no32ed ? [ {
  label: 'EDIT NAMES',
  fn: () => ED31.open(),
  bg: '#b9a8ff'
 } ] : []), [ {
  label: 'HOW TO PLAY',
  fn: () => {
   screen = 'help';
  },
  bg: '#c9d6d9'
 }, {
  label: 'PRACTICE',
  fn: () => {
   if (window.PRAC18) PRAC18.open();
  },
  bg: '#ff5ad2'
 } ], window.V23 ? [ {
  label: 'GAME SETTINGS',
  fn: () => {
   screen = 'settings';
  },
  big: true,
  sc: 2,
  bg: '#ffd23a'
 }, {
  label: V23.label(),
  fn: () => V23.open(),
  big: true,
  sc: 2,
  bg: '#b6ff3a'
 } ] : [ {
  label: 'GAME SETTINGS',
  fn: () => {
   screen = 'settings';
  },
  big: true,
  sc: 2,
  bg: '#ffd23a'
 } ] ];
 const ov = over2503(season);
 if (ov) {
  const sr = rows[2] && rows[2][0];
  if (sr && sr.bg === '#ffd23a' && sr.big) {
   const full = 'SEASON OVER: ' + ov, bw = lobbyBounds().bw;
   sr.label = textW(full, 2) <= bw - 8 ? full : 'SEASON OVER';
   sr.ov2503 = 1;
   if (!(wf || qf)) sr.fn = () => {
    ASK22 = {
     kind: 'over',
     how: ov
    };
   };
  }
 }
 if (window.V20) V20.gateRows(rows);
 if (window.__rlMenuExtra) for (const e of window.__rlMenuExtra) rows.splice(e.at, 0, e.row);
 return rows;
}

function layoutBars(rows, x, w, y0, y1) {
 let gap = 4, bigH = 20, smH = 14;
 const tot = () => rows.reduce((s, r) => s + (r.some(e => e.big) ? bigH : smH), 0) + gap * (rows.length - 1);
 while (tot() > y1 - y0 && gap > 2) gap--;
 while (tot() > y1 - y0 && bigH > 16) bigH--;
 while (tot() > y1 - y0 && smH > 12) smH--;
 const out = [];
 let y = y0;
 for (const r of rows) {
  const h = r.some(e => e.big) ? bigH : smH, n = r.length, hw = Math.floor((w - 3 * (n - 1)) / n);
  r.forEach((e, i) => out.push(Object.assign({}, e, {
   x: x + i * (hw + 3),
   y: y,
   w: i === n - 1 ? w - i * (hw + 3) : hw,
   h: h
  })));
  y += h + gap;
 }
 return out;
}

function menuBar(b, live) {
 const chev281 = b.big && !window.__rl_no281chev && !window.__rl_v124gb ? 14 : 0;
 const sc = b.sc && b.h >= 16 && textW(b.label, 2) <= b.w - 8 - chev281 ? 2 : 1;
 if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
 rect(b.x, b.y + 2, b.w, b.h, '#000');
 rect(b.x, b.y, b.w, b.h, b.bg || '#2cc4dc');
 rect(b.x, b.y, b.w, 1, 'rgba(255,255,255,.4)');
 rect(b.x, b.y + b.h - 2, b.w, 2, 'rgba(0,0,0,.18)');
 rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
 if (b.big) for (let i = 0; i < 3; i++) rect(b.x + b.w - 9 + i, b.y + b.h / 2 - 3 + i, 1, 7 - 2 * i, 'rgba(11,26,32,.55)');
 const fw = b.w - 6 - chev281;
 if (sc === 1 && textW(b.label) > fw && !window.__rl_noqpcol26) {
  const cell = Math.max(1, Math.floor(fw / textW(b.label) * RR)) / RR;
  if (window.__rlBar26) window.__rlBar26[b.label] = {
   cell: cell,
   w: textW(b.label) * cell,
   bw: b.w
  };
  textMini(b.label, b.x + b.w / 2 + 1, b.y + Math.round((b.h - 5 * cell) / 2), b.fg || '#0b1a20', cell);
  return;
 }
 text(b.label, b.x + b.w / 2, b.y + Math.round((b.h - 5 * sc) / 2), sc, b.fg || '#0b1a20', 'center');
}

function pen32(x, y, nsc, pid) {
 const h = 5 * nsc, py = y + Math.round((h - 7) / 2);
 const bh = Math.min(12, Math.max(9, h + 4));
 lobby.pen32 = {
  x: x - 2,
  y: y - 2,
  w: 13,
  h: bh,
  pid: pid
 };
 hit('PEN NAME', x - 2, y - 2, 13, bh, () => {
  if (now() < lobby.swallow) return;
  try {
   ED31.openPlayer(pid);
  } catch (e) {
   console.error(e);
  }
 }, 'PEN NAME');
 rect(x - 1, py - 1, 10, 9, 'rgba(0,0,0,.6)');
 for (let i = 0; i < 5; i++) rect(x + 1 + i, py + 4 - i, 2, 2, '#ffd23a');
 rect(x + 6, py - 1, 2, 2, '#ff8fc8');
 rect(x + 7, py - 1, 1, 1, '#ffb3d9');
 rect(x, py + 5, 2, 2, '#f1d6a8');
 rect(x, py + 6, 1, 1, '#0b1a20');
}

function lobbyBounds() {
 const L = Math.round(W * .6), bx = L + 4, bw = W - 6 - bx;
 return {
  L: L,
  bx: bx,
  bw: bw
 };
}

function drawLobbyLeft(L, live) {
 const st = lobbyState(), t = menuT, locked = st.locked, kit = window.UNI21 && UNI21.on() && !locked && st.tid ? UNI21.heroKit(0, st.tid) : lobbyKit(st.tid);
 g.save();
 g.beginPath();
 g.rect(0, 0, L, H);
 g.clip();
 try {
  drawLobbyLeftIn(L, live, st, t, kit, locked);
 } finally {
  g.restore();
 }
}

function drawLobbyLeftIn(L, live, st, t, kit, locked) {
 lobbyRoom(L, kit, locked, t);
 const hx = Math.round(L * .48), seatY = 110;
 const sitters = locked ? [ 3, 9, 0, 11 ].map(i => ({
  pos: LOBBY_LOCKED[i][0],
  skin: i % 4
 })) : st.ids.filter(id => id !== st.pid).sort((a, b) => curOvr14(b) - curOvr14(a)).slice(0, 4).map(id => ({
  pos: PP(id).pos,
  skin: skinOf(PP(id))
 }));
 const spots = [ Math.round(L * .09), Math.round(L * .25), Math.round(L * .75), Math.round(L * .91) ];
 sitters.forEach((s, i) => lobbySitter(spots[i], seatY, kit, s.skin, locked, 2, t, i * 1.9));
 const col = lobbyGlow(st.tid), feetY = 139, k = 5;
 const pos = locked ? LOBBY_LOCKED[lobby.idx][0] : PP(st.pid).pos, skin = locked ? 0 : skinOf(PP(st.pid));
 lobbyPad(lobbyHeroGeo(hx, pos, k).footX, feetY + 1, col, t);
 const e = clamp((t - lobby.at) / .22, 0, 1), ease = 1 - (1 - e) * (1 - e);
 window.__v17hp = locked ? null : st.pid;
 try {
  lobbyHero(hx, feetY, pos, kit, skin, locked, k, t, .25 + .75 * ease, Math.round(lobby.dir * (1 - ease) * 34));
 } finally {
  window.__v17hp = null;
 }
 const f = RL12.FR[lobbyFrame(pos)];
 lobby.hero = {
  x: hx - 38,
  y: feetY - 21 * k,
  w: 76,
  h: 21 * k + 4
 };
 if (live) hit('LOBBY PLAYER', lobby.hero.x, lobby.hero.y, lobby.hero.w, lobby.hero.h, () => {
  if (now() < lobby.swallow) return;
  lobby.card = locked ? {
   kind: 'locked'
  } : {
   kind: 'stats',
   pid: st.pid
  };
 }, 'LOBBY PLAYER');
 const ay = 66, half = Math.ceil(LOBBY_FW * k / 2), gb281 = !window.__rl_no281arrows && !window.__rl_v124gb && window.V17 && L < 240;
 const axl = gb281 ? Math.max(hx - half - 22, 28) : hx - half - 22, axr = gb281 ? Math.min(hx + half + 4, L - 47) : hx + half + 4;
 if (live) {
  lobbyArrow('LOBBY PREV', axl, ay, -1, () => lobbyStep(-1));
  lobbyArrow('LOBBY NEXT', axr, ay, 1, () => lobbyStep(1));
 } else {
  lobbyArrowArt(axl, ay, -1);
  lobbyArrowArt(axr, ay, 1);
 }
 const ul = window.UNI21 && !locked ? UNI21.drawToggle(0, st.tid, axl, axr, ay + 30, live) : null;
 if (ul) {
  const uw = textW(ul.txt, 1) + 6;
  rect(Math.round(L / 2 - uw / 2), 15, uw, 9, 'rgba(5,10,14,.6)');
  text(ul.txt, L / 2, 17, 1, '#ffd23a', 'center');
 }
 const nm = locked ? 'LOCKED' : lastName(PP(st.pid)), nfit281 = window.__rl_no281name || !window.V17 ? L - 20 : 2 * Math.min(hx - 56, L - 48 - hx), nsc = textW(nm, 2) > Math.min(L - 20, nfit281) ? 1 : 2;
 text(nm, hx, 147, nsc, locked ? '#aab3ba' : '#ffffff', 'center', '#000');
 if (live && !locked && window.ED31 && ED31.canRename && ED31.canRename(st.pid)) pen32(hx + Math.ceil(textW(nm, nsc) / 2) + 3, 147, nsc, st.pid);
 const num = locked ? null : jerseyNo(PP(st.pid)), sub = locked ? LOBBY_LOCKED[lobby.idx][1] : (POS_NAMES[PP(st.pid).pos] || PP(st.pid).pos).replace(/ \(.*\)/, '');
 const mv26 = !window.__rl_no26 && sa2403Dy(158, 15) > 0, cl26 = lobby.cload2402;
 const sw = (num != null ? lobbyNumW(num, 1) + 4 : 0) + textW(sub, 1), bw2 = mv26 ? 44 : 38, tot = mv26 ? sw : sw + 6 + bw2, sx = Math.round(hx - tot / 2);
 const bx2 = mv26 ? cl26 ? cl26.x : L - 46 : sx + sw + 6, by2 = mv26 ? (cl26 ? cl26.y : 146) - 13 : 158, bh2 = mv26 ? 11 : 13;
 lobby.stats26 = {
  x: bx2,
  y: by2,
  w: bw2,
  h: bh2,
  moved: mv26,
  name: [ Math.round(hx - textW(nm, nsc) / 2), 147, textW(nm, nsc), 5 * nsc ],
  tag: [ sx - 3, 159, sw + 6, 11 ]
 };
 rect(sx - 3, 159, sw + 6, 11, 'rgba(0,0,0,.55)');
 if (num != null) {
  lobbyNum(num, sx, 162, 1, '#ffe14d');
  text(sub, sx + lobbyNumW(num, 1) + 4, 162, 1, '#8fe3f0');
 } else text(sub, sx, 162, 1, '#aab3ba');
 const statsFn = () => {
  lobby.card = locked ? {
   kind: 'locked'
  } : {
   kind: 'stats',
   pid: st.pid
  };
 };
 if (live) button('STATS', bx2, by2, bw2, bh2, statsFn, {
  bg: locked ? '#7d848b' : '#ffd23a'
 }); else {
  rect(bx2, by2 + 2, bw2, bh2, '#000');
  rect(bx2, by2, bw2, bh2, locked ? '#7d848b' : '#ffd23a');
  text('STATS', bx2 + bw2 / 2, by2 + Math.round((bh2 - 5) / 2), 1, '#0b1a20', 'center');
 }
 if (locked) lobbyLock(bx2 + bw2 - 2, by2 - 6, 1);
 const sign = locked ? 'NO SEASON TEAM' : T(st.tid).city + ' ' + T(st.tid).name;
 const sgw = Math.min(window.V17 ? L - 124 : L - 8, textW(sign, 1) + 10);
 rect(Math.round(L / 2 - sgw / 2), 3, sgw, 10, '#05080b');
 text(sign.slice(0, Math.floor((sgw - 6) / 4)), L / 2, 5, 1, locked ? '#aab3ba' : '#ffe14d', 'center');
 lobby.layout = {
  L: L,
  hx: hx,
  feetY: feetY,
  k: k,
  arrows: [ axl, axr ],
  ay: ay
 };
}

function lobbyArrowArt(x, y, dir) {
 rect(x, y, 18, 26, 'rgba(12,20,28,.82)');
 for (let i = 0; i < 7; i++) {
  const cx = x + 9, xx = dir > 0 ? cx - 3 + i : cx + 3 - i;
  rect(xx, y + 13 - (6 - i), 1, (6 - i) * 2 + 1, '#ffe14d');
 }
}

function lobbySwipeInit() {
 const lp = e => {
  const r = cv.getBoundingClientRect();
  return {
   x: (e.clientX - r.left) / r.width * W,
   y: (e.clientY - r.top) / r.height * H,
   cx: e.clientX,
   cy: e.clientY
  };
 };
 ui.addEventListener('pointerdown', e => {
  if (screen !== 'menu' || paused || lobby.card || !lobby.hero) return;
  const p = lp(e), hb = lobby.hero;
  if (p.x < hb.x - 20 || p.x > hb.x + hb.w + 20 || p.y < hb.y || p.y > hb.y + hb.h + 10) return;
  lobby.swipe = {
   id: e.pointerId,
   x: p.cx,
   y: p.cy,
   done: false
  };
 }, true);
 const move = e => {
  const s = lobby.swipe;
  if (!s || s.id !== e.pointerId || s.done || screen !== 'menu') return;
  const dx = e.clientX - s.x, dy = e.clientY - s.y;
  if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
   s.done = true;
   lobby.swallow = now() + .5;
   lobbyStep(dx < 0 ? 1 : -1);
  }
 };
 ui.addEventListener('pointermove', move, true);
 ui.addEventListener('pointerup', e => {
  move(e);
  if (lobby.swipe && lobby.swipe.id === e.pointerId) lobby.swipe = null;
 }, true);
 ui.addEventListener('pointercancel', e => {
  if (lobby.swipe && lobby.swipe.id === e.pointerId) lobby.swipe = null;
 }, true);
}

lobbySwipeInit();

const VS = {
 side: [ {
  idx: 0,
  dir: 0,
  at: -9,
  key: ''
 }, {
  idx: 0,
  dir: 0,
  at: -9,
  key: ''
 } ],
 hero: [ null, null ],
 swipe: null,
 swallow: 0,
 scr: null,
 last: null
};

const CUR2402 = new Map;

function luIds2402(lu) {
 const out = [];
 if (lu && typeof lu === 'object') for (const k in lu) {
  const v = lu[k];
  for (const id of Array.isArray(v) ? v : [ v ]) if (typeof id === 'string' && PP(id) && !out.includes(id)) out.push(id);
 }
 return out;
}

function curIds2402(tid, src, lu) {
 const base = teamRosterIds(tid, src);
 if (window.__rl_no2402 || window.__rl_v124gb || !Array.isArray(base)) return base;
 if (!lu) {
  const key = tid + '|' + src, c = CUR2402.get(key), t = performance.now();
  if (c && t - c.t < 400) lu = c.lu; else {
   try {
    lu = lineupFor(tid, src);
   } catch (e) {
    lu = null;
   }
   CUR2402.set(key, {
    t: t,
    lu: lu
   });
  }
 }
 const extra = luIds2402(lu).filter(id => !base.includes(id));
 return extra.length ? base.concat(extra) : base;
}

function vsOvr(id, src) {
 const p = PP(id);
 return p ? src === 'season' ? curOvr14(id, season) : p.ovr : 0;
}

function vsIds(tid, src, lu) {
 if (!tid) return [];
 const ids = curIds2402(tid, src, lu);
 if (!Array.isArray(ids)) return [];
 return ids.filter(id => PP(id)).slice().sort((a, b) => vsOvr(b, src) - vsOvr(a, src) || (a < b ? -1 : 1));
}

function vsBegin() {
 if (VS.scr !== screen) {
  for (const s of VS.side) {
   s.idx = 0;
   s.dir = 0;
   s.at = -9;
  }
  VS.scr = screen;
 }
}

function vsSide(i, tid, src) {
 const glu = screen === 'pregame' && game && game.lu && tid ? tid === game.user ? game.lu[0] : tid === game.opp ? game.lu[1] : null : null;
 const s = VS.side[i], ids = vsIds(tid, src, glu), key = (tid || '-') + ':' + src + ':' + ids.join(',');
 if (key !== s.key) {
  s.key = key;
  s.idx = 0;
 }
 s.n2402 = ids.length;
 const n = ids.length;
 if (n) s.idx = (s.idx % n + n) % n;
 return {
  ids: ids,
  n: n,
  pid: n ? ids[s.idx] : null
 };
}

function vsStep(i, d) {
 const s = VS.side[i], n = !window.__rl_no2402 && !window.__rl_v124gb && s.n2402 != null ? s.n2402 : s.key ? s.key.split(':')[2].split(',').filter(Boolean).length : 0;
 if (!n) return;
 s.idx = (s.idx + d + n) % n;
 s.dir = d;
 s.at = menuT;
}

function vsHeroCol(i, tid, src, cx, feetY, k, live, o) {
 o = o || {};
 const st = vsSide(i, tid, src), t = menuT, kit = window.UNI21 && UNI21.on() ? UNI21.heroKit(i, tid) : lobbyKit(tid), s = VS.side[i];
 if (!tid || !st.pid) {
  VS.hero[i] = null;
  text(o.empty || 'WAITING...', cx, feetY - 30, 1, '#7f9aa6', 'center');
  return st;
 }
 const p = PP(st.pid), col = lobbyGlow(tid), flip = i === 1;
 lobbyPad(lobbyHeroGeo(cx, p.pos, k, flip, true).footX, feetY + 1, col, t);
 const e = clamp((t - s.at) / .22, 0, 1), ease = 1 - (1 - e) * (1 - e);
 window.__v17hp = st.pid;
 try {
  lobbyHero(cx, feetY, p.pos, kit, skinOf(p), false, k, t, .25 + .75 * ease, Math.round(s.dir * (1 - ease) * 30), flip, true);
 } finally {
  window.__v17hp = null;
 }
 const hw = o.hw || Math.ceil(LOBBY_FW * k / 2), hb = {
  x: cx - hw,
  y: feetY - 21 * k,
  w: hw * 2,
  h: 21 * k + 4
 };
 VS.hero[i] = hb;
 if (live) hit('VS PLAYER ' + (i ? 'R' : 'L'), hb.x, hb.y, hb.w, hb.h, () => {
  if (now() < VS.swallow) return;
  if (o.onHero) o.onHero(i);
 }, 'VS PLAYER ' + (i ? 'RIGHT' : 'LEFT'));
 const ay = Math.round(feetY - 21 * k / 2 - 15), axl = cx - hw - 22, axr = cx + hw + 4;
 if (st.n > 1) {
  if (live) {
   lobbyArrow('VS ' + (i ? 'R' : 'L') + ' PREV', axl, ay, -1, () => vsStep(i, -1));
   lobbyArrow('VS ' + (i ? 'R' : 'L') + ' NEXT', axr, ay, 1, () => vsStep(i, 1));
  } else {
   lobbyArrowArt(axl, ay, -1);
   lobbyArrowArt(axr, ay, 1);
  }
 }
 VS.uni = VS.uni || [];
 VS.uni[i] = window.UNI21 ? UNI21.drawToggle(i, tid, axl, axr, ay + 30, live) : null;
 if (VS.uni[i] && VS.uni[i].locked) {
  rect(cx - 13, feetY - 21 * k / 2 - 9, 26, 18, 'rgba(5,10,14,.7)');
  lobbyLock(cx, feetY - 21 * k / 2 - 6, 2);
 }
 const nm = lastName(p), maxW = o.w || 140, nsc = textW(nm, 2) <= maxW ? 2 : 1;
 const ny = feetY + 5;
 text(nm, cx, ny, nsc, '#ffffff', 'center', '#000');
 const num = jerseyNo(p, src, tid), sub = p.pos + '  OVR ' + vsOvr(st.pid, src), sw = lobbyNumW(num, 1) + 4 + textW(sub, 1), sx = Math.round(cx - sw / 2), sy = ny + (nsc === 2 ? 13 : 8);
 rect(sx - 3, sy - 2, sw + 6, 9, 'rgba(0,0,0,.55)');
 lobbyNum(num, sx, sy, 1, '#ffe14d');
 text(sub, sx + lobbyNumW(num, 1) + 4, sy, 1, '#8fe3f0');
 VS.last = VS.last || {};
 VS.last[i] = {
  tid: tid,
  src: src,
  pid: st.pid,
  idx: s.idx,
  n: st.n,
  ids: st.ids,
  hero: hb,
  arrows: st.n > 1 ? [ axl, axr, ay ] : null,
  pos: p.pos,
  frame: lobbyFrame(p.pos, true),
  stick: lobbyStick(p.pos),
  flip: flip
 };
 return st;
}

function vsSwipeInit() {
 const on = () => (screen === 'matchup' || screen === 'pregame' || screen === 'onLobby') && !paused;
 const lp = e => {
  const r = cv.getBoundingClientRect();
  return {
   x: (e.clientX - r.left) / r.width * W,
   y: (e.clientY - r.top) / r.height * H
  };
 };
 const down = e => {
  if (!on()) return;
  const p = lp(e);
  for (let i = 0; i < 2; i++) {
   const hb = VS.hero[i];
   if (!hb) continue;
   if (p.x >= hb.x - 14 && p.x <= hb.x + hb.w + 14 && p.y >= hb.y && p.y <= hb.y + hb.h + 10) {
    VS.swipe = {
     id: e.pointerId,
     side: i,
     x: e.clientX,
     y: e.clientY,
     done: false
    };
    return;
   }
  }
 };
 const move = e => {
  const s = VS.swipe;
  if (!s || s.id !== e.pointerId || s.done || !on()) return;
  const dx = e.clientX - s.x, dy = e.clientY - s.y;
  if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
   s.done = true;
   VS.swallow = now() + .5;
   vsStep(s.side, dx < 0 ? 1 : -1);
  }
 };
 const up = e => {
  move(e);
  if (VS.swipe && VS.swipe.id === e.pointerId) VS.swipe = null;
 };
 for (const el of [ ui, cv ]) {
  el.addEventListener('pointerdown', down, true);
  el.addEventListener('pointermove', move, true);
  el.addEventListener('pointerup', up, true);
  el.addEventListener('pointercancel', e => {
   if (VS.swipe && VS.swipe.id === e.pointerId) VS.swipe = null;
  }, true);
 }
}

vsSwipeInit();

function openVsRoster(teams, back, sel) {
 PS.vs = {
  teams: teams,
  back: back || screen,
  sel: sel || 0,
  view: PS.vs && PS.vs.view || 'ratings'
 };
 screen = 'vsRoster';
 panelDirty();
}

function vsStatsOf(id, src) {
 const S = src === 'world' ? wgame : season;
 if (!S || !S.stats || !S.stats[id]) return null;
 const s = S.stats[id];
 if (!s.gp && !s.g && !s.a && !s.gb && !s.sh && !s.sv && !s.fot) return null;
 return {
  gp: s.gp,
  g: s.g,
  a: s.a,
  pts: s.g + s.a,
  sh: s.sh,
  shp: s.sh ? Math.round(100 * s.g / s.sh) : null,
  gb: s.gb,
  to: s.to,
  ct: s.ct,
  pen: s.pen,
  fo: s.fot ? s.fow + '-' + (s.fot - s.fow) : '-',
  fop: s.fot ? Math.round(100 * s.fow / s.fot) : null,
  sv: s.sv,
  svp: s.sa ? Math.round(100 * s.sv / s.sa) : null
 };
}

function vsRosterData(i) {
 const V = PS.vs;
 if (!V) return null;
 const [tid, src] = V.teams[i] || [];
 if (!tid) return null;
 const bo = src === 'season' ? boostFor14(season) || {} : {};
 return sortPlayers(teamRosterIds(tid, src)).map(p => ({
  id: p.id,
  n: p.n,
  num: jerseyNo(p, src, tid),
  pos: p.pos,
  ovr: vsOvr(p.id, src),
  r: Object.fromEntries(SKILLS.map(k => [ k, p.r[k] + ((bo[p.id] || {})[k] || 0) ])),
  st: vsStatsOf(p.id, src)
 }));
}

function renderVsRoster() {
 const V = PS.vs;
 if (!V) return '<div class="hd"><div class="tt">NO GAME</div><div class="sp"></div>' + btn('BACK', 'vsBack', null, 'g') + '</div>';
 const i = V.sel, [tid, src] = V.teams[i], tm = T(tid), rows = vsRosterData(i), stats = V.view === 'stats';
 const tabs = V.teams.map(([t], j) => btn(T(t).name + (V.you === j || V.you == null && j === 0 ? '' : ''), 'vsTeam', j, j === i ? 'y' : 'd')).join('');
 const views = btn('RATINGS', 'vsView', 'ratings', !stats ? 'y' : 'd') + btn('STATS', 'vsView', 'stats', stats ? 'y' : 'd');
 const head = '<div class="hd"><img alt="" src="' + badgeUrl(tm) + '"><div><div class="tt">ROSTER &amp; STATS</div><div class="st">' + esc((tm.city ? tm.city + ' ' : '') + tm.name) + '  -  ' + (src === 'season' ? 'SEASON ROSTER' : src === 'world' || tm.world ? '2023 WORLDS ROSTER' : 'REAL ROSTER') + '  -  ' + rows.length + ' PLAYERS</div></div><div class="sp"></div>' + btn('BACK', 'vsBack', null, 'g') + '</div>';
 const bar = '<div class="row vs14bar">' + tabs + '<span style="flex:0 0 10px"></span>' + views + '</div>';
 let table;
 if (!stats) {
  table = '<tr><th>POS</th><th>#</th><th class="n">NAME</th><th>OVR</th>' + COLS.map(c => '<th>' + c[1] + '</th>').join('') + '</tr>' + rows.map(p => '<tr data-pid="' + p.id + '"><td>' + posTag(p) + '</td><td>' + p.num + '</td><td class="n">' + esc(p.n) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td>' + COLS.map(([k]) => '<td class="' + rc(p.r[k]) + '">' + p.r[k] + '</td>').join('') + '</tr>').join('');
 } else {
  const pct = v => v == null ? '-' : v + '%', d = '-';
  table = '<tr><th>POS</th><th>#</th><th class="n">NAME</th><th>OVR</th><th>GP</th><th>G</th><th>A</th><th>PTS</th><th>SH</th><th>SH%</th><th>GB</th><th>TO</th><th>CT</th><th>PEN</th><th>FO</th><th>FO%</th><th>SV</th><th>SV%</th></tr>' + rows.map(p => {
   const s = p.st;
   return '<tr data-pid="' + p.id + '"><td>' + posTag(p) + '</td><td>' + p.num + '</td><td class="n">' + esc(p.n) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td>' + (s ? '<td>' + s.gp + '</td><td>' + s.g + '</td><td>' + s.a + '</td><td><b>' + s.pts + '</b></td><td>' + s.sh + '</td><td>' + pct(s.shp) + '</td><td>' + s.gb + '</td><td>' + s.to + '</td><td>' + s.ct + '</td><td>' + s.pen + '</td><td>' + s.fo + '</td><td>' + pct(s.fop) + '</td><td>' + (p.pos === 'G' ? s.sv : d) + '</td><td>' + (p.pos === 'G' ? pct(s.svp) : d) + '</td>' : '<td>0</td>' + '<td>' + d + '</td>'.repeat(13)) + '</tr>';
  }).join('');
 }
 const any = rows.some(p => p.st);
 const wsrc = src === 'world';
 const note = stats ? any ? (wsrc ? 'WORLD GAMES STATS' : 'SEASON STATS') + '  -  GP G A PTS SH GB TO CT PEN FO SV' : wsrc ? 'NO WORLD GAMES STATS FOR THIS TEAM YET  -  THEY SHOW UP HERE ONCE THEY PLAY' : 'NO SEASON STATS FOR THIS TEAM YET  -  THEY SHOW UP HERE ONCE THEY PLAY SEASON GAMES' : 'EVERY RATING  -  SORTED BY POSITION, THEN OVR';
 return head + bar + '<div class="note">' + note + '</div><div class="scroll" id="vsList"><table class="vs14" style="font-size:9px">' + table + '</table></div>';
}

function drawVsScreen(o) {
 vsBegin();
 const cx = W / 2, colW = Math.round(W * .38), lx = Math.round(colW / 2) + 4, rx = W - Math.round(colW / 2) - 4, feetY = o.feetY || 122, k = o.k || 4;
 bgStripes(true);
 rect(0, feetY - 6, W, 14, 'rgba(0,0,0,.25)');
 const cols = [ o.L, o.R ];
 for (let i = 0; i < 2; i++) {
  const c = cols[i], x = i ? rx : lx, tm = T(c.tid), hy = o.headY || 30;
  vsHeroCol(i, c.tid, c.src, x, feetY, k, o.live, {
   w: colW - 8,
   onHero: j => o.roster && o.roster(j)
  });
  const ul = VS.uni && VS.uni[i] ? VS.uni[i] : null;
  const lw = Math.max(textW(tm.name, 1), textW(c.label, 1), ul ? textW(ul.txt, 1) : 0) + 6;
  rect(Math.round(x - lw / 2), hy - 2, lw, ul ? 23 : 16, o.hdA || 'rgba(5,10,14,.55)');
  text(tm.name, x, hy, 1, '#ffffff', 'center', '#000');
  text(c.label, x, hy + 7, 1, c.you ? '#8fe3f0' : '#cfe', 'center');
  if (ul) text(ul.txt, x, hy + 14, 1, ul.locked ? '#ff9a8a' : '#ffd23a', 'center');
 }
 const mt = o.midY || 44;
 badge(T(o.L.tid), cx - 30, mt, 2);
 badge(T(o.R.tid), cx + 4, mt, 2);
 text(o.mid || 'VS', cx, mt + 38, 3, '#fff', 'center', '#000');
 if (o.midText) o.midText(cx, mt + 62);
 if (window.UNI21 && UNI21.on() && UNI21.clash()) text('KITS LOOK ALIKE', cx, mt + 56, 1, '#ff9a8a', 'center', '#000');
}

function drawMatchup() {
 const u = menuSel.team, o = menuSel.opp;
 if (!o) {
  screen = 'pickOpp';
  return;
 }
 const rosterFn = j => openVsRoster([ [ u, 'real' ], [ o, 'real' ] ], 'matchup', j);
 let fy286 = 124;
 if (!window.__rl_no286lobby && !window.__rl_v124gb) {
  const by0 = H - 22, byE = by0 - sa2403Dy(by0, 20);
  fy286 = Math.max(104, Math.min(124, byE - 29));
 }
 const dy286 = 124 - fy286;
 window.__rl286mu = {
  fy: fy286,
  by: H - 22 - sa2403Dy(H - 22, 20)
 };
 drawVsScreen({
  live: true,
  L: {
   tid: u,
   src: 'real',
   label: (menuSel.home ? 'HOME' : 'AWAY') + ' - YOU',
   you: true
  },
  R: {
   tid: o,
   src: 'real',
   label: (menuSel.home ? 'AWAY' : 'HOME') + ' - CPU'
  },
  mid: menuSel.home ? 'VS' : 'AT',
  roster: rosterFn,
  headY: 22,
  midY: 46,
  feetY: fy286,
  hdA: dy286 > 0 ? 'rgba(5,10,14,.9)' : null
 });
 text('QUICK GAME - REAL ROSTERS', W / 2, 5, 1, '#ffd23a', 'center', '#000');
 text('TEAM OVR ' + teamOvr(u, 'real') + ' - ' + teamOvr(o, 'real'), W / 2, 113 - dy286, 1, '#cfe', 'center');
 const by = H - 22, cx = W / 2;
 button('BACK', 6, 4, 40, 14, () => {
  screen = 'pickOpp';
 }, {
  bg: '#c9d6d9'
 });
 if (window.V17) button('GEAR', 50, 4, 40, 14, () => openGear17(u, 'matchup'), {
  bg: '#ffcc33'
 });
 button('YOUR LINEUP', Math.round(cx - 140), by, 70, 18, () => openLineup(u, 'real', 'matchup'), {
  bg: '#2cc4dc'
 });
 button('ROSTER & STATS', Math.round(cx - 66), by, 84, 18, () => rosterFn(0), {
  bg: '#8fe3f0'
 });
 button('PLAY', Math.round(cx + 22), by, 118, 18, () => newGame(menuSel.team, menuSel.opp, 'quick', menuSel.home), {
  sc: 2,
  bg: '#ffe14d'
 });
 const gh16 = !!(window.GHO16 && GHO16.on() && GH_REG[menuSel.home ? menuSel.team : menuSel.opp]);
 if (gh16) {
  button('NIGHT ONLY', W - 86, 4, 80, 13, () => {}, {
   bg: '#b9a8ff',
   fg: '#0b1a20'
  });
  return;
 }
 if (!window.__rl_no286lobby && !window.__rl_v124gb && menuSel.st28 === 'gho' && window.V28 && V28.on && V28.on('stadiums') && V28.ownSt && V28.ownSt('gho')) return;
 const nt = !!menuSel.night;
 button('DAY', W - 86, 4, 38, 13, () => {
  menuSel.night = false;
 }, {
  bg: !nt ? '#ffe14d' : '#3a4a55',
  fg: !nt ? '#0b1a20' : '#cfe'
 });
 button('NIGHT', W - 46, 4, 40, 13, () => {
  menuSel.night = true;
 }, {
  bg: nt ? '#b9a8ff' : '#3a4a55',
  fg: nt ? '#0b1a20' : '#cfe'
 });
}

function drawMenu() {
 const {L: L, bx: bx, bw: bw} = lobbyBounds(), modal = !!lobby.card;
 bgStripes();
 rect(L, 0, W - L, H, 'rgba(0,0,0,.35)');
 drawLobbyLeft(L, !modal);
 rect(L, 0, 2, H, '#05080b');
 const tcx = bx + bw / 2, ty = 4 + Math.round(Math.sin(menuT * 2) * 1);
 const tw = textW('BAGGA ', 3) + textW('LAX', 3), tx = Math.round(tcx - tw / 2);
 text('BAGGA', tx, ty, 3, '#2cc4dc', 'left', '#000');
 text('LAX', tx + textW('BAGGA ', 3), ty, 3, '#ffffff', 'left', '#000');
 const top = 30, bottom = H - 19;
 if (tutGate) {
  const lock = lbl => () => {
   menuMsg = {
    s: 'FINISH THE TUTORIAL FIRST',
    t: 1.8
   };
   SFX.bad && SFX.bad();
  };
  const rows = [ [ {
   label: 'START TUTORIAL',
   fn: () => {
    tutAsk = false;
    startTutorial();
   },
   big: true,
   sc: 2,
   bg: '#7dff7a'
  } ], [ {
   label: 'SKIP TUTORIAL',
   fn: () => {
    tutAsk = true;
   },
   bg: '#ffe14d'
  } ], [ {
   label: 'QUICK GAME (LOCKED)',
   fn: lock(),
   bg: '#5a6670'
  } ], [ {
   label: 'SEASON (LOCKED)',
   fn: lock(),
   bg: '#5a6670'
  } ], [ {
   label: 'PLAYMAKER (LOCKED)',
   fn: lock(),
   bg: '#5a6670'
  } ], [ {
   label: 'HOW TO PLAY',
   fn: () => {
    screen = 'help';
   },
   bg: '#c9d6d9'
  } ] ];
  const bars = layoutBars(rows, bx, bw, top + 10, bottom);
  text('FINISH THE TUTORIAL TO UNLOCK', tcx, top + 1, 1, '#ffe14d', 'center', '#000');
  for (const b of bars) menuBar(b, !modal && !tutAsk);
  const lastY = bars[bars.length - 1].y + bars[bars.length - 1].h;
  if (menuMsg) {
   menuMsg.t -= 1 / 60;
   rect(bx, Math.min(lastY + 4, H - 26), bw, 12, 'rgba(0,0,0,.8)');
   text(menuMsg.s, tcx, Math.min(lastY + 4, H - 26) + 3, 1, '#ff9a8a', 'center');
   if (menuMsg.t <= 0) menuMsg = null;
  }
  rect(2, H - 11, 47, 9, 'rgba(0,0,0,.45)');
  text('V40.1.4', 4, H - 9, 1, '#7dff7a');
  if (modal) drawLobbyCard(); else drawMuteBtn();
  if (tutAsk) drawTutAsk();
  return;
 }
 const hasSeason = season && !(season.phase === 'done' && season.seen);
 const bars = layoutBars(menuBars(hasSeason), bx, bw, top, bottom);
 lobby.bars = bars.map(b => ({
  label: b.label,
  x: b.x,
  y: b.y,
  w: b.w,
  h: b.h
 }));
 for (const b of bars) menuBar(b, !modal && !ASK22);
 text('QUICK ' + record.w + '-' + record.l + '  TITLES ' + LS.get('titles', 0), bx, H - 10, 1, '#cfe');
 if (menuMsg) {
  menuMsg.t -= 1 / 60;
  rect(bx, H - 26, bw, 12, 'rgba(0,0,0,.8)');
  text(menuMsg.s, tcx, H - 23, 1, '#ff9a8a', 'center');
  if (menuMsg.t <= 0) menuMsg = null;
 }
 rect(2, H - 11, 47, 9, 'rgba(0,0,0,.45)');
 text('V40.1.4', 4, H - 9, 1, '#7dff7a');
 if (window.V17) try {
  V17.drawHome(L, modal || !!ASK22);
 } catch (e) {
  console.error(e);
 }
 if (window.V20) try {
  V20.drawHome(bars, modal || !!ASK22);
 } catch (e) {
  console.error(e);
 }
 if (modal) drawLobbyCard(); else if (!(window.V17 && V17.modal())) drawMuteBtn();
 drawAsk22();
 if (window.TOUR17) try {
  TOUR17.draw(modal || !!ASK22);
 } catch (e) {
  console.error(e);
 }
}

function openGear17(tid, back) {
 if (!tid || !window.V17) return;
 const c26 = !!(SZ_REG[tid] && SZ_REG[tid].col26 && SZ_REG[tid].mine);
 if (c26) tid = SZ_REG[tid].szBase;
 const S = season, szn = !c26 && !!(SZ_REG[tid] && SZ_REG[tid].mine) && S && S.team, wt = window.__w172pick && window.__w172pick === tid;
 GEAR17 = {
  tid: szn ? S.team : tid,
  src: szn ? 'season' : 'real',
  back: back,
  kind: szn ? 'main' : wt ? 'world' : 'match'
 };
 if (GEAR17.kind === 'match' && V17.setMTeam && !no2314()) V17.setMTeam(tid);
 lobby.card = null;
 screen = 'gear17';
}

function drawGear17() {
 if (!GEAR17) {
  screen = 'menu';
  return;
 }
 const {L: L, bx: bx, bw: bw} = lobbyBounds();
 bgStripes();
 rect(L, 0, W - L, H, 'rgba(0,0,0,.35)');
 drawLobbyLeft(L, !lobby.card);
 rect(L, 0, 2, H, '#05080b');
 const cx = bx + bw / 2, k = GEAR17.kind;
 text('GEAR', cx, 6, 2, '#ffe14d', 'center', '#000');
 text(T(GEAR17.tid) ? T(GEAR17.tid).name : '', cx, 22, 1, '#ffffff', 'center');
 const lines = k === 'main' ? [ 'YOUR SEASON TEAM:', 'SAME GEAR AS THE HOME SCREEN.', 'CHANGES STAY ON THEM.' ] : k === 'world' ? [ 'YOUR WORLD GAMES TEAM:', 'SAME GEAR AS THE HOME SCREEN.', 'CHANGES STAY ON THEM.' ] : !no2314() && window.V17 && V17.tequip ? V17.tequip()[GEAR17.tid] ? [ 'SAVED GEAR FOR THIS TEAM.', 'IT STAYS ON THEM UNTIL', 'YOU PICK RETURN AFTER', 'A MATCH. ITEMS ON YOUR', 'SEASON OR WORLD GAMES', 'PLAYERS ARE IN USE.' ] : [ 'FOR THIS MATCH.', 'ITEMS ON YOUR SEASON OR', 'WORLD GAMES PLAYERS ARE', 'IN USE - THEY CAN\'T GO ON.', 'AFTER THE MATCH: RETURN', 'THEM TO YOUR LOCKER ROOM', 'OR SAVE THEM TO THE TEAM.' ] : [ 'JUST FOR THIS MATCH.', 'ITEMS ON YOUR SEASON OR', 'WORLD GAMES PLAYERS ARE', 'IN USE - THEY CAN\'T GO ON.', 'EVERYTHING GOES BACK TO', 'YOUR INVENTORY AFTER', 'THE MATCH.' ];
 lines.forEach((s, i) => text(s, cx, 36 + i * 9, 1, i === 0 ? '#8fe3f0' : '#cfe', 'center'));
 if (window.V17 && !V17.itemFx() && GEAR17.back !== 'onLobby') text('ITEM EFFECTS ARE OFF: LOOKS ONLY', cx, 104, 1, '#ffb14d', 'center');
 button('DONE', Math.round(cx - 40), H - 26, 80, 18, () => {
  const b = GEAR17.back;
  GEAR17 = null;
  if (window.V17 && V17.trayClose) V17.trayClose();
  screen = b || 'menu';
  panelDirty();
 }, {
  sc: 2,
  bg: '#7dff7a'
 });
 if (window.V17) try {
  V17.drawHome(L, !!lobby.card, {
   gearOnly: true,
   kind: k
  });
 } catch (e) {
  console.error(e);
 }
 if (lobby.card) drawLobbyCard();
}

function drawMuteBtn() {
 const x = W - 16, y = H - 15 - sa2403Dy(H - 18, 15);
 let hy = y - 3, hh = 15;
 if (!window.__rl_no281mute && !window.__rl_v124gb) for (const s of uiSpecs) {
  if (!s.key.startsWith(screenKey() + '|') || s.label === 'MUTE' || s.x + s.w <= x - 3 || s.x >= x + 14) continue;
  const bot = s.y + s.h;
  if (s.y < hy && bot > hy && bot <= hy + hh - 8) {
   hh -= bot - hy;
   hy = bot;
  }
 }
 hit('MUTE', x - 3, hy, 17, hh, () => {
  muted = !muted;
  LS.set('muted', muted);
  if (!muted) {
   audioInit();
   SFX.tap();
  }
 });
 rect(x, y, 13, 12, 'rgba(0,0,0,.5)');
 rect(x + 2, y + 4, 2, 4, '#fff');
 rect(x + 4, y + 3, 1, 6, '#fff');
 rect(x + 5, y + 2, 1, 8, '#fff');
 if (muted) {
  line(x + 7, y + 3, x + 11, y + 8, '#ff4a3a');
  line(x + 11, y + 3, x + 7, y + 8, '#ff4a3a');
 } else {
  rect(x + 8, y + 4, 1, 4, '#fff');
  rect(x + 10, y + 3, 1, 6, '#fff');
 }
}

function drawHelp() {
 bgStripes(true);
 text('HOW TO PLAY', W / 2, 8, 2, '#2cc4dc', 'center', '#000');
 const colA = [ [ '#ffe14d', 'MOVING (BALL CARRIER)' ], [ '#fff', 'LEFT THUMB = INVISIBLE JOYSTICK:' ], [ '#fff', 'PUT IT DOWN ANYWHERE + DRAG, HE' ], [ '#fff', 'RUNS THAT WAY (ANY ANGLE). FARTHER' ], [ '#fff', '= FASTER. LET GO = STOP.' ], [ '#fff', 'CUT YOUR THUMB HARD = A DODGE.' ], [ '#7dff7a', 'PLAYBOOK (TOP LEFT) = RUN YOUR PLAYS.' ], [ '', '' ], [ '#ffe14d', 'PASS' ], [ '#fff', 'TAP ANY TEAMMATE. GREEN RING = OPEN.' ], [ '#fff', 'DRIVE AND THE D SLIDES - HIT THE' ], [ '#fff', 'GUY THEY LEFT.' ], [ '#7dff7a', 'SWIPE FROM A TEAMMATE = HE CUTS.' ], [ '', '' ], [ '#ffe14d', 'FACEOFFS' ], [ '#fff', '3-2-1, MASH THE BUTTON, PUSH ON WHISTLE.' ] ];
 const colB = [ [ '#ffe14d', 'SHOOT (ON THE REAL GOAL)' ], [ '#fff', 'TOUCH THE GOAL WHERE YOU WANT IT:' ], [ '#fff', 'BACK OF NET = HIGH, FRONT = LOW,' ], [ '#fff', 'UP = LEFT POST, DOWN = RIGHT.' ], [ '#fff', 'HOLD LONGER = HARDER. LET GO = FIRE.' ], [ '#fff', 'THEIR BALL: WATCH YOUR D (SKIP >).' ], [ '', '' ], [ '#ffe14d', 'RULES' ], [ '#fff', '20 SEC SHOT CLOCK, 4 QUARTERS.' ], [ '#fff', 'RED RING = DOUBLE TEAM. PASS!' ], [ '#fff', 'STANDING STILL UNDER PRESSURE' ], [ '#fff', 'GETS YOU CHECKED = GROUND BALL:' ], [ '#7dff7a', 'RUN THE BLUE-RING GUY OVER IT.' ], [ '#fff', 'MISS WIDE = CHASE. CLOSEST TO THE' ], [ '#fff', 'BALL WHEN IT GOES OUT GETS IT.' ] ];
 let y = 28;
 for (const [c, s] of colA) {
  if (c) text(s, 10, y, 1, c);
  y += 8;
 }
 y = 28;
 for (const [c, s] of colB) {
  if (c) text(s, W / 2 + 6, y, 1, c);
  y += 8;
 }
 button('BACK', W / 2 - 40, H - 26, 80, 20, () => {
  screen = 'menu';
 }, {
  sc: 1
 });
}

let gridNA16 = false;

let gridWorld16 = false;

let gridCol2504 = false;

const on2504g = () => !window.__rl_no2504 && !window.__rl_v124gb;

let qpc26El = null, qpc26Seen = false, qpc26Key = '', qpc26Pick = null;

const onQpc26 = () => !window.__rl_noqpcol26 && !!(window.COL25 && COL25.qpFill26);

function qpc26Show(onPick, opts, y0, by) {
 if (!qpc26El) {
  qpc26El = document.createElement('div');
  qpc26El.id = 'qpc26';
  ui.appendChild(qpc26El);
  qpc26El.addEventListener('touchmove', e => {
   e.stopPropagation();
  }, {
   passive: true
  });
 }
 qpc26Seen = true;
 qpc26Pick = onPick;
 const key = screenKey() + '|' + (opts.exclude || '') + '|' + (opts.only ? opts.only.join(',') : '') + (window.V33 && V33.sig ? V33.sig() : '');
 if (key !== qpc26Key) {
  qpc26Key = key;
  qpc26El.textContent = '';
  COL25.qpFill26(qpc26El, opts.exclude, id => {
   watchScreen();
   if (qpc26Pick) qpc26Pick(id);
   watchScreen();
  }, opts.only);
  qpc26El.scrollTop = 0;
 }
 let ya = y0, yb = by - 3;
 if (SA2403B) {
  ya = sa2403By(ya);
  yb = sa2403By(yb);
 } else if (!window.__rl_noqpfit26) yb = by - sa2403Dy(by, 21) - 3;
 const st = 'display:block;left:' + (8 / W * 100).toFixed(3) + '%;top:' + (ya / H * 100).toFixed(3) + '%;width:' + ((W - 16) / W * 100).toFixed(3) + '%;height:' + ((yb - ya) / H * 100).toFixed(3) + '%';
 let st2 = st + (!window.__rl_noqpfit26 && (DD2314 || DDC26) ? ';visibility:hidden' : '');
 if (no32qpOk() && !window.__rl_noqpfit26 && (DD2314 || DDC26) && dd32Y != null && dd32Y - 2 > ya + 20) {
  st2 = 'display:block;left:' + (8 / W * 100).toFixed(3) + '%;top:' + (ya / H * 100).toFixed(3) + '%;width:' + ((W - 16) / W * 100).toFixed(3) + '%;height:' + ((Math.min(yb, dd32Y - 2) - ya) / H * 100).toFixed(3) + '%;pointer-events:none';
 }
 if (qpc26El.dataset.st !== st2) {
  qpc26El.style.cssText = st2;
  qpc26El.dataset.st = st2;
 }
}

function qpc26Sync() {
 if (!qpc26El) return;
 if (!qpc26Seen && qpc26El.dataset.st !== 'none') {
  qpc26El.style.cssText = 'display:none';
  qpc26El.dataset.st = 'none';
  qpc26Key = '';
  qpc26Pick = null;
 }
 qpc26Seen = false;
}

const CITY32 = {
 'NEW YORK': 'NY',
 'LONG ISLAND': 'LI',
 'LOS ANGELES': 'LA',
 'SAN FRANCISCO': 'SF',
 'SAN DIEGO': 'SD',
 'SAN JOSE': 'SJ',
 'NEW JERSEY': 'NJ',
 'NEW ENGLAND': 'NE',
 'LAS VEGAS': 'LV',
 'KANSAS CITY': 'KC',
 'TAMPA BAY': 'TB',
 'ST LOUIS': 'STL',
 'ST. LOUIS': 'STL',
 PHILADELPHIA: 'PHI',
 BOSTON: 'BOS',
 [__x("REVOVkVS")]: 'DEN',
 CHICAGO: 'CHI',
 ROCHESTER: 'ROC',
 DALLAS: 'DAL',
 HAMILTON: 'HAM',
 CHARLOTTE: 'CLT',
 ATLANTA: 'ATL',
 CHESAPEAKE: 'CHES',
 CAROLINA: 'CAR',
 TORONTO: 'TOR',
 BALTIMORE: 'BAL',
 WASHINGTON: 'WSH',
 HOUSTON: 'HOU',
 MINNESOTA: 'MIN',
 PANTHER: 'PAN',
 CALIFORNIA: 'CA',
 [__x("TUFSWUxBTkQ=")]: 'MD',
 FLORIDA: 'FL',
 OHIO: 'OH',
 [__x("VVRBSA==")]: 'UT',
 CONNECTICUT: 'CT',
 TEXAS: 'TX',
 ARIZONA: 'AZ',
 GEORGIA: 'GA',
 [__x("VklSR0lOSUE=")]: 'VA',
 COLORADO: 'CO',
 MASSACHUSETTS: 'MA',
 PENNSYLVANIA: 'PA',
 [__x("TUlDSElHQU4=")]: 'MI'
};

function on32tile() {
 return !window.__rl_no32tile && !window.__rl_v124gb;
}

function miniW32(s, k) {
 const cell = Math.max(1, Math.round((k || .65) * RR)) / RR;
 return String(s).length * 4 * cell - cell;
}

function cityShort32(tm, up) {
 const d = window.N31 && N31.DEF && N31.DEF.teams && N31.DEF.teams[tm.szBase || tm.id], w = up.split(/\s+/).filter(Boolean);
 let city = null, rest = null;
 if (d && d.name) {
  const dc = String(d.name).toUpperCase().trim();
  if (dc && up.indexOf(dc + ' ') === 0) {
   city = dc;
   rest = up.slice(dc.length + 1);
  }
 }
 if (city == null) {
  if (w.length < 2) return null;
  city = w.slice(0, -1).join(' ');
  rest = w[w.length - 1];
 }
 const ws = city.split(/\s+/), cand = ws.length > 1 ? [ CITY32[city], ws.map(x => x[0]).join(''), ws.map(x => x[0] + '.').join(''), ws.map(x => x.slice(0, 2)).join('') ] : [ CITY32[city], city.slice(0, 3), city.slice(0, 4), city.slice(0, 3) + '.', city.slice(0, 5) ];
 const sub = window.N31 && N31.on && N31.sub ? N31.sub : s => s;
 for (const ab of cand) {
  if (!ab || ab === city) continue;
  const s = ab + ' ' + rest;
  if (sub(s) === s && sub(ab) === ab) return s;
 }
 return null;
}

function tileNames32(list, college) {
 const up = t => String(t.name || t.id).toUpperCase().replace(/\s+/g, ' ').trim(), cnt = {}, out = {}, seen = {};
 for (const t of list) cnt[up(t)] = (cnt[up(t)] || 0) + 1;
 const ord = list.slice().sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
 for (const t of ord) {
  const n = up(t);
  if (cnt[n] < 2) {
   out[t.id] = n;
   continue;
  }
  const pro = !college && !world32(t) && TEAMS.some(x => x.id === t.id), d = window.N31 && N31.DEF && N31.DEF.teams && N31.DEF.teams[t.id];
  let tag = pro && d && d.grp && window.N31 && N31.lg ? N31.lg(d.grp).a : '';
  if (!tag || seen[n + ' ' + tag]) {
   seen[n] = (seen[n] || 0) + 1;
   tag = String(seen[n]);
  }
  seen[n + ' ' + tag] = 1;
  out[t.id] = n + ' ' + tag;
 }
 return out;
}

function world32(tm) {
 const d = window.N31 && N31.DEF && N31.DEF.teams && N31.DEF.teams[tm.szBase || tm.id];
 return d ? d.grp === 'WORLD' : !TEAMS.some(x => x.id === (tm.szBase || tm.id));
}

function tileFit32(tm, name, w) {
 const sh = world32(tm) ? null : cityShort32(tm, name), c = [ name ].concat(sh ? [ sh ] : []);
 for (const k of [ 0, .65, .5 ]) for (const s of c) if ((k ? miniW32(s, k) : textW(s)) <= w) return {
  s: s,
  k: k
 };
 if (!window.__rl_no331tile && !window.__rl_v124gb) {
  const s0 = String(sh || name).replace(/\s+$/, '');
  for (let n = s0.length - 1; n >= 1; n--) {
   const s = s0.slice(0, n).replace(/[\s.]+$/, '') + '..';
   if (miniW32(s, .5) <= w) return {
    s: s,
    k: .5,
    clip: 1,
    cut: 1
   };
  }
  return {
   s: '..',
   k: .5,
   clip: 1,
   cut: 1
  };
 }
 return {
  s: sh || name,
  k: .5,
  clip: 1
 };
}

function tileText32(f, cx, cy, col) {
 if (!f.k) text(f.s, cx, cy, 1, col, 'center'); else {
  const cell = Math.max(1, Math.round(f.k * RR)) / RR;
  textMini(f.s, cx, cy + Math.round((5 - 5 * cell) / 2 * RR) / RR, col, f.k);
 }
}

function colGrid2504(onPick, opts) {
 if (onQpc26()) {
  const by = H - 27, wrap = id => {
   const prev = LS.get('team', 'ATL');
   onPick(id);
   LS.set('team', prev);
  };
  qpc26Show(wrap, opts, 25, by);
  if (opts.extra) opts.extra(by);
  button('BACK', 8, by, 56, 19, opts.back || (() => {
   screen = 'menu';
  }), {
   bg: '#c9d6d9'
  });
  return;
 }
 const g = window.COL25 && COL25.groups ? COL25.groups() : {}, list = (g.COLLEGE || []).map(id => T(id)).filter(t => t && t.id !== opts.exclude && (!opts.only || opts.only.includes(t.id))).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
 const cols = 11, rows = Math.max(1, Math.ceil(list.length / cols)), gap = 2, x0 = 8, y0 = 25, by = H - 27, cw = Math.floor((W - 16 - gap * (cols - 1)) / cols), chh = Math.max(10, Math.floor((by - 2 - y0 - gap * (rows - 1)) / rows));
 list.forEach((tm, i) => {
  const cx = x0 + i % cols * (cw + gap), cy = y0 + Math.floor(i / cols) * (chh + gap);
  hit('TEAM-' + tm.id, cx, cy, cw, chh, () => {
   const prev = LS.get('team', 'ATL');
   onPick(tm.id);
   LS.set('team', prev);
  }, tm.name);
  rect(cx, cy + 1, cw, chh, '#000');
  rect(cx, cy, cw, chh, '#1a2430');
  rect(cx, cy, cw, 2, tm.c1 || accent(tm));
  rect(cx, cy + 2, 2, chh - 2, tm.c2 || '#fff');
  const ab = tm.abbr || tm.id;
  text(textW(ab) <= cw - 3 ? ab : ab.slice(0, Math.max(2, Math.floor((cw - 3) / 4))), cx + cw / 2 + 1, cy + Math.round(chh / 2) - 2, 1, '#fff', 'center');
 });
 if (opts.extra) opts.extra(by);
 button('BACK', 8, by, 56, 19, opts.back || (() => {
  screen = 'menu';
 }), {
  bg: '#c9d6d9'
 });
}

function teamGrid(title, sub, onPick, opts = {}) {
 bgStripes(true);
 const fit26 = !window.__rl_noqpfit26 && !window.__rl_v124gb;
 if (!fit26) text(title, W / 2, 4, 2, '#fff', 'center', '#000');
 if (sub) text(sub, W / 2, 16, 1, '#8fe3f0', 'center');
 const na = !!opts.world && !opts.pool && gridNA16 && !!(window.GHO16 && GHO16.on());
 const cv4 = !!opts.col2504 && !!opts.world && !opts.pool && on2504g() && !!(window.COL25 && COL25.groups), cl = cv4 && !na && gridCol2504;
 const wv = !na && !cl && !!opts.world && gridWorld16 && WTEAMS.length > 0;
 qpcs26Tab.cl = !!cl;
 qpcs26Tab.cv = !!cv4;
 if (fit26) {
  const tabs = opts.world && WTEAMS.length, g16t = !opts.pool && !!(window.GHO16 && GHO16.on()), tl = !tabs ? W : cv4 ? (g16t ? W - 34 : W - 6) - 38 - 64 : W - 76 - (g16t ? 30 : 0);
  const L = Math.max(2, (typeof opts.titleL === 'function' ? opts.titleL(cl) : opts.titleL) || 2), R = tl - 4, w2 = textW(title, 2);
  window.__rlTitle26 = {
   title: title,
   L: L,
   R: R,
   W: W,
   w2: w2,
   mode: W / 2 - w2 / 2 >= L && W / 2 + w2 / 2 <= R ? 'c' : R - L >= w2 ? 'g' : 's1',
   w1: textW(title, 1)
  };
  if (W / 2 - w2 / 2 >= L && W / 2 + w2 / 2 <= R) text(title, W / 2, 4, 2, '#fff', 'center', '#000'); else if (R - L >= w2) text(title, Math.round((L + R) / 2), 4, 2, '#fff', 'center', '#000'); else text(title, Math.round((L + R) / 2), 6, 1, '#fff', 'center', '#000');
 }
 if (opts.col29 && typeof colGrid2504 === 'function') return colGrid2504(onPick, opts);
 if (opts.world && WTEAMS.length) {
  const g16 = !opts.pool && !!(window.GHO16 && GHO16.on()), sh = g16 ? 30 : 0;
  if (cv4) {
   const cx4 = (g16 ? W - 34 : W - 6) - 38;
   button('PRO', cx4 - 64, 3, 24, 11, () => {
    gridWorld16 = false;
    gridNA16 = false;
    gridCol2504 = false;
   }, {
    bg: !wv && !na && !cl ? '#ffe14d' : '#3a4a55',
    fg: !wv && !na && !cl ? '#0b1a20' : '#cfe'
   });
   button('WORLD', cx4 - 38, 3, 36, 11, () => {
    gridWorld16 = true;
    gridNA16 = false;
    gridCol2504 = false;
   }, {
    bg: wv ? '#7dff7a' : '#3a4a55',
    fg: wv ? '#0b1a20' : '#cfe'
   });
   button('COLLEGE', cx4, 3, 36, 11, () => {
    gridCol2504 = true;
    gridNA16 = false;
    gridWorld16 = false;
   }, {
    bg: cl ? '#ff9a3d' : '#3a4a55',
    fg: cl ? '#0b1a20' : '#cfe'
   });
  } else {
   button('PRO', W - 76 - sh, 3, 28, 11, () => {
    gridWorld16 = false;
    gridNA16 = false;
   }, {
    bg: !wv && !na ? '#ffe14d' : '#3a4a55',
    fg: !wv && !na ? '#0b1a20' : '#cfe'
   });
   button('WORLD', W - 46 - sh, 3, 40, 11, () => {
    gridWorld16 = true;
    gridNA16 = false;
   }, {
    bg: wv ? '#7dff7a' : '#3a4a55',
    fg: wv ? '#0b1a20' : '#cfe'
   });
  }
  if (g16) button('N/A', W - 34, 3, 28, 11, () => {
   gridNA16 = true;
  }, {
   bg: na ? '#b48aff' : '#3a4a55',
   fg: na ? '#0b1a20' : '#cfe'
  });
 }
 if (cl) return colGrid2504(onPick, opts);
 if (na) {
  GHO16.grid(onPick, opts);
  const by = H - 27;
  if (opts.extra) opts.extra(by);
  button('BACK', 8, by, 56, 19, opts.back || (() => {
   screen = 'menu';
  }), {
   bg: '#c9d6d9'
  });
  return;
 }
 const ct33 = !wv && !opts.pool && window.V33 && V33.proTiles ? V33.proTiles(opts) : [];
 const list = (opts.pool || (wv ? wtList2318() : TEAMS.concat(ct33))).filter(t => t.id !== opts.exclude && (!opts.only || opts.only.includes(t.id)));
 const big = list.length <= 8;
 const cols = big ? 4 : (wv || opts.pool) && list.length <= 16 ? 4 : (wv || opts.pool || ct33.length && !wv) && list.length > 24 ? 8 : list.length > 20 ? 6 : 5, gap = big ? 4 : 3;
 const cw = Math.floor((W - 16 - gap * (cols - 1)) / cols), chh = big ? 52 : 27, x0 = 8, y0 = big ? 26 : 25;
 const nm32 = on32tile() ? tileNames32(list, false) : null;
 list.forEach((tm, i) => {
  const cx = x0 + i % cols * (cw + gap), cy = y0 + Math.floor(i / cols) * (chh + gap);
  hit('TEAM-' + tm.id, cx, cy, cw, chh, () => onPick(tm.id), tm.name);
  rect(cx, cy + 2, cw, chh, '#000');
  rect(cx, cy, cw, chh, '#1a2430');
  rect(cx, cy, cw, 2, accent(tm));
  if (big && nm32) {
   badge(tm, cx + cw / 2 - 13, cy + 5, 2);
   const f = tileFit32(tm, nm32[tm.id], cw - 4);
   window.__rlTile32 && window.__rlTile32.push({
    tab: wv ? 'WORLD' : opts.pool ? 'POOL' : 'PRO',
    id: tm.id,
    full: nm32[tm.id],
    short: f.s !== nm32[tm.id] ? f.s : null,
    s: f.s,
    k: f.k,
    clip: !!f.clip,
    cw: cw
   });
   tileText32(f, cx + cw / 2, cy + 37, '#fff');
   if (tm.city) text(tm.city.length * 4 > cw ? tm.id : tm.city, cx + cw / 2, cy + 44, 1, '#7f9aa6', 'center');
  } else if (nm32) {
   badge(tm, cx + cw / 2 - 6, cy + 3, 1);
   const f = tileFit32(tm, nm32[tm.id], cw - 2);
   window.__rlTile32 && window.__rlTile32.push({
    tab: wv ? 'WORLD' : opts.pool ? 'POOL' : 'PRO',
    id: tm.id,
    full: nm32[tm.id],
    short: f.s !== nm32[tm.id] ? f.s : null,
    s: f.s,
    k: f.k,
    clip: !!f.clip,
    cw: cw
   });
   tileText32(f, cx + cw / 2, cy + 20, '#fff');
  } else if (big) {
   badge(tm, cx + cw / 2 - 13, cy + 5, 2);
   text(tm.name, cx + cw / 2, cy + 37, 1, '#fff', 'center');
   text(tm.city.length * 4 > cw ? tm.id : tm.city, cx + cw / 2, cy + 44, 1, '#7f9aa6', 'center');
  } else {
   badge(tm, cx + cw / 2 - 6, cy + 3, 1);
   const nm = textW(tm.name) <= cw - 2 ? tm.name : tm.abbr || tm.id;
   text(nm, cx + cw / 2, cy + 20, 1, '#fff', 'center');
  }
  if (tm.ct33 && window.V33) V33.tileMark(tm, cx, cy, cw, chh);
 });
 const by = H - 27;
 if (opts.extra) opts.extra(by);
 if (window.V33 && V33.proExtra) V33.proExtra(by, opts, wv);
 button('BACK', 8, by, 56, 19, opts.back || (() => {
  screen = 'menu';
 }), {
  bg: '#c9d6d9'
 });
}

function szId15() {
 let id = LS.get('szid', null);
 if (!id || !/^SZ[A-Z0-9]{4}$/.test(id)) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  id = 'SZ';
  for (let i = 0; i < 4; i++) id += A[Math.floor(Math.random() * A.length)];
  LS.set('szid', id);
 }
 return id;
}

function szAvail15() {
 const S = season;
 return !!(S && S.rosters && S.rosters[S.team] && S.phase !== 'draft' && TEAMS.some(t => t.id === S.team));
}

function szLabel15() {
 return szAvail15() ? 'SEASON ' + TEAMS.find(t => t.id === season.team).name : null;
}

function szBuild15() {
 if (!szAvail15()) return null;
 const S = season, base = TEAMS.find(t => t.id === S.team);
 const all = S.rosters[S.team].filter(id => PP(id)), healthy = all.filter(id => !injOf(id)), ids = healthy.length >= 12 ? healthy : all;
 let bo = {};
 try {
  window.PRAC18_SKIP = true;
  bo = boostFor14(S) || {};
 } finally {
  window.PRAC18_SKIP = false;
 }
 const boost = {};
 for (const pid of ids) if (bo[pid]) boost[pid] = bo[pid];
 const sn = seasonNums15() || {}, nums = {};
 for (const pid of ids) nums[pid] = sn[pid] != null ? sn[pid] : jerseyNo(PP(pid));
 const slu = S.lineups && S.lineups[S.team], lu = slu && lineupValid(slu, ids) ? slu : null;
 return szRegister15({
  id: szId15(),
  base: base.id,
  name: 'SEASON ' + base.name,
  ids: ids,
  boost: boost,
  nums: nums,
  lu: lu
 }, true);
}

function szRegister15(d, mine) {
 if (!d || !/^SZ[A-Z0-9]{4}$/.test(String(d.id || ''))) return null;
 const base = TEAMS.find(t => t.id === d.base) || qpcs26Base(d);
 if (!base) return null;
 const ids = (d.ids || []).filter(id => PP(id));
 if (ids.length < 12) return null;
 const tm = Object.assign({}, base, {
  id: d.id,
  name: String(d.name || 'SEASON ' + base.name).toUpperCase().slice(0, 24),
  roster: ids,
  sz: true,
  szBase: base.id,
  boost: d.boost || {},
  nums: d.nums || {},
  szLu: d.lu || null,
  lg: 'SEASON TEAM',
  era: '',
  mine: !!mine
 });
 if (base.col25) {
  tm.col26 = true;
  tm.lg = 'COLLEGE SEASON';
 }
 if (!mine && !no2314() && (d.arch || szIsArch2314(d.id))) tm.arch2314 = true;
 SZ_REG[d.id] = tm;
 return tm;
}

function szPayload15(tid) {
 const t = SZ_REG[tid];
 if (!t) return null;
 return Object.assign({
  id: t.id,
  base: t.szBase,
  name: t.name,
  ids: t.roster,
  boost: t.boost,
  nums: t.nums,
  lu: t.szLu
 }, t.col26 ? {
  col26: 1
 } : {});
}

function szButton15(by, onPick) {
 const lab = szLabel15();
 if (!lab) return;
 const w = Math.min(W - 80, textW(lab) + 16);
 button(lab, 70, by, w, 19, () => {
  const t = szBuild15();
  if (t) onPick(t.id);
 }, {
  bg: '#ffd23a'
 });
}

function szArchList2314() {
 const a = LS.get('sz2314', null);
 return Array.isArray(a) ? a.filter(d => d && /^SZ[A-Z0-9]{4}$/.test(String(d.id || '')) && TEAMS.some(t => t.id === d.base)) : [];
}

function wgArchList2314() {
 const a = LS.get('wg2314', null);
 return Array.isArray(a) ? a.filter(d => d && WT_REG[d.team]) : [];
}

function szNewId2314() {
 const used = new Set(szArchList2314().map(d => d.id).concat([ LS.get('szid', '') ])), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 for (let k = 0; k < 50; k++) {
  let id = 'SZ';
  for (let i = 0; i < 4; i++) id += A[Math.floor(Math.random() * A.length)];
  if (!used.has(id)) return id;
 }
 return null;
}

function szArchPush2314(S) {
 try {
  if (no2314() || !S || !S.rosters || !S.rosters[S.team] || S.phase === 'draft' || !TEAMS.some(t => t.id === S.team)) return null;
  const ids = S.rosters[S.team].filter(id => PP(id));
  if (ids.length < 12) return null;
  const id = szNewId2314();
  if (!id) return null;
  let bo = {};
  try {
   window.PRAC18_SKIP = true;
   bo = (season === S ? boostFor14(S) : null) || {};
  } catch (e) {
   bo = {};
  } finally {
   window.PRAC18_SKIP = false;
  }
  const boost = {};
  for (const pid of ids) if (bo[pid]) boost[pid] = bo[pid];
  const sn = (season === S ? seasonNums15() : null) || {}, nums = {};
  for (const pid of ids) nums[pid] = sn[pid] != null ? sn[pid] : jerseyNo(PP(pid));
  const slu = S.lineups && S.lineups[S.team], lu = slu && lineupValid(slu, ids) ? slu : null;
  const list = szArchList2314(), k = list.filter(d => d.base === S.team).length + 1, base = TEAMS.find(t => t.id === S.team);
  const d = {
   id: id,
   base: S.team,
   name: (base.name + ' SEASON' + (k > 1 ? ' ' + k : '')).slice(0, 24),
   ids: ids,
   boost: boost,
   nums: nums,
   lu: lu,
   year: S.year || null,
   arch: 1
  };
  list.push(d);
  LS.set('sz2314', list.slice(-12));
  return d;
 } catch (e) {
  console.error(e);
  return null;
 }
}

function wgArchPush2314(w) {
 try {
  if (no2314() || !w || !w.team || !WT_REG[w.team]) return null;
  const list = wgArchList2314();
  if (list.some(d => d.n === w.n && d.team === w.team)) return null;
  const d = {
   team: w.team,
   n: w.n || 0,
   finish: w.finish || null
  };
  list.push(d);
  LS.set('wg2314', list.slice(-12));
  return d;
 } catch (e) {
  return null;
 }
}

function szIsArch2314(id) {
 return szArchList2314().some(d => d.id === id);
}

function dd2314Entries(world) {
 const out = [];
 if (world) {
  const list = wgArchList2314(), cnt = {}, lab = t => {
   cnt[t] = (cnt[t] || 0) + 1;
   return WT_REG[t].name + ' SEASON' + (cnt[t] > 1 ? ' ' + cnt[t] : '');
  };
  for (const d of list) {
   const l = lab(d.team);
   out.push({
    label: l,
    id: d.team,
    pick: f => {
     window.__w172pick = null;
     f(d.team);
    }
   });
  }
  const wt = typeof wgTeam172 === 'function' ? wgTeam172() : null;
  if (wt) {
   const l = lab(wt);
   out.push({
    label: l,
    id: wt,
    cur: true,
    pick: f => {
     window.__w172pick = wt;
     f(wt);
    }
   });
  }
 } else {
  const list = szArchList2314(), cnt = {}, lab = b => {
   cnt[b] = (cnt[b] || 0) + 1;
   return TEAMS.find(t => t.id === b).name + ' SEASON' + (cnt[b] > 1 ? ' ' + cnt[b] : '');
  };
  for (const d of list) {
   const l = lab(d.base);
   out.push({
    label: l,
    id: d.id,
    pick: f => {
     window.__w172pick = null;
     const t = szRegister15(Object.assign({}, d, {
      name: l
     }), false);
     if (t) f(t.id);
    }
   });
  }
  if (szAvail15()) {
   const l = lab(season.team);
   out.push({
    label: l,
    id: szId15(),
    cur: true,
    pick: f => {
     window.__w172pick = null;
     const t = szBuild15();
     if (t) f(t.id);
    }
   });
  }
 }
 return out;
}

let DD2314 = null;

function szDrop2314(by, onPick) {
 const world = !!(gridWorld16 && WTEAMS.length) && !qpcs26Tab.cl;
 if (qpcs26Tab.cl && qpcs26On() && qpcs26Avail()) {
  DD2314 = null;
  qpcs26Drop(70, by, onPick);
  return;
 }
 if (qpcs26Tab.cl && no32qpOk()) {
  DD2314 = null;
  return;
 }
 const ents = dd2314Entries(world);
 if (!world && !qpcs26Tab.cv && qpcs26On() && qpcs26Avail()) {
  const x2 = ents.length ? 70 + textW('SEASON TEAMS') + 22 + 4 : 70;
  if (!ents.length) DD2314 = null; else szDrop2314a(by, onPick, world, ents);
  qpcs26Drop(x2, by, onPick);
  return;
 }
 szDrop2314a(by, onPick, world, ents);
}

function no32qpOk() {
 return !window.__rl_no32qp;
}

var dd32Y = null;

function szDrop2314a(by, onPick, world, ents) {
 dd32Y = null;
 if (!ents.length) {
  DD2314 = null;
  return;
 }
 const lab = world ? 'WORLD SEASONS' : 'SEASON TEAMS', bw = textW(lab) + 22, bg = world ? '#7dff7a' : '#ffd23a';
 button(lab, 70, by, bw, 19, () => {
  DDC26 = null;
  DD2314 = DD2314 && DD2314.world === world ? null : {
   world: world
  };
 }, {
  bg: bg
 });
 if (!window.__rl_noqpfit26 && !SA2403B) by -= sa2403Dy(by, 21);
 rect(70 + bw - 11, by + 8, 7, 1, '#0b1a20');
 rect(70 + bw - 10, by + 9, 5, 1, '#0b1a20');
 rect(70 + bw - 9, by + 10, 3, 1, '#0b1a20');
 rect(70 + bw - 8, by + 11, 1, 1, '#0b1a20');
 if (!DD2314 || DD2314.world !== world) return;
 const rh = 13, maxN = Math.max(1, Math.floor((by - 18) / rh)), show = ents.slice().reverse().slice(0, maxN);
 const lw = Math.max(bw, 12 + Math.max(...show.map(e => textW(e.label + (e.cur ? '  (NOW)' : ''))))), lx = 70, ly = by - 2 - show.length * rh;
 dd32Y = ly;
 hit('DD2314 BLOCK', 0, 0, W, H, () => {
  DD2314 = null;
 }, 'DD2314 BLOCK');
 rect(lx - 1, ly - 1, lw + 2, show.length * rh + 2, '#000');
 rect(lx, ly, lw, show.length * rh, '#14222b');
 show.slice().reverse().forEach((e, i) => {
  const y = ly + i * rh;
  hit('DD2314 ' + e.label, lx, y, lw, rh, () => {
   DD2314 = null;
   e.pick(onPick);
  }, e.label);
  rect(lx, y + rh - 1, lw, 1, 'rgba(255,255,255,.12)');
  text(e.label, lx + 5, y + 4, 1, e.cur ? world ? '#7dff7a' : '#ffe14d' : '#ffffff');
  if (e.cur) text('(NOW)', lx + 5 + textW(e.label) + 6, y + 4, 1, '#8fa6b0');
 });
}

function qpcs26On() {
 return !window.__rl_noqpcs26 && !window.__rl_v124gb && !!(window.COL25 && COL25.on && COL25.on() && COL25.cur);
}

var qpcs26Tab = {
 cl: false,
 cv: false
};

var DDC26 = null;

function qpcs26Base(d) {
 if (!d || !d.col26 || !qpcs26On()) return null;
 const b = WT_REG[d.base];
 return b && b.col25 && COL25.isCol(d.base) ? b : null;
}

function qpcs26Cur() {
 try {
  const C = qpcs26On() ? COL25.cur() : null;
  return C && C.team && WT_REG[C.team] && WT_REG[C.team].col25 ? C : null;
 } catch (e) {
  return null;
 }
}

function qpcs26Avail() {
 const C = qpcs26Cur();
 return !!(C && T(C.team).roster.filter(id => PP(id)).length >= 12);
}

function qpcs26Id() {
 let id = LS.get('szcid26', null);
 const pro = LS.get('szid', null);
 if (!id || !/^SZ[A-Z0-9]{4}$/.test(id) || id === pro || szIsArch2314(id)) {
  id = szNewId2314() || 'SZC26X';
  LS.set('szcid26', id);
 }
 return id;
}

function qpcs26OppLab() {
 const l = qpcs26Label() || '';
 return l && textW(l) + 8 <= W / 2 - 66 ? l : 'COLLEGE SEASON';
}

function qpcs26OppL(cl) {
 if (cl && qpcs26On() && qpcs26Avail()) return qpcs26Id() !== menuSel.team ? 6 + textW(qpcs26OppLab()) + 8 + 4 : 2;
 if (no32qpOk() && (cl || gridWorld16 && WTEAMS.length && !gridNA16)) return 2;
 const sl = szLabel15(), sid = szAvail15() ? szId15() : null;
 if (!sl || sid === menuSel.team) return 2;
 return 6 + textW(textW(sl) + 8 <= W / 2 - 66 ? sl : 'SEASON TEAM') + 8 + 4;
}

function qpcs26Label() {
 const C = qpcs26Cur();
 return C ? T(C.team).name + ' SEASON' : null;
}

function qpcs26Build() {
 const C = qpcs26Cur();
 if (!C) return null;
 const base = WT_REG[C.team], ids = base.roster.filter(id => PP(id));
 if (ids.length < 12) return null;
 const nums = {};
 for (const pid of ids) nums[pid] = jerseyNo(PP(pid));
 const slu = LS.get('lu_' + C.team, null), lu = slu && lineupValid(slu, ids) ? slu : null;
 const t = szRegister15({
  id: qpcs26Id(),
  base: base.id,
  name: 'SEASON ' + base.name,
  ids: ids,
  boost: {},
  nums: nums,
  lu: lu,
  col26: 1
 }, true);
 if (t) {
  try {
   t.g17 = window.V17 && V17.colGear26 ? V17.colGear26(ids, C.team) : null;
   if (!t.g17) delete t.g17;
  } catch (e) {
   console.error(e);
  }
 }
 return t;
}

function qpcs26Drop(x, by, onPick) {
 const lab = 'COLLEGE SEASONS', bw = Math.min(textW(lab) + 22, W - x - 6), bg = '#ff9a3d';
 button(lab, x, by, bw, 19, () => {
  DD2314 = null;
  DDC26 = DDC26 ? null : {
   x: x
  };
 }, {
  bg: bg
 });
 const bl = SA2403B ? by : by - sa2403Dy(by, 21);
 rect(x + bw - 11, bl + 8, 7, 1, '#0b1a20');
 rect(x + bw - 10, bl + 9, 5, 1, '#0b1a20');
 rect(x + bw - 9, bl + 10, 3, 1, '#0b1a20');
 rect(x + bw - 8, bl + 11, 1, 1, '#0b1a20');
 if (!DDC26) {
  dd32Y = null;
  return;
 }
 const l = qpcs26Label();
 if (!l) {
  DDC26 = null;
  dd32Y = null;
  return;
 }
 const rh = 13, lw = Math.min(W - x - 4, Math.max(bw, 12 + textW(l + '  (NOW)'))), ly = bl - 2 - rh;
 dd32Y = ly;
 hit('DDC26 BLOCK', 0, 0, W, H, () => {
  DDC26 = null;
 }, 'DDC26 BLOCK');
 rect(x - 1, ly - 1, lw + 2, rh + 2, '#000');
 rect(x, ly, lw, rh, '#14222b');
 hit('DDC26 ' + l, x, ly, lw, rh, () => {
  DDC26 = null;
  const t = qpcs26Build();
  if (t) onPick(t.id);
 }, l);
 text(l, x + 5, ly + 4, 1, bg);
 text('(NOW)', x + 5 + textW(l) + 6, ly + 4, 1, '#8fa6b0');
}

function drawPickTeam() {
 const m = menuSel.mode;
 if (m === 'browse') return teamGrid('TEAMS + ROSTERS', 'TAP A TEAM FOR ITS ROSTER, COACH + RATINGS', id => openRoster(id, 'real', 'pickTeam'), {
  world: true,
  col2504: !window.__rl_no286colratings && !window.__rl_v124gb
 });
 if (m === 'season') {
  return teamGrid('PLAY AS', 'ONE BIG LEAGUE - ' + TEAMS.length + ' TEAMS - PICK YOUR TEAM', id => ask2503('season', lv => {
   menuSel.team = id;
   LS.set('team', id);
   season = makeSeason(id);
   if (window.V17) season.hc17need = 1;
   if (lv != null) season.diff2503 = lv;
   LS.set('season', season);
   PS.draftPos = 'ALL';
   qseason286();
   PS.draftPos = 'ALL';
   PS.draftSel = null;
   screen = season.phase === 'draft' ? 'draft' : 'season';
   seasonTab = 0;
   panelDirty();
  }), Object.assign({
   back: () => {
    screen = 'seasonSetup';
   }
  }, window.V232 ? V232.seasonPickOpts() : {}));
 }
 teamGrid('PICK YOUR TEAM', 'QUICK GAME - REAL ROSTERS', id => {
  window.__w172pick = null;
  menuSel.team = id;
  LS.set('team', id);
  qt26(id);
  screen = 'pickOpp';
 }, {
  world: true,
  col2504: true,
  extra: by => szButton15(by, id => {
   menuSel.team = id;
   qt26(id);
   screen = 'pickOpp';
  })
 });
}

function drawPickOpp() {
 teamGrid('PICK OPPONENT', 'YOU: ' + T(menuSel.team).name, id => {
  menuSel.opp = id;
  screen = 'matchup';
  panelDirty();
 }, {
  exclude: menuSel.team,
  back: () => {
   screen = 'pickTeam';
  },
  world: true,
  col2504: true,
  titleL: cl => qpcs26OppL(cl),
  extra: by => {
   const hx = W / 2 - 66;
   button('HOME', hx, by, 46, 19, () => {
    menuSel.home = true;
   }, {
    bg: menuSel.home ? '#2cc4dc' : '#3a4a55',
    fg: menuSel.home ? '#0b1a20' : '#cfe'
   });
   button('AWAY', hx + 50, by, 46, 19, () => {
    menuSel.home = false;
   }, {
    bg: !menuSel.home ? '#2cc4dc' : '#3a4a55',
    fg: !menuSel.home ? '#0b1a20' : '#cfe'
   });
   if (qpcs26Tab.cl && qpcs26On() && qpcs26Avail()) {
    const cid = qpcs26Id(), cl0 = qpcs26Label();
    if (cid !== menuSel.team && cl0) {
     const lab = qpcs26OppLab();
     button(lab, 6, 3, textW(lab) + 8, 11, () => {
      const t = qpcs26Build();
      if (t && t.id !== menuSel.team) {
       menuSel.opp = t.id;
       screen = 'matchup';
       panelDirty();
      }
     }, {
      bg: '#ff9a3d'
     });
    }
   } else if (!(no32qpOk() && (qpcs26Tab.cl || gridWorld16 && WTEAMS.length && !gridNA16))) {
    const sl = szLabel15(), sid = szAvail15() ? szId15() : null;
    if (sl && sid !== menuSel.team) {
     const lab = textW(sl) + 8 <= W / 2 - 66 ? sl : 'SEASON TEAM';
     button(lab, 6, 3, textW(lab) + 8, 11, () => {
      const t = szBuild15();
      if (t && t.id !== menuSel.team) {
       menuSel.opp = t.id;
       screen = 'matchup';
       panelDirty();
      }
     }, {
      bg: '#ffd23a'
     });
    }
   }
   button('RANDOM', W - 76, by, 68, 19, () => {
    const ids = (gridWorld16 && WTEAMS.length ? wtList2318() : TEAMS).filter(t => t.id !== menuSel.team).map(t => t.id);
    menuSel.opp = pick(ids);
    screen = 'matchup';
    panelDirty();
   }, {
    bg: '#ffd23a'
   });
  }
 });
}

const WG_POOLS = [ 'A', 'B', 'C', 'D' ];

const WG_KO = {
 qf: 'QUARTERFINAL',
 semi: 'SEMIFINAL',
 final: 'WORLD GAMES FINAL'
};

const WG_KO_NEXT = {
 qf: 'semi',
 semi: 'final',
 final: 'done'
};

const WG_RR = [ [ [ 0, 3 ], [ 1, 2 ] ], [ [ 0, 2 ], [ 3, 1 ] ], [ [ 0, 1 ], [ 2, 3 ] ] ];

function wgOk16(w) {
 try {
  return !!w && (w.v === 16 || w.v === 2318 && !!w.pools && WG30_POOLS.every(k => Array.isArray(w.pools[k]))) && !!WT_REG[w.team] && Array.isArray(w.teams) && w.teams.every(id => WT_REG[id]) && !!w.table && Array.isArray(w.rounds);
 } catch (e) {
  return false;
 }
}

let wgame = (() => {
 const w = LS.get('wg', null);
 return wgOk16(w) ? w : null;
})();

let wgTab = 0;

function wgSave16() {
 if (wgame) LS.set('wg', wgame);
}

function wgNew16(team) {
 if (typeof wgame !== 'undefined' && wgame && !no2314()) wgArchPush2314(wgame);
 if (on2318()) return wgNew30(team);
 const ids = WT16_2318.slice(), pools = {
  A: [],
  B: [],
  C: [],
  D: []
 };
 ids.forEach((id, i) => {
  const r = Math.floor(i / 4), c = i % 4;
  pools[WG_POOLS[r % 2 ? 3 - c : c]].push(id);
 });
 const rounds = WG_RR.map(rr => {
  const gs = [];
  for (const k of WG_POOLS) for (const [a, b] of rr) if (pools[k][a] && pools[k][b]) gs.push([ pools[k][a], pools[k][b], k ]);
  return gs;
 });
 const table = {};
 for (const id of ids) table[id] = {
  w: 0,
  l: 0,
  gf: 0,
  ga: 0
 };
 return {
  v: 16,
  team: team,
  teams: ids,
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
  n: (LS.get('wgN', 0) || 0) + 1
 };
}

function wgPoolOf16(w, id) {
 for (const k of WG_POOLS) if (w.pools[k].includes(id)) return k;
 return null;
}

function wgStand16(w, k) {
 return w.pools[k].map(id => Object.assign({
  id: id
 }, w.table[id])).sort((a, b) => b.w - a.w || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || w.teams.indexOf(a.id) - w.teams.indexOf(b.id));
}

function wgApply16(w, a, b, sa, sb, label) {
 const A = w.table[a], B = w.table[b];
 if (A && B && w.phase === 'pool') {
  A.gf += sa;
  A.ga += sb;
  B.gf += sb;
  B.ga += sa;
  if (sa > sb) {
   A.w++;
   B.l++;
  } else {
   B.w++;
   A.l++;
  }
 }
 w.results.push([ a, b, sa, sb, label ]);
}

function wgSim16(a, b) {
 const keep = BOOST;
 BOOST = null;
 try {
  const A = unitPower(lineupFor(a, 'real')), B = unitPower(lineupFor(b, 'real'));
  const pa = .33 + .05 * (A.off - B.def) - .04 * B.gk + .02 * (A.fo - B.fo), pb = .33 + .05 * (B.off - A.def) - .04 * A.gk + .02 * (B.fo - A.fo);
  let sa = 0, sb = 0;
  for (let i = 0; i < 26; i++) {
   if (Math.random() < pa) sa++;
   if (Math.random() < pb) sb++;
  }
  while (sa === sb) {
   if (Math.random() < pa) sa++; else if (Math.random() < pb) sb++;
  }
  return [ sa, sb ];
 } finally {
  BOOST = keep;
 }
}

function wgNext16(w) {
 if (!w || w.elim || w.phase === 'done') return null;
 if (w.v === 2318) {
  const m = wgMine30(w);
  return m ? {
   opp: m.g[0] === w.team ? m.g[1] : m.g[0],
   home: m.g[0] === w.team,
   label: m.label,
   g: m.g
  } : null;
 }
 if (w.phase === 'pool') {
  const g = (w.rounds[w.round] || []).find(x => x[0] === w.team || x[1] === w.team);
  if (!g) return null;
  return {
   opp: g[0] === w.team ? g[1] : g[0],
   home: g[0] === w.team,
   label: 'POOL ' + g[2] + ' - GAME ' + (w.round + 1) + ' OF 3',
   g: g
  };
 }
 const g = w.ko && w.ko.games.find(x => x[0] === w.team || x[1] === w.team);
 if (!g) return null;
 return {
  opp: g[0] === w.team ? g[1] : g[0],
  home: g[0] === w.team,
  label: WG_KO[w.ko.round],
  g: g
 };
}

function wgNight16(w, nx) {
 return !!nx && seedOf('wgtod|' + w.n + '|' + nx.label + '|' + [ w.team, nx.opp ].sort().join('-')) % 5 < 2;
}

function wgStatus16(w) {
 if (!w) return '';
 if (w.phase === 'done') return w.champ === w.team ? 'WORLD CHAMPIONS!' : (w.finish || 'OUT') + ' - ' + T(w.champ).name + ' WON IT';
 if (w.elim) return w.finish || 'KNOCKED OUT';
 if (w.v === 2318) return wgStatus30(w);
 if (w.phase === 'pool') return 'POOL ' + wgPoolOf16(w, w.team) + ' - ROUND ' + (w.round + 1) + ' OF 3';
 return WG_KO[w.ko.round];
}

function wgKoStart16(w) {
 const s = {};
 for (const k of WG_POOLS) s[k] = wgStand16(w, k).map(r => r.id);
 w.phase = 'ko';
 w.ko = {
  round: 'qf',
  games: [ [ s.A[0], s.B[1] ], [ s.C[0], s.D[1] ], [ s.B[0], s.A[1] ], [ s.D[0], s.C[1] ] ],
  br: {
   qf: [],
   semi: [],
   final: []
  }
 };
 w.ko.br.qf = w.ko.games.map(g => [ g[0], g[1], null, null ]);
 if (!w.ko.games.some(g => g.includes(w.team))) {
  w.elim = true;
  w.finish = 'OUT IN POOL ' + wgPoolOf16(w, w.team);
  wgKoRest16(w);
 }
}

function wgKoRound16(w, decided) {
 const K = w.ko, winners = [], lab = WG_KO[K.round];
 K.games.forEach((g, i) => {
  let sa, sb;
  if (decided && decided.i === i) {
   sa = decided.sc[0];
   sb = decided.sc[1];
  } else {
   [sa, sb] = wgSim16(g[0], g[1]);
  }
  wgApply16(w, g[0], g[1], sa, sb, lab);
  K.br[K.round][i] = [ g[0], g[1], sa, sb ];
  winners.push(sa > sb ? g[0] : g[1]);
  if (g.includes(w.team) && !w.elim && (sa > sb ? g[0] : g[1]) !== w.team) {
   w.elim = true;
   w.finish = 'OUT IN THE ' + (K.round === 'qf' ? 'QUARTERS' : K.round === 'semi' ? 'SEMIS' : 'FINAL');
  }
 });
 if (K.round === 'final') {
  w.champ = winners[0];
  K.round = 'done';
  K.games = [];
  w.phase = 'done';
  if (w.champ === w.team) {
   w.finish = 'WORLD CHAMPIONS';
   if (!(window.V33 && V33.np(w))) LS.set('wgTitles', (LS.get('wgTitles', 0) || 0) + 1);
  }
  return;
 }
 K.round = WG_KO_NEXT[K.round];
 K.games = [];
 for (let i = 0; i < winners.length; i += 2) K.games.push([ winners[i], winners[i + 1] ]);
 K.br[K.round] = K.games.map(g => [ g[0], g[1], null, null ]);
}

function wgKoRest16(w) {
 let k = 0;
 while (w.phase === 'ko' && k++ < 5) wgKoRound16(w);
}

function wgPlayed16(w, sc) {
 const nx = wgNext16(w);
 if (!nx) return;
 if (w.v === 2318) {
  wgPlayed30(w, sc);
  w.gp = (w.gp || 0) + 1;
  if (w.phase === 'done') LS.set('wgN', w.n);
  wgSave16();
  return;
 }
 const mine = nx.home ? [ sc[0], sc[1] ] : [ sc[1], sc[0] ], [a, b] = nx.g;
 if (w.phase === 'pool') {
  for (const g of w.rounds[w.round]) {
   if (g === nx.g) wgApply16(w, a, b, mine[0], mine[1], nx.label); else {
    const [sa, sb] = wgSim16(g[0], g[1]);
    wgApply16(w, g[0], g[1], sa, sb, 'POOL ' + g[2] + ' - GAME ' + (w.round + 1));
   }
  }
  w.round++;
  if (w.round >= w.rounds.length) wgKoStart16(w);
 } else {
  wgKoRound16(w, {
   i: w.ko.games.indexOf(nx.g),
   sc: mine
  });
  if (w.elim) wgKoRest16(w);
 }
 w.gp = (w.gp || 0) + 1;
 if (w.phase === 'done') LS.set('wgN', w.n);
 wgSave16();
}

function wgRecord16(win, sc) {
 const w = wgame;
 if (!w) return;
 wgPlayed16(w, sc);
}

function wgSimMine16() {
 const w = wgame, nx = wgNext16(w);
 if (!nx) return null;
 const [u, o] = wgSim16(w.team, nx.opp);
 wgPlayed16(w, [ u, o ]);
 return [ u, o ];
}

function wgGame16(G) {
 const w = wgame;
 if (!w || !G || G.mode !== 'world' || G.tutorial) return;
 const V = V14(G), played = new Set(V.lu0 || []);
 const lu = G.lu && G.lu[0];
 if (lu) for (const id of [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ]) if (id) played.add(id);
 for (const id in V.box) played.add(id);
 w.stats = w.stats || {};
 for (const id of played) {
  if (!PP(id)) continue;
  const s = w.stats[id] || (w.stats[id] = blankStats()), b = V.box[id] || {};
  s.gp++;
  for (const k of STAT_KEYS) s[k] += b[k] || 0;
 }
}

function wgPlay16() {
 const w = wgame, nx = wgNext16(w);
 if (!nx) return;
 newGame(w.team, nx.opp, 'world', nx.home, {
  label: nx.label,
  night: wgNight16(w, nx)
 });
}

const WG30_POOLS = [ 'A', 'B', 'C', 'D', 'E', 'F' ];

const WG30_REAL = {
 A: [ 'USA', 'CAN', 'HAU', 'AUS', 'ENG' ],
 B: [ 'JPN', 'WAL', 'FRA', 'DEN', 'UGA' ],
 C: [ 'ISR', 'PUR', 'PHI', 'CZE', 'SWE' ],
 D: [ 'JAM', 'GER', 'POL', 'NZL', 'SUI' ],
 E: [ 'ITA', 'HKG', 'SCO', 'MEX', 'AUT' ],
 F: [ 'IRL', 'NED', 'LAT', 'PER', 'KOR' ]
};

const WG30_RR = [ [ [ 0, 4 ], [ 3, 1 ] ], [ [ 3, 0 ], [ 4, 2 ] ], [ [ 0, 2 ], [ 1, 4 ] ], [ [ 1, 0 ], [ 2, 3 ] ], [ [ 4, 3 ], [ 2, 1 ] ] ];

const WG30_KO = [ [ 'c1', 'S8', 'S9', 0, 'FIRST ROUND' ], [ 'c2', 'S4', 'S13', 0, 'FIRST ROUND' ], [ 'c3', 'S5', 'S12', 0, 'FIRST ROUND' ], [ 'c4', 'S7', 'S10', 0, 'FIRST ROUND' ], [ 'c5', 'S3', 'S14', 0, 'FIRST ROUND' ], [ 'c6', 'S6', 'S11', 0, 'FIRST ROUND' ], [ 'a1', 'S15', 'S22', 0, '15TH-22ND PLACE' ], [ 'a2', 'S18', 'S19', 0, '15TH-22ND PLACE' ], [ 'a3', 'S17', 'S20', 0, '15TH-22ND PLACE' ], [ 'a4', 'S16', 'S21', 0, '15TH-22ND PLACE' ], [ 'b1', 'S23', 'S30', 0, '23RD-30TH PLACE' ], [ 'b2', 'S26', 'S27', 0, '23RD-30TH PLACE' ], [ 'b3', 'S25', 'S28', 0, '23RD-30TH PLACE' ], [ 'b4', 'S24', 'S29', 0, '23RD-30TH PLACE' ], [ 'q1', 'S1', 'Wc1', 1, 'QUARTERFINAL' ], [ 'q2', 'Wc2', 'Wc3', 1, 'QUARTERFINAL' ], [ 'q3', 'S2', 'Wc4', 1, 'QUARTERFINAL' ], [ 'q4', 'Wc5', 'Wc6', 1, 'QUARTERFINAL' ], [ 'n1', 'Lc3', 'Lc2', 1, '9TH-14TH PLACE' ], [ 'n2', 'Lc6', 'Lc5', 1, '9TH-14TH PLACE' ], [ 'a5', 'Wa1', 'Wa2', 1, '15TH-18TH PLACE' ], [ 'a6', 'Wa3', 'Wa4', 1, '15TH-18TH PLACE' ], [ 'a7', 'La1', 'La2', 1, '19TH-22ND PLACE' ], [ 'a8', 'La3', 'La4', 1, '19TH-22ND PLACE' ], [ 'b5', 'Wb1', 'Wb2', 1, '23RD-26TH PLACE' ], [ 'b6', 'Wb3', 'Wb4', 1, '23RD-26TH PLACE' ], [ 'b7', 'Lb1', 'Lb2', 1, '27TH-30TH PLACE' ], [ 'b8', 'Lb3', 'Lb4', 1, '27TH-30TH PLACE' ], [ 'f1', 'Wq1', 'Wq2', 2, 'SEMIFINAL' ], [ 'f2', 'Wq3', 'Wq4', 2, 'SEMIFINAL' ], [ 'p5', 'Q5', 'Q6', 2, '5TH PLACE GAME', 5 ], [ 'p7', 'Q7', 'Q8', 2, '7TH PLACE GAME', 7 ], [ 'n3', 'Lc1', 'Wn1', 2, '9TH-12TH PLACE' ], [ 'n4', 'Lc4', 'Wn2', 2, '9TH-12TH PLACE' ], [ 'p13', 'Ln1', 'Ln2', 2, '13TH PLACE GAME', 13 ], [ 'p15', 'Wa5', 'Wa6', 2, '15TH PLACE GAME', 15 ], [ 'p17', 'La5', 'La6', 2, '17TH PLACE GAME', 17 ], [ 'p19', 'Wa7', 'Wa8', 2, '19TH PLACE GAME', 19 ], [ 'p21', 'La7', 'La8', 2, '21ST PLACE GAME', 21 ], [ 'p23', 'Wb5', 'Wb6', 2, '23RD PLACE GAME', 23 ], [ 'p25', 'Lb5', 'Lb6', 2, '25TH PLACE GAME', 25 ], [ 'p27', 'Wb7', 'Wb8', 2, '27TH PLACE GAME', 27 ], [ 'p29', 'Lb7', 'Lb8', 2, '29TH PLACE GAME', 29 ], [ 'fin', 'Wf1', 'Wf2', 3, 'WORLD GAMES FINAL', 1 ], [ 'brz', 'Lf1', 'Lf2', 3, 'BRONZE MEDAL GAME', 3 ], [ 'p9', 'Wn3', 'Wn4', 3, '9TH PLACE GAME', 9 ], [ 'p11', 'Ln3', 'Ln4', 3, '11TH PLACE GAME', 11 ] ];

const WG30_DAYS = 4;

function wgOrd30(n) {
 const s = [ 'TH', 'ST', 'ND', 'RD' ], v = n % 100;
 return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function wgNew30(team) {
 const ids = WTEAMS.map(t => t.id), byAbbr = {};
 for (const t of WTEAMS) byAbbr[t.abbr] = t.id;
 const pools = {}, used = new Set;
 for (const k of WG30_POOLS) {
  pools[k] = WG30_REAL[k].map(a => byAbbr[a]).filter(id => id && !used.has(id));
  pools[k].forEach(id => used.add(id));
 }
 const rest = ids.filter(id => !used.has(id));
 for (const id of rest) {
  const k = WG30_POOLS.slice(1).reduce((m, q) => pools[q].length < pools[m].length ? q : m, 'B');
  pools[k].push(id);
 }
 const rounds = WG30_RR.map(rr => {
  const gs = [];
  for (const k of WG30_POOLS) for (const [a, b] of rr) if (pools[k][a] && pools[k][b]) gs.push([ pools[k][a], pools[k][b], k ]);
  return gs;
 });
 const table = {};
 for (const id of ids) table[id] = {
  w: 0,
  l: 0,
  gf: 0,
  ga: 0
 };
 const w = {
  v: 2318,
  team: team,
  teams: ids,
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
  n: (LS.get('wgN', 0) || 0) + 1
 };
 wgSkip30(w);
 return w;
}

function wgPoolOf30(w, id) {
 for (const k of WG30_POOLS) if (w.pools[k] && w.pools[k].includes(id)) return k;
 return null;
}

function wgCmp30(w) {
 return (a, b) => b.w - a.w || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || w.teams.indexOf(a.id) - w.teams.indexOf(b.id);
}

function wgStand30(w, k) {
 return (w.pools[k] || []).map(id => Object.assign({
  id: id
 }, w.table[id])).sort(wgCmp30(w));
}

function wgSeeds30(w) {
 const st = {};
 for (const k of WG30_POOLS) st[k] = wgStand30(w, k);
 const out = st.A.map(r => r.id), cmp = wgCmp30(w), others = WG30_POOLS.slice(1);
 for (let pos = 0; pos < 5; pos++) out.push(...others.map(k => st[k][pos]).filter(Boolean).sort(cmp).map(r => r.id));
 return out;
}

function wgSrc30(w, s) {
 const K = w.ko;
 let m;
 if (m = /^S(\d+)$/.exec(s)) return K.seeds[+m[1] - 1] || null;
 if (m = /^Q(\d)$/.exec(s)) {
  const ls = [ 'q1', 'q2', 'q3', 'q4' ].map(q => wgSrc30(w, 'L' + q));
  if (ls.some(x => !x)) return null;
  ls.sort((a, b) => K.seeds.indexOf(a) - K.seeds.indexOf(b));
  return ls[+m[1] - 5] || null;
 }
 if (m = /^([WL])(\w+)$/.exec(s)) {
  const r = K.res[m[2]];
  if (!r || r[2] == null) return null;
  const win = r[2] > r[3] ? r[0] : r[1];
  return m[1] === 'W' ? win : win === r[0] ? r[1] : r[0];
 }
 return null;
}

function wgDayGames30(w, d) {
 const K = w.ko, out = [];
 for (const row of WG30_KO) {
  if (row[3] !== d) continue;
  const a = wgSrc30(w, row[1]), b = wgSrc30(w, row[2]);
  if (!a || !b) continue;
  const g = K.seeds.indexOf(a) <= K.seeds.indexOf(b) ? [ a, b ] : [ b, a ];
  out.push({
   k: row[0],
   g: g,
   label: row[4],
   place: row[5] || null
  });
 }
 return out;
}

function wgMine30(w) {
 if (w.phase === 'pool') {
  const g = (w.rounds[w.round] || []).find(x => x[0] === w.team || x[1] === w.team);
  return g ? {
   g: g,
   label: 'POOL ' + g[2] + ' - GAME ' + (w.table[w.team].w + w.table[w.team].l + 1) + ' OF 4',
   pool: true
  } : null;
 }
 if (w.phase === 'ko') {
  const x = wgDayGames30(w, w.ko.day).find(q => q.g.includes(w.team));
  return x ? {
   g: x.g,
   label: x.label,
   k: x.k
  } : null;
 }
 return null;
}

function wgPoolRound30(w, mine, sc) {
 for (const g of w.rounds[w.round]) {
  if (mine && g === mine.g) wgApply16(w, g[0], g[1], sc[0], sc[1], mine.label); else {
   const [sa, sb] = wgSim16(g[0], g[1]);
   wgApply16(w, g[0], g[1], sa, sb, 'POOL ' + g[2] + ' - ROUND ' + (w.round + 1));
  }
 }
 w.round++;
 if (w.round >= w.rounds.length) {
  w.phase = 'ko';
  w.ko = {
   v: 2318,
   day: 0,
   seeds: wgSeeds30(w),
   res: {},
   place: {}
  };
 }
}

function wgKoDay30(w, mine, sc) {
 const K = w.ko;
 for (const x of wgDayGames30(w, K.day)) {
  let sa, sb;
  if (mine && x.k === mine.k) {
   sa = sc[0];
   sb = sc[1];
  } else [sa, sb] = wgSim16(x.g[0], x.g[1]);
  wgApply16(w, x.g[0], x.g[1], sa, sb, x.label);
  K.res[x.k] = [ x.g[0], x.g[1], sa, sb ];
  if (x.place) {
   const win = sa > sb ? x.g[0] : x.g[1];
   K.place[win] = x.place;
   K.place[win === x.g[0] ? x.g[1] : x.g[0]] = x.place + 1;
  }
 }
 K.day++;
 if (K.day >= WG30_DAYS) {
  const f = K.res.fin;
  w.champ = f ? f[2] > f[3] ? f[0] : f[1] : null;
  w.phase = 'done';
  const p = K.place[w.team];
  if (w.champ === w.team) {
   w.finish = 'WORLD CHAMPIONS';
   if (!(window.V33 && V33.np(w))) LS.set('wgTitles', (LS.get('wgTitles', 0) || 0) + 1);
  } else w.finish = p ? wgOrd30(p) + ' PLACE' : 'OUT';
 }
}

function wgSkip30(w) {
 let k = 0;
 while (w.phase !== 'done' && !wgMine30(w) && k++ < 20) {
  if (w.phase === 'pool') wgPoolRound30(w); else wgKoDay30(w);
 }
}

function wgPlayed30(w, sc) {
 const mine = wgMine30(w);
 if (!mine) return;
 const home = mine.g[0] === w.team, s = home ? [ sc[0], sc[1] ] : [ sc[1], sc[0] ];
 if (w.phase === 'pool') wgPoolRound30(w, mine, s); else wgKoDay30(w, mine, s);
 wgSkip30(w);
}

function wgStatus30(w) {
 if (w.phase === 'pool') return 'POOL ' + wgPoolOf30(w, w.team) + ' - GAME ' + (w.table[w.team].w + w.table[w.team].l + 1) + ' OF 4';
 const m = wgMine30(w);
 return m ? m.label : 'PLAYOFFS';
}

function drawWgPick() {
 teamGrid('PLAY WORLD GAMES', on2318() ? 'PICK YOUR COUNTRY - 6 POOLS, THEN THE PLAYOFFS + PLACEMENT GAMES' : 'PICK YOUR COUNTRY - POOLS, THEN QUARTERS, SEMIS + FINAL', id => {
  ask2503('world', lv => {
   wgame = wgNew16(id);
   if (!no286q()) qt26(id);
   if (lv != null) wgame.diff2503 = lv;
   wgTab = 0;
   wgSave16();
   screen = 'wgHub';
   panelDirty();
  });
 }, {
  pool: window.V33 && V33.wgPool ? V33.wgPool(wtList2318()) : wtList2318(),
  back: () => {
   screen = wgame ? 'wgHub' : 'menu';
  },
  extra: by => {
   if (window.V33 && V33.wgExtra) V33.wgExtra(by);
  }
 });
}

function wgAbbr16(id) {
 const t = T(id);
 return t.abbr || t.id;
}

function drawWgHub() {
 const w = wgame;
 bgStripes(true);
 if (!w) {
  screen = 'wgPick';
  return;
 }
 const me = T(w.team), row = w.table[w.team];
 rect(0, 0, W, 18, '#0b0f14');
 badge(me, 3, 1, 1);
 text(me.name + '  WORLD GAMES', 20, 3, 1, '#fff');
 text(row.w + '-' + row.l + '  ' + wgStatus16(w), 20, 10, 1, '#ffd23a');
 if (on2503() && okDiff2503(w.diff2503) != null) text('DIFFICULTY: ' + DIFF_NAMES[w.diff2503], 20 + textW(me.name + '  WORLD GAMES') + 10, 3, 1, DCOL2503[w.diff2503]);
 button('MENU', W - 44, 2, 40, 13, () => {
  screen = 'menu';
 }, {
  bg: '#c9d6d9'
 });
 button('NEW CUP', W - 96, 2, 48, 13, () => {
  screen = 'wgPick';
 }, {
  bg: '#ff9a4a'
 });
 const lw = Math.round(W * .42), cx = 6 + lw / 2;
 card(6, 24, lw, 132);
 const nx = wgNext16(w);
 if (nx) {
  const o = T(nx.opp), night = wgNight16(w, nx);
  text(nx.label, cx, 30, 1, '#ffd23a', 'center');
  badge(me, cx - 52, 42, 2);
  badge(o, cx + 26, 42, 2);
  text(nx.home ? 'VS' : 'AT', cx, 50, 2, '#fff', 'center');
  text(o.name, cx, 78, 1, '#cfe', 'center');
  text((nx.home ? 'HOME' : 'AWAY') + ' - ' + (night ? 'NIGHT' : 'DAY') + ' - OVR ' + teamOvr(w.team, 'real') + '-' + teamOvr(nx.opp, 'real'), cx, 86, 1, night ? '#b9a8ff' : '#ffe14d', 'center');
  button('PLAY', Math.round(cx - 62), 100, 60, 20, () => wgPlay16(), {
   sc: 2
  });
  button('SIM GAME', Math.round(cx + 2), 100, 60, 20, () => {
   wgSimMine16();
  }, {
   bg: '#c9d6d9'
  });
  button('ROSTER & STATS', Math.round(cx - 45), 125, 90, 14, () => openVsRoster([ [ w.team, 'world' ], [ nx.opp, 'world' ] ], 'wgHub', 0), {
   bg: '#8fe3f0'
  });
  if (w.phase === 'ko' && w.v !== 2318) text('LOSE AND YOU ARE OUT', cx, 144, 1, '#ff9a8a', 'center');
 } else {
  const champ = w.champ ? T(w.champ) : null;
  text(w.phase === 'done' ? 'WORLD GAMES OVER' : 'KNOCKED OUT', cx, 30, 1, '#ffd23a', 'center');
  if (champ) {
   badge(champ, cx - 19, 42, 3);
   text(champ.id === w.team ? 'YOU WON IT ALL!' : champ.name + ' WIN IT ALL', cx, 92, 1, champ.id === w.team ? '#ffe14d' : '#fff', 'center');
  }
  if (w.finish && w.champ !== w.team) text(w.finish, cx, 102, 1, '#ff9a8a', 'center');
  button('CHAMPION', Math.round(cx - 62), 116, 60, 18, () => {
   screen = 'wgChamp';
  }, {
   bg: '#ffe14d'
  });
  button('ROSTER & STATS', Math.round(cx + 2), 116, 60, 18, () => openVsRoster([ [ w.team, 'world' ] ], 'wgHub', 0), {
   bg: '#8fe3f0'
  });
 }
 const rx = lw + 12, rw = W - rx - 6;
 [ 'POOLS', 'BRACKET' ].forEach((tb, i) => {
  const bx = rx + i * (rw / 2);
  hit('TAB-' + tb, bx, 24, rw / 2 - 2, 12, () => {
   wgTab = i;
  }, tb);
  rect(bx, 24, rw / 2 - 2, 12, wgTab === i ? '#2cc4dc' : '#22313d');
  text(tb, bx + rw / 4 - 1, 28, 1, wgTab === i ? '#0b1a20' : '#cfe', 'center');
 });
 if (wgTab === 0 && w.v === 2318) drawWgPools30(w, rx, 40, rw); else if (wgTab === 0 && w.c33 && window.V33 && V33.drawWgPools) V33.drawWgPools(w, rx, 40, rw); else if (wgTab === 0) {
  const pw = Math.floor((rw - 4) / 2);
  WG_POOLS.forEach((k, pi) => {
   const px = rx + pi % 2 * (pw + 4), py = 40 + Math.floor(pi / 2) * 56;
   rect(px, py, pw, 52, 'rgba(10,16,22,.75)');
   text('POOL ' + k, px + 3, py + 2, 1, '#ffe14d');
   text('W-L', px + pw - 22, py + 2, 1, '#7f9aa6', 'center');
   text('+/-', px + pw - 7, py + 2, 1, '#7f9aa6', 'center');
   wgStand16(w, k).forEach((r, j) => {
    const y = py + 11 + j * 10, tm = T(r.id), mine = r.id === w.team, gd = r.gf - r.ga;
    if (mine) rect(px + 1, y - 2, pw - 2, 9, '#1f4a52');
    if (j === 2) rect(px + 1, y - 3, pw - 2, 1, '#ffd23a');
    text(j + 1, px + 3, y, 1, '#7f9aa6');
    rect(px + 9, y - 1, 5, 7, accent(tm));
    text(wgAbbr16(r.id), px + 17, y, 1, mine ? '#ffe14d' : '#fff');
    text(r.w + '-' + r.l, px + pw - 22, y, 1, '#fff', 'center');
    text((gd > 0 ? '+' : '') + gd, px + pw - 7, y, 1, gd >= 0 ? '#7dff7a' : '#ff8a7a', 'center');
   });
  });
  text(w.phase === 'pool' ? 'TOP 2 IN EACH POOL MAKE THE QUARTERFINALS' : 'POOL PLAY DONE', rx + rw / 2, 154, 1, '#8fe3f0', 'center');
 } else if (w.v === 2318) drawWgBracket30(w, rx, 40, rw); else drawWgBracket16(w, rx, 40, rw);
}

function drawWgPools30(w, x, y, wd) {
 const pw = Math.floor((wd - 8) / 3), gd0 = pw >= 60;
 WG30_POOLS.forEach((k, pi) => {
  const px = x + pi % 3 * (pw + 4), py = y + Math.floor(pi / 3) * 56;
  rect(px, py, pw, 54, 'rgba(10,16,22,.75)');
  text('POOL ' + k, px + 3, py + 2, 1, '#ffe14d');
  text('W-L', px + pw - (gd0 ? 22 : 9), py + 2, 1, '#7f9aa6', 'center');
  if (gd0) text('+/-', px + pw - 7, py + 2, 1, '#7f9aa6', 'center');
  wgStand30(w, k).forEach((r, j) => {
   const ry = py + 11 + j * 9, tm = T(r.id), mine = r.id === w.team, gd = r.gf - r.ga;
   if (mine) rect(px + 1, ry - 1, pw - 2, 8, '#1f4a52');
   if (k !== 'A' && j === 1) rect(px + 1, ry - 2, pw - 2, 1, '#ffd23a');
   text(j + 1, px + 3, ry, 1, '#7f9aa6');
   rect(px + 9, ry - 1, 4, 7, accent(tm));
   text(wgAbbr16(r.id), px + 15, ry, 1, mine ? '#ffe14d' : '#fff');
   text(r.w + '-' + r.l, px + pw - (gd0 ? 22 : 9), ry, 1, '#fff', 'center');
   if (gd0) text((gd > 0 ? '+' : '') + gd, px + pw - 7, ry, 1, gd >= 0 ? '#7dff7a' : '#ff8a7a', 'center');
  });
 });
 text(w.phase === 'pool' ? 'POOL A + 5 WINNERS + 4 BEST 2NDS = PLAYOFFS' : 'POOL PLAY DONE', x + wd / 2, y + 114, 1, '#8fe3f0', 'center');
}

function drawWgBracket30(w, x, y, wd) {
 const K = w.ko;
 if (!K) {
  [ 'PLAYOFFS AFTER POOL PLAY', 'POOL A = SEEDS 1-5', 'POOL WINNERS = SEEDS 6-10', 'BEST 4 RUNNERS-UP = SEEDS 11-14', 'SEEDS 1 + 2 SKIP THE FIRST ROUND', 'EVERYONE ELSE: 15TH-30TH GAMES', 'EVERY TEAM PLAYS FOR A PLACE' ].forEach((s, i) => text(s, x + wd / 2, y + 4 + i * 13, 1, i ? i < 6 ? '#cfe' : '#8fe3f0' : '#ffe14d', 'center'));
  return;
 }
 const cols = [ [ '1ST RD', [ 'c1', 'c2', 'c3', 'c4', 'c5', 'c6' ] ], [ 'QF', [ 'q1', 'q2', 'q3', 'q4' ] ], [ 'SEMIS', [ 'f1', 'f2' ] ], [ 'FINAL', [ 'fin' ] ] ];
 const cw = Math.floor((wd - 32) / 4), H0 = 104, plan = {};
 for (let d = 0; d < WG30_DAYS; d++) for (const q of wgDayGames30(w, d)) plan[q.k] = q.g;
 const box = (k, bx, gy, bh) => {
  rect(bx, gy, cw, bh, 'rgba(10,16,22,.8)');
  const r = K.res[k], g = r || plan[k];
  if (!g) {
   text('-', bx + cw / 2, gy + bh / 2 - 3, 1, '#55636d', 'center');
   return;
  }
  [ 0, 1 ].forEach(s => {
   const id = g[s], done = !!r, won = done && (s === 0 ? r[2] > r[3] : r[3] > r[2]), mine = id === w.team, ty = gy + 1 + s * Math.floor(bh / 2);
   rect(bx + 1, ty, 3, 7, accent(T(id)));
   text(wgAbbr16(id), bx + 6, ty + 1, 1, mine ? '#ffe14d' : done && !won ? '#6c7f8a' : '#fff');
   if (done) text(String(r[2 + s]), bx + cw - 2, ty + 1, 1, won ? '#7dff7a' : '#6c7f8a', 'right');
  });
 };
 cols.forEach(([lb, ks], ci) => {
  const cx0 = x + ci * (cw + 2), n = ks.length, slot = H0 / n, bh = Math.min(18, Math.floor(slot) - 1);
  text(lb, cx0 + cw / 2, y, 1, '#ffe14d', 'center');
  ks.forEach((k, i) => box(k, cx0, Math.round(y + 9 + slot * i + slot / 2 - bh / 2), bh));
 });
 const fx = x + 3 * (cw + 2);
 text('BRONZE', fx + cw / 2, y + 86, 1, '#c98a4a', 'center');
 box('brz', fx, y + 94, 18);
 const chx = x + 4 * (cw + 2);
 text('CHAMP', chx + 14, y, 1, '#ffe14d', 'center');
 if (w.champ) badge(T(w.champ), chx + 2, y + 9 + H0 / 2 - 22, 2); else text('?', chx + 14, y + 9 + H0 / 2 - 4, 2, '#55636d', 'center');
}

function drawWgBracket16(w, x, y, wd) {
 const cols = [ [ 'QF', 'qf', 4 ], [ 'SEMIS', 'semi', 2 ], [ 'FINAL', 'final', 1 ] ], cw = Math.floor((wd - 34) / 3);
 const K = w.ko;
 if (!K && w.c33 && window.V33 && V33.wgBrText) {
  V33.wgBrText(w, x, y, wd);
  return;
 }
 if (!K) {
  text('QUARTERFINALS AFTER POOL PLAY', x + wd / 2, y + 4, 1, '#ffe14d', 'center');
  [ 'A1 V B2', 'C1 V D2', 'B1 V A2', 'D1 V C2' ].forEach((s, i) => text(s, x + wd / 2, y + 18 + i * 12, 1, '#cfe', 'center'));
  text('THEN SEMIS + THE FINAL', x + wd / 2, y + 72, 1, '#8fe3f0', 'center');
  return;
 }
 const H0 = 108;
 cols.forEach(([lb, k, n], ci) => {
  const cx0 = x + ci * (cw + 2);
  text(lb, cx0 + cw / 2, y, 1, '#ffe14d', 'center');
  const games = K.br && K.br[k] || [];
  for (let i = 0; i < n; i++) {
   const slot = H0 / n, gy = Math.round(y + 9 + slot * i + slot / 2 - 9), g = games[i];
   rect(cx0, gy, cw, 18, 'rgba(10,16,22,.8)');
   if (!g) {
    text('-', cx0 + cw / 2, gy + 6, 1, '#55636d', 'center');
    continue;
   }
   [ 0, 1 ].forEach(s => {
    const id = g[s], sc = g[2 + s], done = g[2] != null, won = done && (s === 0 ? g[2] > g[3] : g[3] > g[2]), mine = id === w.team;
    rect(cx0 + 1, gy + 1 + s * 8, 3, 7, accent(T(id)));
    text(wgAbbr16(id), cx0 + 6, gy + 2 + s * 8, 1, mine ? '#ffe14d' : done && !won ? '#6c7f8a' : '#fff');
    if (done) text(String(sc), cx0 + cw - 2, gy + 2 + s * 8, 1, won ? '#7dff7a' : '#6c7f8a', 'right');
   });
  }
 });
 const chx = x + 3 * (cw + 2);
 text('CHAMP', chx + 15, y, 1, '#ffe14d', 'center');
 if (w.champ) badge(T(w.champ), chx + 2, y + 9 + H0 / 2 - 22, 2); else text('?', chx + 15, y + 9 + H0 / 2 - 4, 2, '#55636d', 'center');
}

function drawWgChamp() {
 const w = wgame;
 bgStripes(true);
 if (!w || !w.champ) {
  screen = w ? 'wgHub' : 'menu';
  return;
 }
 const ch = T(w.champ), you = w.champ === w.team, cx = W / 2;
 const cols = [ ch.c1, ch.c2, '#ffe14d', '#ffffff' ];
 for (let i = 0; i < 46; i++) {
  const sp = 18 + i * 37 % 23, x = (i * 53 + Math.sin(menuT * .7 + i) * 9) % W, y = (menuT * sp + i * 29) % (H + 10) - 6;
  rect(Math.round((x + W) % W), Math.round(y), 2, 3, cols[i % 4]);
 }
 text(you ? 'WORLD CHAMPIONS!' : 'WORLD GAMES CHAMPION', cx, 6, 2, '#ffe14d', 'center', '#000');
 text('2023 WORLDS - SAN DIEGO', cx, 20, 1, '#8fe3f0', 'center');
 badge(ch, cx - 26, 30, 4);
 text(ch.name, cx, 94, 2, '#ffffff', 'center', '#000');
 const fin = w.v === 2318 ? w.ko && w.ko.res && w.ko.res.fin : w.ko && w.ko.br && w.ko.br.final && w.ko.br.final[0];
 if (fin && fin[2] != null) text('FINAL: ' + T(fin[0]).name + ' ' + fin[2] + ' - ' + fin[3] + ' ' + T(fin[1]).name, cx, 110, 1, '#cfe', 'center');
 const row = w.table[w.team];
 text(you ? 'YOU WON THE WORLD GAMES WITH ' + T(w.team).name + '!' : T(w.team).name + ' (' + row.w + '-' + row.l + ') - ' + (w.finish || 'KNOCKED OUT'), cx, 120, 1, you ? '#7dff7a' : '#ff9a8a', 'center');
 const t = LS.get('wgTitles', 0) || 0;
 if (t) text('WORLD TITLES: ' + t, cx, 130, 1, '#ffe14d', 'center');
 const by = H - 24;
 button('BRACKET', Math.round(cx - 136), by, 84, 18, () => {
  wgTab = 1;
  screen = 'wgHub';
 }, {
  bg: '#8fe3f0'
 });
 button('NEW WORLD GAMES', Math.round(cx - 46), by, 92, 18, () => {
  screen = 'wgPick';
 }, {
  bg: '#7dff7a'
 });
 button('MENU', Math.round(cx + 52), by, 84, 18, () => {
  screen = 'menu';
 }, {
  bg: '#c9d6d9'
 });
}

let seasonTab = 0, seasonPage = null;

function drawSeason() {
 const S = season;
 bgStripes(true);
 if (!S) {
  screen = 'menu';
  return;
 }
 if (S.phase === 'draft') {
  screen = 'draft';
  panelDirty();
  return;
 }
 const me = T(S.team), row = S.table[S.team];
 rect(0, 0, W, 18, '#0b0f14');
 badge(me, 3, 1, 1);
 text(me.name + '  ' + S.year + ' SEASON', 20, 3, 1, '#fff');
 text(row.w + '-' + row.l, 20, 10, 1, '#ffd23a');
 if (on2503() && !S.online && okDiff2503(S.diff2503) != null) text('SEASON DIFFICULTY: ' + DIFF_NAMES[S.diff2503], 20 + textW(row.w + '-' + row.l) + 10, 10, 1, DCOL2503[S.diff2503]);
 button('MENU', W - 44, 2, 40, 13, () => {
  screen = 'menu';
 }, {
  bg: '#c9d6d9'
 });
 button('LINEUP', W - 92, 2, 44, 13, () => openLineup(S.team, 'season', 'season'), {
  bg: '#2cc4dc'
 });
 button('ROSTER', W - 140, 2, 44, 13, () => openRoster(S.team, 'season', 'season'), {
  bg: '#8fe3f0'
 });
 button('STATS', W - 188, 2, 44, 13, () => {
  PS.stSort = PS.stSort || 'pts';
  screen = 'seasonStats';
  panelDirty();
 }, {
  bg: '#ffe14d'
 });
 const lw = Math.round(W * .42);
 card(6, 24, lw, 132);
 const nx = nextSeasonGame(S), cx = 6 + lw / 2;
 if (nx && nx.opp === 'BYE') {
  text(nx.label, cx, 30, 1, '#ffd23a', 'center');
  text('BYE WEEK', cx, 54, 3, '#fff', 'center', '#000');
  text('REST UP. THE LEAGUE PLAYS ON.', cx, 80, 1, '#cfe', 'center');
  button('SIM WEEK', cx - 40, 100, 80, 20, () => {
   simWeekOthers(S);
   advanceWeek(S);
   LS.set('season', S);
  }, {
   sc: 1
  });
 } else if (nx) {
  const o = T(nx.opp);
  text(nx.label, cx, 30, 1, '#ffd23a', 'center');
  badge(me, cx - 52, 42, 2);
  badge(o, cx + 26, 42, 2);
  text(nx.home ? 'VS' : 'AT', cx, 50, 2, '#fff', 'center');
  text(o.name, cx, 78, 1, '#cfe', 'center');
  text((nx.home ? 'HOME GAME' : 'AWAY GAME') + ' - ' + (seasonNight15(S, nx.label, nx.opp) ? 'NIGHT' : 'DAY'), cx, 86, 1, seasonNight15(S, nx.label, nx.opp) ? '#b9a8ff' : '#ffe14d', 'center');
  button('PLAY', cx - 34, 100, 68, 20, () => newGame(S.team, nx.opp, 'season', nx.home, {
   label: nx.label
  }), {
   sc: 2
  });
  button('ROSTER & STATS', Math.round(cx - 45), 125, 90, 14, () => openVsRoster([ [ S.team, 'season' ], [ nx.opp, 'season' ] ], 'season', 0), {
   bg: '#8fe3f0'
  });
  if (S.phase === 'playoff') text('LOSE AND YOU ARE OUT', cx, 144, 1, '#ff9a8a', 'center');
 } else {
  S.seen = true;
  LS.set('season', S);
  const champ = S.champ ? T(S.champ) : null;
  text('SEASON OVER', cx, 30, 1, '#ffd23a', 'center');
  if (champ) {
   badge(champ, cx - 19, 42, 3);
   text(champ.id === S.team ? 'YOU WON IT ALL!' : champ.name + ' WIN IT ALL', cx, 92, 1, champ.id === S.team ? '#ffe14d' : '#fff', 'center');
   if (champ.id !== S.team) text(S.playoff && S.playoff.seeds.includes(S.team) ? 'KNOCKED OUT IN THE PLAYOFFS' : 'MISSED THE PLAYOFFS', cx, 102, 1, '#ff9a8a', 'center');
  }
  button('NEW SEASON', cx - 50, 118, 100, 18, () => {
   menuSel.mode = 'season';
   screen = 'seasonSetup';
   panelDirty();
  }, {
   bg: '#ffd23a'
  });
 }
 const rx = lw + 12, rw = W - rx - 6;
 [ 'TABLE', 'RESULTS' ].forEach((tb, i) => {
  const bx = rx + i * (rw / 2);
  hit('TAB-' + tb, bx, 24, rw / 2 - 2, 12, () => {
   seasonTab = i;
  }, tb);
  rect(bx, 24, rw / 2 - 2, 12, seasonTab === i ? '#2cc4dc' : '#22313d');
  text(tb, bx + rw / 4 - 1, 28, 1, seasonTab === i ? '#0b1a20' : '#cfe', 'center');
 });
 let y = 42;
 if (seasonTab === 0) {
  text('TEAM', rx + 4, y, 1, '#7f9aa6');
  text('W', rx + rw - 46, y, 1, '#7f9aa6', 'center');
  text('L', rx + rw - 32, y, 1, '#7f9aa6', 'center');
  text('+/-', rx + rw - 12, y, 1, '#7f9aa6', 'center');
  y += 8;
  const all = standings(S), PER = 12, pages = Math.ceil(all.length / PER);
  if (seasonPage == null) seasonPage = Math.floor(Math.max(0, all.findIndex(r => r.id === S.team)) / PER);
  seasonPage = Math.min(seasonPage, pages - 1);
  if (pages > 1) {
   rect(rx + 2, y - 10, 46, 10, '#0b0f14');
   button(seasonPage ? 'SHOW 1-' + PER : 'SHOW ' + (PER + 1) + '-' + all.length, rx + 2, y - 10, 46, 9, () => {
    seasonPage = (seasonPage + 1) % pages;
   }, {
    bg: '#8fe3f0'
   });
  }
  all.slice(seasonPage * PER, seasonPage * PER + PER).forEach((r, k) => {
   const i = seasonPage * PER + k;
   const tm = T(r.id), mine = r.id === S.team;
   if (mine) rect(rx, y - 2, rw, 9, '#1f4a52');
   if (i === PLAYOFF_N) rect(rx, y - 2, rw, 1, '#ffd23a');
   text(i + 1, rx + 4, y, 1, '#7f9aa6');
   rect(rx + 12, y - 1, 6, 7, accent(tm));
   text(tm.name, rx + 22, y, 1, mine ? '#ffe14d' : '#fff');
   text(r.w, rx + rw - 46, y, 1, '#fff', 'center');
   text(r.l, rx + rw - 32, y, 1, '#fff', 'center');
   const gd = r.gf - r.ga;
   text((gd > 0 ? '+' : '') + gd, rx + rw - 12, y, 1, gd >= 0 ? '#7dff7a' : '#ff8a7a', 'center');
   y += 9;
  });
  text('TOP ' + PLAYOFF_N + ' MAKE THE PLAYOFFS', rx + rw / 2, y + 1, 1, '#ffd23a', 'center');
 } else {
  const all = S.results.concat(S.playoff ? S.playoff.results : []).slice().reverse().slice(0, 13);
  if (!all.length) text('NO GAMES YET', rx + rw / 2, y + 10, 1, '#7f9aa6', 'center');
  all.forEach(r => {
   const [a, b, sa, sb, lab] = r, mine = a === S.team || b === S.team;
   text(lab, rx + 4, y, 1, '#7f9aa6');
   text(a + ' ' + sa + '-' + sb + ' ' + b, rx + rw / 2 + 10, y, 1, mine ? '#ffe14d' : '#fff', 'center');
   if (mine) {
    const w = a === S.team ? sa > sb : sb > sa;
    text(w ? 'W' : 'L', rx + rw - 4, y, 1, w ? '#7dff7a' : '#ff5a4a', 'right');
   }
   y += 9;
  });
 }
}

const SEASON_GAMES = 11, PLAYOFF_N = 8;

function makeSeason(teamId) {
 if (season && !no2314()) szArchPush2314(season);
 const ids = [ teamId, ...TEAMS.map(t => t.id).filter(id => id !== teamId).sort(() => Math.random() - .5) ];
 if (ids.length % 2) ids.push('BYE');
 const n = ids.length, rounds = [], arr = ids.slice();
 for (let r = 0; r < n - 1; r++) {
  const games = [];
  for (let i = 0; i < n / 2; i++) games.push(r % 2 ? [ arr[n - 1 - i], arr[i] ] : [ arr[i], arr[n - 1 - i] ]);
  rounds.push(games);
  arr.splice(1, 0, arr.pop());
 }
 rounds.length = Math.min(rounds.length, SEASON_GAMES);
 const table = {};
 ids.filter(i => i !== 'BYE').forEach(i => table[i] = {
  w: 0,
  l: 0,
  gf: 0,
  ga: 0
 });
 const year = LS.get('seasonYear', 2026);
 LS.set('seasonYear', year + 1);
 seasonPage = null;
 const S = {
  v7: true,
  v8: true,
  team: teamId,
  league: 'ALL',
  teams: ids.filter(i => i !== 'BYE'),
  week: 0,
  rounds: rounds,
  table: table,
  results: [],
  phase: 'draft',
  playoff: null,
  champ: null,
  year: year,
  rosters: null,
  lineups: {}
 };
 S.draft = makeDraft(S);
 draftRunCpu(S.draft, S.team);
 return S;
}

function draftPool() {
 const best = {}, pool = [];
 for (const t of TEAMS) for (const id of t.roster) {
  const p = PP(id);
  if (!p.real) {
   pool.push(id);
   continue;
  }
  const k = (p.n0 != null ? p.n0 : p.n).toLowerCase();
  if (!best[k] || p.ovr > PP(best[k]).ovr) best[k] = id;
 }
 pool.push(...Object.values(best));
 const have = {};
 for (const id of pool) {
  const ps = PP(id).pos;
  have[ps] = (have[ps] || 0) + 1;
 }
 const need = {};
 for (const k in QUOTA) need[k] = QUOTA[k] * TEAMS.length + 2 - (have[k] || 0);
 for (const id of FREE_AGENTS) {
  const ps = PP(id).pos;
  if (need[ps] > 0) {
   pool.push(id);
   need[ps]--;
  }
 }
 pool.push(...EGG_PLAYERS);
 const x19 = window.CP2319 ? CP2319.draftExtra() : null;
 if (window.V20 && (!x19 || x19.leg)) pool.push(...V20.draftLeg());
 if (x19) for (const id of x19.gho) if (PP(id) && !pool.includes(id)) pool.push(id);
 return pool;
}

function makeDraft(S) {
 const teams = S.teams.slice();
 const pool = draftPool();
 const order = teams.slice().sort(() => Math.random() - .5);
 return {
  order: order,
  rounds: 17,
  n: 0,
  pool: pool,
  picks: [],
  rosters: Object.fromEntries(teams.map(t => [ t, [] ])),
  user: S.team
 };
}

function draftTurn(D) {
 const n = D.order.length, r = Math.floor(D.n / n), k = D.n % n;
 return r % 2 ? D.order[n - 1 - k] : D.order[k];
}

function draftNeeds(D, team) {
 const need = Object.assign({}, QUOTA);
 for (const id of D.rosters[team] || []) {
  const p = PP(id);
  if (need[p.pos] != null) need[p.pos]--;
 }
 return need;
}

function cpuChoice(D, team) {
 const need = draftNeeds(D, team), left = 17 - (D.rosters[team] || []).length;
 let best = null, bs = -1e9;
 for (const id of D.pool) {
  const p = PP(id), nd = need[p.pos] || 0;
  if (nd <= 0) continue;
  if (p.leg) continue;
  if (p.gho16) continue;
  if (p.egg13) continue;
  let s = p.ovr + nd * 2.5 + Math.random() * 4;
  if (p.pos === 'G' && nd === 1 || p.pos === 'FO' && QUOTA.FO > 1 && nd === 1) s -= 8;
  const mustNow = Object.values(need).reduce((a, b) => a + Math.max(0, b), 0) >= left;
  if (mustNow) s += 0;
  if (s > bs) {
   bs = s;
   best = id;
  }
 }
 if (!best) best = D.pool.map(PP).sort((a, b) => b.ovr - a.ovr)[0].id;
 return best;
}

function draftPick(D, team, id) {
 const i = D.pool.indexOf(id);
 if (i < 0) return;
 D.pool.splice(i, 1);
 D.rosters[team].push(id);
 D.picks.push([ team, id ]);
 D.n++;
}

function draftRunCpu(D, user) {
 user = user || D.user;
 const total = D.order.length * D.rounds;
 while (D.n < total && draftTurn(D) !== user) draftPick(D, draftTurn(D), cpuChoice(D, draftTurn(D)));
}

function finishDraft(S) {
 if (!S || !S.draft) return;
 const D = S.draft;
 draftRunCpu(D, '__none__');
 S.rosters = D.rosters;
 S.lineups = {};
 for (const t of S.teams) S.lineups[t] = autoLineup(S.rosters[t]);
 S.draftLog = D.picks.slice(0, 40);
 delete S.draft;
 S.phase = 'reg';
 LS.set('season', S);
}

function simScore(a, b) {
 const src = season && season.rosters ? 'season' : 'real';
 const A = unitPower(lineupFor(a, src)), B = unitPower(lineupFor(b, src));
 const pa = .33 + .05 * (A.off - B.def) - .04 * B.gk + .02 * (A.fo - B.fo), pb = .33 + .05 * (B.off - A.def) - .04 * A.gk + .02 * (B.fo - A.fo);
 let sa = 0, sb = 0;
 for (let i = 0; i < 26; i++) {
  if (Math.random() < pa) sa++;
  if (Math.random() < pb) sb++;
 }
 while (sa === sb) {
  if (Math.random() < pa) sa++; else if (Math.random() < pb) sb++;
 }
 return [ sa, sb ];
}

function coachX(side) {
 return side === 'u' ? benchX('u') + 11 : benchX('o') + 69;
}

function coachRant(side) {
 const G = game;
 if (!G) return;
 const k = voice12('coach_ref', null, null, 0, true);
 G.rant = {
  side: side,
  t0: menuT,
  k: k,
  dir: side === 'u' ? -1 : 1
 };
 G.rantN = (G.rantN || 0) + 1;
 G.rantLog = G.rantLog || [];
 G.rantLog.push({
  side: side,
  k: k,
  scr: screen
 });
 pop12(VOICE_TXT[k] || 'ARE YOU BLIND?!', clamp(coachX(side), Math.round(camX) + 40, Math.round(camX) + W - 40), H - 36, '#ff5a4a', 2.2, true);
 if (side === 'o' && Math.random() < .95) G.penChirpAt = menuT + 2.4;
}

function rantOn(side) {
 const G = game, R = G && G.rant;
 return !!R && R.side === side && menuT - R.t0 < 2.5;
}

function drawClipboard(side) {
 const G = game, R = G.rant, e = menuT - R.t0, cx = coachX(side), d = R.dir;
 if (e < .25 || e > 2.3) return;
 let x, y, a;
 if (e < .85) {
  const k = (e - .25) / .6;
  x = cx + d * (3 + 15 * k);
  y = H - 13 - 20 * Math.sin(Math.PI * k) + 10 * k;
  a = k * 9.4 * d;
 } else if (e < 1.8) {
  x = cx + d * 18;
  y = H - 3;
  a = Math.PI / 2;
 } else {
  const k = (e - 1.8) / .5;
  x = cx + d * (18 - 15 * k);
  y = H - 3 - 8 * k;
  a = Math.PI / 2 * (1 - k);
 }
 g.save();
 g.translate(Math.round(x), Math.round(y));
 g.rotate(a);
 rect(-2, -3, 5, 6, '#7a4a22');
 rect(-1, -2, 3, 4, '#f4f4f4');
 rect(-1, -4, 3, 1, '#c0c0c0');
 g.restore();
 G.clipFrames = (G.clipFrames || 0) + 1;
}

function startHuddle(who) {
 const G = game;
 if (!G || !G.players) return;
 const snap = [];
 for (const p of G.players) if (p.pl) snap.push({
  p: p,
  x: p.x,
  y: p.y,
  side: p.team === 'O' || p.team === 'G2' || p.gk ? 'u' : 'o'
 });
 const cnt = {
  u: 0,
  o: 0
 }, tot = {
  u: snap.filter(s => s.side === 'u').length,
  o: snap.filter(s => s.side === 'o').length
 };
 for (const s of snap) {
  const i = cnt[s.side]++, n = Math.max(1, tot[s.side]), a = -Math.PI / 2 + (i + .5) / n * Math.PI * 2;
  s.hx = coachX(s.side) + Math.cos(a) * 15;
  s.hy = H - 9 + Math.sin(a) * 5;
  s.ph = i * .37;
 }
 G.huddle = {
  t0: menuT,
  who: who,
  snap: snap
 };
 G.huddleBack = null;
 G.huddleN = (G.huddleN || 0) + 1;
 const k = voice12('timeout', null, null, 0, true);
 pop12(VOICE_TXT[k] || 'TIMEOUT', clamp(coachX('u'), Math.round(camX) + 50, Math.round(camX) + W - 50), H - 40, '#fff', 2.2, true);
}

function huddleOn() {
 const G = game, Hd = G && G.huddle;
 if (!Hd || Hd.skip) return false;
 return screen === 'timeout' || screen === 'lineup' || screen === 'playbook' || screen === 'banner' && G.banner && G.banner.kind === 'cputo';
}

function drawHuddle() {
 const G = game, Hd = G.huddle, e = menuT - Hd.t0, k = clamp(e / 1, 0, 1), kk = k * k * (3 - 2 * k);
 const list = Hd.snap.map(s => ({
  s: s,
  x: s.x + (s.hx - s.x) * kk,
  y: s.y + (s.hy - s.y) * kk
 })).sort((a, b) => a.y - b.y);
 const coachDrawn = {
  u: false,
  o: false
 };
 const drawCoach = side => {
  const kit = side === 'u' ? G.uk : G.ok, team = T(side === 'u' ? G.user : G.opp), cx = coachX(side);
  const fr = Math.floor(menuT * 1.5) % 2 ? 'coach_point' : RL12.frame('coach_cheer', menuT, 3);
  scaled12(cx, H - 9, () => coachDraw18(g, fr, cx, H - 9, kit, side === 'u', {
   skin: pickSkin('coach-' + team.id)
  }, coachLook18(side)));
  coachDrawn[side] = true;
 };
 for (const q of list) {
  const s = q.s, side = s.side;
  if (!coachDrawn[side] && q.y > H - 9) drawCoach(side);
  const kit = side === 'u' ? G.uk : G.ok, x = Math.round(q.x), bob = k >= 1 && Math.floor((menuT + s.ph) * 3.3) % 2 ? 1 : 0, y = Math.round(q.y) - bob;
  const fr = k < 1 ? RUN_N[Math.floor((e + s.ph) * 10) & 3] : Math.floor((menuT + s.ph) * 2) % 3 === 0 ? RL12.frame('bench_cheer', menuT + s.ph, 5) : RL12.frame('bench_idle', menuT + s.ph, 2);
  const right = k < 1 ? s.hx >= s.x : x < coachX(side);
  scaled12(x, y, () => RL12.draw(g, fr, x, y, kit, right, {
   skin: skinOf(s.p.pl)
  }));
 }
 for (const side of [ 'u', 'o' ]) if (!coachDrawn[side]) drawCoach(side);
 G.huddleFrames = (G.huddleFrames || 0) + 1;
}

function rantWatch() {
 const G = game;
 if (!G) return;
 if (!G.tutorial) {
  const pp = G.penPending || null, fl = (G.foulLog || []).filter(f => !f.tut).length;
  let side = null;
  if (pp && pp !== G.rantPP) {
   G.rantPP = pp;
   side = pp.side;
  }
  if (fl > (G.rantFL || 0)) {
   const f = G.foulLog[G.foulLog.length - 1];
   if (!side && !(G.rant && menuT - G.rant.t0 < 1.5)) side = f.side;
   G.rantFL = fl;
  }
  if (side) coachRant(side === 'U' ? 'u' : 'o');
  if (G.penChirpAt && menuT >= G.penChirpAt && !voiceBusy()) {
   G.penChirpAt = 0;
   voice12('penalty', clamp(benchX('u') + 34, Math.round(camX) + 50, Math.round(camX) + W - 50), H - 34, 0, true);
  }
 }
 if (G.huddle && [ 'live', 'defense', 'cpu', 'faceoff' ].includes(screen)) {
  const spots = new Map;
  if (!G.huddle.skip) for (const s of G.huddle.snap) if (s.p.pl) spots.set(s.p.pl.id, [ s.hx, s.hy ]);
  G.huddle = null;
  G.huddleBack = spots.size ? {
   t0: menuT,
   spots: spots
  } : null;
 }
 if (G.huddleBack && menuT - G.huddleBack.t0 > .8) G.huddleBack = null;
}

const TO_DEAD_NO = [ 'flag', 'buzzer', 'tutdone', 'cputo' ];

function toDead() {
 const G = game;
 return !!G && (screen === 'banner' && G.banner && !TO_DEAD_NO.includes(G.banner.kind) && !G.over || (screen === 'live' || screen === 'defense') && G.readyT > 0);
}

function canTimeout() {
 const G = game;
 if (!G || G.tutorial || G.over || !(G.tos[0] > 0) || shootP) return false;
 return screen === 'live' && !!G.carrier && G.ball.state === 'held' && G.players.includes(G.carrier) || toDead();
}

function callTimeout() {
 const G = game;
 if (!canTimeout()) return false;
 G.tos[0]--;
 G.toLog = G.toLog || [];
 G.toLog.push({
  side: 'U',
  q: G.q,
  clock: +G.clock.toFixed(1),
  shot: +G.shotClock.toFixed(1),
  at: screen
 });
 if (screen === 'banner') G.toCtx = {
  dead: true,
  clock: G.clock,
  shot: G.shotClock
 }; else if (screen === 'defense') G.toCtx = {
  defense: true,
  clock: G.clock,
  shot: G.shotClock
 }; else {
  const c = G.carrier;
  G.toCtx = {
   x: c.x,
   y: c.y,
   shot: G.shotClock,
   clock: G.clock,
   pl: c.pl ? c.pl.id : null
  };
 }
 joyRelease && joyRelease(true);
 G.run = null;
 stick = null;
 SFX.whistle();
 screen = 'timeout';
 panelDirty();
 startHuddle('u');
 return true;
}

function cpuTimeoutMaybe(kind) {
 const G = game;
 if (!G || G.tutorial || G.ot || !(G.tos[1] > 0) || G.over) return false;
 const late = G.q === (G.periods || 4) && G.clock < 150 && G.score[1] < G.score[0], run = (G.runU || 0) >= 3;
 if (!(late || run) || G.cpuToT && G.t - G.cpuToT < 120) return false;
 if (!(G.forceCpuTo || Math.random() < (run ? .45 : .3))) return false;
 G.forceCpuTo = false;
 G.tos[1]--;
 G.cpuToT = G.t;
 G.runU = 0;
 G.toLog = G.toLog || [];
 G.toLog.push({
  side: 'C',
  q: G.q,
  clock: +G.clock.toFixed(1),
  why: run ? 'run' : 'late'
 });
 const o = T(G.opp);
 G.banner = {
  txt: 'TIMEOUT',
  sub: o.name + ' CALLED TIMEOUT - ' + G.tos[1] + ' LEFT',
  kind: 'cputo',
  then: kind
 };
 G.bannerT = 0;
 G.bannerAuto = 1.8;
 screen = 'banner';
 SFX.whistle();
 G.bannerAuto = 2.6;
 startHuddle('c');
 return true;
}

function resumeFromTimeout() {
 const G = game, X = G.toCtx || {};
 G.toCtx = null;
 if (X.dead) {
  if (X.clock != null) G.clock = X.clock;
  screen = 'banner';
  const r = afterBanner();
  applyStarter();
  return r;
 }
 if (X.clock != null) G.clock = X.clock;
 if (X.defense) {
  G.toStart = null;
  screen = 'defense';
  G.readyT = 1;
  addFx('cue', 0, 0, {
   s: 'GET READY...',
   col: '#ffe14d',
   life: 1
  });
  return;
 }
 setupPossession(X.x, X.y);
 const keep = X.pl && G.players.find(p => p.team === 'O' && p.pl && p.pl.id === X.pl);
 if (keep && keep !== G.carrier) {
  const c0 = G.carrier;
  [c0.x, keep.x] = [ keep.x, c0.x ];
  [c0.y, keep.y] = [ keep.y, c0.y ];
  G.carrier = keep;
  G.ball.x = keep.x + BX;
  G.ball.y = keep.y + BY;
 }
 applyStarter();
 if (X.shot != null) G.shotClock = Math.max(4, X.shot);
 G.checkT = -1.2;
 G.readyT = 1;
 addFx('cue', 0, 0, {
  s: 'GET READY...',
  col: '#ffe14d',
  life: 1
 });
}

function setOffense(s) {
 const G = game;
 if (!G || !SETS[s]) return;
 G.oset = s;
 LS.set('oset', s);
 if (screen === 'live' && !(G.pen && G.pen.side === 'C')) {
  const sp = curSpots();
  for (const p of G.players) if (p.team === 'O' && p.home) {
   p.home = sp[p.idx].slice();
   p.wander = 0;
  }
 }
}

function setDefense(s, id) {
 const G = game;
 if (!G) return;
 if (s === 'custom' && id && dCustomPlays().some(p => p.id === id)) {
  G.dset = 'custom';
  G.dPlay = id;
  LS.set('dset', 'custom');
  LS.set('dplay', id);
  return;
 }
 G.dset = s === 'zone' ? 'zone' : s === 'black' ? 'black' : 'man';
 LS.set('dset', G.dset);
}

function dCustomPlays() {
 return playsAll().filter(p => pmCat(p) === 'D' && !p.builtin && !p.dcall && Array.isArray(p.start) && p.start.length >= 6);
}

function dCustomPlay() {
 const G = game;
 if (!G || G.dset !== 'custom' || !G.dPlay) return null;
 return dCustomPlays().find(p => p.id === G.dPlay) || null;
}

function dCustomOn() {
 return V13ON() && !!dCustomPlay();
}

function dCustomKind() {
 const pl = dCustomPlay();
 if (!pl) return 'zone';
 ZONES.__dc = pl.start.slice(0, 6).map(([x, y]) => [ clamp(GX - x, CREASE + 4, 190), clamp(y - CY, FT + 12 - CY, FB - 3 - CY) ]);
 return '__dc';
}

function dsetLabel(G) {
 const p = G.dset === 'custom' ? dCustomPlay() : null;
 return p ? p.name.slice(0, 7) : G.dset === 'zone' ? 'ZONE' : G.dset === 'black' ? 'BLACK' : 'MAN';
}

function dsetNext(G) {
 const cs = dCustomPlays();
 if (G.dset === 'man') return setDefense('zone');
 if (G.dset === 'zone') return setDefense('black');
 if (G.dset === 'black') return cs.length ? setDefense('custom', cs[0].id) : setDefense('man');
 const i = cs.findIndex(p => p.id === G.dPlay);
 return i >= 0 && i + 1 < cs.length ? setDefense('custom', cs[i + 1].id) : setDefense('man');
}

const PEN_LEN = 30;

const PEN_SCALE = .8;

const RET18 = {
 k: .05
};

function chip18() {
 const G = game;
 if (!G) return 0;
 const V = G.v14, fights = V && V.fightLog ? V.fightLog.length : 0;
 return (G.fouls && G.fouls.U || 0) + fights;
}

function cMul18() {
 const G = game;
 if (!G || G.tutorial || window.__rl_v124gb || window.__rl_no18chip) return 1;
 const c = chip18();
 return c > 0 ? Math.min(7, 1 + 1.5 * c) : 1;
}

const PEN_CHECK_P = .005 * PEN_SCALE;

const PEN_CPU_P = .022 * PEN_SCALE;

const PEN_DCHECK_P = .01 * PEN_SCALE, PEN_DHIT_P = .03 * PEN_SCALE;

function penaltyRoll(kind, chk) {
 const G = game;
 if (!G || G.tutorial || G.pen || G.penPending || G.ot) return false;
 if (kind === 'check') {
  const forced = G.forcePen === 'C';
  if (!forced) return false;
  G.forcePen = null;
  G.penPending = {
   side: 'C',
   who: chk && chk.pl,
   foul: 'SLASHING'
  };
  const nm = G.penPending.who ? lastName(G.penPending.who) : T(G.opp).name;
  endPossession('flag', 'FLAG!', G.penPending.foul + ' ON ' + nm + ' - YOU ARE MAN-UP');
  G.bannerAuto = 1.7;
  return true;
 }
 if (kind === 'cpu') return false;
 return false;
}

const FOUL = {
 aiBehind: .22,
 aiLate: .006,
 aiHack: .015,
 aiPick: .012,
 lateT: .35,
 lateWin: 1.6,
 spamN: 7,
 spamT: 1.5,
 slashT: .6
};

function foulTick(dt) {
 const G = game;
 if (!G || G.tutorial || G.over) return;
 if (G.lateFoul && G.t >= G.lateFoul.t) {
  const L = G.lateFoul;
  G.lateFoul = null;
  if (G.players.includes(L.who) && Math.hypot(L.who.x - L.on.x, L.who.y - L.on.y) < 16) {
   addFx('txt', L.on.x, L.on.y - 24, {
    s: 'LATE!',
    col: '#ff9a8a',
    life: .8
   });
   if (foulCall('SLASHING', L.side === 'C' ? 'LATE CHECK AFTER YOUR PASS' : 'LATE CHECK AFTER THEIR PASS', L.side, L.who)) return;
  }
 }
 const b = G.ball, offT = screen === 'live' ? 'O' : 'D', defT = screen === 'live' ? 'D' : 'O';
 const car = screen === 'live' ? G.carrier : G.dcar;
 if (!(b.state === 'held' || b.state === 'pass') || !car) {
  for (const p of G.players) {
   p.px = p.x;
   p.py = p.y;
  }
  return;
 }
 for (const a of G.players) {
  if (a.team === offT && a !== car && a.px != null && !a.pickSet && !a.callPick && !(a.down > 0)) {
   const sp = Math.hypot(a.x - a.px, a.y - a.py) / Math.max(dt, .001);
   if (sp > 14 && Math.hypot(a.x - b.x, a.y - b.y) > 24) {
    for (const d of G.players) {
     if (d.team !== defT || d.mark === a || d === G.dctl && screen === 'defense' && G.run || Math.hypot(d.x - a.x, d.y - a.y) > 4.6) continue;
     if (d.mark && d.mark.ghost) continue;
     const k = a.idx * 7 + d.idx + (a.team === 'O' ? 0 : 50);
     G.pickCd = G.pickCd || {};
     if ((G.pickCd[k] || -9) > G.t - 3) continue;
     G.pickCd[k] = G.t;
     G.movingPicks = (G.movingPicks || 0) + 1;
     if (G.forcePick || Math.random() < FOUL.aiPick) {
      G.forcePick = false;
      if (foulCall('ILLEGAL PICK', screen === 'live' ? 'MOVING PICK - TURNOVER' : 'MOVING PICK - YOUR BALL', screen === 'live' ? 'U' : 'C', a, {
       tech: true
      })) return;
     }
    }
   }
  }
 }
 for (const p of G.players) {
  p.px = p.x;
  p.py = p.y;
 }
}

function penCountUp(whoP, side) {
 const G = game, pl = whoP && whoP.pl;
 if (!G || !pl || G.tutorial) return false;
 const fk = G.dup2504 && G.dup2504.includes(pl.id) ? side + '|' + pl.id : pl.id;
 G.pf = G.pf || {};
 G.pf[fk] = (G.pf[fk] || 0) + 1;
 if (G.pf[fk] < 3 || isEjected(pl)) return false;
 G.ejected = G.ejected || [];
 G.ejected.push(pl.id);
 const sideIdx = side === 'U' ? 0 : 1;
 const sub = subFor(sideIdx, pl.id, true);
 (G.ejections = G.ejections || []).push({
  pid: pl.id,
  side: side,
  sub: sub
 });
 G.ejBanner = {
  txt: 'EJECTED',
  sub: lastName(pl) + ' IS DONE FOR THE DAY - 3 PENALTIES',
  t: 0,
  team: sideIdx
 };
 return true;
}

function foulLog(G, f) {
 G.foulLog = G.foulLog || [];
 G.foulLog.push(Object.assign({
  t: +G.t.toFixed(2),
  q: G.q
 }, f));
}

function foulCall(label, sub, side, whoP, opts) {
 const G = game;
 if (!G || G.over) return false;
 opts = opts || {};
 if (G.tutorial) {
  foulLog(G, {
   foul: label,
   side: side,
   user: !!opts.user,
   tut: true
  });
  addFx('txt', (whoP || G.ball).x, (whoP || G.ball).y - 26, {
   s: 'FLAG! ' + label,
   col: '#ffe14d',
   life: 1.4
  });
  SFX.whistle();
  return true;
 }
 if (screen !== 'live' && screen !== 'defense') return false;
 if (G.ot && !opts.tech) return false;
 foulLog(G, {
  foul: label,
  side: side,
  user: !!opts.user,
  tech: !!opts.tech
 });
 if (side === 'U' && whoP && whoP.pl) st14('pen', whoP.pl);
 G.fouls = G.fouls || {
  U: 0,
  C: 0
 };
 G.fouls[side]++;
 if (opts.user) G.userFouls = (G.userFouls || 0) + 1; else G.aiFouls = (G.aiFouls || 0) + 1;
 if (whoP) addFx('txt', whoP.x, whoP.y - 26, {
  s: 'FLAG!',
  col: '#ffe14d',
  life: 1.2
 });
 if (opts.tech) {
  G.ruleCalls = G.ruleCalls || {};
  G.ruleCalls[label] = (G.ruleCalls[label] || 0) + 1;
  G.ruleSpot = {
   x: G.ball.x,
   y: G.ball.y
  };
  G.run = null;
  G.cc = null;
  G.bc = null;
  G.ccC = null;
  G.bcC = null;
  G.ruleCall = {
   label: label,
   t: G.t
  };
  if (side === 'U') ruleBanner('rturn', label, sub || 'TURNOVER - THEIR BALL'); else ruleBanner('rturnU', label, sub || 'THEIR FOUL - YOUR BALL');
  G.banner.kind2 = 'foul';
  G.refFlag = true;
  return true;
 }
 if (G.pen || G.penPending) {
  if (side === 'U' && screen === 'live') return false;
  if (side === 'C' && screen === 'defense') {
   G.ruleSpot = {
    x: G.ball.x,
    y: G.ball.y
   };
   const ej = penCountUp(whoP, side);
   ruleBanner('rturnU', ej ? 'EJECTED' : label, ej ? lastName(whoP.pl) + ' - 3 PENALTIES - YOUR BALL' : 'THEIR FOUL - YOUR BALL');
   G.refFlag = true;
   return true;
  }
  return false;
 }
 const who = whoP && whoP.pl;
 const ej = penCountUp(whoP, side);
 G.penPending = {
  side: side,
  who: who,
  foul: label,
  sub: sub,
  eject: ej
 };
 if (ej) {
  const nm2 = lastName(who), tail = side === 'C' ? ' - YOU ARE MAN-UP' : ' - 30 SEC MAN-DOWN';
  if (screen === 'live') endPossession('flag', 'EJECTED', nm2 + ' - 3RD PENALTY' + tail); else dEnd('flag', 'EJECTED', nm2 + ' - 3RD PENALTY' + tail);
  G.bannerAuto = 2.4;
  if (G.banner) {
   G.banner.foul = label;
   G.banner.eject = true;
  }
  return true;
 }
 const nm = who ? lastName(who) : side === 'U' ? 'YOU' : T(G.opp).name;
 let bsub = (sub ? sub + ' - ' : '') + 'FLAG ON ' + nm + (side === 'C' ? ' - YOU ARE MAN-UP' : ' - 30 SEC MAN-DOWN');
 if (bsub.length > Math.floor(W / 4) - 2) bsub = 'FLAG ON ' + nm + (side === 'C' ? ' - YOU ARE MAN-UP' : ' - 30 SEC MAN-DOWN');
 if (screen === 'live') endPossession('flag', label, bsub); else dEnd('flag', label, bsub);
 G.bannerAuto = 2;
 if (G.banner) G.banner.foul = label;
 return true;
}

function facingOf(p, gx) {
 const t = p.tgt || (p.tx != null ? [ p.tx, p.ty ] : null);
 if (t) {
  const dx = t[0] - p.x, dy = t[1] - p.y, L = Math.hypot(dx, dy);
  if (L > 4) return [ dx / L, dy / L ];
 }
 if (p.face) return p.face;
 const dx = gx - p.x, dy = CY - p.y, L = Math.hypot(dx, dy) || 1;
 return [ dx / L, dy / L ];
}

function fromBehind(hitter, c, face) {
 const dx = hitter.x - c.x, dy = hitter.y - c.y, L = Math.hypot(dx, dy) || 1;
 return (dx * face[0] + dy * face[1]) / L < -.5;
}

function startPenalty() {
 const G = game, pp = G.penPending;
 G.penPending = null;
 if (!pp || G.brave) return false;
 G.pen = Object.assign(pp, {
  left: PEN_LEN,
  at: G.q
 });
 G.pens++;
 G.penLog.push({
  side: pp.side,
  foul: pp.foul,
  who: pp.who ? pp.who.id : null,
  q: G.q
 });
 G.emo = null;
 G.md = null;
 screen = 'penalty';
 panelDirty();
 SFX.whistle();
 return true;
}

function penaltyChoose(v) {
 const G = game;
 if (!G || !G.pen) {
  setupPossession();
  return;
 }
 if (G.pen.side === 'C') {
  G.emo = EMO[v] ? v : '3-3 EMO';
  setupPossession();
  addFx('cue', 0, 0, {
   s: 'MAN-UP: ' + G.emo,
   col: '#ffe14d',
   life: 1.4
  });
 } else {
  G.md = ZONES[v] ? v : 'ZONE ROTATE';
  startCpu();
 }
}

function penaltyOver(why) {
 const G = game;
 const pen = G.pen;
 if (!pen) return;
 G.pen = null;
 G.emo = null;
 addFx('cue', 0, 0, {
  s: why === 'goal' ? 'GOAL - PENALTY RELEASED' : 'PENALTY OVER - FULL STRENGTH',
  col: '#8fe3f0',
  life: 1.4
 });
 if (why === 'goal') return;
 if (screen === 'defense' && G.players) {
  if (pen.side === 'U') {
   const used = new Set(G.players.filter(p => p.team === 'O').map(p => p.idx)), idx = [ 0, 1, 2, 3, 4, 5 ].find(i => !used.has(i));
   if (idx != null) {
    const a = G.players.find(q => q.team === 'D' && !G.players.some(d => d.team === 'O' && d.mark === q)) || null, d = mkPlayer('O', idx, MIDX - 20, FT + 12);
    d.pl = pen.who && !isEjected(pen.who) ? pen.who : defUnit(G.lu[0])[idx];
    d.rr = idx <= 2 ? 'M' : 'D';
    d.mark = a;
    if (a) a.mark0 = d;
    d.react = .3;
    G.players.splice(G.players.findIndex(p => p.team === 'G2') >= 0 ? G.players.findIndex(p => p.team === 'G2') : G.players.length, 0, d);
   }
  } else {
   const used = new Set(G.players.filter(p => p.team === 'D').map(p => p.idx)), idx = [ 0, 1, 2, 3, 4, 5 ].find(i => !used.has(i));
   if (idx != null) {
    const sp = (SETS[G.cpuSet] || SETS[SET_NAMES[0]])[idx] || [ FL - MIDX - 40, CY ], a = mkPlayer('D', idx, MIDX - 20, FT + 12);
    a.pl = pen.who && !isEjected(pen.who) ? pen.who : offUnit(G.lu[1])[idx];
    a.rr = idx <= 2 ? 'M' : 'A';
    a.home = [ FL - sp[0], sp[1] ];
    a.wt = rnd(.2, 1);
    a.tgt = a.home.slice();
    const d = G.players.find(q => q.team === 'O' && (!q.mark || !G.players.includes(q.mark)));
    if (d) {
     d.mark = a;
     a.mark0 = d;
    }
    G.players.splice(G.players.filter(p => p.team === 'D').length, 0, a);
   }
  }
  return;
 }
 if (screen !== 'live') return;
 if (pen.side === 'C') {
  const att = G.players.find(a => a.team === 'O' && !G.players.some(d => d.team === 'D' && d.mark === a));
  if (att) {
   const d = mkPlayer('D', att.idx, MIDX + 20, FT + 12);
   d.mark = att;
   att.mark0 = d;
   d.pl = pen.who && !isEjected(pen.who) ? pen.who : defUnit(G.lu[1])[att.idx];
   d.rr = att.idx <= 2 ? 'M' : 'D';
   d.react = .3;
   G.players.push(d);
  }
 } else {
  const used = new Set(G.players.filter(p => p.team === 'O').map(p => p.idx));
  const idx = [ 0, 1, 2, 3, 4, 5 ].find(i => !used.has(i));
  if (idx != null) {
   const sp = curSpots(), a = mkPlayer('O', idx, MIDX + 20, FT + 12);
   a.home = sp[idx].slice();
   a.pl = offUnit(G.lu[0])[idx];
   a.wander = 0;
   const d = G.players.find(q => q.team === 'D' && !G.players.includes(q.mark));
   if (d) {
    d.mark = a;
    a.mark0 = d;
   }
   G.players.push(a);
  }
 }
}

function pickVictim(list, who, avoid) {
 const c = list.filter(p => p !== avoid);
 return c.find(p => who && p.pl === who) || c[c.length - 1];
}

function dropPlayer(v) {
 const G = game;
 G.players = G.players.filter(p => p !== v);
 for (const p of G.players) {
  if (p.mark === v) p.mark = null;
  if (p.mark0 === v) p.mark0 = null;
 }
}

function removePlayer(v) {
 const G = game;
 G.players = G.players.filter(p => p !== v);
 for (const p of G.players) {
  if (p.mark === v) p.mark = null;
  if (p.mark0 === v) p.mark0 = null;
 }
 G.boxed = v;
}

function applyPenaltyLive() {
 const G = game;
 if (!G.pen) return;
 const team = G.pen.side === 'C' ? 'D' : 'O';
 const v = pickVictim(G.players.filter(p => p.team === team), G.pen.who, G.carrier && G.players.includes(G.carrier) ? G.carrier : null);
 if (!v) return;
 const marked = team === 'O' ? G.players.find(d => d.team === 'D' && d.mark === v) : null;
 removePlayer(v);
 if (marked) marked.mark = {
  x: GX - 22,
  y: CY,
  ghost: true
 };
 if (team === 'D') G.cpuMD = pick([ 'BOX + 1', 'ZONE ROTATE', 'CREASE STRING' ]);
}

function applyPenaltyCpu() {
 const G = game;
 if (!G.pen) return;
 if (G.pen.side === 'U') removePlayer(pickVictim(G.players.filter(p => p.team === 'O'), G.pen.who, null)); else {
  const car = G.players.find(p => p.team === 'D');
  removePlayer(pickVictim(G.players.filter(p => p.team === 'D'), G.pen.who, car));
 }
}

function applyPenaltyFaceoff() {
 const G = game;
 if (!G.pen) return;
 const team = G.pen.side === 'C' ? 'D' : 'O';
 const w = G.players.filter(p => p.team === team && p.role === 'wing');
 if (w.length) removePlayer(w[w.length - 1]);
}

function drawGameButtons() {
 const G = game, cx = W / 2, y = H - 11 - sa2403Dy(H - 11, 11);
 if (G.tutorial) return;
 const small = (key, label, x, w, on, fn, col) => {
  hit(key, x, y, w, 11, fn, key);
  rect(x, y + 1, w, 10, '#000');
  rect(x, y, w, 10, on ? col || '#2cc4dc' : 'rgba(30,40,50,.85)');
  text(label, x + w / 2, y + 3, 1, on ? '#0b1a20' : '#cfe', 'center');
 };
 const man = G.pen && G.pen.side === 'C';
 small('OFFENSE SET', man ? 'EMO' : G.oset, cx + 12, 30, true, () => {
  if (!man) setOffense(USER_SETS[(USER_SETS.indexOf(G.oset) + 1) % USER_SETS.length]);
 });
 small('DEFENSE MAN ZONE', dsetLabel(G), cx + 45, Math.max(26, textW(dsetLabel(G)) + 4), true, () => dsetNext(G), G.dset === 'zone' ? '#ff9a4a' : G.dset === 'black' ? '#c9d6d9' : G.dset === 'custom' ? '#ffe14d' : '#7dff7a');
}

function drawPenTag() {
 const G = game;
 if (!G || !G.pen || screen === 'final' || screen === 'pregame') return;
 const up = G.pen.side === 'C', s = (up ? 'MAN-UP ' : 'MAN-DOWN ') + fmtClock(G.pen.left);
 const w = textW(s) + 8, x = W - w - 3, y = 19;
 rect(x, y, w, 10, up ? 'rgba(255,225,77,.9)' : 'rgba(255,90,74,.9)');
 text(s, x + 4, y + 3, 1, '#0b1a20');
}

function drawPenaltyBox() {
 const G = game;
 if (!G || !G.pen) return;
 const x = MIDX + 34, y = FT - 1, pen = G.pen;
 rect(x - 9, 17, 19, FT - 17, 'rgba(0,0,0,.55)');
 const kit = pen.side === 'C' ? G.ok : G.uk;
 drawPlayer({
  x: x,
  y: y,
  anim: 0
 }, kit, pen.side !== 'C');
 text(Math.ceil(pen.left), x + 12, 20, 1, '#ffe14d');
 text('BOX', x - 22, 20, 1, '#cfe');
}

const PM_LBL = [ 'M1', 'M2', 'M3', 'A1', 'A2', 'A3' ];

const PM_ROLE = [ 'M', 'M', 'M', 'A', 'A', 'A' ];

const PM_START = [ [ GX - 122, CY - 44 ], [ GX - 134, CY ], [ GX - 122, CY + 44 ], [ GX - 36, CY - 52 ], [ GX + 22, CY ], [ GX - 36, CY + 52 ] ];

const PM_HOLD = .5, PM_PICK_R = 17, PM_PRESS = .45, PM_TAP_MAX = .3;

let PM = null;

function playsAll() {
 const v = LS.get('plays', []);
 return Array.isArray(v) ? v.filter(p => p && Array.isArray(p.start) && Array.isArray(p.steps)) : [];
}

function playsSave(list) {
 LS.set('plays', list);
}

function playById(id) {
 return pbAll().find(p => p.id === id) || null;
}

function pmClampSpot(x, y, cat) {
 if (cat && pmFull(cat)) return [ Math.round(clamp(x, 10, ENDX - 6)), Math.round(clamp(y, FT + 12, FB - 4)) ];
 if (cat === 'D') return [ Math.round(clamp(x, MIDX + 10, ENDX - 6)), Math.round(clamp(y, FT + 12, FB - 4)) ];
 x = clamp(x, MIDX + 10, ENDX - 6);
 y = clamp(y, FT + 12, FB - 4);
 const cx = x - GX, cy = y - CY, cd = Math.hypot(cx, cy);
 if (cd < CREASE + 4) {
  x = GX + cx / (cd || 1) * (CREASE + 4);
  y = CY + cy / (cd || 1) * (CREASE + 4);
 }
 return [ Math.round(x), Math.round(y) ];
}

function openPlaymaker(origin, play, cat) {
 const pl = play ? JSON.parse(JSON.stringify(play)) : {
  id: null,
  name: '',
  cat: PM_CATS.includes(cat) ? cat : 'OFFENSE',
  start: pmStartFor(PM_CATS.includes(cat) ? cat : 'OFFENSE'),
  car: null,
  steps: []
 };
 if (!pl.cat) pl.cat = 'OFFENSE';
 const bi = !!(play && play.builtin);
 if (bi) {
  delete pl.builtin;
  delete pl.id;
  pl.name = '';
 }
 PM = {
  origin: origin || 'menu',
  play: pl,
  drag: null,
  preview: null,
  msg: bi ? 'BUILT-IN ' + play.name + ' - EDIT + SAVE AS YOUR OWN' : '',
  editId: play && !bi ? play.id : null,
  flash: bi ? 1.4 : 0,
  t: 0,
  ghost: 'MAN'
 };
 screen = 'playmaker';
 camX = FL - W + PADW;
 panelDirty();
}

function pmState(pl, upto) {
 const pos = pl.start.map(q => q.slice());
 let car = pl.car;
 const picks = {};
 let shot = false;
 const n = upto == null ? pl.steps.length : upto;
 for (let i = 0; i < n; i++) {
  const s = pl.steps[i];
  if (s.t === 'move' || s.t === 'pick') {
   pos[s.p] = [ s.x, s.y ];
   delete picks[s.p];
   if (s.t === 'pick') picks[s.p] = s.on;
  } else if (s.t === 'pass') {
   car = s.to;
   delete picks[s.to];
  } else if (s.t === 'shot') shot = true;
 }
 return {
  pos: pos,
  car: car,
  picks: picks,
  shot: shot
 };
}

const PM_TL = {
 spd: 70,
 pass: 170,
 beat: .35,
 shot: .5
};

function pmTimeline(pl) {
 const pos = pl.start.map(q => q.slice()), free = pl.start.map(() => 0), gotBall = pl.start.map((q, i) => i === pl.car ? 0 : null);
 let car = pl.car, ballT = 0;
 const segs = [], balls = [];
 pl.steps.forEach((s, j) => {
  if (s.t === 'move' || s.t === 'pick') {
   let t0 = free[s.p];
   if (s.p === car && gotBall[s.p] != null) t0 = Math.max(t0, gotBall[s.p]);
   const a = pos[s.p], d = Math.hypot(s.x - a[0], s.y - a[1]), t1 = t0 + Math.max(.3, d / PM_TL.spd);
   segs.push({
    j: j,
    p: s.p,
    t0: t0,
    t1: t1,
    a: a.slice(),
    b: [ s.x, s.y ],
    pick: s.t === 'pick',
    on: s.on
   });
   pos[s.p] = [ s.x, s.y ];
   free[s.p] = t1;
  } else if (s.t === 'pass') {
   const rMoves = segs.some(g => g.p === s.to);
   const t0 = Math.max(ballT, free[s.from], rMoves ? free[s.to] : ballT + PM_TL.beat, gotBall[s.from] != null ? gotBall[s.from] : 0);
   const a = pos[s.from].slice(), c = pos[s.to].slice(), t1 = t0 + Math.max(.3, Math.hypot(c[0] - a[0], c[1] - a[1]) / PM_TL.pass);
   balls.push({
    j: j,
    kind: 'pass',
    from: s.from,
    to: s.to,
    t0: t0,
    t1: t1,
    a: a,
    c: c
   });
   ballT = t1;
   car = s.to;
   gotBall[s.to] = t1;
  } else if (s.t === 'shot') {
   const t0 = Math.max(ballT, free[s.p], ...segs.filter(g => g.pick).map(g => g.t1)), a = pos[s.p].slice();
   balls.push({
    j: j,
    kind: 'shot',
    p: s.p,
    t0: t0,
    t1: t0 + PM_TL.shot,
    a: a
   });
   ballT = t0 + PM_TL.shot;
  }
 });
 const dur = Math.max(.3, ballT, ...segs.map(g => g.t1));
 return {
  segs: segs,
  balls: balls,
  dur: dur
 };
}

function pmPreviewAt(pl, tl, t) {
 const pos = pl.start.map(q => q.slice()), picks = {}, moving = [];
 for (const g of tl.segs) {
  if (t < g.t0) continue;
  const f = clamp((t - g.t0) / (g.t1 - g.t0), 0, 1);
  pos[g.p] = [ g.a[0] + (g.b[0] - g.a[0]) * f, g.a[1] + (g.b[1] - g.a[1]) * f ];
  delete picks[g.p];
  if (f < 1) moving.push(g.p); else if (g.pick) picks[g.p] = g.on;
 }
 let car = pl.car, ball = null, shot = false;
 for (const e of tl.balls) {
  if (t < e.t0) break;
  const f = clamp((t - e.t0) / (e.t1 - e.t0), 0, 1);
  if (e.kind === 'pass') {
   const a = pos[e.from], c = pos[e.to];
   if (f < 1) {
    car = -1;
    ball = [ a[0] + BX + (c[0] - a[0]) * f, a[1] + BY + (c[1] - a[1]) * f ];
   } else {
    car = e.to;
    delete picks[e.to];
   }
  } else {
   const a = pos[e.p];
   if (f < 1) ball = [ a[0] + BX + (GX + 4 - a[0] - BX) * f, a[1] + BY + (CY - 3 - a[1] - BY) * f ];
   car = -1;
   shot = true;
  }
 }
 return {
  pos: pos,
  car: car,
  picks: picks,
  shot: shot,
  ball: ball,
  moving: moving
 };
}

function pmStepText(s) {
 if (s.t === 'move') return pmLbl(s.p) + ' MOVES';
 if (s.t === 'pick') return pmLbl(s.p) + ' PICKS FOR ' + pmLbl(s.on);
 if (s.t === 'pass') return pmLbl(s.from) + ' PASSES TO ' + pmLbl(s.to);
 if (s.t === 'shot') return pmLbl(s.p) + ' SHOOTS';
 return '';
}

function pmWorld(pt) {
 const v = pmView();
 if (v) return {
  x: (pt.x - v.ox) / v.k,
  y: (pt.y - v.oy) / v.k
 };
 return {
  x: pt.x + Math.round(camX),
  y: pt.y
 };
}

function pmPieceAt(wx, wy, pos, skip) {
 let best = -1, bd = pmView() ? 17 : 13;
 pos.forEach((q, i) => {
  if (i === skip) return;
  const d = Math.hypot(q[0] - wx, q[1] - 6 - wy);
  if (d < bd) {
   bd = d;
   best = i;
  }
 });
 return best;
}

function pmOnCage(wx, wy) {
 return wx > GX - 8 && wx < GX + 14 && Math.abs(wy - CY) < 13;
}

function pmNearMate(i, x, y, pos) {
 let best = -1, bd = PM_PICK_R;
 pos.forEach((q, j) => {
  if (j === i) return;
  const d = Math.hypot(q[0] - x, q[1] - y);
  if (d < bd) {
   bd = d;
   best = j;
  }
 });
 return best;
}

function pmPush(step) {
 const pl = PM.play;
 pl.steps.push(step);
 PM.msg = pmStepText(step);
 PM.flash = .8;
 SFX.tap();
 if (game && game.tutorial) {
  if (step.t === 'pick') tutFlag('pmPick');
  if (step.t === 'move') tutFlag('pmMove');
  if (step.t === 'pass') tutFlag('pmPass');
 }
}

function pmDown(pt) {
 if (!PM || PM.preview) return;
 const w = pmWorld(pt), st = pmState(PM.play), i = pmPieceAt(w.x, w.y, st.pos);
 pt.pm = {
  i: i,
  w0: w,
  t0: now(),
  cage: i < 0 && pmOnCage(w.x, w.y),
  still: now(),
  sx: pt.cx,
  sy: pt.cy,
  pick: false
 };
}

function pmMove(pt) {
 const d = pt.pm;
 if (!d || d.i < 0 || !PM || PM.preview) return;
 if (Math.hypot(pt.cx - d.sx, pt.cy - d.sy) > 5) {
  d.still = now();
  d.sx = pt.cx;
  d.sy = pt.cy;
  if (d.pick && d.dragging) {
   d.pick = false;
  }
 }
 if (pt.moved >= 9) d.dragging = true;
 if (d.dragging) {
  const w = pmWorld(pt);
  d.at = pmClampSpot(w.x, w.y + 6, pmCat(PM.play));
 }
}

function pmTick(dt) {
 if (!PM) return;
 PM.t += dt;
 PM.flash = Math.max(0, PM.flash - dt);
 if (PM.preview) {
  PM.preview.t += dt;
  if (PM.preview.t > PM.preview.dur + .8) PM.preview = null;
  return;
 }
 for (const pt of pointers.values()) {
  const d = pt.pm;
  if (!d || d.i < 0 || d.pick || d.unpick) continue;
  if (!d.dragging && now() - d.t0 >= PM_PRESS) {
   const st = pmState(PM.play);
   if (st.car != null && st.car >= 0 && !st.shot && d.i !== st.car) {
    const at = st.pos[d.i];
    if (st.picks[d.i] != null) {
     d.unpick = true;
     SFX.tap();
     addFx('txt', at[0], at[1] - 26, {
      s: 'PICK OFF',
      col: '#fff',
      life: .7
     });
     continue;
    }
    let on = pmNearMate(d.i, at[0], at[1], st.pos);
    if (on < 0) on = st.car;
    d.pick = true;
    d.on = on;
    d.at = at.slice();
    SFX.catch();
    addFx('txt', at[0], at[1] - 26, {
     s: 'PICK!',
     col: '#ffe14d',
     life: .7
    });
   }
   continue;
  }
  if (now() - d.still >= PM_HOLD) {
   const st = pmState(PM.play), at = d.at || st.pos[d.i], on = pmNearMate(d.i, at[0], at[1], st.pos);
   if (on >= 0 && st.car != null && st.car >= 0 && !st.shot && d.i !== st.car) {
    d.pick = true;
    d.on = on;
    SFX.catch();
    addFx('txt', at[0], at[1] - 26, {
     s: 'PICK!',
     col: '#ffe14d',
     life: .7
    });
   }
  }
 }
}

function pmUp(pt, cancel) {
 const d = pt.pm;
 if (!d || !PM || cancel) return;
 if (PM.preview) return;
 const pl = PM.play, st = pmState(pl);
 if (d.i < 0) {
  if (d.cage && pt.moved < TAP_PX) pmShot();
  return;
 }
 if (st.shot) {
  PM.msg = 'THE PLAY ENDED ON THE SHOT - UNDO OR SAVE';
  SFX.bad();
  return;
 }
 if (d.unpick && !d.dragging) {
  const at = st.pos[d.i];
  pmPush({
   t: 'move',
   p: d.i,
   x: at[0],
   y: at[1]
  });
  PM.msg = pmLbl(d.i) + ' PICK OFF';
  return;
 }
 if (d.dragging || d.pick) {
  const at = d.at || st.pos[d.i];
  if (st.car == null) {
   pl.start[d.i] = at.slice();
   PM.msg = pmLbl(d.i) + ' STARTS HERE';
   return;
  }
  if (d.pick) pmPush({
   t: 'pick',
   p: d.i,
   x: at[0],
   y: at[1],
   on: d.on
  }); else pmPush({
   t: 'move',
   p: d.i,
   x: at[0],
   y: at[1]
  });
  return;
 }
 if (pt.moved >= TAP_PX) return;
 const dur = now() - d.t0;
 if (pmFormOnly(pmCat(pl))) {
  if (st.car == null) {
   pl.car = -2;
   PM.msg = 'ROUTES ON - DRAG A GUY = HIS RUN (TAP = ROUTES OFF)';
   PM.flash = 1.2;
   SFX.catch();
   return;
  }
  if (!pl.steps.length) {
   pl.car = null;
   PM.msg = 'ROUTES OFF - DRAG = WHERE HE LINES UP';
   PM.flash = 1.2;
   SFX.tap();
   return;
  }
  PM.msg = 'NO PASSES IN A ' + pmCat(pl) + ' CALL - DRAG GUYS';
  PM.flash = 1;
  return;
 }
 if (st.car == null) {
  pl.car = d.i;
  PM.msg = pmLbl(d.i) + ' HAS THE BALL - NOW DRAG GUYS + TAP TO PASS';
  SFX.catch();
  return;
 }
 if (d.i === st.car) {
  PM.msg = 'HE HAS IT - DRAG HIM TO MOVE, TAP A TEAMMATE TO PASS';
  return;
 }
 if (dur >= PM_TAP_MAX) {
  PM.msg = 'QUICK TAP = PASS. HOLD (RING FILLS) = PICK';
  return;
 }
 pmPush({
  t: 'pass',
  from: st.car,
  to: d.i
 });
}

function pmShot() {
 if (pmCat(PM.play) === 'CLEAR' || pmFormOnly(pmCat(PM.play))) {
  PM.msg = 'NO SHOT IN A ' + pmCat(PM.play) + ' PLAY';
  PM.flash = 1;
  SFX.bad();
  return;
 }
 const st = pmState(PM.play);
 if (st.car == null) {
  PM.msg = 'TAP A GUY TO GIVE HIM THE BALL FIRST';
  SFX.bad();
  return;
 }
 if (st.shot) return;
 pmPush({
  t: 'shot',
  p: st.car
 });
}

function pmUndo() {
 const pl = PM.play;
 if (pl.steps.length) {
  const s = pl.steps.pop();
  PM.msg = 'UNDO: ' + pmStepText(s);
 } else if (pl.car != null) {
  pl.car = null;
  PM.msg = 'TAP A GUY TO GIVE HIM THE BALL';
 }
}

function pmClear() {
 PM.play.steps = [];
 PM.play.car = null;
 PM.play.start = pmStartFor(pmCat(PM.play));
 PM.msg = 'CLEARED';
}

function pmPreview() {
 if (PM.preview) {
  PM.preview = null;
  return;
 }
 if (!PM.play.steps.length) {
  PM.msg = 'ADD SOME STEPS FIRST';
  return;
 }
 const tl = pmTimeline(PM.play);
 PM.preview = {
  t: 0,
  dur: tl.dur,
  tl: tl
 };
 if (game && game.tutorial) tutFlag('pmPrev');
}

const PM_TUT = [ [ 'pmMove', 'DRAG A GUY = HIS ROUTE (MOVES)' ], [ 'pmPass', 'TAP A TEAMMATE = A PASS' ], [ 'pmPrev', 'PREVIEW - THEY ALL MOVE AT ONCE' ], [ 'pmSaved', 'SAVE IT' ] ];

function pmTutMissing() {
 const G = game;
 if (!G || !G.tutorial || !PM || PM.origin !== 'tutorial') return null;
 const f = G.tutorial.f;
 const m = PM_TUT.slice(0, 3).find(([k]) => !f[k]);
 return m ? m[1] : null;
}

function pmSaveAsk() {
 const pl = PM.play;
 if (!pmFormOnly(pmCat(pl)) && (pl.car == null || !pl.steps.length)) {
  PM.msg = 'GIVE SOMEONE THE BALL AND ADD A STEP FIRST';
  SFX.bad();
  return;
 }
 {
  const miss = pmTutMissing();
  if (miss) {
   PM.msg = 'TUTORIAL - FIRST: ' + miss;
   PM.flash = 1.2;
   SFX.bad();
   return;
  }
 }
 screen = 'pmSave';
 panelDirty();
}

function pmSaveGo(name) {
 const pl = PM.play, list = playsAll();
 name = String(name || '').replace(/[^\w #&'!?.+-]/g, '').trim().toUpperCase().slice(0, 18) || 'PLAY ' + (list.length + 1);
 pl.name = name;
 if (PM.editId) {
  const k = list.findIndex(p => p.id === PM.editId);
  if (k >= 0) list[k] = Object.assign({}, pl, {
   id: PM.editId
  }); else {
   pl.id = PM.editId;
   list.push(pl);
  }
 } else {
  pl.id = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  pl.made = Date.now();
  list.push(JSON.parse(JSON.stringify(pl)));
  PM.editId = pl.id;
 }
 playsSave(list);
 pmSaved = {
  id: PM.editId,
  name: name
 };
 if (game && game.tutorial) tutFlag('pmSaved');
 if (PM.origin === 'timeout' && game) {
  game.playSel = PM.editId;
  game.playRun = null;
  screen = 'timeout';
  PM = null;
  panelDirty();
  addFx('cue', 0, 0, {
   s: 'PLAY READY: ' + name,
   col: '#ffe14d',
   life: 1.4
  });
  return;
 }
 if (PM.origin === 'tutorial' && game) {
  screen = 'live';
  PM = null;
  return;
 }
 screen = 'playmaker';
 PM.msg = 'SAVED: ' + name;
 panelDirty();
}

let pmSaved = null;

function pmBack() {
 if (!PM) {
  screen = 'menu';
  return;
 }
 const o = PM.origin;
 PM = null;
 if (o === 'timeout' && game) {
  screen = 'timeout';
  panelDirty();
  return;
 }
 if (o === 'tutorial' && game) {
  screen = 'live';
  return;
 }
 screen = 'menu';
}

function drawPiece(x, y, i, st, kit) {
 const p = {
  x: x,
  y: y,
  anim: 0
 };
 drawPlayer(p, kit, true);
 drawStick(p, true, false);
 const pk = st.picks[i] != null;
 text(pmLbl(i), x, y - 27 < FT + 2 ? y + 6 : y - 27, 1, pmRole(i) === 'A' ? '#ffd6d6' : pmRole(i) === 'G' ? '#ffe9a8' : pmRole(i) === 'D' ? '#cfe3ff' : '#d6ffdc', 'center', '#000');
 if (pk) {
  rect(x - 9, y + 1, 18, 3, '#ffe14d');
  rect(x - 9, y + 1, 18, 1, '#fff');
  text('PICK', x, y + 5, 1, '#ffe14d', 'center', '#000');
 }
}

function choosePlay(id) {
 const G = game;
 if (!G) return;
 endPlayRun();
 psetEnd();
 G.playSel = id && playById(id) ? id : null;
 G.playPoss = -1;
 if (G.tutorial && G.playSel) tutFlag('pbPicked');
 if (G.tutorial && !G.playSel) tutFlag('pbNone');
}

function endPlayRun() {
 const G = game;
 if (!G) return;
 G.playRun = null;
 G.pAuto = null;
 for (const p of G.players || []) if (p.playT || p.pickSet || p.playHold) {
  p.playT = null;
  p.pickSet = null;
  p.playHold = null;
  p.wander = 0;
 }
}

function playMap(pl, noCar) {
 const G = game, field = G.players.filter(p => p.team === 'O'), map = new Array(pl.start.length).fill(null), used = new Set;
 const inv = pl.start.map((q, i) => (pl.car === i ? 99 : 0) + pl.steps.filter(s => s.p === i || s.from === i || s.to === i || s.on === i).length);
 if (!noCar && pl.car != null && G.carrier && G.carrier.team === 'O') {
  map[pl.car] = G.carrier;
  used.add(G.carrier);
 }
 const order = pl.start.map((q, i) => i).filter(i => map[i] == null).sort((a, b) => inv[b] - inv[a]);
 for (const i of order) {
  let best = null, bs = 1e9;
  for (const p of field) {
   if (used.has(p)) continue;
   const s = Math.hypot(p.x - pl.start[i][0], p.y - pl.start[i][1]) + (rrOf(p) === pmRole(i, pl) ? 0 : 40);
   if (s < bs) {
    bs = s;
    best = p;
   }
  }
  if (best) {
   map[i] = best;
   used.add(best);
  }
 }
 return map;
}

const SET_R = 3, SET_MAX = 3.5;

function aroundCage(p, x, y) {
 const R0 = CREASE + 9, dx = x - p.x, dy = y - p.y, L2 = dx * dx + dy * dy || 1;
 const t = clamp(((GX - p.x) * dx + (CY - p.y) * dy) / L2, 0, 1), cd = Math.hypot(p.x + dx * t - GX, p.y + dy * t - CY);
 if (cd > R0 - 3 || x < GX - 2 && Math.hypot(x - GX, y - CY) < R0 + 4) return [ x, y ];
 const s = Math.abs(p.y - CY) > 3 ? Math.sign(p.y - CY) : Math.abs(y - CY) > 3 ? Math.sign(y - CY) : -1, k = R0 * .75;
 const behindT = x > GX, behindP = p.x > GX + k - 1, frontP = p.x < GX - k + 1;
 const F = [ GX - k, CY + s * R0 ], B = [ GX + k, CY + s * R0 ], at = q => Math.hypot(p.x - q[0], p.y - q[1]) < 3;
 if (behindT && frontP) return at(F) ? B : F;
 if (!behindT && behindP) return at(B) ? F : B;
 const q = behindT ? B : F;
 return at(q) ? [ x, y ] : q;
}

const on284 = () => !window.__rl_no284plays && !window.__rl_v124gb;

const on287 = () => !window.__rl_no287plays;

function half287(pl) {
 return on287() && !!pl && !pmFull(pmCat(pl));
}

function wait287(pl) {
 const G = game;
 return half287(pl) && (!!G.clearing || G.clrT287 > 0 || !G.carrier || G.carrier.x < MIDX + 4);
}

function stale287(P) {
 const G = game;
 return !!P && half287(P.pl) && (!!G.clearing || P.map.some(p => p && !G.players.includes(p)));
}

function open284(p) {
 let m = 99;
 for (const d of game.players) if (d.team === 'D' && !d.goalie && !d.gk && !(d.stun > 0)) m = Math.min(m, Math.hypot(d.x - p.x, d.y - p.y));
 return m;
}

function cage284(p, x, y) {
 const bx = GX + CREASE + 10;
 if (p.x > GX + 4 && x > GX + 4 && Math.sign(p.y - CY) !== Math.sign(y - CY) && segDist(GX, CY, p.x, p.y, x, y) < CREASE + 8) return Math.abs(p.x - bx) > 3 && p.x < bx ? [ bx, p.y ] : [ Math.max(x, bx), y ];
 return aroundCage(p, x, y);
}

function assign284(PS) {
 const G = game, who = PS.map.filter(p => p), n = PS.spots.length;
 if (who.length !== n || n > 7) return;
 let best = null, bs = 1e9;
 const perm = [], used = new Array(n).fill(false);
 const go = (i, acc) => {
  if (acc >= bs) return;
  if (i === n) {
   bs = acc;
   best = perm.slice();
   return;
  }
  for (let j = 0; j < n; j++) {
   if (used[j]) continue;
   used[j] = true;
   perm[i] = j;
   go(i + 1, acc + Math.hypot(who[j].x - PS.spots[i][0], who[j].y - PS.spots[i][1]));
   used[j] = false;
  }
 };
 go(0, 0);
 if (!best) return;
 PS.map = best.map(j => who[j]);
 PS.d284 = Math.round(bs);
 G.assign284 = (G.assign284 || 0) + 1;
}

function playFromSet(pl) {
 const G = game;
 if (!G || !pl || !SETS[G.oset]) return null;
 if (on284() && !pl.builtin && pl.start && pl.start.length === 6) return null;
 const c = pmCat(pl);
 if (c !== 'OFFENSE' && c !== 'MAN-UP') return null;
 if (!pl.start || pl.start.length !== 6) return null;
 return SETS[G.oset];
}

function playMapSet(pl, SS, noCar) {
 const G = game, field = G.players.filter(p => p.team === 'O' && p.idx >= 0 && p.idx < 6);
 const byIdx = [];
 for (const p of field) if (!byIdx[p.idx]) byIdx[p.idx] = p;
 const car = !noCar && pl.car != null && G.carrier && G.carrier.team === 'O' && byIdx[G.carrier.idx] === G.carrier ? G.carrier.idx : -1;
 const cost = (i, j) => Math.hypot(pl.start[i][0] - SS[j][0], pl.start[i][1] - SS[j][1]) + ((j <= 2 ? 'M' : 'A') === pmRole(i, pl) ? 0 : 40);
 let best = null, bs = 1e9;
 const perm = [], used = [ false, false, false, false, false, false ];
 const go = (i, acc) => {
  if (acc >= bs) return;
  if (i === 6) {
   bs = acc;
   best = perm.slice();
   return;
  }
  for (let j = 0; j < 6; j++) {
   if (used[j]) continue;
   if (car >= 0 && i === pl.car !== (j === car)) continue;
   used[j] = true;
   perm[i] = j;
   go(i + 1, acc + cost(i, j));
   used[j] = false;
  }
 };
 go(0, 0);
 if (!best) return null;
 return {
  map: best.map(j => byIdx[j] || null),
  spots: best.map(j => pmClampSpot(SS[j][0], SS[j][1])),
  set: G.oset
 };
}

function psetEnd() {
 const G = game;
 if (!G) return;
 if (G.pset) for (const p of G.pset.map) if (p) {
  p.playT = null;
  p.playHold = null;
  p.set284 = false;
 }
 G.pset = null;
 G.pAuto = null;
}

function playSetBtnState() {
 const G = game;
 if (!G || screen !== 'live' || !G.playSel || G.tutorial) return null;
 if (G.pset) return G.pset.phase === 'ready' ? 'RUN' : 'SETTING';
 if (G.playRun && !G.playRun.done && !G.playRun.userTook) return 'RUNNING';
 return canShoot() && !wait287(playById(G.playSel)) ? 'SET' : null;
}

const on2317 = () => !window.__rl_no2317 && !window.__rl_v124gb;

const SAG17 = {
 cush: 34,
 room: 20,
 top: GX - 100,
 xMin: GX + 10,
 xY: 22,
 wing: 40,
 xAt: [ GX + 22, CY ]
};

function setSag17() {
 const G = game, S = G && G.pset;
 return !!(S && S.on17 && on2317() && screen === 'live' && !G.tutorial && (S.phase === 'set' || S.ap17 === 'fly'));
}

function startOk17(q) {
 return !!q && (q[0] <= SAG17.top || Math.abs(q[1] - CY) >= SAG17.wing || q[0] >= SAG17.xMin && Math.abs(q[1] - CY) <= SAG17.xY);
}

function startFix17(pl) {
 const own = pmClampSpot(pl.start[pl.car][0], pl.start[pl.car][1]);
 if (startOk17(own)) return own;
 const [x, y] = own, s = y >= CY ? 1 : -1, c = [ [ Math.min(x, SAG17.top), y ], [ x, CY + s * SAG17.wing ], SAG17.xAt.slice() ].map(q => pmClampSpot(q[0], q[1])).filter(startOk17);
 return c.sort((a, b) => Math.hypot(a[0] - x, a[1] - y) - Math.hypot(b[0] - x, b[1] - y))[0] || SAG17.xAt.slice();
}

function apCat17(pl) {
 const c = pmCat(pl);
 return (c === 'OFFENSE' || c === 'MAN-UP') && pl.car != null && pl.car >= 0 && !!(pl.start && pl.start[pl.car]);
}

function ap17Tick(S, all) {
 const G = game, st = S.st17, b = G.ball;
 if (!st || !G.players.includes(st)) {
  S.ap17 = null;
  return false;
 }
 if (S.ap17 === 'wait') {
  if (!all) return true;
  const c = G.carrier;
  if (c === st) {
   S.ap17 = 'done';
   return false;
  }
  if (!c || c.team !== 'O' || b.state !== 'held' || st.down > 0) return true;
  const lf = G.lateFoul;
  throwPass(st);
  G.lateFoul = lf;
  b.intercept = null;
  S.ap17 = 'fly';
  S.apT = S.t;
  G.ap17n = (G.ap17n || 0) + 1;
  return true;
 }
 if (S.ap17 === 'fly') {
  if (G.carrier === st && b.state === 'held') {
   S.ap17 = 'done';
   G.ap17ok = (G.ap17ok || 0) + 1;
   return false;
  }
  if (b.state !== 'pass') {
   S.ap17 = 'done';
   return false;
  }
  return true;
 }
 return false;
}

function playSet() {
 const G = game;
 if (!G || screen !== 'live' || !G.playSel || !canShoot()) return false;
 const pl = playById(G.playSel);
 if (!pl) {
  G.playSel = null;
  return false;
 }
 if (wait287(pl)) return false;
 const ap = on2317() && apCat17(pl);
 const SS = playFromSet(pl), FS = SS ? playMapSet(pl, SS, ap) : null;
 const PS = FS ? {
  pl: pl,
  map: FS.map,
  t: 0,
  phase: 'set',
  poss: G.possCount,
  spots: FS.spots,
  lp: [],
  lt: [],
  fromSet: FS.set
 } : {
  pl: pl,
  map: playMap(pl, ap),
  t: 0,
  phase: 'set',
  poss: G.possCount,
  spots: pl.start.map(q => pmClampSpot(q[0], q[1])),
  lp: [],
  lt: []
 };
 if (on284() && !FS && ap) {
  assign284(PS);
  PS.p284 = true;
 }
 if (ap) {
  const q0 = PS.spots[pl.car];
  if (!startOk17(q0)) {
   PS.spots[pl.car] = startFix17(pl);
   PS.moved17 = [ q0.slice(), PS.spots[pl.car].slice() ];
   G.start17mv = (G.start17mv || 0) + 1;
  }
  const st = PS.map[pl.car];
  PS.st17 = st || null;
  PS.ap17 = st && st !== G.carrier ? 'wait' : null;
 }
 PS.on17 = on2317();
 endPlayRun();
 psetEnd();
 G.pset = PS;
 G.run = null;
 G.setsCalled = (G.setsCalled || 0) + 1;
 addFx('cue', 0, 0, {
  s: 'SET: ' + (G.pset.fromSet ? G.pset.fromSet + ' > ' : '') + pl.name,
  col: '#ff9a4a',
  life: 1.2
 });
 SFX.tap();
 return true;
}

function playGo() {
 const G = game, S = G && G.pset;
 if (!S || S.phase !== 'ready' || screen !== 'live') return false;
 G.pset = null;
 G.pAuto = null;
 for (const p of S.map) if (p) {
  p.playHold = null;
  p.playT = null;
 }
 G.playRun = {
  pl: S.pl,
  map: S.map,
  i: 0,
  t: 0,
  st: 0,
  poss: G.possCount,
  ring: null,
  mark: null,
  log: [],
  auto: true
 };
 G.playsRun = (G.playsRun || 0) + 1;
 G.playPoss = G.possCount;
 addFx('cue', 0, 0, {
  s: 'RUN: ' + S.pl.name,
  col: '#7dff7a',
  life: 1.2
 });
 SFX.whistle();
 return true;
}

function psetTick(dt) {
 const G = game, S = G.pset;
 S.t += dt;
 let all = true, n284 = 0, t284 = 0;
 S.map.forEach((p, i) => {
  if (!p || !G.players.includes(p) || p.down > 0) return;
  const [x, y] = S.spots[i], d = Math.hypot(p.x - x, p.y - y);
  if (S.t > SET_MAX && d > SET_R) {
   const w = aroundCage(p, x, y), k = Math.min(1, dt * 3);
   p.x += (w[0] - p.x) * k;
   p.y += (w[1] - p.y) * k;
  }
  if (S.lp[i] == null || d < S.lp[i] - .3) {
   S.lp[i] = d;
   S.lt[i] = S.t;
  }
  const there = d <= SET_R || d <= 16 && S.t - S.lt[i] > .5;
  if (p === G.carrier && S.p284) {
   if (G.run) S.user284 = true;
   if (!S.user284 && d > SET_R) {
    const w = cage284(p, x, y);
    G.pAuto = [ w[0], w[1], 0 ];
   }
   p.set284 = false;
   return;
  }
  if (p === G.carrier) {
   const w = aroundCage(p, x, y);
   G.pAuto = [ w[0], w[1], 1 ];
   G.run = null;
   if (!there) all = false;
   return;
  }
  p.pickSet = null;
  p.callPick = null;
  p.set284 = !!S.p284;
  t284++;
  if (there) n284++;
  if (!there) {
   p.playT = S.p284 ? cage284(p, x, y) : aroundCage(p, x, y);
   p.playHold = null;
   all = false;
  } else {
   p.playT = null;
   p.playHold = d <= SET_R || S.p284 ? [ x, y ] : [ p.x, p.y ];
  }
 });
 if (S.p284 && S.phase === 'set' && (n284 >= t284 - 1 || S.t > 2.5 && !(on287() && S.map.some((p, i) => p && p !== G.carrier && G.players.includes(p) && !(p.down > 0) && Math.hypot(p.x - S.spots[i][0], p.y - S.spots[i][1]) > 40)))) all = true;
 if (S.t > SET_MAX + 1.5) all = true;
 if (S.ap17 && S.phase === 'set' && ap17Tick(S, all)) all = false;
 if (S.phase === 'set' && all) {
  S.phase = 'ready';
  S.readyT = S.t;
  G.setsReady = (G.setsReady || 0) + 1;
  SFX.catch();
 }
 if (S.phase === 'ready' && G.goAuto18 && G.pen) {
  G.goAuto18 = false;
  playGo();
 }
 if (S.phase === 'ready' && G.el2314 && G.el2314.auto && S.pl && S.pl.id === G.el2314.pick) {
  G.el2314.auto = false;
  if (playGo()) G.elRuns = (G.elRuns || 0) + 1;
 }
}

function drawPlaySetBtn() {
 if (drawClrBtn()) return;
 const G = game, st = playSetBtnState();
 if (!st) return;
 const w = 44, h = 16, x = W - w - 3, y = H - h - 3 - sa2403Dy(H - h - 3, h + 1);
 const col = st === 'SET' ? '#ff9a4a' : st === 'RUN' ? '#7dff7a' : 'rgba(30,40,50,.85)';
 if (st === 'SET' || st === 'RUN') hit('PLAYSET', x, y, w, h, () => {
  if (playSetBtnState() === 'SET') playSet(); else if (playSetBtnState() === 'RUN') playGo();
 }, st);
 rect(x, y + 1, w, h, '#000');
 rect(x, y, w, h, col);
 if (st === 'RUN' && Math.floor(menuT * 4) % 2) rect(x, y, w, 1, '#fff');
 text(st === 'RUN' ? 'RUN >' : st, x + w / 2, y + 5, st === 'SET' || st === 'RUN' ? 1 : 1, st === 'SET' || st === 'RUN' ? '#0b1a20' : '#9ab', 'center');
 G.setBtn = {
  st: st,
  x: x,
  y: y,
  w: w,
  h: h
 };
}

function playTick(dt) {
 const G = game;
 if (!G || screen !== 'live') return;
 G.pAuto = null;
 if (on287()) G.clrT287 = G.clearing ? .6 : Math.max(0, (G.clrT287 || 0) - dt);
 if (!G.playSel) {
  if (G.pset) psetEnd();
  return;
 }
 if (G.pset && (G.pset.poss !== G.possCount || !(canShoot() || G.pset.ap17 === 'fly' && G.ball.state === 'pass'))) psetEnd();
 if (G.playRun && G.playRun.poss !== G.possCount) endPlayRun();
 if (G.pset && stale287(G.pset)) {
  psetEnd();
  G.auto27 = null;
  G.stale287 = (G.stale287 || 0) + 1;
 }
 if (G.playRun && !G.playRun.done && stale287(G.playRun)) {
  endPlayRun();
  G.auto27 = null;
  G.stale287 = (G.stale287 || 0) + 1;
 }
 if (G.pset) {
  psetTick(dt);
  return;
 }
 if (!G.playRun) return;
 const R = G.playRun, pl = R.pl, b = G.ball;
 R.t += dt;
 if (ballLive()) return;
 for (const p of R.map) {
  if (!p || !p.pickSet) continue;
  const ps = p.pickSet;
  p.x += (ps.x - p.x) * Math.min(1, dt * 6);
  p.y += (ps.y - p.y) * Math.min(1, dt * 6);
  if (G.t - ps.t > 3.2 && (R.bi || 0) > ps.until) {
   p.pickSet = null;
   p.wander = 0;
   continue;
  }
  for (const d of G.players) {
   if (d.team !== 'D' || ps.hit.includes(d) || Math.hypot(d.x - p.x, d.y - p.y) > 7) continue;
   if (!(G.carrier && (d.mark === G.carrier || G.slide === d || Math.hypot(d.x - G.carrier.x, d.y - G.carrier.y) < 22))) continue;
   ps.hit.push(d);
   d.react = rnd(.7, 1);
   d.tx = d.x;
   d.ty = d.y;
   G.picksSet = (G.picksSet || 0) + 1;
   const ax = d.x - p.x, ay = d.y - p.y, al = Math.hypot(ax, ay) || 1;
   d.x += ax / al * 3;
   d.y += ay / al * 3;
   addFx('txt', p.x, p.y - 26, {
    s: 'PICKED!',
    col: '#7dff7a',
    life: .8
   });
   SFX.save();
  }
 }
 if (!R.plan) R.plan = playPlan(pl);
 const P2 = R.plan;
 R.ri = R.ri || P2.routes.map(() => 0);
 R.pst = R.pst || P2.routes.map(() => 0);
 R.bi = R.bi || 0;
 R.bst = (R.bst || 0) + dt;
 R.mark = null;
 R.ring = null;
 P2.routes.forEach((route, i) => {
  const p = R.map[i];
  let k = R.ri[i];
  const seg = route[k];
  if (!seg) return;
  if (!p || !G.players.includes(p)) {
   R.ri[i] = route.length;
   return;
  }
  if (window.V27 && V27.pgWait && V27.pgWait(R, seg, p)) return;
  if (seg.needBall > R.bi) {
   if (p !== G.carrier && !p.pickSet && !p.callPick) {
    p.playT = null;
    p.playHold = p.playHold || [ p.x, p.y ];
   }
   return;
  }
  R.pst[i] += dt;
  const [x, y] = pmClampSpot(seg.x, seg.y);
  if (p === G.carrier) {
   R.mark = [ x, y ];
   if (on284() && !R.userTook) {
    if (R.car284 === undefined) R.car284 = p; else if (R.car284 !== p) R.userTook = true;
   }
   const auto = R.auto && !R.userTook;
   if (auto) {
    if (G.run) R.userTook = true; else {
     const w = aroundCage(p, x, y);
     G.pAuto = [ w[0], w[1], 0 ];
    }
   }
   if (Math.hypot(p.x - x, p.y - y) < (auto ? SET_R : 16) || R.pst[i] > (auto ? .8 + seg.d / PACE.cut + 2.5 : 2.6)) {
    R.ri[i]++;
    R.pst[i] = 0;
    R.log.push(seg.j);
    p.playHold = [ x, y ];
   }
   return;
  }
  p.pickSet = null;
  p.playHold = null;
  p.playT = aroundCage(p, x, y);
  if (Math.hypot(p.x - x, p.y - y) < 4.5 || R.pst[i] > .8 + seg.d / PACE.cut + 2.5) {
   p.playT = null;
   if (seg.t === 'pick') {
    p.pickSet = {
     x: p.x,
     y: p.y,
     t: G.t,
     until: R.bi,
     hit: []
    };
    addFx('txt', p.x, p.y - 26, {
     s: 'PICK',
     col: '#ffe14d',
     life: .7
    });
   } else p.playHold = [ x, y ];
   R.ri[i]++;
   R.pst[i] = 0;
   R.log.push(seg.j);
  }
 });
 const e = P2.balls[R.bi];
 if (e && !(window.V27 && V27.pgWaitBall && V27.pgWaitBall(R, e))) {
  const ready = (pi, need) => (R.ri[pi] || 0) >= need || !R.map[pi];
  if (e.kind === 'pass') {
   const to = R.map[e.to];
   if (!to || !G.players.includes(to)) {
    R.bi++;
    R.bst = 0;
    R.log.push(e.j);
   } else if (G.carrier === to && b.state === 'held') {
    R.bi++;
    R.bst = 0;
    R.log.push(e.j);
   } else if (ready(e.from, e.fromNeed) && (e.toNeed > 0 ? ready(e.to, e.toNeed) : R.bst > PM_TL.beat) && !(on284() && open284(to) < 10)) R.ring = to;
  } else if (e.kind === 'shot') {
   if (b.state === 'shot' || b.state === 'net') {
    R.bi++;
    R.log.push(e.j);
   } else if (ready(e.p, e.need) && ((e.picks || []).every(([pi, n]) => ready(pi, n)) || R.bst > 4)) R.ring = 'cage';
  }
 }
 R.i = R.log.length;
 if (!R.done && R.bi >= P2.balls.length && P2.routes.every((r, i) => R.ri[i] >= r.length)) {
  R.done = true;
  G.playsDone = (G.playsDone || 0) + 1;
 }
}

function playPlan(pl) {
 const routes = pl.start.map(() => []), balls = [], pos = pl.start.map(q => q.slice());
 let car = pl.car, passes = 0;
 const pickNeeds = [];
 pl.steps.forEach((s, j) => {
  if (s.t === 'move' || s.t === 'pick') {
   const a = pos[s.p];
   routes[s.p].push({
    j: j,
    t: s.t,
    x: s.x,
    y: s.y,
    d: Math.hypot(s.x - a[0], s.y - a[1]),
    needBall: s.p === car ? passes : 0,
    until: 1e9
   });
   pos[s.p] = [ s.x, s.y ];
   if (s.t === 'pick') pickNeeds.push([ s.p, routes[s.p].length ]);
  } else if (s.t === 'pass') {
   balls.push({
    j: j,
    kind: 'pass',
    from: s.from,
    to: s.to,
    fromNeed: routes[s.from].length,
    toNeed: routes[s.to].length
   });
   passes++;
   car = s.to;
  } else if (s.t === 'shot') balls.push({
   j: j,
   kind: 'shot',
   p: s.p,
   need: routes[s.p].length,
   picks: pickNeeds.slice()
  });
 });
 return {
  routes: routes,
  balls: balls
 };
}

function drawPlayOverlay() {
 const G = game, R = G && G.playRun;
 if (!R || screen !== 'live' || ballLive()) return;
 const blink = Math.floor(G.t * 4) % 2;
 if (R.ring && R.ring !== 'cage') {
  const p = R.ring;
  ringPx(p.x, p.y - 6, 11, 1, blink ? '#ffe14d' : 'rgba(255,225,77,.55)');
  ringPx(p.x, p.y - 6, 12, 1, 'rgba(0,0,0,.35)');
  text('PASS', p.x, p.y - 30, 1, '#ffe14d', 'center', '#000');
 }
 if (R.ring === 'cage') {
  ringPx(GX + 4, CY - 2, 13, 1, blink ? '#ff5a4a' : 'rgba(255,90,74,.5)');
  text('SHOOT', GX + 4, CY - 22, 1, '#ff5a4a', 'center', '#000');
 }
 if (R.mark) {
  const [x, y] = R.mark, c = blink ? '#ffe14d' : '#fff';
  for (let k = -3; k <= 3; k++) {
   px(x + k, y + k, c);
   px(x + k, y - k, c);
  }
 }
 for (const p of R.map) if (p && p.pickSet) {
  rect(p.x - 7, p.y + 1, 14, 2, '#ffe14d');
 }
}

function drawPlaybookBtn() {
 const G = game;
 if (!G || screen !== 'live') return;
 if (G.tutorial && !(G.tutorial.step >= TUT_PB_STEP)) return;
 const on = !!G.playSel, x = 2, y = 19, w = 46;
 hit('PLAYBOOK', x, y, w, 11, () => {
  screen = 'playbook';
  panelDirty();
 }, 'PLAYBOOK');
 rect(x, y + 1, w, 10, '#000');
 rect(x, y, w, 10, on ? '#ffe14d' : 'rgba(30,40,50,.85)');
 text('PLAYBOOK', x + w / 2, y + 3, 1, on ? '#0b1a20' : '#cfe', 'center');
 if (on) {
  const p = playById(G.playSel);
  if (p) {
   const s = p.name.slice(0, 14);
   rect(x, y + 11, textW(s) + 4, 8, 'rgba(0,0,0,.55)');
   text(s, x + 2, y + 12, 1, '#ffe14d');
  }
 }
}

function drawPlaymaker() {
 const pl = PM.play;
 let st = pmState(pl);
 rect(0, 0, W, H, '#0b0f14');
 const pv13 = pmView(), cat13 = pmCat(pl);
 g.save();
 if (pv13) {
  g.translate(pv13.ox, pv13.oy);
  g.scale(pv13.k, pv13.k);
 } else g.translate(-Math.round(camX), 0);
 if (game && !pv13) drawStadium();
 drawField();
 const kit = game ? game.uk : {
  jersey: '#2cc4dc',
  trim: '#111111',
  helm: '#2cc4dc'
 };
 let pos = st.pos.map(q => q.slice()), ball = null, pv = PM.preview;
 if (pv) {
  const tl = pv.tl || (pv.tl = pmTimeline(pl)), S = pmPreviewAt(pl, tl, pv.t);
  pos = S.pos;
  ball = S.ball;
  st = {
   pos: S.pos,
   car: S.car,
   picks: S.picks,
   shot: S.shot
  };
  PM.pvMoving = S.moving.slice();
  PM.pvMaxMoving = Math.max(PM.pvMaxMoving || 0, S.moving.length);
 } else {
  const tr = pl.start.map(q => q.slice());
  let car = pl.car;
  for (const s of pl.steps) {
   if (window.V27 && V27.pgHide && V27.pgHide(s)) continue;
   if (s.t === 'move' || s.t === 'pick') {
    const a = tr[s.p];
    for (let u = 0; u <= 1; u += .06) px(a[0] + (s.x - a[0]) * u, a[1] + (s.y - a[1]) * u - 2, s.t === 'pick' ? 'rgba(255,225,77,.7)' : 'rgba(255,255,255,.45)');
    tr[s.p] = [ s.x, s.y ];
   } else if (s.t === 'pass') {
    const a = tr[s.from], c = tr[s.to];
    for (let u = 0; u <= 1; u += .04) if (Math.floor(u * 25) % 2) px(a[0] + BX + (c[0] - a[0]) * u, a[1] + BY + (c[1] - a[1]) * u, 'rgba(255,225,77,.8)');
    car = s.to;
   } else if (s.t === 'shot') {
    const a = tr[s.p];
    for (let u = 0; u <= 1; u += .04) if (Math.floor(u * 25) % 2) px(a[0] + BX + (GX + 4 - a[0] - BX) * u, a[1] + BY + (CY - 3 - a[1] - BY) * u, 'rgba(255,90,74,.9)');
   }
  }
 }
 drawGhosts(pl, pos);
 if (!pv && window.V27 && V27.pmGhosts) V27.pmGhosts(pl, kit);
 let dragI = -1, dragAt = null, dragPick = false;
 for (const pt of pointers.values()) if (pt.pm && pt.pm.i >= 0 && pt.pm.dragging && pt.pm.at) {
  dragI = pt.pm.i;
  dragAt = pt.pm.at;
  dragPick = pt.pm.pick;
 }
 const order = pos.map((q, i) => i).sort((a, b) => pos[a][1] - pos[b][1]);
 for (const i of order) {
  const q = i === dragI ? dragAt : pos[i];
  if (i === dragI) {
   const a = pos[i];
   rect(a[0] - 3, a[1] - 1, 6, 2, 'rgba(255,255,255,.25)');
  }
  drawPiece(q[0], q[1], i, st, kit);
  if (!pv) for (const ptx of pointers.values()) {
   const dd = ptx.pm;
   if (!dd || dd.i !== i || dd.dragging || st.car == null || i === st.car || st.shot) continue;
   const fr = dd.pick || dd.unpick ? 1 : clamp((now() - dd.t0 - .12) / (PM_PRESS - .12), 0, 1);
   if (fr > 0) {
    ringPx(q[0], q[1] - 6, 12 + (fr >= 1 ? Math.sin(PM.t * 20) : 0), fr, dd.unpick ? '#ffffff' : '#ffe14d');
    if (dd.pick) text('PICK', q[0], q[1] + 5, 1, '#ffe14d', 'center', '#000');
   }
  }
  if (i === dragI && dragPick) {
   ringPx(q[0], q[1] - 6, 12, 1, '#ffe14d');
   text('PICK', q[0], q[1] + 5, 1, '#ffe14d', 'center', '#000');
  }
  if (st.car === i && !ball) {
   for (let a = 0; a < 6.28; a += .35) px(q[0] + Math.cos(a) * 8, q[1] + 1 + Math.sin(a) * 3, '#ffe14d');
   rect(q[0] + BX - 2, q[1] + BY - 2, 5, 5, '#000');
   rect(q[0] + BX - 1, q[1] + BY - 1, 3, 3, '#ffe14d');
  }
 }
 if (ball) {
  rect(ball[0] - 2, ball[1] - 2, 5, 5, '#000');
  rect(ball[0] - 1, ball[1] - 1, 3, 3, '#ffe14d');
 }
 if (!pv && st.car != null && st.car >= 0 && !st.shot && cat13 !== 'CLEAR') {
  const a = Math.floor(PM.t * 3) % 2;
  ringPx(GX + 4, CY - 2, 13, 1, a ? 'rgba(255,90,74,.7)' : 'rgba(255,90,74,.35)');
 }
 g.restore();
 {
  const tw = Math.floor((W - 4) / PM_CATS.length);
  PM_CATS.forEach((c, i) => {
   const x = 2 + i * tw, on = c === cat13;
   hit('TAB ' + c, x, 18, tw - 2, 10, () => pmSetCat(c), 'TAB ' + c);
   rect(x, 19, tw - 2, 10, '#000');
   rect(x, 18, tw - 2, 10, on ? '#ffe14d' : '#5a6a75');
   text(c, x + (tw - 2) / 2, 21, 1, on ? '#0b1a20' : '#e6f0f2', 'center');
  });
 }
 const shoot26 = cat13 !== 'CLEAR' && !pmFormOnly(cat13), gy26 = !window.__rl_no26 && shoot26 && !SA2403B ? Math.min(H - 31, H - 16 - sa2403Dy(H - 16, 15) - 15) : H - 31;
 if (cat13 !== 'RIDES' && cat13 !== 'D') button('GHOST ' + (PM.ghost === 'ZONE' ? 'ZONE' : 'MAN'), W - 62, gy26, 58, 12, () => pmGhostToggle(), {
  bg: PM.ghost === 'ZONE' ? '#ff9a4a' : '#c9d6d9'
 }); else text(cat13 === 'RIDES' ? 'GHOSTS: THEIR CLEAR' : 'GHOSTS: THEIR O', W - 4, H - 27, 1, '#c9d6d9', 'right', '#000');
 if (PM.origin === 'menu' && window.V29R && V29R.pbOn()) V29R.pmButton(gy26);
 rect(0, 0, W, 17, 'rgba(11,15,20,.92)');
 text('PLAYMAKER', 34, 3, 1, '#ffe14d');
 if (!(window.V27 && V27.pmTop && V27.pmTop(pl, st))) text('STEP ' + pl.steps.length + (st.shot ? '  SHOT' : ''), 34, 10, 1, '#8fe3f0');
 const bw2 = 34, gap = 3;
 let x = W - (bw2 + gap) * 5 - 2;
 button('BACK', 2, 2, 28, 13, () => pmBack(), {
  bg: '#c9d6d9'
 });
 button('UNDO', x, 2, bw2, 13, () => pmUndo(), {
  bg: '#c9d6d9'
 });
 x += bw2 + gap;
 button('CLEAR', x, 2, bw2, 13, () => pmClear(), {
  bg: '#ff8a7a'
 });
 x += bw2 + gap;
 button(PM.preview ? 'STOP' : 'PREVIEW', x, 2, bw2, 13, () => pmPreview(), {
  bg: '#8fe3f0'
 });
 x += bw2 + gap;
 button('SAVE', x, 2, bw2, 13, () => pmSaveAsk(), {
  bg: '#7dff7a'
 });
 x += bw2 + gap;
 if (PM.origin === 'menu') button('PLAYS', x, 2, bw2, 13, () => {
  screen = 'plays';
  panelDirty();
 }, {
  bg: '#ffd23a'
 }); else button('CANCEL', x, 2, bw2, 13, () => pmBack(), {
  bg: '#c9d6d9'
 });
 if (cat13 !== 'CLEAR' && !pmFormOnly(cat13)) button('SHOOT', W - 46, H - 16, 42, 13, () => pmShot(), {
  bg: '#ff5a4a',
  fg: '#fff'
 });
 const hint = PM.preview ? 'PREVIEW...' : PM.flash > 0 && PM.msg ? PM.msg : pmFormOnly(cat13) ? st.car == null ? 'DRAG = WHERE HE LINES UP. TAP A GUY = ROUTES ON' : 'ROUTES ON: DRAG A GUY = HIS RUN' : st.car == null ? 'TAP A GUY TO GIVE HIM THE BALL (DRAG FIRST TO SET UP)' : st.shot ? PM.msg || 'PLAY ENDS ON THE SHOT - SAVE IT' : PM.flash > 0 && PM.msg ? PM.msg : 'DRAG = MOVE  TAP = PASS  HOLD A GUY = PICK';
 rect(0, H - 17, W - 50, 17, 'rgba(11,15,20,.8)');
 text(hint.slice(0, Math.floor((W - 56) / 4)), 4, H - 11, 1, '#fff');
 if (PM.origin === 'tutorial' && game && game.tutorial) {
  const f = game.tutorial.f;
  rect(2, 20, 140, 9 + PM_TUT.length * 8, 'rgba(0,0,0,.75)');
  text('TUTORIAL', 6, 22, 1, '#ffe14d');
  PM_TUT.forEach(([k, s], i) => {
   const ok = !!f[k];
   rect(6, 31 + i * 8, 5, 5, ok ? '#7dff7a' : '#3a4a55');
   text(s, 14, 31 + i * 8, 1, ok ? '#7dff7a' : '#fff');
  });
 }
}

function pmMenuPlays() {
 return playsAll();
}

function renderPmSave() {
 const pl = PM && PM.play, def = pl && pl.name || 'PLAY ' + (playsAll().length + 1);
 return '<div class="hd"><div><div class="tt">NAME YOUR PLAY</div><div class="st">' + (pl ? pl.steps.length : 0) + ' STEPS' + (pl && pl.steps.some(s => s.t === 'pick') ? ' - WITH A PICK' : '') + '</div></div><div class="sp"></div>' + btn('CANCEL', 'pmSaveNo', null, 'g') + '</div>' + '<div class="row"><input id="pmname" maxlength="18" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(def) + '" aria-label="play name">' + btn('SAVE PLAY', 'pmSaveGo', null, 'y') + '</div>' + '<div class="note">SAVED PLAYS SHOW UP IN THE PLAYBOOK BUTTON DURING GAMES (TOP LEFT ON OFFENSE)</div>';
}

let plRename = null, plDel = null;

function renderPlays() {
 const list = playsAll();
 const biRows = c => PM_BUILTIN.filter(p => p.cat === c).map(p => '<div class="playrow"><span class="pname">' + esc(p.name) + '</span><span class="dim2">BUILT-IN</span><span class="sp"></span>' + btn('VIEW', 'plEdit', p.id) + '</div>').join('');
 const catOf = p => pmCat(p);
 const rowsFor = c => list.filter(p => catOf(p) === c).map(p => {
  const picks = p.steps.filter(s => s.t === 'pick').length;
  const ren = plRename === p.id;
  return '<div class="playrow">' + (ren ? '<input id="plname" maxlength="18" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(p.name) + '" aria-label="new name">' + btn('OK', 'plRenGo', p.id, 'y') : '<span class="pname">' + esc(p.name) + '</span><span class="dim2">' + p.steps.length + ' STEPS' + (picks ? ', ' + picks + ' PICK' + (picks > 1 ? 'S' : '') : '') + '</span>') + '<span class="sp"></span>' + btn('EDIT', 'plEdit', p.id) + btn('RENAME', 'plRen', p.id, 'g') + btn(plDel === p.id ? 'SURE?' : 'DELETE', 'plDel', p.id, 'r') + '</div>';
 }).join('');
 const rows = PM_CATS.map(c => '<div class="note" style="padding:4px 2px 0">' + esc(c) + ' - ' + esc(PM_CAT_INFO[c]) + '</div>' + biRows(c) + rowsFor(c)).join('');
 return '<div class="hd"><div><div class="tt">MY PLAYS</div><div class="st">' + list.length + ' SAVED + ' + PM_BUILTIN.length + ' BUILT-IN</div></div><div class="sp"></div>' + btn('NEW PLAY', 'plNew', null, 'y') + btn('BACK', 'plBack', null, 'g') + '</div>' + '<div class="scroll" id="plscroll">' + rows + (list.length ? '' : '<div class="note" style="padding:8px">NO PLAYS OF YOUR OWN YET - HIT NEW PLAY AND DRAW ONE</div>') + '</div>';
}

function renderPlaybook() {
 const G = game, list = playsAll(), all = pbAll();
 const tab = PS.pbTab === 'SETS' ? 'SETS' : 'PLAYS';
 const tabs = '<div class="row tabs">' + btn('SETS', 'pbTab', 'SETS', tab === 'SETS' ? 'on' : 'd') + btn('PLAYS', 'pbTab', 'PLAYS', tab === 'PLAYS' ? 'on' : 'd') + '<span class="dim2">ACTIVE SET: ' + esc(G.oset) + '</span></div>';
 if (tab === 'SETS') {
  return '<div class="hd"><div><div class="tt">PLAYBOOK</div><div class="st">SETS - ONE IS ON AT A TIME. YOUR GUYS SET UP IN IT + YOUR PLAYS RUN FROM IT</div></div><div class="sp"></div>' + btn('BACK', 'pbBack', null, 'g') + '</div>' + tabs + '<div class="row tabs">' + USER_SETS.map(n => btn(n, 'pbSet', n, G.oset === n ? 'on' : 'd')).join('') + '</div>' + '<div class="row" style="align-items:center;gap:8px">' + setDiagram(G.oset) + '<div><div class="note">' + esc(G.oset) + (G.oset ? ' - ON' : '') + '</div><div class="dim2">' + esc(SET_INFO[G.oset] || '') + '</div>' + '<div class="dim2">OFFENSE + MAN-UP PLAYS START FROM THESE SPOTS. SAVED FOR NEXT GAME.</div></div></div>';
 }
 const sec = c => {
  const ps = all.filter(p => pmCat(p) === c);
  if (!ps.length) return '';
  return '<div class="note">' + esc(c) + (c === 'OFFENSE' || c === 'MAN-UP' ? ' - RUNS FROM ' + esc(G.oset) : '') + '</div><div class="row">' + ps.map(p => btn(p.name, 'pbPick', p.id, pbOn(G, p) ? 'on' : '')).join('') + '</div>';
 };
 return '<div class="hd"><div><div class="tt">PLAYBOOK</div><div class="st">PICK A PLAY - YOUR GUYS RUN IT, YOU MAKE THE PASSES + THE SHOT</div></div><div class="sp"></div>' + btn('BACK', 'pbBack', null, 'g') + '</div>' + tabs + '<div class="row">' + btn('NO PLAYS', 'pbPick', '', !G.playSel ? 'on' : 'd') + '</div>' + PM_CATS.map(sec).join('') + (list.length ? '' : '<div class="note">BUILD YOUR OWN IN PLAYMAKER (HOME SCREEN) OR CALL A TIMEOUT + DRAW PLAY</div>');
}

function setDiagram(name) {
 const S = SETS[name];
 if (!S) return '';
 const x0 = GX - 152, y0 = CY - 70, X = x => (x - x0).toFixed(0), Y = y => (y - y0).toFixed(0);
 return '<svg width="132" height="96" viewBox="0 0 196 140" style="flex:0 0 auto;background:#1f6b35;border:1px solid #9fd8a8;border-radius:3px">' + '<circle cx="' + X(GX) + '" cy="' + Y(CY) + '" r="' + CREASE + '" fill="none" stroke="#fff" stroke-width="1.5"/>' + '<rect x="' + (+X(GX) - 1) + '" y="' + (+Y(CY) - 5) + '" width="5" height="10" fill="#ff5a4a"/>' + S.map((q, i) => '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="7" fill="' + (i <= 2 ? '#2cc4dc' : '#ff9a4a') + '" stroke="#000" stroke-width="1.5"/>').join('') + '</svg>';
}

const panel = document.createElement('div');

panel.id = 'panel';

ui.appendChild(panel);

const PANEL_SCREENS = [ 'roster', 'vsRoster', 'lineup', 'draft', 'seasonSetup', 'timeout', 'penalty', 'pmSave', 'plays', 'playbook', 'seasonStats', 'coachPick' ];

let panelKey = '', panelVer = 0;

const PS = {
 rosterTeam: 'ATL',
 rosterSrc: 'real',
 rosterBack: 'menu',
 luTeam: 'ATL',
 luSrc: 'real',
 luBack: 'matchup',
 lu: null,
 luSel: 'A0',
 draftPos: 'ALL',
 draftSel: null,
 sort: 'ovr'
};

function panelDirty() {
 panelVer++;
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({
 '&': '&amp;',
 '<': '&lt;',
 '>': '&gt;',
 '"': '&quot;',
 "'": '&#39;'
}[c]));

function rc(v) {
 return v >= 85 ? 'hi' : v >= 70 ? 'mid' : v < 50 ? 'lo' : '';
}

const COLS = [ [ 'spd', 'SPD' ], [ 'pow', 'PWR' ], [ 'acc', 'ACC' ], [ 'fin', 'FIN' ], [ 'stk', 'STK' ], [ 'str', 'STR' ], [ 'def', 'DEF' ], [ 'gb', 'GB' ], [ 'fo', 'FO' ], [ 'sav', 'SV' ] ];

function btn(label, a, v, cls, dis) {
 return '<button type="button" data-a="' + a + '"' + (v != null ? ' data-v="' + esc(v) + '"' : '') + (cls ? ' class="' + cls + '"' : '') + (dis ? ' disabled' : '') + ' aria-label="' + esc(label) + '">' + esc(label) + '</button>';
}

function posTag(p) {
 return '<span class="pos ' + p.pos + '">' + p.pos + '</span>';
}

function injTag(p) {
 const j = PS && (PS.rosterSrc === 'season' || PS.luSrc === 'season' || screen === 'season') ? injOf(p.id) : null;
 return j ? ' <span class="inj">INJ ' + (j.g >= 99 ? 'OUT FOR SEASON' : j.g + (j.g === 1 ? ' GAME' : ' GAMES')) + '</span>' : '';
}

function nameCell(p) {
 return (p.real ? '<span class="star">&#9733;</span> ' : '') + esc(p.n) + injTag(p) + pracTag18(p) + (p.id === 'LEG-0' ? '<i class="air23">' + (window.__rl_no34gar || window.__rl_v124gb ? 'AIR DIVE' : 'HIGH FLYER') + '</i>' : '');
}

function pracTag18(p) {
 const on = PS && (PS.rosterSrc === 'season' || PS.luSrc === 'season' || screen === 'season');
 return on && window.prac18Tag && season && teamRosterIds(season.team, 'season').includes(p.id) ? window.prac18Tag(p.id) : '';
}

function playerRow(p, a, v, cls, extra, num) {
 return '<tr' + (a ? ' data-a="' + a + '" data-v="' + esc(v) + '"' : '') + (cls ? ' class="' + cls + '"' : '') + ' data-pid="' + p.id + '">' + '<td>' + posTag(p) + '</td>' + (num != null ? '<td class="num15">' + esc(num) + '</td>' : '') + '<td class="n">' + nameCell(p) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td>' + COLS.map(([k]) => k === 'stk' ? stkCells17(p) : '<td class="' + rc(p.r[k]) + '">' + p.r[k] + '</td>').join('') + (extra || '') + '</tr>';
}

function stkCells17(p) {
 const s = window.V17 ? V17.stickRatings(p) : {
  overall: p.r.stk,
  hand: 'R',
  R: p.r.stk,
  L: p.r.stk
 };
 return '<td class="' + rc(s.overall) + '">' + s.overall + '</td><td class="hand17">' + s.hand + '</td><td class="' + rc(s.R) + '">' + s.R + '</td><td class="' + rc(s.L) + '">' + s.L + '</td>';
}

const TH = '<tr><th>POS</th><th class="n">NAME</th><th>OVR</th>' + COLS.map(c => c[0] === 'stk' ? '<th>STK</th><th>HAND</th><th>R-STK</th><th>L-STK</th>' : '<th>' + c[1] + '</th>').join('') + '</tr>';

const POS_ORDER = {
 A: 0,
 M: 1,
 FO: 2,
 LSM: 3,
 D: 4,
 G: 5
};

function sortPlayers(ids) {
 return ids.map(PP).filter(Boolean).sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos] || b.ovr - a.ovr);
}

function teamHead(tm, sub, right) {
 return '<div class="hd"><img alt="" src="' + badgeUrl(tm) + '"><div><div class="tt">' + esc(tm.city ? tm.city + ' ' : '') + esc(tm.name) + '</div><div class="st">' + esc(sub) + '</div></div><div class="sp"></div>' + (right || '') + '</div>';
}

function coachLine(tm) {
 if (season && season.coach && season.team === tm.id && (PS.rosterSrc === 'season' || screen === 'seasonStats')) return 'HEAD COACH: ' + season.coach.n.toUpperCase() + ' (' + season.coach.style + ')';
 return 'HEAD COACH: ' + (tm.coach || 'TBD') + (tm.lg ? '  -  ' + tm.lg + (tm.era ? ' ' + tm.era : '') : '');
}

function luOvr(lu) {
 const ids = [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ].filter(id => PP(id));
 return Math.round(ids.map(PP).reduce((a, p) => a + p.ovr, 0) / ids.length);
}

function teamOvr(teamId, src) {
 return luOvr(lineupFor(teamId, src));
}

function openRoster(teamId, src, back) {
 PS.rosterTeam = teamId;
 PS.rosterSrc = src || 'real';
 PS.rosterBack = back || screen;
 screen = 'roster';
 panelDirty();
}

function renderRoster() {
 const tm = T(PS.rosterTeam), ids = teamRosterIds(tm.id, PS.rosterSrc), lu = lineupFor(tm.id, PS.rosterSrc);
 const starters = new Set([ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ]);
 const sel = PS.rosterSel && ids.includes(PS.rosterSel) ? PP(PS.rosterSel) : null;
 const rows = sortPlayers(ids).map(p => playerRow(p, 'rsel', p.id, sel && sel.id === p.id ? 'sel' : starters.has(p.id) ? 'pick' : '', '', jerseyNo(p, PS.rosterSrc, tm.id))).join('');
 const skinBar = '<div class="skinbar">' + (sel ? '<span class="sw big" style="background:' + SKIN_BASE[skinOf(sel)] + '"></span><b>' + esc(sel.n) + '</b> SKIN: <b id="skinName">' + SKIN_NAMES[skinOf(sel)] + '</b> ' + btn('CYCLE SKIN', 'skin', sel.id, 'y') : 'TAP A PLAYER TO CHANGE HIS SKIN TONE') + '</div>';
 return teamHead(tm, coachLine(tm), btn('BACK', 'back', null, 'g')) + skinBar + '<div class="note">' + (PS.rosterSrc === 'season' ? 'YOUR DRAFTED SEASON ROSTER' + (window.prac18Line && window.prac18Line() ? '  -  ' + window.prac18Line() : '') : 'REAL ROSTER') + '  -  &#9733; = REAL PLAYER  -  HIGHLIGHT = STARTER  -  TEAM OVR ' + luOvr(lu) + '  -  POLES (D/LSM) CARRY LONG STICKS</div>' + '<div class="scroll" id="rosterList"><table>' + TH.replace('<th>POS</th>', '<th>POS</th><th>#</th>') + rows + '</table></div>';
}

const SLOTS = [ [ 'A0', 'ATTACK 1', 'off' ], [ 'A1', 'ATTACK 2', 'off' ], [ 'A2', 'ATTACK 3', 'off' ], [ 'M0', 'MIDDIE 1', 'off' ], [ 'M1', 'MIDDIE 2', 'off' ], [ 'M2', 'MIDDIE 3', 'off' ], [ 'FO', 'FACEOFF (FOGO)', 'fo' ], [ 'D0', 'D POLE 1', 'def' ], [ 'D1', 'D POLE 2', 'def' ], [ 'D2', 'D POLE 3', 'def' ], [ 'LSM', 'LONG-STICK MID', 'def' ], [ 'SSDM', 'SHORT-STICK D MID', 'def' ], [ 'SSDM2', 'D MIDDIE 2', 'def' ], [ 'G', 'GOALIE', 'g' ] ];

function slotGet(lu, k) {
 return k.length === 2 && /[AMD][0-2]/.test(k) ? lu[k[0]][+k[1]] : lu[k];
}

function slotSet(lu, k, id) {
 if (k.length === 2 && /[AMD][0-2]/.test(k)) lu[k[0]][+k[1]] = id; else lu[k] = id;
}

const unitOf = k => (SLOTS.find(s => s[0] === k) || [])[2];

function openLineup(teamId, src, back) {
 PS.luTeam = teamId;
 PS.luSrc = src;
 PS.luBack = back || screen;
 PS.lu = back === 'timeout' && game ? JSON.parse(JSON.stringify(game.lu[0])) : lineupFor(teamId, src);
 PS.luSel = 'A0';
 screen = 'lineup';
 panelDirty();
}

function assignSlot(id) {
 const lu = PS.lu, k = PS.luSel, u = unitOf(k), cur = slotGet(lu, k);
 if (cur === id) return;
 if (PS.luSrc === 'season' && injOf(id) || game && PS.luBack === 'timeout' && isEjected(PP(id))) return;
 const same = SLOTS.filter(s => s[2] === u && s[0] !== k).find(s => slotGet(lu, s[0]) === id);
 if (same) slotSet(lu, same[0], cur);
 if (u !== 'g' && lu.G === id) lu.G = cur;
 if (u === 'g') {
  for (const s of SLOTS) if (s[2] !== 'g' && s[2] !== 'fo' && slotGet(lu, s[0]) === id) slotSet(lu, s[0], cur);
 }
 slotSet(lu, k, id);
}

function renderLineup() {
 const tm = T(PS.luTeam), ids = teamRosterIds(tm.id, PS.luSrc), lu = PS.lu;
 const k = PS.luSel, u = unitOf(k);
 const slotHtml = SLOTS.map(([sk, lab]) => {
  const p = PP(slotGet(lu, sk));
  return '<button type="button" class="slot' + (sk === k ? ' on' : '') + '" data-a="slot" data-v="' + sk + '" aria-label="' + esc(lab) + '"><small>' + esc(lab) + '</small>' + (p ? esc(lastName(p)) + ' ' + p.ovr : '-') + '</button>';
 }).join('');
 const inUse = id => SLOTS.filter(s => slotGet(lu, s[0]) === id).map(s => s[0]);
 const key = u === 'off' ? [ 'fin', 'acc', 'pow' ] : u === 'def' ? [ 'def', 'gb', 'spd' ] : u === 'fo' ? [ 'fo', 'gb', 'spd' ] : [ 'sav', 'stk', 'spd' ];
 const list = ids.concat(window.V20 ? V20.luExtra(ids) : []).map(PP).sort((a, b) => b.r[key[0]] - a.r[key[0]] || b.ovr - a.ovr).map(p => {
  const used = inUse(p.id), cls = slotGet(lu, k) === p.id ? 'sel' : used.length ? 'pick' : '';
  return '<tr data-a="assign" data-v="' + p.id + '" class="' + cls + '" data-pid="' + p.id + '"><td>' + posTag(p) + '</td><td class="n">' + nameCell(p) + '</td><td class="' + rc(p.ovr) + '">' + p.ovr + '</td>' + key.map(kk => '<td class="' + rc(p.r[kk]) + '">' + p.r[kk] + '</td>').join('') + '<td class="dim2">' + used.join(' ') + '</td></tr>';
 }).join('');
 return teamHead(tm, 'LINEUP - TAP A SLOT, THEN TAP A PLAYER', btn('AUTO', 'luAuto', null, 'd') + btn(PS.luBack === 'timeout' ? 'DONE' : 'SAVE', 'luSave', null, 'y') + btn('BACK', 'back', null, 'g')) + '<div class="cols"><div class="slots">' + slotHtml + '</div><div class="scroll" id="luList"><table><tr><th>POS</th><th class="n">' + esc((SLOTS.find(s => s[0] === k) || [])[1]) + '</th><th>OVR</th>' + key.map(kk => '<th>' + kk.toUpperCase() + '</th>').join('') + '<th>IN</th></tr>' + list + '</table></div></div>';
}

function topPlayers(teamId, src, n) {
 return teamRosterIds(teamId, src).map(PP).sort((a, b) => b.ovr - a.ovr).slice(0, n);
}

function matchCol(tm, src, you) {
 const lu = lineupFor(tm.id, src);
 return '<div class="box" style="flex:1"><div class="hd"><img alt="" src="' + badgeUrl(tm) + '"><div><div class="tt">' + esc(tm.name) + '</div><div class="st">' + (you ? 'YOU' : 'CPU') + '  -  OVR ' + luOvr(lu) + '</div></div></div>' + '<div class="note">COACH ' + esc(tm.coach || 'TBD') + '</div>' + '<div>' + topPlayers(tm.id, src, 3).map(p => posTag(p) + ' ' + esc(p.n) + ' <span class="' + rc(p.ovr) + '">' + p.ovr + '</span>').join('<br>') + '</div></div>';
}

function renderMatchup() {
 const u = T(menuSel.team), o = T(menuSel.opp);
 return '<div class="hd"><div class="tt">QUICK GAME - REAL ROSTERS</div><div class="sp"></div>' + btn('BACK', 'back', null, 'g') + '</div>' + '<div class="cols">' + matchCol(u, 'real', true) + '<div style="align-self:center;font-size:18px">' + (menuSel.home ? 'VS' : 'AT') + '</div>' + matchCol(o, 'real', false) + '</div>' + '<div class="row">' + btn('PLAY', 'play', null, 'y') + btn('YOUR LINEUP', 'myLineup', null) + btn('YOUR ROSTER', 'myRoster', null, 'd') + btn('THEIR ROSTER', 'oppRoster', null, 'd') + '</div>';
}

function renderSeasonSetup() {
 return '<div class="hd"><div class="tt">NEW SEASON - ONE BIG LEAGUE</div><div class="sp"></div>' + btn('BACK', 'back', null, 'g') + '</div>' + '<div class="note">ALL ' + TEAMS.length + __x("IFRFQU1TLCBQTEwgKyBNTEwgVE9HRVRIRVIuIA==") + SEASON_GAMES + ' GAMES, TOP ' + PLAYOFF_N + ' MAKE THE PLAYOFFS.</div>' + '<div class="note">EVERY TEAM DRAFTS FROM ONE POOL OF EVERY PLAYER. YOU PICK THE TEAM YOU PLAY AS, THEN DRAFT ITS ROSTER. CPU TEAMS DRAFT BY OVERALL + POSITION NEED.</div>' + '<div class="row" style="flex-direction:column;align-items:stretch">' + btn('START SEASON - PICK YOUR TEAM', 'league', 'ALL', 'y') + '</div>';
}

const PANEL_KEEP = {
 keep: 1
};

const DRAFT_FIRST = 60, DRAFT_CHUNK = 60;

let draftRest = null, draftFillTok = 0, draftPosShown = null;

function draftFill(restoreTop) {
 const tok = ++draftFillTok, rest = draftRest;
 draftRest = null;
 const list = document.getElementById('draftList'), tb = list && list.querySelector('tbody');
 if (!list) return;
 if (!rest || !tb) {
  list.dataset.full = '1';
  if (restoreTop) list.scrollTop = restoreTop;
  return;
 }
 list.dataset.full = '0';
 let i = 0;
 const add = () => {
  tb.insertAdjacentHTML('beforeend', rest.slice(i, i + DRAFT_CHUNK).join(''));
  i += DRAFT_CHUNK;
  if (i >= rest.length) list.dataset.full = '1';
 };
 if (restoreTop) {
  while (i < rest.length && list.scrollHeight - list.clientHeight < restoreTop) add();
  list.scrollTop = restoreTop;
 }
 const step = () => {
  if (tok !== draftFillTok || !list.isConnected) return;
  add();
  if (i < rest.length) requestAnimationFrame(step);
 };
 if (i < rest.length) requestAnimationFrame(step);
}

function draftSelPatch() {
 const S = season, D = S && S.draft;
 if (!D || screen !== 'draft' || panel.dataset.scr !== 'draft') return;
 const list = document.getElementById('draftList'), dbtn = panel.querySelector('button[data-a="draft"]');
 if (!list || !dbtn) return;
 const need = draftNeeds(D, S.team), sel = PS.draftSel && D.pool.includes(PS.draftSel) ? PP(PS.draftSel) : null;
 for (const tr of list.querySelectorAll('tr.sel')) {
  const p = PP(tr.dataset.v);
  tr.className = p && need[p.pos] > 0 ? '' : 'dimrow';
 }
 if (sel) for (const tr of list.querySelectorAll('tr[data-a="dsel"]')) if (tr.dataset.v === String(sel.id)) {
  tr.className = 'sel';
  break;
 }
 const lab = sel ? 'DRAFT ' + lastName(sel) : 'DRAFT';
 dbtn.textContent = lab;
 dbtn.setAttribute('aria-label', lab);
 dbtn.disabled = !(sel && need[sel.pos] > 0);
 return PANEL_KEEP;
}

function renderDraft() {
 const S = season, D = S && S.draft;
 if (!D) return '<div class="tt">NO DRAFT</div>' + btn('MENU', 'menu', null, 'g');
 const me = T(S.team), total = D.order.length * D.rounds, done = D.n >= total;
 const mine = (D.rosters[S.team] || []).map(PP);
 const need = draftNeeds(D, S.team);
 const log = D.picks.slice(-8).reverse().map(([t, id]) => '<div>' + esc(T(t).id) + ': ' + esc(PP(id).n) + ' <span class="dim2">' + PP(id).pos + ' ' + PP(id).ovr + '</span></div>').join('');
 if (done) {
  return teamHead(me, 'DRAFT COMPLETE - ' + mine.length + ' PLAYERS', btn('START SEASON', 'startSeason', null, 'y')) + '<div class="note">YOUR ROSTER (TEAM OVR ' + teamOvr(S.team, 'season') + '). YOU CAN CHANGE YOUR LINEUP FROM THE SEASON SCREEN.</div>' + '<div class="scroll" id="draftList"><table>' + TH + sortPlayers(D.rosters[S.team]).map(p => playerRow(p)).join('') + '</table></div>';
 }
 const turn = draftTurn(D), myTurn = turn === S.team;
 const pos = PS.draftPos;
 const avail = D.pool.map(PP).filter(p => p && (pos === 'ALL' || p.pos === pos)).sort((a, b) => b.ovr - a.ovr || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0));
 const sel = PS.draftSel && D.pool.includes(PS.draftSel) ? PP(PS.draftSel) : null;
 const canSel = sel && need[sel.pos] > 0;
 const allRows = avail.map(p => playerRow(p, 'dsel', p.id, sel && sel.id === p.id ? 'sel' : need[p.pos] > 0 ? '' : 'dimrow'));
 draftPosShown = pos;
 const rows = allRows.slice(0, DRAFT_FIRST).join('');
 draftRest = allRows.length > DRAFT_FIRST ? allRows.slice(DRAFT_FIRST) : null;
 const tabs = [ 'ALL', 'A', 'M', 'FO', 'LSM', 'D', 'G' ].map(k => btn(k + (k !== 'ALL' ? ' ' + (need[k] || 0) : ''), 'dpos', k, pos === k ? 'on' : 'd')).join('');
 return teamHead(me, 'ROUND ' + (Math.floor(D.n / D.order.length) + 1) + '/' + D.rounds + '  -  PICK ' + (D.n + 1) + '/' + total + (myTurn ? '  -  YOUR PICK' : ''), btn(sel ? 'DRAFT ' + lastName(sel) : 'DRAFT', 'draft', null, 'y', !canSel) + btn('AUTO PICK', 'dauto', null, 'd') + btn('AUTO-DRAFT REST', 'dsim', null, 'd') + btn('MENU', 'menu', null, 'g')) + '<div class="row tabs">' + tabs + '<span class="note">NEEDS SHOWN ON TABS - YOU HAVE ' + mine.length + '/17 - ' + avail.length + ' LEFT</span></div>' + '<div class="cols"><div class="scroll" id="draftList"><table>' + TH + rows + '</table></div>' + '<div class="scroll" style="flex:0 0 28%;padding:4px"><div class="note">YOUR PICKS</div>' + (mine.length ? sortPlayers(D.rosters[S.team]).map(p => '<div>' + posTag(p) + ' ' + esc(lastName(p)) + ' ' + p.ovr + '</div>').join('') : '<div class="dim2">NONE YET</div>') + '<div class="note" style="margin-top:6px">LAST PICKS</div>' + (log || '<div class="dim2">-</div>') + '</div></div>';
}

function renderTimeout() {
 const G = game, u = T(G.user);
 const sets = USER_SETS.map(s => btn(s, 'oset', s, G.oset === s ? 'on' : 'd')).join('');
 return '<div class="hd"><img alt="" src="' + badgeUrl(u) + '"><div><div class="tt">TIMEOUT - ' + esc(u.name) + '</div><div class="st">' + G.tos[0] + ' TIMEOUT' + (G.tos[0] === 1 ? '' : 'S') + ' LEFT  -  ' + G.score[0] + '-' + G.score[1] + '  -  ' + (G.ot ? 'OT' : perLabel(G) + ' ' + fmtClock(G.clock)) + '  -  SHOT ' + Math.ceil(G.shotClock) + '</div></div><div class="sp"></div>' + btn('RESUME', 'resume', null, 'y') + '</div>' + '<div class="scroll" id="toscroll" style="border:0;background:none;display:flex;flex-direction:column;gap:5px">' + '<div class="box"><div class="note">OFFENSE SET (WHERE YOUR OFF-BALL GUYS SET UP + CUT)</div><div class="row tabs">' + sets + '</div><div class="dim2">' + esc(SET_INFO[G.oset] || '') + '</div></div>' + '<div class="box"><div class="row tabs"><span class="note">DEFENSE</span>' + btn('MAN', 'dset', 'man', G.dset === 'man' ? 'on' : 'd') + btn('ZONE', 'dset', 'zone', G.dset === 'zone' ? 'on' : 'd') + btn('BLACK', 'dset', 'black', G.dset === 'black' ? 'on' : 'd') + dCustomPlays().map(p => btn(p.name, 'dsetC', p.id, G.dset === 'custom' && G.dPlay === p.id ? 'on' : 'd')).join('') + '<span class="dim2">' + (G.dset === 'zone' ? 'HOLD AREAS AROUND THE CREASE - TAKES AWAY DODGES, GIVES UP OUTSIDE SHOTS' : G.dset === 'black' ? 'LOCK OFF - EVERYONE FACE-GUARDS HIS MAN, NO HELP, NO SLIDES' : G.dset === 'custom' ? 'YOUR SET - EVERYONE HOLDS THE SPOT YOU DREW, THE CLOSEST GUY PLAYS THE BALL' : 'EVERYONE ON A MAN, SLUFF + SLIDE') + '</span></div>' + '<div class="row tabs"><span class="note">RIDE</span>' + RIDE_NAMES.map(r => btn(r, 'rideSet', r, rideCall('U') === r ? 'on' : 'd')).join('') + rideCustomPlays().map(p => btn(p.name, 'rideSet', p.id, rideCall('U') === p.id ? 'on' : 'd')).join('') + '<span class="dim2">' + (rideCall('U') === '10-MAN RIDE' ? 'ALL 10 MAN-TO-MAN - YOUR GOALIE TAKES AN ATTACKMAN, A D STEPS UP' : rideCall('U') === 'STANDARD RIDE' ? 'YOUR ATTACK RIDE, EVERYONE ELSE GETS BACK' : 'YOUR RIDE - EVERYONE TAKES THE SPOT YOU DREW (NOBODY GOES OFFSIDE)') + '</span></div>' + (clrPlays().length ? '<div class="row tabs"><span class="note">CLEAR</span>' + btn('NONE', 'clrSet', '', !G.clrSel ? 'on' : 'd') + clrPlays().map(p => btn(p.name, 'clrSet', p.id, G.clrSel === p.id ? 'on' : 'd')).join('') + '<span class="dim2">CLEARING IT: TAP SET (BOTTOM RIGHT), THEN RUN</span></div>' : '') + '</div>' + whoStartsRow(G) + '<div class="box"><div class="note">PLAYBOOK (YOUR GUYS RUN IT ON OFFENSE)</div><div class="row tabs">' + btn('NO PLAYS', 'toPlay', '', !G.playSel ? 'on' : 'd') + pbAll().filter(pbRunnable).map(p => btn(p.name, 'toPlay', p.id, G.playSel === p.id ? 'on' : 'd')).join('') + btn('DRAW PLAY', 'drawPlay', null, 'y') + '</div></div>' + '</div>' + '<div class="row">' + btn('SUBS / LINEUP', 'toLineup', null) + '<span class="note">ON THE FIELD: ' + offUnit(G.lu[0]).map(p => esc(lastName(p))).join(', ') + '</span></div>';
}

function renderPenalty() {
 const G = game, pen = G.pen;
 if (!pen) return btn('CONTINUE', 'penGo', '', 'y');
 const up = pen.side === 'C', who = pen.who ? lastName(pen.who) : 'A PLAYER', tm = T(up ? G.opp : G.user);
 const opts = up ? Object.keys(EMO) : MD_NAMES, info = up ? EMO_INFO : MD_INFO;
 return '<div class="hd"><div><div class="tt big">' + (up ? 'MAN-UP!' : 'MAN-DOWN') + '</div><div class="st">FLAG: ' + esc(pen.foul) + ' ON ' + esc(who) + ' (' + esc(tm.name) + ')  -  ' + PEN_LEN + ' SEC IN THE BOX  -  RELEASED ON A GOAL</div></div></div>' + '<div class="note">' + (up ? 'YOU HAVE 6 ON 5. PICK YOUR EMO PLAY:' : 'YOU ARE DOWN A MAN. PICK YOUR MAN-DOWN SET:') + '</div>' + '<div class="row" style="flex-direction:column;align-items:stretch">' + opts.map(o => btn(o + ' - ' + info[o], 'penGo', o, 'y')).join('') + (up ? manUpPlays18().map(p => btn('PLAY: ' + p.name + (p.builtin ? '' : ' (YOURS)'), 'penPlay18', p.id, 'g')).join('') + btn('SKIP - DEFAULT (3-3 EMO)', 'penGo', '3-3 EMO', 'g') : '') + '</div>';
}

function manUpPlays18() {
 try {
  return pbAll().filter(p => pmCat(p) === 'MAN-UP' && Array.isArray(p.start) && p.start.length >= 5).slice(0, 8);
 } catch (e) {
  return [];
 }
}

function penPlay18(id) {
 const G = game;
 penaltyChoose('3-3 EMO');
 if (!G || !G.pen || screen !== 'live') return;
 G.playSel = id;
 G.goAuto18 = !!playSet();
 G.manUpPlay18 = id;
}

const PANEL_RENDER = {
 roster: renderRoster,
 lineup: renderLineup,
 matchup: renderMatchup,
 seasonSetup: renderSeasonSetup,
 draft: renderDraft,
 timeout: renderTimeout,
 penalty: renderPenalty,
 pmSave: renderPmSave,
 plays: renderPlays,
 playbook: renderPlaybook,
 seasonStats: renderStats,
 coachPick: renderCoachPick,
 vsRoster: renderVsRoster
};

const PANEL_ACT = {
 stSort(v) {
  if (PS.stSort === v) PS.stAsc = !PS.stAsc; else {
   PS.stSort = v;
   PS.stAsc = v === 'n' || v === 'pos';
  }
 },
 stBack() {
  screen = 'season';
 },
 vsBack() {
  screen = PS.vs && PS.vs.back || 'menu';
 },
 vsTeam(v) {
  if (PS.vs) PS.vs.sel = +v || 0;
 },
 vsView(v) {
  if (PS.vs) PS.vs.view = v === 'stats' ? 'stats' : 'ratings';
 },
 coachPick(v) {
  coachChoose(v);
 },
 back() {
  if (screen === 'roster') screen = PS.rosterBack; else if (screen === 'lineup') screen = PS.luBack; else if (screen === 'matchup') screen = 'pickOpp'; else if (screen === 'seasonSetup') screen = 'menu'; else screen = 'menu';
 },
 menu() {
  screen = 'menu';
 },
 slot(v) {
  PS.luSel = v;
 },
 assign(v) {
  assignSlot(v);
 },
 luAuto() {
  PS.lu = autoLineup(teamRosterIds(PS.luTeam, PS.luSrc));
 },
 luSave() {
  if (!lineupValid(PS.lu, teamRosterIds(PS.luTeam, PS.luSrc))) return;
  saveLineup(PS.luTeam, PS.luSrc, PS.lu);
  if (PS.luBack === 'timeout' && game) game.lu[0] = JSON.parse(JSON.stringify(PS.lu));
  screen = PS.luBack;
 },
 play() {
  newGame(menuSel.team, menuSel.opp, 'quick', menuSel.home);
 },
 myLineup() {
  openLineup(menuSel.team, 'real', 'matchup');
 },
 myRoster() {
  openRoster(menuSel.team, 'real', 'matchup');
 },
 oppRoster() {
  openRoster(menuSel.opp, 'real', 'matchup');
 },
 league() {
  menuSel.mode = 'season';
  screen = 'pickTeam';
 },
 dpos(v) {
  PS.draftPos = v;
 },
 dsel(v) {
  PS.draftSel = v;
  return draftSelPatch();
 },
 draft() {
  const S = season, D = S.draft;
  if (draftTurn(D) !== S.team || !PS.draftSel) return;
  const p = PP(PS.draftSel);
  if (!p || draftNeeds(D, S.team)[p.pos] <= 0) return;
  draftPick(D, S.team, p.id);
  PS.draftSel = null;
  draftRunCpu(D);
  LS.set('season', S);
 },
 dauto() {
  const S = season, D = S.draft;
  if (draftTurn(D) !== S.team) return;
  draftPick(D, S.team, cpuChoice(D, S.team));
  PS.draftSel = null;
  draftRunCpu(D);
  LS.set('season', S);
 },
 dsim() {
  const S = season, D = S.draft;
  while (D.n < D.order.length * D.rounds) draftPick(D, draftTurn(D), cpuChoice(D, draftTurn(D)));
  LS.set('season', S);
 },
 startSeason() {
  finishDraft(season);
  screen = 'season';
  seasonTab = 0;
 },
 resume() {
  resumeFromTimeout();
 },
 oset(v) {
  setOffense(v);
 },
 dset(v) {
  setDefense(v);
 },
 dsetC(v) {
  setDefense('custom', v);
 },
 clrSet(v) {
  clrSelect(v || null);
 },
 toLineup() {
  openLineup(game.user, game.src, 'timeout');
 },
 penGo(v) {
  penaltyChoose(v);
 },
 penPlay18(v) {
  penPlay18(v);
 },
 pmSaveNo() {
  screen = PM ? 'playmaker' : 'menu';
 },
 pmSaveGo() {
  const el = document.getElementById('pmname');
  pmSaveGo(el ? el.value : '');
 },
 plEdit(v) {
  const p = playById(v);
  plRename = null;
  plDel = null;
  if (p) openPlaymaker('menu', p);
 },
 plRen(v) {
  plRename = v;
  plDel = null;
 },
 plRenGo(v) {
  const el = document.getElementById('plname'), list = playsAll(), p = list.find(q => q.id === v);
  if (p && el) {
   p.name = String(el.value || '').replace(/[^\w #&'!?.+-]/g, '').trim().toUpperCase().slice(0, 18) || p.name;
   playsSave(list);
  }
  plRename = null;
 },
 plDel(v) {
  if (plDel === v) {
   playsSave(playsAll().filter(p => p.id !== v));
   plDel = null;
   if (PM && PM.editId === v) PM.editId = null;
  } else plDel = v;
  plRename = null;
 },
 plNew() {
  plRename = null;
  plDel = null;
  openPlaymaker('menu');
 },
 plBack() {
  plRename = null;
  plDel = null;
  screen = PM ? 'playmaker' : 'menu';
 },
 pbPick(v) {
  const k = pbPickAny(v || null);
  if (k === 'play') screen = 'live';
 },
 pbBack() {
  screen = 'live';
 },
 pbTab(v) {
  PS.pbTab = v === 'SETS' ? 'SETS' : 'PLAYS';
 },
 pbSet(v) {
  const G = game;
  setOffense(v);
  if (!G) return;
  if (screen === 'playbook' && !(G.pen && G.pen.side === 'C')) {
   const sp = curSpots();
   for (const p of G.players || []) if (p.team === 'O' && p.home && sp[p.idx]) {
    p.home = sp[p.idx].slice();
    p.wander = 0;
   }
  }
  if (G.pset) psetEnd();
 },
 rsel(v) {
  PS.rosterSel = PS.rosterSel === v ? null : v;
 },
 skin(v) {
  const p = PP(v);
  if (p) setSkin(v, skinOf(p) + 1);
 },
 toPlay(v) {
  choosePlay(v || null);
 },
 rideSet(v) {
  setRide(v);
 },
 toStart(v) {
  pickStarter(v);
 },
 drawPlay() {
  openPlaymaker('timeout');
 }
};

function syncPanel() {
 const want = PANEL_SCREENS.includes(screen) && !paused;
 const key = want ? screen + '#' + panelVer : '';
 if (key === panelKey) return;
 const prevScr = panel.dataset.scr, sc = panel.querySelector('.scroll'), st = sc ? sc.scrollTop : 0, sid = sc ? sc.id : '', dpPrev = draftPosShown;
 panelKey = key;
 if (!want) {
  panel.style.display = 'none';
  panel.innerHTML = '';
  panel.dataset.scr = '';
  return;
 }
 panel.innerHTML = PANEL_RENDER[screen]();
 panel.className = screen === 'timeout' || screen === 'penalty' || screen === 'playbook' || screen === 'coachPick' ? 'dim' : screen === 'pmSave' ? 'dim pmsave' : '';
 panel.style.display = 'flex';
 panel.dataset.scr = screen;
 if (screen === 'draft') draftFill(prevScr === screen && sid === 'draftList' && dpPrev === draftPosShown ? st : 0); else if (prevScr === screen && sid) {
  const n = document.getElementById(sid);
  if (n) n.scrollTop = st;
 }
}

panel.addEventListener('click', ev => {
 const b = ev.target.closest('[data-a]');
 if (!b || !panel.contains(b) || b.disabled) return;
 ev.preventDefault();
 ev.stopPropagation();
 if (panel.dataset.scr !== screen || paused) return;
 if (now() < inputLockUntil) return;
 audioInit();
 SFX.tap();
 const f = PANEL_ACT[b.dataset.a];
 if (f && f(b.dataset.v, b) === PANEL_KEEP) return;
 panelDirty();
});

const DZ = {
 checkR: 17,
 hitR: 15,
 checkCd: .45,
 hitHold: .3,
 decide0: .45,
 decide1: .85,
 shootD: 78,
 ctrlSpd: 1.12
};

const DEND = 5;

const dStick = p => [ p.x - 10, p.y - 9 ];

function dAtk() {
 return game.players.filter(p => p.team === 'D');
}

function dDef() {
 return game.players.filter(p => p.team === 'O');
}

function startDefense(opts) {
 const G = game;
 opts = opts || {};
 if (G.cset) clrEnd();
 G.cpu = null;
 const cpuUp = !!(G.pen && G.pen.side === 'U');
 G.cpuSet = pick(V13ON() ? SET_NAMES : SET_NAMES_V12);
 if (cpuUp) G.cpuEmo = pick(Object.keys(EMO));
 const SP = (cpuUp ? EMO[G.cpuEmo] : SETS[G.cpuSet]).map(([x, y]) => [ FL - x, y ]);
 const ou = offUnit(G.lu[1]), du = defUnit(G.lu[0]);
 const PL = [];
 SP.forEach((s, i) => {
  const a = mkPlayer('D', i, Math.max(s[0], DGX + 30) + 30 + rnd(-6, 6), s[1] + rnd(-6, 6));
  a.pl = ou[i];
  a.home = [ s[0] + rnd(-4, 4), s[1] + rnd(-4, 4) ];
  a.wt = rnd(.2, 1);
  a.tgt = a.home.slice();
  PL.push(a);
 });
 const car = PL[0];
 car.x = opts.x != null ? opts.x : MIDX - 30;
 car.y = opts.y != null ? opts.y : CY + rnd(-22, 22);
 const nA = PL.length;
 for (let i = 0; i < nA; i++) {
  const a = PL[i];
  const d = mkPlayer('O', i, a.x - 10, a.y + (CY - a.y) * .15);
  d.mark = a;
  a.mark0 = d;
  d.pl = du[i];
  PL.push(d);
 }
 const gk = mkPlayer('G2', 0, DGX + 5, CY);
 gk.team = 'G2';
 gk.pl = PP(G.lu[0].G);
 PL.push(gk);
 G.players = PL;
 G.carrier = null;
 G.goalie = null;
 G.gk2 = gk;
 setRoles(PL.filter(p => p.team === 'D'), [ 'M', 'M', 'M', 'A', 'A', 'A' ]);
 setRoles(PL.filter(p => p.team === 'O'), [ 'M', 'M', 'M', 'D', 'D', 'D' ]);
 farInit('cO');
 G.cc = null;
 G.bc = null;
 G.ccC = null;
 G.bcC = null;
 G.cpuOverSeen = false;
 G.ruleGrace = .6;
 G.ruleCall = null;
 applyPenaltyCpu();
 G.dcar = G.players.find(p => p.team === 'D');
 G.ball = {
  x: 0,
  y: 0,
  state: 'held',
  vx: 0,
  vy: 0
 };
 [G.ball.x, G.ball.y] = dStick(G.dcar);
 G.dctl = G.players.find(p => p.team === 'O' && p.mark === G.dcar) || nearestTo('O', G.dcar.x, G.dcar.y);
 G.run = null;
 G.chk = {
  n: 0,
  cd: 0,
  t: 0,
  who: G.dcar
 };
 G.o110 = null;
 G.dDecide = rnd(1, 1.6);
 G.dSlide = null;
 G.dRot = null;
 G.dBeat = 0;
 G.dHold = null;
 G.dclear = null;
 G.dgb = null;
 G.dShot = null;
 G.dLive = 0;
 G.cpuClear = false;
 G.clearing = false;
 G.shotClock = SHOT_CLOCK;
 G.cpuT = 0;
 G.stopFlash = 0;
 stick = null;
 shootP = null;
 screen = 'defense';
 if (G.dset === 'zone' || cpuUp) addFx('cue', 0, 0, {
  s: cpuUp ? 'MAN-DOWN: ' + (G.md || 'ZONE ROTATE') : 'YOUR D: ZONE',
  col: '#8fe3f0',
  life: 1.2
 });
}

function sv2111On(G) {
 return !!G && !G.online && !(G.meta && G.meta.online) && !G.tutorial && !window.__rl_no21 && !window.__rl_v124gb && !window.__rl_no2111;
}

function sv2111Stick(gk) {
 return [ gk.x - 5, gk.y - 16 ];
}

function sv2111Begin(G, gk, car) {
 const b = G.ball;
 if (!gk || !car) return;
 G.dcar = null;
 G.dHold = null;
 b.state = 'pass';
 b.clear = false;
 b.from = gk;
 b.to = car;
 b.intercept = null;
 b.vx = 0;
 b.vy = 0;
 b.z = 0;
 [b.x, b.y] = sv2111Stick(gk);
 b.fromX = gk.x;
 const side = car.y < CY - 2 ? -1 : car.y > CY + 2 ? 1 : Math.random() < .5 ? -1 : 1;
 const spot = [ clamp(GX - rnd(40, 52), MIDX + 20, GX - 30), clamp(CY + side * rnd(30, 42), FT + 16, FB - 8) ];
 b.gkh2111 = {
  gk: gk,
  t: 0,
  hold: rnd(.9, 1.2),
  spot: spot
 };
 G.sv2111n = (G.sv2111n || 0) + 1;
}

function sv2111Tick(G, b, dt) {
 const H = b.gkh2111, gk = H.gk;
 H.t += dt;
 [b.x, b.y] = sv2111Stick(gk);
 b.fromX = gk.x;
 let r = b.to;
 if (!r || !G.players.includes(r) || r.down > 0 && H.t > 2.5) {
  r = dAtk().filter(q => !(q.down > 0)).sort((p, q) => Math.hypot(p.x - gk.x, p.y - gk.y) - Math.hypot(q.x - gk.x, q.y - gk.y))[0] || null;
  if (!r) return;
  b.to = r;
  G.chk = {
   n: 0,
   cd: 0,
   t: 0,
   who: r
  };
 }
 const far = Math.hypot(r.x - gk.x, r.y - gk.y);
 if (!(H.t >= H.hold && !(r.down > 0) && (far > 30 || H.t > H.hold + .8)) && H.t < 3) return;
 {
  const open = q => {
   let md = 99;
   for (const d of dDef()) if (!(d.down > 0)) md = Math.min(md, Math.hypot(d.x - q.x, d.y - q.y));
   return md;
  };
  let best = r, bs = open(r) + 4;
  for (const q of dAtk()) if (q !== r && !(q.down > 0) && Math.hypot(q.x - gk.x, q.y - gk.y) > 20 && Math.hypot(q.x - gk.x, q.y - gk.y) < 75) {
   const o = open(q);
   if (o > bs) {
    bs = o;
    best = q;
   }
  }
  if (best !== r) {
   r = best;
   b.to = r;
   G.chk = {
    n: 0,
    cd: 0,
    t: 0,
    who: r
   };
  }
 }
 b.gkh2111 = null;
 gk.shootT0 = menuT;
 G.sv2111Thrown = (G.sv2111Thrown || 0) + 1;
 const [sx, sy] = [ b.x, b.y ], [rx, ry] = dStick(r), L = Math.hypot(rx - sx, ry - sy) || 1;
 for (const d of dDef()) {
  const t = clamp(((d.x - sx) * (rx - sx) + (d.y - 6 - sy) * (ry - sy)) / (L * L), 0, 1);
  if (t < .15 || t > .9) continue;
  const qx = sx + (rx - sx) * t, qy = sy + (ry - sy) * t, dist = Math.hypot(d.x - qx, d.y - 6 - qy);
  if (dist < 8) {
   const p = (1 - dist / 8) * .4 * clamp(L / 80, .6, 1.3) * clamp(1 - .3 * pr(gk, 'stk') + .2 * pr(d, 'def'), .35, 1.8);
   if (Math.random() < p) {
    b.intercept = {
     d: d,
     x: qx,
     y: qy
    };
    break;
   }
  }
 }
 SFX.pass();
}

function startDefenseLive() {
 const G = game;
 if (!G || G.tutorial || G.penPending) return false;
 const sv2111 = !!G.sv2111 && G.sv2111 === G.banner && screen === 'banner' && sv2111On(G);
 G.sv2111 = null;
 const ogk2111 = sv2111 ? (G.players || []).find(q => q.team === 'G') : null, ogkXY = ogk2111 && Math.hypot(ogk2111.x - (GX - 5), ogk2111.y - CY) < 14 ? [ ogk2111.x, ogk2111.y ] : null;
 r26DemoteAll(G);
 const prev = G.players || [], b = G.ball;
 const mine = prev.filter(p => p.team === 'O').sort((a, c) => a.idx - c.idx), theirs = prev.filter(p => p.team === 'D').sort((a, c) => a.idx - c.idx);
 if (mine.length < 4 || theirs.length < 4 || !b) return false;
 const fU0 = G.farU || [], fC0 = G.farC || [];
 const bx = clamp(b.x, MIDX + 8, GX - 20), by = clamp(b.y, FT + 14, FB - 6);
 {
  const ogk7 = H7on() ? prev.find(q => q.team === 'G') : null;
  G.h7gk = ogk7 && Math.hypot(ogk7.x - (GX - 5), ogk7.y - CY) > 2 ? [ ogk7.x, ogk7.y ] : null;
 }
 const og2h7 = H7on() ? prev.find(q => q.team === 'G2') || fU0.find(f => f.role === 'G') || null : null, og2xy = og2h7 ? [ og2h7.x, og2h7.y ] : null;
 startDefense();
 if (og2xy) {
  const n2 = G.players.find(q => q.team === 'G2');
  if (n2) {
   n2.h7v = og2xy[0] - n2.x;
   n2.h7w = og2xy[1] - n2.y;
  }
 }
 const atk = dAtk(), def = dDef();
 if (atk.length < 4 || def.length < 4) return true;
 const ip222 = G.int222;
 G.int222 = null;
 const nx30 = window.__rl_no30clrfix ? bx : b.x, ny30 = window.__rl_no30clrfix ? by : b.y;
 const cand30 = window.__rl_no30clrfix ? theirs : theirs.concat(fC0.filter(f => f.role === 'A' || f.role === 'R'));
 const cs = ip222 && ip222.q === G.q && menuT - ip222.m < 20 && theirs.find(q => q.pl === ip222.pl) || cand30.slice().sort((p, q) => Math.hypot(p.x - nx30, p.y - ny30) - Math.hypot(q.x - nx30, q.y - ny30))[0];
 const push = rrOf(cs) === 'D';
 const midsC = theirs.filter(q => q !== cs && rrOf(q) === 'M').concat(window.__rl_no46 || window.__rl_v124gb ? [] : fC0.filter(f => f.role === 'M')).sort((p, q) => Math.hypot(p.x - cs.x, p.y - cs.y) - Math.hypot(q.x - cs.x, q.y - cs.y));
 const homeC = theirs.filter(q => q !== cs && rrOf(q) !== 'M');
 const stayC = [];
 while (homeC.length + stayC.length < 3 && midsC.length) stayC.push(midsC.pop());
 let runC = midsC;
 const upC = fC0.filter(f => (f.role === 'A' || f.role === 'R') && f !== cs);
 const groupC = [ cs ].concat(runC, upC);
 while (groupC.length > atk.length && runC.length) {
  const r = runC.pop();
  groupC.splice(groupC.indexOf(r), 1);
  stayC.push(r);
 }
 const put = (a, src, x, y) => {
  a.x = src ? src.x : x;
  a.y = src ? src.y : y;
  a.anim = src && src.anim || 0;
  a.wt = rnd(.3, .8);
  if (src && src.pl) a.pl = src.pl;
  if (src && (src.h7v || src.h7w) && H7on()) {
   a.h7v = src.h7v || 0;
   a.h7w = src.h7w || 0;
  }
  if (src && src.down > 0) {
   a.down = src.down;
   a.downT0 = src.downT0;
   a.fallDir = src.fallDir;
   a.stun = src.stun;
   a.kb = src.kb;
  }
 };
 const nRunC = 1 + runC.length;
 atk.forEach((a, k) => {
  const s = groupC[k];
  if (!s) {
   dropPlayer(a);
   return;
  }
  put(a, s);
  a.rr = k === 0 ? push ? 'D' : 'M' : k < nRunC ? 'M' : 'A';
  a.push = k === 0 && push;
 });
 const atk2 = dAtk();
 const no46 = !!(window.__rl_no46 || window.__rl_v124gb);
 const homeU = fU0.filter(f => f.role === 'D' || no46 && f.role === 'M');
 const gkU = mine.find(q => q.gk) || null;
 const midsU = mine.filter(q => rrOf(q) !== 'A' && !q.gk).concat(no46 ? [] : fU0.filter(f => f.role === 'M')).sort((p, q) => Math.hypot(p.x - cs.x, p.y - cs.y) - Math.hypot(q.x - cs.x, q.y - cs.y));
 const backU = midsU.slice(0, Math.min(nRunC, midsU.length));
 const ridersU = mine.filter(q => !backU.includes(q) && !q.gk);
 const usedHome = new Set, usedBack = new Set;
 dDef().forEach(d => {
  const i = atk2.indexOf(d.mark);
  let src = null;
  if (i >= 0 && i < nRunC) {
   src = backU.find((q, j) => j >= i && !usedBack.has(q)) || backU.find(q => !usedBack.has(q)) || null;
   if (src) usedBack.add(src);
   d.rr = 'M';
   d.react = rnd(.1, .3);
  } else if (i >= 0) {
   src = homeU.find(f => !usedHome.has(f)) || null;
   if (src) usedHome.add(src);
   d.rr = 'D';
   d.react = rnd(.05, .2);
  }
  if (!src) {
   dropPlayer(d);
   return;
  }
  d.x = src.x;
  d.y = src.y;
  d.anim = src.anim || 0;
  if (src.pl) d.pl = src.pl;
  if (src.down > 0) {
   d.down = src.down;
   d.downT0 = src.downT0;
   d.fallDir = src.fallDir;
   d.stun = src.stun;
  }
 });
 const tgtU = 6 - (G.pen && G.pen.side === 'U' ? 1 : 0);
 for (const a of atk2) if (dDef().length < tgtU && !dDef().some(d => d.mark === a)) {
  const src = homeU.find(f => !usedHome.has(f)) || backU.find(q => !dDef().some(d => d.pl === q.pl));
  if (src) {
   if (homeU.includes(src)) usedHome.add(src);
   const d = mkPlayer('O', a.idx, src.x, src.y);
   d.pl = src.pl;
   d.mark = a;
   a.mark0 = d;
   d.rr = homeU.includes(src) ? 'D' : 'M';
   G.players.push(d);
  }
 }
 while (dDef().length < tgtU) {
  const src = homeU.find(f => !usedHome.has(f)) || backU.find(q => !dDef().some(d => d.pl === q.pl)) || ridersU.find(q => rrOf(q) !== 'A');
  if (!src) break;
  if (homeU.includes(src)) usedHome.add(src);
  if (ridersU.includes(src)) ridersU.splice(ridersU.indexOf(src), 1);
  const d = mkPlayer('O', dDef().length, src.x, src.y);
  d.pl = src.pl;
  d.mark = atk2[0] || null;
  d.hole = true;
  d.rr = homeU.includes(src) ? 'D' : 'M';
  G.players.push(d);
 }
 G.farU = ridersU.map((q, i) => {
  const f = farMk('U', rrOf(q) === 'A' ? 'A' : 'R', q.x, q.y, q.pl);
  f.anim = q.anim;
  f.rest = [ MIDX + 44 + (i === 1 ? 16 : 0), CY - 44 + 44 * (i % 3) ];
  return f;
 });
 if (no46) {
  for (const f of homeU) if (!usedHome.has(f)) {
   f.role = 'D';
   G.farU.push(f);
  }
  for (const q of backU) if (!dDef().some(d => d.pl === q.pl)) G.farU.push(farMk('U', 'M', q.x, q.y, q.pl));
 } else {
  const spare = homeU.filter(f => !usedHome.has(f)).concat(backU.filter(q => !dDef().some(d => d.pl === q.pl)), midsU.filter(q => q.far && !backU.includes(q) && !dDef().some(d => d.pl === q.pl)));
  spare.forEach(q => {
   const k = G.farU.length, f = farMk('U', 'R', q.x, q.y, q.pl);
   f.anim = q.anim || 0;
   f.rest = [ MIDX + 44 + 16 * (k % 2), CY - 66 + 33 * (k % 5) ];
   G.farU.push(f);
  });
 }
 if (gkU) {
  const g2 = G.gk2;
  if (g2) {
   g2.x = gkU.x;
   g2.y = gkU.y;
   g2.anim = gkU.anim;
   g2.homeRun = true;
  }
  G.gkOver = null;
 }
 G.farC = homeC.map((q, i) => {
  const f = farMk('C', 'D', q.x, q.y, q.pl);
  f.anim = q.anim;
  f.rest = [ MIDX + 55, CY - 44 + 44 * (i % 3) ];
  return f;
 });
 stayC.forEach(s => {
  const f = farMk('C', 'M', s.x, s.y, s.pl);
  f.anim = s.anim;
  f.stay = true;
  G.farC.push(f);
 });
 G.farMode = 'cO';
 farPair(G);
 const car = atk[0];
 G.dcar = car;
 [G.ball.x, G.ball.y] = dStick(car);
 G.chk = {
  n: 0,
  cd: 0,
  t: 0,
  who: car
 };
 G.dDecide = rnd(.6, 1);
 car.tgt = [ clamp(car.x - 90, DGX + 60, MIDX - 20), clamp(car.y + rnd(-15, 15), FT + 16, FB - 8) ];
 G.dctl = dDef().find(d => d.mark === car) || nearestTo('O', car.x, car.y);
 const gk = mkPlayer('G', 0, GX - 5, CY);
 gk.pl = PP(G.lu[1].G);
 G.players.push(gk);
 {
  const og = G.h7gk;
  G.h7gk = null;
  if (og && H7on()) {
   gk.x = og[0];
   gk.y = og[1];
   gk.h7home = true;
  }
 }
 if (sv2111) {
  if (ogkXY) {
   gk.x = ogkXY[0];
   gk.y = ogkXY[1];
  }
  sv2111Begin(G, gk, car);
 }
 G.cpuClear = true;
 G.cpuClears = (G.cpuClears || 0) + 1;
 if (r26On(G) && dAutoOn()) {
  const nd = c7Pick(car, dDef());
  if (nd) dTake(G, nd, 'clear');
 }
 G.ccC = {
  t: CLEAR_T
 };
 G.ruleGrace = .5;
 addFx('cue', 0, 0, {
  s: 'THEY CLEAR IT - RIDE!',
  col: '#ff9a8a',
  life: 1.3
 });
 try {
  trn193(G, 'cpuClear');
 } catch (e) {
  console.error(e);
 }
 return true;
}

function dEnd(kind, txt, sub) {
 const G = game;
 if (G.over) return;
 G.banner = {
  txt: txt,
  sub: sub,
  kind: kind
 };
 G.bannerT = 0;
 screen = 'banner';
 stick = null;
 shootP = null;
 G.dHold = null;
 if (kind === 'cgoal') {
  st14('ga', G.gk2 && G.gk2.pl);
  const two = twoPtShot(G.ball, DGX);
  G.score[1] += two ? 2 : 1;
  if (two) {
   G.pts2[1]++;
   G.banner.txt = '2PT GOAL';
   twoPtPop();
  }
  G.runU = 0;
  SFX.bad();
  goalPing(DGX);
  crowd12(false);
  benchReact('o', 'goal');
  if (!G.userHome) G.crowd = 2.5;
  G.rippleL = true;
  G.ripple = 1;
  if (G.pen && G.pen.side === 'U') penaltyOver('goal');
 } else SFX.whistle();
}

function toOffense(p, why) {
 const G = game;
 if (G.tutorial) {
  if (tutDone(G.tutorial.step)) {
   G.tutorial.doneT = 0;
   tutAdvance();
  }
  return tutSetup();
 }
 if (!G.ot && G.clock <= 0) {
  G.clock = 0;
  return endQuarter();
 }
 if (p && liveClear(p, why)) return;
 const pl = p && p.pl;
 if (p && !window.__rl_v124gb && !G.penPending && p.x >= MIDX + 6) setupPossession(p.x, p.y); else setupPossession(MIDX + 12, p ? clamp(p.y, FT + 16, FB - 14) : CY);
 const c = G.carrier;
 if (pl) {
  const same = G.players.find(q => q.team === 'O' && (q.pl === pl || !window.__rl_no2317b && q.pl && q.pl.id === pl.id));
  if (same && same !== c) {
   [same.x, c.x] = [ c.x, same.x ];
   [same.y, c.y] = [ c.y, same.y ];
   G.carrier = same;
   G.ball.x = same.x + BX;
   G.ball.y = same.y + BY;
  } else if (!same) {
   const old = c.pl;
   c.pl = pl;
   if (!window.__rl_no2317b) for (const f of G.farU || []) if (f.pl && f.pl.id === pl.id) f.pl = old;
  }
 }
 G.run = {
  x: 1,
  y: 0
 };
 G.checkT = -1.2;
 G.transitions = (G.transitions || 0) + 1;
 addFx('txt', G.carrier.x, G.carrier.y - 26, {
  s: why || 'TRANSITION!',
  col: '#7dff7a',
  life: 1
 });
 SFX.cheer();
}

function clearFarMates() {
 const G = game;
 return G && screen === 'defense' && G.ball && G.ball.state === 'clear' ? (G.farU || []).filter(f => f.role === 'R' || f.role === 'A' || f.role === 'M') : [];
}

function liveClear(p, why) {
 const G = game;
 if (G && p && p.r26) p = r26Demote(G, p);
 r26DemoteAll(G);
 if (!G || G.tutorial && !tutLiveClear() || G.penPending || p.team !== 'O' && p.team !== 'G2' && !p.far) return false;
 const fx17 = !window.__rl_no2317b;
 const mine = G.players.filter(q => q.team === 'O' && (!fx17 || q === p || !q.gk)).sort((a, b) => a.idx - b.idx), theirs = G.players.filter(q => q.team === 'D').sort((a, b) => a.idx - b.idx);
 const farN = L => fx17 ? (L || []).filter(f => f.role !== 'G').length : 0;
 if (mine.length + farN(G.farU) < 4 || theirs.length + farN(G.farC) < 4) return false;
 const SP = curSpots();
 const gkC = p.team === 'G2' || p.far && p.role === 'G' || fx17 && p.team === 'O' && !!p.gk;
 const nearA = screen === 'live' && !window.__rl_no2316 && !window.__rl_v124gb ? mine.filter(q => q !== p && rrOf(q) === 'A') : [];
 const upU = (G.farU || []).filter(f => (f.role === 'A' || f.role === 'R') && f !== p).concat(nearA);
 const push = !p.far && !gkC && rrOf(p) === 'D';
 const mids = mine.filter(q => q !== p && rrOf(q) === 'M').sort((a, b) => a.x - b.x);
 let homeD = mine.filter(q => q !== p && rrOf(q) !== 'M' && !nearA.includes(q)).concat((G.farU || []).filter(f => (f.role === 'D' || f.role === 'M') && f !== p));
 if (!(window.__rl_no46 || window.__rl_v124gb)) {
  const pr = q => q.far ? q.role === 'D' ? 1 : 2 : 0;
  homeD = homeD.slice().sort((a, b) => pr(a) - pr(b));
  while (homeD.length > 3) {
   const x = homeD.pop();
   mids.push(x);
   G.fix46 = (G.fix46 || 0) + 1;
  }
  mids.sort((a, b) => a.x - b.x);
 }
 const stays = [];
 while (homeD.length + stays.length < 3 && mids.length) stays.push(mids.shift());
 const runners = mids.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
 const group = [ p ].concat(runners, upU.sort((a, b) => a.y - b.y));
 while (group.length > 6) {
  const r = runners.pop();
  group.splice(group.indexOf(r), 1);
  stays.push(r);
 }
 const nRun = 1 + runners.length;
 const cc = G.cc;
 const P = [];
 const keepDown = (a, src) => {
  if (src && src.down > 0) {
   a.down = src.down;
   a.downT0 = src.downT0;
   a.fallDir = src.fallDir;
   a.stun = src.stun;
   a.kb = src.kb;
  }
 };
 const mkO = (i, src) => {
  const a = mkPlayer('O', i, src.x, src.y);
  a.pl = src.pl;
  a.home = (SP[i] || SP[SP.length - 1]).slice();
  a.anim = src.anim || 0;
  keepDown(a, src);
  a.tx = a.home[0];
  a.ty = a.home[1];
  a.wander = Math.hypot(a.home[0] - a.x, a.home[1] - a.y) / PACE.cut + .4;
  a.spd = PACE.cut * 1.1;
  P.push(a);
  return a;
 };
 const ix = {
  m: 0,
  a: 3
 };
 const roleOf = q => q === p ? gkC ? 'G' : push ? 'D' : p.far ? p.role === 'A' ? 'A' : 'M' : 'M' : q.far ? q.role === 'A' ? 'A' : 'M' : nearA.includes(q) ? 'A' : 'M';
 let c = null;
 group.forEach(q => {
  const r = roleOf(q);
  const i = r === 'A' ? ix.a++ : ix.m++;
  const a = mkO(Math.min(i, 5), q);
  a.rr = r === 'G' ? 'M' : r;
  if (q === p) {
   c = a;
   a.push = push || gkC;
   if (gkC) {
    a.gk = true;
    a.spd = 30;
   }
  }
 });
 if (s2302on()) for (const grp of [ P.filter(a => a !== c && a.rr === 'A'), P.filter(a => a !== c && a.rr !== 'A') ]) {
  if (grp.length < 2) continue;
  const sy = i => (SP[i] || SP[SP.length - 1])[1], ids = grp.map(a => a.idx).sort((u, v) => sy(u) - sy(v));
  grp.slice().sort((u, v) => u.y - v.y).forEach((a, k) => {
   const i = ids[k];
   if (a.idx === i) return;
   a.idx = i;
   a.home = (SP[i] || SP[SP.length - 1]).slice();
   a.tx = a.home[0];
   a.ty = a.home[1];
   a.wander = Math.hypot(a.home[0] - a.x, a.home[1] - a.y) / PACE.cut + .4;
   G.ys2302 = (G.ys2302 || 0) + 1;
  });
 }
 for (const a of P) if (a.idx > 5) a.idx = 5;
 P.sort((a, b) => a.idx - b.idx);
 const no46 = !!(window.__rl_no46 || window.__rl_v124gb);
 const homeC = (G.farC || []).filter(f => f.role === 'D' || no46 && f.role === 'M');
 const midsC = theirs.filter(q => rrOf(q) !== 'A').concat(no46 ? [] : (G.farC || []).filter(f => f.role === 'M')).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
 const backC = [], usedH = new Set;
 const offs = P.slice();
 offs.forEach(a => {
  let src = null, isMid = a.rr !== 'A';
  if (isMid) {
   src = midsC.find(q => !backC.includes(q)) || null;
   if (src) backC.push(src);
  }
  if (!src) {
   src = homeC.find(f => !usedH.has(f)) || null;
   if (src) usedH.add(src);
  }
  if (!src && !isMid) {
   src = midsC.find(q => !backC.includes(q)) || null;
   if (src) backC.push(src);
  }
  if (!src) return;
  const d = mkPlayer('D', a.idx, src.x, src.y);
  d.anim = src.anim || 0;
  keepDown(d, src);
  d.pl = src.pl;
  d.rr = backC.includes(src) ? 'M' : 'D';
  d.react = d.rr === 'M' ? rnd(.15, .4) : rnd(.05, .2);
  d.mark = a;
  a.mark0 = d;
  P.push(d);
 });
 {
  const tgtC = 6 - (G.pen && G.pen.side === 'C' ? 1 : 0);
  let ds = P.filter(q => q.team === 'D');
  while (ds.length > tgtC) {
   const d = ds.pop();
   const src = theirs.find(q => q.pl === d.pl) || midsC.find(q => q.far && q.pl === d.pl) || null;
   if (src && backC.includes(src)) backC.splice(backC.indexOf(src), 1); else {
    const h = homeC.find(f => f.pl === d.pl);
    if (h) usedH.delete(h);
   }
   P.splice(P.indexOf(d), 1);
   for (const a of P) if (a.mark0 === d) a.mark0 = null;
  }
  while (ds.length < tgtC) {
   const src = midsC.find(q => !backC.includes(q)) || homeC.find(f => !usedH.has(f));
   if (!src) break;
   if (homeC.includes(src)) usedH.add(src); else backC.push(src);
   const d = mkPlayer('D', ds.length, src.x, src.y);
   d.anim = src.anim || 0;
   keepDown(d, src);
   d.pl = src.pl;
   d.rr = backC.includes(src) ? 'M' : 'D';
   d.react = rnd(.1, .3);
   d.mark = c;
   d.hole = true;
   P.push(d);
   ds.push(d);
  }
 }
 const ridersC = theirs.filter(q => !backC.includes(q));
 const og7 = H7on() ? G.players.find(q => q.team === 'G') || (G.farC || []).find(f => f.role === 'G') : null;
 const gk = mkPlayer('G', 0, og7 ? og7.x : GX - 5, og7 ? og7.y : CY);
 gk.pl = PP(G.lu[1].G);
 P.push(gk);
 G.farU = homeD.map((q, i) => {
  const f = q.far ? q : farMk('U', 'D', q.x, q.y, q.pl);
  if (!q.far) f.anim = q.anim;
  f.role = 'D';
  f.rest = [ MIDX - 55 - 18 * Math.floor(i / 3), CY - 44 + 44 * (i % 3) ];
  return f;
 });
 stays.forEach(s => {
  const f = farMk('U', 'M', s.x, s.y, s.pl);
  f.anim = s.anim || 0;
  f.stay = true;
  G.farU.push(f);
 });
 if (!gkC) {
  const g2 = fx17 && G.players.find(q => q.team === 'O' && q.gk) || G.gk2 || G.players.find(q => q.team === 'G2');
  G.farU.push(farMk('U', 'G', g2 ? g2.x : DGX + 5, g2 ? g2.y : CY, PP(G.lu[0].G)));
 }
 G.farC = ridersC.map((q, i) => {
  const f = farMk('C', rrOf(q) === 'A' ? 'A' : 'R', q.x, q.y, q.pl);
  f.anim = q.anim;
  f.rest = [ MIDX - 44 - (i === 1 ? 16 : 0), CY - 44 + 44 * (i % 3) ];
  return f;
 });
 for (const f of homeC) if (!usedH.has(f)) G.farC.push(f);
 if (!no46) midsC.filter(q => q.far && !backC.includes(q)).forEach((q, i) => {
  q.role = 'R';
  q.stay = false;
  q.rest = [ MIDX - 44 - 16 * ((G.farC.length + i) % 2), CY - 66 + 33 * ((G.farC.length + i) % 5) ];
  G.farC.push(q);
 });
 G.farMode = 'uO';
 farPair(G);
 G.players = P;
 G.goalie = gk;
 G.carrier = c;
 G.dcar = null;
 G.dclear = null;
 G.ball = {
  x: c.x + BX,
  y: c.y + BY,
  state: 'held',
  vx: 0,
  vy: 0
 };
 if (G.pen) {
  G.liveClearsPen = (G.liveClearsPen || 0) + 1;
  if (G.pen.side === 'C') G.cpuMD = pick([ 'BOX + 1', 'ZONE ROTATE', 'CREASE STRING' ]);
 }
 resetPossState();
 G.gkOver = gkC ? {
  t: 0
 } : null;
 G.poleOver = push ? {
  t: 0
 } : null;
 if (gkC) G.gkClears = (G.gkClears || 0) + 1;
 if (push) G.poleClears = (G.poleClears || 0) + 1;
 G.cc = cc || {
  t: CLEAR_T
 };
 G.ruleGrace = .5;
 G.clearing = true;
 G.clears8 = (G.clears8 || 0) + 1;
 G.checkT = -1;
 G.run = {
  x: 1,
  y: 0
 };
 stick = null;
 shootP = null;
 screen = 'live';
 addFx('txt', c.x, c.y - 26, {
  s: why || 'CLEAR IT UP!',
  col: '#7dff7a',
  life: 1
 });
 addFx('cue', 0, 0, {
  s: gkC ? 'CAGE TO CAGE - A MIDDIE STAYS BACK' : push ? 'PUSH IT - A MIDDIE STAYS BACK' : 'GET IT OVER MIDFIELD!',
  col: '#7dff7a',
  life: 1.4
 });
 SFX.catch();
 try {
  trn193(G, 'liveClear');
 } catch (e) {
  console.error(e);
 }
 return true;
}

const INJ = {
 hit: .03,
 split: .0045,
 roll: .0045,
 cpuHit: .03,
 simGame: .13,
 perGame: 1,
 softCap: 2,
 soft: .2
};

const INJ_WHAT = {
 dodge: [ [ 'TWEAKED ANKLE', 1 ], [ 'TIGHT HAMMY', 1 ], [ 'SPRAINED ANKLE', 3 ], [ 'PULLED HAMSTRING', 2 ], [ 'TORN ACL', 99 ] ],
 hit: [ [ 'STINGER', 1 ], [ 'BELL RUNG', 1 ], [ 'CONCUSSION', 3 ], [ 'SEPARATED SHOULDER', 4 ], [ 'BROKEN COLLARBONE', 99 ] ]
};

function injSevRoll(kind) {
 const r = Math.random(), list = INJ_WHAT[kind === 'hit' || kind === 'cpuHit' ? 'hit' : 'dodge'];
 const tier = r < .5 ? 0 : r < .88 ? 1 : 2;
 const pool = tier === 0 ? list.slice(0, 2) : tier === 1 ? list.slice(2, 4) : list.slice(4);
 const [what, base] = pick(pool);
 const g = tier === 0 ? 1 : tier === 1 ? Math.max(2, base + Math.floor(rnd(-1, 2))) : 99;
 return {
  what: what,
  g: g,
  sev: tier === 0 ? 'DAY-TO-DAY' : tier === 1 ? 'OUT ' + g + ' GAMES' : 'OUT FOR SEASON'
 };
}

function injSeasonCount(S, teamId) {
 return (S.injLog || []).filter(x => x.team === teamId && !x.conc).length;
}

function injAdd(S, teamId, pid, sev, live) {
 S.inj = S.inj || {};
 S.injLog = S.injLog || [];
 S.inj[pid] = {
  g: sev.g,
  g0: sev.g,
  sev: sev.sev,
  what: sev.what,
  team: teamId,
  fresh: !!live,
  conc: !!sev.conc
 };
 S.injLog.push({
  team: teamId,
  pid: pid,
  what: sev.what,
  g: sev.g,
  wk: S.week,
  live: !!live,
  conc: !!sev.conc
 });
}

function injuryRoll(kind, p) {
 if (window.GHO16 && GHO16.injOn(game)) return GHO16.injury(kind, p);
 const G = game;
 if (!G || G.mode !== 'season' || G.tutorial || G.over || !season || !p || !p.pl || p.gk || p.team === 'G' || p.team === 'G2') return false;
 if (!G.players.includes(p)) return false;
 const side = p.team === 'O' ? 0 : 1, teamId = side === 0 ? G.user : G.opp;
 G.injN = G.injN || [ 0, 0 ];
 if (G.injN[side] >= INJ.perGame) return false;
 G.injEvents = G.injEvents || {
  split: 0,
  roll: 0,
  hit: 0,
  cpuHit: 0
 };
 G.injEvents[kind] = (G.injEvents[kind] || 0) + 1;
 const mult = injSeasonCount(season, teamId) >= INJ.softCap ? INJ.soft : 1;
 if (!(G.forceInj || Math.random() < (INJ[kind] || .004) * mult * (window.V17 && G.g17 ? V17.injMul(p) : 1))) return false;
 G.forceInj = false;
 const sev = injSevRoll(kind), who = p.pl;
 injAdd(season, teamId, who.id, sev, true);
 LS.set('season', season);
 G.injN[side]++;
 (G.injuries = G.injuries || []).push({
  pid: who.id,
  side: side,
  what: sev.what,
  g: sev.g,
  kind: kind
 });
 const sub = subFor(side, who.id);
 if (V14ON() && (screen === 'live' || screen === 'defense')) {
  const px0 = p.x, py0 = p.y;
  if (sub) {
   p.pl = PP(sub);
  }
  p.down = 0;
  p.kb = null;
  p.stun = .6;
  injScene14({
   x: px0,
   y: py0,
   team: p.team,
   pl: who
  }, who, sev.what, sev.sev, false, null);
  return true;
 }
 addFx('limp', p.x, p.y, {
  life: 3.2,
  kit: side === 0 ? 'u' : 'o',
  tx: p.x - 30,
  ty: FB + 4,
  nm: lastName(who)
 });
 if (sub) {
  p.pl = PP(sub);
 }
 p.down = 0;
 p.kb = null;
 p.stun = .6;
 G.injBanner = {
  txt: 'INJURY',
  sub: lastName(who) + ' - ' + sev.what + ' - ' + sev.sev,
  t: 0,
  team: side
 };
 SFX.whistle();
 return true;
}

const MCK204 = {
 id: 'EGG-1',
 what: 'TORN ACL + MCL',
 sev: 'OUT FOR SEASON',
 g: 99,
 after: 4
};

function mck204On() {
 return !window.__rl_no204mck && !window.__rl_v124gb;
}

function mck204Team(S) {
 if (!S || !S.rosters || S.mck204) return null;
 for (const t of Object.keys(S.rosters)) if ((S.rosters[t] || []).includes(MCK204.id)) return t;
 return null;
}

function mck204Sev() {
 return {
  what: MCK204.what,
  g: MCK204.g,
  sev: MCK204.sev
 };
}

function mck204Sim(S, teamId) {
 if (!mck204On() || mck204Team(S) !== teamId) return false;
 S.mck204 = 1;
 injAdd(S, teamId, MCK204.id, mck204Sev(), false);
 return true;
}

function mck204Tick(dt) {
 const G = game, S = season;
 if (!mck204On() || !G || G.mode !== 'season' || G.tutorial || G.over || !S) return;
 const team = mck204Team(S);
 if (!team || team !== G.user && team !== G.opp) return;
 const tb = S.table && S.table[team];
 if (tb && tb.w + tb.l) return;
 const p = (G.players || []).find(q => q && q.pl && q.pl.id === MCK204.id && !q.gk && q.team !== 'G' && q.team !== 'G2');
 if (!p) return;
 const side = p.team === 'O' ? 0 : 1, teamId = side === 0 ? G.user : G.opp;
 if (teamId !== team) return;
 G.mck204t = (G.mck204t || 0) + dt;
 if (G.mck204t < MCK204.after) return;
 const sev = mck204Sev(), who = p.pl;
 S.mck204 = 1;
 injAdd(S, teamId, who.id, sev, true);
 LS.set('season', S);
 G.injN = G.injN || [ 0, 0 ];
 G.injN[side]++;
 (G.injuries = G.injuries || []).push({
  pid: who.id,
  side: side,
  what: sev.what,
  g: sev.g,
  kind: 'mck204'
 });
 const sub = subFor(side, who.id);
 if (V14ON() && (screen === 'live' || screen === 'defense')) {
  const px0 = p.x, py0 = p.y;
  if (sub) {
   p.pl = PP(sub);
  }
  p.down = 0;
  p.kb = null;
  p.stun = .6;
  injScene14({
   x: px0,
   y: py0,
   team: p.team,
   pl: who
  }, who, sev.what, sev.sev, false, null);
  return;
 }
 addFx('limp', p.x, p.y, {
  life: 3.2,
  kit: side === 0 ? 'u' : 'o',
  tx: p.x - 30,
  ty: FB + 4,
  nm: lastName(who)
 });
 if (sub) {
  p.pl = PP(sub);
 }
 p.down = 0;
 p.kb = null;
 p.stun = .6;
 G.injBanner = {
  txt: 'INJURY',
  sub: lastName(who) + ' - ' + sev.what + ' - ' + sev.sev,
  t: 0,
  team: side
 };
 SFX.whistle();
}

function injuryTick(dt) {
 try {
  mck204Tick(dt);
 } catch (e) {
  console.error(e);
 }
 const G = game;
 if (G && G.injBanner) {
  G.injBanner.t += dt;
  if (G.injBanner.t > 3.2) G.injBanner = null;
 }
 if (G && G.ejBanner) {
  G.ejBanner.t += dt;
  if (G.ejBanner.t > 3.2) G.ejBanner = null;
 }
}

function injGameDone(S, teamId) {
 if (!S || !S.inj) return;
 for (const id of Object.keys(S.inj)) {
  const j = S.inj[id];
  if (j.team !== teamId) continue;
  if (j.fresh) {
   j.fresh = false;
   continue;
  }
  if (j.g < 99) j.g--;
  if (j.g <= 0) delete S.inj[id];
 }
}

function injSimGame(S, teamId) {
 if (!S || !S.rosters || !S.rosters[teamId] || teamId === S.team) return;
 const mult = injSeasonCount(S, teamId) >= INJ.softCap ? INJ.soft : 1;
 if (Math.random() >= INJ.simGame * mult) return;
 const lu = lineupFor(teamId, 'season'), ids = [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2 ].filter(id => id && !injOf(id));
 if (!ids.length) return;
 injAdd(S, teamId, pick(ids), injSevRoll(Math.random() < .5 ? 'hit' : 'split'), false);
}

function isEjected(pl) {
 return !!(game && pl && game.ejected && game.ejected.includes(pl.id));
}

function subFor(side, pid, keepField, want) {
 const G = game;
 if (!G) return null;
 const lu = G.lu[side], teamId = side === 0 ? G.user : G.opp, src = G.mode === 'season' ? 'season' : 'real';
 const slots = SLOTS.map(s => s[0]).filter(k => slotGet(lu, k) === pid);
 if (!slots.length) return null;
 const inLu = new Set(SLOTS.map(s => slotGet(lu, s[0])));
 const out = id => (G.ejected || []).includes(id) || (G.concOut || []).includes(id) || (G.gout16 || []).includes(id) || (G.ns17 || []).includes(id) || src === 'season' && injOf(id) || id === pid;
 const me = PP(pid), ros = teamRosterIds(teamId, src).map(PP).filter(p => p && !out(p.id));
 const posOk = p => me.pos === 'G' ? p.pos === 'G' : p.pos !== 'G';
 const score = p => (p.pos === me.pos ? 20 : [ 'D', 'LSM' ].includes(p.pos) === [ 'D', 'LSM' ].includes(me.pos) ? 8 : 0) + p.ovr * .2;
 let cands = ros.filter(p => posOk(p) && !inLu.has(p.id)).sort((a, b) => score(b) - score(a));
 if (!cands.length) {
  const unit = new Set(slots.map(unitOf)), sameUnit = id => SLOTS.some(s => unit.has(s[2]) && slotGet(lu, s[0]) === id);
  cands = ros.filter(p => posOk(p) && !sameUnit(p.id)).sort((a, b) => score(b) - score(a));
 }
 if (want === 'list') return cands.map(p => p.id);
 const sub = want && cands.find(p => p.id === want) || cands[0];
 if (!sub) return null;
 for (const k of slots) slotSet(lu, k, sub.id);
 const tm = side === 0 ? [ 'O' ] : [ 'D' ];
 if (!keepField) for (const p of G.players) if (p.pl && p.pl.id === pid && tm.includes(p.team)) p.pl = sub;
 for (const f of (side === 0 ? G.farU : G.farC) || []) if (f.pl && f.pl.id === pid) f.pl = sub;
 (G.subs = G.subs || []).push({
  side: side,
  out: pid,
  in: sub.id
 });
 return sub.id;
}

const STEP286 = {
 side: 11.5,
 fwd: 8,
 dur: .27
};

function on286s() {
 return !window.__rl_no286step && !window.__rl_v124gb;
}

function step286(c, sx, sy, f, cage) {
 const sl = Math.hypot(sx, sy) || 1;
 sx /= sl;
 sy /= sl;
 const sq = v => {
  if (!v) return null;
  const d = v[0] * sx + v[1] * sy, a = v[0] - d * sx, b = v[1] - d * sy, L = Math.hypot(a, b);
  return L > .2 ? [ a / L, b / L ] : null;
 };
 const fw = sq(f) || sq(cage ? [ cage[0] - c.x, cage[1] - c.y ] : null) || [ -sy, sx ];
 return {
  k286: 1,
  o286: [ c.x, c.y ],
  s286: [ sx, sy ],
  f286: fw
 };
}

function pos286(D, u) {
 u = Math.max(0, Math.min(1, u));
 const s = STEP286.side * (1 - (1 - u) * (1 - u)), w = STEP286.fwd * u * u;
 return [ D.o286[0] + D.s286[0] * s + D.f286[0] * w, D.o286[1] + D.s286[1] * s + D.f286[1] * w ];
}

const DODGE = {
 minPx: 30,
 maxDur: .9,
 curve: .24,
 splitDur: .32,
 rollDur: .46,
 splitSpd: 1.55,
 rollSpd: 1.4,
 cd: .55,
 splitBeat: .06,
 rollBeat: .1,
 swimDur: .4,
 toeDur: .38,
 swimBeat: .1,
 toeBeat: .1,
 step28: .32
};

function m28on(k) {
 return !window.__rl_v124gb && !window.__rl_no28 && !window['__rl_no28' + (k || 'moves')];
}

function curve28(path, cx, cy, L, turn) {
 const s = path[0];
 let sd = 0;
 if (L > 8 && Math.abs(cy) >= Math.abs(cx) * .8) {
  for (const q of path) {
   const v = ((q[0] - s[0]) * cy - (q[1] - s[1]) * cx) / L;
   if (Math.abs(v) > Math.abs(sd)) sd = v;
  }
  if (Math.abs(sd) > 2) return sd * cy > 0 ? 'swim' : 'toe';
 }
 return turn >= 0 ? 'swim' : 'toe';
}

function tut28Step() {
 const G = game, Tt = G && G.tutorial;
 if (!Tt || Tt.complete || window.__rl_no281drill || typeof TV28 === 'undefined' || !m28on() || !m28on('tut')) return null;
 return Tt.step === TV28.SWIM ? 'swim' : Tt.step === TV28.TOE ? 'toe' : null;
}

function tut28Len(dur) {
 return !!tut28Step() && dur <= 1.6;
}

function tut28Say(sw, why) {
 const want = tut28Step();
 if (!want || game.tutorial.f[want + '28'] || game.tutorial.doneT > 0) return;
 const C = want === 'swim' ? 'A BACKWARDS C' : 'A C';
 let s = null;
 if (!sw) s = why === 'slow' ? 'TOO SLOW - DRAW ' + C + ' QUICKER' : why === 'hold' ? 'DON\'T HOLD - DRAW ' + C + ' IN ONE QUICK STROKE' : why === 'mate' ? 'START ' + C + ' AWAY FROM YOUR TEAMMATES' : 'DRAW ' + C + ' A LITTLE BIGGER'; else if (sw.kind !== want) s = (sw.kind === 'split' ? 'THAT WAS STRAIGHT (SPLIT)' : sw.kind === 'toe' ? 'THAT WAS A C (TOE DRAG)' : sw.kind === 'swim' ? 'THAT WAS A BACKWARDS C (SWIM)' : 'THAT WAS A ' + String(sw.kind).toUpperCase()) + ' - DRAW ' + C;
 if (s) {
  addFx('cue', 0, 0, {
   s: s,
   col: '#ff9a8a',
   life: 1.6
  });
  game.tutorial.miss28 = (game.tutorial.miss28 || 0) + 1;
 }
}

function carrierFace() {
 const G = game, c = G && G.carrier;
 if (!c) return [ 1, 0 ];
 if (G.run && Math.hypot(G.run.x, G.run.y) > .1) {
  const L = Math.hypot(G.run.x, G.run.y);
  return [ G.run.x / L, G.run.y / L ];
 }
 if (G.lastFace && G.t - (G.lastFaceT || -9) < 1) return G.lastFace;
 const dx = GX - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1;
 return [ dx / L, dy / L ];
}

function classifySwipe(path, dur) {
 if (!path || path.length < 2 || dur > DODGE.maxDur) return null;
 const s = path[0], e = path[path.length - 1];
 const cx = e[0] - s[0], cy = e[1] - s[1], L = Math.hypot(cx, cy);
 let S = 0, dev = 0, far = 0, fx0 = 0, fy0 = 0, turn = 0, pa = null;
 for (let i = 1; i < path.length; i++) {
  const ax = path[i][0] - path[i - 1][0], ay = path[i][1] - path[i - 1][1], sl = Math.hypot(ax, ay);
  S += sl;
  if (sl > 1.5) {
   const ang = Math.atan2(ay, ax);
   if (pa != null) {
    let d = ang - pa;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    turn += d;
   }
   pa = ang;
  }
 }
 for (const q of path) {
  const qx = q[0] - s[0], qy = q[1] - s[1], fd = Math.hypot(qx, qy);
  if (fd > far) {
   far = fd;
   fx0 = qx;
   fy0 = qy;
  }
  if (L > 1) dev = Math.max(dev, Math.abs(qx * cy - qy * cx) / L);
 }
 if (Math.max(far, L) < DODGE.minPx) return null;
 const curved = (L < 1 ? 1 : dev / L) > DODGE.curve || S > 1.45 * Math.max(L, 1) || Math.abs(turn) > 1.6;
 let ux, uy;
 if (L >= .35 * S && L > 8) {
  ux = cx / L;
  uy = cy / L;
 } else {
  ux = fx0 / (far || 1);
  uy = fy0 / (far || 1);
 }
 return {
  kind: curved ? m28on() ? curve28(path, cx, cy, L, turn) : 'roll' : 'split',
  ux: ux,
  uy: uy,
  spin: turn >= 0 ? 1 : -1,
  dev: +(L < 1 ? 9 : dev / L).toFixed(2),
  L: Math.round(L),
  S: Math.round(S)
 };
}

const TRIP286 = {
 r: 14,
 down: 1.01,
 odds: [ [ 80, 0 ], [ 70, .1 ], [ 0, .25 ] ]
};

function on286t() {
 return !window.__rl_no286trip && !window.__rl_v124gb;
}

function tripOdds286(d) {
 const o = d && d.pl ? d.pl.ovr != null ? d.pl.ovr : ovrOf(d.pl) : 99;
 for (const [lo, p] of TRIP286.odds) if (o >= lo) return p;
 return 0;
}

function trip286(p) {
 return !!p && p.down > 0 && Math.abs((p.downT0 || 0) - TRIP286.down) < .004;
}

function tripTry286(c, d) {
 const G = game;
 if (!G || !on286t() || !c || !d || d.gk || d.down > 0 || Math.hypot(d.x - c.x, d.y - c.y) > TRIP286.r) return false;
 if (window.RLNET && RLNET.inGame && !RLNET.auth) return false;
 const pt = tripOdds286(d);
 (G.tripLog286 = G.tripLog286 || []).push({
  ovr: d.pl ? d.pl.ovr : null,
  p: pt
 });
 if (!(G.forceTrip286 != null ? G.forceTrip286 : Math.random() < pt)) return false;
 d.down = TRIP286.down;
 d.downT0 = TRIP286.down;
 d.stun = TRIP286.down;
 d.kb = null;
 d.fallDir = c.x < d.x ? 1 : -1;
 d.react = Math.max(d.react || 0, .4);
 d.chkCd = Math.max(d.chkCd || 0, TRIP286.down);
 G.trips286 = (G.trips286 || 0) + 1;
 G.tripLog286[G.tripLog286.length - 1].down = true;
 addFx('txt', d.x, d.y - 30, {
  s: 'TRIPPED!',
  col: '#ffe14d',
  life: 1
 });
 try {
  SFX.catch();
 } catch (e) {}
 return true;
}

function tripDust286(p, el) {
 if (el < 0 || el > .6) return;
 const k = el / .6, a = (.9 * (1 - k * k)).toFixed(2), fd = p.fallDir || 1, cx = p.x + fd * 5;
 for (let i = 0; i < 8; i++) {
  const ang = Math.PI * (.05 + .9 * i / 7), r = 3 + k * 10, s = i % 3 ? 2 : 3;
  const x = Math.round(cx + Math.cos(ang) * r), y = Math.round(p.y + 1 - Math.sin(ang) * r * .5 - k * 2);
  rect(x, y, s + 1, s, 'rgba(206,186,140,' + a + ')');
  rect(x, y, 1, 1, 'rgba(246,234,200,' + a + ')');
 }
}

const ANKLE = {
 base: .0015,
 per: .017,
 max: .045,
 against: 1.5,
 down: 1
};

function dodgeSkill(c) {
 return (pr(c, 'str') + pr(c, 'spd') + pr(c, 'stk')) / 3;
}

const SHAKE = {
 on: true
};

function shakeDelay(c, d) {
 return clamp(.16 + .05 * pr(c, 'spd') + .04 * pr(c, 'stk') + .03 * pr(c, 'str') - .07 * pr(d, 'def'), .05, .36);
}

function ankleChance(c, d, against) {
 const s = dodgeSkill(c) - .6 * pr(d, 'def');
 if (s <= -.5) return 0;
 return clamp((ANKLE.base + ANKLE.per * Math.max(0, s)) * (against ? ANKLE.against : 1), 0, ANKLE.max);
}

function ankleBreak(d, c) {
 const G = game;
 if (!d || d.down > 0) return false;
 d.down = ANKLE.down;
 d.downT0 = ANKLE.down;
 d.stun = ANKLE.down;
 d.kb = null;
 d.fallDir = c && c.x < d.x ? 1 : -1;
 d.react = Math.max(d.react || 0, .4);
 G.ankles = (G.ankles || 0) + 1;
 (G.ankleLog = G.ankleLog || []).push({
  by: c && c.pl ? c.pl.id : null,
  side: c && c.team === 'O' && screen === 'live' ? 'U' : 'C',
  t: +G.t.toFixed(1)
 });
 addFx('txt', d.x, d.y - 30, {
  s: 'ANKLES!',
  col: '#ffe14d',
  life: 1.1
 });
 SFX.catch();
 ewww18('ankles');
 if (c) {
  G.ankleChirps = (G.ankleChirps || 0) + 1;
  G.ankleChirpPend = {
   c: c,
   t: vt() + .45
  };
 }
 return true;
}

const LOST231 = {
 base: .3,
 k: .08,
 lo: .15,
 hi: .5,
 r: 22,
 t0: .6,
 t1: .9
};

function lostChance231(c, d) {
 return clamp(LOST231.base + LOST231.k * (dodgeSkill(c) - pr(d, 'def')), LOST231.lo, LOST231.hi);
}

function doDodge(kind, ux, uy, spin) {
 const G = game, c = G && G.carrier;
 if (!G || screen !== 'live' || !c || !canShoot() || G.ball.state !== 'held' || c.down > 0) return null;
 if (G.dodge || (G.dodgeCd || 0) > 0) return null;
 const f = carrierFace();
 const ul = Math.hypot(ux, uy) || 1;
 ux /= ul;
 uy /= ul;
 const dir = Math.abs(ux) >= Math.abs(uy) ? ux >= 0 ? 1 : -1 : uy >= 0 ? 1 : -1;
 const from = handOf17(c);
 const s28 = kind === 'swim' || kind === 'toe';
 const endHand = s28 ? from || 1 : kind === 'roll' ? !window.__rl_no204r3 && !window.__rl_v124gb ? -from : -dir : -dir, side = endHand;
 const vx = ux, vy = uy;
 G.dodge = {
  kind: kind,
  t: 0,
  dur: kind === 'roll' ? DODGE.rollDur : kind === 'swim' ? DODGE.swimDur : kind === 'toe' ? DODGE.toeDur : DODGE.splitDur,
  vx: vx,
  vy: vy,
  side: side,
  dir: dir,
  endHand: endHand,
  from: from,
  spin: spin || dir,
  face: f.slice(),
  who: c
 };
 if (s28 && on286s()) {
  Object.assign(G.dodge, step286(c, vx, vy, f, [ GX, CY ]));
  G.dodge.dur = STEP286.dur;
 }
 if (kind === 'roll' && !window.__rl_no2002r2 && !window.__rl_v124gb) {
  let nd = null, ndd = 26;
  for (const q of G.players) if (q.team === 'D' && !q.gk) {
   const dd = Math.hypot(q.x - c.x, q.y - c.y);
   if (dd < ndd) {
    ndd = dd;
    nd = q;
   }
  }
  if (nd) {
   const L = Math.hypot(c.x - nd.x, c.y - nd.y) || 1;
   G.dodge.away = [ (c.x - nd.x) / L, (c.y - nd.y) / L ];
  }
 }
 if (kind !== 'roll') c.hand = endHand;
 c.dodgeA = G.dodge;
 G.dodgeCd = DODGE.cd;
 G.splitCd = .5;
 G.dodges = (G.dodges || 0) + 1;
 if (kind === 'roll') G.rolls = (G.rolls || 0) + 1; else if (kind === 'swim') G.swims28 = (G.swims28 || 0) + 1; else if (kind === 'toe') G.toes28 = (G.toes28 || 0) + 1; else G.splits = (G.splits || 0) + 1;
 const LR = v => v > 0 ? 'right' : 'left';
 G.lastDodge = {
  kind: kind,
  side: LR(dir),
  dir: LR(dir),
  face: [ +f[0].toFixed(2), +f[1].toFixed(2) ],
  vx: +vx.toFixed(2),
  vy: +vy.toFixed(2),
  from: LR(from),
  to: LR(endHand),
  t: +G.t.toFixed(2)
 };
 tutFlag(kind === 'roll' ? 'roll' : s28 ? kind + '28' : 'split');
 tutFlag('dodged');
 hardCut(c, vx, vy, true);
 addFx('txt', c.x, c.y - 34, {
  s: kind === 'roll' ? 'ROLL DODGE!' : kind === 'swim' ? 'SWIM MOVE!' : kind === 'toe' ? 'TOE DRAG!' : 'SPLIT DODGE!',
  col: '#8fe3f0',
  life: .6
 });
 SFX.pass();
 let best = null, bd = 14;
 for (const q of G.players) if (q.team === 'D') {
  const dd = Math.hypot(q.x - c.x, q.y - c.y);
  if (dd < bd) {
   bd = dd;
   best = q;
  }
 }
 if (kind === 'roll' && s231on()) {
  let od = null, odd = LOST231.r;
  for (const q of G.players) if (q.team === 'D' && !q.gk && !(q.down > 0)) {
   const dd = Math.hypot(q.x - c.x, q.y - c.y);
   if (dd < odd || q.mark === c && dd < LOST231.r * 1.4 && !od) {
    odd = Math.min(dd, odd);
    od = q;
   }
  }
  if (od) {
   const pL = lostChance231(c, od);
   G.lastDodge.pLost = +pL.toFixed(2);
   G.rollsD231 = (G.rollsD231 || 0) + 1;
   if (G.forceLost231 != null ? G.forceLost231 : Math.random() < pL) {
    const pv = G.pre231 || f, L = Math.hypot(pv[0], pv[1]) || 1, ox = pv[0] / L, oy = pv[1] / L, tl = rnd(LOST231.t0, LOST231.t1);
    od.react = Math.max(od.react || 0, tl);
    od.lost231 = G.t + tl;
    od.tx = od.x + ox * 60;
    od.ty = od.y + oy * 60;
    od.spd = PACE.dBall * 1.15;
    G.lost231 = (G.lost231 || 0) + 1;
    G.lastDodge.lost = true;
    G.lastDodge.lostT = +tl.toFixed(2);
    G.checkT = Math.min(G.checkT || 0, -tl);
    G.beatT = Math.max(G.beatT || 0, tl);
    addFx('txt', c.x, c.y - 44, {
     s: 'LOST HIM!',
     col: '#7dff7a',
     life: .9
    });
    try {
     SFX.catch();
    } catch (e) {}
    best = null;
   }
  }
 }
 if (best) {
  const pBeat = clamp(.37 + (kind === 'roll' ? DODGE.rollBeat : kind === 'swim' ? DODGE.swimBeat : kind === 'toe' ? DODGE.toeBeat : DODGE.splitBeat) + .06 * pr(c, 'str') + .03 * pr(c, 'spd') - .06 * pr(best, 'def') + (G.pressure >= 2 ? -.12 : 0) + (G.uchk && G.uchk.n >= 2 ? -.05 : 0), .15, .7) * (DF.uBeat || 1) * (window.V17 && G.g17 ? V17.dodgeMul(c) : 1);
  G.lastDodge.pBeat = +pBeat.toFixed(2);
  if (Math.random() < pBeat || G.forceBeat) {
   best.react = rnd(.7, 1);
   best.tx = best.x - vx * 12;
   best.ty = best.y - vy * 12;
   best.spd = PACE.dOff;
   G.checkT = -.7;
   G.beatT = .9;
   G.dodgeBeats = (G.dodgeBeats || 0) + 1;
   G.lastDodge.beat = true;
   addFx('txt', c.x, c.y - 44, {
    s: 'SHOOK HIM!',
    col: '#7dff7a',
    life: .9
   });
   SFX.catch();
   if (window.V17) V17.say('dodge', c.x, c.y - 50);
   const pv = G.lastFace || f, against = pv[0] * vx + pv[1] * vy < .2;
   const pa = ankleChance(c, best, against);
   G.lastDodge.pAnkle = +pa.toFixed(3);
   if (G.forceAnkle || Math.random() < pa) {
    G.forceAnkle = false;
    ankleBreak(best, c);
    G.lastDodge.ankle = true;
   }
  } else {
   best.react = Math.max(best.react || 0, shakeDelay(c, best) * .6);
   G.lastDodge.beat = false;
  }
  if (s28) {
   best.react = Math.max(best.react || 0, DODGE.step28);
   G.beatT = Math.max(G.beatT || 0, .45);
   G.checkT = Math.min(G.checkT || 0, -.35);
   G.lastDodge.step28 = true;
  }
  if (kind === 'swim' && !(best.down > 0) && tripTry286(c, best)) G.lastDodge.trip = true;
 }
 injuryRoll(kind, c);
 return G.lastDodge;
}

function dodgeTick(dt) {
 const G = game;
 if (!G) return;
 if (window.V28) try {
  V28.tick(dt);
 } catch (e) {
  console.error(e);
 }
 G.dodgeCd = Math.max(0, (G.dodgeCd || 0) - dt);
 G.stoodUp = Math.max(0, (G.stoodUp || 0) - dt);
 if (screen === 'live' && G.carrier && G.run && Math.hypot(G.run.x, G.run.y) > .1) {
  const L = Math.hypot(G.run.x, G.run.y);
  G.lastFace = [ G.run.x / L, G.run.y / L ];
  G.lastFaceT = G.t;
 }
 const D = G.dodge;
 if (!D) return;
 D.t += dt;
 if (D.k286 && D.t >= D.dur && D.who && G.carrier === D.who && screen === 'live') {
  const q = pos286(D, 1);
  if (Math.hypot(q[0] - D.who.x, q[1] - D.who.y) < 3) {
   D.who.x = q[0];
   D.who.y = q[1];
  }
 }
 if (screen !== 'live' || G.carrier !== D.who || D.t >= D.dur) {
  if (D.who) {
   D.who.dodgeA = null;
   if (D.endHand) D.who.hand = D.endHand;
  }
  G.dodge = null;
  G.dodgeT = .25;
 }
}

const BULL = {
 hold: .2,
 press: DZ.hitHold,
 still: 3.5,
 cos: .74,
 dur: .36,
 spd: 1.3,
 reach: 17,
 cd: .7,
 standDur: .55,
 pose: .36,
 base: .45,
 k: .3,
 runW: 1.6,
 loseP: .2,
 truckEdge: 1.1,
 truckP: .45,
 stumble: .5,
 kb: 9
};

function bullFwd() {
 return carrierFace();
}

function bullTarget(c, ux, uy) {
 const G = game;
 let best = null, bs = 1e9;
 for (const q of G.players) {
  if (q.team !== 'D' || q.down > 0) continue;
  const dx = q.x - c.x, dy = q.y - c.y, d = Math.hypot(dx, dy);
  if (d > BULL.reach) continue;
  const along = dx * ux + dy * uy;
  if (along < -3) continue;
  const s = d - along * .3;
  if (s < bs) {
   bs = s;
   best = q;
  }
 }
 return best;
}

function bullOdds(c, d, ux, uy) {
 const fwd = ux != null ? [ ux, uy ] : bullFwd();
 const run = clamp(((c.mvx || 0) * fwd[0] + (c.mvy || 0) * fwd[1]) / (PACE.run * spdMul(c)), 0, 1.2);
 const str = pr(c, 'str'), dStr = d ? pr(d, 'str') : 0;
 const def = d ? .75 * dStr + .3 * pr(d, 'def') + (isPole(d) ? .25 : 0) - (d.react > 0 ? .3 : 0) : -9;
 const margin = str + BULL.runW * run - def;
 const pWin = d ? clamp((BULL.base + BULL.k * margin) * (DF.uBeat || 1), .06, .94) : 1;
 return {
  pWin: pWin,
  margin: margin,
  run: run,
  str: str,
  dStr: dStr
 };
}

function doBull(ux, uy) {
 const G = game, c = G && G.carrier;
 if (!G || screen !== 'live' || !c || !canShoot() || G.ball.state !== 'held' || c.down > 0 || G.stoodUp > 0) return null;
 if (G.dodge || (G.dodgeCd || 0) > 0) return null;
 const ul = Math.hypot(ux, uy) || 1;
 ux /= ul;
 uy /= ul;
 const d = bullTarget(c, ux, uy), o = bullOdds(c, d, ux, uy);
 G.dodge = {
  kind: 'bull',
  t: 0,
  dur: BULL.dur,
  vx: ux,
  vy: uy,
  side: 0,
  dir: 0,
  endHand: handOf17(c),
  from: handOf17(c),
  spin: 0,
  face: bullFwd().slice(),
  who: c
 };
 G.dodgeCd = BULL.cd;
 G.splitCd = .5;
 G.bulls = (G.bulls || 0) + 1;
 c.bullT0 = menuT;
 hardCut(c, ux, uy, true);
 const rec = {
  kind: 'bull',
  vx: +ux.toFixed(2),
  vy: +uy.toFixed(2),
  pWin: +o.pWin.toFixed(3),
  margin: +o.margin.toFixed(2),
  run: +o.run.toFixed(2),
  str: +o.str.toFixed(2),
  dStr: +o.dStr.toFixed(2),
  def: d ? d.idx : null,
  t: +G.t.toFixed(2)
 };
 G.lastBull = rec;
 G.lastDodge = Object.assign({}, rec, {
  side: 'fwd'
 });
 tutFlag('dodged');
 addFx('txt', c.x, c.y - 34, {
  s: 'BULL DODGE!',
  col: '#ffb14d',
  life: .6
 });
 if (!d) {
  rec.res = 'open';
  G.beatT = .6;
  SFX.pass();
  tutFlag('bull');
  (G.bullLog = G.bullLog || []).push(rec);
  return rec;
 }
 const f = G.forceBull, win = f ? f !== 'lose' : Math.random() < o.pWin;
 G.forceBull = null;
 const ax = d.x - c.x, ay = d.y - c.y, al = Math.hypot(ax, ay) || 1, kx = ux * .7 + ax / al * .3, ky = uy * .7 + ay / al * .3;
 if (win) {
  const truck = f === 'truck' || !f && o.margin >= BULL.truckEdge && Math.random() < BULL.truckP;
  const dn = truck ? HIT.down * .8 : BULL.stumble;
  d.down = dn;
  d.downT0 = dn;
  d.stun = dn;
  d.kb = {
   vx: kx * BULL.kb / HIT.kbT,
   vy: ky * BULL.kb / HIT.kbT,
   t: HIT.kbT
  };
  d.fallDir = kx >= 0 ? 1 : -1;
  d.react = Math.max(d.react || 0, dn + rnd(.2, .4));
  d.tx = d.x;
  d.ty = d.y;
  G.checkT = -.8;
  G.beatT = .9;
  G.bullWins = (G.bullWins || 0) + 1;
  rec.res = truck ? 'trucked' : 'win';
  G.lastDodge.beat = true;
  if (truck) {
   G.bullTrucks = (G.bullTrucks || 0) + 1;
   addFx('txt', d.x, d.y - 46, {
    s: 'TRUCKED!',
    col: '#ff5a4a',
    life: 1
   });
  } else addFx('txt', c.x, c.y - 44, {
   s: 'RAN THROUGH HIM!',
   col: '#7dff7a',
   life: .9
  });
  hit12(clamp(.35 + .25 * o.margin, .3, 1));
  if (truck) benchReact('u', 'hit');
  tutFlag('bull');
 } else {
  G.dodge = null;
  G.stoodUp = BULL.standDur;
  G.stoodUps = (G.stoodUps || 0) + 1;
  rec.res = 'stood';
  G.lastDodge.beat = false;
  c.bullT0 = null;
  d.hitT0 = menuT;
  d.react = 0;
  d.tx = c.x;
  d.ty = c.y;
  addFx('txt', c.x, c.y - 44, {
   s: 'STOOD UP!',
   col: '#ff8a7a',
   life: .9
  });
  hit12(.3);
  const pLose = clamp(BULL.loseP - .06 * o.margin, .05, .4);
  rec.pLose = +pLose.toFixed(3);
  const lose = G.forceBullLose != null ? !!G.forceBullLose : !G.tutorial && Math.random() < pLose;
  G.forceBullLose = null;
  if (lose) {
   rec.lost = true;
   G.bullLost = (G.bullLost || 0) + 1;
   const a = Math.atan2(-uy, -ux) + rnd(-1, 1), v = rnd(30, 46);
   popLoose(c.x + BX, c.y + 1, Math.cos(a) * v, Math.sin(a) * v, 'bull');
  }
 }
 (G.bullLog = G.bullLog || []).push(rec);
 return rec;
}

function bullDir() {
 const G = game, c = G && G.carrier;
 if (!c) return [ 1, 0 ];
 if (G.run && Math.hypot(G.run.x, G.run.y) > .1) {
  const L = Math.hypot(G.run.x, G.run.y);
  return [ G.run.x / L, G.run.y / L ];
 }
 const dx = GX - c.x, dy = CY - c.y, L = Math.hypot(dx, dy) || 1;
 return [ dx / L, dy / L ];
}

function bullArmed(pt) {
 const G = game;
 if (!G || !pt || pt.zone !== 'R' || pt.joy || pt.bullDone || pt.stale || pt.mate || pt.pickCalled || pt.role === 'shoot' || pt.role === 'shot26' || pt.role === 'xnone231' || pt.role === 'gsw' || shootP && shootP.id === pt.id) return false;
 if (pt.moved >= TAP_PX || pt.dodgeStroke || pt.swiped) return false;
 return true;
}

function bullCheck(pt) {
 if (pt.role === 'shot26' || !bullArmed(pt) || now() - pt.t0 < BULL.press) return null;
 const d = bullDir();
 return {
  ux: d[0],
  uy: d[1]
 };
}

function bullHoldTick() {
 const G = game;
 if (!G || screen !== 'live' || !canShoot() || !G.carrier || G.ball.state !== 'held') return;
 for (const pt of pointers.values()) {
  const b = bullCheck(pt);
  if (!b) continue;
  const r = doBull(b.ux, b.uy);
  if (!r) continue;
  pt.bullDone = true;
  if (shootP && shootP.id === pt.id) shootP = null;
  lastTap = {
   kind: 'bull',
   ok: true,
   res: r.res
  };
 }
}

const PEL = {
 max: 56,
 per: 8,
 life: .4,
 cd: .5,
 minSpd: 15,
 cos: .25,
 tauF: .06,
 win: .12,
 cleatVol: .05
};

let pellets = [], pelSeed = 20261023;

function pelRnd() {
 pelSeed = Math.imul(pelSeed, 1103515245) + 12345 >>> 0;
 return (pelSeed >>> 8) / 16777216;
}

function isUserGuy(p) {
 const G = game;
 if (!G || !p) return false;
 if (screen === 'live') return p === G.carrier || p === G.ctrl;
 if (screen === 'defense') return p === G.dctl;
 return false;
}

function hardCut(p, dx, dy, force) {
 const G = game;
 if (!G || !p) return false;
 const t = G.t || 0;
 if (!force && p.pelT != null && t - p.pelT < PEL.cd) return false;
 if (force && p.pelT != null && t - p.pelT < .08) return false;
 p.pelT = t;
 G.cuts = (G.cuts || 0) + 1;
 spawnPellets(p.x, p.y, dx, dy, PEL.per);
 if (isUserGuy(p)) cleatSnd(); else G.cpuCuts = (G.cpuCuts || 0) + 1;
 return true;
}

function spawnPellets(x, y, dx, dy, n) {
 const G = game;
 for (let i = 0; i < n; i++) {
  const sp = 14 + pelRnd() * 22, side = (pelRnd() - .5) * 2;
  const vx = (-dx + -dy * side) * sp, vy = (-dy + dx * side) * sp * .6;
  pellets.push({
   x: x + (pelRnd() - .5) * 3,
   y: y - .5,
   z: .5,
   vx: vx,
   vy: vy,
   vz: 30 + pelRnd() * 32,
   t: 0,
   life: PEL.life * (.75 + pelRnd() * .5),
   s: pelRnd() < .4 ? 2 : 1
  });
 }
 if (pellets.length > PEL.max) pellets.splice(0, pellets.length - PEL.max);
 if (G) {
  G.pelSpawned = (G.pelSpawned || 0) + n;
  G.pelPeak = Math.max(G.pelPeak || 0, pellets.length);
 }
}

function pelletTick(dt) {
 if (!pellets.length || !(dt > 0)) return;
 for (const q of pellets) {
  q.t += dt;
  q.x += q.vx * dt;
  q.y += q.vy * dt;
  q.vz -= 160 * dt;
  q.z = Math.max(0, q.z + q.vz * dt);
  if (q.z === 0) {
   q.vx *= .8;
   q.vy *= .8;
  }
 }
 pellets = pellets.filter(q => q.t < q.life);
}

function drawPellets() {
 for (const q of pellets) {
  const a = clamp(1 - q.t / q.life, 0, 1);
  if (a <= 0) continue;
  rect(q.x, q.y - q.z, q.s || 1, 1, 'rgba(10,10,12,' + (.4 + .6 * a).toFixed(2) + ')');
 }
}

let cleatBuf = null;

function cleatSnd() {
 const G = game;
 if (G) {
  G.cleats = (G.cleats || 0) + 1;
  (G.cleatLog = G.cleatLog || []).push(+(G.t || 0).toFixed(2));
 }
 if (window.__rlAudio) window.__rlAudio.push({
  n: 'cleat',
  v: +(PEL.cleatVol * MASTER_VOL).toFixed(3),
  t: G ? +(+G.t || 0).toFixed(2) : 0,
  s: screen,
  muted: !!muted
 });
 if (muted || !AC) return;
 try {
  if (!cleatBuf) {
   const n = Math.floor(AC.sampleRate * .04);
   cleatBuf = AC.createBuffer(1, n, AC.sampleRate);
   const d = cleatBuf.getChannelData(0);
   let s = 7;
   for (let i = 0; i < n; i++) {
    s = Math.imul(s, 1103515245) + 12345 >>> 0;
    d[i] = ((s >>> 8) / 8388608 - 1) * Math.pow(1 - i / n, 3);
   }
  }
  const t0 = AC.currentTime, src = AC.createBufferSource(), hp = AC.createBiquadFilter(), v = AC.createGain();
  src.buffer = cleatBuf;
  src.playbackRate.value = .9 + pelRnd() * .25;
  hp.type = 'bandpass';
  hp.frequency.value = 2600;
  hp.Q.value = .9;
  v.gain.setValueAtTime(PEL.cleatVol * MASTER_VOL * 3, t0);
  v.gain.exponentialRampToValueAtTime(1e-4, t0 + .045);
  src.connect(hp);
  hp.connect(v);
  v.connect(AC.destination);
  src.start(t0);
  src.stop(t0 + .06);
 } catch (e) {}
}

function overTick(dt) {
 const G = game;
 if (!G || G.tutorial || G.over) return;
 const b = G.ball;
 if (!b) return;
 if (screen === 'live') {
  const c = G.carrier;
  if (window.V38G && V38G.on6()) V38G.gk(G, c, b); else for (const gkp of [ c && c.gk ? c : null, G.players.find(p => p.team === 'G2' || p.gk), (G.farU || []).find(f => f.role === 'G') ]) if (gkp && Math.hypot(gkp.x - DGX, gkp.y - CY) > CREASE + 1) G.gkOut = true;
  if (!(c && c.gk && b.state === 'held')) G.gkGB25 = false;
  if (c && c.gk && b.state === 'held' && Math.hypot(c.x - DGX, c.y - CY) < CREASE - 1) {
   if (G.gkOut && !G.gkGB25) {
    ruleCall('GOALIE BACK IN CREASE', 'HE LEFT THE CREASE WITH IT - THEIR BALL', 'uturn');
    return;
   }
   G.gkCreaseT = (G.gkCreaseT || 0) + dt;
   G.gkInCreaseOk = (G.gkInCreaseOk || 0) + dt;
   if (G.gkCreaseT > CREASE_CT) {
    ruleCall('CREASE COUNT', '4 SECONDS IN THE CREASE WITH IT - THEIR BALL', 'uturn');
    return;
   }
  } else G.gkCreaseT = 0;
  for (const p of G.players.slice()) {
   if (p.team !== 'O' || !(p.push || p.gk)) continue;
   if (p === c || p === G.ctrl || b.state === 'pass' && b.to === p) {
    p.retT = 0;
    continue;
   }
   if (b.state === 'loose' || b.state === 'chase') continue;
   p.retT = (p.retT || 0) + dt;
   if (p.retT < .45) continue;
   p.coverT = .25;
   p.coverX = p.gk ? DGX + 26 : MIDX - 40;
   p.retreating = true;
   if (p.x < MIDX - 4) overSwap(p);
  }
 } else if (screen === 'defense') {
  const c = G.dcar;
  for (const a of G.players.slice()) {
   if (a.team !== 'D' || !a.push) continue;
   if (a === c || b.state === 'pass' && b.to === a) {
    a.retT = 0;
    continue;
   }
   if (b.state === 'loose' || b.state === 'chase' || b.state === 'clear' || G.cpuClear) continue;
   a.retT = (a.retT || 0) + dt;
   if (a.retT < .6) continue;
   a.coverT = .25;
   a.coverX = MIDX + 40;
   a.retreating = true;
   if (a.x > MIDX + 4) overSwap(a);
  }
 }
}

function overSwap(p) {
 const G = game, mine = p.team === 'O', far = mine ? G.farU : G.farC;
 if (!far) return;
 G.players = G.players.filter(q => q !== p);
 const f = farMk(mine ? 'U' : 'C', p.gk ? 'G' : 'D', p.x, p.y, p.pl);
 f.anim = p.anim;
 if (p.h7v || p.h7w) {
  f.h7v = p.h7v;
  f.h7w = p.h7w;
 }
 f.rest = [ mine ? MIDX - 55 : MIDX + 55, clamp(p.y, CY - 44, CY + 44) ];
 far.push(f);
 const st = far.find(q => q.stay && q.role === 'M');
 const mk = G.players.find(d => d.mark === p);
 if (st) {
  far.splice(far.indexOf(st), 1);
  const n = mkPlayer(p.team, p.idx, st.x, st.y);
  n.pl = st.pl;
  n.rr = 'M';
  n.anim = st.anim || 0;
  if (st.h7v || st.h7w) {
   n.h7v = st.h7v;
   n.h7w = st.h7w;
  }
  if (mine) {
   n.home = (curSpots()[p.idx] || p.home || [ MIDX + 60, CY ]).slice();
   n.tx = n.home[0];
   n.ty = n.home[1];
   n.wander = 1.4;
   n.spd = PACE.cut * 1.2;
  } else {
   n.home = (p.home || [ MIDX - 80, CY ]).slice();
   n.tgt = n.home.slice();
   n.wt = rnd(.6, 1.2);
  }
  if (mk) {
   mk.mark = n;
   n.mark0 = mk;
  }
  G.players.push(n);
  addFx('txt', n.x, n.y - 26, {
   s: 'MIDDIE OVER',
   col: mine ? '#7dff7a' : '#ff9a8a',
   life: .9
  });
 } else if (mk) mk.mark = {
  x: mine ? GX - 22 : DGX + 22,
  y: CY,
  ghost: true
 };
 if (p.gk) {
  G.gkOver = null;
  G.gkBacks = (G.gkBacks || 0) + 1;
 } else {
  G.poleOver = null;
  if (mine) G.poleBacks = (G.poleBacks || 0) + 1; else G.cpuPoleBacks = (G.cpuPoleBacks || 0) + 1;
 }
 if (G.ctrl === p) G.ctrl = null;
 farPair(G);
}

function LIVE_GB() {
 return !window.__rl_v124gb;
}

function liveGbTick(G, b, atk, def) {
 if (!LIVE_GB() || G.tutorial) return;
 const d2 = p => Math.hypot(p.x - b.x, p.y - b.y);
 const up = atk.filter(a => !(a.down > 0) && !(a.stun > 0)).sort((p, q) => d2(p) - d2(q)).slice(0, 2);
 const old = G.dChasers || [];
 for (const a of up) if (!old.includes(a)) a.gbReact = Math.min(a.gbReact > 0 ? a.gbReact : 9, rnd(.08, .2));
 G.dChasers = up;
 G.dHelpGb = def.filter(d => d !== G.dctl && !(d.down > 0) && !(d.stun > 0)).sort((p, q) => d2(p) - d2(q))[0] || null;
}

function dPopLoose(x, y, vx, vy, kind) {
 const G = game, b = G.ball;
 b.state = 'loose';
 b.x = x;
 b.y = y;
 b.vx = vx;
 b.vy = vy;
 b.z = 7;
 b.vz = 30;
 G.dcar = null;
 G.run = null;
 G.dSlide = null;
 G.dRot = null;
 G.dHold = null;
 G.chk = {
  n: 0,
  cd: .3,
  t: 0,
  who: null
 };
 G.dgb = {
  t: 0,
  kind: kind
 };
 const rx = clamp(x + vx * .6, DEND + 4, MIDX - 6), ry = clamp(y + vy * .6, FT + 6, FB - 4);
 G.dctl = nearestTo('O', (x + rx) / 2, (y + ry) / 2);
 const ds = dAtk().filter(d => !LIVE_GB() || !(d.down > 0)).sort((a, c) => Math.hypot(a.x - rx, a.y - ry) - Math.hypot(c.x - rx, c.y - ry)).slice(0, 2);
 ds.forEach((d, i) => {
  d.gbReact = (LIVE_GB() ? rnd(.1, .25) + i * .08 : rnd(GB.react0, GB.react1) + i * .15) * clamp(1 - .08 * pr(d, 'gb'), .75, 1.25);
 });
 G.dChasers = ds;
 G.dGbs = (G.dGbs || 0) + 1;
 addFx('cue', 0, 0, {
  s: kind === 'hit' ? 'LEVELED! GROUND BALL!' : kind === 'check' ? 'CHECKED LOOSE! GROUND BALL!' : kind === 'drop' ? 'DROPPED! GROUND BALL!' : kind === 'level' ? 'KEEPER LEVELED HIM! GROUND BALL!' : 'GROUND BALL!',
  col: '#ffe14d',
  life: 1.2
 });
}

function dSwitchTo(p) {
 const G = game;
 if (!p || p.team !== 'O') return;
 tutFlag('switched');
 if (p !== G.dctl) tutFlag('tapSw');
 G.dctl = p;
 G.dManual = {
  p: p,
  car: G.dcar
 };
 if (G.ball && (G.ball.state === 'loose' || G.ball.state === 'chase')) G.gbLock = {
  key: 'dctl',
  p: p,
  x: G.ball.x,
  y: G.ball.y
 };
 G.run = null;
 G.dSwitches = (G.dSwitches || 0) + 1;
 SFX.tap();
 addFx('catch', p.x, p.y - 6);
}

const DLUNGE = 14;

function dLunge(d, c, r) {
 const dist = Math.hypot(c.x - d.x, c.y - d.y);
 if (dist <= r) return 1;
 const go = Math.min(DLUNGE, dist - r * .6), ux = (c.x - d.x) / dist, uy = (c.y - d.y) / dist;
 d.lunge = {
  x: d.x + ux * go,
  y: d.y + uy * go,
  t: .22
 };
 game.dLunges = (game.dLunges || 0) + 1;
 addFx('txt', d.x, d.y - 24, {
  s: 'LUNGE!',
  col: '#8fe3f0',
  life: .5
 });
 return dist - DLUNGE <= r ? .75 : 0;
}

function dTrackCar() {
 const G = game;
 if (G.dcar !== G.dPrevCar) {
  if (G.dPrevCar && G.dPrevCar !== G.dcar) G.dLastCar = {
   p: G.dPrevCar,
   t: G.t
  };
  G.dPrevCar = G.dcar;
 }
}

function dLateTarget(r) {
 const G = game, d = G.dctl;
 if (!G || !d) return null;
 dTrackCar();
 const L = G.dLastCar;
 if (!L || !L.p || !G.players.includes(L.p) || G.t - L.t > FOUL.lateWin) return null;
 if (L.p === G.dcar) return null;
 return Math.hypot(L.p.x - d.x, L.p.y - d.y) <= (r || DZ.checkR) + 4 ? L.p : null;
}

function nearLoose(p) {
 const b = game.ball;
 return (b.state === 'loose' || b.state === 'chase') && Math.hypot(b.x - p.x, b.y - p.y) < 12;
}

function keeperInCrease(d, r) {
 const G = game;
 const k = G.players.find(p => p.team === 'G');
 if (!k || !d) return null;
 return Math.hypot(k.x - d.x, k.y - d.y) <= r && Math.hypot(k.x - GX, k.y - CY) < CREASE + 2 ? k : null;
}

function spamCheck() {
 const G = game, t = G.t;
 G.chkTaps = (G.chkTaps || []).filter(x => x > t - FOUL.spamT);
 G.chkTaps.push(t);
 return G.chkTaps.length >= FOUL.spamN;
}

function dCheck() {
 const G = game, c = G.dcar, d = G.dctl;
 if (d) spamCheck();
 if (d && !(d.stun > 0)) {
  const gk = !c || Math.hypot(c.x - d.x, c.y - d.y) > DZ.checkR ? keeperInCrease(d, DZ.checkR) : null;
  if (gk) {
   G.chkTaps = [];
   foulCall('GOALIE INTERFERENCE', 'CHECKED THE GOALIE IN HIS CREASE', 'U', d, {
    user: true
   });
   return 'foul';
  }
  const late = !c || Math.hypot(c.x - d.x, c.y - d.y) > DZ.checkR + DLUNGE ? dLateTarget(DZ.checkR) : null;
  if (late && G.t - G.dLastCar.t > FOUL.slashT && !nearLoose(late)) {
   G.lateHacks = G.lateHacks || {};
   const k = G.dLastCar.t.toFixed(2);
   G.lateHacks[k] = (G.lateHacks[k] || 0) + 1;
   if (G.lateHacks[k] >= 2) {
    G.chkTaps = [];
    foulCall('SLASHING', "HACKING HIM AFTER HE GOT RID OF IT", 'U', d, {
     user: true
    });
    return 'foul';
   }
   addFx('txt', late.x, late.y - 24, {
    s: 'HE DOESN\'T HAVE IT!',
    col: '#ffe14d',
    life: .7
   });
   return 'late';
  }
 }
 if (!c || !d || G.ball.state !== 'held' || G.chk.cd > 0 || d.stun > 0) return 'cooldown';
 const reach = dLunge(d, c, DZ.checkR);
 if (!reach) {
  G.chk.cd = DZ.checkCd;
  d.stun = .3;
  d.chkT0 = menuT;
  addFx('txt', d.x, d.y - 32, {
   s: 'WHIFF - TOO FAR',
   col: '#ff9a8a',
   life: .7
  });
  return 'whiff';
 }
 G.chk.cd = DZ.checkCd;
 G.chk.t = 0;
 G.dChecks = (G.dChecks || 0) + 1;
 d.chkT0 = menuT;
 if (G.chk.who !== c) {
  G.chk.n = 0;
  G.chk.who = c;
 }
 const tutChk = !!(G.tutorial && !G.tutorial.complete && G.tutorial.step === TD.CHECK);
 if (!tutChk && dPenaltyRoll(PEN_DCHECK_P, d, 'SLASHING')) return 'flag';
 let land = tutChk ? 1 : clamp(.6 + .1 * pr(d, 'def') - .08 * pr(c, 'stk'), .3, .88) * reach * (DF.uLand || 1);
 const sd110 = chk110(G) && !tutChk ? side110(c, d, DGX) : null;
 if (sd110 === 'off' && !inZone110(c, 'C')) land *= CHK110.offLand;
 if (sd110) st110('uChk_' + sd110);
 if (Math.random() >= land) {
  G.chk.n = 0;
  d.stun = .45;
  G.dBeat = .8;
  c.beatT = .8;
  addFx('txt', d.x, d.y - 24, {
   s: 'WHIFF!',
   col: '#ff9a8a',
   life: .7
  });
  return 'whiff';
 }
 G.chk.n++;
 sfx12('check_clack', .75);
 G.checkSnd = (G.checkSnd || 0) + 1;
 addFx('pop', c.x - 6, c.y - 9);
 tutFlag('checked');
 if (sd110) st110('uLand_' + sd110);
 const s17 = window.V17 && G.g17 ? V17.checkLanded(c) : null;
 if (s17) {
  G.dDislodge = (G.dDislodge || 0) + 1;
  const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1.6, 1.6), v = rnd(40, 60);
  dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'check');
  st14('ct', d.pl);
  c.stun = .4;
  return 'dislodge';
 }
 const pOut = tutChk ? 0 : clamp(.16 + .1 * pr(d, 'def') - .1 * pr(c, 'stk'), .05, .45) * (DF.uLand || 1);
 const one110 = !!sd110 && sd110 !== 'off' && inZone110(c, 'C');
 const r2403 = chkRule2403(), need2403 = r2403 ? G.chk.need = chkNeed2403(c, d, DGX) : 0;
 if (one110 && !r2403) st110('uStripZone');
 if (r2403) chkStat2403('uLand_' + chkZone2403(c));
 if (r2403 ? G.chk.n >= need2403 || Math.random() < pOut : G.chk.n >= chkNeed181() || one110 || Math.random() < pOut) {
  if (r2403) chkStat2403('uStrip_' + chkZone2403(c) + '_' + G.chk.n);
  G.dDislodge = (G.dDislodge || 0) + 1;
  const n = G.chk.n;
  tutFlag('stripped');
  const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1.6, 1.6), v = rnd(40, 60);
  dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'check');
  st14('ct', d.pl);
  if (window.V17) V17.say('cto', d.x, d.y - 30);
  c.stun = .4;
  G.lastDislodgeN = n;
  return 'dislodge';
 }
 addFx('txt', c.x, c.y - 30, {
  s: G.chk.n + '/' + (chkRule2403() && G.chk.need ? G.chk.need : chkNeed181()),
  col: '#ffe14d',
  life: .6
 });
 return 'land';
}

function cpuZoneKind181(G, dl) {
 const s = G.practice && G.practice.dScheme;
 if (s && s !== 'MAN' && s !== 'BLACK') return s === 'ZONE' || !ZONES[s] || ZONES[s].length < dl.length ? 'zone' : s;
 return dl.length < 6 ? G.cpuMD || 'BOX + 1' : 'zone';
}

function tewa181() {
 return typeof DF !== 'undefined' && DF.level === 5 && !(game && game.tutorial);
}

function chkNeed181() {
 return tewa181() ? 2 : 3;
}

function hitChance(h, c) {
 return clamp(.34 + .012 * ((h.pl ? h.pl.r.str : 70) - (c.pl ? c.pl.r.str : 70)) + (isPole(h) ? .06 : 0), .06, .8);
}

const HIT = {
 tau: .25,
 minFrac: .4,
 uMinFrac: .18,
 down: 1.25,
 kb: 7,
 kbT: .18
};

const CALL_PICK = {
 press: .45,
 run: 2.6,
 set: 1.5
};

function holdTick() {
 const G = game;
 if (!G || screen !== 'live') return;
 for (const pt of pointers.values()) {
  if (!pt.mate || pt.pickCalled || pt.stale || pt.moved >= TAP_PX || pt.joy && joy && joy.id === pt.id && joy.on) continue;
  if (now() - pt.t0 < CALL_PICK.press) continue;
  const m = pt.mate, c = G.carrier;
  if (!c || !G.players.includes(m) || m === c || G.ball.state !== 'held') {
   pt.mate = null;
   continue;
  }
  pt.pickCalled = true;
  if (shootP && shootP.id === pt.id) shootP = null;
  callPick(m);
  tutFlag('pickCalled');
 }
}

function pickGuard181(c) {
 const G = game;
 let best = null, bd = 1e9;
 for (const q of G.players) if (q.team === 'D' && !isKeeper(q)) {
  const dd = Math.hypot(q.x - c.x, q.y - c.y);
  if (dd < bd) {
   bd = dd;
   best = q;
  }
 }
 const mk = G.players.find(q => q.team === 'D' && q.mark === c && !isKeeper(q));
 return mk && Math.hypot(mk.x - c.x, mk.y - c.y) <= Math.max(bd + 6, 16) ? mk : best;
}

function pickRunDir181(c) {
 const G = game;
 if (G.dodge && G.dodge.who === c) return [ G.dodge.vx, G.dodge.vy ];
 if (G.run && G.carrier === c && Math.hypot(G.run.x, G.run.y) > .2) return [ G.run.x, G.run.y ];
 const v = Math.hypot(c.mvx || 0, c.mvy || 0);
 return v > 6 ? [ c.mvx / v, c.mvy / v ] : null;
}

function pickSpot181(cp, c, m) {
 const d = cp.d, ax = d.x - c.x, ay = d.y - c.y, al = Math.hypot(ax, ay) || 1, nx = -ay / al, ny = ax / al;
 const rd = pickRunDir181(c);
 if (rd && Math.abs(rd[0] * nx + rd[1] * ny) > .25) cp.side = rd[0] * nx + rd[1] * ny >= 0 ? 1 : -1; else if (!cp.side) cp.side = (m.x - d.x) * nx + (m.y - d.y) * ny >= 0 ? 1 : -1;
 let sx = d.x + nx * cp.side * 6 + ax / al * 1.5, sy = d.y + ny * cp.side * 6 + ay / al * 1.5;
 if (Math.hypot(sx - GX, sy - CY) < CREASE + 2) {
  const ox = d.x - nx * cp.side * 6 + ax / al * 1.5, oy = d.y - ny * cp.side * 6 + ay / al * 1.5;
  if (Math.hypot(ox - GX, oy - CY) >= CREASE + 2) {
   sx = ox;
   sy = oy;
  }
 }
 {
  const lead = clamp(Math.hypot(m.x - sx, m.y - sy) / (PACE.cut * 1.25), 0, .8);
  sx += (d.mvx || 0) * lead;
  sy += (d.mvy || 0) * lead;
 }
 const cr = Math.hypot(sx - GX, sy - CY);
 if (cr < CREASE + 2) {
  const k = (CREASE + 2) / (cr || 1);
  sx = GX + (sx - GX) * k;
  sy = CY + (sy - CY) * k;
  if (cr < .01) sx = GX - CREASE - 2;
 }
 cp.x = clamp(sx, MIDX + 6, FL - 8);
 cp.y = clamp(sy, FT + 10, FB - 4);
}

function callPick(m) {
 const G = game, c = G.carrier;
 if (!c || !m) return false;
 const d = pickGuard181(c);
 if (!d) return false;
 const cp = {
  d: d,
  x: d.x,
  y: d.y,
  phase: 'run',
  t: G.t,
  hit: [],
  side: 0
 };
 pickSpot181(cp, c, m);
 cp.runMax = Math.max(CALL_PICK.run, Math.hypot(m.x - cp.x, m.y - cp.y) / (PACE.cut * 1.25) + .8);
 m.callPick = cp;
 m.pickSet = null;
 m.playT = null;
 m.playHold = null;
 G.calledPicks = (G.calledPicks || 0) + 1;
 SFX.tap();
 addFx('txt', m.x, m.y - 26, {
  s: 'PICK!',
  col: '#ffe14d',
  life: .8
 });
 return true;
}

function callPickTick(dt) {
 const G = game;
 if (!G || screen !== 'live') return;
 for (const p of G.players) {
  const cp = p.callPick;
  if (!cp) continue;
  if (p === G.carrier || !G.carrier || G.ball.state !== 'held') {
   p.callPick = null;
   p.pickSet = null;
   p.wander = 0;
   continue;
  }
  if (cp.phase === 'run') {
   {
    const c = G.carrier, g = pickGuard181(c);
    if (!G.players.includes(cp.d) || g && g !== cp.d && Math.hypot(g.x - c.x, g.y - c.y) + 2 < Math.hypot(cp.d.x - c.x, cp.d.y - c.y)) {
     if (g) cp.d = g;
    }
    pickSpot181(cp, c, p);
   }
   const rt = G.t - cp.t, rm = cp.runMax || CALL_PICK.run;
   if (Math.hypot(p.x - cp.x, p.y - cp.y) < 4 || rt > rm && (Math.hypot(p.x - cp.d.x, p.y - cp.d.y) <= 12 || rt > rm + 2.5)) {
    cp.phase = 'set';
    cp.t = G.t;
    p.pickSet = {
     x: p.x,
     y: p.y,
     t: G.t,
     until: 1e9,
     hit: []
    };
    G.callPicksSet = (G.callPicksSet || 0) + 1;
    addFx('txt', p.x, p.y - 26, {
     s: 'SET!',
     col: '#7dff7a',
     life: .6
    });
   }
   continue;
  }
  if (G.t - cp.t > CALL_PICK.set) {
   p.callPick = null;
   p.pickSet = null;
   p.wander = 0;
   continue;
  }
  for (const d of G.players) {
   if (d.team !== 'D' || cp.hit.includes(d) || Math.hypot(d.x - p.x, d.y - p.y) > 7) continue;
   if (!(d.mark === G.carrier || G.slide === d || Math.hypot(d.x - G.carrier.x, d.y - G.carrier.y) < 22)) continue;
   cp.hit.push(d);
   d.react = rnd(.7, 1);
   d.tx = d.x;
   d.ty = d.y;
   G.picksSet = (G.picksSet || 0) + 1;
   const ax = d.x - p.x, ay = d.y - p.y, al = Math.hypot(ax, ay) || 1;
   d.x += ax / al * 3;
   d.y += ay / al * 3;
   addFx('txt', p.x, p.y - 26, {
    s: 'PICKED!',
    col: '#7dff7a',
    life: .8
   });
   SFX.save();
  }
 }
}

function momTick(dt) {
 const G = game;
 if (!G || !G.players || !(dt > 0)) return;
 const a = Math.min(1, dt / HIT.tau);
 for (const p of G.players) {
  if (p.lx == null) {
   p.lx = p.x;
   p.ly = p.y;
   p.mvx = 0;
   p.mvy = 0;
   continue;
  }
  let vx = (p.x - p.lx) / dt, vy = (p.y - p.ly) / dt;
  if (Math.hypot(vx, vy) > 120) {
   vx = 0;
   vy = 0;
  }
  if (p.fvx == null) {
   p.fvx = vx;
   p.fvy = vy;
  } else {
   const af = Math.min(1, dt / PEL.tauF);
   p.fvx += (vx - p.fvx) * af;
   p.fvy += (vy - p.fvy) * af;
  }
  p.cwT = (p.cwT || 0) + dt;
  if (p.cwT >= PEL.win) {
   const s1 = Math.hypot(p.fvx, p.fvy);
   for (const w of p.cw || []) {
    const s0 = Math.hypot(w[0], w[1]);
    if (s0 > PEL.minSpd && s1 > PEL.minSpd && (w[0] * p.fvx + w[1] * p.fvy) / (s0 * s1) < PEL.cos && !(p.down > 0)) {
     hardCut(p, p.fvx / s1, p.fvy / s1, false);
     break;
    }
   }
   p.cw = [ p.cw && p.cw[1] || [ p.fvx, p.fvy ], [ p.fvx, p.fvy ] ];
   p.cwT = 0;
  }
  p.mvx += (vx - p.mvx) * a;
  p.mvy += (vy - p.mvy) * a;
  p.lx = p.x;
  p.ly = p.y;
 }
}

function hasRunUp(h, c, top, frac) {
 if (!h || !c) return false;
 const dx = c.x - h.x, dy = c.y - h.y, L = Math.hypot(dx, dy) || 1;
 return ((h.mvx || 0) * dx + (h.mvy || 0) * dy) / L >= (frac != null ? frac : HIT.minFrac) * (top || PACE.dBall);
}

function runUpPow(h, c, top) {
 if (!h || !c) return 0;
 const dx = c.x - h.x, dy = c.y - h.y, L = Math.hypot(dx, dy) || 1, v = ((h.mvx || 0) * dx + (h.mvy || 0) * dy) / L / (top || PACE.dBall);
 return clamp((v - HIT.uMinFrac) / (1 - HIT.uMinFrac), 0, 1);
}

function downTick(p, dt) {
 if (p.kb && p.kb.t > 0) {
  const s = Math.min(dt, p.kb.t);
  p.x += p.kb.vx * s;
  p.y = clamp(p.y + p.kb.vy * s, FT + 2, FB - 1);
  p.kb.t -= dt;
 }
}

function shove(c, d) {
 const dx = c.x - d.x, dy = c.y - d.y, L = Math.hypot(dx, dy) || 1;
 c.x += dx / L * 2;
 c.y = clamp(c.y + dy / L * 2, FT + 2, FB - 1);
 game.shoves = (game.shoves || 0) + 1;
 addFx('txt', d.x, d.y - 24, {
  s: 'SHOVE - NEED A RUN-UP',
  col: '#ffb14d',
  life: .8
 });
 hit12(.15);
 d.hitT0 = menuT;
}

const GCHIRP_P = .4, OUR_SAVE_P = .7;

function goalieSave12(gk, cy) {
 const G = game;
 if (!gk) return;
 cheer18('save');
 const dy = cy - gk.y, reach = gk.reach || GK.reach;
 gk.saveT0 = menuT;
 gk.saveFr = Math.abs(dy) <= 3 ? 'save_low' : dy < 0 ? 'save_high' : 'save_side';
 const easy = Math.abs(dy) <= Math.max(1, reach * .5);
 G.saveLog = G.saveLog || [];
 G.saveLog.push(easy ? 1 : 0);
 if (gk.team === 'G2') {
  if (Math.random() < OUR_SAVE_P) {
   G.gChirps = (G.gChirps || 0) + 1;
   G.ourSaveChirps = (G.ourSaveChirps || 0) + 1;
   gk.chirpT0 = menuT + .35;
   G.gChirpPend = {
    gk: gk,
    t: vt() + .35
   };
  }
  return;
 }
 if (!easy) return;
 G.easySaves = (G.easySaves || 0) + 1;
 if (Math.random() >= GCHIRP_P) return;
 G.gChirps = (G.gChirps || 0) + 1;
 gk.chirpT0 = menuT + .35;
 G.gChirpPend = {
  gk: gk,
  t: vt() + .35
 };
}

function chirpTick() {
 const G = game;
 if (!G) return;
 if (G.gChirpPend && vt() >= G.gChirpPend.t) {
  const gk = G.gChirpPend.gk;
  G.gChirpPend = null;
  voice12('goalie', gk.x, gk.y - 32, .6);
 }
 if (G.ankleChirpPend && vt() >= G.ankleChirpPend.t) {
  const c = G.ankleChirpPend.c;
  G.ankleChirpPend = null;
  voice12('ankles', c.x, c.y - 32, .6);
 }
 if (G.tutorial || G.over || !(screen === 'live' || screen === 'defense' || screen === 'cpu')) return;
 sideline18();
 const t = vt();
 if (G.voiceAt == null) G.voiceAt = t - CHIRP.gap;
 if (G.fillGap == null) G.fillGap = rnd(CHIRP.fill[0], CHIRP.fill[1]);
 if (t - G.voiceAt >= G.fillGap) {
  const side = 'u', pool = G.carrier && screen === 'live' ? 'bench' : G.dcar || screen === 'cpu' ? 'chirp' : 'bench';
  const k = voice12(pool === 'bench' ? 'chirp' : pool, benchX(side) + 34, H - 34);
  if (k) {
   G.fillChirps = (G.fillChirps || 0) + 1;
   G.coachPoint = G.coachPoint || {};
   G.coachPoint[side] = menuT;
  }
  G.fillGap = rnd(CHIRP.fill[0], CHIRP.fill[1]);
 }
}

const BENCH_CHIRP = {
 max: Infinity,
 gap: CHIRP.gap,
 pHit: .85,
 pGoal: .9
};

function benchReact(side, why) {
 const G = game;
 if (!G) return;
 G.benchCheer = G.benchCheer || {};
 G.benchCheer[side] = menuT;
 if (why === 'hit') cheer18('hit');
 if (side !== 'u' && why === 'goal') return;
 G.benchChirpN = G.benchChirpN || 0;
 if (Math.random() >= (why === 'hit' ? BENCH_CHIRP.pHit : BENCH_CHIRP.pGoal)) return;
 const bx = benchX(side) + 30;
 const k = voice12(why === 'goal' ? 'benchGoal' : 'bench', bx, H - 34);
 if (k) {
  G.benchChirpN++;
  G.benchChirpAt = vt();
  G.coachPoint = G.coachPoint || {};
  G.coachPoint[side] = menuT;
 }
}

let rs18 = (Date.now() % 2147483647 ^ 625341585) & 2147483647;

function r18s() {
 rs18 = Math.imul(rs18, 1103515245) + 12345 & 2147483647;
 return rs18 / 2147483648;
}

const SL18 = {
 gap: [ 6, 10 ],
 first: [ 1.5, 4 ],
 life: 2.2,
 pool: null
};

function sidePool18() {
 if (SL18.pool && SL18.pool.length) return SL18.pool;
 const out = [], add = v => {
  if (v && v.cat === 'bench' && v.text && !out.includes(v.text)) out.push(v.text);
 };
 try {
  for (const v of RL12A.VOICES || []) add(v);
 } catch (e) {}
 try {
  for (const v of window.RL17_CHIRPS || []) add(v);
 } catch (e) {}
 if (!out.length) out.push("LET'S GO, BOYS!");
 return SL18.pool = out;
}

function slPop18(o) {
 const G = game;
 if (!G) return;
 G.pops = (G.pops || []).filter(p => menuT - p.t0 < p.life);
 G.pops.push(Object.assign({
  col: '#fff',
  bub: true,
  sl: true,
  t0: menuT
 }, o));
}

function sideline18() {
 const G = game;
 if (!G || G.tutorial || G.over) return;
 if (typeof SET171 !== 'undefined' && SET171.chirps === false) return;
 const t = vt();
 G.sl18 = G.sl18 || {
  u: null,
  o: null,
  n: {
   u: 0,
   o: 0
  },
  last: null,
  log: []
 };
 const S = G.sl18;
 for (const side of [ 'u', 'o' ]) {
  if (S[side] == null || S[side] > t + 30) {
   S[side] = t + SL18.first[0] + r18s() * (SL18.first[1] - SL18.first[0]) + (side === 'o' ? 2.5 : 0);
   continue;
  }
  if (t < S[side]) continue;
  S[side] = t + SL18.gap[0] + r18s() * (SL18.gap[1] - SL18.gap[0]);
  const pool = sidePool18();
  let s = pool[Math.floor(r18s() * pool.length)];
  if (s === S.last && pool.length > 1) s = pool[(pool.indexOf(s) + 1) % pool.length];
  S.last = s;
  S.n[side]++;
  if (S.log.length < 400) S.log.push([ side, s, +t.toFixed(2) ]);
  const B = G.bench && G.bench[side], nb = B && B.ids && B.ids.length ? B.ids.length : 4, i = Math.floor(r18s() * nb);
  const x = benchSlotX(side, i), w = textW(s) + 4, live = (G.pops || []).filter(p => menuT - p.t0 < p.life && Math.abs(p.x - x) < (w + textW(p.s) + 4) / 2 + 2);
  let row = 0;
  while (row < 4 && live.some(p => Math.abs(p.y - (H - 34 - row * 11)) < 9)) row++;
  slPop18({
   s: s,
   x: x,
   y: H - 34 - row * 11,
   life: SL18.life,
   alt: side === 'u' ? .27 : .73
  });
 }
}

const EW18 = {
 gap: 1.6,
 life: 1.6,
 per: 1
};

function ewww18(why) {
 const G = game;
 if (!G) return;
 const now = vt();
 if (G.ew18T != null && now - G.ew18T >= 0 && now - G.ew18T < EW18.gap) return;
 G.ew18T = now;
 G.ew18 = (G.ew18 || 0) + 1;
 (G.ew18Log = G.ew18Log || []).push([ why, +(+G.t || 0).toFixed(2) ]);
 for (const side of [ 'u', 'o' ]) for (let i = 0; i < EW18.per; i++) {
  const n = 4 + Math.floor(r18s() * 4), s = 'E' + 'W'.repeat(n) + (r18s() < .5 ? 'W!' : '!');
  slPop18({
   s: s,
   x: benchX(side) + 36 + i * 30 + Math.round((r18s() - .5) * 4),
   y: H - 34 - i % 2 * 11,
   life: EW18.life,
   t0: menuT + i * .09 + r18s() * .1,
   alt: (side === 'u' ? .3 : .7) + i * .16,
   ew: true
  });
 }
 ewSnd18();
}

let ewBuf18 = null;

function noiseBuf18(ac) {
 if (ewBuf18 && ewBuf18.sampleRate === ac.sampleRate) return ewBuf18;
 const n = Math.floor(ac.sampleRate * 1.6);
 ewBuf18 = ac.createBuffer(1, n, ac.sampleRate);
 const d = ewBuf18.getChannelData(0);
 let q = 424242;
 for (let i = 0; i < n; i++) {
  q = Math.imul(q, 1103515245) + 12345 & 2147483647;
  d[i] = q / 1073741824 - 1;
 }
 return ewBuf18;
}

function ewSnd18() {
 const G = game;
 if (G) G.ewSnd18 = (G.ewSnd18 || 0) + 1;
 if (window.__rlAudio) window.__rlAudio.push({
  n: 'ewww',
  v: +(EWS18.out * MASTER_VOL).toFixed(3),
  t: G ? +(+G.t || 0).toFixed(2) : 0,
  s: screen
 });
 if (window.V20 && V20.ew206) try {
  if (V20.ew206()) return;
 } catch (e) {}
 try {
  const ac = AC;
  if (!ac || muted || ac.state === 'closed') return;
  const t = ac.currentTime, D = 1.2;
  const out = ac.createGain();
  out.gain.setValueAtTime(1e-4, t);
  out.gain.exponentialRampToValueAtTime(EWS18.out * MASTER_VOL, t + .12);
  out.gain.setValueAtTime(EWS18.out * MASTER_VOL, t + .75);
  out.gain.exponentialRampToValueAtTime(1e-4, t + D);
  out.connect(ac.destination);
  const mouth = [ [ 300, 300, 6, 1 ], [ 2300, 800, 9, .75 ], [ 3e3, 2300, 10, .35 ] ].map(([a, z, q, gn]) => {
   const f = ac.createBiquadFilter(), g2 = ac.createGain();
   f.type = 'bandpass';
   f.frequency.setValueAtTime(a, t);
   f.frequency.setValueAtTime(a, t + .15);
   f.frequency.exponentialRampToValueAtTime(z, t + .85);
   f.Q.value = q;
   g2.gain.value = gn * EWS18.formant;
   f.connect(g2);
   g2.connect(out);
   return f;
  });
  const mix = ac.createGain();
  mix.gain.value = 1;
  for (const f of mouth) mix.connect(f);
  for (const [f0, dl, vr] of [ [ 118, 0, 5.1 ], [ 131, .03, 5.6 ], [ 146, .05, 4.7 ], [ 165, .02, 6 ], [ 196, .06, 5.3 ], [ 233, .04, 4.9 ], [ 262, .08, 5.8 ] ]) {
   const o = ac.createOscillator(), og = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
   o.type = 'sawtooth';
   o.frequency.setValueAtTime(f0, t + dl);
   o.frequency.linearRampToValueAtTime(f0 * 1.18, t + .45);
   o.frequency.linearRampToValueAtTime(f0 * .86, t + D);
   lfo.frequency.value = vr;
   lg.gain.value = f0 * .02;
   lfo.connect(lg);
   lg.connect(o.frequency);
   og.gain.setValueAtTime(1e-4, t + dl);
   og.gain.exponentialRampToValueAtTime(EWS18.voice, t + dl + .08);
   o.connect(og);
   og.connect(mix);
   o.start(t + dl);
   lfo.start(t + dl);
   o.stop(t + D + .05);
   lfo.stop(t + D + .05);
  }
  const ns = ac.createBufferSource(), ng = ac.createGain();
  ns.buffer = noiseBuf18(ac);
  ng.gain.value = EWS18.breath;
  ns.connect(ng);
  ng.connect(mix);
  ns.start(t);
  ns.stop(t + D + .05);
 } catch (e) {}
}

const EWS18 = {
 out: 1.1,
 formant: 1,
 voice: .2,
 breath: .08
};

const CH18 = {
 gap: .7,
 out: .2
};

function cheer18(why) {
 const G = game;
 if (!G) return;
 const now = vt();
 if (G.ch18T != null && now - G.ch18T >= 0 && now - G.ch18T < CH18.gap) return;
 G.ch18T = now;
 G.ch18 = (G.ch18 || 0) + 1;
 (G.ch18Log = G.ch18Log || []).push([ why, +(+G.t || 0).toFixed(2) ]);
 if (window.__rlAudio) window.__rlAudio.push({
  n: 'cheer18',
  v: +(CH18.out * MASTER_VOL).toFixed(3),
  t: +(+G.t || 0).toFixed(2),
  s: screen
 });
 try {
  const ac = AC;
  if (!ac || muted || ac.state === 'closed') return;
  const t = ac.currentTime, D = 1.25;
  const out = ac.createGain();
  out.gain.setValueAtTime(1e-4, t);
  out.gain.exponentialRampToValueAtTime(CH18.out * MASTER_VOL, t + .32);
  out.gain.exponentialRampToValueAtTime(1e-4, t + D);
  out.connect(ac.destination);
  const hp = ac.createBiquadFilter(), lp = ac.createBiquadFilter(), pk = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 300;
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1800, t);
  lp.frequency.linearRampToValueAtTime(3200, t + .3);
  lp.frequency.linearRampToValueAtTime(1500, t + D);
  pk.type = 'peaking';
  pk.frequency.value = 900;
  pk.Q.value = 1.2;
  pk.gain.value = 6;
  const ns = ac.createBufferSource();
  ns.buffer = noiseBuf18(ac);
  ns.playbackRate.value = .9;
  ns.connect(hp);
  hp.connect(lp);
  lp.connect(pk);
  pk.connect(out);
  ns.start(t, .2);
  ns.stop(t + D + .05);
 } catch (e) {}
}

function eventChirp(pool, p, x, y) {
 const G = game;
 if (!G || G.tutorial || Math.random() >= Math.min(1, p * 1.25)) return null;
 return voice12(pool, x == null ? benchX('u') + 34 : x, y == null ? H - 34 : y);
}

function freeD(d) {
 const G = game;
 return !!(G && d && !(d.mark && G.players.includes(d.mark)));
}

function markOf(d) {
 const G = game;
 return d && d.mark && G && G.players.includes(d.mark) ? d.mark : null;
}

function slideBest(def, c, adj, excl) {
 const ok = d => d && d !== excl && d.mark !== c && !(d.stun > 0) && !(d.down > 0);
 let best = null, bd = 160;
 for (const d of def) if (ok(d) && freeD(d)) {
  const dd = Math.hypot(d.x - c.x, d.y - c.y);
  if (dd < bd) {
   bd = dd;
   best = d;
  }
 }
 if (best) return best;
 bd = 70;
 for (const d of def) if (ok(d) && !adj.has(d.mark)) {
  const dd = Math.hypot(d.x - c.x, d.y - c.y);
  if (dd < bd) {
   bd = dd;
   best = d;
  }
 }
 if (!best) for (const d of def) if (ok(d)) {
  const dd = Math.hypot(d.x - c.x, d.y - c.y);
  if (dd < bd) {
   bd = dd;
   best = d;
  }
 }
 if (!best) {
  bd = 130;
  for (const d of def) if (ok(d) && !adj.has(d.mark)) {
   const dd = Math.hypot(d.x - c.x, d.y - c.y);
   if (dd < bd) {
    bd = dd;
    best = d;
   }
  }
 }
 return best;
}

function rotatePick(def, slider, left, c, adj, excl) {
 if (!left) return null;
 let rb = null, rd = 1e9;
 for (const d of def) if (d !== slider && d !== excl && d.mark !== c && freeD(d) && !(d.down > 0)) {
  const dd = Math.hypot(d.x - left.x, d.y - left.y);
  if (dd < rd) {
   rd = dd;
   rb = d;
  }
 }
 if (rb) return rb;
 for (const d of def) if (d !== slider && d !== excl && d.mark !== c && !adj.has(d.mark)) {
  const dd = Math.hypot(d.x - left.x, d.y - left.y);
  if (dd < rd) {
   rd = dd;
   rb = d;
  }
 }
 return rb;
}

function hotPick(def, c, adj, prev, excl) {
 let best = null, bd = 1e9;
 const ok = d => d && d !== excl && d.mark !== c && !(d.stun > 0) && !(d.down > 0) && !d.busy;
 {
  let fb = null, fd = 160;
  for (const d of def) if (ok(d) && freeD(d) && game && game.players.includes(d)) {
   const dd = Math.hypot(d.x - c.x, d.y - c.y);
   if (dd < fd) {
    fd = dd;
    fb = d;
   }
  }
  if (fb) return fb;
 }
 for (const pass of [ 0, 1 ]) {
  for (const d of def) if (ok(d) && (pass || !adj || !adj.has(d.mark))) {
   const dd = Math.hypot(d.x - c.x, d.y - c.y);
   if (dd < bd) {
    bd = dd;
    best = d;
   }
  }
  if (best) break;
 }
 if (prev && prev !== best && def.includes(prev) && ok(prev) && (!adj || !adj.has(prev.mark)) && Math.hypot(prev.x - c.x, prev.y - c.y) < bd + 16) return prev;
 return best;
}

function fireCall(gk) {
 const G = game;
 if (!G) return;
 G.fireN = (G.fireN || 0) + 1;
 G.hotP = null;
 let k = null;
 if (!voiceBusy() && vt() - (G.fireAt != null ? G.fireAt : -99) >= 6) {
  const va = G.voiceAt;
  k = voice12('fire', null, null, 0, true);
  G.voiceAt = va;
  G.fireAt = vt();
  G.fireVoiced = (G.fireVoiced || 0) + 1;
 }
 if (gk) pop12('FIRE! FIRE!', gk.x, gk.y - 30, '#ff9a3a', 1.3);
 G.fireLog = G.fireLog || [];
 G.fireLog.push({
  t: +vt().toFixed(2),
  k: k,
  scr: screen
 });
}

function drawFlame(p) {
 const fr = Math.floor(menuT * 12), x = Math.round(p.x), y = Math.round(p.y) + 1;
 const base = [ 4, 6, 5, 2, 1, 2, 5, 6, 4 ];
 for (let i = 0; i < 9; i++) {
  const h = Math.max(1, base[i] + ((fr + i * 5) % 4 === 0 ? 1 : (fr + i * 3) % 5 === 0 ? -1 : 0));
  for (let k = 0; k < h; k++) px(x - 4 + i, y - k, k === 0 ? '#c8200e' : k >= h - 1 ? '#ffe14d' : k >= h - 2 ? '#ffb02a' : '#ff5a1a');
 }
 if (fr % 3 !== 0) px(x + (fr % 2 ? -3 : 3), y - 7 - fr % 2, '#ffd23a');
 const G = game;
 G.flameN = (G.flameN || 0) + 1;
 G.flameLast = {
  who: p.pl ? p.pl.id : null,
  team: p.team,
  t: menuT
 };
}

function knockDown(c, by, side, pow) {
 const dm = pow == null ? 1 : .85 + .5 * pow, km = pow == null ? 1 : .7 + .9 * pow;
 c.down = HIT.down * dm;
 c.stun = HIT.down * dm;
 c.downT0 = HIT.down * dm;
 if (by) {
  const dx = c.x - by.x, dy = c.y - by.y, L = Math.hypot(dx, dy) || 1;
  c.kb = {
   vx: dx / L * HIT.kb * km / HIT.kbT,
   vy: dy / L * HIT.kb * km / HIT.kbT,
   t: HIT.kbT
  };
  c.fallDir = dx >= 0 ? 1 : -1;
 } else {
  c.kb = null;
  c.fallDir = 1;
 }
 addFx('txt', c.x, c.y - 28, {
  s: 'LEVELED!',
  col: '#ff5a4a',
  life: 1
 });
 {
  const s = hitStrength(by, c);
  hit12(s);
  if (by) by.hitT0 = menuT;
  if (s >= .5 && by) benchReact(by.team === 'O' || by.team === 'G2' ? 'u' : 'o', 'hit');
 }
 game.hits = (game.hits || 0) + 1;
 injuryRoll(c.team === 'O' ? 'cpuHit' : 'hit', c);
 v14Hit(c, by);
}

function dHit() {
 const G = game, c = G.dcar, d = G.dctl;
 if (d && !(d.stun > 0)) {
  const gk = !c || Math.hypot(c.x - d.x, c.y - d.y) > DZ.hitR ? keeperInCrease(d, DZ.hitR) : null;
  if (gk) {
   knockDown(gk, d);
   foulCall('GOALIE INTERFERENCE', 'HIT THE GOALIE IN HIS CREASE', 'U', d, {
    user: true
   });
   return 'foul';
  }
  const late = !c || Math.hypot(c.x - d.x, c.y - d.y) > DZ.hitR + DLUNGE ? dLateTarget(DZ.hitR) : null;
  if (late) {
   if (nearLoose(late)) {
    if (!hasRunUp(d, late, PACE.dBall * DZ.ctrlSpd, HIT.uMinFrac)) {
     shove(late, d);
     d.stun = .35;
     return 'shove';
    }
    knockDown(late, d, null, runUpPow(d, late, PACE.dBall * DZ.ctrlSpd));
    late.stun = .6;
    return 'level';
   }
   if (G.t - G.dLastCar.t > FOUL.lateT) {
    knockDown(late, d);
    foulCall('ILLEGAL BODY CHECK', "LATE HIT - HE DIDN'T HAVE THE BALL", 'U', d, {
     user: true
    });
    return 'foul';
   }
  }
  if (!late && (G.ball.state === 'loose' || G.ball.state === 'chase')) {
   const b = G.ball, gbT = G.players.filter(p => p.team === 'D' && !(p.down > 0) && Math.hypot(p.x - b.x, p.y - b.y) < 26 && Math.hypot(p.x - d.x, p.y - d.y) <= DZ.hitR + 4).sort((u, v) => Math.hypot(u.x - d.x, u.y - d.y) - Math.hypot(v.x - d.x, v.y - d.y))[0];
   if (gbT) {
    G.gbHits = (G.gbHits || 0) + 1;
    d.hitT0 = menuT;
    if (!hasRunUp(d, gbT, PACE.dBall * DZ.ctrlSpd, HIT.uMinFrac)) {
     shove(gbT, d);
     d.stun = .35;
     return 'shove';
    }
    knockDown(gbT, d, null, runUpPow(d, gbT, PACE.dBall * DZ.ctrlSpd));
    gbT.stun = Math.max(gbT.stun || 0, .6);
    G.gbLevels = (G.gbLevels || 0) + 1;
    addFx('txt', gbT.x, gbT.y - 30, {
     s: 'LEVELED ON THE GROUND BALL!',
     col: '#ffe14d',
     life: 1
    });
    return 'level';
   }
  }
 }
 if (!c || !d || G.ball.state !== 'held' || d.stun > 0) return 'none';
 const reach = dLunge(d, c, DZ.hitR);
 if (!reach) {
  d.stun = .6;
  G.dBeat = .8;
  c.beatT = .8;
  SFX.bad();
  addFx('txt', d.x, d.y - 32, {
   s: 'MISSED HIM - TOO FAR',
   col: '#ff9a8a',
   life: .8
  });
  return 'whiff';
 }
 G.dHits = (G.dHits || 0) + 1;
 tutFlag('checked');
 tutFlag('hit');
 d.hitT0 = menuT;
 if (dPenaltyRoll(PEN_DHIT_P, d, 'ILLEGAL BODY CHECK')) return 'flag';
 if (fromBehind(d, c, facingOf(c, DGX))) {
  knockDown(c, d);
  G.dBehind = (G.dBehind || 0) + 1;
  foulCall('PUSHING', 'HIT HIM FROM BEHIND', 'U', d, {
   user: true
  });
  return 'foul';
 }
 if (reach >= 1 && !hasRunUp(d, c, PACE.dBall * DZ.ctrlSpd, HIT.uMinFrac)) {
  shove(c, d);
  d.stun = .35;
  G.dShoves = (G.dShoves || 0) + 1;
  return 'shove';
 }
 const pow = reach >= 1 ? runUpPow(d, c, PACE.dBall * DZ.ctrlSpd) : .35;
 G.hitPow = (G.hitPow || []).concat([ +pow.toFixed(2) ]).slice(-20);
 if (Math.random() < Math.min(.92, hitChance(d, c) * reach * (.85 + .45 * pow))) {
  knockDown(c, d, null, pow);
  G.dLevels = (G.dLevels || 0) + 1;
  const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1.2, 1.2), v = rnd(45, 65) * (.85 + .35 * pow);
  dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'hit');
  st14('ct', d.pl);
  return 'level';
 }
 d.stun = .7;
 G.dBeat = 1;
 c.beatT = 1;
 addFx('txt', d.x, d.y - 24, {
  s: 'MISSED HIM!',
  col: '#ff9a8a',
  life: .8
 });
 SFX.bad();
 return 'whiff';
}

function dPenaltyRoll(p, d, foul) {
 const G = game;
 if (G.tutorial || G.pen || G.penPending || G.ot) return false;
 const forced = G.forcePen === 'U';
 if (!forced) return false;
 G.forcePen = null;
 G.penPending = {
  side: 'U',
  who: d && d.pl,
  foul: foul
 };
 addFx('txt', d.x, d.y - 26, {
  s: 'FLAG!',
  col: '#ffe14d',
  life: 1.2
 });
 dEnd('flag', 'FLAG!', foul + ' ON ' + (d && d.pl ? lastName(d.pl) : 'YOU') + ' - YOU ARE MAN-DOWN');
 G.bannerAuto = 1.6;
 return true;
}

function dThrowClear(to) {
 const G = game, C = G.dclear;
 if (!C || !to) return;
 const b = G.ball, h = C.holder;
 b.state = 'pass';
 b.clear = true;
 b.to = to;
 b.from = h;
 b.fromX = h.x;
 h.shootT0 = menuT;
 b.x = h.x + (h.team === 'G2' ? 5 : BX);
 b.y = h.y + (h.team === 'G2' ? -16 : BY);
 b.intercept = null;
 if (!G.tutorial) for (const a of dAtk()) {
  const t = clamp(((a.x - b.x) * (to.x - b.x) + (a.y - 6 - b.y) * (to.y - b.y)) / (Math.hypot(to.x - b.x, to.y - b.y) ** 2 || 1), 0, 1);
  if (t < .2 || t > .85) continue;
  const qx = b.x + (to.x - b.x) * t, qy = b.y + (to.y - b.y) * t;
  if (Math.hypot(a.x - qx, a.y - 6 - qy) < 6 && Math.random() < .35) {
   b.intercept = {
    d: a,
    x: qx,
    y: qy
   };
   break;
  }
 }
 G.dclear = null;
 SFX.pass();
 G.clears = (G.clears || 0) + 1;
}

function startClear(holder, why) {
 const G = game, b = G.ball;
 G.dcar = null;
 G.dHold = null;
 G.run = null;
 G.dSlide = null;
 G.dRot = null;
 b.state = 'clear';
 G.dclear = {
  holder: holder,
  t: 0
 };
 b.vx = 0;
 b.vy = 0;
 G.gkOut = false;
 G.gkCreaseT = 0;
 G.gkGB25 = false;
 if (!G.tutorial) G.cc = {
  t: CLEAR_T
 };
 const outs = [ [ DGX + 40, FT + 18 ], [ DGX + 40, FB - 8 ], [ DGX + 95, FT + 22 ], [ DGX + 95, FB - 12 ], [ MIDX - 30, CY ] ];
 dDef().filter(p => p !== holder).forEach((p, i) => {
  p.clearTo = outs[i % outs.length];
 });
 addFx('cue', 0, 0, {
  s: why || 'CLEAR IT!',
  col: '#7dff7a',
  life: 1.3
 });
}

function dPassTo(c, r) {
 const G = game, b = G.ball, [sx, sy] = dStick(c), [rx, ry] = dStick(r);
 b.state = 'pass';
 b.clear = false;
 b.from = c;
 b.fromX = c.x;
 b.to = r;
 b.x = sx;
 b.y = sy;
 c.shootT0 = menuT;
 G.dcar = null;
 G.dHold = null;
 b.intercept = null;
 G.dLastCar = {
  p: c,
  t: G.t
 };
 G.dPrevCar = null;
 {
  const near = dDef().filter(d => d !== G.dctl && !(d.stun > 0) && Math.hypot(d.x - c.x, d.y - c.y) < 9);
  if (near.length && !G.tutorial && Math.random() < FOUL.aiLate) G.lateFoul = {
   t: G.t + .45,
   who: near[0],
   side: 'U',
   on: c
  };
 }
 const L = Math.hypot(rx - sx, ry - sy) || 1;
 for (const d of dDef()) {
  const t = clamp(((d.x - sx) * (rx - sx) + (d.y - 6 - sy) * (ry - sy)) / (L * L), 0, 1);
  if (t < .15 || t > .9) continue;
  const qx = sx + (rx - sx) * t, qy = sy + (ry - sy) * t, dist = Math.hypot(d.x - qx, d.y - 6 - qy);
  if (dist < 8) {
   const p = (1 - dist / 8) * .4 * clamp(L / 80, .6, 1.3) * clamp(1 - .3 * pr(c, 'stk') + .2 * pr(d, 'def'), .35, 1.8);
   if (Math.random() < p) {
    b.intercept = {
     d: d,
     x: qx,
     y: qy
    };
    break;
   }
  }
 }
 SFX.pass();
}

const OFF110 = {
 act: [ 2.2, 3.6 ],
 wOn: .36,
 wOff: .34,
 wCut: .2,
 wX: .1,
 setT: 2,
 plant: 5,
 useT: 1.4,
 rollT: 1.8,
 cutT: 1.6,
 picked: [ .5, .85 ],
 inD: 44,
 shootIn: .6,
 outOpen: .07,
 outBeat: .2,
 outReach: 1.6,
 outSpread: 1.5,
 feed: .8,
 skip: 7,
 cutBonus: 14
};

const CHK110 = {
 offLand: .22,
 offSide: .25
};

const D2403 = {
 far: 70,
 sag: 14,
 lat: 6,
 min: 4,
 hustle: 30,
 ramp: 1.5,
 hustleMax: 50,
 farMax: 60,
 slack: 4,
 drv: 72
};

const CHK2403 = {
 edge: 32
};

const OFF2403 = {
 w: [ .5, .33, .12, .05 ],
 cd: .5,
 cut2: .75,
 twoMan: .95,
 emoRot: [ 2.2, 3.2 ],
 emoHeld: 1,
 emoDive: .5,
 elHold: 2.4
};

const M30 = {
 adj: 10,
 sluff: 7,
 aSag: 19
};

function man30(G) {
 return !!G && !window.__rl_no30mand && !G.tutorial && !G.online && G.dset !== 'black' && G.dset !== 'zone' && G.dset !== 'custom';
}

function on2403(G) {
 return !!G && !window.__rl_no2403 && !window.__rl_v124gb && !G.tutorial && !G.online;
}

function gs2403(d, m, tx, ty, spd, gx, b, hmax, sagMax) {
 if (!d || !m || !b) return null;
 const SG = sagMax || D2403.sag;
 if (Math.hypot(b.x - m.x, b.y - m.y) <= D2403.far) return null;
 let ux = gx - m.x, uy = CY - m.y;
 const L = Math.hypot(ux, uy) || 1;
 ux /= L;
 uy /= L;
 const rx = tx - m.x, ry = ty - m.y;
 let pj = rx * ux + ry * uy, lt = -rx * uy + ry * ux;
 let fix = false;
 if (L < CREASE + 12) {
  const qx = (m.x - gx) / L, qy = (m.y - CY) / L, R1 = Math.max(L, CREASE + 9), sg = (b.x - m.x) * -qy + (b.y - m.y) * qx >= 0 ? 1 : -1;
  const nx = gx + qx * R1 - qy * sg * 7, ny = CY + qy * R1 + qx * sg * 7;
  if (Math.hypot(nx - tx, ny - ty) > 3) {
   tx = nx;
   ty = ny;
   fix = true;
  }
 } else if (pj < D2403.min || pj > SG || Math.abs(lt) > D2403.lat) {
  pj = clamp(pj, D2403.min + 1, Math.max(D2403.min + 1, Math.min(SG, L - 2)));
  lt = clamp(lt, -D2403.lat, D2403.lat);
  tx = m.x + ux * pj - uy * lt;
  ty = m.y + uy * pj + ux * lt;
  fix = true;
  const cx = tx - gx, cy = ty - CY, cr = Math.hypot(cx, cy);
  if (cr < CREASE + 3) {
   const k = (CREASE + 3) / (cr || 1);
   tx = gx + (cr ? cx * k : gx < MIDX ? CREASE + 3 : -CREASE - 3);
   ty = CY + (cr ? cy * k : 0);
  }
 }
 {
  const w = aroundCage2403(d, tx, ty, gx);
  if (w[0] !== tx || w[1] !== ty) {
   tx = w[0];
   ty = w[1];
   fix = true;
  }
 }
 {
  const w = pastMate2403(d, tx, ty);
  if (w) {
   tx = w[0];
   ty = w[1];
   fix = true;
  }
 }
 const off = Math.hypot(tx - d.x, ty - d.y);
 if (off > D2403.slack) {
  const h = clamp(D2403.hustle + (off - D2403.slack) * D2403.ramp, D2403.hustle, hmax || D2403.hustleMax);
  if (spd < h) {
   spd = h;
   fix = true;
  }
 }
 if (!fix) return null;
 const G = game;
 if (G) G.gs2403 = (G.gs2403 || 0) + 1;
 return [ tx, ty, spd ];
}

function slideOk2403(G, d, c, gx) {
 if (!on2403(G) || !d || !c) return true;
 const m = markOf(d);
 if (!m || rrOf(m) !== 'A') return true;
 return Math.hypot(c.x - gx, c.y - CY) <= D2403.drv || Math.hypot(m.x - c.x, m.y - c.y) <= D2403.far;
}

function aroundCage2403(p, x, y, gx) {
 if (gx === GX) return arc2403(p, x, y);
 const q = arc2403({
  x: FL - p.x,
  y: p.y
 }, FL - x, y);
 return [ FL - q[0], q[1] ];
}

function fbSkip2403(G, d, b, offT, defT, dir) {
 if (!on2403(G) || !d || !b) return false;
 const m = markOf(d);
 if (!m || rrOf(m) !== 'A' || Math.hypot(b.x - m.x, b.y - m.y) <= D2403.far) return false;
 const inEnd = p => !p.gk && !(p.down > 0) && (p.x - MIDX) * dir > -6;
 return G.players.filter(p => p.team === defT && inEnd(p)).length >= G.players.filter(p => p.team === offT && inEnd(p)).length;
}

function pastMate2403(d, x, y) {
 const G = game;
 if (!G || !G.players) return null;
 const dx = x - d.x, dy = y - d.y, L2 = dx * dx + dy * dy, L = Math.sqrt(L2);
 if (L < 4) return null;
 let bm = null, bt = 2;
 for (const m of G.players) {
  if (m === d || m.team !== d.team || m.gk) continue;
  const rx = m.x - d.x, ry = m.y - d.y, t = (rx * dx + ry * dy) / L2;
  if (t <= 0 || t >= 1.15 || Math.hypot(rx, ry) > 34) continue;
  if (Math.abs(rx * dy - ry * dx) / L < 12 && t < bt) {
   bt = t;
   bm = m;
  }
 }
 if (!bm) return null;
 const nx = -dy / L, ny = dx / L;
 let s = Math.sign((d.x - bm.x) * nx + (d.y - bm.y) * ny);
 if (!s) s = Math.sign((x - bm.x) * nx + (y - bm.y) * ny) || 1;
 const wx = bm.x + nx * s * 16, wy = clamp(bm.y + ny * s * 16, FT + 13, FB - 4);
 return Math.min(Math.hypot(wx - GX, wy - CY), Math.hypot(wx - DGX, wy - CY)) < CREASE + 5 ? null : [ wx, wy ];
}

function arc2403(p, x, y) {
 const R0 = CREASE + 9, dx = x - p.x, dy = y - p.y, L2 = dx * dx + dy * dy || 1;
 const t = clamp(((GX - p.x) * dx + (CY - p.y) * dy) / L2, 0, 1), cd = Math.hypot(p.x + dx * t - GX, p.y + dy * t - CY);
 if (cd > R0 - 3 || x < GX - 2 && Math.hypot(x - GX, y - CY) < R0 + 4) return [ x, y ];
 const ap = Math.atan2(p.y - CY, p.x - GX), at = Math.atan2(y - CY, x - GX);
 let dA = at - ap;
 while (dA > Math.PI) dA -= 2 * Math.PI;
 while (dA < -Math.PI) dA += 2 * Math.PI;
 const a = ap + Math.sign(dA || 1) * Math.min(Math.abs(dA), .8), R = R0 + 1;
 return [ GX + Math.cos(a) * R, CY + Math.sin(a) * R ];
}

const DIFF_INFO_2403 = {
 4: 'EVERYONE ~10% FASTER, D SLIDES QUICK, REAL PLAYS',
 5: '~25% FASTER, MORE HITS, REAL PLAYS - YOU ARE THE UNDERDOG'
};

function diffInfo2403(i) {
 return !window.__rl_no2403 && !window.__rl_v124gb && DIFF_INFO_2403[i] ? DIFF_INFO_2403[i] : DIFF_INFO[i];
}

function chkRule2403() {
 return !window.__rl_no2403 && !window.__rl_v124gb && !(game && game.tutorial);
}

function chkZone2403(c) {
 return c.y < FT + CHK2403.edge || c.y > FB - CHK2403.edge ? 'out' : 'mid';
}

function chkNeed2403(c, d, gx) {
 let n = chkZone2403(c) === 'mid' ? 1 : 2;
 if (typeof DF !== 'undefined' && DF.level <= 2) n++;
 if (d && side110(c, d, gx) === 'off') n++;
 return n;
}

function chkStat2403(k) {
 const S = window.__st2403 = window.__st2403 || {};
 S[k] = (S[k] || 0) + 1;
}

function off2403on(G) {
 return on110(G) && !window.__rl_no2403 && typeof DF !== 'undefined' && DF.level >= 4 && !G.practice;
}

function cnt2403(G, k, n) {
 if (!G) return;
 const S = G.s2403 = G.s2403 || {};
 S[k] = (S[k] || 0) + (n == null ? 1 : n);
}

function el2403Arm(G) {
 if (G && off2403on(G)) G.el2403 = {
  t0: G.t,
  on: true
 };
}

function on110(G) {
 return !!G && !window.__rl_v124gb && !window.__rl_no110 && !G.tutorial && !G.online;
}

function chk110(G) {
 return !!G && !window.__rl_v124gb && !window.__rl_no110 && !G.tutorial;
}

function st110(k, n) {
 const S = window.__st110 = window.__st110 || {};
 S[k] = (S[k] || 0) + (n == null ? 1 : n);
}

function side110(c, d, gx) {
 let fx = gx - c.x, fy = CY - c.y;
 const L = Math.hypot(fx, fy) || 1;
 fx /= L;
 fy /= L;
 const lx = fy, ly = -fx, rx = d.x - c.x, ry = d.y - c.y, dist = Math.hypot(rx, ry) || 1, lat = rx * lx + ry * ly;
 if (Math.abs(lat) < CHK110.offSide * dist) return 'mid';
 const right = handOf17(c) >= 0;
 return (right ? lat > 0 : lat < 0) ? 'off' : 'stick';
}

function inZone110(c, team) {
 return team === 'C' ? c.x < RL_L : c.x > RL_R;
}

function creaseSpot110(y) {
 const s = y < CY ? -1 : 1;
 return [ DGX + CREASE + 10 + rnd(0, 6), CY + s * rnd(4, 15) ];
}

function off110Tick(G, c, atk, def, dt) {
 if (!G.o110) cnt2403(G, 'poss');
 const on24 = off2403on(G);
 const O = G.o110 = G.o110 || {
  cd: rnd(.8, 1.6) * (on24 ? OFF2403.cd : 1),
  a: null
 };
 if (on24 && emo2403Tick(G, O, c, atk, def, dt)) return;
 if (on24 && el2403Tick(G, O, c, atk, def)) return;
 const A = O.a, ok = p => p && atk.includes(p) && !(p.down > 0);
 if (A) {
  A.t += dt;
  if (A.s && !ok(A.s) || A.u && !ok(A.u) || A.kind === 'on' && A.c !== c && A.ph !== 'roll') {
   O.a = null;
   O.cd = rnd(.6, 1.2);
   return;
  }
  if (A.ph === 'set') {
   const tg = A.d && G.players.includes(A.d) ? [ A.d.x + A.ox, A.d.y + A.oy ] : A.spot;
   A.spot = tg;
   if (Math.hypot(A.s.x - tg[0], A.s.y - tg[1]) < OFF110.plant) {
    A.ph = 'use';
    A.t = 0;
    A.s.pick110 = .9;
    const dd = A.d;
    let picked = false;
    if (dd && G.players.includes(dd)) {
     const p = clamp(.45 + .05 * pr(A.s, 'str') - .05 * pr(dd, 'def'), .25, .7) * (DF.cpuBeat || 1);
     if (dd !== G.dctl || !G.run) {
      if (Math.random() < p) {
       dd.react = Math.max(dd.react || 0, rnd(OFF110.picked[0], OFF110.picked[1]));
       picked = true;
      }
     } else picked = Math.hypot(dd.x - A.s.x, dd.y - A.s.y) < 8;
    }
    A.picked = picked;
    st2403x(G, A.kind === 'on' ? 'pickOn' : 'pickOff');
    if (picked) st2403x(G, 'picked');
    if (A.kind === 'on' && A.c === c) {
     const s = A.s.y < c.y ? 1 : -1;
     c.tgt = [ clamp(DGX + 36 + rnd(0, 14), DGX + 26, MIDX - 10), clamp(CY + (c.y - CY) * .3 + s * rnd(4, 12), FT + 16, FB - 8) ];
     G.dDecide = rnd(.35, .55);
     if (picked) {
      G.dBeat = .9;
      c.beatT = .9;
      addFx('txt', c.x, c.y - 26, {
       s: 'PICK!',
       col: '#ff9a8a',
       life: .7
      });
     }
    }
    if (A.kind === 'off') {
     A.u.cut110 = creaseSpot110(A.u.y);
     A.u.cutT110 = OFF110.cutT;
     O.cutter = A.u;
     O.cutUntil = G.t + OFF110.cutT + .4;
     st2403x(G, 'cut');
     G.dDecide = Math.min(G.dDecide, rnd(.15, .3));
    }
   } else if (A.t > OFF110.setT) {
    O.a = null;
    O.cd = rnd(.6, 1.2);
   }
  } else if (A.ph === 'use') {
   if (A.t > (A.kind === 'on' ? .5 : .7)) {
    A.ph = 'roll';
    A.t = 0;
    A.s.cut110 = creaseSpot110(A.s.y);
    A.s.cutT110 = OFF110.rollT;
    O.cutter = A.s;
    O.cutUntil = G.t + OFF110.rollT + .3;
    if (A.kind === 'on') {
     st2403x(G, 'roll');
     if (on24 && A.c === c) {
      O.twoMan = A.s;
      G.dDecide = Math.min(G.dDecide, rnd(.15, .3));
     }
    }
   }
  } else if (A.ph === 'roll' || A.ph === 'go') {
   if (A.t > 1.6) {
    O.a = null;
    O.cd = rnd(OFF110.act[0], OFF110.act[1]) * (on24 ? OFF2403.cd : 1);
    if (A.el && G.el2403) G.el2403 = null;
   }
  }
  return;
 }
 O.cd -= dt;
 if (O.cd > 0 || !c || c.x > RL_L + 30) return;
 const mates = atk.filter(a => a !== c && !(a.down > 0) && !a.cut110);
 if (!mates.length) return;
 const onb = def.filter(d => !(d.down > 0)).sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0];
 const markOf110 = a => def.find(d => d.mark === a && !(d.down > 0)) || def.filter(d => !(d.down > 0)).sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))[0];
 const k = wpick(on24 ? OFF2403.w : [ OFF110.wOn, OFF110.wOff, OFF110.wCut, OFF110.wX ]);
 if (k === 0 && onb && Math.hypot(onb.x - c.x, onb.y - c.y) < (on24 ? 30 : 22)) {
  const s = mates.filter(a => Math.hypot(a.x - c.x, a.y - c.y) < (on24 ? 100 : 80) && a.x > DGX + 6).sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0];
  if (s) {
   const sg = c.y > CY ? -1 : 1;
   O.a = {
    kind: 'on',
    ph: 'set',
    t: 0,
    s: s,
    c: c,
    d: onb,
    ox: -2,
    oy: sg * 5,
    spot: [ onb.x - 2, onb.y + sg * 5 ]
   };
   if (on24 && Math.random() < OFF2403.cut2) {
    const w = mates.filter(a => a !== s && a.x > DGX - 4 && (a.y - CY) * (c.y - CY) <= 0).sort(() => Math.random() - .5)[0];
    if (w) {
     w.cut110 = creaseSpot110(w.y);
     w.cutT110 = OFF110.cutT + .6;
     st2403x(G, 'cut');
     cnt2403(G, 'cut2');
    }
   }
   return;
  }
 }
 if (k <= 1 && mates.length >= 2) {
  const u = mates.filter(a => a.x > DGX + 6).sort((p, q) => Math.hypot(p.x - DGX, p.y - CY) - Math.hypot(q.x - DGX, q.y - CY))[0];
  const md = u && markOf110(u);
  const s = u && md && mates.filter(a => a !== u).sort((p, q) => Math.hypot(p.x - md.x, p.y - md.y) - Math.hypot(q.x - md.x, q.y - md.y))[0];
  if (u && md && s && Math.hypot(s.x - md.x, s.y - md.y) < 90) {
   const sg = md.y > CY ? -1 : 1;
   O.a = {
    kind: 'off',
    ph: 'set',
    t: 0,
    s: s,
    u: u,
    d: md,
    ox: -3,
    oy: sg * 5,
    spot: [ md.x - 3, md.y + sg * 5 ]
   };
   return;
  }
 }
 if (k === 2 || k === 1) {
  const u = mates.filter(a => a.x > DGX - 4).sort(() => Math.random() - .5)[0];
  if (u) {
   u.cut110 = creaseSpot110(u.y);
   u.cutT110 = OFF110.cutT;
   O.cutter = u;
   O.cutUntil = G.t + OFF110.cutT + .4;
   O.a = {
    kind: 'cut',
    ph: 'go',
    t: 0,
    u: u
   };
   st2403x(G, 'cut');
   return;
  }
 }
 const x = mates.filter(a => rrOf(a) === 'A').sort((p, q) => p.x - q.x)[0];
 if (x && x.x > DGX + 4) {
  x.cut110 = [ DGX - 22, CY + (x.y < CY ? -8 : 8) ];
  x.cutT110 = 2.2;
  O.a = {
   kind: 'x',
   ph: 'go',
   t: 0,
   u: x
  };
  st2403x(G, 'toX');
 } else O.cd = rnd(.8, 1.4);
}

function st2403x(G, k) {
 st110(k);
 cnt2403(G, k);
}

function emo2403Tick(G, O, c, atk, def, dt) {
 const A = atk.filter(a => !(a.down > 0)), D = def.filter(d => !(d.down > 0));
 if (!c || A.length <= D.length) {
  O.emo = null;
  return false;
 }
 if (O.a) return false;
 const E = O.emo = O.emo || {
  t: rnd(.5, .9)
 };
 if (!E.counted) {
  E.counted = true;
  cnt2403(G, 'emoPoss');
 }
 E.t -= dt;
 if (E.t > 0) return true;
 E.t = rnd(OFF2403.emoRot[0], OFF2403.emoRot[1]);
 const set = EMO[G.cpuEmo] || EMO['3-3 EMO'], ang = q => Math.atan2(q[1] - CY, q[0] - DGX);
 const spots = set.map(([x, y]) => [ FL - x, y ]).sort((p, q) => ang(p) - ang(q)), n = spots.length;
 const near = q => {
  let j = 0, bd = 1e9;
  spots.forEach((s, i) => {
   const dd = Math.hypot(s[0] - q[0], s[1] - q[1]);
   if (dd < bd) {
    bd = dd;
    j = i;
   }
  });
  return j;
 };
 const used = new Set([ near([ c.x, c.y ]) ]);
 const mates = A.filter(a => a !== c && a.home && !(a.cut110 && a.cutT110 > 0));
 for (const a of mates) {
  let k = (near(a.home) + 1) % n, g = 0;
  while (used.has(k) && g++ < n) k = (k + 1) % n;
  used.add(k);
  a.home = [ spots[k][0] + rnd(-3, 3), spots[k][1] + rnd(-3, 3) ];
  a.tgt = a.home.slice();
  a.wt = rnd(.7, 1.2);
 }
 cnt2403(G, 'emoRot');
 st110('emoRot');
 if (Math.random() < OFF2403.emoDive) {
  const cr = mates.slice().sort((p, q) => Math.hypot(p.x - DGX, p.y - CY) - Math.hypot(q.x - DGX, q.y - CY))[0];
  if (cr) {
   const s = c.y < CY ? -1 : 1;
   cr.cut110 = [ DGX + CREASE + 8 + rnd(0, 4), CY + s * rnd(8, 14) ];
   cr.cutT110 = 1.4;
   O.cutter = cr;
   O.cutUntil = G.t + 1.8;
   cnt2403(G, 'emoDive');
   cnt2403(G, 'cut');
   st110('emoDive');
  }
 }
 G.dDecide = Math.min(G.dDecide, rnd(.3, .5));
 return true;
}

function el2403Tick(G, O, c, atk, def) {
 const E = G.el2403;
 if (!E) return false;
 if (G.t - E.t0 > OFF2403.elHold + 2.5 || !c) {
  G.el2403 = null;
  return false;
 }
 if (!E.on) return false;
 E.on = false;
 const mates = atk.filter(a => a !== c && !(a.down > 0) && a.x > DGX - 4);
 if (mates.length < 2) {
  G.el2403 = null;
  return false;
 }
 const side = c.y < CY ? -1 : 1, top = [ DGX + 34, CY + side * 22 ];
 const u = mates.slice().sort((p, q) => Math.hypot(p.x - top[0], p.y - top[1]) - Math.hypot(q.x - top[0], q.y - top[1]))[0];
 const alive = def.filter(d => !(d.down > 0));
 const md = alive.find(d => d.mark === u) || alive.sort((p, q) => Math.hypot(p.x - u.x, p.y - u.y) - Math.hypot(q.x - u.x, q.y - u.y))[0];
 const s = md && mates.filter(a => a !== u).sort((p, q) => Math.hypot(p.x - md.x, p.y - md.y) - Math.hypot(q.x - md.x, q.y - md.y))[0];
 O.a = null;
 if (u && md && s) {
  const sg = md.y > CY ? -1 : 1;
  O.a = {
   kind: 'off',
   el: true,
   ph: 'set',
   t: 0,
   s: s,
   u: u,
   d: md,
   ox: -3,
   oy: sg * 5,
   spot: [ md.x - 3, md.y + sg * 5 ]
  };
 }
 const v = mates.filter(a => a !== u && a !== s).sort((p, q) => Math.hypot(p.x - DGX, p.y - CY) - Math.hypot(q.x - DGX, q.y - CY))[0];
 if (v) {
  v.cut110 = [ DGX + CREASE + 6 + Math.random() * 4, CY + side * (10 + Math.random() * 4) ];
  v.cutT110 = 1.6;
  O.cutter = v;
  O.cutUntil = G.t + 2;
  cnt2403(G, 'cut');
 }
 cnt2403(G, 'el');
 st110('el2403');
 addFx('txt', c.x + 6, c.y - 26, {
  s: 'END LINE SET',
  col: '#ff9a8a',
  life: .9
 });
 G.dDecide = Math.max(G.dDecide, .3);
 return true;
}

function off110Move(G, a, dt) {
 const O = G.o110, A = O && O.a;
 if (A && A.s === a && A.ph === 'set') {
  moveTo(a, A.spot[0], A.spot[1], PACE.cut * 1.25, dt);
  return true;
 }
 if (A && A.s === a && A.ph === 'use') return true;
 if (a.cut110 && a.cutT110 > 0) {
  a.cutT110 -= dt;
  const tx = a.cut110[0], ty = a.cut110[1];
  moveTo(a, tx, ty, PACE.cut * 1.3, dt);
  if (a.cutT110 <= 0) {
   a.cut110 = null;
   a.wt = rnd(.3, .8);
  }
  return true;
 }
 return false;
}

function open110(G, a, def, c) {
 let md = 99;
 for (const d of def) if (!(d.down > 0)) md = Math.min(md, Math.hypot(d.x - a.x, d.y - a.y) + (d.react > 0 ? 6 : 0));
 const [sx, sy] = dStick(c), [rx, ry] = dStick(a);
 const lane = !def.some(d => !(d.react > 0) && segDist(d.x, d.y - 6, sx, sy, rx, ry) < 6);
 return {
  md: md,
  lane: lane
 };
}

function off110Decide(G, c, atk, def, dGoal, pres, onb, ond, look, shootOK) {
 const O = G.o110 || {}, A = O.a;
 const on24 = off2403on(G), emo24 = on24 && !!O.emo;
 const inside = dGoal < OFF110.inD && c.x > DGX + 4;
 if (inside && (look && ond > 9 || G.dBeat > 0) && Math.random() < Math.min(.97, OFF110.shootIn * (DF.cpuShoot || 1))) {
  dShoot(c);
  return true;
 }
 if (G.shotClock < 4 && dGoal < 120 && c.x > DGX + 4) {
  st2403x(G, 'clockShot');
  dShoot(c);
  return true;
 }
 const cuts = atk.filter(a => a !== c && !(a.down > 0) && (a === O.cutter && G.t < (O.cutUntil || 0) || Math.hypot(a.x - DGX, a.y - CY) < OFF110.inD + 4) && a.x > DGX + 4);
 for (const a of cuts.sort((p, q) => Math.hypot(p.x - DGX, p.y - CY) - Math.hypot(q.x - DGX, q.y - CY))) {
  const o = open110(G, a, def, c);
  const tm = on24 && O.twoMan === a;
  if (o.lane && o.md > (tm ? 8 : 10) && Math.random() < (tm ? OFF2403.twoMan : OFF110.feed)) {
   dPassTo(c, a);
   G.dHeld = 0;
   st2403x(G, 'feed');
   if (tm) {
    cnt2403(G, 'twoMan');
    O.twoMan = null;
   }
   if (on24 && G.el2403) cnt2403(G, 'elFeed');
   if (on24 && emo24) cnt2403(G, 'emoFeed');
   if (c.x < DGX + 6) st2403x(G, 'xFeed');
   return true;
  }
 }
 if (on24 && G.el2403 && !G.el2403.on && G.t - G.el2403.t0 < OFF2403.elHold && pres < 2) {
  c.tgt = [ c.x + rnd(-2, 2), c.y + rnd(-2, 2) ];
  G.dDecide = .15;
  return true;
 }
 if (A && A.kind === 'on' && A.c === c && A.ph === 'set' && pres < 2) {
  c.tgt = [ c.x + rnd(-3, 3), c.y + rnd(-3, 3) ];
  G.dDecide = .2;
  return true;
 }
 if (shootOK && !inside && look) {
  const p = ond > 18 && pres === 0 ? OFF110.outOpen : G.dBeat > 0 && dGoal < 64 ? OFF110.outBeat : 0;
  if (p && Math.random() < p * (DF.cpuShoot || 1)) {
   dShoot(c);
   return true;
  }
 }
 if (SETTINGS.twoPt && (!c.go2 || G.t - c.go2 > 5) && pres <= 1 && dGoal < ARC_R && Math.random() < .08) {
  const a = clamp(Math.atan2(c.y - CY, c.x - DGX), -1, 1);
  c.tgt = [ DGX + Math.cos(a) * (ARC_R + 14), CY + Math.sin(a) * (ARC_R + 14) ];
  c.go2 = G.t;
  G.cpu2Walks = (G.cpu2Walks || 0) + 1;
  return true;
 }
 if (SETTINGS.twoPt && c.go2 && G.t - c.go2 < 5 && dGoal <= ARC_R + 2 && pres <= 1) {
  G.dDecide = .25;
  return true;
 }
 if (SETTINGS.twoPt && (look || pres <= 1) && dGoal > ARC_R + 2 && dGoal < ARC_R + 40 && c.x > DGX + 4 && Math.random() < (c.go2 && G.t - c.go2 < 5 ? .75 : .3)) {
  c.go2 = 0;
  G.cpu2Tries = (G.cpu2Tries || 0) + 1;
  dShoot(c);
  return true;
 }
 if ((pres >= 2 || pres === 1 && Math.random() < .3 || G.dHeld > (emo24 ? OFF2403.emoHeld : 2.6)) && atk.length > 1) {
  const opts = atk.filter(a => a !== c && !(a.down > 0)).map(a => {
   const o = open110(G, a, def, c);
   const skip = (a.y - CY) * (c.y - CY) < 0 && Math.abs(a.y - c.y) > 50;
   return {
    a: a,
    skip: skip,
    s: Math.min(o.md, 25) + (o.lane ? 4 : -8) - Math.hypot(a.x - DGX, a.y - CY) * .08 + (skip ? OFF110.skip * (emo24 ? 2 : 1) : 0) + (a === O.cutter ? OFF110.cutBonus : 0) + rnd(0, 6)
   };
  }).sort((u, v) => v.s - u.s);
  if (opts.length) {
   dPassTo(c, opts[0].a);
   G.dHeld = 0;
   st2403x(G, 'pass');
   if (opts[0].skip) {
    st2403x(G, 'skip');
    if (emo24) cnt2403(G, 'emoSkip');
   }
   if (emo24) cnt2403(G, 'emoPass');
   return true;
  }
 }
 if (window.V36DG ? V36DG.want(c, onb, ond) : Math.random() < .45 && onb && ond < 14) {
  const sg = c.y > CY ? -1 : 1;
  c.tgt = [ clamp(c.x - rnd(26, 40), DGX + 24, MIDX - 10), clamp(c.y + sg * rnd(18, 30), FT + 16, FB - 8) ];
  if (c.x < DGX + 10) c.tgt = [ DGX + rnd(20, 30), CY + (c.y < CY ? -1 : 1) * rnd(14, 22) ];
  const pBeat = clamp(.37 + .06 * pr(c, 'str') + .03 * pr(c, 'spd') - .06 * pr(onb, 'def'), .15, .65) * (DF.cpuBeat || 1);
  if (Math.random() < pBeat && onb !== G.dctl) {
   onb.stun = rnd(.5, .8);
   G.dBeat = .9;
   c.beatT = .9;
   addFx('txt', c.x, c.y - 26, {
    s: 'BEAT HIM!',
    col: '#ff9a8a',
    life: .8
   });
  }
  G.cpuDodges = (G.cpuDodges || 0) + 1;
  st2403x(G, 'dodgeIn');
  if (window.V28) try {
   V28.cpuDodge(c, onb);
  } catch (e) {
   console.error(e);
  }
  if (G.forceAnkle || Math.random() < ankleChance(c, onb, true) * .75) {
   G.forceAnkle = false;
   ankleBreak(onb, c);
   G.dBeat = .9;
   c.beatT = .9;
  }
  return true;
 }
 c.tgt = [ clamp(c.x - rnd(6, 24), DGX + 30, MIDX - 10), clamp(c.y + (CY - c.y) * rnd(.15, .4) + rnd(-10, 10), FT + 14, FB - 6) ];
 return true;
}

function dShoot(c) {
 const G = game, b = G.ball, gk = G.gk2;
 const [sx, sy] = dStick(c);
 b.creaseShot = inCrease(c, DGX);
 const near = Math.hypot(c.x - DGX, c.y - CY) < 44;
 const power = near ? rnd(.35, .7) : rnd(.55, 1);
 let sp = (140 + 300 * power) * (1 + .12 * pr(c, 'pow')) * .95;
 const top = Math.random() < .5, side = top ? -1 : 1;
 const ty = CY + side * rnd(MOUTH - 4, MOUTH - 1.2);
 const out110 = on110(G) && !near && !(SETTINGS.twoPt && Math.hypot(sx - DGX, sy - CY) > ARC_R);
 let ang = Math.atan2(ty - sy, DGX - sx) + gauss() * (near ? .004 : .008 + .04 * power * power) * clamp(1 - .3 * pr(c, 'acc'), .4, 1.8) * (DF.cpuSpread || 1) * (SETTINGS.twoPt && Math.hypot(sx - DGX, sy - CY) > ARC_R ? .6 : 1) * (out110 ? OFF110.outSpread : 1);
 const tm8 = tight2002(c, 'O');
 if (tm8 > 0) {
  ang += gauss() * TIGHT22.spr * tm8;
  sp *= 1 - TIGHT22.soft * tm8;
 }
 G.dTight22 = tm8;
 b.state = 'shot';
 b.x = sx;
 b.y = sy;
 b.shotFrom = [ sx, sy ];
 b.vx = Math.cos(ang) * sp;
 b.vy = Math.sin(ang) * sp;
 b.power = power;
 b.shooter = c;
 c.shootT0 = menuT;
 G.dcar = null;
 G.dHold = null;
 const tt = Math.max(0, (sx - (DGX + 5)) / Math.max(1, -b.vx));
 gk.react = GK.r0 + Math.random() * GK.r1;
 gk.dive = clamp(b.y + b.vy * tt, CY - MOUTH - 1, CY + MOUTH + 1);
 gk.reach = GK.reach * clamp(tt / GK.tset, .45, 1) * (Math.random() < .5 ? 1.15 : .85);
 if (near) {
  gk.reach *= .5 * clamp(1 - .32 * pr(c, 'fin'), .4, 1.7);
  gk.react += .06;
 } else gk.reach *= GK.v6 * DZ_GK * clamp(1 - .07 * pr(c, 'acc'), .8, 1.2);
 gk.reach *= clamp(1 + .13 * rf(gk.pl, 'sav'), .7, 1.3) * DZ_ALL * (DF.ourGk || 1);
 gk.react = Math.max(.05, gk.react - .012 * rf(gk.pl, 'sav'));
 const rip2 = SETTINGS.twoPt && Math.hypot(sx - DGX, sy - CY) > ARC_R;
 if (rip2) {
  gk.reach *= .75;
  gk.react += .1;
 }
 if (out110) {
  gk.reach *= OFF110.outReach;
  st110('shotOut');
 } else if (on110(G)) st110(near ? 'shotIn' : 'shot2');
 {
  const sm = sunMul18(G, gk, 'U');
  if (sm !== 1) {
   gk.reach *= sm;
   G.sunU18 = sm;
  }
 }
 gk.gspd = GK.spd * rnd(.8, 1.15) * .95 * (1 + .06 * rf(gk.pl, 'sav')) * (rip2 ? .68 : 1);
 if (near && Math.random() < clamp(.04 - .12 * pr(c, 'fin'), 0, .45)) {
  const fa = Math.atan2(gk.y - sy, DGX + 5 - sx);
  b.vx = Math.cos(fa) * sp;
  b.vy = Math.sin(fa) * sp;
  gk.dive = gk.y;
  gk.reach = Math.max(gk.reach, 2.5);
  gk.react = 0;
 }
 if (!window.__rl_v124gb && !window.__rl_no18shot && !G.tutorial && pole18(c)) {
  try {
   const tx = c.tx != null ? c.tx : c.x;
   poleShot18(c, b, gk, DGX, top, sp, tx < c.x - 5 && Math.hypot(c.x - DGX, c.y - CY) > 44 && Math.hypot(c.x - DGX, c.y - CY) < 140);
  } catch (e) {
   console.error(e);
  }
 }
 try {
  read18(c, top ? 'T' : 'B', b, gk, DGX, top, sp);
 } catch (e) {
  console.error(e);
 }
 G.dShot = {
  by: c.pl,
  near: near
 };
 G.dShots = (G.dShots || 0) + 1;
 st14('sa', gk && gk.pl);
 SFX.shot(power);
}

let DZ_GK = 1.2, DZ_ALL = 1.8;

function dAdjacent(bx, by, c) {
 return new Set(dAtk().filter(p => p !== c).sort((a, q) => Math.hypot(a.x - bx, a.y - by) - Math.hypot(q.x - bx, q.y - by)).slice(0, 2));
}

const DSW = {
 margin: 12,
 hold: .35,
 cd: .8,
 steer: .55
};

const DSW38 = {
 margin: 8,
 hold: .2,
 engage: 14
};

const dAutoOn = () => SET171.autoSw !== false;

function dClosest(c, def, skip) {
 let best = null, bd = 1e9;
 for (const d of def) {
  if (!d || d.team !== 'O' || d.down > 0 || d === skip) continue;
  const k = Math.hypot(d.x - c.x, d.y - c.y);
  if (k < bd) {
   bd = k;
   best = d;
  }
 }
 if (c && r26On(game) && c.x > MIDX && !(game.no26 > game.t)) for (const f of r26Riders(game)) {
  if (f === skip) continue;
  const k = Math.hypot(f.x - c.x, f.y - c.y);
  if (k < bd) {
   bd = k;
   best = f;
  }
 }
 return best;
}

const C7 = {
 cd: 1,
 behind: 3,
 hold: .12
};

function C7on(G) {
 return !window.__rl_no21 && !window.__rl_v124gb && !window.__rl_no2111 && !(G && G.tutorial);
}

function c7GoalD(q) {
 return Math.hypot(q.x - DGX, q.y - CY);
}

function dGoalSide(c, def, skip) {
 if (!c) return null;
 const cg = c7GoalD(c), cand = def.filter(d => d && d.team === 'O' && !(d.down > 0) && d !== skip);
 if (r26On(game) && c.x > MIDX && !(game.no26 > game.t)) for (const f of r26Riders(game)) if (f !== skip) cand.push(f);
 let best = null, bd = 1e9;
 for (const d of cand) {
  if (c7GoalD(d) >= cg - C7.behind) continue;
  const k = Math.hypot(d.x - c.x, d.y - c.y);
  if (k < bd) {
   bd = k;
   best = d;
  }
 }
 return best;
}

function c7Pick(c, def, skip) {
 return C7on(game) && dGoalSide(c, def, skip) || dClosest(c, def, skip);
}

function dTake(G, p, why) {
 if (p && p.far) p = r26Promote(G, p);
 if (!p || p === G.dctl || p.team !== 'O') return false;
 G.dctl = p;
 G.run = null;
 G.dSwAt = G.t;
 G.dSwT = 0;
 G.dAuto = (G.dAuto || 0) + 1;
 (G.dSwLog = G.dSwLog || []).push([ why, +G.t.toFixed(2) ]);
 if (why === 'pass') tutFlag('autoSw');
 return true;
}

function dNewCarrier(c, def) {
 const G = game;
 G.dSwT = 0;
 if (!c) return;
 if (!dAutoOn()) {
  if (G.dctl && G.dctl.down > 0) dTake(G, dClosest(c, def), 'down');
  return;
 }
 dTake(G, c7Pick(c, def), 'pass');
}

function dAutoTick(G, c, b, def, manual, dt) {
 if (!c || b.state !== 'held') {
  G.dSwT = 0;
  return;
 }
 const me = G.dctl;
 if (!me || me.down > 0) {
  dTake(G, dClosest(c, def), 'down');
  return;
 }
 if (!dAutoOn() || manual || G.dHold || G.chk && G.chk.cd > 0) {
  G.dSwT = 0;
  return;
 }
 const nd = dClosest(c, def, me);
 if (!nd) {
  G.dSwT = 0;
  return;
 }
 const dm = Math.hypot(me.x - c.x, me.y - c.y), dn = Math.hypot(nd.x - c.x, nd.y - c.y);
 if (!window.__rl_v124gb) {
  if (C7on(G)) {
   const since = G.t - (G.dSwAt != null ? G.dSwAt : -99), gs = dGoalSide(c, def, me), beaten = c7GoalD(me) > c7GoalD(c) + C7.behind;
   if (beaten) {
    G.dSwT = 0;
    if (gs && since >= C7.cd) {
     G.c7T = (G.c7T || 0) + dt;
     if (G.c7T >= C7.hold && dTake(G, gs, 'c7beat')) {
      G.c7n = (G.c7n || 0) + 1;
      G.c7T = 0;
     }
    }
    return;
   }
   G.c7T = 0;
   if (!gs) {
    G.dSwT = 0;
    return;
   }
   const dg = Math.hypot(gs.x - c.x, gs.y - c.y);
   if (dg + DSW38.margin >= dm) {
    G.dSwT = 0;
    return;
   }
   if (dm <= DSW38.engage && G.run) {
    G.dSwT = 0;
    return;
   }
   if (since < C7.cd) return;
   G.dSwT = (G.dSwT || 0) + dt;
   if (G.dSwT >= DSW38.hold) {
    if (dTake(G, gs, 'run38')) {
     G.sw38 = (G.sw38 || 0) + 1;
    }
   }
   return;
  }
  if (dn + DSW38.margin >= dm) {
   G.dSwT = 0;
   return;
  }
  if (dm <= DSW38.engage && G.run) {
   G.dSwT = 0;
   return;
  }
  if (G.t - (G.dSwAt != null ? G.dSwAt : -99) < DSW.cd) return;
  G.dSwT = (G.dSwT || 0) + dt;
  if (G.dSwT >= DSW38.hold) {
   if (dTake(G, nd, 'run38')) {
    G.sw38 = (G.sw38 || 0) + 1;
   }
  }
  return;
 }
 if (dn + DSW.margin >= dm) {
  G.dSwT = 0;
  return;
 }
 if (G.run) {
  const L = Math.hypot(G.run.x, G.run.y) || 1, dot = (G.run.x * (c.x - me.x) + G.run.y * (c.y - me.y)) / (L * (dm || 1));
  if (dot > DSW.steer && runMag() > .5) {
   G.dSwT = 0;
   return;
  }
 }
 if (G.t - (G.dSwAt != null ? G.dSwAt : -99) < DSW.cd) return;
 G.dSwT = (G.dSwT || 0) + dt;
 if (G.dSwT >= DSW.hold) dTake(G, nd, 'run');
}

const R26ON = true;

function r26On(G) {
 return R26ON && !!G && !window.__rl_no26 && !window.__rl_v124gb && screen === 'defense' && !!G.cpuClear && !G.tutorial && !G.online;
}

function r26Riders(G) {
 return (G.farU || []).filter(f => (f.role === 'A' || f.role === 'R') && !(f.down > 0) && f.x > MIDX);
}

function r26Promote(G, f) {
 const i = (G.farU || []).indexOf(f);
 if (i < 0 || !r26On(G)) return null;
 G.farU.splice(i, 1);
 const d = mkPlayer('O', 6, Math.max(f.x, MIDX + 3), f.y);
 d.pl = f.pl;
 d.anim = f.anim || 0;
 d.rr = 'A';
 d.mark = G.dcar || null;
 d.r26 = {
  role: f.role,
  rest: f.rest ? f.rest.slice() : [ MIDX + 44, f.y ]
 };
 G.players.push(d);
 G.r26n = (G.r26n || 0) + 1;
 return d;
}

function r26Demote(G, d) {
 const k = G.players.indexOf(d);
 if (k >= 0) G.players.splice(k, 1);
 const f = farMk('U', d.r26.role, Math.max(d.x, MIDX + 3), d.y, d.pl);
 f.anim = d.anim || 0;
 f.rest = d.r26.rest;
 if (d.down > 0) {
  f.down = d.down;
  f.downT0 = d.downT0;
  f.fallDir = d.fallDir;
 }
 (G.farU = G.farU || []).push(f);
 if (G.dctl === d) G.dctl = null;
 if (G.dSlide === d) G.dSlide = null;
 if (G.dHelpGb === d) G.dHelpGb = null;
 if (G.hotP === d) G.hotP = null;
 if (G.dManual && G.dManual.p === d) G.dManual = null;
 if (G.gbLock && G.gbLock.p === d) G.gbLock = null;
 return f;
}

function r26DemoteAll(G) {
 if (G && G.players) for (const d of G.players.filter(p => p.r26)) r26Demote(G, d);
}

function r26Tick(G, b, dt) {
 const rs = G.players.filter(p => p.r26);
 if (!rs.length) return;
 const on = r26On(G);
 for (const d of rs) {
  const keep = on && (d === G.dctl || b.state === 'loose' && b.x > MIDX);
  if (keep) continue;
  const had = G.dctl === d;
  r26Demote(G, d);
  if (had || !G.dctl) {
   const c = G.dcar;
   G.dctl = c ? dClosest(c, dDef()) || nearestTo('O', c.x, c.y) : nearestTo('O', b.x, b.y);
   if (G.dctl && G.dctl.far) G.dctl = nearestTo('O', b.x, b.y);
   G.run = null;
  }
 }
}

function updateDefense(dt) {
 const G = game, b = G.ball, c = G.dcar, gk = G.gk2;
 if (H7on()) for (const p of G.players) p._h7ox = p.x;
 if (readyTick(dt)) return;
 if (!G.ot && !G.tutorial) G.clock -= dt;
 if (!G.tutorial && (b.state === 'held' || b.state === 'pass' && !b.clear)) G.shotClock -= dt;
 dTrackCar();
 G.dLive += dt;
 G.dBeat = Math.max(0, G.dBeat - dt);
 G.stopFlash = Math.max(0, (G.stopFlash || 0) - dt);
 G.chk.cd = Math.max(0, G.chk.cd - dt);
 G.chk.t += dt;
 if (G.chk.t > 2.5) G.chk.n = 0;
 const atk = dAtk(), def = dDef();
 hunchTick204(G, dt);
 for (const p of G.players) {
  if (p.stun > 0) p.stun -= dt;
  if (p.down > 0) {
   p.down -= dt;
   downTick(p, dt);
  }
  if (p.beatT > 0) p.beatT -= dt;
 }
 for (const p of G.players) if (p.lunge) {
  const L = p.lunge;
  L.t -= dt;
  const dx = L.x - p.x, dy = L.y - p.y, dd = Math.hypot(dx, dy), s = Math.min(dd, 110 * dt);
  if (dd > .2) {
   p.x += dx / dd * s;
   p.y += dy / dd * s;
   p.anim += s;
  }
  if (L.t <= 0 || dd < .3) p.lunge = null;
 }
 if (G.cpuClear && b.x < MIDX - 6 && (b.state === 'held' || b.state === 'pass')) {
  G.cpuClear = false;
  G.players = G.players.filter(p => p.team !== 'G' || H7on() && Math.hypot(p.x - (GX - 5), p.y - CY) > 2 && (p.h7home = true));
  if (G.farC && !G.farC.some(f => f.role === 'G') && !G.players.some(p => p.team === 'G')) G.farC.push(farMk('C', 'G', GX - 5, CY, PP(G.lu[1].G)));
  G.ccC = null;
  G.bcC = {
   t: BOX_T
  };
  G.cpuOverSeen = true;
 }
 if (!G.cpuClear && H7on()) {
  const gq = G.players.find(p => p.team === 'G' && !p.h7home);
  if (gq) {
   G.players = G.players.filter(p => p !== gq);
   if (G.farC && !G.farC.some(f => f.role === 'G')) G.farC.push(farMk('C', 'G', GX - 5, CY, PP(G.lu[1].G)));
  }
 }
 if (!G.tutorial) {
  const hb = b.state === 'held' || b.state === 'pass' && !b.clear;
  if (G.cpuClear && G.ccC && hb) {
   G.ccC.t -= dt;
   if (G.ccC.t <= 0) return ruleCall('CLEAR COUNT', "THEY DIDN'T GET IT OVER - YOUR BALL", 'cturn');
  }
  if (!G.cpuClear && G.bcC && hb) {
   if (b.x < RL_L - 2) G.bcC = null; else {
    G.bcC.t -= dt;
    if (G.bcC.t <= 0) return ruleCall('CLEAR COUNT', "THEY DIDN'T GET IT IN THE BOX - YOUR BALL", 'cturn');
   }
  }
  if (b.state === 'clear' && G.cc) {
   G.cc.t -= dt;
   if (G.cc.t <= 0) return ruleCall('CLEAR COUNT', "DIDN'T GET IT OVER MIDFIELD IN TIME", 'uturn');
  }
  if (!G.cpuClear && G.dcar && b.state === 'held') {
   if (b.x < MIDX - 3) G.cpuOverSeen = true; else if (G.cpuOverSeen && b.x > MIDX + 1) return ruleCall('OVER AND BACK', 'THEY WENT BACK OVER - YOUR BALL', 'cturn');
  }
  if (G.dcar && b.state === 'held' && inCrease(G.dcar, DGX)) return ruleCall('CREASE', 'THEY STEPPED IN THE CREASE - YOUR BALL', 'cturn');
 }
 const manual = G.dManual && G.dManual.p === G.dctl && G.dManual.car === c && !(G.dctl.down > 0);
 if (!window.__rl_v124gb) dAutoTick(G, c, b, def, manual, dt); else if (c && b.state === 'held' && !G.dHold && !manual && !(G.run && G.dctl && !(G.dctl.down > 0))) {
  const ok = d => d && !(d.down > 0);
  let want = null;
  if (ok(G.dSlide) && Math.hypot(G.dSlide.x - c.x, G.dSlide.y - c.y) < Math.hypot((G.dctl || G.dSlide).x - c.x, (G.dctl || G.dSlide).y - c.y) + 4) want = G.dSlide; else if (G.dset === 'zone' || G.md || dCustomOn()) {
   const nd = nearestTo('O', c.x, c.y);
   want = ok(nd) && (!ok(G.dctl) || Math.hypot(nd.x - c.x, nd.y - c.y) + 6 < Math.hypot(G.dctl.x - c.x, G.dctl.y - c.y)) ? nd : null;
  } else {
   const md = def.find(d => d.mark === c);
   want = ok(md) ? md : !ok(G.dctl) ? nearestTo('O', c.x, c.y) : null;
  }
  if (want && want !== G.dctl && want.team === 'O') {
   G.dctl = want;
   G.run = null;
   G.dAuto = (G.dAuto || 0) + 1;
  }
 }
 r26Tick(G, b, dt);
 if (!G.tutorial && !G.online && !window.__rl_v124gb) try {
  ctl18(G);
 } catch (e) {
  console.error(e);
 }
 const bref = c || b.state === 'pass' && b.to || b;
 if (b.state === 'loose') liveGbTick(G, b, atk, def); else G.dHelpGb = null;
 const o110 = on110(G);
 if (o110 && c && b.state === 'held') off110Tick(G, c, atk, def, dt);
 for (const a of atk) {
  if (a.down > 0) continue;
  if (b.state === 'pass' && b.gkh2111 && b.to === a) {
   const sp = b.gkh2111.spot;
   moveTo(a, sp[0], sp[1], PACE.cut * 1.15, dt);
   continue;
  }
  if (a.coverT > 0 && a !== c && !isChaser(a)) {
   a.coverT -= dt;
   moveTo(a, a.coverX, a.y, PACE.cut * 1.15, dt);
   continue;
  }
  if (b.state === 'loose' && G.dChasers && G.dChasers.includes(a)) {
   if (a.gbReact > 0) {
    a.gbReact -= dt;
    continue;
   }
   if (H1on()) {
    moveTo(a, b.x + 2, b.y, GB.cpu, dt);
    continue;
   }
   moveTo(a, b.x + 6, b.y + 6, GB.cpu, dt);
   continue;
  }
  if (b.state === 'clear' && G.dclear && G.dclear.rider === a) {
   const h = G.dclear.holder;
   if (window.V361D && V361D.jockey(G, a, h, dt)) continue;
   moveTo(a, h.x + 6, h.y, PACE.cut * 1.05, dt);
   continue;
  }
  if (b.state === 'clear' && rideOn('C')) {
   if (!G.rideMkC || G.rideMkC.t !== G.t) G.rideMkC = {
    t: G.t,
    map: rideMarks(atk.filter(q => !(q.down > 0) && !(G.dclear && G.dclear.rider === q)), def.filter(q => !(G.dclear && G.dclear.holder === q)), b)
   };
   const mm = G.rideMkC.map.get(a);
   if (mm) {
    moveTo(a, Math.min(mm.x, MIDX - 6), mm.y, PACE.cut * 1.05, dt);
    continue;
   }
  }
  if (b.state === 'clear') {
   moveTo(a, clamp(a.home[0] + 30, DGX + 30, MIDX - 10), a.home[1], PACE.cut, dt);
   continue;
  }
  if (a === c) continue;
  if (o110 && off110Move(G, a, dt)) continue;
  a.wt -= dt;
  if (a.wt <= 0) {
   a.wt = rnd(.8, 1.6);
   const h = a.home, cands = [ [ h[0] + rnd(-14, 14), h[1] + rnd(-12, 12) ], [ h[0] - (h[0] - DGX - 30) * rnd(.3, .5), h[1] + (CY - h[1]) * rnd(.3, .5) ], [ h[0] + rnd(10, 22), h[1] + rnd(-10, 10) ] ];
   let best = cands[0], bs = -1e9;
   for (const q of cands) {
    let md = 99;
    for (const d of def) md = Math.min(md, Math.hypot(d.x - q[0], d.y - q[1]));
    const s = Math.min(md, 30) + rnd(0, 8);
    if (s > bs) {
     bs = s;
     best = q;
    }
   }
   a.tgt = best;
  }
  if (a.home[0] < DGX) moveTo(a, clamp(a.tgt[0], DGX - 28, DGX - 14), clamp(a.tgt[1], CY - 30, CY + 30), PACE.cut, dt); else {
   const tx = Math.max(a.tgt[0], DGX + CREASE + 14);
   moveTo(a, Math.min(tx, MIDX - 6), a.tgt[1], PACE.cut, dt);
  }
 }
 if (c && b.state === 'held' && !(c.down > 0)) {
  G.dDecide -= dt;
  const dGoal = Math.hypot(c.x - DGX, c.y - CY);
  let pres = 0, onb = null, ond = 1e9;
  for (const d of def) {
   const dd = Math.hypot(d.x - c.x, d.y - c.y);
   if (dd < 10) pres++;
   if (dd < ond) {
    ond = dd;
    onb = d;
   }
  }
  if (G.dDecide <= 0) {
   G.dDecide = rnd(DZ.decide0, DZ.decide1) * (DF.cpuDecide || 1);
   const look = !def.some(d => segDist(d.x, d.y - 6, c.x - 10, c.y - 9, DGX, CY) < 6);
   const shootOK = dGoal < DZ.shootD && c.x > DGX + 4;
   if (o110 && off110Decide(G, c, atk, def, dGoal, pres, onb, ond, look, shootOK)) {} else if (G.tutorial) {
    if (Math.random() < .25 && atk.length > 1) {
     const r = pick(atk.filter(a => a !== c));
     dPassTo(c, r);
    } else c.tgt = [ clamp(c.x + rnd(-14, 14), DGX + 60, MIDX - 20), clamp(c.y + rnd(-14, 14), FT + 20, FB - 12) ];
   } else if (shootOK && (look || G.dBeat > 0) && Math.random() < Math.min(.95, .6 * (DF.cpuShoot || 1))) {
    dShoot(c);
   } else if (SETTINGS.twoPt && (!c.go2 || G.t - c.go2 > 5) && pres <= 1 && dGoal < ARC_R && Math.random() < .08) {
    const a = clamp(Math.atan2(c.y - CY, c.x - DGX), -1, 1);
    c.tgt = [ DGX + Math.cos(a) * (ARC_R + 14), CY + Math.sin(a) * (ARC_R + 14) ];
    c.go2 = G.t;
    G.cpu2Walks = (G.cpu2Walks || 0) + 1;
   } else if (SETTINGS.twoPt && c.go2 && G.t - c.go2 < 5 && dGoal <= ARC_R + 2 && pres <= 1) {
    G.dDecide = .25;
   } else if (SETTINGS.twoPt && (look || pres <= 1) && dGoal > ARC_R + 2 && dGoal < ARC_R + 40 && c.x > DGX + 4 && Math.random() < (c.go2 && G.t - c.go2 < 5 ? .75 : .3)) {
    c.go2 = 0;
    G.cpu2Tries = (G.cpu2Tries || 0) + 1;
    dShoot(c);
   } else if (G.shotClock < 4 && dGoal < 120 && c.x > DGX + 4) {
    dShoot(c);
   } else if ((pres >= 2 || pres === 1 && Math.random() < .3 || G.dHeld > 2.6) && atk.length > 1) {
    const opts = atk.filter(a => a !== c && !(a.down > 0)).map(a => {
     let md = 99;
     for (const d of def) md = Math.min(md, Math.hypot(d.x - a.x, d.y - a.y));
     return {
      a: a,
      s: Math.min(md, 25) - Math.hypot(a.x - DGX, a.y - CY) * .08 + rnd(0, 6)
     };
    }).sort((u, v) => v.s - u.s);
    if (opts.length) {
     dPassTo(c, opts[0].a);
     G.dHeld = 0;
    }
   } else if (window.V36DG ? V36DG.want(c, onb, ond) : Math.random() < .45 && onb && ond < 14) {
    const dir = c.y > CY ? -1 : 1;
    c.tgt = [ c.x - rnd(26, 40), clamp(c.y + dir * rnd(20, 34), FT + 16, FB - 8) ];
    const pBeat = clamp(.37 + .06 * pr(c, 'str') + .03 * pr(c, 'spd') - .06 * pr(onb, 'def'), .15, .65) * (DF.cpuBeat || 1);
    if (Math.random() < pBeat && onb !== G.dctl) {
     onb.stun = rnd(.5, .8);
     G.dBeat = .9;
     c.beatT = .9;
     addFx('txt', c.x, c.y - 26, {
      s: 'BEAT HIM!',
      col: '#ff9a8a',
      life: .8
     });
    }
    G.cpuDodges = (G.cpuDodges || 0) + 1;
    if (window.V28) try {
     V28.cpuDodge(c, onb);
    } catch (e) {
     console.error(e);
    }
    if (!G.tutorial && (G.forceAnkle || Math.random() < ankleChance(c, onb, true) * .75)) {
     G.forceAnkle = false;
     ankleBreak(onb, c);
     G.dBeat = .9;
     c.beatT = .9;
    }
   } else {
    c.tgt = [ clamp(c.x - rnd(10, 30), DGX + 26, MIDX - 10), clamp(c.y + (CY - c.y) * rnd(.1, .4) + rnd(-12, 12), FT + 14, FB - 6) ];
   }
  }
  if (b.state === 'held' && G.dcar === c) {
   G.dHeld = (G.dHeld || 0) + dt;
   if (G.bcC && c.tgt && c.tgt[0] > RL_L - 14) c.tgt = [ RL_L - 24, c.tgt[1] ];
   const tg = c.tgt || [ c.x, c.y ];
   let tx = tg[0], ty = tg[1];
   const cx = tx - DGX, cy = ty - CY, cd = Math.hypot(cx, cy);
   if (cd < CREASE + 5) {
    tx = DGX + cx / (cd || 1) * (CREASE + 5);
    ty = CY + cy / (cd || 1) * (CREASE + 5);
   }
   moveTo(c, Math.max(tx, DGX - 26), ty, PACE.run * 1.05 + (c.beatT > 0 ? 6 : 0), dt);
  }
 }
 const dcU = def.length === atk.length && dCustomOn();
 const zoneU = G.dset === 'zone' || (on2403(G) ? def.filter(d => !d.r26).length : def.length) !== atk.length || dcU;
 const zz = zoneU ? zoneTargets(def, def.length < 5 ? G.md || 'ZONE ROTATE' : dcU ? dCustomKind() : 'zone', bref.x, bref.y, true) : null;
 if (dcU) G.dcFrames = (G.dcFrames || 0) + 1;
 G.zoneU = zoneU;
 const adj = dAdjacent(bref.x, bref.y, c);
 const drive = !!(c && (Math.hypot(c.x - DGX, c.y - CY) < 70 || G.dBeat > 0));
 const blackU = !zoneU && G.dset === 'black';
 G.hotP = !zoneU && !blackU && c && !G.dSlide && c.x < RL_L ? hotPick(def, c, adj, G.hotP, G.dctl) : null;
 if (!zoneU && !blackU && c && drive && !G.dSlide) {
  let best = slideBest(def, c, adj, G.dctl);
  if (G.hotP && def.includes(G.hotP) && G.hotP !== G.dctl) best = G.hotP;
  if (best && !slideOk2403(G, best, c, DGX)) best = null;
  if (best && Math.random() < dt * 3) {
   G.dSlide = best;
   best.react = rnd(.05, .2);
   best.slideHit = false;
   G.dSlides = (G.dSlides || 0) + 1;
   if (freeD(best)) G.dFreeSlides = (G.dFreeSlides || 0) + 1;
   tutFlag('slid', best === G.hotP ? 'hot' : 'help');
   fireCall(G.players.find(p => p.team === 'G2'));
   const left = markOf(best), rb = rotatePick(def, best, left, c, new Set, G.dctl);
   G.dRot = rb && slideOk2403(G, rb, c, DGX) ? {
    d: rb,
    m: left
   } : null;
  }
 }
 if (G.dSlide && (!c || !drive)) {
  G.dSlideCalm = (G.dSlideCalm || 0) + dt;
  if (G.dSlideCalm > 1.1 || !c) {
   G.dSlide = null;
   G.dRot = null;
   G.dSlideCalm = 0;
  }
 } else G.dSlideCalm = 0;
 const fpU = fbPlan222(G, c, b, 'D', 'O', DGX, -1, G.dctl);
 for (const d of def) {
  if (d.stun > 0 || d.down > 0) continue;
  if (d.r26 && !G.players.includes(d)) continue;
  if (d.r26 && !(d === G.dctl && G.run) && b.state !== 'loose') {
   const t = c || bref;
   moveTo(d, Math.max(MIDX + 3, t.x + 6), t.y, PACE.dBall, dt);
   continue;
  }
  if (G.rideU && G.rideU.phase === 'out' && G.rideU.cd === d && d !== G.dctl && b.state !== 'loose' && !leash26(G, d, MIDX - RIDE.cdX, CY + (b.y - CY) * .35)) {
   moveTo(d, MIDX - RIDE.cdX, CY + (b.y - CY) * .35, PACE.dBall, dt);
   G.rideCdFrames = (G.rideCdFrames || 0) + 1;
   continue;
  }
  if (d.coverT > 0 && d !== G.dctl && !isChaser(d)) {
   d.coverT -= dt;
   moveTo(d, d.coverX, d.y, PACE.cut * 1.15, dt);
   continue;
  }
  if (b.state === 'clear') {
   if (G.dclear && d !== G.dclear.holder && d.clearTo) moveTo(d, d.clearTo[0], d.clearTo[1], PACE.cut * 1.1, dt);
   continue;
  }
  if (b.state === 'loose') {
   if (d === G.dctl) {
    if (G.run) moveTo(d, d.x + G.run.x * 30, d.y + G.run.y * 30, GB.user * runMag(), dt);
    continue;
   }
   if (G.dHelpGb === d) {
    moveTo(d, b.x - 4, b.y + 4, GB.cpu, dt);
    continue;
   }
   const m = d.mark && G.players.includes(d.mark) ? d.mark : null;
   if (m) moveTo(d, m.x - 8, m.y + (CY - m.y) * .15, PACE.dOff, dt);
   continue;
  }
  if (d === G.dctl && G.run) {
   moveTo(d, d.x + G.run.x * 30, d.y + G.run.y * 30, PACE.dBall * DZ.ctrlSpd * runMag(), dt);
   if (d.x < DEND + 2 || d.x > ENDX - 6) {
    d.x = H7on() ? h7in(d.x, DEND + 2, ENDX - 6, dt) : clamp(d.x, DEND + 2, ENDX - 6);
   }
   continue;
  }
  if (d.react > 0) {
   d.react -= dt;
   continue;
  }
  {
   const fq = fpU && fpU.get(d);
   if (fq && !fbSkip2403(G, d, b, 'D', 'O', -1)) {
    moveTo(d, fq[0], fq[1], fq[2], dt);
    continue;
   }
  }
  {
   const rx = G.rideX && G.rideX.get(d);
   if (rx && d !== G.dctl && !(c && d.mark === c) && G.dSlide !== d && b.state !== 'loose') {
    moveTo(d, rx[0], rx[1], PACE.dBall, dt);
    continue;
   }
  }
  if (zoneU) {
   const k = def.indexOf(d), q = zz.pts[k] || zz.pts[zz.pts.length - 1] || [ d.x, d.y ];
   if (k === zz.onBall && c) {
    const q38 = window.V38D && V38D.zoneU(G, d, c, q);
    if (q38) moveTo(d, q38[0], q38[1], q38[2], dt); else moveTo(d, c.x + 7, c.y + (CY - c.y) * .08, PACE.dBall, dt);
   } else moveTo(d, q[0], q[1], PACE.dBall * .9, dt);
   continue;
  }
  let m = d.mark && G.players.includes(d.mark) ? d.mark : null, tight = DEF.tight, spd = PACE.dOff;
  if (G.dRot && G.dRot.d === d && G.players.includes(G.dRot.m)) m = G.dRot.m;
  if (G.dSlide === d && c) {
   m = c;
   tight = 4;
   spd = PACE.dBall * 1.08;
  }
  if (!m) {
   moveTo(d, DGX + 22, CY + (bref.y - CY) * .3, drive ? PACE.dBall : spd, dt);
   continue;
  }
  if (c && m === c) {
   tight = Math.min(tight, 5);
   spd = Math.max(spd, PACE.dBall);
  }
  if (c && m === c && G.dSlide !== d && !blackU) {
   const th = sagLive() ? threatOf(c, DGX, true, drive) : 1;
   tight += (SAG.cush - tight) * (1 - th);
   G.sagLog = G.sagLog || {};
   G.sagLog.U = +th.toFixed(2);
  }
  const dx = DGX - m.x, dy = CY - m.y, L = Math.hypot(dx, dy) || 1;
  let tx = m.x + dx / L * tight - 2, ty = m.y + dy / L * tight;
  if (b.state === 'pass' && b.to === m && !b.intercept) spd = PACE.dBall * 1.2; else if (blackU && m !== c) {
   tight = 4;
   tx = m.x + (bref.x - m.x) / (Math.hypot(bref.x - m.x, bref.y - m.y) || 1) * tight - 1;
   ty = m.y + (bref.y - m.y) / (Math.hypot(bref.x - m.x, bref.y - m.y) || 1) * tight;
   spd = PACE.dBall;
   G.blackFrames = (G.blackFrames || 0) + 1;
  } else if (m !== c && G.dSlide !== d) {
   const hx = DGX + 24, hy = CY + (m.y - CY) * .3, hl0 = Math.hypot(hx - m.x, hy - m.y) || 1;
   let off;
   if (adj.has(m)) {
    off = DEF.adjOff + (drive ? DEF.drive : 0);
    spd = PACE.dBall * 1.15;
   } else off = clamp(hl0 * DEF.holeF, DEF.hole0, DEF.hole1) + (drive ? DEF.drive : 0);
   if (man30(G)) off = adj.has(m) ? M30.adj + (drive ? DEF.drive : 0) : off + M30.sluff;
   {
    const th = sagLive() && c ? 1 - (1 - threatOf(m, DGX, false, false)) * (1 - threatOf(c, DGX, true, drive)) : 1, sg = Math.max(clamp(hl0 * DEF.holeF, DEF.hole0, DEF.hole1), SAG.hole);
    off = adj.has(m) ? off + (sg - off) * (1 - th) : off + SAG.hole * .5 * (1 - th);
   }
   off = Math.min(off, hl0);
   tx = m.x + (hx - m.x) / hl0 * off - 1;
   ty = m.y + (hy - m.y) / hl0 * off;
  }
  if (spd === PACE.dOff && Math.hypot(tx - d.x, ty - d.y) > DEF.lag) spd = PACE.dOff * DEF.recover;
  if (on2403(G) && !blackU && G.dSlide !== d && m !== c && !(b.state === 'pass' && b.to === m) && rrOf(m) === 'A') {
   const q = gs2403(d, m, tx, ty, spd, DGX, b, 0, man30(G) && !adj.has(m) ? M30.aSag : 0);
   if (q) {
    tx = q[0];
    ty = q[1];
    spd = q[2];
   }
  }
  if (clr26ok(G) && m !== c && G.dSlide !== d && rrOf(m) === 'A' && Math.hypot(tx - d.x, ty - d.y) > 20) {
   spd = Math.max(spd, PACE.chase * .85);
   G.catch26 = (G.catch26 || 0) + 1;
  }
  d.t30 = [ tx, ty ];
  moveTo(d, tx, ty, spd, dt);
  if (G.dSlide === d && c && !d.slideHit && Math.hypot(d.x - c.x, d.y - c.y) < 7) {
   d.slideHit = true;
   G.dSlideHits = (G.dSlideHits || 0) + 1;
   if (fromBehind(d, c, facingOf(c, DGX))) {
    G.uBehind = (G.uBehind || 0) + 1;
    if (!G.tutorial && Math.random() < FOUL.aiBehind) {
     knockDown(c, d);
     if (foulCall('PUSHING', 'YOUR SLIDE HIT HIM FROM BEHIND', 'U', d)) return;
    }
   } else if (hasRunUp(d, c, PACE.dBall) && Math.random() < hitChance(d, c) * .8) {
    knockDown(c, d);
    const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1, 1), v = rnd(45, 60);
    dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'hit');
    st14('ct', d.pl);
    return;
   }
  }
 }
 for (const p of G.players) {
  if (p.team === 'G' && p.h7home) {
   moveTo(p, GX - 5, CY, 30, dt);
   if (Math.hypot(p.x - (GX - 5), p.y - CY) < 1) p.h7home = false;
   continue;
  }
  if (p.team === 'G2' || p.team === 'G') continue;
  p.x = H7on() ? h7in(p.x, DEND + 2, 1e9, dt) : Math.max(p.x, DEND + 2);
  p.y = clamp(p.y, FT + 12, FB - 2);
  const mine = p === G.dctl && G.run || isChaser(p) || p.coverT > 0;
  if (p.r26 && p.x < MIDX + 3) p.x = MIDX + 3;
  if (p.x > MIDX - 4 && !G.cpuClear && !mine) p.x = Math.max(MIDX - 4, p.x - h7wall(p, dt));
  if (p.team === 'D' && rrOf(p) === 'A' && p.x > MIDX - 3 && !mine) p.x = Math.max(MIDX - 3, p.x - h7wall(p, dt));
  if (p.team === 'O' && rrOf(p) === 'D' && p.x > MIDX - 3 && !mine) p.x = Math.max(MIDX - 3, p.x - 70 * dt);
  const cx = p.x - DGX, cy = p.y - CY, cd = Math.hypot(cx, cy);
  if (cd < CREASE + 3 && !(G.dclear && G.dclear.holder === p)) h7snap(p, DGX + cx / (cd || 1) * (CREASE + 3), CY + cy / (cd || 1) * (CREASE + 3));
 }
 for (let i = 0; i < G.players.length; i++) for (let j = i + 1; j < G.players.length; j++) {
  const a = G.players[i], q = G.players[j];
  if (a.team === 'G2' || q.team === 'G2' || a.team === 'G' || q.team === 'G') continue;
  const dx = q.x - a.x, dy = q.y - a.y, d = Math.hypot(dx, dy);
  if (d < 4 && d > .01) {
   const push = (4 - d) / 2;
   a.x -= dx / d * push;
   a.y -= dy / d * push;
   q.x += dx / d * push;
   q.y += dy / d * push;
  }
 }
 if (o110 && G.o110 && G.o110.a && G.o110.a.ph === 'use' && G.o110.a.d === G.dctl && G.dctl && G.o110.a.s) {
  const s = G.o110.a.s, d = G.dctl, dx = d.x - s.x, dy = d.y - s.y, L = Math.hypot(dx, dy);
  if (L < 7 && L > .01) {
   d.x = s.x + dx / L * 7;
   d.y = s.y + dy / L * 7;
  }
 }
 rideTick('defense');
 if (b.state === 'shot') {
  if (gk.react > 0) gk.react -= dt; else moveTo(gk, DGX + 5, gk.dive, gk.gspd, dt);
 } else if (G.rideU && G.rideU.gk === gk && (G.rideU.phase === 'out' || G.rideU.phase === 'back') && !(G.dclear && G.dclear.holder === gk)) {
  const q = rideGkTarget(G.rideU, false, DGX);
  moveTo(gk, q[0], q[1], q[2], dt);
 } else if (G.rideX && G.rideX.get(gk) && !(G.dclear && G.dclear.holder === gk)) {
  const q = G.rideX.get(gk);
  moveTo(gk, q[0], q[1], RIDE.gkSpd, dt);
 } else if (rideCustom() && gk.x > DGX + 14 && b.state !== 'loose' && !(G.dclear && G.dclear.holder === gk)) moveTo(gk, DGX + 5, CY, RIDE.sprint, dt); else if (!(G.dclear && G.dclear.holder === gk) && !(b.state === 'loose' && Math.hypot(b.x - DGX, b.y - CY) < 40 && !G.tutorial)) moveTo(gk, DGX + 5, CY + clamp((b.y - CY) * .12, -GK.pos, GK.pos), 28, dt);
 if (b.state === 'held' && G.dcar) {
  [b.x, b.y] = dStick(G.dcar);
 } else if (b.state === 'pass' && b.gkh2111) sv2111Tick(G, b, dt); else if (b.state === 'pass') {
  const tgt = b.intercept ? {
   x: b.intercept.x,
   y: b.intercept.y
  } : b.clear ? {
   x: b.to.x + BX,
   y: b.to.y + BY
  } : {
   x: dStick(b.to)[0],
   y: dStick(b.to)[1]
  };
  if (b.intercept) {
   const d = b.intercept.d;
   moveTo(d, b.intercept.x + (d.team === 'O' ? -BX : 10), b.intercept.y + 9, PACE.chase, dt);
  }
  const dx = tgt.x - b.x, dy = tgt.y - b.y, d = Math.hypot(dx, dy), s = 180 * dt;
  if (d <= s) {
   if (b.intercept) {
    const who = b.intercept.d;
    if (who.team === 'O') {
     G.dInts = (G.dInts || 0) + 1;
     return toOffense(who, 'PICKED OFF!');
    }
    b.state = 'held';
    G.dcar = who;
    b.intercept = null;
    b.clear = false;
    G.chk = {
     n: 0,
     cd: 0,
     t: 0,
     who: who
    };
    G.shotClock = SHOT_CLOCK;
    addFx('txt', who.x, who.y - 26, {
     s: 'RIDE! THEIR BALL',
     col: '#ff9a8a',
     life: 1
    });
    SFX.bad();
    if (!window.__rl_v124gb) dNewCarrier(who, def);
    return;
   }
   if (b.clear) {
    SFX.catch();
    tutFlag('cleared');
    return toOffense(b.to, 'CLEARED!');
   }
   if (v13Catch(b.to, 'defense')) return;
   b.state = 'held';
   G.dcar = b.to;
   G.dSlide = null;
   G.dRot = null;
   G.dDecide = rnd(.5, .9);
   G.dHeld = 0;
   G.dBeat = 0;
   SFX.catch();
   addFx('catch', tgt.x, tgt.y);
   G.chk = {
    n: 0,
    cd: G.chk.cd,
    t: 0,
    who: b.to
   };
   if (window.__rl_v124gb) {
    const md = def.find(d => d.mark === b.to);
    if (md && !(md.stun > 0)) {
     if (G.dctl !== md) {
      G.run = null;
      tutFlag('autoSw');
     }
     G.dctl = md;
    }
   } else dNewCarrier(b.to, def);
  } else {
   b.x += dx / d * s;
   b.y += dy / d * s;
  }
 } else if (b.state === 'shot') {
  if (b.vx > -1 || b.y < FT - 20 || b.y > FB + 20) {
   b.x = Math.max(DGX + 1, Math.min(b.x, DGX + 30));
   b.vx = -220;
   b.y = b.y < CY ? CY - MOUTH - 25 : CY + MOUTH + 25;
   b.vy = 0;
  }
  const ox = b.x, oy = b.y;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  const glx = DGX + 5;
  if (ox > glx && b.x <= glx) {
   const t = (ox - glx) / (ox - b.x), cy = oy + (b.y - oy) * t;
   if (Math.abs(cy - gk.y) <= (gk.reach || GK.reach) && Math.abs(cy - CY) <= MOUTH + 2) {
    SFX.save();
    addFx('pop', glx, cy);
    G.dSaves = (G.dSaves || 0) + 1;
    st14('sv', gk && gk.pl);
    goalieSave12(gk, cy);
    if (!G.ot && G.clock <= 0) {
     G.clock = 0;
     return endQuarter();
    }
    b.x = gk.x + 5;
    b.y = gk.y - 16;
    return startClear(gk, 'SAVE! ' + lastName(gk.pl) + ' - CLEAR IT!');
   }
  }
  if (b.x <= DGX) {
   const t = (ox - DGX) / (ox - b.x || 1), cy = oy + (b.y - oy) * t;
   if (Math.abs(cy - CY) <= MOUTH - .5) {
    const who = G.dShot && G.dShot.by ? lastName(G.dShot.by) : T(G.opp).name;
    if (!G.tutorial && (b.creaseShot || atk.some(a => inCrease(a, DGX)))) {
     G.creaseNoGoal = (G.creaseNoGoal || 0) + 1;
     return ruleCall('CREASE', 'NO GOAL - THEY WERE IN THE CREASE', 'cturn', {
      x: DGX + 24,
      y: CY
     });
    }
    if (G.dShot && G.dShot.by) G.scorers.push([ 1, G.dShot.by.id ]);
    b.state = 'net';
    b.x = DGX - 1;
    b.y = cy;
    b.vx = -40;
    b.vy *= .15;
    netSnd18(0);
    if (window.V20 && V20.goal206) try {
     V20.goal206('o', b, cy);
    } catch (e) {}
    return dEnd('cgoal', 'GOAL', who + ' SCORES FOR ' + T(G.opp).name);
   }
   if (Math.abs(cy - CY) <= MOUTH + 2.5) {
    pipeBonk(DGX, cy);
    addFx('pop', DGX, cy);
    addFx('cue', 0, 0, {
     s: 'PIPE!',
     col: '#7dff7a',
     life: .9
    });
   }
   if (!G.tutorial) eventChirp('miss', .6);
   const ex = DEND, ey = clamp(b.y + b.vy / Math.max(1, -b.vx) * (b.x - ex), FT + 4, FB - 2);
   let best = null, bd = 1e9;
   for (const p of G.players) if (p.team === 'O' || p.team === 'D') {
    const dd = Math.hypot(p.x - ex, p.y - ey);
    if (dd < bd) {
     bd = dd;
     best = p;
    }
   }
   G.dMiss = (G.dMiss || 0) + 1;
   if (!G.ot && G.clock <= 0) {
    G.clock = 0;
    return endQuarter();
   }
   if (best && best.team === 'O') {
    best.x = DEND + 8;
    best.y = ey;
    b.x = best.x + BX;
    b.y = best.y + BY;
    return startClear(best, 'WIDE! YOUR BALL - CLEAR IT!');
   }
   if (best) {
    best.x = DEND + 8;
    best.y = ey;
    b.state = 'held';
    G.dcar = best;
    G.dDecide = rnd(.8, 1.2);
    G.chk = {
     n: 0,
     cd: 0,
     t: 0,
     who: best
    };
    addFx('cue', 0, 0, {
     s: 'WIDE - THEIR BALL',
     col: '#ff9a8a',
     life: 1
    });
    [b.x, b.y] = dStick(best);
    chaseReset('C');
    el2403Arm(G);
    return;
   }
  }
 } else if (b.state === 'loose') {
  if (!G.dgb) {
   G.dgb = {
    t: 0,
    kind: 'loose'
   };
   G.st18 = null;
  }
  G.dgb.t += dt;
  if (!G.tutorial && !window.__rl_v124gb) gbStall18(G, b, dt);
  if (!G.tutorial) autoCtrl('O', b, 'dctl');
  b.vz = (b.vz || 0) - 240 * dt;
  b.z = (b.z || 0) + b.vz * dt;
  if (b.z <= 0) {
   b.z = 0;
   b.vz = Math.abs(b.vz) > 25 ? -b.vz * .4 : 0;
  }
  const sp = Math.hypot(b.vx, b.vy);
  if (sp > .5) {
   const ns = Math.max(0, sp - GB.fric * dt);
   b.vx *= ns / sp;
   b.vy *= ns / sp;
  } else {
   b.vx = 0;
   b.vy = 0;
  }
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  if (G.tutorial) {
   if (b.y < FT + 4) {
    b.y = FT + 4;
    b.vy = Math.abs(b.vy) * .6;
   }
   if (b.y > FB - 2) {
    b.y = FB - 2;
    b.vy = -Math.abs(b.vy) * .6;
   }
   if (b.x < DEND + 4) {
    b.x = DEND + 4;
    b.vx = Math.abs(b.vx) * .6;
   }
   if (b.x > (G.cpuClear ? ENDX - 4 : MIDX - 6)) {
    b.x = G.cpuClear ? ENDX - 4 : MIDX - 6;
    b.vx = -Math.abs(b.vx) * .6;
   }
  } else if (b.y < FT || b.y > FB || b.x < DEND || b.x > ENDX) {
   b.x = clamp(b.x, DEND + 2, ENDX - 2);
   b.y = clamp(b.y, FT + 1, FB - 1);
   let best = null, bd = 1e9;
   for (const p of G.players) if (p.team === 'O' || p.team === 'D') {
    const dd = Math.hypot(p.x - b.x, p.y - b.y);
    if (dd < bd) {
     bd = dd;
     best = p;
    }
   }
   G.oob = (G.oob || 0) + 1;
   G.lastOob = {
    team: best && best.team,
    x: b.x,
    y: b.y
   };
   G.dgb = null;
   G.run = null;
   if (best && best.team === 'O') {
    G.ruleSpot = {
     x: b.x,
     y: b.y
    };
    G.ruleCall = {
     label: 'OUT OF BOUNDS',
     t: G.t
    };
    return ruleBanner('rturnU', 'OUT OF BOUNDS', 'YOU WERE CLOSEST - YOUR BALL');
   }
   if (best) {
    best.x = clamp(b.x, DEND + 6, ENDX - 8);
    best.y = clamp(b.y, FT + 12, FB - 2);
    b.state = 'held';
    G.dcar = best;
    G.dDecide = rnd(.8, 1.2);
    G.chk = {
     n: 0,
     cd: 0,
     t: 0,
     who: best
    };
    G.ruleGrace = 1.2;
    addFx('cue', 0, 0, {
     s: 'OUT OF BOUNDS - THEIR BALL',
     col: '#ff9a8a',
     life: 1.2
    });
    SFX.whistle();
    if (best.x < DGX + 40) el2403Arm(G);
    if (best.x > MIDX && !G.cpuClear) {
     G.cpuClear = true;
     G.ccC = {
      t: CLEAR_T
     };
     G.cpuOverSeen = false;
     G.bcC = null;
    }
    if (window.__rl_v124gb) {
     const md = def.find(d => d.mark === best);
     if (md) G.dctl = md;
    } else dNewCarrier(best, def);
    return;
   }
  }
  if (!G.tutorial) looseWatchdog(dt, 'defense');
  {
   const cx = b.x - DGX, cy = b.y - CY, cd = Math.hypot(cx, cy) || 1;
   if (cd < CREASE) {
    const nx = cx / cd, ny = cy / cd, dot = b.vx * nx + b.vy * ny;
    if (dot < 0) {
     b.vx -= 2 * dot * nx;
     b.vy -= 2 * dot * ny;
    }
    if (Math.hypot(b.vx, b.vy) < 22) {
     b.vx = nx * 26;
     b.vy = ny * 26;
    }
   }
  }
  if (!G.tutorial && Math.hypot(b.x - DGX, b.y - CY) < 40 && gk && !(gk.down > 0)) {
   moveTo(gk, b.x - 5, b.y + 2, 46, dt);
   if (b.z <= 5 && Math.hypot(gk.x + 5 - b.x, gk.y - 2 - b.y) < GB.scoop * 1.1) {
    G.gkScoops = (G.gkScoops || 0) + 1;
    b.vx = 0;
    b.vy = 0;
    b.z = 0;
    G.dgb = null;
    startClear(gk, 'GOALIE SCOOPS IT!');
    G.gkGB25 = true;
    if (Math.hypot(gk.x - DGX, gk.y - CY) > CREASE + 1) {
     G.dclear.left = true;
     G.gkOut = true;
    }
    return;
   }
  }
  if (b.z <= 4) {
   const ds = p => Math.hypot(p.x + (p.team === 'O' ? 2 : -2) - b.x, (p.y - b.y) * 1.2);
   let win = null;
   {
    const u = G.dctl;
    if (u && !window.__rl_v124gb && def.includes(u) && !(u.stun > 0) && ds(u) < GB.scoop * (1 + .08 * pr(u, 'gb'))) win = u;
   }
   if (!win) for (const p of def) if (!(p.stun > 0) && ds(p) < GB.scoop * (1 + .08 * pr(p, 'gb'))) {
    win = p;
    break;
   }
   if (!win) for (const p of atk) if (!(p.gbReact > 0) && !(p.down > 0) && !(p.dropT > G.t) && ds(p) < GB.scoop * .85 * (1 + .08 * pr(p, 'gb'))) {
    win = p;
    break;
   }
   if (!win && H1on() && !G.tutorial) {
    const f = (G.farU || []).find(q => q.chase && !(q.down > 0) && Math.hypot(q.x - b.x, q.y - b.y) < GB.scoop + 1);
    const p = f && nearestTo('O', b.x, b.y);
    if (p) {
     p.x = f.x;
     p.y = f.y;
     win = p;
     G.h1far = (G.h1far || 0) + 1;
    }
   }
   if (!win && G.dgb.t > (G.tutorial ? 8 : window.__rl_v124gb ? 5 : 3.5)) win = [ nearestTo('O', b.x, b.y), nearestTo('D', b.x, b.y) ].filter(Boolean).sort((u, v) => ds(u) - ds(v))[0];
   if (win) {
    G.lastDgb = {
     team: win.team,
     ctrl: win === G.dctl
    };
    if (win.team === 'O') {
     G.dGbWon = (G.dGbWon || 0) + 1;
     st14('gb', win.pl);
     if (window.V17) V17.say('gb', win.x, win.y - 30);
     return toOffense(win, 'SCOOPED! GO!');
    }
    b.state = 'held';
    G.dcar = win;
    G.dgb = null;
    G.dDecide = rnd(.5, .9);
    G.chk = {
     n: 0,
     cd: 0,
     t: 0,
     who: win
    };
    addFx('txt', win.x, win.y - 26, {
     s: 'THEIR BALL',
     col: '#ff9a8a',
     life: .8
    });
    if (!G.tutorial) {
     G.ruleGrace = Math.max(G.ruleGrace || 0, 1.2);
     if (win.x > MIDX && !G.cpuClear) {
      G.cpuClear = true;
      G.ccC = {
       t: CLEAR_T
      };
      G.cpuOverSeen = false;
      G.bcC = null;
     }
    }
    if (window.__rl_v124gb) {
     const md = def.find(d => d.mark === win);
     if (md) G.dctl = md;
    } else dNewCarrier(win, def);
   }
  }
 } else if (b.state === 'clear') {
  const C = G.dclear;
  C.t += dt;
  const h = C.holder;
  if (G.run && h) {
   if (h.team === 'O' && !G.tutorial) {
    const r = G.run;
    toOffense(h, 'CARRY IT UP!');
    if (screen === 'live' && game.run) game.run = r;
    return;
   }
   if (h.team === 'G2') {
    moveTo(h, h.x + G.run.x * 30, h.y + G.run.y * 30, PACE.run * (G.tutorial ? .9 : 1.1) * runMag(), dt);
    h.x = clamp(h.x, DEND + 4, MIDX - 8);
    if (Math.hypot(h.x - DGX, h.y - CY) > CREASE + 10) tutFlag('gkOut');
    if (C.left && Math.hypot(h.x - DGX, h.y - CY) > CREASE + 14 && !G.tutorial) {
     const r = G.run;
     toOffense(h, 'CAGE TO CAGE!');
     if (screen === 'live' && game.run) game.run = r;
     return;
    }
   }
  }
  if (h.team === 'G2' && !G.tutorial) {
   const dg = Math.hypot(h.x - DGX, h.y - CY);
   if (dg > CREASE + 1 && !C.left) {
    C.left = true;
    G.gkOut = true;
    G.gkLeft = (G.gkLeft || 0) + 1;
    addFx('txt', h.x, h.y - 26, {
     s: 'HE CAN\'T GO BACK IN!',
     col: '#ffe14d',
     life: 1.1
    });
   }
   if (C.left && dg < CREASE - 1 && !G.gkGB25) return ruleCall('GOALIE BACK IN CREASE', 'HE LEFT THE CREASE WITH IT - THEIR BALL', 'uturn');
   if (dg < CREASE) {
    C.crease = (C.crease || 0) + dt;
    if (C.crease > CREASE_CT) return ruleCall('CREASE COUNT', '4 SECONDS IN THE CREASE WITH IT - THEIR BALL', 'uturn');
   }
   if (C.left) {
    let rd = 1e9;
    C.rider = null;
    for (const a of atk) if (!(a.down > 0)) {
     const d = Math.hypot(a.x - h.x, a.y - h.y);
     if (d < rd) {
      rd = d;
      C.rider = a;
     }
    }
    C.outT = (C.outT || 0) + dt;
    C.chk = (C.chk || 0) - dt;
    if (C.rider && rd < 8 && C.chk <= 0 && C.outT > .8) {
     C.chk = .7;
     if (Math.random() < .12 * clamp(1 - .1 * pr(h, 'stk'), .6, 1.3)) {
      const a = Math.atan2(h.y - C.rider.y, h.x - C.rider.x) + rnd(-1, 1), v = rnd(40, 55);
      G.dclear = null;
      G.run = null;
      G.gkStripped = (G.gkStripped || 0) + 1;
      return dPopLoose(h.x + 5, h.y - 2, Math.cos(a) * v, Math.sin(a) * v, 'check');
     }
    }
   }
  }
  b.x = h.x + (h.team === 'G2' ? 5 : BX);
  b.y = h.y + (h.team === 'G2' ? -16 : BY);
  const autoT = G.cset ? h.team === 'G2' && !C.left ? Math.min(3.7, CREASE_CT - .25) : 1e9 : 3.3;
  if (C.t > autoT && !C.moved && !G.tutorial) {
   let best = null, bs = -1e9;
   for (const d of def) if (d !== h) {
    let md = 99;
    for (const a of atk) md = Math.min(md, Math.hypot(a.x - d.x, a.y - d.y));
    if (md > bs) {
     bs = md;
     best = d;
    }
   }
   dThrowClear(best);
  }
 }
 if (screen === 'defense') {
  tick193(game, dt);
  unstick193(game, dt);
  farTick(dt);
  unstack46(dt);
  try {
   onside28(true);
  } catch (e) {
   console.error(e);
  }
  aiOnside();
  try {
   onside28();
  } catch (e) {
   console.error(e);
  }
  ruleCheck(dt);
  if (screen !== 'defense') return;
 }
 if (G.shotClock <= 0 && b.state === 'held') {
  G.dShotClock = (G.dShotClock || 0) + 1;
  if (!G.tutorial) {
   G.ruleCall = {
    label: 'SHOT CLOCK',
    t: G.t
   };
   G.ruleCalls = G.ruleCalls || {};
   G.ruleCalls['SHOT CLOCK'] = (G.ruleCalls['SHOT CLOCK'] || 0) + 1;
   (G.ruleLog = G.ruleLog || []).push({
    rule: 'SHOT CLOCK',
    kind: 'cturn',
    t: +G.t.toFixed(2),
    q: G.q
   });
  }
  addFx('cue', 0, 0, {
   s: 'SHOT CLOCK! YOUR BALL',
   col: '#7dff7a',
   life: 1.2
  });
  const h = nearestTo('O', b.x, b.y);
  return startClear(h, 'SHOT CLOCK! CLEAR IT!');
 }
 if (!G.ot && G.clock <= 0 && b.state !== 'shot') {
  G.clock = 0;
  dEnd('buzzer', 'BUZZER!', 'END OF QUARTER');
  return;
 }
}

const D_TAP_R = 15;

function dTapDefender(cx, cy, k) {
 const G = game;
 if (!G || screen !== 'defense') return null;
 let best = null, bd = D_TAP_R * k;
 for (const p of G.players) {
  if (p.team !== 'O' || p === G.dctl) continue;
  const s = mateCss(p, k), d = Math.hypot(s.x - cx, s.y - cy);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 if (best && G.dcar) {
  const s = mateCss(G.dcar, k);
  if (Math.hypot(s.x - cx, s.y - cy) < bd) return null;
 }
 return best;
}

function dPickCss(cx, cy, k) {
 const G = game;
 let best = null, bd = MATE_PX;
 for (const p of G.players) {
  if (!(p.team === 'O' || p === G.dcar)) continue;
  const s = mateCss(p, k), d = Math.hypot(s.x - cx, s.y - cy);
  if (d < bd) {
   bd = d;
   best = p;
  }
 }
 return best;
}

function drawDefWorld() {
 const G = game, c = G.dcar, ctl = G.dctl, b = G.ball;
 if (c) for (let a = 0; a < 6.28; a += .25) px(sx211(c) + Math.cos(a) * 7, sy211(c) + Math.sin(a) * 3.5, 'rgba(255,90,74,.9)');
 if (ctl && b.state !== 'clear') {
  const pr2 = 8 + Math.sin(G.t * 12) * 1.5;
  for (let a = 0; a < 6.28; a += .2) px(sx211(ctl) + Math.cos(a) * pr2, sy211(ctl) + Math.sin(a) * pr2 * .5, '#2cf0ff');
  text('YOU', sx211(ctl), sy211(ctl) + 4, 1, '#2cf0ff', 'center', '#000');
  if (c) {
   const dd = Math.hypot(c.x - ctl.x, c.y - ctl.y);
   if (dd <= DZ.checkR) for (let a = 0; a < 6.28; a += .5) px(c.x + Math.cos(a) * 9, c.y - 6 + Math.sin(a) * 5, '#ffe14d');
  }
 }
 if (b.state === 'clear' && G.dclear && G.dclear.holder) {
  const h = G.dclear.holder, pr2 = 8 + Math.sin(G.t * 12) * 1.5;
  for (let a = 0; a < 6.28; a += .2) px(h.x + Math.cos(a) * pr2, h.y + Math.sin(a) * pr2 * .5, '#2cf0ff');
  text('YOU', h.x, h.y + 4, 1, '#2cf0ff', 'center', '#000');
 }
 if (b.state === 'clear') for (const p of G.players.concat(clearFarMates())) if ((p.team === 'O' || p.far) && p !== (G.dclear && G.dclear.holder)) {
  let md = 99;
  for (const a of dAtk()) md = Math.min(md, Math.hypot(a.x - p.x, a.y - p.y));
  for (let a = 0; a < 6.28; a += .35) px(p.x + Math.cos(a) * 6, p.y + Math.sin(a) * 3, md > 12 ? '#7dff7a' : 'rgba(255,255,255,.55)');
 }
 drawPlayers();
 drawBall();
 if (c && c.pl) text(lastName(c.pl), c.x, c.y - 24, 1, '#ff9a8a', 'center', '#000');
 if (c && G.chk.n > 0 && G.chk.who === c) {
  rect(c.x - 10, c.y - 35, 20, 9, 'rgba(0,0,0,.7)');
  text(G.chk.n + '/' + (chkRule2403() && G.chk.need ? G.chk.need : chkNeed181()), c.x, c.y - 33, 1, '#ffe14d', 'center');
 }
 if (G.dHold && c) {
  const p = clamp((now() - G.dHold.t0) / DZ.hitHold, 0, 1), rc2 = p >= 1 ? '#ff4a3a' : '#ffe14d', dd = ctl || c;
  ringPx(dd.x, dd.y - 6, 11, p, rc2);
  if (ctl) for (let a = 0; a < 6.28; a += .7) px(c.x + Math.cos(a) * 9, c.y - 6 + Math.sin(a) * 5, rc2);
 }
 for (const f of fx) {
  if (f.type === 'catch') circle(f.x, f.y, 2 + f.t * 14, 'rgba(255,255,255,' + Math.max(0, 1 - f.t * 3) + ')', .3);
  if (f.type === 'pop') for (let i = 0; i < 8; i++) {
   const a = i / 8 * 6.28;
   px(f.x + Math.cos(a) * f.t * 30, f.y + Math.sin(a) * f.t * 30, '#fff');
  }
  if (f.type === 'limp') {
   const k = f.t / (f.life || 3), q = {
    x: f.x + (f.tx - f.x) * k,
    y: f.y + (f.ty - f.y) * k,
    anim: f.t * 9
   };
   const kit = f.kit === 'u' ? game.uk : game.ok;
   q.y += Math.floor(f.t * 6) % 2;
   drawPlayer(q, kit, f.tx > f.x);
   text(f.nm || '', q.x, q.y - 24, 1, '#ffb14d', 'center', '#000');
   text('+', q.x + 6, q.y - 16, 1, '#ff4a3a', 'center');
  }
  if (f.type === 'txt' && f.bub) {
   const w = f.s.length * 4 + 4, by = Math.round(f.y - f.t * 3);
   rect(Math.round(f.x - w / 2), by - 2, w, 9, 'rgba(255,255,255,.92)');
   rect(Math.round(f.x) - 1, by + 7, 3, 2, 'rgba(255,255,255,.92)');
   text(f.s, f.x, by, 1, '#0b0f14', 'center');
  } else if (f.type === 'txt') text(f.s, f.x, f.y - f.t * 10, 1, f.col, 'center', '#000');
  if (f.type === 'tap') circle(f.x, f.y, 3 + f.t * 10, 'rgba(255,255,255,' + Math.max(0, .8 - f.t * 2.2).toFixed(2) + ')', .25);
 }
}

function drawDefense() {
 const G = game, o = T(G.opp);
 if (G.tutorial) return;
 const lab = o.name + ' BALL', lw = lab.length * 4 + 18;
 rect(3, 20, lw, 11, 'rgba(0,0,0,.6)');
 rect(5, 22, 7, 7, G.ok.jersey);
 rect(5, 22, 7, 1, 'rgba(255,255,255,.4)');
 text(lab, 15, 23, 1, '#ffffff');
 for (const f of fx) if (f.type === 'cue') {
  const s2 = f.t < .12 ? 3 : 2;
  const w = Math.min(W - 8, f.s.length * 4 * s2 + 8), sc = f.s.length * 4 * s2 + 8 > W - 8 ? 1 : s2;
  rect(W / 2 - (f.s.length * 4 * sc + 8) / 2, 33, f.s.length * 4 * sc + 8, 5 * sc + 4, 'rgba(0,0,0,.55)');
  text(f.s, W / 2, 35, sc, f.col, 'center', '#000');
 }
}

const TUT = [ [ 'MOVE', 'JOYSTICK: PUT YOUR LEFT THUMB DOWN + DRAG ANY WAY. LET GO TO STOP.' ], [ 'PASS', 'QUICK TAP A TEAMMATE TO PASS IT TO HIM.' ], [ 'SHOOT', 'HOLD A CORNER OF THE GOAL - THE RING FILLS - LET GO HARD.' ], [ 'GROUND BALL', 'DRAG YOUR LEFT THUMB TO RUN YOUR GUY (BLUE RING) OVER THE BALL.' ], [ 'CHASE', 'MISSED SHOT! RUN TO WHERE IT GOES OUT - CLOSEST GETS IT.' ], [ 'DEFENSE', 'LEFT THUMB = MOVE, TAP RIGHT SIDE = CHECK. 3 CHECKS KNOCK IT LOOSE.' ], [ 'BIG HIT', 'RUN AT HIM, HOLD RIGHT SIDE (RING FILLS), LET GO = BIG HIT. NO RUN-UP = JUST A SHOVE.' ], [ 'CLEAR', 'YOUR GOALIE HAS IT! TAP AN OPEN TEAMMATE (GREEN RING) TO CLEAR IT.' ], [ 'RULES', 'REAL LACROSSE RULES - THE REFS CALL THEM. TAP ANYWHERE TO GO ON.' ], [ 'DODGE', 'RUN, THEN CUT YOUR THUMB HARD ANOTHER WAY = A DODGE (ANY ANGLE).' ], [ 'PLAYMAKER', 'BUILD A PLAY: OPEN PLAYMAKER, DRAG A ROUTE, ADD A PASS, PREVIEW, SAVE.' ], [ 'PLAYBOOK', 'TAP PLAYBOOK (TOP LEFT), PICK YOUR PLAY. THEN PICK NO PLAYS.' ], [ 'DRAW PLAY', 'IN A TIMEOUT YOU CAN DRAW A PLAY. TAP ANYWHERE TO GO ON.' ], [ 'PENALTIES', 'REAL PENALTIES - THE REFS FLAG WHAT YOU DO. TAP TO GO ON.' ], [ 'SPLIT DODGE', 'WITH THE BALL: SWIPE STRAIGHT ON THE RIGHT SIDE = SPLIT DODGE THAT WAY.' ], [ 'ROLL DODGE', 'DRAW A C ON THE RIGHT SIDE = ROLL DODGE THE WAY YOU CURVE.' ], [ 'PICK', 'HOLD YOUR THUMB ON A TEAMMATE = HE COMES OVER AND SETS A PICK.' ], [ 'POLE PUSH', 'YOUR D POLE HAS IT: DRAG YOUR LEFT THUMB - HE CAN CARRY IT OVER.' ], [ 'CAGE TO CAGE', 'YOUR GOALIE HAS IT: DRAG HIM OUT - HE CAN GO CAGE TO CAGE.' ], [ 'FACEOFF', 'DRAG YOUR ATTACK + WINGS TO SET UP. THEN HOLD A WING TO PICK.' ] ];

const TUT_FO_STEP = 19;

const TUT_FO = [ 'DRAG AN ATTACKMAN + A WING (GREEN RINGS) TO NEW SPOTS. DOWN.', 'AFTER DOWN: HOLD A WING GUY (RING FILLS) = PICKED. HE GETS IT.', 'COUNTDOWN: PUT YOUR THUMB ON THE BUTTON (RIGHT SIDE).', 'SET...: MASH IT FAST. MOVE YOUR THUMB TOO SOON = VIOLATION.', 'WHISTLE / GO!: PUSH ANY WAY. PICKED A WING? IT POPS RIGHT TO HIM.', 'QUICK PUSH + MORE TAPS + BETTER FOGO = MORE WINS. 1.6 S = TOO SLOW.', 'WIN = YOUR FOGO SCOOPS IT, 6 V 6 LIVE. LOSE = THEIR BALL.' ];

const TUT_PB_STEP = 11, TUT_CARDS = [ 8, 12, 13 ];

const TUT_DRAW = [ 'TIMEOUT > DRAW PLAY OPENS PLAYMAKER RIGHT IN THE GAME.', 'SKETCH IT, HIT SAVE - IT\'S IN YOUR PLAYBOOK RIGHT AWAY', 'AND YOUR GUYS RUN IT WHEN YOU GET BACK ON OFFENSE.', 'PLAYMAKER IS ALSO ON THE HOME SCREEN.' ];

const TUT_PEN = [ 'HIT A GUY FROM BEHIND = PUSHING', 'HIT A GUY WITHOUT THE BALL = ILLEGAL BODY CHECK', 'KEEP HACKING A GUY AFTER HE GOT RID OF IT = SLASHING', 'HIT / CHECK THE GOALIE IN HIS CREASE = GOALIE INTERFERENCE', 'MOVING PICK = ILLEGAL PICK (TURNOVER). A SET PICK IS LEGAL.', 'PENALTY = 30 SEC MAN-DOWN (MAN-UP IF IT\'S THEM).', '3 PENALTIES IN ONE GAME = EJECTED - A SUB TAKES HIS SPOT.' ];

const TUT_RULES = [ 'OFFSIDES: 3 D + GOALIE STAY BACK, 3 ATTACK STAY UP.', 'MIDDIES CROSS. A D POLE OR THE GOALIE CAN TOO IF A MIDDIE STAYS BACK.', 'CREASE: NO ATTACKER IN IT - A GOAL FROM IN THERE DOESN\'T COUNT.', 'GOALIE: CAN\'T GO BACK IN THE CREASE WITH IT. 4 SEC MAX IN IT.', 'CLEARS: OVER MIDFIELD IN 10, INTO THE BOX IN 6. NO OVER AND BACK.', 'SEASON: RARE INJURIES - A HURT GUY SITS A FEW GAMES (OR THE SEASON).' ];

const TUT_D = [ [ 'STICK CHECK', 'GET ON HIM (YELLOW DOTS = IN RANGE). TAP THE RIGHT SIDE = CHECK.' ], [ 'STRIP IT', 'KEEP CHECKING HIM. 3 CHECKS THAT LAND = THE BALL POPS LOOSE.' ], [ 'BIG HIT', 'RUN AT HIM, HOLD THE RIGHT SIDE (RING FILLS), LET GO = BIG HIT.' ], [ 'AUTO SWITCH', 'THEY PASS = YOU JUMP TO THE GUY ON THE BALL. WATCH YOUR RING MOVE.' ], [ 'TAP TO SWITCH', 'TAP ANY OF YOUR DEFENDERS (EITHER SIDE) = NOW YOU CONTROL HIM.' ], [ 'SLIDE', 'HE BEAT HIS MAN! THE GUY WITH THE FLAME IS YOUR HOT SLIDER - HE SLIDES.' ] ];

const TUT_C = [ [ 'OUTLET', 'SAVE! YOUR GOALIE HAS IT. TAP AN OPEN TEAMMATE (GREEN RING) = OUTLET.' ], [ 'ANY TEAMMATE', 'ANY GUY CAN GET IT - EVEN UP TOP. OFF SCREEN? TAP HIS EDGE ARROW.' ], [ 'CARRY IT OVER', 'DRAG YOUR LEFT THUMB - RUN IT OVER MIDFIELD (THE MIDDLE LINE).' ], [ 'OFFSIDES', '3 D + GOALIE STAY BACK, 3 ATTACK STAY UP.' ], [ '10 SEC COUNT', 'BEAT THE COUNT: GET IT OVER MIDFIELD IN 10 SEC (THEN IN THE BOX IN 6).' ] ];

const TUT_S = [ [ 'SETTINGS', 'HOME SCREEN > SETTINGS (OR PAUSE > SETTINGS) - PICK YOUR LEVEL.' ] ];

const TUT_SET = [ 'SETTINGS: ON THE HOME SCREEN AND IN THE PAUSE MENU.', 'DIFFICULTY: SQUID (EASIEST) UP TO BAGGATWAAN (HARDEST).', 'HARDER = TIGHTER D, MORE CHECKS, BETTER GOALIE.', 'NASTY + BAGGATWAAN: EVERYONE MOVES FASTER.', window.__rl_no333set || window.__rl_v124gb ? 'ALSO: QUARTER LENGTH, 2 HALVES, 2-POINTERS.' : 'ALSO: QUARTER LENGTH, 2 HALVES.', 'TAP ANYWHERE TO GO ON.' ];

const TUT_V13 = [ [ 'PLAYMAKER TABS', 'PLAYMAKER HAS TABS NOW - TAP ANYWHERE TO GO ON.' ], [ '10-MAN RIDE', 'YOUR DEFAULT RIDE - TAP ANYWHERE TO GO ON.' ], [ 'CHIRP', 'TAP CHIRP (BOTTOM MIDDLE) - YOUR BENCH LETS ONE FLY.' ], [ 'TIMEOUTS', 'TIMEOUT (TOP BAR): PICK WHO STARTS, DRAW A PLAY. TAP TO GO ON.' ] ];

const TUT_PM13 = [ 'PLAYMAKER TABS: OFFENSE, MAN-UP, END LINE, CLEAR, RIDES (+ D).', 'CLEAR + RIDES DRAW ON THE FULL FIELD - DRAG ANY OF YOUR 10.', 'MAN-UP PLAYS ARE 6 ON 5. GHOST D SHOWS HOW THEY LINE UP:', 'TAP MAN / ZONE TO FLIP THE GHOSTS.', 'EVERY PLAYBOOK HAS: OPEN, 2-2-2, BLACK (D) + 10-MAN RIDE.', 'TAP ANYWHERE TO GO ON.' ];

const TUT_RIDE13 = [ '10-MAN RIDE (YOUR DEFAULT, THE CPU USES IT TOO):', 'ALL 10 RIDE MAN-TO-MAN - EVEN YOUR GOALIE.', 'BALL DEEP IN THEIR END: YOUR GOALIE COVERS AN ATTACKMAN,', 'A D STEPS UP TO MIDFIELD FOR THE EXTRA MAN.', 'BALL HITS MIDFIELD: YOUR GOALIE SPRINTS BACK TO THE CAGE.', 'TIMEOUT > RIDE TO SWITCH. TAP ANYWHERE TO GO ON.' ];

const TUT_TO13 = [ 'TIMEOUT (TOP BAR): 2 A HALF - THE CLOCK STOPS.', 'WHO STARTS: TAP A GUY - HE HAS THE BALL WHEN PLAY STARTS AGAIN.', 'DRAW PLAY: SKETCH IT IN PLAYMAKER, SAVE - YOUR GUYS RUN IT.', 'ALSO: YOUR SET (OPEN / 2-2-2), D (MAN / ZONE / BLACK), RIDE, PLAYBOOK.', 'TAP ANYWHERE TO GO ON.' ];

const TUT_V131 = [ [ 'FACEOFF: FORMATION', 'DRAG A WING OR AN ATTACKMAN (GREEN RINGS) WHERE YOU WANT HIM.' ], [ 'FACEOFF: DOWN', 'TAP DOWN (LEFT SIDE) = YOUR FOGO GETS DOWN. THEN 3-2-1.' ], [ 'FACEOFF: HOLD A WING', 'TAP DOWN, THEN HOLD A WING (RING FILLS). WIN IT = POPS TO HIM.' ], [ 'RESTRAINING LINE', 'ATTACK + D WAIT BEHIND THE LINES - TAP ANYWHERE TO GO ON.' ] ];

const TUT_LINE131 = [ 'RESTRAINING LINES (THE DOTTED LINES BY EACH CAGE):', 'ON A FACEOFF YOUR 3 ATTACK + 3 D WAIT BEHIND THEM', 'UNTIL SOMEBODY HAS THE BALL (OR IT CROSSES THE LINE).', 'WINGS + FOGO GO ON THE WHISTLE.', 'OVER EARLY = THEIR BALL. THE CPU PLAYS BY IT TOO.', 'TAP ANYWHERE TO GO ON.' ];

const TUT_V132 = [ [ 'BULL DODGE', 'HOLD YOUR RIGHT THUMB DOWN TO BULL (DRIVES THROUGH HIM).' ] ];

const TUT_V172 = [ [ 'CELLY', 'AFTER YOUR GOAL: TAP CELLY = HE CELEBRATES. TAP TO GO ON.' ], [ 'CHIRP LOADOUT', 'CHIRP SAYS THE LINE YOU PICKED FOR THAT MOMENT. TAP TO GO ON.' ], [ 'STICK BREAK', 'NO STICK = RUN HIM OFF, PICK HIS SUB. TAP TO GO ON.' ], [ 'STICK DROP', 'STICK KNOCKED OUT = RUN OVER IT TO GRAB IT. TAP TO GO ON.' ], [ 'HIT POWER', 'A SHORT RUN-UP HITS NOW - LONGER = HARDER. TAP TO GO ON.' ], [ 'GROUND BALL HIT', 'LEVEL THEIR GUY ON A GROUND BALL. TAP TO GO ON.' ], [ 'PRACTICE', 'HOME > PRACTICE: DRILLS, GHOSTS + A COACH. TAP TO GO ON.' ] ];

const tut2402 = c => window.__rl_no2402 || window.__rl_v124gb ? c : c.map(s => s === 'PICK THEM: LOCKER ROOM > CHIRP LOADOUT (ONE PER MOMENT).' ? 'PICK THEM: HOME > CHIRP LOADOUT (ONE PER MOMENT).' : s);

const TUT_CARD172 = [ [ 'CELLYS: AFTER YOUR GOAL, TAP CELLY (BOTTOM) = HE CELEBRATES.', 'EQUIP ONE PER PLAYER IN THE CELLY BOX ON HOME = AUTOMATIC.', 'THEIR TEAM CELLIES TOO - TAP SKIP TO CUT ANY CELLY.', 'TAP ANYWHERE TO GO ON.' ], [ 'CHIRP NOW SAYS THE LINE YOU PICKED FOR WHAT JUST HAPPENED.', 'PICK THEM: LOCKER ROOM > CHIRP LOADOUT (ONE PER MOMENT).', 'AUTO CHIRP ON (SAME PAGE) = YOUR BENCH YELLS IT BY ITSELF.', 'TAP ANYWHERE TO GO ON.' ], [ 'A CHECK CAN SNAP A STICK (ABOUT ONE A GAME).', 'NO STICK: RUN HIM TO THE SIDELINE, THEN TAP WHO SUBS IN.', 'TOUCH THE BALL WITH NO STICK = THEIR BALL + A FREE CLEAR.', 'A SPARE REGULAR STICK GOES ON HIM. NO SPARE = HE SITS.', 'TAP ANYWHERE TO GO ON.' ], [ 'A CHECK CAN KNOCK HIS STICK OUT - IT LIES ON THE GRASS.', 'RUN OVER IT TO PICK IT UP. NO SUB NEEDED.', 'TILL THEN STAY OUT OF THE PLAY (SAME PENALTY).', 'TAP ANYWHERE TO GO ON.' ], [ 'BIG HIT: A SHORT RUN AT HIM IS ENOUGH NOW.', 'LONGER RUN-UP = HARDER HIT: MORE KNOCK-BACK, MORE LEVELS.', 'TAP ANYWHERE TO GO ON.' ], [ 'GROUND BALL: RUN AT THEIR GUY GOING FOR IT,', 'HOLD THE RIGHT SIDE, LET GO = YOU LEVEL HIM. LEGAL, NO FLAG.', 'SAME RUN-UP RULE: LONGER RUN = HARDER HIT.', 'TAP ANYWHERE TO GO ON.' ], [ 'PRACTICE (HOME): OFFENSE OR DEFENSE, YOUR GUYS VS GRAY GHOSTS.', 'DRILLS: FREE PLAY, SHOOTING, DODGING, GROUND BALLS, RIDES.', 'TAP THE COACH ON THE SIDELINE = TIPS. NO CLOCK, EXIT ANY TIME.', 'SEASON TEAM: 60 SEC = A SESSION. 2 BETWEEN GAMES = OVR BOOST.', 'TAP ANYWHERE TO GO ON.' ] ];

const TUT_V181 = [ [ 'FACEOFF SET UP', 'DRAG YOUR WINGS + ATTACKMEN (GREEN RINGS) INTO A FORMATION.' ], [ 'CUT', 'SWIPE A TEAMMATE TO MAKE HIM CUT - HE RUNS THAT WAY.' ] ];

const TUT_V182 = [ [ 'SETS VS PLAYS', 'SETS = YOUR FORMATION (ONE ON). PLAYS RUN FROM IT. TAP TO GO ON.' ] ];

const TUT_CARD182 = [ 'PLAYBOOK HAS 2 TABS: SETS AND PLAYS.', 'SETS: PICK ONE FORMATION (1-4-1, 2-2-2...). ONLY ONE IS ON.', 'YOUR GUYS SET UP IN IT ALL GAME (SAVED).', 'PLAYS: PICK ONE, SET, RUN - IT STARTS FROM YOUR SET. MAN-UP TOO.', 'TAP ANYWHERE TO GO ON.' ];

const TUT_V20 = [ [ 'CUT + SPLIT', 'WITH THE BALL: RUN, THEN PUSH THE LEFT STICK TO HIS LEFT OR RIGHT = SPLIT THAT WAY.' ], [ 'ROLL DODGE', 'RUN, THEN DRAW A HALF CIRCLE WITH THE LEFT STICK = ROLL DODGE.' ], [ 'ONE HAND', 'SWIPE STRAIGHT ON THE RIGHT SIDE = ONE HAND. SWIPE AGAIN = TWO.' ], [ 'TOE DRAG', 'DRAW A C ON THE RIGHT SIDE = TOE DRAG TO YOUR OTHER HAND.' ], [ 'OVERHAND', 'HOLD A SQUARE ON THE CAGE, SWIPE UP AS YOU LET GO = OVERHAND.' ], [ 'UNDERHAND', 'HOLD A SQUARE, SWIPE DOWN AS YOU LET GO = UNDERHAND.' ], [ 'SIDEARM', 'HOLD A SQUARE, SWIPE SIDEWAYS AS YOU LET GO = SIDEARM.' ], [ 'CHANGING PLANES', 'UNDERHAND TO A TOP SQUARE (OR OVERHAND LOW) GOES IN MORE.' ], [ 'ONE-HANDED SHOOTERS', "MERRIMAN, GARRETT WICKLIFFE + HOWLAND SHOOT ONE-HANDED. TAP TO GO ON." ], [ 'LEGACY PLAYERS', 'VERY RARE CARDS - SUB THEM ONTO ANY TEAM. TAP TO GO ON.' ], [ 'AIR DIVE', 'OLD FOXWORTH AT X (BEHIND THE CAGE): TAP THE NET = AIR DIVE.' ] ];

const TUT_CARD20OHS = [ "ONE-HANDED SHOOTERS: ZACK MERRIMAN, GARRETT WICKLIFFE, ALVIN HOWLAND.", 'THEY KEEP ONE HAND ON A SHOT (THEIR PLAYER CARD SAYS SO).', 'ANYONE CAN CARRY ONE-HANDED - A PASS = BACK TO TWO HANDS.', 'EVERYONE ELSE GOES BACK TO TWO HANDS ON A SHOT TOO.', 'TAP ANYWHERE TO GO ON.' ];

const TUT_CARD20LEG = [ 'LEGACY PLAYERS: VERY RARE CARDS (LOCKER ROOM > PLAYERS).', 'OLD FOXWORTH = LAST LEVEL OF THE SEASON 1 GAME PASS.', 'SUB THEM ONTO ANY TEAM IN QUICK PLAY + ONLINE GAMES.', 'UNLOCKED = THEY ARE IN YOUR SEASON DRAFTS TOO.', 'TAP ONE IN THE LOCKER ROOM = WHAT HE CAN DO. TAP TO GO ON.' ];

const C8_DODGE = "SWIPE ON THE RIGHT SIDE TO DODGE - NOT NEAR THE GOAL OR YOU'LL SHOOT";

const C8B_BULL = "HOLD ON THE RIGHT SIDE TO BULL DODGE - NOT NEAR THE GOAL OR YOU'LL SHOOT";

const TUT_V28 = [ [ 'SWIM MOVE', 'WITH THE BALL: DRAW A BACKWARDS C ON THE RIGHT SIDE = SWIM PAST HIM.' ], [ 'TOE DRAG', 'WITH THE BALL: DRAW A C ON THE RIGHT SIDE = TOE DRAG PAST HIM.' ], [ 'ROLL DODGE', 'ROLL IS LEFT STICK ONLY NOW: RUN, THEN DRAW A C WITH THE LEFT STICK.' ], [ 'OVER THE SHOULDER', 'CARRY IT UP FROM X TO GLE (BESIDE THE CAGE), TOUCH THE GOAL + PULL BACK = SHOOT.' ] ];

const TUTX = TUT.concat(TUT_D, TUT_C, TUT_S, TUT_V13, TUT_V131, TUT_V132, TUT_V172, TUT_V181, TUT_V182, TUT_V20, TUT_V28);

const TUT_FO231 = [ 'DOWN: TAP DOWN (LEFT SIDE) - OR WAIT, HE GETS DOWN BY HIMSELF.', 'COUNTDOWN: PUT YOUR THUMB ON THE BUTTON (RIGHT SIDE).', 'SET...: MASH IT FAST. MOVE YOUR THUMB TOO SOON = VIOLATION.', 'THE BALL POPS OUT THE WAY YOU SWIPE.', 'NO WING PICKED = YOUR FOGO RUNS IT DOWN HIMSELF.', 'QUICK SWIPE + MORE TAPS + BETTER FOGO = MORE WINS.' ];

const TUT_FOW231 = [ 'TAP DOWN, THEN HOLD ONE OF YOUR WINGS (RING FILLS) = PICKED.', 'THUMB ON THE BUTTON (RIGHT SIDE), MASH IT ON SET...', 'AFTER THE WHISTLE: SWIPE A DIRECTION TO PULL THE BALL OUT.', 'WIN IT = IT POPS RIGHT TO THE WING YOU PICKED.' ];

if (s231on()) {
 TUT[TUT_FO_STEP][0] = 'FACEOFF: PULL IT TO YOU';
 TUT[TUT_FO_STEP][1] = 'AFTER THE WHISTLE, SWIPE A DIRECTION TO PULL IT OUT TO YOURSELF.';
 TUT_V131[2][0] = 'FACEOFF: TO A WING';
 TUT_V131[2][1] = 'HOLD A WING. AFTER THE WHISTLE, SWIPE A DIRECTION = POPS TO HIM.';
 TUT[15][1] = 'RUN, THEN DRAW A C WITH THE LEFT STICK TO ROLL AND TURN BACK.';
}

if (s231on()) TUT_CARD20LEG[0] = 'LEGACY PLAYERS: VERY RARE CARDS (LOCKER ROOM > CARDS).';

const TD0 = TUT.length, TC0 = TUT.length + TUT_D.length;

const TD = {
 CHECK: TD0,
 STRIP: TD0 + 1,
 HIT: TD0 + 2,
 AUTO: TD0 + 3,
 TAP: TD0 + 4,
 SLIDE: TD0 + 5
};

const TC = {
 OUTLET: TC0,
 ANY: TC0 + 1,
 CARRY: TC0 + 2,
 OFFSIDES: TC0 + 3,
 COUNT: TC0 + 4
};

const TS0 = TC0 + TUT_C.length, TS = {
 SET: TS0
};

const TV0 = TS0 + TUT_S.length, TV = {
 PM: TV0,
 RIDE: TV0 + 1,
 CHIRP: TV0 + 2,
 TO: TV0 + 3
}, TUT_CHIRP_STEP = TV.CHIRP;

const TV1310 = TV0 + TUT_V13.length, TV131 = {
 FORM: TV1310,
 DOWN: TV1310 + 1,
 WING: TV1310 + 2,
 LINE: TV1310 + 3
};

const TB0 = TV1310 + TUT_V131.length, TB = {
 BULL: TB0
};

const T1720 = TB0 + TUT_V132.length, T172 = TUT_V172.map((_, i) => T1720 + i);

const TF181 = T1720 + TUT_V172.length, TCUT181 = TF181 + 1;

const TSP182 = TCUT181 + 1;

const T20 = TSP182 + 1, TV20 = {
 CUT: T20,
 ROLL: T20 + 1,
 ONE: T20 + 2,
 TOE: T20 + 3,
 OVER: T20 + 4,
 UNDER: T20 + 5,
 SIDE: T20 + 6,
 CP: T20 + 7,
 OHS: T20 + 8,
 LEG: T20 + 9,
 AIR: T20 + 10
};

const T28 = T20 + TUT_V20.length, TV28 = {
 SWIM: T28,
 TOE: T28 + 1,
 ROLL: T28 + 2,
 OTS: T28 + 3
};

const TUT_MAIN_1404 = [ 0, 1, 2, 3, 4, 8, 9, 10, 11, 13, 14, 15, 16, TD0, TD0 + 2, TD0 + 3, TD0 + 4, TD0 + 5, TC0, TC0 + 2, 18, TS0, TV0 + 1, TV0 + 2, TV0 + 3, TV1310 + 3, TB0, ...T172, TUT.length - 1 ];

const TUT_MAIN_181 = [ TF181, TUT.length - 1, ...s231on() ? [ TV1310 + 2 ] : [], TV1310 + 3, 0, 1, TCUT181, 2, 3, 4, 8, 9, 14, 15, ...m28on('tut') ? [ TV28.SWIM, TV28.TOE, TV28.OTS ] : [], 16, TB0, ...window.__rl_no204t1 || window.__rl_v124gb ? [ TV20.OVER, TV20.UNDER, TV20.SIDE, TV20.CP ] : [], TV20.LEG, TV20.AIR, 10, 11, TSP182, 13, T172[0], TV0 + 2, T172[1], TD0, TD0 + 2, T172[4], T172[5], T172[2], T172[3], TD0 + 3, TD0 + 4, TD0 + 5, TC0, TC0 + 2, 18, TV0 + 1, TV0 + 3, TS0, T172[6] ];

const TUT_TRACKS = {
 main: TUT_MAIN_181,
 def: TUT_D.map((_, i) => TD0 + i),
 clear: TUT_C.map((_, i) => TC0 + i),
 cp: [ TV20.OVER, TV20.UNDER, TV20.SIDE, TV20.CP ],
 air: [ TV20.AIR ],
 m28: [ TV28.SWIM, TV28.TOE, TV28.ROLL, TV28.OTS ]
};

const TUT_TRACK_NAME = {
 main: 'TUTORIAL',
 def: 'DEFENSE TUTORIAL',
 clear: 'CLEARING TUTORIAL',
 cp: 'CHANGING PLANES TUTORIAL',
 air: 'AIR DIVE TUTORIAL',
 m28: 'NEW MOVES TUTORIAL'
};

const TUT_OFFSIDES = [ 'OFFSIDES: 3 D + GOALIE STAY BACK, 3 ATTACK STAY UP.', 'MIDDIES CROSS. A D POLE OR THE GOALIE CAN TOO IF A MIDDIE STAYS BACK.', 'TOO MANY GUYS OVER (OR BACK) = OFFSIDES.', 'TAP ANYWHERE TO GO ON.' ];

function tutList() {
 const Tt = game && game.tutorial;
 return TUT_TRACKS[Tt && Tt.track || 'main'] || TUT_TRACKS.main;
}

function tutIsCard(s) {
 return s === TV20.OHS || s === TV20.LEG || T172.includes(s) || s === TSP182 || TUT_CARDS.includes(s) || s === TC.OFFSIDES || s === TS.SET || s === TV.PM || s === TV.RIDE || s === TV.TO || s === TV131.LINE;
}

function tutAdvance() {
 const Tt = game.tutorial, L = tutList(), i = L.indexOf(Tt.step);
 if (i < 0) {
  Tt.step++;
  return;
 }
 Tt.step = i + 1 < L.length ? L[i + 1] : TUTX.length + 1;
}

function tutSkip() {
 const G = game, Tt = G && G.tutorial;
 if (!Tt || Tt.complete || Tt.doneT > 0) return;
 Tt.skips = (Tt.skips || 0) + 1;
 tutAdvance();
 shootP = null;
 stick = null;
 tutSetup();
}

function startTutorial(track) {
 const team = TEAMS.some(t => t.id === menuSel.team) ? menuSel.team : 'ATL';
 const opp = TEAMS.find(t => t.id !== team && t.lg === __x("UExM")).id;
 newGame(team, opp, 'tutorial', true);
 track = TUT_TRACKS[track] ? track : 'main';
 game.tutorial = {
  step: TUT_TRACKS[track][0],
  doneT: 0,
  f: {},
  track: track,
  t: 0
 };
 tutSetup();
}

function tutSetup() {
 const G = game, Tt = G.tutorial;
 Tt.f = {};
 Tt.doneT = 0;
 fx = fx.filter(f => f.type !== 'cue');
 const s = Tt.step;
 Tt.t = 0;
 Tt.passT = 0;
 Tt.passes = 0;
 Tt.setAt = now();
 Tt.prevStep = Tt.curStep;
 Tt.curStep = s;
 G.camHold = null;
 if (G.dset !== 'man') {
  G.dset = 'man';
 }
 if (Tt.slideTry === undefined || s !== TD.SLIDE) Tt.slideTry = 0;
 if (!tutList().includes(s)) {
  Tt.complete = true;
  const tr = Tt.track || 'main';
  if (tr === 'main') {
   LS.set('tutDone', true);
   tutGate = false;
  }
  if (window.V20) V20.tutComplete(tr);
  if (window.V28) try {
   V28.tutComplete(tr);
  } catch (e) {
   console.error(e);
  }
  G.banner = {
   txt: 'NICE WORK!',
   sub: tr === 'main' ? 'TUTORIAL COMPLETE - YOU ARE READY' : TUT_TRACK_NAME[tr] + ' COMPLETE',
   kind: 'tutdone'
  };
  G.bannerT = 0;
  G.bannerAuto = 2.4;
  screen = 'banner';
  SFX.cheer();
  return;
 }
 if (s >= TD0) return tutSetupX(s);
 if (s <= 1) setupPossession(); else if (s === 2) setupPossession(420, 80); else if (s === 3) {
  setupPossession(380, 101);
  const c = G.carrier;
  popLoose(c.x + BX + 10, c.y + 1, 38, 14, 'check');
  for (const d of G.chasers || []) d.gbReact = (d.gbReact || .5) + 1.6;
 } else if (s === 4) {
  setupPossession(440, 72);
  const b = G.ball;
  b.x = GX - 8;
  b.y = CY - 16;
  b.vx = 160;
  b.vy = -55;
  b.state = 'shot';
  startChase();
  for (const d of G.chasers || []) d.gbReact = (d.gbReact || .4) + .5;
 } else if (s === 5) {
  startDefense();
  const c = G.dcar, d = G.dctl;
  if (d && c) {
   d.x = c.x - 12;
   d.y = c.y;
  }
 } else if (s === 6) {
  startDefense();
  const c = G.dcar, d = G.players.find(p => p.team === 'O' && p.mark === c) || G.dctl;
  G.dctl = d;
  d.x = c.x - 9;
  d.y = c.y;
 } else if (s === 7) {
  startDefense();
  const gk = G.gk2, b = G.ball;
  b.x = gk.x + 5;
  b.y = gk.y - 16;
  startClear(gk, 'SAVE! CLEAR IT!');
 } else if (s === 8) {
  setupPossession();
  camX = MIDX - 60;
 } else if (s === 9 || s === 11 || s === 12 || s === 13) {
  setupPossession();
  if (s === 11) {
   G.playSel = null;
   G.playPoss = -1;
  }
 } else if (s === 10) {
  setupPossession();
 } else if (s === 14 || s === 15 || s === 16) {
  setupPossession(GX - 130, CY);
  G.run = null;
 } else if (s === 17) {
  startDefense();
  const pole = G.players.find(p => p.team === 'O' && rrOf(p) === 'D') || G.dctl, b = G.ball;
  pole.x = DGX + 50;
  pole.y = CY + 20;
  b.x = pole.x + BX;
  b.y = pole.y + BY;
  startClear(pole, 'YOUR POLE HAS IT!');
 } else if (s === 18) {
  startDefense();
  const gk = G.gk2, b = G.ball;
  b.x = gk.x + 5;
  b.y = gk.y - 16;
  startClear(gk, 'SAVE! TAKE IT CAGE TO CAGE!');
 } else if (s === TUT_FO_STEP) {
  if (Tt.prevStep === TF181 && screen === 'faceoff' && G.fo && G.fo.phase === 'form') {
   Tt.f.foAtkMv = true;
   Tt.f.foWingMv = true;
   G.fo.formIdle = 0;
  } else {
   startFaceoff(true);
   G.fo.cpuRate = 3.4;
   G.fo.cpuReact = .7;
   G.fo.readyDur = 3.6;
   if (s231on()) {
    Tt.f.foAtkMv = true;
    Tt.f.foWingMv = true;
   }
  }
 }
 G.dodges0 = G.dodges || 0;
 G.checkT = -99;
}

function tutSetupX(s) {
 const G = game, Tt = G.tutorial;
 if (window.V28 && V28.tutSetup(s)) return;
 if (window.V20 && V20.tutSetup(s)) return;
 if (s === TCUT181) {
  setupPossession();
  G.run = null;
  return;
 }
 if (s === TF181) {
  startFaceoff(true);
  G.fo.cpuRate = 3.4;
  G.fo.cpuReact = .7;
  G.fo.readyDur = 3.6;
  return;
 }
 const onBall = () => {
  const c = G.dcar, d = G.players.find(p => p.team === 'O' && p.mark === c) || G.dctl;
  G.dctl = d;
  return [ c, d ];
 };
 if (s === TD.CHECK || s === TD.STRIP) {
  startDefense();
  const [c, d] = onBall();
  if (d && c) {
   d.x = c.x - 12;
   d.y = c.y;
  }
 } else if (s === TD.HIT) {
  startDefense();
  const [c, d] = onBall();
  d.x = c.x - 9;
  d.y = c.y;
 } else if (s === TD.AUTO) {
  startDefense();
  const [c, d] = onBall();
  d.x = c.x - 12;
  d.y = c.y;
  Tt.passT = 1.4;
  Tt.ctl0 = d;
 } else if (s === TD.TAP) {
  startDefense();
  const [c, d] = onBall();
  d.x = c.x - 12;
  d.y = c.y;
  Tt.ctl0 = d;
 } else if (s === TD.SLIDE) {
  startDefense({
   x: DGX + 58,
   y: CY - 14
  });
  const [c, d] = onBall();
  d.x = c.x + 10;
  d.y = c.y - 6;
  d.stun = .8;
  const o = G.players.filter(p => p.team === 'O' && p !== d);
  o.forEach(p => {
   if (p.mark) {
    p.x = p.mark.x - 9;
    p.y = p.mark.y + (CY - p.mark.y) * .15;
   }
  });
  G.dDecide = 99;
  G.dBeat = 1.2;
  c.beatT = 1.2;
 } else if (s === TC.OUTLET || s === TC.ANY) {
  startDefense();
  const gk = G.gk2, b = G.ball;
  b.x = gk.x + 5;
  b.y = gk.y - 16;
  startClear(gk, s === TC.OUTLET ? 'SAVE! CLEAR IT!' : 'HIT ANY GUY - EVEN UP TOP');
  if (s === TC.ANY) camX = clamp(DGX - 30, 0, FL - W);
 } else if (s === TC.CARRY || s === TC.COUNT) {
  startDefense();
  const pole = G.players.find(p => p.team === 'O' && rrOf(p) === 'D') || G.dctl, b = G.ball;
  pole.x = DGX + 75;
  pole.y = CY + 24;
  if (!liveClear(pole, s === TC.COUNT ? 'BEAT THE COUNT!' : 'CARRY IT OVER!')) {
   toOffenseTutFallback(pole);
  }
  if (game.cc) game.cc.t = CLEAR_T;
  G.run = null;
 } else if (s === TC.OFFSIDES) {
  setupPossession();
  camX = MIDX - Math.round(W / 2);
  G.camHold = camX;
 } else if (s === TS.SET) {
  setupPossession();
  camX = MIDX - Math.round(W / 2);
  G.camHold = camX;
 } else if (s === TV.PM || s === TV.RIDE || s === TV.TO) {
  setupPossession();
  camX = MIDX - Math.round(W / 2);
  G.camHold = camX;
 } else if (s === TV.CHIRP) {
  setupPossession();
  G.run = null;
  G.voiceAt = -99;
  G.chirpBtnAt = -99;
 } else if (s === TV131.FORM || s === TV131.DOWN || s === TV131.WING) {
  startFaceoff(true);
  G.fo.cpuRate = 3.4;
  G.fo.cpuReact = .7;
  G.fo.readyDur = 3.6;
  Tt.wingRetry = 0;
 } else if (s === TV131.LINE) {
  setupPossession();
  camX = MIDX - Math.round(W / 2);
  G.camHold = camX;
 } else if (T172.includes(s) || s === TSP182 || s === TV20.OHS || s === TV20.LEG) {
  if (screen !== 'live') {
   setupPossession();
   camX = MIDX - Math.round(W / 2);
   G.camHold = camX;
  }
 } else if (s === TB.BULL) {
  setupPossession(GX - 130, CY);
  G.run = null;
  const c = G.carrier;
  let d = G.players.find(p => p.team === 'D' && p.mark === c);
  if (!d) {
   let bd = 1e9;
   for (const q of G.players) if (q.team === 'D') {
    const dd = Math.hypot(q.x - c.x, q.y - c.y);
    if (dd < bd) {
     bd = dd;
     d = q;
    }
   }
  }
  if (d && c) {
   d.x = c.x + 14;
   d.y = c.y;
   d.tx = d.x;
   d.ty = d.y;
   d.react = .6;
  }
 }
 G.dodges0 = G.dodges || 0;
 G.checkT = -99;
}

function toOffenseTutFallback(p) {
 setupPossession(DGX + 60, CY);
 const G = game;
 G.clearing = true;
 G.cc = {
  t: CLEAR_T
 };
 G.overSeen = false;
 G.bc = null;
}

function tutLiveClear() {
 const G = game, Tt = G && G.tutorial;
 return !!(Tt && !Tt.complete && (Tt.step === TC.CARRY || Tt.step === TC.COUNT));
}

function tutDoneX(i) {
 if (i >= T28) return !!(window.V28 && V28.tutDone(i));
 if (i >= T20 && window.V20) return V20.tutDone(i);
 const f = game.tutorial.f;
 return {
  [TD.CHECK]: f.checked,
  [TD.STRIP]: f.stripped,
  [TD.HIT]: f.hit,
  [TD.AUTO]: f.autoSw,
  [TD.TAP]: f.tapSw,
  [TD.SLIDE]: f.slid,
  [TC.OUTLET]: f.cleared,
  [TC.ANY]: f.cleared && f.anyMate,
  [TC.CARRY]: f.overMid,
  [TC.OFFSIDES]: f.card,
  [TC.COUNT]: f.overMid && f.beatCount,
  [TS.SET]: f.card,
  [TV.PM]: f.card,
  [TV.RIDE]: f.card,
  [TV.CHIRP]: f.chirped,
  [TV.TO]: f.card,
  [TV131.FORM]: f.foDrag,
  [TV131.DOWN]: f.foDown,
  [TV131.WING]: f.foPop,
  [TV131.LINE]: f.card,
  [TB.BULL]: f.bull,
  [TF181]: f.foAtkMv && f.foWingMv,
  [TCUT181]: f.cut181,
  [TSP182]: f.card
 }[i] || T172.includes(i) && f.card;
}

function tutDone(i) {
 if (i >= TD0) return !!tutDoneX(i);
 const Tt = game.tutorial, f = Tt.f;
 return [ f.stopped, f.caught, f.shotHard, f.scooped, f.chase === 'O', f.checked, f.hit, f.cleared, f.rules, f.dodged, f.pmMove && f.pmPass && f.pmPrev && f.pmSaved, f.pbPicked && f.pbNone, f.card, f.card, f.split, f.roll, f.pickCalled, f.pushed, f.gkOut, f.foWon ][i];
}

function tutTick(dt) {
 const G = game, Tt = G.tutorial;
 if (!Tt || Tt.complete) return;
 if (Tt.doneT > 0) {
  Tt.doneT -= dt;
  if (Tt.doneT <= 0) {
   tutAdvance();
   tutSetup();
  }
  return;
 }
 Tt.t = (Tt.t || 0) + dt;
 if (tutDone(Tt.step)) {
  Tt.doneT = 1.3;
  SFX.cheer();
  return;
 }
 if (screen === 'defense' && (Tt.step === TD.AUTO || Tt.step === TD.TAP || Tt.step === TD.SLIDE || Tt.step === TD.CHECK)) G.dDecide = 9;
 if (Tt.step === TD.SLIDE && !Tt.f.slid && (Tt.t > 5 || screen !== 'defense' && Tt.t > 1)) {
  Tt.slideTry = (Tt.slideTry || 0) + 1;
  if (Tt.slideTry >= 3) {
   Tt.f.slid = 'help';
   return;
  }
  const k = Tt.slideTry;
  tutSetup();
  Tt.slideTry = k;
  addFx('cue', 0, 0, {
   s: 'WATCH THE FLAME GUY SLIDE',
   col: '#ffe14d',
   life: 1.4
  });
  return;
 }
 if (Tt.step === TD.SLIDE && screen === 'defense' && G.dcar && !Tt.f.slid) {
  G.dBeat = Math.max(G.dBeat || 0, .6);
 }
 if (Tt.step === TV131.WING && screen === 'live' && !Tt.f.foPop) {
  Tt.wingRetry = (Tt.wingRetry || 0) + dt;
  if (Tt.wingRetry > 1.2) {
   addFx('cue', 0, 0, {
    s: 'WON IT - NOW HOLD A WING!',
    col: '#ffe14d',
    life: 1.4
   });
   tutSetup();
   return;
  }
 }
 if (Tt.step === TD.AUTO && screen === 'defense' && G.ball.state === 'held' && G.dcar && !Tt.f.autoSw) {
  Tt.passT -= dt;
  if (Tt.passT <= 0) {
   const c = G.dcar, r = G.players.filter(p => p.team === 'D' && p !== c && !(p.down > 0)).sort((a, b) => Math.hypot(b.x - c.x, b.y - c.y) - Math.hypot(a.x - c.x, a.y - c.y))[0];
   if (r) {
    dPassTo(c, r);
    Tt.passes++;
   }
   Tt.passT = 2.6;
  }
 }
}

function tutFlag(k, v) {
 const G = game;
 if (G && G.tutorial && !G.tutorial.complete) G.tutorial.f[k] = v === undefined ? true : v;
}

function tutHintX(Tt, y) {
 const G = game, s = Tt.step;
 const hint = {
  [TD.CHECK]: 'LAND ONE CHECK = DONE. (3 THAT LAND = THE BALL POPS LOOSE.)',
  [TD.STRIP]: 'CHECKS LANDED: ' + Math.min(3, G.chk && G.chk.n || 0) + '/3',
  [TD.HIT]: 'NO RUN-UP = JUST A SHOVE. GET MOVING FIRST.',
  [TD.AUTO]: 'JUST WATCH - THEY ARE ABOUT TO PASS IT.',
  [TD.TAP]: 'A TAP ON A GUY SWITCHES (NOT A CHECK) - ON GROUND BALLS TOO.',
  [TD.SLIDE]: 'FLAME = HOT SLIDER. HE LEAVES HIS MAN TO STOP THE DRIVE.',
  [TC.OUTLET]: 'GREEN RING = OPEN. OFF SCREEN? TAP HIS EDGE ARROW.',
  [TC.ANY]: 'TAP A GUY UP TOP, OR AN ARROW ON THE SCREEN EDGE.',
  [TC.CARRY]: 'PASSING IT UP WORKS TOO - JUST GET IT OVER.',
  [3]: 'YOU JUMP TO YOUR GUY CLOSEST TO IT - OR TAP ANY TEAMMATE TO TAKE HIM.',
  [TC.COUNT]: 'COUNT: ' + Math.max(0, Math.ceil(G.cc && G.cc.t || 0)) + ' - OVER MIDFIELD BEFORE IT HITS 0.',
  [TB.BULL]: G.lastBull && G.lastBull.res === 'stood' ? 'STOOD UP! GET A RUNNING START (LEFT THUMB) AND TRY AGAIN.' : 'STRONG GUYS OR A RUNNING START RUN THROUGH HIM. WEAK + STANDING = STOOD UP.'
 }[s];
 if (!hint) return;
 const w = textW(hint) + 8;
 rect(4, y, w, 10, 'rgba(0,0,0,.6)');
 text(hint, 8, y + 2, 1, s === TC.COUNT ? '#ffe14d' : '#8fe3f0');
}

function drawTutBtns231() {
 const G = game, B = G && G.tutorial && G.tutBtns231;
 if (!B || !s231on()) return;
 for (const b of B) {
  rect(b.x, b.y, b.w, 13, 'rgba(8,12,16,.92)');
  rect(b.x, b.y, b.w, 1, b.col);
  text(b.lab, b.x + Math.round(b.w / 2), b.y + 4, 1, b.col, 'center');
 }
 G.tutBtnFrames231 = (G.tutBtnFrames231 || 0) + 1;
}

function drawTutorial() {
 const G = game, Tt = G && G.tutorial;
 if (!Tt) return;
 if (s231on()) {
  const sy2403 = sa2403Dy(H - 14, 13), B = G.tutBtns231 = [], add = (lab, key, x, y, col, fn) => {
   y -= sy2403;
   const w = textW(lab) + 8;
   hit(key, x, y, w, 13, fn, key);
   B.push({
    lab: lab,
    x: x,
    y: y,
    w: w,
    col: col
   });
   return w;
  };
  const ew = add('EXIT', 'EXIT TUTORIAL', 2, H - 14, '#ff9a8a', () => {
   game = null;
   screen = 'menu';
  });
  if (Tt.complete) return;
  const sk = !(tutGate && (Tt.track || 'main') === 'main') && !(window.V20 && V20.noSkip(Tt.track));
  if (sk) add('SKIP >', 'SKIP STEP', 2 + ew + 3, H - 14, '#ffe14d', () => tutSkip());
  if ((Tt.track || 'main') === 'main') add('SKIP TUTORIAL', 'SKIP TUTORIAL', 2, H - 28, '#ffe14d', () => {
   tutAsk = true;
  });
 } else {
  G.tutBtns231 = null;
  const sy2403 = sa2403Dy(H - 13, 12);
  hit('EXIT TUTORIAL', 3, H - 13 - sy2403, 40, 12, () => {
   game = null;
   screen = 'menu';
  }, 'EXIT TUTORIAL');
  rect(3, H - 12 - sy2403, 40, 11, 'rgba(0,0,0,.6)');
  text('EXIT', 23, H - 9 - sy2403, 1, '#ff9a8a', 'center');
  if (Tt.complete) return;
  const skipStep = !(tutGate && (Tt.track || 'main') === 'main') && !(window.V20 && V20.noSkip(Tt.track));
  if (skipStep) {
   hit('SKIP STEP', 46, H - 13 - sy2403, 44, 12, () => tutSkip(), 'SKIP STEP');
   rect(46, H - 12 - sy2403, 44, 11, 'rgba(0,0,0,.6)');
   text('SKIP >', 68, H - 9 - sy2403, 1, '#ffe14d', 'center');
  }
  if ((Tt.track || 'main') === 'main') {
   const sx = skipStep ? 93 : 46;
   hit('SKIP TUTORIAL', sx, H - 13 - sy2403, 64, 12, () => {
    tutAsk = true;
   }, 'SKIP TUTORIAL');
   rect(sx, H - 12 - sy2403, 64, 11, 'rgba(0,0,0,.6)');
   text('SKIP TUTORIAL', sx + 32, H - 9 - sy2403, 1, '#ffe14d', 'center');
  }
 }
 const L = tutList(), pos = Math.max(0, L.indexOf(Tt.step)), n = L.length;
 const st = TUTX[Math.min(Tt.step, TUTX.length - 1)], foS = Tt.step === TUT_FO_STEP && screen === 'faceoff', foT = screen === 'faceoff' && (foS || Tt.step === TF181 || Tt.step === TV131.FORM || Tt.step === TV131.DOWN || Tt.step === TV131.WING), y = foT ? 86 : 19, bw0 = foT ? Math.round(W * .7) : W - 8;
 const hd18 = (Tt.track && Tt.track !== 'main' ? {
  def: 'D ',
  clear: 'CLEAR ',
  cp: 'PLANES ',
  air: ''
 }[Tt.track] || '' : '') + (pos + 1) + '/' + n + ' ' + st[0];
 if (foT && (tutFoHold18() || (window.__rl_tutread18 || !navigator.webdriver))) {
  if (tutFoHold18()) {
   const lines = [ st[1] ].concat(foS ? s231on() ? TUT_FO231 : TUT_FO : s231on() && Tt.step === TV131.WING ? TUT_FOW231 : []), bw = Math.min(W - 8, Math.max(textW(hd18), ...lines.map(l => textW(l))) + 16), bx = Math.round(W / 2 - bw / 2), bh = 30 + lines.length * 9, by = (b0 => s231on() && b0 < FT + 12 && FT + 12 + bh <= FB - 11 ? FT + 12 : b0)(Math.max(22, Math.round(H / 2 - bh / 2) - 8));
   rect(bx, by, bw, bh, 'rgba(0,0,0,.86)');
   rect(bx, by, bw, 1, (Tt.track || 'main') === 'main' ? '#2cc4dc' : '#ff9a4a');
   text(hd18, W / 2, by + 4, 1, '#ffe14d', 'center');
   lines.forEach((l, i) => text(l, W / 2, by + 14 + i * 9, 1, i % 2 ? '#ffe14d' : '#ffffff', 'center'));
   text('GOT IT? TAP ANYWHERE - THEN THE FACEOFF STARTS', W / 2, by + bh - 10, 1, Math.floor(menuT * 3) % 2 ? '#7dff7a' : '#3fa63c', 'center');
  } else {
   const tw = textW(hd18) + 8;
   rect(4, 19, tw, 10, 'rgba(0,0,0,.7)');
   rect(4, 19, tw, 1, '#2cc4dc');
   text(hd18, 8, 21, 1, '#ffe14d');
  }
 } else {
  const x2111 = st === TUT[9] && !window.__rl_no2111 && !window.__rl_v124gb ? C8_DODGE : st === TUT_V132[0] && !window.__rl_no22 && !window.__rl_v124gb ? C8B_BULL : null;
  rect(4, y, bw0, x2111 ? 27 : 19, 'rgba(0,0,0,.7)');
  rect(4, y, bw0, 1, (Tt.track || 'main') === 'main' ? '#2cc4dc' : '#ff9a4a');
  text(hd18, 8, y + 3, 1, '#ffe14d');
  text(st[1], 8, y + 11, 1, '#ffffff');
  if (x2111) text(x2111, 8, y + 19, 1, '#7dff7a');
 }
 if (foS && Tt.doneT <= 0 && !(window.__rl_tutread18 || !navigator.webdriver)) {
  rect(4, y + 21, bw0, 6 + TUT_FO.length * 8, 'rgba(0,0,0,.78)');
  TUT_FO.forEach((l, i) => text(l, 8, y + 24 + i * 8, 1, i % 2 ? '#ffffff' : '#ffe14d'));
 }
 if (!foT) for (let i = 0; i < n; i++) rect(W - 12 - (n - i) * 7, y + 3, 5, 5, i < pos || i === pos && Tt.doneT > 0 ? '#7dff7a' : i === pos ? '#ffe14d' : '#3a4a55');
 if ((Tt.step >= TD0 || Tt.step === 3) && Tt.doneT <= 0) tutHintX(Tt, y + 21);
 const card = Tt.step === 8 ? TUT_RULES : Tt.step === 12 ? TUT_DRAW : Tt.step === 13 ? TUT_PEN : Tt.step === TC.OFFSIDES ? TUT_OFFSIDES : Tt.step === TS.SET ? TUT_SET : Tt.step === TV.PM ? TUT_PM13 : Tt.step === TV.RIDE ? TUT_RIDE13 : Tt.step === TV.TO ? TUT_TO13 : Tt.step === TV131.LINE ? TUT_LINE131 : T172.includes(Tt.step) ? tut2402(TUT_CARD172[T172.indexOf(Tt.step)]) : Tt.step === TSP182 ? TUT_CARD182 : Tt.step === TV20.OHS ? TUT_CARD20OHS : Tt.step === TV20.LEG ? TUT_CARD20LEG : null;
 if (Tt.step === TV131.LINE && Tt.doneT <= 0 && screen === 'live') {
  for (const rx of [ RL_L, RL_R ]) {
   const sx = Math.round(rx - camX);
   if (sx > 0 && sx < W) for (let yy = FT + 2; yy < FB; yy += 5) rect(sx, yy, 2, 3, '#ffe14d');
  }
 }
 if (Tt.step === TC.OFFSIDES && Tt.doneT <= 0 && screen === 'live') {
  const mx = Math.round(MIDX - camX);
  for (let yy = FT + 10; yy < FB; yy += 6) rect(mx - 1, yy, 2, 3, '#ffe14d');
  rect(mx - 66, H - 30, 60, 10, 'rgba(0,0,0,.75)');
  text('3 D + GOALIE', mx - 36, H - 28, 1, '#8fe3f0', 'center');
  rect(mx + 6, H - 30, 60, 10, 'rgba(0,0,0,.75)');
  text('3 ATTACK', mx + 36, H - 28, 1, '#ff9a4a', 'center');
  text('< STAY BACK', mx - 36, H - 40, 1, '#ffffff', 'center', '#000');
  text('STAY UP >', mx + 36, H - 40, 1, '#ffffff', 'center', '#000');
 }
 if (card && Tt.doneT <= 0) {
  const bw = W - 30, bh = 12 + card.length * 9;
  rect(15, 44, bw, bh, 'rgba(0,0,0,.82)');
  rect(15, 44, bw, 1, '#ffe14d');
  card.forEach((l, i) => text(l, W / 2, 50 + i * 9, 1, i % 2 ? '#ffffff' : '#ffe14d', 'center'));
 }
 if (Tt.step === 10 && Tt.doneT <= 0 && screen === 'live') {
  const bw = 150, bx = W / 2 - bw / 2;
  button('OPEN PLAYMAKER', bx, 70, bw, 22, () => openPlaymaker('tutorial'), {
   sc: 2,
   bg: '#ff9a4a'
  });
  [ 'TAP A GUY = HE GETS THE BALL. DRAG A GUY = HIS ROUTE.', 'TAP A TEAMMATE = PASS. PREVIEW (ALL MOVE AT ONCE), SAVE.', 'TABS: OFFENSE, MAN-UP, END LINE, CLEAR, RIDES + D.', 'NEXT: CALL IT FROM THE PLAYBOOK IN A GAME.' ].forEach((l, i) => {
   rect(10, 100 + i * 10, W - 20, 10, 'rgba(0,0,0,.7)');
   text(l, W / 2, 102 + i * 10, 1, '#fff', 'center');
  });
 }
 if (Tt.doneT > 0) {
  rect(W / 2 - 44, 70, 88, 26, 'rgba(0,0,0,.75)');
  text('DONE', W / 2 - 6, 77, 2, '#7dff7a', 'center', '#000');
  const cx = W / 2 + 24, cy = 82;
  line(cx - 6, cy, cx - 2, cy + 4, '#7dff7a', 2);
  line(cx - 2, cy + 4, cx + 6, cy - 5, '#7dff7a', 2);
 }
 if (tutAsk) drawTutAsk();
}

const R14 = (() => {
 let a = Date.now() % 2147483647 ^ Math.floor((typeof performance !== 'undefined' ? performance.now() : 0) % 1 * 1e9);
 const f = () => {
  a |= 0;
  a = a + 1831565813 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
 };
 f.seed = s => {
  a = s | 0;
 };
 return f;
})();

const r14 = (a, b) => a + R14() * (b - a);

const pick14 = arr => arr[Math.floor(R14() * arr.length)];

function V14ON() {
 return V13ON() && !window.__rl_v13 && (!navigator.webdriver || !!window.__rl_v14);
}

const FIGHT = {
 stop: .012,
 hit: .06,
 chip: .45,
 gkBrawl: .85,
 chippyN: 3,
 chippyBrawl: .35,
 maxGame: 2,
 dur1: 5.8,
 durB: 7,
 concLose: .08,
 concBrawl: .25
};

const F30 = window.F30 = {
 n: 4,
 gapMin: .3,
 gapMax: .55,
 hold: .7,
 after: 1,
 endDur: 1,
 dur1: 3.5,
 durB: 4.5,
 ban: 1.2,
 zoom: 2,
 zoomB: 1.5,
 zin: .3,
 body: 24,
 lift: 5.5
};

function on30f() {
 return !window.__rl_no30fight && !window.__rl_v124gb;
}

F30.on = on30f;

F30.view = function() {
 const G = game, sc = G && G.scene;
 if (!sc || sc.kind !== 'fight' || !on30f() || screen !== 'scene' && screen !== 'netview') return null;
 const cam = Math.round(camX), t = +sc.t || 0;
 let k = clamp(t / F30.zin, 0, 1);
 k = k * k * (3 - 2 * k);
 const f29 = !!(window.F29 && F29.act && F29.act(sc));
 const top = f29 ? 72 : 44;
 const bot = f29 ? F29.geo()[0].y - 12 : H - 14 - sa2403Dy(H - 10, 10);
 const z = clamp((bot - top) / F30.body, 1, sc.brawl ? F30.zoomB : F30.zoom), mid = (top + bot) / 2;
 const mir = screen === 'netview';
 let fx, fy;
 if (sc.f30x != null) {
  fx = mir ? FL - sc.f30x : sc.f30x;
  fy = sc.f30y;
 } else {
  const a = (sc.actors || [])[0], b = (sc.actors || [])[1];
  if (!a || !b) return null;
  fx = ((a.tx != null ? a.tx : a.x) + (b.tx != null ? b.tx : b.x)) / 2;
  fy = a.ty != null ? a.ty : a.y;
 }
 fx = clamp(fx, W / (2 * z), FL + PADW - W / (2 * z));
 fy -= F30.lift;
 const s = 1 - k + k * z;
 return {
  s: s,
  ox: -(1 - k) * cam + k * (W / 2 - z * fx),
  oy: k * (mid - z * fy),
  z: z,
  k: k,
  top: top,
  bot: bot,
  f29: f29
 };
};

F30.z = () => {
 const v = F30.view();
 return v ? {
  s: +v.s.toFixed(3),
  z: +v.z.toFixed(3),
  k: +v.k.toFixed(3),
  top: v.top,
  bot: v.bot,
  f29: v.f29
 } : null;
};

function f30Cam(cam) {
 const v = F30.view();
 if (!v) return;
 F30.n30z = (F30.n30z || 0) + 1;
 g.translate(v.ox + cam, v.oy);
 g.scale(v.s, v.s);
}

const CONC = {
 perGame: 1.3,
 sim: .5,
 maxGame: 2,
 armChk: 25
};

const isGk14 = p => !!p && (p.gk || p.team === 'G' || p.team === 'G2');

const side14 = p => p.team === 'O' || p.team === 'G2' ? 0 : 1;

function V14(G) {
 G = G || game;
 if (!G) return null;
 if (!G.v14) G.v14 = {
  fights: 0,
  fightLog: [],
  scenes: [],
  concHeat: 0,
  concThr: -Math.log(1 - R14() * .999),
  concArmed: false,
  concPend: null,
  fightPend: null,
  conc: [],
  gear: [],
  box: {},
  pbp: [],
  lastFeed: null,
  uids: null,
  lu0: null,
  punch: 0,
  injScenes: 0,
  fakeClips: []
 };
 return G.v14;
}

function chippy14(G) {
 return (G.foulLog || []).length + (G.penLog || []).length >= FIGHT.chippyN;
}

function chip14(G) {
 return 1 + FIGHT.chip * ((G.foulLog || []).length + (G.ruleLog || []).filter(r => r.kind === 'upen' || r.kind === 'cpen').length) + .15 * V14(G).fights;
}

function gameSecs14(G) {
 return Math.max(60, (G.qlen || QLEN) * (G.periods || 4));
}

const STAT_KEYS = [ 'g', 'a', 'sh', 'gb', 'to', 'ct', 'pen', 'fow', 'fot', 'sv', 'sa', 'ga' ];

function st14(ev, pl) {
 const G = game;
 if (!G || G.tutorial || !pl || !pl.id) return;
 const V = V14(G);
 if (!V.uids) V.uids = new Set(teamRosterIds(G.user, G.src || (G.mode === 'season' ? 'season' : 'real')));
 if (!V.uids.has(pl.id)) return;
 const b = V.box[pl.id] || (V.box[pl.id] = {});
 b[ev] = (b[ev] || 0) + 1;
 V.pbp.push([ ev, pl.id, +(+G.t || 0).toFixed(2), G.q ]);
}

function feed14(from, to) {
 const G = game;
 if (!G || !to || !to.pl) return;
 V14(G).lastFeed = {
  from: from && from.pl,
  to: to.pl,
  t: G.t
 };
}

function goal14(shooter) {
 const G = game;
 if (!G || !shooter || !shooter.pl) return;
 st14('g', shooter.pl);
 const f = V14(G).lastFeed;
 if (f && f.to === shooter.pl && f.from && f.from !== shooter.pl && G.t - f.t < 12) st14('a', f.from);
 V14(G).lastFeed = null;
}

function blankStats() {
 const o = {
  gp: 0
 };
 for (const k of STAT_KEYS) o[k] = 0;
 return o;
}

(function v14Frames() {
 if (typeof RL12 === 'undefined' || !RL12.FR || !RL12.FR.idle) return;
 const FRX = RL12.FR, strip = r => r.replace(/[MmnX]/g, '.');
 const idle = FRX.idle[3].map(strip);
 const head = [ '.....oooo.........', '....oooooooo......', '...ooooooooo......', '...oooooSSSSo.....', '...ooooSSSSSSo....', '....ooSSSoSSSo....', '....oSSSSSSSSo....', '.....oSSssSSo.....' ];
 const noHelm = rows => rows.map((r, i) => i >= 2 && i <= 9 ? head[i - 2] : r);
 const bare = rows => rows.map(r => r.replace(/G/g, 'S').replace(/g/g, 's'));
 const punch = rows => rows.map((r, i) => i === 12 ? '..ojJJJJJjjjjjjjGG' : i === 13 ? '..ojJJJjJJJJo...gG' : i === 16 ? '..ojJJJJJJJJjjGG..' : r);
 const pbare = rows => rows.map((r, i) => i === 12 ? '..ojJJJJJjjjjjjjSS' : i === 13 ? '..ojJJJjJJJJo...sS' : r);
 const A = FRX.idle;
 for (const h of [ 'H', 'N' ]) for (const gl of [ 'G', 'B' ]) for (const p of [ 0, 1 ]) {
  let rows = idle.slice();
  if (h === 'N') rows = noHelm(rows);
  if (p) rows = punch(rows);
  if (gl === 'B') rows = p ? pbare(bare(rows)) : bare(rows);
  FRX['f14_' + h + gl + p] = [ A[0], A[1], null, rows ];
 }
 const dn = FRX.down;
 FRX.f14_downH = [ dn[0], dn[1], null, dn[3].map(strip) ];
 FRX.f14_downN = [ dn[0], dn[1], null, dn[3].map(r => strip(r).replace(/[Hhw]/g, 'o').replace(/c/g, 'S')) ];
 const gu = FRX.getup0, kn = rows => rows.slice(0, 15).concat([ '..ooJJJJJJJo......', '..oKKKKoSSo.......', '...ooooooo........' ]);
 FRX.f14_kneelH = [ gu[0], 17, null, kn(gu[3].map(strip)) ];
 FRX.f14_kneelN = [ gu[0], 17, null, kn(gu[3].map(strip).map((r, i) => i >= 4 && i <= 11 ? r.replace(/[Hhw]/g, 'o').replace(/c/g, 'S') : r)) ];
 const r0 = FRX.run1 || FRX.idle;
 FRX.f14_runH = [ r0[0], r0[1], null, r0[3].map(strip) ];
})();

function sceneStart(sc) {
 const G = game;
 const V = V14(G);
 sc.t = 0;
 sc.back = screen;
 G.scene = sc;
 screen = 'scene';
 stick = null;
 shootP = null;
 G.dHold = null;
 V.scenes.push({
  kind: sc.kind,
  t: +(+G.t || 0).toFixed(2),
  q: G.q,
  brawl: !!sc.brawl
 });
 return sc;
}

function sceneTick(dt) {
 const G = game, sc = G && G.scene;
 if (!sc) {
  if (G) screen = 'live';
  return;
 }
 sc.t += dt;
 for (const a of sc.actors || []) actorTick14(a, dt, sc);
 if (sc.kind === 'fight') fightTick(sc, dt); else if (sc.kind === 'injury') injTick14(sc, dt); else if (sc.kind === 'punch') punchTick(sc, dt);
 camX += (clamp(sc.cx - W / 2, 0, FL - W + PADW) - camX) * Math.min(1, dt * 4);
 if (sc.t >= sc.dur) sceneEnd(false);
}

function sceneSkip() {
 const G = game;
 if (G && G.scene) sceneEnd(true);
}

function sceneEnd(skipped) {
 const G = game, sc = G && G.scene;
 if (!sc) return;
 if (sc.f29 && window.F29) {
  if (skipped && F29.busy(sc)) return;
  F29.close(sc);
 }
 G.scene = null;
 sc.skipped = !!skipped;
 sc.endT = sc.t;
 const V = V14(G), rec = V.scenes[V.scenes.length - 1];
 if (rec) {
  rec.skipped = !!skipped;
  rec.len = +sc.t.toFixed(2);
 }
 screen = sc.back === 'scene' ? 'live' : sc.back;
 if (sc.kind === 'fight') return fightDone(sc);
 if (sc.kind === 'injury') return injDone14(sc);
 if (sc.kind === 'punch') return punchDone(sc);
}

function mkActor(p, side, extra) {
 const G = game, pl = p.pl || null;
 return Object.assign({
  x: p.x,
  y: p.y,
  side: side,
  kit: side === 0 ? G.uk : G.ok,
  skin: skinOf(pl),
  pl: pl,
  gk: isGk14(p),
  face: side === 0 ? 1 : -1,
  tx: p.x,
  ty: p.y,
  spd: 34,
  helm: true,
  gloves: true,
  punchT: -9,
  down: false,
  kneel: false,
  anim: 0,
  src: p
 }, extra || {});
}

function actorTick14(a, dt) {
 const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
 if (d > .4 && !a.down) {
  const s = Math.min(d, a.spd * dt);
  a.x += dx / d * s;
  a.y += dy / d * s;
  a.anim += s;
  a.moving = true;
 } else a.moving = false;
 a.y = clamp(a.y, FT + 8, FB + 2);
}

function dropGear14(a, what) {
 const G = game, V = V14(G), pal = RL12.palette(a.kit, a.skin || 0);
 if (what !== 'gloves' && a.helm) {
  a.helm = false;
  V.gear.push({
   type: 'helm',
   x: Math.round(a.x - a.face * 6 + r14(-2, 2)),
   y: Math.round(a.y + r14(1, 4)),
   col: pal.H,
   col2: pal.h,
   side: a.side
  });
 }
 if (what !== 'helm' && a.gloves) {
  a.gloves = false;
  for (const s of [ -1, 1 ]) V.gear.push({
   type: 'glove',
   x: Math.round(a.x + s * 4 + r14(-2, 2)),
   y: Math.round(a.y + r14(2, 5)),
   col: pal.G,
   col2: pal.g,
   side: a.side
  });
 }
}

function say14(cat, x, y) {
 const G = game, list = VOICE_CAT[cat] || [];
 if (!list.length) return null;
 let k, n = 0;
 do {
  k = list[Math.floor(R14() * list.length)];
 } while (k === voiceLast._any && list.length > 1 && ++n < 8);
 voiceLast[cat] = k;
 voiceLast._any = k;
 if (G) G.voiceAt = vt();
 const kp = k;
 k = window.V17 ? V17.chirp(cat, k) : k;
 if (!k) return kp;
 if (voiceSrc) {
  try {
   voiceSrc.stop();
  } catch (e) {}
  voiceSrc = null;
 }
 const s = sfx12(k, CHIRP.vol, 1);
 if (s && typeof s === 'object') {
  voiceSrc = s;
  voiceEndAt = AC.currentTime + (typeof RL12A !== 'undefined' && RL12A.DUR[k] || 1.6) + .1;
 }
 if (x != null) {
  const tw = textW(VOICE_TXT[k] || '') / 2 + 6;
  pop12(VOICE_TXT[k] || '', clamp(x, Math.round(camX) + tw, Math.round(camX) + W - tw), y, '#ffffff', 2, true);
 }
 if (G) {
  G.voiceLog = G.voiceLog || [];
  G.voiceLog.push([ cat, k, +(+G.t || 0).toFixed(2) ]);
 }
 return k;
}

function v14Hit(c, by) {
 const G = game;
 if (!G || G.tutorial || G.over || !c || !V14ON()) return;
 const V = V14(G);
 if (V.concArmed && c.pl && !isGk14(c) && G.players.includes(c) && V.conc.length < CONC.maxGame && !V.concPend) {
  V.concArmed = false;
  V.concPend = {
   p: c,
   by: by,
   why: 'hit'
  };
 }
 if (V.fightPend || V.fights >= FIGHT.maxGame || !by || !by.pl || side14(by) === side14(c)) return;
 if (isGk14(c)) {
  if (R14() < FIGHT.gkBrawl) V.fightPend = {
   kind: 'brawl',
   a: by,
   b: c,
   why: 'goalie'
  };
  return;
 }
 if (R14() < FIGHT.hit * chip14(G)) V.fightPend = {
  kind: chippy14(G) && R14() < FIGHT.chippyBrawl ? 'brawl' : 'scrap',
  a: by,
  b: c,
  why: 'hit'
 };
}

function v14Check(c, d) {
 const s17 = window.V17 && game && game.g17 ? V17.checkLanded(c) : null;
 if (s17) return s17;
 const G = game;
 if (!G || G.tutorial || G.over || !c || !c.pl || !V14ON()) return;
 const V = V14(G);
 if (!V.concArmed || (V.armT || 0) < CONC.armChk || V.concPend || V.conc.length >= CONC.maxGame || isGk14(c)) return;
 V.concArmed = false;
 V.concPend = {
  p: c,
  by: d,
  why: 'check'
 };
}

function v14Tick(dt) {
 const G = game;
 if (!G || G.tutorial || G.over || G.brave || !V14ON()) return;
 const V = V14(G);
 if (!V.concArmed) {
  V.concHeat += dt * CONC.perGame / gameSecs14(G);
  if (V.concHeat >= V.concThr) {
   V.concArmed = true;
   V.armT = 0;
   V.concHeat = 0;
   V.concThr = -Math.log(1 - R14() * .999);
  }
 } else V.armT = (V.armT || 0) + dt;
 if (V.concPend) {
  const cp = V.concPend;
  V.concPend = null;
  if (G.players.includes(cp.p) && cp.p.pl) {
   concussionStart(cp.p, cp.by, null);
   return;
  }
 }
 if (V.fightPend) {
  const fp = V.fightPend;
  V.fightPend = null;
  fightStart(fp, null);
 }
}

function v14PreBanner(k) {
 const G = game;
 if (!G || G.tutorial || G.over || k === 'tutdone' || !V14ON()) return false;
 if (G.ot && (k === 'goal' || k === 'cgoal')) return false;
 if (G.brave) {
  const V0 = V14(G);
  V0.concPend = null;
  V0.fightPend = null;
  G.punchArmed = false;
  return false;
 }
 const V = V14(G);
 if (V.concPend) {
  const cp = V.concPend;
  V.concPend = null;
  if (G.players.includes(cp.p) && cp.p.pl) {
   concussionStart(cp.p, cp.by, k);
   return true;
  }
 }
 if (G.punchArmed && G.q >= 2 && k !== 'buzzer') {
  G.punchArmed = false;
  punchStart(k);
  return true;
 }
 if (G.banner && !G.banner.v14roll) {
  G.banner.v14roll = true;
  if (!V.fightPend && V.fights < FIGHT.maxGame && k !== 'buzzer' && R14() < FIGHT.stop * chip14(G)) V.fightPend = {
   kind: chippy14(G) && R14() < FIGHT.chippyBrawl ? 'brawl' : 'scrap',
   why: 'whistle'
  };
 }
 if (V.fightPend) {
  const fp = V.fightPend;
  V.fightPend = null;
  fightStart(fp, k);
  return true;
 }
 return false;
}

function onField14(G) {
 const out = [];
 for (const p of G.players || []) if (p && p.x != null && p.pl) out.push({
  p: p,
  side: side14(p)
 });
 for (const f of G.farU || []) if (f && f.x != null && f.pl) out.push({
  p: f,
  side: 0
 });
 for (const f of G.farC || []) if (f && f.x != null && f.pl) out.push({
  p: f,
  side: 1
 });
 return out;
}

function fightStart(fp, afterKind) {
 const G = game, V = V14(G);
 const all = onField14(G), sk = all.filter(o => !isGk14(o.p) && !(o.p.role === 'G'));
 let A = fp.a && sk.find(o => o.p === fp.a), B = fp.b && sk.find(o => o.p === fp.b);
 const bx = G.ball ? G.ball.x : MIDX, by = G.ball ? G.ball.y : CY;
 if (!A || !B || A.side === B.side) {
  let best = null, bd = 1e9;
  for (const u of sk) for (const o of sk) if (u.side === 0 && o.side === 1) {
   const d = Math.hypot(u.p.x - o.p.x, u.p.y - o.p.y) + .35 * Math.hypot(u.p.x - bx, u.p.y - by);
   if (d < bd) {
    bd = d;
    best = [ u, o ];
   }
  }
  if (!best) return false;
  if (fp.b && B && B.side === 1) best[1] = B;
  if (fp.b && B && B.side === 0) best[0] = B;
  [A, B] = best;
 }
 if (A.side === 1) [A, B] = [ B, A ];
 const brawl = fp.kind === 'brawl';
 const sc = {
  kind: 'fight',
  brawl: brawl,
  why: fp.why || 'hit',
  dur: brawl ? FIGHT.durB : FIGHT.dur1,
  actors: [],
  pairs: [],
  pows: [],
  afterKind: afterKind,
  cap: brawl ? 'BENCHES CLEAR!' : 'FIGHT!'
 };
 if (on30f()) {
  sc.dur = brawl ? F30.durB : F30.dur1;
  sc.q30 = sc.dur / (brawl ? FIGHT.durB : FIGHT.dur1);
 }
 const cx = clamp((A.p.x + B.p.x) / 2, 70, FL - 70), cy = clamp((A.p.y + B.p.y) / 2, FT + 30, FB - 26);
 sc.cx = cx;
 sc.cy = cy;
 const a0 = mkActor(A.p, 0), b0 = mkActor(B.p, 1);
 sc.actors.push(a0, b0);
 sc.pairs.push([ a0, b0, cx, cy, 0 ]);
 if (brawl) {
  const used = new Set([ A.p, B.p ]);
  const us = sk.filter(o => o.side === 0 && !used.has(o.p)).map(o => mkActor(o.p, 0)), them = sk.filter(o => o.side === 1 && !used.has(o.p)).map(o => mkActor(o.p, 1));
  for (const side of [ 0, 1 ]) {
   let ids = G.bench && G.bench[side === 0 ? 'u' : 'o'] && G.bench[side === 0 ? 'u' : 'o'].ids || [];
   if (!ids.length) {
    try {
     ids = benchWant(side === 0 ? 'u' : 'o');
    } catch (e) {
     ids = [];
    }
   }
   ids.slice(0, 3).forEach((id, i) => {
    const ac = mkActor({
     x: benchSlotX(side === 0 ? 'u' : 'o', i),
     y: BENCH_Y - 2,
     pl: PP(id)
    }, side, {
     bench: true,
     spd: 46
    });
    (side === 0 ? us : them).push(ac);
   });
  }
  us.sort((p, q) => p.x - q.x);
  them.sort((p, q) => p.x - q.x);
  const n = Math.min(us.length, them.length);
  for (let i = 0; i < n; i++) {
   const u = us[i], o = them[i], k = sc.pairs.length;
   const px = clamp(cx + (k % 4 - 1.5) * 26 + r14(-4, 4), 40, FL - 40), py = clamp(cy + (Math.floor(k / 4) % 3 - 1) * 24 + (k % 2 ? 10 : -10), FT + 16, FB - 10);
   sc.actors.push(u, o);
   sc.pairs.push([ u, o, px, py, r14(0, .8) ]);
  }
  const extra = us.slice(n).concat(them.slice(n));
  const gks = all.filter(o => isGk14(o.p) || o.p.role === 'G');
  sc.hunts = [];
  for (const go of gks) {
   const ga = mkActor(go.p, go.side, {
    spd: 26,
    gkOut: true
   });
   sc.actors.push(ga);
   ga.tx = clamp(go.p.x + (go.p.x < MIDX ? 46 : -46), 30, FL - 30);
   ga.ty = clamp(go.p.y + r14(-10, 10), FT + 20, FB - 14);
   const cand = sc.actors.concat(extra).filter(e => e.side !== go.side && !e.gk && !e.hunt && e !== a0 && e !== b0);
   let h = null, hd = 1e9;
   for (const e of cand) {
    const d = Math.hypot(e.x - ga.tx, e.y - ga.ty);
    if (d < hd) {
     hd = d;
     h = e;
    }
   }
   if (h) {
    if (extra.includes(h)) extra.splice(extra.indexOf(h), 1);
    const pr0 = sc.pairs.find(pp => pp[0] === h || pp[1] === h);
    if (pr0) {
     pr0.hunter = true;
     const mate = pr0[0] === h ? pr0[1] : pr0[0];
     mate.gang = true;
     sc.pairs.splice(sc.pairs.indexOf(pr0), 1);
    }
    if (!sc.actors.includes(h)) sc.actors.push(h);
    h.hunt = ga;
    h.spd = 70;
    sc.hunts.push([ h, ga ]);
   }
  }
  for (const e of extra) {
   if (!sc.actors.includes(e)) sc.actors.push(e);
   const pp = sc.pairs[Math.floor(R14() * sc.pairs.length)];
   e.tx = pp[2] + r14(-14, 14);
   e.ty = pp[3] + r14(-10, 10);
   e.spd = 40;
   e.gang = true;
  }
  sc.cap = fp.why === 'goalie' ? 'YOU DO NOT TOUCH THE GOALIE - BENCHES CLEAR!' : 'BENCHES CLEAR!';
 }
 for (const pp of sc.pairs) {
  const [u, o, px, py] = pp;
  u.tx = px - 6;
  u.ty = py;
  o.tx = px + 6;
  o.ty = py;
  u.face = 1;
  o.face = -1;
  u.spd = Math.max(u.spd, 30);
  o.spd = Math.max(o.spd, 30);
 }
 for (const a of sc.actors) if (a.gang && !a.hunt) {
  const pp = sc.pairs[Math.floor(R14() * sc.pairs.length)];
  if (pp) {
   a.tx = pp[2] + r14(-14, 14);
   a.ty = pp[3] + r14(-10, 10);
   a.spd = 40;
  }
 }
 const strOf = a => rf(a.pl, 'str');
 let pU;
 if (brawl) {
  const su = sc.actors.filter(a => a.side === 0 && !a.gk).reduce((s, a) => s + strOf(a), 0), so = sc.actors.filter(a => a.side === 1 && !a.gk).reduce((s, a) => s + strOf(a), 0);
  pU = clamp(.5 + .05 * (su - so), .25, .75);
 } else pU = clamp(.5 + .12 * (strOf(a0) - strOf(b0)), .2, .8);
 sc.winSide = R14() < pU ? 0 : 1;
 for (const pp of sc.pairs) {
  const pw = pp === sc.pairs[0] ? sc.winSide : R14() < .5 ? 0 : 1;
  pp.loser = pw === 0 ? pp[1] : pp[0];
  pp.winner = pw === 0 ? pp[0] : pp[1];
 }
 sc.refs = (G.refs || []).slice(0, 3);
 sc.refStart = sc.refs.map(r => [ r.x, r.y ]);
 sc.watch = all.filter(o => !sc.actors.some(a => a.src === o.p)).map(o => {
  const w = mkActor(o.p, o.side, {
   spd: 0,
   watch: true
  });
  w.face = cx >= w.x ? 1 : -1;
  return w;
 });
 V.fights++;
 G.fightN = (G.fightN || 0) + 1;
 SFX.whistle();
 sfx12('crowd_cheer', .45);
 if (window.F29) F29.start(sc);
 if (on30f() && sc.pairs[0]) {
  sc.f30x = sc.pairs[0][2];
  sc.f30y = sc.pairs[0][3];
 }
 sceneStart(sc);
 addFx('cue', 0, 0, {
  s: brawl ? 'BENCHES CLEAR!' : 'FIGHT!',
  col: '#ff5a4a',
  life: 1.4
 });
 return true;
}

function fightTick(sc, dt) {
 if (sc.f29 && window.F29) F29.tick(sc, dt);
 const t = sc.t, q = sc.q30 || 1;
 for (const pp of sc.pairs) {
  const [u, o, px, py, d0] = pp, tl = t - d0;
  if (tl > .9 * q && tl < .9 * q + .1 + dt) {
   for (const a of [ u, o ]) if (a.helm || a.gloves) {
    dropGear14(a);
    a.dropT = t;
   }
  }
  if (tl > 1.3 * q && t < sc.dur - 1.9 * q) {
   const ph = Math.floor((tl - 1.3 * q) / .28);
   if (ph !== pp.ph) {
    pp.ph = ph;
    const who = ph % 2 ? o : u;
    who.punchT = t;
    if (ph % 3 !== 2) {
     sc.pows.push({
      x: px + (who === u ? 1 : -1),
      y: py - 10 - ph % 2,
      t: t
     });
     sfx12('hit_light', .25 + .15 * (ph % 2));
    }
   }
   u.x = px - 6 + Math.sin(tl * 7) * 1.2;
   o.x = px + 6 + Math.sin(tl * 7 + 1.5) * 1.2;
  }
  if (pp.loser && !pp.loser.down && t > sc.dur - 2.3 * q && tl > 1.6 * q) {
   pp.loser.down = true;
   pp.loser.downT = t;
   sc.pows.push({
    x: (u.x + o.x) / 2,
    y: py - 9,
    t: t,
    big: true
   });
   sfx12('hit_big', .55);
  }
  if (t > sc.dur - 1.5 * q) {
   if (!pp.split) {
    pp.split = true;
    if (!pp.winner.down) {
     pp.winner.tx = pp.winner.x + (pp.winner === u ? -16 : 16);
     pp.winner.spd = 18;
    }
   }
  }
 }
 for (const [h, ga] of sc.hunts || []) {
  if (t > 1.2 * q) {
   h.tx = ga.x + (h.x < ga.x ? -6 : 6);
   h.ty = ga.y;
   h.face = h.x < ga.x ? 1 : -1;
   if (Math.hypot(h.x - ga.x, h.y - ga.y) < 9) {
    if (h.helm && t > 1.6 * q) dropGear14(h);
    if (Math.floor(t / .3) % 2) h.punchT = t;
   }
  }
 }
 if (sc.refs) sc.refs.forEach((r, i) => {
  const pp = sc.pairs[i % sc.pairs.length];
  if (!pp) return;
  const s0 = sc.refStart[i], k = clamp((t - 2.2 * q) / (1.8 * q), 0, 1);
  r.x = s0[0] + (pp[2] + (i ? 4 : -2) - s0[0]) * k;
  r.y = s0[1] + (pp[3] + 6 - s0[1]) * k;
  r.anim += dt * 40;
 });
 if (!sc.capT && t > sc.dur - 2.2 * q) {
  sc.capT = t;
  const w = sc.pairs[0].winner;
  sc.cap2 = (w && w.pl ? lastName(w.pl) : '') + ' WINS THE FIGHT';
 }
}

function fightDone(sc) {
 const G = game, V = V14(G), main = sc.pairs[0];
 for (const pp of sc.pairs) for (const a of [ pp[0], pp[1] ]) if (a.helm || a.gloves) dropGear14(a);
 for (const [h] of sc.hunts || []) if (h.helm) dropGear14(h, 'helm');
 const fighters = [];
 for (const pp of sc.pairs.slice(0, sc.brawl ? 3 : 1)) fighters.push(pp[0], pp[1]);
 const pens = [];
 for (const a of fighters) {
  if (!a.pl) continue;
  const side = a.side === 0 ? 'U' : 'C';
  if (a.side === 0) st14('pen', a.pl);
  const ej = penCountUp({
   pl: a.pl
  }, side);
  pens.push({
   pid: a.pl.id,
   side: side,
   ej: ej
  });
 }
 let conc = null;
 if (V.conc.length < CONC.maxGame) for (const pp of sc.pairs) {
  const l = pp.loser;
  if (l && l.pl && !l.gk && R14() < (sc.brawl ? FIGHT.concBrawl / Math.max(1, sc.pairs.length / 2) : FIGHT.concLose)) {
   conc = l;
   break;
  }
 }
 const win = sc.winSide;
 V.fightLog.push({
  kind: sc.brawl ? 'brawl' : 'scrap',
  why: sc.why,
  a: main[0].pl && main[0].pl.id,
  b: main[1].pl && main[1].pl.id,
  win: win,
  pens: pens,
  skipped: !!sc.skipped,
  t: +(+G.t || 0).toFixed(2),
  q: G.q,
  after: sc.afterKind || null,
  pairs: sc.pairs.length
 });
 if (G.penPending) {
  const pp = G.penPending;
  G.penPending = null;
  G.pen = Object.assign(pp, {
   left: PEN_LEN,
   at: G.q
  });
  G.pens++;
  G.penLog.push({
   side: pp.side,
   foul: pp.foul,
   who: pp.who ? pp.who.id : null,
   q: G.q
  });
  if (pp.side === 'C') G.emo = '3-3 EMO'; else G.md = 'ZONE ROTATE';
 }
 if (sc.f29 && window.F29) F29.after(sc);
 const wn = main.winner && main.winner.pl ? lastName(main.winner.pl) : '';
 if (conc) {
  const fake = {
   x: conc.x,
   y: conc.y,
   pl: conc.pl,
   team: conc.side === 0 ? 'O' : 'D'
  };
  G.v14AfterConc = {
   win: win,
   wn: wn,
   brawl: sc.brawl
  };
  return concussionStart(fake, null, 'fightBall', true);
 }
 fightBall14(win, wn, sc.brawl);
}

function fightBall14(win, wn, brawl) {
 const G = game;
 if (G.v14 && G.v14.gear && G.v14.gear.length) for (const it of G.v14.gear) if (it.fade181 == null) it.fade181 = menuT;
 G.ruleSpot = {
  x: win === 0 ? MIDX + 1 : MIDX - 1,
  y: CY
 };
 G.ruleCall = {
  label: 'FIGHTING',
  t: G.t
 };
 if (win === 0) ruleBanner('rturnU', brawl ? 'BRAWL!' : 'FIGHT!', (wn ? wn + ' WINS IT - ' : '') + 'YOUR BALL'); else ruleBanner('rturn', brawl ? 'BRAWL!' : 'FIGHT!', (wn ? wn + ' WINS IT - ' : '') + 'THEIR BALL');
 G.banner.v14roll = true;
 G.banner.fight = true;
 G.bannerAuto = on30f() ? F30.ban : 2.2;
}

const F29 = window.F29 = function() {
 const C = {
  n: 7,
  gapMin: .4,
  gapMax: 1,
  cpuMin: .45,
  cpuMax: .75,
  hold: 1.3,
  after: 1.7,
  endDur: 1.95,
  minute: 60,
  winNet: 1,
  quiet: 3500,
  fb: .45
 };
 const DIRS = [ 'LEFT', 'UP', 'DOWN', 'RIGHT' ];
 const on = () => !window.__rl_no29fight && !window.__rl_v124gb;
 const wall = () => performance.timeOrigin + performance.now();
 const NET = () => window.RLNET && RLNET.inGame ? RLNET : null;
 let M = null, idN = 0, els = null, hbAt = 0;
 const LOG = [];
 const K = k => on30f() && F30[k] != null ? F30[k] : C[k];
 function rng(seed) {
  let a = seed >>> 0;
  return () => {
   a = a + 1831565813 | 0;
   let t = Math.imul(a ^ a >>> 15, 1 | a);
   t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
   return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
 }
 function cpuReact(pl, r) {
  if (window.__rl_f29cpu != null) return +window.__rl_f29cpu;
  const s = pl ? rf(pl, 'str') : 0, j = ((r == null ? Math.random() : r) - .5) * .06;
  return +clamp(.6 - .075 * s + j, C.cpuMin, C.cpuMax).toFixed(3);
 }
 function offs(seq, win) {
  const o = [];
  let s = 0;
  for (let k = 0; k < seq.length; k++) {
   s += seq[k].gap * 1e3;
   o.push(Math.round(s + k * win * 1e3));
  }
  return o;
 }
 function send(m) {
  const N = NET();
  if (N && N.link) try {
   N.link.send(m);
  } catch (e) {
   console.error(e);
  }
 }
 function start(sc) {
  const G = game;
  M = null;
  if (!on() || !G || G.tutorial || G.practice || G.brave || !sc || sc.kind !== 'fight') return false;
  const p0 = sc.pairs && sc.pairs[0];
  if (!p0 || !p0[0] || !p0[1] || !p0[0].pl || !p0[1].pl || p0[0].side !== 0) return false;
  const N = NET();
  if (N && !N.auth) return false;
  const seed = window.__rl_f29seed != null ? +window.__rl_f29seed + idN : Math.floor(Math.random() * 2147483647);
  const R = rng(seed);
  idN++;
  const fs = window.__rl_f29seq, fg = window.__rl_f29gap;
  const seq = [];
  const n = K('n'), g0 = K('gapMin'), g1 = K('gapMax');
  for (let k = 0; k < n; k++) seq.push({
   d: Array.isArray(fs) && fs.length ? (fs[k % fs.length] | 0) & 3 : Math.floor(R() * 4),
   gap: fg != null ? +fg : +(g0 + R() * (g1 - g0)).toFixed(3)
  });
  M = {
   sc: sc,
   id: 1e5 + Math.floor(Math.random() * 8e5),
   seq: seq,
   ph: 'intro',
   k: 0,
   pt: 0,
   ft: 0,
   lit: -1,
   u: 0,
   c: 0,
   log: [],
   fb: null,
   res: null,
   why: null,
   R: R,
   online: !!N,
   role: 'a',
   cpuPl: p0[1].pl,
   t0: wall()
  };
  sc.f29 = M.id;
  sc.f29U = 0;
  sc.f29C = 0;
  if (p0[3] > 96 && !on30f()) {
   p0[3] = 96;
   p0[0].ty = 96;
   p0[1].ty = 96;
  }
  if (N) {
   const ow = N.link && N.link.oneWay ? N.link.oneWay() : 300;
   const lead = Math.round(clamp(1500 + 2.5 * ow, 1500, 2600)), at = wall() + lead, Cc = N.clockChoices ? N.clockChoices() : {};
   M.at = at;
   M.fs = offs(seq, C.winNet).map(o => at + o);
   M.taps = {
    a: {},
    v: {}
   };
   M.rs = {};
   M.rk = 0;
   M.heard = 0;
   const msg = {
    t: 'f29s',
    id: M.id,
    seq: seq.map(s => [ s.d, s.gap ]),
    at: at,
    lead: lead,
    ow: Math.round(ow)
   };
   if (Cc.ws) {
    msg.atW = at + Cc.ws.off;
    msg.wErr = +Cc.ws.err.toFixed(1);
   }
   if (Cc.srv) {
    msg.atS = at + Cc.srv.off;
    msg.sErr = +Cc.srv.err.toFixed(1);
   }
   hookNet();
   send(msg);
  }
  LOG.push({
   id: M.id,
   online: M.online,
   seq: seq.map(s => s.d),
   t: +(+G.t || 0).toFixed(2)
  });
  return true;
 }
 function tick(sc, dt) {
  const m = M;
  if (!m || m.sc !== sc || m.role !== 'a' || m.ph === 'done') return;
  if (m.ph === 'intro') {
   if (sc.t < K('hold')) return;
   m.p0 = sc.pairs.shift();
   m.ph = m.online ? 'net' : 'gap';
   m.k = 0;
   m.pt = 0;
  }
  sc.dur = Math.max(sc.dur, sc.t + 3);
  anim(sc);
  if (m.online) netTick(sc); else cpuTick(sc, dt);
 }
 function anim(sc) {
  const p = M.p0;
  if (!p) return;
  const [u, o, px, py] = p, t = sc.t;
  for (const [a, x0] of [ [ u, px - 6 ], [ o, px + 6 ] ]) {
   if (Math.abs(a.y - py) < 2 && Math.abs(a.x - x0) < 3) {
    a.x = x0 + Math.sin(t * 7 + (a === o ? 1.5 : 0)) * 1.2;
    a.tx = x0;
   }
  }
  u.face = 1;
  o.face = -1;
 }
 function punch(sc, who, why, extra) {
  const m = M, k = m.k, rec = Object.assign({
   k: k,
   d: m.seq[k].d,
   who: who,
   why: why
  }, extra || {});
  m.log.push(rec);
  if (who === 'u') m.u++; else if (who === 'c') m.c++;
  sc.f29U = m.u;
  sc.f29C = m.c;
  m.fb = {
   d: rec.d,
   who: who,
   wrong: extra && extra.wrong != null ? extra.wrong : null,
   at: performance.now()
  };
  const p = m.p0 || sc.pairs[0];
  if (p && who) {
   const a = who === 'u' ? p[0] : p[1];
   a.punchT = sc.t;
   sc.pows.push({
    x: p[2] + (who === 'u' ? 1 : -1),
    y: p[3] - 10 - m.log.length % 2,
    t: sc.t
   });
   try {
    sfx12(m.log.length % 3 === 0 ? 'hit_big' : 'hit_light', .4);
   } catch (e) {}
  }
 }
 function cpuTick(sc, dt) {
  const m = M;
  if (m.ph === 'gap') {
   m.pt += dt;
   m.lit = -1;
   if (m.pt >= m.seq[m.k].gap) {
    m.ph = 'flash';
    m.ft = 0;
    m.tw = performance.now();
    m.tap = null;
    m.cpuAt = cpuReact(m.cpuPl, m.R());
    m.lit = m.seq[m.k].d;
   }
   return;
  }
  if (m.ph === 'flash') {
   m.ft += dt;
   m.tw = performance.now();
   if (m.ft >= m.cpuAt) {
    punch(sc, 'c', 'cpu', {
     cpu: m.cpuAt
    });
    next(sc);
   }
  }
 }
 function next(sc) {
  const m = M;
  m.lit = -1;
  m.k++;
  m.pt = 0;
  if (m.k >= m.seq.length) finish(sc, 'end'); else m.ph = 'gap';
 }
 function tap(d) {
  const m = M;
  if (!m || m.ph === 'done' || paused || !visible()) return false;
  if (m.online) return netTap(d);
  if (m.ph !== 'flash') {
   m.early = (m.early || 0) + 1;
   return false;
  }
  const rt = +(m.ft + Math.min(.05, Math.max(0, (performance.now() - m.tw) / 1e3))).toFixed(3), d0 = m.seq[m.k].d, sc = m.sc;
  if (d !== d0) punch(sc, 'c', 'wrong', {
   wrong: d,
   rt: rt,
   cpu: m.cpuAt
  }); else if (rt <= m.cpuAt) punch(sc, 'u', 'tap', {
   rt: rt,
   cpu: m.cpuAt
  }); else punch(sc, 'c', 'cpu', {
   rt: rt,
   cpu: m.cpuAt
  });
  next(sc);
  return true;
 }
 function curK(now) {
  const m = M;
  if (!m || !m.fs) return -1;
  for (let k = 0; k < m.fs.length; k++) if (now >= m.fs[k] && now < m.fs[k] + C.winNet * 1e3) return k;
  return -1;
 }
 function netTap(d) {
  const m = M, now = wall(), k = curK(now);
  if (k < 0) {
   m.early = (m.early || 0) + 1;
   return false;
  }
  const mine = m.role === 'a' ? m.taps.a : m.mine;
  if (mine[k] || m.rs && m.rs[k] !== undefined) return false;
  mine[k] = {
   d: d,
   rt: +((now - m.fs[k]) / 1e3).toFixed(3)
  };
  if (m.role === 'v') send({
   t: 'f29t',
   id: m.id,
   k: k,
   d: d,
   rt: mine[k].rt
  });
  return true;
 }
 function netTick(sc) {
  const m = M, now = wall(), N = NET();
  if (!N || N.link && !N.link.connected || now - Math.max(m.heard || 0, m.t0) > C.quiet) {
   finish(sc, 'dc');
   return;
  }
  const ow = N.link && N.link.oneWay ? N.link.oneWay() : 300, grace = Math.max(450, 2 * ow + 200), win = C.winNet * 1e3;
  m.lit = -1;
  const k0 = curK(now);
  if (k0 >= 0 && !m.taps.a[k0] && m.rs[k0] === undefined) m.lit = m.seq[k0].d;
  while (m.rk < m.seq.length) {
   const k = m.rk, st = m.fs[k];
   if (now < st) break;
   const a = m.taps.a[k], v = m.taps.v[k];
   if (!((a || now >= st + win) && (v || now >= st + win + grace))) break;
   const d = m.seq[k].d, okA = a && a.d === d && a.rt <= C.winNet, okV = v && v.d === d && v.rt <= C.winNet;
   let w = '', why = 'none';
   if (okA && okV) {
    w = a.rt < v.rt ? 'a' : v.rt < a.rt ? 'v' : Math.random() < .5 ? 'a' : 'v';
    why = 'faster';
   } else if (okA) {
    w = 'a';
    why = v ? 'wrong' : 'tap';
   } else if (okV) {
    w = 'v';
    why = a ? 'wrong' : 'tap';
   } else if (a && a.d !== d && !(v && v.d !== d)) {
    w = 'v';
    why = 'wrong';
   } else if (v && v.d !== d && !(a && a.d !== d)) {
    w = 'a';
    why = 'wrong';
   }
   m.rs[k] = w;
   m.k = k;
   punch(sc, w === 'a' ? 'u' : w === 'v' ? 'c' : '', why, {
    ra: a ? a.rt : null,
    rv: v ? v.rt : null,
    da: a ? a.d : null,
    dv: v ? v.d : null,
    wrong: w === 'v' && a && a.d !== d ? a.d : null
   });
   send({
    t: 'f29r',
    id: m.id,
    k: k,
    w: w,
    ra: a ? a.rt : null,
    rv: v ? v.rt : null,
    da: a ? a.d : null,
    dv: v ? v.d : null
   });
   m.rk++;
  }
  if (m.rk >= m.seq.length) finish(sc, 'end');
 }
 function finish(sc, why) {
  const m = M;
  if (!m || m.ph === 'done') return;
  m.ph = 'done';
  m.why = why;
  m.lit = -1;
  if (m.p0) {
   sc.pairs.unshift(m.p0);
   m.p0 = null;
  }
  const p0 = sc.pairs[0], tie = why === 'dc' || why === 'cut' || m.u === m.c;
  m.res = tie ? 't' : m.u > m.c ? 'u' : 'c';
  if (!tie) {
   const w = m.res === 'u' ? 0 : 1;
   sc.winSide = w;
   p0.winner = p0[w];
   p0.loser = p0[1 - w];
  } else {
   p0.winner = null;
   p0.loser = null;
   p0.split = true;
   sc.capT = sc.t;
   sc.cap2 = 'DRAW - BOTH IN THE BOX';
  }
  sc.f29res = m.res;
  sc.f29U = m.u;
  sc.f29C = m.c;
  if (why !== 'cut') {
   sc.t = Math.max(sc.t, K('after'));
   sc.dur = sc.t + K('endDur');
  }
  if (m.online) send({
   t: 'f29e',
   id: m.id,
   a: m.u,
   v: m.c,
   res: m.res === 'u' ? 'a' : m.res === 'c' ? 'v' : 't',
   why: why
  });
  LOG.push({
   id: m.id,
   res: m.res,
   u: m.u,
   c: m.c,
   why: why
  });
 }
 function busy(sc) {
  return !!(M && M.sc === sc && M.role === 'a' && M.ph !== 'done');
 }
 function close(sc) {
  if (M && M.sc === sc && M.role === 'a' && M.ph !== 'done') finish(sc, 'cut');
 }
 function after(sc) {
  if (!sc || !sc.f29 || !sc.f29res) return;
  const G = game, V = V14(G), rec = V.fightLog[V.fightLog.length - 1] || {};
  rec.f29 = {
   u: sc.f29U,
   c: sc.f29C,
   res: sc.f29res,
   why: M && M.sc === sc ? M.why : null,
   log: M && M.sc === sc ? M.log.slice() : null
  };
  if (sc.f29res === 't') return;
  const p0 = sc.pairs[0], los = p0 && p0.loser;
  if (!los || !los.pl) return;
  const side = los.side === 0 ? 'U' : 'C';
  if (G.pen && G.pen.side !== side) {
   rec.f29.min = 'skip';
   return;
  }
  if (G.pen) {
   G.pen.left += C.minute;
   rec.f29.min = 'add';
   return;
  }
  G.pen = {
   side: side,
   who: los.pl,
   foul: 'FIGHTING',
   left: C.minute,
   at: G.q,
   f29: true
  };
  rec.f29.min = 'new';
  if (side === 'C') G.emo = G.emo || '3-3 EMO'; else G.md = G.md || 'ZONE ROTATE';
 }
 function hookNet() {
  const N = window.RLNET, L = N && N.link;
  if (!L || typeof L.onEvent !== 'function' || L.onEvent === L.__f29) return;
  const o = L.onEvent;
  const f = function(e) {
   if (e && typeof e.t === 'string' && e.t.slice(0, 3) === 'f29') {
    try {
     onNet(e);
    } catch (er) {
     console.error(er);
    }
    return;
   }
   return o.apply(this, arguments);
  };
  L.onEvent = f;
  L.__f29 = f;
 }
 function mapAt(e) {
  const N = RLNET, Cc = N.clockChoices ? N.clockChoices() : {};
  let best = null;
  const cand = (how, local, err) => {
   if (local != null && isFinite(local) && (!best || err < best.err)) best = {
    how: how,
    local: local,
    err: err
   };
  };
  if (Cc.ws && e.atW != null) cand('ws', e.atW - Cc.ws.off, Cc.ws.err + (e.wErr || 0));
  if (Cc.srv && e.atS != null) cand('server', e.atS - Cc.srv.off, Cc.srv.err + (e.sErr || 0));
  if (Cc.peer) cand('peer', e.at - Cc.peer.off, Cc.peer.err);
  if (!best || best.err > 320) {
   const ow = N.link && N.link.oneWay ? N.link.oneWay() : e.ow || 150;
   best = {
    how: 'arrival',
    local: wall() + Math.max(0, (e.lead || 1500) - ow),
    err: ow / 2
   };
  }
  return best;
 }
 function onNet(e) {
  const N = NET();
  if (!N) return;
  if (e.t === 'f29s') {
   if (!on() || N.auth) return;
   const seq = (e.seq || []).map(s => ({
    d: (s[0] | 0) & 3,
    gap: +s[1] || .5
   }));
   const b = mapAt(e);
   M = {
    id: e.id,
    role: 'v',
    online: true,
    seq: seq,
    ph: 'run',
    u: 0,
    c: 0,
    lit: -1,
    rs: {},
    mine: {},
    fb: null,
    res: null,
    log: [],
    fs: offs(seq, C.winNet).map(o => b.local + o),
    clk: b.how,
    clkErr: Math.round(b.err),
    t0: wall()
   };
   hbAt = 0;
   LOG.push({
    id: e.id,
    role: 'v',
    clk: b.how
   });
   return;
  }
  if (!M || e.id !== M.id) return;
  if (M.role === 'a') {
   M.heard = wall();
   if (e.t === 'f29t' && M.ph !== 'done' && (e.k | 0) === e.k && e.k >= 0 && e.k < M.seq.length && M.rs[e.k] === undefined && !M.taps.v[e.k]) {
    const rt = +e.rt;
    if (isFinite(rt) && rt >= 0) M.taps.v[e.k] = {
     d: (e.d | 0) & 3,
     rt: rt
    };
   }
   return;
  }
  if (e.t === 'f29r') {
   if (M.rs[e.k] !== undefined) return;
   M.rs[e.k] = e.w;
   const who = e.w === 'v' ? 'u' : e.w === 'a' ? 'c' : '';
   if (who === 'u') M.u++; else if (who === 'c') M.c++;
   const d = M.seq[e.k] ? M.seq[e.k].d : 0;
   M.log.push({
    k: e.k,
    d: d,
    who: who,
    rv: e.rv,
    ra: e.ra
   });
   M.fb = {
    d: d,
    who: who,
    wrong: who === 'c' && e.dv != null && e.dv !== d ? e.dv : null,
    at: performance.now()
   };
   return;
  }
  if (e.t === 'f29e') {
   M.ph = 'done';
   M.u = e.v | 0;
   M.c = e.a | 0;
   M.res = e.res === 'v' ? 'u' : e.res === 'a' ? 'c' : 't';
   M.why = e.why;
   M.lit = -1;
   LOG.push({
    id: M.id,
    role: 'v',
    res: M.res,
    u: M.u,
    c: M.c,
    why: e.why
   });
  }
 }
 function vTick() {
  const m = M, now = wall();
  if (m.ph !== 'done') {
   const k = curK(now);
   m.lit = k >= 0 && !m.mine[k] && m.rs[k] === undefined ? m.seq[k].d : -1;
  }
 }
 function geo() {
  const s = sa2403(), l = (s.l || 0) / SCALE, r = (s.r || 0) / SCALE, m = 6, gap = 6, bh = 40;
  const avail = W - l - r - 2 * m, bw = Math.min(64, Math.floor((avail - 3 * gap) / 4)), tot = bw * 4 + gap * 3, x0 = Math.round(l + m + (avail - tot) / 2);
  let y = H - 5 - bh;
  y -= sa2403Dy(y, bh);
  return [ 0, 1, 2, 3 ].map(i => ({
   x: x0 + i * (bw + gap),
   y: y,
   w: bw,
   h: bh
  }));
 }
 function mkEls() {
  if (els || typeof ui === 'undefined' || !ui) return els;
  els = DIRS.map((nm, i) => {
   const el = document.createElement('button');
   el.type = 'button';
   el.className = 'hb f29b';
   el.setAttribute('aria-label', 'FIGHT ' + nm);
   el.dataset.f29 = String(i);
   el.style.display = 'none';
   el.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    try {
     audioInit();
    } catch (e) {}
    tap(i);
   }, true);
   el.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
   }, true);
   ui.appendChild(el);
   return {
    el: el,
    st: ''
   };
  });
  return els;
 }
 let shown = false, drawnAt = 0;
 function visible() {
  return shown && performance.now() - drawnAt < 250;
 }
 function place(B) {
  mkEls();
  if (!els) return;
  B.forEach((b, i) => {
   const r = els[i], st = 'display:block;left:' + (b.x / W * 100).toFixed(3) + '%;top:' + (b.y / H * 100).toFixed(3) + '%;width:' + (b.w / W * 100).toFixed(3) + '%;height:' + (b.h / H * 100).toFixed(3) + '%';
   if (r.el.parentNode !== ui) ui.appendChild(r.el);
   if (r.st !== st) {
    r.el.style.cssText = st;
    r.st = st;
   }
  });
  shown = true;
  drawnAt = performance.now();
 }
 function hide() {
  if (!els || !shown) return;
  for (const r of els) {
   r.el.style.display = 'none';
   r.st = '';
  }
  shown = false;
 }
 setInterval(() => {
  if (shown && performance.now() - drawnAt > 200) hide();
  hookNet();
  const m = M, now = wall();
  if (m && m.role === 'v' && m.ph !== 'done' && NET() && now - m.t0 < 4e4 && now - hbAt > 400) {
   hbAt = now;
   send({
    t: 'f29h',
    id: m.id
   });
  }
 }, 120);
 window.addEventListener('keydown', ev => {
  if (!visible() || !M || M.ph === 'done') return;
  const i = {
   ArrowLeft: 0,
   ArrowUp: 1,
   ArrowDown: 2,
   ArrowRight: 3
  }[ev.key];
  if (i == null) return;
  ev.preventDefault();
  ev.stopPropagation();
  tap(i);
 }, true);
 function arrow(cx, cy, d, col) {
  for (let r = 0; r < 6; r++) {
   if (d === 1) rect(cx - r, cy - 6 + r, 2 * r + 1, 1, col); else if (d === 2) rect(cx - r, cy + 6 - r, 2 * r + 1, 1, col); else if (d === 0) rect(cx - 6 + r, cy - r, 1, 2 * r + 1, col); else rect(cx + 6 - r, cy - r, 1, 2 * r + 1, col);
  }
  if (d === 1) rect(cx - 2, cy, 5, 7, col); else if (d === 2) rect(cx - 2, cy - 6, 5, 7, col); else if (d === 0) rect(cx, cy - 2, 7, 5, col); else rect(cx - 6, cy - 2, 7, 5, col);
 }
 function drawUI(sc) {
  hookNet();
  const m = M, G = game;
  const act = !!(m && sc && sc.kind === 'fight' && (m.role === 'a' ? m.sc === sc : sc.f29 === m.id));
  if (!act) {
   hide();
   return false;
  }
  if (paused && m.ph !== 'done') {
   hide();
   return true;
  }
  if (m.role === 'v') {
   const L = RLNET && RLNET.link;
   if (!NET() || L && !L.connected) {
    hide();
    return false;
   }
   vTick();
  }
  const p = m.role === 'a' ? m.p0 || sc.pairs[0] : null;
  const nU = p && p[0].pl ? lastName(p[0].pl) : 'YOU', nC = p && p[1].pl ? lastName(p[1].pl) : 'THEM';
  const cx = W / 2;
  if (m.ph === 'done') {
   hide();
   const s = m.res === 'u' ? 'YOU WIN THE FIGHT ' + m.u + '-' + m.c : m.res === 'c' ? 'YOU LOSE THE FIGHT ' + m.u + '-' + m.c : m.why === 'dc' ? 'CONNECTION DROPPED - DRAW' : 'DRAW ' + m.u + '-' + m.c;
   const s2 = m.res === 't' ? 'BOTH IN THE BOX' : m.res === 'u' ? 'HE GETS AN EXTRA MINUTE' : 'YOUR GUY GETS AN EXTRA MINUTE';
   const w = Math.max(textW(s, 2), textW(s2)) + 12;
   rect(Math.round(cx - w / 2), 46, Math.round(w), 24, 'rgba(10,12,16,.85)');
   text(s, cx, 49, 2, m.res === 'u' ? '#7dff7a' : m.res === 'c' ? '#ff5a4a' : '#ffe14d', 'center', '#000');
   text(s2, cx, 62, 1, '#fff', 'center');
   return false;
  }
  const done = m.role === 'a' ? m.log.length : Object.keys(m.rs || {}).length;
  const head = 'YOU ' + m.u + ' - ' + m.c + ' THEM', nn = m.seq.length, sub = done >= nn ? '' : 'PUNCH ' + Math.min(nn, done + 1) + ' OF ' + nn + ' - TAP THE ARROW THAT LIGHTS UP';
  const w = Math.max(textW(head, 2), textW(sub)) + 12;
  rect(Math.round(cx - w / 2), 46, Math.round(w), 24, 'rgba(10,12,16,.85)');
  text(head, cx, 49, 2, '#ffe14d', 'center', '#000');
  text(sub, cx, 62, 1, '#cfe', 'center');
  const B = geo(), fb = m.fb && performance.now() - m.fb.at < C.fb * 1e3 ? m.fb : null;
  const myTap = m.online ? (() => {
   const now = wall(), k = curK(now), mine = m.role === 'a' ? m.taps.a : m.mine;
   return k >= 0 && mine[k] && m.rs[k] === undefined ? mine[k].d : -1;
  })() : -1;
  B.forEach((b, i) => {
   let bg = 'rgba(16,20,28,.78)', fg = '#8fa6b0', bd = '#3a4a55';
   if (m.lit === i) {
    const pl = Math.floor(performance.now() / 90) % 2;
    bg = pl ? '#ffe14d' : '#fff27a';
    fg = '#0b0f14';
    bd = '#ffffff';
   } else if (myTap === i) {
    bg = '#dfe8ee';
    fg = '#0b0f14';
    bd = '#ffffff';
   } else if (fb && fb.wrong === i) {
    bg = '#ff5a4a';
    fg = '#fff';
    bd = '#fff';
   } else if (fb && fb.d === i) {
    bg = fb.who === 'u' ? '#7dff7a' : fb.who === 'c' ? '#ff5a4a' : '#5a6670';
    fg = '#0b0f14';
    bd = '#fff';
   }
   rect(b.x - 1, b.y - 1, b.w + 2, b.h + 2, bd);
   rect(b.x, b.y, b.w, b.h, bg);
   arrow(Math.round(b.x + b.w / 2), Math.round(b.y + b.h / 2), i, fg);
  });
  if (fb && fb.who) text(fb.who === 'u' ? 'POW! YOU LAND IT' : fb.wrong != null ? 'WRONG ARROW - HE LANDS IT' : 'TOO SLOW - HE LANDS IT', cx, B[0].y - 9, 1, fb.who === 'u' ? '#7dff7a' : '#ff9a8a', 'center', '#000');
  place(B);
  return true;
 }
 function act(sc) {
  const m = M;
  return !!(m && sc && sc.kind === 'fight' && (m.role === 'a' ? m.sc === sc : sc.f29 === m.id));
 }
 return {
  C: C,
  DIRS: DIRS,
  on: on,
  start: start,
  tick: tick,
  tap: tap,
  after: after,
  busy: busy,
  close: close,
  ui: drawUI,
  cpuReact: cpuReact,
  hookNet: hookNet,
  onNet: onNet,
  geo: geo,
  LOG: LOG,
  act: act,
  st: () => {
   const m = M;
   if (!m) return null;
   return {
    id: m.id,
    role: m.role,
    online: m.online,
    ph: m.ph,
    k: m.k,
    lit: m.lit,
    u: m.u,
    c: m.c,
    res: m.res,
    why: m.why,
    cpuAt: m.cpuAt,
    log: m.log.slice(),
    seq: m.seq.map(s => s.d),
    gaps: m.seq.map(s => s.gap),
    shown: visible(),
    early: m.early || 0,
    clk: m.clk || null,
    fsIn: m.fs ? m.fs.map(t => Math.round(t - wall())) : null,
    fs: m.fs ? m.fs.map(Math.round) : null,
    rs: m.rs ? Object.assign({}, m.rs) : null
   };
  }
 };
}();

function injScene14(p, who, what, games, conc, afterKind) {
 const G = game, V = V14(G), side = side14(p);
 const vic = mkActor({
  x: p.x,
  y: p.y,
  pl: who
 }, side, {
  down: true,
  vic: true
 });
 vic.helm = !conc;
 if (conc) vic.helmFly = {
  x0: p.x,
  y0: p.y - 12,
  x1: p.x + (side === 0 ? -14 : 14) + r14(-3, 3),
  y1: p.y + r14(2, 6)
 };
 const sc = {
  kind: 'injury',
  conc: !!conc,
  dur: 6,
  actors: [ vic ],
  vic: vic,
  who: who,
  what: what,
  games: games,
  side: side,
  afterKind: afterKind,
  cx: clamp(p.x, 60, FL - 60),
  cy: p.y,
  chirps: []
 };
 for (const o of onField14(G)) {
  if (o.p === p || o.p.pl === who) continue;
  const a = mkActor(o.p, o.side);
  const kt = r14(.4, .9);
  if (conc && !window.__rl_no222c && !window.__rl_v124gb) {
   a.watch = true;
   a.face = p.x >= a.x ? 1 : -1;
  } else a.kneelAt = kt;
  sc.actors.push(a);
 }
 const bs = side === 0 ? 'u' : 'o';
 const tr = mkActor({
  x: coachX(bs) + (side === 0 ? 10 : -10),
  y: H - 4,
  pl: null
 }, side, {
  trainer: true,
  spd: 40,
  kit: {
   jersey: '#f4f4f4',
   trim: '#d8342c',
   helm: '#d8342c'
  },
  skin: 2
 });
 tr.home = [ tr.x, tr.y ];
 sc.tr = tr;
 sc.actors.push(tr);
 sc.chirpSide = side === 0 ? 'o' : 'u';
 if (!conc && window.GHO16 && GHO16.on() && (homeTeam().gho16 || window.V28 && V28.stGho())) sc.gho16 = 1; else if (!conc && window.V28 && V28.injKind) {
  const k28 = V28.injKind();
  if (k28) sc.st28 = k28;
 }
 V.injScenes++;
 SFX.whistle();
 sceneStart(sc);
 return sc;
}

function injTick14(sc, dt) {
 if (sc.gho16 && window.GHO16 && GHO16.zTick(sc)) return;
 if (sc.st28 && window.V28 && V28.zTick(sc)) return;
 const t = sc.t, v = sc.vic, tr = sc.tr;
 for (const a of sc.actors) if (a.kneelAt != null && t >= a.kneelAt) {
  a.kneel = true;
  a.tx = a.x;
  a.ty = a.y;
 }
 if (sc.conc && v.helmFly && !v.helmLanded && t >= .55) {
  v.helmLanded = true;
  const V = V14(game), pal = RL12.palette(v.kit, v.skin || 0);
  V.gear.push({
   type: 'helm',
   x: Math.round(v.helmFly.x1),
   y: Math.round(v.helmFly.y1),
   col: pal.H,
   col2: pal.h,
   side: v.side,
   conc: true
  });
 }
 for (const ct of [ 1, 3.5 ]) if (t >= ct && !sc.chirps.includes(ct)) {
  sc.chirps.push(ct);
  const k = say14('faking_it', clamp(coachX(sc.chirpSide) + (sc.chirpSide === 'u' ? 20 : -20), Math.round(camX) + 50, Math.round(camX) + W - 50), H - 40);
  if (k) V14(game).fakeClips.push(k);
 }
 if (t >= 1.1 && t < 3) {
  tr.tx = v.x + (v.side === 0 ? -6 : 6);
  tr.ty = v.y;
  tr.face = tr.tx > tr.x ? 1 : -1;
  if (!sc.trSpd) {
   sc.trSpd = true;
   tr.spd = Math.max(40, Math.hypot(tr.tx - tr.x, tr.ty - tr.y) / 1.5);
  }
 }
 if (t >= 3 && !sc.up) {
  sc.up = true;
  v.down = false;
  v.helped = true;
 }
 if (t >= 3.4) {
  const hx = tr.home[0], hy = Math.min(tr.home[1], FB - 2);
  tr.tx = hx;
  tr.ty = hy;
  v.tx = hx + (v.side === 0 ? 7 : -7);
  v.ty = hy;
  v.spd = 26;
  tr.spd = 26;
  v.face = tr.face = hx > v.x ? 1 : -1;
 }
 if (t >= 4.4 && !sc.cardT) sc.cardT = t;
}

function injDone14(sc) {
 const G = game, V = V14(G);
 if (sc.conc && !sc.vic.helmLanded) {
  const v = sc.vic, pal = RL12.palette(v.kit, v.skin || 0);
  V.gear.push({
   type: 'helm',
   x: Math.round(v.helmFly.x1),
   y: Math.round(v.helmFly.y1),
   col: pal.H,
   col2: pal.h,
   side: v.side,
   conc: true
  });
  v.helmLanded = true;
 }
 if (!sc.chirps.length) {
  const k = say14('faking_it', null, null);
  if (k) V.fakeClips.push(k);
 }
 G.injBanner = {
  txt: sc.conc ? 'CONCUSSION' : 'INJURY',
  sub: lastName(sc.who) + ' - ' + sc.what + ' - ' + sc.games,
  t: sc.skipped ? 0 : 1.2,
  team: sc.side
 };
 for (const a of sc.actors) if (a.src && a.src.down > 0 && a.vic) a.src.down = 0;
 if (sc.afterKind === 'fightBall') {
  const f = G.v14AfterConc || {
   win: 0,
   wn: ''
  };
  G.v14AfterConc = null;
  screen = sc.back;
  return fightBall14(f.win, f.wn, f.brawl);
 }
 if (sc.afterKind) {
  screen = 'banner';
  if (G.banner) G.banner.v14roll = true;
  return afterBanner();
 }
}

function concussionStart(p, by, afterKind, fromFight) {
 const G = game, V = V14(G);
 if (!p || !p.pl) return false;
 if (window.V17 && G.g17 && V17.concBlock(p)) return false;
 const who = p.pl, side = side14(p), teamId = side === 0 ? G.user : G.opp;
 if (!window.__rl_v124gb) V.fightPend = null;
 G.concOut = G.concOut || [];
 if (!G.concOut.includes(who.id)) G.concOut.push(who.id);
 const sub = subFor(side, who.id);
 if (sub && G.players.includes(p)) p.pl = PP(sub);
 if (G.players.includes(p)) {
  p.down = 0;
  p.kb = null;
  p.stun = .6;
 }
 let games = 'OUT FOR THE REST OF THE GAME';
 if (G.mode === 'season' && season) {
  injAdd(season, teamId, who.id, {
   what: 'CONCUSSION',
   g: 1,
   sev: 'OUT REST OF GAME + 1 GAME',
   conc: true
  }, true);
  LS.set('season', season);
  games = 'OUT REST OF GAME + NEXT GAME';
 }
 V.conc.push({
  pid: who.id,
  side: side,
  t: +(+G.t || 0).toFixed(2),
  q: G.q,
  why: fromFight ? 'fight' : 'hit',
  sub: sub || null
 });
 injScene14(p, who, 'CONCUSSION', games, true, afterKind);
 return true;
}

const COACH_FIRST = [ 'Mike', 'Dave', 'Tony', 'Rick', 'Bill', 'Gary', 'Joe', 'Pat', 'Kevin', 'Steve', 'Brian', 'Sean', 'Rob', 'Chris', 'Dan', 'Frank', 'Hank', 'Jim' ];

const COACH_LAST = [ 'Kowalski', 'McNulty', 'Brennan', 'Delgado', 'Haskins', 'Thornton', 'Ruggiero', 'Fitzgerald', 'Whitaker', 'Pappas', 'Callahan', 'Sorensen', 'Duffy', 'Marchetti', 'Okafor', 'Lindqvist', 'Barrett', 'Hollis' ];

const COACH_STYLES = [ [ 'FACEOFF GURU', 'fo', 4, '+4 FACEOFF - WIN THE X' ], [ 'D-FIRST GRINDER', 'def', 3, '+3 DEFENSE - LOCK IT DOWN' ], [ 'RUN-AND-GUN', 'spd', 3, '+3 SPEED - PUSH TRANSITION' ], [ 'SHOOTING COACH', 'acc', 3, '+3 ACCURACY - PICK CORNERS' ], [ 'GOALIE WHISPERER', 'sav', 4, '+4 SAVES - HOT GOALIE' ], [ 'GROUND BALL GUY', 'gb', 3, '+3 GROUND BALLS - 50/50S ARE OURS' ], [ 'POWER GUY', 'pow', 3, '+3 SHOT POWER - RIP IT' ], [ 'STICK WIZARD', 'stk', 3, '+3 STICK SKILL - CLEAN HANDS' ], [ 'OLD-SCHOOL HITTER', 'str', 3, '+3 STRENGTH - HIT EVERYTHING' ] ];

function genCoaches() {
 const st = COACH_STYLES.slice(), out = [];
 for (let i = 0; i < 3; i++) {
  const s = st.splice(Math.floor(R14() * st.length), 1)[0];
  out.push({
   n: pick14(COACH_FIRST) + ' ' + pick14(COACH_LAST),
   style: s[0],
   k: s[1],
   v: s[2],
   line: s[3]
  });
 }
 return out;
}

function coachName14(S, teamId) {
 return S && S.team === teamId && S.coach ? S.coach.n : T(teamId).coach || 'THE COACH';
}

function seasonInit14(S) {
 if (!S) return;
 if (S.coach == null) {
  const c = LS.get('v14coach', null);
  if (c) S.coach = c;
 }
 if (S.punchWk == null) {
  const n = (S.rounds || []).length, lo = Math.floor(n * .35), hi = Math.max(lo, Math.floor(n * .65));
  const first = !LS.get('v14punchN', 0) && !LS.get('v14punchSched', false);
  if (S.phase !== 'reg' || n < 2) S.punchWk = -1; else if (first || R14() < 1 / 3) {
   S.punchWk = Math.min(n - 1, Math.max(S.week, lo + Math.floor(R14() * (hi - lo + 1))));
   if (first) LS.set('v14punchSched', true);
  } else S.punchWk = -1;
  S.punchFirst = !!first;
 }
 S.stats = S.stats || {};
 S.dev = S.dev || {};
 S.ovr0 = S.ovr0 || {};
 mig2301(S);
 mig2313(S);
 try {
  window.PRAC18_SKIP = true;
  for (const id of teamRosterIds(S.team, 'season')) if (S.ovr0[id] == null && PP(id)) S.ovr0[id] = curOvr14(id, S);
 } finally {
  window.PRAC18_SKIP = false;
 }
}

function boostFor14(S) {
 if (!S) return null;
 const out = {};
 let any = false;
 const pb18 = !window.PRAC18_SKIP && typeof window.prac18Boost === 'function' ? window.prac18Boost(S) : null;
 for (const id of teamRosterIds(S.team, 'season')) {
  const d = S.dev && S.dev[id] || 0, c = S.coach, pb = pb18 ? pb18[id] || 0 : 0;
  if (!d && !(c && c.k) && !pb) continue;
  const o = {};
  if (d || pb) for (const k of SKILLS) o[k] = d + pb;
  if (c && c.k) o[c.k] = (o[c.k] || 0) + c.v;
  out[id] = o;
  any = true;
 }
 return any ? out : null;
}

function curOvr14(id, S) {
 const p = PP(id);
 if (!p) return 0;
 const b = boostFor14(S || season), bo = b && b[id];
 if (!bo) return p.ovr;
 const pb = !window.PRAC18_SKIP && typeof window.prac18Boost === 'function' ? (window.prac18Boost(S || season) || {})[id] || 0 : 0;
 const r = {};
 for (const k of SKILLS) r[k] = p.r[k] + (bo[k] || 0) - pb;
 return ovrOf({
  pos: p.pos,
  r: r
 }) + pb;
}

function punchStart(afterKind) {
 const G = game, S = season, V = V14(G);
 const cx0 = coachX('u'), cy0 = H - 2;
 const refs = (G.refs || []).slice();
 const ref = refs.slice().sort((a, b) => Math.abs(a.x - cx0) - Math.abs(b.x - cx0))[0] || {
  x: cx0 + 40,
  y: FB - 20,
  anim: 0
 };
 const coach = {
  x: cx0,
  y: cy0,
  tx: clamp(ref.x - 7, 20, FL - 20),
  ty: clamp(ref.y, FT + 20, FB - 4),
  spd: 30,
  coach: true,
  face: 1,
  anim: 0,
  kit: G.uk,
  skin: pickSkin('coach-' + T(G.user).id),
  side: 0
 };
 const sc = {
  kind: 'punch',
  dur: 5.2,
  actors: [],
  coach: coach,
  ref: ref,
  refs: refs,
  refStart: refs.map(r => [ r.x, r.y ]),
  afterKind: afterKind,
  cx: clamp((cx0 + ref.x) / 2, 60, FL - 60),
  cy: FB - 30,
  oldCoach: coachName14(S, G.user),
  pows: []
 };
 V.punch++;
 G.punchN = (G.punchN || 0) + 1;
 if (S) {
  S.punchDone = true;
  S.punchGame = S.week;
  LS.set('v14punchN', LS.get('v14punchN', 0) + 1);
  LS.set('season', S);
 }
 say14('coach_ref', clamp(cx0, Math.round(camX) + 50, Math.round(camX) + W - 50), H - 40);
 sceneStart(sc);
 return sc;
}

function punchTick(sc, dt) {
 const t = sc.t, c = sc.coach, r = sc.ref;
 if (t > .3 && t < 2) {
  const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
  if (d > .5) {
   const s = Math.min(d, 44 * dt);
   c.x += dx / d * s;
   c.y += dy / d * s;
   c.anim += s;
  }
  c.face = dx >= 0 ? 1 : -1;
 }
 if (t >= 2 && !sc.hit) {
  sc.hit = true;
  sc.hitT = t;
  r.v14down = true;
  r.downT = t;
  sc.pows.push({
   x: (c.x + r.x) / 2,
   y: r.y - 12,
   t: t,
   big: true
  });
  sfx12('hit_big', .7);
  sfx12('crowd_cheer_big', .5);
  SFX.whistle();
 }
 if (t > 2.6) sc.refs.forEach((q, i) => {
  if (q === r) return;
  const s0 = sc.refStart[i], k = clamp((t - 2.6) / 1.4, 0, 1);
  q.x = s0[0] + (c.x + (i % 2 ? 8 : -8) - s0[0]) * k;
  q.y = s0[1] + (c.y - 2 - s0[1]) * k;
  q.anim += dt * 40;
 });
 if (t > 3.8) {
  const hx = coachX('u'), d = hx - c.x;
  c.x += clamp(d, -26 * dt, 26 * dt);
  c.face = d >= 0 ? 1 : -1;
  c.anim += 26 * dt;
 }
}

function punchDone(sc) {
 const G = game;
 if (sc.ref) {
  sc.ref.v14down = false;
 }
 if (!sc.hit) {
  sc.hit = true;
 }
 G.coachPick = {
  old: sc.oldCoach,
  opts: genCoaches(),
  afterKind: sc.afterKind
 };
 screen = 'coachPick';
 panelDirty();
}

function coachChoose(i) {
 const G = game, S = season, cp = G && G.coachPick;
 if (!cp) return;
 const c = cp.opts[+i] || cp.opts[0];
 if (S) {
  S.coach = {
   n: c.n,
   style: c.style,
   k: c.k,
   v: c.v,
   line: c.line,
   since: S.week
  };
  S.coachLog = (S.coachLog || []).concat([ {
   fired: cp.old,
   hired: c.n,
   wk: S.week
  } ]);
  LS.set('season', S);
  LS.set('v14coach', S.coach);
 }
 BOOST = boostFor14(S);
 G.coachPick = null;
 G.coachHired = c.n;
 addFx('cue', 0, 0, {
  s: 'NEW HEAD COACH: ' + c.n.toUpperCase(),
  col: '#ffe14d',
  life: 1.8
 });
 if (cp.afterKind && G.banner) {
  screen = 'banner';
  G.banner.v14roll = true;
  return afterBanner();
 }
 screen = 'banner';
 if (G.banner) {
  G.banner.v14roll = true;
  return afterBanner();
 }
 setupPossession();
}

function renderCoachPick() {
 const G = game, cp = G && G.coachPick;
 if (!cp) return '<div class="hd"><div class="tt">COACH FIRED</div></div>';
 const opts = cp.opts.map((c, i) => '<button type="button" class="slot" style="flex:1;min-height:64px;margin:3px" data-a="coachPick" data-v="' + i + '" aria-label="HIRE ' + esc(c.n.toUpperCase()) + '"><small>' + esc(c.style) + '</small><b>' + esc(c.n.toUpperCase()) + '</b><br><small style="color:#7dff7a">' + esc(c.line) + '</small></button>').join('');
 return '<div class="hd"><div><div class="tt" style="color:#ff5a4a">COACH FIRED</div><div class="st">' + esc(String(cp.old).toUpperCase()) + ' DECKED A REF. HE IS DONE. PICK YOUR NEW HEAD COACH:</div></div></div>' + '<div style="display:flex;gap:4px;width:100%">' + opts + '</div>';
}

function seasonGame14(S, G) {
 if (!S || !G || G.mode !== 'season' || G.tutorial) return;
 const V = V14(G);
 S.stats = S.stats || {};
 S.dev = S.dev || {};
 S.ovr0 = S.ovr0 || {};
 mig2301(S);
 mig2313(S);
 const played = new Set(V.lu0 || []);
 const lu = G.lu && G.lu[0];
 if (lu) for (const id of [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ]) if (id) played.add(id);
 for (const id in V.box) played.add(id);
 for (const id of played) {
  if (!PP(id)) continue;
  if (S.ovr0[id] == null) {
   try {
    window.PRAC18_SKIP = true;
    S.ovr0[id] = curOvr14(id, S);
   } finally {
    window.PRAC18_SKIP = false;
   }
  }
  const s = S.stats[id] || (S.stats[id] = blankStats()), b = V.box[id] || {};
  s.gp++;
  for (const k of STAT_KEYS) s[k] += b[k] || 0;
  const p = PP(id);
  let sc = 0;
  if (p.pos === 'G') {
   if ((b.sa || 0) >= 5) sc = (b.sv || 0) / b.sa >= .6 ? 3 : (b.sv || 0) / b.sa < .42 ? -2 : 0;
  } else sc = 2 * (b.g || 0) + 1.5 * (b.a || 0) + .6 * (b.gb || 0) + 1.2 * (b.ct || 0) + .25 * (b.fow || 0) - .4 * ((b.fot || 0) - (b.fow || 0)) - .8 * (b.to || 0) - .6 * (b.pen || 0);
  const d = sc >= 3 ? 1 : sc <= -1.5 ? -1 : 0;
  if (d) S.dev[id] = clamp((S.dev[id] || 0) + d, -5, 5);
 }
 S.gp14 = (S.gp14 || 0) + 1;
 S.concLog = (S.concLog || []).concat(V.conc.map(c => ({
  team: c.side === 0 ? G.user : G.opp,
  pid: c.pid,
  wk: S.week,
  live: true
 })));
 S.fightLog = (S.fightLog || []).concat(V.fightLog.map(f => ({
  kind: f.kind,
  win: f.win,
  wk: S.week
 })));
}

function concSim14(S, teamId) {
 if (!S || !S.rosters || !S.rosters[teamId] || teamId === S.team || !V14ON()) return;
 S.simConcGames = (S.simConcGames || 0) + 1;
 if (R14() >= CONC.sim) return;
 const lu = lineupFor(teamId, 'season'), ids = [ ...lu.A, ...lu.M, ...lu.D, lu.LSM, lu.SSDM, lu.SSDM2 ].filter(id => id && !injOf(id));
 if (!ids.length) return;
 const pid = ids[Math.floor(R14() * ids.length)];
 injAdd(S, teamId, pid, {
  what: 'CONCUSSION',
  g: 1,
  sev: 'OUT 1 GAME',
  conc: true
 }, false);
 S.concLog = (S.concLog || []).concat([ {
  team: teamId,
  pid: pid,
  wk: S.week,
  sim: true
 } ]);
}

const ST_COLS = [ [ 'n', 'PLAYER' ], [ 'pos', 'POS' ], [ 'ovr', 'OVR' ], [ 'gp', 'GP' ], [ 'g', 'G' ], [ 'a', 'A' ], [ 'pts', 'PTS' ], [ 'sh', 'SH' ], [ 'shp', 'SH%' ], [ 'gb', 'GB' ], [ 'to', 'TO' ], [ 'ct', 'CT' ], [ 'pen', 'PEN' ], [ 'fo', 'FO' ], [ 'fop', 'FO%' ], [ 'sv', 'SV' ], [ 'svp', 'SV%' ] ];

function statRows14(S) {
 S = S || season;
 if (!S) return [];
 const ids = teamRosterIds(S.team, 'season');
 return ids.map(id => {
  const p = PP(id), s = S.stats && S.stats[id] || blankStats(), ovr = curOvr14(id, S), o0 = S.ovr0 && S.ovr0[id] != null ? S.ovr0[id] : p.ovr, j = injOf(id);
  return {
   id: id,
   n: p.n,
   ln: lastName(p),
   pos: p.pos,
   ovr: ovr,
   ovr0: o0,
   arrow: ovr > o0 ? 1 : ovr < o0 ? -1 : 0,
   gp: s.gp,
   g: s.g,
   a: s.a,
   pts: s.g + s.a,
   sh: s.sh,
   shp: s.sh ? Math.round(100 * s.g / s.sh) : null,
   gb: s.gb,
   to: s.to,
   ct: s.ct,
   pen: s.pen,
   fow: s.fow,
   fot: s.fot,
   fo: s.fot ? s.fow + '-' + (s.fot - s.fow) : '-',
   fop: s.fot ? Math.round(100 * s.fow / s.fot) : null,
   sv: s.sv,
   sa: s.sa,
   svp: s.sa ? Math.round(100 * s.sv / s.sa) : null,
   inj: j ? {
    g: j.g,
    g0: j.g0 || j.g,
    what: j.what,
    conc: !!j.conc
   } : null
  };
 });
}

function sortStats14(rows, key, asc) {
 const v = r => key === 'n' ? r.ln : key === 'fo' ? r.fow : r[key];
 return rows.slice().sort((a, b) => {
  const x = v(a), y = v(b);
  if (x == null && y == null) return 0;
  if (x == null) return 1;
  if (y == null) return -1;
  const c = typeof x === 'string' ? x.localeCompare(y) : x - y;
  return asc ? c : -c;
 });
}

function renderStats() {
 const S = season;
 if (!S) return '<div class="hd"><div class="tt">NO SEASON</div></div>';
 const key = PS.stSort || 'pts', asc = !!PS.stAsc, rows = sortStats14(statRows14(S), key, asc), tm = T(S.team);
 const arrow = a => a > 0 ? '<span class="up14" style="display:inline-block;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:6px solid #3fe05a;margin-left:2px"></span>' : a < 0 ? '<span class="dn14" style="display:inline-block;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid #ff4a3a;margin-left:2px"></span>' : '';
 const pct = v => v == null ? '-' : v + '%';
 const bar = j => {
  if (!j) return '';
  const left = j.g >= 99 ? 1 : clamp(j.g / Math.max(1, j.g0), 0, 1), lab = j.g >= 99 ? 'SEASON' : j.g + 'G';
  return '<div class="rec14" data-g="' + j.g + '" title="' + esc(j.what) + '" style="display:inline-block;vertical-align:middle;width:30px;height:5px;background:#333;margin-left:3px;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:' + Math.round((1 - left) * 100) + '%;background:#3fe05a"></div></div><small style="color:' + (j.conc ? '#ffb14d' : '#ff9a8a') + '"> ' + (j.conc ? 'CONC ' : 'INJ ') + lab + '</small>';
 };
 const th = ST_COLS.map(([k, lab]) => '<th data-a="stSort" data-v="' + k + '" class="' + (k === 'n' ? 'n ' : '') + 'sort14' + (k === key ? ' on' : '') + '" style="cursor:pointer' + (k === key ? ';color:#ffe14d' : '') + '">' + lab + (k === key ? asc ? '&#8593;' : '&#8595;' : '') + '</th>').join('');
 const body = rows.map(r => '<tr data-pid="' + r.id + '"><td class="n">' + esc(r.ln) + ' <span class="num15" style="color:#8fe3f0">#' + esc(jerseyNo(PP(r.id), 'season')) + '</span>' + bar(r.inj) + '</td><td>' + r.pos + '</td><td class="ovr14" data-arrow="' + r.arrow + '">' + r.ovr + arrow(r.arrow) + '</td><td>' + r.gp + '</td><td>' + r.g + '</td><td>' + r.a + '</td><td><b>' + r.pts + '</b></td><td>' + r.sh + '</td><td>' + pct(r.shp) + '</td><td>' + r.gb + '</td><td>' + r.to + '</td><td>' + r.ct + '</td><td>' + r.pen + '</td><td>' + r.fo + '</td><td>' + pct(r.fop) + '</td><td>' + (r.pos === 'G' ? r.sv : '-') + '</td><td>' + (r.pos === 'G' ? pct(r.svp) : '-') + '</td></tr>').join('');
 const coach = S.coach ? 'HEAD COACH: ' + esc(S.coach.n.toUpperCase()) + ' (' + esc(S.coach.style) + ')' : coachLine(tm);
 return teamHead(tm, 'SEASON STATS  -  ' + coach, btn('BACK', 'stBack', null, 'g')) + '<div class="note">TAP A COLUMN TO SORT  -  OVR ARROW = UP / DOWN SINCE THE SEASON STARTED  -  BAR = RECOVERY (GAMES LEFT)</div>' + '<div class="scroll" id="statList"><table class="st14" style="font-size:9px"><tr>' + th + '</tr>' + body + '</table></div>';
}

function drawGear() {
 const G = game, V = G && G.v14;
 if (!V || !V.gear.length) return;
 V.gear = V.gear.filter(it => it.fade181 == null || menuT - it.fade181 < .8);
 for (const it of V.gear) {
  const x = Math.round(it.x), y = Math.round(it.y);
  g.globalAlpha = it.fade181 == null ? 1 : clamp(1 - (menuT - it.fade181) / .8, 0, 1);
  if (it.type === 'helm') {
   rect(x - 3, y - 2, 6, 4, '#0d0d0d');
   rect(x - 2, y - 2, 4, 3, it.col);
   rect(x - 2, y - 2, 4, 1, 'rgba(255,255,255,.35)');
   rect(x + 1, y - 1, 2, 2, '#c8c8c8');
   px(x + 2, y, '#7a7a7a');
   rect(x - 2, y + 1, 5, 1, 'rgba(0,0,0,.25)');
  } else {
   rect(x - 1, y - 1, 3, 3, '#0d0d0d');
   rect(x - 1, y - 1, 2, 2, it.col);
   px(x + 1, y, it.col2 || it.col);
  }
 }
 g.globalAlpha = 1;
 G.gearFrames = (G.gearFrames || 0) + 1;
}

function actorFrame14(a, t) {
 if (a.down) return a.helm ? 'f14_downH' : 'f14_downN';
 if (a.kneel) return a.helm ? 'f14_kneelH' : 'f14_kneelN';
 if (a.moving && a.helm && a.gloves) return 'f14_runH';
 const p = t - a.punchT < .16 ? 1 : 0;
 return 'f14_' + (a.helm ? 'H' : 'N') + (a.gloves ? 'G' : 'B') + p;
}

function drawActor14(a, t) {
 if (a.coach || a.trainer) {
  const fr = a.trainer ? a.moving ? RL12.frame('coach_idle', t * 4, 4) : 'coach_idle0' : a.punching ? 'coach_point' : a.moving ? RL12.frame('coach_cheer', t, 6) : 'coach_idle0';
  scaled12(a.x, a.y, () => coachDraw18(g, fr, a.x, a.y, a.kit, a.face > 0, {
   skin: a.skin || 0
  }, a.coach && !a.trainer && a.side === 0 ? coachLook18('u') : null));
  return;
 }
 let n = actorFrame14(a, t);
 if (a.pl && a.pl.gho16 && window.GHO16 && GHO16.on()) n = GHO16.hairFrame(n);
 const bob = a.moving && !a.down ? Math.floor(a.anim / 3) % 2 : 0;
 scaled12(a.x, a.y - bob, () => RL12.draw(g, n, a.x, a.y - bob, a.kit, a.face > 0, {
  skin: a.skin || 0
 }));
 if (a.pl && !a.trainer && !a.bench && tagQ) tagQ.set({
  pl: a.pl
 }, [ a.x, a.y ]);
 a._fr = n;
}

function drawScene() {
 const G = game, sc = G.scene;
 if (!sc) return;
 const t = sc.t;
 const list = (sc.actors || []).slice();
 if (sc.kind === 'punch') list.push(sc.coach);
 if (sc.kind === 'fight' && sc.watch) list.push(...sc.watch);
 list.sort((p, q) => p.y - q.y);
 if (sc.gho16 && window.GHO16) GHO16.zDrawUnder(sc);
 if (sc.st28 && window.V28) V28.zDrawUnder(sc);
 for (const a of list) {
  if (a.gone16) continue;
  if (a.sink16) {
   g.globalAlpha = Math.max(0, 1 - a.sink16);
   drawActor14(a, t);
   g.globalAlpha = 1;
  } else drawActor14(a, t);
 }
 if (sc.gho16 && window.GHO16) GHO16.zDraw(sc);
 if (sc.st28 && window.V28) V28.zDraw(sc);
 if (sc.kind === 'punch') {
  const r = sc.ref;
  if (r && r.v14down) {
   const k = clamp((t - r.downT) / .25, 0, 1);
   g.save();
   g.translate(Math.round(r.x), Math.round(r.y));
   g.rotate(-Math.PI / 2 * k);
   g.translate(-Math.round(r.x), -Math.round(r.y));
   drawRef(r, false);
   g.restore();
   for (let i = 0; i < 3; i++) {
    const a2 = t * 5 + i * 2.1;
    px(Math.round(r.x - 10 + Math.cos(a2) * 4), Math.round(r.y - 6 + Math.sin(a2) * 2), '#ffe14d');
   }
  }
  sc.coach.punching = sc.hit && t - sc.hitT < .5;
 }
 if (sc.kind === 'injury' && sc.conc && sc.vic.helmFly && !sc.vic.helmLanded) {
  const f = sc.vic.helmFly, k = clamp(t / .55, 0, 1), x = f.x0 + (f.x1 - f.x0) * k, y = f.y0 + (f.y1 - f.y0) * k - Math.sin(k * Math.PI) * 18;
  const pal = RL12.palette(sc.vic.kit, 0);
  rect(Math.round(x) - 3, Math.round(y) - 2, 6, 4, '#0d0d0d');
  rect(Math.round(x) - 2, Math.round(y) - 2, 4, 3, pal.H);
 }
 for (const pw of sc.pows || []) {
  const e = t - pw.t, life = pw.big ? .5 : .22;
  if (e < 0 || e > life) continue;
  const r = (pw.big ? 6 : 3) * (.6 + e / life);
  for (let i = 0; i < 8; i++) {
   const a = i / 8 * 6.283;
   px(Math.round(pw.x + Math.cos(a) * r), Math.round(pw.y + Math.sin(a) * r * .7), i % 2 ? '#ffe14d' : '#ffffff');
  }
  rect(Math.round(pw.x) - 1, Math.round(pw.y) - 1, 3, 3, '#ffffff');
 }
 G.sceneFrames = (G.sceneFrames || 0) + 1;
}

function drawSceneUI() {
 const G = game, sc = G && G.scene;
 if (!sc) return;
 const t = sc.t, cx = W / 2;
 let cap = '', sub = '';
 if (sc.kind === 'fight') {
  cap = sc.brawl ? 'BRAWL!' : 'FIGHT!';
  sub = sc.cap2 || (sc.brawl ? sc.cap : 'GLOVES ARE OFF');
 } else if (sc.kind === 'injury') {
  cap = sc.conc ? 'HE IS SHAKEN UP' : 'PLAYER DOWN';
  sub = sc.conc ? 'HELMET CAME OFF - TRAINER IS OUT' : 'EVERYBODY TAKES A KNEE';
 } else if (sc.kind === 'punch') {
  cap = sc.hit ? 'COACH DECKED THE REF!' : 'COACH IS STORMING THE FIELD!';
  sub = sc.hit ? 'HE IS GONE. EJECTED.' : String(sc.oldCoach || '').toUpperCase();
 }
 const w = Math.max(textW(cap) * 2, textW(sub)) + 12;
 rect(Math.round(cx - w / 2), 20, Math.round(w), 22, 'rgba(10,12,16,.82)');
 text(cap, cx, 23, 2, sc.kind === 'injury' ? '#ffe14d' : '#ff5a4a', 'center', '#000');
 text(sub, cx, 34, 1, '#fff', 'center');
 if (sc.kind === 'injury' && sc.cardT) {
  const k = clamp((t - sc.cardT) / .3, 0, 1), cw = 150, ch = 34, x = Math.round(cx - cw / 2), y = Math.round(H / 2 - 10 + (1 - k) * 20);
  rect(x, y + 2, cw, ch, '#000');
  rect(x, y, cw, ch, '#ff5a4a');
  rect(x + 2, y + 2, cw - 4, ch - 4, '#1a1f28');
  text(sc.what, cx, y + 5, 2, '#ffe14d', 'center', '#000');
  text(lastName(sc.who), cx, y + 18, 1, '#fff', 'center');
  text(sc.games, cx, y + 25, 1, '#ff9a8a', 'center');
  G.injCardFrames = (G.injCardFrames || 0) + 1;
 }
 if (window.F29 && F29.ui(sc)) return;
 button('SKIP', W - 66, H - 34, 62, 30, () => sceneSkip(), {
  bg: '#ffe14d',
  sc: 2
 });
}

const OUT14 = {
 r: 16 * 448 / 80,
 mid: 3,
 cor: 6.3,
 pMid: [ .95, .97 ],
 pCor: [ .7, .74 ],
 far: 110,
 farAdd: .03
};

function aimSave14(a, cy, gk) {
 const i = a.lvl >= 5 ? 1 : 0, off = Math.abs(cy - CY);
 const k = clamp((off - OUT14.mid) / (OUT14.cor - OUT14.mid), 0, 1), s = k * k * (3 - 2 * k);
 let p = OUT14.pMid[i] + (OUT14.pCor[i] - OUT14.pMid[i]) * s;
 if (a.d > OUT14.far) p += OUT14.farAdd;
 if (a.two) p *= TP26.a14;
 p -= .03 * a.acc + .02 * a.pow;
 p = clamp(p, .6, .99);
 const zone = off >= OUT14.cor - 1 ? 'corner' : off < OUT14.mid ? 'mid' : 'between';
 if (game) {
  game.v14shotZone = zone;
  (game.aimLog = game.aimLog || []).push({
   zone: zone,
   off: +off.toFixed(2),
   p: +p.toFixed(3)
  });
 }
 return {
  p: p,
  zone: zone
 };
}

const SAFE18 = {
 fails: 0,
 lastSave: -99,
 recov: 0
};

function err18(err, where) {
 try {
  if (menuT - SAFE18.lastSave < 2) return;
  SAFE18.lastSave = menuT;
  LS.set('err18', {
   v: 'V21',
   where: where,
   scr: screen,
   msg: String(err && err.message || err).slice(0, 200),
   stack: String(err && err.stack || '').split('\n').slice(0, 5).join(' | ').slice(0, 600),
   at: Date.now()
  });
 } catch (e) {}
}

function safe18(stepOk) {
 const G = game;
 if (stepOk) {
  SAFE18.fails = 0;
  if (G && !G.tutorial && !G.online && screen === 'live') try {
   ctl18(G);
  } catch (e) {
   console.error(e);
  }
  return;
 }
 if (!G || G.tutorial || G.online || window.__rl_v124gb) return;
 if (++SAFE18.fails < 20) return;
 SAFE18.fails = 0;
 SAFE18.recov++;
 G.recov18 = (G.recov18 || 0) + 1;
 try {
  if (typeof r26DemoteAll === 'function') r26DemoteAll(G);
 } catch (e) {}
 try {
  if (screen === 'live') {
   const c = G.carrier;
   setupPossession(c ? c.x : null, c ? c.y : null);
   addFx('cue', 0, 0, {
    s: 'PLAY ON!',
    col: '#7dff7a',
    life: 1
   });
  } else if (screen === 'defense') {
   const c = G.dcar || G.ball;
   startDefense({
    x: clamp(c ? c.x : MIDX - 60, DGX + 40, MIDX - 20),
    y: clamp(c ? c.y : CY, FT + 16, FB - 8)
   });
  } else if (screen === 'banner') afterBanner();
 } catch (e) {
  console.error(e);
  err18(e, 'recover');
 }
}

function ctl18(G) {
 if (screen === 'live') {
  if (G.ctrl && !G.players.includes(G.ctrl)) {
   G.ctrl = null;
   G.ctl18 = (G.ctl18 || 0) + 1;
  }
  return;
 }
 if (screen !== 'defense') return;
 const b = G.ball, ref = G.dcar || b;
 if (G.dctl && !G.players.includes(G.dctl)) {
  G.dctl = ref ? nearestTo('O', ref.x, ref.y) : null;
  G.ctl18 = (G.ctl18 || 0) + 1;
 }
 const d = G.dctl;
 if (d && d.r26 && G.run && G.run.x < -.35 && d.x <= MIDX + 6) {
  let best = null, bd = 1e9;
  const t = ref || d;
  for (const p of G.players) {
   if (p.team !== 'O' || p.r26 || p.down > 0 || p === d) continue;
   const k = Math.hypot(p.x - t.x, p.y - t.y);
   if (k < bd) {
    bd = k;
    best = p;
   }
  }
  if (best) {
   const run = G.run;
   G.dctl = best;
   G.dSwAt = G.t;
   G.dSwT = 0;
   G.run = run;
   G.hand18 = (G.hand18 || 0) + 1;
   G.no26 = G.t + 3;
  }
 }
}

let last = now();

function frame() {
 const t = now();
 let dt = Math.min(.05, t - last);
 last = t;
 uiSpecs = [];
 if (VS.scr && screen !== VS.scr && screen !== 'vsRoster') VS.scr = null;
 g.setTransform(RR, 0, 0, RR, 0, 0);
 g.imageSmoothingEnabled = false;
 g.clearRect(0, 0, W, H);
 g.globalAlpha = 1;
 if (portrait) dt = 0;
 menuT += dt;
 watchScreen();
 let stepOk = true;
 try {
  step(s26() ? dt * SHOT26.slow() : dt);
 } catch (err) {
  stepOk = false;
  console.error(err);
  err18(err, 'step');
 }
 try {
  render();
 } catch (err) {
  console.error(err);
  err18(err, 'render');
 }
 safe18(stepOk);
 try {
  syncUI();
 } catch (err) {
  console.error(err);
 }
 try {
  syncPanel();
 } catch (err) {
  console.error(err);
 }
 ctx.imageSmoothingEnabled = false;
 ctx.clearRect(0, 0, cv.width, cv.height);
 ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, cv.width, cv.height);
 requestAnimationFrame(frame);
}

function step(dt) {
 step2317(dt);
 try {
  if (game && game.players) dedupe2317(game);
 } catch (e) {
  console.error(e);
 }
 try {
  tp35(game, dt);
 } catch (e) {
  console.error(e);
 }
}

const TP35 = {
 G: null,
 scr: '',
 m: new Map,
 n: 0,
 px: 0,
 max: 0,
 frames: 0
};

function tp35on(G) {
 return !window.__rl_no35tp && !window.__rl_v124gb && !!G && !!G.players && !G.online && !G.tutorial && !G.brave && (screen === 'live' || screen === 'defense');
}

function tp35key(p) {
 return p && p.pl && p.pl.id != null ? (p.team === 'O' || p.team === 'G2' || p.team === 'U' ? 'u:' : 'c:') + p.pl.id : null;
}

function tp35cap(p) {
 const gk = p.gk || p.team === 'G' || p.team === 'G2' || p.role === 'G';
 return (PACE.run * DODGE.splitSpd + 9) * Math.max(1, spdMul(p)) * (gk ? 1.3 : 1);
}

function tp35(G, dt) {
 const on = tp35on(G), ok = on && TP35.G === G && (TP35.scr === 'live' || TP35.scr === 'defense') && dt > 0 && dt <= .1;
 const nm = new Map;
 if (on) {
  const ex = ok ? new Set([ G.carrier, G.dcar, G.ctrl, G.dctl, G.dclear && G.dclear.holder ].filter(Boolean)) : null;
  for (const p of G.players.concat(G.farU || [], G.farC || [])) {
   const k = tp35key(p);
   if (!k) continue;
   const q = ok ? TP35.m.get(k) : null;
   if (q && !ex.has(p)) {
    const dx = p.x - q[0], dy = p.y - q[1], d = Math.hypot(dx, dy);
    let cap = tp35cap(p) * dt + .2;
    if (p.kb && p.kb.t > -dt) cap += Math.hypot(p.kb.vx || 0, p.kb.vy || 0) * dt;
    if (d > cap) {
     p.x = q[0] + dx / d * cap;
     p.y = q[1] + dy / d * cap;
     TP35.n++;
     TP35.px += d - cap;
     TP35.max = Math.max(TP35.max, d - cap);
     G.tp35 = (G.tp35 || 0) + 1;
    }
   }
   if (!nm.has(k)) nm.set(k, [ p.x, p.y ]);
  }
  if (ok) TP35.frames++;
 }
 TP35.m = nm;
 TP35.G = G;
 TP35.scr = on ? screen : '';
}

function step2317(dt) {
 if ((screen === 'playmaker' || screen === 'pmSave') && PM && !paused) pmTick(dt);
 if (!game || paused) return;
 if (tutAsk && game.tutorial) return;
 const G = game;
 if (screen === 'scene') {
  sceneTick(dt);
  return;
 }
 if (!GAME_SCREENS.includes(screen)) return;
 const clock0 = G.clock;
 if (screen === 'live' || screen === 'defense') joyTick();
 G.t += dt;
 G.crowd = Math.max(0, G.crowd - dt);
 G.ripple = Math.max(0, G.ripple - dt * .8);
 for (const f of fx) f.t += dt;
 fx = fx.filter(f => f.t < (f.life || .5));
 pelletTick(dt);
 if (screen === 'live') {
  if (!(G.tutorial && (TUT_CARDS.includes(G.tutorial.step) || G.tutorial.step === 10) && !G.tutorial.complete)) updateLive(dt);
 } else if (screen === 'faceoff') {
  if (!tutFoHold18()) updateFaceoff(dt);
 } else if (screen === 'banner') {
  G.bannerT += dt;
  const b = G.ball;
  if (b && b.state === 'net') {
   const n1 = b.vx > 0 && b.net181;
   b.x = b.vx < 0 ? Math.max(DGX - 7, b.x + b.vx * dt) : Math.min(n1 ? n1[0] : GX + 7, b.x + b.vx * dt);
   if (n1) b.y += (n1[1] - b.y) * Math.min(1, dt * 8); else b.y += b.vy * dt * .2;
  }
  if (G.bannerT > (G.bannerAuto || 1.9)) {
   G.bannerAuto = 0;
   afterBanner();
  }
 } else if (screen === 'cpu') updateCpu(dt); else if (screen === 'defense') updateDefense(dt); else if (screen === 'qbreak') {
  G.qT += dt;
  if (G.qT > 3) startFaceoff(true);
 } else if (screen === 'pregame') {
  G.preT += dt;
  if (G.preT >= 99 || G.coin && G.coin.online && G.coin.phase !== 'done') {
   if (coinOn15(G)) coinTick15(G, dt); else if (walkOn2314(G)) walkTick2314(G, dt); else startFaceoff(true);
  }
 } else if (screen === 'final') {
  G.finalT += dt;
  if (G.celeb && !G.celeb.done) celebTick15(G, dt);
 }
 if (game === G && (screen === 'live' || screen === 'defense')) {
  overTick(dt);
  if (game === G && (screen === 'live' || screen === 'defense')) {
   dodgeTick(dt);
   injuryTick(dt);
  }
  momTick(dt);
  if (screen === 'live') {
   holdTick();
   bullHoldTick();
   callPickTick(dt);
  }
  foulTick(dt);
  if (screen === 'live' && game === G) playTick(dt);
  if (game === G) clrTick(dt);
  if (game === G && (screen === 'live' || screen === 'defense')) v14Tick(dt);
 }
 if (G.tutorial && game === G) tutTick(dt);
 if (game === G) chirpTick();
 if (game === G && G.players && G.players.length) updateRefs(G, dt);
 if (G.pen && game === G) {
  const run = G.ot ? screen === 'live' || screen === 'cpu' || screen === 'defense' ? dt : 0 : Math.max(0, clock0 - G.clock);
  G.pen.left -= run;
  if (G.pen.left <= 0) penaltyOver('time');
 }
 let target = FL - W + PADW;
 if (screen === 'faceoff' || screen === 'pregame' || screen === 'qbreak') target = G.fo && G.fo.phase === 'scrum' && screen === 'faceoff' ? G.ball.x - W / 2 : MIDX - W / 2;
 if (screen === 'banner' && G.banner && (G.banner.kind === 'fowin' || G.banner.kind === 'folose')) target = G.ball.x - W / 2;
 if (screen === 'cpu') target = clamp(G.ball.x - W * .55, 0, FL - W);
 if (huddleOn()) target = MIDX - W / 2;
 if (screen === 'live' && G.clearing) target = Math.min(target, G.ball.x - W * .22);
 if (screen === 'live' && G.tutorial && G.tutorial.step === 8) target = MIDX - W * .42;
 if (screen === 'defense' && G.ball && G.ball.state === 'clear') target = clamp(G.ball.x - W * .28, 0, FL - W); else if (screen === 'defense' || screen === 'banner' && G.banner && (G.banner.kind === 'cgoal' || G.banner.kind === 'flag' || G.banner.kind === 'rturn' || G.banner.kind === 'rturnU') && G.ball && G.ball.x < MIDX) target = clamp(G.ball.x - W * .45, 0, FL - W);
 if (G.camHold != null) target = G.camHold;
 target = clamp(target, 0, FL - W + PADW);
 camX += (target - camX) * Math.min(1, dt * 4);
}

const CATCH = {
 r0: 6,
 r1: 16,
 poor: 40,
 elite: 95,
 openLo: .91,
 openHi: .98,
 contLo: .6,
 contHi: .9
};

function catchOdds(p, defTeam) {
 let nd = 99;
 for (const d of game.players) if (d.team === defTeam && !(d.down > 0) && d !== p) nd = Math.min(nd, Math.hypot(d.x - p.x, d.y - p.y));
 const cov = clamp((CATCH.r1 - nd) / (CATCH.r1 - CATCH.r0), 0, 1);
 let stk0 = p.pl && p.pl.r ? p.pl.r.stk : 70;
 if (window.V17) stk0 = V17.catchStk(p, stk0);
 const s = clamp((stk0 - CATCH.poor) / (CATCH.elite - CATCH.poor), 0, 1);
 const open = CATCH.openLo + (CATCH.openHi - CATCH.openLo) * s, cont = CATCH.contLo + (CATCH.contHi - CATCH.contLo) * s;
 const o17 = {
  p: open + (cont - open) * cov,
  cov: cov,
  nd: nd,
  s: s
 };
 return window.V17 && game.g17 ? V17.catchAdj(p, o17) : o17;
}

const TEWA1401 = {
 base: .5,
 stk: .35,
 def: .03,
 lo: .2,
 hi: .8,
 get off() {
  return !!window.__rl_tewa1400;
 }
};

function tewaCheck1401(p, o) {
 if (TEWA1401.off || DF.level !== 5 || !(o.cov > 0)) return null;
 let d = null, nd = 99;
 for (const q of game.players) if (q.team === 'D' && !(q.down > 0) && q !== p) {
  const k = Math.hypot(q.x - p.x, q.y - p.y);
  if (k < nd) {
   nd = k;
   d = q;
  }
 }
 if (!d) return null;
 const pc = clamp(TEWA1401.base - TEWA1401.stk * (o.s - .5) + TEWA1401.def * clamp(pr(d, 'def'), -1.5, 1.5), TEWA1401.lo, TEWA1401.hi);
 const keep = o.p + (1 - pc - o.p) * o.cov;
 return {
  p: keep,
  pc: pc,
  d: d
 };
}

const GLV = {
 r: CREASE + 13,
 p: .5,
 inCrease: CREASE
};

function goalieLevelVerdict(gk, p, gx) {
 return fromBehind(gk, p, facingOf(p, gx)) ? 'behind' : 'legal';
}

function goalieLevelChance(gk) {
 return GLV.p * clamp(1 + .12 * rf(gk && gk.pl, 'sav'), .7, 1.3);
}

function goalieLevel(p, gk, gx, live) {
 const G = game;
 if (!gk || !p || Math.hypot(p.x - gx, p.y - CY) > GLV.r) return false;
 {
  const b = G.ball, fx = b && b.fromX != null ? b.fromX : b && b.from ? b.from.x : null;
  if (fx != null && (live ? fx >= gx : fx <= gx)) {
   G.gkLevelX = (G.gkLevelX || 0) + 1;
   return false;
  }
 }
 if (gk.down > 0 || gk.stun > 0 || Math.hypot(gk.x - (gx + (live ? -5 : 5)), gk.y - CY) > GLV.inCrease) return false;
 const mates = G.players.filter(q => q.team === (live ? 'D' : 'O') && !(q.down > 0) && Math.hypot(q.x - p.x, q.y - p.y) < 6);
 if (mates.length) return false;
 G.gkLevelTries = (G.gkLevelTries || 0) + 1;
 if (Math.random() >= goalieLevelChance(gk)) return false;
 const verdict = goalieLevelVerdict(gk, p, gx);
 G.gkLevelLog = G.gkLevelLog || [];
 G.gkLevelLog.push({
  side: live ? 'C' : 'U',
  verdict: verdict,
  t: +(G.t || 0).toFixed(2)
 });
 if (verdict === 'behind') {
  G.gkLevelBehind = (G.gkLevelBehind || 0) + 1;
  return false;
 }
 voice12('goalie_level', clamp(gk.x, Math.round(camX) + 60, Math.round(camX) + W - 60), gk.y - 32, 0, true);
 G.gkLevelChirps = (G.gkLevelChirps || 0) + 1;
 knockDown(p, gk);
 gk.hitT0 = menuT;
 G.gkLevels = (G.gkLevels || 0) + 1;
 if (!live) G.gkLevelsU = (G.gkLevelsU || 0) + 1;
 const b = G.ball, a = Math.atan2(p.y - gk.y, p.x - gk.x) + rnd(-.8, .8), v = rnd(40, 58);
 if (live) popLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'level'); else dPopLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'level');
 glvAnim(gk, p);
 p.dropT = G.t + 1;
 return true;
}

const GLA = {
 load: .1,
 lunge: .48,
 reach: 10,
 down: 1.45,
 kb: 14,
 flash: .3,
 shake: .3,
 amp: 2
};

function glvAnim(gk, p) {
 const G = game, dx = p.x - gk.x, dy = p.y - gk.y, L = Math.hypot(dx, dy) || 1;
 gk.lvl = {
  t0: menuT,
  ux: dx / L,
  uy: dy / L
 };
 p.down = GLA.down;
 p.downT0 = GLA.down;
 p.stun = GLA.down;
 p.fallDir = dx >= 0 ? 1 : -1;
 p.kb = {
  vx: dx / L * GLA.kb / HIT.kbT,
  vy: dy / L * GLA.kb / HIT.kbT,
  t: HIT.kbT
 };
 G.lvlFx = {
  x: (gk.x + p.x) / 2 + dx / L * 2,
  y: (gk.y + p.y) / 2 - 8,
  t0: menuT
 };
 G.shakeT0 = menuT;
 G.glvAnims = (G.glvAnims || 0) + 1;
}

function glvOff(gk) {
 const L = gk && gk.lvl;
 if (!L) return null;
 const e = menuT - L.t0;
 if (e < 0 || e >= GLA.lunge) return null;
 const k = e < GLA.load ? 0 : e < .2 ? (e - GLA.load) / (.2 - GLA.load) : e < .3 ? 1 : 1 - (e - .3) / (GLA.lunge - .3);
 return {
  ox: L.ux * GLA.reach * k - (e < GLA.load ? L.ux * 2 : 0),
  oy: L.uy * GLA.reach * k * .6,
  fr: e < GLA.load ? 'g_outlet0' : 'g_outlet1',
  lean: e < GLA.load ? -.12 : .3 * Math.min(1, k * 1.5),
  e: e
 };
}

function glvShake() {
 const G = game;
 if (!G || G.shakeT0 == null) return [ 0, 0 ];
 const e = menuT - G.shakeT0;
 if (e < 0 || e >= GLA.shake) return [ 0, 0 ];
 const a = GLA.amp * (1 - e / GLA.shake);
 return [ Math.round(Math.sin(e * 90) * a), Math.round(Math.cos(e * 70) * a * .6) ];
}

function drawLvlFx() {
 const G = game, F = G && G.lvlFx;
 if (!F) return;
 const e = menuT - F.t0;
 if (e < .12 || e >= .12 + GLA.flash) return;
 const k = (e - .12) / GLA.flash, r = Math.round(3 + k * 6), x = Math.round(F.x), y = Math.round(F.y);
 g.globalAlpha = 1 - k * .8;
 for (let i = 0; i < 8; i++) {
  const a = i * Math.PI / 4 + .3;
  for (let s = Math.max(1, r - 3); s <= r; s++) px(x + Math.round(Math.cos(a) * s), y + Math.round(Math.sin(a) * s * .8), i % 2 ? '#ffe14d' : '#ffffff');
 }
 rect(x - 1, y - 1, 3, 3, '#ffffff');
 g.globalAlpha = 1;
 G.lvlFxFrames = (G.lvlFxFrames || 0) + 1;
}

function v13Catch(p, mode) {
 const G = game;
 if (!V13ON() || !G || G.tutorial || !p || CATCH.off) return false;
 const live = mode === 'live', b = G.ball;
 const gk = live ? G.goalie : G.players.find(q => q.team === 'G2');
 if (gk && goalieLevel(p, gk, live ? GX : DGX, live)) return true;
 const o = catchOdds(p, live ? 'D' : 'O'), tw = live ? tewaCheck1401(p, o) : null, ok = Math.random() < (tw ? tw.p : o.p);
 G.catchLog = G.catchLog || [];
 G.catchLog.push([ +o.cov.toFixed(2), ok ? 1 : 0, live ? 'U' : 'C', +o.s.toFixed(2) ]);
 if (tw) {
  G.tewaLog = G.tewaLog || [];
  G.tewaLog.push([ +o.cov.toFixed(2), ok ? 0 : 1, +o.s.toFixed(2), +tw.pc.toFixed(3) ]);
 }
 if (ok) return false;
 if (tw) {
  const d = tw.d, a = Math.atan2(p.y - d.y, p.x - d.x || .01) + rnd(-.8, .8), v = rnd(32, 50);
  G.tewaChecks = (G.tewaChecks || 0) + 1;
  p.dropT = G.t + .6;
  addFx('txt', p.x, p.y - 28, {
   s: 'CHECKED!',
   col: '#ff9a8a',
   life: .9
  });
  if (G.playRun && !G.playRun.done) {
   endPlayRun();
   G.playBroken = (G.playBroken || 0) + 1;
   addFx('cue', 0, 0, {
    s: 'CHECKED - PLAY BROKEN. SET IT AGAIN.',
    col: '#ff9a8a',
    life: 1.4
   });
  }
  popLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'drop');
  return true;
 }
 const f = b.from || p, a = Math.atan2(p.y - f.y, p.x - f.x || .01) + rnd(-.9, .9), v = rnd(30, 48);
 G.drops = (G.drops || 0) + 1;
 p.dropT = G.t + .6;
 addFx('txt', p.x, p.y - 28, {
  s: 'DROPPED!',
  col: '#ff9a8a',
  life: .9
 });
 if (live && G.playRun && !G.playRun.done) {
  endPlayRun();
  G.playBroken = (G.playBroken || 0) + 1;
  addFx('cue', 0, 0, {
   s: 'DROPPED - PLAY BROKEN. SET IT AGAIN.',
   col: '#ff9a8a',
   life: 1.4
  });
 }
 if (live) popLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'drop'); else dPopLoose(b.x, b.y, Math.cos(a) * v, Math.sin(a) * v, 'drop');
 return true;
}

const RIDE = {
 deep: 30,
 mid: 10,
 gkSpd: 46,
 sprint: 62,
 cdX: 14,
 faceOff: 6
};

const RIDE_NAMES = [ '10-MAN RIDE', 'STANDARD RIDE' ];

function rideCall(side) {
 const G = game;
 if (!G) return '10-MAN RIDE';
 if (side !== 'U') return '10-MAN RIDE';
 const v = G.rideU_call || '10-MAN RIDE';
 return RIDE_NAMES.includes(v) || rideCustomPlays().some(p => p.id === v) ? v : '10-MAN RIDE';
}

function rideOn(side) {
 const G = game;
 return V13ON() && !!G && !G.tutorial && rideCall(side) === '10-MAN RIDE';
}

function setRide(v) {
 const G = game;
 if (!G) return;
 G.rideU_call = RIDE_NAMES.includes(v) || rideCustomPlays().some(p => p.id === v) ? v : '10-MAN RIDE';
 LS.set('ride', G.rideU_call);
}

function rideAlive(x) {
 const G = game;
 return !!x && (G.players.includes(x) || (G.farU || []).includes(x) || (G.farC || []).includes(x));
}

function rideStep(key, active, deep, mid, find, gkHome) {
 const G = game;
 let R = G[key];
 if (R && R.phase !== 'done' && (!rideAlive(R.gk) || !rideAlive(R.cd))) {
  G[key] = R = null;
 }
 if (!active && (!R || R.phase === 'done')) {
  G[key] = null;
  return null;
 }
 if (!R && active && deep) {
  const f = find();
  if (f && f.gk && f.mk && f.cd) {
   R = G[key] = {
    phase: 'out',
    gk: f.gk,
    mk: f.mk,
    cd: f.cd,
    mode: f.mode,
    t0: G.t
   };
   G.rideLog = G.rideLog || [];
   G.rideLog.push({
    side: key === 'rideU' ? 'U' : 'C',
    mode: f.mode,
    t: +(G.t || 0).toFixed(2)
   });
  }
 }
 if (!R) return null;
 if (R.phase === 'out' && (!active || mid)) {
  R.phase = 'back';
  R.tBack = G.t;
  G.rideSprints = (G.rideSprints || 0) + 1;
 }
 if (R.phase === 'back' && Math.hypot(R.gk.x - gkHome[0], R.gk.y - gkHome[1]) < 2.5) {
  R.phase = 'done';
  R.tHome = G.t;
 }
 return R;
}

function rideMarks(riders, targets, b) {
 const used = new Set, out = new Map;
 const rs = riders.slice().sort((p, q) => Math.hypot(p.x - b.x, p.y - b.y) - Math.hypot(q.x - b.x, q.y - b.y));
 for (const r of rs) {
  let best = null, bd = 1e9;
  for (const t of targets) {
   if (used.has(t)) continue;
   const d = Math.hypot(t.x - r.x, t.y - r.y);
   if (d < bd) {
    bd = d;
    best = t;
   }
  }
  if (best) {
   used.add(best);
   const dx = b.x - best.x, dy = b.y - best.y, L = Math.hypot(dx, dy) || 1;
   out.set(r, {
    m: best,
    x: best.x + dx / L * RIDE.faceOff,
    y: best.y + dy / L * RIDE.faceOff
   });
  }
 }
 return out;
}

function rideGkTarget(R, live, gx) {
 if (R.phase === 'out') {
  const s = gx < MIDX ? -1 : 1;
  return [ clamp(R.mk.x + s * 7, gx < MIDX ? DGX + 8 : MIDX + 8, gx < MIDX ? MIDX - 8 : GX - 8), R.mk.y + (CY - R.mk.y) * .15, RIDE.gkSpd ];
 }
 return [ gx < MIDX ? DGX + 5 : GX - 5, CY, RIDE.sprint ];
}

function rideTick(scr) {
 const G = game, b = G.ball;
 if (!G || !b) return;
 if (scr === 'defense') {
  rideXTick();
  const gk2 = G.players.find(p => p.team === 'G2');
  rideStep('rideU', rideOn('U') && !!G.cpuClear && b.state !== 'shot', b.x > MIDX + RIDE.deep, b.x <= MIDX + RIDE.mid, () => {
   const atk = dAtk().filter(a => a !== G.dcar && rrOf(a) === 'A' && a.x < MIDX).sort((p, q) => Math.hypot(p.x - DGX, p.y - CY) - Math.hypot(q.x - DGX, q.y - CY));
   for (const mk of atk) {
    const cd = dDef().find(d => d.mark === mk && d !== G.dctl && !(d.down > 0));
    if (cd) return {
     gk: gk2,
     mk: mk,
     cd: cd,
     mode: 'near'
    };
   }
   return null;
  }, [ DGX + 5, CY ]);
  const gkC = (G.farC || []).find(f => f.role === 'G');
  rideStep('rideC', rideOn('C') && b.state === 'clear' && !!gkC, b.x < MIDX - RIDE.deep, b.x >= MIDX - RIDE.mid, () => {
   const ups = (G.farU || []).filter(f => f.role === 'A' || f.role === 'R').sort((p, q) => Math.hypot(p.x - GX, p.y - CY) - Math.hypot(q.x - GX, q.y - CY));
   const ds = (G.farC || []).filter(f => f.role === 'D');
   for (const mk of ups) {
    const cd = ds.find(d => d.mk === mk) || ds[0];
    if (cd) return {
     gk: gkC,
     mk: mk,
     cd: cd,
     mode: 'far'
    };
   }
   return null;
  }, [ GX - 5, CY ]);
 } else if (scr === 'live') {
  if (G.rideC && G.rideC.mode !== 'live') G.rideC = null;
  const gk = G.goalie;
  rideStep('rideC', rideOn('C') && !!G.clearing && !!gk, b.x < MIDX - RIDE.deep, b.x >= MIDX - RIDE.mid, () => {
   const ups = G.players.filter(p => p.team === 'O' && p !== G.carrier && rrOf(p) === 'A' && p.x > MIDX).sort((p, q) => Math.hypot(p.x - GX, p.y - CY) - Math.hypot(q.x - GX, q.y - CY));
   for (const mk of ups) {
    const cd = G.players.find(d => d.team === 'D' && d.mark === mk && !(d.down > 0));
    if (cd) return {
     gk: gk,
     mk: mk,
     cd: cd,
     mode: 'live'
    };
   }
   return null;
  }, [ GX - 5, CY ]);
 }
}

let _cpRaw = null, _cpVal = [];

function customPlays(cat) {
 let raw = null;
 try {
  raw = localStorage.getItem('rl_plays');
 } catch (e) {}
 if (raw !== _cpRaw) {
  _cpRaw = raw;
  _cpVal = playsAll();
 }
 return _cpVal.filter(p => pmCat(p) === cat && !p.builtin && !p.ride && !p.dcall && Array.isArray(p.start) && p.start.length >= 10);
}

const F10_SLOTS = {
 G: [ 0 ],
 D: [ 1, 2, 3 ],
 M: [ 4, 5, 6 ],
 A: [ 7, 8, 9 ]
};

function f10Spot(q, role) {
 let x = clamp(q[0], 10, ENDX - 6), y = clamp(q[1], FT + 12, FB - 4);
 if (role === 'A') x = Math.max(x, MIDX + 6); else if (role === 'D' || role === 'G') x = Math.min(x, MIDX - 6);
 return [ x, y ];
}

function f10Assign(list, spots) {
 const used = new Set, out = new Map;
 const near = (o, cands) => {
  let best = -1, bd = 1e9;
  for (const i of cands) {
   const d = Math.hypot(spots[i][0] - o.x, spots[i][1] - o.y);
   if (d < bd) {
    bd = d;
    best = i;
   }
  }
  return best;
 };
 const pairs = [];
 for (const it of list) for (const i of F10_SLOTS[it.role] || []) if (spots[i]) pairs.push([ Math.hypot(spots[i][0] - it.o.x, spots[i][1] - it.o.y) - (it.first ? 1e5 : 0), it, i ]);
 pairs.sort((a, b) => a[0] - b[0]);
 for (const [, it, i] of pairs) {
  if (out.has(it.o) || used.has(i)) continue;
  out.set(it.o, i);
  used.add(i);
 }
 for (const it of list) {
  if (out.has(it.o)) continue;
  const i = near(it.o, spots.map((_, k) => k).filter(k => !used.has(k)));
  if (i >= 0) {
   out.set(it.o, i);
   used.add(i);
  }
 }
 return out;
}

function farRole(f) {
 return f.role === 'A' || f.role === 'R' ? 'A' : f.role === 'G' ? 'G' : f.role === 'D' ? 'D' : 'M';
}

function myTen() {
 const G = game, out = [];
 for (const p of G.players) {
  if (p.team === 'G2') out.push({
   o: p,
   role: 'G'
  }); else if (p.team === 'O') out.push({
   o: p,
   role: p.gk ? 'G' : (p.rr || rrOf(p)) === 'A' ? 'A' : (p.rr || rrOf(p)) === 'D' ? 'D' : 'M'
  });
 }
 for (const f of G.farU || []) out.push({
  o: f,
  role: farRole(f)
 });
 return out;
}

function rideCustomPlays() {
 return customPlays('RIDES');
}

function rideCustom() {
 const G = game;
 if (!G || !V13ON() || G.tutorial) return null;
 const v = G.rideU_call;
 if (!v || RIDE_NAMES.includes(v)) return null;
 return rideCustomPlays().find(p => p.id === v) || null;
}

function rideXTick() {
 const G = game, b = G.ball, pl = rideCustom();
 if (!pl || screen !== 'defense' || !G.cpuClear || !b || b.state === 'shot' || b.x < MIDX - 6) {
  G.rideX = null;
  G.rideXA = null;
  return null;
 }
 const ten = myTen(), sig = G.players.length + ':' + (G.farU || []).length + ':' + G.possCount;
 if (!G.rideXA || G.rideXA.sig !== sig || G.rideXA.pl !== pl.id || ten.some(t => !G.rideXA.map.has(t.o))) G.rideXA = {
  sig: sig,
  pl: pl.id,
  map: f10Assign(ten, pl.start)
 };
 const m = new Map, deep = b.x > MIDX + RIDE.mid;
 for (const t of ten) {
  const i = G.rideXA.map.get(t.o);
  if (i == null || !pl.start[i]) continue;
  if (t.role === 'G' && !deep) continue;
  const q = pl.start[i], sx = q[0] + (b.x - q[0]) * .18, sy = q[1] + (b.y - q[1]) * .22;
  m.set(t.o, f10Spot([ sx, sy ], t.role));
 }
 G.rideX = m;
 G.rideXFrames = (G.rideXFrames || 0) + 1;
 G.rideXName = pl.name;
 return m;
}

function clrPlays() {
 return customPlays('CLEAR');
}

function clrSel() {
 const G = game;
 if (!G || !G.clrSel) return null;
 return clrPlays().find(p => p.id === G.clrSel) || null;
}

function clrSelect(id) {
 const G = game;
 if (!G) return false;
 G.clrSel = id && clrPlays().some(p => p.id === id) ? id : null;
 LS.set('clrSel', G.clrSel);
 if (!G.clrSel) clrEnd();
 return true;
}

function clrCtx() {
 const G = game;
 if (!G || G.tutorial || !V13ON()) return null;
 const b = G.ball;
 if (!b) return null;
 if (screen === 'defense' && b.state === 'clear' && G.dclear && G.dclear.holder) return 'd';
 if (screen === 'live' && G.clearing && G.carrier && b.state === 'held' && b.x < MIDX + 6) return 'l';
 return null;
}

function clrHolder() {
 const G = game;
 return clrCtx() === 'd' ? G.dclear.holder : G.carrier;
}

function clrBtnState() {
 const G = game;
 if (!G || !clrSel()) return null;
 const S = G.cset;
 if (S) return S.phase === 'set' ? 'SETTING' : S.phase === 'ready' ? clrCtx() ? 'RUN' : 'SETTING' : 'RUNNING';
 return clrCtx() ? 'SET' : null;
}

function clrRoutes(pl) {
 const r = pl.start.map(() => []);
 for (const s of pl.steps || []) if ((s.t === 'move' || s.t === 'pick') && r[s.p] && typeof s.x === 'number') r[s.p].push([ s.x, s.y ]);
 return r;
}

function clrSet() {
 const G = game, pl = clrSel(), ctx = clrCtx();
 if (!pl || !ctx) return false;
 const h = clrHolder(), ten = myTen().map(t => Object.assign(t, {
  first: t.o === h
 }));
 const map = f10Assign(ten, pl.start), routes = clrRoutes(pl), slots = [];
 for (const t of ten) {
  const i = map.get(t.o);
  if (i == null) continue;
  const id = t.o.pl && t.o.pl.id;
  slots.push({
   id: id,
   o: t.o,
   role: t.role,
   i: i,
   spot: f10Spot(pl.start[i], t.role),
   route: routes[i].map(q => f10Spot(q, t.role)),
   ri: 0,
   rt: 0
  });
 }
 G.cset = {
  pl: pl,
  phase: 'set',
  t: 0,
  slots: slots,
  poss: G.possCount
 };
 G.clrSets = (G.clrSets || 0) + 1;
 addFx('cue', 0, 0, {
  s: 'SET: ' + pl.name,
  col: '#ff9a4a',
  life: 1.2
 });
 SFX.tap();
 return true;
}

function clrGo() {
 const G = game, S = G.cset;
 if (!S || S.phase !== 'ready' || !clrCtx()) return false;
 S.phase = 'run';
 S.rt = 0;
 G.clrRuns = (G.clrRuns || 0) + 1;
 addFx('cue', 0, 0, {
  s: 'RUN: ' + S.pl.name,
  col: '#7dff7a',
  life: 1.2
 });
 SFX.whistle();
 return true;
}

function clrEnd() {
 const G = game, S = G && G.cset;
 if (!S) return;
 for (const sl of S.slots) {
  const o = clrFind(sl);
  if (!o) continue;
  o.clrT = null;
  if (!o.far) {
   o.playT = null;
   o.playHold = null;
   o.clrFast = false;
  }
 }
 G.cset = null;
}

function clrFind(sl) {
 const G = game;
 if (sl.o && (G.players.includes(sl.o) || (G.farU || []).includes(sl.o))) return sl.o;
 if (!sl.id) return null;
 const o = G.players.find(p => (p.team === 'O' || p.team === 'G2') && p.pl && p.pl.id === sl.id) || (G.farU || []).find(f => f.pl && f.pl.id === sl.id) || null;
 if (o) sl.o = o;
 return o;
}

function clrTick(dt) {
 const G = game, S = G && G.cset;
 if (!S) return;
 const b = G.ball, ctx = clrCtx(), inFlight = screen === 'defense' && b && b.state === 'pass' && b.clear;
 if (!clrSel() || !ctx && !inFlight && !(screen === 'live' && G.clearing) || screen !== 'live' && screen !== 'defense') {
  clrEnd();
  return;
 }
 S.t += dt;
 S.rt += dt;
 const h = clrHolder();
 let all = true, done = true;
 for (const sl of S.slots) {
  const o = clrFind(sl);
  if (!o || o === h || o.down > 0) continue;
  let tg = sl.spot;
  if (S.phase === 'run') {
   while (sl.ri < sl.route.length && (Math.hypot(o.x - sl.route[sl.ri][0], o.y - sl.route[sl.ri][1]) < 5 || sl.rt > .6 + Math.hypot(o.x - sl.route[sl.ri][0], o.y - sl.route[sl.ri][1]) / PACE.cut + 2.2)) {
    sl.ri++;
    sl.rt = 0;
   }
   sl.rt += dt;
   tg = sl.ri < sl.route.length ? sl.route[sl.ri] : sl.route.length ? sl.route[sl.route.length - 1] : sl.spot;
   if (sl.ri < sl.route.length) done = false;
  }
  tg = f10Spot(tg, sl.role);
  const d = Math.hypot(o.x - tg[0], o.y - tg[1]);
  if (d > 6) all = false;
  if (o.far) o.clrT = tg; else if (screen === 'defense') {
   o.clearTo = tg;
  } else if (d > 4) {
   o.playT = tg;
   o.playHold = null;
   o.clrFast = true;
  } else {
   o.playT = null;
   o.playHold = tg;
  }
 }
 G.clrFrames = (G.clrFrames || 0) + 1;
 if (S.phase === 'set' && (all || S.t > 3.5)) {
  S.phase = 'ready';
  G.clrReady = (G.clrReady || 0) + 1;
  SFX.catch();
 }
 if (S.phase === 'run' && done && S.rt > 1.5) S.runDone = true;
}

function drawClrBtn() {
 const G = game, st = clrBtnState();
 if (!st) return false;
 const w = 44, h = 16, x = W - w - 3, y = H - h - 3 - sa2403Dy(H - h - 3, h + 1);
 const col = st === 'SET' ? '#ff9a4a' : st === 'RUN' ? '#7dff7a' : 'rgba(30,40,50,.85)';
 if (st === 'SET' || st === 'RUN') hit('CLRSET', x, y, w, h, () => {
  const s = clrBtnState();
  if (s === 'SET') clrSet(); else if (s === 'RUN') clrGo();
 }, 'CLEAR ' + st);
 rect(x, y + 1, w, h, '#000');
 rect(x, y, w, h, col);
 if (st === 'RUN' && Math.floor(menuT * 4) % 2) rect(x, y, w, 1, '#fff');
 text(st === 'RUN' ? 'RUN >' : st, x + w / 2, y + 3, 1, st === 'SET' || st === 'RUN' ? '#0b1a20' : '#9ab', 'center');
 text('CLEAR', x + w / 2, y + 10, 1, st === 'SET' || st === 'RUN' ? '#0b1a20' : '#9ab', 'center');
 G.clrBtn = {
  st: st,
  x: x,
  y: y,
  w: w,
  h: h
 };
 return true;
}

function toStartList(G) {
 const X = G && G.toCtx;
 if (!G || !X || X.defense) return [];
 return offUnit(G.lu[0]).filter(Boolean);
}

function whoStartsRow(G) {
 const list = toStartList(G);
 if (!list.length) return '';
 const cur = G.toStart || G.toCtx && G.toCtx.pl || null;
 return '<div class="box"><div class="note">WHO STARTS WITH IT</div><div class="row tabs">' + list.map(p => btn(p.pos + ' ' + lastName(p), 'toStart', p.id, cur === p.id ? 'on' : 'd')).join('') + '</div></div>';
}

function pickStarter(id) {
 const G = game;
 if (!G || !toStartList(G).some(p => p.id === id)) return false;
 G.toStart = id;
 if (G.tutorial) tutFlag('toStart');
 return true;
}

function applyStarter() {
 const G = game, id = G && G.toStart;
 if (!id) return false;
 G.toStart = null;
 if (screen !== 'live' || !G.carrier || G.ball.state !== 'held') return false;
 let who = G.players.find(p => p.team === 'O' && p.pl && p.pl.id === id);
 if (!who) {
  who = G.players.find(p => p.team === 'O' && p !== G.carrier && p.idx === G.carrier.idx) || G.carrier;
  who.pl = PP(id);
 }
 if (who !== G.carrier) {
  const c0 = G.carrier;
  [c0.x, who.x] = [ who.x, c0.x ];
  [c0.y, who.y] = [ who.y, c0.y ];
  G.carrier = who;
  G.ball.x = who.x + BX;
  G.ball.y = who.y + BY;
 }
 G.starterLog = G.starterLog || [];
 G.starterLog.push(id);
 addFx('txt', who.x, who.y - 26, {
  s: lastName(who.pl) + ' STARTS WITH IT',
  col: '#ffe14d',
  life: 1.2
 });
 return true;
}

const CHIRP_BTN = {
 cd: 6,
 x: -24,
 w: 32
};

function chirpReady() {
 const G = game;
 if (!G) return false;
 const t = vt();
 return t - (G.chirpBtnAt != null ? G.chirpBtnAt : -99) >= CHIRP_BTN.cd && t - (G.voiceAt != null ? G.voiceAt : -99) >= CHIRP.gap && !voiceBusy();
}

function chirpCdLeft() {
 const G = game;
 if (!G) return 0;
 const t = vt();
 return Math.max(0, CHIRP_BTN.cd - (t - (G.chirpBtnAt != null ? G.chirpBtnAt : -99)), CHIRP.gap - (t - (G.voiceAt != null ? G.voiceAt : -99)));
}

function userChirp() {
 const G = game;
 if (!G || !(screen === 'live' || screen === 'defense')) return null;
 if (G.tutorial) tutFlag('chirped');
 if (!chirpReady()) {
  G.chirpDenied = (G.chirpDenied || 0) + 1;
  return null;
 }
 const k = voice12('userChirp', benchX('u') + 34, H - 34);
 if (k) {
  G.chirpBtnAt = vt();
  G.userChirps = (G.userChirps || 0) + 1;
  G.coachPoint = G.coachPoint || {};
  G.coachPoint.u = menuT;
  G.benchCheer = G.benchCheer || {};
  G.benchCheer.u = menuT;
 }
 return k;
}

function chirpX18(y, w) {
 const cx = W / 2, specs = uiSpecs.filter(s => s.label !== 'CHIRP'), free = x => x >= 2 && x + w <= W - 2 && !specs.some(s => x < s.x + s.w + 2 && x + w + 2 > s.x && y < s.y + s.h && y + 11 > s.y);
 const right = Math.max(cx + 12, ...specs.filter(s => s.y + s.h > y && s.x >= cx).map(s => s.x + s.w + 3));
 for (const x of [ cx - 12 - w, cx - 12 - w - 36, cx - 12 - w - 72, right, 2 ]) if (free(Math.round(x))) return Math.round(x);
 return Math.round(cx - 12 - w);
}

function drawChirpBtn() {
 const G = game;
 if (!G || !(screen === 'live' || screen === 'defense')) return;
 if (G.tutorial && G.tutorial.step !== TUT_CHIRP_STEP) return;
 const y = H - 11 - sa2403Dy(H - 11, 11), w = CHIRP_BTN.w, on = chirpReady(), x = chirpX18(y, w);
 hit('CHIRP', x, y, w, 11, () => userChirp(), 'CHIRP');
 rect(x, y + 1, w, 10, '#000');
 rect(x, y, w, 10, on ? '#ff7ad1' : 'rgba(40,50,60,.9)');
 if (!on) {
  const f = 1 - clamp(chirpCdLeft() / CHIRP_BTN.cd, 0, 1);
  rect(x, y + 8, Math.round(w * f), 2, '#ff7ad1');
 }
 text('CHIRP', x + w / 2, y + 3, 1, on ? '#2a0b20' : '#7a8a95', 'center');
}

const PM_CATS = [ 'OFFENSE', 'MAN-UP', 'END LINE', 'CLEAR', 'RIDES', 'D' ];

const PM_CAT_INFO = {
 OFFENSE: 'HALF FIELD - 6 ON 6',
 'MAN-UP': 'HALF FIELD - 6 ON 5',
 'END LINE': 'HALF FIELD - RESTART FROM THE END LINE',
 CLEAR: 'FULL FIELD - ALL 10 CLEAR IT',
 RIDES: 'FULL FIELD - ALL 10 RIDE',
 D: 'HALF FIELD - YOUR D CALL'
};

const PM_LBLS = {
 O6: [ 'M1', 'M2', 'M3', 'A1', 'A2', 'A3' ],
 F10: [ 'G', 'D1', 'D2', 'D3', 'M1', 'M2', 'M3', 'A1', 'A2', 'A3' ],
 D6: [ 'M1', 'M2', 'M3', 'D1', 'D2', 'D3', 'G' ]
};

function pmFull(c) {
 return c === 'CLEAR' || c === 'RIDES';
}

function pmKind(c) {
 return pmFull(c) ? 'F10' : c === 'D' ? 'D6' : 'O6';
}

function pmCat(pl) {
 return pl && PM_CATS.includes(pl.cat) ? pl.cat : 'OFFENSE';
}

function pmFormOnly(c) {
 return c === 'RIDES' || c === 'D';
}

function pmLbl(i, pl) {
 const L = PM_LBLS[pmKind(pmCat(pl || PM && PM.play))];
 return L[i] || '?';
}

function pmRole(i, pl) {
 const l = pmLbl(i, pl);
 return l[0] === 'A' ? 'A' : l[0] === 'G' ? 'G' : l[0] === 'D' ? 'D' : 'M';
}

const PM_STARTS = {
 OFFENSE: PM_START,
 'MAN-UP': EMO['3-3 EMO'],
 'END LINE': [ [ GX - 112, CY - 42 ], [ GX - 124, CY + 6 ], [ GX - 104, CY + 48 ], [ GX + 26, CY - 6 ], [ GX - 30, CY - 52 ], [ GX - 30, CY + 52 ] ],
 CLEAR: [ [ DGX + 5, CY ], [ DGX + 44, CY - 52 ], [ DGX + 34, CY + 54 ], [ DGX + 74, CY + 4 ], [ MIDX - 62, CY - 56 ], [ MIDX - 40, CY ], [ MIDX - 62, CY + 56 ], [ MIDX + 50, CY - 46 ], [ MIDX + 72, CY ], [ MIDX + 50, CY + 46 ] ],
 RIDES: [ [ DGX + 42, CY + 6 ], [ MIDX - 14, CY ], [ DGX + 62, CY - 38 ], [ DGX + 62, CY + 40 ], [ MIDX + 62, CY - 50 ], [ MIDX + 40, CY + 2 ], [ MIDX + 62, CY + 50 ], [ GX - 52, CY - 46 ], [ GX - 32, CY + 30 ], [ GX - 74, CY + 56 ] ],
 D: [ [ GX - 132, CY - 2 ], [ GX - 98, CY - 44 ], [ GX - 98, CY + 44 ], [ GX - 31, CY - 46 ], [ GX - 31, CY + 46 ], [ GX - 22, CY + 2 ], [ GX - 5, CY ] ]
};

function pmStartFor(c) {
 return (PM_STARTS[c] || PM_START).map(q => q.slice());
}

const RIDE10_DEMO = PM_STARTS.RIDES;

const PM_BUILTIN = [ {
 id: 'bi-open',
 name: 'OPEN',
 cat: 'OFFENSE',
 builtin: true,
 start: SETS['OPEN'].map(q => q.slice()),
 car: 0,
 steps: [ {
  t: 'move',
  p: 0,
  x: GX - 66,
  y: CY - 14
 }, {
  t: 'move',
  p: 3,
  x: GX - 20,
  y: CY - 50
 } ]
}, {
 id: 'bi-222',
 name: '2-2-2',
 cat: 'OFFENSE',
 builtin: true,
 start: SETS['2-2-2'].map(q => q.slice()),
 car: 0,
 steps: [ {
  t: 'move',
  p: 4,
  x: GX - 12,
  y: CY - 26
 }, {
  t: 'move',
  p: 0,
  x: GX - 96,
  y: CY - 22
 }, {
  t: 'pass',
  from: 0,
  to: 4
 } ]
}, {
 id: 'bi-black',
 name: 'BLACK',
 cat: 'D',
 builtin: true,
 dcall: 'black',
 start: SETS['3-3'].map(([x, y]) => {
  const dx = GX - x, dy = CY - y, L = Math.hypot(dx, dy) || 1;
  return [ Math.round(x + dx / L * 6), Math.round(y + dy / L * 6) ];
 }).concat([ [ GX - 5, CY ] ]),
 car: null,
 steps: []
}, {
 id: 'bi-ride10',
 name: '10-MAN RIDE',
 cat: 'RIDES',
 builtin: true,
 ride: '10-MAN RIDE',
 start: RIDE10_DEMO.map(q => q.slice()),
 car: -2,
 steps: [ {
  t: 'move',
  p: 0,
  x: DGX + 5,
  y: CY
 }, {
  t: 'move',
  p: 1,
  x: DGX + 56,
  y: CY - 4
 } ]
} ];

if (!window.__rl_no2314) PM_BUILTIN.push({
 id: 'bi-el-cornerx',
 name: 'CORNER X',
 cat: 'END LINE',
 builtin: true,
 start: PM_STARTS['END LINE'].map(q => q.slice()),
 car: 3,
 steps: [ {
  t: 'move',
  p: 4,
  x: GX - 18,
  y: CY - 24
 }, {
  t: 'move',
  p: 3,
  x: GX + 14,
  y: CY - 26
 }, {
  t: 'pass',
  from: 3,
  to: 4
 } ]
});

function pbAll() {
 return PM_BUILTIN.concat(playsAll());
}

function pbRunnable(p) {
 const c = pmCat(p);
 return c === 'OFFENSE' || c === 'MAN-UP' || c === 'END LINE';
}

function teamPlaybook(teamId) {
 return PM_BUILTIN.map(p => p.name);
}

function pmView() {
 if (!PM || !pmFull(pmCat(PM.play))) return null;
 const k = (W - 6) / FL;
 return {
  k: k,
  ox: 3,
  oy: 33 - FT * k
 };
}

function pmSetCat(c) {
 if (!PM || !PM_CATS.includes(c)) return false;
 PM.preview = null;
 PM.play = {
  id: null,
  name: '',
  cat: c,
  start: pmStartFor(c),
  car: null,
  steps: []
 };
 PM.editId = null;
 PM.msg = c + ': ' + PM_CAT_INFO[c];
 PM.flash = 1.4;
 SFX.tap();
 if (game && game.tutorial) tutFlag('pmCat_' + c);
 return true;
}

function pmGhosts(pl, pos) {
 const c = pmCat(pl), zone = PM && PM.ghost === 'ZONE', out = [];
 if (c === 'OFFENSE' || c === 'END LINE' || c === 'MAN-UP') {
  const n = c === 'MAN-UP' ? 5 : 6;
  if (zone) {
   const z = c === 'MAN-UP' ? ZONES['BOX + 1'] : ZONES.zone;
   z.slice(0, n).forEach(([dx, dy]) => out.push([ GX - dx, CY + dy ]));
  } else {
   let list = pos.map((q, i) => i);
   if (n < list.length) {
    const far = list.slice().sort((a, b) => Math.hypot(pos[b][0] - GX, pos[b][1] - CY) - Math.hypot(pos[a][0] - GX, pos[a][1] - CY))[0];
    list = list.filter(i => i !== far);
   }
   for (const i of list) {
    const q = pos[i], th = threatOf({
     x: q[0],
     y: q[1]
    }, GX, false, false), hx = GX - 24, hy = CY + (q[1] - CY) * .3;
    const hl = Math.hypot(hx - q[0], hy - q[1]) || 1, off = Math.min(hl * .85, 8 + (SAG.ghost - 8) * (1 - th));
    if (th >= .999 || hl < 9) {
     const dx = GX - q[0], dy = CY - q[1], L = Math.hypot(dx, dy) || 1;
     out.push([ q[0] + dx / L * 8, q[1] + dy / L * 8 ]);
    } else out.push([ q[0] + (hx - q[0]) / hl * off, q[1] + (hy - q[1]) / hl * off ]);
   }
  }
  out.push([ GX - 5, CY ]);
 } else if (c === 'D') {
  SETS['3-3'].forEach(q => out.push([ q[0], q[1] ]));
 } else if (c === 'CLEAR') {
  if (zone) [ [ DGX + 96, CY - 42 ], [ DGX + 96, CY + 42 ], [ DGX + 120, CY ], [ MIDX - 26, CY - 48 ], [ MIDX - 20, CY ], [ MIDX - 26, CY + 48 ], [ MIDX + 62, CY - 40 ], [ MIDX + 62, CY + 40 ], [ MIDX + 84, CY ] ].forEach(q => out.push(q)); else pos.forEach((q, i) => {
   if (i > 0) out.push([ q[0] + 7, q[1] - 3 ]);
  });
  out.push([ GX - 5, CY ]);
 } else if (c === 'RIDES') {
  [ [ GX - 5, CY ], [ GX - 48, CY - 50 ], [ GX - 30, CY + 34 ], [ GX - 70, CY + 58 ], [ MIDX + 66, CY - 54 ], [ MIDX + 44, CY + 6 ], [ MIDX + 66, CY + 54 ], [ DGX + 66, CY - 42 ], [ DGX + 44, CY + 8 ], [ DGX + 66, CY + 44 ] ].forEach(q => out.push(q));
 }
 return out;
}

function pmGhostToggle() {
 if (!PM) return;
 PM.ghost = PM.ghost === 'ZONE' ? 'MAN' : 'ZONE';
 PM.msg = 'GHOST D: ' + PM.ghost;
 PM.flash = .9;
 SFX.tap();
 if (game && game.tutorial) tutFlag('pmGhost');
}

function drawGhosts(pl, pos) {
 const kit = game ? game.ok : {
  jersey: '#ff5a4a',
  trim: '#222222',
  helm: '#ff5a4a'
 };
 g.globalAlpha = .38;
 for (const q of pmGhosts(pl, pos)) drawPlayer({
  x: q[0],
  y: q[1],
  anim: 0
 }, kit, q[0] > MIDX ? false : true);
 g.globalAlpha = 1;
}

function pbOn(G, p) {
 if (p.dcall) return G.dset === p.dcall;
 if (p.ride) return rideCall('U') === p.ride;
 const c = pmCat(p);
 if (c === 'D') return G.dset === 'custom' && G.dPlay === p.id;
 if (c === 'RIDES') return rideCall('U') === p.id;
 if (c === 'CLEAR') return G.clrSel === p.id;
 return G.playSel === p.id;
}

function pbPickAny(id) {
 const p = id ? pbAll().find(q => q.id === id) : null;
 if (p && game && game.tutorial && (p.dcall || p.ride || !p.builtin && pmCat(p) !== 'OFFENSE')) tutFlag('pbPicked');
 if (p && p.dcall) {
  setDefense(p.dcall);
  return 'd';
 }
 if (p && p.ride) {
  setRide(p.ride);
  return 'ride';
 }
 if (p && !p.builtin && pmCat(p) === 'D') {
  setDefense('custom', p.id);
  return 'd';
 }
 if (p && !p.builtin && pmCat(p) === 'RIDES') {
  setRide(p.id);
  return 'ride';
 }
 if (p && !p.builtin && pmCat(p) === 'CLEAR') {
  clrSelect(game && game.clrSel === p.id ? null : p.id);
  return 'clr';
 }
 choosePlay(id || null);
 return 'play';
}

function drawItemAsk2314() {
 if (no2314() || !window.V17 || !V17.ipend) return;
 const P = V17.ipend();
 if (!P) return;
 if (game && screen === 'final' && game.celeb && !game.celeb.done) return;
 if (![ 'final', 'menu', 'pickTeam', 'pickOpp', 'gear17', 'wgHub', 'season' ].includes(screen)) return;
 hit('ITEMS2314 BLOCK', 0, 0, W, H, () => {}, 'ITEMS2314 BLOCK');
 const bw = 236, bh = 78, bx = Math.round(W / 2 - bw / 2), by = Math.round(H / 2 - bh / 2), nm = String(P.name || '').slice(0, 22);
 rect(0, 0, W, H, 'rgba(0,0,0,.6)');
 rect(bx, by + 2, bw, bh, '#000');
 rect(bx, by, bw, bh, '#14222b');
 rect(bx, by, bw, 1, '#ffe14d');
 text('YOUR ITEMS', W / 2, by + 6, 2, '#ffe14d', 'center', '#000');
 text('WOULD YOU LIKE YOUR ITEMS RETURNED TO', W / 2, by + 22, 1, '#cfe', 'center');
 text('YOUR LOCKER ROOM FROM ' + nm, W / 2, by + 30, 1, '#cfe', 'center');
 text('OR SAVED TO THE TEAM?', W / 2, by + 38, 1, '#cfe', 'center');
 const yb = by + 52, w2 = 92;
 hit('ITEMS RETURN', bx + 14, yb, w2, 18, () => {
  V17.ipendDo(false);
  SFX.tap && SFX.tap();
 }, 'ITEMS RETURN');
 rect(bx + 14, yb + 2, w2, 18, '#000');
 rect(bx + 14, yb, w2, 18, '#8fe3f0');
 text('RETURN', bx + 14 + w2 / 2, yb + 7, 1, '#0b1a20', 'center');
 hit('ITEMS SAVE', bx + bw - 14 - w2, yb, w2, 18, () => {
  V17.ipendDo(true);
  SFX.tap && SFX.tap();
 }, 'ITEMS SAVE');
 rect(bx + bw - 14 - w2, yb + 2, w2, 18, '#000');
 rect(bx + bw - 14 - w2, yb, w2, 18, '#7dff7a');
 text('SAVE', bx + bw - 14 - w2 / 2, yb + 7, 1, '#0b1a20', 'center');
}

function render() {
 _render2314();
 try {
  drawItemAsk2314();
 } catch (e) {
  console.error(e);
 }
}

function _render2314() {
 topPass = false;
 tagQ = null;
 const inGamePanel = !!game && (screen === 'timeout' || screen === 'penalty' || screen === 'playbook' || screen === 'scene' || screen === 'coachPick' || screen === 'lineup' && PS.luBack === 'timeout');
 if ((screen === 'playmaker' || screen === 'pmSave') && PM) {
  drawPlaymaker();
  return;
 }
 if (!game || !GAME_SCREENS.includes(screen) && !inGamePanel) {
  if (screen === 'menu') drawMenu(); else if (screen === 'help') drawHelp(); else if (screen === 'settings') sa2403Band(() => drawSettings(false)); else if (screen === 'pickTeam') drawPickTeam(); else if (screen === 'pickOpp') drawPickOpp(); else if (screen === 'season') drawSeason(); else if (screen === 'matchup') drawMatchup(); else if (screen === 'wgPick') drawWgPick(); else if (screen === 'wgHub') drawWgHub(); else if (screen === 'wgChamp') drawWgChamp(); else if (screen === 'gear17') drawGear17(); else if (screen === 'card28' && window.V28) V28.drawCard(); else bgStripes(true);
  return;
 }
 const G = game;
 rantWatch();
 if (huddleOn()) camX += (clamp(MIDX - W / 2, 0, FL - W + PADW) - camX) * .18;
 const shk = glvShake();
 g.save();
 g.translate(-Math.round(camX) + shk[0], shk[1]);
 f30Cam(Math.round(camX));
 tagQ = new Map;
 ballQ = false;
 topPass = true;
 drawStadium();
 drawField();
 drawBench();
 if (window.GHO16 && GHO16.on() && (homeTeam().gho16 || window.V28 && V28.stGho())) GHO16.fog();
 drawPenaltyBox();
 drawRefs();
 drawGear();
 if (screen === 'scene') drawScene(); else if (screen === 'live') {
  drawLiveWorld();
  drawPlayOverlay();
 } else if (screen === 'defense') drawDefWorld(); else if (screen === 'cpu') drawCpuWorld(); else if (screen === 'final' && G.celeb && !G.celeb.done) drawCeleb15(); else if (screen === 'pregame' && G.walk && !G.walkDone) drawWalk2314(); else if (G.players.length && screen !== 'qbreak' && screen !== 'pregame' && huddleOn()) drawHuddle(); else if (G.players.length && screen !== 'qbreak' && screen !== 'pregame') {
  drawPlayers();
  drawBall();
  for (const f of fx) if (f.type === 'pop') for (let i = 0; i < 8; i++) {
   const a = i / 8 * 6.28;
   px(f.x + Math.cos(a) * f.t * 30, f.y + Math.sin(a) * f.t * 30, '#fff');
  }
 }
 if (window.V20) try {
  V20.drawWorld();
 } catch (e) {
  console.error(e);
 }
 try {
  drawTopLayer();
 } catch (e) {
  topPass = false;
  tagQ = null;
  console.error(e);
 }
 drawPellets();
 drawLvlFx();
 g.restore();
 if (G.night) drawNight15();
 if (screen !== 'pregame' && !(screen === 'final' && G.celeb && !G.celeb.done)) drawHUD();
 if (screen === 'live') {
  drawControls();
  drawGameButtons();
  drawPlaybookBtn();
  drawEdgeMates();
  drawPlaySetBtn();
  drawChirpBtn();
  drawEl2314();
 } else if (screen === 'defense') {
  drawDefense();
  drawGameButtons();
  drawEdgeMates();
  drawChirpBtn();
  drawClrBtn();
 } else if (screen === 'cpu' || screen === 'banner') drawGameButtons();
 if (screen === 'scene') drawSceneUI();
 drawPenTag();
 if (G.tutorial) drawTutorial();
 if (screen === 'live') {} else if (screen === 'faceoff') drawFaceoffUI(); else if (screen === 'banner') drawBanner(); else if (screen === 'cpu') drawCpu(); else if (screen === 'qbreak') drawQBreak(); else if (screen === 'pregame') {
  if (G.walk && !G.walkDone) drawWalkUI2314(); else {
   drawPregame();
   if (G.coin && G.coin.phase !== 'done') drawCoin15();
  }
 } else if (screen === 'final') {
  if (G.celeb && !G.celeb.done) drawCeleb15UI(); else drawFinal();
 }
 if (G.tutorial) drawTutBtns231();
 if (paused) drawPause();
}

applyDiff();

requestAnimationFrame(frame);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
 const hadController = !!navigator.serviceWorker.controller;
 let reloaded = false;
 navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!hadController || reloaded || sessionStorage.getItem('rl_sw_reload') === 'v14') return;
  reloaded = true;
  try {
   sessionStorage.setItem('rl_sw_reload', 'v14');
  } catch (e) {}
  location.reload();
 });
 navigator.serviceWorker.register('sw.js?v=14', {
  updateViaCache: 'none'
 }).then(r => r.update && r.update()).catch(() => {});
}

function braveTrim173() {
 const G = game;
 if (!G || !G.brave || !G.players) return;
 const isGk = p => p.team === 'G' || p.team === 'G2' || p.role === 'g' || p.role === 'g2';
 const field = tm => G.players.filter(p => p.team === tm && !isGk(p));
 const keep = {}, want = {
  O: PP(G.lu[0].FO),
  D: PP(G.lu[1].FO)
 };
 const ballMan = [ G.carrier, G.dcar ].find(p => p && G.players.includes(p) && !isGk(p) && (p.team === 'O' || p.team === 'D')) || null;
 const pickFor = (tm, other) => {
  const F = field(tm);
  if (!F.length) return null;
  if (ballMan && ballMan.team === tm) return ballMan;
  return F.find(p => p.role === 'fogo') || other && F.find(p => p.mark === other || other.mark0 === p || other.mark === p) || F.find(p => p.pl === want[tm]) || F[0];
 };
 const first = ballMan ? ballMan.team : 'O', second = first === 'O' ? 'D' : 'O';
 keep[first] = pickFor(first, null);
 keep[second] = pickFor(second, keep[first]);
 for (const tm of [ 'O', 'D' ]) {
  const k = keep[tm];
  if (k && want[tm] && k.pl !== want[tm] && !(G.ejected || []).includes(want[tm].id)) k.pl = want[tm];
 }
 const ks = new Set([ keep.O, keep.D ].filter(Boolean));
 G.players = G.players.filter(p => isGk(p) || ks.has(p));
 for (const p of G.players) {
  if (p.mark && !G.players.includes(p.mark) && !p.mark.ghost) p.mark = null;
  if (p.mark0 && !G.players.includes(p.mark0)) p.mark0 = null;
 }
 if (keep.O && keep.D) {
  const off = screen === 'defense' ? keep.D : keep.O, def = off === keep.O ? keep.D : keep.O;
  if (screen !== 'faceoff') {
   def.mark = off;
   off.mark0 = def;
  }
 }
 if (G.farU) G.farU = G.farU.filter(f => f.role === 'G');
 if (G.farC) G.farC = G.farC.filter(f => f.role === 'G');
 if (G.carrier && !G.players.includes(G.carrier)) G.carrier = keep.O || null;
 if (G.dcar && !G.players.includes(G.dcar)) G.dcar = keep.D || null;
 if (G.dctl && !G.players.includes(G.dctl)) G.dctl = keep.O || null;
 if (G.ctrl && !G.players.includes(G.ctrl)) G.ctrl = null;
 if (G.chk && G.chk.who && !G.players.includes(G.chk.who)) G.chk.who = G.dcar;
 if (G.chasers) G.chasers = G.chasers.filter(p => G.players.includes(p));
 G.braveN = (G.braveN || 0) + 1;
}

[ 'startFaceoff', 'setupPossession', 'liveFromFaceoff', 'startDefense', 'startDefenseLive', 'liveClear' ].forEach(n => {
 const o = window[n];
 if (typeof o !== 'function') return;
 window[n] = function() {
  const r = o.apply(this, arguments);
  try {
   if (game && game.brave) braveTrim173();
  } catch (e) {
   console.error(e);
  }
  return r;
 };
});

function clrNow26(G) {
 return clr26ok(G) && !!G.ball && (screen === 'live' || screen === 'defense') && (G.clearing || G.cpuClear || !!G.dclear || G.ball.state === 'clear' || G.ball.state === 'loose' || G.ball.state === 'chase');
}

function snap26() {
 const G = game;
 if (!clrNow26(G)) return null;
 const m = new Map;
 for (const q of G.players.concat(G.farU || [], G.farC || [])) {
  const k = q && q.pl && (q.pl.id || q.pl.name);
  if (k) m.set(([ 'O', 'G2', 'U' ].includes(q.team) ? 'U|' : 'C|') + k, [ q.x, q.y ]);
 }
 return m;
}

function keep26(m) {
 const G = game;
 if (!m || !G) return;
 let n = 0;
 for (const a of G.players.concat(G.farU || [], G.farC || [])) {
  const k = a && a.pl && (a.pl.id || a.pl.name);
  const q = k && m.get(([ 'O', 'G2', 'U' ].includes(a.team) ? 'U|' : 'C|') + k);
  if (q && Math.hypot(q[0] - a.x, q[1] - a.y) > 2) {
   a.x = q[0];
   a.y = q[1];
   a.h7v = 0;
   a.h7w = 0;
   n++;
  }
 }
 G.keep26 = (G.keep26 || 0) + n;
 if (n && !window.__rl_no30clrfix) seat30(G);
}

function seat30(G) {
 const b = G && G.ball;
 if (!b || b.state !== 'held') return;
 if (screen === 'defense' && G.dcar) {
  [b.x, b.y] = dStick(G.dcar);
 } else if (screen === 'live' && G.carrier) {
  b.x = G.carrier.x + BX;
  b.y = G.carrier.y + BY;
 } else return;
 G.seat30 = (G.seat30 || 0) + 1;
}

{
 const _sdl26 = startDefenseLive;
 startDefenseLive = function() {
  const m = snap26();
  const r = _sdl26.apply(this, arguments);
  keep26(m);
  return r;
 };
}

{
 const _sd26 = startDefense;
 startDefense = function() {
  const m = snap26(), ob = m && game && game.ball ? {
   x: game.ball.x,
   y: game.ball.y
  } : null;
  const r = _sd26.apply(this, arguments);
  if (m && ob && !window.__rl_no30clrfix) own30(m, ob);
  keep26(m);
  return r;
 };
}

function own30(m, ob) {
 const G = game, car = G && G.dcar;
 if (!car || !car.pl || screen !== 'defense') return;
 const kOf = p => p && p.pl && (p.pl.id || p.pl.name);
 let bk = null, bd = 1e9;
 for (const [k, q] of m) if (k.startsWith('C|')) {
  const d = Math.hypot(q[0] - ob.x, q[1] - ob.y);
  if (d < bd) {
   bd = d;
   bk = k;
  }
 }
 if (!bk || bd > 24 || 'C|' + kOf(car) === bk) return;
 const o = G.players.concat(G.farC || []).find(p => p !== car && p.pl && ![ 'O', 'G2', 'U' ].includes(p.team) && 'C|' + kOf(p) === bk);
 if (!o) return;
 const pl = o.pl;
 o.pl = car.pl;
 car.pl = pl;
 G.own30 = (G.own30 || 0) + 1;
}

{
 const _to26 = toOffense;
 toOffense = function() {
  const m = snap26();
  const r = _to26.apply(this, arguments);
  keep26(m);
  return r;
 };
}

window.__rl = {
 WTEAMS: WTEAMS,
 WT_REG: WT_REG,
 get wgame() {
  return wgame;
 },
 set wgame(v) {
  wgame = v;
 },
 wgNew16: wgNew16,
 wgNext16: wgNext16,
 wgPlayed16: wgPlayed16,
 wgSimMine16: wgSimMine16,
 wgStand16: wgStand16,
 wgSim16: wgSim16,
 wgStatus16: wgStatus16,
 wgOk16: wgOk16,
 get gridWorld16() {
  return gridWorld16;
 },
 set gridWorld16(v) {
  gridWorld16 = v;
 },
 reloadWg() {
  const w = LS.get('wg', null);
  wgame = wgOk16(w) ? w : null;
  return wgame;
 },
 GK: GK,
 PP: PP,
 syncPanel: syncPanel,
 get AC() {
  return AC;
 },
 AUDIO_STATS: AUDIO_STATS,
 audioInit: audioInit,
 get game() {
  return game;
 },
 get screen() {
  return screen;
 },
 set screen(v) {
  screen = v;
 },
 get season() {
  return season;
 },
 newGame: newGame,
 startFaceoff: startFaceoff,
 setupPossession: setupPossession,
 get W() {
  return W;
 },
 get camX() {
  return camX;
 },
 startCpu: startCpu,
 skipCpu: skipCpu,
 goalCornerAt: goalCornerAt,
 GZ: GZ,
 releaseShot: releaseShot,
 get SCALE() {
  return SCALE;
 },
 get inputLockUntil() {
  return inputLockUntil;
 },
 PACE: PACE,
 get paused() {
  return paused;
 },
 get lastTap() {
  return lastTap;
 },
 CORNER_NAMES: CORNER_NAMES,
 GCX: GCX,
 CY: CY,
 GX: GX,
 H: H,
 get ui() {
  return [ ...uiEls.entries() ].map(([k, r]) => {
   const b = r.el.getBoundingClientRect();
   return {
    k: k,
    label: r.el.getAttribute('aria-label'),
    x: b.left + b.width / 2,
    y: b.top + b.height / 2,
    w: b.width,
    h: b.height
   };
  });
 },
 mates() {
  const r = cv.getBoundingClientRect(), k = r.width / W;
  return game ? game.players.filter(p => p.team === 'O' && p !== game.carrier).map(p => {
   const s = mateCss(p, k);
   return {
    idx: p.idx,
    x: r.left + s.x,
    y: r.top + s.y
   };
  }) : [];
 },
 openCount() {
  if (!game || !game.carrier) return -1;
  let n = 0;
  for (const p of game.players) {
   if (p.team !== 'O' || p === game.carrier) continue;
   if (isOpen(p)) n++;
  }
  return n;
 },
 goalCss(cn) {
  const r = cv.getBoundingClientRect(), k = r.width / W, cam = Math.round(camX);
  const dx = (cn % 2 === 0 ? -1 : 1) * 12, dy = (cn < 2 ? -1 : 1) * 16;
  return {
   x: r.left + (GCX + dx - cam) * k,
   y: r.top + (CY + dy) * k
  };
 },
 DEF: DEF,
 GB: GB,
 get PIPE_P() {
  return PIPE_P;
 },
 popLoose: popLoose,
 startChase: startChase,
 checkPop: checkPop,
 liveFromFaceoff: liveFromFaceoff,
 ballLive: ballLive,
 get newGameCount() {
  return newGameCount;
 },
 step: dt => step(dt),
 setRun: setRun,
 version: 'v20',
 get net() {
  return window.RLNET;
 },
 lobby: lobby,
 lobbyState: () => lobbyState(),
 lobbyFrame: lobbyFrame,
 vsFrame: vsFrame,
 lobbyStick: lobbyStick,
 textMini: textMini,
 get RRv() {
  return RR;
 },
 VS: VS,
 vsIds: vsIds,
 vsStep: vsStep,
 vsOvr: vsOvr,
 vsRosterData: vsRosterData,
 openVsRoster: openVsRoster,
 get PSvs() {
  return PS.vs;
 },
 lobbyCardData: lobbyCardData,
 lobbyStep: lobbyStep,
 menuBars: menuBars,
 layoutBars: layoutBars,
 lobbyBounds: lobbyBounds,
 get tutGate() {
  return tutGate;
 },
 PSC: PSC,
 MASTER_VOL: MASTER_VOL,
 PING_R: PING_R,
 get RR() {
  return RR;
 },
 goalPing: goalPing,
 tagText: tagText,
 tagName: tagName,
 ballCarrier: ballCarrier,
 pipeBonk: pipeBonk,
 cpuTimeoutMaybe: cpuTimeoutMaybe,
 canShoot: canShoot,
 hotPick: hotPick,
 fireCall: fireCall,
 coachRant: coachRant,
 startHuddle: startHuddle,
 huddleOn: huddleOn,
 playSet: playSet,
 playGo: playGo,
 psetEnd: psetEnd,
 playSetBtnState: playSetBtnState,
 liveMates: liveMates,
 dClearMates: dClearMates,
 liveClear: liveClear,
 eventChirp: eventChirp,
 CHIRP: CHIRP,
 VOICE_POOL: VOICE_POOL,
 get pset() {
  return game && game.pset;
 },
 voiceBusy: voiceBusy,
 ctrlCss() {
  const G = game;
  if (!G || !G.ctrl) return null;
  const r = cv.getBoundingClientRect(), k = r.width / W;
  const s = mateCss(G.ctrl, k);
  return {
   x: r.left + s.x,
   y: r.top + s.y
  };
 },
 canvasCss(wx, wy) {
  const r = cv.getBoundingClientRect(), k = r.width / W;
  return {
   x: r.left + (wx - Math.round(camX)) * k,
   y: r.top + wy * k
  };
 },
 clearFx() {
  fx.length = 0;
  if (game) game.pops = [];
 },
 get camX() {
  return camX;
 },
 set camX(v) {
  camX = v;
 },
 logicalCss(lx, ly) {
  const r = cv.getBoundingClientRect(), k = r.width / W;
  return {
   x: r.left + lx * k,
   y: r.top + ly * k
  };
 },
 TEAMS: TEAMS,
 PLAYERS: PLAYERS,
 NORM: NORM,
 NORM_POS: NORM_POS,
 rf: rf,
 unitPower: unitPower,
 autoLineup: autoLineup,
 lineupFor: lineupFor,
 saveLineup: saveLineup,
 offUnit: offUnit,
 defUnit: defUnit,
 cpuOdds: cpuOdds,
 spdMul: spdMul,
 SETS: SETS,
 EMO: EMO,
 ZONES: ZONES,
 QUOTA: QUOTA,
 foResolve: foResolve,
 callTimeout: callTimeout,
 canTimeout: canTimeout,
 startDefense: startDefense,
 updateDefense: updateDefense,
 dShootForTest: dShoot,
 FL: FL,
 DGX: DGX,
 startTutorial: startTutorial,
 dCheck: dCheck,
 dHit: dHit,
 dSwitchTo: dSwitchTo,
 TUT_D: TUT_D,
 TUT_C: TUT_C,
 TUTX: TUTX,
 TUT_TRACKS: TUT_TRACKS,
 TUT_OFFSIDES: TUT_OFFSIDES,
 TD: TD,
 TC: TC,
 tutAdvance: tutAdvance,
 tutSkip: tutSkip,
 tutSetupX: tutSetupX,
 gbTapMate: gbTapMate,
 gbSwitchTo: gbSwitchTo,
 autoCtrl: autoCtrl,
 get joyObj() {
  return joy;
 },
 dPopLooseForTest: dPopLoose,
 aiOnside: aiOnside,
 LIVE_GB: LIVE_GB,
 TS: TS,
 TUT_S: TUT_S,
 TUT_SET: TUT_SET,
 SETTINGS: SETTINGS,
 settingsSave: settingsSave,
 applyDiff: applyDiff,
 DF: DF,
 DIFF_T: DIFF_T,
 DIFF_NAMES: DIFF_NAMES,
 QLEN_OPTS: QLEN_OPTS,
 ARC_R: ARC_R,
 twoPtFrom: twoPtFrom,
 twoPtShot: twoPtShot,
 perLabel: perLabel,
 endQuarter: endQuarter,
 get pauseSet() {
  return pauseSet;
 },
 set pauseSet(v) {
  pauseSet = v;
 },
 dTapDefender: dTapDefender,
 D_TAP_R: D_TAP_R,
 tutList: tutList,
 freeD: freeD,
 slideBest: slideBest,
 markOf: markOf,
 rotatePick: rotatePick,
 dThrowClear: dThrowClear,
 startClear: startClear,
 hitChance: hitChance,
 toOffense: toOffense,
 dPickCss: dPickCss,
 get DZ_GK() {
  return DZ_GK;
 },
 set DZ_GK(v) {
  DZ_GK = v;
 },
 set DZ_ALL(v) {
  DZ_ALL = v;
 },
 DZ: DZ,
 resumeFromTimeout: resumeFromTimeout,
 setOffense: setOffense,
 setDefense: setDefense,
 penaltyRoll: penaltyRoll,
 startPenalty: startPenalty,
 penaltyChoose: penaltyChoose,
 penaltyOver: penaltyOver,
 makeSeason: makeSeason,
 finishDraft: finishDraft,
 draftTurn: draftTurn,
 draftNeeds: draftNeeds,
 cpuChoice: cpuChoice,
 draftPick: draftPick,
 simScore: simScore,
 openRoster: openRoster,
 openLineup: openLineup,
 get PS() {
  return PS;
 },
 panelDirty: panelDirty,
 get menuSel() {
  return menuSel;
 },
 set seasonObj(v) {
  season = v;
 },
 forcePen(side) {
  if (game) game.forcePen = side;
 },
 ruleCounts: ruleCounts,
 offUnit: offUnit,
 defUnit: defUnit,
 lineupFor: lineupFor,
 migrateLineup: migrateLineup,
 autoLineup: autoLineup,
 lineupValid: lineupValid,
 availIds: availIds,
 injOf: injOf,
 SETS: SETS,
 EMO: EMO,
 ZONES: ZONES,
 liveClear: liveClear,
 overTick: overTick,
 overSwap: overSwap,
 classifySwipe: classifySwipe,
 doDodge: doDodge,
 carrierFace: carrierFace,
 DODGE: DODGE,
 TV28: TV28,
 T28: T28,
 m28on: m28on,
 head28: head28,
 curve28: curve28,
 INJ: INJ,
 doBull: doBull,
 bullOdds: bullOdds,
 bullTarget: bullTarget,
 bullCheck: bullCheck,
 bullHoldTick: bullHoldTick,
 bullArmed: bullArmed,
 bullDir: bullDir,
 BULL: BULL,
 TB: TB,
 TUT_V132: TUT_V132,
 PEL: PEL,
 hardCut: hardCut,
 spawnPellets: spawnPellets,
 isUserGuy: isUserGuy,
 kits: kits,
 get pellets() {
  return pellets;
 },
 set pellets(v) {
  pellets = v;
 },
 momTick: momTick,
 injuryRoll: injuryRoll,
 injGameDone: injGameDone,
 injSimGame: injSimGame,
 subFor: subFor,
 isEjected: isEjected,
 penCountUp: penCountUp,
 clearFx() {
  fx = fx.filter(f => f.type !== 'cue' && f.type !== 'txt');
 },
 FT: FT,
 FB: FB,
 EGG_PLAYERS: EGG_PLAYERS,
 SHAKE: SHAKE,
 TUT_FO: TUT_FO,
 TUT_FO_STEP: TUT_FO_STEP,
 TUT_RULES: TUT_RULES,
 TUT_PEN: TUT_PEN,
 pmTimeline: pmTimeline,
 pmPreviewAt: pmPreviewAt,
 playPlan: playPlan,
 chaseReset: chaseReset,
 settledSpot: settledSpot,
 ankleChance: ankleChance,
 ankleBreak: ankleBreak,
 shakeDelay: shakeDelay,
 ANKLE: ANKLE,
 mateTapCss: mateTapCss,
 offMates: offMates,
 nearestMateCss: nearestMateCss,
 mateCss: mateCss,
 get lastTap() {
  return lastTap;
 },
 get camX() {
  return camX;
 },
 set camX(v) {
  camX = v;
 },
 resumeOurs: resumeOurs,
 startDefenseLive: startDefenseLive,
 SLOTS: SLOTS,
 slotGet: slotGet,
 foulCallT: foulCall,
 get joy() {
  return joy;
 },
 get joyLog() {
  return joyLog;
 },
 JOY_DEAD: JOY_DEAD,
 JOY_MAX: JOY_MAX,
 runMag: runMag,
 openPlaymaker: openPlaymaker,
 get PM() {
  return PM;
 },
 pmState: pmState,
 pmShot: pmShot,
 pmUndo: pmUndo,
 pmClear: pmClear,
 pmPreview: pmPreview,
 pmSaveGo: pmSaveGo,
 playsAll: playsAll,
 playsSave: playsSave,
 playById: playById,
 choosePlay: choosePlay,
 playTick: playTick,
 endPlayRun: endPlayRun,
 playMap: playMap,
 FOUL: FOUL,
 dPassTo: dPassTo,
 UCHK: UCHK,
 dPopLoose: dPopLoose,
 callPick: callPick,
 CALL_PICK: CALL_PICK,
 clearFarMates: clearFarMates,
 HIT: HIT,
 hasRunUp: hasRunUp,
 momTick: momTick,
 knockDown: knockDown,
 foulCall: foulCall,
 foulTick: foulTick,
 dLateTarget: dLateTarget,
 fromBehind: fromBehind,
 facingOf: facingOf,
 keeperInCrease: keeperInCrease,
 dTrackCar: dTrackCar,
 throwPass: throwPass,
 TUT_PB_STEP: TUT_PB_STEP,
 TUT_CARDS: TUT_CARDS,
 PM_START: PM_START,
 pmClampSpot: pmClampSpot,
 seasonOk: seasonOk,
 draftPool: draftPool,
 FREE_AGENTS: FREE_AGENTS,
 dLunge: dLunge,
 playoffAdvance: playoffAdvance,
 simPlayoffsRest: simPlayoffsRest,
 advanceWeek: advanceWeek,
 seasonRecordGame: seasonRecordGame,
 nextSeasonGame: nextSeasonGame,
 standings: standings,
 SEASON_GAMES: SEASON_GAMES,
 PLAYOFF_N: PLAYOFF_N,
 TUT: TUT,
 tutSetup: tutSetup,
 dThrowClear: dThrowClear,
 PEN: {
  check: PEN_CHECK_P,
  cpu: PEN_CPU_P,
  dcheck: PEN_DCHECK_P,
  dhit: PEN_DHIT_P,
  scale: PEN_SCALE
 },
 updateRefs: updateRefs,
 onTap: (x, y) => onTap(x, y),
 reloadSeason() {
  season = mig2313(mig2301(LS.get('season', null)));
  if (season && !seasonOk(season)) {
   if (seasonShape2503(season)) {
    bak2503('season');
    seasonFix2503(season);
   }
   if (!seasonOk(season)) {
    bak2503('season');
    season = null;
    LS.set('season', null);
   } else LS.set('season', season);
  }
  return season;
 },
 panel() {
  return [ ...panel.querySelectorAll('[data-a]') ].map(el => {
   const b = el.getBoundingClientRect();
   return {
    a: el.dataset.a,
    v: el.dataset.v || null,
    label: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 40),
    x: b.left + b.width / 2,
    y: b.top + b.height / 2,
    w: b.width,
    h: b.height,
    dis: !!el.disabled
   };
  });
 },
 panelText() {
  return panel.style.display === 'none' ? '' : panel.innerText;
 },
 GLA: GLA,
 glvOff: glvOff,
 glvAnim: glvAnim,
 glvShake: glvShake,
 SAG: SAG,
 threatOf: threatOf,
 sagLive: sagLive,
 FO133: FO133,
 foMatchTick: foMatchTick,
 foMarkSpot: foMarkSpot,
 foMatchPairs: foMatchPairs,
 FO131: FO131,
 V131ON: V131ON,
 FO_DOWN_BTN: FO_DOWN_BTN,
 foDown: foDown,
 foWings: foWings,
 foAtk: foAtk,
 foFormApply: foFormApply,
 foFormSave: foFormSave,
 foHeldWing: foHeldWing,
 foTargetWing: foTargetWing,
 foPickTick: foPickTick,
 FO1401: FO1401,
 TEWA1401: TEWA1401,
 tewaCheck1401: tewaCheck1401,
 catchOdds: catchOdds,
 v13Catch: v13Catch,
 foPointerDown: foPointerDown,
 foResolve: foResolve,
 DF: DF,
 applyDiff: applyDiff,
 SETTINGS: SETTINGS,
 foLineTick: foLineTick,
 foViol: foViol,
 foPick: foPick,
 foClampAtk: foClampAtk,
 foClampWing: foClampWing,
 FO_BTN: FO_BTN,
 TV131: TV131,
 TUT_V131: TUT_V131,
 TUT_LINE131: TUT_LINE131,
 tutSetup: tutSetup,
 get pointers() {
  return pointers;
 },
 dCustomPlays: dCustomPlays,
 dCustomPlay: dCustomPlay,
 dCustomOn: dCustomOn,
 dCustomKind: dCustomKind,
 dsetNext: dsetNext,
 dsetLabel: dsetLabel,
 customPlays: customPlays,
 rideCustom: rideCustom,
 rideCustomPlays: rideCustomPlays,
 rideXTick: rideXTick,
 f10Assign: f10Assign,
 f10Spot: f10Spot,
 myTen: myTen,
 clrPlays: clrPlays,
 clrSel: clrSel,
 clrSelect: clrSelect,
 clrCtx: clrCtx,
 clrSet: clrSet,
 clrGo: clrGo,
 clrEnd: clrEnd,
 clrTick: clrTick,
 clrBtnState: clrBtnState,
 zoneTargets: zoneTargets,
 ZONES: ZONES,
 startClear: startClear,
 liveClear: liveClear,
 pbOn: pbOn,
 V13ON: V13ON,
 CATCH: CATCH,
 catchOdds: catchOdds,
 v13Catch: v13Catch,
 GLV: GLV,
 goalieLevel: goalieLevel,
 goalieLevelVerdict: goalieLevelVerdict,
 goalieLevelChance: goalieLevelChance,
 RIDE: RIDE,
 RIDE_NAMES: RIDE_NAMES,
 rideCall: rideCall,
 rideOn: rideOn,
 setRide: setRide,
 rideTick: rideTick,
 rideMarks: rideMarks,
 rideGkTarget: rideGkTarget,
 startDefenseLive: startDefenseLive,
 liveClearV13: (p, w) => liveClear(p, w),
 toStartList: toStartList,
 pickStarter: pickStarter,
 applyStarter: applyStarter,
 whoStartsRow: whoStartsRow,
 CHIRP_BTN: CHIRP_BTN,
 chirpReady: chirpReady,
 chirpCdLeft: chirpCdLeft,
 userChirp: userChirp,
 TUT_V13: TUT_V13,
 TV: TV,
 TUT_CHIRP_STEP: TUT_CHIRP_STEP,
 EGG_PLAYERS: EGG_PLAYERS,
 draftPool: draftPool,
 makeDraft: makeDraft,
 FREE_AGENTS: FREE_AGENTS,
 SKIN_SET: SKIN_SET,
 skinOf: skinOf,
 PM_CATS: PM_CATS,
 PM_BUILTIN: PM_BUILTIN,
 PM_STARTS: PM_STARTS,
 pmSetCat: pmSetCat,
 pmView: pmView,
 pmGhosts: pmGhosts,
 pmGhostToggle: pmGhostToggle,
 pmCat: pmCat,
 pmLbl: pmLbl,
 pbAll: pbAll,
 pbPickAny: pbPickAny,
 pbRunnable: pbRunnable,
 teamPlaybook: teamPlaybook,
 openPlaymaker: openPlaymaker,
 get PM() {
  return PM;
 },
 pmState: pmState,
 pmTimeline: pmTimeline,
 playsAll: playsAll,
 playById: playById,
 SET_NAMES: SET_NAMES,
 SET_INFO: SET_INFO,
 setDefense: setDefense,
 setOffense: setOffense,
 choosePlay: choosePlay,
 playMap: playMap,
 MIDX: MIDX,
 DGX: DGX,
 CREASE: CREASE,
 HIT: HIT,
 knockDown: knockDown,
 popLoose: popLoose,
 dPopLoose: dPopLoose,
 voice12: voice12,
 VOICE_TXT: VOICE_TXT,
 VOICE_CAT: VOICE_CAT,
 get voiceLast() {
  return voiceLast;
 },
 startClear: startClear,
 rrOf: rrOf,
 dAtk: dAtk,
 dDef: dDef,
 farTick: farTick,
 ruleCounts: ruleCounts,
 ruleCheck: ruleCheck,
 throwPass: m => throwPass(m),
 ruleCounts: ruleCounts,
 ruleCall: ruleCall,
 ruleCheck: ruleCheck,
 farInit: farInit,
 liveClear: liveClear,
 startDefenseLive: startDefenseLive,
 farTick: farTick,
 rrOf: rrOf,
 inCrease: inCrease,
 afterBanner: () => afterBanner(),
 CLEAR_T: CLEAR_T,
 BOX_T: BOX_T,
 CREASE_CT: CREASE_CT,
 RL_R: RL_R,
 RL_L: RL_L,
 MIDX: MIDX,
 TUT_RULES: TUT_RULES,
 TUT_TO13: TUT_TO13,
 TUT_MAIN_1404: TUT_MAIN_1404,
 get camXv() {
  return camX;
 },
 set camXv(v) {
  camX = v;
 },
 HAS12: HAS12,
 frame12: frame12,
 skinOf: skinOf,
 setSkin: setSkin,
 pickSkin: pickSkin,
 defaultSkin: defaultSkin,
 SKIN_SET: SKIN_SET,
 SKIN_NAMES: SKIN_NAMES,
 goalieSave12: goalieSave12,
 chirpTick: chirpTick,
 voice12: voice12,
 voicePick: voicePick,
 VOICE_W: VOICE_W,
 OUR_SAVE_P: OUR_SAVE_P,
 benchReact: benchReact,
 benchWant: benchWant,
 benchTick: benchTick,
 BENCH_CHIRP: BENCH_CHIRP,
 GCHIRP_P: GCHIRP_P,
 hitStrength: hitStrength,
 hit12: hit12,
 crowd12: crowd12,
 sfx12: sfx12,
 endPossession: endPossession,
 dEnd: dEnd,
 get menuT() {
  return menuT;
 },
 render: () => render(),
 drawBench: drawBench,
 get paused() {
  return paused;
 },
 set paused(v) {
  paused = v;
 }
};

try {
 Object.assign(window.__rl, {
  V14: () => game && V14(game),
  R14: R14,
  FIGHT: FIGHT,
  CONC: CONC,
  V14ON: V14ON,
  v14Hit: v14Hit,
  v14Tick: v14Tick,
  v14PreBanner: v14PreBanner,
  fightStart: fightStart,
  sceneSkip: sceneSkip,
  sceneEnd: sceneEnd,
  sceneTick: sceneTick,
  concussionStart: concussionStart,
  injScene14: injScene14,
  punchStart: punchStart,
  coachChoose: coachChoose,
  genCoaches: genCoaches,
  seasonGame14: seasonGame14,
  concSim14: concSim14,
  statRows14: statRows14,
  sortStats14: sortStats14,
  curOvr14: curOvr14,
  boostFor14: boostFor14,
  seasonInit14: seasonInit14,
  st14: st14,
  simWeekOthers14: S => simWeekOthers(S),
  advanceWeek14: S => advanceWeek(S),
  knockDown14: (c, by) => knockDown(c, by),
  injuryRoll14: (k, p) => injuryRoll(k, p),
  finishGame14: () => finishGame(),
  afterBanner14: () => afterBanner(),
  injOf14: id => injOf(id),
  penCountUp14: (p, s) => penCountUp(p, s),
  STAT_KEYS: STAT_KEYS,
  ST_COLS: ST_COLS,
  COACH_STYLES: COACH_STYLES,
  chip14: () => chip14(game),
  isEjected14: pl => isEjected(pl)
 });
 Object.defineProperty(window.__rl, 'BOOST', {
  get: () => BOOST
 });
 Object.defineProperty(window.__rl, 'PSv14', {
  get: () => PS
 });
} catch (e) {
 console.error(e);
}
