'use strict';

var pattern = document.getElementById('pattern');
var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var color = '#fff';
var drawing = false;
var lastx, lasty;
var lines = [];
var outline = true;

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

document.getElementById('clear').onclick = function() {
  lines = [];
  Resize();
};

document.getElementById('outline').onclick = function(e) {
  outline = e.target.checked;
  Resize();
};

function htranslate(n) {
  ctx.translate(200 * n, 0);
}

function htranslate2(n) {
  ctx.translate(400 * n, 0);
}

function htranslate4(n) {
  ctx.translate(800 * n, 0);
}

function htranslateBig(n) {
  ctx.translate(600 * n, 0);
}

function vtranslate(n) {
  ctx.translate(0, 200 * n);
}

function vtranslate2(n) {
  ctx.translate(0, 400 * n);
}

function vtranslateBig(n) {
  ctx.translate(0, 200 * Math.sqrt(3) * n);
}

function rotate90(n) {
  ctx.translate(200, 200);
  ctx.rotate(n * Math.PI / 2);
  ctx.translate(-200, -200);
}

function rotate120(n) {
  ctx.rotate(n * Math.PI * 2 / 3);
}

function rotate120a(n) {
  ctx.translate(100, 100 * Math.sqrt(3));
  ctx.rotate(n * Math.PI * 2 / 3);
  ctx.translate(-100, -100 * Math.sqrt(3));
}

function rotate120b(n) {
  ctx.translate(200, 0);
  ctx.rotate(n * Math.PI * 2 / 3);
  ctx.translate(-200, 0);
}

function rotate180(n) {
  ctx.translate(200, 200);
  ctx.rotate(n * Math.PI);
  ctx.translate(-200, -200);
}

function rotate180offset(n) {
  ctx.translate(100, 100);
  ctx.rotate(n * Math.PI);
  ctx.translate(-100, -100);
}

function vreflect(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(200, 0);
    ctx.scale(-1, 1);
    ctx.translate(-200, 0);
  }
}

function hreflect(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(0, 200);
    ctx.scale(1, -1);
    ctx.translate(0, -200);
  }
}

function hreflect2(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(0, 100);
    ctx.scale(1, -1);
    ctx.translate(0, -100);
  }
}

function hglide(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(100, 0);
    hreflect(n);
  }
}

function hglide2x(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(400, 0);
    hreflect(n);
  }
}

function hglide22x(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(400, 0);
    hreflect2(n);
  }
}

function hglide2x(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(200, 0);
    hreflect2(n);
  }
}

function vglide(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(0, 100);
    vreflect(n);
  }
}

function grid200x200() {
  Line(0, 0, 200, 0, '#ccc');
  Line(200, 0, 200, 200, '#ccc');
  Line(0, 200, 200, 200, '#ccc');
  Line(0, 200, 0, 0, '#ccc');
}

function grid200() {
  Line(0, 0, 0, 1000, '#ccc');
  Line(200, 0, 200, 1000, '#ccc');
}

function gridHex() {
  Line(0, 0, 200, 0, '#ccc');
  Line(100, 100 * Math.sqrt(3), 0, 0, '#ccc');
  Line(100, 100 * Math.sqrt(3), 300, 100 * Math.sqrt(3), '#ccc');
  Line(200, 0, 300, 100 * Math.sqrt(3), '#ccc');
}

function gridNone() {
}

var PATTERNS = {
  'regular_drawing': {grid: gridNone, group: []},
  'frieze_p1': {grid: grid200, group: [[20, htranslate]]},
  'frieze_p11g': {grid: grid200x200, group: [[20, htranslate], [2, hglide]]},
  'frieze_p1m1': {grid: grid200, group: [[10, htranslate2], [2, vreflect]]},
  'frieze_p2': {grid: grid200x200, group: [[20, htranslate], [2, rotate180]]},
  'frieze_p2mg': {grid: grid200x200, group: [[10, htranslate2], [2, vreflect], [2, hglide22x], [2, rotate180]]},
  'frieze_p11m': {grid: grid200x200, group: [[20, htranslate], [2, hreflect]]},
  'frieze_p2mm': {grid: grid200x200, group: [[10, htranslate2], [2, hreflect], [2, vreflect], [2, rotate180]]},
  'wallpaper_p1': {grid: grid200x200, group: [[20, htranslate], [20, vtranslate]]},
  'wallpaper_p2': {grid: grid200x200, group: [[2, rotate180], [10, htranslate2], [20, vtranslate]]},
  'wallpaper_p3': {grid: gridHex, group: [[6, htranslateBig], [6, vtranslateBig], [3, rotate120], [3, rotate120a], [3, rotate120b]]},
  'wallpaper_p4': {grid: grid200x200, group: [[10, htranslate2], [20, vtranslate2], [4, rotate90]]},
  'wallpaper_pm': {grid: grid200x200, group: [[10, htranslate2], [20, vtranslate], [2, vreflect]]},
  'wallpaper_pmm': {grid: grid200x200, group: [[10, htranslate2], [10, vtranslate2], [2, hreflect], [2, vreflect], [2, rotate180]]},
  'wallpaper_pmg': {grid: grid200x200, group: [[10, htranslate2], [20, vtranslate], [2, hglide2x], [2, vreflect]]},
  'wallpaper_pg': {grid: grid200x200, group: [[20, htranslate], [10, vtranslate2], [2, hglide2x]]},
  'wallpaper_cm': {grid: grid200x200, group: [[10, htranslate2], [10, vtranslate2], [2, hreflect], [2, hglide22x]]},
  'wallpaper_pgg': {grid: grid200x200, group: [[10, htranslate2], [10, vtranslate2], [2, rotate180], [2, rotate180offset], [2, hglide22x]]},
};

function Resize() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight - pattern.clientHeight;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, screen.width, screen.height);

  for (var i = 0; i < lines.length; ++i) {
    Line(lines[i][0], lines[i][1], lines[i][2], lines[i][3], color);
  }

  if (outline) {
    PATTERNS[pattern.value].grid();
  }
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

function Line(x1, y1, x2, y2, color) {
  var group = PATTERNS[pattern.value].group;
  var state = [];
  for (var i = 0; i < group.length; ++i) {
    state.push(0);
  }
  for (;;) {
    ctx.save();
    for (var i = 0; i < group.length; ++i) {
      group[i][1](state[i] - Math.floor(group[i][0] / 2));
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

pattern.onchange = Resize;

screen.onmousemove = function(e) {
  if (drawing) {
    lines.push([lastx, lasty, e.offsetX, e.offsetY, color]);
    Line(lastx, lasty, e.offsetX, e.offsetY, color);
  }
  lastx = e.offsetX;
  lasty = e.offsetY;
};
