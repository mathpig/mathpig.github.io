"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 50;

var entities = [];
var toRemove = [];

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

var keySet = {};

var map = ["B                                                    B",
           "B                                                    B",
           "B                                A           A       B",
           "B                                BBBBbbbbbBBBB       B",
           "B                                BbbbBbbbBbbbB       B",
           "B                                BbbbbbbbbbbbB       B",
           "B                               EBbbbbBBBbbbbB       B",
           "B                               BBbbbbbbbbbbbB       B",
           "B                               BbbbBbbbbbBbbB       B",
           "B                               BbbbbbbbbbbbbB       B",
           "B                              ABbbbbbBBBbbbbB       B",
           "B                              BBbbbbbbbbbbbbB       B",
           "B                             EBbbbbBbbbbbBbbB       B",
           "B                             BBbbbbbbbbbbbbbB       B",
           "B                            ABbbbbbbbBBBbbbbB       B",
           "B                            BBbbbbbbbbbbbbbbB       B",
           "B                           EBbbbbbbBbbbbbBbbB       B",
           "B                          ABBbbbbbbbbbbbbbbbB       B",
           "B                         ABBbbbbbbbbbBBBbbbbB       B",
           "B                        ABBbbbbbbbbbbbbbbbbbB       B",
           "B                        MMmmmmmmmmmMmmmmmMmmM       B",
           "B                       MMmmmmmmmmmmmmmmmmmmmM       B",
           "B                    E MMmmmmmmmmmmmmmMMMmmmmM       B",
           "B                    MMMmmmmmmmmmmmmmmmMmmmmmM       B",
           "B                  MMMmmmmmmmmmmmmmmmMMMMMmmmM       B",
           "B                MMMmmmmmmmmmmmmmmmMMMmmmMMMmM       B",
           "B               WWmmmmmmmmmmmmmmmmmmmmmmmmmmmM       B",
           "B           E B WWmmmmmmmmmmmmmmmmMmmmmPmmmmMM O     B",
           "GGGGGGGGGGGGGGGGMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMGGGGGGGG",
           "DDDDDDDDDDDDDDDDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];

function Init() {
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[i].length; ++j) {
      var block = map[i][j];
      if (block == " ") {
        continue;
      }
      var x = (blockSize * j);
      var y = (blockSize * i);
      if (block == "B") {
        entities.push(new Brick().setPosition(x, y));
      }
      else if (block == "b") {
        entities.push(new BackgroundBrick().setPosition(x, y));
      }
      else if (block == "M") {
        entities.push(new Marble().setPosition(x, y));
      }
      else if (block == "m") {
        entities.push(new BackgroundMarble().setPosition(x, y));
      }
      else if (block == "G") {
        entities.push(new Grass().setPosition(x, y));
      }
      else if (block == "D") {
        entities.push(new Dirt().setPosition(x, y));
      }
      else if (block == "W") {
        entities.push(new Wall().setPosition(x, y));
      }
      else if (block == "P") {
        entities.push(new Palladium().setPosition(x, y));
      }
    }
  }
  entities.push(player);
}

function distance(e1, e2) {
  return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = blockSize;
    this.isCollidable = true;
    this.damageVal = 0;
    this.color = "black";
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

  setDoCollision(doCollision) {
    this.doCollision = doCollision;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2 - 1, this.y - this.size / 2 - 1, this.size + 2, this.size + 2);
  }

  tick() {
  }
}

class Brick extends Block {
  constructor() {
    super();
    this.color1 = "rgb(" + String(Math.random() * 32 + 112) + ", " + String(Math.random() * 32 + 112) + ", " + String(Math.random() * 32 + 112) + ")";
    this.color2 = "rgb(0, 0, 0)";
  }

  draw() {
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.strokeStyle = this.color2;
    ctx.lineWidth = (blockSize / 10);
    ctx.beginPath();
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.moveTo(this.x - this.size / 2, this.y);
    ctx.lineTo(this.x + this.size / 2, this.y);
    ctx.moveTo(this.x - this.size / 6, this.y - this.size / 2);
    ctx.lineTo(this.x - this.size / 6, this.y);
    ctx.moveTo(this.x + this.size / 6, this.y);
    ctx.lineTo(this.x + this.size / 6, this.y + this.size / 2);
    ctx.stroke();
  }
}

