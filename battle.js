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
    this.health = randint(640, 960);
    this.maxHealth = this.health;
    this.minAttack = 4;
    this.maxAttack = 8;
    this.size = 20;
    this.team = 0;
    this.cooldown = 20;
    this.maxCooldown = this.cooldown;
    this.burning = false;
    this.burningCooldown = 0;
    this.frozen = false;
    this.frozenCooldown = 0;
    this.poisoned = false;
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

  setMaxHealth(maxHealth) {
    this.maxHealth = maxHealth;
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

  setBurning(burning) {
    this.burning = burning;
    return this;
  }

  setBurningCooldown(burningCooldown) {
    this.burningCooldown = burningCooldown;
    return this;
  }

  setFrozen(frozen) {
    this.frozen = frozen;
    return this;
  }

  setFrozenCooldown(frozenCooldown) {
    this.frozenCooldown = frozenCooldown;
    return this;
  }

  touches(other) {
    return (overlaps(this.x - this.size / 2, this.x + this.size / 2, other.x - other.size / 2, other.x + other.size / 2) &&
            overlaps(this.y - this.size / 2, this.y + this.size / 2, other.y - other.size / 2, other.y + other.size / 2));
  }

  draw() {
    if (this.frozen) {
      ctx.fillStyle = "cyan";
    }
    else if (this.burning) {
      ctx.fillStyle = "orangered";
    }
    else if (this.poisoned) {
      ctx.fillStyle = "darkgreen";
    }
    else {
      ctx.fillStyle = colors[this.team];
    }
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
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] === this) {
        index = i;
        break;
      }
    }
    entities.splice(index, 1);
  }

  updateStatus() {
    this.burningCooldown--;
    this.frozenCooldown--;
    if (this.burning && this.frozen) {
      this.burning = false;
      this.frozen = false;
      this.poisoned = false;
      this.burningCountdown = 0;
      this.frozenCountdown = 0;
      this.health -= randint(32, 64);
      if (this.health <= 0) {
        this.kill();
        return true;
      }
      return false;
    }
    if (this.burning) {
      this.poisoned = false;
      this.health -= randint(1, 2);
      if (this.health <= 0) {
        this.kill();
        return true;
      }
      if (this.burningCooldown <= 0) {
        this.burning = false;
      }
    }
    if (this.frozen) {
      this.poisoned = false;
      if (this.frozenCooldown <= 0) {
        this.frozen = false;
      }
      return true;
    }
    if (this.poisoned) {
      this.health -= randint(0, 1);
      if (this.health <= 0) {
        this.kill();
        return true;
      }
    }
    return false;
  }

  tick() {
    if (this.updateStatus()) {
      return;
    }
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
    var index = -1;
    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i].touches(this) && this !== entities[i]) {
        if (entities[i].team != this.team && this.cooldown <= 0) {
          this.cooldown = this.maxCooldown;
          entities[i].health -= randint(this.minAttack, this.maxAttack);
          if (entities[i].health <= 0) {
            index = i;
          }
        }
        revert = true;
      }
    }
    if (index >= 0) {
      entities.splice(index, 1);
    }
    if (revert) {
      this.cooldown--;
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
    this.health = randint(2560, 3840);
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
    this.health = randint(1280, 1920);
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
    this.health = randint(960, 1440);
    this.maxHealth = this.health;
    this.minAttack = 4;
    this.maxAttack = 8;
    this.cooldown = 1;
    this.maxCooldown = this.cooldown;
  }
}

