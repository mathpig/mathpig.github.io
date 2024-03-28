"use strict";

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var blobs = [];
var toRemove = [];

var graphSize = 250;

function distance(blob1, blob2) {
  return Math.sqrt((blob1.x - blob2.x) * (blob1.x - blob2.x) + (blob1.y - blob2.y) * (blob1.y - blob2.y));
}

function findNearestBlob(blob, socialDist) {
  var sickBlob = blob;
  var bestDist = blob.detectionRange;
  for (var i = 0; i < blobs.length; ++i) {
    if (!socialDist && blobs[i].state != "i") {
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

var tickSpeed = 25;

var spreadDist = 50;
var detectionRange = 100;

var deathChance = 10;

var quarantine = true;
var socialDist = true;

var speed = 1;
var angleSpeed = 1;

var exposedTime = 200;
var infectedTime = 400;
var recoveredTime = 600;

var replicationTime = 300;

var permanentRecovery = false;

var doReplication = true;
var respawnProgress = 0;
var maxPopulation = 250;

class Blob {
  constructor() {
    this.speed = speed;
    this.angleSpeed = angleSpeed;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.size = 20;
    this.state = "s";
    this.stateCountdown = 0;
    this.spreadDist = spreadDist;
    this.caresAboutSick = false;
    this.scared = false;
    this.detectionRange = detectionRange;
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
        this.stateCountdown = infectedTime / 2 + infectedTime * Math.random();
      }
    }
    else if (this.state == "i") {
      for (var i = 0; i < blobs.length; ++i) {
        if (distance(this, blobs[i]) <= this.spreadDist && blobs[i].state == "s") {
          blobs[i].state = "e";
          blobs[i].stateCountdown = exposedTime / 2 + exposedTime * Math.random();
        }
      }
      this.stateCountdown -= 1;
      if (this.stateCountdown <= 0) {
        if (Math.random() < (1 - deathChance / 100)) {
          this.state = "r";
          this.stateCountdown = recoveredTime / 2 + recoveredTime * Math.random();
        }
        else {
          toRemove.push(this);
          return;
        }
      }
    }
    else if (this.state == "r" && !permanentRecovery) {
      this.stateCountdown -= 1;
      if (this.stateCountdown <= 0) {
        this.state = "s";
      }
    }
    this.scared = false;
    if (this.state != "i" && this.caresAboutSick) {
      var sickBlob = findNearestBlob(this, socialDist);
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
    else if (this.caresAboutSick && quarantine) {
      return;
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
    if (this.x < 100 || this.x > (screen.width - graphSize - 200)) {
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

function findValue(data, index, count) {
  var total = 0;
  var val = 0;
  for (var i = (index - count); i <= (index + count); ++i) {
    if (i >= 0 && i < data.length) {
      total += data[i];
      val++;
    }
  }
  return (total / val);
}

function Draw(data, derivativeData) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < blobs.length; ++i) {
    blobs[i].draw();
  }
  var findColor = {"s": "green", "e": "orange", "i": "red", "r": "gray"};
  for (var i = 0; i < data.length; ++i) {
    var val = 0;
    for (var j in data[i]) {
      ctx.fillStyle = findColor[j];
      ctx.fillRect(screen.width + i * (graphSize / data.length) - graphSize - 100, graphSize + 100 - val - data[i][j] * (graphSize / maxPopulation), (graphSize / data.length), data[i][j] * (graphSize / maxPopulation));
      val += (data[i][j] * graphSize / maxPopulation);
    }
  }
  for (var i = 0; i < derivativeData.length; ++i) {
    var val = findValue(derivativeData, i, 25);
    val = Math.max(-graphSize / 100, Math.min(graphSize / 100, val));
    ctx.fillStyle = "black";
    ctx.fillRect(screen.width + i * (graphSize / derivativeData.length) - graphSize - 100, graphSize + 400 - 100 * val, (graphSize / derivativeData.length), 100 * val);
  }
}

var data = [];
var derivativeData = [];
var time = 0;

function addNewBlob() {
  var x = (100 + Math.random() * (screen.width - graphSize - 300));
  var y = (100 + Math.random() * (screen.height - 200));
  var angle = (Math.random() * 360);
  var caresAboutSick = blobs[Math.floor(Math.random() * blobs.length)].caresAboutSick;
  blobs.push(new Blob().setPosition(x, y).setAngle(angle).setCaresAboutSick(caresAboutSick));
}

function Tick() {
  spreadDist = parseFloat(document.getElementById("spreadDist").value);
  detectionRange = parseFloat(document.getElementById("detectionRange").value);
  deathChance = parseFloat(document.getElementById("deathChance").value);
  speed = parseFloat(document.getElementById("moveSpeed").value);
  angleSpeed = parseFloat(document.getElementById("turnSpeed").value);
  exposedTime = parseFloat(document.getElementById("exposedTime").value);
  infectedTime = parseFloat(document.getElementById("infectedTime").value);
  recoveredTime = parseFloat(document.getElementById("recoveredTime").value);
  replicationTime = parseFloat(document.getElementById("replicationTime").value);
  for (var i = 0; i < blobs.length; ++i) {
    blobs[i].spreadDist = spreadDist;
    blobs[i].detectionRange = detectionRange;
    blobs[i].speed = speed;
    blobs[i].angleSpeed = angleSpeed;
  }
  toRemove = [];
  for (var i = 0; i < blobs.length; ++i) {
    blobs[i].tick();
  }
  if (doReplication) {
    if (replicationTime > 0) {
      respawnProgress += (blobs.length / replicationTime / tickSpeed);
    }
    else if (blobs.length > 0) {
      respawnProgress = maxPopulation;
    }
    while (respawnProgress >= 1 && blobs.length < maxPopulation) {
      addNewBlob();
      respawnProgress--;
    }
    if (blobs.length == 0 || blobs.length == maxPopulation) {
      respawnProgress = 0;
    }
  }
  for (var i = 0; i < toRemove.length; ++i) {
    for (var j = 0; j < blobs.length; ++j) {
      if (blobs[j] === toRemove[i]) {
        blobs.splice(j, 1);
        break;
      }
    }
  }
  time++;
  if ((time % 10) == 0) {
    var counts = {"s": 0, "e": 0, "i": 0, "r": 0};
    for (var i = 0; i < blobs.length; ++i) {
      counts[blobs[i].state]++;
    }
    data.push(counts);
    if (data.length > 500) {
      data.shift();
    }
    if (data.length >= 2) {
      derivativeData.push(data[data.length - 1]["i"] + data[data.length - 1]["e"] - data[data.length - 2]["i"] - data[data.length - 2]["e"]);
    }
    if (derivativeData.length > 250) {
      derivativeData.shift();
    }
  }
  Draw(data, derivativeData);
}

function Init() {
  var population = parseFloat(document.getElementById("population").value);
  maxPopulation = parseFloat(document.getElementById("maxPopulation").value);
  if (population > maxPopulation) {
    return;
  }
  var sickPercent = parseFloat(document.getElementById("sickPercent").value);
  var careSickPercent = parseFloat(document.getElementById("careSickPercent").value);
  data = [];
  derivativeData = [];
  time = 0;
  blobs = [];
  toRemove = [];
  respawnProgress = 0;
  for (var i = 0; i < (population * (1 - careSickPercent / 100)); ++i) {
    var x = (100 + Math.random() * (screen.width - graphSize - 300));
    var y = (100 + Math.random() * (screen.height - 200));
    var angle = (Math.random() * 360);
    blobs.push(new Blob().setPosition(x, y).setAngle(angle));
  }
  for (var i = 0; i < (population * careSickPercent / 100); ++i) {
    var x = (100 + Math.random() * (screen.width - graphSize - 300));
    var y = (100 + Math.random() * (screen.height - 200));
    var angle = (Math.random() * 360);
    blobs.push(new Blob().setPosition(x, y).setAngle(angle).setCaresAboutSick(true));
  }
  for (var i = 0; i < (population * sickPercent / 100); ++i) {
    var blob = blobs[Math.floor(Math.random() * blobs.length)];
    while (blob.state != "s") {
      var blob = blobs[Math.floor(Math.random() * blobs.length)];
    }
    blob.state = "e";
    blob.stateCountdown = exposedTime / 2 + exposedTime * Math.random();
  }
}

Init();
setInterval(Tick, tickSpeed);

function toggleSocialDist() {
  socialDist = !socialDist;
  if (socialDist) {
    socialDistStatus.innerHTML = "[currently on]";
  }
  else {
    socialDistStatus.innerHTML = "[currently off]";
  }
}

var socialDistButton = document.getElementById("socialDist");
var socialDistStatus = document.getElementById("socialDistStatus");

socialDistButton.onclick = toggleSocialDist;

function toggleQuarantine() {
  quarantine = !quarantine;
  if (quarantine) {
    quarantineStatus.innerHTML = "[currently on]";
  }
  else {
    quarantineStatus.innerHTML = "[currently off]";
  }
}

var quarantineButton = document.getElementById("quarantine");
var quarantineStatus = document.getElementById("quarantineStatus");

quarantineButton.onclick = toggleQuarantine;

function togglePermanentRecovery() {
  permanentRecovery = !permanentRecovery;
  if (permanentRecovery) {
    permanentRecoveryStatus.innerHTML = "[currently on]";
  }
  else {
    permanentRecoveryStatus.innerHTML = "[currently off]";
  }
}

var permanentRecoveryButton = document.getElementById("permanentRecovery");
var permanentRecoveryStatus = document.getElementById("permanentRecoveryStatus");

permanentRecoveryButton.onclick = togglePermanentRecovery;

function toggleReplication() {
  doReplication = !doReplication;
  if (doReplication) {
    doReplicationStatus.innerHTML = "[currently on]";
  }
  else {
    doReplicationStatus.innerHTML = "[currently off]";
  }
}

var replicationButton = document.getElementById("doReplication");
var replicationStatus = document.getElementById("doReplicationStatus");

replicationButton.onclick = toggleReplication;

var restartButton = document.getElementById("restart");
restartButton.onclick = Init;
