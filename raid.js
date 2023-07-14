"use strict";

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function uniform(a, b) {
  return a + Math.random() * (b - a);
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

var selection = -1;

class Block {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.sx = blockSize;
    this.sy = blockSize;
    this.solid = true;
    this.color = "";
    this.mineable = true;
    this.mineTime = 0;
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

  setMineable(mineable) {
    this.mineable = mineable;
    return this;
  }

  setMineTime(mineTime) {
    this.mineTime = mineTime;
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
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }

  tick() {
    if (mouseX >= this.x && mouseX < (this.x + this.sx) && mouseY >= this.y && mouseY < (this.y + this.sy)) {
      var coord1 = (player.x + player.sx / 2);
      var coord2 = (player.y + player.sy / 2);
      var coord3 = (this.x + this.sx / 2);
      var coord4 = (this.y + this.sy / 2);
      var dist = Math.sqrt((coord3 - coord1) * (coord3 - coord1) + (coord4 - coord2) * (coord4 - coord2)) / blockSize;
      if (dist > 6) {
        this.hovering = false;
        this.count = 0;
        return;
      }
      this.hovering = true;
      if (mouseDown && this.mineable) {
        this.count += 1 / this.mineTime;
        if (this.count >= 1) {
          setBlock(new Air().setPosition(this.x, this.y));
          this.giveDrops();
        }
      }
      else {
        this.count = 0;
        if (player.keySet["p"] && (findBlock(this.x, this.y) instanceof Air) && selection >= 0 && player.inventory[selection][0].placeable && player.inventory[selection][1] > 0) {
          for (var i = 0; i < entities.length; ++i) {
            if (entities[i] === this) {
              entities[i] = new player.inventory[selection][0].block().setPosition(this.x, this.y);
              if (player.touches(entities[i])) {
                entities[i] = new Air().setPosition(this.x, this.y);
              }
              else {
                player.inventory[selection][1]--;
              }
              break;
            }
          }
        }
      }
    }
    else {
      this.hovering = false;
      this.count = 0;
    }
  }
}

function giveDrop(quantity, itemType) {
  var newItem = new itemType();
  for (var i = 0; i < player.inventory.length; ++i) {
    if (player.inventory[i][0].name === newItem.name && player.inventory[i][1] != 0) {
      player.inventory[i][0] = newItem;
      var val = Math.min(quantity, newItem.stackLimit - player.inventory[i][1]);
      player.inventory[i][1] += val;
      quantity -= val;
    }
  }
  for (var i = 0; i < player.inventory.length; ++i) {
    if (player.inventory[i][1] == 0) {
      player.inventory[i][0] = newItem;
      var val = Math.min(quantity, newItem.stackLimit - player.inventory[i][1]);
      player.inventory[i][1] += val;
      quantity -= val;
    }
  }
}

class Air extends Block {
  constructor() {
    super();
    this.solid = false;
    this.mineable = false;
    this.color = "skyblue";
  }
}

class Grass extends Block {
  constructor() {
    super();
    this.mineTime = 45;
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
    this.mineTime = 38;
  }

  giveDrops() {
    giveDrop(1, DirtItem);
  }
}

class Sand extends Block {
  constructor() {
    super();
    this.color = "bisque";
    this.mineTime = 38;
  }

  giveDrops() {
    giveDrop(1, SandItem);
  }
}

class Sandstone extends Block {
  constructor() {
    super();
    this.mineTime = 200;
  }

  giveDrops() {
    giveDrop(1, SandstoneItem);
  }

  draw() {
   if (this.hovering) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
    else {
      ctx.fillStyle = "bisque";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
      ctx.fillStyle = "gray";
      ctx.fillRect(this.x + this.sx / 2, this.y, this.sx / 2, this.sy / 2);
      ctx.fillRect(this.x, this.y + this.sy / 2, this.sx / 2, this.sy / 2);
    }
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }
}

class RedSand extends Block {
  constructor() {
    super();
    this.color = "orangered";
    this.mineTime = 38;
  }

  giveDrops() {
    giveDrop(1, RedSandItem);
  }
}

class RedSandstone extends Block {
  constructor() {
    super();
    this.mineTime = 200;
  }

  giveDrops() {
    giveDrop(1, RedSandstoneItem);
  }

  draw() {
   if (this.hovering) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
    else {
      ctx.fillStyle = "orangered";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
      ctx.fillStyle = "gray";
      ctx.fillRect(this.x + this.sx / 2, this.y, this.sx / 2, this.sy / 2);
      ctx.fillRect(this.x, this.y + this.sy / 2, this.sx / 2, this.sy / 2);
    }
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }
}

class Snow extends Block {
  constructor() {
    super();
    this.color = "white";
    this.mineTime = 25;
  }

  giveDrops() {
    giveDrop(0, DirtItem);
  }
}

class Leaves extends Block {
  constructor() {
    super();
    this.mineTime = 15;
  }

  giveDrops() {
    if (randint(0, 49) == 0) {
      giveDrop(randint(1, 2), StickItem);
    }
    if (randint(0, 199) == 0) {
      giveDrop(1, AppleItem);
    }
  }

  draw() {
    if (this.hovering) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
    else {
      ctx.fillStyle = "forestgreen";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
      ctx.fillStyle = "darkgreen";
      ctx.fillRect(this.x + this.sx / 2, this.y, this.sx / 2, this.sy / 2);
      ctx.fillRect(this.x, this.y + this.sy / 2, this.sx / 2, this.sy / 2);
    }
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }
}

class Log extends Block {
  constructor() {
    super();
    this.color = "saddlebrown";
    this.mineTime = 150;
  }

  giveDrops() {
    giveDrop(1, LogItem);
  }
}

class Cactus extends Block {
  constructor() {
    super();
    this.mineTime = 30;
  }

  giveDrops() {
    giveDrop(1, CactusItem);
  }

  draw() {
    if (this.hovering) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
    else {
      ctx.fillStyle = "green";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
      ctx.fillStyle = "black";
      ctx.fillRect(this.x + this.sx / 2, this.y, this.sx / 2, this.sy / 2);
      ctx.fillRect(this.x, this.y + this.sy / 2, this.sx / 2, this.sy / 2);
    }
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }
}

class Deadbush extends Block {
  constructor() {
    super();
    this.mineTime = 0;
  }

  giveDrops() {
    giveDrop(randint(0, 2), StickItem);
  }

  draw() {
    if (this.hovering) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
    else {
      ctx.fillStyle = "skyblue";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
      ctx.fillStyle = "burlywood";
      ctx.fillRect(this.x, this.y, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x + this.sx / 4, this.y + this.sy / 4, this.sx / 4, this.sy * 3 / 4);
      ctx.fillRect(this.x + this.sx / 4, this.y + this.sy / 2, this.sx / 4, this.sy / 4);
      ctx.fillRect(this.x + this.sx * 3 / 4, this.y, this.sx / 4, this.sy / 4);
    }
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }
}

class Stone extends Block {
  constructor() {
    super();
    this.color = "gray";
    this.mineTime = 375;
  }

  giveDrops() {
    giveDrop(1, CobblestoneItem);
  }
}

class Cobblestone extends Block {
  constructor() {
    super();
    this.mineTime = 500;
  }

  giveDrops() {
    giveDrop(1, CobblestoneItem);
  }

  draw() {
    if (this.hovering) {
      ctx.fillStyle = "purple";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
    }
    else {
      ctx.fillStyle = "darkgray";
      ctx.fillRect(this.x, this.y, this.sx, this.sy);
      ctx.fillStyle = "lightgray";
      ctx.fillRect(this.x + this.sx / 2, this.y, this.sx / 2, this.sy / 2);
      ctx.fillRect(this.x, this.y + this.sy / 2, this.sx / 2, this.sy / 2);
    }
    if (this.count > 0) {
      this.drawShell(Math.floor(this.count * 8));
    }
  }
}

class Coal extends Block {
  constructor() {
    super();
    this.color = "black";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(1, CoalItem);
  }
}

class Copper extends Block {
  constructor() {
    super();
    this.color = "darksalmon";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(randint(2, 5), RawCopperItem);
  }
}

class Iron extends Block {
  constructor() {
    super();
    this.color = "papayawhip";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(1, RawIronItem);
  }
}

class Redstone extends Block {
  constructor() {
    super();
    this.color = "red";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(randint(4, 5), RedstoneDustItem);
  }
}

class Gold extends Block {
  constructor() {
    super();
    this.color = "gold";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(1, RawGoldItem);
  }
}

class Lapis extends Block {
  constructor() {
    super();
    this.color = "blue";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(randint(4, 9), LapisItem);
  }
}

class Diamond extends Block {
  constructor() {
    super();
    this.color = "cyan";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(1, DiamondItem);
  }
}

class Emerald extends Block {
  constructor() {
    super();
    this.color = "green";
    this.mineTime = 750;
  }

  giveDrops() {
    giveDrop(1, EmeraldItem);
  }
}

class Item {
  constructor() {
    this.name = "";
    this.stackLimit = 64;
    this.placeable = true;
    this.block = Air;
  }
}

class DirtItem extends Item {
  constructor() {
    super();
    this.name = "Dirt";
    this.block = Dirt;
  }
}

class SandItem extends Item {
  constructor() {
    super();
    this.name = "Sand";
    this.block = Sand;
  }
}

class SandstoneItem extends Item {
  constructor() {
    super();
    this.name = "Sandstone";
    this.block = Sandstone;
  }
}

class RedSandItem extends Item {
  constructor() {
    super();
    this.name = "Red Sand";
    this.block = RedSand;
  }
}

class RedSandstoneItem extends Item {
  constructor() {
    super();
    this.name = "Red Sandstone";
    this.block = RedSandstone;
  }
}

class StickItem extends Item {
  constructor() {
    super();
    this.name = "Stick";
    this.placeable = false;
  }
}

class AppleItem extends Item {
  constructor() {
    super();
    this.name = "Apple";
    this.placeable = false
  }
}

class LogItem extends Item {
  constructor() {
    super();
    this.name = "Log";
    this.block = Log;
  }
}

class CactusItem extends Item {
  constructor() {
    super();
    this.name = "Cactus";
    this.block = Cactus;
  }
}

class CobblestoneItem extends Item {
  constructor() {
    super();
    this.name = "Cobblestone";
    this.block = Cobblestone;
  }
}

class CoalItem extends Item {
  constructor() {
    super();
    this.name = "Coal";
    this.placeable = false;
  }
}

class RawCopperItem extends Item {
  constructor() {
    super();
    this.name = "Raw Copper";
    this.placeable = false;
  }
}

class RawIronItem extends Item {
  constructor() {
    super();
    this.name = "Raw Iron";
    this.placeable = false;
  }
}

class RedstoneDustItem extends Item {
  constructor() {
    super();
    this.name = "Redstone Dust";
    this.placeable = false;
  }
}

class RawGoldItem extends Item {
  constructor() {
    super();
    this.name = "Raw Gold";
    this.placeable = false;
  }
}

class LapisItem extends Item {
  constructor() {
    super();
    this.name = "Lapis Lazuli";
    this.placeable = false;
  }
}

class DiamondItem extends Item {
  constructor() {
    super();
    this.name = "Diamond";
    this.placeable = false;
  }
}

class EmeraldItem extends Item {
  constructor() {
    super();
    this.name = "Emerald";
    this.placeable = false;
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
    var filler = new Dirt();
    this.inventory = [];
    for (var i = 0; i < 9; ++i) {
      this.inventory.push([filler, 0]);
    }
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
  hotbar.innerHTML = "<br/>Your inventory:<br/><br/>";
  for (var i = 0; i < player.inventory.length; ++i) {
    if (player.inventory[i][1] == 0) {
      hotbar.innerHTML += "[Empty slot]";
    }
    else {
      hotbar.innerHTML += player.inventory[i][1] + " x " + player.inventory[i][0].name;
    }
    if (i == selection) {
      hotbar.innerHTML += " [selected]";
    }
    hotbar.innerHTML += "<br/>";
  }
}

var seedX = randint(500000, 1000000);
var seedY = randint(500000, 1000000);
var seedZ = randint(500000, 1000000);

var biomes = [[[Grass, 0, 0], [Dirt, 4, 9]],
              [[Sand, 4, 9], [Sandstone, 9, 14]],
              [[RedSand, 4, 9], [RedSandstone, 9, 14]],
              [[Snow, 4, 9]]];

function chooseBiome(oldBiome) {
  if (oldBiome == 0) {
    return randint(1, 3);
  }
  else {
    return 0;
  }
}

var biome = randint(0, biomes.length - 1);
var oldBiomeVal = 0;
var biomeVal = 0;

var arr = [];
var count = 0;
for (var i = 0; i < mapWidth; ++i) {
  biomeVal = perlin(seedZ + i / 16, 0);
  if ((biomeVal < 0 && oldBiomeVal >= 0) || (biomeVal >= 0 && oldBiomeVal < 0)) {
    arr.push([biome, count]);
    biome = chooseBiome(biome);
    count = 0;
  }
  count++;
}
arr.push([biome, count]);

while (true) {
  var found = false;
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i][1] <= 7) {
      found = true;
      if (i == 0) {
        arr[1][1] += arr[0][1];
      }
      else {
        arr[i - 1][1] += arr[i][1];
      }
      arr.splice(i, 1);
      break;
    }
  }
  if (!found) {
    break;
  }
}

