var assert = require("assert");
var TextParser = require('../lib/index').parsers.TextParser;

describe('TextPaser', function() {

    var simple_scenario = ['Scenario: Simple', '   Given A', '   When B', '   Then C'].join('\n');
    var complex_scenario = ['Scenario: Complex', '', '  ', '   Given A', '', 'When B', ' ', '   Then C'].join('\n');
    var parser;

    beforeEach(function(){
        parser = new TextParser();
    });

    it('should parse a simple scenario', function() {        
        var scenarios = parser.parse(simple_scenario);
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Simple');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parse a complex scenario', function() {
        var parser = new TextParser();
        var scenarios = parser.parse(complex_scenario);
        assert.equal(scenarios.length, 1);
        assert.equal(scenarios[0].title, 'Complex');
        assert.deepEqual(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
    });

    it('should parses multiple scenarios', function() {
        var parser = new TextParser();
        var scenarios = parser.parse(simple_scenario + '\n' + complex_scenario);
        assert.equal(scenarios.length, 2);
        assert.equal(scenarios[0].title, 'Simple');    
        assert.equal(scenarios[1].title, 'Complex');
    });

});
