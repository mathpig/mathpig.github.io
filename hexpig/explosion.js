'use strict';

const AVERAGE_BLAST_RADIUS = 5;
const GRASS_BLAST_RESISTANCE = 0.2;
const ROCK_BLAST_RESISTANCE = 0.7;
const LAVA_BLAST_RESISTANCE = 0.85;

//const NUM_BLOCKS = 5;
//const BLOCKS = [AIR, GRASS, ROCK, LAVA, BEDROCK];
//const REGULARNESS = 10;

function Distance(x1, y1, z1, x2, y2, z2) {
  var dx = x1 - x2;
  var dy = y1 - y2;
  var dz = z1 - z2;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function Explode(chunk_set, tx, ty, tz) {
  var blast_radius = Math.floor(Math.random() * (AVERAGE_BLAST_RADIUS + 1)) +
                     Math.floor(Math.random() * (AVERAGE_BLAST_RADIUS + 1));
  for (var x = tx - blast_radius; x <= tx + blast_radius; ++x) {    
    for (var y = ty - blast_radius; y <= ty + blast_radius; ++y) {
      for (var z = tz - blast_radius; z <= tz + blast_radius; ++z) {
        var block = chunk_set.get(x, y, z);
        if (block == AIR || block == BEDROCK) {
          continue;
        }
        var distance = Distance(x, y, z, tx, ty, tz);
        if (distance > blast_radius) {
          continue;
        }
        for (var n = 1; n < 2 * AVERAGE_BLAST_RADIUS; ++n) {
          if (distance <= blast_radius / n) {
            var blast_strength = n;
            break;
          }
        }
        if (block == GRASS && Math.random() >= GRASS_BLAST_RESISTANCE / blast_strength) {
          chunk_set.change(x, y, z, AIR);
        }
        if (block == ROCK && Math.random() >= ROCK_BLAST_RESISTANCE / blast_strength) {
          chunk_set.change(x, y, z, AIR);
        }
        if (block == LAVA && Math.random() >= LAVA_BLAST_RESISTANCE / blast_strength) {
          chunk_set.change(x, y, z, AIR);
        }
//          chunk_set.change(x, y, z, BLOCKS[Math.floor(Math.pow(Math.random(), REGULARNESS) * NUM_BLOCKS)]);
      }
    }
  }
}
