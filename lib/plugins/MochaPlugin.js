var fs = require('fs');
var Yadda = require('../Yadda');
var TextParser = require('../parsers/TextParser');

module.exports = function(options) {

    var options = options || {};
    var parser = options.parser || new TextParser();
    var mode = options.mode || 'async';

    function feature(filename, next) {
        var text = fs.readFileSync(filename, 'utf8');
        parser.parse(text, function(feature) {
            describe(feature.title || filename, function() {         
                next(feature);
            });
        });
    };

    function async_scenarios(scenarios, next) {        
        scenarios.forEach(function(scenario) {
            it(scenario.title, function(done) {
                next(scenario, done);
            });
        });
    };

    function sync_scenarios(scenarios, next) {
        scenarios.forEach(function(scenario) {
            it(scenario.title, function() {
                next(scenario);
            });
        });
    };

    GLOBAL.feature = feature;
    GLOBAL.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
};