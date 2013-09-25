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

var Competition = require('./Competition');
var EventMixin = require('./EventMixin');
var $ = require('./Array');
var fn = require('./fn');

// Understands a scenario
var Interpreter = function(libraries) {

    var libraries = $(libraries);
    var _this = this;

    this.requires = function(libraries) {
        libraries.push_all(libraries);
        return this;
    };

    this.interpret = function(scenario, ctx, next) {
        var iterator = make_step_iterator(ctx, next);
        this.emit_scenario_events(scenario, ctx, function(callback) {  
            $(scenario).eachAsync(iterator, callback);
        }, next);
    };

    var make_step_iterator = function(ctx, next) {
        var iterator = function(step, index, callback) {
            _this.interpret_step(step, ctx, callback);
        };
        return next ? iterator : fn.asynchronize(null, iterator);        
    };

    this.interpret_step = function(step, ctx, next) {
        this.emit_step_events(step, ctx, function(callback) {
            _this.rank_macros(step).clear_winner().interpret(step, ctx, callback);
        }, next);
    };  

    this.rank_macros = function(step) {
        return new Competition(step, compatible_macros(step));
    };

    var compatible_macros = function(step) {
        return libraries.inject([], function(macros, library) {
            return macros.concat(library.find_compatible_macros(step));
        });
    };

    this.emit_scenario_events = function(scenario, ctx, fn, next) {
        var event_data = { scenario: scenario, ctx: ctx };
        _this.emit_around(fn, Interpreter.BEFORE_SCENARIO, Interpreter.AFTER_SCENARIO, event_data, next);       
    };

    this.emit_step_events = function(step, ctx, fn, next) {
        var event_data = { step: step, ctx: ctx };        
        _this.emit_around(fn, Interpreter.BEFORE_STEP, Interpreter.AFTER_STEP, event_data, next);       
    };

    new EventMixin().bless(this);
};

Interpreter.BEFORE_STEP = '__BEFORE_STEP__';
Interpreter.AFTER_STEP = '__AFTER_STEP__';
Interpreter.BEFORE_SCENARIO = '__BEFORE_SCENARIO__';
Interpreter.AFTER_SCENARIO = '__AFTER_SCENARIO__';

module.exports = Interpreter;