class BackgroundBrick extends Brick {
  constructor() {
    super();
    this.isCollidable = false;
    this.color1 = "rgb(" + String(Math.random() * 16 + 56) + ", " + String(Math.random() * 16 + 56) + ", " + String(Math.random() * 16 + 56) + ")";
  }
}

class Marble extends Block {
  constructor() {
    super();
    this.color1 = "rgb(" + String(Math.random() * 64 + 192) + ", " + String(Math.random() * 32 + 96) + ", " + String(Math.random() * 32 + 96) + ")";
    this.color2 = "rgb(" + String(Math.random() * 16 + 240) + ", " + String(Math.random() * 16 + 240) + ", " + String(Math.random() * 12 + 180) + ")";
    this.color3 = "rgb(0, 0, 0)";
    this.colorMap = ["12111211",
                     "21212121",
                     "12121212",
                     "22212221",
                     "12111211",
                     "21212121",
                     "12121212",
                     "22212221"];
  }

  draw() {
    for (var i = 0; i < this.colorMap.length; ++i) {
      for (var j = 0; j < this.colorMap[0].length; ++j) {
        if (this.colorMap[i][j] == "1") {
          ctx.fillStyle = this.color1;
        }
        else {
          ctx.fillStyle = this.color2;
        }
        ctx.fillRect(this.x - this.size / 2 + j * this.size / this.colorMap[0].length - 1,
                     this.y - this.size / 2 + i * this.size / this.colorMap.length - 1,
                     this.size / this.colorMap.length + 2,
                     this.size / this.colorMap[0].length + 2);
      }
    }
    ctx.strokeStyle = this.color3;
    ctx.lineWidth = (blockSize / 10);
  }
}

class BackgroundMarble extends Marble {
  constructor() {
    super();
    this.isCollidable = false;
    this.color1 = "rgb(" + String(Math.random() * 32 + 96) + ", " + String(Math.random() * 16 + 48) + ", " + String(Math.random() * 16 + 48) + ")";
    this.color2 = "rgb(" + String(Math.random() * 8 + 120) + ", " + String(Math.random() * 8 + 120) + ", " + String(Math.random() * 6 + 90) + ")";
  }
}

class Grass extends Block {
  constructor() {
    super();
    this.color = "green";
  }
}

class Dirt extends Block {
  constructor() {
    super();
    this.color = "brown";
  }
}

class Wall extends Block {
  constructor() {
    super();
    this.isCollidable = false;
    this.color1 = "brown";
    this.color2 = "black";
  }

  draw() {
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.x - this.size / 2 - 1, this.y - this.size / 2 - 1, this.size + 2, this.size + 2);
    ctx.strokeStyle = this.color2;
    ctx.lineWidth = (blockSize / 10);
    ctx.beginPath();
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.moveTo(this.x - this.size / 4, this.y - this.size / 2);
    ctx.lineTo(this.x - this.size / 4, this.y + this.size / 2);
    ctx.moveTo(this.x, this.y - this.size / 2);
    ctx.lineTo(this.x, this.y + this.size / 2);
    ctx.moveTo(this.x + this.size / 4, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 4, this.y + this.size / 2);
    ctx.stroke();
  }
}

class Palladium extends Block {
  constructor() {
    super();
    this.color = "brown";
    this.colorMap = ["B B B B B",
                     " SSSSSSS ",
                     "BWWWWWWWB",
                     " W     W ",
                     "BW E E WB",
                     " W  N  W ",
                     "BW  M  WB",
                     " W     W ",
                     "B B B B B"];
  }

