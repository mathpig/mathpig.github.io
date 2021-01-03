'use strict';

const WIDTH = 100;
const HEIGHT = 100;
const SCALE = 48;
const PIG_SPEED = 1/7;
const CAMERA_SPEED = 1/7;
const START_X = Math.floor(WIDTH / 2);
const START_Y = Math.floor(HEIGHT / 2);

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');

var ticks;
var currentLevel;
var cameraX = START_X, cameraY = START_Y;
var players = [];

class Player {
  constructor() {
    this.x = START_X;
    this.y = START_Y;
    this.direction = 0;
    this.bullets = [];
    this.hp = 500;
    this.potions = 0;
    this.joystick = [0, 0, 0, 0, 0, 0];
    this.keys = [0, 0, 0, 0, 0, 0];
    this.color = 0;
    this.hue = 0;
  }

  setKeys(left, right, up, down, shoot, potion) {
    this.keys = [left, right, up, down, shoot, potion];
    return this;
  }

  setColor(color, hue) {
    this.color = color;
    this.hue = hue;
    return this;
  }

  draw() {
    var pig = document.getElementById('pig4');
    for (var i = 0; i < players.length; ++i) {
      ctx.save();
      ctx.filter = 'hue-rotate(' + this.hue + 'deg)';
      ctx.translate(this.x * SCALE, this.y * SCALE);
      ctx.rotate(this.direction);
      ctx.drawImage(pig, -SCALE / 2, -SCALE / 2, SCALE, SCALE);
      ctx.filter = '';
      ctx.restore();
    }
    var cannonball = document.getElementById('cannonball');
    for (var i = 0; i < this.bullets.length; ++i) {
      var [x, y, dir, age] = this.bullets[i];
      ctx.drawImage(cannonball, x - 5, y - 5, 10, 10);
    }
  }

  drawStatus(index) {
    var x = index * screen.width / players.length;
    ctx.font = '40px san-serif';
    var text = 'HP: ' + this.hp;
    ctx.fillStyle = '#000';
    ctx.fillText(text, x + 52, 52);
    ctx.fillStyle = this.color;
    ctx.fillText(text, x + 50, 50);
    for (var i = 0; i < this.potions; ++i) {
      ctx.drawImage(can1, x + 50 + 50 * i, 55, 50, 50);
    }
  }

  updateTurn() {
    var dx = 0;
    var dy = 0;
    if (this.joystick[0]) { dx--; }
    if (this.joystick[1]) { dx++; }
    if (this.joystick[2]) { dy--; }
    if (this.joystick[3]) { dy++; }
    if (dx != 0 || dy != 0) {
      this.direction = Math.atan2(dy, dx);
    }
  }

