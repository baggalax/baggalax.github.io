var __x=self.__x||(self.__x=(function(){var c=Object.create(null);return function(s){var v=c[s];if(v===undefined){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);v=c[s]=new TextDecoder().decode(u);}return v;};})());
(function() {
 'use strict';
 if (window.__rl_no38art || window.__rl_v124gb) return;
 const V = window.V38ART = {
  on: true,
  log: []
 };
 const COLORS = {
  red: 'RED',
  green: 'GREEN',
  blue: 'BLUE',
  yellow: 'YELLOW',
  purple: 'PURPLE'
 };
 const L = window.__v38crewLook;
 if (L) {
  if (L.trainer_1) L.trainer_1 = Object.assign({}, L.trainer_1, {
   h: '#3a2a1a',
   acc: 'flask38'
  });
  if (L.speed_1) L.speed_1 = Object.assign({}, L.speed_1, {
   T: '#d62828',
   P: '#f4f4f4',
   B: '#f4f4f4',
   acc: 'armsup38'
  });
 }
 V.acc = function(acc, p, r, clr, look) {
  switch (acc) {
  case 'flask38':
   r(12, 6, 1, 1, '#d8eef2');
   r(11, 7, 3, 3, '#d8eef2');
   r(11, 8, 3, 2, '#5fe85a');
   p(12, 4, '#b6ffb0');
   p(13, 2, '#b6ffb0');
   p(11, 3, '#b6ffb0');
   r(4, 0, 6, 1, '#2a1c10');
   break;

  case 'armsup38':
   {
    const s = look.s, T = look.T;
    clr(2, 8, 1, 3);
    clr(11, 8, 1, 3);
    r(2, 6, 1, 2, T);
    r(11, 6, 1, 2, T);
    r(1, 1, 1, 6, s);
    r(12, 1, 1, 6, s);
    p(1, 0, s);
    p(12, 0, s);
    r(4, 9, 6, 1, '#f4f4f4');
    r(4, 12, 6, 1, '#d62828');
    break;
   }
  }
 };
 function texts() {
  const BY = window.V17 && V17.BY;
  if (!BY) return false;
  const doc = BY.crew_trainer_1, bolt = BY.crew_speed_1;
  if (doc) {
   doc.outfit = 'SHORT DARK HAIR, LAB COAT, BUBBLING FLASK';
   doc.d = String(doc.d || '').replace(/WILD WHITE HAIR/g, 'SHORT DARK HAIR');
  }
  if (bolt) {
   bolt.outfit = 'RED + WHITE SPRINT KIT, SPIKES, ARMS-UP POSE';
   bolt.d = String(bolt.d || '').replace(/GOLD \+ GREEN SPRINT KIT, SPIKES, FINGER-POINT POSE/g, 'RED + WHITE SPRINT KIT, SPIKES, ARMS-UP POSE');
  }
  for (const k in COLORS) {
   const it = BY[__x("c2FiZXJf") + k];
   if (it) {
    it.n = __x("VFdJRyBTQUJFUiAo") + COLORS[k] + ')';
    it.d = 'A GLOWING STICK. NEVER BREAKS.';
   }
  }
  return true;
 }
 V.texts = texts;
 const NL = {
  [__x("bGVnX2dhcnJ5")]: 'AN OLD-SCHOOL LEGEND FROM BACK IN THE DAY.',
  [__x("bGVnX2Jyb3du")]: 'BUILT LIKE A TRUCK, FAST AS A DEER, WITH A CANNON FOR A SHOT.',
  [__x("bGVnX3BpZXRyYW1hbGE=")]: 'A LOCKDOWN POLE FROM BACK IN THE DAY.',
  stick_yinyang: 'LESS LIKELY TO BREAK.',
  stick_candycane: 'LESS LIKELY TO BREAK.',
  stick_cottoncandy: 'LESS LIKELY TO BREAK.',
  stick_spooky: 'HALLOWEEN PACK. LESS LIKELY TO BREAK.',
  stick_pencil: 'LESS LIKELY TO BREAK.',
  fo_fogo: 'A FACEOFF STICK. FOGO ONLY: FASTER FACEOFF TAPS.',
  fo_stallion: 'A FACEOFF STICK. BIGGER TAP-SPEED BOOST.',
  fo_warp: 'A FACEOFF STICK. THE BIGGEST TAP BOOST.',
  [__x("c2FiZXJfcmVk")]: 'NEVER BREAKS.',
  [__x("c2FiZXJfZ3JlZW4=")]: 'NEVER BREAKS.',
  [__x("c2FiZXJfYmx1ZQ==")]: 'NEVER BREAKS.',
  [__x("c2FiZXJfeWVsbG93")]: 'NEVER BREAKS.',
  [__x("c2FiZXJfcHVycGxl")]: 'NEVER BREAKS.'
 };
 V.nolooks = [];
 function noLooks() {
  const BY = window.V17 && V17.BY;
  if (!BY || window.__rl_no38artnl) return false;
  for (const id in BY) {
   const it = BY[id];
   if (!it) continue;
   let d = null;
   if (it.sec === 'crew' && it.crew) {
    const m = /^([^.]*\.)/.exec(String(it.d || ''));
    if (m) d = m[1];
   } else if (NL[id]) d = NL[id];
   if (d != null && d !== it.d) {
    V.nolooks.push([ id, it.d, d ]);
    it.d = d;
   }
   if (it.sec === 'crew' && it.outfit) it.outfit = '';
  }
  return true;
 }
 V.noLooks = noLooks;
 const swap = s => String(s).replace(new RegExp(__x("VEhFIFNBQkVS"),"g"), __x("VFdJRyBTQUJFUg=="));
 V.swap = swap;
 function hookHelp() {
  if (typeof PANEL_RENDER === 'undefined' || !PANEL_RENDER.help17 || PANEL_RENDER.help17.__v38art) return;
  const H0 = PANEL_RENDER.help17, H1 = function() {
   return swap(H0.apply(this, arguments));
  };
  H1.__v38art = true;
  PANEL_RENDER.help17 = H1;
 }
 try {
  texts();
 } catch (e) {
  console.error(e);
 }
 try {
  hookHelp();
 } catch (e) {
  console.error(e);
 }
 try {
  noLooks();
 } catch (e) {
  console.error(e);
 }
})();
