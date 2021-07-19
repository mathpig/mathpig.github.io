'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('webgl');
var seed = Math.floor(Math.random() * 1048576);

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

const vertexShader = `
  uniform highp mat4 modelview;
  uniform highp mat4 projection;
  uniform highp vec3 light;

  attribute vec3 pos;
  attribute vec3 col;
  attribute float face;
  attribute vec2 tex;

  varying highp vec3 vColor;
  varying highp vec2 texcoord;
  varying highp float fog;

  void main() {
    vec3 normal;
    if (face == 0.0) {
      normal = vec3(0.0, 0.0, 1.0);
    } else if (face == 1.0) {
      normal = vec3(0.0, 0.0, -1.0);
    } else if (face == 2.0) {
      normal = vec3(0.5, sqrt(3.0) / 2.0, 0.0);
    } else if (face == 3.0) {
      normal = vec3(-0.5, sqrt(3.0) / 2.0, 0.0);
    } else if (face == 4.0) {
      normal = vec3(0.0, -1.0, 0.0);
    } else if (face == 5.0) {
      normal = vec3(0.5, -sqrt(3.0) / 2.0, 0.0);
    } else if (face == 6.0) {
      normal = vec3(-0.5, -sqrt(3.0) / 2.0, 0.0);
    } else {
      normal = vec3(0.0, 1.0, 0.0);
    }

    gl_Position = projection * modelview * vec4(pos.xyz, 1);
    float diffuse = max(0.0, dot(normal, normalize(light)));
    float ambient = 0.5;
    float level = diffuse + ambient;
    vColor = (col / 255.0) * vec3(level, level, level);
    texcoord = tex;
    fog = smoothstep(64.0, 100.0, gl_Position.w);
  }
`;

const fragmentShader = `
  varying highp vec2 texcoord;
  varying highp vec3 vColor;
  varying highp float fog;

  uniform sampler2D sampler;

  void main() {
    lowp vec4 col = vec4(vColor.xyz, 1.0) * texture2D(sampler, texcoord);
    gl_FragColor = mix(col, vec4(0.5, 0.5, 0.5, 1.0), fog);
  }
`;

var program;
var chunk_set = new ChunkSet(seed);

function Setup() {
  var vs = ctx.createShader(ctx.VERTEX_SHADER);
  ctx.shaderSource(vs, vertexShader);
  ctx.compileShader(vs);
  console.log(ctx.getShaderInfoLog(vs));
  var fs = ctx.createShader(ctx.FRAGMENT_SHADER);
  ctx.shaderSource(fs, fragmentShader);
  ctx.compileShader(fs);
  console.log(ctx.getShaderInfoLog(fs));
  program = ctx.createProgram();
  ctx.attachShader(program, vs);
  ctx.attachShader(program, fs);
  ctx.linkProgram(program);
  ctx.useProgram(program);

  var texture = ctx.createTexture();
  ctx.bindTexture(ctx.TEXTURE_2D, texture);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
  //ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture1);
  //ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.LUMINANCE, 256, 256, 0, ctx.LUMINANCE, ctx.UNSIGNED_BYTE, NoiseTexture(256, 256, 0));
  //ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.LUMINANCE, 256, 256, 0, ctx.LUMINANCE, ctx.UNSIGNED_BYTE, LodNoiseTexture(256, 256, 0, 8));
  ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.LUMINANCE, 128, 128, 0, ctx.LUMINANCE, ctx.UNSIGNED_BYTE, ValueNoiseTexture(128, 128, seed, 64));
  ctx.generateMipmap(ctx.TEXTURE_2D);
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  ctx.viewport(0, 0, screen.width, screen.height);

  ctx.clearColor(0.5, 0.5, 0.5, 1);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  ctx.enable(ctx.DEPTH_TEST);
 
  var modelview = ctx.getUniformLocation(program, 'modelview');
  var mvtrans =
    Matrix.identity()
    .multiply(Matrix.rotateX(-90))
    .multiply(Matrix.rotateZ(direction))
    .multiply(Matrix.translate(x, y, z));
  ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
  var projection = ctx.getUniformLocation(program, 'projection');
  var mvtrans = Matrix.perspective(40, screen.width / screen.height, 0.5, 100);
  ctx.uniformMatrix4fv(projection, false, mvtrans.array());

  var light = ctx.getUniformLocation(program, 'light');
  ctx.uniform3f(light, 0.2, 0.3, 0.7);

  ctx.enable(ctx.CULL_FACE);

  chunk_set.update(ctx, x, y, z);
  chunk_set.render(ctx);
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
