/* v479carshop.js - V47.9: CAREER TICKET in the YARD SALE (Bagga Lax 1.2 beta).
 * Charlie (Nov 9 8:20 PM): "add career card to item shop for 20 dimes career mode is locked untill you buy it.
 *   Doesnt actually go to your inventory or anything it's more like a ticket to get career mode"
 * Charlie (8:21 PM): "Franchise is available for free."  Charlie (8:37 PM): one ticket = one career - "If you start a new career
 *   you have to buy another card so after your career ends it's able to be purchased in shop again."
 * - YARD SALE (shop17): a CAREER MODE tile (a career-ticket card), 20 DIMES, always there. BUY -> confirm -> spends 20 through the
 *   same path every shop item uses (ST.chinos -= cost, ST.stats.spent += cost, V17.save()). Not enough -> the normal
 *   "NOT ENOUGH DIMES" toast. NOTHING goes in the inventory / locker / cards: the ticket is rl_car478unlock = { t: 1 }.
 * - The ticket is used up the moment a career is created (CAR459.create succeeds -> rl_car478unlock removed).
 * - Career access = an unused ticket OR a career in progress (v459car's own save: CAR459.get() with stage !== 'done').
 *   A career ENDS when v459car sets stage 'done' (finishCareer: after the World Games, or "end career" with no call-up)
 *   or when its save is gone. Then the tile is buyable again and Career is locked until the next ticket.
 * - Locked: PLAY > PLAY CAREER > CAREER CARD (and, when the franchise menu is off, the older direct CAREER / PLAY CAREER
 *   button), NEW CAREER on the finished-career screen, and the career screen itself with no career. The button shows a lock +
 *   "20 DIMES"; tapping it opens CAREER MODE LOCKED (title, one sentence, one big button -> the tile in the YARD SALE).
 *   FRANCHISE TEAM / FRANCHISE MODE (v458fr / v460fm) and every other mode are never touched.
 * - An existing in-progress career keeps working with no purchase; once it ends it needs a ticket like everyone else.
 * New key: rl_car478unlock (synced by the cloud save like every rl_* key). No ids, other keys, __rl_ flags or net protocol touched.
 * Kill switch: window.__rl_no479 = true (read every time: career is open exactly as before, the tile is hidden, create is free).
 */
