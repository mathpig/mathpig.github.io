'use strict';

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = 10;
    this.frame = 0;
    this.width = 80;
    this.height = 40;
    this.direction = 1;
    this.name = [];
    this.walking = [];
    this.standing = [];
    this.labelColor = "blue";
    this.labelTextColor = "yellow";
  }

  setWalking(walking) {
    this.walking = walking;
    return this;
  }

  setStanding(standing) {
    this.standing = standing;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  tick() {
    var oldX = this.x;
    var oldY = this.y;
    this.x += this.vx;
    if (tileAt(this.x, this.y).solid) {
      this.x = oldX;
    }
    this.y += this.vy;
    if (tileAt(this.x, this.y).solid) {
      this.y = oldY;
    }
    this.frame += 0.2;
  }

  draw() {
    var anim;
    if (this.walking.length > 0 && (this.vx != 0 || this.vy != 0)) {
      anim = this.walking;
    }
    else {
      anim = this.standing;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    var f = Math.floor(this.frame) % anim.length;
    if (this.direction < 0) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(anim[f], -this.width / 2, -this.height, this.width, this.height);
    ctx.restore();
  }

  drawLabel() { 
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.font = "20px arial";
    ctx.textAlign = "center"; 
    var max_width = 0;
    for (var i = 0; i < this.name.length; ++i) {
      max_width = Math.max(max_width, ctx.measureText(this.name[i]).width);
    }
    max_width += 10;
    ctx.fillStyle = this.labelColor;
    ctx.fillRect(-max_width / 2, 5,
                 max_width, this.name.length * 20 + 10);
    for (var i = 0; i < this.name.length; ++i) {
      ctx.fillStyle = this.labelTextColor;
      ctx.fillText(this.name[i], 0, 25 + 20 * i);
    }
    ctx.restore();
  }

  distance(other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Player extends Entity {
  constructor() {
    super();
    this.setWalking([pig0, pig1, pig2, pig3]);
    this.setStanding([pig4]);
    this.setSize(80, 40);
    this.name = ["Gaius", "Porcius", "Symphoniacus"];
    this.labelColor = "orange";
    this.labelTextColor = "purple";
  }

  tick() {
    this.vx = 0;
    this.vy = 0;
    if (keySet["ArrowLeft"]) {
      this.direction = -1;
      this.vx -= this.speed;
    }
    if (keySet["ArrowRight"]) {
      this.direction = 1;
      this.vx += this.speed;
    }
    if (keySet["ArrowUp"]) {
      this.vy -= this.speed;
    }
    if (keySet["ArrowDown"]) {
      this.vy += this.speed;
    }
    super.tick();
  }
}

class Bather extends Entity {
  constructor() {
    super();
    this.speed = 5;
    this.setWalking([pig0, pig1, pig2, pig3]);
    this.setStanding([pig4]);
    this.setSize(80, 40);
    this.timeout = 0;
    this.goX = 0;
    this.goY = 0;
    this.name = randomName();
  }

  tick() {
    this.timeout--;
    if (this.timeout <= 0) {
      if (Math.random() > 0.8) {
        var val = Math.random();
        var speed = this.speed + Math.random() * this.speed / 5;
        this.goX = Math.cos(val * Math.PI * 2) * speed;
        this.goY = Math.sin(val * Math.PI * 2) * speed;
      }
      else {
        this.goX = 0;
        this.goY = 0;
      }
      this.timeout = Math.random() * 40 + 80;
    }
    this.vx = this.goX;
    this.vy = this.goY;
    if (this.vx != 0) {
      this.direction = this.goX;
    }
    super.tick();
  }
}

class Goal extends Bather {
  constructor() {
    super();
    this.name = ["Marcus", "Aurelius", "Severus", "Alexander"];
    this.labelColor = "green";
  }
}

class Cop extends Entity {
  constructor() {
    super();
    this.speed = 7;
    this.setWalking([wolf0, wolf1, wolf2, wolf3]);
    this.setStanding([wolf4]);
    this.setSize(80, 40);
    this.timeout = 0;
    this.goX = 0;
    this.goY = 0;
    this.name = randomName();
  }

  tick() {
    this.timeout--;
    if (this.timeout <= 0) {
      if (Math.random() > 0.5) {
        if (this.distance(player) < (screen.width * 2)) {
          var ang = Math.atan2(player.y - this.y, player.x - this.x); 
        }
        else {
          var ang = Math.random() * Math.PI * 2;
        }
        var speed = this.speed + Math.random() * this.speed / 5;
        this.goX = Math.cos(ang) * speed;
        this.goY = Math.sin(ang) * speed;
      }
      else {
        this.goX = 0;
        this.goY = 0;
      }
      this.timeout = Math.random() * 40 + 80;
    }
    this.vx = this.goX;
    this.vy = this.goY;
    if (this.vx != 0) {
      this.direction = -this.goX;
    }
    super.tick();
  }
}
