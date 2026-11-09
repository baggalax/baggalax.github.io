'use strict';

const V34 = (() => {
 const off = k => !!(window.__rl_v124gb || window['__rl_no34' + k]);
 const LOG = {
  srch: [],
  flip: [],
  ach: [],
  err: []
 };
 const esc34 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 const tOf = id => {
  try {
   return T(id);
  } catch (e) {
   return null;
  }
 };
 const up = s => String(s == null ? '' : s).toUpperCase();
 const disp = s => {
  try {
   return window.N31 && N31.sub ? N31.sub(String(s)) : String(s);
  } catch (e) {
   return String(s);
  }
 };
 const Q = {
  cards: '',
  myt: '',
  cp: ''
 };
 const POSW = {
  A: 'ATTACK ATTACKMAN',
  M: 'MIDFIELD MIDDIE MIDFIELDER',
  D: 'DEFENSE DEFENDER POLE LONG POLE',
  LSM: 'LSM LONG STICK MIDFIELD LONG-STICK MID POLE',
  SSDM: 'SSDM SHORT STICK D MID DEFENSIVE MIDFIELD',
  FO: 'FO FACEOFF FOGO FACE OFF',
  G: 'GOALIE GOALKEEPER KEEPER G'
 };
 const RW = [ 'COMMON', 'RARE', 'LEGENDARY' ];
 function words(s) {
  return up(s).replace(/[^A-Z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
 }
 function match(hay, q) {
  const qw = words(q);
  if (!qw.length) return true;
  const hw = hay.split(' ');
  return qw.every(w => hw.some(h => h.startsWith(w)));
 }
 function teamHay(tid) {
  const a = [];
  if (!tid) return '';
  const t = tOf(tid);
  if (t) a.push(t.name, t.full, t.abbr, t.city, t.nick, t.lg, t.league, t.conf);
  try {
   const d = window.N31 && N31.DEF && N31.DEF.teams[tid];
   if (d) a.push(d.name, d.abbr);
  } catch (e) {}
  try {
   const s = typeof SZ_REG !== 'undefined' && SZ_REG[tid];
   if (s && s.szBase) a.push(teamHay(s.szBase));
  } catch (e) {}
  return a.filter(Boolean).map(disp).join(' ') + ' ' + a.filter(Boolean).join(' ');
 }
 function playerNames(pid) {
  const a = [], b = String(pid || '').replace(/^U_/, '').replace(/^(AA25-|TW25-)/, '');
  for (const id of [ pid, b ]) {
   const p = PP(id);
   if (!p) continue;
   a.push(p.n, p.n0);
   try {
    if (window.N31) {
     if (N31.REAL && N31.REAL[id]) a.push(N31.REAL[id]);
     if (N31.CUR && N31.CUR[id]) a.push(N31.CUR[id]);
     const dp = N31.DEF && N31.DEF.players && N31.DEF.players[id];
     if (dp) a.push(dp.n);
     const dl = N31.DEF && N31.DEF.legacy && N31.DEF.legacy[id];
     if (dl) a.push(dl);
    }
   } catch (e) {}
  }
  return a.filter(Boolean).map(disp).join(' ') + ' ' + a.filter(Boolean).join(' ');
 }
 const HC = new Map;
 function cardHay(el) {
  const k = (el.dataset.pid || '') + '|' + (el.dataset.v || '') + '|' + (el.dataset.tid || '') + '|' + el.className;
  if (HC.has(k)) return HC.get(k);
  const a = [ el.innerText || el.textContent || '', el.getAttribute('aria-label') || '' ];
  try {
   const cls = el.className || '', tid = el.dataset.tid, v = el.dataset.v, it = v && window.V17 && V17.BY ? V17.BY[v] : null;
   if (/cc232|dc30/.test(cls)) {
    a.push('COACH COACHES HEAD COACH', RW[+el.dataset.rar || 0] || '');
    if (tid && !/^dc\|/.test(tid)) {
     a.push(teamHay(tid));
     try {
      const c = V232.coaches()[tid];
      if (c) a.push(c.n);
     } catch (e) {}
     try {
      const d = N31.DEF.teams[tid];
      if (d) a.push(d.coach, d.coachReal);
     } catch (e) {}
    }
    if (/dc30/.test(cls)) a.push('DRAFTED');
   } else if (it && it.crew) {
    a.push('CREW TEAM CREW STAFF', it.n, it.leg20 ? 'LEGACY' : RW[it.rar] || '');
   } else if (it && it.leg20) {
    a.push('LEGACY PLAYER CARD', playerNames(it.leg20));
    const p = PP(it.leg20);
    if (p) a.push(POSW[p.pos] || p.pos, p.pos);
   } else {
    const pid = el.dataset.pid || v, p = pid ? PP(pid) : null;
    if (p) {
     a.push('PLAYER CARD', playerNames(pid), POSW[p.pos] || '', p.pos);
     if (!p.leg) {
      try {
       a.push(RW[V22.rarOf(pid)] || '');
      } catch (e) {}
     }
     try {
      a.push(teamHay(V22.teamOfCard(pid)));
      const c = V22.st().cards[pid];
      if (c) {
       if (c.t) a.push(teamHay(c.t));
       if (c.wn332) a.push(c.wn332);
       if (/^TRADE/.test(c.w || '')) a.push('TRADED TRADE');
       if (c.w) a.push(c.w);
      }
     } catch (e) {}
     if (p.team && p.team !== 'FA') a.push(teamHay(p.team));
     if (p.leg) a.push('LEGACY');
     if (p.gho16) a.push('GHOST GHOSTS RETRO');
     if (/^U_/.test(pid)) a.push('ULTIMATE');
     if (/^AA25-/.test(pid)) a.push('ALL AMERICAN ALL-AMERICAN');
     if (/^TW25-/.test(pid)) a.push('BAGGATWAAN BAAGAADOWEWINA');
     try {
      if (window.C30 && C30.parse && C30.parse(String(pid).replace(/^U_/, '').replace(/^(AA25-|TW25-)/, ''))) a.push('CUSTOM');
     } catch (e) {}
    }
   }
  } catch (e) {
   LOG.err.push(String(e));
  }
  const h = ' ' + words(a.join(' ')).join(' ') + ' ';
  HC.set(k, h);
  return h;
 }
 function mytHay(el) {
  const key = el.dataset.v || '';
  const a = [ el.innerText || '', el.getAttribute('aria-label') || '' ];
  try {
   const e = (V29R.entries() || []).find(x => x.key === key);
   if (e) {
    a.push(e.label, e.kind, teamHay(e.tid));
    a.push(e.now ? 'NOW CURRENT PRESENT THIS SEASON' : 'PAST OLD');
    a.push(e.gold ? 'TITLE CHAMPIONS CHAMPION WON WIN WINNER GOLD' + (/COLLEGE/.test(e.kind) ? ' NATTY NATIONAL CHAMPIONS' : '') + (/WORLD/.test(e.kind) ? ' WORLD CHAMPIONS' : '') : 'NO TITLE');
    if (/^pro:now$/.test(key)) {
     try {
      if (season && season.year) a.push('YEAR ' + season.year, String(season.year));
     } catch (er) {}
    }
    if (/^col/.test(key)) a.push('COLLEGE LAX');
    if (/^wg/.test(key)) a.push('WORLD GAMES COUNTRY NATIONAL');
    if (/^ult/.test(key)) a.push('ULTIMATE');
   }
  } catch (er) {
   LOG.err.push(String(er));
  }
  return ' ' + words(a.join(' ')).join(' ') + ' ';
 }
 const PLACE = {
  cards: {
   list: 'lockList',
   tile: '.c17',
   hay: cardHay
  },
  myt: {
   list: 'lockList',
   tile: '.myt29',
   hay: mytHay
  },
  cp: {
   list: 'cp232List',
   tile: '.c17',
   hay: cardHay
  }
 };
 function boxHtml(pl) {
  return '<span class="s34" id="s34box" data-s34="' + pl + '"><input type="search" id="s34q" data-s34="' + pl + '" value="' + esc34(Q[pl]) + '" placeholder="SEARCH" aria-label="SEARCH ' + (pl === 'myt' ? 'TEAMS' : 'CARDS') + '" enterkeyhint="search" inputmode="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="40">' + '<button type="button" class="s34x" data-a="s34clr" data-v="' + pl + '" aria-label="CLEAR SEARCH">&times;</button></span>';
 }
 function filter(pl) {
  const P = PLACE[pl], L = document.getElementById(P.list);
  if (!L) return null;
  const q = Q[pl], on = !!words(q).length;
  let shown = 0, tot = 0;
  for (const el of L.querySelectorAll(P.tile)) {
   tot++;
   const ok = !on || match(P.hay(el), q);
   el.classList.toggle('s34h', !ok);
   if (ok) shown++;
  }
  for (const sec of L.querySelectorAll('.sec17')) {
   const ts = sec.querySelectorAll(P.tile);
   if (!ts.length) {
    sec.classList.toggle('s34h', on && !!sec.querySelector('.grid17'));
    continue;
   }
   sec.classList.toggle('s34h', on && ![ ...ts ].some(t => !t.classList.contains('s34h')));
  }
  for (const n of L.querySelectorAll('.note')) n.classList.toggle('s34h', on);
  let nm = document.getElementById('s34none');
  if (on && !shown) {
   if (!nm) {
    nm = document.createElement('div');
    nm.id = 's34none';
    nm.className = 's34none';
    nm.textContent = 'NO MATCHES';
    L.appendChild(nm);
   }
  } else if (nm) nm.remove();
  const bx = document.getElementById('s34box');
  if (bx) bx.classList.toggle('q', on);
  LOG.srch.push([ pl, q, shown, tot ]);
  if (LOG.srch.length > 60) LOG.srch.shift();
  return {
   shown: shown,
   tot: tot
  };
 }
 function placeNow() {
  if (off('srch') || typeof screen === 'undefined') return null;
  if (screen === 'locker17') {
   const L = document.getElementById('lockList');
   if (!L) return null;
   if (window.V29R && V29R.myt && V29R.myt()) return 'myt';
   return document.querySelector('#panel [data-a="v17sec"][data-v="legacy"].on') ? 'cards' : null;
  }
  if (screen === 'lineup' && document.getElementById('cp232List')) return 'cp';
  return null;
 }
 function addBox(h, pl, listId) {
  const tag = '<div class="scroll" id="' + listId + '">';
  const i = h.lastIndexOf(tag);
  if (i < 0) return h;
  const pre = h.slice(0, i), m = pre.match(/<div class="(det17|det29|note)"[^>]*>[^<]*<\/div>$/);
  if (m) return pre.slice(0, pre.length - m[0].length) + '<div class="s34row">' + m[0] + boxHtml(pl) + '</div>' + h.slice(i);
  return pre + '<div class="s34row">' + boxHtml(pl) + '</div>' + h.slice(i);
 }
 function hookSearch() {
  if (typeof PANEL_RENDER === 'undefined') return;
  const L0 = PANEL_RENDER.locker17;
  if (L0 && !L0.__v34) {
   const L1 = function() {
    let h = L0.apply(this, arguments);
    try {
     if (!off('srch') && typeof h === 'string') {
      const myt = !!(window.V29R && V29R.myt && V29R.myt());
      const cards = !myt && /data-a="v17sec" data-v="legacy" class="on"/.test(h);
      if (myt || cards) h = addBox(h, myt ? 'myt' : 'cards', 'lockList');
     }
    } catch (e) {
     console.error(e);
    }
    return h;
   };
   L1.__v34 = true;
   PANEL_RENDER.locker17 = L1;
  }
  const P0 = PANEL_RENDER.lineup;
  if (P0 && !P0.__v34) {
   const P1 = function() {
    let h = P0.apply(this, arguments);
    try {
     if (!off('srch') && typeof h === 'string' && h.indexOf('id="cp232List"') >= 0) h = addBox(h, 'cp', 'cp232List');
    } catch (e) {
     console.error(e);
    }
    return h;
   };
   P1.__v34 = true;
   PANEL_RENDER.lineup = P1;
  }
  if (typeof PANEL_ACT !== 'undefined') PANEL_ACT.s34clr = v => {
   if (Q[v] == null) return PANEL_KEEP;
   Q[v] = '';
   const i = document.getElementById('s34q');
   if (i) i.value = '';
   filter(v);
   return PANEL_KEEP;
  };
  const pn = document.getElementById('panel');
  if (!pn || pn.__s34) return;
  pn.__s34 = 1;
  pn.addEventListener('input', ev => {
   const t = ev.target;
   if (!t || t.id !== 's34q') return;
   const pl = t.dataset.s34;
   if (Q[pl] == null) return;
   Q[pl] = t.value;
   filter(pl);
  });
  pn.addEventListener('keydown', ev => {
   const t = ev.target;
   if (t && t.id === 's34q' && ev.key === 'Enter') {
    ev.preventDefault();
    try {
     t.blur();
    } catch (e) {}
   }
  });
  const fit = () => {
   try {
    const f = document.activeElement && document.activeElement.id === 's34q', h = pn.getBoundingClientRect().height;
    document.body.classList.toggle('s34short', !!(f && h > 0 && h < 250));
   } catch (e) {}
  };
  const fitSoon = () => {
   fit();
   setTimeout(fit, 120);
   setTimeout(fit, 450);
  };
  pn.addEventListener('focusin', ev => {
   if (ev.target && ev.target.id === 's34q') {
    document.body.classList.add('s34kb');
    fitSoon();
   }
  });
  pn.addEventListener('focusout', ev => {
   if (ev.target && ev.target.id === 's34q') {
    document.body.classList.remove('s34kb');
    document.body.classList.remove('s34short');
    setTimeout(() => {
     try {
      if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
     } catch (e) {}
    }, 60);
   }
  });
  window.addEventListener('resize', fitSoon);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fitSoon);
  new MutationObserver(() => {
   try {
    const pl = placeNow();
    if (pl && Q[pl] && words(Q[pl]).length) filter(pl);
    if (!document.getElementById('s34q')) {
     document.body.classList.remove('s34kb');
     document.body.classList.remove('s34short');
    }
   } catch (e) {
    console.error(e);
   }
  }).observe(pn, {
   childList: true
  });
 }
 {
  let last = null;
  setInterval(() => {
   try {
    const pl = placeNow();
    if (last && pl !== last && !(last === 'cards' && pl === 'myt') && !(last === 'myt' && pl === 'cards')) {
     if (typeof screen !== 'undefined' && screen !== 'locker17' && last !== 'cp') {
      Q.cards = '';
      Q.myt = '';
     }
     if (last === 'cp' && pl !== 'cp') Q.cp = '';
    }
    last = pl;
   } catch (e) {}
  }, 400);
 }
 const FA = {};
 const RC34 = [ '#9aa3ab', '#3d8bff', '#ffcc33' ];
 function flipLayout(n) {
  const x0 = 6, y0 = 27, x1 = W - 6, y1 = H - 24, gap = 3;
  let best = null;
  for (let cols = 1; cols <= n; cols++) {
   const rows = Math.ceil(n / cols), cw = Math.floor((x1 - x0 - (cols - 1) * gap) / cols), chh = Math.floor((y1 - y0 - (rows - 1) * gap) / rows);
   let w = Math.min(cw, Math.floor(chh / 1.3)), h = Math.min(chh, Math.round(w * 1.3));
   if (w < 8) continue;
   if (!best || w * h > best.w * best.h) best = {
    cols: cols,
    rows: rows,
    w: w,
    h: h
   };
  }
  if (!best) best = {
   cols: n,
   rows: 1,
   w: 10,
   h: 13
  };
  const tw = best.cols * best.w + (best.cols - 1) * gap, th = best.rows * best.h + (best.rows - 1) * gap;
  best.x = Math.round((W - tw) / 2);
  best.y = Math.round(y0 + (y1 - y0 - th) / 2);
  best.gap = gap;
  return best;
 }
 function cardBack(x, y, w, h) {
  rect(x - 1, y - 1, w + 2, h + 2, '#000');
  rect(x, y, w, h, '#ffcc33');
  rect(x + 1, y + 1, w - 2, h - 2, '#13235a');
  for (let yy = y + 3; yy < y + h - 2; yy += 4) rect(x + 2, yy, w - 4, 1, '#1f3a8a');
  rect(x + 2, y + 2, w - 4, 1, 'rgba(255,255,255,.18)');
  if (w >= 9) text('?', x + w / 2 - 1, y + h / 2 - 3, 1, '#ffe14d', 'center');
 }
 function cardFace(pid, tid, x, y, w, h) {
  const p = PP(pid), r = (() => {
   try {
    return V22.rarOf(pid);
   } catch (e) {
    return 0;
   }
  })(), col = p && p.gho16 ? '#b48aff' : RC34[r] || RC34[0];
  rect(x - 1, y - 1, w + 2, h + 2, '#000');
  rect(x, y, w, h, col);
  rect(x + 1, y + 1, w - 2, h - 2, '#141b22');
  const s = Math.max(8, Math.min(w - 4, h - 12));
  let yy = y + 2;
  try {
   let c = V22.artCanvas(pid, V22.teamOfCard && V22.teamOfCard(pid) || tid);
   const ay = SA2403B ? sa2403By(yy) : yy;
   g.drawImage(c, Math.round(x + (w - s) / 2), Math.round(ay), s, s);
  } catch (e) {}
  yy += s + 1;
  const nm = p ? lastName(p) : '?';
  textMini(nm.length * 3 > w - 2 ? nm.slice(0, Math.max(3, Math.floor((w - 2) / 3))) : nm, x + w / 2, yy, '#ffffff');
  if (h - (yy - y) > 9) textMini(RW[r] || '', x + w / 2, yy + 5, col);
 }
 function flipDraw() {
  if (off('flip') || !window.V22 || !V22.flipDecks) return false;
  let ds = V22.flipDecks();
  if (!ds.length) return false;
  try {
   if (V22.flipPrune35 && V22.flipPrune35(ds[0].k)) {
    ds = V22.flipDecks();
    if (!ds.length) return false;
   }
  } catch (e) {
   console.error(e);
  }
  for (const id of [ 'c27', 'df2503', 'shop26', 'tut26card', 'tt27' ]) if (document.getElementById(id)) return false;
  try {
   if (window.V27 && V27.claims && V27.claims().length) return false;
  } catch (e) {}
  const d = ds[0], n = d.ids.length, need = V22.flipNeed ? V22.flipNeed(d) : d.need, got = d.f.length, done = got >= need, t = performance.now() / 1e3;
  hit('V17 POP BLOCK', 0, 0, W, H, () => {}, 'V17 POP BLOCK');
  rect(0, 0, W, H, 'rgba(0,0,0,.78)');
  let tn = '';
  try {
   const tt = tOf(d.tid) || SZ_REG[d.tid] && SZ_REG[d.tid].szBase && tOf(SZ_REG[d.tid].szBase);
   tn = up(tt && tt.name);
  } catch (e) {}
  rect(0, 0, W, 24, '#0b1118');
  rect(0, 23, W, 1, '#ffcc33');
  text(done ? 'YOUR ' + need + ' NEW CARD' + (need === 1 ? '' : 'S') + '!' : need < 6 ? 'TITLE WON - FLIP ALL ' + need + ' CARDS' : 'TITLE WON - FLIP 6 CARDS', W / 2, 4, 1, '#ffe14d', 'center');
  textMini((tn ? tn + '  -  ' : '') + up(d.why) + '  -  FLIPPED ' + got + ' / ' + need + (n > need ? '  -  ' + n + ' CARDS YOU DON\'T HAVE' : ''), W / 2, 14, '#cfe');
  const Lb = flipLayout(n);
  for (let i = 0; i < n; i++) {
   const cx = Lb.x + i % Lb.cols * (Lb.w + Lb.gap), cy = Lb.y + Math.floor(i / Lb.cols) * (Lb.h + Lb.gap), pid = d.ids[i], fl = d.f.includes(i);
   if (fl) {
    const a = FA[d.k + '|' + i], pr = a ? Math.min(1, (t - a) / .35) : 1, sx = Math.abs(Math.cos(pr * Math.PI));
    const ww = Math.max(1, Math.round(Lb.w * sx)), ox = Math.round((Lb.w - ww) / 2);
    if (pr < .5) cardBack(cx + ox, cy, ww, Lb.h); else if (ww >= 6) cardFace(pid, d.tid, cx + ox, cy, ww, Lb.h);
    if (pr >= 1) rect(cx, cy + Lb.h + 1, Lb.w, 1, '#7dff7a');
   } else {
    const gone = V22.flipGone && V22.flipGone(d, i);
    if (gone) {
     cardFace(pid, d.tid, cx, cy, Lb.w, Lb.h);
     rect(cx, cy, Lb.w, Lb.h, 'rgba(0,0,0,.55)');
     textMini('HAVE', cx + Lb.w / 2, cy + Lb.h / 2 - 2, '#ffe14d');
     continue;
    }
    cardBack(cx, cy, Lb.w, Lb.h);
    if (done) rect(cx, cy, Lb.w, Lb.h, 'rgba(0,0,0,.45)'); else hit('FLIP ' + (i + 1), cx, cy, Lb.w, Lb.h, () => pick(d.k, i), 'FLIP ' + (i + 1));
   }
  }
  if (done) button('COLLECT', Math.round(W / 2 - 50), H - 21, 100, 16, () => collect(d.k), {
   bg: '#7dff7a'
  }); else textMini('TAP A CARD TO FLIP IT - YOU KEEP THE ONES YOU FLIP', W / 2, H - 15, '#9aa3ab');
  return true;
 }
 function pick(key, i) {
  const pid = V22.flipPick(key, i);
  if (!pid) return;
  FA[key + '|' + i] = performance.now() / 1e3;
  LOG.flip.push([ 'pick', key, i, pid ]);
  try {
   SFX.tap && SFX.tap();
  } catch (e) {}
 }
 function collect(key) {
  const d = (V22.flipDecks() || []).find(x => x.k === key);
  if (!d) return;
  if (!V22.flipDone(key)) return;
  LOG.flip.push([ 'collect', key, d.f.length ]);
  try {
   V17.toast(d.f.length + ' NEW PLAYER CARD' + (d.f.length === 1 ? '' : 'S') + ' - LOCKER ROOM > CARDS', '#7dff7a');
  } catch (e) {}
  try {
   if (V17.checkAch) V17.checkAch();
  } catch (e) {
   console.error(e);
  }
  try {
   SFX.cheer && SFX.cheer();
  } catch (e) {}
 }
 const owned = id => {
  try {
   return !!(window.V22 && V22.owned(id));
  } catch (e) {
   return false;
  }
 };
 const rosterOf = tid => {
  try {
   return (teamRosterIds(tid, 'real') || []).filter(id => PP(id) && !PP(id).leg);
  } catch (e) {
   return [];
  }
 };
 const famOf = tid => {
  const r = rosterOf(tid);
  return [ r.filter(owned).length, Math.max(1, r.length) ];
 };
 const best = ids => {
  let b = [ 0, 1 ], bf = -1;
  for (const id of ids) {
   const v = famOf(id), f = v[0] / v[1];
   if (f > bf || f === bf && v[0] > b[0]) {
    b = v;
    bf = f;
   }
  }
  return b;
 };
 const st17 = () => window.V17 && V17.ST ? V17.ST() : null;
 const hasI = id => {
  const s = st17();
  return !!(s && s.inv && (s.inv[id] || 0) > 0);
 };
 const cardCount = r => {
  try {
   return V22.ownedIds().filter(id => r == null || V22.rarOf(id) === r).length;
  } catch (e) {
   return 0;
  }
 };
 const unis = grp => {
  try {
   const U = window.UNI21;
   if (!U || !U.on()) return [];
   const L = U.items(), ids = new Set((grp === 'pro' ? TEAMS : WTEAMS).map(t => t.id));
   return grp === 'col' ? (U.col2504 || []).filter(it => V17.BY[it.id]) : L.filter(it => it.uni21 && ids.has(it.uni21.tid));
  } catch (e) {
   return [];
  }
 };
 function cityName(tid, tail) {
  const t = tOf(tid), nm = up(t && t.name) || tid;
  let lg = '';
  try {
   if (TEAMS.filter(x => up((tOf(x.id) || {}).name) === nm).length > 1) lg = ' (' + up(t.lg || t.league || '').replace(/ \+ .*/, '') + ')';
  } catch (e) {}
  return nm + (tail || '') + lg;
 }
 const ACH34 = [];
 function defs() {
  if (ACH34.length) return ACH34;
  const P = (id, n, d, v) => ACH34.push({
   id: 'a34_' + id,
   n: n,
   d: d,
   k: 'a34',
   v: v
  });
  for (const t of typeof TEAMS !== 'undefined' ? TEAMS : []) {
   const tid = t.id;
   ACH34.push({
    id: 'a34_fam_' + tid,
    get n() {
     return cityName(tid, ' FAMILY');
    },
    get d() {
     return 'OWN A PLAYER CARD OF EVERY PLAYER ON THE ' + cityName(tid, ' ROSTER');
    },
    k: 'a34',
    v: 'fam:' + tid
   });
  }
  P('colfam', 'COLLEGE FAMILY', 'OWN A PLAYER CARD OF EVERY PLAYER ON ONE COLLEGE TEAM', 'colfam');
  P('wgfam', 'NATIONAL FAMILY', 'OWN A PLAYER CARD OF EVERY PLAYER ON ONE WORLD GAMES COUNTRY', 'wgfam');
  P('cards50', 'DEEP BENCH', 'OWN 50 PLAYER CARDS', 'cards:50');
  P('cards100', 'CARD CENTURY', 'OWN 100 PLAYER CARDS', 'cards:100');
  P('leg1', 'LEGEND IN HAND', 'OWN A LEGENDARY PLAYER CARD', 'leg:1');
  P('leg10', 'LEGENDARY TEN', 'OWN 10 LEGENDARY PLAYER CARDS', 'leg:10');
  P('coach5', 'COACHING TREE', 'OWN 5 COACH CARDS', 'coach:5');
  P('flip1', 'FLIP SIX', 'WIN A TITLE AND FLIP YOUR 6 CARDS', 'flip:1');
  P('trade1', 'TRADE DEADLINE', 'GET A CARD IN A TRADE', 'trade:1');
  P('pass10', 'PASS LEVEL 10', 'REACH LEVEL 10 ON THE GAME PASS', 'pass:10');
  P('pass100', 'MAXED OUT', 'REACH LEVEL 100 ON THE GAME PASS', 'pass:100');
  P('natty', 'NATIONAL CHAMPS', 'WIN A COLLEGE LAX NATIONAL TITLE', 'tro:trophy_natty');
  P('ult', 'ULTIMATE CHAMP', 'WIN ULTIMATE BAGGA LAX', 'tro:trophy_ultimate');
  P('collars', 'COLLAR CLUB', 'OWN EVERY COLLAR', 'collars');
  P('dressed', 'DRESSED UP', 'OWN ALL 5 UNIFORMS OF ONE TEAM', 'dressed');
  P('procloset', 'PRO CLOSET', 'OWN EVERY PRO TEAM UNIFORM', 'unis:pro');
  return ACH34;
 }
 function achVal(v) {
  const [k, a] = String(v).split(/:(.*)/);
  switch (k) {
  case 'fam':
   return famOf(a);

  case 'colfam':
   return best(window.COL25 && COL25.IDS || []);

  case 'wgfam':
   return best((typeof WTEAMS !== 'undefined' ? WTEAMS : []).map(t => t.id));

  case 'cards':
   return [ Math.min(+a, cardCount(null)), +a ];

  case 'leg':
   return [ Math.min(+a, cardCount(2)), +a ];

  case 'coach':
   {
    let n = 0;
    try {
     n = Object.keys(V232.coaches() || {}).length;
    } catch (e) {}
    try {
     const c = LS.get('dcoach30', {});
     n += Object.keys(c || {}).filter(x => /^dc\|/.test(x)).length;
    } catch (e) {}
    return [ Math.min(+a, n), +a ];
   }

  case 'flip':
   {
    let n = 0;
    try {
     n = (V22.flipSt().done || []).length;
    } catch (e) {}
    return [ Math.min(+a, n), +a ];
   }

  case 'trade':
   {
    let n = 0;
    try {
     const cs = V22.st().cards || {};
     for (const id in cs) if (cs[id] && /^TRADE/.test(cs[id].w || '') && owned(id)) n++;
    } catch (e) {}
    return [ Math.min(+a, n), +a ];
   }

  case 'pass':
   {
    const s = st17();
    const lv = s && s.pass ? Math.max(Math.floor(+s.pass.stars || 0), Math.floor((+s.pass.notch || 0) / 5)) : 0;
    return [ Math.min(+a, lv), +a ];
   }

  case 'tro':
   {
    const s = st17();
    return [ s && s.trophies && s.trophies[a] ? 1 : 0, 1 ];
   }

  case 'collars':
   {
    const L = (V17.I || []).filter(it => it.sec === 'collar');
    return [ L.filter(it => hasI(it.id)).length, Math.max(1, L.length) ];
   }

  case 'dressed':
   {
    const by = {};
    for (const it of unis('pro').concat(unis('wg'), unis('col'))) {
     const t = it.uni21.tid;
     const o = by[t] || (by[t] = [ 0, 0 ]);
     o[1]++;
     if (hasI(it.id)) o[0]++;
    }
    let b = [ 0, 5 ];
    for (const t in by) if (by[t][0] / by[t][1] > b[0] / b[1]) b = by[t];
    return b;
   }

  case 'unis':
   {
    const L = unis(a);
    return [ L.filter(it => hasI(it.id)).length, Math.max(1, L.length) ];
   }
  }
  return [ 0, 1 ];
 }
 function achInit() {
  if (off('ach') || !window.V17 || !Array.isArray(V17.ACH)) return;
  for (const a of defs()) if (!V17.ACH.some(x => x.id === a.id)) V17.ACH.push(a);
  let f = null;
  try {
   f = LS.get('v34ach', null);
  } catch (e) {}
  if (f) return;
  const s = st17();
  if (!s || !s.ach) return;
  const got = [];
  for (const a of ACH34) {
   if (s.ach[a.id]) continue;
   try {
    const [h, n] = achVal(a.v);
    if (h >= n) {
     s.ach[a.id] = Date.now();
     got.push(a.id);
    }
   } catch (e) {
    console.error(e);
   }
  }
  try {
   LS.set('v34ach', {
    at: Date.now(),
    n: got.length
   });
  } catch (e) {}
  if (got.length) {
   try {
    V17.save();
   } catch (e) {}
   setTimeout(() => {
    LOG.ach.push([ 'toast', got.length ]);
    try {
     V17.toast(got.length + ' NEW ACHIEVEMENT' + (got.length === 1 ? '' : 'S') + ' FOR WHAT YOU ALREADY HAVE', '#7dff7a');
    } catch (e) {}
   }, 2500);
  }
  LOG.ach.push([ 'init', got ]);
 }
 function garFix() {
  if (off('gar')) return 0;
  let n = 0;
  try {
   const c = LS.get('coach232', null);
   if (c && typeof c === 'object') {
    for (const k in c) if (c[k] && window.V401H && V401H.h(String(c[k].n || '').trim().toUpperCase()) === 'lkb4ybdac0') {
     c[k].n = 'Keith Radford';
     n++;
    }
    if (n) LS.set('coach232', c);
   }
  } catch (e) {
   console.error(e);
  }
  return n;
 }
 function css() {
  if (document.getElementById('v34css')) return;
  const s = document.createElement('style');
  s.id = 'v34css';
  s.textContent = [ '#panel .s34row{display:flex;align-items:center;gap:6px;min-width:0;flex:0 0 auto}', '#panel .s34row>.det17,#panel .s34row>.det29,#panel .s34row>.note{flex:1 1 auto;min-width:0;margin:0}', '#panel .s34{position:relative;display:flex;align-items:center;flex:0 0 auto;width:min(42%,230px)}', '#panel .s34 input{-webkit-appearance:none;appearance:none;font:bold 16px/1.1 ui-monospace,Menlo,Consolas,monospace;font-size:16px;text-transform:uppercase;width:100%;min-width:0;flex:1 1 auto;height:30px;min-height:30px;padding:3px 34px 3px 8px;margin:0;border-radius:4px;border:2px solid #2cc4dc;background:#0b1a20;color:#fff;box-sizing:border-box;-webkit-user-select:text;user-select:text}', '#panel .s34 input::-webkit-search-cancel-button,#panel .s34 input::-webkit-search-decoration{-webkit-appearance:none;appearance:none;display:none}', '#panel .s34 input::placeholder{color:#5f7a86}', '#panel .s34 .s34x{-webkit-appearance:none;appearance:none;position:absolute;right:1px;top:50%;transform:translateY(-50%);width:32px;height:28px;min-height:0;padding:0;margin:0;border:0;border-radius:3px;background:transparent;color:#8fe3f0;font:bold 20px/1 sans-serif;box-shadow:none;display:none;align-items:center;justify-content:center}', '#panel .s34.q .s34x{display:flex}', '#panel .s34h{display:none!important}', '#panel .s34none{padding:14px 6px;text-align:center;color:#ffd23a;font-size:13px;letter-spacing:1px;width:100%}', 'body.s34short #panel .row.tabs{display:none}', 'body.s34short #panel .s34row>.det17,body.s34short #panel .s34row>.det29,body.s34short #panel .s34row>.note{display:none}', 'body.s34short #panel .s34{width:100%}', '#panel .c17 .tr34{font-size:6.5px;line-height:1;letter-spacing:1px;color:#ffb35a;border:1px solid #ffb35a;border-radius:2px;padding:1px 2px 0;margin-top:2px;background:rgba(40,20,0,.6)}' ].join('\n');
  (document.head || document.documentElement).appendChild(s);
 }
 function init() {
  try {
   css();
  } catch (e) {
   console.error(e);
  }
  try {
   hookSearch();
  } catch (e) {
   console.error(e);
  }
  try {
   if (window.V22 && V22.flipResume && !off('flip')) V22.flipResume();
  } catch (e) {
   console.error(e);
  }
  try {
   achInit();
  } catch (e) {
   console.error(e);
  }
  try {
   garFix();
  } catch (e) {
   console.error(e);
  }
 }
 const API = {
  off: off,
  LOG: LOG,
  Q: Q,
  match: match,
  words: words,
  cardHay: cardHay,
  mytHay: mytHay,
  filter: filter,
  placeNow: placeNow,
  flipDraw: flipDraw,
  flipLayout: flipLayout,
  pick: pick,
  collect: collect,
  achVal: achVal,
  defs: defs,
  ACH34: ACH34,
  achInit: achInit,
  garFix: garFix,
  cityName: cityName
 };
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
 return API;
})();

window.V34 = V34;