(function () {
 'use strict';
 const Wn = window;
 if (!Wn.V17 || typeof Wn.menuBars !== 'function' || typeof Wn.menuBar !== 'function') return;
 const PRICE = 20, LK = 'rl_car478unlock', SCR = 'car478';
 const off = () => !!(Wn.__rl_no479 || Wn.__rl_v124gb || !(Wn.CAR459 && CAR459.on) || (CAR459.OFF && CAR459.OFF()));
 const ST = () => { try { return V17.ST ? V17.ST() : null; } catch (e) { return null; } };
 const toast = (s, c) => { try { V17.toast(s, c); } catch (e) {} };
 const E = s => (typeof esc === 'function' ? esc(s) : String(s));
 // the ticket: { t: 1 } = bought, not used yet
 function ticket() { try { const v = JSON.parse(localStorage.getItem(LK) || 'null'); return !!(v && typeof v === 'object' && v.t === 1); } catch (e) { return false; } }
 function setTicket() { try { localStorage.setItem(LK, JSON.stringify({ t: 1, at: Date.now() })); } catch (e) {} }
 function useTicket() { try { localStorage.removeItem(LK); } catch (e) {} }
 // a career in progress, read from v459car's own save (stage 'done' = the career ended)
 function career() { try { return CAR459.get ? CAR459.get() : null; } catch (e) { return null; } }
 function inProgress() { const C = career(); return !!(C && C.stage && C.stage !== 'done'); }
 function unlocked() { if (off()) return true; return ticket() || inProgress(); }
 const canBuy = () => !off() && !ticket() && !inProgress();
 const V = Wn.V479 = { PRICE: PRICE, unlocked: unlocked, ticket: ticket, inProgress: inProgress, canBuy: canBuy, pop: null };

 /* ---------- buying (the same spend every YARD SALE item uses) ---------- */
 function buy() {
  if (off()) return false;
  if (ticket()) { toast('YOU ALREADY HAVE A CAREER TICKET - START IT IN PLAY > PLAY CAREER', '#7dff7a'); return false; }
  if (inProgress()) { toast('FINISH YOUR CAREER FIRST - THEN BUY A NEW TICKET', '#ff9a8a'); return false; }
  const st = ST(); if (!st) return false;
  if ((st.chinos | 0) < PRICE) { toast('NOT ENOUGH DIMES - CAREER MODE IS ' + PRICE, '#ff9a8a'); return false; }
  st.chinos -= PRICE;
  if (st.stats) st.stats.spent = (st.stats.spent || 0) + PRICE;
  setTicket();
  try { V17.save(); } catch (e) {}
  toast('CAREER TICKET IS YOURS - PLAY > PLAY CAREER > CAREER CARD', '#ffcc33');
  return true;
 }
 V.buy = buy;

 /* ---------- the ticket art (pixel helmet, drawn once) ---------- */
 let art = null;
 function artUrl() {
  if (art) return art;
  const M = [
   '....HHHHHH....',
   '..HHHHHHHHHH..',
   '.HHHHHHHHHHHH.',
   '.HHHHhhhhhhhh.',
   'HHHHHhwwwwwww.',
   'HHHHHhw.w.w.w.',
   'HHHHHhwwwwwww.',
   'HHHHHhw.w.w.w.',
   '.HHHHhwwwwwww.',
   '.HHHHH.w.w.w..',
   '..HHHH.wwwww..',
   '...ss.........',
   '..ssss........'
  ];
  const P = { H: '#3dffc8', h: '#1a9c7c', w: '#e8f4f6', s: '#0d6b5e' };
  try {
   const c = document.createElement('canvas'); c.width = M[0].length; c.height = M.length;
   const g = c.getContext('2d');
   M.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (P[r[x]]) { g.fillStyle = P[r[x]]; g.fillRect(x, y, 1, 1); } });
   art = c.toDataURL();
  } catch (e) { art = ''; }
  return art;
 }
 function css() {
  if (document.getElementById('car479css')) return;
  const s = document.createElement('style'); s.id = 'car479css';
  s.textContent =
   '#panel .ct479{display:flex;align-items:center;gap:12px;padding:8px 12px;margin:0 0 8px;border:2px solid #3dffc8;border-radius:5px;background:linear-gradient(90deg,rgba(61,255,200,.28),rgba(10,16,24,.92) 50%);box-shadow:0 0 10px rgba(61,255,200,.35),0 3px 0 #000}' +
   '#panel .ct479.own{border-color:#2f6b5e;box-shadow:0 3px 0 #000;background:linear-gradient(90deg,rgba(61,255,200,.12),rgba(10,16,24,.92) 50%)}' +
   '#panel .ct479.fl{border-color:#ffe14d;box-shadow:0 0 16px #ffe14d,0 3px 0 #000;animation:ct479f .6s 4}@keyframes ct479f{50%{box-shadow:0 0 28px #ffe14d,0 3px 0 #000}}' +
   '#panel .cc479{position:relative;flex:0 0 auto;width:64px;height:88px;box-sizing:border-box;border:3px solid #3dffc8;border-radius:6px;background:linear-gradient(135deg,#06302c,#0d6b5e 45%,#041a17);box-shadow:0 3px 0 #000;display:flex;flex-direction:column;align-items:center;padding:3px 2px}' +
   '#panel .cc479:before,#panel .cc479:after{content:"";position:absolute;top:44px;width:8px;height:8px;border-radius:50%;background:#0a1018}#panel .cc479:before{left:-6px}#panel .cc479:after{right:-6px}' +
   '#panel .cc479 .h{font-size:7px;color:#3dffc8;letter-spacing:1px}#panel .cc479 img{width:42px;height:39px;image-rendering:pixelated;image-rendering:crisp-edges;margin-top:3px}' +
   '#panel .cc479 .r{margin-top:auto;width:100%;box-sizing:border-box;text-align:center;font-size:7px;color:#0b1a20;background:#3dffc8;border-radius:2px;padding:1px 0}' +
   '#panel .cc479 .lk{position:absolute;right:-5px;top:-6px;font-size:7px;background:#ffd23a;color:#0b1a20;border:2px solid #000;border-radius:3px;padding:1px 3px}' +
   '#panel .ct479 .tx{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}#panel .ct479 .tx b{font-size:15px;color:#3dffc8}#panel .ct479 .tx small{font-size:8px;color:#cfe;line-height:1.35}' +
   '#panel .ct479 .ok{font-size:10px;color:#7dff7a}' +
   '#panel .lk479{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:4px 20px}' +
   '#panel .lk479 .t{font-size:22px;color:#ffe14d;text-shadow:2px 2px 0 #000}#panel .lk479 .s{font-size:11px;color:#e8f4f6;line-height:1.4;max-width:460px}' +
   '#panel .lk479 button.b479{font-size:15px;padding:12px 22px;min-height:46px;color:#0b1a20}' +
   '#panel .bk479{position:absolute;left:10px;top:8px}';
  document.head.appendChild(s);
 }
 const btnH = (label, a, cls, inner) => '<button type="button" data-a="' + a + '"' + (cls ? ' class="' + cls + '"' : '') + ' aria-label="' + E(label) + '">' + (inner != null ? inner : E(label)) + '</button>';
 const coin = '<span class="coin17"></span>';
 function cardArt(st) {
  const lab = st === 'own' ? 'READY' : st === 'run' ? 'IN USE' : 'TICKET';
  return '<div class="cc479">' + (st === 'buy' ? '<span class="lk">&#128274;</span>' : '') + '<span class="h">CAREER</span><img alt="" src="' + artUrl() + '"><span class="r">' + lab + '</span></div>';
 }
 function tile() {
  const st = ST(); if (!st) return '';
  css();
  const k = ticket() ? 'own' : inProgress() ? 'run' : 'buy', ok = k === 'buy' && (st.chinos | 0) >= PRICE;
  const low = k === 'own' ? '<div class="ok">&#10003; OWNED - START YOUR CAREER: PLAY &gt; PLAY CAREER &gt; CAREER CARD</div>'
   : k === 'run' ? '<div class="ok" style="color:#ffcc33">&#128274; LOCKED - YOUR CAREER IS IN PROGRESS. WHEN IT ENDS YOU CAN BUY A NEW TICKET</div>'
   : '<div>' + btnH('BUY CAREER TICKET ' + PRICE + ' DIMES', 'v479buy', ok ? 'y' : 'd', 'BUY - ' + coin + PRICE) + '</div>';
  return '<div class="ct479' + (k === 'buy' ? '' : ' own') + '" id="car479tile" data-st="' + k + '">' + cardArt(k) + '<div class="tx"><b>CAREER MODE</b><small>' +
   'ONE TICKET = ONE CAREER: MAKE YOUR PLAYER AND TAKE HIM FROM HIGH SCHOOL TO THE PROS.' +
   '</small>' + low + '</div></div>';
 }
 function popHtml() {
  if (V.pop !== 'conf') return '';
  return '<div class="pop17" data-a="v479close" data-v="bg"><div class="pbox17" data-a="v17noop"><div style="text-align:center;font-size:14px;color:#ffe14d">BUY A CAREER TICKET?</div>' +
   '<div style="text-align:center;font-size:9px;color:#e8f4f6;line-height:1.4">COSTS ' + PRICE + ' DIMES. IT\'S GOOD FOR ONE CAREER.</div>' +
   '<div class="row" style="justify-content:center;gap:8px">' + btnH('BACK', 'v479close', 'g') + btnH('YES BUY', 'v479yes', 'y', 'YES, BUY IT') + '</div></div></div>';
 }
 function lockHtml() {
  css();
  return '<div class="lk479">' + '<div class="bk479">' + btnH('BACK', 'v479back', 'g') + '</div>' +
   '<div class="t">CAREER MODE LOCKED</div>' +
   '<div class="s">BUY THE CAREER TICKET IN THE YARD SALE FOR ' + PRICE + ' DIMES.</div>' +
   btnH('GO TO THE YARD SALE', 'v479go', 'y b479') + '</div>';
 }
 function openLock() {
  if (unlocked()) return false;
  try { V.back = screen; } catch (e) {}
  V.pop = null;
  screen = SCR; panelDirty();
  return true;
 }
 V.openLock = openLock;
 function goShop() {
  V.pop = null;
  screen = 'menu';
  try { V17.openShop(); } catch (e) { console.error(e); return; }
  const fl = () => { try { const t = document.getElementById('car479tile'); if (!t) return false; t.scrollIntoView({ block: 'nearest' }); t.classList.add('fl'); return true; } catch (e) { return false; } };
  let n = 0; const iv = setInterval(() => { if (fl() || ++n > 20) clearInterval(iv); }, 50);
 }

 if (typeof PANEL_RENDER !== 'undefined' && typeof PANEL_ACT !== 'undefined' && typeof PANEL_SCREENS !== 'undefined') {
  PANEL_SCREENS.push(SCR);
  PANEL_RENDER[SCR] = function () {
   try { if (unlocked()) { screen = 'menu'; return ''; } return lockHtml(); } catch (e) { console.error(e); return ''; }
  };
  const shop0 = PANEL_RENDER.shop17;
  if (typeof shop0 === 'function') PANEL_RENDER.shop17 = function () {
   let h = shop0.apply(this, arguments);
   if (off()) return h;
   try { const m = '<div class="scroll" id="shopList">'; if (h.indexOf(m) >= 0) h = h.replace(m, m + tile()) + popHtml(); } catch (e) { console.error(e); }
   return h;
  };
  // the career screen with no career and no ticket -> the lock screen (covers any route that opens it directly).
  // A finished career's own screen stays viewable; its NEW CAREER button needs a ticket. Franchise (fm460) is free.
  [ 'car459' ].forEach(k => {
   const r0 = PANEL_RENDER[k];
   if (typeof r0 !== 'function') return;
   PANEL_RENDER[k] = function () {
    try { if (!off() && !ticket() && !career()) { screen = SCR; return lockHtml(); } } catch (e) { console.error(e); }
    return r0.apply(this, arguments);
   };
  });
  Object.assign(PANEL_ACT, {
   v479buy() {
    if (off()) return;
    const st = ST();
    if (!canBuy() || !st || (st.chinos | 0) < PRICE) { V.pop = null; buy(); return; }
    V.pop = 'conf';
   },
   v479yes() { V.pop = null; buy(); },
   v479close() { V.pop = null; },
   v479go() { goShop(); },
   v479back() { V.pop = null; screen = 'menu'; }
  });
 }

 /* ---------- the menu: the career button is locked until the ticket is bought (franchise never) ---------- */
 // with the franchise menu on (v460fmu), CAREER / PLAY CAREER only open the CAREER CARD + FRANCHISE TEAM choice: stay open,
 // CAREER CARD is the locked one. With it off, CAREER / PLAY CAREER go straight into career mode: locked.
 const fmOn = () => { try { return !!(Wn.FM460 && FM460.on && !FM460.OFF()); } catch (e) { return false; } };
 const isCar = l => l === 'CAREER CARD' || (!fmOn() && (l === 'CAREER' || l === 'PLAY CAREER'));
 const MB0 = Wn.menuBars;
 Wn.menuBars = function () {
  const rows = MB0.apply(this, arguments);
  try {
   if (!Array.isArray(rows) || unlocked()) return rows;
   for (const r of rows) {
    if (!Array.isArray(r)) continue;
    for (let i = 0; i < r.length; i++) {
     const e = r[i];
     if (!e || !e.m37 || e.m37 === 'back' || !isCar(e.label)) continue;
     r[i] = Object.assign({}, e, { fn: openLock, lk479: 1, bg: '#9aa5ab' }, e.sub6 ? { sub6: 'LOCKED - ' + PRICE + ' DIMES' } : {});
    }
   }
  } catch (e) { console.error(e); }
  return rows;
 };
 function lockIcon(x, y, s, col) {
  // 7x8 pixel padlock at scale s
  const R = (a, b, w, h, c) => rect(x + a * s, y + b * s, w * s, h * s, c);
  R(1, 0, 5, 1, col); R(1, 0, 1, 4, col); R(5, 0, 1, 4, col);
  R(0, 3, 7, 5, col); R(3, 5, 1, 2, '#0b1a20');
 }
 const MBar0 = Wn.menuBar;
 Wn.menuBar = function (b, live) {
  const r = MBar0.apply(this, arguments);
  if (!b || !b.lk479) return r;
  try {
   if (unlocked()) return r;
   // a padlock on the left end of the bar (the label stays centred); bars without a second line also get a "20 DIMES" tag on the right
   const s = b.h >= 26 ? 2 : 1, lh = 8 * s;
   const lx = b.x + 6, ly = b.y + Math.round((b.h - lh) / 2);
   rect(lx - 2, ly - 2, 7 * s + 4, lh + 4, '#0b1a20');
   lockIcon(lx, ly, s, '#ffd23a');
   if (!b.sub6) {
    const tag = PRICE + ' DIMES', tw = textW(tag, 1), w = tw + 6, h = 9, x = b.x + b.w - w - 4, y = b.y + Math.round((b.h - h) / 2);
    rect(x, y, w, h, '#0b1a20');
    text(tag, x + 3, y + 2, 1, '#ffe14d', 'left');
   }
  } catch (e) { console.error(e); }
  return r;
 };
 /* ---------- one ticket = one career: creating a career uses the ticket; no ticket, no new career ---------- */
 if (typeof CAR459.create === 'function') {
  const cr0 = CAR459.create;
  CAR459.create = function () {
   if (off()) return cr0.apply(this, arguments);
   if (!ticket()) return { ok: false, why: 'BUY A CAREER TICKET IN THE YARD SALE - ' + PRICE + ' DIMES' };
   const r = cr0.apply(this, arguments);
   try { if (r && r.ok) useTicket(); } catch (e) { console.error(e); }
   return r;
  };
 }
 // NEW CAREER on the finished-career screen: no ticket -> CAREER MODE LOCKED
 if (typeof PANEL_ACT !== 'undefined' && typeof PANEL_ACT.car459 === 'function') {
  const a0 = PANEL_ACT.car459;
  PANEL_ACT.car459 = function (v) {
   try { if (String(v) === 'new' && !off() && !ticket()) { V.pop = null; screen = SCR; return; } } catch (e) { console.error(e); }
   return a0.apply(this, arguments);
  };
 }
})();
