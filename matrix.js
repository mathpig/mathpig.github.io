'use strict';

class Matrix {
  constructor() {
    this.m = [1, 0, 0, 0,
              0, 1, 0, 0,
              0, 0, 1, 0,
              0, 0, 0, 1];
  }

  array() {
    var a = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        a.push(this.m[i + j * 4]);
      }
    }
    return new Float32Array(a);
  }

  multiply(o) {
    var r = new Matrix();
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var total = 0;
        for (var k = 0; k < 4; k++) {
          total += this.m[k + j * 4] * o.m[i + k * 4];
        }
        r.m[i + j * 4] = total;
      }
    }
    return r;
  }

  static identity() {
    return new Matrix();
  }

  static translate(x, y, z) {
    var r = new Matrix();
    r.m = [1, 0, 0, x,
           0, 1, 0, y,
           0, 0, 1, z,
           0, 0, 0, 1];
    return r;
  }

  static rotateX(theta) {
    var c = Math.cos(theta * Math.PI / 180);
    var s = Math.sin(theta * Math.PI / 180);
    var r = new Matrix();
    r.m = [1, 0, 0 , 0,
           0, c, -s, 0,
           0, s, c , 0,
           0, 0, 0 , 1];
    return r;
  }

  static rotateY(theta) {
    var c = Math.cos(theta * Math.PI / 180);
    var s = Math.sin(theta * Math.PI / 180);
    var r = new Matrix();
    r.m = [c , 0, s, 0,
           0 , 1, 0, 0,
           -s, 0, c, 0,
           0 , 0, 0, 1];
    return r;
  }

  static rotateZ(theta) {
    var c = Math.cos(theta * Math.PI / 180);
    var s = Math.sin(theta * Math.PI / 180);
    var r = new Matrix();
    r.m = [c, -s, 0, 0,
           s, c,  0, 0,
           0, 0,  1, 0,
           0, 0,  0, 1];
    return r;
  }

  static scale(x, y, z) {
    var r = new Matrix();
    r.m = [x, 0, 0, 0,
           0, y, 0, 0,
           0, 0, z, 0,
           0, 0, 0, 1];
    return r;
  }

  static frustrum(l, r, b, t, n, f) {
    var ret = new Matrix();
    ret.m = [2 * n / (r - l), 0              , (r + l) / (r - l) , 0                   ,
             0              , 2 * n / (t - b), (t + b) / (t - b) , 0                   ,
             0              , 0              , -(f + n) / (f - n), -2 * f * n / (f - n),
             0              , 0              , -1                , 0                   ];
    return ret;
  }

  static perspective(fov, aspect, near, far) {
    var rfov = fov * Math.PI / 180;
    var t = Math.tan(rfov / 2);
    return Matrix.frustrum(-near * t * aspect, near * t * aspect,
                           -near * t         , near * t         ,
                           near              , far              );
  }

  static pixelPerspective(fov, near, far, x, y, w, h) {
    var aspect = w / h;
    var rfov = fov * Math.PI / 180;
    var t = Math.tan(rfov / 2);
    var vl = -near * t * aspect;
    var vr = near * t * aspect;
    var vb = -near * t;
    var vt = near * t;
    var chunk_width = (vr - vl) / w;
    var chunk_height = (vt - vb) / h;
    var left = vl + x * chunk_width;
    var right = left + chunk_width;
    var bottom = vb + y * chunk_height;
    var top = bottom + chunk_height;
    return Matrix.frustrum(left, right, bottom, top, near, far);
  }
}
