'use strict';

var ctx = map.getContext('2d');

var height = 450;
var width = 800;

var canvas = document.createElement('canvas');
canvas.display = 'none';
canvas.width = width;
canvas.height = height;
var ctx2 = canvas.getContext('2d');
var image = ctx2.createImageData(width, height);

var pixelSize = 1;

var countries = 360000;
var leaderboardSize = 100;

var count = 0;

var selection = 0;

var mouseX = -1;
var mouseY = 0;

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
  var num = randint(0, 7);
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
  else {
    names.push("Great " + val);
  }
}

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
  if (mouseX >= 0) {
    selection = m[mouseY][mouseX];
  }
  else {
    selection = 0;
  }
  if (selection) {
    var old = COLORS[selection];
    COLORS[selection] = [255, 255, 255];
  }
  var pos = 0;
  var data = image.data;
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      var col = COLORS[m[i][j]];
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

function selectColor(m, height, width, i, j, size) {
  do {
    var x = randint(i - size, i + size);
  } while (x < 0 || x >= height);
  do {
    var y = randint(j - size, j + size);
  } while (y < 0 || y >= width);
  if (m[x][y] == 0) {
    return m[i][j];
  }
  return m[x][y];
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
      copyMap[i][j] = selectColor(gameMap, height, width, i, j, 1);
    }
  }
  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      gameMap[i][j] = copyMap[i][j];
    }
  }
  count++;
  printMap(gameMap, height, width);
  printScores(gameMap, height, width, count, countries, names, leaderboardSize);
  if (!hasWon(gameMap, height, width)) {
    setTimeout(Tick, 1);
  }
}

setTimeout(Tick, 30);

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
    scoreboard.innerHTML += '<span style="background-color: rgb(' + col + ')">&nbsp;&nbsp;</span> ';
    var n = Math.round(score[i][0] * 100000 / height / width);
    scoreboard.innerHTML += (" [" + reformat(Math.floor(n / 1000), 2) + "." + reformat(n % 1000, 3) + "%. This country is also known as " + names[val] + ".]<br/>");
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
    if (s != 0) {
      result.push([scores[s], s]);
    }
  }
  result.sort(function(a, b) { return (a[0] - b[0]); });
  result.reverse();
  return result;
}

map.onmousemove = function(e) {
  mouseX = Math.max(0, Math.min(width - 1, Math.floor(e.clientX / pixelSize) - 1));
  mouseY = Math.max(0, Math.min(height - 1, Math.floor(e.clientY / pixelSize) - 1));
};

map.onmouseleave = function(e) {
  mouseX = -1;
};
