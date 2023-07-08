"use strict";

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function rangeTouches(a, b, c, d) {
  return (b > c && d > a);
}

var screen = document.getElementById("screen");
var ctx = screen.getContext("2d");

var rect = screen.getBoundingClientRect();

var mapWidth = 128;
var mapHeight = Math.floor(mapWidth * screen.height / screen.width);

var blockSize = Math.floor(screen.width / mapWidth);

var entities = [];

var mouseX = -1;
var mouseY = -1;

var mouseDown = false;

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.sx = blockSize;
    this.sy = blockSize;
    this.solid = true;
    this.color = "";
    this.toolType = "";
    this.toolTimes = [];
    this.hovering = false;
    this.count = 0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(sx, sy) {
    this.sx = sx;
    this.sy = sy;
    return this;
  }

  setSolid(solid) {
    this.solid = solid;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setToolType(toolType) {
    this.toolType = toolType;
    return this;
  }

  setToolTimes(toolTimes) {
    this.toolTimes = toolTimes;
    return this;
  }

  setCount(count) {
    this.count = count;
    return this;
  }

  giveDrops() {
  }

  drawShell(stage) {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x + this.sx / 4, this.y + this.sy / 4, this.sx / 4, this.sy / 4);
    ctx.fillRect(this.x + this.sx / 2, this.y + this.sy / 2, this.sx / 4, this.sy / 4);
    if (stage >= 1) {
      ctx.fillRect(this.x + this.sx * 3 / 4, this.y, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x, this.y + this.sy * 3 / 4, this.sx / 4, this.sy / 4);
    }
    if (stage >= 2) {
      ctx.fillRect(this.x, this.y, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x + this.sx * 3 / 4, this.y + this.sy * 3 / 4, this.sx / 4, this.sy / 4);
    }
    if (stage >= 3) {
      ctx.fillRect(this.x + this.sx / 4, this.y + this.sy / 2, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x + this.sx / 2, this.y + this.sy / 4, this.sx / 4, this.sy / 4);
    }
    if (stage >= 4) {
      ctx.fillRect(this.x, this.y + this.sy / 4, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x + this.sx * 3 / 4, this.y + this.sy / 2, this.sx / 4, this.sy / 4);
    }
    if (stage >= 5) {
      ctx.fillRect(this.x + this.sx / 2, this.y, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x + this.sx / 4, this.y + this.sy * 3 / 4, this.sx / 4, this.sy / 4);
    }
    if (stage >= 6) {
      ctx.fillRect(this.x + this.sx * 3 / 4, this.y + this.sy / 4, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x, this.y + this.sy / 2, this.sx / 4, this.sy / 4);
    }
    if (stage >= 7) {
      ctx.fillRect(this.x + this.sx / 4, this.y, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x + this.sx / 2, this.y + this.sy * 3 / 4, this.sx / 4, this.sy / 4);
    }
  }

  draw() {
    if (this.hovering) {
      ctx.fillStyle = "purple";
    }
    else {
      ctx.fillStyle = this.color;
    }
    ctx.fillRect(this.x, this.y, this.sx, this.sy);
    if (this.count > 0 && this.solid) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }

  tick() {
    if (mouseX >= this.x && mouseX < (this.x + this.sx) && mouseY >= this.y && mouseY < (this.y + this.sy)) {
      var coord1 = (player.x + player.sx / 2);
      var coord2 = (player.y + player.sy / 2);
      var coord3 = (this.x + this.sx / 2);
      var coord4 = (this.y + this.sy / 2);
      if (Math.sqrt((coord3 - coord1) * (coord3 - coord1) + (coord4 - coord2) * (coord4 - coord2)) > (6 * blockSize)) {
        return;
      }
      this.hovering = true;
      if (mouseDown) {
        this.count += 1 / this.toolTimes[0];
        if (this.count >= 1) {
          for (var i = 0; i < entities.length; ++i) {
            if (entities[i] === this) {
              entities[i] = new Air().setPosition(this.x, this.y);
            }
          }
          this.giveDrops();
        }
      }
      else {
        this.count = 0;
      }
    }
    else {
      this.hovering = false;
      this.count = 0;
    }
  }
}

class Item {
  constructor() {
    this.name = "";
  }
}

class DirtItem extends Item {
  constructor() {
    super();
    this.name = "Dirt";
  }
}

class CobblestoneItem extends Item {
  constructor() {
    super();
    this.name = "Cobblestone";
  }
}

class CoalItem extends Item {
  constructor() {
    super();
    this.name = "Coal";
  }
}

class RawCopperItem extends Item {
  constructor() {
    super();
    this.name = "Raw Copper";
  }
}

class RawIronItem extends Item {
  constructor() {
    super();
    this.name = "Raw Iron";
  }
}

class RedstoneDustItem extends Item {
  constructor() {
    super();
    this.name = "Redstone Dust";
  }
}

class RawGoldItem extends Item {
  constructor() {
    super();
    this.name = "Raw Gold";
  }
}

class LapisItem extends Item {
  constructor() {
    super();
    this.name = "Lapis Lazuli";
  }
}

