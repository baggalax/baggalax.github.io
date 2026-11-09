'use strict';

const C30 = (() => {
 const off = () => !!(window.__rl_no30custom || window.__rl_v124gb);
 const on = () => !off() && !!window.V22 && V22.on();
 const PFX = 'CU30-', TID = 'CU30', GRAY = {
  jersey: '#8c9298',
  trim: '#5c6268',
  helm: '#8c9298'
 }, MAXN0 = 14;
 const maxN = () => window.__rl_no35name ? MAXN0 : 20;
 const RE = /^CU30-([0-9A-Z]{5})([0-9A-Z])([012])([AMDLFG])([0-6n])([01n])([0-9A-Z_pq-]{0,20})$/;
 const POSK = {
  A: 'A',
  M: 'M',
  D: 'D',
  L: 'LSM',
  F: 'FO',
  G: 'G'
 }, POSC = {
  A: 'A',
  M: 'M',
  D: 'D',
  LSM: 'L',
  FO: 'F',
  G: 'G'
 };
 const RARN = [ 'COMMON', 'RARE', 'LEGENDARY' ], RCOL = [ '#9aa3ab', '#3d8bff', '#ffcc33' ];
 const SKN = [ 'LIGHT', 'LIGHT-MEDIUM', 'MEDIUM', 'MEDIUM-DARK', 'DARK', 'DEEP', 'GHOST' ];
 const encN = s => String(s).split('').map(c => c === ' ' ? '_' : c === '.' ? 'p' : c === "'" ? 'q' : c).join('');
 const decN = s => String(s).split('').map(c => c === '_' ? ' ' : c === 'p' ? '.' : c === 'q' ? "'" : c).join('');
 function parse(id) {
  const m = RE.exec(String(id || ''));
  if (!m) return null;
  const made = m[5] !== 'n';
  if (made !== (m[6] !== 'n') || made !== m[7].length > 0) return null;
  return {
   seed: m[1],
   copy: m[2],
   rar: +m[3],
   pos: POSK[m[4]],
   made: made,
   skin: made ? +m[5] : null,
   braid: m[6] === '1',
   name: decN(m[7])
  };
 }
 function idOf(d) {
  return PFX + d.seed + (d.copy || '0') + d.rar + POSC[d.pos] + (d.made ? (d.skin | 0) + (d.braid ? '1' : '0') + encN(d.name) : 'nn');
 }
 const isC30 = id => typeof id === 'string' && id.startsWith(PFX);
 function rng(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
   h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
   h = h << 13 | h >>> 19;
  }
  let a = h >>> 0;
  return () => {
   a |= 0;
   a = a + 1831565813 | 0;
   let t = Math.imul(a ^ a >>> 15, 1 | a);
   t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
   return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
 }
 const W = {
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
 };
 const BAND = [ [ 64, 77 ], [ 78, 87 ], [ 88, 94 ] ];
 function ratings(seed, rar, pos) {
  const r = rng('c30:' + seed + ':' + rar + ':' + pos), w = W[pos] || W.M, b = BAND[rar] || BAND[0], tgt = b[0] + Math.floor(r() * (b[1] - b[0] + 1)), o = {};
  for (const k of SKILLS) o[k] = 25 + Math.floor(r() * 30);
  for (const k in w) o[k] = Math.max(40, Math.min(99, tgt - 6 + Math.floor(r() * 13)));
  const ks = Object.keys(w).sort((x, y) => w[y] - w[x]);
  for (let i = 0; i < 800; i++) {
   const ov = ovrOf({
    pos: pos,
    r: o
   });
   if (ov === tgt) break;
   const up = ov < tgt, c = ks.filter(k => up ? o[k] < 99 : o[k] > 30);
   if (!c.length) break;
   o[c[i % c.length]] += up ? 1 : -1;
  }
  return o;
 }
 function make(id) {
  if (PLAYERS[id]) return PLAYERS[id];
  if (off()) return undefined;
  const d = parse(id);
  if (!d) return undefined;
  const p = {
   id: id,
   n: d.made ? d.name : 'Custom',
   pos: d.pos,
   r: ratings(d.seed, d.rar, d.pos),
   real: false,
   team: TID,
   c30: true,
   c30made: d.made,
   egg13: true
  };
  if (d.made && d.braid) p.c30br = true;
  p.ovr = ovrOf(p);
  p.skin = d.made ? d.skin : 0;
  PLAYERS[id] = p;
  return p;
 }
 const made = id => {
  const d = parse(id);
  return !!(d && d.made);
 };
 try {
  if (typeof SZ_REG !== 'undefined' && !SZ_REG[TID]) SZ_REG[TID] = {
   id: TID,
   abbr: 'CUSTOM',
   name: 'CUSTOM',
   full: 'Custom',
   city: '',
   lg: 'N/A',
   era: '',
   c1: GRAY.jersey,
   c2: GRAY.trim,
   icon: [ '.###.', '#####', '#####', '.###.', '.#.#.', '.#.#.', '.#.#.' ],
   coach: '',
   coachNote: '',
   off: 4,
   def: 4,
   roster: [],
   c30: true
  };
 } catch (e) {}
 function kit(pid, tid) {
  if (!isC30(pid) || off()) return null;
  const t = tid || PLAYERS[pid] && PLAYERS[pid].team;
  return !t || t === TID ? GRAY : null;
 }
 function state() {
  const S = V22.st();
  if (!S.c30 || typeof S.c30 !== 'object' || Array.isArray(S.c30)) S.c30 = {};
  const c = S.c30;
  for (const k of [ 'won' ]) if (!c[k] || typeof c[k] !== 'object') c[k] = {};
  return c;
 }
 const B36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 const rnd = () => (typeof window.__rl_c30rnd === 'function' ? window.__rl_c30rnd : Math.random)();
 function freshId(rar) {
  const C = V22.st().cards || {};
  for (let g = 0; g < 50; g++) {
   let seed = '';
   for (let i = 0; i < 5; i++) seed += B36[Math.floor(Math.random() * 36) % 36];
   const x = Math.random() * 100, pos = x < 24 ? 'A' : x < 54 ? 'M' : x < 76 ? 'D' : x < 84 ? 'LSM' : x < 92 ? 'FO' : 'G';
   const id = idOf({
    seed: seed,
    copy: '0',
    rar: rar,
    pos: pos,
    made: false
   });
   if (!C[id] && !Object.keys(C).some(k => k.slice(0, 10) === id.slice(0, 10))) return id;
  }
  return null;
 }
 let g0 = null;
 const grant = (ids, tid, why) => (g0 || V22.grantIds)(ids, tid, why);
 const LOG = {
  pack: [],
  gift: [],
  won: []
 };
 const ODDS30 = {
  basic: .15,
  daily: .25,
  rare: .15,
  legendary: .15
 };
 const RARW = {
  basic: [ 70, 25, 5 ],
  daily: [ 70, 25, 5 ],
  rare: [ 45, 50, 5 ],
  legendary: [ 20, 40, 40 ]
 };
 function rollRar(kind) {
  const w = RARW[kind], x = rnd() * 100;
  return x < w[0] ? 0 : x < w[0] + w[1] ? 1 : 2;
 }
 function roll(kind) {
  if (!ODDS30[kind]) return null;
  const f = window.__rl_c30force;
  if (f && f[kind] !== undefined) return f[kind];
  return rnd() < ODDS30[kind] ? rollRar(kind) : null;
 }
 function packBonus(kind, cards) {
  if (!on() || !ODDS30[kind] || !Array.isArray(cards) || !window.V27 || !V27.cardItem || !window.V17 || !V17.BY) return null;
  const rar = roll(kind);
  if (rar == null || rar < 0 || rar > 2) return null;
  const id = freshId(rar);
  if (!id || !make(id)) return null;
  const ci = V27.cardItem(id), it = V17.BY[ci];
  if (it) {
   it.c30 = 1;
   it.d = 'BONUS CUSTOM PLAYER CARD - ' + RARN[rar] + ' ' + (POS_NAMES[PP(id).pos] || PP(id).pos) + ', OVR ' + PP(id).ovr + '. CREATE HIM IN THE LOCKER ROOM: NAME, SKIN, BRAID.';
  }
  cards.push(ci);
  LOG.pack.push({
   kind: kind,
   id: id,
   rar: rar
  });
  return id;
 }
 if (window.V27 && typeof V27.packCards === 'function') {
  const pc0 = V27.packCards;
  V27.packCards = function(kind, cards) {
   const n = pc0.apply(this, arguments);
   try {
    packBonus(kind, cards);
   } catch (e) {
    console.error(e);
   }
   return n;
  };
 }
 let giftToast = false;
 function gift() {
  if (!on()) return false;
  const st = state();
  if (st.gift) return false;
  const a = freshId(0);
  if (a) make(a);
  const b = a && freshId(1);
  if (b) make(b);
  if (!a || !b) return false;
  st.gift = Date.now();
  const got = grant([ a, b ], TID, 'V30 GIFT');
  V22.save();
  LOG.gift.push(got);
  giftToast = true;
  return true;
 }
 function giftTick() {
  if (!giftToast || typeof screen === 'undefined' || screen !== 'menu' || typeof game !== 'undefined' && game || !window.V17 || !V17.toast) return;
  try {
   if (V17.modal && V17.modal()) return;
   const ST = V17.ST && V17.ST();
   if (ST && Array.isArray(ST.chalClaim) && ST.chalClaim.length) return;
  } catch (e) {}
  giftToast = false;
  LOG.toast = Date.now();
  V17.toast('FREE GIFT: 2 CUSTOM PLAYER CARDS!', '#7dff7a');
  V17.toast('LOCKER ROOM > CARDS: TAP ONE TO CREATE HIM', '#7dff7a');
 }
 const LEET = {
  0: 'o',
  1: 'i',
  3: 'e',
  4: 'a',
  5: 's',
  7: 't',
  8: 'b',
  9: 'g',
  2: 'z',
  6: 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '|': 'i'
 };
 const SUB = [ 'fuck', 'fvck', 'phuck', 'shit', 'bitch', 'biatch', 'cunt', 'nigg', 'niga', 'nigr', 'nlgg', 'fagot', 'faggot', 'retard', 'whore', 'slut', 'pussy', 'penis', 'vagina', 'dildo', 'porn', 'jizz', 'wetback', 'tranny', 'nazi', 'hitler', 'kkk', 'twat', 'bastard', 'asshole', 'dickhead', 'motherf', 'cocksuck', 'blowjob', 'handjob', 'boob', 'molest', 'pedophil', 'beaner', 'lesbo', 'chink', 'gook', 'kike', 'raghead', 'towelhead', 'sandnig', 'cumshot', 'cumslut', 'orgasm', 'erection', 'masturb', 'testicl', 'scrotum', 'bollock', 'buttplug', 'butthole', 'shithead', 'jackass', 'dumbass', 'fatass', 'smartass', 'killyourself', 'rapist', 'wanker' ];
 const WORD = [ 'ass', 'asses', 'arse', 'cum', 'cock', 'cocks', 'dick', 'dicks', 'tit', 'tits', 'titty', 'titties', 'rape', 'raped', 'raping', 'spic', 'spick', 'coon', 'coons', 'homo', 'dyke', 'fag', 'fags', 'hoe', 'hoes', 'sex', 'sexy', 'anal', 'anus', 'piss', 'damn', 'goddamn', 'boner', 'horny', 'nude', 'nudes', 'naked', 'jap', 'japs', 'nonce', 'thot', 'skank', 'slag', 'prick', 'pecker', 'puss', 'milf', 'dilf', 'negro', 'negros', 'wtf', 'stfu', 'gtfo', 'lmfao', 'nig', 'nigs', 'cunts', 'shits', 'bitches', 'sht', 'fu', 'fk', 'fkn', 'fuk', 'fck', 'heil', 'sieg', 'incel', 'semen', 'pedo', 'pedos', 'wank', 'kys', 'badass' ];
 const coll = s => s.replace(/(.)\1+/g, '$1');
 function cleanName(s) {
  return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9 .'-]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxN()).trim();
 }
 function badName(raw) {
  const nm = cleanName(raw);
  if (!nm) return 'TYPE A NAME FIRST';
  if (!/[A-Z]/.test(nm)) return 'USE AT LEAST ONE LETTER';
  const low = String(raw || '').toLowerCase(), lt = low.split('').map(c => LEET[c] || c).join('');
  const letters = lt.replace(/[^a-z]/g, ''), cl = coll(letters);
  const toks = lt.split(/[^a-z]+/).filter(Boolean);
  const c2 = x => x.replace(/(.)\1{2,}/g, '$1$1'), l2 = c2(letters);
  for (const b of SUB) if (letters.includes(b) || l2.includes(b) || coll(b).length >= 4 && cl.includes(coll(b))) return 'THAT NAME IS NOT ALLOWED - TRY ANOTHER';
  for (const t of toks.concat([ letters ])) {
   const t2 = c2(t), t1 = coll(t);
   for (const b of WORD) if (t === b || t === b + 's' || t2 === b || t2 === b + 's' || coll(b) === b && (t1 === b || t1 === b + 's')) return 'THAT NAME IS NOT ALLOWED - TRY ANOTHER';
  }
  return null;
 }
 function create(oldId, name, skin, braid) {
  if (!on()) return {
   err: 'CUSTOM CARDS ARE OFF'
  };
  const d = parse(oldId);
  if (!d) return {
   err: 'NOT A CUSTOM CARD'
  };
  if (d.made) return {
   err: 'HE IS ALREADY LOCKED IN'
  };
  const C = V22.st().cards;
  if (!C[oldId]) return {
   err: 'NOT YOUR CARD'
  };
  const why = badName(name);
  if (why) return {
   err: why
  };
  skin = +skin;
  if (!(skin >= 0 && skin <= 6) || skin !== Math.floor(skin)) return {
   err: 'PICK A SKIN COLOR'
  };
  const nid = idOf(Object.assign({}, d, {
   made: true,
   name: cleanName(name),
   skin: skin,
   braid: !!braid
  }));
  if (!parse(nid)) return {
   err: 'THAT NAME IS NOT ALLOWED - TRY ANOTHER'
  };
  if (C[nid]) return {
   err: 'YOU ALREADY HAVE THAT CARD'
  };
  C[nid] = Object.assign({}, C[oldId], {
   made30: Date.now()
  });
  delete C[oldId];
  V22.save();
  make(nid);
  try {
   const cs = window.V28 && V28.cardStore ? V28.cardStore() : null;
   if (cs && cs[oldId]) {
    cs[nid] = cs[oldId];
    delete cs[oldId];
   }
  } catch (e) {}
  return {
   id: nid
  };
 }
 const TITLE_WHY = new Set([ 'SEASON', 'ONLINE SEASON', 'WORLD GAMES', 'COLLEGE NATTY', 'NATTY', 'ULTIMATE CHAMPIONS' ]);
 function hashC(s) {
  let h = 0;
  for (const c of String(s)) h = h * 31 + c.charCodeAt(0) >>> 0;
  return 1 + h % 35;
 }
 function copies(ids, tid, why) {
  if (!on() || !tid || tid === TID || !Array.isArray(ids)) return [];
  const st = state(), C = V22.st().cards, out = [];
  for (const id of ids) {
   const d = parse(id);
   if (!d || !d.made) continue;
   const key = d.seed + '|' + tid;
   if (st.won[key]) continue;
   let k = hashC(tid), cid = null;
   for (let i = 0; i < 35; i++, k = k % 35 + 1) {
    const c = idOf(Object.assign({}, d, {
     copy: B36[k]
    }));
    if (!C[c] || C[c].t === tid) {
     cid = c;
     break;
    }
   }
   if (!cid) continue;
   st.won[key] = cid;
   if (!C[cid]) {
    make(cid);
    const got = grant([ cid ], tid, why);
    if (got.length) out.push(cid);
   }
  }
  if (out.length || Object.keys(st.won).length) V22.save();
  if (out.length) {
   LOG.won.push({
    tid: tid,
    why: why,
    ids: out
   });
   try {
    const t = T(tid);
    V22.popup('c30|' + out.join(',') + '|' + Date.now(), 'TITLE WON - CUSTOM CARD!', out.map(id => PP(id).n).join(' + ') + ' WON IT WITH ' + (t && t.name || tid) + ': ' + (out.length > 1 ? 'NEW PLAYER CARDS' : 'A NEW PLAYER CARD') + ' OF HIM ON THAT TEAM', out);
   } catch (e) {
    console.error(e);
   }
  }
  return out;
 }
 const UI = {
  pid: null,
  step: 'edit',
  name: '',
  skin: 2,
  braid: false,
  err: ''
 };
 const frameOf = p => {
  const F = RL12.FR, pole = p && (p.pos === 'D' || p.pos === 'LSM'), gk = p && p.pos === 'G';
  if (gk && F.g_idle) return 'g_idle';
  if (pole && F.pole_idle) return 'pole_idle';
  return 'idle';
 };
 const prevCache = new Map;
 function previewUrl(pos, skin, braid) {
  const key = pos + skin + (braid ? 1 : 0);
  let u = prevCache.get(key);
  if (u) return u;
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  const p = {
   id: 'c30prev',
   n: 'Custom',
   pos: pos,
   skin: skin,
   c30br: !!braid
  }, n = frameOf(p), f = RL12.FR[n], ax = Math.round(16 - f[3][0].length / 2 + f[0]), ay = 30;
  try {
   RL12.draw(x, n, ax, ay, GRAY, true, {
    skin: skin
   });
   if (braid) braidCard(x, p, n, ax, ay);
  } catch (e) {
   console.error(e);
  }
  u = c.toDataURL();
  prevCache.set(key, u);
  return u;
 }
 function braidCard(x, p, n, ax, ay) {
  const s = braidSpot21(n);
  if (!s) return;
  const hair = [ '#1a120c', '#2a1b10', '#120d0a', '#33241a' ][seedOf('braid:' + p.id) % 4], lit = mixc21(hair, '#ffffff', .18), X = q => ax - s.f0 + q, Y = r => ay - s.f1 + r;
  const fr = window.braidFront2402 ? braidFront2402(n) : null;
  if (fr) {
   const cw = x.canvas.width, chh = x.canvas.height, a = x.getImageData(0, 0, cw, chh).data;
   for (const [q, r, col] of braidFrontPx2402(fr, hair, lit)) {
    const xx = X(q), yy = Y(r);
    if (xx < 0 || xx >= cw || yy < 0 || yy >= chh || a[(yy * cw + xx) * 4 + 3]) continue;
    x.fillStyle = col;
    x.fillRect(xx, yy, 1, 1);
   }
   return;
  }
  for (let i = 0; i < 6; i++) {
   const q = s.x - (i >= 3 ? 1 : 0);
   x.fillStyle = i % 2 ? lit : hair;
   x.fillRect(X(q), Y(s.y + i), 1, 1);
   x.fillStyle = i % 2 ? hair : lit;
   x.fillRect(X(q + 1), Y(s.y + i), 1, 1);
  }
  x.fillStyle = '#c9a46b';
  x.fillRect(X(s.x - 1), Y(s.y + 6), 1, 1);
 }
 function syncName() {
  try {
   const el = document.getElementById('c30name');
   if (el) UI.name = el.value;
  } catch (e) {}
 }
 function fromTxt(c) {
  const w = c && c.w || '';
  if (w === 'V30 GIFT') return 'THE FREE V30 LAUNCH GIFT';
  if (w === 'TRADE') return 'A TRADE';
  if (/PACK$/.test(w)) return 'A ' + w + ' (BONUS CARD)';
  if (c && c.t && c.t !== TID) return w + ' TITLE WITH ' + T(c.t).name;
  return w || 'A CARD PACK';
 }
 function popHtml(pid) {
  const p = PP(pid);
  if (!p) return '';
  const d = parse(pid), r = V22.rarOf(pid), c = V22.st().cards[pid] || {}, col = RCOL[r];
  const keys = p.pos === 'G' ? [ 'sav', 'stk', 'spd' ] : p.pos === 'D' || p.pos === 'LSM' ? [ 'def', 'gb', 'spd', 'str' ] : p.pos === 'FO' ? [ 'fo', 'gb', 'spd' ] : [ 'fin', 'acc', 'pow', 'spd' ];
  const rat = '<span><b>RATINGS:</b> ' + keys.map(k => k.toUpperCase() + ' ' + p.r[k]).join('  ') + '</span>';
  const wrap = inner => '<div class="pop17" data-a="v22close" data-v="bg"><div class="pbox17" data-a="v17noop" id="c30pop">' + inner + '</div></div>';
  if (d.made) {
   return wrap('<div class="pt17" style="color:' + col + '">' + esc(p.n.toUpperCase()) + '</div><div class="pcard17">' + V22.cardHtml22(pid) + '<div class="pi17">' + '<span><b>' + RARN[r] + '</b> CUSTOM PLAYER CARD - ' + esc(POS_NAMES[p.pos] || p.pos) + ' - OVR ' + p.ovr + '</span>' + rat + '<span><b>LOOK:</b> ' + SKN[d.skin] + ' SKIN - ' + (d.braid ? 'BRAID' : 'NO BRAID') + '</span>' + '<span><b>FROM:</b> ' + esc(fromTxt(c)) + (c.at ? ' - ' + new Date(c.at).toLocaleDateString() : '') + '</span>' + '<span><b style="color:#7dff7a">LOCKED: HIS NAME, SKIN + BRAID ARE SET FOREVER. ' + esc(V22.CARDLINE || '') + '</b></span>' + (window.V28 && V28.popLine ? V28.popLine(pid) : '') + '</div></div><div class="row" style="justify-content:center">' + (window.V28 && V28.popBtn ? V28.popBtn(pid) : '') + btn('CLOSE', 'v22close', null, 'g') + '</div>');
  }
  if (UI.pid !== pid) {
   UI.pid = pid;
   UI.step = 'edit';
   UI.name = '';
   UI.skin = 2;
   UI.braid = false;
   UI.err = '';
  }
  const prev = '<div class="c17 r' + r + '" aria-label="PREVIEW"><div class="art"><img alt="" src="' + previewUrl(p.pos, UI.skin, UI.braid) + '"></div><div class="nm">' + esc(cleanName(UI.name) || 'CUSTOM') + '</div><div class="rr">' + RARN[r] + ' - ' + p.ovr + '</div><div class="role17">' + esc(p.pos) + ' - CUSTOM</div></div>';
  const head = '<span><b>' + RARN[r] + '</b> CUSTOM PLAYER CARD - ' + esc(POS_NAMES[p.pos] || p.pos) + ' - OVR ' + p.ovr + '</span>';
  if (UI.step === 'confirm') {
   return wrap('<div class="pt17" style="color:' + col + '">LOCK HIM IN?</div><div class="pcard17">' + prev + '<div class="pi17">' + head + '<span><b>NAME:</b> ' + esc(cleanName(UI.name)) + '</span><span><b>SKIN:</b> ' + SKN[UI.skin] + '</span><span><b>BRAID:</b> ' + (UI.braid ? 'YES' : 'NO') + '</span>' + '<span><b style="color:#ff9a8a">ONCE YOU CONFIRM, HIS NAME, SKIN + BRAID CAN NEVER BE CHANGED.</b></span></div></div>' + '<div class="row" style="justify-content:center">' + btn('LOCK HIM IN', 'c30lock', null, 'y') + btn('BACK', 'c30back', null, 'g') + '</div>');
  }
  const sw = SKN.map((nm, i) => {
   const t = RL12.SKIN[i] || RL12.SKIN[0];
   return '<button type="button" data-a="c30skin" data-v="' + i + '" aria-label="SKIN ' + nm + '" class="' + (UI.skin === i ? 'on' : 'd') + '" style="flex:0 0 auto;width:28px;min-width:28px;height:26px;min-height:26px;padding:0;background:' + t.base + ';border:2px solid ' + (UI.skin === i ? '#ffe14d' : '#05080b') + ';box-shadow:' + (UI.skin === i ? '0 0 0 1px #fff' : 'none') + '"></button>';
  }).join('');
  return wrap('<div class="pt17" style="color:' + col + '">CREATE YOUR PLAYER</div><div class="pcard17">' + prev + '<div class="pi17" style="flex:1 1 auto">' + head + '<span style="display:flex;align-items:center;gap:6px"><b>NAME</b><input id="c30name" maxlength="' + maxN() + '" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" enterkeyhint="done" value="' + esc(UI.name) + '" aria-label="custom player name" style="min-height:28px;padding:3px 6px" oninput="C30.ui.name=this.value" onclick="event.stopPropagation()" onkeydown="if(event.key===\'Enter\'){this.blur();}"></span>' + '<span style="display:flex;align-items:center;gap:4px;flex-wrap:wrap"><b>SKIN</b>' + sw + '</span>' + '<span style="display:flex;align-items:center;gap:6px"><b>BRAID</b>' + btn('YES', 'c30braid', '1', UI.braid ? 'on' : 'd') + btn('NO', 'c30braid', '0', UI.braid ? 'd' : 'on') + '</span>' + (UI.err ? '<span id="c30err" style="color:#ff9a8a">' + esc(UI.err) + '</span>' : '') + '</div></div>' + '<div class="row" style="justify-content:center">' + btn('NEXT', 'c30next', null, 'y') + btn('CLOSE', 'v22close', null, 'g') + '</div>');
 }
 if (typeof PANEL_ACT !== 'undefined') {
  PANEL_ACT.c30skin = v => {
   syncName();
   const s = +v;
   if (s >= 0 && s <= 6) UI.skin = s;
   UI.err = '';
  };
  PANEL_ACT.c30braid = v => {
   syncName();
   UI.braid = v === '1';
   UI.err = '';
  };
  PANEL_ACT.c30next = () => {
   syncName();
   const why = badName(UI.name);
   UI.err = why || '';
   if (!why) UI.step = 'confirm';
  };
  PANEL_ACT.c30back = () => {
   UI.step = 'edit';
   UI.err = '';
  };
  PANEL_ACT.c30lock = () => {
   const pid = V22.pop, r = create(pid, UI.name, UI.skin, UI.braid);
   if (r.err) {
    UI.step = 'edit';
    UI.err = r.err;
    return;
   }
   UI.pid = null;
   V22.pop = r.id;
   try {
    V17.toast(PP(r.id).n.toUpperCase() + ' IS LOCKED IN', '#7dff7a');
   } catch (e) {}
  };
 }
 if (window.V22) {
  g0 = V22.grantIds;
  V22.grantIds = function(ids, tid, why) {
   const out = g0.apply(this, arguments);
   try {
    if (on() && TITLE_WHY.has(why)) copies(ids, tid, why);
   } catch (e) {
    console.error(e);
   }
   return out;
  };
  const tc0 = V22.titleCheck;
  if (typeof tc0 === 'function') V22.titleCheck = function(Sz) {
   const n = tc0.apply(this, arguments);
   try {
    if (on() && Sz && Sz.phase === 'done' && Sz.champ && Sz.champ === Sz.team && Sz.rosters && Sz.rosters[Sz.team]) copies(Sz.rosters[Sz.team], Sz.team, Sz.online ? 'ONLINE SEASON' : 'SEASON');
   } catch (e) {
    console.error(e);
   }
   return n;
  };
  const se0 = V22.subExtra;
  if (typeof se0 === 'function') V22.subExtra = function() {
   const l = se0.apply(this, arguments);
   return Array.isArray(l) ? l.filter(id => !isC30(id) || made(id)) : l;
  };
  const ph0 = V22.popHtml;
  if (typeof ph0 === 'function') V22.popHtml = function() {
   try {
    const pid = V22.pop;
    if (on() && isC30(pid) && V22.owned(pid)) return popHtml(pid);
   } catch (e) {
    console.error(e);
   }
   return ph0.apply(this, arguments);
  };
 }
 if (window.V232 && typeof V232.cardBraid === 'function') {
  const cb0 = V232.cardBraid;
  V232.cardBraid = function(x, p, n, ax, ay) {
   if (p && p.c30br && !off()) {
    try {
     braidCard(x, p, n, ax, ay);
    } catch (e) {
     console.error(e);
    }
    return;
   }
   return cb0.apply(this, arguments);
  };
 }
 if (typeof window.braidOf21 === 'function') {
  const b0 = window.braidOf21;
  window.braidOf21 = function(pl) {
   return b0.apply(this, arguments) || !!pl && !!pl.c30br && !off() && !window.__rl_no21;
  };
 }
 if (typeof window.setSkin === 'function') {
  const ss0 = window.setSkin;
  window.setSkin = function(id) {
   if (isC30(id) && !off()) {
    const p = PP(id);
    return p ? p.skin : -1;
   }
   return ss0.apply(this, arguments);
  };
 }
 try {
  if (typeof CP2319 !== 'undefined' && CP2319 && typeof CP2319.draftExtra === 'function') {
   const dx0 = CP2319.draftExtra;
   CP2319.draftExtra = function() {
    const r = dx0.apply(this, arguments);
    try {
     if (r && r.leg && on() && !Array.isArray(window.__cp2319Pool)) r.gho = (r.gho || []).concat(V22.ownedIds().filter(id => isC30(id) && made(id) && !(r.gho || []).includes(id)));
    } catch (e) {
     console.error(e);
    }
    return r;
   };
  }
 } catch (e) {
  console.error(e);
 }
 function ensureAll() {
  if (off()) return;
  try {
   for (const id of Object.keys(V22.st().cards || {})) if (isC30(id)) make(id);
  } catch (e) {}
  try {
   const s = LS.get('season', null);
   if (s && typeof s === 'object') {
    const ids = s.rosters ? Object.values(s.rosters).flat() : s.draft ? (s.draft.pool || []).concat(...Object.values(s.draft.rosters || {})) : [];
    for (const id of ids) if (isC30(id)) make(id);
   }
  } catch (e) {}
 }
 ensureAll();
 try {
  gift();
 } catch (e) {
  console.error(e);
 }
 setInterval(() => {
  try {
   giftTick();
  } catch (e) {}
 }, 500);
 return {
  on: on,
  off: off,
  parse: parse,
  idOf: idOf,
  make: make,
  made: made,
  isC30: isC30,
  ratings: ratings,
  kit: kit,
  create: create,
  badName: badName,
  cleanName: cleanName,
  gift: gift,
  copies: copies,
  packBonus: packBonus,
  roll: roll,
  freshId: freshId,
  state: state,
  ensureAll: ensureAll,
  ODDS30: ODDS30,
  RARW: RARW,
  TID: TID,
  GRAY: GRAY,
  get MAXN() {
   return maxN();
  },
  LOG: LOG,
  ui: UI,
  popHtml: popHtml
 };
})();

window.C30 = C30;
