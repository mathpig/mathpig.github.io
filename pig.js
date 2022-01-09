'use strict';

online.setTitle('Pig Game');
online.setMaxPlayers(4);
const SCALE = 256;
const FRICTION = 0.95;
const DAMPING = 0.4;
const DELTA = 0.1;
const LEVELS = [
  [
    'LLLLLLLLLLLLLLLLLLLL',
    'L                  L',
    'L                  L',
    'L        #         L',
    'L                  L',
    'L S A              L',
    'L ###              L',
    'L DWD              L',
    'L DDD              L',
    'L           L # LE L',
    'L                  L',
    'L                  L',
    'L      B           L',
    'LssssssssssssssssssL',
    'L##################L',
  ],
  [
    'LLLLLLLLLLLLLLLLL',
    'L               L',
    'L      FSA      L',
    'L      ###      L',
    'L  F   DWD   A  L',
    'L  #   DDD   #  L',
    'L   LLL   LLL   L',
    'L               L',
    'L               L',
    'LB #  # E #  # BL',
    'LsssssssssssssssL',
    'L###############L',
  ],
  [
    'LLLLLLLLLLLLLLLLLLLLL',
    'L                   L',
    'L                A  L',
    'L S     # W      #  L',
    'L##  #  D########D  L',
    'L  LL LL            L',
    'L                   L',
    'L  F                L',
    'L  # W     #        L',
    'L  D#######D  #  #LLL',
    'L           LL LL   L',
    'L                   L',
    'L                   L',
    'L                   L',
    'L  # W         #    L',
    'L  D###########D   EL',
    'LsssssssssssssssssssL',
    'L###################L',
  ],
  [
    'GGGGGGGGGGGGGGGGGGGGG',
    'D                   D',
    'D                   D',
    'DSf  3  f 1 f2  f 4ED',
    'DDDDDDDDDDDDDDDDDDDDD',
  ],
  [
    '                 JC                                 vx   ',
    '                JKKC               yH              vwwx  ',
    '               JKKKKC             yzzH            vwwwwx ',
    '              JKKKKKKC           yzzzzH          vwwwwwwx',
    '             JKKKKKKKKC          I    I          R      R',
    '             M        M          I    I   4      R      R',
    '             M        M          I    I  eGg     R      R',
    'DWDS         d        d       12 d    d  GGG  3  d     ER',
    'DDDGGNOOOOPGGMMMMMMMMMMGNOOOPGGGGIIIIIIGGGGGGGGGGRRRRRRRR',
    '     DNOOPD            DDNOPDD                           ',
    '     DDDDDD            DDDDDDD                           '
  ],
  [
    '                     ',
    'yzzzEEzzzH           ',
    'IIIIIIIIIIn          ',
    'I         n          ',
    'I         n          ',
    'IMMMMMMnMMM          ',
    'IIIIIIInIII          ',
    'I      niiI          ',
    'I      njjI          ',
    'I      nllI          ',
    'I      n  dS         ',
    'IIIIIIIIIIIDNOOOOOPDI',
    '          IDDNOOOPDDI',
    '          IDDDDDDDDDI',
  ],
  [
    '     S     ',
    'I I InI I I',
    'IIIIInIIIII',
    'I    n    I',
    'k    n    k',
    'IH   n   yI',
    'IIInIIInIII',
    ' IiniIiniI',
    ' IjnlIjnlI',
    ' IInIIInII',
    ' I n E n I',
    ' IWnWEWnWI',
    ' IIIIIIIII',
  ],
  [
    'S',
    'R  R RRR R   R RRRR       RRRR R   R R   R R',
    'R RR  R  RR  R R          R    R   R RR RR R',
    'RRR   R  R R R R RR R R R R RR R   R  RRR  R',
    'R RR  R  R R R R  R       R  R R   R   R    ',
    'R  R RRR R  RR RRRR       RRRR  RRR    R   E',
  ],
];

