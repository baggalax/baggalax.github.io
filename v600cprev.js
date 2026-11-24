// ===== BAGGA LAX v600cprev.js - 1.5 B71: CELLY PREVIEWS THAT PLAY RIGHT + SHOP PREVIEW + "YOU GOT IT" + OWNED =====
// 1) LOCKER PREVIEW BUG (Charlie: Walk the Plank "kept flashing black and the ship never came up").
//    Cause: two render loops on the same canvas.cprev17. items17's own cellyPreview() repaints it every frame with grass
//    and the generic celly poses (it doesn't know the add-on cellies), and the add-on's 50 ms loop (v600plank / v491) painted
//    its scene in between -> flashing, the ship only ever on screen for a blink. Same bug on CHOPPER EXTRACT + FIREWORKS.
//    Fix:  add-on celly canvases are renamed cprev600 (as v581 does for the Chicken Dance), so items17 + the old add-on loops
//    leave them alone, and ONE rAF loop here plays the whole celly + a 0.8 s hold, then loops, exactly the in-match drawing.
// 2) SHOP PREVIEW: every celly tile in the Yard Sale (banner, packs row, items row) gets a PREVIEW button -> the same
//    viewer as the locker (canvas.cprev17 / cprev600, 160x64 shown at 2x) in a popup; CLOSE goes back to the shop.
// 3) "YOU GOT IT": a Live-Ops single item buy (lo502buy) only toasted. Now it opens a popup with the item's card (and the
//    celly playing), OK / EQUIP IT (locker). Packs keep their own pack-open screen.
// 4) OWNED: one-time items (cellys, chirps, uniforms, crew) the player owns show OWNED in every slot and can't be bought again.
// Kill switch: window.__rl_no600cprev
(function () {
 'use strict';
 const Wn = window;
 if (!Wn.V17 || !V17.BY) return;
 const off = () => !!Wn.__rl_no600cprev;
 const LOG = Wn.__cprev600log = { frames: 0, swaps: 0, pops: 0, buys: 0, err: [] };
 const er = (w, e) => { if (LOG.err.length < 20) LOG.err.push(w + ': ' + String(e && e.message || e)); };
 const ADDON = { wplank: 1, v491chop: 1, v491fw: 1 };
 const DUR = { v491chop: 3.7, v491fw: 3.4 };
 const itemOf = id => V17.BY[id];
 // ---------- 1: one loop per add-on celly canvas ----------
 function swap(root) {
  for (const cv of (root || document).querySelectorAll('canvas.cprev17')) {
   const it = itemOf(cv.dataset.c);
   if (it && ADDON[it.ck]) { cv.classList.replace('cprev17', 'cprev600'); LOG.swaps++; }
  }
 }
 const T0 = new WeakMap();
 function kitNow() {
  try { const S = typeof season !== 'undefined' ? season : null, tid = typeof lobbyTeam === 'function' && lobbyTeam() || S && S.team || null; if (tid && typeof lobbyKit === 'function') return lobbyKit(tid); } catch (e) {}
  return { jersey: '#2c6bd8', trim: '#ffffff', helm: '#2c6bd8' };
 }
 function drawOne(cv) {
  const it = itemOf(cv.dataset.c); if (!it) return;
  const ck = it.ck, dur = ck === 'wplank' ? (Wn.WP600 ? WP600.dur : 3.8) : DUR[ck] || 3.5;
  if (!T0.has(cv)) T0.set(cv, performance.now());
  const t = Math.min((performance.now() - T0.get(cv)) / 1e3 % (dur + .8), dur);
  const fx = 400, fy = typeof CY !== 'undefined' ? CY : 90, kit = kitNow();
  const c = { ck: ck, cid: it.id, t: t, dur: dur, sx: fx, sy: fy, face: 1, actors: [] };
  const n = ck === 'wplank' ? 4 : 3;
  for (let i = 0; i < n; i++) c.actors.push({ src: null, pl: null, x0: fx - 10 + i * 8, y0: fy - 6 + i * 4, kit: kit });
  const x = cv.getContext('2d'), kk = g, G0 = typeof game !== 'undefined' ? game : null;
  x.imageSmoothingEnabled = false;
  g = x;
  try {
   x.setTransform(1, 0, 0, 1, 0, 0);
   if (ck === 'wplank') {
    // night sky + grass edge; WP600 paints the ghost-sea pool, the ship, the plank and the players itself
    const sky = x.createLinearGradient(0, 0, 0, cv.height); sky.addColorStop(0, '#081a14'); sky.addColorStop(1, '#13392d');
    x.fillStyle = sky; x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = '#2f7d3a'; x.fillRect(0, cv.height - 9, cv.width, 9);
    c.wp = c.actors; c.actors = [];
    x.setTransform(.5, 0, 0, .5, Math.round(cv.width / 2 - fx * .5), Math.round(cv.height - 10 - (fy + 3) * .5));
    game = { c17: c, g17: null, t: t };
    WP600.draw(c, t, { l: fx - 160, r: fx + 160, top: fy - 110 });
   } else if (Wn.VI491 && VI491.draw) {
    x.fillStyle = ck === 'v491fw' ? '#10183a' : '#7ec4ff'; x.fillRect(0, 0, cv.width, cv.height - 22);
    x.fillStyle = '#2f7d3a'; x.fillRect(0, cv.height - 22, cv.width, 22);
    x.fillStyle = '#358a41'; for (let i = 0; i < cv.width; i += 16) x.fillRect(i, cv.height - 22, 8, 22);
    x.translate(cv.width / 2 - fx, cv.height - 14 - fy);
    game = { c17: c, g17: null, t: t };
    VI491.draw(c, t, { l: fx - 80, r: fx + 80, top: fy - (cv.height - 14) });
   }
   LOG.frames++;
  } catch (e) { er('draw', e); } finally { game = G0; x.setTransform(1, 0, 0, 1, 0, 0); g = kk; }
 }
 function loop() {
  try {
   if (!off()) { swap(document); for (const cv of document.querySelectorAll('canvas.cprev600')) drawOne(cv); }
  } catch (e) { er('loop', e); }
  requestAnimationFrame(loop);
 }
 requestAnimationFrame(loop);

 // ---------- popup (shop preview + "you got it") ----------
 const css = document.createElement('style');
 css.textContent = '.cp600{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;font-family:inherit}' +
  '.cp600 .bx{background:#0f1a22;border:3px solid #ffcc33;box-shadow:0 0 0 2px #000,0 0 18px rgba(255,204,51,.45);padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;max-width:94vw;max-height:94vh;overflow:auto}' +
  '.cp600 .tt{color:#ffcc33;font-size:14px;letter-spacing:1px;text-align:center}.cp600 .st{color:#c9d6d9;font-size:9px;text-align:center;max-width:340px}' +
  '.cp600 canvas{width:320px;height:128px;image-rendering:pixelated;border:2px solid #000;max-width:86vw;height:auto}' +
  '.cp600 .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.cp600 button{font-family:inherit;font-size:11px;padding:5px 12px;border:2px solid #000;cursor:pointer}' +
  '.cp600 .ok{background:#ffcc33;color:#0b1a20}.cp600 .gr{background:#2a3a44;color:#c9d6d9}.cp600 .c17{transform:scale(.9)}';
 document.head.appendChild(css);
 function close() { const m = document.querySelector('.cp600'); if (m) m.remove(); }
 const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
 function pop(id, got) {
  close();
  const it = itemOf(id); if (!it) return;
  const cel = it.sec === 'celly';
  const m = document.createElement('div'); m.className = 'cp600';
  try { const pn = document.getElementById('panel'); if (pn) m.style.fontFamily = getComputedStyle(pn).fontFamily; } catch (e) {} // the panel's pixel font
  let card = ''; try { card = V17.cardHtml(id, { count: null }); } catch (e) {}
  m.innerHTML = '<div class="bx"><div class="tt">' + (got ? 'YOU GOT IT!' : 'PREVIEW') + ' - ' + esc(it.n) + '</div>' +
   (cel ? '<canvas class="' + (ADDON[it.ck] ? 'cprev600' : 'cprev17') + '" width="160" height="64" data-c="' + esc(id) + '"></canvas>' : card) +
   '<div class="st">' + esc(it.d || '') + (got ? ' - IT IS IN YOUR LOCKER ROOM' + (cel ? '. PUT IT IN A PLAYER\'S CELLY BOX.' : '.') : '') + '</div>' +
   '<div class="row">' + (got ? '<button type="button" class="gr" data-x="lk">LOCKER ROOM</button>' : '') + '<button type="button" class="ok" data-x="ok">' + (got ? 'OK' : 'CLOSE') + '</button></div></div>';
  m.addEventListener('click', ev => {
   const b = ev.target.closest('[data-x]');
   if (b && b.dataset.x === 'lk') { close(); try { V17.openLocker(); } catch (e) {} return; }
   if (b || ev.target === m) close();
  });
  document.body.appendChild(m);
  LOG.pops++;
 }
 Wn.CPREV600 = { pop: pop, close: close };

 // ---------- 2 + 4: PREVIEW buttons + OWNED on the Yard Sale tiles ----------
 const ONE_TIME = it => !!it && (it.sec === 'celly' || it.sec === 'chirp' || it.sec === 'uni21' || !!it.crew || /^uni21\|/.test(it.id));
 const owned = id => { try { return (V17.ST().inv[id] | 0) > 0; } catch (e) { return false; } };
 Wn.CPREV600.oneTime = id => ONE_TIME(itemOf(id));
 Wn.CPREV600.owned = id => ONE_TIME(itemOf(id)) && owned(id);
 function decorate(root) {
  if (off() || !root) return;
  for (const b of root.querySelectorAll('[data-a="lo502buy"][data-v]')) {
   if (b.closest('.u580src')) continue; // v580's hidden source copy
   const id = b.dataset.v, it = itemOf(id); if (!it) continue;
   const host = b.closest('.s6hero, .s6pk, .s6card, .s6item, .spk17') || b.parentNode;
   if (ONE_TIME(it) && owned(id) && !b.dataset.own600) {
    b.dataset.own600 = 1; b.disabled = true; b.classList.add('own'); b.classList.remove('ok', 'no');
    b.textContent = 'OWNED'; const nd = b.parentNode && b.parentNode.querySelector('.s6need'); if (nd) nd.remove();
   }
   if (it.sec === 'celly' && host && !host.querySelector('[data-a="v600cprv"]')) {
    const p = document.createElement('button'); p.type = 'button'; p.className = 's6pv600'; p.dataset.a = 'v600cprv'; p.dataset.v = id; p.textContent = 'PREVIEW';
    b.insertAdjacentElement('afterend', p);
   }
  }
 }
 const css2 = document.createElement('style');
 css2.textContent = '#panel .s6pv600{display:block;margin:4px auto 0;font:inherit;font-size:10px;padding:3px 10px;background:#7dffb0;color:#0b1a20;border:2px solid #000;box-shadow:0 2px 0 #000;cursor:pointer}';
 document.head.appendChild(css2);
 const mo = new MutationObserver(() => { try { decorate(document.getElementById('panel')); swap(document); } catch (e) { er('mo', e); } });
 const go = () => { try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) {} };
 if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
 // PREVIEW tap (the panel's action router would treat it as a buy; handle it first)
 document.addEventListener('click', ev => {
  const b = ev.target && ev.target.closest && ev.target.closest('[data-a="v600cprv"]');
  if (!b || off()) return;
  ev.preventDefault(); ev.stopPropagation();
  pop(b.dataset.v, false);
 }, true);
 if (typeof PANEL_ACT === 'object') PANEL_ACT.v600cprv = v => { pop(v, false); return typeof PANEL_KEEP !== 'undefined' ? PANEL_KEEP : undefined; };

 // ---------- 3 + 4: Live-Ops item buy -> blocked when owned (one-time), else the "you got it" popup ----------
 const wrapBuy = () => {
  const o = typeof PANEL_ACT === 'object' && PANEL_ACT.lo502buy;
  if (typeof o !== 'function' || o.__cp600) return false;
  const f = function (id) {
   if (off()) return o.apply(this, arguments);
   const it = itemOf(id);
   if (it && ONE_TIME(it) && owned(id)) { try { V17.toast('YOU ALREADY OWN ' + it.n, '#ff9a8a'); } catch (e) {} return; }
   const before = owned(id) ? (V17.ST().inv[id] | 0) : 0;
   const r = o.apply(this, arguments);
   try { const now = V17.ST().inv[id] | 0; if (it && now > before) { LOG.buys++; setTimeout(() => pop(id, true), 60); } } catch (e) { er('buy', e); }
   return r;
  };
  f.__cp600 = 1; PANEL_ACT.lo502buy = f; return true;
 };
 wrapBuy(); setInterval(wrapBuy, 400); // v502live re-assigns PANEL_ACT.lo502buy on every Live-Ops refresh: wrap again each time
})();
