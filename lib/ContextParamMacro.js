const Macro = require('./Macro');

// Understands how to invoke a step, passing the context as the first argument
const ContextParamMacro = function () {
  Macro.apply(this, arguments);

  this.assemble_args = (properties, args) => [properties].concat(args);
};

module.exports = ContextParamMacro;
