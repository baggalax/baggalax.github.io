// v447out.js - V44.7: signing out starts the next account fresh (kill switch: window.__rl_no447out = true -> exactly like before).
// Charlie (Nov 8 2:34 AM, App Store app): "signed out + made a NEW account, still had all my old stuff".
// Cause: progress lives in this phone's storage (rl_* keys). SIGN OUT (acct23.js) only forgot the account token and said
// "YOUR SAVE STAYS ON THIS PHONE", so the next account made here uploaded the old progress as its own first save.
// Fix: tapping SIGN OUT (#b23out) while signed in first makes sure the cloud holds this exact save (upload if anything changed,
// then read it back from /api/save/get and compare). ONLY when the server confirms it, it signs out the normal way, clears the
// local PROGRESS keys (settings, sound/music, purchase ledger, device id and other flags stay) and reloads, so a new account
// starts fresh and signing back in brings the old save back from the cloud. If the save can't be confirmed (no connection,
// conflict, waiting prompt) it signs out exactly like before and nothing is cleared. No ids, no server routes, no net messages change.
(function () {
 'use strict';
 const W0 = window;
 const off = () => !!W0.__rl_no447out || !!W0.__rl_v124gb;
 // rl_* keys that are NOT progress: kept on this phone across sign-out.
 const KEEP = new Set(['rl_dev', 'rl_acct23', 'rl_sw_reload', 'rl_netGame', 'rl_settings', 'rl_set171', 'rl_muted', 'rl_mus4013',
  'rl_iap41', 'rl_ref40', 'rl_err18', 'rl_userAsked', 'rl_pdhelp404', 'rl_r2405_mig',
  'rl_tutDone', 'rl_tutGate', 'rl_tut26', 'rl_rl4012tut']);  // tutorial-seen flags too: signing out must not throw them back into the tutorial
 const V = W0.V447OUT = { on: () => !off() && !!W0.V23, log: [], busy: false, KEEP: KEEP };
 const lg = s => { V.log.push(Date.now() % 1e7 + ' ' + s); if (V.log.length > 40) V.log.shift(); };
 const progKeys = () => {
  const ks = [];
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('rl_') && !KEEP.has(k)) ks.push(k); } } catch (e) {}
  return ks;
 };
 V.progKeys = progKeys;
 function setMsg(m, err) {
  try { const S = W0.V23.st; if (err) { S.err = m; S.msg = ''; } else { S.msg = m; S.err = ''; } } catch (e) {}
  try { const b = document.getElementById('b23out'); if (b) { b.disabled = !!V.busy; } } catch (e) {}
  try { const r = document.getElementById('acct23'); const t = r && r.querySelector('.ok,.err'); if (t) t.textContent = m; } catch (e) {}
 }
 // Is the server's copy exactly this phone's save? Upload first if anything changed.
 async function cloudConfirmed() {
  const V23 = W0.V23, A = V23.A();
  if (!A || !A.tok || A.pend) return { ok: false, why: A && A.pend ? 'prompt pending' : 'not signed in' };
  if (V23.dirty()) {
   const r = await V23.put(false, 'signout447');
   if (!r || !r.ok) return { ok: false, why: 'put ' + (r && (r.error || (r.conflict ? 'conflict' : '')) || 'failed') };
  }
  const cur = JSON.stringify(V23.snap());
  const g = await V23.api('/save/get', { tok: V23.A().tok });
  if (!g || !g.ok || !g.save) return { ok: false, why: 'get ' + (g && g.error || 'no save') };
  const A2 = V23.A();
  if (g.save.data === cur) return { ok: true, how: 'same data rev ' + g.save.rev };
  if (g.save.rev === (A2.rev || 0) && !V23.dirty()) return { ok: true, how: 'same rev ' + g.save.rev };
  return { ok: false, why: 'cloud differs (rev ' + g.save.rev + ' vs ' + (A2.rev || 0) + ')' };
 }
 function wipeProgress() {
  const ks = progKeys();
  ks.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  try { localStorage.removeItem('rl_bak23'); } catch (e) {}  // the old account's "undo load" backup must not follow into a new account
  // keep the running game from writing the old progress back before the reload
  const S0 = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
   if (this === W0.localStorage && String(k).startsWith('rl_') && !KEEP.has(String(k))) return;
   return S0.call(this, k, v);
  };
  lg('wiped ' + ks.length + ' progress keys');
  return ks.length;
 }
 V.wipeProgress = wipeProgress;
 async function run() {
  if (V.busy) return;
  const V23 = W0.V23;
  V.busy = true;
  setMsg('SAVING TO YOUR ACCOUNT...');
  let c = { ok: false, why: '?' };
  try { c = await cloudConfirmed(); } catch (e) { c = { ok: false, why: 'err ' + (e && e.message || e) }; }
  lg('confirm ' + (c.ok ? 'ok ' + c.how : 'NO ' + c.why));
  V.last = c;
  try { await V23.signOut(); } catch (e) { lg('signOut err ' + e); }
  if (!c.ok) { V.busy = false; return; }  // could not confirm the cloud copy: nothing is cleared (old behaviour)
  const n = wipeProgress();
  setMsg('SIGNED OUT - YOUR SAVE IS SAFE IN YOUR ACCOUNT. SIGN IN TO GET IT BACK');
  if (!W0.__rl447noReload) setTimeout(() => { try { location.reload(); } catch (e) {} }, 900);
  V.busy = false;
  return n;
 }
 V.run = run;
 document.addEventListener('click', e => {
  if (off() || !W0.V23 || !W0.V23.signedIn || !W0.V23.signedIn()) return;
  const t = e.target && e.target.closest ? e.target.closest('#b23out') : null;
  if (!t) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
  run();
 }, true);
})();
