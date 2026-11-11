'use strict';

const V35NA = (() => {
 const off = () => !!window.__rl_v124gb || !!window.__rl_no35seas;
 const LOG = {
  tab: null,
  na: 0,
  proDrop: 0,
  hidden: 0,
  oppHidden: 0,
  errs: []
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 30) LOG.errs.shift();
  } catch (x) {}
 };
 let TAB = null;
 function teamOf(id) {
  try {
   const t = typeof TEAMS !== 'undefined' && TEAMS.find(x => x.id === id) || null;
   if (t) return t;
  } catch (e) {}
  try {
   if (typeof WT_REG !== 'undefined' && WT_REG[id]) return WT_REG[id];
  } catch (e) {}
  try {
   if (typeof GH_REG !== 'undefined' && GH_REG[id]) return GH_REG[id];
  } catch (e) {}
  try {
   if (typeof T === 'function') return T(id) || null;
  } catch (e) {}
  return null;
 }
 function typeOfBase(b) {
  const t = teamOf(b);
  if (!t) return 'pro';
  try {
   if (typeof WT_REG !== 'undefined' && WT_REG[b]) return 'world';
  } catch (e) {}
  if (t.col25) return 'college';
  const lg = String(t.lg || '').toUpperCase();
  if (/N\/A/.test(lg)) return 'na';
  return 'pro';
 }
 function baseOfEntry(e) {
  try {
   if (e.cur) return season && season.team;
  } catch (x) {}
  try {
   const d = szArchList2314().find(x => x.id === e.id);
   if (d) return d.base;
  } catch (x) {}
  return null;
 }
 const typeOfEntry = e => typeOfBase(baseOfEntry(e));
 function tabOf(opts) {
  const o = opts || {};
  if (!o.world || o.pool || o.col29) return null;
  const na = !!gridNA16 && !!(window.GHO16 && GHO16.on());
  if (na) return 'na';
  const cv4 = !!o.col2504 && (typeof on2504g !== 'function' || on2504g()) && !!(window.COL25 && COL25.groups);
  if (cv4 && gridCol2504) return 'college';
  if (gridWorld16 && typeof WTEAMS !== 'undefined' && WTEAMS.length > 0) return 'world';
  return 'pro';
 }
 const TG0 = window.teamGrid;
 if (typeof TG0 === 'function') window.teamGrid = function(title, sub, onPick, opts) {
  const prev = TAB;
  try {
   TAB = off() ? null : tabOf(opts);
   LOG.tab = TAB;
  } catch (e) {
   TAB = null;
   err(e, 'tab');
  }
  try {
   return TG0.apply(this, arguments);
  } finally {
   TAB = prev;
  }
 };
 let FILT = null;
 const DE0 = window.dd2314Entries;
 if (typeof DE0 === 'function') window.dd2314Entries = function(world) {
  const out = DE0.apply(this, arguments);
  if (!FILT || world || off()) return out;
  try {
   const k = out.filter(e => typeOfEntry(e) === FILT);
   if (FILT === 'pro') LOG.proDrop += out.length - k.length;
   return k;
  } catch (e) {
   err(e, 'filt');
   return out;
  }
 };
 const SD0 = window.szDrop2314;
 if (typeof SD0 === 'function') window.szDrop2314 = function(by, onPick) {
  if (off() || !TAB) return SD0.apply(this, arguments);
  if (TAB === 'na') {
   let ents = [];
   FILT = 'na';
   try {
    ents = dd2314Entries(false);
   } catch (e) {
    err(e, 'na');
    ents = [];
   } finally {
    FILT = null;
   }
   LOG.na = ents.length;
   if (!ents.length) {
    try {
     DD2314 = null;
     dd32Y = null;
    } catch (e) {}
    LOG.hidden++;
    return;
   }
   return szDrop2314a(by, onPick, false, ents);
  }
  if (TAB === 'pro') {
   FILT = 'pro';
   try {
    return SD0.apply(this, arguments);
   } finally {
    FILT = null;
   }
  }
  return SD0.apply(this, arguments);
 };
 const SL0 = window.szLabel15;
 if (typeof SL0 === 'function') window.szLabel15 = function() {
  const l = SL0.apply(this, arguments);
  try {
   if (l && !off() && TAB === 'na' && typeOfBase(season && season.team) !== 'na') {
    LOG.oppHidden++;
    return null;
   }
  } catch (e) {
   err(e, 'label');
  }
  return l;
 };
 return {
  LOG: LOG,
  typeOfBase: typeOfBase,
  typeOfEntry: typeOfEntry,
  tabOf: tabOf,
  get tab() {
   return TAB;
  }
 };
})();

