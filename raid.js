"use strict";

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function rangeTouches(a, b, c, d) {
  return (b > c && d > a);
}

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var blockSize = screen.width / 32;

var entities = [];

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.sx = 0;
    this.sy = 0;
    this.solid = true;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(sx, sy) {
    this.sx = sx;
    this.sy = sy;
    return this;
  }

  setSolid(solid) {
    this.solid = solid;
    return this;
  }

  tick() {
  }
}

class Dirt extends Block {
  constructor() {
    super();
    this.sx = blockSize;
    this.sy = blockSize;
  }

  draw() {
    ctx.fillStyle = "brown";
    ctx.fillRect(this.x, this.y, this.sx, this.sy);
  }
}

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.sx = 0;
    this.sy = 0;
    this.solid = true;
    this.color = "";
    this.keySet = {};
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVelocity(vy) {
    this.vy = vy;
    return this;
  }

  setSize(sx, sy) {
    this.sx = sx;
    this.sy = sy;
    return this;
  }

  setSolid(solid) {
    this.solid = solid;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  touches(other) {
    return (rangeTouches(this.x, this.x + this.sx, other.x, other.x + other.sx) && rangeTouches(this.y, this.y + this.sy, other.y, other.y + other.sy));
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.sx, this.sy);
  }

  tick() {
    var xGain = 0;
    if (this.keySet["ArrowLeft"] && this.keySet["ArrowRight"]) {
      xGain = 0;
    }
    else if (this.keySet["ArrowLeft"]) {
      xGain = -5;
    }
    else if (this.keySet["ArrowRight"]) {
      xGain = 5;
    }
    this.x += xGain;

    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i] !== this) {
        this.x -= xGain;
        break;
      }
    }

    this.vy += 1;

    if (this.keySet["ArrowUp"]) {
      this.vy -= 5;
    }
    this.vy = Math.max(Math.min(this.vy, 5), -5);
    var yGain = this.vy;

    this.y += yGain;

    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i] !== this) {
        this.y -= yGain;
        break;
      }
    }

    this.x = Math.max(Math.min(screen.width - this.sx, this.x), 0);
    this.y = Math.max(Math.min(screen.height - this.sy, this.y), 0);
  }
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  ctx.fillStyle = "cyan";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
}

var gameMap = ["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
               "DS                             D",
               "DDDDD      DDDDDDDDDD      DDDDD",
               "D   D       D      D       D   D",
               "D D D       DD DD DD       D D D",
               "D DDD        D    D        DDD D",
               "D            D    D            D",
               "D             D  D             D",
               "D             D  D             D",
               "D         DD  D  D  DD         D",
               "D          DDDD  DDDD          D",
               "D          DDDD  DDDD          D",
               "D                              D",
               "D              DD              D",
               "D             DDDD             D",
               "D            DD  DD            D",
               "D                              D",
               "D            DD  DD            D",
               "D             DDDD             D",
               "D DDDDDDDDDDDDDDDDDDDDDDDDDDDD D",
               "D DD           DD           DD D",
               "D        D     DD     D        D",
               "D              DD              D",
               "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];

for (var i = 0; i < gameMap.length; ++i) {
  for (var j = 0; j < gameMap[i].length; ++j) {
    if (gameMap[i][j] == "S") {
      var player = new Player().setSize(blockSize * 3 / 4, blockSize * 3 / 4).setPosition((j + 1 / 8) * blockSize, (i + 1 / 8) * blockSize).setColor("yellow");
      entities.push(player);
    }
    else if (gameMap[i][j] == "D") {
      entities.push(new Dirt().setPosition(j * blockSize, i * blockSize));
    }
  }
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  player.keySet[e.key] = true;
};

window.onkeyup = function(e) {
  player.keySet[e.key] = false;
};
