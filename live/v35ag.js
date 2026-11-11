(function() {
 'use strict';
 const LOG = {
  wrap: false,
  hits: 0,
  err: []
 };
 const off = () => !!window.__rl_no35ag;
 function variants(pid) {
  const out = [];
  try {
   if (window.HON25 && HON25.kindOf && HON25.kindOf(pid)) return out;
  } catch (e) {
   return out;
  }
  try {
   if (window.ULT331 && ULT331.isU && ULT331.isU(pid)) return out;
  } catch (e) {
   return out;
  }
  out.push('AA25-' + pid, 'TW25-' + pid);
  try {
   if (window.ULT331 && ULT331.PFX) out.push(ULT331.PFX + pid);
  } catch (e) {}
  return out;
 }
 function wrap() {
  if (!window.V28 || typeof V28.cardGear !== 'function' || V28.cardGear.__ag35) return !!(window.V28 && V28.cardGear && V28.cardGear.__ag35);
  const CG = V28.cardGear;
  const W = function(pid) {
   const own = CG.apply(this, arguments);
   if (off() || !pid || typeof pid !== 'string') return own;
   let o = null;
   try {
    for (const v of variants(pid)) {
     const e = CG.call(this, v);
     if (e && typeof e === 'object') {
      if (!o) o = Object.assign({}, own || {});
      for (const k of Object.keys(e)) if (e[k]) o[k] = e[k];
     }
    }
   } catch (er) {
    LOG.err.push(String(er));
    return own;
   }
   if (!o) return own;
   LOG.hits++;
   return Object.keys(o).length ? o : own;
  };
  W.__ag35 = true;
  W.__orig = CG;
  V28.cardGear = W;
  LOG.wrap = true;
  return true;
 }
 if (!wrap()) {
  let n = 0;
  const iv = setInterval(() => {
   if (wrap() || ++n > 200) clearInterval(iv);
  }, 25);
 }
 window.V35AG = {
  LOG: LOG,
  variants: variants,
  on: () => !off()
 };
})();
