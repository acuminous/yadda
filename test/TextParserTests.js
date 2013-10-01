var assert = require("assert");
var TextParser = require('../lib/index').parsers.TextParser;

describe('TextPaser', function() {

    var simple_scenario = ['Scenario: Simple', '   Given A', '   When B', '   Then C'].join('\n');
    var simple_feature = ['Feature: Tests with feature', 'Scenario: With Feature'].join('\n');
    var multiple_feature = ['Feature: Tests with 2 features', 'Scenario: For Feature 1', 'Feature: Second feature'].join('\n');
    var complex_scenario = ['Scenario: Complex', '', '  ', '   Given A', '', 'When B', ' ', '   Then C'].join('\n');
    var annotated_scenario = ['@keyword=value', 'Scenario: Annotated', 'Given A', 'When B', 'Then C'].join('\n');
    var parser;

    beforeEach(function(){
        parser = new TextParser();
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

    it('should ignore annotations', function() {
        var scenarios = parser.parse(annotated_scenario).scenarios;
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Annotated');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });
});
