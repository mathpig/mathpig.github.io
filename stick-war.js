'use strict';

var playfield = document.getElementById('playfield');
var ctx = playfield.getContext('2d');
var panel = document.getElementById('panel');
var entities = [];
var terrain1 = [];
var terrain2 = [];
var gold = 0;
var enemyGold = 0;
var mouseX, mouseY;
var scroll = 0;
var toDelete = [];

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.vx = 0;
    this.vy = 0;
    this.direction = 0;
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
    ctx.translate(this.x, this.y);
    if (this.direction < 0) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(this.frames[Math.floor(this.frame)], -this.width / 2, -this.height, this.width, this.height);
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
    var initialSize = 75;
    var sz = 1.0 - (this.strikes / (this.strikeLimit - 1));
    this.setSize(initialSize * sz, initialSize * sz);
    if (this.strikes >= this.strikeLimit) {
      toDelete.push(this);
    }
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

function findRightmostRock() {
  var rock = null;
  for (var i = 0; i < entities.length; ++i) {
    if(!entities[i].isRock()) {
      continue;
    }
    if (rock === null || entities[i].x > rock.x) {
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

  findMyRock() {
    return findLeftmostRock();
  }

  fortDirection() {
    return -1;
  }

  drainGold() {
    gold += this.gold;
    this.gold = 0;
  }

  tick() {
    super.tick();
    this.vx = 0;
    this.vy = 0;
    if (this.isFull()) {
      if (this.nearFort()) {
        this.drainGold();
      }
      else {
        this.vx = this.fortDirection() * 2;
        this.direction = this.fortDirection();
      }
    }
    else {
      var rock = this.findMyRock();
      if (this.near(rock)) {
        if (this.frame < 0.001) {
          this.mine(rock);
        }
      }
      else {
        this.vx = 2 * Math.sign(rock.x - this.x);
        this.vy = Math.sign(rock.y - this.y) / 2;
        this.direction = this.vx;
      }
    }
  }
};

class EnemyMiner extends Miner {
  constructor() {
    super();
    this.setFilter('brightness(50%) sepia(100) saturate(100) hue-rotate(25deg) brightness(50%)');
  }

  nearFort() {
    return this.x >= 9600;
  }

  findMyRock() {
    return findRightmostRock();
  }

  fortDirection() {
    return 1;
  }

  drainGold() {
    enemyGold += this.gold;
    this.gold = 0;
  }
};

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function Init() {
  gold = 500;
  enemyGold = 500;
  terrain1 = [];
  terrain2 = [];
  for (var i = 0; i < 100; ++i) {
    terrain1.push(randint(325, 425));
    terrain2.push(randint(375, 475));
  }
  entities = [];
  for (var i = 0; i < randint(12, 18); ++i) {
     entities.push(new Rock().setPosition(randint(500, 9400 - playfield.width / 2), randint(575, 625)));
  }

  entities.push(new Miner().setPosition(300, 600));

  entities.push(new Fort().setPosition(200, 550));
  entities.push(new Fort().setPosition(225, 600));
  entities.push(new Fort().setPosition(215, 650));
  entities.push(new Fort().setPosition(235, 700));

  entities.push(new EnemyMiner().setPosition(9600, 600));

  entities.push(new Fort().setPosition(9700, 550));
  entities.push(new Fort().setPosition(9675, 600));
  entities.push(new Fort().setPosition(9685, 650));
  entities.push(new Fort().setPosition(9665, 700));
}

function Tick() {
  if (enemyGold >= 250 && randint(1, 2500) == 1) {
    enemyGold -= 250;
    entities.push(new EnemyMiner().setPosition(9600, 600));
  }
  if (mouseX < 100 && mouseY > panel.clientHeight) {
    scroll -= 25;
  }
  if (mouseX > playfield.width - 100 && mouseY > panel.clientHeight) {
    scroll += 25;
  }
  if (scroll < 0) {
    scroll = 0;
  }
  if (scroll > 9900 - playfield.width) {
    scroll = 9900 - playfield.width;
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  while (toDelete.length > 0) {
    var index = entities.indexOf(toDelete.pop());
    if (index >= 0) {
      entities.splice(index, 1);
    }
  }
}

function Draw() {
  playfield.width = window.innerWidth;
  playfield.height = window.innerHeight - panel.clientHeight - 5;

  document.getElementById('gold').innerText = 'Gold: ' + gold;
  document.getElementById('enemyGold').innerText = 'Enemy\'s Gold: ' + enemyGold;

  ctx.filter = '';

  ctx.fillStyle = '#abf';
  ctx.fillRect(0, 0, playfield.width, playfield.height);

  ctx.save();
  ctx.translate(-scroll, 0);

  ctx.save();
  ctx.translate(scroll / 2, 0);
  ctx.fillStyle = '#700';
  ctx.beginPath();
  ctx.moveTo(0, playfield.height);
  for (var i = 0; i < terrain1.length; ++i) {
    ctx.lineTo(i * 100, terrain1[i]);
  }
  ctx.lineTo(terrain1.length * 100, playfield.height);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#751';
  ctx.beginPath();
  ctx.moveTo(0, playfield.height);
  for (var i = 0; i < terrain2.length; ++i) {
    ctx.lineTo(i * 100, terrain2[i]);
  }
  ctx.lineTo(terrain2.length * 100, playfield.height);
  ctx.fill();

  Tick();

  entities.sort(function(a, b) { return a.y - b.y; });
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }

  ctx.restore();
}

Init();
setInterval(Draw, 30);

window.onmousemove = function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

spawn_miner.onclick = function() {
  if (gold >= 250) {
    gold -= 250;
    entities.push(new Miner().setPosition(300, 600));
  }
};
