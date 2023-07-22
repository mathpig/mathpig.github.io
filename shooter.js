"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entities = [];

var keySet = {};

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

function touches(e1, e2) {
  return (overlaps(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          overlaps(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = 10;
    this.color = "green";
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

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
  }
}

class Player extends Block {
  constructor() {
    super();
    this.speed = 1;
    this.color = "black";
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  tick() {
    var vx = 0;
    if (keySet["ArrowRight"]) {
      vx += this.speed;
    }
    if (keySet["ArrowLeft"]) {
      vx -= this.speed;
    }
    for (var i = 0; i < entities.length; ++i) {
      while (touches(this, entities[i]) && entities[i] !== this) {
        this.x -= Math.sign(this.vx);
      }
    }
    this.x += vx;
    var vy = 0;
    if (keySet["ArrowUp"]) {
      vy -= this.speed;
    }
    if (keySet["ArrowLeft"]) {
      vy += this.speed;
    }
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && entities[i] !== this) {
        this.y -= Math.sign(this.vy);
      }
    }
    this.y += vy;
  }
}

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

function Draw() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  Draw();
}

var player = new Player().setPosition(screen.width / 2, screen.height / 2);
entities.push(player);

for (var i = 0; i < 500; ++i) {
  entities.push(new Block().setPosition(randint(100, screen.width - 100), randint(100, screen.height - 100)));
  for (var j = 0; j < (entities.length - 1); ++j) {
    if (touches(entities[entities.length - 1], entities[j])) {
      entities.pop();
      break;
    }
  }
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
