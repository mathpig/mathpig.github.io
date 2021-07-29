'use strict';

const HOLE_PERCENTAGE = 1 / 3;

const CHUNK_WIDTH = 16;
const CHUNK_HEIGHT = 16;
const CHUNK_DEPTH = 128;
const GROUND_BASE = 64;
const GROUND_RANGE = 64;
const RENDER_CHUNKS_PER_CHUNK = 8;

const AIR = 0;
const ROCK = 1;
const GRASS = 2;
const LAVA = 3;
const BEDROCK = 4;

class Chunk {
  constructor(seed, x, y) {
    this.seed = seed;
    this.x = x;
    this.y = y;
    this.render_chunks = [];
    this.data = null;
  }

  pack() {
    return {
      seed: this.seed,
      x: this.x,
      y: this.y,
      data: this.data,
    }
  }

  unpack(message) {
    this.seed = message.seed;
    this.x = message.x;
    this.y = message.y;
    this.data = message.data;
  }

  set(i, j, k, value) {
    var pos = i + j * CHUNK_WIDTH + k * CHUNK_WIDTH * CHUNK_HEIGHT;
    this.data[pos] = value;
  }

  get(i, j, k) {
    if (i < 0 || i >= CHUNK_WIDTH ||
        j < 0 || j >= CHUNK_HEIGHT ||
        k < 0 || k >= CHUNK_DEPTH) {
      return AIR;
    }
    var pos = i + j * CHUNK_WIDTH + k * CHUNK_WIDTH * CHUNK_HEIGHT;
    return this.data[pos];
  }

  change(i, j, k, value) {
    if (i < 0 || i >= CHUNK_WIDTH ||
        j < 0 || j >= CHUNK_HEIGHT ||
        k < 0 || k >= CHUNK_DEPTH) {
      return;
    }
    this.set(i, j, k, value);
    var p = Math.floor(k / RENDER_CHUNK_DEPTH);
    this.render_chunks[p].setDirty();
    var q = k % RENDER_CHUNK_DEPTH;
    if (q == 0 && p > 0) {
      this.render_chunks[p - 1].setDirty();
    }
    if (q == RENDER_CHUNK_DEPTH - 1 && p < RENDER_CHUNKS_PER_CHUNK) {
      this.render_chunks[p + 1].setDirty();
    }
  }

  init() {
    var seed = this.seed;
    this.data = new Uint8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH);
    for (var i = 0; i < CHUNK_WIDTH; i++) {
      for (var j = 0; j < CHUNK_HEIGHT; j++) {
        var ground = Math.floor(ValueNoise(seed + 1, 64, i + this.x, j + this.y, 0) * GROUND_RANGE) + GROUND_BASE;
        var hit_ground = false;
        for (var k = CHUNK_DEPTH - 1; k >= 0; k--) {
          if (k == 0) {
            this.set(i, j, k, BEDROCK);
          } else if (k > ground) {
            this.set(i, j, k, AIR);
          } else {
            var t = ValueNoise(seed, 64, i + this.x, j + this.y, k);
            if (t <= HOLE_PERCENTAGE) {
              this.set(i, j, k, AIR);
            } else if (hit_ground) {
              this.set(i, j, k, ROCK);
            } else {
              this.set(i, j, k, GRASS);
              hit_ground = true;
            }
          }
        }
      }
    }
    this.cleanupFlecks();
  }

  cleanupFlecks() {
    for (var i = 0; i < CHUNK_WIDTH; i++) {
      for (var j = 0; j < CHUNK_HEIGHT; j++) {
        for (var k = 0; k < CHUNK_DEPTH; k++) {
          if (this.countNeighbours(i, j, k) === 0) {
            this.set(i, j, k, AIR);
          }
        }
      }
    }
  }

  countNeighbours(i, j, k) {
    var counter = 0;
    if (this.get(i, j, k + 1) !== AIR) {
      counter++;
    }
    if (this.get(i, j, k - 1) !== AIR) {
      counter++;
    }
    if (this.get(i + 1, j, k) !== AIR) {
      counter++;
    }
    if (this.get(i - 1, j, k) !== AIR) {
      counter++;
    }
    if (this.get(i, j + 1, k) !== AIR) {
      counter++;
    }
    if (this.get(i, j - 1, k) !== AIR) {
      counter++;
    }
    if (this.get(i + 1, j - 1, k) !== AIR) {
      counter++;
    }
    if (this.get(i - 1, j + 1, k) !== AIR) {
      counter++;
    }
    return counter;
  }

  countDirty() {
    var count = 0;
    for (var i = 0; i < RENDER_CHUNKS_PER_CHUNK; ++i) {
      if (this.render_chunks[i] === undefined ||
          this.render_chunks[i].isDirty()) {
        count++;
      }
    }
    return count;
  }

  update(ctx, workload) {
    for (var i = 0; i < RENDER_CHUNKS_PER_CHUNK; ++i) {
      if (this.render_chunks[i] === undefined) {
        this.render_chunks[i] = new RenderChunk();
      }
      if (workload > 0 && this.render_chunks[i].isDirty()) {
        this.render_chunks[i].update(ctx, this, i);
        workload--;
      }
    }
    return this.render_chunks;
  }
}
