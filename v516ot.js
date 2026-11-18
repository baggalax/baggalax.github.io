/* v516ot.js - BAGGA LAX 1.3: PICK YOUR OVERTIME (QUICK MATCH) + ONLINE OT RULE.
 * Charlie (Nov 11 2026, 10:29 PM): "for overtime you can choose extra quarter golden goal or brave heart it pops up once you go
 *  into ot ... For quick match ... For all others it's the overtime rules".
 * Before (game.js endQuarter, every mode incl. online): tied after regulation -> OT (one full extra quarter) -> still tied ->
 *  2OT (another full quarter) -> still tied -> BRAVEHEART (1 on 1 + goalies, next goal wins).
 * Now:
 *  - QUICK MATCH (offline): the moment a tied game goes to OT a popup asks EXTRA QUARTER / GOLDEN GOAL / BRAVEHEART; the game
 *    waits on the break screen until you pick. EXTRA QUARTER = one full quarter, highest score wins, still tied -> asked again.
 *    GOLDEN GOAL = next goal wins (full teams, no clock - the game's own sudden-victory state). BRAVEHEART = the game's existing
 *    braveheart (1 on 1 + goalies, next goal wins).
 *  - ONLINE (non-season): the HOME player picks the OT rule in the lobby (the settings heading row becomes the OT row); it rides
 *    as one optional extra key, settings.ot516 ('golden' | 'quarter' | 'brave'), inside the existing lobby settings object.
 *    No key = GOLDEN GOAL. Both sides apply the same rule at the same OT break (the break both sides already run), so nothing
 *    else in the net protocol changes.
 *  - Every other mode (season, college, world, online season games...): GOLDEN GOAL in every OT period - the first goal in OT
 *    ends the game right away; if nobody scores, the game's own OT -> 2OT -> BRAVEHEART progression carries on as before.
 *    (Charlie, 10:53 PM: "all modes are supposed to be golden goal"). Tutorial/practice untouched. Sub-switch window.__rl_516nogg.
 * Kill switch: window.__rl_no516ot (checked live; with it on, everything above falls back to the old rule).
 */
