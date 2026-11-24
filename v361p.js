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
   ['v560rel.js?v=5600', 'v561fix.js?v=5610', 'v562codes.js?v=5620', 'v562ult.js?v=5621', 'v563ui.js?v=5630','v565turkey.js?v=5650','v566far.js?v=5660','v567cardkit.js?v=5671','v568price.js?v=5680','v569evtbtn.js?v=5691','v570tbowl.js?v=5701','v571skin.js?v=5710','v572na.js?v=5720','v578ui.js?v=5909','v578dom.js?v=5781','v580shop.js?v=7000','v579anim.js?v=6000','v579animpk.js?v=5791','v579animcar.js?v=5792','v581shop.js?v=5810','v581gear.js?v=5812','v581col.js?v=5810','v581fix.js?v=5810','v582gear.js?v=5820','v582hud.js?v=5821','v582shot.js?v=5822','v583ct.js?v=5830','v590rk.js?v=5971','v590stick.js?v=7700','v590uni.js?v=7700','v590bot.js?v=6000','v590ui.js?v=5971','v590ll.js?v=7700','v590fix.js?v=7600','v590b.js?v=6300','v591alt.js?v=7700','v592ff.js?v=7400','v593netai.js?v=5930','v594nasty.js?v=6000','v595uni.js?v=6300','v595na.js?v=5953','v596gfx.js?v=5990','v597ui.js?v=6001','v598lob.js?v=6100','v598bar.js?v=6100','v598new.js?v=7202','v598num.js?v=6100','v598fix.js?v=6304','v598ct.js?v=6303','v599rules.js?v=7700','v599clock.js?v=6302','v600clash.js?v=6300','v600bots.js?v=6302','v600botcrew.js?v=6301','v600pocket.js?v=6301','v600fb.js?v=6302','v600col.js?v=6306','v600tape.js?v=6500','v600clr.js?v=6500','v600sw.js?v=6500','v600to.js?v=6700','v600plank.js?v=6600','v600skip.js?v=6700','v600sync.js?v=6800','v600dpb.js?v=6900','v600opp.js?v=6900','v600shopart.js?v=7000','v600cprev.js?v=7100','v600ct.js?v=7201','v600ll72.js?v=7400','v600crew74.js?v=7400','v600pb74.js?v=7400','v600t10.js?v=7600','v600fo77.js?v=7700','v600stuck77.js?v=7700'].forEach(function (s) {
    var e = document.createElement('script');
    e.src = s;
    e.async = false;
    document.body.appendChild(e);
   });
  } catch (e) { console.error(e); }
 });
})();
