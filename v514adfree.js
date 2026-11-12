/* v514adfree.js - V51.4: the FREE DAILY PACK and the FREE STICK PACK need a rewarded ad (iPhone app ONLY).
 * Charlie (Nov 11 2026 9:58-10:00 PM): "No more free one. Gotta watch an ad so remove that. Make the free stick pack
 *   also for an ad." + "For now on the website free yea".
 * WHERE: only where v470ads.js shows ads (native iOS + the AdMob plugin: ADS470.native()). Website / github.io /
 *   no plugin / v470 switched off: nothing changes, both packs stay free exactly as before.
 * HOW: the shop buttons read WATCH AD. Tapping one runs v470's ad flow (consent/ATT/load/show, its screens, the
 *   "Free Pack" rewarded unit). Only v470's native reward event calls grant() here, which marks the pack EARNED
 *   (rl_ads514 = {"d":1 earned daily pack, "s":1 earned stick pack}); the button then reads OPEN FREE and opens
 *   the pack through the normal items17 claim (same once-a-day limit: ST.daily / ST.dailyStick / daily21).
 *   Dismissed early, no fill or a load/show failure: v470's NO REWARD / NO AD RIGHT NOW screen, nothing added.
 *   An earned pack waits (survives closing the app) until it is opened.
 * Ids, rl_* keys, __rl_* flags and save formats are untouched (one new key: rl_ads514). Kill switch: window.__rl_no514af = true.
 */
