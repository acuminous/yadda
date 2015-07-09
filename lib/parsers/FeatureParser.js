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

var Localisation = require('../localisation');

var FeatureParser = function (language) {

    /* jslint shadow: true */
    var language = language || Localisation.default;

    var FEATURE_REGEX = new RegExp('^\\s*' + language.localise('feature') + ':\\s*(.*)', 'i');
    var SCENARIO_REGEX = new RegExp('^\\s*' + language.localise('scenario') + ':\\s*(.*)', 'i');
    var BACKGROUND_REGEX = new RegExp('^\\s*' + language.localise('background') + ':\\s*(.*)', 'i');
    var EXAMPLES_REGEX = new RegExp('^\\s*' + language.localise('examples') + ':', 'i');
    var TEXT_REGEX = new RegExp('^\\s*([^\\s].*)', 'i');
    var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\s*#');
    var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\s*#{3,}');
    var BLANK_REGEX = new RegExp('^\\s*$');
    var DASH_REGEX = new RegExp('^(\\s|\\-|\u2504)*$');
    var SIMPLE_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)$');
    var NVP_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)=(.*)$');

    var specification;
    var comment;

    this.parse = function (text, next) {
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
            if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', {
                key: match[1].trim(),
                value: true
            });
            if (match = NVP_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', {
                key: match[1].trim(),
                value: match[2].trim()
            });
            if (match = FEATURE_REGEX.exec(line)) return specification.handle('Feature', match[1]);
            if (match = SCENARIO_REGEX.exec(line)) return specification.handle('Scenario', match[1]);
            if (match = BACKGROUND_REGEX.exec(line)) return specification.handle('Background', match[1]);
            if (match = EXAMPLES_REGEX.exec(line)) return specification.handle('Examples');
            if (match = BLANK_REGEX.test(line)) return specification.handle('Blank');
            if (match = DASH_REGEX.test(line)) return specification.handle('Dash');
            if (match = TEXT_REGEX.exec(line)) return specification.handle('Text', match[1], line, index + 1);
        } catch (e) {
            throw new Error('Error parsing line ' + (index + 1) + ', "' + line + '".\n' + e.message);
        }
    }
};

var Handlers = function (handlers) {

    /* jslint shadow: true */
    var handlers = handlers || {};

    this.register = function (event, handler) {
        handlers[event] = handler;
    };

    this.unregister = function (event) {
        delete handlers[event];
    };

    this.find = function (event) {
        if (!handlers[event.toLowerCase()]) throw new Error(event + ' is unexpected at this time');
        return {
            handle: handlers[event.toLowerCase()]
        };
    };
};

