'use strict';

const WIDTH = 750;
const HEIGHT = 750;
const LEVELS = 2;

const PALETTE_SIZE = 32;

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");
var zoom = 16;
var level = 0;
var drawing = false;
var offsetX = Math.floor(WIDTH / 2);
var offsetY = Math.floor(HEIGHT / 2);
var pen = 1;
var last = [0, 0];
var lastClick = [0, 0];
var copied = [];
var showMap = true;

class Tile {
  constructor() {
    this.color = "black";
    this.image = null;
    this.angle = 0;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setImage(image) {
    this.image = image;
    return this;
  }

  setRotate(ang) {
    this.angle = ang * Math.PI / 180;
    return this;
  }

  draw(x, y, w, h) {
    if (this.image) {
      if (this.angle) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -w/2, -h/2, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(this.image, x, y, w, h);
      }
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, w, h);
    }
  }
}

var tiles = [
  new Tile().setImage(dirt1),
  new Tile().setImage(grass),
  new Tile().setImage(quadtiles1),
  new Tile().setImage(quadtiles2),
  new Tile().setImage(quadtiles3),
  new Tile().setImage(quadtiles4),
  new Tile().setImage(quadtilec1),
  new Tile().setImage(quadtilec2),
  new Tile().setImage(quadtilec3),
  new Tile().setImage(quadtilec4),
  new Tile().setImage(stone1),
  new Tile().setImage(marble1),
  new Tile().setColor("#777"),  // arch shadow
  new Tile().setColor("blue"),  // bath
  new Tile().setImage(pillar1),
  new Tile().setImage(flowers1),
  new Tile().setColor("#0ff"),  // fountain
  new Tile().setImage(door1),
  new Tile().setImage(stairs1),
  new Tile().setImage(whitetile1),
  new Tile().setImage(sand1),
];

var map = new Uint8Array(WIDTH * HEIGHT * LEVELS);

fetch("map.data").then(function(response) {
  if (!response.ok) {
    return;
  }
  response.arrayBuffer().then(function(buffer) {
    var nmap = new Uint8Array(buffer);
    for (var i = 0; i < WIDTH * HEIGHT * LEVELS; ++i) {
      map[i] = nmap[i];
    }
  });
});

function DrawMap() {
  var s = GetSize();
  var w = s[0];
  var h = s[1];
  for (var j = 0; j < h; ++j) {
    var jj = j + offsetY;
    if (jj < 0 || j >= HEIGHT) {
      continue;
    }
    for (var i = 0; i < w; ++i) {
      var ii = i + offsetX;
      if (ii < 0 || ii >= WIDTH) {
        continue;
      }
      tiles[map[ii + jj * WIDTH + level * WIDTH * HEIGHT]].draw(i * zoom, j * zoom, zoom, zoom);
    }
  }
}

function DrawPlan() {
  if (!showMap) {
    return;
  }
  ctx.save();
  ctx.globalAlpha = 0.2;
  var scale = WIDTH * zoom / plan.width;
  ctx.drawImage(plan, -offsetX * zoom, -offsetY * zoom,
                plan.width * scale, plan.height * scale);
  ctx.restore();
}

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

function Save() {
  const blob = new Blob([map], {type: 'text/plain'});
  const anchor = window.document.createElement('a');
  anchor.href = window.URL.createObjectURL(blob);
  anchor.download = 'map.data';
  document.body.appendChild(anchor);
  anchor.click();        
  document.body.removeChild(anchor);
}

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
 
function Paste() {
  var x = last[0];
  var y = last[1];
  for (var j = 0; j < copied[0].length; ++j) {
    for (var i = 0; i < copied.length; ++i) {
      map[(x + j) + (y + i) * WIDTH + level * WIDTH * HEIGHT] = copied[i][copied[0].length - j - 1];
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

function GetSize() {
  var w = Math.ceil(screen.width / zoom);
  var h = Math.ceil(screen.height / zoom);
  return [w, h];
}

function GetCenter() {
  var s = GetSize();
  var cx = Math.floor(s[0] / 2);
  var cy = Math.floor(s[1] / 2);
  return [cx, cy];
}

function toPosition(e) {
  var x = Math.floor(e.clientX / zoom) + offsetX;
  var y = Math.floor(e.clientY / zoom) + offsetY;
  return [x, y];
}

function toMap(a) {
  return a[0] + a[1] * WIDTH + level * WIDTH * HEIGHT;
}

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
