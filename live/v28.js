(function() {
 'use strict';
 const on = k => !window.__rl_v124gb && !window.__rl_no28 && !window['__rl_no28' + k];
 const LOG = {
  ots: [],
  cpu: [],
  drops: [],
  st: [],
  tut: []
 };
 const wrapG = (n, f) => {
  const o = window[n];
  if (typeof o !== 'function') return false;
  window[n] = function() {
   return f.call(this, o, arguments);
  };
  return true;
 };
 const rt = () => performance.now() / 1e3;
 let S = (() => {
  try {
   const s = LS.get('v28', null);
   return s && typeof s === 'object' ? s : {};
  } catch (e) {
   return {};
  }
 })();
 function fix() {
  if (!S.v) S.v = 1;
  if (!S.cequip || typeof S.cequip !== 'object' || Array.isArray(S.cequip)) S.cequip = {};
  if (!S.st || typeof S.st !== 'object') S.st = {};
 }
 fix();
 const save = () => {
  try {
   LS.set('v28', S);
  } catch (e) {
   console.error(e);
  }
 };
 const G0 = () => typeof game !== 'undefined' ? game : null;
 const scr = () => typeof screen !== 'undefined' ? screen : '';
 const OTS = {
  gleIn: 9,
  gleOut: 6,
  yMin: CREASE,
  yMax: 52,
  xBack: 6,
  mem: 1.6,
  cpuP: .55
 };
 function otsGeo(c, gx, sg) {
  const dx = (c.x - gx) * sg, dy = Math.abs(c.y - CY);
  return {
   onGle: dx >= -OTS.gleIn && dx <= OTS.gleOut && dy >= OTS.yMin && dy <= OTS.yMax,
   atX: dx > OTS.xBack && dy <= OTS.yMax
  };
 }
 function otsOk(c) {
  const G = G0();
  if (!on('ots') || !G || !c || scr() !== 'live' || G.carrier !== c || !G.ball || G.ball.state !== 'held' || c.team !== 'O') return false;
  if (window.__rl_ots28force) return true;
  const o = otsGeo(c, GX, 1), les = hf() && G.tutorial && typeof TV28 !== 'undefined' && G.tutorial.step === TV28.OTS;
  return o.onGle && c.x28X != null && (les || (G.t || 0) - c.x28X <= OTS.mem);
 }
 function otsFired(c, ox, oy) {
  const G = G0(), b = G.ball;
  c.shot20 = {
   type: 'ots',
   t0: menuT,
   one: false,
   top: !!(b.target && b.target.top),
   x: ox,
   y: oy,
   f28: -1
  };
  addFx('txt', ox, oy - 34, {
   s: 'OVER THE SHOULDER!',
   col: '#ff5ad2',
   life: .9
  });
  G.ots28 = (G.ots28 || 0) + 1;
  if (G.lastShot) G.lastShot.ots28 = true;
  c.x28X = null;
  LOG.ots.push({
   who: 'you',
   x: Math.round(ox),
   y: Math.round(oy),
   t: +(G.t || 0).toFixed(2)
  });
  try {
   tutFlag('ots28');
  } catch (e) {}
 }
 const CPU_OTS_GOAL = .33, CPU_OTS_GK = .4, CPU_OTS_PIPE = .04, CPU_OTS_WIDE = .02;
 function cpuOtsRoll284(G, c) {
  const b = G.ball, gk = G.gk2;
  if (!b || b.state !== 'shot' || !gk) return;
  let sv = 0;
  try {
   sv = typeof rf === 'function' ? rf(gk.pl, 'sav') : 0;
  } catch (e) {}
  const pG = clamp(CPU_OTS_GOAL * clamp(1 - CPU_OTS_GK * sv, .5, 1.6), 0, .9);
  const r = Math.random(), sp = Math.hypot(b.vx, b.vy) || 250, side = b.y < CY ? -1 : 1, glx = DGX + 5;
  const aim = (tx, ty) => {
   const a = Math.atan2(ty - b.y, tx - b.x);
   b.vx = Math.cos(a) * sp;
   b.vy = Math.sin(a) * sp;
   if (b.vx > -2) {
    b.vx = -2;
   }
  };
  let o;
  if (r < pG) {
   o = 'goal';
   gk.reach = .1;
  } else if (r < pG + CPU_OTS_PIPE) {
   o = 'pipe';
   aim(DGX, CY + side * (MOUTH + 1.2));
   gk.reach = .1;
  } else if (r < pG + CPU_OTS_PIPE + CPU_OTS_WIDE) {
   o = 'wide';
   aim(DGX, CY + side * (MOUTH + 7));
   gk.reach = .1;
  } else {
   o = 'save';
   const ty = clamp(gk.y, CY - MOUTH, CY + MOUTH);
   aim(glx, ty);
   gk.dive = gk.y;
   gk.react = 0;
   gk.reach = Math.max(gk.reach || 0, Math.abs(ty - gk.y) + 2.5);
  }
  b.ots284 = o;
  b.ots284p = +pG.toFixed(3);
  G.cpuOts284 = G.cpuOts284 || {};
  G.cpuOts284[o] = (G.cpuOts284[o] || 0) + 1;
 }
 function cpuOts(G, c) {
  if (!on('ots') || !on('cpu') || G.tutorial || !G.ball || G.ball.state !== 'held' || G.dcar !== c || typeof dShoot !== 'function') return false;
  const o = otsGeo(c, DGX, -1);
  if (o.atX) {
   c.x28X = G.t;
   c.ots28try = false;
   return false;
  }
  if (!o.onGle || c.x28X == null || G.t - c.x28X > OTS.mem || c.ots28try) return false;
  c.ots28try = true;
  if (!(window.__rl_ots28cpu || Math.random() < OTS.cpuP)) return false;
  const ox = c.x, oy = c.y;
  c.x = DGX + (window.__rl_no282otsspot ? 6 : 16);
  try {
   dShoot(c);
  } finally {
   c.x = ox;
  }
  if (G.ball.state !== 'shot') return false;
  if (!window.__rl_no284cpuots) try {
   cpuOtsRoll284(G, c);
  } catch (e) {
   console.error(e);
  }
  c.shot20 = {
   type: 'ots',
   t0: menuT,
   one: false,
   top: G.ball.vy < 0,
   x: ox,
   y: oy,
   f28: 1
  };
  addFx('txt', ox, oy - 34, {
   s: 'OVER THE SHOULDER!',
   col: '#ff9a8a',
   life: .9
  });
  G.cpuOts28 = (G.cpuOts28 || 0) + 1;
  c.x28X = null;
  LOG.ots.push({
   who: 'cpu',
   x: Math.round(ox),
   y: Math.round(oy),
   t: +G.t.toFixed(2)
  });
  return true;
 }
 const DUR28 = {
  swim: .4,
  toe: .38
 };
 function cpuDodge(c, onb) {
  const G = G0();
  if (!G || !c || !on('moves') || !on('cpu') || G.tutorial) return;
  const f = window.__rl_cpu28force;
  if (!(f || Math.random() < .4)) return;
  const kind = f === 'swim' || f === 'toe' ? f : Math.random() < .5 ? 'swim' : 'toe';
  const tg = c.tgt || [ c.x - 20, c.y ], dx = tg[0] - c.x, dy = tg[1] - c.y, L = Math.hypot(dx, dy) || 1;
  c.dodgeA = {
   kind: kind,
   t: 0,
   dur: DUR28[kind],
   from: c.hand === -1 ? -1 : 1,
   vx: dx / L,
   vy: dy / L,
   side: c.hand === -1 ? -1 : 1,
   cpu28: true
  };
  if (typeof on286s === 'function' && on286s() && typeof step286 === 'function') {
   const sg = Math.abs(dy) > .5 ? Math.sign(dy) : c.y > CY ? -1 : 1, cage = [ DGX, CY ], f = [ cage[0] - c.x, cage[1] - c.y ];
   const fl = Math.hypot(f[0], f[1]) || 1, px = -f[1] / fl, py = f[0] / fl, s = px * 0 + py * sg >= 0 ? [ px, py ] : [ -px, -py ];
   Object.assign(c.dodgeA, step286(c, s[0], s[1], [ f[0] / fl, f[1] / fl ], cage));
   c.dodgeA.dur = STEP286.dur;
  }
  addFx('txt', c.x, c.y - 34, {
   s: kind === 'swim' ? 'SWIM MOVE!' : 'TOE DRAG!',
   col: '#ff9a8a',
   life: .7
  });
  if (onb) {
   if (onb !== G.dctl) onb.stun = Math.max(onb.stun || 0, .3);
   c.beatT = Math.max(c.beatT || 0, .45);
   G.dBeat = Math.max(G.dBeat || 0, .45);
  }
  if (onb && kind === 'swim' && typeof tripTry286 === 'function') {
   try {
    if (tripTry286(c, onb)) {
     G.dBeat = Math.max(G.dBeat || 0, .9);
     c.beatT = Math.max(c.beatT || 0, .9);
    }
   } catch (e) {
    console.error(e);
   }
  }
  G['cpu' + (kind === 'swim' ? 'Swims' : 'Toes') + '28'] = (G['cpu' + (kind === 'swim' ? 'Swims' : 'Toes') + '28'] || 0) + 1;
  LOG.cpu.push({
   kind: kind,
   t: +(G.t || 0).toFixed(2)
  });
 }
 const viewSeen = new Map;
 function tick(dt) {
  const G = G0();
  if (!G || !G.players) return;
  for (const p of G.players) {
   const A = p.dodgeA;
   if (A && A.cpu28) {
    A.t += dt;
    if (A.k286 && typeof pos286 === 'function') {
     const q = pos286(A, A.t / A.dur);
     p.x = q[0];
     p.y = Math.max(FT + 4, Math.min(FB - 4, q[1]));
    }
    if (A.t >= A.dur) p.dodgeA = null;
   }
  }
  if (scr() === 'live' && G.carrier && G.ball && G.ball.state === 'held') {
   const c = G.carrier;
   if (otsGeo(c, GX, 1).atX) c.x28X = G.t;
  }
  if (scr() === 'defense' && G.dcar && G.ball && G.ball.state === 'held') cpuOts(G, G.dcar);
 }
 function viewTick() {
  const G = G0();
  if (!G || !G.players) return;
  if (on('ots') && window.RLNET && RLNET.inGame && !RLNET.auth && typeof fx !== 'undefined') {
   for (const f of fx) {
    if (f.type !== 'txt' || f.s !== 'OVER THE SHOULDER!') continue;
    const key = Math.round(f.x / 8) + '|' + Math.round(f.y / 8), seen = viewSeen.get(key);
    if (seen != null && menuT - seen < 1.5) continue;
    viewSeen.set(key, menuT);
    let best = null, bd = 30;
    for (const p of G.players) {
     const d = Math.hypot(p.x - f.x, p.y - (f.y + 34));
     if (d < bd) {
      bd = d;
      best = p;
     }
    }
    if (best && !(best.shot20 && best.shot20.type === 'ots' && menuT - best.shot20.t0 < .6)) {
     best.shot20 = {
      type: 'ots',
      t0: menuT - Math.min(.3, f.t || 0),
      one: false,
      top: true,
      x: best.x,
      y: best.y,
      f28: best.x < MIDX ? 1 : -1
     };
     G.viewOts28 = (G.viewOts28 || 0) + 1;
    }
   }
  }
 }
 if (!S.m28) {
  let td = false;
  try {
   td = !!LS.get('tutDone', false);
  } catch (e) {}
  S.m28 = td ? 'need' : 'new';
  save();
 }
 const hf = () => !window.__rl_no283drill;
 const DONE283 = 'rl283m28done';
 function done283(why) {
  if (S.m28 !== 'done') {
   S.m28 = 'done';
   S.m28at = Date.now();
  }
  S.m28why = S.m28why || why;
  save();
  try {
   localStorage.setItem(DONE283, '1');
  } catch (e) {}
 }
 if (hf() && S.m28 !== 'done') {
  let sticky = false;
  try {
   sticky = localStorage.getItem(DONE283) === '1';
  } catch (e) {}
  const reps = S.m28reps || {};
  if (sticky) done283('sticky'); else if (S.m28 === 'need' && (reps.swim && reps.toe && reps.roll && reps.ots || reps.ots || (S.m28opens || 0) >= 2 || S.m28auto)) done283('unstuck');
 } else if (hf() && S.m28 === 'done') {
  try {
   localStorage.setItem(DONE283, '1');
  } catch (e) {}
 }
 const skipOk283 = () => {
  const G = G0(), Tt = G && G.tutorial;
  return hf() && !!Tt && Tt.track === 'm28' && ((S.m28opens || 0) >= 2 || Tt.at283 && rt() - Tt.at283 >= 60);
 };
 const drillNeed = () => on('drill') && !window.__rl_skip26 && !window.__rl_skip28 && S.m28 === 'need';
 function tutSetup(s) {
  if (typeof TV28 === 'undefined' || s < TV28.SWIM || s > TV28.OTS) return false;
  const G = G0();
  setupPossession(GX - 130, CY);
  G.run = null;
  if (s === TV28.OTS) {
   const c = G.carrier;
   if (!c) return true;
   c.x = GX + 18;
   c.y = CY - 28;
   c.tx = c.x;
   c.ty = c.y;
   c.x28X = G.t;
   for (const d of G.players) if (d.team === 'D' && !d.gk && Math.hypot(d.x - c.x, d.y - c.y) < 45) {
    d.x -= 45;
    d.react = 2.5;
   }
   G.tut28gle = {
    x: GX - 1,
    y: CY - 28
   };
  } else G.tut28gle = null;
  LOG.tut.push(s);
  return true;
 }
 function tutDone(i) {
  const G = G0(), f = G && G.tutorial && G.tutorial.f;
  if (!f) return false;
  const k = {
   [TV28.SWIM]: 'swim',
   [TV28.TOE]: 'toe',
   [TV28.ROLL]: 'roll',
   [TV28.OTS]: 'ots'
  }[i];
  const ok = !!{
   [TV28.SWIM]: f.swim28,
   [TV28.TOE]: f.toe28,
   [TV28.ROLL]: f.roll,
   [TV28.OTS]: f.ots28
  }[i];
  if (ok && k && hf() && G.tutorial.track === 'm28') {
   const r = S.m28reps = S.m28reps || {};
   if (!r[k]) {
    r[k] = 1;
    save();
   }
   if (k === 'ots' || r.swim && r.toe && r.roll && r.ots) done283('reps');
  }
  return ok;
 }
 function tutComplete(tr) {
  if (tr === 'm28' || tr === 'main') {
   if (S.m28 !== 'done') {
    S.m28 = 'done';
    S.m28at = Date.now();
    save();
   }
   if (hf()) {
    done283(tr);
    if (tr === 'm28') try {
     menuMsg = {
      s: 'NEW MOVES DONE - YOU CAN PLAY',
      t: 2.5
     };
    } catch (e) {}
   }
  }
 }
 if (window.V20) {
  const V = window.V20, PLAY28 = [ 'QUICK GAME', 'ONLINE', 'SEASON', 'CONTINUE SEASON', 'PLAY SEASON', 'PLAY WORLD GAMES', 'WORLD GAMES', 'PRACTICE', 'PLAY QUICK MATCH', 'COLLEGE LAX' ];
  const ns0 = V.noSkip;
  V.noSkip = tr => tr === 'm28' && !skipOk283() || ns0(tr);
  if (typeof window.startTutorial === 'function') {
   const st0 = window.startTutorial;
   window.startTutorial = function(tr) {
    if (tr === 'm28' && hf()) {
     S.m28opens = (S.m28opens || 0) + 1;
     save();
     if (S.m28opens >= 3) {
      done283('opens');
      menuMsg = {
       s: 'NEW MOVES DONE - YOU CAN PLAY',
       t: 2.5
      };
      return;
     }
    }
    const r = st0.apply(this, arguments);
    try {
     if (tr === 'm28' && game && game.tutorial) game.tutorial.at283 = rt();
    } catch (e) {}
    return r;
   };
  }
  if (typeof window.tutSkip === 'function') {
   const sk0 = window.tutSkip;
   window.tutSkip = function() {
    const G = G0(), Tt = G && G.tutorial;
    if (Tt && Tt.track === 'm28' && hf() && !Tt.complete) {
     done283('skip');
     Tt.doneT = 0;
     Tt.step = TUTX.length + 1;
     shootP = null;
     stick = null;
     return tutSetup();
    }
    return sk0.apply(this, arguments);
   };
  }
  const gr0 = V.gateRows;
  V.gateRows = function(rows) {
   gr0.apply(this, arguments);
   for (const r of rows) for (const e of r) if (PLAY28.includes(e.label)) {
    const fn = e.fn;
    e.fn = () => {
     if (!drillNeed()) return fn();
     try {
      SFX.bad && SFX.bad();
     } catch (x) {}
     menuMsg = {
      s: 'PLAY THE NEW MOVES TUTORIAL FIRST',
      t: 2
     };
     startTutorial('m28');
    };
   }
  };
  let autoAt = 0;
  const dh0 = V.drawHome;
  V.drawHome = function(bars, modal) {
   const r = dh0.apply(this, arguments);
   try {
    if (drillNeed() && !modal && scr() === 'menu' && !G0() && (typeof tutAsk === 'undefined' || !tutAsk) && !(window.TUT26 && (TUT26.need() || TUT26.active())) && (!window.V27 || V27.menuFree27())) {
     if (!autoAt) autoAt = rt(); else if (rt() - autoAt > .8 && !S.m28auto && !window.__rl_skip28auto) {
      S.m28auto = 1;
      save();
      menuMsg = {
       s: 'NEW MOVES IN V28 - QUICK LESSON',
       t: 2
      };
      startTutorial('m28');
     }
     const b = (bars || []).find(q => q.label === 'QUICK GAME' || q.label === 'PLAY QUICK MATCH');
     if (b && S.m28auto) {
      const s = 'NEW MOVES LESSON FIRST', w = textW(s) + 8;
      rect(Math.round(b.x + b.w / 2 - w / 2), 20, w, 9, 'rgba(0,0,0,.8)');
      text(s, Math.round(b.x + b.w / 2), 22, 1, '#ffe14d', 'center');
     }
    } else autoAt = 0;
   } catch (e) {
    console.error(e);
   }
   return r;
  };
  const dw0 = V.drawWorld;
  V.drawWorld = function() {
   const r = dw0.apply(this, arguments);
   try {
    const G = G0();
    if (G && G.tutorial && G.tut28gle && typeof TV28 !== 'undefined' && G.tutorial.step === TV28.OTS && !G.tutorial.f.ots28) {
     const q = G.tut28gle, a = .5 + .4 * Math.sin(menuT * 6);
     g.globalAlpha = a;
     for (let i = 0; i < 16; i++) {
      const t = i / 16 * 6.283;
      px(Math.round(q.x + Math.cos(t) * 7), Math.round(q.y + Math.sin(t) * 4), '#ff5ad2');
     }
     g.globalAlpha = 1;
     text('GLE', q.x, q.y - 16, 1, '#ff5ad2', 'center', '#000');
     for (let x = Math.round(q.x); x < GX + 30; x += 4) px(x, Math.round(q.y) + 6, 'rgba(255,90,210,.6)');
    }
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 function helpPages() {
  if (!on('help')) return [];
  const out = [];
  if (on('moves') || on('ots')) out.push([ 'moves28', 'NEW MOVES (V28)', [ 'SPLIT DODGE: WITH THE BALL, SWIPE STRAIGHT ON THE RIGHT SIDE = SPLIT THAT WAY (THE STICK SWITCHES HANDS).', 'SWIM MOVE: DRAW A BACKWARDS C ON THE RIGHT SIDE. HIS STICK ARM COMES OVER THE TOP OF THE DEFENDER\'S HEAD AND HE SLIPS BY - SAME HAND. GETS YOU A STEP ON YOUR MAN.', 'TOE DRAG: DRAW A C ON THE RIGHT SIDE. HE PULLS THE BALL ACROSS HIS TOES AND GOES - SAME HAND. GETS YOU A STEP ON YOUR MAN.', 'ROLL DODGE: LEFT STICK ONLY NOW - RUN, THEN DRAW A C WITH YOUR LEFT THUMB. (A CURVE ON THE RIGHT SIDE IS A SWIM OR A TOE DRAG.)', 'OVER THE SHOULDER: CARRY IT UP FROM X (BEHIND THE CAGE) TO GLE (BESIDE THE CAGE), THEN TOUCH THE GOAL AND PULL BACK LIKE ANY SHOT. HE SHOOTS OVER HIS SHOULDER WITHOUT SQUARING UP - SAME ACCURACY AS A NORMAL SHOT FROM THERE.', 'THE CPU (AND YOUR FRIEND ONLINE) CAN DO ALL OF THEM TOO.' ] ]);
  if (on('loadout')) out.push([ 'load28', 'PLAYER CARD LOADOUTS', [ 'LOCKER ROOM > PLAYERS: TAP A PLAYER CARD, THEN TAP TO EQUIP ITEMS. PUT YOUR GEAR (HELMET, VISOR, COLLAR, CHEST, SHORTS, CLEATS, STICK, TAPE, CELLY) ON THAT CARD.', 'WHEN THE CARD PLAYS (QUICK PLAY + ONLINE, AS HIS TEAM OR SUBBED INTO YOUR LINEUP) HE WEARS THEM.', 'AN ITEM ON A CARD IS LOCKED TO HIM UNTIL YOU TAKE IT OFF. OWN 2 COPIES = 2 PLAYERS CAN WEAR IT. THE ITEM\'S INFO SAYS WHICH CARD HAS IT.' ] ]);
  if (on('drops')) out.push([ 'drop28', 'CARD DROPS', [ 'AFTER A QUICK PLAY OR ONLINE GAME (WIN OR LOSE) THERE IS A 50% CHANCE OF A NEW CARD: A RANDOM PLAYER FROM THE TEAM YOU PLAYED AS.', '80% COMMON, 20% RARE. A CARD YOU ALREADY HAVE = CHINOS. IT SHOWS ON THE FINAL SCREEN (NEW CARD!).' ] ]);
  if (on('stadiums')) out.push([ 'st28', 'STADIUMS', [ 'BEFORE A QUICK GAME OR AN ONLINE GAME: CHOOSE STADIUM. YOUR TEAM\'S HOME OR THEIR HOME (THAT TEAM IS THE HOME TEAM), OR OTHER = A STADIUM YOU OWN.', 'EVERY TEAM\'S HOME STADIUM IS FREE. SPECIAL STADIUMS LIVE IN THE LOCKER ROOM (STADIUMS TAB).', 'BAGGA LAX CHAMPIONSHIP STADIUM: WIN ANY TITLE. NEW ORLEANS GHOSTS HALLOWEEN STADIUM: OWN THE HALLOWEEN PACK (ALWAYS NIGHT, FOG, MORE INJURIES, THE ZOMBIE HAND). NEITHER IS EVER IN PACKS.', 'IN CARD PACKS: BEACH, UNDERWATER + CLOUD STADIUMS (RARE), MOON + UNDERWORLD STADIUMS (LEGENDARY). EACH ONE HAS ITS OWN INJURY ANIMATION AND THE BRIGHTEST BALL WE COULD MAKE.', 'ONLINE: THE HOME TEAM PICKS THE STADIUM (THEIR OWN SPECIAL STADIUMS UNDER OTHER).' ] ]);
  return out;
 }
 if (typeof drawHelp === 'function') {
  wrapG('drawHelp', function(o, a) {
   const r = o.apply(this, a);
   try {
    if (on('help') && (on('moves') || on('ots')) && window.V17 && V17.openHelp17) button('NEW MOVES', W / 2 - 124, H - 26, 76, 20, () => V17.openHelp17('moves28'), {
     bg: '#ff5ad2'
    });
   } catch (e) {
    console.error(e);
   }
   return r;
  });
 }
 const SLOTS28 = [ 'helmet', 'visor', 'collar', 'chest', 'legs', 'cleats', 'stick', 'tape', 'celly' ];
 const owns = pid => !!(window.V22 && V22.on() && V22.owned(pid)) || !!(window.V361 && V361.legOwns(pid));
 function known35(pid) {
  if (PP(pid)) return true;
  try {
   if (window.HON25 && HON25.kindOf && HON25.kindOf(pid) && HON25.make) HON25.make(pid);
  } catch (e) {}
  try {
   if (window.ULT331 && ULT331.isU && ULT331.isU(pid) && ULT331.make) ULT331.make(pid);
  } catch (e) {}
  if (PP(pid)) return true;
  try {
   const c = window.V22 && V22.on && V22.on() && V22.st ? V22.st().cards : null;
   return !!(c && c[pid]);
  } catch (e) {
   return false;
  }
 }
 function sanitize() {
  if (!window.V17 || !V17.BY || !V17.ST) return;
  const BY = V17.BY, ST = V17.ST();
  let ch = false;
  for (const pid of Object.keys(S.cequip)) {
   const e = S.cequip[pid];
   if (!e || typeof e !== 'object' || (window.__rl_no35gear ? !PP(pid) : !known35(pid))) {
    delete S.cequip[pid];
    ch = true;
    continue;
   }
   for (const k of Object.keys(e)) if (!SLOTS28.includes(k) || !BY[e[k]]) {
    delete e[k];
    ch = true;
   }
  }
  try {
   for (const id of new Set([].concat(...Object.values(S.cequip).map(e => Object.values(e))))) {
    let over = V17.inUse(id) - (ST.inv[id] || 0);
    for (const pid of Object.keys(S.cequip).reverse()) {
     if (over <= 0) break;
     const e = S.cequip[pid];
     for (const k of Object.keys(e)) if (over > 0 && e[k] === id) {
      delete e[k];
      over--;
      ch = true;
     }
    }
   }
  } catch (e) {
   console.error(e);
  }
  for (const pid of Object.keys(S.cequip)) if (!Object.keys(S.cequip[pid]).length) {
   delete S.cequip[pid];
   ch = true;
  }
  if (ch) save();
 }
 const cardStore = () => on('loadout') ? S.cequip : {};
 function cardGear(pid) {
  if (!on('loadout') || !owns(pid)) return null;
  const e = S.cequip[pid];
  return e && Object.keys(e).length ? e : null;
 }
 function extraIds(ids) {
  if (!on('loadout')) return [];
  let lu = null;
  const G = G0(), R = window.RLNET;
  try {
   if (G && G.lu && G.lu[0] && !G.tutorial) lu = G.lu[0]; else if (R && R.lobby && R.lobby.state && scr() === 'onLobby') lu = R.lobby.state[R.side === 'h' ? 'hlu' : 'glu'];
  } catch (e) {}
  if (!lu) return [];
  const L = [ ...lu.A || [], ...lu.M || [], ...lu.D || [], lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ].filter(Boolean);
  return L.filter(id => !ids.includes(id) && cardGear(id));
 }
 function holders(id) {
  const out = [];
  for (const pid in S.cequip) {
   const e = S.cequip[pid];
   for (const k in e) if (e[k] === id) out.push(pid);
  }
  return out;
 }
 function cardName(pid) {
  const p = PP(pid), t = T(p && p.team);
  return (p ? lastName(p) : pid) + (t ? ' (' + String(t.abbr || t.name || t.id).toUpperCase() + ')' : '');
 }
 function onCardsTxt(id) {
  if (!on('loadout')) return '';
  const h = holders(id);
  return h.length ? ' (ON ' + h.slice(0, 2).map(cardName).join(', ') + (h.length > 2 ? ' +' + (h.length - 2) : '') + ')' : '';
 }
 const esc28 = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 function onCardsHtml(id) {
  if (!on('loadout')) return '';
  const h = holders(id);
  return h.length ? '<span><b style="color:#ffd23a">ON PLAYER CARDS:</b> ' + esc28(h.map(cardName).join(', ')) + ' (LOCKED TO THEM UNTIL YOU TAKE IT OFF)</span>' : '';
 }
 function popLine(pid) {
  if (!on('loadout')) return '';
  const e = cardGear(pid), BY = V17.BY;
  const items = e ? SLOTS28.filter(k => e[k] && BY[e[k]]).map(k => BY[e[k]].n) : [];
  return '<span><b style="color:#ffd23a">LOADOUT:</b> ' + (items.length ? esc28(items.join(', ')) : 'NOTHING ON HIM YET') + '</span><span class="hint28" style="color:#ffe14d">TAP TO EQUIP ITEMS ON HIM - HE WEARS THEM WHENEVER HIS CARD PLAYS.</span>';
 }
 function popBtn(pid) {
  return on('loadout') && typeof btn === 'function' ? btn('TAP TO EQUIP ITEMS', 'v28equip', pid, 'y') : '';
 }
 function playersHint() {
  return on('loadout') ? '<div class="det17 hint28" style="color:#ffe14d">TAP A PLAYER CARD TO EQUIP ITEMS ON HIM.</div>' : '';
 }
 const CARD = {
  pid: null,
  back: null
 };
 const cardPid = () => scr() === 'card28' && CARD.pid || null;
 const cardTid = () => {
  const pid = cardPid(), p = pid && PP(pid);
  return p ? p.leg ? p.legTeam || 'ATL' : window.V22 && V22.teamOfCard ? V22.teamOfCard(pid) : p.team : null;
 };
 function openCard(pid) {
  if (!on('loadout') || !owns(pid)) return false;
  sanitize();
  CARD.pid = pid;
  CARD.back = scr();
  try {
   if (V17.trayClose) V17.trayClose();
  } catch (e) {}
  try {
   lobby.card = null;
  } catch (e) {}
  screen = 'card28';
  try {
   panelDirty();
  } catch (e) {}
  return true;
 }
 function closeCard() {
  const b = CARD.back || 'locker17';
  CARD.pid = null;
  CARD.back = null;
  try {
   if (V17.trayClose) V17.trayClose();
  } catch (e) {}
  screen = b;
  try {
   panelDirty();
  } catch (e) {}
 }
 function drawCard() {
  const pid = CARD.pid;
  if (!pid || !owns(pid)) {
   closeCard();
   return;
  }
  const {L: L, bx: bx, bw: bw} = lobbyBounds(), p = PP(pid), r = V22.rarOf(pid), RC = [ '#9aa3ab', '#3d8bff', '#ffcc33' ], RN = [ 'COMMON', 'RARE', 'LEGENDARY' ];
  bgStripes();
  rect(L, 0, W - L, H, 'rgba(0,0,0,.35)');
  drawLobbyLeft(L, !lobby.card);
  rect(L, 0, 2, H, '#05080b');
  const cx = bx + bw / 2;
  text('PLAYER CARD', cx, 5, 2, '#ffe14d', 'center', '#000');
  const nm = String(p.n).toUpperCase();
  text(nm, cx, 20, textW(nm, 1) > bw - 4 ? 1 : 1, '#ffffff', 'center');
  text(RN[r] + ' - OVR ' + p.ovr, cx, 29, 1, RC[r], 'center');
  const lines = [ 'TAP A BOX TO EQUIP ITEMS', 'ON HIM (OR DRAG ONE ON).', 'HE WEARS THEM WHENEVER', 'HIS CARD PLAYS: QUICK', 'PLAY + ONLINE.', 'AN ITEM ON A CARD IS', 'LOCKED TO HIM UNTIL YOU', 'TAKE IT OFF.' ];
  lines.forEach((s, i) => text(s, cx, 42 + i * 9, 1, i < 2 ? '#7dff7a' : '#cfe', 'center'));
  if (window.V17 && V17.itemFx && !V17.itemFx()) text('ITEM EFFECTS ARE OFF: LOOKS ONLY', cx, 117, 1, '#ffb14d', 'center');
  const by = H - 26 - (typeof sa2403Dy === 'function' ? sa2403Dy(H - 8, 18) : 0);
  button('DONE', Math.round(cx - 40), by, 80, 18, () => closeCard(), {
   sc: 2,
   bg: '#7dff7a'
  });
  if (window.V17) try {
   V17.drawHome(L, !!lobby.card, {
    gearOnly: true,
    kind: 'card28'
   });
  } catch (e) {
   console.error(e);
  }
  if (lobby.card) drawLobbyCard();
 }
 if (typeof PANEL_ACT !== 'undefined') PANEL_ACT.v28equip = v => {
  openCard(v);
 };
 function teamPool(tid) {
  let ros = [];
  try {
   ros = typeof SZ_REG !== 'undefined' && SZ_REG[tid] && SZ_REG[tid].roster || T(tid) && T(tid).roster || typeof WT_REG !== 'undefined' && WT_REG[tid] && WT_REG[tid].roster || [];
  } catch (e) {
   ros = [];
  }
  return [ ...new Set(ros) ].filter(id => {
   const p = PP(id);
   return p && !p.leg;
  });
 }
 function dropRoll(G) {
  if (!on('drops') || !G || G.tutorial || G.practice || G.mode === 'tutorial' || G.mode === 'practice' || !window.V22 || !V22.on() || !window.V17 || !V17.ST) return null;
  const online = !!(G.online || G.meta && G.meta.online);
  if (!(G.mode === 'quick' || online)) return null;
  if (G.drop28 !== undefined) return G.drop28;
  const f = window.__rl_drop28force || {}, r = Math.random;
  if (!(f.p != null ? f.p >= 1 || r() < f.p : r() < .5)) {
   G.drop28 = null;
   LOG.drops.push({
    none: 1
   });
   return null;
  }
  const pool = teamPool(G.user);
  if (!pool.length) {
   G.drop28 = null;
   return null;
  }
  const want = f.rar != null ? f.rar : r() < .8 ? 0 : 1, by = [ 0, 1 ].map(k => pool.filter(id => V22.rarOf(id) === k));
  const list = by[want].length ? by[want] : by[1 - want];
  if (!list.length) {
   G.drop28 = null;
   return null;
  }
  const pid = f.pid && pool.includes(f.pid) ? f.pid : list[Math.floor(r() * list.length) % list.length], rar = V22.rarOf(pid);
  const had = V22.owned(pid);
  let chinos = 0;
  if (had) {
   chinos = [ 1, 3, 15 ][rar] || 1;
   const ST = V17.ST();
   ST.chinos = (+ST.chinos || 0) + chinos;
   ST.stats.earned = (+ST.stats.earned || 0) + chinos;
   V17.save();
  } else {
   try {
    V22.grantIds([ pid ], PP(pid).team, 'CARD DROP');
   } catch (e) {
    console.error(e);
   }
  }
  G.drop28 = {
   pid: pid,
   rar: rar,
   rep: had,
   chinos: chinos,
   t0: menuT
  };
  S.drops = (S.drops || 0) + 1;
  save();
  LOG.drops.push({
   pid: pid,
   rar: rar,
   rep: had,
   chinos: chinos,
   team: G.user
  });
  return G.drop28;
 }
 if (window.V17 && V17.gameOver) {
  const go0 = V17.gameOver;
  V17.gameOver = function(G, win) {
   const r = go0.apply(this, arguments);
   try {
    dropRoll(G);
   } catch (e) {
    console.error(e);
   }
   return r;
  };
 }
 wrapG('drawFinal', function(o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0(), d = G && G.drop28;
   if (!d || !on('drops')) return r;
   const p = PP(d.pid), RC = [ '#9aa3ab', '#3d8bff', '#ffcc33' ], RN = [ 'COMMON', 'RARE', 'LEGENDARY' ], e = menuT - d.t0, pop = Math.min(1, e / .35);
   const w = Math.min(232, W - 12), x = Math.round(W / 2 - w / 2), y = 144, h = 24;
   rect(x - 1, y - 1, w + 2, h + 2, RC[d.rar]);
   rect(x, y, w, h, '#0b141c');
   try {
    const cv = V22.artCanvas(d.pid, V22.teamOfCard(d.pid));
    if (cv) {
     const s = Math.round(20 * pop);
     g.drawImage(cv, x + 3 + Math.round((20 - s) / 2), y + 2 + Math.round((20 - s) / 2), s, s);
    }
   } catch (er) {}
   const blink = Math.floor(menuT * 4) % 2 === 0 || e > 2;
   text(d.rep ? 'CARD DROP!' : 'NEW CARD!', x + 28, y + 3, 1, blink ? '#ffe14d' : '#ffffff');
   text((String(p.n).toUpperCase() + ' - ' + RN[d.rar]).slice(0, Math.max(10, Math.floor((w - 32) / 4))), x + 28, y + 13, 1, RC[d.rar]);
   if (d.rep) text('ALREADY HAD HIM: +' + d.chinos, x + w - 3, y + 3, 1, '#7dff7a', 'right');
   if (G) G.drop28Drawn = (G.drop28Drawn || 0) + 1;
  } catch (er) {
   console.error(er);
  }
  return r;
 });
 const ST28 = [ {
  k: 'champ',
  id: 'st28_champ',
  n: 'BAGGA LAX CHAMPIONSHIP STADIUM',
  rar: 2,
  how: 'WIN ANY TITLE (ANY MODE).',
  d: 'THE GOLD STADIUM THE FINALS ARE PLAYED IN.'
 }, {
  k: 'gho',
  id: 'st28_gho',
  n: 'NEW ORLEANS GHOSTS HALLOWEEN STADIUM',
  rar: 2,
  how: 'OWN THE HALLOWEEN PACK.',
  d: 'ALWAYS NIGHT, FOG, MORE INJURIES + THE ZOMBIE HAND.'
 }, {
  k: 'moon',
  id: 'st28_moon',
  n: 'MOON STADIUM',
  rar: 2,
  pack: 1,
  d: 'ON THE MOON: SPACE SKY, GRAY FIELD, SPACE STATION BLEACHERS. INJURED PLAYERS FLOAT AWAY. BRIGHT YELLOW BALL.'
 }, {
  k: 'hell',
  id: 'st28_hell',
  n: 'UNDERWORLD STADIUM',
  rar: 2,
  pack: 1,
  d: 'LAVA EDGES, FIRE IN THE STANDS. INJURED PLAYERS GET DRAGGED AWAY BY A DEMON.'
 }, {
  k: 'beach',
  id: 'st28_beach',
  n: 'BEACH STADIUM',
  rar: 1,
  pack: 1,
  d: 'THE OCEAN RIGHT THERE, SAND STANDS, THE CROWD STANDING IN BATHING SUITS. INJURED PLAYERS GET TAKEN UNDER BY THE SAND.'
 }, {
  k: 'under',
  id: 'st28_under',
  n: 'UNDERWATER STADIUM',
  rar: 1,
  pack: 1,
  d: 'ON THE SEA FLOOR: CORAL STANDS, FISH, BUBBLES. INJURED PLAYERS FLOAT UP IN A BUBBLE.'
 }, {
  k: 'cloud',
  id: 'st28_cloud',
  n: 'CLOUD STADIUM',
  rar: 1,
  pack: 1,
  d: 'UP ON THE CLOUDS, SKY STANDS. INJURED PLAYERS FALL THROUGH THE CLOUDS.'
 } ];
 const STK = {};
 for (const s of ST28) STK[s.k] = s;
 const stOf = id => ST28.find(s => s.id === id || s.k === id) || null;
 function addItems() {
  if (!on('stadiums') || !window.V17 || !V17.BY || !V17.I) return;
  for (const s of ST28) if (!V17.BY[s.id]) {
   const it = {
    id: s.id,
    n: s.n,
    sec: 'st28',
    rar: s.rar,
    art: 'st28',
    st28: s.k,
    d: 'STADIUM: ' + s.d + (s.how ? ' HOW: ' + s.how + ' NEVER IN PACKS.' : ' FOUND IN CARD PACKS.')
   };
   V17.BY[s.id] = it;
   V17.I.push(it);
  }
  try {
   if (V17.SECS && !V17.SECS.some(q => q[0] === 'st28')) V17.SECS.push([ 'st28', 'STADIUMS' ]);
  } catch (e) {}
 }
 addItems();
 const ownSt = k => {
  const s = STK[k];
  try {
   return !!(s && V17.ST().inv[s.id] > 0);
  } catch (e) {
   return false;
  }
 };
 const owned28 = () => ST28.filter(s => ownSt(s.k)).map(s => s.k);
 function grantSt(k, why) {
  const s = STK[k];
  if (!s || ownSt(k)) return false;
  const ST = V17.ST();
  ST.inv[s.id] = 1;
  ST.seen[s.id] = true;
  V17.save();
  S.st[k] = {
   at: Date.now(),
   w: why || ''
  };
  save();
  LOG.st.push({
   k: k,
   why: why
  });
  return true;
 }
 const pendC = [], t0Load = rt();
 function claimSt(k, head, sub) {
  pendC.push({
   k: k,
   head: head,
   sub: sub
  });
 }
 function flushClaims(now) {
  if (!pendC.length || !now && rt() - t0Load < 2.5 || !window.V27 || !V27.queue) return;
  while (pendC.length) {
   const c = pendC.shift(), grp = {
    label: 'NEW STADIUM: PICK IT UNDER CHOOSE STADIUM > OTHER',
    tiles: [ {
     img: (() => {
      try {
       return V17.iconUrl(STK[c.k].id);
      } catch (e) {
       return '';
      }
     })(),
     n: STK[c.k].n,
     sub: 'LOCKER ROOM > STADIUMS',
     col: '#ffcc33'
    } ]
   };
   try {
    const a = V27.claims();
    if (a.length && !document.getElementById('c27')) {
     a[a.length - 1].groups = (a[a.length - 1].groups || []).concat([ grp ]);
     LS.set('v27claims', a);
     LOG.st.push({
      merged: c.k,
      into: a[a.length - 1].id
     });
    } else V27.queue({
     id: 'st28_' + c.k + '_' + Date.now(),
     head: c.head,
     sub: c.sub,
     col: '#ffcc33',
     groups: [ grp ]
    });
   } catch (e) {
    console.error(e);
   }
  }
 }
 function titleWon() {
  try {
   const ST = V17.ST();
   if (ST.trophies && Object.keys(ST.trophies).some(k => ST.trophies[k])) return true;
  } catch (e) {}
  try {
   if ((+LS.get('titles', 0) || 0) > 0 || (+LS.get('wgTitles', 0) || 0) > 0) return true;
  } catch (e) {}
  return false;
 }
 let lastUnlock = 0;
 function unlockTick(force) {
  if (!on('stadiums') || !window.V17 || !V17.ST) return;
  const t = rt();
  if (!force && t - lastUnlock < 1.5) return;
  lastUnlock = t;
  if (!ownSt('champ') && titleWon() && grantSt('champ', 'TITLE')) claimSt('champ', 'NEW STADIUM!', 'YOU WON A TITLE: THE BAGGA LAX CHAMPIONSHIP STADIUM IS YOURS. PICK IT UNDER CHOOSE STADIUM > OTHER.');
  let hw = false;
  try {
   hw = !!(V17.hw16 && V17.hw16.owned());
  } catch (e) {}
  if (!ownSt('gho') && hw && grantSt('gho', 'HALLOWEEN PACK')) claimSt('gho', 'NEW STADIUM!', 'YOU OWN THE HALLOWEEN PACK: THE NEW ORLEANS GHOSTS HALLOWEEN STADIUM IS YOURS. PICK IT UNDER CHOOSE STADIUM > OTHER.');
 }
 const STP = {
  1: .04,
  2: .08
 };
 function packStadiums(kind, cards, r) {
  if (!on('stadiums') || !Array.isArray(cards) || kind === 'halloween') return 0;
  r = r || Math.random;
  let n = 0;
  const BY = V17.BY, force = window.__rl_st28force;
  for (let i = 0; i < cards.length; i++) {
   const it = BY[cards[i]];
   if (!it || it.pc27 || it.st28 || !(it.rar >= 1)) continue;
   const left = ST28.filter(s => s.pack && s.rar === it.rar && !ownSt(s.k) && !cards.includes(s.id));
   if (!left.length) continue;
   if (!(force ? force[it.rar] : r() < STP[it.rar])) continue;
   cards[i] = left[Math.floor(r() * left.length) % left.length].id;
   n++;
   LOG.st.push({
    pack: kind,
    id: cards[i],
    slot: i
   });
  }
  return n;
 }
 const PAL = {
  champ: {
   sky: '#17120a',
   st: [ '#ffcc33', '#ffffff', '#c9961a' ],
   f: [ '#3f9a40', '#45a446' ],
   b: '#ffcc33'
  },
  gho: {
   sky: '#0c0a14',
   st: [ '#ff7a1a', '#9b4dff', '#2a2a2a' ],
   f: [ '#2f6a34', '#337238' ],
   b: '#ff7a1a'
  },
  moon: {
   sky: '#03030a',
   st: [ '#c9ced6', '#7d8590', '#ffffff' ],
   f: [ '#8d9196', '#999da2' ],
   b: '#5a6068'
  },
  hell: {
   sky: '#1a0303',
   st: [ '#ff4a1a', '#ffb000', '#5a0a0a' ],
   f: [ '#3a1410', '#421814' ],
   b: '#ff3b1a'
  },
  beach: {
   sky: '#58b7e8',
   st: [ '#f0c090', '#ff4a8a', '#ffe14d' ],
   f: [ '#e8cf8a', '#e2c77e' ],
   b: '#2a8fd4'
  },
  under: {
   sky: '#06345a',
   st: [ '#ff7a8a', '#ffb14d', '#7dffd8' ],
   f: [ '#1d6a78', '#217282' ],
   b: '#0e4c78'
  },
  cloud: {
   sky: '#8fd0ff',
   st: [ '#ffffff', '#e6f2ff', '#cfe4f7' ],
   f: [ '#e6f0fa', '#dbe8f5' ],
   b: '#ffffff'
  }
 };
 function icon(it, sil) {
  const k = it.st28, P = PAL[k];
  if (!P) return null;
  const c = document.createElement('canvas');
  c.width = 20;
  c.height = 20;
  const x = c.getContext('2d');
  const R = (a, b, w, h, col) => {
   x.fillStyle = col;
   x.fillRect(a, b, w, h);
  };
  if (sil) {
   R(2, 4, 16, 12, '#000');
   R(0, 9, 20, 7, '#000');
   return c;
  }
  R(0, 0, 20, 8, P.sky);
  if (k === 'moon' || k === 'gho' || k === 'hell') for (let i = 0; i < 9; i++) R(i * 7 % 20, i * 3 % 7, 1, 1, k === 'hell' ? '#ff7a1a' : '#ffffff');
  if (k === 'moon') {
   R(14, 1, 4, 4, '#3d8bff');
   R(15, 2, 2, 1, '#7dff7a');
  }
  if (k === 'beach') {
   R(0, 5, 20, 3, '#1f7fd0');
   R(0, 5, 20, 1, '#bfe8ff');
  }
  if (k === 'cloud') {
   R(1, 4, 6, 3, '#fff');
   R(12, 2, 6, 3, '#fff');
  }
  if (k === 'under') {
   R(3, 2, 1, 1, '#bfefff');
   R(15, 4, 1, 1, '#bfefff');
   R(8, 1, 3, 2, '#ffb14d');
  }
  for (let i = 0; i < 20; i++) R(i, 8 + i % 2, 1, 2, P.st[i % 3]);
  R(0, 11, 20, 9, P.f[0]);
  for (let i = 0; i < 20; i += 4) R(i, 11, 2, 9, P.f[1]);
  R(0, 11, 20, 1, '#e9f6e9');
  R(10, 11, 1, 9, '#e9f6e9');
  R(0, 19, 20, 1, P.b);
  if (k === 'hell') {
   R(0, 11, 20, 1, '#ff6a1a');
   R(0, 18, 20, 1, '#ff6a1a');
  }
  if (k === 'champ') {
   R(7, 14, 7, 2, '#ffcc33');
  }
  if (k === 'gho') {
   R(4, 13, 3, 3, '#ff7a1a');
   R(5, 14, 1, 1, '#000');
   R(14, 13, 2, 4, '#9aa0aa');
  }
  R(15, 15, 2, 2, BALL[k] ? BALL[k].c : '#fff');
  return c;
 }
 const BALL = {
  moon: {
   c: '#ffe600',
   o: '#000000',
   g: 'rgba(255,230,0,.55)'
  },
  hell: {
   c: '#7dfcff',
   o: '#000000',
   g: 'rgba(125,252,255,.55)'
  },
  beach: {
   c: '#ff2fa0',
   o: '#000000',
   g: 'rgba(255,47,160,.5)'
  },
  under: {
   c: '#ffe600',
   o: '#000000',
   g: 'rgba(255,240,80,.6)'
  },
  cloud: {
   c: '#ff3b1a',
   o: '#000000',
   g: 'rgba(255,59,26,.5)'
  },
  champ: {
   c: '#ffffff',
   o: '#000000',
   g: 'rgba(255,255,255,.45)'
  },
  gho: {
   c: '#b6ff3a',
   o: '#000000',
   g: 'rgba(182,255,58,.55)'
  }
 };
 const stNow = () => {
  const G = G0();
  return on('stadiums') && G && G.st28 && STK[G.st28] ? G.st28 : null;
 };
 const special = () => {
  const k = stNow();
  return k && k !== 'champ' && k !== 'gho' ? k : null;
 };
 const stGho = () => stNow() === 'gho' && !!(window.GHO16 && GHO16.on());
 if (window.GHO16 && GHO16.injOn) {
  const io0 = GHO16.injOn;
  GHO16.injOn = function(G) {
   if (io0.apply(this, arguments)) return true;
   return !!(G && G === G0() && (stGho() || special()) && G.mode !== 'season' && G.mode !== 'world' && !G.tutorial && !G.practice && !(window.RLNET && RLNET.inGame && !RLNET.auth));
  };
 }
 wrapG('newGame', function(o, a) {
  const r = o.apply(this, a);
  try {
   const G = G0();
   if (!G || !on('stadiums')) return r;
   const mode = a[2], meta = a[4] || {}, online = !!meta.online;
   let k = null, home = null;
   const sg286 = online && !window.__rl_no286stadmodes && !window.__rl_v124gb && window.RLNET && RLNET.st && !!RLNET.st.season;
   if (online && window.RLNET && RLNET.st && !sg286) {
    const s28 = RLNET.st.settings && RLNET.st.settings.st28, host = RLNET.side === 'h';
    if (s28 === 'g') home = host ? G.opp : G.user; else if (s28 && STK[s28]) k = s28;
   } else if (mode === 'quick' && !G.tutorial && menuSel.st28 && STK[menuSel.st28] && ownSt(menuSel.st28)) k = menuSel.st28;
   if (home) G.st28home = home;
   if (k) {
    G.st28 = k;
    if (k === 'champ') G.final232 = true;
    if (k === 'gho' && window.GHO16 && GHO16.on()) G.night = true;
   }
   G.st28log = {
    k: k,
    home: home
   };
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 function crowd(pal, standing) {
  const G = G0(), t = G ? G.t : menuT, loud = G && G.crowd > 0;
  for (let i = 0; i < CROWD.length; i++) {
   const p = CROWD[i];
   for (let rep = 0; rep < 2; rep++) {
    const x = p.x + rep * 530 - 6, hop = loud && Math.floor(t * 10 + p.ph) % 2 ? 1 : 0, y = 19 + p.row * 4 - hop;
    if (standing) {
     rect(x, y - 1, 2, 1, '#f0c090');
     rect(x, y, 2, 2, pal[p.k % pal.length]);
     px(x, y + 2, '#f0c090');
    } else {
     rect(x, y, 2, 2, pal[p.k % pal.length]);
     px(x, y + 2, '#0c0f14');
    }
   }
  }
 }
 function boards(col, txt, tc) {
  rect(0, FB + 1, FL, H - FB, col);
  rect(0, FB + 1, FL, 1, 'rgba(0,0,0,.35)');
  for (let x = 10; x < FL; x += 100) text(txt, x, FB + 3, 1, tc);
 }
 function stands(k) {
  const G = G0(), t = G ? G.t : menuT;
  if (k === 'moon') {
   rect(0, 17, FL, FT - 17, '#03030a');
   for (let i = 0; i < 90; i++) px(i * 37 % FL, 17 + i * 7 % (FT - 19), i % 5 ? '#c8d0ff' : '#ffffff');
   rect(FL - 90, 18, 9, 9, '#2a6fd8');
   rect(FL - 88, 20, 4, 3, '#3fbf4a');
   rect(FL - 85, 23, 3, 2, '#3fbf4a');
   for (let x = 0; x < FL; x += 80) {
    rect(x + 4, 19, 60, 2, '#7d8590');
    rect(x + 4, 23, 60, 2, '#7d8590');
    rect(x + 30, 17, 4, FT - 17, '#9aa3ab');
    px(x + 31, 18, Math.floor(t * 2 + x) % 2 ? '#ff3b3b' : '#7dff7a');
   }
   crowd([ '#ffffff', '#d9d9d9', '#ff9a4a', '#c9ced6' ], false);
   rect(FL, 17, 120, H - 17, '#05050c');
   for (let i = 0; i < 30; i++) px(FL + i * 29 % 118, 17 + i * 41 % (H - 18), '#ffffff');
   rect(0, FT - 3, FL, 2, '#9aa3ab');
   boards('#2a2f38', 'MOON STADIUM', '#ffe600');
  } else if (k === 'beach') {
   rect(0, 17, FL, FT - 17, '#e8cf8a');
   rect(0, 17, FL, 4, '#1f7fd0');
   for (let x = 0; x < FL; x += 6) px(x + (Math.floor(t * 3) + x) % 4, 17 + x / 6 % 2, '#bfe8ff');
   crowd([ '#ff4a8a', '#ffe14d', '#2cc4dc', '#7dff7a', '#ff9a4a', '#ffffff' ], true);
   for (let x = 40; x < FL; x += 130) {
    rect(x, 18, 1, FT - 20, '#8a5a2b');
    rect(x - 5, 17, 11, 2, x % 260 ? '#ff4a8a' : '#ffe14d');
   }
   rect(FL, 17, 120, H - 17, '#1f7fd0');
   for (let i = 0; i < 24; i++) px(FL + i * 31 % 118, 17 + (i * 17 + Math.floor(t * 8)) % (H - 18), '#bfe8ff');
   rect(0, FT - 3, FL, 2, '#f7e2a8');
   boards('#2a8fd4', 'BEACH STADIUM', '#ffffff');
  } else if (k === 'under') {
   rect(0, 17, FL, FT - 17, '#06345a');
   for (let x = 0; x < FL; x += 9) {
    const c = [ '#ff7a8a', '#ffb14d', '#b06aff' ][x / 9 % 3];
    rect(x, FT - 8, 2, 5, c);
    px(x - 1, FT - 7, c);
    px(x + 2, FT - 6, c);
   }
   crowd([ '#ffb14d', '#7dffd8', '#ff7a8a', '#ffe14d' ], false);
   for (let i = 0; i < 10; i++) {
    const fx0 = (i * 97 + t * (14 + i % 4 * 5)) % (FL + 40) - 20, fy = 18 + i * 5 % (FT - 22);
    rect(Math.round(fx0), fy, 3, 1, i % 2 ? '#ffb14d' : '#ffe14d');
    px(Math.round(fx0) - 1, fy, '#ff7a1a');
   }
   rect(FL, 17, 120, H - 17, '#042640');
   rect(0, FT - 3, FL, 2, '#7dffd8');
   boards('#0e4c78', 'UNDERWATER STADIUM', '#7dffd8');
  } else if (k === 'hell') {
   rect(0, 17, FL, FT - 17, '#1a0303');
   for (let x = 0; x < FL; x += 5) {
    const h = 3 + (x * 7 + Math.floor(t * 12)) % 5;
    rect(x, FT - 3 - h, 3, h, x / 5 % 2 ? '#ff4a1a' : '#ffb000');
   }
   crowd([ '#5a0a0a', '#ff4a1a', '#1b1b1b', '#ffb000' ], false);
   rect(FL, 17, 120, H - 17, '#120202');
   rect(0, FT - 3, FL, 2, '#ff6a1a');
   boards('#3a0505', 'UNDERWORLD STADIUM', '#ff6a1a');
  } else if (k === 'cloud') {
   rect(0, 17, FL, FT - 17, '#8fd0ff');
   for (let x = 0; x < FL; x += 22) {
    rect(x, FT - 9, 14, 6, '#ffffff');
    rect(x + 4, FT - 12, 8, 4, '#ffffff');
   }
   crowd([ '#ffd23a', '#ff9a8a', '#2cc4dc', '#b9a8ff' ], false);
   rect(FL, 17, 120, H - 17, '#a8dcff');
   for (let i = 0; i < 12; i++) rect(FL + i * 37 % 110, 20 + i * 23 % (H - 30), 9, 3, '#ffffff');
   rect(0, FT - 3, FL, 2, '#ffffff');
   boards('#5fb2ec', 'CLOUD STADIUM', '#ffffff');
  }
 }
 const FIELD = {
  moon: {
   '#3f9a40': '#8d9196',
   '#45a446': '#999da2'
  },
  beach: {
   '#3f9a40': '#e2c77e',
   '#45a446': '#e8cf8a'
  },
  under: {
   '#3f9a40': '#1d6a78',
   '#45a446': '#217282'
  },
  hell: {
   '#3f9a40': '#3a1410',
   '#45a446': '#421814'
  },
  cloud: {
   '#3f9a40': '#dbe8f5',
   '#45a446': '#e6f0fa'
  }
 };
 wrapG('drawStadium', function(o, a) {
  const k = special();
  if (!k) return o.apply(this, a);
  try {
   stands(k);
  } catch (e) {
   console.error(e);
   return o.apply(this, a);
  }
  const G = G0();
  if (G) G.st28Frames = (G.st28Frames || 0) + 1;
 });
 wrapG('drawField', function(o, a) {
  const k = special();
  if (!k) return o.apply(this, a);
  const M = FIELD[k], R0 = window.rect;
  window.rect = function(x, y, w, h, c) {
   return R0.call(this, x, y, w, h, M && M[c] || c);
  };
  let r;
  try {
   r = o.apply(this, a);
  } finally {
   window.rect = R0;
  }
  try {
   if (k === 'hell') {
    rect(0, FT - 1, FL, 2, '#ff6a1a');
    rect(0, FB, FL, 2, '#ff6a1a');
    for (let x = 0; x < FL; x += 7) {
     px(x, FT - 2, '#ffb000');
     px(x + 3, FB + 1, '#ffb000');
    }
   }
   if (k === 'under') {
    const t = G0() ? G0().t : menuT;
    for (let i = 0; i < 14; i++) px(i * 41 % FL, Math.round(FB - (i * 23 + t * 18) % (FB - FT)), 'rgba(200,240,255,.6)');
   }
   if (k === 'cloud') {
    for (let i = 0; i < 9; i++) {
     g.globalAlpha = .35;
     rect(i * 67 % FL, FT + 8 + i * 29 % (FB - FT - 16), 18, 4, '#ffffff');
    }
    g.globalAlpha = 1;
   }
   g.globalAlpha = .45;
   text(STK[k].n.replace(' STADIUM', ''), MIDX, CY - 40, 1, k === 'cloud' || k === 'beach' ? '#5a6670' : '#ffffff', 'center');
   g.globalAlpha = 1;
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 wrapG('ballDot', function(o, a) {
  const k = stNow(), B = k && k !== 'champ' && BALL[k];
  if (!B) return o.apply(this, a);
  const x = Math.round(a[0]), y = Math.round(a[1]);
  g.fillStyle = B.g;
  g.fillRect(x - 2, y - 2, 6, 6);
  g.fillStyle = B.o;
  g.fillRect(x - 1, y - 1, 4, 4);
  g.fillStyle = B.c;
  g.fillRect(x, y, 2, 2);
  const G = G0();
  if (G) {
   G.whiteBallFrames = (G.whiteBallFrames || 0) + 1;
   G.glowFrames = 0;
   G.ball28Frames = (G.ball28Frames || 0) + 1;
  }
 });
 function injKind() {
  return special();
 }
 const ZD = {
  dur: 1.6,
  jump: 4.4
 };
 function zTick(sc) {
  const t = sc.t, v = sc.vic;
  if (!v) return false;
  if (t < ZD.dur) {
   v.down = true;
   if (sc.st28 === 'beach' || sc.st28 === 'cloud' || sc.st28 === 'hell') {
    v.sink16 = Math.max(0, Math.min(.999, (t - .5) / .8));
    if (t >= 1.3) v.gone16 = true;
   } else v.gone16 = t >= .2;
   for (const a of sc.actors) if (a.kneelAt != null && t >= a.kneelAt) {
    a.kneel = true;
    a.tx = a.x;
    a.ty = a.y;
   }
   return true;
  }
  if (!sc.z28done) {
   sc.z28done = 1;
   v.gone16 = true;
   v.sink16 = 0;
   sc.t = Math.max(sc.t, ZD.jump);
   if (sc.tr) {
    sc.tr.x = sc.tr.home[0];
    sc.tr.y = sc.tr.home[1];
   }
   const G = G0();
   if (G) G.inj28 = (G.inj28 || 0) + 1;
  }
  return false;
 }
 function zDrawUnder(sc) {
  const v = sc.vic;
  if (!v || sc.t >= ZD.dur) return;
  const t = sc.t, x = Math.round(v.x), y = Math.round(v.y), k = Math.min(1, t / .4);
  if (sc.st28 === 'beach') {
   rect(x - Math.round(7 * k), y - 1, Math.round(15 * k), 3, '#c9a860');
   for (let i = 0; i < 6; i++) {
    const a = t * 6 + i;
    px(Math.round(x + Math.cos(a) * 7 * k), Math.round(y + Math.sin(a) * 2), '#f7e2a8');
   }
  }
  if (sc.st28 === 'hell') {
   rect(x - Math.round(7 * k), y - 1, Math.round(15 * k), 3, '#ff4a1a');
   rect(x - Math.round(4 * k), y, Math.round(9 * k), 1, '#ffb000');
  }
  if (sc.st28 === 'cloud') {
   g.globalAlpha = .9;
   rect(x - Math.round(9 * k), y - 2, Math.round(19 * k), 4, '#ffffff');
   g.globalAlpha = 1;
  }
 }
 function zDraw(sc) {
  const v = sc.vic;
  if (!v) return;
  const t = sc.t;
  if (t >= ZD.dur) return;
  const x = Math.round(v.x), y = Math.round(v.y);
  if (sc.st28 === 'moon' || sc.st28 === 'under') {
   const up = Math.max(0, t - .2) * (sc.st28 === 'moon' ? 70 : 55), dx = sc.st28 === 'moon' ? Math.sin(t * 2) * 6 + t * 10 : Math.sin(t * 4) * 3, a = Math.max(0, 1 - Math.max(0, t - 1.1) / .5);
   g.globalAlpha = a;
   g.save();
   g.translate(Math.round(dx), -Math.round(up));
   try {
    const was = v.gone16;
    v.gone16 = false;
    drawActor14(v, t);
    v.gone16 = was;
   } catch (e) {}
   g.restore();
   if (sc.st28 === 'under') {
    const cx = x + Math.round(dx), cy = y - 8 - Math.round(up);
    for (let i = 0; i < 20; i++) {
     const q = i / 20 * 6.283;
     px(Math.round(cx + Math.cos(q) * 9), Math.round(cy + Math.sin(q) * 11), 'rgba(200,240,255,.85)');
    }
    px(cx - 4, cy - 6, '#ffffff');
   } else for (let i = 0; i < 5; i++) px(x + Math.round(dx) + i * 5 % 9 - 4, y + 2 - Math.round(up) + i * 3, 'rgba(255,255,255,.6)');
   g.globalAlpha = 1;
  } else if (sc.st28 === 'hell') {
   const up = t < .4 ? t / .4 : t < .8 ? 1 : Math.max(0, 1 - (t - .8) / .6), hh = Math.round(14 * up), hx = x - 5;
   if (hh > 0) {
    rect(hx - 2, y - hh, 6, hh, '#b01010');
    rect(hx - 2, y - hh, 1, 1, '#ffb000');
    rect(hx + 3, y - hh, 1, 1, '#ffb000');
    px(hx - 3, y - hh - 1, '#2a0000');
    px(hx + 4, y - hh - 1, '#2a0000');
    px(hx, y - hh + 2, '#ffe14d');
    px(hx + 2, y - hh + 2, '#ffe14d');
    rect(hx + 4, y - hh + 4, 5, 2, '#b01010');
   }
   for (let i = 0; i < 6; i++) px(x - 6 + i * 2, y - 2 - (i * 3 + Math.floor(t * 20)) % 5, i % 2 ? '#ff4a1a' : '#ffb000');
  } else if (sc.st28 === 'beach') {
   for (let i = 0; i < 5; i++) px(x - 4 + i * 2, y - 1 - (i + Math.floor(t * 14)) % 3, '#e8cf8a');
  } else if (sc.st28 === 'cloud') {
   g.globalAlpha = .85;
   rect(x - 10, y - 4, 7, 4, '#ffffff');
   rect(x + 4, y - 3, 7, 4, '#ffffff');
   g.globalAlpha = 1;
  }
 }
 function stLabel(kind, my, opp, home, k) {
  if (k && STK[k]) return STK[k].n;
  return String(T(home ? my : opp) ? T(home ? my : opp).name : '').toUpperCase() + ' HOME';
 }
 function closePick() {
  const d = document.getElementById('st28');
  if (d) d.remove();
 }
 function openPick(o) {
  closePick();
  if (!on('stadiums')) return;
  const d = document.createElement('div');
  d.id = 'st28';
  d.style.cssText = 'position:fixed;inset:0;z-index:87;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ffcc33;box-shadow:0 3px 0 #000;padding:6px 10px 8px;width:min(420px,92%);max-height:92%;display:flex;flex-direction:column;box-sizing:border-box';
  const h = document.createElement('div');
  h.textContent = 'CHOOSE STADIUM';
  h.style.cssText = 'color:#ffcc33;font-size:15px;text-shadow:2px 2px 0 #000;text-align:center;margin-bottom:3px';
  box.appendChild(h);
  if (o.ro) {
   const s = document.createElement('div');
   s.textContent = 'THE HOME TEAM PICKS THE STADIUM';
   s.style.cssText = 'color:#ff9a4a;font-size:10px;text-align:center;margin-bottom:3px';
   box.appendChild(s);
  }
  const sc = document.createElement('div');
  sc.style.cssText = 'overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;gap:3px';
  const row = (id, label, sub, picked, fn, img) => {
   const b = document.createElement('button');
   b.type = 'button';
   b.id = id;
   b.disabled = !!o.ro;
   b.style.cssText = 'font:inherit;font-size:11px;text-align:left;border:0;border-radius:0;padding:5px 8px;display:flex;align-items:center;gap:8px;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;background:' + (picked ? '#ffe14d' : '#8fe3f0') + (o.ro && !picked ? ';opacity:.55' : '');
   if (img) {
    const im = document.createElement('img');
    im.src = img;
    im.alt = '';
    im.style.cssText = 'width:22px;height:22px;image-rendering:pixelated;flex:0 0 auto';
    b.appendChild(im);
   }
   const t = document.createElement('span');
   t.innerHTML = '';
   const a1 = document.createElement('b');
   a1.textContent = label;
   t.appendChild(a1);
   if (sub) {
    const a2 = document.createElement('small');
    a2.textContent = '  ' + sub;
    a2.style.cssText = 'color:#2c4452;font-size:9px';
    t.appendChild(a2);
   }
   b.appendChild(t);
   b.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (o.ro) return;
    try {
     SFX.tap && SFX.tap();
    } catch (x) {}
    fn();
    closePick();
   });
   sc.appendChild(b);
   return b;
  };
  const tn = id => String(T(id) ? T(id).name : id).toUpperCase();
  row('st28_myhome', tn(o.my) + ' HOME', o.my2 || 'YOUR TEAM = THE HOME TEAM', !o.k && o.home, () => o.set(true, null));
  row('st28_opphome', tn(o.opp) + ' HOME', o.opp2 || 'THEY ARE THE HOME TEAM', !o.k && !o.home, () => o.set(false, null));
  const oh = document.createElement('div');
  oh.textContent = 'OTHER (STADIUMS YOU OWN)';
  oh.style.cssText = 'color:#ffd23a;font-size:10px;margin:4px 0 1px';
  sc.appendChild(oh);
  const mine = o.list || owned28();
  if (!mine.length) {
   const n = document.createElement('div');
   n.id = 'st28_none';
   n.textContent = 'NONE YET - WIN ANY TITLE (CHAMPIONSHIP STADIUM), OWN THE HALLOWEEN PACK, OR FIND ONE IN CARD PACKS.';
   n.style.cssText = 'color:#aab3ba;font-size:10px';
   sc.appendChild(n);
  }
  for (const k of mine) row('st28_' + k, STK[k].n, [ 'COMMON', 'RARE', 'LEGENDARY' ][STK[k].rar], o.k === k, () => o.set(o.home, k), (() => {
   try {
    return V17.iconUrl(STK[k].id);
   } catch (e) {
    return '';
   }
  })());
  box.appendChild(sc);
  const bk = document.createElement('button');
  bk.type = 'button';
  bk.id = 'st28_back';
  bk.textContent = 'BACK';
  bk.style.cssText = 'font:inherit;font-size:13px;border:0;border-radius:0;padding:7px 24px;margin:6px auto 0;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;background:#c9d6d9;flex:0 0 auto';
  bk.addEventListener('click', e => {
   e.preventDefault();
   e.stopPropagation();
   closePick();
  });
  box.appendChild(bk);
  d.appendChild(box);
  d.addEventListener('pointerdown', e => e.stopPropagation());
  d.addEventListener('touchstart', e => e.stopPropagation(), {
   passive: true
  });
  document.body.appendChild(d);
 }
 function stButton(cx, y, w, label, open, top286) {
  if (!window.__rl_no281stbtn) {
   try {
    let lo = cx - w / 2, hi = cx + w / 2;
    const sk = screenKey() + '|';
    for (const s of uiSpecs) {
     if (!s.key.startsWith(sk) || s.y >= y + 14 || s.y + s.h <= y || s.x >= hi || s.x + s.w <= lo) continue;
     if (s.x + s.w / 2 < cx) lo = Math.max(lo, s.x + s.w + 1); else hi = Math.min(hi, s.x - 1);
    }
    if (!top286 && typeof VS !== 'undefined' && VS.hero) {
     const L0 = VS.hero[0], R0 = VS.hero[1];
     if (L0 && L0.y < y + 14 + 40 && L0.x + L0.w + 25 > lo && L0.x + L0.w / 2 < cx) lo = Math.max(lo, L0.x + L0.w + 26);
     if (R0 && R0.y < y + 14 + 40 && R0.x - 25 < hi && R0.x + R0.w / 2 > cx) hi = Math.min(hi, R0.x - 26);
    }
    const w2 = Math.floor(2 * Math.min(cx - lo, hi - cx));
    if (w2 < w && w2 >= textW('CHOOSE STADIUM') + 8) w = w2; else if (w2 < w && w2 >= textW('STADIUM') + 8) {
     const x = Math.round(cx - w2 / 2);
     hit('CHOOSE STADIUM', x, y, w2, 14, open, 'CHOOSE STADIUM');
     rect(x, y + 2, w2, 14, '#000');
     rect(x, y, w2, 14, '#ffcc33');
     rect(x, y, w2, 1, 'rgba(255,255,255,.4)');
     text('STADIUM', cx, y + 4, 1, '#0b1a20', 'center');
     const s = label.length * 4 > w2 + 60 ? label.slice(0, Math.floor((w2 + 60) / 4)) : label, tw = textW(s) + 6;
     rect(Math.round(cx - tw / 2), y + 16, tw, 9, 'rgba(0,0,0,.6)');
     text(s, cx, y + 18, 1, '#ffe14d', 'center');
     return;
    }
   } catch (e) {}
  }
  button('CHOOSE STADIUM', Math.round(cx - w / 2), y, w, 14, open, {
   bg: '#ffcc33'
  });
  const lw = top286 ? w + 40 : w + 60;
  const s = label.length * 4 > lw ? label.slice(0, Math.floor(lw / 4)) : label, tw = textW(s) + 6;
  rect(Math.round(cx - tw / 2), y + 16, tw, 9, 'rgba(0,0,0,.6)');
  text(s, cx, y + 18, 1, '#ffe14d', 'center');
 }
 wrapG('drawMatchup', function(o, a) {
  const r = o.apply(this, a);
  try {
   if (!on('stadiums') || scr() !== 'matchup' || !menuSel.opp) return r;
   if (menuSel.st28 && !ownSt(menuSel.st28)) menuSel.st28 = null;
   const my = menuSel.team, opp = menuSel.opp;
   const top286 = !window.__rl_no286lobby && !window.__rl_v124gb;
   stButton(W / 2, top286 ? 14 : 74, 96, stLabel('quick', my, opp, !!menuSel.home, menuSel.st28), () => openPick({
    my: my,
    opp: opp,
    home: !!menuSel.home,
    k: menuSel.st28 || null,
    set: (home, k) => {
     menuSel.home = home;
     menuSel.st28 = k;
    }
   }), top286);
   if (menuSel.st28 === 'gho') {
    rect(W - 88, 3, 84, 16, '#0b141c');
    button('NIGHT ONLY', W - 86, 4, 80, 13, () => {}, {
     bg: '#b9a8ff',
     fg: '#0b1a20'
    });
   }
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 function lobbyPick(st, host, upd) {
  const S0 = st.settings || {}, hT = st.hteam, gT = st.gteam, s28 = S0.st28, k = s28 && STK[s28] ? s28 : null;
  if (!hT || !gT) {
   try {
    menuMsg = {
     s: 'BOTH TEAMS PICK FIRST',
     t: 1.5
    };
   } catch (e) {}
   return;
  }
  openPick({
   my: hT,
   opp: gT,
   my2: host ? 'YOUR TEAM = THE HOME TEAM' : 'THE HOME TEAM',
   opp2: host ? 'THEY ARE THE HOME TEAM' : 'YOUR TEAM = THE HOME TEAM',
   home: s28 !== 'g',
   k: k,
   ro: !host,
   list: host ? owned28() : k ? [ k ] : [],
   set: (home, kk) => {
    if (!host) return;
    upd('st28', kk ? kk : home ? null : 'g');
   }
  });
 }
 function lobbyBtn(st, host, sg, upd) {
  return on('stadiums') && !sg ? [ 'STADIUM', 62, () => lobbyPick(st, host, upd), {
   bg: '#ffcc33'
  } ] : null;
 }
 function lobbyInfo(st, sg) {
  if (!on('stadiums') || sg) return '';
  const s28 = (st.settings || {}).st28;
  if (s28 && STK[s28]) return '  -  ' + STK[s28].n.replace(' STADIUM', '');
  if (s28 === 'g' && st.gteam && T(st.gteam)) return '  -  AT ' + String(T(st.gteam).name).toUpperCase();
  return '';
 }
 let tk = 0, lastC = JSON.stringify(S.cequip);
 wrapG('step', function(o, a) {
  const r = o.apply(this, a);
  try {
   const t = rt();
   if (t - tk > 1 && scr() === 'menu' && !G0()) {
    tk = t;
    unlockTick();
    sanitize();
    flushClaims();
   }
   if (!G0() || scr() === 'card28') {
    const c = JSON.stringify(S.cequip);
    if (c !== lastC) {
     lastC = c;
     save();
    }
   }
   if (window.RLNET && RLNET.inGame && !RLNET.auth) viewTick();
   if (scr() !== 'matchup' && scr() !== 'onLobby' && document.getElementById('st28')) closePick();
  } catch (e) {
   console.error(e);
  }
  return r;
 });
 try {
  sanitize();
 } catch (e) {
  console.error(e);
 }
 setTimeout(() => {
  try {
   unlockTick(true);
   flushClaims(true);
  } catch (e) {
   console.error(e);
  }
 }, 20);
 window.V28 = {
  on: on,
  LOG: LOG,
  st: () => S,
  save: save,
  OTS: OTS,
  otsOk: otsOk,
  otsFired: otsFired,
  cpuOts: cpuOts,
  cpuDodge: cpuDodge,
  tick: tick,
  tutSetup: tutSetup,
  tutDone: tutDone,
  tutComplete: tutComplete,
  drillNeed: drillNeed,
  helpPages: helpPages,
  cardStore: cardStore,
  cardGear: cardGear,
  extraIds: extraIds,
  holders: holders,
  onCardsTxt: onCardsTxt,
  onCardsHtml: onCardsHtml,
  popLine: popLine,
  popBtn: popBtn,
  playersHint: playersHint,
  openCard: openCard,
  closeCard: closeCard,
  drawCard: drawCard,
  cardPid: cardPid,
  cardTid: cardTid,
  sanitize: sanitize,
  dropRoll: dropRoll,
  teamPool: teamPool,
  ST28: ST28,
  owned28: owned28,
  ownSt: ownSt,
  grantSt: grantSt,
  unlockTick: unlockTick,
  packStadiums: packStadiums,
  icon: icon,
  stNow: stNow,
  special: special,
  stGho: stGho,
  injKind: injKind,
  zTick: zTick,
  zDrawUnder: zDrawUnder,
  zDraw: zDraw,
  openPick: openPick,
  closePick: closePick,
  lobbyBtn: lobbyBtn,
  lobbyInfo: lobbyInfo,
  lobbyPick: lobbyPick,
  BALL: BALL
 };
})();
