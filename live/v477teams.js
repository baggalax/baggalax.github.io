/* v477teams: no limit on card teams or college card teams (Charlie, Nov 9 2026: "Card teams no more limits").
   Before: v33.js capped card teams at 8 and college card teams at 2 (MAX = {pro: 8, col: 2}).
   - V33.MAX reads as no cap for the screens (ADD buttons always live, no "8/8" / "2/2", no "THE MAX" refusal).
   - A new team past the old cap gets an id in the same shape (SZ0P / SZ0C + slot char + gen char, 6 chars),
     slots 9 and A-Z first, then any free slot+gen pair; saved through the same V33.saveTeam chain
     (same rl_bl33_cardteams key, same team object shape, coach card rule, college-cards-only rule unchanged).
   - The pro team grid (canvas) pages the card teams when they don't fit: < n/m > at the bottom right.
   The one in-place change: v33.js load() accepts slot chars 1-9 and A-Z (was 1-8), so teams 9+ survive a reload
   (that line is not behind the kill switch, so turning this file off never drops a saved team).
   Kill switch: window.__rl_no477 = true (the old caps come back for NEW teams; saved teams all stay). */
(function() {
 'use strict';
 if (!window.V33 || window.V33.__v477) return;
 const off = () => !!(window.__rl_no477 || window.__rl_v124gb);
 const V = window.V477 = { log: [], err: [], made: 0 };
 const note = (s) => { V.log.push(s); if (V.log.length > 30) V.log.shift(); };
 const ORIG = V33.MAX, BIG = { pro: 9999, col: 9999 };
 V33.__v477 = true;
 try {
  Object.defineProperty(V33, 'MAX', { configurable: true, enumerable: true, get: () => off() ? ORIG : BIG });
 } catch (e) { V.err.push(String(e)); }

 const SLOTS = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', GEN = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 function newId(kind) {
  const L = V33.D[kind] || [], pre = 'SZ0' + (kind === 'pro' ? 'P' : 'C');
  const taken = id => L.some(t => t.id === id) || (typeof SZ_REG !== 'undefined' && !!SZ_REG[id]);
  const usedSlot = new Set(L.map(t => String(t.id).slice(4, 5)));
  let gen = 1;
  try { gen = (LS.get('bl33_gen', 0) | 0) + 1; LS.set('bl33_gen', gen); } catch (e) {}
  for (const s of SLOTS) if (!usedSlot.has(s)) {
   for (let k = 0; k < 36; k++) { const id = pre + s + GEN[(gen + k) % 36]; if (!taken(id)) return id; }
  }
  for (const s of SLOTS) for (const g of GEN) { const id = pre + s + g; if (!taken(id)) return id; }
  return null;
 }
 V.newId = newId;

 // new team past the old cap: add the team row with its new id, then save it through the normal chain as an edit of that row
 const S0 = V33.saveTeam;
 V33.saveTeam = function(E) {
  if (off() || !E || E.id || !V33.onCT()) return S0.apply(this, arguments);
  const kind = E.kind === 'col' ? 'col' : 'pro', D = V33.D;
  if (!D || !Array.isArray(D[kind]) || D[kind].length < ORIG[kind]) return S0.apply(this, arguments);
  const why = V33.validate(E);
  if (why) return { err: why };
  const c = V33.canMake(kind);
  if (!c.ok) return { err: V33.notEnough(kind, c) };
  const id = newId(kind);
  if (!id) return { err: 'NO FREE SLOT' };
  const t = { id: id, at: Date.now() };
  D[kind].push(t);
  E.id = id;
  let r = null;
  try {
   r = S0.apply(this, arguments);
  } catch (e) {
   V.err.push(String(e));
   r = { err: 'COULD NOT SAVE - TRY AGAIN' };
  }
  if (!r || !r.id) {
   const D2 = V33.D;
   if (D2 && Array.isArray(D2[kind])) D2[kind] = D2[kind].filter(x => x !== t && x.id !== id);
   try { if (typeof SZ_REG !== 'undefined') delete SZ_REG[id]; } catch (e) {}
   E.id = null;
  } else {
   V.made++;
   note('new ' + kind + ' ' + id);
  }
  return r || { err: 'COULD NOT SAVE - TRY AGAIN' };
 };

 // editor header: drop the old "- MAX 8" / "- MAX 2"
 try {
  const R0 = PANEL_RENDER.ct33;
  if (typeof R0 === 'function') PANEL_RENDER.ct33 = function() {
   const h = R0.apply(this, arguments);
   return off() || typeof h !== 'string' ? h : h.replace(/ - MAX [0-9]+</g, '<');
  };
 } catch (e) { V.err.push(String(e)); }

 // pro team grid (canvas, 8 x 4 tiles max): page the card teams when they don't fit
 const PG = V.pg = { page: 0, pages: 1, per: 0, n: 0, show: false, lastN: -1 };
 const CAP = 32;
 const PT0 = V33.proTiles;
 V33.proTiles = function(opts) {
  const r = PT0.apply(this, arguments) || [];
  PG.show = false;
  if (off() || !Array.isArray(r) || !r.length) return r;
  try {
   const o = opts || {}, ok = t => t && t.id !== o.exclude && (!o.only || o.only.includes(t.id));
   const base = TEAMS.filter(ok).length, rr = r.filter(ok);
   if (base + rr.length <= CAP) { PG.pages = 1; return r; }
   const per = Math.max(4, CAP - base), pages = Math.ceil(rr.length / per);
   const nPro = V33.list('pro').length;
   if (PG.lastN >= 0 && nPro > PG.lastN) PG.page = pages - 1;  // a new card team was just added: show it
   PG.lastN = nPro;
   PG.page = Math.max(0, Math.min(pages - 1, PG.page | 0));
   PG.per = per; PG.pages = pages; PG.n = rr.length; PG.show = true;
   return rr.slice(PG.page * per, PG.page * per + per);
  } catch (e) {
   V.err.push(String(e));
   return r;
  }
 };
 const PE0 = V33.proExtra;
 V33.proExtra = function(by, opts, wv) {
  const r = PE0 ? PE0.apply(this, arguments) : undefined;
  const show = PG.show;
  PG.show = false;
  if (off() || wv || !show || PG.pages < 2) return r;
  try {
   const lab = 'CARD TEAMS ' + (PG.page + 1) + '/' + PG.pages, lw = textW(lab), bw = 20, x1 = W - 8 - bw, x0 = x1 - lw - 8 - bw;
   button('<', x0, by, bw, 19, () => { PG.page = (PG.page - 1 + PG.pages) % PG.pages; }, { bg: '#ffd23a', fg: '#0b1a20' });
   button(lab, x0 + bw + 2, by, lw + 4, 19, () => { PG.page = (PG.page + 1) % PG.pages; }, { bg: '#3a4a55', fg: '#ffd23a' });
   button('>', x1, by, bw, 19, () => { PG.page = (PG.page + 1) % PG.pages; }, { bg: '#ffd23a', fg: '#0b1a20' });
  } catch (e) {
   V.err.push(String(e));
  }
  return r;
 };
 note('ready');
})();
