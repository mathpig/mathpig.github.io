'use strict';

const FRICTION = 0.95;
const DAMPING = 0.4;
const DELTA = 0.1;
const LEVELS = [
  [
    'LLLLLLLLLLLLLLLLL',
    'L               L',
    'L               L',
    'L       #       L',
    'L S             L',
    'L ###           L',
    'L        L # LE L',
    'L               L',
    'L               L',
    'L     B         L',
    'LLLLLLLLLLLLLLLLL',
  ],
  [
    'LLLLLLLLLLLLLLL',
    'L             L',
    'L      S      L',
    'L  #  ###  #  L',
    'L   LL   LL   L',
    'L             L',
    'LB           BL',
    'L  #  #E#  #  L',
    'LLLLLLLLLLLLLLL',
  ],
  [
    'LLLLLLLLLLLLLLLLLLLLL',
    'L                   L',
    'L                   L',
    'L S     #W       #  L',
    'L##  #  ##########  L',
    'L  LL LL            L',
    'L                   L',
    'L                   L',
    'L  #W      #        L',
    'L  #########  #  #LLL',
    'L           LL LL   L',
    'L                   L',
    'L                   L',
    'L                   L',
    'L  #W #             L',
    'L  ####   E         L',
    'LLLLLLLLLL#LLLLLLLLLL',
  ],
  [
    '###',
    '#S#',
    '###',
  ],
];

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var entities = [];
var user;
var level = 0;
var joystick = [0, 0, 0, 0];

class Entity {
  constructor(x, y, w, h, vx, vy, shape) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = vx;
    this.vy = vy;
    this.shape = shape;
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
    var img = document.getElementById(this.shape);
    //ctx.fillStyle = '#f00';
    //ctx.fillRect(this.x, this.y, this.w, this.h);
    if (this.facing() < 0) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(img, -this.x - this.w, this.y, this.w, this.h);
      ctx.restore();
    } else {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    }
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
}

class CannonballEntity extends GravityEntity {
  constructor(x, y, w, h, vx, vy, shape) {
    super(x, y, w, h, vx, vy, shape);
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
  constructor(x, y, w, h, vx, vy, shape) {
    super(x, y, w, h, vx, vy, shape);
    this.direction = 1;
    this.jump_limit = 0;
  }

  kill() {
    LoadLevel(level);
  }

  facing() {
    return this.direction;
  }

  touchdown() {
    this.jump_limit = 0;
  }

  tick() {
    super.tick();
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

class LavaEntity extends BlockEntity {
  touched(e) {
    e.kill();
  }
}

class BounceEntity extends BlockEntity {
  touched(e) {
    if (e.bouncable()) {
      e.vy = -25;
    }
  }
}

class EndEntity extends BlockEntity {
  touched(e) {
    if (e === user) {
      LoadLevel(++level);
    }
  }
}

class WolfEntity extends GravityEntity {
  constructor(x, y, w, h, vx, vy, shape) {
    super(x, y, w, h, vx, vy, shape);
    this.direction = 1;
  }

  kill() {
    var index = entities.indexOf(this);
    if (index >= 0) {
      entities.splice(index, 1);
    }
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
    if (dir == 1) {
      this.direction = -1;
    }
    if (dir == 2) {
      this.direction = 1;
    }
  }
}

function Resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function LoadLevel(levelNum) {
  var level = LEVELS[levelNum];
  const scale = 256;
  entities = [];
  for (var j = 0; j < level.length; ++j) {
    var y = j * scale;
    for (var i = 0; i < level[j].length; ++i) {
      var x = i * scale;
      var ch = level[j][i];
      switch (ch) {
        case 'L':
          entities.push(new LavaEntity(x, y, scale, scale, 0, 0, 'lava'));
          break;
        case 'B':
          entities.push(new BounceEntity(x, y, scale, scale, 0, 0, 'bounce'));
          break;
        case '#':
          entities.push(new BlockEntity(x, y, scale, scale, 0, 0, 'block'));
          break;
        case 'S':
          user = new PigEntity(x, y, 150, 120, 0, 0, 'pig');
          entities.push(user);
          break;
        case 'E':
          entities.push(new EndEntity(x, y, scale, scale, 0, 0, 'end'));
          break;
        case 'W':
          entities.push(new WolfEntity(x, y, 225, 180, 0, 0, 'wolf'));
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

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(0.5, 0.5);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.translate(canvas.width / 2 - (user.x + user.w / 2), canvas.height / 2 - (user.y + user.h / 2));

  // Draw each entity
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }

  ctx.restore();
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
    entities.push(new CannonballEntity(user.x + user.w / 2 - 32 + user.direction * 30, user.y,
                                       64, 64, user.vx + user.direction * 30, user.vy - 10, 'cannonball'));
  } else if (e.keyCode == 221) {
    level = 2;
    LoadLevel(level);
  }
};

window.setInterval(Tick, 20);
window.onresize = Resize;
Resize();
LoadLevel(level);
