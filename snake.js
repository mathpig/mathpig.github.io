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
    this.playerNumber = 0;
    this.start = [0, 0];
    this.unsynced = ['start', 'headColor', 'bodyColor'];
  }

  setPlayerNumber(number) {
    this.playerNumber = number;
    return this;
  }

  setStart(x, y) {
    this.start = [x, y];
    this.reset();
    return this;
  }

  reset() {
    this.body = [[this.start[0], this.start[1]]];
    this.length = 3;
    this.directionX = 0;
    this.directionY = 0;
  }

  kill() {
    soundbox.hurt();
    this.reset();
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
    if (head[0] == world.eggX && head[1] == world.eggY) {
      this.score += this.length;
      this.length++;
      soundbox.flute(3);
      if (online.headPlayer()) {
        world.newEgg();
      }
    }
    if (head[0] < 0 || head[0] >= WIDTH ||
        head[1] < 0 || head[1] >= HEIGHT) {
      this.kill();
      return;
    }
    for (var i = 0; i < this.body.length - 1; ++i) {
      if (head[0] == this.body[i][0] && head[1] == this.body[i][1]) {
        this.kill();
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

class World {
  constructor() {
    this.eggX = 0;
    this.eggY = 0;
  }

  newEgg() {
    this.eggX = Math.floor(Math.random() * WIDTH);
    this.eggY = Math.floor(Math.random() * HEIGHT);
  }

  drawEgg() {  
    var egg1 = document.getElementById('egg1');
    ctx.drawImage(egg1, this.eggX, this.eggY, 1, 1);
  }
}

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');

var world = new World();
var snakes = [];
var soundbox = new SoundBox();

function Init() {
  snakes = [
    new Snake().setPlayerNumber(1).setStart(Math.floor(WIDTH / 4), Math.floor(HEIGHT / 2)),
    new Snake().setPlayerNumber(2).setStart(Math.floor(WIDTH * 3 / 4), Math.floor(HEIGHT / 2)).setColor('#fff', '#00f'),
  ];
  world.newEgg();
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

  world.drawEgg();

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
    online.syncPlayer(snakes[i]);
  }
  
  online.syncWorld(world);
  
  Draw();
}

Init();
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
