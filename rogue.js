'use strict';

const WIDTH = 100;
const HEIGHT = 100;
const SCALE = 48;
const MOVE_DELAY = 7;

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var pigX, pigY, pigDirection, hp, delay, ticks;
var bullets = [];
var joystick = [0, 0, 0, 0, 0];
var currentLevel;
Restart();

function Restart() {
  pigX = Math.floor(WIDTH / 2);
  pigY = Math.floor(HEIGHT / 2);
  pigDirection = 0;
  bullets = [];
  hp = 2500;
  delay = 0;
  ticks = 0;
  currentLevel = NewLevel();
}

function IsEnemy(kind) {
  return ['wolf0', 'wolf4'].indexOf(kind) >= 0;
}

function NewLevel() {
  var level = [];
  for (var j = 0; j < HEIGHT; ++j) {
    var row = [];
    for (var i = 0; i < WIDTH; ++i) {
      var x = Math.floor(Math.random() * 10);
      var odds = level[j] !== undefined && level[j-1][i] === 'brick1' ? 3 : 9;
      if (x < odds) {
        row.push('open');
      } else {
        row.push('brick1');
      }
    }
    level.push(row);
  }
  for (var i = 0; i < 100; ++i) {
    RandomBox(level);
  }
  WorldEdge(level);
  level[pigY][pigX] = 'open';
  ConnectLevel(level);
  for (var i = 0; i < 100; ++i) {
    AddMonster(level, 'wolf4');
  }
  for (var i = 0; i < 25; ++i) {
    AddMonster(level, 'grave');
  }
  for (var i = 0; i < 50; ++i) {
    AddMonster(level, 'cheese1');
  }
  return level;
}

function WorldEdge(level) {
  for (var j = 0; j < HEIGHT; ++j) {
    level[j][0] = 'brick1';
    level[j][WIDTH-1] = 'brick1';
  }
  for (var i = 0; i < WIDTH; ++i) {
    level[0][i] = 'brick1';
    level[HEIGHT-1][i] = 'brick1';
  }
}

function Distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function AddMonster(level, kind) {
  for (;;) {
    var x = Math.floor(Math.random() * WIDTH);
    var y = Math.floor(Math.random() * HEIGHT);
    if (level[y][x] != '') {
      continue;
    }
    if (Distance(pigX, pigY, x, y) < 10) {
      continue;
    }
    level[y][x] = kind;
    break;
  }
}

function RandomBox(level) {
  var x = Math.floor(Math.random() * WIDTH);
  var y = Math.floor(Math.random() * HEIGHT);
  var w = Math.floor(Math.random() * 10) + 4;
  var h = Math.floor(Math.random() * 10) + 4;
  w = Math.min(WIDTH - x, w);
  h = Math.min(WIDTH - y, h);
  for (var j = y; j < y + h; ++j) {
    for (var i = x; i < x + w; ++i) {
      level[j][i] = 'open';
    }
    level[j][x] = 'wood4';
    level[j][x + w - 1] = 'wood4';
  }
  for (var i = x; i < x + w; ++i) {
    level[y][i] = 'straw4';
    level[y + h - 1][i] = 'straw4';
  }
}

function Connect(level, x1, y1, x2, y2) {
  var minX = Math.min(x1, x2);
  var maxX = Math.max(x1, x2);
  for (var x = minX; x <= maxX; ++x) {
    level[y2][x] = '';
  }
  for (var y = y1; y <= y2; ++y) {
    level[y][x1] = '';
  }
}

function FloodFill(level, i, j) {
  var stack = [];
  stack.push([i, j]);
  while (stack.length != 0) {
    var [x, y] = stack.pop();
    if (level[y] === undefined || level[y][x] != 'open') {
      continue;
    }
    level[y][x] = '';
    stack.push([x, y - 1]);
    stack.push([x, y + 1]);
    stack.push([x - 1, y]);
    stack.push([x + 1, y]);
  }
}

function ConnectLevel(level) {
  var lastAirX = 1;
  var lastAirY = 1;
  for (var j = 0; j < HEIGHT; ++j) {
    for (var i = 0; i < WIDTH; ++i) {
      if (level[j][i] == 'open') {
        FloodFill(level, i, j);
        Connect(level, lastAirX, lastAirY, i, j);
      }
      if (level[j][i] == '') {
        lastAirX = i;
        lastAirY = j;
      }
    }
  }
}

function DrawLevel(level) {
  for (var j = 0; j < HEIGHT; ++j) {
    for (var i = 0; i < WIDTH; ++i) {
      if (level[j][i] == '') {
        continue;
      }
      var image = document.getElementById(level[j][i]);
      ctx.drawImage(image, i * SCALE, j * SCALE, SCALE, SCALE);
    }
  }
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  var pig = document.getElementById('pig4');
  ctx.fillStyle = '#070';
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(-pigX * SCALE + screen.width / 2 - SCALE / 2,
                -pigY * SCALE + screen.height / 2 - SCALE / 2);
  DrawLevel(currentLevel);
  ctx.save();
  ctx.translate((pigX + 0.5) * SCALE, (pigY + 0.5) * SCALE);
  ctx.rotate(pigDirection);
  ctx.drawImage(pig, -SCALE / 2, -SCALE / 2, SCALE, SCALE);
  ctx.restore();
  var cannonball = document.getElementById('cannonball');
  for (var i = 0; i < bullets.length; ++i) {
    var [x, y, dir, age] = bullets[i];
    ctx.drawImage(cannonball, x - 5, y - 5, 10, 10);
  }
  ctx.restore();
  ctx.font = '40px san-serif';
  ctx.fillStyle = '#000';
  ctx.fillText('HP: ' + hp, 102, 52);
  ctx.fillStyle = '#ff0';
  ctx.fillText('HP: ' + hp, 100, 50);
}

