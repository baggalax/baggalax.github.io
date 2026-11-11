// ===== BAGGA LAX V41 IN-APP PURCHASES (v41iap.js) - App Store guideline 3.1.1 =====
// A store abstraction: STORE41.products(), .buy(id), .restore(). Only the iPhone app sells anything; the website keeps exactly what it does now
// (DIMES are earned, nothing is sold).
//  - iOS app (window.__rl_ios): StoreKit through RevenueCat's Capacitor plugin (@revenuecat/purchases-capacitor, native plugin "Purchases").
//    The YARD SALE header gets a "+ DIMES" button next to your balance -> GET DIMES: the 4 packs with Apple's own local price, BUY, and
//    RESTORE PURCHASES. Nothing else in the game changes: packs are still bought with DIMES in the YARD SALE (their odds are shown there).
//  - GRANT ON A VERIFIED TRANSACTION ONLY: StoreKit/RevenueCat purchase -> its transaction id goes to OUR server, POST /api/iap41/claim
//    { dev, tok, tx, product } -> the server asks RevenueCat (or Apple's App Store Server API) whether that transaction is real, paid, not
//    refunded and for that product, and writes it ONCE (transaction id = primary key; the phone that claims first is the one that adds it).
//    Only an { ok, mine } answer adds the DIMES (the server's number, not the phone's). The transaction is remembered in rl_iap41 (a NEW save key,
//    so it rides the cloud save and can never be added twice, even on another phone); one not yet confirmed waits in rlx_iap41p (this phone)
//    and is retried on every open and by RESTORE PURCHASES.
//  - Test without a phone: ?iapmock=1 (with ?ios41=1) = a fake store (instant purchases with "mock-" ids); the server only accepts those when
//    its IAP41_MODE secret is 'mock' (never on the live server).
// Product ids (create these in App Store Connect as CONSUMABLE, and in RevenueCat): see PRODUCTS. Off: window.__rl_no41iap (and FISH __rl_v124gb).
(function () {
  'use strict';
  var W = window;
  if (W.__rl_no41iap || W.__rl_v124gb) return;
  var PRODUCTS = [   // id, DIMES, US price tier (Apple sets every other country's price), name shown
    { id: 'com.baggalax.dimes.100', dimes: 100, usd: '$0.99', n: 'HANDFUL OF DIMES' },
    { id: 'com.baggalax.dimes.550', dimes: 550, usd: '$4.99', n: 'ROLL OF DIMES', tag: '+10% FREE' },
    { id: 'com.baggalax.dimes.1200', dimes: 1200, usd: '$9.99', n: 'BAG OF DIMES', tag: '+20% FREE' },
    { id: 'com.baggalax.dimes.2600', dimes: 2600, usd: '$19.99', n: 'VAULT OF DIMES', tag: '+30% FREE' }
  ];
  var RC_KEY = W.RL41_RC_KEY || 'appl_AVRJeQGpISVgfcjwMdfEFmTdotq';   // RevenueCat > Project > API keys > Apple App Store (public, safe in the app)
  var mock = /[?&]iapmock=1(&|$)/.test(location.search) || W.__rl_iapMock === true;
  var S = W.STORE41 = { PRODUCTS: PRODUCTS, log: [], ready: false, kind: 'none', items: null, busy: false, err: '' };
  var lg = function (m) { S.log.push(Date.now() % 1e7 + ' ' + m); if (S.log.length > 80) S.log.shift(); };
  var BY = {}; PRODUCTS.forEach(function (p) { BY[p.id] = p; });
  function dev() { try { return (W.RLNET && RLNET.dev) || localStorage.getItem('rl_dev') || ''; } catch (e) { return ''; } }
  function tok() { try { return (W.V23 && V23.A && V23.A().tok) || ''; } catch (e) { return ''; } }
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v && typeof v === 'object' ? v : d; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  var GK = 'rl_iap41', PK = 'rlx_iap41p';
  S.granted = function () { return jget(GK, {}); };
  S.pending = function () { var a = jget(PK, []); return Array.isArray(a) ? a : []; };
  function addPending(tx, product) { var a = S.pending(); if (!a.some(function (x) { return x.tx === tx; })) a.push({ tx: tx, p: product, t: Date.now() }); jset(PK, a); }
  function dropPending(tx) { jset(PK, S.pending().filter(function (x) { return x.tx !== tx; })); }
  // ---------- the native side ----------
  var P = null;   // the RevenueCat plugin proxy
  function plugin() {
    if (P) return P;
    var C = W.Capacitor; if (!C) return null;
    try { P = (C.Plugins && C.Plugins.Purchases) || (C.registerPlugin ? C.registerPlugin('Purchases') : null); } catch (e) { P = null; }
    return P;
  }
  var MOCK = {
    configure: function () { return Promise.resolve(); },
    getProducts: function (o) { return Promise.resolve({ products: o.productIdentifiers.map(function (id) { return { identifier: id, priceString: BY[id].usd, title: BY[id].n }; }) }); },
    purchaseStoreProduct: function (o) { if (W.__rl_iapMockCancel) return Promise.reject({ code: '1', userCancelled: true, message: 'cancelled' }); return new Promise(function (res) { setTimeout(function () { res({ productIdentifier: o.product.identifier, transaction: { transactionIdentifier: 'mock-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), productIdentifier: o.product.identifier } }); }, 150); }); },
    restorePurchases: function () { return Promise.resolve({ customerInfo: { nonSubscriptionTransactions: (W.__rl_iapMockHist || []) } }); },
    getCustomerInfo: function () { return Promise.resolve({ customerInfo: { nonSubscriptionTransactions: (W.__rl_iapMockHist || []) } }); }
  };
  S.init = function () {
    if (S.ready || S.initing) return S.initing || Promise.resolve(S.ready);
    if (!W.__rl_ios) { S.kind = 'web'; return Promise.resolve(false); }
    var pl = mock ? MOCK : plugin();
    if (!pl) { S.kind = 'none'; S.err = 'STORE NOT IN THIS BUILD'; lg('no plugin'); return Promise.resolve(false); }
    if (!mock && /REPLACE/.test(RC_KEY)) { S.kind = 'none'; S.err = 'STORE NOT SET UP YET'; lg('no rc key'); return Promise.resolve(false); }
    S.kind = mock ? 'mock' : 'storekit'; P = pl;
    S.initing = pl.configure({ apiKey: RC_KEY, appUserID: dev() || null }).then(function () {
      return pl.getProducts({ productIdentifiers: PRODUCTS.map(function (p) { return p.id; }), type: 'NON_SUBSCRIPTION' });
    }).then(function (r) {
      var got = (r && r.products) || []; S.items = {}; got.forEach(function (x) { S.items[x.identifier] = x; });
      S.ready = true; lg('ready ' + got.length + ' products'); S.initing = null;
      retryPending();
      return true;
    }).catch(function (e) { S.err = 'STORE ERROR: ' + ((e && e.message) || e); lg(S.err); S.initing = null; return false; });
    return S.initing;
  };
  // ---------- the server check + the grant ----------
  function claim(tx, product) {
    return fetch('/api/iap41/claim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dev: dev(), tok: tok(), tx: tx, product: product }) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'BAD ANSWER (' + r.status + ')', retry: r.status >= 500 || r.status === 404 }; }); })
      .catch(function () { return { ok: false, error: 'NO CONNECTION', retry: true }; });
  }
  function grant(tx, r) {   // r = the server's answer (its dimes number is the one used)
    var g = S.granted(), k2 = (r && r.tx && String(r.tx) !== tx) ? String(r.tx) : null;   // k2 = the server's App Store id for this purchase (restore can list another id)
    if (g[tx] || (k2 && g[k2])) { if (!g[tx]) { g[tx] = g[k2]; jset(GK, g); } dropPending(tx); return 0; }
    var n = Math.max(0, Math.floor(+r.dimes || 0)); if (!n) return 0;
    g[tx] = { p: r.product || '', n: n, t: Date.now() }; if (k2) g[k2] = g[tx]; jset(GK, g);   // the record first: a crash after this can't add it twice
    try { if (W.V17 && V17.addChinos) V17.addChinos(n, 'THANKS!'); else lg('no V17'); } catch (e) { lg('grant err ' + e); }
    dropPending(tx); lg('granted ' + n + ' ' + tx);
    try { if (W.V23 && V23.put) setTimeout(function () { V23.put(false, 'iap41'); }, 400); } catch (e) { }   // the cloud save gets it right away
    return n;
  }
  function settle(tx, product) {
    return claim(tx, product).then(function (r) {
      lg('claim ' + tx + ' -> ' + JSON.stringify(r).slice(0, 140));
      if (r && r.ok && r.mine) return { ok: true, n: grant(tx, r), r: r };
      if (r && r.ok && !r.mine) { dropPending(tx); return { ok: false, other: true, r: r }; }   // added on another phone already (it's in that save)
      if (r && r.retry) return { ok: false, later: true, r: r };   // stays pending
      if (r && r.bad) dropPending(tx);   // the server says the purchase isn't real / was refunded
      return { ok: false, r: r };
    });
  }
  function retryPending() { S.pending().forEach(function (x) { if (!S.granted()[x.tx]) settle(x.tx, x.p); else dropPending(x.tx); }); }
  S.settle = settle; S.retryPending = retryPending;
  S.buy = function (id) {
    if (!S.ready || S.busy) return Promise.resolve({ ok: false, error: S.err || 'STORE NOT READY' });
    var item = S.items && S.items[id]; if (!item) return Promise.resolve({ ok: false, error: 'NOT FOR SALE RIGHT NOW' });
    S.busy = true; lg('buy ' + id);
    return P.purchaseStoreProduct({ product: item }).then(function (res) {
      var t = res && res.transaction, tx = t && (t.transactionIdentifier || t.transactionId);
      if (!tx) throw { message: 'NO TRANSACTION' };
      addPending(tx, id);
      return settle(tx, id).then(function (s) { S.busy = false; return s.ok ? { ok: true, n: s.n } : s.later ? { ok: false, later: true, error: 'BOUGHT - YOUR DIMES ARRIVE AS SOON AS YOU\'RE ONLINE' } : { ok: false, error: (s.r && s.r.error) || 'COULD NOT CONFIRM' }; });
    }).catch(function (e) {
      S.busy = false; var c = e && (e.userCancelled || /cancel/i.test(e.message || '') || e.code === '1');
      lg('buy fail ' + ((e && e.message) || e));
      return { ok: false, cancelled: !!c, error: c ? '' : 'PURCHASE DIDN\'T GO THROUGH' + (e && e.message ? ': ' + String(e.message).toUpperCase().slice(0, 60) : '') };
    });
  };
  S.restore = function () {   // StoreKit's history (RevenueCat) -> any purchase of ours this save hasn't received yet is claimed (a consumable already added
    if (!S.ready) return Promise.resolve({ ok: false, error: S.err || 'STORE NOT READY' });   // on another phone stays there: it's in that cloud save)
    lg('restore');
    return P.restorePurchases().then(function (r) {
      var ci = (r && (r.customerInfo || r)) || {}, list = ci.nonSubscriptionTransactions || [], g = S.granted(), todo = [];
      list.forEach(function (t) { var tx = t.storeTransactionIdentifier || t.transactionIdentifier || t.transactionId, p = t.productIdentifier || t.productId; if (tx && BY[p] && !g[tx]) { addPending(tx, p); todo.push([tx, p]); } });
      S.pending().forEach(function (x) { if (!todo.some(function (y) { return y[0] === x.tx; })) todo.push([x.tx, x.p]); });
      return Promise.all(todo.map(function (x) { return settle(x[0], x[1]); })).then(function (rs) {
        var n = 0, other = 0; rs.forEach(function (s) { if (s.ok) n += s.n; if (s.other) other++; });
        return { ok: true, n: n, other: other, seen: list.length };
      });
    }).catch(function (e) { return { ok: false, error: 'RESTORE DIDN\'T WORK: ' + String((e && e.message) || e).toUpperCase().slice(0, 60) }; });
  };
  // ---------- GET DIMES (the panel) ----------
  var css = '#iap41{position:fixed;inset:0;z-index:58;background:rgba(0,0,0,.76);display:none;align-items:center;justify-content:center;font:bold 12px/1.3 "Courier New",ui-monospace,monospace;color:#cfe;text-transform:uppercase}' +
    '#iap41 .box{background:#13202b;border:3px solid #ffd23a;box-shadow:4px 4px 0 #000;padding:8px 10px;max-width:760px;width:94%;max-height:94%;overflow:auto;box-sizing:border-box}' +
    '#iap41 .hd{display:flex;align-items:center;gap:8px}#iap41 h2{margin:0;color:#ffe14d;font-size:16px;text-shadow:2px 2px 0 #000;flex:1}' +
    '#iap41 .grid{display:flex;gap:6px;margin:8px 0}#iap41 .it{flex:1;background:#0b1118;border:2px solid #22394a;padding:6px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0}' +
    '#iap41 .it b{color:#fff;font-size:15px}#iap41 .it .tg{color:#7dff7a;font-size:10px;min-height:12px}#iap41 .it .nm{font-size:10px;color:#8fe3f0}' +
    '#iap41 .coin{width:30px;height:30px;image-rendering:pixelated}#iap41 .sm{font-size:9px;color:#8fe3f0;margin-top:4px}#iap41 .msg{min-height:14px;color:#7dff7a}#iap41 .msg.e{color:#ff8a7a}' +
    '#iap41 button{font:inherit;text-transform:uppercase;border:0;padding:7px 9px;box-shadow:0 2px 0 #000;cursor:pointer;color:#0b1a20;background:#c9d6d9;touch-action:manipulation}' +
    '#iap41 button.buy{background:#ffd23a;width:100%}#iap41 button[disabled]{opacity:.5}' +
    '#panel button.iap41open{background:#ffd23a;margin-left:6px;padding:6px 8px}';
  var box = null;
  function el(tag, attrs, kids) { var e = document.createElement(tag); for (var k in attrs || {}) { if (k === 'on') e.addEventListener('click', attrs.on); else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }); return e; }
  function bt(label, cls, fn, id) { return el('button', { 'class': cls || '', id: id || '', type: 'button', on: function (e) { e.preventDefault(); e.stopPropagation(); fn(); } }, [label]); }
  function coinSrc() { try { var c = document.querySelector('#panel .bal17 img, #panel .bal17 canvas'); if (c && c.src) return c.src; if (c && c.toDataURL) return c.toDataURL(); } catch (e) { } return ''; }
  function mount() {
    if (box) return;
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    box = el('div', { id: 'iap41' }); document.body.appendChild(box);
    ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown'].forEach(function (ev) { box.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  }
  S.close = function () { if (box) { box.style.display = 'none'; box.textContent = ''; } S.open = false; try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) { } };
  var msg = '', msgE = false;
  function bal() { try { return W.V17 && V17.ST ? Math.floor(V17.ST().chinos || 0) : 0; } catch (e) { return 0; } }
  function render() {
    if (!box || !S.open) return;
    box.textContent = '';
    var b = el('div', { 'class': 'box' }); box.appendChild(b);
    b.appendChild(el('div', { 'class': 'hd' }, [el('h2', { text: 'GET DIMES' }), el('span', { id: 'iap41bal', text: 'YOU HAVE ' + bal() + ' DIMES' }), bt('CLOSE', '', S.close, 'iap41x')]));
    var src = coinSrc(), g = el('div', { 'class': 'grid' });
    PRODUCTS.forEach(function (p) {
      var it = S.items && S.items[p.id], price = it ? it.priceString : '';
      g.appendChild(el('div', { 'class': 'it', id: 'iap41_' + p.dimes }, [src ? el('img', { 'class': 'coin', src: src, alt: '' }) : null, el('b', { text: p.dimes + ' DIMES' }), el('span', { 'class': 'nm', text: p.n }), el('span', { 'class': 'tg', text: p.tag || '' }),
        bt(S.busy ? '...' : price || 'N/A', 'buy', function () { buy(p.id); }, 'iap41buy_' + p.dimes)]));
    });
    if (!S.ready) [].forEach.call(g.querySelectorAll('button'), function (x) { x.disabled = true; });
    if (S.busy) [].forEach.call(g.querySelectorAll('button'), function (x) { x.disabled = true; });
    b.appendChild(g);
    b.appendChild(el('div', { 'class': 'msg' + (msgE ? ' e' : ''), id: 'iap41msg', text: msg || (S.ready ? '' : S.err || 'LOADING THE STORE...') }));
    b.appendChild(el('div', {}, [bt('RESTORE PURCHASES', '', restore, 'iap41restore')]));
    b.appendChild(el('div', { 'class': 'sm', text: 'DIMES ARE SPENT IN THE YARD SALE ON PACKS, THE PASS AND GEAR. EVERY PACK SHOWS ITS ODDS BEFORE YOU OPEN IT. PAYMENT IS CHARGED TO YOUR APPLE ACCOUNT. DIMES HAVE NO CASH VALUE. ASK A PARENT BEFORE YOU BUY.' }));
    b.appendChild(el('div', { 'class': 'sm' }, [bt('TERMS', '', function () { RL41.link('terms.html'); }, 'iap41terms'), ' ', bt('PRIVACY', '', function () { RL41.link('privacy.html'); }, 'iap41priv')]));
  }
  function say(m, e) { msg = m; msgE = !!e; render(); }
  function buy(id) {
    say('OPENING APPLE...'); 
    S.buy(id).then(function (r) { if (r.ok) say('+' + r.n + ' DIMES - THANKS!'); else if (r.cancelled) say(''); else say(r.error || 'DIDN\'T WORK', !r.later); try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) { } });
    render();
  }
  function restore() {
    say('CHECKING YOUR PURCHASES...');
    S.restore().then(function (r) { if (!r.ok) return say(r.error, true); say(r.n ? 'RESTORED +' + r.n + ' DIMES' : r.other ? 'YOUR DIMES ARE ALREADY IN YOUR SAVE (SIGN IN TO GET YOUR CLOUD SAVE HERE)' : 'NOTHING TO RESTORE - EVERY PURCHASE IS ALREADY IN YOUR SAVE'); });
  }
  S.openPanel = function () { mount(); S.open = true; msg = ''; box.style.display = 'flex'; render(); S.init().then(render); };
  // the "+ DIMES" button next to the balance in the YARD SALE / pack screens (only when this build sells: the iOS app)
  function decorate() {
    if (!W.__rl_ios) return;
    var pn = document.getElementById('panel'); if (!pn) return;
    var bals = pn.querySelectorAll('.bal17');
    for (var i = 0; i < bals.length; i++) { var bl = bals[i]; if (bl.nextSibling && bl.nextSibling.classList && bl.nextSibling.classList.contains('iap41open')) continue; bl.parentNode.insertBefore(bt('+ DIMES', 'iap41open', S.openPanel, 'iap41open'), bl.nextSibling); }
  }
  S.decorate = decorate;
  function boot() {
    if (!W.__rl_ios) return;
    var pn = document.getElementById('panel'); if (!pn) { setTimeout(boot, 600); return; }
    new MutationObserver(function () { try { decorate(); } catch (e) { } }).observe(pn, { childList: true, subtree: true });
    setTimeout(function () { S.init(); }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); }); else setTimeout(boot, 80);
})();
