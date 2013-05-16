Yadda.Parsers = Yadda.Parsers || {}
Yadda.Parsers.TextParser = function() {

    var SCENARIO_REGEX = /^Scenario:\s*(.*)$/i;
    var STEP_REGEX = /^\s*([^\s].*)$/;
    var NON_BLANK_REGEX = /[^\s]/;

    var current_scenario;
    var scenarios = [];

    this.parse = function(text) {
        current_scenario = {};
        split(text).each(function(line) {
            parse_line(line);
        });
        return scenarios;
    };

    var split = function(text) {
        return Yadda.$(text.split(/\n/)).find_all(non_blanks);
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };

    var parse_line = function(line) {
        var match;
        if (match = SCENARIO_REGEX.exec(line)) {
            current_scenario = { title: match[1], steps: [] };            
            scenarios.push(current_scenario);
        } else if (match = STEP_REGEX.exec(line)) {
            current_scenario.steps.push(match[1]);
        }
    }
};