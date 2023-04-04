'use strict';

var ctx = map.getContext('2d');

var height = 675;
var width = 1200;

var canvas = document.createElement('canvas');
canvas.display = 'none';
canvas.width = width;
canvas.height = height;
var ctx2 = canvas.getContext('2d');
var image = ctx2.createImageData(width, height);

var pixelSize = 1;

var countries = 512;
var leaderboardSize = 25;

var count = 0;

var scoreSelection = 0;
var selection = 0;

var mouseX = -1;
var mouseY = 0;

var gameMap = [];
var copyMap = [];
var land = 0;

function clearScreen() {
  map.width = pixelSize * (width + 2);
  map.height = pixelSize * (height + 2);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, pixelSize * (width + 2), pixelSize * (height + 2));
}

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

const COLORS = [[0, 0, 0]];

for (var i = 0; i < countries; ++i) {
  COLORS.push([randint(0, 255), randint(0, 255), randint(0, 255)]);
}

const WORDS = ["Guy", "Slavan", "Scuttles", "Regindol", "Mosquito", "Sylvia", "Hades", "Hoppers",
               "Rubs", "Salmon", "Tobacco", "Iesus", "Funshin", "Gunshin", "Gin", "Mocha",
               "Larion", "Dormech", "Biafra", "Wogodogo", "Etrynal", "Gabsore", "Wurstshire", "Sath",
               "Plums", "Apples", "Oranges", "Bananas", "Grapes", "Fish", "Steak", "Milk"];

var names = [""];

for (var i = 0; i < countries; ++i) {
  var val = WORDS[randint(0, WORDS.length - 1)];
  var num = randint(0, 15);
  if (num == 0) {
    names.push(val);
  }
  else if (num == 1) {
    names.push(val + " Kingdom");
  }
  else if (num == 2) {
    names.push("The Kingdom of " + val);
  }
  else if (num == 3) {
    names.push("The Republic of " + val);
  }
  else if (num == 4) {
    names.push("The Sultanate of " + val);
  }
  else if (num == 5) {
    names.push("The Realm of " + val);
  }
  else if (num == 6) {
    names.push("The Glory of " + val);
  }
  else if (num == 7) {
    names.push("Great " + val);
  }
  else if (num == 8) {
    names.push("The Empire of " + val);
  }
  else if (num == 9) {
    names.push("The Exarchate of " + val);
  }
  else if (num == 10) {
    names.push("The Mastery of " + val);
  }
  else if (num == 11) {
    names.push("The Land of " + val);
  }
  else if (num == 12) {
    names.push("The Supremity of " + val);
  }
  else if (num == 13) {
    names.push(val + " Empire");
  }
  else if (num == 14) {
    names.push("The Dukedom of " + val);
  }
  else {
    names.push("The Sorcery of " + val);
  }
}

function Init() {
  var worldMapCanvas = document.createElement("canvas");
  var worldMapContext = worldMapCanvas.getContext("2d");
  worldMapCanvas.width = earth.width;
  worldMapCanvas.height = earth.height;
  worldMapContext.drawImage(earth, 0, 0);
  var worldData = worldMapContext.getImageData(0, 0, earth.width, earth.height).data;

  for (var i = 0; i < height; ++i) {
    var ii = Math.floor(i * (worldMapCanvas.height - 1) / (height - 1));
    gameMap.push([]);
    copyMap.push([]);
    for (var j = 0; j < width; ++j) {
      var jj = Math.floor(j * (worldMapCanvas.width - 1) / (width - 1));
      var on = worldData[4 * (ii * worldMapCanvas.width + jj)] ? 0 : -1;
      if (!on) {
        land++;
      }
      gameMap[i].push(on);
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

  clearScreen();
  setTimeout(Tick, 30);
}

if (earth.complete) {
  Init();
}
else {
  earth.onload = Init;
}

function printMap(m, height, width, countries, names, leaderboardSize) {
  if (mouseX >= 0) {
    selection = m[mouseY][mouseX];
    scoreSelection = 0;
  }
  else if (scoreSelection >= 0) {
    selection = scoreSelection;
  }
  else {
    selection = 0;
    scoreSelection = 0;
  }
  if (selection) {
    var old = COLORS[selection];
    COLORS[selection] = [255, 255, 255];
  }
  var pos = 0;
  var data = image.data;
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      if (m[i][j] == -1) {
        var col = [0, 0, 255];
      }
      else {
        var col = COLORS[m[i][j]];
      }
      data[pos++] = col[0];
      data[pos++] = col[1];
      data[pos++] = col[2];
      data[pos++] = 255;
    }
  }
  if (selection) {
    COLORS[selection] = old;
  }
  ctx2.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = 'blue';
  ctx.fillRect(pixelSize, pixelSize, width * pixelSize, height * pixelSize);
  ctx.drawImage(canvas, 0, 0, width, height,
                pixelSize, pixelSize, width * pixelSize, height * pixelSize);
}

