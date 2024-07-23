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

var map = [];

for (var i = 0; i <= 40; ++i) {
  map.push([]);
  for (var j = 0; j <= 40; ++j) {
    if ((i % 2) == 0 || (j % 2) == 0) {
      map[i].push("#");
    }
    else {
      map[i].push(" ");
    }
  }
}

function printMap() {
  var s = "";
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[0].length; ++j) {
      s += (map[i][j] + map[i][j]);
    }
    s += "\n";
  }
  console.log(s);
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
  printMap();
  if (val[0] != -1 && val[1] != -1) {
    map[Math.round((val[0] + val[2]) / 2)][Math.round((val[1] + val[3]) / 2)] = "-";
  }
  map[y][x] = "-";
  var newStuff = [[y, x, y - 2, x], [y, x, y, x + 2], [y, x, y + 2, x], [y, x, y, x - 2]];
  if ((Math.abs(lastVector[0]) == 2 && lastVector[1] == 0) ||
      (lastVector[0] == 0 && Math.abs(lastVector[1]) == 2)) {
    for (var i = 0; i < 2; ++i) {
      newStuff.push([y, x, y + lastVector[0], x + lastVector[1]]);
    }
  }
  for (var i = 0; i < newStuff.length; ++i) {
    toDo.push(newStuff[i]);
  }
}

printMap();
