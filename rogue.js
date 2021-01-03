'use strict';

const WIDTH = 100;
const HEIGHT = 100;
const SCALE = 48;
const MOVE_DELAY = 7;

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var pigX = Math.floor(WIDTH / 2);
var pigY = Math.floor(HEIGHT / 2);
var delay = 0;
var ticks = 0;
var joystick = [0, 0, 0, 0, 0];
var currentLevel = NewLevel();

function NewLevel() {
  var level = [];
  for (var j = 0; j < HEIGHT; ++j) {
    var row = [];
    for (var i = 0; i < WIDTH; ++i) {
      var x = Math.floor(Math.random() * 10);
      var odds = level[j] !== undefined && level[j-1][i] === 'brick1' ? 3 : 9;
      if (x < odds) {
        row.push('open');
      } else {
        row.push('brick1');
      }
    }
    level.push(row);
  }
  for (var i = 0; i < 100; ++i) {
    RandomBox(level);
  }
  WorldEdge(level);
  level[pigY][pigX] = 'open';
  ConnectLevel(level);
  for (var i = 0; i < 25; ++i) {
    AddWolf(level);
  }
  return level;
}

function WorldEdge(level) {
  for (var j = 0; j < HEIGHT; ++j) {
    level[j][0] = 'brick1';
    level[j][WIDTH-1] = 'brick1';
  }
  for (var i = 0; i < WIDTH; ++i) {
    level[0][i] = 'brick1';
    level[HEIGHT-1][i] = 'brick1';
  }
}

function Distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function AddWolf(level) {
  for (;;) {
    var x = Math.floor(Math.random() * WIDTH);
    var y = Math.floor(Math.random() * HEIGHT);
    if (level[y][x] != '') {
      continue;
    }
    if (Distance(pigX, pigY, x, y) < 10) {
      continue;
    }
    level[y][x] = 'wolf4';
    break;
  }
}

function RandomBox(level) {
  var x = Math.floor(Math.random() * WIDTH);
  var y = Math.floor(Math.random() * HEIGHT);
  var w = Math.floor(Math.random() * 10) + 4;
  var h = Math.floor(Math.random() * 10) + 4;
  w = Math.min(WIDTH - x, w);
  h = Math.min(WIDTH - y, h);
  for (var j = y; j < y + h; ++j) {
    for (var i = x; i < x + w; ++i) {
      level[j][i] = 'open';
    }
    level[j][x] = 'wood4';
    level[j][x + w - 1] = 'wood4';
  }
  for (var i = x; i < x + w; ++i) {
    level[y][i] = 'straw4';
    level[y + h - 1][i] = 'straw4';
  }
}

function Connect(level, x1, y1, x2, y2) {
  var minX = Math.min(x1, x2);
  var maxX = Math.max(x1, x2);
  for (var x = minX; x <= maxX; ++x) {
    level[y2][x] = '';
  }
  for (var y = y1; y <= y2; ++y) {
    level[y][x1] = '';
  }
}

function FloodFill(level, i, j) {
  var stack = [];
  stack.push([i, j]);
  while (stack.length != 0) {
    var [x, y] = stack.pop();
    if (level[y] === undefined || level[y][x] != 'open') {
      continue;
    }
    level[y][x] = '';
    stack.push([x, y - 1]);
    stack.push([x, y + 1]);
    stack.push([x - 1, y]);
    stack.push([x + 1, y]);
  }
}

function ConnectLevel(level) {
  var lastAirX = 1;
  var lastAirY = 1;
  for (var j = 0; j < HEIGHT; ++j) {
    for (var i = 0; i < WIDTH; ++i) {
      if (level[j][i] == 'open') {
        FloodFill(level, i, j);
        Connect(level, lastAirX, lastAirY, i, j);
      }
      if (level[j][i] == '') {
        lastAirX = i;
        lastAirY = j;
      }
    }
  }
}

function DrawLevel(level) {
  for (var j = 0; j < HEIGHT; ++j) {
    for (var i = 0; i < WIDTH; ++i) {
      if (level[j][i] == '') {
        continue;
      }
      var image = document.getElementById(level[j][i]);
      ctx.drawImage(image, i * SCALE, j * SCALE, SCALE, SCALE);
    }
  }
}

function Draw() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  var pig = document.getElementById('pig4');
  ctx.fillStyle = '#070';
  ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save();
  ctx.translate(-pigX * SCALE + screen.width / 2 - SCALE / 2,
                -pigY * SCALE + screen.height / 2 - SCALE / 2);
  DrawLevel(currentLevel);
  ctx.drawImage(pig, pigX * SCALE, pigY * SCALE, SCALE, SCALE);
  ctx.restore();
}

function Move(level, fromX, fromY, toX, toY) {
  level[toY][toX] = level[fromY][fromX];
  level[fromY][fromX] = '';
}

function TickCell(level, i, j) {
  var cell = level[j][i];
  if (cell == 'wolf4' && ticks % 20 == 0) {
    if (Distance(pigX, pigY, i, j) > 10) {
      return;
    }
    if (pigX < i && level[j][i - 1] == '') {
      Move(level, i, j, i - 1, j);
    }
    else if (pigX > i && level[j][i + 1] == '') {
      Move(level, i, j, i + 1, j);
    }
    else if (pigY < j && level[j - 1][i] == '') {
      Move(level, i, j, i, j - 1);
    }
    else if (pigY > j && level[j + 1][i] == '') {
      Move(level, i, j, i, j + 1);
    }
  }
}

function TickWorld(level) {
  for (var j = 0; j < HEIGHT; ++j) {
    for (var i = 0; i < WIDTH; ++i) {
      TickCell(level, i, j);
    }
  } 
}

function Tick() {
  ticks++;
  TickWorld(currentLevel);
  if (delay > 0) {
    --delay;
  } else {
    if (joystick[0] && currentLevel[pigY][pigX-1] == '') {
      pigX -= 1;
      delay = MOVE_DELAY;
    }
    if (joystick[1] && currentLevel[pigY][pigX+1] == '') {
      pigX += 1;
      delay = MOVE_DELAY;
    }
    if (joystick[2] && currentLevel[pigY-1][pigX] == '') {
      pigY -= 1;
      delay = MOVE_DELAY;
    }
    if (joystick[3] && currentLevel[pigY+1][pigX] == '') {
      pigY += 1;
      delay = MOVE_DELAY;
    }
  }
  Draw();
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  if (e.keyCode == 37) {
    joystick[0] = 1;
  } else if (e.keyCode == 39) {
    joystick[1] = 1;
  } else if (e.keyCode == 38) {
    joystick[2] = 1; 
  } else if (e.keyCode == 40) {
    joystick[3] = 1;
  } else if (e.keyCode == 16) {
    joystick[4] = 1;
  }
};

window.onkeyup = function(e) {
  if (e.keyCode == 37) {
    joystick[0] = 0;
  } else if (e.keyCode == 39) {
    joystick[1] = 0;
  } else if (e.keyCode == 38) {
    joystick[2] = 0; 
  } else if (e.keyCode == 40) {
    joystick[3] = 0;
  } else if (e.keyCode == 16) {
    joystick[4] = 0;
  }
};


