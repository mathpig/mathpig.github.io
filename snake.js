'use strict';

const WIDTH = 30;
const HEIGHT = 15;

class Snake {
  constructor() {
    this.directionX = 0;
    this.directionY = 0;
    this.score = 0;
    this.body = [];
    this.headColor = '#ff0';
    this.bodyColor = '#f00';
    this.length = 3;
  }

  setStart(x, y) {
    this.body = [[x, y]];
    return this;
  }

  setColor(head, body) {
    this.headColor = head;
    this.bodyColor = body;
    return this;
  }

  drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '40px san-serif';
    ctx.fillText('Score: ' + this.score, 50, 37.5)
  }

  draw() {
    for (var i = 0; i < this.body.length; ++i) {
      if (i == this.body.length - 1) {
        ctx.fillStyle = this.headColor;
      } else {
        ctx.fillStyle = this.bodyColor;
      }
      ctx.fillRect(this.body[i][0], this.body[i][1], 1, 1);
    }
  }

  tick() {
    var head = this.body[this.body.length - 1]; 
    if (head[0] == eggX && head[1] == eggY) {
      this.score += this.length;
      this.length++;
      NewEgg();
      soundbox.flute(3);
    }
    if (head[0] < 0 || head[0] >= WIDTH ||
        head[1] < 0 || head[1] >= HEIGHT) {
      soundbox.hurt();
      Reset();
      return;
    }
    for (var i = 0; i < this.body.length - 1; ++i) {
      if (head[0] == this.body[i][0] && head[1] == this.body[i][1]) {
        soundbox.hurt();
        Reset();
        return;
      }
    }
    if (this.directionX != 0 || this.directionY != 0) {
      this.body.push([head[0] + this.directionX, head[1] + this.directionY]);
      soundbox.hop();
    }
    if (this.body.length > this.length) {
      this.body.splice(0, 1);
    }
  }

  setDirection(x, y) {
    this.directionX = x;
    this.directionY = y;
    return this;
  }
}

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');

var eggX, eggY;
var snake;
var soundbox = new SoundBox();

function Reset() {
  snake = new Snake().setStart(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2));
  NewEgg();
}

function NewEgg() {
  eggX = Math.floor(Math.random() * WIDTH);
  eggY = Math.floor(Math.random() * HEIGHT);
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;

  ctx.fillStyle = '#040';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();

  ctx.translate(0, 50);
  ctx.scale(screen.width / WIDTH, (screen.height - 50) / HEIGHT);

  ctx.fillStyle = '#030';  
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  snake.draw();
 
  var egg1 = document.getElementById('egg1');
  ctx.drawImage(egg1, eggX, eggY, 1, 1);

  ctx.restore();

  snake.drawScore();
}

function Tick() {
  snake.tick();
  Draw();
}

Reset();
setInterval(Tick, 200);

window.onkeydown = function(e) {
  if (e.code == 'ArrowLeft' || e.code == 'KeyA') {
    snake.setDirection(-1, 0);
  } else if (e.code == 'ArrowRight' || e.code == 'KeyD') {
    snake.setDirection(1, 0);
  } else if (e.code == 'ArrowUp' || e.code == 'KeyW') {
    snake.setDirection(0, -1);
  } else if (e.code == 'ArrowDown' || e.code == 'KeyS') {
    snake.setDirection(0, 1);
  }
};
