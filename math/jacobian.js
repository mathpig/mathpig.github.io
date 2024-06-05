"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var entities = [];
var center = [0, 0];

var fps = 40;
var totalFrames = (fps * 2);

function f(a, b) {
  return [-20 * Math.sin(b) / totalFrames, -20 * Math.sin(a) / totalFrames];
}

function shouldAdd(x, y) {
  return Math.abs(y - x * Math.sin(x * x + y * y)) <= 0.05;
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
    ctx.fillRect(this.x * 100 - this.size / 2, this.y * 100 - this.size / 2, this.size, this.size);
  }

  tick() {
    var velocity = f(this.x, this.y);
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

var time = 0;

function Tick() {
  time++;
  if (time <= totalFrames) {
    for (var i = 0; i < entities.length; ++i) {
      entities[i].tick();
    }
  }
  Draw();
}

for (var i = 0; i <= 1000; ++i) {
  for (var j = 0; j <= 1000; ++j) {
    var x = (i / 100 - 5);
    var y = (j / 100 - 5);
    if (shouldAdd(x, y)) {
      entities.push(new Particle().setPosition(x, y));
    }
  }
}

setInterval(Tick, fps);
