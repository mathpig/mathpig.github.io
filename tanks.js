'use strict';

function Distance2(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function Deg(angle) {
  return Math.PI * angle / 180;
}

function Reset() {
  tanks = [
    new Tank().setPosition(1800, 75).setColor('#00f').setDirection(Deg(45))
              .setControls('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Digit0'),
    new Tank().setPosition(200, 75).setColor('#f00').setDirection(Deg(135))
              .setControls('KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyF', 'Digit1'),
  ];
  bullets = [];
  terrain = new Terrain();
}

class Terrain {
  constructor() {
    this.altitude = [];
/*
    for (var i = 0; i < 20; ++i) {
      this.altitude[i] = Math.random() * 500 + 100;
    }
*/
    const n = 400;
    var a0 = Math.random() * 200;
    var a1 = Math.random() * 20;
    var a2 = Math.random() * 200;
    var a3 = Math.random() * 20;
    var f0 = Math.random() * Math.PI / n * 4;
    var f1 = Math.random() * Math.PI / n * 40;
    var f2 = Math.random() * Math.PI / n * 4;
    var f3 = Math.random() * Math.PI / n * 40;
    for (var i = 0; i < n; ++i) {
      var y = a0 * Math.sin(f0 * i) +
              a1 * Math.sin(f1 * i) +
              a2 * Math.cos(f2 * i) +
              a3 * Math.cos(f3 * i) + 400;
      if (y < 100) {
        y = 100;
      }
      this.altitude.push(y);
    }
  }

  draw() {
    ctx.fillStyle = '#ca4';
    ctx.beginPath();
    ctx.moveTo(-500, 0);
    for (var i = 0; i < this.altitude.length; ++i) {
      ctx.lineTo(i * 3000 / this.altitude.length - 500, this.altitude[i]);
    }
    ctx.lineTo(2500, 0);
    ctx.fill();
  }

  getAltitude(x) {
    var n = this.altitude.length;
    var i = (n * (500 + x)) / 3000;
    var i0 = Math.floor(i);
    var i1 = i0 + 1;
    if (i0 < 0 || i1 >= n) {
      return 0;
    }
    var y0 = this.altitude[i0];
    var y1 = this.altitude[i1];
    var x0 = (3000 * i0) / n - 500;
    var x1 = (3000 * i1) / n - 500;
    var m = (y0 - y1) / (x0 - x1);
    var y = m * (x - x0) + y0;
    return y;
  }

  adjust(i, amount) {
    const PILE_LIMIT = 25;
    var n = this.altitude.length;
    for (;;) {
      this.altitude[i] += amount;
      if (i < 0 && i >= n - 1) {
        return;
      }
      if (this.altitude[i] > this.altitude[i - 1] + PILE_LIMIT ||
          this.altitude[i] > this.altitude[i + 1] + PILE_LIMIT) {
        this.altitude[i] -= amount;
        if (this.altitude[i - 1] > this.altitude[i + 1]) {
          ++i;
          continue;
        }
        else {
          --i;
          continue;
        }
      }
      if (this.altitude[i] < this.altitude[i - 1] - PILE_LIMIT ||
          this.altitude[i] < this.altitude[i + 1] - PILE_LIMIT) {
        this.altitude[i] += amount;
        if (this.altitude[i - 1] < this.altitude[i + 1]) {
          amount = -amount;
          ++i;
          continue;
        }
        else {
          amount = -amount;
          --i;
          continue;
        }
      }
      break;
    }
  }

  hit(x, amount) {
    var n = this.altitude.length;
    var i = (n * (500 + x)) / 3000;
    var i0 = Math.round(i);
    if (i0 < 0 || i0 >= n) {
      return;
    }
    this.adjust(i0, -amount);
  }
}

class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 5;
    this.shape = null;
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

  setRadius(radius) {
    this.radius = radius;
    return this;
  }

  setShape(shape) {
    this.shape = document.getElementById(shape);
    return this;
  }

  draw() {
    ctx.save();
    ctx.translate(-this.radius, -this.radius);
    ctx.drawImage(this.shape, this.x, this.y, this.radius * 2, this.radius * 2);
    ctx.restore();
  }

  tick() {
    this.vy -= 1;
    this.x += this.vx;
    this.y += this.vy;
  }
}

