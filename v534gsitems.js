/* v534gsitems.js - Good Stick sticks + tape show in the Locker Room (Bagga Lax).
   Root cause: v501gsc.js registers GOOD STICK SHORTIE / GOOD STICK GOALIE STICK / GOOD STICK TAPE (and the
   GOOD STICK CO. TEAM card) only in V17.BY (the id lookup). Buying the pack puts them in the save (inv), but the
   Locker Room sections, the item counts and the gear pickers all list V17.I (the item list), which never got them -
   so owned Good Stick sticks/tape were invisible and could not be picked.
   Fix (only while Good Stick is released = the same gate that shows the pack, GSC501.packOn(): LIVEOPS lists
   pack_goodstick, or the retrolax test-site gate in v527gsweb.js):
   1) the two sticks + the tape join V17.I, so they show in Locker STICKS / TAPE / ALL (owned = normal,
      not owned = blacked out), count in the totals, and show in the player STICK / TAPE boxes to equip.
      Not released = they are taken back out of the list (inert; v531gshide.js owns hiding).
   2) a player who bought the pack before this fix gets any missing stick / tape once (a one-time top-up,
      marked in the save as gsi534 so it never repeats).
   No ids, rl_* keys or net protocol change. Kill switch: window.__rl_no534gi = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no534gi || W.GSI534) return;
 const S = W.GSI534 = { added: [], topped: [], err: [], rel: false };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + (e && e.message || e)); };
 const IDS = [ 'stick_gsc_shortie', 'stick_gsc_goalie', 'tape_gsc' ];
 const off = () => !!(W.__rl_no534gi || W.__rl_no501gsc);
 const released = () => {
  try { return !off() && !!(W.GSC501 && typeof GSC501.packOn === 'function' && GSC501.packOn()); } catch (e) { return false; }
 };
 const ST = () => { try { return W.V17 && V17.ST ? V17.ST() : null; } catch (e) { return null; } };
 const owner = () => { try { return !!(W.GSC501 && GSC501.owned && GSC501.owned()); } catch (e) { return false; } };
 function list(on) {
  const V = W.V17;
  if (!V || !Array.isArray(V.I) || !V.BY) return false;
  let ch = false;
  if (on) {
   for (const id of IDS) {
    const it = V.BY[id];
    if (!it || V.I.indexOf(it) >= 0 || V.I.some(x => x && x.id === id)) continue;
    // sit right after the last item of the same section so the locker order stays natural
    let at = -1;
    V.I.forEach((x, i) => { if (x && x.sec === it.sec && !x.fo) at = i; });
    if (at < 0) V.I.push(it); else V.I.splice(at + 1, 0, it);
    if (S.added.indexOf(id) < 0) S.added.push(id);
    ch = true;
   }
  } else if (S.added.length) {
   for (const id of S.added.splice(0)) {
    const i = V.I.findIndex(x => x && x.id === id && x.gsc501);
    if (i >= 0) { V.I.splice(i, 1); ch = true; }
   }
  }
  return ch;
 }
 function topUp() {
  const s = ST();
  if (!s || !s.inv || s.gsi534 || !owner()) return false;
  const miss = IDS.filter(id => !(s.inv[id] > 0));
  for (const id of miss) {
   try { V17.grant(id, 1); } catch (e) { s.inv[id] = (s.inv[id] || 0) + 1; }
  }
  s.gsi534 = Date.now();
  S.topped = miss;
  try { V17.save(); } catch (e) { fail('save', e); }
  return miss.length > 0;
 }
 function sync() {
  try {
   const r = released();
   S.rel = r;
   const ch = list(r);
   const t = r ? topUp() : false;
   if ((ch || t) && typeof panelDirty === 'function' && typeof screen !== 'undefined' && /^(locker17|gear|team|roster|lineup|fl525|shop17)/.test(String(screen))) { try { panelDirty(); } catch (e) {} }
  } catch (e) { fail('sync', e); }
 }
 S.sync = sync;
 // keep the list right at every panel draw (cheap) and on a slow timer (LIVEOPS answers after load)
 try {
  if (typeof PANEL_RENDER === 'object' && PANEL_RENDER) {
   for (const key of Object.keys(PANEL_RENDER)) {
    const R0 = PANEL_RENDER[key];
    if (typeof R0 !== 'function' || R0.__gsi534) continue;
    const R1 = function () { if (!off()) { try { list(released()); } catch (e) {} } return R0.apply(this, arguments); };
    R1.__gsi534 = true;
    for (const k in R0) { try { R1[k] = R0[k]; } catch (e) {} }
    PANEL_RENDER[key] = R1;
   }
  }
 } catch (e) { fail('panels', e); }
 sync();
 let n = 0;
 const iv = setInterval(() => { n++; sync(); if (n > 400) clearInterval(iv); }, n < 30 ? 1000 : 3000);
 try { W.addEventListener('focus', sync); } catch (e) {}
})();
