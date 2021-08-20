'use strict';

class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  setPosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
}
