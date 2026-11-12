/* v502live.js - Live ops (Bagga Lax 1.3).
   One config: https://baggalax.github.io/config/liveops.json
   No-cache, 4s timeout. Last good copy in localStorage rl_liveops502.
   Built-in defaults match the 1.3 shop: college uniform packs stay off, Good Stick stays hidden,
   Halloween is 72h from first open, Veterans pack + tournament are 96h from first open.
   Kill switch: window.__rl_no502 = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no502 || W.LIVEOPS) return;
 const URL = 'https://baggalax.github.io/config/liveops.json';
 const KEY = 'liveops502';
 const V = W.LIVEOPS = { log: [], err: [], url: URL, ready: false, offset: 0, src: 'default' };
 const note = s => { V.log.push(s); if (V.log.length > 40) V.log.shift(); };
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + (e && e.message || e)); };
 const lsGet = (k, d) => { try { return LS.get(k, d); } catch (e) { return d; } };
 const lsSet = (k, v) => { try { LS.set(k, v); } catch (e) {} };

 const PAST_PACKS = [
  { id: 'pack_b2504c', kind: 'pack', name: 'SKY CHROME PACK', price: 20, past: true, section: 'shop',
    text: 'Left the shop in the Veterans drop. SKY CHROME (was CHROME DOME) college uniform, baby blue stick, baby blue tape, baby blue cleats.',
    gives: [ 'uni21|CUNC|8', 'stick_babyblue', 'tape_babyblue', 'cleats_babyblue' ] },
  { id: 'pack_b2504l', kind: 'pack', name: 'GOLD CROWN PACK', price: 25, past: true, section: 'shop',
    text: 'Left the shop in the Veterans drop. GOLD CROWN (was LUCKY) college uniform, green stick, green tape, green cleats, gold collar.',
    gives: [ 'uni21|CND|8', 'stick_green', 'tape_green', 'cleats_green', 'collar_gold' ] },
  { id: 'pack_goodstick', kind: 'pack', name: 'GOOD STICK PACK', price: 20, past: true, section: 'collab',
    text: 'COLLAB. Good Stick Shortie, Goalie Stick, Good Stick Tape, and the Good Stick Co. team. Hidden until this id is in the shop list.',
    gives: [ 'stick_gsc_shortie', 'stick_gsc_goalie', 'tape_gsc', 'gsc_team' ] }
 ];
 const PAST_ITEMS = [
  [ 'stick_orange', 'ORANGE STICK', 5, 'Halloween pack stick. Looks only.' ],
  [ 'stick_spooky', 'SPOOKY STICK', 12, 'Halloween pack. Rare stick, purple head, green flame, breaks on 1.2% of checks.' ],
  [ 'tape_purple', 'PURPLE TAPE', 3, 'Halloween pack tape.' ],
  [ 'tape_orange', 'ORANGE TAPE', 3, 'Halloween pack tape.' ],
  [ 'cleats_orange', 'ORANGE CLEATS', 5, 'Halloween pack cleats.' ],
  [ 'uni21|WAT|7', 'WATERDOGS HALLOWEEN', 8, 'Halloween uniform. Waterdogs only.' ],
  [ 'uni21|ARC|7', 'ARCHERS HALLOWEEN', 8, 'Halloween uniform. Archers only.' ],
  [ 'uni21|GHO|2', 'WHITE GHOST', 15, 'Ghosts uniform. Pulled from sale except for Halloween pack owners.' ],
  [ 'uni21|GHO|3', 'SKELETON', 15, 'Ghosts uniform. Pulled from sale except for Halloween pack owners.' ],
  [ 'stick_babyblue', 'BABY BLUE STICK', 5, 'Was in the Sky Chrome pack.' ],
  [ 'tape_babyblue', 'BABY BLUE TAPE', 3, 'Was in the Sky Chrome pack.' ],
  [ 'cleats_babyblue', 'BABY BLUE CLEATS', 5, 'Was in the Sky Chrome pack.' ],
  [ 'uni21|CUNC|8', 'SKY CHROME UNIFORM', 10, 'Was in the Sky Chrome pack.' ],
  [ 'stick_green', 'GREEN STICK', 5, 'Was in the Gold Crown pack.' ],
  [ 'tape_green', 'GREEN TAPE', 3, 'Was in the Gold Crown pack.' ],
  [ 'cleats_green', 'GREEN CLEATS', 5, 'Was in the Gold Crown pack.' ],
  [ 'collar_gold', 'GOLD COLLAR', 5, 'Was in the Gold Crown pack.' ],
  [ 'uni21|CND|8', 'GOLD CROWN UNIFORM', 10, 'Was in the Gold Crown pack.' ],
  [ 'stick_v491ss', 'STARS + STRIPES STICK', 8, 'Veterans Day Honor Pack stick.' ],
  [ 'stick_v491rwb', 'RED WHITE + BLUE STICK', 8, 'Veterans Day Honor Pack stick.' ],
  [ 'stick_v491hw', 'HONOR WHITE STICK', 8, 'Veterans Day Honor Pack stick.' ],
  [ 'stick_gsc_shortie', 'GOOD STICK SHORTIE', 10, 'Collab stick. Rare effects, COLLAB label. Field players only.' ],
  [ 'stick_gsc_goalie', 'GOOD STICK GOALIE STICK', 10, 'Collab stick. Rare effects, COLLAB label. Goalies only.' ],
  [ 'tape_gsc', 'GOOD STICK TAPE', 5, 'Collab tape. Rare effects, COLLAB label.' ],
  [ 'gsc_team', 'GOOD STICK CO. TEAM', 0, 'Collab team unlock.' ]
 ];
 const MODES = [
  { id: 'mode_vets489', kind: 'mode', name: 'VETERANS TOURNAMENT', past: false, text: 'Six service teams. Win 3 games for the Honor Medal. The 1.3 clock is 96 hours from the first open on this device (the old 48 hours plus 2 days).' },
  { id: 'mode_ultimate', kind: 'mode', name: 'ULTIMATE TOURNAMENT', past: true, text: 'Always in PLAY. Listed so it can be featured under Special Games.' },
  { id: 'mode_world', kind: 'mode', name: 'WORLD GAMES', past: true, text: 'Always in PLAY. Listed so it can be featured under Special Games.' },
  { id: 'mode_college', kind: 'mode', name: 'COLLEGE TOURNAMENT', past: true, text: 'Always in PLAY. Listed so it can be featured under Special Games.' }
 ];

 function builtin() {
  const shop = [
   'pack_daily', 'pack_basic', 'pack_rare', 'pack_legendary', 'pack_stickfree', 'pack_pass',
   'pack_tape', 'pack_chirp', 'pack_gear', 'pack_crew', 'pack_stick', 'pack_unip', 'pack_unic', 'pack_uniw',
   'pack_pc38c', 'pack_pc38r', 'pack_pc38l', 'pack_cu38', 'pack_relax', 'pack_fit45'
  ].map(id => ({ id: id }));
  shop.push({ id: 'pack_halloween', windowHours: 72, anchor: 'hw493start' });
  shop.push({ id: 'pack_vets489', windowHours: 96, anchor: 'vets489start' });
  return {
   shop: shop,
   specials: [ { id: 'mode_vets489', windowHours: 96, anchor: 'vets489start' } ],
   goodstick: {
    enabled: false,
    roster: (typeof GSC501 !== 'undefined' && GSC501.defaultRoster) ? GSC501.defaultRoster() : [],
    promo: { enabled: true, text: 'Use code "{code}" at thegoodstick.co for {percent}% off', code: '____', percent: '__', url: 'https://thegoodstick.co' }
   }
  };
 }
 let cfg = builtin();

 function now() {
  if (W.__rlLiveNow != null) return +W.__rlLiveNow;
  return Date.now() + (V.offset || 0);
 }
 V.now = now;
 function anchorOf(row, id) {
  if (row.start) { const t = Date.parse(row.start); if (!isNaN(t)) return t; }
  const key = row.anchor || ('lo502_' + id);
  let t = lsGet(key, null);
  if (!t) { t = now(); lsSet(key, t); }
  return +t;
 }
 function rowOn(row, id) {
  if (!row || row.enabled === false) return false;
  const t = now();
  if (row.start) { const s = Date.parse(row.start); if (!isNaN(s) && t < s) return false; }
  if (row.end) { const e = Date.parse(row.end); if (!isNaN(e) && t > e) return false; }
  if (row.windowHours) {
   const a = anchorOf(row, id);
   if (t > a + (+row.windowHours) * 3600e3) return false;
  }
  return true;
 }
 function find(id) {
  const shop = Array.isArray(cfg.shop) ? cfg.shop : [];
  const specials = Array.isArray(cfg.specials) ? cfg.specials : [];
  return shop.find(r => r && r.id === id) || specials.find(r => r && r.id === id) || null;
 }
 V.shopOn = id => { const r = (cfg.shop || []).find(x => x && x.id === id); return !!(r && rowOn(r, id)); };
 V.specialOn = id => { const r = (cfg.specials || []).find(x => x && x.id === id); return !!(r && rowOn(r, id)); };
 V.price = id => { const r = find(id); return r && r.price != null && isFinite(+r.price) ? +r.price : null; };
 V.section = id => { const r = find(id); return r && r.section ? String(r.section) : null; };
 function leftMs(id) {
  const r = find(id);
  if (!r) return null;
  const t = now();
  let end = null;
  if (r.end) { const e = Date.parse(r.end); if (!isNaN(e)) end = e; }
  if (r.windowHours) {
   const w = anchorOf(r, id) + (+r.windowHours) * 3600e3;
   end = end == null ? w : Math.min(end, w);
  }
  return end == null ? null : end - t;
 }
 V.leftMs = leftMs;
 V.leftText = id => {
  const ms = leftMs(id);
  if (ms == null) return '';
  if (ms <= 0) return '';
  const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
  return 'LEAVES IN ' + (d > 0 ? d + 'D ' + h + 'H' : h > 0 ? h + 'H ' + mm + 'M' : Math.max(1, mm) + 'M');
 };
 V.goodstick = () => cfg.goodstick && typeof cfg.goodstick === 'object' ? cfg.goodstick : { enabled: false, roster: [] };
 V.activeSpecials = () => (cfg.specials || []).filter(r => r && rowOn(r, r.id));

 function cleanList(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const row of list) {
   if (!row || typeof row.id !== 'string' || !row.id) continue;
   const o = { id: row.id.slice(0, 80) };
   if (row.price != null && isFinite(+row.price) && +row.price >= 0) o.price = +row.price;
   if (typeof row.section === 'string') o.section = row.section.slice(0, 24);
   if (typeof row.start === 'string' && !isNaN(Date.parse(row.start))) o.start = row.start;
   if (typeof row.end === 'string' && !isNaN(Date.parse(row.end))) o.end = row.end;
   if (row.windowHours != null && isFinite(+row.windowHours) && +row.windowHours > 0) o.windowHours = +row.windowHours;
   if (typeof row.anchor === 'string') o.anchor = row.anchor.slice(0, 40);
   if (row.enabled === false) o.enabled = false;
   out.push(o);
  }
  return out;
 }
 function cleanPromo(p) {
  const d = { enabled: true, text: 'Use code "{code}" at thegoodstick.co for {percent}% off', code: '____', percent: '__', url: 'https://thegoodstick.co' };
  if (!p || typeof p !== 'object') return d;
  const url = typeof p.url === 'string' && /^https?:\/\//i.test(p.url.trim()) ? p.url.trim().slice(0, 200) : d.url;
  return {
   enabled: p.enabled !== false,
   text: typeof p.text === 'string' && p.text.trim() ? p.text.trim().slice(0, 180) : d.text,
   code: p.code == null ? d.code : String(p.code).slice(0, 40),
   percent: p.percent == null ? d.percent : String(p.percent).slice(0, 8),
   url: url
  };
 }
 function posOf(s) {
  const p = String(s || '').toUpperCase().trim();
  if (p === 'A' || p === 'O' || p === 'OFFENSE' || p === 'ATTACK') return 'A';
  if (p === 'M' || p === 'MID' || p === 'MIDFIELD') return 'M';
  if (p === 'D' || p === 'DEFENSE' || p === 'DEFENCE') return 'D';
  if (p === 'FO' || p === 'F' || p === 'FACEOFF') return 'FO';
  if (p === 'G' || p === 'GOALIE') return 'G';
  if (p === 'LSM') return 'LSM';
  return '';
 }
 function cleanRoster(g) {
  const roster = [];
  const src = g && Array.isArray(g.roster) ? g.roster : [];
  for (const row of src) {
   if (!row || typeof row !== 'object') continue;
   const name = String(row.name || '').trim().slice(0, 16).toUpperCase();
   const position = posOf(row.position);
   if (!name || !position) continue;
   const item = { name: name, number: Math.max(0, Math.min(99, row.number | 0)), position: position };
   if (row.filler) item.filler = true;
   if (row.starter === true) item.starter = true;
   else if (row.starter === false) item.starter = false;
   roster.push(item);
   if (roster.length >= 20) break;
  }
  const base = (typeof GSC501 !== 'undefined' && GSC501.defaultRoster) ? GSC501.defaultRoster() : [];
  return { enabled: !!(g && g.enabled), roster: roster.length ? roster : base, promo: cleanPromo(g && g.promo) };
 }
 function accept(raw, src) {
  if (!raw || typeof raw !== 'object') return false;
  const shop = cleanList(raw.shop);
  const specials = cleanList(raw.specials);
  const known = new Set(catalog().map(c => c.id));
  cfg = {
   shop: shop.filter(r => known.has(r.id)),
   specials: specials.filter(r => known.has(r.id)),
   goodstick: cleanRoster(raw.goodstick)
  };
  const dropped = shop.length - cfg.shop.length + (specials.length - cfg.specials.length);
  if (dropped) note('ignored ' + dropped);
  V.src = src;
  V.cfg = cfg;
  try { if (W.GSC501 && GSC501.applyRoster) GSC501.applyRoster(); } catch (e) {}
  try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {}
  return true;
 }
 function validateStore(raw) {
  try { return !!(raw && typeof raw === 'object' && (Array.isArray(raw.shop) || Array.isArray(raw.specials) || raw.goodstick)); } catch (e) { return false; }
 }

 const PACK_META = {
  pack_daily: [ 'FREE DAILY PACK', 0, 'One free pack a day.' ],
  pack_basic: [ 'BASIC PACK', 5, '5 cards. Mostly commons.' ],
  pack_rare: [ 'RARE PACK', 15, 'A guaranteed rare.' ],
  pack_legendary: [ 'LEGENDARY PACK', 50, 'The legendary pack.' ],
  pack_stickfree: [ 'FREE STICK PACK', 0, 'One free stick pack a day.' ],
  pack_pass: [ 'SEASON 1 GAME PASS', 50, '21 levels. Old Foxworth at the end.' ],
  pack_tape: [ 'TAPE PACK', 3, 'Only tape.' ],
  pack_chirp: [ 'CHIRP PACK', 8, 'Only chirps.' ],
  pack_gear: [ 'GEAR PACK', 20, 'Helmets, visors, collars, shorts, cleats.' ],
  pack_crew: [ 'CREW PACK', 25, 'Team crew.' ],
  pack_stick: [ 'STICK PACK', 30, 'Sticks and faceoff sticks.' ],
  pack_unip: [ 'PRO UNIFORM PACK', 15, 'Pro team uniforms.' ],
  pack_unic: [ 'COLLEGE UNIFORM PACK', 15, 'College uniforms.' ],
  pack_uniw: [ 'WORLD UNIFORM PACK', 15, 'World team uniforms.' ],
  pack_pc38c: [ 'COMMON PLAYER PACK', 40, 'Player cards.' ],
  pack_pc38r: [ 'RARE PLAYER PACK', 70, 'Player cards, a rare guaranteed.' ],
  pack_pc38l: [ 'LEGENDARY PLAYER PACK', 120, 'Player cards.' ],
  pack_cu38: [ 'CUSTOM CARD PACK', 65, 'Custom player cards.' ],
  pack_relax: [ 'RELAX PAL', 30, 'The legendary chirp. Buy once.' ],
  pack_fit45: [ 'THE WHALE OR THE CROWN', 200, 'Pick one uniform. The other locks.' ],
  pack_halloween: [ 'HALLOWEEN PACK', 15, 'Orange stick, Spooky stick, tape, cleats, Waterdogs and Archers Halloween uniforms, White Ghost and Skeleton. 72 hours from the first open, then it leaves. Owned pieces stay.' ],
  pack_vets489: [ 'VETERANS DAY HONOR PACK', 10, 'Six service teams, their uniforms (camo, fighter pilot, astronaut, galaxy), honor sticks, and the Veterans tournament. 96 hours from the first open.' ]
 };
 function catalog() {
  const out = [];
  const seen = new Set();
  const push = row => { if (!row || !row.id || seen.has(row.id)) return; seen.add(row.id); out.push(row); };
  Object.keys(PACK_META).forEach(id => push({ id: id, kind: 'pack', name: PACK_META[id][0], price: PACK_META[id][1], text: PACK_META[id][2], past: false, section: 'shop' }));
  PAST_PACKS.forEach(p => push(p));
  PAST_ITEMS.forEach(([id, name, price, text]) => push({ id: id, kind: 'item', name: name, price: price, text: text, past: true, section: 'shop' }));
  MODES.forEach(m => push(m));
  try {
   const BY = W.V17 && V17.BY;
   if (BY) for (const id in BY) {
    const it = BY[id];
    if (!it || !it.n) continue;
    push({ id: id, kind: 'item', name: it.n, price: it.rar === 2 ? 15 : it.rar === 1 ? 8 : 3, text: it.d || '', past: false, section: it.collab ? 'collab' : 'shop', rar: it.dispRar || (it.rar === 2 ? 'LEGENDARY' : it.rar === 1 ? 'RARE' : 'COMMON') });
   }
  } catch (e) { fail('cat', e); }
  return out;
 }
 V.catalog = catalog;
 V.PACK_META = PACK_META;

 function knownIds() { return new Set(catalog().map(c => c.id)); }

 function applyPrices() {
  try {
   const P = V17 && V17.PACKS;
   if (!P) return;
   for (const id of Object.keys(PACK_META)) {
    const key = id.replace(/^pack_/, '');
    if (!P[key]) continue;
    const p = V.price(id);
    if (p != null) P[key].cost = p;
   }
  } catch (e) {}
 }

 const PACK_BTN = {
  pack_daily: 'daily', pack_basic: 'basic', pack_rare: 'rare', pack_legendary: 'legendary',
  pack_stickfree: 'stickfree', pack_tape: 'tape', pack_chirp: 'chirp', pack_gear: 'gear', pack_crew: 'crew', pack_stick: 'stick',
  pack_unip: 'unip', pack_unic: 'unic', pack_uniw: 'uniw', pack_pc38c: 'pc38c', pack_pc38r: 'pc38r', pack_pc38l: 'pc38l', pack_cu38: 'cu38',
  pack_b2504c: 'b2504c', pack_b2504l: 'b2504l', pack_halloween: 'halloween', pack_vets489: 'vets489'
 };
 function paint(html) {
  if (typeof html !== 'string') return html;
  if (html.indexOf('YOU GET ALL OF THESE - 3 ITEMS + THE TEAM') >= 0 || html.indexOf('NICE PULL!') >= 0 && html.indexOf('GOOD STICK') >= 0) return html;
  let doc;
  try { doc = new DOMParser().parseFromString('<div id="loRoot">' + html + '</div>', 'text/html'); } catch (e) { return html; }
  const root = doc.getElementById('loRoot');
  if (!root) return html;
  root.querySelectorAll('[data-v]').forEach(el => {
   const v = el.getAttribute('data-v') || '';
   let id = null;
   for (const k in PACK_BTN) if (PACK_BTN[k] === v) id = k;
   if (!id) return;
   if (V.shopOn(id)) {
    const left = V.leftText(id);
    if (left && el.closest) {
     const tile = el.closest('.pk17,.spk17,.hw16') || el.parentNode;
     if (tile && !tile.querySelector('.lo502left')) {
      const b = doc.createElement('i');
      b.className = 'lo502left';
      b.textContent = left;
      tile.appendChild(b);
     }
    }
   } else {
    const tile = el.closest && el.closest('.pk17,.spk17,.hw16,.fit45');
    if (tile) tile.remove();
   }
  });
  if (!V.shopOn('pack_halloween')) { const n = root.querySelector('#hw16tile'); if (n) n.remove(); }
  if (!V.shopOn('pack_vets489')) { const n = root.querySelector('#vets489tile'); if (n) n.remove(); }
  if (!V.shopOn('pack_relax')) { const n = root.querySelector('#relax27tile'); if (n) n.remove(); }
  if (!V.shopOn('pack_fit45')) { const n = root.querySelector('#fit45tile'); if (n) n.remove(); }
  if (!V.shopOn('pack_pass')) { const n = root.querySelector('.pk17.pass'); if (n) n.remove(); }
  const singles = (cfg.shop || []).filter(r => r && V.shopOn(r.id) && V.catalog().some(c => c.id === r.id && c.kind === 'item'));
  let extra = '';
  if (singles.length) {
   extra = '<div class="sh17">BROUGHT BACK</div><div class="shop17">' + singles.map(r => {
    const c = catalog().find(x => x.id === r.id) || { name: r.id, price: 0 };
    const price = r.price != null ? r.price : c.price;
    const left = V.leftText(r.id);
    return '<div class="spk17"><b>' + c.name + '</b><small>' + (c.text || '') + (left ? ' ' + left : '') + '</small><button type="button" class="y" data-a="lo502buy" data-v="' + r.id + '">' + price + '</button></div>';
   }).join('') + '</div>';
  }
  const tab = V.tab || 'shop';
  const packHtml = W.GSC501 && GSC501.shopBlock ? GSC501.shopBlock() : '';
  const promoHtml = !packHtml && W.GSC501 && GSC501.promoHtml ? GSC501.promoHtml() : '';
  const collab = packHtml || ('<div class="note">NOTHING RIGHT NOW</div>' + promoHtml);
  const tabs = '<div class="row tabs lo502tabs"><button type="button" data-a="lo502tab" data-v="shop" class="' + (tab === 'shop' ? 'on' : 'd') + '">SHOP</button><button type="button" data-a="lo502tab" data-v="collab" class="' + (tab === 'collab' ? 'on' : 'd') + '">COLLAB</button></div><div class="st">COLLAB REAL BRANDS + REAL PEOPLE</div>';
  const body = root.innerHTML;
  if (tab === 'collab') return tabs + '<div id="loCollab">' + collab + extra + '</div>';
  return tabs + '<div id="loShop">' + body + extra + '</div>';
 }

 function hook() {
  try {
   if (typeof PANEL_RENDER === 'object' && typeof PANEL_RENDER.shop17 === 'function' && !PANEL_RENDER.shop17.__lo502) {
    const r0 = PANEL_RENDER.shop17;
    const wrapped = function () {
     applyPrices();
     let h = r0.apply(this, arguments);
     try { h = paint(h); } catch (e) { fail('paint', e); }
     return h;
    };
    wrapped.__lo502 = true;
    PANEL_RENDER.shop17 = wrapped;
   }
  } catch (e) { fail('hook', e); }
  try {
   if (typeof PANEL_ACT === 'object') {
    PANEL_ACT.lo502tab = v => { V.tab = v === 'collab' ? 'collab' : 'shop'; try { refresh(); } catch (e) {} };
    PANEL_ACT.lo502buy = id => {
     try {
      const s = V17.ST();
      const price = V.price(id);
      const meta = catalog().find(c => c.id === id);
      const cost = price != null ? price : meta && meta.price || 0;
      if (!s || (s.chinos | 0) < cost) { V17.toast('NOT ENOUGH DIMES', '#ff9a8a'); return; }
      s.chinos -= cost;
      if (V17.grant) V17.grant(id, 1); else s.inv[id] = (s.inv[id] || 0) + 1;
      V17.save();
      V17.toast(meta ? meta.name + ' IS YOURS' : 'YOURS', '#7dff7a');
     } catch (e) { fail('buy', e); }
    };
   }
  } catch (e) { fail('act', e); }
  try {
   if (typeof W.menuBars === 'function' && !W.menuBars.__lo502) {
    const m0 = W.menuBars;
    const wrapped = function () {
     let rows = m0.apply(this, arguments);
     try {
      if (!Array.isArray(rows)) return rows;
      rows = rows.map(r => Array.isArray(r) ? r.filter(b => !(b && b.v489)) : r).filter(r => !Array.isArray(r) || r.length);
      if (!(W.M37 && M37.page === 'play' && W.V469 && V469.page === 'pick')) return rows;
      const on = V.activeSpecials();
      const left = on.map(s => (catalog().find(c => c.id === s.id) || {}).name + (V.leftText(s.id) ? ' ' + V.leftText(s.id) : '')).join('  ');
      const btn = { label: 'SPECIAL GAMES', fn: () => openSpecials(on), bg: on.length ? '#5aa0ff' : '#5a6570', fg: on.length ? '#0b1a20' : '#9aa', m37: 1, h37: 28, t469: 'pick', big469: 1, lo502: 1, loOff: !on.length, loLeft: on.length ? left : 'NOTHING RIGHT NOW' };
      const i = rows.findIndex(r => r && r[0] && r[0].m37 === 'back');
      if (i >= 0) rows.splice(i, 0, [ btn ]); else rows.push([ btn ]);
     } catch (e) { fail('menu', e); }
     return rows;
    };
    wrapped.__lo502 = true;
    W.menuBars = wrapped;
   }
   if (typeof W.menuBar === 'function' && !W.menuBar.__lo502) {
    const b0 = W.menuBar;
    const wrapped = function (b) {
     const r = b0.apply(this, arguments);
     try {
      if (b && b.lo502 && b.loLeft && typeof text === 'function') {
       text(b.loLeft, b.x + 6, b.y + b.h - 8, 1, b.loOff ? '#9aa' : '#fff');
      }
     } catch (e) {}
     return r;
    };
    wrapped.__lo502 = true;
    W.menuBar = wrapped;
   }
  } catch (e) { fail('bars', e); }
 }
 function openSpecials(on) {
  if (!on || !on.length) { try { V17.toast('NOTHING RIGHT NOW', '#9aa'); } catch (e) {} return; }
  if (on.length === 1 && on[0].id === 'mode_vets489' && W.VETS489 && VETS489.openTour) { VETS489.openTour(); return; }
  const html = '<div class="hd"><div><div class="tt">SPECIAL GAMES</div><div class="st">' + on.length + ' ON NOW</div></div><div class="sp"></div><button type="button" class="g" data-a="lo502back">BACK</button></div><div class="scroll">' + on.map(s => {
   const c = catalog().find(x => x.id === s.id) || { name: s.id, text: '' };
   return '<div class="hw16"><div class="hwb16"><b>' + c.name + '</b><small>' + (c.text || '') + ' ' + V.leftText(s.id) + '</small></div><div class="hwc16"><button type="button" class="y" data-a="lo502mode" data-v="' + s.id + '">PLAY</button></div></div>';
  }).join('') + '</div>';
  try {
   PANEL_RENDER.lo502 = () => html;
   if (Array.isArray(W.PANEL_SCREENS) && PANEL_SCREENS.indexOf('lo502') < 0) PANEL_SCREENS.push('lo502');
   PANEL_ACT.lo502back = () => { screen = 'menu'; };
   PANEL_ACT.lo502mode = id => {
    if (id === 'mode_vets489' && W.VETS489) VETS489.openTour();
    else if (id === 'mode_ultimate') screen = 'menu';
    else V17.toast(id, '#ffd23a');
   };
   screen = 'lo502';
   panelDirty();
  } catch (e) { fail('open', e); }
 }
 V.openSpecials = openSpecials;

 async function refresh() {
  if (W.__rlLiveForce) { accept(W.__rlLiveForce, 'force'); V.ready = true; hook(); return; }
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => { try { ctrl && ctrl.abort(); } catch (e) {} }, 4000);
  try {
   const res = await fetch(URL + '?t=' + Date.now(), { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined });
   const dh = res.headers.get('date') || res.headers.get('Date');
   if (dh && !isNaN(Date.parse(dh))) V.offset = Date.parse(dh) - Date.now();
   if (!res.ok) throw new Error('http ' + res.status);
   const raw = await res.json();
   if (!validateStore(raw)) throw new Error('bad json');
   accept(raw, 'net');
   try { localStorage.setItem('rl_' + KEY, JSON.stringify(raw)); } catch (e) {}
   note('net');
  } catch (e) {
   fail('fetch', e);
   let cached = null;
   try { cached = JSON.parse(localStorage.getItem('rl_' + KEY) || 'null'); } catch (x) {}
   if (validateStore(cached)) accept(cached, 'cache');
   else accept(builtin(), 'default');
  } finally {
   clearTimeout(timer);
   V.ready = true;
   hook();
   try { if (typeof panelDirty === 'function') panelDirty(); } catch (x) {}
  }
 }
 V.refresh = refresh;
 try {
  const o0 = V17.openShop;
  if (typeof o0 === 'function') V17.openShop = function () { refresh(); return o0.apply(this, arguments); };
 } catch (e) {}
 refresh();
 setInterval(() => { try { if (V.ready) { accept(cfg, V.src); if (typeof panelDirty === 'function' && (screen === 'menu' || screen === 'shop17' || screen === 'lo502')) panelDirty(); } } catch (e) {} }, 20000);
 setInterval(() => { try { refresh(); } catch (e) {} }, 120000);

 V.builtin = builtin;
 V.exportCatalog = () => JSON.stringify({ generated: new Date().toISOString(), items: catalog() }, null, 2);
 note('boot ' + URL);
})();
