'use strict';

zoom = 40;
var speed = 0.1;
var targetX = offsetX;
var targetY = offsetY;

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
}

window.onkeydown = function(e) {
  if (e.key == "ArrowLeft") {
    targetX -= speed;
  }
  else if (e.key == "ArrowRight") {
    targetX += speed;
  }
  else if (e.key == "ArrowDown") {
    targetY += speed;
  }
  else if (e.key == "w" || e.key == "ArrowUp") {
    targetY -= speed;
  }
};

setInterval(Tick, 20);