function Move(level, kind, fromX, fromY, toX, toY) {
  level[toY][toX] = kind;
  level[fromY][fromX] = '';
}

function TickCell(level, i, j) {
  var cell = level[j][i];
  if (cell == 'wolf4' && ticks % 20 == 0) {
    if (Distance(pigX, pigY, i, j) > 10) {
      return;
    }
    if (pigX < i && level[j][i - 1] == '') {
      Move(level, 'wolf0', i, j, i - 1, j);
    }
    else if (pigX > i && level[j][i + 1] == '') {
      Move(level, 'wolf0', i, j, i + 1, j);
    }
    else if (pigY < j && level[j - 1][i] == '') {
      Move(level, 'wolf0', i, j, i, j - 1);
    }
    else if (pigY > j && level[j + 1][i] == '') {
      Move(level, 'wolf0', i, j, i, j + 1);
    }
  }
  else if (cell == 'wolf0') {
    level[j][i] = 'wolf4';
  }
  else if (cell == 'grave' && ticks % 10 == 1) {
    var x = i + Math.floor(Math.random() * 3) - 1;
    var y = j + Math.floor(Math.random() * 3) - 1;
    if (level[y][x] == '' && Distance(pigX, pigY, x, y) < 10) {
      level[y][x] = 'wolf4';
    }
  }
}

function TickWorld(level) {
  for (var j = 0; j < HEIGHT; ++j) {
    for (var i = 0; i < WIDTH; ++i) {
      TickCell(level, i, j);
    }
  } 
}

function TurnPig() {
  var dx = 0;
  var dy = 0;
  if (joystick[0]) { dx--; }
  if (joystick[1]) { dx++; }
  if (joystick[2]) { dy--; }
  if (joystick[3]) { dy++; }
  if (dx != 0 || dy != 0) {
    pigDirection = Math.atan2(dy, dx);
  }
}

function TickBullets(level) {
  const speed = 10;
  var newBullets = [];
  for (var i = 0; i < bullets.length; ++i) {
    var [x, y, dir, age] = bullets[i];
    x += Math.cos(dir) * speed;
    y += Math.sin(dir) * speed;
    var cellX = Math.floor(x / SCALE - 0.5);
    var cellY = Math.floor(y / SCALE - 0.5);
    if (IsEnemy(level[cellY][cellX])) {
      level[cellY][cellX] = '';
      age = 1000;
    }
    if (level[cellY][cellX] == 'grave') {
      if (Math.random() < 0.1) {
        level[cellY][cellX] = '';
      } 
      age = 1000;
    }
    if (level[cellY][cellX] != '') {
      age = 1000;
    }
    age++;
    if (age < 40) {
      newBullets.push([x, y, dir, age]);
    }
  }
  bullets = newBullets;
}

function CanPigGo(level, x, y) {
  var cell = level[y][x];
  return cell == '' || cell == 'cheese1';
}

function Tick() {
  ticks++;
  TickWorld(currentLevel);
  TurnPig();
  TickBullets(currentLevel);
  if (IsEnemy(currentLevel[pigY][pigX])) {
    currentLevel[pigY][pigX] = '';
    hp -= 10;
    if (hp <= 0) {
      Restart();
    }
  }
  if (currentLevel[pigY][pigX] == 'cheese1') {
    currentLevel[pigY][pigX] = '';
    hp += 25;
  }
  if (delay > 0) {
    --delay;
  } else {
    if (joystick[0] && CanPigGo(currentLevel, pigX - 1, pigY)) {
      pigX -= 1;
      delay = MOVE_DELAY;
    }
    if (joystick[1] && CanPigGo(currentLevel, pigX + 1, pigY)) {
      pigX += 1;
      delay = MOVE_DELAY;
    }
    if (joystick[2] && CanPigGo(currentLevel, pigX, pigY - 1)) {
      pigY -= 1;
      delay = MOVE_DELAY;
    }
    if (joystick[3] && CanPigGo(currentLevel, pigX, pigY + 1)) {
      pigY += 1;
      delay = MOVE_DELAY;
    }
  }
  Draw();
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  if (e.keyCode == 37) {
    joystick[0] = 1;
  } else if (e.keyCode == 39) {
    joystick[1] = 1;
  } else if (e.keyCode == 38) {
    joystick[2] = 1; 
  } else if (e.keyCode == 40) {
    joystick[3] = 1;
  } else if (e.keyCode == 16) {
    if (bullets.length < 4) {
      var dx = Math.cos(pigDirection) * 0.5;
      var dy = Math.sin(pigDirection) * 0.5;
      bullets.push([(pigX + dx + 0.5) * SCALE, (pigY + dy + 0.5) * SCALE, pigDirection, 0]);
    }
  }
};

window.onkeyup = function(e) {
  if (e.keyCode == 37) {
    joystick[0] = 0;
  } else if (e.keyCode == 39) {
    joystick[1] = 0;
  } else if (e.keyCode == 38) {
    joystick[2] = 0; 
  } else if (e.keyCode == 40) {
    joystick[3] = 0;
  }
};


