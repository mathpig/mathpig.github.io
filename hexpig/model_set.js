'use strict';

class ModelSet {
  constructor() {
    this.model_program = null;
    this.models = {};
  }

  get(ctx, name) {
    if (this.models[name]) {
      return this.models[name];
    }
    var model = new Model();
    this.models[name] = model;
    model.loadUrl(ctx, 'models/' + name + '.obj');
    return model;
  }

  setup(ctx) {
    this.model_program = ModelShader(ctx);
  }

  bind(ctx) {
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
    UseProgram(this.model_program);
  }
}
