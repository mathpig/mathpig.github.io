'use strict';

function BlockShader(ctx) {
  return CompileShaders(ctx, `
  uniform highp mat4 modelview;
  uniform highp mat4 projection;
  uniform highp vec3 light;
  uniform lowp vec4 pick;

  attribute vec3 pos;
  attribute vec3 col;
  attribute float face;
  attribute vec3 grid;
  attribute vec2 tex;

  varying lowp vec3 vColor;
  varying highp vec2 texcoord;
  varying lowp float fog;

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
    if (pick == vec4(grid.xyz, face)) {
      vColor = vec3(1.0, 1.0, 0.0);
    } else {
      vColor = (col / 255.0) * vec3(level, level, level);
    }
    texcoord = tex;
    fog = smoothstep(64.0, 100.0, gl_Position.w);
  }
  `, `
  varying highp vec2 texcoord;
  varying lowp vec3 vColor;
  varying lowp float fog;

  uniform highp vec3 fogColor;
  uniform sampler2D sampler;

  void main() {
    lowp vec4 col = vec4(vColor.xyz, 1.0) * texture2D(sampler, texcoord);
    gl_FragColor = mix(col, vec4(fogColor.xyz, 1.0), fog);
  }
  `);
}

function PickShader(ctx) {
  return CompileShaders(ctx, `
  uniform highp mat4 modelview;
  uniform highp mat4 projection;
  uniform highp vec2 viewer;

  attribute vec3 pos;
  attribute float face;
  attribute vec3 grid;

  varying lowp vec4 vColor;

  void main() {
    gl_Position = projection * modelview * vec4(pos.xyz, 1);
    if (distance(pos.xy, viewer) > 32.0) {
      vColor = vec4(255.0, 255.0, 255.0, 255.0);
    } else {
      vColor = vec4(grid.xyz, face) / 255.0;
    }
  }
  `, `
  varying lowp vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
  `);
}
