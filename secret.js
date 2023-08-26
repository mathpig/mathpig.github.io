"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entities = [[], []];
var area = 0;

var keySet = {};

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

class Door {
  constructor() {
    this.zone = 0;
    this.color = "gray";
    this.x = 1050;
    this.y = screen.height * 2 / 3 - 50;
    this.xLimit1 = 0;
    this.xLimit2 = 0;
    this.x2 = 1050;
    this.y2 = screen.height * 2 / 3 - 50;
    this.size = 100;
  }

  setZone(zone) {
    this.zone = zone;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setXLimits(xLimit1, xLimit2) {
    this.xLimit1 = xLimit1;
    this.xLimit2 = xLimit2;
    return this;
  }

  setBringTo(x, y) {
    this.x2 = x;
    this.y2 = y;
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

  drawhealthbar() {
  }

  tick() {
  }
}

class Player {
  constructor() {
    this.color = "black";
    this.speed = 3;
    this.x = 1010;
    this.y = screen.height * 2 / 3 - 10;
    this.xLimit1 = 1000;
    this.xLimit2 = 6000;
    this.vy = 0;
    this.health = 10;
    this.maxHealth = this.health;
    this.attacks = [4, 6, 8];
    this.size = 20;
    this.cooldowns = [10, 10, 10];
    this.maxCooldowns = [10, 10, 10];
  }

  setColor(color) {
    this.color = "color";
    return this;
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

  setXLimits(xLimit1, xLimit2) {
    this.xLimit1 = xLimit1;
    this.xLimit2 = xLimit2;
    return this;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  setAttacks(attacks) {
    this.attacks = attacks;
    return this;
  }

  setSize(size) {
    this.size = size;
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

  setCooldowns(cooldowns) {
    this.cooldowns = cooldowns;
    return this;
  }

  touches(other) {
    return (overlaps(this.x - this.size / 2, this.x + this.size / 2, other.x - other.size / 2, other.x + other.size / 2) &&
            overlaps(this.y - this.size / 2, this.y + this.size / 2, other.y - other.size / 2, other.y + other.size / 2));
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  drawhealthbar() {
    var val = this.health / this.maxHealth * this.size;
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size / 2, this.y - 7 * this.size / 10 - 1, val, this.size / 5);
    ctx.fillStyle = "darkred";
    ctx.fillRect(this.x - this.size / 2 + val, this.y - 7 * this.size / 10 - 1, this.size - val, this.size / 5);
  }

  kill() {
    var index = 0;
    for (var i = 0; i < entities[area].length; ++i) {
      if (entities[area][i] === this) {
        index = i;
        break;
      }
    }
    entities[area].splice(index, 1);
  }

  tick() {
    if (keySet["e"]) {
      for (var i = 0; i < entities[area].length; ++i) {
        if (entities[area][i] instanceof Door && this.touches(entities[area][i])) {
          this.setXLimits(entities[area][i].xLimit1, entities[area][i].xLimit2);
          this.setPosition(entities[area][i].x2, entities[area][i].y2);
          area = entities[area][i].zone;
          this.vy = 0;
          return;
        }
      }
    }

    var xGain = 0;
    if (keySet["ArrowLeft"] && keySet["ArrowRight"]) {
      xGain = 0;
    }
    else if (keySet["ArrowLeft"]) {
      xGain = -this.speed;
    }
    else if (keySet["ArrowRight"]) {
      xGain = this.speed;
    }
    this.x += xGain;

    this.x = Math.min(Math.max(this.x, this.xLimit1 + this.size / 2), this.xLimit2 - this.size / 2);

    this.vy += 0.5;

    if (keySet["ArrowUp"] && this.y >= (screen.height * 2 / 3 - this.size / 2)) {
      this.vy -= 10;
    }
    this.vy = Math.max(Math.min(this.vy, 10), -10);

    this.y += this.vy;

    if (this.y >= (screen.height * 2 / 3 - this.size / 2)) {
      this.y = screen.height * 2 / 3 - this.size / 2;
      this.vy = 0;
    }
  }
}

var player = new Player();

class Background {
  constructor() {
    this.color1 = "black";
    this.color2 = "black";
    this.x = 0;
    this.width = 1000;
  }

  setColors(color1, color2) {
    this.color1 = color1;
    this.color2 = color2;
    return this;
  }

  setX(x) {
    this.x = x;
    return this;
  }

  setWidth(width) {
    this.width = width;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.x, 0, this.width, screen.height * 2 / 3);
    ctx.fillStyle = this.color2;
    ctx.fillRect(this.x, screen.height * 2 / 3, this.width, screen.height / 3);
  }

  drawhealthbar() {
  }

  tick() {
  }
}

var colorSets = [["brown", "brown"],
                 ["green", "brown"],
                 ["yellow", "brown"],
                 ["orange", "brown"],
                 ["red", "brown"],
                 ["maroon", "brown"],
                 ["brown", "brown"]];
for (var i = 0; i < colorSets.length; ++i) {
  entities[0].push(new Background().setColors(colorSets[i][0], colorSets[i][1]).setX(1000 * i));
}
entities[0].push(new Door().setZone(1).setXLimits(1000, 2000));

var colorSets = [["brown", "brown"],
                 ["white", "brown"],
                 ["brown", "brown"]];
for (var i = 0; i < colorSets.length; ++i) {
  entities[1].push(new Background().setColors(colorSets[i][0], colorSets[i][1]).setX(1000 * i));
}

entities[1].push(new Door().setZone(0).setXLimits(1000, 6000));

function Draw() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(screen.width / 2 - player.x, 0);
  for (var i = 0; i < entities[area].length; ++i) {
    entities[area][i].draw();
  }
  for (var i = 0; i < entities[area].length; ++i) {
    entities[area][i].drawhealthbar();
  }
  player.draw();
  player.drawhealthbar();
  ctx.restore();
}

function Tick() {
  for (var i = 0; i < entities[area].length; ++i) {
    entities[area][i].tick();
  }
  player.tick();
  Draw();
}

setInterval(Tick, 50);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
