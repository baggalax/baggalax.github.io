// V51.3 - FAIR STICK CHECKS (v513chk.js, ?v=5130). OFFLINE ONLY. Kill switch: window.__rl_no513chk = true -> exactly 52w.
// Charlie (Nov 11, 8:43-8:46 PM): "It's so hard to check when I'm in defense ngl and they check me so easy" / "It should be the same"
//  / "every time you click it should check, shouldn't have checks that don't land" / "As long as you're right up on him" /
//  "If you're too far it obviously shouldn't land or if he dodges as you check" / wings + up top stay 2 / "Up top if you're not a
//  threat like you're above box it should be 2".
// ONE RULE FOR BOTH SIDES (you checking their carrier = them checking yours):
//  - a check LANDS every time the checker is in range (your yellow dots, DZ.checkR) and the carrier is not dodging at that moment;
//    no random whiffs. Too far = "MISSED - TOO FAR". Carrier mid-dodge (split / roll / swim / toe drag, + K.grace s) = "DODGED!".
//  - landed checks that strip him: 1 inside the box (middle / near the cage), 2 on the wings (within CHK2403.edge of a sideline)
//    or above the box (outside the restraining line = not a threat); +1 if his stick is on the far side (side110 'off' = the
//    checker is on his off-stick side); +1 on SQUID / FISH / BEGINNER (unchanged, pending Charlie).
//  - no extra instant-strip rolls (your pOut roll is gone; their side never had one). Count decays after K.decay s both ways.
//  - no gear stick snap / drop rolls on a check either (items17 checkLanded used to pop it loose at random on a landed check, both
//    ways; with every check landing that became 2-4 random strips a game). V513.K.gear = true puts them back, both ways.
// Harder modes stay harder only through the CPU's choices: how often its swing timer fires (UCHK.every x DF.chkEvery x v452hard,
//  x1.5 on Bagga) and whether it takes the swing at that moment (its old land odds - you standing still, traffic, a bump, your
//  ratings, his stick on the far side - are now its "swing now?" odds). A swing it takes ALWAYS lands unless you dodge it,
//  exactly like your taps; a moment it passes on shows nothing (no SLAP whiff, no swing pose). So the CPU's landed checks per
//  minute stay where they were in 52w while yours now land every time you're on him.
// Online (net.js) is untouched: every hook falls through when the game is online.
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no513chk || W.V513) return;
 const need = [ 'dCheck', 'updateLive', 'chkNeed2403', 'side110', 'inZone110', 'addFx', 'text', 'textW' ];
 for (const n of need) if (typeof W[n] !== 'function') return;
 const K = { grace: .12, decay: 2.5, gear: false };
 const ST = { uTap: 0, uFar: 0, uDodged: 0, uLand: 0, uStrip: 0, uN: {}, cFire: 0, cSwing: 0, cDodged: 0, cLand: 0, cStrip: 0, cN: {}, cHeld: 0, txt: 0, errs: [] };
 const V = W.V513 = { on: true, K: K, ST: ST };
 const off = () => !!(W.__rl_no513chk || W.__rl_v124gb);
 const err = (e, w) => { try { if (ST.errs.length < 8) { ST.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v513chk', w, e); } } catch (x) {} };
 const G0 = () => { try { return game; } catch (e) { return null; } };
 const SCR = () => { try { return screen; } catch (e) { return ''; } };
 function okG(G) {
  return !!G && !off() && !G.online && !(G.meta && G.meta.online) && !(W.RLNET && RLNET.inGame);
 }
 V.okG = okG;
 // ---------- who is dodging ----------
 function dodging(G, c) {
  if (!c) return false;
  if (c.dodgeA || (G.dodge && G.carrier === c && SCR() === 'live')) { c.d513 = G.t; return true; }
  return c.d513 != null && G.t >= c.d513 && G.t - c.d513 < K.grace;
 }
 function track(G, c) { try { if (c && (c.dodgeA || G.dodge && G.carrier === c)) c.d513 = G.t; } catch (e) {} }
 V.dodging = dodging;
 // ---------- how many landed checks strip him ----------
 const NEED0 = W.chkNeed2403;
 function zone(c, gx) {
  const edge = (typeof CHK2403 !== 'undefined' && CHK2403.edge) || 32;
  if (c.y < FT + edge || c.y > FB - edge) return 'wing';
  return inZone110(c, gx === DGX ? 'C' : 'U') ? 'box' : 'top';
 }
 function need513(c, d, gx) {
  let n = zone(c, gx) === 'box' ? 1 : 2;
  if (typeof DF !== 'undefined' && DF.level <= 2) n++;
  if (d && side110(c, d, gx) === 'off') n++;
  return n;
 }
 V.zone = zone; V.need = need513;
 // stats only: the game's own check stats (window.__st2403) use the same zones (box / wing / top) in offline games
 const ZONE0 = W.chkZone2403;
 if (typeof ZONE0 === 'function') W.chkZone2403 = function (c) {
  try { const G = G0(); if (okG(G) && c) return zone(c, SCR() === 'defense' ? DGX : GX); } catch (e) {}
  return ZONE0.apply(this, arguments);
 };
 W.chkNeed2403 = function (c, d, gx) {
  try { const G = G0(); if (okG(G) && c) return need513(c, d, gx); } catch (e) { err(e, 'need'); }
  return NEED0.apply(this, arguments);
 };
 // ---------- YOUR checks on their carrier (defense screen) ----------
 function dCheck513() {
  const G = game, c = G.dcar, d = G.dctl;
  if (d) spamCheck();
  if (d && !(d.stun > 0)) {
   const gk = !c || Math.hypot(c.x - d.x, c.y - d.y) > DZ.checkR ? keeperInCrease(d, DZ.checkR) : null;
   if (gk) {
    G.chkTaps = [];
    foulCall('GOALIE INTERFERENCE', 'CHECKED THE GOALIE IN HIS CREASE', 'U', d, { user: true });
    return 'foul';
   }
   const late = !c || Math.hypot(c.x - d.x, c.y - d.y) > DZ.checkR + DLUNGE ? dLateTarget(DZ.checkR) : null;
   if (late && G.t - G.dLastCar.t > FOUL.slashT && !nearLoose(late)) {
    G.lateHacks = G.lateHacks || {};
    const k = G.dLastCar.t.toFixed(2);
    G.lateHacks[k] = (G.lateHacks[k] || 0) + 1;
    if (G.lateHacks[k] >= 2) {
     G.chkTaps = [];
     foulCall('SLASHING', "HACKING HIM AFTER HE GOT RID OF IT", 'U', d, { user: true });
     return 'foul';
    }
    addFx('txt', late.x, late.y - 24, { s: 'HE DOESN\'T HAVE IT!', col: '#ffe14d', life: .7 });
    return 'late';
   }
  }
  if (!c || !d || G.ball.state !== 'held' || G.chk.cd > 0 || d.stun > 0) return 'cooldown';
  ST.uTap++;
  G.chk.cd = DZ.checkCd;
  d.chkT0 = menuT;
  const dist = Math.hypot(c.x - d.x, c.y - d.y);
  if (dist > DZ.checkR) {
   ST.uFar++;
   addFx('txt', d.x, d.y - 32, { s: 'MISSED - TOO FAR', col: '#ff9a8a', life: .7 });
   return 'whiff';
  }
  G.chk.t = 0;
  G.dChecks = (G.dChecks || 0) + 1;
  if (G.chk.who !== c) { G.chk.n = 0; G.chk.who = c; }
  const tut = !!G.tutorial, tutChk = !!(tut && !G.tutorial.complete && G.tutorial.step === TD.CHECK);
  if (!tut && dPenaltyRoll(PEN_DCHECK_P, d, 'SLASHING')) return 'flag';
  if (!tut && dodging(G, c)) {
   ST.uDodged++;
   addFx('txt', d.x, d.y - 24, { s: 'DODGED!', col: '#8fe3f0', life: .7 });
   return 'whiff';
  }
  G.chk.n++;
  G.chk.last513 = G.t;
  ST.uLand++;
  sfx12('check_clack', .75);
  G.checkSnd = (G.checkSnd || 0) + 1;
  addFx('pop', c.x - 6, c.y - 9);
  tutFlag('checked');
  try { if (W.V452 && V452.on) G.v452hot = G.t; } catch (e) {}
  const s17 = K.gear && W.V17 && G.g17 ? V17.checkLanded(c) : null;
  if (s17) {
   G.dDislodge = (G.dDislodge || 0) + 1;
   const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1.6, 1.6), v = rnd(40, 60);
   dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'check');
   st14('ct', d.pl);
   c.stun = .4;
   ST.uGear = (ST.uGear || 0) + 1;
   return 'dislodge';
  }
  const nd = G.chk.need = need513(c, d, DGX), zn = zone(c, DGX);
  try { chkStat2403('uLand_' + zn); } catch (e) {}
  if (!tutChk && G.chk.n >= nd) {
   try { chkStat2403('uStrip_' + zn + '_' + G.chk.n); } catch (e) {}
   ST.uStrip++; ST.uN[G.chk.n] = (ST.uN[G.chk.n] || 0) + 1;
   G.dDislodge = (G.dDislodge || 0) + 1;
   const n = G.chk.n;
   tutFlag('stripped');
   const a = Math.atan2(c.y - d.y, c.x - d.x) + rnd(-1.6, 1.6), v = rnd(40, 60);
   dPopLoose(c.x - 8, c.y - 1, Math.cos(a) * v, Math.sin(a) * v, 'check');
   st14('ct', d.pl);
   if (W.V17) V17.say('cto', d.x, d.y - 30);
   c.stun = .4;
   G.lastDislodgeN = n;
   return 'dislodge';
  }
  addFx('txt', c.x, c.y - 30, { s: G.chk.n + '/' + nd, col: '#ffe14d', life: .6 });
  return 'land';
 }
 const DC0 = W.dCheck;
 W.dCheck = function () {
  const G = G0();
  if (!okG(G) || SCR() !== 'defense') return DC0.apply(this, arguments);
  try { return dCheck513(); } catch (e) { err(e, 'dCheck'); return 'cooldown'; }
 };
 // ---------- THEIR checks on your carrier (live screen, inside updateLive) ----------
 // The game's own loop still decides when a defender's swing timer fires (range UCHK.range, DF.chkEvery, v452hard, v36ai holds,
 // fouls) and rolls its old odds: a hit = the swing, which lands; a miss = he passes on it (the SLAP whiff text and the swing pose
 // are dropped). While you dodge every timer that fires is a swing you beat: DF.chk ~ 0 for that frame and it shows DODGED!.
 let inUL = false, dodgeNow = false, held = null;
 const AF0 = W.addFx;
 W.addFx = function (type, x, y, extra) {
  if (inUL && extra && extra.s === 'SLAP') {
   try {
    ST.cFire++;
    if (dodgeNow) { ST.cDodged++; ST.cSwing++; return AF0.call(this, type, x, y, Object.assign({}, extra, { s: 'DODGED!', col: '#8fe3f0', life: .6 })); }
    ST.cHeld++;
    if (held) for (const p of game.players) if (p.team === 'D' && p.x === x && p.y - 24 === y) held.add(p);
    return;
   } catch (e) { err(e, 'fx'); }
  }
  if (inUL && extra && typeof extra.s === 'string' && extra.s.indexOf('CHECKED ') === 0) { ST.cFire++; ST.cSwing++; ST.cLand++; }
  return AF0.apply(this, arguments);
 };
 const CP0 = W.checkPop;
 if (typeof CP0 === 'function') W.checkPop = function () {
  if (inUL) { ST.cFire++; ST.cSwing++; ST.cLand++; ST.cStrip++; try { const n = Math.max(1, game.uchk && game.uchk.need || 1); ST.cN[n] = (ST.cN[n] || 0) + 1; } catch (e) {} }
  return CP0.apply(this, arguments);
 };
 const V14 = W.v14Check;
 if (typeof V14 === 'function') W.v14Check = function () {
  if (!inUL || K.gear) return V14.apply(this, arguments);
  const G = G0(), g = G && G.g17;
  if (g) G.g17 = null;
  try { return V14.apply(this, arguments); } finally { if (g) G.g17 = g; }
 };
 const UL0 = W.updateLive;
 W.updateLive = function (dt) {
  const G = G0();
  if (inUL || !okG(G) || SCR() !== 'live' || G.tutorial) return UL0.apply(this, arguments);
  const c = G.carrier;
  let snap = null;
  const ck = DF.chk, dec = UCHK.decay;
  try {
   track(G, c);
   dodgeNow = !!(c && c.team === 'O' && dodging(G, c));
   if (dodgeNow) DF.chk = 1e-9;
   UCHK.decay = K.decay;
   snap = new Map; held = new Set;
   for (const p of G.players) if (p.team === 'D') snap.set(p, p.chkT0);
  } catch (e) { err(e, 'ul-pre'); }
  inUL = true;
  try { return UL0.apply(this, arguments); }
  finally {
   inUL = false; DF.chk = ck; UCHK.decay = dec;
   try { if (held && held.size) for (const p of held) p.chkT0 = snap.get(p); } catch (e) {}
   held = null; dodgeNow = false;
  }
 };
 // track their carrier's dodges on defense too (for the DODGED grace window)
 const UD0 = W.updateDefense;
 if (typeof UD0 === 'function') W.updateDefense = function () {
  const r = UD0.apply(this, arguments);
  try { const G = G0(); if (okG(G) && G.dcar) track(G, G.dcar); } catch (e) {}
  return r;
 };
 // ---------- words: every line that said "3 checks" ----------
 const SUB = [
  [ 'KEEP CHECKING HIM. 3 CHECKS THAT LAND = THE BALL POPS LOOSE.', 'IN THE BOX 1 CHECK POPS IT. WINGS/UP TOP: 2. STICK FAR SIDE: +1' ],
  [ 'LAND ONE CHECK = DONE. (3 THAT LAND = THE BALL POPS LOOSE.)', 'LAND ONE CHECK = DONE. (ON HIM = IT ALWAYS LANDS.)' ],
  [ '3 CHECKS KNOCK IT LOOSE.', 'BOX: 1 KNOCKS IT LOOSE, ELSE 2.' ],
  [ '3 CHECKS = IT POPS.', 'BOX 1 POPS IT, ELSE 2.' ],
  [ 'MIDDLE: 1 CHECK POPS IT. OUTSIDES: 2.', 'BOX: 1 CHECK POPS IT. WINGS/TOP: 2.' ]
 ];
 const LANDED = /^CHECKS LANDED: (\d+)\/3$/;
 function words(s) {
  if (typeof s !== 'string' || s.length < 14 || off()) return s;
  if (s.indexOf('CHECK') < 0 && s.indexOf('LAND') < 0 || s.indexOf('3') < 0 && s.indexOf('MIDDLE: 1') < 0) return s;
  const m = LANDED.exec(s);
  if (m) {
   let n = 2;
   try { const G = G0(); n = G.chk && G.chk.need || (G.dcar && G.dctl ? need513(G.dcar, G.dctl, DGX) : 2); } catch (e) {}
   return 'CHECKS LANDED: ' + Math.min(+m[1], n) + '/' + n;
  }
  let r = s;
  for (const [a, b] of SUB) if (r.indexOf(a) >= 0) r = r.split(a).join(b);
  if (r !== s) ST.txt++;
  return r;
 }
 V.words = words;
 const T0 = W.text, TW0 = W.textW;
 W.text = function (s) { if (typeof s === 'string' && s.length >= 14) { const r = words(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return T0.apply(this, b); } } return T0.apply(this, arguments); };
 W.textW = function (s) { if (typeof s === 'string' && s.length >= 14) { const r = words(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return TW0.apply(this, b); } } return TW0.apply(this, arguments); };
 // the coach's answer is wrapped into lines before text(), so fix the source
 try {
  const list = W.V4014C && Array.isArray(V4014C.QA) ? V4014C.QA : [];
  for (const q of list) if (q && typeof q.a === 'string' && q.a.indexOf('3 THAT LAND = IT POPS LOOSE.') >= 0)
   q.a = q.a.replace('3 THAT LAND = IT POPS LOOSE.', 'ON HIM, EVERY CHECK LANDS (UNLESS HE DODGES IT). 1 POPS IT IN THE BOX, 2 ON THE WINGS OR UP TOP, +1 IF HIS STICK IS ON THE FAR SIDE. SAME RULE WHEN THEY CHECK YOU.');
 } catch (e) { err(e, 'coach'); }
})();
