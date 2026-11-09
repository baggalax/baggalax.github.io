'use strict';

const V35ST = (() => {
 const off = () => !!window.__rl_v124gb || !!window.__rl_no35stad;
 const LOG = {
  scroll: 0,
  neutral: 0,
  hell: 0,
  errs: []
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 30) LOG.errs.shift();
  } catch (x) {}
 };
 const HELL_FIELD = {
  '#3a1410': '#8a3a26',
  '#421814': '#94422c'
 };
 const HELL_CREASE = {
  from: '#4fb050',
  to: '#c4643a'
 };
 const HELL_BALL = {
  c: '#ffffff',
  o: '#000000',
  g: 'rgba(255,255,255,.45)'
 };
 const NEUTRAL = new Set([ 'moon', 'hell', 'beach', 'under', 'cloud', 'gho' ]);
 function scrollerOf(t, root) {
  for (let e = t; e && e !== root && e.nodeType === 1; e = e.parentElement) {
   const oy = getComputedStyle(e).overflowY;
   if ((oy === 'auto' || oy === 'scroll') && e.scrollHeight > e.clientHeight + 1) return e;
  }
  return null;
 }
 function onMove(e) {
  if (off()) return;
  try {
   const t = e.target;
   if (!t || !t.closest || t.closest('#ui')) return;
   const ov = t.closest('body > div');
   if (!ov || ov.id === 'stage') return;
   if (!scrollerOf(t, ov.parentElement)) return;
   e.stopPropagation();
   LOG.scroll++;
  } catch (x) {
   err(x, 'move');
  }
 }
 function hookBody() {
  if (document.body) document.body.addEventListener('touchmove', onMove, {
   passive: true
  }); else document.addEventListener('DOMContentLoaded', hookBody, {
   once: true
  });
 }
 hookBody();
 try {
  const st = document.createElement('style');
  st.textContent = '#st28 > div > div[style*="overflow-y"]{overscroll-behavior:contain}';
  document.head.appendChild(st);
 } catch (e) {
  err(e, 'css');
 }
 const stNow = () => {
  try {
   return window.V28 && V28.stNow ? V28.stNow() : null;
  } catch (e) {
   return null;
  }
 };
 const G0 = () => typeof game !== 'undefined' ? game : null;
 function neutralK() {
  if (off()) return null;
  const k = stNow();
  if (!k || !NEUTRAL.has(k)) return null;
  const G = G0();
  if (!G) return null;
  if (k === 'gho') {
   if (window.V232 && V232.stadiumOn && V232.stadiumOn()) return null;
   let ht = null;
   try {
    ht = homeTeam();
   } catch (e) {}
   if (ht && ht.id === 'GHO') return null;
  }
  return k;
 }
 const hellOn = () => !off() && stNow() === 'hell' && !!G0();
 const stName = k => {
  try {
   const s = V28.ST28.find(x => x.k === k);
   return s ? s.n : '';
  } catch (e) {
   return '';
  }
 };
 const short = k => k === 'gho' ? 'HALLOWEEN' : stName(k).replace(' STADIUM', '');
 const iconC = {};
 const iconOf = k => {
  if (iconC[k] !== undefined) return iconC[k];
  let c = null;
  try {
   c = V28.icon({
    st28: k
   }) || null;
  } catch (e) {}
  iconC[k] = c;
  return c;
 };
 const DF0 = window.drawField;
 if (typeof DF0 === 'function') window.drawField = function() {
  const k = neutralK(), hell = hellOn();
  if (!k && !hell) return DF0.apply(this, arguments);
  const R0 = window.rect, B0 = window.badge, T0 = window.text, DG0 = window.drawGoal;
  let ht = null;
  try {
   ht = homeTeam();
  } catch (e) {}
  const nm = k ? short(k) : '', dark = k === 'cloud' || k === 'beach';
  try {
   if (hell) window.rect = function(x, y, w, h, c) {
    return R0.call(this, x, y, w, h, HELL_FIELD[c] || c);
   };
   if (k) {
    window.badge = function(team, x, y, sc) {
     if (team === ht && sc === 3 && Math.round(x) === MIDX - 19 && Math.round(y) === CY - 26) {
      const ic = iconOf(k);
      if (ic) {
       const s0 = g.imageSmoothingEnabled;
       g.imageSmoothingEnabled = false;
       g.drawImage(ic, MIDX - 20, CY - 24, 40, 40);
       g.imageSmoothingEnabled = s0;
      }
      LOG.neutral++;
      return;
     }
     return B0.apply(this, arguments);
    };
    window.text = function(s, x, y, sc) {
     if (ht && s === ht.name && x === MIDX && y === CY + 25 && sc === 2) return T0.call(this, nm, MIDX, CY + 25, 2, dark ? '#5a6670' : '#ffffff', 'center');
     if (y === CY - 40 && x === MIDX && sc === 1 && typeof s === 'string' && s === stName(k).replace(' STADIUM', '')) return;
     return T0.apply(this, arguments);
    };
   }
   if (hell && typeof DG0 === 'function') window.drawGoal = function() {
    const P = Object.getPrototypeOf(g), D = Object.getOwnPropertyDescriptor(P, 'fillStyle') || Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
    let own = false;
    try {
     if (D && D.set) {
      Object.defineProperty(g, 'fillStyle', {
       configurable: true,
       get() {
        return D.get.call(g);
       },
       set(v) {
        D.set.call(g, v === HELL_CREASE.from ? HELL_CREASE.to : v);
       }
      });
      own = true;
     }
    } catch (e) {
     err(e, 'crease');
    }
    try {
     return DG0.apply(this, arguments);
    } finally {
     if (own) delete g.fillStyle;
    }
   };
   if (hell) LOG.hell++;
   return DF0.apply(this, arguments);
  } finally {
   window.rect = R0;
   window.badge = B0;
   window.text = T0;
   window.drawGoal = DG0;
  }
 };
 const BD0 = window.ballDot;
 if (typeof BD0 === 'function') window.ballDot = function(x0, y0) {
  if (!hellOn()) return BD0.apply(this, arguments);
  const x = Math.round(x0), y = Math.round(y0), B = HELL_BALL;
  g.fillStyle = B.g;
  g.fillRect(x - 2, y - 2, 6, 6);
  g.fillStyle = B.o;
  g.fillRect(x - 1, y - 1, 4, 4);
  g.fillStyle = B.c;
  g.fillRect(x, y, 2, 2);
  const G = G0();
  if (G) {
   G.whiteBallFrames = (G.whiteBallFrames || 0) + 1;
   G.glowFrames = 0;
   G.ball28Frames = (G.ball28Frames || 0) + 1;
   G.ball35w = (G.ball35w || 0) + 1;
  }
 };
 const IS0 = window.injScene14;
 if (typeof IS0 === 'function') window.injScene14 = function(p0, who, what, games, conc) {
  const sc = IS0.apply(this, arguments);
  try {
   if (!off() && conc && sc && sc.kind === 'injury' && !sc.st28 && !sc.gho16 && !(window.RLNET && RLNET.inGame) && window.V28 && V28.injKind) {
    const k = V28.injKind();
    if (k) {
     sc.st28 = k;
     LOG.conc = (LOG.conc || 0) + 1;
    }
   }
  } catch (e) {
   err(e, 'conc');
  }
  return sc;
 };
 return {
  LOG: LOG,
  HELL_FIELD: HELL_FIELD,
  HELL_CREASE: HELL_CREASE,
  HELL_BALL: HELL_BALL,
  NEUTRAL: NEUTRAL,
  neutralK: neutralK,
  hellOn: hellOn,
  off: off
 };
})();

window.V35ST = V35ST;
