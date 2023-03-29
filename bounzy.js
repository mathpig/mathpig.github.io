'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var cannonball = document.getElementById('cannonball');

class Entity {
  constructor(x, y, w, h, shape) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.shape = shape;
  }

  draw() {
    ctx.drawImage(this.shape, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
  }

  tick() {
  }
}

class Cannonball extends Entity {
  constructor(x, y, vx, vy) {
    super(x, y, 50, 50, cannonball);
    this.vx = vx;
    this.vy = vy;
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

var ball1 = new Cannonball(200, 200, 0.7, -2);
var ball2 = new Cannonball(-200, -300, 3, 5);

function Tick() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ball1.tick();
  ball2.tick();
  Draw();
}

function Draw() {
  ctx.fillStyle = '#c96';
  ctx.fillRect(0, 0, screen.width, screen.height);
  ball1.draw();
  ball2.draw();
}

setInterval(Tick, 20);
