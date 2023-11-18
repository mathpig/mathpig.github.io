'use strict';

zoom = 100;
var speed = 0.1;
var targetX = offsetX;
var targetY = offsetY;

var pigs = [pig0, pig1, pig2, pig3];
var frame = 0;

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
  var oldX = targetX;
  var oldY = targetY;
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
  if (targetX == oldX && targetY == oldY) {
    frame = 0;
    ctx.drawImage(pig4, screen.width / 2 - 40, screen.height / 2 - 20, 80, 40);
  }
  else {
    frame++;
    ctx.drawImage(pigs[Math.floor(frame / 5) % pigs.length], screen.width / 2 - 40, screen.height / 2 - 20, 80, 40);
  }
}

window.onkeydown = function(e) {
  keySet[e.key] = true;
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};

setInterval(Tick, 20);
