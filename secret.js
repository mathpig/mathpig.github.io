// TODO: Add enemies.

"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entitiesList = [[], []];
var area = 0;
var entities = entitiesList[area];

var keySet = {};

var rect = screen.getBoundingClientRect();

var mouseScreenX = -1;

var mouseX = -1;
var mouseY = -1;

var mouseDown = false;

var selection = -1;

var toDelete = [];

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

function subtract(v1, v2) {
  return [v1[0] - v2[0]. v1[1] - v2[1]];
}

function dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] + v2[1];
}

function magnitude(v) {
  return Math.sqrt(dot(v, v));
}

function unit(v) {
  var m = magnitude(v);
  return [v[0] / m, v[1] / m];
}

function rotate90(v) {
  return [-v[1], v[0]];
}

function getNormals(arr) {
  var normals = [];
  for (var i = 0; i < arr.length; ++i) {
    normals.push(rotate90(subtract(arr[(i + 1) % arr.length], arr[i])));
  }
  return normals;
}

function outside(arr, normal, point) {
  for (var i = 0; i < arr.length; ++i) {
    if (dot(subtract(arr[i], point), normal) < 0) {
      return false;
    }
  }
  return true;
}

function intersectPolygon(arr1, arr2) {
  var normals1 = getNormals(arr1);
  for (var i = 0; i < normals1.length; ++i) {a
    if (outside(arr2, normals1[i], arr1[i])) {
      return false;
    }
  }
  var normals2 = getNormals(arr2);
  for (var i = 0; i < normals2.length; ++i) {
    if (outside(arr1, normals2[i], arr2[i])) {
      return false;
    }
  }
  return true;
}

class Line {
  constructor() {
    this.color = "black";
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.lifespan = 10;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setEndpoints(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    return this;
  }

  setLifespan(lifespan) {
    this.lifespan = lifespan;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  }

  drawhealthbar() {
  }

  tick() {
    this.lifespan--;
    if (this.lifespan == 0) {
      toDelete.push(this);
    }
  }
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
    this.size = 20;
    this.speed = 3;
    this.xLimit1 = 1000;
    this.xLimit2 = 6000;
    this.x = this.xLimit1 + this.size / 2;
    this.y = screen.height * 2 / 3 - this.size / 2;
    this.vy = 0;
    this.health = 50;
    this.maxHealth = this.health;
    this.damage = [4, 6, 8];
    this.cooldowns = [0, 0, 0];
    this.maxCooldowns = [50, 50, 50];
    this.doorCooldown = 0;
    this.maxDoorCooldown = 50;
  }

