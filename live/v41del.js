// ===== BAGGA LAX V41 DELETE ACCOUNT (v41del.js) - App Store guideline 5.1.1(v) =====
// FRIENDS + CLOUD SAVE (acct23.js, signed in) gets DELETE ACCOUNT under SYNC NOW / SIGN OUT, plus PRIVACY / SUPPORT / TERMS links.
// DELETE ACCOUNT -> a confirm box: type your PIN, (optional) ALSO ERASE THIS PHONE'S SAVE, DELETE FOREVER -> POST /api/app41/del
// { tok, u, pin } -> the server checks the PIN and erases: the account (username + PIN hash), every sign-in on every phone, the cloud save
// (and the older copy it keeps), friends + friend requests both ways, game invites, trades + trade tables, the birth year, the invite code /
// joins / reward, blocks + reports this account made, and the phones' links to the account (server/server41.js del41). The purchase log
// keeps only the anonymous transaction rows Apple's records need (no username). Then this phone signs out (and, if ticked, its rl_ save keys
// are erased and the game restarts fresh). Signed out = DELETE MY DATA ON THIS PHONE in the signed-out view erases the local save.
// Off: window.__rl_no41del (and always off in FISH, __rl_v124gb).
(function () {
  'use strict';
  var W = window;
  if (W.__rl_no41del || W.__rl_v124gb) return;
  var D = W.DEL41 = { log: [], open: false };
  var css = '#del41{position:fixed;inset:0;z-index:62;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;font:bold 12px/1.3 "Courier New",ui-monospace,monospace;color:#cfe;text-transform:uppercase}' +
    '#del41 .box{background:#13202b;border:3px solid #ff5a4a;box-shadow:4px 4px 0 #000;padding:10px 12px;max-width:560px;width:92%;max-height:94%;overflow:auto}#del41 h2{margin:0 0 6px;color:#ff8a7a;font-size:15px}' +
    '#del41 .sm{font-size:10px;color:#8fe3f0;margin:4px 0}#del41 .err{color:#ff8a7a;min-height:13px}#del41 .ok{color:#7dff7a}#del41 label{display:flex;gap:6px;align-items:center;margin:6px 0;font-size:11px}' +
    '#del41 input[type=password]{font:inherit;font-size:16px;text-transform:none;width:100%;padding:6px;margin:4px 0;border:2px solid #ff8a7a;background:#061016;color:#fff;border-radius:0;box-sizing:border-box}' +
    '#del41 button{font:inherit;text-transform:uppercase;border:0;padding:8px 10px;margin:3px 4px 0 0;box-shadow:0 2px 0 #000;cursor:pointer;color:#0b1a20;background:#c9d6d9;touch-action:manipulation}#del41 button.r{background:#ff5a4a;color:#fff}' +
    '#acct23 .rl41links{margin-top:8px;font-size:10px}#acct23 .rl41links button{padding:4px 6px;background:#22394a;color:#cfe}#acct23 button.rl41del{background:#ff5a4a;color:#fff}';
  var box = null;
  function el(tag, attrs, kids) { var e = document.createElement(tag); for (var k in attrs || {}) { if (k === 'on') e.addEventListener('click', attrs.on); else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }); return e; }
  function bt(label, cls, fn, id) { return el('button', { 'class': cls || '', id: id || '', type: 'button', on: function (e) { e.preventDefault(); e.stopPropagation(); fn(); } }, [label]); }
  var cssOn = false;
  function addCss() { if (cssOn) return; cssOn = true; var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }
  function mount() {
    if (box) return;
    addCss();
    box = el('div', { id: 'del41' }); document.body.appendChild(box);
    ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown'].forEach(function (ev) { box.addEventListener(ev, function (e) { e.stopPropagation(); }); });
  }
  function close() { if (box) { box.style.display = 'none'; box.textContent = ''; } D.open = false; }
  function acct() { try { return (W.V23 && V23.A && V23.A()) || {}; } catch (e) { return {}; } }
  function dev() { try { return (W.RLNET && RLNET.dev) || localStorage.getItem('rl_dev') || ''; } catch (e) { return ''; } }
  function wipeLocal() {   // the save on this phone: every rl_ key except the device id (+ the account key, removed on sign-out)
    var ks = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && /^(rl_|rlx_|rl\d)/.test(k) && k !== 'rl_dev') ks.push(k); } } catch (e) { }
    ks.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { } });
    // until the reload, nothing the running game saves on its way out (pagehide / visibility saves) may write the old save back
    var S0 = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (this === W.localStorage && /^(rl_|rlx_|rl\d)/.test(String(k)) && k !== 'rl_dev') return; return S0.call(this, k, v); };
    try { sessionStorage.clear(); } catch (e) { }
    try { if (W.indexedDB && indexedDB.databases) indexedDB.databases().then(function (dbs) { (dbs || []).forEach(function (d) { if (d && d.name) try { indexedDB.deleteDatabase(d.name); } catch (e) { } }); }); } catch (e) { }
    D.log.push('wiped ' + ks.length + ' keys');
    return ks.length;
  }
  D.wipeLocal = wipeLocal;
  function signOutHere() {   // the account key only (acct23 keeps it in rl_acct23; its own sign-out would call the server, which already forgot us)
    try { localStorage.removeItem('rl_acct23'); } catch (e) { }
  }
  function restart() { if (W.__rl41noReload) { D.log.push('reload skipped'); return; } setTimeout(function () { location.reload(); }, 900); }
  D.call = function (pin) {
    var A = acct();
    return fetch('/api/app41/del', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dev: dev(), tok: A.tok || '', u: A.u || '', pin: String(pin || '') }) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: r.status === 404 ? 'DELETE IS NOT ON THE SERVER YET - EMAIL SUPPORT' : 'BAD ANSWER (' + r.status + ')' }; }); })
      .catch(function () { return { ok: false, error: 'NO CONNECTION - TRY AGAIN ONLINE', net: true }; });
  };
  D.openAcct = function () {
    var A = acct(); if (!A.tok) return;
    mount(); D.open = true; box.textContent = ''; box.style.display = 'flex';
    var b = el('div', { 'class': 'box' }); box.appendChild(b);
    b.appendChild(el('h2', { text: 'DELETE ACCOUNT ' + String(A.u || '').toUpperCase() + '?' }));
    b.appendChild(el('div', { 'class': 'sm', text: 'THIS ERASES FROM OUR SERVER: YOUR USERNAME + PIN, YOUR CLOUD SAVE, YOUR FRIENDS + REQUESTS, INVITES, TRADES, YOUR BIRTH YEAR AND YOUR INVITE CODE. IT CAN\'T BE UNDONE. DIMES YOU BOUGHT CAN\'T BE GIVEN BACK.' }));
    var pin = el('input', { type: 'password', id: 'del41pin', maxlength: '64', autocomplete: 'current-password', placeholder: 'TYPE YOUR PIN / PASSWORD' });
    b.appendChild(pin);
    var cb = el('input', { type: 'checkbox', id: 'del41wipe' });
    b.appendChild(el('label', {}, [cb, 'ALSO ERASE THE SAVE ON THIS PHONE (START FRESH)']));
    var err = el('div', { 'class': 'err', id: 'del41err' }); b.appendChild(err);
    var go = bt('DELETE FOREVER', 'r', function () {
      if (!pin.value) { err.textContent = 'TYPE YOUR PIN FIRST'; return; }
      go.disabled = true; err.textContent = 'DELETING...';
      D.call(pin.value).then(function (r) {
        D.log.push('del ' + JSON.stringify(r).slice(0, 120));
        if (!r || !r.ok) { go.disabled = false; err.textContent = (r && r.error) || 'DID NOT WORK'; return; }
        signOutHere(); if (cb.checked) wipeLocal();
        b.textContent = '';
        b.appendChild(el('h2', { text: 'ACCOUNT DELETED' }));
        b.appendChild(el('div', { 'class': 'sm ok', text: cb.checked ? 'YOUR ACCOUNT AND THIS PHONE\'S SAVE ARE GONE. THE GAME RESTARTS FRESH.' : 'YOUR ACCOUNT IS GONE FROM OUR SERVER. THIS PHONE KEEPS PLAYING YOUR SAVE OFFLINE (SIGNED OUT).' }));
        b.appendChild(bt('OK', '', function () { close(); restart(); }, 'del41ok'));
        restart();
      });
    }, 'del41go');
    b.appendChild(el('div', {}, [go, bt('CANCEL', '', close, 'del41x')]));
  };
  D.openLocal = function () {   // signed out: erase this phone's save only
    mount(); D.open = true; box.textContent = ''; box.style.display = 'flex';
    var b = el('div', { 'class': 'box' }); box.appendChild(b);
    b.appendChild(el('h2', { text: 'DELETE MY DATA ON THIS PHONE?' }));
    b.appendChild(el('div', { 'class': 'sm', text: 'ERASES YOUR SAVE ON THIS PHONE: LEVEL, DIMES, CARDS, ITEMS, SEASONS. IT CAN\'T BE UNDONE. (NO ACCOUNT = NOTHING OF YOURS IS ON OUR SERVER EXCEPT ONLINE GAME ROOMS, WHICH ARE DELETED ON THEIR OWN.)' }));
    b.appendChild(el('div', {}, [bt('ERASE THIS PHONE', 'r', function () { wipeLocal(); close(); restart(); }, 'del41local'), bt('CANCEL', '', close, 'del41x')]));
  };
  function links() {
    var L = W.RL41 && RL41.link ? RL41.link : function (p) { try { W.open(p, '_blank'); } catch (e) { } };
    return el('div', { 'class': 'rl41links' }, [bt('PRIVACY', '', function () { L('privacy.html'); }, 'rl41priv'), bt('SUPPORT', '', function () { L('support.html'); }, 'rl41sup'), bt('TERMS', '', function () { L('terms.html'); }, 'rl41terms')]);
  }
  function decorate(root) {
    if (!root || root.__d41busy) return; root.__d41busy = true;
    try {
      var out = root.querySelector('#b23out');
      if (out && !root.querySelector('#rl41del')) { out.parentNode.appendChild(bt('DELETE ACCOUNT', 'rl41del', D.openAcct, 'rl41del')); out.parentNode.parentNode.appendChild(links()); }
      var go = root.querySelector('#b23go');
      if (go && !root.querySelector('#rl41dloc')) { var col = go.parentNode; var l = links(); l.appendChild(bt('DELETE MY DATA ON THIS PHONE', 'rl41del', D.openLocal, 'rl41dloc')); col.appendChild(l); }
    } finally { root.__d41busy = false; }
  }
  function boot() {
    var root = document.getElementById('acct23');
    if (!root) { setTimeout(boot, 700); return; }
    addCss(); decorate(root); new MutationObserver(function () { decorate(root); }).observe(root, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 60); }); else setTimeout(boot, 60);
})();
