'use strict';

zoom = 40;
var speed = 0.2;
var targetX = offsetX;
var targetY = offsetY;

var keySet = {};

function Draw() {
  ctx.save();
  offsetX = Math.floor(targetX);
  offsetY = Math.floor(targetY);
  ctx.translate((offsetX - targetX) * zoom, (offsetY - targetY) * zoom);
  DrawMap();
  DrawPlan();
  ctx.restore();
}

function Tick() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Draw();
  if (keySet["ArrowLeft"]) {
    targetX -= speed;
  }
  if (keySet["ArrowRight"]) {
    targetX += speed;
  }
  if (keySet["ArrowUp"]) {
    targetY -= speed;
  }
  if (keySet["ArrowDown"]) {
    targetY += speed;
  }
}

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};

setInterval(Tick, 20);
