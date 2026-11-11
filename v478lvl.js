'use strict';
/* v478lvl - ONE CARD PER PLAYER: CARDS LEVEL UP IN PLACE (Bagga Lax 1.2).
   Before: winning All-American / Baggatwaan (college Natty) or getting a player's Ultimate ADDED a second card
   (AA25-x / TW25-x / U_x) next to the card you already had (x). Now the card you own levels up in place.
   Level = honor (base < ALL-AMERICAN < BAGGATWAAN) + ULTIMATE (on/off). A card never loses a level:
     x -> AA25-x -> TW25-x ; ULTIMATE keeps the honor: U_x -> U_AA25-x -> U_TW25-x (the game's own variants).
     AA on a Baggatwaan card = nothing new. An Ultimate of an All-American card = U_AA25-x (both bonuses + looks).
   You don't own a card of him -> you get the honor/Ultimate card exactly as before (still only one card).
   Card ids, rl_* keys, __rl_* flags and the net protocol are unchanged: the upgraded card simply takes the game's
   existing id for that version; every card team / college card team / lineup / locker gear that pointed at the old
   card now points at the new one. Old saves with 2+ versions of one player are merged once (highest level kept).
   Legends, ghosts, made-up players, draft copies (CD36-) and career Ultimate version copies (U_CR59-..~n) are left alone.
   Career cards (8:03-8:04 PM): only a COMPLETED career card can be on a team (it is a pro player: never on a college
   card team, so it never gets AA/Baggatwaan); career cards can't be traded.
   Own storage: rl_lvl478 (log + merge map). Kill switch: window.__rl_no478 = true -> nothing here runs. */
