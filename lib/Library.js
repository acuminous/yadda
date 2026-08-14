const Macro = require('./Macro');
const Dictionary = require('./Dictionary');
const $ = require('./Array');

// Understands how to index macros
const Library = function (dictionary = new Dictionary()) {
  const macros = $();

  this.define = function (signatures, fn, macro_context, options) {
    $(signatures).each((signature) => {
      define_macro(signature, fn, macro_context, options);
    });
    return this;
  };

  const define_macro = (signature, fn, macro_context, options) => {
    if (this.get_macro(signature)) throw new Error(`Duplicate macro: [${signature}]`);
    macros.push(new Macro(signature, dictionary.expand(signature), fn, macro_context, this, options));
  };

  this.get_macro = (signature) => macros.find((other_macro) => other_macro.is_identified_by(signature));

  this.find_compatible_macros = (step) => macros.find_all((macro) => macro.can_interpret(step));
};

module.exports = Library;
