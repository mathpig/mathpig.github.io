"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 50;

var time = 0;

var entities = [];
var toRemove = [];

var player;

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

var keySet = {};

var map = ["B                                                            B",
           "B                                                            B",
           "B                                                            B",
           "B                                                            B",
           "B                                                            B",
           "B                                                            B",
           "B                                                            B",
           "B                                                            B",
           "B                                A           A               B",
           "B                                BBBBbbbbbBBBBC              B",
           "B                                BbbbBbbbBbbbBR              B",
           "B                                BbbbbbbbbbbbBR              B",
           "B                               EBbbbbBBBbbbbBR              B",
           "B                               BBbbbbbbbbbbbBR              B",
           "B                               BbbbBbbbbbBbbBR              B",
           "B                               BbbbbbbbbbbbbBR              B",
           "B                              ABbbbbbBBBbbbbBR              B",
           "B                              BBbbbbbbbbbbbbBR              B",
           "B                             EBbbbbBbbbbbBbbBR              B",
           "B                             BBbbbbbbbbbbbbbBR              B",
           "B                            ABbbbbbbbBBBbbbbBR              B",
           "B                            BBbbbbbbbbbbbbbbBR              B",
           "B                           EBbbbbbbBbbbbbBbbBR              B",
           "B                          ABBbbbbbbbbbbbbbbbBR              B",
           "B                         EBBbbbbbbbbbBBBbbbbBR              B",
           "B                        ABBbbbbbbbbbbbbbbbbbBR              B",
           "B                        MMmmmmmmmmmMmmmmmMmmMR              B",
           "B                       MMmmmmmmmmmmmmmmmmmmmMR              B",
           "B                    E MMmmmmmmmmmmmmmMMMmmmmMR              B",
           "B                    MMMmmmmmmmmmmmmmmmMmmmmmMR              B",
           "B                  MMMmmmmmmmmmmmmmmmMMMMMmmmMR              B",
           "B                MMMmmmmmmmmmmmmmmmMMMmmmMMMmMR              B",
           "B               WWmmmmmmmmmmmmmmmmmmmmmmmmmmmMR              B",
           "B           E B WWmmmmmmmmmmmmmmmmMmmmmPmmmmMMRO           S B",
           "GGGGGGGGGGGGGGGGMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMGGGGGGGGGGGGGGGG",
           "DDDDDDDDDDDDDDDDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];

function Init() {
  var enemies = [];
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[i].length; ++j) {
      var block = map[i][j];
      var x = (blockSize * j);
      var y = (blockSize * i);
      if (block == " ") {
        entities.push(new Air().setPosition(x, y));
      }
      else if (block == "B") {
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
      else if (block == "C") {
        entities.push(new Air().setPosition(x, y));
        entities.push(new CornerRope().setPosition(x, y));
      }
      else if (block == "R") {
        entities.push(new Air().setPosition(x, y));
        entities.push(new Rope().setPosition(x, y));
      }
      else if (block == "W") {
        entities.push(new Wall().setPosition(x, y));
      }
      else if (block == "P") {
        entities.push(new Palladium().setPosition(x, y));
      }
      else if (block == "E") {
        entities.push(new Air().setPosition(x, y));
        enemies.push(new EnemyKnight().setPosition(x, y));
      }
      else if (block == "A") {
        entities.push(new Air().setPosition(x, y));
        enemies.push(new EnemyArcher().setPosition(x, y));
      }
      else if (block == "O") {
        entities.push(new Air().setPosition(x, y));
        enemies.push(new Odysseus().setPosition(x, y));
      }
      else if (block == "S") {
        entities.push(new Air().setPosition(x, y));
        player = new Knight().setPosition(x, y);
      }
    }
  }
  for (var i = 0; i < enemies.length; ++i) {
    entities.push(enemies[i]);
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

class Air extends Block {
  constructor() {
    super();
    this.color = "rgb(0, 64, 64)";
    this.isCollidable = false;
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

class Rope extends Block {
  constructor() {
    super();
    this.color = "peru";
    this.isCollidable = false;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 8, this.y - this.size / 2 - 2, this.size / 4, this.size + 4);
  }
}

class CornerRope extends Rope {
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2 - 2, this.y - this.size / 8, this.size * 5 / 8 + 4, this.size / 4);
    ctx.fillRect(this.x - this.size / 8, this.y - this.size / 8 - 2, this.size / 4, this.size * 5 / 8 + 4);
  }
}

class Knight {
  constructor() {
    this.maxSpeed = (blockSize / 10);
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = (blockSize * 4 / 5);
    this.color = "blue";
    this.health = 100;
    this.maxHealth = this.health;
    this.jumpCountdown = 0;
    this.maxJumpCountdown = 10;
    this.attack = 20;
    this.attackCooldown = 0;
    this.maxAttackCooldown = 20;
    this.mode = 0;
    this.goalMode = 0;
    this.modeCooldown = 0;
    this.maxModeCooldown = 10;
    this.colorMaps = [[" S  ###    ",
                       " S  ###    ",
                       " S  ###    ",
                       "SS   #     ",
                       "SS## # ##  ",
                       "SS #####   ",
                       "SS   #     ",
                       "SS  ###    ",
                       " S #   #   ",
                       " S #   #   ",
                       " S #   #   "],
                      ["    ###  S ",
                       "    ###  S ",
                       "    ###  S ",
                       "     #   SS",
                       "  ## # ##SS",
                       "   ##### SS",
                       "     #   SS",
                       "    ###  SS",
                       "   #   # S ",
                       "   #   # S ",
                       "   #   # S "],
                      ["S  ###     ",
                       "S  ###     ",
                       "S  ###     ",
                       "S   #      ",
                       "S## # #DDDD",
                       "S #####    ",
                       "S   #      ",
                       "S  ###     ",
                       "S #   #    ",
                       "S #   #    ",
                       "S #   #    "],
                      ["    ###    ",
                       "    ###    ",
                       "    ###    ",
                       "     #     ",
                       "  ## # ##  ",
                       "   #####   ",
                       "     #     ",
                       "    ###    ",
                       "   #   #   ",
                       "   #   #   ",
                       "   #   #   "]];
    this.direction = 1;
    this.labelCount = 0;
  }

  setMaxSpeed(maxSpeed) {
    this.maxSpeed = maxSpeed;
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

  setMode(mode) {
    this.mode = mode;
    return this;
  }

  setGoalMode(goalMode) {
    this.goalMode = goalMode;
    return this;
  }

  setModeCooldown(modeCooldown) {
    this.modeCooldown = modeCooldown;
    return this;
  }

  setMaxModeCooldown(maxModeCooldown) {
    this.maxModeCooldown = maxModeCooldown;
    return this;
  }

  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  setLabelCount(labelCount) {
    this.labelCount = labelCount;
    return this;
  }

  draw() {
    var colorMap = this.colorMaps[this.mode];
    for (var i = 0; i < colorMap.length; ++i) {
      for (var j = 0; j < colorMap[0].length; ++j) {
        if (colorMap[i][j] == " ") {
          continue;
        }
        if (colorMap[i][j] == "#") {
          ctx.fillStyle = this.color;
        }
        else {
          ctx.fillStyle = "silver";
        }
        if (this.direction == 1) {
          var x = (this.x - this.size / 2 + j * this.size / colorMap[0].length);
        }
        else {
          var x = (this.x + this.size / 2 - (j + 1) * this.size / colorMap[0].length);
        }
        ctx.fillRect(x, this.y - this.size / 2 + i * this.size / colorMap.length, this.size / colorMap[0].length, this.size / colorMap.length);
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
    if (this.attackCooldown > 0) {
      this.mode = 3;
      this.attackCooldown--;
    }
    else if (keySet["a"]) {
      this.mode = 2;
    }
    else {
      this.mode = 1;
    }
    this.vx *= (9 / 10);
    if (Math.abs(this.vx) < 1) {
      this.vx = 0;
    }
    var num = this.vx;
    if (keySet["ArrowLeft"]) {
      this.direction = -1;
      num -= this.maxSpeed;
    }
    if (keySet["ArrowRight"]) {
      this.direction = 1;
      num += this.maxSpeed;
    }
    var val = Math.sign(num);
    var vx = Math.abs(num);
    for (var i = 0; i < vx; ++i) {
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
          if (entities[j] instanceof EnemyKnight && this.mode == 2 && this.attackCooldown <= 0) {
            if (entities[j] instanceof EnemyArcher || ((entities[j].mode == 1 && this.direction == entities[j].direction) || ((entities[j].mode == 0 || entities[j].mode == 2) && this.direction != entities[j].direction) || entities[j].mode == 3)) {
              entities[j].health -= this.attack;
              if (entities[j].health <= 0) {
                toRemove.push(entities[j]);
              }
              entities[j].vx += (this.direction * blockSize);
            }
            else {
              entities[j].vx += (this.direction * blockSize / 2);
            }
            this.attackCooldown = this.maxAttackCooldown;
          }
          failed = true;
        }
      }
      if (failed) {
        this.x -= val;
        break;
      }
    }
    var touchedRope = false;
    for (var j = 0; j < entities.length; ++j) {
      if (entities[j] !== this && touches(this, entities[j]) && entities[j] instanceof Rope) {
        touchedRope = true;
        break;
      }
    }
    if (touchedRope) {
      if (keySet["ArrowUp"]) {
        this.vy = -(blockSize / 5);
      }
      else if (keySet["ArrowDown"]) {
        this.vy = (blockSize / 5);
      }
      else {
        this.vy = 0;
      }
    }
    else {
      this.vy += (blockSize / 100);
      this.vy *= 0.95;
    }
    var val = Math.sign(this.vy);
    var vy = Math.abs(this.vy);
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      var failed = false;
      for (var j = 0; j < entities.length; ++j) {
        if (entities[j] !== this && touches(this, entities[j])) {
          if (!(entities[j] instanceof Block) || entities[j].isCollidable) {
            failed = true;
          }
        }
      }
      if (failed) {
        if (this.vy > 0) {
          this.jumpCountdown--;
        }
        else {
          this.jumpCountdown = this.maxJumpCountdown;
        }
        this.vy = 0;
        if (this.jumpCountdown <= 0 && keySet["ArrowUp"]) {
          this.vy -= (blockSize / 3);
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

class EnemyKnight extends Knight {
  constructor() {
    super();
    this.speed = (blockSize / 20);
    this.color = "red";
    this.attack = 10;
    this.maxAttackCooldown = 20;
    this.maxModeCooldown = 40;
  }

  tick() {
    if ((time % 20) == 0 && distance(this, player) <= (blockSize * 5)) {
      if (player.mode == 1) {
        if (Math.random() < 0.5) {
          this.goalMode = 2;
        }
        else {
          this.goalMode = Math.floor(Math.random() * 2);
        }
      }
      else if (player.mode == 2) {
        var val = Math.random();
        if (val < 0.3) {
          this.goalMode = 2;
        }
        else if (val < 0.9) {
          this.goalMode = 1;
        }
        else {
          this.goalMode = 0;
        }
      }
      else {
        this.goalMode = 2;
      }
    }
    if (this.mode == 3) {
      this.modeCooldown--;
      if (this.modeCooldown <= 0) {
        this.mode = this.goalMode;
      }
    }
    else if (this.mode != this.goalMode) {
      this.mode = 3;
      this.modeCooldown = this.maxModeCooldown;
    }
    this.vx *= (9 / 10);
    if (Math.abs(this.vx) < 1) {
      this.vx = 0;
    }
    var num = this.vx;
    var speed = (this.maxSpeed * (1 - (this.mode / 4)));
    if (distance(this, player) <= (blockSize * 5)) {
      if (this.x > player.x) {
        this.direction = -1;
        num -= this.speed;
      }
      else {
        this.direction = 1;
        num += this.speed;
      }
    }
    var val = Math.sign(num);
    var vx = Math.abs(num);
    for (var i = 0; i < vx; ++i) {
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
          if (entities[j] === player && this.attackCooldown <= 0 && this.mode == 2) {
            if ((entities[j].mode == 1 && this.direction == entities[j].direction) || (entities[j].mode == 2 && this.direction != entities[j].direction) || entities[j].mode == 3) {
              this.attackCooldown = this.maxAttackCooldown;
              entities[j].health -= this.attack;
              if (entities[j].health <= 0) {
                toRemove.push(entities[j]);
              }
              entities[j].vx += (this.direction * blockSize);
            }
            else {
              entities[j].vx += (this.direction * blockSize / 2);
            }
          }
          failed = true;
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
        if (entities[j] !== this && touches(this, entities[j]) && (!(entities[j] instanceof Block) || entities[j].isCollidable)) {
          failed = true;
        }
      }
      if (failed) {
        if (this.vy > 0) {
          this.attackCooldown--;
        }
        else {
          this.attackCooldown = this.maxAttackCooldown;
        }
        this.y -= val;
        break;
      }
      else {
        this.attackCooldown = this.maxAttackCooldown;
      }
    }
  }
}

class EnemyArcher extends EnemyKnight {
  constructor() {
    super();
    this.colorMaps = [["   ###    B",
                       "   ###   BS",
                       "   ###  B S",
                       "    #   B S",
                       " ## # ##BAA",
                       "  ##### B S",
                       "    #   B S",
                       "   ###   BS",
                       "  #   #   B",
                       "  #   #    ",
                       "  #   #    "]];
  }

  tick() {
    this.mode = 0;
    this.vx *= (9 / 10);
    if (Math.abs(this.vx) < 1) {
      this.vx = 0;
    }
    var val = Math.sign(this.vx);
    var vx = Math.abs(this.vx);
    for (var i = 0; i < vx; ++i) {
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
          if (entities[j] === player && this.attackCooldown <= 0) {
            // Shoot at player
            this.attackCooldown = this.maxAttackCooldown;
          }
          failed = true;
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
        if (entities[j] !== this && touches(this, entities[j]) && (!(entities[j] instanceof Block) || entities[j].isCollidable)) {
          failed = true;
        }
      }
      if (failed) {
        if (this.vy > 0) {
          this.attackCooldown--;
        }
        else {
          this.attackCooldown = this.maxAttackCooldown;
        }
        this.y -= val;
        break;
      }
      else {
        this.attackCooldown = this.maxAttackCooldown;
      }
    }
  }
}

class Odysseus extends EnemyArcher {
  constructor() {
    super();
    this.health = 500;
    this.maxHealth = 500;
    this.maxAttackCooldown = 20;
    this.color = "purple";
  }
}

function findMessage(e) {
  if (e === player) {
    return "Diomedes";
  }
  else if (e instanceof Odysseus) {
    return "Odysseus";
  }
  else {
    return "Trojan";
  }
}

function drawLabel(e) {
  if (e instanceof Block || e.labelCount >= 100) {
    return;
  }
  e.labelCount++;
  ctx.fillStyle = "orange";
  ctx.fillRect(e.x - e.size, e.y - e.size * 5 / 4, e.size * 2, e.size / 2);
  ctx.fillStyle = "blue";
  ctx.font = "bold 16px serif";
  ctx.textAlign = "center";
  ctx.fillText(findMessage(e), e.x, e.y - e.size + 5);
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  if (player.health <= 0) {
    return;
  }
  ctx.save();
  ctx.translate(screen.width / 2 - player.x, screen.height / 2 - player.y);
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < (blockSize * 2.5 + blockSize * 7.5 * player.health / player.maxHealth)) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < 2.5 * blockSize) {
      drawLabel(entities[i]);
    }
  }
  ctx.restore();
}

function Tick() {
  time++;
  toRemove = [];
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  for (var i = 0; i < toRemove.length; ++i) {
    entities.splice(entities.indexOf(toRemove[i]), 1);
  }
  Draw();
}

Init();
setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
