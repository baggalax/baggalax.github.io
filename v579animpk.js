'use strict';
/* v579animpk - 1.4 PACK OPENING + ITEM UNVEIL (Bagga Lax 1.4, Vidze's approved mockups pack_open_*.gif / item_open.gif).
   Pack: when a pack lands on the pack screen (any way: shop buy, free pack, weekly-challenge pack) the pack drops in and
   shakes. Rare and up: the shake builds with a rarity-colour glow, flash, burst, then the cards. Common: short jolt + pop.
   The best card (rare+ pack) gets its own shake + glow + flash when you tap it, then flips as before.
   Nothing about what is granted changes: buyPack() already granted the cards before any of this runs; we only draw on top
   and delay one card's flip tap by ~1 s.
   Item unveil: when a collect screen (#c27 / #c419 / #vc494pop) opens anywhere except the final screen (v579anim keeps them
   off that one), the first reward rises as a silhouette in a rarity-coloured beam, trembles, flashes, shines and gets a
   NEW! card; then the normal COLLECT screen is there underneath. Trophies won in a game (rl_an579q) unveil in the lobby.
   Every animation has SKIP. Fail safe: any throw ends the animation and leaves the screen exactly as today.
   Kill switches: window.__rl_no579anim (all), __rl_no579pack, __rl_no579item. */
