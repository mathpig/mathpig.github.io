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

function randomGradient(ix, iy) {
  var r = 101027 * (Math.cos(ix * 103979 + iy * 102293 + 104053) +
                    Math.sin(ix * 102503 + iy * 102259 + 100927));
  return [Math.cos(r), Math.sin(r)];
}

function dotGridGradient(ix, iy, x, y) {
  var gradient = randomGradient(ix, iy);

  var dx = (x - ix);
  var dy = (y - iy);

  return (dx * gradient[0] + dy * gradient[1]);
}

function perlin(x, y) {
  var x0 = Math.floor(x);
  var x1 = (x0 + 1);

  var y0 = Math.floor(y);
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
