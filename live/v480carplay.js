'use strict';
/* v480carplay - CAREER PLAYERS IN QUICK MATCH AND ONLINE (Bagga Lax 1.2).
   Charlie (Nov 9 8:30 PM): "make sure career cards are usable in online and quick match before its career is over."
   Before: the player of a career still being played existed only as PLAYERS['CAR459-ME'] (v459car.js regMe) inside
   career mode, so he could not be picked anywhere else; a finished career card (CR59-<career id>) could sub into a quick
   match lineup but sat out online (v459car.js:1011-1013), because the other phone has no copy of him.
   Now:
    - QUICK MATCH: the career player (in progress) is a CARD PLAYER in the lineup picker (+ CARD PLAYER row of the quick
      match lineup and the in-game timeout lineup), with his CURRENT career ratings, name, number, position and look.
      His id there is CAR459-L-<career id> (one per career, so two phones never share it). When the career ends, every
      saved lineup that had him switches to his finished CAREER card (CR59-<career id>).
    - ONLINE: he and finished career cards play online. The lobby lineup (hlu / glu, an existing lobby key the server stores
      as-is) is sent exactly as 1.1 phones expect (career players swapped out, the old v459 rule) PLUS one extra key inside
      it, cr480 = { v: 1, lu: the lineup with him in it, p: { id: his name / pos / ratings / number / skin } }. Only when BOTH
      lineups carry cr480 (both phones are 1.2) does each phone register the other's career players and use the full
      lineups, so both phones show the same players. A 1.1 phone ignores the extra key and gets today's behaviour.
      No server change, no new message type. Switch: window.__rl_480net = false -> online stays as before (he sits out).
    - Everywhere else nothing changes: card teams (franchise / pro season / college / any card team), college teams,
      season and tourney lineups, World Games, trades and the locker never see the in-progress career player
      (v478lvl.js rule: only a COMPLETE career card goes on a team). College teams in quick match don't take him either.
   v478lvl.js asks V480.liveOk(id) (one line in its careerDone) so its popup/guards let him through only here.
   Ids, rl_* keys, __rl_* flags unchanged; no new storage key. Kill switch: window.__rl_no480 = true. */
