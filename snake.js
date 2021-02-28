'use strict';

const WIDTH = 30;
const HEIGHT = 15;

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');

var score = 0;
var length;
var eggX, eggY;
var snake = [];
var directionX, directionY;
var soundbox = new SoundBox();

function Reset() {
  score = 0;
  directionX = 0;
  directionY = 0;
  length = 3;
  snake = [[Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2)]];
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

  for (var i = 0; i < snake.length; ++i) {
    if (i == snake.length - 1) {
      ctx.fillStyle = '#ff0';
    }
    else {
      ctx.fillStyle = '#f00';
    }
    ctx.fillRect(snake[i][0], snake[i][1], 1, 1);
  }
  
  var egg1 = document.getElementById('egg1');
  ctx.drawImage(egg1, eggX, eggY, 1, 1);

  ctx.restore();
  
  ctx.fillStyle = '#fff';
  ctx.font = '40px san-serif';
  ctx.fillText('Score: ' + score, 50, 37.5)
}

function Tick() {
  var head = snake[snake.length - 1]; 
  if (head[0] == eggX && head[1] == eggY) {
    score += length;
    length++;
    NewEgg();
    soundbox.flute(3);
  }
  if (head[0] < 0 || head[0] >= WIDTH ||
      head[1] < 0 || head[1] >= HEIGHT) {
    soundbox.hurt();
    Reset();
    return;
  }
  for (var i = 0; i < snake.length - 1; ++i) {
    if (head[0] == snake[i][0] && head[1] == snake[i][1]) {
      soundbox.hurt();
      Reset();
      return;
    }
  }
  if (directionX != 0 || directionY != 0) {
    snake.push([head[0] + directionX, head[1] + directionY]);
    soundbox.hop();
  }
  if (snake.length > length) {
    snake.splice(0, 1);
  }
  Draw();
}

Reset();
setInterval(Tick, 200);

window.onkeydown = function(e) {
  if (e.code == 'ArrowLeft' || e.code == 'KeyA') {
    directionX = -1;
    directionY = 0;
  } else if (e.code == 'ArrowRight' || e.code == 'KeyD') {
    directionX = 1;
    directionY = 0;
  } else if (e.code == 'ArrowUp' || e.code == 'KeyW') {
    directionX = 0;
    directionY = -1;
  } else if (e.code == 'ArrowDown' || e.code == 'KeyS') {
    directionX = 0;
    directionY = 1;
  }
};
