(function() {
 'use strict';
 const off = () => !!(window.__rl_no40promo || window.__rl_v124gb);
 const EXTRA = [];
 const ROTATE = 3.5, SHINE = 3;
 const V = window.V40PROMO = {
  EXTRA: EXTRA,
  ROTATE: ROTATE,
  log: []
 };
 const T = () => typeof menuT === 'number' ? menuT : performance.now() / 1e3;
 function items() {
  try {
   if (!window.V17 || !V17.PACKS) return [];
   const P = V17.PACKS;
   let best = -1;
   const by = {};
   for (const k of Object.keys(P)) {
    const p = P[k];
    if (!p || !p.cost) continue;
    for (const f of Object.keys(p)) {
     const m = /^v(\d+)$/.exec(f);
     if (m && p[f]) {
      const n = +m[1];
      (by[n] = by[n] || []).push(k);
      if (n > best) best = n;
     }
    }
   }
   let L = best >= 0 ? by[best].slice() : [];
   for (const k of EXTRA) if (P[k] && L.indexOf(k) < 0) L.push(k);
   L = L.filter(k => !(window.V38P && V38P.KEYS && V38P.KEYS.indexOf(k) >= 0 && V38P.mine && !V38P.mine(k)));
   return L;
  } catch (e) {
   return [];
  }
 }
 V.items = items;
 V.want = () => !off() && items().length > 0;
 const imgs = {};
 function img(k) {
  if (imgs[k]) return imgs[k];
  let u = '';
  try {
   u = V17.packUrl(k);
  } catch (e) {}
  const im = new Image;
  if (u) im.src = u;
  imgs[k] = im;
  return im;
 }
 V.current = function() {
  const L = items();
  if (!L.length) return null;
  return L[Math.floor(T() / ROTATE) % L.length];
 };
 function wrap(s, maxW) {
  const cw = 4 * .65, words = String(s).split(' '), out = [];
  let cur = '';
  for (const w of words) {
   const t = cur ? cur + ' ' + w : w;
   if (t.length * cw - .65 <= maxW || !cur) cur = t; else {
    out.push(cur);
    cur = w;
   }
  }
  if (cur) out.push(cur);
  return out;
 }
 function coin(x, y) {
  try {
   if (window.V39C && V39C.coin && V39C.coin(x, y)) return;
  } catch (e) {}
  rect(x, y + 1, 8, 6, '#05080b');
  rect(x + 1, y + 2, 6, 4, '#ffffff');
  rect(x + 1, y + 5, 6, 1, '#d6dde2');
 }
 V.draw = function(x, y, w, h, live, ex, ey) {
  const k = V.current();
  if (!k) return false;
  const P = V17.PACKS[k];
  if (live) hit('NEW IN YARD SALE', x - (ex || 0), y - (ey || 0), w + (ex || 0) * 2, h + (ey || 0) * 2, () => V.open(k), 'NEW IN YARD SALE');
  rect(x, y + 2, w, h, '#000');
  rect(x, y, w, h, '#ffcc33');
  rect(x + 1, y + 1, w - 2, h - 2, '#101a24');
  const im = img(k), ah = h - 6, aw = Math.round(ah * 44 / 60), ax = x + 3, ay = y + 3;
  if (im && im.complete && im.naturalWidth) {
   const s = g.imageSmoothingEnabled;
   g.imageSmoothingEnabled = false;
   try {
    g.drawImage(im, ax, ay, aw, ah);
   } catch (e) {}
   g.imageSmoothingEnabled = s;
  } else rect(ax, ay, aw, ah, '#2a3440');
  const tx = ax + aw + 3, tw = x + w - 3 - tx, cx = tx + tw / 2;
  const blink = Math.floor(T() * 2) % 2 === 0;
  textMini('NEW IN', cx, y + 3, blink ? '#ffe14d' : '#ffffff');
  textMini('YARD SALE', cx, y + 7.5, '#7dff7a');
  const L = wrap(P.n, tw).slice(0, 2);
  L.forEach((s, i) => textMini(s, cx, y + 12.5 + i * 4.3, '#e8f0f4'));
  const ps = String(P.cost), pw = 9 + ps.length * 2.6, px = Math.round(cx - pw / 2), py = y + h - 9;
  coin(px, py);
  textMini(ps, px + 9 + ps.length * 1.3, py + 2.5, '#ffe14d');
  const n = items().length;
  if (n > 1) {
   const i0 = items().indexOf(k);
   for (let i = 0; i < n; i++) rect(x + w - 4 - (n - 1 - i) * 3, y + h - 3, 2, 1, i === i0 ? '#ffcc33' : 'rgba(255,255,255,.3)');
  }
  const t = T() % SHINE;
  if (t < .6) {
   const sx = x - 12 + (w + 24) * (t / .6);
   g.save();
   g.beginPath();
   g.rect(x + 1, y + 1, w - 2, h - 2);
   g.clip();
   g.fillStyle = 'rgba(255,255,255,.22)';
   g.beginPath();
   g.moveTo(sx, y);
   g.lineTo(sx + 6, y);
   g.lineTo(sx - 4, y + h);
   g.lineTo(sx - 10, y + h);
   g.fill();
   g.restore();
  }
  V.lastDraw = {
   k: k,
   x: x,
   y: y,
   w: w,
   h: h
  };
  return true;
 };
 V.open = function(k) {
  V.log.push('open ' + k);
  try {
   V17.openShop();
  } catch (e) {
   return;
  }
  let n = 0;
  const go = () => {
   const panel = document.getElementById('panel');
   const el = panel && panel.querySelector('.spk17.' + k + ', .pk17.' + k + ', .hwg16.' + k);
   if (el) {
    try {
     el.scrollIntoView({
      block: 'center'
     });
    } catch (e) {
     el.scrollIntoView();
    }
    el.classList.add('v40flash');
    setTimeout(() => el.classList.remove('v40flash'), 1600);
    V.opened = k;
    return;
   }
   if (++n < 20) setTimeout(go, 50);
  };
  setTimeout(go, 30);
 };
 if (!off()) {
  const s = document.createElement('style');
  s.id = 'v40promoCss';
  s.textContent = '@keyframes v40fl{0%,100%{box-shadow:0 0 0 0 rgba(255,204,51,0)}30%{box-shadow:0 0 0 3px #ffcc33,0 0 14px 4px rgba(255,204,51,.8)}}\n#panel .v40flash{animation:v40fl .8s ease-in-out 2}';
  document.head.appendChild(s);
 }
})();
