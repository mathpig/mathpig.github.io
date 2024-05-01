"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 50;

var time = 0;

var entities = [];
var toRemove = [];

var player;

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

var keySet = {};

var level = 0;
var LEVELS = [
  {
    "goal": [
      "You are Diomedes!",
      "Use your god-like strength",
      "to win the Trojan War!",
      "",
      "Start by completing this tutorial.",
      "Controls are on the left.",
      "Walk to the right and enter the black exit!",
    ],
    "instructions": [
      "\u2190 = left",
      "\u2192 = right",
    ],
    "map": [
      "BBBBBBBBBBBBB",
      "B           B",
      "B           B",
      "B           B",
      "B          fB",
      "BB         BB",
      "BgS        XB",
      "BBBBBBBBBBBBB",
    ],
  },
  {
    "goal": [
      "Climb over the obstacle with a rope.",
      "",
      "Use up and down to jump and climb.",
    ],
    "instructions": [
      "\u2190 = left",
      "\u2192 = right",
      "\u2191 = jump/climb",
      "\u2193 = descend",
    ],
    "map": [
      "BBBBBBBBBBBBBBBBBBBBBBBBB",
      "B          R  R         B",
      "B          R  R         B",
      "B          R  R         B",
      "B          RBBR         B",
      "BB         RBBR        BB",
      "BgS         BB         XB",
      "BBBBBBBBBBBBBBBBBBBBBBBBB",
    ],
  },
  {
    "goal": [
      "Use your skill with the sword to defeat",
      "these Trojans in combat!",
      "",
      "Press A to attack while moving toward",
      "your enemies.",
    ],
    "map": [
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "BMMMB        bbbbbbbb        mmmmmmmmm                BbbbB",
      "B3L4B        bbbbbbbb        mmmmmmmmm         B   B  BbbbB",
      "BBBBB        bbbbbbbb        mmmmmmmmm         B   B  BBBBB",
      "Bg0bB        bbbBbbbb        mmmmmmmmm        BBB BBB BbbXB",
      "BBBbb        BbbBbBBbE       ammmmmmmmA   E   BBB BBB bbBBB",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBMMMMMMMMMBBBBBBBBBBBBBBBBBBBBB",
    ],
  },
  {
    "goal": [
      "Your first task:",
      "",
      "Defeat Dolon the Wolf!",
    ],
    "map": [
      "BBBBB                       BB",
      "BbbbB                       BB",
      "Bb3bB                       BB",
      "BBBBB                       BB",
      "Bg0bB                     B BB",
      "BBBbb B         1         B XB",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    ],
  },
  {
    "goal": [
      "Now, break into Rhesus' camp",
      "and steal his snow-white horses!",
    ],
    "map": [
      "BBBBBB                                                        BBBBBB",
      "BbbbbB                                                        BwbbwB",
      "BbbbbB        BBBBBBBB        BBBBBBBB        BBBBBBBB        Bb44bB",
      "BbbbbB        BbbbbbbB        BbbbbbbB        BbbbbbbB        B3ww3B",
      "BBBBBB        BbbbbbbB        Bbb4bbbB        Bbb4bbbB        BBBBBB",
      "Bg0bBB        bbb3bbbb        bb4wbbbb        bbbwbbbb   2    BBbbXB",
      "BBBbbb B      bb33bb3b  f E   b4wwbb3b   A  E b34w443bE    AA bbbBBB",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGBBBBBB",
      "DDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDDDDLDDDDDDDLDDDDDDDDDDDDLDDDDDDDDLDDD",
      "DDDDDDDDLDDDDDDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDLDLDDDDDDDDDDDDLDDDDLDDD",
    ],
  },
  {
    "goal": [
      "You found the horses!",
      "Exit the room to take them with you!",
    ],
    "map": [
      "MMMMMMMMM",
      "MmmmmmmmM",
      "XmHm7mHmM",
      "MMMMMMMMM",
    ],
  },
  {
    "goal": [
      "Defeat Rhesus' best men",
      "and escape with the horses!",
    ],
    "holding": function() {
      return [
        new Horse().setPosition(0, -blockSize),
        new Horse().setPosition(0, -blockSize * 1.6),
      ];
    },
    "map": [
      "BBBBBB                                                          BBBBBB",
      "BbbbbB    6 5 5                                                 BwbbwB",
      "BbbbbB          BBBBBBBB        BBBBBBBB        BBBBBBBB        Bb44bB",
      "BbbbbB    6     BbbbbbbB        BbbbbbbB        BbbbbbbB        B3ww3B",
      "BBBBBB          BbbbbbbB        BbbbbbbB        BbbbbbbB        BBBBBB",
      "BXbbBB    wA    bbbbbbbb        bb4wbbbb        bbbwbbbb        BBb0gB",
      "BBBbbb    wwA   bb3bbb3b      E bbwwbb3b A      bbbwb4bb    E B bbbBBB",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGBBBBBB",
      "DDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDDDDLDDDDDDDLDDDDDDDDDDDDLDDDDDDDDLDDD",
      "DDDDDDDDLDDDDDDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDLDLDDDDDDDDDDDDLDDDDLDDD",
    ],
  },
  {
    "goal": [
      "Celebrate your victory over Rhesus! :P",
    ],
    "map": [
      "BBBBBBBBBBBBBBBBB",
      "MmmmmmmmmmmmmmmmM",
      "MmmmmmmmmmmmmmmmM",
      "MmmLmmLmmmLmmLmmM",
      "MmBBBmBmBmBmBBBmM",
      "M7mmLmmmLmmmLmmmX",
      "MLmmmmHmmmHmmmmLM",
      "MMMMMMMMMMMMMMMMM",
    ],
  },
  // TODO: Build this level.
  {
    "goal": [
      "Athena in her war-like rage has",
      "filled your heart with valour.",
      "",
      "'Even such flame did she kindle",
      "from his head and shoulders!'",
    ],
    "holding": function() {
      return [
        new Fire().setPosition(-blockSize / 20, -blockSize * 0.6),
      ];
    },
    "map": [
      "BBBBBB                                                          BBBBBB",
      "BbbbbB    6 5 5                                                 BwbbwB",
      "BbbbbB          BBBBBBBB        BBBBBBBB        BBBBBBBB        Bb44bB",
      "BbbbbB    6     BbbbbbbB        BbbbbbbB        BbbbbbbB        B3ww3B",
      "BBBBBB          BbbbbbbB        BbbbbbbB        BbbbbbbB        BBBBBB",
      "BXbbBB    wA    bbbbbbbb        bb4wbbbb        bbbwbbbb        BBb0gB",
      "BBBbbb    wwA   bb3bbb3b      E bbwwbb3b A      bbbwb4bb    E B bbbBBB",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGBBBBBB",
      "DDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDDDDLDDDDDDDLDDDDDDDDDDDDLDDDDDDDDLDDD",
      "DDDDDDDDLDDDDDDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDLDLDDDDDDDDDDDDLDDDDLDDD",
    ],
  },
  // TODO: Build this level.
  {
    "goal": [
      "Athena has given you the power",
      "to tell god from man.",
      "",
      "Wound Aphrodite.",
      "But touch no other god!",
    ],
    "holding": function() {
      return [
        new Fire().setPosition(-blockSize / 20, -blockSize * 0.6),
      ];
    },
    "map": [
      "BBBBBB                                                          BBBBBB",
      "BbbbbB    6 5 5                                                 BwbbwB",
      "BbbbbB          BBBBBBBB        BBBBBBBB        BBBBBBBB        Bb44bB",
      "BbbbbB    6     BbbbbbbB        BbbbbbbB        BbbbbbbB        B3ww3B",
      "BBBBBB          BbbbbbbB        BbbbbbbB        BbbbbbbB        BBBBBB",
      "BXbbBB    wA    bbbbbbbb        bb4wbbbb        bbbwbbbb        BBbsgB",
      "BBBbbb    wwA   bb3bbb3b      E bbwwbb3b A      bbbwb4bb    E B bbbBBB",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGBBBBBB",
      "DDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDDDDLDDDDDDDLDDDDDDDDDDDDLDDDDDDDDLDDD",
      "DDDDDDDDLDDDDDDLDDDDDDDDDDDDDDDDDDDDLDDDDDDDDDLDLDDDDDDDDDDDDLDDDDLDDD",
    ],
  },
  {
    "goal": [
      "Now, demobilize Odysseus,",
      "break into the citadel,",
      "and locate the Palladium!",
    ],
    "map": [
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                 6         6                B",
      "B                                                            B",
      "B                                BBBBbbbbbBBBBC              B",
      "B                                BbbbBbbbBbbbBR              B",
      "B                              5 BbbbbbbbbbbbBR              B",
      "B                                BbbbbBBBbbbbBR              B",
      "B                               BBbbbbbbbbbbbBR              B",
      "B                               BbbbBbbbbbBbbBR              B",
      "B                             6 BbbbbbbbbbbbbBR              B",
      "B                               BbbbbbBBBbbbbBR              B",
      "B                            5 BBbbbbbbbbbbbbBR              B",
      "B                              BbbbbBbbbbbBbbBR              B",
      "B                           6 BBbbbbbbbbbbbbbBR              B",
      "B                             BbbbbbbbBBBbbbbBR              B",
      "B                          5 BBbbbbbbbbbbbbbbBR              B",
      "B                            BbbbbbbBbbbbbBbbBR              B",
      "B                          ABBbbbbbbbbbbbbbbbBR              B",
      "B                       6 EBBbbbbbbbbbBBBbbbbBR              B",
      "B                         BBbbbbbbbbbbbbbbbbbBR              B",
      "B                        MMmmmmmmmmmMm8m8mMmmMR              B",
      "B                    5  MMmmmmmmmmmmmmmmmmmmmMR              B",
      "B                      MMmmmmmmmmmmmmmMMMmmmmMR              B",
      "B                6   MMMmmmmmmmmmmm8mmmMmmm8mMR              B",
      "B                  MMMmmmmmmmmmmmmmmmMMMMMmmmMR              B",
      "B                MMMmmmmmmmmmmmmmmmMMMmmmMMMmMR              B",
      "BB              WWmmmmmmmmmmmmmmmmmmmmmmmmmmmMR             BB",
      "Bg          E B WWmemememaamemememMmmmmmmmmmMMRO     M    S gB",
      "GGGGGGGGGGGGGGGGMMMMMMMMMMMMMMMMMMMMMMMmMMMMMMGGGGGGGGGGGGGGGG",
      "DDDDDMMMMMMMMDDDMMMMMMMMMMMMMMMMMMMMMMMmMMMMMMDDDDDDDDDDDDDDDD",
      "DDDDDMmmmmmmMDDDMMMMMMMMDDDDDDDDDDDDDDMmMDDDDDDDDDDDDDDDDDDDDD",
      "DDDDDMmmmmmmMDDDMmmmmmmMMDDDDDDMMMMMMMMmMDDDDMMMMMMMMMMDDDDDDD",
      "DDDDDMMMMMmmMDDDMMMMMMmmMMMMMMMMmmmmmmMmMDDDDMmmmmmmmmMMMMMMMD",
      "DDDDDDDDDMmmMDMMMMMMDMMmmMMmmmmMmmmmmmMmMDDDMMmMMMMmMMMMmmmmMD",
      "DDDDDDDMMMMmMMMmmmmMDMmmmmmmmmmMMmmMMMMmMMMMMmmmmmMmmmmmmmmmMD",
      "DMMMMMMMmmmmmmmmmmmMMMmMMMMMMMmmMMmMMmmmmmMMmmMMMMMMMmMMmmmmMD",
      "DMmmmMMmmMMMMMMmmmmmmmmMDDDDDMmmmmmmmmmmmmMmmMMmmmmmmmMMMMMMMD",
      "DXmmmmmmMMDDDDMMMMMMMMMMDDDDDMMMMMMMMmmmmmmmMMMMMMMMMMMDDDDDDD",
      "DMMMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDDDMMMMMMMMMDDDDDDDDDDDDDDDDD",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    ],
  },
  {
    "goal": [
      "You found the Palladium!",
      "Exit the room to take it with you!",
    ],
    "map": [
      "LLLLLLL",
      "LmmmmmL",
      "Xm7mPmL",
      "LLLLLLL",
    ],
  },
  {
    "goal": [
      "Escape with the Palladium!",
    ],
    "holding": function() {
      return [
        new Palladium().setPosition(0, -blockSize),
      ];
    },
    "map": [
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                                            B",
      "B                                 6         6                B",
      "B                                                            B",
      "B                                BBBBbbbbbBBBBC              B",
      "B                                BbbbBbbbBbbbBR              B",
      "B                              5 BbbbbbbbbbbbBR              B",
      "B                                BbbbbBBBbbbbBR              B",
      "B                               BBbbbbbbbbbbbBR              B",
      "B                               BbbbBbbbbbBbbBR              B",
      "B                             6 BbbbbbbbbbbbbBR              B",
      "B                               BbbbbbBBBbbbbBR              B",
      "B                            5 BBbbbbbbbbbbbbBR              B",
      "B                              BbbbbBbbbbbBbbBR              B",
      "B                           6 BBbbbbbbbbbbbbbBR              B",
      "B                             BbbbbbbbBBBbbbbBR              B",
      "B                          5 BBbbbbbbbbbbbbbbBR              B",
      "B                            BbbbbbbBbbbbbBbbBR              B",
      "B                          ABBbbbbbbbbbbbbbbbBR              B",
      "B                       6 EBBbbbbbbbbbBBBbbbbBR              B",
      "B                         BBbbbbbbbbbbbbbbbbbBR              B",
      "B                        MMmmmmmmmmmMm8m8mMmmMR              B",
      "B                    5  MMmmmmmmmmmmmmmmmmmmmMR              B",
      "B                      MMmmmmmmmmmmmmmMMMmmmmMR              B",
      "B                6   MMMmmmmmmmmmmm8mmmMmmm8mMR              B",
      "B                  MMMmmmmmmmmmmmmmmmMMMMMmmmMR              B",
      "B                MMMmmmmmmmmmmmmmmmMMMmrmMMMmMR              B",
      "BB              WWmmmmmmmmmmmmmmmmmmmmmrmmmmmMR             BB",
      "Bg          E B WWmemememaamemememMmmmmrmmmmMMRO     M      XB",
      "GGGGGGGGGGGGGGGGMMMMMMMMMMMMMMMMMMMMMMMrMMMMMMGGGGGGGGGGGGGGGG",
      "DDDDDMMMMMMMMDDDMMMMMMMMMMMMMMMMMMMMMMMrMMMMMMDDDDDDDDDDDDDDDD",
      "DDDDDMmmmmmmMDDDMMMMMMMMDDDDDDDDDDDDDDMrMDDDDDDDDDDDDDDDDDDDDD",
      "DDDDDMmmmmmmMDDDMmmmmmmMMDDDDDDMMMMMMMMrMDDDDMMMMMMMMMMDDDDDDD",
      "DDDDDMMMMMmmMDDDMMMMMMmmMMMMMMMMmmmmmmMrMDDDDMmmmmmmmmMMMMMMMD",
      "DDDDDDDDDMmmMDMMMMMMDMMmmMMmmmmMmmmmmmMrMDDDMMmMMMMmMMMMmmmmMD",
      "DDDDDDDMMMMmMMMmmmmMDMmmmmmmmmmMMmmMMMMrMMMMMmmmmmMmmmmmmmmmMD",
      "DMMMMMMMmmmmmmmmmmmMMMmMMMMMMMmmMMmMMmmrmmMMmmMMMMMMMmMMmmmmMD",
      "DMmmmMMmmMMMMMMmmmmmmmmMDDDDDMmmmmmmmmmrmmMmmMMmmmmmmmMMMMMMMD",
      "Dg7mmmmmMMDDDDMMMMMMMMMMDDDDDMMMMMMMMmmmmmmmMMMMMMMMMMMDDDDDDD",
      "DMMMMMMMMDDDDDDDDDDDDDDDDDDDDDDDDDDDMMMMMMMMMDDDDDDDDDDDDDDDDD",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    ],
  },
  {
    "goal": [
      "Celebrate your victory AGAIN!",
    ],
    "map": [
      "BBBBBBBBBBBBBBBBB",
      "MLmLmLmLmLmLmLmLM",
      "MmmmmmmmmmmmmmmmM",
      "MmmLmmLmPmLmmLmmM",
      "MmBBBmBmBmBmBBBmM",
      "M7mmLmmmLmmmLmmmX",
      "MLmmmmHmmmHmmmmLM",
      "MMMMMMMMMMMMMMMMM",
    ],
  },
  {
    "goal": [
      "The other heroes are all refusing to",
      "fight. Exit the Trojan Horse yourself!",
    ],
    "map": [
      "wwwwwwwwwww",
      "ww       ww",
      "ww   J   ww",
      "wwS9   T ww",
      "wwwwwwwwXww",
    ],
  },
  {
    "goal": [
      "Sack Troy!",
    ],
    "map": [
      "BB                                                            B",
      "BB                                                            B",
      "BB                                                            B",
      "BB                                                            B",
      "BB                                                            B",
      "BB                                                            B",
      "BB                        w w                                 B",
      "BB                     m  wwwww                               B",
      "BB                     R wwXwwwww        www                  B",
      "BB                     R wwwwwwwwwwwwwwwwwwww                 B",
      "BB                     R www wwwwwwwwwwwwwwwww                B",
      "BB                     R ww    wwwwwwwwwwwwwww                B",
      "BB                     R        wwwwwwwgwwwwww                B",
      "BB                     R         wwwwwSR wwwww                B",
      "BB                     R         ww    R    ww                B",
      "BB                     R         ww    R    ww               BB",
      "Bg                     R         mm    R    ww               XB",
      "GGGGGGGGGGGGGGGGGMMMMMGGGGMMMMMMMMMMMMMMMMMMMMMMMMMGGGGGGGGGGGG",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    ],
  },
  {
    "goal": [
      "Celebrate the Greek victory against Troy!",
    ],
    "map": [
      "MMMMMMMMMMMMMMMMM",
      "MLLLLLLLLLLLLLLLM",
      "MmmmmmmmmmmmmmmmM",
      "MmmLmmLmPmLmmLmmM",
      "MmBBBmBmBmBmBBBmM",
      "M7mmLmmmLmmmLmmmM",
      "MLLmmmHmmmHmmmLLM",
      "MMMMMMMMMMMMMMMMM",
    ],
  },
];

