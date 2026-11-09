(function() {
 'use strict';
 if (typeof RL12 === 'undefined' || !RL12.FR || typeof window.frame12 !== 'function') return;
 const FR = RL12.FR;
 FR.fo39_down = [ 9, 15, [ 9, -3 ], [ "..........ooooo........", "........ooHHHHwoo......", ".......oHHHHHHHHwo.....", "......ohHHHHHHHHHHo....", ".....oohHHHHHHHoooooo..", "...oohhhHHHHoZcScco....", "..oJJohhhhHoSSccScco...", ".oJJJJoooooSSScScco....", ".oJJJJJJooooCCCCCo.....", ".ojjjjjjJJJJJoooo......", ".oJJJJJJoooJJJoo.MM....", ".oJJJoJJJJoooGGGMmnM...", ".oSSo.ooSSXXXGGGXnmM...", ".oWWo..oWWo..oooMmnM...", "oKKKo..oKKKo.....MM....", ".ooo....ooo............" ] ];
 FR.fo39_hover = [ 9, 15, [ 9, -5 ], [ "..........ooooo........", "........ooHHHHwoo......", ".......oHHHHHHHHwo.....", "......ohHHHHHHHHHHo....", ".....oohHHHHHHHoooooo..", "...oohhhHHHHoZcScco....", "..oJJohhhhHoSSccScco...", ".oJJJJoooooSSScScco....", ".oJJJJJJooooCCCCCoM....", ".ojjjjjjJJJJJoooMmnM...", ".oJJJJJJoooJJJGGonmM...", ".oJJJoJJJJoXXGGGXmnM...", ".oSSo.ooSSo..ooo.MM....", ".oWWo..oWWo............", "oKKKo..oKKKo...........", ".ooo....ooo............" ] ];
 const RISE = .16;
 const off = () => !!(window.__rl_no39fo || window.__rl_v124gb);
 const D = {
  crouch: 0,
  hover: 0,
  rise: 0,
  last: null
 };
 function pick(p) {
  if (off() || !p || typeof screen === 'undefined' || screen !== 'faceoff') return null;
  const G = typeof game !== 'undefined' ? game : null, F = G && G.fo;
  if (!F || !p.pl || p.far || p.down > 0 || p.dodgeA) return null;
  if (p.role !== 'fogo' && p !== G.foMe && p !== G.foThem) return null;
  const ph = F.phase;
  if (ph === 'ready' || ph === 'set' || ph === 'go' || ph === 'wait') return 'fo39_down';
  if (ph === 'form') return 'fo39_hover';
  if (ph === 'scrum' && (F.st || 0) < RISE) return 'getup0';
  return null;
 }
 const f0 = window.frame12;
 const f1 = function(p) {
  const n = pick(p);
  if (!n || !FR[n]) return f0.apply(this, arguments);
  if (n === 'getup0') {
   const r = f0.apply(this, arguments);
   if (/run|cradle/.test(r)) return r;
   D.rise++;
   return n;
  }
  if (n === 'fo39_hover') {
   const r = f0.apply(this, arguments);
   if (/run|cradle/.test(r)) return r;
   D.hover++;
   return n;
  }
  D.crouch++;
  return n;
 };
 f1.__v39fo = true;
 window.frame12 = f1;
 try {
  frame12 = f1;
 } catch (e) {}
 const dp0 = window.drawPlayer12;
 if (typeof dp0 === 'function') {
  const dp1 = function(p, kit, faceRight) {
   if (pick(p)) {
    const G = game, bx = G && G.ball ? G.ball.x : null;
    if (bx != null && Math.abs(p.x - bx) > .5) faceRight = p.x < bx;
    D.last = {
     x: Math.round(p.x),
     fr: faceRight
    };
   }
   return dp0.call(this, p, kit, faceRight);
  };
  dp1.__v39fo = true;
  window.drawPlayer12 = dp1;
  try {
   drawPlayer12 = dp1;
  } catch (e) {}
 }
 const dd0 = window.drawDodger12;
 if (typeof dd0 === 'function') {
  const dd1 = function(p, kit, faceRight) {
   if (!p.dodgeA && pick(p) && typeof window.drawPlayer12 === 'function') {
    D.lefty = (D.lefty || 0) + 1;
    return window.drawPlayer12(p, kit, faceRight);
   }
   return dd0.apply(this, arguments);
  };
  dd1.__v39fo = true;
  window.drawDodger12 = dd1;
  try {
   drawDodger12 = dd1;
  } catch (e) {}
 }
 window.V39FO = {
  pick: pick,
  dbg: D,
  on: () => !off(),
  RISE: RISE
 };
})();
