"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSpeed = 4;
const blockSize = 16;

var player;

var entities = [];
var toRemove = [];

var time = 0;
var lostTime = 0;
var destroyTime = 0;

var hasLost = false;

function intervalTouches(a, b, c, d) {
  return (b > c && d > a);
}

function touches(e1, e2) {
  return (intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
          intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2));
}

function objectTouches(e1, e2) {
  for (var i = 0; i < e1.blocks.length; ++i) {
    if (touches(e1.blocks[i], e2)) {
      return true;
    }
  }
  return false;
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

function convert(omino, x, y, colors) {
  var blocks = [];
  for (var i = 0; i < omino.length; ++i) {
    for (var j = 0; j < omino[0].length; ++j) {
      if (omino[i][j] in colors) {
        var color1 = colors[omino[i][j]][0];
        var color2 = colors[omino[i][j]][1];
        blocks.push(new Block().setPosition(blockSize * j + Math.round(blockSize / 2) + x,
                                            blockSize * i + Math.round(blockSize / 2) + y).setColor(color1, color2));
      }
    }
  }
  return blocks;
}

function generateXCoord(width, axisAligned) {
  var lowerBound = 0;
  var upperBound = (50 - width);
  if (axisAligned) {
    return blockSize * randint(lowerBound, upperBound);
  }
  else {
    return randint(blockSize * lowerBound, blockSize * upperBound);
  }
}

function generateTank(axisAligned) {
  var omino = [" # ",
               "###",
               "###",
               " # ",
               " # "];
  var colors = {"#": ["rgb(0, 128, 0)", "rgb(0, 64, 0)"]};
  while (true) {
    var x = generateXCoord(omino[0].length, axisAligned);
    var blocks = convert(omino, x, -128, colors);
    var result = new Tank().setBlocks(blocks).setSpeed(randint(Math.round(blockSpeed / 2), blockSpeed));
    var failed = false;
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] instanceof Tank && ominoTouches(result, entities[i])) {
        failed = true;
        break;
      }
    }
    if (failed) {
      continue;
    }
    return result;
  }
}

function generateFailmino() {
  var omino = [" ####    ##   ##    ## ######",
               "##      ####  ###  ### ##    ",
               "##      #  #  ######## ##    ",
               "## ### ##  ## ## ## ## ##### ",
               "##  ## ###### ##    ## ##    ",
               "##  ## ##  ## ##    ## ##    ",
               " ##### ##  ## ##    ## ######",
               "                             ",
               "  ####  ##  ## ###### #####  ",
               " ##  ## ##  ## ##     ##  ## ",
               " ##  ## ##  ## ##     ##  ## ",
               " ##  ##  ####  #####  #####  ",
               " ##  ##  ####  ##     ####   ",
               " ##  ##   ##   ##     ## ##  ",
               "  ####    ##   ###### ##  ## ",
               "                             ",
               "                             ",
               "                             ",
               "                             ",
               "-----------------------------"];
  var colors = {
    "#": ["rgb(255, 255, 255)", "rgb(128, 128, 128)"],
    "-": ["rgb(0, 0, 0)", "rgb(0, 0, 0)"],
  };
  var blocks = convert(omino, Math.round(screen.width / 2) - omino[0].length * Math.round(blockSize / 2), -384, colors);
  return new Omino().setBlocks(blocks).setSpeed(2);
}

