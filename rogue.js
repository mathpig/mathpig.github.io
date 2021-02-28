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
var cameraX, cameraY;
var players = [];
var allPlayers = [];
var soundbox = new SoundBox();

class Player {
  constructor() {
    this.x = START_X;
    this.y = START_Y;
    this.joystick = [0, 0, 0, 0, 0, 0];
    this.keys = [0, 0, 0, 0, 0, 0];
    this.color = '#f00';
    this.hue = 0;
    this.keys_count = 0;
    this.reset();
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setKeys(left, right, up, down, shoot, potion) {
    this.keys = [left, right, up, down, shoot, potion];
    return this;
  }

  reset() {
    this.hp = 500;
    this.potions = 0;
    this.bullets = [];
    this.direction = 0;
    return this;
  }

  hurt(change) {
    this.hp -= change;
    if (this.hp <= 0) {
      var index = players.indexOf(this);
      if (index >= 0) {
        players.splice(index, 1);
        if (players.length == 0) {
          Restart();
        }
      }
    }
  }

  setColor(color, hue) {
    this.color = color;
    this.hue = hue;
    return this;
  }

  draw() {
    var pig = document.getElementById('pigbright4');
    ctx.filter = 'saturate(150%) hue-rotate(' + this.hue + 'deg)';
    ctx.save();
    ctx.translate(this.x * SCALE, this.y * SCALE);
    ctx.rotate(this.direction);
    ctx.drawImage(pig, -SCALE / 2, -SCALE / 2, SCALE, SCALE);
    ctx.restore();
    ctx.filter = 'hue-rotate(' + (this.hue - 30) + 'deg)';
    if (this.color == '#ff0') {
      ctx.filter = 'sepia() hue-rotate(20deg) saturate(900%)';
    }
    var cannonball = document.getElementById('fireball1');
    for (var i = 0; i < this.bullets.length; ++i) {
      var [x, y, dir, age] = this.bullets[i];
      ctx.drawImage(cannonball, x - 10, y - 10, 20, 20);
    }
    ctx.filter = 'none';
  }

  drawStatus(index) {
    var x = index * screen.width / players.length;
    ctx.font = '25px san-serif';
    var text = 'HP: ' + this.hp + '  Keys: ' + this.keys_count;
    ctx.fillStyle = '#000';
    ctx.fillText(text, x + 51, 51);
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
      }
      if (this.canPigGo(level, cellX, cellY, true) && level[cellY][cellX] != '') {
        level[cellY][cellX] = '';
        age = 1000;
      }
      if (level[cellY][cellX] == 'grave') {
        if (Math.random() < 0.1) {
          level[cellY][cellX] = '';
        } 
        age = 1000;
      }
      for (var j = 0; j < players.length; ++j) {
        if (players[j] == this) {
          continue;
        }
        if (Math.abs(x / SCALE - players[j].x) < 0.5 &&
            Math.abs(y / SCALE - players[j].y) < 0.5) {
          players[j].hurt(10);
          soundbox.hurt();
          age = 1000;
        }
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
      this.hurt(10);
      soundbox.hurt();
    }
    if (currentLevel[py][px] == 'end') {
      currentLevel[py][px] = '';
      this.keys_count++;
      soundbox.flute(3);
    }
    if (currentLevel[py][px] == 'cheese1') {
      currentLevel[py][px] = '';
      this.hurt(-25);
      soundbox.flute(3);
    }
    if (currentLevel[py][px] == 'can1') {
      currentLevel[py][px] = '';
      this.potions++;
      soundbox.flute(3);
    }
    if (currentLevel[py][px] == 'door1' && this.keys_count > 0) {
      currentLevel[py][px] = '';
      this.keys_count--;
    }
    if (this.joystick[0] &&
        this.x > cameraX - screen.width / 2 / SCALE + 1 &&
        this.canPigGo(currentLevel, this.x - 0.5, this.y) &&
        this.canPigGo(currentLevel, this.x - 0.5, this.y - 0.2) &&
        this.canPigGo(currentLevel, this.x - 0.5, this.y + 0.2)) {
      this.x -= PIG_SPEED;
    }
    if (this.joystick[1] &&
        this.x < cameraX + screen.width / 2 / SCALE &&
        this.canPigGo(currentLevel, this.x + 0.5, this.y) &&
        this.canPigGo(currentLevel, this.x + 0.5, this.y - 0.2) &&
        this.canPigGo(currentLevel, this.x + 0.5, this.y + 0.2)) {
      this.x += PIG_SPEED;
    }
    if (this.joystick[2] &&
        this.y > cameraY - screen.height / 2 / SCALE + 1 &&
        this.canPigGo(currentLevel, this.x, this.y - 0.5) &&
        this.canPigGo(currentLevel, this.x - 0.2, this.y - 0.5) &&
        this.canPigGo(currentLevel, this.x + 0.2, this.y - 0.5)) {
      this.y -= PIG_SPEED;
    }
    if (this.joystick[3] &&
        this.y < cameraY + screen.height / 2 / SCALE &&
        this.canPigGo(currentLevel, this.x, this.y + 0.5) &&
        this.canPigGo(currentLevel, this.x - 0.2, this.y + 0.5) &&
        this.canPigGo(currentLevel, this.x + 0.2, this.y + 0.5)) {
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
    if (players.indexOf(this) < 0) {
      var pos = SafePosition();
      players.push(this.reset().setPosition(pos[0], pos[1]));
      return;
    }
    if (this.bullets.length < 4) {
      var dx = Math.cos(this.direction) * 0.5;
      var dy = Math.sin(this.direction) * 0.5;
      this.bullets.push([(this.x + dx) * SCALE, (this.y + dy) * SCALE, this.direction, 0]);
      soundbox.gun();
    }
  }

  canPigGo(level, x, y, excludeDoors) {
    var cell = level[Math.floor(y)][Math.floor(x)];
    return cell == '' || cell == 'cheese1' || cell == 'can1' ||
           cell == 'end' || (!excludeDoors && cell == 'door1' && this.keys_count > 0);
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

function SafePosition() {
  if (players.length > 0) {
    return [players[0].x, players[0].y];
  } else {
    return [START_X, START_Y];
  }
}

function Restart() {
  ticks = 0;
  currentLevel = NewLevel();
  cameraX = START_X;
  cameraY = START_Y;
  allPlayers = [
      new Player().setPosition().setKeys('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                         'ShiftRight', 'KeyP')
                                .setColor('#00f', -90),
      new Player().setPosition().setKeys('KeyA', 'KeyD', 'KeyW', 'KeyS',
                                         'ShiftLeft', 'KeyQ')
                                .setColor('#f00', 30),
      new Player().setPosition().setKeys('KeyJ', 'KeyL', 'KeyI', 'KeyK',
                                         'KeyN', 'KeyM')
                                .setColor('#ff0', 90),
      new Player().setPosition().setKeys('KeyF', 'KeyH', 'KeyT', 'KeyG',
                                         'KeyC', 'KeyV')
                                .setColor('#0f0', 120),
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
  // Clear area around initial start position.
  for (var j = -1 ; j <= 1; ++j) {
    for (var i = -1 ; i <= 1; ++i) {
      level[START_X + i][START_Y + j] = 'open';
    }
  }
  ConnectLevel(level);
  // Add objects after wall decided.
  AddObjects(level, 'wolf4', 100);
  AddObjects(level, 'grave', 25);
  AddObjects(level, 'cheese1', 25);
  AddObjects(level, 'can1', 10);
  AddObjects(level, 'end', 25);
   
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
  var x = Math.floor(Math.random() * (WIDTH - 4));
  var y = Math.floor(Math.random() * (HEIGHT - 4));
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
  level[y + h - 2][x + w - 1] = 'predoor1';
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

function UnvisitedOpen(item) {
  return item == 'open' || item == 'predoor1';
}

function FloodFill(level, i, j) {
  var stack = [];
  stack.push([i, j]);
  while (stack.length != 0) {
    var [x, y] = stack.pop();
    if (level[y] === undefined || !UnvisitedOpen(level[y][x])) {
      continue;
    }
    if (level[y][x] == 'open') {
      level[y][x] = '';
    } else {
      level[y][x] = 'door1';
    }
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
      if (UnvisitedOpen(level[j][i])) {
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
      if (image === null) {
        throw level[j][i];
      }
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
  if (players.length == 0) {
    return null;
  }
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
  if (closest == null) {
    return;
  }
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

function FindPlayerBounds() {
  var minX = 9e9, minY = 9e9;
  var maxX = -9e9, maxY = -9e9;
  for (var i = 0; i < players.length; ++i) {
    minX = Math.min(minX, players[i].x - 0.5);
    minY = Math.min(minY, players[i].y - 0.5);
    maxX = Math.max(maxX, players[i].x + 0.5);
    maxY = Math.max(maxY, players[i].y + 0.5);
  }
  if (minX == 9e9) {
    return [START_X, START_Y, START_X, START_Y];
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
  for (var i = 0; i < allPlayers.length; ++i) {
    allPlayers[i].onkeydown(e);
  }
};

window.onkeyup = function(e) {
  for (var i = 0; i < allPlayers.length; ++i) {
    allPlayers[i].onkeyup(e);
  }
};

