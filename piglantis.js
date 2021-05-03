'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var soundbox = new SoundBox();
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
}

class Turret extends Entity {
  constructor() {
    super();
    this.setSize(100, 50);
    this.setShape('pig4');
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
  }
}

class Enemy extends Entity {
  constructor() {
    super();
    this.vx = 0;
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
    }
    if (this.x > 3000) {
      this.x = -1000;
    }
    return this;
  }
}

function Update() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Tick();
  Draw();
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
}

function Init() {
  entities = [];
  entities.push(new Turret().setPosition(200, 300));
  entities.push(new Turret().setPosition(1000, 300));
  entities.push(new Turret().setPosition(1800, 300));
  entities.push(new Enemy().setPosition(0, 875).setVelocity(Math.random() * 20 - 10));
  entities.push(new Enemy().setPosition(0, 625).setVelocity(Math.random() * 20 - 10));
  entities.push(new Enemy().setPosition(0, 750).setVelocity(Math.random() * 20 - 10));
  entities.push(new Enemy().setPosition(0, 1000).setVelocity(Math.random() * 20 - 10));
  entities.push(new Enemy().setPosition(0, 500).setVelocity(Math.random() * 20 - 10));
}

Init();
setInterval(Update, 20);

window.onkeydown = function(e) {
  if (e.code == 'ArrowLeft') {
    entities.push(new Bullet().setPosition(200, 300).setVelocity(5 * Math.sqrt(3), 5));
  } else if (e.code == 'ArrowUp') {
    entities.push(new Bullet().setPosition(1000, 300).setVelocity(0, 10));
  } else if (e.code == 'ArrowRight') {
    entities.push(new Bullet().setPosition(1800, 300).setVelocity(-5 * Math.sqrt(3), 5));
  }
};
