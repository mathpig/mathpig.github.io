'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('webgl');
var seed = Math.floor(Math.random() * 1048576);

var mouse_x = 0;
var mouse_y = 0;

var player = new Player();

var picked = [0, 0, 0, 0];

var chunk_set = new ChunkSet(seed);

var block_program;
var texture;

var pick_program;
var pick_texture;
var pick_buffer;
var pick_depth_buffer;

function SetupDisplay() {
  block_program = BlockShader(ctx);

  texture = ctx.createTexture();
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

function SetupPicking() {
  pick_program = PickShader(ctx);

  pick_texture = ctx.createTexture();
  ctx.bindTexture(ctx.TEXTURE_2D, pick_texture);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
  ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, 1, 1, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);
  pick_depth_buffer = ctx.createRenderbuffer();
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, pick_depth_buffer);
  ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, 1, 1);
  pick_buffer = ctx.createFramebuffer();
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, pick_buffer);
  ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, pick_texture, 0);
  ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.RENDERBUFFER, pick_depth_buffer);
}

function BindPickingBuffers() {
  ctx.bindTexture(ctx.TEXTURE_2D, pick_texture);
  ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, 1, 1, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, pick_depth_buffer);
  ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, 1, 1);
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, pick_buffer);
}

function BindDisplayBuffers() {
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  ctx.bindTexture(ctx.TEXTURE_2D, texture);
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;

  BindDisplayBuffers();

  ctx.viewport(0, 0, screen.width, screen.height);

  var aboveground = 0.0;
  if (player.z < -GROUND_RANGE) {
    aboveground = 1.0;
  }
  var fog_color = [0.2 * aboveground, 0.3 * aboveground, 0.7 * aboveground];

  ctx.clearColor(fog_color[0], fog_color[1], fog_color[2], 1);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  ctx.enable(ctx.DEPTH_TEST);

  UseProgram(block_program);
 
  var modelview = ctx.getUniformLocation(block_program, 'modelview');
  var mvtrans = player.cameraTransform();
  ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
  var projection = ctx.getUniformLocation(block_program, 'projection');
  var mvtrans = Matrix.perspective(40, screen.width / screen.height, 0.5, 100);
  ctx.uniformMatrix4fv(projection, false, mvtrans.array());

  var light = ctx.getUniformLocation(block_program, 'light');
  ctx.uniform3f(light, 0.2, 0.3, 0.7);

  var pick = ctx.getUniformLocation(block_program, 'pick');
  ctx.uniform4f(pick, picked[0], picked[1], picked[2], picked[3]);

  var fogColor = ctx.getUniformLocation(block_program, 'fogColor');
  ctx.uniform3f(fogColor, fog_color[0], fog_color[1], fog_color[2]);

  ctx.enable(ctx.CULL_FACE);

  chunk_set.update(ctx, player);
  chunk_set.render(ctx, block_program, false);
}

function Pick() {
  BindPickingBuffers();

  ctx.viewport(0, 0, 1, 1);

  ctx.clearColor(1, 1, 1, 1);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  ctx.enable(ctx.DEPTH_TEST);

  UseProgram(pick_program);
 
  var modelview = ctx.getUniformLocation(pick_program, 'modelview');
  var mvtrans = player.cameraTransform();
  ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
  var projection = ctx.getUniformLocation(pick_program, 'projection');
  var mvtrans = Matrix.pixelPerspective(40, 0.5, 100, mouse_x, mouse_y, screen.width, screen.height);
  ctx.uniformMatrix4fv(projection, false, mvtrans.array());

  var viewer = ctx.getUniformLocation(pick_program, 'viewer');
  ctx.uniform2fv(viewer, player.getUniformXY());

  ctx.enable(ctx.CULL_FACE);

  chunk_set.render(ctx, pick_program, true);

  var data = new Uint8Array(4);
  ctx.readPixels(0.5, 0.5, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, data);
  return [data[0], data[1], data[2], data[3]];
}

function Tick() {
  player.tick();
  Draw();
  picked = Pick();
}

function Init() {
  SetupDisplay();
  SetupPicking();
  setInterval(Tick, 20);
}

window.onload = Init;

window.onkeydown = function(e) {
  player.keyDown(e);
  if (e.code == 'KeyG') {
    var [tx, ty, tz] = player.findClick(picked, true);
    chunk_set.change(tx, ty, tz, GRASS);
  } else if (e.code == 'KeyR') {
    var [tx, ty, tz] = player.findClick(picked, true);
    chunk_set.change(tx, ty, tz, ROCK);
  } else if (e.code == 'KeyL') {
    var [tx, ty, tz] = player.findClick(picked, true);
    chunk_set.change(tx, ty, tz, LAVA);
  } else if (e.code == 'KeyB') {
    var [tx, ty, tz] = player.findClick(picked, true);
    chunk_set.change(tx, ty, tz, BEDROCK);
  } else if (e.code == 'KeyT') {
    var [tx, ty, tz] = player.findClick(picked, true);
    Explode(chunk_set, tx, ty, tz);
  }
};

window.onkeyup = function(e) {
  player.keyUp(e);
};

window.onmousemove = function(e) {
  mouse_x = e.clientX;
  mouse_y = e.clientY;
};

window.onmousedown = function(e) {
  var [tx, ty, tz] = player.findClick(picked, false);
  chunk_set.change(tx, ty, tz, AIR);
  if (!document.fullScreenElement) {
    screen.requestFullscreen({navigationUI: 'hide'});
  }
};
