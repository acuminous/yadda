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
    var DASH_REGEX = new RegExp('(^\\s*[\\|\u2506]?-{3,})');
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
            throw e;
        }
    }
};

var Handlers = function(handlers) {

    /* jslint shadow: true */
    var handlers = handlers || {};

    this.register = function(event, handler) {
        handlers[event] = handler;
    };

    this.unregister = function() {
        $(Array.prototype.slice.call(arguments)).each(function(event) {
            delete handlers[event];
        });
    };

    this.find = function(event) {
        if (!handlers[event.toLowerCase()]) throw new Error(event + ' is unexpected at this time');
        return { handle: handlers[event.toLowerCase()] };
    };
};

var Specification = function() {

    var current_element = this;
    var feature;
    var annotations = new Annotations();
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
        annotations.stash(annotation.key, annotation.value);
    }

    function start_feature(event, title) {
        /* jslint boss: true */
        return feature = new Feature(title, annotations, new Annotations());
    }

    function start_scenario(event, title) {
        feature = new Feature(title, new Annotations(), annotations);
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

var Annotations = function() {

    var annotations = {};

    this.stash = function(key, value) {
        if (/\s/.test(key)) throw new Error('Invalid annotation: ' + key);
        annotations[key.toLowerCase()] = value;
    }

    this.get = function(key) {
        return annotations[key.toLowerCase()]
    }

    this.merge = function(other) {
        other.each(function(key, value) {
            annotations[key] = value;
        })
        return this
    }

    this.each = function(iterator) {
        for (var key in annotations) {
            iterator(key, annotations[key]);
        }
    }

    this.keys = function() {
        var result = [];
        for (var key in annotations) {
            result.push(key);
        }
        return result;
    }

    this.isEmpty = function() {
        return this.keys().length === 0
    }
}

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
        stashed_annotations = new Annotations();
        return background;
    }

    function stash_annotation(event, annotation) {
        handlers.unregister('background');
        stashed_annotations.stash(annotation.key, annotation.value);
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
        stashed_annotations = new Annotations();
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
        text: capture_step,
        blank: fn.noop,
        annotation: stash_annotation,
        scenario: start_scenario
    });
    var _this = this;

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
    var annotations = new Annotations();
    var handlers = new Handlers({
        text: capture_headings,
        blank: fn.noop,
        scenario: start_scenario
    });
    var _this = this;

    function capture_headings(event, data) {
        handlers.register('annotation', stash_annotation);
        handlers.register('text', capture_singleline_fields);
        handlers.register('dash', enable_multiline_examples);
        headings = split(data).collect(function(column) {
            return { text: StringUtils.trim(column), indentation: StringUtils.indentation(column) };
        }).naked();
    }

    function stash_annotation(event, annotation) {
        handlers.unregister('blank', 'dash');
        annotations.stash(annotation.key, annotation.value);
    }

    function capture_singleline_fields(event, data) {
        handlers.unregister('dash');
        handlers.register('blank', start_scenario);
        examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
        annotations = new Annotations();
    }

    function enable_multiline_examples(event, data) {
        handlers.register('text', start_capturing_multiline_fields);
        handlers.register('dash', stop_capturing_multiline_fields);
    }

    function start_capturing_multiline_fields(event, data) {
        handlers.register('text', continue_capturing_multiline_fields);
        handlers.register('dash', stop_capturing_multiline_fields);
        handlers.register('blank', start_scenario);
        examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
    }

    function continue_capturing_multiline_fields(event, data) {
        parse_fields(data, examples.last().fields);
    }

    function stop_capturing_multiline_fields(event, data) {
        handlers.register('text', start_capturing_multiline_fields);
        annotations = new Annotations();
    }

    function parse_fields(row, fields) {
        split(row, headings.length).each(function(field, index) {
            var column = headings[index].text;
            var indentation = headings[index].indentation;
            var text = StringUtils.rtrim(field.substr(indentation));
            if (StringUtils.isNotBlank(field) && StringUtils.indentation(field) < indentation) throw new Error('Indentation error');
            fields[column] = (fields[column] || []).concat(text);
        });
        return fields;
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
                title: substitute(example.fields, scenario.title),
                annotations: example.annotations.merge(scenario.annotations),
                description: substitute_all(example, scenario.description),
                steps: substitute_all(example.fields, scenario.steps)
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
            line = line.replace(new RegExp('\\[\\s*' + heading + '\\s*\\]', 'g'), StringUtils.rtrim(example[heading].join('\n')));
        }
        return line;
    }
};

module.exports = FeatureParser;
