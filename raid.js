"use strict";

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function rangeTouches(a, b, c, d) {
  return (b > c && d > a);
}

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var mapWidth = 96;
var mapHeight = Math.round(mapWidth * 3 / 4);

var blockSize = Math.floor(screen.width / mapWidth);

var entities = [];

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.sx = blockSize;
    this.sy = blockSize;
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

class Air extends Block {
  constructor() {
    super();
    this.solid = false;
  }

  draw() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.x, this.y, this.sx, this.sy);
  }
}

class Dirt extends Block {
  draw() {
    ctx.fillStyle = "brown";
    ctx.fillRect(this.x, this.y, this.sx, this.sy);
  }
}

class Grass extends Block {
  draw() {
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x, this.y, this.sx, this.sy / 4);
    ctx.fillStyle = "brown";
    ctx.fillRect(this.x, this.y + this.sy / 4, this.sx, this.sy * 3 / 4);
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
      xGain = -blockSize / 8;
    }
    else if (this.keySet["ArrowRight"]) {
      xGain = blockSize / 8;
    }
    this.x += xGain;

    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i].solid && entities[i] !== this) {
        while (this.touches(entities[i])) {
          this.x -= Math.sign(xGain);
        }
      }
    }

    this.vy += 0.5;

    if (this.keySet["ArrowUp"]) {
      this.vy -= blockSize / 2;
    }
    this.vy = Math.max(Math.min(this.vy, blockSize / 2), -blockSize / 4);
    var yGain = this.vy;

    this.y += yGain;

    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i].solid && entities[i] !== this) {
        while (this.touches(entities[i])) {
          this.y -= Math.sign(yGain);
          this.vy = 0;
        }
      }
    }

    this.x = Math.max(Math.min(screen.width - this.sx, this.x), 0);
    this.y = Math.max(Math.min(screen.height - this.sy, this.y), 0);
  }
}

function Tick() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Block && !entities[i].solid) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (!entities[i] instanceof Block || entities[i].solid) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
}

var seedX = randint(-1000000, 1000000);
var seedY = randint(-1000000, 1000000);

var donePlayer = false;

for (var i = 0; i < mapWidth; ++i) {
  var seenDirt = false;
  for (var j = 0; j < mapHeight; ++j) {
    var val = perlin(seedX + i / 16, seedY + j / 16) + (mapHeight / 2 - j) / mapHeight;
    if (val < 0) {
      if (seenDirt) {
        entities.push(new Dirt().setPosition(i * blockSize, j * blockSize));
      }
      else {
        if (j >= 2 && !donePlayer) {
          donePlayer = true;
          entities.push(new Player().setPosition((i + 1 / 8) * blockSize, (j - 7 / 4) * blockSize).setSize(blockSize * 3 / 4, blockSize * 3 / 2).setColor("yellow"));
        }
        entities.push(new Grass().setPosition(i * blockSize, j * blockSize));
      }
      seenDirt = true;
    }
    else {
      entities.push(new Air().setPosition(i * blockSize, j * blockSize));
    }
  }
}

screen.width = blockSize * mapWidth;
screen.height = blockSize * mapHeight;

setInterval(Tick, 20);

window.onkeydown = function(e) {
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Player) {
      entities[i].keySet[e.key] = true;
    }
  }
};

window.onkeyup = function(e) {
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Player) {
      entities[i].keySet[e.key] = false;
    }
  }
};

/*
var gameMap = ["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
               "D                              D",
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
               "DS             DD              D",
               "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];
*/
