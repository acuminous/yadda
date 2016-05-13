/*
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: true */
"use strict";

var fn = require('./fn');
var $ = require('./Array');
var Context = require('./Context');
var RegularExpression = require('./RegularExpression');
var EventBus = require('./EventBus');

// Understands how to invoke a step
var Macro = function(signature, parsed_signature, macro, macro_context, library) {

    /* jslint shadow: true */
    var signature = normalise(signature);
    var signature_pattern = new RegularExpression(parsed_signature.pattern);
    var macro = macro || fn.async_noop;
    var event_bus = EventBus.instance();

    this.library = library;

    this.is_identified_by = function(other_signature) {
        return signature == normalise(other_signature);
    };

    this.can_interpret = function(step) {
        return signature_pattern.test(step);
    };

    this.interpret = function(step, scenario_context, next) {
        var context = new Context({step:step}).merge(macro_context).merge(scenario_context);
        convert(signature_pattern.groups(step), function(err, args) {
            if (err) return next(err);
            event_bus.send(EventBus.ON_EXECUTE, { step: step, ctx: context.properties, pattern: signature_pattern.toString(), args: args });
            var result = fn.invoke(macro, context.properties, args.concat(next));
            if (is_promise(result)) return result.then(function() {
                next();
            });
            if (is_async(args, next)) return next();
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
        return result && result.then;
    }

    function is_async(args, next) {
        return macro.length === args.length && next;
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
            return converter(callback);
        }, next);
    }

    event_bus.send(EventBus.ON_DEFINE, { signature: signature, pattern: signature_pattern.toString() });
};

module.exports = Macro;
