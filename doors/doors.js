"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 50;

var entities = {};
var otherEntities = [];
var player;

var smilerColorMap = ["       ",
                      "  W W  ",
                      "  W W  ",
                      "       ",
                      " W   W ",
                      "  WWW  ",
                      "       "];
var smilerColors = {
  " ": "rgb(0, 0, 0)",
  "W": "rgb(255, 255, 255)",
};
var invertedSmilerColors = {
  " ": "rgb(255, 255, 255)",
  "W": "rgb(0, 0, 0)",
};

var hasLost = false;
var hasWon = false;

var lightsOut = false;

var time = 0;
var freezeTime = 0;

function inInterval(val, a, b) {
  return (val >= a && val <= b);
}

function isInside(x, y, e) {
  return (inInterval(x, e.x - e.size / 2, e.x + e.size / 2) &&
          inInterval(y, e.y - e.size / 2, e.y + e.size / 2));
}

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

var keySet = {};

var level = 0;
var levels = [
  [
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BSHHHHHHHHBHHHBHBHBHHHHHHHHHBHBHBHBHHHHHBHB",
    "BBBBBHBBBHBBBHBHBHBBBBBBBHBHBHBHBHBBBBBHBHB",
    "BHHHHHHHBHBHHHBHHHBHBHBHHHBHHHHHBHBHHHBHBHB",
    "BHBBBBBBBBBHBBBHBBBHBHBBBBBBBHBBBHBHBBBHBHB",
    "BHHHHHBHHHBHHHBHHHHHHHHHBHHHHHBHHHHHHHHHBHB",
    "BHBBBBBHBBBHBBBHBBBBBHBBBHBHBBBBBHBBBBBHBHB",
    "BHHHBHHHBHHHHHBHBHHHBHHHBHBHHHHHHHBHHHHHBHB",
    "BBBHBHBBBHBHBBBHBBBHBBBHBHBBBHBBBBBBBBBHBHB",
    "BHHHHHHHBHBHHHHHHHHHBHHHBHBHHHBHHHBHHHHHBHB",
    "BHBHBBBHBBBBBHBHBBBHBBBBBBBBBHBBBHBBBBBHBHB",
    "BHBHHHBHBHHHBHBHBHBHBHHHHHHHHHHHBHBHHHBHBHB",
    "BBBBBHBHBBBHBBBBBHBHBBBBBHBBBHBHBHBHBHBBBHB",
    "BHHHHHBHBHHHHHBHHHHHHHBHHHBHBHBHHHHHBHBHHHB",
    "BHBBBBBHBBBBBHBHBBBHBHBBBHBHBHBBBBBBBBBHBHB",
    "BHHHHHBHHHBHHHHHBHHHBHHHHHBHHHBHBHBHHHHHBHB",
    "BHBBBBBBBBBBBBBBBBBBBBBHBBBHBBBHBHBHBBBBBHB",
    "BHHHHHBHHHHHHHHHBHHHBHHHBHHHBHHHBHBHHHHHBHB",
    "BBBBBHBHBHBBBBBBBHBBBHBHBBBBBBBHBHBBBHBHBHB",
    "BHBHHHHHBHBHBHHHBHHHHHBHHHHHBHHHHHHHHHBHBHB",
    "BHBHBBBHBHBHBHBBBHBHBBBBBBBBBBBBBHBBBBBHBHB",
    "BHHHBHHHBHHHHHHHBHBHHHHHHHBHHHHHHHHHBHBHBHB",
    "BHBBBHBBBBBBBHBBBHBBBBBBBBBBBHBBBBBHBHBHBHB",
    "BHHHBHHHHHBHBHHHHHBHHHBHHHBHHHBHBHBHBHHHBHB",
    "BHBHBBBBBHBHBHBBBBBBBHBHBHBBBHBHBHBHBBBHBHB",
    "BHBHBHHHHHHHBHHHBHBHHHHHBHHHHHBHHHHHHHBHBHB",
    "BHBHBBBBBBBBBHBHBHBBBHBHBHBBBHBBBHBBBBBBBHB",
    "BHBHHHHHBHHHBHBHHHBHBHBHBHHHBHBHHHHHHHHHBHB",
    "BHBBBHBBBHBBBHBBBHBHBHBBBBBBBBBHBBBBBBBHBHB",
    "BHHHBHBHHHHHBHBHBHHHHHBHBHHHBHBHHHHHBHHHBHB",
    "BHBBBHBHBBBBBBBHBHBBBHBHBHBHBHBBBHBBBBBHBHB",
    "BHBHHHBHBHHHBHHHHHBHHHHHHHBHHHHHBHBHHHBHBHB",
    "BBBBBHBHBHBHBBBHBHBBBBBHBBBBBBBBBBBHBHBHBHB",
    "BHHHHHHHHHBHBHBHBHBHBHHHHHBHHHHHBHHHBHBHBHB",
    "BHBBBHBHBHBBBHBBBHBHBBBHBBBHBBBBBHBBBHBBBHB",
    "BHHHBHBHBHHHBHHHHHHHHHBHHHBHBHHHHHHHBHHHBHB",
    "BBBHBBBBBHBBBBBBBBBBBBBBBHBHBBBHBHBHBBBBBHBBB",
    "BHHHHHBHHHHHBHHHHHBHBHHHBHHHHHHHBHBHHHBHBLLLB",
    "BBBHBBBBBBBBBHBBBHBHBHBHBBBHBBBBBBBHBHBHBLELB",
    "BHHHHHHHHHHHHHBHHHHHHHBHHHBHHHBHHHHHBHHHBLLLB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", 
  ],
  [
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHLLLHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHLLLHB",
    "BHLELHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHLELHB",
    "BHLLLHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHLLLHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHLLLHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHLSLHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHLLLHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BHLLLHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHLLLHB",
    "BHLELHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHLELHB",
    "BHLLLHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHBBBHLLLHB",
    "BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
    "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
  ],
  [
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTStttttTTWWWWttttttTTttwwwwTTwwwwttttttTT",
    "TTttttttTTWWWWttttttTTttwwwwTTwwwwttttttTT",
    "TTTTTTttTTTTTTttTTttTTttTTTTTTTTTTttTTWWTT",
    "TTTTTTttTTTTTTttTTttTTttTTTTTTTTTTttTTWWTT",
    "TTwwwwttTTwwwwwwTTttTTttttttttttttttTTWWTT",
    "TTwwwwttTTwwwwwwTTttTTttttttttttttttTTWWTT",
    "TTTTTTttTTTTTTTTTTttTTttTTttTTTTTTTTTTTTTT",
    "TTTTTTttTTTTTTTTTTttTTttTTttTTTTTTTTTTTTTT",
    "TTttttttwwwwwwwwwwttttttTTttTTttTTttwwwwTT",
    "TTttttttwwwwwwwwwwttttttTTttTTttTTttwwwwTT",
    "TTttTTttTTTTTTTTTTTTTTttTTTTTTttTTttTTTTTT",
    "TTttTTttTTTTTTTTTTTTTTttTTTTTTttTTttTTTTTT",
    "TTttTTttTTwwTTttttttttttwwwwwwttttttTTttTT",
    "TTttTTttTTwwTTttttttttttwwwwwwttttttTTttTT",
    "TTttTTTTTTwwTTTTTTTTTTttTTWWTTttTTTTTTttTT",
    "TTttTTTTTTwwTTTTTTTTTTttTTWWTTttTTTTTTttTT",
    "TTttTTwwWWWWWWwwwwwwwwttTTWWTTttttttTTttTT",
    "TTttTTwwWWWWWWwwwwwwwwttTTWWTTttttttTTttTT",
    "TTTTTTwwTTTTTTwwTTTTTTttTTTTTTTTTTttTTttTT",
    "TTTTTTwwTTTTTTwwTTTTTTttTTTTTTTTTTttTTttTT",
    "TTttttttTTttttttTTttTTttttttTTttTTttttttTT",
    "TTttttttTTttttttTTttTTttttttTTttTTttttttTT",
    "TTttTTTTTTttTTttTTttTTttTTTTTTttTTTTTTwwTT",
    "TTttTTTTTTttTTttTTttTTttTTTTTTttTTTTTTwwTT",
    "TTttTTttttttTTttTTwwwwwwwwwwTTttttttTTwwTT",
    "TTEtTTttttttTTttTTwwwwwwwwwwTTttttttTTwwTT",
    "TTTTTTttTTttTTttTTTTTTTTTTTTTTwwTTttTTwwTT",
    "TTTTTTttTTttTTttTTTTTTTTTTTTTTwwTTttTTwwTT",
    "TTwwwwttTTttTTttttttTTttTTttttwwTTttTTWWTT",
    "TTwwwwttTTttTTttttttTTttTTttttwwTTttTTWWTT",
    "TTTTTTTTTTTTTTttTTttTTttTTTTTTwwTTTTTTWWTT",
    "TTTTTTTTTTTTTTttTTttTTttTTTTTTwwTTTTTTWWTT",
    "TTttttttttttttttTTttttttTTWWWWwwwwwwTTWWTT",
    "TTttttttttttttttTTttttttTTWWWWwwwwwwTTWWTT",
    "TTttTTTTTTTTTTttTTttTTTTTTTTTTwwTTwwTTTTTT",
    "TTttTTTTTTTTTTttTTttTTTTTTTTTTwwTTwwTTTTTT",
    "TTttWWWWTTttttttTTwwwwwwwwwwwwwwTTwwwwwwTT",
    "TTttWWWWTTttttttTTwwwwwwwwwwwwwwTTwwwwwwTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  ],
];

var shouldAddLights = {0: true, 1: false, 2: false};
var lightsRemainOut = {0: false, 1: true, 2: false};
var safeTime = {0: 200, 1: 100, 2: 0};
var lightFlickerRate = {0: 0.0025, 1: 1, 2: 0};
var seeThroughWalls = {0: false, 1: true, 2: false};

function Init() {
  var map = levels[level];
  entities = {};
  hasLost = false;
  hasWon = false;
  lightsOut = false;
  time = 0;
  freezeTime = 0;
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[i].length; ++j) {
      var block = map[i][j];
      if (block == " ") {
        continue;
      }
      var x = (blockSize * j);
      var y = (blockSize * i);
      var val = String(x) + "," + String(y);
      if (block == "B") {
        entities[val] = new Brick().setPosition(x, y);
      }
      else if (block == "H") {
        if (shouldAddLights[level] && Math.random() < 0.01) {
          entities[val] = new Light().setPosition(x, y);
        }
        else {
          entities[val] = new BackgroundBrick().setPosition(x, y);
        }
      }
      else if (block == "T") {
        entities[val] = new Tile().setPosition(x, y);
      }
      else if (block == "t") {
        if (shouldAddLights[level] && Math.random() < 0.01) {
          entities[val] = new Light().setPosition(x, y);
        }
        else {
          entities[val] = new BackgroundTile().setPosition(x, y);
        }
      }
      else if (block == "w") {
        entities[val] = new Water().setPosition(x, y);
      }
      else if (block == "W") {
        entities[val] = new DeepWater().setPosition(x, y);
      }
      else if (block == "L") {
        entities[val] = new Light().setPosition(x, y);
      }
      else if (block == "S") {
        entities[val] = new Light().setPosition(x, y);
        player = new Player().setPosition(x, y);
      }
      else {
        entities[val] = new Exit().setPosition(x, y);
      }
    }
  }
  otherEntities = [player];
}