var canvas = document.getElementById('screen');
var ctx = canvas.getContext('2d');
var entities = [];
var palette = [];
var selection;
var paletteOpen = false;
var worldTransform;
var paletteTransform;
var user;
var currentLevel = 0;
var soundbox = new SoundBox();

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.w = 256;
    this.h = 256;
    this.vx = 0;
    this.vy = 0;
    this.shape = null;
    this.charCode = '%';
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setGridPosition(x, y) {
    return this.setPosition(x + SCALE / 2 - this.w / 2, y + SCALE - this.h);
  }

  setShape(shape) {
    this.shape = shape;
    return this;
  }

  setCharCode(code) {
    this.charCode = code;
    return this;
  }

  setSize(w, h) {
    this.w = w;
    this.h = h;
    return this;
  }

  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  intersect(e) {
    return !(this.x + this.w < e.x ||
             e.x + e.w < this.x ||
             this.y + this.h < e.y ||
             e.y + e.h < this.y);
  }

  adjust(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  isPlayer() {
    return false;
  }

  touchdown() {
  }

  depth() {
    return 0;
  }

  bouncable() {
    return false;
  }

  affects(e) {
    return true;
  }

  affectedBy(e) {
    return true;
  }

  kill() {
  }

  touched(e) {
  }

  frame() {
    return '';
  }

  overhang() {
    return 0;
  }

  sunk(e) {
    return 0;
  }

  leftIndent(e) {
    return 0;
  }

  rightIndent(e) {
    return 0;
  }

  repel(e) {
    if (!this.affects(e) || !e.affectedBy(this)) {
      return;
    }
    if (!this.intersect(e)) {
      return;
    }
    var left = e.x + e.w - this.x + this.leftIndent(e);
    var right = this.x + this.w - e.x + this.rightIndent(e);
    var up = e.y + e.h - this.y - this.sunk(e);
    var down = this.y + this.h - e.y;
    var options = [
      [left, -1, 0, 1],
      [right, 1, 0, 2],
      [up, 0, -1, 3],
      [down, 0, 1, 4],
    ];
    options.sort(function(a, b) { return a[0] - b[0]; });
    var dist = options[0][0];
    var dx = options[0][1];
    var dy = options[0][2];
    var dir = options[0][3];

    e.adjust(dx * (dist + DELTA), dy * (dist + DELTA));

    // 3 is when you get pushed up, so you're touching the ground
    if (dir == 3) {
      e.touchdown();
    }
    if (!e.affects(this) || !this.affectedBy(e)) {
      if (dx) {
        e.vx = -e.vx * DAMPING;
        e.vy = e.vy * FRICTION;
      } else {
        e.vx = e.vx * FRICTION;
        e.vy = -e.vy * DAMPING;
      }
    } else {
      if (dx) {
        var t = e.vx;
        e.vx = this.vx;
        this.vx = t;
      }
      if (dy) {
        var t = e.vy;
        e.vy = this.vy;
        this.vy = t;
      }
    }
    e.touched(this, dir);
    this.touched(e, dir);
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
  }

  facing() {
    return this.vx;
  }

  drawFront() {
  }

  draw() {
    var imageName = this.shape + this.frame();
    var img = document.getElementById(imageName);
    if (img === null) { throw 'cannot find ' + imageName; }
    //ctx.fillStyle = 'rgba(255,0,0,0.4)';
    //ctx.fillRect(this.x, this.y, this.w, this.h);
    if (this.facing() < 0) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(img, -this.x - this.w, this.y + this.overhang(),
                    this.w, this.h + Math.abs(this.overhang()));
      ctx.restore();
    } else {
      ctx.drawImage(img, this.x, this.y + this.overhang(),
                    this.w, this.h + Math.abs(this.overhang()));
    }
  }

  highlight() {
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  inside(x, y) {
    return x >= this.x && x <= this.x + this.w &&
           y >= this.y && y <= this.y + this.h;
  }
}

