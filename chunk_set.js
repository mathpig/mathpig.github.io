'use strict';

const CHUNK_AREA = 4;

class ChunkSet {
  constructor(seed) {
    this.seed = seed;
    this.chunks = {};
    this.active_chunks = {};
    this.render_chunks = {};
    this.pending_chunks = {};
    this.chunk_loader = new Worker('chunk_loader.js');
    var self = this;
    this.chunk_loader.onmessage = function(e) {
      var chunk = new Chunk();
      chunk.unpack(e.data);
      var cx = Math.floor(chunk.x / CHUNK_WIDTH);
      var cy = Math.floor(chunk.y / CHUNK_HEIGHT);
      var id = cx + ':' + cy;
      self.chunks[id] = chunk;
      delete self.pending_chunks[id];
    };
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

    // Update Active Chunks
    var new_chunks = {};
    for (var i = -CHUNK_AREA; i < CHUNK_AREA; ++i) {
      for (var j = -CHUNK_AREA; j < CHUNK_AREA; ++j) {
        var cx = xx + i;
        var cy = yy + j;
        var id = cx + ':' + cy;
        if (this.chunks[id]) {
          new_chunks[id] = this.chunks[id];
        } else if (!this.pending_chunks[id]) {
          var chunk = new Chunk(seed, cx * CHUNK_WIDTH, cy * CHUNK_HEIGHT);
          this.chunk_loader.postMessage(chunk.pack());
          this.pending_chunks[id] = true;
        }
      }
    }
    this.active_chunks = new_chunks;

    // Update RenderChunks
    var new_render_chunks = {};
    for (var id in this.active_chunks) {
      var chunk = this.active_chunks[id];
      var num_dirty = chunk.countDirty();
      new_render_chunks[id] = chunk.update(ctx, workleft);
      workleft -= num_dirty;
    }
    this.render_chunks = new_render_chunks;
  }
}
