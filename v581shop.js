/* v581shop.js - 1.4 SHOP / ITEM FIXES (Bagga Lax 1.4, Charlie's Nov 19 list: #2, #3, #4, #9).
 * #2 Bug: the Turkey Leg stick card shows no "xN" count.
 *    Cause: v565's leaf-card CSS forces `.c17.tk565 .ct{color:#000!important}` - the count badge has a black
 *    background, so "x3" was black on black (it was there, just invisible).
 *    Fix: one CSS rule after it: the count badge on turkey cards is white on black again.
 * #3 Bug: RELAX PAL text blends into its background.
 *    Cause: the Yard Sale (v580) bakes every featured title in dark brown (#2a1606) for the light pack banners; the
 *    Relax Pal banner is dark purple. The chirp bubble art is black-filled on a dark card frame.
 *    Fix: the Relax Pal banner title is re-baked in gold with a dark shadow; its art frame + its card art get a light
 *    backdrop (shop banner, locker card, item card).
 * #4 Bug: owned packs can't be bought again (Good Stick, Halloween, Veterans). Rebuy must give ONLY stackable gear.
 *    Cause: those tiles show OWNED / TOURNAMENT once owned; only the items17 bundles (b2504*, tk565) had BUY AGAIN.
 *    Fix: the stackable pieces of the Good Stick pack (2 sticks + tape) and the Halloween pack (2 sticks, 2 tapes,
 *    cleats) are registered as items17 bundles gsc581 / hw581, and the owned tiles get a "<price> AGAIN" button that
 *    runs the game's own v17buy -> buyBundle2504 path (V17.rebuy580 rules: team, uniforms, cards, cellys, trophies
 *    are never given again; the price shown is read from the same cost the purchase charges). Veterans gets the same
 *    button for its existing vets489 bundle (the 3 sticks). Every BUY AGAIN button gets an OWNED tag next to it.
 *    Not rebuyable (nothing stackable inside, so a rebuy would charge for nothing): RELAX PAL (one chirp), THE WHALE /
 *    THE CROWN (uniform pick), the GHOSTS team unlock.
 * #9 Bug: the FREE LEGENDARY PACK (3 ads, v514) and DAILY DIMES (v470) are missing from the Yard Sale DAILY FREE box.
 *    Cause: v580 moves ad tiles into DAILY FREE only while it builds the layout. v470/v514 add or refresh their tiles
 *    later, straight into #shopList, where v580 keeps them hidden; v514 then fails on insertBefore (its anchor tile
 *    now lives inside the new layout) and its tile stays in the hidden source block.
 *    Fix: after every shop change, #ad470tile and #ad514leg are moved into the DAILY FREE column (their own click
 *    listeners and ad flow are untouched; nothing is granted here).
 * No ids, rl_* keys or net protocol changed. Kill switch: window.__rl_no581shop = true (each part is try/catch).
 */
