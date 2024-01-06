"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const defaultBlockSize = 6; // 120
const mapSize = 60;

var entities = [];

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

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = defaultBlockSize;
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

  setColor(color) {
    this.color = color;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
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

for (var i = 0; i < (mapSize * mapSize / 10); ++i) {
  var x = defaultBlockSize * 10 + defaultBlockSize * Math.random() * (mapSize - 20);
  var y = defaultBlockSize * 10 + defaultBlockSize * Math.random() * (mapSize - 20);
  var size = defaultBlockSize / 2 + defaultBlockSize * Math.random();
  entities.push(new Block().setPosition(x, y).setSize(size).setColor("green"));
}

setInterval(Tick, 25);
