"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var image = ctx.createImageData(screen.width, screen.height);

var arr = [];

function Draw() {
  var data = image.data;
  var pos = 0;
  for (var i = 0; i < screen.width; ++i) {
    for (var j = 0; j < screen.height; ++j) {
      if (arr[i] >= (screen.height - j)) {
        var r = 0;
        var g = 255;
      }
      else {
        var r = 255;
        var g = 0;
      }
      var b = 0;
      data[pos++] = r;
      data[pos++] = g;
      data[pos++] = b;
      data[pos++] = 255;
    }
  }
}

function Tick() {
  for (var i = 0; i < (arr.length - 1); ++i) {
    if (arr[i] > arr[i + 1]) {
      var tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      await new Promise(r => setTimeout(r, 50));
      Draw();
    }
  }
}

function Init() {
  Draw();
}

Init();
setInterval(Tick, 0);