class GravityEntity extends Entity {
  tick() {
    super.tick();
    this.vy += 0.2;
  }
  bouncable() {
    return true;
  }

  shoot() {
    entities.push(new CannonballEntity()
                  .setPosition(this.x + this.w / 2 - 32 + this.direction * 30, this.y)
                  .setShape('cannonball')
                  .setVelocity(this.vx + this.direction * 30, this.vy - 10));
    soundbox.gun();
  }
}

class CannonballEntity extends GravityEntity {
  constructor(x, y, w, h, shape) {
    super(x, y, w, h, shape);
    this.timer = 0;
    this.setSize(64, 64);
  }

  tick() {
    super.tick();
    this.timer++;
    if (this.timer > 50 * 5) {
      var index = entities.indexOf(this);
      if (index >= 0) {
        entities.splice(index, 1);
      }
    }
  }

  facing() {
    return 1;
  }

  affects(e) {
    if (e.isPlayer() && this.timer < 10) {
      return false;
    }
    return true;
  }

  affectedBy(e) {
    if (e.isPlayer() && this.timer < 10) {
      return false;
    }
    return true;
  }
}

class PigEntity extends GravityEntity {
  constructor(x, y, w, h, shape) {
    super(x, y, w, h, shape);
    this.frameNum = 0;
    this.direction = 1;
    this.jump_limit = 0;
    this.cannonballs = 5;
    this.setSize(507 * 0.4, 256 * 0.4);
    this.playerNumber = 0;
    this.joystick = [0, 0, 0, 0];
    this.unsynced = ['frameNum', 'jump_limit', 'charCode', 'shape', 'w', 'h'];
    this.precision = {'x': 2, 'y': 2, vx: 1, vy: 1};
    this.bias = {'vy': -0.25};
  }

  setPlayerNumber(n) {
    this.playerNumber = n;
    if (n == online.playerNumber()) {
      user = this;
    }
    return this;
  }

  clone() {
    var o = super.clone();
    //o.joystick = Object.assign(Object.create(Object.getPrototypeOf(this.joystick)), this.joystick);
    o.joystick = [this.joystick[0], this.joystick[1], this.joystick[2], this.joystick[3]];
    return o;
  }

  kill() {
    if (this.playerNumber == online.playerNumber()) {
      soundbox.hurt();
      LoadLevel(currentLevel);
    }
  }

  affectedBy(e) {
    return !e.isPlayer();
  }

  facing() {
    return this.direction;
  }

  isPlayer() {
    return true;
  }

  touchdown() {
    this.jump_limit = 0;
  }

  draw() {
    if (this.playerNumber == 0) {
      return;
    }
    ctx.save();
    var col = this.playerNumber - 1;
    col = ((col + 3) % 4) + 1;
    ctx.filter = 'hue-rotate(' + (col * 90) + 'deg)';
    super.draw();
    ctx.restore();
  }

  shoot() {
    if (this.cannonballs > 0) {
      this.cannonballs--;
      super.shoot();
    }
  }

  frame() {
    if (this.joystick[0] || this.joystick[1]) {
      return Math.floor(this.frameNum / 4);
    } else {
      return 4;
    }
  }

  overhang() {
    return 2;
  }

  tick() {
    super.tick();
    if (this.joystick[0] || this.joystick[1]) {
      this.frameNum = (this.frameNum + 1) % 16;
    }
    if (this.joystick[0]) {
      this.vx -= 0.5;
      this.direction = -1;
    }
    if (this.joystick[1]) {
      this.vx += 0.5;
      this.direction = 1;
    }
    if (this.joystick[2]) {
      if (this.jump_limit < 10) {
        this.vy -= 1;
        this.jump_limit += 1;
      }
    } else {
      // Once you let go of the jump button, no more jump.
      if (this.jump_limit != 0) {
        this.jump_limit = 1000;
      }
    }
    this.vx = Math.max(-6, Math.min(6, this.vx));
  }
}

