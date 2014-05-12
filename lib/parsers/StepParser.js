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

var $ = require('../Array');

var StepParser = function() {

    var NON_BLANK_REGEX = /[^\s]/;

    this.parse = function(text, next) {
        var steps = split(text).find_all(non_blanks);
        return next && next(steps) || steps;
    };

    var split = function(text) {
        return $(text.split(/\n/));
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };
};

module.exports = StepParser;
