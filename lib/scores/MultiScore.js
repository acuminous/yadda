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
var fn = require('../fn');

var MultiScore = function(scores) {

    this.scores = $(scores);
    this.type = 'MultiScore';

    this.compare = function(other) {
        for (var i = 0; i < this.scores.length; i++) {
            var difference = this.scores[i].compare(other.scores[i]);
            if (difference) return difference;
        }
        return 0;
    };

    this.equals = function(other) {
        if (!other) return false;
        if (this.type !== other.type) return false;
        return this.compare(other) === 0;
    };
};

module.exports = MultiScore;
