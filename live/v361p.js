(function() {
 'use strict';
 function skip361p() {
  const G = typeof game !== 'undefined' ? game : null;
  return !window.__rl_no361pr && !!G && !!G.practice && G.practice.drill !== 'rides';
 }
 window.skip361p = skip361p;
 if (typeof trn193 === 'function') {
  const trn0 = trn193;
  trn193 = function(G, why) {
   if (skip361p()) return false;
   return trn0.apply(this, arguments);
  };
 }
 if (typeof coverTick === 'function') {
  const cov0 = coverTick;
  coverTick = function() {
   if (skip361p()) return;
   return cov0.apply(this, arguments);
  };
 }
})();
