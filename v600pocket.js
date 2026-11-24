/* v600pocket.js - Bagga Lax 1.5f: the carried ball sits in the NEW stick head's pocket
 * Bug (Charlie): in dodges / cradles the ball was drawn outside the stick pocket.
 * Cause: (1) the ball goes to RL12.pocket(frame) = the OLD 5x7 head's pocket stored with each frame; v590stick draws the
 *   new head on the shaft top along the shaft angle, so on angled / moved-head frames the two differ by up to a few
 *   pixels. (2) ballVis12 eases the held ball toward the pocket (half way per frame), so in a fast dodge it trails
 *   behind the stick.
 * Fix: RL12.pocket returns the centre of the NEW head's mesh, from the same frame data v590stick uses (shaft top =
 *   throat, head along the shaft line, mesh centre 4.25 sprite px up the head). Frames with no new head (goalies,
 *   frames without a stick head) keep the old pocket. A ball that was already held last frame snaps to the pocket.
 *   Both hands (mirrored frames) and long poles (same shaft rule) follow automatically. Draw-only: no game state changes.
 * Kill switch: window.__rl_no600pocket
 */
(function () {
 const Wn = window;
 if (typeof RL12 === 'undefined' || !RL12.FR || !RL12.pocket) return;
 const FR = RL12.FR, p0 = RL12.pocket, cache = new Map, D = 4.25;
 function calc(name) {
  const f = FR[name]; if (!f || !f[3] || /^prop_/.test(name)) return null;
  if (!Wn.__rl_no595gk && /^g_|goalie/.test(name)) return null; // goalies keep their own head (v590stick)
  const rows = f[3], head = [], shaft = [];
  for (let r = 0; r < rows.length; r++) for (let q = 0; q < rows[r].length; q++) { const k = rows[r][q]; if (k === 'M' || k === 'm' || k === 'n') head.push([q, r]); else if (k === 'X') shaft.push([q, r]); }
  if (head.length < 6 || shaft.length < 2) return null;
  shaft.sort((a, b) => a[1] - b[1] || a[0] - b[0]); const a0 = shaft[0], a1 = shaft[shaft.length - 1];
  const ang = a1[1] !== a0[1] ? Math.atan2(a1[0] - a0[0], a1[1] - a0[1]) : 0;
  return [a0[0] + .5 - f[0] - D * Math.sin(ang), a0[1] + 1 - f[1] - D * Math.cos(ang)]; // the head continues the shaft line past its top // throat = v590stick's anchor (shaft-top cell centre x, its bottom edge y)
 }
 RL12.pocket = function (name, faceRight) {
  if (Wn.__rl_no600pocket || Wn.__rl_no590stick) return p0.apply(this, arguments);
  let p = cache.get(name); if (p === undefined) { p = calc(name); cache.set(name, p); }
  if (!p) return p0.apply(this, arguments);
  return [faceRight ? p[0] : 1 - p[0], p[1]]; // mirrored sprite: x -> width - x around the anchor cell
 };
 RL12.pocket600 = calc;
 // dodges (split / roll / swim / toe, both hands, long poles): the ball goes in the mesh of the head v590stick just drew
 // for this carrier (its real transform), not in the hand-drawn dodge pocket offsets
 const S = Wn.STICK590 || {};
 ['drawDodger12', 'drawDodger12s'].forEach(fn => { const f0 = Wn[fn]; if (typeof f0 !== 'function') return; Wn[fn] = function (p) { S.pk = null; const r = f0.apply(this, arguments); try { if (p && S.pk) p._pk600 = { x: S.pk.x, y: S.pk.y, ctx: S.pk.ctx, n: (Wn.__pkN600 | 0) }; } catch (e) {} return r; }; });
 const bn0 = Wn.drawBallNow;
 if (typeof bn0 === 'function') Wn.drawBallNow = function () {
  try {
   const G = typeof game !== 'undefined' ? game : null, b = G && G.ball, c = b && b.state === 'held' && (screen === 'live' || screen === 'defense') ? (screen === 'live' ? G.carrier : G.dcar) : null, K = c && c._pk600;
   if (!Wn.__rl_no600pocket && !Wn.__rl_no600dodgeball && c && c.dodgeA && K && K.n === (Wn.__pkN600 | 0) && K.ctx === g && typeof ballDot === 'function') {
    const P = g.getTransform().inverse().transformPoint(new DOMPoint(K.x, K.y)); ballDot(P.x - 1, P.y - 1); return;
   }
  } catch (e) {}
  return bn0.apply(this, arguments);
 };
 // frame counter: a recorded head only counts for the frame it was drawn in
 if (typeof Wn.render === 'function') { const r0 = Wn.render; Wn.render = function () { Wn.__pkN600 = (Wn.__pkN600 | 0) + 1; return r0.apply(this, arguments); }; }
 // a ball that stays held snaps to the pocket each frame (no half-way easing behind a fast dodge)
 if (typeof Wn.ballVis12 === 'function') {
  const bv0 = Wn.ballVis12; let wasHeld = false;
  Wn.ballVis12 = function (b) {
   try { if (!Wn.__rl_no600pocket && b && b.state === 'held' && wasHeld && typeof bv12 !== 'undefined' && typeof menuT === 'number') bv12.t = menuT - 1; } catch (e) {}
   wasHeld = !!(b && b.state === 'held');
   return bv0.apply(this, arguments);
  };
 }
})();
