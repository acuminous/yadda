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

    it('should parse a simple scenario', function() {
        var scenarios = parse_file('simple_scenario').scenarios;
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Simple Scenario');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse a complex scenario', function() {
        var scenarios = parse_file('complex_scenario').scenarios;
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Complex Scenario');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse multiple scenarios', function() {
        var scenarios = parse_file('multiple_scenarios').scenarios;
        assert.equal(scenarios.length, 2);
        assert.equal(scenarios[0].title, 'First Scenario');
        assert.equal(scenarios[1].title, 'Second Scenario');
    });

    it('should reset scenarios between parses', function() {
        assert.equal(parse_file('simple_scenario').scenarios.length, 1);
        assert.equal(parse_file('simple_scenario').scenarios.length, 1);
    });

    it('should parse feature title', function() {
        var feature = parse_file('simple_feature');
        assert.equal(feature.title, 'Simple Feature');
    });

    it('should parse feature descriptions', function() {
        var feature = parse_file('feature_description');
        assert.equal(feature.title, 'Feature Description');
        assert.equal(feature.description.join(' - '), 'As a wood chopper - I want to maintain a sharp axe - So that I can chop wood');
    });

    it('should only allow a single feature', function() {
        assert.throws(function() {
            parse_file('multiple_features');
        }, /Feature is unexpected/);
    });

    it('should report incomplete scenarios', function() {
        assert.throws(function() {
            parse_file('incomplete_scenario_1');
        }, /Scenario requires one or more steps/);

        assert.throws(function() {
            parse_file('incomplete_scenario_2');
        }, /Scenario requires one or more steps/);

        assert.throws(function() {
            parse_file('incomplete_scenario_3');
        }, /Scenario requires one or more steps/);

        assert.throws(function() {
            parse_file('incomplete_scenario_4');
        }, /Scenario requires one or more steps/);
    });

    it('should expand scenarios with examples', function() {
        var scenarios = parse_file('example_scenarios').scenarios;
        assert.equal(scenarios.length, 2);
        assert.equal(scenarios[0].title, 'First Scenario');
        assert.equal(scenarios[0].steps[0], 'Step A11');
        assert.equal(scenarios[0].steps[1], 'Step 1AA');
        assert.equal(scenarios[1].title, 'Second Scenario');
        assert.equal(scenarios[1].steps[0], 'Step B22');
        assert.equal(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios with annotated examples', function() {
        var scenarios = parse_file('example_scenarios_with_annotations').scenarios;
        assert.equal(scenarios.length, 6);
        for(var i=0;i<5;i+=3){
            assert.equal(scenarios[i+0].title, (i==3?'Tagged ':'')+'First Scenario');
            assert.equal(scenarios[i+0].steps[0], 'Step A11');
            assert.equal(scenarios[i+0].steps[1], 'Step 1AA');
            assert.equal(scenarios[i+1].title, (i==3?'Tagged ':'')+'Second Scenario');
            assert.equal(scenarios[i+1].steps[0], 'Step B22');
            assert.equal(scenarios[i+1].steps[1], 'Step 2BB');
            assert.equal(scenarios[i+2].title, (i==3?'Tagged ':'')+'Third Scenario');
            assert.equal(scenarios[i+2].steps[0], 'Step C33');
            assert.equal(scenarios[i+2].steps[1], 'Step 3CC');
            if (i==0){
              assert.equal(scenarios[i+0].annotations.ForAll, true);
              assert.equal(scenarios[i+0].annotations.pending, true);
              assert.equal(scenarios[i+1].annotations.ForAll, true);
              assert.equal(scenarios[i+1].annotations.Only, true);
              assert.equal(scenarios[i+1].annotations.keyword, 'value');
              assert.equal(scenarios[i+2].annotations.ForAll, true);
            }
            else {
              assert.equal(scenarios[i+0].annotations.tag, true);
              assert.equal(scenarios[i+0].annotations.pending, true);
              assert.equal(scenarios[i+1].annotations.tag, true);
              assert.equal(scenarios[i+1].annotations.Only, true);
              assert.equal(scenarios[i+1].annotations.keyword, 'value');
              assert.equal(scenarios[i+2].annotations.tag, true);
            }
        }
    });

    it('should expand scenarios with examples using separator \\u2506 \u2506', function() {
        var scenarios = parse_file('example_scenarios_2506').scenarios;
        assert.equal(scenarios.length, 2);
        assert.equal(scenarios[0].title, 'First Scenario');
        assert.equal(scenarios[0].steps[0], 'Step A11');
        assert.equal(scenarios[0].steps[1], 'Step 1AA');
        assert.equal(scenarios[1].title, 'Second Scenario');
        assert.equal(scenarios[1].steps[0], 'Step B22');
        assert.equal(scenarios[1].steps[1], 'Step 2BB');
    });

    it('should expand scenarios with multiline examples', function() {
        var scenarios = parse_file('multiline_example_scenarios').scenarios;
        assert.equal(scenarios.length, 2);

        assert.equal(scenarios[0].title, 'arrow function');
        assert.equal(scenarios[0].steps.length, 3);
        assert.equal(scenarios[0].steps[0], 'Given I need to transpile');
        assert.equal(scenarios[0].steps[1], 'When EcmaScript6=var r=arr.map((x)=>x*x);');
        assert.equal(scenarios[0].steps[2], ['Then EcmaScript5="use strict";',
                                             '',
                                             'var r=arr.map(',
                                             '  function(x){',
                                             '    return x*x;',
                                             '});'
                                            ].join('\n'));

        assert.equal(scenarios[1].title, 'template strings');
        assert.equal(scenarios[1].steps.length, 3);
        assert.equal(scenarios[1].steps[0], 'Given I need to transpile');
        assert.equal(scenarios[1].steps[1], ['When EcmaScript6=var s=`x=${x}',
                                             'y=${y}`;'
                                            ].join('\n'));
        assert.equal(scenarios[1].steps[2], [
            "Then EcmaScript5=var s=\'x='.concat(x).concat('\\n')",
            ".concat('y=').concat(y);"].join('\n'));

    });

    it('should expand scenarios with multiline examples with typed columns', function() {
        var scenarios = parse_file('multiline_example_with_typed_columns').scenarios;
        assert.equal(scenarios.length, 2);

        assert.equal(scenarios[0].title, 'arrow function');
        assert.equal(scenarios[0].steps.length, 3);
        assert.equal(scenarios[0].steps[0], 'Given I need to transpile');
        assert.equal(scenarios[0].steps[1], 'When EcmaScript6 at 10:22-10:46 = var r=arr.map((x)=>x*x);');
        assert.equal(scenarios[0].steps[2], ['Then EcmaScript5 at 10:49-15:64 = "use strict";',
                                             '',
                                             'var r=arr.map(',
                                             '  function(x){',
                                             '    return x*x;',
                                             '});'
                                            ].join('\n'));

        assert.equal(scenarios[1].title, 'template strings');
        assert.equal(scenarios[1].steps.length, 3);
        assert.equal(scenarios[1].steps[0], 'Given I need to transpile');
        assert.equal(scenarios[1].steps[1], ['When EcmaScript6 at 17:22-18:35 = var s=`x=${x}',
                                             'y=${y}`;'
                                            ].join('\n'));
        assert.equal(scenarios[1].steps[2], [
            "Then EcmaScript5 at 17:49-18:82 = var s=\'x='.concat(x).concat('\\n')",
            ".concat('y=').concat(y);"].join('\n'));

    });

    it('should report scenarios with multiline examples with duplicated id', function() {
        assert.throws(function() {
        var scenarios = parse_file('multiline_example_with_duplicated_id').scenarios;
        }, /Duplicated identifier "arrow function" at lines 11 and 23/);
    });

    it('should report scenarios with multiline examples with identation error', function() {
        assert.throws(function() {
        var scenarios = parse_file('multiline_example_with_identation_error').scenarios;
        }, /Identation error/);
    });

    it('should clone scenario annotations to examples', function() {
        var scenarios = parse_file('pending_example_scenarios').scenarios;
        assert.equal(scenarios.length, 2);
        assert.equal(scenarios[0].annotations.pending, true);
        assert.equal(scenarios[1].annotations.pending, true);
        delete scenarios[0].annotations.pending;
        assert.equal(scenarios[1].annotations.pending, true);
    });

    it('should report malformed example tables', function() {
        assert.throws(function() {
            parse_file('malformed_example').scenarios;
        }, /Incorrect number of fields in example table/);
    });

    it('should report incomplete examples', function() {

        assert.throws(function() {
            parse_file('incomplete_examples_1');
        }, /Examples table requires one or more headings/);

        assert.throws(function() {
            parse_file('incomplete_examples_2');
        }, /Examples table requires one or more rows/);

        assert.throws(function() {
            parse_file('incomplete_examples_3');
        }, /Examples table requires one or more rows/);

        assert.throws(function() {
            parse_file('incomplete_examples_4');
        }, /Examples table requires one or more rows/);
    });

    it('should support multiple languages', function() {
        var feature = parse_file('pirate_feature', Pirate);
        assert.equal(feature.title, 'Treasure Island');

        var scenarios = feature.scenarios;
        assert.equal(scenarios.length, 2);
        assert.equal(scenarios[0].title, 'The Black Spot');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);

        assert(scenarios[1].annotations.brig, 'Localised scenario was not marked as pending');
    });

    it('should support changing the default language', function() {
        Localisation.default = Pirate;
        var feature = new FeatureParser().parse(load('pirate_feature'));

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
            parse_file('multiple_features', language);
        }, /Keyword "feature" has not been translated into Incomplete/);
    });

    it('should report steps with no scenario', function() {
        assert.throws(function() {
            parse_file('missing_scenario');
        }, /A feature must contain one or more scenarios/);
    });

    it('should parse feature annotations', function() {
        var feature = parse_file('annotated_feature');
        assert.equal(feature.annotations.keyword1, 'value1');
        assert.equal(feature.annotations.keyword2, 'value2');
        assert(feature.annotations.keyword3);
        assert.deepEqual(feature.scenarios[0].annotations, {});
    });

    it('should report background annotations', function() {
        assert.throws(function() {
            parse_file('annotated_background');
        }, /Background is unexpected at this time/);
    });

    it('should parse scenario annotations', function() {
        var feature = parse_file('annotated_scenario');
        assert.deepEqual(feature.annotations, {});
        assert.equal(feature.scenarios[0].annotations.keyword1, 'value1');
        assert.equal(feature.scenarios[0].annotations.keyword2, 'value2');
        assert(feature.scenarios[0].annotations.keyword3);
    });

    it('should parse simple scenario annotations', function() {
        var feature = parse_file('annotated_simple_scenario');
        assert.deepEqual(feature.annotations, {});
        assert.equal(feature.scenarios[0].annotations.keyword1, 'value1');
        assert.equal(feature.scenarios[0].annotations.keyword2, 'value2');
        assert(feature.scenarios[0].annotations.keyword3);
    });

    it('should support annotations with non alphanumerics', function() {
        var feature = parse_file('non_alphanumeric_annotated_feature');
        assert.equal(feature.annotations['Key Word+1'], 'value1');
        assert.equal(feature.annotations.key_word_1, 'value1');
        assert.equal(feature.scenarios[0].annotations['Key Word-1'], 'value1');
        assert.equal(feature.scenarios[0].annotations.key_word_1, 'value1');
    });

    it('should support single line comments', function() {
        var feature = parse_file('single_line_comments');
        var scenarios = feature.scenarios;
        assert.equal(feature.title, 'Single Line Comments Feature');
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Single Line Comments Scenario');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When # B', 'Then C #']);
    });

    it('should parse multiline comments', function() {
        var feature = parse_file('multiline_comment');
        var scenarios = feature.scenarios;
        assert.equal(feature.title, 'Simple Feature');
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Simple Scenario');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse feature background', function() {
        var feature = parse_file('feature_with_background');
        assert.equal(feature.scenarios[0].steps[0], 'Given A');
    });

    it('should expand feature background with examples', function() {
        var feature = parse_file('feature_with_background_and_examples');
        assert.equal(feature.scenarios.length, 4);
        assert.equal(feature.scenarios[0].steps[0], 'BG A1');
        assert.equal(feature.scenarios[1].steps[0], 'BG B2');
        assert.equal(feature.scenarios[2].steps[0], 'BG X3');
        assert.equal(feature.scenarios[3].steps[0], 'BG Y4');
    });

    it('should report incomplete features', function() {
        assert.throws(function() {
            parse_file('incomplete_feature');
        }, /Feature requires one or more scenarios/);
    });

    it('should parse scenario annotations after background', function() {
        var feature = parse_file('annotated_scenario_after_background');
        assert.equal(feature.scenarios[0].steps[0], 'Given A');
    });

    it('should parse compact features', function() {
        var feature = parse_file('background_description');
        assert.equal(feature.scenarios[0].steps[0], 'Given A');
        assert.equal(feature.scenarios[0].steps[1], 'When B');
        assert.equal(feature.scenarios[0].steps[2], 'Then C');
    });

    function parse_file(filename, language) {
        return new FeatureParser(language).parse(load(filename));
    }

    function load(filename) {
        return fs.readFileSync(path.join(__dirname, 'features', filename + '.feature'), 'utf8');
    }
});
