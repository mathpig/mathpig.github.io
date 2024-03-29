'use strict';

class Model {
  constructor() {
    this.glbuffer = null;
    this.vertex_count = 0;
    this.texture = null;
  }

  loadUrl(ctx, url) {
    var self = this;
    var request = new XMLHttpRequest();
    request.onload = function(e) {
      if (request.readyState == request.DONE && request.status == 200) {
        self.load(ctx, request.responseText);
      }
    };
    request.open('GET', url);
    request.send();
    return this;
  }

  decodeModel(data) {
    data = data.split(/\r?\n/);
    var buffer = [];

    var vertices = [];
    var texcoords = [];
    var normals = [];
    for (var i = 0; i < data.length; ++i) {
      var line = data[i];
      var m = line.match(/v ([0-9.-]+) ([0-9.-]+) ([0-9.-]+)/);
      if (m) {
        vertices.push([parseFloat(m[1]), -parseFloat(m[3]), parseFloat(m[2])]);
      }
      var m = line.match(/vt ([0-9.-]+) ([0-9.-]+)/);
      if (m) {
        texcoords.push([parseFloat(m[1]), 1.0 - parseFloat(m[2])]);
      }
      var m = line.match(/vn ([0-9.-]+) ([0-9.-]+) ([0-9.-]+)/);
      if (m) {
        normals.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
      }

      var m = line.match(/f ([0-9]+)[/]([0-9]+)[/]([0-9]+) ([0-9]+)[/]([0-9]+)[/]([0-9]+) ([0-9]+)[/]([0-9]+)[/]([0-9]+)/);
      if (m) {
        for (var j = 0; j < 3; ++j) {
          var vi = parseInt(m[j * 3 + 1]) - 1;
          var ti = parseInt(m[j * 3 + 2]) - 1;
          var ni = parseInt(m[j * 3 + 3]) - 1;
          buffer.push([vertices[vi][0], vertices[vi][1], vertices[vi][2],
                       texcoords[ti][0], texcoords[ti][1],
                       normals[ni][0], normals[ni][1], normals[ni][2]]);
        }
      }
    }
    return buffer;
  }

  load(ctx, data) {
    var buffer = this.decodeModel(data);
    this.vertex_count = buffer.length;
    const OUT_VERTEX_SIZE = 8;
    var vertex_data = new ArrayBuffer(this.vertex_count * OUT_VERTEX_SIZE * 4);
    var f32 = new Float32Array(vertex_data);
    var pos = 0;
    for (var i = 0; i < buffer.length; i++) {
      for (var j = 0; j < OUT_VERTEX_SIZE; j++) {
        f32[pos++] = buffer[i][j];
      }
    }
    this.glbuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.glbuffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, vertex_data, ctx.STATIC_DRAW);
  }

  setup(ctx) {
    if (this.texture) {
      return;
    }
    this.texture = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, this.texture);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, pig_texture);
    ctx.generateMipmap(ctx.TEXTURE_2D); 
  }

  bind(ctx) {
    this.setup(ctx);
    ctx.bindTexture(ctx.TEXTURE_2D, this.texture);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
  }

  render(ctx, program, picking, transform) {
    if (this.vertex_count === 0) {
      return;
    }

    ctx.enable(ctx.DEPTH_TEST);

    var modelview = ctx.getUniformLocation(program, 'modelview');
    var mvtrans = player.cameraTransform().multiply(transform);
    ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
    var projection = ctx.getUniformLocation(program, 'projection');
    var mvtrans = Matrix.perspective(40, screen.width / screen.height, 0.5, 100);
    ctx.uniformMatrix4fv(projection, false, mvtrans.array());

    var light = ctx.getUniformLocation(program, 'light');
    ctx.uniform3f(light, 0.2, 0.3, 0.7);

    var ambient_color = ctx.getUniformLocation(program, 'ambient_color');
    ctx.uniform3f(ambient_color, 0.3, 0.3, 0.3);
    var diffuse_color = ctx.getUniformLocation(program, 'diffuse_color');
    ctx.uniform3f(diffuse_color, 0.8, 0.8, 0.8);

    var fogColor = ctx.getUniformLocation(program, 'fogColor');
    ctx.uniform3fv(fogColor, player.getFogColor());

    ctx.enable(ctx.CULL_FACE);

    this.bind(ctx);
    ctx.bindBuffer(ctx.ARRAY_BUFFER, this.glbuffer);
    SetupModelFormat(program, picking);
    ctx.drawArrays(ctx.TRIANGLES, 0, this.vertex_count);
  }
}