class BlockEntity extends Entity {
  tick() {
  }

  adjust(x, y) {
  }

  affectedBy(e) {
    return false;
  }
}

class TurfEntity extends BlockEntity {
  overhang() {
    return -8;
  }
}

class UphillSlant extends BlockEntity {
  sunk(e) {
    var p = Math.min(1, (e.x + e.w - this.x) / this.w);
    return (1 - p) * this.h;
  }

  leftIdent(e) {
    return 10000;
  }

  rightIdent(e) {
    return 10000;
  }

  intersect(e) {
    if (!super.intersect(e)) { return false; }
    var p = (e.x + e.w - this.x) / this.w;
    return e.y + e.h > this.y + (1 - p) * this.h;
  }

  depth() {
    return -1;
  }
}

class DownhillSlant extends BlockEntity {
  sunk(e) {
    var p = Math.max(0, (e.x - this.x) / this.w);
    return p * this.h;
  }

  leftIdent(e) {
    return 10000;
  }

  rightIndent(e) {
    return 10000;
  }

  intersect(e) {
    if (!super.intersect(e)) { return false; }
    var p = (e.x - this.x) / this.w;
    return e.y + e.h > this.y + p * this.h;
  }

  depth() {
    return -1;
  }
}

class LavaEntity extends BlockEntity {
  touched(e) {
    e.kill();
  }
}

class Decoration extends BlockEntity {
  affectedBy(e) {
    return false;
  }
  affects(e) {
    return false;
  }
  depth() {
    return -1;
  }
}

class Ladder extends Decoration {
  repel(e) {
    super.repel(e);
    if (this.intersect(e) && e.isPlayer()) {
      if (e.joystick[2]) {
        e.vy = -10;
      } else if (e.joystick[3]) {
        e.vy = 10;
      } else {
        e.vy = 0;
      }
    }
  }
}

class FlippedDecoration extends Decoration {
  facing() {
    return -1;
  }
}

class FlowerDecoration extends Decoration {
  constructor(x, y, shape) {
    super(x, y, shape);
    this.setSize(128, 128);
  }
}

class BounceEntity extends BlockEntity {
  touched(e) {
    if (e.bouncable()) {
      e.vy = -30;
      soundbox.jump();
    }
  }
}

class EndEntity extends BlockEntity {
  touched(e) {
    if (e.isPlayer() && e.playerNumber == online.playerNumber()) {
      soundbox.flute(3);
      LoadLevel(currentLevel + 1);
    }
  }
}

function WaterEffect(me, e) {
  if (!me.intersect(e)) {
    return;
  }
  if (e.y + e.h / 4 < me.y) {
    return;
  }
  if (Math.abs(e.vy) > 0.5) {
    e.vy *= 0.99;
  }
  if (!e.isPlayer() || !e.joystick[3]) {
    e.vy -= 0.15;
  }
}

class Water extends Decoration {
  repel(e) {
    super.repel(e);
    WaterEffect(this, e);
  }
  drawFront() {
    ctx.filter = 'opacity(0.4)';
    super.draw();
    ctx.filter = '';
  }
}

class WaterDownhillSlant extends DownhillSlant {
  repel(e) {
    super.repel(e);
    WaterEffect(this, e);
  }
  drawFront() {
    ctx.filter = 'opacity(0.6)';
    super.draw();
    ctx.filter = '';
  }
}

class WaterUphillSlant extends UphillSlant {
  repel(e) {
    super.repel(e);
    WaterEffect(this, e);
  }
  drawFront() {
    ctx.filter = 'opacity(0.6)';
    super.draw();
    ctx.filter = '';
  }
}

class WolfEntity extends GravityEntity {
  constructor(x, y, w, h, shape) {
    super(x, y, w, h, shape);
    this.direction = 1;
    this.setSize(552 / 3, 256 / 3);
    this.frameNum = 0;
  }

