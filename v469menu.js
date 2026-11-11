/* v469menu.js - V46.9: PLAY > PLAY REGULAR / PLAY CAREER (Bagga Lax 1.2 beta).
 * Charlie (Nov 9 4:10 PM): "After i click play it should take me to buttons that say "play regular" and "play career"
 * then it i click play regular it should take me to the game modes tab with world games professional quick match online
 * college and ultimate" + "If i click career it takes me to franchise and career card".
 * Before: HOME > PLAY opened M37's PICK A MODE page (v37m.js rows37 'play'): QUICK GAME / ONLINE / PRO SEASON /
 *   WORLD GAMES / COLLEGE / [CAREER | ULTIMATE] / BACK (CAREER from v459caru, moved next to ULTIMATE by v460fmu;
 *   tapping it swapped the buttons in place to CAREER CARD / FRANCHISE TEAM / BACK).
 * Now (still M37.page === 'play', so every existing route that lands on 'play' keeps working):
 *   PLAY screen       : title PLAY, one line, PLAY REGULAR / PLAY CAREER / BACK (> HOME)
 *   GAME MODES screen : WORLD GAMES / PROFESSIONAL (= PRO SEASON) / QUICK MATCH (= QUICK GAME) / ONLINE / COLLEGE /
 *                       ULTIMATE / BACK (> PLAY). Each button runs the SAME fn the old PICK A MODE button ran, so the
 *                       College dimes lock, the Ultimate lock, the tutorial gates and online all behave exactly as before.
 *   CAREER screen     : v460fmu's own CAREER CARD / FRANCHISE TEAM swap, given a title + line; BACK > PLAY screen.
 *   A mode page (QUICK GAME, PRO SEASON, WORLD GAMES, COLLEGE) BACK goes to 'play', which shows GAME MODES again.
 * Only wraps menuBars / layoutBars / menuBar; no storage keys, ids, __rl_ flags or net protocol touched.
 * Kill switch: window.__rl_no469menu = true (read on every frame; the old PICK A MODE page comes straight back).
 */