(function () {
 const W0 = window, A = W0.AN579;
 if (!A) return;
 const noPack = () => !A.on() || !!W0.__rl_no579pack;
 const noItem = () => !A.on() || !!W0.__rl_no579item;
 const LOG = A.LOG;
 const RC = [ '#9aa3ab', '#3d8bff', '#ffcc33' ];
 const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = x => 1 - (1 - x) * (1 - x);
 const q = (v, n) => Math.round(v / n) * n;
 const imgCache = {};
 function img(src) {
  if (!src) return null;
  let i = imgCache[src];
  if (!i) { i = new Image(); i.src = src; imgCache[src] = i; }
  return i.complete && i.naturalWidth ? i : null;
 }
 // solid-colour silhouette of an image (pixel exact)
 const silCache = new Map;
 function sil(im, col) {
  const key = im.src.length + ':' + im.src.slice(-40) + col;
  let c = silCache.get(key);
  if (c) return c;
  c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  if (silCache.size > 40) silCache.clear();
  silCache.set(key, c);
  return c;
 }
 const parts = Array.from({ length: 28 }, (_, i) => ({ a: i / 28 * Math.PI * 2 + (i % 3) * .11, sp: 170 + (i * 53 % 150), s: i % 2 ? 8 : 4, w: i % 3 === 0 }));
 function burst(cx, X, Y, t, col, big) {
  if (t < 0 || t > .7) return;
  for (const p of parts) {
   const sp = p.sp * (big ? 1.25 : .8), x = q(X + Math.cos(p.a) * sp * t, 4), y = q(Y + Math.sin(p.a) * sp * t + 260 * t * t, 4);
   cx.globalAlpha = t > .5 ? .5 : 1; cx.fillStyle = p.w ? '#fff' : col; cx.fillRect(x, y, p.s, p.s);
  }
  cx.globalAlpha = 1;
 }
 // pixel halo: silhouette stamped around the art in the glow colour
 function halo(cx, sc, x, y, w, h, col, r, a) {
  cx.globalAlpha = a;
  for (let d = r; d >= 4; d -= 4) for (const [ dx, dy ] of [ [ -d, 0 ], [ d, 0 ], [ 0, -d ], [ 0, d ], [ -d * .7, -d * .7 ], [ d * .7, d * .7 ], [ -d * .7, d * .7 ], [ d * .7, -d * .7 ] ]) cx.drawImage(sc, x + q(dx, 4), y + q(dy, 4), w, h);
  cx.globalAlpha = 1;
 }

 /* ---------------- pack opening ---------------- */
 const seenPacks = new WeakSet();
 let pk = null;   // { P, best, good, col }
 function packInfo(P) {
  const BY = V17.BY;
  let best = -1, rb = -1;
  P.cards.forEach((id, i) => { const r = BY[id] ? BY[id].rar | 0 : 0; if (r >= rb) { rb = r; best = i; } });
  return { P: P, best: best, rar: rb, good: rb >= 1, col: RC[clamp(rb, 0, 2)] };
 }
 function packScene(info) {
  const im0 = img(V17.packUrl(info.P.kind));
  const good = info.good, col = info.col;
  const T_DROP = .55, T_END = good ? 3.0 : 1.55, T_OUT = T_END + .55;
  A.stage({
   kind: 'pack-' + (good ? 'good' : 'common'), bg: 'transparent',
   render(cx, t, S) {
    const Wd = S.W, Hd = S.H, im = im0 || img(V17.packUrl(info.P.kind));
    cx.clearRect(0, 0, Wd, Hd);
    const fade = t < T_END ? 1 : clamp(1 - (t - T_END - .25) / .3, 0, 1);
    cx.globalAlpha = .9 * fade; cx.fillStyle = '#05080b'; cx.fillRect(0, 0, Wd, Hd); cx.globalAlpha = 1;
    const ccx = Wd / 2, ccy = Hd / 2 + 10;
    if (t < T_END && im) {
     const sc = Math.max(1, Math.floor(230 / im.naturalHeight)), w = im.naturalWidth * sc, h = im.naturalHeight * sc;
     let y = t < T_DROP ? -h + (ccy - h / 2 + h) * ease(t / T_DROP) : ccy - h / 2;
     if (t >= T_DROP && t < T_DROP + .18) y -= q(12 * Math.sin((t - T_DROP) / .18 * Math.PI), 4);
     let x = 0, yj = 0, u = 0;
     if (t >= T_DROP + .25) {
      u = clamp((t - T_DROP - .25) / (T_END - T_DROP - .25), 0, 1);
      if (!good) { const j = (u > 0 && u < .22) || (u > .5 && u < .72); x = j ? (Math.floor(t * 20) % 2 ? 4 : -4) : 0; }
      else { const amp = 4 + 12 * u * u, f = 14 + 20 * u; x = q(Math.sin(t * f * 2) * amp, 4); yj = q(Math.cos(t * f * 2.3) * amp * .5, 4); }
     }
     const X = Math.round(ccx - w / 2 + x), Y = Math.round(y + yj);
     cx.imageSmoothingEnabled = false;
     if (good && u > 0) halo(cx, sil(im, col), X, Y, w, h, col, q(4 + 18 * u, 4), .25 + .35 * u);
     cx.drawImage(im, X, Y, w, h);
     if (good && u > .1 && Math.floor(t * 12) % 2) { cx.globalAlpha = .22 * u; cx.drawImage(sil(im, '#ffffff'), X, Y, w, h); cx.globalAlpha = 1; }
    }
    const bt = t - T_END;
    if (bt >= 0 && bt < (good ? .3 : .14)) { cx.globalAlpha = good ? (1 - bt / .3) * .9 : .35; cx.fillStyle = good ? col : '#fff'; cx.fillRect(0, 0, Wd, Hd); cx.globalAlpha = 1; }
    burst(cx, 0, ccx, ccy, bt, good ? col : '#fff', good);
    return t < T_OUT;
   },
   onEnd() { try { if (typeof sfx12 === 'function') sfx12(good ? 'crowd_cheer' : 'pass', .3); } catch (e) {} }
  });
 }
 function packTick() {
  if (noPack() || A.active() || A.scr() !== 'pack17' || !W0.V17 || !V17.lastPack) return;
  const P = V17.lastPack();
  if (!P || seenPacks.has(P)) return;
  seenPacks.add(P);
  if (P.kind === 'halloween' || !Array.isArray(P.cards) || !P.cards.length || P.flipped.some(Boolean)) return;
  if (typeof menuT === 'number' && P.t0 != null && menuT - P.t0 > 3) return;
  pk = packInfo(P);
  packScene(pk);
 }
 // best card: its own shake + glow + flash before it flips (rare+ packs only)
 let shaking = false, pass = false;
 W0.addEventListener('click', ev => {
  try {
   if (pass || noPack() || !pk || !pk.good) return;
   const el = ev.target && ev.target.closest && ev.target.closest('.fl17[data-a="v17flip"]');
   if (!el || A.scr() !== 'pack17' || V17.lastPack() !== pk.P) return;
   const i = +el.dataset.v;
   if (i !== pk.best || pk.P.flipped[i]) return;
   ev.preventDefault(); ev.stopPropagation();
   if (shaking) return;
   shaking = true;
   const t0 = performance.now(), D = 1100, col = pk.col;
   const fl = document.createElement('div');
   fl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;opacity:0;background:' + col;
   document.body.appendChild(fl);
   let skip = false;
   const sk = document.createElement('button');
   sk.type = 'button'; sk.textContent = 'SKIP'; sk.id = 'an579skip';
   sk.style.cssText = 'position:fixed;right:calc(env(safe-area-inset-right) + 10px);bottom:calc(env(safe-area-inset-bottom) + 10px);z-index:2147483001;font:bold 13px "Courier New",ui-monospace,monospace;color:#0b1a20;background:#e8eef5;border:0;border-radius:0;box-shadow:0 3px 0 #000,0 0 0 2px #000;padding:7px 16px';
   sk.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); skip = true; });
   document.body.appendChild(sk);
   const fin = () => {
    try { el.style.transform = ''; el.style.filter = 'drop-shadow(0 0 8px ' + col + ')'; } catch (e) {}
    try { fl.remove(); sk.remove(); } catch (e) {}
    shaking = false;
    pass = true;
    try { el.click(); } catch (e) {} finally { pass = false; }
    LOG.scenes.push('bestcard' + (skip ? ':skip' : ':done'));
   };
   const step = () => {
    try {
     const t = (performance.now() - t0) / 1000;
     if (skip || !el.isConnected) return fin();
     const u = clamp(t / (D / 1000), 0, 1), amp = 2 + 8 * u * u;
     if (t < D / 1000) {
      el.style.transform = 'translate(' + q(Math.sin(t * (22 + 30 * u) * 2) * amp, 2) + 'px,' + q(Math.cos(t * 31) * amp * .4, 2) + 'px)';
      el.style.filter = 'drop-shadow(0 0 ' + Math.round(3 + 14 * u) + 'px ' + col + ')';
      return requestAnimationFrame(step);
     }
     const ft = t - D / 1000;
     fl.style.opacity = String(ft < .15 ? .55 * (1 - ft / .15) : 0);
     if (ft < .15) return requestAnimationFrame(step);
     fin();
    } catch (e) { A.fail('bestcard', e); fin(); }
   };
   requestAnimationFrame(step);
  } catch (e) { A.fail('bestclick', e); shaking = false; }
 }, true);

 /* ---------------- item unveil ---------------- */
 function unveil(o) {
  // o: { src, name, col, head }
  const nm = String(o.name || '').toUpperCase().slice(0, 34), col = o.col || '#ffcc33', head = String(o.head || 'NEW!').toUpperCase().slice(0, 30);
  const T_RISE = 1.0, T_TREM = 2.6, T_SHINE = T_TREM + .15, T_NAME = T_SHINE + .5, T_CARD = T_NAME + .9, T_END = T_CARD + 1.6;
  A.stage({
   kind: 'item', bg: 'transparent',
   render(cx, t, S) {
    const Wd = S.W, Hd = S.H, im = img(o.src);
    const out = clamp(1 - (t - T_END) / .3, 0, 1);
    cx.clearRect(0, 0, Wd, Hd);
    cx.globalAlpha = clamp(t / .3, 0, 1) * .94 * out; cx.fillStyle = '#05080b'; cx.fillRect(0, 0, Wd, Hd);
    const ccx = Wd / 2, ccy = 170;
    // beam
    const bl = clamp((t - .15) / .5, 0, 1) * (t < T_TREM ? 1 : .35 + .65 * clamp(1 - (t - T_TREM) / .6, 0, 1)) * out;
    cx.globalAlpha = bl * .2; cx.fillStyle = col; cx.fillRect(ccx - 96, 0, 192, Hd);
    cx.globalAlpha = bl * .3; cx.fillRect(ccx - 56, 0, 112, Hd);
    cx.globalAlpha = out;
    if (im) {
     const sc = Math.max(1, Math.floor(150 / Math.max(im.naturalHeight, im.naturalWidth))), w = im.naturalWidth * sc, h = im.naturalHeight * sc;
     let x = 0, y = 0;
     if (t < T_RISE) y = q((1 - ease(t / T_RISE)) * 230, 4);
     else if (t < T_TREM) { const u = (t - T_RISE) / (T_TREM - T_RISE), amp = 2 + 10 * u * u; x = u > .15 ? q(Math.sin(t * (16 + 26 * u) * 2) * amp, 2) : 0; y = q(Math.cos(t * 41) * amp * .3, 2); }
     const X = Math.round(ccx - w / 2 + x), Y = Math.round(ccy - h / 2 + y);
     const u2 = clamp((t - T_RISE) / (T_TREM - T_RISE), 0, 1);
     if (t < T_TREM) {
      halo(cx, sil(im, col), X, Y, w, h, col, q(4 + 12 * u2, 4), .35 * out);
      cx.drawImage(sil(im, '#000000'), X, Y, w, h);
     } else {
      halo(cx, sil(im, col), X, Y, w, h, col, q(12 - 8 * clamp((t - T_TREM) / 1.2, 0, 1), 4), .35 * out);
      cx.drawImage(im, X, Y, w, h);
      const st = t - T_SHINE;
      if (st >= 0 && st < .5) {
       const p = q(st / .5 * (w + 120) - 60, 8);
       cx.save(); cx.beginPath(); cx.moveTo(X + p, Y); cx.lineTo(X + p + 22, Y); cx.lineTo(X + p - 48, Y + h); cx.lineTo(X + p - 70, Y + h); cx.closePath(); cx.clip();
       cx.drawImage(sil(im, '#ffffff'), X, Y, w, h); cx.restore();
      }
     }
    }
    const ft = t - T_TREM;
    if (ft >= 0 && ft < .3) { cx.globalAlpha = (1 - ft / .3) * .6; cx.fillStyle = col; cx.fillRect(0, 0, Wd, Hd); cx.globalAlpha = out; }
    burst(cx, 0, ccx, ccy, ft, col, true);
    cx.globalAlpha = out;
    A.withG(cx, () => {
     if (t >= .3) text(head, ccx, 18, 2, '#ffcc33', 'center', '#000');
     if (t >= T_NAME) { const n = Math.min(nm.length, Math.floor((t - T_NAME) / .04) + 1); text(nm.slice(0, n), ccx, 262, 3, '#ffffff', 'center', '#000'); }
     if (t >= T_NAME + .45) { const pw = 92; cx.fillStyle = '#000'; cx.fillRect(ccx - pw / 2 - 2, 294, pw + 4, 26); cx.fillStyle = col; cx.fillRect(ccx - pw / 2, 296, pw, 22); text('NEW!', ccx, 300, 2, '#05080b', 'center'); }
     const ctt = t - T_CARD;
     if (ctt >= 0 && im) {
      const yy = 110 + q((1 - ease(clamp(ctt / .35, 0, 1))) * 200, 4), xx = Wd - 150;
      cx.fillStyle = '#000'; cx.fillRect(xx - 3, yy - 3, 98, 128); cx.fillStyle = col; cx.fillRect(xx, yy, 92, 122); cx.fillStyle = '#14222b'; cx.fillRect(xx + 4, yy + 4, 84, 114);
      const s2 = Math.max(1, Math.floor(56 / Math.max(im.naturalWidth, im.naturalHeight)));
      cx.drawImage(im, Math.round(xx + 46 - im.naturalWidth * s2 / 2), yy + 14, im.naturalWidth * s2, im.naturalHeight * s2);
      cx.fillStyle = '#ff3b3b'; cx.fillRect(xx + 50, yy - 8, 46, 16); text('NEW!', xx + 73, yy - 4, 1, '#ffffff', 'center');
      text(nm.length > 14 ? nm.slice(0, 13) + '.' : nm, xx + 46, yy + 96, 1, '#ffffff', 'center');
     }
    });
    cx.globalAlpha = 1;
    return t < T_END + .3;
   }
  });
 }
 function fromPopup(d) {
  if (d.id === 'fw37') return null;   // the first-win pack is its own tap-to-open pack
  const im = d.querySelector('img[src]');
  if (!im || !im.getAttribute('src')) return null;
  let name = '', col = '#ffcc33', head = '';
  try {
   const bx = d.firstElementChild, hd = bx && bx.firstElementChild; head = hd && hd.tagName === 'DIV' ? hd.textContent : '';
   if (d.id === 'c27') { const tl = im.closest('.c27t'); name = im.nextElementSibling ? im.nextElementSibling.textContent : ''; if (tl) col = getComputedStyle(tl).borderTopColor || col; }
   else if (d.id === 'c419') { const tx = im.nextElementSibling; name = tx && tx.children[1] ? tx.children[1].textContent : ''; }
   else { const h1 = d.querySelector('h1'); head = h1 ? h1.textContent : 'NEW CARDS!'; name = (im.alt || '').trim() || head; }
  } catch (e) {}
  if (/^rgba?\(\s*0,\s*0,\s*0/.test(col) || /44, 68, 82/.test(col)) col = '#ffcc33';
  return { src: im.src, name: name || head, col: col, head: head || 'NEW!' };
 }
 const POPS = { c27: 1, c419: 1, vc494pop: 1 };
 const done = new WeakSet();
 let waiting = [];   // collect screens waiting for their unveil (one plays at a time)
 function popTick() {
  if (!waiting.length || A.active() || noItem() || BLOCK()) return;
  waiting = waiting.filter(w => w[0].isConnected);
  const w = waiting.shift();
  if (w) unveil(w[1]);
 }
 const BLOCK = () => { const s = A.scr(); return s === 'final' || (typeof GAME_SCREENS !== 'undefined' && GAME_SCREENS.indexOf(s) >= 0); };
 try {
  new MutationObserver(list => {
   if (noItem() || BLOCK()) return;
   for (const m of list) for (const n of m.addedNodes) if (n && n.id && POPS[n.id] && !done.has(n)) {
    done.add(n);
    try { const o = fromPopup(n); if (o) { img(o.src); waiting.push([ n, o ]); } } catch (e) { A.fail('pop', e); }
   }
  }).observe(document.body, { childList: true });
 } catch (e) { A.fail('itemobs', e); }
 // trophies won in a game: unveil once back on the main menu
 let lastTr = 0;
 function trophyTick() {
  if (noItem() || A.active() || A.scr() !== 'menu' || waiting.length || document.querySelector('#c27,#c419,#vc494pop,#fw37')) return;
  if (performance.now() - lastTr < 1500) return;
  lastTr = performance.now();
  const o = A.qGet();
  if (!o.q.length) return;
  const id = o.q.shift(); o.seen[id] = 1; A.qSet(o);
  const it = W0.V17 && V17.BY && V17.BY[id];
  if (!it) return;
  img(V17.iconUrl(id));
  setTimeout(() => { try { if (A.active()) { const o2 = A.qGet(); o2.q.unshift(id); delete o2.seen[id]; A.qSet(o2); return; } unveil({ src: V17.iconUrl(id), name: it.n, col: '#ffcc33', head: 'TROPHY UNLOCKED!' }); } catch (e) { A.fail('trophy', e); } }, 120);
 }
 setInterval(() => { try { popTick(); } catch (e) { A.fail('popTick', e); } try { packTick(); } catch (e) { A.fail('packTick', e); } try { trophyTick(); } catch (e) { A.fail('trophyTick', e); } }, 100);
 A.unveil = unveil; A.packScene = i => packScene(i || packInfo(V17.lastPack()));
})();
