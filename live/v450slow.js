/* v450slow.js - SLOW WHISTLE / PLAY ON (Nov 8, for 1.1). Kill switch: window.__rl_no450slow = true.
 * A player (via Charlie, Nov 8): "When there's a penalty in the real game, it's play on if you have the ball and the
 * penalty was on the other team, why wasn't that implemented here?"
 * Before: a CPU-defense foul while YOU have the ball (screen 'live') blew the play dead on the spot.
 * Now (real NCAA/NFHS slow whistle): the ref throws the flag, "FLAG DOWN - PLAY ON" shows, play continues, and the
 * whistle goes when you lose it (pick-off, ground ball for them, out of bounds their way, ball on the ground), when a
 * shot ends (save, miss, pipe, block), on any other whistle, or after SLOW_CAP seconds of play. Then the flag is
 * enforced exactly like before (same banner, same man-up, your ball) - the original foulCall/penaltyRoll/ruleCall run.
 * If you SCORE during the slow whistle the goal counts; a PERSONAL foul (slashing, illegal body check...) is still
 * served (you get the ball back man-up instead of a faceoff); a TECHNICAL (pushing, holding, offsides...) is wiped out.
 * Not in online games, tutorial, practice, brave, overtime, or when a penalty is already on/pending. Your own fouls
 * (CPU ball, 'defense') are unchanged. Stats/logs: foulLog, G.fouls, aiFouls, st14, penCountUp count the same flags.
 */
