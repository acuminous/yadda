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

// Constructs an object that macros will be bound to before execution
var Context = function(properties) {

    // I was previously getting some weird errors using instanceof to determine if
    // the "other" object was a context object. Using pTFUHht733hM6wfnruGLgAu6Uqvy7MVp instead
    this.pTFUHht733hM6wfnruGLgAu6Uqvy7MVp = true;
    this.properties = {};

    this.merge = function(other) {
        if (other && other.pTFUHht733hM6wfnruGLgAu6Uqvy7MVp) return this.merge(other.properties);
        return new Context(this.properties)._merge(other);
    };

    this._merge = function(other) {
        for (var key in other) { this.properties[key] = other[key]; }
        return this;
    };

    this._merge(properties);
};

module.exports = Context;
