'use strict';

const RENDER_CHUNK_WIDTH = 16;
const RENDER_CHUNK_HEIGHT = 16;
const RENDER_CHUNK_DEPTH = 16;

class RenderChunk {
  constructor() {
    this.dirty = true;
    this.glbuffer = null;
    this.vertex_count = 0;
  }

  isDirty() {
    return this.dirty;
  }

  setDirty() {
    this.dirty = true;
  }

  static addPrism(buffer, x, y, z, color, faces) {
    const data = [
        -1, 0, 1 / 2,                       0,    0, 0.5,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,   0,    0.25, 1,
        -1 / 2, Math.sqrt(3) / 2, 1 / 2,    0,    0.25, 0,

        -1 / 2, Math.sqrt(3) / 2, 1 / 2,    0,    0.25, 0,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,   0,    0.25, 1,
        1 / 2, Math.sqrt(3) / 2, 1 / 2,     0,    0.75, 0,

        1 / 2, Math.sqrt(3) / 2, 1 / 2,     0,    0.75, 0,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,   0,    0.25, 1,
        1, 0, 1 / 2,                        0,    1, 0.5,

        1, 0, 1 / 2,                        0,   1, 0.5,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,   0,   0.25, 1,
        1 / 2, -Math.sqrt(3) / 2, 1 / 2,    0,   0.75, 1,


        -1, 0, -1 / 2,                      1,   1, 0.5,
        -1 / 2, Math.sqrt(3) / 2, -1 / 2,   1,   0.75, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,  1,   0.75, 1,

        -1 / 2, Math.sqrt(3) / 2, -1 / 2,   1,   0.75, 0,
        1 / 2, Math.sqrt(3) / 2, -1 / 2,    1,   0.25, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,  1,   0.75, 1,

        1 / 2, Math.sqrt(3) / 2, -1 / 2,    1,   0.25, 0,
        1, 0, -1 / 2,                       1,   0, 0.5,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,  1,   0.75, 1,

        1, 0, -1 / 2,                       1,   0, 0.5,
        1 / 2, -Math.sqrt(3) / 2, -1 / 2,   1,   0.25, 1,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,  1,   0.75, 1,


        -1, 0, 1 / 2,                       2,   1, 0,
        -1 / 2, Math.sqrt(3) / 2, 1 / 2,    2,   0, 0,
        -1 / 2, Math.sqrt(3) / 2, -1 / 2,   2,   0, 1,

        -1 / 2, Math.sqrt(3) / 2, -1 / 2,   2,   0, 1,
        -1, 0, -1 / 2,                      2,   1, 1,
        -1, 0, 1 / 2,                       2,   1, 0,


        -1, 0, 1 / 2,                       3,   0, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,  3,   1, 1,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,   3,   1, 0,

        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,  3,   1, 1,
        -1, 0, 1 / 2,                       3,   0, 0,
        -1, 0, -1 / 2,                      3,   0, 1,


        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,   4,   0, 0,
        1 / 2, -Math.sqrt(3) / 2, -1 / 2,   4,   1, 1,
        1 / 2, -Math.sqrt(3) / 2, 1 / 2,    4,   1, 0,

        1 / 2, -Math.sqrt(3) / 2, -1 / 2,   4,   1, 1,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,   4,   0, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,  4,   0, 1,


        1, 0, 1 / 2,                        5,   1, 0,
        1 / 2, -Math.sqrt(3) / 2, 1 / 2,    5,   0, 0,
        1 / 2, -Math.sqrt(3) / 2, -1 / 2,   5,   0, 1,

        1 / 2, -Math.sqrt(3) / 2, -1 / 2,   5,   0, 1,
        1, 0, -1 / 2,                       5,   1, 1,
        1, 0, 1 / 2,                        5,   1, 0,


        1, 0, 1 / 2,                        6,   0, 0,
        1 / 2, Math.sqrt(3) / 2, -1 / 2,    6,   1, 1,
        1 / 2, Math.sqrt(3) / 2, 1 / 2,     6,   1, 0,

        1 / 2, Math.sqrt(3) / 2, -1 / 2,    6,   1, 1,
        1, 0, 1 / 2,                        6,   0, 0,
        1, 0, -1 / 2,                       6,   0, 1,


        -1 / 2, Math.sqrt(3) / 2, 1 / 2,    7,   1, 0,
        1 / 2, Math.sqrt(3) / 2, 1 / 2,     7,   0, 0,
        1 / 2, Math.sqrt(3) / 2, -1 / 2,    7,   0, 1,

        1 / 2, Math.sqrt(3) / 2, -1 / 2,    7,   0, 1,
        -1 / 2, Math.sqrt(3) / 2, -1 / 2,   7,   1, 1,
        -1 / 2, Math.sqrt(3) / 2, 1 / 2,    7,   1, 0,
    ];
    for (var i = 0; i < data.length; i += 6) {
      if (!faces.includes(data[i + 3])) {
        continue;
      }
      buffer.push(data[i + 0] + x * 1.5);
      buffer.push(data[i + 1] + x * Math.sqrt(3) / 2 + y * Math.sqrt(3));
      buffer.push(data[i + 2] + z);
      buffer.push(data[i + 4]);
      buffer.push(data[i + 5]);
      buffer.push(color[0] * 255);
      buffer.push(color[1] * 255);
      buffer.push(color[2] * 255);
      buffer.push(data[i + 3]);
      buffer.push(x);
      buffer.push(y);
      buffer.push(z);
    }
  }