  kill() {
    var index = entities.indexOf(this);
    if (index >= 0) {
      entities.splice(index, 1);
    }
  }

  facing() {
    return -this.direction;
  }

  frame() {
    return Math.floor(this.frameNum / 4);
  }

  tick() {
    this.frameNum = (this.frameNum + 1) % 16;
    this.vx += this.direction * 0.3;
    this.vx = Math.max(-2, Math.min(2, this.vx));
    super.tick();
  }

  touched(e, dir) {
    if (e.isPlayer()) {
      e.kill();
    }
    if (!e.affectedBy(this)) {
      if (dir == 1) {
        this.direction = -1;
      }
      if (dir == 2) {
        this.direction = 1;
      }
    }
  }
}

function Resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const OBJECT_TABLE = [
  ['1', Decoration, 'shrub1'],
  ['2', Decoration, 'shrub2'],
  ['3', BlockEntity, 'shrub1'],
  ['4', BlockEntity, 'shrub2'],
  ['#', TurfEntity, 'dirt2'],
  ['a', UphillSlant, 'dirt1'],
  ['b', BlockEntity, 'dirt5'],
  ['c', DownhillSlant, 'dirt3'],
  ['d', Decoration, 'door1'],
  ['e', UphillSlant, 'grass1'],
  ['f', FlowerDecoration, 'flower1'],
  ['g', DownhillSlant, 'grass3'],
  ['h', BlockEntity, 'rock1'],
  ['i', Decoration, 'egg1'],
  ['j', Decoration, 'cheese1'],
  ['k', Decoration, 'cannon1'],
  ['l', Decoration, 'can1'],
  ['m', BlockEntity, 'fence1'],
  ['n', Ladder, 'ladder1'],
  ['o', Decoration, 'grave'],
  ['p', LavaEntity, 'lava'],
  ['q', LavaEntity, 'lava1'],
  ['r', LavaEntity, 'lava3'],
  ['s', LavaEntity, 'spikes'],
  ['t', BlockEntity, 'pole1'],
  ['u', Ladder, 'pole2'],
  ['v', UphillSlant, 'shingle1'],
  ['w', BlockEntity, 'shingle2'],
  ['x', DownhillSlant, 'shingle3'],
  ['y', UphillSlant, 'wood1'],
  ['z', BlockEntity, 'wood2'],
  ['A', Decoration, 'arrow'],
  ['B', BounceEntity, 'bounce'],
  ['C', DownhillSlant, 'straw3'],
  ['D', BlockEntity, 'dirt4'],
  ['E', EndEntity, 'end'],
  ['F', FlippedDecoration, 'arrow'],
  ['G', TurfEntity, 'grass2'],
  ['H', DownhillSlant, 'wood3'],
  ['I', BlockEntity, 'wood4'],
  ['J', UphillSlant, 'straw1'],
  ['K', BlockEntity, 'straw2'],
  ['L', LavaEntity, 'lava2'],
  ['M', BlockEntity, 'straw4'],
  ['N', WaterDownhillSlant, 'water1'],
  ['O', Water, 'water2'],
  ['P', WaterUphillSlant, 'water3'],
  ['R', BlockEntity, 'brick1'],
  ['S', PigEntity, 'pig'],
  ['W', WolfEntity, 'wolf'],
];

function LoadPalette() {
  var x = 0;
  var y = 0;
  OBJECT_TABLE.forEach(i => {
    var [ch, classObject, shape] = i;
    palette.push(new classObject()
                 .setCharCode(ch)
                 .setShape(shape)
                 .setPosition(x, y));
    x += SCALE;
    if (x > SCALE * 16) {
      x = 0;
      y += SCALE;
    }
  });
  selection = palette[0];
}