function generateOmino(axisAligned) {
  var ominos = [
    [
      ["#"],
    ],
    [
      ["##"],
      ["#",
       "#"],
    ],
    [
      ["###"],
      ["#",
       "#",
       "#"],
    ],
    [
      ["# ",
       "##"],
      ["##",
       "# "],
      ["##",
       " #"],
      [" #",
       "##"],
    ],
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
  var color1 = "rgb(";
  var color2 = "rgb(";
  for (var i = 0; i < 3; ++i) {
    if (i > 0) {
      color1 += ", ";
      color2 += ", ";
    }
    var val = randint(64, 255);
    color1 += String(val);
    color2 += String(Math.round(val / 2));
  }
  color1 += ")";
  color2 += ")";
  while (true) {
    var x = generateXCoord(omino[0].length, axisAligned);
    var blocks = convert(omino, x, -128, {"#": [color1, color2]});
    var result = new Omino().setBlocks(blocks);
    var failed = false;
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i].isOmino() && ominoTouches(result, entities[i])) {
        failed = true;
        break;
      }
    }
    if (failed) {
      continue;
    }
    return result;
  }
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

  isOmino() {
    return false;
  }

  draw(useWhite) {
    if (useWhite) {
      ctx.fillStyle = "rgb(255, 255, 255)";
    }
    else {
      ctx.fillStyle = this.borderColor;
    }
    ctx.fillRect(this.x - this.size / 2 - 1,
                 this.y - this.size / 2 - 1,
                 this.size + 1,
                 this.size + 1);
    if (!useWhite) {
      ctx.fillStyle = this.color;
    }
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
    this.speed = randint(Math.round(blockSpeed / 2), Math.round(blockSpeed * 3 / 2));
    this.blocks = [];
    this.frozen = false;
    this.countdown = -1;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setBlocks(blocks) {
    this.blocks = blocks;
    return this;
  }

  setFrozen(frozen) {
    this.frozen = frozen;
    return this;
  }

  setCountdown(countdown) {
    this.countdown = countdown;
    return this;
  }

  isOmino() {
    return true;
  }

  draw() {
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].draw((this.countdown % 10) >= 5);
    }
  }

  freeze(shouldStop) {
    this.frozen = shouldStop;
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].fall(-1);
    }
  }

  tick() {
    if (this.countdown > 0) {
      this.countdown--;
      if (this.countdown == 0) {
        toRemove.push(this);
        return;
      }
    }
    for (var count = 0; count < this.speed; ++count) {
      if (this.frozen) {
        return;
      }
      for (var i = 0; i < this.blocks.length; ++i) {
        this.blocks[i].fall(1);
      }
      for (var i = 0; i < this.blocks.length; ++i) {
        if (this.blocks[i].y > (screen.height - Math.round(blockSize / 2))) {
          destroyTime = 0;
          this.freeze(true);
          break;
        }
      }
      for (var i = 0; i < entities.length; ++i) {
        if (entities[i].isOmino() && entities[i] !== this && ominoTouches(this, entities[i])) {
          this.freeze(entities[i].frozen);
          break;
        }
      }
    }
    if (objectTouches(this, player)) {
      player.vy = Math.max(this.speed, Math.abs(player.vy));
      while (objectTouches(this, player)) {
        player.y++;
      }
      if (player.y > (screen.height - Math.round(player.size / 2))) {
        toRemove.push(player);
        return;
      }
      for (var i = 0; i < entities.length; ++i) {
        if (entities[i].isOmino() && objectTouches(entities[i], player)) {
          toRemove.push(player);
          break;
        }
      }
    }
  }
}

class Tank extends Omino {
  constructor() {
    super();
    this.minBulletSpeed = Math.round(blockSpeed * 3 / 2);
    this.maxBulletSpeed = Math.round(blockSpeed * 5 / 2);
  }

  setBulletSpeed(minBulletSpeed, maxBulletSpeed) {
    this.minBulletSpeed = minBulletSpeed;
    this.maxBulletSpeed = maxBulletSpeed;
    return this;
  }

  isOmino() {
    return false;
  }

  tick() {
    var failed = true;
    for (var i = 0; i < this.blocks.length; ++i) {
      this.blocks[i].fall(this.speed);
      if (this.blocks[i].y < (screen.height + 128)) {
        failed = false;
      }
    }
    if (failed) {
      toRemove.push(this);
    }
    if ((time % 20) == 0) {
      entities.push(new Bullet().setPosition(this.blocks[0].x, this.blocks[0].y + blockSize * 5).setSpeed(randint(this.minBulletSpeed, this.maxBulletSpeed)));
    }
  }
}