var ores = [[Dirt, -0.3, 5],
            [Coal, -0.35, 6],
            [Copper, -0.4, 4],
            [Iron, -0.4, 4],
            [Redstone, -0.45, 3],
            [Gold, -0.45, 3],
            [Lapis, -0.5, 3],
            [Diamond, -0.55, 2],
            [Emerald, -0.6, 2]];

var index = 0;
var count = arr[index][1];
for (var i = 0; i < mapWidth; ++i) {
  if (i >= count) {
    index++;
    count += arr[index][1];
  }
  var biome = arr[index][0];
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
      var foundBlock = false;
      for (var k = 0; k < biomes[biome].length; ++k) {
        if (blockCount <= randint(biomes[biome][k][1], biomes[biome][k][2])) {
          entities.push(new biomes[biome][k][0]().setPosition(i * blockSize, j * blockSize));
          foundBlock = true;
          break;
        }
      }
      if (!foundBlock) {
        var foundOre = false;
        for (var k = 0; k < ores.length; ++k) {
          var oreVal = perlin(seedX / Math.pow(2, k + 1) + i / ores[k][2], seedY / Math.pow(2, k + 1) + j / ores[k][2]);
          if (oreVal < ores[k][1]) {
            entities.push(new ores[k][0]().setPosition(i * blockSize, j * blockSize));
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

function findBlock(x, y) {
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Block && entities[i].x == x && entities[i].y == y) {
      return entities[i];
    }
  }
}

function setBlock(block) {
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Block && entities[i].x == block.x && entities[i].y == block.y) {
      entities[i] = block;
      return;
    }
  }
}

