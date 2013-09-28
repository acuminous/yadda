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
    var PENDING_SCENARIO_REGEX = /^\s*Pending\s*Scenario:\s*(.*)/i;
    var STEP_REGEX = /^\s*([^\s].*)/;
    var NON_BLANK_REGEX = /[^\s]/;

    this.parse = function(text) {
        var new_feature = { scenarios: [], last_scenario: function() { return this.scenarios[this.scenarios.length - 1] } };
        
        return split(text).inject(new_feature, function(feature_so_far, line) {
            return parse_line(feature_so_far, line);
        });
    };

    var dispatch = function() {
        var handlers = arguments;
        
        return function(feature, line) {
            for (var handlerIdx = 0; handlerIdx < handlers.length; handlerIdx++) {
                var handler = handlers[handlerIdx];
                
                var augmented_feature = handler(feature, line);
                if (augmented_feature) return augmented_feature;
            };
        };
    };
    
    var line_handler = function(regex, handle_function) {
        return function(feature, line) {
            var match = regex.exec(line);
            
            if (match) {
                handle_function(feature, match);
                return feature;
            }
        };
    };

    var handle_feature_line = function(feature, match) {
        if (feature.title) throw "You can only specify a single feature";
        feature.title = match[1];
    };
    
    var handle_scenario_line = function(feature, match) {
        feature.scenarios.push({ title: match[1], steps: [] });
    }
    
    var handle_pending_scenario_line = function(feature, match) {
        handle_scenario_line(feature, match);
        feature.last_scenario().pending = true;
    }
    
    var handle_step_line = function(feature, match) {;
        feature.last_scenario().steps.push(match[1]);
    };
    
    var parse_line = dispatch(
        line_handler(FEATURE_REGEX, handle_feature_line),
        line_handler(PENDING_SCENARIO_REGEX, handle_pending_scenario_line),
        line_handler(SCENARIO_REGEX, handle_scenario_line),
        line_handler(STEP_REGEX, handle_step_line)
    );

    var split = function(text) {
        return $(text.split(/\n/)).find_all(non_blanks);
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };

};

module.exports = TextParser;
