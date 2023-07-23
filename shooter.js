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

/*
function touches(e1, e2) {
  return (overlaps(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          overlaps(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}
*/

function dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1];
}

function magnitude(v) {
  return Math.sqrt(dot(v, v));
}

function unit(v) {
  var m = magnitude(v);
  return [v[0] / m, v[1] / m];
}

function project(axis, vertices) {
  var min = 1000000;
  var max = -1000000;
  for (var i = 0; i < vertices.length; ++i) {
    var d = dot(vertices[i], axis);
    min = Math.min(d, min);
    max = Math.max(d, max);
  }
  return [min, max];
}

function touches(e1, e2) {
  var axes = e1.getAxes().concat(e2.getAxes());
  var v1 = e1.getVertices();
  var v2 = e2.getVertices();
  for (var i = 0; i < axes.length; ++i) {
    var p1 = project(axes[i], v1);
    var p2 = project(axes[i], v2);
    if (!overlaps(p1[0], p1[1], p2[0], p2[1])) {
      return false;
    }
  }
  return true;
}

function sinDeg(angle) {
  return Math.sin(angle * Math.PI / 180);
}

function cosDeg(angle) {
  return Math.cos(angle * Math.PI / 180);
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.angle = uniform(0, 360);
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

  remove() {
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] === this) {
        entities.splice(i, 1);
        return;
      }
    }
  }

  getAxes() {
    return [[cosDeg(this.angle), sinDeg(this.angle)],
            [cosDeg(this.angle + 90), sinDeg(this.angle + 90)]];
  }

  getVertices() {
    var s = this.size / Math.sqrt(2);
    var val1 = s * cosDeg(this.angle + 45);
    var val2 = s * sinDeg(this.angle + 45);
    var val3 = s * cosDeg(this.angle - 45);
    var val4 = s * sinDeg(this.angle - 45);
    return [[this.x + val1, this.y + val2],
            [this.x + val3, this.y + val4],
            [this.x - val1, this.y - val2],
            [this.x - val3, this.y - val4]];
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
    this.angle = 0;
    this.speed = 2;
    this.color = "black";
    this.cooldowns = [0, 0, 0];
    this.maxCooldowns = [10, 50, 250];
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
    ctx.fillStyle = "white";
    ctx.fillRect(this.size / 8, -3 * this.size / 8, this.size / 4, this.size / 4);
    ctx.fillRect(this.size / 8, this.size / 8, this.size / 4, this.size / 4);
  }

  touchesSomething() {
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && entities[i] !== this && !(entities[i] instanceof Bullet)) {
        return true;
      }
    }
    return false;
  }

  tick() {
    if (keySet["ArrowLeft"]) {
      this.angle -= this.speed;
      if (this.touchesSomething()) {
        this.angle += this.speed;
      }
    }
    if (keySet["ArrowRight"]) {
      this.angle += this.speed;
      if (this.touchesSomething()) {
        this.angle -= this.speed;
      }
    }
    if (keySet["ArrowUp"]) {
      var vx = this.speed * cosDeg(this.angle);
      var vy = this.speed * sinDeg(this.angle);
      this.x += vx;
      this.y += vy;
      var u = unit([vx, vy]);
      while (this.touchesSomething()) {
        this.x -= u[0];
        this.y -= u[1];
      }
    }
    if (keySet["ArrowDown"]) {
      var vx = -this.speed * cosDeg(this.angle) / 4;
      var vy = -this.speed * sinDeg(this.angle) / 4;
      this.x += vx;
      this.y += vy;
      var u = unit([vx, vy]);
      while (this.touchesSomething()) {
        this.x -= u[0];
        this.y -= u[1];
      }
    }
    if (keySet[" "] && this.cooldowns[0] <= 0) {
      this.cooldowns[0] = this.maxCooldowns[0];
      entities.push(new Bullet().setPosition(this.x, this.y).setVelocity(5 * cosDeg(this.angle), 5 * sinDeg(this.angle)).setSource(this));
    }
    if (keySet["s"] && this.cooldowns[1] <= 0) {
      this.cooldowns[1] = this.maxCooldowns[1];
      entities.push(new Bullet().setPosition(this.x, this.y).setSize(8).setVelocity(4 * cosDeg(this.angle), 4 * sinDeg(this.angle)).setSource(this));
    }
    if (keySet["g"] && this.cooldowns[2] <= 0) {
      this.cooldowns[2] = this.maxCooldowns[2];
      entities.push(new Bullet().setPosition(this.x, this.y).setSize(16).setVelocity(3 * cosDeg(this.angle), 3 * sinDeg(this.angle)).setSource(this));
    }
    for (var i = 0; i < this.cooldowns.length; ++i) {
      this.cooldowns[i]--;
    }
  }
}

class Bullet extends Block {
  constructor() {
    super();
    this.size = 4;
    this.color = "black";
    this.vx = 0;
    this.vy = 0;
    this.source = 0;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  setSource(source) {
    this.source = source;
    return this;
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && entities[i] !== this && entities[i] !== this.source) {
        this.remove();
      }
    }
    if (this.x < -this.size / 2 || this.x > (screen.width + this.size / 2) || this.y < -this.size / 2 || this.y > (screen.height + this.size / 2)) {
      this.remove();
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
  ctx.save();
  ctx.translate(screen.width / 2 - player.x, screen.height / 2 - player.y);
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

var player = new Player().setPosition(0, 0);
entities.push(player);

for (var i = 0; i < 1000; ++i) {
  entities.push(new Block().setPosition(randint(-1000, 1000), randint(-1000, 1000)));
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
