'use strict';

class Tile {
  constructor() {
    this.color = "black";
    this.image = null;
    this.solid = false;
    this.placeable = true;
    this.rounded = false;
    this.water = false;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  setImage(image) {
    this.image = image;
    return this;
  }

  setSolid(f) {
    this.solid = f;
    return this;
  }

  setPlaceable(f) {
    this.placeable = f;
    return this;
  }

  setRounded(f) {
    this.rounded = f;
    return this;
  }

  setWater(f) {
    this.water = f;
    return this;
  }

  isPlaceable() {
    return this.placeable && !this.solid;
  }

  draw(x, y, w, h) {
    if (this.image) {
      ctx.drawImage(this.image, x, y, w, h);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, w + 1, h + 1);
    }
  }

  drawCorner(offset, x, y, w, h) {
    if (!this.rounded) {
      return;
    }
    var kind = map[offset];
    var neighbors = [
      map[offset - 1],
      map[offset - WIDTH],
      map[offset + 1],
      map[offset + WIDTH],
    ];
    var corners = [
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
      [x, y],
    ];
    for (var i = 0; i < 4; i++) {
      if (kind == neighbors[i] && kind == neighbors[(i + 1) % 4] &&
          neighbors[(i + 2) % 4] == neighbors[(i + 3) % 4] &&
          kind != neighbors[(i + 2) % 4] && kind != neighbors[(i + 3) % 4]) {
        var other = neighbors[(i + 2) % 4];
        if (tiles[other].rounded && kind > other) {
          continue;
        }
        var path = new Path2D();
        path.moveTo(corners[(i + 2) % 4][0], corners[(i + 2) % 4][1]);
        path.quadraticCurveTo(corners[(i + 1) % 4][0], corners[(i + 1) % 4][1],
                              corners[(i + 0) % 4][0], corners[(i + 0) % 4][1]);
        path.lineTo(corners[(i + 1) % 4][0], corners[(i + 1) % 4][1]);
        path.closePath();
        ctx.save();
        ctx.clip(path);
        tiles[other].draw(x, y, w, h);
        ctx.restore();
      }
    }
  }
}

var tiles = [
  new Tile().setImage(dirt1).setPlaceable(false),
  new Tile().setImage(grass),
  new Tile().setImage(quadtiles1),
  new Tile().setImage(quadtiles2),
  new Tile().setImage(quadtiles3),
  new Tile().setImage(quadtiles4),
  new Tile().setImage(quadtilec1),
  new Tile().setImage(quadtilec2),
  new Tile().setImage(quadtilec3),
  new Tile().setImage(quadtilec4),
  new Tile().setImage(stone1).setSolid(true).setRounded(true),
  new Tile().setImage(marble1),
  new Tile().setColor("#f00"),
  new Tile().setColor("blue").setWater(true).setRounded(true),  // bath
  new Tile().setImage(pillar1).setSolid(true),
  new Tile().setImage(flowers1).setPlaceable(false),
  new Tile().setColor("#0ff").setWater(true).setPlaceable(false).setRounded(true),  // fountain
  new Tile().setImage(door1),
  new Tile().setImage(stairs1),
  new Tile().setImage(whitetile1),
  new Tile().setImage(sand1),
  new Tile().setImage(circle1),
  new Tile().setImage(circle2),
  new Tile().setImage(circle3),
  new Tile().setImage(circle4),
  new Tile().setImage(bw1),
  new Tile().setImage(graytile1),
];
