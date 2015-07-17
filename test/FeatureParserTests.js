/* jslint node: true */
/* global describe, it, afterEach */
"use strict";

var fs = require('fs');
var path = require('path');
var assert = require("assert");
var FeatureParser = require('../lib/index').parsers.FeatureParser;
var Localisation = require('../lib/index').localisation;
var Language = require('../lib/index').localisation.Language;
var Pirate = require('../lib/index').localisation.Pirate;
var English = require('../lib/index').localisation.English;

describe('FeatureParser', function() {

    afterEach(function() {
        Localisation.default = English;
    });

    describe('(Features)', function() {

        it('should parse feature title', function() {
            var feature = parse_file('feature/simple_feature');
            assert.equal(feature.title, 'Simple Feature');
        });

        it('should parse feature descriptions', function() {
            var feature = parse_file('feature/feature_description');
            assert.equal(feature.title, 'Feature Description');
            assert.equal(feature.description.join(' - '), 'As a wood chopper - I want to maintain a sharp axe - So that I can chop wood');
        });

        it('should only allow a single feature', function() {
            assert.throws(function() {
                parse_file('feature/multiple_features');
            }, /Feature is unexpected/);
        });

        it('should report incomplete features', function() {
            assert.throws(function() {
                parse_file('feature/incomplete_feature');
            }, /Feature requires one or more scenarios/);
        });
    });

    describe('(Scenarios)', function() {

        it('should parse a simple scenario', function() {
            var scenarios = parse_file('scenario/simple_scenario').scenarios;
            assert.equal(scenarios.length, 1);
            assert.equal(scenarios[0].title, 'Simple Scenario');
            assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
        });

        it('should parse a complex scenario', function() {
            var scenarios = parse_file('scenario/complex_scenario').scenarios;
            assert.equal(scenarios.length, 1);
            assert.equal(scenarios[0].title, 'Complex Scenario');
            assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
        });

        it('should parse multiple scenarios', function() {
            var scenarios = parse_file('scenario/multiple_scenarios').scenarios;
            assert.equal(scenarios.length, 2);
            assert.equal(scenarios[0].title, 'First Scenario');
            assert.equal(scenarios[1].title, 'Second Scenario');
        });

        it('should reset scenarios between parses', function() {
            assert.equal(parse_file('scenario/simple_scenario').scenarios.length, 1);
            assert.equal(parse_file('scenario/simple_scenario').scenarios.length, 1);
        });

        it('should report incomplete scenarios', function() {
            assert.throws(function() {
                parse_file('scenario/incomplete_scenario_1');
            }, /Scenario requires one or more steps/);

            assert.throws(function() {
                parse_file('scenario/incomplete_scenario_2');
            }, /Scenario requires one or more steps/);

            assert.throws(function() {
                parse_file('scenario/incomplete_scenario_3');
            }, /Scenario requires one or more steps/);

            assert.throws(function() {
                parse_file('scenario/incomplete_scenario_4');
            }, /Scenario requires one or more steps/);
        });

        it('should report steps with no scenario', function() {
            assert.throws(function() {
                parse_file('scenario/missing_scenario');
            }, /A feature must contain one or more scenarios/);
        });
    });

    describe('(Annotations)', function() {
        it('should parse feature annotations', function() {
            var feature = parse_file('annotated/annotated_feature');
            assert.equal(feature.annotations.keyword1, 'value1');
            assert.equal(feature.annotations.keyword2, 'value2');
            assert(feature.annotations.keyword3);
            assert.deepEqual(feature.scenarios[0].annotations, {});
        });

        it('should trim feature annotations', function() {
            var feature = parse_file('annotated/untrimmed_annotated_feature');
            assert.equal(feature.annotations.keyword1, 'value1');
            assert.equal(feature.annotations.keyword2, 'value2');
            assert(feature.annotations.keyword3);
            assert.deepEqual(feature.scenarios[0].annotations, {});
        });

        it('should parse scenario annotations', function() {
            var feature = parse_file('annotated/annotated_scenario');
            assert.deepEqual(feature.annotations, {});
            assert.equal(feature.scenarios[0].annotations.keyword1, 'value1');
            assert.equal(feature.scenarios[0].annotations.keyword2, 'value2');
            assert(feature.scenarios[0].annotations.keyword3);
        });

        it('should trim scenario annotations', function() {
            var feature = parse_file('annotated/untrimmed_annotated_scenario');
            assert.deepEqual(feature.annotations, {});
            assert.equal(feature.scenarios[0].annotations.keyword1, 'value1');
            assert.equal(feature.scenarios[0].annotations.keyword2, 'value2');
            assert(feature.scenarios[0].annotations.keyword3);
        });

        it('should support annotations with non alphanumerics', function() {
            var feature = parse_file('annotated/annotated_feature_non_alphanumeric');
            assert.equal(feature.annotations['Key Word+1'], 'value1');
            assert.equal(feature.annotations.key_word_1, 'value1');
            assert.equal(feature.scenarios[0].annotations['Key Word-1'], 'value1');
            assert.equal(feature.scenarios[0].annotations.key_word_1, 'value1');
        });

        it('should expand scenarios from annotated singleline example table', function() {
            var scenarios = parse_file('annotated/annotated_example_table').scenarios;
            assert.equal(scenarios.length, 4);
            assert.equal(scenarios[0].annotations.pending, true);
            assert.equal(scenarios[0].title, 'First Scenario');
            assert.equal(scenarios[0].steps[0], 'Step A11');
            assert.equal(scenarios[0].steps[1], 'Step 1AA');
            assert.equal(scenarios[1].annotations.pending, undefined);
            assert.equal(scenarios[1].title, 'Second Scenario');
            assert.equal(scenarios[1].steps[0], 'Step B22');
            assert.equal(scenarios[1].steps[1], 'Step 2BB');
            assert.equal(scenarios[2].annotations.pending, true);
            assert.equal(scenarios[2].title, 'Third Scenario');
            assert.equal(scenarios[2].steps[0], 'Step C33');
            assert.equal(scenarios[2].steps[1], 'Step 3CC');
        });

        it('should expand scenarios from annotated multiline example table', function() {
            var scenarios = parse_file('annotated/annotated_multiline_example_table').scenarios;
            assert.equal(scenarios.length, 4);
            assert.equal(scenarios[0].annotations.pending, true);
            assert.equal(scenarios[0].title, 'First Scenario');
            assert.equal(scenarios[0].steps[0], 'Step A11');
            assert.equal(scenarios[0].steps[1], 'Step 1AA');
            assert.equal(scenarios[1].annotations.pending, undefined);
            assert.equal(scenarios[1].title, 'Second Scenario');
            assert.equal(scenarios[1].steps[0], 'Step B22');
            assert.equal(scenarios[1].steps[1], 'Step 2BB');
            assert.equal(scenarios[2].annotations.pending, true);
            assert.equal(scenarios[2].title, 'Third Scenario');
            assert.equal(scenarios[2].steps[0], 'Step C33');
            assert.equal(scenarios[2].steps[1], 'Step 3CC');
        });

        it('should merge scenario annotations with example table annotations', function() {
            var scenarios = parse_file('annotated/annotated_example_table').scenarios;
            assert.equal(scenarios.length, 4);
            assert.equal(scenarios[0].annotations.pending, true);
            assert.equal(scenarios[0].annotations.only, true);
            assert.equal(scenarios[1].annotations.pending, undefined);
            assert.equal(scenarios[1].annotations.only, true);
            assert.equal(scenarios[2].annotations.pending, true);
            assert.equal(scenarios[2].annotations.only, true);

            delete scenarios[0].annotations.pending;
            assert.equal(scenarios[2].annotations.pending, true);
        });

        it('should not confuse example table annotations and scenario annotations', function() {
            var scenarios = parse_file('annotated/annotated_example_table').scenarios;
            assert.equal(scenarios.length, 4);
            assert.equal(scenarios[3].annotations.crystal, true);
        });

        it('should parse scenario annotations after background', function() {
            var feature = parse_file('annotated/annotated_scenario_after_background');
            assert.equal(feature.scenarios[0].steps[0], 'Given A');
        });
    });

    describe('(Single line Example Tables)', function() {

        it('should expand scenarios from example table', function() {
            var scenarios = parse_file('example_table/example_table').scenarios;
            assert.equal(scenarios.length, 2);
            assert.equal(scenarios[0].title, 'First Scenario');
            assert.equal(scenarios[0].steps[0], 'Step A11');
            assert.equal(scenarios[0].steps[1], 'Step 1AA');
            assert.equal(scenarios[1].title, 'Second Scenario');
            assert.equal(scenarios[1].steps[0], 'Step B22');
            assert.equal(scenarios[1].steps[1], 'Step 2BB');
        });

        it('should expand scenarios from example table using \\u2506 separator', function() {
            var scenarios = parse_file('example_table/example_table_2506').scenarios;
            assert.equal(scenarios.length, 2);
            assert.equal(scenarios[0].title, 'First Scenario');
            assert.equal(scenarios[0].steps[0], 'Step A11');
            assert.equal(scenarios[0].steps[1], 'Step 1AA');
            assert.equal(scenarios[1].title, 'Second Scenario');
            assert.equal(scenarios[1].steps[0], 'Step B22');
            assert.equal(scenarios[1].steps[1], 'Step 2BB');
        });

        it('should expand scenarios from example table with outer borders', function() {
            var scenarios = parse_file('example_table/example_table_with_outer_borders').scenarios;
            assert.equal(scenarios.length, 2);
            assert.equal(scenarios[0].title, 'First Scenario');
            assert.equal(scenarios[0].steps[0], 'Step A11');
            assert.equal(scenarios[0].steps[1], 'Step 1AA');
            assert.equal(scenarios[1].title, 'Second Scenario');
            assert.equal(scenarios[1].steps[0], 'Step B22');
            assert.equal(scenarios[1].steps[1], 'Step 2BB');
        });

        it('should report malformed singleline example tables', function() {

            assert.throws(function() {
                parse_file('example_table/malformed_example_table_1').scenarios;
            }, /Incorrect number of fields in example table/);

            assert.throws(function() {
                parse_file('example_table/malformed_example_table_2').scenarios;
            }, /Blank is unexpected at this time/);
        });

        it('should report incomplete example table', function() {

            assert.throws(function() {
                parse_file('example_table/incomplete_example_table_1');
            }, /Examples table requires one or more headings/);

            assert.throws(function() {
                parse_file('example_table/incomplete_example_table_2');
            }, /Examples table requires one or more rows/);

            assert.throws(function() {
                parse_file('example_table/incomplete_example_table_3');
            }, /Examples table requires one or more rows/);

            assert.throws(function() {
                parse_file('example_table/incomplete_example_table_4');
            }, /Examples table requires one or more rows/);
        });

        it('should expand feature background from example table', function() {
            var feature = parse_file('example_table/feature_with_background_and_example_table');
            assert.equal(feature.scenarios.length, 4);
            assert.equal(feature.scenarios[0].steps[0], 'BG A1');
            assert.equal(feature.scenarios[1].steps[0], 'BG B2');
            assert.equal(feature.scenarios[2].steps[0], 'BG X3');
            assert.equal(feature.scenarios[3].steps[0], 'BG Y4');
        });
    });

    describe('(Multiline Example Tables)', function() {

        it('should expand scenarios from simple multiline example table', function() {
            var scenarios = parse_file('example_table/simple_multiline_example_table').scenarios;
            assert.equal(scenarios.length, 2);

            assert.equal(scenarios[0].title, 'Simple Multiline Example Table');
            assert.equal(scenarios[0].steps.length, 2);
            assert.equal(scenarios[0].steps[0], 'Step left 1');
            assert.equal(scenarios[0].steps[1], ['Step right 1', 'right 2'].join('\n'));

            assert.equal(scenarios[1].title, 'Simple Multiline Example Table');
            assert.equal(scenarios[1].steps.length, 2);
            assert.equal(scenarios[1].steps[0], ['Step left 3', 'left 4'].join('\n'));
            assert.equal(scenarios[1].steps[1], 'Step right 3');
        });

        it('should expand scenarios from complex multiline examples', function() {
            var scenarios = parse_file('example_table/complex_multiline_example_table').scenarios;
            assert.equal(scenarios.length, 2);

            assert.equal(scenarios[0].title, 'Complex Multiline Example Table');
            assert.equal(scenarios[0].steps.length, 2);
            assert.equal(scenarios[0].steps[0], 'Step x {\n  y\n }');
            assert.equal(scenarios[0].steps[1], 'Step foo');

            assert.equal(scenarios[1].title, 'Complex Multiline Example Table');
            assert.equal(scenarios[0].steps.length, 2);
            assert.equal(scenarios[1].steps[0], 'Step ');
            assert.equal(scenarios[1].steps[1], 'Step x {\n  y\n }');
        });

        it('should expand scenarios from multiline example table with outer border', function() {
            var scenarios = parse_file('example_table/multiline_example_table_with_outer_border').scenarios;
            assert.equal(scenarios.length, 2);

            assert.equal(scenarios[0].title, 'Multiline Example Table With Outer Border');
            assert.equal(scenarios[0].steps.length, 2);
            assert.equal(scenarios[0].steps[0], 'Step left 1');
            assert.equal(scenarios[0].steps[1], ['Step right 1', 'right 2'].join('\n'));

            assert.equal(scenarios[1].title, 'Multiline Example Table With Outer Border');
            assert.equal(scenarios[1].steps.length, 2);
            assert.equal(scenarios[1].steps[0], ['Step left 3', 'left 4'].join('\n'));
            assert.equal(scenarios[1].steps[1], 'Step right 3');
        });

        it('should report malformed multiline examples', function() {
            assert.throws(function() {
                parse_file('example_table/malformed_multiline_example_table_1');
            }, /Dash is unexpected at this time/);

            assert.throws(function() {
                parse_file('example_table/malformed_multiline_example_table_2');
            }, /Indentation error/);

            assert.throws(function() {
                parse_file('example_table/malformed_multiline_example_table_3');
            }, /Dash is unexpected at this time/);
        });
    });

    describe('(Localisation)', function() {

        it('should support multiple languages', function() {
            var feature = parse_file('localisation/pirate_feature', Pirate);
            assert.equal(feature.title, 'Treasure Island');

            var scenarios = feature.scenarios;
            assert.equal(scenarios.length, 2);
            assert.equal(scenarios[0].title, 'The Black Spot');
            assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

            assert(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
        });

        it('should support changing the default language', function() {
            Localisation.default = Pirate;
            var feature = new FeatureParser().parse(load('localisation/pirate_feature'));

            assert.equal(feature.title, 'Treasure Island');

            var scenarios = feature.scenarios;
            assert.equal(scenarios.length, 2);
            assert.equal(scenarios[0].title, 'The Black Spot');
            assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

            assert(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
        });

        it('should report missing translations', function() {
            var language = new Language('Incomplete', {});
            assert.throws(function() {
                parse_file('feature/multiple_features', language);
            }, /Keyword "feature" has not been translated into Incomplete/);
        });
    });

    describe('(Feature Backgrounds)', function() {

        it('should parse feature background', function() {
            var feature = parse_file('background/feature_with_background');
            assert.equal(feature.scenarios[0].steps[0], 'Given A');
        });

        it('should report background annotations', function() {
            assert.throws(function() {
                parse_file('background/malformed_background_annotated');
            }, /Background is unexpected at this time/);
        });
    });

    describe('(Comments)', function() {
        it('should support single line comments', function() {
            var feature = parse_file('comment/singleline_comment');
            var scenarios = feature.scenarios;
            assert.equal(feature.title, 'Single Line Comments Feature');
            assert.equal(scenarios.length, 1);
            assert.equal(scenarios[0].title, 'Single Line Comments Scenario');
            assert.deepEqual(scenarios[0].steps, ['Given A', 'When # B', 'Then C #']);
        });

        it('should parse multiline comments', function() {
            var feature = parse_file('comment/multiline_comment');
            var scenarios = feature.scenarios;
            assert.equal(feature.title, 'Simple Feature');
            assert.equal(scenarios.length, 1);
            assert.equal(scenarios[0].title, 'Simple Scenario');
            assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
        });
    });

    function parse_file(filename, language) {
        return new FeatureParser(language).parse(load(filename));
    }

    function load(filename) {
        return fs.readFileSync(path.join(__dirname, 'features', filename + '.feature'), 'utf8');
    }
});