function LoadLevel(levelNum) {
  currentLevel = levelNum;
  var me = online.me();
  me.level = levelNum;
  online.update();
  var items = LEVELS[levelNum];
  entities = [];
  for (var j = 0; j < items.length; ++j) {
    var y = j * SCALE;
    for (var i = 0; i < items[j].length; ++i) {
      var x = i * SCALE;
      var ch = items[j][i];
      OBJECT_TABLE.forEach(i => {
        var [tch, classObject, shape] = i;
        if (ch == tch) {
          var e = new classObject().setShape(shape).setCharCode(tch);
          e.setGridPosition(x, y);
          entities.push(e);
        }
      });
    }
  }
}

function LevelExtent() {
  var lowestX = 0;
  var lowestY = 0;
  var highestX = 0;
  var highestY = 0;
  for (var i = 0; i < entities.length; ++i) {
    lowestX = Math.min(lowestX, entities[i].x);
    lowestY = Math.min(lowestY, entities[i].y);
    highestX = Math.max(highestX, entities[i].x);
    highestY = Math.max(highestY, entities[i].y);
  }
  return [Math.floor(lowestX / SCALE),
          Math.floor(lowestY / SCALE),
          Math.floor(highestX / SCALE),
          Math.floor(highestY / SCALE)];
}

function SaveLevel() {
  var [lowestX, lowestY, highestX, highestY] = LevelExtent();
  var width = highestX + 1 - lowestX;
  var height = highestY + 1 - lowestY;
  var map = [];
  for (var j = 0; j < height; ++j) {
    var row = [];
    for (var i = 0; i < width; ++i) {
      row.push(' ');
    }
    map.push(row);
  }
  for (var i = 0; i < entities.length; ++i) {
    var x = Math.floor(entities[i].x / SCALE) - lowestX;
    var y = Math.floor(entities[i].y / SCALE) - lowestY;
    map[y][x] = entities[i].charCode;
  }
  for (var j = 0; j < height; ++j) {
    map[j] = map[j].join('');
  }
  var result = JSON.stringify(map, null, '    ').replace(/"/g, "'");
  var w = window.open('about:blank');
  setTimeout(function() {
    w.document.write('<pre>\n' + result);
  }, 0);
}

function OnlineSync() {
  var template;
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i].isPlayer() && entities[i].playerNumber == 0) {
      template = entities[i];
      break;
    }
  }
  if (template === undefined) {
    return;
  }
  var to_remove = [];
  var where = {};
  for (var i = 0; i < entities.length; ++i) {
    if (!entities[i].isPlayer() || entities[i].playerNumber == 0) {
      continue;
    }
    var remove = true;
    for (var player in online.players()) {
      if (where[player]) {
        continue;
      }
      var p = online.player(player);
      if (p.level != currentLevel) {
        continue;
      }
      if (entities[i].playerNumber == player) {
        where[player] = entities[i];
        remove = false;
      }
    }
    if (remove) {
      to_remove.push(entities[i]);
    }
  }
  for (var i = 0; i < to_remove.length; ++i) {
    entities.splice(entities.indexOf(to_remove[i]), 1);
  }
  for (var player in online.players()) {
    var p = online.player(player);
    if (p.level != currentLevel) {
      continue;
    }
    if (!where[player]) {
      where[player] = template.clone().setPlayerNumber(player);
      entities.push(where[player]);
    }
  }
  for (var player in online.players()) {
    var e = where[player];
    online.syncPlayer(e);
  }
  /*
  for (var player in online.players()) {
    var p = online.player(player);
    var e = where[player];
    if (!e) {
      continue;
    }
    if (player == online.playerNumber()) {
      user = e;
      p.x = Math.floor(e.x);
      p.y = Math.floor(e.y);
      p.angle = e.direction;
      p.vx = Math.floor(e.vx);
      p.vy = Math.floor(e.vy * 4) / 4;
      p.level = currentLevel;
      for (var i = 0; i < 4; ++i) {
        p['key' + i] = e.joystick[i];
      }
    } else {
      e.x = p.x;
      e.y = p.y;
      e.direction = p.angle;
      e.vx = p.vx;
      e.vy = p.vy;
      for (var i = 0; i < 4; ++i) {
        e.joystick[i] = p['key' + i];
      }
    }
  }
  online.update();
  */
}

