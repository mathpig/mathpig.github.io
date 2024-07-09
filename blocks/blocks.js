"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSpeed = 4;
const blockSize = 16;

var entities = [];

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

function ominoTouches(e1, e2) {
  for (var i = 0; i < e1.blocks.length; ++i) {
    for (var j = 0; j < e2.blocks.length; ++j) {
      if (touches(e1.blocks[i], e2.blocks[j])) {
        return true;
      }
    }
  }
  return false;
}

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function generateOmino(axisAligned) {
  var ominos = [
    [
      ["##",
       "##"],
    ],
    [
      ["###",
       " # "],
      [" #",
       "##",
       " #"],
      [" # ",
       "###"],
      ["# ",
       "##",
       "# "],
    ],
    [
      ["# ",
       "# ",
       "##"],
      ["###",
       "#  "],
      ["##",
       " #",
       " #"],
      ["  #",
       "###"],
    ],
    [
      [" #",
       " #",
       "##"],
      ["#  ",
       "###"],
      ["##",
       "# ",
       "# "],
      ["###",
       "  #"],
    ],
    [
      [" ##",
       "## "],
      ["# ",
       "##",
       " #"],
    ],
    [
      ["## ",
       " ##"],
      [" #",
       "##",
       "# "],
    ],
    [
      ["#",
       "#",
       "#",
       "#"],
      ["####"],
    ],
  ];
  var ominoType = ominos[randint(0, ominos.length - 1)];
  var omino = ominoType[randint(0, ominoType.length - 1)];
  var lowerBound = 0;
  var upperBound = (50 - omino[0].length);
  if (axisAligned) {
    var x = blockSize * randint(lowerBound, upperBound);
  }
  else {
    var x = randint(blockSize * lowerBound, blockSize * upperBound);
  }
  var blocks = [];
  var color1 = "rgb(";
  var color2 = "rgb(";
  for (var i = 0; i < 3; ++i) {
    if (i > 0) {
      color1 += ", ";
      color2 += ", ";
    }
    var val = randint(0, 255);
    color1 += String(val);
    color2 += String(Math.round(val / 2));
  }
  color1 += ")";
  color2 += ")";
  for (var i = 0; i < omino.length; ++i) {
    for (var j = 0; j < omino[0].length; ++j) {
      if (omino[i][j] == "#") {
        blocks.push(new Block().setPosition(blockSize * j + Math.round(blockSize / 2) + x,
                                            blockSize * i + Math.round(blockSize / 2) - 100).setColor(color1, color2));
      }
    }
  }
  return new Omino().setBlocks(blocks);
}

var keySet = {};

function distance(e1, e2) {
  return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = blockSize;
    this.borderSize = Math.round(blockSize / 2);
    this.color = "rgb(128, 128, 128)";
    this.borderColor = "rgb(64, 64, 64)";
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(size, borderSize) {
    this.size = size;
    this.borderSize = borderSize;
    return this;
  }

  setColor(color, borderColor) {
    this.color = color;
    this.borderColor = borderColor;
    return this;
  }

  draw() {
    ctx.fillStyle = this.borderColor;
    ctx.fillRect(this.x - this.size / 2 - 1,
                 this.y - this.size / 2 - 1,
                 this.size + 1,
                 this.size + 1);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2 + this.borderSize / 2 - 1,
                 this.y - this.size / 2 + this.borderSize / 2 - 1,
                 this.size - this.borderSize + 1,
                 this.size - this.borderSize + 1);
  }

  fall(sgn) {
    this.y += sgn;
  }
}

class Omino {
  constructor() {
    this.blocks = [];
    this.frozen = false;
  }

  setBlocks(blocks) {
    this.blocks = blocks;
    return this;
  }

  setFrozen(frozen) {
    this.frozen = frozen;
    return this;
  }

  draw() {
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].draw();
    }
  }

  freeze() {
    this.frozen = true;
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].fall(-1);
    }
  }

  tick() {
    for (var count = 0; count < blockSpeed; ++count) {
      if (this.frozen) {
        return;
      }
      for (var i = 0; i < this.blocks.length; ++i) {
        this.blocks[i].fall(1);
      }
      for (var i = 0; i < this.blocks.length; ++i) {
        if (this.blocks[i].y > (screen.height - Math.round(blockSize / 2))) {
          this.freeze();
          break;
        }
      }
      for (var i = 0; i < entities.length; ++i) {
        if (!(entities[i] instanceof Omino) || entities[i] === this) {
          continue;
        }
        if (ominoTouches(this, entities[i]) && entities[i].frozen) {
          this.freeze();
          break;
        }
      }
    }
  }
}

/*
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
    var oldX = this.x;
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
          this.vy -= (blockSize / 2);
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
*/

function Draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
}

var time = 0;
function Tick() {
  time++;
  if ((time % 20) == 0) {
    entities.push(generateOmino(true));
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  Draw();
}

// var player = new Knight().setPosition(1025, 425);

setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