(function () {
 'use strict';
 const W = window, D = document;
 if (W.__rl_no581shop || W.__rl_v124gb || W.V581S) return;
 const V = W.V581S = { err: [], log: [] };
 const off = () => !!(W.__rl_no581shop || W.__rl_v124gb);
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e).slice(0, 200)); };
 const ST = () => { try { return V17.ST(); } catch (e) { return null; } };

 /* ---------- CSS (#2 count badge, #3 relax pal, #4 OWNED tag) ---------- */
 try {
  const css = '#panel .c17.tk565 i.ct,.c17.tk565 i.ct,#panel .c17[aria-label^="TURKEY LEG STICK"] i.ct{color:#fff!important;background:rgba(0,0,0,.78)!important;text-shadow:none!important}'
   + '.c17.rx581 .art,.c17[data-v="chirp_c173_relax_01"] .art,#panel .c17[data-v="chirp_c173_relax_01"] .art{background:radial-gradient(circle,#fff3c0 0,#d9a520 55%,#5a3a08 100%)!important}'
   + '.s6hero.rx581 .s6frame{background:radial-gradient(circle,#fff3c0 0,#d9a520 60%,#4a2a06 100%)!important}'
   + '.s6th.rx581 .s6tha{background:radial-gradient(circle,#fff3c0,#d9a520 70%)}'
   + '.s6buyw.ag581{position:relative}.s6buyw.ag581 .own581,.own581{display:inline-block;font:bold 9px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px;color:#0b1a20;background:#3dffc8;border:2px solid #0b1a20;padding:2px 4px;margin:0 0 3px;box-shadow:0 2px 0 #000;text-transform:uppercase}'
   + '#panel .s6fl #ad514leg{flex-direction:column;align-items:stretch;gap:4px}#panel .s6fl #ad514leg button{min-width:0;width:100%}'
   + '.s6pk.ag581 .own581,.s6i.ag581 .own581{position:static;margin:0 0 3px}.s6pk.ag581,.s6i.ag581{position:relative}';
  const st = D.createElement('style'); st.id = 'v581shopcss'; st.textContent = css; (D.head || D.documentElement).appendChild(st);
 } catch (e) { fail('css', e); }

 /* ---------- #4 rebuy bundles (only the stackable pieces) ---------- */
 const GSC = [ 'stick_gsc_shortie', 'stick_gsc_goalie', 'tape_gsc' ];
 const HWS = [ 'stick_orange', 'stick_spooky', 'tape_purple', 'tape_orange', 'cleats_orange' ];
 const gscPrice = () => { try { const p = W.GSC501 && GSC501.price && GSC501.price(); if (p > 0) return p; } catch (e) {} return 20; };
 const hwPrice = () => { try { const p = V17.hw16 && V17.hw16.pack && V17.hw16.pack.cost; if (p > 0) return p; } catch (e) {} return 15; };
 function regPacks() {
  const P = W.V17 && V17.PACKS, BY = W.V17 && V17.BY;
  if (!P || !BY) return false;
  if (!P.gsc581 && GSC.every(id => BY[id])) P.gsc581 = { n: 'GOOD STICK PACK', get cost() { return gscPrice(); }, bundle: GSC.slice(), r581: 1 };
  if (!P.hw581 && HWS.every(id => BY[id])) P.hw581 = { n: 'HALLOWEEN PACK', get cost() { return hwPrice(); }, bundle: HWS.slice(), r581: 1 };
  return !!(P.gsc581 && P.hw581);
 }
 const canRe = k => { try { return !off() && regPacks() !== null && !!(V17.rebuy580 && V17.rebuy580(k)); } catch (e) { return false; } };
 const gscOwned = () => { try { return !!(W.GSC501 && GSC501.owned && GSC501.owned()); } catch (e) { return false; } };
 const hwOwned = () => { try { return !!(V17.hw16 && V17.hw16.owned && V17.hw16.owned()); } catch (e) { return false; } };
 const vetsOwned = () => { try { const s = ST(); return !!(V17.PACKS.vets489 && (s && s.b287 && s.b287.vets489 || V17.PACKS.vets489.bundle.every(id => (s.inv[id] | 0) > 0))); } catch (e) { return false; } };
 const coin = '<span class="coin17"></span>';
 const againBtn = (k, cost, name) => { const ok = (ST() && ST().chinos | 0) >= cost; return '<button type="button" data-a="v17buy" data-v="' + k + '" class="' + (ok ? 'y' : 'd') + ' rb581" aria-label="BUY AGAIN - ' + name + ' (STACKABLE GEAR ONLY)">' + coin + cost + ' AGAIN</button>'; };
 V.againBtn = againBtn;
 function patchShop(h) {
  if (off() || typeof h !== 'string') return h;
  regPacks();
  // Good Stick: its OWNED button inside #gsc501tile
  try {
   const i = h.indexOf('id="gsc501tile"');
   if (i >= 0 && gscOwned() && canRe('gsc581')) {
    const j = h.indexOf('class="hw16', i + 10), end = j > 0 ? j : h.length;
    const seg = h.slice(i, end), m = seg.match(/<button type="button" class="d"[^>]*>OWNED<\/button>/);
    if (m) h = h.slice(0, i) + seg.replace(m[0], againBtn('gsc581', V17.PACKS.gsc581.cost, 'GOOD STICK PACK')) + h.slice(end);
   }
  } catch (e) { fail('gsc', e); }
  // Halloween: the OWNED button (data-a v17hw)
  try {
   const m = h.match(/<button type="button" class="d" data-a="v17hw" aria-label="HALLOWEEN PACK OWNED">OWNED<\/button>/);
   if (m && hwOwned() && canRe('hw581')) h = h.replace(m[0], againBtn('hw581', V17.PACKS.hw581.cost, 'HALLOWEEN PACK'));
  } catch (e) { fail('hw', e); }
  // Veterans: owned tile shows TOURNAMENT only -> add BUY AGAIN for its bundle (3 sticks)
  try {
   const t = '<button type="button" class="y" data-a="vets489tour"';
   const i = h.indexOf(t);
   if (i >= 0 && h.indexOf('data-v="vets489" class') < 0 && vetsOwned() && canRe('vets489')) {
    const e = h.indexOf('</button>', i) + 9;
    h = h.slice(0, e) + againBtn('vets489', V17.PACKS.vets489.cost, 'VETERANS DAY HONOR PACK') + h.slice(e);
   }
  } catch (e) { fail('vets', e); }
  // every "N AGAIN" button (items17 bundles, turkey, ours) gets the rb581 mark for the OWNED tag
  try { h = h.replace(/<button([^>]*data-a="v17buy"[^>]*)class="([^"]*)"([^>]*)>(<span class="coin17"><\/span>\d+ AGAIN)<\/button>/g, (a, x, c, y, t) => c.indexOf('rb581') >= 0 ? a : '<button' + x + 'class="' + c + ' rb581"' + y + '>' + t + '</button>'); } catch (e) { fail('mark', e); }
  return h;
 }
 V.patchShop = patchShop;
 function wrapShop() {
  if (typeof PANEL_RENDER !== 'object' || typeof PANEL_RENDER.shop17 !== 'function' || PANEL_RENDER.shop17.__v581) return;
  const R0 = PANEL_RENDER.shop17;
  const R1 = function () { const h = R0.apply(this, arguments); try { return patchShop(h); } catch (e) { fail('wrap', e); return h; } };
  R1.__v581 = 1; for (const k of Object.keys(R0)) { try { R1[k] = R0[k]; } catch (e) {} }
  PANEL_RENDER.shop17 = R1;
 }
 try { regPacks(); wrapShop(); } catch (e) { fail('init', e); }

 /* ---------- after-render DOM pass: OWNED tags (#4), Relax Pal banner (#3), ad tiles (#9) ---------- */
 const FONT0 = () => { try { return FONT; } catch (e) { return null; } };
 const pxC = {};
 function pxImg(s, cs, col, sh) {
  const F = FONT0(); if (!F) return null;
  s = String(s).toUpperCase(); cs = Math.round(cs * 2);
  const k = s + '|' + cs + col + sh;
  if (!pxC[k]) {
   const c = D.createElement('canvas'), o = sh ? cs : 0;
   c.width = Math.max(1, (s.length * 4 - 1) * cs + o); c.height = 5 * cs + o;
   const x = c.getContext('2d');
   const dr = (ox, oy, cl) => { x.fillStyle = cl; for (let i = 0; i < s.length; i++) { const gl = F[s[i]] || F['?']; if (!gl) continue; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (gl[r] && gl[r][q] === '#') x.fillRect(ox + (i * 4 + q) * cs, oy + r * cs, cs, cs); } };
   if (sh) dr(o, o, sh); dr(0, 0, col);
   pxC[k] = { src: c.toDataURL(), w: c.width / 2, h: c.height / 2 };
  }
  return pxC[k];
 }
 function domPass() {
  if (off()) return;
  const pn = D.getElementById('panel'); if (!pn) return;
  const list = pn.querySelector('#shopList'); if (!list) return;
  const root = list.querySelector('.u580root');
  // #4 OWNED tag beside every BUY AGAIN button (v580 layout or the old list)
  try {
   pn.querySelectorAll('button.rb581').forEach(b => {
    const w = b.closest('.s6buyw') || b.parentNode; if (!w || w.querySelector('.own581')) return;
    if (b.closest('.u580src')) return;
    w.classList.add('ag581');
    const t = D.createElement('span'); t.className = 'own581'; t.textContent = 'OWNED'; t.setAttribute('aria-label', 'YOU OWN THIS PACK');
    w.insertBefore(t, w.firstChild);
    const card = b.closest('.s6pk,.s6i'); if (card) card.classList.add('ag581');
   });
   // featured thumbnails: price line gets a small OWNED marker too
   if (root) root.querySelectorAll('.s6hero').forEach((s, i) => {
    if (!s.querySelector('button.rb581')) return;
    const th = root.querySelector('.s6th[data-u580th="' + (s.dataset.i || i) + '"]');
    if (th && !th.querySelector('.own581')) { const t = D.createElement('span'); t.className = 'own581'; t.textContent = 'OWNED'; t.style.cssText = 'position:absolute;bottom:3px;left:4px;font-size:7px;padding:1px 2px;margin:0'; th.style.position = 'relative'; th.appendChild(t); }
   });
  } catch (e) { fail('own', e); }
  // #3 Relax Pal banner title in gold
  try {
   if (root) root.querySelectorAll('.s6hero').forEach(s => {
    if (s.classList.contains('rx581') || !s.querySelector('[data-a="v17relax27"],[data-a="v17play"][data-v="c173_relax_01"]')) return;
    s.classList.add('rx581');
    const im = s.querySelector('.s6ht img'), p = pxImg(im && im.alt || 'RELAX PAL', 3.5, '#ffe14d', '#2a1606');
    if (im && p) { im.src = p.src; im.style.width = p.w + 'px'; im.style.height = p.h + 'px'; }
    const th = root.querySelector('.s6th[data-u580th="' + s.dataset.i + '"]'); if (th) th.classList.add('rx581');
   });
  } catch (e) { fail('relax', e); }
  // #9 ad tiles into DAILY FREE
  try {
   const fl = root && root.querySelector('.s6fl');
   if (fl) {
    // order: DAILY PACK, DAILY DIMES (v470), FREE LEGENDARY (v514), then the rest. The legendary tile always sits
    // right after v470's tile: v514 looks for that spot itself, so it never tries to move it again.
    const a = list.querySelector('#ad470tile'), leg = list.querySelector('#ad514leg');
    const dp = [...fl.children].find(c => c !== a && c !== leg && c.querySelector('[data-a="v17buy"][data-v="daily"]'));
    let at = dp ? dp.nextSibling : null;
    for (const t of [ a, leg ]) {
     if (!t) continue;
     t.classList.add('s6adt');
     if (t.parentNode !== fl || (at !== t && t.previousSibling !== (t === leg && a ? a : dp))) { fl.insertBefore(t, at); V.log.push('moved ' + t.id); if (V.log.length > 20) V.log.shift(); }
     at = t.nextSibling;
    }
   }
  } catch (e) { fail('ads', e); }
 }
 V.domPass = domPass;
 let qd = false;
 const kick = () => { if (qd) return; qd = true; Promise.resolve().then(() => { qd = false; try { domPass(); } catch (e) { fail('pass', e); } }); };
 function boot() {
  const pn = D.getElementById('panel');
  if (!pn || typeof MutationObserver !== 'function') { setTimeout(boot, 600); return; }
  // created after v580's observer, so it runs after v580 has built the layout
  new MutationObserver(() => { if (pn.dataset.scr === 'shop17' || pn.querySelector('#shopList')) kick(); }).observe(pn, { childList: true, subtree: true });
  setInterval(() => { try { wrapShop(); regPacks(); if (pn.querySelector('#shopList')) domPass(); } catch (e) {} }, 1500);
  // the big item card (.v40cl) has no data-v: mark the Relax Pal one by its name
  setInterval(() => { try { if (off()) return; D.querySelectorAll('.v40cl .c17:not(.rx581) .nm').forEach(n => { if (/^"?RELAX PAL"?$/.test(n.textContent.trim())) n.closest('.c17').classList.add('rx581'); }); } catch (e) {} }, 400);
 }
 if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
