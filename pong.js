'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');

var x = window.innerWidth / 2;
var y = window.innerHeight / 2;
var z = window.innerHeight / 2;
var vx = -5;
var vy = 3;
var score1 = 0;
var score2 = 0;

function Resize() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Draw();
};

window.onresize = Resize;
Resize();

function Draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.fillStyle = '#fff';
  ctx.font = '40px san-serif';
  ctx.fillText('Score: ' + score1 + ', ' + score2, 20, 50);
  ctx.fillRect(x, y, 25, 25);
  ctx.fillRect(0, z, 25, 100);
}

function Tick() {
  x += vx;
  y += vy;
  if (z < 0) {
    z = 0;
  }
  if (z > window.innerHeight - 100) {
    z = window.innerHeight - 100;
  }
  if (x <= 0) {
    score2 += 1;
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }
  if (x + 25 >= window.innerWidth) {
    score1 += 1;
    x = window.innerWidth / 2;
    y = window.innerHeight / 2;
  }
  if (y >= window.innerHeight - 25 || y <= 0) {
    vy = -vy;
  }
  Draw();
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  if (e.keyCode == 38) {
    z -= 25;
  } else if (e.keyCode == 40) {
    z += 25;
  }
};
