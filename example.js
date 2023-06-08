"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");
var image = ctx.createImageData(screen.width, screen.height);

function Draw() {
  var data = image.data;
  var pos = 0;
  for (var i = 0; i < screen.width; ++i) {
    for (var j = 0; j < screen.height; ++j) {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      data[pos++] = r;
      data[pos++] = g;
      data[pos++] = b;
      data[pos++] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function Tick() {
  Draw();
}

setInterval(Tick, 0);
