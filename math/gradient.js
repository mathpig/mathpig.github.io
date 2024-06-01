"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var center = [0, 0];
var resolution = 1;

function f(a, b) {
  a /= 40;
  b /= 40;
  return 128 + a * a - b * b;
}

var colors = [[0, 0, 0],
              [255, 0, 0],
              [255, 255, 0],
              [0, 255, 0],
              [0, 255, 255],
              [0, 0, 255],
              [255, 0, 255],
              [255, 255, 255]];

function rgbIze(num) {
  return String(Math.max(0, Math.min(255, Math.round(num))));
}

function findColor(val) {
  var colorType = Math.floor(val * (colors.length - 1) / 256);
  if (colorType < 0) {
    return "rgb(0,0,0)";
  }
  if (colorType >= (colors.length - 1)) {
    return "rgb(255,255,255)";
  }
  var color = "rgb(";
  var rangeSize = (256 / (colors.length - 1));
  var proportion = ((val % rangeSize) / rangeSize);
  for (var i = 0; i < 3; ++i) {
    if (i > 0) {
      color += ",";
    }
    color += rgbIze(colors[colorType][i] * (1 - proportion) + colors[colorType + 1][i] * proportion);
  }
  color += ")";
  return color;
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(screen.width / 2 - center[0], screen.height / 2 - center[1]);
  for (var i = -screen.width / 2 - 10; i <= screen.width / 2 + 10; i += resolution) {
    for (var j = -screen.height / 2 - 10; j <= screen.height / 2 + 10; j += resolution) {
      ctx.fillStyle = findColor(f(i, j));
      ctx.fillRect(i - resolution / 2, j - resolution / 2, resolution, resolution);
    }
  }
  ctx.restore();
}

Draw();