(function () {
 'use strict';
 if (window.__rl_no516ot) return;
 const WIN = window;
 for (const n of ['step', 'drawQBreak', 'perLabel', 'card', 'text', 'button', 'otLen173']) if (typeof WIN[n] !== 'function') { WIN.V516 = { on: false, err: 'missing ' + n }; return; }
 const V = WIN.V516 = { on: true, ver: 5160, picks: [], applied: [], err: null, RULES: ['quarter', 'golden', 'brave'] };
 const off = () => !!WIN.__rl_no516ot;
 const err = (e, w) => { V.err = (w || '') + ': ' + String(e && e.message || e).slice(0, 160); try { console.warn('[v516ot]', w, e); } catch (_) {} };
 const scr = () => { try { return screen; } catch (e) { return ''; } };
 const NET = () => WIN.RLNET || null;
 const tap = () => { try { SFX.tap && SFX.tap(); } catch (e) {} };

 // which rule set this game uses: 'ask' (quick match), a fixed rule (online), or null (mode keeps its own rule)
 function ruleFor(G) {
  if (!G || G.tutorial || G.practice || G.over) return null;
  if (G.online) {
   if (G.mode !== 'online') return null;   // online season games keep the old rule
   const N = NET(), s = N && N.st && N.st.settings;
   const r = s && s.ot516;
   return V.RULES.includes(r) ? r : 'golden';
  }
  if (G.mode === 'quick') return 'ask';
  return null;
 }
 V.ruleFor = () => { try { return ruleFor(game); } catch (e) { return null; } };

 // turn whatever OT state game.js just set up (OT quarter / braveheart) into the chosen rule
 function apply(G, rule) {
  if (rule === 'quarter') {
   if (G.brave) { G.brave = false; G.ot = false; G.otq = (G.otq || 0) + 1; G.clock = otLen173(G); }
   else if (!G.otq) { G.otq = 1; G.clock = otLen173(G); }
   G.ot = false; G.gg516 = false;
  } else if (rule === 'golden') {
   G.brave = false; G.ot = true; G.gg516 = true; G.clock = 0; G.pen = null; G.penPending = null;
  } else if (rule === 'brave') {
   G.brave = true; G.ot = true; G.gg516 = false; G.clock = 0; G.pen = null; G.penPending = null;
  }
  G.ot516 = rule; V.applied.push(rule + '@q' + G.q);
 }
 function pick(rule) {
  try {
   const G = game; if (!G || !G.ot516pend) return;
   G.ot516pend = false; V.picks.push(rule); apply(G, rule); G.qT = 0; tap();
  } catch (e) { err(e, 'pick'); }
 }
 V.pick = pick;
 V.pending = () => { try { return !!(game && game.ot516pend); } catch (e) { return false; } };

 function otBreak(G) {
  if (scr() !== 'qbreak' || !G || G.over) return;
  const NP = G.periods || 4;
  if (!(G.q > NP) || G.ot516k === G.q) return;
  if (G.score && G.score[0] !== G.score[1]) return;
  G.ot516k = G.q;
  const r = ruleFor(G);
  if (!r) return;
  if (r === 'ask') { G.ot516pend = true; G.qT = 0; } else apply(G, r);
 }

 const oStep = WIN.step;
 WIN.step = function (dt) {
  try {
   if (!off()) {
    const G = game;
    if (G) { otBreak(G); if (G.ot516pend && scr() === 'qbreak') G.qT = 0; else if (G.ot516pend && scr() !== 'qbreak') G.ot516pend = false; }
   }
  } catch (e) { err(e, 'step'); }
  return oStep.apply(this, arguments);
 };

 const TH = n => n + (n % 10 === 1 && n % 100 !== 11 ? 'ST' : n % 10 === 2 && n % 100 !== 12 ? 'ND' : n % 10 === 3 && n % 100 !== 13 ? 'RD' : 'TH');
 const oQB = WIN.drawQBreak;
 WIN.drawQBreak = function () {
  const G = game;
  if (off() || !G) return oQB.apply(this, arguments);
  let r;
  if (G.gg516 && G.ot && !G.brave && G.otq) { const q = G.otq; G.otq = 0; try { r = oQB.apply(this, arguments); } finally { G.otq = q; } }
  else r = oQB.apply(this, arguments);
  try {
   const cx = W / 2;
   if (!G.ot516pend && !G.brave && !G.ot && G.otq >= 3) {   // 3RD+ OVERTIME card (game.js stops at 2ND)
    card(cx - 95, 40, 190, 96);
    text(TH(G.otq) + ' OVERTIME', cx, 50, 3, '#ffe14d', 'center', '#000');
    text('TIED - ONE MORE FULL QUARTER (' + fmtClock(otLen173(G)) + ')', cx, 72, 1, '#fff', 'center');
    if (typeof scoreLine === 'function') scoreLine(cx, 86);
    text('TAP TO CONTINUE', cx, 122, 1, Math.floor(G.t * 2) % 2 ? '#8fe3f0' : '#4b8a95', 'center');
   }
   if (!G.ot516pend && ownRuleGG(G) && !(G.otq >= 3)) {   // own-rule modes: the OT period is golden goal now
    rect(cx - 93, 70, 186, 8, '#0a1018');
    text('GOLDEN GOAL - NEXT GOAL WINS (' + fmtClock(otLen173(G)) + ')', cx, 72, 1, '#fff', 'center');
   }
   if (G.ot516pend) drawPick(G, cx);
  } catch (e) { err(e, 'draw'); }
  return r;
 };
 function drawPick(G, cx) {
  const cw = Math.min(210, W - 16), x = Math.round(cx - cw / 2), y0 = 26;
  rect(0, 0, W, H, 'rgba(0,0,0,.45)');
  card(x, y0, cw, 132);
  text('OVERTIME!', cx, y0 + 6, 2, '#ffe14d', 'center', '#000');
  text('TIED ' + G.score[0] + '-' + G.score[1] + ' - PICK HOW TO PLAY IT', cx, y0 + 21, 1, '#8fe3f0', 'center');
  const opts = [
   ['EXTRA QUARTER', 'ONE FULL QUARTER - STILL TIED? PICK AGAIN', 'quarter', '#7dff7a'],
   ['GOLDEN GOAL', 'NEXT GOAL WINS - FULL TEAMS', 'golden', '#ffd23a'],
   ['BRAVEHEART', '1 ON 1 + GOALIES - NEXT GOAL WINS', 'brave', '#ff8a5a']
  ];
  const bw = cw - 24, bx = x + 12;
  opts.forEach((o, i) => {
   const by = y0 + 32 + i * 32;
   button(o[0], bx, by, bw, 15, () => pick(o[2]), { bg: o[3], fg: '#0b1a20' });
   const d = o[1];
   if (typeof textW === 'function' && textW(d, 1) > bw && typeof textMini === 'function') textMini(d, cx, by + 19, '#cfe'); else text(d, cx, by + 19, 1, '#cfe', 'center');
  });
 }


 // ---- every other mode (season, college, world, online season...): the first goal in any OT period ends the game ----
 // (Charlie, Nov 11 10:53 PM: "all modes are supposed to be golden goal"). Nobody scores -> the game's own OT -> 2OT ->
 // BRAVEHEART progression still runs. Done by flipping game.ot on at the goal, so game.js's own "goal in OT -> finishGame" path
 // ends it (same banner/final screen as a braveheart winner).
 function ownRuleGG(G) {
  if (off() || WIN.__rl_516nogg || !G || G.tutorial || G.practice || G.over) return false;
  if (!((G.otq || 0) >= 1) || G.ot || G.brave) return false;
  if (G.online) return G.mode !== 'online';
  return G.mode !== 'quick';
 }
 V.ggEnds = 0;
 const gg = () => { const G = game; G.ot = true; G.gg516 = true; G.ggEnd516 = true; V.ggEnds++; };
 for (const [n, test] of [['endPossession', k => k === 'goal'], ['dEnd', k => k === 'cgoal']]) {
  const o = WIN[n]; if (typeof o !== 'function') continue;
  WIN[n] = function (kind) { try { if (test(kind) && ownRuleGG(game)) gg(); } catch (e) { err(e, n); } return o.apply(this, arguments); };
 }
 { const o = WIN.afterCpu; if (typeof o === 'function') WIN.afterCpu = function () { try { const G = game; if (G && G.cpu && G.cpu.outcome === 'goal' && ownRuleGG(G)) gg(); } catch (e) { err(e, 'afterCpu'); } return o.apply(this, arguments); }; }

 // OT label past 2OT (game.js caps the label at 2OT)
 const oPL = WIN.perLabel;
 WIN.perLabel = function (G) {
  try { if (!off() && G && !G.brave && !G.ot && G.otq >= 3) return G.otq + 'OT'; } catch (e) {}
  return oPL.apply(this, arguments);
 };

 const oText = WIN.text;
 // ---- online lobby: the HOME player's OT rule row (replaces the settings heading line in non-season lobbies) ----
 const ORDER = ['golden', 'quarter', 'brave'];
 const COL = { golden: '#ffd23a', quarter: '#7dff7a', brave: '#ff8a5a' };
 function lobbyPick(v) {
  const N = NET(); if (!N || !N.lobby || !N.lobby.state || N.side !== 'h') return;
  const st = N.lobby.state; if (st.start || st.season) return;
  const S0 = st.settings || {};
  if ((S0.ot516 || 'golden') === v && S0.ot516) return;
  const s = Object.assign({}, S0, { ot516: v });
  N.hostSet = s; N.hostSetT = performance.now();
  N.sseq = Math.max(Date.now(), (N.sseq || 0) + 1);
  try { if (typeof N.patchLobby === 'function') N.patchLobby({ settings: s, sseq: N.sseq }); } catch (e) { err(e, 'patch'); }
  st.settings = s; st.hready = false; st.gready = false; tap();
 }
 V.lobbyPick = lobbyPick;
 const SETS = [['GOLDEN GOAL', 'EXTRA QTR', 'BRAVEHEART'], ['GOLDEN', 'EXTRA QTR', 'BRAVE'], ['GOLDEN', '+1 QTR', 'BRAVE']];   // golden, quarter, brave
 const LONG = { golden: 'GOLDEN GOAL', quarter: 'EXTRA QUARTER', brave: 'BRAVEHEART' };
 function lobbyRow(y, host) {
  const N = NET(), st = N.lobby.state, cur = V.RULES.includes(st.settings && st.settings.ot516) ? st.settings.ot516 : 'golden';
  const colW = 100, x0 = colW + 6, gw = W - 2 * x0;
  const lw = 13, h = 8, gap = 2, bw = Math.floor((gw - lw - 2 * gap) / 3);
  const yy = y - 2, edit = host && !st.start;
  const set = SETS.find(L => L.every(l => textW(l, 1) <= bw - 3));
  if (!set) {   // narrow phones: one full-width row, the home player taps it to go to the next rule
   const lab = 'OT: ' + LONG[cur] + (edit ? '  >' : '');
   if (edit) button(lab, x0, yy, gw, h, () => lobbyPick(ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length]), { bg: COL[cur], fg: '#0b1a20', fit: true });
   else { rect(x0, yy, gw, h, COL[cur]); if (textW(lab, 1) > gw - 2) textMini(lab, x0 + gw / 2, yy + 2, '#0b1a20'); else text(lab, x0 + gw / 2, yy + 1, 1, '#0b1a20', 'center'); }
   return;
  }
  const lab = { golden: set[0], quarter: set[1], brave: set[2] };
  oText('OT', x0 + 6, yy + 1, 1, host ? '#ffe14d' : '#ff9a4a', 'center');
  ORDER.forEach((k, i) => {
   const x = x0 + lw + i * (bw + gap), ww = i === 2 ? gw - lw - 2 * (bw + gap) : bw, on = cur === k;
   if (edit) button(lab[k], x, yy, ww, h, () => lobbyPick(k), { bg: on ? COL[k] : '#3a4a55', fg: on ? '#0b1a20' : '#cfe' });
   else { rect(x, yy, ww, h, on ? COL[k] : 'rgba(40,52,62,.6)'); oText(lab[k], x + ww / 2, yy + 1, 1, on ? '#0b1a20' : '#6c7f8a', 'center'); }
  });
 }
 const HEADS = { 'SETTINGS - YOU SET THEM': true, 'SET BY THE HOME TEAM (READ ONLY)': false };
 WIN.text = function (s, x, y) {
  if (typeof s === 'string' && s in HEADS && !off() && !WIN.__rl_516nolobby) {
   try {
    const N = NET();
    if (scr() === 'onLobby' && N && N.lobby && N.lobby.state && !N.lobby.state.season) { lobbyRow(y, HEADS[s]); return; }
   } catch (e) { err(e, 'lobby'); }
  }
  return oText.apply(this, arguments);
 };
})();
