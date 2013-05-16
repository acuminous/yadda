module('text-parser');

var simple_scenario = ['Scenario: Simple', '   Given A', '   When B', '   Then C'].join('\n');
var complex_scenario = ['Scenario: Complex', '', '  ', '   Given A', '', 'When B', ' ', '   Then C'].join('\n');

test('Parses a simple scenario', function() {
    var parser = new Yadda.Parsers.TextParser();
    var scenarios = parser.parse(simple_scenario);
    equal(scenarios.length, 1);
    equal(scenarios[0].title, 'Simple');
    same(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
});

test('Parses a complex scenario', function() {
    var parser = new Yadda.Parsers.TextParser();
    var scenarios = parser.parse(complex_scenario);
    equal(scenarios.length, 1);
    equal(scenarios[0].title, 'Complex');
    same(scenarios[0].steps, ['Given A', 'When B', 'Then C']);
});

test('Parses multiple scenarios', function() {
    var parser = new Yadda.Parsers.TextParser();
    var scenarios = parser.parse(simple_scenario + '\n' + complex_scenario);
    equal(scenarios.length, 2);
    equal(scenarios[0].title, 'Simple');    
    equal(scenarios[1].title, 'Complex');
});
