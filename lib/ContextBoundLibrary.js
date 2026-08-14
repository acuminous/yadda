const BaseLibrary = require('./BaseLibrary');
const ContextBoundMacro = require('./ContextBoundMacro');

// Understands how to index macros that bind the context to `this`
const ContextBoundLibrary = function () {
  BaseLibrary.apply(this, arguments);

  this.create_macro = (signature, parsed_signature, fn, macro_context, options) => new ContextBoundMacro(signature, parsed_signature, fn, macro_context, this, options);
};

module.exports = ContextBoundLibrary;
