"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var count = -100;

function Tick() {
  count++;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.fillStyle = "red";
  for (var i = 0; i < screen.width; ++i) {
    ctx.fillRect(i, 0, 1, count * 2 + 100 * perlin(i / 100, count / 100));
  }
}

setInterval(Tick, 20);
