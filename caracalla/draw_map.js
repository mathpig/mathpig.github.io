'use strict';

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var offsetX = Math.floor(WIDTH / 2);
var offsetY = Math.floor(HEIGHT / 2);
var zoom = 16;
var level = 0;
var showMap = true;

function DrawMap() {
  var s = GetSize();
  var w = s[0] + 1;
  var h = s[1] + 1;
  for (var j = 0; j < h; ++j) {
    var jj = j + offsetY;
    if (jj < 0 || jj >= HEIGHT) {
      continue;
    }
    for (var i = 0; i < w; ++i) {
      var ii = i + offsetX;
      if (ii < 0 || ii >= WIDTH) {
        continue;
      }
      tiles[map[ii + jj * WIDTH + level * WIDTH * HEIGHT]].draw(i * zoom, j * zoom, zoom, zoom);
    }
  }
}

function DrawMapOver() {
  var s = GetSize();
  var w = s[0] + 1;
  var h = s[1] + 1;
  for (var j = 0; j < h; ++j) {
    var jj = j + offsetY;
    if (jj < 0 || jj >= HEIGHT) {
      continue;
    }
    for (var i = 0; i < w; ++i) {
      var ii = i + offsetX;
      if (ii < 0 || ii >= WIDTH) {
        continue;
      }
      tiles[map[ii + jj * WIDTH + level * WIDTH * HEIGHT]].drawOver(i * zoom, j * zoom, zoom, zoom);
    }
  }
}

function DrawPlan() {
  if (!showMap) {
    return;
  }
  ctx.save();
  ctx.globalAlpha = 0.2;
  var scale = WIDTH * zoom / plan.width;
  ctx.drawImage(plan, -offsetX * zoom, -offsetY * zoom,
                plan.width * scale, plan.height * scale);
  ctx.restore();
}

function GetSize() {
  var w = Math.ceil(screen.width / zoom);
  var h = Math.ceil(screen.height / zoom);
  return [w, h];
}

function GetCenter() {
  var s = GetSize();
  var cx = Math.floor(s[0] / 2);
  var cy = Math.floor(s[1] / 2);
  return [cx, cy];
}

function toPosition(e) {
  var x = Math.floor(e.clientX / zoom) + offsetX;
  var y = Math.floor(e.clientY / zoom) + offsetY;
  return [x, y];
}
