'use strict';

class EntitySet {
  constructor() {
    this.entities = [];
  }

  addEntity(entity) {
    this.entities.push(entity);
    return this;
  }

  tick() {
    for (var i = 0; i < entities.length; ++i) {
      entities[i].tick();
    }
  }

  draw(ctx, model_set) {
    model_set.bind(ctx);
    for (var i = 0; i < entities.length; ++i) {
      entities[i].draw(ctx, model_set);
    }
  }
}
