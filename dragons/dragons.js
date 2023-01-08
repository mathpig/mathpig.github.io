'use strict';

var screen = document.getElementById("screen");
var ctx = screen.getContext('2d');

var x = window.innerWidth / 2;
var y = window.innerHeight / 2;
var left = 0;
var right = 0;
var up = 0;
var down = 0;
var lastKey = 0;
var health = 50;

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;

  x += left + right;
  y += up + down;

  if (Math.random() < 0.2) {
    if (Math.random() < 0.5) {
      health++;
    }
    else {
      health--;
    }
  }

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.fillStyle = 'red';
  ctx.fillRect(window.innerWidth / 4, window.innerHeight / 10,
               health * window.innerWidth / 200, window.innerHeight / 20);
  ctx.fillStyle = 'black';
  ctx.fillRect(health * window.innerWidth / 200 + window.innerWidth / 4, window.innerHeight / 10,
               window.innerWidth / 2 - health * window.innerWidth / 200, window.innerHeight / 20);

  ctx.save();
  ctx.translate(x, y);
  if (left) {
    lastKey = 0;
  }
  if (right) {
    lastKey = 1;
  }
  if (lastKey == 1) {
    ctx.scale(-1, 1);
  }
  ctx.fillStyle = 'yellow';
  ctx.font = '100px consolas';
  ctx.fillText('\u{1F409}', -50, 0);
  ctx.restore();
}

setInterval(Draw, 30);

window.onkeydown = function(e) {
  if (e.key == 'ArrowUp') {
    e.preventDefault();
    up = -3;
  }
  else if (e.key == 'ArrowRight') {
    e.preventDefault();
    right = 3;
  }
  else if (e.key == 'ArrowDown') {
    e.preventDefault();
    down = 3;
  }
  else if (e.key == 'ArrowLeft') {
    e.preventDefault();
    left = -3;
  }
};

window.onkeyup = function(e) {
  if (e.key == 'ArrowUp') {
    e.preventDefault();
    up = 0;
  }
  else if (e.key == 'ArrowRight') {
    e.preventDefault();
    right = 0;
  }
  else if (e.key == 'ArrowDown') {
    e.preventDefault();
    down = 0;
  }
  else if (e.key == 'ArrowLeft') {
    e.preventDefault();
    left = 0;
  }
};