(function () {
 'use strict';
 const W = window;
 const V = W.V514AF = { log: [], err: [] };
 if (W.__rl_no514af || W.__rl_v124gb) return;
 const KEY = 'rl_ads514';
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + (e && e.message || e)); };
 const A = () => W.ADS470 && W.ADS470.kinds && typeof W.ADS470.native === 'function' ? W.ADS470 : null;
 const on = () => { if (W.__rl_no514af || W.__rl_no470ads) return false; const a = A(); try { return !!(a && a.native()); } catch (e) { return false; } };
 V.on = on;
 // ---------- the earned marks ----------
 function rd() { let o = null; try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { o = null; } return o && typeof o === 'object' ? o : {}; }
 function wr(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
 const earned = w => !!rd()[w];
 function mark(w, v) { const o = rd(); if (v) o[w] = 1; else delete o[w]; wr(o); }
 // ---------- "is today's pack still claimable" - read-only copy of items17 dailyReady()/stickReady() ----------
 function todayKey() { const d = new Date; return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
 function ready(w) {
  try {
   const s = W.V17 && V17.ST ? V17.ST() : null;
   if (!s) return false;
   const td = todayKey();
   if ((w === 'd' ? s.daily : s.dailyStick || '') === td) return false;
   if (!W.__rl_no21 && typeof LS !== 'undefined' && LS.get) {
    const L = LS.get('daily21', null);
    if (L && typeof L === 'object' && L[w] === td) return false;
   }
   return true;
  } catch (e) { fail('ready', e); return false; }
 }
 V.ready = ready; V.earned = earned;
 // ---------- the two rewarded kinds, registered with v470 ----------
 const KIND = { d: 'freedaily514', s: 'freestick514' };
 const ACT = { d: 'daily', s: 'stickfree' };
 let BUY0 = null;
 function openIt(w) {
  try { const a = A(); if (a) a.close(); } catch (e) { }
  try { if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT.v17buy) PANEL_ACT.v17buy(ACT[w]); } catch (e) { fail('open', e); }
  try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) { }
 }
 function register() {
  const a = A();
  if (!a || !a.screens) return false;
  const close = () => a.close();
  a.kinds[KIND.d] = { unit: W.RL470 && RL470.UNIT_PACK, prize: 'FREE DAILY PACK.', got: 'got514d', done: 'done514d',
   can: () => ready('d') && !earned('d'), grant: () => { mark('d', 1); V.log.push('earned daily ' + Date.now()); } };
  a.kinds[KIND.s] = { unit: W.RL470 && RL470.UNIT_PACK, prize: 'FREE STICK PACK.', got: 'got514s', done: 'done514s',
   can: () => ready('s') && !earned('s'), grant: () => { mark('s', 1); V.log.push('earned stick ' + Date.now()); } };
  a.screens.got514d = () => [ '\uD83C\uDF81', 'FREE DAILY PACK!', 'THANKS FOR WATCHING. YOUR 5-CARD DAILY PACK IS READY.', 'OPEN IT', 'OPEN YOUR FREE DAILY PACK', () => openIt('d') ];
  a.screens.got514s = () => [ '\uD83C\uDF81', 'FREE STICK PACK!', 'THANKS FOR WATCHING. YOUR STICK PACK IS READY.', 'OPEN IT', 'OPEN YOUR FREE STICK PACK', () => openIt('s') ];
  a.screens.done514d = () => [ '\uD83C\uDF19', 'DAILY PACK CLAIMED', 'YOUR NEXT FREE DAILY PACK IS READY TOMORROW.', 'OK', 'CLOSE', close ];
  a.screens.done514s = () => [ '\uD83C\uDF19', 'STICK PACK CLAIMED', 'YOUR NEXT FREE STICK PACK IS READY TOMORROW.', 'OK', 'CLOSE', close ];
  return true;
 }
 // ---------- the claim: WATCH AD first in the app ----------
 try {
  if (typeof PANEL_ACT === 'object' && PANEL_ACT && typeof PANEL_ACT.v17buy === 'function') {
   BUY0 = PANEL_ACT.v17buy;
   const wrapped = function (v) {
    const w = v === 'daily' ? 'd' : v === 'stickfree' ? 's' : '';
    if (!w || !on()) return BUY0.apply(this, arguments);
    if (!A().kinds[KIND[w]] && !register()) return BUY0.apply(this, arguments);
    if (!ready(w)) return BUY0.apply(this, arguments);            // already claimed today: items17's own "back tomorrow" toast
    if (earned(w)) {                                              // the ad was watched: open it, then spend the mark
     const r = BUY0.apply(this, arguments);
     if (!ready(w)) mark(w, 0);
     return r;
    }
    try { if (W.SFX && SFX.tap) SFX.tap(); } catch (e) { }
    A().watch(KIND[w]);                                           // nothing is granted here - only on the reward event
   };
   for (const k in BUY0) try { wrapped[k] = BUY0[k]; } catch (e) { }
   PANEL_ACT.v17buy = wrapped;
  }
 } catch (e) { fail('act', e); }
 // ---------- the words in the app: shop buttons + tips ----------
 function shopText(h) {
  if (typeof h !== 'string') return h;
  const d = ready('d'), s = ready('s'), ed = earned('d'), es = earned('s');
  if (d) h = h.replace(/(data-v="daily"[^>]*aria-label=")BUY FREE DAILY PACK(">)FREE TODAY(<\/button>)/, (m, a, b, c) => a + (ed ? 'OPEN FREE DAILY PACK' : 'FREE DAILY PACK: WATCH AD') + b + (ed ? 'OPEN FREE' : 'WATCH AD') + c);
  h = h.replace('FREE ONCE A DAY - 5 CARDS', 'WATCH AN AD - ONCE A DAY - 5 CARDS');
  if (s) {
   h = h.replace('FREE TODAY - SAME AS A STICK PACK', es ? 'AD WATCHED - OPEN IT - SAME AS A STICK PACK' : 'WATCH AN AD - SAME AS A STICK PACK');
   h = h.replace(/(data-v="stickfree"[^>]*aria-label=")CLAIM FREE STICK PACK(">)FREE(<\/button>)/, (m, a, b, c) => a + (es ? 'OPEN FREE STICK PACK' : 'FREE STICK PACK: WATCH AD') + b + (es ? 'OPEN FREE' : 'WATCH AD') + c);
  }
  h = h.replace('ONE FREE EVERY DAY - RESETS AT MIDNIGHT', 'ONE A DAY FOR WATCHING AN AD - RESETS AT MIDNIGHT');
  return h;
 }
 function helpText(h) {
  if (typeof h !== 'string') return h;
  return h.replace('FREE DAILY PACK: 5 CARDS, ONCE A DAY. FREE STICK PACK: ONE A DAY TOO, SAME AS A STICK PACK.',
   'FREE DAILY PACK: 5 CARDS, ONCE A DAY FOR WATCHING A SHORT AD. FREE STICK PACK: ONE A DAY TOO FOR AN AD, SAME AS A STICK PACK.');
 }
 V.shopText = shopText; V.helpText = helpText;
 function wrapRender(name, fn) {
  try {
   if (typeof PANEL_RENDER !== 'object' || !PANEL_RENDER || typeof PANEL_RENDER[name] !== 'function') return;
   const r0 = PANEL_RENDER[name];
   const wrapped = function () {
    const h = r0.apply(this, arguments);
    if (!on()) return h;
    try { return fn(h); } catch (e) { fail(name, e); return h; }
   };
   for (const k in r0) try { wrapped[k] = r0[k]; } catch (e) { }
   PANEL_RENDER[name] = wrapped;
  } catch (e) { fail('wrap ' + name, e); }
 }
 wrapRender('shop17', shopText);
 wrapRender('help17', helpText);
 // ---------- boot: register once v470 is up; the coach's pack answer in the app ----------
 let tries = 0;
 function boot() {
  if (!on()) return;   // web: nothing registered, nothing changed
  if (!register()) { if (++tries < 20) setTimeout(boot, 500); return; }
  V.registered = true;
  try {
   const q = W.V4014C && Array.isArray(V4014C.QA) && V4014C.QA.find(x => x && x.id === 'packs');
   if (q && typeof q.a === 'string' && q.a.indexOf('A FREE PACK EVERY DAY') >= 0) q.a = q.a.replace('A FREE PACK EVERY DAY', 'WATCH ADS FOR FREE PACKS');
  } catch (e) { fail('coach', e); }
  try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) { }
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 150)); else setTimeout(boot, 150);
})();

