'use strict';

class EntitySet {
  constructor() {
    this.entities = [];
  }

  add(entity) {
    this.entities.push(entity);
    return this;
  }

  tick() {
    for (var i = 0; i < this.entities.length; ++i) {
      this.entities[i].tick();
    }
  }

  draw(ctx, model_set) {
    model_set.bind(ctx);
    for (var i = 0; i < this.entities.length; ++i) {
      this.entities[i].draw(ctx, model_set);
    }
  }
}
