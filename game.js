'use strict';

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
    'GGGGGGGGGGGG',
    'D          D',
    'D          D',
    'D          D',
    'D          D',
    'D          D',
    'D          D',
    'D          D',
    'D          D',
    'D          D',
    'DSSSSSSSSSSD',
    'DBBBBBBBBBBD',
    'bbbbbbbbbbbb',
  ],
];

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var entities = [];
var palette = [];
var selection;
var paletteOpen = false;
var worldTransform;
var user;
var currentLevel = 0;
var joystick = [0, 0, 0, 0];

class Entity {
  constructor(x, y, shape) {
    this.x = x;
    this.y = y;
    this.w = 256;
    this.h = 256;
    this.vx = 0;
    this.vy = 0;
    this.shape = shape;
  }

  setSize(w, h) {
    this.w = w;
    this.h = h;
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

  repel(e) {
    if (!this.affects(e) || !e.affectedBy(this)) {
      return;
    }
    if (!this.intersect(e)) {
      return;
    }
    var left = e.x + e.w - this.x;
    var right = this.x + this.w - e.x;
    var up = e.y + e.h - this.y;
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

  draw() {
    var img = document.getElementById(this.shape + this.frame());
    //ctx.fillStyle = '#f00';
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
    var ball = new CannonballEntity(this.x + this.w / 2 - 32 + this.direction * 30, this.y, 'cannonball').setSize(64, 64);
    ball.vx = this.vx + this.direction * 30;
    ball.vy = this.vy - 10;
    entities.push(ball);
  }
}

class CannonballEntity extends GravityEntity {
  constructor(x, y, w, h, shape) {
    super(x, y, w, h, shape);
    this.timer = 0;
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
    if (e === user && this.timer < 10) {
      return false;
    }
    return true;
  }

  affectedBy(e) {
    if (e === user && this.timer < 10) {
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
  }

  kill() {
    LoadLevel(currentLevel);
  }

  facing() {
    return this.direction;
  }

  touchdown() {
    this.jump_limit = 0;
  }

  shoot() {
    if (this.cannonballs > 0) {
      this.cannonballs--;
      super.shoot();
    }
  }

  frame() {
    return Math.floor(this.frameNum / 4);
  }

  overhang() {
    return 8;
  }

  tick() {
    super.tick();
    if (joystick[0] || joystick[1]) {
      this.frameNum = (this.frameNum + 1) % 16;
    }
    if (joystick[0]) {
      this.vx -= 0.5;
      this.direction = -1;
    }
    if (joystick[1]) {
      this.vx += 0.5;
      this.direction = 1;
    }
    if (joystick[2]) {
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
    return -16;
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

class FlippedDecoration extends Decoration {
  facing() {
    return -1;
  }
}

class BounceEntity extends BlockEntity {
  touched(e) {
    if (e.bouncable()) {
      e.vy = -30;
    }
  }
}

class EndEntity extends BlockEntity {
  touched(e) {
    if (e === user) {
      LoadLevel(currentLevel + 1);
    }
  }
}

class WolfEntity extends GravityEntity {
  constructor(x, y, w, h, shape) {
    super(x, y, w, h, shape);
    this.direction = 1;
  }

  kill() {
    var index = entities.indexOf(this);
    if (index >= 0) {
      entities.splice(index, 1);
    }
  }

  facing() {
    return this.direction;
  }

  tick() {
    this.vx += this.direction * 0.3;
    this.vx = Math.max(-2, Math.min(2, this.vx));
    super.tick();
  }

  touched(e, dir) {
    if (e === user) {
      user.kill();
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

function LoadPalette() {
  var x = 0;
  var y = 0;
  var scale = 64;
  palette.push(new LavaEntity(x, y, 'lava'));  x += scale;
  palette.push(new BlockEntity(x, y, 'dirt5'));  x += scale;
  palette.push(new BlockEntity(x, y, 'dirt4'));  x += scale;
  palette.push(new LavaEntity(x, y, 'spikes'));  x += scale;
  palette.push(new Decoration(x, y, 'arrow'));  x += scale;
  palette.push(new Decoration(x, y, 'shrub1'));  x += scale;
  palette.push(new Decoration(x, y, 'shrub2'));  x += scale;
  palette.push(new Decoration(x, y, 'flower1'));  x += scale;
  palette.push(new FlippedDecoration(x, y, 'arrow'));  x += scale;
  palette.push(new BounceEntity(x, y, 'bounce'));  x += scale;
  palette.push(new BlockEntity(x, y, 'shrub1'));  x += scale;
  palette.push(new BlockEntity(x, y, 'shrub2'));  x += scale;
  palette.push(new TurfEntity(x, y, 'grass2'));  x += scale;
  palette.push(new TurfEntity(x, y, 'block'));  x += scale;
  palette.push(new EndEntity(x, y, 'end'));  x += scale;
  palette.push(new WolfEntity(x, y, 'wolf'));  x += scale;
  palette.forEach(e => e.setSize(64, 64));
  selection = palette[0];
}   

function LoadLevel(levelNum) {
  currentLevel = levelNum;
  const scale = 256;
  var items = LEVELS[levelNum];
  entities = [];
  for (var j = 0; j < items.length; ++j) {
    var y = j * scale;
    for (var i = 0; i < items[j].length; ++i) {
      var x = i * scale;
      var ch = items[j][i];
      switch (ch) {
        case 'L':
          entities.push(new LavaEntity(x, y, 'lava'));
          break;
        case 'b':
          entities.push(new BlockEntity(x, y, 'dirt5'));
          break;
        case 'D':
          entities.push(new BlockEntity(x, y, 'dirt4'));
          break;
        case 's':
          entities.push(new LavaEntity(x, y, 'spikes'));
          break;
        case 'A':
          entities.push(new Decoration(x, y, 'arrow'));
          break;
        case '1':
          entities.push(new Decoration(x, y, 'shrub1'));
          break;
        case '2':
          entities.push(new Decoration(x, y, 'shrub2'));
          break;
        case 'f':
          entities.push(new Decoration(x, y + 128, 'flower1').setSize(128, 128));
          break;
        case 'F':
          entities.push(new FlippedDecoration(x, y, 'arrow'));
          break;
        case 'B':
          entities.push(new BounceEntity(x, y, 'bounce'));
          break;
        case '3':
          entities.push(new BlockEntity(x, y, 'shrub1'));
          break;
        case '4':
          entities.push(new BlockEntity(x, y, 'shrub2'));
          break;
        case 'G':
          entities.push(new TurfEntity(x, y, 'grass2'));
          break;
        case '#':
          entities.push(new TurfEntity(x, y, 'block'));
          break;
        case 'S':
          user = new PigEntity(x, y, 'pig').setSize(225, 180);
          entities.push(user);
          break;
        case 'E':
          entities.push(new EndEntity(x, y, 'end'));
          break;
        case 'W':
          entities.push(new WolfEntity(x, y, 'wolf').setSize(225, 180));
          break;
      }
    }
  }
}

function Tick() {
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

  ctx.restore();

  // Draw status
  ctx.font = '40px san-serif';
  ctx.fillStyle = '#000';
  ctx.fillText('Cannonballs: ' + user.cannonballs, 22, 102);
  ctx.fillStyle = '#ff0';
  ctx.fillText('Cannonballs: ' + user.cannonballs, 20, 100);

  if (paletteOpen) {
    // Draw palette
    for (var i = 0; i < palette.length; ++i) {
      palette[i].draw();
    }
    selection.highlight();
  }
}

window.onkeydown = function(e) {
  if (e.keyCode == 37) {
    joystick[0] = 1;
  } else if (e.keyCode == 39) {
    joystick[1] = 1;
  } else if (e.keyCode == 38) {
    joystick[2] = 1; 
  } else if (e.keyCode == 40) {
    joystick[3] = 1;
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
  } else if (e.keyCode == 16) {
    user.shoot();
  } else if (e.keyCode == 80) {
    paletteOpen = !paletteOpen;
  }
};

window.onmousedown = function(e) {
  if (paletteOpen) {
    for (var i = 0; i < palette.length; ++i) {
      if (palette[i].inside(e.clientX, e.clientY)) {
        selection = palette[i];
        return;
      }
    }
  }
  const scale = 256;
  var p = new DOMPoint(e.clientX, e.clientY);
  var tp = p.matrixTransform(worldTransform);
  var x = Math.floor(tp.x / scale) * scale;
  var y = Math.floor(tp.y / scale) * scale;
  var e = Object.assign(Object.create(Object.getPrototypeOf(selection)), selection);
  e.x = x;
  e.y = y;
  e.w = scale;
  e.h = scale;
  entities.push(e);
};

window.setInterval(Tick, 20);
window.onresize = Resize;
Resize();
LoadPalette();
LoadLevel(0);
