'use strict';

var texture1 = document.getElementById('texture1');

var screen = document.getElementById('screen');
var ctx = screen.getContext('webgl');
var seed = Math.floor(Math.random() * 1048576);

const SIZE_X = 128;
const SIZE_Y = 128;
const BUFFER_SIZE = 12 * 20 * 3 * SIZE_X * SIZE_Y;

var left = false;
var right = false;
var forward = false;
var backward = false;
var inward = false;
var outward = false;

var x = 0;
var y = 0;
var z = 0;
var direction = 0;

const vertexShader = `
  uniform highp mat4 modelview;
  uniform highp mat4 projection;
  uniform highp vec3 light;
  attribute vec3 pos;
  attribute vec4 col;
  attribute vec3 normal;
  attribute vec2 tex;

  varying highp vec4 vColor;
  varying highp vec2 texcoord;

  void main() {
    gl_Position = projection * modelview * vec4(pos.xyz, 1);
    float diffuse = max(0.0, dot(normal, normalize(light)));
    float ambient = 0.5;
    float level = diffuse + ambient;
    vColor = (col * 0.25 + vec4(0.0, 0.5, 0.0, 1.0) * 0.75) * vec4(level, level, level, 1);
    //vColor = vec4(1.0, 0.5, 0.0, 1.0) * vec4(level, level, level, 1);
    //vColor = col * vec4(level, level, level, 1);
    //vColor = col;
    texcoord = tex;
  }
`;

const fragmentShader = `
  varying highp vec2 texcoord;
  varying highp vec4 vColor;
  uniform sampler2D sampler;

  void main() {
    gl_FragColor = vColor * texture2D(sampler, texcoord);
  }
`;

function AddPrism(x, y, z, color) {
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
    buffer[buffer_size++] = data[i + 0] + x * 1.5;
    buffer[buffer_size++] = data[i + 1] + x * Math.sqrt(3) / 2 + y * Math.sqrt(3);
    buffer[buffer_size++] = data[i + 2] + z;
    buffer[buffer_size++] = color[0];
    buffer[buffer_size++] = color[1];
    buffer[buffer_size++] = color[2];
    for (var j = 6; j < 12; j++) {
      buffer[buffer_size++] = data[i + j];
    }
  }
}

function AddCube(buffer, x, y, z) {
  const data = [
      1, 1, 1, 1,      0, 1, 0, 1,     0, 1, 0,
      1, 1, -1, 1,     0, 1, 0, 1,     0, 1, 0,
      -1, 1, 1, 1,     0, 1, 0, 1,     0, 1, 0,
 
      -1, 1, -1, 1,    0, 1, 0, 1,     0, 1, 0,
      -1, 1, 1, 1,     0, 1, 0, 1,     0, 1, 0,
      1, 1, -1, 1,     0, 1, 0, 1,     0, 1, 0,
 
 
      1, -1, 1, 1,     0, 0, 1, 1,     0, -1, 0,
      -1, -1, 1, 1,    0, 0, 1, 1,     0, -1, 0,
      1, -1, -1, 1,    0, 0, 1, 1,     0, -1, 0,

      -1, -1, -1, 1,   0, 0, 1, 1,     0, -1, 0,
      1, -1, -1, 1,    0, 0, 1, 1,     0, -1, 0,
      -1, -1, 1, 1,    0, 0, 1, 1,     0, -1, 0,
 

      1, 1, 1, 1,      1, 0, 0, 1,     1, 0, 0,
      1, -1, 1, 1,     1, 0, 0, 1,     1, 0, 0,
      1, 1, -1, 1,     1, 0, 0, 1,     1, 0, 0,
 
      1, -1, -1, 1,    1, 0, 0, 1,     1, 0, 0,
      1, 1, -1, 1,     1, 0, 0, 1,     1, 0, 0,
      1, -1, 1, 1,     1, 0, 0, 1,     1, 0, 0,
  

      -1, 1, 1, 1,     1, 0.5, 0, 1,   -1, 0, 0,
      -1, 1, -1, 1,    1, 0.5, 0, 1,   -1, 0, 0,
      -1, -1, 1, 1,    1, 0.5, 0, 1,   -1, 0, 0,

      -1, -1, -1, 1,   1, 0.5, 0, 1,   -1, 0, 0,
      -1, -1, 1, 1,    1, 0.5, 0, 1,   -1, 0, 0,
      -1, 1, -1, 1,    1, 0.5, 0, 1,   -1, 0, 0,


      -1, -1, 1, 1,    1, 1, 0, 1,     0, 0, 1,
      1, 1, 1, 1,      1, 1, 0, 1,     0, 0, 1,
      -1, 1, 1, 1,     1, 1, 0, 1,     0, 0, 1,
 
      1, 1, 1, 1,      1, 1, 0, 1,     0, 0, 1,
      -1, -1, 1, 1,    1, 1, 0, 1,     0, 0, 1,
      1, -1, 1, 1,     1, 1, 0, 1,     0, 0, 1,


      -1, -1, -1, 1,   1, 1, 1, 1,     0, 0, -1,
      -1, 1, -1, 1,    1, 1, 1, 1,     0, 0, -1,
      1, 1, -1, 1,     1, 1, 1, 1,     0, 0, -1,

      1, 1, -1, 1,     1, 1, 1, 1,     0, 0, -1,
      1, -1, -1, 1,    1, 1, 1, 1,     0, 0, -1,
      -1, -1, -1, 1,   1, 1, 1, 1,     0, 0, -1,
  ];
}

