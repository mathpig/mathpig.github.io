"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entities = [];

var keySet = {};

var kills = 0;

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function uniform(a, b) {
  return a + Math.random() * (b - a);
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

function distance(o1, o2) {
  return Math.sqrt(Math.pow(o1.x - o2.x, 2) + Math.pow(o1.y - o2.y, 2));
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

function findColor(ratio, r1, g1, b1, r2, g2, b2) {
  var rr = Math.round(r1 * (1 - ratio) + r2 * ratio);
  var rg = Math.round(g1 * (1 - ratio) + g2 * ratio);
  var rb = Math.round(b1 * (1 - ratio) + b2 * ratio);
  return "rgb(" + String(rr) + ", " + String(rg) + ", " + String(rb) + ")";
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.health = 100;
    this.angle = uniform(0, 360);
    this.size = 50;
    this.color = "rgb(0, 255, 0)";
    this.collidable = true;
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

  setCollidable(collidable) {
    this.collidable = collidable;
    return this;
  }

  remove() {
    if (this instanceof Enemy) {
      kills++;
    }
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
    ctx.fillStyle = this.color;
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
    this.color = findColor(this.health / 100, 255, 0, 0, 0, 255, 0);
  }
}

class Player extends Block {
  constructor() {
    super();
    this.size = 25;
    this.health = 500;
    this.angle = 0;
    this.speed = 2;
    this.color = "black";
    this.cooldowns = [0, 0, 0, 0];
    this.maxCooldowns = [10, 50, 250, 50];
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
      if (touches(this, entities[i]) && entities[i] !== this && entities[i].collidable) {
        return true;
      }
    }
    return false;
  }

  tick() {
    this.color = findColor(this.health / 500, 255, 0, 0, 0, 0, 0);
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
      entities.push(new Bullet().setPosition(this.x, this.y).setSize(8).setDamage(25).setVelocity(4 * cosDeg(this.angle), 4 * sinDeg(this.angle)).setSource(this));
    }
    if (keySet["g"] && this.cooldowns[2] <= 0) {
      this.cooldowns[2] = this.maxCooldowns[2];
      entities.push(new Bullet().setPosition(this.x, this.y).setSize(16).setDamage(0).setBlastSpeed(10).setBlastRadius(250).setBlastDamage(5).setVelocity(3 * cosDeg(this.angle), 3 * sinDeg(this.angle)).setSource(this));
    }
    if (keySet["m"] && this.cooldowns[3] <= 0) {
      this.cooldowns[3] = this.maxCooldowns[3];
      entities.push(new Bullet().setPosition(this.x, this.y).setSize(8).setDamage(0).setBlastSpeed(10).setBlastRadius(100).setBlastDamage(25).setVelocity(0, 0).setSource(this));
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
    this.collidable = false;
    this.damage = 5;
    this.blastSpeed = 0;
    this.blastRadius = 0;
    this.blastDamage = 0;
    this.vx = 0;
    this.vy = 0;
    this.source = 0;
  }

  setDamage(damage) {
    this.damage = damage;
    return this;
  }

  setBlastSpeed(blastSpeed) {
    this.blastSpeed = blastSpeed;
    return this;
  }

  setBlastRadius(blastRadius) {
    this.blastRadius = blastRadius;
    return this;
  }

  setBlastDamage(blastDamage) {
    this.blastDamage = blastDamage;
    return this;
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

  detonate() {
    this.remove();
    if (this.blastRadius > 0) {
      entities.push(new Explosion().setPosition(this.x, this.y).setSpeed(this.blastSpeed).setMaxSize(this.blastRadius).setDamage(this.blastDamage));
    }
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    var toDetonate = [];
    var toRemove = [];
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && entities[i] !== this && entities[i] !== this.source) {
        if (entities[i] instanceof Bullet) {
          toDetonate.push(entities[i]);
          this.detonate();
        }
        else {
          entities[i].health -= this.damage;
          if (entities[i].health <= 0) {
            toRemove.push(entities[i]);
          }
          this.detonate();
        }
        break;
      }
    }
    for (var i = 0; i < toDetonate.length; ++i) {
      toDetonate[i].detonate();
    }
    for (var i = 0; i < toRemove.length; ++i) {
      toRemove[i].remove();
    }
    if (this.x < -2500 || this.x > 2500 || this.y < -2500 || this.y > 2500) {
      this.remove();
    }
  }
}