function findBlock(x, y) {
  x += (blockSize * 201 / 2);
  x = x - (x % blockSize);
  x -= (blockSize * 100);
  y += (blockSize * 201 / 2);
  y = y - (y % blockSize);
  y -= (blockSize * 100);
  var val = String(Math.round(x)) + "," + String(Math.round(y));
  if (val in entities) {
    return val;
  }
  return "";
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
    this.defaultColor = [128, 64, 0];
    this.color2 = "rgb(0, 0, 0)";
  }

  distToClosestLightSource() {
    var best = distance(this, player);
    if (lightsOut) {
      return best * 2;
    }
    for (var i in entities) {
      if (entities[i] instanceof Light) {
        best = Math.min(best, distance(this, entities[i]) / 2);
      }
    }
    return best;
  }

  draw() {
    var dist = Math.max(1, this.distToClosestLightSource() / blockSize);
    ctx.fillStyle = "rgb(" +
                      String(Math.round(this.defaultColor[0] / dist)) + "," +
                      String(Math.round(this.defaultColor[1] / dist)) + "," +
                      String(Math.round(this.defaultColor[2] / dist)) + ")";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.strokeStyle = this.color2;
    ctx.lineWidth = (blockSize / 10);
    ctx.beginPath();
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 4);
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 4);
    ctx.moveTo(this.x - this.size / 2, this.y);
    ctx.lineTo(this.x + this.size / 2, this.y);
    ctx.moveTo(this.x - this.size / 2, this.y + this.size / 4);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 4);
    ctx.moveTo(this.x, this.y - this.size / 2);
    ctx.lineTo(this.x, this.y - this.size / 4);
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.size / 4);
    ctx.stroke();
  }
}