var defaultInstructions = [
  "\u2190 = left",
  "\u2192 = right",
  "\u2191 = jump/climb",
  "\u2193 = descend",
  "A = attack",
];

function Init() {
  var map = LEVELS[level]["map"];
  var levelHolding = [];
  if (LEVELS[level]["holding"]) {
    levelHolding = LEVELS[level]["holding"]();
  }
  entities = [];
  var enemies = [];
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[i].length; ++j) {
      var block = map[i][j];
      var x = (blockSize * j);
      var y = (blockSize * i);
      if (block == "B") {
        entities.push(new Brick().setPosition(x, y));
      }
      else if (block == "b") {
        entities.push(new BackgroundBrick().setPosition(x, y));
      }
      else if (block == "M") {
        entities.push(new Marble().setPosition(x, y));
      }
      else if (block == "m") {
        entities.push(new BackgroundMarble().setPosition(x, y));
      }
      else if (block == "G") {
        entities.push(new Grass().setPosition(x, y));
      }
      else if (block == "D") {
        entities.push(new Dirt().setPosition(x, y));
      }
      else if (block == "L") {
        entities.push(new Gold().setPosition(x, y));
      }
      else if (block == "C") {
        entities.push(new CornerRope().setPosition(x, y));
      }
      else if (block == "R") {
        entities.push(new Rope().setPosition(x, y));
      }
      else if (block == "r") {
        entities.push(new BackgroundMarble().setPosition(x, y));
        entities.push(new Rope().setPosition(x, y));
      }
      else if (block == "W") {
        entities.push(new Wall().setPosition(x, y));
      }
      else if (block == "P") {
        entities.push(new Palladium().setPosition(x, y));
      }
      else if (block == "g") {
        entities.push(new Gate().setPosition(x, y));
      }
      else if (block == "X") {
        entities.push(new Exit().setPosition(x, y));
      }
      else if (block == "H") {
        entities.push(new BackgroundMarble().setPosition(x, y));
        entities.push(new Horse().setPosition(x, y));
      }
      else if (block == "w") {
        entities.push(new Wood().setPosition(x, y));
      }
      else if (block == "E") {
        enemies.push(new EnemyKnight().setPosition(x, y));
      }
      else if (block == "A") {
        enemies.push(new EnemyArcher().setPosition(x, y));
      }
      else if (block == "f") {
        enemies.push(new Fire().setSize(blockSize).setPosition(x, y));
      }
      else if (block == "e") {
        entities.push(new BackgroundMarble().setPosition(x, y));
        enemies.push(new EnemyKnight().setPosition(x, y));
      }
      else if (block == "a") {
        entities.push(new BackgroundMarble().setPosition(x, y));
        enemies.push(new EnemyArcher().setPosition(x, y));
      }
      else if (block == "3") {
        entities.push(new BackgroundBrick().setPosition(x, y));
        enemies.push(new EnemyKnight().setPosition(x, y));
      }
      else if (block == "4") {
        entities.push(new BackgroundBrick().setPosition(x, y));
        enemies.push(new EnemyArcher().setPosition(x, y));
      }
      else if (block == "5") {
        enemies.push(new StrongKnight().setPosition(x, y));
      }
      else if (block == "6") {
        enemies.push(new StrongArcher().setPosition(x, y));
      }
      else if (block == "8") {
        entities.push(new BackgroundMarble().setPosition(x, y));
        enemies.push(new StrongArcher().setPosition(x, y));
      }
      else if (block == "1") {
        enemies.push(new Dolon().setPosition(x, y));
      }
      else if (block == "2") {
        enemies.push(new Rhesus().setPosition(x, y));
      }
      else if (block == "O") {
        enemies.push(new Odysseus().setPosition(x, y));
      }
      else if (block == "9") {
        enemies.push(new Odysseus().setPosition(x, y).setRange(0));
      }
      else if (block == "J") {
        enemies.push(new Ajax().setPosition(x, y).setRange(0));
      }
      else if (block == "T") {
        enemies.push(new Teucer().setPosition(x, y).setRange(0));
      }
      else if (block == "0") {
        entities.push(new BackgroundBrick().setPosition(x, y));
        player = new Knight().setPosition(x, y);
        player.setHolding(levelHolding);
      }
      else if (block == "7") {
        entities.push(new BackgroundMarble().setPosition(x, y));
        player = new Knight().setPosition(x, y);
        player.setHolding(levelHolding);
      }
      else if (block == "S") {
        player = new Knight().setPosition(x, y);
        player.setHolding(levelHolding);
      }
      else if (block == "s") {
        player = new Knight().setPosition(x, y);
        player.setHolding(levelHolding);
        player.setColor("rgb(255,255,100)");
      }
    }
  }
  for (var i = 0; i < enemies.length; ++i) {
    entities.push(enemies[i]);
  }
  entities.push(player);
}

