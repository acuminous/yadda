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

var FeatureParser = function() {

    var FEATURE_REGEX = /^\s*Feature:\s*(.*)/i;
    var SCENARIO_REGEX = /^\s*Scenario:\s*(.*)/i;
    var STEP_REGEX = /^\s*([^\s].*)/;
    var COMMENT_REGEX = /^\s*#/;
    var NON_BLANK_REGEX = /[^\s]/;
    var SIMPLE_ANNOTATION_REGEX = /^@([^=]*)$/;
    var NVP_ANNOTATION_REGEX = /^@([^=]*)=(.*)$/;

    var feature;
	var annotations;

    this.parse = function(text, next) {
        feature = undefined; annotations = {};
        split(text).each(parse_line);
        return next && next(feature) || feature;
    };

    var split = function(text) {
		return $(text.split(/\n/)).find_all(non_blanks);
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };

    var parse_line = function(line) {
        var match;
        if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return annotations[match[1]] = true;
		if (match = NVP_ANNOTATION_REGEX.exec(line)) return annotations[match[1]] = match[2];
		if (match = FEATURE_REGEX.exec(line)) return create_feature(match[1]);
        if (match = SCENARIO_REGEX.exec(line)) return add_scenario(match[1]);
        if (match = COMMENT_REGEX.test(line)) return;
        if (match = STEP_REGEX.exec(line)) return add_step(match[1]);
    };

    var create_feature = function(title, annoations) {
        if (feature) throw new Error("You can only specify a single feature");
        feature = { title: title, annotations: annotations, scenarios: [] };
        annotations = {};
    };

    var add_scenario = function(title) {
        var scenario = {title: title, annotations: annotations, steps: []};
        annotations = {};
        if (!feature) create_feature();
        feature.scenarios.push(scenario);
    };

    var add_step = function(step) {
        if (!feature || feature.scenarios.length == 0) throw new Error("Missing scenario");
        feature.scenarios.slice(-1)[0].steps.push(step);
    };
};

module.exports = FeatureParser;
