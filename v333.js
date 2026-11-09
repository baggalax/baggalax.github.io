(function() {
 'use strict';
 const on = () => !window.__rl_v124gb && !window.__rl_no333set;
 const LOG = {
  ask: [],
  apply: []
 };
 const fxGet = () => {
  try {
   return window.V17 && V17.itemFx ? V17.itemFx() : true;
  } catch (e) {
   return true;
  }
 };
 const fxSet = v => {
  try {
   if (window.V17 && V17.itemFx) V17.itemFx(!!v);
  } catch (e) {
   console.error(e);
  }
 };
 const tpGet = () => !!SETTINGS.twoPt;
 const tpSet = v => {
  SETTINGS.twoPt = !!v;
  settingsSave();
 };
 const SUB_FX = 'YES = GEAR, STICKS + TEAM CREW WORK. NO = LOOKS ONLY (BOTH TEAMS)';
 const SUB_TP = 'YES = GOALS FROM OUTSIDE THE DOTTED ARC COUNT 2';
 function askBox(q, title, sub, def, onPick) {
  if (document.getElementById('ask333')) return null;
  const d = document.createElement('div');
  d.id = 'ask333';
  d.dataset.q = q;
  d.style.cssText = 'position:fixed;inset:0;z-index:87;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box';
  const box = document.createElement('div');
  box.style.cssText = 'background:#14222b;border-top:2px solid #ffcc33;box-shadow:0 3px 0 #000;padding:8px 12px 10px;max-width:92%;text-align:center;box-sizing:border-box';
  const h = document.createElement('div');
  h.textContent = title;
  h.style.cssText = 'color:#ffcc33;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:3px';
  box.appendChild(h);
  const s = document.createElement('div');
  s.textContent = sub;
  s.style.cssText = 'color:#cfe;font-size:10px;margin-bottom:8px';
  box.appendChild(s);
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;justify-content:center';
  for (const [lab, v] of [ [ 'YES', true ], [ 'NO', false ] ]) {
   const b = document.createElement('button');
   b.id = 'ask333' + (v ? 'y' : 'n');
   b.textContent = lab;
   b.style.cssText = 'font:inherit;font-size:13px;min-width:92px;padding:8px 10px;border:0;box-shadow:0 2px 0 #000;' + (v === def ? 'background:#ffd23a;color:#0b1a20' : 'background:#3a4a55;color:#cfe');
   b.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    d.remove();
    try {
     SFX.tap && SFX.tap();
    } catch (e) {}
    onPick(v);
   });
   row.appendChild(b);
  }
  box.appendChild(row);
  d.appendChild(box);
  document.body.appendChild(d);
  return d;
 }
 function chain(qs, done, ctx) {
  const ans = {};
  const next = i => {
   if (i >= qs.length) return done(ans);
   const [k, t, s, def] = qs[i];
   askBox(k, t, s, def, v => {
    ans[k] = v;
    LOG.ask.push([ ctx, k, v ]);
    next(i + 1);
   });
  };
  next(0);
 }
 let visit = 0, lastScr = null, answered = -1;
 function scrTick() {
  try {
   const s = typeof screen !== 'undefined' ? screen : null;
   if (s !== lastScr) {
    if (s === 'matchup' && lastScr !== 'lineup') visit++;
    lastScr = s;
   }
  } catch (e) {}
  requestAnimationFrame(scrTick);
 }
 function needQuick(mode, meta) {
  try {
   return on() && mode === 'quick' && !(meta && meta.online) && typeof menuSel !== 'undefined' && menuSel.mode === 'quick' && screen === 'matchup' && answered !== visit && !window.__rl_df2503auto;
  } catch (e) {
   return false;
  }
 }
 function askQuick(then) {
  const v0 = visit;
  chain([ [ 'fx', 'ITEM EFFECTS THIS GAME?', SUB_FX, fxGet() ], [ 'tp', '2-POINTERS THIS GAME?', SUB_TP, tpGet() ] ], a => {
   fxSet(a.fx);
   tpSet(a.tp);
   answered = v0;
   then();
  }, 'quick');
 }
 const itemsAsked = kind => {
  if (kind === 'season') return !!window.V232 && !window.__rl_no232i;
  if (kind === 'college') return !!(window.COL25 && COL25.on && COL25.on()) && !window.__rl_no2502;
  return false;
 };
 function compOf(kind) {
  try {
   if (kind === 'season') return typeof season !== 'undefined' && season && !season.online ? season : null;
   if (kind === 'world') return typeof wgame !== 'undefined' ? wgame : null;
   if (kind === 'college') return window.COL25 && COL25.cur ? COL25.cur() : null;
   if (kind === 'ult') return window.COL25 && COL25.ucur ? COL25.ucur() : null;
  } catch (e) {}
  return null;
 }
 function saveComp(kind) {
  try {
   if (kind === 'season') LS.set('season', season); else if (kind === 'world') wgSave16(); else if (window.COL25 && COL25.save) COL25.save();
  } catch (e) {
   console.error(e);
  }
 }
 function seasonQs(kind) {
  const run = kind === 'world' || kind === 'ult', w = run ? 'RUN' : 'SEASON', nm = {
   season: 'SEASON',
   college: 'COLLEGE SEASON',
   world: 'WORLD GAMES RUN',
   ult: 'ULTIMATE RUN'
  }[kind] || 'SEASON';
  const qs = [];
  if (!itemsAsked(kind)) qs.push([ 'fx', 'ITEM EFFECTS THIS ' + w + '?', 'FOR YOUR WHOLE ' + nm + '. ' + SUB_FX, fxGet() ]);
  qs.push([ 'tp', '2-POINTERS THIS ' + w + '?', 'FOR YOUR WHOLE ' + nm + '. ' + SUB_TP, tpGet() ]);
  return qs;
 }
 function attach(kind, ans) {
  const C = compOf(kind);
  if (!C) return;
  const q = {};
  if (typeof ans.fx === 'boolean') q.fx = ans.fx; else if (typeof C.items232 === 'boolean') q.fx = C.items232;
  if (typeof ans.tp === 'boolean') q.tp = ans.tp;
  C.q333 = q;
  saveComp(kind);
  if (typeof q.fx === 'boolean') fxSet(q.fx);
  if (typeof q.tp === 'boolean') tpSet(q.tp);
 }
 function hookSeason() {
  if (typeof window.ask2503 !== 'function' || window.ask2503.__a333) return;
  const A0 = window.ask2503;
  window.ask2503 = function(kind, go) {
   if (!on()) return A0.apply(this, arguments);
   return A0.call(this, kind, lv => {
    const qs = seasonQs(kind), fin = ans => {
     go(lv);
     try {
      attach(kind, ans);
     } catch (e) {
      console.error(e);
     }
    };
    if (window.__rl_df2503auto) {
     const a = {};
     for (const x of qs) a[x[0]] = x[3];
     return fin(a);
    }
    chain(qs, fin, kind);
   });
  };
  window.ask2503.__a333 = true;
 }
 function compFor(mode, meta) {
  if (meta && meta.online) return null;
  try {
   if (mode === 'season') return typeof season !== 'undefined' && season && !season.online ? season : null;
   if (mode === 'world') return typeof wgame !== 'undefined' ? wgame : null;
   if (mode === 'college' && meta && meta.col25 && window.COL25) {
    const C = meta.ult25 ? COL25.ucur() : COL25.cur();
    return C && C.n === meta.col25.n ? C : null;
   }
  } catch (e) {}
  return null;
 }
 function applyRules(mode, meta) {
  if (!on() || mode === 'quick' || mode === 'tutorial' || mode === 'practice') return;
  const C = compFor(mode, meta), q = C && C.q333;
  if (!q) return;
  if (typeof q.fx === 'boolean' && q.fx !== fxGet()) fxSet(q.fx);
  if (typeof q.tp === 'boolean' && q.tp !== tpGet()) tpSet(q.tp);
  LOG.apply.push([ mode, q.fx, q.tp ]);
 }
 function hookGame() {
  if (typeof window.newGame !== 'function' || window.newGame.__a333) return;
  const NG = window.newGame;
  window.newGame = function(user, opp, mode, userHome, meta) {
   if (needQuick(mode, meta)) {
    if (document.getElementById('ask333')) return;
    const a = arguments, self = this;
    askQuick(() => NG.apply(self, a));
    return;
   }
   try {
    applyRules(mode, meta);
   } catch (e) {
    console.error(e);
   }
   return NG.apply(this, arguments);
  };
  window.newGame.__a333 = true;
 }
 window.V333Q = {
  need: needQuick,
  markAsked35() {
   answered = visit;
  },
  fxGet: fxGet,
  tpGet: tpGet,
  fxSet: fxSet,
  tpSet: tpSet,
  LOG: LOG,
  SUB_FX: SUB_FX,
  SUB_TP: SUB_TP
 };
 try {
  hookGame();
 } catch (e) {
  console.error(e);
 }
 try {
  hookSeason();
 } catch (e) {
  console.error(e);
 }
 requestAnimationFrame(scrTick);
 window.V333 = {
  on: on,
  LOG: LOG,
  askBox: askBox,
  seasonQs: seasonQs,
  compFor: compFor,
  applyRules: applyRules,
  get visit() {
   return visit;
  },
  get answered() {
   return answered;
  }
 };
})();
