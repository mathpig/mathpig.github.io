'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('webgl');
var seed = Math.floor(Math.random() * 1048576);

var mouse_x = 0;
var mouse_y = 0;

var left = false;
var right = false;
var forward = false;
var backward = false;
var inward = false;
var outward = false;

var x = 0;
var y = 0;
var z = -108;
var direction = 0;

var block_program;
var pick_program;
var chunk_set = new ChunkSet(seed);

function Setup() {
  block_program = BlockShader(ctx);
  pick_program = PickShader(ctx);

  var texture = ctx.createTexture();
  ctx.bindTexture(ctx.TEXTURE_2D, texture);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
  //ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture1);
  ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.LUMINANCE, 128, 128, 0, ctx.LUMINANCE,
                 ctx.UNSIGNED_BYTE, ValueNoiseTexture(128, 128, seed, 64));
  ctx.generateMipmap(ctx.TEXTURE_2D);
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.viewport(0, 0, screen.width, screen.height);

  ctx.clearColor(0.5, 0.5, 0.5, 1);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  ctx.enable(ctx.DEPTH_TEST);

  UseProgram(block_program);
 
  var modelview = ctx.getUniformLocation(block_program, 'modelview');
  var mvtrans =
    Matrix.identity()
    .multiply(Matrix.rotateX(-90))
    .multiply(Matrix.rotateZ(direction))
    .multiply(Matrix.translate(x, y, z));
  ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
  var projection = ctx.getUniformLocation(block_program, 'projection');
  var mvtrans = Matrix.perspective(40, screen.width / screen.height, 0.5, 100);
  ctx.uniformMatrix4fv(projection, false, mvtrans.array());

  var light = ctx.getUniformLocation(block_program, 'light');
  ctx.uniform3f(light, 0.2, 0.3, 0.7);

  ctx.enable(ctx.CULL_FACE);

  chunk_set.update(ctx, x, y, z);
  chunk_set.render(ctx, block_program, false);
}

function Pick() {
  ctx.viewport(0, 0, 1, 1);

  ctx.clearColor(0, 0, 0, 0);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  ctx.enable(ctx.DEPTH_TEST);

  UseProgram(pick_program);
 
  var modelview = ctx.getUniformLocation(pick_program, 'modelview');
  var mvtrans =
    Matrix.identity()
    .multiply(Matrix.rotateX(-90))
    .multiply(Matrix.rotateZ(direction))
    .multiply(Matrix.translate(x, y, z));
  ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
  var projection = ctx.getUniformLocation(pick_program, 'projection');
  var mvtrans = Matrix.perspective(40, 0.5, 100, mouse_x, mouse_y, screen.width, screen.height);
  ctx.uniformMatrix4fv(projection, false, mvtrans.array());

  var viewer = ctx.getUniformLocation(pick_program, 'viewer');
  ctx.uniform2f(viewer, -x, -y);

  ctx.enable(ctx.CULL_FACE);

  chunk_set.update(ctx, x, y, z);
  chunk_set.render(ctx, pick_program, true);
}

function Tick() {
  if (left) {
    direction -= 1;
  }
  if (right) {
    direction += 1;
  }
  var dir = -direction - 90;
  if (forward) {
    x += Math.cos(dir * Math.PI / 180) * 0.25;
    y += Math.sin(dir * Math.PI / 180) * 0.25;
  }
  if (backward) {
    x -= Math.cos(dir * Math.PI / 180) * 0.25;
    y -= Math.sin(dir * Math.PI / 180) * 0.25;
  }
  if (inward) {
    z -= 0.1;
  }
  if (outward) {
    z += 0.1;
  }
  //Pick();
  Draw();
}

function Init() {
  Setup();
  setInterval(Tick, 20);
}

window.onload = Init;

window.onkeydown = function(e) {
  if (e.code == 'KeyA') {
    left = true;
  } else if (e.code == 'KeyD') {
    right = true;
  } else if (e.code == 'KeyW') {
    forward = true;
  } else if (e.code == 'KeyS') {
    backward = true;
  } else if (e.code == 'KeyQ') {
    inward = true;
  } else if (e.code == 'KeyE') {
    outward = true;
  }
};

window.onkeyup = function(e) {
  if (e.code == 'KeyA') {
    left = false;
  } else if (e.code == 'KeyD') {
    right = false;
  } else if (e.code == 'KeyW') {
    forward = false;
  } else if (e.code == 'KeyS') {
    backward = false;
  } else if (e.code == 'KeyQ') {
    inward = false;
  } else if (e.code == 'KeyE') {
    outward = false;
  }
};

window.onmousemove = function(e) {
  mouse_x = e.clientX;
  mouse_y = e.clientY;
};
