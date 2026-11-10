/* v481tutkeys.js - Bagga Lax: tutorial + hint text follows the computer controls (V41.3.x / 1.2, ?v=4081).
   Charlie (Nov 9 2026, 10:10 PM): on a computer even the 1.2 beta still said "SWIPE", "THUMB", "TAP"... in tutorials and tips.
   v468ctl.js already swaps ~57 tutorial lines, but only while game.tutorial is on. This file covers the rest, everywhere the
   game draws text (practice drills, coach tips, shot / dodge / faceoff hints, playmaker help, menus' "TAP TO GO ON"):
     1) EX: exact lines rewritten by hand for the keyboard (keys = the player's own binds from CONTROLS > KEYS) and the controller.
     2) v468ctl's own tutorial map, reused for the same lines outside the tutorial.
     3) RULES: phrase rules for anything left (LEFT THUMB -> W A S D, TAP -> CLICK, SWIPE -> DRAG, ...), so no touch word is left.
   Computer scheme (Charlie, Nov 9 10:13 PM): W A S D = move, LEFT CLICK = shoot / pass, RIGHT CLICK + flick = dodge
   (v482roll.js), Q / E / R / F = split left / split right / swim / toe drag (v467 key binds), A+W style combo = roll.
   Touch (phones / tablets) is untouched: nothing changes unless v468ctl says the input in use is keyboard/mouse or a controller.
   The coach's answers are wrapped into lines by v4014coach, so window.drawHelp swaps V4014C.C.a for the call only.
   Kill switch: window.__rl_no481 = true. No storage, no net, no ids. Needs v468ctl.js (no-op without it). */
