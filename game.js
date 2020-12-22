'use strict';

const FRICTION = 0.9;
const DAMPING = 0.7;
const LEVELS = [
  [
    'LLLLLLLLLLLLLLLLL',
    'L               L',
    'L               L',
    'L       #       L',
    'L S             L',
    'L ###           L',
    'L        LL#LLE L',
    'L               L',
    'L               L',
    'L     B         L',
    'LLLLLLLLLLLLLLLLL',
  ],
  [
    'LLLLLLLLLLLLLLL',
    'L             L',
    'L      S      L',
    'L  #L# # #L#  L',
    'L             L',
    'LB           BL',
    'L #LL#EE#LL#  L',
    'LLLLLLLLLLLLLLL',
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
var start;

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

  repel(e) {
    if (!this.intersect(e)) {
      return;
    }
    var left = e.x + e.w - this.x;
    var right = this.x + this.w - e.x;
    var up = e.y + e.h - this.y;
    var down = this.y + this.h - e.y;
    var options = [
      [left, -left, 0, -Math.abs(e.vx) * DAMPING, e.vy * FRICTION, 1],
      [right, right, 0, Math.abs(e.vx) * DAMPING, e.vy * FRICTION, 2],
      [up, 0, -up, e.vx * FRICTION, -Math.abs(e.vy) * DAMPING, 3],
      [down, 0, down, e.vx * FRICTION, Math.abs(e.vy) * DAMPING, 4],
    ];
    options.sort(function(a, b) { return a[0] - b[0]; });
    e.adjust(options[0][1], options[0][2]);
    e.vx = options[0][3];
    e.vy = options[0][4];
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    var img = document.getElementById(this.shape);
    if (this.vx < 0) {
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
}

class BlockEntity extends Entity {
  tick() {
  }

  adjust(x, y) {
  }
}

class LavaEntity extends BlockEntity {
  repel(e) {
    if (e === user && this.intersect(e)) {
      user.x = start[0];
      user.y = start[1];
      user.vx = 0;
      user.vy = 0;
    }
  }
}

class BounceEntity extends BlockEntity {
  repel(e) {
    if (e === user && this.intersect(e)) {
      user.vy = -25;
    }
  }
}

class EndEntity extends BlockEntity {
  repel(e) {
    if (e === user && this.intersect(e)) {
      LoadLevel(LEVELS[++level]);
    }
  }
}

function Resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function LoadLevel(level) {
  const scale = 256;
  entities = [];
  for (var j = 0; j < level.length; ++j) {
    for (var i = 0; i < level[j].length; ++i) {
      var ch = level[j][i];
      switch (ch) {
        case 'L':
          entities.push(new LavaEntity(i * scale, j * scale, scale, scale, 0, 0, 'lava'));
          break;
        case 'B':
          entities.push(new BounceEntity(i * scale, j * scale, scale, scale, 0, 0, 'bounce'));
          break;
        case '#':
          entities.push(new BlockEntity(i * scale, j * scale, scale, scale, 0, 0, 'block'));
          break;
        case 'S':
          user = new GravityEntity(i * scale, j * scale, 150, 120, 0, 0, 'pig');
          entities.push(user);
          start = [user.x, user.y];
          break;
        case 'E':
          entities.push(new EndEntity(i * scale, j * scale, scale, scale, 0, 0, 'end'));
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
    user.vx -= 0.4;
  } else if (e.keyCode == 39) {
    user.vx += 0.4;
  } else if (e.keyCode == 38) {
    user.vy -= 0.4;
  } else if (e.keyCode == 40) {
    user.vy += 0.4;
  }
};

window.setInterval(Tick, 30);
window.onresize = Resize;
Resize();
LoadLevel(LEVELS[level]);
