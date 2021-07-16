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
        -1, 0, 1 / 2,                        0.75, 0.75, 0.75, 1,     0, 0, 1,                        0, 0.5,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
        -1 / 2, Math.sqrt(3) / 2, 1 / 2,     0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 0,

        -1 / 2, Math.sqrt(3) / 2, 1 / 2,     0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 0,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
        1 / 2, Math.sqrt(3) / 2, 1 / 2,      0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.75, 0,

        1 / 2, Math.sqrt(3) / 2, 1 / 2,      0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.75, 0,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
        1, 0, 1 / 2,                         0.75, 0.75, 0.75, 1,     0, 0, 1,                        1, 0.5,

        1, 0, 1 / 2,                         0.75, 0.75, 0.75, 1,     0, 0, 1,                        1, 0.5,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
        1 / 2, -Math.sqrt(3) / 2, 1 / 2,     0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.75, 1,


        -1, 0, -1 / 2,                       0.25, 0.25, 0.25, 1,     0, 0, -1,                       1, 0.5,
        -1 / 2, Math.sqrt(3) / 2, -1 / 2,    0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,

        -1 / 2, Math.sqrt(3) / 2, -1 / 2,    0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 0,
        1 / 2, Math.sqrt(3) / 2, -1 / 2,     0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.25, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,

        1 / 2, Math.sqrt(3) / 2, -1 / 2,     0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.25, 0,
        1, 0, -1 / 2,                        0.25, 0.25, 0.25, 1,     0, 0, -1,                       0, 0.5,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,

        1, 0, -1 / 2,                        0.25, 0.25, 0.25, 1,     0, 0, -1,                       0, 0.5,
        1 / 2, -Math.sqrt(3) / 2, -1 / 2,    0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.25, 1,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,


        -1, 0, 1 / 2,                        1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     1, 0,
        -1 / 2, Math.sqrt(3) / 2, 1 / 2,     1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     0, 0,
        -1 / 2, Math.sqrt(3) / 2, -1 / 2,    1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     0, 1,

        -1 / 2, Math.sqrt(3) / 2, -1 / 2,    1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     0, 1,
        -1, 0, -1 / 2,                       1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     1, 1,
        -1, 0, 1 / 2,                        1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     1, 0,


        -1, 0, 1 / 2,                        1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    0, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,   1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    1, 1,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,    1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    1, 0,

        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,   1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    1, 1,
        -1, 0, 1 / 2,                        1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    0, 0,
        -1, 0, -1 / 2,                       1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    0, 1,


        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,    1, 1, 0, 1,              0, -1, 0,                       0, 0,
        1 / 2, -Math.sqrt(3) / 2, -1 / 2,    1, 1, 0, 1,              0, -1, 0,                       1, 1,
        1 / 2, -Math.sqrt(3) / 2, 1 / 2,     1, 1, 0, 1,              0, -1, 0,                       1, 0,

        1 / 2, -Math.sqrt(3) / 2, -1 / 2,    1, 1, 0, 1,              0, -1, 0,                       1, 1,
        -1 / 2, -Math.sqrt(3) / 2, 1 / 2,    1, 1, 0, 1,              0, -1, 0,                       0, 0,
        -1 / 2, -Math.sqrt(3) / 2, -1 / 2,   1, 1, 0, 1,              0, -1, 0,                       0, 1,


        1, 0, 1 / 2,                         0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    1, 0,
        1 / 2, -Math.sqrt(3) / 2, 1 / 2,     0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    0, 0,
        1 / 2, -Math.sqrt(3) / 2, -1 / 2,    0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    0, 1,

        1 / 2, -Math.sqrt(3) / 2, -1 / 2,    0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    0, 1,
        1, 0, -1 / 2,                        0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    1, 1,
        1, 0, 1 / 2,                         0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    1, 0,


        1, 0, 1 / 2,                         0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   0, 0,
        1 / 2, Math.sqrt(3) / 2, -1 / 2,     0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   1, 1,
        1 / 2, Math.sqrt(3) / 2, 1 / 2,      0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   1, 0,

        1 / 2, Math.sqrt(3) / 2, -1 / 2,     0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   1, 1,
        1, 0, 1 / 2,                         0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   0, 0,
        1, 0, -1 / 2,                        0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   0, 1,


        -1 / 2, Math.sqrt(3) / 2, 1 / 2,     0.5, 0, 1, 1,            0, 1, 0,                        1, 0,
        1 / 2, Math.sqrt(3) / 2, 1 / 2,      0.5, 0, 1, 1,            0, 1, 0,                        0, 0,
        1 / 2, Math.sqrt(3) / 2, -1 / 2,     0.5, 0, 1, 1,            0, 1, 0,                        0, 1,

        1 / 2, Math.sqrt(3) / 2, -1 / 2,     0.5, 0, 1, 1,            0, 1, 0,                        0, 1,
        -1 / 2, Math.sqrt(3) / 2, -1 / 2,    0.5, 0, 1, 1,            0, 1, 0,                        1, 1,
        -1 / 2, Math.sqrt(3) / 2, 1 / 2,     0.5, 0, 1, 1,            0, 1, 0,                        1, 0,
    ];
    for (var i = 0; i < data.length; i += 12) {
      buffer.push(data[i + 0] + x * 1.5);
      buffer.push(data[i + 1] + x * Math.sqrt(3) / 2 + y * Math.sqrt(3));
      buffer.push(data[i + 2] + z);
      buffer.push(color[0]);
      buffer.push(color[1]);
      buffer.push(color[2]);
      for (var j = 6; j < 12; j++) {
        buffer.push(data[i + j]);
      }
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
    this.vertex_count = Math.floor(buffer.length / 12);
    var vertex_data = new Float32Array(buffer);
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
    ctx.vertexAttribPointer(pos, 3, ctx.FLOAT, false, 4 * 12, 4 * 0);
    ctx.enableVertexAttribArray(pos);
    var col = ctx.getAttribLocation(program, 'col');
    ctx.vertexAttribPointer(col, 4, ctx.FLOAT, false, 4 * 12, 4 * 3);
    ctx.enableVertexAttribArray(col);
    var normal = ctx.getAttribLocation(program, 'normal');
    ctx.vertexAttribPointer(normal, 3, ctx.FLOAT, false, 4 * 12, 4 * 7);
    ctx.enableVertexAttribArray(normal);
    var tex = ctx.getAttribLocation(program, 'tex');
    ctx.vertexAttribPointer(tex, 2, ctx.FLOAT, false, 4 * 12, 4 * 10);
    ctx.enableVertexAttribArray(tex);

    ctx.drawArrays(ctx.TRIANGLES, 0, this.vertex_count);
  }
}
