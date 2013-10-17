var assert = require("assert");
var FeatureParser = require('../lib/index').parsers.FeatureParser;

describe('FeatureParser', function() {

    var simple_scenario = ['Scenario: Simple', '   Given A', '   When B', '   Then C'].join('\n');
    var simple_feature = ['Feature: Tests with feature', 'Scenario: With Feature'].join('\n');
    var multiple_feature = ['Feature: Tests with 2 features', 'Scenario: For Feature 1', 'Feature: Second feature'].join('\n');
    var complex_scenario = ['Scenario: Complex', '', '  ', '   Given A', '', 'When B', ' ', '   Then C'].join('\n');
    var annotated_feature = ['@keyword1=value1', '@keyword2=value2', '@keyword3', 'Feature: Annotated', 'Scenario: Simple', 'Given A', 'When B', 'Then C'].join('\n');
    var annotated_scenario = ['Feature: Simple', '@keyword1=value1', '@keyword2=value2', '@keyword3', 'Scenario: Annotated', 'Given A', 'When B', 'Then C'].join('\n');
    var missing_scenario = ['Given A', 'When B', 'Then C'].join('\n');

    var parser;

    beforeEach(function(){
        parser = new FeatureParser();
    });

    it('should parse a simple scenario', function() {
        var scenarios = parser.parse(simple_scenario).scenarios;
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Simple');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse a complex scenario', function() {
        var scenarios = parser.parse(complex_scenario).scenarios;
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Complex');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parses multiple scenarios', function() {
        var scenarios = parser.parse(simple_scenario + '\n' + complex_scenario).scenarios;
        assert.equal(scenarios.length, 2);
        assert.equal(scenarios[0].title, 'Simple');
        assert.equal(scenarios[1].title, 'Complex');
    });

    it('should reset scenarios between parses', function() {
        assert.equal(parser.parse(simple_scenario).scenarios.length, 1);
        assert.equal(parser.parse(simple_scenario).scenarios.length, 1);
    });

    it('should parse feature title', function() {
        var feature = parser.parse(simple_feature);
        assert.equal(feature.title, 'Tests with feature');
    });

    it('should only allow a single feature', function() {
        assert.throws(function() {
            parser.parse(multiple_feature);
        }, /single feature/);
    });

    it('should report steps with no scenario', function() {
        assert.throws(function() {
            parser.parse(missing_scenario);
        }, /Missing scenario/);
    });

    it('should parse feature annotations', function() {
        var feature = parser.parse(annotated_feature);
		assert.equal(feature.annotations['keyword1'], 'value1');
		assert.equal(feature.annotations['keyword2'], 'value2');
        assert(feature.annotations['keyword3']);
        assert.deepEqual(feature.scenarios[0].annotations, {});
    });

    it('should parse scenario annotations', function() {
        var feature = parser.parse(annotated_scenario);
        assert.deepEqual(feature.annotations, {});
        assert.equal(feature.scenarios[0].annotations['keyword1'], 'value1');
        assert.equal(feature.scenarios[0].annotations['keyword2'], 'value2');
        assert(feature.scenarios[0].annotations['keyword3']);
    });
});