class Bullet extends Block {
  constructor() {
    super();
    this.speed = 0;
    this.color = "rgb(255, 255, 255)";
    this.borderColor = "rgb(255, 255, 255)";
    this.size = Math.round(blockSize / 2);
    this.borderSize = Math.round(blockSize / 4);
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  tick() {
    this.y += this.speed;
    if (this.y >= (screen.height + 128)) {
      toRemove.push(this);
      return;
    }
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i] instanceof Bullet) {
        continue;
      }
      if (entities[i] instanceof Omino && objectTouches(entities[i], this)) {
        toRemove.push(this);
        if (entities[i] instanceof Tank) {
          toRemove.push(entities[i]);
        }
        else if (entities[i].countdown < 0) {
          entities[i].countdown = 20;
        }
      }
      else if (entities[i] instanceof Player && touches(this, entities[i])) {
        toRemove.push(this);
        toRemove.push(entities[i]);
      }
    }
  }
}

class Player {
  constructor() {
    this.speed = Math.round(blockSize / 8);
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.size = Math.round(blockSize * 3 / 4);
    this.color = "blue";
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

  setJumpCountdown(jumpCountdown) {
    this.jumpCountdown = jumpCountdown;
    return this;
  }

  setMaxJumpCountdown(maxJumpCountdown) {
    this.maxJumpCountdown = maxJumpCountdown;
    return this;
  }

  isOmino() {
    return false;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    var val = 0;
    if (keySet["ArrowLeft"]) {
      val--;
    }
    if (keySet["ArrowRight"]) {
      val++;
    }
    var failed = false;
    for (var i = 0; i < this.speed; ++i) {
      this.x += val;
      if (this.x < Math.round(this.size / 2) || this.x > (screen.width - Math.round(this.size / 2))) {
        this.x -= val;
        break;
      }
      for (var j = 0; j < entities.length; ++j) {
        if (entities[j].isOmino() && objectTouches(entities[j], this)) {
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
    var failed = false;
    for (var i = 0; i < vy; ++i) {
      this.y += val;
      if (this.y > (screen.height - Math.round(this.size / 2))) {
        failed = true;
      }
      if (!failed) {
        for (var j = 0; j < entities.length; ++j) {
          if (entities[j].isOmino() && objectTouches(entities[j], this)) {
            failed = true;
            break;
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
          this.vy -= Math.round(blockSize / 2);
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

function Draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i].isOmino()) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Tank || entities[i] instanceof Bullet) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Player) {
      entities[i].draw();
    }
  }
}

function Tick() {
  if (hasLost) {
    if (lostTime == 0) {
      entities = [generateFailmino()];
    }
    lostTime++;
    if (lostTime >= 400) {
      Init();
    }
  }
  else {
    time++;
    if ((time % 10) == 0) {
      if (Math.random() < 0.05) {
        entities.push(generateTank(true));
      }
      else {
        entities.push(generateOmino(true));
      }
    }
    toRemove = [];
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  if (toRemove.indexOf(player) != -1) {
    hasLost = true;
  }
  if (hasLost) {
    Draw();
    return;
  }
  destroyTime++;
  if (destroyTime >= 80) {
    destroyTime = 0;
    for (var i = 0; i < entities.length; ++i) {
      if (entities[i].isOmino() && entities[i].frozen && Math.random() < 0.25 && entities[i].countdown < 0) {
        entities[i].countdown = 20;
      }
    }
  }
  for (var i = 0; i < toRemove.length; ++i) {
    if (toRemove[i].isOmino()) {
      for (var j = 0; j < entities.length; ++j) {
        if (entities[j].isOmino()) {
          entities[j].frozen = false;
        }
      }
      break;
    }
  }
  for (var i = 0; i < toRemove.length; ++i) {
    entities.splice(entities.indexOf(toRemove[i]), 1);
  }
  Draw();
  score.innerHTML = "</br>&nbsp;Score: " + String(time);
}

function Init() {
  hasLost = false;
  time = 0;
  lostTime = 0;
  destroyTime = 0;
  player = new Player().setPosition(screen.width / 2, screen.height / 2);
  entities = [player];
  toRemove = [];
}

Init();
setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