class Explosion extends Block {
  constructor() {
    super();
    this.speed = 5;
    this.size = 0;
    this.color = "orange";
    this.collidable = false;
    this.maxSize = 0;
    this.damage = 0;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setMaxSize(maxSize) {
    this.maxSize = maxSize;
    return this;
  }

  setDamage(damage) {
    this.damage = damage;
    return this;
  }

  tick() {
    this.size += this.speed;
    var toDetonate = [];
    var toRemove = [];
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && !(entities[i] instanceof Explosion)) {
        if (entities[i] instanceof Bullet) {
          toDetonate.push(entities[i]);
        }
        else {
          entities[i].health -= this.damage;
          if (entities[i].health <= 0) {
            toRemove.push(entities[i]);
          }
        }
      }
    }
    for (var i = 0; i < toDetonate.length; ++i) {
      toDetonate[i].detonate();
    }
    for (var i = 0; i < toRemove.length; ++i) {
      toRemove[i].remove();
    }
    if (this.size >= this.maxSize) {
      this.remove();
    }
  }
}

class Enemy extends Player {
  constructor() {
    super();
    this.speed = 1;
    this.health = 250;
    this.cooldown = 0;
    this.maxCooldown = 100;
    this.range = 250;
  }

  setRange(range) {
    this.range = range;
    return this;
  }

  drawInside() {
    super.drawInside();
    ctx.fillStyle = "red";
    ctx.fillRect(this.size / 8, -3 * this.size / 8, this.size / 4, this.size / 4);
    ctx.fillRect(this.size / 8, this.size / 8, this.size / 4, this.size / 4);
  }

  doTouchingLogic(oldAngle, ux, uy) {
    var toRemove = [];
    var touched = false;
    var removedSelf = false;
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && entities[i] !== this && entities[i].collidable) {
        touched = true;
        entities[i].health--;
        if (entities[i].health <= 0) {
          toRemove.push(entities[i]);
        }
        this.health--;
        if (this.health <= 0) {
          removedSelf = true;
          this.remove();
          break;
        }
      }
    }
    for (var i = 0; i < toRemove.length; ++i) {
      toRemove[i].remove();
    }
    if (touched && !removedSelf) {
      this.angle = oldAngle;
      while (this.touchesSomething()) {
        this.x -= ux;
        this.y -= uy;
      }
    }
  }

  tick() {
    this.color = findColor(this.health / 500, 0, 0, 255, 0, 0, 0);
    var goalAngle = Math.atan2(player.y - this.y, player.x - this.x);
    if (goalAngle < 0) {
      goalAngle += 2 * Math.PI;
    }
    goalAngle *= 180 / Math.PI;
    var diff = this.angle - goalAngle;
    var oldAngle = this.angle;
    var u = [0, 0];
    if (Math.abs(diff) < 2.5) {
      var dist = distance(this, player);
      if (dist > this.range) {
        var vx = this.speed * cosDeg(this.angle);
        var vy = this.speed * sinDeg(this.angle);
        this.x += vx;
        this.y += vy;
        u = unit([vx, vy]);
      }
      else {
        if (this.cooldown <= 0) {
          this.cooldown = this.maxCooldown;
          entities.push(new Bullet().setPosition(this.x, this.y).setSize(8).setDamage(25).setVelocity(4 * cosDeg(this.angle), 4 * sinDeg(this.angle)).setSource(this));
        }
        this.cooldown--;
      }
    }
    else if (diff > 180) {
      this.angle += this.speed;
      if (this.angle >= 360) {
        this.angle -= 360;
      }
    }
    else if (diff < -180) {
      this.angle -= this.speed;
      if (this.angle < 0) {
        this.angle += 360;
      }
    }
    else {
      this.angle -= this.speed * Math.sign(diff);
    }
    this.doTouchingLogic(oldAngle, u[0], u[1]);
  }
}

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

function Draw() {
  if (player.health > 0) {
    ctx.fillStyle = "white";
  }
  else {
    ctx.fillStyle = "black";
  }
  ctx.fillRect(0, 0, screen.width, screen.height);
  if (player.health > 0) {
    ctx.save();
    ctx.translate(screen.width / 2 - player.x, screen.height / 2 - player.y);
    for (var i = 0; i < entities.length; ++i) {
      entities[i].draw();
    }
    ctx.restore();
  }
}

function Tick() {
  if (player.health <= 0) {
    Draw();
    return;
  }
  if (randint(0, 9) == 0) {
    player.health = Math.min(player.health + 1, 500);
  }
  if (randint(0, 99) == 0) {
    var enemy = new Enemy().setPosition(randint(-1000, 1000), randint(-1000, 1000));
    entities.push(enemy);
    if (distance(enemy, player) <= 500) {
      entities.pop();
    }
    else {
      for (var j = 0; j < (entities.length - 1); ++j) {
        if (touches(enemy, entities[j])) {
         entities.pop();
          break;
        }
      }
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  Draw();
  killcount.innerHTML = "</br>Score: " + String(kills);
}

var player = new Player().setPosition(0, 0);
entities.push(player);

for (var i = 0; i < 500; ++i) {
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