class Decoy extends Warrior {
  constructor() {
    super();
    this.speed = 0;
    this.health = randint(1280, 1920);
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
    this.heal = 0;
    this.size = 10;
    this.burnTime = 0;
    this.freezeTime = 0;
    this.poisons = false;
    this.color = "black";
    this.converts = false;
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

  setHeal(heal) {
    this.heal = heal;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setBurnTime(burnTime) {
    this.burnTime = burnTime;
    return this;
  }

  setFreezeTime(freezeTime) {
    this.freezeTime = freezeTime;
    return this;
  }

  setPoisons(poisons) {
    this.poisons = poisons;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setConverts(converts) {
    this.converts = converts;
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
    if (this.x < -50 || this.x > (screen.width + 50) || this.y < -50 || this.y > (screen.height + 50)) {
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
      else if (this.freezeTime > 0) {
        entities[index].frozen = true;
        entities[index].frozenCooldown = Math.max(entities[index].frozenCooldown, this.freezeTime);
      }
      else if (this.burnTime > 0) {
        entities[index].burning = true;
        entities[index].burningCooldown = Math.max(entities[index].burningCooldown, this.burnTime);
      }
      else if (this.poisons) {
        entities[index].poisoned = true;
      }
      entities[index].health = Math.min(entities[index].health + this.heal, entities[index].maxHealth);
      if (this.converts) {
        entities[index].team = this.source.team
      }
      this.remove();
    }
  }
}

class Archer extends Warrior {
  constructor() {
    super();
    this.speed = 1.5;
    this.health = randint(80, 120);
    this.maxHealth = this.health;
    this.minAttack = 128;
    this.maxAttack = 256;
    this.size = 15;
    this.range = 10000;
    this.cooldown = 160;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 8;
    this.bulletSpeed = 3;
    this.bulletBurnTime = 0;
    this.bulletFreezeTime = 0;
    this.bulletPoisons = false;
    this.bulletColor = "black";
    this.bulletConverts = false;
  }

  setRange(range) {
    this.range = range;
    return this;
  }

  setBulletSize(bulletSize) {
    this.bulletSize = bulletSize;
    return this;
  }

  setBulletSpeed(bulletSpeed) {
    this.bulletSpeed = bulletSpeed;
    return this;
  }

  setBulletBurnTime(bulletBurnTime) {
    this.bulletBurnTime = bulletBurnTime;
    return this;
  }

  setBulletFreezeTime(bulletFreezeTime) {
    this.bulletFreezeTime = bulletFreezeTime;
    return this;
  }

  setBulletPoisons(bulletPoisons) {
    this.bulletPoisons = bulletPoisons;
    return this;
  }

  setBulletConverts(bulletConverts) {
    this.bulletConverts = bulletConverts;
    return this;
  }

  extraConditions(entity) {
    return true;
  }

  findEnemy(conditional) {
    var bestDistance = 10000;
    var index = 0;
    for (var i = 0; i < entities.length; ++i) {
      if ((entities[i] instanceof Bullet) || entities[i].team == this.team || (conditional && !this.extraConditions(entities[i]))) {
        continue;
      }
      var distance = Math.sqrt(Math.pow(entities[i].x - this.x, 2) + Math.pow(entities[i].y - this.y, 2));
      if (distance < bestDistance) {
        bestDistance = distance;
        index = i;
      }
    }
    return [bestDistance, index];
  }

  tick() {
    if (this.updateStatus()) {
      return;
    }
    var val = this.findEnemy(true);
    var bestDistance = val[0];
    if (bestDistance == 10000) {
      val = this.findEnemy(false);
      bestDistance = val[0];
    }
    var index = val[1];
    if (bestDistance != 10000) {
      if (bestDistance > this.range) {
        var oldX = this.x;
        var oldY = this.y;
        this.x += (entities[index].x - this.x) * this.speed / bestDistance;
        this.y += (entities[index].y - this.y) * this.speed / bestDistance;
        for (var i = 0; i < entities.length; ++i) {
          if (this.touches(entities[i]) && entities[i].touches(this) && this !== entities[i]) {
            this.x = oldX;
            this.y = oldY;
            return;
          }
        }
      }
      else {
        if (this.cooldown <= 0) {
          var bvx = this.bulletSpeed * (entities[index].x - this.x) / bestDistance + (Math.random() - 0.5) * 5 / this.maxCooldown;
          var bvy = this.bulletSpeed * (entities[index].y - this.y) / bestDistance + (Math.random() - 0.5) * 5 / this.maxCooldown;
          entities.push(new Bullet().setPosition(this.x, this.y).setVelocity(bvx, bvy).setAttack(randint(this.minAttack, this.maxAttack)).setSize(this.bulletSize).setBurnTime(this.bulletBurnTime).setFreezeTime(this.bulletFreezeTime).setPoisons(this.bulletPoisons).setColor(this.bulletColor).setConverts(this.bulletConverts).setSource(this));
          this.cooldown = this.maxCooldown;
        }
        this.cooldown--;
      }
    }
  }
}

class Gunner extends Archer {
  constructor() {
    super();
    this.speed = 2;
    this.health = randint(40, 60);
    this.maxHealth = this.health;
    this.minAttack = 2;
    this.maxAttack = 4;
    this.range = 250;
    this.cooldown = 2;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 4;
    this.bulletSpeed = 4;
  }
}

class Flamethrower extends Archer {
  constructor() {
    super();
    this.health = randint(40, 60);
    this.maxHealth = this.health;
    this.minAttack = 1;
    this.maxAttack = 2;
    this.range = 100;
    this.cooldown = 4;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 8;
    this.bulletSpeed = 4;
    this.bulletBurnTime = 16;
    this.bulletColor = "orangered";
  }

  extraConditions(enemy) {
    return !enemy.burning;
  }
}

class Frostthrower extends Archer {
  constructor() {
    super();
    this.speed = 1;
    this.minAttack = 4;
    this.maxAttack = 8;
    this.range = 200;
    this.cooldown = 8;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 8;
    this.bulletSpeed = 4;
    this.bulletFreezeTime = 32;
    this.bulletColor = "cyan";
  }
}

class Poisonthrower extends Archer {
  constructor() {
    super();
    this.speed = 1.25;
    this.health = randint(60, 90);
    this.maxHealth = this.health;
    this.minAttack = 2;
    this.maxAttack = 4;
    this.range = 150;
    this.cooldown = 6;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 8;
    this.bulletSpeed = 4;
    this.bulletPoisons = true;
    this.bulletColor = "darkgreen";
  }

  extraConditions(enemy) {
    return !enemy.poisoned;
  }
}

class FireMage extends Archer {
  constructor() {
    super();
    this.speed = 0.75;
    this.health = randint(320, 480);
    this.maxHealth = this.health;
    this.minAttack = 2;
    this.maxAttack = 4;
    this.range = 500;
    this.cooldown = 40;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 12;
    this.bulletSpeed = 2;
    this.bulletBurnTime = 80;
    this.bulletColor = "orangered";
  }

  extraConditions(enemy) {
    return !enemy.burning;
  }
}

class IceMage extends Archer {
  constructor() {
    super();
    this.speed = 0.75;
    this.health = randint(640, 960);
    this.maxHealth = this.health;
    this.minAttack = 4;
    this.maxAttack = 8;
    this.range = 500;
    this.cooldown = 80;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 12;
    this.bulletSpeed = 2;
    this.bulletFreezeTime = 160;
    this.bulletColor = "cyan";
  }
}

class PoisonMage extends Archer {
  constructor() {
    super();
    this.speed = 0.75;
    this.health = randint(480, 720);
    this.maxHealth = this.health;
    this.minAttack = 3;
    this.maxAttack = 6;
    this.range = 500;
    this.cooldown = 60;
    this.maxCooldown = this.cooldown;
    this.bulletSize = 12;
    this.bulletSpeed = 2;
    this.bulletPoisons = true;
    this.bulletColor = "darkgreen";
  }

  extraConditions(enemy) {
    return !enemy.poisoned;
  }
}

class Healer extends Archer {
  constructor() {
    super();
    this.speed = 0.5;
    this.health = randint(640, 960);
    this.maxHealth = this.health;
    this.minAttack = 0;
    this.maxAttack = 0;
    this.minHeal = 64;
    this.maxHeal = 128;
    this.size = 20;
    this.range = 300;
    this.bulletSize = 12;
    this.bulletSpeed = 1;
    this.bulletColor = "darkgoldenrod";
  }

  setHeal(minHeal, maxHeal) {
    this.minHeal = minHeal;
    this.maxHeal = maxHeal;
    return this;
  }

  extraConditions(ally) {
    return (ally.health < ally.maxHealth);
  }

  findEnemy(conditional) {
    var bestDistance = 10000;
    var index = 0;
    for (var i = 0; i < entities.length; ++i) {
      if ((entities[i] instanceof Bullet) || entities[i].team != this.team || entities[i] === this || (conditional && !this.extraConditions(entities[i]))) {
        continue;
      }
      var distance = Math.sqrt(Math.pow(entities[i].x - this.x, 2) + Math.pow(entities[i].y - this.y, 2));
      if (distance < bestDistance) {
        bestDistance = distance;
        index = i;
      }
    }
    return [bestDistance, index];
  }

  tick() {
    if (this.updateStatus()) {
      return;
    }
    if (this.health < this.maxHealth) {
      if (this.cooldown <= 0) {
        this.health = Math.min(this.health + randint(this.minHeal, this.maxHeal), this.maxHealth);
        this.cooldown = this.maxCooldown;
      }
      this.cooldown--;
      return;
    }
    var val = this.findEnemy(true);
    var bestDistance = val[0];
    if (bestDistance == 10000) {
      val = this.findEnemy(false);
      bestDistance = val[0];
    }
    var index = val[1];
    if (bestDistance != 10000) {
      if (bestDistance > this.range) {
        var oldX = this.x;
        var oldY = this.y;
        this.x += (entities[index].x - this.x) * this.speed / bestDistance;
        this.y += (entities[index].y - this.y) * this.speed / bestDistance;
        for (var i = 0; i < entities.length; ++i) {
          if (this.touches(entities[i]) && entities[i].touches(this) && this !== entities[i]) {
            this.x = oldX;
            this.y = oldY;
            return;
          }
        }
      }
      else {
        if (this.cooldown <= 0) {
          var bvx = this.bulletSpeed * (entities[index].x - this.x) / bestDistance + (Math.random() - 0.5) * 5 / this.maxCooldown;
          var bvy = this.bulletSpeed * (entities[index].y - this.y) / bestDistance + (Math.random() - 0.5) * 5 / this.maxCooldown;
          entities.push(new Bullet().setPosition(this.x, this.y).setVelocity(bvx, bvy).setAttack(randint(this.minAttack, this.maxAttack)).setHeal(randint(this.minHeal, this.maxHeal)).setSize(this.bulletSize).setBurnTime(this.bulletBurnTime).setFreezeTime(this.bulletFreezeTime).setPoisons(this.bulletPoisons).setColor(this.bulletColor).setSource(this));
          this.cooldown = this.maxCooldown;
        }
        this.cooldown--;
      }
    }
  }
}

class Healththrower extends Healer {
  constructor() {
    super();
    this.speed = 2;
    this.health = randint(20, 30);
    this.maxHealth = this.health;
    this.minAttack = 0;
    this.maxAttack = 0;
    this.minHeal = 1;
    this.maxHeal = 2;
    this.size = 10;
    this.range = 250;
    this.cooldown = 2;
    this.maxCooldown = 2;
    this.bulletSize = 4;
    this.bulletSpeed = 4;
    this.bulletColor = "darkgoldenrod";
  }
}

class Converter extends Archer {
  constructor() {
    super();
    this.speed = 0.25;
    this.health = randint(160, 240);
    this.maxHealth = this.health;
    this.minAttack = 0;
    this.maxAttack = 0;
    this.size = 30;
    this.cooldown = 320;
    this.bulletSize = 12;
    this.bulletSpeed = 1;
    this.bulletColor = "gray";
    this.bulletConverts = true;
  }
}

entities.push(new Giant().setPosition(screen.width / 2, screen.height / 2).setTeam(0));
for (var i = 0; i < 250; ++i) {
  while (true) {
    var x = randint(100, screen.width - 100);
    var y = randint(100, screen.height - 100);
    var team = randint(1, colors.length - 1);
    var val = randint(0, 29);
    if (val <= 2) {
      entities.push(new BigWarrior().setPosition(x, y).setTeam(team));
    }
    else if (val == 3) {
      entities.push(new Vampire().setPosition(x, y).setTeam(team));
    }
    else if (val == 4) {
      entities.push(new Decoy().setPosition(x, y).setTeam(team));
    }
    else if (val <= 6) {
      entities.push(new Rogue().setPosition(x, y).setTeam(team));
    }
    else if (val == 7) {
      entities.push(new Converter().setPosition(x, y).setTeam(team));
    }
    else if (val == 8) {
      entities.push(new Healer().setPosition(x, y).setTeam(team));
    }
    else if (val == 9) {
      entities.push(new Healththrower().setPosition(x, y).setTeam(team));
    }
    else if (val <= 11) {
      entities.push(new Gunner().setPosition(x, y).setTeam(team));
    }
    else if (val == 12) {
      entities.push(new Flamethrower().setPosition(x, y).setTeam(team));
    }
    else if (val == 13) {
      entities.push(new Frostthrower().setPosition(x, y).setTeam(team));
    }
    else if (val == 14) {
      entities.push(new Poisonthrower().setPosition(x, y).setTeam(team));
    }
    else if (val == 15) {
      entities.push(new FireMage().setPosition(x, y).setTeam(team));
    }
    else if (val == 16) {
      entities.push(new IceMage().setPosition(x, y).setTeam(team));
    }
    else if (val == 17) {
      entities.push(new PoisonMage().setPosition(x, y).setTeam(team));
    }
    else if (val <= 21) {
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