/* V51.4b: FREE LEGENDARY PACK - watch 3 rewarded ads, once a local day (iPhone app ONLY).
 * Charlie (Nov 11 2026 10:02 PM): "free legendary pack watch 3 ads to get it once a day".
 * WHERE: same as above (v470's native iOS + AdMob detection, ADS470.native()). Website: no tile, nothing changes.
 * HOW: a YARD SALE tile under v470's tile. WATCH 3 ADS - n/3 runs v470's ad flow (consent/ATT/load/show, its screens,
 *   the "Free Pack" rewarded unit). Progress moves ONLY on v470's native reward event (grant() below); a dismissed ad,
 *   no fill or a load/show failure adds nothing. On the 3rd reward one LEGENDARY PACK goes in ST.freePacks.legendary
 *   (the field trophies/promo/v470 already use), the tile reads OPEN FREE, then BACK TOMORROW. Resets at local midnight.
 * STORAGE: one new key, rl_ad514leg = {"d":"YYYY-MM-DD" local day, "p":ads rewarded today 0-3, "g":1 pack granted today,
 *   "o":1 opened from the tile}. rl_ads514 / rl_ads470 untouched. Kill switch: window.__rl_no514af = true (same as above).
 */
(function () {
 'use strict';
 const W = window;
 const V = W.V514LEG = { log: [], err: [], ADS: 3 };
 if (W.__rl_no514af || W.__rl_v124gb) return;
 const KEY = 'rl_ad514leg', KIND = 'freeleg514', PK = 'legendary', N = V.ADS;
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + (e && e.message || e)); };
 const A = () => W.ADS470 && W.ADS470.kinds && typeof W.ADS470.native === 'function' ? W.ADS470 : null;
 const on = () => { if (W.__rl_no514af || W.__rl_no470ads) return false; const a = A(); try { return !!(a && a.native()); } catch (e) { return false; } };
 V.on = on;
 function day() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
 function rd() {
  let o = null;
  try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { o = null; }
  if (!o || typeof o !== 'object' || o.d !== day()) o = { d: day(), p: 0, g: 0, o: 0 };
  o.p = Math.min(N, Math.max(0, o.p | 0)); o.g = o.g ? 1 : 0; o.o = o.o ? 1 : 0;
  return o;
 }
 function wr(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
 V.rd = rd;
 function st() { try { return W.V17 && V17.ST ? V17.ST() : null; } catch (e) { return null; } }
 const fp = () => { const s = st(); return s && s.freePacks ? s.freePacks[PK] | 0 : 0; };
 const can = () => { const o = rd(); return !o.g && o.p < N; };
 const openable = () => { const o = rd(); return o.g && !o.o && fp() > 0; };
 V.can = can; V.openable = openable;
 // ONLY called by v470's onReward (the native rewarded event), once per ad request, after can() said yes
 function grant() {
  const o = rd();
  if (o.g || o.p >= N) return;
  o.p++;
  if (o.p >= N) {
   const s = st();
   if (s) {
    s.freePacks = s.freePacks && typeof s.freePacks === 'object' ? s.freePacks : {};
    s.freePacks[PK] = (s.freePacks[PK] || 0) + 1;
    o.g = 1;
   } else { o.p = N - 1; fail('grant', 'no save'); }
  }
  wr(o);
  V.log.push('reward ' + o.p + '/' + N + (o.g ? ' GRANTED' : '') + ' ' + Date.now());
 }
 function openLeg() {
  const a = A();
  try { if (a) a.close(); } catch (e) { }
  const before = fp();
  try { if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT.v17buy) PANEL_ACT.v17buy(PK); } catch (e) { fail('open', e); }
  if (fp() < before) { const o = rd(); if (o.g) { o.o = 1; wr(o); } }
  try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) { }
 }
 function next() {
  const a = A(); if (!a) return;
  a.close();
  if (!can()) return;
  setTimeout(() => { try { if (!a.busy) a.watch(KIND); } catch (e) { fail('next', e); } }, 60);
 }
 V.open = openLeg;
 function register() {
  const a = A();
  if (!a || !a.screens) return false;
  if (a.kinds[KIND]) return true;
  const close = () => a.close();
  a.kinds[KIND] = { unit: W.RL470 && RL470.UNIT_PACK, got: 'got514L', done: 'done514L', can: can, grant: grant,
   get prize() { return 'FREE LEGENDARY PACK (AD ' + Math.min(N, rd().p + 1) + ' OF ' + N + ').'; } };
  a.screens.got514L = () => {
   const o = rd();
   if (o.g) return [ '\uD83C\uDFC6', 'FREE LEGENDARY PACK!', 'THANKS FOR WATCHING ALL ' + N + '. YOUR LEGENDARY PACK IS READY.', 'OPEN IT', 'OPEN YOUR FREE LEGENDARY PACK', openLeg ];
   const left = N - o.p;
   return [ '\u2B50', 'AD ' + o.p + ' OF ' + N + ' DONE', left + ' MORE AD' + (left === 1 ? '' : 'S') + ' TODAY FOR YOUR FREE LEGENDARY PACK.', 'WATCH NEXT AD', 'WATCH THE NEXT AD', next ];
  };
  a.screens.done514L = () => openable()
   ? [ '\uD83C\uDFC6', 'LEGENDARY PACK READY', 'YOU EARNED TODAY\'S FREE LEGENDARY PACK. OPEN IT IN THE SHOP.', 'OPEN IT', 'OPEN YOUR FREE LEGENDARY PACK', openLeg ]
   : [ '\uD83C\uDF19', 'LEGENDARY PACK CLAIMED', 'YOUR NEXT FREE LEGENDARY PACK IS READY TOMORROW. ' + N + ' MORE ADS.', 'OK', 'CLOSE', close ];
  return true;
 }
 // ---------- the YARD SALE tile (under v470's tile) ----------
 const css = '#ad514leg{border:2px solid #ffcc33;background:linear-gradient(90deg,rgba(255,204,51,.32),rgba(10,16,24,.9) 55%,rgba(255,204,51,.18));box-shadow:0 0 10px rgba(255,204,51,.45);padding:6px 8px;margin:0 0 6px;display:flex;gap:8px;align-items:center}' +
  '#ad514leg .c514{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}#ad514leg b{color:#ffe14d}#ad514leg small{color:#ffe9a8;font-size:9px}' +
  '#ad514leg button{min-width:42%}#ad514leg button.d{opacity:.5}';
 function label() {
  const o = rd();
  if (!o.g) return [ 'WATCH ' + N + ' ADS - ' + o.p + '/' + N, 'FREE LEGENDARY PACK: WATCH ' + N + ' ADS, ' + o.p + ' OF ' + N + ' WATCHED', 'y' ];
  if (openable()) return [ 'OPEN FREE', 'OPEN YOUR FREE LEGENDARY PACK', 'y' ];
  return [ 'BACK TOMORROW', 'FREE LEGENDARY PACK CLAIMED - BACK TOMORROW', 'd' ];
 }
 V.label = () => label()[0];
 function tileHtml() {
  const o = rd(), [t, aria, cl] = label();
  const sub = !o.g ? 'WATCH ' + N + ' SHORT ADS FOR A LEGENDARY PACK - ONCE A DAY' + (o.p ? ' - ' + (N - o.p) + ' TO GO' : '') : openable() ? 'EARNED! OPEN IT NOW' : 'CLAIMED TODAY - RESETS AT MIDNIGHT';
  return '<div class="c514"><b>FREE LEGENDARY PACK</b><small>' + sub + '</small></div>' +
   '<button type="button" class="' + cl + '" id="ad514legbtn" aria-label="' + aria + '">' + t + '</button>';
 }
 let styled = false;
 function decorate() {
  if (!on()) return;
  const pn = document.getElementById('panel');
  if (!pn || pn.dataset.scr !== 'shop17') return;
  const list = pn.querySelector('#shopList');
  if (!list) return;
  if (!register()) return;
  if (!styled) { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); styled = true; }
  let t = list.querySelector('#ad514leg');
  const html = tileHtml();
  if (!t) {
   t = document.createElement('div'); t.id = 'ad514leg';
   t.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    try { if (W.SFX && SFX.tap) SFX.tap(); } catch (er) { }
    if (openable()) return openLeg();
    const a = A(); if (a) a.watch(KIND);   // nothing is granted here - only on the reward event
   });
  }
  const a470 = list.querySelector('#ad470tile');
  const want = a470 ? a470.nextSibling : list.firstChild;
  if (t.parentNode !== list || (want !== t && t.previousSibling !== a470)) list.insertBefore(t, want);
  if (t.__h !== html) { t.innerHTML = html; t.__h = html; }
 }
 V.decorate = decorate;
 let tries = 0;
 function boot() {
  if (!on()) return;   // web: no tile, nothing registered
  if (!register()) { if (++tries < 20) setTimeout(boot, 500); return; }
  V.registered = true;
  const pn = document.getElementById('panel');
  if (!pn) { if (++tries < 40) setTimeout(boot, 600); return; }
  new MutationObserver(() => { try { decorate(); } catch (e) { fail('dec', e); } }).observe(pn, { childList: true, subtree: true, attributes: true, attributeFilter: [ 'data-scr' ] });
  decorate();
  setInterval(() => { try { decorate(); } catch (e) { } }, 20000);   // shop left open past midnight: tile resets without a re-render
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 200)); else setTimeout(boot, 200);
})();
