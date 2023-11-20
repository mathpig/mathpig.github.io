'use strict';

class Tile {
  constructor() {
    this.color = "black";
    this.image = null;
    this.angle = 0;
    this.solid = false;
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

  setSolid(f) {
    this.solid = f;
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
  new Tile().setImage(stone1).setSolid(true),
  new Tile().setImage(marble1),
  new Tile().setColor("#777"),  // arch shadow
  new Tile().setColor("blue"),  // bath
  new Tile().setImage(pillar1).setSolid(true),
  new Tile().setImage(flowers1),
  new Tile().setColor("#0ff"),  // fountain
  new Tile().setImage(door1),
  new Tile().setImage(stairs1),
  new Tile().setImage(whitetile1),
  new Tile().setImage(sand1),
];
