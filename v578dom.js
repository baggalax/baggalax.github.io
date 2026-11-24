/* v578dom.js - 1.4 UI refresh, HTML panels (Chucks' approved mockups 03 YARD SALE, 04 LOCKER ROOM).
 * Bug/ask: Charlie approved Chucks' refresh for the two HTML panels: pixel-font titles, the long grey info lines turned into
 *   small chips, a clear BUY price button with "you have X" under it, LIMITED chips, a locker progress bar, tab dividers +
 *   a MORE > hint, and short empty-section notes with a dashed slot. Body text stays in the regular font.
 * Cause: the panels are rebuilt as HTML strings by PANEL_RENDER.shop17 / locker17 (and patched live by v489/v502 timers).
 * Fix: a MutationObserver on #panel restyles the finished DOM after every render. It only adds classes, chips and hides
 *   (never removes) nodes other add-ons update (.lt489 / .lo502left timers), and it never touches data-a / data-v / ids,
 *   so every tap goes to exactly the same handler. Sections stay stacked in their original order. Idempotent (marks
 *   what it did), so its own edits do not loop. Anything it does not recognise is left exactly as it was.
 * No ids, rl_* keys or network protocol touched.
 * Kill switch: window.__rl_no578dom = true (checked on every render; the next render is the old look).
 */
