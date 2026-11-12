/* v503fix.js - Bagga Lax 1.3: ball sits in the stick pocket, and a shot still plays when the player is wearing gear.
   Kill switch: window.__rl_no503 = true */
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no503 || W.V503) return;
 const V = W.V503 = { ball: 0, shot: 0, err: [] };
 const off = () => !!W.__rl_no503;

 try {
  if (W.V17 && typeof V17.drawP === 'function' && !V17._drawP0) V17._drawP0 = V17.drawP;
  const d0 = V17 && V17.drawP;
  if (typeof d0 === 'function' && !d0.__v503) {
   let busy = false;
   const wrapped = function (gx, n, p, kit, faceRight) {
    if (off() || busy || !p) return d0.apply(this, arguments);
    const S = W.__rl442;
    let shot = false, wind = -1;
    try { shot = !!(S && S.shotOf && S.shotOf(p)); } catch (e) {}
    try { wind = S && S.windOf ? S.windOf(p) : -1; } catch (e) {}
    const shotName = n === 'f20_shotBody' || /^shoot[0-2]$/.test(n || '');
    if ((shot && shotName) || wind >= 0) {
     busy = true;
     try {
      if (typeof RL12 !== 'undefined' && RL12.draw) {
       const skin = typeof skinOf === 'function' ? skinOf(p.pl) : 0;
       RL12.draw(gx, n, p.x, p.y, kit, faceRight, { skin: skin });
       V.shot++;
       return true;
      }
     } catch (e) { V.err.push('shot ' + (e && e.message || e)); }
     finally { busy = false; }
    }
    return d0.apply(this, arguments);
   };
   wrapped.__v503 = true;
   V17.drawP = wrapped;
  }
 } catch (e) { V.err.push('wrap ' + (e && e.message || e)); }

 try {
  const b0 = W.drawBallNow;
  if (typeof b0 === 'function' && !b0.__v503) {
   const wrapped = function () {
    if (off()) return b0.apply(this, arguments);
    try {
     const G = typeof game !== 'undefined' ? game : null;
     const b = G && G.ball;
     const c = b && b.state === 'held' && typeof screen !== 'undefined' && screen === 'live' ? G.carrier : null;
     if (!c || typeof ballDot !== 'function') return b0.apply(this, arguments);
     const face = c._fright !== false;
     const S = typeof PSC !== 'undefined' ? PSC : 1;
     let px = null, py = null;
     const H = c._442h;
     const fresh = H && typeof menuT === 'number' && menuT - H.t >= 0 && menuT - H.t < 0.05 && (H.A || null) === (c.dodgeA || null);
     if (fresh) {
      px = Math.round(c.x + H.dx * S) - 1;
      py = Math.round(c.y + (H.dy - (H.tall ? 0 : 1.5)) * S) - 1;
     } else if (c._fr && typeof RL12 !== 'undefined' && RL12.pocket) {
      const pk = RL12.pocket(c._fr, face);
      if (pk) {
       const sx = c._sox || 0, sy = c._soy || 0;
       px = Math.round(c.x + sx + pk[0] * S) - 1;
       py = Math.round(c.y + sy + pk[1] * S) - 1;
      }
     }
     if (px == null) return b0.apply(this, arguments);
     if (typeof bj287 !== 'undefined') { bj287.x = 0; bj287.y = 0; bj287.bx = b.x; bj287.by = b.y; bj287.held = true; }
     ballDot(px, py);
     V.ball++;
     return;
    } catch (e) { V.err.push('ball ' + (e && e.message || e)); }
    return b0.apply(this, arguments);
   };
   wrapped.__v503 = true;
   W.drawBallNow = wrapped;
  }
 } catch (e) { V.err.push('ballwrap ' + (e && e.message || e)); }
})();
