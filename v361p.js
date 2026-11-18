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
(function () {
 // 1.3 add-on loader: runs after every index.html script has executed, then loads the v56x modules in order
 document.addEventListener('DOMContentLoaded', function () {
  try {
   ['v560rel.js?v=5600', 'v561fix.js?v=5610', 'v562codes.js?v=5620', 'v562ult.js?v=5621', 'v563ui.js?v=5630','v565turkey.js?v=5650'].forEach(function (s) {
    var e = document.createElement('script');
    e.src = s;
    e.async = false;
    document.body.appendChild(e);
   });
  } catch (e) { console.error(e); }
 });
})();
