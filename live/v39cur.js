(function() {
 'use strict';
 const FISH = () => !!window.__rl_v124gb;
 const onCur = () => !window.__rl_no39cur && !FISH();
 const onYs = () => !window.__rl_no39ys && !FISH();
 const cased = (src, rep) => src === src.toUpperCase() ? rep.toUpperCase() : src[0] === src[0].toUpperCase() ? rep[0].toUpperCase() + rep.slice(1) : rep;
 const RX_CUR = /(^|[^A-Za-z])(chino)(s?)(?![A-Za-z])/gi;
 const RX_SS = /(^|[^A-Za-z])(string\s+shop)(?![A-Za-z])/gi;
 const RX_IS = /(^|[^A-Za-z])(item\s+shop)(?![A-Za-z])/gi;
 const RX_TS = /(^|[^A-Za-z])(the\s+shop)(?![A-Za-z])/gi;
 const RX_DUP = /(YARD SALE \()THE YARD SALE, /gi;
 const QUICK = /chino|shop/i;
 function map(s) {
  if (typeof s !== 'string' || !QUICK.test(s)) return s;
  let o = s;
  if (onCur()) o = o.replace(RX_CUR, (m, p, w, pl) => p + cased(w + pl, pl ? 'dimes' : 'dime'));
  if (onYs()) o = o.replace(RX_SS, (m, p, w) => p + cased(w, 'yard sale')).replace(RX_IS, (m, p, w) => p + cased(w, 'yard sale')).replace(RX_TS, (m, p, w) => p + cased(w, 'the yard sale')).replace(RX_DUP, '$1');
  return o;
 }
 const mapText = s => s === 'STRING' && onYs() ? 'YARD' : map(s);
 const mapMini = s => s === 'SHOP' && onYs() ? 'SALE' : map(s);
 const miniShift = (s, k) => {
  try {
   if (s !== 'CHINOS' || !onCur()) return 0;
   const rr = typeof RR === 'number' ? RR : 1, cell = Math.max(1, Math.round((k || .65) * rr)) / rr;
   return -2 * cell;
  } catch (e) {
   return 0;
  }
 };
 const RX_RUN = /(^|>)([^<]+)/g;
 const mapHtml = h => typeof h !== 'string' || !QUICK.test(h) ? h : h.replace(RX_RUN, (m, a, t) => a + map(t));
 try {
  const _text = window.text, _textW = window.textW, _textMini = window.textMini, _fit = window.textFit333;
  if (typeof _text === 'function') window.text = function(s, x, y, sc, col, align, shadow) {
   return _text.call(this, mapText(s), x, y, sc, col, align, shadow);
  };
  if (typeof _textW === 'function') window.textW = function(s, sc) {
   return _textW.call(this, mapText(s), sc);
  };
  if (typeof _textMini === 'function') window.textMini = function(s, cx, y, col, k) {
   return _textMini.call(this, mapMini(s), cx + miniShift(s, k), y, col, k);
  };
  if (typeof _fit === 'function') window.textFit333 = function(s, cx, y, h, col, maxW) {
   return _fit.call(this, map(s), cx, y, h, col, maxW);
  };
 } catch (e) {
  console.error(e);
 }
 const SKIP = {
  INPUT: 1,
  TEXTAREA: 1,
  STYLE: 1,
  SCRIPT: 1
 };
 const skipEl = el => {
  try {
   if (!el) return false;
   const t = el.nodeType === 1 ? el : el.parentNode;
   if (!t || t.nodeType !== 1) return false;
   if (SKIP[t.tagName]) return true;
   return !!t.isContentEditable;
  } catch (e) {
   return false;
  }
 };
 function wrapSetter(proto, prop, fn) {
  try {
   const d = Object.getOwnPropertyDescriptor(proto, prop);
   if (!d || !d.set) return;
   Object.defineProperty(proto, prop, {
    configurable: true,
    enumerable: d.enumerable,
    get: d.get,
    set: function(v) {
     return d.set.call(this, typeof v === 'string' && QUICK.test(v) && !skipEl(this) ? fn(v) : v);
    }
   });
  } catch (e) {
   console.error(e);
  }
 }
 wrapSetter(Node.prototype, 'textContent', map);
 wrapSetter(Node.prototype, 'nodeValue', map);
 wrapSetter(CharacterData.prototype, 'data', map);
 wrapSetter(Element.prototype, 'innerHTML', mapHtml);
 if (window.HTMLElement) wrapSetter(HTMLElement.prototype, 'innerText', map);
 try {
  const _ctn = Document.prototype.createTextNode;
  Document.prototype.createTextNode = function(s) {
   return _ctn.call(this, map(s));
  };
 } catch (e) {
  console.error(e);
 }
 for (const P of [ Element.prototype, (window.DocumentFragment || {}).prototype ]) {
  if (!P) continue;
  for (const k of [ 'append', 'prepend', 'replaceChildren' ]) {
   const f = P[k];
   if (typeof f !== 'function') continue;
   P[k] = function() {
    if (skipEl(this)) return f.apply(this, arguments);
    const a = Array.prototype.map.call(arguments, x => typeof x === 'string' ? map(x) : x);
    return f.apply(this, a);
   };
  }
 }
 try {
  const _iah = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function(p, h) {
   return _iah.call(this, p, mapHtml(h));
  };
 } catch (e) {}
 for (const k of [ 'alert', 'confirm', 'prompt' ]) {
  const f = window[k];
  if (typeof f === 'function') window[k] = function(m) {
   const a = Array.prototype.slice.call(arguments);
   a[0] = map(m);
   return f.apply(window, a);
  };
 }
 const PAL = {
  O: '#0d2842',
  D: '#2e96d6',
  d: '#58bef0',
  M: '#8cdeff',
  L: '#c4f2ff',
  W: '#ffffff',
  S: '#142c46',
  s: '#46628a',
  h: '#dff7ff',
  G: '#e3eaf0'
 };
 const SMALL = [ ".......OOOOO.......", ".....OOLLWWWOO.....", "...OOWWWLWWMMMOO...", "..OOLLMSSSSSdLLOO..", "..OWLLSWWGGGSMDDO..", ".OLWLSWGGGGGGSdDLO.", ".OLMLSGGGGGGGSddMO.", "OWLLLSGGGGGGGSddMDO", "OWWLLSGGGGGGGSdDDDO", "OWWLLMSGGGGGSdDDMMO", "OMMLMMSGGGGGSDDDMMO", "OMWMMMMSGGGSDDDDDMO", ".OWdMMddSGSDDDDDDO.", ".OLMMdddSGSDDDDMDO.", "..OMDdddSSSDDDDDO..", "..OOLLddDDDDDDDOO..", "...OODDDMMDMMDOO...", ".....OOMMMDDOO.....", ".......OOOOO......." ];
 const BIG = [ ".............OOOOOO.............", "..........OOOLLLWWWOOO..........", "........OOWWWLLLWWWMMMOO........", "......OOLLLWWWLLWWMMMWLLOO......", ".....OOWLLLdddSSSSddDLLLMOO.....", "....OWWWWddSSSWWGGSSSDDMMMLO....", "...OOLWWdLSWWWGGGGGGGSMDMLLOO...", "...OLLLdLSWGGGGGGGGGGGSMDLLLO...", "..OWWLdLSWGGGGGGGGGGGGGSdDLDDO..", "..OWWdLLSGGGGGGGGGGGGGGSddDDDO..", ".OLWWdLLSGGGGGGGGGGGGGGSddDDDMO.", ".OLLdLLLSGGGGGGGGGGGGGGSdddDMMO.", ".OLLdLLLSGGGGGGGGGGGGGGSdddDMMO.", "OWWLdLLLSGGGGGGGGGGGGGGSdddDMDDO", "OWWWLLLLLSGGGGGGGGGGGGSdddDDDDDO", "OWWWLLLLMSGGGGGGGGGGGGSddDDDDDDO", "OLLLLLLMMSGGGGGGGGGGGGSdDDDDMMMO", "OLLMLLMMMMSGGGGGGGGGGSdDDDDDMMMO", "OLMWdMMMMMSGGGGGGGGGGSDDDDDDDMMO", ".OWWdMMMMMMSGGGGGGGGSDDDDDDDDDO.", ".OWWDMMMMMMSGGGGGGGGSDDDDDDDDDO.", ".OWMMDMMMMddSGGGGGGSDDDDDDDMDDO.", "..OMMDMMMddddSGGGGSDDDDDDDDDDO..", "..OMMLDMdddddSGGGGSDDDDDDDDDDO..", "...OLLLDddddddSGGSDDDDDDDDDDO...", "...OOLLDDdddddSGGSDDDDDDDDDOO...", "....OLDDDDDdddSGGSDDDDDDDDDO....", ".....OODLLMDDDDSSDDDDDDDDOO.....", "......OOLMMDDDMMDDMMMDDDOO......", "........OODDDMMMDDDMDDOO........", "..........OOOMMMDDDOOO..........", ".............OOOOOO............." ];
 const cache = {};
 function sprite(map, cell) {
  const k = map.length + ':' + cell;
  if (cache[k]) return cache[k];
  const N = map.length, c = document.createElement('canvas');
  c.width = c.height = N * cell;
  const x = c.getContext('2d');
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
   const ch = map[j][i];
   if (ch === '.') continue;
   x.fillStyle = PAL[ch];
   x.fillRect(i * cell, j * cell, cell, cell);
  }
  return cache[k] = c;
 }
 const DIR = [ Math.sin(115 * Math.PI / 180), -Math.cos(115 * Math.PI / 180) ];
 const cellsOf = {};
 function cells(map) {
  const k = map.length;
  if (cellsOf[k]) return cellsOf[k];
  const N = map.length, out = [];
  let lo = 1e9, hi = -1e9;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (map[j][i] !== '.') {
   const u = (i + .5) * DIR[0] + (j + .5) * DIR[1];
   out.push([ i, j, u ]);
   lo = Math.min(lo, u);
   hi = Math.max(hi, u);
  }
  for (const c of out) c[2] = (c[2] - lo) / (hi - lo || 1);
  return cellsOf[k] = out;
 }
 const now = () => (window.performance && performance.now ? performance.now() : Date.now()) / 1e3;
 function shine(ctx, map, cell, dx, dy, t) {
  const ph = (t % 2.6 + 2.6) % 2.6 / 2.6, uc = -.62 + 2.16 * ph, w = map.length >= 24 ? .05 : .06;
  if (uc < -.2 || uc > 1.2) return;
  for (const c of cells(map)) {
   const d = c[2] - uc;
   if (d > -w && d <= w * .25) {
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.fillRect(dx + c[0] * cell, dy + c[1] * cell, cell, cell);
   } else if (d > w * .25 && d < w * 1.6) {
    ctx.fillStyle = 'rgba(160,230,255,.42)';
    ctx.fillRect(dx + c[0] * cell, dy + c[1] * cell, cell, cell);
   }
  }
 }
 function drawCoin(x, y, big, t) {
  if (typeof SA2403B !== 'undefined' && SA2403B && typeof sa2403By === 'function') y = sa2403By(y);
  const ctx = g, m = ctx.getTransform(), rr = Math.abs(m.a) || 1, map = big ? BIG : SMALL;
  const cell = big ? Math.max(1, Math.round(rr * .5)) : Math.max(1, Math.round(rr * .45)), size = map.length * cell;
  const cx = m.a * (x + 4) + m.c * (y + 4) + m.e, cy = m.b * (x + 4) + m.d * (y + 4) + m.f;
  const dx = Math.round(cx - size / 2), dy = Math.round(cy - size / 2);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite(map, cell), dx, dy);
  shine(ctx, map, cell, dx, dy, t == null ? now() : t);
  ctx.restore();
 }
 function coin(x, y, big) {
  if (!onCur()) return false;
  try {
   drawCoin(x, y, !!big);
   return true;
  } catch (e) {
   return false;
  }
 }
 function url(map, cell) {
  try {
   return sprite(map, cell).toDataURL('image/png');
  } catch (e) {
   return '';
  }
 }
 function css() {
  if (!onCur() || document.getElementById('v39cur-css')) return;
  const s = url(SMALL, 4), b = url(BIG, 3);
  if (!s || !b) return;
  const st = document.createElement('style');
  st.id = 'v39cur-css';
  st.textContent = 'span.coin17{width:14px!important;height:14px!important;border-radius:50%!important;background:url(' + s + ') center/100% 100% no-repeat!important;box-shadow:none!important;position:relative;overflow:hidden;vertical-align:-2px!important;margin-right:3px!important}' + 'span.coin17::after{content:"";position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.45) 48%,rgba(140,220,255,.35) 52%,transparent 60%);animation:foil17 2.6s linear infinite;pointer-events:none}' + '.bal17 span.coin17{width:22px!important;height:22px!important;background-image:url(' + b + ')!important;vertical-align:-6px!important}' + '@keyframes foil17{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}';
  (document.head || document.documentElement).appendChild(st);
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', css); else css();
 try {
  css();
 } catch (e) {}
 window.V39C = {
  on: onCur,
  onYs: onYs,
  map: map,
  coin: coin,
  drawCoin: drawCoin,
  sprite: sprite,
  SMALL: SMALL,
  BIG: BIG,
  PAL: PAL
 };
})();
