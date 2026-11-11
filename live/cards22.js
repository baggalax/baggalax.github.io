'use strict';

const V22 = (() => {
 const on = () => !window.__rl_no22 && !window.__rl_v124gb;
 let S = (() => {
  const s = LS.get('v22', null);
  return s && typeof s === 'object' ? s : {};
 })();
 function fix() {
  if (!S.cards || typeof S.cards !== 'object' || Array.isArray(S.cards)) S.cards = {};
  if (!S.v) S.v = 1;
 }
 fix();
 const save = () => LS.set('v22', S);
 const RARN = [ 'COMMON', 'RARE', 'LEGENDARY' ], RCOLS = [ '#9aa3ab', '#3d8bff', '#ffcc33' ];
 const RAR22 = {
  leg: 88,
  rare: 78
 };
 const GH16C = '#b48aff', gh16 = pid => {
  const p = PP(pid);
  return !!(p && p.gho16);
 };
 const rarOf = pid => {
  const p = PP(pid), o = p ? p.ovr : 0;
  return o >= RAR22.leg ? 2 : o >= RAR22.rare ? 1 : 0;
 };
 const cardable = pid => {
  const p = PP(pid);
  return !!p && !p.leg;
 };
 const owned = pid => on() && !!S.cards[pid] && cardable(pid);
 const ownedIds = () => on() ? Object.keys(S.cards).filter(owned) : [];
 function grantIds(ids, tid, why) {
  const out = [];
  for (const id of ids || []) {
   if (!cardable(id) || S.cards[id]) continue;
   S.cards[id] = {
    t: tid || PP(id).team,
    at: Date.now(),
    w: why || ''
   };
   out.push(id);
  }
  if (out.length) save();
  return out;
 }
 function popup(key, head, txt, ids) {
  if (!ids.length || !window.V17 || !V17.ST) return;
  const ST = V17.ST();
  if (!Array.isArray(ST.chalClaim)) return;
  const id = 'c22|' + key;
  if (ST.chalClaim.some(q => q.id === id)) return;
  const n = [ 0, 0, 0 ];
  for (const p of ids) n[rarOf(p)]++;
  ST.chalClaim.push({
   id: id,
   k: 'c22',
   c22: 1,
   head: head,
   txt: txt,
   pay: 0,
   item: null,
   pack: null,
   n: ids.length,
   r: n,
   top: ids.slice().sort((a, b) => PP(b).ovr - PP(a).ovr)[0]
  });
  try {
   V17.save();
  } catch (e) {}
 }
 const tname = tid => {
  try {
   return T(tid).name;
  } catch (e) {
   return '';
  }
 };
 function titleCheck(Sz, w) {
  if (!on()) return 0;
  let n = 0;
  try {
   if (Sz && Sz.phase === 'done' && Sz.champ && Sz.champ === Sz.team && Sz.rosters && Sz.rosters[Sz.team]) {
    const what = Sz.online ? 'ONLINE SEASON' : 'SEASON', fs = flipSplit(Sz.rosters[Sz.team], Sz.team, what, szKey34(Sz)), got = grantIds(fs ? fs.pass : Sz.rosters[Sz.team], Sz.team, what);
    n += got.length;
    popup('sz|' + (Sz.year || '') + '|' + Sz.team + '|' + (Sz.online ? 1 : 0) + '|' + Date.now(), 'TITLE WON - PLAYER CARDS!', what + ' CHAMPIONS! EVERY PLAYER ON YOUR ' + tname(Sz.team) + ' ROSTER IS NOW A PLAYER CARD', got);
   }
   if (w && w.phase === 'done' && w.champ && w.champ === w.team) {
    const wr = teamRosterIds(w.team, 'real'), fs = flipSplit(wr, w.team, 'WORLD GAMES', wgKey34(w)), got = grantIds(fs ? fs.pass : wr, w.team, 'WORLD GAMES');
    n += got.length;
    popup('wg|' + w.team + '|' + Date.now(), 'TITLE WON - PLAYER CARDS!', 'WORLD GAMES CHAMPIONS! EVERY PLAYER ON YOUR ' + tname(w.team) + ' ROSTER IS NOW A PLAYER CARD', got);
   }
  } catch (e) {
   console.error(e);
  }
  return n;
 }
 const FK = 'v34flip';
 const flipOn = () => on() && !window.__rl_no34flip;
 let F = null;
 function fget() {
  if (F) return F;
  let o = null;
  try {
   o = LS.get(FK, null);
  } catch (e) {
   o = null;
  }
  if (!o || typeof o !== 'object' || Array.isArray(o)) o = null;
  if (o) {
   if (!Array.isArray(o.q)) o.q = [];
   if (!Array.isArray(o.done)) o.done = [];
   if (!Array.isArray(o.old)) o.old = [];
   o.q = o.q.filter(d => d && typeof d === 'object' && d.k && Array.isArray(d.ids));
   F = o;
   return F;
  }
  F = {
   v: 1,
   q: [],
   done: [],
   old: []
  };
  try {
   const S0 = typeof season !== 'undefined' ? season : null;
   if (S0 && S0.phase === 'done' && S0.champ && S0.champ === S0.team) F.old.push(szKey34(S0));
  } catch (e) {}
  try {
   const w0 = typeof wgame !== 'undefined' ? wgame : null;
   if (w0 && w0.phase === 'done' && w0.champ && w0.champ === w0.team) F.old.push(wgKey34(w0));
  } catch (e) {}
  fsave();
  return F;
 }
 function fsave() {
  try {
   if (F) {
    F.done = F.done.slice(-300);
    LS.set(FK, F);
   }
  } catch (e) {
   console.error(e);
  }
 }
 const szKey34 = Sz => 'S|' + (Sz.online ? 'o|' + (Sz.code || '') : 'f|' + (Sz.year || '')) + '|' + Sz.team;
 const wgKey34 = w => 'W|' + w.team + '|' + (w.n || '');
 const rnd34 = () => {
  try {
   const b = new Uint32Array(1);
   crypto.getRandomValues(b);
   return b[0] / 4294967296;
  } catch (e) {
   return Date.now() % 9973 / 9973;
  }
 };
 const noDeck = id => {
  const s = String(id || '');
  if (/^U_|^(AA25|TW25)-/.test(s)) return true;
  try {
   if (window.C30 && C30.parse && C30.parse(s)) return true;
  } catch (e) {}
  return false;
 };
 function flipSplit(ids, tid, why, key) {
  if (!flipOn() || !Array.isArray(ids) || !key) return null;
  const D = fget();
  if (D.old.includes(key)) return null;
  const have = D.q.find(d => d.k === key);
  const inQ = new Set;
  for (const d of D.q) if (d !== have) for (const id of d.ids) inQ.add(id);
  const cand = have ? have.ids : [ ...new Set(ids) ].filter(id => cardable(id) && !S.cards[id] && !noDeck(id) && !inQ.has(id)), pass = ids.filter(id => !cand.includes(id) && !inQ.has(id));
  if (have) return {
   pass: pass,
   deck: have.ids.slice(),
   need: have.need
  };
  if (D.done.includes(key)) return {
   pass: pass,
   deck: [],
   need: 0
  };
  if (!cand.length) return {
   pass: pass,
   deck: [],
   need: 0
  };
  const a = cand.slice();
  for (let i = a.length - 1; i > 0; i--) {
   const j = Math.floor(rnd34() * (i + 1));
   const t = a[i];
   a[i] = a[j];
   a[j] = t;
  }
  let base = null;
  try {
   base = typeof SZ_REG !== 'undefined' && SZ_REG[tid] && SZ_REG[tid].szBase ? SZ_REG[tid].szBase : null;
  } catch (e) {}
  const d = {
   k: key,
   tid: tid,
   base: base,
   why: why || '',
   ids: a,
   f: [],
   g: [],
   need: Math.min(6, a.length),
   at: Date.now()
  };
  if (!window.__rl_no35flipfix && !window.__rl_v124gb) d.all35 = [ ...new Set(ids) ].filter(id => cardable(id) && !noDeck(id));
  D.q.push(d);
  fsave();
  LOG34.push([ 'deck', key, a.length, d.need ]);
  return {
   pass: pass,
   deck: a.slice(),
   need: d.need
  };
 }
 const LOG34 = [];
 function flipNeed(d) {
  if (!d) return 0;
  let left = 0;
  for (let i = 0; i < d.ids.length; i++) if (!d.f.includes(i) && !S.cards[d.ids[i]]) left++;
  return Math.min(d.need, d.f.length + left);
 }
 const flipGone = (d, i) => !!(d && !d.f.includes(i) && S.cards[d.ids[i]]);
 function flipDecks() {
  if (!on()) return [];
  return fget().q.slice();
 }
 function flipPrune35(key) {
  if (!on() || window.__rl_no35flipfix || window.__rl_v124gb) return null;
  const D = fget(), d = D.q.find(x => x.k === key);
  if (!d) return null;
  const inQ = new Set;
  for (const o of D.q) if (o !== d) for (const id of o.ids) inQ.add(id);
  const back = [];
  for (const id of [ ...Array.isArray(d.all35) ? d.all35 : [], ...Array.isArray(d.out35) ? d.out35 : [] ]) if (!S.cards[id] && !d.ids.includes(id) && !inQ.has(id) && !back.includes(id) && cardable(id) && !noDeck(id)) back.push(id);
  const keep = [];
  for (let i = 0; i < d.ids.length; i++) if (d.f.includes(i) || !S.cards[d.ids[i]]) keep.push(i);
  if (keep.length === d.ids.length && !back.length) return null;
  const map = new Map(keep.map((o, n) => [ o, n ])), drop = d.ids.filter((id, i) => !map.has(i));
  d.ids = keep.map(i => d.ids[i]).concat(back);
  d.f = d.f.filter(i => map.has(i)).map(i => map.get(i));
  d.g = (Array.isArray(d.g) ? d.g : []).filter(i => map.has(i)).map(i => map.get(i));
  d.out35 = (Array.isArray(d.out35) ? d.out35 : []).filter(id => !back.includes(id)).concat(drop.filter(id => !(d.out35 || []).includes(id)));
  if (back.length) d.need = Math.max(d.need | 0, Math.min(6, d.ids.length));
  fsave();
  LOG34.push([ 'prune35', key, drop.length, back.length, d.ids.length ]);
  if (d.ids.length === 0) {
   flipDone(key);
   return 'empty';
  }
  return 'pruned';
 }
 const flipTid = d => {
  try {
   if (d.base && !(typeof SZ_REG !== 'undefined' && SZ_REG[d.tid])) return d.base;
  } catch (e) {}
  return d.tid;
 };
 function flipPick(key, i) {
  const D = fget(), d = D.q.find(x => x.k === key);
  if (!d || !(i >= 0 && i < d.ids.length) || d.f.includes(i) || d.f.length >= flipNeed(d) || S.cards[d.ids[i]]) return null;
  d.f.push(i);
  fsave();
  const pid = d.ids[i];
  let got = [];
  try {
   got = (V22.grantIds || grantIds)([ pid ], flipTid(d), d.why);
  } catch (e) {
   console.error(e);
  }
  d.g.push(i);
  fsave();
  LOG34.push([ 'flip', key, i, pid, got.length ]);
  return pid;
 }
 function flipDone(key) {
  const D = fget(), i = D.q.findIndex(x => x.k === key);
  if (i < 0) return false;
  const d = D.q[i];
  if (d.f.length < flipNeed(d)) return false;
  D.q.splice(i, 1);
  if (!D.done.includes(key)) D.done.push(key);
  fsave();
  return true;
 }
 function flipResume() {
  if (!on()) return 0;
  let n = 0;
  const D = fget();
  for (const d of D.q) {
   if (!Array.isArray(d.g)) d.g = [];
   for (const i of d.f) if (!d.g.includes(i)) {
    try {
     if (!S.cards[d.ids[i]]) (V22.grantIds || grantIds)([ d.ids[i] ], flipTid(d), d.why);
    } catch (e) {
     console.error(e);
    }
    d.g.push(i);
    n++;
   }
  }
  if (n) fsave();
  return n;
 }
 try {
  fget();
 } catch (e) {
  console.error(e);
 }
 function usaGrant(late) {
  if (!on() || typeof WT_REG === 'undefined' || !WT_REG.WUSA) return 0;
  const got = grantIds(WT_REG.WUSA.roster, 'WUSA', 'USAGOLD');
  S.usa = 1;
  save();
  popup('usa', 'USAGOLD - PLAYER CARDS!', late ? 'YOUR USAGOLD CODE NOW ALSO GIVES EVERY TEAM USA PLAYER CARD (YOUR WORLD GAMES TITLE)' : 'USAGOLD: EVERY TEAM USA PLAYER CARD IS YOURS TOO', got);
  return got.length;
 }
 function cardsOkHere() {
  if (!on() || typeof PS === 'undefined') return false;
  if (window.CP2319 && !CP2319.luOk()) return false;
  if (PS.luSrc === 'season') return false;
  if (PS.luBack === 'timeout') return !!(game && game.mode === 'quick' && !game.online);
  return true;
 }
 function lobbyLineup() {
  try {
   return on() && (ownedIds().length > 0 || window.V20 && V20.ownedLeg && V20.ownedLeg().length > 0);
  } catch (e) {
   return false;
  }
 }
 function subExtra(ids) {
  return cardsOkHere() ? ownedIds().filter(id => !ids.includes(id)).sort((a, b) => PP(b).ovr - PP(a).ovr) : [];
 }
 const okSub = id => owned(id);
 const luIds = lu => lu ? [ ...lu.A || [], ...lu.M || [], ...lu.D || [], lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ].filter(Boolean) : [];
 function subIds(lu) {
  return on() ? luIds(lu).filter(id => !!PP(id)) : [];
 }
 const SLOTK = [ [ 'A', 0 ], [ 'A', 1 ], [ 'A', 2 ], [ 'M', 0 ], [ 'M', 1 ], [ 'M', 2 ], [ 'D', 0 ], [ 'D', 1 ], [ 'D', 2 ], [ 'LSM' ], [ 'SSDM' ], [ 'SSDM2' ], [ 'FO' ], [ 'G' ] ];
 const sget = (lu, s) => s.length > 1 ? lu[s[0]][s[1]] : lu[s[0]];
 const sset = (lu, s, v) => {
  if (s.length > 1) lu[s[0]][s[1]] = v; else lu[s[0]] = v;
 };
 function strip(lu, ids, bad) {
  if (!lu) return lu;
  const out = JSON.parse(JSON.stringify(lu));
  let ch = false;
  const donor = autoLineup(ids), offK = SLOTK.slice(0, 6), defK = SLOTK.slice(6, 12);
  for (const s of SLOTK) {
   const v = sget(out, s);
   if (!v || !bad(v)) continue;
   ch = true;
   const unit = offK.includes(s) ? offK : defK.includes(s) ? defK : [ s ];
   const used = new Set(unit.map(k => sget(out, k)).concat(s[0] === 'G' ? [] : [ out.G ]));
   const cand = [ sget(donor, s) ].concat(ids.slice().sort((a, b) => (PP(b) ? PP(b).ovr : 0) - (PP(a) ? PP(a).ovr : 0)));
   const pick = cand.find(c => c && PP(c) && !bad(c) && !used.has(c) && (s[0] === 'G' ? !luIds(out).filter(x => x !== v).includes(c) : c !== out.G));
   sset(out, s, pick || null);
  }
  if (!ch) return lu;
  return lineupValid(out, ids.concat(luIds(out).filter(x => PP(x) && !bad(x)))) ? out : autoLineup(ids);
 }
 function fixGame(G) {
  if (!on() || !G || !G.lu || !G.lu[0] || !G.lu[1]) return;
  if (![ 'quick', 'online', 'world' ].includes(G.mode)) return;
  try {
   const ros = [ teamRosterIds(G.user, G.src), teamRosterIds(G.opp, G.src) ];
   const isSub = (i, id) => !ros[i].includes(id) && PP(id) && !PP(id).leg;
   for (let i = 0; i < 2; i++) {
    const onl = G.online || G.meta && G.meta.online, allow = onl ? G.mode === 'online' : G.mode === 'quick' && i === 0;
    if (!allow) G.lu[i] = strip(G.lu[i], ros[i], id => isSub(i, id));
   }
   try {
    G.dup2504 = luIds(G.lu[0]).filter(id => luIds(G.lu[1]).includes(id));
   } catch (e) {}
   if (window.__rl_dup22) {
    const both = luIds(G.lu[0]).filter(id => luIds(G.lu[1]).includes(id) && PP(id) && !PP(id).leg);
    if (both.length) for (let i = 0; i < 2; i++) G.lu[i] = strip(G.lu[i], ros[i], id => both.includes(id) && isSub(i, id));
   }
  } catch (e) {
   console.error(e);
  }
 }
 const LEGKIT = {
  'LEG-0': {
   jersey: '#ff7a1a',
   trim: '#ffffff',
   helm: '#ff7a1a',
   shorts: '#f4f4f4'
  },
  'LEG-2': {
   jersey: '#f76900',
   trim: '#0b2a5b',
   helm: '#f76900',
   shorts: '#0b2a5b'
  },
  'LEG-3': {
   jersey: '#68ace5',
   trim: '#0b0f14',
   helm: '#68ace5',
   shorts: '#0b0f14'
  }
 };
 function kitOf(pid, tid) {
  if (LEGKIT[pid]) return LEGKIT[pid];
  if (window.C30 && C30.kit) {
   const k30 = C30.kit(pid, tid);
   if (k30) return k30;
  }
  const p = PP(pid), t = T((p && p.leg ? p.legTeam : tid) || p && p.team || 'ATL') || T('ATL');
  return {
   jersey: t.c1,
   trim: t.c2,
   helm: t.c1
  };
 }
 const frameOf = p => {
  const F = RL12.FR, pole = p && (p.pos === 'D' || p.pos === 'LSM'), gk = p && p.pos === 'G';
  if (gk && F.g_idle) return 'g_idle';
  if (pole && F.pole_idle) return 'pole_idle';
  return 'idle';
 };
 const artCache = new Map;
 function artCanvas(pid, tid, sil) {
  const key = pid + '|' + (tid || '') + (sil ? '|s' : '');
  let c = artCache.get(key);
  if (c) return c;
  if (window.HON25 && HON25.art) {
   const h = HON25.art(pid, tid, sil);
   if (h) {
    artCache.set(key, h);
    return h;
   }
  }
  c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  const p = PP(pid), kit = kitOf(pid, tid), n = frameOf(p), f = RL12.FR[n], ax = Math.round(16 - f[3][0].length / 2 + f[0]), ay = 30;
  try {
   const drawn = p && (p.leg || p.gho16 && !window.__rl_no32gh && window.GHO16 && GHO16.on()) && window.V17 && V17.drawP && V17.drawP(x, n, {
    x: ax,
    y: ay,
    pl: p
   }, kit, true);
   if (!drawn) RL12.draw(x, n, ax, ay, kit, true, {
    skin: skinOf(p)
   });
   if (window.V232 && V232.cardBraid) V232.cardBraid(x, p, n, ax, ay);
  } catch (e) {
   console.error(e);
  }
  if (sil) {
   x.globalCompositeOperation = 'source-in';
   x.fillStyle = '#05080b';
   x.fillRect(0, 0, 32, 32);
   x.globalCompositeOperation = 'source-over';
  }
  artCache.set(key, c);
  return c;
 }
 const urlCache = new Map;
 function artUrl(pid, tid, sil) {
  const k = pid + '|' + (tid || '') + (sil ? '|s' : '');
  let u = urlCache.get(k);
  if (!u) {
   u = artCanvas(pid, tid, sil).toDataURL();
   urlCache.set(k, u);
  }
  return u;
 }
 function legIcon(it, sil) {
  return on() && it && it.leg20 && PP(it.leg20) ? artCanvas(it.leg20, null, sil) : null;
 }
 const NOTE = (on() && !window.__rl_no34flip ? 'PLAYER CARDS: WIN A TITLE = FLIP 6 OF THAT ROSTER\'S CARDS (ONLY ONES YOU DON\'T HAVE). LEGENDARY = ' : 'PLAYER CARDS: WIN A TITLE (SEASON OR WORLD GAMES) = EVERY PLAYER ON THAT ROSTER. LEGENDARY = ') + RAR22.leg + '+ OVR, RARE = ' + RAR22.rare + '-' + (RAR22.leg - 1) + ', COMMON = UNDER ' + RAR22.rare + '. CARDS CAN BE USED IN ONLINE GAMES AND QUICK PLAY: SUB THEM ONTO YOUR TEAM IN YOUR LINEUP. TAP A CARD = INFO.';
 let pop = null;
 const realTeam = id => !!id && (TEAMS.some(t => t.id === id) || !!(typeof WT_REG !== 'undefined' && WT_REG[id]));
 const teamOfCard = pid => {
  const p = PP(pid), c = S.cards[pid] || {};
  return p && realTeam(p.team) ? p.team : c.t || p && p.team;
 };
 function cardHtml22(pid) {
  const p = PP(pid), c = S.cards[pid] || {}, r = rarOf(pid), tid = teamOfCard(pid), t = T(tid);
  return '<div class="c17 r' + r + (gh16(pid) ? ' gh16' : '') + (pop === pid ? ' sel' : '') + '" data-a="v22card" data-v="' + esc(pid) + '" data-pid="' + esc(pid) + '" aria-label="' + esc(p.n + ' - ' + RARN[r] + ' ' + p.ovr) + '">' + '<div class="art' + (gh16(pid) && window.GHO16 && GHO16.on() ? ' gfa16"><img alt="" src="' + artUrl(pid, tid) + '"><i class="gfl16"></i>' : '"><img alt="" src="' + artUrl(pid, tid) + '">') + '</div><div class="nm">' + esc(p.n.toUpperCase()) + '</div><div class="rr">' + RARN[r] + ' - ' + p.ovr + '</div><div class="role17">' + esc(p.pos + ' - ' + (t.abbr || t.name || '')) + '</div>' + (traded34(c) ? '<div class="tr34">TRADED</div>' : '') + '</div>';
 }
 function traded34(c) {
  return !window.__rl_v124gb && !window.__rl_no34trd && !!c && /^TRADE/.test(String(c.w || ''));
 }
 function playersHtml(legCards, legHave, legTot, crew) {
  const mine = ownedIds().sort((a, b) => PP(b).ovr - PP(a).ovr || (PP(a).n < PP(b).n ? -1 : 1));
  const row = (name, col, n, body) => '<div class="sec17 row22"><div class="sh17" style="color:' + col + '">' + name + ' <span>' + n + '</span></div><div class="grid17">' + body + '</div></div>';
  const cw = k => crew && crew[k] || {
   cards: '',
   un: 0,
   tot: 0
  };
  const own332 = !window.__rl_v124gb && !window.__rl_no332cards;
  let h = (window.V28 && V28.playersHint ? V28.playersHint() : '') + (own332 ? row('LEGACY', '#f5dd8f', legHave + cw('L').un + ' OWNED', legCards + cw('L').cards + (cw('L').crew34 || '') || '<div class="note">NONE YET - LEGACY CARDS LAND HERE WHEN YOU GET ONE</div>') : row('LEGACY', '#f5dd8f', legHave + cw('L').un + ' / ' + (legTot + cw('L').tot), legCards + cw('L').cards + (cw('L').crew34 || '')));
  for (const r of [ 2, 1, 0 ]) {
   const l = mine.filter(id => rarOf(id) === r), c = cw(r);
   h += row(RARN[r], RCOLS[r], l.length + c.un + ' OWNED', (l.length ? l.map(cardHtml22).join('') : '<div class="note' + (c.cards || c.crew34 ? ' n2311' : '') + '">' + (flipOn() ? 'NONE YET - WIN A TITLE AND FLIP CARDS: YOUR ' + RARN[r] + ' PLAYER CARDS LAND HERE' : 'NONE YET - WIN A TITLE (SEASON OR WORLD GAMES) AND EVERY ' + RARN[r] + ' PLAYER ON THAT ROSTER LANDS HERE') + '</div>') + c.cards + (c.crew34 || ''));
  }
  return h;
 }
 const CARDLINE = 'CARDS CAN BE USED IN ONLINE GAMES AND QUICK PLAY: SUB HIM ONTO YOUR TEAM IN YOUR LINEUP BEFORE THE GAME.';
 function popHtml() {
  if (!pop || !owned(pop)) {
   pop = null;
   return '';
  }
  const p = PP(pop), c = S.cards[pop] || {}, r = rarOf(pop), keys = p.pos === 'G' ? [ 'sav', 'stk', 'spd' ] : p.pos === 'D' || p.pos === 'LSM' ? [ 'def', 'gb', 'spd', 'str' ] : p.pos === 'FO' ? [ 'fo', 'gb', 'spd' ] : [ 'fin', 'acc', 'pow', 'spd' ];
  const home = p.team && p.team !== 'FA' ? T(p.team) : null;
  const inner = '<div class="pt17" style="color:' + (gh16(pop) ? GH16C : RCOLS[r]) + '">' + esc(p.n.toUpperCase()) + '</div><div class="pcard17">' + cardHtml22(pop) + '<div class="pi17">' + '<span><b>' + RARN[r] + '</b> PLAYER CARD - ' + esc(POS_NAMES[p.pos] || p.pos) + ' - OVR ' + p.ovr + '</span>' + '<span><b>RATINGS:</b> ' + keys.map(k => k.toUpperCase() + ' ' + p.r[k]).join('  ') + '</span>' + '<span><b>FROM:</b> ' + esc(c.w === 'USAGOLD' ? 'THE USAGOLD CODE (TEAM USA)' : !window.__rl_no27cards && !window.__rl_no27 && /PACK$|^ULTIMATE|^TRADE|DROP$/.test(c.w || '') ? c.w + ' - ' + T(teamOfCard(pop)).name : (c.w || 'A') + ' TITLE WITH ' + (c.wn332 && !window.__rl_no332ctd ? c.wn332 : T(c.t).name)) + (c.at ? ' - ' + new Date(c.at).toLocaleDateString() : '') + (home && home.id !== c.t ? ' (PLAYS FOR ' + esc(home.name) + ')' : '') + '</span>' + '<span><b style="color:#7dff7a">' + esc(CARDLINE) + '</b></span>' + (window.V28 && V28.popLine ? V28.popLine(pop) : '') + '</div></div><div class="row" style="justify-content:center">' + (window.V28 && V28.popBtn ? V28.popBtn(pop) : '') + btn('CLOSE', 'v22close', null, 'g') + '</div>';
  return '<div class="pop17" data-a="v22close" data-v="bg"><div class="pbox17" data-a="v17noop">' + inner + '</div></div>';
 }
 if (typeof PANEL_ACT !== 'undefined') {
  PANEL_ACT.v22card = v => {
   pop = owned(v) ? v : null;
  };
  PANEL_ACT.v22close = () => {
   pop = null;
  };
  {
   const f0 = PANEL_ACT.luSave;
   if (typeof f0 === 'function') PANEL_ACT.luSave = function() {
    const back = PS.luBack, r = f0.apply(this, arguments);
    try {
     const R = window.RLNET;
     if (back === 'onLobby' && screen === 'onLobby' && R && R.lobby && R.lobby.state && R.patchLobby) {
      const host = R.side === 'h', lu = lineupFor(PS.luTeam, 'real');
      R.lobby.state[host ? 'hlu' : 'glu'] = lu;
      R.patchLobby(host ? {
       hlu: lu
      } : {
       glu: lu
      });
     }
    } catch (e) {
     console.error(e);
    }
    return r;
   };
  }
  for (const k of [ 'v17sec', 'v17locker', 'v17lsel' ]) {
   const f = PANEL_ACT[k];
   if (typeof f === 'function') PANEL_ACT[k] = function() {
    pop = null;
    return f.apply(this, arguments);
   };
  }
 }
 function claimLines(q) {
  const r = q.r || [ 0, 0, 0 ];
  return [ q.n + ' PLAYER CARD' + (q.n === 1 ? '' : 'S'), r[2] + ' LEGENDARY  ' + r[1] + ' RARE  ' + r[0] + ' COMMON' ];
 }
 try {
  const s20 = window.V20 && V20.st ? V20.st() : null;
  if (on() && !S.usa && s20 && s20.redeemed && s20.redeemed.USAGOLD) usaGrant(true);
 } catch (e) {
  console.error(e);
 }
 return {
  flipSplit: flipSplit,
  flipNeed: flipNeed,
  flipGone: flipGone,
  flipDecks: flipDecks,
  flipPick: flipPick,
  flipDone: flipDone,
  flipResume: flipResume,
  flipOn: flipOn,
  flipPrune35: flipPrune35,
  flipLog: LOG34,
  flipSt: () => fget(),
  szKey34: szKey34,
  wgKey34: wgKey34,
  popup: popup,
  gh16: gh16,
  on: on,
  st: () => S,
  save: save,
  rarOf: rarOf,
  owned: owned,
  ownedIds: ownedIds,
  grantIds: grantIds,
  titleCheck: titleCheck,
  usaGrant: usaGrant,
  subExtra: subExtra,
  lobbyLineup: lobbyLineup,
  okSub: okSub,
  subIds: subIds,
  fixGame: fixGame,
  strip: strip,
  kitOf: kitOf,
  artCanvas: artCanvas,
  artUrl: artUrl,
  teamOfCard: teamOfCard,
  legIcon: legIcon,
  playersHtml: playersHtml,
  popHtml: popHtml,
  cardHtml22: cardHtml22,
  claimLines: claimLines,
  NOTE: NOTE,
  CARDLINE: CARDLINE,
  RAR22: RAR22,
  LEGKIT: LEGKIT,
  RARN: RARN,
  get pop() {
   return pop;
  },
  set pop(v) {
   pop = v;
  }
 };
})();

