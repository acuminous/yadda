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

var $ = require('../Array');

var TextParser = function() {

    var FEATURE_REGEX = /^\s*Feature:\s*(.*)/i;
    var SCENARIO_REGEX = /^\s*Scenario:\s*(.*)/i;
    var STEP_REGEX = /^\s*([^\s].*)/;
    var NON_BLANK_REGEX = /[^\s]/;

    var current_feature;
    var current_scenario;
    var scenarios;

    this.parse = function(text) {
        current_scenario = {};
        current_feature = null;
        scenarios = [];
        split(text).each(function(line) {
            parse_line(line);
        });
        return scenarios;
    };

    var split = function(text) {
        return $(text.split(/\n/)).find_all(non_blanks);
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };

    var parse_line = function(line) {
        var match;
        if (match = FEATURE_REGEX.exec(line)) {
            if (current_feature != null) throw "You can only specify a single feature";
            current_feature = match[1];
        } else if (match = SCENARIO_REGEX.exec(line)) {
            current_scenario = { title: match[1], steps: [] };
            scenarios.push(current_scenario);
        } else if (match = STEP_REGEX.exec(line)) {
            current_scenario.steps.push(match[1]);
        }
    };
};

module.exports = TextParser;
