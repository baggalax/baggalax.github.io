// ===== BAGGA LAX v600t10.js - 1.5 B76: TOP 10 LOCKER BADGE = A REAL CHEST ITEM (bdg15_top10) =====
// Before: v590fix part 11 put the green locker on EVERY player of your card team while your locker was top 10.
// Now (Charlie approved):
//  - OWNED FOREVER once your locker is top 10 even once (rl_t10own, an rl_ key = it rides the cloud save).
//  - A CHEST item, gated exactly like the All-American badge: it rides v35's b35 badge path (flag b35:'t10'), so it is never
//    in packs / sales / bundles, it is listed in the chest picker only for CARD TEAM players (canWear), and each player wears
//    his own (rl_t10eq {pid:1}, rides the cloud save). Equipped = always shown, top 10 now or not.
//  - Drawn only where the arm is seen from the SIDE: match / walk-in / run-out side frames (v590fix part 11 now asks
//    T1076.shows per player) and the side-view hero (versus / vs roster). Never on front views. A small line
//    "ONLY VISIBLE ON ARM SIDE VIEW" under the lobby / locker player who wears it, and in the item text.
//  - Online: your lobby payload carries the list of your players wearing it (ADDED field t10 in [me]17); the other phone
//    draws it for those players. Live-Ops catalog: already listed as a reward (not for sale).
// Kill switch: window.__rl_no76t10 (= no item; part 11 falls back to the old team-wide top-10 look)
(function () {
 'use strict';
 const Wn = window, ID = 'bdg15_top10', KO = 'rl_t10own', KE = 'rl_t10eq';
 const off = () => !!Wn.__rl_no76t10;
 const LOG = Wn.__t10log = { own: 0, put: [], off: [] };
 const lsg = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
 const lss = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
 const owned = () => !!lsg(KO, null);
 let EQ = lsg(KE, {}); if (!EQ || typeof EQ !== 'object' || Array.isArray(EQ)) EQ = {};
 const saveEQ = () => lss(KE, EQ);
 const wears = pid => !off() && !!pid && !!EQ[pid] && owned();
 function cardPid(pid) {
  try {
   if (!pid) return false;
   if (Wn.V33 && V33.all && V33.all().some(t => t && Array.isArray(t.ids) && t.ids.includes(pid))) return true;
   const tid = typeof GEAR17 !== 'undefined' && GEAR17 && GEAR17.tid, t = tid && SZ_REG[tid];
   return !!(t && (t.ct33 || t.ct331) && (t.roster || []).includes(pid));
  } catch (e) { return false; }
 }
 // ---- ownership: the first time the locker is top 10 ----
 setInterval(() => { try { if (off() || owned()) return; const m = Wn.RK15 && RK15.mine && RK15.mine(); if (m && m.top10lk) { lss(KO, { t: Date.now(), v: '1.5 B76' }); LOG.own++; inv(); try { V17.toast && V17.toast('TOP 10 LOCKER BADGE - YOURS FOREVER (CHEST)', '#3dff8a'); } catch (e) {} } } catch (e) {} }, 3000);
 // ---- the item ----
 function addItem() {
  if (!Wn.V17 || !V17.BY || !V17.I) return false;
  if (!V17.BY[ID]) { const it = { id: ID, n: 'TOP 10 LOCKER BADGE', sec: 'chest', slot: 'chest', rar: 2, art: 'b35', b35: 't10', col: '#3dff8a', d: 'A SHINY GREEN LOCKER ON HIS BACK ARM - ONLY VISIBLE ON ARM SIDE VIEW. WON BY A TOP 10 LOCKER, YOURS FOREVER. ANY PLAYER ON YOUR CARD TEAM CAN WEAR ONE. STYLE ONLY.' }; V17.I.push(it); V17.BY[ID] = it; }
  return true;
 }
 function inv() { try { if (!Wn.V17 || !V17.ST) return; const ST = V17.ST(); if (!ST || !ST.inv) return; const want = !off() && owned() ? 99 : 0; if ((ST.inv[ID] | 0) !== want) { if (want) { ST.inv[ID] = want; if (ST.seen) ST.seen[ID] = true; } else delete ST.inv[ID]; try { V17.save(); } catch (e) {} } } catch (e) {} }
 // ---- the b35 path (items17 asks V35.b35 for any item with a b35 flag) ----
 function wrapB() {
  const B = Wn.V35 && V35.b35; if (!B || B.__t10) return !!B;
  const o = { isB: B.isB, canWear: B.canWear, put: B.put, off: B.off, free: B.free, eqHook: B.eqHook, icon: B.icon };
  B.isB = id => id === ID || o.isB(id);
  B.canWear = (pid, id) => id !== ID ? o.canWear(pid, id) : off() ? 'NOT GEAR' : !owned() ? 'GET YOUR LOCKER INTO THE TOP 10 TO WIN IT' : !cardPid(pid) ? 'CARD TEAM PLAYERS ONLY' : null;
  B.put = (pid, id) => { if (id !== ID) { if (EQ[pid]) { delete EQ[pid]; saveEQ(); } return o.put(pid, id); } if (off() || !owned() || !cardPid(pid)) return false; try { if (o.isB && B.chosen && B.chosen(pid)) o.off(pid); } catch (e) {} EQ[pid] = 1; saveEQ(); LOG.put.push(pid); return true; };
  B.off = pid => { if (EQ[pid]) { delete EQ[pid]; saveEQ(); LOG.off.push(pid); return true; } return o.off(pid); };
  B.free = id => id === ID ? (owned() ? 99 : 0) : o.free(id);
  B.eqHook = function (pid, e) { let r = o.eqHook.apply(this, arguments); try { if (wears(pid)) { r = Object.assign({}, r || {}); r.chest = ID; } } catch (x) {} return r; };
  B.icon = (id, sil) => id === ID ? icon(sil) : o.icon(id, sil);
  B.__t10 = 1; return true;
 }
 const IC = {};
 function icon(sil) {
  const k = sil ? 's' : 'n'; if (IC[k]) return IC[k];
  const c = document.createElement('canvas'); c.width = c.height = 20; const x = c.getContext('2d');
  const R = (a, b, w, h, col) => { x.fillStyle = sil ? '#2a3a44' : col; x.fillRect(a, b, w, h); };
  R(6, 2, 8, 16, '#0c3a20'); R(7, 3, 6, 14, '#0c6a33'); R(8, 4, 4, 12, '#3dff8a'); R(8, 5, 4, 1, '#0c6a33'); R(8, 7, 4, 1, '#0c6a33'); R(11, 10, 1, 2, '#e9fff2'); R(8, 4, 1, 12, '#9dffc4');
  return (IC[k] = c);
 }
 // ---- who shows it (v590fix part 11 asks this for every player it draws in a match) ----
 function oppList() { try { const n = Wn.RLNET, st = n && n.st; if (!st || !n.side) return null; const o = n.side === 'h' ? 'g' : 'h', p = st[o + '17']; return p && Array.isArray(p.t10) ? p.t10 : null; } catch (e) { return null; } }
 Wn.T1076 = { shows: (pid, mine) => { if (off()) return null; if (mine) return wears(pid); const L = oppList(); return !!(L && L.includes(pid)); }, wears: wears, owned: owned, cardPid: cardPid, ID: ID };
 // ---- online: my lobby payload says which of my players wear it ----
 function wrapPay() {
  if (!Wn.V17 || typeof V17.lobPay !== 'function' || V17.lobPay.__t10) return;
  const p0 = V17.lobPay;
  const p1 = function (tid) { let r = p0.apply(this, arguments); try { if (!off() && owned()) { const ids = (typeof teamRosterIds === 'function' ? teamRosterIds(tid, 'real') : []).filter(pid => EQ[pid]); if (ids.length) { r = r || { gear: {}, crew: {}, cel: {}, f: .25 }; r.t10 = ids; } } } catch (e) {} return r; };
  p1.__t10 = 1; Object.keys(p0).forEach(k => { try { p1[k] = p0[k]; } catch (e) {} }); V17.lobPay = p1;
 }
 // ---- the side-view hero (versus, vs roster): the locker on the back arm; the front hero gets the hint line ----
 let hint = null;
 function wrapHero() {
  if (typeof Wn.lobbyHero !== 'function' || Wn.lobbyHero.__t10) return;
  const L0 = Wn.lobbyHero;
  const L1 = function (cx, feetY, pos, kit, skin, gray, k, t, alpha, slide, flip, side) {
   const r = L0.apply(this, arguments);
   try {
    const pid = Wn.__v17hp;
    if (!off() && !gray && pid && wears(pid) && typeof lobbyFrame === 'function') {
     if (side) {
      const name = lobbyFrame(pos, side), s = Wn.FIX590 && FIX590.t10 && FIX590.t10.spotOf(name), f = RL12.FR[name];
      if (s && f) { const w = f[3][0].length, x0 = lobbyHeroGeo(cx, pos, k, flip, side).x0 + Math.round(slide || 0), y0 = Math.round(feetY - f[1] * k), X = q => x0 + (flip ? w - 1 - q : q) * k, sh = Math.floor(performance.now() / 200) % 6 === 0, a0 = g.globalAlpha; g.globalAlpha = alpha == null ? 1 : alpha; g.fillStyle = '#0c6a33'; g.fillRect(X(s[0]), y0 + s[1] * k, k, 2 * k); g.fillStyle = sh ? '#e9fff2' : '#3dff8a'; g.fillRect(X(s[0] + (flip ? -1 : 1)), y0 + s[1] * k, k, 2 * k); g.globalAlpha = a0; }
     } else if (k >= 4) hint = { cx: cx, t: performance.now(), sc: screen };
    }
   } catch (e) {}
   return r;
  };
  L1.__t10 = 1; Object.keys(L0).forEach(kk => { try { L1[kk] = L0[kk]; } catch (e) {} }); Wn.lobbyHero = L1;
 }
 // the hint line, drawn last (under the player's name card, bottom of the screen)
 if (typeof Wn.render === 'function') {
  const R0 = Wn.render;
  Wn.render = function () {
   const r = R0.apply(this, arguments);
   try {
    if (!off() && hint && performance.now() - hint.t < 120 && hint.sc === screen && !(typeof lobby !== 'undefined' && lobby && lobby.card)) {
     const s = 'ONLY VISIBLE ON ARM SIDE VIEW', w = (typeof textW === 'function' ? textW(s) * .75 : s.length * 3) + 6;
     g.save(); g.setTransform(RR, 0, 0, RR, 0, 0);
     rect(Math.round(hint.cx - w / 2), H - 9, Math.round(w), 8, 'rgba(5,8,11,.85)');
     if (typeof textMini === 'function') textMini(s, hint.cx, H - 7, '#3dff8a'); else text(s, hint.cx, H - 7, 1, '#3dff8a', 'center');
     g.restore();
    }
   } catch (e) {}
   return r;
  };
 }
 // ---- install (V35 / V17 load before the late loader; retry a few times anyway) ----
 let n = 0; const iv = setInterval(() => { try { const a = addItem(), b = wrapB(); wrapPay(); wrapHero(); inv(); if ((a && b) || ++n > 40) clearInterval(iv); } catch (e) {} }, 250);
 setInterval(inv, 5000);
})();
