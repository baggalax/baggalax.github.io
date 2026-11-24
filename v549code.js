// ===== BAGGA LAX v549code.js - ONE-TIME SERVER CODES (e.g. a free CYCLONE stick) =====
// The game's own REDEEM CODE button (GAME SETTINGS, top left, v20.js) only knew codes baked into the client
// (USAGOLD, PLANES, JARVISKIT) and remembered them per device. This file adds server-checked codes on the same button:
//  - a typed code that is not one of those local codes is sent to POST /api/code549/redeem {dev, code};
//  - the server marks the code used ONCE IN TOTAL (all players), so a second player gets "CODE ALREADY USED";
//  - the item is granted only when the server says ok, and a save flag (V17 save: c549) stops a double grant on this device;
//  - a lost reply is safe: the same device asking again gets ok:again and is granted only if its flag is missing.
// Works on the website and in the app (v41ios.js already sends /api calls to the real server there).
// No old file edited. Ids, rl_* keys, existing saves and the net protocol unchanged. Off: window.__rl_no549cd.
(function () {
 'use strict';
 const W = window;
 if (W.__rl_no549cd || W.__rl_v124gb) return;
 const LOCAL = new Set([ 'USAGOLD', 'PLANES', 'JARVISKIT' ]);
 const norm = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
 const L = W.V549CD = { log: [], busy: false, last: null };
 const lg = m => {
  L.log.push(Date.now() % 1e7 + ' ' + m);
  if (L.log.length > 30) L.log.shift();
 };
 const say = (s, col) => {
  try { menuMsg = { s: s, t: 2.6 }; } catch (e) {}
  try { if (W.V17 && V17.toast) V17.toast(s, col || '#ffe14d'); } catch (e) {}
 };
 const sfx = k => { try { if (W.SFX && SFX[k]) SFX[k](); } catch (e) {} };
 const devId = () => {
  try { if (W.RLNET && RLNET.dev) return String(RLNET.dev); } catch (e) {}
  try { return String(localStorage.getItem('rl_dev') || '').replace(/^"|"$/g, ''); } catch (e) { return ''; }
 };
 const flags = () => {
  const ST = V17.ST();
  if (!ST.c549 || typeof ST.c549 !== 'object' || Array.isArray(ST.c549)) ST.c549 = {};
  return ST.c549;
 };
 const ITEM_NAME = id => {
  try { const b = V17.BY && V17.BY[id]; if (b && b.n) return String(b.n).toUpperCase(); } catch (e) {}
  return 'ITEM';
 };
 async function post(code) {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const tm = setTimeout(() => { try { ctl && ctl.abort(); } catch (e) {} }, 9000);
  try {
   const r = await fetch('/api/code549/redeem', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dev: devId(), code: code }),
    signal: ctl ? ctl.signal : undefined
   });
   let j = null;
   try { j = await r.json(); } catch (e) { j = null; }
   return j && typeof j === 'object' ? j : { ok: false, why: 'net', status: r.status };
  } catch (e) {
   return { ok: false, why: 'net' };
  } finally {
   clearTimeout(tm);
  }
 }
 function grant(j, c) {
  const F = flags(), rid = String(j.rid || c).slice(0, 16);
  if (F[rid]) {
   say('YOU ALREADY GOT THIS ONE ON THIS DEVICE');
   return { ok: false, why: 'mine' };
  }
  const dm = Math.floor(+j.dimes || 0);
  if (dm > 0 && dm <= 500 && !j.item && V17.addChinos) { // v1.3: a dimes code (BAGGALAX = 200), still one use in total on the server
   F[rid] = { c: c, dimes: dm, t: Date.now() };
   V17.addChinos(dm, 'CODE');
   try { V17.save && V17.save(); } catch (e) { console.error(e); }
   try { if (W.V23 && V23.put && V23.signedIn && V23.signedIn()) setTimeout(() => { try { V23.put(false, 'code549'); } catch (e) {} }, 400); } catch (e) {}
   sfx('cheer'); say(dm + ' DIMES ADDED!', '#7dff7a');
   return { ok: true, dimes: dm };
  }
  const id = String(j.item || ''), n = Math.max(1, Math.min(5, +j.n || 1));
  if (!V17.BY || !V17.BY[id]) {
   say('UPDATE THE GAME TO USE THIS CODE');
   return { ok: false, why: 'item' };
  }
  F[rid] = { c: c, item: id, n: n, t: Date.now() };
  V17.grant(id, n);
  try { V17.save && V17.save(); } catch (e) { console.error(e); }
  try { if (W.V23 && V23.put && V23.signedIn && V23.signedIn()) setTimeout(() => { try { V23.put(false, 'code549'); } catch (e) {} }, 400); } catch (e) {}
  const nm = j.name || ITEM_NAME(id) + (V17.BY[id].slot === 'stick' && !/STICK/.test(ITEM_NAME(id)) ? ' STICK' : '');
  sfx('cheer');
  say(nm + ' ADDED - CHECK YOUR LOCKER!', '#7dff7a');
  lg('granted ' + id + ' x' + n + ' rid ' + rid);
  return { ok: true, item: id, n: n };
 }
 async function redeem(raw) {
  const c = norm(raw);
  if (!c) return null;
  if (L.busy) { say('CHECKING CODE...'); return null; }
  if (!W.V17 || !V17.ST || !V17.grant) { say('TRY AGAIN IN A SEC'); return null; }
  const F = flags();
  for (const k in F) if (F[k] && F[k].c === c) {
   say('YOU ALREADY REDEEMED THIS CODE');
   sfx('bad');
   return (L.last = { ok: false, why: 'mine' });
  }
  if (!devId()) { say('TRY AGAIN IN A SEC'); return null; }
  L.busy = true;
  say('CHECKING CODE...', '#cfe');
  let j;
  try { j = await post(c); } finally { L.busy = false; }
  lg('srv ' + JSON.stringify(j).slice(0, 120));
  let out;
  if (j.ok) out = grant(j, c);
  else {
   out = { ok: false, why: j.why || 'bad' };
   if (j.why === 'used') say('CODE ALREADY USED', '#ff7a7a');
   else if (j.why === 'slow') say('TOO MANY TRIES - WAIT A FEW MINUTES', '#ff7a7a');
   else if (j.why === 'net') say('NO CONNECTION - TRY AGAIN', '#ff7a7a');
   else say('INVALID CODE', '#ff7a7a');
   sfx('bad');
  }
  L.last = out;
  return out;
 }
 L.redeem = redeem;
 // 1) The REDEEM CODE button asks window.prompt('REDEEM CODE'): local codes go on to v20 as before, anything else goes to the server.
 const P0 = W.prompt;
 if (typeof P0 === 'function' && !P0.__rl549) {
  const P1 = function (msg, def) {
   const v = P0.apply(this === W || this == null ? W : this, arguments);
   try {
    if (msg === 'REDEEM CODE' && v != null) {
     const c = norm(v);
     if (c && W.RL562 && RL562.take(c)) return '';
     if (c && !LOCAL.has(c)) {
      redeem(c).catch(e => console.error(e));
      return '';
     }
    }
   } catch (e) { console.error(e); }
   return v;
  };
  P1.__rl549 = true;
  W.prompt = P1;
 }
 // 2) Anything calling V20.redeem20(code) directly gets the same routing.
 let tries = 0;
 (function hook() {
  if (W.V20 && typeof V20.redeem20 === 'function') {
   if (!V20.redeem20.__rl549) {
    const R0 = V20.redeem20;
    const R1 = function (code) {
     if (code != null) {
      const c = norm(code);
      if (c && W.RL562 && RL562.take(c)) return null;
      if (c && !LOCAL.has(c)) { redeem(c).catch(e => console.error(e)); return null; }
     }
     return R0.apply(this, arguments);
    };
    R1.__rl549 = true;
    V20.redeem20 = R1;
   }
   return;
  }
  if (++tries < 40) setTimeout(hook, 250);
 })();
})();