(function () {
 'use strict';
 const Wn = window;
 if (typeof Wn.menuBars !== 'function' || typeof Wn.layoutBars !== 'function' || typeof Wn.menuBar !== 'function') return;
 const off = () => !!(Wn.__rl_no469menu || Wn.__rl_v124gb || Wn.__rl_no37m || !Wn.M37);
 const V = Wn.V469 = { page: 'pick', last: 'home', err: null };
 const HEAD = {
  pick: [ 'PLAY', 'PICK HOW YOU WANT TO PLAY' ],
  reg: [ 'GAME MODES', 'PICK A MODE TO PLAY' ],
  car: [ 'CAREER', 'BE THE COACH OR THE PLAYER' ]
 };
 const find = (rows, lab) => {
  for (const r of rows) for (const e of r || []) if (e && e.label === lab) return e;
  return null;
 };
 const tag = (e, k, o) => Object.assign({}, e, { t469: k }, o || {});
 function build(rows) {
  const back = (() => { for (const r of rows) for (const e of r || []) if (e && e.m37 === 'back') return e; return null; })();
  // CAREER screen: v460fmu already returned [ CAREER CARD ], [ FRANCHISE TEAM ], [ BACK ]
  const cc = find(rows, 'CAREER CARD'), ft = find(rows, 'FRANCHISE TEAM');
  if (cc && ft && !find(rows, 'ONLINE')) {
   const out = [ [ tag(ft, 'car', { h37: 34 }) ], [ tag(cc, 'car', { h37: 34 }) ] ];
   if (back) out.push([ tag(back, 'car') ]);
   return out;
  }
  const qg = find(rows, 'QUICK GAME'), ps = find(rows, 'PRO SEASON'), wg = find(rows, 'WORLD GAMES'), on = find(rows, 'ONLINE');
  if (!qg || !ps || !wg || !on) return rows; // not the PICK A MODE page we know: leave it alone
  const car = find(rows, 'CAREER') || find(rows, 'FRANCHISE MODE');
  if (V.page === 'reg') {
   const B = (e, lab) => [ tag(e, 'reg', { label: lab, big: true, sc: 2, h37: 16 }) ];
   const out = [ B(wg, 'WORLD GAMES'), B(ps, 'PROFESSIONAL'), B(qg, 'QUICK MATCH'), B(on, 'ONLINE') ];
   const co = find(rows, 'COLLEGE'), ul = find(rows, 'ULTIMATE');
   if (co) out.push(B(co, 'COLLEGE'));
   if (ul) out.push(B(ul, 'ULTIMATE'));
   out.push([ { label: 'BACK', fn: () => { V.page = 'pick'; }, bg: '#c9d6d9', m37: 'back', h37: 13, t469: 'reg' } ]);
   return out;
  }
  const out = [ [ { label: 'PLAY REGULAR', fn: () => { V.page = 'reg'; }, bg: '#7dff7a', m37: 1, h37: 40, t469: 'pick', big469: 1 } ] ];
  if (car) out.push([ { label: 'PLAY CAREER', fn: car.fn, bg: '#ffb14d', m37: 1, h37: 40, t469: 'pick', big469: 1 } ]);
  if (back) out.push([ tag(back, 'pick') ]);
  return out;
 }
 const MB0 = Wn.menuBars;
 Wn.menuBars = function () {
  const rows = MB0.apply(this, arguments);
  if (off()) return rows;
  try {
   const pg = M37.page;
   if (pg !== 'play') {
    if (pg === 'home') V.page = 'pick';
    V.last = pg;
    return rows;
   }
   V.last = 'play';
   if (!Array.isArray(rows) || !rows[0] || !rows[0][0] || !rows[0][0].m37) return rows;
   return build(rows);
  } catch (e) {
   console.error(e);
   V.err = String(e && e.stack || e);
   return rows;
  }
 };
 // room for the one-line sentence under the title
 const LB0 = Wn.layoutBars;
 Wn.layoutBars = function (rows, x, w, y0, y1) {
  if (off() || !(rows && rows[0] && rows[0][0] && rows[0][0].t469)) return LB0.apply(this, arguments);
  return LB0.call(this, rows, x, w, y0 + 10, y1);
 };
 function head(k, b) {
  const h = HEAD[k];
  if (!h) return;
  const lb = lobbyBounds(), cx = Math.round(lb.bx + lb.bw / 2);
  text(h[0], cx, 22, 1, '#ffe14d', 'center', '#000');
  const s = h[1], y = b.y - 10;
  if (textW(s, 1) <= lb.bw) text(s, cx, y, 1, '#8fe3f0', 'center', '#000');
  else if (typeof textMini === 'function') textMini(s, cx, y + 1, '#8fe3f0', Math.max(1, Math.floor(lb.bw / textW(s) * RR)) / RR);
 }
 // the two big PLAY buttons: same chunky bar + black arrow as HOME > PLAY (v37m), with the words next to the arrow
 function bigBar(b, live) {
  if (live) hit(b.label, b.x, b.y, b.w, b.h, b.fn, b.label);
  rect(b.x, b.y + 3, b.w, b.h, '#000');
  rect(b.x, b.y, b.w, b.h, b.bg);
  rect(b.x, b.y, b.w, 2, 'rgba(255,255,255,.45)');
  rect(b.x, b.y + b.h - 3, b.w, 3, 'rgba(0,0,0,.2)');
  rect(b.x, b.y, 3, b.h, 'rgba(0,0,0,.22)');
  let sc = b.h >= 20 ? 3 : 2;
  const fit = s => textW(b.label, s) + 3 * s + 2 * s + 16 <= b.w;
  while (sc > 1 && !fit(sc)) sc--;
  const tw = textW(b.label, sc), tri = 3 * sc, cx = Math.round(b.x + b.w / 2), ty = Math.round(b.y + (b.h - 5 * sc) / 2);
  const x0 = Math.round(cx - (tw + tri + 2 * sc) / 2);
  for (let i = 0; i < tri; i++) rect(x0 + i, ty + Math.round(i / 2), 1, 5 * sc - 2 * Math.round(i / 2), '#0b1a20');
  text(b.label, x0 + tri + 2 * sc, ty, sc, '#0b1a20', 'left');
 }
 const MBar0 = Wn.menuBar;
 Wn.menuBar = function (b, live) {
  if (off() || !b || !b.t469) return MBar0.apply(this, arguments);
  try {
   if (b.first37) head(b.t469, b);
  } catch (e) { console.error(e); }
  if (b.big469) return bigBar(b, live);
  return MBar0.call(this, b.first37 ? Object.assign({}, b, { first37: false }) : b, live);
 };
})();
