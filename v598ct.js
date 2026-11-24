/* v598ct.js - Bagga Lax 1.5f: card-team AUTO FILL never takes a player who is already on another card team.
 * Bug (Charlie): a second card team's AUTO FILL filled it with players already on his OTHER card team.
 * Cause: v33 keeps card IDS unique across card teams, but one player can own several different cards - his normal card,
 *  his ALL-AMERICAN (AA25-) / BAGGATWAAN (TW25-) / ULTIMATE (U_) card, or a second copy of a custom card (CU30-).
 *  AUTO FILL only skipped the exact ids on the other team, so it took the same player's other card.
 * Fix: AUTO FILL skips every card whose PLAYER is already on another card team (or twice on this one) and refills from
 *  free players only; a slot stays empty when there is no free player for it. MANUAL picking is unchanged: you can still
 *  pick that player's other card, and the list now tags it "- ON <TEAM>". Both teams then keep their own card of him
 *  (sharing - the current behaviour, nothing is moved off the other team).
 * No ids, rl_ keys or net changes. Kill switch: window.__rl_no598ct
 */
(function () {
 'use strict';
 const Wn = window;
 if (Wn.__v598ct || !Wn.V33 || typeof V33.autoFill !== 'function') return; Wn.__v598ct = 1;
 const off = () => !!Wn.__rl_no598ct;
 function ident(id) {
  id = String(id || '');
  if (/^CU30-/.test(id)) return id.slice(0, 10); // custom card copies: same seed = same player
  try { if (Wn.V478 && V478.realOf) return V478.realOf(id); } catch (e) {}
  return id.replace(/^U_/, '').replace(/^(AA25-|TW25-)/, '');
 }
 function others(exceptId) { // player -> card team name, for every OTHER card team
  const m = new Map();
  try { for (const t of V33.all ? V33.all() : V33.list('pro').concat(V33.list('col'))) if (t && t.id !== exceptId) for (const id of t.ids || []) if (!m.has(ident(id))) m.set(ident(id), String(t.name || 'ANOTHER TEAM').toUpperCase()); } catch (e) {}
  return m;
 }
 const af0 = V33.autoFill;
 V33.autoFill = function (kind, exceptId, keep) {
  const r = af0.apply(this, arguments);
  if (off() || !Array.isArray(r)) return r;
  try {
   const used = others(exceptId), seen = new Set(), out = [];
   for (const id of r) { const k = ident(id); if (used.has(k) || seen.has(k)) continue; seen.add(k); out.push(id); }
   if (out.length < r.length) { // refill the gaps from free players, same position first
    const pool = (V33.eligible(kind, exceptId) || []).filter(id => { const k = ident(id); return !used.has(k) && !seen.has(k); });
    const want = r.filter(id => !out.includes(id)).map(id => (PP(id) || {}).pos);
    for (const ps of want) { if (out.length >= r.length) break; const i = pool.findIndex(id => PP(id) && PP(id).pos === ps); const pick = i >= 0 ? pool.splice(i, 1)[0] : null; if (pick) { out.push(pick); seen.add(ident(pick)); for (let j = pool.length - 1; j >= 0; j--) if (ident(pool[j]) === ident(pick)) pool.splice(j, 1); } }
   }
   (V33.LOG = V33.LOG || {}).af598 = { in: r.length, out: out.length, dropped: r.filter(id => !out.includes(id)) };
   return out;
  } catch (e) { return r; }
 };
 // ---- Whale / Crown in the card-team UNIFORM picker (Charlie) ----
 // Bug: v500 put a THE WHALE tile at the end of EVERY uniform set and saved it on that SET's pro team, so the card team
 //  never wore it (and the ranked default stayed on). Fix: no per-set tiles; one WHALE / CROWN option at the top of the
 //  picker (only if you own it). One tap puts it on THIS card team (V446, which also takes the ranked uni off); a new team
 //  that is not saved yet gets it the moment it is saved. Kill switch: window.__rl_no598ctfit
 const fitW = () => { try { const w = Wn.V445 && V445.pick && V445.pick(); return w === 'whale' || w === 'crown' ? w : null; } catch (e) { return null; } };
 const fitName = w => w === 'whale' ? 'THE WHALE' : 'THE CROWN';
 const SWC = {};
 function sw598(w) { if (SWC[w]) return SWC[w]; const c = document.createElement('canvas'); c.width = 20; c.height = 20; const x = c.getContext('2d');
  x.fillStyle = w === 'whale' ? '#ff8cc6' : '#a6d8f7'; x.fillRect(4, 3, 12, 8); x.fillStyle = w === 'whale' ? '#ffffff' : '#4a6f8e'; x.fillRect(4, 6, 12, 2); x.fillStyle = '#d2bc8a'; x.fillRect(5, 12, 4, 5); x.fillRect(11, 12, 4, 5); x.fillStyle = '#7a4f2a'; x.fillRect(5, 17, 4, 2); x.fillRect(11, 17, 4, 2);
  if (w === 'crown') { x.fillStyle = '#ffcc33'; x.fillRect(6, 0, 8, 2); }
  return (SWC[w] = c.toDataURL()); }
 function fitOnE(E) { try { return E && (E.id ? !!(Wn.V446 && V446.wears(E.id)) : !!E.fit598); } catch (e) { return false; } }
 function fitRow(E) {
  const w = fitW(); if (!w) return '';
  const on = fitOnE(E);
  return '<div class="sec17 ct598fit" style="margin:0 0 6px"><div class="sh17">' + fitName(w) + ' <span>CHOOSE-ONE UNIFORM - OVER ANY SET</span></div><div class="grid17"><button type="button" class="c17 uni17' + (on ? ' wr17' : '') + '" data-a="ct598fit" data-v="' + w + '" aria-label="' + fitName(w) + (on ? ' (WEARING)' : '') + '"><div class="art"><img alt="" src="' + sw598(w) + '" style="image-rendering:pixelated"></div><div class="nm">' + fitName(w) + '</div><div class="rr">' + (on ? 'WEARING - TAP = OFF' : 'TAP TO WEAR') + '</div></button></div></div>';
 }
 // 1.5f (Charlie B64): RANKED in the card team's UNIFORM SET picker (top of N/A), styled like the other sets: every Ranked
 // Uni, owned ones pickable (= this card team's main uniform: lobby, profile, versus, matches, badge on the front), locked ones
 // blacked out with their unlock rule. Read live from the rank each time it draws, so a new tier shows at once. Kill: __rl_no600ctrk
 const RKK = () => (Wn.RK15U && RK15U.ORDER) || [];
 try { const st = document.createElement('style'); st.textContent = '#ct35unipop .ct600rk .c17,#ct35unipop .ct600rk .c17 *{pointer-events:auto;cursor:pointer}#ct35unipop .ct600rk .c17 *{pointer-events:none}'; document.head.appendChild(st); } catch (e) {}
 function rkRow(E) {
  if (!Wn.RK15U || !RK15U.icon) return '';
  const keys = RKK(), own = keys.filter(k => RK15U.owned(k)), worn = E && E.id ? RK15U.wornKey(E.id) : E && E.rk600 || null;
  const tiles = keys.map(k => { const o = RK15U.owned(k), on = o && worn === k; return '<button type="button" class="c17 uni17 rk15u' + (o ? '' : ' lk') + (on ? ' wr17' : '') + '" data-a="ct600rk" data-v="' + k + '" aria-label="' + RK15U.K[k].nm + (on ? ' (WEARING)' : o ? '' : ' (LOCKED)') + '"><div class="art"><img src="' + RK15U.icon(k) + '" alt="">' + (o ? '' : '<i class="rk600lock"></i>') + '</div><div class="nm">' + RK15U.K[k].nm + '</div>' + (on ? '<div class="rr">WEARING</div>' : o ? '<div class="rr">TAP TO WEAR</div>' : '<div class="rr">LOCKED</div><small class="wh17">' + RK15U.how(k) + '</small>') + '</button>'; }).join('');
  return '<div class="sec17 ct35ur ct600rk' + (worn ? ' on' : '') + '" data-t="RANKED"><div class="sh17">RANKED <span>' + own.length + '/' + keys.length + '</span>' + (worn ? '<b class="ct35cur">WEARING</b>' : '') + '</div><div class="grid17">' + tiles + '</div></div>';
 }
 try {
  if (typeof PANEL_ACT !== 'undefined') PANEL_ACT.ct600rk = function (v) {
   const E = V33.E; if (!E || !Wn.RK15U || !RK15U.K[v]) return;
   if (!RK15U.owned(v)) { try { V17.toast(RK15U.how(v) + ' TO UNLOCK', '#ffb14d'); } catch (e) {} return; }
   const cur = E.id ? RK15U.wornKey(E.id) : E.rk600, on = cur !== v;
   if (E.id) RK15U.wear(E.id, on ? v : null); else E.rk600 = on ? v : null;
   if (on) { try { if (!E.id) E.fit598 = false; } catch (e) {} }
   try { V17.toast((on ? (E.name || 'THIS CARD TEAM') + ' WEARS ' + RK15U.K[v].nm : 'TEAM UNIFORM ON'), '#7dff7a'); } catch (e) {}
  };
 } catch (e) {}
 try {
  const rc0 = typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.ct33;
  if (typeof rc0 === 'function') PANEL_RENDER.ct33 = function () {
   let h = rc0.apply(this, arguments);
   if (Wn.__rl_no598ctfit || typeof h !== 'string' || h.indexOf('ct35unipop') < 0) return h;
   try {
    const tp = document.createElement('template'); tp.innerHTML = h;
    tp.content.querySelectorAll('.v500fit').forEach(n => n.remove());
    const sc = tp.content.querySelector('#ct35unipop .ct35sc') || tp.content.querySelector('#ct35unipop .ct35chips');
    let row = Wn.__rl_no600ctnofit ? fitRow(V33.E) : ''; // 1.5f B64 (Charlie): Whale / Crown is not a main card-team uniform - only an extra via UNIFORM / locker
    try { if (!Wn.__rl_no600ctrk && V33.E && V33.E.ug35 === 'N/A') row = (row || '') + rkRow(V33.E); } catch (e) {} // 1.5f: RANKED set at the top of N/A
    if (sc && row) { const t2 = document.createElement('template'); t2.innerHTML = row; if (sc.classList.contains('ct35sc')) sc.insertBefore(t2.content, sc.firstChild); else sc.parentNode.insertBefore(t2.content, sc.nextSibling); }
    return tp.innerHTML;
   } catch (e) { return h; }
  };
  if (typeof PANEL_ACT !== 'undefined') {
   PANEL_ACT.ct598fit = function () {
    const E = V33.E, w = fitW(); if (!E || !w) return;
    const on = !fitOnE(E);
    if (E.id) { try { V446.set(E.id, on); } catch (e) {} } else E.fit598 = on;
    try { V17.toast((on ? (E.name || 'THIS CARD TEAM') + ' WEARS ' : 'OFF: ') + fitName(w), '#7dff7a'); } catch (e) {}
   };
   const sv0 = PANEL_ACT.ct33save;
   if (typeof sv0 === 'function') PANEL_ACT.ct33save = function () {
    const E = V33.E, want = E && !E.id && E.fit598, rkw = E && !E.id && E.rk600, before = new Set((V33.all ? V33.all() : []).map(t => t.id));
    const r = sv0.apply(this, arguments);
    try { if (want) { const nu = (V33.all ? V33.all() : []).find(t => !before.has(t.id)); if (nu) V446.set(nu.id, true); E.fit598 = false; } } catch (e) {}
    try { const rk = E && !E.id && E.rk600; if (rk) { const nu = (V33.all ? V33.all() : []).find(t => !before.has(t.id)); if (nu && Wn.RK15U) RK15U.wear(nu.id, rk); E.rk600 = null; } } catch (e) {}
    return r;
   };
  }
 } catch (e) {}
 // MANUAL: tag a player who is already on another card team (the pick is still allowed)
 try {
  const rd0 = typeof PANEL_RENDER !== 'undefined' && PANEL_RENDER.ct33;
  if (typeof rd0 === 'function') PANEL_RENDER.ct33 = function () {
   const h = rd0.apply(this, arguments);
   if (off() || typeof h !== 'string') return h;
   try {
    const E = V33.E, used = others(E && E.id);
    if (!used.size) return h;
    return h.replace(/<option value="([^"]+)"([^>]*)>([^<]*)<\/option>/g, (m, v, a, lab) => { const t = used.get(ident(v)); return t ? '<option value="' + v + '"' + a + '>' + lab + ' - ON ' + t.replace(/[<>&"]/g, '') + '</option>' : m; });
   } catch (e) { return h; }
  };
 } catch (e) {}
})();
