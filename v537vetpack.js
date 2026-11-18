/* v537vetpack.js - the VETERANS DAY HONOR PACK shows (and grants) its CELLYS + STICKS like any other pack (Bagga Lax).
   Charlie (Nov 12 2026 12:17 AM ET): "the veterans pack doesn't show the celly and sticks inside it".
   Cause: the pack (v489vets.js) is the game's own bundle, but its bundle list only held the SIX SERVICE TEAMS item + the two
   pack uniforms. The 3 sticks (STARS + STRIPES, RED WHITE + BLUE, HONOR WHITE) and the 2 cellys (CHOPPER EXTRACT,
   FIREWORKS) are made by v491vetsitems.js and handed out on the side once the pack is owned, so the shop tile's icon row,
   SEE WHAT'S INSIDE, the "BUY ALL N" count and the NICE PULL reveal never listed them (only one line of small text did).
   Fix (every host + the app, wherever the pack itself shows):
   - the 5 items join the pack's bundle list -> SEE WHAT'S INSIDE shows them as cards, BUY ALL counts them, the buy grants
     them through the game's own bundle path (same as other packs) and the reveal flips them.
   - the YARD SALE tile gets their icons in its icon row; the text names the 3 sticks.
   - anyone who already owns the pack (pack key, the teams item in the save, or the bundle buy record) gets any of the 5
     they never received, once each (v491's own once-only record, rl_vi491got, so a broken stick stays broken).
   Ids, rl_* keys, saves, prices and the net protocol are unchanged. No new save keys.
   Kill switch: window.__rl_no537vp = true (set before this file loads). */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no537vp || W.__rl537vp) return;
 const S = W.__rl537vp = { err: [], log: [], added: [], grants: [] };
 const fail = (w, e) => { if (S.err.length < 20) S.err.push(w + ': ' + String(e && e.message || e)); try { console.warn('v537vp', w, e); } catch (x) {} };
 const KEY = 'vets489';
 const off = () => !!(W.__rl_no537vp || W.__rl_v124gb || W.__rl_no489vets || W.__rl_no491vi || !W.V17 || !V17.BY || !W.VETS489 || !W.VI491);
 const items = () => { try { return Array.isArray(VI491.ids) ? VI491.ids.filter(id => V17.BY[id]) : []; } catch (e) { return []; } };
 const pack = () => { try { return V17.PACKS && V17.PACKS[KEY]; } catch (e) { return null; } };
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

 // 1) the 5 items join the bundle (same array object the game's bundle screen + buy read)
 function addToBundle() {
  if (off()) return false;
  const P = pack();
  if (!P || !Array.isArray(P.bundle)) return false;
  for (const id of items()) if (P.bundle.indexOf(id) < 0) { P.bundle.push(id); S.added.push(id); }
  return true;
 }
 S.addToBundle = addToBundle;

 // 2) owners get what they're missing (once each, v491's record)
 function owned() {
  try { if (VETS489.owns && VETS489.owns()) return true; } catch (e) {}
  try { const st = V17.ST(); return !!(st && st.b287 && st.b287[KEY]); } catch (e) { return false; }
 }
 function topUp(why) {
  if (off() || !owned()) return 0;
  let n = 0;
  try {
   let hasKey = false;
   try { const v = localStorage.getItem('rl_vets489own'); hasKey = !!v && v !== '0' && v !== 'false' && v !== 'null'; } catch (e) {}
   if (!hasKey) {
    // owned through the save (cloud restore / bundle record) but this device never set the pack key: set it the way v489 does
    try { if (VETS489.markOwned) VETS489.markOwned(); } catch (e) { fail('mark', e); }
    try { if (!localStorage.getItem('rl_vets489own')) localStorage.setItem('rl_vets489own', JSON.stringify(Date.now())); } catch (e) {}
   }
   if (VI491.grantAll) n = VI491.grantAll('v537' + (why ? ':' + why : '')) || 0;
   if (n) { S.grants.push([ why, n, Date.now() ]); try { if (typeof panelDirty === 'function') panelDirty(); } catch (e) {} }
  } catch (e) { fail('top', e); }
  return n;
 }
 S.topUp = topUp;


 // the game draws both pack cellys with one shared fallback tile; v491 swaps in their own art in the locker, here we do the
 // same in the pack's own views (the inside view, the NICE PULL reveal, the shop tile icons)
 const CEL = [ [ 'celly_v491chop', 'CHOPPER EXTRACT' ], [ 'celly_v491fw', 'FIREWORKS' ] ];
 function cellyIcon(id) { try { return VI491.iconFor ? VI491.iconFor(id, false) : null; } catch (e) { return null; } }
 function fixCellyArt(h) {
  if (typeof h !== 'string' || !W.VI491 || !VI491.iconFor) return h;
  let fb = [];
  try { fb = [ V17.iconUrl(CEL[0][0], false), V17.iconUrl(CEL[0][0], true) ].filter(Boolean); } catch (e) { return h; }
  for (let k = 0; k < fb.length; k++) {
   const a = fb[k];
   if (!a || h.indexOf(a) < 0) continue;
   let out = '', i = 0, j;
   while ((j = h.indexOf(a, i)) >= 0) {
    const back = h.slice(Math.max(0, j - 1200), j);
    let best = null, bp = -1;
    for (const [id, nm] of CEL) {
     const p = Math.max(back.lastIndexOf(id), back.lastIndexOf('"' + nm + '"'), back.lastIndexOf(': ' + nm + '"'), back.lastIndexOf('>' + nm + '<'));
     if (p > bp) { bp = p; best = id; }
    }
    let rep = null;
    try { rep = best ? VI491.iconFor(best, k === 1) : null; } catch (e) {}
    out += h.slice(i, j) + (rep || a);
    i = j + a.length;
   }
   h = out + h.slice(i);
  }
  return h;
 }

 // 3) the YARD SALE tile: icons for the 5 in its icon row + plain words for the sticks; the inside view drops the old note
 const OLD = 'RWB STICKS, CHOPPER EXTRACT CELLY, FIREWORKS CELLY';
 const NEW = '3 RED, WHITE + BLUE STICKS (STARS + STRIPES, RED WHITE + BLUE, HONOR WHITE) + 2 CELLYS (CHOPPER EXTRACT, FIREWORKS)';
 function miniHtml() {
  return items().map(id => {
   let src = '';
   try { src = (/^celly_/.test(id) && cellyIcon(id)) || V17.iconUrl(id); } catch (e) {}
   const it = V17.BY[id] || {};
   return '<span class="hwi16 vp537" style="border-color:#ffcc33" title="' + esc(it.n) + '"><img alt="' + esc(it.n) + '" src="' + src + '"></span>';
  }).join('');
 }
 function fixTile(h) {
  const a = h.indexOf('id="vets489tile"');
  if (a < 0) return h;
  let out = h;
  const t0 = out.lastIndexOf('<div', a);
  const r = out.indexOf('<div class="hwr16">', a);
  if (r > 0 && out.indexOf('vp537', a) < 0) {
   const end = out.indexOf('</div>', r);
   if (end > 0) out = out.slice(0, end) + miniHtml() + out.slice(end);
  }
  const s = out.indexOf(OLD, t0);
  if (s > 0 && s < out.indexOf('</small>', t0)) out = out.slice(0, s) + NEW + out.slice(s + OLD.length);
  return out;
 }
 function hookRender() {
  try {
   const R0 = typeof PANEL_RENDER === 'object' && PANEL_RENDER ? PANEL_RENDER.shop17 : null;
   if (typeof R0 === 'function' && !R0.__rl537) {
    const R1 = function () {
     const h = R0.apply(this, arguments);
     if (off() || typeof h !== 'string') return h;
     try { addToBundle(); return fixTile(h); } catch (e) { fail('shop', e); return h; }
    };
    for (const k in R0) { try { R1[k] = R0[k]; } catch (e) {} }   // keep the other files' marks (v502 / v531 / v536) so none wraps twice
    R1.__rl537 = 1;
    PANEL_RENDER.shop17 = R1;
   }
   const B0 = typeof PANEL_RENDER === 'object' && PANEL_RENDER ? PANEL_RENDER.bnd17 : null;
   if (typeof B0 === 'function' && !B0.__rl537) {
    const B1 = function () {
     if (!off()) try { addToBundle(); } catch (e) {}
     const h = B0.apply(this, arguments);
     if (off() || typeof h !== 'string' || h.indexOf('VETERANS DAY HONOR PACK') < 0) return h;
     return fixCellyArt(h.replace('ALSO IN THE PACK: ' + OLD + ' + ', 'ALSO IN THE PACK: '));
    };
    for (const k in B0) { try { B1[k] = B0[k]; } catch (e) {} }
    B1.__rl537 = 1;
    PANEL_RENDER.bnd17 = B1;
   }
   const P0 = typeof PANEL_RENDER === 'object' && PANEL_RENDER ? PANEL_RENDER.pack17 : null;
   if (typeof P0 === 'function' && !P0.__rl537) {
    const P1 = function () {
     const h = P0.apply(this, arguments);
     if (off() || typeof h !== 'string' || h.indexOf('VETERANS DAY HONOR PACK') < 0) return h;
     try { return fixCellyArt(h); } catch (e) { fail('reveal', e); return h; }
    };
    for (const k in P0) { try { P1[k] = P0[k]; } catch (e) {} }
    P1.__rl537 = 1;
    PANEL_RENDER.pack17 = P1;
   }
   const A0 = typeof PANEL_ACT === 'object' && PANEL_ACT ? PANEL_ACT.v17buy : null;
   if (typeof A0 === 'function' && !A0.__rl537) {
    const A1 = function (v) {
     if (v === KEY && !off()) try { addToBundle(); } catch (e) {}
     const r = A0.apply(this, arguments);
     if (v === KEY && !off()) try { topUp('buy'); } catch (e) {}
     return r;
    };
    for (const k in A0) { try { A1[k] = A0[k]; } catch (e) {} }
    A1.__rl537 = 1;
    PANEL_ACT.v17buy = A1;
   }
  } catch (e) { fail('hook', e); }
 }
 try {
  const css = '.hwi16.vp537{box-shadow:0 0 4px rgba(255,204,51,.6)}';
  const st = document.createElement('style'); st.id = 'v537vpcss'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
 } catch (e) {}

 function boot() {
  if (off()) return;
  addToBundle();
  hookRender();
  topUp('load');
 }
 boot();
 // the save / other files can settle a moment later (cloud restore, liveops): check again a few times
 [ 1200, 4000, 10000 ].forEach(ms => setTimeout(() => { try { boot(); } catch (e) { fail('boot', e); } }, ms));
})();
