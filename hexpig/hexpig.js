'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('webgl');
var seed = Math.floor(Math.random() * 1000000);

var player = new Player();
var model_set = new ModelSet();
var entity_set = new EntitySet();
for (var i = -5; i < 5; i++) {
  for (var j = -5; j < 5; j++) {
    entity_set.add(new Pig().setPosition(i * 32 + Math.random() * 32 - 16,
                                         j * 32 + Math.random() * 32 - 16,
                                         Math.random() * 16 + 112));
  }
}

var picked = [0, 0, 0, 0];

var chunk_set = new ChunkSet(seed);

var block_program;
var texture;
var overlay_program;

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

function SetupOverlay() {
  overlay_program = OverlayShader(ctx);
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
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;

  BindDisplayBuffers();

  ctx.viewport(0, 0, screen.width, screen.height);

  var fog_color = player.getFogColor();
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
  ctx.uniform3fv(fogColor, fog_color);

  ctx.enable(ctx.CULL_FACE);

  chunk_set.update(ctx, player);
  chunk_set.render(ctx, block_program, false);

  entity_set.draw(ctx, model_set);

  DrawOverlay();
}

function DrawOverlay() {
  var buffer = new ArrayBuffer(12 * 12);
  var u8 = new Uint8Array(buffer);
  var f32 = new Float32Array(buffer);
  var a = 0.002;
  var b = 0.02;
  var parts = [
    -b, -a,
    b, -a,
    -b, a,
    -b, a,
    b, -a,
    b, a,

    -a, -b,
    a, -b,
    -a, b,
    -a, b,
    a, -b,
    a, b,
  ];
  var aspect = screen.width / screen.height;
  var pos = 0;
  for (var i = 0; i < parts.length; i += 2) {
    f32[pos++] = parts[i + 0];
    f32[pos++] = parts[i + 1] * aspect;
    u8[pos * 4 + 0] = 255; 
    u8[pos * 4 + 1] = 255;
    u8[pos * 4 + 2] = 255;
    u8[pos * 4 + 3] = 100;
    pos++;
  }
  UseProgram(overlay_program);
  var crosshair = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, crosshair);
  ctx.bufferData(ctx.ARRAY_BUFFER, buffer, ctx.STATIC_DRAW);
  SetupOverlayFormat(overlay_program);
  ctx.enable(ctx.BLEND);
  ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
  ctx.drawArrays(ctx.TRIANGLES, 0, 12);
  ctx.disable(ctx.BLEND);
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
  var mvtrans = Matrix.pixelPerspective(
      40, 0.5, 100, screen.width * 0.5, screen.height * 0.5,
      screen.width, screen.height);
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
  entity_set.tick();
  Draw();
  picked = Pick();
}

function Init() {
  SetupDisplay();
  model_set.setup(ctx);
  SetupPicking();
  SetupOverlay();
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
  player.movement(e.movementX, e.movementY);
};

window.onmousedown = function(e) {
  var [tx, ty, tz] = player.findClick(picked, false);
  chunk_set.change(tx, ty, tz, AIR);
  if (!document.fullScreenElement) {
    screen.requestFullscreen({navigationUI: 'hide'});
  }
  if (!document.pointerLockElement) {
    screen.requestPointerLock();
  }
};