function distance(e1, e2) {
  return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = blockSize;
    this.isCollidable = true;
    this.color = "black";
    this.direction = 1;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  setDoCollision(doCollision) {
    this.doCollision = doCollision;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2 - 1, this.y - this.size / 2 - 1, this.size + 2, this.size + 2);
  }

  tick() {
  }
}

class Brick extends Block {
  constructor() {
    super();
    this.color1 = "rgb(" + String(Math.random() * 32 + 112) + ", " + String(Math.random() * 32 + 112) + ", " + String(Math.random() * 32 + 112) + ")";
    this.color2 = "rgb(0, 0, 0)";
  }

  draw() {
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.strokeStyle = this.color2;
    ctx.lineWidth = (blockSize / 10);
    ctx.beginPath();
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.moveTo(this.x - this.size / 2, this.y);
    ctx.lineTo(this.x + this.size / 2, this.y);
    ctx.moveTo(this.x - this.size / 6, this.y - this.size / 2);
    ctx.lineTo(this.x - this.size / 6, this.y);
    ctx.moveTo(this.x + this.size / 6, this.y);
    ctx.lineTo(this.x + this.size / 6, this.y + this.size / 2);
    ctx.stroke();
  }
}

function DrawPixels(x, y, size, map, colors, flip) {
  x -= size / 2;
  y -= size / 2;
  var width = map[0].length;
  var height = map.length;
  var sw = size / width;
  var sh = size / height;
  if (flip === -1) {
    x += size;
    sw = -sw;
  }
  for (var j = 0; j < height; ++j) {
    for (var i = 0; i < width; ++i) {
      var c = colors[map[j][i]];
      if (!c) {
        continue;
      }
      ctx.fillStyle = c;
      ctx.fillRect(x + i * sw, y + j * sh, sw, sh);
    }
  }
}

