/* v535lksort.js - Locker Room: every item section sorted by rarity, the same way CARDS is (Bagga Lax).
   Charlie (Nov 11): "Sticks and all other items should be sorted the same way cards are: legendary, then all
   legendary, then rare, all rares, etc." + "N/A is not its own section - a rare N/A item goes with rares" +
   "same for collab - not its own section, just says COLLAB and goes with its rarity".
   What it does (display only, on every host + the app):
   - Each item section in Locker Room (STICKS, FACEOFF STICKS, TAPE, HELMETS + VISORS, COLLARS, CHEST, SHORTS,
     CLEATS, CHIRPS, CELLYS, TROPHIES, and all of them in ALL) is split into tier rows like CARDS:
     LEGACY, LEGENDARY, RARE, COMMON (empty tiers skipped). Inside a tier the old order stays.
   - The separate "N/A ... HONOR PACK" rows (v491vetsitems.js) are folded back into their section; each of those
     items sorts into its own rarity and wears a small N/A tag. Collab items (Good Stick) wear a small COLLAB tag.
   - Uniforms: inside each team's row, the uniforms go highest rarity first (team rows and tabs unchanged).
   No ids, rl_* keys, saves or net protocol change. Kill switch: window.__rl_no535ls = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no535ls || W.LKS535) return;
 const S = W.LKS535 = { n: 0, err: [] };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + (e && e.message || e)); };
 const off = () => !!W.__rl_no535ls;
 const TIERS = [ [ 'L', 'LEGACY', '#f5dd8f' ], [ 2, 'LEGENDARY', '#ffcc33' ], [ 1, 'RARE', '#3d8bff' ], [ 0, 'COMMON', '#9aa3ab' ] ];
 const BY = id => { try { return W.V17 && V17.BY ? V17.BY[id] : null; } catch (e) { return null; } };
 function tierOf(cd) {
  const it = BY(cd.getAttribute('data-v'));
  if (cd.classList.contains('lg23') || it && (it.leg20 || it.lg2313 && !W.__rl_no2313)) return 'L';
  const m = /(?:^|\s)r([0-2])(?:\s|$)/.exec(cd.className);
  if (m) return +m[1];
  return it && it.rar != null ? it.rar | 0 : 0;
 }
 function tag(cd, txt) {
  try {
   if (cd.querySelector('.tag535') || cd.querySelector('.tag2311')) return;
   const art = cd.querySelector('.art');
   if (!art) return;
   const i = document.createElement('i');
   i.className = 'tag2311 tag535';
   i.textContent = txt;
   art.appendChild(i);
  } catch (e) {}
 }
 const cardsOf = sec => { const g = sec.querySelector(':scope > .grid17'); return g ? [ ...g.children ].filter(c => c.classList.contains('c17') && c.hasAttribute('data-v')) : []; };
 function sortItems(root) {
  let ch = false;
  // 1) fold N/A rows back into the section above them
  for (const na of [ ...root.querySelectorAll('.sec17.na491') ]) {
   const prev = na.previousElementSibling;
   const g = prev && prev.classList.contains('sec17') && prev.querySelector(':scope > .grid17');
   if (!g) continue;
   const cs = cardsOf(na);
   for (const cd of cs) { tag(cd, 'N/A'); g.appendChild(cd); }
   try {
    const a = prev.querySelector(':scope > .sh17 span'), b = na.querySelector(':scope > .sh17 span');
    const ma = a && /^(\d+) \/ (\d+)$/.exec(a.textContent.trim()), mb = b && /^(\d+) \/ (\d+)$/.exec(b.textContent.trim());
    if (ma && mb) a.textContent = (+ma[1] + +mb[1]) + ' / ' + (+ma[2] + +mb[2]);
   } catch (e) {}
   na.remove();
   ch = true;
  }
  // 2) tier rows inside every item section
  for (const sec of [ ...root.querySelectorAll('.sec17') ]) {
   if (sec.classList.contains('row22') || sec.classList.contains('uni2319') || sec.classList.contains('lk535')) continue;
   const g = sec.querySelector(':scope > .grid17');
   if (!g) continue;
   const cs = cardsOf(sec);
   if (!cs.length || !cs.every(c => c.getAttribute('data-a') === 'v17lsel')) continue;
   const groups = { L: [], 2: [], 1: [], 0: [] };
   for (const cd of cs) {
    const it = BY(cd.getAttribute('data-v'));
    if (it && it.collab) tag(cd, 'COLLAB');
    else if (it && (it.v491 || /_v491/.test(it.id))) tag(cd, 'N/A');
    (groups[tierOf(cd)] || groups[0]).push(cd);
   }
   const rest = [ ...g.children ].filter(c => cs.indexOf(c) < 0);
   const box = document.createElement('div');
   box.className = 'tiers535';
   for (const [k, name, col] of TIERS) {
    const l = groups[k];
    if (!l.length) continue;
    const un = l.filter(c => !c.classList.contains('lk')).length;
    const row = document.createElement('div');
    row.className = 'tr535';
    row.innerHTML = '<div class="th535" style="color:' + col + '">' + name + ' <span>' + un + ' / ' + l.length + '</span></div><div class="grid17"></div>';
    const rg = row.querySelector('.grid17');
    for (const cd of l) rg.appendChild(cd);
    box.appendChild(row);
   }
   for (const r of rest) box.appendChild(r);
   g.replaceWith(box);
   sec.classList.add('lk535');
   ch = true;
  }
  return ch;
 }
 let uniRar = null;
 function rarUni(tid, k) {
  try {
   if (!W.UNI21 || typeof UNI21.itemId !== 'function') return 0;
   const it = BY(UNI21.itemId(tid, +k));
   return it && it.rar != null ? it.rar | 0 : 0;
  } catch (e) { return 0; }
 }
 function sortUni(root) {
  let ch = false;
  for (const sec of [ ...root.querySelectorAll('.sec17.uni2319') ]) {
   const g = sec.querySelector(':scope > .grid17');
   if (!g) continue;
   const ts = [ ...g.children ];
   const keyed = ts.map((el, i) => {
    const v = String(el.getAttribute('data-v') || ''), p = v.lastIndexOf('|');
    return { el: el, i: i, r: p > 0 ? rarUni(v.slice(0, p), v.slice(p + 1)) : -1 };
   });
   const sorted = keyed.slice().sort((a, b) => b.r - a.r || a.i - b.i);
   if (sorted.every((x, i) => x === keyed[i])) continue;
   for (const x of sorted) g.appendChild(x.el);
   ch = true;
  }
  return ch;
 }
 function post(h) {
  if (off() || typeof h !== 'string' || h.indexOf('lockList') < 0) return h;
  const T = document.createElement('template');
  T.innerHTML = h;
  const L = T.content.querySelector('#lockList');
  if (!L) return h;
  let ch = false;
  try { ch = sortItems(L) || ch; } catch (e) { fail('items', e); }
  try { ch = sortUni(L) || ch; } catch (e) { fail('uni', e); }
  if (ch) S.n++;
  return ch ? T.innerHTML : h;
 }
 S.post = post;
 function hook() {
  try {
   if (typeof PANEL_RENDER !== 'object' || !PANEL_RENDER || typeof PANEL_RENDER.locker17 !== 'function') return false;
   if (PANEL_RENDER.locker17.__lks535) return true;
   const R0 = PANEL_RENDER.locker17;
   const R1 = function () { const h = R0.apply(this, arguments); try { return post(h); } catch (e) { fail('post', e); return h; } };
   for (const k in R0) { try { R1[k] = R0[k]; } catch (e) {} }
   R1.__lks535 = true;
   PANEL_RENDER.locker17 = R1;
   return true;
  } catch (e) { fail('hook', e); return false; }
 }
 if (!hook()) { let n = 0; const iv = setInterval(() => { if (hook() || ++n > 60) clearInterval(iv); }, 500); }
 // a later file that re-wraps the locker would sit outside us; check again once things settle
 setTimeout(() => { try { if (PANEL_RENDER.locker17 && !PANEL_RENDER.locker17.__lks535) hook(); } catch (e) {} }, 4000);
 try {
  const st = document.createElement('style');
  st.textContent = '#panel .tiers535{display:block}#panel .tr535{margin:0 0 4px}#panel .th535{font-size:9px;margin:2px 0 3px;letter-spacing:.5px}#panel .th535 span{color:#7f9aa6;font-size:8px}#panel .c17 .tag535{color:#ffe14d;border-color:#ffe14d;background:rgba(10,10,14,.9)}#panel .c17.lk .tag535{color:#8f8a60;border-color:#6a6440}';
  (document.head || document.documentElement).appendChild(st);
 } catch (e) { fail('css', e); }
})();