var glbuffer;
var buffer;
var buffer_size = 0;
var program;
  
function Setup() {
  buffer = new Float32Array(BUFFER_SIZE);
  for (var i = 0; i < SIZE_X; i++) {
    for (var j = 0; j < SIZE_Y; j++) {
      AddPrism(i, j, Math.floor(ValueNoise(seed, 64, i, j, 0) * 12),
               [Math.random(), Math.random(), Math.random()]);
    }
  }

  glbuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, glbuffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, buffer, ctx.STATIC_DRAW);

  var vs = ctx.createShader(ctx.VERTEX_SHADER);
  ctx.shaderSource(vs, vertexShader);
  ctx.compileShader(vs);
  var fs = ctx.createShader(ctx.FRAGMENT_SHADER);
  ctx.shaderSource(fs, fragmentShader);
  ctx.compileShader(fs);
  program = ctx.createProgram();
  ctx.attachShader(program, vs);
  ctx.attachShader(program, fs);
  ctx.linkProgram(program);
  ctx.useProgram(program);

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
    Matrix.translate(-x, -y, -z)
    .multiply(Matrix.translate(0, 0, -20))
    .multiply(Matrix.rotateX(-45));
  ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
  var projection = ctx.getUniformLocation(program, 'projection');
  var mvtrans = Matrix.perspective(40, screen.width / screen.height, 0.5, 100);
  ctx.uniformMatrix4fv(projection, false, mvtrans.array());

  var light = ctx.getUniformLocation(program, 'light');
  ctx.uniform3f(light, 0.2, 0.3, 0.7);

  ctx.enable(ctx.CULL_FACE);

  ctx.drawArrays(ctx.TRIANGLES, 0, Math.floor(buffer_size / 12));
}

function Tick() {
/*
  if (left) {
    direction -= 1;
  }
  if (right) {
    direction += 1;
  }
  if (forward) {
    y += Math.cos(direction * 180 / Math.PI) * 0.01;
    x += Math.sin(direction * 180 / Math.PI) * 0.01;
  }
  if (backward) {
    y -= Math.cos(direction * 180 / Math.PI) * 0.01;
    x -= Math.sin(direction * 180 / Math.PI) * 0.01;
  }
*/
  if (left) {
    x -= 0.1;
  }
  if (right) {
    x += 0.1;
  }
  if (forward) {
    y += 0.1;
  }
  if (backward) {
    y -= 0.1;
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