class BackgroundBrick extends Brick {
  constructor() {
    super();
    this.isCollidable = false;
    this.color1 = "rgb(" + String(Math.random() * 16 + 56) + ", " + String(Math.random() * 16 + 56) + ", " + String(Math.random() * 16 + 56) + ")";
  }
}

class Marble extends Block {
  constructor() {
    super();
    this.colors = {
      "1": "rgb(" + String(Math.random() * 64 + 192) + ", " + String(Math.random() * 32 + 96) + ", " + String(Math.random() * 32 + 96) + ")",
      "2": "rgb(" + String(Math.random() * 16 + 240) + ", " + String(Math.random() * 16 + 240) + ", " + String(Math.random() * 12 + 180) + ")",
    };
    this.color3 = "rgb(0, 0, 0)";
    this.colorMap = ["12111211",
                     "21212121",
                     "12121212",
                     "22212221",
                     "12111211",
                     "21212121",
                     "12121212",
                     "22212221"];
  }

  draw() {
    DrawPixels(this.x, this.y, this.size, this.colorMap, this.colors);
  }
}

class BackgroundMarble extends Marble {
  constructor() {
    super();
    this.isCollidable = false;
    this.colors["1"] = "rgb(" + String(Math.random() * 32 + 96) + ", " + String(Math.random() * 16 + 48) + ", " + String(Math.random() * 16 + 48) + ")";
    this.colors["2"] = "rgb(" + String(Math.random() * 8 + 120) + ", " + String(Math.random() * 8 + 120) + ", " + String(Math.random() * 6 + 90) + ")";
  }
}

class Fire extends Block {
  constructor() {
    super();
    this.particles = new Float32Array();
    this.colors = ["rgba(255,255,100,0.5)", "rgba(255,192,0,0.3)", "rgba(128,128,128,0.1)"];
    this.gravity = 0;
    this.counter = 0;
    this.setParticles(200);
    this.setGravity(0.001);
  }

  setParticles(n) {
    this.particles = new Float32Array(n * 5);
    var p = this.particles;
    for (var i = 0; i < n; ++i) {
      p[i * 5 + 0] = -100000;
      p[i * 5 + 1] = -100000;
      p[i * 5 + 4] = Math.random() * 3;
    }
  }

  setGravity(g) {
    this.gravity = blockSize * g;
  }

