(function() {
 if (window.__rl_no4021disc || window.__rl_v124gb) return;
 var TXT = 'ALL NAMES ARE FICTIONAL. NOT AFFILIATED WITH ANY LEAGUE, TEAM OR PLAYER.';
 var css = document.createElement('style');
 css.textContent = '#ed31 .disc4021{flex:0 0 auto;margin-top:auto;padding:1px 2px 0;text-align:center;font:bold 8px/1.2 ui-monospace,Menlo,Consolas,monospace;' + 'letter-spacing:.3px;color:#7f97a0;text-transform:uppercase;pointer-events:none;-webkit-user-select:none;user-select:none;white-space:normal;opacity:.95}';
 document.head.appendChild(css);
 var LOG = {
  added: 0,
  hooked: false
 };
 function off() {
  return !!(window.__rl_no4021disc || window.__rl_v124gb);
 }
 function ensureNote(root) {
  if (!root) return;
  var have = root.querySelector(':scope > .disc4021');
  if (off()) {
   if (have) have.remove();
   return;
  }
  if (!root.children.length) return;
  if (have && have === root.lastElementChild) return;
  if (!have) {
   have = document.createElement('div');
   have.className = 'disc4021';
   have.setAttribute('role', 'note');
   have.textContent = TXT;
   LOG.added++;
  }
  root.appendChild(have);
 }
 var obs = null;
 function hook() {
  var root = document.getElementById('ed31');
  if (!root) return false;
  if (!obs) {
   obs = new MutationObserver(function() {
    ensureNote(root);
   });
   obs.observe(root, {
    childList: true
   });
   LOG.hooked = true;
  }
  ensureNote(root);
  return true;
 }
 function wrap() {
  if (!window.ED31) return false;
  [ 'open', 'openPlayer' ].forEach(function(k) {
   var f = ED31[k];
   if (typeof f !== 'function' || f.__d4021) return;
   var g = function() {
    var r = f.apply(this, arguments);
    try {
     hook();
    } catch (e) {
     console.error(e);
    }
    return r;
   };
   g.__d4021 = 1;
   ED31[k] = g;
  });
  return true;
 }
 if (!wrap()) {
  var n = 0, iv = setInterval(function() {
   if (wrap() || ++n > 40) clearInterval(iv);
  }, 250);
 }
 hook();
 window.V4021DISC = {
  TXT: TXT,
  LOG: LOG,
  hook: hook
 };
})();