window.V35NA = V35NA;

const V35PT = (() => {
 const off = () => !!window.__rl_v124gb || !!window.__rl_no35pickt;
 const LOG = {
  deco: 0,
  tiles: 0,
  noBadge: [],
  errs: []
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 30) LOG.errs.shift();
  } catch (x) {}
 };
 function css() {
  if (document.getElementById('pt35css')) return;
  const s = document.createElement('style');
  s.id = 'pt35css';
  const R = '#tp33.pt35 .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:4px}' + '#tp33.pt35 .gr button.pt35{position:relative;max-width:none;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;padding:4px 3px 3px;' + 'background:#1a2430;color:#fff;border-top:3px solid var(--ac35,#7dff7a);box-shadow:inset 0 0 0 2px #7dff7a;border-radius:3px;text-decoration:none;white-space:normal;overflow:hidden}' + '#tp33.pt35 .gr button.pt35 img{width:26px;height:30px;image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none;flex:0 0 auto;-webkit-user-drag:none}' + '#tp33.pt35 .gr button.pt35 .n35{display:block;width:100%;font-size:9px;line-height:1.15;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}' + '#tp33.pt35 .gr button.pt35 i{margin:0;font-size:8px;color:#8fe3f0;opacity:1;pointer-events:none}' + '#tp33.pt35 .gr button.pt35.x{background:#10161c;color:#7d8f99;box-shadow:inset 0 0 0 1px #33434e;opacity:.55}' + '#tp33.pt35 .gr button.pt35.x img{filter:grayscale(1) brightness(.7)}#tp33.pt35 .gr button.pt35.x .n35{text-decoration:line-through}' + '#tp33.pt35 .gr button.pt35 .o35{display:none;position:absolute;top:2px;right:2px;font-size:8px;line-height:1;padding:1px 2px;background:#ff5a4a;color:#fff;border-radius:2px;pointer-events:none}' + '#tp33.pt35 .gr button.pt35.x .o35{display:block}' + '#tp33.pt35 .gr button.pt35.ct{box-shadow:inset 0 0 0 2px #ffd23a}#tp33.pt35 .gr button.pt35.ct.x{box-shadow:inset 0 0 0 1px #6b5a1a}' + '#tp33.pt35 .gr button.pt35.bad{background:#3a1a1a;color:#ff9a8a;box-shadow:inset 0 0 0 2px #ff5a4a}';
  s.textContent = R + R.split('#tp33.pt35 ').join('#na35 ');
  document.head.appendChild(s);
 }
 function teamOf(id) {
  try {
   return typeof T === 'function' ? T(id) : null;
  } catch (e) {
   return null;
  }
 }
 function names32(ids) {
  try {
   if (typeof tileNames32 !== 'function' || typeof on32tile === 'function' && !on32tile()) return null;
   const list = ids.map(teamOf).filter(Boolean);
   const m = tileNames32(list, false) || {};
   const o = {};
   for (const k of Object.keys(m)) o[k] = String(m[k]).toUpperCase();
   return o;
  } catch (e) {
   err(e, 'names');
   return null;
  }
 }
 function deco() {
  const ov = document.getElementById('tp33');
  if (!ov) return;
  if (off()) {
   ov.classList.remove('pt35');
   return;
  }
  css();
  ov.classList.add('pt35');
  const bs = ov.querySelectorAll('.gr button[data-tid]:not(.pt35)');
  if (!bs.length) return;
  LOG.deco++;
  const tn32 = names32([ ...ov.querySelectorAll('.gr button[data-tid]') ].map(b => b.dataset.tid));
  for (const b of bs) {
   try {
    const id = b.dataset.tid, tm = teamOf(id);
    const tn = [ ...b.childNodes ].filter(n => n.nodeType === 3), name = tn32 && tn32[id] || tn.map(n => n.textContent).join('');
    tn.forEach(n => n.remove());
    const sp = document.createElement('span');
    sp.className = 'n35';
    sp.textContent = name;
    b.insertBefore(sp, b.firstChild);
    let src = '';
    try {
     if (tm && typeof badgeUrl === 'function') src = badgeUrl(tm);
    } catch (e) {
     err(e, 'badge ' + id);
    }
    if (src) {
     const im = document.createElement('img');
     im.alt = '';
     im.src = src;
     im.draggable = false;
     b.insertBefore(im, sp);
    } else if (LOG.noBadge.length < 40) LOG.noBadge.push(id);
    try {
     if (tm && typeof accent === 'function') b.style.setProperty('--ac35', accent(tm));
    } catch (e) {}
    const o = document.createElement('span');
    o.className = 'o35';
    o.textContent = 'OUT';
    b.appendChild(o);
    b.title = name;
    b.classList.add('pt35');
    LOG.tiles++;
   } catch (e) {
    err(e, 'tile');
   }
  }
 }
 let watched = null;
 const inner = new MutationObserver(() => {
  try {
   deco();
  } catch (e) {
   err(e, 'mo');
  }
 });
 function watch() {
  const ov = document.getElementById('tp33');
  if (!ov || ov === watched) return;
  watched = ov;
  inner.observe(ov, {
   childList: true
  });
  deco();
 }
 try {
  new MutationObserver(watch).observe(document.body, {
   childList: true
  });
  watch();
 } catch (e) {
  err(e, 'body');
 }
 return {
  LOG: LOG,
  deco: deco,
  css: css,
  teamOf: teamOf,
  names32: names32
 };
})();

