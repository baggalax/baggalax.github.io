(function() {
 'use strict';
 const off = () => !!window.__rl_no35lrscroll;
 const LOG = {
  wraps: 0,
  skips: 0
 };
 let depth = 0;
 function css() {
  if (document.getElementById('lr35css')) return;
  const s = document.createElement('style');
  s.id = 'lr35css';
  s.textContent = [ '#panel #lr35s.lr35w{display:flex;flex-direction:column;gap:5px;flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;border:0;background:none}', '#panel #lr35s.lr35w>*{flex:0 0 auto}', '#panel #lr35s.lr35w>#lockList{flex:1 0 auto;min-height:0;overflow:visible;max-height:none;height:auto}' ].join('\n');
  (document.head || document.documentElement).appendChild(s);
 }
 function wrap(h) {
  if (typeof h !== 'string' || h.indexOf('id="lockList"') < 0) return h;
  const t = document.createElement('template');
  t.innerHTML = h;
  const f = t.content, kids = [ ...f.children ];
  const L = kids.find(e => e.id === 'lockList');
  const tabs = kids.find(e => e.classList.contains('tabs') && e.querySelector('[data-a="v17sec"]'));
  if (!L || !tabs) {
   LOG.skips++;
   return h;
  }
  const i0 = kids.indexOf(tabs), i1 = kids.indexOf(L);
  if (i1 <= i0) {
   LOG.skips++;
   return h;
  }
  const nodes = [];
  for (let n = tabs.nextSibling; n && n !== L; n = n.nextSibling) nodes.push(n);
  const w = document.createElement('div');
  w.className = 'scroll lr35w';
  w.id = 'lr35s';
  f.insertBefore(w, tabs.nextSibling);
  for (const n of nodes) w.appendChild(n);
  w.appendChild(L);
  LOG.wraps++;
  return t.innerHTML;
 }
 function hookRender() {
  if (typeof PANEL_RENDER === 'undefined' || typeof PANEL_RENDER.locker17 !== 'function' || PANEL_RENDER.locker17.__v35s) return false;
  const R0 = PANEL_RENDER.locker17;
  const R1 = function() {
   let h;
   depth++;
   try {
    h = R0.apply(this, arguments);
   } finally {
    depth--;
   }
   if (depth > 0 || off()) return h;
   try {
    return wrap(h);
   } catch (e) {
    console.error(e);
    return h;
   }
  };
  R1.__v35s = true;
  PANEL_RENDER.locker17 = R1;
  return true;
 }
 const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
 function fwd() {
  const L = document.getElementById('lockList'), w = document.getElementById('lr35s');
  if (!L || !w || L.parentNode !== w || L.__lr35) return;
  L.__lr35 = 1;
  try {
   Object.defineProperty(L, 'scrollTop', {
    configurable: true,
    get() {
     return desc.get.call(w);
    },
    set(v) {
     desc.set.call(w, v);
    }
   });
  } catch (e) {
   console.error(e);
  }
 }
 function hookPanel() {
  const pn = document.getElementById('panel');
  if (!pn || pn.__lr35) return;
  pn.__lr35 = 1;
  new MutationObserver(() => {
   try {
    fwd();
   } catch (e) {
    console.error(e);
   }
  }).observe(pn, {
   childList: true
  });
 }
 function init() {
  css();
  hookRender();
  hookPanel();
 }
 window.V35S = {
  LOG: LOG,
  wrap: wrap,
  on: () => !off()
 };
 init();
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
  try {
   init();
  } catch (e) {
   console.error(e);
  }
 });
 if (document.readyState !== 'complete') window.addEventListener('load', () => {
  try {
   init();
  } catch (e) {
   console.error(e);
  }
 });
 setTimeout(() => {
  try {
   init();
  } catch (e) {
   console.error(e);
  }
 }, 0);
})();
