'use strict';
/* v523career - YOUR CAREER CARD IN THE LOCKER FROM DAY ONE + ADD ITEMS (Bagga Lax 1.2).
   Charlie (Nov 11 11:14 PM): "my career card isn't showing in cards section ... I only played one game with it but it
   should still be there". (11:17) "I should be able to click and add items from locker but also under the card should say
   add items and when i click it it will pop up with the screen with the player and item slots". (11:20) "Make sure career
   card shows up in locker room the second you make one - it's just not able to be added to any roster or card team till
   it's finished its career."
   Cause: v459car.js only puts a career player in the locker when the career is FINISHED (after the World Games:
   finishCareer -> cardGrant -> CR59-<career id>). A career still being played had no card in the locker at all, so the
   CAREER section said "NONE YET - FINISH A CAREER" no matter how many games you played. It was never there (not a recent
   break). Items: the career player in career games is CAR459-ME and nothing ever gave him gear.
   Now (offline save only, nothing online changes):
    - LOCKER > CARDS / ALL: the CAREER section shows your career player (v480's CAR459-L-<career id> card, "CAREER IN
      PROGRESS") from the moment he is created, with an ADD ITEMS button under him. Tap the card or ADD ITEMS -> the game's
      own player card + item slots screen (v28 card screen). It is NOT a V22 owned card (not in rl_v22), so it never shows in
      card teams, trades or rosters; v478's "ONLY USABLE ONCE CAREER IS COMPLETE" rule still holds (v480's quick match /
      online use is unchanged). The card is built from the career save itself, so it survives reloads and never duplicates.
    - CAREER screen: ADD ITEMS under your card (above the level bar) opens the same screen; DONE returns to the career.
    - Items put on him are worn in career games (looks + item effects, like a card's items in quick play).
    - When the career finishes, the items move onto his finished CAREER card (CR59-) and he can join teams as before.
   Storage: rl_cc523 = { <career id>: { slot: item id } } (v28 drops unknown card ids from its own store at load, before the
   career player exists, so the items are kept here and put back into v28's card store each load).
   Ids, existing rl_* keys, __rl_* flags and the net protocol are unchanged. Kill switch: window.__rl_no523cc = true. */
