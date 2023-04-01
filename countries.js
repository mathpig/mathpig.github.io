'use strict';

var ctx = map.getContext('2d');

var height = 120;
var width = 160;

var pixelSize = 6;

var countries = 7;

function clearScreen() {
  map.width = pixelSize * (width + 2);
  map.height = pixelSize * (height + 2);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, pixelSize * (width + 2), pixelSize * (height + 2));
}

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

const COLORS = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white"
];

var gameMap = [];
var copyMap = [];

for (var i = 0; i < height; ++i) {
  gameMap.push([]);
  copyMap.push([]);
  for (var j = 0; j < width; ++j) {
    gameMap[i].push(0);
    copyMap[i].push(0);
  }
}

for (var i = 0; i < countries; ++i) {
  var x = randint(0, height - 1);
  var y = randint(0, width - 1);
  while (gameMap[x][y] != 0) {
    x = randint(0, height - 1);
    y = randint(0, width - 1);
  }
  gameMap[x][y] = (i + 1);
}

function printMap(m, height, width, count, countries, names, leaderboardSize) {
  for (var i = 1; i <= height; ++i) {
    for (var j = 1; j <= width; ++j) {
      ctx.fillStyle = COLORS[m[i - 1][j - 1]];
      ctx.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
    }
  }
}

function selectColor(m, height, width, i, j, size) {
  var possibilities = [];
  for (var x = (i - size); x <= (i + size); ++x) {
    if (x <= 0 || x >= height) {
      continue;
    }
    for (var y = (j - size); y <= (j + size); ++y) {
      if (y <= 0 || y >= width) {
        continue;
      }
      possibilities.push(m[x][y]);
    }
  }
  var val = possibilities[randint(0, possibilities.length - 1)]
  if (val == 0 && m[i][j] != 0) {
    return m[i][j];
  }
  return val;
}

function hasWon(m, height, width) {
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      if (m[i][j] != m[0][0]) {
        return false;
      }
    }
  }
  return true;
}

clearScreen();

function Tick() {
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      copyMap[i][j] = selectColor(gameMap, height, width, i, j, randint(1, 2));
    }
  }
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      gameMap[i][j] = copyMap[i][j];
    }
  }
  printMap(gameMap, height, width);
  if (!hasWon(gameMap, height, width)) {
    setTimeout(Tick, 30);
  }
}

setTimeout(Tick, 30);
