'use strict';

function Noise(seed, w, x, y, z) {
  return Math.cos(101027 * (Math.cos(seed * 102763 + w * 101477 + x * 103979 +
                            y * 102293 + z * 102101 + 104053) +
                            Math.sin(seed * 101537 + w * 103553 + x * 102503 +
                            y * 102259 + z * 101641 + 100927))) * 0.5 + 0.5;
}

function LodNoise(seed, lod, x, y, z) {
  var x0 = Math.floor(x / lod) * lod;
  var x1 = x0 + lod;
  var tx = (x - x0) / lod;
  var y0 = Math.floor(y / lod) * lod;
  var y1 = y0 + lod;
  var ty = (y - y0) / lod;
  var z0 = Math.floor(z / lod) * lod;
  var z1 = z0 + lod;
  var tz = (z - z0) / lod;
  return Noise(seed, lod, x0, y0, z0) * (1 - tx) * (1 - ty) * (1 - tz) +
         Noise(seed, lod, x0, y0, z1) * (1 - tx) * (1 - ty) * tz +
         Noise(seed, lod, x0, y1, z0) * (1 - tx) * ty * (1 - tz) +
         Noise(seed, lod, x0, y1, z1) * (1 - tx) * ty * tz +
         Noise(seed, lod, x1, y0, z0) * tx * (1 - ty) * (1 - tz) +
         Noise(seed, lod, x1, y0, z1) * tx * (1 - ty) * tz +
         Noise(seed, lod, x1, y1, z0) * tx * ty * (1 - tz) +
         Noise(seed, lod, x1, y1, z1) * tx * ty * tz;
}

function ValueNoise(seed, lods, x, y, z) {
  var total = 0;
  for (var i = 1; i < lods; i *= 2) {
    total += LodNoise(seed, i, x, y, z) * i / lods;
  }
  return total;
}

function ToTexture(width, height, f) {
  var data = new Uint8Array(width * height);
  var pos = 0;
  for (var j = 0; j < height; j++) {
    for (var i = 0; i < width; i++) {
      var val = f(i, j);
      var pval = Math.floor(val * 128 + 128);
      data[pos++] = pval;
    }
  }
  return data;
}

function NoiseTexture(width, height, seed) {
  return ToTexture(width, height, (x, y) => Noise(seed, x, y, 0, 0));
}

function LodNoiseTexture(width, height, seed, lod) {
  return ToTexture(width, height, (x, y) => LodNoise(seed, lod, x, y, 0));
}

function ValueNoiseTexture(width, height, seed, lods) {
  return ToTexture(width, height, (x, y) => ValueNoise(seed, lods, x, y, 0));
}
