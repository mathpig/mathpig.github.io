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

function htranslate(n) {
  ctx.translate(200 * n, 0);
}

function vtranslate(n) {
  ctx.translate(0, 200 * n);
}

function htranslateBig(n) {
  ctx.translate(600 * n, 0);
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
    ctx.translate(0, 200);
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

function hglide2(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(100, 0);
    hreflect2(n);
  }
}

function vglide(n) {
  if (n - Math.floor(n / 2) * 2) {
    ctx.translate(0, 100);
    vreflect(n);
  }
}

var PATTERNS = {
  'regular_drawing': [],
  'frieze_p1': [[20, htranslate]],
  'frieze_p11g': [[20, htranslate], [2, hglide]],
  'frieze_p1m1': [[20, htranslate], [2, vreflect]],
  'frieze_p2': [[20, htranslate], [2, rotate180]],
  'frieze_p2mg': [[20, htranslate], [2, vreflect], [2, hglide], [2, rotate180]],
  'frieze_p11m': [[20, htranslate], [2, hreflect]],
  'frieze_p2mm': [[20, htranslate], [2, hreflect], [2, vreflect], [2, rotate180]],
  'wallpaper_p1': [[20, htranslate], [20, vtranslate]],
  'wallpaper_p2': [[2, rotate180], [20, htranslate], [20, vtranslate]],
  'wallpaper_p3': [[20, htranslateBig], [20, vtranslateBig], [3, rotate120], [3, rotate120a], [3, rotate120b]],
  'wallpaper_p4': [[20, htranslate], [20, vtranslate], [4, rotate90]],
  'wallpaper_pm': [[20, htranslate], [20, vtranslate], [2, vreflect]],
  'wallpaper_pmm': [[20, htranslate], [20, vtranslate], [2, hreflect], [2, vreflect], [2, rotate180]],
  'wallpaper_pmg': [[20, htranslate], [20, vtranslate], [2, hglide], [2, vreflect]],
  'wallpaper_pg': [[20, htranslate], [20, vtranslate], [2, hglide]],
  'wallpaper_cm': [[20, htranslate], [20, vtranslate], [2, hreflect], [2, hglide2]],
  'wallpaper_pgg': [[20, htranslate], [20, vtranslate], [2, rotate180], [2, rotate180offset], [2, hglide2]],
};

function Resize() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight - pattern.clientHeight;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, screen.width, screen.height);

/*
  Line(0, 0, 200, 0);
  Line(200, 0, 100, 100 * Math.sqrt(3));
  Line(100, 100 * Math.sqrt(3), 0, 0);
*/
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
    Line(lastx, lasty, e.offsetX, e.offsetY);
  }
  lastx = e.offsetX;
  lasty = e.offsetY;
};
