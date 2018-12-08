"use strict";

var Competition = require('./Competition');
var Context = require('./Context');
var EventBus = require('./EventBus');
var $ = require('./Array');
var fn = require('./fn');

// Understands a scenario
var Interpreter = function(libraries) {

    // eslint-disable-next-line no-redeclare
    var libraries = $(libraries);
    var event_bus = EventBus.instance();
    var last_macro;
    var _this = this;

    this.requires = function(libs) {
        libraries.push_all(libs);
        return this;
    };

    this.validate = function(scenario) {
        var results = $(scenario).collect(function(step) {
            var report = _this.rank_macros(step).validate();
            last_macro = report.winner;
            return report;
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
        var macro = this.rank_macros(step).clear_winner();
        last_macro = macro;
        macro.interpret(step, context || {}, next);
    };

    this.rank_macros = function(step) {
        return new Competition(step, compatible_macros(step), last_macro);
    };

    var compatible_macros = function(step) {
        return libraries.inject([], function(macros, library) {
            return macros.concat(library.find_compatible_macros(step));
        });
    };
};

module.exports = Interpreter;
