'use strict';

const PALETTE_SIZE = 32;

var drawing = false;
var pen = 1;
var last = [0, 0];
var lastClick = [0, 0];
var copied = [];

function DrawPalette() {
  for (var i = 0; i < tiles.length; ++i) {
    tiles[i].draw(i * PALETTE_SIZE, screen.height - PALETTE_SIZE, PALETTE_SIZE, PALETTE_SIZE);
  }
  // Highlight selection.
  ctx.fillStyle = 'rgba(255,255,0,0.3)';
  ctx.fillRect(pen * PALETTE_SIZE, screen.height - PALETTE_SIZE, PALETTE_SIZE / 8, PALETTE_SIZE);
  ctx.fillRect(pen * PALETTE_SIZE + PALETTE_SIZE * 7 / 8, screen.height - PALETTE_SIZE, PALETTE_SIZE / 8, PALETTE_SIZE);
  ctx.fillRect(pen * PALETTE_SIZE, screen.height - PALETTE_SIZE, PALETTE_SIZE, PALETTE_SIZE / 8);
  ctx.fillRect(pen * PALETTE_SIZE, screen.height - PALETTE_SIZE + PALETTE_SIZE * 7 / 8, PALETTE_SIZE, PALETTE_SIZE / 8);
}

function Draw() {
  DrawMap();
  DrawPlan();
  DrawPalette();
}

function Tick() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Draw();
}

setInterval(Tick, 20);

function Box() {
  var x1 = Math.min(last[0], lastClick[0]);
  var x2 = Math.max(last[0], lastClick[0]);
  var y1 = Math.min(last[1], lastClick[1]);
  var y2 = Math.max(last[1], lastClick[1]);
  for (var j = y1; j <= y2; ++j) {
    for (var i = x1; i <= x2; ++i) {
      map[i + j * WIDTH + level * WIDTH * HEIGHT] = pen;
    }
  }
}

function Circle() {
  var dx = last[0] - lastClick[0];
  var dy = last[1] - lastClick[1];
  var r = Math.floor(Math.sqrt(dx * dx + dy * dy));
  for (var i = 0; i < 360; ++i) {
    var x = Math.round(r * Math.cos(i * Math.PI / 180)) + lastClick[0];
    var y = Math.round(r * Math.sin(i * Math.PI / 180)) + lastClick[1];
    copied.push(map[x + y * WIDTH + level * WIDTH * HEIGHT]);
  }
}

function Copy() {
  copied = [];
  var x1 = Math.min(last[0], lastClick[0]);
  var x2 = Math.max(last[0], lastClick[0]);
  var y1 = Math.min(last[1], lastClick[1]);
  var y2 = Math.max(last[1], lastClick[1]);
  for (var j = y1; j <= y2; ++j) {
    copied.push([]);
    for (var i = x1; i <= x2; ++i) {
      copied[copied.length - 1].push(map[i + j * WIDTH + level * WIDTH * HEIGHT]);
    }
  }
}
 
function ReflectPaste() {
  var x = last[0];
  var y = last[1];
  for (var j = 0; j < copied[0].length; ++j) {
    for (var i = 0; i < copied.length; ++i) {
      map[(x + j) + (y + i) * WIDTH + level * WIDTH * HEIGHT] = copied[i][copied[0].length - j - 1];
    }
  }
}

function Paste() {
  var x = last[0];
  var y = last[1];
  for (var j = 0; j < copied[0].length; ++j) {
    for (var i = 0; i < copied.length; ++i) {
      map[(x + j) + (y + i) * WIDTH + level * WIDTH * HEIGHT] = copied[i][j];
    }
  }
}

function Flood() {
  var pending = [];
  var cover = map[last[0] + last[1] * WIDTH + level * WIDTH * HEIGHT];
  pending.push([last[0], last[1]]);
  while (pending.length) {
    var p = pending.pop();
    if (p[0] < 0 || p[1] < 0 || p[0] >= WIDTH || p[1] >= HEIGHT) {
      continue;
    }
    var index = p[0] + p[1] * WIDTH + level * WIDTH * HEIGHT;
    if (map[index] != cover || map[index] == pen) {
      continue;
    }
    map[index] = pen;
    pending.push([p[0] - 1, p[1]]);
    pending.push([p[0] + 1, p[1]]);
    pending.push([p[0], p[1] - 1]);
    pending.push([p[0], p[1] + 1]);
  }
}

function SetZoom(z) {
  var c = GetCenter();
  offsetX += c[0];
  offsetY += c[1];
  zoom = z;
  c = GetCenter();
  offsetX -= c[0];
  offsetY -= c[1];
}

window.onkeydown = function(e) {
  if (e.ctrlKey && e.key == "s") {
    Save();
    e.preventDefault();
    return;
  }
  else if (e.key == "a" || e.key == "ArrowLeft") {
    offsetX--;
  }
  else if (e.key == "d" || e.key == "ArrowRight") {
    offsetX++;
  }
  else if (e.key == "s" || e.key == "ArrowDown") {
    offsetY++;
  }
  else if (e.key == "w" || e.key == "ArrowUp") {
    offsetY--;
  }
  else if (e.key == "o") {
    SetZoom(zoom + 1);
  }
  else if (e.key == "l") {
    SetZoom(Math.max(1, zoom - 1));
  }
  else if (e.key == "b") {
    Box();
    lastClick = last;
  }
  else if (e.key == "c") {
    Circle();
  }
  else if (e.key == "C") {
    Copy();
  }
  else if (e.key == "P") {
    Paste();
  }
  else if (e.key == "R") {
    ReflectPaste();
  }
  else if (e.key == "F") {
    Flood();
  }
  else if (e.key == "g") {
    var c = GetCenter();
    offsetX = last[0] - c[0];
    offsetY = last[1] - c[1];
  } else if (e.key == "m") {
    showMap = !showMap;
  }
};

window.onmousedown = function(e) {
  if (e.clientY >= screen.height - PALETTE_SIZE &&
      e.clientX < PALETTE_SIZE * tiles.length) {
    pen = Math.min(tiles.length - 1, Math.floor(e.clientX / PALETTE_SIZE));
    return;
  }
  last = toPosition(e);
  map[toMap(last)] = pen;
  lastClick = last;
  drawing = true;
};

window.onmouseup = function(e) {
  drawing = false;
};

window.onmousemove = function(e) {
  last = toPosition(e);
  if (drawing) {
    map[toMap(last)] = pen;
  }
};
