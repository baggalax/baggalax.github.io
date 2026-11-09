(function() {
 'use strict';
 if (window.__rl_no23 || window.__rl_v124gb) return;
 const KEY = 'rl_acct23', BAK = 'rl_bak23';
 const SKIP = new Set([ 'rl_dev', KEY, BAK, 'rl_sw_reload', 'rl_netGame' ]);
 const OSET = Storage.prototype.setItem, ODEL = Storage.prototype.removeItem;
 let block = false;
 Storage.prototype.setItem = function(k, v) {
  if (block && this === window.localStorage && String(k).startsWith('rl_') && !SKIP.has(String(k))) return;
  return OSET.call(this, k, v);
 };
 Storage.prototype.removeItem = function(k) {
  if (block && this === window.localStorage && String(k).startsWith('rl_') && !SKIP.has(String(k))) return;
  return ODEL.call(this, k);
 };
 const ls = {
  get(k) {
   try {
    return localStorage.getItem(k);
   } catch (e) {
    return null;
   }
  },
  set(k, v) {
   try {
    OSET.call(localStorage, k, v);
    return true;
   } catch (e) {
    return false;
   }
  },
  del(k) {
   try {
    ODEL.call(localStorage, k);
   } catch (e) {}
  }
 };
 let A = (() => {
  try {
   const o = JSON.parse(ls.get(KEY) || 'null');
   return o && typeof o === 'object' ? o : {};
  } catch (e) {
   return {};
  }
 })();
 const saveA = () => ls.set(KEY, JSON.stringify(A));
 const dev = () => window.RLNET && RLNET.dev || ls.get('rl_dev') || '';
 function snap() {
  const ks = [];
  try {
   for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('rl_') && !SKIP.has(k)) ks.push(k);
   }
  } catch (e) {}
  ks.sort();
  const o = {};
  for (const k of ks) o[k] = ls.get(k);
  return o;
 }
 function hsh(s) {
  let a = 2166136261, b = 2538058380 ^ s.length;
  for (let i = 0; i < s.length; i++) {
   const c = s.charCodeAt(i);
   a = Math.imul(a ^ c, 16777619);
   b = Math.imul(b ^ c, 1540483477);
   b ^= b >>> 15;
  }
  return (a >>> 0).toString(36) + '.' + (b >>> 0).toString(36) + '.' + s.length.toString(36);
 }
 function sumOf(o) {
  const j = k => {
   try {
    return JSON.parse(o[k]);
   } catch (e) {
    return null;
   }
  };
  const s = j('rl_v17') || {}, c = j('rl_v22') || {}, ps = s.pass || {};
  const lvl = Math.max(Math.floor(+ps.stars || 0), Math.floor((+ps.notch || 0) / 5));
  const items = Object.values(s.inv || {}).reduce((t, n) => t + Math.max(0, +n || 0), 0);
  const st = s.stats || {}, cards = Object.keys(c && c.cards || {}).length;
  return {
   lvl: lvl,
   chinos: Math.max(0, Math.floor(+s.chinos || 0)),
   cards: cards,
   items: items,
   wins: +st.wins || 0,
   games: +st.games || 0,
   keys: Object.keys(o).length
  };
 }
 const isEmpty = s => !s || !(s.lvl || s.chinos || s.cards || s.items || s.wins || s.games);
 const on2312 = () => !window.__rl_no2312;
 const V23 = window.V23 = {
  on2312: on2312,
  signedIn: () => !!A.tok,
  A: () => A,
  snap: snap,
  sumOf: sumOf,
  hsh: hsh,
  st: {
   inv: [],
   freq: 0,
   fr: null,
   msg: '',
   err: '',
   busy: false,
   log: []
  }
 };
 const S = V23.st;
 const log = m => {
  S.log.push(Date.now() % 1e7 + ' ' + m);
  if (S.log.length > 40) S.log.shift();
 };
 async function api(path, body) {
  try {
   const r = await fetch('/api' + path, {
    method: 'POST',
    headers: {
     'content-type': 'application/json'
    },
    body: JSON.stringify(Object.assign({
     dev: dev()
    }, body || {}))
   });
   let j = null;
   try {
    j = await r.json();
   } catch (e) {
    j = {
     ok: false,
     error: 'BAD ANSWER (' + r.status + ')'
    };
   }
   if (j && j.auth === false && A.tok) signedOut('SIGNED OUT ON THIS PHONE - SIGN IN AGAIN');
   return j || {
    ok: false
   };
  } catch (e) {
   return {
    ok: false,
    error: 'NO CONNECTION',
    net: true
   };
  }
 }
 V23.api = api;
 function signedOut(why) {
  A = {};
  saveA();
  S.fr = null;
  S.inv = [];
  S.err = why || '';
  render();
 }
 let lastPut = 0, putting = false, prompt = null, promptQ = null;
 const curStr = () => JSON.stringify(snap());
 const dirty = () => !!A.tok && hsh(curStr()) !== A.h;
 async function put(force, why) {
  if (!A.tok || putting) return null;
  const s = curStr(), h = hsh(s);
  putting = true;
  lastPut = Date.now();
  try {
   const r = await api('/save/put', {
    tok: A.tok,
    base: A.rev || 0,
    data: s,
    sum: sumOf(JSON.parse(s)),
    force: !!force
   });
   if (r.ok) {
    A.rev = r.rev;
    A.h = h;
    A.at = Date.now();
    A.pend = 0;
    delete A.pp;
    saveA();
    log('put ok rev ' + r.rev + ' ' + (why || ''));
   } else if (r.conflict && r.save) {
    log('put conflict');
    if (V23.tr24c) V23.tr24c(r.save).then(ok => {
     if (!ok) ask('conflict', r.save);
    }); else ask('conflict', r.save);
   } else log('put failed: ' + (r.error || '?'));
   return r;
  } finally {
   putting = false;
   render();
  }
 }
 V23.put = put;
 V23.dirty = dirty;
 V23.revStep = (r0, r1) => {
  if ((A.rev || 0) !== r0) return false;
  A.rev = r1;
  saveA();
  log('trade rev ' + r0 + '->' + r1);
  return true;
 };
 function pagePut() {
  if (!A.tok || A.pend || prompt) return;
  const s = curStr(), h = hsh(s);
  if (h === A.h) return;
  const body = JSON.stringify({
   dev: dev(),
   tok: A.tok,
   base: A.rev || 0,
   data: s,
   sum: sumOf(JSON.parse(s))
  });
  A.pp = {
   h: h,
   base: A.rev || 0
  };
  saveA();
  try {
   fetch('/api/save/put', {
    method: 'POST',
    headers: {
     'content-type': 'application/json'
    },
    body: body,
    keepalive: body.length < 63e3
   }).then(r => r.json()).then(r => {
    if (r && r.ok && A.pp && A.pp.h === h) {
     A.rev = r.rev;
     A.h = h;
     A.at = Date.now();
     delete A.pp;
     saveA();
     log('pageput ok ' + r.rev);
    } else if (r && r.conflict && r.save) {
     delete A.pp;
     saveA();
     if (V23.tr24c) V23.tr24c(r.save).then(ok => {
      if (!ok) ask('conflict', r.save);
     }); else ask('conflict', r.save);
    }
   }).catch(() => {});
  } catch (e) {}
 }
 V23.pagePut = pagePut;
 const PLAY = new Set([ 'live', 'faceoff', 'defense', 'banner', 'timeout', 'qbreak', 'penalty', 'cpu', 'scene' ]);
 function tick() {
  if (!A.tok || A.pend || prompt || putting) return;
  try {
   if (typeof screen === 'string' && PLAY.has(screen)) return;
  } catch (e) {}
  const s = curStr(), h = hsh(s);
  if (A.adopt) {
   if (h !== A.h) log('adopt boot normalization');
   A.h = h;
   delete A.adopt;
   saveA();
   return;
  }
  if (h === A.h) return;
  if (Date.now() - lastPut < 8e3) return;
  put(false, 'change');
 }
 function ask(kind, cloud) {
  if (cloud && (prompt && prompt.cloud && prompt.cloud.rev === cloud.rev || promptQ && promptQ.cloud && promptQ.cloud.rev === cloud.rev)) return;
  if (prompt && kind !== 'conflict') return;
  A.pend = 1;
  saveA();
  promptQ = {
   kind: kind,
   cloud: cloud,
   t: Date.now()
  };
  showPromptIfSafe();
 }
 const SAFE = () => typeof screen === 'undefined' || [ 'menu', 'online', 'onJoin', 'settings', 'help' ].includes(screen) || open;
 function showPromptIfSafe() {
  if (!promptQ || prompt) return;
  if (!SAFE()) return;
  prompt = promptQ;
  promptQ = null;
  renderPrompt();
 }
 async function useCloud() {
  const r = await api('/save/get', {
   tok: A.tok
  });
  if (!r.ok || !r.save) {
   S.err = r.error || 'COULD NOT GET THE CLOUD SAVE';
   renderPrompt();
   return false;
  }
  applySave(r.save.data, r.save.rev, true);
  return true;
 }
 function applySave(data, rev, keepBackup) {
  let o = null;
  try {
   o = JSON.parse(data);
  } catch (e) {
   return false;
  }
  const cur = snap();
  if (keepBackup) ls.set(BAK, JSON.stringify({
   t: Date.now(),
   data: cur,
   sum: sumOf(cur)
  }));
  block = true;
  for (const k of Object.keys(cur)) if (!(k in o)) ls.del(k);
  if (!window.__rl_no283drill) try {
   const lv = JSON.parse(cur.rl_v28 || 'null'), dn = lv && lv.m28 === 'done' || localStorage.getItem('rl283m28done') === '1';
   if (dn) {
    const cv = JSON.parse(typeof o.rl_v28 === 'string' ? o.rl_v28 : '{}') || {};
    if (cv.m28 !== 'done') {
     cv.m28 = 'done';
     cv.m28at = cv.m28at || lv && lv.m28at || Date.now();
     o.rl_v28 = JSON.stringify(cv);
    }
   }
  } catch (e) {}
  for (const k of Object.keys(o)) if (k.startsWith('rl_') && !SKIP.has(k) && typeof o[k] === 'string') ls.set(k, o[k]);
  if (rev != null) {
   A.rev = rev;
   A.h = hsh(JSON.stringify(snap()));
   A.adopt = Date.now();
  }
  A.pend = 0;
  A.at = Date.now();
  saveA();
  log('applied save rev ' + rev);
  if (!window.__rl23noReload) setTimeout(() => location.reload(), 60);
  return true;
 }
 V23.applySave = applySave;
 V23.undoLoad = function() {
  let b = null;
  try {
   b = JSON.parse(ls.get(BAK) || 'null');
  } catch (e) {}
  if (!b || !b.data) return false;
  const cur = snap();
  ls.set(BAK, JSON.stringify({
   t: Date.now(),
   data: cur,
   sum: sumOf(cur)
  }));
  A.adopt = 0;
  A.h = 'restore';
  saveA();
  applySave(JSON.stringify(b.data), null, false);
  return true;
 };
 async function afterSignIn(isNew) {
  const loc = curStr();
  if (isNew) {
   A.rev = 0;
   A.h = '';
   saveA();
   const r = await put(true, 'first');
   return r;
  }
  const g = await api('/save/get', {
   tok: A.tok
  });
  if (!g.ok) return g;
  if (!g.save) {
   A.rev = 0;
   A.h = '';
   saveA();
   return put(true, 'first upload');
  }
  if (g.save.data === loc) {
   A.rev = g.save.rev;
   A.h = hsh(loc);
   saveA();
   return {
    ok: true,
    same: true
   };
  }
  A.rev = 0;
  A.h = hsh(loc);
  saveA();
  ask('first', {
   rev: g.save.rev,
   sum: g.save.sum,
   t: g.save.t,
   dev: g.save.dev
  });
  return {
   ok: true,
   asked: true
  };
 }
 let hbT = 0, hbBusy = false;
 async function hb() {
  if (!A.tok || hbBusy) return;
  hbBusy = true;
  hbT = Date.now();
  try {
   const r = await api('/acct/hb', {
    tok: A.tok,
    tz: (new Date).getTimezoneOffset()
   });
   if (!r.ok) return;
   S.freq = r.freq | 0;
   S.inv = (r.inv || []).filter(i => !(A.dis || []).includes(i.id));
   if (r.tr24 && V23.tr24hb) try {
    V23.tr24hb(r.tr24);
   } catch (e) {
    log('tr24 ' + e);
   }
   const sv = r.save;
   if (sv && !A.pend && !prompt && !promptQ && sv.rev !== (A.rev || 0)) {
    if (A.pp && sv.dev === dev() && sv.rev === A.pp.base + 1) {
     A.rev = sv.rev;
     A.h = A.pp.h;
     delete A.pp;
     saveA();
     log('hb: own close-upload landed');
    } else if (sv.rev > (A.rev || 0) && A.skip !== sv.rev) ask(dirty() ? 'conflict' : 'newer', sv);
   }
   renderInvite();
   if (open) render(); else if (window.panelDirty) try {
    panelDirty();
   } catch (e) {}
  } finally {
   hbBusy = false;
  }
 }
 V23.hb = hb;
 async function loadFriends() {
  if (!A.tok) return;
  const r = await api('/fr/list', {
   tok: A.tok
  });
  if (r.ok) {
   S.fr = r;
  }
  render();
 }
 V23.loadFriends = loadFriends;
 async function frAct(kind, u) {
  S.err = '';
  S.msg = '';
  const r = await api('/fr/' + kind, {
   tok: A.tok,
   u: u
  });
  if (!r.ok) S.err = r.error || 'DID NOT WORK'; else S.msg = r.state === 'sent' ? 'REQUEST SENT TO ' + r.u.toUpperCase() : r.state === 'friends' ? 'YOU AND ' + r.u.toUpperCase() + ' ARE FRIENDS' : '';
  await loadFriends();
  return r;
 }
 V23.frAct = frAct;
 function ensureName() {
  try {
   if (A.u && window.RLNET && !RLNET.uname()) RLNET.setUname(A.u);
  } catch (e) {}
 }
 async function invite(u) {
  if (!window.RLNET) return;
  if (RLNET.inGame) {
   S.err = 'FINISH YOUR ONLINE GAME FIRST';
   render();
   return;
  }
  if (on2312() && pickSeason) {
   const r = await api('/inv/send', {
    tok: A.tok,
    u: u,
    code: pickSeason
   });
   if (r.ok) {
    S.msg = 'INVITE SENT TO ' + u.toUpperCase();
    RLNET.msg = 'INVITE SENT TO ' + u.toUpperCase();
    RLNET.msgT = 6;
   } else S.err = r.error || 'INVITE DID NOT SEND';
   render();
   V23.lastInvite = r;
   return r;
  }
  ensureName();
  close();
  let code = RLNET.code && RLNET.side === 'h' && RLNET.kind === 'game' && RLNET.lobby && !RLNET.lobby.hasGuest ? RLNET.code : null;
  if (!code) {
   RLNET.openOnline();
   await RLNET.createGame();
   code = RLNET.code && RLNET.side === 'h' ? RLNET.code : null;
  }
  if (!code) return;
  const r = await api('/inv/send', {
   tok: A.tok,
   u: u,
   code: code
  });
  if (r.ok) {
   RLNET.msg = 'INVITE SENT TO ' + u.toUpperCase() + ' - WAITING FOR HIM';
   RLNET.msgT = 6;
   RLNET.invited = u.toUpperCase();
  } else {
   RLNET.err = r.error || 'INVITE DID NOT SEND';
  }
  V23.lastInvite = r;
  return r;
 }
 V23.invite = invite;
 async function joinInvite(i, yes) {
  A.dis = (A.dis || []).concat(i.id).slice(-30);
  saveA();
  S.inv = S.inv.filter(x => x.id !== i.id);
  renderInvite();
  const r = await api('/inv/ans', {
   tok: A.tok,
   id: i.id,
   yes: !!yes
  });
  if (!yes || !r.ok) return r;
  if (window.RLNET) {
   if (RLNET.inGame) {
    RLNET.err = 'FINISH YOUR ONLINE GAME FIRST';
    return r;
   }
   ensureName();
   close();
   RLNET.openOnline();
   if (on2312() && (r.kind || i.kind) === 'season') await RLNET.seasonJoin(r.code || i.code); else await RLNET.joinGame(r.code || i.code);
  }
  return r;
 }
 V23.joinInvite = joinInvite;
 const pushSupported = () => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
 const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
 const standalone = () => !!(navigator.standalone || window.matchMedia && matchMedia('(display-mode: standalone)').matches);
 function pushState() {
  if (isIOS() && !standalone()) return 'ios-tab';
  if (!pushSupported()) return 'none';
  if (Notification.permission === 'denied') return 'denied';
  if (Notification.permission === 'granted' && A.push) return 'on';
  return 'off';
 }
 V23.pushState = pushState;
 async function enablePush() {
  S.err = '';
  const st = pushState();
  if (st === 'ios-tab' || st === 'none' || !window.RLNET) {
   render();
   return st;
  }
  const r = await RLNET.askPush();
  if (r === 'subscribed') {
   A.push = 1;
   saveA();
   S.msg = 'NOTIFICATIONS ARE ON';
  } else if (r === 'denied') S.err = 'NOTIFICATIONS ARE BLOCKED - ALLOW THEM FOR BAGGA LAX IN YOUR PHONE SETTINGS'; else if (r !== 'granted') S.err = 'NOTIFICATIONS DID NOT TURN ON (' + r + ')';
  render();
  return r;
 }
 V23.enablePush = enablePush;
 async function disablePush() {
  try {
   const reg = await navigator.serviceWorker.ready;
   const s = await reg.pushManager.getSubscription();
   if (s) await s.unsubscribe();
  } catch (e) {}
  await api('/push/unsub', {});
  A.push = 0;
  saveA();
  S.msg = 'NOTIFICATIONS ARE OFF';
  render();
 }
 async function refreshPush() {
  try {
   if (!pushSupported() || Notification.permission !== 'granted') {
    if (A.push) {
     A.push = 0;
     saveA();
    }
    return;
   }
   const reg = await navigator.serviceWorker.ready;
   const s = await reg.pushManager.getSubscription();
   if (!s) {
    if (A.push) {
     A.push = 0;
     saveA();
    }
    return;
   }
   if (!A.push || Date.now() - (A.pt || 0) > 864e5) {
    await api('/push/sub', {
     sub: s.toJSON ? s.toJSON() : s,
     tz: (new Date).getTimezoneOffset()
    });
    A.push = 1;
    A.pt = Date.now();
    saveA();
   }
   try {
    const c = await caches.open('rl-dev');
    await c.put('/__dev', new Response(dev()));
   } catch (e) {}
  } catch (e) {}
 }
 async function signIn(isNew, u, pin) {
  if (isNew) {
   let bad = null;
   try {
    bad = window.V35 && V35.nameBad ? V35.nameBad(u) : null;
   } catch (e) {}
   if (bad) {
    S.err = bad;
    S.msg = '';
    render();
    return {
     ok: false,
     error: bad
    };
   }
  }
  S.err = '';
  S.msg = '';
  S.busy = true;
  render();
  const r = await api(isNew ? '/acct/new' : '/acct/in', {
   u: String(u || '').trim(),
   pin: String(pin || '')
  });
  S.busy = false;
  if (!r.ok) {
   S.err = r.error || 'DID NOT WORK';
   render();
   return r;
  }
  A = {
   u: r.u,
   tok: r.tok,
   rev: 0,
   h: '',
   push: A.push,
   pt: A.pt
  };
  saveA();
  ensureName();
  const s = await afterSignIn(isNew);
  S.msg = isNew ? 'ACCOUNT MADE - YOUR SAVE IS BACKED UP' : s && s.asked ? '' : 'SIGNED IN - CLOUD SAVE ON';
  hb();
  loadFriends();
  render();
  if (gate && on2312()) {
   gate = false;
   close();
   if (window.RLNET) RLNET.openOnline();
  }
  return r;
 }
 V23.signIn = signIn;
 async function signOut() {
  if (A.tok) {
   pagePut();
   await api('/acct/out', {
    tok: A.tok
   });
  }
  const p = A.push, pt = A.pt;
  A = {
   push: p,
   pt: pt
  };
  saveA();
  S.fr = null;
  S.inv = [];
  S.msg = 'SIGNED OUT - YOUR SAVE STAYS ON THIS PHONE';
  render();
  renderInvite();
 }
 V23.signOut = signOut;
 const css = `#acct23{position:fixed;inset:0;z-index:40;background:#0b1118;color:#cfe;font:bold 12px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;display:none;overflow:auto;-webkit-overflow-scrolling:touch;padding:max(8px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 10px max(10px,env(safe-area-inset-left));box-sizing:border-box}\n#acct23 *{box-sizing:border-box}#acct23 h1{margin:0 0 6px;font-size:20px;color:#b6ff3a;text-shadow:2px 2px 0 #000;letter-spacing:1px}#acct23 h2{margin:0 0 5px;font-size:13px;color:#ffe14d}\n#acct23 .cols{display:flex;gap:10px;align-items:flex-start}#acct23 .col{flex:1;min-width:0;background:#13202b;border:2px solid #22394a;padding:8px;border-radius:2px}\n#acct23 button{font:inherit;text-transform:uppercase;border:0;border-radius:0;padding:6px 9px;margin:2px 3px 2px 0;background:#2cc4dc;color:#0b1a20;box-shadow:0 2px 0 #000;cursor:pointer;touch-action:manipulation}\n#acct23 button:active{transform:translateY(1px);box-shadow:0 1px 0 #000}#acct23 button[disabled]{opacity:.5}#acct23 .g{background:#7dff7a}#acct23 .y{background:#ffd23a}#acct23 .r{background:#ff8a7a}#acct23 .w{background:#c9d6d9}#acct23 .l{background:#b6ff3a}\n#acct23 input{font:inherit;font-size:16px;text-transform:none;width:100%;padding:6px;margin:2px 0 5px;border:2px solid #2cc4dc;background:#061016;color:#fff;border-radius:0}\n#acct23 .row{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #22394a}#acct23 .row .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#acct23 .dot{width:9px;height:9px;flex:none;background:#5a6670;box-shadow:1px 1px 0 #000}#acct23 .dot.on{background:#7dff7a}#acct23 .sm{font-size:10px;color:#8fe3f0}#acct23 .err{color:#ff8a7a;min-height:14px}#acct23 .ok{color:#7dff7a;min-height:14px}\n#acct23 .tabs button{background:#22394a;color:#cfe}#acct23 .tabs button.on{background:#b6ff3a;color:#0b1a20}#acct23 .top{display:flex;align-items:center;justify-content:space-between}\n#acct23 .sv{display:flex;gap:8px;margin:4px 0}#acct23 .sv div{flex:1;background:#0b1118;padding:4px 6px;border:1px solid #22394a}\n#p23{position:fixed;inset:0;z-index:45;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;font:bold 12px/1.3 "Courier New",ui-monospace,monospace;color:#cfe;text-transform:uppercase}\n#p23 .box{background:#13202b;border:3px solid #ffe14d;box-shadow:4px 4px 0 #000;padding:10px 12px;max-width:560px;width:92%}#p23 h2{margin:0 0 4px;color:#ffe14d;font-size:15px}\n#p23 .two{display:flex;gap:10px;margin:8px 0}#p23 .two>div{flex:1;background:#0b1118;border:2px solid #22394a;padding:6px 8px}#p23 .two .best{color:#7dff7a}#p23 b{color:#fff}\n#p23 button{font:inherit;text-transform:uppercase;border:0;padding:8px 10px;margin:2px 4px 0 0;box-shadow:0 2px 0 #000;cursor:pointer;color:#0b1a20}#p23 .err{color:#ff8a7a}\n#i23{position:fixed;left:50%;top:max(6px,env(safe-area-inset-top));transform:translateX(-50%);z-index:44;display:none;background:#13202b;border:3px solid #b6ff3a;box-shadow:3px 3px 0 #000;padding:6px 8px;font:bold 12px "Courier New",ui-monospace,monospace;color:#fff;text-transform:uppercase;white-space:nowrap;align-items:center;gap:6px}\n#i23 button{font:inherit;border:0;padding:5px 8px;margin-left:4px;box-shadow:0 2px 0 #000;cursor:pointer;color:#0b1a20;text-transform:uppercase}`;
 let root = null, pbox = null, ibox = null, open = false, tab = 'in';
 function el(tag, attrs, kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
   if (k === 'on') for (const ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids || []) if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
 }
 const btn = (label, cls, fn, id) => el('button', {
  class: cls || '',
  id: id || '',
  on: {
   click: e => {
    e.preventDefault();
    e.stopPropagation();
    fn();
   }
  }
 }, [ label ]);
 function mount() {
  if (root) return;
  document.head.appendChild(el('style', {
   text: css
  }));
  root = el('div', {
   id: 'acct23'
  });
  pbox = el('div', {
   id: 'p23'
  });
  ibox = el('div', {
   id: 'i23'
  });
  for (const n of [ root, pbox, ibox ]) {
   document.body.appendChild(n);
   for (const ev of [ 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown' ]) n.addEventListener(ev, e => e.stopPropagation());
  }
 }
 const ago = ms => ms == null ? 'NEVER' : ms < 9e4 ? 'JUST NOW' : ms < 36e5 ? Math.round(ms / 6e4) + ' MIN AGO' : ms < 864e5 ? Math.round(ms / 36e5) + ' H AGO' : Math.round(ms / 864e5) + ' D AGO';
 const sumLine = s => !s ? '-' : 'LVL ' + (s.lvl | 0) + ' - ' + (s.chinos | 0) + ' CHINOS - ' + (s.cards | 0) + ' CARDS';
 function friendsInto(col) {
  col.appendChild(el('h2', {
   text: pick ? 'PICK A FRIEND TO INVITE' : 'FRIENDS'
  }));
  const fu = el('input', {
   id: 'f23',
   autocapitalize: 'none',
   spellcheck: 'false',
   maxlength: '14',
   placeholder: 'ADD A FRIEND BY USERNAME'
  });
  col.appendChild(el('div', {
   style: 'display:flex;gap:4px;align-items:center'
  }, [ fu, btn('ADD', 'g', () => {
   if (fu.value.trim()) frAct('add', fu.value.trim());
  }, 'b23add') ]));
  const F = S.fr;
  if (!F) col.appendChild(el('div', {
   class: 'sm',
   text: 'LOADING...'
  })); else {
   for (const x of F.inc) col.appendChild(el('div', {
    class: 'row inc23'
   }, [ el('span', {
    class: 'n',
    text: x.u + ' WANTS TO BE FRIENDS'
   }), btn('ACCEPT', 'g', () => frAct('ok', x.u)), btn('NO', 'r', () => frAct('no', x.u)) ]));
   for (const x of F.friends) col.appendChild(el('div', {
    class: 'row fr23',
    'data-u': x.u
   }, [ el('span', {
    class: 'dot' + (x.on ? ' on' : '')
   }), el('span', {
    class: 'n',
    text: x.u
   }), el('span', {
    class: 'sm',
    text: x.on ? 'ONLINE' : 'SEEN ' + ago(x.ago)
   }), btn('INVITE', 'l', () => invite(x.u)), !pick && window.V24 && V24.on() ? btn('TRADE', 'y', () => window.V27 && V27.ttOn && V27.ttOn() ? V27.ttOpen(x.u) : V24.open(x.u)) : null, btn('X', 'w', () => {
    if (confirm('REMOVE ' + x.u.toUpperCase() + ' FROM YOUR FRIENDS?')) frAct('no', x.u);
   }) ]));
   if (!pick && window.V24 && V24.on()) V24.rowsInto(col, el, btn);
   for (const x of F.out) col.appendChild(el('div', {
    class: 'row out23'
   }, [ el('span', {
    class: 'n',
    text: 'WAITING FOR ' + x.u
   }), btn('CANCEL', 'w', () => frAct('no', x.u)) ]));
   if (!F.inc.length && !F.friends.length && !F.out.length) col.appendChild(el('div', {
    class: 'sm',
    text: 'NO FRIENDS YET - ADD ONE BY USERNAME ABOVE. YOURS IS ' + A.u + '.'
   })); else col.appendChild(el('div', {
    class: 'sm',
    style: 'margin-top:4px',
    text: on2312() ? pickSeason ? 'INVITE = HE GETS A JOIN BANNER FOR YOUR SEASON.' : 'INVITE = MAKES AN ONLINE GAME AND SENDS HIM A JOIN BANNER.' : 'INVITE = MAKES AN ONLINE GAME AND SENDS IT TO HIM. NO CODE.'
   }));
  }
 }
 function render() {
  if (!root || !open) return;
  root.textContent = '';
  const ttl = on2312() && gate && !A.tok ? 'SIGN IN TO PLAY ONLINE' : on2312() && pick && A.tok ? pickSeason ? 'INVITE FRIENDS TO YOUR SEASON' : 'INVITE A FRIEND TO PLAY' : A.tok ? 'FRIENDS + CLOUD SAVE' : 'ACCOUNT + CLOUD SAVE';
  const top = el('div', {
   class: 'top'
  }, [ el('h1', {
   text: ttl
  }), btn(on2312() && (pick || gate) ? 'BACK' : 'CLOSE', 'w', close, 'c23close') ]);
  root.appendChild(top);
  if (on2312() && gate && !A.tok) root.appendChild(el('div', {
   class: 'ok',
   id: 'g23',
   text: 'ONLINE IS INVITE-ONLY: SIGN IN OR MAKE AN ACCOUNT, ADD YOUR FRIENDS, THEN INVITE THEM.'
  }));
  root.appendChild(el('div', {
   class: 'err',
   id: 'e23',
   text: S.err || ''
  }));
  root.appendChild(el('div', {
   class: 'ok',
   id: 'm23',
   text: S.msg || ''
  }));
  const left = el('div', {
   class: 'col'
  }), right = el('div', {
   class: 'col'
  });
  if (!A.tok) {
   left.appendChild(el('div', {
    class: 'tabs'
   }, [ btn('NEW ACCOUNT', tab === 'new' ? 'on' : '', () => {
    tab = 'new';
    S.err = '';
    render();
   }, 't23new'), btn('SIGN IN', tab === 'in' ? 'on' : '', () => {
    tab = 'in';
    S.err = '';
    render();
   }, 't23in') ]));
   const u = el('input', {
    id: 'u23',
    autocomplete: 'username',
    autocapitalize: 'none',
    spellcheck: 'false',
    maxlength: '14',
    placeholder: tab === 'new' ? 'PICK A USERNAME (3-14: A-Z 0-9 _)' : 'USERNAME'
   });
   const p = el('input', {
    id: 'p23in',
    type: 'password',
    autocomplete: tab === 'new' ? 'new-password' : 'current-password',
    maxlength: '64',
    placeholder: tab === 'new' ? 'MAKE A PIN OR PASSWORD (4+)' : 'PIN OR PASSWORD'
   });
   if (tab === 'new') try {
    const n = window.RLNET && RLNET.uname();
    if (n) u.value = n;
   } catch (e) {}
   left.appendChild(u);
   left.appendChild(p);
   left.appendChild(btn(S.busy ? '...' : tab === 'new' ? 'MAKE ACCOUNT' : 'SIGN IN', 'g', () => {
    if (!S.busy) signIn(tab === 'new', u.value, p.value);
   }, 'b23go'));
   left.appendChild(el('div', {
    class: 'sm',
    text: tab === 'new' ? 'NOBODY ELSE CAN USE YOUR USERNAME. YOUR PIN KEEPS THE ACCOUNT YOURS - DON\'T FORGET IT.' : 'SIGN IN ON ANY PHONE (OR THE HOME-SCREEN APP) TO GET YOUR SAVE THERE.'
   }));
   right.appendChild(el('h2', {
    text: 'WHY MAKE ONE'
   }));
   for (const t of [ 'BACKS UP YOUR SAVE: LEVEL, CHINOS, CARDS, ITEMS, SEASONS', 'PLAY THE SAME SAVE ON ANOTHER PHONE', on2312() ? 'ADD FRIENDS + INVITE THEM TO ONLINE GAMES' : 'ADD FRIENDS + INVITE THEM TO ONLINE GAMES (NO CODE)', 'SEE WHO IS ONLINE' ]) right.appendChild(el('div', {
    class: 'sm',
    text: '+ ' + t
   }));
  } else {
   if (pick && on2312()) {
    friendsInto(left);
    right.appendChild(el('h2', {
     text: 'HOW IT WORKS'
    }));
    for (const t of [ pickSeason ? 'TAP INVITE NEXT TO A FRIEND' : 'TAP INVITE NEXT TO A FRIEND - YOUR GAME OPENS', 'HE GETS A NOTIFICATION + A JOIN BANNER', 'HE TAPS JOIN AND HE IS IN YOUR LOBBY', 'NOT FRIENDS YET? ADD HIM BY USERNAME' ]) right.appendChild(el('div', {
     class: 'sm',
     text: '+ ' + t
    }));
    if (pushState() !== 'on') right.appendChild(btn('ENABLE NOTIFICATIONS', 'l', enablePush, 'b23push'));
    root.appendChild(el('div', {
     class: 'cols'
    }, [ left, right ]));
    return;
   }
   left.appendChild(el('h2', {
    text: 'SIGNED IN AS ' + A.u
   }));
   const cs = sumOf(snap());
   left.appendChild(el('div', {
    id: 's23',
    text: 'CLOUD SAVE: ' + (A.pend ? 'WAITING FOR YOUR CHOICE' : dirty() ? 'SYNCING...' : A.at ? 'SAVED ' + ago(Date.now() - A.at) : 'ON')
   }));
   left.appendChild(el('div', {
    class: 'sm',
    text: sumLine(cs)
   }));
   left.appendChild(el('div', {}, [ btn('SYNC NOW', 'y', async () => {
    S.err = '';
    S.msg = '';
    const r = await put(false, 'button');
    if (r && r.ok) S.msg = 'SAVED TO THE CLOUD'; else if (r && !r.conflict) S.err = r.error || 'NO CONNECTION';
    render();
   }, 'b23sync'), ls.get(BAK) ? btn('UNDO LAST LOAD', 'w', () => {
    if (confirm('PUT BACK THE SAVE THIS PHONE HAD BEFORE THE LAST CLOUD LOAD?')) V23.undoLoad();
   }, 'b23undo') : null, btn('SIGN OUT', 'w', () => signOut(), 'b23out') ]));
   left.appendChild(el('h2', {
    text: 'NOTIFICATIONS',
    style: 'margin-top:8px'
   }));
   const ps = pushState();
   if (ps === 'on') left.appendChild(el('div', {}, [ el('span', {
    class: 'ok',
    text: 'ON  '
   }), btn('TEST', 'w', async () => {
    const r = await api('/push/test', {
     title: 'BAGGA LAX',
     body: 'NOTIFICATIONS ARE ON'
    });
    S.msg = r.r && r.r.sent ? 'TEST SENT' : 'TEST DID NOT SEND';
    render();
   }, 'b23test'), btn('TURN OFF', 'w', disablePush, 'b23poff') ])); else left.appendChild(btn('ENABLE NOTIFICATIONS', 'l', enablePush, 'b23push'));
   left.appendChild(el('div', {
    class: 'sm',
    id: 'n23',
    text: ps === 'ios-tab' ? 'IPHONE: ADD BAGGA LAX TO YOUR HOME SCREEN (SHARE > ADD TO HOME SCREEN), OPEN IT FROM THERE, THEN TAP ENABLE.' : ps === 'denied' ? 'BLOCKED: ALLOW NOTIFICATIONS FOR BAGGA LAX IN YOUR PHONE SETTINGS.' : ps === 'none' ? 'THIS BROWSER CAN\'T DO NOTIFICATIONS.' : 'GAME INVITES, FRIEND REQUESTS, NEW WEEKLY CHALLENGES AND NEW UPDATES.'
   }));
   friendsInto(right);
  }
  root.appendChild(el('div', {
   class: 'cols'
  }, [ left, right ]));
 }
 V23.render = render;
 function renderPrompt() {
  if (!pbox) mount();
  if (!prompt) {
   pbox.style.display = 'none';
   return;
  }
  const loc = sumOf(snap()), cl = prompt.cloud && prompt.cloud.sum || {};
  const best = (a, b) => (a | 0) > (b | 0) ? 'best' : '';
  const col = (title, s, o, when) => el('div', {}, [ el('b', {
   text: title
  }), el('div', {
   class: 'sm',
   text: when
  }), el('div', {
   class: best(s.lvl, o.lvl),
   text: 'LEVEL ' + (s.lvl | 0)
  }), el('div', {
   class: best(s.chinos, o.chinos),
   text: 'CHINOS ' + (s.chinos | 0)
  }), el('div', {
   class: best(s.cards, o.cards),
   text: 'CARDS ' + (s.cards | 0)
  }), el('div', {
   class: best(s.items, o.items),
   text: 'ITEMS ' + (s.items | 0)
  }), el('div', {
   class: best(s.wins, o.wins),
   text: 'WINS ' + (s.wins | 0)
  }) ]);
  const head = prompt.kind === 'first' ? 'YOUR ACCOUNT ALREADY HAS A CLOUD SAVE' : prompt.kind === 'newer' ? 'NEWER SAVE FROM YOUR OTHER DEVICE' : 'TWO DIFFERENT SAVES';
  const sub = prompt.kind === 'first' ? 'PICK WHICH SAVE TO PLAY ON THIS PHONE.' : prompt.kind === 'newer' ? 'YOU PLAYED ON ANOTHER DEVICE. LOAD THAT SAVE HERE?' : 'THIS PHONE AND THE CLOUD BOTH CHANGED. PICK ONE.';
  pbox.textContent = '';
  const box = el('div', {
   class: 'box',
   id: 'p23box',
   'data-kind': prompt.kind
  }, [ el('h2', {
   text: head
  }), el('div', {
   class: 'sm',
   text: sub
  }), el('div', {
   class: 'two'
  }, [ col('THIS PHONE', loc, cl, isEmpty(loc) ? 'NEW / EMPTY SAVE' : 'ON THIS DEVICE'), col('CLOUD SAVE', cl, loc, 'SAVED ' + ago(Date.now() - (prompt.cloud.t || Date.now()))) ]), el('div', {
   class: 'err',
   text: S.err || ''
  }), el('div', {}, [ btn('USE CLOUD SAVE', 'g', async () => {
   S.err = '';
   await useCloud();
  }, 'p23cloud'), btn('KEEP THIS PHONE\'S SAVE', 'y', async () => {
   S.err = '';
   const p = prompt;
   prompt = null;
   renderPrompt();
   A.pend = 0;
   saveA();
   const r = await put(true, 'keep local');
   if (!r || !r.ok) {
    prompt = p;
    A.pend = 1;
    S.err = r && r.error || 'NO CONNECTION - TRY AGAIN';
    renderPrompt();
   }
  }, 'p23local'), prompt.kind !== 'first' ? btn('LATER', 'w', () => {
   A.skip = prompt.cloud.rev;
   A.pend = 0;
   saveA();
   prompt = null;
   promptQ = null;
   renderPrompt();
  }, 'p23later') : null ]), el('div', {
   class: 'sm',
   text: 'THE ONE YOU DON\'T PICK IS KEPT AS A BACKUP.'
  }) ]);
  pbox.appendChild(box);
  pbox.style.display = 'flex';
 }
 V23.prompt = () => prompt || promptQ;
 function renderInvite() {
  if (!ibox) mount();
  const i = S.inv && S.inv[0];
  if (!i || !A.tok) {
   ibox.style.display = 'none';
   return;
  }
  ibox.textContent = '';
  ibox.appendChild(el('span', {
   text: i.fr + (on2312() && i.kind === 'season' ? ' INVITED YOU TO HIS ONLINE SEASON' : ' INVITED YOU TO PLAY ONLINE')
  }));
  ibox.appendChild(btn('JOIN', 'l', () => joinInvite(i, true), 'i23join'));
  ibox.lastChild.style.background = '#b6ff3a';
  ibox.appendChild(btn('NO', 'w', () => joinInvite(i, false), 'i23no'));
  ibox.lastChild.style.background = '#c9d6d9';
  ibox.style.display = 'flex';
 }
 let pick = false, pickSeason = null, gate = false;
 function openP(t, o) {
  mount();
  o = o || {};
  pick = !!o.pick;
  pickSeason = o.season || null;
  gate = !!o.gate;
  open = true;
  S.err = '';
  S.msg = '';
  if (t) tab = t;
  root.style.display = 'block';
  render();
  if (A.tok) {
   loadFriends();
   hb();
   refreshPush().then(render);
  }
 }
 function close() {
  const wasGate = gate;
  open = false;
  pick = false;
  pickSeason = null;
  gate = false;
  if (root) root.style.display = 'none';
  if (wasGate && on2312() && !A.tok) try {
   if (typeof screen !== 'undefined' && screen === 'online') screen = 'menu';
  } catch (e) {}
 }
 V23.open = openP;
 V23.close = close;
 V23.isOpen = () => open;
 V23.label = () => {
  const n = (S.freq | 0) + (S.inv ? S.inv.length : 0) + (window.V24 && V24.on() ? V24.incN() : 0);
  return n ? 'FRIENDS (' + n + ')' : 'FRIENDS';
 };
 function boot() {
  mount();
  setInterval(() => {
   try {
    tick();
   } catch (e) {
    log('tick ' + e);
   }
  }, 4e3);
  setInterval(() => {
   let fast = false;
   try {
    fast = on2312() && typeof screen !== 'undefined' && (screen === 'online' || screen === 'onSeason');
   } catch (e) {}
   if (document.visibilityState === 'visible' && Date.now() - hbT > (fast ? 5e3 : 25e3)) hb();
   showPromptIfSafe();
  }, 1e3);
  document.addEventListener('visibilitychange', () => {
   if (document.visibilityState === 'hidden') pagePut(); else {
    hb();
    refreshPush();
   }
  });
  window.addEventListener('pagehide', pagePut);
  if (A.pend && A.tok) {
   A.pend = 0;
   saveA();
  }
  if (A.tok) {
   setTimeout(hb, 1200);
  }
  setTimeout(refreshPush, 2500);
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
