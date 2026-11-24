/* v600col.js - Bagga Lax 1.5f: COLLEGE TEAM NAMES = the school's real home city (or the STATE for a state university)
 * Bug (Charlie): North Carolina never showed as NORTH CAROLINA. Cause: three rename passes stack at load: names31 data
 *   (NORTH CAROLINA) -> v38col (CHAPEL HILL) -> v4011rn (PITTSBORO, a neighbouring town). Same for most schools.
 * Fix: one final list, applied last, to the team objects and the names31 defaults (so RESET NAMES goes back to it).
 *   Place names only (no school names, nicknames, mascots or trademark abbreviations). No two teams share a name or an
 *   abbreviation: in a shared city the better-known school keeps the city, the other gets its real neighbourhood or a
 *   directional form of the city. Made-up nicknames, colours and ids unchanged. A name the player typed in EDIT NAMES wins.
 * Kill switch: window.__rl_no600col
 */
(function () {
 const Wn = window;
 if (Wn.__rl_no600col || !Array.isArray(Wn.RL_COL25)) return;
 const M = {
  CAF: ['COLORADO SPRINGS', 'COS'], CALB: ['ALBANY', 'ALB'], CARMY: ['WEST POINT', 'WP'], CBELL: ['LOUISVILLE', 'LOU'],
  CBING: ['BINGHAMTON', 'BIN'], CBU: ['BOSTON', 'BOS'], CBRWN: ['PROVIDENCE', 'PRO'], CBRY: ['SMITHFIELD', 'SMI'],
  CBUCK: ['LEWISBURG', 'LEW'], CCAN: ['BUFFALO', 'BUF'], CCLEV: ['CLEVELAND', 'CLE'], CCOLG: ['HAMILTON', 'HAM'],
  CCORN: ['ITHACA', 'ITH'], CDART: ['HANOVER', 'HAN'], CDEL: ['DELAWARE', 'DEL'], CDEN: ['DENVER', 'DEN'],
  CDET: ['DETROIT', 'DET'], CDREX: ['WEST PHILLY', 'WPH'], CDUKE: ['DURHAM', 'DUR'], CFAIR: ['FAIRFIELD', 'FAI'],
  CGTWN: ['GEORGETOWN', 'GEO'], CHAMP: ['HAMPTON', 'HPT'], CHARV: ['CAMBRIDGE', 'CAM'], CHPU: ['HIGH POINT', 'HP'],
  CHOB: ['GENEVA', 'GEN'], CHOF: ['HEMPSTEAD', 'HEM'], CHC: ['WORCESTER', 'WOR'], CIONA: ['NEW ROCHELLE', 'NR'],
  CJAX: ['JACKSONVILLE', 'JAX'], CJHU: ['BALTIMORE', 'BAL'], CLAF: ['EASTON', 'EAS'], CLEH: ['BETHLEHEM', 'BET'],
  CLEM: ['EAST SYRACUSE', 'ESY'], CLIU: ['BROOKVILLE', 'BRO'], CLOY: ['NORTH BALTIMORE', 'NBL'], CMAN: ['BRONX', 'BRX'],
  CMAR: ['POUGHKEEPSIE', 'POU'], CMARQ: ['MILWAUKEE', 'MIL'], CUMD: ['MARYLAND', 'MD'], CUMBC: ['CATONSVILLE', 'CTV'],
  CMASS: ['MASSACHUSETTS', 'MAS'], CUML: ['LOWELL', 'LOW'], CMER: ['MACON', 'MAC'], CMHU: ['ERIE', 'ERI'],
  CMACK: ['NORTH ANDOVER', 'NA'], CMICH: ['MICHIGAN', 'MIC'], CMON: ['WEST LONG BRANCH', 'WLB'], CMSM: ['EMMITSBURG', 'EMM'],
  CNAVY: ['ANNAPOLIS', 'ANN'], CNJIT: ['NEWARK', 'NEW'], CUNC: ['NORTH CAROLINA', 'NC'], CND: ['SOUTH BEND', 'SB'],
  COSU: ['OHIO', 'OHI'], CPENN: ['PHILADELPHIA', 'PHI'], CPSU: ['PENNSYLVANIA', 'PEN'], CPRIN: ['PRINCETON', 'PRI'],
  CPROV: ['ELMHURST', 'ELM'], CQU: ['CHARLOTTE', 'CLT'], CQUIN: ['HAMDEN', 'HMD'], CRICH: ['RICHMOND', 'RIC'],
  CRMU: ['MOON TOWNSHIP', 'MT'], CRUT: ['NEW JERSEY', 'NJ'], CSHU: ['FAIRFIELD COUNTY', 'FCO'], CSBU: ['ALLEGANY', 'ALL'],
  CSTJ: ['QUEENS', 'QNS'], CSJ: ['WYNNEFIELD', 'WYN'], CSIE: ['LOUDONVILLE', 'LDV'], CSTB: ['STONY BROOK', 'STB'],
  CCUSE: ['SYRACUSE', 'SYR'], CTOW: ['TOWSON', 'TOW'], CUTAH: ['UTAH', 'UTA'], CUVM: ['VERMONT', 'VER'],
  CNOVA: ['VILLANOVA', 'VIL'], CUVA: ['VIRGINIA', 'VIR'], CVMI: ['LEXINGTON', 'LEX'], CWAG: ['STATEN ISLAND', 'SI'],
  CYALE: ['NEW HAVEN', 'NH']
 };
 const title = s => String(s).toLowerCase().replace(/(^|[\s'-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
 const N = Wn.N31, ED = N && N.ED && N.ED.t || {};
 const n = { done: 0, kept: 0 };
 function apply() {
  Wn.RL_COL25.forEach(t => {
   const m = M[t.id]; if (!m) return;
   const full = title(m[0]) + (t.nick ? ' ' + t.nick : ''), icon = N && N.glyph ? N.glyph(m[0]) : t.icon;
   try { if (N && N.D && N.D.T) N.D.T[t.id] = Object.assign({}, N.D.T[t.id] || {}, { n: m[0], f: full, a: m[1], i: icon }); } catch (e) {}
   try { if (N && N.DEF && N.DEF.teams && N.DEF.teams[t.id]) { N.DEF.teams[t.id].name = m[0]; N.DEF.teams[t.id].abbr = m[1]; } } catch (e) {}
   if (ED[t.id]) { n.kept++; return; } // the player's own name for this team stays
   t.name = m[0]; t.full = full; t.abbr = m[1]; if (icon) t.icon = icon; n.done++;
   try { const C = Wn.COL25 && COL25.TEAMS; if (C) C.forEach(x => { if (x && typeof x === 'object' && x.id === t.id && x !== t) { x.name = m[0]; x.full = full; x.abbr = m[1]; if (icon) x.icon = icon; } }); } catch (e) {}
   try { const T2 = typeof T === 'function' ? T(t.id) : null; if (T2 && T2 !== t && T2.id === t.id) { T2.name = m[0]; T2.full = full; T2.abbr = m[1]; if (icon) T2.icon = icon; } } catch (e) {}
  });
 }
 try { apply(); } catch (e) {}
 // the older passes also left text swaps ("LOUISVILLE" -> "DERBY CITY" ...) that would turn these names back: drop every swap
 // whose source is one of these names
 try { const NEW = new Set(Object.values(M).map(m => m[0])); if (N && N.D) { if (Array.isArray(N.D.X)) N.D.X = N.D.X.filter(x => !NEW.has(String(x[0] || '').toUpperCase())); const OT = N.D.OT || {}; Object.keys(OT).forEach(k => { OT[k] = (OT[k] || []).filter(o => !NEW.has(String(o).replace(/^~/, '').toUpperCase())); }); } } catch (e) {}
 try { if (N && typeof N.ready === 'function') N.ready(); } catch (e) {} // rebuild the text map (old names -> these), it was built with the old list
 Wn.COL600 = { M: M, n: n, apply: apply, NEW: new Set(Object.values(M).map(m => m[0])) };
})();
