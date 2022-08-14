'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var pings = 0;
var x = window.innerWidth / 2;
var y = window.innerHeight / 2;
var a = window.innerHeight / 2;
var z = window.innerHeight / 2;
var score1 = 0;
var score2 = 0;
var speed = 10;
var vx = -Math.random() * speed;
var vy = Math.random() * speed * 2 - speed;
var score1 = 0;
var score2 = 0;
var soundbox = new SoundBox();

function Resize() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
}

function Reset() {
  x = screen.width / 2;
  y = screen.height / 2;
  vx = -Math.random() * speed;
  vy = Math.random() * speed * 2 - speed;
  if (vx > -speed / 2 || (vy < speed * 3 / 10 && vy > -speed * 3 / 10)) {
    Reset();
  }
  pings = 0;
}

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
  ctx.fillRect(screen.width - 25, a, 25, 100);
}

function Tick() {
  speed = Math.max(score1 + 10, 20);
  x += vx;
  y += vy;
  if (a + 100 < y + 25) {
    a += speed * 2 / 5;
  }
  if (a > y) {
    a -= speed * 2 / 5;
  }
  if (z < 0) {
    z = 0;
  }
  if (z > screen.height - 100) {
    z = screen.height - 100;
  }
  if (x >= 0 && x < 25 && (y + 25) >= z && y <= (z + 100)) {
    vx = -vx;
    x = 25;
    soundbox.jump();
    pings++;
  }
  if (x <= screen.width && x > screen.width - 25 - 25 && (y + 25) >= a && y <= (a + 100)) {
    vx = -vx;
    x = screen.width - 25 - 25;
    soundbox.jump();
    pings++;
  }
  if (x <= 0) {
    score2 += 1;
    soundbox.hurt();
    Reset();
  }
  if (x + 25 >= screen.width) {
    score1 += 1;
    soundbox.hurt();
    Reset();
  }
  if (y >= screen.height - 25 || y <= 0) {
    vy = -vy;
  }
  if (pings >= 5) {
    Reset();
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