class SolidParticle extends Particle {
  constructor() {
    super();
    this.color = '#fff';
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }
}

class Bullet extends SolidParticle {
  constructor() {
    super();
    this.setRadius(5);
    this.setColor('#111');
  }

  tick() {
    super.tick();
    for (var i = 0; i < tanks.length; ++i) {
      if (Distance2(this, tanks[i]) < 30 * 30) {
        tanks[i].hp -= 1;
      }
    }
    const DAMPEN = 0.5;
    if (this.y <= terrain.getAltitude(this.x)) {
      terrain.hit(this.x, 4);
      bullets[bullets.indexOf(this)] = new GroundParticle()
        .setPosition(this.x, terrain.getAltitude(this.x) + 1)
        .setVelocity(this.vx * DAMPEN, Math.abs(this.vy) * DAMPEN);
    }
  }
}

class SuperBullet extends Particle {
  constructor() {
    super();
    this.setRadius(30);
    this.setShape('cannonball');
  }

  tick() {
    super.tick();
    if (this.y <= terrain.getAltitude(this.x) + this.radius + 10) {
      bullets.splice(bullets.indexOf(this), 1);
      const VELOCITY = 25;
      for (var i = 0; i < 1000; ++i) {
        for (;;) {
          var vx = Math.random() * 2 - 1;
          var vy = Math.random() * 2 - 1;
          if (vx * vx + vy * vy < 1) {
            break;
          }
        }
        vx = vx * VELOCITY + this.vx;
        vy = vy * VELOCITY + this.vy;
        bullets.push(new Bullet().setPosition(this.x + vx, this.y + 10 + vy).setVelocity(vx, vy));
      }
    }
  }
}

class GroundParticle extends SolidParticle {
  constructor() {
    super();
    this.setColor('#ca4');
    this.setRadius(5);
  }

  tick() {
    super.tick();
    if (this.y <= terrain.getAltitude(this.x) + this.radius + 10) {
      bullets.splice(bullets.indexOf(this), 1);
      terrain.hit(this.x, -4);
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

  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  setColor(c) {
    this.color = c;
    return this;
  }

  setControls(moveleft, moveright, turnleft, turnright, shoot, supershoot) {
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
    if (keys[this.controls[3]]) {
      this.direction -= Math.PI / 45;
    }
    if (keys[this.controls[0]]) {
      this.x -= 4;
    }
    if (keys[this.controls[1]]) {
      this.x += 4;
    }
    if (keys[this.controls[4]]) {
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
    if (this.direction < - Math.PI / 9) {
      this.direction = - Math.PI / 9;
    }
    else if (this.direction > Math.PI * 10 / 9) {
      this.direction = Math.PI * 10 / 9;
    }
    if (this.hp <= 0) {
      Reset();
    }
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x >= 2000) {
      this.x = 2000;
    }
    var ground = terrain.getAltitude(this.x);
    this.y = ground + 25;
  }

  keydown(code) {
    if (code == this.controls[5]) {
      const BULLET_VELOCITY = 40;
      var vx = Math.cos(this.direction) * BULLET_VELOCITY;
      var vy = Math.sin(this.direction) * BULLET_VELOCITY;
      var x = this.x;
      var y = this.y + 10;
      x += vx;
      y += vy;
      bullets.push(new SuperBullet().setPosition(x, y).setVelocity(vx, vy));
    }
  }
}

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var keys = {};
var tanks = [];
var bullets = [];
var terrain = new Terrain();

function DrawScreen() {
  ctx.fillStyle = '#0ff';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();

  ctx.translate(screen.width / 2 - screen.height, 0);
  ctx.scale(screen.height / 1000, screen.height / 1000);
  ctx.translate(0, 1000);
  ctx.scale(1, -1);

  terrain.draw();

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
  if (!keys[e.code]) {
    for (var i = 0; i < tanks.length; ++i) {
      tanks[i].keydown(e.code);
    }
  }
  keys[e.code] = true;
}

function KeyUp(e) {
  keys[e.code] = false;
}

Reset();
setInterval(Update, 20);
window.onkeydown = KeyDown;
window.onkeyup = KeyUp;