  draw() {
    var sz = this.size / 10;
    var p = this.particles;
    var n = p.length;
    for (var j = 0; j < this.colors.length; ++j) {
      ctx.fillStyle = this.colors[j];
      for (var i = 0; i < n; i += 5) {
        if (Math.floor(p[i + 4]) == j) {
          ctx.fillRect(p[i], p[i + 1], sz, sz);
        }
      }
    }
  }

  tick() {
    var g = this.gravity;
    var p = this.particles;
    var n = p.length;
    var aging = 0.3;
    var rx = this.x;
    var ry = this.y + this.size / 2.6;
    var sz = this.size;
    for (var i = 0; i < n; i += 5) {
      if (p[i + 4] < 2) {
        p[i + 1] += g;
        p[i] += p[i + 2];
      }
      p[i + 1] += p[i + 3];
      p[i + 4] += aging;
      if (p[i + 4] >= 3) {
        p[i + 0] = rx;
        p[i + 1] = ry;
        p[i + 2] = (Math.random() - 0.5) * sz / 10;
        p[i + 3] = (Math.random() - 1) * sz / 10;
        p[i + 4] = 0;
      }
    }
  }
}

class Grass extends Block {
  constructor() {
    super();
    this.color = "green";
  }
}

class Exit extends Block {
  constructor() {
    super();
    this.isCollidable = false;
    this.color = "black";
  }
}

class Dirt extends Block {
  constructor() {
    super();
    this.color = "brown";
  }
}

class Gold extends Block {
  constructor() {
    super();
    this.color = "yellow";
  }
}

class Wall extends Block {
  constructor() {
    super();
    this.isCollidable = false;
    this.color1 = "brown";
    this.color2 = "black";
  }

  draw() {
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.x - this.size / 2 - 1, this.y - this.size / 2 - 1, this.size + 2, this.size + 2);
    ctx.strokeStyle = this.color2;
    ctx.lineWidth = (blockSize / 10);
    ctx.beginPath();
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.moveTo(this.x - this.size / 4, this.y - this.size / 2);
    ctx.lineTo(this.x - this.size / 4, this.y + this.size / 2);
    ctx.moveTo(this.x, this.y - this.size / 2);
    ctx.lineTo(this.x, this.y + this.size / 2);
    ctx.moveTo(this.x + this.size / 4, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 4, this.y + this.size / 2);
    ctx.stroke();
  }
}

class PixelBlock extends Block {
  constructor() {
    super();
  }

  draw() {
    DrawPixels(this.x, this.y, this.size, this.colorMap, this.colors, this.direction);
  }
}

class DeadBody extends PixelBlock {
  constructor() {
    super();
    this.isCollidable = false;
    this.colors = {
      "#": "#101010",
      "b": "#800000",
    };
    this.colorMap = ["           ",
                     "           ",
                     "           ",
                     "           ",
                     "    ####   ",
                     "    ##b    ",
                     "     b#    ",
                     "   #####   ",
                     "  #### ##  ",
                     "   b###    ",
                     "bbb#bbb####"];
  }
}

class Gate extends PixelBlock {
  constructor() {
    super();
    this.colors = {
      "#": "#337777",
      " ": "#000000",
    };
    this.colorMap = ["  #  #  #  ",
                     "  #  #  #  ",
                     "  #  #  #  ",
                     "###########",
                     "  #  #  #  ",
                     "  #  #  #  ",
                     "###########",
                     "  #  #  #  ",
                     "  #  #  #  ",
                     "  #  #  #  "];
  }
}

class Palladium extends Block {
  constructor() {
    super();
    this.color = "brown";
    this.colorMap = ["B B B B B",
                     " SSSSSSS ",
                     "BWWWWWWWB",
                     " W     W ",
                     "BW E E WB",
                     " W  N  W ",
                     "BW  M  WB",
                     " W     W ",
                     "B B B B B"];
  }

  draw() {
    for (var i = 0; i < this.colorMap.length; ++i) {
      for (var j = 0; j < this.colorMap[0].length; ++j) {
        if (this.colorMap[i][j] == "W") {
          ctx.fillStyle = "brown";
        }
        else if (this.colorMap[i][j] == "B") {
          ctx.fillStyle = "yellow";
        }
        else {
          ctx.fillStyle = "olive";
        }
        var x = (this.x - this.size / 2 + j * this.size / this.colorMap[0].length);
        var y = (this.y - this.size / 2 + i * this.size / this.colorMap.length);
        var sizeX = (this.size / this.colorMap.length);
        var sizeY = (this.size / this.colorMap[0].length);
        ctx.fillRect(x - 1, y - 1, sizeX + 2, sizeY + 2);
        if (this.colorMap[i][j] == "S") {
          ctx.fillStyle = "brown";
          ctx.fillRect(x + sizeX / 4, y + sizeY / 2, sizeX / 2, sizeY / 2);
        }
        else if (this.colorMap[i][j] == "E" || this.colorMap[i][j] == "N") {
          ctx.strokeStyle = "brown";
          ctx.lineWidth = (sizeX / 10);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + sizeX, y);
          ctx.lineTo(x + sizeX, y + sizeY);
          ctx.lineTo(x, y + sizeY);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (this.colorMap[i][j] == "E") {
            ctx.fillStyle = "brown";
            ctx.fillRect(x + sizeX / 4, y + sizeY / 4, sizeX / 2, sizeY / 2);
          }
        }
        else if (this.colorMap[i][j] == "M") {
          ctx.strokeStyle = "brown";
          ctx.lineWidth = (sizeX / 10);
          ctx.beginPath();
          ctx.moveTo(x, y + sizeY / 2);
          ctx.lineTo(x + sizeX, y + sizeY / 2);
          ctx.stroke();
        }
      }
    }
  }
}

class ImageBlock extends Block {
  constructor() {
    super();
    this.image = null;
  }

  draw() {
    var sizeX = this.size;
    var sizeY = this.size * this.image.height / this.image.width;
    var x = this.x - sizeX / 2;
    var y = this.y - sizeY / 2;
    ctx.drawImage(this.image, x, y, sizeX, sizeY);
  }
}

class Horse extends ImageBlock {
  constructor() {
    super();
    this.image = horse;
  }
}

class Wood extends ImageBlock {
  constructor() {
    super();
    this.image = wood;
  }
}

class Rope extends Block {
  constructor() {
    super();
    this.color = "peru";
    this.isCollidable = false;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 8, this.y - this.size / 2 - 2, this.size / 4, this.size + 4);
  }
}

class CornerRope extends Rope {
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2 - 2, this.y - this.size / 8, this.size * 5 / 8 + 4, this.size / 4);
    ctx.fillRect(this.x - this.size / 8, this.y - this.size / 8 - 2, this.size / 4, this.size * 5 / 8 + 4);
  }
}