  tickBullets() {
    var level = currentLevel;
    const speed = 10;
    var newBullets = [];
    for (var i = 0; i < this.bullets.length; ++i) {
      var [x, y, dir, age] = this.bullets[i];
      x += Math.cos(dir) * speed;
      y += Math.sin(dir) * speed;
      var cellX = Math.floor(x / SCALE);
      var cellY = Math.floor(y / SCALE);
      if (IsEnemy(level[cellY][cellX])) {
        level[cellY][cellX] = '';
        age = 1000;
        //this.hp++;
      }
      if (level[cellY][cellX] == 'grave') {
        if (Math.random() < 0.1) {
          level[cellY][cellX] = '';
          //this.hp++;
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
    this.bullets = newBullets;
  }

  tick() {
    this.updateTurn();
    this.tickBullets();
    var px = Math.floor(this.x);
    var py = Math.floor(this.y);
    if (IsEnemy(currentLevel[py][px])) {
      currentLevel[py][px] = '';
      this.hp -= 10;
      if (this.hp <= 0) {
        Restart();
      }
    }
    if (currentLevel[py][px] == 'cheese1') {
      currentLevel[py][px] = '';
      this.hp += 25;
    }
    if (currentLevel[py][px] == 'can1') {
      currentLevel[py][px] = '';
      this.potions += 1;
    }
    if (this.joystick[0] &&
        this.x > cameraX - screen.width / 2 / SCALE + 1 &&
        CanPigGo(currentLevel, this.x - 0.5, this.y) &&
        CanPigGo(currentLevel, this.x - 0.5, this.y - 0.2) &&
        CanPigGo(currentLevel, this.x - 0.5, this.y + 0.2)) {
      this.x -= PIG_SPEED;
    }
    if (this.joystick[1] &&
        this.x < cameraX + screen.width / 2 / SCALE &&
        CanPigGo(currentLevel, this.x + 0.5, this.y) &&
        CanPigGo(currentLevel, this.x + 0.5, this.y - 0.2) &&
        CanPigGo(currentLevel, this.x + 0.5, this.y + 0.2)) {
      this.x += PIG_SPEED;
    }
    if (this.joystick[2] &&
        this.y > cameraY - screen.height / 2 / SCALE + 1 &&
        CanPigGo(currentLevel, this.x, this.y - 0.5) &&
        CanPigGo(currentLevel, this.x - 0.2, this.y - 0.5) &&
        CanPigGo(currentLevel, this.x + 0.2, this.y - 0.5)) {
      this.y -= PIG_SPEED;
    }
    if (this.joystick[3] &&
        this.y < cameraY + screen.height / 2 / SCALE &&
        CanPigGo(currentLevel, this.x, this.y + 0.5) &&
        CanPigGo(currentLevel, this.x - 0.2, this.y + 0.5) &&
        CanPigGo(currentLevel, this.x + 0.2, this.y + 0.5)) {
      this.y += PIG_SPEED;
    }
  }

  triggerPotion() {
    if (this.potions <= 0) {
      return;
    } 
    this.potions--;
    for (var j = 0; j < HEIGHT; ++j) {
      for (var i = 0; i < WIDTH; ++i) {
        if (AffectedByPotion(currentLevel[j][i]) &&
            Distance(i, j, this.x, this.y) < 10) {
          currentLevel[j][i] = '';
        }
      }
    }
  }

  shoot() {
    if (this.bullets.length < 4) {
      var dx = Math.cos(this.direction) * 0.5;
      var dy = Math.sin(this.direction) * 0.5;
      this.bullets.push([(this.x + dx) * SCALE, (this.y + dy) * SCALE, this.direction, 0]);
    }
  }

  onkeydown(e) {
    if (e.code == this.keys[4] && this.joystick[4] == 0) {
      this.shoot();
    } else if (e.code == this.keys[5] && this.joystick[5] == 0) {
      this.triggerPotion();
    }
    for (var i = 0; i < this.keys.length; ++i) {
      if (e.code == this.keys[i]) {
        this.joystick[i] = 1;
      }
    }
  }

  onkeyup(e) {
    for (var i = 0; i < this.keys.length; ++i) {
      if (e.code == this.keys[i]) {
        this.joystick[i] = 0;
      }
    }
  }
}

function Restart() {
  ticks = 0;
  currentLevel = NewLevel();
  players = [
    new Player().setKeys('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ShiftRight', 'KeyP')
                .setColor('#ff0', 90),
    new Player().setKeys('KeyA', 'KeyD', 'KeyW', 'KeyS', 'ShiftLeft', 'KeyQ')
                .setColor('#f00', 0),
  ];
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
  AddObjects(level, 'shrub1', 50);
  AddObjects(level, 'shrub2', 50);
  for (var i = 0; i < 100; ++i) {
    RandomBox(level);
  }
  WorldEdge(level);
  ConnectLevel(level);
  AddObjects(level, 'wolf4', 100);
  AddObjects(level, 'grave', 25);
  AddObjects(level, 'cheese1', 25);
  AddObjects(level, 'can1', 10);
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

function AddObject(level, kind) {
  for (;;) {
    var x = Math.floor(Math.random() * WIDTH);
    var y = Math.floor(Math.random() * HEIGHT);
    if (level[y][x] != '' && level[y][x] != 'open') {
      continue;
    }
    if (Distance(START_X, START_Y, x, y) < 10) {
      continue;
    }
    level[y][x] = kind;
    break;
  }
}

function AddObjects(level, kind, number) {
  for (var i = 0; i < number; ++i) {
    AddObject(level, kind);
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
  ctx.fillStyle = '#070';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();
  ctx.translate(-cameraX * SCALE + screen.width / 2 - SCALE / 2,
                -cameraY * SCALE + screen.height / 2 - SCALE / 2);
  DrawLevel(currentLevel);
  for (var i = 0; i < players.length; ++i) {
    players[i].draw();
  }
  ctx.restore();

  for (var i = 0; i < players.length; ++i) {
    players[i].drawStatus(i);
  }
}

function Move(level, kind, fromX, fromY, toX, toY) {
  level[toY][toX] = kind;
  level[fromY][fromX] = '';
}

function ClosestPig(x, y) {
  var best = players[0];
  for (var i = 0; i < players.length; ++i) {
    if (Distance(players[i].x, players[i].y, x, y) < Distance(best.x, best.y, x, y)) {
      best = players[i];
    }
  }
  return best;
}

function TickCell(level, i, j) {
  var cell = level[j][i];
  var closest = ClosestPig(i, j);
  if (cell == 'wolf4' && ticks % 20 == 0) {
    if (Distance(closest.x, closest.y, i, j) > 10) {
      return;
    }
    if (Math.floor(closest.x) < i && level[j][i - 1] == '') {
      Move(level, 'wolf0', i, j, i - 1, j);
    }
    else if (Math.floor(closest.x) > i && level[j][i + 1] == '') {
      Move(level, 'wolf0', i, j, i + 1, j);
    }
    else if (Math.floor(closest.y) < j && level[j - 1][i] == '') {
      Move(level, 'wolf0', i, j, i, j - 1);
    }
    else if (Math.floor(closest.y) > j && level[j + 1][i] == '') {
      Move(level, 'wolf0', i, j, i, j + 1);
    }
  }
  else if (cell == 'wolf0') {
    level[j][i] = 'wolf4';
  }
  else if (cell == 'grave' && ticks % 10 == 1) {
    var x = i + Math.floor(Math.random() * 3) - 1;
    var y = j + Math.floor(Math.random() * 3) - 1;
    if (level[y][x] == '' && Distance(closest.x, closest.y, x, y) < 10) {
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

function AffectedByPotion(kind) {
  return IsEnemy(kind) || kind == 'grave';
}

function CanPigGo(level, x, y) {
  var cell = level[Math.floor(y)][Math.floor(x)];
  return cell == '' || cell == 'cheese1' || cell == 'can1';
}

function FindPlayerBounds() {
  var minX = 9e9, minY = 9e9;
  var maxX = -9e9, maxY = -9e9;
  for (var i = 0; i < players.length; ++i) {
    minX = Math.min(minX, players[i].x - 0.5);
    minY = Math.min(minY, players[i].y - 0.5);
    maxX = Math.max(maxX, players[i].x + 0.5);
    maxY = Math.max(maxY, players[i].y + 0.5);
  }
  return [minX, minY, maxX, maxY];
}

function TickCamera() {
  var [minX, minY, maxX, maxY] = FindPlayerBounds();
  var cx = (minX + maxX) / 2;
  var cy = (minY + maxY) / 2;
  var w = screen.width / SCALE / 2;
  var h = screen.height / SCALE / 2;
  if (cx < cameraX && maxX < cameraX + w) {
    cameraX -= CAMERA_SPEED;
  }
  if (cx > cameraX && minX > cameraX - w) {
    cameraX += CAMERA_SPEED;
  }
  if (cy < cameraY && maxY < cameraY + h) {
    cameraY -= CAMERA_SPEED;
  }
  if (cy > cameraY && minY > cameraY - h) {
    cameraY += CAMERA_SPEED;
  }
}

function Tick() {
  ticks++;
  TickWorld(currentLevel);
  for (var i = 0; i < players.length; ++i) {
    players[i].tick();
  }
  TickCamera();
  Draw();
}

Restart();
setInterval(Tick, 20);

window.onkeydown = function(e) {
  for (var i = 0; i < players.length; ++i) {
    players[i].onkeydown(e);
  }
};

window.onkeyup = function(e) {
  for (var i = 0; i < players.length; ++i) {
    players[i].onkeyup(e);
  }
};

