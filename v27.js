(function() {
 'use strict';
 const on = k => !window.__rl_v124gb && !window.__rl_no27 && !window['__rl_no27' + k];
 const LOG = {
  inj: [],
  pack: [],
  tt: [],
  ult: [],
  gho: []
 };
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function() {
   return f.call(this, o, arguments);
  };
  return true;
 };
 function trainerOf(teamId, pid) {
  try {
   const G = typeof game !== 'undefined' ? game : null;
   if (G && G.g17 && G.g17.side && G.g17.side[pid] != null) {
    if (!G.g17.fx) return null;
    const L = G.g17.L && G.g17.L[G.g17.side[pid]];
    const c = L && L.crew && L.crew.trainer;
    return c == null ? null : c;
   }
   const S = typeof season !== 'undefined' ? season : null;
   if (S && S.team && teamId === S.team && !S.online && window.V17 && V17.ST && V17.BY && (window.__rl_v124gb || window.__rl_no332fx || !V17.itemFx || V17.itemFx())) {
    const ST = V17.ST(), id = ST.crew && ST.crew.trainer, it = id && V17.BY[id];
    if (it && it.crew === 'trainer' && (ST.inv[id] || 0) > 0) return it.rar;
   }
  } catch (e) {
   console.error(e);
  }
  return null;
 }
 function recov(g, r) {
  if (r == null || !(g > 0) || g >= 99) return g;
  return Math.max(1, Math.round(g * (1 - .1 * (r + 1))));
 }
 wrapG('injAdd', function(o, a) {
  if (!on('trainer')) return o.apply(this, a);
  try {
   const [S, teamId, pid, sev] = a, r = trainerOf(teamId, pid);
   if (sev && r != null && sev.g > 0 && sev.g < 99) {
    const g = recov(sev.g, r);
    if (g !== sev.g) {
     const s2 = Object.assign({}, sev, {
      g: g,
      tr27: sev.g
     });
     if (/^OUT \d+ GAMES?$/.test(String(sev.sev || ''))) s2.sev = g > 1 ? 'OUT ' + g + ' GAMES' : 'OUT 1 GAME';
     LOG.inj.push({
      pid: pid,
      from: sev.g,
      to: g,
      r: r
     });
     a = [ S, teamId, pid, s2 ].concat(Array.prototype.slice.call(a, 4));
    }
   }
  } catch (e) {
   console.error(e);
  }
  return o.apply(this, a);
 });
 let POOL = null;
 function pool() {
  if (POOL) return POOL;
  const ids = [], seen = new Set, add = (tid, ros) => {
   for (const id of ros || []) {
    const p = PP(id);
    if (!p || p.leg || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
   }
  };
  try {
   for (const t of TEAMS) add(t.id, t.roster);
  } catch (e) {}
  try {
   for (const k in WT_REG) add(k, WT_REG[k].roster);
  } catch (e) {}
  try {
   if (window.GHO16 && GHO16.on()) for (const k in GH_REG) add(k, GH_REG[k].roster);
  } catch (e) {}
  const by = [ [], [], [] ];
  for (const id of ids) by[V22.rarOf(id)].push(id);
  POOL = {
   ids: ids,
   by: by
  };
  return POOL;
 }
 const realTeamOf = pid => {
  const p = PP(pid);
  return p ? p.team : null;
 };
 function cardItem(pid) {
  const BY = V17.BY, id = 'pc27|' + pid;
  if (BY[id]) return id;
  const p = PP(pid), tid = realTeamOf(pid), t = T(tid), ab = t && (t.abbr || t.id) || tid || '';
  const POS = {
   A: 'ATTACK',
   M: 'MIDFIELD',
   D: 'DEFENSE',
   LSM: 'LSM',
   SSDM: 'SSDM',
   FO: 'FACEOFF',
   G: 'GOALIE'
  };
  BY[id] = {
   id: id,
   n: p.n.toUpperCase(),
   sec: 'pc27',
   rar: V22.rarOf(pid),
   pc27: pid,
   pt27: tid,
   gh27: !!p.gho16,
   role27: (POS[p.pos] || p.pos) + ' - ' + String(ab).replace(/^W(?=[A-Z]{3}$)/, '').toUpperCase(),
   d: 'PLAYER CARD: ' + p.n.toUpperCase() + ' (' + (t && t.name || tid) + ') - OVR ' + p.ovr + '. SUB HIM ONTO YOUR TEAM IN QUICK PLAY + ONLINE.'
  };
  return id;
 }
 function pickPlayer(rar, r) {
  const P = pool(), L = P.by[rar].length ? P.by[rar] : P.by[0];
  return L[Math.floor(r() * L.length) % L.length];
 }
 function packRoll(kind, r) {
  const f = window.__rl_pc27force;
  if (f && f[kind] !== undefined) return f[kind].slice();
  if (kind === 'daily' || kind === 'basic') return r() < .1 ? [ r() < .8 ? 0 : 1 ] : [];
  if (kind === 'rare') return r() < .25 ? [ r() < .1 ? 2 : r() < .6 ? 0 : 1 ] : [];
  if (kind === 'legendary') {
   const x = r(), n = x < .1 ? 2 : x < .5 ? 1 : 0, out = [];
   for (let i = 0; i < n; i++) out.push(r() < .25 ? 2 : r() < .5 ? 0 : 1);
   return out;
  }
  return [];
 }
 function packCards(kind, cards, r) {
  if (!on('packs') || !window.V22 || !V22.on() || !window.V17 || !Array.isArray(cards)) return 0;
  r = r || Math.random;
  const rs = packRoll(kind, r).slice(0, 2);
  if (!rs.length) return 0;
  const BY = V17.BY, lb = kind === 'legendary' && !!(V17.PACKS && V17.PACKS.legendary && V17.PACKS.legendary.slots[0][2] >= 100), last = kind === 'rare' || kind === 'legendary' && !lb ? cards.length - 1 : cards.length;
  const order = [];
  for (let i = lb ? 1 : 0; i < last; i++) order.push(i);
  order.sort((a, b) => ((BY[cards[a]] || {}).rar || 0) - ((BY[cards[b]] || {}).rar || 0) || a - b);
  let n = 0;
  for (const rar of rs) {
   const i = order[n];
   if (i == null) break;
   const pid = pickPlayer(rar, r);
   if (!pid) break;
   cards[i] = cardItem(pid);
   n++;
   LOG.pack.push({
    kind: kind,
    pid: pid,
    rar: rar,
    slot: i
   });
  }
  return n;
 }
 function shopIds() {
  return on('relax') && window.V17 && V17.BY && V17.BY.chirp_c173_relax_01 ? [ 'v27:relax' ] : [];
 }
 function shopTile(id) {
  if (id !== 'v27:relax') return null;
  let img = '';
  try {
   img = V17.iconUrl('chirp_c173_relax_01');
  } catch (e) {}
  return {
   id: id,
   img: img,
   n: 'RELAX PAL',
   sub: 'LEGENDARY CHIRP - 30 CHINOS'
  };
 }
 const CQ = 'v27claims';
 const claims = () => {
  try {
   const a = LS.get(CQ, []);
   return Array.isArray(a) ? a : [];
  } catch (e) {
   return [];
  }
 };
 function queue(c) {
  const a = claims();
  if (a.some(x => x.id === c.id)) return false;
  a.push(c);
  LS.set(CQ, a.slice(-20));
  return true;
 }
 function menuFree27() {
  try {
   if (typeof screen === 'undefined' || screen !== 'menu' || typeof game !== 'undefined' && game) return false;
   if (typeof tutAsk !== 'undefined' && tutAsk) return false;
   if (typeof ASK22 !== 'undefined' && ASK22) return false;
   for (const id of [ 'df2503', 'shop26', 'tut26card', 'c27', 'tt27' ]) if (document.getElementById(id)) return false;
   if (window.V24 && V24.isOpen && V24.isOpen()) return false;
   const ST = window.V17 && V17.ST && V17.ST();
   if (ST && Array.isArray(ST.chalClaim) && ST.chalClaim.length) return false;
   if (!window.__rl_no26 && !window.__rl_v124gb && !LS.get('tut26', false)) return false;
   return true;
  } catch (e) {
   return false;
  }
 }
 function tile(t) {
  const c = document.createElement('div');
  c.className = 'c27t';
  c.style.cssText = 'width:92px;background:rgba(0,0,0,.35);border:1px solid ' + (t.col || '#2c4452') + ';padding:3px 2px;display:flex;flex-direction:column;align-items:center';
  if (t.img) {
   const im = document.createElement('img');
   im.src = t.img;
   im.alt = '';
   im.style.cssText = 'height:40px;width:40px;object-fit:contain;image-rendering:pixelated;margin-bottom:2px';
   c.appendChild(im);
  }
  const n = document.createElement('div');
  n.textContent = t.n;
  n.style.cssText = 'color:#fff;font-size:9px;line-height:1.15';
  c.appendChild(n);
  if (t.sub) {
   const s = document.createElement('div');
   s.textContent = t.sub;
   s.style.cssText = 'color:' + (t.col || '#8fe3f0') + ';font-size:8px;line-height:1.15';
   c.appendChild(s);
  }
  if (t.pid35) {
   try {
    if (window.V35 && V35.platTile) V35.platTile(c, t.pid35);
   } catch (e) {}
  }
  return c;
 }
 function showClaim(c) {
  const d = document.createElement('div');
  d.id = 'c27';
  d.dataset.id = c.id;
  d.style.cssText = 'position:fixed;inset:0;z-index:86;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid ' + (c.col || '#ffcc33') + ';box-shadow:0 3px 0 #000;padding:6px 10px 8px;max-width:96%;max-height:96%;display:flex;flex-direction:column;text-align:center;box-sizing:border-box';
  const h = document.createElement('div');
  h.textContent = c.head;
  h.style.cssText = 'color:' + (c.col || '#ffcc33') + ';font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:2px';
  box.appendChild(h);
  if (c.sub) {
   const s = document.createElement('div');
   s.textContent = c.sub;
   s.style.cssText = 'color:#cfe;font-size:10px;margin-bottom:4px';
   box.appendChild(s);
  }
  const sc = document.createElement('div');
  sc.className = 'c27s';
  sc.style.cssText = 'overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;flex:1 1 auto';
  for (const g of c.groups || []) {
   if (g.label) {
    const l = document.createElement('div');
    l.textContent = g.label;
    l.style.cssText = 'color:#ffd23a;font-size:10px;margin:4px 0 2px;text-align:left';
    sc.appendChild(l);
   }
   const row = document.createElement('div');
   row.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;justify-content:center';
   for (const t of g.tiles || []) row.appendChild(tile(t));
   sc.appendChild(row);
  }
  box.appendChild(sc);
  const b = document.createElement('button');
  b.id = 'c27_ok';
  b.type = 'button';
  b.textContent = 'COLLECT';
  b.style.cssText = 'font:inherit;font-size:13px;border:0;border-radius:0;padding:8px 26px;margin:6px auto 0;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;background:#7dff7a;flex:0 0 auto';
  b.addEventListener('click', e => {
   e.preventDefault();
   e.stopPropagation();
   collect(c.id);
  });
  box.appendChild(b);
  d.appendChild(box);
  d.addEventListener('pointerdown', e => e.stopPropagation());
  d.addEventListener('touchstart', e => e.stopPropagation(), {
   passive: true
  });
  document.body.appendChild(d);
  LOG.shown = (LOG.shown || []).concat([ c.id ]);
 }
 function collect(id) {
  const a = claims().filter(x => x.id !== id);
  LS.set(CQ, a);
  const d = document.getElementById('c27');
  if (d) d.remove();
  try {
   SFX.cheer && SFX.cheer();
  } catch (e) {}
  LOG.collected = (LOG.collected || []).concat([ id ]);
 }
 let lastLook = 0;
 function claimTick() {
  if (!claims().length || document.getElementById('c27')) return;
  const t = performance.now();
  if (t - lastLook < 700) return;
  lastLook = t;
  if (!menuFree27()) return;
  const c = claims()[0];
  if (c) showClaim(c);
 }
 wrapG('step', function(o, a) {
  const r = o.apply(this, a);
  try {
   claimTick();
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 const icon = id => {
  try {
   return V17.iconUrl(id);
  } catch (e) {
   return '';
  }
 };
 const cardImg = pid => {
  try {
   return V22.artUrl(pid, V22.teamOfCard(pid));
  } catch (e) {
   return '';
  }
 };
 const RC = [ '#9aa3ab', '#3d8bff', '#ffcc33' ];
 const EYE = '#39ff14', EYEG = '#a8ff9a';
 const An = new WeakMap;
 function analyse(rows, name) {
  let a = An.get(rows);
  if (a) return a;
  const h = rows.length, w = rows[0].length, at = (q, r) => r >= 0 && r < h && q >= 0 && q < w ? rows[r][q] : '.';
  const sk = ch => ch === 'Z' || ch === 'S' || ch === 's', isJ = ch => ch === 'J' || ch === 'j';
  let jTop = h;
  for (let r = 0; r < h && jTop === h; r++) for (let q = 0; q < w; q++) if (isJ(at(q, r))) {
   jTop = r;
   break;
  }
  let hx = 0, hn = 0;
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   const ch = at(q, r);
   if (ch === 'H' || ch === 'h') {
    hx += q;
    hn++;
   }
  }
  const eyes = new Set, glow = new Set;
  for (let r = 0; r < jTop; r++) for (let q = 1; q < w - 1; q++) if (at(q, r) === 'o' && sk(at(q - 1, r)) && sk(at(q + 1, r))) eyes.add(q + ',' + r);
  if (!eyes.size) {
   let top = -1;
   for (let r = 0; r < jTop && top < 0; r++) for (let q = 0; q < w; q++) if (sk(at(q, r))) {
    top = r;
    break;
   }
   if (top >= 0) {
    const qs = [];
    for (let q = 0; q < w; q++) if (sk(at(q, top))) qs.push(q);
    const hc = hn ? hx / hn : w / 2, mid = (qs[0] + qs[qs.length - 1]) / 2;
    const q = mid >= hc ? qs[qs.length - 1] : qs[0];
    if (q != null) eyes.add(q + ',' + top);
   }
  }
  for (const k of eyes) {
   const [q, r] = k.split(',').map(Number);
   for (const [dq, dr] of [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ]) {
    const ch = at(q + dq, r + dr);
    if (sk(ch) || ch === 'c' || ch === 'C') glow.add(q + dq + ',' + (r + dr));
   }
  }
  let um = null;
  try {
   um = RL12.uniMask(rows, name);
  } catch (e) {}
  const shorts = um && um.shorts || new Set;
  const span = {};
  for (let r = jTop; r < h; r++) {
   let lo = -1, hi = -1;
   for (let q = 0; q < w; q++) if (isJ(at(q, r)) && !shorts.has(q + ',' + r)) {
    if (lo < 0) lo = q;
    hi = q;
   }
   if (lo >= 0) span[r] = [ lo, hi ];
  }
  let pelvis = -1;
  for (let r = 0; r < h; r++) {
   for (let q = 0; q < w; q++) if (shorts.has(q + ',' + r)) {
    pelvis = r;
    break;
   }
   if (pelvis >= 0) break;
  }
  const legC = new Set;
  for (let r = pelvis + 1; pelvis >= 0 && r < h; r++) {
   let run = [];
   const flush = () => {
    if (run.length) legC.add(run[Math.floor(run.length / 2)] + ',' + r);
    run = [];
   };
   for (let q = 0; q < w; q++) {
    if (shorts.has(q + ',' + r)) run.push(q); else flush();
   }
   flush();
  }
  a = {
   jTop: jTop,
   eyes: eyes,
   glow: glow,
   shorts: shorts,
   span: span,
   pelvis: pelvis,
   legC: legC
  };
  An.set(rows, a);
  return a;
 }
 const WG = {
  Z: '#ffffff',
  S: '#f6f8fa',
  s: '#dde2e7',
  J: '#f7f7f8',
  j: '#d9dee4',
  T: '#f0f2f4',
  t: '#d3d9df',
  H: '#ffffff',
  h: '#cdd3da',
  w: '#ffffff',
  G: '#f2f4f6',
  g: '#c7ced5',
  C: '#b4bcc5',
  c: '#8a949e',
  W: '#ffffff',
  v: '#d6dbe0',
  K: '#ffffff',
  o: '#8e98a2',
  Q: '#ffffff'
 };
 const BONE = '#f2efe6', BONE2 = '#bdb8aa', BLK = '#0a0a0c', BLK2 = '#17171b';
 const SKG = {
  o: '#2a2a31',
  H: '#1b1b1f',
  h: '#2f2f36',
  w: '#5a5a63',
  C: '#9aa0a8',
  c: '#5c626a',
  G: '#232328',
  g: '#18181c',
  T: '#f2efe6',
  t: '#bdb8aa',
  K: '#1c1c20',
  Q: '#f2efe6'
 };
 function g27px(kit, ch, q, r, rows, name) {
  if (!kit || !kit.g27 || !on('ghostuni') || ch === '.' || !rows) return null;
  if (ch === 'X' || ch === 'M' || ch === 'm' || ch === 'n') return null;
  let a;
  try {
   a = analyse(rows, name);
  } catch (e) {
   return null;
  }
  const k = q + ',' + r;
  if (a.eyes.has(k)) return EYE;
  if (a.glow.has(k)) return EYEG;
  const sk = ch === 'Z' || ch === 'S' || ch === 's';
  if (kit.g27 === 'white') return WG[ch] || null;
  if (kit.g27 !== 'skel') return null;
  if (sk) {
   if (r < a.jTop) return ch === 's' ? BONE2 : BONE;
   return ch === 's' ? BLK : BONE;
  }
  if (ch === 'J' || ch === 'j') {
   if (a.shorts.has(k)) {
    if (r === a.pelvis) return ch === 'j' ? BONE2 : BONE;
    return a.legC.has(k) ? BONE : BLK;
   }
   const sp = a.span[r];
   if (!sp) return BLK;
   const mid = Math.round((sp[0] + sp[1]) / 2);
   if (q === mid) return BONE;
   if ((r - a.jTop) % 2 === 1 && q > sp[0] && q < sp[1]) return ch === 'j' ? BONE2 : BONE;
   return ch === 'j' ? BLK2 : BLK;
  }
  if (ch === 'W') return BONE;
  if (ch === 'v') return BONE2;
  return SKG[ch] || null;
 }
 try {
  if (typeof RL12 !== 'undefined') RL12.g27 = g27px;
 } catch (e) {}
 function ghoMigrate() {
  if (!on('ghostuni') || !window.V17 || !V17.ST || !V17.hw16 || !window.UNI21) return 0;
  const ST = V17.ST();
  if (!ST || !ST.hw2316) return 0;
  try {
   UNI21.items();
  } catch (e) {}
  const ids = [ 'uni21|GHO|2', 'uni21|GHO|3' ].filter(id => V17.BY[id]);
  if (ids.length < 2) return 0;
  const miss = ids.filter(id => !((ST.inv[id] || 0) > 0));
  if (!miss.length) return 0;
  for (const id of miss) V17.grant(id, 1);
  ST.v27 = Object.assign({}, ST.v27, {
   gho: Date.now()
  });
  V17.save();
  queue({
   id: 'gho27',
   head: 'NEW IN YOUR HALLOWEEN PACK!',
   sub: 'YOU OWN THE HALLOWEEN PACK, SO THE 2 NEW UNIFORMS FOR THE NEW ORLEANS GHOSTS ARE YOURS TOO',
   col: '#7dff9a',
   groups: [ {
    tiles: miss.map(id => ({
     img: icon(id),
     n: V17.BY[id].n,
     sub: 'NEW ORLEANS GHOSTS ONLY',
     col: '#7dff9a'
    }))
   } ]
  });
  LOG.gho.push({
   at: Date.now(),
   ids: miss
  });
  return miss.length;
 }
 function coachPool() {
  const ids = [];
  try {
   for (const t of TEAMS) ids.push(t.id);
   for (const k in WT_REG) ids.push(k);
  } catch (e) {}
  const own = window.V232 && V232.coaches ? V232.coaches() : {}, o = id => {
   try {
    return window.HON25 && HON25.coachOwnerTid ? HON25.coachOwnerTid(id) : id;
   } catch (e) {
    return id;
   }
  };
  const seen = new Set, out = [];
  for (const id of ids) {
   const k = o(id);
   if (!k || seen.has(k) || own[k]) continue;
   seen.add(k);
   out.push(k);
  }
  return out;
 }
 function ultWin(U, rnd) {
  if (!on('ult') || !U || U.champ !== U.team || !window.V17 || !V17.ST) return null;
  const ST = V17.ST();
  ST.v27 = Object.assign({}, ST.v27);
  const done = Array.isArray(ST.v27.ult) ? ST.v27.ult : [];
  const key = 'ult|' + (U.n || 0) + '|' + U.team + '|' + (U.at || U.t0 || '');
  if (done.includes(key)) return null;
  const nc = !!(window.V331 && V331.noCards && V331.noCards(U));
  const r = rnd || Math.random, R = {
   key: key,
   nc331: nc,
   ult: [],
   ultC: 0,
   packs: nc ? 0 : 5,
   leg: [],
   rare: [],
   dupC: 0,
   coaches: [],
   coachC: 0,
   chinos: 200,
   roster: [],
   rosterC: 0,
   hc: null,
   uni: []
  };
  const sell = rar => V17.sell232 ? V17.sell232(rar) : [ 1, 3, 15 ][rar] || 1;
  try {
   if (!nc) {
    ST.freePacks = ST.freePacks || {};
    ST.freePacks.legendary = (ST.freePacks.legendary || 0) + 5;
   }
   if (nc && !window.__rl_v124gb && !window.__rl_no332ncx && window.V22 && V22.on() && window.V331 && V331.ultPrize) {
    try {
     R.ncx332 = 1;
     V331.ultPrize(U, R, sell, true);
    } catch (e) {
     console.error(e);
    }
   }
   if (window.V22 && V22.on() && !nc) {
    try {
     if (window.V331 && V331.ultPrize) V331.ultPrize(U, R, sell);
    } catch (e) {
     console.error(e);
    }
    const ids = (T(U.team).roster || []).filter(id => PP(id) && !PP(id).leg), had = ids.filter(id => V22.owned(id));
    const fs34 = V22.flipSplit ? V22.flipSplit(ids, U.team, 'ULTIMATE CHAMPIONS', key) : null;
    if (fs34) {
     R.flip34 = fs34.need || 0;
     R.deck34 = fs34.deck.length;
    }
    R.roster = V22.grantIds(fs34 ? fs34.pass : ids, U.team, 'ULTIMATE CHAMPIONS');
    for (const id of had) R.rosterC += sell(V22.rarOf(id));
    const pick = (rar, n, into) => {
     const used = new Set(R.roster.concat(had, fs34 ? fs34.deck : []));
     for (let i = 0, g = 0; i < n && g < 400; g++) {
      const pid = pickPlayer(rar, r);
      if (!pid || used.has(pid)) continue;
      used.add(pid);
      i++;
      if (V22.owned(pid)) {
       R.dupC += sell(rar);
       into.push({
        pid: pid,
        dup: 1
       });
      } else {
       V22.grantIds([ pid ], realTeamOf(pid), 'ULTIMATE WIN');
       into.push({
        pid: pid
       });
      }
     }
    };
    pick(2, 10, R.leg);
    pick(1, 5, R.rare);
   }
   if (!nc) try {
    R.hc = window.HON25 && HON25.coachGrant ? HON25.coachGrant(U.team) : window.V232 && V232.giveCoach ? {
     id: U.team,
     isNew: V232.giveCoach(U.team, 'ULTIMATE', true) === 'new'
    } : null;
   } catch (e) {
    console.error(e);
   }
   if (window.V232 && V232.giveCoach && !nc) {
    const P = coachPool();
    for (let i = 0; i < 3; i++) {
     if (P.length) {
      const k = P.splice(Math.floor(r() * P.length) % P.length, 1)[0];
      if (V232.giveCoach(k, 'ULTIMATE WIN', true) === 'new') R.coaches.push(k); else R.coachC += sell(1);
     } else R.coachC += sell(1);
    }
   }
   try {
    const Un = window.UNI21;
    if (Un && Un.on()) {
     Un.items();
     for (const k of [ 2, 3, 4, 5, 6 ].concat(Un.alt8 && Un.alt8(U.team) ? [ 8 ] : [])) {
      const id = Un.itemId(U.team, k);
      if (V17.BY[id] && !((ST.inv[id] || 0) > 0)) {
       V17.grant(id, 1);
       R.uni.push(id);
      }
     }
    }
   } catch (e) {
    console.error(e);
   }
   const c = R.chinos + R.dupC + R.coachC + R.rosterC + (R.ultC || 0);
   ST.chinos = (+ST.chinos || 0) + c;
   ST.stats.earned = (+ST.stats.earned || 0) + c;
   R.total = c;
   done.push(key);
   ST.v27.ult = done.slice(-30);
   V17.save();
  } catch (e) {
   console.error(e);
  }
  const tl = (pid, d) => ({
   img: cardImg(pid),
   n: PP(pid).n.toUpperCase(),
   sub: d ? 'HAD IT: +' + sell(V22.rarOf(pid)) + ' CHINOS' : [ 'COMMON', 'RARE', 'LEGENDARY' ][V22.rarOf(pid)] + ' - ' + String(T(realTeamOf(pid)).abbr || realTeamOf(pid)),
   col: RC[V22.rarOf(pid)]
  });
  const coachT = k => {
   let nm = k;
   try {
    nm = (V232.coaches()[k] || {}).n || k;
   } catch (e) {}
   return {
    img: '',
    n: nm,
    sub: 'COACH CARD - ' + String(T(k).name || k).toUpperCase(),
    col: '#ffcc33'
   };
  };
  const groups = [ {
   label: 'PACKS + CHINOS',
   tiles: [ {
    img: (() => {
     try {
      return V17.packUrl('legendary');
     } catch (e) {
      return '';
     }
    })(),
    n: '5 LEGENDARY PACKS',
    sub: 'IN THE SHOP: OPEN FREE',
    col: '#ffcc33'
   }, {
    img: '',
    n: '+' + R.total + ' CHINOS',
    sub: '200' + (R.total > 200 ? ' + ' + (R.total - 200) + ' FOR REPEATS' : ''),
    col: '#ffe14d'
   } ]
  }, {
   label: '10 LEGENDARY PLAYER CARDS',
   tiles: R.leg.map(x => tl(x.pid, x.dup))
  }, {
   label: '5 RARE PLAYER CARDS',
   tiles: R.rare.map(x => tl(x.pid, x.dup))
  }, {
   label: '3 COACH CARDS',
   tiles: R.coaches.map(coachT).concat(R.coaches.length < 3 ? [ {
    img: '',
    n: 3 - R.coaches.length + ' YOU HAD',
    sub: 'PAID IN CHINOS',
    col: '#ffe14d'
   } ] : [])
  }, {
   label: 'CHAMPIONS: ' + String(T(U.team).name).toUpperCase() + ' (EVERY SEASON-TITLE REWARD)',
   tiles: [ {
    img: (() => {
     try {
      return V17.iconUrl('trophy_ultimate');
     } catch (e) {
      return '';
     }
    })(),
    n: 'ULTIMATE TROPHY',
    sub: 'IN YOUR TROPHY CASE',
    col: '#ffcc33'
   }, R.flip34 != null ? {
    img: '',
    n: R.flip34 ? 'FLIP ' + R.flip34 + ' OF ' + R.deck34 + ' ROSTER CARDS' : 'NO NEW ROSTER CARDS',
    sub: R.flip34 ? 'ON THE HOME SCREEN' + (R.rosterC ? ' + ' + R.rosterC + ' CHINOS (HAD THEM)' : '') : R.rosterC ? '+ ' + R.rosterC + ' CHINOS (HAD THEM)' : 'YOU HAVE THEM ALL',
    col: '#7dff7a'
   } : {
    img: R.roster[0] ? cardImg(R.roster[0]) : '',
    n: R.roster.length + ' ROSTER CARDS',
    sub: R.rosterC ? '+ ' + R.rosterC + ' CHINOS (HAD THEM)' : 'THE WHOLE ROSTER',
    col: '#7dff7a'
   } ].concat(R.hc && R.hc.id ? [ coachT(R.hc.id) ] : []).concat(R.uni.map(id => ({
    img: icon(id),
    n: V17.BY[id].n,
    sub: 'UNIFORM',
    col: '#8fe3f0'
   })))
  } ];
  if (R.ult.length) groups.splice(1, 0, {
   label: R.ult.length + ' ULTIMATE CARD' + (R.ult.length === 1 ? '' : 'S') + ' (THE CARDS THAT WON IT, +' + (typeof ULT_BOOST === 'number' ? ULT_BOOST : 5) + ' EVERY RATING)',
   tiles: R.ult.map(x => Object.assign(tl(x.pid, x.dup), {
    n: window.ULT331 ? ULT331.label(x.pid) : PP(x.pid).n.toUpperCase(),
    col: '#ffcc33',
    pid35: x.pid
   }))
  });
  if (nc) {
   groups.length = 0;
   groups.push({
    label: 'CHINOS',
    tiles: [ {
     img: '',
     n: '+' + R.total + ' CHINOS',
     sub: R.ncx332 ? 'YOUR CARD TEAM WON WITH ITS OWN CARDS: ONLY NEW ULTIMATE VERSIONS' : 'NO CARDS: YOUR CARD TEAM WON WITH ITS OWN CARDS',
     col: '#ffe14d'
    } ]
   }, {
    label: 'CHAMPIONS: ' + String(T(U.team).name).toUpperCase(),
    tiles: [ {
     img: (() => {
      try {
       return V17.iconUrl('trophy_ultimate');
      } catch (e) {
       return '';
      }
     })(),
     n: 'ULTIMATE TROPHY',
     sub: 'IN YOUR TROPHY CASE',
     col: '#ffcc33'
    } ].concat(R.uni.map(id => ({
     img: icon(id),
     n: V17.BY[id].n,
     sub: 'UNIFORM',
     col: '#8fe3f0'
    })))
   });
   if (R.ncx332 && R.ult.length) groups.splice(1, 0, {
    label: R.ult.length + ' NEW ULTIMATE CARD' + (R.ult.length === 1 ? '' : 'S') + ' (+' + (typeof ULT_BOOST === 'number' ? ULT_BOOST : 5) + ' EVERY RATING)',
    tiles: R.ult.map(x => Object.assign(tl(x.pid, x.dup), {
     n: window.ULT331 ? ULT331.label(x.pid) : PP(x.pid).n.toUpperCase(),
     col: '#ffcc33',
     pid35: x.pid
    }))
   });
  }
  queue({
   id: key,
   head: 'ULTIMATE CHAMPIONS!',
   sub: 'YOUR ULTIMATE TOURNAMENT REWARDS',
   col: '#ffcc33',
   groups: groups
  });
  LOG.ult.push(R);
  return R;
 }
 let migT = 0;
 wrapG('step', function(o, a) {
  const r = o.apply(this, a);
  try {
   const t = performance.now();
   if (t - migT > 2e3) {
    migT = t;
    ghoMigrate();
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 setTimeout(() => {
  try {
   ghoMigrate();
  } catch (e) {
   console.error(e);
  }
 }, 0);
 const TT = {
  u: null,
  tb: null,
  busy: false,
  err: '',
  msg: '',
  poll: 0,
  picking: false,
  sel: null,
  inv: [],
  last: 0,
  splash: null,
  gen: 0
 };
 const ttOn = () => on('table') && !!(window.V24 && V24.on && V24.on() && V24.synced && window.V23 && V23.api);
 const tok = () => {
  try {
   return V23.A().tok;
  } catch (e) {
   return null;
  }
 };
 const TCSS = `#tt27{position:fixed;inset:0;z-index:44;background:radial-gradient(ellipse at 50% 55%,#1c3a2a,#0b1118 70%);color:#cfe;font:bold 12px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;display:flex;flex-direction:column;padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));box-sizing:border-box;touch-action:manipulation}\n#tt27 *{box-sizing:border-box}#tt27 h1{margin:0;font-size:17px;color:#b6ff3a;text-shadow:2px 2px 0 #000;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#tt27 .top{display:flex;align-items:center;gap:8px}#tt27 .top .st{flex:1;min-width:0;font-size:10px;color:#8fe3f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tt27 .top .st.here{color:#7dff7a}\n#tt27 .deck{flex:1;min-height:0;display:flex;gap:10px;margin:5px 0;align-items:stretch}\n#tt27 .side{flex:1;min-width:0;display:flex;flex-direction:column;background:rgba(10,22,30,.78);border:2px solid #2c4a5c;border-radius:6px;padding:4px 6px}\n#tt27 .side.acc{border-color:#7dff7a;box-shadow:0 0 12px rgba(125,255,122,.45)}#tt27 .side h2{margin:0 0 3px;font-size:12px;color:#ffe14d;display:flex;justify-content:space-between;align-items:center;gap:6px}#tt27 .side h2 span{font-size:10px;color:#8fe3f0}#tt27 .side.acc h2 span{color:#7dff7a}\n#tt27 .slots{flex:1;min-height:0;display:flex;gap:6px;justify-content:center;align-items:center}\n#tt27 .slot{flex:1 1 0;max-width:118px;height:100%;max-height:200px;border:2px dashed #3d5a6c;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#5d7a8c;font-size:10px;text-align:center;position:relative;cursor:pointer}\n#tt27 .slot .cd{width:100%;height:100%;background:#0b1118;border:2px solid #555;border-radius:4px;padding:3px;text-align:center;position:relative;display:flex;flex-direction:column;justify-content:center}\n#tt27 .slot .cd img{width:100%;height:58%;object-fit:contain;image-rendering:pixelated;display:block}#tt27 .slot .cd .nm{font-size:9px;line-height:10px;color:#fff;margin-top:2px;max-height:20px;overflow:hidden}#tt27 .slot .cd .rr{font-size:8px;line-height:9px}\n#tt27 .slot .cd i{position:absolute;left:0;right:0;top:4px;font-style:normal;font-size:8px;background:#000c;color:#ff8a7a}#tt27 .slot.new .cd{animation:tt27in .35s ease-out}@keyframes tt27in{from{transform:translateY(40px) scale(.7);opacity:0}to{transform:none;opacity:1}}\n#tt27 .slot .x{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:10px;background:#ff5a4a;color:#fff;font-size:12px;line-height:20px;text-align:center;z-index:2}\n#tt27 .bar{display:flex;align-items:center;gap:8px;background:#13202b;border:2px solid #ffe14d;padding:4px 8px}#tt27 .bar .tx{flex:1;min-width:0;font-size:10px}#tt27 .bar .tx b{color:#ffe14d;font-size:12px}#tt27 .err{color:#ff8a7a}#tt27 .ok{color:#7dff7a}\n#tt27 button{font:inherit;font-size:12px;border:0;border-radius:0;padding:8px 14px;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;background:#c9d6d9;white-space:nowrap}#tt27 button.g{background:#7dff7a}#tt27 button.r{background:#ff8a7a}#tt27 button.y{background:#ffe14d}#tt27 button[disabled]{opacity:.45}\n#tt27 .pick{position:absolute;inset:0;background:rgba(5,10,14,.96);display:flex;flex-direction:column;padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));z-index:3}\n#tt27 .pick .grid{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;flex-wrap:wrap;gap:4px;align-content:flex-start;margin:4px 0}\n#tt27 .pick .cd{width:66px;background:#0b1118;border:2px solid #555;padding:2px;text-align:center;cursor:pointer;position:relative}#tt27 .pick .cd img{width:100%;height:44px;object-fit:contain;image-rendering:pixelated;display:block}#tt27 .pick .cd .nm{font-size:8px;line-height:9px;height:18px;overflow:hidden;color:#fff}#tt27 .pick .cd .rr{font-size:7px;line-height:8px}\n#tt27 .pick .cd.sel{background:#28461f;box-shadow:0 0 0 2px #7dff7a}#tt27 .pick .cd.dis{opacity:.38}#tt27 .pick .cd i{position:absolute;left:0;right:0;top:14px;font-style:normal;font-size:7px;background:#000c;color:#ff8a7a}\n#tt27 .spl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.72);z-index:4;color:#7dff7a;font-size:22px;text-shadow:2px 2px 0 #000}`;
 let troot = null;
 function tel(tag, at, kids) {
  const e = document.createElement(tag);
  for (const k in at || {}) {
   if (k === 'text') e.textContent = at[k]; else if (k === 'on') for (const ev in at.on) e.addEventListener(ev, at.on[ev]); else e.setAttribute(k, at[k]);
  }
  for (const c of kids || []) if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
 }
 const tbtn = (label, cls, id, fn, dis) => {
  const b = tel('button', {
   class: cls || '',
   id: id,
   type: 'button'
  }, [ label ]);
  if (dis) b.setAttribute('disabled', '');
  b.addEventListener('click', e => {
   e.preventDefault();
   e.stopPropagation();
   if (!b.hasAttribute('disabled')) fn();
  });
  return b;
 };
 function tmount() {
  if (troot) return;
  document.head.appendChild(tel('style', {
   text: TCSS
  }));
  troot = tel('div', {
   id: 'tt27'
  });
  document.body.appendChild(troot);
  for (const ev of [ 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown' ]) troot.addEventListener(ev, e => e.stopPropagation());
 }
 async function tcall(b, extra) {
  const r = await V23.api('/tr24/' + b, Object.assign({
   tok: tok(),
   u: TT.u
  }, extra || {}));
  LOG.tt.push({
   b: b,
   ok: !!(r && r.ok),
   err: r && r.error,
   ver: r && r.table && r.table.ver
  });
  if (LOG.tt.length > 200) LOG.tt.splice(0, 100);
  return r || {
   ok: false,
   error: 'NO CONNECTION'
  };
 }
 function adopt(r) {
  if (!r || !r.table) return;
  const old = TT.tb, nt = r.table;
  TT.tb = nt;
  if (nt.res && nt.res.id && nt.res.id !== TT.last) {
   TT.last = nt.res.id;
   if (nt.res.ok) {
    const gotK = old ? old.theirs.slice() : [];
    if (r.trade) {
     try {
      V24.applyLocal(r.trade);
     } catch (e) {
      console.error(e);
     }
    }
    Promise.resolve(V24.refresh && V24.refresh()).then(() => trender(), () => {});
    TT.splash = {
     t: Date.now(),
     got: r.trade ? r.trade.get : gotK
    };
    TT.msg = 'TRADE DONE - THE CARDS ARE IN YOUR LOCKER ROOM';
    TT.err = '';
    try {
     SFX.cheer && SFX.cheer();
    } catch (e) {}
    setTimeout(() => {
     TT.splash = null;
     trender();
    }, 2200);
   } else if (old) TT.err = 'TRADE DID NOT GO THROUGH' + (nt.res.why ? ': ' + nt.res.why : '');
  }
 }
 const mineK = () => {
  try {
   return V24.myCards();
  } catch (e) {
   return [];
  }
 };
 function cardFace(k, o) {
  try {
   return V24.tile(k, o || {});
  } catch (e) {
   return tel('div', {
    class: 'cd',
    text: k
   });
  }
 }
 function slotsFor(keys, mine, prev) {
  const box = tel('div', {
   class: 'slots'
  }), have = new Set(mineK());
  for (let i = 0; i < 3; i++) {
   const k = keys[i], isNew = k && !(prev || []).includes(k);
   const s = tel('div', {
    class: 'slot' + (k ? ' full' : '') + (isNew ? ' new' : ''),
    'data-k': k || '',
    'data-i': String(i)
   });
   if (k) {
    s.appendChild(cardFace(k, {
     dis: !mine && have.has(k) ? 'YOU HAVE IT' : ''
    }));
    if (mine) {
     s.appendChild(tel('div', {
      class: 'x',
      text: '×'
     }));
     s.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      setPick(keys.filter(x => x !== k));
     });
    }
   } else {
    s.textContent = mine ? '+ ADD A CARD' : 'EMPTY';
    if (mine) s.addEventListener('click', e => {
     e.preventDefault();
     e.stopPropagation();
     openPick();
    });
   }
   box.appendChild(s);
  }
  return box;
 }
 let prevT = {
  mine: [],
  theirs: []
 };
 function trender() {
  if (!troot || !TT.u) return;
  troot.textContent = '';
  const tb = TT.tb, U = TT.u.toUpperCase();
  troot.appendChild(tel('div', {
   class: 'top'
  }, [ tel('h1', {
   text: 'TRADE TABLE - ' + U
  }), tel('div', {
   class: 'st' + (tb && tb.here ? ' here' : ''),
   id: 'tt27here',
   text: !tb ? 'CONNECTING...' : tb.here ? U + ' IS AT THE TABLE' : 'WAITING FOR ' + U + ' TO OPEN THE TRADE TABLE (FRIENDS > TRADE)'
  }), tbtn('BACK', '', 'tt27back', ttClose) ]));
  if (!tb) {
   troot.appendChild(tel('div', {
    class: 'tx',
    text: TT.err || 'LOADING...'
   }));
   return;
  }
  const L = tel('div', {
   class: 'side mine' + (tb.myAcc ? ' acc' : ''),
   id: 'tt27mine'
  }, [ tel('h2', {}, [ 'YOUR CARDS (' + tb.mine.length + '/3)', tel('span', {
   text: tb.myAcc ? 'YOU ACCEPTED ✔' : tb.dec === 'me' ? 'YOU DECLINED' : ''
  }) ]), slotsFor(tb.mine, true, prevT.mine) ]);
  const R = tel('div', {
   class: 'side theirs' + (tb.theirAcc ? ' acc' : ''),
   id: 'tt27theirs'
  }, [ tel('h2', {}, [ U + '\'S CARDS (' + tb.theirs.length + '/3)', tel('span', {
   text: tb.theirAcc ? U + ' ACCEPTED ✔' : tb.dec === 'them' ? U + ' DECLINED' : ''
  }) ]), slotsFor(tb.theirs, false, prevT.theirs) ]);
  prevT = {
   mine: tb.mine.slice(),
   theirs: tb.theirs.slice()
  };
  troot.appendChild(tel('div', {
   class: 'deck'
  }, [ L, R ]));
  const have = new Set(mineK()), rep = tb.theirs.some(k => have.has(k)), ready = tb.mine.length && tb.theirs.length && !rep;
  const txt = TT.err ? tel('span', {
   class: 'err',
   text: TT.err
  }) : TT.msg ? tel('span', {
   class: 'ok',
   text: TT.msg
  }) : rep ? tel('span', {
   class: 'err',
   text: 'NO REPEAT CARDS: YOU ALREADY HAVE ONE OF ' + U + '\'S CARDS - ASK FOR ANOTHER'
  }) : !tb.mine.length ? tel('span', {}, [ tel('b', {
   text: 'PUT UP TO 3 CARDS ON THE TABLE'
  }), ' - TAP + ADD A CARD' ]) : !tb.theirs.length ? tel('span', {}, [ 'WAITING FOR ' + U + ' TO PUT CARDS ON THE TABLE' ]) : tb.myAcc && tb.theirAcc ? tel('b', {
   text: 'TRADING...'
  }) : tb.myAcc ? tel('span', {}, [ tel('b', {
   text: 'WAITING FOR ' + U + ' TO ACCEPT'
  }) ]) : tel('span', {}, [ tel('b', {
   text: 'BOTH ACCEPT = TRADE'
  }), ' - FREE, NO CHINOS - ANY CHANGE RESETS BOTH' ]);
  troot.appendChild(tel('div', {
   class: 'bar'
  }, [ tel('div', {
   class: 'tx',
   id: 'tt27msg'
  }, [ txt ]), tbtn(TT.busy ? '...' : tb.myAcc ? 'ACCEPTED' : 'ACCEPT', 'g', 'tt27acc', accept, !ready || tb.myAcc || TT.busy), tbtn('DECLINE', 'r', 'tt27dec', decline, TT.busy || !tb.myAcc && !tb.theirAcc && tb.dec === 'me') ]));
  if (TT.picking) troot.appendChild(pickHtml());
  if (TT.splash) {
   const sp = tel('div', {
    class: 'spl',
    id: 'tt27done'
   }, [ 'TRADE DONE!' ]);
   const row = tel('div', {
    style: 'display:flex;gap:6px;margin-top:8px'
   });
   for (const k of TT.splash.got || []) {
    const c = cardFace(k);
    c.style.cssText = 'width:80px';
    row.appendChild(c);
   }
   sp.appendChild(row);
   troot.appendChild(sp);
  }
 }
 function pickHtml() {
  const tb = TT.tb || {
   mine: [],
   theirs: []
  }, sel = TT.sel || new Set(tb.mine), theirsHave = new Set;
  const cards = V24.sortK ? V24.sortK(mineK()) : mineK();
  const g = tel('div', {
   class: 'grid',
   id: 'tt27grid'
  });
  for (const k of cards) g.appendChild(cardFace(k, {
   sel: sel.has(k),
   dis: !sel.has(k) && sel.size >= 3 ? 'MAX 3' : '',
   tap: () => {
    sel.has(k) ? sel.delete(k) : sel.size < 3 && sel.add(k);
    TT.sel = sel;
    trender();
   }
  }));
  if (!cards.length) g.appendChild(tel('div', {
   text: 'NO PLAYER CARDS YET - WIN A TITLE OR OPEN PACKS'
  }));
  return tel('div', {
   class: 'pick',
   id: 'tt27pick'
  }, [ tel('div', {
   class: 'top'
  }, [ tel('h1', {
   text: 'PICK UP TO 3 OF YOUR CARDS'
  }), tel('div', {
   class: 'st',
   text: sel.size + ' / 3 PICKED'
  }), tbtn('CANCEL', '', 'tt27pcancel', () => {
   TT.picking = false;
   TT.sel = null;
   trender();
  }) ]), g, tel('div', {
   class: 'bar'
  }, [ tel('div', {
   class: 'tx',
   text: 'THEY SLIDE ONTO THE TRADING DECK FOR ' + TT.u.toUpperCase() + ' TO SEE'
  }), tbtn('PUT ON TABLE', 'g', 'tt27put', () => {
   const p = [ ...sel ];
   TT.picking = false;
   TT.sel = null;
   setPick(p);
  }) ]) ]);
 }
 function openPick() {
  TT.picking = true;
  TT.sel = new Set(TT.tb && TT.tb.mine || []);
  trender();
 }
 async function setPick(p) {
  if (TT.busy) return;
  TT.busy = true;
  TT.err = '';
  TT.msg = '';
  trender();
  try {
   let r = await tcall('tt_set', {
    pick: p.slice(0, 3)
   });
   if (!r.ok && /SYNC/.test(r.error || '')) {
    const why = await V24.synced();
    if (!why) r = await tcall('tt_set', {
     pick: p.slice(0, 3)
    }); else r = {
     ok: false,
     error: why
    };
   }
   if (!r.ok) TT.err = r.error || 'DID NOT WORK';
   adopt(r);
  } finally {
   TT.busy = false;
   trender();
  }
 }
 async function accept() {
  if (TT.busy || !TT.tb) return;
  TT.busy = true;
  TT.err = '';
  TT.msg = '';
  trender();
  try {
   const why = await V24.synced();
   if (why) {
    TT.err = why;
    return;
   }
   const r = await tcall('tt_acc', {
    ver: TT.tb.ver
   });
   if (!r.ok) TT.err = r.error || 'DID NOT WORK';
   adopt(r);
  } finally {
   TT.busy = false;
   trender();
  }
 }
 async function decline() {
  if (TT.busy) return;
  TT.busy = true;
  TT.err = '';
  TT.msg = '';
  try {
   const r = await tcall('tt_dec');
   if (!r.ok) TT.err = r.error || 'DID NOT WORK';
   adopt(r);
  } finally {
   TT.busy = false;
   trender();
  }
 }
 async function tpoll(g) {
  if (g !== TT.gen || !TT.u || TT.busy || document.visibilityState !== 'visible') return;
  const r = await tcall('tt_get');
  if (g !== TT.gen) return;
  if (r.ok) {
   const before = JSON.stringify(TT.tb);
   adopt(r);
   if (JSON.stringify(TT.tb) !== before) {
    if (TT.msg && !TT.splash) TT.msg = '';
    trender();
   }
  }
 }
 function ttOpen(u) {
  if (!ttOn()) return false;
  tmount();
  TT.u = String(u);
  TT.tb = null;
  TT.err = '';
  TT.msg = '';
  TT.picking = false;
  TT.sel = null;
  TT.splash = null;
  TT.last = 0;
  prevT = {
   mine: [],
   theirs: []
  };
  const g = ++TT.gen;
  troot.style.display = 'flex';
  trender();
  (async () => {
   const why = await V24.synced();
   if (g !== TT.gen) return;
   if (why) {
    TT.err = why;
   }
   const r = await tcall('tt_get', {
    hello: 1
   });
   if (g !== TT.gen) return;
   if (r.ok) {
    TT.last = r.table && r.table.res ? r.table.res.id : 0;
    adopt(r);
   } else TT.err = r.error || 'NO CONNECTION';
   trender();
  })();
  clearInterval(TT.poll);
  TT.poll = setInterval(() => tpoll(g), 1e3);
  return true;
 }
 function ttClose() {
  const u = TT.u;
  TT.gen++;
  clearInterval(TT.poll);
  TT.u = null;
  TT.tb = null;
  if (troot) troot.style.display = 'none';
  if (u) V23.api('/tr24/tt_leave', {
   tok: tok(),
   u: u
  }).catch(() => {});
  try {
   V23.render();
  } catch (e) {}
 }
 const ttWait = {
  list: [],
  told: {}
 };
 if (window.V23) {
  const H0 = V23.tr24hb;
  V23.tr24hb = function(x) {
   const r = typeof H0 === 'function' ? H0.apply(this, arguments) : undefined;
   try {
    if (on('table') && x) {
     ttWait.list = Array.isArray(x.tt) ? x.tt : [];
     for (const u of ttWait.list) if (!ttWait.told[u] && TT.u !== u) {
      ttWait.told[u] = 1;
      try {
       V17.toast(String(u).toUpperCase() + ' IS AT THE TRADE TABLE - FRIENDS > TRADE', '#7dff7a');
      } catch (e) {}
     }
     for (const u in ttWait.told) if (!ttWait.list.includes(u)) delete ttWait.told[u];
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 if (window.V24 && V24.rowsInto) {
  const R0 = V24.rowsInto;
  V24.rowsInto = function(col, el2, btn2) {
   try {
    if (ttOn()) for (const u of ttWait.list) col.appendChild(el2('div', {
     class: 'row tt27 inc23',
     'data-u': u
    }, [ el2('span', {
     class: 'n',
     text: String(u).toUpperCase() + ' IS AT THE TRADE TABLE'
    }), btn2('JOIN', 'g', () => ttOpen(u)) ]));
   } catch (e) {
    console.error(e);
   }
   return R0.apply(this, arguments);
  };
 }
 const nk = n => String(n || '').toUpperCase().replace(/[^A-Z]/g, '');
 let PIDS = null;
 function poker() {
  const P = pool();
  if (!PIDS) {
   PIDS = new Map;
   for (const id of P.ids) {
    const k = nk(PP(id).n);
    if (!PIDS.has(k)) PIDS.set(k, []);
    PIDS.get(k).push(id);
   }
  }
  let pl = 0;
  for (const [, ids] of PIDS) if (ids.some(id => V22.owned(id))) pl++;
  let tew = 0, aa = 0;
  try {
   const C = window.HON25 && HON25.cards ? HON25.cards() : [];
   tew = Math.min(1, C.filter(k => HON25.kindOf(k) === 'tew').length);
   aa = Math.min(6, C.filter(k => HON25.kindOf(k) === 'aa').length);
  } catch (e) {}
  const all = [];
  try {
   for (const t of TEAMS) all.push(t.id);
   for (const k in WT_REG) all.push(k);
  } catch (e) {}
  const o = id => {
   try {
    return window.HON25 && HON25.coachOwnerTid ? HON25.coachOwnerTid(id) : id;
   } catch (e) {
    return id;
   }
  };
  const cu = new Set(all.map(o).filter(Boolean)), own = window.V232 && V232.coaches ? V232.coaches() : {};
  let co = 0;
  for (const k of cu) if (own[k]) co++;
  const crew = V17.I.filter(it => it.sec === 'crew'), ST = V17.ST();
  let cr = 0;
  for (const it of crew) if ((ST.inv[it.id] || 0) > 0) cr++;
  const need = PIDS.size + 1 + 6 + cu.size + crew.length, have = pl + tew + aa + co + cr;
  return {
   hn: [ have, need ],
   players: [ pl, PIDS.size ],
   tew: [ tew, 1 ],
   aa: [ aa, 6 ],
   coaches: [ co, cu.size ],
   crew: [ cr, crew.length ]
  };
 }
 const PLOG = {
  sets: 0,
  preps: 0,
  slides: 0
 };
 function openness(p, G) {
  let m = 99;
  for (const d of G.players) if (d.team === 'D' && !d.goalie && !(d.stun > 0)) m = Math.min(m, Math.hypot(d.x - p.x, d.y - p.y));
  return m;
 }
 function laneOk(a, b, G) {
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  for (const d of G.players) {
   if (d.team !== 'D' || d.stun > 0) continue;
   const t = Math.max(0, Math.min(1, ((d.x - a.x) * (b.x - a.x) + (d.y - a.y) * (b.y - a.y)) / (L * L)));
   if (t > .08 && t < .92 && Math.hypot(a.x + (b.x - a.x) * t - d.x, a.y + (b.y - a.y) * t - d.y) < 5.5) return false;
  }
  return true;
 }
 function smart27(dt) {
  const G = game, R = G && G.playRun;
  if (!R || R.done || !R.map || G.tutorial) return;
  const c = G.carrier, b = G.ball;
  if (!c || c.team !== 'O' || !b || b.state === 'pass' || b.state === 'shot') return;
  for (const p of R.map) {
   if (!p || p === c || !p.playT || p.pickSet || p.goalie) continue;
   let dd = null, best = 14;
   for (const d of G.players) {
    if (d.team !== 'D' || d.goalie || d.stun > 0) continue;
    const k = Math.hypot(d.x - p.x, d.y - p.y);
    if (k < best) {
     best = k;
     dd = d;
    }
   }
   if (!dd) continue;
   const tx = p.playT[0], ty = p.playT[1], rem = Math.hypot(tx - p.x, ty - p.y);
   if (rem < 6) continue;
   const ux = (tx - p.x) / rem, uy = (ty - p.y) / rem, side = (dd.x - p.x) * -uy + (dd.y - p.y) * ux > 0 ? -1 : 1, k = Math.min(7, rem * .4) * (1 - best / 14);
   p.playT = [ tx + -uy * side * k, ty + ux * side * k ];
   PLOG.slides++;
  }
  if (R.prep27 && G.t - R.prep27 < .8) return;
  const cr = (window.DZ && DZ.checkR || 9) * 1.9;
  let close = null;
  for (const d of G.players) {
   if (d.team !== 'D' || d.goalie || d.stun > 0) continue;
   const k = Math.hypot(d.x - c.x, d.y - c.y);
   if (k < cr && (d.mark === c || G.slide === d || k < cr * .75)) {
    close = d;
    break;
   }
  }
  if (!close) return;
  const mates = R.map.filter(p => p && p !== c && !p.goalie && G.players.includes(p) && !(p.down > 0) && laneOk(c, p, G));
  if (!mates.length) return;
  let to = null;
  try {
   const e = R.plan && R.plan.balls[R.bi || 0];
   if (e && e.kind === 'pass' && R.map[e.to] && mates.includes(R.map[e.to]) && openness(R.map[e.to], G) > 10) to = R.map[e.to];
  } catch (e) {}
  if (!to) {
   to = mates.reduce((a, p) => openness(p, G) > openness(a, G) ? p : a, mates[0]);
   if (openness(to, G) < 7) return;
  }
  R.prep27 = G.t;
  PLOG.preps++;
  PLOG.prepD = (PLOG.prepD || []).concat(+Math.hypot(close.x - c.x, close.y - c.y).toFixed(1)).slice(-60);
  G.prep27 = (G.prep27 || 0) + 1;
  try {
   throwPass(to);
  } catch (e) {
   console.error(e);
  }
 }
 if (typeof window.playTick === 'function') {
  const PT0 = window.playTick;
  window.playTick = function(dt) {
   const G = game;
   if (on('autoset') && G && screen === 'live' && !G.tutorial && G.playSel && !G.pset && !(G.playRun && !G.playRun.done) && G.auto27 !== G.possCount + '|' + G.playSel && typeof playSetBtnState === 'function' && playSetBtnState() === 'SET') {
    G.auto27 = G.possCount + '|' + G.playSel;
    if (playSet()) {
     PLOG.sets++;
     G.autoSet27 = (G.autoSet27 || 0) + 1;
    }
   }
   const r = PT0.apply(this, arguments);
   if (on('smart')) try {
    smart27(dt);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 const spg = s => s && s.pg || 1;
 const maxPg = pl => pl && pl.steps ? pl.steps.reduce((m, s) => Math.max(m, spg(s)), 1) : 1;
 const pgOn = () => on('pages');
 function pgCur() {
  if (typeof PM === 'undefined' || !PM) return 1;
  if (PM.page == null) PM.page = maxPg(PM.play);
  return PM.page;
 }
 function pgSort(pl) {
  const a = pl.steps.map((s, i) => [ s, i ]);
  a.sort((x, y) => spg(x[0]) - spg(y[0]) || x[1] - y[1]);
  pl.steps = a.map(x => x[0]);
 }
 if (typeof window.pmPush === 'function') {
  const P0 = window.pmPush;
  window.pmPush = function(step) {
   if (pgOn() && PM && step) step.pg = pgCur();
   const r = P0.apply(this, arguments);
   if (pgOn() && PM && maxPg(PM.play) > 1) pgSort(PM.play);
   return r;
  };
 }
 if (typeof window.pmState === 'function') {
  const S0 = window.pmState;
  window.pmState = function(pl, upto) {
   if (upto == null && pgOn() && (typeof PM !== 'undefined' && PM) && PM.play === pl && !PM.preview && screen === 'playmaker') {
    const c = pgCur();
    if (c < maxPg(pl)) upto = pl.steps.filter(s => spg(s) <= c).length;
   }
   return S0.call(this, pl, upto);
  };
 }
 if (typeof window.pmUndo === 'function') {
  const U0 = window.pmUndo;
  window.pmUndo = function() {
   if (pgOn() && PM && PM.play.steps.length) {
    const c = pgCur(), st = PM.play.steps;
    let k = -1;
    for (let i = st.length - 1; i >= 0; i--) if (spg(st[i]) === c) {
     k = i;
     break;
    }
    if (k >= 0) {
     const s = st.splice(k, 1)[0];
     PM.msg = 'UNDO: ' + pmStepText(s);
     return;
    }
    if (c > 1 || maxPg(PM.play) > 1) {
     PM.msg = 'NOTHING ON PAGE ' + c + ' TO UNDO';
     return;
    }
   }
   return U0.apply(this, arguments);
  };
 }
 if (typeof window.pmClear === 'function') {
  const C0 = window.pmClear;
  window.pmClear = function() {
   const r = C0.apply(this, arguments);
   if (PM) PM.page = 1;
   return r;
  };
 }
 function pgFlip(d) {
  if (!PM) return;
  const c = pgCur(), st = PM.play.steps;
  if (d > 0) {
   if (!st.some(s => spg(s) === c) && !st.some(s => spg(s) > c)) {
    PM.msg = 'MOVE SOMEONE ON PAGE ' + c + ' FIRST';
    PM.flash = .8;
    try {
     SFX.bad();
    } catch (e) {}
    return;
   }
   PM.page = c + 1;
  } else {
   if (c <= 1) return;
   PM.page = c - 1;
  }
  PM.preview = null;
  PM.msg = 'PAGE ' + PM.page + (st.some(s => spg(s) === PM.page) ? '' : ' - MOVE GUYS: THEY GO AFTER PAGE ' + (PM.page - 1));
  PM.flash = .6;
  try {
   SFX.tap();
  } catch (e) {}
 }
 function pmTop(pl, st) {
  if (!pgOn() || !PM) return false;
  const c = pgCur(), n = maxPg(pl), onPg = pl.steps.filter(s => spg(s) === c).length;
  text('PAGE ' + c + (n > 1 ? '/' + n : ''), 34, 10, 1, '#8fe3f0');
  const bw = 38, x0 = W - 37 * 5 - 2 - (bw * 2 + 2) - 2;
  button('PREV PAGE', x0, 2, bw, 13, () => pgFlip(-1), {
   bg: c > 1 ? '#c9d6d9' : '#56606a'
  });
  button('NEXT PAGE', x0 + bw + 2, 2, bw, 13, () => pgFlip(1), {
   bg: '#ffe14d'
  });
  return true;
 }
 function pgHide(s) {
  return pgOn() && (typeof PM !== 'undefined' && PM) && !PM.preview && spg(s) > pgCur();
 }
 function pmGhosts(pl, kit) {
  if (!pgOn() || !PM || PM.preview) return;
  const c = pgCur();
  if (c <= 1) return;
  const pos = pl.start.map(q => q.slice()), prev = pl.start.map(() => null), early = pl.start.map(() => false);
  for (const s of pl.steps) {
   if (spg(s) > c) break;
   if (s.t === 'move' || s.t === 'pick') {
    prev[s.p] = pos[s.p].slice();
    pos[s.p] = [ s.x, s.y ];
    if (spg(s) < c) early[s.p] = true;
   }
  }
  PM.ghosts27 = [];
  g.save();
  g.globalAlpha = .33;
  prev.forEach((q, i) => {
   if (!q || !early[i]) return;
   PM.ghosts27.push([ i, q[0], q[1] ]);
   try {
    const p = {
     x: q[0],
     y: q[1],
     anim: 0
    };
    drawPlayer(p, kit, true);
    drawStick(p, true, false);
   } catch (e) {}
  });
  g.restore();
  for (const [i, x, y] of PM.ghosts27) for (let u = .12; u < .9; u += .12) px(x + (pos[i][0] - x) * u, y + (pos[i][1] - y) * u - 2, 'rgba(255,255,255,.25)');
 }
 if (typeof window.pmTimeline === 'function') {
  const TL0 = window.pmTimeline;
  window.pmTimeline = function(pl) {
   if (!pgOn() || maxPg(pl) <= 1) return TL0.apply(this, arguments);
   const steps = pl.steps.map((s, i) => [ s, i ]).sort((x, y) => spg(x[0]) - spg(y[0]) || x[1] - y[1]).map(x => x[0]);
   const pos = pl.start.map(q => q.slice()), free = pl.start.map(() => 0), gotBall = pl.start.map((q, i) => i === pl.car ? 0 : null);
   let car = pl.car, ballT = 0, cur = 1, bar = 0;
   const segs = [], balls = [];
   steps.forEach(s => {
    const j = pl.steps.indexOf(s), pg = spg(s);
    if (pg > cur) {
     bar = Math.max(bar, ballT, ...segs.map(q => q.t1));
     cur = pg;
    }
    if (s.t === 'move' || s.t === 'pick') {
     let t0 = Math.max(free[s.p], bar);
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
      on: s.on,
      pg: pg
     });
     pos[s.p] = [ s.x, s.y ];
     free[s.p] = t1;
    } else if (s.t === 'pass') {
     const rMoves = segs.some(q => q.p === s.to);
     const t0 = Math.max(bar, ballT, free[s.from], rMoves ? free[s.to] : ballT + PM_TL.beat, gotBall[s.from] != null ? gotBall[s.from] : 0);
     const a = pos[s.from].slice(), c = pos[s.to].slice(), t1 = t0 + Math.max(.3, Math.hypot(c[0] - a[0], c[1] - a[1]) / PM_TL.pass);
     balls.push({
      j: j,
      kind: 'pass',
      from: s.from,
      to: s.to,
      t0: t0,
      t1: t1,
      a: a,
      c: c,
      pg: pg
     });
     ballT = t1;
     car = s.to;
     gotBall[s.to] = t1;
    } else if (s.t === 'shot') {
     const t0 = Math.max(bar, ballT, free[s.p], ...segs.filter(q => q.pick).map(q => q.t1)), a = pos[s.p].slice();
     balls.push({
      j: j,
      kind: 'shot',
      p: s.p,
      t0: t0,
      t1: t0 + PM_TL.shot,
      a: a,
      pg: pg
     });
     ballT = t0 + PM_TL.shot;
    }
   });
   return {
    segs: segs,
    balls: balls,
    dur: Math.max(.3, ballT, ...segs.map(q => q.t1)),
    pages: cur
   };
  };
 }
 function curPg(R) {
  const P2 = R.plan;
  if (!P2) return 1;
  let m = 1e9;
  P2.routes.forEach((route, i) => {
   const p = R.map[i];
   if (!p || !game.players.includes(p)) return;
   const sg = route[R.ri ? R.ri[i] || 0 : 0];
   if (sg) m = Math.min(m, spg(R.pl.steps[sg.j]));
  });
  const e = P2.balls[R.bi || 0];
  if (e) m = Math.min(m, spg(R.pl.steps[e.j]));
  if (m === 1e9) m = 99;
  if (R.pg27 !== m) {
   if (R.pg27 != null && m > 1 && m < 99 && maxPg(R.pl) > 1) {
    try {
     addFx('cue', 0, 0, {
      s: 'PAGE ' + m,
      col: '#8fe3f0',
      life: .9
     });
    } catch (e) {}
    R.pgLog27 = (R.pgLog27 || []).concat([ [ m, +game.t.toFixed(2) ] ]);
   }
   R.pg27 = m;
  }
  return m;
 }
 function pgWait(R, seg, p) {
  if (!pgOn() || !R || !R.pl || !seg) return false;
  const pg = spg(R.pl.steps[seg.j]);
  if (pg <= 1) return false;
  if (pg <= curPg(R)) return false;
  if (p !== game.carrier && !p.pickSet && !p.callPick) {
   p.playT = null;
   p.playHold = p.playHold || [ p.x, p.y ];
  }
  return true;
 }
 function pgWaitBall(R, e) {
  if (!pgOn() || !R || !R.pl || !e) return false;
  const pg = spg(R.pl.steps[e.j]);
  return pg > 1 && pg > curPg(R);
 }
 window.V27 = Object.assign(window.V27 || {}, {
  on: on,
  LOG: LOG,
  trainerOf: trainerOf,
  recov: recov,
  pool: pool,
  cardItem: cardItem,
  pickPlayer: pickPlayer,
  packRoll: packRoll,
  packCards: packCards,
  shopIds: shopIds,
  shopTile: shopTile,
  claims: claims,
  queue: queue,
  collect: collect,
  showClaim: showClaim,
  menuFree27: menuFree27,
  g27px: g27px,
  analyse: analyse,
  ghoMigrate: ghoMigrate,
  ultWin: ultWin,
  coachPool: coachPool,
  ttOn: ttOn,
  ttOpen: ttOpen,
  ttClose: ttClose,
  TT: TT,
  ttWait: ttWait,
  poker: poker,
  PLOG: PLOG,
  smart27: smart27,
  pgCur: pgCur,
  pgFlip: pgFlip,
  pmTop: pmTop,
  pgHide: pgHide,
  pmGhosts: pmGhosts,
  pgWait: pgWait,
  pgWaitBall: pgWaitBall,
  curPg: curPg,
  maxPg: maxPg
 });
})();
