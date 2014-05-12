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

var Competition = require('./Competition');
var Context = require('./Context');
var EventBus = require('./EventBus');
var $ = require('./Array');
var fn = require('./fn');

// Understands a scenario
var Interpreter = function(libraries) {

    /* jslint shadow: true */
    var libraries = $(libraries);
    var event_bus = EventBus.instance();
    var _this = this;

    this.requires = function(libraries) {
        libraries.push_all(libraries);
        return this;
    };

    this.validate = function(scenario) {
        var results = $(scenario).collect(function(step) {
            return _this.rank_macros(step).validate();
        });
        if (results.find(by_invalid_step)) throw new Error('Scenario cannot be interpreted\n' + results.collect(validation_report).join('\n'));
    };

    function by_invalid_step(result) {
        return !result.valid;
    }

    function validation_report(result) {
        return result.step + (result.valid ? '' : ' <-- ' + result.reason);
    }

    this.interpret = function(scenario, scenario_context, next) {
        scenario_context = new Context().merge(scenario_context);
        event_bus.send(EventBus.ON_SCENARIO, { scenario: scenario, ctx: scenario_context.properties });
        var iterator = make_step_iterator(scenario_context, next);
        $(scenario).each_async(iterator, next);
    };

    var make_step_iterator = function(scenario_context, next) {
        var iterator = function(step, index, callback) {
            _this.interpret_step(step, scenario_context, callback);
        };
        return next ? iterator : fn.asynchronize(null, iterator);
    };

    this.interpret_step = function(step, scenario_context, next) {
        var context = new Context().merge(scenario_context);
        event_bus.send(EventBus.ON_STEP, { step: step, ctx: context.properties });
        this.rank_macros(step).clear_winner().interpret(step, context || {}, next);
    };

    this.rank_macros = function(step) {
        return new Competition(step, compatible_macros(step));
    };

    var compatible_macros = function(step) {
        return libraries.inject([], function(macros, library) {
            return macros.concat(library.find_compatible_macros(step));
        });
    };
};

module.exports = Interpreter;
