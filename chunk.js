'use strict';

const FILL_PERCENTAGE = 2 / 5;

const CHUNK_WIDTH = 16;
const CHUNK_HEIGHT = 16;
const CHUNK_DEPTH = 128;
const GROUND_BASE = 64;
const GROUND_RANGE = 32;
const RENDER_CHUNKS_PER_CHUNK = 8;

const AIR = 0;
const ROCK = 1;
const GRASS = 2;

class Chunk {
  constructor(seed, x, y) {
    this.seed = seed;
    this.x = x;
    this.y = y; 
    this.data = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH);
    this.init();
  }

  init() {
    var pos = 0;
    for (var i = 0; i < CHUNK_WIDTH; i++) {
      for (var j = 0; j < CHUNK_HEIGHT; j++) {
        var ground = Math.floor(ValueNoise(seed + 1, 64, i, j, 0) * GROUND_RANGE) + GROUND_BASE;
        for (var k = 0; k < CHUNK_DEPTH; k++) {
          if (k > ground) {
            this.set(i, j, k, AIR);
          } else if (k === ground) {
            this.set(i, j, k, GRASS);
          } else {
            var t = ValueNoise(seed, 64, i, j, k);
            if (t <= FILL_PERCENTAGE) {
              this.set(i, j, k, AIR);
            } else {
              this.set(i, j, k, ROCK);
            }
          }
          ++pos;
        }
      }
    }
  }

  set(i, j, k, value) {
    var pos = i + j * CHUNK_WIDTH + k * CHUNK_WIDTH * CHUNK_HEIGHT;
    this.data[pos] = value;
  }

  get(i, j, k) {
    var pos = i + j * CHUNK_WIDTH + k * CHUNK_WIDTH * CHUNK_HEIGHT;
    return this.data[pos];
  }

  updateAll(ctx) {
    var render_chunks = [];
    for (var i = 0; i < RENDER_CHUNKS_PER_CHUNK; ++i) {
      var render_chunk = new RenderChunk();
      render_chunk.update(ctx, chunk, i);
      render_chunks.push(render_chunk);
    }
    return render_chunks;
  }
}
