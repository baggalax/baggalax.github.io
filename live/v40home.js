(function() {
 'use strict';
 const off = () => !!(window.__rl_no40h || window.__rl_v124gb);
 const STYLE = {
  personality: false,
  subs: 'pass',
  info: true,
  chirpBubble: true,
  shineEvery: 3.2,
  hop: 2,
  tilt: 1
 };
 const plain = () => off() || !!window.__rl_no40hp || !(STYLE.personality || window.__rl_40hp);
 const V = window.V40H = {
  log: [],
  on: () => !off() && !!window.V38H && V38H.on()
 };
 V.STYLE = STYLE;
 if (!window.V38H) return;
 V.SHOP_LABEL = 'YARD SALE';
 const coinHook = () => window.V40_COIN || window.V39CUR && (V39CUR.drawCoin || V39CUR.coin) || window.V39C && (V39C.drawCoin || V39C.coin) || window.V17 && V17.drawCoin || null;
 const T = () => typeof menuT !== 'undefined' ? menuT : performance.now() / 1e3;
 let LAST = [];
 V.rects = () => LAST.slice();
 const ICON = {
  dime: {
   p: {
    k: '#123a52',
    b: '#bfefff',
    a: '#7fd3f0',
    W: '#ffffff',
    s: '#1f5f86'
   },
   r: [ '..kkkkk..', '.kbWbbbk.', 'kbsWbbsak', 'kbbsbsbak', 'kbbbsbbak', 'kbbsbsbak', 'kbsbbbsak', '.kbbbaak.', '..kkkkk..' ]
  },
  jersey: {
   p: {
    k: '#0b1a20',
    r: '#e8443a',
    R: '#a82820',
    w: '#ffffff'
   },
   r: [ '.kk...kk.', 'krrkkkrrk', 'krrrrrrRk', 'kkrrrrRkk', '.krrwrRk.', '.krwwrRk.', '.krrwrRk.', '.krwwwRk.', '.kkkkkkk.' ]
  },
  whistle: {
   p: {
    k: '#0b1a20',
    g: '#e4ecf0',
    G: '#8a9aa6',
    y: '#ffe14d'
   },
   r: [ 'y.........', '.y...kkkk.', 'kkkkkggggk', 'kggggggGGk', 'kkkkkgGGGk', '....kGGGk.', '.....kkk..' ]
  },
  megaphone: {
   p: {
    k: '#0b1a20',
    o: '#ffffff',
    O: '#c9d6d9',
    w: '#ffe14d'
   },
   r: [ '......kk.', '....kkok.w', 'kkkkooOk..', 'koooooOk.w', 'koooooOk..', 'kkkkooOk.w', '..k.kkok..', '..k...kk.' ]
  },
  trophy: {
   p: {
    k: '#0b1a20',
    y: '#ffcc33',
    Y: '#c99400',
    w: '#fff6c0'
   },
   r: [ '.kkkkkkk.', 'kkwyyyYkk', 'ykwyyyYky', 'kkkyyyYkk', '..kyyYk..', '...kYk...', '...kyk...', '..kkkkk..', '..kYYYk..', '..kkkkk..' ]
  },
  clapper: {
   p: {
    k: '#0b1a20',
    w: '#ffffff',
    g: '#3a4652',
    r: '#ff9a3d'
   },
   r: [ 'kwwkkwwkk', 'kkwwkkwwk', 'kkkkkkkkk', 'kgggggggk', 'kgwwrwwgk', 'kgggggggk', 'kgwwwwggk', 'kkkkkkkkk' ]
  },
  pencil: {
   p: {
    k: '#0b1a20',
    p: '#ff8fb0',
    y: '#ffd23a',
    Y: '#d99a10',
    t: '#f0c890'
   },
   r: [ '......kk.', '.....kppk', '....kyykk', '...kyyYk.', '..kyyYk..', '.ktyYk...', '.kttk....', 'kkkk.....', 'k........' ]
  },
  star: {
   p: {
    k: '#0b1a20',
    y: '#fff6c0',
    Y: '#ffffff',
    o: '#c99400'
   },
   r: [ '....k....', '...kYk...', 'kkkkYykkk', 'kYYYYyyok', '.kyyyyok.', '..kyyyok.', '.kyyokyok', '.kyk.kyk.', '.kk...kk.' ]
  }
 };
 function icon(id, x, y, k) {
  const I = ICON[id];
  if (!I) return;
  k = k || 1;
  if (id === 'dime') {
   const h = coinHook();
   if (h) {
    try {
     h(x, y, 9 * k);
     return;
    } catch (e) {}
   }
  }
  for (let j = 0; j < I.r.length; j++) {
   const row = I.r[j];
   let i = 0;
   while (i < row.length) {
    const c = row[i];
    if (c === '.' || !I.p[c]) {
     i++;
     continue;
    }
    let n = 1;
    while (row[i + n] === c) n++;
    rect(x + i * k, y + j * k, n * k, k, I.p[c]);
    i += n;
   }
  }
 }
 V.icon = icon;
 V.ICONS = Object.keys(ICON);
 function drawBtn(b, x, y, w, h, live, ex, ey, shineK) {
  const P = !plain();
  if (live) hit(b.key, x - ex, y - ey, w + ex * 2, h + ey * 2, b.fn, b.label);
  let dy = 0;
  if (P && b.kind === 'sign' && STYLE.hop) {
   const ph = T() % 2.6 / 2.6;
   if (ph < .14) dy = -Math.round(STYLE.hop * Math.sin(Math.PI * ph / .14));
  }
  const cx = x + w / 2, cy = y + h / 2 + dy, a = P ? (b.ang || 0) * STYLE.tilt * Math.PI / 180 : 0;
  g.save();
  if (a) {
   g.translate(cx, cy);
   g.rotate(a);
   g.translate(-cx, -cy);
  }
  const Y = y + dy;
  if (P && b.kind === 'sign') {
   rect(x + 1, Y + 3, w - 1, h, 'rgba(0,0,0,.55)');
   rect(x + 2, Y, w - 4, h, '#c8995a');
   rect(x, Y + 2, w, h - 4, '#c8995a');
   rect(x + 1, Y + 1, w - 2, h - 2, '#c8995a');
   for (let k = Y + 3; k < Y + h - 2; k += 3) rect(x + 2, k, w - 4, 1, 'rgba(120,80,30,.18)');
   rect(x + 2, Y, w - 4, 1, '#e2b97c');
   rect(x + 2, Y + h - 1, w - 4, 1, '#8b5e2b');
   rect(x, Y + 2, 1, h - 4, '#a9793e');
   rect(x + w - 1, Y + 2, 1, h - 4, '#8b5e2b');
   rect(x + w - 9, Y + h - 4, 6, 1, 'rgba(90,55,20,.35)');
   rect(x + 5, Y + 3, 4, 1, 'rgba(90,55,20,.3)');
   const s = b.lab, adv = 8, tw = s.length * adv - 2, ix = 22, x0 = Math.round(x + (w - tw - ix) / 2 + ix), ty = Y + (b.sub ? 4 : Math.round((h - 10) / 2));
   icon(b.icon, x0 - ix, Math.round(Y + (h - 18) / 2), 2);
   for (let i = 0; i < s.length; i++) {
    if (s[i] === ' ') continue;
    const j = (i * 7 + 3) % 3 - 1;
    text(s[i], x0 + i * adv, ty + j * .5, 2, i % 2 ? '#2b1608' : '#3a1d0a');
   }
   if (b.sub) textMini(b.sub, x + w / 2, ty + 13, '#5a3a18');
  } else if (!P && b.key === 'CHIRP LOADOUT' && STYLE.chirpBubble && !window.__rl_no40chirp) {
   const bh = h - 4, cr = '#fff6e0', ol = '#0b1a20', tx = x + 12;
   const blob = (ox, oy, c1, c2) => {
    rect(ox + 2, oy, w - 4, bh, c1);
    rect(ox, oy + 2, w, bh - 4, c1);
    rect(ox + 1, oy + 1, w - 2, bh - 2, c1);
    rect(ox + 3, oy + 1, w - 6, bh - 2, c2);
    rect(ox + 1, oy + 3, w - 2, bh - 6, c2);
    rect(ox + 2, oy + 2, w - 4, bh - 4, c2);
    const t0 = ox - x + tx;
    rect(t0 - 1, oy + bh - 1, 8, 1, c1);
    rect(t0, oy + bh - 1, 6, 1, c2);
    rect(t0 - 2, oy + bh, 7, 1, c1);
    rect(t0 - 1, oy + bh, 4, 1, c2);
    rect(t0 - 3, oy + bh + 1, 5, 1, c1);
    rect(t0 - 2, oy + bh + 1, 2, 1, c2);
    rect(t0 - 4, oy + bh + 2, 3, 1, c1);
   };
   blob(x, Y + 2, '#000', '#000');
   blob(x, Y, ol, cr);
   rect(x + 3, Y + 1, w - 6, 1, '#ffffff');
   rect(x + 3, Y + bh - 2, w - 6, 1, 'rgba(120,90,40,.18)');
   for (let i = 0; i < 3; i++) rect(x + w - 12 + i * 3, Y + bh - 5, 1, 1, 'rgba(11,26,32,.35)');
   text(b.lab, x + w / 2 + 1, Math.round(Y + (bh - 5) / 2), 1, '#0b1a20', 'center');
  } else if (!P) {
   const big = b.kind !== 'small', chev = big ? 14 : 0, sub = STYLE.subs === 'all' || STYLE.subs === 'pass' && b.key === 'PASS' ? b.sub : null;
   rect(x, Y + 2, w, h, '#000');
   rect(x, Y, w, h, b.bg);
   rect(x, Y, w, 1, 'rgba(255,255,255,.4)');
   rect(x, Y + h - 2, w, 2, 'rgba(0,0,0,.18)');
   rect(x, Y, 3, h, 'rgba(0,0,0,.22)');
   if (chev) for (let i = 0; i < 3; i++) rect(x + w - 9 + i, Y + h / 2 - 3 + i, 1, 7 - 2 * i, 'rgba(11,26,32,.55)');
   if (b.info && STYLE.info) {
    const ly = Math.round(Y + (h - 13) / 2);
    text(b.lab, x + w / 2 + 1, ly, 1, '#0b1a20', 'center');
    try {
     b.info(x + w / 2 + 1, ly + 8);
    } catch (e) {}
   } else {
    const fs = big && textW(b.lab, 2) <= w - 8 - chev * 2 ? 2 : 1, lh = 5 * fs, blockH = lh + (sub ? 6 : 0), ly = Math.round(Y + (h - blockH) / 2);
    text(b.lab, x + w / 2 + 1, ly, fs, '#0b1a20', 'center');
    if (sub) textMini(sub, x + w / 2 + 1, ly + lh + 2, 'rgba(11,26,32,.8)');
   }
  } else {
   rect(x, Y + 2, w, h, '#000');
   rect(x, Y, w, h, b.bg);
   rect(x, Y, w, 1, 'rgba(255,255,255,.45)');
   rect(x, Y + h - 1, w, 1, 'rgba(0,0,0,.25)');
   const big = b.kind === 'big', ik = big ? 2 : 1, iw = P ? 9 * ik + 3 : 0, sw = b.sub ? Math.ceil(b.sub.length * 4 * .65) : 0;
   let fs = big ? 2 : 1;
   if (Math.max(textW(b.lab, fs), sw) + iw + 6 > w) fs = 1;
   const tw = textW(b.lab, fs), colW = Math.max(tw, sw), bx0 = Math.round(x + (w - colW - iw) / 2), cx = bx0 + iw + colW / 2;
   const lh = 5 * fs, blockH = lh + (b.sub ? 6 : 0), ly = Math.round(Y + (h - blockH) / 2);
   if (P) icon(b.icon, bx0, Math.round(Y + (h - 9 * ik) / 2), ik);
   text(b.lab, Math.round(cx - tw / 2), ly, fs, '#0b1a20');
   if (b.sub) textMini(b.sub, cx, ly + lh + 2, '#0b1a20');
  }
  if (P) {
   const tape = (tx, ty, r) => {
    g.save();
    g.translate(tx, ty);
    g.rotate(r);
    g.fillStyle = 'rgba(236,228,196,.88)';
    g.fillRect(-5, -1.5, 10, 3);
    g.fillStyle = 'rgba(160,150,120,.5)';
    g.fillRect(-5, 1, 10, .5);
    g.restore();
   };
   tape(x + 2, Y + 1, -.75);
   tape(x + w - 2, Y + 1, .75);
   if (shineK != null && shineK >= 0 && shineK <= 1) {
    g.save();
    g.beginPath();
    g.rect(x, Y, w, h);
    g.clip();
    const sx = x - 14 + (w + 28) * shineK;
    g.fillStyle = 'rgba(255,255,255,.38)';
    g.beginPath();
    g.moveTo(sx, Y);
    g.lineTo(sx + 6, Y);
    g.lineTo(sx + 6 - h * .5, Y + h);
    g.lineTo(sx - h * .5, Y + h);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.beginPath();
    g.moveTo(sx + 8, Y);
    g.lineTo(sx + 10, Y);
    g.lineTo(sx + 10 - h * .5, Y + h);
    g.lineTo(sx + 8 - h * .5, Y + h);
    g.closePath();
    g.fill();
    g.restore();
   }
  }
  g.restore();
  if (b.badge) {
   const bw = Math.max(7, textW(b.badge) + 4), bx = x + w - bw - 1, bl = Math.floor(T() * 3) % 2;
   rect(bx, y - 3 + dy, bw, 8, b.badge === '!' ? bl ? '#ff3b3b' : '#ffe14d' : '#05080b');
   text(b.badge, bx + bw / 2, y - 2 + dy, 1, b.badge === '!' ? '#fff' : '#ffe14d', 'center');
  }
  LAST.push({
   key: b.key,
   lab: b.label,
   x: x,
   y: y,
   w: w,
   h: h
  });
 }
 V.layout = function(L) {
  const ST = V17.ST(), PASS = V17.PASS || [];
  const lv = Math.min(PASS.length, ST.pass.stars || 0), pReady = !ST.pass.owned ? lv > 0 : (ST.pass.got || 0) < lv;
  let left = 0;
  try {
   left = V17.chalSync().filter(c => !ST.wk.done[c.id]).length;
  } catch (e) {}
  let free = false;
  try {
   free = V17.dailyReady() || V17.stickReady();
  } catch (e) {}
  try {
   lobby.passLv = lv;
   lobby.passReady = pReady;
   lobby.passNotch = lv >= PASS.length ? 5 : (ST.pass.notch || 0) % 5;
  } catch (e) {}
  let done = 0, tot = 0;
  try {
   const cl = V17.chalSync();
   tot = cl.length;
   done = cl.filter(c => ST.wk.done[c.id]).length;
  } catch (e) {}
  const nn = lv >= PASS.length ? 5 : (ST.pass.notch || 0) % 5, dark = '#0b1a20';
  const miniW = t => t.length * 4 * .65 - .65;
  const passInfo = (cx, yy) => {
   const L = window.V40LETTY && V40LETTY.on && V40LETTY.on(), ic = L && V40LETTY.iconOn && V40LETTY.iconOn(), a = 'LV ' + lv, c = lv >= PASS.length ? 'MAX' : nn + '/5';
   const tw = miniW(a) + 4 + (ic ? 9 : 0) + 29 + 3 + miniW(c);
   let x0 = Math.round(cx - tw / 2);
   textMini(a, x0 + miniW(a) / 2, yy + .5, dark);
   x0 += Math.ceil(miniW(a)) + 4;
   if (ic) {
    V40LETTY.icon(x0, yy - 1, 1);
    x0 += 9;
   }
   const fill = L ? V40LETTY.BAR.fill : '#c99400', top = L ? V40LETTY.BAR.top : '#fff6c0';
   rect(x0 - 1, yy - 1, 31, 6, dark);
   for (let i = 0; i < 5; i++) {
    rect(x0 + i * 6, yy, 5, 4, i < nn ? fill : 'rgba(255,255,255,.18)');
    if (i < nn) rect(x0 + i * 6, yy, 5, 1, top);
   }
   x0 += 29 + 3;
   textMini(c, x0 + miniW(c) / 2, yy + .5, dark);
  };
  const weekInfo = (cx, yy) => {
   textMini(done + '/' + tot + ' DONE', cx, yy + .5, dark);
  };
  V.info = {
   lv: lv,
   nn: nn,
   done: done,
   tot: tot
  };
  const promoOn = !!(plain() && window.V40PROMO && V40PROMO.want());
  const clipsOn = !!(window.V35 && V35.clipOn && V35.clipOn()), edOn = !!(window.ED31 && !window.__rl_no32ed), chirpOn = !window.__rl_no2402;
  const rows = [ [ {
   key: 'SHOP',
   lab: V.SHOP_LABEL,
   label: 'STRING SHOP',
   sub: 'CARD PACKS + GEAR',
   fn: () => V17.openShop(),
   bg: '#7dff7a',
   badge: free ? '!' : null,
   icon: 'dime',
   ang: -1,
   kind: 'sign',
   wf: promoOn ? .62 : null
  } ].concat(promoOn ? [ {
   key: 'PROMO',
   promo: true,
   kind: 'sign',
   wf: .38
  } ] : []), [ {
   key: 'LOCKER ROOM',
   lab: 'LOCKER ROOM',
   label: 'LOCKER ROOM',
   sub: 'YOUR CARDS + GEAR',
   fn: () => V17.openLocker(),
   bg: '#8fe3f0',
   icon: 'jersey',
   ang: .8,
   kind: 'big'
  } ], [ {
   key: 'PASS',
   lab: 'PASS',
   label: 'PASS',
   sub: 'LV ' + lv + '/' + PASS.length,
   fn: () => V17.openPass(),
   bg: '#ffcc33',
   badge: pReady ? '!' : null,
   info: passInfo,
   icon: 'star',
   ang: -1.5,
   kind: 'small'
  }, {
   key: 'WEEKLY',
   lab: plain() && STYLE.subs !== 'all' ? 'WEEKLY CHALLENGES' : 'WEEKLY',
   label: 'WEEKLY',
   sub: 'CHALLENGES',
   fn: () => V17.openChal(),
   bg: '#b9a8ff',
   badge: left ? String(left) : null,
   info: weekInfo,
   icon: 'trophy',
   ang: 1.2,
   kind: 'small'
  } ], [ {
   key: 'TEAM CREW',
   lab: 'TEAM CREW',
   label: 'TEAM CREW',
   sub: 'YOUR STAFF',
   fn: () => V17.openCrew(),
   bg: '#ff9a4a',
   icon: 'whistle',
   ang: 1.4,
   kind: 'small'
  } ].concat(chirpOn ? [ {
   key: 'CHIRP LOADOUT',
   lab: 'CHIRP LOADOUT',
   label: 'CHIRP LOADOUT',
   sub: 'TRASH TALK',
   fn: () => V17.openCload(),
   bg: '#ff6a5a',
   icon: 'megaphone',
   ang: -1,
   kind: 'small'
  } ] : []), [].concat(clipsOn ? [ {
   key: 'CLIPS',
   lab: 'CLIPS',
   label: 'CLIPS',
   sub: 'YOUR SAVED PLAYS',
   fn: () => V38H.openClips(),
   bg: '#ff5ad2',
   icon: 'clapper',
   ang: -1.2,
   kind: 'small'
  } ] : [], edOn ? [ {
   key: 'EDIT NAMES',
   lab: 'EDIT NAMES',
   label: 'EDIT NAMES',
   sub: 'TEAMS + PLAYERS',
   fn: () => ED31.open(),
   bg: '#c9d6d9',
   icon: 'pencil',
   ang: 1.5,
   kind: 'small'
  } ] : []) ].filter(r => r.length);
  return rows;
 };
 const RH = {
  sign: 30,
  big: 26,
  small: 22
 };
 V.draw = function(L, live) {
  LAST = [];
  const rows = V.layout(L), mx = 8, gap = 6, vg = 4, top = 17, w = L - mx * 2;
  const flat = [];
  rows.forEach(r => r.forEach(b => flat.push(b)));
  const t = T(), per = STYLE.shineEvery, k = Math.floor(t / per), ph = (t - k * per) / .7, who = flat.length && !plain() ? k % flat.length : -1;
  let y = top;
  for (const r of rows) {
   const h = RH[r[0].kind] || 22, n = r.length, bw = Math.floor((w - gap * (n - 1)) / n);
   if (r.some(b => b.wf)) {
    let bx = mx;
    const free = w - gap * (n - 1);
    r.forEach((b, i) => {
     const ww = i === n - 1 ? mx + w - bx : Math.floor(free * (b.wf || 1 / n));
     if (b.promo) {
      let ok = false;
      try {
       ok = V40PROMO.draw(bx, y, ww, h, live, Math.floor(gap / 2), Math.floor(vg / 2));
      } catch (e) {}
      if (ok) LAST.push({
       key: 'PROMO',
       x: bx,
       y: y,
       w: ww,
       h: h
      });
     } else drawBtn(b, bx, y, ww, h, live, Math.floor(gap / 2), Math.floor(vg / 2), null);
     bx += ww + gap;
    });
   } else r.forEach((b, i) => {
    const bx = mx + i * (bw + gap), last = i === n - 1;
    drawBtn(b, bx, y, last ? w - i * (bw + gap) : bw, h, live, Math.floor(gap / 2), Math.floor(vg / 2), flat.indexOf(b) === who && ph <= 1 ? ph : null);
   });
   y += h + vg;
  }
  const m = window.M37 && M37.page === 'home' ? 'TAP PLAY TO PICK A MODE' : 'PICK A MODE TO SEE YOUR TEAM', hy = y - vg + 3;
  if (hy + 10 <= H - 12) {
   rect(Math.round(L / 2 - textW(m, 1) / 2 - 4), hy, textW(m, 1) + 8, 10, 'rgba(5,8,11,.7)');
   text(m, L / 2, hy + 2, 1, '#8fe3f0', 'center');
  }
  V.last = {
   rows: rows.map(r => r.map(b => b.key)),
   bottom: y - vg
  };
 };
 const D0 = V38H.drawLeft, R0 = V38H.rects;
 V38H.drawLeft = function(L, live) {
  if (off()) return D0.apply(this, arguments);
  try {
   return V.draw(L, live);
  } catch (e) {
   console.error(e);
   LAST = [];
   return D0.apply(this, arguments);
  }
 };
 V38H.rects = function() {
  return off() ? R0.apply(this, arguments) : V.rects();
 };
})();
