"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entities = [];

var keySet = {};

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function uniform(a, b) {
  return a + Math.random() * (b - a);
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
    this.angle = 0;
    this.size = 25;
    this.color = "green";
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setAngle(angle) {
    this.angle = angle;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  drawInside() {
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);
    this.drawInside();
    ctx.restore();
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

  drawInside() {
    super.drawInside();
    ctx.fillStyle = "red";
    ctx.fillRect(0, -this.size / 4, this.size / 2, this.size / 2);
  }

  tick() {
    if (keySet["ArrowRight"]) {
      this.angle += this.speed * 3.6;
    }
    if (keySet["ArrowLeft"]) {
      this.angle -= this.speed * 3.6;
    }
    if (keySet["ArrowUp"]) {
      var vx = Math.cos(this.angle * Math.PI / 180);
      this.x += vx;
      for (var i = 0; i < entities.length; ++i) {
        while (touches(this, entities[i]) && entities[i] !== this) {
          this.x -= Math.sign(vx);
        }
      }
      var vy = Math.sin(this.angle * Math.PI / 180);
      this.y += vy;
      for (var i = 0; i < entities.length; ++i) {
        if (touches(this, entities[i]) && entities[i] !== this) {
          this.y -= Math.sign(vy);
        }
      }
    }
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

for (var i = 0; i < 100; ++i) {
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
