'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var soundbox = new SoundBox();
var score = 0;
var entities = [];

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.shape = '';
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    return this;
  }

  setShape(shape) {
    this.shape = document.getElementById(shape);
    return this;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x - this.width / 2, this.y - this.height / 2);
    ctx.scale(1, -1);
    ctx.drawImage(this.shape, 0, 0, this.width, this.height);
    ctx.restore();
    return this;
  }

  tick() {
  }

  shootable() {
    return false;
  }

  enemy() {
    return false;
  }

  keyDown(e) {
  }
}

class Turret extends Entity {
  constructor() {
    super();
    this.setSize(100, 50);
    this.setShape('pig4');
    this.sx = 0;
    this.sy = 0;
    this.key = '';
    this.lastShot = 0;
    this.alive = true;
  }

  setGun(key, angle, velocity) {
    this.key = key;
    this.sx = velocity * Math.cos(angle * Math.PI / 180);
    this.sy = velocity * Math.sin(angle * Math.PI / 180);
    return this;
  }

  shootable() {
    return true;
  }

  setAlive(alive) {
    this.alive = alive;
  }

  keyDown(e) {
    if (!this.alive) {
      return;
    }
    var now = new Date().getTime();
    if (e.code == this.key && now - this.lastShot > 500) {
      this.lastShot = now;
      entities.push(new Bullet().setPosition(this.x, this.y).setVelocity(this.sx, this.sy));
    }
  }

  draw() {
    if (this.alive) {
      super.draw();
    }
  }
}

class Bullet extends Entity {
  constructor() {
    super();
    this.vx = 0;
    this.vy = 0;
    this.setSize(20, 20);
    this.setShape('cannonball');
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;

    for (var i = 0; i < entities.length; i++) {
      if (entities[i].enemy() &&
          Math.abs(entities[i].x - this.x) < 100 &&
          Math.abs(entities[i].y - this.y) < 50) {
        entities.splice(i, 1);
        score += 100;
        if (score % 1000 == 0) {
          RepairTurret();
        }
        i--;
      }
    }
    if (this.y > 1000) {
      for (var i = 0; i < entities.length; i++) {
        if (entities[i] === this) {
          entities.splice(i, 1);
          return;
        }
      }
    }
  }
}

class Enemy extends Entity {
  constructor() {
    super();
    this.vx = 0;
    this.bounces = 0;
    this.setSize(150, 75);
    this.setShape('pig4');
  }

  setVelocity(vx) {
    this.vx = vx;
    return this;
  }

  tick() {
    this.x += this.vx;
    if (this.x < -1000) {
      this.x = 3000;
      this.bounces++;
    }
    if (this.x > 3000) {
      this.x = -1000;
      this.bounces++;
    }
    if (this.bounces == 2) {
      for (var i = 0; i < entities.length; i++) {
        if (!entities[i].shootable() || !entities[i].alive) {
          continue;
        }
        if (Math.abs(this.x - entities[i].x) < 50) {
          entities[i].setAlive(false);
          this.bounces = 0;
        }
      }
    }
    return this;
  }

  draw() {
    super.draw();
    if (this.bounces == 2) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.fillRect(this.x - 20, -75, 40, this.y);
    }
  }

  enemy() {
    return true;
  }
}

function Update() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Tick();
  Draw();
  var enemies = 0;
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i].enemy()) {
      enemies++;
    }
  }
  if (enemies == 0) {
    RandomEnemies(Math.floor(Math.random() * 7) + 7);
  }
}

function Tick() {
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
}

function Draw() {
  ctx.fillStyle = '#404';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();

  ctx.translate(screen.width / 2 - screen.height, 0);
  ctx.scale(screen.height / 1000, screen.height / 1000);
  ctx.translate(0, 1000);
  ctx.scale(1, -1);

  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }

  ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.fillRect(-1000, -1000, 4000, 1250);

  ctx.restore();

  ctx.font = '30px san-serif';
  ctx.fillStyle = '#000';
  ctx.fillText('Score: ' + score, 21, 51);
  ctx.fillStyle = '#ff0';
  ctx.fillText('Score: ' + score, 20, 50);
}

function RandomEnemies(n) {
  for (var i = 0; i < n; ++i) {
    if (Math.random() >= 0.5) {
      entities.push(new Enemy().setPosition(-500, Math.random() * 500 + 500).setVelocity(Math.random() * 17 + 3));
    } else {
      entities.push(new Enemy().setPosition(2500, Math.random() * 500 + 500).setVelocity(-(Math.random() * 17 + 3)));
    }
  }
}

function RepairTurret() {
  for (var i = 0; i < entities.length; i++) {
    if (entities[i].shootable() && !entities[i].alive) {
      entities[i].setAlive(true);
    }
  }
}

function Init() {
  entities = [];
  RandomEnemies(5);
  entities.push(new Turret().setPosition(200, 300).setGun('ArrowLeft', 30, 25));
  entities.push(new Turret().setPosition(1000, 300).setGun('ArrowUp', 90, 25));
  entities.push(new Turret().setPosition(1800, 300).setGun('ArrowRight', 180 - 30, 25));
}

Init();
setInterval(Update, 20);

window.onkeydown = function(e) {
  for (var i = 0; i < entities.length; i++) {
    entities[i].keyDown(e);
  }
};
