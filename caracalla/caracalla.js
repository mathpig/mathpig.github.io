'use strict';

zoom = 100;

var minX = 209;
var maxX = 536;
var minY = 285;
var maxY = 496;
/*
for (var j = 0; j < HEIGHT; j++) {
  for (var i = 0; i < WIDTH; i++) {
    if (map[i + j * WIDTH]) {
      minX = Math.min(minX, i);
      maxX = Math.max(maxX, i);
      minY = Math.min(minY, j);
      maxY = Math.max(maxY, j);
    }
  }
}
*/

var player = new Player();
placeRandomly(player);

var alexander = new Goal();
placeRandomly(alexander);

var entities = [player, alexander];

function placeRandomly(item) {
  do {
    var x = (Math.random() * (maxX - minX) + minX) * zoom;
    var y = (Math.random() * (maxY - minY) + minY) * zoom;
  } while (!tileAt(x, y).isPlaceable());
  item.setPosition(x, y);
}

function Init() {
  for (var i = 0; i < 1598; i++) {
    if (Math.random() < 0.95) {
      var entity = new Bather();
    }
    else {
      var entity = new Cop();
    }
    placeRandomly(entity);
    entities.push(entity);
  }
}
Init();

var keySet = {};

function Draw() {
  var targetX = player.x - screen.width / 2;
  var targetY = player.y - screen.height / 2;

  ctx.save();
  offsetX = Math.floor(targetX / zoom);
  offsetY = Math.floor(targetY / zoom);
  ctx.translate((offsetX * zoom - targetX), (offsetY * zoom - targetY));
  DrawMap();
  DrawPlan();
  ctx.restore();

  ctx.save();
  ctx.translate(-targetX, -targetY);
  entities.sort(function(a, b) {
    return a.y - b.y;
  });
  for (var i = 0; i < entities.length; ++i) {
    entities[i].drawLabel();
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].draw();
  }
  ctx.restore();
}

function Tick() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Draw();
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
}

window.onkeydown = function(e) {
  keySet[e.key] = true;
  if (keySet["m"]) {
    showMap = !showMap;
  }
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};

setInterval(Tick, 20);
