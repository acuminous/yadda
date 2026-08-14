const BaseMacro = require('./BaseMacro');

// Understands how to invoke a step, binding the context to `this`
const ContextBoundMacro = function () {
  BaseMacro.apply(this, arguments);

  this.assemble_args = (_properties, args) => args;
};

module.exports = ContextBoundMacro;
