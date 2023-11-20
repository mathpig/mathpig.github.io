'use strict';

zoom = 100;

var player;
var alexander;
var entities = [];

var deathCount = 0;
var hasWon = false;

function placeRandomly(item) {
  do {
    var x = Math.random() * zoom * WIDTH;
    var y = Math.random() * zoom * HEIGHT;
  } while (!tileAt(x, y).isPlaceable());
  item.setPosition(x, y);
}

function Init() {
  player = new Player();
  placeRandomly(player);
  alexander = new Goal();
  placeRandomly(alexander);
  entities = [player, alexander];
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
  setInterval(Tick, 20);
}

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
  if (hasWon) {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, screen.width, screen.height);
    ctx.font = "50px arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "yellow";
    ctx.fillText("You win!", screen.width / 2, screen.height / 2);
    return;
  }
  Draw();
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, 100, 35);
  ctx.font = "20px arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "yellow";
  ctx.fillText("Deaths: " + String(deathCount), 50, 25);
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
