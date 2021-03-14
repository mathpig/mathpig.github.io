'use strict';

online.setTitle('Snakes');
online.setMaxPlayers(2);

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
    this.number = 0;
  }

  setNumber(number) {
    this.number = number;
    return this;
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
    ctx.fillStyle = this.headColor;
    ctx.font = '40px san-serif';
    if (this.number == 1) {
      ctx.fillText('Score: ' + this.score, 50, 37.5)
    } else {
      ctx.textAlign = 'right';
      ctx.fillText('Score: ' + this.score, screen.width - 50, 37.5)
      ctx.textAlign = 'left';
    }
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

  update() {
    var p = online.player(this.number);
    if (p === undefined) { return; }
    var head = this.body[this.body.length - 1]; 
    if (this.number == online.playerNumber()) {
      // save player state
      p.x = head[0];
      p.y = head[1];
      p.vx = this.directionX;
      p.vy = this.directionY;
      p.level = this.score;
      online.update();
    } else {
      // restore other player state
      head[0] = p.x;
      head[1] = p.y;
      this.directionX = p.vx;
      this.directionY = p.vy;
      this.score = p.level;
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
var snakes = [];
var soundbox = new SoundBox();

function Reset() {
  snakes = [
    new Snake().setNumber(1).setStart(Math.floor(WIDTH / 4), Math.floor(HEIGHT / 2)),
    new Snake().setNumber(2).setStart(Math.floor(WIDTH * 3 / 4), Math.floor(HEIGHT / 2)).setColor('#fff', '#00f'),
  ];
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
  
  for (var i = 0; i < snakes.length; ++i) {
    snakes[i].draw();
  }
  
  var egg1 = document.getElementById('egg1');
  ctx.drawImage(egg1, eggX, eggY, 1, 1);

  ctx.restore();

  for (var i = 0; i < snakes.length; ++i) {
    snakes[i].drawScore();
  }
}

function Tick() {
  if (!online.playing()) { return; }

  for (var i = 0; i < snakes.length; ++i) {
    snakes[i].tick();
  }
  for (var i = 0; i < snakes.length; ++i) {
    snakes[i].update();
  }
  
  Draw();
}

Reset();
setInterval(Tick, 200);

window.onkeydown = function(e) {
  if (!online.playing()) { return; }
  var user = snakes[online.playerNumber() - 1];
  if (e.code == 'ArrowLeft' || e.code == 'KeyA') {
    user.setDirection(-1, 0);
  } else if (e.code == 'ArrowRight' || e.code == 'KeyD') {
    user.setDirection(1, 0);
  } else if (e.code == 'ArrowUp' || e.code == 'KeyW') {
    user.setDirection(0, -1);
  } else if (e.code == 'ArrowDown' || e.code == 'KeyS') {
    user.setDirection(0, 1);
  }
};
