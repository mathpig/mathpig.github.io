"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const defaultBlockSize = 120;
const defaultRobotSize = 20;

const mapSize = 60;

var entities = [];
var toRemove = [];

var time = 0;

var focusX = Math.round(defaultBlockSize * mapSize / 2);
var focusY = focusX;

var keySet = {};

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function distance(e1, e2) {
  return Math.sqrt((e1.x - e2.x) * (e1.x - e2.x) + (e1.y - e2.y) * (e1.y - e2.y));
}

function nearestRobot(e) {
  var best = 10000;
  var bestEntity = e;
  for (var i = 0; i < entities.length; ++i) {
    if (!(entities[i] instanceof Robot) || entities[i] === e) {
      continue;
    }
    var dist = distance(e, entities[i]);
    if (dist < best) {
      best = dist;
      bestEntity = entities[i];
    }
  }
  return [bestEntity, best];
}

function spreadVirusesWith(grid, size, ch) {
  for (var i = 0; i < size; ++i) {
    for (var j = 0; j < size; ++j) {
      if (grid[i][j] != "-") {
        continue;
      }
      if ((i > 0 && grid[i - 1][j] == "V") ||
          (j > 0 && grid[i][j - 1] == "V") ||
          (i < (size - 1) && grid[i + 1][j] == "V") ||
          (j < (size - 1) && grid[i][j + 1] == "V")) {
        grid[i][j] = "!";
      }
    }
  }
  for (var i = 0; i < size; ++i) {
    for (var j = 0; j < size; ++j) {
      if (grid[i][j] == "!") {
        grid[i][j] = ch;
      }
    }
  }
  return grid;
}

function countCells(grid, size, ch) {
  var count = 0
  for (var i = 0; i < size; ++i) {
    for (var j = 0; j < size; ++j) {
      if (grid[i][j] == ch) {
        count++;
      }
    }
  }
  return count;
}

function intervalTouches(a, b, c, d) {
  return !((b < c) || (d < a));
}

function touches(e1, e2) {
  return intervalTouches(e1.x - e1.size / 2, e1.x + e1.size / 2, e2.x - e2.size / 2, e2.x + e2.size / 2) &&
         intervalTouches(e1.y - e1.size / 2, e1.y + e1.size / 2, e2.y - e2.size / 2, e2.y + e2.size / 2);
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = defaultBlockSize;
    this.color = "red";
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

  setColor(color) {
    this.color = color;
    return this;
  }

  drawEnergyBar() {
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
  }
}

// TODO: Add Player class and add one to the entities

class Robot {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = defaultRobotSize;
    this.color = "gray";
    this.speed = 1;
    this.angle = Math.random() * 360;
    this.grid = [];
    for (var i = 0; i < 10; ++i) {
      this.grid.push([]);
      for (var j = 0; j < 10; ++j) {
        this.grid[i].push("-");
      }
    }
    this.energy = 5000;
    this.maxEnergy = 5000;
    this.energyColor = "cyan";
    this.actionType = "";
    this.actionDetails = "";
    this.changeActionCooldown = 0;
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

  setColor(color) {
    this.color = color;
    return this;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setAngle(angle) {
    this.angle = angle;
    return this;
  }

  setGrid(grid) {
    this.grid = grid;
    return this;
  }

  setEnergy(energy) {
    this.energy = energy;
    return this;
  }

  setMaxEnergy(maxEnergy) {
    this.maxEnergy = maxEnergy;
    return this;
  }

  setEnergyColor(energyColor) {
    this.energyColor = energyColor;
    return this;
  }

  setAction(actionType, actionDetails, changeActionCooldown) {
    this.actionType = actionType;
    this.actionDetails = actionDetails;
    this.changeActionCooldown = changeActionCooldown;
    return this;
  }

  drawEnergyBar() {
    ctx.fillStyle = this.energyColor;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size * 4 / 5, this.size * this.energy / this.maxEnergy, this.size / 5);
  }

