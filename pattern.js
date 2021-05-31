'use strict';

var pattern = document.getElementById('pattern');
var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var color = '#fff';
var drawing = false;
var lastx, lasty;

function ColorButton(e) {
  color = e.target.style.backgroundColor;
}
document.getElementById('white').onclick = ColorButton;
document.getElementById('gray').onclick = ColorButton;
document.getElementById('black').onclick = ColorButton;
document.getElementById('red').onclick = ColorButton;
document.getElementById('orange').onclick = ColorButton;
document.getElementById('yellow').onclick = ColorButton;
document.getElementById('green').onclick = ColorButton;
document.getElementById('cyan').onclick = ColorButton;
document.getElementById('blue').onclick = ColorButton;
document.getElementById('purple').onclick = ColorButton;
document.getElementById('brown').onclick = ColorButton;

function htranslate() {
  ctx.translate(100, 0);
}

function nhtranslate() {
  ctx.translate(-100, 0);
}

function vtranslate() {
  ctx.translate(0, 100);
}

function nvtranslate() {
  ctx.translate(0, -100);
}

function rotate60() {
  ctx.rotate(Math.PI / 3);
}

function rotate90() {
  ctx.rotate(Math.PI / 2);
}

function rotate180() {
  ctx.rotate(Math.PI);
}

function vreflect() {
  ctx.translate(-100, 0);
  ctx.scale(-1, 1);
  ctx.translate(100, 0);
}

function hreflect() {
  ctx.translate(0, -100);
  ctx.scale(1, -1);
  ctx.translate(0, 100);
}

function hglide() {
  ctx.translate(50, 0);
  hreflect();
}

function vglide() {
  ctx.translate(0, 50);
  vreflect();
}

var PATTERNS = {
  'frieze_p1': [[20, htranslate], [20, nhtranslate]],
  'frieze_p11g': [[20, htranslate], [20, nhtranslate], [2, hglide]],
  'frieze_p1m1': [[20, htranslate], [20, nhtranslate], [2, vreflect]],
  'frieze_p2': [[20, htranslate], [2, rotate180], [20, nhtranslate]],
  'frieze_p2mg': [[20, htranslate], [20, nhtranslate], [2, vreflect], [2, hglide], [2, rotate180]],
  'frieze_p11m': [[20, htranslate], [20, nhtranslate], [2, hreflect]],
  'frieze_p2mm': [[20, htranslate], [20, nhtranslate], [2, hreflect], [2, vreflect], [2, rotate180]],
};

function Resize() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight - pattern.clientHeight;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, screen.width, screen.height);
}

window.onresize = Resize;
Resize();

screen.onmousedown = function(e) {
  drawing = true;
  lastx = e.offsetX;
  lasty = e.offsetY;
};

screen.onmouseup = function(e) {
  drawing = false;
};

function Line(x1, y1, x2, y2) {
  var group = PATTERNS[pattern.value];
  var state = [];
  for (var i = 0; i < group.length; ++i) {
    state.push(0);
  }
  for (;;) {
    ctx.save();
    for (var i = 0; i < group.length; ++i) {
      for (var j = 0; j < state[i]; ++j) {
        group[i][1]();
      }
    }

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();

    var i = 0;
    while (i < group.length) {
      state[i]++;
      if (state[i] >= group[i][0]) {
        state[i] = 0;
      } else {
        break;
      }
      ++i;
    }
    if (i == group.length) {
      break;
    }
  }
}

screen.onmousemove = function(e) {
  if (drawing) {
    Line(lastx, lasty, e.offsetX, e.offsetY);
    Line(lastx - 500, lasty, e.offsetX - 500, e.offsetY);
    Line(lastx, lasty - 500, e.offsetX, e.offsetY - 500);
  }
  lastx = e.offsetX;
  lasty = e.offsetY;
};
