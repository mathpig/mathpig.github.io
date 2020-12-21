'use strict';

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var pig = document.getElementById('pig');
var x = 100, y = 100;
var vx = 0, vy = 0;

window.setInterval(Tick, 30);
window.onresize = Resize;
Resize();

function Resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function Tick() {
  x += vx;
  y += vy;
  vy += 0.2;
  if (x < 0) { vx = Math.abs(vx); x = 0; }
  if (y < 0) { vy = Math.abs(vy); y = 0; }
  if (x + pig.width > canvas.width) { vx = -Math.abs(vx) * 0.9; x = canvas.width - pig.width; }
  if (y + pig.height > canvas.height) { vy = -Math.abs(vy) * 0.9; y = canvas.height - pig.height; }
  ctx.fillStyle = '#030';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (vx < 0) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(pig, -x - pig.width, y);
    ctx.restore();
  } else {
    ctx.drawImage(pig, x, y);
  }
}

window.onkeydown = function(e) {
  if (e.keyCode == 37) {
    vx -= 0.4;
  } else if (e.keyCode == 39) {
    vx += 0.4;
  } else if (e.keyCode == 38) {
    vy -= 0.4;
  } else if (e.keyCode == 40) {
    vy += 0.4;
  }
};
