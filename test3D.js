'use strict';

var texture1 = document.getElementById('texture1');

var screen = document.getElementById('screen');
var ctx = screen.getContext('webgl');

const vertexShader = `
  uniform highp mat4 modelview;
  uniform highp mat4 projection;
  uniform highp vec3 light;
  attribute vec4 pos;
  attribute vec4 col;
  attribute vec3 normal;
  attribute vec2 tex;

  varying highp vec4 vColor;
  varying highp vec2 texcoord;

  void main() {
    gl_Position = projection * modelview * pos;
    float diffuse = max(0.0, dot(normal, normalize(light)));
    float ambient = 1.0;
    float level = diffuse + ambient;
    //vColor = vec4(1.0, 0.5, 0.0, 1.0) * vec4(level, level, level, 1);
    vColor = col * vec4(level, level, level, 1);
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

var alpha = 0;
var beta = 0;
var gamma = 0;

function Draw() {
  ctx.clearColor(0.5, 0.5, 0.5, 1);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  ctx.enable(ctx.DEPTH_TEST);
  
  const data = [
      -1, 0, 1 / 2, 1,                        0.75, 0.75, 0.75, 1,     0, 0, 1,                        0, 0.5,
      -1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
      -1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,     0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 0,
      
      -1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,     0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 0,
      -1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
      1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,      0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.75, 0,
      
      1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,      0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.75, 0,
      -1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
      1, 0, 1 / 2, 1,                         0.75, 0.75, 0.75, 1,     0, 0, 1,                        1, 0.5,
      
      1, 0, 1 / 2, 1,                         0.75, 0.75, 0.75, 1,     0, 0, 1,                        1, 0.5,
      -1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,    0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.25, 1,
      1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,     0.75, 0.75, 0.75, 1,     0, 0, 1,                        0.75, 1,
      
      
      -1, 0, -1 / 2, 1,                       0.25, 0.25, 0.25, 1,     0, 0, -1,                       1, 0.5,
      -1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,    0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 0,
      -1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,
      
      -1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,    0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 0,
      1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,     0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.25, 0,
      -1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,
      
      1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,     0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.25, 0,
      1, 0, -1 / 2, 1,                        0.25, 0.25, 0.25, 1,     0, 0, -1,                       0, 0.5,
      -1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,
      
      1, 0, -1 / 2, 1,                        0.25, 0.25, 0.25, 1,     0, 0, -1,                       0, 0.5,
      1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,    0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.25, 1,
      -1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,   0.25, 0.25, 0.25, 1,     0, 0, -1,                       0.75, 1,
      
      
      -1, 0, 1 / 2, 1,                        1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     1, 0,
      -1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,     1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     0, 0,
      -1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,    1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     0, 1,
      
      -1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,    1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     0, 1,
      -1, 0, -1 / 2, 1,                       1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     1, 1,
      -1, 0, 1 / 2, 1,                        1, 0, 0, 1,              1 / 2, Math.sqrt(3) / 2, 0,     1, 0,
      
      
      -1, 0, 1 / 2, 1,                        1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    0, 0,
      -1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,   1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    1, 1,
      -1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,    1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    1, 0,
      
      -1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,   1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    1, 1,
      -1, 0, 1 / 2, 1,                        1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    0, 0,
      -1, 0, -1 / 2, 1,                       1, 0.5, 0, 1,            -1 / 2, Math.sqrt(3) / 2, 0,    0, 1,
     
      
      -1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,    1, 1, 0, 1,              0, -1, 0,                       0, 0,
      1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,    1, 1, 0, 1,              0, -1, 0,                       1, 1,
      1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,     1, 1, 0, 1,              0, -1, 0,                       1, 0,
      
      1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,    1, 1, 0, 1,              0, -1, 0,                       1, 1,
      -1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,    1, 1, 0, 1,              0, -1, 0,                       0, 0,
      -1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,   1, 1, 0, 1,              0, -1, 0,                       0, 1,
      
      
      1, 0, 1 / 2, 1,                         0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    1, 0,
      1 / 2, -Math.sqrt(3) / 2, 1 / 2, 1,     0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    0, 0,
      1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,    0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    0, 1,
      
      1 / 2, -Math.sqrt(3) / 2, -1 / 2, 1,    0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    0, 1,
      1, 0, -1 / 2, 1,                        0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    1, 1,
      1, 0, 1 / 2, 1,                         0, 1, 0, 1,              1 / 2, -Math.sqrt(3) / 2, 0,    1, 0,
      
      
      1, 0, 1 / 2, 1,                         0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   0, 0,
      1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,     0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   1, 1,
      1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,      0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   1, 0,
      
      1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,     0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   1, 1,
      1, 0, 1 / 2, 1,                         0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   0, 0,
      1, 0, -1 / 2, 1,                        0, 0, 1, 1,              -1 / 2, -Math.sqrt(3) / 2, 0,   0, 1,
      
      
      -1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,     0.5, 0, 1, 1,            0, 1, 0,                        1, 0,
      1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,      0.5, 0, 1, 1,            0, 1, 0,                        0, 0,
      1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,     0.5, 0, 1, 1,            0, 1, 0,                        0, 1,
      
      1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,     0.5, 0, 1, 1,            0, 1, 0,                        0, 1,
      -1 / 2, Math.sqrt(3) / 2, -1 / 2, 1,    0.5, 0, 1, 1,            0, 1, 0,                        1, 1,
      -1 / 2, Math.sqrt(3) / 2, 1 / 2, 1,     0.5, 0, 1, 1,            0, 1, 0,                        1, 0,
/*      1, 1, 1, 1,      0, 1, 0, 1,     0, 1, 0,
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
      -1, -1, -1, 1,   1, 1, 1, 1,     0, 0, -1,*/
  ];
  var buffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
  ctx.bufferData(ctx.ARRAY_BUFFER,
                 new Float32Array(data),
                 ctx.STATIC_DRAW);
  
  var vs = ctx.createShader(ctx.VERTEX_SHADER);
  ctx.shaderSource(vs, vertexShader);
  ctx.compileShader(vs);
  var fs = ctx.createShader(ctx.FRAGMENT_SHADER);
  ctx.shaderSource(fs, fragmentShader);
  ctx.compileShader(fs);
  var program = ctx.createProgram();
  ctx.attachShader(program, vs);
  ctx.attachShader(program, fs);
  ctx.linkProgram(program);
  ctx.useProgram(program);

  var pos = ctx.getAttribLocation(program, 'pos');
  ctx.vertexAttribPointer(pos, 4, ctx.FLOAT, false, 4 * 13, 4 * 0);
  ctx.enableVertexAttribArray(pos);
  var col = ctx.getAttribLocation(program, 'col');
  ctx.vertexAttribPointer(col, 4, ctx.FLOAT, false, 4 * 13, 4 * 4);
  ctx.enableVertexAttribArray(col);
  var normal = ctx.getAttribLocation(program, 'normal');
  ctx.vertexAttribPointer(normal, 3, ctx.FLOAT, false, 4 * 13, 4 * 8);
  ctx.enableVertexAttribArray(normal);
  var tex = ctx.getAttribLocation(program, 'tex');
  ctx.vertexAttribPointer(tex, 2, ctx.FLOAT, false, 4 * 13, 4 * 11);
  ctx.enableVertexAttribArray(tex);

  var modelview = ctx.getUniformLocation(program, 'modelview');
  var mvtrans = Matrix.translate(0, 0, -7.5).multiply(Matrix.rotateZ(gamma)).multiply(Matrix.rotateY(beta)).multiply(Matrix.rotateX(alpha));
  ctx.uniformMatrix4fv(modelview, false, mvtrans.array());
  var projection = ctx.getUniformLocation(program, 'projection');
  var mvtrans = Matrix.perspective(35, 4/3, 0.5, 100);
  ctx.uniformMatrix4fv(projection, false, mvtrans.array());
  
  var light = ctx.getUniformLocation(program, 'light');
  ctx.uniform3f(light, 0.2, 0.3, 0.7);

  ctx.enable(ctx.CULL_FACE);

  var texture = ctx.createTexture();
  ctx.bindTexture(ctx.TEXTURE_2D, texture);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
  ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture1);
  ctx.generateMipmap(ctx.TEXTURE_2D);

  ctx.drawArrays(ctx.TRIANGLES, 0, Math.floor(data.length / 11));

  alpha += 1 / 3;
  beta += 1 / 2;
  gamma += 1 / 1;
}

setInterval(Draw, 20);
