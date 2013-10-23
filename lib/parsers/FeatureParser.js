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
var English = require('../localisation/English');

var FeatureParser = function(language) {

    var language = language || English;

    var FEATURE_REGEX = new RegExp('^\\s*' + language.localise('feature') + ':\\s*(.*)', 'i');
    var SCENARIO_REGEX = new RegExp('^\\s*' + language.localise('scenario') + ':\\s*(.*)', 'i');
    var TEXT_REGEX = new RegExp('^\\s*([^\\s].*)', 'i');
    var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\s*#');
    var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\s*#{3,}')
    var BLANK_REGEX = new RegExp('^\\s*$');
    var SIMPLE_ANNOTATION_REGEX = new RegExp('^@([^=]*)$');
    var NVP_ANNOTATION_REGEX = new RegExp('^@([^=]*)=(.*)$');

    var feature;
	var annotations;
    var blocks;

    this.parse = function(text, next) {
        reset();
        split(text).each(parse_line);
        return next && next(feature) || feature;
    };

    var split = function(text) {
        return $(text.split(/\n/));
    };

    var reset = function() {
        feature = undefined;
        annotations = new Annotations();
        blocks = new Blocks();
    };

    var parse_line = function(line) {
        var match;
        if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return annotations.add(match[1]);
		if (match = NVP_ANNOTATION_REGEX.exec(line)) return annotations.add(match[1], match[2]);
		if (match = FEATURE_REGEX.exec(line)) return create_feature(match[1]);
        if (match = SCENARIO_REGEX.exec(line)) return add_scenario(match[1]);
        if (match = MULTI_LINE_COMMENT_REGEX.test(line)) return toggle_comment();
        if (match = SINGLE_LINE_COMMENT_REGEX.test(line)) return;
        if (match = BLANK_REGEX.test(line)) return blocks.end();
        if (match = TEXT_REGEX.exec(line)) return add_text(match[1]);
    };

    var create_feature = function(title) {
        if (feature) throw new Error("You can only specify a single feature");
        feature = { annotations: annotations.end(), scenarios: [] };
        blocks.start('feature', title, write_feature_title);
        return feature;
    };

    var ensure_feature = function() {
        return feature || create_feature();
    }

    var add_scenario = function(title) {
        var scenario = { annotations: annotations.end(), steps: [] };
        ensure_feature().scenarios.push(scenario);
        blocks.start('scenario', title, write_scenario_title);
    };

    var toggle_comment = function() {
        blocks.start('comment');
    };

    var add_text = function(text) {
        if (blocks.open()) return blocks.write(text);
        add_step(text);
    };

    var add_step = function(step) {
        if (!feature || feature.scenarios.length == 0) throw new Error("Missing scenario");
        feature.scenarios.slice(-1)[0].steps.push(step);
    };

    var write_feature_title = function(lines) {
        feature.title = lines;
    };

    var write_scenario_title = function(lines) {
        feature.scenarios[feature.scenarios.length - 1].title = lines;
    };
};

var Annotations = function() {

    var annotations = {};

    this.add = function(key, value) {
        annotations[key] = value || true;
    };

    this.end = function() {
        var result = annotations;
        annotations = {};
        return result;
    };
};

var Blocks = function() {

    var stack = [];
    var block;

    this.start = function(type, line, callback) {
        if (this.open()) this.end();
        block = new Block(type, callback).write(line);
    };

    this.toggle = function(type, line, callback) {
        if (this.open(type)) return this.write(line).end();
        this.start(type, line, callback);
    };

    this.open = function(type) {
        return type ? block.is(type) : !!block;
    };

    this.write = function(line) {
        line && block.write(line);
        return this;
    };

    this.end = function() {
        this.open() && block.end();
        block = stack.pop();
    };
};

var Block = function(type, callback) {

    var lines = [];

    this.write = function(line) {
        if (line) lines.push(line);
        return this;
    };

    this.is = function(_type) {
        return type == _type;
    };

    this.end = function() {
        callback && callback(lines);
    };
}

module.exports = FeatureParser;
