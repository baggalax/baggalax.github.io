/* v580shop.js - 1.4 YARD SALE v2 (Chucks' approved mockup 06_shop_v2_after / _after_b, Charlie approved).
 * Ask: jump tabs FEATURED / PACKS / ITEMS / DAILY FREE, a rotating featured banner (dots + thumbnails), ribbons
 *   (LIMITED / NEW / HOT / SALE / BEST VALUE), countdown chips (red under 1 day), SALE = Live-Ops price under the normal
 *   price with the old price struck through, gold price if you can afford it, gray + NEED N MORE if not, OWNED and
 *   BUY AGAIN states, free stuff blinking at the top, value chips built from each pack's real contents, and the
 *   Live-Ops layout {big, med, small} from Charlie's panel mapped to banner / PACKS grid / ITEMS grid.
 * Cause: the old shop is one long list of tiles built by PANEL_RENDER.shop17 (+ v489, v502, v565, v568, v578dom ...).
 * Fix: after every shop render this file re-arranges the FINISHED DOM. The original tiles are kept (hidden) inside
 *   #shopList so every add-on that looks them up or updates timers still finds them, and the ORIGINAL BUTTON NODES are
 *   moved into the new layout. So every tap runs exactly the same data-a / data-v action (v17buy, v17b2504, v17pass,
 *   v45pick, v479buy, v17relax27, lo502buy, ...) and charges exactly the price the old button showed (the number is
 *   read from that button; the "was" price comes from v568's stored normal price). Ad tiles (v470 / v514) are moved into
 *   the DAILY FREE column and keep their own listeners. Anything not recognised falls back to a tier rule, never hidden.
 * Live-Ops: reads the raw config v502 already has (force / its rl_liveops502 cache) only to read `layout`; it writes
 *   nothing. Slots i < 4 / 11 / 7 are live; staging slots after that are not shown. Missing layout = tier rules.
 * No ids, rl_* keys, data-a actions or network protocol changed. Every step is wrapped: any error = old (v578) shop.
 * Kill switch: window.__rl_no580shop = true (checked on every render; the next render is the v578dom shop look).
 */
