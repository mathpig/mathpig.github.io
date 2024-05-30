"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entities = [];
var toRemove = [];
var center = [0, 0];

var fps = 40;

function f(a, b) {
  if (Math.abs(a) <= (fps / 2) && Math.abs(b) <= (fps / 2)) {
    return [Math.pow(fps, 3), 0];
  }
  var val = Math.atan2(b, a) + 5 * Math.PI / 8;
  return [Math.pow(fps, 3) * Math.cos(val) / (a * a + b * b), Math.pow(fps, 3) * Math.sin(val) / (a * a + b * b)];
}

class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.color = "blue";
    this.size = 8;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    var velocity = f(this.x, this.y);
    if (Math.abs(velocity[0]) >= (fps * 10) || Math.abs(velocity[1]) >= (fps * 10)) {
      toRemove.push(this);
      return;
    }
    this.x += velocity[0] / fps;
    this.y += velocity[1] / fps;
  }
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(screen.width / 2 - center[0], screen.height / 2 - center[1]);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
  ctx.restore();
}

function Tick() {
  toRemove = [];
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  for (var i = 0; i < toRemove.length; ++i) {
    entities.splice(entities.indexOf(toRemove[i]), 1);
  }
  Draw();
}

for (var i = -500; i <= 500; i += 25) {
  for (var j = -500; j <= 500; j += 25) {
    entities.push(new Particle().setPosition(i, j));
  }
}

setInterval(Tick, fps);
