'use strict';

//const NUM_BLOCKS = 5;
//const BLOCKS = [AIR, GRASS, ROCK, LAVA, BEDROCK];

function Distance(x1, y1, z1, x2, y2, z2) {
  var dx = x1 - x2;
  var dy = y1 - y2;
  var dz = z1 - z2;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function Explode(chunk_set, tx, ty, tz) {
  var blast_radius = Math.floor(Math.random() * 6) +
                     Math.floor(Math.random() * 6);
  for (var x = tx - blast_radius; x <= tx + blast_radius; ++x) {    
    for (var y = ty - blast_radius; y <= ty + blast_radius; ++y) {
      for (var z = tz - blast_radius; z <= tz + blast_radius; ++z) {
/*        if (chunk.get(x, y, z) == BEDROCK) {
          continue;
        }*/
        if (Distance(x, y, z, tx, ty, tz) <= blast_radius &&
            Math.random() * 3 <= 2 ||
            Distance(x, y, z, tx, ty, tz) <= Math.floor(blast_radius / 2)) {
          chunk_set.change(x, y, z, AIR);
//          chunk_set.change(x, y, z, BLOCKS[Math.floor(Math.random() * NUM_BLOCKS)]);
        }
      }
    }
  }
}
