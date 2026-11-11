const RL12 = (() => {
 const FR = {
  idle: [ 7, 23, [ 8, -20 ], [ "..............MMM.", "..............MmM.", ".....ooooo...MmnmM", "...ooHHHHwoo.MnmnM", "..oHHHHHHHHwoMmnmM", ".ohHHHHHHHHHHoMmM.", ".ohHHHHHHHooooMMM.", "ohhhHHHHoZcSccoX..", "oohhhhHoSSccSccX..", "..oooooSSScSccoX..", "....ooooCCCCCo.X..", "...oJJJJooooo.X...", "..ojJJJJJjjjjjGG..", "..ojJJJjJJJJo.gG..", "..ojJJJJjjJJo.X...", "..ojjjjjjjjjo.X...", "..ojJJJJJJJJjGG...", "..ojJJJjJJJJogG...", "..oJJJJoJJJJoX....", "..oJJJJoJJJJoX....", "...ooSSossoo.X....", "....oWWovvo.......", "....oKKKKKKo......", ".....oooooo......." ] ],
  run0: [ 7, 22, [ 11, -19 ], [ "..................MM.", "......ooooo......MmnM", "....ooHHHHwoo...MmnmM", "...oHHHHHHHHwo..MnmnM", "..ohHHHHHHHHHHo.MmnmM", "..ohHHHHHHHoooooMnmM.", ".ohhhHHHHoZcScco.MM..", ".oohhhhHoSSccSccX....", "...oooooSSScSccoX....", ".....ooooCCCCCoX.....", "....oJJJJooooo.X.....", "...ojJJJJJjjjjjGG....", "..ojJJJjjJJJoXgG.....", "..ojJJJJJjjJoX.......", "..ojjjjjjjjjGG.......", "..ojJJJJJJJJgG.......", "..ojJJJjJJJJX........", ".oJJJJooJJJXo........", "oJJJJo..oJJXJo.......", ".oSSo....osso........", "oWWo......ovvo.......", "oKKKo.....oKKKo......", ".ooo.......ooo......." ] ],
  run1: [ 6, 23, [ 11, -20 ], [ ".................MM.", ".....ooooo......MmnM", "...ooHHHHwoo...MmnmM", "..oHHHHHHHHwo..MnmnM", ".ohHHHHHHHHHHo.MmnmM", ".ohHHHHHHHoooooMnmM.", "ohhhHHHHoZcScco.MM..", "oohhhhHoSSccSccX....", "..oooooSSScSccoX....", "....ooooCCCCCoX.....", "...oJJJJooooo.X.....", "..ojJJJJJjjjjjGG....", "..ojJJJjjJJJoXgG....", ".ojJJJJJjjJoX.......", ".ojjjjjjjjjGG.......", ".ojJJJJJJJJgG.......", ".ojJJJjJJJJX........", ".oJJJJoJJJXo........", ".oJJJJoJJJXo........", "..ooSSossoo.........", "..oSSo.osso.........", "..oWWo.ovvo.........", "..oKKKooKKKo........", "...ooo..ooo........." ] ],
  run2: [ 6, 22, [ 11, -19 ], [ ".................MM.", ".....ooooo......MmnM", "...ooHHHHwoo...MmnmM", "..oHHHHHHHHwo..MnmnM", ".ohHHHHHHHHHHo.MmnmM", ".ohHHHHHHHoooooMnmM.", "ohhhHHHHoZcScco.MM..", "oohhhhHoSSccSccX....", "..oooooSSScSccoX....", "....ooooCCCCCoX.....", "...oJJJJooooo.X.....", "..ojJJJJJjjjjjGG....", ".ojJJJjjJJJoXgG.....", ".ojJJJJJjjJoX.......", ".ojjjjjjjjjGG.......", ".ojJJJJJJJJgG.......", ".ojJJJjJJJJX........", ".oJJJJoJJJXo........", "oJJJJooJJJXo........", ".oossooSSoo.........", ".ovvo..oWWo.........", ".oKKKo.oKKKo........", "..ooo...ooo........." ] ],
  run3: [ 6, 23, [ 11, -20 ], [ ".................MM.", ".....ooooo......MmnM", "...ooHHHHwoo...MmnmM", "..oHHHHHHHHwo..MnmnM", ".ohHHHHHHHHHHo.MmnmM", ".ohHHHHHHHoooooMnmM.", "ohhhHHHHoZcScco.MM..", "oohhhhHoSSccSccX....", "..oooooSSScSccoX....", "....ooooCCCCCoX.....", "...oJJJJooooo.X.....", "..ojJJJJJjjjjjGG....", "..ojJJJjjJJJoXgG....", ".ojJJJJJjjJoX.......", ".ojjjjjjjjjGG.......", ".ojJJJJJJJJgG.......", ".ojJJJjJJJJX........", ".oJJJJoJJJXo........", ".oJJJJoJJJXo........", "..ooossoooo.........", "...ossSSo...........", "...ovvWWo...........", "...oKKKKKo..........", "....ooooo..........." ] ],
  cradle0: [ 7, 26, [ 6, -23 ], [ "............MM...", "...........MnmM..", "...........MmnmM.", "...........MnmnM.", "...........MmnmM.", "......ooooo.MmnM.", "....ooHHHHwooMM..", "...oHHHHHHHHwoX..", "..ohHHHHHHHHHHX..", "..ohHHHHHHHoooXoo", ".ohhhHHHHoZcScXo.", ".oohhhhHoSSccXcco", "...oooooSSScSXco.", ".....ooooCCCCGG..", "....oJJJJoojjgG..", "...ojJJJJJjJJX...", "..ojJJJjjJJJX....", "..ojJJJJJjGGX....", "..ojjjjjjjgGo....", "..ojJJJJJJJXo....", "..ojJJJjJJJXo....", ".oJJJJooJJJXo....", "oJJJJo..oJJJJo...", ".oSSo....osso....", "oWWo......ovvo...", "oKKKo.....oKKKo..", ".ooo.......ooo..." ] ],
  cradle1: [ 6, 27, [ 8, -24 ], [ ".............MMM.", ".............MmM.", "............MmnmM", "............MnmnM", "............MmnmM", ".....ooooo...MmM.", "...ooHHHHwoo.MMM.", "..oHHHHHHHHwo.X..", ".ohHHHHHHHHHHoX..", ".ohHHHHHHHoooXoo.", "ohhhHHHHoZcScXo..", "oohhhhHoSSccSXco.", "..oooooSSScScXo..", "....ooooCCCCGG...", "...oJJJJoojjgG...", "..ojJJJJJjJJX....", "..ojJJJjjJJXo....", ".ojJJJJJjGGo.....", ".ojjjjjjjgGo.....", ".ojJJJJJJJXo.....", ".ojJJJjJJXJo.....", ".oJJJJoJJXJo.....", ".oJJJJoJJJJo.....", "..ooSSossoo......", "..oSSo.osso......", "..oWWo.ovvo......", "..oKKKooKKKo.....", "...ooo..ooo......" ] ],
  cradle2: [ 6, 25, [ 10, -22 ], [ "................MM.", "...............MmnM", "..............MmnmM", "..............MnmnM", ".....ooooo....MmnmM", "...ooHHHHwoo..MnmM.", "..oHHHHHHHHwo..MM..", ".ohHHHHHHHHHHo.X...", ".ohHHHHHHHoooooX...", "ohhhHHHHoZcSccX....", "oohhhhHoSSccScXo...", "..oooooSSScScXo....", "....ooooCCCCGG.....", "...oJJJJoojjgG.....", "..ojJJJJJjJJX......", ".ojJJJjjJJXo.......", ".ojJJJJJjGGo.......", ".ojjjjjjjgGo.......", ".ojJJJJJJXJo.......", ".ojJJJjJXJJo.......", ".oJJJJoJXJJo.......", "oJJJJooJJJJo.......", ".oossooSSoo........", ".ovvo..oWWo........", ".oKKKo.oKKKo.......", "..ooo...ooo........" ] ],
  cradle3: [ 6, 27, [ 8, -24 ], [ ".............MMM.", ".............MmM.", "............MmnmM", "............MnmnM", "............MmnmM", ".....ooooo...MmM.", "...ooHHHHwoo.MMM.", "..oHHHHHHHHwo.X..", ".ohHHHHHHHHHHoX..", ".ohHHHHHHHoooXoo.", "ohhhHHHHoZcScXo..", "oohhhhHoSSccSXco.", "..oooooSSScScXo..", "....ooooCCCCGG...", "...oJJJJoojjgG...", "..ojJJJJJjJJX....", "..ojJJJjjJJXo....", ".ojJJJJJjGGo.....", ".ojjjjjjjgGo.....", ".ojJJJJJJJXo.....", ".ojJJJjJJXJo.....", ".oJJJJoJJXJo.....", ".oJJJJoJJJJo.....", "..ooossoooo......", "...ossSSo........", "...ovvWWo........", "...oKKKKKo.......", "....ooooo........" ] ],
  shoot0: [ 13, 22, [ -10, -20 ], [ ".MMMM................", "MnmnmM...ooooo.......", ".MnmnM.ooHHHHwoo.....", ".MmnmnMHHHHHHHHwo....", "..MMMMhHHHHHHHHHHo...", ".....oXHHHHHHHoooooo.", "....ohhXHHHHoZcScco..", "....oohhXhHoSSccScco.", ".......ooXooSSScScco.", ".........oGGoCCCCCo..", "........oJgGjjoooo...", ".......ojJJJXJjJJo...", ".......ojJJJGGJJJo...", ".......ojJJJgGJJJo...", ".......ojjjjjjXjjo...", ".......ojJJJJJJXJo...", ".......ojJJJjJJJJo...", ".......oJJJJooJJJJo..", "......oJJJJo..oJJJJo.", ".......oSSo....osso..", "......oWWo......ovvo.", "......oKKKo.....oKKKo", ".......ooo.......ooo." ] ],
  shoot1: [ 7, 21, [ 15, -15 ], [ "........ooooo.............", "......ooHHHHwoo...........", ".....oHHHHHHHHwo..........", "....ohHHHHHHHHHHo.........", "....ohHHHHHHHoooooo...MMMM", "..ohhhHHHHoZcScco...MmnmnM", "..oohhhhHoSSccScco.MmnmnmM", "....oooooSSScScco..MnmnmM.", "......ooooCCCCCo..X.MMMM..", ".....oJJJJoooojjGG........", "....ojJJJJJjjjXXgG........", "....ojJJJjjjjXGG..........", "...ojJJJJJXXJgG...........", "...ojjjjjXjjjo............", "...ojJJJJJJJJo............", "...ojJJJjJJJJo............", "..oJJJJooJJJJo............", ".oJJJJo..oJJJJo...........", ".oSSo....osso.............", "oWWo......ovvo............", "oKKKo.....oKKKo...........", ".ooo.......ooo............" ] ],
  shoot2: [ 7, 21, [ 14, -4 ], [ "........ooooo............", "......ooHHHHwoo..........", ".....oHHHHHHHHwo.........", "....ohHHHHHHHHHHo........", "....ohHHHHHHHoooooo......", "..ohhhHHHHoZcScco........", "..oohhhhHoSSccScco.......", "....oooooSSScScco........", "......ooooCCCCCo.........", ".....oJJJJooooo..........", "....ojJJJJJjJJo..........", "....ojJJJjjXjjo..........", "...ojJJJJJjXXjj..........", "...ojjjjjjjjjGGGG........", "...ojJJJJJJJJgGgG........", "...ojJJJjJJJJo...X.MMMM..", "..oJJJJooJJJJo....MnmnmM.", ".oJJJJo..oJJJJo...MmnmnmM", ".oSSo....osso.....MmnmnM.", "oWWo......ovvo.....MMMM..", "oKKKo.....oKKKo..........", ".ooo.......ooo..........." ] ],
  check0: [ 8, 27, [ 3, -24 ], [ "..........MMM...", ".........MnmM...", ".........MmnmM..", ".........MnmnM..", ".........MmnmM..", "..........MmnM..", ".....oooooMMM...", "...ooHHHHwooX...", "..oHHHHHHHHwX...", ".ohHHHHHHHHHXo..", ".ohHHHHHHHooXooo", "ohhhHHHHoZcSXco.", "oohhhhHoSScGGcco", "..oooooSSScgGco.", "....ooooCCjXCo..", "...oJJJJooGGo...", "..ojJJJJjjgGo...", "...ojJJJjJJJXo..", "...ojJJJJJJJXo..", "...ojjjjjjjjXo..", "...ojJJJJJJJJo..", "...ojJJJjJJJJo..", "..oJJJJooJJJJo..", ".oJJJJo..oJJJJo.", "..oSSo....osso..", ".oWWo......ovvo.", ".oKKKo.....oKKKo", "..ooo.......ooo." ] ],
  check1: [ 7, 21, [ 15, -9 ], [ "........ooooo..............", "......ooHHHHwoo............", ".....oHHHHHHHHwo...........", "....ohHHHHHHHHHHo..........", "....ohHHHHHHHoooooo........", "..ohhhHHHHoZcScco..........", "..oohhhhHoSSccScco.........", "....oooooSSScScco..........", "......ooooCCCCCo...........", ".....oJJJJooooo............", "....ojJJJJJjjjjjjGG...MMMM.", "....ojJJJjjjjjjGGgG..MmnmnM", "...ojJJJJJXXXXgG...MmnmnmM.", "...ojjjjjjjjjoXXXXXMnmnmM..", "...ojJJJJJJJJo......MMMM...", "...ojJJJjJJJJo.............", "..oJJJJooJJJJo.............", ".oJJJJo..oJJJJo............", ".oSSo....osso..............", "oWWo......ovvo.............", "oKKKo.....oKKKo............", ".ooo.......ooo............." ] ],
  hit0: [ 7, 24, [ 11, -21 ], [ "..................MMM", "..................MmM", "................MmnmM", ".........ooooo..MnmnM", ".......ooHHHHwooMmnmM", "......oHHHHHHHHwoMmM.", ".....ohHHHHHHHHHHMMM.", "....ohHHHHHHHooooXo..", "...ohhhHHHHoZcSccX...", "...oohhhhHoSSccScXo..", ".....oooooSSScSccX...", ".......ooooCCCCCX....", ".....oJJJJooojjGG....", "....ojJJJJJjjJogG....", "....ojJJJjjjJJoX.....", "....ojJJJJJJjjGG.....", "....ojjjjjjjjjgG.....", "...ojJJJJJJJJX.......", "...ojJJJjJJJJX.......", "..oJJJJooJJJJX.......", ".oJJJJo..oJJJJo......", "..oSSo....osso.......", "oWWo......ovvo.......", "oKKKo.....oKKKo......", ".ooo.......ooo......." ] ],
  hit1: [ 7, 24, [ 16, -21 ], [ ".......................MMM.", ".......................MmnM", "......................MmnmM", ".............ooooo...MnmnM.", "...........ooHHHHwoo.MmnmM.", "..........oHHHHHHHHwoMnmM..", "........ohHHHHHHHHHHoMMM...", "........ohHHHHHHHooooXo....", ".......ohhhHHHHoZcSccX.....", "......oohhhhHoSSccScXo.....", "........oooooSSScSccX......", "..........ooooCCCCjGG......", "........oJJJJoojjogG.......", ".......ojJJJJJjJJo.X.......", ".......ojJJJjjjJJoX........", "......ojJJJJJJjjjGG........", "......ojjjjjjjjjogG........", ".....ojJJJJJJJJoX..........", ".....ojJJJjJJJJoX..........", "...ooJJJJoJJJJo.X..........", ".oJJJJoo.oJJJJo............", "..oSSo....osso.............", ".oWWo......ovvo............", "oKKKo.....oKKKo............", ".ooo.......ooo............." ] ],
  hitreact: [ 11, 27, [ -4, -24 ], [ ".....MM.........", ".....MnmM.......", ".....MmnmM......", ".....MnmnM......", ".....MmnmM......", "......MmnM......", "....ooooMM......", "..ooHHHHwXo.....", ".oHHHHHHHXwo....", ".ohHHHHHHHXHHo..", ".ohHHHHHHHXooooo", "ohhhHHHHoZXScco.", "oohhhhHoSSXcSGGo", "..oooooSSScXjgG.", ".....ooooCCGGCo.", "....oJJJJojgGo..", "...ojJJJJjjJXo..", "....ojJJJjJJJXo.", "....ojJJJJJJJXo.", "....ojjjjjjjjjo.", "....ojJJJJJJJJo.", "....ojJJJjJJJJo.", ".....oJJJJoJJJJo", ".....oJJJJoJJJJo", "......ooSSossoo.", "........oWWovvo.", "........oKKKKKKo", ".........oooooo." ] ],
  fall0: [ 15, 26, [ -12, -23 ], [ ".MM....................", ".MnmM..................", ".MmnmM.................", ".MnmnM.................", "..MmnmM................", "....MmnM...............", "...ooMMo...............", ".ooHHHHXoo.............", ".oHHHHHHXHwo...........", ".ohHHHHHHXHHHo.........", ".ohHHHHHHHXooooo.......", "ohhhHHHHoZXSGGo........", ".oohhhhHoSSXjgGco......", "....oooooSSGGjcco......", "......ooooCgGXCo.......", ".....oJJJJjojXo........", ".....ojJJJJjjJXo.......", "......ojJJJjJJJJo......", "......ojJJJJJJJJo......", "......ojjjjjjjjjo......", ".......ojJJJJJJJJo.....", ".......oJJJJojJJJJo....", "......oJJJJo.ooJJJJo...", ".......oSSo....osso....", ".......oWWo......ovvo..", "........oKKKo.....oKKKo", ".........ooo.......ooo." ] ],
  down: [ 18, 15, null, [ "....o.o...........................", "....ooco..........................", "...ooccco.........................", "..oHocScCoGGoooooo................", ".owHoScSCogGJjJJJJo.o.............", ".oHHocccCoJJJjJJJJooKo............", "owHHHZSSCoJJJjJJJJsvKo............", "oHHHHoSSCoJJJjJJJJsvKo............", "oHHHHHoSoJJJJjJjooooKo............", "oHHHHHHooJJJJjJJJJSWKo.......MMMM.", "oHHHHHhooJJJJjJJJJSWKo.....MMmnmnM", ".oHHHHhooJJJJjJJJJooo......MmnmnmM", ".oHHHhho.ojjjjGGJJo....XXXXMnmnmMM", "..ohhhho..oooogGoo.XXXX.....MMMM..", "...ooho...........................", ".....oo..........................." ] ],
  getup0: [ 7, 22, [ 8, -19 ], [ "..............MMM.", "..............MmM.", ".............MmnmM", ".............MnmnM", ".....ooooo...MmnmM", "...ooHHHHwoo..MmM.", "..oHHHHHHHHwo.MMM.", ".ohHHHHHHHHHHo.X..", ".ohHHHHHHHoooooX..", "ohhhHHHHoZcSccoX..", "oohhhhHoSSccSccX..", "..oooooSSScSccX...", "....ooooCCCCCjGG..", "...oJJJJooojj.gG..", "..ojJJJJJjjJo.X...", "..ojJJJjjjJJo.X...", "..ojJJJJJJjjjGG...", "..ojjjjjjjjjogG...", "..ojJJJJJJJJoX....", "...osssoSSoo.X....", "..oWWoooWWo.......", ".oKKKo.oKKKo......", "..ooo...ooo......." ] ],
  getup1: [ 6, 22, [ 11, -19 ], [ "................MMM.", "................MmnM", "......ooooo....MmnmM", "....ooHHHHwoo..MnmnM", "...oHHHHHHHHwo.MmnmM", "..ohHHHHHHHHHHoMnmM.", "..ohHHHHHHHoooooMMM.", ".ohhhHHHHoZcSccoX...", "oohhhhHoSSccSccX....", "..oooooSSScSccoX....", "....ooooCCCCCo.X....", "...oJJJJoooojjGG....", "..ojJJJJJjjjo.gG....", "..ojJJJjjJJJo.X.....", "..ojJJJJJjjjo.X.....", "..ojjjjjjjjjjGG.....", "..ojJJJJJJJJogG.....", ".oJJJJjJJJJoX.......", ".oJJJJoJJJJoX.......", "..ooSSossoo.X.......", "...oWWovvo..........", "...oKKKKKKo.........", "....oooooo.........." ] ],
  pole_idle: [ 7, 27, [ 13, -24 ], [ "....................MM.", "...................MmnM", "..................MmnmM", "..................MnmnM", "..................MmnmM", "..................MnmM.", ".....ooooo.........MM..", "...ooHHHHwoo......X....", "..oHHHHHHHHwo.....X....", ".ohHHHHHHHHHHo...X.....", ".ohHHHHHHHoooooo.X.....", "ohhhHHHHoZcScco.X......", "oohhhhHoSSccSccoX......", "..oooooSSScSccoX.......", "....ooooCCCCCo.X.......", "...oJJJJooooo..X.......", "..ojJJJJJjjjjjGG.......", "..ojJJJjJJJJo.gG.......", "..ojJJJJjJJJoX.........", "..ojjjjjjjjjoX.........", "..ojJJJJJJJjX..........", "..ojJJJjJJJJGG.........", "..oJJJJoJJJJgG.........", "..oJJJJoJJJXo..........", "...ooSSossoX...........", "....oWWovvX............", "....oKKKKKXo...........", ".....ooooXo............", ".........X............." ] ],
  pole_run0: [ 7, 21, [ 18, -19 ], [ "......ooooo.............MMMM.", "....ooHHHHwoo..........MmnmnM", "...oHHHHHHHHwo.........MnmnM.", "..ohHHHHHHHHHHo.......MnmnmM.", "..ohHHHHHHHoooooo......MMMM..", ".ohhhHHHHoZcScco......X......", ".oohhhhHoSSccScco....X.......", "...oooooSSScScco....X........", ".....ooooCCCCCo....X.........", "....oJJJJooooo....X..........", "...ojJJJJJjjjo...X...........", "..ojJJJjJJJJjjGG.............", "..ojJJJJjjJJo.gG.............", "..ojjjjjjjjjoX...............", "..ojJJJJJJJJGG...............", "..ojJJJjJJJXgG...............", ".oJJJJooJJXJo................", "oJJJJo..oXJJJo...............", ".oSSo...Xosso................", "oWWo......ovvo...............", "oKKKo.....oKKKo..............", ".ooo.......ooo..............." ] ],
  pole_run1: [ 6, 22, [ 18, -20 ], [ ".....ooooo.............MMMM.", "...ooHHHHwoo..........MmnmnM", "..oHHHHHHHHwo.........MnmnM.", ".ohHHHHHHHHHHo.......MnmnmM.", ".ohHHHHHHHoooooo......MMMM..", "ohhhHHHHoZcScco......X......", "oohhhhHoSSccScco....X.......", "..oooooSSScScco....X........", "....ooooCCCCCo....X.........", "...oJJJJooooo....X..........", "..ojJJJJJjjjo...X...........", "..ojJJJjJJJJjjGG............", ".ojJJJJjjJJo.gG.............", ".ojjjjjjjjjoX...............", ".ojJJJJJJJJGG...............", ".ojJJJjJJJXgG...............", ".oJJJJoJJXJo................", ".oJJJJoJXJJo................", "..ooSSoXsoo.................", "..oSSo.osso.................", "..oWWo.ovvo.................", "..oKKKooKKKo................", "...ooo..ooo................." ] ],
  pole_run2: [ 6, 21, [ 18, -19 ], [ ".....ooooo.............MMMM.", "...ooHHHHwoo..........MmnmnM", "..oHHHHHHHHwo.........MnmnM.", ".ohHHHHHHHHHHo.......MnmnmM.", ".ohHHHHHHHoooooo......MMMM..", "ohhhHHHHoZcScco......X......", "oohhhhHoSSccScco....X.......", "..oooooSSScScco....X........", "....ooooCCCCCo....X.........", "...oJJJJooooo....X..........", "..ojJJJJJjjjo...X...........", ".ojJJJjJJJJjjGG.............", ".ojJJJJjjJJo.gG.............", ".ojjjjjjjjjoX...............", ".ojJJJJJJJJGG...............", ".ojJJJjJJJXgG...............", ".oJJJJoJJXJo................", "oJJJJooJXJJo................", ".oossooXSoo.................", ".ovvo..oWWo.................", ".oKKKo.oKKKo................", "..ooo...ooo................." ] ],
  pole_run3: [ 6, 22, [ 18, -20 ], [ ".....ooooo.............MMMM.", "...ooHHHHwoo..........MmnmnM", "..oHHHHHHHHwo.........MnmnM.", ".ohHHHHHHHHHHo.......MnmnmM.", ".ohHHHHHHHoooooo......MMMM..", "ohhhHHHHoZcScco......X......", "oohhhhHoSSccScco....X.......", "..oooooSSScScco....X........", "....ooooCCCCCo....X.........", "...oJJJJooooo....X..........", "..ojJJJJJjjjo...X...........", "..ojJJJjJJJJjjGG............", ".ojJJJJjjJJo.gG.............", ".ojjjjjjjjjoX...............", ".ojJJJJJJJJGG...............", ".ojJJJjJJJXgG...............", ".oJJJJoJJXJo................", ".oJJJJoJXJJo................", "..ooossXooo.................", "...ossSSo...................", "...ovvWWo...................", "...oKKKKKo..................", "....ooooo..................." ] ],
  pole_check0: [ 8, 30, [ 6, -27 ], [ ".............MM..", ".............MmnM", "............MmnmM", "............MnmnM", "............MmnmM", "............MnmM.", ".............MM..", ".............X...", ".............X...", ".....ooooo...X...", "...ooHHHHwooX....", "..oHHHHHHHHwX....", ".ohHHHHHHHHHXo...", ".ohHHHHHHHooXooo.", "ohhhHHHHoZcXcco..", "oohhhhHoSScGGcco.", "..oooooSSScgGco..", "....ooooCCjXCo...", "...oJJJJooGGo....", "..ojJJJJjjgGo....", "...ojJJJjJJXJo...", "...ojJJJJJJXJo...", "...ojjjjjjXjjo...", "...ojJJJJJXJJo...", "...ojJJJjJXJJo...", "..oJJJJooJJJJo...", ".oJJJJo..oJJJJo..", "..oSSo....osso...", ".oWWo......ovvo..", ".oKKKo.....oKKKo.", "..ooo.......ooo.." ] ],
  pole_check1: [ 7, 21, [ 18, -6 ], [ "........ooooo................", "......ooHHHHwoo..............", ".....oHHHHHHHHwo.............", "....ohHHHHHHHHHHo............", "....ohHHHHHHHoooooo..........", "..ohhhHHHHoZcScco............", "..oohhhhHoSSccScco...........", "....oooooSSScScco............", "......ooooCCCCCo.............", ".....oJJJJooooo..............", "....ojJJJXXjjjjjjGG..........", "....ojJJJjjXXXjGGgG..........", "...ojJJJJJJJJXgGX............", "...ojjjjjjjjjo...XXX...MMMM..", "...ojJJJJJJJJo......XXMnmnmM.", "...ojJJJjJJJJo........MmnmnmM", "..oJJJJooJJJJo.........MmnmnM", ".oJJJJo..oJJJJo.........MMMM.", ".oSSo....osso................", "oWWo......ovvo...............", "oKKKo.....oKKKo..............", ".ooo.......ooo..............." ] ],
  pole_hit0: [ 7, 28, [ 15, -25 ], [ ".......................MM", ".....................MmnM", "....................MmnmM", "....................MnmnM", "....................MmnmM", "....................MnmM.", "....................MM...", ".........ooooo......X....", ".......ooHHHHwoo....X....", "......oHHHHHHHHwo..X.....", ".....ohHHHHHHHHHHo.X.....", "....ohHHHHHHHoooooX......", "...ohhhHHHHoZcSccX.......", "...oohhhhHoSSccScXo......", ".....oooooSSScSccX.......", ".......ooooCCCCCX........", ".....oJJJJooojjGG........", "....ojJJJJJjjJogG........", "....ojJJJjjjJJX..........", "....ojJJJJJJjjGG.........", "....ojjjjjjjjjgG.........", "...ojJJJJJJJXo...........", "...ojJJJjJJJXo...........", "..oJJJJooJJJXo...........", ".oJJJJo..oJXJJo..........", "..oSSo....oXso...........", "oWWo......ovvo...........", "oKKKo.....oKKKo..........", ".ooo.......ooo..........." ] ],
  pole_hit1: [ 7, 27, [ 20, -24 ], [ "............................MM.", "...........................MmnM", "..........................MmnmM", ".........................MnmnM.", ".........................MmnmM.", ".........................MnmM..", ".............ooooo.......MM....", "...........ooHHHHwoo.....X.....", "..........oHHHHHHHHwo....X.....", "........ohHHHHHHHHHHo..X.......", "........ohHHHHHHHooooooX.......", ".......ohhhHHHHoZcScco.X.......", "......oohhhhHoSSccSccX.........", "........oooooSSScSccoX.........", "..........ooooCCCCjGGX.........", "........oJJJJoojjogG...........", ".......ojJJJJJjJJo.X...........", ".......ojJJJjjjJJoX............", "......ojJJJJJJjjjGG............", "......ojjjjjjjjjogG............", ".....ojJJJJJJJJX...............", ".....ojJJJjJJJJX...............", "...ooJJJJoJJJJoX...............", ".oJJJJoo.oJJJXo................", "..oSSo....ossX.................", ".oWWo......ovvo................", "oKKKo.....oKKKo................", ".ooo.......ooo................." ] ],
  g_idle: [ 7, 26, [ 10, -21 ], [ "................MMMM..", "...............MnmnmM.", "..............MnmnmnM.", "..............MmnmnmnM", ".............MmnmnmnmM", ".....ooooo...MnmnmnmnM", "...ooHHHHwoo.MmnmnmnmM", "..oHHHHHHHHwoMnmnmnmM.", ".ohHHHHHHHHHHoMnmnmnM.", ".ohHHHHHHHooooMmnmnM..", "ohhhHHHHoZcSccoMMMM...", "oohhhhHoSSccSccoX.....", "..oooooSSScScco.X.....", "....ooooCCCCCo.X......", "...oJJJJoooojjGG......", "..ojJJJJJjjjo.gG......", "..ojJJJjjJJJo..X......", "..ojJJJJJjjjo.X.......", "..ojjjjjjjjjjGG.......", "..ojJJJJJJJJogG.......", "..ojJJJjJJJJo.X.......", ".oJJJJooJJJJoX........", ".oJJJJooJJJJoX........", ".oSSoo..oosso.........", ".oWWo....ovvo.........", ".oKKKo...oKKKo........", "..ooo.....ooo........." ] ],
  g_move0: [ 7, 27, [ 10, -22 ], [ "................MMMM..", "...............MnmnmM.", "..............MnmnmnM.", "..............MmnmnmnM", ".............MmnmnmnmM", ".....ooooo...MnmnmnmnM", "...ooHHHHwoo.MmnmnmnmM", "..oHHHHHHHHwoMnmnmnmM.", ".ohHHHHHHHHHHoMnmnmnM.", ".ohHHHHHHHooooMmnmnM..", "ohhhHHHHoZcSccoMMMM...", "oohhhhHoSSccSccoX.....", "..oooooSSScScco.X.....", "....ooooCCCCCo.X......", "...oJJJJoooojjGG......", "..ojJJJJJjjjo.gG......", "..ojJJJjjJJJo..X......", "..ojJJJJJjjjo.X.......", "..ojjjjjjjjjjGG.......", "..ojJJJJJJJJogG.......", "..ojJJJjJJJJo.X.......", ".oJJJJooJJJJoX........", ".oJJJJooJJJJoX........", ".oSSoo..oosso.........", ".oSSo....osso.........", "oWWo......ovvo........", "oKKKo.....oKKKo.......", ".ooo.......ooo........" ] ],
  g_move1: [ 7, 26, [ 10, -21 ], [ "................MMMM..", "...............MnmnmM.", "..............MnmnmnM.", "..............MmnmnmnM", ".............MmnmnmnmM", ".....ooooo...MnmnmnmnM", "...ooHHHHwoo.MmnmnmnmM", "..oHHHHHHHHwoMnmnmnmM.", ".ohHHHHHHHHHHoMnmnmnM.", ".ohHHHHHHHooooMmnmnM..", "ohhhHHHHoZcSccoMMMM...", "oohhhhHoSSccSccoX.....", "..oooooSSScScco.X.....", "....ooooCCCCCo.X......", "...oJJJJoooojjGG......", "..ojJJJJJjjjo.gG......", "..ojJJJjjJJJo..X......", "..ojJJJJJjjjo.X.......", "..ojjjjjjjjjjGG.......", "..ojJJJJJJJJogG.......", "..ojJJJjJJJJo.X.......", "..oJJJJoJJJJoX........", "..oJJJJoJJJJoX........", "...ooSSossoo..........", "....oWWovvo...........", "....oKKKKKKo..........", ".....oooooo..........." ] ],
  g_save_high: [ 7, 31, [ 9, -26 ], [ "................MMMM.", "...............MnmnmM", ".............MnmnmnM.", ".............MmnmnmM.", "............MmnmnmnmM", "............MnmnmnmnM", "............MmnmnmnmM", ".............MmnmnmM.", ".............MnmnmnM.", "......ooooo..MmnmnM..", "....ooHHHHwoo.MMMM...", "...oHHHHHHHHwo..X....", "..ohHHHHHHHHHHo.X....", "..ohHHHHHHHooooXo....", ".ohhhHHHHoZcScGG.....", ".oohhhhHoSSccjgGo....", "...oooooSSScjccX.....", ".....ooooCCCjGG......", "....oJJJJoojjgG......", "...ojJJJJjjJJoX......", "...ojJJJjJJJJX.......", "..ojJJJJJJJJX........", "..ojjjjjjjjjo........", "..ojJJJJJJJJo........", "..ojJJJjJJJJo........", ".oJJJJooJJJJo........", ".oJJJJooJJJJo........", ".oSSoo..oosso........", ".oSSo....osso........", "oWWo......ovvo.......", "oKKKo.....oKKKo......", ".ooo.......ooo......." ] ],
  g_save_low: [ 7, 19, [ 13, -3 ], [ "........ooooo.............", "......ooHHHHwoo...........", ".....oHHHHHHHHwo..........", "...ohHHHHHHHHHHo..........", "...ohHHHHHHHoooooo........", "..ohhhHHHHoZcScco.........", "..oohhhhHoSSccScco........", "....oooooSSScScco.........", "......ooooCCCCCo..........", ".....oJJJJooooo...........", "...ojJJJJJjjjXX...........", "...ojJJJjjJJJjjXGG.MM.....", "...ojJJJJJjjjj..gGMmnMM...", "...ojjjjjjjjjojGGMmnmnmM..", "...ojJJJJJJJJo.gGMnmnmnmM.", "..oJJJJoooJJJJo..MmnmnmnmM", ".oSSoo...osso...MnmnmnmnM.", "oWWo......ovvo..MmnmnmnmM.", "oKKKo.....oKKKo..MmnmnmnM.", ".ooo.......ooo....MmnmnmM.", "...................MMnmM..", ".....................MM..." ] ],
  g_save_side: [ 7, 21, [ 17, -12 ], [ ".......ooooo..................", ".....ooHHHHwoo................", "....oHHHHHHHHwo...............", "...ohHHHHHHHHHHo..............", "...ohHHHHHHHoooooo............", "..ohhhHHHHoZcScco.......MMMM..", "..oohhhhHoSSccScco....MMmnmnMM", "...oooooSSScScco....MnmnmnmnmM", ".....ooooCCCCCo....MnmnmnmnmnM", "....oJJJJooooo.....MmnmnmnmnmM", "...ojJJJJJjjjjjjGGXMnmnmnmnmnM", "...ojJJJjjjjXXGGgG.MmnmnmnmnM.", "...ojJJJJJXXJogG....MMnmnmMM..", "...ojjjjjjjjjo........MMMM....", "...ojJJJJJJJJo................", "...ojJJJjJJJJo................", ".oJJJJooJJJJo.................", "oJJJJo..oJJJJo................", ".oSSo....osso.................", "oWWo......ovvo................", "oKKKo.....oKKKo...............", ".ooo.......ooo................" ] ],
  g_outlet0: [ 15, 25, [ -11, -21 ], [ ".MMMMM.................", "MmnmnmM................", "MnmnmnmM...............", "MmnmnmnmM..............", "MnmnmnmnM..ooooo.......", "MmnmnmnmMooHHHHwoo.....", ".MmnmnmnMHHHHHHHHwo....", "..MmnmnmMHHHHHHHHHHo...", "...MMMMMhXHHHHHHoooooo.", "......ohhhXHHHoZcScco..", "......oohhhXHoSSccScco.", ".........oooGGSSScScco.", "...........ogGjCCCCCo..", "..........oJJJXjoooo...", ".........ojJJJGGjJJo...", ".........ojJJJgGJJJo...", ".........ojJJJJJXJJo...", ".........ojjjjjjjXjo...", ".........ojJJJJJJJJo...", ".........ojJJJjJJJJo...", ".........oJJJJooJJJJo..", "........oJJJJo..oJJJJo.", ".........oSSo....osso..", "........oWWo......ovvo.", "........oKKKo.....oKKKo", ".........ooo.......ooo." ] ],
  g_outlet1: [ 7, 21, [ 17, -16 ], [ "........ooooo..................", "......ooHHHHwoo.........MMMMM..", ".....oHHHHHHHHwo......MMmnmnmM.", "....ohHHHHHHHHHHo....MnmnmnmnmM", "....ohHHHHHHHoooooo..MmnmnmnmnM", "..ohhhHHHHoZcScco..MmnmnmnmnmM.", "..oohhhhHoSSccScco.MnmnmnmnmM..", "....oooooSSScScco..MmnmnmnmnM..", "......ooooCCCCCo..X.MmnmnmMM...", ".....oJJJJoooojjGG...MMMMM.....", "....ojJJJJJjjjXXgG.............", "....ojJJJjjjjXGG...............", "...ojJJJJJXXJgG................", "...ojjjjjXjjjo.................", "...ojJJJJJJJJo.................", "...ojJJJjJJJJo.................", "..oJJJJooJJJJo.................", ".oJJJJo..oJJJJo................", ".oSSo....osso..................", "oWWo......ovvo.................", "oKKKo.....oKKKo................", ".ooo.......ooo................." ] ],
  g_chirp: [ 7, 32, [ 7, -27 ], [ ".............MMM...", "............MnmnM..", "...........MnmnmnM.", "...........MmnmnmM.", "..........MmnmnmnmM", "..........MnmnmnmnM", "..........MmnmnmnmM", "...........MmnmnmM.", "...........MnmnmnM.", "............MnmnM..", ".............MMM...", ".....ooooo....X....", "...ooHHHHwoo..X....", "..oHHHHHHHHwo.X....", ".ohHHHHHHHHHHGG....", ".ohHHHHHHHoojgGo...", "ohhhHHHHoZcSjXo....", "oohhhhHoSScjGGco...", "..oooooSSScjgGo....", "....ooooCCjCXo.....", "...oJJJJojjoX......", "..ojJJJJjjJJX......", "..ojJJJjJJJJo......", "..ojJJJJJJJJo......", "..ojjjjjjjjjo......", "..ojJJJJJJJJo......", "..ojJJJjJJJJo......", "..oJJJJoJJJJo......", "..oJJJJoJJJJo......", "...ooSSossoo.......", "....oWWovvo........", "....oKKKKKKo.......", ".....oooooo........" ] ],
  g_hitreact: [ 11, 29, [ -4, -24 ], [ "....MMMM........", "...MmnmnM.......", "..MmnmnmnM......", "...MnmnmnmM.....", "...MmnmnmnmM....", "...MnmnmnmnM....", "...MmnmnmnmM....", "....MmnmnmnM....", "....oMnmnmnmM...", "..ooHHMnmnmM....", ".oHHHHHMMMMo....", ".ohHHHHHHHHXHo..", ".ohHHHHHHHoXoooo", "ohhhHHHHoZcXcco.", "oohhhhHoSScXSGGo", "..oooooSSScXjgG.", ".....ooooCCGGCo.", "....oJJJJojgGo..", "...ojJJJJjjJXo..", "....ojJJJjJJJXo.", "....ojJJJJJJJXo.", "....ojjjjjjjjjo.", "....ojJJJJJJJJo.", "....ojJJJjJJJJo.", ".....oJJJJoJJJJo", ".....oJJJJoJJJJo", "......ooSSossoo.", "........oWWovvo.", "........oKKKKKKo", ".........oooooo." ] ],
  g_fall0: [ 17, 28, [ -12, -23 ], [ ".MMM.....................", "MmnmMM...................", "MmnmnmnM.................", ".MnmnmnmM................", ".MmnmnmnmM...............", ".MnmnmnmnM...............", "..MmnmnmnmM..............", "....MmnmnmnM.............", "....MnmnmnmM.............", "...ooMMmnmMo.............", "...oHHHHMMMXwo...........", "...ohHHHHHHHXHHo.........", "...ohHHHHHHHXooooo.......", "..ohhhHHHHoZXSGGo........", "...oohhhhHoSSXjgGco......", "......oooooSSGGXcco......", "........ooooCgGXCo.......", ".......oJJJJjojXo........", ".......ojJJJJjjJXo.......", "........ojJJJjJJJJo......", "........ojJJJJJJJJo......", "........ojjjjjjjjjo......", ".........ojJJJJJJJJo.....", ".........oJJJJojJJJJo....", "........oJJJJo.ooJJJJo...", ".........oSSo....osso....", ".........oWWo......ovvo..", "..........oKKKo.....oKKKo", "...........ooo.......ooo." ] ],
  g_down: [ 18, 15, null, [ "....o.o.............................", "....ooco............................", "...ooccco...........................", "..oHocScCoGGoooooo..................", ".owHoScSCogGJjJJJJo.o...............", ".oHHocccCoJJJjJJJJooKo..............", "owHHHZSSCoJJJjJJJJsvKo..............", "oHHHHoSSCoJJJjJJJJsvKo.......MMMM...", "oHHHHHoSoJJJJjJjooooKo.....MMmnmnMM.", "oHHHHHHooJJJJjJJJJSWKo....MnmnmnmnmM", "oHHHHHhooJJJJjJJJJSWKo...MnmnmnmnmnM", ".oHHHHhooJJJJjJJJJooo....MmnmnmnmnmM", ".oHHHhho.ojjjjGGJJo....XXMnmnmnmnmnM", "..ohhhho..oooogGoo.XXXX..MmnmnmnmnM.", "...ooho...................MMnmnmMM..", ".....oo.....................MMMM...." ] ],
  g_getup0: [ 7, 24, [ 8, -19 ], [ "..............MMM...", ".............MnmnM..", "............MnmnmnM.", "............MmnmnmM.", "...........MmnmnmnmM", "...........MnmnmnmnM", ".....ooooo.MmnmnmnmM", "...ooHHHHwooMmnmnmM.", "..oHHHHHHHHwMnmnmnM.", ".ohHHHHHHHHHHMnmnM..", ".ohHHHHHHHooooMMM...", "ohhhHHHHoZcSccoX....", "oohhhhHoSSccSccX....", "..oooooSSScSccoX....", "....ooooCCCCCjGG....", "...oJJJJooojj.gG....", "..ojJJJJJjjJo.X.....", "..ojJJJjjjJJo.X.....", "..ojJJJJJJjjjGG.....", "..ojjjjjjjjjogG.....", "..ojJJJJJJJJoX......", "...osssoSSoo.X......", "..oWWoooWWo.........", ".oKKKo.oKKKo........", "..ooo...ooo........." ] ],
  g_getup1: [ 6, 24, [ 11, -19 ], [ "................MMMM..", "...............MnmnmM.", "..............MnmnmnM.", "..............MmnmnmnM", "......ooooo..MmnmnmnmM", "....ooHHHHwooMnmnmnmnM", "...oHHHHHHHHwMmnmnmnmM", "..ohHHHHHHHHHMnmnmnmM.", "..ohHHHHHHHoooMnmnmnM.", ".ohhhHHHHoZcScMmnmnM..", "oohhhhHoSSccScMMMM....", "..oooooSSScSccoX......", "....ooooCCCCCo.X......", "...oJJJJoooojjGG......", "..ojJJJJJjjjo.gG......", "..ojJJJjjJJJo.X.......", "..ojJJJJJjjjo.X.......", "..ojjjjjjjjjjGG.......", "..ojJJJJJJJJogG.......", ".oJJJJjJJJJoX.........", ".oJJJJoJJJJoX.........", "..ooSSossoo.X.........", "...oWWovvo............", "...oKKKKKKo...........", "....oooooo............" ] ],
  bench_idle0: [ 6, 21, null, [ "....ooooo...MMM.", "...oHHHHHo..MmM.", "..oHHHHwHHoMmnmM", ".oHHHHHHHHHMnmnM", ".ohooooooooMmnmM", ".ocScZcScScoMmM.", ".ocSoScSoScoMMM.", "..ocScScSco..X..", "..ooCCCCCoo..X..", ".oJJoooooJJo.X..", "oJJJJJJJJJJJoX..", "oJJJJJJJJJJJoX..", "GGJJJJJJJJJGGX..", "gGjjjjjjjjjgGX..", ".oJJJJJJJJJo.X..", ".oJJJJjJJJJo.X..", ".oJJJJoJJJJo.X..", ".oJJJJoJJJJo.X..", "..oSSo.oSSo..X..", "..oWWo.oWWo..X..", ".oKKKo.oKKKo.X..", "..ooo...ooo....." ] ],
  bench_idle1: [ 6, 20, null, [ "....ooooo...MMM.", "...oHHHHHo..MmM.", "..oHHHHwHHoMmnmM", ".oHHHHHHHHHMnmnM", ".ohooooooooMmnmM", ".ocScZcScScoMmM.", ".ocSoScSoScoMMM.", "..ocScScSco..X..", "..ooCCCCCoo..X..", ".oJJoooooJJo.X..", "oJJJJJJJJJJJoX..", "oJJJJJJJJJJJoX..", "GGJJJJJJJJJGGX..", "gGjjjjjjjjjgGX..", ".oJJJJJJJJJo.X..", ".oJJJJjJJJJo.X..", ".oJJJJoJJJJo.X..", "..oSSo.oSSo..X..", "..oWWo.oWWo..X..", ".oKKKo.oKKKo.X..", "..ooo...ooo....." ] ],
  bench_clap: [ 6, 21, null, [ "....ooooo...MMM.", "...oHHHHHo..MmM.", "..oHHHHwHHoMmnmM", ".oHHHHHHHHHMnmnM", ".ohooooooooMmnmM", ".ocScZcScScoMmM.", ".ocSoScSoScoMMM.", "..ocScScSco..X..", "..ooCCCCCoo..X..", ".oJJoooooJJo.X..", "oJJJJGGGGJJJoX..", "oJJJJgGgGJJJoX..", "oJJJJJJJJJJJoX..", ".ojjjjjjjjjo.X..", ".oJJJJJJJJJo.X..", ".oJJJJjJJJJo.X..", ".oJJJJoJJJJo.X..", ".oJJJJoJJJJo.X..", "..oSSo.oSSo..X..", "..oWWo.oWWo..X..", ".oKKKo.oKKKo.X..", "..ooo...ooo....." ] ],
  bench_cheer0: [ 8, 31, null, [ "...................MM.", "..................MmnM", ".................MmnmM", ".................MnmnM", ".................MmnmM", ".................MnmM.", "..................MM..", "..................X...", "..................X...", ".................X....", "......ooooo......X....", ".....oHHHHHo.....X....", "GG..oHHHHwHHo..GGX....", "gG.oHHHHHHHHHo.gX.....", ".j.ohooooooooo.jX.....", ".j.ocScZcScSco.j......", "..jocSoScSoScoj.......", "..j.ocScScSco.j.......", "..j.ooCCCCCoo.j.......", "...jJJoooooJJj........", "..ojJJJJJJJJJjo.......", "..oJJJJJJJJJJJo.......", "..oJJJJJJJJJJJo.......", "...ojjjjjjjjjo........", "...oJJJJJJJJJo........", "...oJJJJjJJJJo........", "...oJJJJoJJJJo........", "...oJJJJoJJJJo........", "....oSSo.oSSo.........", "....oWWo.oWWo.........", "...oKKKo.oKKKo........", "....ooo...ooo........." ] ],
  coach_idle0: [ 6, 20, null, [ "....ooooo....", "...oHHHHHo...", "..oHHHwHHHo..", ".ooooooooooo.", "..oSZZSSSSo..", "..oSoSSSoSo..", "..oSSSSSSSo..", "..ooSSsSSoo..", ".oJJoooooJJo.", "oJJBBcBBJJJJo", "oJJBYYYBJJJJo", "oSSByyyBJJJJo", ".SSBYYYBSSJo.", ".obBYYYBSSbo.", ".oPBBBBBPPPo.", ".oPPPPPPPPPo.", ".oPPPPoPPPPo.", ".oPPPPoPPPPo.", ".oPPPPoPPPPo.", ".okkkkokkkko.", "..oooo.oooo.." ] ],
  coach_idle1: [ 6, 19, null, [ "....ooooo....", "...oHHHHHo...", "..oHHHwHHHo..", ".ooooooooooo.", "..oSZZSSSSo..", "..oSoSSSoSo..", "..oSSSSSSSo..", "..ooSSsSSoo..", ".oJJoooooJJo.", "oJJBBcBBJJJJo", "oJJBYYYBJJJJo", "oSSByyyBJJJJo", ".SSBYYYBSSbo.", ".oPBYYYBSSPo.", ".oPBBBBBPPPo.", ".oPPPPoPPPPo.", ".oPPPPoPPPPo.", ".oPPPPoPPPPo.", ".okkkkokkkko.", "..oooo.oooo.." ] ],
  coach_point: [ 6, 20, null, [ "....ooooo.........", "...oHHHHHo........", "..oHHHwHHHo.......", ".ooooooooooo......", "..oSZZSSSSo.......", "..oSoSSSoSo.......", "..oSSSSSSSo.....SS", "..ooSSsSSoo....JSS", ".oJJoooooJJo.JJ...", "oJJJJJJJJJJJJ.....", "BBBJJJJJJJJJo.....", "BYBJJJJJJJJJo.....", "BYBJJJJJJJJo......", "BYBbbbbbbbbo......", "BBBPPPPPPPPo......", ".oPPPPPPPPPo......", ".oPPPPoPPPPo......", ".oPPPPoPPPPo......", ".oPPPPoPPPPo......", ".okkkkokkkko......", "..oooo.oooo......." ] ],
  coach_cheer: [ 6, 20, null, [ "....ooooo......", "...oHHHHHo...SS", "..oHHHwHHHo..SS", ".ooooooooooo.J.", "..oSZZSSSSo..J.", "..oSoSSSoSo.J..", "..oSSSSSSSo.J..", "..ooSSsSSoo.J..", ".oJJoooooJJJ...", "oJJJJJJJJJJJo..", "BBBJJJJJJJJJo..", "BYBJJJJJJJJJo..", "BYBJJJJJJJJo...", "BYBbbbbbbbbo...", "BBBPPPPPPPPo...", ".oPPPPPPPPPo...", ".oPPPPoPPPPo...", ".oPPPPoPPPPo...", ".oPPPPoPPPPo...", ".okkkkokkkko...", "..oooo.oooo...." ] ],
  prop_bench: [ 19, 7, null, [ ".ooooooooooooooooooooooooooooooooooooo.", "oRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRo", "oBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBo", "obbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbo", ".ooccooooooooooooooccoooooooooooooocco.", "..occo............occo............occo.", "..occo............occo............occo.", "...oo..............oo..............oo.." ] ],
  prop_cooler: [ 4, 10, null, [ ".ooooooo..", "oYYYYYYYo.", "oYYYYYYYo.", "oOOOOOOOo.", "oOOOOOOOo.", "oOOYYYOOo.", "oOOOOOOOco", "oOOOOOOOo.", "oOOOOOOOo.", "occccccco.", ".ooooooo.." ] ],
  bench_cheer1: [ 8, 33, null, [ "...................MM.", "..................MmnM", ".................MmnmM", ".................MnmnM", ".................MmnmM", ".................MnmM.", "..................MM..", "..................X...", "..................X...", ".................X....", "......ooooo......X....", ".....oHHHHHo.....X....", "GG..oHHHHwHHo..GGX....", "gG.oHHHHHHHHHo.gX.....", ".j.ohooooooooo.jX.....", ".j.ocScZcScSco.j......", "..jocSoScSoScoj.......", "..j.ocScScSco.j.......", "..j.ooCCCCCoo.j.......", "...jJJoooooJJj........", "..ojJJJJJJJJJjo.......", "..oJJJJJJJJJJJo.......", "..oJJJJJJJJJJJo.......", "...ojjjjjjjjjo........", "...oJJJJJJJJJo........", "...oJJJJjJJJJo........", "...oJJJJoJJJJo........", "...oJJJJoJJJJo........", "....oSSo.oSSo.........", "....oWWo.oWWo.........", "...oKKKo.oKKKo........", "....ooo...ooo........." ] ]
 };
 const ANIM = {
  "idle": [ "idle" ],
  "run": [ "run0", "run1", "run2", "run3" ],
  "cradle": [ "cradle0", "cradle1", "cradle2", "cradle3" ],
  "shoot": [ "shoot0", "shoot1", "shoot2" ],
  "check": [ "check0", "check1" ],
  "hit": [ "hit0", "hit1" ],
  "fall": [ "hitreact", "fall0", "down" ],
  "getup": [ "getup0", "getup1", "idle" ],
  "pole_idle": [ "pole_idle" ],
  "pole_run": [ "pole_run0", "pole_run1", "pole_run2", "pole_run3" ],
  "pole_check": [ "pole_check0", "pole_check1" ],
  "pole_hit": [ "pole_hit0", "pole_hit1" ],
  "g_idle": [ "g_idle" ],
  "g_move": [ "g_move0", "g_move1" ],
  "g_save_high": [ "g_save_high" ],
  "g_save_low": [ "g_save_low" ],
  "g_save_side": [ "g_save_side" ],
  "g_outlet": [ "g_outlet0", "g_outlet1" ],
  "g_chirp": [ "g_chirp" ],
  "g_fall": [ "g_hitreact", "g_fall0", "g_down" ],
  "g_getup": [ "g_getup0", "g_getup1", "g_idle" ],
  "bench_idle": [ "bench_idle0", "bench_idle1" ],
  "bench_cheer": [ "bench_cheer0", "bench_cheer1" ],
  "bench_clap": [ "bench_clap", "bench_idle0" ],
  "coach_idle": [ "coach_idle0", "coach_idle1" ],
  "coach_point": [ "coach_point" ],
  "coach_cheer": [ "coach_cheer", "coach_idle0" ]
 };
 function hx(h) {
  const n = parseInt(h.slice(1), 16);
  return [ n >> 16, n >> 8 & 255, n & 255 ];
 }
 function rgb(a) {
  return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
 }
 function mul(h, f) {
  return rgb(hx(h).map(v => v * f));
 }
 function mix(h, w, f) {
  const a = hx(h), b = hx(w);
  return rgb(a.map((v, i) => v * (1 - f) + b[i] * f));
 }
 function dist(a, b) {
  const x = hx(a), y = hx(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
 }
 const FIXED = {
  o: '#0d0d0d',
  Z: '#ffdcb6',
  S: '#f0c090',
  s: '#c99a68',
  C: '#c8c8c8',
  c: '#787880',
  W: '#f2f2f2',
  v: '#c4c4cc',
  K: '#ffffff',
  k: '#1c1c1e',
  X: '#282830',
  M: '#ffffff',
  m: '#cdd6da',
  n: '#96a0a6',
  P: '#c4aa78',
  p: '#a0885c',
  B: '#785230',
  b: '#5a3c22',
  Y: '#ffffff',
  y: '#c8c8c8',
  R: '#e6e6e6',
  O: '#ff7a00',
  Q: '#f2f2f2'
 };
 const SKIN = [ {
  name: 'light',
  hi: '#ffdcb6',
  base: '#f0c090',
  shade: '#c99a68'
 }, {
  name: 'light-medium',
  hi: '#f8d2a2',
  base: '#dcac78',
  shade: '#b0804e'
 }, {
  name: 'medium',
  hi: '#e4ae7c',
  base: '#c48a56',
  shade: '#9a6436'
 }, {
  name: 'medium-dark',
  hi: '#c8905e',
  base: '#a26a3e',
  shade: '#7a4a26'
 }, {
  name: 'dark',
  hi: '#a8724a',
  base: '#7e4f2f',
  shade: '#5c361d'
 }, {
  name: 'deep',
  hi: '#90603e',
  base: '#664029',
  shade: '#4a2c19'
 }, {
  name: 'ghost',
  hi: '#e2ffe6',
  base: '#b4ecbe',
  shade: '#84c496'
 } ];
 function tone(skin) {
  const i = Math.max(0, Math.min(SKIN.length - 1, skin | 0));
  return SKIN[i];
 }
 function palette(kit, skin) {
  const helm = kit.helm === '#111111' || kit.helm === '#1b1b1b' ? '#262626' : kit.helm;
  const glove = dist(kit.trim, kit.jersey) > 90 ? kit.trim : '#f0f0f0';
  return Object.assign({}, FIXED, {
   J: kit.jersey,
   j: mul(kit.jersey, .72),
   H: helm,
   h: mul(helm, helm === kit.jersey ? .6 : .72),
   w: mix(helm, '#ffffff', .45),
   G: glove,
   g: mul(glove, .75),
   T: kit.trim,
   t: mul(kit.trim, .72)
  }, (st => ({
   Z: st.hi,
   S: st.base,
   s: st.shade
  }))(tone(skin)));
 }
 const cache = new Map;
 const uniCache = new Map;
 function uniMask(rows, name) {
  if (name && uniCache.has(name)) return uniCache.get(name);
  const h = rows.length, w = rows[0].length, at = (q, r) => rows[r][q], isJ = ch => ch === 'J' || ch === 'j';
  const shorts = new Set, accent = new Set;
  let belt = -1;
  for (let r = 0; r < h; r++) {
   let j = 0, J = 0;
   for (let q = 0; q < w; q++) {
    const ch = at(q, r);
    if (ch === 'j') j++; else if (ch === 'J') J++;
   }
   if (j >= 5 && J <= 1) {
    belt = r;
    break;
   }
  }
  if (belt >= 0) {
   for (let r = belt + 1; r < h; r++) for (let q = 0; q < w; q++) if (isJ(at(q, r))) shorts.add(q + ',' + r);
   for (let q = 0; q < w; q++) if (at(q, belt) === 'j') accent.add(q + ',' + belt);
  } else {
   let bc = -1;
   for (let q = 0; q < w; q++) {
    let j = 0, J = 0;
    for (let r = 0; r < h; r++) {
     const ch = at(q, r);
     if (ch === 'j') j++; else if (ch === 'J') J++;
    }
    if (j >= 4 && J <= 2) {
     bc = q;
     break;
    }
   }
   if (bc >= 0) {
    let hx = 0, hn = 0;
    for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
     const ch = at(q, r);
     if (ch === 'H' || ch === 'h') {
      hx += q;
      hn++;
     }
    }
    const right = !hn || hx / hn < bc;
    for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) if (isJ(at(q, r)) && (right ? q > bc : q < bc)) shorts.add(q + ',' + r);
    for (let r = 0; r < h; r++) if (at(bc, r) === 'j') accent.add(bc + ',' + r);
   }
  }
  for (let r = 0; r < h; r++) {
   const qs = [];
   for (let q = 0; q < w; q++) if (isJ(at(q, r)) && !shorts.has(q + ',' + r)) qs.push(q);
   if (qs.length >= 3) {
    for (const q of qs) accent.add(q + ',' + r);
    break;
   }
  }
  const edge = new Set;
  if (belt >= 0) for (let r = belt + 1; r < h; r++) {
   let lo = -1, hi = -1;
   for (let q = 0; q < w; q++) if (shorts.has(q + ',' + r)) {
    if (lo < 0) lo = q;
    hi = q;
   }
   if (lo >= 0 && hi - lo >= 3) {
    edge.add(lo + ',' + r);
    edge.add(hi + ',' + r);
   }
  }
  const m = {
   shorts: shorts,
   accent: accent,
   edge: edge
  };
  if (name) uniCache.set(name, m);
  return m;
 }
 const uniKey = kit => (kit.shorts && kit.shorts !== kit.jersey ? 's' + kit.shorts : '') + (kit.acc ? 'a' + kit.acc : '');
 function uniColor(kit, m, q, r, ch) {
  if (ch !== 'J' && ch !== 'j') return null;
  const k = q + ',' + r;
  if (kit.acc && (m.accent.has(k) || m.edge && m.edge.has(k))) return ch === 'J' ? kit.acc : mul(kit.acc, .8);
  if (kit.shorts && kit.shorts !== kit.jersey && m.shorts.has(k)) return ch === 'J' ? kit.shorts : mul(kit.shorts, .72);
  return null;
 }
 function bake(name, kit, flip, skin) {
  skin = Math.max(0, Math.min(SKIN.length - 1, skin | 0));
  const uk = uniKey(kit);
  const key = name + '|' + kit.jersey + kit.trim + kit.helm + (flip ? 'L' : 'R') + skin + uk + (kit.g27 ? '|g27' + kit.g27 : '');
  let c = cache.get(key);
  if (c) return c;
  const g27 = kit.g27 && typeof RL12 !== 'undefined' && RL12.g27 ? RL12.g27 : null;
  const f = FR[name], rows = f[3], h = rows.length, w = rows[0].length, pal = palette(kit, skin), um = uk ? uniMask(rows, name) : null;
  c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  for (let r = 0; r < h; r++) for (let q = 0; q < w; q++) {
   const ch = rows[r][q];
   if (ch === '.') continue;
   x.fillStyle = g27 && g27(kit, ch, q, r, rows, name) || um && uniColor(kit, um, q, r, ch) || pal[ch];
   x.fillRect(flip ? w - 1 - q : q, r, 1, 1);
  }
  cache.set(key, c);
  return c;
 }
 function draw(g, name, x, y, kit, faceRight, opts) {
  const f = FR[name];
  if (!f) return;
  x = Math.round(x);
  y = Math.round(y);
  const o = opts || {};
  if (o.shadow !== false && !name.startsWith('prop_')) {
   g.fillStyle = 'rgba(0,0,0,.25)';
   g.fillRect(x - 4, y, 9, 2);
  }
  const c = bake(name, kit, !faceRight, o.skin), ax = faceRight ? f[0] : c.width - 1 - f[0];
  if (o.alpha != null) {
   const a = g.globalAlpha;
   g.globalAlpha = o.alpha;
   g.drawImage(c, x - ax, y - f[1]);
   g.globalAlpha = a;
  } else g.drawImage(c, x - ax, y - f[1]);
 }
 function pocket(name, faceRight) {
  const p = FR[name] && FR[name][2];
  return p ? [ faceRight ? p[0] : -p[0], p[1] ] : null;
 }
 function frame(anim, t, fps, loop) {
  const a = ANIM[anim];
  if (!a) return 'idle';
  const i = Math.floor(t * (fps || 10));
  return a[loop === false ? Math.min(i, a.length - 1) : i % a.length];
 }
 return {
  FR: FR,
  ANIM: ANIM,
  SKIN: SKIN,
  palette: palette,
  draw: draw,
  pocket: pocket,
  frame: frame,
  bake: bake,
  uniMask: uniMask,
  uniKey: uniKey,
  uniColor: uniColor,
  clearCache: () => cache.clear()
 };
})();

if (typeof module !== 'undefined') module.exports = RL12;
