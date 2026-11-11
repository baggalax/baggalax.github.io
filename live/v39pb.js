(function() {
 const DP = window.drawPlaybookBtn;
 if (typeof DP !== 'function') return;
 const off = () => !!(window.__rl_no39pb || window.__rl_v124gb);
 const PBW = 46, TOPY = 2, TOPH = 13, BOTH = 11, GAP = 3, MINW = 36;
 let prev = [], prevKey = '', last = null;
 const sk = () => {
  try {
   return screenKey();
  } catch (e) {
   return '';
  }
 };
 function specs() {
  const k = sk() + '|', out = [];
  for (const s of typeof uiSpecs !== 'undefined' && uiSpecs || []) if (s && s.key && s.key.startsWith(k) && s.label !== 'PLAYBOOK') out.push(s);
  if (prevKey === k) for (const s of prev) if (s.h <= 20 && s.w <= W / 2 && !out.some(o => o.key === s.key)) out.push(s);
  if (!out.some(s => s.label === 'CHIRP') && game && (!game.tutorial || game.tutorial.step === (typeof TUT_CHIRP_STEP !== 'undefined' ? TUT_CHIRP_STEP : -1))) {
   const w = typeof CHIRP_BTN !== 'undefined' ? CHIRP_BTN.w : 32;
   out.push({
    label: 'CHIRP',
    key: k + 'CHIRP~',
    x: Math.round(W / 2 - 12 - w),
    y: H - 11,
    w: w,
    h: 11
   });
  }
  return out;
 }
 const tw = s => textW(s, 1);
 function topSpot(S) {
  const G = game, cx = W / 2, bw = 92;
  const row1 = G.brave ? 'BRAVEHEART' : perLabel(G) + ' ' + (G.ot ? 'SUDDEN' : fmtClock(G.clock));
  const half = Math.ceil(Math.max(tw(row1), tw('SHOT :00')) / 2), worst = Math.max(half, Math.ceil(tw('BRAVEHEART') / 2));
  let lx0 = bw + 2, rx1 = Math.min(W - 1 - bw - 2, W - 92 - 1 - 4 - 22 - 1);
  for (const s of S) {
   if (s.y > 15 || s.y + s.h < 2 || s.h > 20) continue;
   if (s.x + s.w <= cx - half) lx0 = Math.max(lx0, s.x + s.w); else if (s.x >= cx + half) rx1 = Math.min(rx1, s.x);
  }
  const Lw = cx - half - 2 - (lx0 + 2), lvMin = 4 * 4 * Math.max(1, Math.round(.65 * RR)) / RR - Math.max(1, Math.round(.65 * RR)) / RR;
  if (!window.__rl_no39ht && !window.__rl_no39b && !G.tutorial && Lw < lvMin) return null;
  const x = rx1 - GAP - PBW;
  if (x < cx + worst + 4) return null;
  return {
   m: 'top',
   x: x,
   y: TOPY,
   w: PBW,
   h: TOPH
  };
 }
 const clear = (S, x, y, w, h) => x >= 13 && x + w <= W - 13 && !S.some(s => x < s.x + s.w + 2 && x + w + 2 > s.x && y < s.y + s.h + 1 && y + h + 1 > s.y);
 function botSpot(S) {
  const y = H - BOTH - sa2403Dy(H - BOTH, BOTH), cx = W / 2;
  const cornerX = W - 44 - 3;
  let r = -1;
  for (const s of S) if (s.label !== 'CHIRP' && s.label !== 'TUT' && s.label !== 'NET' && s.y + s.h > y - 2 && s.y < H && s.x + s.w <= cornerX - 1 && s.x + s.w > cx - 60 && s.h <= 20 && s.w <= W / 2) r = Math.max(r, s.x + s.w);
  if (r >= 0) {
   const x = r + GAP, w = Math.min(PBW, cornerX - GAP - x);
   if (w >= MINW && clear(S, x, y, w, BOTH)) return {
    m: 'bot',
    x: x,
    y: y,
    w: w,
    h: BOTH
   };
  }
  const ch = S.find(s => s.label === 'CHIRP'), chx = ch ? ch.x : Math.round(cx - 12 - (typeof CHIRP_BTN !== 'undefined' ? CHIRP_BTN.w : 32));
  for (const w of [ PBW, 40, MINW ]) {
   const x = chx - GAP - w;
   if (clear(S, x, y, w, BOTH)) return {
    m: 'botL',
    x: x,
    y: y,
    w: w,
    h: BOTH
   };
  }
  return null;
 }
 function spot() {
  const S = specs();
  if (game && game.tutorial) {
   let s231 = true;
   try {
    s231 = s231on();
   } catch (e) {}
   S.push(s231 ? {
    label: 'TUT',
    x: 0,
    y: H - 30,
    w: 64,
    h: 30
   } : {
    label: 'TUT',
    x: 0,
    y: H - 14,
    w: 160,
    h: 14
   });
  }
  try {
   if (game && (game.online || game.meta && game.meta.online)) S.push({
    label: 'NET',
    x: W - 62,
    y: H - 23,
    w: 62,
    h: 13
   });
  } catch (e) {}
  return topSpot(S) || botSpot(S);
 }
 const TXM = window.textMini;
 function fitName(s, w) {
  s = String(s || '').toUpperCase();
  const c = Math.max(1, Math.round(.65 * RR)) / RR, adv = 4 * c;
  let n = Math.floor((w - 3 + c) / adv);
  return n >= s.length ? s : s.slice(0, Math.max(1, n));
 }
 let tutRow = null;
 try {
  tutRow = TUT.find(r => r && r[0] === 'PLAYBOOK' && /TOP LEFT/.test(r[1]));
 } catch (e) {}
 const tut0 = tutRow ? tutRow[1] : null;
 function setTut(m) {
  if (!tutRow) return;
  tutRow[1] = !m ? tut0 : m === 'top' ? 'TAP PLAYBOOK (TOP BAR, BY THE CLOCK), PICK YOUR PLAY. THEN PICK NO PLAYS.' : 'TAP PLAYBOOK (BOTTOM, NEXT TO THE BUTTONS), PICK YOUR PLAY. THEN PICK NO PLAYS.';
  if (textW(tutRow[1]) > W - 16) tutRow[1] = m === 'top' ? 'TAP PLAYBOOK (TOP BAR), PICK YOUR PLAY. THEN NO PLAYS.' : 'TAP PLAYBOOK (BOTTOM ROW), PICK YOUR PLAY. THEN NO PLAYS.';
 }
 try {
  const PS = PANEL_RENDER.pmSave;
  if (typeof PS === 'function') PANEL_RENDER.pmSave = function() {
   const h = PS.apply(this, arguments);
   if (off()) return h;
   const m = last || (W >= 360 ? 'top' : 'bot');
   return h.replace('(TOP LEFT ON OFFENSE)', m === 'top' ? '(ON OFFENSE, TOP BAR NEXT TO THE CLOCK)' : '(ON OFFENSE, BOTTOM ROW NEXT TO THE BUTTONS)');
  };
 } catch (e) {}
 window.drawPlaybookBtn = function() {
  if (off()) {
   setTut(null);
   window.V39PB.lastRect = null;
   return DP.apply(this, arguments);
  }
  const G = game;
  if (!G || screen !== 'live') return;
  if (G.tutorial && !(G.tutorial.step >= TUT_PB_STEP)) return;
  let p = null;
  try {
   p = spot();
  } catch (e) {
   console.error(e);
  }
  if (!p) {
   setTut(null);
   window.V39PB.lastRect = null;
   window.V39PB.mode = 'v38';
   return DP.apply(this, arguments);
  }
  last = p.m;
  setTut(p.m);
  const on = !!G.playSel, {x: x, y: y, w: w, h: h} = p;
  hit('PLAYBOOK', x, y, w, h, () => {
   screen = 'playbook';
   panelDirty();
  }, 'PLAYBOOK');
  rect(x, y + 1, w, h, '#000');
  rect(x, y, w, h, on ? '#ffe14d' : 'rgba(30,40,50,.92)');
  rect(x, y, w, 1, on ? '#fff3a8' : '#3a4c5a');
  const pl = on ? playById(G.playSel) : null;
  if (pl && TXM) {
   text('PLAYBOOK', x + w / 2, y + 1, 1, '#0b1a20', 'center');
   const c = Math.max(1, Math.round(.65 * RR)) / RR, nm = fitName(pl.name, w);
   TXM(nm, x + w / 2, y + h - 1 - 5 * c, '#5a3d00');
  } else text('PLAYBOOK', x + w / 2, y + Math.floor((h - 5) / 2), 1, on ? '#0b1a20' : '#cfe', 'center');
  window.V39PB.lastRect = [ x, y, w, h + 1 ];
  window.V39PB.mode = p.m;
 };
 const RD = window.render;
 if (typeof RD === 'function') window.render = function() {
  const r = RD.apply(this, arguments);
  try {
   prevKey = sk() + '|';
   prev = (typeof uiSpecs !== 'undefined' && uiSpecs || []).filter(s => s && s.key && s.key.startsWith(prevKey) && s.label !== 'PLAYBOOK');
  } catch (e) {}
  return r;
 };
 window.V39PB = {
  lastRect: null,
  mode: null,
  spot: () => {
   try {
    return spot();
   } catch (e) {
    return null;
   }
  }
 };
})();
