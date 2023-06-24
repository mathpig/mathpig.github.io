"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "black"];

var entities = [];

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

class Warrior {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.health = 100;
    this.maxHealth = this.health;
    this.minAttack = 4;
    this.maxAttack = 8;
    this.size = 20;
    this.team = 0;
    this.cooldown = 20;
    this.maxCooldown = this.cooldown;
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

  setAttack(minAttack, maxAttack) {
    this.minAttack = minAttack;
    this.maxAttack = maxAttack;
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

  setTeam(team) {
    this.team = team;
    return this;
  }

  setCooldown(cooldown) {
    this.cooldown = cooldown;
    return this;
  }

  touches(other) {
    return (overlaps(this.x - this.size / 2, this.x + this.size / 2, other.x - other.size / 2, other.x + other.size / 2) &&
            overlaps(this.y - this.size / 2, this.y + this.size / 2, other.y - other.size / 2, other.y + other.size / 2));
  }

  draw() {
    ctx.fillStyle = colors[this.team];
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    var val = this.health / this.maxHealth * this.size;
    ctx.fillStyle = "green";
    ctx.fillRect(this.x - this.size / 2, this.y - 7 * this.size / 10 - 1, val, this.size / 5);
    ctx.fillStyle = "red";
    ctx.fillRect(this.x - this.size / 2 + val, this.y - 7 * this.size / 10 - 1, this.size - val, this.size / 5);
  }

  tick() {
    var bestDistance = 1000;
    var index = 0;
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i].team != this.team) {
        var distance = Math.sqrt(Math.pow(entities[i].x - this.x, 2) + Math.pow(entities[i].y - this.y, 2));
        if (distance < bestDistance) {
          bestDistance = distance;
          index = i;
        }
      }
    }
    if (bestDistance == 1000) {
      this.vx = 0;
      this.vy = 0;
    }
    else {
      this.vx = (entities[index].x - this.x) / bestDistance;
      this.vy = (entities[index].y - this.y) / bestDistance;
    }
    this.x += this.vx;
    this.y += this.vy;
    var revert = false;
    var target = -1;
    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && this !== entities[i]) {
        if (entities[i].team != this.team && this.cooldown <= 0) {
          this.cooldown = this.maxCooldown;
          entities[i].health -= randint(this.minAttack, this.maxAttack);
          if (entities[i].health <= 0) {
            target = i;
          }
        }
        revert = true;
      }
    }
    if (target >= 0) {
      entities.splice(target, 1);
    }
    if (revert) {
      this.cooldown -= 1;
      this.x -= this.vx;
      this.y -= this.vy;
    }
  }
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

class Giant extends Warrior {
  constructor() {
    super();
    this.health = 125;
    this.maxHealth = this.health;
    this.minAttack = 5;
    this.maxAttack = 10;
    this.size = 30;
  }
}

for (var i = 0; i < 250; ++i) {
  while (true) {
    var x = randint(100, screen.width - 100);
    var y = randint(100, screen.height - 100);
    var val = randint(0, 10);
    if (val == 0) {
      entities.push(new Giant().setPosition(x, y).setTeam(randint(0, colors.length - 1)));
    }
    else {
      entities.push(new Warrior().setPosition(x, y).setTeam(randint(0, colors.length - 1)));
    }
    var doAgain = false;
    for (var j = 0; j < (entities.length - 1); ++j) {
      if (entities[entities.length - 1].touches(entities[j])) {
        entities.pop();
        doAgain = true;
      }
    }
    if (!doAgain) {
      break;
    }
  }
}

setInterval(Tick, 50);
