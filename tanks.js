'use strict';

function Distance2(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
}

class Bullet {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.age = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  draw() {
    var cannonball = document.getElementById('cannonball');
    ctx.save();
    ctx.translate(-5, -5);
    ctx.drawImage(cannonball, this.x, this.y, 10, 10);
    ctx.restore();
  }

  tick() {
    this.vy -= 1;
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (this.y <= -35) {
      bullets.splice(bullets.indexOf(this), 1);
    }
    for (var i = 0; i < tanks.length; ++i) {
      if (Distance2(this, tanks[i]) < 30 * 30) {
        tanks[i].hp -= 1;
      }
    }
  }
}

class Tank {
  constructor() {
    this.x = 500;
    this.y = 0;
    this.hp = 1000;
    this.direction = 45 * (Math.PI / 180);
    this.color = '#fff';
    this.controls = null;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setColor(c) {
    this.color = c;
    return this;
  }

  setControls(moveleft, moveright, turnleft, turnright, shoot) {
    this.controls = arguments;
    return this;
  }
  
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
  
    ctx.fillStyle = this.color;

    ctx.save();
    ctx.translate(0, 10);
    ctx.rotate(this.direction);
    ctx.filter = 'brightness(80%)';
    ctx.fillRect(-10, -10, 75, 20);
    ctx.filter = '';
    ctx.restore();

    ctx.fillRect(-25, -25, 50, 50);

    ctx.save(); 
    ctx.scale(1, -1);
    ctx.font = '30px san-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.hp, 0, 55);
    ctx.restore();

    ctx.restore();
  }

  tick() {
    if (keys[this.controls[2]]) {
      this.direction += Math.PI / 45;
    }
    else if (keys[this.controls[3]]) {
      this.direction -= Math.PI / 45;
    }
    else if (keys[this.controls[0]]) {
      this.x -= 4;
    }
    else if (keys[this.controls[1]]) {
      this.x += 4;
    }
    else if (keys[this.controls[4]]) {
      const BULLET_VELOCITY = 40;
      const PERTURB = 3;
      const RATE = 5;
      for (var i = 0; i < RATE; ++i) {
        var vx = Math.cos(this.direction) * BULLET_VELOCITY + PERTURB * (Math.random() - 0.5);
        var vy = Math.sin(this.direction) * BULLET_VELOCITY + PERTURB * (Math.random() - 0.5);
        var x = this.x;
        var y = this.y + 10;
        x += vx * (i / RATE);
        y += vy * (i / RATE);
        bullets.push(new Bullet().setPosition(x, y).setVelocity(vx, vy));
      }
    }
  }
}

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var keys = {};
var tanks = [
  new Tank().setPosition(800, 75).setColor('#f0f')
            .setControls('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'),
  new Tank().setPosition(200, 75).setColor('#f00')
            .setControls('KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyF')
];
var bullets = [];

function DrawScreen() {
  ctx.fillStyle = '#0ff';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();

  ctx.translate(screen.width / 2 - screen.height / 2, 0);
  ctx.scale(screen.height / 1000, screen.height / 1000);
  ctx.translate(0, 1000);
  ctx.scale(1, -1);
  
  for (var i = 0; i < bullets.length; ++i) {
    bullets[i].draw();
  }

  for (var i = 0; i < tanks.length; ++i) {
    tanks[i].draw();
  }

  ctx.restore();
}

function Tick() {
  for (var i = 0; i < tanks.length; ++i) {
    tanks[i].tick();
  }
  for (var i = 0; i < bullets.length; ++i) {
    bullets[i].tick();
  }
}

function Update() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Tick();
  DrawScreen();
}

function KeyDown(e) {
  keys[e.code] = true;
}

function KeyUp(e) {
  keys[e.code] = false;
}

setInterval(Update, 20);
window.onkeydown = KeyDown;
window.onkeyup = KeyUp;
