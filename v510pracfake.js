/* v510pracfake.js - BAGGA LAX 1.3: CREASE FAKES IN PRACTICE MODE.
 * Charlie (Nov 11, 7:42 PM): "There's no fakes in practice mode rn add that."
 * v507fake.js gates its FAKE button and its crease roll to offline matches on GROSS / NASTY / BAGGATWAAN and skips practice
 * (its gate is inside its own closure, so it can't be widened from outside). This file runs a SECOND copy of v507fake.js,
 * built at boot from v507's own file text, with exactly five things changed:
 *   1) the gate: practice games only (not the fake tutorial drill, not online / tutorial / brave),
 *   2) the tier: any practice difficulty works - below GROSS it uses the GROSS odds,
 *   3) no tutorial (v507's own copy still runs the mandatory one),
 *   4) it reports as window.V510PF (v507's copy stays window.V507FAKE),
 *   5) it marks its own shots ball.f510 (v507 uses ball.f507), so each copy only ever settles its own crease shots.
 * So real matches keep v507's own copy and odds untouched, and any fix made to v507fake.js (button, taps, keys, controller)
 * is in practice too, automatically. If v507's text ever changes so a patch point is not found exactly once, this file
 * does nothing (V510PF_STATUS says why) - practice is then simply as before.
 * Kill switch: window.__rl_no510pf = true (also off when v507 is killed: __rl_no507fake / __rl_v124gb at boot).
 * No new save keys, ids, rl_* keys or net messages.
 */
(function () {
 'use strict';
 const W0 = window;
 const S = W0.V510PF_STATUS = { on: false, why: 'loading', t: 0 };
 if (W0.__rl_no510pf || W0.__rl_no507fake || W0.__rl_v124gb) { S.why = 'killed'; return; }
 if (!W0.V507FAKE) { S.why = 'no v507'; return; }
 const el = document.querySelector('script[src*="v507fake.js"]');
 if (!el) { S.why = 'no v507 script tag'; return; }
 const P = [   // [find, replace] - each must match exactly once
  [ 'const OFF = () => !!(W0.__rl_no507fake || W0.__rl_v124gb);', 'const OFF = () => !!(W0.__rl_no507fake || W0.__rl_v124gb || W0.__rl_no510pf);' ],
  [ ' if (OFF()) return;\n if (!W0.SHOT26', ' if (!W0.SHOT26' ],
  [ 'function tier() {', 'function tier() { return Math.max(0, tier0()); }\n function tier0() {' ],
  [ 'function okG(G) {', 'function okG(G) { return !!G && !OFF() && !!G.practice && !G.practice.fake507 && !G.online && !(G.meta && G.meta.online) && !(W0.RLNET && RLNET.inGame) && !G.tutorial && !G.brave; }\n function okG0(G) {' ],
  [ 'function need() {', 'function need() { return false; }\n function need0() {' ],
  [ 'W0.V507FAKE = {', 'W0.V510PF = {' ],
  [ "console.warn('v507fake'", "console.warn('v510pf'" ]
 ];
 const PALL = [ [ 'b.f507', 'b.f510' ], [ 'G.ball.f507', 'G.ball.f510' ] ];   // its own mark on the shot ball, so each copy settles only its own shots
 function build(src) {
  for (const [a, b] of PALL) {
   if (src.indexOf(a) < 0) return { err: 'patch point ' + JSON.stringify(a) + ' not found' };
   src = src.split(a).join(b);
  }
  for (const [a, b] of P) {
   const i = src.indexOf(a);
   if (i < 0 || src.indexOf(a, i + a.length) >= 0) return { err: 'patch point ' + JSON.stringify(a.slice(0, 40)) + (i < 0 ? ' not found' : ' found twice') };
   src = src.slice(0, i) + b + src.slice(i + a.length);
  }
  return { src: '/* v510pracfake: practice copy of v507fake */\n' + src + '\n//# sourceURL=v510pracfake-copy.js' };
 }
 S.why = 'fetching';
 fetch(el.src).then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.text(); }).then(txt => {
  if (W0.__rl_no510pf) { S.why = 'killed'; return; }
  const b = build(txt);
  if (b.err) { S.why = b.err; return; }
  const s = document.createElement('script');
  s.textContent = b.src;
  document.head.appendChild(s);
  S.on = !!W0.V510PF; S.why = S.on ? 'ok' : 'copy did not start'; S.t = Date.now();
 }).catch(e => { S.why = 'fetch failed: ' + String(e && e.message || e).slice(0, 80); });
})();
