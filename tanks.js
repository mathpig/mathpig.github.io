'use strict';

class Tank {
  constructor() {
    this.x = 500;
    this.y = 0;
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
    ctx.translate(0, 35);
    ctx.rotate(this.direction);
    ctx.filter = 'brightness(80%)';
    ctx.fillRect(-10, -10, 75, 20);
    ctx.filter = '';
    ctx.restore();

    ctx.fillRect(-25, 0, 50, 50);
 
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
  }
}

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var keys = {};
var tanks = [
  new Tank().setPosition(800, 0).setColor('#f0f')
            .setControls('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ShiftRight'),
  new Tank().setPosition(200, 0).setColor('#f00')
            .setControls('KeyA', 'KeyD', 'KeyW', 'KeyS', 'ShiftLeft')
];

function DrawScreen() {
  ctx.fillStyle = '#0ff';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();

  ctx.translate(screen.width / 2 - screen.height / 2, 0);
  ctx.scale(screen.height / 1000, screen.height / 1000);
  ctx.translate(0, 1000);
  ctx.scale(1, -1);

  for (var i = 0; i < tanks.length; ++i) {
    tanks[i].draw();
  }

  ctx.restore();
}

function Tick() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  DrawScreen();
  
  for (var i = 0; i < tanks.length; ++i) {
    tanks[i].tick();
  }
}

function KeyDown(e) {
  keys[e.code] = true;
}

function KeyUp(e) {
  keys[e.code] = false;
}

setInterval(Tick, 20);
window.onkeydown = KeyDown;
window.onkeyup = KeyUp;
