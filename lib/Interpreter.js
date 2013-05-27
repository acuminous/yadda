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
        var iterator = function(step, index, callback) {
            _this.interpret_step(step, ctx, callback);
        };
        if (!next) iterator = fn.asynchronize(null, iterator);
        $(scenario).eachAsync(iterator, next);
    };

    this.interpret_step = function(step, ctx, callback) {
        this.rank_macros(step).clear_winner().interpret(step, ctx, callback);
    };  

    this.rank_macros = function(step) {
        return new Competition(step, compatible_macros(step));
    };

    var compatible_macros = function(step) {
        return libraries.inject([], function(macros, library) {
            return macros.concat(library.find_compatible_macros(step));
        });
    };
}

module.exports = Interpreter;