class BackgroundBrick extends Brick {
  constructor() {
    super();
    this.isCollidable = false;
    this.defaultColor = [64, 32, 0];
  }
}

class Tile extends Block {
  constructor() {
    super();
    this.color = "rgb(180, 192, 180)";
    this.color2 = "rgb(128, 128, 128)";
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2 - 1, this.y - this.size / 2 - 1, this.size + 2, this.size + 2);
    ctx.strokeStyle = this.color2;
    ctx.lineWidth = (blockSize / 25);
    ctx.beginPath();
    for (var i = 0; i < 5; ++i) {
      ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2 + this.size * i / 4);
      ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2 + this.size * i / 4);
      ctx.moveTo(this.x - this.size / 2 + this.size * i / 4, this.y - this.size / 2);
      ctx.lineTo(this.x - this.size / 2 + this.size * i / 4, this.y + this.size / 2);
    }
    ctx.stroke();
  }
}

class BackgroundTile extends Tile {
  constructor() {
    super();
    this.isCollidable = false;
    this.color = "rgb(120, 128, 120)";
    this.color2 = "rgb(96, 96, 96)";
  }
}

class Light extends Brick {
  constructor() {
    super();
    this.defaultColor = [255, 255, 128];
    this.isCollidable = false;
  }

  draw() {
    var dist = Math.max(1, this.distToClosestLightSource() / blockSize);
    if (lightsOut) {
      dist = Math.max(dist, blockSize / 5);
    }
    ctx.fillStyle = "rgb(" +
                      String(Math.round(this.defaultColor[0] / dist)) + "," +
                      String(Math.round(this.defaultColor[1] / dist)) + "," +
                      String(Math.round(this.defaultColor[2] / dist)) + ")";
    ctx.fillRect(this.x - this.size / 2 - 1, this.y - this.size / 2 - 1, this.size + 2, this.size + 2);
  }
}

