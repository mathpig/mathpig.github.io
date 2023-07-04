'use strict';

function interpolate(a0, a1, w) {
  if (w < 0) {
    return a0;
  }
  if (w > 1) {
    return a1;
  }
  return ((a1 - a0) * w + a0);
}

function fmod(a, b) {
  var t = Math.floor(a / b);
  return (a - t * b);
}

function randomGradient(ix, iy) {
  var a = ((ix + iy * 5102794 + 12740143354) % 1204394357214);
  var b = ((ix * 5129873645 + iy * 1249438234) % 61436125467);
  var c = ((a * 3124689 + b * 51234635129478) % 610927456124);
  c = (c ^ a ^ b);
  var r = fmod(c, Math.PI * 2);
  return [Math.cos(r), Math.sin(r)];
}

function dotGridGradient(ix, iy, x, y) {
  var gradient = randomGradient(ix, iy);

  var dx = (x - ix);
  var dy = (y - iy);

  return (dx * gradient[0] + dy * gradient[1]);
}

function perlin(x, y) {
  var x0 = floor(x);
  var x1 = (x0 + 1);

  var y0 = floor(y);
  var y1 = (y0 + 1);

  var sx = (x - x0);
  var sy = (y - y0);

  var n0 = dotGridGradient(x0, y0, x, y);
  var n1 = dotGridGradient(x1, y0, x, y);
  var ix0 = interpolate(n0, n1, sx);

  var n0 = dotGridGradient(x0, y1, x, y);
  var n1 = dotGridGradient(x1, y1, x, y);
  var ix1 = interpolate(n0, n1, sx);

  return interpolate(ix0, ix1, sy);
}
