"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var image = ctx.createImageData(screen.width, screen.height);

var m = ["                ",
         "     ##         ",
         "    #      #    ",
         "              ##",
         "          ##    ",
         " ## #        #  ",
         "        #    ## ",
         "     #          ",
         "S       #  #    "];

var playerSize = 20;

var found = false;
for (var i = 0; i < m.length; ++i) {
  for (var j = 0; j < m[0].length; ++j) {
    if (m[i][j] == "S") {
      var x = (j + 0.5) * m[0].length / screen.width - playerSize / 2;
      var y = (i + 1) * m.length / screen.heigth - playerSize;
      found = true;
      break;
    }
  }
  if (found) {
    break;
  }
}

var vx = 0;
var vy = 0;

var keySet = {};

function Draw() {
  var data = image.data;
  var pos = 0;
  for (var i = 0; i < screen.width; ++i) {
    for (var j = 0; j < screen.height; ++j) {
      console.log(Math.floor(i * m[0].length / screen.width), Math.floor(j * m.length / screen.height));
      if (m[Math.floor(i * m[0].length / screen.width)][Math.floor(j * m.length / screen.height)] == " ") {
        var r = 255;
        var g = 0;
        var b = 0;
      }
      else {
        var r = 0;
        var g = 255;
        var b = 0;
      }
      data[pos++] = r;
      data[pos++] = g;
      data[pos++] = b;
      data[pos++] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  ctx.fillStyle = "blue";
  ctx.fillRect(x, y, playerSize, playerSize);
}

function Tick() {
  vx *= (99 / 100);
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

  if (keySet["ArrowUp"] && y == (screen.height - playerSize)) {
    vy -= 5;
  }

  vx = Math.min(Math.max(vx, -5), 5);
  vy = Math.min(Math.max(vy, -5), 5);

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

  Draw();
}

setInterval(Tick, 50);

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