(function () {
 'use strict';
 const Wn = window, D = document;
 const off = () => !!(Wn.__rl_no578dom || Wn.__rl_v124gb);
 const V = Wn.V578D = { err: null, n: 0 };
 const panel = D.getElementById('panel');
 if (!panel || typeof MutationObserver !== 'function') return;

 // the game's own 3x5 FONT -> crisp pixel image (titles only)
 const pxCache = {};
 function px(s, cs, col, sh) {
  s = String(s).toUpperCase();
  const k = s + '|' + cs + col + sh;
  if (!pxCache[k]) {
   const c = D.createElement('canvas'), o = sh ? cs : 0;
   c.width = (s.length * 4 - 1) * cs + o; c.height = 5 * cs + o;
   const x = c.getContext('2d');
   const draw = (ox, oy, cl) => { x.fillStyle = cl; for (let i = 0; i < s.length; i++) { const gl = FONT[s[i]] || FONT['?']; if (!gl) continue; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (gl[r] && gl[r][q] === '#') x.fillRect(ox + (i * 4 + q) * cs, oy + r * cs, cs, cs); } };
   if (sh) draw(o, o, sh); draw(0, 0, col);
   pxCache[k] = { u: c.toDataURL(), w: c.width / 2, h: c.height / 2 };
  }
  const p = pxCache[k];
  return '<img class="u578px" alt="' + s + '" src="' + p.u + '" style="width:' + p.w + 'px;height:' + p.h + 'px">';
 }
 const CSS = `
 #panel .u578px{image-rendering:pixelated;vertical-align:middle;display:inline-block}
 #panel .u578chips{display:flex;gap:5px;align-items:center;margin-top:4px;flex-wrap:wrap}
 #panel .u578c{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #0b1a20;box-shadow:0 2px 0 #000;background:#1b2a33;color:#cfe;font-size:9px;line-height:1.2;white-space:nowrap;font-style:normal;font-weight:normal}
 #panel .u578c i{display:inline-block;width:8px;height:8px;border:1px solid #0b1a20}
 #panel .u578g{background:#7dff7a;color:#0b1a20}#panel .u578y{background:#ffcc33;color:#0b1a20}#panel .u578r{background:#e8443a;color:#fff}#panel .u578t{background:#3dffc8;color:#0b1a20}#panel .u578v{background:#b9a8ff;color:#0b1a20}
 #panel .u578hide{display:none!important}
 #panel .u578inc{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}
 #panel .u578inc span{background:rgba(255,255,255,.1);border:1px solid rgba(255,204,51,.6);color:#fff;padding:1px 5px;font-size:9px}
 #panel .u578inc span b{color:#ffd84d}
 #panel button.u578price{opacity:1;position:relative;display:inline-flex;align-items:center;gap:6px;justify-content:center;background:#ffcc33;color:#0b1a20;border:2px solid #0b1a20;box-shadow:0 3px 0 #000,inset 0 2px 0 rgba(255,255,255,.5);font-size:18px;padding:6px 14px;min-width:130px}
 #panel button.u578price small{font-size:10px;color:#0b1a20!important;opacity:1!important}
 #panel .u578need{font-size:8px;color:#ff9a8a;text-align:center;margin-top:3px;background:rgba(5,10,14,.8);padding:1px 4px}
 #panel button.u578sec{background:#c9d6d9;color:#0b1a20;border:2px solid #0b1a20;box-shadow:0 2px 0 #000}
 #panel .tabs.u578tabs button{white-space:nowrap;box-shadow:0 2px 0 #000}
 #panel .tabs.u578tabs button.on{box-shadow:0 2px 0 #000,0 0 0 2px #fff6c0}
 #panel .u578dv{flex:0 0 2px;align-self:stretch;background:#2a3a44;margin:0 3px}
 #panel .u578more{position:absolute;pointer-events:none;display:flex;align-items:center;justify-content:flex-end;padding-right:6px;background:linear-gradient(90deg,rgba(8,14,20,0),rgba(8,14,20,.97) 55%);z-index:5}
 #panel .u578prog{display:flex;align-items:center;gap:8px;padding:2px 0 4px;flex-wrap:wrap}
 #panel .u578bar{width:150px;height:10px;background:#0b1a20;border:2px solid #000;position:relative;box-shadow:0 2px 0 #000}
 #panel .u578bar i{position:absolute;left:0;top:0;bottom:0;background:#7dff7a}
 #panel .u578bar:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 14px,#000 14px 15px)}
 #panel .sh17.u578sh{display:flex;align-items:center;gap:6px;background:#121e26;border-left:4px solid currentColor;padding:3px 7px;margin:2px 0 5px;box-shadow:0 2px 0 #000;font-size:12px}
 #panel .sh17.u578sh span{background:#0b1a20;border:1px solid #2a3a44;padding:0 5px;font-size:9px}
 #panel .u578empty{display:flex;align-items:center;gap:7px;color:#8fa4ae;font-size:9px;line-height:1.25}
 #panel .u578slot{flex:0 0 30px;height:40px;border:2px dashed #2f4350;display:flex;align-items:center;justify-content:center;color:#2f4350;font-size:16px}
 #panel .u578hint{display:inline-flex;margin:0 0 4px 0}
 `;
 let cssEl = null;
 function css(on) {
  if (on && !cssEl) { cssEl = D.createElement('style'); cssEl.id = 'u578css'; cssEl.textContent = CSS; D.head.appendChild(cssEl); }
  if (cssEl) cssEl.disabled = !on;
 }
 const mark = (el, k) => { if (!el || el.dataset['u578' + k]) return false; el.dataset['u578' + k] = '1'; return true; };
 const dimes = () => { try { return V17.ST().chinos | 0; } catch (e) { return null; } };
 const numOf = s => { const m = /(\d[\d,]*)\s*$/.exec(String(s || '').trim()); return m ? +m[1].replace(/,/g, '') : null; };

 function header(hd, title, col, stHtml) {
  if (!hd || !mark(hd, 'hd')) return;
  const tt = hd.querySelector('.tt'), st = hd.querySelector('.st');
  if (tt && tt.textContent.trim() === title) tt.innerHTML = px(title, 6, col, '#000');
  if (st && stHtml != null) st.innerHTML = stHtml;
 }
 // BUY button: big gold price + "you have X" when short
 function priceBtn(b, opt) {
  if (!b || !mark(b, 'pr')) return;
  const t = b.textContent.replace(/\s+/g, ' ').trim();
  if (!/^(BUY\s*-\s*)?\d[\d,]*$/.test(t)) return; // OWNED / SOLD OUT / anything else: leave it
  const p = numOf(t);
  b.classList.add('u578price');
  b.innerHTML = '<small>BUY</small><span class="coin17"></span>' + p;
  const have = dimes();
  if (have != null && have < p && !(opt && opt.noNeed)) b.insertAdjacentHTML('afterend', '<div class="u578need">YOU HAVE ' + have + ' - WIN A GAME = +10</div>');
 }
 function shop(root) {
  header(root.querySelector('.hd'), 'YARD SALE', '#7dff7a',
   '<span class="u578chips"><span class="u578c u578g">+10 DIMES EVERY WIN</span><span class="u578c">CARDS:</span><span class="u578c"><i style="background:#9aa3ab"></i>COMMON</span><span class="u578c"><i style="background:#3d8bff"></i>RARE</span><span class="u578c"><i style="background:#ffcc33"></i>LEGENDARY</span></span>');
  // limited featured tiles: the timer chip moves next to the title (timers stay in the DOM, only hidden, so v489/v502 keep updating them)
  root.querySelectorAll('.hw16').forEach(tile => {
   const lt = tile.querySelector('.lt489') || tile.querySelector('.lo502left:not(.tile)');
   const ttl = tile.querySelector('.hwb16 > b');
   if (lt && ttl) {
    let chip = ttl.querySelector('.u578lim');
    if (!chip) { ttl.insertAdjacentHTML('beforeend', ' <span class="u578c u578r u578lim" style="vertical-align:middle;margin-left:6px"></span>'); chip = ttl.querySelector('.u578lim'); }
    const s = 'LIMITED - ' + lt.textContent.replace(/^LEAVES IN\s*/, '').trim() + ' LEFT';
    if (chip.textContent !== s) chip.textContent = s;
    tile.querySelectorAll('.lt489,.lo502left:not(.tile)').forEach(e => e.classList.add('u578hide'));
   }
   const btns = tile.querySelectorAll('.hwc16 button');
   btns.forEach(b => { if (b.dataset.a === 'v17buy') priceBtn(b); else if (/SEE WHAT/.test(b.textContent) && mark(b, 'sec')) b.classList.add('u578sec'); });
  });
  const v = D.getElementById('vets489tile');
  if (v && mark(v, 'inc')) {
   const sm = v.querySelector('.hwb16 small');
   if (sm && /SIX SERVICE TEAMS/.test(sm.textContent) && /VETERANS TOURNAMENT/.test(sm.textContent)) {
    sm.classList.add('u578hide');
    sm.insertAdjacentHTML('afterend', '<div class="u578inc"><span><b>6</b> SERVICE TEAMS</span><span><b>ALL</b> THEIR UNIFORMS</span><span><b>3</b> STICKS</span><span><b>2</b> CELLYS</span><span><b>+</b> VETS TOURNAMENT</span></div>');
   }
  }
  const c = D.getElementById('car479tile');
  if (c && c.dataset.st === 'buy' && mark(c, 'car')) {
   const sm = c.querySelector('.tx small'), b = c.querySelector('.tx b'), bt = c.querySelector('.tx button[data-a="v479buy"]');
   if (sm && /HIGH SCHOOL TO THE PROS/.test(sm.textContent)) sm.textContent = 'MAKE YOUR PLAYER. HIGH SCHOOL TO THE PROS.';
   if (b) b.insertAdjacentHTML('beforeend', ' <span class="u578c u578t" style="margin-left:8px;vertical-align:middle">1 TICKET = 1 CAREER</span>');
   if (bt) { bt.parentNode.style.cssText += ';display:flex;align-items:center;gap:8px'; priceBtn(bt); }
  }
  const f = D.getElementById('fit45tile');
  if (f && mark(f, 'fit')) {
   const fs = f.querySelector('.fs45'), ft = f.querySelector('.ft45');
   if (fs && /PICK ONE FOR 200 DIMES/.test(fs.textContent)) fs.textContent = 'PICK ONE - 200 DIMES - THE OTHER LOCKS FOR GOOD. HELMET + GLOVES STAY.';
   if (ft) ft.insertAdjacentHTML('beforeend', ' <span class="u578c u578v" style="vertical-align:middle;margin-left:6px">ONE ONLY</span>');
  }
 }
 const SHORT = { CAREER: 'FINISH A CAREER (PLAY > CAREER)', LEGACY: 'LANDS HERE WHEN YOU GET ONE', LEGENDARY: 'WIN A TITLE + FLIP CARDS' };
 let moreEl = null;
 function locker() {
  header(panel.querySelector(':scope > .hd'), 'LOCKER ROOM', '#8fe3f0', null);
  const st = panel.querySelector(':scope > .hd .st');
  if (st && /^YOUR COLLECTION/.test(st.textContent) && mark(st, 'st')) st.textContent = 'YOUR COLLECTION';
  const tabs = panel.querySelector(':scope > .tabs');
  if (tabs && mark(tabs, 'tabs')) {
   tabs.classList.add('u578tabs');
   const cards = tabs.querySelector('[data-v="legacy"]'), chirp = tabs.querySelector('[data-v="chirp"]');
   if (cards) cards.insertAdjacentHTML('afterend', '<span class="u578dv"></span>');
   if (chirp) chirp.insertAdjacentHTML('beforebegin', '<span class="u578dv"></span>');
   // MORE > hint on the right edge, only while the tab row can still scroll right
   const upd = () => {
    if (!moreEl || !moreEl.isConnected) return;
    const tr = tabs.getBoundingClientRect(), pr = panel.getBoundingClientRect();
    const more = tabs.scrollWidth - tabs.clientWidth - tabs.scrollLeft > 4;
    moreEl.style.cssText = 'left:' + (tr.right - pr.left - 70) + 'px;top:' + (tr.top - pr.top + panel.scrollTop) + 'px;width:70px;height:' + tr.height + 'px;display:' + (more ? 'flex' : 'none');
   };
   panel.insertAdjacentHTML('beforeend', '<div class="u578more">' + px('MORE', 4, '#ffe14d') + '&nbsp;' + px('>', 4, '#ffe14d') + '</div>');
   moreEl = panel.querySelector(':scope > .u578more');
   tabs.addEventListener('scroll', upd, { passive: true });
   upd(); requestAnimationFrame(upd);
  }
  const det = panel.querySelector('#lr35s > .det17');
  if (det && mark(det, 'det')) {
   const m = det.textContent.match(/(\d+) \/ (\d+) UNLOCKED/);
   if (m) {
    const a = +m[1], b = +m[2], tap = /\bCLICK AN ITEM\b/.test(det.textContent) ? 'CLICK' : 'TAP';
    det.classList.add('u578hide');
    det.insertAdjacentHTML('afterend', '<div class="u578prog"><span style="color:#fff;font-size:11px">' + a + ' / ' + b + ' UNLOCKED</span><span class="u578bar"><i style="width:' + Math.max(3, Math.min(100, a / Math.max(1, b) * 100)) + '%"></i></span><span class="u578c u578y">OPEN PACKS = MORE</span><span class="u578c">' + tap + ' = INFO</span><span class="u578c">HOLD = SELL</span></div>');
   }
  }
  const hint = panel.querySelector('#lockList .hint28');
  if (hint && mark(hint, 'hint') && /PLAYER CARD TO EQUIP ITEMS ON HIM/.test(hint.textContent)) {
   const tap = /^CLICK/.test(hint.textContent.trim()) ? 'CLICK' : 'TAP';
   hint.innerHTML = '<span class="u578c u578y u578hint">' + tap + ' A PLAYER CARD = EQUIP HIM</span>';
  }
  panel.querySelectorAll('#lockList .sec17').forEach(s => {
   const h = s.querySelector(':scope > .sh17');
   if (h && mark(h, 'sh')) h.classList.add('u578sh');
   const n = s.querySelector(':scope > .grid17 > .note');
   if (!n || !h || s.querySelector('.c17') || !mark(n, 'note')) return;
   const k = (h.childNodes[0] && h.childNodes[0].textContent || '').trim();
   if (!SHORT[k] || !/^NONE YET/.test(n.textContent.trim())) return;
   n.classList.add('u578hide');
   n.insertAdjacentHTML('afterend', '<div class="u578empty"><span class="u578slot">?</span><span>' + SHORT[k] + '</span></div>');
  });
 }
 let busy = false, queued = false;
 function run() {
  queued = false;
  if (off()) { css(false); return; }
  const scr = panel.dataset.scr;
  if (scr !== 'shop17' && scr !== 'locker17') return;
  busy = true;
  try {
   css(true);
   if (scr === 'shop17') { const r = D.getElementById('loShop'); if (r) shop(r); }
   else if (panel.querySelector('#lr35s') && panel.querySelector(':scope > .tabs')) locker();
   V.n++;
  } catch (e) { V.err = String(e && e.stack || e); if (V.n < 2) console.warn('v578dom', e); }
  finally { busy = false; }
 }
 const mo = new MutationObserver(() => {
  if (busy || queued) return;
  queued = true;
  // run in the same task, after the render that triggered us: no flash of the old look
  Promise.resolve().then(run);
 });
 mo.observe(panel, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-scr'] });
 run();
})();
