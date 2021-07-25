'use strict';

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = -108;
    this.direction = 0;

    this.left = false;
    this.right = false;
    this.forward = false;
    this.backward = false;
    this.inward = false;
    this.outward = false;
  }

  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  cameraTransform() {
    var mvtrans =
      Matrix.identity()
      .multiply(Matrix.rotateX(-90))
      .multiply(Matrix.rotateZ(this.direction))
      .multiply(Matrix.translate(this.x, this.y, this.z));
    return mvtrans;
  }

  tick() {
    if (this.left) {
      this.direction -= 1;
    }
    if (this.right) {
      this.direction += 1;
    }
    var dir = -this.direction - 90;
    if (this.forward) {
      this.x += Math.cos(dir * Math.PI / 180) * 0.25;
      this.y += Math.sin(dir * Math.PI / 180) * 0.25;
    }
    if (this.backward) {
      this.x -= Math.cos(dir * Math.PI / 180) * 0.25;
      this.y -= Math.sin(dir * Math.PI / 180) * 0.25;
    }
    if (this.inward) {
      this.z -= 0.1;
    }
    if (this.outward) {
      this.z += 0.1;
    }
  }

  keyDown(e) {
    if (e.code == 'KeyA') {
      this.left = true;
    } else if (e.code == 'KeyD') {
      this.right = true;
    } else if (e.code == 'KeyW') {
      this.forward = true;
    } else if (e.code == 'KeyS') {
      this.backward = true;
    } else if (e.code == 'KeyQ') {
      this.inward = true;
    } else if (e.code == 'KeyE') {
      this.outward = true;
    }
  }

  keyUp(e) {
    if (e.code == 'KeyA') {
      this.left = false;
    } else if (e.code == 'KeyD') {
      this.right = false;
    } else if (e.code == 'KeyW') {
      this.forward = false;
    } else if (e.code == 'KeyS') {
      this.backward = false;
    } else if (e.code == 'KeyQ') {
      this.inward = false;
    } else if (e.code == 'KeyE') {
      this.outward = false;
    }
  }

  hexCoord() {
    var x = -this.x;
    var y = -this.y;
    x /= 1.5;
    y = (y - x * Math.sqrt(3) / 2) / Math.sqrt(3);
    return [x, y, this.z];
  }

  hexGrid() {
    var [x, y, z] = this.hexCoord();
    var xx = Math.floor(x);
    var yy = Math.floor(y);
    var zz = Math.floor(z);
    return [xx, yy, zz];
  }

  getUniformXY() {
    return [-this.x, -this.y];
  }

  findClick(picked) {
    var [x, y, z] = this.hexGrid();
    var px = picked[0];
    var py = picked[1];
    var rx = Math.floor(x / 256);
    var ry = Math.floor(y / 256);
    var mx = x - rx * 256;
    var my = y - ry * 256;
    var dx = px - mx;
    var dy = py - my;
    if (dx < -128) {
      dx += 256;
    }
    else if (dx > 127) {
      dx -= 256;
    }
    if (dy < -128) {
      dy += 256;
    }
    else if (dy > 127) {
      dy -= 256;
    }
    var cx = dx + x;
    var cy = dy + y;
    return [cx, cy, picked[2]];
  }
}
