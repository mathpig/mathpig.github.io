'use strict';

const SPEED = 5;

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var keys = {};

var pig = document.getElementById('pig4');

function DrawScreen() {
  ctx.fillStyle = '#303';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();

  ctx.translate(screen.width / 2 - screen.height / 2 * 1.5, 0);
  ctx.scale(screen.height / 1000, screen.height / 1000);
  ctx.translate(0, 1000);
  ctx.scale(1, -1);

  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, 1500, 1000);

  for (var player in online.players()) {
    var p = online.player(player);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.translate(0, pig.height / 3);
    ctx.scale(1, -1);
    ctx.drawImage(pig, 0, 0, pig.width / 3, pig.height / 3);
    ctx.restore();
  }

  ctx.restore();
}

function Tick() {
  if (!online.playing()) {
    return;
  }
  var me = online.me();
  if (keys['ArrowLeft']) {
    me.x -= SPEED;
  }
  if (keys['ArrowRight']) {
    me.x += SPEED;
  }
  if (keys['ArrowDown']) {
    me.y -= SPEED;
  }
  if (keys['ArrowUp']) {
    me.y += SPEED;
  }
  if (me.x < 0) {
    me.x = 0;
  }
  if (me.x + pig.width / 3 > 1500) {
    me.x = 1500 - pig.width / 3;
  }
  if (me.y < 0) {
    me.y = 0;
  }
  if (me.y + pig.height / 3 > 1000) {
    me.y = 1000 - pig.height / 3;
  }
  var now = new Date().getTime();
  online.update();
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
