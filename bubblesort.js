"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var arr = [];
var d = {};

var barSize = 1;

var start = 0;
var hasDone = false;

for (var i = 0; i < Math.floor(screen.width / barSize); ++i) {
  do {
    var val = Math.floor(Math.random() * screen.width / barSize) + 1;
  } while (val in d);
  arr.push(val);
  d[val] = true;
}

function Draw(highlightIndex) {
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < screen.width; ++i) {
    ctx.fillStyle = "green";
    if (i == highlightIndex || i == (highlightIndex + 1)) {
      ctx.fillStyle = "yellow";
    }
    ctx.fillRect(i * barSize, screen.height - barSize * arr[i], barSize, barSize * arr[i]);
  }
}

function Tick() {
  if (!hasDone) {
    hasDone = true;
    Draw(-2);
    return;
  }
  hasDone = false;
  for (var i = start; i < (arr.length - 1); ++i) {
    if (arr[i] > arr[i + 1]) {
      var tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      Draw(i);
      start = (i + 1);
      return;
    }
  }
  start = 0;
}

function Init() {
  Draw(-2);
}

Init();
setInterval(Tick, 0);