var Specification = function () {

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

    this.handle = function (event, data, line, line_number) {
        current_element = current_element.on(event, data, line, line_number);
    };

    this.on = function (event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function () {
        if (!feature) throw new Error('A feature must contain one or more scenarios');
        return feature.export();
    };
};

var Feature = function (title, annotations, stashed_annotations) {

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
        var scenario = _this.new_scenario(title, stashed_annotations);
        stashed_annotations = {};
        return scenario;
    }

    function validate() {
        if (scenarios.length === 0) throw new Error('Feature requires one or more scenarios');
    }

    this.on = function (event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function () {
        validate();
        return {
            title: title,
            annotations: annotations,
            description: description,
            scenarios: $(scenarios).collect(function (scenario) {
                return scenario.export();
            }).flatten().naked()
        };
    };

    this.new_scenario = function (title, stashed_annotations) {
        var scenario = new Scenario(title, background, stashed_annotations, _this);
        scenarios.push(scenario);
        return scenario;
    };
};

var Background = function (title, feature) {

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

    this.on = function (event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function () {
        validate();
        return {
            steps: steps
        };
    };
};

var NullBackground = function () {
    var handlers = new Handlers();

    this.on = function (event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function () {
        return {
            steps: []
        };
    };
};

var Scenario = function (title, background, annotations, feature) {

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
        steps.push(text);
    }

    function start_scenario(event, data) {
        validate();
        return feature.on(event, data);
    }

    function start_examples(event, data) {
        validate();
        /* jslint boss: true */
        return examples = new Examples(_this, feature);
    }

    function validate() {
        if (steps.length === 0) throw new Error('Scenario requires one or more steps');
    }

    this.on = function (event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function () {
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

var Examples = function (scenario, feature) {

    var SURROUNDING_WHITESPACE_REGEX = /^\s+|\s+$/g;
    var RIGHT_WHITESPACE_REGEX = /\s*$/g;

    var parsing_mode = 0; // 0=headings, 1=single row, 2=new multi row, 3=append mult row
    var typed_columns = false;
    var headings = [];
    var identation = [];
    var identifier, identifiers = {};
    var loc = [],
        start_line;
    var examples = $();
    var separator;
    var stashed_annotations = {};
    var handlers = new Handlers({
        text: capture_headings,
        blank: capture_blank,
        dash: capture_blank,
        annotation: stash_annotations,
        scenario: start_scenario,
    });
    var _this = this;

    function capture_blank() {
        switch (parsing_mode) {
        case 0: // headings
            if (headings.length > 0)
                parsing_mode = 2;
            break;
        case 1: // single row mode
        case 2: // multi row mode - new row
            break;
        case 3: // multi row mode - row continuation

            var example = examples[examples.length - 1];

            for (var i = 0; i < headings.length; i++) {
                var heading = headings[i];
                var s = example[heading];
                var j = s.length - 1;
                while (j && s[j] === '')
                    j--;
                s = s.slice(0, j + 1).join('\n');
                if (identifier == heading) {
                    s = s.replace(/(^\s+)|\s+|(\s+$)/gm, ' ');
                    if (identifiers[s])
                        throw new Error('Duplicated identifier "' + s + '" at lines ' + identifiers[s] + ' and ' + start_line);
                    identifiers[s] = start_line;
                }
                example[heading] = s;

                if (loc[heading])
                    example[heading + ".end.column"] = example[heading + ".start.column"] + example[heading + ".width.column"];
            }
            parsing_mode = 2; // then start a new row
            example.$$annotations = stashed_annotations;
            stashed_annotations = {};
            break;
        }
    }

    function capture_headings(event, data, line) {
        if (line.indexOf('\u2506') >= 0)
            separator = '\u2506';
        else
            separator = '|';
        handlers.register('text', capture_example);

        headings = split(line).collect(function (column) {
            var ident = /^\s*/.exec(column) || 0;
            identation.push(ident && ident.length && ident[0].length);
            if (column.indexOf(':') >= 0)
                return capture_typed_heading(column.split(':'));
            return column.replace(SURROUNDING_WHITESPACE_REGEX, '');
        }).naked();
    }

    function capture_typed_heading(data) {
        typed_columns = true;
        var column = data[0].replace(SURROUNDING_WHITESPACE_REGEX, '');
        var type = data[1].replace(SURROUNDING_WHITESPACE_REGEX, '');
        switch (type) {
        case "ID":
            if (identifier)
                throw new Error(identifier + ' and ' + column + ' typed as ID, use just one');
            identifier = column;
            break;
        case "LOC":
            loc[column] = true;
            break;
        default:
            throw new Error('Type "' + type + '" is not supported');
        }
        return column;
    }

    function capture_example(event, data, line, line_number) {
        var fields = split(line, headings.length);
        var example;

        switch (parsing_mode) {
        case 0: // was in headings has no blank rows
            if (typed_columns)
                throw new Error('Use typed columns with multiline');
        case 1: // single row mode

            example = {};
            fields.each(function (field, index) {
                example[headings[index]] =
                    field.replace(SURROUNDING_WHITESPACE_REGEX, '');
            });

            example.$$annotations = stashed_annotations;
            stashed_annotations = {};
            examples.push(example);

            parsing_mode = 1;
            break;

        case 2: // multi row mode - new row
            example = {};
            var pos = 1;
            fields.each(function (field, index) {
                if (field
                    .substr(0, identation[index])
                    .replace(SURROUNDING_WHITESPACE_REGEX, ''))
                    throw new Error("Identation error");
                var line = field
                    .substr(identation[index])
                    .replace(RIGHT_WHITESPACE_REGEX, '');
                example[headings[index]] = [line];
                if (loc[headings[index]]) {
                    start_line = line_number;
                    example[headings[index] + ".start.line"] = line_number;
                    example[headings[index] + ".end.line"] = line_number;
                    example[headings[index] + ".start.column"] = pos + identation[index];
                    example[headings[index] + ".width.column"] = line.length;
                }
                pos += field.length + 1;
            });

            examples.push(example);
            parsing_mode = 3;
            break;

        case 3: // multi row mode - row continuation

            example = examples[examples.length - 1];
            fields.each(function (field, index) {
                if (field
                    .substr(0, identation[index])
                    .replace(SURROUNDING_WHITESPACE_REGEX, ''))
                    throw new Error("Identation error");
                var line = field
                    .substr(identation[index])
                    .replace(RIGHT_WHITESPACE_REGEX, '');
                example[headings[index]].push(line);
                if (line && loc[headings[index]]) {
                    example[headings[index] + ".end.line"] = line_number;
                    example[headings[index] + ".width.column"] = Math.max(example[headings[index] + ".width.column"], line.length);
                }
            });

            break;
        }
    }

    function split(row, number_of_fields) {
        var fields = $(row.split(separator));
        if (number_of_fields !== undefined && number_of_fields != fields.length) {
            throw new Error('Incorrect number of fields in example table. Expected ' + number_of_fields + ' but found ' + fields.length);
        }
        return fields;
    }

    function stash_annotations(event, annotation) {
        stashed_annotations[annotation.key] = annotation.value;
        stashed_annotations[annotation.key.toLowerCase().replace(/\W/g, '_')] = annotation.value;
    }

    function start_scenario(event, title) {
        validate();
        return feature.new_scenario(title, stashed_annotations);
    }

    function validate() {
        capture_blank();
        if (headings.length === 0) throw new Error('Examples table requires one or more headings');
        if (examples.length === 0) throw new Error('Examples table requires one or more rows');
    }

    this.on = function (event, data, line, line_number) {
        return handlers.find(event).handle(event, data, line, line_number) || this;
    };

    this.expand = function (scenario) {
        validate();
        return examples.collect(function (example) {
            var example_annotations = example.$$annotations;
            delete example.$$annotations;
            return {
                title: substitute(example, scenario.title),
                annotations: shallowMerge(scenario.annotations, example_annotations),
                description: substitute_all(example, scenario.description),
                steps: substitute_all(example, scenario.steps)
            };
        }).naked();
    };

    function shallowMerge(source, source2) {
        var dest = {};
        for (var key in source) {
            dest[key] = source[key];
        }
        if (source2)
            for (var key in source2) {
                dest[key] = source2[key];
            }
        return dest;
    }

    function substitute_all(example, lines) {
        return $(lines).collect(function (line) {
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