function Tick() {
  if (!online.playing()) {
    return;
  }
  OnlineSync();
  // Advance physics
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  // Handle collisions
  for (var i = 0; i < entities.length; ++i) {
    for (var j = 0; j < entities.length; ++j) {
      if (i == j) {
        continue;
      }
      entities[i].repel(entities[j]);
    }
  }
  if (user) {
    Draw();
  }
}

function Draw() {
  // Fill Background
  ctx.fillStyle = '#030';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var background = document.getElementById('back1');
  ctx.drawImage(background, -user.x / 10, -user.y / 10, 716 * 3, 340 * 3);

  ctx.save();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(0.5, 0.5);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.translate(canvas.width / 2 - (user.x + user.w / 2), canvas.height / 2 - (user.y + user.h / 2));

  // Save world transform for later.
  worldTransform = ctx.getTransform().invertSelf();

  // Sort by depth
  entities.sort(function(a, b) { return a.depth() - b.depth(); });

  // Draw each entity
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
  // Draw upper layer
  for (var i = 0; i < entities.length; ++i) {
    entities[i].drawFront();
  }

  ctx.restore();

  // Draw status
  ctx.font = '40px san-serif';
  ctx.fillStyle = '#000';
  ctx.fillText('Cannonballs: ' + user.cannonballs, 22, 52);
  ctx.fillStyle = '#ff0';
  ctx.fillText('Cannonballs: ' + user.cannonballs, 20, 50);

  if (paletteOpen) {
    ctx.save();
    ctx.scale(0.25, 0.25);
    paletteTransform = ctx.getTransform().invertSelf();

    // Draw palette
    for (var i = 0; i < palette.length; ++i) {
      palette[i].draw();
    }
    selection.highlight();

    ctx.restore();
  }
}

window.onkeydown = function(e) {
  if (!online.playing()) {
    return;
  }
  if (e.keyCode == 37) {
    user.joystick[0] = 1;
  } else if (e.keyCode == 39) {
    user.joystick[1] = 1;
  } else if (e.keyCode == 38) {
    user.joystick[2] = 1;
  } else if (e.keyCode == 40) {
    user.joystick[3] = 1;
  }
};

window.onkeyup = function(e) {
  if (!online.playing()) {
    return;
  }
  if (e.keyCode == 37) {
    user.joystick[0] = 0;
  } else if (e.keyCode == 39) {
    user.joystick[1] = 0;
  } else if (e.keyCode == 38) {
    user.joystick[2] = 0;
  } else if (e.keyCode == 40) {
    user.joystick[3] = 0;
  } else if (e.keyCode == 32) {
    user.shoot();
  } else if (e.keyCode == 80) {
    paletteOpen = !paletteOpen;
  } else if (e.keyCode == 83) {
    SaveLevel();
  }
};

window.onmousedown = function(e) {
  if (!online.playing()) {
    return;
  }
  var p = new DOMPoint(e.clientX, e.clientY);
  if (paletteOpen) {
    var tp = p.matrixTransform(paletteTransform);
    for (var i = 0; i < palette.length; ++i) {
      if (palette[i].inside(tp.x, tp.y)) {
        selection = palette[i];
        return;
      }
    }
  }
  var tp = p.matrixTransform(worldTransform);
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i].inside(tp.x, tp.y)) {
      entities.splice(i, 1);
      return;
    }
  }
  var e = selection.clone();
  var x = Math.floor(tp.x / SCALE) * SCALE;
  var y = Math.floor(tp.y / SCALE) * SCALE;
  e.setGridPosition(x, y);
  entities.push(e);
};

window.setInterval(Tick, 20);
window.onresize = Resize;
Resize();
LoadPalette();
LoadLevel(0);
