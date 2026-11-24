/* v597ui.js - Bagga Lax 1.5e: FRIENDS + CLOUD SAVE panel (Charlie round 5 device shot, 852x393 @3x)
 * Bug: the panel used "Courier New" and the old flat buttons; a friend row ran off the right edge (the "..." button sat under the
 *      Dynamic Island); the grey offline square next to a name looked like a broken checkbox.
 * Cause: acct23.js styles predate the 1.4 look (its own font stack + flat buttons); .row is a no-wrap flex line, so with
 *      INVITE + TRADE + X + ... it is wider than the column on a phone; the offline "dot" is a plain 9px grey square.
 * Fix: same mono font + new-style buttons as every other panel, headings in the game's pixel font (FONT glyphs, like the
 *      Yard Sale), rows wrap inside their column (never past the safe area), offline square hidden (a green dot = online).
 * Kill switch: window.__rl_no597ui
 */
(function () {
 'use strict';
 const Wn = window, D = document;
 if (Wn.__rl_597ui) return; Wn.__rl_597ui = 1;
 const off = () => !!Wn.__rl_no597ui;
 const MONO = 'ui-monospace,Menlo,Consolas,monospace';
 const NEWBTN = 'border:2px solid #0b1a20!important;border-radius:0!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.45),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000!important';
 const css = D.createElement('style'); css.id = 'v597css';
 css.textContent = [
  'html:not(.no597) #acct23,html:not(.no597) #p23{font-family:' + MONO + '!important;letter-spacing:.4px}',
  'html:not(.no597) #acct23 button,html:not(.no597) #p23 button{' + NEWBTN + ';font-family:' + MONO + '!important;font-weight:bold;padding:5px 8px!important;margin:2px 4px 4px 0!important;white-space:nowrap}',
  'html:not(.no597) #acct23 input{font-family:' + MONO + '!important;border-radius:0}',
  'html:not(.no597) #acct23 input::placeholder{font-size:12px;letter-spacing:0}',
  'html:not(.no597) #acct23 .col{overflow:hidden}',
  'html:not(.no597) #acct23 .row{flex-wrap:wrap;row-gap:2px}',
  'html:not(.no597) #acct23 .row .n{flex:1 0 auto;max-width:100%;overflow:visible;text-overflow:clip}',
  'html:not(.no597) #acct23 .row .sm{flex:0 1 auto;white-space:nowrap}',
  'html:not(.no597) #acct23 .dot:not(.on){display:none}',
  'html:not(.no597) #acct23 .dot.on{width:8px;height:8px;background:#7dff7a;box-shadow:0 0 0 1px #0b1a20}',
  'html:not(.no597) #acct23{padding-right:max(14px,calc(env(safe-area-inset-right) + 8px))!important;padding-left:max(14px,calc(env(safe-area-inset-left) + 8px))!important}',
  // QA6: old DOM popups (World Games / season difficulty, NEW IN THE YARD SALE, Veterans Day) -> mono game font + new buttons, clear of the island
  'html:not(.no597) #df2503,html:not(.no597) #df2503 *,html:not(.no597) #shop26,html:not(.no597) #shop26 *,html:not(.no597) #vets489pop,html:not(.no597) #vets489pop *{font-family:' + MONO + '!important;letter-spacing:.4px}',
  'html:not(.no597) #df2503 button,html:not(.no597) #shop26 button,html:not(.no597) #vets489pop button{' + NEWBTN + ';font-weight:bold;white-space:nowrap;margin:3px!important}',
  // QA7: the Quick Game YES / NO / PLAY dialog gets the same look
  'html:not(.no597) #qb35,html:not(.no597) #qb35 *{font-family:' + MONO + '!important;letter-spacing:.4px}',
  'html:not(.no597) #qb35 button{' + NEWBTN + ';font-weight:bold}',
  // QA7: NEW IN THE YARD SALE fits a 375px-tall screen - the box scrolls, its buttons stay pinned at the bottom
  'html:not(.no597) #shop26 > div{max-height:calc(100vh - 16px)!important;overflow:auto!important;padding-bottom:0!important}',
  'html:not(.no597) #shop26 > div > div:last-child{position:sticky;bottom:0;background:#14222b;padding:6px 0 8px;margin-top:4px}',
  '@media (max-height:420px){html:not(.no597) #shop26 .shop26t{width:112px!important;padding:2px!important}html:not(.no597) #shop26 .shop26t img{height:30px!important}}',
  // 1.5e: DELETE ACCOUNT dialogs - game font, new buttons, red danger button, fits any phone
  'html:not(.no597) #del41,html:not(.no597) #del41 *{font-family:' + MONO + '!important}',
  'html:not(.no597) #del41 button{' + NEWBTN + ';font-weight:bold;margin:4px!important}',
  'html:not(.no597) #del41 button.r{background:#ff5a4a!important;color:#fff!important}',
  'html:not(.no597) #del41 .box{max-width:min(520px,calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right)))!important;max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box}',
  'html:not(.no597) #df2503,html:not(.no597) #shop26{padding:max(8px,env(safe-area-inset-top)) max(12px,calc(env(safe-area-inset-right) + 8px)) max(8px,env(safe-area-inset-bottom)) max(12px,calc(env(safe-area-inset-left) + 8px));box-sizing:border-box}',
  'html:not(.no597) #df2503 > div,html:not(.no597) #shop26 > div{max-width:100%!important;box-sizing:border-box;border:2px solid #0b1a20;box-shadow:0 0 0 2px #ffe14d,0 6px 0 #000!important}',
  // QA6 LOW: Edit Names - solid backdrop (the menu ghosted through), title in the pixel font
  'html:not(.no597) #ed31{background:#0b1118!important}',
  'html:not(.no597) #ed31 .hd .tt img.px597{image-rendering:pixelated;vertical-align:middle;max-width:100%}',
  // QA6 LOW: locker tab row - the last tab (CELLYS / TROPHIES) can scroll fully clear of the MORE > hint
  'html:not(.no597) #panel .row.tabs{padding-right:112px!important}',
  'html:not(.no597) #lockList .note597{margin:14px auto;max-width:560px;padding:10px 12px;border:2px dashed #2c4452;color:#cfe;text-align:center;line-height:1.5}',
  'html:not(.no597) #acct23 h1 img.px597,html:not(.no597) #acct23 h2 img.px597{image-rendering:pixelated;vertical-align:middle;max-width:100%}'
 ].join('\n');
 D.head.appendChild(css);
 const sync = () => { try { D.documentElement.classList.toggle('no597', off()); } catch (e) {} };
 // headings in the game's pixel font (the canvas FONT glyphs, 2 css px per cell like the Yard Sale titles)
 const pxC = {};
 function px(s, cs, col) {
  s = String(s).toUpperCase(); const k = s + cs + col; if (pxC[k]) return pxC[k];
  if (typeof FONT === 'undefined') return null;
  const c = D.createElement('canvas'), sh = cs; c.width = Math.max(1, (s.length * 4 - 1) * cs + sh); c.height = 5 * cs + sh;
  const x = c.getContext('2d');
  const dr = (ox, oy, cl) => { x.fillStyle = cl; for (let i = 0; i < s.length; i++) { const gl = FONT[s[i]] || FONT['?']; if (!gl) continue; for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (gl[r] && gl[r][q] === '#') x.fillRect(ox + (i * 4 + q) * cs, oy + r * cs, cs, cs); } };
  dr(sh, sh, '#000'); dr(0, 0, col);
  return (pxC[k] = { u: c.toDataURL(), w: c.width / 2, h: c.height / 2 });
 }
 function heads(root) {
  if (off()) return;
  root.querySelectorAll('h1, h2').forEach(h => {
   if (h.querySelector('img.px597') || h.children.length) return;
   const t = h.textContent.trim(); if (!t || t.length > 40) return;
   const big = h.tagName === 'H1', col = getComputedStyle(h).color || '#ffe14d';
   const p = px(t, big ? 6 : 4, col); if (!p) return;
   h.textContent = ''; const im = D.createElement('img'); im.className = 'px597'; im.alt = t; im.src = p.u; im.style.width = p.w + 'px'; im.style.height = p.h + 'px'; h.appendChild(im);
  });
 }
 let mo = null;
 function watch() {
  sync();
  const root = D.getElementById('acct23'); if (!root) return false;
  heads(root);
  if (!mo && typeof MutationObserver === 'function') { mo = new MutationObserver(() => { try { heads(root); } catch (e) {} }); mo.observe(root, { childList: true, subtree: true }); }
  return true;
 }
 function pxEl(el, cs) { if (!el || off()) return; if (el.querySelector('img.px597') || el.children.length) return; const t = el.textContent.trim(); if (!t || t.length > 40) return; const p = px(t, cs, getComputedStyle(el).color || '#ffe14d'); if (!p) return; el.textContent = ''; const im = D.createElement('img'); im.className = 'px597'; im.alt = t; im.src = p.u; im.style.width = p.w + 'px'; im.style.height = p.h + 'px'; el.appendChild(im); }
 setInterval(() => { try { const e = D.getElementById('ed31'); if (e && e.style.display !== 'none') pxEl(e.querySelector('.hd .tt'), 5); } catch (e) {} }, 400);
 // QA6 LOW: an empty MY TEAMS tab said nothing - now it says how to get a team there
 setInterval(() => { try { if (off()) return; const on = D.querySelector('#panel button[data-a="v29myt"].on'); const L = D.getElementById('lockList'); if (!on || !L) return; if (L.querySelector('.note597') || L.querySelector('button, .c17, [data-a], img') || L.textContent.trim()) return; // QA7: an empty grid div is always there - look for real cards
  const n = D.createElement('div'); n.className = 'note597'; n.textContent = 'NO TEAMS HERE YET. WIN A TITLE IN QUICK GAME, SEASON, COLLEGE OR WORLD GAMES, OR BUILD A CARD TEAM - YOUR TEAMS SHOW UP HERE.'; L.appendChild(n); } catch (e) {} }, 400);
 // QA6 HIGH: one popup at a time. The first one that is ON SCREEN keeps showing; the others wait (hidden, not removed) and
 // show when it closes. Matches every element with the id (an old hidden copy can sit in the DOM with the same id).
 Wn.__rl_597pops = 1;
 const POPS = ['shop26', 'tut26card', 'tut507card', 'vets489pop', 'tb570pop'];
 const vis = el => { if (!el || !el.isConnected) return false; const s = getComputedStyle(el); return s.display !== 'none' && s.opacity !== '0'; };
 setInterval(() => { try {
  const all = []; POPS.forEach(id => D.querySelectorAll('[id="' + id + '"]').forEach(e => all.push(e)));
  if (off()) { all.forEach(e => e.classList.remove('q596')); return; }
  const gate = vis(D.getElementById('acct23'));
  const on = all.filter(vis);
  let cur = gate ? null : on.find(e => e.__q597on && !e.classList.contains('q596')); // the account panel (gate / FRIENDS) hides every popup
  if (!cur && !gate) cur = on[0];
  on.forEach(e => { if (e === cur) { e.classList.remove('q596'); e.__q597on = 1; } else e.classList.add('q596'); });
 } catch (e) {} }, 150);
 const iv = setInterval(() => { try { sync(); if (watch()) clearInterval(iv); } catch (e) {} }, 700);
 // QA6 MED: pregame GET READY - ROSTER & STATS / START (84 wide each) ran over the heroes' #NO / OVR plates (plates sit
 // round x = .18W and .76W). Both buttons now share the room between the plates, centred, never under 52 wide.
 try { const dp0 = Wn.drawPregame; if (typeof dp0 === 'function' && !dp0.__p597) { const dp = function () {
  if (off() || typeof Wn.button !== 'function') return dp0.apply(this, arguments);
  const b0 = Wn.button; const cx = W / 2, bw = Math.max(52, Math.min(84, Math.floor((.58 * W - 75) / 2)));
  Wn.button = function (label, x, y, w, h) { const a = Array.prototype.slice.call(arguments); if (label === 'ROSTER & STATS' && w === 84) { a[1] = Math.round(cx - bw - 3); a[3] = bw; if (bw < 60) a[0] = 'ROSTER'; } else if (label === 'START' && w === 84) { a[1] = Math.round(cx + 3); a[3] = bw; } return b0.apply(this, a); };
  try { return dp0.apply(this, arguments); } finally { Wn.button = b0; }
 }; dp.__p597 = 1; Wn.drawPregame = dp; } } catch (e) {}
 Wn.V597UI = { heads: () => { const r = D.getElementById('acct23'); if (r) heads(r); } };
})();
