'use strict';
var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());


const SHOW25 = (() => {
 const on = () => !window.__rl_no25 && !window.__rl_v124gb;
 const isColT = tid => !!tid && typeof WT_REG !== 'undefined' && !!WT_REG[tid] && !!WT_REG[tid].col25;
 const colG = G => !!G && G.mode === 'college';
 const S = {
  last: {
   frame: 0,
   mascots: [],
   rush: null,
   gutter: false
  },
  rush: null
 };
 const hex = c => {
  c = String(c || '#888888').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16) || 0;
  return [ n >> 16 & 255, n >> 8 & 255, n & 255 ];
 };
 const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
 const lum = c => {
  const [r, g2, b] = hex(c);
  return (.2126 * r + .7152 * g2 + .0722 * b) / 255;
 };
 const mix = (a, b, k) => {
  const A = hex(a), B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * k));
 };
 const dist = (a, b) => {
  const A = hex(a), B = hex(b);
  return Math.abs(A[0] - B[0]) + Math.abs(A[1] - B[1]) + Math.abs(A[2] - B[2]);
 };
 const FE = '..oskskso..', FS = '..ossssso..', FM = '..ossrsso..', FC = '...ooooo...';
 const HEADS = {
  bird: [ '....oSo....', '..ooFFFoo..', '.oFFFFFFFo.', '.okkFFFkko.', '.owkFFFkwo.', 'oFFFyyyFFFo', '.oFFFyFFFo.', '..ooooooo..' ],
  dog: [ '.oo.....oo.', 'offoooooffo', 'offFFFFFffo', 'offwkFkwffo', '.ofFFFFFfo.', '..oFmnmFo..', '..oFmrmFo..', '...ooooo...' ],
  wolf: [ '.o.......o.', 'ofo.....ofo', 'offoooooffo', 'oFFFFFFFFFo', 'oFwkFFFkwFo', '.oFFmmmFFo.', '..oFmnmFo..', '..oFmrmFo..', '...ooooo...' ],
  cat: [ 'oo.......oo', 'oFo.....oFo', 'oFFoooooFFo', 'oFFFFFFFFFo', 'oFwkFFFkwFo', 'wFFFFnFFFFw', '.oFFmmmFFo.', '..ooooooo..' ],
  tiger: [ 'oo.......oo', 'oFo.....oFo', 'oFFoooooFFo', 'oFkFFkFFkFo', 'oFwkFFFkwFo', 'wkFFFnFFFkw', '.oFFmmmFFo.', '..ooooooo..' ],
  leopard: [ 'oo.......oo', 'oFo.....oFo', 'oFFoooooFFo', 'oFFkFFFkFFo', 'oFwkFFFkwFo', 'wFFFFnFFFFw', '.okFmmmFko.', '..ooooooo..' ],
  lion: [ '..SSSSSSS..', '.SSoooooSS.', 'SSoFFFFFoSS', 'SoFwkFkwFoS', 'SoFFFnFFFoS', 'SSoFrrrFoSS', '.SSoooooSS.', '..SSSSSSS..' ],
  bear: [ '.oo.....oo.', 'ofFoooooFfo', 'oFFFFFFFFFo', '.oFwkFkwFo.', '.oFFmmmFFo.', '.oFmmnmmFo.', '..oFmmmFo..', '...ooooo...' ],
  stag: [ 'h.h.....h.h', '.hh.....hh.', '..hoooooh..', '..oFFFFFo..', '..oFkFkFo..', '..oFFFFFo..', '..oFmmmFo..', '...omnmo...', '....ooo....' ],
  devil: [ 'h.........h', 'ho.......oh', '.hoooooooh.', '.oFFFFFFFo.', '.okkFFFkko.', '.owkFFFkwo.', '.oFwwwwwFo.', '..oFFkFFo..', '...ooooo...' ],
  ram: [ '...ooooo...', '.hhoFFFohh.', 'hoohFFFhooh', 'h.hoFFFoh.h', 'hhoFkFkFohh', '..oFFFFFo..', '..oFmmmFo..', '..omnmnmo..', '...ooooo...' ],
  bison: [ '...ooooo...', 'h.offfffo.h', 'hhoFFFFFohh', '.hoFkFkFoh.', '..oFFFFFo..', '..ofmmmfo..', '..omnmnmo..', '...ooooo...' ],
  fox: [ 'o.........o', 'oFo.....oFo', 'oFFoooooFFo', 'oFFFFFFFFFo', 'oFwkFFFkwFo', '.owwFFFwwo.', '..owwnwwo..', '...ooooo...' ],
  dolphin: [ '....oFo....', '...oFFFo...', '..oFFFFFo..', '.okFFFFFko.', '.oFFFFFFFo.', '..owwwwwo..', '..owrrrwo..', '...ooooo...' ],
  shark: [ '.....oo....', '....oFFo...', '..ooFFFFoo.', '.oFFFFFFFo.', '.okwFFFwko.', '.oFFFFFFFo.', '.owkwkwkwo.', '..owwwwwo..', '...ooooo...' ],
  turtle: [ '...ooooo...', '..oFFFFFo..', '.oFwkFkwFo.', '.oFFFFFFFo.', '.oFFrrrFFo.', '..oFFFFFo..', '...ooooo...' ],
  spider: [ '...ooooo...', '..oFFFFFo..', '.oFwFFFwFo.', '.owkwFwkwo.', '.oFFFFFFFo.', '..oFhFhFo..', '...ooooo...' ],
  dragon: [ '.h.......h.', '..hoooooh..', '.oFFFFFFFo.', '.okyFFFyko.', '.oFFFFFFFo.', 'oFFwFFFwFFo', 'oFFFnFnFFFo', '.ooooooooo.' ],
  griffin: [ '...yoSoy...', '..ooFFFoo..', '.oFFFFFFFo.', '.okkFFFkko.', '.owkFFFkwo.', 'oFFFyyyFFFo', '.oFFFyFFFo.', '..ooooooo..' ],
  nut: [ '...ooooo...', '..obmmmbo..', '.obbmmbwbo.', '.obbbbbbbo.', '.obwkbkwbo.', '.obbbbbbbo.', '..obbrbbo..', '...ooooo...' ],
  blob: [ '....oSo....', '...ooooo...', '..oFFFFFo..', '.oFwwFwwFo.', '.oFwkFkwFo.', '.oFFFFFFFo.', '.oFrrrrrFo.', '..ooooooo..' ],
  knight: [ '....SSS....', '...oSSSo...', '..ogggggo..', '.oggPPPggo.', '.okkkkkkko.', '.ogggggggo.', '.ogkgkgkgo.', '..ogggggo..', '...ooooo...' ],
  colonial: [ '...ooooo...', '..oPPPPPo..', 'ooPPPPPPPoo', 'oPSSSSSSSPo', '.wosssssow.', '.w' + 'oskskso' + 'w.', '.wossrssow.', FC ],
  cavalier: [ '.......SS..', '...oooooSS.', '..oPPPPPoS.', 'ooPPPPPPPoo', '.oosssssoo.', FE, FM, FC ],
  tophat: [ '...ooooo...', '...oPPPo...', '...oPPPo...', '...oSSSo...', '..oPPPPPo..', FE, FS, FM, FC ],
  pioneer: [ '....ooo....', '...oPPPo...', '...oSSSo...', 'ooPPPPPPPoo', FE, FS, FM, FC ],
  soldier: [ '...ooooo...', '...oPPPo...', '...oSyPo...', '...oPPPo...', '..okkkkko..', FE, FM, FC ],
  sailor: [ '...wwwww...', '..owwwwwo..', '..oPPPPPo..', FE, FS, FM, FC ],
  pirate: [ '...ooooo...', '..oPwPwPo..', '.oPPPPPPPoS', '..okkskso.S', FS, FM, FC ],
  viking: [ 'h.........h', 'ho.ooooo.oh', '.hogggggoh.', '..ogggggo..', FE, '.SosssssoS.', '.SoSSSSSoS.', '..oSSSSSo..', FC ],
  friar: [ '...ooooo...', '..oPPPPPo..', '.oPPsssPPo.', '.oPsksksPo.', '.oPsssssPo.', '.oPssrssPo.', '.oPPsssPPo.', '..ooooooo..' ],
  king: [ '..y.y.y.y..', '..yyyyyyy..', '..oyySyyo..', FE, FS, FM, FC ],
  leprechaun: [ '...ooooo...', '...oPPPo...', '...oPPPo...', '...oPyPo...', '.ooPPPPPoo.', FE, '..orsssro..', '..orrrrro..', FC ],
  pilgrim: [ '...ooooo...', '...oPPPo...', '...oPPPo...', '..oSSSSSo..', 'oPPPPPPPPPo', FE, FS, FM, FC ]
 };
 const HUMAN = new Set([ 'knight', 'colonial', 'cavalier', 'tophat', 'pioneer', 'soldier', 'sailor', 'pirate', 'viking', 'friar', 'king', 'leprechaun', 'pilgrim' ]);
 const BODY = [ [ '..oPPPPPo..', '.oPPTTTPPo.', '.oFPPPPPFo.', '.oFPPPPPFo.', '..oTTTTTo..', '..oFo.oFo..', '..ooo.ooo..' ], [ 'oFoPPPPPoFo', 'oFPPTTTPPFo', '.ooPPPPPoo.', '..oPPPPPo..', '..oTTTTTo..', '..oFo.oFo..', '..ooo.ooo..' ] ];
 const OTTO = [ '...ooooo...', '..oSSSSSo..', '.ooooooooo.', 'oFFFFFFFFFo', 'oFwkFFFkwFo', 'oFwkFFFkwFo', 'oFFFFFFFFFo', 'oFFrFFFrFFo', 'oFFFrrrFFFo', '.oFFFFFFFo.', '..ooooooo..', '...oS.So...', '..ooo.ooo..' ];
 const KIND = [ [ /^orange$/, 'otto' ], [ /buckeye/, 'nut' ], [ /terrapin|turtle/, 'turtle' ], [ /spider/, 'spider' ], [ /dragon/, 'dragon' ], [ /griffin|gryphon/, 'griffin' ], [ /fox/, 'fox' ], [ /devil|demon/, 'devil' ], [ /pirate|buccaneer/, 'pirate' ], [ /viking/, 'viking' ], [ /dolphin/, 'dolphin' ], [ /shark/, 'shark' ], [ /bison|buffalo/, 'bison' ], [ /tar heel|ram$|rams/, 'ram' ], [ new RegExp(__x("c3RhZ3xkZWVyfGVsa3xiaWcgZ3JlZW4="),""), 'stag' ], [ /wolverine/, 'bear' ], [ new RegExp(__x("c2Vhd29sZnxzZWF3b2x2ZXN8d29sZnx3b2x2ZXN8Ym9ubmll"),""), 'wolf' ], [ /great dane|terrier|bulldog|greyhound|retriever|hound|husk|dog|hoya/, 'dog' ], [ /tiger/, 'tiger' ], [ /leopard|jaguar|cheetah/, 'leopard' ], [ /lion|pride/, 'lion' ], [ /bearcat|wildcat|catamount|bobcat|panther|cougar|cat/, 'cat' ], [ new RegExp(__x("YmVhcnxiaWcgcmVk"),""), 'bear' ], [ /knight|gael|titan|warrior|raider|crusader|trojan|spartan/, 'knight' ], [ new RegExp(__x("bWludXRlbXxjb2xvbmlhbHxwYXRyaW90"),""), 'colonial' ], [ /cavalier/, 'cavalier' ], [ /statesm/, 'tophat' ], [ /pioneer|mountaineer|frontier/, 'pioneer' ], [ /keydet|cadet|highlander|soldier/, 'soldier' ], [ /midship|laker|sailor|mariner/, 'sailor' ], [ /friar|saint|jasper|monk/, 'friar' ], [ /royal|king/, 'king' ], [ /irish|lepre/, 'leprechaun' ], [ new RegExp(__x("cXVha2VyfGNyaW1zb258cGlsZ3JpbQ=="),""), 'pilgrim' ], [ new RegExp(__x("aGF3a3xlYWdsZXxmYWxjb258amF5fGhlbnM/XGJ8b3dsfGJpcmR8c3Rvcm18XGJ1dGVzP1xifGNyb3d8cmF2ZW4="),""), 'bird' ] ];
 const kindOfNick = nick => {
  const s = String(nick || '').toLowerCase().trim();
  for (const [re, k] of KIND) if (re.test(s)) return k;
  return 'blob';
 };
 const kindOf = tid => {
  const t = typeof WT_REG !== 'undefined' && WT_REG[tid];
  return t ? kindOfNick(t.nick) : 'blob';
 };
 const palCache = new Map;
 function palOf(tid) {
  if (palCache.has(tid)) return palCache.get(tid);
  const t = typeof WT_REG !== 'undefined' && WT_REG[tid] || {}, k = kindOf(tid);
  let c1 = t.c1 || '#c0392b', c2 = t.c2 || '#ffffff';
  let fur = lum(c1) >= .15 ? c1 : lum(c2) >= .15 ? c2 : lum(c1) >= .07 ? c1 : '#6a6a6a';
  let jer = fur === c1 ? c2 : c1;
  if (dist(fur, jer) < 90) jer = lum(fur) > .5 ? '#1b1b1b' : '#ffffff';
  const human = HUMAN.has(k);
  const P = {
   o: '#0d0d0d',
   F: human ? '#f0c090' : fur,
   f: mix(fur, '#000000', .3),
   S: k === 'otto' ? lum(c2) < .5 ? c2 : '#0b2a6b' : dist(c2, fur) < 60 ? lum(fur) > .5 ? '#1b1b1b' : '#ffffff' : c2,
   P: human ? c1 : jer,
   T: human ? dist(c1, c2) < 60 ? '#ffffff' : c2 : fur,
   w: '#ffffff',
   k: '#111111',
   y: '#ffb020',
   r: '#c8283a',
   m: '#ecd3a8',
   n: '#2a1a12',
   h: '#efe3c2',
   s: '#f0c090',
   g: '#aab4bc',
   b: '#7a4520'
  };
  if (human && lum(P.P) < .05) P.P = '#2a2a2a';
  if (k === 'otto') {
   P.F = '#f76900';
   P.P = P.S;
  }
  palCache.set(tid, P);
  return P;
 }
 function grid(ctx, rows, x0, y0, pal, mirror) {
  for (let j = 0; j < rows.length; j++) {
   const row = rows[j];
   let i = 0;
   while (i < row.length) {
    const ch = row[i];
    if (ch === '.' || ch === ' ' || !pal[ch]) {
     i++;
     continue;
    }
    let n = 1;
    while (i + n < row.length && row[i + n] === ch) n++;
    ctx.fillStyle = pal[ch];
    ctx.fillRect(mirror ? x0 + row.length - i - n : x0 + i, y0 + j, n, 1);
    i += n;
   }
  }
 }
 function drawMascot(ctx, tid, x, y, cheer) {
  const k = kindOf(tid), pal = palOf(tid), X = Math.round(x) - 5, Y = Math.round(y);
  if (k === 'otto') {
   const top = Y - OTTO.length;
   grid(ctx, OTTO, X, top, pal);
   const a = cheer ? [ [ -1, 2 ], [ -2, 1 ], [ -2, 0 ], [ 11, 2 ], [ 12, 1 ], [ 12, 0 ] ] : [ [ -1, 7 ], [ -2, 8 ], [ 11, 7 ], [ 12, 8 ] ];
   ctx.fillStyle = pal.S;
   for (const [i, j] of a) ctx.fillRect(X + i, top + j + 2, 1, 1);
   return {
    x: X - 2,
    y: top,
    w: 15,
    h: OTTO.length
   };
  }
  const head = HEADS[k] || HEADS.blob, body = BODY[cheer ? 1 : 0], by = Y - body.length, hy = by - head.length + 1;
  grid(ctx, body, X, by, pal);
  if (k === 'spider') {
   ctx.fillStyle = pal.o;
   for (const j of [ 1, 2, 3 ]) {
    ctx.fillRect(X - 1 - (j & 1), by + j, 2, 1);
    ctx.fillRect(X + 10 + (j & 1), by + j, 2, 1);
   }
  }
  if (k === 'dragon' || k === 'griffin') {
   const wp = Object.assign({}, pal, {
    W: k === 'dragon' ? pal.S : pal.y
   }), WING = [ 'o...', 'Wo..', 'WWo.', 'WWWo', '.WWo', '..Wo' ];
   grid(ctx, WING, X - 3, by - 4, wp);
   grid(ctx, WING, X + 10, by - 4, wp, true);
  }
  grid(ctx, head, X, hy, pal);
  if (cheer) {
   ctx.fillStyle = pal.o;
   ctx.fillRect(X - 1, by - 2, 3, 2);
   ctx.fillRect(X + 9, by - 2, 3, 2);
   ctx.fillStyle = pal.F;
   ctx.fillRect(X, by - 2, 1, 1);
   ctx.fillRect(X + 10, by - 2, 1, 1);
  }
  return {
   x: X - 3,
   y: hy,
   w: 17,
   h: Y - hy
  };
 }
 {
  const w0 = window.walkOn2314;
  if (typeof w0 === 'function') window.walkOn2314 = function(G) {
   if (w0.apply(this, arguments)) return true;
   return on() && colG(G) && !no2314() && !G.tutorial && !G.online && !G.walkDone && typeof RL12 !== 'undefined' && !!RL12.FR && !!RL12.FR.f14_NG0;
  };
 }
 {
  const NG = window.newGame;
  window.newGame = function(user, opp, mode, userHome, meta) {
   S.rush = null;
   const r = NG.apply(this, arguments);
   try {
    if (on() && game && meta && meta.final25 && !game.tutorial && !window.__rl_no232s) game.final232 = true;
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 function spots(G) {
  const out = [];
  for (const side of [ 'u', 'o' ]) {
   const tid = side === 'u' ? G.user : G.opp;
   if (!isColT(tid)) continue;
   const bx = benchX(side), crew = side === 'u' ? G.crewSide18 || 0 : 0;
   out.push({
    side: side,
    tid: tid,
    x: side === 'u' ? bx - 10 - crew * 11 : bx + 92,
    y: H - 1
   });
  }
  return out;
 }
 const showOn = G => on() && !!G && !G.tutorial && (colG(G) || G.meta && (G.meta.col25 || G.meta.ult25));
 {
  const DB = window.drawBench;
  window.drawBench = function() {
   const r = DB.apply(this, arguments);
   const G = game;
   if (!showOn(G) || huddleOn()) {
    S.last.mascots = [];
    return r;
   }
   try {
    const list = [];
    for (const m of spots(G)) {
     if (S.rush && S.rush.tid === m.tid && screen === 'final' && !(!window.__rl_v124gb && !window.__rl_no332mascot)) continue;
     const ph = seedOf('m25' + m.tid) % 7 * .31, goal = G.benchCheer && G.benchCheer[m.side] != null && menuT - G.benchCheer[m.side] < 2.2;
     const beat = Math.floor(menuT * (goal ? 6 : 2.2) + ph), hop = goal ? beat % 2 * 2 : beat % 2, cheer = goal ? beat % 2 === 0 : beat % 4 === 0;
     const b = drawMascot(g, m.tid, m.x, m.y - hop, cheer);
     list.push({
      tid: m.tid,
      side: m.side,
      kind: kindOf(m.tid),
      x: m.x,
      y: m.y,
      box: b,
      cheer: cheer
     });
    }
    S.last.mascots = list;
    S.last.frame++;
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 function rnd25(seed) {
  let s = seed >>> 0 || 1;
  return () => {
   s = s * 1664525 + 1013904223 >>> 0;
   return s / 4294967296;
  };
 }
 const SKIN = [ '#f5d0a9', '#f0c090', '#e0ac7a', '#c68a5a', '#9a6440', '#6b4428' ], HAIR = [ '#2a1b10', '#5a3a1e', '#c9a050', '#1a1a1a', '#8a4a20', '#e8d080' ];
 function startRush(G) {
  const tid = G.user, R = rnd25(seedOf('rush25' + tid + newGameCount)), sp = spots(G).find(m => m.tid === tid);
  const fans = [];
  for (let i = 0; i < 56; i++) {
   const top = i < 40, x0 = top ? MIDX - 190 + R() * 380 : MIDX - 150 + R() * 300;
   fans.push({
    x0: x0,
    y0: top ? 20 + R() * 9 : H - 2 - R() * 4,
    tx: MIDX - 115 + R() * 230,
    ty: FT + 10 + R() * (FB - FT - 22),
    spd: 52 + R() * 34,
    d: .5 + i * .022 + R() * .7,
    skin: SKIN[R() * 6 | 0],
    hair: HAIR[R() * 6 | 0],
    shirt: R() < .62 ? 1 : 2,
    flag: R() < .2,
    ph: R() * 6.28
   });
  }
  S.rush = {
   tid: tid,
   t: 0,
   last: performance.now(),
   fans: fans,
   m: {
    x0: sp ? sp.x : MIDX - 110,
    y0: H - 1,
    tx: MIDX + 18,
    ty: CY - 20,
    spd: 48,
    d: .35
   }
  };
 }
 {
  const FG = window.finishGame;
  window.finishGame = function() {
   const r = FG.apply(this, arguments);
   try {
    const G = game;
    if (showOn(G) && isColT(G.user) && G.score[0] > G.score[1]) startRush(G);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 const posAt = (o, t) => {
  const e = Math.max(0, t - o.d), L = Math.hypot(o.tx - o.x0, o.ty - o.y0), k = L ? Math.min(1, e * o.spd / L) : 1;
  return {
   x: o.x0 + (o.tx - o.x0) * k,
   y: o.y0 + (o.ty - o.y0) * k,
   there: k >= 1,
   run: k > 0 && k < 1,
   e: e
  };
 };
 function tickRush() {
  const R = S.rush;
  if (!R) return null;
  const now = performance.now();
  if (!paused) R.t += Math.min(.1, (now - R.last) / 1e3);
  R.last = now;
  return R;
 }
 function drawFan(ctx, f, x, y, z, arms, pal) {
  const X = Math.round(x), Y = Math.round(y - z), sh = f.shirt === 1 ? pal.c1 : pal.c2;
  if (z) {
   ctx.fillStyle = 'rgba(0,0,0,.25)';
   ctx.fillRect(X - 1, Math.round(y), 3, 1);
  }
  ctx.fillStyle = '#20242a';
  ctx.fillRect(X - 1, Y - 2, 1, 2);
  ctx.fillRect(X + 1, Y - 2, 1, 2);
  ctx.fillStyle = sh;
  ctx.fillRect(X - 1, Y - 5, 3, 3);
  ctx.fillStyle = f.skin;
  ctx.fillRect(X - 1, Y - 7, 2, 2);
  ctx.fillStyle = f.hair;
  ctx.fillRect(X - 1, Y - 8, 2, 1);
  if (arms) {
   ctx.fillStyle = sh;
   ctx.fillRect(X - 2, Y - 7, 1, 2);
   ctx.fillRect(X + 2, Y - 7, 1, 2);
   ctx.fillStyle = f.skin;
   ctx.fillRect(X - 2, Y - 8, 1, 1);
   ctx.fillRect(X + 2, Y - 8, 1, 1);
  }
  if (f.flag) {
   ctx.fillStyle = '#6b4a2a';
   ctx.fillRect(X + 2, Y - 13, 1, 9);
   const wv = Math.floor(menuT * 6 + f.ph) % 2;
   ctx.fillStyle = pal.c2;
   ctx.fillRect(X + 3, Y - 13, 4, 3);
   ctx.fillStyle = pal.c1;
   ctx.fillRect(X + 3, Y - 12 + wv, 4, 1);
  }
 }
 const fanPal = tid => {
  const t = WT_REG[tid] || {};
  let c1 = t.c1 || '#c0392b', c2 = t.c2 || '#ffffff';
  if (lum(c1) < .05) c1 = '#2b2b2b';
  if (dist(c1, c2) < 60) c2 = '#ffffff';
  return {
   c1: c1,
   c2: c2
  };
 };
 function drawRushFans() {
  const R = tickRush();
  if (!R) return 0;
  const pal = fanPal(R.tid), t = R.t;
  let n = 0;
  const list = R.fans.map(f => ({
   f: f,
   p: posAt({
    x0: f.x0,
    y0: f.y0,
    tx: f.tx,
    ty: f.ty,
    spd: f.spd,
    d: f.d
   }, t)
  })).filter(q => q.p.e > 0).sort((a, b) => a.p.y - b.p.y);
  for (const {f: f, p: p} of list) {
   const z = p.there ? Math.round(Math.abs(Math.sin(t * 7 + f.ph)) * 3) : p.run ? Math.floor(t * 12 + f.ph) % 2 : 0;
   drawFan(g, f, p.x, p.y, z, p.there ? Math.floor(t * 5 + f.ph) % 2 === 0 : false, pal);
   n++;
  }
  R.drawn = n;
  return n;
 }
 function drawRushMascot() {
  const R = S.rush;
  if (!R) return null;
  const p = posAt(R.m, R.t), z = p.there ? Math.round(Math.abs(Math.sin(R.t * 6)) * 4) : p.run ? Math.floor(R.t * 10) % 2 : 0;
  const b = drawMascot(g, R.tid, p.x, p.y - z, p.there ? Math.floor(R.t * 5) % 2 === 0 : Math.floor(R.t * 8) % 2 === 0);
  R.mpos = {
   x: Math.round(p.x),
   y: Math.round(p.y),
   there: p.there,
   box: b
  };
  return R.mpos;
 }
 const rushOn = () => on() && !!S.rush && !!game && screen === 'final' && game.user === S.rush.tid;
 const nm332 = () => !window.__rl_v124gb && !window.__rl_no332mascot;
 {
  const DG = window.drawGear;
  window.drawGear = function() {
   const r = DG.apply(this, arguments);
   try {
    if (rushOn()) drawRushFans();
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 {
  const DL = window.drawLvlFx;
  window.drawLvlFx = function() {
   const r = DL.apply(this, arguments);
   try {
    if (rushOn() && !nm332()) drawRushMascot();
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 {
  const DFn = window.drawFinal;
  window.drawFinal = function() {
   const r = DFn.apply(this, arguments);
   S.last.gutter = false;
   try {
    if (!rushOn()) return r;
    const R = tickRush(), cx = W / 2, gw = Math.floor(cx - 122);
    if (gw < 26) return r;
    const pal = fanPal(R.tid), t = R.t, Rn = rnd25(seedOf('gut25' + R.tid));
    for (const side of [ 0, 1 ]) {
     const x0 = side ? Math.ceil(cx + 122) : 0;
     for (let row = 0; row < 3; row++) for (let i = 0; i < Math.floor(gw / 6); i++) {
      const f = {
       skin: SKIN[Rn() * 6 | 0],
       hair: HAIR[Rn() * 6 | 0],
       shirt: Rn() < .6 ? 1 : 2,
       flag: row === 0 && Rn() < .25,
       ph: Rn() * 6.28
      };
      const x = x0 + 3 + i * 6 + row % 2 * 3, y = H - 2 - row * 6;
      if (x > x0 + gw - 3) continue;
      drawFan(g, f, x, y, Math.round(Math.abs(Math.sin(t * 7 + f.ph)) * 2), Math.floor(t * 5 + f.ph) % 2 === 0, pal);
     }
    }
    const mx = Math.round(gw / 2), my = H - 22 - Math.round(Math.abs(Math.sin(t * 6)) * 3);
    if (!nm332()) {
     g.save();
     g.translate(mx, my);
     g.scale(2, 2);
     drawMascot(g, R.tid, 0, 0, Math.floor(t * 5) % 2 === 0);
     g.restore();
    }
    const px0 = Math.ceil(cx + 122) + Math.round(gw / 2) - 14, py0 = 40, wv = Math.floor(t * 4) % 2, T = WT_REG[R.tid];
    rect(px0 - 1, py0 - 1, 2, 60, '#6b4a2a');
    g.fillStyle = pal.c1;
    g.beginPath();
    g.moveTo(px0 + 1, py0);
    g.lineTo(px0 + 30, py0 + 9 + wv);
    g.lineTo(px0 + 1, py0 + 18);
    g.closePath();
    g.fill();
    if (T && T.abbr) text(T.abbr, px0 + 4, py0 + 6, 1, pal.c2);
    S.last.gutter = true;
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 const BRAID25 = new Set([]);
 const isBraid25 = pl => !!pl && BRAID25.size > 0 && BRAID25.has(String((pl.n0 != null ? pl.n0 : pl.n) || '').toLowerCase().trim());
 if (typeof window.braidOf21 === 'function') {
  const b0 = window.braidOf21;
  window.braidOf21 = function(pl) {
   return b0.apply(this, arguments) || on() && !window.__rl_no232b && !window.__rl_no21 && isBraid25(pl);
  };
 }
 if (window.V232 && typeof V232.cardBraid === 'function' && V232.BRAID) {
  const c0 = V232.cardBraid;
  V232.cardBraid = function(x, p) {
   const nm = p && String((p.n0 != null ? p.n0 : p.n) || '').toLowerCase().trim();
   if (on() && isBraid25(p) && !V232.BRAID.has(nm)) {
    V232.BRAID.add(nm);
    try {
     return c0.apply(this, arguments);
    } finally {
     V232.BRAID.delete(nm);
    }
   }
   return c0.apply(this, arguments);
  };
 }
 function sheet(scale) {
  const ids = window.COL25 && COL25.IDS || [], cols = 11, cw = 22, ch = 26, sc = scale || 4;
  const c = document.createElement('canvas');
  c.width = cols * cw * sc;
  c.height = Math.ceil(ids.length / cols) * ch * sc;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.fillStyle = '#3f9a40';
  x.fillRect(0, 0, c.width, c.height);
  x.scale(sc, sc);
  ids.forEach((id, i) => {
   const X = i % cols * cw + 11, Y = Math.floor(i / cols) * ch + 22;
   x.fillStyle = '#2d7a30';
   x.fillRect(X - 10, Y - 20, 20, 21);
   drawMascot(x, id, X, Y, i % 3 === 1);
  });
  return {
   url: c.toDataURL('image/png'),
   ids: ids,
   kinds: ids.map(kindOf)
  };
 }
 Object.assign(S, {
  on: on,
  kindOf: kindOf,
  kindOfNick: kindOfNick,
  palOf: palOf,
  drawMascot: drawMascot,
  sheet: sheet,
  BRAID25: BRAID25,
  isBraid25: isBraid25,
  spots: spots,
  KINDS: Object.keys(HEADS).concat([ 'otto' ]),
  stadium: () => !!(game && game.final232)
 });
 return S;
})();

window.SHOW25 = SHOW25;