class DiamondItem extends Item {
  constructor() {
    super();
    this.name = "Diamond";
  }
}

class EmeraldItem extends Item {
  constructor() {
    super();
    this.name = "Emerald";
  }
}

function giveDrop(quantity, item) {
  for (var i = 0; i < player.inventory.length; ++i) {
    if (player.inventory[i][0] == item) {
      var val = Math.min(quantity, item.stackLimit - player.inventory[i][1]);
      player.inventory[i][0] += val;
      quantity -= val;
    }
  }
  while (quantity > 0 && player.inventory.length < 9) {
    player.inventory.push([item, Math.min(quantity, item.stackLimit)]);
    quantity -= item.stackLimit;
  }
}

class Air extends Block {
  constructor() {
    super();
    this.solid = false;
    this.color = "skyblue";
  }
}

class Grass extends Block {
  constructor() {
    super();
    this.toolType = "shovel";
    this.toolTimes = [38, 20, 10, 8, 5, 5];
  }

  giveDrops() {
    giveDrop(1, DirtItem);
  }

  draw() {
   if (this.hovering) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
    else {
      ctx.fillStyle = "lime";
      ctx.fillRect(this.x, this.y, this.sx, this.sy / 4);
      ctx.fillStyle = "brown";
      ctx.fillRect(this.x, this.y + this.sy / 4, this.sx, this.sy * 3 / 4);
    }
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }
}

class Dirt extends Block {
  constructor() {
    super();
    this.color = "brown";
    this.toolType = "shovel";
    this.toolTimes = [45, 23, 13, 8, 5, 8];
  }

  giveDrops() {
    giveDrop(1, DirtItem);
  }
}

class Stone extends Block {
  constructor() {
    super();
    this.color = "gray";
    this.toolType = "pickaxe";
    this.toolTimes = [375, 58, 30, 20, 10, 15];
  }

  giveDrops() {
    giveDrop(1, CobblestoneItem);
  }
}

class Coal extends Block {
  constructor() {
    super();
    this.color = "black";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 113, 58, 38, 20, 30];
  }

  giveDrops() {
    giveDrop(1, CoalItem);
  }
}

class Copper extends Block {
  constructor() {
    super();
    this.color = "darksalmon";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 375, 58, 38, 63, 30];
  }

  giveDrops() {
    giveDrop(randint(2, 5), RawCopperItem);
  }
}

class Iron extends Block {
  constructor() {
    super();
    this.color = "moccasin";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 375, 58, 38, 63, 30];
  }

  giveDrops() {
    giveDrop(1, RawIronItem);
  }
}

class Redstone extends Block {
  constructor() {
    super();
    this.color = "red";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 375, 188, 38, 63, 30];
  }

  giveDrops() {
    giveDrop(randint(4, 5), RedstoneDustItem);
  }
}

class Gold extends Block {
  constructor() {
    super();
    this.color = "gold";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 375, 188, 38, 63, 30];
  }

  giveDrops() {
    giveDrop(1, RawGoldItem);
  }
}

class Lapis extends Block {
  constructor() {
    super();
    this.color = "blue";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 375, 58, 38, 63, 30];
  }

  giveDrops() {
    giveDrop(randint(4, 9), LapisItem);
  }
}

class Diamond extends Block {
  constructor() {
    super();
    this.color = "cyan";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 375, 188, 38, 63, 30];
  }

  giveDrops() {
    giveDrop(1, DiamondItem);
  }
}

class Emerald extends Block {
  constructor() {
    super();
    this.color = "green";
    this.toolType = "pickaxe";
    this.toolTimes = [750, 375, 188, 38, 63, 30];
  }

  giveDrops() {
    giveDrop(1, EmeraldItem);
  }
}

class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.sx = 0;
    this.sy = 0;
    this.frame = 0;
    this.solid = true;
    this.keySet = {};
    this.inventory = [];
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVelocity(vy) {
    this.vy = vy;
    return this;
  }

  setSize(sx, sy) {
    this.sx = sx;
    this.sy = sy;
    return this;
  }

  setFrame(frame) {
    this.frame = frame;
    return this;
  }

  setSolid(solid) {
    this.solid = solid;
    return this;
  }

  setInventory(inventory) {
    this.inventory = inventory;
    return this;
  }

  touches(other) {
    return (rangeTouches(this.x, this.x + this.sx, other.x, other.x + other.sx) && rangeTouches(this.y, this.y + this.sy, other.y, other.y + other.sy));
  }

  draw() {
    if (this.frame < 100) {
      var ratio = 5 / 12;
    }
    else {
      var ratio = 1 / 3;
    }
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.sx, this.sy * ratio);
    ctx.fillStyle = "purple";
    ctx.fillRect(this.x, this.y + this.sy * ratio, this.sx, this.sy * (1 - ratio));
  }

  tick() {
    this.frame = (this.frame + 1) % 200;

    var xGain = 0;
    if (this.keySet["ArrowLeft"] && this.keySet["ArrowRight"]) {
      xGain = 0;
    }
    else if (this.keySet["ArrowLeft"]) {
      xGain = -blockSize / 8;
    }
    else if (this.keySet["ArrowRight"]) {
      xGain = blockSize / 8;
    }
    this.x += xGain;

    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i].solid && entities[i] !== this) {
        while (this.touches(entities[i])) {
          this.x -= Math.sign(xGain) / 16;
        }
      }
    }

    this.vy += 0.5;

    if (this.keySet["ArrowUp"]) {
      this.vy -= blockSize / 2;
    }
    this.vy = Math.max(Math.min(this.vy, blockSize / 2), -blockSize / 4);
    var yGain = this.vy;

    this.y += yGain;

    for (var i = 0; i < entities.length; ++i) {
      if (this.touches(entities[i]) && entities[i].solid && entities[i] !== this) {
        while (this.touches(entities[i])) {
          this.y -= Math.sign(yGain) / 16;
          this.vy = 0;
        }
      }
    }

    this.x = Math.max(Math.min(screen.width - this.sx, this.x), 0);
    this.y = Math.max(Math.min(screen.height - this.sy, this.y), 0);
  }
}

