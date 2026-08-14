const BaseLibrary = require('./BaseLibrary');
const ContextParamMacro = require('./ContextParamMacro');

// Understands how to index macros that receive the context as the first argument
const ContextParamLibrary = function () {
  BaseLibrary.apply(this, arguments);

  this.create_macro = (signature, parsed_signature, fn, macro_context, options) => new ContextParamMacro(signature, parsed_signature, fn, macro_context, this, options);
};

module.exports = ContextParamLibrary;
