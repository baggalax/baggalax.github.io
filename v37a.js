(function() {
 'use strict';
 const on = () => !window.__rl_no37a && !window.__rl_v124gb && !!window.V23;
 const SKIPK = 'rlx_acct37skip', DAY = 24 * 3600 * 1e3;
 const A37 = window.A37 = {
  shown: false,
  open: false,
  log: [],
  reason: ''
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
  } catch (e) {}
 };
 const skipOn = () => window.__rl_37skip !== false;
 const offline = () => {
  try {
   if (navigator.onLine === false) return true;
   const S = V23.st;
   return !!(S && /NO CONNECTION/.test(S.err || ''));
  } catch (e) {
   return false;
  }
 };
 function due() {
  if (!on() || A37.shown) return false;
  try {
   if (V23.signedIn()) return false;
  } catch (e) {
   return false;
  }
  const t = +lsg(SKIPK) || 0;
  if (t && Date.now() - t < DAY && Date.now() >= t) return false;
  return true;
 }
 A37.due = due;
 function introUp() {
  const e = document.getElementById('intro30skip');
  return !!(e && e.offsetParent);
 }
 function ready() {
  let s = '';
  try {
   s = screen;
  } catch (e) {
   return false;
  }
  if (s !== 'menu' || introUp()) return false;
  try {
   if (V23.isOpen()) return false;
  } catch (e) {}
  try {
   if (typeof game !== 'undefined' && game && !game.over) return false;
  } catch (e) {}
  try {
   if (window.TUT26 && (TUT26.need && TUT26.need() || TUT26.active && TUT26.active())) return false;
  } catch (e) {}
  return true;
 }
 function openGate() {
  A37.shown = true;
  A37.open = true;
  A37.log.push('open ' + Date.now());
  try {
   V23.open('new');
  } catch (e) {
   console.error(e);
   A37.open = false;
   return;
  }
  const root = document.getElementById('acct23');
  if (!root) {
   A37.open = false;
   return;
  }
  root.classList.add('a37');
  if (!A37.mo) {
   A37.mo = new MutationObserver(() => {
    try {
     decorate();
    } catch (e) {
     console.error(e);
    }
   });
   A37.mo.observe(root, {
    childList: true
   });
  }
  decorate();
 }
 A37.openGate = openGate;
 function closeGate(why) {
  A37.open = false;
  A37.reason = why;
  A37.log.push('close ' + why);
  const root = document.getElementById('acct23');
  if (root) root.classList.remove('a37');
  try {
   V23.close();
  } catch (e) {}
  try {
   if (typeof screen !== 'undefined') screen = 'menu';
  } catch (e) {}
  runPend();
 }
 A37.close = closeGate;
 function skip() {
  lss(SKIPK, String(Date.now()));
  closeGate('skip');
  try {
   menuMsg = {
    s: 'NO ACCOUNT YET: TAP FRIENDS TO MAKE ONE',
    t: 2.6
   };
  } catch (e) {}
 }
 A37.skip = skip;
 const mk = (tag, props, kids) => {
  const e = document.createElement(tag);
  Object.assign(e, props || {});
  for (const k of kids || []) e.appendChild(k);
  return e;
 };
 function decorate() {
  if (!A37.open) return;
  const root = document.getElementById('acct23');
  if (!root) return;
  try {
   if (!V23.isOpen()) {
    A37.open = false;
    root.classList.remove('a37');
    A37.log.push('closed elsewhere');
    return;
   }
  } catch (e) {}
  if (V23.signedIn()) {
   let u = '';
   try {
    u = (V23.A().u || '').toUpperCase();
   } catch (e) {}
   setTimeout(() => {
    if (!A37.open) return;
    closeGate('signed-in');
    try {
     menuMsg = {
      s: (u ? 'SIGNED IN AS ' + u + ' - ' : '') + 'YOUR SAVE IS BACKED UP',
      t: 2.8
     };
    } catch (e) {}
   }, 900);
   return;
  }
  if (root.querySelector('#a37lead')) {
   syncSkip(root);
   return;
  }
  const isNew = !!root.querySelector('#t23new.on');
  const h1 = root.querySelector('.top h1');
  if (h1) h1.textContent = isNew ? 'STEP 1: MAKE YOUR ACCOUNT' : 'STEP 1: SIGN IN';
  const cl = root.querySelector('#c23close');
  if (cl) cl.style.display = 'none';
  const lead = mk('div', {
   id: 'a37lead',
   textContent: 'YOUR ACCOUNT BACKS UP YOUR SAVE (CARDS, CHINOS, SEASONS) AND YOU NEED ONE TO PLAY ONLINE AND ADD FRIENDS. IT TAKES 10 SECONDS.'
  });
  const top = root.querySelector('.top');
  if (top && top.nextSibling) root.insertBefore(lead, top.nextSibling); else root.appendChild(lead);
  const tn = root.querySelector('#t23new'), ti = root.querySelector('#t23in');
  if (tn) tn.textContent = 'NEW HERE? MAKE AN ACCOUNT';
  if (ti) ti.textContent = 'HAVE ONE? SIGN IN';
  const go = root.querySelector('#b23go');
  if (go && go.textContent !== '...') go.textContent = isNew ? 'MAKE MY ACCOUNT' : 'SIGN IN';
  const ph = root.querySelector('#u23');
  if (ph && !isNew) ph.placeholder = 'YOUR USERNAME';
  const foot = mk('div', {
   id: 'a37foot'
  });
  const a = mk('button', {
   id: 'a37skip',
   type: 'button',
   textContent: 'PLAY OFFLINE FOR NOW'
  });
  a.addEventListener('click', e => {
   e.preventDefault();
   e.stopPropagation();
   skip();
  });
  foot.appendChild(a);
  root.appendChild(foot);
  syncSkip(root);
 }
 function syncSkip(root) {
  const f = root.querySelector('#a37foot');
  if (f) f.style.display = skipOn() || offline() ? 'block' : 'none';
 }
 const css = '#acct23.a37 .top h1{color:#ffe14d;font-size:20px}#a37lead{color:#fff;font-size:12px;margin:0 0 6px;padding:5px 7px;background:#13202b;border-left:4px solid #7dff7a}' + '#acct23.a37 .tabs{display:flex;gap:6px;margin-bottom:6px}#acct23.a37 .tabs button{flex:1;padding:9px 6px;font-size:12px;border:2px solid #2cc4dc;margin:0}#acct23.a37 .tabs button.on{border-color:#fff;background:#b6ff3a;color:#0b1a20}' + '#acct23.a37 #b23go{width:100%;padding:10px;font-size:14px;margin:4px 0}' + '#a37foot{text-align:center;margin-top:8px;padding-bottom:max(4px,env(safe-area-inset-bottom))}#acct23 #a37skip{background:none;box-shadow:none;color:#8fe3f0;text-decoration:underline;font-size:11px;padding:6px 10px}';
 try {
  const st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
 } catch (e) {}
 if (typeof window.startTutorial === 'function') {
  const ST0 = window.startTutorial;
  window.startTutorial = function() {
   if (on() && A37.open) {
    A37.pendTut = Array.prototype.slice.call(arguments);
    A37.log.push('tutorial held');
    return;
   }
   return ST0.apply(this, arguments);
  };
 }
 function runPend() {
  const a = A37.pendTut;
  A37.pendTut = null;
  if (a) setTimeout(() => {
   try {
    if (screen === 'menu' && !(typeof game !== 'undefined' && game)) window.startTutorial.apply(window, a);
   } catch (e) {
    console.error(e);
   }
  }, 400);
 }
 let n = 0;
 const iv = setInterval(() => {
  n++;
  try {
   if (!on()) return;
   if (A37.open) {
    const root = document.getElementById('acct23');
    if (root) syncSkip(root);
    if (!V23.isOpen()) {
     A37.open = false;
     if (root) root.classList.remove('a37');
     runPend();
    }
    return;
   }
   if (A37.shown) {
    clearInterval(iv);
    return;
   }
   if (due() && ready()) openGate(); else if (!due()) {
    A37.shown = true;
   }
  } catch (e) {
   console.error(e);
  }
 }, 300);
})();