for (var i = 0; i < entities.length; ++i) {
  if (entities[i] instanceof Grass && randint(0, 4) == 0) {
    var height = randint(4, 6);
    if (entities[i].y < (height + 3) * blockSize) {
      continue;
    }
    setBlock(new Dirt().setPosition(entities[i].x, entities[i].y));
    for (var j = 0; j < height; ++j) {
      setBlock(new Log().setPosition(entities[i].x, entities[i].y - blockSize * (j + 1)));
    }
    setBlock(new Leaves().setPosition(entities[i].x, entities[i].y - blockSize * (height + 1)));
  }
  else if ((entities[i] instanceof Sand || entities[i] instanceof RedSand) && randint(0, 4) == 0) {
    var val = randint(0, 17);
    if (val <= 1) {
      var height = 3;
    }
    else if (val <= 6) {
      var height = 2;
    }
    else {
      var height = 1;
    }
    if (entities[i].y < (height + 1) * blockSize) {
      continue;
    }
    var failed = false;
    for (var j = 0; j < height; ++j) {
      if (!(findBlock(entities[i].x, entities[i].y - blockSize * (j + 1)) instanceof Air)) {
        failed = true;
        break;
      }
    }
    if (!failed) {
      for (var j = 0; j < height; ++j) {
        setBlock(new Cactus().setPosition(entities[i].x, entities[i].y - blockSize * (j + 1)));
      }
    }
  }
  else if ((entities[i] instanceof Sand || entities[i] instanceof RedSand) && randint(0, 9) == 0) {
    if (entities[i].y == 0 || !(findBlock(entities[i].x, entities[i].y - blockSize) instanceof Air)) {
      continue;
    }
    setBlock(new Deadbush().setPosition(entities[i].x, entities[i].y - blockSize));
  }
}

