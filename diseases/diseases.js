"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var blobs = [];

function distance(blob1, blob2) {
  return Math.sqrt((blob1.x - blob2.x) * (blob1.x - blob2.x) + (blob1.y - blob2.y) * (blob1.y - blob2.y));
}

class Blob {
  constructor() {
    this.speed = 1;
    this.angleSpeed = 1;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.size = 20;
    this.state = "s";
    this.stateCountdown = 0;
    this.spreadDist = 50;
  }

  setSpeed(speed) {
    this.speed = speed;
    return this;
  }

  setAngleSpeed(angleSpeed) {
    this.angleSpeed = angleSpeed;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setAngle(angle) {
    this.angle = angle;
    return this;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  setState(state) {
    this.state = state;
    return this;
  }

  setStateCountdown(stateCountdown) {
    this.stateCountdown = stateCountdown;
    return this;
  }

  setSpreadDist(spreadDist) {
    this.spreadDist = spreadDist;
    return this;
  }

  draw() {
    if (this.state == "s") {
      ctx.fillStyle = "green";
    }
    else if (this.state == "i") {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.spreadDist, 0, 2 * Math.PI);
      ctx.stroke();
    }
    else {
      ctx.fillStyle = "gray";
    }
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    if (this.state == "i") {
      for (var i = 0; i < blobs.length; ++i) {
        if (distance(this, blobs[i]) <= this.spreadDist && blobs[i].state == "s") {
          blobs[i].state = "i";
          blobs[i].stateCountdown = (100 + Math.random() * 200);
        }
      }
      this.stateCountdown -= 1;
      if (this.stateCountdown <= 0) {
        this.state = "r";
        this.stateCountdown = (100 + Math.random() * 200);
      }
    }
    else if (this.state == "r") {
      this.stateCountdown -= 1;
      if (this.stateCountdown <= 0) {
        this.state = "s";
      }
    }
    this.angle += (this.angleSpeed * Math.random());
    var angle = (this.angle * Math.PI / 180);
    var oldX = this.x;
    var oldY = this.y;
    this.x += (this.speed * Math.cos(angle));
    if (this.x < 100 || this.x > (screen.width - 100)) {
      this.angle = (180 - this.angle);
      this.x = oldX;
    }
    this.y += (this.speed * Math.sin(angle));
    if (this.y < 100 || this.y > (screen.height - 100)) {
      this.angle = -this.angle;
      this.y = oldY;
    }
  }
}

function Draw() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < blobs.length; ++i) {
    blobs[i].draw();
  }
}

function Tick() {
  for (var i = 0; i < blobs.length; ++i) {
    blobs[i].tick();
  }
  Draw();
}

for (var i = 0; i < 99; ++i) {
  var x = (100 + Math.random() * (screen.width - 200));
  var y = (100 + Math.random() * (screen.height - 200));
  var angle = (Math.random() * 360);
  blobs.push(new Blob().setPosition(x, y).setAngle(angle));
}

for (var i = 0; i < 1; ++i) {
  var x = (100 + Math.random() * (screen.width - 200));
  var y = (100 + Math.random() * (screen.height - 200));
  var angle = (Math.random() * 360);
  var sicknessCooldown = (100 + Math.random() * 200);
  blobs.push(new Blob().setPosition(x, y).setAngle(angle).setState("i").setStateCountdown(sicknessCooldown));
}

setInterval(Tick, 25);
