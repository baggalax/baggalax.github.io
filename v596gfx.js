/* v596gfx.js - Bagga Lax 1.5c: Jonny's graphics audit fixes (TestFlight 3 round)
 * HIGH 3  Pause button: the 14x8 plate was see-through, so the ad board's left-end art showed through and around it.
 *         Now a solid new-style button over its whole tap box (V463PZ.draw replaced; box + tap area unchanged).
 * HIGH 4  Account gate: PLAY OFFLINE FOR NOW was below the fold with no hint -> pinned to the bottom of the gate (sticky).
 *         Popups (CREASE FAKES, NEW IN THE YARD SALE, VETERANS DAY, title bowl) stacked on top of the gate and each other ->
 *         none show while the gate is open; after that ONE at a time (the next appears when the current one closes).
 * MED     Old-style DOM buttons get the new style (Yard Sale / Locker / Pass / Weekly / Crew / Chirp panel buttons + tabs,
 *         Edit Names, College / Ultimate screens); +DIMES / BUY 50 no longer wrap; popups use the game's mono font (buttons
 *         didn't inherit it -> Times New Roman); College / Ultimate locked screens get themed background art;
 *         the LIVE-OPS debug badge only shows with ?livedebug=1.
 * LOW     Uniform picker tiles use the mono game font.
 * Kill switch: window.__rl_no596gfx
 */