(function () {
 const off = () => !!window.__rl_no480 || !!window.__rl_v124gb;
 const CA = window.CAR459;
 if (off() || !CA || !CA.on || !window.V22 || typeof PLAYERS === 'undefined') { window.V480 = { on: () => false, liveOk: () => false }; return; }
 const LPFX = 'CAR459-L-';
 const LOG = { reg: 0, remote: [], swap: [], strip: [], mig: [], err: [] };
 const err = (e, w) => { try { LOG.err.push(w + ': ' + String(e && e.message || e).slice(0, 160)); if (LOG.err.length > 30) LOG.err.shift(); } catch (_) {} };
 const S_ = s => String(s == null ? '' : s);
 const netOn = () => !off() && window.__rl_480net !== false;
 const isLive = id => S_(id).indexOf(LPFX) === 0;
 const isCR = id => S_(id).indexOf('CR59-') >= 0;
 const isCar = id => isLive(id) || isCR(id);
 const scr = () => { try { return typeof screen === 'string' ? screen : ''; } catch (e) { return ''; } };
 const G_ = () => { try { return typeof game !== 'undefined' ? game : null; } catch (e) { return null; } };
 const PS_ = () => { try { return typeof PS !== 'undefined' ? PS : null; } catch (e) { return null; } };
 const SLOTK = [ [ 'A', 0 ], [ 'A', 1 ], [ 'A', 2 ], [ 'M', 0 ], [ 'M', 1 ], [ 'M', 2 ], [ 'D', 0 ], [ 'D', 1 ], [ 'D', 2 ], [ 'LSM' ], [ 'SSDM' ], [ 'SSDM2' ], [ 'FO' ], [ 'G' ] ];
 const luIds = lu => lu ? SLOTK.map(s => s.length > 1 ? (lu[s[0]] || [])[s[1]] : lu[s[0]]).filter(Boolean) : [];
 const cl = o => JSON.parse(JSON.stringify(o));
 const SK = () => (typeof SKILLS !== 'undefined' ? SKILLS : [ 'spd', 'pow', 'acc', 'fin', 'stk', 'str', 'def', 'gb', 'fo', 'sav' ]);

 // ---------- the career player being played: CAR459-L-<career id> (a copy of CAR459-ME with his current ratings) ----------
 function career() { try { return CA.get(); } catch (e) { return null; } }
 function liveId() { const C = career(); return C && C.id && C.stage !== 'done' && C.me ? LPFX + C.id : null; }
 let regKey = '';
 function regLive() {
  const id = liveId(); if (!id) return null;
  try {
   const C = career(), m = C.me, k = id + '|' + JSON.stringify([ m.n, m.num, m.pos, m.skin, m.r, C.team, C.lvl ]);
   if (k === regKey && PLAYERS[id]) return PLAYERS[id];
   let me = PLAYERS[CA.ME]; if (!me && CA.regMe) me = CA.regMe(); if (!me) return null;
   const p = Object.assign({}, me, { id: id, r: Object.assign({}, me.r), car480: 1, c480lvl: C.lvl || 'hs' });
   delete p.car459; // not one of the career's own generated players (career code skips those)
   try { p.ovr = ovrOf(p); } catch (e) {}
   PLAYERS[id] = p; regKey = k; LOG.reg++;
   return p;
  } catch (e) { err(e, 'regLive'); return null; }
 }
 // ---------- where he may play ----------
 const colTeam = t => { try { return !!t && (/^SZ0C/.test(t) || !!(SZ_REG[t] && (SZ_REG[t].col26 || SZ_REG[t].col25)) || !!(WT_REG[t] && WT_REG[t].col25)); } catch (e) { return false; } };
 const gOnline = G => !!G && !!(G.online || G.meta && G.meta.online);
 function onlineCtx() {
  const s = scr(), G = G_(), P = PS_();
  return /^on[A-Z]/.test(s) || !!(G && !G.over && gOnline(G)) || !!(s === 'lineup' && P && P.luBack === 'onLobby') || !!(window.RLNET && RLNET.inGame);
 }
 function quickCtx() {
  const s = scr(), G = G_(), P = PS_();
  if (s === 'lineup' && P) {
   if (P.luSrc !== 'real') return false;
   if (P.luBack === 'matchup') return !colTeam(P.luTeam);
   if (P.luBack === 'timeout') return !!(G && G.mode === 'quick' && !gOnline(G) && !colTeam(G.user));
   return false;
  }
  if (s === 'matchup') { try { return !colTeam(menuSel.team); } catch (e) { return true; } }
  return !!(G && G.mode === 'quick' && !gOnline(G) && !G.tutorial && !colTeam(G.user) && !onlineCtx());
 }
 function liveOk(id) {
  if (off() || !isLive(id) || id !== liveId()) return false;
  if (onlineCtx()) return netOn() && !(scr() === 'lineup' && colTeam((PS_() || {}).luTeam));
  return quickCtx();
 }

 // ---------- online: the other phone's career players ----------
 const POSL = [ 'A', 'M', 'FO', 'LSM', 'D', 'G' ];
 const idOk = id => typeof id === 'string' && id.length < 70 && (/^CAR459-L-[A-Za-z0-9_]{1,40}$/.test(id) || /^(U_)?(AA25-|TW25-)?CR59-[A-Za-z0-9_.-]{1,40}(~\d{1,3})?$/.test(id));
 function defOf(id) {
  const p = PP(id); if (!p) return null;
  const n = SK().map(k => Math.max(1, Math.min(99, Math.round(+p.r[k] || 1))));
  return { n: S_(p.n).slice(0, 24), pos: p.pos, r: n, w: p.wnum != null ? p.wnum : null, s: p.skin | 0, t: p.team || '', c: isLive(id) ? 'L' : 'F', d: p.cr59d != null ? p.cr59d : (career() ? career().diff | 0 : 0) };
 }
 function cleanName(n) {
  let s = S_(n).toUpperCase().replace(/[^A-Z0-9 '.-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 18);
  try { if (!s || window.UGC41 && UGC41.bad && UGC41.bad(s)) s = 'CAREER PLAYER'; } catch (e) {}
  return s || 'CAREER PLAYER';
 }
 function regRemote(defs) {
  if (!defs || typeof defs !== 'object') return 0;
  let n = 0;
  for (const id of Object.keys(defs).slice(0, 20)) {
   try {
    const d = defs[id];
    if (!idOk(id) || !d || typeof d !== 'object' || !Array.isArray(d.r)) continue;
    const cur = PLAYERS[id];
    if (cur && !cur.r480) continue; // his own phone's copy (same career / same card): keep it
    const p = { id: id, n: cleanName(d.n), pos: POSL.includes(d.pos) ? d.pos : 'M', r: {}, real: false, team: (typeof T === 'function' && T(d.t)) ? d.t : 'ATL', wnum: d.w == null ? null : Math.max(0, Math.min(99, d.w | 0)), skin: Math.max(0, Math.min(5, d.s | 0)), r480: 1 };
    p.n0 = p.n;
    SK().forEach((k, i) => p.r[k] = Math.max(1, Math.min(99, Math.round(+d.r[i] || 1))));
    if (d.c === 'F') { p.cr59 = 1; p.cr59d = Math.max(0, Math.min(5, d.d | 0)); } else p.car480 = 1;
    try { p.ovr = ovrOf(p); } catch (e) { p.ovr = 60; }
    const was = cur ? JSON.stringify(cur.r) + cur.n : '';
    PLAYERS[id] = p; n++;
    if (was !== JSON.stringify(p.r) + p.n) { LOG.remote.push([ id, p.n, p.ovr ]); if (LOG.remote.length > 30) LOG.remote.shift(); }
   } catch (e) { err(e, 'regRemote'); }
  }
  return n;
 }
 function regLobby() {
  try {
   const st = window.RLNET && RLNET.lobby && RLNET.lobby.state; if (!st || !netOn()) return;
   for (const k of [ 'hlu', 'glu' ]) if (st[k] && st[k].cr480 && st[k].cr480.p) regRemote(st[k].cr480.p);
  } catch (e) { err(e, 'regLobby'); }
 }
 function myOnlineTeam() {
  try {
   const N = window.RLNET; if (!N) return null;
   if (N.inGame && N.myTeam) return N.myTeam;
   const st = N.lobby && N.lobby.state; if (!st) return null;
   return N.side === 'h' ? st.hteam : st.gteam;
  } catch (e) { return null; }
 }
 // my lineup as the lobby carries it: 1.1-safe base (career players swapped out) + cr480 (the real lineup + who they are)
 function shape(teamId, src, lu) {
  const out = cl(lu); delete out.cr480;
  let full = null;
  try {
   const raw = LS.get('lu_' + teamId, null), ids = teamRosterIds(teamId, src || 'real');
   regLive();
   if (raw && luIds(raw).some(isCar) && lineupValid(raw, ids)) { full = cl(raw); delete full.cr480; }
   if (full) {
    const base = V22.strip(full, ids, isCar);
    const p = {}; for (const id of luIds(full)) if (isCar(id)) { const d = defOf(id); if (d) p[id] = d; }
    const b = cl(base); delete b.cr480;
    b.cr480 = { v: 1, lu: full, p: p };
    return b;
   }
  } catch (e) { err(e, 'shape'); }
  out.cr480 = { v: 1 };
  return out;
 }

 // ---------- hooks ----------
 // lineups: he counts as a card player where he may play
 if (typeof V22.okSub === 'function') { const OK0 = V22.okSub; V22.okSub = function (id) { if (isLive(id)) { if (liveOk(id)) { regLive(); return !!PP(id); } return false; } return OK0.apply(this, arguments); }; }
 if (typeof V22.subExtra === 'function') {
  const SE0 = V22.subExtra;
  V22.subExtra = function (ids) {
   let r = SE0.apply(this, arguments);
   try {
    if (!Array.isArray(r) || off()) return r;
    const P = PS_(), lid = liveId();
    if (scr() === 'lineup' && P && P.luSrc === 'season') return r;
    if (onlineCtx() && netOn()) { // finished career cards came back online (v459 took them out)
     const add = V22.ownedIds().filter(id => isCR(id) && !ids.includes(id) && !r.includes(id));
     if (add.length) r = r.concat(add);
    }
    if (lid && liveOk(lid) && regLive() && !ids.includes(lid) && !r.includes(lid)) r = r.concat([ lid ]);
    if (r.length > 1) r = r.slice().sort((a, b) => (PP(b) ? PP(b).ovr : 0) - (PP(a) ? PP(a).ovr : 0));
   } catch (e) { err(e, 'subExtra'); }
   return r;
  };
 }
 if (typeof V22.lobbyLineup === 'function') { const LL0 = V22.lobbyLineup; V22.lobbyLineup = function () { const r = LL0.apply(this, arguments); try { return r || !!(netOn() && liveId()); } catch (e) { return r; } }; }
 // his card in the picker: CAREER - IN PROGRESS strip, career colours
 if (typeof V22.cardHtml22 === 'function') {
  const CH0 = V22.cardHtml22;
  V22.cardHtml22 = function (pid) {
   const h = CH0.apply(this, arguments);
   try {
    if (!isLive(pid) || typeof h !== 'string' || h.indexOf('c480') >= 0) return h;
    const p = PP(pid), lv = p && p.c480lvl && CA.LVN ? CA.LVN[p.c480lvl] || '' : '';
    let o = h.replace('class="c17 ', 'class="c17 cr59 c480 ').replace(/<div class="rr">[A-Z]+ - /, '<div class="rr">CAREER - ').replace(/(aria-label="[^"]*? - )(COMMON|RARE|LEGENDARY)( )/, '$1CAREER IN PROGRESS' + (lv ? ' (' + lv + ')' : '') + '$3');
    const k = o.lastIndexOf('</div>');
    return k > 0 ? o.slice(0, k) + '<div class="cr59t">CAREER IN PROGRESS</div></div>' : o;
   } catch (e) { return h; }
  };
 }
 // lineupFor: quick match keeps him (okSub); online, my own lineup goes out shaped (see shape); other teams untouched
 if (typeof window.lineupFor === 'function') {
  const LF0 = window.lineupFor;
  window.lineupFor = function (teamId, src) {
   const lu = LF0.apply(this, arguments);
   try {
    if (off() || !lu || (src && src !== 'real')) return lu;
    if (onlineCtx()) {
     if (netOn() && teamId && teamId === myOnlineTeam()) return shape(teamId, src, lu);
     if (luIds(lu).some(isLive)) { LOG.strip.push([ 'online', teamId ]); return V22.strip(lu, teamRosterIds(teamId, src || 'real'), isLive); }
    }
   } catch (e) { err(e, 'lineupFor'); }
   return lu;
  };
 }
 // the lineup editor opened from the online lobby edits the real lineup, not the lobby's 1.1-safe copy
 if (typeof window.openLineup === 'function') {
  const OL0 = window.openLineup;
  window.openLineup = function () {
   const r = OL0.apply(this, arguments);
   try { const P = PS_(); if (P && P.lu && P.lu.cr480) { const c = P.lu.cr480; P.lu = c.lu ? cl(c.lu) : P.lu; delete P.lu.cr480; } } catch (e) { err(e, 'openLineup'); }
   return r;
  };
 }
 if (typeof window.saveLineup === 'function') {
  const SL0 = window.saveLineup;
  window.saveLineup = function (teamId, src, lu) { try { if (lu && lu.cr480) { lu = cl(lu); delete lu.cr480; arguments[2] = lu; } } catch (e) {} return SL0.apply(this, arguments); };
 }
 // game start: online = both phones 1.2 -> the real lineups (with career players) on both phones; cr480 never stays in a game
 if (typeof V22.fixGame === 'function') {
  const FG0 = V22.fixGame;
  V22.fixGame = function (G) {
   let c = [ null, null ];
   try { if (G && G.lu) c = [ G.lu[0] && G.lu[0].cr480 || null, G.lu[1] && G.lu[1].cr480 || null ]; } catch (e) {}
   try { if (G && G.lu) regLive(); } catch (e) {}
   const r = FG0.apply(this, arguments);
   try {
    if (G && G.lu) {
     if (gOnline(G) && netOn() && c[0] && c[1]) {
      regRemote(c[0].p); regRemote(c[1].p);
      for (let i = 0; i < 2; i++) {
       if (!c[i].lu) continue;
       const full = cl(c[i].lu); delete full.cr480;
       const ids = teamRosterIds(i ? G.opp : G.user, G.src || 'real');
       if (luIds(full).every(id => PP(id)) && lineupValid(full, ids.concat(luIds(full).filter(isCar)))) { G.lu[i] = full; const w = JSON.stringify([ i, luIds(full).filter(isCar) ]); if (!LOG.swap.length || JSON.stringify(LOG.swap[LOG.swap.length - 1]) !== w) LOG.swap.push(JSON.parse(w)); }
      }
      if (LOG.swap.length > 20) LOG.swap.splice(0, LOG.swap.length - 20);
     } else if (gOnline(G)) {
      for (let i = 0; i < 2; i++) if (G.lu[i] && luIds(G.lu[i]).some(isLive)) G.lu[i] = V22.strip(G.lu[i], teamRosterIds(i ? G.opp : G.user, G.src || 'real'), isLive);
     }
     for (let i = 0; i < 2; i++) if (G.lu[i] && G.lu[i].cr480) { G.lu[i] = Object.assign({}, G.lu[i]); delete G.lu[i].cr480; }
    }
   } catch (e) { err(e, 'fixGame'); }
   return r;
  };
 }
 // the lobby always carries my lineup in the 1.2 shape (some lobby paths send it before my team is set): re-send it once
 let syncT = 0;
 function lobbySync() {
  try {
   const N = window.RLNET, st = N && N.lobby && N.lobby.state;
   if (!st || !netOn() || N.inGame || st.start || st.season || scr() !== 'onLobby' || typeof N.patchLobby !== 'function') return;
   const t = myOnlineTeam(), k = N.side === 'h' ? 'hlu' : 'glu';
   if (!t || Date.now() - syncT < 1000) return;
   const lu = window.lineupFor(t, 'real');
   if (!lu || !lu.cr480 || JSON.stringify(st[k] || null) === JSON.stringify(lu)) return;
   syncT = Date.now(); st[k] = lu; N.patchLobby({ [k]: lu });
  } catch (e) { err(e, 'lobbySync'); }
 }
 // ---------- the career ends: saved lineups that had him now have his CAREER card ----------
 let migDone = '';
 function migrate() {
  try {
   const C = career(); if (!C || C.stage !== 'done' || !C.final || !C.final.pid || migDone === C.id) return;
   const from = LPFX + C.id, to = C.final.pid;
   if (!(V22.owned && V22.owned(to))) return;
   for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || k.indexOf('rl_lu_') !== 0) continue;
    const v = localStorage.getItem(k);
    if (!v || v.indexOf(from) < 0) continue;
    localStorage.setItem(k, v.split('"' + from + '"').join('"' + to + '"'));
    LOG.mig.push([ k, to ]);
   }
   migDone = C.id;
   delete PLAYERS[from];
  } catch (e) { err(e, 'migrate'); }
 }
 // ---------- look ----------
 try {
  const st = document.createElement('style'); st.id = 'v480css';
  st.textContent = '#panel .c17.c480{border-color:#3dffc8;background:linear-gradient(135deg,#06302c,#0d6b5e 45%,#041a17);box-shadow:0 2px 0 #000,0 0 7px #3dffc8}#panel .c17.c480 .rr{color:#3dffc8}';
  document.head.appendChild(st);
 } catch (e) {}
 try { regLive(); migrate(); } catch (e) { err(e, 'boot'); }
 setInterval(() => { try { if (off()) return; regLive(); regLobby(); lobbySync(); migrate(); } catch (e) { err(e, 'tick'); } }, 400);
 window.V480 = { on: () => !off(), netOn: netOn, liveOk: liveOk, liveId: liveId, regLive: regLive, regRemote: regRemote, shape: shape, quickCtx: quickCtx, onlineCtx: onlineCtx, LOG: LOG };
})();
