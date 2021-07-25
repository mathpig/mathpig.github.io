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

  change(i, j, k, value) {
    var cx = Math.floor(i / CHUNK_WIDTH);
    var cy = Math.floor(j / CHUNK_HEIGHT);
    var id = cx + ':' + cy;
    var chunk = this.chunks[id];
    if (chunk === undefined) {
      return;
    }
    chunk.change(i - cx * CHUNK_WIDTH, j - cy * CHUNK_HEIGHT, k, value);
  }

  update(ctx, player) {
    var [x, y, z] = player.hexGrid();

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
      var num_dirty = chunk.countDirty();
      new_render_chunks[id] = chunk.update(ctx, workleft);
      workleft -= num_dirty;
    }
    this.render_chunks = new_render_chunks;
  }
}
