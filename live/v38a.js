(function() {
 'use strict';
 const on = () => !window.__rl_no38a && !window.__rl_v124gb && !!window.V23;
 const DK = 'rlx_by38';
 const V = window.V38A = {
  open: false,
  busy: false,
  log: [],
  asked: 0
 };
 const lg = s => {
  V.log.push(s);
  if (V.log.length > 60) V.log.shift();
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
 const acct = () => {
  try {
   return V23.A() || {};
  } catch (e) {
   return {};
  }
 };
 const ul = () => String(acct().u || '').toLowerCase();
 function cached() {
  try {
   const o = JSON.parse(lsg(DK) || 'null');
   return o && o.u && o.u === ul() && Number.isInteger(o.y) ? o.y : null;
  } catch (e) {
   return null;
  }
 }
 V.year = () => cached();
 async function api(body) {
  try {
   const r = await fetch('/api/acct/by38', {
    method: 'POST',
    headers: {
     'content-type': 'application/json'
    },
    body: JSON.stringify(Object.assign({
     dev: window.RLNET && RLNET.dev || lsg('rl_dev') || '',
     tok: acct().tok
    }, body))
   });
   let j = null;
   try {
    j = await r.json();
   } catch (e) {
    j = null;
   }
   return j || {
    ok: false
   };
  } catch (e) {
   return {
    ok: false,
    net: true
   };
  }
 }
 let checkedFor = '', nextTry = 0;
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
   if (V23.isOpen && V23.isOpen()) return false;
  } catch (e) {}
  try {
   if (window.A37 && A37.open) return false;
  } catch (e) {}
  try {
   if (typeof game !== 'undefined' && game && !game.over) return false;
  } catch (e) {}
  return true;
 }
 async function tick() {
  if (!on() || V.busy) return;
  let signed = false;
  try {
   signed = V23.signedIn();
  } catch (e) {}
  if (V.open) {
   if (!signed) close();
   return;
  }
  if (!signed || !ul()) return;
  if (cached() != null) return;
  if (checkedFor === ul() || Date.now() < nextTry || !ready()) return;
  V.busy = true;
  try {
   const j = await api({});
   if (j && j.ok) {
    checkedFor = ul();
    if (Number.isInteger(j.y)) {
     lss(DK, JSON.stringify({
      u: ul(),
      y: j.y
     }));
     lg('server has ' + j.y);
    } else if (ready()) show(); else checkedFor = '';
   } else {
    nextTry = Date.now() + 6e4;
    lg('no answer ' + JSON.stringify(j).slice(0, 80));
   }
  } finally {
   V.busy = false;
  }
 }
 const css = document.createElement('style');
 css.textContent = '#by38{position:fixed;inset:0;z-index:96;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.78);font:bold 12px/1.3 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box}' + '#by38 .bx{background:#14222b;border-top:2px solid #8fe3f0;box-shadow:0 3px 0 #000;padding:10px 16px 12px;max-width:94%;width:340px;text-align:center;box-sizing:border-box}' + '#by38 h1{margin:0 0 4px;font-size:16px;color:#fff;text-shadow:2px 2px 0 #000;letter-spacing:.5px}#by38 p{margin:0 0 8px;font-size:10px;color:#9fb7c2}' + '#by38 select{font:bold 16px "Courier New",monospace;background:#0b1a20;color:#fff;border:2px solid #2cc4dc;padding:6px 8px;width:70%;margin:2px 0 10px;border-radius:0;-webkit-appearance:none;appearance:none;text-align:center;text-align-last:center}' + '#by38 button{font:bold 13px "Courier New",monospace;text-transform:uppercase;border:0;box-shadow:0 2px 0 #000;padding:8px 14px;margin:0 4px;cursor:pointer;min-width:110px;min-height:36px}' + '#by38 .go{background:#ffcc33;color:#0b1a20}#by38 .go[disabled]{background:#3a4a52;color:#7d8f97}#by38 .no{background:#2c4452;color:#cfe}#by38 .er{color:#ff9a8a;font-size:10px;min-height:13px;margin-top:6px}';
 document.head.appendChild(css);
 function el(t, a, kids) {
  const e = document.createElement(t);
  if (a) for (const k in a) {
   if (k === 'text') e.textContent = a[k]; else e.setAttribute(k, a[k]);
  }
  (kids || []).forEach(k => e.appendChild(k));
  return e;
 }
 function show() {
  if (document.getElementById('by38')) return;
  V.open = true;
  V.asked++;
  lg('show');
  const root = el('div', {
   id: 'by38',
   role: 'dialog',
   'aria-modal': 'true'
  }), box = el('div', {
   class: 'bx'
  });
  root.appendChild(box);
  (document.getElementById('stage') || document.body).appendChild(root);
  const yr = (new Date).getFullYear();
  function pick(sel) {
   box.innerHTML = '';
   box.appendChild(el('h1', {
    text: 'WHAT YEAR WERE YOU BORN?'
   }));
   box.appendChild(el('p', {
    text: 'ONE QUICK QUESTION FOR YOUR ACCOUNT. YOU ONLY ANSWER IT ONCE.'
   }));
   const s = el('select', {
    id: 'by38y',
    'aria-label': 'BIRTH YEAR'
   });
   s.appendChild(el('option', {
    value: '',
    text: 'YEAR'
   }));
   for (let y = yr; y >= yr - 100; y--) s.appendChild(el('option', {
    value: String(y),
    text: String(y)
   }));
   if (sel) s.value = String(sel);
   const go = el('button', {
    type: 'button',
    class: 'go',
    id: 'by38go',
    text: 'CONFIRM'
   });
   const sync = () => {
    go.disabled = !s.value;
   };
   s.addEventListener('change', sync);
   s.addEventListener('input', sync);
   sync();
   go.addEventListener('click', () => {
    if (s.value) sure(+s.value);
   });
   box.appendChild(s);
   box.appendChild(el('div', {}, [ go ]));
  }
  function sure(y) {
   box.innerHTML = '';
   box.appendChild(el('h1', {
    text: 'BORN IN ' + y + '?'
   }));
   box.appendChild(el('p', {
    text: 'THIS CAN\'T BE CHANGED LATER.'
   }));
   const yes = el('button', {
    type: 'button',
    class: 'go',
    id: 'by38yes',
    text: 'YES'
   }), no = el('button', {
    type: 'button',
    class: 'no',
    id: 'by38no',
    text: 'CHANGE'
   });
   const er = el('div', {
    class: 'er',
    id: 'by38er'
   });
   no.addEventListener('click', () => pick(y));
   yes.addEventListener('click', async () => {
    yes.disabled = true;
    no.disabled = true;
    er.textContent = 'SAVING...';
    const j = await api({
     y: y
    });
    if (j && j.ok && Number.isInteger(j.y)) {
     lss(DK, JSON.stringify({
      u: ul(),
      y: j.y
     }));
     lg('saved ' + j.y);
     close();
    } else {
     yes.disabled = false;
     no.disabled = false;
     er.textContent = j && j.net ? 'NO CONNECTION - TRY AGAIN' : j && j.error || 'COULD NOT SAVE - TRY AGAIN';
    }
   });
   box.appendChild(el('div', {}, [ yes, no ]));
   box.appendChild(er);
  }
  pick(null);
 }
 function close() {
  const r = document.getElementById('by38');
  if (r) r.remove();
  V.open = false;
 }
 V.show = show;
 V.close = close;
 V.tick = tick;
 V.reset = () => {
  checkedFor = '';
  nextTry = 0;
 };
 setInterval(() => {
  try {
   tick();
  } catch (e) {
   console.error(e);
  }
 }, 1200);
})();