class Knight {
  constructor() {
    this.maxSpeed = (blockSize / 10);
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = (blockSize * 4 / 5);
    this.color = "blue";
    this.health = 250;
    this.maxHealth = this.health;
    this.jumpCooldown = 0;
    this.maxJumpCooldown = 10;
    this.attack = 20;
    this.attackCooldown = 0;
    this.maxAttackCooldown = 20;
    this.mode = 0;
    this.goalMode = 0;
    this.modeCooldown = 0;
    this.maxModeCooldown = 10;
    this.colors = {
      "S": "silver",
      "D": "#ffffB0",
    };
    this.colorMaps = [[" S  ###    ",
                       " S  ###    ",
                       " S  ###    ",
                       "SS   #     ",
                       "SS## # ##  ",
                       "SS #####   ",
                       "SS   #     ",
                       "SS  ###    ",
                       " S #   #   ",
                       " S #   #   ",
                       " S #   #   "],
                      ["    ###  S ",
                       "    ###  S ",
                       "    ###  S ",
                       "     #   SS",
                       "  ## # ##SS",
                       "   ##### SS",
                       "     #   SS",
                       "    ###  SS",
                       "   #   # S ",
                       "   #   # S ",
                       "   #   # S "],
                      ["S  ###     ",
                       "S  ###     ",
                       "S  ###     ",
                       "S   #      ",
                       "S## # #DDDD",
                       "S #####    ",
                       "S   #      ",
                       "S  ###     ",
                       "S #   #    ",
                       "S #   #    ",
                       "S #   #    "],
                      ["    ###    ",
                       "    ###    ",
                       "    ###    ",
                       "     #     ",
                       "  ## # ##  ",
                       "   #####   ",
                       "     #     ",
                       "    ###    ",
                       "   #   #   ",
                       "   #   #   ",
                       "   #   #   "]];
    this.direction = 1;
    this.lastAttacked = 0;
    this.labelCount = 0;
    this.holding = [];
  }

  setMaxSpeed(maxSpeed) {
    this.maxSpeed = maxSpeed;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setHealth(health) {
    this.health = health;
    return this;
  }

  setMaxHealth(maxHealth) {
    this.maxHealth = maxHealth;
    return this;
  }

  setAttack(attack) {
    this.attack = attack;
    return this;
  }

  setAttackCooldown(attackCooldown) {
    this.attackCooldown = attackCooldown;
    return this;
  }

  setMaxAttackCooldown(maxAttackCooldown) {
    this.maxAttackCooldown = maxAttackCooldown;
    return this;
  }

  setJumpCooldown(jumpCooldown) {
    this.jumpCooldown = jumpCooldown;
    return this;
  }

  setMaxJumpCooldown(maxJumpCooldown) {
    this.maxJumpCooldown = maxJumpCooldown;
    return this;
  }

  setMode(mode) {
    this.mode = mode;
    return this;
  }

  setGoalMode(goalMode) {
    this.goalMode = goalMode;
    return this;
  }

  setModeCooldown(modeCooldown) {
    this.modeCooldown = modeCooldown;
    return this;
  }

  setMaxModeCooldown(maxModeCooldown) {
    this.maxModeCooldown = maxModeCooldown;
    return this;
  }

  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  setLastAttacked(lastAttacked) {
    this.lastAttacked = lastAttacked;
    return this;
  }

  setLabelCount(labelCount) {
    this.labelCount = labelCount;
    return this;
  }

  setHolding(items) {
    this.holding = items;
  }

  draw() {
    if (this.holding.length > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      for (var i = 0; i < this.holding.length; ++i) {
        this.holding[i].draw();
      }
      ctx.restore();
    }

    var colorMap = this.colorMaps[this.mode];
    this.colors["#"] = this.color;
    DrawPixels(this.x, this.y, this.size, colorMap, this.colors, this.direction);

    this.drawhealthbar();
  }

  drawhealthbar() {
    var val = (this.health / this.maxHealth) * this.size;
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size / 2, this.y - 7 * this.size / 10, val, this.size / 10);
    ctx.fillStyle = "darkred";
    ctx.fillRect(this.x - this.size / 2 + val, this.y - 7 * this.size / 10, this.size - val, this.size / 10);
  }

  tick() {
    for (var i = 0; i < this.holding.length; ++i) {
      this.holding[i].tick();
    }
    this.lastAttacked++;
    if (this.jumpCooldown <= 0 && this.lastAttacked >= 200) {
      this.health = Math.min(this.health + (this.maxHealth / 1000), this.maxHealth);
    }
    if (this.attackCooldown > 0) {
      this.mode = 3;
      this.attackCooldown--;
    }
    else if (keySet["a"]) {
      this.mode = 2;
    }
    else {
      this.mode = 1;
    }
    this.vx *= (9 / 10);
    if (Math.abs(this.vx) < 1) {
      this.vx = 0;
    }
    var num = this.vx;
    if (keySet["ArrowLeft"]) {
      this.direction = -1;
      num -= this.maxSpeed;
    }
    if (keySet["ArrowRight"]) {
      this.direction = 1;
      num += this.maxSpeed;
    }
    var val = Math.sign(num);
    var vx = Math.abs(num);
    for (var i = 0; i < vx; ++i) {
      this.x += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j])) {
          if (entities[j] === this) {
            continue;
          }
          if (entities[j] instanceof Exit) {
            level++;
            Init();
            return;
          }
          if (entities[j] instanceof Block && !entities[j].isCollidable) {
            continue;
          }
          if (entities[j] instanceof EnemyKnight && this.mode == 2 && this.attackCooldown <= 0) {
            if (entities[j] instanceof EnemyArcher || ((entities[j].mode == 1 && this.direction == entities[j].direction) || ((entities[j].mode == 0 || entities[j].mode == 2) && this.direction != entities[j].direction) || entities[j].mode == 3)) {
              entities[j].health -= this.attack;
              entities[j].lastAttacked = 0;
              if (entities[j].health <= 0) {
                toRemove.push(entities[j]);
                entities.push(new DeadBody().setPosition(entities[j].x, entities[j].y).setDirection(entities[j].direction).setSize(entities[j].size));
              }
              entities[j].vx += (this.direction * blockSize);
            }
            else {
              entities[j].vx += (this.direction * blockSize / 2);
            }
            this.attackCooldown = this.maxAttackCooldown;
          }
          failed = true;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
    }
    var touchedRope = false;
    for (var j = 0; j < entities.length; ++j) {
      if (entities[j] !== this && touches(this, entities[j]) && entities[j] instanceof Rope) {
        touchedRope = true;
        break;
      }
    }
    if (touchedRope) {
      if (keySet["ArrowUp"]) {
        this.vy = -(blockSize / 5);
      }
      else if (keySet["ArrowDown"]) {
        this.vy = (blockSize / 5);
      }
      else {
        this.vy = 0;
      }
    }
    else {
      this.vy += (blockSize / 100);
      this.vy *= 0.95;
    }
    var val = Math.sign(this.vy);
    var vy = Math.abs(this.vy);
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (entities[j] !== this && touches(this, entities[j])) {
          if (!(entities[j] instanceof Block) || entities[j].isCollidable) {
            failed = true;
          }
          if (entities[j] instanceof Exit) {
            level++;
            Init();
            return;
          }
        }
      }
      if (failed) {
        if (this.vy > 0) {
          this.jumpCooldown--;
        }
        else {
          this.jumpCooldown = this.maxJumpCooldown;
        }
        this.vy = 0;
        if (this.jumpCooldown <= 0 && keySet["ArrowUp"]) {
          this.vy -= (blockSize / 3);
        }
        this.y -= val;
        break;
      }
      else {
        this.jumpCooldown = this.maxJumpCooldown;
      }
    }
  }
}

