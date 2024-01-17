"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entities = [];

var keySet = {};

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function intervalTouches(a, b, c, d) {
  return !((b < c) || (d < a));
}

function touches(e1, e2) {
  return intervalTouches(e1.x - e1.sizeX / 2, e1.x + e1.sizeX / 2, e2.x - e2.sizeX / 2, e2.x + e2.sizeX / 2) &&
         intervalTouches(e1.y - e1.sizeY / 2, e1.y + e1.sizeY / 2, e2.y - e2.sizeY / 2, e2.y + e2.sizeY / 2);
}

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.sizeX = 20;
    this.sizeY = 20;
    this.color = "black";
    this.isWall = false;
    this.gravityAffected = true;
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

  setSize(sizeX, sizeY) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setIsWall(isWall) {
    this.isWall = isWall;
    return this;
  }

  setGravityAffected(gravityAffected) {
    this.gravityAffected = gravityAffected;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.sizeX / 2, this.y - this.sizeY / 2, this.sizeX, this.sizeY);
  }

  tick() {
    if (this.isWall) {
      return;
    }
    var oldX = this.x;
    this.x += this.vx;
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] !== this && touches(this, entities[i])) {
        if (!entities[i].isWall) {
          entities[i].vx += this.vx / 2;
        }
        this.vx = -this.vx / 2;
        this.x = oldX;
        break;
      }
    }
    var oldY = this.y;
    this.y += this.vy;
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] !== this && touches(this, entities[i])) {
        if (!entities[i].isWall) {
          entities[i].vy += this.vy / 2;
        }
        this.vy = -this.vy / 2;
        this.y = oldY;
        break;
      }
    }
    this.vx *= 0.9;
    this.vy *= 0.9;
    if (this.gravityAffected) {
      this.vy += 0.1;
    }
  }
}

class Player extends Entity {
  tick() {
    if (keySet["ArrowUp"]) {
      this.vy -= 1;
    }
    if (keySet["ArrowRight"]) {
      this.vx += 1;
    }
    if (keySet["ArrowDown"]) {
      this.vy += 1;
    }
    if (keySet["ArrowLeft"]) {
      this.vx -= 1;
    }
    super.tick();
  }
}

function Draw() {
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(-player.x + screen.width / 2, -player.y + screen.height / 2);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
  ctx.restore();
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  Draw();
}

var player = new Player().setPosition(250, 250).setColor("green");
entities.push(player);

entities.push(new Entity().setPosition(250, 0).setSize(300, 100).setIsWall(true));
entities.push(new Entity().setPosition(500, 250).setSize(100, 300).setIsWall(true));
entities.push(new Entity().setPosition(250, 500).setSize(300, 100).setIsWall(true));
entities.push(new Entity().setPosition(0, 250).setSize(100, 300).setIsWall(true));

for (var i = 0; i < 100; ++i) {
  while (true) {
    var x = randint(100, 400);
    var y = randint(100, 400);
    var entity = new Entity().setPosition(x, y);
    var failed = false;
    for (var j = 0; j < entities.length; ++j) {
      if (touches(entity, entities[j])) {
        failed = true;
        break;
      }
    }
    if (failed) {
      continue;
    }
    entities.push(entity);
    break;
  }
}

setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
