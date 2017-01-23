"use strict";

var fn = require('./fn');
var $ = require('./Array');
var Context = require('./Context');
var RegularExpression = require('./RegularExpression');
var EventBus = require('./EventBus');

// Understands how to invoke a step
var Macro = function(signature, parsed_signature, macro, macro_context, library, options) {

    /* eslint-disable no-redeclare */
    var signature = normalise(signature);
    var signature_pattern = new RegularExpression(parsed_signature.pattern);
    var macro = macro || fn.async_noop;
    var event_bus = EventBus.instance();
    var options = options || {};
    /* eslint-enable no-redeclare */

    this.library = library;

    this.is_identified_by = function(other_signature) {
        return signature === normalise(other_signature);
    };

    this.can_interpret = function(step) {
        return signature_pattern.test(step);
    };

    this.interpret = function(step, scenario_context, next) {
        var context = new Context({step:step}).merge(macro_context).merge(scenario_context);
        convert(signature_pattern.groups(step), function(err, args) {
            if (err) return next(err);
            event_bus.send(EventBus.ON_EXECUTE, { step: step, ctx: context.properties, pattern: signature_pattern.toString(), args: args });
            var result;
            try {
                result = fn.invoke(macro, context.properties, is_sync(args) ? args : args.concat(next));
            } catch (err) {
                if (next) return next(err);
                throw err;
            }
            if (is_promise(result)) return result.then(fn.noargs(next)).catch(next);
            if (is_sync(args)) return next && next();
        });
    };

    this.is_sibling = function(other_macro) {
        return other_macro && other_macro.defined_in(library);
    };

    this.defined_in = function(other_library) {
        return library === other_library;
    };

    this.levenshtein_signature = function() {
        return signature_pattern.without_expressions();
    };

    this.toString = function() {
        return signature;
    };

    function is_promise(result) {
        if (options.mode) return options.mode === 'promise';
        return result && result.then;
    }

    function is_sync(args) {
        if (options.mode) return options.mode === 'sync';
        return macro !== fn.async_noop && macro.length !== args.length + 1;
    }

    function normalise(signature) {
        return new RegExp(signature).toString();
    }

    function convert(args, next) {
        var index = 0;
        return $(parsed_signature.converters).collect(function(converter) {
            return function(callback) {
                converter.apply(null, args.slice(index, index += converter.length - 1).concat(callback));
            };
        }).collect_async(function(converter, index, callback) {
            converter(callback);
        }, next);
    }

    event_bus.send(EventBus.ON_DEFINE, { signature: signature, pattern: signature_pattern.toString() });
};

module.exports = Macro;
