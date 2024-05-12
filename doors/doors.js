"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 50;

var entities = [];
var otherEntities = [];
var player;

var lightsOut = false;

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

var map = [
  "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
  "BSHHHHHHHHBHHHBHBHBHHHHHHHHHBHBHBHBHHHHHB",
  "BBBBBHBBBHBBBHBHBHBBBBBBBHBHBHBHBHBBBBBHB",
  "BHHHHHHHBHBHHHBHHHBHBHBHHHBHHHHHBHBHHHBHB",
  "BHBBBBBBBBBHBBBHBBBHBHBBBBBBBHBBBHBHBBBHB",
  "BHHHHHBHHHBHHHBHHHHHHHHHBHHHHHBHHHHHHHHHB",
  "BHBBBBBHBBBHBBBHBBBBBHBBBHBHBBBBBHBBBBBHB",
  "BHHHBHHHBHHHHHBHBHHHBHHHBHBHHHHHHHBHHHHHB",
  "BBBHBHBBBHBHBBBHBBBHBBBHBHBBBHBBBBBBBBBHB",
  "BHHHHHHHBHBHHHHHHHHHBHHHBHBHHHBHHHBHHHHHB",
  "BHBHBBBHBBBBBHBHBBBHBBBBBBBBBHBBBHBBBBBHB",
  "BHBHHHBHBHHHBHBHBHBHBHHHHHHHHHHHBHBHHHBHB",
  "BBBBBHBHBBBHBBBBBHBHBBBBBHBBBHBHBHBHBHBBB",
  "BHHHHHBHBHHHHHBHHHHHHHBHHHBHBHBHHHHHBHBHB",
  "BHBBBBBHBBBBBHBHBBBHBHBBBHBHBHBBBBBBBBBHB",
  "BHHHHHBHHHBHHHHHBHHHBHHHHHBHHHBHBHBHHHHHB",
  "BHBBBBBBBBBBBBBBBBBBBBBHBBBHBBBHBHBHBBBBB",
  "BHHHHHBHHHHHHHHHBHHHBHHHBHHHBHHHBHBHHHHHB",
  "BBBBBHBHBHBBBBBBBHBBBHBHBBBBBBBHBHBBBHBHB",
  "BHBHHHHHBHBHBHHHBHHHHHBHHHHHBHHHHHHHHHBHB",
  "BHBHBBBHBHBHBHBBBHBHBBBBBBBBBBBBBHBBBBBHB",
  "BHHHBHHHBHHHHHHHBHBHHHHHHHBHHHHHHHHHBHBHB",
  "BHBBBHBBBBBBBHBBBHBBBBBBBBBBBHBBBBBHBHBHB",
  "BHHHBHHHHHBHBHHHHHBHHHBHHHBHHHBHBHBHBHHHB",
  "BHBHBBBBBHBHBHBBBBBBBHBHBHBBBHBHBHBHBBBHB",
  "BHBHBHHHHHHHBHHHBHBHHHHHBHHHHHBHHHHHHHBHB",
  "BHBHBBBBBBBBBHBHBHBBBHBHBHBBBHBBBHBBBBBBB",
  "BHBHHHHHBHHHBHBHHHBHBHBHBHHHBHBHHHHHHHHHB",
  "BHBBBHBBBHBBBHBBBHBHBHBBBBBBBBBHBBBBBBBHB",
  "BHHHBHBHHHHHBHBHBHHHHHBHBHHHBHBHHHHHBHHHB",
  "BHBBBHBHBBBBBBBHBHBBBHBHBHBHBHBBBHBBBBBHB",
  "BHBHHHBHBHHHBHHHHHBHHHHHHHBHHHHHBHBHHHBHB",
  "BBBBBHBHBHBHBBBHBHBBBBBHBBBBBBBBBBBHBHBHB",
  "BHHHHHHHHHBHBHBHBHBHBHHHHHBHHHHHBHHHBHBHB",
  "BHBBBHBHBHBBBHBBBHBHBBBHBBBHBBBBBHBBBHBBB",
  "BHHHBHBHBHHHBHHHHHHHHHBHHHBHBHHHHHHHBHHHB",
  "BBBHBBBBBHBBBBBBBBBBBBBBBHBHBBBHBHBHBBBBB",
  "BHHHHHBHHHHHBHHHHHBHBHHHBHHHHHHHBHBHHHBHB BBBBB",
  "BBBHBBBBBBBBBHBBBHBHBHBHBBBHBBBBBBBHBHBHBBBHHHB",
  "BHHHHHHHHHHHHHBHHHHHHHBHHHBHHHBHHHHHBHHHHHHHLHB",
  "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBHHHB", 
  "                                          BBBBB", 
];

function Init() {
  entities = [];
  otherEntities = [];
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
        if (Math.random() < 0.01) {
          entities[val] = new Light().setPosition(x, y);
        }
        else {
          entities[val] = new BackgroundBrick().setPosition(x, y);
        }
      }
      else if (block == "L") {
        entities[val] = new Light().setPosition(x, y);
      }
      else if (block == "S") {
        entities[val] = new Light().setPosition(x, y);
        player = new Knight().setPosition(x, y);
      }
    }
  }
  otherEntities.push(player);
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
      return best * 5;
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
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

class Knight {
  constructor() {
    this.speed = (blockSize / 5);
    this.x = 0;
    this.y = 0;
    this.size = blockSize * 0.8;
    this.color = "blue";
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

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    var val = 0;
    if (keySet["ArrowLeft"]) {
      val--;
    }
    if (keySet["ArrowRight"]) {
      val++;
    }
    for (var i = 0; i < this.speed; ++i) {
      this.x += val;
      var failed = false;
      for (var j in entities) {
        if (touches(this, entities[j]) && entities[j].isCollidable) {
          failed = true;
          break;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
      var failed = false;
      for (var j = 0; j < otherEntities.length; ++j) {
        if (otherEntities[j] !== this && touches(this, otherEntities[j])) {
          failed = true;
          break;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
    }
    var val = 0;
    if (keySet["ArrowUp"]) {
      val--;
    }
    if (keySet["ArrowDown"]) {
      val++;
    }
    for (var i = 0; i < this.speed; ++i) {
      this.y += val;
      var failed = false;
      for (var j in entities) {
        if (touches(this, entities[j]) && entities[j].isCollidable) {
          failed = true;
          break;
        }
      }
      if (failed) {
        this.y -= val;
        break;
      }
      var failed = false;
      for (var j = 0; j < otherEntities.length; ++j) {
        if (otherEntities[j] !== this && touches(this, otherEntities[j])) {
          failed = true;
          break;
        }
      }
      if (failed) {
        this.y -= val;
        break;
      }
    }
  }
}

function doCasts(maxDist) {
  var rays = 1800;
  var increment = 10;
  var toDraw = new Set();
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
      if (entities[e].isCollidable) {
        break;
      }
    }
  }
  for (var i of toDraw) {
    entities[i].draw();
  }
}

screen.width = 20 * blockSize;
screen.height = 10 * blockSize;

function Draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(screen.width / 2 + player.size / 2 - player.x, screen.height / 2 + player.size / 2 - player.y);
  doCasts(12 * blockSize);
  for (var i = 0; i < otherEntities.length; ++i) {
    otherEntities[i].draw();
  }
  ctx.restore();
}

function Tick() {
  if (Math.random() < 0.0025) {
    lightsOut = !lightsOut;
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