  draw() {
    for (var i = 0; i < this.colorMap.length; ++i) {
      for (var j = 0; j < this.colorMap[0].length; ++j) {
        if (this.colorMap[i][j] == "W") {
          ctx.fillStyle = "brown";
        }
        else if (this.colorMap[i][j] == "B") {
          ctx.fillStyle = "yellow";
        }
        else {
          ctx.fillStyle = "olive";
        }
        var x = (this.x - this.size / 2 + j * this.size / this.colorMap[0].length);
        var y = (this.y - this.size / 2 + i * this.size / this.colorMap.length);
        var sizeX = (this.size / this.colorMap.length);
        var sizeY = (this.size / this.colorMap[0].length);
        ctx.fillRect(x - 1, y - 1, sizeX + 2, sizeY + 2);
        if (this.colorMap[i][j] == "S") {
          ctx.fillStyle = "brown";
          ctx.fillRect(x + sizeX / 4, y + sizeY / 2, sizeX / 2, sizeY / 2);
        }
        else if (this.colorMap[i][j] == "E" || this.colorMap[i][j] == "N") {
          ctx.strokeStyle = "brown";
          ctx.lineWidth = (sizeX / 10);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + sizeX, y);
          ctx.lineTo(x + sizeX, y + sizeY);
          ctx.lineTo(x, y + sizeY);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (this.colorMap[i][j] == "E") {
            ctx.fillStyle = "brown";
            ctx.fillRect(x + sizeX / 4, y + sizeY / 4, sizeX / 2, sizeY / 2);
          }
        }
        else if (this.colorMap[i][j] == "M") {
          ctx.strokeStyle = "brown";
          ctx.lineWidth = (sizeX / 10);
          ctx.beginPath();
          ctx.moveTo(x, y + sizeY / 2);
          ctx.lineTo(x + sizeX, y + sizeY / 2);
          ctx.stroke();
        }
      }
    }
  }
}

class Knight {
  constructor() {
    this.speed = (blockSize / 10);
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.size = (blockSize * 4 / 5);
    this.color = "blue";
    this.health = 100;
    this.maxHealth = this.health;
    this.attack = 10;
    this.attackCooldown = 0;
    this.maxAttackCooldown = 20;
    this.jumpCountdown = 0;
    this.maxJumpCountdown = 10;
    this.colorMap = ["S  ###   ",
                     "S  ###   ",
                     "S  ###   ",
                     "S   #    ",
                     "S## # #DD",
                     "S #####  ",
                     "S   #    ",
                     "S  ###   ",
                     "S #   #  "];
    this.direction = 1;
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

  setVelocity(vy) {
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

  setHealth(health) {
    this.health = health;
    return this;
  }

  setMaxHealth(maxHealth) {
    this.maxHealth = maxHealth;
    return this;
  }

  setAttack(attack) {
    this.attack = attack;
    return this;
  }

  setAttackCooldown(attackCooldown) {
    this.attackCooldown = attackCooldown;
    return this;
  }

  setMaxAttackCooldown(maxAttackCooldown) {
    this.maxAttackCooldown = maxAttackCooldown;
    return this;
  }

  setJumpCountdown(jumpCountdown) {
    this.jumpCountdown = jumpCountdown;
    return this;
  }

  setMaxJumpCountdown(maxJumpCountdown) {
    this.maxJumpCountdown = maxJumpCountdown;
    return this;
  }

  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  draw() {
    for (var i = 0; i < this.colorMap.length; ++i) {
      for (var j = 0; j < this.colorMap[0].length; ++j) {
        if (this.colorMap[i][j] == " ") {
          continue;
        }
        if (this.colorMap[i][j] == "#") {
          ctx.fillStyle = this.color;
        }
        else {
          ctx.fillStyle = "silver";
        }
        if (this.direction == 1) {
          var x = (this.x - this.size / 2 + j * this.size / this.colorMap[0].length);
        }
        else {
          var x = (this.x + this.size / 2 - (j + 1) * this.size / this.colorMap[0].length);
        }
        ctx.fillRect(x, this.y - this.size / 2 + i * this.size / this.colorMap.length, this.size / this.colorMap[0].length, this.size / this.colorMap.length);
      }
    }
    this.drawhealthbar();
  }

  drawhealthbar() {
    var val = (this.health / this.maxHealth) * this.size;
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size / 2, this.y - 7 * this.size / 10, val, this.size / 10);
    ctx.fillStyle = "darkred";
    ctx.fillRect(this.x - this.size / 2 + val, this.y - 7 * this.size / 10, this.size - val, this.size / 10);
  }

  tick() {
    var oldX = this.x;
    var val = 0;
    if (keySet["ArrowLeft"]) {
      this.direction = -1;
      val--;
    }
    if (keySet["ArrowRight"]) {
      this.direction = 1;
      val++;
    }
    for (var i = 0; i < this.speed; ++i) {
      this.x += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j])) {
          if (entities[j] === this) {
            continue;
          }
          if (entities[j] instanceof Block && !entities[j].isCollidable) {
            continue;
          }
          if (this.attackCooldown < 0 && (entities[j] instanceof EnemyKnight || entities[j] instanceof EnemyArcher)) {
            this.attackCooldown = this.maxAttackCooldown;
            entities[j].health -= this.attack;
            if (entities[j].health <= 0) {
              toRemove.push(entities[j]);
            }
          }
          failed = true;
          break;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
    }
    this.vy += (blockSize / 100);
    this.vy *= 0.95;
    var val = Math.sign(this.vy);
    var vy = Math.abs(this.vy);
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] instanceof Block && entities[j].isCollidable) {
          failed = true;
          break;
        }
      }
      if (failed) {
        if (this.vy > 0) {
          this.jumpCountdown--;
        }
        else {
          this.jumpCountdown = this.maxJumpCountdown;
        }
        if (this.jumpCountdown <= 0 && keySet["ArrowUp"]) {
          this.vy -= (blockSize / 2);
        }
        this.y -= val;
        break;
      }
      else {
        this.jumpCountdown = this.maxJumpCountdown;
      }
    }
  }
}

