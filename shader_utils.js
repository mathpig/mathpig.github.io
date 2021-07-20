'use strict';

function CompileShaders(ctx, vertex_source, fragment_source) {
  var vs = ctx.createShader(ctx.VERTEX_SHADER);
  ctx.shaderSource(vs, vertex_source);
  ctx.compileShader(vs);
  console.log(ctx.getShaderInfoLog(vs));
  var fs = ctx.createShader(ctx.FRAGMENT_SHADER);
  ctx.shaderSource(fs, fragment_source);
  ctx.compileShader(fs);
  console.log(ctx.getShaderInfoLog(fs));
  var program = ctx.createProgram();
  ctx.attachShader(program, vs);
  ctx.attachShader(program, fs);
  ctx.linkProgram(program);
  return program;
}

function UseProgram(program) {
  ctx.useProgram(program);
}

function SetupFormat(program) {
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
}
