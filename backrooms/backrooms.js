"use strict";

function shuffle(arr) {
  for (var i = (arr.length - 1); i >= 0; --i) {
    var index = Math.floor(Math.random() * (i + 1));
    var val = arr[i];
    arr[i] = arr[index];
    arr[index] = val;
  }
  return arr;
}

function printMap(m) {
  var s = "";
  for (var i = 0; i < m.length; ++i) {
    for (var j = 0; j < m[i].length; ++j) {
      s += (m[i][j] + m[i][j]);
    }
    s += "\n";
  }
  console.log(s);
}

function generateMap(width, height, hallwayBonus) {
  var map = [];
  for (var i = 0; i <= (2 * height); ++i) {
    map.push([]);
    for (var j = 0; j <= (2 * width); ++j) {
      if ((i % 2) == 0 || (j % 2) == 0) {
        map[i].push("#");
      }
      else {
        map[i].push(" ");
      }
    }
  }
  var toDo = [[-1, -1, 1, 1]];
  var lastVector = [0, 0];
  while (toDo.length > 0) {
    toDo = shuffle(toDo);
    var val = toDo.pop();
    var oldY = y;
    var oldX = x;
    var y = val[2];
    var x = val[3];
    lastVector = [y - oldY, x - oldX];
    if (y < 0 || x < 0 || y >= map.length || x >= map[0].length || map[y][x] == "-") {
      continue;
    }
    if (val[0] != -1 && val[1] != -1) {
      map[Math.round((val[0] + val[2]) / 2)][Math.round((val[1] + val[3]) / 2)] = "-";
    }
    map[y][x] = "-";
    var newStuff = [[y, x, y - 2, x], [y, x, y, x + 2], [y, x, y + 2, x], [y, x, y, x - 2]];
    if ((Math.abs(lastVector[0]) == 2 && lastVector[1] == 0) ||
        (lastVector[0] == 0 && Math.abs(lastVector[1]) == 2)) {
      for (var i = 0; i < hallwayBonus; ++i) {
        newStuff.push([y, x, y + lastVector[0], x + lastVector[1]]);
      }
    }
    for (var i = 0; i < newStuff.length; ++i) {
      toDo.push(newStuff[i]);
    }
  }
  return map;
}

const blockSize = 20;

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var count = 0;
var realMap;
var map;

var money = 0;

function convertMoney(money) {
  return [Math.floor(money / 128), Math.floor((money % 128) / 8), (money % 8)];
}

function Init() {
  count = 0;
  realMap = generateMap(15, 10, 0);
  map = [];
  for (var i = 0; i < realMap.length; ++i) {
    map.push([]);
    for (var j = 0; j < realMap[0].length; ++j) {
      map[i].push("?");
    }
  }
  player.setPosition(1, 1);
}

function reveal(i, j) {
  if (i < 0 || j < 0 || i >= map.length || j >= map[0].length || map[i][j] == realMap[i][j]) {
    return;
  }
  map[i][j] = realMap[i][j];
  count++;
  money++;
}

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.color = "blue";
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * blockSize, this.y * blockSize, blockSize, blockSize);
  }

  move(xVal, yVal) {
    if (map[this.y + yVal][this.x + xVal] == "-") {
      this.x += xVal;
      this.y += yVal;
    }
  }

  tick() {
    for (var i = -1; i <= 1; ++i) {
      for (var j = -1; j <= 1; ++j) {
        reveal(this.y + i, this.x + j);
      }
    }
    if (getKey("ArrowLeft")) {
      this.move(-1, 0);
    }
    if (getKey("ArrowUp")) {
      this.move(0, -1);
    }
    if (getKey("ArrowRight")) {
      this.move(1, 0);
    }
    if (getKey("ArrowDown")) {
      this.move(0, 1);
    }
  }
}

class Level {
  constructor() {
    this.width = 10;
    this.height = 15;
    this.hallwayBonus = 0;
    this.floorColor = "rgb(192, 128, 64)";
    this.wallColor = "rgb(255, 255, 128)";
    this.unknownColor = "rgb(64, 64, 64)";
    this.style = "maze";
    this.noclips = [];
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  setHallwayBonus(hallwayBonus) {
    this.hallwayBonus = hallwayBonus;
    return this;
  }

  setColor(floorColor, wallColor, unknownColor) {
    this.floorColor = floorColor;
    this.wallColor = wallColor;
    this.unknownColor = unknownColor;
    return this;
  }

  setStyle(style) {
    this.style = style;
    return this;
  }

  setNoclips(noclips) {
    this.noclips = noclips;
    return this;
  }

  generateLevel() {
    if (this.style == "maze") {
      return generateMap(this.width, this.height, this.hallwayBonus);
    }
  }
}

var player = new Player().setPosition(1, 1);
var keySet = {};

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[0].length; ++j) {
      if (map[i][j] == "#") {
        ctx.fillStyle = "rgb(255, 255, 128)";
      }
      else if (map[i][j] == "-") {
        ctx.fillStyle = "rgb(192, 128, 64)";
      }
      else {
        ctx.fillStyle = "rgb(64, 64, 64)";
      }
      ctx.fillRect(blockSize * j, blockSize * i, blockSize, blockSize);
    }
  }
  player.draw();
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  var val = convertMoney(money);
  ctx.fillText("Almond Water: " + String(val[0]) + " gallons, " + String(val[1]) + " cups, and " + String(val[2]) + " fluid ounces.", 20, 500);
}

function Tick() {
  if (count == (map.length * map[0].length)) {
    Init();
  }
  player.tick();
  Draw();
}

Init();
setInterval(Tick, 25);

function getKey(key) {
  var t = keySet[key];
  keySet[key] = false;
  return t;
}

window.onkeydown = function(e) {
  if (!e.repeat) {
    keySet[e.key] = true;
  }
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
