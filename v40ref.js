(function() {
 'use strict';
 const off = () => !!(window.__rl_no40ref || window.__rl_v124gb);
 if (off()) {
  window.V40REF = {
   on: () => false,
   open() {},
   log: []
  };
  return;
 }
 const DK = 'rlx_ref40', MK = 'rl_ref40', LK = 'rlx_ref40d', SCR = 'ref40', NEED = 2, AMT = 100;
 const V = window.V40REF = {
  log: [],
  st: null,
  msg: '',
  err: '',
  busy: false,
  applied: 0
 };
 V.on = () => !off() && !!window.V23;
 const lg = s => {
  V.log.push(Date.now() % 1e7 + ' ' + s);
  if (V.log.length > 80) V.log.shift();
 };
 const lsg = k => {
  try {
   return localStorage.getItem(k);
  } catch (e) {
   return null;
  }
 };
 const lss = (k, v) => {
  try {
   localStorage.setItem(k, v);
   return true;
  } catch (e) {
   return false;
  }
 };
 const jget = k => {
  try {
   const o = JSON.parse(lsg(k) || 'null');
   return o && typeof o === 'object' ? o : null;
  } catch (e) {
   return null;
  }
 };
 const acct = () => {
  try {
   return V23.A() || {};
  } catch (e) {
   return {};
  }
 };
 const signed = () => {
  try {
   return !!(window.V23 && V23.signedIn());
  } catch (e) {
   return false;
  }
 };
 const ul = () => String(acct().u || '').toLowerCase();
 const devId = () => window.RLNET && RLNET.dev || lsg('rl_dev') || '';
 const okCode = c => /^[2-9A-HJKMNP-Z]{6}$/.test(c);
 const norm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
 const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 const dirty = () => {
  try {
   if (typeof screen !== 'undefined' && screen === SCR) panelDirty();
  } catch (e) {}
 };
 async function api(path, body) {
  try {
   const r = await fetch('/api/ref40/' + path, {
    method: 'POST',
    headers: {
     'content-type': 'application/json'
    },
    body: JSON.stringify(Object.assign({
     dev: devId(),
     tok: acct().tok
    }, body || {}))
   });
   let j = null;
   try {
    j = await r.json();
   } catch (e) {
    j = null;
   }
   if (!j) j = {
    ok: false,
    error: 'BAD ANSWER (' + r.status + ')',
    http: r.status
   };
   j.http = r.status;
   return j;
  } catch (e) {
   return {
    ok: false,
    error: 'NO CONNECTION',
    net: true
   };
  }
 }
 function takeLink() {
  let code = '';
  try {
   const u = new URL(location.href);
   code = norm(u.searchParams.get('ref'));
   if (u.searchParams.has('ref')) {
    u.searchParams.delete('ref');
    history.replaceState(history.state, '', u.pathname + (u.search || '') + u.hash);
   }
  } catch (e) {}
  if (!okCode(code)) return;
  const o = jget(DK) || {};
  if (o.code !== code) lss(DK, JSON.stringify({
   code: code,
   t: Date.now(),
   tried: []
  }));
  lg('link code ' + code);
 }
 takeLink();
 const pending = () => {
  const o = jget(DK);
  return o && okCode(o.code) && !o.done && Date.now() - (+o.t || 0) < 14 * 864e5 ? o : null;
 };
 V.pending = () => {
  const o = pending();
  return o ? o.code : null;
 };
 const marker = () => jget(MK);
 function applied(j) {
  const m = marker();
  return !!(m && m.u === ul() && m.cid === j.cid);
 }
 function applyIfMine(j) {
  if (!j || !j.claimed || !j.mine || !j.cid || !ul() || j.u && String(j.u).toLowerCase() !== ul()) return false;
  if (applied(j)) return false;
  if (!window.V17 || typeof V17.addChinos !== 'function') {
   lg('no V17.addChinos');
   return false;
  }
  const amt = Math.max(0, Math.min(1e3, +j.amt || AMT));
  V17.addChinos(amt, 'INVITE REWARD');
  lss(MK, JSON.stringify({
   u: ul(),
   cid: j.cid,
   amt: amt,
   t: Date.now()
  }));
  V.applied++;
  lg('applied ' + amt + ' ' + j.cid);
  try {
   if (window.V23 && V23.put) setTimeout(() => {
    try {
     V23.put(false, 'ref40');
    } catch (e) {}
   }, 300);
  } catch (e) {}
  return true;
 }
 V.applyIfMine = applyIfMine;
 let loadFor = '', loading = null;
 async function load(force) {
  if (!signed()) {
   V.st = null;
   return null;
  }
  if (loading) return loading;
  loading = (async () => {
   const who = ul();
   const j = await api('me');
   if (who !== ul()) return null;
   if (j.ok) {
    V.st = j;
    V.err = '';
    loadFor = who;
    lss(LK, who);
    if (applyIfMine(j)) V.msg = '+' + (j.amt || AMT) + ' DIMES - THANKS FOR BRINGING FRIENDS!';
   } else if (j.auth === false) V.st = null; else V.err = j.error || 'DID NOT WORK';
   return j;
  })().finally(() => {
   loading = null;
   dirty();
  });
  return loading;
 }
 V.load = load;
 async function join(code, typed) {
  V.busy = true;
  V.err = '';
  V.msg = '';
  dirty();
  const who = ul(), j = await api('join', {
   code: code
  });
  V.busy = false;
  const o = jget(DK) || {};
  if (j.ok && j.joined) {
   if (o.code === code || typed) lss(DK, JSON.stringify(Object.assign({}, o, {
    code: code,
    done: who,
    t: o.t || Date.now()
   })));
   V.st = j;
   V.msg = 'INVITE ACCEPTED' + (j.by && j.by.u ? ' - ' + String(j.by.u).toUpperCase() + ' GETS CREDIT FOR YOU' : '');
   try {
    if (window.V17 && V17.toast) V17.toast('INVITE ACCEPTED', '#8fe3f0');
   } catch (e) {}
  } else if (j.net || (j.http || 0) >= 500) {
   V.err = j.error || 'NO CONNECTION';
  } else if (j.auth === false) {} else {
   V.err = j.error || 'DID NOT WORK';
   if (!typed && o.code === code) {
    const tr = Array.isArray(o.tried) ? o.tried : [];
    if (!tr.includes(who)) tr.push(who);
    lss(DK, JSON.stringify(Object.assign({}, o, {
     tried: tr,
     why: j.why || ''
    })));
   }
  }
  lg('join ' + code + ' -> ' + (j.ok ? 'ok' : j.why || j.error));
  dirty();
  return j;
 }
 V.join = join;
 async function claim() {
  if (V.busy) return null;
  V.busy = true;
  V.err = '';
  V.msg = '';
  dirty();
  const j = await api('claim');
  V.busy = false;
  if (j.ok && j.claimed) {
   V.st = j;
   if (applyIfMine(j)) V.msg = '+' + (j.amt || AMT) + ' DIMES - THANKS FOR BRINGING FRIENDS!'; else if (!j.mine) V.msg = 'ALREADY CLAIMED ON YOUR OTHER PHONE - IT COMES WITH YOUR CLOUD SAVE'; else V.msg = 'ALREADY CLAIMED';
  } else {
   V.err = j.error || 'DID NOT WORK';
   if (j.joins != null && V.st) V.st.joins = j.joins;
  }
  lg('claim -> ' + JSON.stringify({
   ok: j.ok,
   fresh: j.fresh,
   mine: j.mine,
   why: j.why
  }));
  dirty();
  return j;
 }
 V.claim = claim;
 let nextTry = 0, lastU = null;
 async function tick() {
  if (off()) return;
  hookFriends();
  const s = signed(), who = s ? ul() : '';
  if (who !== lastU) {
   lastU = who;
   V.st = null;
   V.msg = '';
   V.err = '';
   loadFor = '';
   dirty();
   if (s && typeof screen !== 'undefined' && screen === SCR) load();
  }
  if (!s || V.busy || Date.now() < nextTry) return;
  const p = pending();
  if (p && !(Array.isArray(p.tried) && p.tried.includes(who))) {
   const j = await join(p.code, false);
   if (j.net || (j.http || 0) >= 500) nextTry = Date.now() + 3e4;
   return;
  }
  if (lsg(LK) !== who && !loading) {
   const j = await load();
   if (!j || !j.ok) nextTry = Date.now() + 6e4;
  }
 }
 setInterval(() => {
  try {
   tick();
  } catch (e) {
   lg('tick ' + e);
  }
 }, 3e3);
 setTimeout(() => {
  try {
   tick();
  } catch (e) {}
 }, 1500);
 let back = 'menu', typedCode = '';
 const link = c => 'https://retrolax.sites.tab.bot/?ref=' + c;
 function render() {
  const st = V.st, coin = '<span class="coin17"></span>';
  const hd = '<div class="hd"><div><div class="tt">INVITE FRIENDS</div><div class="st">2 FRIENDS MAKE AN ACCOUNT WITH YOUR LINK = ' + AMT + ' DIMES</div></div><div class="sp"></div>' + '<button type="button" data-a="ref40back" class="g" aria-label="BACK">BACK</button></div>';
  const note = '<div class="det17" id="ref40msg" style="min-height:12px">' + (V.err ? '<span style="color:#ff8a7a">' + escH(V.err) + '</span>' : V.msg ? '<span style="color:#7dff7a">' + escH(V.msg) + '</span>' : '') + '</div>';
  const fine = '<div class="det17" style="color:#7f9aa6">A FRIEND COUNTS WHEN THEY MAKE A NEW BAGGA LAX ACCOUNT WITH YOUR LINK OR CODE. SHARING ALONE DOESN\'T COUNT. ' + AMT + ' DIMES ONCE, AT ' + NEED + ' FRIENDS.</div>';
  if (!signed()) {
   const p = pending();
   return hd + note + '<div id="ref40out" style="flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center">' + (p ? '<div style="color:#ffe14d;font-size:12px">YOU HAVE AN INVITE CODE: <b id="ref40pend">' + escH(p.code) + '</b></div><div style="color:#cfe">MAKE YOUR ACCOUNT AND YOUR FRIEND GETS CREDIT</div>' + '<button type="button" data-a="ref40sign" data-v="new" class="y" id="ref40signbtn" style="min-height:40px;min-width:200px">MAKE MY ACCOUNT</button>' : '<div style="color:#fff;font-size:12px">SIGN IN FIRST</div><div style="color:#cfe">YOUR INVITE LINK AND REWARD RIDE ON YOUR ACCOUNT</div>' + '<button type="button" data-a="ref40sign" data-v="in" class="y" id="ref40signbtn" style="min-height:40px;min-width:200px">SIGN IN / MAKE ACCOUNT</button>') + '</div>' + fine;
  }
  if (!st) return hd + note + '<div id="ref40load" style="flex:1 1 auto;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#8fe3f0">' + (V.err ? '<button type="button" data-a="ref40retry" class="y" style="min-height:40px;min-width:140px">TRY AGAIN</button>' : 'LOADING...') + '</div>';
  const n = st.joins | 0, need = st.need || NEED, amt = st.amt || AMT, names = Array.isArray(st.names) ? st.names.slice().reverse() : [];
  let slots = '';
  for (let i = 0; i < need; i++) {
   const got = i < n, nm = got ? names[i] || 'FRIEND' : 'WAITING';
   slots += '<div class="ref40slot" style="flex:1 1 0;min-width:0;padding:6px 4px;text-align:center;border:2px ' + (got ? 'solid #7dff7a;background:#123a22;color:#7dff7a' : 'dashed #3a5260;background:#0f1a22;color:#56707c') + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (got ? '&#10003; ' : '') + escH(String(nm).toUpperCase()) + '</div>';
  }
  let rw;
  if (st.claimed) rw = '<div id="ref40done" style="color:#7dff7a;font-size:12px;text-align:center;padding:6px 0">&#10003; CLAIMED' + (st.mine || applied(st) ? ' - THANKS FOR BRINGING FRIENDS!' : ' ON YOUR OTHER PHONE - IT COMES WITH YOUR CLOUD SAVE') + '</div>'; else if (st.ready) rw = '<button type="button" data-a="ref40claim" class="y" id="ref40claimbtn" style="min-height:42px;width:100%;font-size:13px"' + (V.busy ? ' disabled' : '') + '>' + (V.busy ? '...' : 'CLAIM ' + amt + ' DIMES') + '</button>'; else rw = '<div id="ref40need" style="color:#ffe14d;text-align:center;padding:6px 0">' + Math.max(0, need - n) + ' MORE FRIEND' + (need - n === 1 ? '' : 'S') + ' TO GET ' + coin + amt + ' DIMES</div>';
  const extra = n > need ? '<div class="det17" style="color:#8fe3f0;text-align:center">' + n + ' FRIENDS JOINED - THANKS! THE REWARD IS ONCE PER ACCOUNT.</div>' : '';
  const shareLbl = navigator.share ? 'SHARE LINK' : 'COPY LINK';
  const left = '<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:6px">' + '<div style="color:#8fe3f0;font-size:10px">YOUR INVITE LINK</div>' + '<div id="ref40link" style="background:#0b1a20;border:2px solid #2cc4dc;box-shadow:0 2px 0 #000;padding:6px;color:#fff;font-size:11px;text-transform:none;word-break:break-all;user-select:all;-webkit-user-select:all">' + escH(link(st.code)) + '</div>' + '<div style="display:flex;align-items:center;gap:6px"><span style="color:#8fe3f0;font-size:10px">CODE</span><span id="ref40code" style="font-size:18px;color:#ffe14d;letter-spacing:3px;text-shadow:2px 2px 0 #000">' + escH(st.code) + '</span></div>' + '<div class="row"><button type="button" data-a="ref40share" class="y" id="ref40sharebtn" style="min-height:40px;flex:1 1 0">' + shareLbl + '</button>' + (navigator.share ? '<button type="button" data-a="ref40copy" id="ref40copybtn" style="min-height:40px;flex:0 0 auto">COPY</button>' : '') + '</div>' + (st.by ? '<div class="det17" id="ref40by" style="color:#7dff7a">YOU WERE INVITED BY ' + escH(String(st.by.u || '?').toUpperCase()) + ' &#10003;</div>' : st.canJoin ? '<div style="display:flex;gap:4px;align-items:center;flex-wrap:nowrap"><span style="color:#8fe3f0;font-size:9px;white-space:nowrap">GOT INVITED?</span>' + '<input id="ref40in" maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="CODE" value="' + escH(typedCode) + '" style="font:bold 13px ui-monospace,Menlo,monospace;text-transform:uppercase;width:84px;min-width:0;background:#0b1a20;color:#fff;border:2px solid #3a5260;padding:5px;border-radius:0;-webkit-appearance:none">' + '<button type="button" data-a="ref40use" id="ref40usebtn" style="min-height:34px;padding:5px 8px"' + (V.busy ? ' disabled' : '') + '>USE</button></div>' : '') + '</div>';
  const right = '<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:6px">' + '<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="color:#8fe3f0;font-size:10px">FRIENDS JOINED</span><span id="ref40prog" style="font-size:16px;color:#fff">' + Math.min(n, need) + ' / ' + need + '</span></div>' + '<div style="display:flex;gap:6px">' + slots + '</div>' + '<div id="ref40prize" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 4px;background:' + (st.claimed ? '#123a22' : '#2a2208') + ';border:2px solid ' + (st.claimed ? '#7dff7a' : '#ffd23a') + ';box-shadow:0 2px 0 #000">' + '<span style="color:#cfe;font-size:10px">REWARD</span><span style="display:inline-flex;align-items:center;transform:scale(1.5);transform-origin:center">' + coin + '</span><b style="color:#ffe14d;font-size:18px;text-shadow:2px 2px 0 #000">' + amt + ' DIMES</b></div>' + rw + extra + '</div>';
  return hd + note + '<div class="cols scroll" id="ref40body" style="overflow:auto;-webkit-overflow-scrolling:touch;gap:12px">' + left + right + '</div>' + fine;
 }
 function flash(m, bad) {
  V.msg = bad ? '' : m;
  V.err = bad ? m : '';
  dirty();
 }
 async function copy(t) {
  try {
   if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(t);
    return true;
   }
  } catch (e) {}
  try {
   const ta = document.createElement('textarea');
   ta.value = t;
   ta.setAttribute('readonly', '');
   ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
   document.body.appendChild(ta);
   ta.select();
   ta.setSelectionRange(0, t.length);
   const ok = document.execCommand('copy');
   ta.remove();
   return ok;
  } catch (e) {
   return false;
  }
 }
 V.open = function() {
  if (off()) return;
  try {
   if (window.V23 && V23.isOpen && V23.isOpen()) V23.close();
  } catch (e) {}
  try {
   if (typeof screen !== 'undefined' && screen !== SCR) back = PANEL_SCREENS.includes(screen) || screen === 'menu' ? screen : 'menu';
  } catch (e) {
   back = 'menu';
  }
  V.msg = '';
  V.err = '';
  try {
   screen = SCR;
   panelDirty();
  } catch (e) {
   lg('open ' + e);
   return;
  }
  if (signed()) load();
  lg('open');
 };
 V.close = function() {
  try {
   screen = back || 'menu';
   panelDirty();
  } catch (e) {}
 };
 document.addEventListener('input', ev => {
  if (ev.target && ev.target.id === 'ref40in') typedCode = norm(ev.target.value).slice(0, 6);
 }, true);
 function install() {
  if (typeof PANEL_RENDER === 'undefined' || typeof PANEL_ACT === 'undefined' || typeof PANEL_SCREENS === 'undefined') return false;
  if (!PANEL_SCREENS.includes(SCR)) PANEL_SCREENS.push(SCR);
  PANEL_RENDER[SCR] = function() {
   try {
    return render();
   } catch (e) {
    console.error(e);
    return '<div class="hd"><div class="tt">INVITE FRIENDS</div><div class="sp"></div><button type="button" data-a="ref40back" class="g">BACK</button></div>';
   }
  };
  PANEL_ACT.ref40back = () => {
   V.close();
   return PANEL_KEEP;
  };
  PANEL_ACT.ref40sign = v => {
   try {
    V23.open(v === 'new' ? 'new' : 'in');
   } catch (e) {}
   return PANEL_KEEP;
  };
  PANEL_ACT.ref40retry = () => {
   V.err = '';
   load();
  };
  PANEL_ACT.ref40claim = () => {
   claim();
  };
  PANEL_ACT.ref40use = () => {
   const el = document.getElementById('ref40in'), c = norm(el ? el.value : typedCode);
   typedCode = c;
   if (!okCode(c)) {
    flash('TYPE THE 6-LETTER CODE YOUR FRIEND SENT', true);
    return PANEL_KEEP;
   }
   join(c, true);
   return PANEL_KEEP;
  };
  PANEL_ACT.ref40copy = () => {
   const st = V.st;
   if (!st) return PANEL_KEEP;
   copy(link(st.code)).then(ok => flash(ok ? 'LINK COPIED - SEND IT TO A FRIEND' : 'PRESS AND HOLD THE LINK TO COPY IT', !ok));
   return PANEL_KEEP;
  };
  PANEL_ACT.ref40share = () => {
   const st = V.st;
   if (!st) return PANEL_KEEP;
   const url = link(st.code), text = 'PLAY BAGGA LAX WITH ME! MAKE YOUR ACCOUNT WITH MY INVITE (CODE ' + st.code + ')';
   if (navigator.share) navigator.share({
    title: 'BAGGA LAX',
    text: text,
    url: url
   }).then(() => flash('SENT! IT COUNTS WHEN THEY MAKE AN ACCOUNT'), e => {
    if (!e || e.name !== 'AbortError') PANEL_ACT.ref40copy();
   }); else PANEL_ACT.ref40copy();
   return PANEL_KEEP;
  };
  return true;
 }
 V.install = install;
 if (!install()) {
  const iv = setInterval(() => {
   if (install()) clearInterval(iv);
  }, 500);
 }
 let obs = null;
 function addBtn(root) {
  if (!root || root.querySelector('#ref40fr')) return;
  const h1 = root.querySelector('h1'), t = h1 ? h1.textContent : '';
  if (t !== 'FRIENDS + CLOUD SAVE' && t !== 'ACCOUNT + CLOUD SAVE') return;
  const top = root.querySelector('.top');
  if (!top) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.id = 'ref40fr';
  b.className = 'y';
  b.textContent = 'INVITE FRIENDS: 2 JOIN = ' + AMT + ' DIMES';
  b.style.cssText = 'display:block;width:100%;margin:4px 0 6px;min-height:36px;font:bold 12px "Courier New",ui-monospace,monospace;text-transform:uppercase;background:#ffd23a;color:#0b1a20;border:0;border-radius:3px;box-shadow:0 2px 0 #000;cursor:pointer;touch-action:manipulation';
  b.addEventListener('click', ev => {
   ev.preventDefault();
   ev.stopPropagation();
   V.open();
  });
  top.insertAdjacentElement('afterend', b);
 }
 function hookFriends() {
  if (obs) return;
  const root = document.getElementById('acct23');
  if (!root) return;
  obs = new MutationObserver(() => {
   if (!off()) addBtn(root);
  });
  obs.observe(root, {
   childList: true
  });
  addBtn(root);
 }
 V.hookFriends = hookFriends;
})();
