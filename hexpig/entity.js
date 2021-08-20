'use strict';

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.shape = '';
  }

  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setShape(shape) {
    this.shape = shape;
    return this;
  }

  draw(ctx, model_set) {
    var model = model_set.get(this.shape);
    model.render(ctx);
  }
}
