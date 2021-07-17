'use strict';

const RENDER_CHUNK_WIDTH = 16;
const RENDER_CHUNK_HEIGHT = 16;
const RENDER_CHUNK_DEPTH = 16;

class RenderChunk {
  constructor() {
    this.glbuffer = null;
    this.vertex_count = 0;
  }

  static addPrism(buffer, x, y, z, color) {
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
      buffer.push(data[i + 0] + x * 1.5);
      buffer.push(data[i + 1] + x * Math.sqrt(3) / 2 + y * Math.sqrt(3));
      buffer.push(data[i + 2] + z);
      buffer.push(data[i + 4]);
      buffer.push(data[i + 5]);
      buffer.push(color[0] * 255);
      buffer.push(color[1] * 255);
      buffer.push(color[2] * 255);
      buffer.push(data[i + 3]);
    }
  }

  update(ctx, chunk, part) {
    var buffer = [];
    for (var i = 0; i < RENDER_CHUNK_WIDTH; i++) {
      for (var j = 0; j < RENDER_CHUNK_HEIGHT; j++) {
        for (var k = 0; k < RENDER_CHUNK_DEPTH; k++) {
          var z = k + part * RENDER_CHUNK_DEPTH - 80;
          var t = chunk.get(i, j, k + part * RENDER_CHUNK_DEPTH);
          if (t === AIR) {
            continue;
          } else if (t === ROCK) {
            RenderChunk.addPrism(buffer, i, j, z, [0.3, 0.3, 0.5]);
          } else if (t === GRASS) {
            RenderChunk.addPrism(buffer, i, j, z, [0, 0.5, 0]);
          }
        }
      }
    }
    if (buffer.length === 0) {
      this.glbuffer = null;
      this.vertex_count = 0;
      return;
    }
    this.vertex_count = Math.floor(buffer.length / 9);
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
      pos += 6;
      inpos += 9;
    }
    this.glbuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.glbuffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, vertex_data, ctx.STATIC_DRAW);
  }

  render(ctx) {
    if (this.vertex_count === 0) {
      return;
    }
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.glbuffer);

    var pos = ctx.getAttribLocation(program, 'pos');
    ctx.vertexAttribPointer(pos, 3, ctx.FLOAT, false, 24, 0);
    ctx.enableVertexAttribArray(pos);
    var tex = ctx.getAttribLocation(program, 'tex');
    ctx.vertexAttribPointer(tex, 2, ctx.FLOAT, false, 24, 12);
    ctx.enableVertexAttribArray(tex);
    var col = ctx.getAttribLocation(program, 'col');
    ctx.vertexAttribPointer(col, 3, ctx.UNSIGNED_BYTE, false, 24, 20);
    ctx.enableVertexAttribArray(col);
    var face = ctx.getAttribLocation(program, 'face');
    ctx.vertexAttribPointer(face, 1, ctx.UNSIGNED_BYTE, false, 24, 23);
    ctx.enableVertexAttribArray(face);

    ctx.drawArrays(ctx.TRIANGLES, 0, this.vertex_count);
  }
}
