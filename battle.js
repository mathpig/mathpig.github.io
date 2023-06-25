"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var colors = ["gray", "red", "orange", "yellow", "green", "blue", "purple", "pink", "magenta", "brown", "black"];

var entities = [];

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function overlaps(a, b, c, d) {
  return (b >= c && d >= a);
}

class Warrior {
  constructor() {
    this.speed = 1;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.health = randint(160, 240);
    this.maxHealth = this.health;
    this.minAttack = 4;
    this.maxAttack = 8;
    this.size = 20;
    this.team = 0;
    this.cooldown = 20;
    this.maxCooldown = this.cooldown;
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
  }

  drawhealthbar() {
    var val = this.health / this.maxHealth * this.size;
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size / 2, this.y - 7 * this.size / 10 - 1, val, this.size / 5);
    ctx.fillStyle = "darkred";
    ctx.fillRect(this.x - this.size / 2 + val, this.y - 7 * this.size / 10 - 1, this.size - val, this.size / 5);
  }

  tick() {
    var bestDistance = 10000;
    var index = 0;
    for (var i = 0; i < entities.length; ++i) {
      if ((entities[i] instanceof Bullet) || entities[i].team == this.team) {
        continue;
      }
      var distance = Math.sqrt(Math.pow(entities[i].x - this.x, 2) + Math.pow(entities[i].y - this.y, 2));
      if (distance < bestDistance) {
        bestDistance = distance;
        index = i;
      }
    }
    if (bestDistance == 10000) {
      this.vx = 0;
      this.vy = 0;
    }
    else {
      this.vx = (entities[index].x - this.x) * this.speed / bestDistance;
      this.vy = (entities[index].y - this.y) * this.speed / bestDistance;
    }
    this.x += this.vx;
    this.y += this.vy;
    var revert = false;
    var target = -1;
    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i].touches(this) && this !== entities[i]) {
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
  for (var i = 0; i < entities.length; ++i) {
    entities[i].drawhealthbar();
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
    this.speed = 0.5;
    this.health = randint(640, 960);
    this.maxHealth = this.health;
    this.minAttack = 64;
    this.maxAttack = 128;
    this.size = 40;
    this.cooldown = 80;
    this.maxCooldown = this.cooldown;
  }
}

class BigWarrior extends Warrior {
  constructor() {
    super();
    this.speed = 0.75;
    this.health = randint(320, 480);
    this.maxHealth = this.health;
    this.minAttack = 16;
    this.maxAttack = 32;
    this.size = 30;
    this.cooldown = 40;
    this.maxCooldown = this.cooldown;
  }
}

class Vampire extends Warrior {
  constructor() {
    super();
    this.speed = 0.25;
    this.minAttack = 1;
    this.maxAttack = 1;
    this.cooldown = 1;
    this.maxCooldown = this.cooldown;
  }
}

class Decoy extends Warrior {
  constructor() {
    super();
    this.speed = 0;
    this.health = randint(640, 960);
    this.maxHealth = this.health;
    this.minAttack = 0;
    this.maxAttack = 0;
    this.cooldown = 0;
    this.maxCooldown = this.cooldown;
  }
}

class Rogue extends Warrior {
  constructor() {
    super();
    this.speed = 2;
    this.health = randint(40, 60);
    this.maxHealth = this.health;
    this.minAttack = 16;
    this.maxAttack = 32;
    this.size = 10;
    this.cooldown = 10;
    this.maxCooldown = this.cooldown;
  }
}

class Bullet {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.attack = 0;
    this.size = 10;
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

  setAttack(attack) {
    this.attack = attack;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setSource(source) {
    this.source = source;
    return this;
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  drawhealthbar() {
  }

  touches(other) {
    return false;
  }

  remove() {
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] === this) {
        var index = i;
        break;
      }
    }
    entities.splice(index, 1);
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 100 || this.x > (screen.width - 100) || this.y < 100 || this.y > (screen.height - 100)) {
      this.remove();
      return;
    }
    var index = -1;
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i].touches(this) && entities[i] !== this.source) {
        index = i;
        break;
      }
    }
    if (index >= 0) {
      entities[index].health -= this.attack;
      if (entities[index].health <= 0) {
        entities.splice(index, 1);
      }
      this.remove();
    }
  }
}

class Archer extends Warrior {
  constructor() {
    super();
    this.health = randint(40, 60);
    this.maxHealth = this.health;
    this.minAttack = 32;
    this.maxAttack = 64;
    this.size = 15;
    this.cooldown = 160;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 8;
    this.bulletSpeed = 3;
  }

  setBulletSize(bulletSize) {
    this.bulletSize = bulletSize;
    return this;
  }

  setBulletSpeed(bulletSpeed) {
    this.bulletSpeed = bulletSpeed;
    return this;
  }

  tick() {
    var bestDistance = 10000;
    var index = 0;
    for (var i = 0; i < entities.length; ++i) {
      if ((entities[i] instanceof Bullet) || entities[i].team == this.team) {
        continue;
      }
      var distance = Math.sqrt(Math.pow(entities[i].x - this.x, 2) + Math.pow(entities[i].y - this.y, 2));
      if (distance < bestDistance) {
        bestDistance = distance;
        index = i;
      }
    }
    if (bestDistance != 10000 && this.cooldown <= 0) {
      var bvx = this.bulletSpeed * (entities[index].x - this.x) / bestDistance;
      var bvy = this.bulletSpeed * (entities[index].y - this.y) / bestDistance;
      entities.push(new Bullet().setPosition(this.x, this.y).setVelocity(bvx, bvy).setAttack(randint(this.minAttack, this.maxAttack)).setSize(this.bulletSize).setSource(this));
      this.cooldown = this.maxCooldown;
    }
    this.cooldown -= 1;
  }
}

class Gunner extends Archer {
  constructor() {
    super();
    this.health = randint(20, 30);
    this.maxHealth = this.health;
    this.minAttack = 1;
    this.maxAttack = 2;
    this.cooldown = 5;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 4;
    this.bulletSpeed = 5;
  }
}

entities.push(new Giant().setPosition(screen.width / 2, screen.height / 2).setTeam(0));
for (var i = 0; i < 250; ++i) {
  while (true) {
    var x = randint(100, screen.width - 100);
    var y = randint(100, screen.height - 100);
    var team = randint(1, colors.length - 1);
    var val = randint(0, 19);
    if (val == 0) {
      entities.push(new BigWarrior().setPosition(x, y).setTeam(team));
    }
    else if (val == 1) {
      entities.push(new Vampire().setPosition(x, y).setTeam(team));
    }
    else if (val == 2) {
      entities.push(new Decoy().setPosition(x, y).setTeam(team));
    }
    else if (val == 3) {
      entities.push(new Rogue().setPosition(x, y).setTeam(team));
    }
    else if (val == 4) {
      entities.push(new Gunner().setPosition(x, y).setTeam(team));
    }
    else if (val <= 9) {
      entities.push(new Archer().setPosition(x, y).setTeam(team));
    }
    else {
      entities.push(new Warrior().setPosition(x, y).setTeam(team));
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

setInterval(Tick, 25);
