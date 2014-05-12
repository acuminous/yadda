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
var Context = require('./Context');
var RegularExpression = require('./RegularExpression');
var EventBus = require('./EventBus');

// Understands how to invoke a step
var Macro = function(signature, signature_pattern, macro, macro_context) {

    /* jslint shadow: true */
    var signature_pattern = new RegularExpression(signature_pattern);
    var macro = macro || fn.async_noop;
    var event_bus = EventBus.instance();
    var _this = this;

    var init = function(signature, signature_pattern) {
        _this.signature = normalise(signature);
    };

    this.is_identified_by = function(other_signature) {
        return this.signature == normalise(other_signature);
    };

    this.can_interpret = function(step) {
        return signature_pattern.test(step);
    };

    this.interpret = function(step, scenario_context, next) {
        var context = new Context().merge(macro_context).merge(scenario_context);
        var args = signature_pattern.groups(step);
        event_bus.send(EventBus.ON_EXECUTE, { step: step, ctx: context.properties, pattern: signature_pattern.toString(), args: args });
        fn.invoke(macro, context.properties, args.concat(next));
    };

    this.levenshtein_signature = function() {
        return signature_pattern.without_expressions();
    };

    var normalise = function(signature) {
        return new RegExp(signature).toString();
    };

    this.toString = function() {
        return this.signature;
    };

    init(signature, signature_pattern);
};

module.exports = Macro;