  setColor(color) {
    this.color = "color";
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setXLimits(xLimit1, xLimit2) {
    this.xLimit1 = xLimit1;
    this.xLimit2 = xLimit2;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVelocity(v) {
    this.vy = v;
    return this;
  }

  setAttacks(attacks) {
    this.attacks = attacks;
    return this;
  }

  setHealth(health) {
    this.health = health;
    return this;
  }

  setMaxHealth(maxHealth) {
    if (maxHealth >= this.health) {
      this.maxHealth = maxHealth;
    }
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

  setMaxCooldowns(maxCooldowns) {
    this.maxCooldowns = maxCooldowns;
    return this;
  }

  setDoorCooldown(doorCooldown) {
    this.doorCooldown = doorCooldown;
    return this;
  }

  setMaxDoorCooldown(maxDoorCooldown) {
    this.maxDoorCooldown = maxDoorCooldown;
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

  tick() {
    this.doorCooldown--;
    if (keySet["e"]) {
      if (this.doorCooldown <= 0) {
        this.doorCooldown = this.maxDoorCooldown;
        for (var i = 0; i < entities.length; ++i) {
          if (entities[i] instanceof Door && this.touches(entities[i])) {
            this.setXLimits(entities[i].xLimit1, entities[i].xLimit2);
            this.setPosition(entities[i].x2, entities[i].y2);
            area = entities[i].zone;
            this.vy = 0;
            return;
          }
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
    var oldX = this.x;
    this.x += xGain;

    this.x = Math.min(Math.max(this.x, this.xLimit1 + this.size / 2), this.xLimit2 - this.size / 2);

    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] instanceof Enemy && this.touches(entities[i])) {
        this.x = oldX;
        break;
      }
    }

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

    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] instanceof Enemy && this.touches(entities[i]) && this.y < (screen.height * 2 / 3 - this.size / 2)) {
        this.vy = -10;
        break;
      }
    }

    for (var i = 0; i < this.cooldowns.length; ++i) {
      this.cooldowns[i]--;
    }

    if (mouseDown && selection >= 0 && this.cooldowns[selection] <= 0) {
      if (selection == 1) {
        var dist = 100;
      }
      else if (selection == 2) {
        var dist = 50;
      }
      if (selection == 0) {
        var dist = Math.sqrt((mouseX - this.x) * (mouseX - this.x) + (mouseY - this.y) * (mouseY - this.y));
        entities.push(new Bullet().setPosition(this.x, this.y).setVelocity(5 * (mouseX - this.x) / dist, 5 * (mouseY - this.y) / dist).setSource(this));
      }
      else {
        var x1 = this.x;
        var y1 = this.y;
        var x2 = mouseX;
        var y2 = mouseY;

        var val = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        if (val > dist) {
          x2 = x1 + (x2 - x1) * dist / val;
          y2 = y1 + (y2 - y1) * dist / val;
        }

        entities.push(new Line().setEndpoints(x1, y1, x2, y2));
/*
        for (var i = 0; i < entities[area].length; ++i) {
          if (!(entities[area][i] instanceof Enemy)) {
            continue;
          }
          if (polygonIntersects([[x1, y1], [x2, y2]], [[entities[area][i].x - size / 2, entities[area][i].y - size / 2], [entities[area][i].x + size / 2, entities[area][i].y - size / 2], [entities[area][i].x + size / 2, entities[area][i].y + size / 2], [entities[area][i].x - size / 2, entities[area][i].y + size / 2]])) {
            entities[area][i].health -= this.attacks[selection];
            if (entities[area][i].health <= 0) {
              toDelete.push(entities[area][i]);
            }
          }
        }
*/
      }
      this.cooldowns[selection] = this.maxCooldowns[selection];
    }
  }
}

var player = new Player();

class Enemy {
  constructor() {
    this.color = "blue";
    this.size = 20;
    this.speed = 2;
    this.x = 0;
    this.y = screen.height * 2 / 3 - this.size / 2;
    this.health = 10;
    this.maxHealth = this.health;
    this.damage = 5;
    this.cooldown = 50;
    this.maxCooldown = 50;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setSize(size) {
    this.size = size;
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

  setHealth(health) {
    this.health = health;
    return this;
  }

  setMaxHealth(maxHealth) {
    this.maxHealth = maxHealth;
    return this;
  }
 
  setDamage(damage) {
    this.damage = damage;
    return this;
  }

  setCooldown(cooldown) {
    this.cooldown = cooldown;
    return this;
  }

  setMaxCooldown(maxCooldown) {
    this.maxCooldown = maxCooldown;
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

  tick() {
    this.cooldown -= 1;
    var oldX = this.x;
    if (this.x < player.x) {
      this.x += this.speed;
    }
    if (this.x > player.x) {
      this.x -= this.speed;
    }
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] === this) {
        continue;
      }
      if (entities[i] instanceof Enemy && this.touches(entities[i])) {
        this.x = oldX;
        break;
      }
    }
    if (this.touches(player)) {
      this.x = oldX;
      if (this.cooldown <= 0) {
        this.cooldown = this.maxCooldown;
        player.health -= this.damage;
      }
    }
  }
}

class Bullet {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 8;
    this.color = "black";
    this.damage = 0;
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