function selectColor(m, height, width, i, j) {
  if (m[i][j] == -1) {
    return -1;
  }
  if (i > 0 && i < (height - 1) &&
      j > 0 && j < (width - 1) &&
      m[i][j] == m[i - 1][j] &&
      m[i][j] == m[i + 1][j] &&
      m[i][j] == m[i][j - 1] &&
      m[i][j] == m[i][j + 1]) {
    return m[i][j];
  }
  do {
    var x = randint(i - 5, i + 5);
  }
  while (x < 0 || x >= height);
  do {
    var y = randint(j - 5, j + 5);
  }
  while (y < 0 || y >= width);
  if (m[x][y] == -1 && randint(0, 4) == 0) {
    var size = Math.min(150, Math.floor(count / 6) + 5);
    var x = randint(i - size, i + size);
    var y = randint(j - size, j + size);
    if (x < 0 || x >= height || y < 0 || y >= width || m[x][y] <= 0) {
      return m[i][j];
    }
  }
  else if (m[x][y] <= 0) {
    return m[i][j];
  }
  return m[x][y];
}

function hasWon(m, height, width) {
  var firstPixel = -1;
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      if (m[i][j] == -1) {
        continue;
      }
      if (firstPixel != -1 && firstPixel != m[i][j]) {
        return false;
      }
      firstPixel = m[i][j];
    }
  }
  return true;
}

function deleteCountry(m, height, width, country, probability) {
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      if (m[i][j] == country && randint(0, 999) < probability) {
        m[i][j] = 0;
      }
    }
  }
  return m;
}

function Tick() {
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      copyMap[i][j] = selectColor(gameMap, height, width, i, j);
    }
  }
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      gameMap[i][j] = copyMap[i][j];
    }
  }
  if (randint(0, 49) == 0) {
    gameMap = deleteCountry(gameMap, height, width, randint(1, countries), 995);
  }
  count++;
  printMap(gameMap, height, width);
  printScores(gameMap, height, width, count, countries, names, leaderboardSize);
  if (!hasWon(gameMap, height, width)) {
    setTimeout(Tick, 1);
  }
}

function reformat(num, characters) {
  num = num.toString();
  while (num.length < characters) {
    num = ("0" + num);
  }
  return num;
}

function printScores(m, height, width, count, countries, names, leaderboardSize) {
  var score = scores(m, height, width);
  scoreboard.innerHTML = ("<br/>Days past: " + count + " (about " + Math.floor(count / 365.25) + " year(s))<br/>Countries left: " + score.length + "<br/><br/>");
  for (var i = 0; i < score.slice(0, leaderboardSize).length; ++i) {
    scoreboard.innerHTML += ((i + 1) + ": ")
    if (i < 9) {
      scoreboard.innerHTML += "&nbsp;";
    }
    var val = score[i][1];
    var col = val == selection ? [255, 255, 255] : COLORS[val];
    scoreboard.innerHTML += '<span onmouseenter="PlayerEnter(event)" ' +
                            'onmousemove="PlayerMove(event)" ' +
                            'onmousedown="PlayerDown(event)" ' +
                            'data-player="' + val + '" style="cursor: pointer; background-color: rgb(' + col + ')">&nbsp;&nbsp;</span> ';
    var n = Math.round(score[i][0] * 100000 / land);
    scoreboard.innerHTML += (" [" + reformat(Math.floor(n / 1000), 2) + "." + reformat(n % 1000, 3) + "%. This country is also known as " + names[val] + ".]<br/>");
  }
}

function PlayerEnter(e) {
  scoreSelection = e.target.dataset.player;
}

function PlayerMove(e) {
  e.stopPropagation();
}

function PlayerDown(e) {
  if (selection > 0) {
    deleteCountry(gameMap, height, width, selection, 990);
  }
}

function scores(m, height, width) {
  var scores = {};
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      var val = m[i][j];
      if (scores[val] === undefined) {
        scores[val] = 0;
      }
      scores[val]++;
    }
  }
  var result = [];
  for (var s in scores) {
    if (s > 0) {
      result.push([scores[s], s]);
    }
  }
  result.sort(function(a, b) { return (a[0] - b[0]); });
  result.reverse();
  return result;
}

map.onmousemove = function(e) {
  var rect = e.target.getBoundingClientRect();
  mouseX = Math.max(0, Math.min(width - 1, Math.floor((e.clientX - rect.left) / pixelSize) - 1));
  mouseY = Math.max(0, Math.min(height - 1, Math.floor((e.clientY - rect.top) / pixelSize) - 1));
};

map.onmouseleave = function(e) {
  mouseX = -1;
};

map.onmousedown = function(e) {
  PlayerDown();
};

document.onmousemove = function(e) {
  scoreSelection = 0;
};
