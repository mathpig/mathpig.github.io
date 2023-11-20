'use strict';

zoom = 100;

var player;
var alexander;
var entities = [];

var deathCount = 0;
var screenNum = 5;
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
  if (screenNum > 0 || hasWon) {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, screen.width, screen.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "yellow";
    if (screenNum > 0) {
      ctx.font = "20px arial";
      ctx.fillText("Press space to continue.", screen.width / 2, screen.height - 15);
      ctx.font = "30px serif";
      if (screenNum == 5) {
        ctx.fillText("One late evening on 16 March 216 in the vast Baths of Caracalla...", screen.width / 2, screen.height / 2 + 15);
      }
      else if (screenNum == 4) {
        ctx.fillText("All Gaius Porcius Symphoniacus had wanted was a bath...", screen.width / 2, screen.height / 2 + 15);
      }
      else if (screenNum == 3) {
        ctx.fillText("... autem balnea magna non solum habuit, sed etiam a terrible encounter.", screen.width / 2, screen.height / 2 + 15);
      }
      else if (screenNum == 2) {
        ctx.fillText("Only with the help of the great Emperor Caracalla could Porcius escape the labyrinth alive...", screen.width / 2, screen.height / 2 + 15);
      }
      else {
        ctx.font = "20px arial";
        ctx.fillText("Use the arrow keys to move. Avoid the lupine assassins and attempt to locate the emperor.", screen.width / 2, screen.height / 2 + 10);
      }
    }
    else {
      ctx.font = "50px arial";
      ctx.fillText("You win!", screen.width / 2, screen.height / 2 + 25);
    }
    return;
  }
  Draw();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 100, 35);
  ctx.font = "20px arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
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
  if (keySet[" "]) {
    screenNum--;
  }
};

window.onkeyup = function(e) {
  keySet[e.key] = false;
};