window.V22 = V22;

const CP2319 = (() => {
 const on = () => !window.__rl_no2319c && !window.__rl_v124gb;
 let S = (() => {
  try {
   const v = JSON.parse(localStorage.getItem('rl_cp2319') || 'null');
   return v && typeof v === 'object' ? v : {};
  } catch (e) {
   return {};
  }
 })();
 const save = () => {
  try {
   localStorage.setItem('rl_cp2319', JSON.stringify(S));
  } catch (e) {}
 };
 const quick = v => {
  if (v !== undefined) {
   S.q = !!v;
   save();
  }
  return S.q !== false;
 };
 const draft = v => {
  if (v !== undefined) {
   S.d = !!v;
   save();
  }
  return S.d !== false;
 };
 const qOn = () => !on() || quick(), dOn = () => !on() || draft();
 const all = picks => picks.length > 0 && picks.every(x => x === true);
 const lobbySt = () => {
  const R = window.RLNET;
  return R && R.lobby && R.lobby.state ? R.lobby.state : null;
 };
 const lobbyAll = st => all([ st && st.hcp19, st && st.gcp19 ]);
 function lobbyMine() {
  const R = window.RLNET, st = lobbySt();
  if (!st) return qOn();
  const v = st[R.side === 'h' ? 'hcp19' : 'gcp19'];
  return v == null ? quick() : v === true;
 }
 function gameOk(G) {
  if (!on()) return true;
  if (G && (G.online || G.meta && G.meta.online)) return G.cp2319 === true;
  return quick();
 }
 function luOk() {
  if (!on()) return true;
  if (typeof PS !== 'undefined' && PS.luBack === 'onLobby') return lobbyMine();
  if (typeof PS !== 'undefined' && PS.luBack === 'timeout' && typeof game !== 'undefined' && game) return gameOk(game);
  return quick();
 }
 function stripGame(G) {
  if (!on() || !G || !G.lu || !G.lu[0] || !G.lu[1]) return;
  if ((G.online || G.meta && G.meta.online) && G.cp2319 == null) return;
  if (gameOk(G)) return;
  if (![ 'quick', 'online', 'world' ].includes(G.mode) || !window.V22) return;
  try {
   const ros = [ teamRosterIds(G.user, G.src), teamRosterIds(G.opp, G.src) ];
   for (let i = 0; i < 2; i++) G.lu[i] = V22.strip(G.lu[i], ros[i], id => !ros[i].includes(id));
  } catch (e) {
   console.error(e);
  }
 }
 const ghostCards = () => {
  try {
   return window.V22 && V22.on() && window.GHO16 && GHO16.on() ? V22.ownedIds().filter(id => PP(id) && PP(id).gho16) : [];
  } catch (e) {
   return [];
  }
 };
 function draftExtra() {
  if (!on()) return null;
  if (window.__cp2319Pool === false) return {
   leg: false,
   gho: []
  };
  if (Array.isArray(window.__cp2319Pool)) return {
   leg: true,
   gho: window.__cp2319Pool.slice()
  };
  return draft() ? {
   leg: true,
   gho: ghostCards()
  } : {
   leg: false,
   gho: []
  };
 }
 function seasonAll(members) {
  const ms = (members || []).filter(m => m.team);
  return all(ms.map(m => m.c19));
 }
 return {
  on: on,
  quick: quick,
  draft: draft,
  qOn: qOn,
  dOn: dOn,
  all: all,
  lobbyAll: lobbyAll,
  lobbyMine: lobbyMine,
  gameOk: gameOk,
  luOk: luOk,
  stripGame: stripGame,
  ghostCards: ghostCards,
  draftExtra: draftExtra,
  seasonAll: seasonAll,
  st: () => S
 };
})();

window.CP2319 = CP2319;