(function () {
 'use strict';
 if (window.__rl_no481) return;
 const off = () => !!window.__rl_no481;
 const S = () => window.__rl468;
 const CT = () => window.V468CTL;
 const ST = { n: 0, last: null, miss: new Set };
 function mode() {
  try { const s = S(); if (!s || !s.inputMode) return null; const m = s.inputMode(); return m === 'key' || m === 'pad' ? m : null; } catch (e) { return null; }
 }
 const KEYY = /\b(THUMBS?|SWIPE[SD]?|SWIPING|TAP|TAPPING|TOUCH THE GOAL|YOUR FINGERS?|QUICK TAP|LEFT STICK|RIGHT STICK|JOYSTICK)\b|\bTAP!/;
 const TOUCHY = /\b(THUMBS?|SWIPE[SD]?|SWIPING|TAP|TAPPING|TOUCH THE GOAL|FINGERS?|QUICK TAP)\b|\bTAP!/;
 function names() {
  const c = CT(); if (!c) return null;
  const b = c.kb(), p = c.pb(), K = c.keyName, P = c.padName;
  const MV = [ b.up, b.left, b.down, b.right ].map(K).join(' ');
  return { MV: MV, MVS: MV.replace(/ /g, '/'), SL: K(b.splitL), SR: K(b.splitR), SW: K(b.swim), TO: K(b.toe), CH: K(b.check), SP: K(b.foSet),
   PA: P(p.pass), SH: P(p.shoot), SWB: P(p.sw), CK: P(p.check), HT: P(p.hit), FS: P(p.foSet),
   ROLL: (window.V482ROLL && V482ROLL.on()) ? V482ROLL.hint() : null,
   ROLLS: (window.V482ROLL && V482ROLL.on()) ? V482ROLL.hint(true) : null,
   RC: !!(window.V482ROLL && V482ROLL.on()) };
 }
 // ---- 1) exact lines ----
 function exMap(md, n) {
  const k = md === 'key', m = {};
  const e = (s, kv, pv) => { m[s] = k ? kv : pv; };
  // dodges: RIGHT CLICK + flick (v482roll) is the main computer dodge, the Q E R F keys (v467 binds) are the extras;
  // these also replace v468ctl's arrow-key / mouse wording for the same tutorial lines
  const DG = n.RC ? 'RIGHT CLICK + FLICK' : n.SL + ' / ' + n.SR;
  const SPL = n.RC ? 'RIGHT CLICK + FLICK (OR ' + n.SL + ' / ' + n.SR + ')' : n.SL + ' / ' + n.SR;
  const SWM = n.RC ? 'RIGHT CLICK + DRAW A BACKWARDS C (OR ' + n.SW + ')' : n.SW;
  const TOE = n.RC ? 'RIGHT CLICK + DRAW A C (OR ' + n.TO + ')' : n.TO;
  const ROLLK = n.ROLL ? 'RUN, THEN ' + n.ROLL + ' = ROLL DODGE.' : 'RUN, THEN DRAG A C WITH THE MOUSE (LEFT SIDE) = ROLL DODGE.';
  const ROLLB = n.ROLL ? 'RUN, THEN ' + n.ROLL + ' = ROLL AND TURN BACK.' : 'RUN, THEN DRAG A C WITH THE MOUSE ON THE LEFT SIDE = ROLL BACK.';
  e('RUN WITH YOUR LEFT THUMB, THEN DRAW A C WITH IT = ROLL AND TURN BACK.', ROLLB, 'RUN, THEN DRAW A C WITH THE RIGHT STICK = ROLL / SWIM / TOE.');
  e('RUN, THEN DRAW A HALF CIRCLE WITH THE LEFT STICK = ROLL DODGE.', ROLLK, 'RUN, THEN DRAW A HALF CIRCLE WITH THE RIGHT STICK = ROLL / SWIM / TOE.');
  e('ROLL IS LEFT STICK ONLY NOW: RUN, THEN DRAW A C WITH THE LEFT STICK.', ROLLK, 'ROLL: RUN, THEN DRAW A C WITH THE RIGHT STICK (SWIM / TOE OFF).');
  e('DRAW A C ON THE RIGHT SIDE = ROLL DODGE THE WAY YOU CURVE.', ROLLK, 'RIGHT STICK: DRAW A C = ROLL / SWIM / TOE.');
  e('DRAW A C ON THE RIGHT SIDE = ROLL THE WAY YOU CURVE.', ROLLK, 'RIGHT STICK: DRAW A C = ROLL / SWIM / TOE.');
  e('LEFT THUMB = MOVE. RUN, THEN SWIPE YOUR RIGHT THUMB ACROSS = DODGE.', n.MV + ' = MOVE. RUN, THEN ' + DG + ' = DODGE.', 'LEFT STICK = MOVE. RUN, THEN FLICK THE RIGHT STICK ACROSS = DODGE.');
  e('LEFT THUMB RUNS. RIGHT THUMB: SWIPE STRAIGHT ANY WAY = SPLIT DODGE.', n.MV + ' RUNS. ' + SPL + ' = SPLIT DODGE.', 'LEFT STICK RUNS. FLICK THE RIGHT STICK STRAIGHT = SPLIT DODGE.');
  e('LEFT THUMB RUNS. RIGHT THUMB: DRAW A BACKWARDS C = SWIM PAST HIM.', n.MV + ' RUNS. ' + SWM + ' = SWIM.', 'LEFT STICK RUNS. RIGHT STICK: BACKWARDS C = SWIM PAST HIM.');
  e('LEFT THUMB RUNS. RIGHT THUMB: DRAW A C = TOE DRAG PAST HIM.', n.MV + ' RUNS. ' + TOE + ' = TOE DRAG.', 'LEFT STICK RUNS. RIGHT STICK: C = TOE DRAG PAST HIM.');
  e('DRAW A C ON THE RIGHT SIDE = TOE DRAG TO YOUR OTHER HAND.', TOE + ' = TOE DRAG TO YOUR OTHER HAND.', 'RIGHT STICK C = TOE DRAG TO YOUR OTHER HAND.');
  e("SWIPE ON THE RIGHT SIDE TO DODGE - NOT NEAR THE GOAL OR YOU'LL SHOOT", 'RIGHT CLICK + FLICK = DODGE. LEFT CLICK = SHOOT / PASS.', 'FLICK THE RIGHT STICK TO DODGE.');
  e('SWIPE STRAIGHT ON THE RIGHT SIDE = ONE HAND. SWIPE AGAIN = TWO.', DG + ' STRAIGHT = ONE HAND. AGAIN = TWO.', 'FLICK THE RIGHT STICK STRAIGHT = SPLIT (ONE HAND: TOUCH / MOUSE).');
  e('WITH THE BALL: RUN, THEN PUSH THE LEFT STICK TO HIS LEFT OR RIGHT = SPLIT THAT WAY.', 'WITH THE BALL: RUN, THEN ' + SPL + ' = SPLIT THAT WAY.', null);
  e('LEFT THUMB = INVISIBLE JOYSTICK:', n.MV + ' = RUN:', 'LEFT STICK = RUN:');
  e('JOYSTICK: PUT YOUR LEFT THUMB DOWN + DRAG ANY WAY. LET GO TO STOP.', 'HOLD ' + n.MV + ' TO RUN. LEFT CLICK = SHOOT / PASS, RIGHT CLICK = DODGE.', null);
  e('PUT IT DOWN ANYWHERE + DRAG, HE', 'HOLD THE KEYS, HE', 'PUSH IT ANY WAY, HE');
  e('LEFT THUMB DOWN ANYWHERE + DRAG = HE RUNS. LET GO = STOP.', 'HOLD ' + n.MV + ' = HE RUNS. LET GO = STOP.', 'LEFT STICK = HE RUNS. LET GO = STOP.');
  e('RUN, THEN CUT YOUR THUMB HARD ANOTHER WAY = A DODGE (ANY ANGLE).', 'RUN, THEN ' + DG + ' = A DODGE (ANY ANGLE).', 'RUN, THEN FLICK THE RIGHT STICK = A DODGE (ANY ANGLE).');
  e('RUN, THEN CUT YOUR THUMB HARD ANOTHER WAY = A DODGE.', 'RUN, THEN ' + DG + ' = A DODGE.', 'RUN, THEN FLICK THE RIGHT STICK = A DODGE.');
  e('CUT YOUR THUMB HARD = A DODGE.', DG + ' = A DODGE.', 'FLICK THE RIGHT STICK = A DODGE.');
  e('WITH THE BALL: SWIPE STRAIGHT ON THE RIGHT SIDE = SPLIT DODGE THAT WAY.', 'WITH THE BALL: ' + SPL + ' = SPLIT DODGE THAT WAY.', 'WITH THE BALL: FLICK THE RIGHT STICK = SPLIT DODGE THAT WAY.');
  e('WITH THE BALL: SWIPE STRAIGHT ON THE RIGHT SIDE = SPLIT THAT WAY.', 'WITH THE BALL: ' + SPL + ' = SPLIT THAT WAY.', 'WITH THE BALL: FLICK THE RIGHT STICK = SPLIT THAT WAY.');
  e('WITH THE BALL: DRAW A BACKWARDS C ON THE RIGHT SIDE = SWIM PAST HIM.', 'WITH THE BALL: ' + SWM + ' = SWIM PAST HIM.', 'WITH THE BALL: RIGHT STICK BACKWARDS C = SWIM PAST HIM.');
  e('WITH THE BALL: DRAW A C ON THE RIGHT SIDE = TOE DRAG PAST HIM.', 'WITH THE BALL: ' + TOE + ' = TOE DRAG PAST HIM.', 'WITH THE BALL: RIGHT STICK C = TOE DRAG PAST HIM.');
  e('HOLD YOUR RIGHT THUMB DOWN TO BULL (DRIVES THROUGH HIM).', 'HOLD THE LEFT MOUSE DOWN ON THE RIGHT SIDE TO BULL (DRIVES THROUGH HIM).', 'BULL: HOLD THE RIGHT SIDE (TOUCH / MOUSE) - DRIVES THROUGH HIM.');
  e('HOLD YOUR RIGHT THUMB DOWN = BULL THROUGH HIM.', 'HOLD THE LEFT MOUSE DOWN ON THE RIGHT SIDE = BULL THROUGH HIM.', 'BULL: HOLD THE RIGHT SIDE (TOUCH / MOUSE).');
  e('RIGHT THUMB: SWIPE = DODGE', DG + ' = DODGE', 'RIGHT STICK: FLICK = DODGE');
  e('RIGHT THUMB: DRAW THE C', n.RC ? 'RIGHT CLICK: DRAW THE C' : n.SW + ' / ' + n.TO, 'RIGHT STICK: DRAW THE C');
  e('RIGHT: SWIPE', n.RC ? 'RIGHT CLICK: FLICK' : n.SL + ' / ' + n.SR, 'RIGHT STICK: FLICK');
  e('RIGHT THUMB: HOLD', 'LEFT MOUSE: HOLD', 'RIGHT SIDE: HOLD');
  e('RIGHT: TAP', 'TAP ' + n.CH, n.CK);
  e('RIGHT THUMB: -', 'MOUSE: -', 'RIGHT STICK: -');
  e('THUMB HERE', 'MOUSE HERE', 'STICK HERE');
  e('LEFT: RUN', n.MV + ': RUN', 'LEFT STICK: RUN');
  e('LEFT: GET ON HIM', n.MV + ': GET ON HIM', 'LEFT STICK: GET ON HIM');
  e('LEFT: RUN AT HIM', n.MV + ': RUN AT HIM', 'LEFT STICK: RUN AT HIM');
  e('SWIPE HIM', 'DRAG HIM', 'FLICK HIM');
  e('STOOD UP! GET A RUNNING START (LEFT THUMB) AND TRY AGAIN.', 'STOOD UP! GET A RUNNING START (' + n.MV + ') AND TRY AGAIN.', 'STOOD UP! GET A RUNNING START (LEFT STICK) AND TRY AGAIN.');
  e('YOU CAN STILL RUN WITH THE LEFT THUMB WHILE YOU AIM.', 'YOU CAN STILL RUN WITH ' + n.MV + ' WHILE YOU AIM.', 'YOU CAN STILL RUN WITH THE LEFT STICK WHILE YOU AIM.');
  // passing
  e('QUICK TAP A TEAMMATE TO PASS IT TO HIM.', 'CLICK A TEAMMATE TO PASS IT TO HIM.', 'LEFT STICK AT A TEAMMATE + ' + n.PA + ' = PASS.');
  e('QUICK TAP A TEAMMATE. GREEN RING = OPEN.', 'CLICK A TEAMMATE. GREEN RING = OPEN.', 'LEFT STICK AT A TEAMMATE + ' + n.PA + '. GREEN RING = OPEN.');
  e('TAP ANY TEAMMATE. GREEN RING = OPEN.', 'CLICK ANY TEAMMATE. GREEN RING = OPEN.', 'LEFT STICK AT A TEAMMATE + ' + n.PA + '. GREEN RING = OPEN.');
  e('TAP A TEAMMATE = A PASS', 'CLICK A TEAMMATE = A PASS', 'LEFT STICK + ' + n.PA + ' = A PASS');
  e('QUICK TAP = PASS. HOLD (RING FILLS) = PICK', 'CLICK = PASS. HOLD (RING FILLS) = PICK', n.PA + ' = PASS. HOLD A GUY (MOUSE) = PICK');
  e('HE HAS IT - DRAG HIM TO MOVE, TAP A TEAMMATE TO PASS', 'HE HAS IT - ' + n.MV + ' TO MOVE, CLICK A TEAMMATE TO PASS', 'HE HAS IT - LEFT STICK TO MOVE, ' + n.PA + ' TO PASS');
  e('GREEN RING = OPEN. OFF SCREEN? TAP HIS EDGE ARROW.', 'GREEN RING = OPEN. OFF SCREEN? CLICK HIS EDGE ARROW.', 'GREEN RING = OPEN. OFF SCREEN? POINT THE LEFT STICK AT HIM.');
  e('YOUR BALL: TAP AN OPEN TEAMMATE (GREEN RING) TO CLEAR IT.', 'YOUR BALL: CLICK AN OPEN TEAMMATE (GREEN RING) TO CLEAR IT.', 'YOUR BALL: LEFT STICK AT AN OPEN MATE + ' + n.PA + ' = CLEAR.');
  e('CLEARS: BEAT THEIR RIDE - TAP AN OPEN GUY, CARRY IT OVER MIDFIELD IN 10.', 'CLEARS: BEAT THEIR RIDE - CLICK AN OPEN GUY, CARRY IT OVER MIDFIELD IN 10.', 'CLEARS: BEAT THEIR RIDE - ' + n.PA + ' TO AN OPEN GUY, CARRY IT OVER MIDFIELD IN 10.');
  // shooting
  e('TOUCH THE GOAL, PULL YOUR THUMB BACK TO AIM, LET GO = SHOT.', 'CLICK THE GOAL, DRAG THE MOUSE BACK TO AIM, LET GO = SHOT.', 'HOLD ' + n.SH + ', RIGHT STICK AIMS, LET GO = SHOT.');
  e('1. PUT YOUR RIGHT THUMB ON THE GOAL.', '1. CLICK AND HOLD ON THE GOAL.', '1. HOLD ' + n.SH + ' (RIGHT STICK AIMS).');
  e('2. BRING YOUR THUMB BACK TO WHERE IT STARTED, THEN LET GO.', '2. BRING THE MOUSE BACK TO WHERE IT STARTED, THEN LET GO.', '2. BRING THE STICK BACK, THEN LET GO.');
  e('FACE DODGE: PULL BACK, THEN BRING YOUR THUMB BACK + LET GO', 'FACE DODGE: DRAG BACK, THEN BRING THE MOUSE BACK + LET GO', 'FACE DODGE: PULL BACK, BRING IT BACK + LET GO (TOUCH / MOUSE)');
  e('SHOOTING: TOUCH THE GOAL, PULL BACK, PUT THE LINE ON A CORNER, LET GO.', 'SHOOTING: CLICK THE GOAL, DRAG BACK, PUT THE LINE ON A CORNER, LET GO.', 'SHOOTING: HOLD ' + n.SH + ', RIGHT STICK PUTS THE LINE ON A CORNER, LET GO.');
  e('NOW: TOUCH THE GOAL, DRAG YOUR THUMB BACK, LET GO (DON\'T PUSH FORWARD)', 'NOW: CLICK THE GOAL, DRAG THE MOUSE BACK, LET GO (DON\'T PUSH FORWARD)', 'NOW: HOLD ' + n.SH + ', AIM WITH THE RIGHT STICK, LET GO');
  e('TOUCH THE GOAL WHERE YOU WANT IT:', 'CLICK THE GOAL WHERE YOU WANT IT:', 'HOLD ' + n.SH + ', AIM WITH THE RIGHT STICK:');
  e('CARRY IT UP FROM X TO GLE (BESIDE THE CAGE), TOUCH THE GOAL + PULL BACK = SHOOT.', 'CARRY IT UP FROM X TO GLE (BESIDE THE CAGE), CLICK THE GOAL + DRAG BACK = SHOOT.', 'CARRY IT UP FROM X TO GLE (BESIDE THE CAGE), HOLD ' + n.SH + ' + LET GO = SHOOT.');
  e('UP FROM X TO GLE, TOUCH THE GOAL + PULL BACK = OVER-THE-SHOULDER SHOT.', 'UP FROM X TO GLE, CLICK THE GOAL + DRAG BACK = OVER-THE-SHOULDER SHOT.', 'UP FROM X TO GLE, HOLD ' + n.SH + ' + LET GO = OVER-THE-SHOULDER SHOT.');
  // defense
  e('GET ON HIM (YELLOW DOTS) + TAP THE RIGHT SIDE. 3 CHECKS = IT POPS.', 'GET ON HIM (YELLOW DOTS) + TAP ' + n.CH + '. 3 CHECKS = IT POPS.', 'GET ON HIM (YELLOW DOTS) + ' + n.CK + '. 3 CHECKS = IT POPS.');
  e('GET ON HIM + TAP THE RIGHT SIDE. MIDDLE: 1 CHECK POPS IT. OUTSIDES: 2.', 'GET ON HIM + TAP ' + n.CH + '. MIDDLE: 1 CHECK POPS IT. OUTSIDES: 2.', 'GET ON HIM + ' + n.CK + '. MIDDLE: 1 CHECK POPS IT. OUTSIDES: 2.');
  e('RUN AT HIM, HOLD THE RIGHT SIDE, LET GO. LONGER RUN = HARDER.', 'RUN AT HIM, HOLD ' + n.CH + ', LET GO. LONGER RUN = HARDER.', 'RUN AT HIM, PRESS ' + n.HT + '. LONGER RUN = HARDER.');
  e('RUN AT THEIR GUY, HOLD THE RIGHT SIDE, LET GO = LEVEL HIM.', 'RUN AT THEIR GUY, HOLD ' + n.CH + ', LET GO = LEVEL HIM.', 'RUN AT THEIR GUY, PRESS ' + n.HT + ' = LEVEL HIM.');
  e('HOLD THE RIGHT SIDE, LET GO = YOU LEVEL HIM. LEGAL, NO FLAG.', 'HOLD ' + n.CH + ', LET GO = YOU LEVEL HIM. LEGAL, NO FLAG.', 'PRESS ' + n.HT + ' = YOU LEVEL HIM. LEGAL, NO FLAG.');
  e('LEFT THUMB = MOVE YOUR DEFENDER.', n.MV + ' = MOVE YOUR DEFENDER.', 'LEFT STICK = MOVE YOUR DEFENDER.');
  e('TAP ANY OF YOUR DEFENDERS = YOU CONTROL HIM.', 'CLICK ANY OF YOUR DEFENDERS = YOU CONTROL HIM.', n.SWB + ' = SWITCH (LEFT STICK POINTS AT WHO).');
  e('TAP TO SWITCH', 'CLICK TO SWITCH', n.SWB + ' = SWITCH');
  e('A TAP ON A GUY SWITCHES (NOT A CHECK) - ON GROUND BALLS TOO.', 'A CLICK ON A GUY SWITCHES (NOT A CHECK) - ON GROUND BALLS TOO.', n.SWB + ' SWITCHES (NOT A CHECK) - ON GROUND BALLS TOO.');
  e('YOU JUMP TO YOUR GUY CLOSEST TO IT - OR TAP ANY TEAMMATE TO TAKE HIM.', 'YOU JUMP TO YOUR GUY CLOSEST TO IT - OR CLICK ANY TEAMMATE TO TAKE HIM.', 'YOU JUMP TO YOUR GUY CLOSEST TO IT - OR ' + n.SWB + ' TO TAKE ANOTHER.');
  // faceoffs
  e('MASH! THEN SWIPE ON THE WHISTLE', 'MASH ' + n.SP + '! THEN ' + n.MVS + ' ON THE WHISTLE', 'MASH ' + n.FS + '! THEN LEFT STICK ON THE WHISTLE');
  e('SWIPE IN ANY DIRECTION!', 'PRESS ' + n.MVS + '!', 'PUSH THE LEFT STICK!');
  e('AFTER THE WHISTLE, SWIPE A DIRECTION TO PULL IT OUT TO YOURSELF.', 'AFTER THE WHISTLE, PRESS ' + n.MVS + ' TO PULL IT OUT TO YOURSELF.', 'AFTER THE WHISTLE, PUSH THE LEFT STICK TO PULL IT OUT TO YOURSELF.');
  e('AFTER THE WHISTLE: SWIPE A DIRECTION TO PULL THE BALL OUT.', 'AFTER THE WHISTLE: PRESS ' + n.MVS + ' TO PULL THE BALL OUT.', 'AFTER THE WHISTLE: PUSH THE LEFT STICK TO PULL THE BALL OUT.');
  e('HOLD A WING. AFTER THE WHISTLE, SWIPE A DIRECTION = POPS TO HIM.', 'PICK A WING (' + n.MV + '). AFTER THE WHISTLE, PULL TO HIM = POPS TO HIM.', 'PICK A WING (LEFT STICK). AFTER THE WHISTLE, PULL TO HIM = POPS TO HIM.');
  e('TAP DOWN, THEN HOLD A WING (RING FILLS). WIN IT = POPS TO HIM.', n.SP + ' = DOWN, THEN ' + n.MV + ' PICKS A WING. WIN IT = POPS TO HIM.', n.FS + ' = DOWN, THEN LEFT STICK PICKS A WING. WIN IT = POPS TO HIM.');
  e('DRAG YOUR WINGS + ATTACK, THEN TAP DOWN', n.MV + ' PICKS A GUY, ' + [ n.SL, n.SR, n.SW, n.TO ].join(' ') + ' MOVES HIM, ' + n.SP + ' = DOWN', 'LEFT STICK PICKS, RIGHT STICK MOVES, ' + n.FS + ' = DOWN');
  e('DRAG YOUR ATTACK + WINGS TO SET UP. THEN HOLD A WING TO PICK.', n.MV + ' PICKS A GUY, ' + [ n.SL, n.SR, n.SW, n.TO ].join(' ') + ' MOVES HIM. ' + n.MV + ' PICKS A WING.', 'LEFT STICK PICKS A GUY, RIGHT STICK MOVES HIM. LEFT STICK PICKS A WING.');
  e('DRAG A WING', 'PICK A WING: ' + n.MV, 'PICK A WING: LEFT STICK');
  e('DRAG AN ATTACKMAN', 'PICK AN ATTACKMAN: ' + n.MV, 'PICK AN ATTACKMAN: LEFT STICK');
  e('TAP DOWN', n.SP + ' = DOWN', n.FS + ' = DOWN');
  e('  > TAP DOWN', '  > ' + n.SP + ' = DOWN', '  > ' + n.FS + ' = DOWN');
  e('BRAVEHEART: 1 ON 1 - TAP DOWN', 'BRAVEHEART: 1 ON 1 - ' + n.SP + ' = DOWN', 'BRAVEHEART: 1 ON 1 - ' + n.FS + ' = DOWN');
  e('TAP!', n.SP + '!', n.FS + '!');
  e('TAP OR PUSH = CLAMP', n.SP + ' = CLAMP', n.FS + ' = CLAMP');
  e('THE BALL POPS OUT THE WAY YOU SWIPE.', 'THE BALL POPS OUT THE WAY YOU PULL (' + n.MVS + ').', 'THE BALL POPS OUT THE WAY YOU PUSH THE LEFT STICK.');
  e('TAP START (OR ANYWHERE) TO FACE OFF', 'CLICK START (OR ANYWHERE) TO FACE OFF', 'TAP / CLICK START TO FACE OFF');
  e('TAP TO START THE FACEOFF', 'CLICK TO START THE FACEOFF', 'TAP / CLICK TO START THE FACEOFF');
  e('HOLD, SWIPE, LET GO', 'CLICK, DRAG, LET GO', 'HOLD ' + n.SH + ', AIM, LET GO');
  e('PASSER PRO: TAP THE RIGHT SIDE TO HIT THE MATE YOU\'RE RUNNING AT.', 'PASSER PRO: CLICK THE FIELD TO HIT THE MATE YOU\'RE RUNNING AT.', null);
  e('LEFT THUMB: DRAW A C', n.ROLLS ? 'ROLL: ' + n.ROLLS : n.MV + ': DRAW A C', 'LEFT STICK: DRAW A C');
  e('LEFT THUMB: MOVE + DRAW THE C', n.ROLLS ? n.MV + ' + ' + n.ROLLS + ' = ROLL' : n.MV + ': MOVE + DRAW THE C', 'LEFT STICK: MOVE + DRAW THE C');
  e('LEFT THUMB: DRAG', n.MV + ': MOVE', 'LEFT STICK: MOVE');
  e('HOLD YOUR FINGER ON A GUY.', 'HOLD THE MOUSE ON A GUY.', 'HOLD A GUY (TOUCH / MOUSE).');
  e('RUN WITH YOUR LEFT THUMB, THEN DRAW A C WITH THAT SAME THUMB = ROLL DODGE. HE SPINS OFF HIS MAN. LEFT THUMB ONLY - A CURVE ON THE RIGHT IS A SWIM OR A TOE DRAG.',
    'RUN, THEN ' + (n.ROLL || 'DRAG A C WITH THE MOUSE ON THE LEFT SIDE') + ' = ROLL DODGE. HE SPINS OFF HIS MAN.' + (n.RC ? ' RIGHT CLICK + A LOOP ROLLS TOO.' : ''),
    'RUN, THEN DRAW A C WITH THE RIGHT STICK = ROLL DODGE. HE SPINS OFF HIS MAN.');
  e('ROLL DODGE: LEFT STICK ONLY NOW - RUN, THEN DRAW A C WITH YOUR LEFT THUMB. (A CURVE ON THE RIGHT SIDE IS A SWIM OR A TOE DRAG.)',
    'ROLL DODGE: RUN, THEN ' + (n.ROLL || 'DRAG A C WITH THE MOUSE ON THE LEFT SIDE') + '.' + (n.RC ? ' (RIGHT CLICK + A C = SWIM / TOE DRAG, A LOOP = ROLL.)' : ''),
    'ROLL DODGE: RUN, THEN DRAW A C WITH THE RIGHT STICK.');
  e('CREASE FINISHES: QUICK TAP A YELLOW CIRCLE', 'CREASE FINISHES: CLICK A YELLOW CIRCLE OR PRESS 1-4', null);
  e('QUICK TAP A CIRCLE = YOU FINISH IN THAT CORNER. NO PULL-BACK NEEDED.', 'CLICK A CIRCLE (OR KEYS 1 2 3 4) = YOU FINISH IN THAT CORNER. NO PULL-BACK NEEDED.', null);
  e('TAP A CIRCLE QUICKLY - NO PULL-BACK', 'CLICK A CIRCLE OR PRESS 1-4 - NO PULL-BACK', null);
  for (const s in m) if (m[s] == null) delete m[s];
  return m;
 }
 // ---- 3) phrase rules (whatever is left) ----
 function rules(md, n) {
  const k = md === 'key';
  const bull = s => /BULL/.test(s);
  const KEEP = { 'FACEOFF ': 1, 'BIGGEST ': 1, 'CHECK ': 1, 'TO ': 1, 'THEY ': 1, 'HE ': 1, 'MORE ': 1 };
  if (k) return [
   [ /\bTAP \/ CLICK\b/g, 'CLICK' ],
   [ /\bLEFT THUMB = INVISIBLE JOYSTICK\b/g, n.MV + ' = RUN' ],
   [ /\bPUT (?:YOUR )?LEFT THUMB DOWN ANYWHERE (?:\+|AND) DRAG\b/g, 'HOLD ' + n.MV ],
   [ /\b(?:DRAG )?(?:YOUR |THE )?LEFT THUMB(?: DOWN ANYWHERE)?(?: \+ DRAG)?\b/g, n.MV ],
   [ /\bFLICK (?:THE )?RIGHT STICK\b/g, 'RIGHT CLICK + FLICK' ],
   [ /\b(?:THE )?LEFT STICK\b/g, n.MV ],
   [ /\b(?:THE )?RIGHT STICK\b/g, n.RC ? 'RIGHT CLICK' : 'THE MOUSE' ],
   [ /\b(?:INVISIBLE )?JOYSTICK\b/g, n.MV ],
   [ /\bHOLD (?:YOUR |THE )?RIGHT THUMB(?: DOWN)?\b/g, 'HOLD THE LEFT MOUSE DOWN ON THE RIGHT SIDE' ],
   [ /\b(?:YOUR )?RIGHT THUMB: (?=DRAW|SWIPE)/g, n.RC ? 'RIGHT CLICK + ' : 'THE MOUSE: ' ],
   [ /\bSWIPE STRAIGHT ON THE RIGHT SIDE\b/g, n.RC ? 'RIGHT CLICK + FLICK' : n.SL + ' / ' + n.SR ],
   [ /\bDRAW A BACKWARDS C ON THE RIGHT SIDE\b/g, n.RC ? 'RIGHT CLICK + DRAW A BACKWARDS C' : 'PRESS ' + n.SW ],
   [ /\bDRAW A C ON THE RIGHT SIDE\b/g, n.RC ? 'RIGHT CLICK + DRAW A C' : 'PRESS ' + n.TO ],
   [ /\bSWIPE (?:YOUR )?RIGHT THUMB(?: ACROSS)?\b/g, n.RC ? 'RIGHT CLICK + FLICK' : n.SL + ' / ' + n.SR ],
   [ /(RIGHT CLICK \+ )SWIPE\b/g, '$1FLICK' ],
   [ /\bTAP (?:THE )?RIGHT SIDE\b/g, s => bull(s) ? 'CLICK THE RIGHT SIDE' : 'PRESS ' + n.CH ],
   [ /\bHOLD (?:THE )?RIGHT SIDE\b/g, s => bull(s) ? 'HOLD THE LEFT MOUSE ON THE RIGHT SIDE' : 'HOLD ' + n.CH ],
   [ /\bSWIPE (?:A|IN ANY) DIRECTION\b|\bSWIPE ANY WAY\b/g, 'PRESS ' + n.MVS ],
   [ /\bQUICK SWIPE\b/g, 'QUICK PULL' ],
   [ /\bTAP DOWN(?: \(LEFT SIDE\))?/g, 'PRESS ' + n.SP + ' (DOWN)' ],
   [ /\b(?:PUT )?(?:YOUR |THE )?THUMB ON THE BUTTON \(RIGHT SIDE\)/g, 'FINGER ON ' + n.SP ],
   [ /\bTOUCH THE GOAL\b/g, 'CLICK THE GOAL' ],
   [ /\bCUT YOUR THUMB HARD\b/g, n.RC ? 'RIGHT CLICK + FLICK' : 'PRESS ' + n.SL + ' / ' + n.SR ],
   [ /\b(?:YOUR |THE )?RIGHT THUMB\b/g, 'THE MOUSE' ],
   [ /\b(?:YOUR|A|THAT SAME) THUMB\b/g, 'THE MOUSE' ],
   [ /\bTHUMBS?\b/g, 'MOUSE' ],
   [ /\bYOUR FINGERS?\b/g, 'THE MOUSE' ],
   [ /\bQUICK TAP\b/g, 'CLICK' ],
   [ /\bTAP!/g, n.SP + '!' ],
   [ /\bTAPPING\b/g, 'CLICKING' ],
   [ /(^|[^-\w])([A-Z]+ )?TAP\b(?![-!])( SPEED| BOOST)?/g, (s, m0, pre, w, suf, off2) => { const nx = s.slice(off2 + m0.length); return (suf || (w && KEEP[w]) || nx.indexOf(' ' + n.CH) === 0 || nx.indexOf(' ' + n.SP) === 0) ? m0 : pre + (w || '') + 'CLICK'; } ],
   [ /\bSWIPED\b/g, 'DRAGGED' ], [ /\bSWIPING\b/g, 'DRAGGING' ], [ /\bSWIPES\b/g, 'DRAGS' ], [ /\bSWIPE\b/g, 'DRAG' ]
  ];
  return [
   [ /\bLEFT THUMB = INVISIBLE JOYSTICK\b/g, 'LEFT STICK = RUN' ],
   [ /\b(?:DRAG )?(?:YOUR |THE )?LEFT THUMB(?: DOWN ANYWHERE)?(?: \+ DRAG)?\b/g, 'LEFT STICK' ],
   [ /\bHOLD (?:YOUR |THE )?RIGHT THUMB(?: DOWN)?\b/g, 'HOLD THE RIGHT SIDE (TOUCH / MOUSE)' ],
   [ /\bSWIPE STRAIGHT ON THE RIGHT SIDE\b/g, 'FLICK THE RIGHT STICK' ],
   [ /\bDRAW A (BACKWARDS )?C ON THE RIGHT SIDE\b/g, (s, m0, b) => 'DRAW A ' + (b || '') + 'C WITH THE RIGHT STICK' ],
   [ /\bTAP THE RIGHT SIDE\b/g, s => bull(s) ? 'TAP THE RIGHT SIDE' : n.CK ],
   [ /\bHOLD THE RIGHT SIDE\b/g, s => bull(s) ? 'HOLD THE RIGHT SIDE (TOUCH / MOUSE)' : 'PRESS ' + n.HT ],
   [ /\bSWIPE (?:A|IN ANY) DIRECTION\b/g, 'PUSH THE LEFT STICK' ],
   [ /\bTOUCH THE GOAL\b/g, 'HOLD ' + n.SH ],
   [ /\bCUT YOUR THUMB HARD\b/g, 'FLICK THE RIGHT STICK' ],
   [ /\b(?:YOUR |THE )?RIGHT THUMB\b/g, 'RIGHT STICK' ],
   [ /\b(?:YOUR|A) THUMB\b/g, 'THE STICK' ],
   [ /\bTHUMBS?\b/g, 'STICK' ],
   [ /\bFINGERS?\b/g, 'HAND' ],
   [ /\bQUICK TAP A TEAMMATE\b/g, 'LEFT STICK AT A TEAMMATE + ' + n.PA ],
   [ /\bTAP!/g, n.FS + '!' ],
   [ /\bSWIPED\b/g, 'FLICKED' ], [ /\bSWIPES\b/g, 'FLICKS' ], [ /\bSWIPE\b/g, 'FLICK' ]
  ];
 }
 const TT = { ver: '', ex: null, rules: null, cache: new Map };
 function prep(md) {
  const n = names(); if (!n) return false;
  const ver = md + JSON.stringify(n);
  if (TT.ver !== ver) { TT.ver = ver; TT.ex = exMap(md, n); TT.rules = rules(md, n); TT.cache.clear(); }
  return true;
 }
 // v468ctl's map only answers while game.tutorial is on; ask it with the flag on for this one synchronous call
 function via468(s) {
  const st = S(); if (!st || typeof st.trTut !== 'function') return s;
  let G = null; try { G = game; } catch (e) {}
  if (!G) return s;
  if (G.tutorial) return st.trTut(s);
  G.tutorial = { v481: true };
  try { return st.trTut(s); } finally { G.tutorial = null; }
 }
 function tr(s) {
  if (typeof s !== 'string' || off()) return s;
  try { const st = S(); if (st && st.open) return s; } catch (e) {}   // the CONTROLS panel writes its own words per input
  const md = mode(); if (!md || !prep(md)) return s;
  let r = TT.cache.get(s);
  if (r !== undefined) return r;
  r = TT.ex[s];
  if (r == null && !(md === 'key' ? KEYY : TOUCHY).test(s)) { if (TT.cache.size > 2000) TT.cache.clear(); TT.cache.set(s, s); return s; }
  if (r == null) {
   r = via468(s);
   if (r === s || (md === 'key' ? KEYY : TOUCHY).test(r)) {
    let x = r;
    for (const [ re, to ] of TT.rules) x = x.replace(re, typeof to === 'function' ? (...a) => to(x, ...a) : to);
    r = x;
   }
  }
  if ((md === 'key' ? KEYY : TOUCHY).test(r)) ST.miss.add(s);
  ST.n++; ST.last = [ s, r ];
  if (TT.cache.size > 2000) TT.cache.clear();
  TT.cache.set(s, r);
  return r;
 }
 // ---- hooks: outermost text()/textW() (after v468ctl), and the coach's pre-wrapped answer ----
 function hook() {
  const T0 = window.text, W0 = window.textW;
  if (typeof T0 !== 'function' || typeof W0 !== 'function') return;
  window.text = function (s) { if (typeof s === 'string') { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return T0.apply(this, b); } } return T0.apply(this, arguments); };
  window.textW = function (s) { if (typeof s === 'string') { const r = tr(s); if (r !== s) { const b = Array.from(arguments); b[0] = r; return W0.apply(this, b); } } return W0.apply(this, arguments); };
  const DH = window.drawHelp;
  if (typeof DH === 'function') {
   window.drawHelp = function () {
    const C = window.V4014C && V4014C.C;
    if (!C || typeof C.a !== 'string' || off()) return DH.apply(this, arguments);
    const a = C.a, q = C.q, ra = tr(a), rq = typeof q === 'string' ? tr(q) : q;
    if (ra === a && rq === q) return DH.apply(this, arguments);
    C.a = ra; if (typeof q === 'string') C.q = rq;
    try { return DH.apply(this, arguments); } finally { if (C.a === ra) C.a = a; if (typeof q === 'string' && C.q === rq) C.q = q; }
   };
  }
 }
 hook();
 window.V481TUT = { on: () => !off(), tr: tr, mode: mode, st: ST, ex: () => (prep(mode() || 'key'), TT.ex) };
})();