function Tick() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, screen.width, screen.height);
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Block && !entities[i].solid) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    if (!entities[i] instanceof Block || entities[i].solid) {
      entities[i].draw();
    }
  }
  for (var i = 0; i < entities.length; ++i) {
    entities[i].tick();
  }
  hotbar.innerHTML = "<br/>";
  for (var i = 0; i < player.inventory.length; ++i) {
    hotbar.innerHTML += player.inventory[i][0] + " x " + player.inventory[i][1] + "<br/>";
  }
}

var seedX = randint(500000, 1000000);
var seedY = randint(500000, 1000000);

var donePlayer = false;

var arr = [[Dirt, -0.3, 5],
           [Coal, -0.35, 6],
           [Copper, -0.4, 4],
           [Iron, -0.4, 4],
           [Redstone, -0.45, 3],
           [Gold, -0.45, 3],
           [Lapis, -0.5, 3],
           [Diamond, -0.55, 2],
           [Emerald, -0.6, 2]];

for (var i = 0; i < mapWidth; ++i) {
  var blockCount = 0;
  for (var j = 0; j < mapHeight; ++j) {
    var val = perlin(seedX + i / 16, seedY + j / 16);
    var num = (mapHeight - 2 * j - 1) / mapHeight;
    if (num < 0) {
      val += num / 3;
    }
    else {
      val += num / 2;
    }
    if (val < 0) {
      if (blockCount == 0) {
        if (j >= 2 && !donePlayer) {
          donePlayer = true;
          var player = new Player().setPosition((i + 1 / 8) * blockSize, (j - 7 / 4) * blockSize).setSize(blockSize * 3 / 4, blockSize * 3 / 2);
          entities.push(player);
        }
        entities.push(new Grass().setPosition(i * blockSize, j * blockSize));
      }
      else if (blockCount <= randint(4, 9)) {
        entities.push(new Dirt().setPosition(i * blockSize, j * blockSize));
      }
      else {
        var foundOre = false;
        for (var k = 0; k < arr.length; ++k) {
          var oreVal = perlin(seedX / Math.pow(2, k + 1) + i / arr[k][2], seedY / Math.pow(2, k + 1) + j / arr[k][2]);
          if (oreVal < arr[k][1]) {
            entities.push(new arr[k][0]().setPosition(i * blockSize, j * blockSize));
            foundOre = true;
            break;
          }
        }
        if (!foundOre) {
          entities.push(new Stone().setPosition(i * blockSize, j * blockSize));
        }
      }
      blockCount++;
    }
    else {
      entities.push(new Air().setPosition(i * blockSize, j * blockSize));
    }
  }
}

screen.width = blockSize * mapWidth;
screen.height = blockSize * mapHeight;

setInterval(Tick, 20);

window.onkeydown = function(e) {
  player.keySet[e.key] = true;
};

window.onkeyup = function(e) {
  player.keySet[e.key] = false;
};

screen.onmousemove = function(e) {
  mouseX = e.clientX - rect.x;
  mouseY = e.clientY - rect.y;
};

screen.onmousedown = function(e) {
  mouseDown = true;
};

screen.onmouseup = function(e) {
  mouseDown = false;
};

/*
var gameMap = ["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
               "D                              D",
               "DDDDD      DDDDDDDDDD      DDDDD",
               "D   D       D      D       D   D",
               "D D D       DD DD DD       D D D",
               "D DDD        D    D        DDD D",
               "D            D    D            D",
               "D             D  D             D",
               "D             D  D             D",
               "D         DD  D  D  DD         D",
               "D          DDDD  DDDD          D",
               "D          DDDD  DDDD          D",
               "D                              D",
               "D              DD              D",
               "D             DDDD             D",
               "D            DD  DD            D",
               "D                              D",
               "D            DD  DD            D",
               "D             DDDD             D",
               "D DDDDDDDDDDDDDDDDDDDDDDDDDDDD D",
               "D DD           DD           DD D",
               "D        D     DD     D        D",
               "DS             DD              D",
               "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"];
*/