class Water extends BackgroundTile {
  constructor() {
    super();
    this.color = "rgb(128, 255, 223)";
    this.color2 = "rgb(128, 192, 176)";
  }
}

class DeepWater extends Block {
  constructor() {
    super();
    this.isCollidable = false;
    this.color = "rgb(64, 128, 112)";
  }
}

class Exit extends Light {
  constructor() {
    super();
    this.defaultColor = [0, 255, 0];
  }
}

class Player {
  constructor() {
    this.speed = (blockSize / 5);
    this.x = 0;
    this.y = 0;
    this.size = blockSize * 0.8;
    this.color = "blue";
    this.isEnemy = false;
    this.hasBumped = false;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
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

  setColor(color) {
    this.color = color;
    return this;
  }

  setIsEnemy(isEnemy) {
    this.isEnemy = isEnemy;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  inRoom() {
    var corners = 0;
    for (var x = -1; x <= 1; ++x) {
      if (x == 0) {
        continue;
      }
      for (var y = -1; y <= 1; ++y) {
        if (y == 0) {
          continue;
        }
        var e = entities[findBlock(this.x + blockSize * x, this.y + blockSize * y)];
        if (e.isCollidable) {
          corners++;
        }
      }
    }
    return (corners < 4);
  }

  getVelocity() {
    var vx = 0;
    if (keySet["ArrowLeft"]) {
      vx--;
    }
    if (keySet["ArrowRight"]) {
      vx++;
    }
    var vy = 0;
    if (keySet["ArrowUp"]) {
      vy--;
    }
    if (keySet["ArrowDown"]) {
      vy++;
    }
    return [vx, vy];
  }

  tick() {
    var val = this.getVelocity();
    this.hasBumped = false;
    var vx = this.speed * val[0];
    var vy = this.speed * val[1];
    for (var i = 0; i < Math.abs(vx); ++i) {
      this.x += Math.sign(vx);
      var failed = false;
      for (var x = -1; x <= 1; ++x) {
        for (var y = -1; y <= 1; ++y) {
          var e = entities[findBlock(this.x + blockSize * x, this.y + blockSize * y)];
          if (touches(this, e)) {
            if (e instanceof Exit && !this.isEnemy) {
              hasWon = true;
            }
            if (e.isCollidable) {
              failed = true;
            }
          }
        }
      }
      if (failed) {
        this.hasBumped = true;
        this.x -= Math.sign(vx);
        break;
      }
      failed = false;
      for (var j = 0; j < otherEntities.length; ++j) {
        if (otherEntities[j] !== this && touches(this, otherEntities[j])) {
          if (this.isEnemy != otherEntities[j].isEnemy) {
            hasLost = true;
          }
          failed = true;
        }
      }
      if (failed) {
        this.hasBumped = true;
        this.x -= Math.sign(vx);
        break;
      }
    }
    for (var i = 0; i < Math.abs(vy); ++i) {
      this.y += Math.sign(vy);
      var failed = false;
      for (var x = -1; x <= 1; ++x) {
        for (var y = -1; y <= 1; ++y) {
          var e = entities[findBlock(this.x + blockSize * x, this.y + blockSize * y)];
          if (touches(this, e)) {
            if (e instanceof Exit && !this.isEnemy) {
              hasWon = true;
            }
            if (e.isCollidable) {
              failed = true;
            }
          }
        }
      }
      if (failed) {
        this.hasBumped = true;
        this.y -= Math.sign(vy);
        break;
      }
      failed = false;
      for (var j = 0; j < otherEntities.length; ++j) {
        if (otherEntities[j] !== this && touches(this, otherEntities[j])) {
          if (this.isEnemy != otherEntities[j].isEnemy) {
            hasLost = true;
          }
          failed = true;
        }
      }
      if (failed) {
        this.hasBumped = true;
        this.y -= Math.sign(vy);
        break;
      }
    }
  }
}

class Smiler extends Player {
  constructor() {
    super();
    this.speed = (blockSize / 10);
    this.isEnemy = true;
    this.direction = Math.floor(Math.random() * 4);
    this.colorMap = smilerColorMap;
    this.colors = smilerColors;
    this.wasInRoom = false;
    this.hasBumpedInRoom = false;
  }

  draw() {
    for (var i = 0; i < this.colorMap.length; ++i) {
      for (var j = 0; j < this.colorMap[0].length; ++j) {
        ctx.fillStyle = this.colors[this.colorMap[i][j]];
        ctx.fillRect(this.x - this.size / 2 + j * this.size / this.colorMap[0].length - 1,
                     this.y - this.size / 2 + i * this.size / this.colorMap.length - 1,
                     this.size / this.colorMap[0].length + 2,
                     this.size / this.colorMap.length + 2);
      }
    }
  }

  moveRoom() {
    var angle = Math.atan2(player.y - this.y, player.x - this.x);
    return [Math.cos(angle), Math.sin(angle)];
  }

  moveMaze() {
    if (this.hasBumped || Math.random() < 0.025) {
      this.direction = (this.direction + 2 * Math.round(Math.random()) + 1) % 4;
    }
    if (this.direction == 0) {
      return [0, -1];
    }
    else if (this.direction == 1) {
      return [1, 0];
    }
    else if (this.direction == 2) {
      return [0, 1];
    }
    else {
      return [-1, 0];
    }
  }

  getVelocity() {
    if (this.inRoom()) {
      if (this.hasBumped && this.wasInRoom) {
        this.hasBumpedInRoom = true;
      }
      if (this.hasBumpedInRoom) {
        if (Math.random() < 0.025) {
          this.hasBumpedInRoom = false;
        }
        return this.moveMaze();
      }
      this.wasInRoom = true;
      return this.moveRoom();
    }
    else {
      this.wasInRoom = false;
      this.hasBumpedInRoom = false;
      return this.moveMaze();
    }
  }
}

function doCasts(maxDist) {
  var rays = 1800;
  var increment = 10;
  var toDraw = new Set();
  var toDraw2 = new Set();
  for (var angle = 0; angle < rays; ++angle) {
    var ang = (angle * 2 * Math.PI / rays);
    var x = player.x;
    var y = player.y;
    for (var i = 0; i < (maxDist / increment); ++i) {
      x += increment * Math.cos(ang);
      y += increment * Math.sin(ang);
      var e = findBlock(x, y);
      if (e == "") {
        continue;
      }
      toDraw.add(e);
      if (!seeThroughWalls[level]) {
        for (var j = 0; j < otherEntities.length; ++j) {
          if (isInside(x, y, otherEntities[j]) || distance(player, otherEntities[j]) <= (5 * blockSize)) {
            toDraw2.add(String(Math.round(otherEntities[j].x)) + "," + String(Math.round(otherEntities[j].y)));
          }
        }
      }
      if (entities[e].isCollidable) {
        break;
      }
    }
  }
  for (var i of toDraw) {
    entities[i].draw();
  }
  for (var i = 0; i < otherEntities.length; ++i) {
    if (seeThroughWalls[level] || toDraw2.has(String(Math.round(otherEntities[i].x)) + "," + String(Math.round(otherEntities[i].y)))) {
      otherEntities[i].draw();
    }
  }
}

function jumpScare(colorMap, colors) {
  for (var i = 0; i < colorMap.length; ++i) {
    for (var j = 0; j < colorMap[0].length; ++j) {
      ctx.fillStyle = colors[colorMap[i][j]];
      ctx.fillRect(screen.width / 2 - screen.height / 2 + j * screen.height / colorMap[0].length - 1,
                   i * screen.height / colorMap.length - 1,
                   screen.height / colorMap[0].length + 2,
                   screen.height / colorMap.length + 2);
    }
  }
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  if (hasLost) {
    jumpScare(smilerColorMap, smilerColors);
    return;
  }
  if (hasWon) {
    jumpScare(smilerColorMap, invertedSmilerColors);
    return;
  }
  ctx.save();
  ctx.translate(screen.width / 2 + player.size / 2 - player.x, screen.height / 2 + player.size / 2 - player.y);
  doCasts(5 * blockSize);
  ctx.restore();
}

function Tick() {
  if (hasLost) {
    if (freezeTime < 200) {
      Draw();
      freezeTime++;
      return;
    }
    Init();
  }
  time++;
  if (hasWon) {
    if (level < (levels.length - 1)) {
      level++;
      Init();
    }
    else {
      Draw();
    }
    return;
  }
  if (Math.random() < lightFlickerRate[level] && time >= safeTime[level] && !(lightsOut && lightsRemainOut[level])) {
    lightsOut = !lightsOut;
    if (lightsOut) {
      for (i in entities) {
        if (entities[i] instanceof Light) {
          otherEntities.push(new Smiler().setPosition(entities[i].x, entities[i].y));
        }
      }
    }
    else {
      otherEntities = [player];
    }
  }
  for (var i = 0; i < otherEntities.length; ++i) {
    otherEntities[i].tick();
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