(function () {
 const Wn = window, off = () => !!Wn.__rl_no596gfx;
 if (off()) return;
 // ---------- LIVE-OPS debug badge: debug only ----------
 try { if (!/[?&]livedebug=1/.test(location.search)) Wn.__rl_noLiveBadge = true; } catch (e) {}
 // ---------- HIGH 3: pause button ----------
 try {
  if (Wn.V463PZ) Wn.V463PZ.draw = function (b) {
   if (off()) { rect(b.ix, b.iy, 14, 8, 'rgba(0,0,0,.55)'); rect(b.ix + 4, b.iy + 1, 2, 6, '#fff'); rect(b.ix + 8, b.iy + 1, 2, 6, '#fff'); return; }
   const x = b.x + 1, y = b.y + 1, w = b.w - 2, h = b.h - 2;
   rect(x - 1, y - 1, w + 2, h + 3, '#000'); rect(x, y, w, h, '#1d2a35'); rect(x, y, w, 1, 'rgba(255,255,255,.35)'); rect(x, y + h - 2, w, 2, 'rgba(0,0,0,.35)');
   const cx = Math.round(x + w / 2); rect(cx - 4, y + 3, 3, h - 6, '#ffffff'); rect(cx + 1, y + 3, 3, h - 6, '#ffffff');
  };
 } catch (e) {}
 // ---------- CSS ----------
 const MONO = 'ui-monospace,Menlo,Consolas,monospace';
 const NEWBTN = 'border:2px solid #0b1a20!important;border-radius:0!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.45),inset 0 -3px 0 rgba(0,0,0,.25),0 3px 0 #000!important;white-space:nowrap!important';
 const css = document.createElement('style'); css.id = 'v596css';
 css.textContent = [
  // panel buttons (+DIMES, BACK, tabs) on every panel screen; cards / tiles keep their own look
  '#panel button:not(.c17):not(.uni17):not([class*="art"]){' + NEWBTN + '}',
  '#panel .iap41open,#panel [data-a="iap41"]{white-space:nowrap!important}',
  '#ed31 button{' + NEWBTN + ';font-family:' + MONO + '!important}',
  '#col25 button{' + NEWBTN + '}',
  '#col25{background:repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 2px,transparent 2px 24px),repeating-linear-gradient(0deg,#0b1118 0 28px,#0e1720 28px 56px)!important}',
  '#col25::before{content:"";position:fixed;left:50%;top:50%;width:min(60vw,60vh);height:min(60vw,60vh);transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,154,61,.12) 0 40%,transparent 41%),repeating-linear-gradient(45deg,rgba(255,225,77,.05) 0 6px,transparent 6px 12px);pointer-events:none;z-index:-1}',
  '#tut507card,#tut507card *,#vets489pop,#vets489pop *,#tb570pop,#tb570pop *,#tut26card,#tut26card *{font-family:' + MONO + '!important}',
  '#tut507card button,#vets489pop button,#tb570pop button,#tut26card button{' + NEWBTN + '}',
  '#rk15pick,#rk15pick *{font-family:' + MONO + '!important}',
  '#acct23 #a37foot{position:sticky;bottom:0;z-index:2;background:linear-gradient(transparent,#0b1118 30%);padding:10px 0 max(6px,env(safe-area-inset-bottom));margin-top:6px}',
  '#acct23 #a37skip{' + NEWBTN + '}',
  '.q596{visibility:hidden!important;pointer-events:none!important}',
  // Pass: the gem icon had negative margins and squeezed the LETTY text
  'img.v40lic{margin:0 .3em 0 .2em!important}', '.notch18 img.v40lic{margin-right:3px!important}',
  // Yard Sale: STICK PACK title keeps its room (the NEXT IN chip wraps below), small tile names shrink to fit
  '.s6free .s6fx{min-width:84px!important}', '.s6free button{white-space:nowrap!important}',
  '.s6tht img.s6px,.s6ix img.s6px{max-width:100%!important;height:auto!important;image-rendering:pixelated}'
 ].join('\n');
 document.head.appendChild(css);
 // ---------- HIGH 4: popup queue ----------
 const POPS = ['shop26', 'tut26card', 'tut507card', 'vets489pop', 'tb570pop']; // QA6: + NEW IN THE YARD SALE (it peeked out under the Veterans popup)
 const shown = el => { if (!el || !el.isConnected) return false; const s = getComputedStyle(el); return s.display !== 'none'; };
 setInterval(() => {
  try {
   if (Wn.__rl_597pops) return; // v597ui runs the queue now
   if (off()) { POPS.forEach(id => { const e = document.getElementById(id); if (e) e.classList.remove('q596'); }); return; }
   const gate = shown(document.getElementById('acct23'));
   let first = true;
   for (const id of POPS) {
    const e = document.getElementById(id); if (!shown(e)) continue;
    if (!gate && first) { e.classList.remove('q596'); first = false; } else e.classList.add('q596');
   }
  } catch (e) {}
 }, 200);
 // ---------- MED: pregame team labels stay readable over the big hero sticks (labels re-drawn on top) ----------
 const dp0 = Wn.drawPregame;
 if (typeof dp0 === 'function') Wn.drawPregame = function () {
  if (off() || typeof Wn.text !== 'function') return dp0.apply(this, arguments);
  const t0 = Wn.text, rec = [];
  Wn.text = function (s, x, y) { if (W < 360 && /^(CLICK|TAP) START/.test(String(s))) return; /* narrow phones: the hint ran into the stat plates - START says it */ if (typeof y === 'number' && y < 40) rec.push(arguments); return t0.apply(this, arguments); };
  let r; try { r = dp0.apply(this, arguments); } finally { Wn.text = t0; }
  try { for (const a of rec) t0.apply(null, a); } catch (e) {}
  return r;
 };
 // CREASE FAKES TAP / CLICK wording: v521tutfake already picks it from the input actually used (TAP on phones) - nothing here.
 // LOW (profile hero badge blur): v590stick tags lobbyBake canvases with the uni id so the crisp chest art can go over big
 // heroes, but v590fix's braid path returns lobbyBake0 straight (untagged) and load order can put the tag under other wraps.
 // Re-tag here, outermost, on both. Kill switch: window.__rl_no596tag
 // 1.5d (Charlie device shot): the black plate band at the top of every lobby (team name + uni name with arrows) covered the
 // top of the big player's stick head. After each frame the head is drawn again, clipped to that band only.
 try { const rd0 = Wn.render; if (typeof rd0 === 'function' && !rd0.__h597) { const rd = function () { const r = rd0.apply(this, arguments); try { if (!Wn.__rl_no597band && Wn.STICK590 && STICK590.heroOver && Wn.UNI21 && UNI21.__band597 && !(typeof lobby !== 'undefined' && lobby && lobby.card)) STICK590.heroOver(UNI21.__band597); /* QA6: never over a STATS / card popup */ } catch (e) {} return r; }; rd.__h597 = 1; Wn.render = rd; } } catch (e) {}
 const tagK = fn => function (name, kit) { const c = fn.apply(this, arguments); try { if (!Wn.__rl_no596tag && c && typeof c === 'object' && kit && kit.rk15) c.__rk15k = kit.rk15; if (c && typeof c === 'object' && typeof name === 'string') { if (!c.__f597) c.__f597 = name; if (!c.__lb597) c.__lb597 = { name: name, kit: kit, skin: arguments[2], gray: arguments[3], flip: arguments[4] }; } } catch (e) {} return c; };
 try { const bgT = fn => function (name, kit, flip, skin, gr, gray, o) { const c = fn.apply(this, arguments); try { if (c && typeof c === 'object' && typeof name === 'string') { c.__f597 = name; c.__bg597 = { name: name, kit: kit, flip: flip, skin: skin, gray: gray, o: o }; } } catch (e) {} return c; }; if (Wn.V17 && V17.bakeGear && !V17.bakeGear.__t597) { const f = bgT(V17.bakeGear); f.__t597 = 1; V17.bakeGear = f; } if (Wn.RL12 && RL12.bake && !RL12.bake.__t597) { const b0 = RL12.bake; const f = function (name) { const c = b0.apply(this, arguments); try { if (c && typeof c === 'object' && typeof name === 'string') c.__f597 = name; } catch (e) {} return c; }; f.__t597 = 1; RL12.bake = f; } } catch (e) {}
 try { ['lobbyBake', 'lobbyBake0'].forEach(n => { if (typeof Wn[n] === 'function' && !Wn[n].__t596b) { const f = tagK(Wn[n]); f.__t596b = 1; Wn[n] = f; } }); } catch (e) {}
})();