function spreadLeaves(entities) {
  var toSpread = [];
  for (var i = 0; i < entities.length; ++i) {
    if (entities[i] instanceof Leaves) {
      toSpread.push(entities[i]);
    }
  }
  for (var i = 0; i < toSpread.length; ++i) {
    var x = toSpread[i].x;
    var y = toSpread[i].y;
    var val = 2 / 3;
    if ((findBlock(x, y - blockSize) instanceof Air) && Math.random() < val) {
      setBlock(new Leaves().setPosition(x, y - blockSize));
    }
    if ((findBlock(x + blockSize, y) instanceof Air) && Math.random() < val) {
      setBlock(new Leaves().setPosition(x + blockSize, y));
    }
    if ((findBlock(x, y + blockSize) instanceof Air) && Math.random() < val) {
      setBlock(new Leaves().setPosition(x, y + blockSize));
    }
    if ((findBlock(x - blockSize, y) instanceof Air) && Math.random() < val) {
      setBlock(new Leaves().setPosition(x - blockSize, y));
    }
  }
}

for (var i = 0; i < 6; ++i) {
  spreadLeaves(entities);
}

for (var i = 0; i < entities.length; ++i) {
  if (!(findBlock(entities[i].x, entities[i].y - blockSize) instanceof Air) ||
      !(findBlock(entities[i].x, entities[i].y - 2 * blockSize) instanceof Air)) {
    continue;
  }
  var success = false;
  for (var j = 0; j < biomes.length; ++j) {
    if (entities[i] instanceof biomes[j][0][0]) {
      var player = new Player().setPosition(entities[i].x + blockSize / 8, entities[i].y - blockSize * 7 / 4).setSize(blockSize * 3 / 4, blockSize * 3 / 2);
      entities.push(player);
      success = true;
      break;
    }
  }
  if (success) {
    break;
  }
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  player.keySet[e.key] = true;
  if (e.key == "1" ||
      e.key == "2" ||
      e.key == "3" ||
      e.key == "4" ||
      e.key == "5" ||
      e.key == "6" ||
      e.key == "7" ||
      e.key == "8" ||
      e.key == "9") {
    selection = parseInt(e.key) - 1;
  }
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