class EnemyKnight extends Knight {
  constructor() {
    super();
    this.speed = (blockSize / 20);
    this.health = 100;
    this.maxHealth = 100;
    this.attack = 10;
    this.maxAttackCooldown = 20;
    this.maxModeCooldown = 40;
    this.color = "red";
    this.range = 5;
  }

  setRange(range) {
    this.range = range;
    return this;
  }

  tick() {
    this.lastAttacked++;
    if (this.lastAttacked >= 200) {
      this.health = Math.min(this.health + (this.maxHealth / 1000), this.maxHealth);
    } 
    if ((time % 20) == 0 && distance(this, player) <= (blockSize * this.range)) {
      if (player.mode == 1) {
        if (Math.random() < 0.6) {
          this.goalMode = 2;
        }
        else {
          this.goalMode = Math.floor(Math.random() * 2);
        }
      }
      else if (player.mode == 2) {
        var val = Math.random();
        if (val < 0.3) {
          this.goalMode = 2;
        }
        else if (val < 0.9) {
          this.goalMode = 1;
        }
        else {
          this.goalMode = 0;
        }
      }
      else {
        this.goalMode = 2;
      }
    }
    if (this.mode == 3) {
      this.modeCooldown--;
      if (this.modeCooldown <= 0) {
        this.mode = this.goalMode;
      }
    }
    else if (this.mode != this.goalMode) {
      this.mode = 3;
      this.modeCooldown = this.maxModeCooldown;
    }
    this.vx *= (9 / 10);
    if (Math.abs(this.vx) < 1) {
      this.vx = 0;
    }
    var num = this.vx;
    var speed = (this.maxSpeed * (1 - (this.mode / 4)));
    if (distance(this, player) <= (blockSize * this.range)) {
      if (this.x > player.x) {
        this.direction = -1;
        num -= this.speed;
      }
      else {
        this.direction = 1;
        num += this.speed;
      }
    }
    var val = Math.sign(num);
    var vx = Math.abs(num);
    for (var i = 0; i < vx; ++i) {
      this.x += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j])) {
          if (entities[j] === this) {
            continue;
          }
          if (entities[j] instanceof Block && !entities[j].isCollidable) {
            continue;
          }
          if (entities[j] === player && this.attackCooldown <= 0 && this.mode == 2) {
            if ((entities[j].mode == 1 && this.direction == entities[j].direction) || (entities[j].mode == 2 && this.direction != entities[j].direction) || entities[j].mode == 3) {
              this.attackCooldown = this.maxAttackCooldown;
              entities[j].health -= this.attack;
              entities[j].lastAttacked = 0;
              if (entities[j].health <= 0) {
                toRemove.push(entities[j]);
                entities.push(new DeadBody().setPosition(entities[j].x, entities[j].y).setDirection(entities[j].direction).setSize(entities[j].size));
              }
              entities[j].vx += (this.direction * blockSize);
            }
            else {
              entities[j].vx += (this.direction * blockSize / 2);
            }
          }
          failed = true;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
    }
    this.vy += (blockSize / 100);
    this.vy *= 0.95;
    var val = Math.sign(this.vy);
    var vy = Math.abs(this.vy);
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (entities[j] !== this && touches(this, entities[j]) && (!(entities[j] instanceof Block) || entities[j].isCollidable)) {
          failed = true;
        }
      }
      if (failed) {
        if (this.vy > 0) {
          this.attackCooldown--;
        }
        else {
          this.attackCooldown = this.maxAttackCooldown;
        }
        this.vy = 0;
        this.y -= val;
        break;
      }
      else {
        this.attackCooldown = this.maxAttackCooldown;
      }
    }
  }
}

class Dolon extends EnemyKnight {
  constructor() {
    super();
    this.speed = (blockSize / 15);
    this.health = 50;
    this.maxHealth = 50;
    this.maxAttackCooldown = 5;
    this.attack = 20;
    this.maxModeCooldown = 20;
    this.size = (blockSize * 3 / 5);
    this.range = 10;
  }
}

class Rhesus extends EnemyKnight {
  constructor() {
    super();
    this.speed = (blockSize / 30);
    this.health = 250;
    this.maxHealth = 250;
    this.maxAttackCooldown = 40;
    this.attack = 50;
    this.maxModeCooldown = 80;
    this.size = (blockSize * 8 / 5);
    this.range = 10;
  }
}

class StrongKnight extends EnemyKnight {
  constructor() {
    super();
    this.speed = (blockSize / 25);
    this.health = 150;
    this.maxHealth = 150;
    this.maxAttackCooldown = 30;
    this.attack = 25;
    this.maxModeCooldown = 60;
    this.size = (blockSize * 6 / 5);
    this.range = 10;
  }
}

class Ajax extends EnemyKnight {
  constructor() {
    super();
    this.health = 500;
    this.maxHealth = 500;
    this.size = (blockSize * 2);
    this.color = "purple";
  }
}

class EnemyArcher extends EnemyKnight {
  constructor() {
    super();
    this.colors["B"] = "brown";
    this.colors["A"] = "black";
    this.colorMaps = [["   ###    B",
                       "   ###   BS",
                       "   ###  B S",
                       "    #   B S",
                       " ## # ##BAA",
                       "  ##### B S",
                       "    #   B S",
                       "   ###   BS",
                       "  #   #   B",
                       "  #   #    ",
                       "  #   #    "]];
    this.health = 50;
    this.maxHealth = 50;
    this.attack = 10;
    this.maxAttackCooldown = 120;
    this.bulletSpeed = 10;
    this.bulletColor = "black";
    this.bulletSize = 8;
    this.range = 15;
    this.accuracy = 2;
  }

