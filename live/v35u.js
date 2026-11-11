'use strict';

(function() {
 const MINP = 15;
 const LOG = {
  block: [],
  coach: [],
  ct: [],
  lock: [],
  relu: [],
  refused: []
 };
 const off = () => !!window.__rl_no35ult || !!window.__rl_v124gb;
 const C = () => window.COL25 || null;
 const ruleOn = () => {
  try {
   return !off() && !!C() && C().on() && C().on2501();
  } catch (e) {
   return false;
  }
 };
 const err = (e, w) => {
  try {
   console.warn('v35u ' + w, e && e.message);
  } catch (x) {}
 };
 function coachCards() {
  try {
   if (window.HON25 && HON25.coachCards) return HON25.coachCards() || [];
   const c = window.V232 && V232.coaches ? V232.coaches() : {};
   return Object.keys(c).map(id => ({
    id: id,
    name: c[id].n,
    team: id
   }));
  } catch (e) {
   return [];
  }
 }
 function nPlayers(opp) {
  try {
   return opp === undefined ? C().ownedCards().length : C().uOwn(opp).length;
  } catch (e) {
   return 0;
  }
 }
 function why(opp) {
  const n = opp === undefined ? nPlayers() : poolFor(opp).length, cc = coachCards().length;
  if (n >= MINP && cc > 0) return null;
  return 'NEED ' + MINP + ' PLAYER CARDS + 1 COACH CARD (YOU HAVE ' + n + ' / ' + cc + ')';
 }
 const LOCKMSG = 'ROSTER LOCKED FOR ULTIMATE';
 let BUILD = 0;
 function lockU() {
  try {
   if (!ruleOn()) return null;
   const U = C().ucur();
   if (!U || U.phase !== 'ko' || !C().uGame(U)) return null;
   if (!Array.isArray(U.lk35)) {
    if (C().uOwn(C().uGame(U).opp).length < MINP || !coachCards().length) return null;
    U.lk35 = C().ownedCards().slice();
    U.lk35at = Date.now();
    LOG.lock.push([ U.n, U.lk35.length ]);
    try {
     C().save();
    } catch (e) {}
   }
   return U;
  } catch (e) {
   err(e, 'lock');
   return null;
  }
 }
 const lockSet = U => new Set(U.lk35);
 function poolFor(opp) {
  try {
   const ids = C().uOwn(opp || null), U = lockU();
   if (!U) return ids;
   const s = lockSet(U);
   return ids.filter(id => s.has(id));
  } catch (e) {
   return [];
  }
 }
 const luAll = lu => lu ? [ ...lu.A || [], ...lu.M || [], ...lu.D || [], lu.LSM, lu.SSDM, lu.SSDM2, lu.FO, lu.G ] : [];
 const inPool = (lu, pool) => {
  try {
   const s = new Set(pool);
   return !!lu && lineupValid(lu, pool) && luAll(lu).every(id => s.has(id));
  } catch (e) {
   return false;
  }
 };
 function lockedLu(lu0, pool) {
  if (inPool(lu0, pool)) return lu0;
  let lu = null;
  try {
   const st = C().st(), base = lu0 || st && st.ulu || null;
   if (base) lu = migrateLineup(JSON.parse(JSON.stringify(base)), pool);
  } catch (e) {
   lu = null;
  }
  if (!inPool(lu, pool)) {
   try {
    lu = pool.length ? autoLineup(pool) : null;
   } catch (e) {
    lu = null;
   }
  }
  return inPool(lu, pool) ? lu : null;
 }
 const ultLuScreen = () => typeof PS !== 'undefined' && (PS.luSrc === 'ult25' || PS.luBack === 'timeout' && typeof game !== 'undefined' && !!game && !!game.meta && !!game.meta.ult25);
 function flashLock() {
  try {
   let d = document.getElementById('u35lockmsg');
   if (!d) {
    d = document.createElement('div');
    d.id = 'u35lockmsg';
    d.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99999;pointer-events:none;background:#200;color:#ff6b5c;border:2px solid #ff6b5c;font:bold 13px monospace;padding:8px 12px;max-width:80vw;text-align:center;white-space:normal';
    document.body.appendChild(d);
   }
   d.textContent = LOCKMSG;
   d.style.display = 'block';
   clearTimeout(flashLock.t);
   flashLock.t = setTimeout(() => {
    d.style.display = 'none';
   }, 2200);
  } catch (e) {}
 }
 function hookLock() {
  if (window.__v35ulock) return;
  window.__v35ulock = true;
  const TR0 = window.teamRosterIds;
  if (typeof TR0 === 'function') window.teamRosterIds = function(teamId, src) {
   const r = TR0.apply(this, arguments);
   try {
    if (src === 'ult25' && Array.isArray(r)) {
     const U = lockU();
     if (U) {
      const s = lockSet(U);
      return r.filter(id => s.has(id));
     }
    }
   } catch (e) {
    err(e, 'tr');
   }
   return r;
  };
  const LF0 = window.lineupFor;
  if (typeof LF0 === 'function') window.lineupFor = function(teamId, src) {
   const lu0 = LF0.apply(this, arguments);
   try {
    const U = lockU();
    if (!U || !(src === 'ult25' || BUILD && teamId === U.team)) return lu0;
    const pool = teamRosterIds(U.team, 'ult25'), lu = lockedLu(lu0, pool);
    if (lu && lu !== lu0) {
     LOG.relu.push([ src || 'game', luAll(lu0).filter(id => !pool.includes(id)) ]);
     return JSON.parse(JSON.stringify(lu));
    }
   } catch (e) {
    err(e, 'lf');
   }
   return lu0;
  };
  const NG0 = window.newGame;
  if (typeof NG0 === 'function') window.newGame = function(user, opp, mode, home, meta) {
   const b = !!(meta && meta.ult25);
   if (b) BUILD++;
   try {
    return NG0.apply(this, arguments);
   } finally {
    if (b) BUILD--;
   }
  };
  const AS0 = window.assignSlot;
  if (typeof AS0 === 'function') window.assignSlot = function(id) {
   try {
    if (ultLuScreen()) {
     const U = lockU();
     if (U && id && !lockSet(U).has(id)) {
      LOG.refused.push(id);
      flashLock();
      return;
     }
    }
   } catch (e) {
    err(e, 'as');
   }
   return AS0.apply(this, arguments);
  };
  if (window.COL25 && typeof COL25.playUlt === 'function') {
   const PU0 = COL25.playUlt;
   COL25.playUlt = function(U) {
    try {
     const L = lockU(), nx = L && C().uGame(L);
     if (L && nx && why(nx.opp)) {
      LOG.block.push([ 'playUlt', why(nx.opp) ]);
      return;
     }
    } catch (e) {
     err(e, 'pu');
    }
    return PU0.apply(this, arguments);
   };
  }
  if (typeof PANEL_RENDER !== 'undefined' && typeof PANEL_RENDER.lineup === 'function') {
   const RL0 = PANEL_RENDER.lineup;
   PANEL_RENDER.lineup = function() {
    let h = RL0.apply(this, arguments);
    try {
     if (typeof h !== 'string' || !ultLuScreen() || PS.cp232) return h;
     const U = lockU();
     if (!U) return h;
     h = h.replace('LINEUP - TAP A SLOT, THEN TAP A PLAYER', LOCKMSG + ' - TAP A SLOT, THEN A PLAYER');
     const s = lockSet(U), out = C().ownedCards().filter(id => !s.has(id) && PP(id)), j = h.lastIndexOf('</table>');
     if (out.length && j > 0) {
      const k = (h.match(/<th>[A-Z]+<\/th>/g) || []).length;
      const rows = out.map(id => {
       const p = PP(id);
       return '<tr data-a="assign" data-v="' + p.id + '" class="u35lk" data-pid="' + p.id + '" style="opacity:.45"><td>' + posTag(p) + '</td><td class="n">' + esc(lastName(p)) + '</td><td>' + p.ovr + '</td>' + '<td></td>'.repeat(Math.max(0, k - 3)) + '<td class="dim2">LOCKED</td></tr>';
      }).join('');
      h = h.slice(0, j) + rows + h.slice(j);
     }
    } catch (e) {
     err(e, 'rl');
    }
    return h;
   };
  }
 }
 function myCT() {
  try {
   const u = V33.universe('ult');
   return u.ct.filter(id => !u.ctBad[id]);
  } catch (e) {
   return [];
  }
 }
 let PEND = null, ARMED = null;
 function hookV33() {
  if (!window.V33 || V33.__v35u) return;
  V33.__v35u = true;
  const UR0 = V33.ultRows;
  if (typeof UR0 === 'function') V33.ultRows = function() {
   const r = UR0.apply(this, arguments);
   try {
    if (off() || !r || r.tab || !V33.onPick || !V33.onPick()) return r;
    const ct = myCT();
    if (!ct.length) return r;
    return Object.assign({}, r, {
     ct: ct,
     tab: true,
     f35u: 1
    });
   } catch (e) {
    err(e, 'rows');
    return r;
   }
  };
  const EF0 = V33.eff;
  if (typeof EF0 === 'function') V33.eff = function(kind) {
   const e = EF0.apply(this, arguments);
   try {
    if (kind !== 'ult' || off() || !ARMED || !e || !Array.isArray(e.ids)) return e;
    const id = ARMED;
    ARMED = null;
    if (e.ids.includes(id) || !myCT().includes(id)) return e;
    const ids = e.ids.concat([ id ]);
    LOG.ct.push(id);
    return Object.assign({}, e, {
     ids: ids,
     ct: e.ct.concat([ id ]),
     custom: true,
     n: ids.length,
     ok: ids.length >= (V33.MIN || 5)
    });
   } catch (x) {
    err(x, 'eff');
    return e;
   }
  };
  const SO0 = V33.startOk;
  if (typeof SO0 === 'function') V33.startOk = function(kind) {
   if (kind !== 'ult' || !ruleOn()) return SO0.apply(this, arguments);
   try {
    const w = why();
    if (w) {
     V33.msg33 = V33.msg33 || {};
     V33.msg33.ult = w;
     LOG.block.push([ 'start', w ]);
     ARMED = null;
     return false;
    }
    if (V33.msg33 && /^NEED \d+ PLAYER CARDS/.test(V33.msg33.ult || '')) V33.msg33.ult = '';
   } catch (e) {
    err(e, 'start');
   }
   const ok = SO0.apply(this, arguments);
   ARMED = ok && PEND && myCT().includes(PEND) ? PEND : null;
   return ok;
  };
 }
 document.addEventListener('click', ev => {
  try {
   if (off() || typeof screen === 'undefined' || screen !== 'col25' || !C() || C().view() !== 'upick') return;
   const t = ev.target && ev.target.closest ? ev.target.closest('#col25 .tm[data-tid]') : null;
   PEND = t ? t.getAttribute('data-tid') : null;
  } catch (e) {}
 }, true);
 function fixCoach(U) {
  const cc = coachCards();
  if (!cc.length || cc.some(c => c.id === U.coach)) return false;
  const c = cc.find(x => x.id === U.team) || cc[0];
  U.coach = c.id;
  U.coachN = c.name;
  LOG.coach.push([ U.team, c.id ]);
  try {
   C().save();
  } catch (e) {}
  return true;
 }
 const mk = (tag, cls, id, text, css) => {
  const d = document.createElement(tag);
  if (cls) d.className = cls;
  if (id) d.id = id;
  if (text != null) d.textContent = text;
  if (css) d.style.cssText = css;
  return d;
 };
 function pre() {
  if (!ruleOn() || typeof screen === 'undefined' || screen !== 'col25') {
   if (ARMED && (!C() || C().view() !== 'upick')) ARMED = null;
   return;
  }
  const v = C().view();
  if (v !== 'upick') ARMED = null;
  if (v === 'uhub') {
   const U = C().ucur();
   if (U && U.phase === 'ko') fixCoach(U);
  }
  lockU();
 }
 function post() {
  if (!ruleOn() || typeof screen === 'undefined' || screen !== 'col25') return;
  const root = document.getElementById('col25');
  if (!root || root.style.display === 'none') return;
  const v = C().view();
  if (v === 'upick') {
   const w = why();
   const m33 = document.getElementById('ss33msgult'), dup = !!(m33 && /^NEED \d+ PLAYER CARDS/.test(m33.textContent || ''));
   if (w && dup) {
    const d = document.getElementById('u35need');
    if (d) d.remove();
   } else if (w && !document.getElementById('u35need')) {
    const a = document.getElementById('c25upicktxt');
    const d = mk('div', 'sm', 'u35need', w, 'color:#ff8a5c');
    if (a && a.parentNode) a.parentNode.insertBefore(d, a.nextSibling); else root.insertBefore(d, root.children[1] || null);
   } else if (w) {
    const d = document.getElementById('u35need');
    if (d && d.textContent !== w) d.textContent = w;
   } else if (!w) {
    const d = document.getElementById('u35need');
    if (d) d.remove();
   }
   return;
  }
  if (v !== 'uhub') return;
  const U = C().ucur();
  if (!U) return;
  for (const b of root.querySelectorAll('.row > button')) if (/^TEAM COACH:/.test(b.textContent || '')) {
   const row = b.parentNode;
   if (coachCards().length) row.remove(); else if (!document.getElementById('u35coach')) row.parentNode.insertBefore(mk('div', 'sm', 'u35coach', 'ULTIMATE NEEDS ONE OF YOUR COACH CARDS - YOU HAVE NONE YET.', 'color:#ff8a5c'), row);
  }
  if (U.phase !== 'ko') return;
  const nx = C().uGame(U);
  if (!nx) return;
  const w = why(nx.opp);
  const pb = document.getElementById('c25uplay');
  if (w) {
   if (pb) {
    pb.remove();
    LOG.block.push([ 'play', w ]);
   }
   if (!document.getElementById('u35short')) {
    const box = root.querySelector('.next');
    if (box) {
     const d = mk('div', 'vs', 'u35short');
     d.appendChild(mk('b', '', '', w));
     box.appendChild(d);
    }
   }
  }
  const L = lockU();
  if (!L) return;
  const s = lockSet(L), nOwnLk = C().ownedCards().filter(id => s.has(id)).length;
  const tb = document.getElementById('c25ut_lu');
  if (tb) tb.textContent = 'LINEUP (' + nOwnLk + ' CARDS)';
  const grid = document.getElementById('c25ulugrid');
  if (grid && grid.parentNode) {
   if (!document.getElementById('u35lockhub')) grid.parentNode.insertBefore(mk('div', 'sm', 'u35lockhub', LOCKMSG + ': THE ' + nOwnLk + ' CARDS YOU STARTED WITH. NEW CARDS SIT OUT TILL IT ENDS.', 'color:#ffcf5c'), grid);
   try {
    const pool = poolFor(nx.opp), lu0 = C().uLineup(nx.opp), lu = lockedLu(lu0, pool);
    if (lu && lu !== lu0) {
     grid.innerHTML = '';
     for (const [sk, lab] of SLOTS) {
      const p = PP(slotGet(lu, sk));
      const t = mk('div', 'tm');
      t.setAttribute('data-cid', p ? p.id : '');
      const i = mk('div');
      i.appendChild(mk('b', '', '', lab + ' ' + (p ? p.n : '-')));
      i.appendChild(mk('i', '', '', p ? p.pos + ' ' + p.ovr : ''));
      t.appendChild(i);
      grid.appendChild(t);
     }
    }
   } catch (e) {
    err(e, 'grid');
   }
  }
 }
 function hookRender() {
  if (typeof window.render !== 'function' || window.render.__v35u) return;
  const R0 = window.render;
  window.render = function() {
   try {
    pre();
   } catch (e) {
    err(e, 'pre');
   }
   const r = R0.apply(this, arguments);
   try {
    post();
   } catch (e) {
    err(e, 'post');
   }
   return r;
  };
  window.render.__v35u = true;
 }
 try {
  hookV33();
 } catch (e) {
  console.error(e);
 }
 try {
  hookRender();
 } catch (e) {
  console.error(e);
 }
 try {
  hookLock();
 } catch (e) {
  console.error(e);
 }
 window.V35U = {
  MINP: MINP,
  LOG: LOG,
  LOCKMSG: LOCKMSG,
  why: why,
  lockU: lockU,
  poolFor: poolFor,
  lockedLu: lockedLu,
  ruleOn: ruleOn,
  coachCards: coachCards,
  myCT: myCT,
  fixCoach: fixCoach,
  armed: () => ARMED,
  pend: () => PEND
 };
})();