(function () {
 'use strict';
 const WIN = window;
 const need = [ 'foulCall', 'penaltyRoll', 'ruleCall', 'endPossession', 'afterBanner', 'updateLive', 'drawHUD', 'startPenalty' ];
 for (const n of need) if (typeof WIN[n] !== 'function') return;
 const SLOW_CAP = 7;
 const TECH = /PUSHING|HOLDING|INTERFERENCE|OFFSIDE|ILLEGAL PICK|MOVING PICK|WARDING|ILLEGAL PROCEDURE|WITHHOLDING|STALLING|DELAY|CREASE|THREE SECOND|TOO MANY/;
 const LOG = WIN.V450 = { flags: 0, blown: {}, goals: 0, served: 0, wiped: 0, errs: [], last: null };
 const off = () => !!(WIN.__rl_no450slow || WIN.__rl_v124gb);
 const err = (e, w) => { try { if (LOG.errs.length < 8) LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160)); console.warn('v450slow', w, e); } catch (x) {} };
 const G0 = () => (typeof game !== 'undefined' ? game : null);
 const scr = () => (typeof screen !== 'undefined' ? screen : '');
 const online = G => !!(G.online || G.meta && G.meta.online || WIN.RLNET && RLNET.inGame);
 const okMode = G => !!G && !G.over && !G.tutorial && !G.practice && !G.brave && !G.ot && !online(G);
 const eligible = G => !off() && okMode(G) && scr() === 'live' && !G.pen && !G.penPending && !G.sw450;
 const isTech = label => TECH.test(String(label || '').toUpperCase());
 let busy = 0;   // re-entrancy: while we enforce a flag the originals run untouched

 const oFoul = WIN.foulCall, oRoll = WIN.penaltyRoll, oRule = WIN.ruleCall, oEnd = WIN.endPossession, oAfter = WIN.afterBanner, oLive = WIN.updateLive, oHud = WIN.drawHUD;

 function flagDown(G, s) {
  s.t0 = G.liveT || 0;
  s.g = G;
  s.tech = s.via === 'rule' ? true : isTech(s.label);
  G.sw450 = s;
  LOG.flags++;
  LOG.last = { label: s.label, via: s.via, tech: s.tech, t: +(G.t || 0).toFixed(2) };
  const b = G.ball, w = s.whoP && s.whoP.x != null ? s.whoP : b;
  try {
   addFx('txt', w.x, w.y - 26, { s: 'FLAG!', col: '#ffe14d', life: 1.2 });
   addFx('cue', 0, 0, { s: 'FLAG DOWN - PLAY ON', col: '#ffe14d', life: 1.8 });
  } catch (e) { err(e, 'fx'); }
  try {   // the ref throws the flag (no whistle - play on)
   if (G.refs && G.refs.length && b) {
    const r = G.refs.slice().sort((p, q) => Math.abs(p.x - b.x) - Math.abs(q.x - b.x))[0];
    G.refFlag = { r: r, t: 0, tx: clamp(b.x, 20, FL - 20), ty: clamp(b.y, FT + 10, FB - 6) };
    G.refFlags = (G.refFlags || 0) + 1;
   }
  } catch (e) { err(e, 'ref'); }
 }

 // enforce the flag now, exactly the old way (screen is still 'live')
 function blow(G, why) {
  const s = G && G.sw450;
  if (!s) return false;
  G.sw450 = null;
  LOG.blown[why] = (LOG.blown[why] || 0) + 1;
  if (scr() !== 'live' || G.pen || G.penPending) return late(G, s, why);
  busy++;
  let r = false;
  try {
   if (s.via === 'roll') { G.forcePen = 'C'; r = oRoll.call(WIN, 'check', s.chk); if (G.forcePen === 'C') G.forcePen = null; }
   else if (s.via === 'rule') r = oRule.apply(WIN, s.args);
   else r = oFoul.apply(WIN, s.args);
  } catch (e) { err(e, 'blow'); }
  finally { busy--; }
  if (G.banner && r) G.banner.slow450 = why;
  return !!r;
 }

 // personal-foul bookkeeping, same as foulCall/penaltyRoll/ruleCall would do, without touching the screen
 function bookPen(G, s) {
  if (s.via === 'roll') { G.penPending = { side: 'C', who: s.chk && s.chk.pl, foul: 'SLASHING' }; return; }
  if (s.via === 'rule') {
   const label = s.args[0];
   (G.ruleLog = G.ruleLog || []).push({ rule: label, kind: 'cpen', t: +G.t.toFixed(2), q: G.q, user: false });
   G.ruleCalls = G.ruleCalls || {}; G.ruleCalls[label] = (G.ruleCalls[label] || 0) + 1;
   G.penPending = { side: 'C', who: PP(G.lu[1].D[0]), foul: label };
   G.ruleCall = G.penPending;
   return;
  }
  const [label, sub, side, whoP] = s.args;
  bookFoul(G, s);
  const ej = penCountUp(whoP, side);
  G.penPending = { side: side, who: whoP && whoP.pl, foul: label, sub: sub, eject: ej };
 }
 function bookFoul(G, s, extra) {
  if (s.via !== 'call') { if (s.via === 'rule') { const label = s.args[0]; (G.ruleLog = G.ruleLog || []).push(Object.assign({ rule: label, kind: 'cpen', t: +G.t.toFixed(2), q: G.q, user: false }, extra || {})); G.ruleCalls = G.ruleCalls || {}; G.ruleCalls[label] = (G.ruleCalls[label] || 0) + 1; } return; }
  const [label, , side, whoP, opts] = s.args;
  foulLog(G, Object.assign({ foul: label, side: side, user: !!(opts && opts.user), tech: false }, extra || {}));
  if (side === 'U' && whoP && whoP.pl) st14('pen', whoP.pl);
  G.fouls = G.fouls || { U: 0, C: 0 };
  G.fouls[side]++;
  if (opts && opts.user) G.userFouls = (G.userFouls || 0) + 1; else G.aiFouls = (G.aiFouls || 0) + 1;
 }

 // the play left 'live' some other way: serve the flag after that banner
 function late(G, s, why) { G.sw450late = s; s.why = why; return false; }

 WIN.foulCall = function (label, sub, side, whoP, opts) {
  const G = G0();
  if (busy || off() || !G) return oFoul.apply(this, arguments);
  try {
   if (G.sw450 && scr() === 'live') {   // another call while the flag is down: whistle now, enforce the first flag
    blow(G, 'foul2');
    return true;
   }
   if (side === 'C' && !(opts && opts.tech) && eligible(G)) {
    flagDown(G, { via: 'call', label: label, args: [ label, sub, side, whoP, opts ], whoP: whoP });
    return true;
   }
  } catch (e) { err(e, 'foulCall'); }
  return oFoul.apply(this, arguments);
 };

 WIN.penaltyRoll = function (kind, chk) {
  const G = G0();
  if (busy || off() || !G) return oRoll.apply(this, arguments);
  try {
   if (kind === 'check' && G.forcePen === 'C' && G.sw450 && scr() === 'live') {   // another flag while one is down
    G.forcePen = null;
    blow(G, 'foul2');
    return true;
   }
   if (kind === 'check' && G.forcePen === 'C' && eligible(G)) {
    G.forcePen = null;
    flagDown(G, { via: 'roll', label: 'SLASHING', chk: chk, whoP: chk });
    return true;
   }
  } catch (e) { err(e, 'penaltyRoll'); }
  return oRoll.apply(this, arguments);
 };

 WIN.ruleCall = function (label, sub, kind, spot) {
  const G = G0();
  if (busy || off() || !G) return oRule.apply(this, arguments);
  try {
   if (G.sw450 && scr() === 'live') {
    if (G.sw450.via === 'rule' && G.sw450.label === label) return true;   // the same offsides still on: flag already down
    blow(G, 'rule');
    return true;
   }
   if (kind === 'cpen' && eligible(G)) {
    flagDown(G, { via: 'rule', label: label, args: [ label, sub, kind, spot ] });
    return true;
   }
  } catch (e) { err(e, 'ruleCall'); }
  return oRule.apply(this, arguments);
 };

 WIN.endPossession = function (kind, txt, sub) {
  const G = G0();
  if (busy || off() || !G || !G.sw450 || scr() !== 'live') return oEnd.apply(this, arguments);
  try {
   if (kind === 'goal') {   // goal counts
    const s = G.sw450;
    G.sw450 = null;
    LOG.goals++;
    const r = oEnd.apply(this, arguments);
    if (s.tech) {
     LOG.wiped++;
     bookFoul(G, s, { wiped450: true });
     if (G.banner) G.banner.sub = 'GOAL COUNTS - ' + s.label + ' WIPED OUT';
    } else {
     G.sw450goal = s;
     if (G.banner) G.banner.sub = 'GOAL COUNTS - ' + s.label + ' STILL SERVED';
    }
    return r;
   }
   const why = kind === 'turnover' ? 'turnover' : kind;
   if (blow(G, why)) return;
  } catch (e) { err(e, 'endPossession'); }
  return oEnd.apply(this, arguments);
 };

 WIN.afterBanner = function () {
  const G = G0();
  try {
   if (!off() && G && G.banner) {
    const k = G.banner.kind;
    if (G.sw450goal && k === 'goal') {
     const s = G.sw450goal;
     G.sw450goal = null;
     if (!G.over && !G.pen && !G.penPending) {
      bookPen(G, s);
      LOG.served++;
      if (startPenalty()) return;
     }
    }
    if (G.sw450late) {
     const s = G.sw450late;
     G.sw450late = null;
     if (!G.over && !G.pen && !G.penPending && k !== 'goal' && k !== 'cgoal' && k !== 'flag') {
      bookPen(G, s);
      LOG.served++;
      LOG.lateServed = (LOG.lateServed || 0) + 1;
      if (startPenalty()) return;
     }
    }
   }
  } catch (e) { err(e, 'afterBanner'); }
  return oAfter.apply(this, arguments);
 };

 WIN.updateLive = function (dt) {
  const r = oLive.apply(this, arguments);
  try {
   const G = G0();
   if (G && G.sw450) {
    const s = G.sw450;
    if (s.g !== G || off()) { G.sw450 = null; return r; }
    if (scr() !== 'live') { G.sw450 = null; late(G, s, 'left:' + scr()); LOG.blown['left'] = (LOG.blown['left'] || 0) + 1; return r; }
    const b = G.ball, st = b && b.state;
    if (st === 'loose' || st === 'chase' || st === 'dead') blow(G, s.shot ? 'shot' : 'loose');
    else if (st === 'shot') s.shot = true;
    else if ((G.liveT || 0) - s.t0 >= SLOW_CAP && st !== 'shot') blow(G, 'cap');
   }
  } catch (e) { err(e, 'updateLive'); }
  return r;
 };

 // HUD tag while the flag is down (live text cues are hidden by v40msg): a waving flag + FLAG DOWN - PLAY ON, top-left
 WIN.drawHUD = function () {
  const r = oHud.apply(this, arguments);
  try {
   const G = G0();
   if (G && G.sw450 && !off() && scr() === 'live') {
    const s = 'FLAG DOWN - PLAY ON', tw = textW(s, 1), bx = 3, by = 18, bw = tw + 18;
    rect(bx, by, bw, 11, 'rgba(5,7,11,.92)');
    rect(bx, by, bw, 1, '#ffe14d');
    const fl = Math.floor((G.t || 0) * 4) % 2;
    rect(bx + 4, by + 2, 1, 8, '#e8e8e8');
    rect(bx + 5, by + 2 + fl, 5, 4, '#ffd200');
    text(s, bx + 13, by + 4, 1, '#ffe14d', 'left');
   }
  } catch (e) { err(e, 'hud'); }
  return r;
 };
})();
