"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 50;

var entities = [];

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

var keySet = {};

var map = ["B              BHHB    BHHB    BHHB    BHHB                                B",
           "B       BBBBBHHBHHB    BHHB    BHHB    BHHB                                B",
           "B       BHHHHHBBBBBB  BBBBBB  BBBBBB  BBBBBB BB BB BB                      B",
           "B       BHHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB                               B",
           "B       BHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB          B                    B",
           "B       BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB                               B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB            B                  B",
           "B       BBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB                               B",
           "B       BHHHHHHHHHHHSSHHHHHHHHHHHHHHHHHHHHHB              B                B",
           "B       BHHBHHHHHHHHSSHHHHHHHHHHHHHHHHHHHHHB                               B",
           "B       BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBHHHB                BBBHHBBB       B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHHB                BHHHHHHB       B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB                BHHBBHHB       B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBB                BBHHHHBB       B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB                BHHHHHHB       B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHHB                BHHBBHHB       B",
           "B       BHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB                BBBBBBBB       B",
           "B       BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB                BHHHHHHB       B",
           "B       BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB                BBHHHHBB       B",
           "B       BBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH                BHHBBHHB       B",
           "B       HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH                HHHHHHHH       B",
           "B       HHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH                HHBHHBHH       B",
           "GGHHHHGGBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBGGGGLLLLLLLLGGGGBBBBBBBBGGGGGGGG",
           "DDHHHHDDBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBDDDDLLLLLLLLDDDDBBBBBBBBDDDDDDDD",
           "DDGGGGDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];

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
      else if (block == "H") {
        entities.push(new BackgroundBrick().setPosition(x, y));
      }
      else if (block == "G") {
        entities.push(new Grass().setPosition(x, y));
      }
      else if (block == "D") {
        entities.push(new Dirt().setPosition(x, y));
      }
      else if (block == "L") {
        entities.push(new Lava().setPosition(x, y));
      }
      else if (block == "S") {
        entities.push(new Spawner().setPosition(x, y));
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
    this.color1 = "rgb(" + String(Math.random() * 32 + 116) + ", " + String(Math.random() * 32 + 116) + ", " + String(Math.random() * 32 + 116) + ")";
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

class Lava extends Block {
  constructor() {
    super();
    this.color = "red";
    this.damageVal = 5;
  }
}

class Spawner extends Block {
  constructor() {
    super();
    this.isCollidable = false;
    this.color = "maroon";
  }
}

class Knight {
  constructor() {
    this.speed = blockSize / 10;
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.size = blockSize * 0.8;
    this.color = "blue";
    this.health = 100;
    this.maxHealth = this.health;
    this.stunCountdown = 0;
    this.stunCount = 0;
    this.jumpCountdown = 0;
    this.maxJumpCountdown = 10;
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

  setStunCountdown(stunCountdown) {
    this.stunCountdown = stunCountdown;
    return this;
  }

  setStunCount(stunCount) {
    this.stunCount = stunCount;
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

  draw() {
    ctx.fillStyle = this.color;
    if (this.stunCountdown > 0) {
      ctx.fillStyle = "gray";
    }
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
    if (this.stunCountdown > 0) {
      this.stunCountdown--;
      this.health++;
    }
    var val = 0;
    if (this.stunCountdown == 0) {
      if (keySet["ArrowLeft"]) {
        val--;
      }
      if (keySet["ArrowRight"]) {
        val++;
      }
    }
    for (var i = 0; i < this.speed; ++i) {
      this.x += val;
      var touchedEntities = [];
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] instanceof Block && entities[j].isCollidable) {
          touchedEntities.push(entities[j]);
        }
      }
      if (touchedEntities.length > 0) {
        if (this.stunCountdown == 0) {
          var worstLoss = 1000;
          for (var j = 0; j < touchedEntities.length; ++j) {
            worstLoss = Math.min(worstLoss, touchedEntities[j].damageVal);
          }
          this.health -= worstLoss;
          if (this.health <= 0) {
            this.health = 0;
            this.stunCountdown = this.maxHealth;
            this.stunCount++;
          }
        }
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
      var touchedEntities = [];
      for (var j = 0; j < entities.length; ++j) {
        if (touches(this, entities[j]) && entities[j] instanceof Block && entities[j].isCollidable) {
          touchedEntities.push(entities[j]);
        }
      }
      if (touchedEntities.length == 0) {
        this.jumpCountdown = this.maxJumpCountdown;
      }
      if (touchedEntities.length > 0) {
        if (this.vy > 0 && this.stunCountdown == 0) {
          this.jumpCountdown--;
        }
        else {
          this.jumpCountdown = this.maxJumpCountdown;
        }
        this.vy = 0;
        if (this.jumpCountdown <= 0 && keySet["ArrowUp"]) {
          this.vy -= (blockSize / 0.5);
        }
        if (this.stunCountdown == 0) {
          var worstLoss = 1000;
          for (var j = 0; j < touchedEntities.length; ++j) {
            worstLoss = Math.min(worstLoss, touchedEntities[j].damageVal);
          }
          this.health -= worstLoss;
          if (this.health <= 0) {
            this.health = 0;
            this.stunCountdown = this.maxHealth;
            this.stunCount++;
          }
        }
        this.y -= val;
        break;
      }
    }
  }
}

screen.width = 20 * blockSize;
screen.height = 10 * blockSize;

function drawAchievement(message) {
  ctx.fillStyle = "orange";
  ctx.fillRect(screen.width / 4, 10, screen.width / 2, screen.height / 4 + 10);
  ctx.fillStyle = "blue";
  ctx.font = "bold 48px serif";
  ctx.textAlign = "center";
  ctx.fillText("Achievement Get!", screen.width / 2, screen.height / 12 + 10 + 24);
  ctx.font = "bold 20px serif";
  ctx.textAlign = "center";
  ctx.fillText(message, screen.width / 2, screen.height / 6 + 10 + 10);
}

function hasAchievement(n) {
  if (n == 0 && player.stunCount >= 1) {
    return true;
  }
  if (n == 1 && player.stunCount >= 5) {
    return true;
  }
  if (n == 2 && player.y == 1155) {
    return true;
  }
  if (n == 3 && player.y < -50) {
    return true;
  }
  if (n == 4 && player.x == 45) {
    return true;
  }
  if (n == 5 && player.x == 3705) {
    return true;
  }
  if (n == 6) {
    for (var i = 0; i < 6; ++i) {
      if (!hasUnlocked[i]) {
        return false;
      }
    }
    return true;
  }
}

var hasUnlocked = [];
var achievementCountdowns = [];
var achievementMessages = ["You wanted some, so you got some. - Die. Just die.",
                           "Shouldn't you be dead by now? - Die 5 times",
                           "Now we've hit rock bottom! - Touch grass",
                           "On top of the world - Do jumping jacks on the roof",
                           "Yeah, there's a wall. Got a problem? - Touch the left wall",
                           "THE END OF THE WORLD - Touch the right wall",
                           "Just that awesome - Unlock all other achievements"];

for (var i = 0; i < 7; ++i) {
  hasUnlocked.push(false);
  achievementCountdowns.push(200);
}

function Draw() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(screen.width / 2 + player.size / 2 - player.x, screen.height / 2 + player.size / 2 - player.y);
  for (var i = 0; i < entities.length; ++i) {
    if (distance(player, entities[i]) < (blockSize * 12)) {
      entities[i].draw();
    }
  }
  ctx.restore();
  var showingAchievement = false;
  for (var i = 0; i < hasUnlocked.length; ++i) {
    if (!hasUnlocked[i] && hasAchievement(i)) {
      hasUnlocked[i] = true;
    }
    if (hasUnlocked[i] && achievementCountdowns[i] > 0 && !showingAchievement) {
      drawAchievement(achievementMessages[i]);
      achievementCountdowns[i]--;
      showingAchievement = true;
    }
  }
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
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
