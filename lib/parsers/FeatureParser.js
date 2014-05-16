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

var English = require('../localisation/English');

var FeatureParser = function(language) {

    /* jslint shadow: true */
    var language = language || English;

    var FEATURE_REGEX = new RegExp('^\\s*' + language.localise('feature') + ':\\s*(.*)', 'i');
    var SCENARIO_REGEX = new RegExp('^\\s*' + language.localise('scenario') + ':\\s*(.*)', 'i');
    var BACKGROUND_REGEX = new RegExp('^\\s*' + language.localise('background') + ':\\s*(.*)', 'i');
    var EXAMPLES_REGEX = new RegExp('^\\s*' + language.localise('examples') + ':', 'i');
    var TEXT_REGEX = new RegExp('^\\s*([^\\s].*)', 'i');
    var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\s*#');
    var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\s*#{3,}');
    var BLANK_REGEX = new RegExp('^\\s*$');
    var SIMPLE_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)$');
    var NVP_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)=(.*)$');

    var specification;
    var comment;
    var line;
    var line_number = 0;

    this.parse = function(text, next) {
        reset();
        split(text).each(parse_line);
        return next && next(specification.export()) || specification.export();
    };

    function reset() {
        specification = new Specification();
        comment = false;
        line_number = 0;
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
            if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: match[1], value: true });
            if (match = NVP_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: match[1], value: match[2] });
            if (match = FEATURE_REGEX.exec(line)) return specification.handle('Feature', match[1]);
            if (match = SCENARIO_REGEX.exec(line)) return specification.handle('Scenario', match[1]);
            if (match = BACKGROUND_REGEX.exec(line)) return specification.handle('Background', match[1]);
            if (match = EXAMPLES_REGEX.exec(line)) return specification.handle('Examples');
            if (match = BLANK_REGEX.test(line)) return specification.handle('Blank');
            if (match = TEXT_REGEX.exec(line)) return specification.handle('Text', match[1]);
        } catch (e) {
            throw new Error('Error parsing line ' + (index  + 1) + ', "' + line + '".\n' + e.message);
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
        description.push(text);
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
        text: fn.noop,
        blank: end_description,
        annotation: stash_annotation,
        scenario: start_scenario
    });
    var _this = this;

    function end_description() {
        handlers.register('text', capture_step);
        handlers.register('blank', fn.noop);
    }

    function capture_step(event, text) {
        steps.push(text);
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
        text: capture_description,
        blank: end_description,
        annotation: start_scenario,
        scenario: start_scenario,
        examples: start_examples
    });
    var _this = this;

    function capture_description(event, text) {
        description.push(text);
    }

    function end_description() {
        handlers.register('text', capture_step);
        handlers.register('blank', fn.noop);
    }

    function capture_step(event, text) {
        steps.push(text);
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

    var SURROUNDING_WHITESPACE_REGEX = /^\s+|\s+$/g;

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
        handlers.register('text', capture_example);
        headings = split(data).collect(function(column) {
            return column.replace(SURROUNDING_WHITESPACE_REGEX, '');
        }).naked();
    }

    function capture_example(event, data) {
        var fields = split(data, headings.length);
        var example = {};
        fields.each(function(field, index) {
            example[headings[index]] = field.replace(SURROUNDING_WHITESPACE_REGEX, '');
        });
        examples.push(example);
    }

    function split(row, number_of_fields) {
        var fields = $(row.split('|'));
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
                annotations: scenario.annotations,
                description: substitute_all(example, scenario.description),
                steps: substitute_all(example, scenario.steps)
            };
        }).naked();
    };

    function substitute_all(example, lines) {
        return $(lines).collect(function(line) {
            return substitute(example, line);
        }).naked();
    }

    function substitute(example, line) {
        for (var heading in example) {
            line = line.replace(new RegExp('\\[\\s*' + heading + '\\s*\\]', 'g'), example[heading]);
        }
        return line;
    }
};

module.exports = FeatureParser;