  setSize(size) {
    this.size = size;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setDamage(damage) {
    this.damage = damage;
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

  drawhealthbar() {
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < (player.xLimit1 + this.size / 2) || this.x > (player.xLimit2 - this.size / 2) || this.y < this.size / 2 || this.y > (screen.height * 2 / 3 - this.size / 2)) {
      toDelete.push(this);
      return;
    }
    for (var i = 0; i < entities.length; ++i) {
      if ((entities[i] instanceof Enemy || entities[i] instanceof Player) && entities[i].touches(this) && entities[i] !== this.source) {
        toDelete.push(this);
        entities[i].health -= this.damage;
        if (entities[i].health <= 0 && entities[i] instanceof Enemy) {
          toDelete.push(entities[i]);
        }
        return;
      }
    }
  }
}

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
  entitiesList[0].push(new Background().setColors(colorSets[i][0], colorSets[i][1]).setX(1000 * i));
}
entitiesList[0].push(new Door().setPosition(5950, screen.height * 2 / 3 - 50).setZone(1).setXLimits(1000, 1500));
entitiesList[0].push(new Door().setZone(1).setXLimits(1000, 1500));

entitiesList[1].push(new Background().setColors("brown", "brown").setX(0));
entitiesList[1].push(new Background().setColors("white", "brown").setX(1000).setWidth(500));
entitiesList[1].push(new Background().setColors("brown", "brown").setX(1500).setWidth(1000));
entitiesList[1].push(new Door().setZone(0).setXLimits(1000, 6000));

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
  ctx.translate(screen.width / 2 - player.x, 0);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].drawhealthbar();
  }
  player.draw();
  player.drawhealthbar();
  ctx.restore();
}

function Tick() {
  mouseX = mouseScreenX + player.x - screen.width / 2;
  entities = entitiesList[area];
  if (player.health <= 0) {
    return;
  }
  if (area == 0 && randint(0, 249) == 0 && randint(player.xLimit1, player.xLimit2) < player.x) {
    if (randint(0, 1) == 0) {
      var val = randint(player.x - 1000, player.x - 500);
    }
    else {
      var val = randint(player.x + 500, player.x + 1000);
    }
    if (val >= (player.xLimit1 + 10) && val <= (player.xLimit2 - 10)) {
      entities.push(new Enemy().setPosition(val, screen.height * 2 / 3 - 10));
      for (var i = 0; i < (entities.length - 1); ++i) {
        if ((entities[i] instanceof Enemy || entities[i] instanceof Player) && entities[i].touches(entities[entities.length - 1])) {
          entities.pop();
          break;
        }
      }
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  player.tick();
  for (var i = 0; i < toDelete.length; ++i) {
    for (var j = 0; j < entities.length; ++j) {
      if (toDelete[i] === entities[j]) {
        entities.splice(j, 1);
        break;
      }
    }
  }
  Draw();
  userstats.innerHTML = "<br/>Weapons:<br/><br/>Bow [" + String(player.damage[0]) + "]";
  if (selection == 0) {
    userstats.innerHTML += "; selected";
  }
  userstats.innerHTML += "<br/>Trident [" + String(player.damage[1]) + "]";
  if (selection == 1) {
    userstats.innerHTML += "; selected";
  }
  userstats.innerHTML += "<br/>Sword [" + String(player.damage[2]) + "]";
  if (selection == 2) {
    userstats.innerHTML += "; selected";
  }
}

setInterval(Tick, 20);

screen.onmousemove = function(e) {
  mouseScreenX = e.clientX - rect.x;
  mouseY = e.clientY - rect.y;
};

screen.onmousedown = function(e) {
  mouseDown = true;
};

screen.onmouseup = function(e) {
  mouseDown = false;
};

window.onkeydown = function(e) {
  keySet[e.key] = true;
  if (e.key == "1" || e.key == "2" || e.key == "3") {
    selection = parseInt(e.key) - 1;
  }
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
