'use strict';

const BLAST_RADIUS = 5;

function Distance(x1, y1, z1, x2, y2, z2) {
  var dx = x1 - x2;
  var dy = y1 - y2;
  var dz = z1 - z2;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function Explode(chunk_set, tx, ty, tz) {
  for (var x = tx - BLAST_RADIUS; x <= tx + BLAST_RADIUS; ++x) {    
    for (var y = ty - BLAST_RADIUS; y <= ty + BLAST_RADIUS; ++y) {
      for (var z = tz - BLAST_RADIUS; z <= tz + BLAST_RADIUS; ++z) {
        if (Distance(x, y, z, tx, ty, tz) <= BLAST_RADIUS) {
          chunk_set.change(x, y, z, AIR);
        }
      }
    }
  }
}
