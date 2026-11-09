(function() {
 'use strict';
 const SIDE = 'left';
 const off = () => !!(window.__rl_no40card || window.__rl_v124gb);
 const V = window.V40CARD = {
  SIDE: SIDE,
  log: []
 };
 const panel = document.getElementById('panel');
 if (!panel || typeof syncPanel !== 'function') return;
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 const CSS = [ '#panel .pbox17.v40big{box-sizing:border-box;width:calc(100% - 10px);height:calc(100% - 10px);max-width:none;max-height:none;position:relative;padding:6px 8px;display:flex;flex-direction:column;overflow:hidden}', '#panel .v40big .pcard17{flex:1 1 auto;min-height:0;display:flex;gap:12px;align-items:stretch;justify-content:center;margin:0}', '#panel .v40big.v40r .pcard17{flex-direction:row-reverse}', '#panel .v40big .v40cl{flex:0 0 50%;max-width:50%;min-width:0;display:flex;align-items:center;justify-content:center;overflow:hidden}', '#panel .v40big .v40cl>*{flex:0 0 auto;margin:0}', '#panel .v40big .v40cl img,#panel .v40big .v40cl canvas{image-rendering:pixelated;image-rendering:crisp-edges}', '#panel .v40big .pi17{flex:1 1 0;min-width:0;display:flex;flex-direction:column;justify-content:center;font-size:12px;line-height:1.3;gap:6px;overflow-y:auto;padding:4px 36px 4px 0;align-self:stretch}', '#panel .v40big .pi17>.pt17{font-size:16px;text-align:left;margin:0 0 2px;padding:0}', '#panel .v40big .pi17>.v40btns{display:flex;flex-direction:column;align-items:stretch;gap:6px;margin-top:4px}', '#panel .v40big .pi17>.v40btns>button,#panel .v40big .pi17>.v40btns>.row>button{min-height:34px;white-space:nowrap}', '#panel .v40big .pi17>.v40btns>.row{justify-content:flex-start;flex-wrap:wrap;gap:6px;margin:0}', '#panel .v40big .v40x{position:absolute;top:4px;right:4px;width:32px;height:32px;min-width:32px;padding:0;font:bold 14px/1 inherit;color:#fff;background:#a03030;border:2px solid #05080b;box-shadow:0 2px 0 #000;border-radius:3px;z-index:3;cursor:pointer}' ].join('\n');
 function style() {
  if (document.getElementById('v40cardCss')) return;
  const s = document.createElement('style');
  s.id = 'v40cardCss';
  s.textContent = CSS;
  document.head.appendChild(s);
 }
 function fit(box) {
  const card = box.querySelector('.v40cl>:first-child');
  if (!card) return;
  card.style.zoom = '';
  const col = card.parentNode, r = card.getBoundingClientRect(), cr = col.getBoundingClientRect();
  if (!r.height || !r.width || !cr.height || !cr.width) return;
  let z = Math.min((cr.height - 4) / r.height, (cr.width - 4) / r.width);
  z = Math.max(1, Math.min(8, Math.floor(z * 50) / 50));
  card.style.zoom = String(z);
  for (let i = 0; i < 16 && z > 1; i++) {
   const q = card.getBoundingClientRect(), k = col.getBoundingClientRect();
   if (q.height <= k.height + 1 && q.width <= k.width + 1) break;
   z = Math.max(1, Math.floor(z * .95 * 50) / 50);
   card.style.zoom = String(z);
  }
  V.lastZoom = z;
 }
 function big(box) {
  if (!box || box.classList.contains('v40big')) return;
  const pc = box.querySelector(':scope>.pcard17');
  if (!pc) return;
  const card = [ ...pc.children ].find(e => !e.classList.contains('pi17'));
  if (!card) return;
  const info = pc.querySelector(':scope>.pi17');
  box.classList.add('v40big');
  if (SIDE === 'right') box.classList.add('v40r');
  const col = document.createElement('div');
  col.className = 'v40cl';
  pc.insertBefore(col, card);
  col.appendChild(card);
  const row = [ ...box.children ].filter(e => e.classList.contains('row')).pop();
  const t = box.querySelector(':scope>.pt17');
  if (info) {
   if (t) info.insertBefore(t, info.firstChild);
   const st = document.createElement('div');
   st.className = 'v40btns';
   const eq = box.querySelector('[data-a="v28equip"]');
   if (eq) st.appendChild(eq);
   if (row) {
    row.classList.add('v40row');
    if (row.children.length) st.appendChild(row); else row.remove();
   }
   if (st.children.length) info.appendChild(st);
  }
  const pop = box.closest('.pop17'), ca = pop && pop.dataset.a;
  if (ca) {
   const x = document.createElement('button');
   x.type = 'button';
   x.className = 'v40x';
   x.dataset.a = ca;
   x.dataset.v = 'x';
   x.setAttribute('aria-label', 'CLOSE');
   x.textContent = 'X';
   box.appendChild(x);
  }
  fit(box);
  V.log.push('big ' + (card.getAttribute('aria-label') || ''));
 }
 V.apply = function() {
  if (off()) return;
  style();
  panel.querySelectorAll('.pop17>.pbox17').forEach(big);
 };
 const RC = [ '#cfd6dc', '#7fb4ff', '#ffe14d' ];
 function idOf(card) {
  try {
   const fl = card.closest('.fl17');
   if (fl && V17.lastPack && V17.lastPack()) {
    const P = V17.lastPack(), i = +fl.dataset.v;
    if (P.cards && P.cards[i]) return P.cards[i];
   }
   const nm = (card.querySelector('.nm') || {}).textContent || '', src = ((card.querySelector('.art img') || {}).getAttribute || (() => ''))('src') || '';
   const L = (V17.I || []).filter(it => it && it.n === nm);
   if (L.length === 1) return L[0].id;
   for (const it of L) {
    try {
     if (V17.iconUrl(it.id, false) === src || V17.iconUrl(it.id, true) === src) return it.id;
    } catch (e) {}
   }
   return L.length ? L[0].id : null;
  } catch (e) {
   return null;
  }
 }
 V.idOf = idOf;
 function own(html, title, col, info, btns) {
  close();
  const d = document.createElement('div');
  d.className = 'pop17 v40own';
  d.dataset.a = 'v40close';
  d.dataset.v = 'bg';
  d.innerHTML = '<div class="pbox17" data-a="v17noop"><div class="pt17" style="color:' + col + '">' + esc(title) + '</div><div class="pcard17">' + html + '<div class="pi17">' + info + '</div></div>' + '<div class="row" style="justify-content:center">' + btns + '<button type="button" data-a="v40close" class="g">CLOSE</button></div></div>';
  panel.appendChild(d);
  style();
  big(d.querySelector('.pbox17'));
  V.openOwn = {
   scr: panel.dataset.scr,
   title: title
  };
  return d;
 }
 function close() {
  panel.querySelectorAll('.pop17.v40own').forEach(e => e.remove());
  V.openOwn = null;
 }
 V.close = close;
 function openFor(card) {
  const id = idOf(card), it = id && V17.BY && V17.BY[id];
  const clone = card.cloneNode(true);
  clone.removeAttribute('data-a');
  clone.removeAttribute('data-v');
  clone.classList.remove('sel', 'h17');
  const rr = (card.querySelector('.rr') || {}).textContent || '';
  if (!it) {
   own(clone.outerHTML, (card.querySelector('.nm') || {}).textContent || 'CARD', '#fff', '<span>' + esc(rr) + '</span>', '');
   return;
  }
  const S = V17.ST(), n = S.inv && S.inv[id] || 0, lockd = card.classList.contains('lk');
  let what = '';
  try {
   what = V17.effectText(it);
  } catch (e) {}
  let info = '<span><b>' + esc(rr) + '</b>' + (it.slotName ? ' - ' + esc(it.slotName) : '') + '</span>';
  if (it.d) info += '<span><b>WHAT IT IS:</b> ' + esc(it.d) + '</span>';
  if (what) info += '<span><b>WHAT IT DOES:</b> ' + esc(what) + '</span>';
  if (!lockd) info += '<span>YOU OWN X' + n + '</span>';
  let btns = '';
  try {
   if (it.leg20 && n > 0 && window.V361 && V361.legBtn) btns += V361.legBtn(it);
  } catch (e) {}
  const slot = card.closest('.cs17');
  if (slot && slot.dataset.v) btns += '<button type="button" data-a="v40cslot" data-v="' + esc(slot.dataset.v) + '" class="y">PICK ANOTHER</button>';
  own(clone.outerHTML, it.n, RC[it.leg20 ? 2 : it.rar] || '#fff', info, btns);
 }
 V.openFor = openFor;
 function target(el) {
  const c = el && el.closest && el.closest('.c17');
  if (!c || !panel.contains(c) || c.closest('.pop17')) return null;
  const fl = c.closest('.fl17');
  if (fl) return fl.classList.contains('on') ? c : null;
  if (c.closest('.hwg16')) return c;
  if (c.closest('.cs17') && c.closest('.crew17')) return c;
  return null;
 }
 panel.addEventListener('click', ev => {
  if (off()) return;
  const c = target(ev.target);
  if (!c) return;
  ev.preventDefault();
  ev.stopImmediatePropagation();
  try {
   if (typeof audioInit === 'function') audioInit();
   if (typeof SFX !== 'undefined' && SFX.tap) SFX.tap();
  } catch (e) {}
  try {
   openFor(c);
  } catch (e) {
   console.error(e);
  }
 }, true);
 function acts() {
  if (typeof PANEL_ACT === 'undefined' || PANEL_ACT.v40close) return;
  PANEL_ACT.v40close = () => {
   close();
   return typeof PANEL_KEEP !== 'undefined' ? PANEL_KEEP : undefined;
  };
  PANEL_ACT.v40cslot = v => {
   close();
   const s = panel.querySelector('.cs17[data-v="' + (window.CSS && CSS.escape ? CSS.escape(v) : v) + '"]');
   if (!(s && s.classList.contains('on')) && PANEL_ACT.v17cslot) PANEL_ACT.v17cslot(v);
  };
 }
 acts();
 const S0 = window.syncPanel;
 let first = null;
 window.syncPanel = function() {
  const r = S0.apply(this, arguments);
  if (panel.firstElementChild !== first) {
   first = panel.firstElementChild;
   V.openOwn = null;
   if (!off()) try {
    V.apply();
   } catch (e) {
    console.error(e);
   }
  }
  return r;
 };
 window.addEventListener('resize', () => {
  if (off()) return;
  setTimeout(() => {
   try {
    panel.querySelectorAll('.pbox17.v40big').forEach(fit);
   } catch (e) {}
  }, 60);
 });
})();
