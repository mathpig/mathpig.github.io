"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var s = "";
var index = 0;

function Draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "lime";
  ctx.font = "20px monospace";
  ctx.fillText(s, screen.width / 2, screen.height / 2 + 10);
  ctx.fillStyle = "yellow";
  ctx.fillRect(screen.width / 2 + (index - s.length / 2) * 11, screen.height / 2 - 15, 2, 30);
}

setInterval(Draw, 20);

window.onkeydown = function(e) {
  if (e.key.length == 1) {
    s = s.slice(0, index) + e.key + s.slice(index, s.length);
    index++;
  }
  if (e.key == "Backspace" && index > 0) {
    s = s.slice(0, index - 1) + s.slice(index, s.length);
    index--;
  }
  if (e.key == "ArrowLeft" && index > 0) {
    index--;
  }
  if (e.key == "ArrowRight" && index < s.length) {
    index++;
  }
};
