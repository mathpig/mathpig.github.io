'use strict';

var playfield = document.getElementById('playfield');
var ctx = playfield.getContext('2d');
var panel = document.getElementById('panel');
var entities = [];
var terrain1 = [];
var terrain2 = [];
var gold = 0;

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.vx = 0;
    this.vy = 0;
    this.speedX = 1;
    this.speedY = 1;
    this.health = 0;
    this.attackStrength = 0;
    this.frame = 0;
    this.frames = [];
    this.filter = '';
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  setVelocity(x, y) {
    this.vx = x;
    this.vy = y;
    return this;
  }

  setSpeed(x, y) {
    this.speedX = x;
    this.speedY = y;
    return this;
  }

  setHealth(health) {
    this.health = health;
    return this;
  }

  setAttackStrength(attackStrength) {
    this.attackStrength = attackStrength;
    return this;
  }

  setFrames(frames) {
    this.frames = frames;
    return this;
  }

  setFilter(filter) {
    this.filter = filter;
    return this;
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
    this.frame += 0.05;
    this.frame = this.frame - Math.floor(this.frame / this.frames.length) * this.frames.length;
  }

  draw() {
    ctx.save();
    ctx.filter = this.filter;
    ctx.drawImage(this.frames[Math.floor(this.frame)], this.x - this.width / 2, this.y - this.height, this.width, this.height);
    ctx.restore();
  }

  near(other) {
    return Math.abs(this.x - other.x) < 50 && Math.abs(this.y - other.y) < 25;
  }

  isRock() {
    return false;
  }
}

class Rock extends Entity {
  constructor() {
    super();
    this.strikes = 0;
    this.strikeLimit = 250;
    this.setFrames([rock1]);
    this.setSize(75, 75);
  }

  mine() {
    this.strikes++;
    this.setSize(this.width - 1, this.height - 1);
  }

  isRock() {
    return true;
  }
}

function findLeftmostRock() {
  var rock = null;
  for (var i = 0; i < entities.length; ++i) {
    if (!entities[i].isRock()) {
      continue; 
    }
    if (rock === null || entities[i].x < rock.x) {
      rock = entities[i];
    }
  }
  return rock;
}

class Fort extends Entity {
  constructor() {
    super();
    this.setFrames([spikes]);
    this.setSize(150, 150);
  }
}

class Miner extends Entity {
  constructor() {
    super();
    this.gold = 0;
    this.goldIncrease = 10;
    this.goldCapacity = 100;
    this.setFrames([miner1, miner2]);
    this.setSize(100, 100);
    this.setHealth(100);
    this.setFilter('brightness(5%)');
  }

  isFull() {
    return this.gold == this.goldCapacity;
  }

  mine(rock) {
    rock.mine();
    this.gold += 10;
  }

  nearFort() {
    return this.x <= 300;
  }

  tick() {
    super.tick();
    if (this.isFull()) {
      if (this.nearFort()) {
        gold += this.gold;
        this.gold = 0;
      }
      else {
        this.vx = -1;
      }
    }
    else {
      var rock = findLeftmostRock();
      if (this.near(rock)) {
        this.mine(rock);
      }
      else {
        this.vx = Math.sign(rock.x - this.x);
        this.vy = Math.sign(rock.y - this.y);
      }
    }
  }
};

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

var miner = null;

function Init() {
  gold = randint(400, 600);
  terrain1 = [];
  terrain2 = [];
  for (var i = 0; i < 100; ++i) {
    terrain1.push(randint(325, 425));
    terrain2.push(randint(375, 475));
  }
  entities = [];
  for (var i = 0; i < randint(8, 12); ++i) {
    entities.push(new Rock().setPosition(randint(500, 9500), randint(575, 625)));
  }
  miner = new Miner().setPosition(400, 600);
  entities.push(miner);
  entities.push(new Fort().setPosition(200, 550));
  entities.push(new Fort().setPosition(225, 600));
  entities.push(new Fort().setPosition(215, 650));
  entities.push(new Fort().setPosition(235, 700));
}

function Draw() {
  playfield.width = window.innerWidth;
  playfield.height = window.innerHeight - panel.clientHeight - 5;

  document.getElementById('gold').innerText = 'Gold: ' + gold;

  ctx.filter = '';

  ctx.fillStyle = '#abf';
  ctx.fillRect(0, 0, playfield.width, playfield.height);

  ctx.fillStyle = '#700';
  ctx.beginPath();
  ctx.moveTo(0, playfield.height);
  for (var i = 0; i < terrain1.length; ++i) {
    ctx.lineTo(i * 100, terrain1[i]);
  }
  ctx.lineTo(terrain1.length * 100, playfield.height);
  ctx.fill();

  ctx.fillStyle = '#751';
  ctx.beginPath();
  ctx.moveTo(0, playfield.height);
  for (var i = 0; i < terrain2.length; ++i) {
    ctx.lineTo(i * 100, terrain2[i]);
  }
  ctx.lineTo(terrain2.length * 100, playfield.height);
  ctx.fill();

  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  entities.sort(function(a, b) { return a.y - b.y; });
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
}

Init();
setInterval(Draw, 30);
