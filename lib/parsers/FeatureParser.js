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
var StringUtils = require('../StringUtils');
var Localisation = require('../localisation');

var FeatureParser = function(language) {

    /* jslint shadow: true */
    var language = language || Localisation.default;

    var FEATURE_REGEX = new RegExp('^\\s*' + language.localise('feature') + ':\\s*(.*)', 'i');
    var SCENARIO_REGEX = new RegExp('^\\s*' + language.localise('scenario') + ':\\s*(.*)', 'i');
    var BACKGROUND_REGEX = new RegExp('^\\s*' + language.localise('background') + ':\\s*(.*)', 'i');
    var EXAMPLES_REGEX = new RegExp('^\\s*' + language.localise('examples') + ':', 'i');
    var TEXT_REGEX = new RegExp('^(.*)$', 'i');
    var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\s*#');
    var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\s*#{3,}');
    var BLANK_REGEX = new RegExp('^\\s*$');
    var DASH_REGEX = new RegExp('(^\\s*-{3,})');
    var SIMPLE_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)$');
    var NVP_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)=(.*)$');

    var specification;
    var comment;

    this.parse = function(text, next) {
        reset();
        split(text).each(parse_line);
        return next && next(specification.export()) || specification.export();
    };

    function reset() {
        specification = new Specification();
        comment = false;
    }

    function split(text) {
        return $(text.split(/\r\n|\n/));
    }

    function parse_line(line, index) {
        /* jslint boss: true */
        var match;
        try {
            if (match = MULTI_LINE_COMMENT_REGEX.test(line)) return comment = !comment;
            if (comment) return;
            if (match = SINGLE_LINE_COMMENT_REGEX.test(line)) return;
            if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: true });
            if (match = NVP_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: StringUtils.trim(match[2]) });
            if (match = FEATURE_REGEX.exec(line)) return specification.handle('Feature', match[1]);
            if (match = SCENARIO_REGEX.exec(line)) return specification.handle('Scenario', match[1]);
            if (match = BACKGROUND_REGEX.exec(line)) return specification.handle('Background', match[1]);
            if (match = EXAMPLES_REGEX.exec(line)) return specification.handle('Examples');
            if (match = BLANK_REGEX.test(line)) return specification.handle('Blank');
            if (match = DASH_REGEX.exec(line)) return specification.handle('Dash', match[1]);
            if (match = TEXT_REGEX.exec(line)) return specification.handle('Text', match[1]);
        } catch (e) {
            e.message = 'Error parsing line ' + (index + 1) + ', "' + line + '".\nOriginal error was: ' + e.message;
            throw e
        }
    }
};

var Handlers = function(handlers) {

    /* jslint shadow: true */
    var handlers = handlers || {};

    this.register = function(event, handler) {
        handlers[event] = handler;
    };

    this.unregister = function(event) {
        delete handlers[event];
    };

    this.find = function(event) {
        if (!handlers[event.toLowerCase()]) throw new Error(event + ' is unexpected at this time');
        return { handle: handlers[event.toLowerCase()] };
    };
};

var Specification = function() {

    var current_element = this;
    var feature;
    var annotations = {};
    var handlers = new Handlers({
        text: fn.noop,
        blank: fn.noop,
        annotation: stash_annotation,
        feature: start_feature,
        scenario: start_scenario,
        background: start_background,
    });

    function stash_annotation(event, annotation) {
        handlers.unregister('background');
        annotations[annotation.key] = annotation.value;
        annotations[annotation.key.toLowerCase().replace(/\W/g, '_')] = annotation.value;
    }

    function start_feature(event, title) {
        /* jslint boss: true */
        return feature = new Feature(title, annotations, {});
    }

    function start_scenario(event, title) {
        feature = new Feature(title, {}, annotations);
        return feature.on(event, title);
    }

    var start_background = start_scenario;

    this.handle = function(event, data) {
        current_element = current_element.on(event, data);
    };

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        if (!feature) throw new Error('A feature must contain one or more scenarios');
        return feature.export();
    };
};

var Feature = function(title, annotations, stashed_annotations) {

    var description = [];
    var scenarios = [];
    var background = new NullBackground();
    var handlers = new Handlers({
        text: capture_description,
        blank: end_description,
        annotation: stash_annotation,
        scenario: start_scenario,
        background: start_background
    });
    var _this = this;

    function start_background(event, title) {
        background = new Background(title, _this);
        stashed_annotations = {};
        return background;
    }

    function stash_annotation(event, annotation) {
        handlers.unregister('background');
        stashed_annotations[annotation.key] = annotation.value;
        stashed_annotations[annotation.key.toLowerCase().replace(/\W/g, '_')] = annotation.value;
    }

    function capture_description(event, text) {
        description.push(StringUtils.trim(text));
    }

    function end_description() {
        handlers.unregister('text');
        handlers.register('blank', fn.noop);
    }

    function start_scenario(event, title) {
        var scenario = new Scenario(title, background, stashed_annotations, _this);
        scenarios.push(scenario);
        stashed_annotations = {};
        return scenario;
    }

    function validate() {
        if (scenarios.length === 0) throw new Error('Feature requires one or more scenarios');
    }

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        validate();
        return {
            title: title,
            annotations: annotations,
            description: description,
            scenarios: $(scenarios).collect(function(scenario) {
                return scenario.export();
            }).flatten().naked()
        };
    };
};

