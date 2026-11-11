/* v461lk.js - locked ghost items (e.g. NEW ORLEANS GHOSTS HALLOWEEN STADIUM) showed purple in the locker.
 * Cause: style.css #panel .c17.gh16 comes after #panel .c17.lk with equal specificity, so the ghost purple beat the locked look
 * (legendary already had its own .lg23.lk override; ghost never did). Fix: a locked ghost tile looks like every other locked tile.
 * Kill switch: window.__rl_no461lk = true. CSS only, no storage, no net. */
(function(){ if (window.__rl_no461lk) return; try {
 const s=document.createElement('style'); s.id='v461lk';
 s.textContent='#panel .c17.gh16.lk{border-color:#3a434b;background:#0d1217;animation:none}#panel .c17.gh16.lk::after{display:none}#panel .c17.gh16.lk .nm{color:#7f8a93}#panel .c17.gh16.lk .rr{color:#56606a;font-weight:normal}';
 (document.head||document.documentElement).appendChild(s);
} catch(e){} })();
