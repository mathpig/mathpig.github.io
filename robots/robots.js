"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const defaultBlockSize = 6; // 120
const defaultRobotSize = 2;
const mapSize = 60;

var entities = [];
var time = 0;

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

class Robot {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = defaultRobotSize;
    this.color = "gray";
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
    ctx.fillRect(this.x - this.size / 2, this.y - this.size * 4 / 5, this.size, this.size / 5);
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    if (this.changeActionCooldown == 0) {
      this.changeActionCooldown = randint(50, 150);
      var val = randint(0, 1);
      var other = nearestRobot(this);
      if (other[0] !== e && other[1] < 1000) {
        val = randint(0, 2);
      }
      if (val == 0) {
        this.actionType = "move";
        var moves = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        this.actionDetails = moves[randint(0, moves.length - 1)];
      }
      else if (val == 1) {
        this.actionType = "turn";
        var turns = ["CW", "CCW"];
        this.actionDetails = turns[randint(0, turns.length - 1)];
      }
      else {
        this.actionType = "shoot";
        this.actionDetails = other[0];
        this.changeActionCooldown = 1;
      }
    }
    this.changeActionCooldown--;
  }
}

function Draw() {
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].drawEnergyBar();
  }
}

function Tick() {
  time++;
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
  return defaultBlockSize * 10 + defaultBlockSize * Math.random() * (mapSize - 20);
}

for (var i = 0; i < (mapSize * mapSize / 10); ++i) {
  var x = generateCoordinate();
  var y = generateCoordinate();
  var size = defaultBlockSize / 2 + defaultBlockSize * Math.random();
  entities.push(new Block().setPosition(x, y).setSize(size).setColor("green"));
}

for (var i = 0; i < 19; ++i) {
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
