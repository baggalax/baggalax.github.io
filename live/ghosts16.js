'use strict';
var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());


const GHO16 = (() => {
 const on = () => !window.__rl_no2316b && !window.__rl_v124gb;
 const ID = 'GHO', GREEN = '#7dff9a';
 const ROWS = [ [ "Reg Hollingsworth", "M", 99, 99, 99, 93, 99, 96, 65, 70, 35, 35, 1, null ], [ "Ernie Cadwell", "M", 98, 99, 96, 91, 97, 94, 63, 70, 35, 35, 1, null ], [ "Bert Esterly", "A", 90, 91, 96, 97, 98, 86, 35, 62, 35, 35, 1, null ], [ "Barney Jennings", "A", 88, 89, 94, 95, 96, 84, 35, 62, 35, 35, 1, null ], [ "Max Ashworth", "A", 86, 87, 92, 93, 94, 82, 35, 62, 35, 35, 1, null ], [ "Homer Mallory", "A", 83, 84, 89, 90, 91, 79, 35, 62, 35, 35, 1, null ], [ "Otto Brewster", "A", 82, 83, 88, 89, 90, 78, 35, 62, 35, 35, 1, null ], [ "Lester Griswold", "A", 80, 81, 86, 87, 88, 76, 35, 62, 35, 35, 1, null ], [ "Elmer Tillery", "M", 96, 97, 94, 89, 95, 92, 61, 70, 35, 35, 1, null ], [ "Doc Boyington", "M", 94, 95, 92, 87, 93, 90, 59, 70, 35, 35, 1, null ], [ "Donald Crockett", "FO", 81, 64, 59, 54, 70, 86, 49, 90, 89, 35, 1, null ], [ "Jack Lowry", "M", 88, 89, 86, 81, 87, 84, 53, 70, 35, 35, 1, null ], [ "Harold Wentworth", "D", 85, 49, 38, 35, 71, 97, 98, 87, 35, 35, 1, null ], [ "Cy Garnett", "D", 84, 49, 38, 35, 70, 96, 97, 86, 35, 35, 1, null ], [ "Wally Youngblood", "D", 82, 49, 38, 35, 68, 94, 95, 84, 35, 35, 1, null ], [ "Lloyd Ellison", "D", 80, 49, 38, 35, 66, 92, 93, 82, 35, 35, 1, null ], [ "Bernard Thurman", "D", 79, 49, 38, 35, 65, 91, 92, 81, 35, 35, 1, null ], [ "Woody Slocum", "LSM", 83, 62, 49, 36, 72, 80, 87, 88, 35, 35, 1, null ], [ __x("RHVrZSBSdWRk"), "G", 58, 43, 43, 35, 80, 53, 43, 65, 35, 91, 1, null ], [ "Pete Wyman", "G", 58, 43, 43, 35, 76, 53, 43, 65, 35, 87, 1, null ] ];
 const tm = {
  id: ID,
  abbr: 'GHO',
  name: 'NEW ORLEANS GHOSTS',
  full: 'New Orleans Ghosts',
  city: '',
  lg: 'N/A',
  era: 'LEGENDS',
  c1: '#141418',
  c2: '#f4f4f4',
  acc16: GREEN,
  icon: [ '.###.', '#####', '#.#.#', '#####', '#####', '#####', '#.#.#' ],
  coach: '',
  coachNote: '',
  off: 4,
  def: 4,
  gho16: true
 };
 try {
  if (window.N31 && N31.on) N31.ghosts(ROWS, ID);
 } catch (e) {
  console.error(e);
 }
 tm.roster = ROWS.map((a, i) => {
  const p = {
   id: ID + '-' + i,
   n: a[0],
   pos: a[1],
   r: {},
   real: !!a[12],
   team: ID,
   gho16: true,
   wnum: a[13] != null ? a[13] : null,
   skin: 6
  };
  if (a.n0 != null) p.n0 = a.n0;
  SKILLS.forEach((k, j) => p.r[k] = a[2 + j]);
  p.ovr = ovrOf(p);
  PLAYERS[p.id] = p;
  return p.id;
 });
 GH_REG[ID] = tm;
 const owned = () => {
  try {
   return !!(window.V17 && V17.hw16 && V17.hw16.owned());
  } catch (e) {
   return false;
  }
 };
 const isGho = tid => !!tid && tid === ID;
 function grid(onPick, opts) {
  const own = owned(), taken = opts && opts.exclude === ID, cw = 150, chh = 92, cx = Math.round(W / 2 - cw / 2), cy = 30;
  rect(cx, cy + 2, cw, chh, '#000');
  rect(cx, cy, cw, chh, '#141a22');
  rect(cx, cy, cw, 2, GREEN);
  badge(tm, cx + cw / 2 - 20, cy + 6, 3);
  text(tm.name, cx + cw / 2, cy + 58, 1, '#fff', 'center');
  text(own ? taken ? 'TAKEN BY THE OTHER PLAYER' : 'LEGENDS FROM BEYOND - OVR ' + teamOvr16() : 'LOCKED', cx + cw / 2, cy + 67, 1, own ? '#9affb4' : '#ff9a8a', 'center');
  if (!own) {
   g.globalAlpha = .55;
   rect(cx, cy, cw, chh, '#05060a');
   g.globalAlpha = 1;
   rect(cx + cw / 2 - 4, cy + 22, 9, 7, '#ffcc33');
   rect(cx + cw / 2 - 3, cy + 17, 7, 1, '#ffcc33');
   rect(cx + cw / 2 - 3, cy + 17, 1, 5, '#ffcc33');
   rect(cx + cw / 2 + 3, cy + 17, 1, 5, '#ffcc33');
   text(window.V17 && V17.hw16 && V17.hw16.on() ? 'IN HALLOWEEN PACK' : 'HALLOWEEN PACK ONLY', cx + cw / 2, cy + 78, 1, '#ff9a3a', 'center');
   hit('TEAM-' + ID, cx, cy, cw, chh, () => {
    try {
     V17.toast('NEW ORLEANS GHOSTS: IN THE HALLOWEEN PACK (STRING SHOP)', '#ff9a3a');
    } catch (e) {}
   }, tm.name + ' (LOCKED)');
   return;
  }
  if (!taken) hit('TEAM-' + ID, cx, cy, cw, chh, () => onPick(ID), tm.name);
 }
 function teamOvr16() {
  try {
   return typeof teamOvr === 'function' ? teamOvr(ID, 'real') : '';
  } catch (e) {
   return '';
  }
 }
 const HAIR = {};
 (function frames() {
  if (typeof RL12 === 'undefined' || !RL12.FR) return;
  const FRX = RL12.FR;
  for (const k of Object.keys(FRX)) {
   if (!/^f14_N/.test(k)) continue;
   const f = FRX[k], rows = f[3].map((r, i) => {
    if (i < 2 || i > 6) return r;
    const a = r.split(''), s0 = a.indexOf('S'), first = a.indexOf('o'), last = a.lastIndexOf('o');
    for (let q = first + 1; q < a.length; q++) {
     if (a[q] !== 'o') continue;
     if (s0 >= 0 ? q < s0 : q < last) a[q] = 'Q';
    }
    return a.join('');
   });
   const nk = k.replace('f14_N', 'f14_Q');
   FRX[nk] = [ f[0], f[1], f[2], rows ];
   HAIR[k] = nk;
  }
  const strip = r => r.replace(/[MmnX]/g, '.');
  if (FRX.down) {
   const dn = FRX.down;
   FRX.f14_downQ = [ dn[0], dn[1], null, dn[3].map(r => strip(r).replace(/[Hhw]/g, 'Q').replace(/c/g, 'S')) ];
   HAIR.f14_downN = 'f14_downQ';
  }
  if (FRX.f14_kneelN && FRX.getup0) {
   const gu = FRX.getup0, kn = rows => rows.slice(0, 15).concat([ '..ooJJJJJJJo......', '..oKKKKoSSo.......', '...ooooooo........' ]);
   FRX.f14_kneelQ = [ gu[0], 17, null, kn(gu[3].map(strip).map((r, i) => i >= 4 && i <= 11 ? r.replace(/[Hhw]/g, 'Q').replace(/c/g, 'S') : r)) ];
   HAIR.f14_kneelN = 'f14_kneelQ';
  }
 })();
 const hairFrame = n => HAIR[n] || n;
 function lantern(x, y, t, i) {
  rect(x - 3, y - 3, 7, 5, '#0d0d0d');
  rect(x - 2, y - 3, 5, 4, '#ff7a1a');
  rect(x - 3, y - 2, 7, 2, '#ff7a1a');
  px(x, y - 4, '#2f9a3a');
  const fl = Math.floor(t * 6 + i * 1.7) % 4 ? '#ffe14d' : '#fff3a0';
  px(x - 1, y - 2, fl);
  px(x + 1, y - 2, fl);
  rect(x - 1, y, 3, 1, fl);
 }
 function tomb(x, y, i) {
  rect(x - 3, y - 7, 7, 8, '#0d0d0d');
  rect(x - 2, y - 7, 5, 7, i % 2 ? '#8a8f99' : '#9aa0aa');
  rect(x - 1, y - 8, 3, 1, '#0d0d0d');
  rect(x - 1, y - 7, 3, 1, '#b0b5be');
  rect(x - 1, y - 5, 3, 1, '#5a5f68');
  px(x, y - 6, '#5a5f68');
  px(x, y - 4, '#5a5f68');
  rect(x - 3, y + 1, 7, 1, '#2c3a24');
 }
 function stadium() {
  const t = game ? game.t : menuT;
  g.globalAlpha = .35;
  rect(0, 17, FL, FT - 20, '#1a0828');
  g.globalAlpha = 1;
  for (let x = 2; x < FL; x += 6) {
   const k = x / 6 | 0, onl = (Math.floor(t * 3) + k) % 3 !== 0;
   px(x, 17, onl ? k % 2 ? '#ff7a1a' : '#a64dff' : '#3a2a40');
  }
  for (let i = 0; i < 8; i++) {
   const x = 30 + i * ((FL - 60) / 7), c = i % 2 ? 'rgba(255,122,26,' : 'rgba(166,77,255,', a = .16 + .06 * Math.sin(t * 2 + i);
   g.fillStyle = c + a.toFixed(3) + ')';
   g.beginPath();
   g.arc(x, 20, 9, 0, 6.2832);
   g.fill();
   px(Math.round(x), 18, i % 2 ? '#ffb070' : '#d0a0ff');
  }
  for (let x = 18, i = 0; x < FL - 6; x += 46, i++) lantern(x, FT - 4, t, i);
  for (let x = 30, i = 0; x < FL - 6; x += 74, i++) lantern(x, FB + 6, t, i + 3);
  for (let i = 0; i < 9; i++) tomb(FL + 10 + i % 3 * 36 + i * 7 % 11, 40 + Math.floor(i / 3) * ((H - 60) / 3) + i * 13 % 9, i);
 }
 function graves() {
  for (const [x, y] of game && game.tombs16 || []) {
   rect(x - 4, y - 10, 9, 11, '#0d0d0d');
   rect(x - 3, y - 9, 7, 10, '#9aa0aa');
   rect(x - 2, y - 10, 5, 1, '#9aa0aa');
   rect(x - 1, y - 7, 3, 1, '#5a5f68');
   px(x, y - 8, '#5a5f68');
   px(x, y - 6, '#5a5f68');
   rect(x - 5, y + 1, 11, 1, '#2a1a10');
  }
 }
 function fog() {
  graves();
  const t = game ? game.t : menuT;
  for (let i = 0; i < 7; i++) {
   const w = 140 + i % 3 * 50, x = (i * 137 + t * (5 + i % 3 * 2)) % (FL + 200) - 100, y = FT + 10 + i * 53 % Math.max(20, FB - FT - 20);
   g.fillStyle = 'rgba(220,255,230,0.05)';
   g.beginPath();
   g.ellipse(x, y, w / 2, 9, 0, 0, 6.2832);
   g.fill();
  }
  g.fillStyle = 'rgba(200,235,215,0.06)';
  g.fillRect(0, FB - 8, FL, 12);
  g.fillRect(0, FT - 2, FL, 8);
 }
 const RND16 = () => {
  try {
   const b = new Uint32Array(1);
   crypto.getRandomValues(b);
   return b[0] / 4294967296;
  } catch (e) {
   return Math.random();
  }
 };
 function ghostWin(G) {
  return !!(on() && G && !G.tutorial && (G.mode === 'quick' || G.meta && G.meta.online) && G.mode !== 'season' && G.mode !== 'world' && isGho(G.user));
 }
 function cardsFor(n) {
  if (!window.V22 || !V22.on()) return {
   got: [],
   dup: []
  };
  const all = tm.roster.slice(), left = all.filter(id => !V22.owned(id)), pick = (L, k) => {
   const a = L.slice(), out = [];
   while (out.length < k && a.length) out.push(a.splice(Math.floor(RND16() * a.length), 1)[0]);
   return out;
  };
  if (left.length) {
   const ids = pick(left, Math.min(n, left.length));
   return {
    got: V22.grantIds(ids, ID, 'GHOSTS WIN'),
    dup: []
   };
  }
  const ids = pick(all, n), S = V22.st();
  for (const id of ids) {
   const c = S.cards[id];
   if (c) c.d = (c.d || 0) + 1;
  }
  V22.save();
  return {
   got: [],
   dup: ids
  };
 }
 function afterGame(G, win) {
  if (!win || !ghostWin(G)) return null;
  const r = cardsFor(2);
  if (r.got.length) V22.popup('gho|' + Date.now() + '|' + r.got.join(','), 'GHOST CARDS!', 'THE NEW ORLEANS GHOSTS WIN! ' + r.got.map(id => PLAYERS[id].n.toUpperCase()).join(' + ') + (r.got.length > 1 ? ' ARE' : ' IS') + ' NOW YOUR PLAYER CARD' + (r.got.length > 1 ? 'S' : ''), r.got);
  if (G) G.gho16cards = r;
  return r;
 }
 function ghostGame(G) {
  return !!(G && (isGho(G.user) || isGho(G.opp)));
 }
 function injOn(G) {
  return !!(on() && G && G.mode !== 'season' && G.mode !== 'world' && !G.tutorial && ghostGame(G) && !(window.RLNET && RLNET.inGame && !RLNET.auth));
 }
 const INJ16 = 2;
 function injury(kind, p) {
  const G = game;
  if (!G || G.over || !p || !p.pl || p.gk || p.team === 'G' || p.team === 'G2' || !G.players.includes(p)) return false;
  const side = p.team === 'O' ? 0 : 1;
  G.injN = G.injN || [ 0, 0 ];
  if (G.injN[side] >= INJ.perGame) return false;
  G.injEvents = G.injEvents || {
   split: 0,
   roll: 0,
   hit: 0,
   cpuHit: 0
  };
  G.injEvents[kind] = (G.injEvents[kind] || 0) + 1;
  if (!(G.forceInj || Math.random() < (INJ[kind] || .004) * INJ16 * (window.V17 && G.g17 ? V17.injMul(p) : 1))) return false;
  G.forceInj = false;
  const sev = injSevRoll(kind), who = p.pl;
  sev.sev = 'OUT FOR THE GAME';
  sev.g = 0;
  G.gout16 = G.gout16 || [];
  G.gout16.push(who.id);
  G.injN[side]++;
  (G.injuries = G.injuries || []).push({
   pid: who.id,
   side: side,
   what: sev.what,
   g: 0,
   kind: kind,
   gho16: 1
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
 const Z16 = {
  dur: 1.5,
  jump: 4.4
 };
 function zTick(sc) {
  const t = sc.t, v = sc.vic;
  if (!v) return false;
  if (t < Z16.dur) {
   v.down = true;
   v.sink16 = Math.max(0, Math.min(.999, (t - .55) / .7));
   if (t >= 1.25) v.gone16 = true;
   if (!sc.z16s) {
    sc.z16s = 1;
    try {
     zSound();
    } catch (e) {}
   }
   for (const a of sc.actors) if (a.kneelAt != null && t >= a.kneelAt) {
    a.kneel = true;
    a.tx = a.x;
    a.ty = a.y;
   }
   return true;
  }
  if (!sc.z16done) {
   sc.z16done = 1;
   v.gone16 = true;
   v.sink16 = 0;
   sc.t = Math.max(sc.t, Z16.jump);
   if (sc.tr) {
    sc.tr.x = sc.tr.home[0];
    sc.tr.y = sc.tr.home[1];
   }
  }
  return false;
 }
 function zSound() {
  const ac = typeof AC !== 'undefined' ? AC : null;
  if (!ac || muted || ac.state === 'closed') return;
  tone(110, .5, 'sawtooth', .06, 0, -60);
  tone(82, .7, 'triangle', .08, .25, -30);
  tone(55, .35, 'square', .05, .9);
 }
 function zDrawUnder(sc) {
  const v = sc.vic;
  if (!v) return;
  const t = sc.t, x = Math.round(v.x), y = Math.round(v.y), k = Math.min(1, t / .4);
  rect(x - Math.round(6 * k), y - 1, Math.round(13 * k), 3, '#2a1a10');
  rect(x - Math.round(4 * k), y, Math.round(9 * k), 1, '#120a06');
 }
 function zDraw(sc) {
  const v = sc.vic;
  if (!v) return;
  const t = sc.t, x = Math.round(v.x), y = Math.round(v.y);
  if (t < 1.35) {
   const up = t < .45 ? t / .45 : t < .7 ? 1 : Math.max(0, 1 - (t - .7) / .6), hh = Math.round(9 * up), hx = x + 3;
   if (hh > 0) {
    rect(hx - 1, y - hh, 3, hh, '#5f8a4a');
    rect(hx - 1, y - hh, 1, hh, '#3e6030');
    const fy = y - hh - 3;
    rect(hx - 2, fy, 5, 3, '#6f9a58');
    px(hx - 2, fy - 2, '#6f9a58');
    px(hx, fy - 3, '#6f9a58');
    px(hx + 2, fy - 2, '#6f9a58');
    px(hx - 2, fy - 1, '#6f9a58');
    px(hx, fy - 1, '#6f9a58');
    px(hx + 2, fy - 1, '#6f9a58');
    rect(hx - 1, y - Math.min(hh, 3), 3, 1, '#7a5a3a');
   }
  }
  if (t >= 1) {
   const k = Math.min(1, (t - 1) / .2), th = Math.round(10 * k);
   if (th > 0) {
    rect(x - 4, y - th, 9, th + 1, '#0d0d0d');
    rect(x - 3, y - th + 1, 7, th, '#9aa0aa');
    rect(x - 2, y - th, 5, 1, '#9aa0aa');
    if (k >= 1) {
     text('RIP', x + 1, y - 7, 1, '#3a3f48', 'center');
    }
    rect(x - 5, y + 1, 11, 1, '#2a1a10');
   }
   if (k >= 1 && game) {
    const L = game.tombs16 = game.tombs16 || [];
    if (!L.some(q => Math.abs(q[0] - x) < 4 && Math.abs(q[1] - y) < 4)) L.push([ x, y ]);
   }
  }
 }
 function flame(fx, fy, k, t, front) {
  const s = Math.max(1, k), n = 9;
  for (let i = 0; i < n; i++) {
   const dx = (i - (n - 1) / 2) * 1.6 * s, ph = t * 7 + i * 1.9, hgt = (4 + 3 * Math.abs(Math.sin(ph)) + i % 3) * s * (1 - Math.abs(i - (n - 1) / 2) / n);
   const a = front ? .18 : .38;
   g.fillStyle = 'rgba(90,255,140,' + (a * (.7 + .3 * Math.sin(ph * 1.3))).toFixed(3) + ')';
   g.fillRect(Math.round(fx + dx - s * .8), Math.round(fy - hgt), Math.max(1, Math.round(1.6 * s)), Math.round(hgt));
   if (!front) {
    g.fillStyle = 'rgba(210,255,220,' + (.25 * (.6 + .4 * Math.sin(ph))).toFixed(3) + ')';
    g.fillRect(Math.round(fx + dx - s * .4), Math.round(fy - hgt * .45), Math.max(1, Math.round(.8 * s)), Math.round(hgt * .45));
   }
  }
  g.fillStyle = 'rgba(90,255,140,' + (front ? .08 : .16).toFixed(3) + ')';
  g.fillRect(Math.round(fx - 8 * s), Math.round(fy - s), Math.round(16 * s), Math.round(2 * s));
 }
 return {
  flame: flame,
  injOn: injOn,
  injury: injury,
  zTick: zTick,
  zDraw: zDraw,
  zDrawUnder: zDrawUnder,
  ghostGame: ghostGame,
  on: on,
  ID: ID,
  tm: tm,
  owned: owned,
  isGho: isGho,
  grid: grid,
  hairFrame: hairFrame,
  HAIR: HAIR,
  stadium: stadium,
  fog: fog,
  ghostWin: ghostWin,
  afterGame: afterGame,
  cardsFor: cardsFor,
  ROWS: ROWS
 };
})();

window.GHO16 = GHO16;
