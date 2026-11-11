'use strict';

const V29R = (() => {
 const FISH = () => !!window.__rl_v124gb;
 const on = k => !FISH() && !window['__rl_no29' + k];
 const S = (() => {
  try {
   const s = LS.get('v29r', null);
   return s && typeof s === 'object' ? s : {};
  } catch (e) {
   return {};
  }
 })();
 if (!S.won || typeof S.won !== 'object') S.won = {};
 const save = () => {
  try {
   LS.set('v29r', S);
  } catch (e) {}
 };
 const LOG = {
  myt: [],
  pb: [],
  ct: []
 };
 const ESC = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 const css = document.createElement('style');
 css.textContent = [ '.myt29g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;padding:4px 2px 8px}', '.myt29{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:58px;padding:6px 8px 6px 14px;border-radius:6px;border:2px solid #000;text-align:left;font:inherit;cursor:pointer;box-shadow:0 2px 0 #000}', '#panel button.myt29.w,button.myt29.w{background:#f4f6f7;color:#0b1a20;border-color:#000}', '#panel button.myt29.g,button.myt29.g{background:linear-gradient(180deg,#ffe27a,#ffbf1f);color:#2a1a00;border-color:#7a5200}', '#panel button[data-a=v29myt]{white-space:nowrap}', '.myt29 b{font-size:12px;line-height:1.15}', '.myt29 small{font-size:9px;opacity:.8}', '.myt29 em{font-style:normal;font-size:9px;font-weight:bold}', '.myt29 i{position:absolute;left:0;top:0;bottom:0;width:7px;border-radius:4px 0 0 4px}', '.myt29 .on29{position:absolute;right:4px;top:4px;font-size:8px;padding:1px 3px;border-radius:3px;background:#0b1a20;color:#7dff7a}', '.det29{padding:2px 4px 4px;font-size:10px;color:#cfe3ea}', '.pb29row{display:flex;align-items:center;gap:6px;padding:4px 4px;margin:0 0 3px;background:#14222b;border:1px solid #2e4450;border-radius:4px;position:relative;transition:transform .12s}', '.pb29row.drag29{transition:none;z-index:5;background:#20384a;border-color:#ffd23a;box-shadow:0 3px 8px rgba(0,0,0,.6)}', '.pb29h{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:3px;width:26px;height:26px;padding:0 5px;touch-action:none;cursor:grab;-webkit-user-select:none;user-select:none}', '.pb29h i{display:block;height:3px;background:#c9d6d9;border-radius:1px}', '.pb29n{color:#ffd23a;font-size:11px;min-width:14px}', '#panel button.pb29m{min-width:44px}', '#panel button.pb29m[disabled]{opacity:.35}', '.pb29ask{position:absolute;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;z-index:20}', '.pb29box{background:#0f1a21;border:2px solid #ff8a7a;border-radius:6px;padding:10px 14px;display:flex;flex-direction:column;gap:6px;align-items:center;max-width:90%}', '.pb29box b{color:#fff;font-size:13px;text-align:center}', '.pb29box small{color:#c9d6d9;font-size:10px}', '.pb29box .row{gap:10px}' ].join('');
 try {
  document.head.appendChild(css);
 } catch (e) {}
 const mytOn = () => on('myteams') && !window.__rl_noqt26 && !window.__rl_no286qteam && typeof qt26 === 'function' && typeof setHome172 === 'function';
 let MYT = false;
 const tmName = id => {
  try {
   const t = T(id);
   return t ? t.name : String(id);
  } catch (e) {
   return String(id);
  }
 };
 const tmCol = id => {
  try {
   const t = T(id);
   return t ? [ t.c1, t.c2 ] : [ '#888', '#444' ];
  } catch (e) {
   return [ '#888', '#444' ];
  }
 };
 function entries() {
  const out = [];
  const no14 = typeof no2314 === 'function' && no2314();
  try {
   const S0 = season, live = S0 && !S0.online && typeof szAvail15 === 'function' && szAvail15();
   if (!no14) {
    const ents = dd2314Entries(false);
    for (const e of ents) {
     if (e.cur) {
      if (!live) continue;
      out.push({
       key: 'pro:now',
       kind: 'PRO SEASON',
       label: e.label,
       tid: S0.team,
       now: true,
       gold: !!(S0.champ && S0.champ === S0.team),
       done: S0.phase === 'done',
       pick: () => {
        e.pick(id => qt26(id));
        return 'quick';
       }
      });
     } else {
      const d = (szArchList2314() || []).find(x => x.id === e.id) || {};
      out.push({
       key: 'pro:' + e.id,
       kind: 'PRO SEASON' + (d.year ? ' (YEAR ' + d.year + ')' : ''),
       label: e.label,
       tid: d.base,
       gold: !!S.won[e.id] || !!d.id && proRec30(d),
       done: true,
       pick: () => {
        e.pick(id => qt26(id));
        return 'quick';
       }
      });
     }
    }
   } else if (live) out.push({
    key: 'pro:now',
    kind: 'PRO SEASON',
    label: tmName(S0.team) + ' SEASON',
    tid: S0.team,
    now: true,
    gold: !!(S0.champ && S0.champ === S0.team),
    done: S0.phase === 'done',
    pick: () => {
     const t = szBuild15();
     if (t) qt26(t.id);
     return 'quick';
    }
   });
  } catch (e) {
   console.error(e);
  }
  try {
   if (typeof qpcs26Avail === 'function' && qpcs26On() && qpcs26Avail()) {
    const C = qpcs26Cur();
    out.push({
     key: 'col:now',
     kind: 'COLLEGE SEASON',
     label: qpcs26Label(),
     tid: C.team,
     now: true,
     gold: !!(C.champ && C.champ === C.team),
     done: C.phase === 'done',
     pick: () => {
      const t = qpcs26Build();
      if (t) qt26(t.id);
      return 'quick';
     }
    });
   }
  } catch (e) {
   console.error(e);
  }
  try {
   if (!no14) {
    const list = wgArchList2314(), ents = dd2314Entries(true);
    let ai = 0;
    for (const e of ents) {
     if (e.cur) {
      const w = wgame;
      out.push({
       key: 'wg:now',
       kind: 'WORLD GAMES',
       label: e.label,
       tid: e.id,
       now: true,
       gold: !!(w && w.champ && w.champ === w.team),
       done: !!(w && (w.phase === 'done' || w.elim)),
       pick: () => {
        e.pick(id => qt26(id));
        return 'quick';
       }
      });
     } else {
      const d = list[ai] || {};
      out.push({
       key: 'wg:' + ai + ':' + e.id,
       kind: 'WORLD GAMES' + (d.finish ? ' - ' + d.finish : ''),
       label: e.label,
       tid: e.id,
       gold: d.finish === 'WORLD CHAMPIONS' || d.won === true || d.r == null && wonRec30('w', d.team, d.n),
       done: true,
       pick: () => {
        e.pick(id => qt26(id));
        return 'quick';
       }
      });
     }
     if (!e.cur) ai++;
    }
   } else if (typeof wgTeam172 === 'function' && wgTeam172()) {
    const w = wgame;
    out.push({
     key: 'wg:now',
     kind: 'WORLD GAMES',
     label: tmName(w.team) + ' SEASON',
     tid: w.team,
     now: true,
     gold: !!(w.champ && w.champ === w.team),
     done: w.phase === 'done' || !!w.elim,
     pick: () => {
      window.__w172pick = w.team;
      qt26(w.team);
      return 'quick';
     }
    });
   }
  } catch (e) {
   console.error(e);
  }
  try {
   const U = window.COL25 && COL25.on && COL25.on() && COL25.ucur ? COL25.ucur() : null;
   if (U && U.team) out.push({
    key: 'ult:now',
    kind: 'ULTIMATE',
    label: tmName(U.team) + ' ULTIMATE',
    tid: U.team,
    now: true,
    gold: !!(U.champ && U.champ === U.team),
    done: U.phase === 'done',
    pick: () => {
     window.__w172pick = null;
     qt26(U.team);
     return 'quick';
    }
   });
  } catch (e) {
   console.error(e);
  }
  try {
   if (!window.__rl_v124gb && !window.__rl_no332wg) wgTitle332(out);
  } catch (e) {
   console.error(e);
  }
  return out;
 }
 function wgWins332() {
  const won = new Set;
  try {
   const w = typeof wgame !== 'undefined' ? wgame : null;
   if (w && w.team && w.champ && w.champ === w.team) won.add(w.team);
  } catch (e) {}
  try {
   for (const d of wgArchList2314() || []) if (d && d.team && (d.won === true || d.finish === 'WORLD CHAMPIONS')) won.add(d.team);
  } catch (e) {}
  try {
   for (const s of recs30()) {
    const m = /^c?w\|([^|]+)\|/.exec(s);
    if (m) won.add(m[1]);
   }
  } catch (e) {}
  try {
   if (window.V22 && V22.st) {
    const cs = V22.st().cards || {};
    for (const k in cs) {
     const c = cs[k];
     if (c && c.w === 'WORLD GAMES' && c.t) won.add(c.t);
    }
   }
  } catch (e) {}
  try {
   const tg = window.V17 && V17.ST ? (V17.ST().trophies || {}).trophy_globe : null;
   if (tg && tg.team) won.add(tg.team);
  } catch (e) {}
  try {
   const s20 = window.V20 && V20.st ? V20.st() : null;
   if (s20 && s20.redeemed && s20.redeemed.USAGOLD || window.V22 && V22.st && V22.st().usa) won.add('WUSA');
  } catch (e) {}
  return [ ...won ].filter(t => typeof WT_REG !== 'undefined' && WT_REG[t]);
 }
 function wgTitle332(out) {
  for (const tid of wgWins332()) {
   const mine = out.filter(e => e.tid === tid && /^WORLD GAMES/.test(e.kind || ''));
   if (mine.some(e => e.gold)) continue;
   const unk = mine.find(e => e.done && !e.now && !/ - /.test(e.kind));
   if (unk) {
    unk.gold = true;
    unk.t332 = 1;
    continue;
   }
   out.push({
    key: 'wgt332:' + tid,
    kind: 'WORLD GAMES - WORLD CHAMPIONS',
    label: tmName(tid) + ' WORLD GAMES TITLE',
    tid: tid,
    gold: true,
    done: true,
    t332: 1,
    pick: () => {
     window.__w172pick = null;
     qt26(tid);
     return 'quick';
    }
   });
  }
 }
 function onMenu(key) {
  const m = S.myt;
  if (!m || m.key !== key) return false;
  try {
   return LS.get('qteam16', null) === m.q && HOME172 === m.h;
  } catch (e) {
   return false;
  }
 }
 function mytBody() {
  const es = entries();
  const det = '<div class="det29" id="myt29det">YOUR TEAMS. TAP ONE = IT GOES ON YOUR HOME SCREEN (BIG PLAYER + QUICK GAME) WITH ITS OWN UNIFORM + ITEMS. NO MODE STARTS. GOLD = YOU WON THE TITLE WITH THAT TEAM.</div>';
  if (!es.length) return {
   det: det,
   body: '<div class="note" style="padding:8px">NO SAVED TEAMS YET - START A SEASON, A COLLEGE LAX SEASON OR WORLD GAMES AND THE TEAM SHOWS UP HERE.</div>'
  };
  const body = '<div class="myt29g">' + es.map(e => {
   const c = tmCol(e.tid), om = onMenu(e.key);
   const st = e.gold ? e.kind === 'COLLEGE SEASON' ? 'NATIONAL CHAMPIONS' : 'CHAMPIONS' : e.done ? 'NO TITLE' : 'NOT WON YET';
   return '<button type="button" class="myt29 ' + (e.gold ? 'g' : 'w') + '" data-a="v29mytp" data-v="' + ESC(e.key) + '" data-gold="' + (e.gold ? 1 : 0) + '" aria-label="' + ESC(e.label) + '"><i style="background:linear-gradient(180deg,' + ESC(c[0]) + ' 60%,' + ESC(c[1]) + ' 60%)"></i>' + (om ? '<span class="on29">ON MENU</span>' : '') + '<b>' + ESC(e.label) + (e.now ? ' (NOW)' : '') + '</b><small>' + ESC(e.kind) + '</small><em>' + ESC(st) + '</em></button>';
  }).join('') + '</div>';
  return {
   det: det,
   body: body
  };
 }
 function mytPick(key) {
  if (!mytOn()) return false;
  const e = entries().find(x => x.key === key);
  if (!e) return false;
  inPick = true;
  try {
   e.pick();
  } catch (er) {
   console.error(er);
   inPick = false;
   return false;
  }
  inPick = false;
  try {
   setHome172('quick');
  } catch (er) {
   console.error(er);
  }
  try {
   lobby.pid = null;
   lobby.key = '';
  } catch (er) {}
  S.myt = {
   key: key,
   q: LS.get('qteam16', null),
   h: HOME172,
   t: Date.now()
  };
  save();
  LOG.myt.push({
   key: key,
   q: S.myt.q,
   h: S.myt.h
  });
  MYT = false;
  try {
   screen = 'menu';
   panelDirty();
  } catch (er) {}
  try {
   if (window.V17 && V17.toast) V17.toast('HOME SCREEN: ' + e.label, e.gold ? '#ffcc33' : '#ffffff');
  } catch (er) {}
  return true;
 }
 function hookLocker() {
  if (typeof PANEL_RENDER === 'undefined' || !PANEL_RENDER.locker17 || PANEL_RENDER.locker17.__v29) return;
  const R0 = PANEL_RENDER.locker17;
  const R1 = function() {
   let h = R0.apply(this, arguments);
   if (!mytOn()) {
    MYT = false;
    return h;
   }
   try {
    const tb = '<button type="button" data-a="v29myt" class="' + (MYT ? 'on' : 'd') + '" aria-label="MY TEAMS">MY TEAMS</button>';
    const m = h.match(/<button type="button" data-a="v17sec" data-v="all"[^>]*>ALL<\/button>/);
    if (!m) return h;
    h = h.replace(m[0], m[0] + tb);
    if (!MYT) return h;
    h = h.replace(/(data-a="v17sec" data-v="[^"]*") class="on"/g, '$1 class="d"');
    const cut = h.indexOf('<div class="scroll" id="lockList">');
    if (cut < 0) return h;
    let pre = h.slice(0, cut);
    const r = mytBody();
    pre = pre.replace(/<div class="det17">[\s\S]*?<\/div>$/, '') + r.det;
    return pre + '<div class="scroll" id="lockList">' + r.body + '</div>';
   } catch (e) {
    console.error(e);
    return h;
   }
  };
  R1.__v29 = true;
  PANEL_RENDER.locker17 = R1;
  if (typeof PANEL_ACT !== 'undefined') {
   const s0 = PANEL_ACT.v17sec;
   if (s0 && !s0.__v29) {
    const s1 = function() {
     MYT = false;
     return s0.apply(this, arguments);
    };
    s1.__v29 = true;
    PANEL_ACT.v17sec = s1;
   }
   PANEL_ACT.v29myt = () => {
    if (!mytOn()) return;
    try {
     if (PANEL_ACT.v17sec) PANEL_ACT.v17sec('all');
    } catch (e) {}
    MYT = true;
    try {
     const l = document.getElementById('lockList');
     if (l) l.scrollTop = 0;
    } catch (e) {}
   };
   PANEL_ACT.v29mytp = v => {
    mytPick(v);
   };
  }
 }
 let inPick = false;
 function wq() {
  if (!mytOn() || !S.myt || S.myt.key !== 'wg:now' || !onMenu('wg:now') || HOME172 !== 'quick') return false;
  try {
   const wt = wgTeam172();
   return !!wt && LS.get('qteam16', null) === wt;
  } catch (e) {
   return false;
  }
 }
 function hookQt() {
  if (typeof qt26 !== 'function' || qt26.__v29) return;
  const Q0 = qt26;
  const Q1 = function() {
   if (!inPick && S.myt) {
    delete S.myt;
    save();
   }
   return Q0.apply(this, arguments);
  };
  Q1.__v29 = true;
  window.qt26 = Q1;
 }
 hookQt();
 const recs30 = () => {
  try {
   return [].concat(LS.get('tc232', []) || [], LS.get('cc232', []) || []).map(String);
  } catch (e) {
   return [];
  }
 };
 function wonRec30(k, team, n) {
  if (!on('myteams') || !team) return false;
  const p1 = 'w|' + team + '|' + (n || '') + '|', p2 = 'c' + p1;
  return recs30().some(s => s.startsWith(p1) || s.startsWith(p2));
 }
 function proRec30(d) {
  if (!on('myteams') || !d || !d.base) return false;
  try {
   if ((szArchList2314() || []).filter(x => x.base === d.base && (x.year || '') === (d.year || '')).length !== 1) return false;
  } catch (e) {
   return false;
  }
  const p1 = 's|f|' + (d.year || '') + '|' + d.base + '|', p2 = 'cf|' + (d.year || '') + '|' + d.base + '|';
  return recs30().some(s => s.startsWith(p1) || s.startsWith(p2));
 }
 function hookWgArch30() {
  if (typeof wgArchPush2314 !== 'function' || wgArchPush2314.__v30) return;
  const A0 = wgArchPush2314;
  const A1 = function(w) {
   if (!on('myteams')) return A0.apply(this, arguments);
   try {
    if (typeof no2314 === 'function' && no2314() || !w || !w.team || !WT_REG[w.team]) return null;
    const list = wgArchList2314(), r = (w.results || []).length, won = !!(w.champ && w.champ === w.team), fin = w.finish || null, n = w.n || 0;
    if (list.some(d => d.team === w.team && (d.n || 0) === n && (d.finish || null) === fin && (d.r == null || d.r === r))) return null;
    const d = {
     team: w.team,
     n: n,
     finish: fin,
     won: won,
     r: r
    };
    list.push(d);
    LS.set('wg2314', list.slice(-12));
    return d;
   } catch (e) {
    console.error(e);
    return null;
   }
  };
  A1.__v30 = true;
  window.wgArchPush2314 = A1;
 }
 hookWgArch30();
 function hookArch() {
  if (typeof szArchPush2314 !== 'function' || szArchPush2314.__v29) return;
  const A0 = szArchPush2314;
  const A1 = function(S0) {
   const d = A0.apply(this, arguments);
   try {
    if (d && d.id && S0 && S0.champ && S0.champ === S0.team) {
     S.won[d.id] = 1;
     save();
    }
   } catch (e) {
    console.error(e);
   }
   return d;
  };
  A1.__v29 = true;
  window.szArchPush2314 = A1;
 }
 hookArch();
 const pbOn = () => on('playbook') && typeof playsAll === 'function' && typeof playsSave === 'function' && typeof PANEL_RENDER !== 'undefined';
 let pbAsk = null, pbBack = 'playmaker', DRG = null;
 function pbRaw() {
  try {
   const v = LS.get('plays', []);
   return Array.isArray(v) ? v : [];
  } catch (e) {
   return [];
  }
 }
 function pbWrite(valid) {
  const odd = pbRaw().filter(p => !(p && Array.isArray(p.start) && Array.isArray(p.steps)));
  playsSave(valid.concat(odd));
 }
 function pbMove(id, to) {
  const list = playsAll(), i = list.findIndex(p => p.id === id);
  if (i < 0) return false;
  to = Math.max(0, Math.min(list.length - 1, to));
  if (to === i) return false;
  const [p] = list.splice(i, 1);
  list.splice(to, 0, p);
  pbWrite(list);
  LOG.pb.push({
   move: id,
   from: i,
   to: to
  });
  return true;
 }
 function pbDelete(id) {
  const list = playsAll(), p = list.find(q => q.id === id);
  if (!p) return false;
  pbWrite(list.filter(q => q.id !== id));
  try {
   if (typeof PM !== 'undefined' && PM && PM.editId === id) PM.editId = null;
  } catch (e) {}
  LOG.pb.push({
   del: id
  });
  return true;
 }
 function pbOpen(from) {
  if (!pbOn()) return;
  pbAsk = null;
  pbBack = from || (typeof PM !== 'undefined' && PM ? 'playmaker' : 'plays');
  screen = 'pb29';
  panelDirty();
 }
 function pbCat(p) {
  try {
   return pmCat(p);
  } catch (e) {
   return '';
  }
 }
 function renderPb() {
  const list = playsAll();
  const head = '<div class="hd"><div><div class="tt">PLAYBOOK</div><div class="st">' + list.length + ' SAVED PLAY' + (list.length === 1 ? '' : 'S') + ' - THE ORDER YOUR PLAYBOOK SHOWS THEM IN GAMES. DRAG THE GRIP OR UP / DOWN TO MOVE ONE</div></div><div class="sp"></div>' + btn('BACK', 'pb29back', null, 'g') + '</div>';
  const rows = list.map((p, i) => '<div class="pb29row" data-id="' + ESC(p.id) + '"><span class="pb29h" role="button" aria-label="DRAG ' + ESC(p.name) + '"><i></i><i></i><i></i></span><span class="pb29n">' + (i + 1) + '</span><span class="pname">' + ESC(p.name) + '</span><span class="dim2">' + ESC(pbCat(p)) + ' - ' + p.steps.length + ' STEPS</span><span class="sp"></span>' + '<button type="button" data-a="pb29up" data-v="' + ESC(p.id) + '" class="pb29m"' + (i === 0 ? ' disabled' : '') + ' aria-label="MOVE ' + ESC(p.name) + ' UP">UP</button>' + '<button type="button" data-a="pb29dn" data-v="' + ESC(p.id) + '" class="pb29m"' + (i === list.length - 1 ? ' disabled' : '') + ' aria-label="MOVE ' + ESC(p.name) + ' DOWN">DOWN</button>' + '<button type="button" data-a="pb29del" data-v="' + ESC(p.id) + '" class="r" aria-label="DELETE ' + ESC(p.name) + '">DELETE</button></div>').join('');
  const ask = pbAsk && list.find(p => p.id === pbAsk);
  const modal = ask ? '<div class="pb29ask" id="pb29ask"><div class="pb29box"><b>DELETE ' + ESC(ask.name) + '?</b><small>IT LEAVES YOUR PLAYBOOK FOR GOOD.</small><div class="row">' + '<button type="button" data-a="pb29yes" data-v="' + ESC(ask.id) + '" class="r" aria-label="YES DELETE">DELETE</button><button type="button" data-a="pb29no" class="g" aria-label="KEEP">KEEP</button></div></div></div>' : '';
  return head + '<div class="scroll" id="pb29list">' + (rows || '<div class="note" style="padding:8px">NO SAVED PLAYS YET - DRAW ONE IN PLAYMAKER AND HIT SAVE. BUILT-IN PLAYS ARE ALWAYS IN YOUR PLAYBOOK.</div>') + '</div>' + modal;
 }
 function pbDrag() {
  const pos = ev => ({
   y: ev.clientY
  });
  document.addEventListener('pointerdown', ev => {
   if (screen !== 'pb29' || pbAsk) return;
   const h = ev.target && ev.target.closest ? ev.target.closest('.pb29h') : null;
   if (!h) return;
   const row = h.closest('.pb29row'), list = document.getElementById('pb29list');
   if (!row || !list) return;
   ev.preventDefault();
   const rows = [ ...list.querySelectorAll('.pb29row') ], i0 = rows.indexOf(row);
   const mids = rows.map(r => {
    const b = r.getBoundingClientRect();
    return b.top + b.height / 2 + list.scrollTop;
   }), rh = row.getBoundingClientRect().height + 3;
   DRG = {
    id: row.dataset.id,
    row: row,
    rows: rows,
    list: list,
    i0: i0,
    to: i0,
    y0: pos(ev).y,
    st0: list.scrollTop,
    mids: mids,
    rh: rh,
    pid: ev.pointerId,
    moved: false
   };
   row.classList.add('drag29');
   try {
    h.setPointerCapture(ev.pointerId);
   } catch (e) {}
  }, true);
  const move = ev => {
   if (!DRG || ev.pointerId !== DRG.pid) return;
   ev.preventDefault();
   const L0 = DRG.list, lb = L0.getBoundingClientRect(), y = pos(ev).y;
   if (y < lb.top + 22) L0.scrollTop -= 6; else if (y > lb.bottom - 22) L0.scrollTop += 6;
   const dy = y - DRG.y0 + (L0.scrollTop - DRG.st0);
   if (Math.abs(dy) > 4) DRG.moved = true;
   const c = DRG.mids[DRG.i0] + dy;
   let to = 0;
   DRG.mids.forEach((m, k) => {
    if (k !== DRG.i0 && m < c) to++;
   });
   DRG.to = to;
   DRG.row.style.transform = 'translateY(' + dy + 'px)';
   DRG.rows.forEach((r, k) => {
    if (k === DRG.i0) return;
    let s = 0;
    if (DRG.i0 < to && k > DRG.i0 && k <= to) s = -DRG.rh;
    if (DRG.i0 > to && k >= to && k < DRG.i0) s = DRG.rh;
    r.style.transform = s ? 'translateY(' + s + 'px)' : '';
   });
  };
  const up = ev => {
   if (!DRG || ev.pointerId !== DRG.pid) return;
   const d = DRG;
   DRG = null;
   d.rows.forEach(r => {
    r.style.transform = '';
    r.classList.remove('drag29');
   });
   if (d.moved && d.to !== d.i0) {
    pbMove(d.id, d.to);
    try {
     SFX.tap();
    } catch (e) {}
   }
   panelDirty();
  };
  document.addEventListener('pointermove', move, {
   capture: true,
   passive: false
  });
  document.addEventListener('pointerup', up, true);
  document.addEventListener('pointercancel', up, true);
 }
 function hookPb() {
  if (typeof PANEL_RENDER === 'undefined' || PANEL_RENDER.pb29) return;
  PANEL_RENDER.pb29 = renderPb;
  try {
   if (!PANEL_SCREENS.includes('pb29')) PANEL_SCREENS.push('pb29');
  } catch (e) {}
  Object.assign(PANEL_ACT, {
   pb29back() {
    pbAsk = null;
    DRG = null;
    screen = pbBack === 'playmaker' && typeof PM !== 'undefined' && PM ? 'playmaker' : 'plays';
   },
   pb29up(v) {
    const i = playsAll().findIndex(p => p.id === v);
    if (i > 0) pbMove(v, i - 1);
   },
   pb29dn(v) {
    const i = playsAll().findIndex(p => p.id === v);
    if (i >= 0) pbMove(v, i + 1);
   },
   pb29del(v) {
    pbAsk = v;
   },
   pb29yes(v) {
    if (pbAsk === v) pbDelete(v);
    pbAsk = null;
   },
   pb29no() {
    pbAsk = null;
   },
   pb29open() {
    pbOpen('plays');
   }
  });
  const P0 = PANEL_RENDER.plays;
  if (P0 && !P0.__v29) {
   const P1 = function() {
    const h = P0.apply(this, arguments);
    if (!pbOn()) return h;
    const nb = '<button type="button" data-a="plNew"';
    const i = h.indexOf(nb);
    return i < 0 ? h : h.slice(0, i) + '<button type="button" data-a="pb29open" class="y" aria-label="PLAYBOOK">PLAYBOOK</button>' + h.slice(i);
   };
   P1.__v29 = true;
   PANEL_RENDER.plays = P1;
  }
  pbDrag();
 }
 function pmButton(y) {
  if (!pbOn()) return;
  try {
   button('PLAYBOOK', 4, y, 50, 12, () => pbOpen('playmaker'), {
    bg: '#ffd23a'
   });
  } catch (e) {
   console.error(e);
  }
 }
 const API = {
  on: on,
  LOG: LOG,
  st: () => S,
  entries: entries,
  mytPick: mytPick,
  mytOn: mytOn,
  myt: () => MYT,
  wq: wq,
  pbOn: pbOn,
  pbOpen: pbOpen,
  pbMove: pbMove,
  pbDelete: pbDelete,
  pmButton: pmButton,
  pbAsk: () => pbAsk
 };
 function init() {
  hookLocker();
  hookPb();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
 return API;
})();

window.V29R = V29R;
