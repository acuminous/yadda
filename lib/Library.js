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

var Macro = require('./Macro');
var Dictionary = require('./Dictionary');
var $ = require('./Array');

// Understands how to index macros
var Library = function(dictionary) {

    /* jslint shadow: true */
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
        if (_this.get_macro(signature)) throw new Error('Duplicate macro: [' + signature + ']');
        macros.push(new Macro(signature, dictionary.expand(signature), fn, macro_context));
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
