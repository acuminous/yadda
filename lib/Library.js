var Macro = require('./Macro');
var Dictionary = require('./Dictionary');
var $ = require('./Array');

// Understands how to index macros
var Library = function(dictionary) {

    var dictionary = dictionary || new Dictionary();
    var macros = $();
    var _this = this;

    this.define = function(signatures, fn, macro_context) {
        $(signatures).each(function(signature) {
            define_macro(signature, fn, macro_context);
        });
        return this;
    };

    var define_macro = function(signature, fn, macro_context) {
        if (_this.get_macro(signature))
            throw new Error('Duplicate macro: [' + signature + ']');
        macros.push(new Macro(signature, dictionary.expand(signature),
                    fn, macro_context));
    };

    this.get_macro = function(signature) {
        return macros.find(function(other_macro) {
            return other_macro.is_identified_by(signature);
        });
    };

    this.find_compatible_macros = function(step) {
        return macros.find_all(function(macro) {
            return macro.can_interpret(step);
        });
    };
};

module.exports = Library;
