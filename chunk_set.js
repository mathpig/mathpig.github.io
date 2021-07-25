'use strict';

const CHUNK_AREA = 4;

class ChunkSet {
  constructor(seed) {
    this.seed = seed;
    this.chunks = {};
    this.render_chunks = {};
  }

  render(ctx, program, picking) {
    for (var id in this.render_chunks) {
      var rchunks = this.render_chunks[id];
      for (var i = 0; i < rchunks.length; ++i) {
        rchunks[i].render(ctx, program, picking);
      }
    }
  }

  update(ctx, x, y, z) {
    x = -x;
    y = -y;
    x /= 1.5;
    y = (y - x * Math.sqrt(3) / 2) / Math.sqrt(3);
    var xx = Math.floor(x / CHUNK_WIDTH);
    var yy = Math.floor(y / CHUNK_HEIGHT);

    var workleft = 1;

    // Update Chunks
    var new_chunks = {};
    for (var i = -CHUNK_AREA; i < CHUNK_AREA; ++i) {
      for (var j = -CHUNK_AREA; j < CHUNK_AREA; ++j) {
        var cx = xx + i;
        var cy = yy + j;
        var id = cx + ':' + cy;
        if (this.chunks[id]) {
          new_chunks[id] = this.chunks[id];
        } else {
          if (workleft > 0) {
            new_chunks[id] = new Chunk(seed, cx * CHUNK_WIDTH, cy * CHUNK_HEIGHT);
            workleft--;
          }
        }
      }
    }
    this.chunks = new_chunks;

    // Update RenderChunks
    var new_render_chunks = {};
    for (var id in this.chunks) {
      var chunk = this.chunks[id];
      if (this.render_chunks[id]) {
        new_render_chunks[id] = this.render_chunks[id];
      } else {
        if (workleft > 0) {
          new_render_chunks[id] = chunk.updateAll(ctx);
          workleft--;
        }
      }
    }
    this.render_chunks = new_render_chunks;
  }
}