class EnemyKnight {
  constructor() {
    this.speed = (blockSize / 10);
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.size = (blockSize * 4 / 5);
    this.color = "blue";
    this.health = 100;
    this.maxHealth = this.health;
    this.attack = 10;
    this.attackCooldown = 0;
    this.maxAttackCooldown = 20;
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

  setVelocity(vy) {
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

  setHealth(health) {
    this.health = health;
    return this;
  }

  setMaxHealth(maxHealth) {
    this.maxHealth = maxHealth;
    return this;
  }

  setAttack(attack) {
    this.attack = attack;
    return this;
  }

  setAttackCooldown(attackCooldown) {
    this.attackCooldown = attackCooldown;
    return this;
  }

  setMaxAttackCooldown(maxAttackCooldown) {
    this.maxAttackCooldown = maxAttackCooldown;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    this.drawhealthbar();
  }

  drawhealthbar() {
    var val = (this.health / this.maxHealth) * this.size;
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size / 2, this.y - 4 * this.size / 5, val, this.size / 5);
    ctx.fillStyle = "darkred";
    ctx.fillRect(this.x - this.size / 2 + val, this.y - 4 * this.size / 5, this.size - val, this.size / 5);
  }

  tick() {
    var oldX = this.x;
    var val = 0;
    if ((this.x + 500) < player.x) {
      val++;
    }
    if ((player.x + 500) < this.x) {
      val--;
    }
    for (var i = 0; i < this.speed; ++i) {
      this.x += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j])) {
          if (entities[j] === this) {
            continue;
          }
          if (entities[j] instanceof Block && !entities[j].isCollidable) {
            continue;
          }
          if (this.attackCooldown < 0 && entities[i] instanceof Knight) {
            this.attackCooldown = this.maxAttackCooldown;
            entities[j].health -= this.attack;
            if (entities[j].health <= 0) {
              toRemove.push(entities[j]);
            }
          }
          failed = true;
          break;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
    }
    this.vy += (blockSize / 100);
    this.vy *= 0.95;
    var val = Math.sign(this.vy);
    var vy = Math.abs(this.vy);
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] instanceof Block && entities[j].isCollidable) {
          failed = true;
          break;
        }
      }
      if (failed) {
        break;
      }
    }
  }
}

screen.width = 20 * blockSize;
screen.height = 10 * blockSize;

function Draw() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(screen.width / 2 - player.x, screen.height / 2 - player.y);
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < (blockSize * 12)) {
      entities[i].draw();
    }
  }
  ctx.restore();
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  for (var i = 0; i < toRemove.length; ++i) {
    for (var j = 0; j < entities.length; ++j) {
      if (toRemove[i] === entities[j]) {
        entities.splice(j, 1);
        break;
      }
    }
  }
  Draw();
}

var player = new Knight().setPosition(1025, 425);

Init();
setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
