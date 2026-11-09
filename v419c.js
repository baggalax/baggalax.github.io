// ===== BAGGA LAX v419c.js - COLLECT SCREENS ALWAYS POP =====
// Charlie, Nov 3: "not getting the collect screen sometimes after earning things it should always pop up".
// Why it was skipped (found in V40.1.2):
//  1. After a game, MENU (final screen) sets screen='menu' but leaves the finished game in `game` (only QUIT TO MENU / reload null it).
//     Three menu ticks require `game` to be null, so they stay asleep until the app is reloaded:
//       - v27 claimTick/menuFree27: the COLLECT screen for NEW CARD(S) (card drops), NEW STADIUM, ULTIMATE CHAMPIONS, ghost unis, test kit
//       - v28 unlockTick+flushClaims: the title/halloween stadium unlock and its NEW STADIUM collect screen
//       - c30 giftTick (free gift toast)
//     The rewards were granted at earn time; only the screen waited (forever, or until the next app launch). That is the "sometimes".
//  2. Both collect screens (v17 canvas CLAIM/COLLECT and v27 COLLECT) only open on the main menu, so a season/world player who goes
//     final -> hub -> next game never saw them until he backed out to the main menu.
//  3. v27 keeps only the newest 20 queued screens (slice(-20)); with (1) blocking them, a long session silently dropped the oldest.
// Fix (no edits to existing files):
//  A. Our `step` wrapper: on the main menu with a FINISHED game left over, the inner step runs with game=null (the same state QUIT TO MENU
//     and a reload give), then `game` is put back for render/taps. game.js step2317 returns at once on 'menu' either way, so only the
//     menu ticks above change: they now fire right away.
//  B. Post-game (final screen, after the celebration) and the season / world / online-season hubs are safe moments too: queued collect
//     screens open there one after another (v27 screens through V27.showClaim; v17 uniform/card/notice claims through a DOM twin #c419
//     whose button calls V17.claimChal()). Weekly challenge claims, which open a pack and return to the menu, still wait for the menu.
//  C. External V27.queue callers (card drops, stadiums, test kit) merge into the last waiting screen instead of pushing the oldest out.
// Exactly once: nothing here grants anything. v27 screens were granted at earn time and COLLECT only removes them; v17 claims are paid by
// V17.claimChal() (chalPaid guard / inv check), once per tap (button disables itself). Both queues already live in saved state
// (v27claims, rl_v17 chalClaim), so they survive reloads and screen changes. No new save keys.
// Kill switch: window.__rl_no419c = true  (restores V40.1.2 behaviour exactly).
(function() {
 'use strict';
 const on = () => !window.__rl_no419c && !window.__rl_v124gb;
 const LOG = { swap: 0, shown: [], v17: [], merged: 0, closed: 0, err: [] };
 const scr = () => typeof screen !== 'undefined' ? screen : '';
 const G0 = () => typeof game !== 'undefined' ? game : null;
 const SAFE = [ 'final', 'season', 'wgHub', 'wgChamp', 'onSeason' ];
 // live-play screens (GAME_SCREENS also lists the 'final' result screen, which is a safe moment here)
 const GS = () => (typeof GAME_SCREENS !== 'undefined' && Array.isArray(GAME_SCREENS) ? GAME_SCREENS : [ 'live', 'cpu', 'defense', 'faceoff', 'banner', 'qbreak', 'pregame', 'scene' ]).filter(s => s !== 'final');
 const netIn = () => {
  try {
   return !!(window.RLNET && RLNET.inGame);
  } catch (e) {
   return false;
  }
 };
 // ---- A. stale finished game on the main menu
 function stale() {
  if (scr() !== 'menu') return null;
  const G = G0();
  if (!G || !G.over || G.tutorial || netIn()) return null;
  return G;
 }
 const S0 = window.step;
 if (typeof S0 === 'function') window.step = function(dt) {
  let G = null;
  try {
   G = on() ? stale() : null;
  } catch (e) {
   G = null;
  }
  if (!G) return S0.apply(this, arguments);
  game = null;
  LOG.swap++;
  try {
   return S0.apply(this, arguments);
  } finally {
   if (game === null) game = G;
  }
 };
 // ---- C. never push a waiting collect screen out of v27's 20-slot queue
 try {
  if (window.V27 && typeof V27.queue === 'function' && typeof V27.claims === 'function' && !V27.queue.c419) {
   const q0 = V27.queue;
   const q1 = function(c) {
    try {
     if (on() && c && c.id) {
      const a = V27.claims();
      if (a.length >= 18 && !a.some(x => x.id === c.id)) {
       const open = document.getElementById('c27'), oid = open && open.dataset ? open.dataset.id : null;
       let k = a.length - 1;
       if (a[k] && a[k].id === oid) k--;
       if (k >= 0 && a[k]) {
        a[k].groups = (a[k].groups || []).concat(c.groups || []);
        a[k].head = 'NEW REWARDS!';
        LS.set('v27claims', a);
        LOG.merged++;
        return true;
       }
      }
     }
    } catch (e) {
     LOG.err.push(String(e));
    }
    return q0.apply(this, arguments);
   };
   q1.c419 = true;
   V27.queue = q1;
  }
 } catch (e) {}
 // ---- B. safe moments off the main menu
 function overlayUp() {
  try {
   if (window.V24 && V24.isOpen && V24.isOpen()) return true;
   if (window.V17 && V17.modal && V17.modal()) return true;
   if (typeof tutAsk !== 'undefined' && tutAsk) return true;
   if (typeof ASK22 !== 'undefined' && ASK22) return true;
   if (typeof paused !== 'undefined' && paused) return true;
   const A = innerWidth * innerHeight * .3, U = document.getElementById('ui');
   const kids = Array.prototype.slice.call(document.body.children).concat(U ? Array.prototype.slice.call(U.children) : []);
   for (const e of kids) {
    if (e.id === 'c419' || e.id === 'ui' || e.tagName === 'CANVAS' || e.tagName === 'SCRIPT' || e.tagName === 'STYLE') continue;
    const s = getComputedStyle(e);
    if (s.position !== 'fixed' && s.position !== 'absolute' || s.display === 'none' || s.visibility === 'hidden' || s.pointerEvents === 'none' || +s.opacity === 0) continue;
    const r = e.getBoundingClientRect();
    if (r.width * r.height > A) return true;
   }
   for (const id of [ 'df2503', 'shop26', 'tut26card', 'c27', 'tt27', 'fw37' ]) if (document.getElementById(id)) return true;
  } catch (e) {
   return true;
  }
  return false;
 }
 function tutOk() {
  try {
   return !!(window.__rl_no26 || window.__rl_v124gb || LS.get('tut26', false));
  } catch (e) {
   return false;
  }
 }
 function safeHere() {
  const s = scr();
  if (SAFE.indexOf(s) < 0) return false;
  if (netIn()) return false;
  const G = G0();
  if (s === 'final') {
   if (!G || !G.over || G.tutorial || G.online || G.meta && G.meta.online) return false;
   if (G.celeb && !G.celeb.done) return false;
   if (!((G.finalT || 0) >= 2.2)) return false;
  } else if (G && !G.over) return false;
  return tutOk() && !overlayUp();
 }
 const packClaim = q => !!q && !q.notice && !q.u1 && !q.c22;
 function v17Next() {
  try {
   const a = window.V17 && V17.chalClaim && V17.chalClaim();
   return Array.isArray(a) && a.length ? a : null;
  } catch (e) {
   return null;
  }
 }
 function el(tag, css, txt) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (txt != null) e.textContent = txt;
  return e;
 }
 function showV17(q, n) {
  const d = el('div', 'position:fixed;inset:0;z-index:86;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);font:bold 11px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;color:#cfe;touch-action:manipulation;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box');
  d.id = 'c419';
  d.dataset.id = q.id;
  const box = el('div', 'background:#14222b;border-top:2px solid #ffcc33;box-shadow:0 3px 0 #000;padding:6px 10px 8px;max-width:96%;max-height:96%;display:flex;flex-direction:column;text-align:center;box-sizing:border-box;min-width:230px');
  box.appendChild(el('div', 'color:#ffcc33;font-size:15px;text-shadow:2px 2px 0 #000;margin-bottom:2px', q.c22 ? q.head || 'TITLE WON - PLAYER CARDS!' : q.u1 ? 'TITLE WON - NEW UNIFORM!' : 'WEEKLY CHALLENGE COMPLETE!'));
  if (q.txt) box.appendChild(el('div', 'color:#cfe;font-size:10px;margin-bottom:4px;max-width:420px;margin-left:auto;margin-right:auto', String(q.txt)));
  const row = el('div', 'display:flex;align-items:center;justify-content:center;gap:6px;margin:4px 0');
  let img = '', l1 = '', l2 = '', col = '#ffcc33';
  try {
   if (q.c22 && window.V22) {
    const ln = V22.claimLines ? V22.claimLines(q) : [];
    l1 = ln[0] || '';
    l2 = ln[1] || '';
    if (q.top && V22.artUrl) img = V22.artUrl(q.top, V22.teamOfCard ? V22.teamOfCard(q.top) : undefined);
   } else if (q.item && V17.BY && V17.BY[q.item]) {
    l1 = V17.BY[q.item].n;
    l2 = q.u1 ? 'UNIFORM - IN YOUR LOCKER ROOM' : '';
    col = '#8fe3f0';
    img = V17.iconUrl ? V17.iconUrl(q.item) : '';
   } else if (q.pay) l1 = '+' + q.pay + ' CHINOS';
  } catch (e) {}
  if (img) {
   const im = el('img', 'height:40px;width:40px;object-fit:contain;image-rendering:pixelated');
   im.src = img;
   im.alt = '';
   row.appendChild(im);
  }
  const tx = el('div', 'text-align:left');
  tx.appendChild(el('div', 'color:#7dff7a;font-size:9px', 'YOUR REWARD:'));
  if (l1) tx.appendChild(el('div', 'color:' + col + ';font-size:11px', l1));
  if (l2) tx.appendChild(el('div', 'color:#cfe;font-size:9px', l2));
  if (q.notice) tx.appendChild(el('div', 'color:#7dff7a;font-size:9px', 'ALREADY ADDED'));
  row.appendChild(tx);
  box.appendChild(row);
  if (n > 1) box.appendChild(el('div', 'color:#b9a8ff;font-size:9px', n - 1 + ' MORE WAITING'));
  const b = el('button', 'font:inherit;font-size:13px;border:0;border-radius:0;padding:8px 26px;margin:6px auto 0;color:#0b1a20;cursor:pointer;touch-action:manipulation;box-shadow:0 2px 0 #000;background:#7dff7a;flex:0 0 auto', q.notice ? 'OK' : 'COLLECT');
  b.id = 'c419_ok';
  b.type = 'button';
  let done = false;
  b.addEventListener('click', e => {
   e.preventDefault();
   e.stopPropagation();
   if (done) return;
   done = true;
   b.disabled = true;
   try {
    const a = v17Next();
    if (a && a[0] && a[0].id === q.id) {
     V17.claimChal();
     LOG.v17.push(q.id);
    }
   } catch (er) {
    console.error(er);
   }
   d.remove();
   lastLook = 0;
  });
  box.appendChild(b);
  d.appendChild(box);
  d.addEventListener('pointerdown', e => e.stopPropagation());
  d.addEventListener('touchstart', e => e.stopPropagation(), {
   passive: true
  });
  document.body.appendChild(d);
  LOG.shown.push('v17:' + q.id + '@' + scr());
 }
 let lastLook = 0;
 function tick() {
  if (!on()) {
   const d = document.getElementById('c419');
   if (d) d.remove();
   return;
  }
  const s = scr();
  // a collect screen never sits on top of live play: close it (it stays queued) if a game screen comes up under it
  if (GS().indexOf(s) >= 0) {
   for (const id of [ 'c419', 'c27' ]) {
    const d = document.getElementById(id);
    if (d && d.dataset && (id === 'c419' || d.dataset.by419)) {
     d.remove();
     LOG.closed++;
    }
   }
   return;
  }
  if (document.getElementById('c419') || document.getElementById('c27')) return;
  const t = performance.now();
  if (t - lastLook < 700) return;
  lastLook = t;
  if (s === 'menu' || !safeHere()) return;
  const a = v17Next();
  if (a) {
   if (!packClaim(a[0])) return showV17(a[0], a.length);
   // a weekly challenge claim opens a pack and lands on the menu: that one waits for the menu; v27 screens behind it may still show
  }
  try {
   const c = window.V27 && V27.claims ? V27.claims()[0] : null;
   if (c && V27.showClaim) {
    V27.showClaim(c);
    const d = document.getElementById('c27');
    if (d) d.dataset.by419 = '1';
    LOG.shown.push('v27:' + c.id + '@' + s);
   }
  } catch (e) {
   console.error(e);
  }
 }
 setInterval(() => {
  try {
   tick();
  } catch (e) {
   console.error(e);
  }
 }, 250);
 window.V419C = {
  on: on,
  LOG: LOG,
  stale: stale,
  safeHere: safeHere,
  tick: tick,
  SAFE: SAFE
 };
})();
