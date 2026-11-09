(function() {
 'use strict';
 const on26 = () => !window.__rl_no26 && !window.__rl_v124gb;
 const rt = () => performance.now() / 1e3;
 const CN = {
  'TOP-HIGH': 'TOP LEFT',
  'BOTTOM-HIGH': 'TOP RIGHT',
  'TOP-LOW': 'BOTTOM LEFT',
  'BOTTOM-LOW': 'BOTTOM RIGHT'
 };
 const ORDER = [ 'TOP-HIGH', 'BOTTOM-HIGH', 'TOP-LOW', 'BOTTOM-LOW' ];
 const T = {
  active: false,
  step: null,
  card: null,
  got: {},
  taps: 0,
  fd: 0,
  lastShots: 0,
  pend: null,
  setups: -1,
  msg: null,
  msgT: 0,
  doneAt: 0,
  menuT: 0,
  runs: 0,
  log: []
 };
 try {
  if (on26()) {
   if (typeof TUT !== 'undefined' && TUT[2] && TUT[2][0] === 'SHOOT') TUT[2][1] = 'TOUCH THE GOAL, PULL YOUR THUMB BACK (FARTHER = HARDER), LET GO = SHOT.';
   if (window.PRAC18 && PRAC18.TIPS && PRAC18.TIPS.O) for (const t of PRAC18.TIPS.O) if (t[0] === 'SHOOT') t[1] = 'TOUCH THE GOAL, PULL YOUR THUMB BACK TO AIM, LET GO = SHOT.';
   if (window.PRAC18 && PRAC18.DRILL_TIP && PRAC18.DRILL_TIP.O) PRAC18.DRILL_TIP.O.shoot = 'SHOOTING: TOUCH THE GOAL, PULL BACK, PUT THE LINE ON A CORNER, LET GO.';
  }
 } catch (e) {
  console.error(e);
 }
 function need() {
  try {
   return on26() && !window.__rl_skip26 && !LS.get('tut26', false) && !!LS.get('tutDone', false);
  } catch (e) {
   return false;
  }
 }
 function menuFree() {
  return screen === 'menu' && !game && !tutAsk && !(typeof ASK22 !== 'undefined' && ASK22) && !document.getElementById('df2503') && !document.getElementById('shop26') && !document.getElementById('tut26card') && !document.getElementById('c27') && !document.getElementById('tt27');
 }
 function card(id, title, lines, btn, go) {
  const old = document.getElementById('tut26card');
  if (old) old.remove();
  const d = document.createElement('div');
  d.id = 'tut26card';
  d.dataset.step = id;
  d.style.cssText = 'position:fixed;inset:0;z-index:84;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62);font:bold 11px/1.3 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ffe14d;box-shadow:0 3px 0 #000;padding:9px 14px 10px;max-width:92vw;max-height:94vh;overflow:auto;text-align:left';
  const h = document.createElement('div');
  h.textContent = title;
  h.style.cssText = 'color:#ffe14d;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:5px;text-align:center';
  box.appendChild(h);
  for (const s of lines) {
   const e = document.createElement('div');
   e.textContent = s;
   e.style.cssText = 'font-size:11px;margin:2px 0;color:' + (/^(DON'T|TIP)/.test(s) ? '#ffd23a' : '#e6f4f7');
   box.appendChild(e);
  }
  const b = document.createElement('button');
  b.id = 'tut26ok';
  b.textContent = btn;
  b.style.cssText = 'display:block;margin:8px auto 0;font:inherit;font-size:13px;border:0;border-radius:0;padding:7px 18px;background:#7dff7a;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000';
  b.addEventListener('click', e => {
   e.stopPropagation();
   d.remove();
   T.card = null;
   try {
    SFX.tap && SFX.tap();
   } catch (x) {}
   go();
  });
  box.appendChild(b);
  d.appendChild(box);
  document.body.appendChild(d);
  T.card = id;
 }
 const INTRO = [ 'THE SHOT IS NEW. HERE IS HOW IT WORKS:', '1. PUT YOUR RIGHT THUMB ON THE GOAL.', '2. PULL IT BACK, AWAY FROM THE GOAL. A DOTTED LINE SHOWS WHERE THE BALL GOES.', '3. SLIDE UP OR DOWN TO AIM. PULL FARTHER = A HARDER SHOT. THE GAME GOES SLOW-MO WHILE YOU AIM.', '4. LET GO = SHOOT. (LET GO WITHOUT PULLING BACK = NO SHOT.)', 'THE 4 YELLOW CIRCLES ARE THE CORNERS. LINE ON A CIRCLE = THE BALL GOES TO THAT CORNER.', 'DON\'T STARE IT DOWN: AIM HELD STILL TOO LONG AND THE GOALIE READS IT. MOVE IT LATE AND HE CAN\'T.', 'YOU CAN STILL RUN WITH THE LEFT THUMB WHILE YOU AIM.', 'FIRST: SCORE IN ALL 4 CORNERS.' ];
 const CREASE_L = [ 'CREASE FINISHES', [ 'CLOSE TO THE CREASE, 4 YELLOW CIRCLES POP UP ON THE GOAL.', 'QUICK TAP A CIRCLE = YOU FINISH IN THAT CORNER. NO PULL-BACK NEEDED.', 'SCORE 2 CREASE FINISHES.' ] ];
 const FD_L = [ 'FACE DODGE', [ 'A DEFENDER RUNNING AT YOU THINKS YOU ARE ABOUT TO SHOOT.', '1. PULL BACK LIKE A SHOT (THE LINE SHOWS).', '2. BRING YOUR THUMB BACK TO WHERE IT STARTED, THEN LET GO.', 'NO SHOT: YOU FAKE IT, SWING YOUR STICK ACROSS YOUR FACE TO THE OTHER HAND AND HE FLIES RIGHT PAST YOU.', 'TIP: WAIT UNTIL HE IS CLOSE AND RUNNING AT YOU.', 'NO ONE RUNNING AT YOU = JUST A QUICK STICK SWITCH.' ] ];
 function start() {
  if (T.active) return;
  T.runs++;
  T.active = true;
  T.got = {};
  T.taps = 0;
  T.fd = 0;
  T.pend = null;
  T.setups = -1;
  T.msg = null;
  T.step = 'intro';
  try {
   const SET = PRAC18.SET, saved = JSON.parse(JSON.stringify(SET)), key = typeof wgame !== 'undefined' && wgame && PRAC18.world && PRAC18.world() ? 'wteam' : 'team';
   const l = PRAC18.teams(), tm = l.find(x => x !== 'SEASON' && TEAMS.some(t => t.id === x && !t.sz)) || l.find(x => x !== 'SEASON') || l[0];
   SET.side = 'O';
   SET.n = 1;
   SET.ghosts = 1;
   SET.drill = 'shoot';
   SET[key] = tm;
   const ok = PRAC18.start();
   for (const k of Object.keys(SET)) if (!(k in saved)) delete SET[k];
   Object.assign(SET, saved);
   try {
    PRAC18.saveSet();
   } catch (e) {}
   if (!ok || !game || !game.practice) throw new Error('practice did not start');
   game.practice.season = false;
   game.practice.tut26 = true;
   game.practice.counted = 'yes';
   game.practice.xp232 = 1;
  } catch (e) {
   console.error(e);
   T.active = false;
   T.step = null;
   LS.set('tut26', true);
   return;
  }
  T.lastShots = SHOT26.S.shots;
  T.lastFd = SHOT26.S.fds || 0;
  card('intro', 'NEW SHOOTING!', INTRO, 'LET\'S GO', () => {
   T.step = 'corners';
   place();
  });
 }
 function finish() {
  T.active = false;
  T.step = null;
  T.card = null;
  LS.set('tut26', true);
  T.doneAt = rt();
  try {
   if (game && game.practice) {
    game.practice.counted = 'yes';
   }
  } catch (e) {}
  game = null;
  screen = 'menu';
  shootP = null;
  stick = null;
  menuMsg = {
   s: 'SHOOTING TUTORIAL DONE',
   t: 2
  };
  try {
   panelDirty();
  } catch (e) {}
 }
 function opp() {
  return game.players.filter(p => p.team === 'D' && !p.gk && p.role !== 'G' && !p.far);
 }
 function place() {
  const G = game;
  if (!G || !G.carrier) return;
  const c = G.carrier, s = T.step;
  let x = c.x, y = c.y;
  if (s === 'corners') {
   x = GX - rnd(88, 108);
   y = CY + rnd(-26, 26);
  } else if (s === 'crease') {
   x = GX - (CREASE + 9);
   y = CY + rnd(-8, 8);
  } else if (s === 'fd') {
   x = GX - 112;
   y = CY + rnd(-14, 14);
  }
  c.x = x;
  c.y = y;
  c.tx = x;
  c.ty = y;
  G.ball.x = c.x + BX;
  G.ball.y = c.y + BY;
  G.ball.state = 'held';
  G.carrier = c;
  for (const d of opp()) {
   if (s === 'fd') {
    d.x = c.x + 46;
    d.y = c.y + (c.y < CY ? 6 : -6);
    d.stun = .6;
    d.ovr26 = null;
    d.charge26 = 0;
    T.charge = d;
    T.chargeAt = rt() + .7;
   } else {
    d.x = Math.max(8, c.x - 70);
    d.y = c.y < CY ? FB - 8 : FT + 8;
    d.stun = 9;
   }
   d.tx = d.x;
   d.ty = d.y;
   d._p26 = [ d.x, d.y ];
   d._v26 = [ 0, 0 ];
  }
  T.placedAt = rt();
  T.pend = null;
  T.lastShots = SHOT26.S.shots;
  try {
   fx = fx.filter(f => f.type !== 'cue');
  } catch (e) {}
 }
 function say(s, col) {
  T.msg = {
   s: s,
   col: col || '#ffe14d'
  };
  T.msgT = rt();
 }
 function tick(dt) {
  const G = game;
  if (!T.active) {
   if (screen === 'menu' && !game) {
    if (!T.menuT) T.menuT = rt();
   } else T.menuT = 0;
   if (T.menuT && rt() - T.menuT > .5 && menuFree()) {
    if (need()) start(); else if (rt() - T.doneAt > .6 && rt() - (T.shopT || 0) > 2 && LS.get('tut26', false)) {
     T.shopT = rt();
     shopCheck();
    }
   }
   return;
  }
  if (!G || !G.practice || !G.practice.tut26) {
   T.active = false;
   T.step = null;
   const o = document.getElementById('tut26card');
   if (o) o.remove();
   T.card = null;
   return;
  }
  if (G.practice.setups !== T.setups) {
   T.setups = G.practice.setups;
   if (T.step && T.step !== 'intro') place();
  }
  if (T.card || T.step === 'done') return;
  const S = SHOT26.S;
  if (S.shots !== T.lastShots) {
   T.lastShots = S.shots;
   T.pend = S.last;
  }
  if (T.pend && screen === 'live' || T.pend && screen === 'banner') {
   const o = SHOT26.outcome();
   if (o) {
    const p = T.pend;
    T.pend = null;
    T.log.push({
     step: T.step,
     circle: p.circle,
     type: p.type,
     o: o
    });
    judge(p, o);
   }
  }
  if (T.step === 'fd') {
   if ((S.fds || 0) !== T.lastFd) {
    T.lastFd = S.fds;
    const f = S.fd || {};
    if (f.overrun > 0) {
     T.fd++;
     say('HE BIT! THAT\'S THE FACE DODGE', '#7dff7a');
     T.step = 'fdok';
     T.fdT = rt();
     try {
      SFX.cheer();
     } catch (e) {}
    } else say(f.near && f.near.length ? 'WAIT FOR HIM TO RUN AT YOU, THEN FAKE IT' : 'TOO EARLY - LET HIM GET CLOSER FIRST', '#ff9a8a');
   }
   const d = T.charge, c = G.carrier;
   if (d && c && screen === 'live' && rt() >= T.chargeAt && !d.ovr26 && G.players.includes(d)) {
    const dx = c.x - d.x, dy = c.y - d.y, L = Math.hypot(dx, dy) || 1;
    if (L < 7) {
     d.charge26 = 0;
     say('TOO LATE - FAKE IT WHILE HE IS COMING', '#ff9a8a');
     place();
    } else {
     const v = 45 * dt;
     d.x += dx / L * v;
     d.y += dy / L * v;
     d.tx = d.x;
     d.ty = d.y;
     d.stun = .12;
     d.charge26 = 45;
    }
   }
   if (G.carrier == null && screen === 'live' && G.ball.state !== 'held' && G.ball.state !== 'shot') {}
  }
  if (T.step === 'fdok' && rt() - T.fdT > 1.3) {
   T.step = 'done';
   card('done', 'SHOOTING TUTORIAL COMPLETE', [ '4 CORNERS, CREASE FINISHES AND THE FACE DODGE - YOU\'RE READY.', 'THE NEW SHOT WORKS IN EVERY MODE: QUICK GAME, SEASON, COLLEGE, WORLD GAMES, ONLINE AND PRACTICE.' ], 'PLAY', finish);
  }
 }
 function judge(p, o) {
  if (T.step === 'corners') {
   if (o === 'goal' && p.circle && !T.got[p.circle]) {
    T.got[p.circle] = 1;
    say(CN[p.circle] + ' - NICE!', '#7dff7a');
    try {
     SFX.cheer();
    } catch (e) {}
   } else if (o === 'goal' && !p.circle) say('GOAL - BUT PUT THE LINE ON A YELLOW CIRCLE', '#ffd23a'); else if (o === 'goal') say(CN[p.circle] + ' IS DONE - GO FOR ANOTHER CORNER', '#ffd23a'); else if (o === 'short') say('TOO SOFT - PULL BACK FARTHER', '#ff9a8a'); else say(p.circle ? 'SO CLOSE - TRY AGAIN' : 'PUT THE LINE ON A YELLOW CIRCLE', '#ff9a8a');
   if (ORDER.every(k => T.got[k])) {
    T.step = 'cwait';
    setTimeout(() => {
     if (T.active && T.step === 'cwait') card('crease', CREASE_L[0], CREASE_L[1], 'GOT IT', () => {
      T.step = 'crease';
      place();
     });
    }, 900);
   }
  } else if (T.step === 'crease') {
   if (o === 'goal' && p.type === 'TAP-IN') {
    T.taps++;
    say('CREASE FINISH ' + T.taps + ' OF 2', '#7dff7a');
    try {
     SFX.cheer();
    } catch (e) {}
   } else if (p.type !== 'TAP-IN') say('TAP A CIRCLE QUICKLY - NO PULL-BACK', '#ff9a8a'); else say('TRY AGAIN', '#ff9a8a');
   if (T.taps >= 2) {
    T.step = 'fwait';
    setTimeout(() => {
     if (T.active && T.step === 'fwait') card('fd', FD_L[0], FD_L[1], 'TRY IT', () => {
      T.step = 'fd';
      T.lastFd = SHOT26.S.fds || 0;
      place();
     });
    }, 900);
   }
  }
 }
 function drawBar() {
  rect(0, 0, W, 17, '#0b0f14');
  rect(2, 2, 92, 13, '#1f6b2a');
  text('SHOOTING TUTORIAL', 48, 5, 1, '#ffffff', 'center');
  const s = T.step;
  let a = '', b2 = '';
  if (s === 'corners' || s === 'cwait') {
   a = 'SCORE IN ALL 4 CORNERS';
   let x = 100;
   for (const k of ORDER) {
    const lb = (T.got[k] ? 'DONE: ' : '') + CN[k];
    text(lb, x, 10, 1, T.got[k] ? '#7dff7a' : 'rgba(255,255,255,.55)');
    x += textW(lb) + 8;
   }
  } else if (s === 'crease' || s === 'fwait') {
   a = 'CREASE FINISHES: QUICK TAP A YELLOW CIRCLE';
   b2 = 'SCORED ' + T.taps + ' OF 2';
  } else if (s === 'fd' || s === 'fdok') {
   a = 'FACE DODGE: PULL BACK, THEN BRING YOUR THUMB BACK + LET GO';
   b2 = 'AS HE RUNS AT YOU';
  }
  text(a, 100, 3, 1, '#ffd23a');
  text(b2, 100, 10, 1, '#8fe3f0');
  if (T.msg && rt() - T.msgT < 1.8) text(T.msg.s, W / 2, 24, 1, T.msg.col, 'center', '#000');
  if (s === 'corners' && SHOT26.S.aim && game && game.carrier && SHOT26.cornersOn()) {
   const m = SHOT26.aimNow(SHOT26.S.aim);
   if (m && Math.floor(rt() * 4) % 2) for (const q of SHOT26.corners(m.s)) if (!T.got[q.name]) {
    const cam = Math.round(camX);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(q.x - cam + .5, q.y + .5, SHOT26.CFG.cornR + 1.5, 0, Math.PI * 2);
    g.stroke();
   }
  }
 }
 const SEEN_KEY = 'shop26seen';
 function catalog() {
  const V = window.V17;
  if (!V || !V.PACKS) return null;
  const out = new Set;
  for (const k in V.PACKS) out.add('pack:' + k);
  const U = window.UNI21;
  try {
   if (U && U.on && U.on()) {
    for (const it of U.items()) out.add('uni:' + it.id);
    for (const it of U.col2504 || []) out.add('uni:' + it.id);
    for (const it of U.alt2504 || []) out.add('uni:' + it.id);
   }
  } catch (e) {}
  try {
   for (const it of V.I) if (!it.trophy && !it.crew && !it.leg20 && it.sec !== 'trophy' && V.vis16(it)) out.add('item:' + it.id);
  } catch (e) {}
  try {
   if (window.V27 && V27.shopIds) for (const x of V27.shopIds()) out.add(x);
  } catch (e) {}
  return Array.from(out);
 }
 function new2504() {
  const s = new Set([ 'pack:unip', 'pack:unic', 'pack:uniw', 'pack:b2504c', 'pack:b2504l' ]), U = window.UNI21, V = window.V17;
  try {
   for (const it of U && U.col2504 || []) s.add('uni:' + it.id);
   for (const it of U && U.alt2504 || []) s.add('uni:' + it.id);
  } catch (e) {}
  try {
   for (const it of V.I) if (it.b2504) s.add('item:' + it.id);
  } catch (e) {}
  try {
   if (window.V27 && V27.shopIds) for (const x of V27.shopIds()) s.add(x);
  } catch (e) {}
  return s;
 }
 function seenList(cat) {
  let s = null;
  try {
   s = LS.get(SEEN_KEY, null);
  } catch (e) {}
  if (!Array.isArray(s)) {
   const n = new2504();
   s = cat.filter(id => !n.has(id));
   LS.set(SEEN_KEY, s);
  }
  return new Set(s);
 }
 function fresh() {
  if (!on26() || window.__rl_skip26) return [];
  const cat = catalog();
  if (!cat || !cat.length) return [];
  const seen = seenList(cat);
  return cat.filter(id => !seen.has(id));
 }
 function markSeen() {
  const cat = catalog() || [];
  let s = [];
  try {
   s = LS.get(SEEN_KEY, []) || [];
  } catch (e) {}
  LS.set(SEEN_KEY, Array.from(new Set(s.concat(cat))));
 }
 function tiles(ids) {
  const V = window.V17, U = window.UNI21, P = V.PACKS, set = new Set(ids), out = [], inB = new Set;
  for (const id of ids) if (id.startsWith('pack:')) {
   const k = id.slice(5), pk = P[k];
   if (pk && pk.bundle) for (const x of pk.bundle) inB.add('item:' + x);
  }
  for (const id of ids) if (id.startsWith('pack:')) {
   const k = id.slice(5), pk = P[k];
   if (!pk) continue;
   let img = '';
   try {
    img = V.packUrl(k);
   } catch (e) {}
   out.push({
    id: id,
    img: img,
    n: pk.n,
    sub: pk.bundle ? 'BUNDLE - ' + pk.cost + ' CHINOS' : pk.cost ? pk.cost + ' CHINOS' : '',
    minis: pk.bundle ? pk.bundle.map(x => {
     try {
      return V.iconUrl(x);
     } catch (e) {
      return '';
     }
    }).filter(Boolean) : []
   });
  }
  const col = new Set((U && U.col2504 || []).map(it => 'uni:' + it.id)), alt = new Set((U && U.alt2504 || []).map(it => 'uni:' + it.id));
  const ucol = ids.filter(id => col.has(id) && !inB.has(id)), ualt = ids.filter(id => alt.has(id) && !inB.has(id)), uoth = ids.filter(id => id.startsWith('uni:') && !col.has(id) && !alt.has(id) && !inB.has(id));
  const icon = id => {
   try {
    return V.iconUrl(id.slice(id.indexOf(':') + 1));
   } catch (e) {
    return '';
   }
  };
  const nm = id => {
   const it = V.BY[id.slice(id.indexOf(':') + 1)];
   return it ? it.n : id.slice(id.indexOf(':') + 1).toUpperCase();
  };
  for (const id of ualt) out.push({
   id: id,
   img: icon(id),
   n: nm(id),
   sub: 'ALTERNATE UNIFORM'
  });
  const nsch = new Set(ucol.map(id => {
   const it = V.BY[id.slice(4)];
   return it && it.uni21 ? it.uni21.tid : id;
  })).size;
  if (ucol.length) out.push({
   id: 'group:col',
   img: icon(ucol[0]),
   n: 'COLLEGE UNIFORMS',
   sub: nsch + ' SCHOOLS - IN CARD PACKS',
   minis: ucol.slice(1, 4).map(icon)
  });
  if (uoth.length) out.push({
   id: 'group:uni',
   img: icon(uoth[0]),
   n: uoth.length === 1 ? nm(uoth[0]) : 'UNIFORMS',
   sub: uoth.length > 1 ? uoth.length + ' NEW' : 'UNIFORM'
  });
  for (const id of ids) if (id.startsWith('item:') && !inB.has(id)) out.push({
   id: id,
   img: icon(id),
   n: nm(id),
   sub: ''
  });
  for (const id of ids) if (id.startsWith('v27:') && window.V27 && V27.shopTile) {
   const t = V27.shopTile(id);
   if (t) out.push(t);
  }
  return out;
 }
 function shopCheck() {
  if (!on26() || window.__rl_skip26 || document.getElementById('shop26')) return;
  const ids = fresh();
  if (!ids.length) return;
  show(ids);
 }
 function show(ids) {
  const L = tiles(ids);
  if (!L.length) {
   markSeen();
   return;
  }
  const d = document.createElement('div');
  d.id = 'shop26';
  d.dataset.n = String(ids.length);
  d.style.cssText = 'position:fixed;inset:0;z-index:85;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #7dff7a;box-shadow:0 3px 0 #000;padding:8px 12px 10px;max-width:94vw;max-height:94vh;overflow:auto;text-align:center';
  const h = document.createElement('div');
  h.textContent = 'NEW IN THE SHOP!';
  h.style.cssText = 'color:#7dff7a;font-size:16px;text-shadow:2px 2px 0 #000;margin-bottom:6px';
  box.appendChild(h);
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:780px';
  box.appendChild(row);
  const MAX = 10;
  L.slice(0, MAX).forEach(t => {
   const c = document.createElement('div');
   c.className = 'shop26t';
   c.dataset.id = t.id;
   c.style.cssText = 'width:132px;background:rgba(0,0,0,.35);border:1px solid #2c4452;padding:4px 3px;display:flex;flex-direction:column;align-items:center';
   if (t.img) {
    const im = document.createElement('img');
    im.src = t.img;
    im.alt = '';
    im.style.cssText = 'height:46px;image-rendering:pixelated;margin-bottom:3px';
    c.appendChild(im);
   }
   if (t.minis && t.minis.length) {
    const mr = document.createElement('div');
    mr.style.cssText = 'display:flex;gap:2px;margin-bottom:2px';
    for (const u of t.minis.slice(0, 5)) {
     const im = document.createElement('img');
     im.src = u;
     im.alt = '';
     im.style.cssText = 'height:18px;image-rendering:pixelated';
     mr.appendChild(im);
    }
    c.appendChild(mr);
   }
   const n = document.createElement('div');
   n.textContent = t.n;
   n.style.cssText = 'color:#fff;font-size:10px';
   c.appendChild(n);
   if (t.sub) {
    const s2 = document.createElement('div');
    s2.textContent = t.sub;
    s2.style.cssText = 'color:#8fe3f0;font-size:9px';
    c.appendChild(s2);
   }
   row.appendChild(c);
  });
  if (L.length > MAX) {
   const m = document.createElement('div');
   m.textContent = '+ ' + (L.length - MAX) + ' MORE';
   m.style.cssText = 'color:#ffd23a;margin-top:4px';
   box.appendChild(m);
  }
  const br = document.createElement('div');
  br.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:8px';
  box.appendChild(br);
  const mk = (id, txt, bg, fn) => {
   const b = document.createElement('button');
   b.id = id;
   b.textContent = txt;
   b.style.cssText = 'font:inherit;font-size:12px;border:0;border-radius:0;padding:7px 14px;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;background:' + bg;
   b.addEventListener('click', e => {
    e.stopPropagation();
    markSeen();
    d.remove();
    try {
     SFX.tap && SFX.tap();
    } catch (x) {}
    fn();
   });
   br.appendChild(b);
  };
  mk('shop26_shop', 'GO TO THE SHOP', '#7dff7a', () => {
   try {
    window.V17.openShop();
   } catch (e) {
    console.error(e);
   }
  });
  mk('shop26_ok', 'OK', '#c9d6d9', () => {});
  d.appendChild(box);
  document.body.appendChild(d);
  T.shopShown = (T.shopShown || 0) + 1;
  T.shopLast = ids.slice();
 }
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return;
  window[n] = function() {
   return f.call(this, o, arguments);
  };
 };
 wrapG('step', function(o, a) {
  if (T.active && T.card) a = [ 0 ];
  const r = o.apply(this, a);
  try {
   if (on26()) tick(a[0] || 0);
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 wrapG('drawHUD', function(o, a) {
  if (T.active && game && game.practice && game.practice.tut26) {
   try {
    return drawBar();
   } catch (e) {
    console.error(e);
    return;
   }
  }
  return o.apply(this, a);
 });
 function rec26() {
  const G = game;
  if (!on26() || !G || G.practice || G.tutorial || !G.user || G.rec26) return;
  G.rec26 = 1;
  const a = LS.get('uni26last', []), l = Array.isArray(a) ? a.slice() : [];
  l.unshift(G.user);
  LS.set('uni26last', l.slice(0, 10));
 }
 wrapG('finishGame', function(o, a) {
  try {
   rec26();
  } catch (e) {
   console.error(e);
  }
  return o.apply(this, a);
 });
 wrapG('menuBars', function(o, a) {
  const rows = o.apply(this, a);
  if (!on26() || !Array.isArray(rows)) return rows;
  try {
   let ue = null;
   if (!rows.some(r => r.some(e => e.c2502 && e.big))) return rows;
   let ur = null, ui = -1;
   for (const r of rows) {
    const i = r.findIndex(e => e && e.label === 'ULTIMATE' && e.col25 && !e.big);
    if (i >= 0 && r.length > 1) {
     ue = r[i];
     ur = r;
     ui = i;
     break;
    }
   }
   if (!ue) return rows;
   const ti = rows.findIndex(r => r.length === 1 && r[0] && r[0].label === 'TEAMS + RATINGS');
   const pr = rows.find(r => r.length === 2 && r.some(e => e && e.label === 'PLAYMAKER')), tu = pr ? pr.findIndex(e => e && e.label === 'TUTORIAL') : -1;
   if (ti >= 0 && pr && tu >= 0 && pr !== ur) {
    ur[ui] = pr[tu];
    pr[tu] = rows[ti][0];
    rows.splice(ti, 1);
   } else ur.splice(ui, 1);
   const ci = rows.findIndex(r => r.some(e => e.c2502 && e.big)), wi = rows.findIndex(r => r.some(e => e.big && /WORLD GAMES$/.test(e.label)));
   rows.splice(ci >= 0 ? ci + 1 : wi >= 0 ? wi + 1 : 4, 0, [ Object.assign({}, ue, {
    big: true,
    sc: 2,
    c2502: 1,
    u26: 1
   }) ]);
  } catch (e) {
   console.error(e);
  }
  return rows;
 });
 wrapG('layoutBars', function(o, a) {
  const out = o.apply(this, a), y1 = a[4];
  if (!on26() || !Array.isArray(out) || !out.some(e => e.u26)) return out;
  for (let k = 0; k < 4; k++) {
   const bot = Math.max.apply(null, out.map(e => e.y + e.h));
   if (bot <= y1) break;
   const ys = [ ...new Set(out.map(e => e.y)) ].sort((p, q) => p - q), rowsY = ys.map(y => out.filter(e => e.y === y));
   const bigOk = rowsY.some(r => r.some(e => e.big) && r[0].h > 12);
   let sh = 0;
   for (const r of rowsY) {
    const isBig = r.some(e => e.big), cut = bigOk ? isBig && r[0].h > 12 : !isBig && r[0].h > 11;
    for (const e of r) {
     e.y -= sh;
     if (cut) e.h -= 1;
    }
    if (cut) sh++;
   }
  }
  return out;
 });
 window.TUT26 = {
  T: T,
  need: need,
  start: start,
  finish: finish,
  active: () => T.active,
  keeperOff: () => T.active && (T.step === 'corners' || T.step === 'crease' || T.step === 'cwait' || T.step === 'fwait'),
  forceOverrun: () => T.active && T.step === 'fd',
  catalog: catalog,
  fresh: fresh,
  show: show,
  shopCheck: shopCheck,
  markSeen: markSeen,
  tiles: tiles,
  new2504: new2504,
  SEEN_KEY: SEEN_KEY,
  ORDER: ORDER,
  CN: CN
 };
})();