(function() {
 const off = () => !!window.__rl_no478 || !!window.__rl_v124gb;
 if (off() || !window.V22 || typeof LS === 'undefined') {
  window.V478 = { on: () => false };
  return;
 }
 const KEY = 'lvl478';
 const LOG = { up: [], abs: [], mig: [], ref: [], cr: [], tr: [], err: [] };
 const err = (e, w) => {
  try {
   LOG.err.push(w + ': ' + String(e && e.message || e).slice(0, 200));
   if (LOG.err.length > 40) LOG.err.shift();
  } catch (_) {}
 };
 let D = (() => {
  let o = null;
  try { o = LS.get(KEY, null); } catch (e) { o = null; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) o = {};
  if (!o.map || typeof o.map !== 'object') o.map = {};
  if (!Array.isArray(o.log)) o.log = [];
  o.v = 1;
  return o;
 })();
 const save = () => { try { D.log = D.log.slice(-200); LS.set(KEY, D); } catch (e) { err(e, 'save'); } };
 const on = () => !off() && V22.on();

 // ---------- ids & levels ----------
 const S_ = s => String(s == null ? '' : s);
 const isU = s => /^U_/.test(S_(s));
 const hOf = s => { const t = S_(s).replace(/^U_/, ''); return /^TW25-/.test(t) ? 2 : /^AA25-/.test(t) ? 1 : 0; };
 const realOf = s => S_(s).replace(/^U_/, '').replace(/^(AA25-|TW25-)/, '');
 const idOf = (u, h, b) => (u ? 'U_' : '') + (h === 2 ? 'TW25-' : h === 1 ? 'AA25-' : '') + b;
 const LVN = (u, h) => (h === 2 ? 'BAGGATWAAN' : h === 1 ? 'ALL-AMERICAN' : '') + (u ? (h ? ' ULTIMATE' : 'ULTIMATE') : '') || 'BASE';
 const rank = s => hOf(s) + (isU(s) ? 3 : 0); // only for ordering ties; real levels combine
 const isCareer = s => /CR59-|CAR459-/.test(S_(s));
 // ids this file never merges: draft copies, career version copies, double ultimates, odd ids
 const skip = s => typeof s !== 'string' || !s || /~\d+$/.test(s) || /^CD36-/.test(s) || /^U_U_/.test(s) || /(AA25-|TW25-).*(AA25-|TW25-)/.test(s);
 function famOK(b) {
  let p = null;
  try { p = PP(b); } catch (e) { p = null; }
  if (!p || !p.r) return false;
  if (p.leg || p.leg331 || p.gho16 || p.egg13 || p.cd36) return false; // legends, ghosts, eggs, draft copies: unchanged
  if (/^(AA25-|TW25-|U_)/.test(b)) return false;
  return true;
 }
 function ensureP(id) {
  try {
   if (PLAYERS[id]) return true;
   if (isU(id) && window.ULT331 && ULT331.make) ULT331.make(id);
   else if (hOf(id) && window.HON25 && HON25.make) HON25.make(id);
  } catch (e) { err(e, 'ensureP ' + id); }
  try { return !!PP(id); } catch (e) { return false; }
 }
 const cards = () => { const s = V22.st(); if (!s.cards || typeof s.cards !== 'object') s.cards = {}; return s.cards; };
 // every owned version of one real player (raw records, so a card whose player is not built yet still counts)
 function family(b) {
  const out = [];
  for (const k of Object.keys(cards())) if (!skip(k) && realOf(k) === b) out.push(k);
  return out;
 }
 function combine(ids) {
  let u = false, h = 0, b = null;
  for (const id of ids) { u = u || isU(id); h = Math.max(h, hOf(id)); b = b || realOf(id); }
  return idOf(u, h, b);
 }

 // ---------- career cards (8:03 PM) ----------
 const careerCid = s => { const t = S_(s), i = t.indexOf('CR59-'); return i < 0 ? null : t.slice(i + 5).replace(/~\d+$/, ''); };
 function careerDone(id) {
  if (!isCareer(id)) return true;
  if (S_(id).indexOf('CAR459-') >= 0) return !!(window.V480 && V480.liveOk && V480.liveOk(id)); // the career being played: only where v480carplay lets him play (quick match / online lineups)
  const cid = careerCid(id);
  let o = null;
  try { o = LS.get('car459cards', null); } catch (e) { o = null; }
  return !!(cid && o && typeof o === 'object' && o[cid]);
 }
 const badCareer = id => isCareer(id) && !careerDone(id);

 // ---------- the one-screen popup (title, one sentence, one big button) ----------
 const Q = [];
 let shown = null;
 function css() {
  if (document.getElementById('lvl478css')) return;
  const s = document.createElement('style');
  s.id = 'lvl478css';
  s.textContent = [
   '#lvl478{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.78);font-family:inherit;padding:calc(env(safe-area-inset-top) + 6px) calc(env(safe-area-inset-right) + 10px) calc(env(safe-area-inset-bottom) + 6px) calc(env(safe-area-inset-left) + 10px)}',
   '#lvl478 .bx{font-family:ui-monospace,Menlo,Consolas,monospace;background:#101418;border:3px solid #ffcc33;box-shadow:0 0 0 3px #000,0 0 22px rgba(255,204,51,.45);padding:10px 16px 12px;max-width:min(92vw,560px);max-height:94vh;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:#fff}',
   '#lvl478 .bx.cr{border-color:#3dffc8;box-shadow:0 0 0 3px #000,0 0 18px rgba(61,255,200,.35)}',
   '#lvl478 h1{margin:0;font-size:20px;letter-spacing:1px;color:#ffcc33;text-shadow:2px 2px 0 #000}',
   '#lvl478 .bx.cr h1{color:#3dffc8}',
   '#lvl478 p{margin:0;font-size:11px;line-height:1.5;max-width:460px}',
   '#lvl478 .cw{display:flex;flex-wrap:nowrap;gap:8px;align-items:center;justify-content:center;transform-origin:center}',
   '#lvl478 .cw .c17{position:relative;overflow:hidden;pointer-events:none}',
   '#lvl478 .cw .ar{font-size:22px;color:#ffcc33;text-shadow:2px 2px 0 #000}',
   '#lvl478 button{font-family:inherit;font-size:16px;letter-spacing:1px;min-width:220px;min-height:46px;padding:10px 22px;border:3px solid #000;background:#ffcc33;color:#000;box-shadow:0 3px 0 #7a5a00;cursor:pointer}',
   '#lvl478 .bx.cr button{background:#3dffc8;box-shadow:0 3px 0 #0a6b55}',
   /* a Baggatwaan card is an All-American too (8:00 PM): red AA outline + ALL-AMERICAN strip on top of the gold look */
   '#panel .c17[data-pid^="TW25-"],#panel .c17[data-pid^="U_TW25-"],#lvl478 .c17[data-pid^="TW25-"],#lvl478 .c17[data-pid^="U_TW25-"]{outline:2px solid #ff3344;outline-offset:-5px}',
   '#panel .c17[data-pid^="TW25-"] .nm::after,#lvl478 .c17[data-pid^="TW25-"] .nm::after,#panel .c17[data-pid^="U_TW25-"] .rr::before,#lvl478 .c17[data-pid^="U_TW25-"] .rr::before{content:"ALL-AMERICAN";display:block;font-size:6px;letter-spacing:.3px;color:#fff;background:#d4202c;border-top:1px solid #2a4bb8;border-bottom:1px solid #2a4bb8;padding:1px 2px;margin-top:1px;white-space:nowrap}',
   '#panel .pcard17 .c17[data-pid^="TW25-"] .nm::after,#lvl478 .c17[data-pid^="TW25-"] .nm::after,#lvl478 .c17[data-pid^="U_TW25-"] .rr::before{font-size:8px}',
   '.cd[data-k^="c:TW25-"],.cd[data-k^="c:U_TW25-"]{outline:2px solid #ff3344;outline-offset:-4px}',
   '#panel .pop17:has(.pcard17 .c17[data-pid^="TW25-"]) .pt17::after{content:" - ALL-AMERICAN";color:#ff5a66}',
   /* career cards can't be traded (8:03 PM) */
   '#tr24 .cd[data-k*="CR59-"]{opacity:.4;filter:grayscale(.7)}',
   '#tr24 .cd[data-k*="CR59-"]::after{content:"NO TRADE";position:absolute;left:0;right:0;top:40%;font-size:8px;background:#000;color:#3dffc8;text-align:center}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(s);
 }
 // the cards on the popup wear exactly the locker look: the game's own #panel card rules, cloned for #lvl478
 let cloned = 0;
 function cloneCardCss() {
  if (cloned && document.getElementById('lvl478css2')) return;
  const out = [];
  try {
   for (const sh of document.styleSheets) {
    let rules = null;
    try { rules = sh.cssRules; } catch (e) { rules = null; }
    if (!rules) continue;
    for (const r of rules) {
     const sel = r.selectorText;
     if (!sel || sel.indexOf('#panel') < 0 || !/\.c17\b/.test(sel)) continue;
     const s2 = sel.split(',').filter(x => /\.c17\b/.test(x) && /#panel/.test(x)).map(x => x.replace(/#panel\b/g, '#lvl478').replace(/\.pcard17\s+/g, '').replace(/\.pop17:has\([^)]*\)\s*/g, '')).join(',');
     if (s2) out.push(s2 + '{' + r.style.cssText + '}');
    }
   }
  } catch (e) { err(e, 'clone'); }
  let st = document.getElementById('lvl478css2');
  if (!st) { st = document.createElement('style'); st.id = 'lvl478css2'; (document.head || document.documentElement).appendChild(st); }
  st.textContent = out.join('\n') + '\n#lvl478 .cw .c17{flex:0 0 auto}#lvl478 .cw:not(.m) .c17{width:104px;min-height:140px}#lvl478 .cw:not(.m) .c17 .art{width:88px;height:88px}#lvl478 .cw:not(.m) .c17 .art img{width:84px;height:84px}#lvl478 .cw:not(.m) .c17 .nm{font-size:10px}#lvl478 .cw:not(.m) .c17 .rr{font-size:8px}#lvl478 .cw:not(.m) .c17 .nm::before,#lvl478 .cw:not(.m) .c17 .nm::after{font-size:8px}';
  cloned = out.length;
 }
 const E = s => (typeof esc === 'function' ? esc(String(s)) : String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]));
 function cardH(id) {
  try { if (V22.cardHtml22 && PP(id)) return V22.cardHtml22(id).replace(/ sel"/, '"'); } catch (e) { err(e, 'cardH'); }
  return '';
 }
 function busy() {
  try {
   if (typeof game !== 'undefined' && game && !game.over && typeof screen === 'string' && screen === 'game') return true;
  } catch (e) {}
  return false;
 }
 function pump() {
  if (shown || !Q.length || busy() || !document.body) return;
  const m = Q.shift();
  css();
  cloneCardCss();
  const d = document.createElement('div');
  d.id = 'lvl478';
  d.innerHTML = '<div class="bx' + (m.cr ? ' cr' : '') + '"><h1>' + E(m.t) + '</h1>' + (m.html ? '<div class="cw' + (m.many ? ' m' : '') + '">' + m.html + '</div>' : '') + '<p>' + E(m.s) + '</p><button type="button" id="lvl478ok">' + E(m.b || 'OK') + '</button></div>';
  for (const ev of [ 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click' ]) d.addEventListener(ev, e => e.stopPropagation());
  d.querySelector('#lvl478ok').addEventListener('click', e => {
   e.preventDefault();
   try { d.remove(); } catch (_) {}
   shown = null;
   try { if (m.done) m.done(); } catch (x) { err(x, 'done'); }
   setTimeout(pump, 120);
  });
  document.body.appendChild(d);
  shown = d;
  // fit the card row on a short landscape phone (width and height)
  try {
   const bx = d.querySelector('.bx'), cw = d.querySelector('.cw');
   if (cw) {
    if (m.many) bx.style.maxWidth = '96vw';
    const availW = Math.min(innerWidth * .96, bx.getBoundingClientRect().width) - 24, w = cw.scrollWidth;
    const h = cw.getBoundingClientRect().height, other = bx.getBoundingClientRect().height - h, availH = innerHeight * .94 - other;
    const sc = Math.min(1, availW / w, availH / h);
    if (sc < 1) { cw.style.transform = 'scale(' + Math.max(.5, sc).toFixed(3) + ')'; cw.style.margin = (-(h * (1 - sc)) / 2).toFixed(1) + 'px ' + (-(w * (1 - sc)) / 2).toFixed(1) + 'px'; }
   }
  } catch (e) {}
 }
 function popup(m) {
  const k = m.k || (m.t + '|' + m.s);
  if (Q.some(x => (x.k || x.t + '|' + x.s) === k) || shown && shown.__k === k) return;
  m.k = k;
  Q.push(m);
  pump();
  if (shown && !shown.__k) shown.__k = k;
 }
 setInterval(pump, 700);
 function careerPop() {
  popup({ k: 'cr478', cr: 1, t: 'ONLY USABLE ONCE CAREER IS COMPLETE', s: 'FINISH THIS PLAYER\'S CAREER FIRST, THEN HIS CAREER CARD CAN JOIN YOUR TEAMS AND LINEUPS.', b: 'OK' });
 }
 function tradePop() {
  popup({ k: 'tr478', cr: 1, t: 'CAREER CARDS CAN\'T BE TRADED', s: 'YOUR CAREER CARD IS YOURS FOR GOOD. PICK A DIFFERENT CARD TO TRADE.', b: 'OK' });
 }
 // level-ups of one moment (a Natty hands out 6 honors at once) land on ONE screen
 let LVB = [], lvT = 0;
 function levelPop(from, to) {
  LVB.push([ from, to ]);
  clearTimeout(lvT);
  lvT = setTimeout(levelFlush, 250);
 }
 function whatOf(to) {
  const u = isU(to), h = hOf(to);
  return h === 2 ? (u ? 'A BAGGATWAAN ULTIMATE (AND ALL-AMERICAN)' : 'A BAGGATWAAN WINNER AND AN ALL-AMERICAN') : h === 1 ? (u ? 'AN ALL-AMERICAN ULTIMATE' : 'AN ALL-AMERICAN') : 'AN ULTIMATE';
 }
 const nmOf = id => { try { return String(PP(id).n || '').toUpperCase(); } catch (e) { return ''; } };
 function levelFlush() {
  const L = LVB;
  LVB = [];
  if (!L.length) return;
  if (L.length === 1) {
   const [ from, to ] = L[0];
   let ov = '';
   try { const a = PP(from), b = PP(to); if (a && b) ov = ' (' + a.ovr + ' -> ' + b.ovr + ' OVR)'; } catch (e) {}
   popup({ k: 'lv478|' + to, t: 'CARD LEVELED UP!', html: (cardH(from) ? cardH(from) + '<div class="ar">&#9654;</div>' : '') + cardH(to), s: nmOf(to) + ' IS NOW ' + whatOf(to) + ': YOUR CARD UPGRADED IN PLACE' + ov + ' - STILL ONE CARD, SAME TEAMS.', b: 'AWESOME' });
   return;
  }
  const tos = L.map(x => x[1]).sort((a, b) => rank(b) - rank(a));
  const top = tos[0], rest = tos.length - 1;
  const s = nmOf(top) + ' IS NOW ' + whatOf(top) + (rest ? ' AND ' + rest + ' MORE CARD' + (rest > 1 ? 'S' : '') + ' LEVELED UP' : '') + ': UPGRADED IN PLACE - STILL ONE CARD EACH, SAME TEAMS.';
  popup({ k: 'lv478|' + tos.join(','), t: tos.length + ' CARDS LEVELED UP!', html: tos.slice(0, 6).map(cardH).join(''), many: tos.length > 2, s: s, b: 'AWESOME' });
 }


 // ---------- references: every place that pointed at the old card points at the new one ----------
 function swapIn(v, f, to) { // deep replace in a lineup-like object; returns [newValue, changed]
  let ch = false;
  const walk = x => {
   if (typeof x === 'string') { if (x === f) { ch = true; return to; } return x; }
   if (Array.isArray(x)) return x.map(walk);
   if (x && typeof x === 'object') { const o = {}; for (const k in x) o[k] = walk(x[k]); return o; }
   return x;
  };
  const r = walk(v);
  return [ r, ch ];
 }
 const luHas = (lu, id) => { let n = 0; const w = x => { if (x === id) n++; else if (Array.isArray(x)) x.forEach(w); else if (x && typeof x === 'object') for (const k in x) w(x[k]); }; w(lu); return n; };
 function aliasSet() {
  const s = new Set;
  try { const a = LS.get('bl331_alias', null); if (a && typeof a === 'object') for (const k in a) { s.add(k); const v = a[k]; if (typeof v === 'string') s.add(v); else if (v && typeof v === 'object') for (const q in v) if (typeof v[q] === 'string') s.add(v[q]); } } catch (e) {}
  return s;
 }
 function natural(tid, id) { // is id a real roster player of team tid (not a subbed card)?
  try {
   if (window.V33 && V33.kindOf && V33.kindOf(tid)) return false;
   const t = T(tid);
   return !!(t && Array.isArray(t.roster) && t.roster.includes(id));
  } catch (e) { return false; }
 }
 function fixLineups(f, to) {
  let n = 0;
  const al = aliasSet();
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && /^rl_(lu_|lu2404b_)/.test(k)) keys.push(k); }
  for (const k of keys) {
   try {
    const raw = localStorage.getItem(k);
    if (!raw || raw.indexOf('"' + f + '"') < 0) continue;
    const tid = k.replace(/^rl_(lu_|lu2404b_)/, '');
    if (!al.has(tid) && natural(tid, f)) continue; // a real roster player of that team, not a card
    const lu = JSON.parse(raw);
    let ctT = null;
    try { ctT = window.V33 && V33.kindOf && V33.kindOf(tid) ? V33.getT(tid) : null; } catch (e) { ctT = null; }
    if (ctT && to && !(ctT.ids || []).includes(to)) { localStorage.removeItem(k); n++; LOG.ref.push([ k, f, to, 'that version sits on another card team: lineup reset to auto' ]); continue; }
    if (to && luHas(lu, to)) { localStorage.removeItem(k); n++; LOG.ref.push([ k, f, to, 'had both: lineup reset to auto' ]); continue; }
    if (!to) { localStorage.removeItem(k); n++; LOG.ref.push([ k, f, null, 'card removed: lineup reset to auto' ]); continue; }
    const [ v, ch ] = swapIn(lu, f, to);
    if (ch) { localStorage.setItem(k, JSON.stringify(v)); n++; LOG.ref.push([ k, f, to ]); }
   } catch (e) { err(e, 'lu ' + k); }
  }
  // the season in memory (a season lineup may carry a subbed card)
  try {
   if (typeof season !== 'undefined' && season && season.lineups && typeof season.lineups === 'object') for (const t in season.lineups) {
    if (natural(t, f)) continue;
    const lu = season.lineups[t];
    if (!lu || !luHas(lu, f)) continue;
    if (to && !luHas(lu, to)) { season.lineups[t] = swapIn(lu, f, to)[0]; n++; } else { delete season.lineups[t]; n++; }
   }
  } catch (e) { err(e, 'season lu'); }
  // college ultimate lineup
  try {
   const C = window.COL25 && COL25.st ? COL25.st() : null;
   if (C && C.ulu && luHas(C.ulu, f)) { if (to && !luHas(C.ulu, to)) C.ulu = swapIn(C.ulu, f, to)[0]; else delete C.ulu; n++; if (COL25.save) COL25.save(); }
  } catch (e) { err(e, 'ulu'); }
  return n;
 }
 function fixLocker(f, to) { // the card's own locker loadout moves with it (moved, not copied: one item = one card)
  let n = 0;
  try {
   const cs = window.V28 && V28.cardStore ? V28.cardStore() : null;
   if (cs && typeof cs === 'object' && cs[f]) { if (!cs[to]) cs[to] = cs[f]; delete cs[f]; n++; V28.save && V28.save(); }
  } catch (e) { err(e, 'cequip'); }
  try {
   const ST = window.V17 && V17.ST ? V17.ST() : null;
   let ch = 0;
   if (ST && ST.tequip && typeof ST.tequip === 'object') for (const t in ST.tequip) {
    if (!(window.V33 && V33.kindOf && V33.kindOf(t))) continue; // only card teams: real teams' gear belongs to the real player
    const m = ST.tequip[t];
    if (m && m[f]) { if (!m[to]) m[to] = m[f]; delete m[f]; ch++; }
   }
   if (ch) { V17.save(); n += ch; }
  } catch (e) { err(e, 'tequip'); }
  try {
   const H = window.HB436 && HB436.st ? HB436.st() : null;
   if (H && H.glow && Object.prototype.hasOwnProperty.call(H.glow, f) && !Object.prototype.hasOwnProperty.call(H.glow, to)) { H.glow[to] = H.glow[f]; LS.set(HB436.KEY, H); n++; }
  } catch (e) { err(e, 'glow'); }
  return n;
 }
 // card teams, all pairs at once: each team slot that held an old card gets the new one; when two teams (or two
 // slots) held versions of the same player, the slot holding the HIGHEST version keeps the card and the other slot
 // gets the best free card of the same position (or stays empty when there is none: the game's own short-team rule)
 function fixTeamsAll(map, why) {
  if (!window.V33 || !V33.D) return 0;
  const all = [].concat(V33.D.pro || [], V33.D.col || []);
  const fam = new Set(Object.keys(map).concat(Object.values(map).filter(Boolean)).map(realOf));
  const held = new Set;
  const todo = [];
  for (const t of all) (t.ids || []).forEach((id, i) => {
   if (Object.prototype.hasOwnProperty.call(map, id)) todo.push({ t: t, i: i, f: id, to: map[id] });
   else held.add(id);
  });
  if (!todo.length) return 0;
  todo.sort((a, b) => rank(b.f) - rank(a.f));
  const gap = [];
  for (const x of todo) {
   const kind = /^SZ0C/.test(x.t.id) ? 'col' : 'pro';
   if (x.to && !held.has(x.to) && !(kind === 'col' && isCareer(x.to))) { x.t.ids[x.i] = x.to; held.add(x.to); LOG.ref.push([ x.t.id, x.f, x.to ]); }
   else { x.t.ids[x.i] = null; gap.push(x); }
  }
  for (const x of gap) {
   const kind = /^SZ0C/.test(x.t.id) ? 'col' : 'pro';
   let pos = null, rep = null;
   try { pos = (PP(x.f) || PP(x.to) || {}).pos || null; } catch (e) {}
   if (!pos) try { // the old card can't be built any more: refill the position the team is short of
    const cnt = {};
    for (const id of x.t.ids) if (id && PP(id)) cnt[PP(id).pos] = (cnt[PP(id).pos] || 0) + 1;
    if (typeof QUOTA !== 'undefined') pos = Object.keys(QUOTA).find(k => (cnt[k] || 0) < QUOTA[k]) || null;
   } catch (e) {}
   try {
    const pool = V33.eligible(kind, x.t.id).filter(id => !held.has(id) && !x.t.ids.includes(id) && !fam.has(realOf(id)) && !badCareer(id) && !(kind === 'col' && isCareer(id)));
    rep = pool.find(id => PP(id) && PP(id).pos === pos) || (pos ? null : pool[0] || null);
   } catch (e) { err(e, 'rep'); }
   if (rep) { x.t.ids[x.i] = rep; held.add(rep); }
   LOG.ref.push([ x.t.id, x.f, rep, (why || '') + (rep ? ': slot refilled with the best free ' + pos : ': slot left empty (no free ' + pos + ')') ]);
  }
  for (const t of all) if (Array.isArray(t.ids)) t.ids = t.ids.filter(Boolean);
  try { V33.save(); V33.regAll(); } catch (e) { err(e, 'v33 save'); }
  return todo.length;
 }
 function refs(map, why) { // map: old card -> new card (null = removed)
  let n = fixTeamsAll(map, why);
  for (const f of Object.keys(map)) {
   const to = map[f];
   if (!f || f === to) continue;
   n += fixLineups(f, to);
   if (to) n += fixLocker(f, to);
   try { if (V22.pop === f) V22.pop = to || null; } catch (e) {}
  }
  return n;
 }
 // ---------- the level-up itself ----------
 const UPT = new Map; // real player -> when his card last leveled up (pop-up de-dupe)
 function upgrade(from, to, why, show, defer) {
  const cs = cards();
  const top = from.slice().sort((a, b) => rank(b) - rank(a))[0];
  const rec = Object.assign({}, cs[to] || cs[top] || {});
  rec.lv478 = { from: from.filter(x => x !== to), at: Date.now(), w: why || '' };
  if (!rec.at) rec.at = Date.now();
  for (const f of from) if (f !== to) delete cs[f];
  cs[to] = rec;
  V22.save();
  const map = {};
  for (const f of from) if (f !== to) { map[f] = to; D.map[f] = to; }
  const r = defer ? 0 : refs(map, why);
  if (defer) Object.assign(defer, map);
  D.log.push({ k: show ? 'up' : 'mig', from: from, to: to, w: why || '', at: Date.now(), refs: r });
  save();
  (show ? LOG.up : LOG.mig).push([ from.join('+'), to, why, r ]);
  UPT.set(realOf(to), Date.now());
  try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {}
  if (show) levelPop(top, to);
  return to;
 }
 function dupeCoins(id) {
  try {
   if (!window.__rl_no232d && window.V17 && V17.give232 && V17.sell232 && (!V17.dd232on || V17.dd232on())) V17.give232(V17.sell232(V22.rarOf(id)));
  } catch (e) { err(e, 'coins'); }
 }

 // one incoming id; returns the ids that should count as "new" for the caller
 const G0 = V22.grantIds;
 let inGrant = 0;
 function grantOne(self, id, tid, why) {
  if (typeof id !== 'string' || skip(id)) return G0.call(self, [ id ], tid, why);
  const b = realOf(id);
  if (!famOK(b)) return G0.call(self, [ id ], tid, why);
  if (isCareer(id) && hOf(id)) { LOG.cr.push([ 'no honor for career card', id ]); return []; } // career cards are pro: no AA/Baggatwaan
  const fam = family(b);
  if (!fam.length) return G0.call(self, [ id ], tid, why);
  if (fam.length === 1 && fam[0] === id) return []; // he already holds exactly this card (the game's own duplicate rules ran)
  const to = combine(fam.concat([ id ]));
  if (fam.length === 1 && fam[0] === to) { // nothing new: he already has this level (or higher)
   LOG.abs.push([ id, to, why ]);
   const fresh = (Date.now() - (UPT.get(b) || 0)) < 15e3; // swallowed by the card that just leveled up / was just won
   if (!fresh && !(hOf(id) && /NATTY/.test(S_(why)))) dupeCoins(id); // a duplicate (pack, title, ultimate) still pays like a duplicate
   return [];
  }
  if (!ensureP(to)) return G0.call(self, [ id ], tid, why); // the game can't build that version: old behaviour
  upgrade(fam, to, why, true);
  try { const c = cards()[to]; if (c && !c.t) c.t = tid || (PP(b) || {}).team; } catch (e) {}
  return [ to ];
 }
 V22.grantIds = function(ids, tid, why) {
  if (!on() || !Array.isArray(ids)) return G0.apply(this, arguments);
  const out = [];
  inGrant++;
  try {
   for (const id of ids) {
    let r = [];
    try { r = grantOne(this, id, tid, why); } catch (e) { err(e, 'grant ' + id); r = G0.call(this, [ id ], tid, why); }
    if (Array.isArray(r)) for (const x of r) if (!out.includes(x)) out.push(x);
   }
  } finally { inGrant--; }
  return out;
 };
 for (const k of Object.keys(G0)) V22.grantIds[k] = G0[k];

 // the honors pop-up for a card that leveled up is replaced by the CARD LEVELED UP screen (no "new card" of an id you don't hold)
 if (V22.popup) {
  const P0 = V22.popup;
  V22.popup = function(key, head, txt, ids) {
   try {
    if (on() && Array.isArray(ids)) {
     const keep = ids.filter(x => cards()[x] && !(String(key).indexOf('hon25|') === 0 && Date.now() - (UPT.get(realOf(x)) || 0) < 15e3));
     if (!keep.length) return;
     ids = keep;
    }
   } catch (e) { err(e, 'popup'); }
   return P0.call(this, key, head, txt, ids);
  };
 }
 // a career card never takes an All-American / Baggatwaan version (Charlie 8:04 PM: career cards are pro players)
 if (window.HON25 && typeof HON25.grant === 'function') {
  const H0 = HON25.grant;
  const H1 = function(kind, basePid) {
   try { if (on() && isCareer(basePid)) { LOG.cr.push([ 'blocked honor', kind, basePid ]); return { pid: null, isNew: false }; } } catch (e) {}
   return H0.apply(this, arguments);
  };
  for (const k of Object.keys(H0)) H1[k] = H0[k];
  HON25.grant = H1;
 }

 // ---------- career cards on teams / lineups ----------
 if (window.V33) {
  if (typeof V33.eligible === 'function') {
   const EL0 = V33.eligible;
   V33.eligible = function(kind) {
    const r = EL0.apply(this, arguments);
    try { if (on() && Array.isArray(r) && kind === 'col') return r.filter(id => !isCareer(id)); } catch (e) {}
    return r;
   };
  }
  if (typeof V33.autoFill === 'function') { // AUTO never picks an unfinished career card
   const AF0 = V33.autoFill;
   V33.autoFill = function(kind, exceptId) {
    const r = AF0.apply(this, arguments);
    try {
     if (on() && Array.isArray(r) && r.some(badCareer)) {
      const out = r.filter(x => !badCareer(x));
      const pool = V33.eligible(kind, exceptId).filter(x => !badCareer(x) && !out.includes(x));
      for (const x of r) if (badCareer(x)) { const p = (PP(x) || {}).pos, rep = pool.find(y => PP(y) && PP(y).pos === p) || pool[0]; if (rep) { out.push(rep); pool.splice(pool.indexOf(rep), 1); } }
      return out;
     }
    } catch (e) { err(e, 'autoFill'); }
    return r;
   };
  }
  if (typeof V33.isColCard === 'function') {
   const IC0 = V33.isColCard;
   V33.isColCard = function(id) { if (on() && isCareer(id)) return false; return IC0.apply(this, arguments); };
  }
  if (typeof V33.validate === 'function') {
   const VA0 = V33.validate;
   V33.validate = function(E2) {
    try {
     if (on() && E2 && Array.isArray(E2.ids)) {
      if (E2.ids.some(badCareer)) return 'ONLY USABLE ONCE CAREER IS COMPLETE';
      if (E2.kind === 'col' && E2.ids.some(isCareer)) return 'COLLEGE CARD TEAMS: COLLEGE PLAYER CARDS ONLY';
     }
    } catch (e) {}
    return VA0.apply(this, arguments);
   };
  }
  if (typeof V33.saveTeam === 'function') {
   const SV0 = V33.saveTeam;
   V33.saveTeam = function(E2) {
    try {
     if (on() && E2 && Array.isArray(E2.ids)) {
      if (E2.ids.some(badCareer)) { careerPop(); return { err: 'ONLY USABLE ONCE CAREER IS COMPLETE' }; }
      if (E2.kind === 'col' && E2.ids.some(isCareer)) return { err: 'COLLEGE CARD TEAMS: COLLEGE PLAYER CARDS ONLY' };
     }
    } catch (e) {}
    return SV0.apply(this, arguments);
   };
  }
 }
 // the card team editor's SAVE and the lineup editor's SAVE: an unfinished career card -> the popup, nothing saved
 if (typeof PANEL_ACT !== 'undefined') {
  const CS0 = PANEL_ACT.ct33save;
  if (typeof CS0 === 'function') PANEL_ACT.ct33save = function() {
   try {
    const E2 = window.V33 && V33.E;
    if (on() && E2 && Array.isArray(E2.ids) && E2.ids.some(badCareer)) {
     E2.ids = E2.ids.filter(x => !badCareer(x));
     E2.msg = 'ONLY USABLE ONCE CAREER IS COMPLETE';
     LOG.cr.push([ 'team save blocked' ]);
     careerPop();
     return;
    }
   } catch (e) { err(e, 'ct33save'); }
   return CS0.apply(this, arguments);
  };
  const LS0 = PANEL_ACT.luSave;
  if (typeof LS0 === 'function') PANEL_ACT.luSave = function() {
   try {
    if (on() && typeof PS !== 'undefined' && PS && PS.lu && JSON.stringify(PS.lu).match(/"[^"]*(CR59-|CAR459-)[^"]*"/g)) {
     const bad = (JSON.stringify(PS.lu).match(/"[^"]*(CR59-|CAR459-)[^"]*"/g) || []).map(s => s.slice(1, -1)).filter(badCareer);
     if (bad.length) { LOG.cr.push([ 'lineup save blocked', bad ]); careerPop(); return; }
    }
   } catch (e) { err(e, 'luSave'); }
   return LS0.apply(this, arguments);
  };
 }
 // a tap on an unfinished career card in the card team editor / slot picker -> the popup, not added
 document.addEventListener('click', e => {
  try {
   if (!on()) return;
   const el = e.target && e.target.closest && e.target.closest('[data-pid],[data-v],[data-id]');
   if (!el || el.closest('#lvl478') || el.closest('#tr24')) return;
   const scr = typeof screen === 'string' ? screen : '';
   const id = el.getAttribute('data-pid') || el.getAttribute('data-v') || el.getAttribute('data-id') || '';
   if (!isCareer(id) || !badCareer(id)) return;
   if (!/ct33|lineup|lu|sub/i.test(scr + ' ' + (el.getAttribute('data-a') || ''))) return;
   e.preventDefault();
   e.stopImmediatePropagation();
   careerPop();
  } catch (x) { err(x, 'crtap'); }
 }, true);

 // ---------- trades: career cards can't be traded (client side; the net protocol is unchanged) ----------
 const trBlock = e => {
  try {
   if (!on()) return;
   const t = e.target && e.target.closest ? e.target : null;
   if (!t || !t.closest('#tr24')) return;
   const cd = t.closest('.cd[data-k]');
   if (cd && /CR59-/.test(cd.getAttribute('data-k') || '')) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.type === 'click') { LOG.tr.push([ 'tap blocked', cd.getAttribute('data-k') ]); tradePop(); }
    return;
   }
   const b = t.closest('#b24ok');
   if (b && document.querySelector('#tr24 .cd[data-k*="CR59-"]')) {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.type === 'click') { LOG.tr.push([ 'accept blocked' ]); tradePop(); }
   }
  } catch (x) { err(x, 'tr'); }
 };
 for (const ev of [ 'click', 'touchend', 'pointerup' ]) window.addEventListener(ev, trBlock, true);
 // an already pending trade of yours that lists a career card: cancel it with the game's own CANCEL TRADE (existing call)
 setInterval(() => {
  try {
   if (!on()) return;
   const r = document.getElementById('tr24');
   if (!r || r.style.display === 'none') return;
   const cancel = document.getElementById('b24cancel');
   if (cancel && !cancel.disabled && r.querySelector('.cd[data-k*="CR59-"]') && !cancel.__lvl478) {
    cancel.__lvl478 = 1;
    LOG.tr.push([ 'pending trade with a career card: cancelled' ]);
    cancel.click();
    tradePop();
   }
  } catch (e) { err(e, 'trcancel'); }
 }, 800);

 // ---------- art: the Baggatwaan card also wears the All-American flag patch ----------
 if (window.HON25 && typeof HON25.art === 'function') {
  const A0 = HON25.art, cache = new Map;
  HON25.art = function(pid, tid, sil) {
   const c = A0.apply(this, arguments);
   try {
    if (!c || !on() || sil || !/^TW25-/.test(S_(pid))) return c;
    if (cache.has(c)) return cache.get(c);
    const o = document.createElement('canvas');
    o.width = c.width;
    o.height = c.height;
    const x = o.getContext('2d'), s = c.width / 32;
    x.imageSmoothingEnabled = false;
    x.drawImage(c, 0, 0);
    const fl = [ 'BRRRRRR', 'BWWWWWW', 'BRRRRRR', 'WWWWWWW', 'RRRRRRR' ], fc = { B: '#2a4bb8', R: '#d8202c', W: '#ffffff' };
    x.fillStyle = '#0d0d0d';
    x.fillRect(23 * s, 25 * s, 9 * s, 7 * s);
    fl.forEach((row, r) => { for (let q = 0; q < 7; q++) { x.fillStyle = fc[row[q]]; x.fillRect((24 + q) * s, (26 + r) * s, s, s); } });
    cache.set(c, o);
    return o;
   } catch (e) { err(e, 'art'); return c; }
  };
 }

 // ---------- old saves: 2+ versions of one player -> one card (highest level, both looks when Ultimate + honor) ----------
 function sweep(show) {
  if (!on()) return 0;
  let n = 0;
  const groups = {}, batch = {};
  for (const k of Object.keys(cards())) {
   if (skip(k)) continue;
   const b = realOf(k);
   if (!famOK(b)) continue;
   (groups[b] = groups[b] || []).push(k);
  }
  for (const b in groups) {
   const g = groups[b];
   if (g.length < 2) continue;
   let to = combine(g);
   if (isCareer(b) && hOf(to)) to = idOf(isU(to), 0, b); // never invent a career honor
   if (!ensureP(to)) { // the combined version can't be built: keep the highest one that exists
    to = g.slice().sort((x, y) => rank(y) - rank(x)).find(ensureP);
    if (!to) continue;
   }
   upgrade(g, to, show ? 'TRADE/OTHER' : 'MIGRATION', !!show, batch);
   n++;
  }
  if (n) refs(batch, show ? 'TRADE/OTHER' : 'MIGRATION');
  return n;
 }
 // unfinished career cards already on a team: removed from it (slot refilled like a removed card)
 function careerSweep() {
  let n = 0;
  try {
   if (!window.V33 || !V33.D) return 0;
   const all = [].concat(V33.D.pro || [], V33.D.col || []);
   const bad = {};
   for (const t of all) for (const id of (t.ids || []).slice()) {
    if (badCareer(id)) { bad[id] = null; LOG.cr.push([ 'removed from team (career not complete)', t.id, id ]); }
    else if (/^SZ0C/.test(t.id) && isCareer(id)) { // a pro career card on a college card team: off that team only
     t.ids = t.ids.filter(x => x !== id); n++; LOG.cr.push([ 'removed from college card team (pro player)', t.id, id ]);
     try { V33.save(); V33.regAll(); } catch (e) {}
    }
   }
   if (Object.keys(bad).length) n += fixTeamsAll(bad, 'career card not complete');
   for (const id of Object.keys(cards())) if (badCareer(id)) n += fixLineups(id, null);
  } catch (e) { err(e, 'crsweep'); }
  return n;
 }
 function boot() {
  try { css(); } catch (e) { err(e, 'css'); }
  try {
   if (!D.mig) {
    const n = sweep(false);
    D.mig = { at: Date.now(), groups: n };
    save();
   }
   careerSweep();
  } catch (e) { err(e, 'boot'); }
 }
 // run after the other modules built their cards (HON25 / ULT331 ensureOwned, V33.regAll)
 setTimeout(boot, 0);
 setInterval(() => { try { if (!inGrant && D.mig) { sweep(true); } } catch (e) { err(e, 'tick'); } }, 4e3);

 window.V478 = {
  on: on, LOG: LOG, st: () => D, realOf: realOf, combine: combine, family: family, sweep: sweep, careerSweep: careerSweep,
  careerDone: careerDone, badCareer: badCareer, levelPop: levelPop, popup: popup, LVN: LVN
 };
})();
