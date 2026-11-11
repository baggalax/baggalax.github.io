'use strict';

(function() {
 const KEY = 'tour2317', DEV = 'rlx_tour2317';
 const STEPS = [ [ 'quick', /^(QUICK GAME|PLAY QUICK MATCH)$/, 'PLAY ONE GAME VS THE CPU. PICK ANY TWO TEAMS' ], [ 'online', /^ONLINE$/, 'PLAY A FRIEND HEAD TO HEAD OR AN ONLINE SEASON' ], [ 'season', /^(SEASON|CONTINUE SEASON|PLAY SEASON)$/, 'DRAFT YOUR TEAM AND PLAY A FULL SEASON + PLAYOFFS' ], [ 'world', /^(WORLD GAMES|PLAY WORLD GAMES)$/, 'PICK A COUNTRY AND GO FOR THE WORLD GAMES GOLD' ], [ 'teams', /^TEAMS \+ RATINGS$/, 'EVERY TEAM, ROSTER AND PLAYER RATING' ], [ 'pm', /^PLAYMAKER$/, 'DRAW YOUR OWN PLAYS, THEN RUN THEM IN GAMES WITH SET' ], [ 'tut', /^TUTORIAL$/, 'REPLAY ANY LESSON WHENEVER YOU WANT' ], [ 'help', /^HOW TO PLAY$/, 'EVERY CONTROL AND RULE IN ONE PLACE' ], [ 'prac', /^PRACTICE$/, 'PRACTICE DRILLS. 2 BETWEEN SEASON GAMES = +1 OVR FOR YOUR TEAM' ], [ 'set', /^GAME SETTINGS$/, 'DIFFICULTY, CONTROLS, SOUND, CODES AND MORE' ], [ 'friends', /^FRIENDS/, 'SIGN IN: ADD FRIENDS, SEND GAME INVITES + CLOUD SAVE' ], [ 'player', /^LOBBY PLAYER$/, 'YOUR PLAYER. THE ARROWS FLIP THROUGH YOUR TEAM' ], [ 'gear', /^GEAR HELMET$/, 'GEAR SLOTS: TAP ONE TO PUT ON A HELMET, STICK, TAPE + MORE' ], [ 'stats', /^STATS$/, "HIS STATS. TAP TO SEE HOW HE'S PLAYING" ], [ 'chinos', /^CHINOS/, 'YOUR CHINOS. EARN THEM IN GAMES, SPEND THEM IN THE SHOP' ], [ 'shop', /^STRING SHOP$/, 'THE SHOP: SPEND CHINOS ON CARD PACKS AND GEAR' ], [ 'pass', /^PASS$/, 'THE PASS: PLAY GAMES TO LEVEL UP AND UNLOCK REWARDS' ], [ 'weekly', /^WEEKLY$/, 'WEEKLY CHALLENGES: A NEW SET EVERY WEEK, WIN CHINOS' ], [ 'locker', /^LOCKER ROOM$/, 'EVERYTHING YOU OWN: CARDS, STICKS, GEAR AND UNIFORMS' ], [ 'crew', /^TEAM CREW$/, 'HIRE YOUR TEAM CREW: STAFF WHO BOOST YOUR TEAM' ], [ 'mute', /^MUTE$/, 'SOUND ON / OFF' ] ];
 const on = () => !window.__rl_no2317 && !window.__rl_v124gb;
 const devSeen = () => {
  try {
   return !!localStorage.getItem(DEV);
  } catch (e) {
   return false;
  }
 };
 const T = {
  cur: null,
  n: 0,
  shownT: null,
  log: [],
  how: null
 };
 function seen() {
  return !!LS.get(KEY, null) || devSeen();
 }
 function finish(how) {
  T.how = how;
  T.cur = null;
  LS.set(KEY, {
   how: how,
   t: Date.now(),
   n: T.n
  });
  try {
   localStorage.setItem(DEV, how);
  } catch (e) {}
  try {
   panelDirty();
  } catch (e) {}
 }
 function want(modal) {
  if (!on() || screen !== 'menu' || game || tutGate || modal || seen()) return false;
  if (!LS.get('tutDone', false)) return false;
  if (window.V20 && V20.gate && V20.gate()) return false;
  if (window.V17 && V17.modal && V17.modal()) return false;
  if (typeof ASK22 !== 'undefined' && ASK22) return false;
  return true;
 }
 function targets() {
  const out = {};
  for (const s of uiSpecs) {
   if (!s.key.startsWith('menu|')) continue;
   const lb = String(s.label || ''), k = s.key.slice(5);
   for (const [id, re] of STEPS) if (!out[id] && (re.test(lb) || re.test(k))) out[id] = s;
  }
  return out;
 }
 function wrap(s, w) {
  const words = s.split(' '), lines = [];
  let l = '';
  for (const wd of words) {
   const t = l ? l + ' ' + wd : wd;
   if (textW(t) > w && l) {
    lines.push(l);
    l = wd;
   } else l = t;
  }
  if (l) lines.push(l);
  return lines;
 }
 function arrow(x, y, dir, col) {
  const b = Math.floor(menuT * 4) % 2 ? 2 : 0;
  if (dir === 'r' || dir === 'l') {
   const s = dir === 'r' ? 1 : -1, xo = x - s * b;
   rect(s > 0 ? xo - 13 : xo + 7, y - 2, 7, 5, '#000');
   rect(s > 0 ? xo - 12 : xo + 6, y - 1, 6, 3, col);
   for (let i = 0; i < 6; i++) {
    rect(s > 0 ? xo - 7 + i : xo + 6 - i, y - 6 + i, 1, 13 - 2 * i, '#000');
    rect(s > 0 ? xo - 7 + i : xo + 6 - i, y - 5 + i, 1, 11 - 2 * i, col);
   }
   return;
  }
  const s = dir === 'd' ? 1 : -1, yo = y - s * b;
  rect(x - 2, s > 0 ? yo - 13 : yo + 7, 5, 7, '#000');
  rect(x - 1, s > 0 ? yo - 12 : yo + 6, 3, 6, col);
  for (let i = 0; i < 6; i++) {
   rect(x - 6 + i, s > 0 ? yo - 7 + i : yo + 6 - i, 13 - 2 * i, 1, '#000');
   rect(x - 5 + i, s > 0 ? yo - 7 + i : yo + 6 - i, 11 - 2 * i, 1, col);
  }
 }
 function draw() {
  const tg = targets(), list = STEPS.filter(s => tg[s[0]]);
  if (!list.length) return false;
  if (!T.cur || !tg[T.cur]) {
   const i0 = T.cur ? STEPS.findIndex(s => s[0] === T.cur) : -1;
   const nx = STEPS.slice(i0 + 1).find(s => tg[s[0]]) || (T.cur ? null : list[0]);
   if (!nx) {
    finish('done');
    return false;
   }
   T.cur = nx[0];
  }
  const step = STEPS.find(s => s[0] === T.cur), t = tg[T.cur], idx = list.findIndex(s => s[0] === T.cur) + 1;
  if (T.log[T.log.length - 1] !== T.cur) {
   T.log.push(T.cur);
   T.n = T.log.length;
  }
  const sh = 'rgba(0,0,0,.6)', bx = t.x - 2, by = t.y - 2, bw = t.w + 4, bh = t.h + 4;
  rect(0, 0, W, Math.max(0, by), sh);
  rect(0, by + bh, W, Math.max(0, H - by - bh), sh);
  rect(0, by, Math.max(0, bx), bh, sh);
  rect(bx + bw, by, Math.max(0, W - bx - bw), bh, sh);
  const blink = Math.floor(menuT * 3) % 2 ? '#ffe14d' : '#fff7b0';
  rect(bx, by, bw, 1, blink);
  rect(bx, by + bh - 1, bw, 1, blink);
  rect(bx, by, 1, bh, blink);
  rect(bx + bw - 1, by, 1, bh, blink);
  const cap = step[2], CW = 132, lines = wrap(cap, CW - 8), chH = lines.length * 8 + 14;
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2, side = t.w > W * .45 ? cy < H / 2 ? 'd' : 'u' : cx > W / 2 ? 'l' : 'r';
  let ax, ay, dir, qx, qy;
  if (side === 'l') {
   dir = 'r';
   ax = bx - 2;
   ay = Math.round(cy);
   qx = ax - 16 - CW;
   qy = Math.round(cy - chH / 2);
  } else if (side === 'r') {
   dir = 'l';
   ax = bx + bw + 1;
   ay = Math.round(cy);
   qx = ax + 16;
   qy = Math.round(cy - chH / 2);
  } else if (side === 'd') {
   dir = 'u';
   ax = Math.round(cx);
   ay = by + bh + 1;
   qx = Math.round(cx - CW / 2);
   qy = ay + 16;
  } else {
   dir = 'd';
   ax = Math.round(cx);
   ay = by - 2;
   qx = Math.round(cx - CW / 2);
   qy = ay - 16 - chH;
  }
  if (qy + chH > H - 15 && (side === 'l' || side === 'r')) {
   ay = Math.min(ay, H - 22);
  }
  qx = Math.max(2, Math.min(W - CW - 2, qx));
  qy = Math.max(2, Math.min(H - chH - 15, qy));
  arrow(ax, ay, dir, '#ffe14d');
  rect(qx - 1, qy - 1, CW + 2, chH + 2, '#000');
  rect(qx, qy, CW, chH, '#10202a');
  rect(qx, qy, CW, 1, '#ffe14d');
  lines.forEach((l, i) => text(l, qx + 4, qy + 4 + i * 8, 1, '#ffffff'));
  text('TAP TO GO ON  ' + idx + '/' + list.length, qx + 4, qy + chH - 9, 1, '#ffe14d');
  const sw = 34, sx = 4, sy = H - 16;
  for (let i = uiSpecs.length - 1; i >= 0; i--) if (uiSpecs[i].key.startsWith('menu|')) uiSpecs.splice(i, 1);
  hit('TOUR NEXT', 0, 0, W, H, () => next(), 'TOUR NEXT');
  hit('TOUR SKIP', sx - 2, sy - 2, sw + 4, 16, () => finish('skip'), 'TOUR SKIP');
  rect(sx, sy + 2, sw, 12, '#000');
  rect(sx, sy, sw, 12, '#ff9a8a');
  text('SKIP', sx + sw / 2, sy + 3, 1, '#0b1a20', 'center');
  T.at = {
   id: T.cur,
   x: t.x,
   y: t.y,
   w: t.w,
   h: t.h,
   ax: ax,
   ay: ay,
   dir: dir,
   box: [ qx, qy, CW, chH ],
   cap: cap,
   idx: idx,
   of: list.length,
   skip: [ sx, sy, sw, 12 ]
  };
  return true;
 }
 function next() {
  const tg = targets0 || {};
  const i0 = STEPS.findIndex(s => s[0] === T.cur);
  const nx = STEPS.slice(i0 + 1).find(s => tg[s[0]]);
  if (!nx) {
   finish('done');
   return;
  }
  T.cur = nx[0];
 }
 let targets0 = null;
 window.TOUR17 = {
  T: T,
  STEPS: STEPS,
  KEY: KEY,
  DEV: DEV,
  seen: seen,
  finish: finish,
  next: next,
  draw(modal) {
   if (!want(modal)) {
    T.live = false;
    return false;
   }
   if (T.shownT == null) T.shownT = performance.now();
   targets0 = targets();
   T.live = draw();
   return T.live;
  },
  live: () => !!T.live && screen === 'menu' && !seen(),
  reset() {
   T.cur = null;
   T.n = 0;
   T.log = [];
   T.how = null;
   T.shownT = null;
   T.live = false;
  }
 };
})();
