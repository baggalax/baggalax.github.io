(function() {
 'use strict';
 const off = () => !!(window.__rl_no38h || window.__rl_v124gb);
 const V = window.V38H = {
  log: []
 };
 V.on = () => !off() && !!window.V17;
 const clipsOn = () => !off() && !!window.V35 && V35.clipOn && V35.clipOn();
 V.noPauseClips = () => clipsOn();
 const home = () => !!(window.M37 && M37.page === 'home');
 let LAST = [];
 V.rects = () => LAST.slice();
 function big(key, lab, sub, x, y, w, h, fn, bg, live, badge) {
  if (live) hit(key, x, y, w, h, fn, lab);
  rect(x, y + 2, w, h, '#000');
  rect(x, y, w, h, bg);
  rect(x, y, w, 1, 'rgba(255,255,255,.45)');
  rect(x, y + h - 1, w, 1, 'rgba(0,0,0,.25)');
  const ly = sub ? y + Math.round(h / 2) - 6 : y + Math.round((h - 5) / 2);
  text(lab, x + w / 2, ly, 1, '#0b1a20', 'center');
  if (sub) textMini(sub, x + w / 2, ly + 8, '#0b1a20');
  if (badge) {
   const bw = Math.max(7, textW(badge) + 4), bx = x + w - bw - 1, b = Math.floor((typeof menuT !== 'undefined' ? menuT : 0) * 3) % 2;
   rect(bx, y - 3, bw, 8, badge === '!' ? b ? '#ff3b3b' : '#ffe14d' : '#05080b');
   text(badge, bx + bw / 2, y - 2, 1, badge === '!' ? '#fff' : '#ffe14d', 'center');
  }
  LAST.push({
   key: key,
   lab: lab,
   x: x,
   y: y,
   w: w,
   h: h
  });
 }
 V.drawLeft = function(L, live) {
  LAST = [];
  const ST = V17.ST(), PASS = V17.PASS || [];
  const lv = Math.min(PASS.length, ST.pass.stars || 0), pReady = !ST.pass.owned ? lv > 0 : (ST.pass.got || 0) < lv;
  let left = 0;
  try {
   left = V17.chalSync().filter(c => !ST.wk.done[c.id]).length;
  } catch (e) {}
  let free = false;
  try {
   free = V17.dailyReady() || V17.stickReady();
  } catch (e) {}
  try {
   lobby.passLv = lv;
   lobby.passReady = pReady;
   lobby.passNotch = lv >= PASS.length ? 5 : (ST.pass.notch || 0) % 5;
  } catch (e) {}
  const B = [];
  if (home() && clipsOn()) B.push([ 'CLIPS', 'CLIPS', 'YOUR SAVED PLAYS', () => V.openClips(), '#ff9a3d', null ]);
  B.push([ 'SHOP', 'STRING SHOP', 'CARD PACKS + GEAR', () => V17.openShop(), '#7dff7a', free ? '!' : null ]);
  B.push([ 'LOCKER ROOM', 'LOCKER ROOM', 'YOUR CARDS + GEAR', () => V17.openLocker(), '#8fe3f0', null ]);
  B.push([ 'PASS', 'PASS', 'LV ' + lv + '/' + PASS.length, () => V17.openPass(), '#ffcc33', pReady ? '!' : null ]);
  B.push([ 'WEEKLY', 'WEEKLY', 'CHALLENGES', () => V17.openChal(), '#b9a8ff', left ? String(left) : null ]);
  B.push([ 'TEAM CREW', 'TEAM CREW', 'YOUR STAFF', () => V17.openCrew(), '#ff9a4a', null ]);
  if (!window.__rl_no2402) B.push([ 'CHIRP LOADOUT', 'CHIRP LOADOUT', 'TRASH TALK', () => V17.openCload(), '#ff9a4a', null ]);
  if (window.ED31 && !window.__rl_no32ed) B.push([ 'EDIT NAMES', 'EDIT NAMES', 'TEAMS + PLAYERS', () => ED31.open(), '#b9a8ff', null ]);
  const cols = 2, gap = 6, mx = 8, top = 22, rows = Math.ceil(B.length / cols);
  const w = Math.floor((L - mx * 2 - gap * (cols - 1)) / cols), h = rows > 3 ? 25 : 28, vg = rows > 3 ? 6 : 8;
  B.forEach((b, i) => {
   const c = i % cols, r = Math.floor(i / cols), wide = i === B.length - 1 && c === 0;
   big(b[0], b[1], b[2], mx + c * (w + gap), top + r * (h + vg), wide ? w * 2 + gap : w, h, b[3], b[4], live, b[5]);
  });
  const m = home() ? 'TAP PLAY TO PICK A MODE' : 'PICK A MODE TO SEE YOUR TEAM', hy = top + rows * (h + vg) + 2;
  rect(Math.round(L / 2 - textW(m, 1) / 2 - 4), hy, textW(m, 1) + 8, 10, 'rgba(5,8,11,.7)');
  text(m, L / 2, hy + 2, 1, '#8fe3f0', 'center');
 };
 const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
 }[c]));
 function fmtDate(t) {
  const d = new Date(t), mo = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ][d.getMonth()];
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return mo + ' ' + d.getDate() + ' ' + h + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + ap;
 }
 function clipLine(m) {
  return (m.ua || '?') + ' ' + ((m.sc || [])[0] || 0) + ' - ' + ((m.sc || [])[1] || 0) + ' ' + (m.oa || '?') + ' | ' + (m.moment || 'PLAY') + (m.online ? ' | ONLINE' : '') + ' | ' + fmtDate(m.at || Date.now());
 }
 function render() {
  const L = V35.listNow() || [], DB = V35.DB || {}, LK = V35.LK || {}, kb = Math.round((DB.bytes || 0) / 1024), MAXC = V35.MAXC;
  const hd = '<div class="hd"><div><div class="tt">CLIPS</div><div class="st">YOUR SAVED PLAYS - TAP CLIP (TOP BAR) IN ANY GAME TO SAVE THE LAST PLAY</div></div><div class="sp"></div>' + '<button type="button" data-a="v38cback" class="g" aria-label="BACK">BACK</button></div>';
  const det = '<div class="det17" id="clip38det"><b>CLIPS</b> ' + L.length + ' / ' + MAXC + (L.length ? ' - ' + (kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB') : '') + '. ' + MAXC + ' MAX - A NEW ONE REPLACES THE OLDEST.</div>';
  let b = '';
  if (!L.length) b = '<div class="cf" id="clip38none" style="padding:10px 4px;color:#8fe3f0">' + (DB.list ? 'NO CLIPS YET - TAP CLIP (TOP BAR, NEXT TO THE SCORE) IN A GAME' : 'LOADING...') + '</div>';
  const delOn = !!(V35.delOn && V35.delOn());
  for (const m of L) {
   const sure = LK.del === m.id;
   b += '<div class="row" data-clip="' + escH(m.id) + '" style="display:flex;align-items:center;gap:6px;padding:3px 2px;border-bottom:1px solid #22313d;flex-wrap:nowrap">' + '<span class="note" style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escH(clipLine(m)) + ' | ' + Math.max(1, Math.round((m.size || 0) / 1024)) + ' KB</span>' + '<button type="button" data-a="v35clip" data-v="play:' + escH(m.id) + '" class="y" style="min-height:40px;min-width:54px">PLAY</button>' + '<button type="button" data-a="v35clip" data-v="vid:' + escH(m.id) + '" style="min-height:40px;min-width:54px">VIDEO</button>' + '<button type="button" data-a="v35clip" data-v="' + (sure ? 'delok:' : 'del:') + escH(m.id) + '" style="min-height:40px;min-width:54px;' + (sure ? 'background:#ff5a4a;color:#fff' : delOn ? 'background:#4a1414;color:#ff9a8a;box-shadow:inset 0 0 0 2px #ff5a4a' : '') + '">' + (sure ? 'SURE?' : 'DELETE') + '</button></div>';
  }
  return hd + det + '<div class="scroll" id="clip38List">' + b + '</div>';
 }
 V.openClips = function() {
  if (!clipsOn()) return;
  try {
   V35.LK.del = null;
   V35.LK.on = false;
  } catch (e) {}
  try {
   const p = V35.DB.list ? null : V35.DB.loading || V35.loadList();
   if (p && p.then) p.then(() => {
    try {
     panelDirty();
    } catch (e) {}
   }, () => {});
  } catch (e) {}
  screen = 'clips38';
  try {
   panelDirty();
  } catch (e) {}
  V.log.push('clips ' + Date.now());
 };
 function install() {
  if (typeof PANEL_RENDER === 'undefined' || typeof PANEL_ACT === 'undefined' || typeof PANEL_SCREENS === 'undefined') return false;
  if (!PANEL_SCREENS.includes('clips38')) PANEL_SCREENS.push('clips38');
  PANEL_RENDER.clips38 = function() {
   try {
    return render();
   } catch (e) {
    console.error(e);
    return '<div class="hd"><div class="tt">CLIPS</div><div class="sp"></div><button type="button" data-a="v38cback" class="g">BACK</button></div>';
   }
  };
  PANEL_ACT.v38cback = () => {
   try {
    V35.LK.del = null;
   } catch (e) {}
   screen = 'menu';
  };
  const R0 = PANEL_RENDER.locker17;
  if (R0 && !R0.__v38) {
   const R1 = function() {
    if (!clipsOn()) return R0.apply(this, arguments);
    try {
     V35.LK.on = false;
    } catch (e) {}
    const h = R0.apply(this, arguments);
    return String(h).replace(/<button type="button" data-a="v35clip" data-v="tab"[^>]*>CLIPS<\/button>/g, '');
   };
   R1.__v38 = true;
   R1.__v35 = R0.__v35;
   PANEL_RENDER.locker17 = R1;
  }
  return true;
 }
 V.install = install;
 if (!off()) install();
})();
