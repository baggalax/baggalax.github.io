(function() {
 'use strict';
 const off = () => !!(window.__rl_no40letty || window.__rl_v124gb);
 const noIcon = () => off() || !!window.__rl_no40lic;
 const WORD = 'LETTY';
 const BAR = {
  fill: '#3fd64a',
  top: '#9dff8a',
  edge: '#c8ffb0',
  empty: '#123018'
 };
 const PIX = [ '.GgLgG.', 'GgLgLgG', 'gLgGgLg', 'GgLGLgG', 'gLgGgLg', '.GgLgG.', '..GwG..' ];
 const PAL = {
  G: '#1f8a2a',
  g: '#3fd64a',
  L: '#b6ff9a',
  w: '#eaf7c8'
 };
 const V = window.V40LETTY = {
  WORD: WORD,
  BAR: BAR,
  PIX: PIX,
  PAL: PAL,
  n: 0,
  on: () => !off(),
  iconOn: () => !noIcon()
 };
 const RX1 = /\bPASS XP\b/g, RX2 = /\bXP\b/g;
 const has = s => typeof s === 'string' && s.indexOf('XP') >= 0;
 const map = s => has(s) && !off() ? s.replace(RX1, WORD).replace(RX2, WORD) : s;
 const GAP = '  ';
 const mapC = s => has(s) && !off() ? noIcon() ? map(s) : s.replace(RX1, GAP + WORD).replace(RX2, GAP + WORD) : s;
 V.map = map;
 V.mapC = mapC;
 V.icon = function(x, y, k) {
  if (off() || typeof g === 'undefined') return;
  k = k || 1;
  try {
   const cx = x + 3.5 * k, cy = y + 3.5 * k, r = 6 * k, gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
   gr.addColorStop(0, 'rgba(140,255,120,.55)');
   gr.addColorStop(.55, 'rgba(90,240,90,.22)');
   gr.addColorStop(1, 'rgba(90,240,90,0)');
   g.fillStyle = gr;
   g.beginPath();
   g.arc(cx, cy, r, 0, Math.PI * 2);
   g.fill();
  } catch (e) {}
  for (let j = 0; j < PIX.length; j++) {
   const row = PIX[j];
   let i = 0;
   while (i < row.length) {
    const c = row[i];
    if (!PAL[c]) {
     i++;
     continue;
    }
    let n = 1;
    while (row[i + n] === c) n++;
    rect(x + i * k, y + j * k, n * k, k, PAL[c]);
    i += n;
   }
  }
 };
 let URL0 = null;
 V.url = function() {
  if (URL0) return URL0;
  try {
   const c = document.createElement('canvas'), s = 4, pad = 3;
   c.width = c.height = (7 + pad * 2) * s;
   const x = c.getContext('2d');
   const gr = x.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
   gr.addColorStop(0, 'rgba(140,255,120,.55)');
   gr.addColorStop(.6, 'rgba(90,240,90,.2)');
   gr.addColorStop(1, 'rgba(90,240,90,0)');
   x.fillStyle = gr;
   x.fillRect(0, 0, c.width, c.height);
   PIX.forEach((row, j) => [ ...row ].forEach((ch, i) => {
    if (PAL[ch]) {
     x.fillStyle = PAL[ch];
     x.fillRect((i + pad) * s, (j + pad) * s, s, s);
    }
   }));
   URL0 = c.toDataURL('image/png');
  } catch (e) {
   URL0 = '';
  }
  return URL0;
 };
 const W0 = window.textW;
 for (const k of [ 'textW', 'text', 'textMini', 'textFit333' ]) {
  const f = window[k];
  if (typeof f !== 'function' || f.__v40l) continue;
  const icons = k === 'text', M = k === 'text' || k === 'textW' ? mapC : map;
  const w = function(s) {
   if (!has(s) || off()) return f.apply(this, arguments);
   const a = Array.prototype.slice.call(arguments);
   a[0] = M(s);
   const r = f.apply(this, a);
   if (icons && !noIcon() && a[0].indexOf(GAP + WORD) >= 0) {
    try {
     const t = a[0], x = a[1], y = a[2], sc = a[3] || 1, al = a[4] !== undefined ? a[5] : undefined, align = a[5] || 'left';
     const tw = W0 ? W0(t, sc) : t.length * 4 * sc - sc, x0 = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
     let i = t.indexOf(GAP + WORD);
     while (i >= 0) {
      V.icon(Math.round(x0 + i * 4 * sc - sc), y - sc, sc);
      i = t.indexOf(GAP + WORD, i + 1);
     }
    } catch (e) {}
   }
   return r;
  };
  w.__v40l = true;
  window[k] = w;
 }
 const panel = document.getElementById('panel');
 const SKIP = {
  TEXTAREA: 1,
  OPTION: 1,
  SCRIPT: 1,
  STYLE: 1,
  TITLE: 1
 };
 function img() {
  const i = document.createElement('img');
  i.className = 'v40lic';
  i.alt = '';
  i.src = V.url();
  return i;
 }
 function fixDom(root) {
  if (off() || !root) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), L = [];
  let n;
  while (n = tw.nextNode()) {
   const v = n.nodeValue;
   if (v && v.indexOf('XP') >= 0 && !(n.parentNode && SKIP[n.parentNode.nodeName])) L.push(n);
  }
  for (const t of L) {
   const m = map(t.nodeValue);
   if (m === t.nodeValue) continue;
   V.n++;
   if (noIcon() || !V.url()) {
    t.nodeValue = m;
    continue;
   }
   const parts = m.split(WORD), frag = document.createDocumentFragment();
   parts.forEach((p, i) => {
    if (p) frag.appendChild(document.createTextNode(p));
    if (i < parts.length - 1) {
     frag.appendChild(img());
     frag.appendChild(document.createTextNode(WORD));
    }
   });
   t.parentNode.replaceChild(frag, t);
  }
  if (!noIcon()) root.querySelectorAll('.notch18 .nb18').forEach(b => {
   if (!b.previousElementSibling || !b.previousElementSibling.classList.contains('v40lic')) b.parentNode.insertBefore(img(), b);
  });
 }
 V.fixDom = fixDom;
 if (panel && typeof syncPanel === 'function') {
  const S0 = window.syncPanel;
  let first = null;
  window.syncPanel = function() {
   const r = S0.apply(this, arguments);
   if (panel.firstElementChild !== first) {
    first = panel.firstElementChild;
    try {
     fixDom(panel);
    } catch (e) {
     console.error(e);
    }
   }
   return r;
  };
 }
 if (!off()) {
  const s = document.createElement('style');
  s.id = 'v40lettyCss';
  s.textContent = '.nb18 i.on{background:linear-gradient(' + BAR.top + ' 0 2px,' + BAR.fill + ' 2px);border-color:' + BAR.edge + '}\n' + 'img.v40lic{display:inline-block;width:1.3em;height:1.3em;vertical-align:-0.33em;margin:0 -0.12em 0 -0.18em;image-rendering:pixelated;image-rendering:crisp-edges}\n' + '.notch18 img.v40lic{width:20px;height:20px;margin-right:-4px}';
  document.head.appendChild(s);
 }
})();