  draw() {
// TODO: Draw my field of vision so player can see what angle I am at
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    var val = countCells(this.grid, this.grid.length, "-") - countCells(this.grid, this.grid.length, "V");
    this.energy = Math.min(this.energy + val, this.maxEnergy);
    if (this.energy <= 0) {
      toRemove.push(this);
      return;
    }
    if (time % 40 == 0) {
      this.grid = spreadVirusesWith(this.grid, this.grid.length, "V");
    }
    var energyCost = [500, 25, 250, 1000];
    if (this.changeActionCooldown == 0) {
      var possibilities = [0, 1, 2];
      var other = nearestRobot(this);
// TODO: Change nearest robot function to include a check if I can see them
//      if (other[0] !== e && other[1] < 1000) {
//        possibilities = [0, 2, 3];
//      }
      var actionType = possibilities[randint(0, possibilities.length - 1)];
      while (actionType == this.actionType) {
        actionType = possibilities[randint(0, possibilities.length - 1)];
      }
      this.actionType = actionType;
      this.changeActionCooldown = randint(50, 150);
      if (actionType == 1) {
        if (randint(0, 1) == 0) {
          this.actionDetails = "CW";
        }
        else {
          this.actionDetails = "CCW";
        }
      }
      else if (actionType == 2) {
        this.actionDetails = other[0];
        this.changeActionCooldown = 1;
      }
    }
    this.changeActionCooldown--;
    if (energyCost[actionType] >= this.energy) {
      return;
    }
    if (this.actionType == 0) {
      var val = this.angle * Math.PI / 180;
      var oldX = this.x;
      var oldY = this.y;
      this.x += this.speed * Math.cos(val);
      this.y += this.speed * Math.sin(val);
      for (var i = 0; i < entities.length; ++i) {
        if (entities[i] !== this && touches(this, entities[i])) {
          this.x = oldX;
          this.y = oldY;
          this.changeActionCooldown = 0;
          break;
        }
      }
    }
    else if (this.actionType == 1) {
      if (this.actionDetails == "CW") {
        this.angle += this.speed * 9 / 2;
      }
      else {
        this.angle -= this.speed * 9 / 2;
      }
    }
// TODO: Do virus scan, remove a random amount of viruses that is possible with current energy, and contain the rest
//    else if (this.actionType == 2) {
//    }
// TODO: Create bullet class and fire one at nearest enemy
//    else {
//    }
    this.energy -= energyCost[this.actionType];
    if (this.energy <= 0) {
      console.log("here");
      toRemove.push(this);
    }
  }
}

function Draw() {
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(-focusX, -focusY);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].drawEnergyBar();
  }
  ctx.restore();
}

function Tick() {
// TODO: Add checks for has won and has lost to not tick if there are no enemies or the player is dead
  time++;
  for (var i = 0; i < toRemove.length; ++i) {
    for (var j = 0; j < entities.length; ++j) {
      if (toRemove[i] === entities[j]) {
        entities.pop(j);
        break;
      }
    }
  }
  if (keySet["ArrowUp"]) {
    focusY -= 5;
  }
  if (keySet["ArrowRight"]) {
    focusX += 5;
  }
  if (keySet["ArrowDown"]) {
    focusY += 5;
  }
  if (keySet["ArrowLeft"]) {
    focusX -= 5;
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  Draw();
}

var blockX = 0;
var blockY = 0;
for (var i = 0; i < 4; ++i) {
  for (var j = 0; j < mapSize; ++j) {
    entities.push(new Block().setPosition(blockX, blockY));
    if (i == 0) {
      blockX += defaultBlockSize;
    }
    else if (i == 1) {
      blockY += defaultBlockSize;
    }
    else if (i == 2) {
      blockX -= defaultBlockSize;
    }
    else {
      blockY -= defaultBlockSize;
    }
  }
}

function generateCoordinate() {
  return Math.round(defaultBlockSize * 10 + defaultBlockSize * Math.random() * (mapSize - 20));
}

for (var i = 0; i < (mapSize * mapSize / 10); ++i) {
  var x = generateCoordinate();
  var y = generateCoordinate();
  var size = Math.round(defaultBlockSize / 2 + defaultBlockSize * Math.random());
  entities.push(new Block().setPosition(x, y).setSize(size).setColor("green"));
}

for (var i = 0; i < 65; ++i) {
  while (true) {
    var x = generateCoordinate();
    var y = generateCoordinate();
    var robot = new Robot().setPosition(x, y);
    var failed = false;
    for (var j = 0; j < entities.length; ++j) {
      if (touches(robot, entities[j])) {
        failed = true;
        break;
      }
    }
    if (failed) {
      continue;
    }
    entities.push(robot);
    break;
  }
}

setInterval(Tick, 25);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
