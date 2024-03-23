"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 50;

var entities = [];

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

var keySet = {};

var map = ["",
           "B              BHHB    BHHB    BHHB    BHHB                B",
           "B       BBBBBHHBHHB    BHHB    BHHB    BHHB                B",
           "B       BHHHHHBBBBBB  BBBBBB  BBBBBB  BBBBBB               B",
           "B       BHHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB               B",
           "B       BHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB               B",
           "B       BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BHHHHHHHHHHHSSHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BHHBHHHHHHHHSSHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBHHHB               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHHB               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBB               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHHB               B",
           "B       BHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB               B",
           "B       BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB               B",
           "B       BBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH               B",
           "B       HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH               B",
           "B       HHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH               B",
           "GGHHHHGGBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBGGGGLLLLLLLLGGGG",
           "DDHHHHDDBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBDDDDLLLLLLLLDDDD",
           "DDGGGGDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];

function Init() {
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[i].length; ++j) {
      var block = map[i][j];
      if (block == " ") {
        continue;
      }
      var x = (blockSize * j);
      var y = (blockSize * i);
      if (block == "B") {
        entities.push(new Brick().setPosition(x, y));
      }
      else if (block == "H") {
        entities.push(new BackgroundBrick().setPosition(x, y));
      }
      else if (block == "G") {
        entities.push(new Grass().setPosition(x, y));
      }
      else if (block == "D") {
        entities.push(new Dirt().setPosition(x, y));
      }
      else if (block == "L") {
        entities.push(new Lava().setPosition(x, y));
      }
      else if (block == "S") {
        entities.push(new Spawner().setPosition(x, y));
      }
    }
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
    this.color1 = "rgb(128, 128, 128)";
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

class BackgroundBrick extends Brick {
  constructor() {
    super();
    this.isCollidable = false;
    this.color1 = "rgb(64, 64, 64)";
    this.color2 = "rgb(0, 0, 0)";
  }
}

class Grass extends Block {
  constructor() {
    super();
    this.color = "green";
  }
}

class Dirt extends Block {
  constructor() {
    super();
    this.color = "brown";
  }
}

class Lava extends Block {
  constructor() {
    super();
    this.color = "red";
  }
}

class Spawner extends Block {
  constructor() {
    super();
    this.isCollidable = false;
    this.color = "maroon";
  }
}

class Knight {
  constructor() {
    this.speed = blockSize / 10;
    this.x = 0;
    this.y = 0;
    this.vy = 0;
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

  setVelocity(vy) {
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

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    var oldX = this.x;
    var val = 0;
    if (keySet["ArrowLeft"]) {
      val--;
    }
    if (keySet["ArrowRight"]) {
      val++;
    }
    var shouldStop = false;
    for (var i = 0; i < this.speed; ++i) {
      this.x += val;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] instanceof Block && entities[j].isCollidable) {
          this.x -= val;
          shouldStop = true;
          break;
        }
      }
      if (shouldStop) {
        break;
      }
    }
    this.vy += (blockSize / 100);
    this.vy *= 0.95;
    var val = Math.sign(this.vy);
    var vy = Math.abs(this.vy);
    var shouldStop = false;
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] instanceof Block && entities[j].isCollidable) {
          this.y -= val;
          if (this.vy > 0 && keySet["ArrowUp"]) {
            this.vy -= (blockSize / 2);
          }
          shouldStop = true;
          break;
        }
      }
    }
  }
}

screen.width = 20 * blockSize;
screen.height = 10 * blockSize;

function Draw() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(screen.width / 2 + player.size / 2 - player.x, screen.height / 2 + player.size / 2 - player.y);
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < (blockSize * 12)) {
      entities[i].draw();
    }
  }
  ctx.restore();
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  Draw();
}

var player = new Knight().setPosition(1025, 475);

Init();
setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