(function () {
 'use strict';
 const Wn = window, D = document;
 const off = () => !!(Wn.__rl_no580shop || Wn.__rl_v124gb);
 const V = Wn.V580 = { err: null, n: 0, last: null };
 const panel = D.getElementById('panel');
 if (!panel || typeof MutationObserver !== 'function') return;
 const fail = (w, e) => { V.err = w + ': ' + String(e && e.stack || e).slice(0, 300); if (!V.warned) { V.warned = 1; console.warn('v580shop', w, e); } };
 const NB = { big: 4, med: 11, small: 7 };

 /* ---------- small helpers ---------- */
 const pxC = {};
 function px(s, cs, col, sh) {
  s = String(s).toUpperCase(); cs = Math.round(cs * 2);
  const k = s + '|' + cs + col + sh;
  if (!pxC[k]) {
   const c = D.createElement('canvas'), o = sh ? cs : 0;
   c.width = Math.max(1, (s.length * 4 - 1) * cs + o); c.height = 5 * cs + o;
   const x = c.getContext('2d');
   const dr = (ox, oy, cl) => { x.fillStyle = cl; for (let i = 0; i < s.length; i++) { const gl = FONT[s[i]] || FONT['?']; if (!gl) continue; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (gl[r] && gl[r][q] === '#') x.fillRect(ox + (i * 4 + q) * cs, oy + r * cs, cs, cs); } };
   if (sh) dr(o, o, sh); dr(0, 0, col);
   pxC[k] = '<img class="s6px" alt="' + s.replace(/"/g, '') + '" src="' + c.toDataURL() + '" style="width:' + c.width / 2 + 'px;height:' + c.height / 2 + 'px">';
  }
  return pxC[k];
 }
 const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
 const txt = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
 const numOf = s => { const m = String(s || '').match(/(\d[\d,]*)/); return m ? +m[1].replace(/,/g, '') : null; };
 const bal = () => { try { return V17.ST().chinos | 0; } catch (e) { return 0; } };
 const L = () => Wn.LIVEOPS || null;
 const coin = '<span class="coin17"></span>';
 function fmtLeft(ms) {
  const m = Math.max(1, Math.floor(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
  return d > 0 ? d + 'D ' + h + 'H' : h > 0 ? h + 'H ' + mm + 'M' : mm + 'M';
 }
 function rawCfg() { // the same config v502 accepted; read-only, only for `layout`
  try {
   const lo = L(); if (!lo) return null;
   if (lo.src === 'force') return Wn.__rlLiveForce || null;
   if (lo.src === 'net' || lo.src === 'cache') return JSON.parse(localStorage.getItem('rl_liveops502') || 'null');
  } catch (e) { fail('raw', e); }
  return null;
 }

 /* ---------- read the finished old shop into entries ---------- */
 const TILE_IDS = { tk565tile: 'pack_turkey565', vets489tile: 'pack_vets489', relax27tile: 'pack_relax', fit45tile: 'pack_fit45', hw16tile: 'pack_halloween', b2504ctile: 'pack_b2504c', b2504ltile: 'pack_b2504l', car479tile: 'car479' };
 const PK_KEY = { pack_turkey565: 'tk565', pack_vets489: 'vets489', pack_b2504c: 'b2504c', pack_b2504l: 'b2504l' };
 const RIB = { pack_legendary: 'BEST VALUE', pack_pc38l: 'HOT', pack_cu38: 'NEW', car479: 'NEW', pack_fit45: 'PICK ONE', pack_relax: 'LEGEND CHIRP' };
 const RIBC = { 'LIMITED': 'red', 'SALE': 'red', 'HOT': 'red', 'NEW': 'green', 'BEST VALUE': 'gold', 'LEGEND CHIRP': 'gold', 'PICK ONE': 'violet' };
 const LIGHT_T = { car479: '#ffffff', pack_vets489: '#ffffff', pack_halloween: '#ffffff', pack_fit45: '#ffffff', pack_relax: '#ffffff' }; // 1.5c (Jonny): dark hero art = light title // dark card art: light title text
 const BORDER = { pack_turkey565: '#ffcc33', pack_vets489: '#ffcc33', pack_fit45: '#ff7ac8', car479: '#3dffc8', pack_relax: '#ffcc33' };
 function packKeyOf(el) { const b = el.querySelector('[data-a="v17buy"],[data-a="v17b2504"]'); return b ? b.dataset.v || null : null; }
 function idOf(el) {
  if (el.id && TILE_IDS[el.id]) return TILE_IDS[el.id];
  const lb = el.querySelector('[data-a="lo502buy"]'); if (lb && lb.dataset.v) return lb.dataset.v;
  if (el.classList.contains('pass')) return 'pack_pass';
  if (el.classList.contains('fs17')) return 'pack_stickfree';
  const k = packKeyOf(el); if (k) return k === 'tk565' ? 'pack_turkey565' : 'pack_' + k;
  return el.id ? 'tile:' + el.id : null;
 }
 function nameOf(id, el) {
  let n = txt(el.querySelector('.hwb16 > b, .tx > b, .ft45, :scope > b')) || id;
  n = n.replace(/\s*(LEAVES IN|LIMITED).*$/, '').replace(/ ONE ONLY$/, '').replace(/ 1 TICKET.*$/, '');
  return n;
 }
 function shortName(n, tier) {
  let s = n.replace(/^SEASON \d+ /, '').replace(/ PACK$/, '').replace(/^THE /, '').replace(/ CARD$/, '').replace(/ UNIFORM$/, ' UNIS').replace(/ PLAYER$/, ' PLAYERS').replace(/ THE /g, ' ');
  if (tier !== 'big' && s.length > 14) s = s.replace('LEGENDARY', 'LEGEND');
  return s;
 }
 function plural(n, w) { return n === 1 ? w : n + ' ' + (/Y$/.test(w) ? w.slice(0, -1) + 'YS' : w + 'S'); }
 // value chips from the pack's REAL contents (V17.PACKS bundle / slots), else from the tile's own text
 function valueOf(id, el, P) {
  try {
   if (P && Array.isArray(P.bundle)) {
    const BY = V17.BY || {}, c = {}, order = [];
    for (const it of P.bundle) {
     const b = BY[it] || {};
     const k = /_teams$/.test(it) ? 'TEAMS' : /^team_/.test(it) ? 'TEAM' : b.pc27 || /^pc\d*\|/.test(it) ? 'CARD' : b.sec === 'uni21' || /^uni21\|/.test(it) ? 'UNIFORM' : /^stick_/.test(it) || b.slot === 'stick' ? 'STICK' : /^celly_/.test(it) || b.sec === 'celly' ? 'CELLY' : /^tape_/.test(it) ? 'TAPE' : b.slot ? 'GEAR' : 'ITEM';
     if (!c[k]) { c[k] = 0; order.push(k); } c[k]++;
    }
    return order.map(k => k === 'TEAMS' ? 'TEAMS' : k === 'TEAM' ? (c[k] > 1 ? c[k] + ' TEAMS' : 'TEAM') : plural(c[k], k));
   }
   if (P && Array.isArray(P.slots) && !P.cat) { // base card packs
    const n = P.slots.length, leg = P.slots.filter(s => !s[0] && !s[1]).length, rare = P.slots.filter(s => !s[0] && s[1]).length;
    const out = [n + ' CARDS'];
    if (leg) out.push(leg + ' LEGEND'); else if (rare) out.push(rare + ' RARE+'); else if (P.slots.every(s => s[0] >= 80)) out.push('MOSTLY COMMON');
    return out;
   }
   if (P && Array.isArray(P.slots) && P.v38) { // player card packs
    const n = P.slots.length, leg = P.slots.filter(s => !s[0] && !s[1]).length, rare = P.slots.filter(s => !s[0] && s[1]).length, sm = txt(el.querySelector('small'));
    const cu = /CUSTOM/.test(P.n || '');
    const out = [n + (cu ? ' CUSTOM' : ' NEW') + (!leg && !rare && !cu ? ' PLAYERS' : '')];
    if (leg) out.push(leg + ' LEGEND'); else if (rare) out.push(rare + ' RARE+');
    const m = sm.match(/(\d\+?) RARES/); if (m && !leg && !rare) out.push(m[1] + ' RARES');
    return out;
   }
   const sm = txt(el.querySelector('small, .fs45'));
   if (id === 'pack_pass') { const a = sm.match(/(\d+) LEVELS/), b = sm.match(/(\d+) LEGEND/); return [a && a[1] + ' LEVELS', b && b[1] + ' LEGENDS'].filter(Boolean); }
   if (id === 'pack_fit45') { const ns = [...el.querySelectorAll('.fn45')].map(txt).map(s => s.replace(/^THE /, '')); return ns.length ? ns : ['PICK ONE']; }
   if (id === 'car479') return ['1 TICKET = 1 CAREER'];
   const icons = el.querySelectorAll('.hwr16 img').length;
   const first = sm.split(/ - |: |\. /)[0].replace(/^THE ONE /, '').replace(/^ONLY /, '');
   const out = []; if (first && first.length <= 22) out.push(first); if (icons) out.push(icons + ' ITEMS');
   return out;
  } catch (e) { fail('val', e); return []; }
 }
 function subOf(el) { // ITEMS sub-line, from the tile's own text
  const s = txt(el.querySelector('small'));
  const p = s.split(' - '); let t = (p.length > 1 && !/^ONLY THE/.test(p[1]) && p[1].length <= 22 ? p[1] : p[0]).replace(/^ONLY /, '');
  return t.length > 22 ? t.slice(0, 21).replace(/[ ,]+\S*$/, '') : t;
 }
 function stateOf(b) {
  const t = txt(b);
  if (/OWNED/.test(t)) return { k: 'owned', t };
  if (/FREE|OPEN FREE/.test(t) && !/AD/.test(t)) return { k: 'free', t };
  if (/AGAIN/.test(t)) return { k: 'again', p: numOf(t), t };
  const p = numOf(t);
  if (p != null && /^(BUY\s*[-–]?\s*)?\d[\d,]*( DIMES)?$/.test(t)) return { k: 'buy', p, t };
  return { k: 'other', p, t };
 }
 function wasOf(id, k, shown) { // the normal price, only when Live-Ops made it cheaper
  try {
   const lo = L(); if (!lo || shown == null) return null;
   const P = k && V17.PACKS && V17.PACKS[k];
   if (P && P.__s568 && P.__c568 > shown) return P.__c568;
   if (lo.price(id) != null) { const c = (lo.catalog() || []).find(r => r.id === id); if (c && +c.price > shown) return +c.price; }
  } catch (e) { fail('was', e); }
  return null;
 }
 function collect(src) {
  const out = [], seen = new Set();
  src.querySelectorAll('.hw16, .ct479, .fit45, .pk17, .spk17').forEach(el => {
   if (el.closest('#ad470tile,#ad514leg')) return;
   const id = idOf(el); if (!id || seen.has(id)) return; seen.add(id);
   const buttons = [...el.querySelectorAll('button')];
   if (!buttons.length) return;
   const k = PK_KEY[id] || (id.indexOf('pack_') === 0 ? id.slice(5) : null) || packKeyOf(el);
   const P = k && V17.PACKS ? V17.PACKS[k] : null;
   const tier = el.matches('.fs17, .pk17.daily') ? 'free' : el.matches('.hw16, .ct479, .fit45') ? 'big' : el.matches('.pk17') || (P && P.v38) ? 'med' : 'small';
   const main = buttons.find(b => /^(v17buy|v479buy|v17relax27|lo502buy|v17pass)$/.test(b.dataset.a)) || buttons.find(b => b.classList.contains('d') || b.classList.contains('y')) || buttons[buttons.length - 1];
   const art = [...el.querySelectorAll(':scope > img, .hwp16, .cc479 img, .fld45 img')].map(i => i.getAttribute('src')).filter(Boolean);
   out.push({ id, k, P, el, tier, name: nameOf(id, el), art, icons: [...el.querySelectorAll('.hwr16 img')].map(i => i.getAttribute('src')).slice(0, 9), buttons, main, value: valueOf(id, el, P), sub: subOf(el) });
  });
  return out;
 }

 /* ---------- slots (Live-Ops layout or tier rules) ---------- */
 function place(entries) {
  const by = {}; entries.forEach(e => { by[e.id] = e; });
  const S = { big: [], med: [], small: [], free: entries.filter(e => e.tier === 'free') }, used = new Set(S.free.map(e => e.id)), slotRow = {};
  const raw = rawCfg(), lay = raw && raw.layout && typeof raw.layout === 'object' ? raw.layout : null;
  V.layout = !!lay;
  if (lay) {
   const staged = new Set();
   for (const t of ['big', 'med', 'small']) {
    const arr = Array.isArray(lay[t]) ? lay[t] : [];
    arr.forEach((r, i) => {
     const id = r && (typeof r === 'string' ? r : r.id); if (!id) return;
     if (i >= NB[t]) { if (!(id === 'pack_fit45' && !Wn.__rl_no600lo)) staged.add(id); return; } // 1.5 B66: the permanent Whale / Crown is never parked in a staging slot
     const e = by[id]; if (!e || used.has(id)) return;
     used.add(id); S[t].push(e); slotRow[id] = typeof r === 'object' ? r : {};
    });
   }
   staged.forEach(id => { if (!used.has(id)) used.add(id); }); // staging: not live
   V.staged = [...staged];
  }
  entries.forEach(e => { if (!used.has(e.id)) { used.add(e.id); S[e.tier].push(e); } }); // never drop a buyable tile
  S.rows = slotRow; S.raw = raw;
  return S;
 }
 function leftOf(e, S) {
  try {
   const lo = L(); let ms = lo && lo.leftMs ? lo.leftMs(e.id) : null;
   if (ms == null) { const r = S.rows[e.id]; if (r && r.end) { const t = Date.parse(r.end); if (!isNaN(t)) ms = t - (lo && lo.now ? lo.now() : Date.now()); } }
   return ms != null && ms > 0 ? ms : null;
  } catch (e2) { return null; }
 }
 function ribbonOf(e, S, sale, ms) {
  const ok = s => RIBC[s] ? s : null;
  const r = S.rows[e.id]; let b = r && typeof r.badge === 'string' ? ok(r.badge.toUpperCase()) : null;
  if (!b && S.raw && Array.isArray(S.raw.shop)) { const x = S.raw.shop.find(q => q && q.id === e.id); if (x && typeof x.badge === 'string') b = ok(x.badge.toUpperCase()); if (!b && x && x.start) { const t = Date.parse(x.start); if (!isNaN(t) && Date.now() - t < 7 * 864e5) b = 'NEW'; } }
  if (b) return b;
  if (sale) return 'SALE';
  if (e.tier === 'big' && ms != null) return 'LIMITED';
  return RIB[e.id] || null;
 }

 /* ---------- render pieces ---------- */
 const clk = '<i class="s6clk"></i>';
 const timer = (ms, mini) => ms == null ? '' : '<span class="s6tm' + (ms < 864e5 ? ' hot' : '') + (mini ? ' mini' : '') + '" data-u580left="1">' + clk + px(fmtLeft(ms), mini ? 1.5 : 2, ms < 864e5 ? '#fff' : '#0b1a20') + '</span>';
 const ribbon = t => t ? '<span class="s6rb s6rb-' + (RIBC[t] || 'violet') + '">' + px(t, 2, RIBC[t] === 'gold' || RIBC[t] === 'green' ? '#0b1a20' : '#fff') + '</span>' : '';
 // restyle a REAL button in place (its data-a / data-v / listeners stay); returns its wrapper node
 function priceWrap(e, b, o) {
  o = o || {};
  const w = D.createElement('div'); w.className = 's6buyw';
  const st = stateOf(b), have = bal();
  b.classList.remove('u578price', 'y', 'd', 'g');
  b.classList.add('s6buy');
  if (st.k === 'owned') { b.classList.add('own'); b.innerHTML = px('OWNED', 2, '#0b1a20'); w.appendChild(b); return w; }
  if (st.k === 'free') { b.classList.add('free'); b.innerHTML = px(/OPEN/.test(st.t) ? 'OPEN' : 'FREE', 3, '#0b1a20'); w.appendChild(b); return w; }
  if (st.k === 'other' && (st.p == null || o.keepText)) { b.classList.add('alt'); b.innerHTML = esc(st.t); w.appendChild(b); return w; }
  const p = st.p, okk = have >= p, was = wasOf(e.id, e.k, p);
  if (was) { const s = D.createElement('s'); s.className = 's6was'; s.innerHTML = coin + was; w.appendChild(s); }
  b.classList.add(okk ? 'ok' : 'no'); if (o.big) b.classList.add('big');
  const lab = st.k === 'again' ? 'AGAIN' : o.label || (st.k === 'other' ? st.t.replace(/[\d,–-]+\s*$/, '').trim() : '');
  b.innerHTML = (lab ? '<small>' + esc(lab) + '</small>' : '') + coin + '<b>' + p + '</b>';
  w.appendChild(b);
  if (!okk) { const n = D.createElement('small'); n.className = 's6need'; n.textContent = 'NEED ' + (p - have) + ' MORE'; w.appendChild(n); }
  return w;
 }
 function el(html) { const t = D.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
 function heroSlide(e, S, i) {
  const ms = leftOf(e, S), st = stateOf(e.main), sale = !!wasOf(e.id, e.k, st.p), rb = ribbonOf(e, S, sale, ms);
  const s = el('<div class="s6hero" data-i="' + i + '" style="--bd:' + (BORDER[e.id] || '#ffcc33') + '"></div>');
  const bgEl = e.el; try { const cs = getComputedStyle(bgEl); s.style.backgroundImage = cs.backgroundImage; s.style.backgroundColor = cs.backgroundColor; } catch (x) {}
  const arts = e.art.length ? e.art : [];
  s.innerHTML = '<div class="s6shine"></div>' + ribbon(rb) + '<div class="s6tmw">' + timer(ms) + '</div>' +
   '<div class="s6hl"><div class="s6frame">' + arts.slice(0, e.id === 'pack_fit45' ? 2 : 1).map(a => '<img class="' + (e.id === 'pack_fit45' ? 's6ha2' : 's6ha') + '" alt="" src="' + esc(a) + '">').join('') + '</div></div>' +
   '<div class="s6hm"><div class="s6ht">' + px(shortName(e.name, 'big'), shortName(e.name, 'big').length > 16 ? 2.5 : 3.5, LIGHT_T[e.id] || (e.el && e.el.dataset && e.el.dataset.lt600) || '#2a1606') + '</div>' +
   '<div class="s6val">' + e.value.map((v, j) => (j ? '<em>' + (e.id === 'pack_fit45' ? 'OR' : '+') + '</em>' : '') + '<span>' + px(v, 2, '#0b1a20') + '</span>').join('') + '</div>' +
   (e.icons.length ? '<div class="s6icons">' + e.icons.map(a => '<span><img alt="" src="' + esc(a) + '"></span>').join('') + '</div>' : '') + '</div><div class="s6hr"></div>';
  const hr = s.querySelector('.s6hr');
  const buys = e.buttons.filter(b => b !== e.main && /^(v17buy|v45pick|v479buy|v17relax27|lo502buy)$/.test(b.dataset.a));
  hr.appendChild(priceWrap(e, e.main, { big: 1, label: stateOf(e.main).k === 'buy' ? 'BUY' : null }));
  buys.forEach(b => hr.appendChild(priceWrap(e, b, { label: txt(b).replace(/[\d,–-]+\s*$/, '').replace(/^PICK /, '').trim() })));
  e.buttons.filter(b => b !== e.main && buys.indexOf(b) < 0).forEach(b => { b.classList.remove('g', 'd', 'y', 'u578sec'); b.classList.add('s6ghost'); const t = txt(b); const wv = /^PREVIEW$/.test(t) && /whale|crown/i.test(String(b.dataset.v || '')) && !Wn.__rl_no598ban ? 'PREVIEW ' + String(b.dataset.v).match(/whale|crown/i)[0].toUpperCase() : null; b.innerHTML = px(wv || (/SEE WHAT/.test(t) ? 'SEE INSIDE' : t), 2, '#fff'); hr.appendChild(b); });
  return s;
 }
 function thumb(e, S, i) {
  const ms = leftOf(e, S), st = stateOf(e.main), was = wasOf(e.id, e.k, st.p);
  const price = st.k === 'owned' ? px('OWNED', 1.5, '#3dffc8') : st.p != null ? st.p + (was ? ' <s>' + was + '</s>' : '') : '';
  const rb = ribbonOf(e, S, !!was, ms);
  return '<button type="button" class="s6th' + (i ? '' : ' on') + '" data-u580th="' + i + '" style="--bd:' + (BORDER[e.id] || '#ffcc33') + '"><span class="s6tha">' + (e.art[0] ? '<img alt="" src="' + esc(e.art[0]) + '">' : '') + '</span><span class="s6tht">' + px(shortName(e.name, 'big').slice(0, 18), 1.5, '#fff') + '<span class="s6thm">' + (ms != null ? timer(ms, 1) : rb === 'NEW' ? '<span class="s6new">' + px('NEW', 1.5, '#0b1a20') + '</span>' : '') + '<span class="s6thp">' + price + '</span></span></span></button>';
 }
 function packCard(e, S, small) {
  const ms = leftOf(e, S), st = stateOf(e.main), was = wasOf(e.id, e.k, st.p), rb = small ? (was ? 'SALE' : null) : ribbonOf(e, S, !!was, ms);
  const best = rb === 'BEST VALUE', nm = shortName(e.name, 'med');
  const c = el('<div class="' + (small ? 's6i' : 's6pk' + (best ? ' best' : '') + (st.k === 'owned' ? ' owned' : '')) + ' r-' + esc(e.k || '') + '"></div>');
  const art = e.art[0] ? '<img alt="" src="' + esc(e.art[0]) + '">' : e.id === 'pack_pass' ? '<div class="s6pass">' + px('GAME', 2, '#0b1a20') + px('PASS', 2, '#0b1a20') + '</div>' : '';
  if (small) c.innerHTML = ribbon(rb) + art + '<div class="s6ix">' + px(nm, 2, '#fff') + '<small>' + esc(e.sub) + '</small>' + (ms != null ? timer(ms, 1) : '') + '</div>';
  else c.innerHTML = ribbon(rb) + '<div class="s6pa">' + art + '</div><div class="s6pb">' + px(nm, 2, best ? '#ffd84d' : '#fff') + '<div class="s6pv">' + e.value.map(v => '<span>' + esc(v) + '</span>').join('') + '</div>' + (ms != null ? timer(ms, 1) : '') + '</div>';
  const host = small ? c : c.querySelector('.s6pb');
  host.appendChild(priceWrap(e, e.main, {}));
  e.buttons.filter(b => b !== e.main).forEach(b => { b.classList.add('s6ghost', 'sm'); host.appendChild(b); });
  return c;
 }
 function freeRow(e) {
  const r = el('<div class="s6free"><img alt="" src="' + esc(e.art[0] || '') + '"><div class="s6fx">' + px(e.id === 'pack_stickfree' ? 'STICK PACK' : 'DAILY PACK', 1.5, '#fff') + '<small>' + esc(e.id === 'pack_stickfree' ? '5 STICKS' : (e.P && e.P.slots ? e.P.slots.length : 5) + ' CARDS') + '</small></div></div>');
  r.appendChild(priceWrap(e, e.main, { keepText: 1 }));
  e.buttons.filter(b => b !== e.main).forEach(b => { b.classList.add('s6ghost', 'sm'); r.appendChild(b); });
  return r;
 }
 function untilMidnight() { const d = new Date(), m = new Date(d); m.setHours(24, 0, 0, 0); return m - d; }
 function sameCards(list) { const n = list.map(e => e.P && Array.isArray(e.P.slots) ? e.P.slots.length : -1); return n.length && n.every(x => x === n[0] && x > 0) ? n[0] : 0; }

 /* ---------- build ---------- */
 let rot = null, lastTop = 0, lastWasShop = false, pauseUntil = 0;
 function build(list) {
  const src = D.createElement('div'); src.className = 'u580src'; src.hidden = true;
  while (list.firstChild) src.appendChild(list.firstChild);
  list.appendChild(src);
  const entries = collect(src);
  if (!entries.length) throw new Error('no tiles');
  const S = place(entries);
  V.last = { big: S.big.map(e => e.id), med: S.med.map(e => e.id), small: S.small.map(e => e.id), free: S.free.map(e => e.id), layout: V.layout };
  const root = D.createElement('div'); root.className = 'u580root';
  root.innerHTML = '<div class="s6nav">' + [['FEATURED', 'top'], ['PACKS', 'packs'], ['ITEMS', 'items'], ['DAILY FREE', 'free']].map(([t, k], i) => '<button type="button" data-u580go="' + k + '" class="' + (i ? '' : 'on') + '">' + px(t, 2, i ? '#9fb3bd' : '#0b1a20') + '</button>').join('') + '<span class="s6hint">' + px('TAP A PACK TO OPEN', 1.5, '#6f8791') + '</span></div>' +
   '<div class="s6top" data-u580sec="top"><div class="s6hcol"></div><div class="s6fcol" data-u580sec="free"><div class="s6fh">' + px('DAILY FREE', 2, '#7dff7a') + '<span class="s6tm mini" data-u580mid="1">' + clk + px('RESETS ' + fmtLeft(untilMidnight()), 1.5, '#0b1a20') + '</span></div><div class="s6fl"></div><div class="s6win">' + coin + px('+10 EVERY WIN', 1.5, '#7dff7a') + '</div></div></div>';
  const hcol = root.querySelector('.s6hcol');
  if (S.big.length) {
   const stage = D.createElement('div'); stage.className = 's6stage';
   const all598 = !Wn.__rl_no598ban; // 1.5f (Charlie): EVERY big banner shows in full, stacked - nothing to tap to see it (kill: __rl_no598ban)
   if (all598) stage.classList.add('s6all');
   S.big.forEach((e, i) => { const s = heroSlide(e, S, i); if (i && !all598) s.hidden = true; stage.appendChild(s); });
   if (S.big.length > 1 && !all598) stage.insertAdjacentHTML('beforeend', '<div class="s6dots">' + S.big.map((e, i) => '<i class="' + (i ? '' : 'on') + '"></i>').join('') + '</div>');
   hcol.appendChild(stage);
   if (S.big.length > 1 && !all598) hcol.insertAdjacentHTML('beforeend', '<div class="s6thumbs">' + S.big.map((e, i) => thumb(e, S, i)).join('') + '</div>');
  }
  const fl = root.querySelector('.s6fl');
  S.free.slice().sort((a, b) => (a.id === 'pack_daily' ? 0 : 1) - (b.id === 'pack_daily' ? 0 : 1)).forEach(e => fl.appendChild(freeRow(e)));
  if (S.med.length) {
   const n = sameCards(S.med);
   root.insertAdjacentHTML('beforeend', '<div class="s6sh" data-u580sec="packs">' + px('PACKS', 3, '#ffcc33', '#000') + (n ? '<span class="s6shs">' + n + ' CARDS EACH</span>' : '') + '<span class="s6line"></span></div><div class="s6grid"></div>');
   const gr = root.lastChild; S.med.forEach(e => gr.appendChild(packCard(e, S, false)));
  }
  if (S.small.length) {
   const n = sameCards(S.small);
   root.insertAdjacentHTML('beforeend', '<div class="s6sh" data-u580sec="items">' + px('ITEMS', 3, '#3dffc8', '#000') + '<span class="s6shs">ONLY THAT KIND' + (n ? ' - ' + n + ' CARDS' : '') + '</span><span class="s6line t"></span></div><div class="s6it"></div>');
   const gr = root.lastChild; S.small.forEach(e => gr.appendChild(packCard(e, S, true)));
  }
  root.insertAdjacentHTML('beforeend', '<div style="height:10px"></div>');
  list.insertBefore(root, src);
  adopt(list);
  // nav + thumbs (pure UI; no data-a, so the panel's action handler ignores these taps)
  root.addEventListener('click', ev => {
   const go = ev.target.closest('[data-u580go]'), th = ev.target.closest('[data-u580th]');
   if (go) { ev.preventDefault(); jump(scroller(list), root, go.dataset.u580go); }
   else if (th) { ev.preventDefault(); pauseUntil = Date.now() + 12000; show(root, +th.dataset.u580th); }
  });
  const sc = scroller(list);
  if (!sc.__u580) { sc.__u580 = 1; sc.addEventListener('scroll', () => { try { const r = sc.querySelector('.u580root'); if (r) { lastTop = sc.scrollTop; navSync(sc, r); } } catch (e) {} }, { passive: true }); }
  if (lastWasShop && lastTop && Math.abs(sc.scrollTop - lastTop) > 2) sc.scrollTop = lastTop;
  startTimers(list, root, S);
  V.n++;
 }
 function adopt(list) { // ad tiles (v470 / v514) and anything else added straight into #shopList
  const root = list.querySelector(':scope > .u580root'); if (!root) return;
  [...list.children].forEach(c => {
   if (c === root || c.classList.contains('u580src')) return;
   if (/^ad\d+/.test(c.id || '')) { c.classList.add('s6adt'); root.querySelector('.s6fl').appendChild(c); }
   else root.appendChild(c);
  });
 }
 function show(root, i) {
  if (root.querySelector('.s6all')) return; // 1.5f: all banners always shown (no rotation)
  const sl = root.querySelectorAll('.s6hero'); if (!sl.length) return;
  i = ((i % sl.length) + sl.length) % sl.length;
  sl.forEach((s, j) => { s.hidden = j !== i; });
  root.querySelectorAll('.s6dots i').forEach((d, j) => d.classList.toggle('on', j === i));
  root.querySelectorAll('.s6th').forEach((d, j) => d.classList.toggle('on', j === i));
  root.dataset.u580i = i;
 }
 function scroller(list) { // the old shop scrolls #panel (or #shopList when it is the one that overflows)
  const cs = getComputedStyle(list);
  return (/(auto|scroll)/.test(cs.overflowY) && list.scrollHeight > list.clientHeight + 2) ? list : panel;
 }
 function jump(list, root, k) {
  const t = root.querySelector('[data-u580sec="' + k + '"]');
  const nav = root.querySelector('.s6nav');
  const y = k === 'top' || !t ? 0 : t.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop - (nav ? nav.offsetHeight + 4 : 0);
  try { list.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (e) { list.scrollTop = Math.max(0, y); }
  setNav(root, k);
 }
 function setNav(root, k) { root.querySelectorAll('.s6nav [data-u580go]').forEach(b => { const on = b.dataset.u580go === k; if (b.classList.contains('on') !== on) { b.classList.toggle('on', on); b.innerHTML = px(b.textContent || b.querySelector('img').alt, 2, on ? '#0b1a20' : '#9fb3bd'); } }); }
 function navSync(list, root) {
  const lt = list.getBoundingClientRect().top + 60;
  let k = 'top';
  for (const s of ['packs', 'items']) { const t = root.querySelector('[data-u580sec="' + s + '"]'); if (t && t.getBoundingClientRect().top <= lt) k = s; }
  const cur = root.querySelector('.s6nav .on'); if (!cur || (cur.dataset.u580go !== k && !(cur.dataset.u580go === 'free' && k === 'top'))) setNav(root, k);
 }
 function startTimers(list, root, S) {
  if (rot) clearInterval(rot);
  let tick = 0;
  rot = setInterval(() => {
   try {
    if (!root.isConnected || off()) { clearInterval(rot); rot = null; return; }
    tick++;
    if (tick % 5 === 0 && Date.now() > pauseUntil && S.big.length > 1 && !root.matches(':hover')) show(root, (+root.dataset.u580i || 0) + 1);
    if (tick % 20 === 0) { // countdowns
     const m = root.querySelector('[data-u580mid]'); if (m) m.innerHTML = clk + px('RESETS ' + fmtLeft(untilMidnight()), 1.5, '#0b1a20');
    }
   } catch (e) { fail('tick', e); }
  }, 1000);
 }

 /* ---------- styles (Chucks' mockup CSS) ---------- */
 const CSS = `.s6stage.s6all{display:flex;flex-direction:column;gap:8px}.s6stage.s6all .s6hero[hidden]{display:flex}#panel .s6stage.s6all .s6hero{height:auto;min-height:150px;padding-top:8px;padding-bottom:8px}#panel .s6stage.s6all .s6hr{max-height:none;padding-bottom:4px}

 #panel .u580src{display:none!important}
 #panel .s6px{image-rendering:pixelated;display:block}
 #loShop.u580on .hd .st{display:none}
 #panel .s6nav{position:sticky;top:0;z-index:20;display:flex;gap:6px;align-items:center;padding:4px 0 6px;background:linear-gradient(#0a1218 80%,rgba(10,18,24,0))}
 #panel .s6nav button{padding:6px 10px!important;background:#14232b!important;border:2px solid #0b1a20;box-shadow:0 2px 0 #000;min-height:0;min-width:0;width:auto}
 #panel .s6nav button.on{background:#ffcc33!important;box-shadow:0 2px 0 #7a5a00,inset 0 2px 0 rgba(255,255,255,.5)}
 #panel .s6hint{margin-left:auto;display:flex;gap:4px;align-items:center;opacity:.9}
 #panel .s6top{display:flex;gap:8px;align-items:stretch}
 #panel .s6hcol{flex:1;min-width:0}
 #panel .s6stage{position:relative}
 #panel .s6hero{position:relative;height:150px;display:flex;align-items:center;gap:12px;padding:0 14px 0 16px;border:3px solid var(--bd);border-radius:4px;overflow:hidden;box-shadow:0 0 0 2px #0b1a20,0 0 18px rgba(255,204,51,.45),0 4px 0 #000}
 #panel .s6hero[hidden]{display:none}
 #panel .s6shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.35) 38%,transparent 46%);pointer-events:none}
 #panel .s6hl{flex:0 0 auto}
 #panel .s6frame{margin-top:10px;width:96px;height:112px;display:flex;align-items:center;justify-content:center;gap:2px;background:#2a1606;border:3px solid #0b1a20;box-shadow:inset 0 0 0 2px #ffcc33,0 3px 0 #000}
 #panel .s6ha{width:84px;height:100px;object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 0 6px #fff3a0)}
 #panel .s6ha2{width:44px;object-fit:contain;image-rendering:pixelated}
 #panel .s6hm{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;padding-top:14px}
 #panel .s6val{display:flex;align-items:center;gap:3px;flex-wrap:wrap}
 #panel .s6val span{background:#fff4c8;border:2px solid #0b1a20;padding:3px 5px;box-shadow:0 2px 0 rgba(0,0,0,.5)}
 #panel .s6val em{font-style:normal;color:#5a2e00;font-weight:bold;font-size:11px}
 #panel .s6icons{display:flex;gap:3px;flex-wrap:wrap;max-height:26px;overflow:hidden}#panel .s6icons span{width:24px;height:24px;background:rgba(42,22,6,.75);border:1px solid #0b1a20;display:flex;align-items:center;justify-content:center}#panel .s6icons img{max-width:20px;max-height:20px;image-rendering:pixelated}
 #panel .s6hr{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:14px;max-height:136px;overflow:visible}
 #panel button.s6ghost{background:rgba(11,26,32,.8)!important;border:2px solid #fff;padding:6px 10px!important;min-height:0;min-width:0;width:auto;box-shadow:0 2px 0 #000;color:#fff}
 #panel button.s6ghost.sm{padding:3px 6px!important;font-size:9px;border-width:1px}
 #panel .s6dots{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);display:flex;gap:4px;z-index:5}#panel .s6dots i{width:6px;height:6px;background:rgba(11,26,32,.5)}#panel .s6dots i.on{width:16px;background:#0b1a20}
 #panel .s6rb{position:absolute;top:0;left:0;z-index:4;padding:4px 12px 4px 8px;clip-path:polygon(0 0,100% 0,calc(100% - 7px) 50%,100% 100%,0 100%);box-shadow:0 2px 0 #000}
 #panel .s6rb-red{background:#e8443a}#panel .s6rb-gold{background:#ffcc33}#panel .s6rb-green{background:#7dff7a}#panel .s6rb-violet{background:#9b6bff}
 #panel .s6tmw{position:absolute;top:6px;right:8px;z-index:4}
 #panel .s6tm{display:inline-flex;align-items:center;gap:4px;padding:3px 6px;background:#fff4c8;border:2px solid #0b1a20;box-shadow:0 2px 0 #000;align-self:flex-start}
 #panel .s6tm.hot{background:#e8443a;animation:s6p 1s steps(2) infinite}
 #panel .s6tm.mini{padding:1px 4px;border-width:1px;gap:3px;box-shadow:none}
 #panel .s6clk{width:8px;height:8px;display:inline-block;border:2px solid #0b1a20;border-radius:50%;box-sizing:border-box}
 #panel .s6tm.hot .s6clk{border-color:#fff}
 #panel .s6tm.mini .s6clk{width:6px;height:6px;border-width:1px}
 @keyframes s6p{50%{filter:brightness(1.25)}}
 #panel .s6buyw{display:flex;flex-direction:column;align-items:center;gap:2px}
 #panel button.s6buy{display:inline-flex;align-items:center;gap:4px;justify-content:center;border:2px solid #0b1a20;padding:5px 10px!important;min-height:0;min-width:64px;width:auto;font-size:15px!important;line-height:1;opacity:1}
 #panel button.s6buy b{font-size:15px}#panel button.s6buy small{font-size:10px;margin-right:2px;color:inherit;opacity:1}
 #panel button.s6buy.ok{background:#ffcc33!important;color:#0b1a20!important;box-shadow:0 3px 0 #7a5a00,0 4px 0 #000,inset 0 2px 0 rgba(255,255,255,.55)}
 #panel button.s6buy.no{background:#55606a!important;color:#c4ccd2!important;box-shadow:0 3px 0 #2a3138,0 4px 0 #000}#panel button.s6buy.no .coin17{filter:grayscale(1) brightness(.8)}
 #panel button.s6buy.big{padding:9px 18px!important;font-size:22px!important;min-width:128px}#panel button.s6buy.big b{font-size:24px}
 #panel .s6free button.s6buy.free{padding:6px 8px!important}
 #panel button.s6buy.free{background:#7dff7a!important;box-shadow:0 3px 0 #1f7a1d,0 4px 0 #000,inset 0 2px 0 rgba(255,255,255,.6);padding:7px 12px!important;animation:s6p 1.2s steps(2) infinite}
 #panel button.s6buy.own{background:#3dffc8!important;box-shadow:0 3px 0 #0e6b52;padding:5px 10px!important}
 #panel button.s6buy.alt{background:#2a3a44!important;color:#cfe!important;font-size:9px!important;min-width:0;white-space:normal;max-width:120px}
 #panel .s6need{font-size:8px;color:#ff9a8a;letter-spacing:.3px;white-space:nowrap}
 #panel .s6was{font-size:11px;color:#ff9a8a;display:flex;align-items:center;gap:2px}
 #panel .s6thumbs{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin-top:7px}
 #panel button.s6th{display:flex;align-items:center;gap:5px;padding:5px 6px!important;min-height:0;min-width:0;width:100%;background:#101b22!important;border:2px solid #24343d;text-align:left;box-shadow:0 2px 0 #000;opacity:.85}
 #panel button.s6th.on{border-color:var(--bd);background:#2a2208!important;opacity:1;box-shadow:0 0 8px rgba(255,204,51,.5),0 3px 0 #000}
 #panel .s6tha{width:26px;height:26px;display:flex;align-items:center;justify-content:center;flex:0 0 26px}#panel .s6tha img{max-width:26px;max-height:26px;image-rendering:pixelated}
 #panel .s6tht{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;overflow:hidden}
 #panel .s6thm{display:flex;gap:4px;align-items:center}
 #panel .s6thp{margin-left:auto;font-size:11px;color:#ffd84d;display:flex;align-items:center;gap:2px;white-space:nowrap}#panel .s6thp s{color:#ff9a8a}
 #panel .s6new{background:#7dff7a;padding:1px 3px}
 #panel .s6fcol{flex:0 0 196px;display:flex;flex-direction:column;gap:6px;padding:7px;background:linear-gradient(#0f2a14,#0c1a12);border:2px solid #2f8f2c;border-radius:4px;box-shadow:0 0 10px rgba(125,255,122,.2),0 3px 0 #000}
 #panel .s6fh{display:flex;align-items:center;justify-content:space-between;gap:4px}
 #panel .s6fl{display:flex;flex-direction:column;gap:6px}
 #panel .s6free{display:flex;align-items:center;gap:6px;padding:5px;background:rgba(0,0,0,.35);border:1px solid #2f8f2c;flex-wrap:wrap}
 #panel .s6free img{width:30px;height:44px;object-fit:contain;image-rendering:pixelated}
 #panel .s6fx{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0}#panel .s6fx small,#panel .s6ix small{font-size:8px;color:#9fd8a0}
 #panel .s6adt{font-size:9px}#panel .s6adt button{padding:4px 6px!important;min-height:0}
 #panel .s6win{margin-top:auto;display:flex;align-items:center;gap:4px;justify-content:center;padding:4px;background:rgba(125,255,122,.1);border:1px dashed #2f8f2c}#panel .s6win .coin17{transform:scale(.7)}
 #panel .s6sh{display:flex;align-items:center;gap:8px;margin:14px 0 7px}
 #panel .s6shs{font-size:9px;color:#7f97a2;letter-spacing:.5px;white-space:nowrap}
 #panel .s6line{flex:1;height:2px;background:repeating-linear-gradient(90deg,#ffcc33 0 4px,transparent 4px 8px);opacity:.5}#panel .s6line.t{background:repeating-linear-gradient(90deg,#3dffc8 0 4px,transparent 4px 8px)}
 #panel .s6grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(186px,1fr));gap:7px}
 #panel .s6pk{position:relative;display:flex;gap:8px;align-items:center;padding:14px 8px 8px 6px;background:#101b22;border:2px solid #24343d;border-radius:3px;box-shadow:0 3px 0 #000}
 #panel .s6pk.r-rare,#panel .s6pk.r-pc38r{border-color:#2c5fae}#panel .s6pk.r-cu38{border-color:#7b45c7}
 #panel .s6pk.best{background:linear-gradient(#3a2c06,#1b1606);border-color:#ffcc33;box-shadow:0 0 14px rgba(255,204,51,.55),0 3px 0 #000;z-index:2}
 #panel .s6pk.owned{opacity:.8}
 #panel .s6pa{flex:0 0 52px;height:72px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(255,255,255,.12),transparent 70%)}
 #panel .s6pa img{max-width:50px;max-height:72px;image-rendering:pixelated}
 #panel .s6pass{width:46px;height:62px;background:linear-gradient(#ffd84d,#d99a00);border:2px solid #0b1a20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
 #panel .s6pb{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;align-items:flex-start}
 #panel .s6pv{display:flex;gap:3px;flex-wrap:wrap}#panel .s6pv span{font-size:8px;padding:1px 4px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#dfe}
 #panel .s6pk.best .s6pv span{border-color:rgba(255,204,51,.7);color:#ffe9a8}
 #panel .s6pk .s6rb,#panel .s6i .s6rb{top:-2px;left:-2px}
 #panel .s6pk .s6buyw{align-items:flex-start}
 #panel .s6it{display:grid;grid-template-columns:repeat(auto-fill,minmax(186px,1fr));gap:6px}
 #panel .s6i{position:relative;display:flex;align-items:center;gap:6px;padding:4px 6px 4px 4px;background:#0e171d;border:2px solid #1f2d35;box-shadow:0 2px 0 #000}
 #panel .s6i > img{width:26px;height:38px;object-fit:contain;image-rendering:pixelated}
 #panel .s6ix{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}#panel .s6ix small{color:#8fa6b0}
 #panel .s6i button.s6buy{min-width:48px;padding:4px 7px!important;font-size:13px!important}#panel .s6i button.s6buy b{font-size:13px}
 @media (max-width:720px){
  #panel .s6fcol{flex-basis:160px}
  #panel .s6hero{gap:8px;padding:0 8px 0 10px}
  #panel .s6frame{width:72px;height:96px}#panel .s6ha{width:64px;height:84px}
  #panel button.s6buy.big{padding:7px 10px!important;min-width:96px;font-size:18px!important}#panel button.s6buy.big b{font-size:19px}
  #panel .s6hint{display:none}
  #panel .s6icons span:nth-child(n+7){display:none}
  #panel .s6thumbs{grid-template-columns:repeat(auto-fit,minmax(96px,1fr))}#panel .s6tha{display:none}
 }
 `;
 let cssEl = null;
 function css(on) { if (on && !cssEl) { cssEl = D.createElement('style'); cssEl.id = 'u580css'; cssEl.textContent = CSS; D.head.appendChild(cssEl); } if (cssEl) cssEl.disabled = !on; }

 /* ---------- run on every shop render ---------- */
 let busy = false, queued = false, skipOnce = false;
 function run() {
  queued = false;
  const isShop = panel.dataset.scr === 'shop17';
  if (!isShop) { lastWasShop = false; skipOnce = false; return; }
  if (off()) { css(false); return; }
  if (skipOnce) { if (!V.skipKey || V.skipKey !== panel.firstChild) { V.skipKey = panel.firstChild; } return; }
  const shop = D.getElementById('loShop'), list = shop && shop.querySelector('#shopList');
  if (!list) return;
  busy = true;
  try {
   css(true);
   if (!list.querySelector(':scope > .u580root')) {
    try {
     build(list);
     shop.classList.add('u580on');
     const tt = shop.querySelector('.hd .tt'); if (tt && !tt.dataset.u580) { tt.dataset.u580 = 1; tt.innerHTML = px('YARD SALE', 3, '#7dff7a', '#0b3a10'); }
    } catch (e) { // fail-safe: re-render the old (v578) shop once, untouched
     fail('build', e);
     skipOnce = true; css(false);
     try { panelDirty(); } catch (x) {}
    }
   } else adopt(list);
   lastWasShop = true;
  } finally { busy = false; }
 }
 new MutationObserver(() => { if (busy || queued) return; queued = true; Promise.resolve().then(() => { try { run(); } catch (e) { fail('run', e); } }); })
  .observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-scr'] });
 try { run(); } catch (e) { fail('run0', e); }
})();
