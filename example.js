"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var image = ctx.createImageData(screen.width, screen.height);

var x = screen.width / 2 - 20;
var vx = 0;

var y = screen.height - 40;
var vy = 0;

var keySet = {};

function Draw() {
  var data = image.data;
  var pos = 0;
  for (var i = 0; i < screen.width; ++i) {
    for (var j = 0; j < screen.height; ++j) {
      var r = 255;
      var g = 0;
      var b = 0;
      data[pos++] = r;
      data[pos++] = g;
      data[pos++] = b;
      data[pos++] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  ctx.fillStyle = 'black';
  ctx.fillRect(x, y, 40, 40);
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

  if (keySet["ArrowUp"] && y == (screen.height - 40)) {
    vy -= 5;
  }

  vx = Math.min(Math.max(vx, -5), 5);
  vy = Math.min(Math.max(vy, -5), 5);

  x += vx;
  if (x < 0) {
    x = 0;
    vx = -vx / 2;
  }
  else if (x > (screen.width - 40)) {
    x = (screen.width - 40);
    vx = -vx / 2;
  }

  y += vy;
  if (y < 0) {
    y = 0;
    vy = -vy / 2;
  }
  else if (y > (screen.height - 40)) {
    y = (screen.height - 40);
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
