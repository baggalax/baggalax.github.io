/* v418t.js - V41.8 clear teleport fix (kill switch: window.__rl_no418t = true)
 * Charlie (Nov 3): "teleport glitches on clears again".
 * The V35 anti-teleport guard (tp35 in game.js) clamps a player's per-frame move to his top speed, but it
 * (a) skips the ball carrier / held-ball clearer / controlled players, and (b) skips the frame the screen changes
 * (defense <-> live on a clear, banner -> play on a restart). Every clear-time snap measured went through one of
 * those two holes: the endline backup on a wide shot (updateDefense sets the closest guy to the endline, then he is the
 * clearer = exempt), the liveClear / startDefenseLive rebuild on the screen change, startDefense's goalie reset,
 * resumeOurs / rturn restarts after the banner.
 * Fix: same clamp, run after tp35, for those cases only. The player keeps running from where he was (at most his top
 * speed per frame); if he holds the ball the ball moves with him. Logic positions stay valid (nothing teleports).
 * Sub-switches: __rl_no418tx (in-play carrier/clearer snaps), __rl_no418tb (banner -> play restarts),
 * __rl_no418ts (defense <-> live screen changes). Offline only (online, tutorial, BRAVEHEART: unchanged).
 */
(function () {
 'use strict';
 if (typeof window === 'undefined' || typeof tp35 !== 'function' || typeof tp35key !== 'function' || typeof tp35cap !== 'function') return;
 const PLAY = { live: 1, defense: 1 };
 const SEEN = { live: 1, defense: 1, banner: 1 };
 const LOG = window.V418T = { n: 0, px: 0, max: 0, ex: 0, tr: 0, bn: 0, ball: 0, errs: 0, last: null, by: {}, bk: '' };
 const off = () => !!(window.__rl_no418t || window.__rl_v124gb);
 let M = null, MG = null, MS = '';
 function all(G) { return (G.players || []).concat(G.farU || [], G.farC || []); }
 function holds(G, p) {
  const b = G.ball;
  if (!b) return false;
  if ((G.carrier === p || G.dcar === p) && b.state === 'held') return true;
  if (G.dclear && G.dclear.holder === p && (b.state === 'clear' || b.state === 'held')) return true;
  return false;
 }
 function post(G, dt) {
  const scr = screen;
  const on = !off() && G && G.players && !G.online && !G.tutorial && !G.brave && PLAY[scr] && dt > 0 && dt <= .1;
  const ok = on && M && MG === G && SEEN[MS];
  if (ok) {
   const trans = MS !== scr;
   const kind = !trans ? 'x' : MS === 'banner' ? 'b' : 's';
   const skip = kind === 'x' ? window.__rl_no418tx : kind === 'b' ? window.__rl_no418tb : window.__rl_no418ts;
   if (!skip) {
    const ex = new Set([ G.carrier, G.dcar, G.ctrl, G.dctl, G.dclear && G.dclear.holder ].filter(Boolean));
    const done = new Set;
    for (const p of all(G)) {
     const k = tp35key(p);
     if (!k || done.has(k)) continue;
     done.add(k);
     const q = M.get(k);
     if (!q) continue;
     if (kind === 'x' && !ex.has(p)) continue; // tp35 already guards everyone else in steady play
     const dx = p.x - q[0], dy = p.y - q[1], d = Math.hypot(dx, dy);
     let cap = tp35cap(p) * dt + .2;
     if (p.kb && p.kb.t > -dt) cap += Math.hypot(p.kb.vx || 0, p.kb.vy || 0) * dt;
     // steady play: only real snaps of the carrier / clearer / controlled guy (dodges, splits, hits are far below this)
     if (kind === 'x' ? d <= Math.max(6, 3 * cap) : d <= cap) continue;
     const nx = q[0] + dx / d * cap, ny = q[1] + dy / d * cap, mx = nx - p.x, my = ny - p.y;
     p.x = nx;
     p.y = ny;
     if (holds(G, p)) { G.ball.x += mx; G.ball.y += my; LOG.ball++; }
     if (typeof TP35 !== 'undefined' && TP35.m && TP35.G === G) TP35.m.set(k, [ p.x, p.y ]);
     LOG.n++;
     LOG.px += d - cap;
     LOG.max = Math.max(LOG.max, d - cap);
     if (kind === 'x') LOG.ex++; else if (kind === 'b') LOG.bn++; else LOG.tr++;
     LOG.last = kind + ':' + MS + '>' + scr + ':' + Math.round(d);
     { const bk = kind + ':' + MS + '>' + scr + (MS === 'banner' && LOG.bk ? ':' + LOG.bk : ''), e = LOG.by[bk] || (LOG.by[bk] = [ 0, 0 ]); e[0]++; e[1] = Math.max(e[1], Math.round(d)); }
    }
   }
  }
  if (G && scr === 'banner' && G.banner) LOG.bk = G.banner.kind;
  if (G && G.players && SEEN[scr] && !off()) {
   const nm = new Map;
   for (const p of all(G)) { const k = tp35key(p); if (k && !nm.has(k)) nm.set(k, [ p.x, p.y ]); }
   M = nm; MG = G; MS = scr;
  } else { M = null; MG = null; MS = ''; }
 }
 const o = window.tp35;
 window.tp35 = function (G, dt) {
  const r = o.apply(this, arguments);
  try { post(G, dt); } catch (e) { LOG.errs++; if (LOG.errs < 4) console.warn('v418t', e); }
  return r;
 };
})();
