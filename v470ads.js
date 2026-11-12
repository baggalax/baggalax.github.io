/* v470ads.js - V47.0: REWARDED ADS (Bagga Lax 1.0.2 / next iOS update, iPhone app ONLY).
 * Charlie (Nov 9 4:38 PM): "Go" on the 1.0.2 ad plan - two rewarded spots in the YARD SALE.
 *  - FREE PACK: WATCH AD   -> one BASIC PACK (the standard pack), at most PACKS_PER_DAY a local day.
 *  - DAILY DIMES: WATCH AD -> DAILY_DIMES dimes, once a local day.
 * GRANT RULE: the reward is added ONLY in onReward(), which runs ONLY on the plugin's native rewarded event
 *   ('onRewardedVideoAdReward' = Google's userDidEarnRewardHandler). Closing the ad, a load/show failure or the
 *   showRewardVideoAd promise itself never adds anything. One grant per ad shown (a request token guards it).
 * WHERE: only inside the native iOS app with the @capacitor-community/admob plugin compiled in:
 *   Capacitor.isNativePlatform() && getPlatform()==='ios' && the 'AdMob' plugin is available.
 *   NOT window.__rl_ios (index.html sets it by hand, the website carries the same line). Web / github.io: nothing changes.
 * PRIVACY: on the FIRST ad tap only (never at launch): Google UMP consent (GDPR form where required) ->
 *   Apple ATT prompt if not asked yet -> AdMob initialize -> load -> show.
 * TEST ADS: window.__rl_adtest = true (or localStorage rl_adtest470 = '1') uses Google's public TEST rewarded unit.
 *   Default (TestFlight and App Store builds) = the real unit ids below.
 * STORAGE: one new key, rl_ads470 = {"d":"YYYY-MM-DD" (local day), "p":packs watched today, "m":1 when today's dimes are claimed}.
 *   The pack is added as a free BASIC pack (ST.freePacks.basic, the same field trophies/promo already use), so it waits in the
 *   shop as OPEN FREE if the player closes the reward screen. Dimes go to V17.ST().chinos (+ stats.earned).
 * Ids, existing rl_* keys, __rl_* flags and the net protocol are untouched. Kill switch: window.__rl_no470ads = true.
 */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no470ads || W.__rl_v124gb) return;
 // ---------- the numbers Charlie may want to change (all in one place) ----------
 const CFG = W.RL470 = {
  DAILY_DIMES: 25,          // DAILY DIMES reward
  PACKS_PER_DAY: 3,         // FREE PACK ads per local day
  PACKS_PER_AD: 1,          // basic packs per FREE PACK ad (Charlie Nov 11 9:58 PM)
  PACK_KIND: 'basic',       // the standard pack (items17 PACKS.basic, "BASIC PACK")
  APP_ID: 'ca-app-pub-2404264066146536~1162742034',   // goes in Info.plist GADApplicationIdentifier (not used by JS)
  UNIT_PACK: 'ca-app-pub-2404264066146536/5539749557',  // rewarded "Free Pack"
  UNIT_DIMES: 'ca-app-pub-2404264066146536/6296804165', // rewarded "Daily Dimes"
  UNIT_TEST: 'ca-app-pub-3940256099942544/1712485313'   // Google's public iOS TEST rewarded unit
 };
 const KEY = 'rl_ads470';
 const EV = { REWARD: 'onRewardedVideoAdReward', DISMISS: 'onRewardedVideoAdDismissed', FAIL_LOAD: 'onRewardedVideoAdFailedToLoad', FAIL_SHOW: 'onRewardedVideoAdFailedToShow' };
 const A = W.ADS470 = { log: [], on: false, busy: false, ready: false, kinds: {} };   // kinds: extra rewarded kinds (V51.4 v514adfree.js)
 const lg = m => { A.log.push(Date.now() % 1e7 + ' ' + m); if (A.log.length > 60) A.log.shift(); };
 // ---------- where it runs ----------
 function plugin() {
  const C = W.Capacitor;
  if (!C) return null;
  try {
   if (!(typeof C.isNativePlatform === 'function' && C.isNativePlatform())) return null;
   if (C.getPlatform && C.getPlatform() !== 'ios') return null;
   if (typeof C.isPluginAvailable === 'function' && !C.isPluginAvailable('AdMob')) return null;
   const P = C.Plugins && C.Plugins.AdMob;
   return P && typeof P.showRewardVideoAd === 'function' ? P : null;
  } catch (e) { return null; }
 }
 const testAds = () => { if (W.__rl_adtest === true) return true; try { return localStorage.getItem('rl_adtest470') === '1'; } catch (e) { return false; } };
 // ---------- the daily counters (local day) ----------
 function day() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
 function rd() {
  let o = null;
  try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { o = null; }
  if (!o || typeof o !== 'object' || o.d !== day()) o = { d: day(), p: 0, m: 0 };
  o.p = Math.max(0, o.p | 0); o.m = o.m ? 1 : 0;
  return o;
 }
 function wr(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
 const packsLeft = () => Math.max(0, CFG.PACKS_PER_DAY - rd().p);
 const dimesReady = () => !rd().m;
 A.packsLeft = packsLeft; A.dimesReady = dimesReady;
 // ---------- the grant (ONLY called from the native rewarded event) ----------
 let req = null, seq = 0;
 function st() { try { return W.V17 && V17.ST ? V17.ST() : null; } catch (e) { return null; } }
 function onReward(data) {
  const r = req;
  if (!r || r.granted) { lg('reward ignored (no open request or already granted)'); return; }
  const ST = st();
  if (!ST) { lg('reward: no save'); return; }
  const X = A.kinds[r.kind];
  if (X) {   // V51.4: a kind registered by v514adfree.js - same rule: granted only here, once per request
   if (!X.can()) { lg('reward: ' + r.kind + ' not available'); return; }
   r.granted = true;
   try { X.grant(data); } catch (e) { lg('grant ' + r.kind + ' ' + (e && e.message)); }
   try { V17.save(); } catch (e) { }
   lg('GRANTED ' + r.kind + ' ' + JSON.stringify(data || {}));
   A.grants = (A.grants || 0) + 1;
   show(X.got);
   dirty();
   return;
  }
  const o = rd();
  if (r.kind === 'pack') {
   if (o.p >= CFG.PACKS_PER_DAY) { lg('reward: pack limit'); return; }
   r.granted = true;
   o.p++; wr(o);
   ST.freePacks = ST.freePacks && typeof ST.freePacks === 'object' ? ST.freePacks : {};
   ST.freePacks[CFG.PACK_KIND] = (ST.freePacks[CFG.PACK_KIND] || 0) + (CFG.PACKS_PER_AD || 1);
  } else {
   if (o.m) { lg('reward: dimes already today'); return; }
   r.granted = true;
   o.m = 1; wr(o);
   ST.chinos = (ST.chinos || 0) + CFG.DAILY_DIMES;
   try { ST.stats.earned += CFG.DAILY_DIMES; } catch (e) { }
  }
  try { V17.save(); } catch (e) { }
  lg('GRANTED ' + r.kind + ' ' + JSON.stringify(data || {}));
  A.grants = (A.grants || 0) + 1;
  show(r.kind === 'pack' ? 'gotpack' : 'gotdimes');
  dirty();
 }
 function onDismiss() {
  const r = req;
  if (!r) return;
  r.dismissed = true;
  A.busy = false;
  // the reward event normally lands before the close; give a late one a moment before saying "nothing added"
  setTimeout(() => { if (req === r && !r.granted && scr === 'wait') show('noreward'); dirty(); }, 900);
 }
 function onFail(e) {
  const r = req;
  if (!r || r.granted) return;
  A.busy = false;
  lg('fail ' + String((e && (e.message || e.code)) || e).slice(0, 80));
  show('noad');
  dirty();
 }
 // ---------- native setup: consent (UMP) -> ATT -> initialize, once, on the first ad tap ----------
 let setupP = null;
 function setup(P) {
  if (setupP) return setupP;
  setupP = (async () => {
   try {   // GDPR / US-state consent through Google's UMP form (shows only where it is required)
    const ci = await P.requestConsentInfo({});
    if (ci && ci.isConsentFormAvailable && ci.status === 'REQUIRED') await P.showConsentForm();
   } catch (e) { lg('consent ' + (e && e.message)); }
   try {   // Apple App Tracking Transparency, asked here (before the first ad load), never at launch
    const t = await P.trackingAuthorizationStatus();
    if (t && t.status === 'notDetermined') await P.requestTrackingAuthorization();
   } catch (e) { lg('att ' + (e && e.message)); }
   await P.initialize({ initializeForTesting: testAds(), tagForUnderAgeOfConsent: false });
   await P.addListener(EV.REWARD, onReward);
   await P.addListener(EV.DISMISS, onDismiss);
   await P.addListener(EV.FAIL_LOAD, onFail);
   await P.addListener(EV.FAIL_SHOW, onFail);
   A.ready = true;
   return P;
  })();
  setupP.catch(() => { setupP = null; });
  return setupP;
 }
 async function watch(kind) {
  const P = plugin();
  if (!P || A.busy) return;
  const X = A.kinds[kind];
  if (X ? !X.can() : kind === 'pack' ? packsLeft() <= 0 : !dimesReady()) { show(X ? X.done : kind === 'pack' ? 'packdone' : 'dimesdone'); return; }
  A.busy = true;
  req = { kind: kind, id: ++seq, granted: false, dismissed: false };
  const my = req;
  show('wait');
  try {
   await setup(P);
   if (req !== my) return;
   const unit = testAds() ? CFG.UNIT_TEST : X ? X.unit || CFG.UNIT_PACK : kind === 'pack' ? CFG.UNIT_PACK : CFG.UNIT_DIMES;
   await P.prepareRewardVideoAd({ adId: unit, isTesting: testAds() });
   if (req !== my || scr !== 'wait') { A.busy = false; return; }   // the player tapped CANCEL while it loaded
   await P.showRewardVideoAd();   // resolves on the reward too, but the grant is the event's job, never this promise's
  } catch (e) {
   if (req === my && !my.granted && !my.dismissed) onFail(e);
  }
 }
 A.watch = watch;
 // ---------- UI: the YARD SALE tile + the one-screen overlay ----------
 const css = '#ads470{position:fixed;inset:0;z-index:59;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center;font:bold 12px/1.3 ui-monospace,Menlo,Consolas,monospace;color:#e8f4f6;text-transform:uppercase}' +
  '#ads470 .bx{background:#13202b;border:3px solid #ffd23a;box-shadow:4px 4px 0 #000;padding:14px 16px;width:min(440px,90%);box-sizing:border-box;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center}' +
  '#ads470 h2{margin:0;color:#ffe14d;font-size:20px;text-shadow:2px 2px 0 #000}#ads470 p{margin:0;font-size:12px;color:#cfe;line-height:1.45}' +
  '#ads470 button{font:inherit;font-size:15px;text-transform:uppercase;border:0;border-radius:3px;padding:12px 18px;min-height:46px;width:100%;background:#ffd23a;color:#0b1a20;box-shadow:0 3px 0 #000;cursor:pointer;touch-action:manipulation}' +
  '#ads470 .ic{font-size:30px;line-height:1}' +
  '#ad470tile{border:2px solid #ffd23a;background:linear-gradient(90deg,rgba(255,210,58,.28),rgba(10,16,24,.9) 50%,rgba(44,196,220,.25));box-shadow:0 0 10px rgba(255,210,58,.4);padding:6px 8px;margin:0 0 6px;display:flex;gap:8px;align-items:stretch}' +
  '#ad470tile .ad470c{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}#ad470tile b{color:#fff}#ad470tile small{color:#8fe3f0;font-size:9px}' +
  '#ad470tile button{width:100%}#ad470tile button.d{opacity:.5}';
 let box = null, scr = '';
 function mount() {
  if (box) return;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  box = document.createElement('div'); box.id = 'ads470'; box.setAttribute('role', 'dialog');
  document.body.appendChild(box);
  ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown'].forEach(ev => box.addEventListener(ev, e => e.stopPropagation()));
 }
 function dirty() { try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) { } }
 function bigBtn(label, aria, fn, id) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'hb470'; /* NOT 'hb': #ui .hb is the game's invisible canvas hit-area class */ b.id = id; b.setAttribute('aria-label', aria); b.textContent = label;
  b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); fn(); });
  return b;
 }
 const close = () => { if (box) { box.style.display = 'none'; box.textContent = ''; } scr = ''; dirty(); };
 function openPack() {
  close();
  try {
   if (typeof PANEL_ACT !== 'undefined' && PANEL_ACT.v17buy) { PANEL_ACT.v17buy(CFG.PACK_KIND); dirty(); }
  } catch (e) { console.warn('ads470 open', e); }
 }
 function cancelWait() { if (req && !req.granted) req.cancelled = true; A.busy = false; close(); }
 // every screen: a title, one sentence, one big button
 const SCREENS = {
  wait: () => [ '\u23F3', 'AD LOADING', 'WATCH THE WHOLE AD TO GET YOUR ' + (req && req.kind === 'pack' ? (CFG.PACKS_PER_AD > 1 ? CFG.PACKS_PER_AD + ' FREE PACKS.' : 'FREE PACK.') : req && A.kinds[req.kind] ? A.kinds[req.kind].prize : CFG.DAILY_DIMES + ' DIMES.'), 'CANCEL', 'CANCEL THE AD', cancelWait ],
  gotpack: () => [ '\uD83C\uDF81', (CFG.PACKS_PER_AD > 1 ? CFG.PACKS_PER_AD + ' FREE PACKS!' : 'FREE PACK!'), (CFG.PACKS_PER_AD > 1 ? CFG.PACKS_PER_AD + ' BASIC PACKS ARE YOURS. ' : 'A BASIC PACK IS YOURS. ') + (packsLeft() ? packsLeft() + ' MORE ' + (CFG.PACKS_PER_AD > 1 ? 'AD' : 'FREE PACK') + (packsLeft() === 1 ? '' : 'S') + ' TODAY.' : 'COME BACK TOMORROW FOR MORE.'), 'OPEN IT', 'OPEN YOUR FREE PACK', openPack ],
  gotdimes: () => [ '\uD83E\uDE99', '+' + CFG.DAILY_DIMES + ' DIMES', 'THANKS FOR WATCHING. YOUR DAILY DIMES ARE BACK TOMORROW.', 'NICE', 'CLOSE', close ],
  noreward: () => [ '\u270B', 'NO REWARD', 'THE AD CLOSED BEFORE THE END, SO NOTHING WAS ADDED.', 'OK', 'CLOSE', close ],
  noad: () => [ '\uD83D\uDCE1', 'NO AD RIGHT NOW', 'THERE IS NO AD TO SHOW YET. TRY AGAIN IN A LITTLE BIT.', 'OK', 'CLOSE', close ],
  packdone: () => [ '\uD83C\uDF19', 'ALL FREE PACKS USED', 'YOU WATCHED ' + CFG.PACKS_PER_DAY + ' TODAY. MORE FREE PACKS TOMORROW.', 'OK', 'CLOSE', close ],
  dimesdone: () => [ '\uD83C\uDF19', 'DAILY DIMES CLAIMED', 'YOUR NEXT DAILY DIMES ARE READY TOMORROW.', 'OK', 'CLOSE', close ]
 };
 function show(name) {
  mount();
  const f = SCREENS[name];
  if (!f) return;
  const [ic, title, line, btn, aria, fn] = f();
  scr = name; A.screen = name;
  box.textContent = '';
  const b = document.createElement('div'); b.className = 'bx'; b.id = 'ads470_' + name;
  const i = document.createElement('div'); i.className = 'ic'; i.textContent = ic; i.setAttribute('aria-hidden', 'true');
  const h = document.createElement('h2'); h.textContent = title;
  const p = document.createElement('p'); p.textContent = line;
  b.append(i, h, p, bigBtn(btn, aria, fn, 'ads470btn'));
  box.appendChild(b);
  box.style.display = 'flex';
 }
 A.show = show;
 A.screens = SCREENS; A.close = close; A.native = () => !!plugin();   // V51.4 hooks for v514adfree.js
 function tileHtml() {
  const pl = packsLeft(), dr = dimesReady();
  return '<div class="ad470c"><b>FREE PACK</b><small>' + (pl ? 'WATCH A SHORT AD FOR ' + (CFG.PACKS_PER_AD > 1 ? CFG.PACKS_PER_AD + ' BASIC PACKS' : 'A BASIC PACK') + ' - ' + pl + ' LEFT TODAY' : 'ALL ' + CFG.PACKS_PER_DAY + ' USED - BACK TOMORROW') + '</small>' +
   '<button type="button" class="y' + (pl ? '' : ' d') + '" id="ad470pack" aria-label="FREE PACK: WATCH AD">FREE PACK: WATCH AD</button></div>' +
   '<div class="ad470c"><b>DAILY DIMES</b><small>' + (dr ? 'WATCH A SHORT AD FOR +' + CFG.DAILY_DIMES + ' DIMES, ONCE A DAY' : 'CLAIMED TODAY - BACK TOMORROW') + '</small>' +
   '<button type="button" class="y' + (dr ? '' : ' d') + '" id="ad470dimes" aria-label="DAILY DIMES: WATCH AD">DAILY DIMES: WATCH AD</button></div>';
 }
 function decorate() {
  if (W.__rl_no470ads || !plugin()) return;
  const pn = document.getElementById('panel');
  if (!pn || pn.dataset.scr !== 'shop17') return;
  const list = pn.querySelector('#shopList');
  if (!list) return;
  let t = list.querySelector('#ad470tile');
  const html = tileHtml();
  if (t && t.__h === html) return;
  if (!t) {
   t = document.createElement('div'); t.id = 'ad470tile';
   ['click'].forEach(ev => t.addEventListener(ev, e => {
    const b = e.target.closest('button'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    try { if (W.SFX && SFX.tap) SFX.tap(); } catch (er) { }
    watch(b.id === 'ad470pack' ? 'pack' : 'dimes');
   }));
   list.insertBefore(t, list.firstChild);
  }
  t.innerHTML = html; t.__h = html;
 }
 A.decorate = decorate;
 function boot() {
  if (!plugin()) { lg('not native / no AdMob plugin: nothing shown'); return; }
  A.on = true;
  mount();
  const pn = document.getElementById('panel');
  if (!pn) { setTimeout(boot, 600); return; }
  new MutationObserver(() => { try { decorate(); } catch (e) { } }).observe(pn, { childList: true, subtree: true, attributes: true, attributeFilter: [ 'data-scr' ] });
  decorate();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 120)); else setTimeout(boot, 120);
})();
