'use strict';

const V35SC = (() => {
 const off = () => !!window.__rl_no35scroll;
 const LOG = {
  on: 0,
  off: 0,
  keep: 0,
  top: 0,
  errs: []
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 20) LOG.errs.shift();
  } catch (x) {}
 };
 const P = () => document.getElementById('panel');
 let lastScr = '', lastTop = 0, mo = null;
 function css() {
  if (document.getElementById('sc35css')) return;
  const s = document.createElement('style');
  s.id = 'sc35css';
  s.textContent = [ '#panel[data-sc35]{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}', '#panel[data-sc35="pop"]{overflow-y:hidden}', '#panel[data-sc35]>.pop17{top:var(--sc35,0px);bottom:calc(0px - var(--sc35,0px))}' ].join('\n');
  (document.head || document.documentElement).appendChild(s);
 }
 function overflowPx(p) {
  const pr = p.getBoundingClientRect(), pb = parseFloat(getComputedStyle(p).paddingBottom) || 0;
  let bot = 0;
  for (const c of p.children) {
   const ps = getComputedStyle(c).position;
   if (ps === 'absolute' || ps === 'fixed') continue;
   const r = c.getBoundingClientRect();
   if (r.height || r.width) bot = Math.max(bot, r.bottom);
  }
  const end = bot - pr.top - (p.clientTop || 0) + p.scrollTop, room = p.clientHeight - pb;
  return Math.max(end - room, p.scrollHeight - p.clientHeight - 1);
 }
 const shown = p => !!p && p.style.display !== 'none' && !!p.dataset.scr;
 const hasPop = p => {
  for (const c of p.children) if (c.classList && c.classList.contains('pop17')) return true;
  return false;
 };
 function clear(p) {
  if (p.hasAttribute('data-sc35')) {
   p.removeAttribute('data-sc35');
   p.style.removeProperty('--sc35');
   LOG.off++;
  }
 }
 function check() {
  const p = P();
  if (!p) return;
  try {
   if (off() || !shown(p)) {
    clear(p);
    if (!shown(p)) {
     lastScr = '';
     lastTop = 0;
    }
    return;
   }
   const over = overflowPx(p) > .5;
   if (!over && !p.hasAttribute('data-sc35')) return;
   if (!over) {
    clear(p);
    return;
   }
   const want = hasPop(p) ? 'pop' : '1';
   if (p.getAttribute('data-sc35') !== want) {
    if (!p.hasAttribute('data-sc35')) LOG.on++;
    p.setAttribute('data-sc35', want);
   }
   p.style.setProperty('--sc35', p.scrollTop + 'px');
  } catch (e) {
   err(e, 'check');
  }
 }
 function onRedraw() {
  const p = P();
  if (!p) return;
  try {
   const scr = shown(p) ? p.dataset.scr : '';
   check();
   if (!p.hasAttribute('data-sc35')) {
    lastScr = scr;
    lastTop = 0;
    return;
   }
   if (scr && scr === lastScr) {
    if (Math.abs(p.scrollTop - lastTop) > 1) {
     p.scrollTop = lastTop;
     LOG.keep++;
    }
   } else {
    if (p.scrollTop) LOG.top++;
    p.scrollTop = 0;
   }
   lastScr = scr;
   lastTop = p.scrollTop;
   p.style.setProperty('--sc35', p.scrollTop + 'px');
  } catch (e) {
   err(e, 'redraw');
  }
 }
 function boot() {
  const p = P();
  if (!p) {
   setTimeout(boot, 200);
   return;
  }
  css();
  p.addEventListener('scroll', () => {
   if (!p.hasAttribute('data-sc35')) return;
   lastTop = p.scrollTop;
   lastScr = p.dataset.scr || '';
   p.style.setProperty('--sc35', p.scrollTop + 'px');
  }, {
   passive: true
  });
  try {
   mo = new MutationObserver(() => onRedraw());
   mo.observe(p, {
    childList: true,
    attributes: true,
    attributeFilter: [ 'data-scr' ]
   });
  } catch (e) {
   err(e, 'mo');
  }
  window.addEventListener('resize', check);
  window.addEventListener('orientationchange', () => setTimeout(check, 300));
  setInterval(check, 400);
  check();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {
  once: true
 }); else boot();
 return {
  LOG: LOG,
  check: check,
  off: off,
  overflowPx: () => {
   const p = P();
   return p ? overflowPx(p) : 0;
  }
 };
})();
