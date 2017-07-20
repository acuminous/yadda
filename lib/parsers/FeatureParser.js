"use strict";

var $ = require('../Array');
var fn = require('../fn');
var StringUtils = require('../StringUtils');
var Localisation = require('../localisation');

var FeatureParser = function(options) {

    /* eslint-disable no-redeclare */
    var defaults = { language: Localisation.default, leftPlaceholderChar: '[', rightPlaceholderChar: ']'};
    var options = options && options.is_language ? { language: options } : options || defaults;
    var language = options.language || defaults.language;
    var left_placeholder_char = options.leftPlaceholderChar || defaults.leftPlaceholderChar;
    var right_placeholder_char = options.rightPlaceholderChar || defaults.rightPlaceholderChar;
    /* eslint-enable no-redeclare */

    var FEATURE_REGEX = new RegExp('^\\s*' + language.localise('feature') + ':\\s*(.*)', 'i');
    var SCENARIO_REGEX = new RegExp('^\\s*' + language.localise('scenario') + ':\\s*(.*)', 'i');
    var BACKGROUND_REGEX = new RegExp('^\\s*' + language.localise('background') + ':\\s*(.*)', 'i');
    var EXAMPLES_REGEX = new RegExp('^\\s*' + language.localise('examples') + ':', 'i');
    var TEXT_REGEX = new RegExp('^(.*)$', 'i');
    var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\s*#');
    var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\s*#{3,}');
    var BLANK_REGEX = new RegExp('^(\\s*)$');
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
        var match;
        var line_number = index + 1;
        try {
            // eslint-disable-next-line no-return-assign
            if (match = MULTI_LINE_COMMENT_REGEX.test(line)) return comment = !comment;
            if (comment) return;
            if (match = SINGLE_LINE_COMMENT_REGEX.test(line)) return;
            if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: true }, line_number);
            if (match = NVP_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: StringUtils.trim(match[2]) }, line_number);
            if (match = FEATURE_REGEX.exec(line)) return specification.handle('Feature', match[1], line_number);
            if (match = SCENARIO_REGEX.exec(line)) return specification.handle('Scenario', match[1], line_number);
            if (match = BACKGROUND_REGEX.exec(line)) return specification.handle('Background', match[1], line_number);
            if (match = EXAMPLES_REGEX.exec(line)) return specification.handle('Examples', line_number);
            if (match = BLANK_REGEX.exec(line)) return specification.handle('Blank', match[0], line_number);
            if (match = DASH_REGEX.exec(line)) return specification.handle('Dash', match[1], line_number);
            if (match = TEXT_REGEX.exec(line)) return specification.handle('Text', match[1], line_number);
        } catch (e) {
            e.message = 'Error parsing line ' + (line_number) + ', "' + line + '".\nOriginal error was: ' + e.message;
            throw e;
        }
    }

    var Handlers = function(handlers) {

        // eslint-disable-next-line no-redeclare
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
            background: start_background
        });

        function stash_annotation(event, annotation) {
            handlers.unregister('background');
            annotations.stash(annotation.key, annotation.value);
        }

        function start_feature(event, title) {
            // eslint-disable-next-line no-return-assign
            return feature = new Feature(title, annotations, new Annotations());
        }

        function start_scenario(event, title, line_number) {
            feature = new Feature(title, new Annotations(), annotations);
            return feature.on(event, title, line_number);
        }

        var start_background = start_scenario;

        this.handle = function(event, data, line_number) {
            current_element = current_element.on(event, data, line_number);
        };

        this.on = function(event, data, line_number) {
            return handlers.find(event).handle(event, data, line_number) || this;
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
        };

        this.export = function() {
            return annotations;
        };
    };

    var Feature = function(title, annotations, stashed_annotations) {

        var description = [];
        var scenarios = [];
        var background = new NullBackground();
        var handlers = new Handlers({
            text: capture_description,
            blank: fn.noop,
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
            handlers.unregister('background', 'text');
            stashed_annotations.stash(annotation.key, annotation.value);
        }

        function capture_description(event, text) {
            description.push(StringUtils.trim(text));
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

        this.on = function(event, data, line_number) {
            return handlers.find(event).handle(event, data, line_number) || this;
        };

        this.export = function() {
            validate();
            return {
                title: title,
                annotations: annotations.export(),
                description: description,
                scenarios: $(scenarios).collect(function(scenario) {
                    return scenario.export();
                }).flatten().naked()
            };
        };
    };

    var Background = function(title, feature) {

        var steps = [];
        var blanks = [];
        var indentation = 0;
        var handlers = new Handlers({
            text: capture_step,
            blank: fn.noop,
            annotation: stash_annotation,
            scenario: start_scenario
        });

        function capture_step(event, text, line_number) {
            handlers.register('dash', enable_multiline_step);
            steps.push(StringUtils.trim(text));
        }

        function enable_multiline_step(event, text, line_number) {
            handlers.unregister('dash', 'annotation', 'scenario');
            handlers.register('text', start_multiline_step);
            handlers.register('blank', stash_blanks);
            indentation = StringUtils.indentation(text);
        }

        function start_multiline_step(event, text, line_number) {
            handlers.register('dash', disable_multiline_step);
            handlers.register('text', continue_multiline_step);
            handlers.register('blank', stash_blanks);
            handlers.register('annotation', stash_annotation);
            handlers.register('scenario', start_scenario);
            append_to_step(text, '\n');
        }

        function continue_multiline_step(event, text, line_number) {
            unstash_blanks();
            append_to_step(text, '\n');
        }

        function stash_blanks(event, text, line_number) {
            blanks.push(text);
        }

        function unstash_blanks() {
            if (!blanks.length) return;
            append_to_step(blanks.join('\n'), '\n');
            blanks = [];
        }

        function disable_multiline_step(event, text, line_number) {
            handlers.unregister('dash');
            handlers.register('text', capture_step);
            handlers.register('blank', fn.noop);
            unstash_blanks();
        }

        function append_to_step(text, prefix) {
            if (StringUtils.isNotBlank(text) && StringUtils.indentation(text) < indentation) throw new Error('Indentation error');
            steps[steps.length - 1] = steps[steps.length - 1] + prefix + StringUtils.rtrim(text.substr(indentation));
        }

        function stash_annotation(event, annotation, line_number) {
            validate();
            return feature.on(event, annotation, line_number);
        }

        function start_scenario(event, data, line_number) {
            validate();
            return feature.on(event, data, line_number);
        }

        function validate() {
            if (steps.length === 0) throw new Error('Background requires one or more steps');
        }

        this.on = function(event, data, line_number) {
            return handlers.find(event).handle(event, data, line_number) || this;
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

        this.on = function(event, data, line_number) {
            return handlers.find(event).handle(event, data, line_number) || this;
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
        var blanks = [];
        var examples;
        var indentation = 0;
        var handlers = new Handlers({
            text: capture_step,
            blank: fn.noop,
            annotation: start_scenario,
            scenario: start_scenario,
            examples: start_examples
        });
        var _this = this;

        function capture_step(event, text, line_number) {
            handlers.register('dash', enable_multiline_step);
            steps.push(StringUtils.trim(text));
        }

        function enable_multiline_step(event, text, line_number) {
            handlers.unregister('dash', 'annotation', 'scenario', 'examples');
            handlers.register('text', start_multiline_step);
            handlers.register('blank', stash_blanks);
            indentation = StringUtils.indentation(text);
        }

        function start_multiline_step(event, text, line_number) {
            handlers.register('dash', disable_multiline_step);
            handlers.register('text', continue_multiline_step);
            handlers.register('blank', stash_blanks);
            handlers.register('annotation', start_scenario);
            handlers.register('scenario', start_scenario);
            handlers.register('examples', start_examples);
            append_to_step(text, '\n');
        }

        function continue_multiline_step(event, text, line_number) {
            unstash_blanks();
            append_to_step(text, '\n');
        }

        function stash_blanks(event, text, line_number) {
            blanks.push(text);
        }

        function unstash_blanks() {
            if (!blanks.length) return;
            append_to_step(blanks.join('\n'), '\n');
            blanks = [];
        }

        function disable_multiline_step(event, text, line_number) {
            handlers.unregister('dash');
            handlers.register('text', capture_step);
            handlers.register('blank', fn.noop);
            unstash_blanks();
        }

        function append_to_step(text, prefix) {
            if (StringUtils.isNotBlank(text) && StringUtils.indentation(text) < indentation) throw new Error('Indentation error');
            steps[steps.length - 1] = steps[steps.length - 1] + prefix + StringUtils.rtrim(text.substr(indentation));
        }

        function start_scenario(event, data, line_number) {
            validate();
            return feature.on(event, data, line_number);
        }

        function start_examples(event, data, line_number) {
            validate();
            examples = new Examples(_this);
            return examples;
        }

        function validate() {
            if (steps.length === 0) throw new Error('Scenario requires one or more steps');
        }

        this.on = function(event, data, line_number) {
            return handlers.find(event).handle(event, data, line_number) || this;
        };

        this.export = function() {
            validate();
            var result = {
                title: title,
                annotations: annotations.export(),
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
            blank: fn.noop,
            dash: start_example_table,
            text: capture_headings
        });

        function start_example_table(evnet, data, line_number) {
            handlers.unregister('blank', 'dash');
        }

        function capture_headings(event, data, line_number) {
            handlers.register('annotation', stash_annotation);
            handlers.register('text', capture_singleline_fields);
            handlers.register('dash', enable_multiline_examples);
            var pos = 1;
            headings = split(data).collect(function(column) {
                var attributes = { text: StringUtils.trim(column), left: pos, indentation: StringUtils.indentation(column) };
                pos += column.length + 1;
                return attributes;
            }).naked();
        }

        function stash_annotation(event, annotation, line_number) {
            handlers.unregister('blank', 'dash');
            annotations.stash(annotation.key, annotation.value);
        }

        function capture_singleline_fields(event, data, line_number) {
            handlers.register('dash', end_example_table);
            handlers.register('blank', end_example_table);
            examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
            add_meta_fields(line_number);
            annotations = new Annotations();
        }

        function enable_multiline_examples(event, data, line_number) {
            handlers.register('text', start_capturing_multiline_fields);
            handlers.register('dash', stop_capturing_multiline_fields);
        }

        function start_capturing_multiline_fields(event, data, line_number) {
            handlers.register('text', continue_capturing_multiline_fields);
            handlers.register('dash', stop_capturing_multiline_fields);
            handlers.register('blank', end_example_table);
            examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
            add_meta_fields(line_number);
        }

        function continue_capturing_multiline_fields(event, data, line_number) {
            parse_fields(data, examples.last().fields);
        }

        function stop_capturing_multiline_fields(event, data, line_number) {
            handlers.register('text', start_capturing_multiline_fields);
            annotations = new Annotations();
        }

        function end_example_table(event, data, line_number) {
            handlers.unregister('text', 'dash');
            handlers.register('blank', fn.noop);
            handlers.register('annotation', start_scenario);
            handlers.register('scenario', start_scenario);
        }

        function add_meta_fields(line_number) {
            var fields = examples.last().fields;
            $(headings).each(function(heading) {
                fields[heading.text + '.index'] = [ examples.length ];
                fields[heading.text + '.start.line'] = [ line_number ];
                fields[heading.text + '.start.column'] = [ heading.left + heading.indentation ];
            });
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
            if (number_of_fields !== undefined && number_of_fields !== fields.length) {
                throw new Error('Incorrect number of fields in example table. Expected ' + number_of_fields + ' but found ' + fields.length);
            }
            return fields;
        }

        function start_scenario(event, data, line_number) {
            validate();
            return scenario.on(event, data, line_number);
        }

        function validate() {
            if (headings.length === 0) throw new Error('Examples table requires one or more headings');
            if (examples.length === 0) throw new Error('Examples table requires one or more rows');
        }

        this.on = function(event, data, line_number) {
            return handlers.find(event).handle(event, data, line_number) || this;
        };

        this.expand = function(scenario) {
            validate();
            return examples.collect(function(example) {
                return {
                    title: substitute(example.fields, scenario.title),
                    annotations: shallow_merge(example.annotations.export(), scenario.annotations),
                    description: substitute_all(example, scenario.description),
                    steps: substitute_all(example.fields, scenario.steps)
                };
            }).naked();
        };

        function shallow_merge() {
            var result = {};
            $(Array.prototype.slice.call(arguments)).each(function(annotations) {
                for (var key in annotations) {
                    result[key] = annotations[key];
                }
            });
            return result;
        }

        function substitute_all(example, lines) {
            return $(lines).collect(function(line) {
                return substitute(example, line);
            }).naked();
        }

        function substitute(example, line) {
            for (var heading in example) {
                line = line.replace(new RegExp('\\' + left_placeholder_char + '\\s*' + heading + '\\s*\\' + right_placeholder_char, 'g'), StringUtils.rtrim(example[heading].join('\n')));
            }
            return line;
        }
    };

};

module.exports = FeatureParser;
