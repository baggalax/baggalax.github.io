var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 const on = () => !window.__rl_no401nm && !window.__rl_v124gb;
 const COLORS = {
  red: 'RED',
  green: 'GREEN',
  blue: 'BLUE',
  yellow: 'YELLOW',
  purple: 'PURPLE'
 };
 const NAMES = {
  [__x("Y2xlYXRzX2hlcm1lcw==")]: 'GOLDEN RACERS'
 };
 for (const k in COLORS) NAMES[__x("c2FiZXJf") + k] = 'THE GLOW STICK (' + COLORS[k] + ')';
 const fixS = s => s.replace(new RegExp(__x("SEVSTUVTIENMRUFUUw=="),"g"), 'GOLDEN RACERS').replace(new RegExp(__x("XGJIRVJNRVNcYg=="),"gi"), 'GOLDEN').replace(new RegExp(__x("XGIoPzpUSEV8VFdJRykgU0FCRVJcYg=="),"g"), 'THE GLOW STICK').replace(/\bSABERS\b/g, 'GLOW STICKS').replace(new RegExp(__x("XGJTQUJFUlxi"),"g"), 'GLOW STICK');
 const fix = s => typeof s === 'string' && on() ? fixS(s) : s;
 function patchItems() {
  try {
   const V = window.V17, BY = V && V.BY;
   if (!BY) return false;
   for (const id in NAMES) {
    const it = BY[id];
    if (!it || it.__n401) continue;
    let n0 = it.n, d0 = it.d;
    const NEW = NAMES[id];
    Object.defineProperty(it, 'n', {
     configurable: true,
     enumerable: true,
     get: () => on() ? NEW : n0,
     set: v => {
      n0 = v;
     }
    });
    Object.defineProperty(it, 'd', {
     configurable: true,
     enumerable: true,
     get: () => fix(d0),
     set: v => {
      d0 = v;
     }
    });
    Object.defineProperty(it, '__n401', {
     value: true
    });
   }
   return true;
  } catch (e) {
   return false;
  }
 }
 function patchHelp() {
  try {
   if (typeof PANEL_RENDER === 'undefined') return;
   const f = PANEL_RENDER.help17;
   if (typeof f !== 'function' || f.__n401) return;
   const w = function() {
    return fix(f.apply(this, arguments));
   };
   w.__n401 = true;
   PANEL_RENDER.help17 = w;
  } catch (e) {}
 }
 function patchPages() {
  try {
   const V = window.V17;
   if (!V || typeof V.helpPages !== 'function' || V.helpPages.__n401) return;
   const f = V.helpPages;
   const w = function() {
    const r = f.apply(this, arguments);
    try {
     return on() ? r.map(p => Array.isArray(p) ? p.map(x => Array.isArray(x) ? x.map(fix) : fix(x)) : p) : r;
    } catch (e) {
     return r;
    }
   };
   w.__n401 = true;
   V.helpPages = w;
  } catch (e) {}
 }
 function all() {
  patchItems();
  patchHelp();
  patchPages();
 }
 all();
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', all);
 window.addEventListener('load', all);
 window.V401NM = {
  on: on,
  fix: fix,
  NAMES: NAMES
 };
})();