var Background = function(title, feature) {

    var steps = [];
    var handlers = new Handlers({
        text: issue146,
        blank: end_description,
        annotation: stash_annotation,
        scenario: start_scenario
    });
    var _this = this;

    function issue146() {
        if (!FeatureParser.silence146) {
            console.log("It appears that you are using background descriptions that either span");
            console.log("mutliple lines or begin immediately beneath the 'Background' keyword");
            console.log("We are considering removing this feature. Please update");
            console.log("https://github.com/acuminous/yadda/issues/146 if it is important to you");
            console.log("You can disable this message by setting FeatureParser.silence146 to true");
        }
    }

    function end_description() {
        handlers.register('text', capture_step);
        handlers.register('blank', fn.noop);
    }

    function capture_step(event, text) {
        steps.push(StringUtils.trim(text));
    }

    function stash_annotation(event, annotation) {
        validate();
        return feature.on(event, annotation);
    }

    function start_scenario(event, data) {
        validate();
        return feature.on(event, data);
    }

    function validate() {
        if (steps.length === 0) throw new Error('Background requires one or more steps');
    }

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        validate();
        return {
            steps: steps
        };
    };
};

var NullBackground = function() {
    var handlers = new Handlers();

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        return {
            steps: []
        };
    };
};

var Scenario = function(title, background, annotations, feature) {

    var description = [];
    var steps = [];
    var examples;
    var handlers = new Handlers({
        text: capture_step,
        blank: fn.noop,
        annotation: start_scenario,
        scenario: start_scenario,
        examples: start_examples
    });
    var _this = this;

    function capture_step(event, text) {
        steps.push(StringUtils.trim(text));
    }

    function start_scenario(event, data) {
        validate();
        return feature.on(event, data);
    }

    function start_examples(event, data) {
        validate();
        /* jslint boss: true */
        return examples = new Examples(_this);
    }

    function validate() {
        if (steps.length === 0) throw new Error('Scenario requires one or more steps');
    }

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        validate();
        var result = {
            title: title,
            annotations: annotations,
            description: description,
            steps: background.export().steps.concat(steps)
        };
        return examples ? examples.expand(result) : result;
    };
};

var Examples = function(scenario) {

    var headings = [];
    var examples = $();
    var handlers = new Handlers({
        text: capture_headings,
        blank: fn.noop,
        annotation: start_scenario,
        scenario: start_scenario,
    });
    var _this = this;

    function capture_headings(event, data) {
        handlers.register('text', capture_singleline_fields);
        handlers.register('dash', enable_multiline_examples);
        headings = split(data).collect(function(column) {
            return { text: StringUtils.trim(column), indentation: StringUtils.indentation(column) };
        }).naked();
    }

    function capture_singleline_fields(event, data) {
        handlers.unregister('dash');
        examples.push(parse_example({}, data));
    }

    function enable_multiline_examples(event, data) {
        handlers.register('text', start_capturing_multiline_fields);
        handlers.register('dash', stop_capturing_multiline_fields);
        handlers.register('blank', stop_capturing_multiline_fields);
    }

    function start_capturing_multiline_fields(event, data) {
        examples.push(parse_example({}, data));
        handlers.register('text', continue_capturing_multiline_fields);
    }

    function continue_capturing_multiline_fields(event, data) {
        parse_example(examples.last(), data);
    }

    function stop_capturing_multiline_fields(event, data) {
        handlers.register('text', start_capturing_multiline_fields);
    }

    function parse_example(example, row) {
        var fields = split(row, headings.length);
        fields.each(function(field, index) {
            if (StringUtils.isNotBlank(field) && StringUtils.indentation(field) < headings[index].indentation) throw new Error('Indentation error');
            example[headings[index].text] = (example[headings[index].text] || []).concat(StringUtils.trim(field));
        });
        return example
    }

    function split(row, number_of_fields) {
        var separator = row.indexOf('\u2506') >= 0 ? '\u2506' : '|';
        var fields = $(row.split(separator));
        if (number_of_fields !== undefined && number_of_fields != fields.length) {
            throw new Error('Incorrect number of fields in example table. Expected ' + number_of_fields + ' but found ' + fields.length);
        }
        return fields;
    }

    function start_scenario(event, data) {
        validate();
        return scenario.on(event, data);
    }

    function validate() {
        if (headings.length === 0) throw new Error('Examples table requires one or more headings');
        if (examples.length === 0) throw new Error('Examples table requires one or more rows');
    }

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.expand = function(scenario) {
        validate();
        return examples.collect(function(example) {
            return {
                title: substitute(example, scenario.title),
                annotations: shallowClone(scenario.annotations),
                description: substitute_all(example, scenario.description),
                steps: substitute_all(example, scenario.steps)
            };
        }).naked();
    };

    function shallowClone(source) {
        var dest = {};
        for (var key in source) {
            dest[key] = source[key];
        }
        return dest;
    }

    function substitute_all(example, lines) {
        return $(lines).collect(function(line) {
            return substitute(example, line);
        }).naked();
    }

    function substitute(example, line) {
        for (var heading in example) {
            line = StringUtils.trim(line.replace(new RegExp('\\[\\s*' + heading + '\\s*\\]', 'g'), example[heading].join('\n')));
        }
        return line;
    }
};

module.exports = FeatureParser;
