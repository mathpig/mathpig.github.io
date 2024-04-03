// TODO: Add enemy infighting

"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var blood = [];
var bullets = [];
var entities = [];
var toRemove = [];

var keySet = {};

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

function distance(e1, e2) {
  return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
}

class Warrior {
  constructor() {
    this.speed = 2;
    this.x = 0;
    this.y = 0;
    this.size = 20;
    this.color = "gray";
    this.health = 100;
    this.maxHealth = this.health;
    this.bulletCooldown = 40;
    this.maxBulletCooldown = this.bulletCooldown;
    this.bulletSize = 4;
    this.bulletDamage = 10;
    this.bulletSpeed = 5;
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

  setHealth(health) {
    this.health = health;
    return this;
  }

  setMaxHealth(maxHealth) {
    this.maxHealth = maxHealth;
    return this;
  }

  setBulletCooldown(bulletCooldown) {
    this.bulletCooldown = bulletCooldown;
    return this;
  }

  setMaxBulletCooldown(maxBulletCooldown) {
    this.maxBulletCooldown = maxBulletCooldown;
    return this;
  }

  setBulletStats(size, damage, speed) {
    this.bulletSize = size;
    this.bulletDamage = damage;
    this.bulletSpeed = speed;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  drawhealthbar() {
    var val = (this.health / this.maxHealth) * this.size;
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size / 2, this.y - 4 * this.size / 5, val, this.size / 5);
    ctx.fillStyle = "darkred";
    ctx.fillRect(this.x - this.size / 2 + val, this.y - 4 * this.size / 5, this.size - val, this.size / 5);
  }

  doMoveLogic(vx, vy) {
    var val = 1;
    if (vx < 0) {
      val = -1;
    }
    vx = Math.abs(vx);
    var touched = false;
    for (var i = 0; i < vx; ++i) {
      this.x += val;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] !== this) {
          touched = true;
          break;
        }
      }
      if (touched) {
        this.x -= val;
        break;
      }
    }
    var val = 1;
    if (vy < 0) {
      val = -1;
    }
    vy = Math.abs(vy);
    var touched = false;
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] !== this) {
          touched = true;
          break;
        }
      }
      if (touched) {
        this.y -= val;
        break;
      }
    }
  }

  doShootLogic(vx, vy) {
    this.bulletCooldown = this.maxBulletCooldown;
    bullets.push(new Bullet().setPosition(this.x, this.y).setVelocity(vx, vy).setStats(this.bulletSize, this.bulletDamage).setSource(this));
  }

  die() {
    toRemove.push(this);
    var val = 200 + Math.floor(101 * Math.random());
    for (var i = 0; i < val; ++i) {
      blood.push(new Blood().setPosition(this.x, this.y));
    }
  }

  tick() {
    var dist = distance(this, player);
    var xDiff = (player.x - this.x);
    var yDiff = (player.y - this.y);
    if (dist > 300) {
      var vx = (this.speed * xDiff) / dist;
      var vy = (this.speed * yDiff) / dist;
      this.doMoveLogic(vx, vy);
    }
    else if (this.bulletCooldown <= 0) {
      var vx = (this.bulletSpeed * xDiff) / dist;
      var vy = (this.bulletSpeed * yDiff) / dist;
      this.doShootLogic(vx, vy);
    }
    else {
      this.bulletCooldown--;
    }
  }
}

class Player extends Warrior {
  constructor() {
    super();
    this.speed = 3;
    this.color = "blue";
  }

  tick() {
    var vx = 0;
    var vy = 0;
    if (keySet["ArrowLeft"]) {
      vx -= this.speed;
    }
    if (keySet["ArrowRight"]) {
      vx += this.speed;
    }
    if (keySet["ArrowUp"]) {
      vy -= this.speed;
    }
    if (keySet["ArrowDown"]) {
      vy += this.speed;
    }
    this.doMoveLogic(vx, vy);
    // TODO: Add shooting logic, mouse tracking
  }
}

class Bullet {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 4;
    this.damage = 10;
    this.color = "black";
    this.source = 0;
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

  setStats(size, damage) {
    this.size = size;
    this.damage = damage;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setSource(source) {
    this.source = source;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    if (distance(this, player) > 2500) {
      toRemove.push(this);
      return;
    }
    this.x += this.vx;
    this.y += this.vy;
    for (var i = 0; i < entities.length; ++i) {
      if (touches(this, entities[i]) && entities[i] !== this.source) {
        entities[i].health -= this.damage;
        if (entities[i].health <= 0) {
          entities[i].die();
        }
        toRemove.push(this);
        break;
      }
    }
  }
}

class Blood {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = Math.random() * 10 - 5;
    this.vy = Math.random() * 10 - 5;
    this.time = 0;
    this.maxTime = 400;
    this.size = 4 + Math.random() * 2;
    this.startColor = (128 + Math.floor(128 * Math.random()));
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVelocity(x, y) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  setTime(time) {
    this.time = time;
    return this;
  }

  setMaxTime(maxTime) {
    this.maxTime = maxTime;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setStartColor(startColor) {
    this.startColor = startColor;
    return this;
  }

  draw() {
    ctx.fillStyle = "rgb(" + String(this.startColor * (1 - (this.time / this.maxTime))) + ", " + String(255 * (this.time / this.maxTime)) + ", " + String(255 * (this.time / this.maxTime)) + ")";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.time++;
    if (this.time >= this.maxTime) {
      toRemove.push(this);
    }
  }
}

function Draw() {
  if (player.health <= 0) {
    ctx.fillStyle = "black";
  }
  else {
    ctx.fillStyle = "cyan";
  }
  ctx.fillRect(0, 0, screen.width, screen.height);
  if (player.health <= 0) {
    return;
  }
  ctx.save();
  ctx.translate(screen.width / 2 + player.size / 2 - player.x, screen.height / 2 + player.size / 2 - player.y);
  for (var i = 0; i < blood.length; ++i) {
    if (distance(player, blood[i]) < 1000) {
      blood[i].draw();
    }
  }
  for (var i = 0; i < bullets.length; ++i) {
    if (distance(player, bullets[i]) < 1000) {
      bullets[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < 1000) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < 1000) {
      entities[i].drawhealthbar();
    }
  }
  ctx.restore();
}

function Tick() {
  if (Math.random() < 0.01) {
    var distance = Math.random() * 1000 + 1000;
    var angle = Math.random() * 2 * Math.PI;
    entities.push(new Warrior().setPosition(distance * Math.cos(angle), distance * Math.sin(angle)));
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  for (var i = 0; i < bullets.length; ++i) {
    bullets[i].tick();
  }
  for (var i = 0; i < blood.length; ++i) {
    blood[i].tick();
  }
  for (var i = 0; i < toRemove.length; ++i) {
    if (toRemove[i] instanceof Blood) {
      for (var j = 0; j < blood.length; ++j) {
        if (toRemove[i] === blood[j]) {
          blood.splice(j, 1);
          break;
        }
      }
    }
    else if (toRemove[i] instanceof Bullet) {
      for (var j = 0; j < bullets.length; ++j) {
        if (toRemove[i] === bullets[j]) {
          bullets.splice(j, 1);
          break;
        }
      }
    }
    else {
      for (var j = 0; j < entities.length; ++j) {
        if (toRemove[i] === entities[j]) {
          entities.splice(j, 1);
          break;
        }
      }
    }
  }
  Draw();
}

var player = new Player();
entities.push(player);

setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