  tick() {
    this.lastAttacked++;
    if (this.jumpCooldown <= 0 && this.lastAttacked >= 200) {
      this.health = Math.min(this.health + (this.maxHealth / 1000), this.maxHealth);
    }
    this.mode = 0;
    if (distance(this, player) <= (blockSize * this.range)) {
      this.direction = Math.sign(player.x - this.x);
      if (this.attackCooldown <= 0) {
        var bvx = this.bulletSpeed * (player.x - this.x) / distance(this, player) + (Math.random() - 0.5) * this.accuracy;
        var bvy = this.bulletSpeed * (player.y - this.y) / distance(this, player) + (Math.random() - 0.5) * this.accuracy;
        entities.push(new Bullet().setPosition(this.x, this.y).setVelocity(bvx, bvy).setAttack(this.attack).setSize(this.bulletSize).setColor(this.bulletColor).setSource(this));
        this.attackCooldown = this.maxAttackCooldown;
      }
    }
    this.vx *= (9 / 10);
    if (Math.abs(this.vx) < 1) {
      this.vx = 0;
    }
    var val = Math.sign(this.vx);
    var vx = Math.abs(this.vx);
    for (var i = 0; i < vx; ++i) {
      this.x += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j])) {
          if (entities[j] === this) {
            continue;
          }
          if (entities[j] instanceof Block && !entities[j].isCollidable) {
            continue;
          }
          failed = true;
          break;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
    }
    this.vy += (blockSize / 100);
    this.vy *= 0.95;
    var val = Math.sign(this.vy);
    var vy = Math.abs(this.vy);
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (entities[j] !== this && touches(this, entities[j]) && (!(entities[j] instanceof Block) || entities[j].isCollidable)) {
          failed = true;
        }
      }
      if (failed) {
        if (this.vy > 0) {
          this.attackCooldown--;
        }
        else {
          this.attackCooldown = this.maxAttackCooldown;
        }
        this.vy = 0;
        this.y -= val;
        break;
      }
      else {
        this.attackCooldown = this.maxAttackCooldown;
      }
    }
  }
}

class StrongArcher extends EnemyArcher {
  constructor() {
    super();
    this.health = 100;
    this.maxHealth = 100;
    this.attack = 20;
    this.maxAttackCooldown = 80;
    this.size = (blockSize * 6 / 5);
    this.bulletSpeed = 15;
    this.bulletSize = 6;
    this.range = 20;
    this.accuracy = 0;
  }
}

class Odysseus extends EnemyArcher {
  constructor() {
    super();
    this.health = 250;
    this.maxHealth = 250;
    this.attack = 25;
    this.maxAttackCooldown = 60;
    this.color = "purple";
    this.bulletSpeed = 5;
    this.range = 10;
    this.accuracy = 1;
  }
}

class Teucer extends EnemyArcher {
  constructor() {
    super();
    this.health = 30;
    this.maxHealth = 30;
    this.size = (blockSize * 2 / 5);
    this.color = "purple";
  }
}

class Bullet {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.attack = 10;
    this.color = "black";
    this.size = 8;
    this.source = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  setAttack(attack) {
    this.attack = attack;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setSource(source) {
    this.source = source;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    if (Math.abs(this.x) >= 10000 || Math.abs(this.y) >= 10000) {
      toRemove.push(this);
    }
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && entities[i] !== this && entities[i] !== this.source && (!(entities[i] instanceof Block) || entities[i].isCollidable)) {
        toRemove.push(this);
        if (!(entities[i] instanceof Block)) {
          if (entities[i] instanceof EnemyArcher || (((Math.sign(this.vx) == entities[i].direction) && (entities[i].mode == 1 || entities[i].mode == 3)) || (Math.sign(this.vx) != entities[i].direction) && (entities[i].mode == 0 || entities[i].mode == 2 || entities[i].mode == 3))) {
            entities[i].health -= this.attack;
            entities[i].lastAttacked = 0;
            if (entities[i].health <= 0) {
              toRemove.push(entities[i]);
              entities.push(new DeadBody().setPosition(entities[i].x, entities[i].y).setDirection(entities[i].direction).setSize(entities[i].size));
            }
            entities[i].vx += (this.vx * blockSize / 20);
            entities[i].vy += (this.vy * blockSize / 20);
          }
          else {
            entities[i].vx += (this.vx * blockSize / 40);
            entities[i].vy += (this.vy * blockSize / 40);
          }
        }
        break;
      }
    }
  }
}

function findMessage(e) {
  if (e === player) {
    return "Diomedes";
  }
  else if (e instanceof Odysseus) {
    return "Odysseus";
  }
  else if (e instanceof Dolon) {
    return "Dolon";
  }
  else if (e instanceof Rhesus) {
    return "Rhesus";
  }
  else if (e instanceof Ajax) {
    return "Ajax the Great";
  }
  else if (e instanceof Teucer) {
    return "Teucer";
  }
  else if (e instanceof StrongKnight) {
    return "Giant";
  }
  else if (e instanceof StrongArcher) {
    return "Longbowman";
  }
  else if (e instanceof EnemyArcher) {
    return "Archer";
  }
  else {
    return "Trojan";
  }
}

function drawLabel(e) {
  if ((e instanceof Block) || (e instanceof Bullet) || e.labelCount >= 200) {
    return;
  }
  var size = Math.max(e.size, 40);
  e.labelCount++;
  ctx.fillStyle = "orange";
  ctx.fillRect(e.x - size, e.y - size * 5 / 4, size * 2, size / 2);
  ctx.fillStyle = "blue";
  ctx.font = "bold 16px serif";
  ctx.textAlign = "center";
  ctx.fillText(findMessage(e), e.x, e.y - size + 5);
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);

  var radius = (blockSize * 5 + blockSize * 5 * player.health / player.maxHealth);

  ctx.save();
  ctx.translate(screen.width / 2 - player.x, screen.height / 2 - player.y);

  ctx.save();
  var map = LEVELS[level]["map"];
  var path = new Path2D();
  path.rect(-blockSize / 2, -blockSize / 2, map[0].length * blockSize, map.length * blockSize);
  ctx.clip(path);
  ctx.fillStyle = "rgb(0, 64, 64)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < radius) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < (5 * blockSize)) {
      drawLabel(entities[i]);
    }
  }

  ctx.strokeStyle = "black";
  ctx.lineWidth = blockSize * 2;
  ctx.beginPath();
  ctx.ellipse(player.x, player.y, radius, radius, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  DrawInstructions();
}

function DrawInstructions() {
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "left";
  var instructions = LEVELS[level]["instructions"];
  if (!instructions) {
    instructions = defaultInstructions;
  }
  var y = screen.height - instructions.length * 20 - 20;
  for (var i = 0; i < instructions.length; ++i) {
    ctx.fillStyle = "black";
    ctx.fillText(instructions[i], 42, y + i * 20 + 2);
    ctx.fillStyle = "yellow";
    ctx.fillText(instructions[i], 40, y + i * 20);
  }
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "right";
  var goal = LEVELS[level]["goal"];
  var y = screen.height - goal.length * 20 - 20;
  for (var i = 0; i < goal.length; ++i) {
    ctx.fillStyle = "black";
    ctx.fillText(goal[i], screen.width - 40, y + i * 20 + 2);
    ctx.fillStyle = "white";
    ctx.fillText(goal[i], screen.width - 42, y + i * 20);
  }
}

function Tick() {
  time++;
  toRemove = [];
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  for (var i = 0; i < toRemove.length; ++i) {
    entities.splice(entities.indexOf(toRemove[i]), 1);
  }
  Draw();
}

Init();
setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
