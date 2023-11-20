'use strict';

zoom = 100;

var player = new Player().setPosition(offsetX * zoom, offsetY * zoom);
var entities = [player];

function Init() {
  for (var i = 0; i < 1600; i++) {
    do {
      var x = Math.random() * zoom * WIDTH;
      var y = Math.random() * zoom * HEIGHT;
    } while (tileAt(x, y).solid || tileAt(x, y) === tiles[0]);
    entities.push(
        new Bather()
        .setPosition(x, y));
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