window.V35PT = V35PT;

const V35NT = (() => {
 const off = () => !!window.__rl_v124gb || !!window.__rl_no35pickt;
 const LOG = {
  rows: 0,
  opens: 0,
  taps: 0,
  errs: []
 };
 const err = (e, w) => {
  try {
   LOG.errs.push((w || '') + ': ' + String(e && e.message || e).slice(0, 160));
   if (LOG.errs.length > 30) LOG.errs.shift();
  } catch (x) {}
 };
 const nm = id => {
  const t = V35PT.teamOf(id);
  return t ? String(t.name || id).toUpperCase() : String(id);
 };
 const naIds = kind => {
  try {
   return (V33.universe(kind).na || []).slice();
  } catch (e) {
   return [];
  }
 };
 const isIn = (kind, id) => {
  try {
   return !V33.sel(kind).off.has(id);
  } catch (e) {
   return true;
  }
 };
 function summary(kind) {
  const ids = naIds(kind), on = ids.filter(id => isIn(kind, id));
  if (ids.length === 1) return (on.length ? '' : 'X ') + nm(ids[0]);
  if (!on.length) return 'NONE';
  return on.length === ids.length ? 'ALL ' + ids.length + ' IN' : on.length + ' OF ' + ids.length + ' IN';
 }
 if (window.V33 && typeof V33.rowsHtml === 'function') {
  const RH0 = V33.rowsHtml;
  V33.rowsHtml = function(kind, act) {
   const h = RH0.apply(this, arguments);
   if (off() || typeof h !== 'string' || h.indexOf('id="ss33na"') < 0) return h;
   try {
    const ids = naIds(kind);
    if (!ids.length) return h;
    const any = ids.some(id => isIn(kind, id));
    const row = '<div class="row" id="ss33na"><span class="note" style="align-self:center">WHICH N/A TEAMS?</span>' + btn(summary(kind), 'na35', kind, any ? 'g' : 'd') + '</div>';
    LOG.rows++;
    return h.replace(/<div class="row" id="ss33na">[\s\S]*?<\/div>/, row);
   } catch (e) {
    err(e, 'row');
    return h;
   }
  };
 }
 let ov = null, cur = null;
 function draw() {
  if (!ov || !cur) return;
  const kind = cur, sc = ov.querySelector('.sc'), top = sc ? sc.scrollTop : 0;
  ov.innerHTML = '';
  const h = document.createElement('div');
  h.className = 'h';
  const tt = document.createElement('div');
  tt.className = 'tt';
  tt.textContent = 'WHICH N/A TEAMS?';
  h.appendChild(tt);
  const done = document.createElement('button');
  done.type = 'button';
  done.className = 'g';
  done.id = 'na35done';
  done.textContent = 'DONE';
  done.addEventListener('click', ev => {
   ev.preventDefault();
   ev.stopPropagation();
   close();
  });
  h.appendChild(done);
  ov.appendChild(h);
  const ids = naIds(kind), on = ids.filter(id => isIn(kind, id)).length;
  const st = document.createElement('div');
  st.className = 'st';
  st.id = 'na35st';
  st.textContent = on + ' OF ' + ids.length + ' N/A TEAM' + (ids.length === 1 ? '' : 'S') + ' IN - EXTRAS, NO PRIZE RULE';
  ov.appendChild(st);
  const m = document.createElement('div');
  m.className = 'm';
  m.id = 'na35msg';
  m.textContent = V33.msg33 && V33.msg33[kind] || 'TAP A TEAM = IN / OUT.';
  ov.appendChild(m);
  const box = document.createElement('div');
  box.className = 'sc';
  box.id = 'na35list';
  const gr = document.createElement('div'), n32 = V35PT.names32(ids) || {};
  gr.className = 'gr';
  for (const id of ids) {
   const inn = isIn(kind, id), t = V35PT.teamOf(id);
   const b = document.createElement('button');
   b.type = 'button';
   b.dataset.tid = id;
   b.className = 'pt35' + (inn ? '' : ' x');
   b.setAttribute('aria-label', nm(id) + (inn ? ' IN' : ' OUT'));
   let src = '';
   try {
    if (t && typeof badgeUrl === 'function') src = badgeUrl(t);
   } catch (e) {
    err(e, 'badge');
   }
   if (src) {
    const im = document.createElement('img');
    im.alt = '';
    im.src = src;
    im.draggable = false;
    b.appendChild(im);
   }
   const sp = document.createElement('span');
   sp.className = 'n35';
   sp.textContent = n32[id] || nm(id);
   b.appendChild(sp);
   const o = document.createElement('span');
   o.className = 'o35';
   o.textContent = 'OUT';
   b.appendChild(o);
   try {
    if (t && typeof accent === 'function') b.style.setProperty('--ac35', accent(t));
   } catch (e) {}
   b.title = nm(id);
   b.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    LOG.taps++;
    try {
     V33.rowAct(kind + '|na|' + id, null);
    } catch (e) {
     err(e, 'tap');
    }
    draw();
   });
   gr.appendChild(b);
  }
  box.appendChild(gr);
  ov.appendChild(box);
  box.scrollTop = top;
 }
 function open(kind) {
  if (off()) return;
  V35PT.css();
  if (!document.getElementById('na35css')) {
   const s = document.createElement('style');
   s.id = 'na35css';
   s.textContent = '#na35{position:fixed;inset:0;z-index:70;pointer-events:auto;display:none;flex-direction:column;gap:4px;background:#080e14;color:#e8f4f6;font:bold 11px/1.25 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.3px;' + 'padding:calc(6px + env(safe-area-inset-top)) calc(8px + env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) calc(8px + env(safe-area-inset-left));box-sizing:border-box;touch-action:manipulation}' + '#na35 .h{display:flex;gap:6px;align-items:center;flex:0 0 auto}#na35 .h .tt{font-size:13px;color:#fff;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' + '#na35 .h button{font:inherit;font-size:10px;border:0;border-radius:3px;padding:4px 7px;background:#7dff7a;color:#0b1a20;text-transform:uppercase;flex:0 0 auto}' + '#na35 .st{flex:0 0 auto;font-size:11px;color:#7dff7a}#na35 .m{flex:0 0 auto;color:#ffd23a;font-size:10px}' + '#na35 .sc{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;border:1px solid #22313d;background:rgba(0,0,0,.25);padding:3px}' + '#na35 .gr button{font:inherit;border:0;text-transform:uppercase}';
   document.head.appendChild(s);
  }
  if (!ov) {
   ov = document.createElement('div');
   ov.id = 'na35';
   document.body.appendChild(ov);
   [ 'pointerdown', 'touchstart', 'click' ].forEach(t => ov.addEventListener(t, e => e.stopPropagation()));
  }
  cur = kind;
  LOG.opens++;
  ov.style.display = 'flex';
  draw();
 }
 function close() {
  cur = null;
  if (ov) {
   ov.style.display = 'none';
   ov.innerHTML = '';
  }
  try {
   panelDirty();
  } catch (e) {}
 }
 try {
  if (typeof PANEL_ACT !== 'undefined') PANEL_ACT.na35 = v => open(String(v || 'pro'));
 } catch (e) {
  err(e, 'act');
 }
 return {
  LOG: LOG,
  open: open,
  close: close,
  isOpen: () => !!cur,
  summary: summary
 };
})();

window.V35NT = V35NT;
