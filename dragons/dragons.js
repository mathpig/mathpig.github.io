'use strict';

var screen = document.getElementById("screen");
var ctx = screen.getContext('2d');

var left = 0;
var right = 0;
var up = 0;
var down = 0;

var dragon;
var entities = [];

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.direction = 0;
    this.text = 'X';
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  touching(other) {
    var a = this.bounds();
    var b = other.bounds();
    if ((a[1] < b[0] || a[0] > b[1]) || (a[3] < b[2] || a[2] > b[3])) {
      return false;
    }
    return true;
  }

  touchingOthers() {
    for (var i = 0; i < entities.length; ++i) {
      if (this === entities[i]) {
        continue;
      }
      if (this.touching(entities[i])) {
        return true;
      }
    }
    return false;
  }

  bounds() {
    ctx.font = '100px consolas';
    ctx.textAlign = 'center';
    var m = ctx.measureText(this.text);
    var width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    return [this.x - width / 2, this.x + width / 2,
            this.y - m.actualBoundingBoxAscent,
            this.y + m.actualBoundingBoxDescent];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.direction) {
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = 'yellow';
    ctx.font = '100px consolas';
    ctx.textAlign = 'center';
    var bounds = this.bounds();
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }

  drawBounds() {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    var bounds = this.bounds();
    ctx.fillRect(bounds[0], bounds[2], bounds[1] - bounds[0], bounds[3] - bounds[2]);
  }

  tick() {
  }
}

class Creature extends Entity {
  constructor() {
    super();
    this.health = 100;
  }

  setHealth(health) {
    this.health = health;
    return this;
  }

  draw() {
    super.draw();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = 'black';
    ctx.fillRect(-25, -10, 50, 10);
    ctx.fillStyle = 'red';
    ctx.fillRect(-25, -10, 50 * this.health / 100, 10);
    ctx.restore();
  }
}

class Dragon extends Creature {
  constructor() {
    super();
    this.text = '\u{1F409}';
  }

  tick() {
    var oldx = this.x;
    this.x += left + right;
    if (this.touchingOthers()) {
      this.x = oldx;
    }
    var oldy = this.y;
    this.y += up + down;
    if (this.touchingOthers()) {
      this.y = oldy;
    }
  }
}

class Spike extends Entity {
  constructor() {
    super();
    this.size = 0;
  }

  setSize(size) {
    this.size = size;
    return this;
  }

  bounds() {
    return [this.x - this.size / 2, this.x + this.size / 2, this.y - this.size, this.y];
  }

  draw() {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x - this.size / 2, this.y - this.size, this.size, this.size);
  }
}

class Pig extends Entity {
  constructor() {
    super();
    this.text = '\u{1F416}';
  }
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;

  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, screen.width, screen.height);

  entities.sort(function(a, b) {
    return a.y - b.y;
  });
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
}

function randint(a, b) {
  return a + Math.ceil(Math.random() * (b - a));
}

function Init() {
  dragon = new Dragon().setPosition(window.innerWidth / 2, window.innerHeight / 2).setHealth(randint(25, 75));
  entities.push(dragon);
  for (var i = 0; i < randint(5, 15); ++i) {
    var x = randint(window.innerWidth / 5, 4 * window.innerWidth / 5);
    var y = randint(window.innerHeight / 5, 4 * window.innerHeight / 5);
    for (var j = 0; j < 5; j++) {
      var spike = new Spike().setPosition(x, y).setSize(randint(25, 75));
      if (!spike.touchingOthers()) {
        entities.push(spike);
        break;
      }
    }
  }
  for (var i = 0; i < randint(5, 15); ++i) {
    var x = randint(window.innerWidth / 5, 4 * window.innerWidth / 5);
    var y = randint(window.innerHeight / 5, 4 * window.innerHeight / 5);
    for (var j = 0; j < 20; j++) {
      var pig = new Pig().setPosition(x, y);
      if (!pig.touchingOthers()) {
        entities.push(pig);
        break;
      }
    }
  }
}

Init();
setInterval(Draw, 30);

window.onkeydown = function(e) {
  if (e.key == 'ArrowUp') {
    e.preventDefault();
    up = -10;
  }
  else if (e.key == 'ArrowRight') {
    e.preventDefault();
    right = 10;
    dragon.direction = 1;
  }
  else if (e.key == 'ArrowDown') {
    e.preventDefault();
    down = 10;
  }
  else if (e.key == 'ArrowLeft') {
    e.preventDefault();
    left = -10;
    dragon.direction = 0;
  }
};

window.onkeyup = function(e) {
  if (e.key == 'ArrowUp') {
    e.preventDefault();
    up = 0;
  }
  else if (e.key == 'ArrowRight') {
    e.preventDefault();
    right = 0;
  }
  else if (e.key == 'ArrowDown') {
    e.preventDefault();
    down = 0;
  }
  else if (e.key == 'ArrowLeft') {
    e.preventDefault();
    left = 0;
  }
};
