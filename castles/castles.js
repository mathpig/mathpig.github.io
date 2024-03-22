"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

const blockSize = 20;

var entities = [];

var map = ["",
           "               BHHB    BHHB    BHHB    BHHB",
           "        BBBBBHHBHHB    BHHB    BHHB    BHHB",
           "        BHHHHHHBBBB    BBBB    BBBB    BBBB",
           "        BHHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
           "        BHHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
           "        BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
           "        BHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
           "        BBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
           "        BHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
           "        BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
           "        BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBHHBB",
           "        BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHHB",
           "        BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHB",
           "        BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBB",
           "        BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHB",
           "        BHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHBHHB",
           "        BBHHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
           "        BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
           "        BHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHB",
           "        BBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
           "        BHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
           "        BHHBHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
           "GGGGGGGGBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBGGGGWWWWWWWWGGGG",
           "DDDDDDDDBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBDDDDWWWWWWWWDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
           "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];

function Init() {
  for (var i = 0; i < map.length; ++i) {
    for (var j = 0; j < map[i].length; ++j) {
      var block = map[i][j];
      if (block == " ") {
        continue;
      }
      var x = (10 + blockSize * j);
      var y = (10 + blockSize * i);
      if (block == "B") {
        entities.push(new Brick().setPosition(x, y));
      }
      else if (block == "H") {
        entities.push(new BackgroundBrick().setPosition(x, y));
      }
      else if (block == "G") {
        entities.push(new Grass().setPosition(x, y));
      }
      else if (block == "D") {
        entities.push(new Dirt().setPosition(x, y));
      }
      else if (block == "W") {
        entities.push(new Water().setPosition(x, y));
      }
    }
  }
}

function distance(e1, e2) {
  return Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));
}

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = blockSize;
    this.doCollision = true;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setDoCollision(doCollision) {
    this.doCollision = doCollision;
    return this;
  }

  tick() {
  }
}

class Brick extends Block {
  constructor() {
    super();
    this.color1 = "rgb(128, 128, 128)";
    this.color2 = "rgb(0, 0, 0)";
  }

  draw() {
    ctx.fillStyle = this.color1;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.strokeStyle = this.color2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
    ctx.moveTo(this.x - this.size / 2, this.y);
    ctx.lineTo(this.x + this.size / 2, this.y);
    ctx.moveTo(this.x - this.size / 6, this.y - this.size / 2);
    ctx.lineTo(this.x - this.size / 6, this.y);
    ctx.moveTo(this.x + this.size / 6, this.y);
    ctx.lineTo(this.x + this.size / 6, this.y + this.size / 2);
    ctx.stroke();
  }
}

class BackgroundBrick extends Brick {
  constructor() {
    super();
    this.doCollision = false;
    this.color1 = "rgb(64, 64, 64)";
    this.color2 = "rgb(0, 0, 0)";
  }
}

class Grass extends Block {
  draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

class Dirt extends Block {
  draw() {
    ctx.fillStyle = "brown";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

class Water extends Block {
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

class Knight {
  constructor() {
    this.speed = 1;
    this.x = 0;
    this.y = 0;
    this.size = 20;
    this.color = "blue";
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
  }
}

var l1 = 0;
for (var i = 0; i < map.length; ++i) {
  l1 = Math.max(l1, map[i].length);
}
var l2 = map.length;

function Draw() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(0, 0, l1 * blockSize, l2 * blockSize);
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  Draw();
}

Init();
setInterval(Tick, 25);
