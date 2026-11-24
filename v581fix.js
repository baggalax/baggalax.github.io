/* v581fix.js - 1.4 SMALL ITEM FIXES (Bagga Lax 1.4, Charlie's Nov 19 list: #1, #7).
 * #1 Bug: tapping the CHICKEN DANCE celly card shows a player standing still (other cellys play in the preview).
 *    Cause: the card preview (items17 cellyPreview, canvas.cprev17) calls items17's own drawCelly(), which knows the
 *    built-in cellys only. v565 draws the chicken dance from a render() / V17.drawCelly35 hook, and the preview
 *    uses neither, so the chicken celly fell back to an idle pose.
 *    Fix: when the preview canvas is the Chicken Dance, it is taken off items17's preview loop (class cprev17 ->
 *    cprev581) and this file draws the same dance v565 plays in games (same frames, bob, feathers, BAWK!, 3.6 s loop)
 *    on the same green preview pitch, in the lobby team's kit. Any other celly: untouched.
 * #7 Bug: under the N/A team grid a line "VETERANS DAY TEAMS: IN THE HONOR PACK" (or "...: N DIMES EACH" /
 *    "VETERANS DAY TEAMS") is drawn at a fixed spot; more N/A teams are coming, so it will sit on top of them.
 *    Cause: v493shop naGrid + v489vets grid both draw that line with the game's text().
 *    Fix: the global text() skips exactly those lines (strings that start with "VETERANS DAY TEAMS"); every tile,
 *    its lock, price and tap stay as they are.
 * No ids, rl_* keys or net protocol changed. Kill switch: window.__rl_no581fix = true (also per part:
 * __rl_no581chick, __rl_no581vlabel).
 */
(function () {
 'use strict';
 const W = window, D = document;
 if (W.__rl_no581fix || W.__rl_v124gb || W.V581F) return;
 const V = W.V581F = { err: [], n: 0 };
 const fail = (w, e) => { if (V.err.length < 30) V.err.push(w + ': ' + String(e && e.message || e).slice(0, 200)); };
 const off = k => !!(W.__rl_no581fix || W.__rl_v124gb || (k && W[k]));

 /* ---------- #1 Chicken Dance celly preview ---------- */
 const CHK = 'celly_tk565chk', FRM = [ 'bench_cheer0', 'bench_idle0', 'bench_cheer1', 'bench_clap' ], DUR = 3.6;
 let t0 = 0, curEl = null;
 function kitNow() {
  try { const tid = typeof lobbyTeam === 'function' && lobbyTeam() || (typeof season !== 'undefined' && season && season.team) || null; if (tid && typeof lobbyKit === 'function') return lobbyKit(tid); } catch (e) {}
  return { jersey: '#2c6bd8', trim: '#ffffff', helm: '#2c6bd8' };
 }
 function drawChick(cv) {
  const x = cv.getContext('2d'); if (!x) return;
  if (curEl !== cv) { curEl = cv; t0 = performance.now(); }
  const t = Math.min((performance.now() - t0) / 1000 % (DUR + .8), DUR);
  const fx = 400, fy = (typeof CY === 'number' ? CY : 101);
  const kk = g;
  g = x;
  try {
   x.imageSmoothingEnabled = false;
   x.setTransform(1, 0, 0, 1, 0, 0);
   x.fillStyle = '#2f7d3a'; x.fillRect(0, 0, cv.width, cv.height);
   x.fillStyle = '#358a41'; for (let i = 0; i < cv.width; i += 16) x.fillRect(i, 0, 8, cv.height);
   x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, cv.height - 8, cv.width, 1);
   x.translate(cv.width / 2 - fx, cv.height - 14 - fy);
   const R = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), w, h); };
   const k = Math.floor(t * 6) % 4, bob = (k % 2) ? 1 : 0, kit = kitNow();
   R(fx - 4, fy, 9, 2, 'rgba(0,0,0,.25)');
   const fr = RL12.FR && RL12.FR[FRM[k]] ? FRM[k] : 'idle';
   scaled12(Math.round(fx), Math.round(fy - bob), () => { RL12.draw(x, fr, Math.round(fx), Math.round(fy - bob), kit, true, { skin: 0, shadow: false }); });
   for (let i = 0; i < 7; i++) {
    const ph = (t * .8 + i * .31) % 1, px = fx + Math.sin(i * 2.1 + t * 3) * 14, py = fy - 30 + ph * 32;
    x.globalAlpha = 1 - ph * .6; R(px, py, 2, 1, i % 2 ? '#c98a14' : '#8a5a2b'); R(px + 1, py + 1, 1, 1, '#d6202c'); x.globalAlpha = 1;
   }
   if (Math.floor(t * 3) % 2 === 0) { const s = 'BAWK!', w = textW(s, 1); R(fx + 8, fy - 40, w + 4, 9, '#fff8d0'); text(s, fx + 10, fy - 38, 1, '#8a5a2b'); }
   V.n++;
  } catch (e) { fail('chick', e); }
  finally { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; g = kk; }
 }
 setInterval(() => {
  try {
   const mine = D.querySelector('canvas.cprev581');
   if (off('__rl_no581chick')) { if (mine) mine.classList.replace('cprev581', 'cprev17'); return; }
   const c = D.querySelector('canvas.cprev17[data-c="' + CHK + '"]');
   if (c) c.classList.replace('cprev17', 'cprev581');
   const cv = c || mine;
   if (!cv) return;
   if (cv.dataset.c !== CHK) { cv.classList.replace('cprev581', 'cprev17'); return; }   // canvas reused for another celly
   if (typeof RL12 === 'undefined' || typeof scaled12 !== 'function') { cv.classList.replace('cprev581', 'cprev17'); return; }
   drawChick(cv);
  } catch (e) { fail('tick', e); }
 }, 50);

 /* ---------- #7 no "VETERANS DAY TEAMS ..." line under the N/A grid ---------- */
 try {
  if (typeof text === 'function' && !text.__v581) {
   const T0 = text;
   const T1 = function (s) {
    if (typeof s === 'string' && s.charCodeAt(0) === 86 && s.indexOf('VETERANS DAY TEAMS') === 0 && !off('__rl_no581vlabel')) return 0;
    return T0.apply(this, arguments);
   };
   T1.__v581 = 1;
   text = T1;
  }
 } catch (e) { fail('text', e); }
})();