(function () {
 const off = () => !!window.__rl_no523cc || !!window.__rl_v124gb;
 const CA = window.CAR459, V480 = window.V480, V28 = window.V28;
 const LOG = window.V523LOG = { reg: 0, restore: 0, sync: 0, moved: 0, gameGear: 0, err: [] };
 const err = (e, w) => { try { LOG.err.push(w + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.err.length > 30) LOG.err.shift(); } catch (_) {} };
 if (off() || !CA || !CA.on || !window.V22 || !V480 || !V480.on || !V480.on() || !V480.liveId || typeof PLAYERS === 'undefined' || typeof LS === 'undefined') { window.V523 = { on: () => false, LOG: LOG }; return; }
 const KEY = 'cc523', ME = CA.ME || 'CAR459-ME', CPFX = 'CR59-', LPFX = 'CAR459-L-', CC = '#3dffc8';
 const S_ = s => String(s == null ? '' : s);
 const scr = () => { try { return typeof screen === 'string' ? screen : ''; } catch (e) { return ''; } };
 const dirty = () => { try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {} };
 const E = x => (typeof esc === 'function' ? esc(x) : S_(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
 const career = () => { try { return CA.get(); } catch (e) { return null; } };
 const lid = () => { try { return off() ? null : V480.liveId(); } catch (e) { return null; } };
 const cidOf = id => S_(id).indexOf(LPFX) === 0 ? S_(id).slice(LPFX.length) : null;
 const loadOn = () => !!(V28 && V28.on && V28.on('loadout') && V28.st && V28.openCard);
 const cst = () => { try { const s = V28.st(); if (s && (!s.cequip || typeof s.cequip !== 'object')) s.cequip = {}; return s ? s.cequip : null; } catch (e) { return null; } };
 let D = (() => { let o = null; try { o = LS.get(KEY, null); } catch (e) {} return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; })();
 const saveD = () => { try { LS.set(KEY, D); } catch (e) { err(e, 'save'); } };
 const cl = o => JSON.parse(JSON.stringify(o));
 const has = e => !!e && typeof e === 'object' && Object.keys(e).some(k => !!e[k]);

 // ---------- the in-progress career player as a card id (v480 registers him with his current ratings/look) ----------
 function reg() {
  const id = lid(); if (!id) return null;
  try { if (!PLAYERS[id] || PLAYERS[id].car480 !== 1 || PLAYERS[id].n !== (career().me || {}).n) { V480.regLive(); LOG.reg++; } else V480.regLive(); } catch (e) { err(e, 'reg'); }
  return PLAYERS[id] ? id : null;
 }

 // ---------- items: kept in rl_cc523, mirrored into v28's card store while the career runs ----------
 let ready = false;
 function restore() {
  const id = reg(), st = cst(); if (!id || !st) return;
  const cid = cidOf(id);
  if (has(D[cid]) && !has(st[id])) { st[id] = cl(D[cid]); LOG.restore++; try { V28.save && V28.save(); } catch (e) {} }
 }
 function sync() {
  if (!ready || off()) return;
  try {
   const id = lid(), st = cst(); if (!st) return;
   if (id && PLAYERS[id]) {
    const cid = cidOf(id), cur = has(st[id]) ? st[id] : null, was = has(D[cid]) ? D[cid] : null;
    if (JSON.stringify(cur) !== JSON.stringify(was)) { if (cur) D[cid] = cl(cur); else delete D[cid]; saveD(); LOG.sync++; }
   }
   // a finished career: his items move onto the finished CAREER card (owned V22 card) once
   const C = career();
   for (const cid of Object.keys(D)) {
    if (id && cidOf(id) === cid) continue;
    const fin = CPFX + cid;
    if (C && C.id === cid && C.stage !== 'done') continue;
    if (PLAYERS[fin] && V22.owned && V22.owned(fin)) { if (!has(st[fin])) st[fin] = cl(D[cid]); delete st[LPFX + cid]; delete D[cid]; saveD(); LOG.moved++; try { V28.save && V28.save(); } catch (e) {} }
    else if (!C || C.id !== cid) { delete st[LPFX + cid]; delete D[cid]; saveD(); } // that career is gone (deleted / replaced) and left no card
   }
  } catch (e) { err(e, 'sync'); }
 }
 function gear() {
  const id = lid(); if (!id) return null;
  const st = cst(), e = st && has(st[id]) ? st[id] : D[cidOf(id)];
  return has(e) ? cl(e) : null;
 }

 // ---------- V22.owned: the live career card counts as yours ONLY on the locker / card screen / career screen ----------
 // (so the v28 card screen opens and keeps him; lists, teams, trades and lineups never see him from here)
 const ctxOk = () => { const s = scr(); return s === 'card28' || s === 'locker17' || s === 'car459'; };
 if (typeof V22.owned === 'function') {
  const OW0 = V22.owned;
  V22.owned = function (pid) { try { if (!off() && loadOn() && pid && pid === lid() && ctxOk() && PLAYERS[pid]) return true; } catch (e) {} return OW0.apply(this, arguments); };
 }
 function openItems(back) {
  if (off() || !loadOn()) return false;
  const id = reg(); if (!id) return false;
  restore();
  teamOn();
  const ok = V28.openCard(id);
  if (!ok) { try { if (typeof toast === 'function') toast('ITEMS ARE OFF RIGHT NOW', '#ff9a8a'); } catch (e) {} }
  dirty();
  return ok;
 }

 // ---------- his school / team: a career team lives only in the career save (SZ_REG has it during his games only),
 // so the card and the item screen would fall back to the first team in the list. Register a copy while they draw. ----------
 let tmpT = null;
 function teamOn() {
  try {
   const C = career(), id = lid(); if (!C || !id || !C.team || typeof SZ_REG === 'undefined') return;
   if (SZ_REG[C.team]) return; // already registered (his game is on, or ours)
   if ((typeof TEAMS !== 'undefined' && TEAMS.some(t => t && t.id === C.team)) || (typeof WT_REG !== 'undefined' && WT_REG[C.team]) || (typeof GH_REG !== 'undefined' && GH_REG[C.team])) return; // a real team: the game knows it
   const base = CA.tobj ? CA.tobj(C.team) : null; if (!base || !base.id) return;
   const t = Object.assign({}, base, { id: C.team, nums: Object.assign({}, base.nums || {}, { [id]: C.me.num }), cc523: 1 });
   delete t.roster;
   t.roster = [];
   SZ_REG[C.team] = t; tmpT = C.team;
  } catch (e) { err(e, 'teamOn'); }
 }
 function teamOff() { try { if (tmpT && SZ_REG[tmpT] && SZ_REG[tmpT].cc523) delete SZ_REG[tmpT]; } catch (e) {} tmpT = null; }
 function withTeam(f) { const had = !!tmpT; teamOn(); try { return f(); } finally { if (!had) teamOff(); } }

 // ---------- locker: the CAREER section gets him (card + IN CAREER + ADD ITEMS) ----------
 function css() {
  if (document.getElementById('cc523css')) return;
  const s = document.createElement('style'); s.id = 'cc523css';
  s.textContent = [
   '#panel .cc523{display:inline-flex;flex-direction:column;align-items:center;gap:3px;vertical-align:top}',
   '#panel .cc523 .cc523l{font-size:7px;line-height:9px;letter-spacing:.4px;color:' + CC + ';text-align:center;max-width:96px}',
   '#panel .cc523 button{font-size:9px!important;min-height:22px!important;padding:3px 8px!important;white-space:nowrap}',
   '#panel .c9side .cc523b{margin:2px 0 0}',
   '#panel .c9side .cc523b button{font-size:10px!important;min-height:24px!important;padding:3px 10px!important;width:100%}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(s);
 }
 const addBtn = () => (typeof btn === 'function' ? btn('ADD ITEMS', 'cc523', 'items', 'y') : '<button data-a="cc523" data-v="items">ADD ITEMS</button>');
 function lockerHtml(h) {
  const id = reg(); if (!id || typeof h !== 'string' || h.indexOf('cr59sec') < 0 || h.indexOf('data-pid="' + id + '"') >= 0) return h;
  css();
  const tp = document.createElement('template'); tp.innerHTML = h;
  const sec = tp.content.querySelector('.cr59sec'); if (!sec) return h;
  const g = sec.querySelector('.grid17'); if (!g) return h;
  const nt = g.querySelector(':scope > .note'); if (nt) nt.remove();
  const n = g.querySelectorAll('.c17[data-pid]').length + 1;
  const sp = sec.querySelector('.sh17 span'); if (sp) sp.textContent = n + ' OWNED';
  const box = document.createElement('div'); box.className = 'cc523';
  box.innerHTML = withTeam(() => V22.cardHtml22(id)) + '<div class="cc523l">IN CAREER - FINISH HIS CAREER TO PUT HIM ON TEAMS</div>' + (loadOn() ? addBtn() : '');
  g.insertBefore(box, g.firstChild);
  return tp.innerHTML;
 }
 if (typeof V22.playersHtml === 'function') {
  const PH0 = V22.playersHtml;
  V22.playersHtml = function () { const h = PH0.apply(this, arguments); try { return off() ? h : lockerHtml(h); } catch (e) { err(e, 'locker'); return h; } };
 }
 if (typeof PANEL_ACT !== 'undefined') {
  PANEL_ACT.cc523 = function () { openItems(); };
  const VC0 = PANEL_ACT.v22card;
  PANEL_ACT.v22card = function (v) { try { if (!off() && v && v === lid() && loadOn()) { openItems(); return; } } catch (e) { err(e, 'tap'); } if (typeof VC0 === 'function') return VC0.apply(this, arguments); };
 }

 // ---------- career screen: ADD ITEMS under your card (above the level bar) ----------
 if (typeof PANEL_RENDER !== 'undefined' && typeof PANEL_RENDER.car459 === 'function') {
  const PR0 = PANEL_RENDER.car459;
  PANEL_RENDER.car459 = function () {
   const h = PR0.apply(this, arguments);
   try {
    if (off() || !loadOn() || typeof h !== 'string' || !lid() || h.indexOf('cc523b') >= 0) return h;
    const k = h.indexOf('<div class="c9xp"'); if (k < 0) return h;
    css();
    return h.slice(0, k) + '<div class="cc523b">' + addBtn() + '</div>' + h.slice(k);
   } catch (e) { err(e, 'car'); return h; }
  };
 }

 // ---------- career games: he wears his items ----------
 if (typeof window.newGame === 'function') {
  const NG0 = window.newGame;
  window.newGame = function (user, opp, mode, userHome, meta) {
   try {
    if (!off() && mode === 'career' && !(meta && meta.online) && typeof SZ_REG !== 'undefined' && SZ_REG[user] && SZ_REG[user].car459 && !SZ_REG[user].g17) {
     const g = gear();
     if (g && (SZ_REG[user].roster || []).includes(ME)) { SZ_REG[user].g17 = { gear: { [ME]: g }, crew: {}, cel: {}, f: .6 }; LOG.gameGear++; }
    }
   } catch (e) { err(e, 'newGame'); }
   return NG0.apply(this, arguments);
  };
 }

 try { restore(); } catch (e) { err(e, 'restore'); }
 ready = true;
 setInterval(() => {
  try {
   if (tmpT && !(scr() === 'card28' && V28.cardPid && V28.cardPid() === lid())) teamOff();
   if (!off()) { if (lid() && !PLAYERS[lid()]) reg(); restore(); sync(); }
  } catch (e) { err(e, 'tick'); }
 }, 500);
 window.V523 = { on: () => !off(), LOG: LOG, liveId: lid, gear: gear, openItems: openItems, store: () => D };
})();
