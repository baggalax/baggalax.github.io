(function() {
 'use strict';
 const off = () => !!(window.__rl_no37c || window.__rl_v124gb);
 const ready = () => !off() && !!window.V22 && V22.on() && !!window.C30 && C30.on() && !!window.V17 && typeof V17.ST === 'function' && typeof V22.st === 'function';
 const WHY = 'FIRST WIN BONUS', N = 4, RARW = [ 55, 35, 10 ], RARN = [ 'COMMON', 'RARE', 'LEGENDARY' ];
 const TITLE_WHY = new Set([ 'SEASON', 'ONLINE SEASON', 'WORLD GAMES', 'COLLEGE NATTY', 'NATTY', 'ULTIMATE CHAMPIONS' ]);
 const SAFE = [ 'menu', 'season', 'wgHub', 'wgChamp', 'col25' ];
 const LOG = {
  ev: [],
  err: []
 };
 const lg = (...a) => {
  LOG.ev.push(a);
  if (LOG.ev.length > 200) LOG.ev.shift();
 };
 const rnd = () => (typeof window.__rl_37rnd === 'function' ? window.__rl_37rnd : Math.random)();
 const isObj = o => !!o && typeof o === 'object' && !Array.isArray(o);
 function flag() {
  try {
   const f = V22.st().fw37;
   return isObj(f) ? f : null;
  } catch (e) {
   return null;
  }
 }
 function rollRar() {
  const x = rnd() * 100;
  return x < RARW[0] ? 0 : x < RARW[0] + RARW[1] ? 1 : 2;
 }
 const num = v => typeof v === 'number' && isFinite(v) ? v : +v || 0;
 function prior(G, back) {
  const ST = V17.ST() || {}, s = ST.stats || {};
  for (const k of [ 'wins', 'quickW', 'seasonW', 'worldW', 'onlineW' ]) if (num(s[k]) > 0) return 'v17.' + k;
  if (ST.ach && ST.ach.first_w) return 'ach.first_w';
  const mine = back && G && G.score && G.score[0] > G.score[1] ? 1 : 0;
  let rec = null;
  try {
   rec = typeof record !== 'undefined' ? record : LS.get('record', null);
  } catch (e) {
   rec = null;
  }
  if (rec && num(rec.w) - (mine && G.mode === 'quick' ? 1 : 0) > 0) return 'record';
  try {
   const S = typeof season !== 'undefined' ? season : null, row = S && S.table && S.team && S.table[S.team];
   if (row && num(row.w) - (mine && G.mode === 'season' ? 1 : 0) > 0) return 'season';
  } catch (e) {}
  try {
   const w = typeof wgame !== 'undefined' ? wgame : null, row = w && w.table && w.team && w.table[w.team];
   if (row && num(row.w) - (mine && G.mode === 'world' ? 1 : 0) > 0) return 'wg';
  } catch (e) {}
  if (num(LS.get('titles', 0)) > 0) return 'titles';
  if (num(LS.get('titles232', 0)) > 0) return 'titles232';
  const wt = num(LS.get('wgTitles', 0));
  let code = false;
  try {
   const v = LS.get('v20', null), r = v && v.redeemed;
   code = isObj(r) && Object.keys(r).some(k => k !== 'PLANES' && k !== 'JARVISKIT');
  } catch (e) {}
  if (wt > (code ? 1 : 0)) return 'wgTitles';
  const T = ST.trophies;
  if (isObj(T)) for (const k in T) {
   if (!/^trophy_/.test(k)) continue;
   if (k === 'trophy_globe' && code && isObj(T[k]) && T[k].team === 'WUSA') continue;
   return 'trophy.' + k;
  }
  try {
   const C = V22.st().cards || {};
   for (const id in C) if (C[id] && TITLE_WHY.has(String(C[id].w || ''))) return 'titlecard';
  } catch (e) {}
  try {
   const F = LS.get('v34flip', null);
   if (F && (Array.isArray(F.q) && F.q.length || Array.isArray(F.done) && F.done.length || Array.isArray(F.old) && F.old.length)) return 'flip34';
  } catch (e) {}
  return '';
 }
 const notMatch = G => !G || !!G.tutorial || G.mode === 'tutorial' || !!G.practice;
 function mint() {
  const ids = [], r = [];
  for (let i = 0; i < N; i++) {
   const rar = rollRar();
   let id = null;
   for (let k = 0; k < 8 && !id; k++) {
    id = C30.freshId(rar);
    if (id && ids.some(x => x.slice(0, 10) === id.slice(0, 10))) id = null;
   }
   if (!id || !C30.make(id)) return null;
   ids.push(id);
   r.push(rar);
  }
  return {
   ids: ids,
   r: r
  };
 }
 function give(G, why) {
  if (!ready() || flag()) return null;
  const m = mint();
  if (!m) {
   LOG.err.push('mint');
   return null;
  }
  const S = V22.st();
  S.fw37 = {
   v: 1,
   at: Date.now(),
   ids: m.ids.slice(),
   r: m.r.slice(),
   m: String(G && G.mode || ''),
   seen: 0
  };
  const got = V22.grantIds(m.ids, C30.TID, WHY);
  if (got.length !== m.ids.length) {
   S.fw37.ids = got.slice();
   S.fw37.r = got.map(id => m.r[m.ids.indexOf(id)]);
  }
  V22.save();
  lg('give', why || '', got.slice(), m.r.slice());
  return got;
 }
 const SNAP = new WeakMap;
 if (window.V17 && typeof V17.gameStart === 'function') {
  const gs0 = V17.gameStart;
  V17.gameStart = function(G) {
   try {
    if (G && typeof G === 'object' && !off() && ready() && !flag() && !notMatch(G)) SNAP.set(G, prior(G, false) || 'none');
   } catch (e) {
    console.error(e);
   }
   return gs0.apply(this, arguments);
  };
 }
 if (window.V17 && typeof V17.gameOver === 'function') {
  const go0 = V17.gameOver;
  V17.gameOver = function(G, win) {
   let go = false, why = '';
   try {
    if (!off() && win && G && !G.g17over && !notMatch(G) && G.score && G.score[0] > G.score[1] && ready() && !flag()) {
     const sn = SNAP.get(G);
     why = sn ? sn === 'none' ? '' : sn : prior(G, true);
     go = !why;
     lg('end', G.mode, sn || 'late', why || 'eligible');
    }
   } catch (e) {
    console.error(e);
    go = false;
   }
   const r = go0.apply(this, arguments);
   if (go) {
    try {
     give(G, 'win');
    } catch (e) {
     console.error(e);
     LOG.err.push(String(e));
    }
   }
   return r;
  };
 }
 const CSS = '#fw37{position:absolute;inset:0;z-index:55;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(6,10,16,.94);color:#e8f4f6;font:bold 11px/1.25 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.3px;text-transform:uppercase;touch-action:manipulation;padding:6px 8px;box-sizing:border-box;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' + '#fw37 .h37{font-size:17px;line-height:1.1;color:#ffe14d;text-shadow:2px 2px 0 #000;text-align:center}' + '#fw37 .s37{font-size:10px;color:#8fe3f0;text-align:center;min-height:13px;max-width:96%}' + '#fw37 .st37{position:relative;height:124px;width:100%;display:flex;align-items:center;justify-content:center;gap:10px}' + '#fw37 .pk37{position:relative;width:88px;height:120px;box-sizing:border-box;cursor:pointer;animation:wig37 .9s ease-in-out infinite;border:2px solid #000;border-radius:2px;background:linear-gradient(90deg,#7d848b,#b9c0c6 30%,#9aa3ab 55%,#7d848b);box-shadow:0 3px 0 #000;display:flex;flex-direction:column;align-items:center;justify-content:center}' + '#fw37 .pk37::before,#fw37 .pk37::after{content:"";position:absolute;left:0;right:0;height:6px;background:repeating-linear-gradient(90deg,#5c6268 0 3px,transparent 3px 6px)}#fw37 .pk37::before{top:0}#fw37 .pk37::after{bottom:0}' + '#fw37 .pk37 .lb37{width:70px;padding:5px 0;background:#0b1a20;border:2px solid #05080b;box-shadow:inset 0 1px 0 #d6dbe0;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1}' + '#fw37 .pk37 .lb37 b{font-size:11px;color:#2cc4dc;letter-spacing:.5px}#fw37 .pk37 .lb37 i{font-style:normal;font-size:11px;color:#fff}#fw37 .pk37 .lb37 u{text-decoration:none;font-size:8px;color:#ffe14d;margin-top:3px}#fw37 .pk37 .lb37 s{text-decoration:none;font-size:7px;color:#cfd6db}' + '#fw37 .pk37.op{animation:pop37 .42s ease-in forwards;pointer-events:none}' + '@keyframes wig37{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}' + '@keyframes pop37{0%{transform:scale(1);opacity:1}60%{transform:scale(1.25);opacity:1}100%{transform:scale(1.7);opacity:0}}' + '#fw37 .fl37{width:86px;height:118px;perspective:700px;cursor:pointer;flex:0 0 auto;animation:deal37 .35s ease-out both}' + '@keyframes deal37{0%{transform:translateY(26px) scale(.6);opacity:0}100%{transform:none;opacity:1}}' + '#fw37 .fl37 .in{position:relative;width:100%;height:100%;transition:transform .55s cubic-bezier(.3,1.4,.5,1);transform-style:preserve-3d;-webkit-transform-style:preserve-3d}' + '#fw37 .fl37.on .in{transform:rotateY(180deg)}' + '#fw37 .fl37 .bk,#fw37 .fl37 .fr{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center}' + '#fw37 .fl37 .fr{transform:rotateY(180deg)}' + '#fw37 .fl37 .bk img{width:84px;height:116px;image-rendering:pixelated;image-rendering:crisp-edges;border-radius:5px;box-shadow:0 2px 0 #000}' + '#fw37 .fl37.on.fr1{filter:drop-shadow(0 0 7px #3d8bff)}' + '#fw37 .fl37 .c17{cursor:default;height:116px}#fw37 .fl37 .c17 .rr{text-align:center;letter-spacing:0;white-space:nowrap}' + '#fw37 .rl37{font-size:9px;letter-spacing:1px;text-align:center;margin-top:5px;min-height:11px}' + '#fw37 .cw37{display:flex;flex-direction:column;align-items:center}' + '#fw37 button{font:inherit;font-size:13px;text-transform:uppercase;border:0;border-radius:3px;padding:8px 26px;min-height:34px;min-width:150px;background:#ffd23a;color:#0b1a20;box-shadow:0 2px 0 #000;touch-action:manipulation;-webkit-appearance:none;appearance:none;cursor:pointer}' + '#fw37 button.g{background:#7dff7a}#fw37 button:active{filter:brightness(.8)}' + '#fw37 .c17{position:relative;display:inline-flex;flex-direction:column;align-items:center;width:72px;min-height:96px;padding:4px 3px 3px;box-sizing:border-box;border-radius:5px;background:linear-gradient(#202a33,#141b22);border:3px solid #8a939b;box-shadow:0 2px 0 #000;overflow:hidden;vertical-align:top;cursor:pointer}#fw37 .c17 .art{width:56px;height:56px;background:radial-gradient(circle,#2a3a46,#121a21 70%);border:1px solid #05080b;display:flex;align-items:center;justify-content:center}#fw37 .c17 .art img{width:52px;height:52px;image-rendering:pixelated;image-rendering:crisp-edges}#fw37 .c17 .nm{font-size:8px;line-height:1.1;color:#fff;text-align:center;margin-top:3px;min-height:18px;display:flex;align-items:center;word-break:break-word}#fw37 .c17 .rr{font-size:7px;letter-spacing:1px;color:#9aa3ab}#fw37 .c17 .ct{position:absolute;top:2px;right:3px;font-style:normal;font-size:9px;color:#fff;background:#000a;padding:0 2px;border-radius:2px}#fw37 .c17.r0{border-color:#9aa3ab}#fw37 .c17.r1{border-color:#3d8bff;background:linear-gradient(#1a2c4a,#0f1a2c)}#fw37 .c17.r1 .rr{color:#7fb4ff}#fw37 .c17.r1::after{content:\'\';position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.45) 48%,rgba(140,220,255,.35) 52%,transparent 60%);animation:foil17 2.6s linear infinite;pointer-events:none}#fw37 .c17.r2{border-color:#ffcc33;background:linear-gradient(#4a3a0e,#221a05);animation:glow17 1.4s ease-in-out infinite}#fw37 .c17.r2 .rr{color:#ffe14d}#fw37 .c17.r2::after{content:\'\';position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,rgba(255,230,120,.35),transparent 30%,rgba(255,255,255,.25),transparent 60%);animation:spin17 3s linear infinite;pointer-events:none}#fw37 .c17.lk{border-color:#3a434b;background:#0d1217;animation:none}#fw37 .c17.lk::after{display:none}#fw37 .c17.lk .nm{color:#7f8a93}#fw37 .c17.lk .rr{color:#56606a}#fw37 .c17.sel{outline:2px solid #fff;outline-offset:1px}#fw37 .c17 .new17{position:absolute;top:2px;left:3px;font-style:normal;font-size:9px;color:#0b1a20;background:#7dff7a;padding:0 3px;border-radius:2px;z-index:2}#fw37 .fl37 .c17{width:84px;min-height:116px}#fw37 .fl37 .c17 .art{width:64px;height:64px}#fw37 .fl37 .c17 .art img{width:60px;height:60px}#fw37 .fl37.on.fr2{filter:drop-shadow(0 0 10px #ffd84d)}#fw37 .c17{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}#fw37 .c17 .art{position:relative}#fw37 .c17 .ct{position:absolute;top:auto;right:auto;left:1px;bottom:1px;font-style:normal;font-size:9px;line-height:1;color:#fff;background:rgba(0,0,0,.78);padding:1px 2px;border-radius:2px;z-index:2}#fw37 .c17 .dup17{position:absolute;left:2px;right:2px;bottom:16px;font-style:normal;font-size:7px;color:#fff;background:#a03030;padding:1px 0;border-radius:2px;z-index:3;text-align:center}#fw37 .c17 .role17{font-size:6.5px;line-height:1.15;color:#ffb37a;text-align:center;margin-top:1px}#fw37 .c17 .bst17{font-size:6px;line-height:1.15;color:#7dff7a;text-align:center}#fw37 .c17.lk .role17{color:#8a6a55}#fw37 .c17.lk .bst17{color:#4f7a4f}#fw37 .fl37 .c17.crew .art{width:50px;height:50px}#fw37 .fl37 .c17.crew .art img{width:46px;height:46px}#fw37 .fl37 .c17.crew .nm{min-height:12px}#fw37 .c17 .dup17{top:34px;bottom:auto}';
 let el = null, styled = false, timers = [], flipped = [], cur = null;
 const RCOL = [ '#9aa3ab', '#3d8bff', '#ffcc33' ];
 function sfx(n) {
  try {
   if (typeof SFX !== 'undefined' && SFX[n]) SFX[n]();
  } catch (e) {}
 }
 let backUrl = null;
 function back() {
  if (backUrl) return backUrl;
  const c = document.createElement('canvas');
  c.width = 40;
  c.height = 56;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  const R = (a, b, w, h, col) => {
   x.fillStyle = col;
   x.fillRect(a, b, w, h);
  };
  R(0, 0, 40, 56, '#05080b');
  R(1, 1, 38, 54, '#10324a');
  x.fillStyle = '#163f5c';
  for (let i = -56; i < 40; i += 6) for (let k = 0; k < 54; k++) {
   const px = i + k;
   if (px >= 1 && px < 39) x.fillRect(px, 1 + k, 1, 1);
  }
  R(1, 1, 38, 1, '#2cc4dc');
  R(1, 54, 38, 1, '#2cc4dc');
  R(1, 1, 1, 54, '#2cc4dc');
  R(38, 1, 1, 54, '#2cc4dc');
  R(3, 17, 34, 22, '#05080b');
  R(4, 18, 32, 20, '#0b1a20');
  const Q = [ '.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..' ];
  Q.forEach((row, j) => row.split('').forEach((ch, i) => {
   if (ch === '#') {
    R(15 + i * 2, 21 + j * 2, 2, 2, '#000');
    R(14 + i * 2, 20 + j * 2, 2, 2, '#ffe14d');
   }
  }));
  return backUrl = c.toDataURL();
 }
 const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 function later(fn, ms) {
  const t = setTimeout(() => {
   timers = timers.filter(x => x !== t);
   try {
    fn();
   } catch (e) {
    console.error(e);
   }
  }, ms);
  timers.push(t);
 }
 function shown() {
  return !!el && el.isConnected;
 }
 function visible(id) {
  const d = document.getElementById(id);
  if (!d) return false;
  try {
   const cs = getComputedStyle(d);
   return cs.display !== 'none' && cs.visibility !== 'hidden';
  } catch (e) {
   return false;
  }
 }
 const CARD = new WeakMap;
 function safe() {
  let scr;
  try {
   scr = screen;
  } catch (e) {
   return false;
  }
  if (typeof scr !== 'string') return false;
  const I = window.__rl30intro;
  if (I && I.shown && !I.done) return false;
  if (visible('acct23')) return false;
  let G = null;
  try {
   G = game;
  } catch (e) {
   G = null;
  }
  try {
   if (paused) return false;
  } catch (e) {}
  if (scr === 'final') {
   if (!G || !G.over || G.celeb && !G.celeb.done || num(G.finalT) < .8) return false;
   const t = performance.now();
   if (!CARD.has(G)) CARD.set(G, t);
   return t - CARD.get(G) >= 1200;
  }
  if (G && !G.over) return false;
  if (!SAFE.includes(scr)) return false;
  if (visible('panel')) return false;
  try {
   if (V17.modal && V17.modal()) return false;
  } catch (e) {}
  return true;
 }
 function pending() {
  const f = flag();
  return !!f && !f.seen && Array.isArray(f.ids) && f.ids.length > 0;
 }
 function liveIds(f) {
  const C = V22.st().cards || {};
  return f.ids.filter(id => C[id] && C30.parse(id));
 }
 function open(force) {
  if (shown() || !ready()) return false;
  const f = flag();
  if (!f || !force && f.seen) return false;
  const ids = liveIds(f);
  if (!ids.length) {
   f.seen = Date.now();
   V22.save();
   return false;
  }
  const ui = document.getElementById('ui') || document.body;
  if (!styled) {
   const st = document.createElement('style');
   st.id = 'fw37css';
   st.textContent = CSS;
   document.head.appendChild(st);
   styled = true;
  }
  cur = {
   ids: ids,
   f: f
  };
  flipped = ids.map(() => false);
  el = document.createElement('div');
  el.id = 'fw37';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'FIRST WIN BONUS: 4 CUSTOM CARDS');
  el.innerHTML = '<div class="h37">FIRST WIN BONUS: ' + ids.length + ' CUSTOM CARDS</div><div class="s37">YOUR FIRST WIN! TAP THE PACK TO OPEN IT</div>' + '<div class="st37"><div class="pk37" aria-label="OPEN THE PACK" role="button"><div class="lb37"><b>BAGGA</b><i>LAX</i><u>FIRST WIN</u><s>' + ids.length + ' CUSTOM CARDS</s></div></div></div><div class="row37"><button type="button" class="y" data-fw="open" aria-label="OPEN PACK">OPEN PACK</button></div>';
  for (const t of [ 'pointerdown', 'pointerup', 'pointermove', 'touchstart', 'touchend', 'touchmove', 'mousedown', 'mouseup' ]) el.addEventListener(t, e => {
   e.stopPropagation();
  }, {
   passive: true
  });
  el.addEventListener('click', e => {
   e.stopPropagation();
   onClick(e);
  });
  ui.appendChild(el);
  sfx('cheer');
  lg('open', ids.slice());
  later(() => {
   if (cur && !cur.opened) tear();
  }, 2500);
  return true;
 }
 function onClick(e) {
  const t = e.target && e.target.closest ? e.target : null;
  if (!t || !cur) return;
  if (t.closest('.pk37') || t.closest('[data-fw="open"]')) return tear();
  const fl = t.closest('.fl37');
  if (fl) return flip(+fl.getAttribute('data-i'));
  const b = t.closest('[data-fw]');
  if (!b) return;
  const a = b.getAttribute('data-fw');
  if (a === 'all') return flipAll();
  if (a === 'done') return done();
 }
 function cardFace(id) {
  try {
   return V22.cardHtml22(id);
  } catch (e) {
   console.error(e);
   return '<div class="c17"><div class="nm">CUSTOM</div></div>';
  }
 }
 function rarOf(id) {
  const d = C30.parse(id);
  return d ? d.rar : 0;
 }
 function tear() {
  if (!cur || cur.opened || !shown()) return;
  cur.opened = true;
  sfx('tap');
  const pk = el.querySelector('.pk37');
  if (pk) pk.classList.add('op');
  const btn = el.querySelector('.row37');
  if (btn) btn.innerHTML = '';
  later(() => {
   if (!shown()) return;
   const stg = el.querySelector('.st37'), ids = cur.ids;
   stg.innerHTML = ids.map((id, i) => {
    const r = rarOf(id);
    return '<div class="cw37"><div class="fl37 fr' + r + '" data-i="' + i + '" style="animation-delay:' + (i * .08).toFixed(2) + 's" aria-label="CARD ' + (i + 1) + ' (FACE DOWN)" role="button"><div class="in"><div class="bk"><img alt="" src="' + back() + '"></div><div class="fr">' + cardFace(id) + '</div></div></div><div class="rl37" data-rl="' + i + '"></div></div>';
   }).join('');
   el.querySelector('.s37').textContent = 'TAP A CARD TO FLIP IT';
   el.querySelector('.row37').innerHTML = '<button type="button" data-fw="all" aria-label="FLIP ALL">FLIP ALL</button>';
   if (cur.all) ids.forEach((id, i) => flip(i)); else ids.forEach((id, i) => later(() => flip(i), 650 + i * 520));
  }, 380);
 }
 function flip(i) {
  if (!cur || !shown() || !(i >= 0 && i < flipped.length) || flipped[i]) return;
  flipped[i] = true;
  const id = cur.ids[i], r = rarOf(id), p = typeof PP === 'function' && PP(id) || null;
  const fl = el.querySelector('.fl37[data-i="' + i + '"]');
  if (fl) {
   fl.classList.add('on');
   fl.setAttribute('aria-label', 'CARD ' + (i + 1) + ': ' + RARN[r] + (p ? ' ' + p.pos + ' ' + p.ovr : ''));
  }
  const rl = el.querySelector('[data-rl="' + i + '"]');
  if (rl) {
   rl.textContent = RARN[r];
   rl.style.color = RCOL[r];
  }
  sfx(r === 2 ? 'cheer' : 'tap');
  lg('flip', i, id);
  if (flipped.every(Boolean)) {
   el.querySelector('.s37').textContent = 'LOCKER ROOM > CARDS: TAP ONE TO CREATE HIM - NAME, SKIN, BRAID';
   el.querySelector('.row37').innerHTML = '<button type="button" class="g" data-fw="done" aria-label="DONE">DONE</button>';
  }
 }
 function flipAll() {
  if (!cur) return;
  cur.all = true;
  if (!cur.opened) {
   tear();
   return;
  }
  if (el && el.querySelector('.fl37')) cur.ids.forEach((_, i) => flip(i));
 }
 function done() {
  if (!cur) return;
  try {
   const f = flag();
   if (f) {
    f.seen = Date.now();
    V22.save();
   }
  } catch (e) {
   console.error(e);
  }
  close();
  sfx('tap');
  lg('done');
 }
 function close() {
  for (const t of timers) clearTimeout(t);
  timers = [];
  if (el && el.parentNode) el.parentNode.removeChild(el);
  el = null;
  cur = null;
 }
 function tick() {
  try {
   if (off()) {
    if (shown()) close();
    return;
   }
   if (shown() || !ready() || !pending()) return;
   if (safe()) open(false);
  } catch (e) {
   LOG.err.push(String(e));
  }
 }
 setInterval(tick, 300);
 window.V37C = {
  off: off,
  ready: ready,
  prior: prior,
  flag: flag,
  pending: pending,
  give: give,
  mint: mint,
  rollRar: rollRar,
  open: open,
  close: close,
  tear: tear,
  flip: flip,
  flipAll: flipAll,
  done: done,
  safe: safe,
  tick: tick,
  shown: () => shown(),
  SAFE: SAFE,
  RARW: RARW,
  N: N,
  WHY: WHY,
  LOG: LOG
 };
})();