  static openFaces(chunk, i, j, k) {
    var faces = [];
    if (chunk.get(i, j, k + 1) == AIR) {
      faces.push(0);
    }
    if (chunk.get(i, j, k - 1) == AIR) {
      faces.push(1);
    }
    if (chunk.get(i - 1, j + 1, k) == AIR) {
      faces.push(2);
    }
    if (chunk.get(i - 1, j, k) == AIR) {
      faces.push(3);
    }
    if (chunk.get(i, j - 1, k) == AIR) {
      faces.push(4);
    }
    if (chunk.get(i + 1, j - 1, k) == AIR) {
      faces.push(5);
    }
    if (chunk.get(i + 1, j, k) == AIR) {
      faces.push(6);
    }
    if (chunk.get(i, j + 1, k) == AIR) {
      faces.push(7);
    }
    return faces;
  }

  update(ctx, chunk, part) {
    var buffer = [];
    for (var i = 0; i < RENDER_CHUNK_WIDTH; i++) {
      var x = i + chunk.x;
      for (var j = 0; j < RENDER_CHUNK_HEIGHT; j++) {
        var y = j + chunk.y;
        for (var k = 0; k < RENDER_CHUNK_DEPTH; k++) {
          var z = k + part * RENDER_CHUNK_DEPTH;
          var faces = RenderChunk.openFaces(chunk, i, j, z);
          var t = chunk.get(i, j, z);
          if (t === AIR) {
            continue;
          } else if (t === ROCK) {
            RenderChunk.addPrism(buffer, x, y, z, [0.3, 0.3, 0.5], faces);
          } else if (t === GRASS) {
            RenderChunk.addPrism(buffer, x, y, z, [0, 0.5, 0], faces);
          }
        }
      }
    }
    if (buffer.length === 0) {
      this.glbuffer = null;
      this.vertex_count = 0;
      this.dirty = false;
      return;
    }
    this.vertex_count = Math.floor(buffer.length / 12);
    var vertex_data = new ArrayBuffer(this.vertex_count * 24);
    var f32 = new Float32Array(vertex_data);
    var u8 = new Uint8Array(vertex_data);
    var pos = 0;
    var inpos = 0;
    for (var i = 0; i < this.vertex_count; i++) {
      f32[pos + 0] = buffer[inpos + 0];
      f32[pos + 1] = buffer[inpos + 1];
      f32[pos + 2] = buffer[inpos + 2];
      f32[pos + 3] = buffer[inpos + 3];
      f32[pos + 4] = buffer[inpos + 4];
      u8[(pos + 5) * 4 + 0] = buffer[inpos + 5];
      u8[(pos + 5) * 4 + 1] = buffer[inpos + 6];
      u8[(pos + 5) * 4 + 2] = buffer[inpos + 7];
      u8[(pos + 5) * 4 + 3] = buffer[inpos + 8];
      u8[(pos + 6) * 4 + 0] = buffer[inpos + 9];
      u8[(pos + 6) * 4 + 1] = buffer[inpos + 10];
      u8[(pos + 6) * 4 + 2] = buffer[inpos + 11];
      pos += 7;
      inpos += 12;
    }
    this.glbuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.glbuffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, vertex_data, ctx.STATIC_DRAW);

    this.dirty = false;
  }

  render(ctx, program, picking) {
    if (this.vertex_count === 0) {
      return;
    }
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.glbuffer);
    SetupFormat(program, picking);
    ctx.drawArrays(ctx.TRIANGLES, 0, this.vertex_count);
  }
}
