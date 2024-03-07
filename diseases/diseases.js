"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var blobs = [];

function distance(blob1, blob2) {
  return Math.sqrt((blob1.x - blob2.x) * (blob1.x - blob2.x) + (blob1.y - blob2.y) * (blob1.y - blob2.y));
}

function findNearestSickBlob(blob) {
  var sickBlob = blob;
  var bestDist = blob.detectionRange;
  for (var i = 0; i < blobs.length; ++i) {
    if (blobs[i].state != "i") {
      continue;
    }
    var val = distance(blobs[i], blob);
    if (blobs[i] !== blob && val < bestDist) {
      sickBlob = blobs[i];
      bestDist = val;
    }
  }
  return sickBlob;
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
    this.caresAboutSick = false;
    this.scared = false;
    this.detectionRange = 100;
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

  setCaresAboutSick(caresAboutSick) {
    this.caresAboutSick = caresAboutSick;
    return this;
  }

  setDetectionRange(detectionRange) {
    this.detectionRange = detectionRange;
    return this;
  }

  draw() {
    if (this.state == "s") {
      ctx.fillStyle = "green";
    }
    else if (this.state == "e") {
      ctx.fillStyle = "orange";
    }
    else if (this.state == "i") {
      ctx.fillStyle = "red";
    }
    else {
      ctx.fillStyle = "gray";
    }
    if (this.state == "i") {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.spreadDist, 0, 2 * Math.PI);
      ctx.stroke();
    }
    else if (this.caresAboutSick) {
      ctx.strokeStyle = "gray";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.detectionRange, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  tick() {
    if (this.state == "e") {
      this.stateCountdown -= 1;
      if (this.stateCountdown <= 0) {
        this.state = "i";
        this.stateCountdown = (200 + Math.random() * 400);
      }
    }
    else if (this.state == "i") {
      for (var i = 0; i < blobs.length; ++i) {
        if (distance(this, blobs[i]) <= this.spreadDist && blobs[i].state == "s") {
          blobs[i].state = "e";
          blobs[i].stateCountdown = (100 + Math.random() * 200);
        }
      }
      this.stateCountdown -= 1;
      if (this.stateCountdown <= 0) {
        this.state = "r";
        this.stateCountdown = (300 + Math.random() * 600);
      }
    }
    else if (this.state == "r") {
      this.stateCountdown -= 1;
      if (this.stateCountdown <= 0) {
        this.state = "s";
      }
    }
    this.scared = false;
    if (this.state != "i" && this.caresAboutSick) {
      var sickBlob = findNearestSickBlob(this);
      if (sickBlob !== this) {
        this.scared = true;
        var xDiff = (sickBlob.x - this.x);
        var yDiff = (sickBlob.y - this.y);
        if (xDiff > 0) {
          this.angle = (Math.atan(yDiff / xDiff) * 180 / Math.PI + 180);
        }
        else if (xDiff == 0) {
          if (yDiff > 0) {
            this.angle = 90;
          }
          else if (yDiff == 0) {
            this.angle = (sickBlob.angle + 180);
          }
          else {
            this.angle = 270;
          }
        }
        else {
          this.angle = (Math.atan(yDiff / xDiff) * 180 / Math.PI);
        }
      }
    }
    if (!this.scared) {
      this.angle += (this.angleSpeed * Math.random());
    }
    var angle = (this.angle * Math.PI / 180);
    var oldX = this.x;
    var oldY = this.y;
    var speed = this.speed;
    if (this.scared) {
      speed *= 1.5;
    }
    this.x += (speed * Math.cos(angle));
    if (this.x < 100 || this.x > (screen.width - 100)) {
      this.angle = (180 - this.angle);
      this.x = oldX;
    }
    this.y += (speed * Math.sin(angle));
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

for (var i = 0; i < 0; ++i) {
  var x = (100 + Math.random() * (screen.width - 200));
  var y = (100 + Math.random() * (screen.height - 200));
  var angle = (Math.random() * 360);
  blobs.push(new Blob().setPosition(x, y).setAngle(angle));
}

for (var i = 0; i < 100; ++i) {
  var x = (100 + Math.random() * (screen.width - 200));
  var y = (100 + Math.random() * (screen.height - 200));
  var angle = (Math.random() * 360);
  blobs.push(new Blob().setPosition(x, y).setAngle(angle).setCaresAboutSick(true));
}

for (var i = 0; i < 1; ++i) {
  var x = (100 + Math.random() * (screen.width - 200));
  var y = (100 + Math.random() * (screen.height - 200));
  var angle = (Math.random() * 360);
  var sicknessCooldown = (100 + Math.random() * 200);
  blobs.push(new Blob().setPosition(x, y).setAngle(angle).setState("e").setStateCountdown(sicknessCooldown));
}

setInterval(Tick, 25);
