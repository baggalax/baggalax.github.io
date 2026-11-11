var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 const off = () => !!(window.__rl_no24 || window.__rl_v124gb);
 const V24 = window.V24 = {
  on: () => false,
  incN: () => 0,
  open() {},
  rowsInto() {}
 };
 if (off() || !window.V23 || !window.V22 || !window.V17) return;
 const on = () => !off() && V22.on() && V23.signedIn();
 const TK = 'rl_tr24', LEGI = [ __x("bGVnX2dhcnJ5"), __x("bGVnX3JhYmls"), __x("bGVnX2Jyb3du"), __x("bGVnX3BpZXRyYW1hbGE=") ];
 const FEE = {
  r: [ 2, 3, 10 ],
  leg: 100,
  leg2: 150
 }, RN = [ 'COMMON', 'RARE', 'LEGENDARY', 'LEGACY' ], RC = [ '#9aa3ab', '#3d8bff', '#ffcc33', '#f5dd8f' ];
 const S = {
  trades: [],
  at: 0,
  inc: 0,
  out: 0,
  busy: false,
  err: '',
  msg: ''
 };
 let root = null, view = null, poll = 0;
 const done = () => {
  try {
   const a = JSON.parse(localStorage.getItem(TK) || '[]');
   return Array.isArray(a) ? a : [];
  } catch (e) {
   return [];
  }
 };
 const rar = k => k[0] === 'l' ? 3 : V22.rarOf(k.slice(2));
 const free27 = () => !window.__rl_no27free && !window.__rl_no27 && !window.__rl_v124gb;
 function fee(give, get) {
  if (free27()) return 0;
  const ll = give.some(k => rar(k) === 3) && get.some(k => rar(k) === 3);
  let f = 0;
  for (const k of give.concat(get)) {
   const r = rar(k);
   f += r === 3 ? ll ? FEE.leg2 : FEE.leg : FEE.r[r];
  }
  return f;
 }
 const chinos = () => Math.max(0, Math.floor(+V17.ST().chinos || 0));
 function myCards() {
  const out = V22.ownedIds().map(p => 'c:' + p), inv = V17.ST().inv || {};
  for (const id of LEGI) if ((+inv[id] || 0) > 0) out.push('l:' + id);
  return out;
 }
 const pidOf = k => k[0] === 'l' ? (V17.BY[k.slice(2)] || {}).leg20 || '' : k.slice(2);
 const ovrOf = k => {
  const p = PP(pidOf(k));
  return p ? p.ovr : 0;
 };
 const nameOf = k => {
  if (k[0] === 'l') {
   const it = V17.BY[k.slice(2)];
   return it ? it.n : k;
  }
  const p = PP(k.slice(2));
  return p ? p.n.toUpperCase() : k.slice(2);
 };
 const sortK = a => a.slice().sort((x, y) => rar(y) - rar(x) || ovrOf(y) - ovrOf(x) || (nameOf(x) < nameOf(y) ? -1 : 1));
 function applyLocal(tr) {
  const d = done();
  if (!d.includes(tr.id)) {
   const C = V22.st(), ST = V17.ST();
   if (!C.cards || typeof C.cards !== 'object') C.cards = {};
   ST.inv = ST.inv || {};
   ST.seen = ST.seen || {};
   ST.stats = ST.stats || {};
   for (const k of tr.give) {
    if (k[0] === 'c') delete C.cards[k.slice(2)]; else delete ST.inv[k.slice(2)];
   }
   for (const k of tr.get) {
    if (k[0] === 'c') {
     const p = PP(k.slice(2));
     C.cards[k.slice(2)] = Object.assign({}, (tr.recs || {})[k] || {
      t: p ? p.team : ''
     }, {
      at: tr.t2,
      w: 'TRADE'
     });
     try {
      if (window.V33 && V33.cuBack) V33.cuBack(k.slice(2), C.cards[k.slice(2)]);
     } catch (e) {
      console.error(e);
     }
    } else {
     ST.inv[k.slice(2)] = 1;
     ST.seen[k.slice(2)] = true;
    }
   }
   ST.chinos = Math.max(0, (+ST.chinos || 0) - tr.fee);
   ST.stats.spent = (+ST.stats.spent || 0) + tr.fee;
   V22.save();
   V17.save();
   try {
    localStorage.setItem(TK, JSON.stringify(d.concat(tr.id).slice(-300)));
   } catch (e) {}
   try {
    V17.toast('TRADE WITH ' + tr.u + ' DONE: GOT ' + tr.get.length + ' CARD' + (tr.get.length > 1 ? 'S' : '') + (tr.fee ? '  -' + tr.fee + ' CHINOS' : ''), '#7dff7a');
   } catch (e) {}
   try {
    if (window.panelDirty) panelDirty();
   } catch (e) {}
  }
  if (tr.rv) V23.revStep(tr.rv[0], tr.rv[1]);
 }
 function applyAll(list) {
  const L = (list || []).filter(x => x && x.st === 'done').sort((a, b) => (a.rv ? a.rv[0] : 0) - (b.rv ? b.rv[0] : 0) || (a.t2 || 0) - (b.t2 || 0) || a.id - b.id);
  for (const tr of L) applyLocal(tr);
  for (let k = 0; k < L.length; k++) if (!L.some(tr => tr.rv && V23.revStep(tr.rv[0], tr.rv[1]))) break;
 }
 const pendN = mine => S.trades.filter(x => x.st === 'pending' && x.mine === mine).length;
 V23.tr24hb = x => {
  if (!x) return;
  S.inc = x.inc | 0;
  S.out = x.out | 0;
  applyAll(x.done);
  if (S.inc !== pendN(false) || S.out !== pendN(true) || (x.done || []).some(d => !S.trades.some(t => t.id === d.id && t.st === 'done'))) S.at = 0;
  if (root && root.style.display !== 'none') render();
 };
 V23.tr24c = async sv => {
  await refresh();
  return (V23.A().rev || 0) === sv.rev;
 };
 async function refresh() {
  const r = await V23.api('/tr24/list', {
   tok: V23.A().tok
  });
  if (r && r.ok) {
   S.trades = r.trades || [];
   S.at = Date.now();
   S.inc = S.trades.filter(x => x.st === 'pending' && !x.mine).length;
   S.out = S.trades.filter(x => x.st === 'pending' && x.mine).length;
   applyAll(S.trades);
  }
  return r;
 }
 async function synced() {
  if (V23.A().pend || V23.prompt && V23.prompt()) return 'ANSWER THE CLOUD SAVE QUESTION FIRST';
  await refresh();
  for (let i = 0; i < 6 && V23.dirty(); i++) {
   const r = await V23.put(false, 'trade');
   if (r && r.conflict) return 'YOUR CLOUD SAVE CHANGED ON ANOTHER PHONE - SYNC FIRST';
   if (!r) await new Promise(f => setTimeout(f, 400)); else if (!r.ok) return r.error || 'NO CONNECTION';
  }
  return V23.dirty() ? 'COULD NOT SYNC YOUR SAVE - TRY AGAIN' : '';
 }
 const css = `#tr24{position:fixed;inset:0;z-index:42;background:#0b1118;color:#cfe;font:bold 12px/1.25 "Courier New",ui-monospace,monospace;text-transform:uppercase;display:none;flex-direction:column;padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 6px max(10px,env(safe-area-inset-left));box-sizing:border-box}\n#tr24 *{box-sizing:border-box}#tr24 h1{margin:0;font-size:18px;color:#b6ff3a;text-shadow:2px 2px 0 #000;letter-spacing:1px}#tr24 h2{margin:0 0 4px;font-size:13px;color:#ffe14d;display:flex;justify-content:space-between}#tr24 h2 span{color:#8fe3f0;font-size:10px}\n#tr24 .top{display:flex;align-items:center;justify-content:space-between;gap:8px}#tr24 .cols{flex:1;min-height:0;display:flex;gap:8px;margin:4px 0}#tr24 .col{flex:1;min-width:0;display:flex;flex-direction:column;background:#13202b;border:2px solid #22394a;padding:6px}\n#tr24 .grid{flex:1;min-height:0;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;flex-wrap:wrap;gap:4px;align-content:flex-start}\n#tr24 .cd{width:62px;background:#0b1118;border:2px solid #555;padding:2px;text-align:center;cursor:pointer;position:relative;touch-action:manipulation}#tr24 .cd img{width:100%;height:46px;object-fit:contain;image-rendering:pixelated;display:block}\n#tr24 .cd .nm{font-size:8px;line-height:9px;height:18px;overflow:hidden;color:#fff}#tr24 .cd .rr{font-size:7px;line-height:8px}#tr24 .cd.sel{background:#28461f;box-shadow:0 0 0 2px #7dff7a}#tr24 .cd.dis{opacity:.38;cursor:default}\n#tr24 .cd i{position:absolute;left:0;right:0;top:16px;font-style:normal;font-size:7px;background:#000c;color:#ff8a7a}#tr24 .cd.sel:after{content:'\\2714';position:absolute;top:1px;right:3px;color:#7dff7a;font-size:11px;text-shadow:1px 1px 0 #000}\n#tr24 .bar{display:flex;align-items:center;gap:8px;background:#13202b;border:2px solid #ffe14d;padding:4px 8px}#tr24 .fee{flex:1;min-width:0}#tr24 .fee b{color:#ffe14d;font-size:14px}#tr24 .sm{font-size:10px;color:#8fe3f0}#tr24 .err{color:#ff8a7a}#tr24 .ok{color:#7dff7a}\n#tr24 button{font:inherit;text-transform:uppercase;border:0;border-radius:0;padding:6px 10px;margin:0;background:#2cc4dc;color:#0b1a20;box-shadow:0 2px 0 #000;cursor:pointer;touch-action:manipulation}#tr24 button:active{transform:translateY(1px);box-shadow:0 1px 0 #000}#tr24 button[disabled]{opacity:.45}\n#tr24 .g{background:#7dff7a}#tr24 .y{background:#ffd23a}#tr24 .r{background:#ff8a7a}#tr24 .w{background:#c9d6d9}`;
 function el(tag, attrs, kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
   if (k === 'on') for (const ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids || []) if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
 }
 const btn = (label, cls, fn, id) => el('button', {
  class: cls || '',
  id: id || '',
  on: {
   click: e => {
    e.preventDefault();
    e.stopPropagation();
    fn();
   }
  }
 }, [ label ]);
 function mount() {
  if (root) return;
  document.head.appendChild(el('style', {
   text: css
  }));
  root = el('div', {
   id: 'tr24'
  });
  document.body.appendChild(root);
  for (const ev of [ 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'keydown' ]) root.addEventListener(ev, e => e.stopPropagation());
 }
 function tile(k, o) {
  o = o || {};
  const r = rar(k), lg = k[0] === 'l', pid = pidOf(k), p = PP(pid);
  let src = '', col = RC[r];
  try {
   if (lg) src = V17.iconUrl(k.slice(2)); else {
    const rec = o.rec || null;
    const rt = id => !!id && (TEAMS.some(t => t.id === id) || !!(typeof WT_REG !== 'undefined' && WT_REG[id]));
    src = V22.artUrl(pid, rec && rec.t && !(p && rt(p.team)) ? rec.t : V22.teamOfCard(pid));
    if (V22.gh16(pid)) col = '#b48aff';
   }
  } catch (e) {}
  const d = el('div', {
   class: 'cd' + (o.sel ? ' sel' : '') + (o.dis ? ' dis' : ''),
   'data-k': k,
   style: 'border-color:' + col
  }, [ el('img', {
   alt: '',
   src: src
  }), o.dis ? el('i', {
   text: o.dis
  }) : null, el('div', {
   class: 'nm',
   text: nameOf(k)
  }), el('div', {
   class: 'rr',
   style: 'color:' + col,
   text: RN[r] + (p ? ' ' + p.ovr : '')
  }) ]);
  if (o.tap && !o.dis) d.addEventListener('click', e => {
   e.preventDefault();
   o.tap();
  });
  return d;
 }
 const hrs = ms => ms <= 0 ? 'EXPIRED' : ms < 36e5 ? Math.max(1, Math.round(ms / 6e4)) + ' MIN' : Math.round(ms / 36e5) + ' H';
 function render() {
  if (!root || !view) return;
  root.textContent = '';
  if (view.kind === 'new') {
   const D = view.data;
   root.appendChild(el('div', {
    class: 'top'
   }, [ el('h1', {
    text: 'TRADE WITH ' + view.u.toUpperCase()
   }), el('div', {
    class: 'err',
    id: 'e24',
    text: S.err
   }), el('div', {
    class: 'ok',
    id: 'm24',
    text: S.msg
   }), btn('BACK', 'w', close, 'b24back') ]));
   if (!D) {
    root.appendChild(el('div', {
     class: 'sm',
     text: S.err ? '' : 'LOADING CARDS...'
    }));
    return;
   }
   const mine = sortK(myCards()), theirs = sortK(D.theirs || []), hasT = new Set(D.theirs || []), hasM = new Set(mine);
   const L = el('div', {
    class: 'col',
    id: 'c24give'
   }, [ el('h2', {}, [ 'YOU GIVE', el('span', {
    text: view.give.size + ' PICKED - ' + mine.length + ' CARDS'
   }) ]) ]), Lg = el('div', {
    class: 'grid'
   });
   for (const k of mine) Lg.appendChild(tile(k, {
    sel: view.give.has(k),
    dis: hasT.has(k) ? 'HE HAS IT' : '',
    tap: () => {
     view.give.has(k) ? view.give.delete(k) : view.give.add(k);
     S.err = '';
     render();
    }
   }));
   if (!mine.length) Lg.appendChild(el('div', {
    class: 'sm',
    text: 'NO PLAYER CARDS YET'
   }));
   L.appendChild(Lg);
   const Rr = el('div', {
    class: 'col',
    id: 'c24get'
   }, [ el('h2', {}, [ 'YOU GET', el('span', {
    text: view.get.size + ' PICKED - ' + theirs.length + ' CARDS'
   }) ]) ]), Rg = el('div', {
    class: 'grid'
   });
   for (const k of theirs) Rg.appendChild(tile(k, {
    rec: (D.recs || {})[k],
    sel: view.get.has(k),
    dis: hasM.has(k) ? 'YOU HAVE IT' : '',
    tap: () => {
     view.get.has(k) ? view.get.delete(k) : view.get.add(k);
     S.err = '';
     render();
    }
   }));
   if (!theirs.length) Rg.appendChild(el('div', {
    class: 'sm',
    text: view.u.toUpperCase() + ' HAS NO PLAYER CARDS YET'
   }));
   Rr.appendChild(Rg);
   root.appendChild(el('div', {
    class: 'cols'
   }, [ L, Rr ]));
   const g = [ ...view.give ], t = [ ...view.get ], f = g.length || t.length ? fee(g, t) : 0, can = g.length && t.length && !S.busy;
   root.appendChild(el('div', {
    class: 'bar'
   }, [ free27() ? el('div', {
    class: 'fee',
    id: 'f24'
   }, [ el('b', {
    text: 'TRADES ARE FREE'
   }), el('div', {
    class: 'sm',
    text: 'NO CHINOS FEE - OFFERS LAST 24 H'
   }) ]) : el('div', {
    class: 'fee',
    id: 'f24'
   }, [ 'FEE: ', el('b', {
    text: f + ' CHINOS'
   }), ' EACH - YOU BOTH PAY', el('div', {
    class: 'sm',
    text: 'YOU HAVE ' + chinos() + ' CHINOS - LEGACY 150 (LEGACY FOR LEGACY) / 100, LEGENDARY 50, RARE 15, COMMON 10 PER CARD - OFFERS LAST 24 H'
   }) ]), el('button', Object.assign({
    class: 'g',
    id: 'b24send',
    on: {
     click: e => {
      e.preventDefault();
      e.stopPropagation();
      if (can) send();
     }
    }
   }, can ? {} : {
    disabled: ''
   }), [ S.busy ? '...' : 'SEND TRADE' ]) ]));
   return;
  }
  const tr = S.trades.find(x => x.id === view.id);
  root.appendChild(el('div', {
   class: 'top'
  }, [ el('h1', {
   text: tr ? 'TRADE WITH ' + tr.u.toUpperCase() : 'TRADE'
  }), el('div', {
   class: 'err',
   id: 'e24',
   text: S.err
  }), el('div', {
   class: 'ok',
   id: 'm24',
   text: S.msg
  }), btn('BACK', 'w', close, 'b24back') ]));
  if (!tr) {
   root.appendChild(el('div', {
    class: 'sm',
    text: 'TRADE NOT FOUND'
   }));
   return;
  }
  const hasM = new Set(myCards());
  const L = el('div', {
   class: 'col',
   id: 'c24give'
  }, [ el('h2', {}, [ 'YOU GIVE', el('span', {
   text: tr.give.length + ' CARD' + (tr.give.length > 1 ? 'S' : '')
  }) ]) ]), Lg = el('div', {
   class: 'grid'
  });
  for (const k of tr.give) Lg.appendChild(tile(k, {
   dis: tr.st === 'pending' && !hasM.has(k) ? 'NOT YOURS NOW' : ''
  }));
  L.appendChild(Lg);
  const Rr = el('div', {
   class: 'col',
   id: 'c24get'
  }, [ el('h2', {}, [ 'YOU GET', el('span', {
   text: tr.get.length + ' CARD' + (tr.get.length > 1 ? 'S' : '')
  }) ]) ]), Rg = el('div', {
   class: 'grid'
  });
  for (const k of tr.get) Rg.appendChild(tile(k, {
   rec: (tr.recs || {})[k],
   dis: tr.st === 'pending' && hasM.has(k) ? 'YOU HAVE IT' : ''
  }));
  Rr.appendChild(Rg);
  root.appendChild(el('div', {
   class: 'cols'
  }, [ L, Rr ]));
  const stTxt = tr.st === 'pending' ? (tr.mine ? 'WAITING FOR ' + tr.u.toUpperCase() + ' - ' : tr.u.toUpperCase() + ' OFFERED THIS - ') + 'EXPIRES IN ' + hrs(tr.exp - Date.now()) : tr.st === 'done' ? 'TRADE DONE' : tr.st === 'declined' ? tr.mine ? tr.u.toUpperCase() + ' DECLINED' : 'YOU DECLINED' : tr.st === 'cancelled' ? 'CANCELLED' : tr.st === 'expired' ? 'EXPIRED (24 H)' : 'DID NOT GO THROUGH' + (tr.why ? ': ' + tr.why : '');
  const acts = [];
  if (tr.st === 'pending' && !tr.mine) {
   acts.push(el('button', Object.assign({
    class: 'g',
    id: 'b24ok',
    on: {
     click: e => {
      e.preventDefault();
      e.stopPropagation();
      if (!S.busy) act('accept', tr);
     }
    }
   }, S.busy ? {
    disabled: ''
   } : {}), [ S.busy ? '...' : 'ACCEPT' ]));
   acts.push(btn('DECLINE', 'r', () => {
    if (!S.busy) act('decline', tr);
   }, 'b24no'));
  }
  if (tr.st === 'pending' && tr.mine) acts.push(btn('CANCEL TRADE', 'w', () => {
   if (!S.busy) act('cancel', tr);
  }, 'b24cancel'));
  root.appendChild(el('div', {
   class: 'bar'
  }, [ free27() && (tr.st === 'pending' || !tr.fee) ? el('div', {
   class: 'fee',
   id: 'f24'
  }, [ el('b', {
   text: 'FREE TRADE'
  }), el('div', {
   class: 'sm',
   id: 's24',
   text: stTxt
  }) ]) : el('div', {
   class: 'fee',
   id: 'f24'
  }, [ 'FEE: ', el('b', {
   text: tr.fee + ' CHINOS'
  }), ' EACH - YOU BOTH PAY', el('div', {
   class: 'sm',
   id: 's24',
   text: stTxt + ' - YOU HAVE ' + chinos() + ' CHINOS'
  }) ]) ].concat(acts)));
 }
 async function send() {
  S.busy = true;
  S.err = '';
  S.msg = '';
  render();
  try {
   const why = await synced();
   if (why) {
    S.err = why;
    return;
   }
   const r = await V23.api('/tr24/propose', {
    tok: V23.A().tok,
    u: view.u,
    give: [ ...view.give ],
    get: [ ...view.get ]
   });
   if (!r.ok) {
    S.err = r.error || 'DID NOT WORK';
    if (r.dupe || /HAVE THAT CARD/.test(S.err)) await load(view.u, true);
    return;
   }
   await refresh();
   view = {
    kind: 'trade',
    id: r.id
   };
   S.msg = 'TRADE SENT - ' + 'IT WAITS 24 H FOR AN ANSWER';
  } finally {
   S.busy = false;
   render();
   try {
    V23.render();
   } catch (e) {}
  }
 }
 async function act(kind, tr) {
  S.busy = true;
  S.err = '';
  S.msg = '';
  render();
  try {
   if (kind === 'accept') {
    const why = await synced();
    if (why) {
     S.err = why;
     return;
    }
   }
   const r = await V23.api('/tr24/' + kind, {
    tok: V23.A().tok,
    id: tr.id
   });
   if (r.ok && r.trade) applyLocal(r.trade);
   if (!r.ok) S.err = r.error || 'DID NOT WORK'; else S.msg = kind === 'accept' ? 'TRADE DONE - THE CARDS ARE IN YOUR LOCKER ROOM' : kind === 'decline' ? 'DECLINED' : 'CANCELLED';
   await refresh();
  } finally {
   S.busy = false;
   render();
   try {
    V23.render();
   } catch (e) {}
  }
 }
 async function load(u, keepPick) {
  const r = await V23.api('/tr24/cards', {
   tok: V23.A().tok,
   u: u
  });
  if (!view || view.u !== u) return;
  if (!r.ok) {
   S.err = r.error || 'NO CONNECTION';
   view.data = view.data || {
    theirs: []
   };
  } else {
   view.data = r;
   if (keepPick) {
    for (const k of [ ...view.give ]) if ((r.theirs || []).includes(k) || !myCards().includes(k)) view.give.delete(k);
    for (const k of [ ...view.get ]) if (!(r.theirs || []).includes(k) || myCards().includes(k)) view.get.delete(k);
   }
  }
  render();
 }
 function show() {
  mount();
  root.style.display = 'flex';
  clearInterval(poll);
  poll = setInterval(() => {
   if (view && view.kind === 'trade' && document.visibilityState === 'visible' && !S.busy) refresh().then(() => render());
  }, 5e3);
 }
 function open(u) {
  if (!on()) return;
  S.err = '';
  S.msg = '';
  view = {
   kind: 'new',
   u: String(u),
   data: null,
   give: new Set,
   get: new Set
  };
  show();
  render();
  synced().then(why => {
   if (why) {
    S.err = why;
    render();
   }
   return load(view.u);
  });
 }
 function openTrade(id) {
  if (!on()) return;
  S.err = '';
  S.msg = '';
  view = {
   kind: 'trade',
   id: id
  };
  show();
  render();
  refresh().then(() => render());
 }
 function close() {
  view = null;
  clearInterval(poll);
  if (root) root.style.display = 'none';
  try {
   V23.render();
  } catch (e) {}
 }
 function rowsInto(col, el2, btn2) {
  if ((Date.now() - Math.max(S.at, S.tried || 0) > 8e3 || !S.at && Date.now() - (S.tried || 0) > 1500) && !S.ld) {
   S.ld = 1;
   S.tried = Date.now();
   refresh().then(() => {
    S.ld = 0;
    try {
     V23.render();
    } catch (e) {}
   }, () => {
    S.ld = 0;
   });
  }
  const now = Date.now();
  for (const tr of S.trades.filter(x => x.st === 'pending' || now - (x.t2 || 0) < 864e5 && x.mine).slice(0, 6)) {
   const txt = tr.st === 'pending' ? tr.mine ? 'TRADE SENT TO ' + tr.u + ' - WAITING' : tr.u + ' WANTS TO TRADE CARDS' : 'TRADE WITH ' + tr.u + ': ' + (tr.st === 'done' ? 'DONE' : tr.st === 'failed' ? 'DID NOT GO THROUGH' : tr.st.toUpperCase());
   col.appendChild(el2('div', {
    class: 'row tr24' + (tr.st === 'pending' && !tr.mine ? ' inc23' : ''),
    'data-id': String(tr.id)
   }, [ el2('span', {
    class: 'n',
    text: txt
   }), btn2(tr.st === 'pending' && !tr.mine ? 'VIEW TRADE' : 'VIEW', tr.st === 'pending' && !tr.mine ? 'g' : 'w', () => openTrade(tr.id)) ]));
  }
 }
 Object.assign(V24, {
  synced: synced,
  nameOf: nameOf,
  sortK: sortK,
  tile: tile,
  free27: free27,
  on: on,
  incN: () => on() ? S.inc : 0,
  open: open,
  openTrade: openTrade,
  close: close,
  rowsInto: rowsInto,
  refresh: refresh,
  fee: fee,
  rar: rar,
  myCards: myCards,
  applyLocal: applyLocal,
  st: () => S,
  view: () => view,
  isOpen: () => !!(root && root.style.display !== 'none')
 });
})();
