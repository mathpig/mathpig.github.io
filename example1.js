"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var m = ["                                ",
         "     ##              ###    #   ",
         "    #      #     #         #    ",
         "              ##         #      ",
         "          ##                    ",
         " ## #        #         #       #",
         "        #    ##    ###          ",
         "     #            #          ## ",
         "S       #  #         #    #     "];

var pixelSize = Math.floor(Math.min(window.innerWidth / m[0].length, window.innerHeight / m.length) * 9 / 10);

screen.width = pixelSize * m[0].length;
screen.height = pixelSize * m.length;

var playerSize = pixelSize / 2;

outer: for (var i = 0; i < m.length; ++i) {
  for (var j = 0; j < m[0].length; ++j) {
    if (m[i][j] == "S") {
      var x = (j + 0.5) * screen.width / m[0].length - playerSize / 2;
      var y = (i + 1) * screen.height / m.length - playerSize;
      break outer;
    }
  }
}

var vx = 0;
var vy = 0;

var keySet = {};

var canJump = false;

function Draw() {
  for (var i = 0; i < m.length; ++i) {
    for (var j = 0; j < m[0].length; ++j) {
      if (m[i][j] == " " || m[i][j] == "S") {
        ctx.fillStyle = "red";
      }
      else {
        ctx.fillStyle = "green";
      }
      ctx.fillRect(pixelSize * j, pixelSize * i, pixelSize, pixelSize);
    }
  }
  ctx.fillStyle = "blue";
  ctx.fillRect(x, y, playerSize, playerSize);
}

function findCoords(x, y) {
  return [Math.floor(x / pixelSize), Math.floor(y / pixelSize)];
}

function deflect(oldX, oldY) {
  var arr = [];
  var [xx, yy] = findCoords(x, y);
  arr.push(m[yy][xx] == "#");
  [xx, yy] = findCoords(x + playerSize - 1, y);
  arr.push(m[yy][xx] == "#");
  [xx, yy] = findCoords(x + playerSize - 1, y + playerSize - 1);
  arr.push(m[yy][xx] == "#");
  [xx, yy] = findCoords(x, y + playerSize - 1);
  arr.push(m[yy][xx] == "#");
  if (!arr[0] && !arr[1] && !arr[2] && !arr[3]) {
    return [false, false];
  }
  if ((arr[0] && arr[1] && arr[2]) || (arr[1] && arr[2] && arr[3]) || (arr[2] && arr[3] && arr[0]) || (arr[3] && arr[0] && arr[1])) {
    return [true, true];
  }
  if ((arr[0] && arr[1]) || (arr[2] && arr[3])) {
    return [false, true];
  }
  if ((arr[1] && arr[2]) || (arr[3] && arr[0])) {
    return [true, false];
  }
  var [oldXX, oldYY] = findCoords(oldX, oldY);
  if (arr[0]) {
    [xx, yy] = findCoords(x, y);
    return [xx < oldXX, yy < oldYY];
  }
  if (arr[1]) {
    [xx, yy] = findCoords(x + playerSize - 1, y);
    return [xx > oldXX, yy < oldYY];
  }
  if (arr[2]) {
    [xx, yy] = findCoords(x + playerSize - 1, y + playerSize - 1);
    return [xx > oldXX, yy > oldYY];
  }
  [xx, yy] = findCoords(x, y + playerSize - 1);
  return [xx < oldXX, yy > oldYY];
}

function Tick() {
  canJump = (y == (screen.height - playerSize));
  if (y + playerSize)
  if (!canJump) {
    var [xx, yy] = findCoords(x, y + playerSize);
    if (m[yy][xx] == "#") {
      canJump = true;
    }
    [xx, yy] = findCoords(x + playerSize, y + playerSize);
    if (m[yy][xx] == "#") {
      canJump = true;
    }
  }

  vx *= (19 / 20);
  vy += 0.25;

  if (Math.abs(vx) < 0.05) {
    vx = 0;
  }
  if (Math.abs(vy) < 0.05) {
    vy = 0;
  }

  if (keySet["ArrowRight"]) {
    vx += 0.25;
  }
  if (keySet["ArrowLeft"]) {
    vx -= 0.25;
  }

  if (keySet["ArrowUp"] && canJump) {
    vy -= pixelSize / 9;
  }

  vx = Math.min(Math.max(vx, -pixelSize / 9), pixelSize / 9);

  var oldX = x;
  var oldY = y;

  x += vx;
  if (x < 0) {
    x = 0;
    vx = -vx / 2;
  }
  else if (x > (screen.width - playerSize)) {
    x = (screen.width - playerSize);
    vx = -vx / 2;
  }

  y += vy;
  if (y < 0) {
    y = 0;
    vy = -vy / 2;
  }
  else if (y > (screen.height - playerSize)) {
    y = (screen.height - playerSize);
    vy = -vy / 2;
  }

  var val = deflect(oldX, oldY);
  if (val[0]) {
    x = oldX;
    vx = -vx / 2;
  }
  if (val[1]) {
    y = oldY;
    vy = -vy / 2;
  }

  Draw();
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
